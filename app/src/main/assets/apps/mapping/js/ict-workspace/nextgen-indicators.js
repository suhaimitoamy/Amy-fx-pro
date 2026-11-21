// NextGen Visual Indicators Engine based on AMY_ICT_NextGen.pine
// Deterministic, zero-dependency, safe calculation on closed/active candles.

export function calculateNextGenIndicators(candles = [], options = {}) {
  const safeCandles = Array.isArray(candles) ? candles.filter(c => c && Number.isFinite(c.time) && Number.isFinite(c.close)) : [];
  if (safeCandles.length === 0) {
    return {
      keyLevels: {
        pdh: null, pdl: null, pdhConsumed: false, pdlConsumed: false,
        pwh: null, pwl: null, pwhConsumed: false, pwlConsumed: false,
        asiaHigh: null, asiaLow: null, asiaStart: null, asiaEnd: null, asiaHighConsumed: false, asiaLowConsumed: false,
        pdEq: null, pdHigh: null, pdLow: null,
        trendInvalidation: null, trendInvalidationText: '', trendInvalidationColor: '#ef4444', trend: 'NEUTRAL'
      },
      liquidity: { bsl: [], ssl: [], sweeps: [] },
      structure: { events: [], trend: 'NEUTRAL', invalidation: null },
      poi: { fvg: [], ob: [], historyFvg: [], historyOb: [], recentBroken: [] }
    };
  }

  const swingLen = options.swingLen || 4;
  const pdLookback = options.pdLookback || 80;
  const obSearchBars = options.obSearchBars || 12;
  const obUseBody = options.obUseBody !== false;
  const context = options.context || {};
  const serverLevels = context?.amy?.levels || {};

  // 1. Dealing Range: 80-bar lookback PD EQ
  const recentSlice = safeCandles.slice(-pdLookback);
  const pdHigh = Math.max(...recentSlice.map(c => c.high));
  const pdLow = Math.min(...recentSlice.map(c => c.low));
  const pdEq = Number.isFinite(pdHigh) && Number.isFinite(pdLow) ? (pdHigh + pdLow) / 2 : null;

  // NY local time parts helper (DST-aware for ICT Asia 20:00–00:00 NY & 17:00 NY day rollover)
  const nyFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });
  function getNyParts(timeSec) {
    try {
      const parts = nyFormatter.formatToParts(new Date(timeSec * 1000));
      const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
      const hour = Number(p.hour);
      const minute = Number(p.minute);
      const dateStr = `${p.year}-${p.month}-${p.day}`;
      const d = new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)));
      if (hour >= 17) d.setUTCDate(d.getUTCDate() + 1);
      return {
        dateStr,
        tradingDayKey: d.toISOString().slice(0, 10),
        minuteOfDay: hour * 60 + minute
      };
    } catch {
      const shifted = timeSec + 7 * 3600;
      const d = new Date(shifted * 1000);
      return {
        dateStr: d.toISOString().slice(0, 10),
        tradingDayKey: d.toISOString().slice(0, 10),
        minuteOfDay: d.getUTCHours() * 60 + d.getUTCMinutes()
      };
    }
  }

  // Pre-compute baseline scale / ATR estimate for key-level sweep depth guard
  const sampleRanges = safeCandles.slice(-20).map(c => Math.max(0, c.high - c.low));
  const avgSampleRange = sampleRanges.length ? (sampleRanges.reduce((a, b) => a + b, 0) / sampleRanges.length) : 2.0;
  const lastPriceHint = safeCandles[safeCandles.length - 1]?.close || 0;
  const minKeySweepDepth = lastPriceHint > 100
    ? Math.max(0.25, avgSampleRange * 0.08)
    : Math.max(0.01, avgSampleRange * 0.05);

  // 2. Calendar groupings for PDH/PDL, PWH/PWL and ICT Asia Session (20:00-00:00 NY, DST-aware)
  let pdh = null, pdl = null, pdhConsumed = false, pdlConsumed = false;
  let pwh = null, pwl = null, pwhConsumed = false, pwlConsumed = false;
  let asiaHigh = null, asiaLow = null, asiaStart = null, asiaEnd = null;
  let asiaHighConsumed = false, asiaLowConsumed = false;
  const sweeps = [];

  const dayBuckets = new Map();
  const weekBuckets = new Map();
  const asiaBuckets = new Map();

  for (let i = 0; i < safeCandles.length; i++) {
    const c = safeCandles[i];
    const ny = getNyParts(c.time);
    // Gold trading day bucket (17:00 NY Close cutoff)
    const tDayStr = ny.tradingDayKey;
    // ICT Asia Range: 20:00 - 00:00 America/New_York (matches amy-ict.js & market-session-clock.js)
    const isAsia = ny.minuteOfDay >= 1200;

    if (!dayBuckets.has(tDayStr)) dayBuckets.set(tDayStr, []);
    dayBuckets.get(tDayStr).push(c);

    if (isAsia) {
      if (!asiaBuckets.has(tDayStr)) asiaBuckets.set(tDayStr, []);
      asiaBuckets.get(tDayStr).push(c);
    }

    // Week bucket: ISO week string
    const utcDate = new Date(c.time * 1000);
    const d = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    const weekStr = `${d.getUTCFullYear()}-W${weekNo}`;
    if (!weekBuckets.has(weekStr)) weekBuckets.set(weekStr, []);
    weekBuckets.get(weekStr).push(c);
  }

  // Extract server / context key levels (authoritative D1 Daily source)
  const serverAmyLevels = context?.amy?.levels || {};
  const serverLiq = Array.isArray(context?.liquidity) ? context.liquidity : [];
  const liqPdh = serverLiq.find(l => l.label === 'PDH')?.level;
  const liqPdl = serverLiq.find(l => l.label === 'PDL')?.level;
  const liqPwh = serverLiq.find(l => l.label === 'PWH')?.level;
  const liqPwl = serverLiq.find(l => l.label === 'PWL')?.level;

  const resolvedServerPdh = Number.isFinite(serverAmyLevels.pdh) && serverAmyLevels.pdh > 0
    ? serverAmyLevels.pdh
    : (Number.isFinite(liqPdh) && liqPdh > 0
      ? liqPdh
      : (Number.isFinite(context?.pd?.pdh) && context.pd.pdh > 0
        ? context.pd.pdh
        : (Number.isFinite(context?.levels?.pdh) && context.levels.pdh > 0 ? context.levels.pdh : null)));

  const resolvedServerPdl = Number.isFinite(serverAmyLevels.pdl) && serverAmyLevels.pdl > 0
    ? serverAmyLevels.pdl
    : (Number.isFinite(liqPdl) && liqPdl > 0
      ? liqPdl
      : (Number.isFinite(context?.pd?.pdl) && context.pd.pdl > 0
        ? context.pd.pdl
        : (Number.isFinite(context?.levels?.pdl) && context.levels.pdl > 0 ? context.levels.pdl : null)));

  // Previous Day High / Low from trading day buckets
  const dayKeys = [...dayBuckets.keys()];
  let localPdh = null;
  let localPdl = null;
  if (dayKeys.length >= 2) {
    const prevDayKey = dayKeys[dayKeys.length - 2];
    const prevDayCandles = dayBuckets.get(prevDayKey) || [];
    if (prevDayCandles.length > 0) {
      localPdh = Math.max(...prevDayCandles.map(c => c.high));
      localPdl = Math.min(...prevDayCandles.map(c => c.low));
    }
  }

  // Final resolution: Authoritative Daily D1 preferred directly (never merge two different trading days via max/min)
  if (Number.isFinite(resolvedServerPdh) && Number.isFinite(resolvedServerPdl) && resolvedServerPdh > resolvedServerPdl) {
    pdh = resolvedServerPdh;
    pdl = resolvedServerPdl;
  } else if (Number.isFinite(localPdh) && Number.isFinite(localPdl) && localPdh > localPdl) {
    pdh = localPdh;
    pdl = localPdl;
  }

  // Check PDH / PDL sweeps (require meaningful sweep depth) and consumed status in the latest day
  if (dayKeys.length > 0 && Number.isFinite(pdh) && Number.isFinite(pdl)) {
    const todayCandles = dayBuckets.get(dayKeys[dayKeys.length - 1]) || [];
    for (const c of todayCandles) {
      if (!pdhConsumed && c.high >= pdh + minKeySweepDepth && c.close < pdh) {
        sweeps.push({ time: c.time, price: c.high, level: pdh, type: 'PDH_SWEEP', pool: 'PDH', side: 'SELL', reactionSide: 'SELL', symbol: '×', color: '#f97316' });
        pdhConsumed = true;
      }
      if (!pdlConsumed && c.low <= pdl - minKeySweepDepth && c.close > pdl) {
        sweeps.push({ time: c.time, price: c.low, level: pdl, type: 'PDL_SWEEP', pool: 'PDL', side: 'BUY', reactionSide: 'BUY', symbol: '×', color: '#3b82f6' });
        pdlConsumed = true;
      }
      if (c.close > pdh || c.high >= pdh + minKeySweepDepth) pdhConsumed = true;
      if (c.close < pdl || c.low <= pdl - minKeySweepDepth) pdlConsumed = true;
    }
  }

  // Previous Week High / Low (strictly genuine prior-week extremes; never substitute Pivot R1/S1)
  const weekKeys = [...weekBuckets.keys()];
  let localPwh = null;
  let localPwl = null;
  if (weekKeys.length >= 2) {
    const prevWeekCandles = weekBuckets.get(weekKeys[weekKeys.length - 2]) || [];
    if (prevWeekCandles.length > 0) {
      localPwh = Math.max(...prevWeekCandles.map(c => c.high));
      localPwl = Math.min(...prevWeekCandles.map(c => c.low));
    }
  }

  const resolvedServerPwh = Number.isFinite(serverAmyLevels.pwh) && serverAmyLevels.pwh > 0
    ? serverAmyLevels.pwh
    : (Number.isFinite(liqPwh) && liqPwh > 0 ? liqPwh : null);

  const resolvedServerPwl = Number.isFinite(serverAmyLevels.pwl) && serverAmyLevels.pwl > 0
    ? serverAmyLevels.pwl
    : (Number.isFinite(liqPwl) && liqPwl > 0 ? liqPwl : null);

  if (Number.isFinite(resolvedServerPwh) && Number.isFinite(resolvedServerPwl) && resolvedServerPwh > resolvedServerPwl) {
    pwh = resolvedServerPwh;
    pwl = resolvedServerPwl;
  } else if (Number.isFinite(localPwh) && Number.isFinite(localPwl) && localPwh > localPwl) {
    pwh = localPwh;
    pwl = localPwl;
  }

  // Check PWH / PWL sweeps with meaningful depth
  if (weekKeys.length > 0 && Number.isFinite(pwh) && Number.isFinite(pwl)) {
    const currentWeekCandles = weekBuckets.get(weekKeys[weekKeys.length - 1]) || [];
    for (const c of currentWeekCandles) {
      if (!pwhConsumed && c.high >= pwh + minKeySweepDepth && c.close < pwh) {
        sweeps.push({ time: c.time, price: c.high, level: pwh, type: 'PWH_SWEEP', pool: 'PWH', side: 'SELL', reactionSide: 'SELL', symbol: '×', color: '#d946ef' });
        pwhConsumed = true;
      }
      if (!pwlConsumed && c.low <= pwl - minKeySweepDepth && c.close > pwl) {
        sweeps.push({ time: c.time, price: c.low, level: pwl, type: 'PWL_SWEEP', pool: 'PWL', side: 'BUY', reactionSide: 'BUY', symbol: '×', color: '#06b6d4' });
        pwlConsumed = true;
      }
      if (c.close > pwh || c.high >= pwh + minKeySweepDepth) pwhConsumed = true;
      if (c.close < pwl || c.low <= pwl - minKeySweepDepth) pwlConsumed = true;
    }
  }

  // Asia Session High / Low (authoritative locked server Asia or latest local 20:00–00:00 NY session)
  const asiaDayKeys = [...asiaBuckets.keys()];
  if (asiaDayKeys.length > 0) {
    const latestAsiaCandles = asiaBuckets.get(asiaDayKeys[asiaDayKeys.length - 1]);
    asiaHigh = Math.max(...latestAsiaCandles.map(c => c.high));
    asiaLow = Math.min(...latestAsiaCandles.map(c => c.low));
    asiaStart = latestAsiaCandles[0].time;
    asiaEnd = latestAsiaCandles[latestAsiaCandles.length - 1].time;
    // Prefer authoritative server locked Asia range if close in time and valid
    if (serverLevels.asiaStatus === 'LOCKED' && Number.isFinite(serverLevels.asiaHigh) && Number.isFinite(serverLevels.asiaLow) && serverLevels.asiaHigh > serverLevels.asiaLow) {
      asiaHigh = serverLevels.asiaHigh;
      asiaLow = serverLevels.asiaLow;
    }

    // Check subsequent candles for Asia sweeps
    const afterAsia = safeCandles.filter(c => c.time > asiaEnd);
    for (const c of afterAsia) {
      if (!asiaHighConsumed && c.high >= asiaHigh + minKeySweepDepth && c.close < asiaHigh) {
        sweeps.push({ time: c.time, price: c.high, level: asiaHigh, type: 'ASIA_HIGH_SWEEP', pool: 'Asia High', side: 'SELL', reactionSide: 'SELL', symbol: '◆', color: '#a855f7' });
        asiaHighConsumed = true;
      }
      if (!asiaLowConsumed && c.low <= asiaLow - minKeySweepDepth && c.close > asiaLow) {
        sweeps.push({ time: c.time, price: c.low, level: asiaLow, type: 'ASIA_LOW_SWEEP', pool: 'Asia Low', side: 'BUY', reactionSide: 'BUY', symbol: '◆', color: '#a855f7' });
        asiaLowConsumed = true;
      }
      if (c.close > asiaHigh || c.high >= asiaHigh + minKeySweepDepth) asiaHighConsumed = true;
      if (c.close < asiaLow || c.low <= asiaLow - minKeySweepDepth) asiaLowConsumed = true;
    }
  } else if (Number.isFinite(serverLevels.asiaHigh) && Number.isFinite(serverLevels.asiaLow) && serverLevels.asiaHigh > serverLevels.asiaLow) {
    asiaHigh = serverLevels.asiaHigh;
    asiaLow = serverLevels.asiaLow;
    const minCheckTime = Number(serverLevels.asiaTime || 0) + 4 * 3600;
    for (const c of safeCandles) {
      if (minCheckTime > 4 * 3600 && c.time < minCheckTime) continue;
      if (!asiaHighConsumed && c.high >= asiaHigh + minKeySweepDepth && c.close < asiaHigh) {
        sweeps.push({ time: c.time, price: c.high, level: asiaHigh, type: 'ASIA_HIGH_SWEEP', pool: 'Asia High', side: 'SELL', reactionSide: 'SELL', symbol: '◆', color: '#a855f7' });
        asiaHighConsumed = true;
      }
      if (!asiaLowConsumed && c.low <= asiaLow - minKeySweepDepth && c.close > asiaLow) {
        sweeps.push({ time: c.time, price: c.low, level: asiaLow, type: 'ASIA_LOW_SWEEP', pool: 'Asia Low', side: 'BUY', reactionSide: 'BUY', symbol: '◆', color: '#a855f7' });
        asiaLowConsumed = true;
      }
      if (c.close > asiaHigh || c.high >= asiaHigh + minKeySweepDepth) asiaHighConsumed = true;
      if (c.close < asiaLow || c.low <= asiaLow - minKeySweepDepth) asiaLowConsumed = true;
    }
  }

  // 3. Pivots, BSL / SSL, Market Structure (BOS / MSS), Trend Invalidation, FVG, OB, Sweep & DOL
  const bslLines = [];
  const sslLines = [];
  const structureEvents = [];
  const fvgList = [];
  const obList = [];

  let lastHigh = null;
  let lastLow = null;
  let lastHighTime = null;
  let lastLowTime = null;
  let lastHighIndex = -1;
  let lastLowIndex = -1;
  // Protected Structural High/Low — ONLY move when a confirmed BOS/MSS validates the leg!
  let protectedHigh = null;
  let protectedHighTime = null;
  let protectedHighIndex = -1;
  let protectedLow = null;
  let protectedLowTime = null;
  let protectedLowIndex = -1;
  let legHigh = null;
  let legLow = null;
  let bslConsumed = false;
  let sslConsumed = false;
  let bslBroken = false;
  let sslBroken = false;
  const tf = options.tf || options.timeframe || 'M15';
  const expectedInterval = { M1: 60, M5: 300, M15: 900, H1: 3600 }[tf] || 900;
  // Causal evolution from candle 0 — never pre-seed from end-of-series future bias
  let trend = 'NEUTRAL';

  // Per-bar rolling ATR(14) & body moving average for displacement / thickness filters
  const bodies = safeCandles.map(c => Math.abs(c.close - c.open));
  const meanBodies = [];
  const barAtrs = [];
  for (let i = 0; i < safeCandles.length; i++) {
    const c = safeCandles[i];
    const prevC = i > 0 ? safeCandles[i - 1] : null;
    const tr = prevC ? Math.max(c.high - c.low, Math.abs(c.high - prevC.close), Math.abs(c.low - prevC.close)) : (c.high - c.low);
    if (i === 0) {
      barAtrs.push(Math.max(tr, 0.5));
      meanBodies.push(bodies[i]);
    } else {
      const alpha = Math.min(i + 1, 14);
      barAtrs.push((barAtrs[i - 1] * (alpha - 1) + tr) / alpha);
      const slice = bodies.slice(Math.max(0, i - 4), i + 1);
      meanBodies.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    }
  }

  const isContiguousPair = (a, b) => {
    if (!a || !b) return false;
    const dt = b.time - a.time;
    return dt > 0 && dt <= expectedInterval * 3;
  };

  for (let i = 0; i < safeCandles.length; i++) {
    const c = safeCandles[i];
    const prev = safeCandles[i - 1];
    const curAtr = barAtrs[i] || 2.0;
    const isGoldScale = c.close > 100;
    const minSweepDepth = isGoldScale ? Math.max(0.25, curAtr * 0.08) : Math.max(0.01, curAtr * 0.05);
    const minFvgThick = isGoldScale ? Math.max(0.8, curAtr * 0.15) : Math.max(0.02, curAtr * 0.1);
    const minObThick = isGoldScale ? Math.max(0.6, curAtr * 0.12) : Math.max(0.02, curAtr * 0.08);

    // Check pivot at k = i - swingLen (strictly causal: confirmed only at bar i)
    const k = i - swingLen;
    if (k >= swingLen) {
      const target = safeCandles[k];
      let isPh = true;
      let isPl = true;

      for (let j = k - swingLen; j <= k + swingLen; j++) {
        if (j === k) continue;
        const other = safeCandles[j];
        if (j < k) {
          if (other.high > target.high) isPh = false;
          if (other.low < target.low) isPl = false;
        } else {
          if (other.high >= target.high) isPh = false;
          if (other.low <= target.low) isPl = false;
        }
      }

      if (isPh) {
        lastHigh = target.high;
        lastHighTime = target.time;
        lastHighIndex = k;
        bslConsumed = false;
        bslBroken = false;
        bslLines.push({
          level: lastHigh,
          time: lastHighTime,
          confirmedTime: c.time,
          consumed: false
        });
      }

      if (isPl) {
        lastLow = target.low;
        lastLowTime = target.time;
        lastLowIndex = k;
        sslConsumed = false;
        sslBroken = false;
        sslLines.push({
          level: lastLow,
          time: lastLowTime,
          confirmedTime: c.time,
          consumed: false
        });
      }
    }

    // Multi-pool BSL / SSL Sweeps: check BOTH latest swing AND any unconsumed older swing pool
    let sweptBslPool = null;
    for (const l of bslLines) {
      if (!l.consumed && c.time > l.confirmedTime && c.high >= l.level + minSweepDepth && c.close < l.level) {
        l.consumed = true;
        if (!sweptBslPool || l.level > sweptBslPool.level) sweptBslPool = l;
      }
    }
    if (!sweptBslPool && !bslConsumed && lastHigh != null && c.high >= lastHigh + minSweepDepth && c.close < lastHigh) {
      sweptBslPool = { level: lastHigh };
    }
    if (sweptBslPool) {
      if (lastHigh != null && Math.abs(sweptBslPool.level - lastHigh) < 0.05) bslConsumed = true;
      sweeps.push({
        time: c.time,
        price: c.high,
        level: sweptBslPool.level,
        type: 'BSL_SWEEP',
        pool: 'BSL',
        side: 'SELL',
        reactionSide: 'SELL',
        symbol: '×',
        color: '#ef4444'
      });
    }

    let sweptSslPool = null;
    for (const l of sslLines) {
      if (!l.consumed && c.time > l.confirmedTime && c.low <= l.level - minSweepDepth && c.close > l.level) {
        l.consumed = true;
        if (!sweptSslPool || l.level < sweptSslPool.level) sweptSslPool = l;
      }
    }
    if (!sweptSslPool && !sslConsumed && lastLow != null && c.low <= lastLow - minSweepDepth && c.close > lastLow) {
      sweptSslPool = { level: lastLow };
    }
    if (sweptSslPool) {
      if (lastLow != null && Math.abs(sweptSslPool.level - lastLow) < 0.05) sslConsumed = true;
      sweeps.push({
        time: c.time,
        price: c.low,
        level: sweptSslPool.level,
        type: 'SSL_SWEEP',
        pool: 'SSL',
        side: 'BUY',
        reactionSide: 'BUY',
        symbol: '×',
        color: '#22c55e'
      });
    }

    // Mark any prior unconsumed BSL/SSL lines as consumed once price closes beyond them
    for (const l of bslLines) {
      if (!l.consumed && c.time > l.confirmedTime && c.close > l.level) l.consumed = true;
    }
    for (const l of sslLines) {
      if (!l.consumed && c.time > l.confirmedTime && c.close < l.level) l.consumed = true;
    }

    // Helper: find true structural origin extreme between two bar indices
    const findOriginExtreme = (startIdx, endIdx, mode) => {
      const from = Math.max(0, startIdx);
      const to = Math.min(safeCandles.length - 1, endIdx);
      let bestVal = mode === 'low' ? Infinity : -Infinity;
      let bestTime = null;
      let bestIdx = -1;
      for (let idx = from; idx <= to; idx++) {
        const bar = safeCandles[idx];
        if (mode === 'low' && bar.low < bestVal) {
          bestVal = bar.low;
          bestTime = bar.time;
          bestIdx = idx;
        } else if (mode === 'high' && bar.high > bestVal) {
          bestVal = bar.high;
          bestTime = bar.time;
          bestIdx = idx;
        }
      }
      return bestIdx >= 0 ? { level: bestVal, time: bestTime, index: bestIdx } : null;
    };

    // Track current leg high/low for active dealing range
    if (trend === 'BULL') {
      legHigh = legHigh == null ? c.high : Math.max(legHigh, c.high);
    } else if (trend === 'BEAR') {
      legLow = legLow == null ? c.low : Math.min(legLow, c.low);
    }

    // Market Structure Breaks:
    // - Continuation BOS breaks active swing (lastHigh in BULL / lastLow in BEAR)
    // - Reversal MSS MUST close beyond Protected Swing (protectedHigh in BEAR / protectedLow in BULL)
    const bullBreakLevel = trend === 'BEAR' && protectedHigh != null ? protectedHigh : lastHigh;
    const bullBreakTime = trend === 'BEAR' && protectedHigh != null ? protectedHighTime : lastHighTime;
    const bullBreakIndex = trend === 'BEAR' && protectedHigh != null ? protectedHighIndex : lastHighIndex;

    const bearBreakLevel = trend === 'BULL' && protectedLow != null ? protectedLow : lastLow;
    const bearBreakTime = trend === 'BULL' && protectedLow != null ? protectedLowTime : lastLowTime;
    const bearBreakIndex = trend === 'BULL' && protectedLow != null ? protectedLowIndex : lastLowIndex;

    const canBreakBull = trend !== 'BULL' || !bslBroken;
    const canBreakBear = trend !== 'BEAR' || !sslBroken;

    const rawBreakBull = canBreakBull && bullBreakLevel != null && c.close > bullBreakLevel && (prev ? prev.close <= bullBreakLevel : true);
    const rawBreakBear = canBreakBear && bearBreakLevel != null && c.close < bearBreakLevel && (prev ? prev.close >= bearBreakLevel : true);

    const mssBull = rawBreakBull && trend === 'BEAR';
    const mssBear = rawBreakBear && trend === 'BULL';

    if (rawBreakBull) {
      const prevTrend = trend;
      trend = 'BULL';
      bslBroken = true;
      sslBroken = false;

      // Lock true Protected Low: lowest point between broken swing high and break candle
      const originSearchFrom = bullBreakIndex >= 0 ? bullBreakIndex : Math.max(0, i - 25);
      const originLow = findOriginExtreme(originSearchFrom, i, 'low');
      if (originLow) {
        if (prevTrend !== 'BULL' || protectedLow == null || originLow.level >= protectedLow) {
          protectedLow = originLow.level;
          protectedLowTime = originLow.time;
          protectedLowIndex = originLow.index;
        }
      } else if (lastLow != null && (prevTrend !== 'BULL' || protectedLow == null || lastLow > protectedLow)) {
        protectedLow = lastLow;
        protectedLowTime = lastLowTime;
        protectedLowIndex = lastLowIndex;
      }
      protectedHigh = null;
      protectedHighTime = null;
      protectedHighIndex = -1;
      legLow = protectedLow ?? lastLow ?? c.low;
      legHigh = Math.max(bullBreakLevel, c.high);

      for (const l of bslLines) {
        if (!l.consumed && Math.abs(l.level - bullBreakLevel) < 0.05) l.consumed = true;
      }
      const breakBody = Math.abs(c.close - c.open);
      const breakDisplaced = breakBody >= (meanBodies[i] || breakBody) * 0.9;
      structureEvents.push({
        type: mssBull || prevTrend === 'BEAR' ? 'MSS' : 'BOS',
        side: 'BULL',
        level: bullBreakLevel,
        startTime: bullBreakTime,
        endTime: c.time,
        displaced: breakDisplaced,
        color: '#22c55e'
      });

      // Search back for unbroken Origin Order Block within the break leg (last opposing down candle meeting minObThick)
      const obMinIdx = Math.max(0, Math.min(i - 1, originSearchFrom - 2));
      for (let offset = 1; offset <= obSearchBars && i - offset >= obMinIdx; offset++) {
        const originIdx = i - offset;
        const candidate = safeCandles[originIdx];
        if (candidate.close < candidate.open) {
          const bodyTop = Math.max(candidate.open, candidate.close);
          const bodyBot = Math.min(candidate.open, candidate.close);
          const fullThick = candidate.high - candidate.low;
          if (fullThick < minObThick) continue;
          const useBodyRange = obUseBody && (bodyTop - bodyBot) >= minObThick;
          const top = useBodyRange ? bodyTop : candidate.high;
          const bot = useBodyRange ? bodyBot : candidate.low;
          // Reject OB if already invalidated (closed below bot) between origin and break bar
          let preBroken = false;
          for (let mid = originIdx + 1; mid <= i; mid++) {
            if (safeCandles[mid].close < bot) { preBroken = true; break; }
          }
          if (preBroken) continue;
          const dupOb = obList.find(z => !z.mitigated && z.side === 'BUY' && Math.abs(z.bot - bot) < 0.25 && Math.abs(z.top - top) < 0.25);
          if (!dupOb) {
            obList.push({
              side: 'BUY',
              top,
              bot,
              ce: (top + bot) / 2,
              startTime: candidate.time,
              originIndex: originIdx,
              formedIndex: i,
              label: '+OB',
              color: '#3b82f6',
              tested: false,
              mitigated: false,
              ceTouched: false,
              touchCount: 0,
              firstTouchTime: null,
              lastTouchTime: null,
              touches: [],
              _inTouch: false,
              lifecycle: 'FRESH'
            });
          }
          break;
        }
      }
    }

    if (rawBreakBear) {
      const prevTrend = trend;
      trend = 'BEAR';
      sslBroken = true;
      bslBroken = false;

      // Lock true Protected High: highest point between broken swing low and break candle
      const originSearchFrom = bearBreakIndex >= 0 ? bearBreakIndex : Math.max(0, i - 25);
      const originHigh = findOriginExtreme(originSearchFrom, i, 'high');
      if (originHigh) {
        if (prevTrend !== 'BEAR' || protectedHigh == null || originHigh.level <= protectedHigh) {
          protectedHigh = originHigh.level;
          protectedHighTime = originHigh.time;
          protectedHighIndex = originHigh.index;
        }
      } else if (lastHigh != null && (prevTrend !== 'BEAR' || protectedHigh == null || lastHigh < protectedHigh)) {
        protectedHigh = lastHigh;
        protectedHighTime = lastHighTime;
        protectedHighIndex = lastHighIndex;
      }
      protectedLow = null;
      protectedLowTime = null;
      protectedLowIndex = -1;
      legHigh = protectedHigh ?? lastHigh ?? c.high;
      legLow = Math.min(bearBreakLevel, c.low);

      for (const l of sslLines) {
        if (!l.consumed && Math.abs(l.level - bearBreakLevel) < 0.05) l.consumed = true;
      }
      const breakBody = Math.abs(c.close - c.open);
      const breakDisplaced = breakBody >= (meanBodies[i] || breakBody) * 0.9;
      structureEvents.push({
        type: mssBear || prevTrend === 'BULL' ? 'MSS' : 'BOS',
        side: 'BEAR',
        level: bearBreakLevel,
        startTime: bearBreakTime,
        endTime: c.time,
        displaced: breakDisplaced,
        color: '#ef4444'
      });

      // Search back for unbroken Origin Order Block within the break leg (last opposing up candle meeting minObThick)
      const obMinIdx = Math.max(0, Math.min(i - 1, originSearchFrom - 2));
      for (let offset = 1; offset <= obSearchBars && i - offset >= obMinIdx; offset++) {
        const originIdx = i - offset;
        const candidate = safeCandles[originIdx];
        if (candidate.close > candidate.open) {
          const bodyTop = Math.max(candidate.open, candidate.close);
          const bodyBot = Math.min(candidate.open, candidate.close);
          const fullThick = candidate.high - candidate.low;
          if (fullThick < minObThick) continue;
          const useBodyRange = obUseBody && (bodyTop - bodyBot) >= minObThick;
          const top = useBodyRange ? bodyTop : candidate.high;
          const bot = useBodyRange ? bodyBot : candidate.low;
          // Reject OB if already invalidated (closed above top) between origin and break bar
          let preBroken = false;
          for (let mid = originIdx + 1; mid <= i; mid++) {
            if (safeCandles[mid].close > top) { preBroken = true; break; }
          }
          if (preBroken) continue;
          const dupOb = obList.find(z => !z.mitigated && z.side === 'SELL' && Math.abs(z.bot - bot) < 0.25 && Math.abs(z.top - top) < 0.25);
          if (!dupOb) {
            obList.push({
              side: 'SELL',
              top,
              bot,
              ce: (top + bot) / 2,
              startTime: candidate.time,
              originIndex: originIdx,
              formedIndex: i,
              label: '-OB',
              color: '#ef4444',
              tested: false,
              mitigated: false,
              ceTouched: false,
              touchCount: 0,
              firstTouchTime: null,
              lastTouchTime: null,
              touches: [],
              _inTouch: false,
              lifecycle: 'FRESH'
            });
          }
          break;
        }
      }
    }

    // Displacement & FVG check (3 strictly contiguous candles + ATR thickness filter + dedupe)
    if (i >= 2) {
      const prev2 = safeCandles[i - 2];
      const prev1 = safeCandles[i - 1];
      const contiguous3 = isContiguousPair(prev2, prev1) && isContiguousPair(prev1, c);

      if (contiguous3) {
        const b = Math.abs(prev1.close - prev1.open);
        const bRange = Math.max(prev1.high - prev1.low, 0.01);
        const bRatio = b / bRange;
        const mBody = meanBodies[i - 1] || b;

        const dispBull = prev1.close > prev1.open && b >= mBody * 0.9 && bRatio >= 0.45;
        const dispBear = prev1.close < prev1.open && b >= mBody * 0.9 && bRatio >= 0.45;

        const bullGap = c.low - prev2.high;
        if (dispBull && bullGap >= minFvgThick) {
          const dupFvg = fvgList.find(z => !z.mitigated && z.side === 'BUY' && Math.abs(z.bot - prev2.high) < 0.25 && Math.abs(z.top - c.low) < 0.25);
          if (!dupFvg) {
            fvgList.push({
              side: 'BUY',
              top: c.low,
              bot: prev2.high,
              ce: (c.low + prev2.high) / 2,
              startTime: prev2.time,
              formedIndex: i,
              color: '#22c55e',
              tested: false,
              mitigated: false,
              ceTouched: false,
              touchCount: 0,
              firstTouchTime: null,
              lastTouchTime: null,
              touches: [],
              _inTouch: false,
              lifecycle: 'FRESH'
            });
          }
        }

        const bearGap = prev2.low - c.high;
        if (dispBear && bearGap >= minFvgThick) {
          const dupFvg = fvgList.find(z => !z.mitigated && z.side === 'SELL' && Math.abs(z.bot - c.high) < 0.25 && Math.abs(z.top - prev2.low) < 0.25);
          if (!dupFvg) {
            fvgList.push({
              side: 'SELL',
              top: prev2.low,
              bot: c.high,
              ce: (prev2.low + c.high) / 2,
              startTime: prev2.time,
              formedIndex: i,
              color: '#ef4444',
              tested: false,
              mitigated: false,
              ceTouched: false,
              touchCount: 0,
              firstTouchTime: null,
              lastTouchTime: null,
              touches: [],
              _inTouch: false,
              lifecycle: 'FRESH'
            });
          }
        }
      }
    }

    // Track distinct touch episodes, 50% CE taps, and mitigation breaks on every FVG & OB
    const updateZoneTouches = zone => {
      if (zone.mitigated || i <= zone.formedIndex) return;
      const isBuy = zone.side === 'BUY';
      const overlapsZone = c.low <= zone.top && c.high >= zone.bot;
      const hitCe = isBuy ? (c.low <= zone.ce) : (c.high >= zone.ce);
      const brokeZone = isBuy ? (c.close < zone.bot) : (c.close > zone.top);

      if (overlapsZone) {
        zone.tested = true;
        if (hitCe) zone.ceTouched = true;
        const touchPrice = isBuy
          ? Math.max(zone.bot, Math.min(zone.top, c.low))
          : Math.min(zone.top, Math.max(zone.bot, c.high));

        if (!zone._inTouch) {
          zone._inTouch = true;
          zone.touchCount += 1;
          if (!zone.firstTouchTime) zone.firstTouchTime = c.time;
          zone.lastTouchTime = c.time;
          zone.touches.push({
            index: zone.touchCount,
            time: c.time,
            barIndex: i,
            price: Number(touchPrice.toFixed(2)),
            hitCe,
            broken: brokeZone
          });
        } else if (zone.touches.length) {
          // Same continuous visit: upgrade CE/break flags without inflating touchCount
          const curTouch = zone.touches[zone.touches.length - 1];
          if (hitCe && !curTouch.hitCe) {
            curTouch.hitCe = true;
            curTouch.price = Number(zone.ce.toFixed(2));
          }
          if (brokeZone) curTouch.broken = true;
          zone.lastTouchTime = c.time;
        }
        if (!brokeZone) zone.lifecycle = 'TESTED';
      } else {
        zone._inTouch = false;
      }

      if (brokeZone) {
        zone.mitigated = true;
        zone.endTime = c.time;
        zone.brokenAt = c.time;
        zone.lifecycle = 'BROKEN';
        const lastT = zone.touches[zone.touches.length - 1];
        if (!lastT || lastT.time !== c.time) {
          zone.touches.push({
            index: zone.touchCount + (overlapsZone ? 0 : 1),
            time: c.time,
            barIndex: i,
            price: Number((isBuy ? zone.bot : zone.top).toFixed(2)),
            hitCe: true,
            broken: true
          });
        }
      }
    };

    for (const fvg of fvgList) updateZoneTouches(fvg);
    for (const ob of obList) updateZoneTouches(ob);
  }

  // Fallback to context M15 bias only if causal loop remained NEUTRAL
  if (trend === 'NEUTRAL' && tf === 'M15') {
    const ctxBias = context?.m15?.structure || context?.m15?.control || context?.amy?.dashboard?.biasDir;
    if (String(ctxBias).toUpperCase().includes('BULL') || ctxBias === 1) trend = 'BULL';
    else if (String(ctxBias).toUpperCase().includes('BEAR') || ctxBias === -1) trend = 'BEAR';
  }

  // Trend Invalidation line — strictly anchored to Protected Structural Swing (never internal pullback pivot)
  let trendInvalidation = null;
  let trendInvalidationText = '';
  let trendInvalidationColor = '#ef4444';
  let trendInvalidationTime = null;

  if (trend === 'BULL') {
    const invLevel = Number.isFinite(protectedLow)
      ? protectedLow
      : (Number.isFinite(lastLow) ? lastLow : (Number(context?.amy?.dashboard?.protectedLow) || Number(context?.m15?.invalidLevel) || Number(context?.amy?.dashboard?.invalidLevel)));
    if (Number.isFinite(invLevel) && invLevel > 0) {
      trendInvalidation = invLevel;
      trendInvalidationText = `BULL INVALID < ${invLevel.toFixed(2)}`;
      trendInvalidationColor = '#ef4444';
      trendInvalidationTime = protectedLowTime || lastLowTime || safeCandles.at(-1)?.time;
    }
  } else if (trend === 'BEAR') {
    const invLevel = Number.isFinite(protectedHigh)
      ? protectedHigh
      : (Number.isFinite(lastHigh) ? lastHigh : (Number(context?.amy?.dashboard?.protectedHigh) || Number(context?.h1?.swingHigh)));
    if (Number.isFinite(invLevel) && invLevel > 0) {
      trendInvalidation = invLevel;
      trendInvalidationText = `BEAR INVALID > ${invLevel.toFixed(2)}`;
      trendInvalidationColor = '#f97316';
      trendInvalidationTime = protectedHighTime || lastHighTime || safeCandles.at(-1)?.time;
    }
  }

  // Structural Dealing Range (active BOS leg when valid, else 80-bar pdHigh/pdLow fallback)
  const structuralRangeHigh = (Number.isFinite(legHigh) && Number.isFinite(legLow) && legHigh > legLow)
    ? legHigh
    : pdHigh;
  const structuralRangeLow = (Number.isFinite(legHigh) && Number.isFinite(legLow) && legHigh > legLow)
    ? legLow
    : pdLow;
  const structuralEq = (Number.isFinite(structuralRangeHigh) && Number.isFinite(structuralRangeLow) && structuralRangeHigh > structuralRangeLow)
    ? (structuralRangeHigh + structuralRangeLow) / 2
    : pdEq;

  const atr14 = barAtrs.at(-1) || 5.0;

  // Batas Ekspansi ala AMY ICT V6.1
  let expansion = null;
  if (trend === 'BULL' && Number.isFinite(lastHigh) && Number.isFinite(lastLow)) {
    const legRange = Math.max(lastHigh - lastLow, atr14 * 1.5);
    const expNorm = lastHigh + legRange * 1.0;
    const expMax = lastHigh + legRange * 2.5;
    expansion = {
      trend: 'BULL',
      expNorm,
      expMax,
      normLabel: '🎯 TARGET NAIK (NORMAL)',
      maxLabel: '🛑 BATAS NAIK (HABIS)',
      startTime: lastHighTime
    };
  } else if (trend === 'BEAR' && Number.isFinite(lastHigh) && Number.isFinite(lastLow)) {
    const legRange = Math.max(lastHigh - lastLow, atr14 * 1.5);
    const expNorm = lastLow - legRange * 1.0;
    const expMax = lastLow - legRange * 2.5;
    expansion = {
      trend: 'BEAR',
      expNorm,
      expMax,
      normLabel: '🎯 TARGET TURUN (NORMAL)',
      maxLabel: '🛑 BATAS TURUN (HABIS)',
      startTime: lastLowTime
    };
  }

  // Inducement (IDM V6.1): lookback 2 bars internal minor swing
  let idm = null;
  if (safeCandles.length >= 5) {
    const recent = safeCandles.slice(-15);
    if (trend === 'BULL') {
      let minLow = Infinity;
      let minLowTime = null;
      for (let idx = 1; idx < recent.length - 1; idx++) {
        if (recent[idx].low < recent[idx - 1].low && recent[idx].low < recent[idx + 1].low) {
          minLow = recent[idx].low;
          minLowTime = recent[idx].time;
        }
      }
      if (Number.isFinite(minLow) && minLow < Infinity) {
        const lastBar = safeCandles[safeCandles.length - 1];
        const swept = lastBar.low < minLow;
        idm = { level: minLow, time: minLowTime, swept, side: 'BUY' };
      }
    } else if (trend === 'BEAR') {
      let maxHigh = -Infinity;
      let maxHighTime = null;
      for (let idx = 1; idx < recent.length - 1; idx++) {
        if (recent[idx].high > recent[idx - 1].high && recent[idx].high > recent[idx + 1].high) {
          maxHigh = recent[idx].high;
          maxHighTime = recent[idx].time;
        }
      }
      if (Number.isFinite(maxHigh) && maxHigh > -Infinity) {
        const lastBar = safeCandles[safeCandles.length - 1];
        const swept = lastBar.high > maxHigh;
        idm = { level: maxHigh, time: maxHighTime, swept, side: 'SELL' };
      }
    }
  }

  // TradingView Parity: Active POI selection (unbroken only for active entry; expose touched/broken history separately)
  const curP = safeCandles.at(-1)?.close || 3940;
  const lastBarTime = safeCandles.at(-1)?.time || 0;
  const stripInternal = (z, kind) => {
    const { _inTouch, ...rest } = z;
    return { ...rest, kind: rest.kind || kind };
  };
  const cleanObs = obList.map(z => stripInternal(z, 'OB'));
  const cleanFvgs = fvgList.map(z => stripInternal(z, 'FVG'));

  const isActivePoi = z => !z.mitigated;
  const viableObs = cleanObs.filter(isActivePoi);
  const nearestBullOb = viableObs.filter(o => o.side === 'BUY' && o.top <= curP + atr14 * 1.5).sort((a, b) => b.top - a.top)[0];
  const nearestBearOb = viableObs.filter(o => o.side === 'SELL' && o.bot >= curP - atr14 * 1.5).sort((a, b) => a.bot - b.bot)[0];
  const activeObs = [nearestBullOb, nearestBearOb].filter(Boolean);

  const viableFvgs = cleanFvgs.filter(isActivePoi);
  const nearestBullFvg = viableFvgs.filter(f => f.side === 'BUY' && f.top <= curP + atr14 * 1.5).sort((a, b) => b.top - a.top)[0];
  const nearestBearFvg = viableFvgs.filter(f => f.side === 'SELL' && f.bot >= curP - atr14 * 1.5).sort((a, b) => a.bot - b.bot)[0];
  const activeFvgs = [nearestBullFvg, nearestBearFvg].filter(Boolean);

  // Recent history pools (for Mapping History backfill & Chart Gold touch-history visualization)
  const historyLookbackSec = expectedInterval * 120; // ~30h on M15, ~10h on M5
  const historyObs = cleanObs.filter(z => (z.lastTouchTime || z.startTime || 0) >= lastBarTime - historyLookbackSec).slice(-12);
  const historyFvgs = cleanFvgs.filter(z => (z.lastTouchTime || z.startTime || 0) >= lastBarTime - historyLookbackSec).slice(-12);
  const recentBroken = [...cleanObs, ...cleanFvgs]
    .filter(z => z.mitigated && z.endTime && z.endTime >= lastBarTime - expectedInterval * 24)
    .sort((a, b) => (b.endTime || 0) - (a.endTime || 0))
    .slice(0, 2);

  // Unified Directed Draw on Liquidity (DOL) from unconsumed pools strictly ahead of price
  const dedupePools = list => list.filter((x, idx) => list.findIndex(y => Math.abs(y.level - x.level) < 0.08) === idx);
  const poolsAbove = dedupePools([
    ...bslLines.filter(l => !l.consumed && l.level > curP).map(l => ({ name: 'BSL Swing', level: l.level })),
    ...(Number.isFinite(asiaHigh) && !asiaHighConsumed && asiaHigh > curP ? [{ name: 'Asia High', level: asiaHigh }] : []),
    ...(Number.isFinite(pdh) && !pdhConsumed && pdh > curP ? [{ name: 'PDH', level: pdh }] : []),
    ...(Number.isFinite(pwh) && !pwhConsumed && pwh > curP ? [{ name: 'PWH', level: pwh }] : []),
    ...(Number.isFinite(pdHigh) && pdHigh > curP ? [{ name: 'Range High', level: pdHigh }] : [])
  ]).sort((a, b) => a.level - b.level);

  const poolsBelow = dedupePools([
    ...sslLines.filter(l => !l.consumed && l.level < curP).map(l => ({ name: 'SSL Swing', level: l.level })),
    ...(Number.isFinite(asiaLow) && !asiaLowConsumed && asiaLow < curP ? [{ name: 'Asia Low', level: asiaLow }] : []),
    ...(Number.isFinite(pdl) && !pdlConsumed && pdl < curP ? [{ name: 'PDL', level: pdl }] : []),
    ...(Number.isFinite(pwl) && !pwlConsumed && pwl < curP ? [{ name: 'PWL', level: pwl }] : []),
    ...(Number.isFinite(pdLow) && pdLow < curP ? [{ name: 'Range Low', level: pdLow }] : [])
  ]).sort((a, b) => b.level - a.level);

  // Validate sweeps: if any subsequent candle closes beyond the swept level (or opposite BOS occurs), mark sweep as broken
  const sortedSweeps = [...sweeps]
    .sort((a, b) => (a.time || 0) - (b.time || 0))
    .map(sw => {
      const isBuySw = sw.reactionSide === 'BUY' || sw.type?.includes('SSL') || sw.type?.includes('LOW') || sw.type?.includes('PDL') || sw.type?.includes('PWL');
      let broken = false;
      for (let idx = safeCandles.length - 1; idx >= 0; idx--) {
        const bar = safeCandles[idx];
        if (bar.time <= (sw.time || 0)) break;
        if (isBuySw && Number.isFinite(sw.level) && bar.close < sw.level - 0.15) {
          broken = true;
          break;
        }
        if (!isBuySw && Number.isFinite(sw.level) && bar.close > sw.level + 0.15) {
          broken = true;
          break;
        }
      }
      if (!broken && structureEvents.length) {
        const laterOppositeBreak = structureEvents.some(ev =>
          (ev.endTime || 0) > (sw.time || 0) &&
          ((isBuySw && ev.side === 'BEAR') || (!isBuySw && ev.side === 'BULL'))
        );
        if (laterOppositeBreak) broken = true;
      }
      return { ...sw, broken };
    });

  const latestSweepRaw = sortedSweeps.at(-1) || null;
  const latestValidSweep = [...sortedSweeps].reverse().find(sw => !sw.broken) || null;
  const latestSweep = latestValidSweep || latestSweepRaw;
  const sweepIsFresh = Boolean(latestValidSweep && lastBarTime - latestValidSweep.time <= expectedInterval * 8);
  const sweepReactionDir = latestValidSweep
    ? (latestValidSweep.reactionSide === 'BUY' || latestValidSweep.type?.includes('SSL') || latestValidSweep.type?.includes('LOW') || latestValidSweep.type?.includes('PDL') || latestValidSweep.type?.includes('PWL') ? 1 : -1)
    : 0;
  const dolDir = sweepIsFresh ? sweepReactionDir : (trend === 'BULL' ? 1 : trend === 'BEAR' ? -1 : 0);
  const dolCandidate = dolDir === 1 ? poolsAbove[0] : dolDir === -1 ? poolsBelow[0] : null;
  const dol = dolCandidate ? {
    dir: dolDir,
    side: dolDir === 1 ? 'BUY' : 'SELL',
    level: dolCandidate.level,
    name: dolCandidate.name,
    distance: Math.abs(dolCandidate.level - curP),
    status: 'ACTIVE',
    poolsAbove: poolsAbove.slice(0, 4),
    poolsBelow: poolsBelow.slice(0, 4)
  } : {
    dir: dolDir,
    side: dolDir === 1 ? 'BUY' : dolDir === -1 ? 'SELL' : null,
    level: null,
    name: null,
    distance: null,
    status: 'NONE',
    poolsAbove: poolsAbove.slice(0, 4),
    poolsBelow: poolsBelow.slice(0, 4)
  };

  // Active BOS Leg & OTE (61.8% – 78.6% retracement) for precision scalper POI scoring
  const activeLegHigh = trend === 'BEAR' && Number.isFinite(protectedHigh)
    ? protectedHigh
    : (Number.isFinite(legHigh) ? legHigh : structuralRangeHigh);
  const activeLegLow = trend === 'BULL' && Number.isFinite(protectedLow)
    ? protectedLow
    : (Number.isFinite(legLow) ? legLow : structuralRangeLow);
  let activeLeg = null;
  if (Number.isFinite(activeLegHigh) && Number.isFinite(activeLegLow) && activeLegHigh > activeLegLow) {
    const legSpan = activeLegHigh - activeLegLow;
    const eq = (activeLegHigh + activeLegLow) / 2;
    const oteLow = trend === 'BEAR' ? activeLegLow + legSpan * 0.618 : activeLegHigh - legSpan * 0.786;
    const oteHigh = trend === 'BEAR' ? activeLegLow + legSpan * 0.786 : activeLegHigh - legSpan * 0.618;
    activeLeg = {
      trend,
      high: activeLegHigh,
      low: activeLegLow,
      eq,
      oteLow: Math.min(oteLow, oteHigh),
      oteHigh: Math.max(oteLow, oteHigh)
    };
  }

  return {
    tf: options.tf || 'M15',
    keyLevels: {
      pdh,
      pdl,
      pdhConsumed,
      pdlConsumed,
      pwh,
      pwl,
      pwhConsumed,
      pwlConsumed,
      asiaHigh,
      asiaLow,
      asiaStart,
      asiaEnd,
      asiaHighConsumed,
      asiaLowConsumed,
      pdEq: structuralEq,
      pdHigh: structuralRangeHigh,
      pdLow: structuralRangeLow,
      lookbackHigh: pdHigh,
      lookbackLow: pdLow,
      protectedHigh,
      protectedLow,
      trendInvalidation,
      trendInvalidationText,
      trendInvalidationColor,
      trend
    },
    dealingRange: Number.isFinite(structuralRangeHigh) && Number.isFinite(structuralRangeLow) && structuralRangeHigh > structuralRangeLow ? {
      rangeHigh: structuralRangeHigh,
      rangeLow: structuralRangeLow,
      eq: structuralEq
    } : null,
    activeLeg,
    liquidity: {
      bsl: bslLines.filter(l => !l.consumed).slice(-2),
      ssl: sslLines.filter(l => !l.consumed).slice(-2),
      sweeps: sortedSweeps.slice(-8),
      latestSweep: latestSweep ? { ...latestSweep, fresh: sweepIsFresh && !latestSweep.broken, reactionDir: latestSweep.broken ? 0 : sweepReactionDir } : null
    },
    dol,
    structure: {
      events: structureEvents.slice(-options.structureHistory || -5),
      lastEvent: structureEvents.at(-1) || null,
      trend,
      protectedHigh,
      protectedLow,
      invalidation: trendInvalidation ? {
        level: trendInvalidation,
        text: trendInvalidationText,
        color: trendInvalidationColor,
        time: trendInvalidationTime
      } : null
    },
    poi: {
      fvg: activeFvgs.length ? activeFvgs : viableFvgs.slice(-2),
      ob: activeObs.length ? activeObs : viableObs.slice(-2),
      historyFvg: historyFvgs,
      historyOb: historyObs,
      recentBroken
    },
    expansion,
    idm
  };
}
