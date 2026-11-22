/* Amy FX Backtest Lab — Pro Ledger Analytics (word-boundary ICT setup classification, DST-aware sessions, Equity Curve & Drawdown). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(root);
  } else {
    var g = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : root);
    if (g) g.AmyPracticeAnalytics = factory(g);
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function (g) {
  'use strict';

  function round2(v) { return Math.round(Number(v || 0) * 100) / 100; }

  function classifySession(tradeTime) {
    if (g && g.AmyPracticeCore && typeof g.AmyPracticeCore.classifyIctSession === 'function') {
      return g.AmyPracticeCore.classifyIctSession(tradeTime);
    }
    if (!tradeTime) return 'Other';
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', hour: '2-digit', hour12: false
      }).formatToParts(new Date(Number(tradeTime) * 1000));
      var hourPart = parts.find(function (p) { return p.type === 'hour'; });
      var h = parseInt(hourPart ? hourPart.value : '0', 10);
      if (h === 24) h = 0;
      if (h >= 20 || h < 2) return 'Asia';
      if (h >= 2 && h < 7) return 'London';
      if (h >= 7 && h < 16) return 'New York';
      return 'Other';
    } catch (_) {
      return 'Other';
    }
  }

  // Word-boundary safe ICT setup classifier (prevents "coba"/"dobel"/"problem" matching "ob"!)
  function classifySetup(notes, reason, defaultSetup) {
    if (defaultSetup && String(defaultSetup).trim() && String(defaultSetup).trim() !== 'Auto') {
      return String(defaultSetup).trim();
    }
    var text = String((notes || '') + ' ' + (reason || '')).toLowerCase();
    if (/\b(ifvg|inversion\s*fvg)\b/.test(text)) return 'IFVG';
    if (/\b(turtle\s*soup|smr|smart\s*money\s*reversal)\b/.test(text)) return 'Turtle Soup';
    if (/\b(fvg|fair\s*value\s*gap|imbalance|bisi|sibi)\b/.test(text)) return 'FVG';
    if (/\b(ob|order\s*block|orderblock|breaker\s*block|breaker)\b/.test(text)) return 'Order Block';
    if (/\b(sweep|bsl|ssl|liquidity|inducement|idm|pdh|pdl)\b/.test(text)) return 'Liquidity Sweep';
    if (/\b(bos|mss|cisd|structure\s*break)\b/.test(text)) return 'BOS / MSS';
    return 'ICT General';
  }

  function resolveTradeR(t) {
    if (t.r != null && t.r !== '' && Number.isFinite(Number(t.r))) return Number(t.r);
    if (t.result === 'WIN') return (t.plannedR != null && Number.isFinite(Number(t.plannedR))) ? Number(t.plannedR) : 2;
    if (t.result === 'LOSS') return -1;
    return 0;
  }

  function resolveTradeUsd(t, defaultRiskUsd) {
    if (t.pnlUsd != null && t.pnlUsd !== '' && Number.isFinite(Number(t.pnlUsd))) return Number(t.pnlUsd);
    var r = resolveTradeR(t);
    var risk = (t.riskUsd != null && Number.isFinite(Number(t.riskUsd)) && Number(t.riskUsd) > 0)
      ? Number(t.riskUsd)
      : (Number(defaultRiskUsd) || 0);
    return risk > 0 ? round2(r * risk) : 0;
  }

  function computeStats(trades, options) {
    options = options || {};
    var initialBalanceUsd = Math.max(0, Number(options.initialBalanceUsd) || 0);
    var defaultRiskUsd = Math.max(0, Number(options.defaultRiskUsd) || 0);
    var list = Array.isArray(trades) ? trades.filter(Boolean) : [];

    var closed = list.filter(function (t) { return t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BE'; });
    var wins = closed.filter(function (t) { return t.result === 'WIN'; });
    var losses = closed.filter(function (t) { return t.result === 'LOSS'; });
    var breakevens = closed.filter(function (t) { return t.result === 'BE'; });
    var missed = list.filter(function (t) { return t.result === 'MISSED'; });
    var cancelled = list.filter(function (t) { return t.result === 'CANCELLED'; });
    var waits = list.filter(function (t) { return t.bias === 'WAIT' || t.result === 'WAIT'; });
    var open = list.filter(function (t) { return t.result === 'OPEN' && t.bias !== 'WAIT'; });

    var totalClosed = closed.length;
    var decidedCount = wins.length + losses.length;
    var winRate = decidedCount > 0 ? Math.round((wins.length / decidedCount) * 1000) / 10 : 0;

    var grossWinR = 0;
    var grossLossR = 0;
    var totalR = 0;
    var totalUsd = 0;
    var grossWinUsd = 0;
    var grossLossUsd = 0;

    var peakR = 0;
    var currentR = 0;
    var maxDrawdownR = 0;

    var peakEquityUsd = initialBalanceUsd;
    var currentEquityUsd = initialBalanceUsd;
    var maxDrawdownUsd = 0;

    var sortedClosed = closed.slice().sort(function (a, b) {
      return Number(a.closedAt || a.tradeTime || a.createdAt || 0) - Number(b.closedAt || b.tradeTime || b.createdAt || 0);
    });

    var equityCurve = [{
      index: 0,
      time: sortedClosed.length ? Number(sortedClosed[0].tradeTime || sortedClosed[0].createdAt || 0) : 0,
      cumR: 0,
      equityUsd: round2(initialBalanceUsd),
      ddR: 0,
      ddUsd: 0,
      label: 'Awal'
    }];

    var winStreak = 0;
    var lossStreak = 0;
    var maxWinStreak = 0;
    var maxLossStreak = 0;

    for (var i = 0; i < sortedClosed.length; i += 1) {
      var t = sortedClosed[i];
      var r = resolveTradeR(t);
      var usd = resolveTradeUsd(t, defaultRiskUsd);

      totalR += r;
      totalUsd += usd;
      if (r > 0) grossWinR += r;
      if (r < 0) grossLossR += Math.abs(r);
      if (usd > 0) grossWinUsd += usd;
      if (usd < 0) grossLossUsd += Math.abs(usd);

      if (t.result === 'WIN') {
        winStreak += 1;
        lossStreak = 0;
        if (winStreak > maxWinStreak) maxWinStreak = winStreak;
      } else if (t.result === 'LOSS') {
        lossStreak += 1;
        winStreak = 0;
        if (lossStreak > maxLossStreak) maxLossStreak = lossStreak;
      }

      currentR += r;
      if (currentR > peakR) peakR = currentR;
      var ddR = peakR - currentR;
      if (ddR > maxDrawdownR) maxDrawdownR = ddR;

      currentEquityUsd += usd;
      if (currentEquityUsd > peakEquityUsd) peakEquityUsd = currentEquityUsd;
      var ddUsd = peakEquityUsd - currentEquityUsd;
      if (ddUsd > maxDrawdownUsd) maxDrawdownUsd = ddUsd;

      equityCurve.push({
        index: i + 1,
        id: t.id,
        time: Number(t.closedAt || t.tradeTime || t.createdAt || 0),
        r: round2(r),
        pnlUsd: round2(usd),
        cumR: round2(currentR),
        equityUsd: round2(currentEquityUsd),
        ddR: round2(ddR),
        ddUsd: round2(ddUsd),
        result: t.result,
        bias: t.bias
      });
    }

    // Credit realized partial close PnL/R from still-OPEN positions immediately to account balance
    for (var p = 0; p < open.length; p += 1) {
      var openTrade = open[p];
      var partUsd = Number(openTrade.realizedUsd || 0);
      var partR = Number(openTrade.realizedR || 0);
      if (Number.isFinite(partUsd) && partUsd !== 0) {
        totalUsd += partUsd;
        currentEquityUsd += partUsd;
      }
      if (Number.isFinite(partR) && partR !== 0) {
        totalR += partR;
      }
    }

    var profitFactor = grossLossR > 0
      ? round2(grossWinR / grossLossR)
      : (grossWinR > 0 ? 99.99 : 0);

    var expectancyR = totalClosed > 0 ? round2(totalR / totalClosed) : 0;

    // Breakdown by ICT setup (only executed/actionable BUY/SELL trades, excluding WAIT)
    var setupMap = {};
    for (var j = 0; j < list.length; j += 1) {
      var trade = list[j];
      if (trade.bias === 'WAIT' || trade.result === 'WAIT') continue;
      var setup = classifySetup(trade.notes, trade.reason, trade.setupType);
      if (!setupMap[setup]) setupMap[setup] = { total: 0, wins: 0, losses: 0, be: 0, missed: 0, totalR: 0, totalUsd: 0 };
      setupMap[setup].total += 1;
      if (trade.result === 'WIN' || trade.result === 'LOSS' || trade.result === 'BE') {
        if (trade.result === 'WIN') setupMap[setup].wins += 1;
        else if (trade.result === 'LOSS') setupMap[setup].losses += 1;
        else setupMap[setup].be += 1;
        setupMap[setup].totalR += resolveTradeR(trade);
        setupMap[setup].totalUsd += resolveTradeUsd(trade, defaultRiskUsd);
      } else if (trade.result === 'MISSED') {
        setupMap[setup].missed += 1;
      }
    }

    var breakdownBySetup = Object.keys(setupMap).map(function (k) {
      var s = setupMap[k];
      var decided = s.wins + s.losses;
      return {
        setup: k,
        total: s.total,
        closed: decided + s.be,
        wins: s.wins,
        losses: s.losses,
        be: s.be,
        missed: s.missed,
        winRate: decided > 0 ? Math.round((s.wins / decided) * 100) : 0,
        totalR: round2(s.totalR),
        totalUsd: round2(s.totalUsd)
      };
    }).sort(function (a, b) { return b.totalR - a.totalR || b.total - a.total; });

    // Breakdown by DST-aware ICT session (executed BUY/SELL only)
    var sessionMap = {
      Asia: { wins: 0, losses: 0, be: 0, total: 0, totalR: 0, totalUsd: 0 },
      London: { wins: 0, losses: 0, be: 0, total: 0, totalR: 0, totalUsd: 0 },
      'New York': { wins: 0, losses: 0, be: 0, total: 0, totalR: 0, totalUsd: 0 },
      Other: { wins: 0, losses: 0, be: 0, total: 0, totalR: 0, totalUsd: 0 }
    };
    for (var k = 0; k < list.length; k += 1) {
      var tr = list[k];
      if (tr.bias === 'WAIT' || tr.result === 'WAIT') continue;
      var sess = tr.session || classifySession(tr.tradeTime);
      if (!sessionMap[sess]) sessionMap[sess] = { wins: 0, losses: 0, be: 0, total: 0, totalR: 0, totalUsd: 0 };
      sessionMap[sess].total += 1;
      if (tr.result === 'WIN' || tr.result === 'LOSS' || tr.result === 'BE') {
        if (tr.result === 'WIN') sessionMap[sess].wins += 1;
        else if (tr.result === 'LOSS') sessionMap[sess].losses += 1;
        else sessionMap[sess].be += 1;
        sessionMap[sess].totalR += resolveTradeR(tr);
        sessionMap[sess].totalUsd += resolveTradeUsd(tr, defaultRiskUsd);
      }
    }

    var breakdownBySession = Object.keys(sessionMap).map(function (k) {
      var s = sessionMap[k];
      var decided = s.wins + s.losses;
      return {
        session: k,
        total: s.total,
        closed: decided + s.be,
        wins: s.wins,
        losses: s.losses,
        be: s.be,
        winRate: decided > 0 ? Math.round((s.wins / decided) * 100) : 0,
        totalR: round2(s.totalR),
        totalUsd: round2(s.totalUsd)
      };
    });

    return {
      totalTrades: list.length,
      closedTrades: totalClosed,
      wins: wins.length,
      losses: losses.length,
      breakevens: breakevens.length,
      missed: missed.length,
      cancelled: cancelled.length,
      waits: waits.length,
      open: open.length,
      winRate: winRate,
      expectancyR: expectancyR,
      profitFactor: profitFactor,
      maxDrawdownR: round2(maxDrawdownR),
      maxDrawdownUsd: round2(maxDrawdownUsd),
      totalRealizedR: round2(totalR),
      totalRealizedUsd: round2(totalUsd),
      currentBalanceUsd: round2(currentEquityUsd),
      grossWinUsd: round2(grossWinUsd),
      grossLossUsd: round2(grossLossUsd),
      maxWinStreak: maxWinStreak,
      maxLossStreak: maxLossStreak,
      equityCurve: equityCurve,
      breakdownBySetup: breakdownBySetup,
      breakdownBySession: breakdownBySession
    };
  }

  return {
    classifySession: classifySession,
    classifySetup: classifySetup,
    computeStats: computeStats
  };
});
