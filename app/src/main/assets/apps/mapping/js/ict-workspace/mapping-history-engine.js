/**
 * Pure Mapping Reaction Timeline & POI Outcome Tracker Engine
 * - Auto-backfills recent POI touches/outcomes, Liquidity Sweeps, BOS/MSS, and Key Level hits from M15/M5 candles.
 * - Tracks live real-time POI lifecycle (TESTING -> REACTING -> TP1_HIT -> TP2_HIT / SL_HIT) with 7-day persistence.
 * - Zero DOM dependencies so all logic is deterministically unit-tested via node:test.
 */

import {
  POI_QUALITY_RULES,
  getWitaHour,
  requiresHybridRejection,
  evaluatePoiQualityGate
} from './mapping-accuracy.js';

export const HISTORY_STORAGE_KEY = 'amyfx.mapping.reaction_history.v1';
export const BACKFILL_ENGINE_VERSION = 8;
export const GOLD_SL_MIN_USD = 6.0;  // 60 pips XAU/USD ($1.00 = 10 pips)
export const GOLD_TIGHT_SL_MIN_USD = 4.5; // 45 pips XAU/USD (Smart Tight SL after rejection/sweep)
export const GOLD_SL_MAX_USD = 10.0; // 100 pips XAU/USD
export const GOLD_SPREAD_USD = 0.30; // 3.0 pips realistic XAU/USD broker spread
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

  const fallbackNetR = Math.round(((tp2 * 2.5) + (tp1 * 1.5) - sl) * 10) / 10;
  const netR = Number.isFinite(Number(raw.netR)) ? Math.round(Number(raw.netR) * 10) / 10 : fallbackNetR;
  const netPips = Number.isFinite(Number(raw.netPips)) ? Math.round(Number(raw.netPips)) : null;

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
    netR,
    netPips,
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
    judasTotal: Math.max(0, Math.round(Number(raw.judasTotal) || 0)),
    sweepTotal: Math.max(0, Math.round(Number(raw.sweepTotal) || 0)),
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
  let judasTotal = 0;
  let sweepTotal = 0;
  let netR = 0;
  let netPips = 0;
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

    if (isWin || isSl) {
      const pnl = computePoiRecordPnl(r);
      netR += Number(pnl.rr) || 0;
      netPips += Number(pnl.pips) || 0;
    }

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
    else if (kind === 'JUDAS') judasTotal += 1;
    else if (kind === 'SWEEP') sweepTotal += 1;
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
    netR: Math.round(netR * 10) / 10,
    netPips: Math.round(netPips),
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
    judasTotal,
    sweepTotal,
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
      const openTime = Number(c.open_time ?? c.openTime ?? c.time);
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
export function evaluateZoneLifecycleOnCandles(zone, candles, lookbackMs, nowMs, options = {}) {
  const isSell = zone.side === 'SELL';
  const lo = num(zone.low);
  const hi = num(zone.high);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return null;

  const tf = String(zone.tf || 'M15').toUpperCase();
  const ce = num(zone.ce) || (lo + hi) / 2;
  const spreadUsd = Number.isFinite(Number(options?.spreadUsd)) ? Math.max(0, Number(options.spreadUsd)) : GOLD_SPREAD_USD;

  // ZERO LOOK-AHEAD BIAS:
  // Always start checking strictly AFTER the confirmation candle closes:
  // - OB: BOS confirmation bar (formedTime / formedIndex), NEVER the earlier origin candle (startTime)!
  // - FVG: 3rd candle close (formedTime / formedIndex), NEVER candle 1 (startTime)!
  // - iFVG / BB: breaking confirmation bar (formedTime / formedIndex).
  const originTimeSec = Number(zone.startTime || zone.time || 0);
  const formedTimeSec = Number(zone.formedTime || 0);
  const formedIdx = Number.isInteger(zone.formedIndex) ? zone.formedIndex : -1;

  let startIdx = -1;
  if (formedTimeSec > 0) {
    startIdx = candles.findIndex(c => c.openTime > formedTimeSec);
  } else if (formedIdx >= 0 && formedIdx < candles.length) {
    // Allow formedIdx when its candle time is at or after originTimeSec (OB/FVG origin <= confirmation bar)
    const barTime = candles[formedIdx]?.openTime || 0;
    if (originTimeSec <= 0 || barTime >= originTimeSec) {
      startIdx = formedIdx + 1;
    }
  }
  if (startIdx < 0 && originTimeSec > 0) {
    startIdx = candles.findIndex(c => c.openTime > originTimeSec);
  }
  if (startIdx < 0 || startIdx >= candles.length) return null;

  // Realistic 60-100 pip Gold SL when structural SL is not explicitly provided
  const hasExplicitSl = Number.isFinite(num(zone.sl));
  const sl = hasExplicitSl
    ? Number(num(zone.sl).toFixed(2))
    : computeGoldSlPrice(zone.side, lo, hi, ce, tf);

  // Find first VALID-SIDE candle touching [lo - 0.15, hi + 0.15].
  // - Rejects pre-broken zones that open on the wrong side immediately after confirmation (no prior valid-side bar).
  // - Honestly records instant SL_HIT if price WAS on the valid side and then gaps/blasts straight through CE to SL!
  let touchIdx = -1;
  let hadValidSideBar = false;
  let gapBlowoutSl = false;
  for (let i = startIdx; i < candles.length; i += 1) {
    const c = candles[i];
    const openedWrongSide = isSell ? (c.open > hi + 0.25) : (c.open < lo - 0.25);
    if (openedWrongSide) {
      if (!hadValidSideBar) return null;
      // Price was previously on the valid side, then gapped straight through the zone (Limit at CE fills at gap open -> SL if breached)
      const gapHitSl = isSell ? (c.high + spreadUsd >= sl) : (c.low <= sl);
      if (gapHitSl) {
        touchIdx = i;
        gapBlowoutSl = true;
        break;
      }
      return null;
    }

    const touched = isSell
      ? (c.high >= lo - 0.15 && c.low <= hi + 0.15)
      : (c.low <= hi + 0.15 && c.high >= lo - 0.15);

    if (touched) {
      touchIdx = i;
      break;
    }

    const jumpedPast = isSell ? (c.close > hi) : (c.close < lo);
    if (jumpedPast) {
      if (hadValidSideBar && (isSell ? (c.high + spreadUsd >= sl) : (c.low <= sl))) {
        touchIdx = i;
        gapBlowoutSl = true;
        break;
      }
      return null;
    }

    hadValidSideBar = true;
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

  const requireRejection = Boolean(options?.requireRejection);
  const risk = hasExplicitSl ? Math.max(1.5, Math.abs(ce - sl)) : Math.max(GOLD_SL_MIN_USD, Math.abs(ce - sl));
  const tp1Mult = hasExplicitSl ? 1.6 : 1.5;
  const tp2Mult = hasExplicitSl ? 2.8 : 2.5;
  const tp3Mult = hasExplicitSl ? 3.8 : 3.5;
  const minTp1 = hasExplicitSl ? (tf === 'M5' ? 3.2 : 4.5) : (tf === 'M5' ? 9.0 : 10.5);
  const minTp2 = hasExplicitSl ? (tf === 'M5' ? 6.0 : 8.5) : (tf === 'M5' ? 15.0 : 17.5);
  const minTp3 = hasExplicitSl ? (tf === 'M5' ? 8.5 : 12.0) : (tf === 'M5' ? 21.0 : 24.5);
  const tp1 = num(zone.tp1) || Number((isSell ? ce - Math.max(risk * tp1Mult, minTp1) : ce + Math.max(risk * tp1Mult, minTp1)).toFixed(2));
  const tp2 = num(zone.tp2) || Number((isSell ? ce - Math.max(risk * tp2Mult, minTp2) : ce + Math.max(risk * tp2Mult, minTp2)).toFixed(2));
  const tp3 = num(zone.tp3) || Number((isSell ? ce - Math.max(risk * tp3Mult, minTp3) : ce + Math.max(risk * tp3Mult, minTp3)).toFixed(2));

  // HYBRID REJECTION ENTRY MODE (v8: M5 & London Session):
  // Wait for a valid candle rejection close on touchIdx or touchIdx+1 (wick hits CE, body closes in trade direction, SL intact).
  // Anchor Smart Tight SL to the rejection wick + $2.00 (clamped 45p–100p) and evaluate strictly from rejIdx + 1!
  if (requireRejection) {
    if (gapBlowoutSl) return null;
    let rejIdx = -1;
    let seenCe = false;
    const maxRejIdx = Math.min(candles.length - 1, touchIdx + 1);
    for (let k = touchIdx; k <= maxRejIdx; k += 1) {
      const ck = candles[k];
      const hitSlK = isSell ? (ck.high + spreadUsd > sl) : (ck.low < sl);
      if (hitSlK) return null;
      if (isSell ? (ck.high >= ce) : (ck.low <= ce)) seenCe = true;
      const rejected = seenCe && (isSell
        ? (ck.close < ce && ck.close < ck.open)
        : (ck.close > ce && ck.close > ck.open));
      if (rejected) {
        rejIdx = k;
        break;
      }
    }
    if (rejIdx < 0) return null;

    const rejBar = candles[rejIdx];
    const rejEntry = Number(rejBar.close.toFixed(2));
    const rejTouchedAt = rejBar.closeTime * 1000;
    if (nowMs - rejTouchedAt > lookbackMs) return null;

    let rejExtreme = isSell ? -Infinity : Infinity;
    for (let k = touchIdx; k <= rejIdx; k += 1) {
      if (isSell) rejExtreme = Math.max(rejExtreme, candles[k].high);
      else rejExtreme = Math.min(rejExtreme, candles[k].low);
    }
    const rawTightRisk = isSell ? (rejExtreme + 2.0 - rejEntry) : (rejEntry - (rejExtreme - 2.0));
    const tightRisk = Math.max(GOLD_TIGHT_SL_MIN_USD, Math.min(GOLD_SL_MAX_USD, rawTightRisk));
    const effSl = Number((isSell ? (rejEntry + tightRisk) : (rejEntry - tightRisk)).toFixed(2));
    const effTp1 = Number((isSell ? (rejEntry - tightRisk * 1.5) : (rejEntry + tightRisk * 1.5)).toFixed(2));
    const effTp2 = Number((isSell ? (rejEntry - tightRisk * 2.5) : (rejEntry + tightRisk * 2.5)).toFixed(2));
    const effTp3 = Number((isSell ? (rejEntry - tightRisk * 3.5) : (rejEntry + tightRisk * 3.5)).toFixed(2));

    let rejStatus = 'TESTING';
    let rejResolvedAt = null;
    let rejMaxFav = 0;
    for (let i = rejIdx + 1; i < candles.length; i += 1) {
      const c = candles[i];
      const barTs = c.closeTime * 1000;
      const hitSl = isSell ? (c.high + spreadUsd > effSl) : (c.low < effSl);
      if (hitSl && rejStatus !== 'TP1_HIT' && rejStatus !== 'TP2_HIT') {
        rejStatus = 'SL_HIT';
        rejResolvedAt = barTs;
        break;
      }
      const fav = isSell ? Math.max(0, rejEntry - c.low) : Math.max(0, c.high - rejEntry);
      if (fav > rejMaxFav) rejMaxFav = fav;
      const hitTp2 = isSell ? (c.low + spreadUsd <= effTp2) : (c.high >= effTp2);
      const hitTp1 = isSell ? (c.low + spreadUsd <= effTp1) : (c.high >= effTp1);
      if (hitTp2) {
        rejStatus = 'TP2_HIT';
        rejResolvedAt = barTs;
        break;
      }
      if (hitTp1 && rejStatus !== 'TP1_HIT') {
        rejStatus = 'TP1_HIT';
        rejResolvedAt = barTs;
      } else if (rejStatus === 'TESTING' && fav >= 2.5) {
        rejStatus = 'REACTING';
      }
    }

    return {
      id: makePoiId(zone.side, tf, zone.kind, lo, hi),
      side: zone.side,
      tf,
      kind: zone.kind,
      low: Number(lo.toFixed(2)),
      high: Number(hi.toFixed(2)),
      ce: rejEntry,
      sl: effSl,
      tp1: effTp1,
      tp2: effTp2,
      tp3: effTp3,
      entryMode: 'REJECTION',
      touchedAt: rejTouchedAt,
      lastTouchAt: rejTouchedAt,
      touchCount: 1,
      ceTouched: true,
      touches: [{
        index: 1,
        time: rejBar.openTime,
        price: rejEntry,
        hitCe: true,
        broken: rejStatus === 'SL_HIT'
      }],
      touchPrice: rejEntry,
      maxFavorable: Number(rejMaxFav.toFixed(2)),
      status: rejStatus,
      resolvedAt: rejResolvedAt,
      notifiedCe: true,
      notifiedTp1: rejStatus === 'TP1_HIT' || rejStatus === 'TP2_HIT',
      notifiedTp2: rejStatus === 'TP2_HIT',
      notifiedSl: rejStatus === 'SL_HIT',
      source: 'BACKFILL',
      engineVersion: BACKFILL_ENGINE_VERSION
    };
  }

  let status = 'TESTING';
  let resolvedAt = null;
  let maxFavorable = 0;
  let touchCount = 0;
  let ceTouched = false;
  let ceFillIdx = -1;
  let inZonePrev = false;
  let lastTouchAt = touchedAt;
  const touches = [];

  if (gapBlowoutSl) {
    const barTs = touchBar.closeTime * 1000;
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
      tp3: Number(tp3.toFixed(2)),
      entryMode: 'LIMIT_CE',
      touchedAt,
      lastTouchAt: touchedAt,
      touchCount: 1,
      ceTouched: true,
      touches: [{
        index: 1,
        time: touchBar.openTime,
        price: Number(ce.toFixed(2)),
        hitCe: true,
        broken: true
      }],
      touchPrice: Number(ce.toFixed(2)),
      maxFavorable: 0,
      status: 'SL_HIT',
      resolvedAt: barTs,
      notifiedCe: true,
      notifiedTp1: false,
      notifiedTp2: false,
      notifiedSl: true,
      source: 'BACKFILL',
      engineVersion: BACKFILL_ENGINE_VERSION
    };
  }

  for (let i = touchIdx; i < candles.length; i += 1) {
    const c = candles[i];
    const barTs = c.closeTime * 1000;

    const barInZone = isSell
      ? (c.high >= lo - 0.15 && c.low <= hi + 0.15)
      : (c.low <= hi + 0.15 && c.high >= lo - 0.15);
    const barHitCe = isSell ? (c.high >= ce) : (c.low <= ce);

    // Realistic XAU/USD spread applied symmetrically:
    // - SELL SL triggers on Ask (high + spread >= sl); SELL TP triggers on Ask (low + spread <= tp)
    // - BUY SL triggers on Bid (low <= sl); BUY TP requires covering spread above TP (high >= tp + spread)
    const hitSl = isSell ? (c.high + spreadUsd > sl) : (c.low < sl);

    if (barInZone) {
      if (barHitCe && !ceTouched) {
        ceTouched = true;
        ceFillIdx = i;
      }
      const touchY = isSell ? Math.min(c.high, hi) : Math.max(c.low, lo);
      if (!inZonePrev) {
        touchCount += 1;
        lastTouchAt = c.openTime * 1000;
        touches.push({
          index: touchCount,
          time: c.openTime,
          price: Number(touchY.toFixed(2)),
          hitCe: barHitCe,
          broken: Boolean(ceTouched && hitSl && status !== 'TP1_HIT' && status !== 'TP2_HIT')
        });
      } else if (touches.length > 0) {
        const cur = touches[touches.length - 1];
        if (barHitCe) cur.hitCe = true;
        if (ceTouched && hitSl && status !== 'TP1_HIT' && status !== 'TP2_HIT') cur.broken = true;
      }
      inZonePrev = true;
    } else {
      inZonePrev = false;
    }

    // HONEST LIMIT-AT-CE FILL GATE:
    // Rencana Eksekusi POI sets entry at 50% CE. Do NOT evaluate WIN/SL before 50% CE is actually touched!
    // If price only grazes the outer edge and leaves without touching CE, a Limit-at-CE order was never filled.
    if (!ceTouched) {
      // If price somehow crossed past SL without registering barInZone, still capture SL honestly
      if (hitSl) {
        ceTouched = true;
        ceFillIdx = i;
        status = 'SL_HIT';
        resolvedAt = barTs;
        break;
      }
      continue;
    }

    // True MT5 Bid-chart mechanics:
    // - SELL closes at Ask (high + spread > sl, low + spread <= tp)
    // - BUY closes at Bid (low < sl, high >= tp)
    const isFillBar = i === ceFillIdx;
    const hitTp1 = isFillBar
      ? (isSell ? (c.close + spreadUsd <= tp1) : (c.close >= tp1))
      : (isSell ? (c.low + spreadUsd <= tp1) : (c.high >= tp1));
    const hitTp2 = isFillBar
      ? (isSell ? (c.close + spreadUsd <= tp2) : (c.close >= tp2))
      : (isSell ? (c.low + spreadUsd <= tp2) : (c.high >= tp2));

    // Conservative SL-first when both hit on the same candle (unless TP1 was already secured on an earlier bar).
    // Must check SL BEFORE updating maxFavorable so a stopped-out bar never logs phantom post-SL profit!
    if (hitSl && status !== 'TP1_HIT' && status !== 'TP2_HIT') {
      status = 'SL_HIT';
      resolvedAt = barTs;
      break;
    }

    // On the CE fill candle itself, never count pre-entry approach extremes as favorable bounce!
    const fav = isFillBar
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
    } else if (status === 'TESTING' && i > ceFillIdx && fav >= 2.5) {
      status = 'REACTING';
    }
  }

  // Strictly reject unfilled outer-edge grazes so Riwayat never inflates WR with missed CE trades!
  if (!ceTouched) return null;

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
    tp3: Number(tp3.toFixed(2)),
    entryMode: 'LIMIT_CE',
    touchedAt,
    lastTouchAt,
    touchCount: Math.max(1, touchCount),
    ceTouched: true,
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
 * Strictly causal v8 Setup Detectors on M15 candles:
 * 1) London Judas Swing (JUDAS): 1–2 bar sweep (>= $0.50) beyond causal Asia Range (07:00–14:00 WITA)
 *    during London/early NY (14:00–21:00 WITA) + clean reversal close back inside Asia Range.
 * 2) BSL / SSL Sweep Reversal (SWEEP / Turtle Soup): sweep (>= $0.50) beyond a strictly causal
 *    confirmed fractal swing (i - 3 confirmed at bar i) + same-bar reversal close back inside.
 * Both models strictly respect causal H1 HTF trend (aligned or neutral ONLY — never counter-H1).
 */
export function detectCausalJudasAndSweepSetups({
  m15Candles = [],
  h1TrendSeries = [],
  nowMs = Date.now(),
  lookbackMs = 48 * 3600 * 1000,
  spreadUsd = GOLD_SPREAD_USD
} = {}) {
  const candles = normalizeCandles(m15Candles);
  if (candles.length < 12) return [];

  const h1Series = Array.isArray(h1TrendSeries) ? h1TrendSeries : [];
  const resolveH1Dir = sec => {
    if (!h1Series.length) return 0;
    let trend = 'NEUTRAL';
    for (let i = 0; i < h1Series.length; i += 1) {
      if (h1Series[i].time <= sec) trend = h1Series[i].trend || 'NEUTRAL';
      else break;
    }
    if (trend === 'BULL') return 1;
    if (trend === 'BEAR') return -1;
    return 0;
  };

  const evaluateCloseTrade = (entryIdx, side, entryPrice, sweepExtreme, kind, zoneLo, zoneHi, metaLabel) => {
    const isSell = side === 'SELL';
    const entryBar = candles[entryIdx];
    const touchedAt = entryBar.closeTime * 1000;
    if (nowMs - touchedAt > lookbackMs || touchedAt > nowMs + 60000) return null;

    const rawRisk = isSell ? (sweepExtreme + 2.0 - entryPrice) : (entryPrice - (sweepExtreme - 2.0));
    const risk = Math.max(GOLD_TIGHT_SL_MIN_USD, Math.min(GOLD_SL_MAX_USD, rawRisk));
    const sl = Number((isSell ? (entryPrice + risk) : (entryPrice - risk)).toFixed(2));
    const tp1 = Number((isSell ? (entryPrice - risk * 1.5) : (entryPrice + risk * 1.5)).toFixed(2));
    const tp2 = Number((isSell ? (entryPrice - risk * 2.5) : (entryPrice + risk * 2.5)).toFixed(2));
    const tp3 = Number((isSell ? (entryPrice - risk * 3.5) : (entryPrice + risk * 3.5)).toFixed(2));

    let status = 'TESTING';
    let resolvedAt = null;
    let maxFavorable = 0;

    for (let j = entryIdx + 1; j < candles.length; j += 1) {
      const c = candles[j];
      const barTs = c.closeTime * 1000;
      const hitSl = isSell ? (c.high + spreadUsd > sl) : (c.low < sl);
      if (hitSl && status !== 'TP1_HIT' && status !== 'TP2_HIT') {
        status = 'SL_HIT';
        resolvedAt = barTs;
        break;
      }
      const fav = isSell ? Math.max(0, entryPrice - c.low) : Math.max(0, c.high - entryPrice);
      if (fav > maxFavorable) maxFavorable = fav;
      const hitTp2 = isSell ? (c.low + spreadUsd <= tp2) : (c.high >= tp2);
      const hitTp1 = isSell ? (c.low + spreadUsd <= tp1) : (c.high >= tp1);
      if (hitTp2) {
        status = 'TP2_HIT';
        resolvedAt = barTs;
        break;
      }
      if (hitTp1 && status !== 'TP1_HIT') {
        status = 'TP1_HIT';
        resolvedAt = barTs;
      } else if (status === 'TESTING' && fav >= 2.5) {
        status = 'REACTING';
      }
    }

    const lo = Number(Math.min(zoneLo, zoneHi).toFixed(2));
    const hi = Number(Math.max(zoneLo, zoneHi).toFixed(2));
    return {
      id: `POI:M15:${kind}:${side}:${entryBar.openTime}:${lo.toFixed(1)}-${hi.toFixed(1)}`,
      side,
      tf: 'M15',
      kind,
      label: metaLabel,
      low: lo,
      high: hi,
      ce: Number(entryPrice.toFixed(2)),
      sl,
      tp1,
      tp2,
      tp3,
      entryMode: 'REJECTION',
      touchedAt,
      lastTouchAt: touchedAt,
      touchCount: 1,
      ceTouched: true,
      touches: [{
        index: 1,
        time: entryBar.openTime,
        price: Number(entryPrice.toFixed(2)),
        hitCe: true,
        broken: status === 'SL_HIT'
      }],
      touchPrice: Number(entryPrice.toFixed(2)),
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
  };

  const results = [];

  // ── A. Causal Daily Asia Range + London Judas Swing (14:00–21:00 WITA) ──
  const asiaByDay = new Map();
  const judasFired = new Set(); // `${dayKey}:SELL` or `${dayKey}:BUY`

  for (let i = 0; i < candles.length; i += 1) {
    const c = candles[i];
    const barMs = c.openTime * 1000;
    const witaH = getWitaHour(barMs);
    const dayKey = witaDateKey(barMs);
    if (!dayKey) continue;

    if (witaH >= 7 && witaH < 14) {
      const box = asiaByDay.get(dayKey) || { high: -Infinity, low: Infinity, count: 0 };
      if (c.high > box.high) box.high = c.high;
      if (c.low < box.low) box.low = c.low;
      box.count += 1;
      asiaByDay.set(dayKey, box);
      continue;
    }

    if (witaH >= 14 && witaH < 21) {
      const box = asiaByDay.get(dayKey);
      if (!box || box.count < 8) continue;
      const asiaRange = box.high - box.low;
      if (asiaRange < 5.0 || asiaRange > 120.0) continue;

      const h1Dir = resolveH1Dir(c.openTime);
      const prev = i > 0 ? candles[i - 1] : null;
      const prevSameDayLondon = Boolean(prev && witaDateKey(prev.openTime * 1000) === dayKey && getWitaHour(prev.openTime * 1000) >= 14);

      // SELL London Judas: sweep >= $0.50 above Asia High (1–2 bars) + bearish close back inside Asia Range (H1 <= 0)
      if (h1Dir <= 0 && !judasFired.has(`${dayKey}:SELL`)) {
        const sweepHigh = Math.max(c.high, prevSameDayLondon ? prev.high : -Infinity);
        if (sweepHigh >= box.high + 0.50 && c.close < box.high && c.close < c.open && c.close > box.low) {
          judasFired.add(`${dayKey}:SELL`);
          const rec = evaluateCloseTrade(i, 'SELL', c.close, sweepHigh, 'JUDAS', box.high, sweepHigh, 'London Judas · Sweep Asia High');
          if (rec) results.push(rec);
        }
      }

      // BUY London Judas: sweep >= $0.50 below Asia Low (1–2 bars) + bullish close back inside Asia Range (H1 >= 0)
      if (h1Dir >= 0 && !judasFired.has(`${dayKey}:BUY`)) {
        const sweepLow = Math.min(c.low, prevSameDayLondon ? prev.low : Infinity);
        if (sweepLow <= box.low - 0.50 && c.close > box.low && c.close > c.open && c.close < box.high) {
          judasFired.add(`${dayKey}:BUY`);
          const rec = evaluateCloseTrade(i, 'BUY', c.close, sweepLow, 'JUDAS', sweepLow, box.low, 'London Judas · Sweep Asia Low');
          if (rec) results.push(rec);
        }
      }
    }
  }

  // ── B. Causal BSL / SSL Sweep Reversal (Turtle Soup, M15) ──
  const swingHighs = [];
  const swingLows = [];
  let lastSweepIdx = -99;

  for (let i = 6; i < candles.length; i += 1) {
    // Strictly causal fractal confirmation: pivot p = i - 3 is confirmed ONLY when bar i arrives!
    const p = i - 3;
    if (p >= 3) {
      const piv = candles[p];
      let isHigh = true;
      let isLow = true;
      for (let d = 1; d <= 3; d += 1) {
        if (candles[p - d].high >= piv.high || candles[p + d].high >= piv.high) isHigh = false;
        if (candles[p - d].low <= piv.low || candles[p + d].low <= piv.low) isLow = false;
      }
      if (isHigh) {
        swingHighs.push({ idx: p, price: piv.high, swept: false });
        if (swingHighs.length > 14) swingHighs.shift();
      }
      if (isLow) {
        swingLows.push({ idx: p, price: piv.low, swept: false });
        if (swingLows.length > 14) swingLows.shift();
      }
    }

    const c = candles[i];
    const witaH = getWitaHour(c.openTime * 1000);
    if (witaH >= 4 && witaH < 7) continue; // Dead rollover blocked
    if (i - lastSweepIdx < 4) continue;    // Cooldown prevents cluster spam

    const h1Dir = resolveH1Dir(c.openTime);

    // BSL Sweep → SELL (strictly H1 <= 0)
    if (h1Dir <= 0) {
      let targetHigh = null;
      for (let s = swingHighs.length - 1; s >= 0; s -= 1) {
        const sw = swingHighs[s];
        if (sw.swept || i - sw.idx < 4) continue;
        if (c.high >= sw.price + 0.50) {
          sw.swept = true;
          if (!targetHigh && c.close < sw.price && c.close < c.open) {
            targetHigh = sw;
          }
        }
      }
      if (targetHigh) {
        lastSweepIdx = i;
        const rec = evaluateCloseTrade(i, 'SELL', c.close, c.high, 'SWEEP', targetHigh.price, c.high, 'BSL Sweep Reversal');
        if (rec) results.push(rec);
        continue;
      }
    }

    // SSL Sweep → BUY (strictly H1 >= 0)
    if (h1Dir >= 0) {
      let targetLow = null;
      for (let s = swingLows.length - 1; s >= 0; s -= 1) {
        const sw = swingLows[s];
        if (sw.swept || i - sw.idx < 4) continue;
        if (c.low <= sw.price - 0.50) {
          sw.swept = true;
          if (!targetLow && c.close > sw.price && c.close > c.open) {
            targetLow = sw;
          }
        }
      }
      if (targetLow) {
        lastSweepIdx = i;
        const rec = evaluateCloseTrade(i, 'BUY', c.close, c.low, 'SWEEP', c.low, targetLow.price, 'SSL Sweep Reversal');
        if (rec) results.push(rec);
      }
    }
  }

  return results;
}

/**
 * Select the single freshest actionable live London Judas or BSL/SSL Sweep Reversal setup
 * for display in the Execution Plan card. Strictly excludes resolved (SL_HIT / TP2_HIT)
 * or stale (> maxAgeMs) setups, prioritizes JUDAS over SWEEP, and flags FOMO chase warnings.
 */
export function selectActiveLiveJudasOrSweep(setups = [], {
  lastCandleMs = 0,
  livePrice = NaN,
  maxAgeMs = 3 * 3600 * 1000,
  spreadUsd = GOLD_SPREAD_USD
} = {}) {
  if (!Array.isArray(setups) || !setups.length) return null;
  const refMs = Number.isFinite(Number(lastCandleMs)) && Number(lastCandleMs) > 0
    ? Number(lastCandleMs)
    : Date.now();
  const price = num(livePrice);

  const candidates = [];
  for (const s of setups) {
    if (!s) continue;
    const kind = String(s.kind || '').toUpperCase();
    if (kind !== 'JUDAS' && kind !== 'SWEEP') continue;
    const st = String(s.status || 'TESTING').toUpperCase();
    if (st === 'SL_HIT' || st === 'TP2_HIT') continue;

    const touchedAt = Number(s.touchedAt) || 0;
    if (!touchedAt) continue;
    const ageMs = refMs - touchedAt;
    if (ageMs < -60000 || ageMs > maxAgeMs) continue;

    const isSell = String(s.side || '').toUpperCase() === 'SELL';
    const ce = num(s.ce);
    const sl = num(s.sl);
    const tp1 = num(s.tp1);
    const tp2 = num(s.tp2);
    const tp3 = num(s.tp3);
    if (!Number.isFinite(ce) || !Number.isFinite(sl)) continue;

    // Exclude if live tick has already invalidated SL or finished TP2
    if (Number.isFinite(price)) {
      const liveSlHit = isSell ? (price + spreadUsd > sl) : (price < sl);
      const liveTp2Hit = Number.isFinite(tp2) && (isSell ? (price + spreadUsd <= tp2) : (price >= tp2));
      if (liveSlHit || liveTp2Hit) continue;
    }

    const risk = Math.max(1.0, Math.abs(ce - sl));
    const slPips = Math.round(risk * GOLD_PIPS_PER_USD);
    const moveFromEntry = Number.isFinite(price)
      ? (isSell ? (ce - price) : (price - ce))
      : 0;
    const hitTp1Live = st === 'TP1_HIT' || (
      Number.isFinite(price) && Number.isFinite(tp1) &&
      (isSell ? (price + spreadUsd <= tp1) : (price >= tp1))
    );

    let entryState = 'READY';
    let stateLabel = 'Sinyal Aktif · Siap Eksekusi';
    if (hitTp1Live) {
      entryState = 'TP1_BEP';
      stateLabel = 'TP1 Tercapai · Geser BEP / Runner';
    } else if (moveFromEntry > risk * 0.65) {
      entryState = 'CHASE_WARN';
      stateLabel = `Sudah Jalan +$${moveFromEntry.toFixed(1)} · Jangan Kejar`;
    } else if (moveFromEntry < -0.5) {
      entryState = 'RETEST';
      stateLabel = 'Retest Area Sweep · R:R Lebih Ketat';
    }

    candidates.push({
      ...s,
      kind,
      side: isSell ? 'SELL' : 'BUY',
      risk: Number(risk.toFixed(2)),
      slPips,
      tp3: Number.isFinite(tp3) ? tp3 : Number((isSell ? (ce - risk * 3.5) : (ce + risk * 3.5)).toFixed(2)),
      ageMinutes: Math.max(0, Math.round(ageMs / 60000)),
      moveFromEntry: Number(moveFromEntry.toFixed(2)),
      entryState,
      stateLabel
    });
  }

  if (!candidates.length) return null;
  // Prioritize JUDAS over SWEEP, then freshest touchedAt
  candidates.sort((a, b) => {
    const kwA = a.kind === 'JUDAS' ? 2 : 1;
    const kwB = b.kind === 'JUDAS' ? 2 : 1;
    if (kwB !== kwA) return kwB - kwA;
    return b.touchedAt - a.touchedAt;
  });
  return candidates[0];
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
  ngH1 = null,
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
  // Applies strictly CAUSAL (pre-entry) ICT v7 quality filters:
  // (a) Max zone width cap (<= $10.5 M15 / <= $7.5 M5)
  // (b) Session discipline: skip dead Rollover (04:00-07:00 WITA) & noisy Asia M5 chop (07:00-14:00 WITA)
  // (c) Causal H1 HTF trend alignment: block all POI entries fighting the H1 structural trend
  // (d) Causal M15 trend alignment: block counter-trend M5 and counter-trend M15 FVG/OB/iFVG (only M15 BB eligible)
  // (e) Anti-opposite-overlap dedupe: never record conflicting BUY + SELL zones at the exact same price within 90m
  const m15TrendSeries = Array.isArray(ngM15?.structure?.trendByTime) ? ngM15.structure.trendByTime : [];
  const h1TrendSeries = Array.isArray(ngH1?.structure?.trendByTime) ? ngH1.structure.trendByTime : [];
  const resolveCausalTrendFromSeries = (series, touchMs) => {
    if (!series.length) return 'NEUTRAL';
    const touchSec = Math.floor(touchMs / 1000);
    let lastTrend = 'NEUTRAL';
    for (let i = 0; i < series.length; i += 1) {
      if (series[i].time <= touchSec) lastTrend = series[i].trend || 'NEUTRAL';
      else break;
    }
    return lastTrend;
  };
  const resolveCausalM15Trend = touchMs => resolveCausalTrendFromSeries(m15TrendSeries, touchMs);
  const resolveCausalH1Trend = touchMs => resolveCausalTrendFromSeries(h1TrendSeries, touchMs);

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
    const rules = POI_QUALITY_RULES[tf === 'M5' ? 'M5' : 'M15'];
    const minW = rules.minWidth;
    const maxW = rules.maxWidth;
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

      const zoneInput = {
        side,
        tf,
        kind: z.kind,
        low: loVal,
        high: hiVal,
        ce: z.ce,
        startTime: z.startTime,
        formedTime: z.formedTime,
        formedIndex: z.formedIndex
      };

      // Mapping POI Engine v8 — Hybrid Rejection Gate:
      // M5 ALWAYS requires rejection close; M15 during London (14:00–20:00 WITA) also requires rejection close.
      let evaluated = evaluateZoneLifecycleOnCandles(
        zoneInput,
        candles,
        lookbackMs,
        nowMs,
        { requireRejection: tf === 'M5' }
      );
      if (!evaluated) continue;

      if (tf === 'M15' && requiresHybridRejection({ tf: 'M15', nowMs: evaluated.touchedAt })) {
        evaluated = evaluateZoneLifecycleOnCandles(
          zoneInput,
          candles,
          lookbackMs,
          nowMs,
          { requireRejection: true }
        );
        if (!evaluated) continue;
      }

      // Apply the EXACT SAME SSOT Quality Gate used by Card Rencana Eksekusi POI:
      // (1) Width bounds, (2) Dead Rollover & Asia M5 filter, (3) Causal H1 + M15 trend alignment.
      const causalTrend = resolveCausalM15Trend(evaluated.touchedAt);
      const causalM15Dir = causalTrend === 'BULL' ? 1 : (causalTrend === 'BEAR' ? -1 : 0);
      const causalH1Trend = resolveCausalH1Trend(evaluated.touchedAt);
      const causalH1Dir = causalH1Trend === 'BULL' ? 1 : (causalH1Trend === 'BEAR' ? -1 : 0);
      const gate = evaluatePoiQualityGate({
        tf,
        kind: z.kind,
        side,
        width: zWidth,
        m15Dir: causalM15Dir,
        h1Dir: causalH1Dir,
        nowMs: evaluated.touchedAt
      });
      if (!gate.allowed) continue;

      const isAligned = (causalM15Dir === 1 && side === 'BUY') || (causalM15Dir === -1 && side === 'SELL');
      const isH1Aligned = (causalH1Dir === 1 && side === 'BUY') || (causalH1Dir === -1 && side === 'SELL');
      // Priority score for resolving overlapping zones at the same price & window
      const kindWeight = z.kind === 'BB' ? 4 : (z.kind === 'iFVG' ? 3 : (z.kind === 'OB' ? 2 : 1));
      const priority = (isH1Aligned ? 6 : 0) + (isAligned ? 10 : 0) + (tf === 'M15' ? 3 : 0) + kindWeight;
      candidatesEvaluated.push({ evaluated, priority, isAligned, isH1Aligned });
    }
  };
  evalNgZones(ngM15, m15, 'M15');
  evalNgZones(ngM5, m5, 'M5');

  // Mapping POI Engine v8 — Causal London Judas Swing & BSL/SSL Sweep Reversal (M15, H1-aligned/neutral)
  const judasAndSweeps = detectCausalJudasAndSweepSetups({
    m15Candles: m15,
    h1TrendSeries,
    nowMs,
    lookbackMs
  });
  for (const setup of judasAndSweeps) {
    const causalTrend = resolveCausalM15Trend(setup.touchedAt);
    const causalM15Dir = causalTrend === 'BULL' ? 1 : (causalTrend === 'BEAR' ? -1 : 0);
    const causalH1Trend = resolveCausalH1Trend(setup.touchedAt);
    const causalH1Dir = causalH1Trend === 'BULL' ? 1 : (causalH1Trend === 'BEAR' ? -1 : 0);
    const isAligned = (causalM15Dir === 1 && setup.side === 'BUY') || (causalM15Dir === -1 && setup.side === 'SELL');
    const isH1Aligned = (causalH1Dir === 1 && setup.side === 'BUY') || (causalH1Dir === -1 && setup.side === 'SELL');
    const kindWeight = setup.kind === 'JUDAS' ? 5 : 2;
    const priority = (isH1Aligned ? 6 : 0) + (isAligned ? 10 : 0) + 3 + kindWeight;
    candidatesEvaluated.push({ evaluated: setup, priority, isAligned, isH1Aligned });
  }

  // Anti-Overlap Dedupe (strictly pre-entry: higher causal alignment / M15 / BB / iFVG / OB wins):
  // 1) Never record conflicting opposite-side (BUY vs SELL) zones at the same price within 90m.
  // 2) Never double-count stacked/overlapping same-side zones on same TF or superseded by M15 within 90m.
  candidatesEvaluated.sort((a, b) => b.priority - a.priority || a.evaluated.touchedAt - b.evaluated.touchedAt);
  const acceptedPois = [];
  for (const item of candidatesEvaluated) {
    const cur = item.evaluated;
    const hasConflict = acceptedPois.some(prev => {
      const diffMs = Math.abs(prev.touchedAt - cur.touchedAt);
      if (diffMs > 90 * 60 * 1000) return false;
      if (prev.side !== cur.side) {
        return Math.max(prev.low, cur.low) <= Math.min(prev.high, cur.high) + 1.0;
      }
      const overlap = Math.min(prev.high, cur.high) - Math.max(prev.low, cur.low);
      if (prev.tf === cur.tf) {
        return overlap > 0.15;
      }
      const minWidth = Math.max(0.5, Math.min(prev.high - prev.low, cur.high - cur.low));
      return overlap >= minWidth * 0.45 && diffMs <= 60 * 60 * 1000;
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
    } else if (!existing.notifiedTouch && (nowMs - (Number(existing.touchedAt) || 0)) <= 25 * 60 * 1000) {
      existing.notifiedTouch = true;
      if (hitCeNow) existing.ceTouched = true;
      if (hitCeNow) existing.notifiedCe = true;
      existing.lastTouchAt = nowMs;
      const icon = existing.side === 'BUY' ? '🟢' : '🔴';
      const touchTitle = hitCeNow
        ? `${icon} ${existing.side} ${existing.kind} ${existing.tf} · Sentuh 50% CE ($${fmt(existing.low)}–$${fmt(existing.high)})`
        : `${icon} ${existing.side} ${existing.kind} ${existing.tf} · Disentuh ($${fmt(existing.low)}–$${fmt(existing.high)})`;
      const tp2BodyStr = existing.tp2 ? ` | TP2 $${fmt(existing.tp2)}` : '';
      alerts.push({
        type: hitCeNow ? 'CE_TOUCH' : 'ZONE_TOUCH',
        poiId: existing.id,
        title: touchTitle,
        body: `CE $${fmt(existing.ce)} | SL $${fmt(existing.sl)} | TP1 $${fmt(existing.tp1)}${tp2BodyStr}`,
        sound: 'gold'
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
    // Check if live price just reached 50% CE on an outer-edge live watch record
    if (rec.ceTouched === false) {
      const hitCeLive = isSell ? (price >= rec.ce) : (price <= rec.ce);
      if (!hitCeLive) continue;
      rec.ceTouched = true;
      rec.lastTouchAt = nowMs;
      changed = true;
    }

    const fav = isSell ? Math.max(0, rec.ce - price) : Math.max(0, price - rec.ce);
    const hitSl = Number.isFinite(rec.sl) && (isSell ? (price + GOLD_SPREAD_USD > rec.sl) : (price < rec.sl));
    const hitTp1 = Number.isFinite(rec.tp1) && (isSell ? (price + GOLD_SPREAD_USD <= rec.tp1) : (price >= rec.tp1));
    const hitTp2 = Number.isFinite(rec.tp2) && (isSell ? (price + GOLD_SPREAD_USD <= rec.tp2) : (price >= rec.tp2));

    const prevStatus = rec.status;
    if (hitSl && rec.status !== 'TP1_HIT') {
      rec.status = 'SL_HIT';
      rec.resolvedAt = nowMs;
    } else {
      if (fav - (rec.maxFavorable || 0) >= 0.5) {
        rec.maxFavorable = Number(fav.toFixed(2));
        changed = true;
      }
      if (hitTp2) {
        rec.status = 'TP2_HIT';
        rec.resolvedAt = nowMs;
      } else if (hitTp1 && rec.status !== 'TP1_HIT') {
        rec.status = 'TP1_HIT';
        rec.resolvedAt = nowMs;
      } else if (rec.status === 'TESTING' && fav >= 2.5) {
        rec.status = 'REACTING';
      }
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
    merged.notifiedTouch = Boolean(prev.notifiedTouch || rec.notifiedTouch);
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
 * Emit pop-up alerts for newly backfilled POI setups / outcomes that occurred recently
 * (e.g. from closed M5/M15 candles or while user was on another tab) and haven't notified yet.
 */
export function collectFreshBackfillAlerts(prevState, nextState, nowMs = Date.now(), maxAgeMs = 25 * 60 * 1000) {
  if (!nextState || !Array.isArray(nextState.poiRecords) || nextState.poiRecords.length === 0) {
    return { state: nextState, alerts: [], changed: false };
  }
  const prevMap = new Map((prevState?.poiRecords || []).map(r => [r.id, r]));
  const alerts = [];
  let changed = false;

  const updatedRecords = nextState.poiRecords.map(rawRec => {
    const rec = { ...rawRec };
    const prev = prevMap.get(rec.id);
    const touchTs = Number(rec.lastTouchAt || rec.touchedAt || 0);
    const resolvedTs = Number(rec.resolvedAt || rec.touchedAt || 0);
    const touchIsFresh = touchTs > 0 && (nowMs - touchTs) <= maxAgeMs && (nowMs - touchTs) >= -60_000;
    const resolvedIsFresh = resolvedTs > 0 && (nowMs - resolvedTs) <= maxAgeMs && (nowMs - resolvedTs) >= -60_000;
    const icon = rec.side === 'BUY' ? '🟢' : '🔴';

    if (!rec.notifiedTouch && touchIsFresh && (!prev || !prev.notifiedTouch)) {
      rec.notifiedTouch = true;
      if (rec.ceTouched) rec.notifiedCe = true;
      changed = true;
      const touchTitle = rec.ceTouched
        ? `${icon} ${rec.side} ${rec.kind} ${rec.tf} · Sentuh 50% CE ($${fmt(rec.low)}–$${fmt(rec.high)})`
        : `${icon} ${rec.side} ${rec.kind} ${rec.tf} · Disentuh ($${fmt(rec.low)}–$${fmt(rec.high)})`;
      const tp2BodyStr = rec.tp2 ? ` | TP2 $${fmt(rec.tp2)}` : '';
      alerts.push({
        type: rec.ceTouched ? 'CE_TOUCH' : 'ZONE_TOUCH',
        poiId: rec.id,
        title: touchTitle,
        body: `CE $${fmt(rec.ce)} | SL $${fmt(rec.sl)} | TP1 $${fmt(rec.tp1)}${tp2BodyStr}`,
        sound: 'gold'
      });
    }

    if (rec.status === 'TP2_HIT' && !rec.notifiedTp2 && resolvedIsFresh && (!prev || prev.status !== 'TP2_HIT')) {
      rec.notifiedTp2 = true;
      rec.notifiedTp1 = true;
      changed = true;
      const tp2Pips = Math.round(Math.abs((Number(rec.tp2) || 0) - (Number(rec.ce) || 0)) * GOLD_PIPS_PER_USD);
      alerts.push({
        type: 'TP2_HIT',
        poiId: rec.id,
        title: `👑 TP2 DOL ★ · ${rec.side} ${rec.kind} ${rec.tf} ($${fmt(rec.low)}–$${fmt(rec.high)})`,
        body: `Target penuh $${fmt(rec.tp2)} tercapai (+${tp2Pips} Pips). Posisi selesai!`,
        sound: 'gold'
      });
    } else if (rec.status === 'TP1_HIT' && !rec.notifiedTp1 && resolvedIsFresh && (!prev || prev.status !== 'TP1_HIT')) {
      rec.notifiedTp1 = true;
      changed = true;
      alerts.push({
        type: 'TP1_HIT',
        poiId: rec.id,
        title: `🎯 TP1 BEP ✓ · ${rec.side} ${rec.kind} ${rec.tf} ($${fmt(rec.low)}–$${fmt(rec.high)})`,
        body: `Target 1 $${fmt(rec.tp1)} tercapai. Amankan posisi & pasang BEP!`,
        sound: 'gold'
      });
    } else if (rec.status === 'SL_HIT' && !rec.notifiedSl && resolvedIsFresh && (!prev || prev.status !== 'SL_HIT')) {
      rec.notifiedSl = true;
      changed = true;
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

    return rec;
  });

  if (!changed) return { state: nextState, alerts: [], changed: false };
  return {
    state: { ...nextState, poiRecords: updatedRecords },
    alerts,
    changed: true
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
    const netR = Number.isFinite(Number(summary.netR))
      ? Number(summary.netR)
      : ((Number(summary.tp2) || 0) * 2.5 + (Number(summary.tp1) || 0) * 1.5 - (Number(summary.sl) || 0));
    if (netR > 0) return 'win';
    if (netR < 0) return 'loss';
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
    netR: 0,
    netPips: 0,
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
    judasTotal: 0,
    sweepTotal: 0,
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
      monthAgg.netR += Number(summary.netR) || 0;
      monthAgg.netPips += Number(summary.netPips) || 0;
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
      monthAgg.judasTotal += Number(summary.judasTotal) || 0;
      monthAgg.sweepTotal += Number(summary.sweepTotal) || 0;
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

  monthAgg.netR = Math.round(monthAgg.netR * 10) / 10;
  monthAgg.netPips = Math.round(monthAgg.netPips);
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
    let wNetR = 0;
    let wNetPips = 0;
    for (const cell of days) {
      if (cell.summary) {
        wTotal += cell.summary.total;
        wWins += cell.summary.wins;
        wSl += cell.summary.sl;
        wReacting += cell.summary.reacting;
        wNetR += Number(cell.summary.netR) || 0;
        wNetPips += Number(cell.summary.netPips) || 0;
      }
    }
    wNetR = Math.round(wNetR * 10) / 10;
    wNetPips = Math.round(wNetPips);
    const wResolved = wWins + wSl;
    const wRate = wResolved > 0
      ? Math.round((wWins / wResolved) * 100)
      : (wTotal > 0 ? Math.round(((wWins + wReacting) / wTotal) * 100) : null);
    const wTone = wTotal === 0
      ? 'empty'
      : (wResolved > 0 ? (wNetR > 0 ? 'win' : (wNetR < 0 ? 'loss' : 'neutral')) : 'neutral');

    weeks.push({
      days,
      weekSummary: {
        total: wTotal,
        wins: wWins,
        sl: wSl,
        resolved: wResolved,
        respectRate: wRate,
        netR: wNetR,
        netPips: wNetPips,
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
 * Classify a timestamp (ms) into DST-aware Gold ICT session buckets (anchored to America/New_York).
 */
export function classifyWitaSession(tsMs) {
  const n = Number(tsMs);
  if (!Number.isFinite(n) || n <= 0) return 'Lainnya';
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      hour12: false
    }).formatToParts(new Date(n));
    const rawHour = Number(parts.find(p => p.type === 'hour')?.value);
    const nyHour = Number.isFinite(rawHour) ? (rawHour === 24 ? 0 : rawHour) : NaN;
    if (Number.isFinite(nyHour)) {
      if (nyHour >= 2 && nyHour < 7) return 'London';
      if (nyHour >= 7 && nyHour < 17) return 'NY';
      if (nyHour >= 18 || nyHour < 2) return 'Asia';
      return 'Transisi';
    }
  } catch {
    // Fallback to fixed WITA (UTC+8) when Intl timezone data is unavailable
  }
  const witaHour = new Date(n + 8 * 3600 * 1000).getUTCHours();
  if (witaHour >= 7 && witaHour <= 14) return 'Asia';
  if (witaHour >= 15 && witaHour <= 19) return 'London';
  if (witaHour >= 20 || witaHour <= 3) return 'NY';
  return 'Transisi';
}

function normalizePoiKindBucket(rawKind) {
  const k = String(rawKind || 'POI').trim().toUpperCase();
  if (k.includes('JUDAS')) return 'JUDAS';
  if (k.includes('SWEEP')) return 'SWEEP';
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

/**
 * Strictly causal multi-day walk-forward backfill (e.g. 30 days) for the Mapping Calendar.
 * Steps forward across historical M15/M5/H1 candles using rolling indicator windows
 * (identical to daily live cockpit windows) so NextGen's per-call zone cap (.slice(-36))
 * does not truncate older days, while enforcing all Mapping POI Engine v7 rules.
 */
export function backfillMultiDayWalkForward({
  m15Candles = [],
  m5Candles = [],
  h1Candles = [],
  calculateIndicators = null,
  days = 30,
  stepHours = 12,
  nowMs = Date.now(),
  existingState = null
} = {}) {
  const dedupeAsc = rows => {
    const map = new Map();
    for (const c of normalizeCandles(rows)) {
      map.set(c.openTime, {
        open_time: c.openTime,
        time: c.openTime,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      });
    }
    return Array.from(map.values()).sort((a, b) => a.time - b.time);
  };

  const m15All = dedupeAsc(m15Candles);
  const m5All = dedupeAsc(m5Candles);
  const h1All = dedupeAsc(h1Candles);

  const baseState = existingState && typeof existingState === 'object'
    ? {
        version: existingState.version || 2,
        poiRecords: Array.isArray(existingState.poiRecords) ? existingState.poiRecords.map(r => ({ ...r })) : [],
        timelineEvents: Array.isArray(existingState.timelineEvents) ? existingState.timelineEvents.map(e => ({ ...e })) : [],
        dailyArchive: existingState.dailyArchive ? { ...existingState.dailyArchive } : {}
      }
    : createEmptyHistoryState();

  if (typeof calculateIndicators !== 'function' || m15All.length < 40) {
    return {
      state: baseState,
      addedCount: 0,
      totalCount: baseState.poiRecords.length,
      daysCovered: Object.keys(baseState.dailyArchive || {}).length,
      rangeStartKey: '',
      rangeEndKey: ''
    };
  }

  const safeDays = Math.max(1, Math.min(90, Number(days) || 30));
  const safeStepMs = Math.max(4, Math.min(24, Number(stepHours) || 12)) * 3600 * 1000;
  const lastM15Ms = m15All[m15All.length - 1].time * 1000;
  const effectiveNowMs = Number.isFinite(nowMs) ? Math.max(nowMs, lastM15Ms) : lastM15Ms;
  const minWarmupIdx = Math.min(60, Math.max(25, Math.floor(m15All.length * 0.15)));
  const earliestAllowedMs = m15All[minWarmupIdx].time * 1000;
  const requestedStartMs = lastM15Ms - safeDays * 24 * 3600 * 1000;
  const windowStartMs = Math.max(earliestAllowedMs, requestedStartMs);
  const windowEndMs = lastM15Ms;

  // Clear stale pre-v7 BACKFILL records inside the refreshed window while keeping all LIVE records
  const startDayKey = witaDateKey(windowStartMs);
  const endDayKey = witaDateKey(windowEndMs);
  const cleanedArchive = { ...(baseState.dailyArchive || {}) };
  let state = {
    version: baseState.version || 2,
    poiRecords: baseState.poiRecords.filter(r => {
      if (!r || !Number.isFinite(r.touchedAt)) return false;
      const inWindow = r.touchedAt >= windowStartMs - 24 * 3600 * 1000 && r.touchedAt <= effectiveNowMs;
      if (inWindow && r.source === 'BACKFILL' && Number(r.engineVersion || 0) < BACKFILL_ENGINE_VERSION) {
        return false;
      }
      return true;
    }),
    timelineEvents: baseState.timelineEvents,
    dailyArchive: cleanedArchive
  };

  for (const key of Object.keys(state.dailyArchive)) {
    if (startDayKey && endDayKey && key >= startDayKey && key <= endDayKey) {
      delete state.dailyArchive[key];
    }
  }

  const beforeIds = new Set(state.poiRecords.map(r => r.id));

  const sliceUpTo = (arr, maxSec, cap) => {
    if (!arr.length) return [];
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (arr[mid].time <= maxSec) lo = mid + 1;
      else hi = mid;
    }
    if (lo <= 0) return [];
    return arr.slice(Math.max(0, lo - cap), lo);
  };

  const stepPoints = [];
  for (let t = windowStartMs; t < windowEndMs; t += safeStepMs) {
    stepPoints.push(t);
  }
  stepPoints.push(windowEndMs);

  for (const tMs of stepPoints) {
    const tSec = Math.floor(tMs / 1000);
    const m15Slice = sliceUpTo(m15All, tSec, 320);
    if (m15Slice.length < 30) continue;
    const m5Slice = sliceUpTo(m5All, tSec, 360);
    const h1Slice = sliceUpTo(h1All, tSec, 240);

    const ngM15 = calculateIndicators(m15Slice, { tf: 'M15' });
    const ngM5 = m5Slice.length >= 30 ? calculateIndicators(m5Slice, { tf: 'M5' }) : null;
    const ngH1 = h1Slice.length >= 10 ? calculateIndicators(h1Slice, { tf: 'H1' }) : null;

    const bf = backfillFromCandles({
      m15Candles: m15Slice,
      m5Candles: m5Slice,
      ngM15,
      ngM5,
      ngH1,
      nowMs: tMs,
      lookbackHours: 48
    });

    state = mergeHistoryState(state, bf, effectiveNowMs);
  }

  let addedCount = 0;
  const coveredDaySet = new Set();
  for (const rec of state.poiRecords) {
    if (!beforeIds.has(rec.id)) addedCount += 1;
    if (rec.touchedAt >= windowStartMs - 24 * 3600 * 1000 && rec.touchedAt <= effectiveNowMs) {
      const dk = witaDateKey(rec.touchedAt);
      if (dk) coveredDaySet.add(dk);
    }
  }

  return {
    state,
    addedCount,
    totalCount: state.poiRecords.length,
    daysCovered: coveredDaySet.size,
    rangeStartKey: startDayKey,
    rangeEndKey: endDayKey
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
    detectCausalJudasAndSweepSetups,
    selectActiveLiveJudasOrSweep,
    backfillMultiDayWalkForward,
    recordLivePoiProgress,
    collectFreshBackfillAlerts,
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
