// Server-owned shared Twelve Data WebSocket subscription (XAU/USD).
// Uses a single upstream WebSocket connection shared across concurrent SSE clients
// so Twelve Data Basic 8's 1-connection limit is never violated and the API key
// never leaves the server.
import { getDefaultLivePriceWsHub } from '../lib/live-price-ws-hub.mjs';
import { getTwelveDataKeys } from '../lib/twelvedata-key-pool.mjs';

const SERVERLESS_STREAM_LIFETIME_MS = 50_000; // Safe margin under vercel.json maxDuration: 60
const SSE_HEARTBEAT_MS = 12_000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).end();

  const keys = getTwelveDataKeys();
  const hub = getDefaultLivePriceWsHub();

  const reqUrl = new URL(req.url || '/api/live-price', 'http://localhost');
  if (reqUrl.searchParams.get('mode') === 'status') {
    return res.status(200).json({
      ok: keys.length > 0 && typeof WebSocket === 'function',
      mode: req.__amyPersistent ? 'PERSISTENT_SHARED_WS_HUB' : 'SERVERLESS_SHARED_WS_HUB',
      ...hub.getStatus()
    });
  }

  if (!keys.length || typeof WebSocket !== 'function') {
    return res.status(503).json({
      status: 'error',
      message: 'Sumber harga WebSocket server belum dikonfigurasi (TWELVEDATA_API_KEY kosong).'
    });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const persistent = Boolean(req.__amyPersistent);

  await new Promise(resolve => {
    let ended = false;
    let unsubscribe = () => {};
    let lifetimeTimer = null;

    const finish = () => {
      if (ended) return;
      ended = true;
      clearInterval(sseHeartbeat);
      if (lifetimeTimer) {
        clearTimeout(lifetimeTimer);
        lifetimeTimer = null;
      }
      res.off?.('close', finish);
      req.off?.('close', finish);
      try { unsubscribe(); } catch (_) {}
      if (!res.writableEnded) {
        try { res.end(); } catch (_) {}
      }
      resolve();
    };

    const writePayload = (payload) => {
      if (ended || res.destroyed || res.writableEnded) return;
      try {
        const ok = res.write(`data: ${JSON.stringify(payload)}\n\n`);
        if (ok === false) {
          // Backpressure: wait for drain rather than dropping immediately unless destroyed
        }
      } catch (_) {
        finish();
      }
    };

    const sseHeartbeat = setInterval(() => {
      if (ended || res.destroyed || res.writableEnded) return;
      try {
        res.write(': heartbeat\n\n');
      } catch (_) {
        finish();
      }
    }, SSE_HEARTBEAT_MS);

    if (!persistent) {
      // On Vercel Serverless, close cleanly before maxDuration so browser EventSource reconnects seamlessly.
      lifetimeTimer = setTimeout(finish, SERVERLESS_STREAM_LIFETIME_MS);
    }

    res.on?.('close', finish);
    req.on?.('close', finish);
    unsubscribe = hub.subscribe(writePayload);
  });
}
