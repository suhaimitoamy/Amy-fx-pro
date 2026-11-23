/**
 * Amy FX Pro — Custom Price Alert Manager (Alarm Harga Kustom)
 * Real-time XAU/USD price alert engine with:
 *  - Persistent localStorage alerts (ACTIVE / TRIGGERED)
 *  - Multi-source live price monitoring (Mapping + Beranda)
 *  - Browser Web Notification API permission management + Android Native Bridge
 *  - Gesture-unlocked Web Audio API 2-tone melodic chime + Haptic feedback
 *  - Modern Glass Cockpit modal (Dark & Light parity) with:
 *      • Permission status bar & 1-click "Tes Notifikasi"
 *      • Segmented tabs: "Pasang Baru" & "Daftar Alarm"
 *      • Live active-count badges on Mapping & Beranda alarm buttons
 *      • Inline validation (zero window.alert())
 */

const STORAGE_KEY = 'amyfx_custom_price_alerts';
const STYLE_ID = 'amyfx-price-alert-styles';

let previousPrice = null;
let lastPersistenceTime = 0;
let audioCtx = null;
let bannerDismissTimer = null;
const registeredContainers = new Set();
let observerInitialized = false;

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('beforeunload', () => {
    try {
      const active = getAlerts();
      if (active.length > 0) saveAlerts(active);
    } catch (_) {}
  });
}

/* ── Helpers ── */
function parsePrice(val) {
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function formatWitaTime(ts) {
  try {
    return new Date(ts || Date.now()).toLocaleTimeString('id-ID', {
      timeZone: 'Asia/Makassar',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WITA';
  } catch (_) {
    return '';
  }
}

/* ── Scoped Glass Cockpit Styles (Dark & Light Parity) ── */
function ensureAlertStyles() {
  if (typeof document === 'undefined' || !document.head || typeof document.getElementById !== 'function') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .amyfx-alert-overlay {
      --pa-bg: rgba(13, 21, 35, 0.94);
      --pa-surface: rgba(255, 255, 255, 0.05);
      --pa-inset: rgba(7, 12, 22, 0.55);
      --pa-border: rgba(255, 255, 255, 0.13);
      --pa-border-sub: rgba(255, 255, 255, 0.08);
      --pa-text: #F1F5F9;
      --pa-text-sub: #CBD5E1;
      --pa-muted: #94A3B8;
      --pa-gold: #F5C451;
      --pa-gold-bg: rgba(245, 196, 81, 0.14);
      --pa-gold-border: rgba(245, 196, 81, 0.35);
      --pa-buy: #34D399;
      --pa-buy-text: #86EFAC;
      --pa-buy-bg: rgba(16, 185, 129, 0.14);
      --pa-buy-border: rgba(16, 185, 129, 0.35);
      --pa-sell: #F87171;
      --pa-sell-text: #FCA5A5;
      --pa-sell-bg: rgba(239, 68, 68, 0.14);
      --pa-sell-border: rgba(239, 68, 68, 0.35);
      --pa-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
      --pa-mono: ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
      position: fixed;
      inset: 0;
      z-index: 2147483600;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(4, 8, 16, 0.76);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-sizing: border-box;
    }
    html[data-amyfx-theme="light"] .amyfx-alert-overlay,
    html[data-theme="light"] .amyfx-alert-overlay,
    html[data-amyfx-theme="light"] .amyfx-alert-banner,
    html[data-theme="light"] .amyfx-alert-banner {
      --pa-bg: rgba(255, 255, 255, 0.96);
      --pa-surface: rgba(241, 245, 249, 0.9);
      --pa-inset: rgba(241, 245, 249, 0.95);
      --pa-border: rgba(15, 23, 42, 0.12);
      --pa-border-sub: rgba(15, 23, 42, 0.08);
      --pa-text: #0F172A;
      --pa-text-sub: #334155;
      --pa-muted: #64748B;
      --pa-gold: #B45309;
      --pa-gold-bg: rgba(217, 119, 6, 0.11);
      --pa-gold-border: rgba(217, 119, 6, 0.32);
      --pa-buy: #059669;
      --pa-buy-text: #065F46;
      --pa-buy-bg: rgba(16, 185, 129, 0.12);
      --pa-buy-border: rgba(5, 150, 105, 0.32);
      --pa-sell: #DC2626;
      --pa-sell-text: #991B1B;
      --pa-sell-bg: rgba(239, 68, 68, 0.11);
      --pa-sell-border: rgba(220, 38, 38, 0.30);
      --pa-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
    }
    .amyfx-alert-dialog {
      width: 100%;
      max-width: 440px;
      max-height: calc(100vh - 32px);
      display: flex;
      flex-direction: column;
      background: var(--pa-bg);
      border: 1px solid var(--pa-border);
      border-radius: 20px;
      box-shadow: var(--pa-shadow);
      color: var(--pa-text);
      overflow: hidden;
      font-family: inherit;
      box-sizing: border-box;
    }
    .amyfx-alert-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 18px 12px;
      border-bottom: 1px solid var(--pa-border-sub);
    }
    .amyfx-alert-title-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .amyfx-alert-kicker {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--pa-gold);
    }
    .amyfx-alert-head h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: var(--pa-text);
      line-height: 1.25;
    }
    .amyfx-alert-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-height: 36px;
      padding: 0;
      border-radius: 10px;
      background: var(--pa-surface);
      border: 1px solid var(--pa-border-sub);
      color: var(--pa-muted);
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
    }
    .amyfx-alert-close:hover { color: var(--pa-text); border-color: var(--pa-border); }

    /* Notification Status & Test Bar */
    .amyfx-alert-status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 9px 18px;
      background: var(--pa-inset);
      border-bottom: 1px solid var(--pa-border-sub);
      flex-wrap: wrap;
    }
    .amyfx-alert-perm-info {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--pa-text-sub);
      min-width: 0;
      flex: 1 1 180px;
    }
    .amyfx-alert-perm-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
      background: var(--pa-muted);
    }
    .amyfx-alert-perm-dot.is-ok { background: var(--pa-buy); }
    .amyfx-alert-perm-dot.is-warn { background: var(--pa-gold); }
    .amyfx-alert-perm-dot.is-err { background: var(--pa-sell); }
    .amyfx-alert-status-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .amyfx-alert-overlay .amyfx-alert-mini-btn {
      width: auto !important;
      min-height: 30px !important;
      height: auto !important;
      padding: 5px 10px !important;
      border-radius: 8px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      cursor: pointer;
      white-space: nowrap;
      border: 1px solid var(--pa-border) !important;
      background: var(--pa-surface) !important;
      color: var(--pa-text) !important;
      box-shadow: none !important;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .amyfx-alert-overlay .amyfx-alert-mini-btn:hover { border-color: var(--pa-gold-border) !important; color: var(--pa-gold) !important; }
    .amyfx-alert-overlay .amyfx-alert-mini-btn--gold {
      background: var(--pa-gold-bg) !important;
      border-color: var(--pa-gold-border) !important;
      color: var(--pa-gold) !important;
    }

    /* Segmented Tabs inside Modal */
    .amyfx-alert-tabs {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
      margin: 12px 18px 0;
      padding: 4px;
      border-radius: 12px;
      background: var(--pa-inset);
      border: 1px solid var(--pa-border-sub);
    }
    .amyfx-alert-tab {
      min-height: 38px;
      padding: 7px 10px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--pa-muted);
      font-size: 12.5px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
      transition: all 0.18s ease;
    }
    .amyfx-alert-tab.is-active {
      background: var(--pa-gold-bg);
      border-color: var(--pa-gold-border);
      color: var(--pa-gold);
    }
    .amyfx-alert-tab-count {
      font-family: var(--pa-mono);
      font-size: 11px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }

    /* Scrollable Body */
    .amyfx-alert-body {
      padding: 14px 18px 18px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      flex: 1;
    }
    .amyfx-alert-feedback {
      font-size: 12px;
      font-weight: 600;
      padding: 9px 11px;
      border-radius: 10px;
      margin-bottom: 12px;
      line-height: 1.45;
    }
    .amyfx-alert-feedback.is-error {
      background: var(--pa-sell-bg);
      border: 1px solid var(--pa-sell-border);
      color: var(--pa-sell-text);
    }
    .amyfx-alert-feedback.is-success {
      background: var(--pa-buy-bg);
      border: 1px solid var(--pa-buy-border);
      color: var(--pa-buy-text);
    }
    .amyfx-alert-feedback[hidden] { display: none; }

    /* Presets */
    .amyfx-alert-presets-wrap { margin-bottom: 14px; }
    .amyfx-alert-field-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      color: var(--pa-muted);
      margin-bottom: 6px;
      gap: 8px;
    }
    .amyfx-alert-field-label strong {
      color: var(--pa-text);
      font-family: var(--pa-mono);
      font-variant-numeric: tabular-nums;
    }
    .amyfx-alert-chips {
      display: flex;
      flex-wrap: nowrap;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
    }
    .amyfx-alert-overlay .amyfx-preset-chip {
      flex: 0 0 auto;
      width: auto !important;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 32px !important;
      height: auto !important;
      padding: 5px 10px !important;
      border-radius: 8px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      color: var(--pa-text) !important;
      background: var(--pa-surface) !important;
      border: 1px solid var(--pa-border) !important;
      box-shadow: none !important;
      cursor: pointer;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .amyfx-alert-overlay .amyfx-preset-chip.is-selected {
      background: var(--pa-gold-bg) !important;
      border-color: var(--pa-gold-border) !important;
      color: var(--pa-gold) !important;
    }
    .amyfx-preset-chip-price {
      font-family: var(--pa-mono);
      color: var(--pa-muted);
    }
    .amyfx-preset-chip.is-selected .amyfx-preset-chip-price { color: var(--pa-gold); }

    /* Form Controls */
    .amyfx-alert-field { margin-bottom: 12px; }
    .amyfx-alert-input-box {
      display: flex;
      align-items: center;
      background: var(--pa-inset);
      border: 1px solid var(--pa-border);
      border-radius: 11px;
      padding: 0 12px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .amyfx-alert-input-box:focus-within {
      border-color: var(--pa-gold);
      box-shadow: 0 0 0 3px var(--pa-gold-bg);
    }
    .amyfx-alert-prefix {
      color: var(--pa-muted);
      font-weight: 800;
      font-family: var(--pa-mono);
      font-size: 15px;
      flex-shrink: 0;
    }
    .amyfx-alert-overlay .amyfx-alert-input,
    .amyfx-alert-overlay .amyfx-alert-select {
      width: 100% !important;
      min-height: 44px !important;
      color: var(--pa-text) !important;
      font-size: 14px;
      font-weight: 700;
      font-family: inherit;
      box-sizing: border-box;
      margin: 0 !important;
    }
    .amyfx-alert-overlay .amyfx-alert-input--price,
    .amyfx-alert-overlay .amyfx-alert-input--price:focus,
    .amyfx-alert-overlay .amyfx-alert-input--price:focus-visible,
    #amyfx-alert-input-price,
    #amyfx-alert-input-price:focus,
    #amyfx-alert-input-price:focus-visible {
      background: transparent !important;
      border: 0 !important;
      border-color: transparent !important;
      box-shadow: none !important;
      outline: 0 !important;
      padding: 10px 8px !important;
      font-family: var(--pa-mono) !important;
      font-size: 17px !important;
      font-variant-numeric: tabular-nums;
    }
    .amyfx-alert-overlay .amyfx-alert-input--text,
    .amyfx-alert-overlay .amyfx-alert-select {
      background: var(--pa-inset) !important;
      border: 1px solid var(--pa-border) !important;
      border-radius: 11px !important;
      padding: 10px 12px !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      box-shadow: none !important;
      outline: none !important;
    }
    .amyfx-alert-overlay .amyfx-alert-input--text:focus,
    .amyfx-alert-overlay .amyfx-alert-select:focus {
      border-color: var(--pa-gold) !important;
      box-shadow: 0 0 0 3px var(--pa-gold-bg) !important;
    }
    .amyfx-alert-select option { background: #131e2d; color: #f1f5f9; }
    html[data-amyfx-theme="light"] .amyfx-alert-select option,
    html[data-theme="light"] .amyfx-alert-select option { background: #ffffff; color: #0f172a; }

    .amyfx-alert-form-actions {
      display: grid;
      grid-template-columns: 1fr 1.45fr;
      gap: 10px;
      margin-top: 16px;
    }
    .amyfx-alert-overlay .amyfx-alert-btn {
      width: 100% !important;
      min-height: 44px !important;
      padding: 10px 14px !important;
      border-radius: 11px !important;
      font-size: 13px !important;
      font-weight: 800 !important;
      cursor: pointer;
      border: 1px solid var(--pa-border) !important;
      background: var(--pa-surface) !important;
      color: var(--pa-text) !important;
      box-shadow: none !important;
    }
    .amyfx-alert-overlay .amyfx-alert-btn--primary {
      background: linear-gradient(135deg, #F5C451, #D99B26) !important;
      border-color: #F5C451 !important;
      color: #0B1220 !important;
      box-shadow: 0 8px 20px rgba(245, 196, 81, 0.25) !important;
    }
    html[data-amyfx-theme="light"] .amyfx-alert-overlay .amyfx-alert-btn--primary,
    html[data-theme="light"] .amyfx-alert-overlay .amyfx-alert-btn--primary {
      background: linear-gradient(135deg, #D97706, #B45309) !important;
      border-color: #B45309 !important;
      color: #FFFFFF !important;
      box-shadow: 0 8px 18px rgba(180, 83, 9, 0.24) !important;
    }

    /* Active & Triggered Alert List */
    .amyfx-alert-list-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 11.5px;
      color: var(--pa-muted);
    }
    .amyfx-alert-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .amyfx-alert-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: var(--pa-inset);
      border: 1px solid var(--pa-border-sub);
    }
    .amyfx-alert-item.is-triggered { opacity: 0.72; }
    .amyfx-alert-item-main {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      min-width: 0;
      flex: 1;
    }
    .amyfx-alert-dir-icon {
      font-size: 13px;
      font-weight: 800;
      line-height: 1.4;
      flex-shrink: 0;
    }
    .amyfx-alert-dir-icon.is-up { color: var(--pa-buy); }
    .amyfx-alert-dir-icon.is-down { color: var(--pa-sell); }
    .amyfx-alert-item-top {
      display: flex;
      align-items: baseline;
      gap: 7px;
      flex-wrap: wrap;
    }
    .amyfx-alert-price {
      font-family: var(--pa-mono);
      font-size: 14px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--pa-text);
    }
    .amyfx-alert-state-label {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--pa-gold);
    }
    .amyfx-alert-state-label.is-hit { color: var(--pa-buy-text); }
    .amyfx-alert-meta {
      font-size: 11px;
      color: var(--pa-muted);
      margin-top: 2px;
      line-height: 1.4;
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
    .amyfx-alert-meta strong { color: var(--pa-text-sub); font-weight: 600; }
    .amyfx-alert-item-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .amyfx-alert-overlay .amyfx-alert-row-btn {
      width: auto !important;
      min-height: 32px !important;
      height: auto !important;
      padding: 5px 9px !important;
      border-radius: 8px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      cursor: pointer;
      border: 1px solid var(--pa-border) !important;
      background: var(--pa-surface) !important;
      color: var(--pa-text-sub) !important;
      box-shadow: none !important;
      white-space: nowrap;
    }
    .amyfx-alert-overlay .amyfx-alert-row-btn--del {
      border-color: var(--pa-sell-border) !important;
      color: var(--pa-sell-text) !important;
      background: var(--pa-sell-bg) !important;
    }
    .amyfx-alert-empty {
      text-align: center;
      padding: 24px 14px;
      border-radius: 12px;
      background: var(--pa-inset);
      border: 1px dashed var(--pa-border);
      color: var(--pa-muted);
      font-size: 12.5px;
      line-height: 1.5;
    }
    .amyfx-alert-empty button { margin-top: 12px; }

    /* In-App Notification Banner */
    .amyfx-alert-banner {
      --pa-bg: rgba(15, 23, 42, 0.96);
      --pa-border: rgba(245, 196, 81, 0.45);
      --pa-text: #F8FAFC;
      --pa-muted: #94A3B8;
      --pa-gold: #F5C451;
      --pa-buy-text: #86EFAC;
      --pa-sell-text: #FCA5A5;
      --pa-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
      --pa-mono: ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483640;
      width: calc(100% - 28px);
      max-width: 440px;
      background: var(--pa-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--pa-border);
      box-shadow: var(--pa-shadow);
      border-radius: 16px;
      padding: 13px 16px;
      color: var(--pa-text);
      font-family: inherit;
      box-sizing: border-box;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .amyfx-alert-banner-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .amyfx-alert-banner-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(245, 196, 81, 0.14);
      color: var(--pa-gold);
    }
    .amyfx-alert-banner-body { flex: 1; min-width: 0; }
    .amyfx-alert-banner-kicker {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--pa-gold);
    }
    .amyfx-alert-banner-title {
      font-family: var(--pa-mono);
      font-size: 15px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      margin: 2px 0;
      color: var(--pa-text);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .amyfx-alert-banner-dir {
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
    }
    .amyfx-alert-banner-desc {
      font-size: 12px;
      color: var(--pa-muted);
      line-height: 1.4;
      overflow-wrap: anywhere;
    }
    .amyfx-alert-banner-desc strong { color: var(--pa-text); }

    /* Active count badge inside Pasang Alarm buttons */
    .amyfx-alarm-btn-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      margin-left: 6px;
      border-radius: 99px;
      font-size: 10.5px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      background: rgba(245, 196, 81, 0.22);
      border: 1px solid rgba(245, 196, 81, 0.55);
      color: #F5C451;
      vertical-align: middle;
      line-height: 1;
    }
    html[data-amyfx-theme="light"] .amyfx-alarm-btn-count,
    html[data-theme="light"] .amyfx-alarm-btn-count {
      background: rgba(217, 119, 6, 0.14);
      border-color: rgba(217, 119, 6, 0.45);
      color: #B45309;
    }
  `;
  document.head.appendChild(style);
}

/* ── Live Price Retrieval (Mapping + Beranda) ── */
export function getCurrentLivePrice() {
  if (typeof window === 'undefined') return 2650.0;

  if (parsePrice(window.amyfxCurrentPrice)) {
    return Number(window.amyfxCurrentPrice);
  }
  if (parsePrice(window.state?.price)) {
    return Number(window.state.price);
  }
  if (window.amyfxLastCandles?.length) {
    const c = window.amyfxLastCandles.at(-1);
    if (parsePrice(c?.close)) return Number(c.close);
  }
  if (window.amyfxLastContext?.amy?.chartCandles?.M15?.length) {
    const c = window.amyfxLastContext.amy.chartCandles.M15.at(-1);
    if (parsePrice(c?.close)) return Number(c.close);
  }

  if (typeof document !== 'undefined') {
    for (const id of ['chart-price', 'home-chart-price', 'hero-price']) {
      const el = document.getElementById(id);
      if (el) {
        const p = parseFloat(String(el.textContent || '').replace(/[^0-9.]/g, ''));
        if (parsePrice(p)) return p;
      }
    }
  }

  try {
    const stored = parseFloat(localStorage.getItem('last_price') || '');
    if (parsePrice(stored)) return stored;
  } catch (_) {}

  return 2650.0;
}

/* ── Storage CRUD ── */
export function getAlerts() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[PriceAlert] Gagal membaca storage:', err);
    return [];
  }
}

export function saveAlerts(alerts) {
  try {
    if (typeof localStorage === 'undefined') return false;
    const safeList = Array.isArray(alerts) ? alerts : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeList));
    return true;
  } catch (err) {
    console.error('[PriceAlert] Gagal menyimpan alerts:', err);
    return false;
  }
}

/* ── Notification Permission & Audio Unlock ── */
export function getNotificationStatus() {
  if (typeof window === 'undefined') {
    return { supported: false, native: false, permission: 'unsupported' };
  }
  const hasAndroidBridge = typeof window.Android?.showNotificationWithUrl === 'function'
    || typeof window.Android?.showNotification === 'function';
  if (hasAndroidBridge) {
    return { supported: true, native: true, permission: 'native' };
  }
  if (!('Notification' in window)) {
    return { supported: false, native: false, permission: 'unsupported' };
  }
  return {
    supported: true,
    native: false,
    permission: String(Notification.permission || 'default')
  };
}

export async function requestNotificationPermission() {
  const status = getNotificationStatus();
  if (status.native) return 'native';
  if (!status.supported) return 'unsupported';
  if (status.permission === 'granted' || status.permission === 'denied') {
    return status.permission;
  }
  try {
    const result = await Notification.requestPermission();
    return String(result || Notification.permission || 'default');
  } catch (_) {
    return String(Notification.permission || 'default');
  }
}

export function unlockAlertAudio() {
  if (typeof window === 'undefined') return false;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return false;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return true;
  } catch (_) {
    return false;
  }
}

/* ── Sync Active Count Badge on Mapping & Beranda Buttons ── */
const HOME_ALARM_ICON_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';

export function syncAlertButtonBadges() {
  if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
  ensureAlertStyles();
  const activeCount = getAlerts().filter(a => a.status === 'ACTIVE').length;
  const targets = [
    { id: 'btn-chart-custom-price-alert', baseHtml: `${HOME_ALARM_ICON_SVG}<span>Alarm</span>`, baseText: 'Pasang Alarm', isHtml: true },
    { id: 'home-chart-alert', baseHtml: `${HOME_ALARM_ICON_SVG}<span>Alarm</span>`, baseText: '🔔 Pasang Alarm', isHtml: true }
  ];
  for (const { id, baseHtml, baseText, isHtml } of targets) {
    const btn = document.getElementById(id);
    if (!btn) continue;
    btn.setAttribute('data-active-alerts', String(activeCount));
    const label = isHtml && baseHtml ? baseHtml : baseText;
    if (activeCount > 0) {
      btn.innerHTML = `${label}<span class="amyfx-alarm-btn-count" aria-label="${activeCount} alarm aktif">${activeCount}</span>`;
    } else if (isHtml && baseHtml) {
      btn.innerHTML = baseHtml;
    } else {
      btn.textContent = baseText;
    }
  }
}

function broadcastAlertsUpdated(detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('amyfx:price-alerts-updated', { detail }));
  }
  syncAlertButtonBadges();
  renderAllRegisteredContainers();
}

export function addAlert(targetPrice, options = {}) {
  const target = parsePrice(targetPrice);
  if (!target) {
    throw new Error('Target harga harus berupa angka positif yang valid.');
  }

  const curPrice = parsePrice(options.currentPrice) || getCurrentLivePrice();
  let direction = options.direction;
  if (!direction || !['CROSS_ABOVE', 'CROSS_BELOW'].includes(direction)) {
    direction = target >= curPrice ? 'CROSS_ABOVE' : 'CROSS_BELOW';
  }

  const alert = {
    id: 'alert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    targetPrice: Math.round(target * 100) / 100,
    direction,
    createdPrice: Math.round(curPrice * 100) / 100,
    lastCheckedPrice: Math.round(curPrice * 100) / 100,
    createdAt: Date.now(),
    triggeredAt: null,
    status: 'ACTIVE',
    note: String(options.note || '').trim() || 'Alarm Target Harga'
  };

  const list = getAlerts();
  list.push(alert);
  saveAlerts(list);
  broadcastAlertsUpdated({ action: 'add', alert, alerts: list });
  return alert;
}

export function removeAlert(id) {
  const list = getAlerts();
  const filtered = list.filter(a => a.id !== id);
  saveAlerts(filtered);
  broadcastAlertsUpdated({ action: 'remove', id, alerts: filtered });
  return filtered;
}

export function resetAlert(id, options = {}) {
  const list = getAlerts();
  const alert = list.find(a => a.id === id);
  if (!alert) return null;

  const curPrice = parsePrice(options.currentPrice) || getCurrentLivePrice();
  alert.status = 'ACTIVE';
  alert.triggeredAt = null;
  alert.createdPrice = Math.round(curPrice * 100) / 100;
  alert.lastCheckedPrice = Math.round(curPrice * 100) / 100;

  if (options.direction && ['CROSS_ABOVE', 'CROSS_BELOW'].includes(options.direction)) {
    alert.direction = options.direction;
  } else {
    alert.direction = alert.targetPrice >= curPrice ? 'CROSS_ABOVE' : 'CROSS_BELOW';
  }

  saveAlerts(list);
  broadcastAlertsUpdated({ action: 'reset', alert, alerts: list });
  return alert;
}

export function clearAlerts(mode = 'all') {
  const list = getAlerts();
  const filtered = mode === 'triggered'
    ? list.filter(a => a.status !== 'TRIGGERED')
    : [];

  saveAlerts(filtered);
  broadcastAlertsUpdated({ action: 'clear', mode, alerts: filtered });
  return filtered;
}

/* ── Audio & Haptics ── */
export function playAlertBeep(soundType = 'default') {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.Android?.playNativeChime === 'function') {
      window.Android.playNativeChime(soundType);
      return;
    }
    if (soundType === 'gold' && typeof window.Android?.playGoldChime === 'function') {
      window.Android.playGoldChime();
      return;
    }
    if (typeof window.Android?.playNotificationSound === 'function') {
      window.Android.playNotificationSound(soundType);
      return;
    }
  } catch (_) {}

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtx) audioCtx = new AudioCtx();
    const triggerTone = () => {
      const t = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, t);
      osc1.frequency.setValueAtTime(1174.66, t + 0.18);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(587.33, t);
      osc2.frequency.setValueAtTime(880, t + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.65);
      osc2.stop(t + 0.65);
    };

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(triggerTone).catch(() => {});
    } else {
      triggerTone();
    }
  } catch (err) {
    console.warn('[PriceAlert] Gagal memutar audio beep:', err);
  }
}

export function triggerHapticFeedback(patternType = 'TOUCH') {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.Android?.triggerPatternHaptic === 'function') {
      window.Android.triggerPatternHaptic(patternType);
      return;
    }
    if (window.Android?.triggerHaptic) {
      window.Android.triggerHaptic(18);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch (_) {}
}

/* ── In-App Glass Notification Banner ── */
export function showInAppBanner(alert, price) {
  if (typeof document === 'undefined' || typeof document.getElementById !== 'function' || typeof document.createElement !== 'function') return;
  ensureAlertStyles();

  const noteStr = String(alert.note || '');
  const isIctSweep = noteStr.includes('SSL') || noteStr.includes('BSL') || noteStr.includes('Sweep');
  const isPoi = noteStr.includes('POI') || noteStr.includes('Zone');
  const isTest = Boolean(alert.isTest);
  const badgeTitle = isTest
    ? 'TES NOTIFIKASI ALARM BERHASIL'
    : isIctSweep ? 'LIKUIDITAS SWEEP TERCAPAI' : isPoi ? 'AREA POI TERSENTUH' : 'ALARM HARGA TERCAPAI';

  const bannerId = 'amyfx-price-alert-banner';
  let banner = document.getElementById(bannerId);
  if (!banner) {
    banner = document.createElement('div');
    banner.id = bannerId;
    banner.className = 'amyfx-alert-banner';
    banner.setAttribute('role', 'alert');
    document.body.appendChild(banner);
  } else {
    banner.style.opacity = '1';
    banner.style.transform = 'translateX(-50%)';
  }

  const isAbove = alert.direction === 'CROSS_ABOVE';
  const directionSymbol = isAbove ? '▲' : '▼';
  const directionText = isAbove ? 'Tembus Atas' : 'Tembus Bawah';
  const dirColor = isAbove ? 'var(--pa-buy-text)' : 'var(--pa-sell-text)';

  banner.innerHTML = `
    <div class="amyfx-alert-banner-row">
      <div class="amyfx-alert-banner-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      </div>
      <div class="amyfx-alert-banner-body">
        <div class="amyfx-alert-banner-kicker">${escapeHtml(badgeTitle)}</div>
        <div class="amyfx-alert-banner-title">
          <span>XAU/USD $${Number(price).toFixed(2)}</span>
          <span class="amyfx-alert-banner-dir" style="color:${dirColor};">${directionSymbol} ${directionText}</span>
        </div>
        <div class="amyfx-alert-banner-desc">
          Target $${Number(alert.targetPrice).toFixed(2)} tercapai${noteStr ? ` · <strong>${escapeHtml(noteStr)}</strong>` : ''}
        </div>
      </div>
      <button type="button" id="close-price-alert-banner" class="amyfx-alert-close" aria-label="Tutup notifikasi">&times;</button>
    </div>
  `;

  const closeBtn = document.getElementById('close-price-alert-banner');
  if (closeBtn) {
    closeBtn.onclick = () => {
      if (bannerDismissTimer) clearTimeout(bannerDismissTimer);
      banner.remove();
    };
  }

  if (bannerDismissTimer) clearTimeout(bannerDismissTimer);
  bannerDismissTimer = setTimeout(() => {
    if (banner && banner.parentNode) {
      banner.style.opacity = '0';
      banner.style.transform = 'translate(-50%, -14px)';
      setTimeout(() => banner.remove(), 260);
    }
  }, 8000);
}

/* ── Multi-Channel Dispatch ── */
export function notifyTriggeredAlert(alert, currentPrice) {
  const price = Number(currentPrice);
  const priceStr = price.toFixed(2);
  const targetStr = Number(alert.targetPrice).toFixed(2);

  const noteStr = String(alert.note || '');
  const isIctSweep = noteStr.includes('SSL') || noteStr.includes('BSL') || noteStr.includes('Sweep');
  const isPoi = noteStr.includes('POI') || noteStr.includes('Zone');

  let title = `🔔 Alarm Harga: XAU/USD Menyentuh ${priceStr}`;
  let message = `Target harga ${targetStr} telah tercapai! Pantau aksi harga di chart.`;

  if (alert.isTest) {
    title = `Tes Alarm Harga: XAU/USD $${priceStr}`;
    message = 'Notifikasi visual, suara chime, dan getar berfungsi normal.';
  } else if (isIctSweep) {
    title = `${noteStr.split('(')[0].trim()}: XAU/USD $${priceStr}`;
    message = `Level Likuiditas ${targetStr} telah tersapu (Sweep)! Pantau reaksi konfirmasi di chart.`;
  } else if (isPoi) {
    title = `${noteStr.split('(')[0].trim()}: XAU/USD $${priceStr}`;
    message = `Harga menyentuh area POI $${targetStr}. Cek konfirmasi entry.`;
  } else if (noteStr && noteStr !== 'Alarm Target Harga') {
    title = `${noteStr}: XAU/USD $${priceStr}`;
  }

  const url = (typeof location !== 'undefined' ? location.href.split('#')[0] : '') + '#Dashboard';

  // 1. Android Native Notification Bridge
  try {
    if (window.Android?.showNotificationWithUrl) {
      window.Android.showNotificationWithUrl(title, message, url);
    } else if (window.Android?.showNotification) {
      window.Android.showNotification(title, message);
    }
  } catch (err) {
    console.warn('[PriceAlert] Gagal memanggil Android notification bridge:', err);
  }

  // 2. Web Notification API
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: 'amyfx_alert_' + (alert.id || Date.now())
      });
    }
  } catch (_) {}

  // 3. In-App Banner
  showInAppBanner(alert, price);

  // 4. Audio Beep & Haptic
  playAlertBeep(isIctSweep || isPoi ? 'gold' : 'default');
  triggerHapticFeedback();
}

export async function sendTestNotification() {
  unlockAlertAudio();
  const perm = await requestNotificationPermission();
  const curPrice = getCurrentLivePrice();
  const testAlert = {
    id: 'test_' + Date.now(),
    targetPrice: curPrice,
    direction: 'CROSS_ABOVE',
    note: 'Tes Alarm Harga',
    isTest: true
  };
  notifyTriggeredAlert(testAlert, curPrice);
  return { ok: true, permission: perm, price: curPrice };
}

export const ICT_COOLDOWN_MS = 300000;
const ictAlertCooldowns = new Map();

export function isGoldMarketOpen(nowSeconds = Math.floor(Date.now() / 1000)) {
  if (typeof window !== 'undefined' && typeof window.__amyfxMarketOpen === 'boolean') {
    return window.__amyfxMarketOpen;
  }
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short'
    }).formatToParts(new Date(nowSeconds * 1000));
    const values = Object.fromEntries(parts.map(x => [x.type, x.value]));
    const weekday = values.weekday;
    const hour = Number(values.hour) + Number(values.minute) / 60;
    if (weekday === 'Sat') return false;
    if (weekday === 'Sun') return hour >= 17;
    if (weekday === 'Fri') return hour < 17;
    if (hour >= 17 && hour < 18) return false;
    return true;
  } catch (_) {
    return true;
  }
}

export function getIctContext() {
  if (typeof window !== 'undefined') {
    if (window.AmyMarketContext) return window.AmyMarketContext;
    if (window.amyfxLastContext) return window.amyfxLastContext;
    try {
      const stored = localStorage.getItem('amyfx.market-context.v1');
      if (stored) return JSON.parse(stored);
    } catch (_) {}
  }
  return null;
}

export function getIctCooldowns() { return new Map(ictAlertCooldowns); }
export function clearIctCooldowns() { ictAlertCooldowns.clear(); }
export function showIctBanner(event) {
  if (!event) return;
  showInAppBanner({ targetPrice: getCurrentLivePrice(), direction: 'CROSS_ABOVE', note: event.title || event.message || 'ICT Event' }, getCurrentLivePrice());
}
export function dispatchIctLiveNotification() { return; }
export function checkIctIntrabarSweeps() { return []; }

export function setPreviousPrice(price) {
  previousPrice = parsePrice(price);
}

/* ── Real-Time Price Crossing Engine ── */
export function checkPrice(newPrice) {
  const current = parsePrice(newPrice);
  if (!current) return false;

  const prev = previousPrice;
  const alerts = getAlerts();
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  if (!activeAlerts.length) {
    previousPrice = current;
    return false;
  }

  const triggeredAlerts = [];
  let hasChange = false;
  let lastCheckedDirty = false;

  for (const alert of activeAlerts) {
    const target = alert.targetPrice;
    const p = alert.lastCheckedPrice != null
      ? alert.lastCheckedPrice
      : (alert.createdPrice != null ? alert.createdPrice : (prev !== null ? prev : current));

    let isTriggered = false;
    if (alert.direction === 'CROSS_ABOVE') {
      if (p < target && current >= target) isTriggered = true;
    } else if (alert.direction === 'CROSS_BELOW') {
      if (p > target && current <= target) isTriggered = true;
    }

    if (alert.lastCheckedPrice !== current) {
      alert.lastCheckedPrice = current;
      lastCheckedDirty = true;
    }

    if (isTriggered) {
      alert.status = 'TRIGGERED';
      alert.triggeredAt = Date.now();
      triggeredAlerts.push(alert);
      hasChange = true;
      notifyTriggeredAlert(alert, current);
    }
  }

  previousPrice = current;

  if (hasChange) {
    saveAlerts(alerts);
    lastPersistenceTime = Date.now();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('amyfx:price-alert-triggered', {
        detail: { triggeredAlerts, price: current }
      }));
    }
    broadcastAlertsUpdated({ action: 'triggered', triggeredAlerts, price: current, alerts });
  } else if (lastCheckedDirty) {
    const now = Date.now();
    if (now - lastPersistenceTime >= 3000 || typeof process !== 'undefined') {
      saveAlerts(alerts);
      lastPersistenceTime = now;
    }
  }

  return triggeredAlerts.length > 0;
}

/* ── Shared Alert List Renderer (usable inside Modal or standalone widget) ── */
function buildAlertListMarkup(alerts, currentPrice, options = {}) {
  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const hasTriggered = alerts.some(a => a.status === 'TRIGGERED');

  if (!alerts.length) {
    return `
      <div class="amyfx-alert-empty">
        <div>Belum ada alarm harga yang terpasang.</div>
        <div>Tambahkan target level penting agar notifikasi aktif otomatis saat tersentuh.</div>
        ${options.showEmptyCta ? '<button type="button" class="amyfx-alert-mini-btn amyfx-alert-mini-btn--gold amyfx-goto-new-tab">+ Buat Alarm Pertama</button>' : ''}
      </div>
    `;
  }

  const sorted = [...alerts].sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
    return Math.abs(a.targetPrice - currentPrice) - Math.abs(b.targetPrice - currentPrice);
  });

  const rowsHtml = sorted.map(item => {
    const isTriggered = item.status === 'TRIGGERED';
    const isAbove = item.direction === 'CROSS_ABOVE';
    const dirSymbol = isAbove ? '▲' : '▼';
    const dirCls = isAbove ? 'is-up' : 'is-down';
    const dist = Math.abs(item.targetPrice - currentPrice);
    const distPips = (dist * 10).toFixed(0);
    const notePart = item.note && item.note !== 'Alarm Target Harga'
      ? ` · <strong>${escapeHtml(item.note)}</strong>`
      : '';

    return `
      <div class="amyfx-alert-item ${isTriggered ? 'is-triggered' : ''}">
        <div class="amyfx-alert-item-main">
          <span class="amyfx-alert-dir-icon ${dirCls}" aria-hidden="true">${dirSymbol}</span>
          <div style="min-width:0;flex:1;">
            <div class="amyfx-alert-item-top">
              <strong class="amyfx-alert-price">$${item.targetPrice.toFixed(2)}</strong>
              <span class="amyfx-alert-state-label ${isTriggered ? 'is-hit' : ''}">${isTriggered ? 'Tercapai' : 'Menunggu'}</span>
            </div>
            <div class="amyfx-alert-meta">
              ${isTriggered
                ? `Tersentuh ${formatWitaTime(item.triggeredAt || item.createdAt)}`
                : `Jarak ${dist.toFixed(2)} pts (${distPips} pips) · Awal $${item.createdPrice.toFixed(2)}`
              }${notePart}
            </div>
          </div>
        </div>
        <div class="amyfx-alert-item-actions">
          ${isTriggered ? `<button type="button" class="amyfx-alert-row-btn amyfx-reset-alert-btn" data-id="${escapeHtml(item.id)}">Reset</button>` : ''}
          <button type="button" class="amyfx-alert-row-btn amyfx-alert-row-btn--del amyfx-del-alert-btn" data-id="${escapeHtml(item.id)}" aria-label="Hapus alarm $${item.targetPrice.toFixed(2)}">Hapus</button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="amyfx-alert-list-head">
      <span>${activeCount} aktif · ${alerts.length - activeCount} tercapai</span>
      ${hasTriggered ? '<button type="button" class="amyfx-alert-mini-btn amyfx-clear-triggered-btn">Bersihkan Tercapai</button>' : ''}
    </div>
    <div class="amyfx-alert-list">${rowsHtml}</div>
  `;
}

function bindAlertListActions(root, onEmptyCta) {
  root.querySelector('.amyfx-clear-triggered-btn')?.addEventListener('click', () => {
    clearAlerts('triggered');
  });
  root.querySelector('.amyfx-goto-new-tab')?.addEventListener('click', () => {
    if (typeof onEmptyCta === 'function') onEmptyCta();
  });
  root.querySelectorAll('.amyfx-del-alert-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (id) removeAlert(id);
    });
  });
  root.querySelectorAll('.amyfx-reset-alert-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (id) resetAlert(id);
    });
  });
}

export function renderAlertList(target) {
  if (typeof document === 'undefined') return;
  ensureAlertStyles();
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return;

  registeredContainers.add(container);
  const alerts = getAlerts();
  const currentPrice = getCurrentLivePrice();
  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const listMarkup = buildAlertListMarkup(alerts, currentPrice, { showEmptyCta: false });
  container.innerHTML = `
    <div class="price-alert-widget-box" style="margin-top:14px; padding:14px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <strong style="font-size:13px; color:#fff; display:flex; align-items:center; gap:6px;">
            <span>🔔</span> Alarm Target Harga
          </strong>
          <span style="font-size:10px; font-weight:700; padding:2px 7px; border-radius:10px; background:${activeCount > 0 ? 'rgba(245,196,81,0.2)' : 'rgba(255,255,255,0.08)'}; color:${activeCount > 0 ? '#F5C451' : 'var(--muted,#94A3B8)'};">
            ${activeCount} Aktif
          </span>
        </div>
      </div>
      ${listMarkup}
    </div>
  `;
  bindAlertListActions(container);
}

function renderAllRegisteredContainers() {
  for (const container of registeredContainers) {
    if (document.body.contains(container)) {
      renderAlertList(container);
    } else {
      registeredContainers.delete(container);
    }
  }
}

/* ── Extract Key ICT Levels for Quick Presets ── */
export function getAvailableIctLevels() {
  const ctx = getIctContext();
  const ng = typeof window !== 'undefined' ? window.amyfxLastIndicators : null;
  const levels = [];
  const pushLevel = item => {
    if (!Number.isFinite(item.price) || item.price <= 0) return;
    if (levels.some(x => x.id === item.id)) return;
    levels.push({ ...item, price: Math.round(item.price * 100) / 100 });
  };

  if (ctx) {
    let sslVal = null;
    if (Array.isArray(ctx.liquidity)) {
      const s = ctx.liquidity.find(l => l.label === 'SSL' && Number.isFinite(Number(l.level)));
      if (s) sslVal = Number(s.level);
    }
    if (!sslVal && Number.isFinite(Number(ctx.amy?.dashboard?.ssl))) sslVal = Number(ctx.amy.dashboard.ssl);
    if (sslVal) pushLevel({ id: 'ssl', label: '⚡ SSL Sweep', price: sslVal, direction: 'CROSS_BELOW', note: '⚡ SSL Sweep (Likuiditas Bawah)' });

    let bslVal = null;
    if (Array.isArray(ctx.liquidity)) {
      const b = ctx.liquidity.find(l => l.label === 'BSL' && Number.isFinite(Number(l.level)));
      if (b) bslVal = Number(b.level);
    }
    if (!bslVal && Number.isFinite(Number(ctx.amy?.dashboard?.bsl))) bslVal = Number(ctx.amy.dashboard.bsl);
    if (bslVal) pushLevel({ id: 'bsl', label: '⚡ BSL Sweep', price: bslVal, direction: 'CROSS_ABOVE', note: '⚡ BSL Sweep (Likuiditas Atas)' });

    const sp = typeof window !== 'undefined' ? window.amyfxScalperPlan : null;
    const poi = sp?.area ? { high: sp.area.high, low: sp.area.low, ce: sp.area.ce, kind: sp.kind || 'OB', label: `${sp.side} ${sp.label || 'POI'}` } : (ctx.m15?.poi || ctx.amy?.dashboard?.poi);
    if (poi) {
      const ce = Number(poi.ce);
      const poiPrice = Number.isFinite(ce) && ce > 0 ? ce : (Number(poi.high) + Number(poi.low)) / 2;
      if (Number.isFinite(poiPrice) && poiPrice > 0) {
        pushLevel({ id: 'poi', label: `🎯 POI: ${poi.label || poi.kind || 'M15'}`, price: poiPrice, direction: 'AUTO', note: `🎯 Area POI M15 (${poi.label || poi.kind || 'Zone'})` });
      }
    }

    let pdhVal = null, pdlVal = null;
    if (Array.isArray(ctx.liquidity)) {
      const h = ctx.liquidity.find(l => l.label === 'PDH' && Number.isFinite(Number(l.level)));
      if (h) pdhVal = Number(h.level);
      const l = ctx.liquidity.find(l => l.label === 'PDL' && Number.isFinite(Number(l.level)));
      if (l) pdlVal = Number(l.level);
    }
    if (!pdhVal) pdhVal = Number(ctx.amy?.levels?.pdh || ng?.keyLevels?.pdh || ctx.amy?.dashboard?.pdh);
    if (!pdlVal) pdlVal = Number(ctx.amy?.levels?.pdl || ng?.keyLevels?.pdl || ctx.amy?.dashboard?.pdl);
    if (Number.isFinite(pdhVal) && pdhVal > 0) pushLevel({ id: 'pdh', label: '📅 PDH (High Kemarin)', price: pdhVal, direction: 'CROSS_ABOVE', note: '📅 Break PDH (High Kemarin)' });
    if (Number.isFinite(pdlVal) && pdlVal > 0) pushLevel({ id: 'pdl', label: '📅 PDL (Low Kemarin)', price: pdlVal, direction: 'CROSS_BELOW', note: '📅 Break PDL (Low Kemarin)' });

    let asiaH = null, asiaL = null;
    if (Array.isArray(ctx.liquidity)) {
      const ah = ctx.liquidity.find(l => (l.label === 'ASIA H' || l.label === 'ASIA HIGH') && Number.isFinite(Number(l.level)));
      if (ah) asiaH = Number(ah.level);
      const al = ctx.liquidity.find(l => (l.label === 'ASIA L' || l.label === 'ASIA LOW') && Number.isFinite(Number(l.level)));
      if (al) asiaL = Number(al.level);
    }
    if (!asiaH) asiaH = Number(ctx.amy?.levels?.asiaHigh || ng?.keyLevels?.asiaHigh);
    if (!asiaL) asiaL = Number(ctx.amy?.levels?.asiaLow || ng?.keyLevels?.asiaLow);
    if (Number.isFinite(asiaH) && asiaH > 0) pushLevel({ id: 'asiah', label: 'Asia High', price: asiaH, direction: 'CROSS_ABOVE', note: 'Asia High Sweep' });
    if (Number.isFinite(asiaL) && asiaL > 0) pushLevel({ id: 'asial', label: 'Asia Low', price: asiaL, direction: 'CROSS_BELOW', note: 'Asia Low Sweep' });

    if (ctx.plan && Number.isFinite(Number(ctx.plan.entry))) {
      pushLevel({
        id: 'plan_entry',
        label: `🎯 Entry: ${ctx.plan.signalName || 'Plan'}`,
        price: Number(ctx.plan.entry),
        direction: 'AUTO',
        note: `🎯 Jemputan Entry Plan ($${Number(ctx.plan.entry).toFixed(2)})`
      });
    }
  }

  return levels;
}

/* ── Modern Glass Cockpit Modal (Pasang Baru + Daftar Alarm + Tes Notifikasi) ── */
export function openAddAlertDialog(prefillPrice, options = {}) {
  if (typeof document === 'undefined') return;
  ensureAlertStyles();
  unlockAlertAudio();

  const curPrice = parsePrice(prefillPrice) || getCurrentLivePrice();
  const initialNote = options.note || '';
  const initialDirection = options.direction || 'AUTO';
  const ictPresets = getAvailableIctLevels();
  const initialTab = options.tab === 'list' ? 'list' : 'new';

  const modalId = 'amyfx-add-price-alert-modal';
  const existing = document.getElementById(modalId);
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'amyfx-alert-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'amyfx-alert-modal-title');

  modal.innerHTML = `
    <div class="amyfx-alert-dialog">
      <div class="amyfx-alert-head">
        <div class="amyfx-alert-title-group">
          <span class="amyfx-alert-kicker">XAU/USD · REAL-TIME MONITOR</span>
          <h3 id="amyfx-alert-modal-title">Alarm Target Harga</h3>
        </div>
        <button type="button" id="amyfx-modal-close" class="amyfx-alert-close" aria-label="Tutup modal alarm">&times;</button>
      </div>

      <div class="amyfx-alert-status-bar">
        <div class="amyfx-alert-perm-info">
          <span id="amyfx-perm-dot" class="amyfx-alert-perm-dot"></span>
          <span id="amyfx-perm-text">Memeriksa izin notifikasi…</span>
        </div>
        <div class="amyfx-alert-status-actions">
          <button type="button" id="amyfx-btn-req-perm" class="amyfx-alert-mini-btn amyfx-alert-mini-btn--gold" hidden>Aktifkan Izin</button>
          <button type="button" id="amyfx-btn-test-notif" class="amyfx-alert-mini-btn">Tes Notifikasi</button>
        </div>
      </div>

      <div class="amyfx-alert-tabs" role="tablist" aria-label="Mode modal alarm">
        <button type="button" role="tab" id="amyfx-tab-alert-new" class="amyfx-alert-tab" data-alert-tab="new" aria-selected="true">
          <span>Pasang Baru</span>
        </button>
        <button type="button" role="tab" id="amyfx-tab-alert-list" class="amyfx-alert-tab" data-alert-tab="list" aria-selected="false">
          <span>Daftar Alarm</span>
          <span id="amyfx-tab-list-count" class="amyfx-alert-tab-count">(0)</span>
        </button>
      </div>

      <div class="amyfx-alert-body">
        <div id="amyfx-alert-feedback" class="amyfx-alert-feedback" hidden></div>

        <!-- TAB 1: PASANG BARU -->
        <div id="amyfx-panel-alert-new" role="tabpanel" aria-labelledby="amyfx-tab-alert-new">
          ${ictPresets.length > 0 ? `
            <div class="amyfx-alert-presets-wrap">
              <div class="amyfx-alert-field-label">
                <span>Preset Level ICT</span>
                <span>Klik untuk isi otomatis</span>
              </div>
              <div class="amyfx-alert-chips">
                ${ictPresets.map(p => `
                  <button type="button" class="amyfx-preset-chip" data-price="${p.price.toFixed(2)}" data-dir="${p.direction}" data-note="${escapeHtml(p.note)}">
                    <span>${escapeHtml(p.label)}</span>
                    <span class="amyfx-preset-chip-price">$${p.price.toFixed(2)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="amyfx-alert-field">
            <label class="amyfx-alert-field-label" for="amyfx-alert-input-price">
              <span>Target Harga XAU/USD</span>
              <strong>Live $${curPrice.toFixed(2)}</strong>
            </label>
            <div class="amyfx-alert-input-box">
              <span class="amyfx-alert-prefix">$</span>
              <input type="number" id="amyfx-alert-input-price" class="amyfx-alert-input amyfx-alert-input--price" step="0.10" value="${curPrice.toFixed(2)}" placeholder="3750.00" />
            </div>
          </div>

          <div class="amyfx-alert-field">
            <label class="amyfx-alert-field-label" for="amyfx-alert-input-direction">
              <span>Arah Pemicu</span>
            </label>
            <select id="amyfx-alert-input-direction" class="amyfx-alert-select">
              <option value="AUTO" ${initialDirection === 'AUTO' ? 'selected' : ''}>Otomatis (sesuai posisi harga)</option>
              <option value="CROSS_ABOVE" ${initialDirection === 'CROSS_ABOVE' ? 'selected' : ''}>▲ Tembus Ke Atas (BSL / Resistance)</option>
              <option value="CROSS_BELOW" ${initialDirection === 'CROSS_BELOW' ? 'selected' : ''}>▼ Tembus Ke Bawah (SSL / Support)</option>
            </select>
          </div>

          <div class="amyfx-alert-field">
            <label class="amyfx-alert-field-label" for="amyfx-alert-input-note">
              <span>Catatan Notifikasi</span>
            </label>
            <input type="text" id="amyfx-alert-input-note" class="amyfx-alert-input amyfx-alert-input--text" value="${escapeHtml(initialNote)}" placeholder="Contoh: SSL Sweep / Retest OB M15" />
          </div>

          <div class="amyfx-alert-form-actions">
            <button type="button" id="amyfx-modal-cancel" class="amyfx-alert-btn">Tutup</button>
            <button type="button" id="amyfx-modal-save" class="amyfx-alert-btn amyfx-alert-btn--primary">Simpan Alarm</button>
          </div>
        </div>

        <!-- TAB 2: DAFTAR ALARM -->
        <div id="amyfx-panel-alert-list" role="tabpanel" aria-labelledby="amyfx-tab-alert-list" hidden>
          <div id="amyfx-modal-alert-list-body"></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const priceInput = document.getElementById('amyfx-alert-input-price');
  const dirInput = document.getElementById('amyfx-alert-input-direction');
  const noteInput = document.getElementById('amyfx-alert-input-note');
  const feedbackEl = document.getElementById('amyfx-alert-feedback');
  const tabNewBtn = document.getElementById('amyfx-tab-alert-new');
  const tabListBtn = document.getElementById('amyfx-tab-alert-list');
  const tabListCount = document.getElementById('amyfx-tab-list-count');
  const panelNew = document.getElementById('amyfx-panel-alert-new');
  const panelList = document.getElementById('amyfx-panel-alert-list');
  const listBody = document.getElementById('amyfx-modal-alert-list-body');
  const permDot = document.getElementById('amyfx-perm-dot');
  const permText = document.getElementById('amyfx-perm-text');
  const reqPermBtn = document.getElementById('amyfx-btn-req-perm');
  const testNotifBtn = document.getElementById('amyfx-btn-test-notif');

  const showFeedback = (msg, type = 'success') => {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.className = `amyfx-alert-feedback ${type === 'error' ? 'is-error' : 'is-success'}`;
    feedbackEl.hidden = false;
  };
  const hideFeedback = () => { if (feedbackEl) feedbackEl.hidden = true; };

  const refreshPermissionUI = () => {
    const st = getNotificationStatus();
    if (!permDot || !permText || !reqPermBtn) return;
    if (st.native) {
      permDot.className = 'amyfx-alert-perm-dot is-ok';
      permText.textContent = 'Notifikasi Android Native Aktif';
      reqPermBtn.hidden = true;
    } else if (st.permission === 'granted') {
      permDot.className = 'amyfx-alert-perm-dot is-ok';
      permText.textContent = 'Notifikasi Browser & Suara Aktif';
      reqPermBtn.hidden = true;
    } else if (st.permission === 'denied') {
      permDot.className = 'amyfx-alert-perm-dot is-err';
      permText.textContent = 'Notif Browser Diblokir · Banner In-App Aktif';
      reqPermBtn.hidden = true;
    } else if (st.permission === 'default') {
      permDot.className = 'amyfx-alert-perm-dot is-warn';
      permText.textContent = 'Izin Notifikasi Browser Belum Aktif';
      reqPermBtn.hidden = false;
    } else {
      permDot.className = 'amyfx-alert-perm-dot is-warn';
      permText.textContent = 'Mode Banner In-App & Audio Aktif';
      reqPermBtn.hidden = true;
    }
  };

  const setModalTab = tab => {
    const isList = tab === 'list';
    if (tabNewBtn) {
      tabNewBtn.classList.toggle('is-active', !isList);
      tabNewBtn.setAttribute('aria-selected', String(!isList));
    }
    if (tabListBtn) {
      tabListBtn.classList.toggle('is-active', isList);
      tabListBtn.setAttribute('aria-selected', String(isList));
    }
    if (panelNew) panelNew.hidden = isList;
    if (panelList) panelList.hidden = !isList;
    if (isList) refreshModalList();
  };

  const refreshModalList = () => {
    const alerts = getAlerts();
    const activeCount = alerts.filter(a => a.status === 'ACTIVE').length;
    if (tabListCount) tabListCount.textContent = `(${activeCount})`;
    if (listBody) {
      listBody.innerHTML = buildAlertListMarkup(alerts, getCurrentLivePrice(), { showEmptyCta: true });
      bindAlertListActions(listBody, () => setModalTab('new'));
    }
  };

  const onAlertsChanged = () => {
    if (!document.body.contains(modal)) {
      window.removeEventListener('amyfx:price-alerts-updated', onAlertsChanged);
      return;
    }
    refreshModalList();
  };
  window.addEventListener('amyfx:price-alerts-updated', onAlertsChanged);

  const closeModal = () => {
    window.removeEventListener('amyfx:price-alerts-updated', onAlertsChanged);
    modal.remove();
  };

  tabNewBtn?.addEventListener('click', () => { hideFeedback(); setModalTab('new'); });
  tabListBtn?.addEventListener('click', () => { hideFeedback(); setModalTab('list'); });

  reqPermBtn?.addEventListener('click', async () => {
    unlockAlertAudio();
    const res = await requestNotificationPermission();
    refreshPermissionUI();
    if (res === 'granted' || res === 'native') {
      showFeedback('Izin notifikasi berhasil diaktifkan.', 'success');
    } else if (res === 'denied') {
      showFeedback('Izin notifikasi ditolak browser. Banner in-app & audio tetap berfungsi.', 'error');
    }
  });

  testNotifBtn?.addEventListener('click', async () => {
    const res = await sendTestNotification();
    refreshPermissionUI();
    showFeedback(
      res.permission === 'granted' || res.permission === 'native'
        ? 'Tes notifikasi terkirim (OS/Browser + Banner In-App + Suara Chime).'
        : 'Tes terkirim (Banner In-App + Suara Chime). Aktifkan izin browser bila ingin notifikasi OS.',
      'success'
    );
  });

  modal.querySelectorAll('.amyfx-preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-price');
      const d = btn.getAttribute('data-dir');
      const n = btn.getAttribute('data-note');
      if (priceInput && p) priceInput.value = p;
      if (dirInput && d) dirInput.value = d;
      if (noteInput && n) noteInput.value = n;
      modal.querySelectorAll('.amyfx-preset-chip').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      hideFeedback();
      triggerHapticFeedback('TOUCH');
    });
  });

  document.getElementById('amyfx-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('amyfx-modal-cancel')?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  document.getElementById('amyfx-modal-save')?.addEventListener('click', async () => {
    unlockAlertAudio();
    const target = parsePrice(priceInput?.value);
    if (!target) {
      showFeedback('Masukkan angka target harga XAU/USD yang valid.', 'error');
      priceInput?.focus();
      return;
    }

    // Request browser notification permission inside user gesture if still default
    const permBefore = getNotificationStatus().permission;
    if (permBefore === 'default') {
      await requestNotificationPermission();
      refreshPermissionUI();
    }

    const dirVal = dirInput?.value;
    const direction = dirVal === 'AUTO' ? undefined : dirVal;
    const note = noteInput?.value?.trim();

    try {
      const saved = addAlert(target, { direction, note, currentPrice: curPrice });
      triggerHapticFeedback('TOUCH');
      const dirTxt = saved.direction === 'CROSS_ABOVE' ? 'Tembus Atas' : 'Tembus Bawah';
      showFeedback(`Alarm $${saved.targetPrice.toFixed(2)} (${dirTxt}) disimpan & ditampilkan di chart.`, 'success');
      setModalTab('list');
    } catch (err) {
      showFeedback(err.message || 'Gagal menyimpan alarm.', 'error');
    }
  });

  refreshPermissionUI();
  refreshModalList();
  setModalTab(initialTab);

  if (initialTab === 'new' && priceInput) {
    priceInput.focus();
    priceInput.select();
  }
}

export function mountPriceAlertWidget(containerOrSelector) {
  renderAlertList(containerOrSelector);
}

/* ── Background Multi-Source Price Observer (Mapping + Beranda) ── */
export function initPriceAlertObserver() {
  if (observerInitialized || typeof window === 'undefined') return;
  observerInitialized = true;

  window.addEventListener('amyfx:twelvedata-price', event => {
    const price = event?.detail?.price;
    if (price) checkPrice(price);
  });

  window.addEventListener('amyfx:live-price-display', event => {
    const price = event?.detail?.price;
    if (price) checkPrice(price);
  });

  window.addEventListener('amyfx:price-tick', event => {
    const price = event?.detail?.price || event?.detail;
    if (price) checkPrice(price);
  });

  window.addEventListener('amyfx:market-context', event => {
    const candles = event?.detail?.amy?.chartCandles?.M15;
    if (candles?.length) {
      const last = candles.at(-1);
      if (last?.close) checkPrice(last.close);
    }
  });

  if (typeof document !== 'undefined') {
    const observedEls = new WeakSet();
    const attachDomObservers = () => {
      syncAlertButtonBadges();
      for (const id of ['chart-price', 'home-chart-price']) {
        const el = document.getElementById(id);
        if (el && !observedEls.has(el)) {
          observedEls.add(el);
          const obs = new MutationObserver(() => {
            const p = parseFloat(String(el.textContent || '').replace(/[^0-9.]/g, ''));
            if (parsePrice(p)) checkPrice(p);
          });
          obs.observe(el, { childList: true, characterData: true, subtree: true });
        }
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachDomObservers);
    } else {
      attachDomObservers();
    }

    // Periodic safety check (2.5s): also catches SPA re-renders & initializes previousPrice safely
    setInterval(() => {
      attachDomObservers();
      const p = getCurrentLivePrice();
      if (p) {
        if (previousPrice === null) {
          previousPrice = p;
        } else if (Math.abs(p - previousPrice) > 0.001) {
          checkPrice(p);
        }
      }
    }, 2500);
  }
}

export function getStats() {
  const alerts = getAlerts();
  return {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'ACTIVE').length,
    triggered: alerts.filter(a => a.status === 'TRIGGERED').length,
    currentPrice: getCurrentLivePrice()
  };
}

const priceAlertManager = {
  getAlerts,
  saveAlerts,
  addAlert,
  removeAlert,
  resetAlert,
  clearAlerts,
  checkPrice,
  setPreviousPrice,
  getCurrentLivePrice,
  getNotificationStatus,
  requestNotificationPermission,
  unlockAlertAudio,
  sendTestNotification,
  syncAlertButtonBadges,
  notifyTriggeredAlert,
  playAlertBeep,
  triggerHapticFeedback,
  showInAppBanner,
  showIctBanner,
  dispatchIctLiveNotification,
  renderAlertList,
  openAddAlertDialog,
  mountPriceAlertWidget,
  initPriceAlertObserver,
  getStats,
  checkIctIntrabarSweeps,
  isGoldMarketOpen,
  getIctContext,
  getAvailableIctLevels,
  getIctCooldowns,
  clearIctCooldowns
};

if (typeof globalThis !== 'undefined') {
  globalThis.AmyPriceAlertManager = priceAlertManager;
}
if (typeof window !== 'undefined') {
  window.AmyPriceAlertManager = priceAlertManager;
  initPriceAlertObserver();
}

export default priceAlertManager;
