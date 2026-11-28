import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateNextGenIndicators } from '../app/src/main/assets/apps/mapping/js/ict-workspace/nextgen-indicators.js';
import {
  BACKFILL_ENGINE_VERSION,
  computeGoldSlBuffer,
  evaluateZoneLifecycleOnCandles,
  backfillFromCandles,
  mergeHistoryState,
  createEmptyHistoryState
} from '../app/src/main/assets/apps/mapping/js/ict-workspace/mapping-history-engine.js';
import { selectScalperDualLayerPoi } from '../app/src/main/assets/apps/mapping/js/ict-workspace/mapping-accuracy.js';
import { dashboardEngine } from '../lib/scalper-engine/amy-ict.mjs';

function makeBar(t, o, h, l, c) {
  return { time: t, open_time: t, close_time: t + 900, openTime: t, closeTime: t + 900, open: o, high: h, low: l, close: c };
}

test('1. evaluateZoneLifecycleOnCandles rejects wrong-side approaches for SELL and BUY zones', () => {
  const baseSec = Math.floor(Date.UTC(2026, 10, 24, 6, 0, 0) / 1000); // 14:00 WITA (London)
  const nowMs = (baseSec + 10 * 900) * 1000;

  // SELL zone [3590, 3592] formed at idx 1, price gaps/opens ABOVE it at 3595 and dips into 3591 from above
  const sellCandles = [
    makeBar(baseSec, 3593, 3594, 3591, 3591.5),
    makeBar(baseSec + 900, 3591.5, 3592, 3590, 3590.2),
    makeBar(baseSec + 1800, 3595.0, 3596.2, 3591.0, 3596.0) // opens above hi + 0.25 (wrong side!)
  ];
  const sellRes = evaluateZoneLifecycleOnCandles(
    { side: 'SELL', tf: 'M15', kind: 'FVG', low: 3590, high: 3592, ce: 3591, formedIndex: 1 },
    sellCandles,
    48 * 3600 * 1000,
    nowMs
  );
  assert.equal(sellRes, null, 'SELL zone approached from above must NOT produce a fake touch/SL');

  // BUY zone [3590, 3592] formed at idx 1, price opens BELOW it at 3585 and wicks up into 3591 from below
  const buyCandles = [
    makeBar(baseSec, 3589, 3590, 3588, 3589.5),
    makeBar(baseSec + 900, 3590, 3592, 3589.8, 3591.8),
    makeBar(baseSec + 1800, 3585.0, 3591.0, 3583.5, 3584.0) // opens below lo - 0.25 (wrong side!)
  ];
  const buyRes = evaluateZoneLifecycleOnCandles(
    { side: 'BUY', tf: 'M15', kind: 'OB', low: 3590, high: 3592, ce: 3591, formedIndex: 1 },
    buyCandles,
    48 * 3600 * 1000,
    nowMs
  );
  assert.equal(buyRes, null, 'BUY zone approached from below must NOT produce a fake touch/SL');
});

test('2. evaluateZoneLifecycleOnCandles eliminates phantom maxFavorable on touch bar & applies 60-100p Gold SL', () => {
  const baseSec = Math.floor(Date.UTC(2026, 10, 24, 6, 0, 0) / 1000);
  const nowMs = (baseSec + 10 * 900) * 1000;

  // SELL zone [3600, 3602], CE = 3601. M15 60-100p Gold SL = 3601 + 8.20 = 3609.20 (82 pips).
  // Candle 1 sits strictly below zone, then Candle 2 blasts straight through from 3594 to 3611!
  // Old engine falsely logged maxFavorable = 3601 - 3593.5 = +$7.5! New engine must log $0.0!
  const blowoutCandles = [
    makeBar(baseSec, 3602, 3602.5, 3599, 3599.5),
    makeBar(baseSec + 900, 3599.0, 3599.2, 3594.0, 3594.5),
    makeBar(baseSec + 1800, 3594.5, 3611.0, 3593.5, 3610.0)
  ];
  const blowout = evaluateZoneLifecycleOnCandles(
    { side: 'SELL', tf: 'M15', kind: 'FVG', low: 3600, high: 3602, ce: 3601, formedIndex: 0 },
    blowoutCandles,
    48 * 3600 * 1000,
    nowMs
  );
  assert.ok(blowout);
  assert.equal(blowout.status, 'SL_HIT');
  assert.equal(blowout.maxFavorable, 0, 'Pre-entry candle low must NEVER count as phantom maxFavorable');
  const slDistM15 = Number((blowout.sl - blowout.ce).toFixed(2));
  assert.ok(slDistM15 >= 6.0 && slDistM15 <= 10.0, `Expected 60-100p Gold M15 SL, got $${slDistM15}`);

  // Wick survival test: Gold M5 BUY zone [3600, 3602], CE = 3601.
  // 60-80p M5 Gold SL -> SL = 3601 - 7.10 = 3593.90 (71 pips). Candle wicks to 3596.5 (-$4.50 from CE, survives 60-100p SL!) then rallies to TP2 (3618.75).
  const wickSurviveCandles = [
    makeBar(baseSec, 3600, 3603, 3599.8, 3602.8),
    makeBar(baseSec + 300, 3602.8, 3605, 3602.5, 3604.5),
    makeBar(baseSec + 600, 3604.5, 3604.6, 3596.5, 3601.8), // $4.50 Gold wick sweep survives 71-pip SL
    makeBar(baseSec + 900, 3601.8, 3621.0, 3601.2, 3620.0)  // Rockets past TP1 & TP2!
  ];
  const survived = evaluateZoneLifecycleOnCandles(
    { side: 'BUY', tf: 'M5', kind: 'OB', low: 3600, high: 3602, ce: 3601, formedIndex: 0 },
    wickSurviveCandles,
    48 * 3600 * 1000,
    nowMs
  );
  assert.ok(survived);
  assert.equal(survived.status, 'TP2_HIT', 'Zone with $4.50 Gold wick sweep must survive 60-100p SL and hit TP2');
  const m5Dist = 1.0 + computeGoldSlBuffer('M5', 2.0);
  const m15Dist = 1.0 + computeGoldSlBuffer('M15', 2.0);
  assert.ok(m5Dist >= 6.0 && m5Dist <= 8.0, `M5 CE-to-SL should be 60-80p, got $${m5Dist}`);
  assert.ok(m15Dist >= 7.0 && m15Dist <= 10.0, `M15 CE-to-SL should be 70-100p, got $${m15Dist}`);
});

test('3. nextgen-indicators spawns iFVG on broken FVG and Breaker Block (BB) on broken OB + tracks trendByTime', () => {
  const baseSec = Math.floor(Date.UTC(2026, 10, 24, 0, 0, 0) / 1000);
  const bars = [];
  let t = baseSec;
  const push = (o, h, l, c) => { bars.push(makeBar(t, o, h, l, c)); t += 900; };

  // Build baseline bars to stabilize ATR (~$2)
  for (let i = 0; i < 12; i += 1) {
    const base = 3600 + (i % 2 === 0 ? 0.5 : -0.5);
    push(base, base + 1.2, base - 1.2, base + 0.3);
  }
  // Create a clear bullish candle (potential Bearish OB candidate before bearish drop) + Bearish FVG
  push(3601.0, 3603.0, 3600.5, 3602.6); // Bullish candle (OB candidate: 3600.5 - 3603.0)
  push(3602.5, 3602.8, 3596.0, 3596.2); // Strong bearish displacement
  push(3596.2, 3597.5, 3594.0, 3594.8); // Leaves Bearish FVG [3597.5, 3600.5]
  push(3594.8, 3596.0, 3593.5, 3595.2);
  // Now reverse strongly UP and close decisively ABOVE both the Bearish FVG (3600.5) and Bearish OB (3603.0)
  push(3595.2, 3602.0, 3595.0, 3601.8); // Closes above Bearish FVG -> spawns Bullish +iFVG!
  push(3601.8, 3606.0, 3601.5, 3605.5); // Closes above Bearish OB -> spawns Bullish +BB!
  // Retest the newly formed +iFVG / +BB from above and bounce
  push(3605.5, 3605.8, 3599.5, 3603.5);
  push(3603.5, 3609.0, 3603.0, 3608.5);

  const ng = calculateNextGenIndicators(bars, 'M15');
  assert.ok(Array.isArray(ng.poi.ifvg), 'poi.ifvg array must exist');
  assert.ok(Array.isArray(ng.poi.bb), 'poi.bb array must exist');
  assert.ok(Array.isArray(ng.poi.historyIfvg), 'poi.historyIfvg array must exist');
  assert.ok(Array.isArray(ng.poi.historyBb), 'poi.historyBb array must exist');
  assert.ok(ng.poi.historyIfvg.length >= 1, 'Broken Bearish FVG must spawn at least 1 Bullish +iFVG');
  assert.equal(ng.poi.historyIfvg[0].side, 'BUY', 'Inverted Bearish FVG must become BUY (+iFVG)');
  assert.ok(ng.structure.trendByTime.length === bars.length, 'trendByTime must cover every bar causally');
});

test('4. backfillFromCandles applies causal session/trend/overlap filters, includes iFVG/BB, and v3 merges cleanly', () => {
  // 05:00 WITA = 21:00 UTC (Rollover — must skip)
  const rolloverSec = Math.floor(Date.UTC(2026, 10, 23, 21, 0, 0) / 1000);
  // 15:00 WITA = 07:00 UTC (London Open — active)
  const londonSec = Math.floor(Date.UTC(2026, 10, 24, 7, 0, 0) / 1000);
  const nowMs = (londonSec + 10 * 900) * 1000;

  const m15 = [
    makeBar(rolloverSec, 3598, 3601, 3597.5, 3600.5),
    makeBar(rolloverSec + 900, 3600.5, 3601, 3598.2, 3600.2), // touches rollover zone
    makeBar(londonSec, 3602, 3605, 3601.5, 3604.5),
    makeBar(londonSec + 900, 3602.0, 3604.8, 3601.2, 3603.5), // touches BUY BB [3600.5, 3602.5] & closes bullish rejection (v8 London gate)
    makeBar(londonSec + 1800, 3603.5, 3624.0, 3603.2, 3623.0) // hits TP2 (2.5R)!
  ];

  const ngM15 = {
    structure: {
      events: [],
      trendByTime: m15.map(b => ({ time: b.time, trend: 'BULL' }))
    },
    dol: { recentSweeps: [] },
    keyLevels: {},
    poi: {
      historyFvg: [
        // Rollover FVG (must be skipped by Rollover 04-07 WITA filter)
        { side: 'BUY', bot: 3598, top: 3600, ce: 3599, startTime: rolloverSec, formedIndex: 0 },
        // Counter-trend SELL FVG during BULL trend (must be skipped by causal M15 trend filter)
        { side: 'SELL', bot: 3603.5, top: 3605.0, ce: 3604.25, startTime: londonSec, formedIndex: 2 }
      ],
      historyOb: [],
      historyIfvg: [],
      historyBb: [
        // Aligned BUY Breaker Block during London Open (must be kept and win!)
        { side: 'BUY', bot: 3600.5, top: 3602.5, ce: 3601.5, startTime: londonSec, formedIndex: 2 }
      ]
    }
  };

  const bf = backfillFromCandles({
    m15Candles: m15,
    m5Candles: [],
    ctx: {},
    ngM15,
    ngM5: null,
    nowMs,
    lookbackHours: 48
  });

  assert.equal(bf.engineVersion, BACKFILL_ENGINE_VERSION);
  assert.equal(bf.poiRecords.length, 1, 'Only London aligned BUY BB should pass causal filters');
  assert.equal(bf.poiRecords[0].kind, 'BB');
  assert.equal(bf.poiRecords[0].status, 'TP2_HIT');

  // Test v3 merge replaces legacy v1 BACKFILL inside 48h while preserving LIVE records
  const legacyState = createEmptyHistoryState();
  legacyState.poiRecords = [
    {
      id: 'LEGACY_BAD_SL',
      side: 'SELL',
      tf: 'M15',
      kind: 'FVG',
      low: 3590,
      high: 3592,
      ce: 3591,
      sl: 3592.4,
      tp1: 3585,
      tp2: 3580,
      touchedAt: londonSec * 1000,
      touchPrice: 3591,
      status: 'SL_HIT',
      maxFavorable: 5.0,
      source: 'BACKFILL'
    },
    {
      id: 'LIVE_KEEPER',
      side: 'BUY',
      tf: 'M5',
      kind: 'OB',
      low: 3605,
      high: 3607,
      ce: 3606,
      sl: 3603.5,
      tp1: 3611,
      tp2: 3616,
      touchedAt: londonSec * 1000,
      touchPrice: 3606.5,
      status: 'TP1_HIT',
      maxFavorable: 5.5,
      source: 'LIVE'
    }
  ];
  const merged = mergeHistoryState(legacyState, bf, nowMs);
  assert.equal(merged.engineVersion, BACKFILL_ENGINE_VERSION);
  assert.ok(merged.poiRecords.some(r => r.id === 'LIVE_KEEPER'), 'LIVE record must be preserved on v3 upgrade');
  assert.ok(!merged.poiRecords.some(r => r.id === 'LEGACY_BAD_SL'), 'Legacy v1 BACKFILL record inside 48h must be replaced');
  assert.ok(merged.poiRecords.some(r => r.kind === 'BB'), 'New v3 BB record must be stored');
});

test('5. selectScalperDualLayerPoi prioritizes institutional BB/iFVG and rejects bloated $16+ zones', () => {
  const res = selectScalperDualLayerPoi({
    side: 'BUY',
    m15Obs: [{ lo: 3582, hi: 3599, ce: 3590.5, label: 'Monster $17 OB', fresh: true }],
    m15Fvgs: [],
    m15Ifvgs: [{ lo: 3594, hi: 3597, ce: 3595.5, label: '+iFVG Demand M15', fresh: true }],
    m15Bbs: [{ lo: 3595, hi: 3598, ce: 3596.5, label: '+BB Breaker M15', fresh: true }],
    m5Obs: [],
    m5Fvgs: [],
    m5Ifvgs: [],
    m5Bbs: [],
    livePrice: 3601.0,
    m15Dir: 1,
    eqVal: 3600.0
  });

  assert.ok(res.primary, 'Should select a clean primary BUY zone');
  assert.equal(res.primary.kind, 'BB', 'Clean +BB Breaker Block should outrank monster $17 OB');
  assert.ok((res.primary.high - res.primary.low) <= 11.0, 'Primary zone must not be bloated');
});

test('6. dashboardEngine dynamically expands Dealing Range when price rallies far past old swing high', () => {
  const baseSec = Math.floor(Date.UTC(2026, 10, 23, 0, 0, 0) / 1000);
  const candles = [];
  let p = 3510;
  // Build an initial swing low at 3503 and swing high at 3533, then rally smoothly to 3615 without deep pullback
  const path = [
    3512, 3508, 3504, 3503, 3507, 3514, 3522, 3530, 3533, 3526, 3521,
    3525, 3531, 3538, 3545, 3552, 3560, 3568, 3576, 3584, 3592, 3600, 3608, 3615
  ];
  for (let i = 0; i < path.length; i += 1) {
    const prev = i === 0 ? 3514 : path[i - 1];
    const cur = path[i];
    const hi = Math.max(prev, cur) + 1.5;
    const lo = Math.min(prev, cur) - 1.5;
    candles.push({ open_time: baseSec + i * 900, close_time: baseSec + (i + 1) * 900, open: prev, high: hi, low: lo, close: cur });
    p = cur;
  }
  const dash = dashboardEngine(candles, {}, { biasDir: 1, biasText: 'BULLISH' });
  assert.ok(dash.current && dash.current.rangeHigh >= 3614, `Dealing Range high must dynamically track live rally (~3616.5), got ${dash.current?.rangeHigh}`);
  assert.ok(dash.current.rangeHigh > dash.current.rangeLow);
});
