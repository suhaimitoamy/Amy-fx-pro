import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import handler from '../api/live-price.js';
import { getDefaultLivePriceWsHub } from '../lib/live-price-ws-hub.mjs';

function parsePriceChunks(chunks) {
  return chunks
    .filter(c => c.startsWith('data: '))
    .map(c => JSON.parse(c.slice(6)))
    .filter(m => m.event === 'price');
}

function resetHub() {
  try {
    getDefaultLivePriceWsHub()?.destroy?.();
  } catch (_) {}
  delete globalThis.__amyFxLivePriceWsHub;
}

test('relay forwards fresh ordered quotes, drops stale/wrong-symbol quotes and hides credentials', async () => {
  resetHub();
  const original = globalThis.WebSocket;
  const key = process.env.TWELVEDATA_API_KEY;
  const frames = [];
  let upstream;
  class FakeSocket extends EventTarget {
    static OPEN = 1;
    readyState = 1;
    constructor(url) { super(); upstream = this; assert.ok(url.includes('apikey=')); }
    send(data) { frames.push(JSON.parse(data)); }
    close() { this.readyState = 3; }
    message(data) { this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(data) })); }
  }
  const res = new EventEmitter();
  res.setHeader = () => {};
  const chunks = [];
  res.write = text => { chunks.push(text); return true; };
  res.end = () => { res.writableEnded = true; };
  try {
    globalThis.WebSocket = FakeSocket;
    process.env.TWELVEDATA_API_KEY = 'abc1234567890abcdef1234';
    const pending = handler({ method: 'GET', url: '/api/live-price' }, res);
    upstream.dispatchEvent(new Event('open'));
    const timestamp = Date.now();
    const quote = { event: 'price', symbol: 'XAU/USD', price: 4000, timestamp };
    upstream.message(quote);
    upstream.message({ ...quote, price: 3990, timestamp: timestamp - 1000 });
    upstream.message({ ...quote, timestamp: timestamp - 360000 });
    upstream.message({ ...quote, symbol: 'EUR/USD' });
    const prices = parsePriceChunks(chunks);
    assert.equal(prices.length, 1);
    assert.equal(prices[0].price, 4000);
    assert.doesNotMatch(chunks.join(''), /abc1234567890abcdef1234/);
    assert.equal(frames[0].params.symbols, 'XAU/USD');
    res.emit('close');
    await pending;
    resetHub();
    assert.equal(upstream.readyState, 3);
  } finally {
    resetHub();
    globalThis.WebSocket = original;
    if (key === undefined) delete process.env.TWELVEDATA_API_KEY;
    else process.env.TWELVEDATA_API_KEY = key;
  }
});

test('relay tolerates up to 5 minutes clock drift (300_000ms) but drops beyond limit', async () => {
  resetHub();
  const original = globalThis.WebSocket;
  const key = process.env.TWELVEDATA_API_KEY;
  let upstream;
  class FakeSocket extends EventTarget {
    static OPEN = 1;
    readyState = 1;
    constructor() { super(); upstream = this; }
    send() {}
    close() { this.readyState = 3; }
    message(data) { this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(data) })); }
  }
  const res = new EventEmitter();
  res.setHeader = () => {};
  const chunks = [];
  res.write = text => { chunks.push(text); return true; };
  res.end = () => { res.writableEnded = true; };
  try {
    globalThis.WebSocket = FakeSocket;
    process.env.TWELVEDATA_API_KEY = 'abc1234567890abcdef1234';
    const pending = handler({ method: 'GET', url: '/api/live-price' }, res);
    upstream.dispatchEvent(new Event('open'));
    const now = Date.now();

    // 1. Quote 6 minutes old (age = 360_000ms > 300_000ms) -> DROPPED
    upstream.message({ event: 'price', symbol: 'XAU/USD', price: 4001, timestamp: now - 360000 });
    assert.equal(parsePriceChunks(chunks).length, 0);

    // 2. Quote 2 minutes old (age = 120_000ms <= 300_000ms) -> ACCEPTED (drift tolerance)
    upstream.message({ event: 'price', symbol: 'XAU/USD', price: 4002, timestamp: now - 120000 });
    assert.equal(parsePriceChunks(chunks).length, 1);
    assert.equal(parsePriceChunks(chunks)[0].price, 4002);

    // 3. Monotonic check: timestamp less than lastTimestamp (now - 150000 < now - 120000) -> DROPPED
    upstream.message({ event: 'price', symbol: 'XAU/USD', price: 4003, timestamp: now - 150000 });
    assert.equal(parsePriceChunks(chunks).length, 1);

    // 4. Quote 2 minutes in future (age = -120_000ms >= -300_000ms) and > lastTimestamp -> ACCEPTED
    upstream.message({ event: 'price', symbol: 'XAU/USD', price: 4004, timestamp: now + 120000 });
    assert.equal(parsePriceChunks(chunks).length, 2);
    assert.equal(parsePriceChunks(chunks)[1].price, 4004);

    // 5. Quote 6 minutes in future (age = -360_000ms < -300_000ms) -> DROPPED
    upstream.message({ event: 'price', symbol: 'XAU/USD', price: 4005, timestamp: now + 360000 });
    assert.equal(parsePriceChunks(chunks).length, 2);

    res.emit('close');
    await pending;
  } finally {
    resetHub();
    globalThis.WebSocket = original;
    if (key === undefined) delete process.env.TWELVEDATA_API_KEY;
    else process.env.TWELVEDATA_API_KEY = key;
  }
});

