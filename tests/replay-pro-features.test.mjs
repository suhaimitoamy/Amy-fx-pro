import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
function resolveAsset(rel) {
  const p = path.join(ROOT, 'app/src/main/assets', rel);
  return fs.existsSync(p) ? p : path.join(ROOT, rel);
}

function loadScriptInSandbox(relPath, sandbox) {
  const code = fs.readFileSync(resolveAsset(relPath), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: relPath });
  return sandbox;
}

function makeSampleCandles(count = 60, startTs = 1735689600, stepSec = 900) {
  const out = [];
  let px = 2640;
  for (let i = 0; i < count; i += 1) {
    const open = px;
    const delta = ((i % 7) - 3) * 0.8 + 0.25;
    const close = Math.round((open + delta) * 100) / 100;
    const high = Math.round((Math.max(open, close) + 1.4) * 100) / 100;
    const low = Math.round((Math.min(open, close) - 1.2) * 100) / 100;
    out.push({ time: startTs + i * stepSec, open, high, low, close });
    px = close;
  }
  return out;
}

test('AmyReplayIndicators: computeEMA, computeBollingerBands, and computeIntradayVWAP produce accurate zero-future-leak series', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  loadScriptInSandbox('apps/academy/trading-practice/assets/js/replay-indicators.js', ctx);
  const ind = ctx.AmyReplayIndicators;
  assert.ok(ind, 'AmyReplayIndicators should mount on window');

  const candles = makeSampleCandles(40);
  const ema20 = ind.computeEMA(candles, 20);
  assert.equal(ema20.length, 21, 'EMA(20) on 40 candles produces 21 points');
  assert.equal(ema20[0].time, candles[19].time);
  assert.equal(ema20[ema20.length - 1].time, candles[39].time);

  // Prefix invariance check (zero future leak): first point of EMA on 40 bars == EMA on first 20 bars
  const ema20Prefix = ind.computeEMA(candles.slice(0, 20), 20);
  assert.equal(ema20Prefix.length, 1);
  assert.equal(ema20Prefix[0].value, ema20[0].value);

  const bb = ind.computeBollingerBands(candles, 20, 2);
  assert.equal(bb.upper.length, 21);
  assert.equal(bb.middle.length, 21);
  assert.equal(bb.lower.length, 21);
  for (let i = 0; i < bb.middle.length; i += 1) {
    assert.ok(bb.upper[i].value >= bb.middle[i].value);
    assert.ok(bb.middle[i].value >= bb.lower[i].value);
  }

  const vwap = ind.computeIntradayVWAP(candles);
  assert.equal(vwap.length, candles.length);
  const firstTypical = (candles[0].high + candles[0].low + candles[0].close) / 3;
  assert.ok(Math.abs(vwap[0].value - firstTypical) < 0.001);
});

test('AmyReplayIndicators: Magnet OHLC snap (off, weak, strong) works accurately', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  loadScriptInSandbox('apps/academy/trading-practice/assets/js/replay-indicators.js', ctx);
  const ind = ctx.AmyReplayIndicators;

  const candles = [
    { time: 1000, open: 2650, high: 2655.5, low: 2648.2, close: 2653 },
    { time: 1900, open: 2653, high: 2660.0, low: 2651.0, close: 2658 }
  ];

  const ptNearHigh = { time: 1050, price: 2654.9, x: 100, y: 50 };
  const offSnap = ind.snapPointToCandleOHLC(ptNearHigh, candles, 'off', 2.0);
  assert.equal(offSnap.snapped, false);
  assert.equal(offSnap.price, 2654.9);

  const weakSnap = ind.snapPointToCandleOHLC(ptNearHigh, candles, 'weak', 1.5);
  assert.equal(weakSnap.snapped, true);
  assert.equal(weakSnap.price, 2655.5);
  assert.equal(weakSnap.ohlcKey, 'high');
  assert.equal(weakSnap.time, 1000);

  const ptFar = { time: 1050, price: 2670.0, x: 100, y: 10 };
  const weakMiss = ind.snapPointToCandleOHLC(ptFar, candles, 'weak', 2.0);
  assert.equal(weakMiss.snapped, false);

  const strongHit = ind.snapPointToCandleOHLC(ptFar, candles, 'strong', 2.0);
  assert.equal(strongHit.snapped, true);
  assert.equal(strongHit.price, 2655.5);
});

test('AmyReplayIndicators: Measure Ruler stats, Session Bands, and Cut-Bar timestamp resolution', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  loadScriptInSandbox('apps/academy/trading-practice/assets/js/replay-indicators.js', ctx);
  const ind = ctx.AmyReplayIndicators;

  const candles = makeSampleCandles(96, 1735689600, 900); // 24 hours of M15 starting 00:00 UTC
  const stats = ind.computeMeasureStats(
    { time: candles[10].time, price: 2640.0 },
    { time: candles[22].time, price: 2652.5 },
    candles,
    900
  );
  assert.equal(stats.deltaPrice, 12.5);
  assert.equal(stats.pips, 125);
  assert.equal(stats.bars, 12);
  assert.equal(stats.durationLabel, '3j');
  assert.equal(stats.bullish, true);

  const bands = ind.computeSessionBands(candles);
  const names = bands.map((b) => b.session);
  assert.ok(names.includes('Asia'), 'Should detect Asia session band');
  assert.ok(names.includes('London'), 'Should detect London session band');
  assert.ok(names.includes('New York'), 'Should detect New York session band');

  const timeline = candles.map((c) => c.time);
  const cutTs = ind.resolveCutBarTimestamp(timeline, candles[30].time + 200);
  assert.equal(cutTs, candles[30].time);
  const tooEarly = ind.resolveCutBarTimestamp(timeline, candles[0].time);
  assert.equal(tooEarly, candles[5].time, 'Should clamp minimum bar index to keep chart context');
});

test('AmyPracticeDrawing: supports vertical, datePriceRange, lineStyle, locked, and visible flags', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  loadScriptInSandbox('apps/academy/trading-practice/assets/js/drawing-core.js', ctx);
  const model = ctx.AmyPracticeDrawing;

  const vLine = model.create('vertical', [{ time: 1735690000, price: 2650 }], {
    style: { color: '#38bdf8', width: 2, lineStyle: 'dashed' },
    locked: true
  });
  assert.ok(vLine);
  assert.equal(vLine.type, 'vertical');
  assert.equal(vLine.style.lineStyle, 'dashed');
  assert.equal(vLine.locked, true);
  assert.equal(vLine.visible, true);

  const dpr = model.create('datePriceRange', [
    { time: 1735690000, price: 2640 },
    { time: 1735700000, price: 2655 }
  ], { visible: false });
  assert.ok(dpr);
  assert.equal(dpr.type, 'datePriceRange');
  assert.equal(dpr.visible, false);

  const cloned = model.clone(vLine);
  assert.equal(cloned.locked, true);
  assert.equal(cloned.style.lineStyle, 'dashed');
});

test('Candle Replay Pro HTML & JS hygiene: zero confirm/alert/prompt, required Pro studio DOM IDs present', () => {
  const html = fs.readFileSync(resolveAsset('apps/academy/trading-practice/candle-replay.html'), 'utf8');
  const requiredIds = [
    'replayWorkspace', 'replaySourceSelect', 'openDataManager', 'chartStyleSelect',
    'tvIndicatorMenu', 'tvIndicatorPanel', 'replayCutBtn', 'replayQuickTradeToggle',
    'replayIctToggle', 'replayFollow', 'replaySnapshotBtn', 'replayShortcutBtn',
    'replayFullscreen', 'tfSegBar', 'tvDrawingDock', 'tvExtraToolsMenu',
    'tvQuickTradeBar', 'tvFloatingObjBar', 'tvObjSendOrderBtn', 'tvObjectTreeList',
    'replayScrubber', 'replayBarCounter', 'scaleAutoBtn', 'replayResetStartBtn',
    'playToggle', 'speedSelect', 'replayRandomBtn', 'shortcutHelpDialog'
  ];
  for (const id of requiredIds) {
    assert.ok(html.includes(`id="${id}"`), `candle-replay.html missing #${id}`);
  }
  assert.ok(html.includes('assets/js/replay-indicators.js'), 'candle-replay.html must load replay-indicators.js');

  const jsFiles = [
    'apps/academy/trading-practice/assets/js/replay-indicators.js',
    'apps/academy/trading-practice/assets/js/drawing-core.js',
    'apps/academy/trading-practice/assets/js/chart-engine.js',
    'apps/academy/trading-practice/assets/js/replay-engine.js',
    'apps/academy/trading-practice/assets/js/practice-ui.js',
    'apps/academy/trading-practice/assets/js/candle-replay.js'
  ];
  for (const f of jsFiles) {
    const src = fs.readFileSync(resolveAsset(f), 'utf8');
    assert.equal(/\b(window\.)?(confirm|alert|prompt)\s*\(/.test(src), false, `${f} must not use alert/confirm/prompt`);
  }
});
