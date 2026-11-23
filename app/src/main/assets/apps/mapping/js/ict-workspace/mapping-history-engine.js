/**
 * Pure Mapping Reaction Timeline & POI Outcome Tracker Engine
 * - Auto-backfills recent POI touches/outcomes, Liquidity Sweeps, BOS/MSS, and Key Level hits from M15/M5 candles.
 * - Tracks live real-time POI lifecycle (TESTING -> REACTING -> TP1_HIT -> TP2_HIT / SL_HIT) with 7-day persistence.
 * - Zero DOM dependencies so all logic is deterministically unit-tested via node:test.
 */

export const HISTORY_STORAGE_KEY = 'amyfx.mapping.reaction_history.v1';
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_RETENTION_MS = 180 * 24 * 60 * 60 * 1000; // 180 hari detail penuh POI
export const TIMELINE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari timeline market
export const MAX_POI_RECORDS = 3000;
export const MAX_TIMELINE_EVENTS = 400;

const num = v => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : NaN;
};

const fmt = v => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v).toFixed(2) : '—');

export function witaDateKey(tsMs) {
  const d = new Date(tsMs);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(d);
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export function formatWitaClock(tsMs, includeDate = false) {
  const d = new Date(tsMs);
  if (Number.isNaN(d.getTime())) return '—';
  const timeStr = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d).replace('.', ':');
  if (!includeDate) return `${timeStr} WITA`;
  const dateStr = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit',
    month: 'short'
  }).format(d);
  return `${dateStr} · ${timeStr}`;
}

export function makePoiId(side, tf, kind, low, high) {
  return `POI:${String(tf || 'M15').toUpperCase()}:${String(kind || 'FVG').toUpperCase()}:${String(side || 'BUY').toUpperCase()}:${Number(low).toFixed(1)}-${Number(high).toFixed(1)}`;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const SHORT_MONTH_NAMES_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function createEmptyHistoryState() {
  return {
    version: 2,
    poiRecords: [],
    timelineEvents: [],
    dailyArchive: {}
  };
}

function normalizeArchiveEntry(dateKey, raw) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !raw || typeof raw !== 'object') return null;
  const tp2 = Math.max(0, Math.round(Number(raw.tp2) || 0));
  const tp1 = Math.max(0, Math.round(Number(raw.tp1) || 0));
  const sl = Math.max(0, Math.round(Number(raw.sl) || 0));
  const reacting = Math.max(0, Math.round(Number(raw.reacting) || 0));
  const testing = Math.max(0, Math.round(Number(raw.testing) || 0));
  const total = Math.max(tp2 + tp1 + sl + reacting + testing, Math.round(Number(raw.total) || 0));
  const wins = tp2 + tp1;
  const resolved = wins + sl;
  const respectRate = resolved > 0
    ? Math.round((wins / resolved) * 100)
    : (total > 0 ? Math.round(((wins + reacting) / total) * 100) : null);

  return {
    date: dateKey,
    total,
    tp2,
    tp1,
    sl,
    reacting,
    testing,
    wins,
    resolved,
    respectRate,
    m15Total: Math.max(0, Math.round(Number(raw.m15Total) || 0)),
    m15Wins: Math.max(0, Math.round(Number(raw.m15Wins) || 0)),
    m15Sl: Math.max(0, Math.round(Number(raw.m15Sl) || 0)),
    m5Total: Math.max(0, Math.round(Number(raw.m5Total) || 0)),
    m5Wins: Math.max(0, Math.round(Number(raw.m5Wins) || 0)),
    m5Sl: Math.max(0, Math.round(Number(raw.m5Sl) || 0)),
    fvgTotal: Math.max(0, Math.round(Number(raw.fvgTotal) || 0)),
    obTotal: Math.max(0, Math.round(Number(raw.obTotal) || 0)),
    updatedAt: Number(raw.updatedAt) || 0
  };
}

function normalizeDailyArchiveMap(rawArchive) {
  const out = {};
  if (!rawArchive || typeof rawArchive !== 'object' || Array.isArray(rawArchive)) return out;
  for (const [k, v] of Object.entries(rawArchive)) {
    const entry = normalizeArchiveEntry(k, v);
    if (entry && entry.total > 0) out[k] = entry;
  }
  return out;
}

export function summarizePoiDayFromRecords(records, dateKey = '') {
  let tp2 = 0;
  let tp1 = 0;
  let sl = 0;
  let reacting = 0;
  let testing = 0;
  let m15Total = 0;
  let m15Wins = 0;
  let m15Sl = 0;
  let m5Total = 0;
  let m5Wins = 0;
  let m5Sl = 0;
  let fvgTotal = 0;
  let obTotal = 0;
  let updatedAt = 0;

  for (const r of records || []) {
    if (!r) continue;
    const isWin = r.status === 'TP2_HIT' || r.status === 'TP1_HIT';
    const isSl = r.status === 'SL_HIT';
    if (r.status === 'TP2_HIT') tp2 += 1;
    else if (r.status === 'TP1_HIT') tp1 += 1;
    else if (isSl) sl += 1;
    else if (r.status === 'REACTING') reacting += 1;
    else testing += 1;

    const tf = String(r.tf || 'M15').toUpperCase();
    if (tf === 'M5') {
      m5Total += 1;
      if (isWin) m5Wins += 1;
      else if (isSl) m5Sl += 1;
    } else {
      m15Total += 1;
      if (isWin) m15Wins += 1;
      else if (isSl) m15Sl += 1;
    }

    const kind = String(r.kind || '').toUpperCase();
    if (kind === 'OB') obTotal += 1;
    else fvgTotal += 1;

    const ts = Math.max(Number(r.resolvedAt) || 0, Number(r.lastTouchAt) || 0, Number(r.touchedAt) || 0);
    if (ts > updatedAt) updatedAt = ts;
  }

  const total = tp2 + tp1 + sl + reacting + testing;
  const wins = tp2 + tp1;
  const resolved = wins + sl;
  const respectRate = resolved > 0
    ? Math.round((wins / resolved) * 100)
    : (total > 0 ? Math.round(((wins + reacting) / total) * 100) : null);

  return {
    date: dateKey,
    total,
    tp2,
    tp1,
    sl,
    reacting,
    testing,
    wins,
    resolved,
    respectRate,
    m15Total,
    m15Wins,
    m15Sl,
    m5Total,
    m5Wins,
    m5Sl,
    fvgTotal,
    obTotal,
    updatedAt
  };
}

function pickRicherDayArchive(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (b.total > a.total) return b;
  if (a.total > b.total) return a;
  if (b.resolved > a.resolved) return b;
  if (a.resolved > b.resolved) return a;
  return (b.updatedAt || 0) >= (a.updatedAt || 0) ? b : a;
}

/**
 * Rebuild permanent dailyArchive by folding all active/pruned POI records into daily summaries
 * while preserving historical archived days whose raw POI records have aged past 180 days.
 */
export function rebuildDailyArchive(poiRecords = [], existingArchive = {}, evictedRecords = []) {
  const archive = normalizeDailyArchiveMap(existingArchive);

  // Fold any newly evicted (>180d or over-cap) records before they are dropped
  if (Array.isArray(evictedRecords) && evictedRecords.length > 0) {
    const evictedByDate = new Map();
    for (const r of evictedRecords) {
      const key = witaDateKey(Number(r?.touchedAt));
      if (!key) continue;
      if (!evictedByDate.has(key)) evictedByDate.set(key, []);
      evictedByDate.get(key).push(r);
    }
    for (const [dateKey, list] of evictedByDate.entries()) {
      const summary = summarizePoiDayFromRecords(list, dateKey);
      archive[dateKey] = pickRicherDayArchive(archive[dateKey], summary);
    }
  }

  // Recompute summaries for days that currently have detailed POI records
  const byDate = new Map();
  for (const r of poiRecords || []) {
    const key = witaDateKey(Number(r?.touchedAt));
    if (!key) continue;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(r);
  }
  for (const [dateKey, list] of byDate.entries()) {
    const summary = summarizePoiDayFromRecords(list, dateKey);
    // Keep live computation canonical for days with full records, unless existing archive had even more (e.g. synced overflow)
    archive[dateKey] = archive[dateKey] && archive[dateKey].total > summary.total
      ? archive[dateKey]
      : summary;
  }

  return archive;
}

export function loadHistoryState(storage) {
  if (!storage) return createEmptyHistoryState();
  try {
    const raw = storage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return createEmptyHistoryState();
    const parsed = JSON.parse(raw);
    const poiRecords = Array.isArray(parsed?.poiRecords) ? parsed.poiRecords : [];
    const timelineEvents = Array.isArray(parsed?.timelineEvents) ? parsed.timelineEvents : [];
    const dailyArchive = rebuildDailyArchive(poiRecords, parsed?.dailyArchive || {});
    return {
      version: 2,
      poiRecords,
      timelineEvents,
      dailyArchive
    };
  } catch {
    return createEmptyHistoryState();
  }
}

function compactPoiForStorage(rec, keepTouches) {
  if (!rec || typeof rec !== 'object') return rec;
  if (keepTouches || !Array.isArray(rec.touches) || rec.touches.length === 0) return rec;
  const copy = { ...rec };
  delete copy.touches;
  return copy;
}

export function saveHistoryState(storage, state) {
  if (!storage || !state) return;
  const nowMs = Date.now();
  const compactCutoff = nowMs - SEVEN_DAYS_MS;
  const poiRecords = (state.poiRecords || [])
    .slice(0, MAX_POI_RECORDS)
    .map(r => compactPoiForStorage(r, Number(r?.touchedAt) >= compactCutoff));
  const timelineEvents = (state.timelineEvents || []).slice(0, MAX_TIMELINE_EVENTS);
  const dailyArchive = rebuildDailyArchive(poiRecords, state.dailyArchive || {});

  const payload = {
    version: 2,
    poiRecords,
    timelineEvents,
    dailyArchive
  };

  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Fallback if localStorage quota is tight: trim timeline & strip touches while keeping full dailyArchive
    try {
      const lean = {
        version: 2,
        poiRecords: poiRecords.slice(0, 1000).map(r => compactPoiForStorage(r, false)),
        timelineEvents: timelineEvents.slice(0, 120),
        dailyArchive
      };
      storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(lean));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }
}

function normalizeCandles(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map(c => {
      const openTime = Number(c.open_time ?? c.time);
      const closeTime = Number(c.close_time) || (openTime > 0 ? openTime + 300 : NaN);
      return {
        openTime,
        closeTime,
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close)
      };
    })
    .filter(c => Number.isFinite(c.openTime) && Number.isFinite(c.high) && Number.isFinite(c.low) && Number.isFinite(c.close))
    .sort((a, b) => a.openTime - b.openTime);
}

/**
 * Evaluate a single zone chronologically across subsequent closed candles (conservative SL-first).
 */
export function evaluateZoneLifecycleOnCandles(zone, candles, lookbackMs, nowMs) {
  const isSell = zone.side === 'SELL';
  const lo = num(zone.low);
  const hi = num(zone.high);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return null;

  const ce = num(zone.ce) || (lo + hi) / 2;
  const formedTimeSec = Number(zone.startTime || zone.time || 0);
  const formedIdx = Number.isInteger(zone.formedIndex) ? zone.formedIndex : -1;

  // Start checking strictly AFTER the zone formation candle
  const startIdx = formedIdx >= 0
    ? formedIdx + 1
    : candles.findIndex(c => c.openTime > formedTimeSec);
  if (startIdx < 0 || startIdx >= candles.length) return null;

  // Find first candle touching [lo - 0.15, hi + 0.15]
  let touchIdx = -1;
  for (let i = startIdx; i < candles.length; i += 1) {
    const c = candles[i];
    const touched = isSell ? (c.high >= lo - 0.15 && c.low <= hi + 0.5) : (c.low <= hi + 0.15 && c.high >= lo - 0.5);
    if (touched) {
      touchIdx = i;
      break;
    }
  }
  if (touchIdx < 0) return null;

  const touchBar = candles[touchIdx];
  const touchedAt = touchBar.openTime * 1000;
  if (nowMs - touchedAt > lookbackMs) return null;

  // Accurate entry touch price based on direction of approach into [lo, hi]
  let touchPrice;
  if (touchBar.open >= lo && touchBar.open <= hi) {
    touchPrice = touchBar.open;
  } else if (isSell && touchBar.open < lo) {
    touchPrice = lo;
  } else if (!isSell && touchBar.open > hi) {
    touchPrice = hi;
  } else {
    touchPrice = isSell
      ? Math.min(Math.max(touchBar.open, lo), hi)
      : Math.max(Math.min(touchBar.open, hi), lo);
  }

  const sl = num(zone.sl) || Number((isSell ? hi + 0.40 : lo - 0.40).toFixed(2));
  const risk = Math.max(1.8, Math.abs(ce - sl));
  const tp1 = num(zone.tp1) || Number((isSell ? ce - Math.max(risk * 1.6, 5.0) : ce + Math.max(risk * 1.6, 5.0)).toFixed(2));
  const tp2 = num(zone.tp2) || Number((isSell ? ce - Math.max(risk * 2.8, 9.0) : ce + Math.max(risk * 2.8, 9.0)).toFixed(2));

  let status = 'TESTING';
  let resolvedAt = null;
  let maxFavorable = 0;
  let touchCount = 0;
  let ceTouched = false;
  let inZonePrev = false;
  let lastTouchAt = touchedAt;
  const touches = [];

  for (let i = touchIdx; i < candles.length; i += 1) {
    const c = candles[i];
    const barTs = c.closeTime * 1000;
    const fav = isSell ? Math.max(0, ce - c.low) : Math.max(0, c.high - ce);
    if (fav > maxFavorable) maxFavorable = fav;

    const barInZone = isSell
      ? (c.high >= lo - 0.15 && c.low <= hi + 0.5)
      : (c.low <= hi + 0.15 && c.high >= lo - 0.5);
    const barHitCe = isSell ? (c.high >= ce) : (c.low <= ce);
    const hitSl = isSell ? (c.high > sl) : (c.low < sl);
    const hitTp1 = isSell ? (c.low <= tp1) : (c.high >= tp1);
    const hitTp2 = isSell ? (c.low <= tp2) : (c.high >= tp2);

    if (barInZone) {
      if (barHitCe) ceTouched = true;
      const touchY = isSell ? Math.min(c.high, hi) : Math.max(c.low, lo);
      if (!inZonePrev) {
        touchCount += 1;
        lastTouchAt = c.openTime * 1000;
        touches.push({
          index: touchCount,
          time: c.openTime,
          price: Number(touchY.toFixed(2)),
          hitCe: barHitCe,
          broken: Boolean(hitSl && status !== 'TP1_HIT' && status !== 'TP2_HIT')
        });
      } else if (touches.length > 0) {
        const cur = touches[touches.length - 1];
        if (barHitCe) cur.hitCe = true;
        if (hitSl && status !== 'TP1_HIT' && status !== 'TP2_HIT') cur.broken = true;
      }
      inZonePrev = true;
    } else {
      inZonePrev = false;
    }

    // Conservative SL-first when both hit on the same candle (unless TP1 was already secured on an earlier bar)
    if (hitSl && status !== 'TP1_HIT' && status !== 'TP2_HIT') {
      status = 'SL_HIT';
      resolvedAt = barTs;
      break;
    }
    if (hitTp2) {
      status = 'TP2_HIT';
      resolvedAt = barTs;
      break;
    }
    if (hitTp1 && status !== 'TP1_HIT') {
      status = 'TP1_HIT';
      resolvedAt = barTs;
    } else if (status === 'TESTING' && i > touchIdx && fav >= 2.5) {
      status = 'REACTING';
    }
  }

  return {
    id: makePoiId(zone.side, zone.tf, zone.kind, lo, hi),
    side: zone.side,
    tf: zone.tf,
    kind: zone.kind,
    low: Number(lo.toFixed(2)),
    high: Number(hi.toFixed(2)),
    ce: Number(ce.toFixed(2)),
    sl: Number(sl.toFixed(2)),
    tp1: Number(tp1.toFixed(2)),
    tp2: Number(tp2.toFixed(2)),
    touchedAt,
    lastTouchAt,
    touchCount: Math.max(1, touchCount),
    ceTouched,
    touches: touches.slice(-8),
    touchPrice: Number(touchPrice.toFixed(2)),
    maxFavorable: Number(maxFavorable.toFixed(2)),
    status,
    resolvedAt,
    notifiedCe: true,
    notifiedTp1: status === 'TP1_HIT' || status === 'TP2_HIT',
    notifiedTp2: status === 'TP2_HIT',
    notifiedSl: status === 'SL_HIT',
    source: 'BACKFILL'
  };
}

/**
 * Reconstruct recent (last 30h) POI touches/outcomes, Liquidity Sweeps, Structure Breaks,
 * and Key Level hits directly from M15/M5 candles so History is immediately populated on first open.
 */
export function backfillFromCandles({
  m15Candles = [],
  m5Candles = [],
  ctx = null,
  ngM15 = null,
  ngM5 = null,
  nowMs = Date.now(),
  lookbackHours = 30
}) {
  const m15 = normalizeCandles(m15Candles);
  const m5 = normalizeCandles(m5Candles);
  const lookbackMs = lookbackHours * 3600 * 1000;
  const cutoffMs = nowMs - lookbackMs;

  const poiRecords = [];
  const timelineEvents = [];
  const amy = ctx?.amy || ctx || {};

  const pushEvent = ev => {
    if (!ev || !Number.isFinite(ev.ts) || ev.ts < cutoffMs || ev.ts > nowMs + 60000) return;
    timelineEvents.push(ev);
  };

  // 1. Structure Breaks (BOS / MSS) from backend amy.events (M15 SSOT)
  const backendEvents = Array.isArray(amy?.events) ? amy.events : [];
  for (const ev of backendEvents.slice(-16)) {
    const ts = Number(ev.time) * 1000;
    const lvl = num(ev.level ?? ev.price);
    const side = String(ev.side || '').toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
    const kind = String(ev.kind || ev.type || 'BOS').toUpperCase();
    if (!Number.isFinite(ts) || !Number.isFinite(lvl)) continue;
    pushEvent({
      id: `BREAK:M15:${kind}:${side}:${ev.time}`,
      ts,
      category: 'BREAK',
      side,
      tf: 'M15',
      title: `${kind} ${side === 'BUY' ? 'Bullish' : 'Bearish'} @ $${fmt(lvl)}`,
      detail: side === 'BUY' ? 'Struktur M15 pecah ke atas · Buyer pegang kendali' : 'Struktur M15 pecah ke bawah · Seller pegang kendali',
      price: Number(lvl.toFixed(2)),
      source: 'BACKFILL'
    });
  }

  // 2. Liquidity Sweeps from NextGen M15 & M5
  const collectSweeps = (ng, tf) => {
    const list = Array.isArray(ng?.liquidity?.sweeps) ? ng.liquidity.sweeps : [];
    for (const sw of list.slice(-10)) {
      const rawT = Number(sw.time ?? sw.sweepTime);
      const ts = rawT > 10_000_000_000 ? rawT : rawT * 1000;
      const lvl = num(sw.level ?? sw.price);
      if (!Number.isFinite(ts) || !Number.isFinite(lvl)) continue;
      const rSide = String(sw.reactionSide || sw.side || '').toUpperCase();
      const side = (rSide === 'BUY' || rSide === 'BULLISH' || String(sw.type || '').includes('SSL') || String(sw.type || '').includes('LOW') || String(sw.type || '').includes('PDL')) ? 'BUY' : 'SELL';
      const pool = sw.pool || (side === 'BUY' ? 'SSL' : 'BSL');
      pushEvent({
        id: `SWEEP:${tf}:${pool}:${Math.round(ts / 60000)}`,
        ts,
        category: 'SWEEP',
        side,
        tf,
        title: sw.broken ? `${pool} $${fmt(lvl)} Tembus BOS` : `Sweep ${pool} $${fmt(lvl)}`,
        detail: sw.broken
          ? `Likuiditas ${pool} ditembus close candle (${tf})`
          : `Likuiditas disapu → Reaksi ${side === 'BUY' ? 'Buy' : 'Sell'} (${tf})`,
        price: Number(lvl.toFixed(2)),
        source: 'BACKFILL'
      });
    }
  };
  collectSweeps(ngM15, 'M15');
  collectSweeps(ngM5, 'M5');

  // 3. Key Level Hits (PDH, PDL, Asia High/Low, NY Midnight Open) on recent M15 candles
  const levels = amy?.levels || {};
  const keyDefs = [
    { key: 'PDH', name: 'PDH', val: num(levels.pdh), role: 'HIGH' },
    { key: 'PDL', name: 'PDL', val: num(levels.pdl), role: 'LOW' },
    { key: 'ASIA_H', name: 'Asia High', val: num(levels.asiaHigh), role: 'HIGH' },
    { key: 'ASIA_L', name: 'Asia Low', val: num(levels.asiaLow), role: 'LOW' },
    { key: 'MO', name: 'NY Midnight Open', val: num(levels.midnightOpen), role: 'PIVOT' }
  ].filter(k => Number.isFinite(k.val));

  const recentM15 = m15.filter(c => c.openTime * 1000 >= cutoffMs);
  for (const kd of keyDefs) {
    // Only consider hits after the key level's own timestamp if available (e.g. asiaTime/midnightTime)
    const minSec = kd.key === 'MO' ? Number(levels.midnightTime || 0) : (kd.key.startsWith('ASIA') ? Number(levels.asiaTime || 0) + 4 * 3600 : 0);
    let lastHitIdx = -1;
    for (let i = 0; i < recentM15.length; i += 1) {
      const c = recentM15[i];
      if (minSec > 0 && c.openTime < minSec) continue;
      if (c.low <= kd.val + 0.15 && c.high >= kd.val - 0.15) {
        lastHitIdx = i;
      }
    }
    if (lastHitIdx >= 0) {
      const c = recentM15[lastHitIdx];
      const ts = c.openTime * 1000;
      const brokeUp = c.close > kd.val + 0.2;
      const brokeDown = c.close < kd.val - 0.2;
      const side = kd.role === 'HIGH' ? (brokeUp ? 'BUY' : 'SELL') : kd.role === 'LOW' ? (brokeDown ? 'SELL' : 'BUY') : (brokeUp ? 'BUY' : 'SELL');
      const action = kd.role === 'HIGH'
        ? (brokeUp ? 'Ditembus Naik' : 'Sweep / Reject')
        : kd.role === 'LOW'
          ? (brokeDown ? 'Ditembus Turun' : 'Sweep / Reject')
          : (brokeUp ? 'Reclaim di Atas' : 'Tembus di Bawah');
      pushEvent({
        id: `KEY:${kd.key}:${witaDateKey(ts)}`,
        ts,
        category: 'KEY_LEVEL',
        side,
        tf: 'M15',
        title: `${kd.name} $${fmt(kd.val)} · ${action}`,
        detail: `Candle M15 menyentuh $${fmt(kd.val)} (close $${fmt(c.close)})`,
        price: Number(kd.val.toFixed(2)),
        source: 'BACKFILL'
      });
    }
  }

  // 4. POI Touches & Outcomes from M15 & M5 FVG/OB zones (include historyFvg/historyOb so resolved zones backfill cleanly)
  const evalNgZones = (ng, candles, tf) => {
    if (!ng?.poi || !candles.length) return;
    const fvgList = Array.isArray(ng.poi.historyFvg) && ng.poi.historyFvg.length
      ? ng.poi.historyFvg
      : (Array.isArray(ng.poi.fvg) ? ng.poi.fvg : []);
    const obList = Array.isArray(ng.poi.historyOb) && ng.poi.historyOb.length
      ? ng.poi.historyOb
      : (Array.isArray(ng.poi.ob) ? ng.poi.ob : []);
    const rawZones = [
      ...fvgList.map(z => ({ ...z, kind: 'FVG' })),
      ...obList.map(z => ({ ...z, kind: 'OB' }))
    ];
    const seenKeys = new Set();
    for (const z of rawZones) {
      const sideStr = String(z.side || z.direction || '').toUpperCase();
      const side = (sideStr === 'SELL' || sideStr === 'BEARISH') ? 'SELL' : 'BUY';
      const loVal = num(z.bot ?? z.low);
      const hiVal = num(z.top ?? z.high);
      if (!Number.isFinite(loVal) || !Number.isFinite(hiVal) || hiVal <= loVal) continue;
      const dedupeKey = `${side}:${z.kind}:${loVal.toFixed(1)}-${hiVal.toFixed(1)}`;
      if (seenKeys.has(dedupeKey)) continue;
      seenKeys.add(dedupeKey);
      const evaluated = evaluateZoneLifecycleOnCandles(
        {
          side,
          tf,
          kind: z.kind,
          low: loVal,
          high: hiVal,
          ce: z.ce,
          startTime: z.startTime,
          formedIndex: z.formedIndex
        },
        candles,
        lookbackMs,
        nowMs
      );
      if (!evaluated) continue;
      poiRecords.push(evaluated);
      const touchTag = evaluated.touchCount > 1
        ? ` · ${evaluated.touchCount}× sentuh${evaluated.ceTouched ? ' (50% CE)' : ''}`
        : (evaluated.ceTouched ? ' · 50% CE tersentuh' : '');
      pushEvent({
        id: `TOUCH:${evaluated.id}`,
        ts: evaluated.touchedAt,
        category: 'POI_TOUCH',
        side: evaluated.side,
        tf: evaluated.tf,
        title: `${evaluated.kind} ${evaluated.tf} ${evaluated.side} Disentuh`,
        detail: `Zona $${fmt(evaluated.low)}–$${fmt(evaluated.high)} tersentuh @ $${fmt(evaluated.touchPrice)}${touchTag}`,
        price: evaluated.touchPrice,
        source: 'BACKFILL'
      });
      if (evaluated.status === 'TP2_HIT' || evaluated.status === 'TP1_HIT' || evaluated.status === 'SL_HIT') {
        const outTitle = evaluated.status === 'TP2_HIT'
          ? `${evaluated.kind} ${evaluated.tf} ${evaluated.side} → TP2 DOL Tercapai`
          : evaluated.status === 'TP1_HIT'
            ? `${evaluated.kind} ${evaluated.tf} ${evaluated.side} → TP1 BEP Tercapai`
            : `${evaluated.kind} ${evaluated.tf} ${evaluated.side} → Jebol SL`;
        pushEvent({
          id: `OUTCOME:${evaluated.id}:${evaluated.status}`,
          ts: evaluated.resolvedAt || evaluated.touchedAt + 60000,
          category: 'POI_OUTCOME',
          side: evaluated.side,
          tf: evaluated.tf,
          title: outTitle,
          detail: evaluated.status === 'SL_HIT'
            ? `Invalidasi SL $${fmt(evaluated.sl)} tembus (reaksi maks +$${fmt(evaluated.maxFavorable)})`
            : `Memantul +$${fmt(evaluated.maxFavorable)} dari CE $${fmt(evaluated.ce)}`,
          price: evaluated.status === 'SL_HIT' ? evaluated.sl : (evaluated.status === 'TP2_HIT' ? evaluated.tp2 : evaluated.tp1),
          source: 'BACKFILL'
        });
      }
    }
  };
  evalNgZones(ngM15, m15, 'M15');
  evalNgZones(ngM5, m5, 'M5');

  return { poiRecords, timelineEvents };
}

/**
 * Live tick tracker: records POI touches from active BUY/SELL plans and advances open POI outcomes.
 * Returns { state, changed } so callers only re-render/persist when meaningful state changes occur.
 */
export function recordLivePoiProgress({
  state,
  plans = [],
  livePrice = 0,
  nowMs = Date.now()
}) {
  const price = num(livePrice);
  if (!Number.isFinite(price)) return { state, changed: false, alerts: [] };

  const poiMap = new Map((state?.poiRecords || []).map(r => [r.id, { ...r }]));
  const evMap = new Map((state?.timelineEvents || []).map(e => [e.id, { ...e }]));
  const alerts = [];
  let changed = false;

  // 1. Check active BUY/SELL plans for live entry touch
  for (const plan of plans) {
    if (!plan || !plan.area) continue;
    const lo = num(plan.area.low);
    const hi = num(plan.area.high);
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) continue;
    const isSell = plan.side === 'SELL';
    const inZone = price >= lo - 0.20 && price <= hi + 0.25;
    if (!inZone) continue;

    const tf = plan.tf || 'M15';
    const kind = plan.kind || 'FVG';
    const id = makePoiId(plan.side, tf, kind, lo, hi);
    const existing = poiMap.get(id);
    const ceVal = num(plan.area.ce) || (lo + hi) / 2;
    const hitCeNow = isSell ? (price >= ceVal) : (price <= ceVal);
    if (!existing) {
      const sl = num(plan.sl) || Number((isSell ? hi + 0.40 : lo - 0.40).toFixed(2));
      const risk = Math.max(1.8, Math.abs(ceVal - sl));
      const tp1 = num(plan.tp1) || Number((isSell ? ceVal - Math.max(risk * 1.6, 5.0) : ceVal + Math.max(risk * 1.6, 5.0)).toFixed(2));
      const tp2 = num(plan.tp2) || Number((isSell ? ceVal - Math.max(risk * 2.8, 9.0) : ceVal + Math.max(risk * 2.8, 9.0)).toFixed(2));
      const rec = {
        id,
        side: plan.side,
        tf,
        kind,
        low: Number(lo.toFixed(2)),
        high: Number(hi.toFixed(2)),
        ce: Number(ceVal.toFixed(2)),
        sl: Number(sl.toFixed(2)),
        tp1: Number(tp1.toFixed(2)),
        tp2: Number(tp2.toFixed(2)),
        touchedAt: nowMs,
        lastTouchAt: nowMs,
        touchCount: 1,
        ceTouched: hitCeNow,
        touchPrice: Number(price.toFixed(2)),
        maxFavorable: 0,
        status: 'TESTING',
        resolvedAt: null,
        notifiedTouch: true,
        notifiedCe: Boolean(hitCeNow),
        notifiedTp1: false,
        notifiedTp2: false,
        notifiedSl: false,
        source: 'LIVE'
      };
      const icon = rec.side === 'BUY' ? '🟢' : '🔴';
      const touchTitle = hitCeNow
        ? `${icon} ${rec.side} ${rec.kind} ${rec.tf} · Sentuh 50% CE ($${fmt(rec.low)}–$${fmt(rec.high)})`
        : `${icon} ${rec.side} ${rec.kind} ${rec.tf} · Disentuh ($${fmt(rec.low)}–$${fmt(rec.high)})`;
      const tp2BodyStr = rec.tp2 ? ` | TP2 $${fmt(rec.tp2)}` : '';
      alerts.push({
        type: hitCeNow ? 'CE_TOUCH' : 'ZONE_TOUCH',
        poiId: rec.id,
        title: touchTitle,
        body: `CE $${fmt(rec.ce)} | SL $${fmt(rec.sl)} | TP1 $${fmt(rec.tp1)}${tp2BodyStr}`,
        sound: 'gold'
      });
      poiMap.set(id, rec);
      evMap.set(`TOUCH:${id}`, {
        id: `TOUCH:${id}`,
        ts: nowMs,
        category: 'POI_TOUCH',
        side: rec.side,
        tf: rec.tf,
        title: `${rec.kind} ${rec.tf} ${rec.side} Disentuh (Live)`,
        detail: `Zona $${fmt(rec.low)}–$${fmt(rec.high)} tersentuh live @ $${fmt(price)}${hitCeNow ? ' · 50% CE' : ''}`,
        price: Number(price.toFixed(2)),
        source: 'LIVE'
      });
      changed = true;
    } else if (hitCeNow && !existing.ceTouched) {
      existing.ceTouched = true;
      existing.lastTouchAt = nowMs;
      if (!existing.notifiedCe) {
        existing.notifiedCe = true;
        const icon = existing.side === 'BUY' ? '🟢' : '🔴';
        const tp2BodyStr = existing.tp2 ? ` | TP2 $${fmt(existing.tp2)}` : '';
        alerts.push({
          type: 'CE_TOUCH',
          poiId: existing.id,
          title: `${icon} ${existing.side} ${existing.kind} ${existing.tf} · Sentuh 50% CE ($${fmt(existing.low)}–$${fmt(existing.high)})`,
          body: `CE $${fmt(existing.ce)} | SL $${fmt(existing.sl)} | TP1 $${fmt(existing.tp1)}${tp2BodyStr}`,
          sound: 'gold'
        });
      }
      changed = true;
    }
  }

  // 2. Advance every open/active POI record against live price
  for (const rec of poiMap.values()) {
    if (rec.status === 'SL_HIT' || rec.status === 'TP2_HIT') continue;
    // Skip stale open records older than 18 hours
    if (nowMs - rec.touchedAt > 18 * 3600 * 1000) continue;

    const isSell = rec.side === 'SELL';
    const fav = isSell ? Math.max(0, rec.ce - price) : Math.max(0, price - rec.ce);
    if (fav - (rec.maxFavorable || 0) >= 0.5) {
      rec.maxFavorable = Number(fav.toFixed(2));
      changed = true;
    }

    const hitSl = Number.isFinite(rec.sl) && (isSell ? price > rec.sl : price < rec.sl);
    const hitTp1 = Number.isFinite(rec.tp1) && (isSell ? price <= rec.tp1 : price >= rec.tp1);
    const hitTp2 = Number.isFinite(rec.tp2) && (isSell ? price <= rec.tp2 : price >= rec.tp2);

    const prevStatus = rec.status;
    if (hitSl && rec.status !== 'TP1_HIT') {
      rec.status = 'SL_HIT';
      rec.resolvedAt = nowMs;
    } else if (hitTp2) {
      rec.status = 'TP2_HIT';
      rec.resolvedAt = nowMs;
    } else if (hitTp1 && rec.status !== 'TP1_HIT') {
      rec.status = 'TP1_HIT';
      rec.resolvedAt = nowMs;
    } else if (rec.status === 'TESTING' && fav >= 2.5) {
      rec.status = 'REACTING';
    }

    if (rec.status !== prevStatus) {
      changed = true;
      if (rec.status === 'TP1_HIT') {
        if (!rec.notifiedTp1) {
          rec.notifiedTp1 = true;
          alerts.push({
            type: 'TP1_HIT',
            poiId: rec.id,
            title: `🎯 TP1 BEP ✓ · ${rec.side} ${rec.kind} ${rec.tf} ($${fmt(rec.low)}–$${fmt(rec.high)})`,
            body: `Target 1 $${fmt(rec.tp1)} tercapai${rec.maxFavorable ? ` (Maks +$${fmt(rec.maxFavorable)})` : ''}. Amankan posisi & pasang BEP!`,
            sound: 'gold'
          });
        }
      } else if (rec.status === 'TP2_HIT') {
        if (!rec.notifiedTp2) {
          rec.notifiedTp2 = true;
          alerts.push({
            type: 'TP2_HIT',
            poiId: rec.id,
            title: `👑 TP2 DOL ★ · ${rec.side} ${rec.kind} ${rec.tf} ($${fmt(rec.low)}–$${fmt(rec.high)})`,
            body: `Target penuh $${fmt(rec.tp2)} tercapai (+100 Pips). Posisi selesai, selamat Sayang!`,
            sound: 'gold'
          });
        }
      } else if (rec.status === 'SL_HIT') {
        if (!rec.notifiedSl) {
          rec.notifiedSl = true;
          alerts.push({
            type: 'SL_HIT',
            poiId: rec.id,
            title: `🛡️ Jebol SL ✕ · ${rec.side} ${rec.kind} ${rec.tf} ($${fmt(rec.low)}–$${fmt(rec.high)})`,
            body: `Batas risiko $${fmt(rec.sl)} tersentuh. Disiplin risiko terjaga, jangan revenge trade.`,
            sound: 'default'
          });
        }
      }

      if (rec.status === 'TP2_HIT' || rec.status === 'TP1_HIT' || rec.status === 'SL_HIT') {
        const outTitle = rec.status === 'TP2_HIT'
          ? `${rec.kind} ${rec.tf} ${rec.side} → TP2 DOL Tercapai`
          : rec.status === 'TP1_HIT'
            ? `${rec.kind} ${rec.tf} ${rec.side} → TP1 BEP Tercapai`
            : `${rec.kind} ${rec.tf} ${rec.side} → Jebol SL`;
        const evId = `OUTCOME:${rec.id}:${rec.status}`;
        evMap.set(evId, {
          id: evId,
          ts: nowMs,
          category: 'POI_OUTCOME',
          side: rec.side,
          tf: rec.tf,
          title: outTitle,
          detail: rec.status === 'SL_HIT'
            ? `Invalidasi SL $${fmt(rec.sl)} tersentuh live @ $${fmt(price)}`
            : `Reaksi +$${fmt(Math.max(fav, rec.maxFavorable || 0))} dari CE $${fmt(rec.ce)}`,
          price: Number(price.toFixed(2)),
          source: 'LIVE'
        });
      }
    }
  }

  if (!changed && alerts.length === 0) return { state, changed: false, alerts: [] };
  const sortedPois = [...poiMap.values()].sort((a, b) => b.touchedAt - a.touchedAt);
  const keptPois = sortedPois.slice(0, MAX_POI_RECORDS);
  const evictedPois = sortedPois.slice(MAX_POI_RECORDS);
  const dailyArchive = rebuildDailyArchive(keptPois, state?.dailyArchive || {}, evictedPois);
  return {
    changed: true,
    alerts,
    state: {
      version: 2,
      poiRecords: keptPois,
      timelineEvents: [...evMap.values()].sort((a, b) => b.ts - a.ts).slice(0, MAX_TIMELINE_EVENTS),
      dailyArchive
    }
  };
}

/**
 * Merge persisted localStorage state with fresh candle backfill or remote synced state.
 * - LIVE wins over BACKFILL, never downgrades status progression.
 * - Full POI details retained up to 180 days (MAX_RETENTION_MS / MAX_POI_RECORDS).
 * - Any pruned POI records (>180d or over-cap) are permanently rolled up into dailyArchive.
 */
export function mergeHistoryState(persisted, backfilled, nowMs = Date.now()) {
  const poiCutoff = nowMs - MAX_RETENTION_MS;
  const evCutoff = nowMs - TIMELINE_RETENTION_MS;
  const poiMap = new Map();
  const evictedPois = [];
  const statusRank = { TESTING: 1, REACTING: 2, TP1_HIT: 3, SL_HIT: 4, TP2_HIT: 5 };

  const upsertPoi = rec => {
    if (!rec || !rec.id || !Number.isFinite(rec.touchedAt)) return;
    if (rec.touchedAt < poiCutoff) {
      evictedPois.push(rec);
      return;
    }
    const prev = poiMap.get(rec.id);
    if (!prev) {
      poiMap.set(rec.id, { ...rec });
      return;
    }
    // Keep LIVE metadata & higher progression status
    const keepLive = prev.source === 'LIVE' && rec.source !== 'LIVE';
    const nextRank = statusRank[rec.status] || 0;
    const prevRank = statusRank[prev.status] || 0;
    const merged = keepLive ? { ...prev } : { ...prev, ...rec };
    if (prevRank > nextRank) {
      merged.status = prev.status;
      merged.resolvedAt = prev.resolvedAt;
    } else if (nextRank > prevRank) {
      merged.status = rec.status;
      merged.resolvedAt = rec.resolvedAt;
    }
    merged.maxFavorable = Math.max(Number(prev.maxFavorable) || 0, Number(rec.maxFavorable) || 0);
    merged.touchCount = Math.max(Number(prev.touchCount) || 1, Number(rec.touchCount) || 1);
    merged.ceTouched = Boolean(prev.ceTouched || rec.ceTouched);
    merged.notifiedCe = Boolean(prev.notifiedCe || rec.notifiedCe);
    merged.notifiedTp1 = Boolean(prev.notifiedTp1 || rec.notifiedTp1);
    merged.notifiedTp2 = Boolean(prev.notifiedTp2 || rec.notifiedTp2);
    merged.notifiedSl = Boolean(prev.notifiedSl || rec.notifiedSl);
    merged.lastTouchAt = Math.max(Number(prev.lastTouchAt) || 0, Number(rec.lastTouchAt) || 0) || merged.touchedAt;
    if (Array.isArray(rec.touches) && rec.touches.length >= (Array.isArray(prev.touches) ? prev.touches.length : 0)) {
      merged.touches = rec.touches;
    } else if (Array.isArray(prev.touches)) {
      merged.touches = prev.touches;
    }
    if (prev.source === 'LIVE') merged.source = 'LIVE';
    poiMap.set(rec.id, merged);
  };

  for (const r of persisted?.poiRecords || []) upsertPoi(r);
  for (const r of backfilled?.poiRecords || []) upsertPoi(r);

  const evMap = new Map();
  const upsertEv = ev => {
    if (!ev || !ev.id || !Number.isFinite(ev.ts) || ev.ts < evCutoff) return;
    const prev = evMap.get(ev.id);
    if (!prev || (prev.source !== 'LIVE' && ev.source === 'LIVE')) {
      evMap.set(ev.id, { ...ev });
    }
  };
  for (const e of persisted?.timelineEvents || []) upsertEv(e);
  for (const e of backfilled?.timelineEvents || []) upsertEv(e);

  const sortedPois = [...poiMap.values()].sort((a, b) => b.touchedAt - a.touchedAt);
  const keptPois = sortedPois.slice(0, MAX_POI_RECORDS);
  const overflowPois = sortedPois.slice(MAX_POI_RECORDS);

  // Merge both dailyArchive maps first (richer summary wins per date)
  const mergedArchive = normalizeDailyArchiveMap(persisted?.dailyArchive || {});
  const incomingArchive = normalizeDailyArchiveMap(backfilled?.dailyArchive || {});
  for (const [k, v] of Object.entries(incomingArchive)) {
    mergedArchive[k] = pickRicherDayArchive(mergedArchive[k], v);
  }
  const dailyArchive = rebuildDailyArchive(keptPois, mergedArchive, [...evictedPois, ...overflowPois]);

  return {
    version: 2,
    poiRecords: keptPois,
    timelineEvents: [...evMap.values()].sort((a, b) => b.ts - a.ts).slice(0, MAX_TIMELINE_EVENTS),
    dailyArchive
  };
}

/**
 * Union-merge local state with remote cloud/backup state without losing recorded days on either device.
 */
export function mergeRemoteHistoryState(localState, remoteState, nowMs = Date.now()) {
  return mergeHistoryState(localState || createEmptyHistoryState(), remoteState || createEmptyHistoryState(), nowMs);
}

/**
 * Filter records by 'TODAY' (WITA day) or '7D' and compute POI Respect scorecard.
 */
export function filterByRange(items, tsKey, range = 'TODAY', nowMs = Date.now()) {
  if (!Array.isArray(items)) return [];
  if (range === '7D') {
    const cutoff = nowMs - SEVEN_DAYS_MS;
    return items.filter(x => Number(x?.[tsKey]) >= cutoff);
  }
  const todayKey = witaDateKey(nowMs);
  return items.filter(x => witaDateKey(Number(x?.[tsKey])) === todayKey);
}

export function summarizePoiStats(poiRecords, range = 'TODAY', nowMs = Date.now()) {
  const scoped = filterByRange(poiRecords, 'touchedAt', range, nowMs);
  let tp2Count = 0;
  let tp1Count = 0;
  let reactingCount = 0;
  let testingCount = 0;
  let slCount = 0;

  for (const r of scoped) {
    if (r.status === 'TP2_HIT') tp2Count += 1;
    else if (r.status === 'TP1_HIT') tp1Count += 1;
    else if (r.status === 'REACTING') reactingCount += 1;
    else if (r.status === 'SL_HIT') slCount += 1;
    else testingCount += 1;
  }

  const respectCount = tp2Count + tp1Count + reactingCount;
  const resolvedCount = tp2Count + tp1Count + slCount;
  const respectRate = resolvedCount > 0
    ? Math.round(((tp2Count + tp1Count) / resolvedCount) * 100)
    : (scoped.length > 0 ? Math.round((respectCount / scoped.length) * 100) : null);

  return {
    items: scoped,
    total: scoped.length,
    tp2Count,
    tp1Count,
    reactingCount,
    testingCount,
    slCount,
    respectCount,
    resolvedCount,
    respectRate
  };
}

export function formatWitaDateLabel(dateKey) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return '—';
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dayName = DAY_NAMES_ID[dt.getUTCDay()] || '';
  const monthShort = SHORT_MONTH_NAMES_ID[m - 1] || '';
  return `${dayName}, ${d} ${monthShort} ${y}`;
}

export function getWitaYearMonth(nowMs = Date.now()) {
  const key = witaDateKey(nowMs);
  if (!key) {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  }
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m - 1 };
}

function resolveDayTone(summary) {
  if (!summary || summary.total <= 0) return 'empty';
  if (summary.resolved > 0) {
    if (summary.respectRate >= 60) return 'win';
    if (summary.respectRate < 50) return 'loss';
    return 'neutral';
  }
  return 'neutral';
}

/**
 * Build monthly POI performance calendar (8 columns: MIN..SAB + weekly MGG rollup).
 * Combines detailed 180-day poiRecords with permanent dailyArchive summaries.
 */
export function buildPoiCalendarMonth(state, year, month, nowMs = Date.now()) {
  const fallbackYm = getWitaYearMonth(nowMs);
  const targetYear = Number.isInteger(year) ? year : fallbackYm.year;
  const targetMonth = Number.isInteger(month) ? month : fallbackYm.month;
  const todayKey = witaDateKey(nowMs);

  const archive = rebuildDailyArchive(state?.poiRecords || [], state?.dailyArchive || {});
  const detailCountByDate = new Map();
  for (const r of state?.poiRecords || []) {
    const k = witaDateKey(Number(r?.touchedAt));
    if (!k) continue;
    detailCountByDate.set(k, (detailCountByDate.get(k) || 0) + 1);
  }

  const first = new Date(Date.UTC(targetYear, targetMonth, 1));
  const last = new Date(Date.UTC(targetYear, targetMonth + 1, 0));
  const startDay = first.getUTCDay(); // 0=MIN .. 6=SAB
  const totalDays = last.getUTCDate();
  const monthPrefix = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;

  const rawCells = [];
  for (let i = 0; i < startDay; i += 1) rawCells.push({ empty: true });

  const monthAgg = {
    total: 0,
    tp2: 0,
    tp1: 0,
    wins: 0,
    sl: 0,
    reacting: 0,
    testing: 0,
    active: 0,
    resolved: 0,
    respectRate: null,
    m15Total: 0,
    m15Wins: 0,
    m15Sl: 0,
    m15RespectRate: null,
    m5Total: 0,
    m5Wins: 0,
    m5Sl: 0,
    m5RespectRate: null,
    fvgTotal: 0,
    obTotal: 0,
    activeDays: 0
  };

  for (let day = 1; day <= totalDays; day += 1) {
    const dateKey = `${monthPrefix}-${String(day).padStart(2, '0')}`;
    const dow = new Date(Date.UTC(targetYear, targetMonth, day)).getUTCDay();
    const isWeekend = dow === 0 || dow === 6;
    const summary = archive[dateKey] || null;
    const detailCount = detailCountByDate.get(dateKey) || 0;

    if (summary && summary.total > 0) {
      monthAgg.total += summary.total;
      monthAgg.tp2 += summary.tp2;
      monthAgg.tp1 += summary.tp1;
      monthAgg.wins += summary.wins;
      monthAgg.sl += summary.sl;
      monthAgg.reacting += summary.reacting;
      monthAgg.testing += summary.testing;
      monthAgg.active += summary.reacting + summary.testing;
      monthAgg.resolved += summary.resolved;
      monthAgg.m15Total += summary.m15Total;
      monthAgg.m15Wins += summary.m15Wins;
      monthAgg.m15Sl += summary.m15Sl;
      monthAgg.m5Total += summary.m5Total;
      monthAgg.m5Wins += summary.m5Wins;
      monthAgg.m5Sl += summary.m5Sl;
      monthAgg.fvgTotal += summary.fvgTotal;
      monthAgg.obTotal += summary.obTotal;
      monthAgg.activeDays += 1;
    }

    rawCells.push({
      empty: false,
      day,
      date: dateKey,
      isToday: dateKey === todayKey,
      isWeekend,
      hasData: Boolean(summary && summary.total > 0),
      hasDetails: detailCount > 0,
      detailCount,
      tone: resolveDayTone(summary),
      summary
    });
  }

  while (rawCells.length % 7 !== 0) rawCells.push({ empty: true });

  monthAgg.respectRate = monthAgg.resolved > 0
    ? Math.round((monthAgg.wins / monthAgg.resolved) * 100)
    : (monthAgg.total > 0 ? Math.round(((monthAgg.wins + monthAgg.reacting) / monthAgg.total) * 100) : null);

  const m15Res = monthAgg.m15Wins + monthAgg.m15Sl;
  monthAgg.m15RespectRate = m15Res > 0 ? Math.round((monthAgg.m15Wins / m15Res) * 100) : null;
  const m5Res = monthAgg.m5Wins + monthAgg.m5Sl;
  monthAgg.m5RespectRate = m5Res > 0 ? Math.round((monthAgg.m5Wins / m5Res) * 100) : null;

  const weeks = [];
  for (let i = 0; i < rawCells.length; i += 7) {
    const days = rawCells.slice(i, i + 7);
    let wTotal = 0;
    let wWins = 0;
    let wSl = 0;
    let wReacting = 0;
    for (const cell of days) {
      if (cell.summary) {
        wTotal += cell.summary.total;
        wWins += cell.summary.wins;
        wSl += cell.summary.sl;
        wReacting += cell.summary.reacting;
      }
    }
    const wResolved = wWins + wSl;
    const wRate = wResolved > 0
      ? Math.round((wWins / wResolved) * 100)
      : (wTotal > 0 ? Math.round(((wWins + wReacting) / wTotal) * 100) : null);
    const wTone = wTotal === 0 ? 'empty' : (wResolved > 0 ? (wRate >= 60 ? 'win' : (wRate < 50 ? 'loss' : 'neutral')) : 'neutral');

    weeks.push({
      days,
      weekSummary: {
        total: wTotal,
        wins: wWins,
        sl: wSl,
        resolved: wResolved,
        respectRate: wRate,
        tone: wTone
      }
    });
  }

  const totalRecordedDays = Object.keys(archive).length;

  return {
    year: targetYear,
    month: targetMonth,
    monthPrefix,
    label: `${MONTH_NAMES_ID[targetMonth]} ${targetYear}`,
    weeks,
    monthSummary: monthAgg,
    totalRecordedDays
  };
}

/**
 * Retrieve POI records & summary for a specific WITA date (YYYY-MM-DD) with optional filter.
 * filter: 'ALL' | 'M15' | 'M5' | 'TP' | 'SL'
 */
export function getDayPoiRecords(state, dateKey, filter = 'ALL') {
  const normalizedFilter = String(filter || 'ALL').toUpperCase();
  const allForDay = (state?.poiRecords || [])
    .filter(r => witaDateKey(Number(r?.touchedAt)) === dateKey)
    .sort((a, b) => Number(b.touchedAt) - Number(a.touchedAt));

  const archive = rebuildDailyArchive(state?.poiRecords || [], state?.dailyArchive || {});
  const summary = allForDay.length > 0
    ? summarizePoiDayFromRecords(allForDay, dateKey)
    : (archive[dateKey] || null);

  let items = allForDay;
  if (normalizedFilter === 'M15') {
    items = allForDay.filter(r => String(r.tf || 'M15').toUpperCase() === 'M15');
  } else if (normalizedFilter === 'M5') {
    items = allForDay.filter(r => String(r.tf || '').toUpperCase() === 'M5');
  } else if (normalizedFilter === 'TP') {
    items = allForDay.filter(r => r.status === 'TP1_HIT' || r.status === 'TP2_HIT');
  } else if (normalizedFilter === 'SL') {
    items = allForDay.filter(r => r.status === 'SL_HIT');
  }

  return {
    date: dateKey,
    dateLabel: formatWitaDateLabel(dateKey),
    filter: normalizedFilter,
    allCount: allForDay.length,
    items,
    summary,
    isArchivedOnly: allForDay.length === 0 && Boolean(summary && summary.total > 0)
  };
}

if (typeof window !== 'undefined') {
  window.AmyMappingHistoryEngine = {
    HISTORY_STORAGE_KEY,
    SEVEN_DAYS_MS,
    MAX_RETENTION_MS,
    TIMELINE_RETENTION_MS,
    MAX_POI_RECORDS,
    MAX_TIMELINE_EVENTS,
    createEmptyHistoryState,
    loadHistoryState,
    saveHistoryState,
    backfillFromCandles,
    recordLivePoiProgress,
    mergeHistoryState,
    mergeRemoteHistoryState,
    rebuildDailyArchive,
    summarizePoiDayFromRecords,
    buildPoiCalendarMonth,
    getDayPoiRecords,
    filterByRange,
    summarizePoiStats,
    witaDateKey,
    getWitaYearMonth,
    formatWitaDateLabel,
    formatWitaClock
  };
}
