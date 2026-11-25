/**
 * Pure Mapping Reaction Timeline & POI Outcome Tracker Engine
 * - Auto-backfills recent POI touches/outcomes, Liquidity Sweeps, BOS/MSS, and Key Level hits from M15/M5 candles.
 * - Tracks live real-time POI lifecycle (TESTING -> REACTING -> TP1_HIT -> TP2_HIT / SL_HIT) with 7-day persistence.
 * - Zero DOM dependencies so all logic is deterministically unit-tested via node:test.
 */

export const HISTORY_STORAGE_KEY = 'amyfx.mapping.reaction_history.v1';
export const BACKFILL_ENGINE_VERSION = 5;
export const GOLD_SL_MIN_USD = 6.0;  // 60 pips XAU/USD ($1.00 = 10 pips)
export const GOLD_SL_MAX_USD = 10.0; // 100 pips XAU/USD
export const GOLD_PIPS_PER_USD = 10;
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
    ifvgTotal: Math.max(0, Math.round(Number(raw.ifvgTotal) || 0)),
    bbTotal: Math.max(0, Math.round(Number(raw.bbTotal) || 0)),
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
  let ifvgTotal = 0;
  let bbTotal = 0;
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
    else if (kind === 'IFVG') ifvgTotal += 1;
    else if (kind === 'BB' || kind === 'BREAKER') bbTotal += 1;
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
    ifvgTotal,
    bbTotal,
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
      engineVersion: Number(parsed?.engineVersion) || 1,
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
    engineVersion: Number(state.engineVersion) || BACKFILL_ENGINE_VERSION,
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
        engineVersion: Number(state.engineVersion) || BACKFILL_ENGINE_VERSION,
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
 * Compute realistic Gold XAU/USD SL wick buffer beyond zone boundary so total CE-to-SL
 * distance lands in the 60-100 pips ($6.00-$10.00) range on XAU/USD ($1.00 = 10 pips).
 * - M5 zones target 60-80 pips ($6.00-$8.00) from CE.
 * - M15 zones target 70-100 pips ($7.00-$10.00) from CE.
 */
export function computeGoldSlBuffer(tf, zoneWidth) {
  const w = Math.max(0.5, Number(zoneWidth) || 2.0);
  const isM5 = String(tf || 'M15').toUpperCase() === 'M5';
  const targetCeDist = isM5
    ? Math.max(GOLD_SL_MIN_USD, Math.min(8.0, 6.0 + w * 0.55))
    : Math.max(7.0, Math.min(GOLD_SL_MAX_USD, 7.0 + w * 0.60));
  const buf = Math.max(1.0, targetCeDist - (w / 2));
  return Number(buf.toFixed(2));
}

/**
 * Compute Gold XAU/USD SL price anchored to CE with strict 60-100 pips ($6.00-$10.00) guardrail,
 * always placed outside the zone invalidation boundary ([low, high]).
 */
export function computeGoldSlPrice(side, low, high, ce, tf = 'M15', structuralSl = NaN) {
  const isSell = String(side || '').toUpperCase() === 'SELL';
  const lo = num(low);
  const hi = num(high);
  const entryCe = num(ce) || (Number.isFinite(lo) && Number.isFinite(hi) ? (lo + hi) / 2 : NaN);
  if (!Number.isFinite(entryCe)) return NaN;

  const width = (Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) ? (hi - lo) : 2.0;
  const isM5 = String(tf || 'M15').toUpperCase() === 'M5';
  const defaultDist = isM5
    ? Math.max(GOLD_SL_MIN_USD, Math.min(8.0, 6.0 + width * 0.55))
    : Math.max(7.0, Math.min(GOLD_SL_MAX_USD, 7.0 + width * 0.60));

  let desiredDist = defaultDist;
  const structNum = num(structuralSl);
  if (Number.isFinite(structNum)) {
    const rawDist = isSell ? (structNum - entryCe) : (entryCe - structNum);
    if (rawDist > 0) {
      desiredDist = Math.max(GOLD_SL_MIN_USD, Math.min(GOLD_SL_MAX_USD, rawDist));
    }
  }

  let slPrice = isSell ? (entryCe + desiredDist) : (entryCe - desiredDist);
  // Ensure SL always clears the zone edge with at least $0.80 buffer
  if (Number.isFinite(hi) && isSell && slPrice < hi + 0.80) {
    slPrice = hi + 0.80;
  } else if (Number.isFinite(lo) && !isSell && slPrice > lo - 0.80) {
    slPrice = lo - 0.80;
  }
  return Number(slPrice.toFixed(2));
}

/**
 * Evaluate a single zone chronologically across subsequent closed candles (conservative SL-first).
 * - Enforces valid-side approach (SELL approached from below, BUY approached from above) & rejects pre-broken zones.
 * - Uses 60-100 pips ($6.00-$10.00) Gold SL & proportional TP1/TP2 when zone.sl/tp1 are not explicitly provided.
 * - Prevents phantom maxFavorable inflation from pre-entry approach extremes on the touch candle.
 */
export function evaluateZoneLifecycleOnCandles(zone, candles, lookbackMs, nowMs) {
  const isSell = zone.side === 'SELL';
  const lo = num(zone.low);
  const hi = num(zone.high);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return null;

  const tf = String(zone.tf || 'M15').toUpperCase();
  const ce = num(zone.ce) || (lo + hi) / 2;
  const formedTimeSec = Number(zone.startTime || zone.time || 0);
  const formedIdx = Number.isInteger(zone.formedIndex) ? zone.formedIndex : -1;

  // Start checking strictly AFTER the zone formation candle
  const startIdx = formedIdx >= 0
    ? formedIdx + 1
    : candles.findIndex(c => c.openTime > formedTimeSec);
  if (startIdx < 0 || startIdx >= candles.length) return null;

  // Realistic 60-100 pip Gold SL when structural SL is not explicitly provided
  const hasExplicitSl = Number.isFinite(num(zone.sl));
  const sl = hasExplicitSl
    ? Number(num(zone.sl).toFixed(2))
    : computeGoldSlPrice(zone.side, lo, hi, ce, tf);

  // Find first VALID-SIDE candle touching [lo - 0.15, hi + 0.15].
  // Rejects wrong-side touches (e.g., SELL touched from above SL, or BUY touched from below SL) and pre-broken zones.
  let touchIdx = -1;
  for (let i = startIdx; i < candles.length; i += 1) {
    const c = candles[i];
    // If price opened already beyond the invalidation edge (wrong-side approach / already broken), zone is dead
    const openedWrongSide = isSell ? (c.open > hi + 0.25) : (c.open < lo - 0.25);
    if (openedWrongSide) return null;

    const touched = isSell
      ? (c.high >= lo - 0.15 && c.low <= hi + 0.15)
      : (c.low <= hi + 0.15 && c.high >= lo - 0.15);

    if (touched) {
      touchIdx = i;
      break;
    }

    // If a bar closed past the far edge without a valid retest (gap/jump over zone), zone is invalidated
    const jumpedPast = isSell ? (c.close > hi) : (c.close < lo);
    if (jumpedPast) return null;
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

  const risk = hasExplicitSl ? Math.max(1.5, Math.abs(ce - sl)) : Math.max(GOLD_SL_MIN_USD, Math.abs(ce - sl));
  const tp1Mult = hasExplicitSl ? 1.6 : 1.5;
  const tp2Mult = hasExplicitSl ? 2.8 : 2.5;
  const minTp1 = hasExplicitSl ? (tf === 'M5' ? 3.2 : 4.5) : (tf === 'M5' ? 9.0 : 10.5);
  const minTp2 = hasExplicitSl ? (tf === 'M5' ? 6.0 : 8.5) : (tf === 'M5' ? 15.0 : 17.5);
  const tp1 = num(zone.tp1) || Number((isSell ? ce - Math.max(risk * tp1Mult, minTp1) : ce + Math.max(risk * tp1Mult, minTp1)).toFixed(2));
  const tp2 = num(zone.tp2) || Number((isSell ? ce - Math.max(risk * tp2Mult, minTp2) : ce + Math.max(risk * tp2Mult, minTp2)).toFixed(2));

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

    const barInZone = isSell
      ? (c.high >= lo - 0.15 && c.low <= hi + 0.15)
      : (c.low <= hi + 0.15 && c.high >= lo - 0.15);
    const barHitCe = isSell ? (c.high >= ce) : (c.low <= ce);
    const hitSl = isSell ? (c.high > sl) : (c.low < sl);
    // On the touch candle itself, TP1/TP2 is only valid if candle closed favorably (avoiding pre-entry open/wick false TP)
    const hitTp1 = i === touchIdx
      ? (isSell ? (c.close <= tp1) : (c.close >= tp1))
      : (isSell ? (c.low <= tp1) : (c.high >= tp1));
    const hitTp2 = i === touchIdx
      ? (isSell ? (c.close <= tp2) : (c.close >= tp2))
      : (isSell ? (c.low <= tp2) : (c.high >= tp2));

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

    // Conservative SL-first when both hit on the same candle (unless TP1 was already secured on an earlier bar).
    // Must check SL BEFORE updating maxFavorable so a stopped-out bar never logs phantom post-SL profit!
    if (hitSl && status !== 'TP1_HIT' && status !== 'TP2_HIT') {
      status = 'SL_HIT';
      resolvedAt = barTs;
      break;
    }

    // On the touch candle itself (i === touchIdx), never count pre-entry approach extremes as favorable bounce!
    // Measure touch-bar bounce strictly from candle close (actual post-touch rejection), then full high/low on later bars.
    const fav = i === touchIdx
      ? (isSell ? Math.max(0, ce - c.close) : Math.max(0, c.close - ce))
      : (isSell ? Math.max(0, ce - c.low) : Math.max(0, c.high - ce));
    if (fav > maxFavorable) maxFavorable = fav;

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
    id: makePoiId(zone.side, tf, zone.kind, lo, hi),
    side: zone.side,
    tf,
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
    source: 'BACKFILL',
    engineVersion: BACKFILL_ENGINE_VERSION
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

  // 4. POI Touches & Outcomes from M15 & M5 FVG, OB, iFVG & Breaker Block (BB) zones
  // Applies strictly CAUSAL (pre-entry) ICT quality filters:
  // (a) Max zone width cap (<= $10.5 M15 / <= $7.5 M5)
  // (b) Session discipline: skip dead Rollover (04:00-07:00 WITA) & noisy Asia M5 FVG chop (07:00-14:00 WITA)
  // (c) Causal M15 trend alignment: raw counter-trend FVG skipped unless backed by reversal-grade OB/BB/iFVG
  // (d) Anti-opposite-overlap dedupe: never record conflicting BUY + SELL zones at the exact same price within 30m
  const m15TrendSeries = Array.isArray(ngM15?.structure?.trendByTime) ? ngM15.structure.trendByTime : [];
  const resolveCausalM15Trend = touchMs => {
    if (!m15TrendSeries.length) return 'NEUTRAL';
    const touchSec = Math.floor(touchMs / 1000);
    let lastTrend = 'NEUTRAL';
    for (let i = 0; i < m15TrendSeries.length; i += 1) {
      if (m15TrendSeries[i].time <= touchSec) lastTrend = m15TrendSeries[i].trend || 'NEUTRAL';
      else break;
    }
    return lastTrend;
  };
  const getWitaHour = tsMs => {
    const d = new Date(tsMs + 8 * 3600 * 1000);
    return Number.isNaN(d.getTime()) ? 14 : d.getUTCHours();
  };

  const candidatesEvaluated = [];
  const evalNgZones = (ng, candles, tf) => {
    if (!ng?.poi || !candles.length) return;
    const fvgList = Array.isArray(ng.poi.historyFvg) && ng.poi.historyFvg.length
      ? ng.poi.historyFvg
      : (Array.isArray(ng.poi.fvg) ? ng.poi.fvg : []);
    const obList = Array.isArray(ng.poi.historyOb) && ng.poi.historyOb.length
      ? ng.poi.historyOb
      : (Array.isArray(ng.poi.ob) ? ng.poi.ob : []);
    const ifvgList = Array.isArray(ng.poi.historyIfvg) && ng.poi.historyIfvg.length
      ? ng.poi.historyIfvg
      : (Array.isArray(ng.poi.ifvg) ? ng.poi.ifvg : []);
    const bbList = Array.isArray(ng.poi.historyBb) && ng.poi.historyBb.length
      ? ng.poi.historyBb
      : (Array.isArray(ng.poi.bb) ? ng.poi.bb : []);

    const rawZones = [
      ...bbList.map(z => ({ ...z, kind: 'BB' })),
      ...ifvgList.map(z => ({ ...z, kind: 'iFVG' })),
      ...obList.map(z => ({ ...z, kind: 'OB' })),
      ...fvgList.map(z => ({ ...z, kind: 'FVG' }))
    ];
    const minW = tf === 'M5' ? 1.25 : 1.50;
    const maxW = tf === 'M5' ? 7.5 : 10.5;
    const seenKeys = new Set();

    for (const z of rawZones) {
      const sideStr = String(z.side || z.direction || '').toUpperCase();
      const side = (sideStr === 'SELL' || sideStr === 'BEARISH') ? 'SELL' : 'BUY';
      const loVal = num(z.bot ?? z.low);
      const hiVal = num(z.top ?? z.high);
      if (!Number.isFinite(loVal) || !Number.isFinite(hiVal) || hiVal <= loVal) continue;
      const zWidth = hiVal - loVal;
      if (zWidth < minW || zWidth > maxW) continue;
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

      // Causal Pre-Entry Filter 1: Dead Rollover (04:00-07:00 WITA) & Asia M5 chop (07:00-14:00 WITA)
      // During Asia, only M15 structural zones are tracked; M5 scalper refinement activates from London Open (14:00+ WITA).
      const witaH = getWitaHour(evaluated.touchedAt);
      if (witaH >= 4 && witaH < 7) continue;
      if (witaH >= 7 && witaH < 14 && tf === 'M5') continue;

      // Causal Pre-Entry Filter 2: Causal M15 Trend Alignment
      // - M5 is strictly a trend-aligned refinement timeframe (never catch a falling knife on M5 against M15 trend).
      // - On M15, raw counter-trend FVG is skipped while institutional reversal OB/BB/iFVG remain allowed.
      const causalTrend = resolveCausalM15Trend(evaluated.touchedAt);
      const isAligned = (causalTrend === 'BULL' && side === 'BUY') || (causalTrend === 'BEAR' && side === 'SELL');
      const isCounter = (causalTrend === 'BULL' && side === 'SELL') || (causalTrend === 'BEAR' && side === 'BUY');
      if (isCounter && (tf === 'M5' || z.kind === 'FVG')) continue;

      // Priority score for resolving overlapping zones at the same price & window
      const kindWeight = z.kind === 'BB' ? 4 : (z.kind === 'iFVG' ? 3 : (z.kind === 'OB' ? 2 : 1));
      const priority = (isAligned ? 10 : 0) + (tf === 'M15' ? 3 : 0) + kindWeight;
      candidatesEvaluated.push({ evaluated, priority, isAligned });
    }
  };
  evalNgZones(ngM15, m15, 'M15');
  evalNgZones(ngM5, m5, 'M5');

  // Anti-Overlap Dedupe (strictly pre-entry: higher causal alignment / M15 / BB / iFVG / OB wins):
  // 1) Never record conflicting opposite-side (BUY vs SELL) zones at the same price within 30m.
  // 2) Never double-count stacked same-side zones on the same TF overlapping in price within 30m.
  candidatesEvaluated.sort((a, b) => b.priority - a.priority || a.evaluated.touchedAt - b.evaluated.touchedAt);
  const acceptedPois = [];
  for (const item of candidatesEvaluated) {
    const cur = item.evaluated;
    const hasConflict = acceptedPois.some(prev => {
      const sameWindow = Math.abs(prev.touchedAt - cur.touchedAt) <= 30 * 60 * 1000;
      if (!sameWindow) return false;
      if (prev.side !== cur.side) {
        return Math.max(prev.low, cur.low) <= Math.min(prev.high, cur.high) + 1.0;
      }
      if (prev.tf === cur.tf) {
        return Math.max(prev.low, cur.low) < Math.min(prev.high, cur.high) - 0.15;
      }
      return false;
    });
    if (hasConflict) continue;
    acceptedPois.push(cur);
  }
  acceptedPois.sort((a, b) => a.touchedAt - b.touchedAt);

  for (const evaluated of acceptedPois) {
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
      const slDist = Math.max(0.5, Math.abs((Number(evaluated.ce) || 0) - (Number(evaluated.sl) || 0)));
      const slPips = Math.round(slDist * GOLD_PIPS_PER_USD);
      const targetPrice = evaluated.status === 'TP2_HIT' ? evaluated.tp2 : evaluated.tp1;
      const tpDist = Math.max(0.5, Math.abs((Number(targetPrice) || 0) - (Number(evaluated.ce) || 0)));
      const tpPips = Math.round(tpDist * GOLD_PIPS_PER_USD);
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
          ? `Invalidasi SL $${fmt(evaluated.sl)} tembus (-$${slDist.toFixed(2)} / -${slPips}p)`
          : `Target tercapai +$${tpDist.toFixed(2)} (+${tpPips}p) dari CE $${fmt(evaluated.ce)}`,
        price: evaluated.status === 'SL_HIT' ? evaluated.sl : targetPrice,
        source: 'BACKFILL'
      });
    }
  }

  return { poiRecords, timelineEvents, engineVersion: BACKFILL_ENGINE_VERSION };
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
      const sl = num(plan.sl) || computeGoldSlPrice(plan.side, lo, hi, ceVal, tf);
      const risk = Math.max(1.8, Math.abs(ceVal - sl));
      const tp1 = num(plan.tp1) || Number((isSell ? ceVal - Math.max(risk * 1.5, 9.0) : ceVal + Math.max(risk * 1.5, 9.0)).toFixed(2));
      const tp2 = num(plan.tp2) || Number((isSell ? ceVal - Math.max(risk * 2.5, 15.0) : ceVal + Math.max(risk * 2.5, 15.0)).toFixed(2));
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
          const tp2Pips = Math.round(Math.abs((Number(rec.tp2) || 0) - (Number(rec.ce) || 0)) * GOLD_PIPS_PER_USD);
          alerts.push({
            type: 'TP2_HIT',
            poiId: rec.id,
            title: `👑 TP2 DOL ★ · ${rec.side} ${rec.kind} ${rec.tf} ($${fmt(rec.low)}–$${fmt(rec.high)})`,
            body: `Target penuh $${fmt(rec.tp2)} tercapai (+${tp2Pips} Pips). Posisi selesai!`,
            sound: 'gold'
          });
        }
      } else if (rec.status === 'SL_HIT') {
        if (!rec.notifiedSl) {
          rec.notifiedSl = true;
          const slDist = Math.abs((Number(rec.ce) || 0) - (Number(rec.sl) || 0));
          const slPips = Math.round(slDist * GOLD_PIPS_PER_USD);
          alerts.push({
            type: 'SL_HIT',
            poiId: rec.id,
            title: `🛡️ Jebol SL ✕ · ${rec.side} ${rec.kind} ${rec.tf} ($${fmt(rec.low)}–$${fmt(rec.high)})`,
            body: `Batas risiko $${fmt(rec.sl)} tersentuh (-$${slDist.toFixed(2)} / -${slPips}p). Disiplin risiko terjaga.`,
            sound: 'default'
          });
        }
      }

      if (rec.status === 'TP2_HIT' || rec.status === 'TP1_HIT' || rec.status === 'SL_HIT') {
        const slDist = Math.max(0.5, Math.abs((Number(rec.ce) || 0) - (Number(rec.sl) || 0)));
        const slPips = Math.round(slDist * GOLD_PIPS_PER_USD);
        const targetPrice = rec.status === 'TP2_HIT' ? rec.tp2 : rec.tp1;
        const tpDist = Math.max(0.5, Math.abs((Number(targetPrice) || 0) - (Number(rec.ce) || 0)));
        const tpPips = Math.round(tpDist * GOLD_PIPS_PER_USD);
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
            ? `Invalidasi SL $${fmt(rec.sl)} tersentuh live (-$${slDist.toFixed(2)} / -${slPips}p)`
            : `Target tercapai +$${tpDist.toFixed(2)} (+${tpPips}p) dari CE $${fmt(rec.ce)}`,
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
      engineVersion: Number(state?.engineVersion) || BACKFILL_ENGINE_VERSION,
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

  // When upgrading to v3+ profitable backfill engine, replace stale legacy BACKFILL records
  // inside the recent 48h window while preserving ALL LIVE records and older archived history.
  const incomingV3 = Number(backfilled?.engineVersion || 0) >= BACKFILL_ENGINE_VERSION;
  const legacyRefreshCutoff = nowMs - 48 * 3600 * 1000;
  for (const r of persisted?.poiRecords || []) {
    if (incomingV3 && r?.source === 'BACKFILL' && Number(r.engineVersion || 0) < BACKFILL_ENGINE_VERSION && Number(r.touchedAt || 0) >= legacyRefreshCutoff) {
      continue;
    }
    upsertPoi(r);
  }
  for (const r of backfilled?.poiRecords || []) upsertPoi(r);

  const evMap = new Map();
  const upsertEv = ev => {
    if (!ev || !ev.id || !Number.isFinite(ev.ts) || ev.ts < evCutoff) return;
    const prev = evMap.get(ev.id);
    if (!prev || (prev.source !== 'LIVE' && ev.source === 'LIVE')) {
      evMap.set(ev.id, { ...ev });
    }
  };
  for (const e of persisted?.timelineEvents || []) {
    if (incomingV3 && e?.source === 'BACKFILL' && (e.category === 'POI_TOUCH' || e.category === 'POI_OUTCOME') && Number(e.ts || 0) >= legacyRefreshCutoff) {
      continue;
    }
    upsertEv(e);
  }
  for (const e of backfilled?.timelineEvents || []) upsertEv(e);

  const sortedPois = [...poiMap.values()].sort((a, b) => b.touchedAt - a.touchedAt);
  const keptPois = sortedPois.slice(0, MAX_POI_RECORDS);
  const overflowPois = sortedPois.slice(MAX_POI_RECORDS);

  // Merge both dailyArchive maps first (richer summary wins per date; rebuild dates refreshed by v3 cleanly)
  const mergedArchive = normalizeDailyArchiveMap(persisted?.dailyArchive || {});
  if (incomingV3) {
    const todayKey = witaDateKey(nowMs);
    const yesterdayKey = witaDateKey(nowMs - 24 * 3600 * 1000);
    delete mergedArchive[todayKey];
    delete mergedArchive[yesterdayKey];
  }
  const incomingArchive = normalizeDailyArchiveMap(backfilled?.dailyArchive || {});
  for (const [k, v] of Object.entries(incomingArchive)) {
    mergedArchive[k] = pickRicherDayArchive(mergedArchive[k], v);
  }
  const dailyArchive = rebuildDailyArchive(keptPois, mergedArchive, [...evictedPois, ...overflowPois]);

  return {
    version: 2,
    engineVersion: incomingV3 ? BACKFILL_ENGINE_VERSION : Number(persisted?.engineVersion || 2),
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
    ifvgTotal: 0,
    bbTotal: 0,
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
      monthAgg.ifvgTotal += Number(summary.ifvgTotal) || 0;
      monthAgg.bbTotal += Number(summary.bbTotal) || 0;
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

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}

/**
 * Compute honest signed PnL metrics for a single POI record (SL_HIT is strictly negative, TP1/TP2 strictly positive).
 * XAU/USD convention: $1.00 = 10 pips.
 */
export function computePoiRecordPnl(rec, riskUsd = 75) {
  const ce = num(rec?.ce) || ((num(rec?.low) + num(rec?.high)) / 2) || 0;
  const sl = num(rec?.sl) || 0;
  const tp1 = num(rec?.tp1) || 0;
  const tp2 = num(rec?.tp2) || 0;
  const status = String(rec?.status || 'TESTING').toUpperCase();
  const safeRisk = Math.max(0, round2(Number(riskUsd) || 0));

  const slDistUsd = (ce > 0 && sl > 0) ? Math.max(0.5, round2(Math.abs(ce - sl))) : GOLD_SL_MIN_USD;
  const slPips = Math.round(slDistUsd * GOLD_PIPS_PER_USD);

  if (status === 'SL_HIT') {
    return {
      status,
      isRealized: true,
      isWin: false,
      isLoss: true,
      slDistUsd,
      slPips,
      priceDeltaUsd: -round2(slDistUsd),
      pips: -round1(slDistUsd * GOLD_PIPS_PER_USD),
      rr: -1,
      riskUsd: safeRisk,
      pnlUsd: -safeRisk
    };
  }

  if (status === 'TP1_HIT' || status === 'TP2_HIT') {
    const target = status === 'TP2_HIT' ? (tp2 || tp1) : tp1;
    const fallbackMult = status === 'TP2_HIT' ? 2.5 : 1.5;
    const tpDistUsd = (ce > 0 && target > 0)
      ? Math.max(0.5, round2(Math.abs(target - ce)))
      : round2(slDistUsd * fallbackMult);
    const maxRr = status === 'TP2_HIT' ? 6.0 : 5.0;
    const rr = round2(Math.max(0.5, Math.min(maxRr, tpDistUsd / slDistUsd)));
    return {
      status,
      isRealized: true,
      isWin: true,
      isLoss: false,
      slDistUsd,
      slPips,
      priceDeltaUsd: round2(tpDistUsd),
      pips: round1(tpDistUsd * GOLD_PIPS_PER_USD),
      rr,
      riskUsd: safeRisk,
      pnlUsd: round2(safeRisk * rr)
    };
  }

  return {
    status,
    isRealized: false,
    isWin: false,
    isLoss: false,
    slDistUsd,
    slPips,
    priceDeltaUsd: 0,
    pips: 0,
    rr: 0,
    riskUsd: safeRisk,
    pnlUsd: 0
  };
}

/**
 * Chronologically compound POI history outcomes from baseBalanceUsd using riskPct per POI.
 * Returns exact per-record signed PnL map and resulting endingBalanceUsd so Riwayat POI and Profile stay 100% synced.
 */
export function computePoiPortfolioLedger(poiRecords = [], {
  baseBalanceUsd = 5000,
  riskPct = 1.5
} = {}) {
  const startBal = Math.max(0, round2(Number(baseBalanceUsd) || 0));
  const safeRiskPct = Math.max(0.1, Math.min(25, Number(riskPct) || 1.5));
  const list = Array.isArray(poiRecords) ? poiRecords : [];

  const resolved = list
    .filter(r => r && (r.status === 'SL_HIT' || r.status === 'TP1_HIT' || r.status === 'TP2_HIT'))
    .slice()
    .sort((a, b) => {
      const ta = Number(a.resolvedAt || a.touchedAt || 0);
      const tb = Number(b.resolvedAt || b.touchedAt || 0);
      if (ta !== tb) return ta - tb;
      return String(a.id || '').localeCompare(String(b.id || ''));
    });

  let runningBal = startBal;
  let netPnlUsd = 0;
  let netPips = 0;
  let winCount = 0;
  let lossCount = 0;
  const perRecord = new Map();

  for (const rec of resolved) {
    const riskUsd = round2((runningBal * safeRiskPct) / 100);
    const info = computePoiRecordPnl(rec, riskUsd);
    const nextBal = Math.max(0, round2(runningBal + info.pnlUsd));
    const appliedPnl = round2(nextBal - runningBal);
    runningBal = nextBal;
    netPnlUsd = round2(netPnlUsd + appliedPnl);
    netPips = round1(netPips + info.pips);
    if (info.isWin) winCount += 1;
    else if (info.isLoss) lossCount += 1;

    perRecord.set(rec.id, {
      ...info,
      pnlUsd: appliedPnl,
      balanceAfterUsd: runningBal
    });
  }

  // Also compute non-realized metadata (slPips, potential riskUsd) for open records
  const currentRiskUsd = round2((runningBal * safeRiskPct) / 100);
  for (const rec of list) {
    if (!rec || !rec.id || perRecord.has(rec.id)) continue;
    perRecord.set(rec.id, {
      ...computePoiRecordPnl(rec, currentRiskUsd),
      balanceAfterUsd: runningBal
    });
  }

  return {
    startingBalanceUsd: startBal,
    endingBalanceUsd: runningBal,
    netPnlUsd,
    netPips,
    closedCount: resolved.length,
    winCount,
    lossCount,
    perRecord
  };
}

/**
 * Classify a timestamp (ms) into WITA (UTC+8) Gold trading session buckets.
 */
export function classifyWitaSession(tsMs) {
  const n = Number(tsMs);
  if (!Number.isFinite(n) || n <= 0) return 'Lainnya';
  const witaHour = new Date(n + 8 * 3600 * 1000).getUTCHours();
  if (witaHour >= 7 && witaHour <= 14) return 'Asia';
  if (witaHour >= 15 && witaHour <= 19) return 'London';
  if (witaHour >= 20 || witaHour <= 3) return 'NY';
  return 'Transisi';
}

function normalizePoiKindBucket(rawKind) {
  const k = String(rawKind || 'POI').trim().toUpperCase();
  if (k.includes('IFVG')) return 'iFVG';
  if (k.includes('FVG')) return 'FVG';
  if (k.includes('BB') || k.includes('BREAKER')) return 'BB';
  if (k.includes('OB') || k.includes('ORDER')) return 'OB';
  return k || 'POI';
}

/**
 * Summarize POI reaction performance by Zone Kind (OB/FVG/iFVG/BB) and WITA Session (Asia/London/NY).
 * Pure zero-DOM helper used by Mapping Riwayat POI and AMY Assistant.
 */
export function summarizePoiBreakdown(poiRecords = [], range = 'ALL', nowMs = Date.now(), ledger = null) {
  const scoped = range === 'ALL'
    ? (Array.isArray(poiRecords) ? poiRecords : [])
    : filterByRange(poiRecords, 'touchedAt', range, nowMs);

  const kindMap = new Map();
  const sessionMap = new Map();

  const bump = (map, key, rec, pnlInfo) => {
    const row = map.get(key) || {
      key,
      total: 0,
      wins: 0,
      losses: 0,
      active: 0,
      resolved: 0,
      respectRate: null,
      netPips: 0,
      netUsd: 0
    };
    row.total += 1;
    const st = String(rec?.status || 'TESTING').toUpperCase();
    if (st === 'TP1_HIT' || st === 'TP2_HIT') {
      row.wins += 1;
      row.resolved += 1;
    } else if (st === 'SL_HIT') {
      row.losses += 1;
      row.resolved += 1;
    } else {
      row.active += 1;
    }
    if (pnlInfo && pnlInfo.isRealized) {
      row.netPips = round1(row.netPips + (Number(pnlInfo.pips) || 0));
      row.netUsd = round2(row.netUsd + (Number(pnlInfo.pnlUsd) || 0));
    }
    map.set(key, row);
  };

  let resolvedTotal = 0;
  for (const rec of scoped) {
    if (!rec) continue;
    const pnlInfo = ledger?.perRecord?.get(rec.id) || computePoiRecordPnl(rec, 0);
    if (pnlInfo?.isRealized) resolvedTotal += 1;
    bump(kindMap, normalizePoiKindBucket(rec.kind), rec, pnlInfo);
    bump(sessionMap, classifyWitaSession(rec.touchedAt), rec, pnlInfo);
  }

  const finalize = (map, orderList = null) =>
    Array.from(map.values())
      .map(row => ({
        ...row,
        respectRate: row.resolved > 0 ? Math.round((row.wins / row.resolved) * 100) : null
      }))
      .sort((a, b) => {
        if (orderList) {
          const ia = orderList.indexOf(a.key);
          const ib = orderList.indexOf(b.key);
          if (ia !== -1 && ib !== -1 && ia !== ib) return ia - ib;
          if (ia !== -1) return -1;
          if (ib !== -1) return 1;
        }
        const ra = a.respectRate ?? -1;
        const rb = b.respectRate ?? -1;
        if (rb !== ra) return rb - ra;
        return b.total - a.total;
      });

  const byKind = finalize(kindMap);
  const bySession = finalize(sessionMap, ['Asia', 'London', 'NY', 'Transisi', 'Lainnya']);

  const pickBest = rows => {
    const candidates = rows.filter(r => r.resolved > 0);
    if (!candidates.length) return null;
    return candidates
      .slice()
      .sort((a, b) => (b.respectRate - a.respectRate) || (b.netPips - a.netPips) || (b.resolved - a.resolved))[0];
  };

  return {
    total: scoped.length,
    resolved: resolvedTotal,
    byKind,
    bySession,
    bestKind: pickBest(byKind),
    bestSession: pickBest(bySession)
  };
}

if (typeof window !== 'undefined') {
  window.AmyMappingHistoryEngine = {
    HISTORY_STORAGE_KEY,
    BACKFILL_ENGINE_VERSION,
    GOLD_SL_MIN_USD,
    GOLD_SL_MAX_USD,
    GOLD_PIPS_PER_USD,
    SEVEN_DAYS_MS,
    MAX_RETENTION_MS,
    TIMELINE_RETENTION_MS,
    MAX_POI_RECORDS,
    MAX_TIMELINE_EVENTS,
    computeGoldSlBuffer,
    computeGoldSlPrice,
    computePoiRecordPnl,
    computePoiPortfolioLedger,
    classifyWitaSession,
    summarizePoiBreakdown,
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
