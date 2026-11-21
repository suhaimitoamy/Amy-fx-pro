"use strict";

(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.AmyAccountSimEngine = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  const CONTRACT_SIZE_XAU = 100; // 1.00 lot XAU/USD Pro = 100 oz ($1 move = $100)
  const PIPS_PER_DOLLAR = 10;    // XAU/USD standard: $1.00 = 10 pips
  const WITA_OFFSET_MS = 8 * 60 * 60 * 1000;

  const STORAGE_KEYS = Object.freeze({
    baseBalance: "amy_default_balance",
    riskPct: "amy_default_risk",
    currency: "amy_account_currency",
    usdIdrRate: "amy_usd_idr_rate",
    leverage: "amy_account_leverage",
    spreadUsd: "amy_account_spread",
    positions: "amy_sim_positions_v1",
    cashflows: "amy_sim_cashflows_v1",
    activeMode: "amy_account_view_mode_v1"
  });

  const DEFAULT_PARAMS = Object.freeze({
    baseBalanceUsd: 5000,
    riskPct: 1.5,
    currency: "IDR",
    usdIdrRate: 16500,
    leverage: 500,
    spreadUsd: 0.20
  });

  function round2(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return 0;
    return Math.round(v * 100) / 100;
  }

  function round1(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return 0;
    return Math.round(v * 10) / 10;
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function getWitaDateString(inputMs = Date.now()) {
    const ms = Number.isFinite(Number(inputMs)) ? Number(inputMs) : Date.now();
    return new Date(ms + WITA_OFFSET_MS).toISOString().slice(0, 10);
  }

  function getWitaSessionLabel(inputMs = Date.now()) {
    const ms = Number.isFinite(Number(inputMs)) ? Number(inputMs) : Date.now();
    const hour = new Date(ms + WITA_OFFSET_MS).getUTCHours();
    if (hour >= 7 && hour <= 14) return "Asia";
    if (hour >= 15 && hour <= 19) return "London";
    if (hour >= 20 || hour === 0) return "NY AM";
    return "NY PM";
  }

  function sanitizeParams(raw = {}) {
    const baseRaw = Number(raw.baseBalanceUsd ?? raw.balance);
    const riskRaw = Number(raw.riskPct ?? raw.risk);
    const rateRaw = Number(raw.usdIdrRate);
    const levRaw = Number(raw.leverage);
    const spreadHasVal = raw.spreadUsd !== undefined && raw.spreadUsd !== null && String(raw.spreadUsd).trim() !== "";
    const spreadRaw = spreadHasVal ? Number(raw.spreadUsd) : NaN;
    const curRaw = String(raw.currency || DEFAULT_PARAMS.currency).toUpperCase();

    return {
      baseBalanceUsd: Number.isFinite(baseRaw) && baseRaw > 0 ? round2(baseRaw) : DEFAULT_PARAMS.baseBalanceUsd,
      riskPct: Number.isFinite(riskRaw) && riskRaw > 0 ? clamp(round2(riskRaw), 0.1, 25) : DEFAULT_PARAMS.riskPct,
      currency: curRaw === "USD" ? "USD" : "IDR",
      usdIdrRate: Number.isFinite(rateRaw) && rateRaw >= 1000 ? Math.round(rateRaw) : DEFAULT_PARAMS.usdIdrRate,
      leverage: Number.isFinite(levRaw) && levRaw >= 10 ? Math.round(levRaw) : DEFAULT_PARAMS.leverage,
      spreadUsd: Number.isFinite(spreadRaw) && spreadRaw >= 0 ? clamp(round2(spreadRaw), 0, 5) : DEFAULT_PARAMS.spreadUsd
    };
  }

  function readParams(storage) {
    const store = storage || (typeof localStorage !== "undefined" ? localStorage : null);
    if (!store) return { ...DEFAULT_PARAMS };
    try {
      return sanitizeParams({
        baseBalanceUsd: store.getItem(STORAGE_KEYS.baseBalance),
        riskPct: store.getItem(STORAGE_KEYS.riskPct),
        currency: store.getItem(STORAGE_KEYS.currency) || DEFAULT_PARAMS.currency,
        usdIdrRate: store.getItem(STORAGE_KEYS.usdIdrRate),
        leverage: store.getItem(STORAGE_KEYS.leverage),
        spreadUsd: store.getItem(STORAGE_KEYS.spreadUsd)
      });
    } catch {
      return { ...DEFAULT_PARAMS };
    }
  }

  function saveParams(partial = {}, storage) {
    const store = storage || (typeof localStorage !== "undefined" ? localStorage : null);
    const current = readParams(store);
    const next = sanitizeParams({ ...current, ...partial });
    if (store) {
      try {
        store.setItem(STORAGE_KEYS.baseBalance, String(next.baseBalanceUsd));
        store.setItem(STORAGE_KEYS.riskPct, String(next.riskPct));
        store.setItem(STORAGE_KEYS.currency, next.currency);
        store.setItem(STORAGE_KEYS.usdIdrRate, String(next.usdIdrRate));
        store.setItem(STORAGE_KEYS.leverage, String(next.leverage));
        store.setItem(STORAGE_KEYS.spreadUsd, String(next.spreadUsd));
      } catch (_) {}
    }
    return next;
  }

  function readJsonArray(key, storage) {
    const store = storage || (typeof localStorage !== "undefined" ? localStorage : null);
    if (!store) return [];
    try {
      const parsed = JSON.parse(store.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeJsonArray(key, list, storage) {
    const store = storage || (typeof localStorage !== "undefined" ? localStorage : null);
    const safe = Array.isArray(list) ? list : [];
    if (store) {
      try {
        store.setItem(key, JSON.stringify(safe));
      } catch (_) {}
    }
    return safe;
  }

  function readPositions(storage) {
    return readJsonArray(STORAGE_KEYS.positions, storage).filter(
      (p) => p && (p.side === "BUY" || p.side === "SELL") && Number(p.lot) > 0 && Number(p.entryPrice) > 0
    );
  }

  function savePositions(positions, storage) {
    return writeJsonArray(STORAGE_KEYS.positions, positions, storage);
  }

  function readCashflows(storage) {
    return readJsonArray(STORAGE_KEYS.cashflows, storage).filter(
      (c) => c && Number.isFinite(Number(c.amountUsd)) && Number(c.amountUsd) !== 0
    );
  }

  function saveCashflows(cashflows, storage) {
    return writeJsonArray(STORAGE_KEYS.cashflows, cashflows, storage);
  }

  function addCashflow({ type = "deposit", amountUsd, note = "", nowMs = Date.now() }, storage) {
    const raw = Math.abs(Number(amountUsd) || 0);
    if (!Number.isFinite(raw) || raw <= 0) return null;
    const signedUsd = type === "withdraw" ? -round2(raw) : round2(raw);
    const entry = {
      id: `cf_${nowMs}_${Math.random().toString(36).slice(2, 7)}`,
      type: type === "withdraw" ? "withdraw" : "deposit",
      amountUsd: signedUsd,
      note: String(note || "").trim(),
      at: new Date(nowMs).toISOString()
    };
    const next = [...readCashflows(storage), entry];
    saveCashflows(next, storage);
    return entry;
  }

  function getEntryAccountMode(entry) {
    const raw = String(entry?.accountMode || "").trim().toUpperCase();
    if (raw === "SIM" || raw === "SIMULASI" || raw === "PAPER") return "SIM";
    if (entry?.source === "sim-cockpit") return "SIM";
    return "REAL";
  }

  function filterJournalsByMode(journals, mode = "all") {
    const list = Array.isArray(journals) ? journals : [];
    const m = String(mode || "all").trim().toUpperCase();
    if (m === "ALL" || m === "SEMUA") return list;
    if (m === "SIM" || m === "SIMULASI") {
      return list.filter((entry) => getEntryAccountMode(entry) === "SIM");
    }
    if (m === "REAL") {
      return list.filter((entry) => getEntryAccountMode(entry) !== "SIM");
    }
    return list;
  }

  function resolveJournalNetUsd(entry) {
    if (!entry) return 0;
    if (entry.pnlMoney !== undefined && entry.pnlMoney !== null && entry.pnlMoney !== "") {
      const n = Number(entry.pnlMoney);
      if (Number.isFinite(n)) return n;
    }
    const profit = Math.abs(Number(entry.profit) || 0);
    const loss = Math.abs(Number(entry.loss) || 0);
    return round2(profit - loss);
  }

  function isClosedJournal(entry) {
    const res = String(entry?.result || entry?.outcome || "").trim().toUpperCase();
    return res === "WIN" || res === "PROFIT" || res === "LOSS" || res === "RUGI" || res === "BE" || res === "BREAKEVEN" || res === "BREAK EVEN";
  }

  function suggestAutoLot({ balanceUsd, riskPct, slDistanceUsd }) {
    const bal = Number(balanceUsd) || 0;
    const risk = Number(riskPct) || 0;
    const slDist = Math.abs(Number(slDistanceUsd) || 0);
    if (bal <= 0 || risk <= 0 || slDist <= 0) return 0.01;
    const riskMoney = (bal * risk) / 100;
    const rawLot = riskMoney / (slDist * CONTRACT_SIZE_XAU);
    return clamp(round2(rawLot), 0.01, 50);
  }

  function calculateRequiredMarginUsd({ lot, entryPrice, leverage = DEFAULT_PARAMS.leverage }) {
    const l = Number(lot) || 0;
    const p = Number(entryPrice) || 0;
    const lev = Number(leverage) > 0 ? Number(leverage) : DEFAULT_PARAMS.leverage;
    if (l <= 0 || p <= 0) return 0;
    return round2((l * CONTRACT_SIZE_XAU * p) / lev);
  }

  function openPosition({
    side,
    marketPrice,
    lot,
    sl = null,
    tp = null,
    spreadUsd = DEFAULT_PARAMS.spreadUsd,
    setup = "",
    note = "",
    nowMs = Date.now()
  }) {
    const dir = String(side || "").toUpperCase() === "SELL" ? "SELL" : "BUY";
    const price = Number(marketPrice);
    const size = round2(Number(lot));
    const spread = Math.max(0, Number(spreadUsd) || 0);

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Harga XAU/USD belum tersedia.");
    }
    if (!Number.isFinite(size) || size < 0.01 || size > 50) {
      throw new Error("Ukuran lot harus antara 0.01 hingga 50.00.");
    }

    const halfSpread = spread / 2;
    const entryPrice = round2(dir === "BUY" ? price + halfSpread : price - halfSpread);

    const parsedSl = sl !== null && sl !== "" && Number.isFinite(Number(sl)) && Number(sl) > 0 ? round2(Number(sl)) : null;
    const parsedTp = tp !== null && tp !== "" && Number.isFinite(Number(tp)) && Number(tp) > 0 ? round2(Number(tp)) : null;

    if (parsedSl !== null) {
      if (dir === "BUY" && parsedSl >= entryPrice) {
        throw new Error("Stop Loss BUY harus lebih rendah dari harga entry.");
      }
      if (dir === "SELL" && parsedSl <= entryPrice) {
        throw new Error("Stop Loss SELL harus lebih tinggi dari harga entry.");
      }
    }
    if (parsedTp !== null) {
      if (dir === "BUY" && parsedTp <= entryPrice) {
        throw new Error("Take Profit BUY harus lebih tinggi dari harga entry.");
      }
      if (dir === "SELL" && parsedTp >= entryPrice) {
        throw new Error("Take Profit SELL harus lebih rendah dari harga entry.");
      }
    }

    return {
      id: `simpos_${nowMs}_${Math.random().toString(36).slice(2, 7)}`,
      symbol: "XAU/USD",
      side: dir,
      lot: size,
      entryPrice,
      rawMarketPrice: round2(price),
      spreadUsd: round2(spread),
      sl: parsedSl,
      tp: parsedTp,
      setup: String(setup || "").trim(),
      note: String(note || "").trim(),
      openedAt: new Date(nowMs).toISOString()
    };
  }

  function evaluatePosition(pos, marketPrice, params = DEFAULT_PARAMS) {
    const safeParams = sanitizeParams(params);
    const price = Number(marketPrice);
    const hasLive = Number.isFinite(price) && price > 0;
    const spread = Number.isFinite(Number(pos?.spreadUsd)) ? Number(pos.spreadUsd) : safeParams.spreadUsd;
    const halfSpread = spread / 2;

    const markPrice = hasLive ? price : Number(pos?.rawMarketPrice || pos?.entryPrice || 0);
    const exitPrice = pos.side === "BUY"
      ? round2(markPrice - halfSpread)
      : round2(markPrice + halfSpread);

    const priceDiff = pos.side === "BUY"
      ? exitPrice - pos.entryPrice
      : pos.entryPrice - exitPrice;

    const pips = round1(priceDiff * PIPS_PER_DOLLAR);
    const pnlUsd = round2(priceDiff * pos.lot * CONTRACT_SIZE_XAU);
    const pnlIdr = Math.round(pnlUsd * safeParams.usdIdrRate);
    const marginUsd = calculateRequiredMarginUsd({
      lot: pos.lot,
      entryPrice: pos.entryPrice,
      leverage: safeParams.leverage
    });

    let hitTrigger = null;
    if (hasLive) {
      if (pos.sl !== null && Number.isFinite(Number(pos.sl))) {
        if ((pos.side === "BUY" && exitPrice <= pos.sl) || (pos.side === "SELL" && exitPrice >= pos.sl)) {
          hitTrigger = "SL";
        }
      }
      if (!hitTrigger && pos.tp !== null && Number.isFinite(Number(pos.tp))) {
        if ((pos.side === "BUY" && exitPrice >= pos.tp) || (pos.side === "SELL" && exitPrice <= pos.tp)) {
          hitTrigger = "TP";
        }
      }
    }

    return {
      ...pos,
      markPrice: round2(markPrice),
      exitPrice,
      pips,
      pnlUsd,
      pnlIdr,
      marginUsd,
      hitTrigger
    };
  }

  function buildClosedJournalRecord(pos, closeMarketPrice, reason = "MANUAL", params = DEFAULT_PARAMS, nowMs = Date.now()) {
    const safeParams = sanitizeParams(params);
    const spread = Number.isFinite(Number(pos?.spreadUsd)) ? Number(pos.spreadUsd) : safeParams.spreadUsd;
    const halfSpread = spread / 2;

    let exitPrice;
    if (reason === "TP" && Number.isFinite(Number(pos.tp))) {
      exitPrice = round2(pos.tp);
    } else if (reason === "SL" && Number.isFinite(Number(pos.sl))) {
      exitPrice = round2(pos.sl);
    } else {
      const mkt = Number(closeMarketPrice);
      const validMkt = Number.isFinite(mkt) && mkt > 0 ? mkt : pos.entryPrice;
      exitPrice = pos.side === "BUY" ? round2(validMkt - halfSpread) : round2(validMkt + halfSpread);
    }

    const priceDiff = pos.side === "BUY"
      ? exitPrice - pos.entryPrice
      : pos.entryPrice - exitPrice;
    const pnlPips = round1(priceDiff * PIPS_PER_DOLLAR);
    const pnlUsd = round2(priceDiff * pos.lot * CONTRACT_SIZE_XAU);

    let result = "BE";
    if (pnlUsd > 0.05) result = "Win";
    else if (pnlUsd < -0.05) result = "Loss";

    const slDist = pos.sl !== null && Number.isFinite(Number(pos.sl))
      ? Math.abs(pos.entryPrice - Number(pos.sl))
      : 0;
    const riskMoney = slDist > 0 ? round2(slDist * pos.lot * CONTRACT_SIZE_XAU) : 0;
    const riskReward = riskMoney > 0 && pnlUsd > 0 ? round2(pnlUsd / riskMoney) : null;

    const nowIso = new Date(nowMs).toISOString();
    const dateStr = getWitaDateString(nowMs);
    const session = getWitaSessionLabel(nowMs);
    const reasonLabel = reason === "TP"
      ? "Auto Take Profit"
      : reason === "SL"
      ? "Auto Stop Loss"
      : "Tutup Manual";

    const setupLabel = pos.setup || "Simulasi Pro";
    const title = `${pos.side} ${pos.symbol || "XAU/USD"} ${pos.lot.toFixed(2)} lot · ${setupLabel}`;

    const evalLines = [
      `Akun Simulasi Pro (${reasonLabel})`,
      `Entry ${pos.entryPrice.toFixed(2)} → Exit ${exitPrice.toFixed(2)} (${pnlPips >= 0 ? "+" : ""}${pnlPips.toFixed(1)} pips)`,
      pos.sl ? `SL ${Number(pos.sl).toFixed(2)}` : null,
      pos.tp ? `TP ${Number(pos.tp).toFixed(2)}` : null,
      pos.note || null
    ].filter(Boolean);

    return {
      id: `sim_${nowMs}_${Math.random().toString(36).slice(2, 7)}`,
      accountMode: "SIM",
      source: "sim-cockpit",
      positionId: pos.id,
      date: dateStr,
      title,
      market: pos.symbol || "XAU/USD",
      pair: pos.symbol || "XAU/USD",
      direction: pos.side === "BUY" ? "Buy" : "Sell",
      session,
      setup: setupLabel,
      result,
      profit: pnlUsd > 0 ? pnlUsd : 0,
      loss: pnlUsd < 0 ? Math.abs(pnlUsd) : 0,
      pnlMoney: pnlUsd,
      pnlPips,
      riskMoney: riskMoney || undefined,
      riskReward,
      lot: pos.lot,
      entryPrice: pos.entryPrice,
      exitPrice,
      sl: pos.sl,
      tp: pos.tp,
      closeReason: reason,
      evaluation: evalLines.join(" · "),
      mistakes: "",
      lessons: "",
      emotion: "",
      attachments: [],
      revisionHistory: [],
      entryTime: pos.openedAt || nowIso,
      exitTime: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso
    };
  }

  function computeAccountSnapshot({
    params = DEFAULT_PARAMS,
    cashflows = [],
    journals = [],
    openPositions = [],
    marketPrice = null,
    nowMs = Date.now()
  } = {}) {
    const safeParams = sanitizeParams(params);
    const todayWita = getWitaDateString(nowMs);

    const cashflowTotalUsd = round2(
      (Array.isArray(cashflows) ? cashflows : []).reduce((acc, item) => acc + (Number(item?.amountUsd) || 0), 0)
    );
    const initialCapitalUsd = Math.max(0, round2(safeParams.baseBalanceUsd + cashflowTotalUsd));

    const simJournals = filterJournalsByMode(journals, "SIM");
    const closedSim = simJournals.filter(isClosedJournal);

    let realizedAllUsd = 0;
    let todayRealizedUsd = 0;
    let tpCount = 0;
    let slCount = 0;
    let beCount = 0;
    let netPipsClosed = 0;

    for (const entry of closedSim) {
      const net = resolveJournalNetUsd(entry);
      realizedAllUsd += net;

      const res = String(entry.result || entry.outcome || "").trim().toUpperCase();
      if (res === "WIN" || res === "PROFIT") tpCount += 1;
      else if (res === "LOSS" || res === "RUGI") slCount += 1;
      else if (res === "BE" || res === "BREAKEVEN" || res === "BREAK EVEN") beCount += 1;

      const pips = Number(entry.pnlPips ?? entry.pips);
      if (Number.isFinite(pips)) netPipsClosed += pips;

      const entryDate = String(entry.date || "").slice(0, 10) ||
        (entry.exitTime ? getWitaDateString(Date.parse(entry.exitTime)) : "");
      if (entryDate === todayWita) {
        todayRealizedUsd += net;
      }
    }

    realizedAllUsd = round2(realizedAllUsd);
    todayRealizedUsd = round2(todayRealizedUsd);

    const evaluatedPositions = (Array.isArray(openPositions) ? openPositions : []).map((pos) =>
      evaluatePosition(pos, marketPrice, safeParams)
    );

    const floatingUsd = round2(evaluatedPositions.reduce((acc, p) => acc + p.pnlUsd, 0));
    const floatingPips = round1(evaluatedPositions.reduce((acc, p) => acc + p.pips, 0));
    const marginUsd = round2(evaluatedPositions.reduce((acc, p) => acc + p.marginUsd, 0));

    const balanceUsd = round2(initialCapitalUsd + realizedAllUsd);
    const equityUsd = round2(balanceUsd + floatingUsd);
    const freeMarginUsd = round2(equityUsd - marginUsd);
    const todayTotalUsd = round2(todayRealizedUsd + floatingUsd);

    const decided = tpCount + slCount;
    const winRate = decided > 0 ? Math.round((tpCount / decided) * 100) : 0;
    const floatingPct = balanceUsd > 0 ? round2((floatingUsd / balanceUsd) * 100) : 0;
    const returnPct = initialCapitalUsd > 0 ? round2((realizedAllUsd / initialCapitalUsd) * 100) : 0;
    const riskPerTradeUsd = round2((Math.max(balanceUsd, 0) * safeParams.riskPct) / 100);

    return {
      params: safeParams,
      todayWita,
      initialCapitalUsd,
      cashflowTotalUsd,
      realizedAllUsd,
      balanceUsd,
      floatingUsd,
      floatingPips,
      floatingPct,
      equityUsd,
      marginUsd,
      freeMarginUsd,
      todayRealizedUsd,
      todayTotalUsd,
      returnPct,
      riskPerTradeUsd,
      tpCount,
      slCount,
      beCount,
      closedCount: closedSim.length,
      winRate,
      netPipsClosed: round1(netPipsClosed),
      netPipsTotal: round1(netPipsClosed + floatingPips),
      positions: evaluatedPositions
    };
  }

  function formatIdr(idrAmount, { signed = false, compact = false } = {}) {
    const val = Math.round(Number(idrAmount) || 0);
    const abs = Math.abs(val);
    const sign = val < 0 ? "-" : (signed && val > 0 ? "+" : "");
    if (compact) {
      if (abs >= 1e9) return `${sign}Rp ${(abs / 1e9).toFixed(2).replace(".", ",")}M`;
      if (abs >= 1e6) return `${sign}Rp ${(abs / 1e6).toFixed(abs >= 1e7 ? 1 : 2).replace(".", ",")}jt`;
      if (abs >= 1e3) return `${sign}Rp ${Math.round(abs / 1e3)}rb`;
    }
    const formatted = abs.toLocaleString("id-ID");
    return `${sign}Rp${formatted}`;
  }

  function formatUsd(usdAmount, { signed = false, compact = false } = {}) {
    const val = round2(Number(usdAmount) || 0);
    const abs = Math.abs(val);
    const sign = val < 0 ? "-" : (signed && val > 0 ? "+" : "");
    if (compact && abs >= 1000) {
      return `${sign}$${(abs / 1000).toFixed(1)}k`;
    }
    const formatted = abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${sign}$${formatted}`;
  }

  function formatMoney(usdAmount, options = {}) {
    const currency = String(options.currency || DEFAULT_PARAMS.currency).toUpperCase();
    const rate = Number(options.usdIdrRate) >= 1000 ? Number(options.usdIdrRate) : DEFAULT_PARAMS.usdIdrRate;
    if (currency === "USD") {
      return formatUsd(usdAmount, options);
    }
    return formatIdr((Number(usdAmount) || 0) * rate, options);
  }

  function formatPips(pips, { signed = true } = {}) {
    const val = round1(Number(pips) || 0);
    const sign = val < 0 ? "-" : (signed && val > 0 ? "+" : "");
    const abs = Math.abs(val);
    const str = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
    return `${sign}${str}p`;
  }

  return Object.freeze({
    CONTRACT_SIZE_XAU,
    PIPS_PER_DOLLAR,
    STORAGE_KEYS,
    DEFAULT_PARAMS,
    getWitaDateString,
    getWitaSessionLabel,
    sanitizeParams,
    readParams,
    saveParams,
    readPositions,
    savePositions,
    readCashflows,
    saveCashflows,
    addCashflow,
    getEntryAccountMode,
    filterJournalsByMode,
    resolveJournalNetUsd,
    isClosedJournal,
    suggestAutoLot,
    calculateRequiredMarginUsd,
    openPosition,
    evaluatePosition,
    buildClosedJournalRecord,
    computeAccountSnapshot,
    formatIdr,
    formatUsd,
    formatMoney,
    formatPips
  });
});
