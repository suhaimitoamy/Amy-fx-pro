import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const base = new URL('../app/src/main/assets/apps/academy/trading-practice/assets/js/', import.meta.url);
const context = { console, setInterval, clearInterval, setTimeout, clearTimeout };
context.globalThis = context;
vm.createContext(context);

const load = name => vm.runInContext(readFileSync(new URL(name, base), 'utf8'), context, { filename: name });
load('practice-core.js');
context.AmyPracticeStorage = { identifier: prefix => `${prefix}-test` };
load('trade-engine.js');
load('replay-engine.js');

const minuteCandles = Array.from({ length: 12 }, (_, index) => ({
  time: index * 60,
  open: 100 + index,
  high: 101 + index,
  low: 99 + index,
  close: 100.5 + index
}));

test('normalization excludes open and synthetic candles', () => {
  const items = [
    { ...minuteCandles[0], isClosed: false },
    { ...minuteCandles[1], synthetic: true },
    minuteCandles[2]
  ];
  assert.deepEqual(JSON.parse(JSON.stringify(context.AmyPracticeCore.normalizeCandles(items))), [minuteCandles[2]]);
});

test('aggregation filters source rows before building a partial higher-timeframe candle', () => {
  const visible = context.AmyPracticeCore.visibleCandles(minuteCandles, 180, 'M5', 'M1');
  assert.equal(visible.length, 1);
  assert.equal(visible[0].time, 0);
  assert.equal(visible[0].lastSourceTime, 180);
  assert.equal(visible[0].close, minuteCandles[3].close);
  assert.ok(visible.every(candle => candle.time <= 180 && candle.lastSourceTime <= 180));
});

test('replay keeps one timestamp cursor across timeframe switches with no future rows', async () => {
  const core = context.AmyPracticeCore;
  const provider = {
    async getTimeline({ timeframe }) {
      return core.aggregateCandles(minuteCandles, timeframe, { sourceTimeframe: 'M1' }).map(candle => candle.lastSourceTime ?? candle.time);
    },
    async getCandles({ timeframe, cursor }) {
      return { source: 'test', sampleOnly: true, candles: core.visibleCandles(minuteCandles, cursor, timeframe, 'M1') };
    }
  };
  const controller = new context.AmyReplayEngine.ReplayController({ provider, timeframe: 'M1' });
  const first = await controller.start(180);
  assert.equal(first.cursor, 180);
  const switched = await controller.setTimeframe('M5');
  assert.equal(switched.cursor, 180);
  assert.ok(switched.candles.every(candle => candle.time <= switched.cursor));
  assert.equal(switched.candles.at(-1).lastSourceTime, 180);
  const advanced = await controller.move(1);
  assert.equal(advanced.cursor, 240, 'the next step after a cross-timeframe partial cursor must not be skipped');
  assert.equal(advanced.candles.at(-1).lastSourceTime, 240);
});

test('manual trade resolves only from later candles and chooses SL on an ambiguous bar', () => {
  const trade = context.AmyPracticeTrades.create({
    symbol: 'XAUUSD', timeframe: 'M1', tradeTime: 60, replayStartTime: 0,
    bias: 'BUY', entry: 101, stopLoss: 99, takeProfit: 103, currentPrice: 100
  });
  const result = context.AmyPracticeTrades.evaluate(trade, [
    { time: 60, open: 100, high: 104, low: 98, close: 102 },
    { time: 120, open: 101, high: 104, low: 98, close: 100 }
  ]);
  assert.equal(result.result, 'LOSS');
  assert.equal(result.closedAt, 120);
  assert.equal(result.resolution, 'SL_FIRST_AMBIGUOUS_CANDLE');
  assert.equal(result.r, -1);
});
