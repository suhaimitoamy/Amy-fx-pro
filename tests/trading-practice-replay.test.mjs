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
load('drawing-core.js');
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

test('historical and live candles merge continuously, update same bucket, deduplicate, and order', () => {
  const historical = minuteCandles.slice(0, 3);
  let merged = context.AmyPracticeCore.mergeCandleSeries(historical, [minuteCandles[3], minuteCandles[4], minuteCandles[3]]);
  assert.deepEqual(Array.from(merged, candle => candle.time), [0, 60, 120, 180, 240]);
  const replacement = { ...minuteCandles[4], high: 999, close: 200 };
  const result = context.AmyPracticeCore.upsertLatestCandle(merged, replacement);
  assert.equal(result.action, 'UPDATED');
  assert.equal(result.candles.length, 5);
  assert.equal(result.candles.at(-1).high, 999);

  const ignored = context.AmyPracticeCore.upsertLatestCandle(result.candles, { ...minuteCandles[2], high: 777 });
  assert.equal(ignored.action, 'IGNORED_OLDER');
  assert.equal(ignored.candles.at(-1).high, 999);
  assert.deepEqual(Array.from(ignored.candles, candle => candle.time), [0, 60, 120, 180, 240]);
});

test('historical OHLC wins on an overlapping native/live context timestamp', () => {
  const historical = minuteCandles.slice(0, 3);
  const overlap = { ...minuteCandles[2], high: 999, close: 998 };
  const merged = context.AmyPracticeCore.mergeCandleSeries(historical, [overlap, minuteCandles[3]]);
  assert.equal(merged.length, 4);
  assert.equal(merged[2].high, minuteCandles[2].high);
  assert.equal(merged[2].close, minuteCandles[2].close);

  const liveOverlap = context.AmyPracticeCore.upsertLatestCandle(merged, overlap, { immutableThrough: minuteCandles[2].time });
  assert.equal(liveOverlap.action, 'IGNORED_HISTORICAL');
  assert.equal(liveOverlap.candles[2].high, minuteCandles[2].high);
});

test('tick aggregation can seed and update the last historical timeframe candle', () => {
  const aggregator = new context.AmyPracticeCore.TickAggregator('M1');
  aggregator.seed({ time: 120, open: 100, high: 101, low: 99, close: 100 });
  const update = aggregator.push({ timestamp: 150, price: 102 });
  assert.equal(update.closed, null);
  assert.equal(update.current.time, 120);
  assert.equal(update.current.open, 100);
  assert.equal(update.current.high, 102);
});

test('drawing model stores TIME + PRICE and remains stable across screen transforms', () => {
  const drawing = context.AmyPracticeDrawing.create('trend', [{ time: 60, price: 100 }, { time: 180, price: 110 }]);
  assert.ok(drawing);
  const moved = context.AmyPracticeDrawing.move(drawing, 60, -5);
  assert.deepEqual(JSON.parse(JSON.stringify(moved.points)), [{ time: 120, price: 95 }, { time: 240, price: 105 }]);
  assert.equal(context.AmyPracticeDrawing.requiredPoints('parallelChannel'), 3);
  assert.equal(context.AmyPracticeDrawing.requiredPoints('fibonacci'), 2);
});

test('every required drawing tool creates a valid TIME + PRICE model', () => {
  const model = context.AmyPracticeDrawing;
  const points = [
    { time: 60, price: 4101.25 },
    { time: 180, price: 4112.75 },
    { time: 240, price: 4094.5 }
  ];
  for (const type of model.SUPPORTED) {
    const count = model.requiredPoints(type);
    const drawing = model.create(type, points.slice(0, count), { text: 'Area reaksi' });
    assert.ok(drawing, `${type} should create a drawing`);
    assert.equal(drawing.type, type);
    assert.equal(drawing.points.length, count);
    assert.ok(drawing.points.every(point => Number.isFinite(point.time) && Number.isFinite(point.price)));
  }
  const position = model.create('longPosition', points);
  assert.equal(model.positionStats(position).entry, 4101.25);
});

test('locked replay decision gets a stable cursor/source identity and WAIT needs no levels', () => {
  const first = context.AmyPracticeTrades.create({ symbol: 'XAUUSD', timeframe: 'M15', sourceId: 'pack-a', tradeTime: 900, bias: 'WAIT', lockDecision: true });
  const second = context.AmyPracticeTrades.create({ symbol: 'XAUUSD', timeframe: 'M15', sourceId: 'pack-a', tradeTime: 900, bias: 'WAIT', lockDecision: true });
  assert.equal(first.id, second.id);
  assert.equal(first.entryStatus, 'NOT_APPLICABLE');
  assert.equal(first.locked, true);
});

test('locked decision persists, can be read after runtime reload, and history consumes stored trades', async () => {
  const shared = new Map();
  const localStorage = {
    getItem: key => shared.has(key) ? shared.get(key) : null,
    setItem: (key, value) => shared.set(key, String(value)),
    removeItem: key => shared.delete(key)
  };
  const createRuntime = () => {
    const runtime = { console, localStorage, setTimeout, clearTimeout };
    runtime.globalThis = runtime;
    vm.createContext(runtime);
    const run = name => vm.runInContext(readFileSync(new URL(name, base), 'utf8'), runtime, { filename: name });
    run('practice-core.js');
    run('storage.js');
    run('trade-engine.js');
    return runtime;
  };

  const firstRuntime = createRuntime();
  const record = firstRuntime.AmyPracticeTrades.create({
    symbol: 'XAUUSD', timeframe: 'M15', sourceId: 'pack-july-2026', tradeTime: 1_786_000_000,
    replayStartTime: 1_785_999_100, bias: 'WAIT', notes: 'No setup', lockDecision: true
  });
  await firstRuntime.AmyPracticeStorage.saveTrade(record);
  assert.equal((await firstRuntime.AmyPracticeStorage.getTrade(record.id)).tradeTime, record.tradeTime);

  const restartedRuntime = createRuntime();
  const restored = await restartedRuntime.AmyPracticeStorage.getTrade(record.id);
  assert.equal(restored.id, record.id);
  assert.equal(restored.bias, 'WAIT');
  assert.equal((await restartedRuntime.AmyPracticeStorage.listTrades()).length, 1);

  const historySource = readFileSync(new URL('../app/src/main/assets/apps/academy/trading-practice/assets/js/backtest-history.js', import.meta.url), 'utf8');
  assert.match(historySource, /AmyPracticeStorage\.listTrades\(\)/);
  assert.match(historySource, /history-lock/);
});

test('IndexedDB write resolves only after the transaction commit event', async () => {
  const state = {};
  const indexedDB = {
    open() {
      state.openRequest = {};
      return state.openRequest;
    }
  };
  const runtime = { console, indexedDB, localStorage: { getItem: () => null, setItem() {} }, setTimeout, clearTimeout };
  runtime.globalThis = runtime;
  vm.createContext(runtime);
  const run = name => vm.runInContext(readFileSync(new URL(name, base), 'utf8'), runtime, { filename: name });
  run('practice-core.js');
  run('storage.js');

  let resolved = false;
  const saving = runtime.AmyPracticeStorage.saveTrade({ id: 'commit-test', createdAt: 1 }).then(() => { resolved = true; });
  state.openRequest.result = {
    objectStoreNames: { contains: () => true },
    transaction() {
      state.transaction = {
        objectStore() {
          return {
            put() {
              state.operationRequest = {};
              return state.operationRequest;
            }
          };
        },
        abort() {}
      };
      return state.transaction;
    }
  };
  state.openRequest.onsuccess();
  await new Promise(resolve => setImmediate(resolve));
  state.operationRequest.result = 'commit-test';
  state.operationRequest.onsuccess();
  await Promise.resolve();
  assert.equal(resolved, false, 'request success alone must not report a durable save');
  state.transaction.oncomplete();
  await saving;
  assert.equal(resolved, true);
});
