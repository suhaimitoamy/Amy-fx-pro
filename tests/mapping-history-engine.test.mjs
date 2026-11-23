import test from 'node:test';
import assert from 'node:assert/strict';

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const engineRelPath = existsSync(resolve(import.meta.dirname, '../app/src/main/assets/apps/mapping/js/ict-workspace/mapping-history-engine.js'))
  ? '../app/src/main/assets/apps/mapping/js/ict-workspace/mapping-history-engine.js'
  : '../apps/mapping/js/ict-workspace/mapping-history-engine.js';

const {
  HISTORY_STORAGE_KEY,
  SEVEN_DAYS_MS,
  MAX_RETENTION_MS,
  witaDateKey,
  formatWitaClock,
  createEmptyHistoryState,
  loadHistoryState,
  saveHistoryState,
  evaluateZoneLifecycleOnCandles,
  backfillFromCandles,
  recordLivePoiProgress,
  mergeHistoryState,
  mergeRemoteHistoryState,
  buildPoiCalendarMonth,
  getDayPoiRecords,
  filterByRange,
  summarizePoiStats
} = await import(engineRelPath);

const BASE_SEC = Math.floor(Date.UTC(2026, 3, 15, 4, 0, 0) / 1000); // 12:00 WITA
const NOW_MS = (BASE_SEC + 10 * 900) * 1000;

function makeBar(idx, open, high, low, close, stepSec = 900) {
  const openTime = BASE_SEC + idx * stepSec;
  return {
    openTime,
    closeTime: openTime + stepSec,
    open_time: openTime,
    close_time: openTime + stepSec,
    open,
    high,
    low,
    close
  };
}

test('evaluateZoneLifecycleOnCandles: BUY zone touched -> bounces -> TP1 -> TP2', () => {
  const candles = [
    makeBar(0, 3000, 3004, 2999, 3003), // formation candle (must be ignored)
    makeBar(1, 3005, 3007, 3004, 3006), // away from zone
    makeBar(2, 3004, 3005, 3000.5, 3003), // touches BUY zone [3000, 3002]
    makeBar(3, 3003, 3007, 3002, 3006.5), // hits TP1 (3006)
    makeBar(4, 3006.5, 3012, 3006, 3011)  // hits TP2 (3010)
  ];

  const res = evaluateZoneLifecycleOnCandles(
    { side: 'BUY', tf: 'M15', kind: 'FVG', low: 3000, high: 3002, ce: 3001, sl: 2999.6, tp1: 3006, tp2: 3010, formedIndex: 0 },
    candles,
    30 * 3600 * 1000,
    NOW_MS
  );

  assert.ok(res);
  assert.equal(res.status, 'TP2_HIT');
  assert.equal(res.touchedAt, candles[2].openTime * 1000);
  assert.equal(res.resolvedAt, candles[4].closeTime * 1000);
  assert.ok(res.maxFavorable >= 11);
});

test('evaluateZoneLifecycleOnCandles: conservative SL-first on ambiguous candle', () => {
  const candles = [
    makeBar(0, 3020, 3022, 3018, 3019), // formation candle
    makeBar(1, 3015, 3016, 3014, 3015), // below SELL zone
    // Same candle touches SELL zone [3018, 3020], breaks SL (3020.4), and also sweeps down to TP1 (3012)
    makeBar(2, 3018.5, 3021.2, 3011.0, 3013.0)
  ];

  const res = evaluateZoneLifecycleOnCandles(
    { side: 'SELL', tf: 'M5', kind: 'OB', low: 3018, high: 3020, ce: 3019, sl: 3020.4, tp1: 3012, tp2: 3008, formedIndex: 0 },
    candles,
    30 * 3600 * 1000,
    NOW_MS
  );

  assert.ok(res);
  assert.equal(res.status, 'SL_HIT');
});

test('evaluateZoneLifecycleOnCandles: ignores touches on or before formedIndex', () => {
  const candles = [
    makeBar(0, 3001, 3002, 3000, 3001.5), // formation bar overlaps zone
    makeBar(1, 3006, 3008, 3005, 3007),   // never returns to [3000, 3002]
    makeBar(2, 3007, 3009, 3006, 3008)
  ];

  const res = evaluateZoneLifecycleOnCandles(
    { side: 'BUY', tf: 'M15', kind: 'OB', low: 3000, high: 3002, formedIndex: 0 },
    candles,
    30 * 3600 * 1000,
    NOW_MS
  );

  assert.equal(res, null);
});

test('backfillFromCandles: extracts BREAK, SWEEP, KEY_LEVEL, and POI_TOUCH/OUTCOME from M15/M5 candles', () => {
  const m15Candles = [
    makeBar(0, 3000, 3004, 2999, 3003),
    makeBar(1, 3003, 3010, 3002, 3009),
    makeBar(2, 3009, 3010, 3001, 3004), // touches BUY FVG [3000, 3002] & hits Asia Low / PDL
    makeBar(3, 3004, 3012, 3003, 3011), // hits TP1 + PDH (3011.5)
    makeBar(4, 3011, 3016, 3010, 3015)  // hits TP2
  ];

  const ctx = {
    amy: {
      events: [
        { time: m15Candles[1].openTime, side: 'BUY', kind: 'BOS', level: 3005.5 }
      ],
      levels: {
        pdh: 3011.5,
        pdl: 2998.0,
        asiaHigh: 3010.0,
        asiaLow: 3001.5,
        midnightOpen: 3004.0
      }
    }
  };

  const ngM15 = {
    poi: {
      fvg: [
        { side: 'BUY', bot: 3000, top: 3002, startTime: m15Candles[0].openTime, formedIndex: 0 }
      ],
      ob: []
    },
    liquidity: {
      sweeps: [
        { time: m15Candles[2].openTime, level: 3001.5, pool: 'SSL', reactionSide: 'BUY', broken: false }
      ]
    }
  };

  const result = backfillFromCandles({
    m15Candles,
    m5Candles: [],
    ctx,
    ngM15,
    ngM5: null,
    nowMs: NOW_MS,
    lookbackHours: 30
  });

  assert.ok(result.poiRecords.length >= 1, 'should reconstruct at least 1 touched POI');
  assert.equal(result.poiRecords[0].status, 'TP2_HIT');

  const categories = new Set(result.timelineEvents.map(e => e.category));
  assert.ok(categories.has('BREAK'), 'should record BOS/MSS event');
  assert.ok(categories.has('SWEEP'), 'should record liquidity sweep');
  assert.ok(categories.has('KEY_LEVEL'), 'should record PDH / Asia / MO key level hit');
  assert.ok(categories.has('POI_TOUCH'), 'should record POI touch event');
  assert.ok(categories.has('POI_OUTCOME'), 'should record POI outcome event');
});

test('recordLivePoiProgress: tracks TESTING -> REACTING -> TP1_HIT -> TP2_HIT and ignores sub-$0.50 noise', () => {
  const plan = {
    side: 'BUY',
    tf: 'M5',
    kind: 'OB',
    area: { low: 3000, high: 3002, ce: 3001 },
    sl: 2999.2,
    tp1: 3006.0,
    tp2: 3010.0
  };

  let state = createEmptyHistoryState();

  // 1. Touch inside zone
  let r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3001.0, nowMs: NOW_MS });
  assert.equal(r.changed, true);
  assert.equal(r.state.poiRecords.length, 1);
  assert.equal(r.state.poiRecords[0].status, 'TESTING');
  state = r.state;

  // 2. Small noisy tick (+$0.20) -> no unnecessary state write
  r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3001.2, nowMs: NOW_MS + 5000 });
  assert.equal(r.changed, false);

  // 3. Strong bounce (+$3.0 from CE) -> REACTING
  r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3004.0, nowMs: NOW_MS + 15000 });
  assert.equal(r.changed, true);
  assert.equal(r.state.poiRecords[0].status, 'REACTING');
  state = r.state;

  // 4. Hits TP1
  r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3006.2, nowMs: NOW_MS + 30000 });
  assert.equal(r.changed, true);
  assert.equal(r.state.poiRecords[0].status, 'TP1_HIT');
  state = r.state;

  // 5. Hits TP2
  r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3010.5, nowMs: NOW_MS + 45000 });
  assert.equal(r.changed, true);
  assert.equal(r.state.poiRecords[0].status, 'TP2_HIT');
  assert.ok(r.state.timelineEvents.some(e => e.category === 'POI_OUTCOME' && e.title.includes('TP2')));
});

test('recordLivePoiProgress: records SL_HIT when live price breaches SL', () => {
  const plan = {
    side: 'SELL',
    tf: 'M15',
    kind: 'FVG',
    area: { low: 3020, high: 3022, ce: 3021 },
    sl: 3022.5,
    tp1: 3015.0,
    tp2: 3010.0
  };

  let state = createEmptyHistoryState();
  state = recordLivePoiProgress({ state, plans: [plan], livePrice: 3021.0, nowMs: NOW_MS }).state;
  const slRes = recordLivePoiProgress({ state, plans: [plan], livePrice: 3023.0, nowMs: NOW_MS + 10000 });

  assert.equal(slRes.changed, true);
  assert.equal(slRes.state.poiRecords[0].status, 'SL_HIT');
  assert.ok(slRes.state.timelineEvents.some(e => e.category === 'POI_OUTCOME' && e.title.includes('Jebol SL')));
});

test('mergeHistoryState: preserves LIVE over BACKFILL, never downgrades status, and prunes >7 days', () => {
  const id = 'POI:M15:FVG:BUY:3000.0-3002.0';
  const staleTs = NOW_MS - MAX_RETENTION_MS - 3600 * 1000;

  const persisted = {
    version: 1,
    poiRecords: [
      { id, side: 'BUY', tf: 'M15', kind: 'FVG', low: 3000, high: 3002, ce: 3001, touchedAt: NOW_MS - 60000, status: 'TP1_HIT', maxFavorable: 6.5, source: 'LIVE' },
      { id: 'POI:OLD', side: 'SELL', tf: 'M15', kind: 'OB', low: 2900, high: 2905, ce: 2902.5, touchedAt: staleTs, status: 'SL_HIT', maxFavorable: 0, source: 'LIVE' }
    ],
    timelineEvents: [
      { id: 'EV:OLD', ts: staleTs, category: 'BREAK', side: 'BUY', title: 'Old BOS', detail: 'expired', price: 2900, source: 'BACKFILL' }
    ]
  };

  const backfilled = {
    version: 1,
    poiRecords: [
      { id, side: 'BUY', tf: 'M15', kind: 'FVG', low: 3000, high: 3002, ce: 3001, touchedAt: NOW_MS - 60000, status: 'TESTING', maxFavorable: 2.0, source: 'BACKFILL' }
    ],
    timelineEvents: [
      { id: 'EV:NEW', ts: NOW_MS - 30000, category: 'SWEEP', side: 'BUY', title: 'Sweep SSL', detail: 'fresh', price: 3000, source: 'BACKFILL' }
    ]
  };

  const merged = mergeHistoryState(persisted, backfilled, NOW_MS);
  assert.equal(merged.poiRecords.length, 1, 'should prune >7d old POI record');
  assert.equal(merged.poiRecords[0].status, 'TP1_HIT', 'must not downgrade TP1_HIT to TESTING');
  assert.equal(merged.poiRecords[0].source, 'LIVE', 'must keep LIVE source');
  assert.equal(merged.poiRecords[0].maxFavorable, 6.5);
  assert.equal(merged.timelineEvents.length, 1, 'should prune >7d old timeline event');
  assert.equal(merged.timelineEvents[0].id, 'EV:NEW');
});

test('filterByRange & summarizePoiStats: accurately separates TODAY (WITA) vs 7D and calculates respectRate', () => {
  const yesterdayMs = NOW_MS - 26 * 3600 * 1000;
  const records = [
    { id: '1', touchedAt: NOW_MS - 1000, status: 'TP2_HIT' },
    { id: '2', touchedAt: NOW_MS - 2000, status: 'TP1_HIT' },
    { id: '3', touchedAt: NOW_MS - 3000, status: 'SL_HIT' },
    { id: '4', touchedAt: NOW_MS - 4000, status: 'REACTING' },
    { id: '5', touchedAt: yesterdayMs, status: 'SL_HIT' }
  ];

  const todayStats = summarizePoiStats(records, 'TODAY', NOW_MS);
  assert.equal(todayStats.total, 4);
  assert.equal(todayStats.tp2Count, 1);
  assert.equal(todayStats.tp1Count, 1);
  assert.equal(todayStats.slCount, 1);
  assert.equal(todayStats.reactingCount, 1);
  // Resolved today = TP2(1) + TP1(1) + SL(1) = 3 => 2/3 = 67%
  assert.equal(todayStats.respectRate, 67);

  const weekStats = summarizePoiStats(records, '7D', NOW_MS);
  assert.equal(weekStats.total, 5);
  // Resolved 7D = 2 win / 4 resolved = 50%
  assert.equal(weekStats.respectRate, 50);

  const todayOnly = filterByRange(records, 'touchedAt', 'TODAY', NOW_MS);
  assert.equal(todayOnly.length, 4);
  assert.ok(witaDateKey(NOW_MS).length === 10);
  assert.ok(formatWitaClock(NOW_MS, false).includes('WITA'));
});

test('loadHistoryState & saveHistoryState: round-trips cleanly and handles corrupt JSON', () => {
  const store = new Map();
  const mockStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v))
  };

  const sample = {
    version: 1,
    poiRecords: [{ id: 'P1', touchedAt: NOW_MS, status: 'TESTING' }],
    timelineEvents: [{ id: 'E1', ts: NOW_MS, category: 'BREAK' }]
  };
  saveHistoryState(mockStorage, sample);
  const loaded = loadHistoryState(mockStorage);
  assert.equal(loaded.poiRecords.length, 1);
  assert.equal(loaded.timelineEvents.length, 1);

  store.set(HISTORY_STORAGE_KEY, '{corrupt-json');
  const recovered = loadHistoryState(mockStorage);
  assert.deepEqual(recovered, createEmptyHistoryState());
});

test('180-day retention keeps >7d details, filters 7D strictly to 7 days, and permanently rolls up >180d into dailyArchive', () => {
  const dayMs = 24 * 3600 * 1000;
  const tsToday = NOW_MS - 3600 * 1000;
  const ts45DaysAgo = NOW_MS - 45 * dayMs;
  const ts200DaysAgo = NOW_MS - 200 * dayMs;

  const persisted = {
    version: 2,
    poiRecords: [
      { id: 'P:TODAY', side: 'BUY', tf: 'M15', kind: 'FVG', low: 3100, high: 3102, ce: 3101, touchedAt: tsToday, status: 'TP2_HIT', maxFavorable: 10 },
      { id: 'P:45D', side: 'SELL', tf: 'M5', kind: 'OB', low: 3050, high: 3052, ce: 3051, touchedAt: ts45DaysAgo, status: 'TP1_HIT', maxFavorable: 6 },
      { id: 'P:200D', side: 'BUY', tf: 'M15', kind: 'FVG', low: 2950, high: 2952, ce: 2951, touchedAt: ts200DaysAgo, status: 'SL_HIT', maxFavorable: 1 }
    ],
    timelineEvents: [],
    dailyArchive: {}
  };

  assert.equal(MAX_RETENTION_MS, 180 * dayMs);
  assert.equal(SEVEN_DAYS_MS, 7 * dayMs);

  const merged = mergeHistoryState(persisted, createEmptyHistoryState(), NOW_MS);
  // 45d record must stay in poiRecords; 200d record pruned from poiRecords but preserved in permanent dailyArchive
  assert.equal(merged.poiRecords.length, 2);
  assert.ok(merged.poiRecords.some(r => r.id === 'P:45D'));
  assert.equal(merged.poiRecords.some(r => r.id === 'P:200D'), false);

  const oldDateKey = witaDateKey(ts200DaysAgo);
  assert.ok(merged.dailyArchive[oldDateKey], '200d old date must be archived permanently');
  assert.equal(merged.dailyArchive[oldDateKey].total, 1);
  assert.equal(merged.dailyArchive[oldDateKey].sl, 1);
  assert.equal(merged.dailyArchive[oldDateKey].respectRate, 0);

  // filterByRange('7D') must strictly include only <=7d records, NOT 45d record
  const sevenDayItems = filterByRange(merged.poiRecords, 'touchedAt', '7D', NOW_MS);
  assert.equal(sevenDayItems.length, 1);
  assert.equal(sevenDayItems[0].id, 'P:TODAY');
});

test('buildPoiCalendarMonth & getDayPoiRecords: builds 8-column month grid, weekly MGG rollups, M15/M5 split, day filters, and archived-only day', () => {
  // Date in April 2026: 2026-04-15 (Wednesday)
  const day15 = Date.UTC(2026, 3, 15, 5, 0, 0); // 13:00 WITA
  const day16 = Date.UTC(2026, 3, 16, 5, 0, 0);
  const archivedDate = '2026-04-02';

  const state = {
    version: 2,
    poiRecords: [
      { id: 'D15-1', side: 'BUY', tf: 'M15', kind: 'FVG', low: 3000, high: 3002, ce: 3001, touchedAt: day15, status: 'TP2_HIT' },
      { id: 'D15-2', side: 'SELL', tf: 'M15', kind: 'OB', low: 3010, high: 3012, ce: 3011, touchedAt: day15 + 60000, status: 'TP1_HIT' },
      { id: 'D15-3', side: 'BUY', tf: 'M5', kind: 'FVG', low: 3005, high: 3006, ce: 3005.5, touchedAt: day15 + 120000, status: 'SL_HIT' },
      { id: 'D16-1', side: 'SELL', tf: 'M5', kind: 'FVG', low: 3020, high: 3022, ce: 3021, touchedAt: day16, status: 'SL_HIT' }
    ],
    timelineEvents: [],
    dailyArchive: {
      [archivedDate]: {
        date: archivedDate,
        total: 5,
        tp2: 2,
        tp1: 2,
        sl: 1,
        reacting: 0,
        testing: 0,
        m15Total: 3,
        m15Wins: 3,
        m15Sl: 0,
        m5Total: 2,
        m5Wins: 1,
        m5Sl: 1,
        fvgTotal: 3,
        obTotal: 2
      }
    }
  };

  const cal = buildPoiCalendarMonth(state, 2026, 3, day16);
  assert.equal(cal.label, 'April 2026');
  assert.equal(cal.monthSummary.activeDays, 3);
  assert.equal(cal.monthSummary.total, 9); // 3 + 1 + 5
  assert.equal(cal.monthSummary.wins, 6);  // 2 + 0 + 4
  assert.equal(cal.monthSummary.sl, 3);    // 1 + 1 + 1
  assert.equal(cal.monthSummary.respectRate, 67);
  assert.equal(cal.monthSummary.m15RespectRate, 100); // 5/5 wins on M15
  assert.equal(cal.monthSummary.m5RespectRate, 25);   // 1 win / 4 resolved on M5

  // Each week has 7 days + weekSummary
  for (const w of cal.weeks) {
    assert.equal(w.days.length, 7);
    assert.ok(w.weekSummary);
  }

  // Drill-down filtering on 2026-04-15
  const all15 = getDayPoiRecords(state, '2026-04-15', 'ALL');
  assert.equal(all15.allCount, 3);
  assert.equal(all15.isArchivedOnly, false);
  assert.equal(getDayPoiRecords(state, '2026-04-15', 'M15').items.length, 2);
  assert.equal(getDayPoiRecords(state, '2026-04-15', 'M5').items.length, 1);
  assert.equal(getDayPoiRecords(state, '2026-04-15', 'TP').items.length, 2);
  assert.equal(getDayPoiRecords(state, '2026-04-15', 'SL').items.length, 1);

  // Archived-only day returns summary with isArchivedOnly = true
  const archDay = getDayPoiRecords(state, archivedDate, 'ALL');
  assert.equal(archDay.isArchivedOnly, true);
  assert.equal(archDay.summary.total, 5);
  assert.equal(archDay.summary.respectRate, 80);

  // Union merge across devices keeps both local and remote days
  const remoteState = {
    version: 2,
    poiRecords: [
      { id: 'REMOTE-1', side: 'BUY', tf: 'M15', kind: 'FVG', low: 3030, high: 3032, ce: 3031, touchedAt: day16 + 30000, status: 'TP2_HIT' }
    ],
    timelineEvents: [],
    dailyArchive: {
      '2025-11-10': { date: '2025-11-10', total: 4, tp2: 3, tp1: 0, sl: 1 }
    }
  };
  const combined = mergeRemoteHistoryState(state, remoteState, day16);
  assert.equal(combined.poiRecords.length, 5);
  assert.ok(combined.dailyArchive['2025-11-10']);
  assert.ok(combined.dailyArchive[archivedDate]);
});
