// Precision XAU/USD OHLC pattern synthesizer for Guided Practice 100 Cases.
// Guarantees mathematically accurate ICT structures (FVG, Sweep, BOS/MSS/CISD, OB, Breaker/Unicorn, Range, SL/TP)
// plus 8 realistic post-decision outcome candles (`afterCandles`).

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function r2(n) {
  return Math.round(n * 100) / 100;
}

function makeBar(time, open, close, wickUp, wickDown) {
  const o = r2(open);
  const c = r2(close);
  const hi = r2(Math.max(o, c) + Math.max(0.05, wickUp));
  const lo = r2(Math.min(o, c) - Math.max(0.05, wickDown));
  return { time, open: o, high: hi, low: lo, close: c };
}

function buildSteps(startTime, stepSec, startPrice, deltas, rand, wickScale = 0.7) {
  const bars = [];
  let prev = startPrice;
  for (let i = 0; i < deltas.length; i++) {
    const d = deltas[i];
    const open = prev;
    const close = r2(open + d);
    const wu = (0.25 + rand() * 1.15) * wickScale;
    const wd = (0.25 + rand() * 1.15) * wickScale;
    bars.push(makeBar(startTime + i * stepSec, open, close, wu, wd));
    prev = close;
  }
  return bars;
}

function tfStepSec(tf) {
  if (tf === 'M5') return 300;
  if (tf === 'H1') return 3600;
  return 900; // M15 default
}

function sessionBaseTimestamp(caseIdx, sessionHint) {
  // Anchored in Feb–Mar 2026 trading weekdays (UTC), aligned to London/NY/Asia clocks
  const baseDay = 1770076800; // 2026-02-03 00:00:00 UTC (Tuesday)
  const dayOffset = (caseIdx % 18) * 86400;
  let hourUtc = 13; // NY Open default
  if (sessionHint === 'asia') hourUtc = 2;
  else if (sessionHint === 'london') hourUtc = 7;
  else if (sessionHint === 'ny-am') hourUtc = 13;
  else if (sessionHint === 'ny-pm') hourUtc = 18;
  else if (sessionHint === 'dead') hourUtc = 11;
  return baseDay + dayOffset + hourUtc * 3600;
}

function baseGoldPrice(caseIdx) {
  // Varied realistic XAU/USD price clusters ($2,640 – $3,480) so charts feel fresh
  const anchors = [2648, 2714, 2786, 2842, 2918, 2975, 3044, 3112, 3190, 3265, 3340, 3425];
  return anchors[caseIdx % anchors.length] + ((caseIdx * 7) % 19) * 0.5;
}

export function synthesizeChartForCase(spec, caseIdx) {
  const rand = mulberry32(20261122 + caseIdx * 7919);
  const stepSec = tfStepSec(spec.timeframe || 'M15');
  const startTime = sessionBaseTimestamp(caseIdx, spec.session || 'ny-am');
  const p0 = baseGoldPrice(caseIdx);
  const kind = spec.patternKind;
  const dir = spec.direction || 'bullish'; // bullish | bearish
  const s = dir === 'bullish' ? 1 : -1;

  // Helper to attach timestamps cleanly across 24 before + 8 after bars
  const tAt = (i) => startTime + i * stepSec;

  // 1) FVG VALID (Sweep -> Displacement FVG -> Pullback to 50% CE -> After: Expansion to TP)
  if (kind === 'fvg-valid') {
    const bars = [];
    // Bars 0..10: range with clear SSL (bull) or BSL (bear) near p0 - 4*s
    const pool = r2(p0 - 4.2 * s);
    let cur = p0;
    const prePath = [
      -1.2, -1.5, -1.1, 1.8, 1.4, -1.6, -1.4, 1.2, 1.5, -1.8, -1.1
    ];
    for (let i = 0; i < 11; i++) {
      const next = r2(cur + prePath[i] * s);
      const b = makeBar(tAt(i), cur, next, 0.55 + rand() * 0.5, 0.55 + rand() * 0.5);
      // Keep lows above pool (for bull) or highs below pool (for bear)
      if (s === 1) {
        b.low = r2(Math.max(b.low, pool + 0.15));
        if (i === 2 || i === 6) b.low = r2(pool + 0.08);
      } else {
        b.high = r2(Math.min(b.high, pool - 0.15));
        if (i === 2 || i === 6) b.high = r2(pool - 0.08);
      }
      bars.push(b);
      cur = b.close;
    }
    // Bar 11: Sharp Sweep wick beyond pool, closes back inside
    const sweepOpen = cur;
    const sweepClose = r2(pool + 1.2 * s);
    const b11 = {
      time: tAt(11),
      open: sweepOpen,
      close: sweepClose,
      high: s === 1 ? r2(Math.max(sweepOpen, sweepClose) + 0.6) : r2(pool + 2.6),
      low: s === 1 ? r2(pool - 2.6) : r2(Math.min(sweepOpen, sweepClose) - 0.6)
    };
    bars.push(b11);
    cur = sweepClose;

    // Bars 12..14: Strong 3-candle displacement forming crisp FVG (a=12, b=13, c=14)
    const b12 = makeBar(tAt(12), cur, cur + 1.8 * s, 0.35, 0.35);
    bars.push(b12);
    cur = b12.close;
    const b13 = makeBar(tAt(13), cur, cur + 6.4 * s, 0.35, 0.35);
    bars.push(b13);
    cur = b13.close;
    const b14 = makeBar(tAt(14), cur, cur + 2.8 * s, 0.45, 0.3);
    // Guarantee clean mathematical FVG gap between b12 and b14
    if (s === 1 && b14.low <= b12.high + 2.2) {
      b14.low = r2(b12.high + 3.4);
      b14.open = r2(Math.max(b14.open, b14.low + 0.3));
      b14.close = r2(Math.max(b14.close, b14.open + 1.6));
      b14.high = r2(Math.max(b14.high, b14.close + 0.5));
    } else if (s === -1 && b14.high >= b12.low - 2.2) {
      b14.high = r2(b12.low - 3.4);
      b14.open = r2(Math.min(b14.open, b14.high - 0.3));
      b14.close = r2(Math.min(b14.close, b14.open - 1.6));
      b14.low = r2(Math.min(b14.low, b14.close - 0.5));
    }
    bars.push(b14);
    cur = b14.close;

    const gapLow = s === 1 ? b12.high : b14.high;
    const gapHigh = s === 1 ? b14.low : b12.low;
    const ce = r2((gapLow + gapHigh) / 2);

    // Bars 15..23: Gradual controlled pullback right into FVG 50% CE at bar 23
    const peak = r2(cur + 1.8 * s);
    const b15 = makeBar(tAt(15), cur, peak, 0.6, 0.4);
    bars.push(b15);
    cur = b15.close;
    const stepsBack = 8;
    for (let k = 0; k < stepsBack; k++) {
      const idx = 16 + k;
      const frac = (k + 1) / stepsBack;
      const target = r2(peak + (ce - peak) * frac + (k < 6 ? (rand() - 0.5) * 0.6 : 0));
      const b = makeBar(tAt(idx), cur, target, 0.45, 0.45);
      // On bar 23 (Decision Point), tap CE cleanly and leave small rejection wick
      if (idx === 23) {
        b.close = r2(ce + 0.45 * s);
        if (s === 1) b.low = r2(ce - 0.35);
        else b.high = r2(ce + 0.35);
      }
      bars.push(b);
      cur = b.close;
    }

    // After candles (24..31): Clean expansion away from FVG toward opposing liquidity
    const after = buildSteps(
      tAt(24), stepSec, cur,
      [2.1 * s, 2.8 * s, -0.7 * s, 3.2 * s, 2.4 * s, -0.5 * s, 2.9 * s, 1.8 * s],
      rand, 0.65
    );

    return {
      candles: bars,
      afterCandles: after,
      levels: [
        { price: r2(gapLow), title: s === 1 ? 'FVG Low (BISI)' : 'FVG Low (SIBI)', color: '#38bdf8' },
        { price: ce, title: '50% CE FVG', color: '#facc15' },
        { price: r2(gapHigh), title: s === 1 ? 'FVG High (BISI)' : 'FVG High (SIBI)', color: '#38bdf8' },
        { price: pool, title: s === 1 ? 'SSL Disapu' : 'BSL Disapu', color: '#f59e0b' }
      ],
      markers: [
        { time: b11.time, position: s === 1 ? 'belowBar' : 'aboveBar', color: '#f59e0b', shape: s === 1 ? 'arrowUp' : 'arrowDown', text: s === 1 ? 'SSL Sweep' : 'BSL Sweep' },
        { time: bars[23].time, position: s === 1 ? 'belowBar' : 'aboveBar', color: '#38bdf8', shape: 'circle', text: 'Titik Uji' }
      ],
      evidence: { pattern: 'fvg', direction: dir, a: 12, b: 13, c: 14 },
      outcomeNote: spec.outcomeNote || (s === 1
        ? 'Harga memantul presisi dari 50% CE FVG bullish pasca-sweep SSL dan melesat naik ke likuiditas atas.'
        : 'Harga ditolak presisi di 50% CE FVG bearish pasca-sweep BSL dan melanjutkan distribusi turun.')
    };
  }

  // 2) FVG INDUCEMENT / DECOY (Equal Lows/Highs resting beneath/above mid-range FVG, NO sweep -> After: FVG fails & sweeps EQL/EQH!)
  if (kind === 'fvg-inducement') {
    const bars = [];
    const eql = r2(p0 - 4.8 * s);
    let cur = p0;
    // Bars 0..11: Sideways consolidation creating clean Equal Lows (bull trap) or Equal Highs (bear trap) with NO sweep!
    const pre = [-1.8, -1.6, 2.2, 1.5, -2.0, -1.7, 2.1, 1.4, -1.9, -1.6, 1.2, 0.8];
    for (let i = 0; i < 12; i++) {
      const next = r2(cur + pre[i] * s);
      const b = makeBar(tAt(i), cur, next, 0.5, 0.5);
      if (s === 1) {
        if (i === 1 || i === 5 || i === 9) b.low = eql;
        else b.low = r2(Math.max(b.low, eql + 0.35));
      } else {
        if (i === 1 || i === 5 || i === 9) b.high = eql;
        else b.high = r2(Math.min(b.high, eql - 0.35));
      }
      bars.push(b);
      cur = b.close;
    }

    // Bars 12..14: Shiny decoy FVG right in the middle of consolidation (above untouched EQL / below untouched EQH)
    const b12 = makeBar(tAt(12), cur, cur + 1.2 * s, 0.3, 0.3);
    bars.push(b12);
    cur = b12.close;
    const b13 = makeBar(tAt(13), cur, cur + 4.8 * s, 0.3, 0.3);
    bars.push(b13);
    cur = b13.close;
    const b14 = makeBar(tAt(14), cur, cur + 1.6 * s, 0.4, 0.25);
    if (s === 1 && b14.low <= b12.high + 1.8) {
      b14.low = r2(b12.high + 2.6);
      b14.open = r2(b14.low + 0.25);
      b14.close = r2(b14.open + 1.4);
      b14.high = r2(b14.close + 0.45);
    } else if (s === -1 && b14.high >= b12.low - 1.8) {
      b14.high = r2(b12.low - 2.6);
      b14.open = r2(b14.high - 0.25);
      b14.close = r2(b14.open - 1.4);
      b14.low = r2(b14.close - 0.45);
    }
    bars.push(b14);
    cur = b14.close;

    const gapLow = s === 1 ? b12.high : b14.high;
    const gapHigh = s === 1 ? b14.low : b12.low;
    const ce = r2((gapLow + gapHigh) / 2);

    // Bars 15..23: Slow drift back into decoy FVG right at Decision Point
    const topRef = cur;
    for (let k = 0; k < 9; k++) {
      const idx = 15 + k;
      const frac = (k + 1) / 9;
      const target = r2(topRef + (ce - topRef) * frac + (k < 7 ? (rand() - 0.5) * 0.5 : 0));
      const b = makeBar(tAt(idx), cur, target, 0.4, 0.4);
      bars.push(b);
      cur = b.close;
    }

    // After candles (24..31): Decoy FVG FAILS violently, sweeps untouched EQL/EQH, THEN reverses!
    const distToPool = eql - cur;
    const after = buildSteps(
      tAt(24), stepSec, cur,
      [
        0.7 * s,               // tiny bait bounce
        distToPool * 0.45,     // starts slicing through FVG
        distToPool * 0.55,     // breaks FVG cleanly
        -2.4 * s,              // sweeps right through EQL/EQH!
        3.1 * s,               // real smart money reversal AFTER sweep
        2.9 * s,
        2.5 * s,
        2.2 * s
      ],
      rand, 0.6
    );

    return {
      candles: bars,
      afterCandles: after,
      levels: [
        { price: r2(gapLow), title: 'FVG Tengah (Inducement)', color: '#fb7185' },
        { price: r2(gapHigh), title: 'Batas Atas FVG', color: '#38bdf8' },
        { price: eql, title: s === 1 ? 'Equal Lows (SSL Utuh)' : 'Equal Highs (BSL Utuh)', color: '#f59e0b' }
      ],
      markers: [
        { time: bars[5].time, position: s === 1 ? 'belowBar' : 'aboveBar', color: '#f59e0b', shape: s === 1 ? 'arrowUp' : 'arrowDown', text: s === 1 ? 'EQL Utuh' : 'EQH Utuh' },
        { time: bars[23].time, position: s === 1 ? 'aboveBar' : 'belowBar', color: '#38bdf8', shape: 'circle', text: 'Titik Uji' }
      ],
      evidence: { pattern: 'fvg', direction: dir, a: 12, b: 13, c: 14 },
      outcomeNote: spec.outcomeNote || (s === 1
        ? 'FVG jebakan dijebol turun hingga menyapu Equal Lows (SSL), baru setelah likuiditas bersih harga berbalik naik.'
        : 'FVG jebakan ditembus naik untuk menyapu Equal Highs (BSL), baru setelah itu harga jatuh tajam.')
    };
  }

  // 3) INVERSION FVG (IFVG): Opposing FVG invalidated by strong body close -> retest -> continuation
  if (kind === 'ifvg') {
    const bars = [];
    let cur = p0;
    // Bars 0..7: Initial leg in opposing direction (-s)
    const pre = [-1.2, -1.5, 0.6, -1.4, -1.8, 0.7, -1.1, -0.9].map(v => v * s);
    for (let i = 0; i < 8; i++) {
      const b = makeBar(tAt(i), cur, cur + pre[i], 0.45, 0.45);
      bars.push(b);
      cur = b.close;
    }
    // Bars 8..10: Opposing FVG (a=8, b=9, c=10) in direction (-s)
    const b8 = makeBar(tAt(8), cur, cur - 1.1 * s, 0.3, 0.3);
    bars.push(b8);
    cur = b8.close;
    const b9 = makeBar(tAt(9), cur, cur - 4.8 * s, 0.3, 0.3);
    bars.push(b9);
    cur = b9.close;
    const b10 = makeBar(tAt(10), cur, cur - 1.8 * s, 0.3, 0.4);
    if (s === 1 && b10.high >= b8.low - 1.8) {
      b10.high = r2(b8.low - 2.6);
      b10.open = r2(b10.high - 0.25);
      b10.close = r2(b10.open - 1.4);
      b10.low = r2(b10.close - 0.45);
    } else if (s === -1 && b10.low <= b8.high + 1.8) {
      b10.low = r2(b8.high + 2.6);
      b10.open = r2(b10.low + 0.25);
      b10.close = r2(b10.open + 1.4);
      b10.high = r2(b10.close + 0.45);
    }
    bars.push(b10);
    cur = b10.close;

    const gapLow = s === 1 ? b10.high : b8.high;
    const gapHigh = s === 1 ? b8.low : b10.low;
    const ce = r2((gapLow + gapHigh) / 2);

    // Bars 11..17: Sweep low/high then VIOLENT displacement breaking straight through the opposing FVG!
    const b11 = makeBar(tAt(11), cur, cur - 1.6 * s, 0.4, 0.9);
    bars.push(b11);
    cur = b11.close;
    const b12 = makeBar(tAt(12), cur, cur + 3.4 * s, 0.4, 0.4);
    bars.push(b12);
    cur = b12.close;
    const b13 = makeBar(tAt(13), cur, (s === 1 ? gapHigh + 2.4 : gapLow - 2.4), 0.45, 0.35);
    bars.push(b13);
    cur = b13.close;
    const b14 = makeBar(tAt(14), cur, cur + 1.8 * s, 0.5, 0.4);
    bars.push(b14);
    cur = b14.close;

    // Bars 15..23: Retest back into the now-Inverted FVG (IFVG)
    const highAfterBreak = cur;
    for (let k = 0; k < 9; k++) {
      const idx = 15 + k;
      const frac = (k + 1) / 9;
      const target = r2(highAfterBreak + (ce - highAfterBreak) * frac + (k < 7 ? (rand() - 0.5) * 0.55 : 0));
      const b = makeBar(tAt(idx), cur, target, 0.45, 0.45);
      if (idx === 23) b.close = r2(ce + 0.5 * s);
      bars.push(b);
      cur = b.close;
    }

    const after = buildSteps(
      tAt(24), stepSec, cur,
      [2.2 * s, 2.7 * s, -0.6 * s, 3.0 * s, 2.1 * s, 1.9 * s, -0.4 * s, 2.4 * s],
      rand, 0.6
    );

    return {
      candles: bars,
      afterCandles: after,
      levels: [
        { price: r2(gapLow), title: 'Batas Bawah IFVG', color: '#a78bfa' },
        { price: ce, title: '50% CE IFVG', color: '#facc15' },
        { price: r2(gapHigh), title: 'Batas Atas IFVG', color: '#a78bfa' }
      ],
      markers: [
        { time: b13.time, position: s === 1 ? 'aboveBar' : 'belowBar', color: '#22c55e', shape: s === 1 ? 'arrowUp' : 'arrowDown', text: 'FVG Dijebol' },
        { time: bars[23].time, position: s === 1 ? 'belowBar' : 'aboveBar', color: '#38bdf8', shape: 'circle', text: 'Retest IFVG' }
      ],
      evidence: { pattern: 'fvg', direction: s === 1 ? 'bearish' : 'bullish', a: 8, b: 9, c: 10, title: 'Inversion FVG (IFVG)' },
      outcomeNote: spec.outcomeNote || 'Zona FVG lama yang dijebol body close berubah fungsi menjadi Inversion FVG (IFVG) dan meluncurkan ekspansi kuat.'
    };
  }

  // 4) SWEEP & RECLAIM (Judas Swing / Turtle Soup / PDH-PDL / Asia High-Low Raid)
  if (kind === 'sweep-reclaim') {
    // dir = 'high' means sweep BSL high (bearish reversal); dir = 'low' means sweep SSL low (bullish reversal)
    const isHigh = dir === 'high' || dir === 'bearish';
    const dSign = isHigh ? 1 : -1;
    const pool = r2(p0 + 5.0 * dSign);
    const bars = [];
    let cur = p0;
    // Bars 0..19: Build clear horizontal liquidity pool (2-3 swing touches below pool if high, above if low)
    const wave = [1.4, 1.6, 1.5, -1.8, -1.6, 1.2, 1.9, 1.4, -2.0, -1.3, 1.1, 1.7, 1.5, -1.6, -1.1, 0.9, 1.3, 1.2, 0.8, 0.5];
    for (let i = 0; i < 20; i++) {
      let next = r2(cur + wave[i] * dSign);
      if (isHigh) next = Math.min(next, pool - 0.5);
      else next = Math.max(next, pool + 0.5);
      const b = makeBar(tAt(i), cur, next, 0.55, 0.55);
      if (isHigh) {
        if (i === 2 || i === 7 || i === 12) b.high = r2(pool - 0.05);
        else b.high = r2(Math.min(b.high, pool - 0.25));
      } else {
        if (i === 2 || i === 7 || i === 12) b.low = r2(pool + 0.05);
        else b.low = r2(Math.max(b.low, pool + 0.25));
      }
      bars.push(b);
      cur = b.close;
    }

    // Bar 20: Approach pool
    const b20 = makeBar(tAt(20), cur, r2(pool - 0.6 * dSign), 0.35, 0.35);
    bars.push(b20);
    cur = b20.close;

    // Bar 21: THE SWEEP CANDLE — long wick pierces pool by $3.2, closes cleanly back inside!
    const sweepClose = r2(pool - 1.5 * dSign);
    const b21 = {
      time: tAt(21),
      open: cur,
      close: sweepClose,
      high: isHigh ? r2(pool + 3.2) : r2(Math.max(cur, sweepClose) + 0.45),
      low: isHigh ? r2(Math.min(cur, sweepClose) - 0.45) : r2(pool - 3.2)
    };
    bars.push(b21);
    cur = b21.close;

    // Bars 22..23: Reclaim & displacement shift away from swept pool
    const b22 = makeBar(tAt(22), cur, cur - 2.4 * dSign, 0.45, 0.45);
    bars.push(b22);
    cur = b22.close;
    const b23 = makeBar(tAt(23), cur, cur - 1.2 * dSign, 0.45, 0.45);
    bars.push(b23);
    cur = b23.close;

    const after = buildSteps(
      tAt(24), stepSec, cur,
      [0.9 * dSign, -2.6 * dSign, -3.1 * dSign, 0.8 * dSign, -2.8 * dSign, -2.2 * dSign, -1.9 * dSign, -1.5 * dSign],
      rand, 0.6
    );

    return {
      candles: bars,
      afterCandles: after,
      levels: [
        { price: pool, title: isHigh ? 'BSL / Key High' : 'SSL / Key Low', color: isHigh ? '#38bdf8' : '#f59e0b' }
      ],
      markers: [
        { time: bars[7].time, position: isHigh ? 'aboveBar' : 'belowBar', color: '#f59e0b', shape: isHigh ? 'arrowDown' : 'arrowUp', text: isHigh ? 'BSL Pool' : 'SSL Pool' },
        { time: b21.time, position: isHigh ? 'aboveBar' : 'belowBar', color: '#ec4899', shape: isHigh ? 'arrowDown' : 'arrowUp', text: 'Wick Sweep' }
      ],
      evidence: { pattern: 'sweep', direction: isHigh ? 'high' : 'low', a: 7, c: 21 },
      outcomeNote: spec.outcomeNote || (isHigh
        ? 'Wick menyapu BSL dan gagal close di atasnya — Smart Money langsung membalikkan harga turun menuju likuiditas bawah.'
        : 'Wick menyapu SSL lalu close masuk kembali — likuiditas ritel terserap dan harga meluncur naik.')
    };
  }

  // 5) BOS VALID vs MSS/CISD (Clean body close beyond structural swing)
  if (kind === 'bos-valid' || kind === 'mss-cisd') {
    const isUp = dir === 'up' || dir === 'bullish';
    const dSign = isUp ? 1 : -1;
    const bars = [];
    let cur = p0;
    const swingLevel = r2(p0 + 3.6 * dSign);

    if (kind === 'bos-valid') {
      // Uptrend/Downtrend forms swing at bar 9, pulls back bars 10..17, then strong body-close BOS at bar 20!
      const pre = [1.0, 1.2, -0.7, 1.3, 1.1, -0.8, 1.1, 0.9, 0.6, -1.4, -1.6, -1.2, -0.9, 0.8, 1.1, 1.3, 1.2, 0.9, 1.1];
      for (let i = 0; i < 19; i++) {
        let next = r2(cur + pre[i] * dSign);
        if (i < 18) {
          if (isUp) next = Math.min(next, swingLevel - 0.35);
          else next = Math.max(next, swingLevel + 0.35);
        }
        const b = makeBar(tAt(i), cur, next, 0.45, 0.45);
        if (i === 8) {
          if (isUp) b.high = swingLevel;
          else b.low = swingLevel;
        }
        bars.push(b);
        cur = b.close;
      }
      // Bar 19: approach swing
      const b19 = makeBar(tAt(19), cur, r2(swingLevel - 0.5 * dSign), 0.3, 0.3);
      bars.push(b19);
      cur = b19.close;
      // Bar 20: Strong Displacement BODY CLOSE clearly beyond swingLevel!
      const b20 = makeBar(tAt(20), cur, r2(swingLevel + 3.8 * dSign), 0.5, 0.35);
      bars.push(b20);
      cur = b20.close;
      // Bars 21..23: Shallow healthy continuation pullback
      for (let k = 0; k < 3; k++) {
        const d = k === 0 ? 1.1 : (k === 1 ? -1.4 : -0.9);
        const b = makeBar(tAt(21 + k), cur, cur + d * dSign, 0.4, 0.4);
        bars.push(b);
        cur = b.close;
      }
      const after = buildSteps(
        tAt(24), stepSec, cur,
        [-0.6 * dSign, 2.2 * dSign, 2.9 * dSign, 2.1 * dSign, -0.7 * dSign, 2.6 * dSign, 2.3 * dSign, 1.8 * dSign],
        rand, 0.55
      );
      return {
        candles: bars,
        afterCandles: after,
        levels: [{ price: swingLevel, title: isUp ? 'Swing High (BOS)' : 'Swing Low (BOS)', color: isUp ? '#22c55e' : '#ef4444' }],
        markers: [
          { time: bars[8].time, position: isUp ? 'aboveBar' : 'belowBar', color: '#f59e0b', shape: isUp ? 'arrowDown' : 'arrowUp', text: 'Swing Kunci' },
          { time: b20.time, position: isUp ? 'aboveBar' : 'belowBar', color: isUp ? '#22c55e' : '#ef4444', shape: isUp ? 'arrowUp' : 'arrowDown', text: 'Body Close BOS' }
        ],
        evidence: { pattern: 'break', direction: isUp ? 'up' : 'down', a: 8, c: 20 },
        outcomeNote: spec.outcomeNote || 'Body close terkonfirmasi menembus swing struktur (BOS valid) — pullback ringan langsung dilanjutkan tren utama.'
      };
    } else {
      // MSS / CISD: Preceding trend in opposite (-dSign), sweeps extreme at bar 16, then strong reversal candle closes past delivery open & internal swing at bar 20!
      const pre = [-1.2, -1.5, 0.9, -1.6, -1.4, 1.1, -1.5, -1.3, 1.2, -1.8, -1.4, 1.5, -1.9, -1.5, -1.6, -1.8];
      for (let i = 0; i < 16; i++) {
        const b = makeBar(tAt(i), cur, cur + pre[i] * dSign, 0.45, 0.45);
        bars.push(b);
        cur = b.close;
      }
      const internalSwing = isUp
        ? r2(Math.max(bars[11].high, bars[12].open))
        : r2(Math.min(bars[11].low, bars[12].open));
      // Bar 16: Sweep climax wick
      const b16 = makeBar(tAt(16), cur, cur + 1.2 * dSign, isUp ? 0.4 : 2.5, isUp ? 2.5 : 0.4);
      bars.push(b16);
      cur = b16.close;
      // Bars 17..19: Strong shift candles
      const b17 = makeBar(tAt(17), cur, r2((cur + internalSwing) / 2), 0.4, 0.35);
      bars.push(b17);
      cur = b17.close;
      const b18 = makeBar(tAt(18), cur, r2(internalSwing - 0.35 * dSign), 0.35, 0.35);
      bars.push(b18);
      cur = b18.close;
      // Bar 19: CISD + MSS full body close beyond internalSwing!
      const b19 = makeBar(tAt(19), cur, r2(internalSwing + 3.2 * dSign), 0.5, 0.3);
      bars.push(b19);
      cur = b19.close;
      // Bars 20..23: Retrace to newly formed displacement zone
      for (let k = 0; k < 4; k++) {
        const d = k === 0 ? 1.0 : -1.1;
        const b = makeBar(tAt(20 + k), cur, cur + d * dSign, 0.4, 0.4);
        bars.push(b);
        cur = b.close;
      }
      const after = buildSteps(
        tAt(24), stepSec, cur,
        [2.3 * dSign, 2.8 * dSign, -0.6 * dSign, 3.1 * dSign, 2.5 * dSign, 2.2 * dSign, -0.5 * dSign, 2.4 * dSign],
        rand, 0.55
      );
      return {
        candles: bars,
        afterCandles: after,
        levels: [{ price: internalSwing, title: isUp ? 'MSS / CISD Bullish' : 'MSS / CISD Bearish', color: isUp ? '#22c55e' : '#ef4444' }],
        markers: [
          { time: bars[11].time, position: isUp ? 'aboveBar' : 'belowBar', color: '#f59e0b', shape: isUp ? 'arrowDown' : 'arrowUp', text: 'LH/HL Kunci' },
          { time: b19.time, position: isUp ? 'aboveBar' : 'belowBar', color: isUp ? '#22c55e' : '#ef4444', shape: isUp ? 'arrowUp' : 'arrowDown', text: 'CISD + MSS' }
        ],
        evidence: { pattern: 'break', direction: isUp ? 'up' : 'down', a: 11, c: 19 },
        outcomeNote: spec.outcomeNote || 'Perubahan State of Delivery (CISD) + body close MSS terkonfirmasi; pullback langsung memicu gelombang tren baru.'
      };
    }
  }

  // 6) ORDER BLOCK / BREAKER / UNICORN / BPR
  if (kind === 'ob-valid' || kind === 'ob-fake' || kind === 'breaker-unicorn') {
    const bars = [];
    let cur = p0;
    const isFake = kind === 'ob-fake';
    const isBreaker = kind === 'breaker-unicorn';

    // Bars 0..10: Setup structure
    const pre = [-1.1, -1.4, 0.9, -1.5, -1.2, 1.3, -1.6, -1.3, 1.1, -1.2, -1.0].map(v => v * s);
    for (let i = 0; i < 11; i++) {
      const b = makeBar(tAt(i), cur, cur + pre[i], 0.45, 0.45);
      bars.push(b);
      cur = b.close;
    }

    // Bar 11: The Order Block / Breaker candle (opposing body)
    const b11 = makeBar(tAt(11), cur, cur - 2.4 * s, 0.35, 0.55);
    bars.push(b11);
    cur = b11.close;

    const obTop = r2(Math.max(b11.open, b11.close));
    const obBot = r2(Math.min(b11.open, b11.close));
    const obMid = r2((obTop + obBot) / 2);

    if (isFake) {
      // Weak overlapping drift with NO displacement & NO FVG
      const weak = [0.9, -0.5, 1.0, -0.6, 0.8, -0.4, 0.7, -0.5, -0.7, -0.8, -0.9, -0.6].map(v => v * s);
      for (let k = 0; k < 12; k++) {
        const b = makeBar(tAt(12 + k), cur, cur + weak[k], 0.55, 0.55);
        bars.push(b);
        cur = b.close;
      }
      // After: Slices right through fake OB!
      const after = buildSteps(
        tAt(24), stepSec, cur,
        [0.4 * s, -2.4 * s, -3.1 * s, -2.2 * s, 0.6 * s, -2.5 * s, -1.9 * s, -1.6 * s],
        rand, 0.55
      );
      return {
        candles: bars,
        afterCandles: after,
        levels: [
          { price: obTop, title: 'Batas Atas OB Lemah', color: '#fb7185' },
          { price: obMid, title: '50% MT (Tanpa Displacement)', color: '#facc15' },
          { price: obBot, title: 'Batas Bawah OB Lemah', color: '#fb7185' }
        ],
        markers: [
          { time: b11.time, position: s === 1 ? 'belowBar' : 'aboveBar', color: '#fb7185', shape: 'circle', text: 'OB Tanpa FVG' },
          { time: bars[23].time, position: s === 1 ? 'aboveBar' : 'belowBar', color: '#38bdf8', shape: 'circle', text: 'Titik Uji' }
        ],
        evidence: { pattern: 'ob', direction: dir, startIdx: 11, topPrice: obTop, bottomPrice: obBot, midPrice: obMid, title: 'Fake OB (No Displacement)' },
        outcomeNote: spec.outcomeNote || 'Order Block tanpa displacement & tanpa FVG gagal menahan harga — seller/buyer langsung menembus zona tersebut.'
      };
    }

    // Valid OB or Breaker/Unicorn: Strong displacement + FVG right after bar 11!
    const b12 = makeBar(tAt(12), cur, cur + 5.6 * s, 0.35, 0.3);
    bars.push(b12);
    cur = b12.close;
    const b13 = makeBar(tAt(13), cur, cur + 3.4 * s, 0.45, 0.3);
    bars.push(b13);
    cur = b13.close;
    const b14 = makeBar(tAt(14), cur, cur + 1.8 * s, 0.5, 0.35);
    bars.push(b14);
    cur = b14.close;

    // Bars 15..23: Retrace cleanly into OB / Breaker 50% Mean Threshold
    const peak = cur;
    for (let k = 0; k < 9; k++) {
      const idx = 15 + k;
      const frac = (k + 1) / 9;
      const target = r2(peak + (obMid - peak) * frac + (k < 7 ? (rand() - 0.5) * 0.5 : 0));
      const b = makeBar(tAt(idx), cur, target, 0.4, 0.4);
      if (idx === 23) b.close = r2(obMid + 0.5 * s);
      bars.push(b);
      cur = b.close;
    }

    const after = buildSteps(
      tAt(24), stepSec, cur,
      [2.5 * s, 3.1 * s, -0.6 * s, 3.4 * s, 2.3 * s, -0.5 * s, 2.8 * s, 2.1 * s],
      rand, 0.55
    );

    const labelPrefix = isBreaker ? 'Unicorn (Breaker + FVG)' : (s === 1 ? 'Valid Bullish OB' : 'Valid Bearish OB');
    return {
      candles: bars,
      afterCandles: after,
      levels: [
        { price: obTop, title: isBreaker ? 'Breaker High' : 'OB Open/High', color: '#a78bfa' },
        { price: obMid, title: '50% Mean Threshold', color: '#facc15' },
        { price: obBot, title: isBreaker ? 'Breaker Low' : 'OB Low', color: '#a78bfa' }
      ],
      markers: [
        { time: b11.time, position: s === 1 ? 'belowBar' : 'aboveBar', color: '#a78bfa', shape: s === 1 ? 'arrowUp' : 'arrowDown', text: isBreaker ? 'Breaker' : 'Order Block' },
        { time: bars[23].time, position: s === 1 ? 'belowBar' : 'aboveBar', color: '#38bdf8', shape: 'circle', text: 'Tap 50% MT' }
      ],
      evidence: { pattern: 'ob', direction: dir, startIdx: 11, topPrice: obTop, bottomPrice: obBot, midPrice: obMid, title: labelPrefix },
      outcomeNote: spec.outcomeNote || `${labelPrefix} yang memicu displacement menahan harga presisi di 50% Mean Threshold dan melesat sesuai tren.`
    };
  }

  // 7) DEALING RANGE (Premium >50%, Dead Zone ~50%, Discount OTE <38%)
  if (kind === 'range') {
    const zoneTarget = spec.rangeZone || 'equilibrium'; // 'premium' | 'discount' | 'equilibrium'
    const lowPrice = r2(p0 - 8.0);
    const highPrice = r2(p0 + 8.0);
    const eqPrice = r2((lowPrice + highPrice) / 2);
    const bars = [];
    let cur = r2(lowPrice + 1.2);

    // Bars 0..10: Impulsive leg from Swing Low (bar 1) to Swing High (bar 10)
    const upLeg = [-0.9, 1.4, 1.8, 2.1, -0.6, 2.4, 2.2, -0.5, 2.5, 2.6, 1.8];
    for (let i = 0; i < 11; i++) {
      let next = r2(cur + upLeg[i]);
      if (i === 10) next = r2(highPrice - 0.3);
      const b = makeBar(tAt(i), cur, next, 0.45, 0.45);
      if (i === 0) b.low = lowPrice;
      if (i === 10) b.high = highPrice;
      bars.push(b);
      cur = b.close;
    }

    // Desired close at bar 23 based on zoneTarget
    let destPrice = eqPrice;
    if (zoneTarget === 'premium') destPrice = r2(lowPrice + (highPrice - lowPrice) * 0.78);
    else if (zoneTarget === 'discount') destPrice = r2(lowPrice + (highPrice - lowPrice) * 0.27); // OTE 73% retrace
    else destPrice = r2(eqPrice + 0.25);

    const startRetrace = cur;
    for (let k = 0; k < 13; k++) {
      const idx = 11 + k;
      const frac = (k + 1) / 13;
      const noise = k < 11 ? (rand() - 0.5) * 1.1 : 0;
      let target = r2(startRetrace + (destPrice - startRetrace) * frac + noise);
      target = Math.max(lowPrice + 0.8, Math.min(highPrice - 0.8, target));
      const b = makeBar(tAt(idx), cur, target, 0.5, 0.5);
      bars.push(b);
      cur = b.close;
    }

    let afterDeltas;
    if (zoneTarget === 'discount') {
      afterDeltas = [1.8, 2.6, 2.9, -0.7, 3.1, 2.4, 2.1, 1.9];
    } else if (zoneTarget === 'premium') {
      afterDeltas = [-1.6, -2.5, -2.8, 0.6, -2.9, -2.1, 1.8, 2.4]; // punishes premium buyers first!
    } else {
      afterDeltas = [1.4, -1.9, 1.6, -2.1, -1.8, 2.3, -1.5, 1.2]; // choppy dead zone whipsaw!
    }
    const after = buildSteps(tAt(24), stepSec, cur, afterDeltas, rand, 0.65);

    return {
      candles: bars,
      afterCandles: after,
      levels: [
        { price: lowPrice, title: 'Range Low (0%)', color: '#2dd4bf' },
        { price: eqPrice, title: 'Equilibrium 50%', color: '#facc15' },
        { price: highPrice, title: 'Range High (100%)', color: '#fb7185' }
      ],
      markers: [
        { time: bars[0].time, position: 'belowBar', color: '#2dd4bf', shape: 'arrowUp', text: 'Swing Low' },
        { time: bars[10].time, position: 'aboveBar', color: '#fb7185', shape: 'arrowDown', text: 'Swing High' },
        { time: bars[23].time, position: 'belowBar', color: '#38bdf8', shape: 'circle', text: 'Harga Kini' }
      ],
      evidence: { pattern: 'range', closeIndex: 23 },
      outcomeNote: spec.outcomeNote || (zoneTarget === 'discount'
        ? 'Harga masuk area Discount / OTE (< 50%), memberikan ruang RR besar menuju Swing High (ERL).'
        : zoneTarget === 'premium'
          ? 'Buyer yang masuk di Premium (> 50%) langsung terseret koreksi dalam ke zona diskon sebelum tren lanjut.'
          : 'Area Equilibrium 50% memicu gerak whipsaw dua arah yang menyapu SL buyer maupun seller.')
    };
  }

  // 8) RISK / SL INVALIDATION & RR (Long or Short with Entry, SL, TP levels)
  if (kind === 'risk') {
    const isLong = dir === 'bullish' || dir === 'long';
    const dSign = isLong ? 1 : -1;
    const rrGood = spec.rrGood !== false;
    const bars = [];
    let cur = p0;

    // Bars 0..15: Build structural swing extreme + impulse
    const pre = [-1.4, -1.7, -1.2, 1.1, 1.6, 2.4, 2.8, 1.9, -1.1, -1.4, -1.2, -0.8, 0.7, -0.9, -0.6, 0.5];
    for (let i = 0; i < 16; i++) {
      const b = makeBar(tAt(i), cur, cur + pre[i] * dSign, 0.5, 0.5);
      bars.push(b);
      cur = b.close;
    }
    const swingExtreme = isLong
      ? r2(Math.min(...bars.slice(0, 6).map(b => b.low)))
      : r2(Math.max(...bars.slice(0, 6).map(b => b.high)));

    // Bars 16..23: Retrace to entry level
    const entryPrice = r2(swingExtreme + 4.4 * dSign);
    const startMove = cur;
    for (let k = 0; k < 8; k++) {
      const idx = 16 + k;
      const frac = (k + 1) / 8;
      const target = r2(startMove + (entryPrice - startMove) * frac + (k < 6 ? (rand() - 0.5) * 0.5 : 0));
      const b = makeBar(tAt(idx), cur, target, 0.45, 0.45);
      if (idx === 23) {
        b.close = entryPrice;
        b.high = r2(Math.max(b.high, b.open, b.close));
        b.low = r2(Math.min(b.low, b.open, b.close));
      }
      bars.push(b);
      cur = b.close;
    }

    const stopPrice = r2(swingExtreme - 0.8 * dSign);
    const riskDist = Math.abs(entryPrice - stopPrice);
    const targetPrice = r2(entryPrice + (rrGood ? riskDist * 2.5 : riskDist * 0.75) * dSign);

    const after = rrGood
      ? buildSteps(
          tAt(24), stepSec, cur,
          [-1.5 * dSign, 1.8 * dSign, 2.8 * dSign, 3.1 * dSign, -0.7 * dSign, 3.2 * dSign, 2.6 * dSign, 2.1 * dSign],
          rand, 0.55
        )
      : buildSteps(
          tAt(24), stepSec, cur,
          [1.6 * dSign, 1.2 * dSign, -2.4 * dSign, -2.8 * dSign, -2.2 * dSign, 0.9 * dSign, -1.9 * dSign, -1.5 * dSign],
          rand, 0.55
        );

    return {
      candles: bars,
      afterCandles: after,
      levels: [
        { price: entryPrice, title: 'Entry Zone', color: '#facc15' },
        { price: stopPrice, title: 'SL Invalidation + Buffer', color: '#ef4444' },
        { price: targetPrice, title: rrGood ? 'Target Likuiditas (+2.5R)' : 'Target Terdekat (<1R)', color: '#22c55e' }
      ],
      markers: [
        { time: bars[2].time, position: isLong ? 'belowBar' : 'aboveBar', color: '#ef4444', shape: isLong ? 'arrowUp' : 'arrowDown', text: 'Invalidation' },
        { time: bars[23].time, position: isLong ? 'belowBar' : 'aboveBar', color: '#facc15', shape: 'circle', text: 'Entry' }
      ],
      evidence: { pattern: 'risk', side: isLong ? 'long' : 'short' },
      outcomeNote: spec.outcomeNote || (rrGood
        ? 'Wick retest sempat turun menguji zona internal namun SL struktural + napas spread aman, lalu harga menyentuh TP +2.5R.'
        : 'Ruang target terlalu sempit dibanding risiko (< 1:1 RR); harga berbalik sebelum memberi hasil yang sepadan.')
    };
  }

  // 9) PSYCHOLOGY CONTEXT CHART (Relevant visual emotion trigger — e.g. SL clipped, Rocket FOMO candle, Floating TP)
  const psyType = spec.psyChart || 'fomo-rocket';
  const bars = [];
  let cur = p0;
  if (psyType === 'sl-clipped') {
    const seq = [0.8, 1.1, -0.7, 0.9, 1.2, -1.1, -1.5, -1.3, 0.8, 0.6, -1.2, -1.4, 0.9, 0.7, -1.0, -0.9, 0.6, 0.5, -0.8, -0.7, -0.9, -0.6, -0.8, 1.1];
    for (let i = 0; i < 24; i++) {
      const b = makeBar(tAt(i), cur, cur + seq[i], 0.45, 0.45);
      bars.push(b);
      cur = b.close;
    }
    const slLevel = r2(Math.min(bars[22].open, bars[22].close) - 0.15);
    bars[22].low = r2(Math.min(bars[22].low, slLevel - 0.65));
    const after = buildSteps(tAt(24), stepSec, cur, [-1.4, -1.8, 2.2, -1.6, 1.5, -1.9, 1.2, -1.1], rand, 0.6);
    return {
      candles: bars,
      afterCandles: after,
      levels: [{ price: slLevel, title: 'Level Stop Loss (-1R)', color: '#ef4444' }],
      markers: [{ time: bars[22].time, position: 'belowBar', color: '#ef4444', shape: 'arrowUp', text: 'SL Tersentuh' }],
      evidence: null,
      outcomeNote: spec.outcomeNote || 'Pasar bergerak whipsaw pasca-SL — trader yang langsung revenge entry justru terkena loss beruntun kedua.'
    };
  }
  if (psyType === 'floating-profit') {
    const entry = r2(p0 - 2.0);
    const seq = [-0.8, -0.7, -0.5, 1.1, 1.4, 0.8, -0.5, 1.5, 1.2, -0.4, 1.3, 0.9, 1.1, -0.6, 1.2, 0.8, -0.4, 1.1, 0.9, 0.7, -0.5, 0.8, 0.9, 0.6];
    for (let i = 0; i < 24; i++) {
      const b = makeBar(tAt(i), cur, cur + seq[i], 0.4, 0.4);
      bars.push(b);
      cur = b.close;
    }
    const tp1 = r2(bars[23].close);
    const after = buildSteps(tAt(24), stepSec, cur, [-1.8, -2.2, -1.9, 0.8, -2.4, -1.7, 0.6, -1.5], rand, 0.55);
    return {
      candles: bars,
      afterCandles: after,
      levels: [
        { price: entry, title: 'Entry Awal', color: '#facc15' },
        { price: tp1, title: 'Target Harian Tercapai (+2.5R)', color: '#22c55e' }
      ],
      markers: [{ time: bars[23].time, position: 'aboveBar', color: '#22c55e', shape: 'arrowDown', text: 'Target Tercapai' }],
      evidence: null,
      outcomeNote: spec.outcomeNote || 'Setelah sesi ekspansi penuh selesai, volatilitas membalik — trader yang menutup laptop menjaga profit tetap utuh.'
    };
  }
  // Default 'fomo-rocket': Missed impulsive move leaving trader behind
  const seq = [0.4, -0.5, 0.6, -0.4, 0.3, -0.5, 0.5, -0.3, 0.4, -0.4, 0.5, -0.2, 0.3, -0.4, 0.6, 0.8, 1.4, 2.3, 2.9, 2.6, 2.1, 1.9, 2.2, 1.7];
  for (let i = 0; i < 24; i++) {
    const b = makeBar(tAt(i), cur, cur + seq[i], 0.4, 0.4);
    bars.push(b);
    cur = b.close;
  }
  const after = buildSteps(tAt(24), stepSec, cur, [0.5, -2.8, -3.4, -2.6, 0.9, -2.5, -1.8, -1.2], rand, 0.55);
  return {
    candles: bars,
    afterCandles: after,
    levels: [{ price: r2(bars[15].open), title: 'Area Awal Ekspansi (Terlewat)', color: '#f59e0b' }],
    markers: [{ time: bars[23].time, position: 'aboveBar', color: '#fb7185', shape: 'arrowDown', text: 'Pucuk Ekspansi' }],
    evidence: null,
    outcomeNote: spec.outcomeNote || 'Mengejar candle di pucuk ekspansi langsung disambut koreksi dalam yang menyapu SL buyer FOMO.'
  };
}
