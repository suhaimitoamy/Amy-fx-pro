import { getCandles } from '../lib/market-candle-store.mjs';
import { inspectProviderPayload, buildProviderErrorBody } from '../lib/provider-error-guard.mjs';

/**
 * Amy FX — Liquidity/Swing Tracker API
 * Reads the same Supabase-first candle stream used by Mapping and Heatmap.
 */
const liquidityMemoryCache = globalThis.__amyFxLiquidityCache
  || (globalThis.__amyFxLiquidityCache = new Map());
const LIQUIDITY_STALE_MAX_MS = 30 * 60 * 1000;

function readLiquidityFallback(key) {
  const entry = liquidityMemoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > LIQUIDITY_STALE_MAX_MS) {
    liquidityMemoryCache.delete(key);
    return null;
  }
  return entry.payload;
}

function writeLiquidityFallback(key, payload) {
  liquidityMemoryCache.set(key, { storedAt: Date.now(), payload });
  if (liquidityMemoryCache.size > 16) {
    const oldestKey = liquidityMemoryCache.keys().next().value;
    if (oldestKey) liquidityMemoryCache.delete(oldestKey);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ levels: [], error: 'method_not_allowed' });

  const { symbol = 'XAU/USD', interval = '15min', outputsize = '200' } = req.query;
  const cacheKey = `${symbol}|${interval}`;

  try {
    if (symbol !== 'XAU/USD') {
      return res.status(403).json({ levels: [], error: 'symbol_not_allowed' });
    }

    const safeSize = Math.min(Math.max(Number.parseInt(String(outputsize), 10) || 200, 20), 5_000);
    const marketData = await getCandles({
      symbol,
      interval,
      outputsize: safeSize,
      apiKey: process.env.TWELVEDATA_API_KEYS || process.env.TWELVEDATA_API_KEY
    });
    const inspected = inspectProviderPayload(marketData);
    if (!inspected.ok && inspected.code >= 400) {
      const stale = readLiquidityFallback(cacheKey);
      if (stale) {
        res.setHeader('X-AmyFX-Market-Source', 'liquidity-stale-fallback');
        return res.status(200).json({
          ...stale,
          staleFallback: true,
          rateLimited: inspected.isRateLimited,
          warning: inspected.message
        });
      }
      return res.status(inspected.isRateLimited ? 429 : 502).json(
        buildProviderErrorBody(inspected, {
          currentPrice: null,
          updated: new Date().toISOString(),
          levels: []
        })
      );
    }
    const candles = normalizeCandles(marketData?.values);

    if (!candles.length) {
      return res.status(200).json({
        currentPrice: null,
        updated: new Date().toISOString(),
        levels: [],
        source: marketData?.source || 'unavailable',
        error: 'no_data'
      });
    }

    const currentPrice = candles.at(-1).close;
    const levels = trackLiquidity(candles);

    const payload = {
      currentPrice,
      updated: new Date().toISOString(),
      sourceCandleTime: candles.at(-1)?.time || null,
      source: marketData?.source || 'unknown',
      cacheState: marketData?.amyfxCacheState || 'UNKNOWN',
      levels
    };
    writeLiquidityFallback(cacheKey, payload);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.setHeader('X-AmyFX-Market-Source', marketData?.source || 'unknown');
    return res.status(200).json(payload);
  } catch (error) {
    console.error('liquidity provider failed', error);
    const stale = readLiquidityFallback(cacheKey);
    if (stale) {
      res.setHeader('X-AmyFX-Market-Source', 'liquidity-stale-fallback');
      return res.status(200).json({
        ...stale,
        staleFallback: true,
        warning: error?.message || 'Market data unavailable'
      });
    }
    return res.status(502).json({
      currentPrice: null,
      updated: new Date().toISOString(),
      levels: [],
      error: 'provider_failed',
      message: error?.message || 'Market data unavailable'
    });
  }
}

function normalizeCandles(values) {
  return [...(Array.isArray(values) ? values : [])]
    .reverse()
    .map(candle => ({
      time: candle.datetime,
      open: Number(candle.open),
      high: Number(candle.high),
      low: Number(candle.low),
      close: Number(candle.close)
    }))
    .filter(candle => [candle.open, candle.high, candle.low, candle.close].every(Number.isFinite));
}

function detectSwings(candles) {
  const swingWindow = 2;
  const swings = { highs: [], lows: [] };

  for (let index = swingWindow; index < candles.length - swingWindow; index += 1) {
    const candle = candles[index];
    let isHigh = true;
    let isLow = true;

    for (let distance = 1; distance <= swingWindow; distance += 1) {
      if (candle.high <= candles[index - distance].high || candle.high <= candles[index + distance].high) isHigh = false;
      if (candle.low >= candles[index - distance].low || candle.low >= candles[index + distance].low) isLow = false;
    }

    if (isHigh) swings.highs.push({ price: candle.high, index });
    if (isLow) swings.lows.push({ price: candle.low, index });
  }

  return swings;
}

function trackLiquidity(candles) {
  const swings = detectSwings(candles);
  const currentPrice = candles.at(-1).close;

  const buildLevel = (swing, type) => {
    const swept = candles.slice(swing.index + 1).some(candle =>
      type === 'BSL' ? candle.high > swing.price : candle.low < swing.price
    );
    return {
      price: Math.round(swing.price * 100) / 100,
      type,
      swept,
      candlesAgo: candles.length - 1 - swing.index,
      distance: Math.round((swing.price - currentPrice) * 100) / 100
    };
  };

  return [
    ...swings.highs.map(swing => buildLevel(swing, 'BSL')),
    ...swings.lows.map(swing => buildLevel(swing, 'SSL'))
  ]
    .filter(level => !level.swept)
    .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance))
    .slice(0, 15);
}
