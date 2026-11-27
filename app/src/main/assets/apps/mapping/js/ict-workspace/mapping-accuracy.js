/**
 * Pure Mapping Accuracy & SSOT Decision Helpers
 * Decoupled from DOM so every accuracy invariant can be unit-tested cleanly via node:test.
 */

const num = v => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : NaN;
};

const fmt = v => (Number.isFinite(Number(v)) && Number(v) > 0) ? Number(v).toFixed(2) : '—';

/**
 * Single Source of Truth (SSOT) for M15 structure direction.
 * Backend M15 engine (ctx.m15 / amy.dashboard.biasDir) owns M15 direction so Hero 3-TF,
 * Break Terakhir, Target DOL, Dealing Range, and POI Priority Tab never contradict each other.
 */
export function resolveM15Direction(ctx) {
  if (!ctx) return 0;
  const amy = ctx.amy || ctx;
  const dashboard = amy?.dashboard;
  const m15Struct = String(ctx.m15?.structure || '').toUpperCase();
  const m15Control = String(ctx.m15?.control || '').toUpperCase();
  if (m15Struct.includes('BEAR') || m15Control.includes('SELLER') || dashboard?.biasDir === -1) return -1;
  if (m15Struct.includes('BULL') || m15Control.includes('BUYER') || dashboard?.biasDir === 1) return 1;
  return 0;
}

/**
 * Format PDL - PDH range strictly Low to High so it matches the "PDL–PDH:" label.
 */
export function formatPdlPdhRange(pdl, pdh) {
  const a = num(pdl);
  const b = num(pdh);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { rangeText: 'Belum tersedia', eqText: '—', low: NaN, high: NaN, eq: NaN };
  }
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const eq = (low + high) / 2;
  return {
    rangeText: `$${fmt(low)} – $${fmt(high)}`,
    eqText: `$${fmt(eq)}`,
    low,
    high,
    eq
  };
}

/**
 * Resolve Break Terakhir, Liquidity Sweep, and Target DOL using M15 SSOT first.
 * Prevents dual-engine contradiction where Hero says M15 BULL while Break/DOL show opposing Bearish NextGen events.
 */
export function resolveSsotTelemetry(ctx, ng, livePrice) {
  const amy = ctx?.amy || ctx;
  const dashboard = amy?.dashboard || null;
  const m15Dir = resolveM15Direction(ctx);
  const ngIsM15 = !ng?.tf || String(ng.tf).toUpperCase() === 'M15';

  // 1. Structure Break (SSOT: backend M15 lastBreak / amy.events -> fallback NextGen only if M15)
  let breakText = 'Menunggu Break';
  let breakTone = '';
  let breakDir = 0;
  const backendBreak = ctx?.m15?.lastBreak || dashboard?.lastBreak || (Array.isArray(amy?.events) && amy.events.length ? amy.events[amy.events.length - 1] : null);
  const ngBreak = ngIsM15 ? ng?.structure?.lastEvent : null;
  const lastEv = backendBreak || ngBreak || ctx?.h1?.lastBreak || null;

  if (lastEv && (lastEv.type || lastEv.kind || lastEv.label)) {
    const evType = String(lastEv.type || lastEv.kind || lastEv.label).toUpperCase();
    const evDir = String(lastEv.direction || lastEv.side || '').toUpperCase();
    const isBull = evDir.includes('BULL') || evDir === 'BUY' || lastEv.dir === 1;
    const isBear = evDir.includes('BEAR') || evDir === 'SELL' || lastEv.dir === -1;
    const lvl = num(lastEv.level ?? lastEv.price);
    const dirTxt = isBull ? 'Bull' : (isBear ? 'Bear' : '');
    breakDir = isBull ? 1 : (isBear ? -1 : 0);
    breakText = `${evType}${dirTxt ? ' ' + dirTxt : ''}${Number.isFinite(lvl) ? ` @ $${fmt(lvl)}` : ''}`;
    breakTone = isBull ? 'is-bull' : (isBear ? 'is-bear' : '');
  } else if (dashboard?.bullMss || dashboard?.bearMss || dashboard?.bullBos || dashboard?.bearBos) {
    const isBull = Boolean(dashboard.bullMss || dashboard.bullBos);
    const kind = (dashboard.bullMss || dashboard.bearMss) ? 'MSS' : 'BOS';
    breakDir = isBull ? 1 : -1;
    breakText = `${kind} ${isBull ? 'Bull' : 'Bear'}`;
    breakTone = isBull ? 'is-bull' : 'is-bear';
  }

  // 2. Liquidity Sweep (fresh backend M15 sweep first; fallback NextGen M15 sweep)
  let sweepText = 'Belum ada sweep';
  let sweepTone = '';
  let freshSweepDir = 0;
  const dashSweep = dashboard?.sweepStatus === 1 && dashboard?.sweep ? {
    pool: dashboard.sweep.dir === 1 ? 'SSL M15' : 'BSL M15',
    level: dashboard.sweep.price,
    reactionSide: dashboard.sweep.dir === 1 ? 'BUY' : 'SELL',
    broken: false
  } : null;
  const ngSweep = ngIsM15
    ? (ng?.liquidity?.latestSweep || (Array.isArray(ng?.liquidity?.sweeps) && ng.liquidity.sweeps.length ? ng.liquidity.sweeps[ng.liquidity.sweeps.length - 1] : null))
    : null;
  const activeSweep = dashSweep || ngSweep;

  if (activeSweep) {
    const poolName = activeSweep.pool || String(activeSweep.type || '').replace(/_SWEEP$/i, '').replace(/_/g, ' ') || 'Likuiditas';
    const lvl = num(activeSweep.level ?? activeSweep.price);
    if (activeSweep.broken) {
      sweepText = `${poolName}${Number.isFinite(lvl) ? ` $${fmt(lvl)}` : ''} · Tembus BOS`;
      sweepTone = '';
    } else {
      const rSide = String(activeSweep.reactionSide || activeSweep.side || '').toUpperCase();
      const isBuyReact = rSide === 'BUY' || rSide === 'BULLISH' || activeSweep.type === 'SSL_SWEEP' || activeSweep.type === 'PDL_SWEEP' || activeSweep.type === 'ASIA_LOW_SWEEP';
      const isSellReact = rSide === 'SELL' || rSide === 'BEARISH' || activeSweep.type === 'BSL_SWEEP' || activeSweep.type === 'PDH_SWEEP' || activeSweep.type === 'ASIA_HIGH_SWEEP';
      const reactLabel = isBuyReact ? 'Reaksi Buy' : (isSellReact ? 'Reaksi Sell' : '');
      if (isBuyReact) freshSweepDir = 1;
      else if (isSellReact) freshSweepDir = -1;
      sweepText = `${poolName}${Number.isFinite(lvl) ? ` $${fmt(lvl)}` : ''}${reactLabel ? ` · ${reactLabel}` : ''}`;
      sweepTone = isBuyReact ? 'is-bull' : (isSellReact ? 'is-bear' : 'is-gold');
    }
  }

  // 3. Draw on Liquidity (DOL) — STRICTLY aligned with M15 SSOT direction (never opposing M15!)
  const effectiveDolDir = m15Dir || (dashboard?.dolDir || 0) || freshSweepDir || (ngIsM15 ? (ng?.dol?.dir || 0) : 0);
  const priceRef = num(livePrice) || num(ctx?.price) || num(dashboard?.candle?.close) || 0;

  const klState = ngIsM15 ? (ng?.keyLevels || {}) : {};
  const takenLabels = new Set(
    (Array.isArray(ctx?.liquidity) ? ctx.liquidity : [])
      .filter(l => String(l?.status || '').toUpperCase() === 'TAKEN')
      .map(l => String(l?.label || '').toUpperCase())
  );
  const isConsumedKey = (flag, labelKey) => Boolean(flag) || takenLabels.has(labelKey);
  const pdhAvailable = !isConsumedKey(klState.pdhConsumed, 'PDH');
  const pdlAvailable = !isConsumedKey(klState.pdlConsumed, 'PDL');
  const asiaHighAvailable = !isConsumedKey(klState.asiaHighConsumed, 'ASIA HIGH');
  const asiaLowAvailable = !isConsumedKey(klState.asiaLowConsumed, 'ASIA LOW');

  const dedupePools = list => {
    const out = [];
    for (const p of list) {
      if (!out.some(x => Math.abs(x.level - p.level) < 0.08)) out.push(p);
    }
    return out;
  };

  const rawAbove = dedupePools([
    ...(dashboard?.dolDir === 1 && Number.isFinite(num(dashboard?.dolTarget)) ? [{ name: 'BSL M15', level: num(dashboard.dolTarget) }] : []),
    ...(Number.isFinite(num(dashboard?.bsl)) ? [{ name: 'BSL M15', level: num(dashboard.bsl) }] : []),
    ...(asiaHighAvailable && Number.isFinite(num(amy?.levels?.asiaHigh)) ? [{ name: 'Asia High', level: num(amy.levels.asiaHigh) }] : []),
    ...(pdhAvailable && Number.isFinite(num(amy?.levels?.pdh)) ? [{ name: 'PDH', level: num(amy.levels.pdh) }] : []),
    ...(Number.isFinite(num(amy?.levels?.bsl)) ? [{ name: 'BSL Swing', level: num(amy.levels.bsl) }] : []),
    ...(ngIsM15 && Array.isArray(ng?.dol?.poolsAbove) ? ng.dol.poolsAbove.map(p => ({ name: p.name || 'BSL', level: num(p.level ?? p.price) })) : []),
    ...(Array.isArray(ctx?.liquidity) ? ctx.liquidity.filter(l => l.side === 'BUY' && l.status !== 'TAKEN').map(l => ({ name: l.label || 'BSL', level: num(l.level) })) : [])
  ].filter(p => Number.isFinite(p.level) && (!priceRef || p.level > priceRef + 0.15))
    .sort((a, b) => a.level - b.level));

  const rawBelow = dedupePools([
    ...(dashboard?.dolDir === -1 && Number.isFinite(num(dashboard?.dolTarget)) ? [{ name: 'SSL M15', level: num(dashboard.dolTarget) }] : []),
    ...(Number.isFinite(num(dashboard?.ssl)) ? [{ name: 'SSL M15', level: num(dashboard.ssl) }] : []),
    ...(asiaLowAvailable && Number.isFinite(num(amy?.levels?.asiaLow)) ? [{ name: 'Asia Low', level: num(amy.levels.asiaLow) }] : []),
    ...(pdlAvailable && Number.isFinite(num(amy?.levels?.pdl)) ? [{ name: 'PDL', level: num(amy.levels.pdl) }] : []),
    ...(Number.isFinite(num(amy?.levels?.ssl)) ? [{ name: 'SSL Swing', level: num(amy.levels.ssl) }] : []),
    ...(ngIsM15 && Array.isArray(ng?.dol?.poolsBelow) ? ng.dol.poolsBelow.map(p => ({ name: p.name || 'SSL', level: num(p.level ?? p.price) })) : []),
    ...(Array.isArray(ctx?.liquidity) ? ctx.liquidity.filter(l => l.side === 'SELL' && l.status !== 'TAKEN').map(l => ({ name: l.label || 'SSL', level: num(l.level) })) : [])
  ].filter(p => Number.isFinite(p.level) && (!priceRef || p.level < priceRef - 0.15))
    .sort((a, b) => b.level - a.level));

  let dolText = 'Menunggu arah DOL';
  let dolTone = 'is-gold';
  let dolLevel = null;
  let dolSide = null;

  if (effectiveDolDir === 1 && rawAbove.length) {
    const best = rawAbove[0];
    const dist = priceRef > 0 ? Math.abs(best.level - priceRef) : NaN;
    dolText = `↑ ${best.name} $${fmt(best.level)}${Number.isFinite(dist) ? ` (+$${fmt(dist)})` : ''}`;
    dolTone = 'is-bull';
    dolLevel = best.level;
    dolSide = 'BUY';
  } else if (effectiveDolDir === -1 && rawBelow.length) {
    const best = rawBelow[0];
    const dist = priceRef > 0 ? Math.abs(priceRef - best.level) : NaN;
    dolText = `↓ ${best.name} $${fmt(best.level)}${Number.isFinite(dist) ? ` (-$${fmt(dist)})` : ''}`;
    dolTone = 'is-bear';
    dolLevel = best.level;
    dolSide = 'SELL';
  }

  return { breakText, breakTone, breakDir, sweepText, sweepTone, dolText, dolTone, dolLevel, dolSide, m15Dir };
}

/**
 * Format TP1 subtitle honestly: clearly distinguish synthetic R:R projections from real structural liquidity pools.
 */
export function formatTp1Subtitle(tp1, tp2, rr1) {
  if (!tp1 || !Number.isFinite(tp1.v)) return null;
  const rrTag = Number.isFinite(rr1) && rr1 > 0 ? `1:${rr1.toFixed(1)}` : '';
  const runnerTag = tp2 && Number.isFinite(tp2.v)
    ? ` · DOL $${fmt(tp2.v)}`
    : '';
  if (tp1.synthetic) {
    return `Proyeksi R:R ${rrTag || '1:1.6'} (Non-Struktural)${runnerTag}`;
  }
  return `DOL ${tp1.name || 'Struktural'}${rrTag ? ` (${rrTag})` : ''}${runnerTag}`;
}

/**
 * Dual-Layer Scalper POI Selector (M5 Refinement + M15 Structural Swing).
 * Picks the closest actionable scalper POI (<= $12 preferred) without discarding fresh
 * continuation FVGs/OBs just because a giant macro Dealing Range has an old deep EQ.
 * Also returns a deeper M15 backup zone for full context in the breakdown table.
 */
/**
 * Shared SSOT POI Quality Filter Contract — enforced identically across:
 *   1) Card Rencana Eksekusi POI (selectScalperDualLayerPoi)
 *   2) Card Riwayat Reaksi & POI (backfillFromCandles)
 *   3) Live Tick Tracker (filterTrackableLivePlans)
 * Prevents split-brain mismatches where micro M5 traps, Asia M5 chop, or counter-trend FVGs
 * appear in Execution Plan while being silently excluded from History.
 */
export const POI_QUALITY_RULES = {
  M5: { minWidth: 1.25, maxWidth: 7.5 },
  M15: { minWidth: 1.50, maxWidth: 10.5 }
};

export function getWitaHour(tsMs) {
  const d = new Date(Number(tsMs) + 8 * 3600 * 1000);
  return Number.isNaN(d.getTime()) ? 14 : d.getUTCHours();
}

export function evaluatePoiQualityGate({
  tf = 'M15',
  kind = 'FVG',
  side = 'BUY',
  width = NaN,
  m15Dir = 0,
  nowMs = null
} = {}) {
  const normTf = String(tf || 'M15').toUpperCase() === 'M5' ? 'M5' : 'M15';
  const normKind = String(kind || 'FVG').toUpperCase();
  const sideDir = String(side || '').toUpperCase() === 'SELL' ? -1 : 1;
  const rules = POI_QUALITY_RULES[normTf];

  if (!Number.isFinite(width) || width < rules.minWidth) {
    return { allowed: false, reason: 'MICRO_WIDTH' };
  }
  if (width > rules.maxWidth) {
    return { allowed: false, reason: 'OVERSIZED_WIDTH' };
  }

  if (Number.isFinite(Number(nowMs)) && Number(nowMs) > 0) {
    const witaH = getWitaHour(Number(nowMs));
    // Dead Rollover (04:00-07:00 WITA): skip all new entries
    if (witaH >= 4 && witaH < 7) {
      return { allowed: false, reason: 'ROLLOVER_DEAD' };
    }
    // Asia Session (07:00-14:00 WITA): M15 structural zones only; block noisy M5 chop
    if (witaH >= 7 && witaH < 14 && normTf === 'M5') {
      return { allowed: false, reason: 'ASIA_M5_BLOCKED' };
    }
  }

  // Causal M15 trend discipline: M5 & raw M15 FVG cannot fight M15 trend;
  // only institutional M15 reversal zones (OB / BB / iFVG) remain eligible counter-trend.
  const isCounter = Number(m15Dir) !== 0 && Number(m15Dir) !== sideDir;
  if (isCounter && (normTf === 'M5' || normKind === 'FVG')) {
    return { allowed: false, reason: 'COUNTER_TREND_BLOCKED' };
  }

  return { allowed: true, reason: 'OK' };
}

export function selectScalperDualLayerPoi({
  side,
  m15Obs = [],
  m15Fvgs = [],
  m15Ifvgs = [],
  m15Bbs = [],
  m5Obs = [],
  m5Fvgs = [],
  m5Ifvgs = [],
  m5Bbs = [],
  livePrice = 0,
  m15Dir = 0,
  nowMs = null,
  activeLeg = null,
  eqVal = NaN,
  protectedHigh = NaN,
  protectedLow = NaN,
  impulseHigh = NaN,
  impulseLow = NaN
}) {
  const isSell = side === 'SELL';
  const sideDir = isSell ? -1 : 1;
  const price = num(livePrice);

  const normalize = (list, tf, kind) => (Array.isArray(list) ? list : [])
    .map((z, idx) => {
      const lo = num(z.lo ?? z.low ?? z.bot ?? z.gapLow ?? z.zoneLow);
      const hi = num(z.hi ?? z.high ?? z.top ?? z.gapHigh ?? z.zoneHigh);
      const width = hi - lo;
      const rules = POI_QUALITY_RULES[tf === 'M5' ? 'M5' : 'M15'];
      if (!Number.isFinite(lo) || !Number.isFinite(hi) || width < rules.minWidth) return null;
      const gate = evaluatePoiQualityGate({
        tf,
        kind,
        side,
        width,
        m15Dir,
        nowMs
      });
      // Enforce session & counter-trend SSOT gate (allow oversized check below so cleanSizedPool fallback still works cleanly)
      if (!gate.allowed && gate.reason !== 'OVERSIZED_WIDTH') return null;
      const ce = num(z.ce ?? z.meanThreshold) || (lo + hi) / 2;
      const rawTouchCount = Number(z.touchCount ?? z.raw?.touchCount);
      const testedFlag = Boolean(z.tested ?? z.raw?.tested);
      const touchCount = Number.isFinite(rawTouchCount) && rawTouchCount >= 0
        ? rawTouchCount
        : (testedFlag ? 1 : 0);
      const ceTouched = Boolean(z.ceTouched ?? z.raw?.ceTouched);
      const lastTouchTime = Number(z.lastTouchTime ?? z.raw?.lastTouchTime) || null;
      const touches = Array.isArray(z.touches) ? z.touches : (Array.isArray(z.raw?.touches) ? z.raw.touches : []);
      const lifecycle = String(z.lifecycle || z.raw?.lifecycle || (touchCount > 0 ? 'TESTED' : 'FRESH')).toUpperCase();
      const fresh = touchCount === 0 && (
        kind === 'OB'
          ? (z.raw?.lifecycle === 'FRESH' || z.lifecycle === 'FRESH' || z.raw?.tested === false || z.tested === false)
          : (z.tested === false || z.lifecycle === 'FRESH')
      );
      const baseLabel = z.label || `${isSell ? 'Bearish' : 'Bullish'} ${kind} #${idx + 1}`;
      const label = baseLabel.includes(tf) ? baseLabel : `${baseLabel} (${tf})`;
      return {
        low: lo,
        high: hi,
        ce,
        kind,
        tf,
        fresh: Boolean(fresh),
        touchCount,
        ceTouched,
        lastTouchTime,
        touches,
        lifecycle,
        label
      };
    })
    .filter(Boolean);

  // Dedupe near-identical zones inside the same timeframe (keep OB over FVG or fresh first)
  const dedupeTf = arr => {
    const out = [];
    for (const z of arr) {
      const dup = out.find(y => y.tf === z.tf && Math.abs(y.low - z.low) < 0.25 && Math.abs(y.high - z.high) < 0.25);
      if (!dup) out.push(z);
      else if (!dup.fresh && z.fresh) Object.assign(dup, z);
    }
    return out;
  };

  const legMatchesSide = Boolean(
    activeLeg &&
    Number.isFinite(activeLeg.eq) &&
    (!activeLeg.trend || (isSell ? activeLeg.trend === 'BEAR' : activeLeg.trend === 'BULL'))
  );
  const impulseValid = Number.isFinite(num(impulseHigh)) && Number.isFinite(num(impulseLow)) && (num(impulseHigh) - num(impulseLow)) >= 4.0;
  const impulseEq = impulseValid ? (num(impulseHigh) + num(impulseLow)) / 2 : NaN;

  const rawCombined = dedupeTf([
    ...normalize(m15Bbs, 'M15', 'BB'),
    ...normalize(m15Ifvgs, 'M15', 'iFVG'),
    ...normalize(m15Obs, 'M15', 'OB'),
    ...normalize(m15Fvgs, 'M15', 'FVG'),
    ...normalize(m5Bbs, 'M5', 'BB'),
    ...normalize(m5Ifvgs, 'M5', 'iFVG'),
    ...normalize(m5Obs, 'M5', 'OB'),
    ...normalize(m5Fvgs, 'M5', 'FVG')
  ]);

  const candidates = rawCombined
    .filter(z => !Number.isFinite(price) || (isSell ? z.high >= price - 1.0 : z.low <= price + 1.0))
    .map(z => {
      const dist = Number.isFinite(price)
        ? (isSell ? Math.max(0, z.low - price) : Math.max(0, price - z.high))
        : 0;
      const breached = Number.isFinite(price) && (isSell ? price > z.high + 0.25 : price < z.low - 0.25);
      const outsideInvalidation = isSell
        ? (Number.isFinite(protectedHigh) && m15Dir === -1 && z.low > protectedHigh + 0.25)
        : (Number.isFinite(protectedLow) && m15Dir === 1 && z.high < protectedLow - 0.25);
      const inOte = Boolean(legMatchesSide && Number.isFinite(activeLeg.oteLow) && Number.isFinite(activeLeg.oteHigh)
        && z.high >= activeLeg.oteLow - 0.5 && z.low <= activeLeg.oteHigh + 0.5);
      const macroRefEq = legMatchesSide ? activeLeg.eq : eqVal;
      const inRightHalf = Number.isFinite(macroRefEq)
        ? (isSell ? z.ce >= macroRefEq - 1.0 : z.ce <= macroRefEq + 1.0)
        : true;
      const inImpulseHalf = Number.isFinite(impulseEq)
        ? (isSell ? z.ce >= impulseEq - 1.0 : z.ce <= impulseEq + 1.0)
        : false;
      const isContinuation = Boolean(!inRightHalf && (inImpulseHalf || dist <= 12.0));
      const width = z.high - z.low;
      const rules = POI_QUALITY_RULES[z.tf === 'M5' ? 'M5' : 'M15'];
      const oversized = width > rules.maxWidth;
      return {
        ...z,
        dist,
        width,
        oversized,
        breached,
        outsideInvalidation,
        inOte,
        inRightHalf,
        inImpulseHalf,
        isContinuation
      };
    });

  if (!candidates.length) return { primary: null, backup: null, allRanked: [] };

  const unbrokenInside = candidates.filter(z => !z.breached && !z.outsideInvalidation);
  const unbrokenAny = candidates.filter(z => !z.breached);
  const insideAny = candidates.filter(z => !z.outsideInvalidation);
  const rawBasePool = unbrokenInside.length
    ? unbrokenInside
    : (unbrokenAny.length ? unbrokenAny : (insideAny.length ? insideAny : candidates));
  // Strictly enforce SSOT maxWidth cap (<= $10.5 M15 / <= $7.5 M5) so bloated zones never slip into execution
  const cleanSizedPool = rawBasePool.filter(z => !z.oversized);
  if (!cleanSizedPool.length) return { primary: null, backup: null, allRanked: [] };
  const basePool = cleanSizedPool;

  // Dual-Layer Tiering: prefer actionable scalper distance (<= $12), else swing mid (<= $22), else full pool
  const nearScalp = basePool.filter(z => z.dist <= 12.0);
  const midSwing = basePool.filter(z => z.dist <= 22.0);
  const activeTier = nearScalp.length ? nearScalp : (midSwing.length ? midSwing : basePool);

  const scoreZone = z => {
    let score = z.dist;
    if (z.fresh) score -= 3.0;
    if (z.touchCount >= 2) score += 1.5;
    if (z.touchCount >= 3) score += 2.0;
    if (z.tf === 'M15') score -= 3.5; // Strong M15 structural preference; M5 only overrides when clearly closer & clean
    if (z.inOte) score -= 2.5;
    if (z.inRightHalf) score -= 1.5;
    else if (z.inImpulseHalf) score -= 1.2;
    if (z.kind === 'BB') score -= 1.4;
    else if (z.kind === 'iFVG') score -= 1.1;
    else if (z.kind === 'OB') score -= 0.8;
    if (z.oversized) score += 10.0;
    else if (z.width > 9.0) score += 2.5;
    if (z.outsideInvalidation) score += 25.0;
    if (z.breached) score += 30.0;
    // Aligned with M15 bias favors fresher nearer M5/M15 continuation
    if (m15Dir === sideDir && z.dist <= 8.0 && z.fresh) score -= 1.0;
    return score;
  };

  const rankedTier = [...activeTier].sort((a, b) => scoreZone(a) - scoreZone(b));
  const primary = rankedTier[0] || null;
  const allRanked = [...basePool].sort((a, b) => scoreZone(a) - scoreZone(b));

  // Pick a distinct deeper M15 structural backup zone when primary is M5 or shallow continuation
  let backup = null;
  if (primary) {
    const distinct = allRanked.filter(z =>
      Math.abs(z.ce - primary.ce) >= 2.5 &&
      (isSell ? z.low >= primary.high - 0.5 : z.high <= primary.low + 0.5)
    );
    const m15Backup = distinct.filter(z => z.tf === 'M15');
    if (m15Backup.length) {
      backup = m15Backup.sort((a, b) => {
        const sA = a.dist - (a.fresh ? 3.0 : 0) - (a.inRightHalf ? 2.5 : 0);
        const sB = b.dist - (b.fresh ? 3.0 : 0) - (b.inRightHalf ? 2.5 : 0);
        return sA - sB;
      })[0];
    } else if (distinct.length) {
      backup = distinct[0];
    }
  }

  return { primary, backup, allRanked };
}

/**
 * Strict, honest 5-point Scalper POI Verdict Gate.
 * - Enforces ideal scalper SL ($2.0 - $7.5); SL > $7.5 is warned, not green-checked.
 * - Caps grade when entry zone is far (> $18 from live price).
 * - Separates live execution (<= $4) from pullback standby ($4 - $18).
 * - Recognizes Dual-Layer M5/M15 continuation retests honestly.
 */
export function evaluateScalperPoiVerdict({
  side,
  h1Dir = 0,
  m15Dir = 0,
  m5Dir = 0,
  zone = null,
  livePrice = 0,
  slGuard = { dist: NaN, status: 'unknown' },
  rr1 = NaN,
  tp1 = null,
  isSlHit = false,
  sessionGuard = { blocked: false, halfLot: false },
  newsStatus = ''
}) {
  const isSell = side === 'SELL';
  const sideDir = isSell ? -1 : 1;

  const isWithM15 = m15Dir === sideDir;
  const isWithH1 = h1Dir === sideDir;
  const isCounterM15 = m15Dir !== 0 && m15Dir !== sideDir;
  const isCounterFull = h1Dir === -sideDir && m15Dir === -sideDir;
  const isM5Aligned = m5Dir === sideDir;

  const zoneDist = (zone && Number.isFinite(livePrice) && livePrice > 0)
    ? (isSell ? Math.max(0, zone.low - livePrice) : Math.max(0, livePrice - zone.high))
    : NaN;
  const isZoneFar = Number.isFinite(zoneDist) && zoneDist > 18.0;

  // 1. Trend Alignment
  const trendPass = isWithM15 || (m15Dir === 0 && isWithH1);
  const trendLabel = isWithH1 && isWithM15
    ? 'Tren H1+M15'
    : isWithM15
      ? 'Searah M15'
      : isCounterFull
        ? (isM5Aligned ? 'Counter H1+M15' : 'Counter 3-TF')
        : 'Counter M15';

  // 2. Location (OTE / Premium / Discount / Dual-Layer Continuation + Proximity)
  const continuationOk = Boolean(zone && !zone.inRightHalf && (zone.inImpulseHalf || zone.isContinuation) && trendPass && !isZoneFar);
  const locPass = Boolean(zone && !zone.outsideInvalidation && !isZoneFar && (zone.inRightHalf || continuationOk));
  const locLabel = !zone
    ? 'Lokasi —'
    : isZoneFar
      ? `Zona Jauh ($${zoneDist.toFixed(0)})`
      : zone.inOte
        ? 'Zona OTE'
        : zone.inRightHalf
          ? (isSell ? 'Premium Leg' : 'Diskon Leg')
          : continuationOk
            ? (zone.tf === 'M5' ? 'Retest Impuls M5' : 'Continuation M15')
            : 'Lokasi Lemah';

  // 3. POI Quality (shows explicit M5 / M15 source tag & touch count)
  const poiPass = Boolean(zone && !zone.breached && !zone.outsideInvalidation && !isSlHit);
  const tfSuffix = zone?.tf ? ` ${zone.tf}` : '';
  const touchCnt = Number(zone?.touchCount) || 0;
  const poiLabel = !zone
    ? 'Belum Ada POI'
    : zone.breached || isSlHit
      ? 'Zona Jebol'
      : zone.outsideInvalidation
        ? 'Di Luar Invalid'
        : zone.fresh
          ? `Fresh ${zone.kind}${tfSuffix}`
          : touchCnt > 0
            ? `${zone.kind}${tfSuffix} · ${touchCnt}×${zone.ceTouched ? ' CE' : ''}`
            : `${zone.kind}${tfSuffix} Aktif`;

  // 4. M5 Confirmation
  const m5Pass = isM5Aligned;
  const m5Label = isM5Aligned ? 'M5 Konfirm' : 'Tunggu M5';

  // 5. Risk / Reward & SL Guard (Ideal Gold SL 60-100 pips / <= $10.0 + honest synthetic TP1 tag)
  const slIdeal = slGuard.status === 'ideal' && Number.isFinite(slGuard.dist) && slGuard.dist >= 2.0 && slGuard.dist <= 10.0;
  const slAcceptable = Number.isFinite(slGuard.dist) && slGuard.dist >= 2.0 && slGuard.dist <= 12.0;
  const rrOk = Number.isFinite(rr1) && rr1 >= 1.4;
  const tpSynthetic = Boolean(tp1?.synthetic);
  const rrSlPass = Boolean(zone) && slIdeal && rrOk && !tpSynthetic && !sessionGuard.blocked;
  const rrSlWarn = Boolean(zone) && !sessionGuard.blocked && slAcceptable && rrOk && (!slIdeal || tpSynthetic || sessionGuard.halfLot);

  const rrSlLabel = sessionGuard.blocked
    ? 'Sesi/News Lock'
    : !zone
      ? 'Menunggu R:R'
      : slGuard.status === 'tight'
        ? 'SL Terlalu Ketat'
        : !slIdeal
          ? `SL Lebar ($${Number.isFinite(slGuard.dist) ? slGuard.dist.toFixed(1) : '—'})`
          : !rrOk
            ? 'R:R Kecil'
            : tpSynthetic
              ? `Proyeksi 1:${rr1.toFixed(1)}`
              : `DOL 1:${rr1.toFixed(1)}`;

  const checks = [
    { ok: trendPass, warn: !trendPass && isM5Aligned, label: trendLabel },
    { ok: locPass, warn: Boolean(zone && (zone.inRightHalf || zone.isContinuation) && isZoneFar), label: locLabel },
    { ok: poiPass, warn: false, label: poiLabel },
    { ok: m5Pass, warn: !m5Pass && trendPass, label: m5Label },
    { ok: rrSlPass, warn: rrSlWarn, label: rrSlLabel }
  ];

  const score = checks.reduce((n, c) => n + (c.ok ? 1 : 0), 0);

  let cls = 'is-wait';
  let gradeText = 'GRADE B · TUNGGU KONFIRMASI';
  let isSkip = false;

  const isAtZone = Number.isFinite(zoneDist) && zoneDist <= 4.0;
  const isPullbackWait = Number.isFinite(zoneDist) && zoneDist > 4.0 && zoneDist <= 18.0;
  const pullbackSign = isSell ? '+' : '-';

  if (sessionGuard.blocked) {
    cls = 'is-skip';
    gradeText = newsStatus === 'NEWS_LOCK' ? 'SKIP · NEWS USD AKTIF' : 'SKIP · PASAR TUTUP';
    isSkip = true;
  } else if (!zone || zone.breached || isSlHit) {
    cls = 'is-skip';
    gradeText = zone?.breached || isSlHit ? 'SKIP · ZONA SUDAH JEBOL' : 'SKIP · BELUM ADA ZONA';
    isSkip = true;
  } else if (zone.outsideInvalidation) {
    cls = 'is-skip';
    gradeText = 'SKIP · ZONA DI LUAR INVALIDASI';
    isSkip = true;
  } else if (isCounterFull && !isM5Aligned) {
    cls = 'is-skip';
    gradeText = 'SKIP · COUNTER-TREND (WAJIB MSS M5)';
    isSkip = true;
  } else if (Number.isFinite(rr1) && rr1 < 1.2) {
    cls = 'is-skip';
    gradeText = `SKIP · R:R TERLALU KECIL (1:${rr1.toFixed(1)})`;
    isSkip = true;
  } else if (isZoneFar) {
    cls = 'is-wait';
    gradeText = isCounterM15
      ? `PANTAU JAUH · COUNTER M15 (${pullbackSign}$${zoneDist.toFixed(0)})`
      : `PANTAU JAUH · TUNGGU PULLBACK (${pullbackSign}$${zoneDist.toFixed(0)})`;
  } else if (isCounterM15 && !isM5Aligned) {
    cls = 'is-wait';
    gradeText = 'WAIT · COUNTER M15 (TUNGGU MSS M5)';
    isSkip = true;
  } else if (score === 5) {
    if (isAtZone) {
      cls = isSell ? 'is-ready-sell' : 'is-ready';
      gradeText = 'GRADE A+ · SIAP EKSEKUSI SCALPER';
    } else {
      cls = 'is-wait';
      gradeText = `GRADE A+ · TUNGGU PULLBACK (${pullbackSign}$${zoneDist.toFixed(1)})`;
    }
  } else if (score === 4 && trendPass && poiPass) {
    cls = 'is-wait';
    gradeText = isPullbackWait
      ? `GRADE A · TUNGGU PULLBACK (${pullbackSign}$${zoneDist.toFixed(1)})`
      : (isM5Aligned ? 'GRADE A · SIAP EKSEKUSI' : 'GRADE A · SIAP PANTAU M5');
  } else if (score >= 3 && poiPass) {
    cls = 'is-wait';
    gradeText = isCounterFull ? 'GRADE B · SCALP REVERSAL M5' : 'GRADE B · TUNGGU PULLBACK & M5';
  } else if (poiPass && (trendPass || isM5Aligned)) {
    cls = 'is-wait';
    gradeText = 'GRADE C · KONFLUENSI PARSIAL';
  } else {
    cls = 'is-skip';
    gradeText = 'SKIP · PROBABILITAS RENDAH';
    isSkip = true;
  }

  return {
    cls,
    grade: gradeText,
    skip: isSkip,
    score,
    checks,
    zoneDist,
    isZoneFar
  };
}

if (typeof window !== 'undefined') {
  window.AmyMappingAccuracy = {
    POI_QUALITY_RULES,
    getWitaHour,
    evaluatePoiQualityGate,
    resolveM15Direction,
    formatPdlPdhRange,
    resolveSsotTelemetry,
    formatTp1Subtitle,
    selectScalperDualLayerPoi,
    evaluateScalperPoiVerdict
  };
}
