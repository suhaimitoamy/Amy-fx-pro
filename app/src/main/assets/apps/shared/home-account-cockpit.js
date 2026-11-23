"use strict";

(function () {
  if (window.__amyFxHomeAccountCockpitInstalled) return;
  window.__amyFxHomeAccountCockpitInstalled = true;

  const DB_NAME = "tradingLibraryManager.files";
  const DB_VERSION = 2;
  const META_STORE = "metadata";
  const FILE_STORE = "files";
  const JOURNALS_RECORD = "journals.v2";
  const LEGACY_JOURNAL_KEY = "tradingLibraryManager.journals.v1";

  let cachedJournals = [];
  let lastSnapshot = null;
  let orderDialog = null;
  let orderSide = "BUY";
  let autoCloseBusy = false;
  let guardEditorOpen = false;

  function engine() {
    return window.AmyAccountSimEngine;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[ch]));
  }

  function isMarketOpenNow() {
    if (typeof window.AmyHomeChart?.isGoldMarketOpen === "function") {
      return window.AmyHomeChart.isGoldMarketOpen(Date.now() / 1000);
    }
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hourCycle: "h23",
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short"
      }).formatToParts(new Date());
      const values = Object.fromEntries(parts.map((x) => [x.type, x.value]));
      const weekday = values.weekday;
      const hour = Number(values.hour) + Number(values.minute) / 60;
      if (weekday === "Sat") return false;
      if (weekday === "Sun") return hour >= 17;
      if (weekday === "Fri") return hour < 17;
      if (hour >= 17 && hour < 18) return false;
      return true;
    } catch (_) {
      return true;
    }
  }

  function getLiveMarketPrice() {
    const direct = Number(window.amyfxCurrentPrice);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const domPrice = Number(document.getElementById("home-chart-price")?.textContent?.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(domPrice) && domPrice > 0) return domPrice;
    try {
      for (const tf of ["M15", "M5"]) {
        const raw = localStorage.getItem(`amyfx.mapping.candles.${tf}`);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const last = Array.isArray(parsed?.values) ? parsed.values[parsed.values.length - 1] : null;
        const close = Number(last?.close);
        if (Number.isFinite(close) && close > 0) return close;
      }
    } catch (_) {}
    return null;
  }

  function openJournalDb() {
    return new Promise((resolve) => {
      if (!("indexedDB" in window)) return resolve(null);
      let settled = false;
      const finish = (db) => {
        if (settled) { db?.close?.(); return; }
        settled = true;
        resolve(db || null);
      };
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(FILE_STORE)) db.createObjectStore(FILE_STORE, { keyPath: "id" });
          if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE, { keyPath: "id" });
        };
        req.onsuccess = () => finish(req.result);
        req.onerror = () => finish(null);
        req.onblocked = () => finish(null);
        setTimeout(() => finish(null), 2200);
      } catch (_) {
        finish(null);
      }
    });
  }

  async function readAllJournals() {
    let legacy = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(LEGACY_JOURNAL_KEY) || "[]");
      if (Array.isArray(parsed)) legacy = parsed;
    } catch (_) {}

    const db = await openJournalDb();
    if (!db) {
      cachedJournals = legacy;
      return legacy;
    }
    if (!db.objectStoreNames.contains(META_STORE)) {
      db.close();
      cachedJournals = legacy;
      return legacy;
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = (rows) => {
        if (settled) return;
        settled = true;
        try { db.close(); } catch (_) {}
        cachedJournals = rows;
        resolve(rows);
      };
      try {
        const tx = db.transaction(META_STORE, "readonly");
        const req = tx.objectStore(META_STORE).get(JOURNALS_RECORD);
        req.onsuccess = () => {
          const val = req.result?.value;
          finish(Array.isArray(val) ? val : legacy);
        };
        req.onerror = () => finish(legacy);
        tx.onerror = () => finish(legacy);
        tx.onabort = () => finish(legacy);
      } catch (_) {
        finish(legacy);
      }
      setTimeout(() => finish(legacy), 2200);
    });
  }

  async function writeAllJournals(rows) {
    const safe = Array.isArray(rows) ? rows : [];
    cachedJournals = safe;
    try {
      localStorage.setItem(LEGACY_JOURNAL_KEY, JSON.stringify(safe));
    } catch (_) {}

    const db = await openJournalDb();
    if (db && db.objectStoreNames.contains(META_STORE)) {
      await new Promise((resolve) => {
        try {
          const tx = db.transaction(META_STORE, "readwrite");
          tx.objectStore(META_STORE).put({
            id: JOURNALS_RECORD,
            value: safe,
            updatedAt: new Date().toISOString()
          });
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
          tx.onabort = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
      try { db.close(); } catch (_) {}
    }

    try {
      window.dispatchEvent(new CustomEvent("amyfx:journal-state-change", { detail: { count: safe.length } }));
    } catch (_) {}
  }

  async function appendSimJournalRecord(record) {
    const current = await readAllJournals();
    if (current.some((r) => r?.id === record.id || (record.positionId && r?.positionId === record.positionId))) {
      return current;
    }
    const next = [record, ...current];
    await writeAllJournals(next);
    return next;
  }

  async function resetSimulationAccount() {
    const sim = engine();
    if (!sim) return { removedTrades: 0, removedSimCount: 0, keptRealCount: 0 };
    sim.savePositions([]);
    sim.saveCashflows([]);
    const current = await readAllJournals();
    const realOnly = current.filter((entry) => sim.getEntryAccountMode(entry) !== "SIM");
    const removedTrades = current.length - realOnly.length;
    await writeAllJournals(realOnly);
    try {
      window.dispatchEvent(new CustomEvent("amyfx:sim-state-change", { detail: { reset: true } }));
    } catch (_) {}
    renderCockpit();
    return {
      removedTrades,
      removedSimCount: removedTrades,
      keptRealCount: realOnly.length
    };
  }

  function broadcastChartLines(snap) {
    if (!snap) return;
    const sim = engine();
    if (!sim) return;
    const lines = snap.positions.map((pos) => ({
      id: pos.id,
      side: pos.side,
      lot: pos.lot,
      entryPrice: pos.entryPrice,
      sl: pos.sl,
      tp: pos.tp,
      pnlUsd: pos.pnlUsd,
      pnlText: sim.formatMoney(pos.pnlUsd, {
        currency: snap.params.currency,
        usdIdrRate: snap.params.usdIdrRate,
        signed: true
      }),
      pipsText: sim.formatPips(pos.pips)
    }));
    try {
      window.dispatchEvent(new CustomEvent("amyfx:sim-positions-updated", { detail: { positions: lines } }));
    } catch (_) {}
  }

  async function closePositionById(posId, reason = "MANUAL") {
    const sim = engine();
    if (!sim) return;
    const positions = sim.readPositions();
    const target = positions.find((p) => p.id === posId);
    if (!target) return;

    const remaining = positions.filter((p) => p.id !== posId);
    sim.savePositions(remaining);

    const price = getLiveMarketPrice() || target.rawMarketPrice || target.entryPrice;
    const params = sim.readParams();
    const record = sim.buildClosedJournalRecord(target, price, reason, params, Date.now());
    await appendSimJournalRecord(record);

    const pnlFormatted = sim.formatMoney(record.pnlMoney, {
      currency: params.currency,
      usdIdrRate: params.usdIdrRate,
      signed: true
    });
    const reasonText = reason === "TP"
      ? "Take Profit tersentuh"
      : reason === "SL"
      ? "Stop Loss tersentuh"
      : "Posisi ditutup";
    window.showToast?.(`${reasonText} · ${pnlFormatted} (${sim.formatPips(record.pnlPips)})`);

    try {
      window.dispatchEvent(new CustomEvent("amyfx:sim-state-change", { detail: { closedId: posId } }));
    } catch (_) {}
    renderCockpit();
  }

  async function closeAllPositions() {
    const sim = engine();
    if (!sim) return;
    const positions = sim.readPositions();
    if (!positions.length) return;
    const price = getLiveMarketPrice();
    const params = sim.readParams();
    sim.savePositions([]);

    const current = await readAllJournals();
    const newRecords = [];
    let totalUsd = 0;
    const baseNow = Date.now();
    positions.forEach((pos, idx) => {
      const rec = sim.buildClosedJournalRecord(pos, price || pos.rawMarketPrice || pos.entryPrice, "MANUAL", params, baseNow + idx);
      totalUsd += rec.pnlMoney;
      newRecords.push(rec);
    });
    await writeAllJournals([...newRecords, ...current]);

    const totalFormatted = sim.formatMoney(totalUsd, {
      currency: params.currency,
      usdIdrRate: params.usdIdrRate,
      signed: true
    });
    window.showToast?.(`${positions.length} posisi ditutup · Total ${totalFormatted}`);
    try {
      window.dispatchEvent(new CustomEvent("amyfx:sim-state-change", { detail: { closedAll: true } }));
    } catch (_) {}
    renderCockpit();
  }

  async function checkAutoTpSl(snap) {
    if (autoCloseBusy || !isMarketOpenNow() || !snap?.positions?.length) return;
    const triggered = snap.positions.filter((p) => p.hitTrigger === "TP" || p.hitTrigger === "SL");
    if (!triggered.length) return;
    autoCloseBusy = true;
    try {
      for (const pos of triggered) {
        await closePositionById(pos.id, pos.hitTrigger);
      }
    } finally {
      autoCloseBusy = false;
    }
  }

  function toneClass(val) {
    const n = Number(val) || 0;
    if (n > 0.004) return "acc-pos";
    if (n < -0.004) return "acc-neg";
    return "acc-flat";
  }

  function renderCockpit() {
    const sim = engine();
    if (!sim) return;

    const params = sim.readParams();
    const cashflows = sim.readCashflows();
    const positions = sim.readPositions();
    const marketPrice = getLiveMarketPrice();
    const marketOpen = isMarketOpenNow();

    const snap = sim.computeAccountSnapshot({
      params,
      cashflows,
      journals: cachedJournals,
      openPositions: positions,
      marketPrice
    });
    lastSnapshot = snap;

    const slot = document.getElementById("home-account-cockpit-slot");
    if (!slot) {
      broadcastChartLines(snap);
      checkAutoTpSl(snap);
      return;
    }

    const fmt = (usd, opts = {}) => sim.formatMoney(usd, {
      currency: params.currency,
      usdIdrRate: params.usdIdrRate,
      ...opts
    });
    const fmtCompact = (usd, opts = {}) => {
      if (params.currency === "IDR") {
        return sim.formatMoney(usd, { currency: "IDR", usdIdrRate: params.usdIdrRate, ...opts });
      }
      return sim.formatMoney(usd, { currency: "USD", ...opts });
    };

    const hasOpen = snap.positions.length > 0;
    const heroTone = hasOpen
      ? (snap.floatingUsd > 0.004 ? "is-profit" : snap.floatingUsd < -0.004 ? "is-loss" : "")
      : (snap.realizedAllUsd > 0.004 ? "is-profit" : snap.realizedAllUsd < -0.004 ? "is-loss" : "");

    const heroLabel = hasOpen ? "PROFIT BERJALAN" : "BALANCE AKUN PRO";
    const heroCount = hasOpen
      ? `${snap.positions.length} posisi aktif`
      : `${snap.closedCount} trade simulasi`;
    const heroMainVal = hasOpen
      ? fmt(snap.floatingUsd, { signed: true })
      : fmt(snap.balanceUsd);
    const heroMainClass = hasOpen ? toneClass(snap.floatingUsd) : "acc-flat";

    const heroSubHtml = hasOpen
      ? `<span class="${toneClass(snap.floatingUsd)}">${escapeHtml(sim.formatPips(snap.floatingPips))}</span>
         <span aria-hidden="true">·</span>
         <span class="${toneClass(snap.floatingUsd)}">${snap.floatingPct >= 0 ? "+" : ""}${snap.floatingPct.toFixed(2)}% saldo</span>`
      : `<span>Modal ${escapeHtml(fmt(snap.initialCapitalUsd))}</span>
         <span aria-hidden="true">·</span>
         <span class="${toneClass(snap.realizedAllUsd)}">${snap.returnPct >= 0 ? "+" : ""}${snap.returnPct.toFixed(2)}%</span>`;

    const todayValText = fmt(snap.todayTotalUsd, { signed: true });
    const todayValClass = toneClass(snap.todayTotalUsd);

    const statusMeta = marketOpen
      ? (marketPrice ? `XAU/USD $${marketPrice.toFixed(2)} · 1:${params.leverage}` : `Akun Pro · 1:${params.leverage}`)
      : `Pasar Tutup (Akhir Pekan)${marketPrice ? ` · Ref $${marketPrice.toFixed(2)}` : ""}`;

    const positionsHtml = hasOpen
      ? `
        <div class="acc-positions-head">
          <span class="acc-positions-title">Posisi Aktif</span>
          ${snap.positions.length > 1 ? `<button type="button" class="acc-close-all-btn" data-acc-close-all>Tutup Semua (${snap.positions.length})</button>` : ""}
        </div>
        <div class="acc-pos-list">
          ${snap.positions.map((pos) => {
            const pnlMain = fmt(pos.pnlUsd, { signed: true });
            const secondaryUsd = params.currency === "IDR"
              ? `${sim.formatPips(pos.pips)} · ${sim.formatUsd(pos.pnlUsd, { signed: true })}`
              : `${sim.formatPips(pos.pips)} · ${sim.formatIdr(pos.pnlIdr, { signed: true })}`;
            const levels = [
              `Entry ${pos.entryPrice.toFixed(2)}`,
              `SL ${pos.sl ? pos.sl.toFixed(2) : "—"}`,
              `TP ${pos.tp ? pos.tp.toFixed(2) : "—"}`
            ].join(" · ");
            return `
              <div class="acc-pos-row" data-pos-id="${escapeHtml(pos.id)}">
                <div class="acc-pos-info">
                  <div class="acc-pos-line1">
                    <span>${escapeHtml(pos.symbol)}</span>
                    <span class="acc-pos-side ${pos.side === "BUY" ? "is-buy" : "is-sell"}">${pos.side}</span>
                    <span class="acc-pos-lot acc-tabular">${pos.lot.toFixed(2)} lot</span>
                  </div>
                  <div class="acc-pos-line2 acc-tabular">${escapeHtml(levels)}</div>
                </div>
                <div class="acc-pos-right">
                  <div class="acc-pos-pnl">
                    <strong class="acc-pos-pnl-main acc-tabular ${toneClass(pos.pnlUsd)}">${escapeHtml(pnlMain)}</strong>
                    <span class="acc-pos-pnl-sub acc-tabular">${escapeHtml(secondaryUsd)}</span>
                  </div>
                  <button type="button" class="acc-pos-close-btn" data-acc-close-id="${escapeHtml(pos.id)}" aria-label="Tutup posisi ${pos.side} ${pos.lot.toFixed(2)} lot">Tutup</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `
      : `
        <div class="acc-pos-empty">
          <span class="acc-pos-empty-copy">Belum ada posisi aktif</span>
        </div>
      `;

    const netPipsDisplay = sim.formatPips(snap.netPipsTotal, { signed: true });
    const winRateDisplay = snap.closedCount > 0 ? `${snap.winRate}%` : "—";

    const guardApi = window.AmyTraderInsights;
    const simClosedToday = cachedJournals.filter(
      (e) => sim.getEntryAccountMode(e) === "SIM" && !(sim.isBacktestJournal && sim.isBacktestJournal(e))
    );
    const guardState = guardApi
      ? guardApi.evaluateDailyLossGuard(simClosedToday, {
          balanceUsd: snap.initialCapitalUsd || snap.balanceUsd,
          config: guardApi.readDailyGuardConfig()
        })
      : null;

    const guardToneClass = guardState?.status === "LOCKED"
      ? "is-locked"
      : guardState?.status === "WARNING"
      ? "is-warning"
      : "";

    const guardSubCopy = guardState
      ? (guardState.status === "SAFE"
          ? `Maks ${guardState.config.maxDailySl} SL · -${guardState.config.maxDailyLossPct}%/hari`
          : (guardState.detail || `Batas: ${guardState.config.maxDailySl} SL · -${guardState.config.maxDailyLossPct}%`))
      : "";

    const guardHtml = guardState
      ? `
        <div class="amy-guard-bar ${guardToneClass}" data-acc-guard-bar>
          <div class="amy-guard-copy">
            <strong class="amy-guard-title">${escapeHtml(guardState.headline)}</strong>
            <span class="amy-guard-sub">${escapeHtml(guardSubCopy)}</span>
          </div>
          <button type="button" class="amy-guard-cfg-btn" data-acc-guard-toggle>${guardEditorOpen ? "Tutup" : "Batas"}</button>
        </div>
        ${guardEditorOpen ? `
          <div class="amy-guard-editor" data-acc-guard-editor>
            <label>Maks SL <input type="number" min="1" max="10" step="1" data-acc-guard-sl value="${guardState.config.maxDailySl}"></label>
            <label>Maks Rugi % <input type="number" min="0.5" max="25" step="0.5" data-acc-guard-pct value="${guardState.config.maxDailyLossPct}"></label>
            <button type="button" class="amy-guard-cfg-btn" data-acc-guard-save>Simpan</button>
          </div>
        ` : ""}
      `
      : "";

    slot.innerHTML = `
      <section class="acc-cockpit" data-testid="account-pro-cockpit" aria-label="Cockpit Akun Simulasi Pro">
        <div class="acc-head">
          <div class="acc-head-left">
            <div class="acc-title-row">
              <h2 class="acc-title">Akun Pro Simulasi</h2>
            </div>
            <div class="acc-sub-meta">
              <span>${escapeHtml(statusMeta)}</span>
              <span aria-hidden="true">·</span>
              <span>Risk ${params.riskPct}%</span>
            </div>
          </div>
          <div class="acc-head-controls">
            <div class="acc-curr-seg" role="group" aria-label="Mata uang tampilan">
              <button type="button" class="acc-curr-btn ${params.currency === "IDR" ? "is-active" : ""}" data-acc-currency="IDR" aria-pressed="${params.currency === "IDR"}">Rp</button>
              <button type="button" class="acc-curr-btn ${params.currency === "USD" ? "is-active" : ""}" data-acc-currency="USD" aria-pressed="${params.currency === "USD"}">$</button>
            </div>
            <button type="button" class="acc-order-btn" data-acc-open-order>+ Order</button>
          </div>
        </div>

        <div class="acc-hero ${heroTone}">
          <div class="acc-hero-bar">
            <span class="acc-hero-label">${heroLabel}</span>
            <span class="acc-hero-count">${escapeHtml(heroCount)}</span>
          </div>
          <strong class="acc-hero-main acc-tabular ${heroMainClass}" data-acc-hero-main>${escapeHtml(heroMainVal)}</strong>
          <div class="acc-hero-sub" data-acc-hero-sub>${heroSubHtml}</div>
          <div class="acc-hero-today">
            <span class="acc-hero-today-label">Hari Ini</span>
            <strong class="acc-hero-today-val acc-tabular ${todayValClass}" data-acc-today>${escapeHtml(todayValText)}</strong>
          </div>
        </div>

        ${guardHtml}

        <div class="acc-positions">
          ${positionsHtml}
        </div>

        <div class="acc-stats-grid" aria-label="Ringkasan akun dan statistik simulasi">
          <div class="acc-stat-cell">
            <span class="acc-stat-label">Balance</span>
            <strong class="acc-stat-val acc-tabular" data-acc-stat="balance">${escapeHtml(fmtCompact(snap.balanceUsd))}</strong>
          </div>
          <div class="acc-stat-cell">
            <span class="acc-stat-label">Float PnL</span>
            <strong class="acc-stat-val acc-tabular ${toneClass(snap.floatingUsd)}" data-acc-stat="floating">${escapeHtml(fmtCompact(snap.floatingUsd, { signed: true }))}</strong>
          </div>
          <div class="acc-stat-cell">
            <span class="acc-stat-label">Margin</span>
            <strong class="acc-stat-val acc-tabular acc-gold" data-acc-stat="margin">${escapeHtml(fmtCompact(snap.marginUsd))}</strong>
          </div>
          <div class="acc-stat-cell">
            <span class="acc-stat-label">Free Margin</span>
            <strong class="acc-stat-val acc-tabular ${snap.freeMarginUsd >= 0 ? "acc-pos" : "acc-neg"}" data-acc-stat="freeMargin">${escapeHtml(fmtCompact(snap.freeMarginUsd))}</strong>
          </div>
          <div class="acc-stat-cell">
            <span class="acc-stat-label">TP</span>
            <strong class="acc-stat-val acc-tabular acc-pos">${snap.tpCount}</strong>
          </div>
          <div class="acc-stat-cell">
            <span class="acc-stat-label">SL</span>
            <strong class="acc-stat-val acc-tabular acc-neg">${snap.slCount}</strong>
          </div>
          <div class="acc-stat-cell">
            <span class="acc-stat-label">Win Rate</span>
            <strong class="acc-stat-val acc-tabular acc-gold">${winRateDisplay}</strong>
          </div>
          <div class="acc-stat-cell">
            <span class="acc-stat-label">Net Pips</span>
            <strong class="acc-stat-val acc-tabular ${toneClass(snap.netPipsTotal)}">${escapeHtml(netPipsDisplay)}</strong>
          </div>
        </div>

        <div class="acc-foot">
          <span class="acc-foot-meta acc-tabular">Equity ${escapeHtml(fmt(snap.equityUsd))} · Kurs Rp${params.usdIdrRate.toLocaleString("id-ID")}</span>
          <div class="acc-foot-actions">
            <button type="button" class="acc-link-btn" data-acc-scroll-params>Atur Modal</button>
            <a class="acc-link-btn" href="apps/journal/index.html?view=statistics&amp;mode=SIM">Analitik Simulasi →</a>
          </div>
        </div>
      </section>
    `;

    bindCockpitEvents(slot);
    broadcastChartLines(snap);
    checkAutoTpSl(snap);
  }

  function bindCockpitEvents(slot) {
    slot.querySelectorAll("[data-acc-currency]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cur = btn.getAttribute("data-acc-currency") === "USD" ? "USD" : "IDR";
        engine()?.saveParams({ currency: cur });
        renderCockpit();
        try {
          window.dispatchEvent(new CustomEvent("amyfx:sim-state-change", { detail: { currency: cur } }));
        } catch (_) {}
      });
    });

    slot.querySelectorAll("[data-acc-open-order]").forEach((btn) => {
      btn.addEventListener("click", () => openOrderSheet());
    });

    slot.querySelector("[data-acc-scroll-params]")?.addEventListener("click", () => {
      const panel = document.getElementById("profileTradingParamsPanel");
      const balInput = document.getElementById("profileBalance");
      if (panel) {
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (balInput) {
        setTimeout(() => balInput.focus({ preventScroll: true }), 260);
      }
    });

    slot.querySelectorAll("[data-acc-close-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-acc-close-id");
        if (id) closePositionById(id, "MANUAL");
      });
    });

    slot.querySelector("[data-acc-close-all]")?.addEventListener("click", () => {
      closeAllPositions();
    });

    slot.querySelector("[data-acc-guard-toggle]")?.addEventListener("click", () => {
      guardEditorOpen = !guardEditorOpen;
      renderCockpit();
    });

    slot.querySelector("[data-acc-guard-save]")?.addEventListener("click", () => {
      const guardApi = window.AmyTraderInsights;
      if (!guardApi) return;
      const maxSl = Number(slot.querySelector("[data-acc-guard-sl]")?.value);
      const maxPct = Number(slot.querySelector("[data-acc-guard-pct]")?.value);
      guardApi.saveDailyGuardConfig({ enabled: true, maxDailySl: maxSl, maxDailyLossPct: maxPct });
      guardEditorOpen = false;
      window.showToast?.("Batas risiko harian diperbarui.");
      renderCockpit();
    });
  }

  function ensureOrderDialog() {
    if (orderDialog && document.body.contains(orderDialog)) return orderDialog;
    const dlg = document.createElement("dialog");
    dlg.id = "accOrderDialog";
    dlg.className = "acc-order-dialog";
    dlg.setAttribute("aria-labelledby", "accOrderDialogTitle");
    dlg.innerHTML = `
      <form class="acc-order-form" id="accOrderForm" novalidate>
        <div class="acc-sheet-handle" aria-hidden="true"></div>
        <div class="acc-sheet-head">
          <div>
            <span class="acc-sheet-kicker">Akun Pro Simulasi · XAU/USD</span>
            <h3 id="accOrderDialogTitle">Buka Posisi Simulasi</h3>
          </div>
          <button type="button" class="acc-sheet-close" id="accOrderCloseBtn" aria-label="Tutup form order">×</button>
        </div>

        <div class="acc-sheet-body">
          <div class="acc-side-seg" role="group" aria-label="Pilih arah order">
            <button type="button" class="acc-side-btn is-active" data-order-side="BUY" aria-pressed="true">
              <span>BUY · LONG</span>
              <small class="acc-tabular" id="accOrderAskLabel">Ask —</small>
            </button>
            <button type="button" class="acc-side-btn" data-order-side="SELL" aria-pressed="false">
              <span>SELL · SHORT</span>
              <small class="acc-tabular" id="accOrderBidLabel">Bid —</small>
            </button>
          </div>

          <div class="acc-field-grid">
            <label class="acc-field">
              <span>Ukuran Lot (Pro)</span>
              <input id="accOrderLot" class="acc-tabular" type="number" inputmode="decimal" min="0.01" max="50" step="0.01" value="0.10" required>
            </label>
            <label class="acc-field">
              <span>Harga Eksekusi ($)</span>
              <input id="accOrderMarketPrice" class="acc-tabular" type="number" inputmode="decimal" min="1" step="0.01" required>
            </label>
          </div>

          <div class="acc-lot-presets" aria-label="Preset lot cepat">
            <button type="button" class="acc-preset-btn" data-lot-preset="auto">Auto Risk</button>
            <button type="button" class="acc-preset-btn" data-lot-preset="0.01">0.01</button>
            <button type="button" class="acc-preset-btn" data-lot-preset="0.05">0.05</button>
            <button type="button" class="acc-preset-btn" data-lot-preset="0.10">0.10</button>
            <button type="button" class="acc-preset-btn" data-lot-preset="0.25">0.25</button>
            <button type="button" class="acc-preset-btn" data-lot-preset="0.50">0.50</button>
          </div>

          <div class="acc-field-grid">
            <label class="acc-field">
              <span>Stop Loss (Opsional)</span>
              <input id="accOrderSl" class="acc-tabular" type="number" inputmode="decimal" step="0.01" placeholder="Otomatis / kosong">
            </label>
            <label class="acc-field">
              <span>Take Profit (Opsional)</span>
              <input id="accOrderTp" class="acc-tabular" type="number" inputmode="decimal" step="0.01" placeholder="Otomatis / kosong">
            </label>
          </div>

          <div class="acc-lot-presets" aria-label="Preset jarak SL dan TP">
            <button type="button" class="acc-preset-btn" data-rr-preset="5:10">SL $5 · TP $10</button>
            <button type="button" class="acc-preset-btn" data-rr-preset="8:16">SL $8 · TP $16</button>
            <button type="button" class="acc-preset-btn" data-rr-preset="10:20">SL $10 · TP $20</button>
            <button type="button" class="acc-preset-btn" data-rr-preset="clear">Kosongkan SL/TP</button>
          </div>

          <label class="acc-field">
            <span>Setup ICT (Opsional)</span>
            <input id="accOrderSetup" type="text" maxlength="64" placeholder="OB + FVG M5, Sweep SSL, Silver Bullet...">
          </label>

          <div class="acc-order-preview acc-tabular" id="accOrderPreview"></div>
          <p class="acc-order-error" id="accOrderError" role="alert"></p>
        </div>

        <div class="acc-sheet-foot">
          <button type="button" class="acc-btn-cancel" id="accOrderCancelBtn">Batal</button>
          <button type="submit" class="acc-btn-submit" id="accOrderSubmitBtn">Eksekusi BUY</button>
        </div>
      </form>
    `;
    document.body.appendChild(dlg);
    orderDialog = dlg;

    const closeSheet = () => {
      if (dlg.open) {
        if (typeof dlg.close === "function") dlg.close();
        else dlg.removeAttribute("open");
      }
    };

    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) closeSheet();
    });
    dlg.querySelector("#accOrderCloseBtn")?.addEventListener("click", closeSheet);
    dlg.querySelector("#accOrderCancelBtn")?.addEventListener("click", closeSheet);

    dlg.querySelectorAll("[data-order-side]").forEach((btn) => {
      btn.addEventListener("click", () => {
        orderSide = btn.getAttribute("data-order-side") === "SELL" ? "SELL" : "BUY";
        syncOrderDialogState();
      });
    });

    dlg.querySelectorAll("[data-lot-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sim = engine();
        const lotEl = dlg.querySelector("#accOrderLot");
        if (!sim || !lotEl) return;
        const val = btn.getAttribute("data-lot-preset");
        if (val === "auto") {
          const params = sim.readParams();
          const balUsd = lastSnapshot?.balanceUsd || params.baseBalanceUsd;
          const mkt = Number(dlg.querySelector("#accOrderMarketPrice")?.value) || 0;
          const slVal = Number(dlg.querySelector("#accOrderSl")?.value) || 0;
          const slDist = slVal > 0 && mkt > 0 ? Math.abs(mkt - slVal) : 5;
          const lot = sim.suggestAutoLot({ balanceUsd: balUsd, riskPct: params.riskPct, slDistanceUsd: slDist });
          lotEl.value = lot.toFixed(2);
        } else {
          lotEl.value = val;
        }
        syncOrderDialogState();
      });
    });

    dlg.querySelectorAll("[data-rr-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = btn.getAttribute("data-rr-preset");
        const slEl = dlg.querySelector("#accOrderSl");
        const tpEl = dlg.querySelector("#accOrderTp");
        const mkt = Number(dlg.querySelector("#accOrderMarketPrice")?.value);
        if (!slEl || !tpEl) return;
        if (preset === "clear" || !Number.isFinite(mkt) || mkt <= 0) {
          slEl.value = "";
          tpEl.value = "";
          syncOrderDialogState();
          return;
        }
        const [slDist, tpDist] = preset.split(":").map(Number);
        if (orderSide === "BUY") {
          slEl.value = (mkt - slDist).toFixed(2);
          tpEl.value = (mkt + tpDist).toFixed(2);
        } else {
          slEl.value = (mkt + slDist).toFixed(2);
          tpEl.value = (mkt - tpDist).toFixed(2);
        }
        syncOrderDialogState();
      });
    });

    ["#accOrderLot", "#accOrderMarketPrice", "#accOrderSl", "#accOrderTp"].forEach((sel) => {
      dlg.querySelector(sel)?.addEventListener("input", syncOrderDialogState);
    });

    dlg.querySelector("#accOrderForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const sim = engine();
      if (!sim) return;
      const errEl = dlg.querySelector("#accOrderError");
      if (errEl) errEl.textContent = "";

      const params = sim.readParams();
      const lot = Number(dlg.querySelector("#accOrderLot")?.value);
      const marketPrice = Number(dlg.querySelector("#accOrderMarketPrice")?.value);
      const slRaw = dlg.querySelector("#accOrderSl")?.value?.trim();
      const tpRaw = dlg.querySelector("#accOrderTp")?.value?.trim();
      const setup = dlg.querySelector("#accOrderSetup")?.value?.trim() || "";

      try {
        const pos = sim.openPosition({
          side: orderSide,
          marketPrice,
          lot,
          sl: slRaw ? Number(slRaw) : null,
          tp: tpRaw ? Number(tpRaw) : null,
          spreadUsd: params.spreadUsd,
          setup,
          nowMs: Date.now()
        });
        const marginNeeded = sim.calculateRequiredMarginUsd({
          lot: pos.lot,
          entryPrice: pos.entryPrice,
          leverage: params.leverage
        });
        const currentFree = lastSnapshot ? lastSnapshot.freeMarginUsd : params.baseBalanceUsd;
        if (marginNeeded > currentFree) {
          throw new Error(`Free Margin tidak cukup (butuh ${sim.formatMoney(marginNeeded, params)}).`);
        }

        const nextPositions = [pos, ...sim.readPositions()];
        sim.savePositions(nextPositions);
        if (!Number.isFinite(Number(window.amyfxCurrentPrice)) || Number(window.amyfxCurrentPrice) <= 0) {
          window.amyfxCurrentPrice = marketPrice;
        }
        closeSheet();
        renderCockpit();
        window.showToast?.(`Order ${pos.side} ${pos.lot.toFixed(2)} lot @ $${pos.entryPrice.toFixed(2)} aktif.`);
        try {
          window.dispatchEvent(new CustomEvent("amyfx:sim-state-change", { detail: { openedId: pos.id } }));
        } catch (_) {}
      } catch (err) {
        if (errEl) errEl.textContent = err?.message || "Order tidak valid.";
      }
    });

    return dlg;
  }

  function syncOrderDialogState() {
    if (!orderDialog) return;
    const sim = engine();
    if (!sim) return;
    const params = sim.readParams();
    const mkt = Number(orderDialog.querySelector("#accOrderMarketPrice")?.value) || 0;
    const lot = Number(orderDialog.querySelector("#accOrderLot")?.value) || 0;
    const sl = Number(orderDialog.querySelector("#accOrderSl")?.value) || 0;
    const tp = Number(orderDialog.querySelector("#accOrderTp")?.value) || 0;
    const halfSpread = params.spreadUsd / 2;

    orderDialog.querySelectorAll("[data-order-side]").forEach((btn) => {
      const active = btn.getAttribute("data-order-side") === orderSide;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    const askEl = orderDialog.querySelector("#accOrderAskLabel");
    const bidEl = orderDialog.querySelector("#accOrderBidLabel");
    if (askEl) askEl.textContent = mkt > 0 ? `Ask ${(mkt + halfSpread).toFixed(2)}` : "Ask —";
    if (bidEl) bidEl.textContent = mkt > 0 ? `Bid ${(mkt - halfSpread).toFixed(2)}` : "Bid —";

    const submitBtn = orderDialog.querySelector("#accOrderSubmitBtn");
    if (submitBtn) {
      submitBtn.textContent = orderSide === "BUY"
        ? `Eksekusi BUY · ${lot > 0 ? lot.toFixed(2) : "0.00"} Lot`
        : `Eksekusi SELL · ${lot > 0 ? lot.toFixed(2) : "0.00"} Lot`;
      submitBtn.classList.toggle("is-sell", orderSide === "SELL");
    }

    const previewEl = orderDialog.querySelector("#accOrderPreview");
    if (previewEl) {
      const entry = mkt > 0 ? (orderSide === "BUY" ? mkt + halfSpread : mkt - halfSpread) : 0;
      const marginUsd = sim.calculateRequiredMarginUsd({ lot, entryPrice: entry, leverage: params.leverage });
      const spreadCostUsd = params.spreadUsd * lot * sim.CONTRACT_SIZE_XAU;
      const slRiskUsd = sl > 0 && entry > 0 ? Math.abs(entry - sl) * lot * sim.CONTRACT_SIZE_XAU : null;
      const tpRewardUsd = tp > 0 && entry > 0 ? Math.abs(tp - entry) * lot * sim.CONTRACT_SIZE_XAU : null;
      const fmt = (u, opts = {}) => sim.formatMoney(u, { currency: params.currency, usdIdrRate: params.usdIdrRate, ...opts });

      previewEl.innerHTML = `
        <div><span>Est. Margin (1:${params.leverage})</span><strong>${escapeHtml(fmt(marginUsd))}</strong></div>
        <div><span>Biaya Spread ($${params.spreadUsd.toFixed(2)})</span><strong>${escapeHtml(fmt(-spreadCostUsd, { signed: true }))}</strong></div>
        <div><span>Risiko SL</span><strong class="${slRiskUsd ? "acc-neg" : ""}">${slRiskUsd ? escapeHtml(fmt(-slRiskUsd, { signed: true })) : "Belum disetel"}</strong></div>
        <div><span>Target TP</span><strong class="${tpRewardUsd ? "acc-pos" : ""}">${tpRewardUsd ? escapeHtml(fmt(tpRewardUsd, { signed: true })) : "Belum disetel"}</strong></div>
      `;
    }
  }

  function openOrderSheet() {
    const sim = engine();
    if (!sim) return;
    const dlg = ensureOrderDialog();
    const params = sim.readParams();
    const livePrice = getLiveMarketPrice() || 3560.00;
    const balUsd = lastSnapshot?.balanceUsd || params.baseBalanceUsd;
    const suggestedLot = sim.suggestAutoLot({
      balanceUsd: balUsd,
      riskPct: params.riskPct,
      slDistanceUsd: 5
    });

    const priceEl = dlg.querySelector("#accOrderMarketPrice");
    const lotEl = dlg.querySelector("#accOrderLot");
    const slEl = dlg.querySelector("#accOrderSl");
    const tpEl = dlg.querySelector("#accOrderTp");
    const setupEl = dlg.querySelector("#accOrderSetup");
    const errEl = dlg.querySelector("#accOrderError");

    if (priceEl) priceEl.value = livePrice.toFixed(2);
    if (lotEl) lotEl.value = suggestedLot.toFixed(2);
    if (slEl) slEl.value = "";
    if (tpEl) tpEl.value = "";
    if (setupEl) setupEl.value = "";
    if (errEl) errEl.textContent = "";

    orderSide = "BUY";
    syncOrderDialogState();

    if (!dlg.open) {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
    }
  }

  async function refreshFromStorage() {
    await readAllJournals();
    renderCockpit();
  }

  function handleLiveTickUpdate() {
    const hasSlot = Boolean(document.getElementById("home-account-cockpit-slot"));
    const hasOpen = (engine()?.readPositions?.().length || 0) > 0;
    if (!hasSlot && !hasOpen) return;
    renderCockpit();
  }

  window.AmyHomeAccountCockpit = Object.freeze({
    refresh: refreshFromStorage,
    render: renderCockpit,
    openOrderSheet,
    closePositionById,
    closeAllPositions,
    resetSimulationAccount,
    getSnapshot: () => lastSnapshot
  });

  function boot() {
    refreshFromStorage();
    [
      "amyfx:home-rendered",
      "amyfx:profile-rendered",
      "amyfx:journal-state-change",
      "amyfx:sim-state-change",
      "amyfx:integration-change"
    ].forEach((ev) => window.addEventListener(ev, () => refreshFromStorage()));

    [
      "amyfx:twelvedata-price",
      "amyfx:live-price-display",
      "amyfx:home-chart-price"
    ].forEach((ev) => window.addEventListener(ev, handleLiveTickUpdate));

    window.addEventListener("storage", (event) => {
      if (!event.key || [
        "amy_default_balance",
        "amy_default_risk",
        "amy_account_currency",
        "amy_usd_idr_rate",
        "amy_account_leverage",
        "amy_account_spread",
        "amy_sim_positions_v1",
        "amy_sim_cashflows_v1",
        LEGACY_JOURNAL_KEY
      ].includes(event.key)) {
        refreshFromStorage();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
