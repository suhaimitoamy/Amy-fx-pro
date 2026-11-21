import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { calculateNextGenIndicators } from '../app/src/main/assets/apps/mapping/js/ict-workspace/nextgen-indicators.js';
import { analyzeAmy, dashboardEngine, baseVisuals } from '../app/src/main/assets/apps/mapping/js/ict-workspace/amy-ict.js';
import {
  resolveSsotTelemetry,
  selectScalperDualLayerPoi,
  evaluateScalperPoiVerdict
} from '../app/src/main/assets/apps/mapping/js/ict-workspace/mapping-accuracy.js';
import {
  evaluateZoneLifecycleOnCandles,
  backfillFromCandles,
  recordLivePoiProgress,
  mergeHistoryState
} from '../app/src/main/assets/apps/mapping/js/ict-workspace/mapping-history-engine.js';
import { DEFAULT_CHART_LAYERS } from '../app/src/main/assets/apps/mapping/js/ict-workspace/chart-view.js';

const ROOT = process.cwd();

function makeBar(time, open, high, low, close) {
  return { time, open, high, low, close };
}

test('chart-view.js exports DEFAULT_CHART_LAYERS with touches enabled by default', () => {
  assert.ok(DEFAULT_CHART_LAYERS && typeof DEFAULT_CHART_LAYERS === 'object');
  assert.equal(DEFAULT_CHART_LAYERS.poi, true);
  assert.equal(DEFAULT_CHART_LAYERS.touches, true);
  assert.equal(DEFAULT_CHART_LAYERS.structure, true);
  assert.equal(DEFAULT_CHART_LAYERS.liquidity, true);
  assert.equal(DEFAULT_CHART_LAYERS.pdhl, true);
  assert.equal(DEFAULT_CHART_LAYERS.alarms, true);
});

test('backend lib/scalper-engine/amy-ict.mjs is 100% byte-identical with frontend amy-ict.js', () => {
  const frontend = fs.readFileSync(path.join(ROOT, 'app/src/main/assets/apps/mapping/js/ict-workspace/amy-ict.js'), 'utf8');
  const backend = fs.readFileSync(path.join(ROOT, 'lib/scalper-engine/amy-ict.mjs'), 'utf8');
  assert.equal(backend, frontend);
});

test('nextgen-indicators tracks distinct touch episodes, 50% CE hits, and recentBroken ghost zones', () => {
  const baseSec = Math.floor(Date.UTC(2026, 3, 14, 10, 0, 0) / 1000);
  const candles = [];
  let t = baseSec;
  const push = (o, h, l, c) => {
    candles.push(makeBar(t, o, h, l, c));
    t += 900;
  };

  // Build baseline bars for stable ATR (~$3)
  for (let i = 0; i < 16; i += 1) {
    const p = 3200 + (i % 2 === 0 ? 1 : -1);
    push(p, p + 1.5, p - 1.5, p + 0.4);
  }

  // Create clean Bullish FVG: bar i-2 high = 3202, bar i-1 strong displacement up, bar i low = 3208 -> FVG [3202..3208], CE = 3205
  push(3200.5, 3202.0, 3199.5, 3201.5); // i-2
  push(3201.5, 3211.0, 3201.2, 3210.5); // i-1 displacement (body=9.0)
  push(3210.5, 3214.0, 3208.0, 3213.0); // i -> FVG [3202, 3208], CE=3205

  // Bar outside above FVG
  push(3213.0, 3215.0, 3210.0, 3212.0);
  // Touch episode 1 (two consecutive bars inside upper edge only, never reaching CE=3205)
  push(3212.0, 3212.5, 3206.8, 3209.5);
  push(3209.5, 3211.0, 3207.2, 3210.8);
  // Exit zone cleanly
  push(3210.8, 3214.5, 3209.5, 3213.5);
  // Touch episode 2: dips into 50% CE (3204.2 <= 3205) and bounces
  push(3213.5, 3214.0, 3204.2, 3211.0);
  // Stay above
  push(3211.0, 3216.0, 3210.0, 3215.0);

  const ind = calculateNextGenIndicators(candles, { tf: 'M15' });
  assert.ok(ind && ind.poi);
  const fvg = ind.poi.fvg.find(z => z.side === 'BUY' && Math.abs(z.bot - 3202) < 0.2 && Math.abs(z.top - 3208) < 0.2);
  assert.ok(fvg, 'Expected active Bullish FVG [3202..3208]');
  assert.equal(fvg.touchCount, 2, 'Consecutive bars should merge into episode 1; re-entry should be episode 2');
  assert.equal(fvg.ceTouched, true, 'Episode 2 hit 50% CE');
  assert.equal(fvg.lifecycle, 'TESTED');
  assert.equal(fvg.touches.length, 2);
  assert.equal(fvg.touches[0].hitCe, false);
  assert.equal(fvg.touches[1].hitCe, true);

  // Now close cleanly below FVG bottom (3202) to break/invalidate it
  push(3215.0, 3215.5, 3198.0, 3199.0);
  const indBroken = calculateNextGenIndicators(candles, { tf: 'M15' });
  const stillActive = indBroken.poi.fvg.find(z => Math.abs(z.bot - 3202) < 0.2 && Math.abs(z.top - 3208) < 0.2);
  assert.equal(stillActive, undefined, 'Broken FVG must be removed from active poi.fvg');
  const ghost = indBroken.poi.recentBroken.find(z => Math.abs(z.bot - 3202) < 0.2 && Math.abs(z.top - 3208) < 0.2);
  assert.ok(ghost, 'Broken FVG must appear in poi.recentBroken for ghost chart rendering');
  assert.equal(ghost.lifecycle, 'BROKEN');
  assert.equal(ghost.touches.at(-1)?.broken, true);
  assert.ok(indBroken.poi.historyFvg.some(z => Math.abs(z.bot - 3202) < 0.2), 'Broken FVG must remain in poi.historyFvg for history backfill');
});

test('nextgen-indicators ignores sub-$0.25 noise on PDH sweep and detects true sweeps', () => {
  const baseSec = Math.floor(Date.UTC(2026, 3, 14, 12, 0, 0) / 1000);
  const candles = [];
  let t = baseSec;
  for (let i = 0; i < 20; i += 1) {
    candles.push(makeBar(t, 3200, 3202, 3198, 3201));
    t += 900;
  }
  // $0.05 micro-poke above PDH=3210 -> must NOT register as PDH sweep
  candles.push(makeBar(t, 3208, 3210.05, 3207, 3208.5));
  t += 900;

  const indNoise = calculateNextGenIndicators(candles, {
    tf: 'M15',
    context: { amy: { levels: { pdh: 3210, pdl: 3180 } } }
  });
  const noiseSweep = indNoise.liquidity.sweeps.find(s => s.type === 'PDH_SWEEP');
  assert.equal(noiseSweep, undefined, '$0.05 tick above PDH must not trigger PDH_SWEEP');

  // Real $1.20 sweep above PDH=3210 with close back below PDH
  candles.push(makeBar(t, 3208.5, 3211.2, 3207.5, 3208.0));
  const indReal = calculateNextGenIndicators(candles, {
    tf: 'M15',
    context: { amy: { levels: { pdh: 3210, pdl: 3180 } } }
  });
  const realSweep = indReal.liquidity.sweeps.find(s => s.type === 'PDH_SWEEP');
  assert.ok(realSweep, 'True $1.20 sweep above PDH closing below must trigger PDH_SWEEP');
  assert.equal(realSweep.reactionSide, 'SELL');
  assert.equal(indReal.keyLevels.pdhConsumed, true);
});

test('amy-ict analyzeAmy computes keyLevels before dashboardEngine and marks broken breaker OBs as BROKEN', () => {
  const baseSec = Math.floor(Date.UTC(2026, 3, 13, 10, 0, 0) / 1000);
  const m15 = [];
  const m5 = [];
  const h1 = [];
  const makeAmyBar = (openTime, dur, o, h, l, c) => ({
    open_time: openTime,
    close_time: openTime + dur,
    open: o,
    high: h,
    low: l,
    close: c
  });
  for (let i = 0; i < 120; i += 1) {
    const t = baseSec + i * 900;
    const wave = Math.sin(i / 4) * 10;
    const o = 3200 + wave;
    const c = o + (i % 3 === 0 ? -2.4 : 2.2);
    m15.push(makeAmyBar(t, 900, o, Math.max(o, c) + 1.8, Math.min(o, c) - 1.8, c));
  }
  for (let i = 0; i < 120; i += 1) {
    const t = baseSec + i * 300;
    const o = 3200 + Math.sin(i / 4) * 4;
    m5.push(makeAmyBar(t, 300, o, o + 1.2, o - 1.2, o + 0.5));
  }
  for (let i = 0; i < 60; i += 1) {
    const t = baseSec + i * 3600;
    const o = 3200 + Math.sin(i / 3) * 12;
    h1.push(makeAmyBar(t, 3600, o, o + 3, o - 3, o + 1));
  }
  const d1 = [
    makeAmyBar(baseSec - 86400, 86400, 3190, 3235, 3175, 3205)
  ];

  const nowSeconds = baseSec + 125 * 900;
  const analyzed = analyzeAmy({ h1, m15, m5, d1, nowSeconds, settings: {} });
  assert.ok(analyzed.levels && analyzed.dashboard, 'analyzeAmy must return both levels and dashboard');
  assert.equal(analyzed.levels.pdh, 3235);
  assert.equal(analyzed.levels.pdl, 3175);
  assert.ok(analyzed.visuals && Array.isArray(analyzed.visuals.ob));
  for (const ob of analyzed.visuals.ob) {
    if (ob.breaker) {
      assert.equal(ob.lifecycle, 'BROKEN', 'Breaker OB must be marked BROKEN so active POI filter excludes it');
      assert.equal(ob.status, 4);
    }
  }
});

test('mapping-accuracy resolveSsotTelemetry excludes consumed PDH/Asia High from DOL targets', () => {
  const ctx = {
    price: 3205,
    m15: { structure: 'BULLISH', control: 'BUYER' },
    amy: {
      dashboard: { biasDir: 1, dolDir: 1 },
      levels: { pdh: 3210, asiaHigh: 3208, bsl: 3218 }
    },
    liquidity: [
      { label: 'PDH', side: 'BUY', level: 3210, status: 'TAKEN' },
      { label: 'BSL Swing', side: 'BUY', level: 3218, status: 'ACTIVE' }
    ]
  };
  const ng = {
    tf: 'M15',
    keyLevels: { pdhConsumed: true, asiaHighConsumed: true },
    dol: { dir: 1, poolsAbove: [{ name: 'BSL Swing', level: 3218 }] }
  };
  const tel = resolveSsotTelemetry(ctx, ng, 3205);
  assert.equal(tel.dolLevel, 3218, 'Consumed PDH (3210) and Asia High (3208) must be skipped in favor of fresh BSL Swing (3218)');
  assert.match(tel.dolText, /3218\.00/);
});

test('selectScalperDualLayerPoi & evaluateScalperPoiVerdict preserve and surface touchCount + ceTouched', () => {
  const res = selectScalperDualLayerPoi({
    side: 'BUY',
    livePrice: 3210,
    m15Dir: 1,
    m15Obs: [
      { lo: 3204, hi: 3207, ce: 3205.5, tested: true, touchCount: 2, ceTouched: true, lifecycle: 'TESTED', label: '+OB M15' }
    ]
  });
  assert.ok(res.primary);
  assert.equal(res.primary.touchCount, 2);
  assert.equal(res.primary.ceTouched, true);
  assert.equal(res.primary.fresh, false);

  const verdict = evaluateScalperPoiVerdict({
    side: 'BUY',
    h1Dir: 1,
    m15Dir: 1,
    m5Dir: 1,
    zone: res.primary,
    livePrice: 3210,
    slGuard: { dist: 4.0, status: 'ideal' },
    rr1: 2.0,
    tp1: { v: 3218, name: 'BSL M15', synthetic: false }
  });
  assert.equal(verdict.checks[2].label, 'OB M15 · 2× CE');
});

test('mapping-history-engine tracks accurate edge touchPrice, multi-touch counts, and historyFvg backfill', () => {
  const nowSec = Math.floor(Date.UTC(2026, 3, 14, 14, 0, 0) / 1000);
  const candles = [
    { open_time: nowSec - 6 * 900, close_time: nowSec - 5 * 900, open: 3200, high: 3201, low: 3199, close: 3200.5 },
    // Zone formed at index 0: SELL FVG [3210..3214], CE=3212, SL=3214.4, TP1=3207.0, TP2=3203.0
    // Bar 1 approaches from below (open=3208 < lo=3210), touches 3211 (edge only), pulls back to 3208 (above TP1/TP2)
    { open_time: nowSec - 5 * 900, close_time: nowSec - 4 * 900, open: 3208, high: 3211, low: 3207.5, close: 3208.5 },
    // Bar 2 leaves zone below cleanly
    { open_time: nowSec - 4 * 900, close_time: nowSec - 3 * 900, open: 3208.5, high: 3209.2, low: 3207.4, close: 3208.2 },
    // Bar 3 re-enters and hits 50% CE (3212.5 >= 3212), then drops toward TP2
    { open_time: nowSec - 3 * 900, close_time: nowSec - 2 * 900, open: 3208.2, high: 3212.5, low: 3202, close: 3203 }
  ];

  const rec = evaluateZoneLifecycleOnCandles(
    { side: 'SELL', tf: 'M15', kind: 'FVG', low: 3210, high: 3214, ce: 3212, formedIndex: 0 },
    candles,
    30 * 3600 * 1000,
    nowSec * 1000
  );
  assert.ok(rec);
  assert.equal(rec.touchPrice, 3210, 'SELL zone approached from below should record entry touchPrice at lower edge 3210');
  assert.equal(rec.touchCount, 2, 'Two separate visits into zone must yield touchCount=2');
  assert.equal(rec.ceTouched, true, 'Second visit reached 50% CE');
  assert.equal(rec.touches.length, 2);

  // Backfill must pick up historyFvg even when active poi.fvg is empty
  const bf = backfillFromCandles({
    m15Candles: candles,
    ngM15: {
      poi: {
        fvg: [],
        ob: [],
        historyFvg: [{ side: 'SELL', bot: 3210, top: 3214, ce: 3212, formedIndex: 0 }]
      }
    },
    nowMs: nowSec * 1000
  });
  assert.equal(bf.poiRecords.length, 1);
  assert.equal(bf.poiRecords[0].touchCount, 2);

  // Live merge preserves max touchCount & ceTouched
  const live = recordLivePoiProgress({
    state: { version: 1, poiRecords: [], timelineEvents: [] },
    plans: [{ side: 'SELL', tf: 'M15', kind: 'FVG', area: { low: 3210, high: 3214, ce: 3212 }, sl: 3214.4 }],
    livePrice: 3212.5,
    nowMs: nowSec * 1000
  });
  assert.equal(live.changed, true);
  assert.equal(live.state.poiRecords[0].ceTouched, true);
  const merged = mergeHistoryState(live.state, bf, nowSec * 1000);
  assert.equal(merged.poiRecords[0].touchCount, 2);
  assert.equal(merged.poiRecords[0].ceTouched, true);
});
