/**
 * Amy FX Pro — Kompas Makro XAU/USD Pure Logic Engine
 * ===================================================
 * Zero-DOM UMD module computing honest, real-data-grounded macro bias for Gold (XAU/USD).
 *
 * Anti-Hallucination Principles:
 * 1. Real quotes first: DXY (DX-Y.NYB), US 10Y Yield (^TNX in bps), VIX (^VIX), Silver (SI=F).
 * 2. Unreleased calendar forecasts NEVER fake a directional macro bias — they only trigger
 *    honest event countdown / News Lock awareness.
 * 3. Only validated released `actual` values score calendar impact.
 * 4. Technical alignment reads Mapping Cockpit H1/M15 bias & Dealing Range honestly; when Macro
 *    and Technical disagree, reports `KONFLIK` instead of forcing a false consensus.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.AmyKompasEngine = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }

  function parseEventNumber(str) {
    if (str == null) return null;
    const raw = String(str).trim();
    if (!raw || raw === '—' || raw === '--' || raw === 'N/A') return null;
    const m = raw.match(/^([+-]?\d+(?:[.,]\d+)?)\s*([%KkMmBb]?)$/);
    if (!m) {
      const loose = raw.match(/([+-]?\d+(?:\.\d+)?)/);
      return loose ? parseFloat(loose[1]) : null;
    }
    const base = parseFloat(m[1].replace(',', '.'));
    if (!Number.isFinite(base)) return null;
    const unit = m[2].toUpperCase();
    if (unit === 'K') return base * 1e3;
    if (unit === 'M') return base * 1e6;
    if (unit === 'B') return base * 1e9;
    return base;
  }

  function isInverseUsdEvent(title) {
    const t = String(title || '').toLowerCase();
    return t.includes('unemployment claims') ||
      t.includes('jobless claims') ||
      t.includes('continuing claims') ||
      t.includes('unemployment rate');
  }

  function evaluateReleasedEvent(ev, nowMs) {
    if (!ev) return null;
    if (Number.isFinite(nowMs) && ev.date) {
      const evMs = Date.parse(ev.date);
      if (Number.isFinite(evMs) && evMs > nowMs + 60 * 1000) return null;
    }
    const aVal = parseEventNumber(ev.actual);
    if (aVal === null) return null;
    const fVal = parseEventNumber(ev.forecast);
    const pVal = parseEventNumber(ev.previous);
    const refVal = fVal !== null ? fVal : pVal;
    const refLabel = fVal !== null ? ev.forecast : (pVal !== null ? ev.previous : null);
    if (refVal === null) {
      return { direction: 0, label: 'Rilis', summary: `${ev.title} rilis ${ev.actual}.` };
    }
    const inverse = isInverseUsdEvent(ev.title);
    const diff = aVal - refVal;
    const eps = Math.max(Math.abs(refVal) * 0.002, 0.0001);
    if (Math.abs(diff) <= eps) {
      return {
        direction: 0,
        label: 'Sesuai Konsensus',
        summary: `${ev.title} rilis ${ev.actual} sesuai perkiraan (${refLabel}).`
      };
    }
    const usdStronger = inverse ? diff < 0 : diff > 0;
    if (usdStronger) {
      return {
        direction: -1,
        label: 'Tekan Gold',
        summary: `${ev.title} rilis ${ev.actual} vs ${refLabel} — menopang USD & menekan Gold.`
      };
    }
    return {
      direction: 1,
      label: 'Dukung Gold',
      summary: `${ev.title} rilis ${ev.actual} vs ${refLabel} — melemahkan USD & mendukung Gold.`
    };
  }

  function classifyImpactScore(ev) {
    const imp = String(ev?.impact || '').toLowerCase();
    const t = String(ev?.title || '').toLowerCase();
    let s = imp === 'high' ? 60 : (imp === 'medium' ? 30 : 10);
    if (/non-farm|nonfarm|payrolls|core pce|cpi|fomc|federal funds rate/i.test(t)) s += 50;
    else if (/prelim gdp|advance gdp|final gdp|gdp q\/q|ppi|retail sales|unemployment rate|powell/i.test(t)) s += 35;
    else if (/unemployment claims|jobless|ism|pmi|adp|jolts|durable goods|consumer/i.test(t)) s += 20;
    return s;
  }

  function evaluateDxyFactor(q) {
    if (!q || !Number.isFinite(num(q.price))) {
      return {
        key: 'dxy',
        label: 'DXY',
        available: false,
        priceText: '—',
        deltaText: 'Offline',
        direction: 0,
        weight: 0,
        goldImpact: 'Data Offline',
        tone: 'neutral',
        sparkline: []
      };
    }
    const pct = num(q.changePct) || 0;
    let direction = 0;
    let goldImpact = 'Netral';
    let tone = 'neutral';
    if (pct <= -0.15) {
      direction = 1;
      goldImpact = 'Dukung Gold';
      tone = 'bull';
    } else if (pct >= 0.15) {
      direction = -1;
      goldImpact = 'Tekan Gold';
      tone = 'bear';
    }
    const sign = pct > 0 ? '+' : '';
    return {
      key: 'dxy',
      label: 'DXY',
      available: true,
      price: q.price,
      changePct: pct,
      priceText: q.price.toFixed(2),
      deltaText: `${sign}${pct.toFixed(2)}%`,
      direction,
      weight: 35,
      goldImpact,
      tone,
      sparkline: Array.isArray(q.sparkline) ? q.sparkline : []
    };
  }

  function evaluateYieldFactor(q) {
    if (!q || !Number.isFinite(num(q.price))) {
      return {
        key: 'us10y',
        label: 'US 10Y',
        available: false,
        priceText: '—',
        deltaText: 'Offline',
        direction: 0,
        weight: 0,
        goldImpact: 'Data Offline',
        tone: 'neutral',
        sparkline: []
      };
    }
    const bps = Number.isFinite(num(q.changeBps))
      ? num(q.changeBps)
      : (Number.isFinite(num(q.prevClose)) ? Number(((q.price - q.prevClose) * 100).toFixed(1)) : 0);
    let direction = 0;
    let goldImpact = 'Netral';
    let tone = 'neutral';
    if (bps <= -3.0) {
      direction = 1;
      goldImpact = 'Dukung Gold';
      tone = 'bull';
    } else if (bps >= 3.0) {
      direction = -1;
      goldImpact = 'Tekan Gold';
      tone = 'bear';
    }
    const sign = bps > 0 ? '+' : '';
    return {
      key: 'us10y',
      label: 'US 10Y',
      available: true,
      price: q.price,
      changeBps: bps,
      priceText: `${q.price.toFixed(2)}%`,
      deltaText: `${sign}${bps.toFixed(1)} bps`,
      direction,
      weight: 30,
      goldImpact,
      tone,
      sparkline: Array.isArray(q.sparkline) ? q.sparkline : []
    };
  }

  function evaluateVixFactor(q) {
    if (!q || !Number.isFinite(num(q.price))) {
      return {
        key: 'vix',
        label: 'VIX',
        available: false,
        priceText: '—',
        deltaText: 'Offline',
        direction: 0,
        weight: 0,
        goldImpact: 'Data Offline',
        tone: 'neutral',
        sparkline: []
      };
    }
    const v = num(q.price);
    const pct = num(q.changePct) || 0;
    let direction = 0;
    let goldImpact = 'Normal';
    let tone = 'neutral';
    if (v >= 20 || pct >= 6) {
      direction = 1;
      goldImpact = 'Risk-Off · Haven';
      tone = 'bull';
    } else if (v <= 13.5 && pct <= -3) {
      direction = -0.5;
      goldImpact = 'Risk-On';
      tone = 'bear';
    }
    const sign = pct > 0 ? '+' : '';
    return {
      key: 'vix',
      label: 'VIX',
      available: true,
      price: v,
      changePct: pct,
      priceText: v.toFixed(2),
      deltaText: `${sign}${pct.toFixed(1)}%`,
      direction,
      weight: 15,
      goldImpact,
      tone,
      sparkline: Array.isArray(q.sparkline) ? q.sparkline : []
    };
  }

  function evaluateMetalsSmt(goldQuote, silverQuote, spotPrice) {
    const gPrice = Number.isFinite(num(spotPrice)) && num(spotPrice) > 0
      ? num(spotPrice)
      : (goldQuote && Number.isFinite(num(goldQuote.price)) ? num(goldQuote.price) : NaN);
    const gPct = goldQuote && Number.isFinite(num(goldQuote.changePct)) ? num(goldQuote.changePct) : NaN;
    const sPrice = silverQuote && Number.isFinite(num(silverQuote.price)) ? num(silverQuote.price) : NaN;
    const sPct = silverQuote && Number.isFinite(num(silverQuote.changePct)) ? num(silverQuote.changePct) : NaN;

    if (!Number.isFinite(gPrice) && !Number.isFinite(sPrice)) {
      return {
        key: 'metals',
        label: 'XAU / XAG',
        available: false,
        priceText: '—',
        deltaText: 'Offline',
        direction: 0,
        weight: 0,
        goldImpact: 'Data Offline',
        tone: 'neutral',
        sparkline: []
      };
    }

    let goldImpact = 'Searah';
    let tone = 'neutral';
    let direction = 0;
    if (Number.isFinite(gPct) && Number.isFinite(sPct)) {
      const sameDir = (gPct >= 0.1 && sPct >= 0.1) || (gPct <= -0.1 && sPct <= -0.1);
      const divergent = (gPct >= 0.1 && sPct <= -0.5) || (gPct <= -0.1 && sPct >= 0.5);
      if (divergent) {
        goldImpact = 'SMT Divergen';
        tone = 'warn';
      } else if (gPct >= 0.25 && sPct >= 0.25) {
        goldImpact = 'Logam Kompak Naik';
        tone = 'bull';
        direction = 0.5;
      } else if (gPct <= -0.25 && sPct <= -0.25) {
        goldImpact = 'Logam Kompak Turun';
        tone = 'bear';
        direction = -0.5;
      } else if (sameDir) {
        goldImpact = 'Logam Searah';
      } else {
        goldImpact = 'Datar';
      }
    }

    const gSign = Number.isFinite(gPct) && gPct > 0 ? '+' : '';
    const sSign = Number.isFinite(sPct) && sPct > 0 ? '+' : '';
    return {
      key: 'metals',
      label: 'XAU / XAG',
      available: true,
      goldPrice: gPrice,
      silverPrice: sPrice,
      goldPct: gPct,
      silverPct: sPct,
      priceText: Number.isFinite(gPrice) ? `$${gPrice.toFixed(1)}` : '—',
      deltaText: Number.isFinite(gPct) && Number.isFinite(sPct)
        ? `Au ${gSign}${gPct.toFixed(2)}% · Ag ${sSign}${sPct.toFixed(2)}%`
        : (Number.isFinite(gPct) ? `${gSign}${gPct.toFixed(2)}%` : 'Live Spot'),
      direction,
      weight: Number.isFinite(gPct) && Number.isFinite(sPct) ? 10 : 0,
      goldImpact,
      tone,
      sparkline: Array.isArray(goldQuote?.sparkline) ? goldQuote.sparkline : []
    };
  }

  function extractTechnicalBias(liveCtx) {
    const m15Struct = String(liveCtx?.m15?.structure || '').toUpperCase();
    const m15Ctrl = String(liveCtx?.m15?.control || '').toUpperCase();
    const h1Bias = String(liveCtx?.h1?.bias || '').toUpperCase();
    const biasDir = liveCtx?.amy?.dashboard?.biasDir;

    let m15Dir = 0;
    if (m15Struct.includes('BEAR') || m15Ctrl.includes('SELLER') || biasDir === -1) m15Dir = -1;
    else if (m15Struct.includes('BULL') || m15Ctrl.includes('BUYER') || biasDir === 1) m15Dir = 1;

    let h1Dir = 0;
    if (h1Bias.includes('BEAR')) h1Dir = -1;
    else if (h1Bias.includes('BULL')) h1Dir = 1;

    return {
      h1Label: h1Dir === 1 ? 'Bullish' : (h1Dir === -1 ? 'Bearish' : 'Netral'),
      m15Label: m15Dir === 1 ? 'Bullish' : (m15Dir === -1 ? 'Bearish' : 'Netral'),
      h1Dir,
      m15Dir,
      sessionLabel: liveCtx?.sessionDetail?.label || liveCtx?.session || 'Sesi Berjalan'
    };
  }

  /**
   * Main pure synthesizer for Kompas XAU/USD.
   * @param {object} input
   *   - macroQuotes: { dxy, us10y, vix, gold, silver } (from /api/macro-snapshot)
   *   - usdTodayEvents: array of today's USD events (NY date)
   *   - usdUpcomingEvents: array of upcoming USD events if today is empty
   *   - goldNews: array of Gold-relevant news items
   *   - liveCtx: Mapping Cockpit live context
   *   - bridge: computeMappingBridgeState(liveCtx)
   *   - nowMs: current timestamp in ms
   */
  function computeKompasState(input = {}) {
    const nowMs = Number.isFinite(input.nowMs) ? input.nowMs : Date.now();
    const quotes = input.macroQuotes || {};
    const usdToday = Array.isArray(input.usdTodayEvents) ? input.usdTodayEvents : [];
    const usdUpcoming = Array.isArray(input.usdUpcomingEvents) ? input.usdUpcomingEvents : [];
    const goldNews = Array.isArray(input.goldNews) ? input.goldNews : [];
    const liveCtx = input.liveCtx || null;
    const bridge = input.bridge || {};

    const dxy = evaluateDxyFactor(quotes.dxy);
    const us10y = evaluateYieldFactor(quotes.us10y);
    const vix = evaluateVixFactor(quotes.vix);
    const metals = evaluateMetalsSmt(quotes.gold, quotes.silver, bridge.livePrice ?? liveCtx?.price);
    const tech = extractTechnicalBias(liveCtx);

    // Filter today's meaningful USD events (High & Medium first)
    const importantToday = usdToday
      .filter(e => {
        const imp = String(e?.impact || '').toLowerCase();
        return imp === 'high' || imp === 'medium';
      })
      .sort((a, b) => (Date.parse(a.date) || 0) - (Date.parse(b.date) || 0));

    // Check imminent High-impact USD event (-15m to +90m window)
    const highToday = importantToday.filter(e => String(e?.impact || '').toLowerCase() === 'high');
    const releasedEvents = importantToday
      .map(ev => ({ ev, evalRes: evaluateReleasedEvent(ev, nowMs) }))
      .filter(x => x.evalRes !== null);

    let nextHighEvent = null;
    let nextHighDiffMin = null;
    for (const ev of highToday) {
      const ms = Date.parse(ev.date);
      if (!Number.isFinite(ms)) continue;
      const diffMin = Math.round((ms - nowMs) / 60000);
      if (diffMin >= -15 && (nextHighDiffMin === null || diffMin < nextHighDiffMin)) {
        nextHighEvent = ev;
        nextHighDiffMin = diffMin;
      }
    }

    const isNewsLockWindow = nextHighEvent !== null && nextHighDiffMin >= -15 && nextHighDiffMin <= 30;
    const isPreHighImpactToday = nextHighEvent !== null && nextHighDiffMin > 30 && nextHighDiffMin <= 14 * 60;

    // Calendar actual factor (ONLY scores when actual is truly released!)
    let calDirection = 0;
    let calWeight = 0;
    let primaryReleased = null;
    if (releasedEvents.length > 0) {
      const ranked = [...releasedEvents].sort((a, b) => classifyImpactScore(b.ev) - classifyImpactScore(a.ev));
      primaryReleased = ranked[0];
      calDirection = primaryReleased.evalRes.direction;
      calWeight = String(primaryReleased.ev.impact || '').toLowerCase() === 'high' ? 30 : 18;
    }

    // Weighted Macro Balance (-100 to +100) from REAL live factors only
    const scoredFactors = [dxy, us10y, vix, metals].filter(f => f.available && f.weight > 0);
    let weightedSum = 0;
    let totalWeight = 0;
    let bullCount = 0;
    let bearCount = 0;
    let neutralCount = 0;

    for (const f of scoredFactors) {
      weightedSum += f.direction * f.weight;
      totalWeight += f.weight;
      if (f.direction > 0) bullCount += 1;
      else if (f.direction < 0) bearCount += 1;
      else neutralCount += 1;
    }
    if (calWeight > 0) {
      weightedSum += calDirection * calWeight;
      totalWeight += calWeight;
      if (calDirection > 0) bullCount += 1;
      else if (calDirection < 0) bearCount += 1;
      else neutralCount += 1;
    }

    const activeFactorCount = scoredFactors.length + (calWeight > 0 ? 1 : 0);
    const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

    // Determine honest Macro Tone & Verdict
    let tone = 'neutral'; // bull | bear | neutral | lock
    let verdictTitle = 'Campuran · Selektif';
    let macroDir = 0;

    if (activeFactorCount === 0) {
      tone = 'neutral';
      verdictTitle = 'Data Makro Offline';
      macroDir = 0;
    } else if (isNewsLockWindow) {
      tone = 'lock';
      verdictTitle = `News Lock · ${nextHighEvent.title}`;
      macroDir = score >= 22 ? 1 : (score <= -22 ? -1 : 0);
    } else if (score >= 24) {
      tone = 'bull';
      verdictTitle = 'Condong Bullish Gold';
      macroDir = 1;
    } else if (score <= -24) {
      tone = 'bear';
      verdictTitle = 'Tekanan Bearish Gold';
      macroDir = -1;
    } else {
      tone = 'neutral';
      verdictTitle = isPreHighImpactToday ? 'Campuran · Menunggu Data AS' : 'Campuran · Sinyal Terbelah';
      macroDir = 0;
    }

    // Honest Macro vs Technical Alignment
    let alignmentLabel = 'Ikuti Teknikal Mapping';
    let alignmentTone = 'neutral';
    if (isNewsLockWindow) {
      alignmentLabel = 'Tahan Posisi (±15m Rilis)';
      alignmentTone = 'lock';
    } else if (macroDir !== 0 && tech.m15Dir !== 0) {
      if (macroDir === tech.m15Dir) {
        alignmentLabel = macroDir === 1 ? 'Selaras Bullish' : 'Selaras Bearish';
        alignmentTone = macroDir === 1 ? 'bull' : 'bear';
      } else {
        alignmentLabel = 'Bentrok Makro vs M15';
        alignmentTone = 'warn';
      }
    } else if (tech.m15Dir !== 0) {
      alignmentLabel = `Netral · M15 ${tech.m15Label}`;
      alignmentTone = 'neutral';
    }

    // Concise, factual 1–2 sentence executive brief (ZERO hallucinated fluff!)
    const facts = [];
    if (dxy.available) facts.push(`DXY ${dxy.priceText} (${dxy.deltaText})`);
    if (us10y.available) facts.push(`US10Y ${us10y.priceText} (${us10y.deltaText})`);
    if (vix.available) facts.push(`VIX ${vix.priceText}`);

    let summary = '';
    if (activeFactorCount === 0) {
      summary = 'Feed harga makro (DXY/US10Y/VIX) sedang offline. Gunakan struktur teknikal Mapping Cockpit dan jadwal kalender sebagai panduan utama.';
    } else if (isNewsLockWindow) {
      summary = `${nextHighEvent.title} berada di jendela rilis sensitif — hindari eksekusi saat spike awal. Kondisi pasar saat ini: ${facts.join(', ')}.`;
    } else if (primaryReleased) {
      summary = `${primaryReleased.evalRes.summary} Pasar live: ${facts.join(', ')}.`;
    } else {
      const driverDesc = bullCount > 0 && bearCount > 0
        ? `Sinyal makro tarik-menarik (${facts.join(', ')}).`
        : (macroDir === 1
          ? `Dorongan makro mendukung Gold (${facts.join(', ')}).`
          : (macroDir === -1
            ? `Tekanan makro memberatkan Gold (${facts.join(', ')}).`
            : `Pasar makro relatif tenang (${facts.join(', ')}).`));
      const nextNote = highToday.length > 0 && nextHighEvent
        ? ` Fokus utama sesi ini: ${highToday.slice(0, 2).map(e => e.title).join(' & ')}.`
        : (alignmentTone === 'warn'
          ? ` Struktur M15 masih ${tech.m15Label} — tunggu konfirmasi MSS sebelum melawan tren.`
          : '');
      summary = `${driverDesc}${nextNote}`.trim();
    }

    // Actionable 1-line execution discipline note for Mapping Bridge
    let bridgeNote = '';
    if (isNewsLockWindow) {
      bridgeNote = `Protokol News Lock aktif menjelang ${nextHighEvent.title}. Tunggu sapuan likuiditas selesai lalu validasi MSS M5.`;
    } else if (alignmentTone === 'bull') {
      bridgeNote = 'Makro dan M15 searah Bullish — fokus cari Buy di zona Diskon / Demand PD Array setelah sweep SSL.';
    } else if (alignmentTone === 'bear') {
      bridgeNote = bridge.isBearBreakdown
        ? 'Makro dan M15 searah Bearish (Breakdown) — jangan kejar Sell di dasar, tunggu pullback ke Supply terdekat.'
        : 'Makro dan M15 searah Bearish — fokus Sell on Rally di zona Premium / Supply setelah sweep BSL.';
    } else if (alignmentTone === 'warn') {
      bridgeNote = `Makro (${macroDir === 1 ? 'Bullish' : 'Bearish'}) berlawanan dengan M15 (${tech.m15Label}) — perkecil risiko atau tunggu MSS M5 menyamakan arah.`;
    } else if (highToday.length > 0 && nextHighEvent) {
      bridgeNote = `Menjelang rilis ${nextHighEvent.title}, hindari membuka posisi baru 15 menit sebelum rilis dan jaga SL di luar BSL/SSL.`;
    } else {
      bridgeNote = `Tidak ada kejutan makro dominan — ikuti sepenuhnya struktur ${tech.m15Label} M15 dan Dealing Range di Mapping.`;
    }

    // Pick display agenda (up to 4 important today, or 2 nearest upcoming USD High/Med)
    const displayEvents = importantToday.length > 0
      ? importantToday.slice(0, 4)
      : usdUpcoming
          .filter(e => {
            const imp = String(e?.impact || '').toLowerCase();
            return imp === 'high' || imp === 'medium';
          })
          .slice(0, 2);

    // Pick primary trigger event for concise 2-line If/Then playbook
    const triggerEvent = nextHighEvent ||
      highToday[0] ||
      importantToday.find(e => e.forecast || e.previous) ||
      displayEvents[0] ||
      null;

    let triggerPlaybook = null;
    if (triggerEvent && (triggerEvent.forecast || triggerEvent.previous)) {
      const refStr = triggerEvent.forecast || triggerEvent.previous;
      const inverse = isInverseUsdEvent(triggerEvent.title);
      const releasedCheck = evaluateReleasedEvent(triggerEvent, nowMs);
      triggerPlaybook = {
        title: triggerEvent.title,
        refStr,
        actual: triggerEvent.actual || '',
        isReleased: Boolean(releasedCheck),
        releasedDirection: releasedCheck ? releasedCheck.direction : 0,
        bullCondition: inverse ? `Actual > ${refStr}` : `Actual < ${refStr}`,
        bullEffect: 'USD melemah → dorongan BUY Gold',
        bearCondition: inverse ? `Actual < ${refStr}` : `Actual > ${refStr}`,
        bearEffect: 'USD menguat → tekanan SELL Gold'
      };
    }

    // Top 2 newest Gold-relevant headlines (deduplicated & clean)
    const topNews = goldNews
      .filter(n => n && n.text && n.text.length >= 16)
      .slice(0, 2);

    return {
      score,
      tone,
      verdictTitle,
      summary,
      activeFactorCount,
      counts: { bull: bullCount, bear: bearCount, neutral: neutralCount },
      factors: [dxy, us10y, vix, metals],
      tech,
      alignment: { label: alignmentLabel, tone: alignmentTone },
      isNewsLockWindow,
      nextHighEvent,
      nextHighDiffMin,
      displayEvents,
      isTodayAgenda: importantToday.length > 0,
      triggerPlaybook,
      bridgeNote,
      topNews
    };
  }

  return {
    computeKompasState,
    evaluateDxyFactor,
    evaluateYieldFactor,
    evaluateVixFactor,
    evaluateMetalsSmt,
    evaluateReleasedEvent,
    parseEventNumber,
    isInverseUsdEvent
  };
}));
