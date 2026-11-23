import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HISTORY_STORAGE_KEY,
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
  filterByRange,
  summarizePoiStats
} from '../app/src/main/assets/apps/mapping/js/ict-workspace/mapping-history-engine.js';

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

test('recordLivePoiProgress: dispatches notifications on CE touch, TP1, TP2, and SL with strict anti-spam deduplication', () => {
  const plan = {
    side: 'SELL',
    tf: 'M5',
    kind: 'FVG',
    area: { low: 3592.0, high: 3601.0, ce: 3596.5 },
    sl: 3601.5,
    tp1: 3588.5,
    tp2: 3582.5
  };

  let state = createEmptyHistoryState();

  // 1. Initial touch at CE -> dispatches CE_TOUCH alert with gold chime
  let r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3596.5, nowMs: NOW_MS });
  assert.equal(r.changed, true);
  assert.equal(r.alerts.length, 1);
  assert.equal(r.alerts[0].type, 'CE_TOUCH');
  assert.match(r.alerts[0].title, /🔴 Asisten Amy: SELL FVG M5 \(Sentuh CE\)/);
  assert.match(r.alerts[0].body, /Entry CE: \$3596.50/);
  assert.equal(r.alerts[0].sound, 'gold');
  state = r.state;

  // 2. Next tick still near CE -> NO duplicate alert (anti-spam)
  r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3596.7, nowMs: NOW_MS + 2000 });
  assert.equal(r.alerts.length, 0, 'must not re-trigger CE alert on noisy ticks');

  // 3. Price runs to TP1 -> dispatches TP1_HIT alert
  r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3588.0, nowMs: NOW_MS + 10000 });
  assert.equal(r.alerts.length, 1);
  assert.equal(r.alerts[0].type, 'TP1_HIT');
  assert.match(r.alerts[0].title, /TP1 TERCAPAI/);
  assert.match(r.alerts[0].body, /BEP/);
  state = r.state;

  // 4. Price ticks again around TP1 -> NO duplicate TP1 alert
  r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3587.5, nowMs: NOW_MS + 12000 });
  assert.equal(r.alerts.length, 0, 'must not re-trigger TP1 alert');

  // 5. Price reaches TP2 DOL -> dispatches TP2_HIT alert
  r = recordLivePoiProgress({ state, plans: [plan], livePrice: 3582.0, nowMs: NOW_MS + 25000 });
  assert.equal(r.alerts.length, 1);
  assert.equal(r.alerts[0].type, 'TP2_HIT');
  assert.match(r.alerts[0].title, /TP2 DOL SELESAI/);
  assert.match(r.alerts[0].body, /100 Pips/);
});
