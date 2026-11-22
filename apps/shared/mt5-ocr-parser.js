(function (globalScope) {
  "use strict";

  var DEFAULT_BROKER_OFFSET_HOURS = 5; // MT5 GMT+3 -> WITA (UTC+8)
  var SETTINGS_STORAGE_KEY = "amy_mt5_ocr_settings_v1";

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function round1(n) {
    return Math.round((Number(n) || 0) * 10) / 10;
  }

  function toNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (value == null) return null;
    var cleaned = String(value)
      .trim()
      .replace(/\s+/g, "")
      .replace(/[^\d.,+-]/g, "");
    if (!cleaned) return null;
    // Handle European/Indonesian decimal comma if no dot present (e.g. "-45,50")
    if (cleaned.indexOf(",") >= 0 && cleaned.indexOf(".") === -1) {
      cleaned = cleaned.replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
    var num = Number.parseFloat(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  function normalizeMt5Symbol(raw) {
    var s = String(raw || "").trim().toUpperCase();
    if (!s) return "XAU/USD";
    // Strip common broker suffixes (.c, .m, .pro, .ecn, .raw, .s, #, +, _)
    var core = s
      .replace(/[#+/_-]+$/g, "")
      .replace(/\.(C|M|S|PRO|ECN|RAW|STD|MICRO|CENT|MINI|I|Z|X)$/i, "")
      .replace(/(MICRO|CENT|MINI|PRO|ECN|RAW)$/i, "");
    if (/^(XAUUSD|GOLD|XAU\/USD|XAUUSDT)[A-Z0-9._-]{0,3}$/.test(core) || core.indexOf("XAUUSD") === 0 || core === "GOLD") {
      return "XAU/USD";
    }
    if (/^(XAGUSD|SILVER|XAG\/USD)[A-Z0-9._-]{0,3}$/.test(core)) {
      return "XAG/USD";
    }
    if (/^(BTCUSD|BTCUSDT|BTC\/USD)[A-Z0-9._-]{0,3}$/.test(core)) {
      return "BTC/USD";
    }
    // Strip single lowercase/uppercase trailing broker letter on 7-char FX symbols (e.g. EURUSDm, GBPUSDc)
    var fxMatch = s.match(/^([A-Z]{3})\/?([A-Z]{3})(?:[a-zA-Z._#+-]{0,4})?$/);
    if (fxMatch) {
      return fxMatch[1] + "/" + fxMatch[2];
    }
    return core || "XAU/USD";
  }

  function normalizeDirection(raw) {
    var s = String(raw || "").trim().toLowerCase();
    if (!s) return "";
    if (s.indexOf("buy") >= 0 || s === "long" || s === "b") return "Buy";
    if (s.indexOf("sell") >= 0 || s === "short" || s === "s") return "Sell";
    return "";
  }

  function classifyWitaSession(hour) {
    var h = Number(hour);
    if (!Number.isFinite(h)) return "";
    h = ((Math.floor(h) % 24) + 24) % 24;
    if (h >= 6 && h <= 13) return "Asia";
    if (h >= 14 && h <= 18) return "London";
    if (h >= 19 && h <= 23) return "NY AM";
    return "NY PM";
  }

  function pad2(n) {
    return String(Math.max(0, Math.floor(Number(n) || 0))).padStart(2, "0");
  }

  function formatDateYmd(dateObj) {
    return (
      dateObj.getUTCFullYear() +
      "-" +
      pad2(dateObj.getUTCMonth() + 1) +
      "-" +
      pad2(dateObj.getUTCDate())
    );
  }

  function parseMt5Timestamp(raw, offsetHours, fallbackDateYmd) {
    var fallback =
      typeof fallbackDateYmd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fallbackDateYmd)
        ? fallbackDateYmd
        : new Date().toISOString().slice(0, 10);
    var offset = Number.isFinite(Number(offsetHours)) ? Number(offsetHours) : DEFAULT_BROKER_OFFSET_HOURS;
    var text = String(raw || "").trim();
    if (!text) {
      return { date: fallback, timeWita: "", session: "" };
    }

    var year, month, day, hour = 0, minute = 0, hasTime = false;
    // Pattern 1: YYYY.MM.DD HH:MM(:SS) or YYYY-MM-DD HH:MM(:SS) or YYYY/MM/DD
    var m1 = text.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    // Pattern 2: DD.MM.YYYY HH:MM(:SS) or DD/MM/YYYY
    var m2 = !m1 && text.match(/(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    // Pattern 3: Time only HH:MM(:SS)
    var m3 = !m1 && !m2 && text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

    if (m1) {
      year = Number(m1[1]);
      month = Number(m1[2]);
      day = Number(m1[3]);
      if (m1[4] != null) {
        hour = Number(m1[4]);
        minute = Number(m1[5]);
        hasTime = true;
      }
    } else if (m2) {
      day = Number(m2[1]);
      month = Number(m2[2]);
      year = Number(m2[3]);
      if (m2[4] != null) {
        hour = Number(m2[4]);
        minute = Number(m2[5]);
        hasTime = true;
      }
    } else if (m3) {
      var parts = fallback.split("-").map(Number);
      year = parts[0];
      month = parts[1];
      day = parts[2];
      hour = Number(m3[1]);
      minute = Number(m3[2]);
      hasTime = true;
    } else {
      return { date: fallback, timeWita: "", session: "" };
    }

    if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return { date: fallback, timeWita: "", session: "" };
    }

    if (!hasTime) {
      return {
        date: year + "-" + pad2(month) + "-" + pad2(day),
        timeWita: "",
        session: ""
      };
    }

    var utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) + offset * 3600 * 1000;
    var shifted = new Date(utcMs);
    var witaHour = shifted.getUTCHours();
    var witaMinute = shifted.getUTCMinutes();
    return {
      date: formatDateYmd(shifted),
      timeWita: pad2(witaHour) + ":" + pad2(witaMinute),
      session: classifyWitaSession(witaHour)
    };
  }

  function computePips(market, direction, entryPrice, exitPrice) {
    if (!Number.isFinite(entryPrice) || !Number.isFinite(exitPrice) || !direction) return null;
    var dirSign = direction === "Sell" ? -1 : 1;
    var delta = (exitPrice - entryPrice) * dirSign;
    var sym = String(market || "").toUpperCase();
    if (sym === "XAU/USD" || sym === "XAG/USD") {
      // Standard XAU/USD scalper convention in Amy FX Pro: $1.00 = 10 pips
      return round1(delta * 10);
    }
    if (sym.indexOf("JPY") >= 0) {
      return round1(delta * 100);
    }
    if (sym === "BTC/USD") {
      return round1(delta);
    }
    return round1(delta * 10000);
  }

  function computeActualRR(entryPrice, exitPrice, slPrice, tpPrice) {
    if (!Number.isFinite(entryPrice) || !Number.isFinite(slPrice)) return null;
    var risk = Math.abs(entryPrice - slPrice);
    if (risk <= 0.00001) return null;
    var targetDist = Number.isFinite(exitPrice)
      ? Math.abs(exitPrice - entryPrice)
      : (Number.isFinite(tpPrice) ? Math.abs(tpPrice - entryPrice) : null);
    if (!Number.isFinite(targetDist) || targetDist <= 0) return null;
    var rr = targetDist / risk;
    if (!Number.isFinite(rr) || rr <= 0 || rr > 30) return null;
    return round2(rr);
  }

  function normalizeScannedTrade(raw, options) {
    var opts = options || {};
    var isCent = Boolean(opts.isCentAccount);
    var divisor = isCent ? 100 : 1;
    var brokerOffsetHours = Number.isFinite(Number(opts.brokerOffsetHours))
      ? Number(opts.brokerOffsetHours)
      : DEFAULT_BROKER_OFFSET_HOURS;
    var fallbackDate = opts.fallbackDate || new Date().toISOString().slice(0, 10);

    var entryType = String(raw && raw.entryType || "trade").trim().toLowerCase();
    if (entryType === "balance" || entryType === "deposit" || entryType === "withdrawal" || entryType === "credit") {
      return null;
    }

    var direction = normalizeDirection(raw && raw.direction);
    if (!direction) return null;

    var market = normalizeMt5Symbol(raw && raw.symbol);
    var lot = toNumber(raw && raw.lot);
    if (lot != null && lot <= 0) lot = null;

    var entryPrice = toNumber(raw && raw.entryPrice);
    var exitPrice = toNumber(raw && raw.exitPrice);
    var sl = toNumber(raw && raw.sl);
    var tp = toNumber(raw && raw.tp);

    var rawProfit = toNumber(raw && raw.profit);
    var rawSwap = toNumber(raw && raw.swap) || 0;
    var rawCommission = toNumber(raw && raw.commission) || 0;

    var netPnl = rawProfit != null ? round2((rawProfit + rawSwap + rawCommission) / divisor) : 0;
    var status = String(raw && raw.status || "closed").trim().toLowerCase();
    var isOpen = status === "open" || status === "running" || status === "floating";

    var result;
    if (isOpen) {
      result = "Belum selesai";
    } else if (rawProfit != null && Math.abs(netPnl) <= 0.25) {
      result = "BE";
    } else if (netPnl > 0) {
      result = "Win";
    } else if (netPnl < 0) {
      result = "Loss";
    } else {
      result = "BE";
    }

    var timeSource = (raw && (raw.closeTime || raw.openTime || raw.time)) || "";
    var parsedTime = parseMt5Timestamp(timeSource, brokerOffsetHours, fallbackDate);
    var openParsed = raw && raw.openTime ? parseMt5Timestamp(raw.openTime, brokerOffsetHours, parsedTime.date) : null;

    var pnlPips = computePips(market, direction, entryPrice, exitPrice);
    var riskReward = computeActualRR(entryPrice, exitPrice, sl, tp);
    var closeReason = String(raw && raw.closeReason || "").trim().toLowerCase();
    if (!closeReason && sl != null && exitPrice != null && Math.abs(exitPrice - sl) <= 0.35) {
      closeReason = "sl";
    } else if (!closeReason && tp != null && exitPrice != null && Math.abs(exitPrice - tp) <= 0.35) {
      closeReason = "tp";
    }

    var ticket = String(raw && raw.ticket || "").replace(/[^\w-]/g, "").slice(0, 32);

    return {
      tempId: "mt5-" + Math.random().toString(36).slice(2, 9),
      ticket: ticket,
      market: market,
      direction: direction,
      lot: lot != null ? round2(lot) : null,
      entryPrice: entryPrice != null ? round2(entryPrice) : null,
      exitPrice: exitPrice != null ? round2(exitPrice) : null,
      sl: sl != null ? round2(sl) : null,
      tp: tp != null ? round2(tp) : null,
      rawProfit: rawProfit != null ? round2(rawProfit) : null,
      rawSwap: round2(rawSwap),
      rawCommission: round2(rawCommission),
      pnlMoney: netPnl,
      profit: result === "Win" ? Math.abs(netPnl) : 0,
      loss: result === "Loss" ? Math.abs(netPnl) : 0,
      pnlPips: pnlPips,
      riskReward: riskReward,
      result: result,
      status: isOpen ? "open" : "closed",
      closeReason: closeReason,
      rawTime: String(timeSource || "").trim(),
      date: parsedTime.date,
      timeWita: parsedTime.timeWita,
      entryTimeWita: openParsed ? openParsed.timeWita : "",
      session: parsedTime.session,
      setup: "",
      mistakes: "",
      emotion: "",
      evaluation: "",
      selected: true,
      isDuplicate: false,
      sourceImageIndex: Number.isInteger(opts.sourceImageIndex) ? opts.sourceImageIndex : 0
    };
  }

  function buildDedupKey(entry) {
    if (!entry) return "";
    var ticket = String(entry.mt5Ticket || entry.ticket || "").trim();
    if (ticket) return "ticket:" + ticket;
    var date = String(entry.date || "").slice(0, 10);
    var market = normalizeMt5Symbol(entry.market || entry.pair || "");
    var dir = normalizeDirection(entry.direction);
    var pnl = round1(
      entry.pnlMoney != null
        ? Number(entry.pnlMoney)
        : (Number(entry.profit || 0) - Number(entry.loss || 0))
    );
    var lot = entry.lot != null && Number.isFinite(Number(entry.lot)) ? round2(entry.lot) : "";
    var exitPx = entry.exitPrice != null && Number.isFinite(Number(entry.exitPrice)) ? round1(entry.exitPrice) : "";
    var timeHint = String(entry.exitTime || entry.timeWita || "").slice(0, 5);
    return [date, market, dir, pnl, lot, exitPx, timeHint].join("|");
  }

  function annotateDuplicates(trades, existingJournals) {
    var existingKeys = new Set();
    var looseKeys = new Set();

    (Array.isArray(existingJournals) ? existingJournals : []).forEach(function (j) {
      if (!j) return;
      var k = buildDedupKey(j);
      if (k) existingKeys.add(k);
      // Secondary loose key for manually typed trades without lot/exitPrice/time
      var d = String(j.date || "").slice(0, 10);
      var m = normalizeMt5Symbol(j.market || j.pair || "");
      var dir = normalizeDirection(j.direction);
      var pnl = round1(j.pnlMoney != null ? Number(j.pnlMoney) : (Number(j.profit || 0) - Number(j.loss || 0)));
      if (d && m && dir && pnl !== 0) {
        looseKeys.add([d, m, dir, pnl].join("|"));
      }
    });

    var seenInBatch = new Set();
    return (Array.isArray(trades) ? trades : []).map(function (t) {
      var k = buildDedupKey(t);
      var loose = [t.date, t.market, t.direction, round1(t.pnlMoney)].join("|");
      var isDup = (k && (existingKeys.has(k) || seenInBatch.has(k))) || (t.pnlMoney !== 0 && looseKeys.has(loose));
      if (k) seenInBatch.add(k);
      return Object.assign({}, t, {
        isDuplicate: Boolean(isDup),
        selected: !isDup
      });
    });
  }

  function buildAutoNoteSummary(item) {
    var lines = [];
    var metaParts = [];
    if (item.lot != null) metaParts.push("Lot " + item.lot);
    if (item.entryPrice != null && item.exitPrice != null) {
      metaParts.push("Harga " + item.entryPrice.toFixed(2) + " → " + item.exitPrice.toFixed(2));
    } else if (item.entryPrice != null) {
      metaParts.push("Entry " + item.entryPrice.toFixed(2));
    }
    if (item.sl != null) metaParts.push("SL " + item.sl.toFixed(2));
    if (item.tp != null) metaParts.push("TP " + item.tp.toFixed(2));
    if (item.pnlPips != null) {
      metaParts.push((item.pnlPips > 0 ? "+" : "") + item.pnlPips + " pips");
    }
    if (item.timeWita) metaParts.push(item.timeWita + " WITA");
    if (item.ticket) metaParts.push("#" + item.ticket);
    if (metaParts.length) {
      lines.push("Scan MT5: " + metaParts.join(" · "));
    }
    if (item.evaluation) {
      lines.push(String(item.evaluation).trim());
    }
    return lines.join("\n");
  }

  function buildJournalEntryFromMt5(item, opts) {
    var options = opts || {};
    var now = options.now || new Date().toISOString();
    var accountMode = options.accountMode === "SIM" ? "SIM" : "REAL";
    var pnl = round2(item.pnlMoney || 0);
    var result = item.result || (pnl > 0 ? "Win" : pnl < 0 ? "Loss" : "BE");
    var profit = result === "Win" ? Math.abs(pnl) : 0;
    var loss = result === "Loss" ? Math.abs(pnl) : 0;
    var signedPnl = result === "Win" ? profit : result === "Loss" ? -loss : (result === "BE" ? 0 : pnl);
    var setup = String(item.setup || options.defaultSetup || "").trim();
    var mistakes = String(item.mistakes || options.defaultMistakes || "").trim();
    var dirUpper = item.direction ? item.direction.toUpperCase() : "TRADE";
    var titleParts = [dirUpper, item.market || "XAU/USD"];
    if (setup) titleParts.push(setup);
    else if (item.session) titleParts.push(item.session);

    return {
      id: typeof options.createId === "function" ? options.createId() : ("mt5-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7)),
      accountMode: accountMode,
      source: "mt5-ocr",
      mt5Ticket: item.ticket || "",
      date: item.date || now.slice(0, 10),
      title: titleParts.join(" · "),
      market: item.market || "XAU/USD",
      pair: item.market || "XAU/USD",
      direction: item.direction || "",
      session: item.session || "",
      setup: setup,
      result: result,
      profit: profit,
      loss: loss,
      pnlMoney: signedPnl,
      riskReward: item.riskReward != null && item.riskReward > 0 ? round2(item.riskReward) : null,
      lot: item.lot != null ? round2(item.lot) : null,
      entryPrice: item.entryPrice != null ? round2(item.entryPrice) : null,
      exitPrice: item.exitPrice != null ? round2(item.exitPrice) : null,
      sl: item.sl != null ? round2(item.sl) : null,
      tp: item.tp != null ? round2(item.tp) : null,
      pnlPips: item.pnlPips != null ? round1(item.pnlPips) : null,
      closeReason: item.closeReason || "",
      entryTime: item.entryTimeWita || "",
      exitTime: item.timeWita || "",
      evaluation: buildAutoNoteSummary(item),
      mistakes: mistakes,
      lessons: "",
      emotion: String(item.emotion || "").trim(),
      attachments: [],
      revisionHistory: [],
      createdAt: now,
      updatedAt: now
    };
  }

  function normalizeMt5ScanPayload(rawPayload, options) {
    var opts = options || {};
    var payload = rawPayload && typeof rawPayload === "object" ? rawPayload : {};
    var currency = String(payload.accountCurrency || "USD").trim().toUpperCase();
    var detectedCent = Boolean(payload.isCentAccount) || currency === "USC" || currency === "CENT" || currency === "USX";
    var useCent = typeof opts.isCentAccount === "boolean" ? opts.isCentAccount : detectedCent;
    var rawTrades = Array.isArray(payload.trades) ? payload.trades : [];
    var normalized = rawTrades
      .map(function (t) {
        return normalizeScannedTrade(t, Object.assign({}, opts, { isCentAccount: useCent }));
      })
      .filter(Boolean);

    return {
      accountCurrency: currency || "USD",
      detectedCent: detectedCent,
      isCentAccount: useCent,
      trades: normalized,
      notes: String(payload.notes || "").trim()
    };
  }

  function loadOcrSettings() {
    try {
      var raw = globalScope.localStorage && globalScope.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return { brokerOffsetHours: DEFAULT_BROKER_OFFSET_HOURS, isCentAccount: false };
      var parsed = JSON.parse(raw);
      return {
        brokerOffsetHours: Number.isFinite(Number(parsed.brokerOffsetHours))
          ? Number(parsed.brokerOffsetHours)
          : DEFAULT_BROKER_OFFSET_HOURS,
        isCentAccount: Boolean(parsed.isCentAccount)
      };
    } catch (_) {
      return { brokerOffsetHours: DEFAULT_BROKER_OFFSET_HOURS, isCentAccount: false };
    }
  }

  function saveOcrSettings(next) {
    try {
      if (!globalScope.localStorage) return;
      globalScope.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
        brokerOffsetHours: Number.isFinite(Number(next && next.brokerOffsetHours))
          ? Number(next.brokerOffsetHours)
          : DEFAULT_BROKER_OFFSET_HOURS,
        isCentAccount: Boolean(next && next.isCentAccount)
      }));
    } catch (_) {}
  }

  var api = {
    DEFAULT_BROKER_OFFSET_HOURS: DEFAULT_BROKER_OFFSET_HOURS,
    SETTINGS_STORAGE_KEY: SETTINGS_STORAGE_KEY,
    normalizeMt5Symbol: normalizeMt5Symbol,
    normalizeDirection: normalizeDirection,
    classifyWitaSession: classifyWitaSession,
    parseMt5Timestamp: parseMt5Timestamp,
    computePips: computePips,
    computeActualRR: computeActualRR,
    normalizeScannedTrade: normalizeScannedTrade,
    normalizeMt5ScanPayload: normalizeMt5ScanPayload,
    buildDedupKey: buildDedupKey,
    annotateDuplicates: annotateDuplicates,
    buildAutoNoteSummary: buildAutoNoteSummary,
    buildJournalEntryFromMt5: buildJournalEntryFromMt5,
    loadOcrSettings: loadOcrSettings,
    saveOcrSettings: saveOcrSettings
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (globalScope) {
    globalScope.AmyMt5Ocr = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
