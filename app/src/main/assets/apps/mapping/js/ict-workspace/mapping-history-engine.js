/**
 * Pure Mapping Reaction Timeline & POI Outcome Tracker Engine
 * - Auto-backfills recent POI touches/outcomes, Liquidity Sweeps, BOS/MSS, and Key Level hits from M15/M5 candles.
 * - Tracks live real-time POI lifecycle (TESTING -> REACTING -> TP1_HIT -> TP2_HIT / SL_HIT) with 7-day persistence.
 * - Zero DOM dependencies so all logic is deterministically unit-tested via node:test.
 */

export const HISTORY_STORAGE_KEY = 'amyfx.mapping.reaction_history.v1';
export const MAX_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_POI_RECORDS = 80;
export const MAX_TIMELINE_EVENTS = 120;

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

export function createEmptyHistoryState() {
  return {
    version: 1,
    poiRecords: [],
    timelineEvents: []
  };
}

export function loadHistoryState(storage) {
  if (!storage) return createEmptyHistoryState();
  try {
    const raw = storage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return createEmptyHistoryState();
    const parsed = JSON.parse(raw);
    return {
      version: 1,
      poiRecords: Array.isArray(parsed?.poiRecords) ? parsed.poiRecords : [],
      timelineEvents: Array.isArray(parsed?.timelineEvents) ? parsed.timelineEvents : []
    };
  } catch {
    return createEmptyHistoryState();
  }
}

export function saveHistoryState(storage, state) {
  if (!storage || !state) return;
  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({
      version: 1,
      poiRecords: (state.poiRecords || []).slice(0, MAX_POI_RECORDS),
      timelineEvents: (state.timelineEvents || []).slice(0, MAX_TIMELINE_EVENTS)
    }));
  } catch {
    // Ignore storage quota errors gracefully
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

  const touchPrice = isSell
    ? Math.min(Math.max(touchBar.open, lo), hi)
    : Math.max(Math.min(touchBar.open, hi), lo);

  const sl = num(zone.sl) || Number((isSell ? hi + 0.40 : lo - 0.40).toFixed(2));
  const risk = Math.max(1.8, Math.abs(ce - sl));
  const tp1 = num(zone.tp1) || Number((isSell ? ce - Math.max(risk * 1.6, 5.0) : ce + Math.max(risk * 1.6, 5.0)).toFixed(2));
  const tp2 = num(zone.tp2) || Number((isSell ? ce - Math.max(risk * 2.8, 9.0) : ce + Math.max(risk * 2.8, 9.0)).toFixed(2));

  let status = 'TESTING';
  let resolvedAt = null;
  let maxFavorable = 0;

  for (let i = touchIdx; i < candles.length; i += 1) {
    const c = candles[i];
    const barTs = c.closeTime * 1000;
    const fav = isSell ? Math.max(0, ce - c.low) : Math.max(0, c.high - ce);
    if (fav > maxFavorable) maxFavorable = fav;

    const hitSl = isSell ? (c.high > sl) : (c.low < sl);
    const hitTp1 = isSell ? (c.low <= tp1) : (c.high >= tp1);
    const hitTp2 = isSell ? (c.low <= tp2) : (c.high >= tp2);

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
    touchPrice: Number(touchPrice.toFixed(2)),
    maxFavorable: Number(maxFavorable.toFixed(2)),
    status,
    resolvedAt,
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

  // 4. POI Touches & Outcomes from M15 & M5 FVG/OB zones
  const evalNgZones = (ng, candles, tf) => {
    if (!ng?.poi || !candles.length) return;
    const rawZones = [
      ...(Array.isArray(ng.poi.fvg) ? ng.poi.fvg.map(z => ({ ...z, kind: 'FVG' })) : []),
      ...(Array.isArray(ng.poi.ob) ? ng.poi.ob.map(z => ({ ...z, kind: 'OB' })) : [])
    ];
    for (const z of rawZones) {
      const sideStr = String(z.side || z.direction || '').toUpperCase();
      const side = (sideStr === 'SELL' || sideStr === 'BEARISH') ? 'SELL' : 'BUY';
      const evaluated = evaluateZoneLifecycleOnCandles(
        {
          side,
          tf,
          kind: z.kind,
          low: z.bot ?? z.low,
          high: z.top ?? z.high,
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
      pushEvent({
        id: `TOUCH:${evaluated.id}`,
        ts: evaluated.touchedAt,
        category: 'POI_TOUCH',
        side: evaluated.side,
        tf: evaluated.tf,
        title: `${evaluated.kind} ${evaluated.tf} ${evaluated.side} Disentuh`,
        detail: `Zona $${fmt(evaluated.low)}–$${fmt(evaluated.high)} tersentuh @ $${fmt(evaluated.touchPrice)}`,
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
  if (!Number.isFinite(price)) return { state, changed: false };

  const poiMap = new Map((state?.poiRecords || []).map(r => [r.id, { ...r }]));
  const evMap = new Map((state?.timelineEvents || []).map(e => [e.id, { ...e }]));
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
    if (!existing) {
      const ce = num(plan.area.ce) || (lo + hi) / 2;
      const sl = num(plan.sl) || Number((isSell ? hi + 0.40 : lo - 0.40).toFixed(2));
      const risk = Math.max(1.8, Math.abs(ce - sl));
      const tp1 = num(plan.tp1) || Number((isSell ? ce - Math.max(risk * 1.6, 5.0) : ce + Math.max(risk * 1.6, 5.0)).toFixed(2));
      const tp2 = num(plan.tp2) || Number((isSell ? ce - Math.max(risk * 2.8, 9.0) : ce + Math.max(risk * 2.8, 9.0)).toFixed(2));
      const rec = {
        id,
        side: plan.side,
        tf,
        kind,
        low: Number(lo.toFixed(2)),
        high: Number(hi.toFixed(2)),
        ce: Number(ce.toFixed(2)),
        sl: Number(sl.toFixed(2)),
        tp1: Number(tp1.toFixed(2)),
        tp2: Number(tp2.toFixed(2)),
        touchedAt: nowMs,
        touchPrice: Number(price.toFixed(2)),
        maxFavorable: 0,
        status: 'TESTING',
        resolvedAt: null,
        source: 'LIVE'
      };
      poiMap.set(id, rec);
      evMap.set(`TOUCH:${id}`, {
        id: `TOUCH:${id}`,
        ts: nowMs,
        category: 'POI_TOUCH',
        side: rec.side,
        tf: rec.tf,
        title: `${rec.kind} ${rec.tf} ${rec.side} Disentuh (Live)`,
        detail: `Zona $${fmt(rec.low)}–$${fmt(rec.high)} tersentuh live @ $${fmt(price)}`,
        price: Number(price.toFixed(2)),
        source: 'LIVE'
      });
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

  if (!changed) return { state, changed: false };
  return {
    changed: true,
    state: {
      version: 1,
      poiRecords: [...poiMap.values()].sort((a, b) => b.touchedAt - a.touchedAt).slice(0, MAX_POI_RECORDS),
      timelineEvents: [...evMap.values()].sort((a, b) => b.ts - a.ts).slice(0, MAX_TIMELINE_EVENTS)
    }
  };
}

/**
 * Merge persisted localStorage state with fresh candle backfill (LIVE wins over BACKFILL; 7-day pruning).
 */
export function mergeHistoryState(persisted, backfilled, nowMs = Date.now()) {
  const cutoff = nowMs - MAX_RETENTION_MS;
  const poiMap = new Map();
  const statusRank = { TESTING: 1, REACTING: 2, TP1_HIT: 3, SL_HIT: 4, TP2_HIT: 5 };

  const upsertPoi = rec => {
    if (!rec || !rec.id || !Number.isFinite(rec.touchedAt) || rec.touchedAt < cutoff) return;
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
    if (prev.source === 'LIVE') merged.source = 'LIVE';
    poiMap.set(rec.id, merged);
  };

  for (const r of persisted?.poiRecords || []) upsertPoi(r);
  for (const r of backfilled?.poiRecords || []) upsertPoi(r);

  const evMap = new Map();
  const upsertEv = ev => {
    if (!ev || !ev.id || !Number.isFinite(ev.ts) || ev.ts < cutoff) return;
    const prev = evMap.get(ev.id);
    if (!prev || (prev.source !== 'LIVE' && ev.source === 'LIVE')) {
      evMap.set(ev.id, { ...ev });
    }
  };
  for (const e of persisted?.timelineEvents || []) upsertEv(e);
  for (const e of backfilled?.timelineEvents || []) upsertEv(e);

  return {
    version: 1,
    poiRecords: [...poiMap.values()].sort((a, b) => b.touchedAt - a.touchedAt).slice(0, MAX_POI_RECORDS),
    timelineEvents: [...evMap.values()].sort((a, b) => b.ts - a.ts).slice(0, MAX_TIMELINE_EVENTS)
  };
}

/**
 * Filter records by 'TODAY' (WITA day) or '7D' and compute POI Respect scorecard.
 */
export function filterByRange(items, tsKey, range = 'TODAY', nowMs = Date.now()) {
  if (!Array.isArray(items)) return [];
  if (range === '7D') {
    const cutoff = nowMs - MAX_RETENTION_MS;
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

if (typeof window !== 'undefined') {
  window.AmyMappingHistoryEngine = {
    HISTORY_STORAGE_KEY,
    loadHistoryState,
    saveHistoryState,
    backfillFromCandles,
    recordLivePoiProgress,
    mergeHistoryState,
    filterByRange,
    summarizePoiStats,
    formatWitaClock
  };
}
