import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLivePriceWsHub,
  normalizeTwelveDataTick,
  parseSubscribeStatus
} from '../lib/live-price-ws-hub.mjs';

class FakeWebSocket {
  static instances = [];
  constructor(url) {
    this.url = url;
    this.readyState = 0; // CONNECTING
    this.sent = [];
    this.listeners = new Map();
    FakeWebSocket.instances.push(this);
  }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(fn);
  }
  emit(type, payload = {}) {
    for (const fn of this.listeners.get(type) || []) fn(payload);
  }
  send(data) {
    this.sent.push(data);
  }
  open() {
    this.readyState = 1;
    this.emit('open', {});
  }
  receive(obj) {
    this.emit('message', { data: JSON.stringify(obj) });
  }
  close() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.emit('close', {});
  }
}

test('normalizeTwelveDataTick validates XAU/USD ticks, converts seconds to ms, and rejects stale/bad ticks', () => {
  const now = 1_795_651_080_000;
  const ok = normalizeTwelveDataTick(
    { event: 'price', symbol: 'XAU/USD', price: 3580.55, timestamp: 1_795_651_080 },
    { nowMs: now }
  );
  assert.ok(ok);
  assert.equal(ok.price, 3580.55);
  assert.equal(ok.timestamp, 1_795_651_080_000);
  assert.equal(ok.source, 'TWELVE_DATA_WEBSOCKET');

  // Wrong symbol rejected
  assert.equal(
    normalizeTwelveDataTick({ event: 'price', symbol: 'EUR/USD', price: 1.08, timestamp: 1_795_651_080 }, { nowMs: now }),
    null
  );

  // Stale (>5m) rejected
  assert.equal(
    normalizeTwelveDataTick({ event: 'price', symbol: 'XAU/USD', price: 3580, timestamp: 1_795_650_000 }, { nowMs: now }),
    null
  );

  // Backward timestamp rejected
  assert.equal(
    normalizeTwelveDataTick(
      { event: 'price', symbol: 'XAU/USD', price: 3580, timestamp: 1_795_651_070 },
      { nowMs: now, lastTimestamp: 1_795_651_080_000 }
    ),
    null
  );
});

test('parseSubscribeStatus distinguishes ok vs provider rejection clearly', () => {
  const ok = parseSubscribeStatus({
    event: 'subscribe-status',
    status: 'ok',
    success: [{ symbol: 'XAU/USD', type: 'Forex' }],
    fails: null
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.status, 'SUBSCRIBED');

  const fail = parseSubscribeStatus({
    event: 'subscribe-status',
    status: 'error',
    fails: [{ symbol: 'XAU/USD', msg: 'Symbol not available on Basic plan' }]
  });
  assert.equal(fail.ok, false);
  assert.equal(fail.status, 'ERROR');
  assert.match(fail.message, /Basic plan/i);
});

test('createLivePriceWsHub shares a single upstream WebSocket across multiple subscribers and replays latest tick', () => {
  FakeWebSocket.instances = [];
  let now = 1_795_651_080_000;

  const hub = createLivePriceWsHub({
    WebSocketImpl: FakeWebSocket,
    getCandidateKeys: () => ['test_key_1234567890abcdef'],
    hasAnyKeys: () => true,
    now: () => now,
    idleDisconnectMs: 60_000,
    heartbeatIntervalMs: 60_000
  });

  const clientA = [];
  const clientB = [];

  const unsubA = hub.subscribe(msg => clientA.push(msg));
  assert.equal(FakeWebSocket.instances.length, 1, 'must open exactly 1 upstream WS');

  const sock = FakeWebSocket.instances[0];
  sock.open();
  assert.equal(sock.sent.length, 1);
  assert.deepEqual(JSON.parse(sock.sent[0]), { action: 'subscribe', params: { symbols: 'XAU/USD' } });

  sock.receive({ event: 'subscribe-status', status: 'ok', success: [{ symbol: 'XAU/USD' }] });
  sock.receive({ event: 'price', symbol: 'XAU/USD', price: 3581.25, timestamp: 1_795_651_080 });

  // Second subscriber joins: MUST NOT open a second upstream WS and MUST get instant replay
  const unsubB = hub.subscribe(msg => clientB.push(msg));
  assert.equal(FakeWebSocket.instances.length, 1, 'second client must share the exact same 1 upstream WS');

  const bPrices = clientB.filter(m => m.event === 'price');
  assert.equal(bPrices.length, 1);
  assert.equal(bPrices[0].price, 3581.25);

  // Next tick reaches BOTH clients
  now += 2000;
  sock.receive({ event: 'price', symbol: 'XAU/USD', price: 3582.40, timestamp: 1_795_651_082 });
  assert.equal(clientA.filter(m => m.event === 'price').at(-1).price, 3582.40);
  assert.equal(clientB.filter(m => m.event === 'price').at(-1).price, 3582.40);

  const st = hub.getStatus();
  assert.equal(st.status, 'SUBSCRIBED');
  assert.equal(st.connectedClients, 2);
  assert.equal(st.lastPrice, 3582.40);

  unsubA();
  unsubB();
  hub.destroy();
});

test('createLivePriceWsHub surfaces subscribe rejection error transparently', () => {
  FakeWebSocket.instances = [];
  const hub = createLivePriceWsHub({
    WebSocketImpl: FakeWebSocket,
    getCandidateKeys: () => ['test_key_1234567890abcdef'],
    hasAnyKeys: () => true,
    idleDisconnectMs: 60_000,
    heartbeatIntervalMs: 60_000,
    baseReconnectMs: 60_000
  });

  const events = [];
  const unsub = hub.subscribe(msg => events.push(msg));
  const sock = FakeWebSocket.instances[0];
  sock.open();
  sock.receive({
    event: 'subscribe-status',
    status: 'error',
    fails: [{ symbol: 'XAU/USD', msg: 'Max WebSocket connections exceeded' }]
  });

  const errStatus = events.filter(e => e.event === 'status' && e.status === 'ERROR').at(-1);
  assert.ok(errStatus);
  assert.match(errStatus.message, /Max WebSocket connections/i);

  unsub();
  hub.destroy();
});
