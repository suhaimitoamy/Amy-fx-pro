/**
 * Amy FX Pro — Live Macro Snapshot Serverless Endpoint (/api/macro-snapshot)
 * Fetches real-time/latest market telemetry for XAU/USD fundamental drivers:
 *   - DXY (US Dollar Index: DX-Y.NYB)
 *   - US 10Y Treasury Yield (^TNX)
 *   - CBOE VIX Volatility Index (^VIX)
 *   - Gold Futures (GC=F) & Silver Futures (SI=F) for intermarket / SMT verification
 * Never fabricates fallback prices; returns null per symbol if upstream is unavailable.
 */

const SYMBOLS = [
  { key: 'dxy', symbol: 'DX-Y.NYB', label: 'DXY' },
  { key: 'us10y', symbol: '^TNX', label: 'US 10Y' },
  { key: 'vix', symbol: '^VIX', label: 'VIX' },
  { key: 'gold', symbol: 'GC=F', label: 'Gold' },
  { key: 'silver', symbol: 'SI=F', label: 'Silver' }
];

let memoryCache = { payload: null, savedAt: 0 };
const MEMORY_TTL_MS = 45 * 1000;

export function parseYahooChartResult(rawJson, key) {
  const result = rawJson?.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta) return null;

  const price = Number(meta.regularMarketPrice);
  const closesRaw = result?.indicators?.quote?.[0]?.close;
  const validCloses = Array.isArray(closesRaw)
    ? closesRaw.map(Number).filter(n => Number.isFinite(n) && n > 0)
    : [];

  // Prefer the previous session close from valid daily bars when available; fallback to chartPreviousClose
  let prevClose = Number(meta.previousClose ?? meta.chartPreviousClose);
  if (validCloses.length >= 2) {
    const lastBar = validCloses[validCloses.length - 1];
    const priorBar = validCloses[validCloses.length - 2];
    if (Number.isFinite(priorBar) && Math.abs(lastBar - price) / Math.max(1, price) < 0.05) {
      prevClose = priorBar;
    }
  }

  if (!Number.isFinite(price) || price <= 0) return null;

  const hasPrev = Number.isFinite(prevClose) && prevClose > 0;
  const change = hasPrev ? Number((price - prevClose).toFixed(4)) : 0;
  const changePct = hasPrev ? Number((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0;
  const changeBps = key === 'us10y' && hasPrev ? Number(((price - prevClose) * 100).toFixed(1)) : null;

  const sparkline = validCloses.slice(-10).map(n => Number(n.toFixed(4)));
  if (sparkline.length === 0 || Math.abs(sparkline[sparkline.length - 1] - price) > 1e-6) {
    sparkline.push(Number(price.toFixed(4)));
  }

  const marketTime = Number(meta.regularMarketTime);
  return {
    symbol: meta.symbol || key,
    price: Number(price.toFixed(key === 'us10y' ? 3 : (key === 'dxy' ? 3 : 2))),
    prevClose: hasPrev ? Number(prevClose.toFixed(key === 'us10y' ? 3 : (key === 'dxy' ? 3 : 2))) : null,
    change,
    changePct,
    ...(changeBps !== null ? { changeBps } : {}),
    sparkline,
    marketTime: Number.isFinite(marketTime) && marketTime > 0 ? marketTime * 1000 : null,
    marketState: meta.marketState || null
  };
}

async function fetchYahooSymbol(entry, timeoutMs = 4500) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(entry.symbol)}?interval=1d&range=10d`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json'
      }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return parseYahooChartResult(json, entry.key);
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchLiveMacroSnapshot() {
  const settled = await Promise.all(SYMBOLS.map(async entry => [entry.key, await fetchYahooSymbol(entry)]));
  const quotes = Object.fromEntries(settled);
  const availableCount = Object.values(quotes).filter(Boolean).length;
  return {
    ok: availableCount > 0,
    updatedAt: new Date().toISOString(),
    source: availableCount > 0 ? 'yahoo_finance_live' : 'unavailable',
    availableCount,
    totalCount: SYMBOLS.length,
    quotes
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  const force = String(req.query?.force || '') === '1';
  if (!force && memoryCache.payload && Date.now() - memoryCache.savedAt < MEMORY_TTL_MS) {
    return res.status(200).json({ ...memoryCache.payload, cached: true });
  }

  const payload = await fetchLiveMacroSnapshot();
  if (payload.ok) {
    memoryCache = { payload, savedAt: Date.now() };
  }
  return res.status(200).json({ ...payload, cached: false });
}
