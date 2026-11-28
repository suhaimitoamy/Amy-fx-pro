import { buildMarketContext, isGoldMarketOpen, synthesizeD1FromH1 } from '../lib/scalper-engine/market-context.mjs';
import { evaluateSixDrivers, SIX_ENGINE_VERSION } from '../lib/scalper-engine/six-drivers.mjs';
import { baseVisuals } from '../lib/scalper-engine/amy-ict.mjs';

let cachePayload = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60000; // 1-minute in-memory cache (twelvedata route already caches candles)

function isWeekendClosure(timeSec) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hourCycle: 'h23', hour: '2-digit', minute: '2-digit', weekday: 'short'
    }).formatToParts(new Date(timeSec * 1000));
    const values = Object.fromEntries(parts.map(x => [x.type, x.value]));
    const weekday = values.weekday, hour = Number(values.hour) + Number(values.minute) / 60;
    if (weekday === 'Sat') return true;
    if (weekday === 'Sun') return hour < 17;
    if (weekday === 'Fri') return hour >= 17;
    return false;
  } catch (_) {
    const d = new Date(timeSec * 1000), day = d.getUTCDay();
    return day === 6 || day === 0;
  }
}

function convertCandles(vals, dur, maxBars = 200) {
  const list = Array.isArray(vals) ? vals : (vals && Array.isArray(vals.values) ? vals.values : []);
  const mapped = [];
  for (const v of list) {
    if (!v || v.amyfxSyntheticCurrent || v.synthetic) continue;
    const rawDt = String(v.datetime || '').trim();
    const dt = !rawDt
      ? new Date().toISOString()
      : (/Z$|[+-]\d{2}:?\d{2}$/.test(rawDt) ? rawDt : `${rawDt.replace(' ', 'T')}Z`);
    const openTime = Math.floor(new Date(dt).getTime() / 1000);
    if (!Number.isFinite(openTime) || openTime <= 0) continue;
    if (dur < 86400 && isWeekendClosure(openTime)) continue;
    mapped.push({
      open_time: openTime,
      close_time: openTime + dur,
      open: parseFloat(v.open) || 0,
      high: parseFloat(v.high) || 0,
      low: parseFloat(v.low) || 0,
      close: parseFloat(v.close) || 0,
      is_closed: true
    });
  }
  return mapped.reverse().slice(-maxBars);
}

async function fetchWithAbort(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return await res.json();
  } catch (_) {
    return {};
  } finally {
    clearTimeout(timer);
  }
}

function extractActivePoiList(context, m15Candles, m5Candles) {
  const list = [];
  const seen = new Set();

  function addZone(z, tf) {
    if (!z) return;
    const isBreaker = Boolean(z.breaker && !z.removed);
    const side = isBreaker
      ? (String(z.side || '').toUpperCase() === 'BUY' ? 'SELL' : 'BUY')
      : String(z.side || '').toUpperCase();
    if (side !== 'BUY' && side !== 'SELL') return;
    const kind = isBreaker ? 'BB' : String(z.kind || 'FVG').toUpperCase();
    const low = Number(z.low ?? z.bot);
    const high = Number(z.high ?? z.top);
    if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) return;
    const width = high - low;
    if (width < 0.8 || width > 12.0) return;
    if (!isBreaker && (z.status === 4 || z.lifecycle === 'BROKEN')) return;

    const id = `POI_${side}_${tf}_${kind}_${low.toFixed(2)}_${high.toFixed(2)}`;
    if (seen.has(id)) return;
    seen.add(id);

    const isSell = side === 'SELL';
    const isM5 = tf === 'M5';
    const ce = Number((z.ce ?? ((low + high) / 2)).toFixed(2));
    const targetDist = isM5
      ? Math.max(6.0, Math.min(8.0, 6.0 + width * 0.55))
      : Math.max(7.0, Math.min(10.0, 7.0 + width * 0.60));
    let slRaw = isSell ? (ce + targetDist) : (ce - targetDist);
    if (isSell && slRaw < high + 0.80) slRaw = high + 0.80;
    else if (!isSell && slRaw > low - 0.80) slRaw = low - 0.80;
    const sl = Number(slRaw.toFixed(2));
    const risk = Math.max(6.0, Math.abs(ce - sl));
    const minTp1 = isM5 ? 9.0 : 10.5;
    const minTp2 = isM5 ? 15.0 : 17.5;
    const tp1 = Number((isSell ? ce - Math.max(risk * 1.5, minTp1) : ce + Math.max(risk * 1.5, minTp1)).toFixed(2));
    const tp2 = Number((isSell ? ce - Math.max(risk * 2.5, minTp2) : ce + Math.max(risk * 2.5, minTp2)).toFixed(2));

    list.push({
      id,
      side,
      tf,
      kind,
      low: Number(low.toFixed(2)),
      high: Number(high.toFixed(2)),
      ce,
      sl,
      tp1,
      tp2
    });
  }

  if (context?.amy?.dashboard?.poi) {
    addZone(context.amy.dashboard.poi, 'M15');
  }

  const m15Zones = context?.amy?.dashboard?.zones;
  if (m15Zones) {
    for (const k of ['bullFvg', 'bearFvg', 'bullOb', 'bearOb']) {
      if (m15Zones[k]) addZone(m15Zones[k], 'M15');
    }
  }

  const m15Vis = context?.amy?.visuals;
  if (m15Vis) {
    if (Array.isArray(m15Vis.fvg)) {
      for (const z of m15Vis.fvg.slice(-8)) addZone(z, 'M15');
    }
    if (Array.isArray(m15Vis.implied)) {
      for (const z of m15Vis.implied.slice(-6)) addZone({ ...z, kind: 'iFVG' }, 'M15');
    }
    if (Array.isArray(m15Vis.ob)) {
      for (const z of m15Vis.ob.slice(-8)) addZone(z, 'M15');
    }
  }

  try {
    if (Array.isArray(m5Candles) && m5Candles.length >= 20) {
      const m5Vis = baseVisuals(m5Candles);
      if (Array.isArray(m5Vis.fvg)) {
        for (const z of m5Vis.fvg.slice(-8)) addZone(z, 'M5');
      }
      if (Array.isArray(m5Vis.implied)) {
        for (const z of m5Vis.implied.slice(-6)) addZone({ ...z, kind: 'iFVG' }, 'M5');
      }
      if (Array.isArray(m5Vis.ob)) {
        for (const z of m5Vis.ob.slice(-8)) addZone(z, 'M5');
      }
    }
  } catch (_) {}

  return list;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, x-amy-device-token');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const now = Date.now();
  if (cachePayload && (now - cacheTime < CACHE_TTL_MS)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    res.status(200).json(cachePayload);
    return;
  }

  try {
    const host = req?.headers?.host || (process.env.VERCEL_URL ? process.env.VERCEL_URL : 'amy-fx.vercel.app');
    const protocol = host.startsWith('localhost') || host.startsWith('127.') || host.startsWith('10.') || host.startsWith('192.') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const nowSec = Math.floor(now / 1000);
    const closedOrWeekend = !isGoldMarketOpen(nowSec) || isWeekendClosure(nowSec - 12 * 3600);
    const size15 = closedOrWeekend ? 350 : 160;
    const size5 = closedOrWeekend ? 800 : 160;
    const size60 = closedOrWeekend ? 200 : 168;
    const [res15, res5, res60, resD1, calRes] = await Promise.all([
      fetchWithAbort(`${baseUrl}/api/twelvedata?symbol=XAU/USD&interval=15min&outputsize=${size15}`),
      fetchWithAbort(`${baseUrl}/api/twelvedata?symbol=XAU/USD&interval=5min&outputsize=${size5}`),
      fetchWithAbort(`${baseUrl}/api/twelvedata?symbol=XAU/USD&interval=1h&outputsize=${size60}`),
      fetchWithAbort(`${baseUrl}/api/twelvedata?symbol=XAU/USD&interval=1day&outputsize=10`),
      fetchWithAbort(`${baseUrl}/api/calendar`)
    ]);

    const m15 = convertCandles(res15?.values || res15, 900, 180);
    const m5 = convertCandles(res5?.values || res5, 300, 180);
    const h1 = convertCandles(res60?.values || res60, 3600, 180);
    let d1 = convertCandles(resD1?.values || resD1, 86400, 180);
    if ((!d1 || !d1.length) && h1 && h1.length >= 12) {
      d1 = synthesizeD1FromH1(h1, nowSec);
    }

    // Jika TwelveData gagal / rate limit (429) dan candle tidak lengkap, gunakan cachePayload jika ada
    if ((!m15.length || !h1.length) && cachePayload) {
      console.warn('scalper-setups: Incomplete candle data from TwelveData (rate limit / error), serving stale cachePayload');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      res.status(200).json({
        ...cachePayload,
        staleFallback: true,
        warning: 'TwelveData rate limit / temporary failure, serving cached setups'
      });
      return;
    }

    const calendar = Array.isArray(calRes) ? calRes : (Array.isArray(calRes?.events) ? calRes.events : []);

    const context = buildMarketContext({ h1, m15, m5, d1, calendar, nowSeconds: nowSec });
    const driverEvaluation = evaluateSixDrivers({ m15, m5, h1, d1, context, nowSeconds: nowSec });

    const poiList = extractActivePoiList(context, m15, m5);
    context.poiList = poiList;
    if (context.amy) context.amy.poiList = poiList;

    // 15-minute high/low envelope so background workers never miss intrabar touches between M15 polls
    const latestM15Bar = m15.at(-1) || null;
    const recentM5Bars = m5.slice(-3);
    const recentHighs = [latestM15Bar?.high, ...recentM5Bars.map(c => c?.high)].filter(v => Number.isFinite(v) && v > 0);
    const recentLows = [latestM15Bar?.low, ...recentM5Bars.map(c => c?.low)].filter(v => Number.isFinite(v) && v > 0);
    if (recentHighs.length && recentLows.length) {
      const recentWindow = {
        high: Number(Math.max(...recentHighs).toFixed(2)),
        low: Number(Math.min(...recentLows).toFixed(2)),
        fromTime: recentM5Bars[0]?.open_time || latestM15Bar?.open_time || null,
        toTime: recentM5Bars.at(-1)?.close_time || latestM15Bar?.close_time || null
      };
      context.recentWindow = recentWindow;
      if (context.amy) context.amy.recentWindow = recentWindow;
    }

    const isMarketClosed = context.session === 'PASAR TUTUP' || !isGoldMarketOpen(nowSec);
    const active = [];
    if (!isMarketClosed) {
      // 1. Sinyal engine legacy (amy_entry_v3 / Pullback CISD) dinonaktifkan permanen
      // Sistem notifikasi kini 100% didedikasikan untuk siklus POI M5 & M15 (FVG & OB)

      // 2. Evaluasi Six Drivers Turnamen
      for (const driver of driverEvaluation.drivers || []) {
        if (driver.plan && (driver.state === 'CONFIRMED' || driver.state === 'ARMED' || driver.state === 'WAITING_M5_BREAK')) {
          const formedAtSec = driver.plan.formedAt ? Math.floor(new Date(driver.plan.formedAt).getTime() / 1000) : (m15.at(-1)?.close_time || m15[0]?.close_time || nowSec);
          const setupId = driver.setupId || `${driver.id}_${driver.plan.direction}_${formedAtSec}`;
          const isConfirmed = driver.state === 'CONFIRMED';
          const actualEntry = isConfirmed && driver.plan.confirmedEntry
            ? driver.plan.confirmedEntry
            : driver.plan.entry;
          const actualRisk = Math.abs(actualEntry - driver.plan.stopLoss);
          const dirSign = driver.plan.direction === 'BUY' ? 1 : -1;
          const actualTarget = isConfirmed && actualRisk > 0
            ? Math.round((actualEntry + dirSign * actualRisk * driver.rr) * 10000) / 10000
            : driver.plan.target;

          // Cek apakah harga saat ini sudah mencapai/menyentuh entry limit
          const curPrice = m5.at(-1)?.close || m15.at(-1)?.close || null;
          const isLimitTriggered = !isConfirmed && curPrice != null && actualEntry != null && (
            (driver.plan.direction === 'BUY' && curPrice <= actualEntry && curPrice > driver.plan.stopLoss) ||
            (driver.plan.direction === 'SELL' && curPrice >= actualEntry && curPrice < driver.plan.stopLoss)
          );
          const finalStatus = isConfirmed || isLimitTriggered ? 'ACTIVE' : 'WAITING_TRIGGER';

          active.push({
            id: setupId,
            engineVersion: SIX_ENGINE_VERSION,
            schemaVersion: 3,
            model: driver.id,
            driverId: driver.id,
            driverName: driver.name,
            timeframe: 'M15',
            symbol: 'XAU/USD',
            direction: driver.plan.direction,
            status: finalStatus,
            recommendationStatus: 'VALID',
            entry: actualEntry,
            stopLoss: driver.plan.stopLoss,
            sl: driver.plan.stopLoss,
            target: actualTarget,
            tp1: actualTarget,
            target2: driver.plan.tp2 || null,
            tp2: driver.plan.tp2 || null,
            realRr: driver.plan.rrReal || driver.rr,
            limitEntry: driver.plan.entry,
            marketEntry: driver.plan.marketEntry || actualEntry,
            dualEntry: driver.plan.dualEntry || null,
            risk: actualRisk > 0 ? Math.round(actualRisk * 100) / 100 : 1.5,
            priority: isConfirmed ? 2 : (isLimitTriggered ? 2 : 3),
            note: isConfirmed
              ? 'Konfirmasi M5 close terpicu · Market Execution'
              : (isLimitTriggered
                  ? 'Harga menyentuh level limit · Posisi berjalan'
                  : (driver.state === 'WAITING_M5_BREAK'
                      ? 'Retest zona tercapai · Menunggu break M5'
                      : `Menunggu pullback ke zona OTE [${driver.plan.zoneLow} – ${driver.plan.zoneHigh}]`)),
            createdAt: driver.plan.formedAt || new Date(formedAtSec * 1000).toISOString()
          });
        }
      }

      active.sort((a, b) => (a.priority || 99) - (b.priority || 99));
    }

    const payload = {
      ok: true,
      mode: 'market_context',
      context,
      event: context.event || null,
      generatedAt: new Date(nowSec * 1000).toISOString(),
      primary: active[0] || null,
      driverEvaluation,
      enabledDrivers: {},
      active,
      history: [],
      recent: [],
      historyCount: 0,
      limits: { recommendedActive: null, riskUnits: null, history: 100 },
      engine: {
        status: 'COMPLETED',
        completed_at: new Date(nowSec * 1000).toISOString(),
        result: {
          engine: 'amyfx-gold-context-v1',
          driverEvaluation,
          context,
          news: context.news,
          event: context.event || null
        }
      }
    };

    cachePayload = payload;
    cacheTime = now;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    res.status(200).json(payload);
  } catch (err) {
    console.error('scalper-setups error:', err);
    if (cachePayload) {
      console.warn('scalper-setups: Recovering with cached payload after error');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      res.status(200).json({
        ...cachePayload,
        staleFallback: true,
        warning: 'Engine error, serving cached setups'
      });
      return;
    }
    res.status(500).json({
      error: 'scalper_setups_failed',
      detail: String(err?.message || err)
    });
  }
}
