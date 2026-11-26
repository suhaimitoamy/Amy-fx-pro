/**
 * Shared Single-Connection Twelve Data WebSocket Hub (XAU/USD)
 *
 * Guarantees at most 1 concurrent upstream WebSocket connection per server
 * instance (respecting Twelve Data Basic 8's 1 WS connection limit) and fans
 * out validated real-time price ticks to unlimited SSE subscribers.
 *
 * Zero external dependencies — uses native Node 22 WebSocket and the existing
 * Twelve Data multi-key rotation pool (`lib/twelvedata-key-pool.mjs`).
 */
import {
  getOrderedCandidateKeys,
  getTwelveDataKeys,
  markKeyFailure,
  markKeySuccess
} from './twelvedata-key-pool.mjs';

export const DEFAULT_SYMBOL = 'XAU/USD';
export const DEFAULT_WS_ENDPOINT = 'wss://ws.twelvedata.com/v1/quotes/price';
export const MAX_TICK_CLOCK_SKEW_MS = 300_000; // 5 minutes
export const FRESH_TICK_REPLAY_TTL_MS = 90_000; // Replay last tick on new SSE connect if < 90s old
export const IDLE_DISCONNECT_MS = 45_000; // Close upstream WS 45s after last subscriber leaves
export const HEARTBEAT_INTERVAL_MS = 10_000;

export function normalizeTwelveDataTick(rawData, { symbol = DEFAULT_SYMBOL, nowMs = Date.now(), lastTimestamp = 0 } = {}) {
  if (!rawData || rawData.event !== 'price') return null;
  const expectedNorm = String(symbol || DEFAULT_SYMBOL).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const actualNorm = String(rawData.symbol || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (!actualNorm || actualNorm !== expectedNorm) return null;

  const price = Number(rawData.price);
  const rawTs = Number(rawData.timestamp);
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(rawTs) || rawTs <= 0) return null;

  const timestamp = rawTs > 100_000_000_000 ? rawTs : rawTs * 1000;
  const age = nowMs - timestamp;
  if (Math.abs(age) > MAX_TICK_CLOCK_SKEW_MS) return null;
  if (Number.isFinite(lastTimestamp) && lastTimestamp > 0 && timestamp < lastTimestamp) return null;

  return {
    event: 'price',
    source: 'TWELVE_DATA_WEBSOCKET',
    symbol: DEFAULT_SYMBOL,
    price,
    timestamp
  };
}

export function parseSubscribeStatus(rawData) {
  if (!rawData || rawData.event !== 'subscribe-status') return null;
  const status = String(rawData.status || '').toLowerCase();
  const fails = Array.isArray(rawData.fails) ? rawData.fails : [];
  const success = Array.isArray(rawData.success) ? rawData.success : [];
  if (status === 'error' || (fails.length > 0 && success.length === 0)) {
    const firstFail = fails[0];
    const failMsg = firstFail?.msg || firstFail?.message || rawData.message || 'Langganan XAU/USD ditolak oleh WebSocket Twelve Data.';
    return {
      ok: false,
      status: 'ERROR',
      message: String(failMsg),
      fails,
      success
    };
  }
  return {
    ok: true,
    status: 'SUBSCRIBED',
    message: 'WebSocket Twelve Data aktif untuk XAU/USD.',
    fails,
    success
  };
}

export function createLivePriceWsHub(options = {}) {
  const symbol = options.symbol || DEFAULT_SYMBOL;
  const wsEndpoint = options.wsEndpoint || DEFAULT_WS_ENDPOINT;
  const WebSocketImpl = options.WebSocketImpl || (typeof WebSocket === 'function' ? WebSocket : null);
  const getKeysFn = options.getCandidateKeys || (() => getOrderedCandidateKeys());
  const hasAnyKeysFn = options.hasAnyKeys || (() => getTwelveDataKeys().length > 0);
  const nowFn = options.now || (() => Date.now());
  const idleDisconnectMs = Number.isFinite(options.idleDisconnectMs) ? options.idleDisconnectMs : IDLE_DISCONNECT_MS;
  const heartbeatIntervalMs = Number.isFinite(options.heartbeatIntervalMs) ? options.heartbeatIntervalMs : HEARTBEAT_INTERVAL_MS;
  const baseReconnectMs = Number.isFinite(options.baseReconnectMs) ? options.baseReconnectMs : 2_000;
  const maxReconnectMs = Number.isFinite(options.maxReconnectMs) ? options.maxReconnectMs : 30_000;

  const subscribers = new Set();
  let upstream = null;
  let activeKey = '';
  let state = 'IDLE'; // IDLE | CONNECTING | CONNECTED | SUBSCRIBED | ERROR
  let statusMessage = 'Belum ada klien tersambung.';
  let lastTick = null;
  let lastTickReceivedAt = 0;
  let lastTimestamp = 0;
  let lastErrorAt = 0;
  let reconnectAttempt = 0;
  let reconnectTimer = null;
  let idleTimer = null;
  let heartbeatTimer = null;
  let totalTicks = 0;
  let connectionSeq = 0;

  function clearTimers() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function broadcast(payload) {
    for (const listener of [...subscribers]) {
      try {
        listener(payload);
      } catch (_) {
        subscribers.delete(listener);
      }
    }
  }

  function buildStatusPayload() {
    return {
      event: 'status',
      source: 'TWELVE_DATA_WEBSOCKET',
      symbol,
      status: state,
      message: statusMessage,
      connectedClients: subscribers.size,
      totalTicks,
      lastPrice: lastTick?.price ?? null,
      lastTickAt: lastTick?.timestamp ?? null,
      lastTickReceivedAt: lastTickReceivedAt || null,
      lastErrorAt: lastErrorAt || null,
      keysConfigured: hasAnyKeysFn()
    };
  }

  function setStatus(nextState, message) {
    state = nextState;
    statusMessage = message;
    if (nextState === 'ERROR') lastErrorAt = nowFn();
    broadcast(buildStatusPayload());
  }

  function closeUpstream(nextState = 'IDLE', nextMessage = 'Koneksi WebSocket ditutup.') {
    clearTimers();
    const sock = upstream;
    upstream = null;
    activeKey = '';
    if (sock) {
      try {
        if (sock.readyState === 0 || sock.readyState === 1) {
          sock.close();
        }
      } catch (_) {}
    }
    state = nextState;
    statusMessage = nextMessage;
  }

  function scheduleIdleClose() {
    if (idleTimer) clearTimeout(idleTimer);
    if (subscribers.size > 0) return;
    idleTimer = setTimeout(() => {
      idleTimer = null;
      if (subscribers.size === 0) {
        closeUpstream('IDLE', 'Tidak ada klien aktif; WebSocket diputus hemat kuota.');
      }
    }, idleDisconnectMs);
  }

  function scheduleReconnect(reasonMessage) {
    if (subscribers.size === 0) {
      closeUpstream('IDLE', 'Menunggu klien tersambung.');
      return;
    }
    if (reconnectTimer) return;
    const delay = Math.min(maxReconnectMs, baseReconnectMs * Math.pow(2, Math.min(reconnectAttempt, 4)));
    reconnectAttempt += 1;
    setStatus('ERROR', reasonMessage || `Terputus dari Twelve Data. Menyambung ulang dalam ${Math.round(delay / 1000)} dtk…`);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (subscribers.size > 0) {
        connectUpstream();
      }
    }, delay);
  }

  function connectUpstream() {
    if (upstream && (upstream.readyState === 0 || upstream.readyState === 1)) {
      return;
    }
    if (!WebSocketImpl) {
      setStatus('ERROR', 'Runtime server tidak mendukung WebSocket native.');
      return;
    }
    const candidates = getKeysFn();
    if (!candidates.length) {
      setStatus('ERROR', 'API key Twelve Data server belum dikonfigurasi.');
      return;
    }

    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    const key = candidates[0];
    activeKey = key;
    const mySeq = ++connectionSeq;
    setStatus('CONNECTING', 'Menghubungkan ke WebSocket Twelve Data (XAU/USD)…');

    let sock;
    try {
      sock = new WebSocketImpl(`${wsEndpoint}?apikey=${encodeURIComponent(key)}`);
    } catch (err) {
      markKeyFailure(key, err, nowFn());
      scheduleReconnect('Gagal membuka socket Twelve Data.');
      return;
    }

    upstream = sock;

    const handleOpen = () => {
      if (mySeq !== connectionSeq || upstream !== sock) return;
      setStatus('CONNECTED', 'Tersambung ke Twelve Data, mendaftar langganan XAU/USD…');
      try {
        sock.send(JSON.stringify({ action: 'subscribe', params: { symbols: symbol } }));
      } catch (_) {}
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        if (upstream === sock && sock.readyState === 1) {
          try {
            sock.send(JSON.stringify({ action: 'heartbeat' }));
          } catch (_) {}
        }
      }, heartbeatIntervalMs);
    };

    const handleMessage = (event) => {
      if (mySeq !== connectionSeq || upstream !== sock) return;
      let parsed;
      try {
        parsed = JSON.parse(typeof event?.data === 'string' ? event.data : String(event?.data || ''));
      } catch {
        return;
      }

      if (parsed?.event === 'heartbeat') return;

      if (parsed?.event === 'subscribe-status') {
        const sub = parseSubscribeStatus(parsed);
        if (sub && !sub.ok) {
          markKeyFailure(key, { message: sub.message, providerData: parsed }, nowFn());
          closeUpstream('ERROR', sub.message);
          scheduleReconnect(sub.message);
          return;
        }
        if (sub && sub.ok) {
          reconnectAttempt = 0;
          markKeySuccess(key);
          setStatus('SUBSCRIBED', sub.message);
        }
        return;
      }

      const tick = normalizeTwelveDataTick(parsed, {
        symbol,
        nowMs: nowFn(),
        lastTimestamp
      });
      if (!tick) return;

      // Avoid emitting exact duplicate (same price & same timestamp) within 1 second
      const now = nowFn();
      if (lastTick && lastTick.price === tick.price && lastTick.timestamp === tick.timestamp && (now - lastTickReceivedAt) < 1000) {
        return;
      }

      reconnectAttempt = 0;
      markKeySuccess(key);
      lastTimestamp = tick.timestamp;
      lastTick = tick;
      lastTickReceivedAt = now;
      totalTicks += 1;
      if (state !== 'SUBSCRIBED') {
        state = 'SUBSCRIBED';
        statusMessage = 'WebSocket Twelve Data aktif untuk XAU/USD.';
      }
      broadcast(tick);
    };

    const handleError = () => {
      if (mySeq !== connectionSeq || upstream !== sock) return;
      closeUpstream('ERROR', 'Koneksi WebSocket Twelve Data mengalami gangguan.');
      scheduleReconnect('Koneksi WebSocket Twelve Data terputus. Menyambung ulang…');
    };

    const handleClose = () => {
      if (mySeq !== connectionSeq || upstream !== sock) return;
      const prevState = state;
      const prevMsg = statusMessage;
      closeUpstream(prevState === 'ERROR' ? 'ERROR' : 'IDLE', prevMsg);
      if (subscribers.size > 0) {
        scheduleReconnect(prevState === 'ERROR' ? prevMsg : 'WebSocket Twelve Data ditutup server. Menyambung ulang…');
      }
    };

    sock.addEventListener('open', handleOpen);
    sock.addEventListener('message', handleMessage);
    sock.addEventListener('error', handleError);
    sock.addEventListener('close', handleClose);
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    subscribers.add(listener);
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }

    // Send immediate status + fresh cached tick (if available) so UI updates instantly
    try {
      listener(buildStatusPayload());
      if (lastTick && (nowFn() - lastTickReceivedAt) <= FRESH_TICK_REPLAY_TTL_MS) {
        listener(lastTick);
      }
    } catch (_) {}

    if (!upstream || (upstream.readyState !== 0 && upstream.readyState !== 1)) {
      connectUpstream();
    }

    return () => {
      subscribers.delete(listener);
      if (subscribers.size === 0) {
        scheduleIdleClose();
      }
    };
  }

  function getStatus() {
    return buildStatusPayload();
  }

  function destroy() {
    subscribers.clear();
    closeUpstream('IDLE', 'Hub dimatikan.');
  }

  return {
    subscribe,
    getStatus,
    destroy,
    getSubscriberCount: () => subscribers.size,
    getActiveKey: () => activeKey
  };
}

export function getDefaultLivePriceWsHub() {
  if (!globalThis.__amyFxLivePriceWsHub) {
    globalThis.__amyFxLivePriceWsHub = createLivePriceWsHub();
  }
  return globalThis.__amyFxLivePriceWsHub;
}
