"use strict";

(function (root) {
  const DAY_MS = 86400000;

  const LEAK_RULES = [
    { key: "FOMO", re: /\bfomo\b|kejar harga|terburu[- ]?buru|takut ketinggalan/i },
    { key: "Overtrade", re: /over\s*trad|kebanyakan entry|terlalu sering entry/i },
    { key: "Revenge Trade", re: /revenge|balas dendam|emosi setelah loss/i },
    { key: "Entry Prematur", re: /entry cepat|terlalu cepat|prematur|belum konfirmasi|tanpa konfirmasi/i },
    { key: "Pelanggaran SL", re: /geser sl|lebar(?:kan)? sl|tanpa sl|hapus sl|tidak pakai sl/i },
    { key: "Fear / Cut Dini", re: /\bfear\b|takut loss|cut profit|tp cepat|ragu[- ]?ragu/i },
    { key: "Greed / Tidak TP", re: /\bgreed\b|serakah|tamak|tidak tp|lupa tp/i }
  ];

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[ch]));
  }

  function normalizeResult(res) {
    const s = String(res || "").trim().toUpperCase();
    if (s === "WIN" || s === "PROFIT") return "Win";
    if (s === "LOSS" || s === "RUGI") return "Loss";
    if (s === "BREAKEVEN" || s === "BREAK EVEN" || s === "BE") return "BE";
    return null;
  }

  function parseTimestamp(entry) {
    const candidates = [
      { val: entry?.actualEntryTime, hasTime: true },
      { val: entry?.entryTime, hasTime: true },
      { val: entry?.exitTime, hasTime: true },
      { val: entry?.analysisTime, hasTime: true },
      { val: entry?.date, hasTime: false },
      { val: entry?.createdAt, hasTime: true },
      { val: entry?.updatedAt, hasTime: true },
      { val: entry?.timestamp, hasTime: true }
    ];

    let dateOnlyMs = null;
    for (const item of candidates) {
      if (item.val == null || item.val === "") continue;
      if (typeof item.val === "number" && Number.isFinite(item.val)) {
        const ms = item.val > 1e11 ? item.val : item.val * 1000;
        return { ms, hasTime: true, iso: new Date(ms).toISOString() };
      }
      const raw = String(item.val).trim();
      if (!raw) continue;
      const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
      if (isDateOnly) {
        const ms = Date.parse(raw + "T12:00:00Z");
        if (Number.isFinite(ms) && dateOnlyMs === null) {
          dateOnlyMs = ms;
        }
        continue;
      }
      const ms = Date.parse(raw);
      if (Number.isFinite(ms)) {
        return { ms, hasTime: item.hasTime || /[T ]\d{1,2}:\d{2}/.test(raw), iso: new Date(ms).toISOString() };
      }
    }

    if (dateOnlyMs !== null) {
      // If createdAt falls on the same calendar day, borrow its clock time for session inference
      const createdRaw = entry?.createdAt;
      const createdMs = createdRaw ? Date.parse(String(createdRaw)) : NaN;
      if (Number.isFinite(createdMs)) {
        const dateStr = new Date(dateOnlyMs).toISOString().slice(0, 10);
        const createdDateStr = new Date(createdMs).toISOString().slice(0, 10);
        if (dateStr === createdDateStr) {
          return { ms: createdMs, hasTime: true, iso: new Date(createdMs).toISOString() };
        }
      }
      return { ms: dateOnlyMs, hasTime: false, iso: new Date(dateOnlyMs).toISOString() };
    }

    return { ms: 0, hasTime: false, iso: "" };
  }

  function classifySession(entry, tsInfo) {
    const explicit = String(entry?.session || "").trim();
    const hintText = [explicit, entry?.title, entry?.evaluation].filter(Boolean).join(" ");
    if (/\bny\s*pm\b|new\s*york\s*pm|london\s*close/i.test(hintText)) return "NY PM";
    if (/\bny\s*am\b|new\s*york\s*am|silver\s*bullet|\bny\b|new\s*york/i.test(hintText)) return "NY AM";
    if (/\blondon\b|\bldn\b|frankfurt/i.test(hintText)) return "London";
    if (/\basia\b|\basian\b|\btokyo\b|\bsydney\b/i.test(hintText)) return "Asia";

    if (tsInfo && tsInfo.ms > 0 && tsInfo.hasTime) {
      const d = new Date(tsInfo.ms);
      const witaHour = (d.getUTCHours() + 8) % 24;
      if (witaHour >= 7 && witaHour <= 14) return "Asia";
      if (witaHour >= 15 && witaHour <= 19) return "London";
      if (witaHour >= 20 || witaHour === 0) return "NY AM";
      return "NY PM";
    }
    return "Lainnya";
  }

  function extractLeaks(entry) {
    const combined = [
      entry?.mistakes,
      entry?.mistake,
      entry?.emotion,
      entry?.evaluation
    ].filter(Boolean).join(" ").trim();
    if (!combined) return [];

    const matched = [];
    for (const rule of LEAK_RULES) {
      if (rule.re.test(combined)) matched.push(rule.key);
    }

    const explicitMistake = String(entry?.mistakes || entry?.mistake || "").trim();
    if (!matched.length && explicitMistake && !/^(tidak ada|none|-|ok|aman|disiplin)$/i.test(explicitMistake)) {
      const firstPart = explicitMistake.split(/[,;\n]/)[0].trim();
      if (firstPart) {
        matched.push(firstPart.length > 28 ? firstPart.slice(0, 27) + "…" : firstPart);
      }
    }
    return matched;
  }

  function normalizeEntry(raw, idx, options = {}) {
    const result = normalizeResult(raw?.result ?? raw?.outcome);
    const tsInfo = parseTimestamp(raw);

    const explicitMoney = raw?.pnlMoney !== undefined && raw?.pnlMoney !== null && raw?.pnlMoney !== ""
      ? Number(raw.pnlMoney)
      : null;
    const profitNum = Number(raw?.profit) || 0;
    const lossNum = Math.abs(Number(raw?.loss) || 0);
    const hasProfitLoss = (raw?.profit !== undefined && raw?.profit !== "" && profitNum !== 0) ||
      (raw?.loss !== undefined && raw?.loss !== "" && lossNum !== 0);

    let deltaMoney = 0;
    let hasMoney = false;
    if (explicitMoney !== null && Number.isFinite(explicitMoney)) {
      deltaMoney = explicitMoney;
      hasMoney = true;
    } else if (hasProfitLoss) {
      deltaMoney = profitNum - lossNum;
      hasMoney = true;
    }

    const riskAmount = (() => {
      const explicitRisk = Number(raw?.riskMoney || 0);
      if (Number.isFinite(explicitRisk) && explicitRisk > 0) return explicitRisk;
      const bal = Number(options.defaultBalance || 0);
      const riskPct = Number(options.defaultRisk || 0);
      if (bal > 0 && riskPct > 0) return (bal * riskPct) / 100;
      return 0;
    })();

    const rrNum = Number(raw?.riskReward);
    let deltaR = 0;
    if (result === "BE") {
      deltaR = 0;
    } else if (Number.isFinite(rrNum) && rrNum > 0) {
      deltaR = result === "Win" ? rrNum : -1;
    } else if (hasMoney && riskAmount > 0) {
      deltaR = deltaMoney / riskAmount;
    } else if (result === "Win") {
      deltaR = 2;
    } else if (result === "Loss") {
      deltaR = -1;
    }

    const pair = String(raw?.pair || raw?.market || "XAU/USD").trim().toUpperCase() || "XAU/USD";
    const setupRaw = String(raw?.setup || raw?.setupType || "").trim();
    const setup = setupRaw || "Tanpa Label Setup";
    const session = classifySession(raw, tsInfo);
    const leaks = extractLeaks(raw);
    const dateLabel = raw?.date && /^\d{4}-\d{2}-\d{2}/.test(String(raw.date))
      ? String(raw.date).slice(0, 10)
      : tsInfo.iso
      ? tsInfo.iso.slice(0, 10)
      : "";

    return {
      raw,
      originalIndex: idx,
      id: raw?.id || `tr-${idx}`,
      title: String(raw?.title || pair).trim(),
      pair,
      setup,
      session,
      result,
      deltaMoney: Number.isFinite(deltaMoney) ? deltaMoney : 0,
      hasMoney,
      deltaR: Number.isFinite(deltaR) ? deltaR : 0,
      riskReward: Number.isFinite(rrNum) && rrNum > 0 ? rrNum : null,
      pips: Number(raw?.pnlPips || raw?.pips) || 0,
      timestampMs: tsInfo.ms,
      dateLabel,
      leaks
    };
  }

  function filterByRange(normalizedList, range, nowMs) {
    if (!range || range === "all") return normalizedList;
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[range];
    if (!days) return normalizedList;
    const cutoff = (Number.isFinite(nowMs) ? nowMs : Date.now()) - days * DAY_MS;
    return normalizedList.filter((item) => item.timestampMs > 0 && item.timestampMs >= cutoff);
  }

  function formatSignedMoney(val, fmtOpts) {
    const n = Number(val) || 0;
    if (fmtOpts && fmtOpts.currency === "IDR") {
      const rate = Number(fmtOpts.usdIdrRate) > 0 ? Number(fmtOpts.usdIdrRate) : 16500;
      const idr = Math.round(n * rate);
      const absIdr = Math.abs(idr).toLocaleString("id-ID");
      if (idr > 0) return `+Rp${absIdr}`;
      if (idr < 0) return `-Rp${absIdr}`;
      return `Rp0`;
    }
    const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (n > 0) return `+$${abs}`;
    if (n < 0) return `-$${abs}`;
    return `$0.00`;
  }

  function formatSignedR(val) {
    const n = Number(val) || 0;
    const abs = Math.abs(n).toFixed(2);
    if (n > 0) return `+${abs}R`;
    if (n < 0) return `-${abs}R`;
    return `0.00R`;
  }

  function formatValue(val, unit, fmtOpts) {
    return unit === "money" ? formatSignedMoney(val, fmtOpts) : formatSignedR(val);
  }

  function formatAbsValue(val, unit, fmtOpts) {
    const n = Math.abs(Number(val) || 0);
    if (unit === "money") {
      if (fmtOpts && fmtOpts.currency === "IDR") {
        const rate = Number(fmtOpts.usdIdrRate) > 0 ? Number(fmtOpts.usdIdrRate) : 16500;
        return `Rp${Math.round(n * rate).toLocaleString("id-ID")}`;
      }
      return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${n.toFixed(2)}R`;
  }

  function formatDateShort(isoDate) {
    if (!isoDate) return "—";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const mIdx = Math.max(0, Math.min(11, parseInt(parts[1], 10) - 1));
    return `${parseInt(parts[2], 10)} ${months[mIdx]}`;
  }

  function analyzePro(entries, options = {}) {
    const rawList = Array.isArray(entries) ? entries : [];
    const range = ["7d", "30d", "90d", "all"].includes(options.range) ? options.range : "all";
    const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
    const defaultBalance = Number(options.defaultBalance || 0) > 0 ? Number(options.defaultBalance) : 0;
    const defaultRisk = Number(options.defaultRisk || 0) > 0 ? Number(options.defaultRisk) : 0;
    const currency = options.currency === "IDR" ? "IDR" : "USD";
    const usdIdrRate = Number(options.usdIdrRate) > 0 ? Number(options.usdIdrRate) : 16500;
    const fmtOpts = { currency, usdIdrRate };

    const allNormalized = rawList.map((e, i) => normalizeEntry(e, i, { defaultBalance, defaultRisk }));
    const ranged = filterByRange(allNormalized, range, nowMs);

    const closed = ranged
      .filter((item) => item.result !== null)
      .sort((a, b) => (a.timestampMs - b.timestampMs) || (a.originalIndex - b.originalIndex));

    const hasAnyMoney = closed.some((item) => item.hasMoney && item.deltaMoney !== 0);
    const requestedUnit = options.unit || "auto";
    const unit = requestedUnit === "money"
      ? "money"
      : requestedUnit === "r"
      ? "r"
      : hasAnyMoney
      ? "money"
      : "r";

    const wins = closed.filter((x) => x.result === "Win").length;
    const losses = closed.filter((x) => x.result === "Loss").length;
    const breakevens = closed.filter((x) => x.result === "BE").length;
    const closedCount = closed.length;
    const openCount = ranged.length - closedCount;
    const winRate = closedCount ? (wins / closedCount) * 100 : 0;

    let equity = 0;
    let equityMoney = 0;
    let equityR = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownPct = null;

    let grossProfit = 0;
    let grossLoss = 0;
    let sumWinVal = 0;
    let sumLossVal = 0;
    let winValCount = 0;
    let lossValCount = 0;

    let bestWinStreak = 0;
    let worstLossStreak = 0;
    let runWin = 0;
    let runLoss = 0;
    let currentStreakType = null;
    let currentStreakCount = 0;

    const sessionMap = new Map();
    const setupMap = new Map();
    const leakMap = new Map();

    const equitySeries = closed.map((item, idx) => {
      const delta = unit === "money" ? item.deltaMoney : item.deltaR;
      equity += delta;
      equityMoney += item.deltaMoney;
      equityR += item.deltaR;

      if (delta > 0) {
        grossProfit += delta;
        sumWinVal += delta;
        winValCount += 1;
      } else if (delta < 0) {
        grossLoss += Math.abs(delta);
        sumLossVal += Math.abs(delta);
        lossValCount += 1;
      }

      if (equity > peak) peak = equity;
      const drawdown = equity - peak; // <= 0
      const ddAbs = Math.abs(drawdown);
      const ddBase = unit === "money" && defaultBalance > 0
        ? defaultBalance + peak
        : peak > 0
        ? peak
        : 0;
      const drawdownPct = ddBase > 0 ? (ddAbs / ddBase) * 100 : null;

      if (ddAbs > maxDrawdown) {
        maxDrawdown = ddAbs;
        maxDrawdownPct = drawdownPct;
      }

      // Streak tracking (BE keeps streak neutral without resetting best/worst)
      if (item.result === "Win") {
        runWin += 1;
        runLoss = 0;
        if (runWin > bestWinStreak) bestWinStreak = runWin;
        currentStreakType = "Win";
        currentStreakCount = runWin;
      } else if (item.result === "Loss") {
        runLoss += 1;
        runWin = 0;
        if (runLoss > worstLossStreak) worstLossStreak = runLoss;
        currentStreakType = "Loss";
        currentStreakCount = runLoss;
      } else if (currentStreakType === null) {
        currentStreakType = "BE";
        currentStreakCount = 1;
      }

      // Session aggregation
      const sKey = item.session;
      const sRow = sessionMap.get(sKey) || { key: sKey, total: 0, wins: 0, losses: 0, be: 0, net: 0, netMoney: 0, netR: 0 };
      sRow.total += 1;
      if (item.result === "Win") sRow.wins += 1;
      else if (item.result === "Loss") sRow.losses += 1;
      else sRow.be += 1;
      sRow.net += delta;
      sRow.netMoney += item.deltaMoney;
      sRow.netR += item.deltaR;
      sessionMap.set(sKey, sRow);

      // Setup aggregation
      const stKey = item.setup;
      const stRow = setupMap.get(stKey) || { key: stKey, total: 0, wins: 0, losses: 0, be: 0, net: 0, netMoney: 0, netR: 0 };
      stRow.total += 1;
      if (item.result === "Win") stRow.wins += 1;
      else if (item.result === "Loss") stRow.losses += 1;
      else stRow.be += 1;
      stRow.net += delta;
      stRow.netMoney += item.deltaMoney;
      stRow.netR += item.deltaR;
      setupMap.set(stKey, stRow);

      // Leak / Mistake cost aggregation
      item.leaks.forEach((leakKey) => {
        const lRow = leakMap.get(leakKey) || { key: leakKey, count: 0, lossCount: 0, net: 0, lossImpact: 0 };
        lRow.count += 1;
        lRow.net += delta;
        if (delta < 0) {
          lRow.lossCount += 1;
          lRow.lossImpact += Math.abs(delta);
        } else if (item.result === "Loss") {
          lRow.lossCount += 1;
        }
        leakMap.set(leakKey, lRow);
      });

      return {
        index: idx + 1,
        id: item.id,
        title: item.title,
        pair: item.pair,
        setup: item.setup,
        session: item.session,
        result: item.result,
        dateLabel: item.dateLabel,
        delta: +delta.toFixed(4),
        deltaMoney: +item.deltaMoney.toFixed(2),
        deltaR: +item.deltaR.toFixed(2),
        equity: +equity.toFixed(4),
        equityMoney: +equityMoney.toFixed(2),
        equityR: +equityR.toFixed(2),
        peak: +peak.toFixed(4),
        drawdown: +drawdown.toFixed(4),
        drawdownAbs: +ddAbs.toFixed(4),
        drawdownPct: drawdownPct != null ? +drawdownPct.toFixed(2) : null
      };
    });

    const currentDrawdown = equitySeries.length ? equitySeries[equitySeries.length - 1].drawdownAbs : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const avgWin = winValCount > 0 ? sumWinVal / winValCount : 0;
    const avgLoss = lossValCount > 0 ? sumLossVal / lossValCount : 0;
    const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
    const expectancy = closedCount > 0 ? equity / closedCount : 0;
    const returnPct = defaultBalance > 0 && hasAnyMoney ? (equityMoney / defaultBalance) * 100 : null;

    const finalizeBreakdown = (map) =>
      [...map.values()]
        .map((r) => ({
          ...r,
          winRate: r.total ? +((r.wins / r.total) * 100).toFixed(1) : 0,
          net: +r.net.toFixed(2),
          netMoney: +r.netMoney.toFixed(2),
          netR: +r.netR.toFixed(2)
        }))
        .sort((a, b) => (b.net - a.net) || (b.total - a.total));

    const bySession = finalizeBreakdown(sessionMap);
    const bySetup = finalizeBreakdown(setupMap);
    const byLeak = [...leakMap.values()]
      .map((r) => ({
        ...r,
        net: +r.net.toFixed(2),
        lossImpact: +r.lossImpact.toFixed(2)
      }))
      .sort((a, b) => (b.lossImpact - a.lossImpact) || (b.count - a.count));

    // Actionable execution brief
    const bestSession = bySession.find((s) => s.key !== "Lainnya" && s.net > 0) || bySession.find((s) => s.net > 0) || null;
    const worstSession = [...bySession].reverse().find((s) => s.net < 0) || null;
    const bestSetup = bySetup.find((s) => s.key !== "Tanpa Label Setup" && s.net > 0) || bySetup.find((s) => s.net > 0) || null;
    const topLeak = byLeak.find((l) => l.lossImpact > 0) || byLeak[0] || null;

    const bullets = [];
    if (bestSession) {
      bullets.push(
        `Sesi terkuat: ${bestSession.key} (${formatValue(bestSession.net, unit, fmtOpts)} · ${bestSession.winRate}% WR dari ${bestSession.total} trade).`
      );
    } else if (bestSetup) {
      bullets.push(
        `Setup terkuat: ${bestSetup.key} (${formatValue(bestSetup.net, unit, fmtOpts)} · ${bestSetup.winRate}% WR).`
      );
    }
    if (topLeak && topLeak.lossImpact > 0) {
      bullets.push(
        `Kebocoran terbesar: ${topLeak.key} (${topLeak.count}x, biaya rugi -${formatAbsValue(topLeak.lossImpact, unit, fmtOpts)}).`
      );
    } else if (worstSession) {
      bullets.push(
        `Sesi rawan: ${worstSession.key} (${formatValue(worstSession.net, unit, fmtOpts)} · ${worstSession.winRate}% WR) — kurangi ukuran lot atau perketat konfirmasi M5.`
      );
    } else if (closedCount > 0 && currentDrawdown === 0 && equity > 0) {
      bullets.push("Ekuitas berada di puncak tertinggi (All-Time High) — jaga konsistensi risiko 1–1.5% per setup.");
    } else if (closedCount > 0 && currentDrawdown > 0) {
      bullets.push(`Sedang dalam drawdown -${formatAbsValue(currentDrawdown, unit, fmtOpts)} dari puncak — fokus hanya pada setup Grade A+.`);
    }

    const headline = closedCount === 0
      ? "Belum ada trade tertutup untuk dianalisis."
      : bullets[0] || `Total ${closedCount} trade tertutup · Net ${formatValue(equity, unit, fmtOpts)} · Win Rate ${winRate.toFixed(1)}%.`;

    return {
      range,
      unit,
      currency,
      usdIdrRate,
      hasAnyMoney,
      defaultBalance,
      summary: {
        totalLogged: ranged.length,
        totalAllTime: allNormalized.length,
        closedCount,
        openCount,
        wins,
        losses,
        breakevens,
        winRate: +winRate.toFixed(1),
        netValue: +equity.toFixed(2),
        netMoney: +equityMoney.toFixed(2),
        netR: +equityR.toFixed(2),
        returnPct: returnPct != null ? +returnPct.toFixed(2) : null,
        grossProfit: +grossProfit.toFixed(2),
        grossLoss: +grossLoss.toFixed(2),
        profitFactor: Number.isFinite(profitFactor) ? +profitFactor.toFixed(2) : profitFactor,
        avgWin: +avgWin.toFixed(2),
        avgLoss: +avgLoss.toFixed(2),
        winLossRatio: Number.isFinite(winLossRatio) ? +winLossRatio.toFixed(2) : winLossRatio,
        expectancy: +expectancy.toFixed(2),
        maxDrawdown: +maxDrawdown.toFixed(2),
        maxDrawdownPct: maxDrawdownPct != null ? +maxDrawdownPct.toFixed(1) : null,
        currentDrawdown: +currentDrawdown.toFixed(2),
        currentStreak: { type: currentStreakType, count: currentStreakCount },
        bestWinStreak,
        worstLossStreak,
        sampleWarning: closedCount > 0 && closedCount < 5
      },
      equitySeries,
      breakdowns: {
        bySession,
        bySetup,
        byLeak
      },
      executionBrief: {
        headline,
        bullets,
        bestSession,
        worstSession,
        bestSetup,
        topLeak
      }
    };
  }

  function formatProfitFactor(pf) {
    if (pf === Infinity) return "∞";
    if (!Number.isFinite(pf) || pf <= 0) return "0.00";
    return pf.toFixed(2);
  }

  function formatStreak(streak) {
    if (!streak || !streak.type || !streak.count) return "—";
    if (streak.type === "Win") return `+${streak.count} Win`;
    if (streak.type === "Loss") return `-${streak.count} Loss`;
    return `${streak.count} BE`;
  }

  function askAmyWithPrompt(promptText) {
    const text = String(promptText || "Evaluasi equity curve, max drawdown, sesi terbaik, dan kebocoran kesalahan di jurnal trading saya.");
    try {
      if (root.AmyLocalAssistant?.openWithPrompt) {
        root.AmyLocalAssistant.openWithPrompt(text);
        return true;
      }
    } catch (_) {}
    try {
      root.dispatchEvent(new CustomEvent("amyfx:open-mentor"));
      setTimeout(() => {
        const panel = document.getElementById("amy-local-panel");
        const input = panel?.querySelector("form input");
        const form = panel?.querySelector("form");
        if (input && form) {
          input.value = text;
          if (typeof form.requestSubmit === "function") form.requestSubmit();
          else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        }
      }, 140);
      return true;
    } catch (_) {
      return false;
    }
  }

  function buildEquityChartMarkup(analysis, compact = false) {
    const series = analysis.equitySeries;
    const unit = analysis.unit;
    if (!series.length) {
      return "";
    }

    const width = compact ? 360 : 640;
    const height = compact ? 92 : 196;
    const padL = compact ? 8 : 14;
    const padR = compact ? 8 : 14;
    const padT = compact ? 10 : 16;
    const padB = compact ? 10 : 18;
    const innerW = width - padL - padR;
    const innerH = height - padT - padB;

    const eqValues = [0, ...series.map((p) => p.equity)];
    let minVal = Math.min(...eqValues);
    let maxVal = Math.max(...eqValues);
    if (minVal === maxVal) {
      minVal -= 1;
      maxVal += 1;
    }
    const range = maxVal - minVal;

    const xAt = (i) => padL + (i / (eqValues.length - 1 || 1)) * innerW;
    const yAt = (v) => padT + innerH - ((v - minVal) / range) * innerH;
    const zeroY = yAt(0);
    const peakY = yAt(maxVal);

    const coords = eqValues.map((v, i) => ({ x: xAt(i), y: yAt(v), v }));
    const polyPoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
    const areaPoints = `${coords[0].x.toFixed(1)},${zeroY.toFixed(1)} ${polyPoints} ${coords[coords.length - 1].x.toFixed(1)},${zeroY.toFixed(1)}`;

    const lastEq = eqValues[eqValues.length - 1];
    const isPos = lastEq >= 0;
    const strokeVar = isPos ? "var(--jp-pos, #16a34a)" : "var(--jp-neg, #dc2626)";
    const gradId = compact ? "jpHomeEqGrad" : "jpMainEqGrad";
    const ddGradId = "jpDrawdownGrad";

    // Drawdown strip for full mode
    let ddSvg = "";
    if (!compact) {
      const ddH = 54;
      const ddPadT = 8;
      const ddPadB = 10;
      const ddInnerH = ddH - ddPadT - ddPadB;
      const maxDd = Math.max(analysis.summary.maxDrawdown || 0, 0.0001);
      const ddValues = [0, ...series.map((p) => p.drawdownAbs)];
      const ddCoords = ddValues.map((d, i) => ({
        x: xAt(i),
        y: ddPadT + (d / maxDd) * ddInnerH
      }));
      const ddPoly = ddCoords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
      const ddArea = `${ddCoords[0].x.toFixed(1)},${ddPadT} ${ddPoly} ${ddCoords[ddCoords.length - 1].x.toFixed(1)},${ddPadT}`;

      const fmtOpts = { currency: analysis.currency, usdIdrRate: analysis.usdIdrRate };
      ddSvg = `
        <div class="jp-dd-strip">
          <div class="jp-dd-head">
            <span>Underwater Drawdown</span>
            <span class="jp-tabular">Maks -${escapeHtml(formatAbsValue(analysis.summary.maxDrawdown, unit, fmtOpts))}${analysis.summary.maxDrawdownPct != null ? ` (${analysis.summary.maxDrawdownPct}%)` : ""}</span>
          </div>
          <svg class="jp-dd-svg" viewBox="0 0 ${width} ${ddH}" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="${ddGradId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#dc2626" stop-opacity="0.28"></stop>
                <stop offset="100%" stop-color="#dc2626" stop-opacity="0.04"></stop>
              </linearGradient>
            </defs>
            <line x1="${padL}" y1="${ddPadT}" x2="${width - padR}" y2="${ddPadT}" class="jp-grid-zero"></line>
            <polygon points="${ddArea}" fill="url(#${ddGradId})"></polygon>
            <polyline points="${ddPoly}" fill="none" stroke="var(--jp-neg, #dc2626)" stroke-width="1.6" stroke-linejoin="round"></polyline>
            <line class="jp-dd-crosshair" x1="0" y1="${ddPadT}" x2="0" y2="${ddH - ddPadB}" hidden></line>
          </svg>
        </div>
      `;
    }

    const dotMarkup = compact
      ? `<circle cx="${coords[coords.length - 1].x.toFixed(1)}" cy="${coords[coords.length - 1].y.toFixed(1)}" r="3.4" fill="${strokeVar}"></circle>`
      : series.map((pt, idx) => {
          const c = coords[idx + 1];
          const fill = pt.result === "Win"
            ? "var(--jp-pos, #16a34a)"
            : pt.result === "Loss"
            ? "var(--jp-neg, #dc2626)"
            : "var(--jp-muted, #94a3b8)";
          const r = series.length > 35 ? 2.4 : 3.4;
          return `<circle class="jp-eq-dot" data-idx="${idx}" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" fill="${fill}"></circle>`;
        }).join("");

    const peakLine = maxVal > 0
      ? `<line x1="${padL}" y1="${peakY.toFixed(1)}" x2="${width - padR}" y2="${peakY.toFixed(1)}" class="jp-grid-peak"></line>`
      : "";

    return `
      <div class="jp-chart-stage ${compact ? "jp-chart-stage--compact" : ""}" data-jp-chart>
        <svg class="jp-eq-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Grafik pertumbuhan ekuitas jurnal trading">
          <defs>
            <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${isPos ? "#16a34a" : "#dc2626"}" stop-opacity="0.22"></stop>
              <stop offset="100%" stop-color="${isPos ? "#16a34a" : "#dc2626"}" stop-opacity="0.01"></stop>
            </linearGradient>
          </defs>
          ${peakLine}
          <line x1="${padL}" y1="${zeroY.toFixed(1)}" x2="${width - padR}" y2="${zeroY.toFixed(1)}" class="jp-grid-zero"></line>
          <polygon points="${areaPoints}" fill="url(#${gradId})"></polygon>
          <polyline points="${polyPoints}" fill="none" stroke="${strokeVar}" stroke-width="${compact ? "2.1" : "2.4"}" stroke-linecap="round" stroke-linejoin="round"></polyline>
          ${dotMarkup}
          ${compact ? "" : `<line class="jp-eq-crosshair" x1="0" y1="${padT}" x2="0" y2="${height - padB}" hidden></line><circle class="jp-eq-focus" cx="0" cy="0" r="5.5" fill="${strokeVar}" hidden></circle>`}
        </svg>
        ${ddSvg}
      </div>
    `;
  }

  function renderBreakdownRows(rows, unit, emptyMessage, fmtOpts) {
    if (!rows || !rows.length) {
      return `<p class="jp-empty-inline">${escapeHtml(emptyMessage)}</p>`;
    }
    const maxAbs = Math.max(...rows.map((r) => Math.abs(r.net)), 0.0001);
    return rows.slice(0, 6).map((row, idx) => {
      const pctBar = Math.max(6, Math.round((Math.abs(row.net) / maxAbs) * 100));
      const isPos = row.net > 0;
      const isNeg = row.net < 0;
      const toneClass = isPos ? "is-pos" : isNeg ? "is-neg" : "is-flat";
      const tag = idx === 0 && isPos ? " · Terkuat" : "";
      return `
        <div class="jp-row">
          <div class="jp-row-top">
            <span class="jp-row-title">${escapeHtml(row.key)}<span class="jp-row-meta">${escapeHtml(tag)}</span></span>
            <span class="jp-row-val jp-tabular ${toneClass}">${escapeHtml(formatValue(row.net, unit, fmtOpts))}</span>
          </div>
          <div class="jp-row-sub">
            <span class="jp-tabular">${row.total} trade · ${row.winRate}% WR (${row.wins}W/${row.losses}L)</span>
          </div>
          <div class="jp-bar-track" aria-hidden="true">
            <span class="jp-bar-fill ${toneClass}" style="width:${pctBar}%"></span>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderLeakRows(leaks, unit, fmtOpts) {
    if (!leaks || !leaks.length) {
      return `<p class="jp-empty-inline">Belum ada pola kesalahan tercatat <button type="button" class="amy-info-btn" data-info-tip="Pola kesalahan disiplin (overtrade, FOMO, geser SL, dll.) akan otomatis terdeteksi dari catatan jurnal." aria-label="Info pola kesalahan" aria-expanded="false">i</button></p>`;
    }
    const maxLoss = Math.max(...leaks.map((l) => l.lossImpact || l.count), 0.0001);
    return leaks.slice(0, 6).map((row) => {
      const impact = row.lossImpact > 0 ? `-${formatAbsValue(row.lossImpact, unit, fmtOpts)}` : formatValue(row.net, unit, fmtOpts);
      const barPct = Math.max(8, Math.round(((row.lossImpact || row.count) / maxLoss) * 100));
      const tone = row.lossImpact > 0 || row.net < 0 ? "is-neg" : "is-warn";
      return `
        <div class="jp-row">
          <div class="jp-row-top">
            <span class="jp-row-title">${escapeHtml(row.key)}</span>
            <span class="jp-row-val jp-tabular ${tone}">${escapeHtml(impact)}</span>
          </div>
          <div class="jp-row-sub">
            <span class="jp-tabular">Tercatat ${row.count}x · ${row.lossCount} berakhir loss</span>
          </div>
          <div class="jp-bar-track" aria-hidden="true">
            <span class="jp-bar-fill ${tone}" style="width:${barPct}%"></span>
          </div>
        </div>
      `;
    }).join("");
  }

  function mountProAnalytics(container, entries, options = {}) {
    if (!container) return;
    const defaultBalance = Number(options.defaultBalance ?? (typeof localStorage !== "undefined" ? localStorage.getItem("amy_default_balance") : 0)) || 0;
    const defaultRisk = Number(options.defaultRisk ?? (typeof localStorage !== "undefined" ? localStorage.getItem("amy_default_risk") : 0)) || 0;
    const currency = options.currency === "IDR" ? "IDR" : "USD";
    const usdIdrRate = Number(options.usdIdrRate) > 0 ? Number(options.usdIdrRate) : 16500;
    const fmtOpts = { currency, usdIdrRate };

    const hasCalendar = typeof options.renderCalendar === "function";
    const defaultSubtab = options.initialSubtab || (hasCalendar ? "calendar" : "breakdown");
    const uiState = container.__jpState || { range: "all", unit: "auto", subtab: defaultSubtab };
    if (!hasCalendar && uiState.subtab === "calendar") {
      uiState.subtab = "breakdown";
    }
    container.__jpState = uiState;

    const renderView = () => {
      const data = analyzePro(entries, {
        range: uiState.range,
        unit: uiState.unit,
        defaultBalance,
        defaultRisk,
        currency,
        usdIdrRate
      });
      const s = data.summary;
      const unit = data.unit;
      const activeUnit = uiState.unit === "auto" ? unit : uiState.unit;

      const rangeOptions = [
        { id: "7d", label: "7H" },
        { id: "30d", label: "30H" },
        { id: "90d", label: "90H" },
        { id: "all", label: "Semua" }
      ];

      const toolbarHtml = `
        <div class="jp-toolbar">
          <div class="jp-title-block">
            <p class="jp-meta-line jp-tabular">
              <span>${s.closedCount} trade tertutup</span>
              <span aria-hidden="true">·</span>
              <span>${s.openCount} terbuka</span>
              ${s.sampleWarning ? `<span aria-hidden="true">·</span><span class="jp-warn-text">Sampel awal (&lt;5)</span>` : ""}
            </p>
          </div>
          <div class="jp-controls">
            <div class="jp-seg" role="group" aria-label="Filter rentang waktu">
              ${rangeOptions.map((opt) => `<button type="button" class="jp-seg-btn ${uiState.range === opt.id ? "is-active" : ""}" data-jp-range="${opt.id}">${opt.label}</button>`).join("")}
            </div>
            <div class="jp-seg" role="group" aria-label="Satuan kurva">
              <button type="button" class="jp-seg-btn ${activeUnit === "money" ? "is-active" : ""}" data-jp-unit="money">${currency === "IDR" ? "Rp" : "$"}</button>
              <button type="button" class="jp-seg-btn ${activeUnit === "r" ? "is-active" : ""}" data-jp-unit="r">R</button>
            </div>
            <button type="button" class="jp-amy-btn" data-jp-ask-amy>Evaluasi Amy</button>
          </div>
        </div>
      `;

      const calendarPaneHtml = hasCalendar ? options.renderCalendar() : "";

      if (s.closedCount === 0) {
        const emptyTip = s.totalAllTime > 0
          ? "Pilih rentang Semua untuk melihat riwayat trade sebelumnya."
          : "Catat hasil trade (Win, Loss, atau BE) agar Equity Curve, Drawdown, dan Kebocoran muncul otomatis.";
        container.innerHTML = `
          <div class="jp-pro-root jp-pro-ledger">
            ${toolbarHtml}
            <div class="jp-empty-card">
              <h4>Belum ada trade tertutup <button type="button" class="amy-info-btn" data-info-tip="${escapeHtml(emptyTip)}" aria-label="Info performa" aria-expanded="false">i</button></h4>
              <div class="jp-empty-actions">
                ${s.totalAllTime > 0
                  ? `<button type="button" class="jp-primary-btn" data-jp-range="all">Tampilkan Semua</button>`
                  : `<button type="button" class="jp-primary-btn" data-jp-log-first>Catat Trade Pertama</button>`}
              </div>
            </div>
            ${hasCalendar ? `<section class="jp-subtab-pane" data-jp-pane="calendar">${calendarPaneHtml}</section>` : ""}
          </div>
        `;
        bindEvents(data);
        return;
      }

      const lastPt = data.equitySeries[data.equitySeries.length - 1];
      const netTone = s.netValue > 0 ? "is-pos" : s.netValue < 0 ? "is-neg" : "is-flat";
      const pfTone = s.profitFactor === Infinity || s.profitFactor >= 1.5 ? "is-pos" : s.profitFactor >= 1 ? "is-flat" : "is-neg";
      const expLabel = `Exp ${formatValue(s.expectancy, unit, fmtOpts)}/trd`;
      const streakLabel = `Streak ${formatStreak(s.currentStreak)}`;

      const subtabDefs = [
        ...(hasCalendar ? [{ id: "calendar", label: "Kalender" }] : []),
        { id: "breakdown", label: "Sesi & Setup" },
        { id: "leaks", label: "Kebocoran" }
      ];

      if (!subtabDefs.some((t) => t.id === uiState.subtab)) {
        uiState.subtab = subtabDefs[0].id;
      }

      const briefHtml = data.executionBrief.bullets.length
        ? `<div class="jp-brief" aria-label="Sorotan eksekusi">
             ${data.executionBrief.bullets.slice(0, 2).map((b) => `<p>${escapeHtml(b)}</p>`).join("")}
           </div>`
        : "";

      let activePaneHtml = "";
      if (uiState.subtab === "calendar" && hasCalendar) {
        activePaneHtml = `<div class="jp-subtab-pane" data-jp-pane="calendar">${calendarPaneHtml}</div>`;
      } else if (uiState.subtab === "leaks") {
        activePaneHtml = `
          <div class="jp-subtab-pane" data-jp-pane="leaks">
            ${briefHtml}
            <div class="jp-ledger-section">
              <div class="jp-panel-head">
                <h4>Kebocoran &amp; Psikologi <button type="button" class="amy-info-btn" data-info-tip="Menghitung total biaya kerugian dari kesalahan disiplin yang tercatat pada jurnal." aria-label="Info kebocoran" aria-expanded="false">i</button></h4>
              </div>
              <div class="jp-rows jp-rows--leaks">
                ${renderLeakRows(data.breakdowns.byLeak, unit, fmtOpts)}
              </div>
            </div>
          </div>
        `;
      } else {
        activePaneHtml = `
          <div class="jp-subtab-pane" data-jp-pane="breakdown">
            <div class="jp-split-grid">
              <div class="jp-ledger-section">
                <div class="jp-panel-head">
                  <h4>Performa per Sesi (WITA) <button type="button" class="amy-info-btn" data-info-tip="Perbandingan hasil eksekusi berdasarkan jendela sesi Asia, London, NY AM, dan NY PM (WITA)." aria-label="Info sesi" aria-expanded="false">i</button></h4>
                </div>
                <div class="jp-rows">
                  ${renderBreakdownRows(data.breakdowns.bySession, unit, "Belum ada data sesi.", fmtOpts)}
                </div>
              </div>

              <div class="jp-ledger-section">
                <div class="jp-panel-head">
                  <h4>Performa per Setup ICT <button type="button" class="amy-info-btn" data-info-tip="Konsistensi setiap pola entry. Isi kolom Setup saat mencatat trade agar terkelompok otomatis." aria-label="Info setup" aria-expanded="false">i</button></h4>
                </div>
                <div class="jp-rows">
                  ${renderBreakdownRows(data.breakdowns.bySetup, unit, "Belum ada data setup.", fmtOpts)}
                </div>
              </div>
            </div>
          </div>
        `;
      }

      container.innerHTML = `
        <div class="jp-pro-root jp-pro-ledger">
          ${toolbarHtml}

          <section class="jp-hero-equity" aria-label="Grafik pertumbuhan ekuitas">
            <div class="jp-chart-head">
              <div class="jp-chart-inspect" data-jp-inspect>
                <span class="jp-inspect-title">Trade #${lastPt.index} · ${escapeHtml(formatDateShort(lastPt.dateLabel))} · ${escapeHtml(lastPt.pair)}</span>
                <span class="jp-inspect-sub jp-tabular">${escapeHtml(lastPt.setup)} · ${escapeHtml(lastPt.session)} · ${escapeHtml(lastPt.result)} (${escapeHtml(formatValue(lastPt.delta, unit, fmtOpts))})</span>
              </div>
              <div class="jp-chart-total">
                <strong class="jp-tabular ${netTone}" data-jp-eq-val>${escapeHtml(formatValue(lastPt.equity, unit, fmtOpts))}</strong>
                <span class="jp-tabular" data-jp-eq-sub>${lastPt.drawdownAbs > 0 ? `DD -${escapeHtml(formatAbsValue(lastPt.drawdownAbs, unit, fmtOpts))}` : "Puncak Tertinggi"}</span>
              </div>
            </div>
            ${buildEquityChartMarkup(data, false)}
          </section>

          <section class="jp-kpi-strip" aria-label="4 Indikator Utama Performa">
            <article class="jp-kpi-cell">
              <span class="jp-kpi-label">Net P/L</span>
              <strong class="jp-kpi-val jp-tabular ${netTone}">${escapeHtml(formatValue(s.netValue, unit, fmtOpts))}</strong>
              <span class="jp-kpi-sub jp-tabular">${s.returnPct != null && unit === "money" ? `${s.returnPct >= 0 ? "+" : ""}${s.returnPct}% modal` : `${formatSignedR(s.netR)} total`}</span>
            </article>
            <article class="jp-kpi-cell">
              <span class="jp-kpi-label">Win Rate</span>
              <strong class="jp-kpi-val jp-tabular">${s.winRate}%</strong>
              <span class="jp-kpi-sub jp-tabular">${s.wins}W · ${s.losses}L · ${s.breakevens}BE</span>
            </article>
            <article class="jp-kpi-cell">
              <span class="jp-kpi-label">Profit Factor</span>
              <strong class="jp-kpi-val jp-tabular ${pfTone}">${escapeHtml(formatProfitFactor(s.profitFactor))}</strong>
              <span class="jp-kpi-sub jp-tabular">${escapeHtml(expLabel)}</span>
            </article>
            <article class="jp-kpi-cell">
              <span class="jp-kpi-label">Max Drawdown</span>
              <strong class="jp-kpi-val jp-tabular ${s.maxDrawdown > 0 ? "is-neg" : "is-pos"}">-${escapeHtml(formatAbsValue(s.maxDrawdown, unit, fmtOpts))}</strong>
              <span class="jp-kpi-sub jp-tabular">${escapeHtml(streakLabel)}</span>
            </article>
          </section>

          <div class="jp-subtabs-bar" role="tablist" aria-label="Detail Analitik Performa">
            ${subtabDefs.map((tab) => `
              <button
                type="button"
                role="tab"
                aria-selected="${uiState.subtab === tab.id ? "true" : "false"}"
                class="jp-subtab-btn ${uiState.subtab === tab.id ? "is-active" : ""}"
                data-jp-subtab="${tab.id}"
              >${tab.label}</button>
            `).join("")}
          </div>

          ${activePaneHtml}
        </div>
      `;

      bindEvents(data);
    };

    const bindEvents = (data) => {
      container.querySelectorAll("[data-jp-range]").forEach((btn) => {
        btn.addEventListener("click", () => {
          uiState.range = btn.getAttribute("data-jp-range") || "all";
          renderView();
        });
      });

      container.querySelectorAll("[data-jp-unit]").forEach((btn) => {
        btn.addEventListener("click", () => {
          uiState.unit = btn.getAttribute("data-jp-unit") || "auto";
          renderView();
        });
      });

      container.querySelectorAll("[data-jp-subtab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          uiState.subtab = btn.getAttribute("data-jp-subtab") || defaultSubtab;
          renderView();
        });
      });

      if (typeof options.onBindCalendar === "function") {
        options.onBindCalendar(container);
      }

      container.querySelector("[data-jp-ask-amy]")?.addEventListener("click", () => {
        const rangeLabel = { "7d": "7 hari terakhir", "30d": "30 hari terakhir", "90d": "90 hari terakhir", all: "keseluruhan" }[data.range] || "keseluruhan";
        askAmyWithPrompt(`Evaluasi performa jurnal trading saya (${rangeLabel}): cek equity curve, max drawdown, profit factor, sesi paling cuan, dan kebocoran kesalahan terbesar.`);
      });

      container.querySelector("[data-jp-log-first]")?.addEventListener("click", () => {
        if (typeof options.onLogFirst === "function") {
          options.onLogFirst();
          return;
        }
        const navBtn = document.querySelector('.side-nav-button[data-view="journal"]');
        navBtn?.click();
        setTimeout(() => document.getElementById("newJournalBtn")?.click(), 80);
      });

      // Interactive pointer/touch scrubber on the Equity Curve
      const stage = container.querySelector("[data-jp-chart]");
      const eqSvg = stage?.querySelector(".jp-eq-svg");
      if (!eqSvg || !data.equitySeries.length) return;

      const crosshair = eqSvg.querySelector(".jp-eq-crosshair");
      const focusDot = eqSvg.querySelector(".jp-eq-focus");
      const ddCrosshair = stage.querySelector(".jp-dd-crosshair");
      const inspectEl = container.querySelector("[data-jp-inspect]");
      const eqValEl = container.querySelector("[data-jp-eq-val]");
      const eqSubEl = container.querySelector("[data-jp-eq-sub]");

      const dots = [...eqSvg.querySelectorAll(".jp-eq-dot")];
      const showPoint = (idx) => {
        const pt = data.equitySeries[idx];
        const dot = dots[idx];
        if (!pt || !dot) return;
        const cx = dot.getAttribute("cx");
        const cy = dot.getAttribute("cy");
        if (crosshair) {
          crosshair.setAttribute("x1", cx);
          crosshair.setAttribute("x2", cx);
          crosshair.hidden = false;
        }
        if (ddCrosshair) {
          ddCrosshair.setAttribute("x1", cx);
          ddCrosshair.setAttribute("x2", cx);
          ddCrosshair.hidden = false;
        }
        if (focusDot) {
          focusDot.setAttribute("cx", cx);
          focusDot.setAttribute("cy", cy);
          focusDot.hidden = false;
        }
        if (inspectEl) {
          inspectEl.innerHTML = `
            <span class="jp-inspect-title">Trade #${pt.index} · ${escapeHtml(formatDateShort(pt.dateLabel))} · ${escapeHtml(pt.pair)}</span>
            <span class="jp-inspect-sub jp-tabular">${escapeHtml(pt.setup)} · ${escapeHtml(pt.session)} · ${escapeHtml(pt.result)} (${escapeHtml(formatValue(pt.delta, data.unit, fmtOpts))})</span>
          `;
        }
        if (eqValEl) {
          eqValEl.textContent = formatValue(pt.equity, data.unit, fmtOpts);
          eqValEl.className = `jp-tabular ${pt.equity > 0 ? "is-pos" : pt.equity < 0 ? "is-neg" : "is-flat"}`;
        }
        if (eqSubEl) {
          eqSubEl.textContent = pt.drawdownAbs > 0 ? `DD -${formatAbsValue(pt.drawdownAbs, data.unit, fmtOpts)}` : "Puncak Tertinggi";
        }
      };

      const resetPoint = () => {
        if (crosshair) crosshair.hidden = true;
        if (ddCrosshair) ddCrosshair.hidden = true;
        if (focusDot) focusDot.hidden = true;
        showPoint(data.equitySeries.length - 1);
        if (crosshair) crosshair.hidden = true;
        if (ddCrosshair) ddCrosshair.hidden = true;
        if (focusDot) focusDot.hidden = true;
      };

      const handlePointer = (clientX) => {
        const rect = eqSvg.getBoundingClientRect();
        if (!rect.width) return;
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const eqIdx = Math.round(ratio * data.equitySeries.length);
        const tradeIdx = Math.max(0, Math.min(data.equitySeries.length - 1, eqIdx - 1));
        showPoint(tradeIdx);
      };

      eqSvg.addEventListener("pointermove", (e) => handlePointer(e.clientX));
      eqSvg.addEventListener("pointerdown", (e) => handlePointer(e.clientX));
      eqSvg.addEventListener("pointerleave", resetPoint);
    };

    renderView();
  }

  function renderHomeSnapshot(container, entries, options = {}) {
    if (!container) return;
    const defaultBalance = Number(options.defaultBalance ?? (typeof localStorage !== "undefined" ? localStorage.getItem("amy_default_balance") : 0)) || 0;
    const defaultRisk = Number(options.defaultRisk ?? (typeof localStorage !== "undefined" ? localStorage.getItem("amy_default_risk") : 0)) || 0;

    const data = analyzePro(entries, { range: "all", unit: "auto", defaultBalance, defaultRisk });
    const s = data.summary;
    const unit = data.unit;

    if (s.closedCount === 0) {
      container.innerHTML = `
        <div class="jp-home-card">
          <div class="jp-home-head">
            <div>
              <h2>Performa Jurnal <button type="button" class="amy-info-btn" data-info-tip="Catat hasil trade XAU/USD pertamamu agar Equity Curve, Profit Factor, Max Drawdown, dan pola kebocoran tampil otomatis." aria-label="Info performa jurnal" aria-expanded="false">i</button></h2>
              <p class="jp-meta-line">Belum ada trade tertutup</p>
            </div>
            <a class="jp-home-link" href="apps/journal/index.html?view=statistics">Buka Analitik →</a>
          </div>
          <div class="jp-home-actions">
            <a class="jp-primary-btn" href="apps/journal/index.html?view=journal&amp;action=new">Catat Trade Pertama</a>
            <button type="button" class="jp-amy-btn" data-jp-home-amy>Tanya Amy</button>
          </div>
        </div>
      `;
      container.querySelector("[data-jp-home-amy]")?.addEventListener("click", () => {
        askAmyWithPrompt("Bantu saya memulai pencatatan jurnal trading XAU/USD yang efektif agar analitik equity curve akurat.");
      });
      return;
    }

    const netTone = s.netValue > 0 ? "is-pos" : s.netValue < 0 ? "is-neg" : "is-flat";
    const pfTone = s.profitFactor === Infinity || s.profitFactor >= 1.5 ? "is-pos" : s.profitFactor >= 1 ? "is-flat" : "is-neg";
    const highlight = data.executionBrief.headline;

    container.innerHTML = `
      <div class="jp-home-card">
        <div class="jp-home-head">
          <div>
            <h2>Performa Jurnal</h2>
            <p class="jp-meta-line jp-tabular">
              <span>${s.closedCount} trade tertutup</span>
              <span aria-hidden="true">·</span>
              <span>Streak ${escapeHtml(formatStreak(s.currentStreak))}</span>
            </p>
          </div>
          <strong class="jp-home-net jp-tabular ${netTone}">${escapeHtml(formatValue(s.netValue, unit))}</strong>
        </div>

        ${buildEquityChartMarkup(data, true)}

        <div class="jp-home-kpis">
          <div class="jp-home-kpi">
            <span>Win Rate</span>
            <strong class="jp-tabular">${s.winRate}%</strong>
          </div>
          <div class="jp-home-kpi">
            <span>Profit Factor</span>
            <strong class="jp-tabular ${pfTone}">${escapeHtml(formatProfitFactor(s.profitFactor))}</strong>
          </div>
          <div class="jp-home-kpi">
            <span>Expectancy</span>
            <strong class="jp-tabular ${s.expectancy >= 0 ? "is-pos" : "is-neg"}">${escapeHtml(formatValue(s.expectancy, unit))}</strong>
          </div>
          <div class="jp-home-kpi">
            <span>Max DD</span>
            <strong class="jp-tabular ${s.maxDrawdown > 0 ? "is-neg" : "is-pos"}">-${escapeHtml(formatAbsValue(s.maxDrawdown, unit))}</strong>
          </div>
        </div>

        <p class="jp-home-brief">${escapeHtml(highlight)}</p>

        <div class="jp-home-actions">
          <a class="jp-primary-btn" href="apps/journal/index.html?view=statistics">Buka Analitik Pro</a>
          <button type="button" class="jp-amy-btn" data-jp-home-amy>Evaluasi bareng Amy</button>
        </div>
      </div>
    `;

    container.querySelector("[data-jp-home-amy]")?.addEventListener("click", () => {
      askAmyWithPrompt("Evaluasi equity curve, max drawdown, profit factor, sesi terbaik, dan kebocoran kesalahan di jurnal trading saya.");
    });
  }

  function formatForAssistant(entries, options = {}) {
    const data = analyzePro(entries, options);
    const s = data.summary;
    const unit = data.unit;
    if (s.closedCount === 0) return null;

    const lines = [
      `**Analitik Jurnal Pro (${s.closedCount} Trade Tertutup${s.openCount ? ` · ${s.openCount} terbuka` : ""})**`,
      `• Hasil: **${s.wins} Win** · **${s.losses} Loss** · **${s.breakevens} BE** | Win Rate: **${s.winRate}%**`,
      `• Equity Net: **${formatValue(s.netValue, unit)}**${data.hasAnyMoney ? ` (${formatSignedR(s.netR)})` : ""}${s.returnPct != null ? ` · Return **${s.returnPct >= 0 ? "+" : ""}${s.returnPct}%**` : ""} | Profit Factor: **${formatProfitFactor(s.profitFactor)}** | Expectancy: **${formatValue(s.expectancy, unit)}/trade**`,
      `• Max Drawdown: **-${formatAbsValue(s.maxDrawdown, unit)}**${s.maxDrawdownPct != null ? ` (${s.maxDrawdownPct}%)` : ""} | Drawdown Aktif: **${s.currentDrawdown > 0 ? "-" + formatAbsValue(s.currentDrawdown, unit) : "Di puncak baru"}** | Streak: **${formatStreak(s.currentStreak)}** (Rekor +${s.bestWinStreak}W / -${s.worstLossStreak}L)`
    ];

    if (data.executionBrief.bestSession) {
      const bs = data.executionBrief.bestSession;
      const ws = data.executionBrief.worstSession;
      lines.push(
        `• Sesi (WITA): Terkuat **${bs.key}** (${formatValue(bs.net, unit)} · ${bs.winRate}% WR)` +
        (ws && ws.key !== bs.key ? ` | Terlemah **${ws.key}** (${formatValue(ws.net, unit)} · ${ws.winRate}% WR)` : "")
      );
    }

    if (data.executionBrief.bestSetup) {
      const st = data.executionBrief.bestSetup;
      lines.push(`• Setup Terkuat: **${st.key}** (${formatValue(st.net, unit)} · ${st.winRate}% WR dari ${st.total} trade)`);
    }

    if (data.breakdowns.byLeak.length) {
      const leakStr = data.breakdowns.byLeak
        .slice(0, 3)
        .map((l) => `${l.key} (${l.count}x${l.lossImpact > 0 ? `, rugi -${formatAbsValue(l.lossImpact, unit)}` : ""})`)
        .join(" · ");
      lines.push(`• **Kebocoran & Psikologi (Leak Cost):** ${leakStr}`);
    }

    return { data, text: lines.join("\n") };
  }

  root.AmyJournalAnalyticsPro = Object.freeze({
    normalizeResult,
    classifySession,
    extractLeaks,
    analyzePro,
    mountProAnalytics,
    renderHomeSnapshot,
    formatForAssistant,
    formatValue,
    formatAbsValue,
    formatSignedMoney,
    formatSignedR,
    formatProfitFactor,
    formatStreak
  });
})(typeof window !== "undefined" ? window : globalThis);
