/**
 * Amy FX Pro — Instant Lot & Risk Calculator (Kalkulator Lot & Risiko Instan)
 * Item 2.1 Blueprint: Kalkulator Lot & Risiko Instan di Card 4 Plan.
 *
 * Formula Spesifikasi Teknis:
 * - Jarak SL (Pips): Pips = |Entry - SL| * 10
 * - Nominal Risiko ($): Risk $ = Balance * (Risk % / 100)
 * - Ukuran Lot Ideal: Lot = Risk $ / (|Entry - SL| * 100)
 *   (dibulatkan ke bawah per kelipatan 0.01 lot, batas minimum 0.01)
 * - Potensi Profit TP1: Profit TP1 = Lot * |TP1 - Entry| * 100
 * - Potensi Profit TP2: Profit TP2 = Lot * |TP2 - Entry| * 100
 * - Rasio Risk/Reward: RR1 = |TP1 - Entry| / |Entry - SL|
 */

import { computePoiPortfolioLedger, HISTORY_STORAGE_KEY } from './mapping-history-engine.js';

export const BALANCE_KEY = 'amy_account_balance';
export const RISK_PERCENT_KEY = 'amy_risk_percent';
const PROFILE_BALANCE_KEY = 'amy_default_balance';
const PROFILE_RISK_KEY = 'amy_default_risk';
const PROFILE_CASHFLOW_KEY = 'amy_sim_cashflows_v1';

/**
 * Pure mathematical calculation engine
 */
export function calculateLotAndRisk({
  balance = 1000,
  riskPercent = 1.0,
  entry = 0,
  sl = 0,
  tp1 = 0,
  tp2 = 0,
  side = 'BUY'
}) {
  const b = Math.max(0, Number(balance) || 0);
  const rPct = Math.max(0, Number(riskPercent) || 0);
  const e = Number(entry) || 0;
  const s = Number(sl) || 0;
  const t1 = Number(tp1) || 0;
  const t2 = Number(tp2) || 0;

  const slDiff = Math.abs(e - s);
  const slPips = Number((slDiff * 10).toFixed(1));
  const riskAmount = Number((b * (rPct / 100)).toFixed(2));

  let lot = 0.01;
  if (slDiff > 0 && riskAmount > 0) {
    const rawLot = riskAmount / (slDiff * 100);
    // Dibulatkan ke bawah per kelipatan 0.01 lot, batas minimum 0.01
    lot = Math.floor(rawLot * 100) / 100;
    if (lot < 0.01) lot = 0.01;
  }

  const tp1Diff = t1 ? Math.abs(t1 - e) : 0;
  const tp2Diff = t2 ? Math.abs(t2 - e) : 0;

  const tp1Profit = Number((lot * tp1Diff * 100).toFixed(2));
  const tp2Profit = Number((lot * tp2Diff * 100).toFixed(2));
  const tp1Pips = Number((tp1Diff * 10).toFixed(1));
  const tp2Pips = Number((tp2Diff * 10).toFixed(1));

  const rr1 = slDiff > 0 && tp1Diff > 0 ? Number((tp1Diff / slDiff).toFixed(2)) : 0;
  const rr2 = slDiff > 0 && tp2Diff > 0 ? Number((tp2Diff / slDiff).toFixed(2)) : 0;

  return {
    balance: b,
    riskPercent: rPct,
    riskAmount,
    entry: e,
    sl: s,
    tp1: t1,
    tp2: t2,
    side,
    slDiff: Number(slDiff.toFixed(2)),
    slPips,
    lot: Number(lot.toFixed(2)),
    tp1Profit,
    tp1Pips,
    tp2Profit,
    tp2Pips,
    rr1,
    rr2
  };
}

/**
 * Resolve Profile's live Active Balance & Risk % (base modal + cashflows + Riwayat POI realized PnL).
 * Falls back cleanly to saved calculator values only if Profile keys are absent.
 */
export function resolveSyncedProfileAccount(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  if (!storage) {
    return { balanceUsd: 5000, riskPct: 1.5, source: 'default', poiClosedCount: 0 };
  }
  try {
    // Prefer unified AmyAccountSimEngine snapshot if loaded on page
    if (typeof window !== 'undefined' && window.AmyAccountSimEngine?.computeAccountSnapshot) {
      const sim = window.AmyAccountSimEngine;
      const params = sim.readParams(storage);
      const cashflows = sim.readCashflows ? sim.readCashflows(storage) : [];
      const poiRecords = sim.readPoiHistoryRecords ? sim.readPoiHistoryRecords(storage) : [];
      const snap = sim.computeAccountSnapshot({ params, cashflows, poiRecords, journals: [], openPositions: [] });
      if (snap && Number.isFinite(snap.balanceUsd) && snap.balanceUsd > 0) {
        return {
          balanceUsd: Number(snap.balanceUsd.toFixed(2)),
          riskPct: Number(params.riskPct.toFixed(2)),
          source: 'profile-synced',
          poiClosedCount: Number(snap.poiClosedCount || 0)
        };
      }
    }
  } catch (_) {}

  try {
    const rawBase = parseFloat(storage.getItem(PROFILE_BALANCE_KEY) || '');
    const rawRisk = parseFloat(storage.getItem(PROFILE_RISK_KEY) || '');
    const hasProfileBase = Number.isFinite(rawBase) && rawBase > 0;
    const baseBalanceUsd = hasProfileBase ? rawBase : 5000;
    const riskPct = Number.isFinite(rawRisk) && rawRisk > 0 ? Math.min(25, Math.max(0.1, rawRisk)) : 1.5;

    let netCashflow = 0;
    try {
      const cf = JSON.parse(storage.getItem(PROFILE_CASHFLOW_KEY) || '[]');
      if (Array.isArray(cf)) {
        for (const item of cf) {
          const amt = Number(item?.amountUsd || 0);
          if (!Number.isFinite(amt) || amt === 0) continue;
          const kind = String(item?.type || '').toUpperCase();
          if (amt < 0) {
            netCashflow += amt;
          } else {
            netCashflow += kind === 'WITHDRAW' ? -amt : amt;
          }
        }
      }
    } catch (_) {}

    let poiRecords = [];
    try {
      const rawHist = JSON.parse(storage.getItem(HISTORY_STORAGE_KEY) || 'null');
      if (Array.isArray(rawHist?.poiRecords)) poiRecords = rawHist.poiRecords;
    } catch (_) {}

    const initialCapitalUsd = Math.max(0, Number((baseBalanceUsd + netCashflow).toFixed(2)));
    const ledger = computePoiPortfolioLedger(poiRecords, { baseBalanceUsd: initialCapitalUsd, riskPct });
    return {
      balanceUsd: Number((ledger.endingBalanceUsd > 0 ? ledger.endingBalanceUsd : initialCapitalUsd).toFixed(2)),
      riskPct: Number(riskPct.toFixed(2)),
      source: hasProfileBase || ledger.closedCount > 0 ? 'profile-synced' : 'default',
      poiClosedCount: ledger.closedCount
    };
  } catch (_) {
    return { balanceUsd: 5000, riskPct: 1.5, source: 'default', poiClosedCount: 0 };
  }
}

/**
 * Persisted balance helper (defaults to Profile Active Balance when synced)
 */
export function getSavedBalance() {
  if (typeof localStorage === 'undefined') return 5000;
  const synced = resolveSyncedProfileAccount(localStorage);
  if (synced.source === 'profile-synced' && synced.balanceUsd > 0) {
    return synced.balanceUsd;
  }
  const val = parseFloat(localStorage.getItem(BALANCE_KEY) || '');
  return Number.isFinite(val) && val > 0 ? val : synced.balanceUsd;
}

export function saveBalance(balance) {
  if (typeof localStorage === 'undefined') return;
  const b = Math.max(1, Number(balance) || 5000);
  try {
    localStorage.setItem(BALANCE_KEY, String(b));
  } catch {}
}

/**
 * Persisted risk percent helper (defaults to Profile Risk % when synced)
 */
export function getSavedRiskPercent() {
  if (typeof localStorage === 'undefined') return 1.5;
  const synced = resolveSyncedProfileAccount(localStorage);
  if (synced.source === 'profile-synced' && synced.riskPct > 0) {
    return synced.riskPct;
  }
  const val = parseFloat(localStorage.getItem(RISK_PERCENT_KEY) || '');
  return Number.isFinite(val) && val > 0 ? val : synced.riskPct;
}

export function saveRiskPercent(pct) {
  if (typeof localStorage === 'undefined') return;
  const p = Math.max(0.1, Number(pct) || 1.5);
  try {
    localStorage.setItem(RISK_PERCENT_KEY, String(p));
  } catch {}
}

/**
 * DOM Bottom-Sheet / Modal UI
 */
export function injectLotCalculatorStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('amy-lot-calc-styles')) return;

  const style = document.createElement('style');
  style.id = 'amy-lot-calc-styles';
  style.textContent = `
    .btn-lot-calc-pill {
      background: rgba(245, 196, 81, 0.15);
      border: 1px solid rgba(245, 196, 81, 0.4);
      color: #F5C451;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    }
    .btn-lot-calc-pill:hover {
      background: rgba(245, 196, 81, 0.25);
    }
    .amy-lot-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2147483645;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .amy-lot-modal-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }
    .amy-lot-sheet {
      width: 100%;
      max-width: 520px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px 20px 0 0;
      padding: 20px 18px 28px;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 196, 81, 0.15);
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      max-height: 90vh;
      overflow-y: auto;
    }
    .amy-lot-modal-backdrop.active .amy-lot-sheet {
      transform: translateY(0);
    }
    .amy-lot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .amy-lot-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      color: #F5C451;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .amy-lot-close-btn {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .amy-lot-grid-inputs {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }
    .amy-lot-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
    .amy-lot-field label {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .amy-lot-input {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 10px 10px;
      color: #fff;
      font-size: 14px;
      font-family: monospace;
      outline: none;
      transition: border-color 0.2s ease;
    }
    .amy-lot-input:focus {
      border-color: #F5C451;
      box-shadow: 0 0 0 1px #F5C451;
    }
    .amy-risk-chips {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .amy-risk-chip {
      flex: 1;
      padding: 7px 4px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    .amy-risk-chip.active {
      background: rgba(245, 196, 81, 0.2);
      border-color: #F5C451;
      color: #F5C451;
      font-weight: 800;
    }
    .amy-bloomberg-card {
      background: radial-gradient(100% 100% at 50% 0%, rgba(245, 196, 81, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%);
      border: 1px solid rgba(245, 196, 81, 0.3);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .amy-bloomberg-hero {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .amy-bloomberg-lot-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .amy-bloomberg-lot-val {
      font-size: 32px;
      font-weight: 900;
      font-family: monospace;
      color: #F5C451;
      text-shadow: 0 0 16px rgba(245, 196, 81, 0.4);
    }
    .amy-bloomberg-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .amy-bloomberg-stat-item {
      background: rgba(0, 0, 0, 0.35);
      border-radius: 8px;
      padding: 10px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .amy-bloomberg-stat-item small {
      display: block;
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .amy-bloomberg-stat-item strong {
      font-size: 14px;
      font-family: monospace;
      display: block;
    }
    .stat-risk { color: #ef4444; }
    .stat-tp1 { color: #eab308; }
    .stat-tp2 { color: #22c55e; }
    .amy-lot-sync-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 12px;
      padding: 7px 10px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11.5px;
      color: #cbd5e1;
      font-variant-numeric: tabular-nums;
    }
    .amy-lot-sync-btn {
      background: transparent;
      border: 1px solid rgba(245, 196, 81, 0.4);
      color: #f5c451;
      border-radius: 7px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
    .amy-lot-sync-btn:hover {
      background: rgba(245, 196, 81, 0.14);
    }
    :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-lot-sheet {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.12);
      color: #0f172a;
      box-shadow: 0 -10px 40px rgba(15, 23, 42, 0.18);
    }
    :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-lot-header {
      border-bottom-color: rgba(15, 23, 42, 0.09);
    }
    :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-lot-header h3 {
      color: #b45309;
    }
    :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-lot-input {
      background: #f8fafc;
      border-color: rgba(15, 23, 42, 0.14);
      color: #0f172a;
    }
    :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-lot-sync-bar {
      background: #f8fafc;
      border-color: rgba(15, 23, 42, 0.1);
      color: #334155;
    }
    :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-lot-sync-btn {
      color: #b45309;
      border-color: rgba(180, 83, 9, 0.35);
    }
    :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-bloomberg-card {
      background: #f8fafc;
      border-color: rgba(180, 83, 9, 0.25);
      box-shadow: none;
    }
    :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-bloomberg-stat-item {
      background: #ffffff;
      border-color: rgba(15, 23, 42, 0.08);
    }
    :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-bloomberg-lot-val {
      color: #b45309;
      text-shadow: none;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Setup and mount the interactive modal
 */
let lotWindowEventsBound = false;

export function initLotCalculator() {
  if (typeof document === 'undefined') return;

  injectLotCalculatorStyles();

  let modal = document.getElementById('amy-lot-calc-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'amy-lot-calc-modal';
    modal.className = 'amy-lot-modal-backdrop';
    modal.innerHTML = `
      <div class="amy-lot-sheet" role="dialog" aria-modal="true" aria-labelledby="lot-calc-title">
        <div class="amy-lot-header">
          <h3 id="lot-calc-title">⚡ KALKULATOR LOT & RISIKO AMY FX</h3>
          <button type="button" class="amy-lot-close-btn" id="lot-calc-close" title="Tutup">&times;</button>
        </div>

        <div class="amy-lot-sync-bar" id="lot-calc-sync-bar">
          <span id="lot-calc-sync-text">Saldo Aktif Profil: $5,000.00 · Risiko 1.5%</span>
          <button type="button" class="amy-lot-sync-btn" id="lot-calc-sync-btn">Sync Profil</button>
        </div>

        <!-- Akun & Persen Risiko -->
        <div class="amy-lot-grid-inputs">
          <div class="amy-lot-field">
            <label for="lot-calc-balance">Modal Akun ($)</label>
            <input type="number" id="lot-calc-balance" class="amy-lot-input" value="5000" min="1" step="10">
          </div>
          <div class="amy-lot-field">
            <label for="lot-calc-risk-pct">Risiko (%)</label>
            <input type="number" id="lot-calc-risk-pct" class="amy-lot-input" value="1.5" min="0.1" max="100" step="0.1">
          </div>
        </div>

        <!-- Chips Preset Risiko -->
        <div class="amy-risk-chips">
          <button type="button" class="amy-risk-chip" data-risk="0.5">0.5%</button>
          <button type="button" class="amy-risk-chip" data-risk="1.0">1.0%</button>
          <button type="button" class="amy-risk-chip active" data-risk="1.5">1.5%</button>
          <button type="button" class="amy-risk-chip" data-risk="2.0">2.0%</button>
          <button type="button" class="amy-risk-chip" data-risk="custom">Custom</button>
        </div>

        <!-- Parameter Level Entry & SL -->
        <div class="amy-lot-grid-inputs">
          <div class="amy-lot-field">
            <label for="lot-calc-entry">Level Entry</label>
            <input type="number" id="lot-calc-entry" class="amy-lot-input" placeholder="2650.00" step="0.1">
          </div>
          <div class="amy-lot-field">
            <label for="lot-calc-sl">Stop Loss (SL)</label>
            <input type="number" id="lot-calc-sl" class="amy-lot-input" placeholder="2643.00" step="0.1">
          </div>
        </div>
        <div class="amy-lot-grid-inputs">
          <div class="amy-lot-field">
            <label for="lot-calc-tp1">Target TP 1</label>
            <input type="number" id="lot-calc-tp1" class="amy-lot-input" placeholder="2660.00" step="0.1">
          </div>
          <div class="amy-lot-field">
            <label for="lot-calc-tp2">Target TP 2 (Runner)</label>
            <input type="number" id="lot-calc-tp2" class="amy-lot-input" placeholder="2672.00" step="0.1">
          </div>
        </div>

        <!-- Hasil Bloomberg-Style -->
        <div class="amy-bloomberg-card">
          <div class="amy-bloomberg-hero">
            <div class="amy-bloomberg-lot-title">Ukuran Lot Rekomendasi</div>
            <div class="amy-bloomberg-lot-val" id="lot-res-lot">0.01 LOT</div>
          </div>
          <div class="amy-bloomberg-stats">
            <div class="amy-bloomberg-stat-item">
              <small>Risiko Maksimal</small>
              <strong class="stat-risk" id="lot-res-risk">-$10.00 (-70 pips)</strong>
            </div>
            <div class="amy-bloomberg-stat-item">
              <small>Potensi Target 1</small>
              <strong class="stat-tp1" id="lot-res-tp1">+$10.00 (1:1.4)</strong>
            </div>
            <div class="amy-bloomberg-stat-item">
              <small>Potensi Target 2</small>
              <strong class="stat-tp2" id="lot-res-tp2">+$22.00 (1:3.1)</strong>
            </div>
            <div class="amy-bloomberg-stat-item">
              <small>Jarak Stop Loss</small>
              <strong id="lot-res-pips">7.00 pts (70 pips)</strong>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Bind event listeners
    const closeBtn = document.getElementById('lot-calc-close');
    closeBtn?.addEventListener('click', closeLotCalculator);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLotCalculator();
    });

    // Inputs update
    const balanceInput = document.getElementById('lot-calc-balance');
    const riskInput = document.getElementById('lot-calc-risk-pct');
    const entryInput = document.getElementById('lot-calc-entry');
    const slInput = document.getElementById('lot-calc-sl');
    const tp1Input = document.getElementById('lot-calc-tp1');
    const tp2Input = document.getElementById('lot-calc-tp2');

    const updateAndRecalc = () => {
      saveBalance(balanceInput.value);
      saveRiskPercent(riskInput.value);
      recalculateModalUI();
    };

    balanceInput?.addEventListener('input', updateAndRecalc);
    riskInput?.addEventListener('input', () => {
      updateActiveChip(riskInput.value);
      updateAndRecalc();
    });
    entryInput?.addEventListener('input', recalculateModalUI);
    slInput?.addEventListener('input', recalculateModalUI);
    tp1Input?.addEventListener('input', recalculateModalUI);
    tp2Input?.addEventListener('input', recalculateModalUI);

    // Risk chips
    const chips = modal.querySelectorAll('.amy-risk-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const risk = chip.dataset.risk;
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (risk !== 'custom') {
          riskInput.value = risk;
          updateAndRecalc();
        } else {
          riskInput.focus();
        }
      });
    });

    // Sync to Profile button
    const syncBtn = document.getElementById('lot-calc-sync-btn');
    syncBtn?.addEventListener('click', () => {
      const synced = resolveSyncedProfileAccount();
      if (balanceInput) balanceInput.value = synced.balanceUsd;
      if (riskInput) {
        riskInput.value = synced.riskPct;
        updateActiveChip(synced.riskPct);
      }
      updateSyncBanner(synced);
      recalculateModalUI();
    });
  }

  // Bind trigger buttons in page
  bindTriggerButtons();
  updateSyncBanner(resolveSyncedProfileAccount());

  // Register global window listeners once to prevent O(2^N) duplication on repeated modal opens
  if (!lotWindowEventsBound) {
    lotWindowEventsBound = true;
    window.addEventListener('amyfx:open-lot-calc', (e) => {
      openLotCalculator(e.detail);
    });
    window.addEventListener('amyfx:poi-history-updated', () => {
      updateSyncBanner(resolveSyncedProfileAccount());
    });
  }
}

function updateActiveChip(val) {
  if (typeof document === 'undefined') return;
  const chips = document.querySelectorAll('.amy-risk-chip');
  const num = parseFloat(val);
  let matched = false;
  chips.forEach(c => {
    if (parseFloat(c.dataset.risk) === num) {
      c.classList.add('active');
      matched = true;
    } else {
      c.classList.remove('active');
    }
  });
  if (!matched) {
    document.querySelector?.('.amy-risk-chip[data-risk="custom"]')?.classList.add('active');
  }
}

function updateSyncBanner(synced) {
  if (typeof document === 'undefined' || !synced) return;
  const el = document.getElementById('lot-calc-sync-text');
  if (!el) return;
  const balTxt = Number(synced.balanceUsd || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const poiTxt = synced.poiClosedCount > 0 ? ` · ${synced.poiClosedCount} POI` : '';
  el.textContent = `Saldo Aktif Profil: $${balTxt} · Risiko ${Number(synced.riskPct || 1.5).toFixed(1)}%${poiTxt}`;
}

export function openLotCalculator(plan = null) {
  if (typeof document === 'undefined') return;
  initLotCalculator();

  const modal = document.getElementById('amy-lot-calc-modal');
  if (!modal) return;

  const balanceInput = document.getElementById('lot-calc-balance');
  const riskInput = document.getElementById('lot-calc-risk-pct');
  const entryInput = document.getElementById('lot-calc-entry');
  const slInput = document.getElementById('lot-calc-sl');
  const tp1Input = document.getElementById('lot-calc-tp1');
  const tp2Input = document.getElementById('lot-calc-tp2');

  const synced = resolveSyncedProfileAccount();
  if (balanceInput) balanceInput.value = synced.balanceUsd;
  if (riskInput) {
    riskInput.value = synced.riskPct;
    updateActiveChip(synced.riskPct);
  }
  updateSyncBanner(synced);

  // Detect plan from argument, or fallback to DOM Card 4 values
  let eVal = plan?.entry;
  let sVal = plan?.sl;
  let t1Val = plan?.tp1;
  let t2Val = plan?.tp2;

  if (!eVal) {
    const domEntry = parseFloat(document.getElementById('plan-entry-val')?.textContent || '');
    if (Number.isFinite(domEntry) && domEntry > 0) eVal = domEntry;
  }
  if (!sVal) {
    const domSl = parseFloat(document.getElementById('plan-sl-val')?.textContent || '');
    if (Number.isFinite(domSl) && domSl > 0) sVal = domSl;
  }
  if (!t1Val) {
    const domTp1 = parseFloat(document.getElementById('plan-tp1-val')?.textContent || '');
    if (Number.isFinite(domTp1) && domTp1 > 0) t1Val = domTp1;
  }
  if (!t2Val) {
    const domTp2 = parseFloat(document.getElementById('plan-tp2-val')?.textContent || '');
    if (Number.isFinite(domTp2) && domTp2 > 0) t2Val = domTp2;
  }

  // Fallback if still empty: live price
  if (!eVal) {
    const livePrice = parseFloat(document.getElementById('chart-price')?.textContent?.replace(/[^0-9.]/g, '') || '2650');
    eVal = Number.isFinite(livePrice) && livePrice > 0 ? livePrice : 2650;
    sVal = Number((eVal - 7).toFixed(2));
    t1Val = Number((eVal + 10).toFixed(2));
    t2Val = Number((eVal + 22).toFixed(2));
  }

  if (entryInput) entryInput.value = eVal || '';
  if (slInput) slInput.value = sVal || '';
  if (tp1Input) tp1Input.value = t1Val || '';
  if (tp2Input) tp2Input.value = t2Val || '';

  recalculateModalUI();
  modal.classList.add('active');
}

export function closeLotCalculator() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('amy-lot-calc-modal');
  modal?.classList.remove('active');
}

export function recalculateModalUI() {
  if (typeof document === 'undefined') return;

  const b = parseFloat(document.getElementById('lot-calc-balance')?.value || '1000');
  const r = parseFloat(document.getElementById('lot-calc-risk-pct')?.value || '1.0');
  const e = parseFloat(document.getElementById('lot-calc-entry')?.value || '0');
  const s = parseFloat(document.getElementById('lot-calc-sl')?.value || '0');
  const t1 = parseFloat(document.getElementById('lot-calc-tp1')?.value || '0');
  const t2 = parseFloat(document.getElementById('lot-calc-tp2')?.value || '0');

  const res = calculateLotAndRisk({
    balance: b,
    riskPercent: r,
    entry: e,
    sl: s,
    tp1: t1,
    tp2: t2,
    side: e >= s ? 'BUY' : 'SELL'
  });

  const lotEl = document.getElementById('lot-res-lot');
  const riskEl = document.getElementById('lot-res-risk');
  const tp1El = document.getElementById('lot-res-tp1');
  const tp2El = document.getElementById('lot-res-tp2');
  const pipsEl = document.getElementById('lot-res-pips');

  if (lotEl) lotEl.textContent = `${res.lot.toFixed(2)} LOT`;
  if (riskEl) riskEl.textContent = `-$${res.riskAmount.toFixed(2)} (-${res.slPips} pips)`;
  if (tp1El) tp1El.textContent = `+$${res.tp1Profit.toFixed(2)} (1:${res.rr1.toFixed(1)})`;
  if (tp2El) tp2El.textContent = `+$${res.tp2Profit.toFixed(2)} (1:${res.rr2.toFixed(1)})`;
  if (pipsEl) pipsEl.textContent = `${res.slDiff.toFixed(2)} pts (${res.slPips} pips)`;
}

export function bindTriggerButtons() {
  if (typeof document === 'undefined') return;

  const btnOpen = document.getElementById('btn-open-lot-calc');
  if (btnOpen && !btnOpen.dataset.bound) {
    btnOpen.dataset.bound = 'true';
    btnOpen.addEventListener('click', () => openLotCalculator());
  }

  const btnQuick = document.getElementById('btn-quick-lot-calc');
  if (btnQuick && !btnQuick.dataset.bound) {
    btnQuick.dataset.bound = 'true';
    btnQuick.addEventListener('click', () => openLotCalculator());
  }
}

// Auto-init on page load if running in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLotCalculator());
  } else {
    initLotCalculator();
  }
}
