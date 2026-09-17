import test from 'node:test';
import assert from 'node:assert/strict';
import { latestConfirmedSwing, normalizeCandles } from '../supabase/functions/scalper-engine/candles.mjs';
import { detectSmrFirstRetestCandidates } from '../supabase/functions/scalper-engine/smr-first-retest.mjs';
import { evaluateScalperCandidates } from '../supabase/functions/scalper-engine/engine.mjs';

// Controlled OHLC unit fixtures, NOT historical market evidence or a backtest.
// Rising highs cannot confirm a HIGH; the isolated low at index 1 is confirmed
// but NOT swept at index 3. Baseline compares false !== null, then reads high.price.
const start = 1_700_000_000;
function inputFor(kind) {
  const M5 = Array.from({ length: 30 }, (_, i) => ({
    open_time: start + i * 300, close_time: start + (i + 1) * 300,
    open: 100, close: 100,
    high: kind === 'missing-low' ? (i === 1 ? 112 : 110) : 110 + i,
    low: kind === 'missing-high' ? (i === 1 ? 89 : 90) : 90 - i,
    is_closed: true,
  }));
  const D1 = Array.from({ length: 8 }, (_, i) => ({
    open_time: start - (8 - i) * 86400, close_time: start - (7 - i) * 86400,
    open: 100, high: 110, low: 90, close: 100, is_closed: true,
  }));
  return { series: { M5, D1 }, nowSeconds: M5.at(-1).close_time, maxSignalAgeSeconds: 21600 };
}

for (const kind of ['missing-high', 'missing-low', 'missing-both']) {
  test(`SMR fails closed with ${kind} and no actual sweep`, () => {
    const input = inputFor(kind);
    const values = normalizeCandles(input.series.M5, 300);
    const high = latestConfirmedSwing(values, 3, 1, 'HIGH');
    const low = latestConfirmedSwing(values, 3, 1, 'LOW');
    assert.equal(high === null, kind !== 'missing-low');
    assert.equal(low === null, kind !== 'missing-high');
    if (low) assert.ok(values[3].low >= low.price);
    if (high) assert.ok(values[3].high <= high.price);
    const original = structuredClone(input);
    assert.deepEqual(detectSmrFirstRetestCandidates(input), []);
    assert.deepEqual(input, original);
  });
}

test('engine public evaluator completes instead of propagating SMR null.price', () => {
  const result = evaluateScalperCandidates(inputFor('missing-high'));
  assert.deepEqual(result, { candidates: [], telemetry: [], raw_count: 0, rejected_count: 0 });
});
