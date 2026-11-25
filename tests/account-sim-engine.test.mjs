import test from "node:test";
import assert from "node:assert/strict";

await import("../app/src/main/assets/apps/shared/account-sim-engine.js");
const sim = globalThis.AmyAccountSimEngine;

function createMemoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(k) { return map.has(k) ? map.get(k) : null; },
    setItem(k, v) { map.set(k, String(v)); },
    removeItem(k) { map.delete(k); }
  };
}

test("readParams and saveParams sync baseBalanceUsd & riskPct with Profile keys and default to IDR Pro", () => {
  const store = createMemoryStorage({
    amy_default_balance: "3000",
    amy_default_risk: "1.0"
  });
  const initial = sim.readParams(store);
  assert.equal(initial.baseBalanceUsd, 3000);
  assert.equal(initial.riskPct, 1.0);
  assert.equal(initial.currency, "IDR");
  assert.equal(initial.usdIdrRate, 16500);
  assert.equal(initial.leverage, 500);
  assert.equal(initial.spreadUsd, 0.2);

  const saved = sim.saveParams({ currency: "USD", leverage: 1000, usdIdrRate: 16800, spreadUsd: 0.3 }, store);
  assert.equal(saved.currency, "USD");
  assert.equal(saved.leverage, 1000);
  assert.equal(store.getItem("amy_account_currency"), "USD");
  assert.equal(store.getItem("amy_usd_idr_rate"), "16800");
  assert.equal(store.getItem("amy_default_balance"), "3000");
});

test("openPosition applies spread accurately and validates SL/TP direction", () => {
  const buy = sim.openPosition({
    side: "BUY",
    marketPrice: 3560.00,
    lot: 0.10,
    sl: 3555.00,
    tp: 3570.00,
    spreadUsd: 0.20,
    nowMs: Date.UTC(2026, 10, 20, 12, 0, 0)
  });
  assert.equal(buy.entryPrice, 3560.10);

  // Immediately at same market price, BUY exit is Bid (3559.90) => -$0.20 move on 0.10 lot = -$2.00
  const evalAtOpen = sim.evaluatePosition(buy, 3560.00, { leverage: 500, usdIdrRate: 16500, spreadUsd: 0.20 });
  assert.equal(evalAtOpen.exitPrice, 3559.90);
  assert.equal(evalAtOpen.pips, -2);
  assert.equal(evalAtOpen.pnlUsd, -2);
  assert.equal(evalAtOpen.pnlIdr, -33000);
  assert.equal(evalAtOpen.hitTrigger, null);

  // Move up +$10.00 to 3570.00 => exit Bid 3569.90 => +$9.80 move on 0.10 lot = +$98.00 (+98 pips)
  const evalUp = sim.evaluatePosition(buy, 3570.00, { leverage: 500, usdIdrRate: 16500, spreadUsd: 0.20 });
  assert.equal(evalUp.pnlUsd, 98);
  assert.equal(evalUp.pips, 98);
  assert.equal(evalUp.hitTrigger, null);

  // Hit TP when Bid >= 3570.00 (market 3570.10)
  const evalTp = sim.evaluatePosition(buy, 3570.10, { leverage: 500, usdIdrRate: 16500, spreadUsd: 0.20 });
  assert.equal(evalTp.hitTrigger, "TP");

  // Reject invalid SL above BUY entry
  assert.throws(() => sim.openPosition({ side: "BUY", marketPrice: 3560, lot: 0.1, sl: 3565 }), /Stop Loss BUY/);
  // Reject invalid TP above SELL entry
  assert.throws(() => sim.openPosition({ side: "SELL", marketPrice: 3560, lot: 0.1, tp: 3565 }), /Take Profit SELL/);
});

test("computeAccountSnapshot isolates SIM trades from REAL journals and computes Balance, Equity, Margin, Free Margin", () => {
  const nowMs = Date.UTC(2026, 10, 20, 14, 0, 0); // 2026-11-20 22:00 WITA
  const todayWita = sim.getWitaDateString(nowMs);
  assert.equal(todayWita, "2026-11-20");

  const journals = [
    // REAL trade (legacy without accountMode) MUST NOT affect SIM balance
    { id: "real-1", date: todayWita, result: "Win", profit: 9999, loss: 0, pnlMoney: 9999 },
    // Explicit REAL trade MUST NOT affect SIM balance
    { id: "real-2", accountMode: "REAL", date: todayWita, result: "Loss", profit: 0, loss: 500, pnlMoney: -500 },
    // SIM trades
    { id: "sim-1", accountMode: "SIM", date: "2026-11-19", result: "Win", profit: 250, loss: 0, pnlMoney: 250, pnlPips: 50 },
    { id: "sim-2", accountMode: "SIM", date: todayWita, result: "Loss", profit: 0, loss: 100, pnlMoney: -100, pnlPips: -20 }
  ];

  const pos = sim.openPosition({
    side: "SELL",
    marketPrice: 3560.00,
    lot: 0.20,
    sl: 3565.00,
    tp: 3545.00,
    spreadUsd: 0.20,
    nowMs
  }); // entryPrice = 3559.90

  const snap = sim.computeAccountSnapshot({
    params: { baseBalanceUsd: 5000, riskPct: 1.5, currency: "IDR", usdIdrRate: 16500, leverage: 500, spreadUsd: 0.20 },
    cashflows: [{ id: "cf1", type: "deposit", amountUsd: 500 }],
    journals,
    openPositions: [pos],
    marketPrice: 3554.90, // Ask exit = 3555.00 => +4.90 move * 0.20 * 100 = +$98.00 (+49 pips)
    nowMs
  });

  // Initial capital = 5000 + 500 = 5500; realized SIM = +250 - 100 = +150; Balance = 5650
  assert.equal(snap.initialCapitalUsd, 5500);
  assert.equal(snap.realizedAllUsd, 150);
  assert.equal(snap.balanceUsd, 5650);
  assert.equal(snap.floatingUsd, 98);
  assert.equal(snap.floatingPips, 49);
  assert.equal(snap.equityUsd, 5748);
  // Margin = (0.20 * 100 * 3559.90) / 500 = 142.40
  assert.equal(snap.marginUsd, 142.4);
  assert.equal(snap.freeMarginUsd, 5605.6);
  // Today = todayRealized (-100) + floating (+98) = -2
  assert.equal(snap.todayRealizedUsd, -100);
  assert.equal(snap.todayTotalUsd, -2);
  assert.equal(snap.tpCount, 1);
  assert.equal(snap.slCount, 1);
  assert.equal(snap.winRate, 50);
  assert.equal(snap.netPipsClosed, 30);
});

test("buildClosedJournalRecord tags accountMode SIM and computes profit/loss/pips/RR accurately", () => {
  const nowMs = Date.UTC(2026, 10, 20, 13, 30, 0); // 21:30 WITA -> NY AM
  const pos = sim.openPosition({
    side: "BUY",
    marketPrice: 3560.00,
    lot: 0.10,
    sl: 3555.10, // risk = $5.00 * 10 = $50
    tp: 3570.10, // reward = $10.00 * 10 = $100
    spreadUsd: 0.20,
    setup: "Sweep SSL + FVG M5",
    nowMs
  });
  const record = sim.buildClosedJournalRecord(pos, 3570.50, "TP", { spreadUsd: 0.20 }, nowMs + 60000);
  assert.equal(record.accountMode, "SIM");
  assert.equal(record.source, "sim-cockpit");
  assert.equal(record.direction, "Buy");
  assert.equal(record.result, "Win");
  assert.equal(record.exitPrice, 3570.10);
  assert.equal(record.pnlMoney, 100);
  assert.equal(record.profit, 100);
  assert.equal(record.loss, 0);
  assert.equal(record.pnlPips, 100);
  assert.equal(record.riskReward, 2);
  assert.equal(record.session, "NY AM");
});

test("filterJournalsByMode cleanly separates REAL, SIM, and ALL without breaking legacy entries", () => {
  const list = [
    { id: "legacy-1", result: "Win", profit: 50 },
    { id: "real-1", accountMode: "REAL", result: "Loss", loss: 20 },
    { id: "sim-1", accountMode: "SIM", result: "Win", profit: 120 },
    { id: "sim-2", source: "sim-cockpit", result: "BE", profit: 0 }
  ];
  assert.equal(sim.filterJournalsByMode(list, "REAL").length, 2);
  assert.equal(sim.filterJournalsByMode(list, "SIM").length, 2);
  assert.equal(sim.filterJournalsByMode(list, "all").length, 4);
});

test("suggestAutoLot compounds with updated live balance and formatMoney renders IDR/USD cleanly", () => {
  // $5000 * 1.5% = $75 risk; $5 SL distance => $75 / (5 * 100) = 0.15 lot
  assert.equal(sim.suggestAutoLot({ balanceUsd: 5000, riskPct: 1.5, slDistanceUsd: 5 }), 0.15);
  // After growing balance to $10000 => 0.30 lot
  assert.equal(sim.suggestAutoLot({ balanceUsd: 10000, riskPct: 1.5, slDistanceUsd: 5 }), 0.3);

  const idrPos = sim.formatMoney(100, { currency: "IDR", usdIdrRate: 16500, signed: true });
  assert.match(idrPos, /^\+Rp1[.,]650[.,]000$/);

  const usdNeg = sim.formatMoney(-61.18, { currency: "USD", signed: true });
  assert.equal(usdNeg, "-$61.18");
});

test("computeAccountSnapshot excludes backtest-lab historical exports from live SIM balance", () => {
  const nowMs = Date.UTC(2026, 10, 20, 14, 0, 0);
  const journals = [
    { id: "sim-live-1", accountMode: "SIM", source: "sim-cockpit", date: "2026-11-20", result: "Win", profit: 100, loss: 0, pnlMoney: 100 },
    { id: "bt-journal-tr-1", accountMode: "SIM", source: "backtest-lab", date: "2024-03-10", result: "Win", profit: 950, loss: 0, pnlMoney: 950 }
  ];
  assert.equal(sim.isBacktestJournal(journals[1]), true);
  assert.equal(sim.isBacktestJournal(journals[0]), false);
  const snap = sim.computeAccountSnapshot({
    params: { baseBalanceUsd: 5000, riskPct: 1, currency: "USD" },
    journals,
    nowMs
  });
  assert.equal(snap.realizedAllUsd, 100);
  assert.equal(snap.balanceUsd, 5100);
  assert.equal(snap.closedCount, 1);
});

test("computeAccountSnapshot adjusts Profile balance up on POI TP and down on POI SL, and resets cleanly when POI history is cleared", () => {
  const nowMs = Date.UTC(2026, 10, 25, 8, 0, 0); // 16:00 WITA
  const store = createMemoryStorage({
    [sim.STORAGE_KEYS.poiHistory]: JSON.stringify({
      version: 2,
      poiRecords: [
        { id: "poi-sl-1", side: "SELL", tf: "M5", ce: 3520, sl: 3527, tp1: 3509.5, tp2: 3502.5, status: "SL_HIT", touchedAt: nowMs - 3600_000, resolvedAt: nowMs - 3000_000 },
        { id: "poi-tp2-1", side: "BUY", tf: "M15", ce: 3500, sl: 3492, tp1: 3512, tp2: 3520, status: "TP2_HIT", touchedAt: nowMs - 1800_000, resolvedAt: nowMs - 600_000 },
        { id: "poi-open-1", side: "BUY", tf: "M15", ce: 3530, sl: 3522, tp1: 3542, tp2: 3550, status: "TESTING", touchedAt: nowMs }
      ]
    })
  });

  const poiRecords = sim.readPoiHistoryRecords(store);
  assert.equal(poiRecords.length, 3);

  // SL only -> balance MUST decrease
  const slOnly = sim.computeAccountSnapshot({
    params: { baseBalanceUsd: 5000, riskPct: 1.5, currency: "USD" },
    poiRecords: [poiRecords[0]],
    nowMs
  });
  assert.equal(slOnly.poiRealizedAllUsd, -75);
  assert.equal(slOnly.balanceUsd, 4925);
  assert.equal(slOnly.slCount, 1);
  assert.equal(slOnly.netPipsClosed, -70);

  // SL (-$75 -> $4925) followed by TP2 (+2.5R on $73.88 = +$184.70 -> $5109.70)
  const combined = sim.computeAccountSnapshot({
    params: { baseBalanceUsd: 5000, riskPct: 1.5, currency: "USD" },
    poiRecords,
    nowMs
  });
  assert.equal(combined.poiRealizedAllUsd, 109.7);
  assert.equal(combined.poiRealizedTodayUsd, 109.7);
  assert.equal(combined.balanceUsd, 5109.7);
  assert.equal(combined.poiClosedCount, 2);
  assert.equal(combined.tpCount, 1);
  assert.equal(combined.slCount, 1);
  assert.equal(combined.netPipsClosed, 130); // -70p + 200p

  // Cleared Riwayat POI -> restores cleanly to baseBalanceUsd
  const resetSnap = sim.computeAccountSnapshot({
    params: { baseBalanceUsd: 5000, riskPct: 1.5, currency: "USD" },
    poiRecords: [],
    nowMs
  });
  assert.equal(resetSnap.balanceUsd, 5000);
  assert.equal(resetSnap.poiRealizedAllUsd, 0);
});


