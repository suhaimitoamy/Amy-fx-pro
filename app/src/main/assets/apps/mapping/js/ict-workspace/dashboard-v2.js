/**
 * ICT DASHBOARD V3 — Amy FX Pro Modern Glass Cockpit
 * Menggerakkan:
 *   1. Hero Ringkas (Live Price, Bias 3-TF Horizontal, Telemetri Break/Sweep/DOL)
 *   2. Dealing Range Horizontal Gauge (Discount / EQ 50% / Premium + PDH/PDL)
 *   3. Peta Skenario Prioritas + No-Trade Zone
 *   4. Panel Eksekusi POI Terpadu dengan Tab Switch BUY / SELL + Hitung Lot
 */

import {
  resolveM15Direction,
  formatPdlPdhRange,
  resolveSsotTelemetry,
  formatTp1Subtitle,
  selectScalperDualLayerPoi,
  evaluateScalperPoiVerdict
} from './mapping-accuracy.js';
import { calculateNextGenIndicators } from './nextgen-indicators.js';
import { resolveGoldSessionState } from '../engine/market-session-clock.js';
import {
  BACKFILL_ENGINE_VERSION,
  computeGoldSlBuffer,
  computeGoldSlPrice,
  computePoiRecordPnl,
  computePoiPortfolioLedger,
  loadHistoryState,
  saveHistoryState,
  backfillFromCandles,
  recordLivePoiProgress,
  mergeHistoryState,
  filterByRange,
  summarizePoiStats,
  summarizePoiBreakdown,
  buildPoiCalendarMonth,
  getDayPoiRecords,
  getWitaYearMonth,
  witaDateKey,
  formatWitaClock,
  createEmptyHistoryState
} from './mapping-history-engine.js';
import {
  buildMappingJournalPrefill,
  evaluateMappingNewsLock
} from '../engine/cockpit-bridge-helpers.js';

(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = id => document.getElementById(id);
  const fmt = v => (Number.isFinite(Number(v)) && Number(v) > 0) ? Number(v).toFixed(2) : '—';
  const fmtRange = (lo, hi) => (fmt(lo) !== '—' && fmt(hi) !== '—') ? `$${fmt(lo)} – $${fmt(hi)}` : '—';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : NaN; };

  /* ── Active Setup Session Memory (Agar Setup Tidak Menguap Saat Disentuh) ── */
  let activeSellSession = null;
  let activeBuySession = null;

  /* ── Tab Switch BUY / SELL & Latest Plan Cache (untuk Hitung Lot, Alarm Entry, Chart Sync) ── */
  let activePoiTab = 'BUY';
  let userLockedTab = false;
  let latestBuyPlan = null;
  let latestSellPlan = null;
  let latestBuyOverlay = null;
  let backupBuyOverlay = null;
  let latestSellOverlay = null;
  let backupSellOverlay = null;
  let lastPublishedPlanSig = '';
  const dualLayerCache = { m15Key: '', m15Ng: null, m5Key: '', m5Ng: null };

  /* ── Riwayat Reaksi & Hasil POI State (180 Hari Detail + Arsip Kalender Permanen + Cloud Sync) ── */
  const historyStorage = typeof window !== 'undefined' ? window.localStorage : null;
  let mappingHistoryState = loadHistoryState(historyStorage);
  let activeHistoryTab = 'POI';
  let activeHistoryRange = 'TODAY';
  let historyShowAll = false;
  let lastHistoryBackfillKey = '';
  let historyResetFloorMs = 0;
  const initialYm = getWitaYearMonth(Date.now());
  let historyCalendarYear = initialYm.year;
  let historyCalendarMonth = initialYm.month;
  let selectedCalendarDate = witaDateKey(Date.now());
  let calendarDayFilter = 'ALL';
  let calendarDayShowAll = false;
  let historyClearArmedUntil = 0;
  let historyClearArmTimer = null;

  function toNgCandles(rows) {
    if (!Array.isArray(rows) || rows.length < 15) return [];
    return rows
      .map(c => ({
        time: Number(c.open_time ?? c.time),
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close)
      }))
      .filter(c => Number.isFinite(c.time) && Number.isFinite(c.open) && Number.isFinite(c.high) && Number.isFinite(c.low) && Number.isFinite(c.close));
  }

  function getDualLayerNextGen(amy, chartNg) {
    const chartIsM15 = chartNg && (!chartNg.tf || String(chartNg.tf).toUpperCase() === 'M15');
    let ngM15 = chartIsM15 ? chartNg : null;
    const rawM15 = amy?.chartCandles?.M15;
    if (!ngM15 && Array.isArray(rawM15) && rawM15.length >= 20) {
      const lastBar = rawM15[rawM15.length - 1];
      const key = `${rawM15.length}:${lastBar?.open_time}:${lastBar?.close}`;
      if (dualLayerCache.m15Key !== key) {
        dualLayerCache.m15Ng = calculateNextGenIndicators(toNgCandles(rawM15), { tf: 'M15' });
        dualLayerCache.m15Key = key;
      }
      ngM15 = dualLayerCache.m15Ng;
    }

    let ngM5 = (chartNg && String(chartNg.tf || '').toUpperCase() === 'M5') ? chartNg : null;
    const rawM5 = amy?.chartCandles?.M5;
    if (!ngM5 && Array.isArray(rawM5) && rawM5.length >= 20) {
      const lastBar = rawM5[rawM5.length - 1];
      const key = `${rawM5.length}:${lastBar?.open_time}:${lastBar?.close}`;
      if (dualLayerCache.m5Key !== key) {
        dualLayerCache.m5Ng = calculateNextGenIndicators(toNgCandles(rawM5), { tf: 'M5' });
        dualLayerCache.m5Key = key;
      }
      ngM5 = dualLayerCache.m5Ng;
    }
    return { ngM15, ngM5 };
  }

  /* ── Jam WITA (Pill Sesi Header dimiliki 100% oleh market-session-clock.js agar bebas bentrok timer) ── */
  function getWITA() {
    return new Date().toLocaleTimeString('id-ID', {
      timeZone: 'Asia/Makassar',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WITA';
  }

  function startClock() {
    const el = $('hero-clock');
    if (el) el.textContent = getWITA();
    setInterval(() => {
      const e = $('hero-clock');
      if (e) e.textContent = getWITA();
    }, 1000);
  }

  /* ── Single Source of Truth Sync: POI Scalper Pro -> Chart Gold & Hero Entry Distance ── */
  function publishActiveScalperPlan() {
    const preferred = activePoiTab === 'SELL'
      ? (latestSellOverlay || latestBuyOverlay)
      : (latestBuyOverlay || latestSellOverlay);
    window.amyfxScalperPlan = preferred || null;
    const sig = preferred
      ? `${preferred.side}:${preferred.area?.low}:${preferred.area?.high}:${preferred.tp1}:${preferred.tp2}:${preferred.sl}`
      : 'NONE';
    if (sig !== lastPublishedPlanSig) {
      lastPublishedPlanSig = sig;
      window.dispatchEvent(new CustomEvent('amyfx:scalper-plan-updated', { detail: preferred || null }));
    }
    updateEntryDistanceTelemetry(Number(window.amyfxCurrentPrice) || 0);
  }

  function updateEntryDistanceTelemetry(livePrice) {
    const el = $('hero-entry-dist-val');
    if (!el) return;
    const plan = window.amyfxScalperPlan;
    if (!plan || !plan.area || !Number.isFinite(plan.area.low) || !Number.isFinite(plan.area.high)) {
      el.textContent = 'Menunggu POI Valid';
      el.className = 'hero-ict-val';
      return;
    }
    const p = Number(livePrice) || Number(window.amyfxCurrentPrice) || 0;
    const isSell = plan.side === 'SELL';
    const sideLabel = isSell ? 'Supply Sell' : 'Demand Buy';
    const kindLabel = plan.kind || 'OB';
    if (p <= 0) {
      el.textContent = `${kindLabel} ${sideLabel} $${fmt(plan.area.low)}–$${fmt(plan.area.high)}`;
      el.className = 'hero-ict-val is-gold';
      return;
    }
    if (p >= plan.area.low - 0.15 && p <= plan.area.high + 0.15) {
      el.textContent = `Di Dalam Zona ${kindLabel} ${plan.side}!`;
      el.className = 'hero-ict-val is-gold';
      return;
    }
    const edge = isSell ? plan.area.low : plan.area.high;
    const diff = edge - p;
    const sign = diff >= 0 ? '+' : '-';
    const absD = Math.abs(diff);
    el.textContent = `${sign}$${absD.toFixed(2)} ke ${kindLabel} ${plan.side} ($${fmt(edge)})`;
    el.className = `hero-ict-val ${absD <= 3.5 ? 'is-gold' : (isSell ? 'is-bear' : 'is-bull')}`;
  }

  /* ── 1-Klik Alarm Entry Helpers ── */
  function findActiveAlarmNear(targetPrice) {
    if (!Number.isFinite(targetPrice) || typeof window.AmyPriceAlertManager?.getAlerts !== 'function') return null;
    const alerts = window.AmyPriceAlertManager.getAlerts();
    return alerts.find(a => a.status === 'ACTIVE' && Math.abs(Number(a.targetPrice) - targetPrice) <= 0.25) || null;
  }

  function syncEntryAlarmButtons() {
    const configs = [
      { btnId: 'btn-alarm-buy', lblId: 'btn-alarm-buy-label', plan: latestBuyPlan, overlay: latestBuyOverlay, side: 'BUY' },
      { btnId: 'btn-alarm-sell', lblId: 'btn-alarm-sell-label', plan: latestSellPlan, overlay: latestSellOverlay, side: 'SELL' }
    ];
    for (const c of configs) {
      const btn = $(c.btnId);
      const lbl = $(c.lblId);
      if (!btn || !lbl) continue;
      const target = c.overlay?.alarmPrice ?? c.plan?.entry;
      const existing = Number.isFinite(target) ? findActiveAlarmNear(target) : null;
      if (existing) {
        btn.classList.add('is-armed');
        lbl.textContent = `Alarm $${Number(existing.targetPrice).toFixed(2)}`;
        btn.title = 'Alarm sudah aktif — klik untuk kelola daftar alarm';
      } else {
        btn.classList.remove('is-armed');
        lbl.textContent = 'Alarm Entry';
        btn.title = Number.isFinite(target)
          ? `Pasang alarm 1-klik di $${target.toFixed(2)} (batas Entry ${c.side})`
          : `Buka pengaturan alarm harga ${c.side}`;
      }
    }
  }

  function triggerQuickEntryAlarm(side) {
    const mgr = window.AmyPriceAlertManager;
    if (!mgr) return;
    const isSell = side === 'SELL';
    const ov = isSell ? latestSellOverlay : latestBuyOverlay;
    const plan = isSell ? latestSellPlan : latestBuyPlan;
    const target = ov?.alarmPrice ?? plan?.entry;

    if (!Number.isFinite(target) || target <= 0) {
      mgr.openAddAlertDialog?.(undefined, { note: `Entry ${side} XAU/USD` });
      return;
    }

    const existing = findActiveAlarmNear(target);
    if (existing) {
      mgr.openAddAlertDialog?.(target, { tab: 'list' });
      return;
    }

    try {
      mgr.unlockAlertAudio?.();
      const note = `Entry ${ov?.kind || 'POI'} ${side} · CE $${fmt(ov?.area?.ce || target)}`;
      const created = mgr.addAlert(target, { direction: 'AUTO', note });
      syncEntryAlarmButtons();
      mgr.showInAppBanner?.({
        targetPrice: created.targetPrice,
        direction: created.direction,
        note: `Alarm 1-Klik Terpasang · ${note}`
      }, Number(window.amyfxCurrentPrice) || created.targetPrice);
    } catch (_) {
      mgr.openAddAlertDialog?.(target, { note: `Entry ${side} XAU/USD` });
    }
  }

  /* ── Tab Switcher BUY / SELL ── */
  function setActivePoiTab(side, isManual) {
    const target = String(side).toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
    if (isManual) userLockedTab = true;
    activePoiTab = target;

    const buyBtn = $('tab-poi-buy');
    const sellBtn = $('tab-poi-sell');
    const buyPanel = $('card-poi-buy');
    const sellPanel = $('card-poi-sell');

    const isBuy = target === 'BUY';
    if (buyBtn) {
      buyBtn.classList.toggle('is-active', isBuy);
      buyBtn.setAttribute('aria-selected', isBuy ? 'true' : 'false');
    }
    if (sellBtn) {
      sellBtn.classList.toggle('is-active', !isBuy);
      sellBtn.setAttribute('aria-selected', !isBuy ? 'true' : 'false');
    }
    if (buyPanel) buyPanel.hidden = !isBuy;
    if (sellPanel) sellPanel.hidden = isBuy;

    if (isManual) publishActiveScalperPlan();
  }

  function bindCockpitInteractions() {
    document.querySelectorAll('[data-poi-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const side = btn.getAttribute('data-poi-tab');
        setActivePoiTab(side, true);
      });
    });

    const openLotFor = plan => {
      if (!plan || !Number.isFinite(plan.entry) || !Number.isFinite(plan.sl)) {
        window.dispatchEvent(new CustomEvent('amyfx:open-lot-calc', { detail: {} }));
        return;
      }
      window.dispatchEvent(new CustomEvent('amyfx:open-lot-calc', { detail: plan }));
    };

    const btnLotBuy = $('btn-lot-buy');
    if (btnLotBuy) btnLotBuy.addEventListener('click', () => openLotFor(latestBuyPlan));

    const btnLotSell = $('btn-lot-sell');
    if (btnLotSell) btnLotSell.addEventListener('click', () => openLotFor(latestSellPlan));

    const btnAlarmBuy = $('btn-alarm-buy');
    if (btnAlarmBuy) btnAlarmBuy.addEventListener('click', () => triggerQuickEntryAlarm('BUY'));

    const btnAlarmSell = $('btn-alarm-sell');
    if (btnAlarmSell) btnAlarmSell.addEventListener('click', () => triggerQuickEntryAlarm('SELL'));

    const triggerQuickJournal = side => {
      const isSell = side === 'SELL';
      const plan = isSell ? latestSellPlan : latestBuyPlan;
      const overlay = isSell ? latestSellOverlay : latestBuyOverlay;
      const gradeEl = $(isSell ? 'sell-verdict-grade' : 'buy-verdict-grade');
      const biasEl = $('hero-bias-pill');
      const sessionEl = $('cockpit-session-pill');
      const payload = buildMappingJournalPrefill(
        plan || { side },
        overlay,
        {
          side,
          grade: gradeEl?.textContent?.trim() || '',
          bias: biasEl?.textContent?.trim() || '',
          session: sessionEl?.textContent?.trim() || '',
          nowMs: Date.now()
        }
      );
      try {
        localStorage.setItem('amy_mapping_journal_prefill_v1', JSON.stringify(payload));
        if (window.Android?.triggerHaptic) window.Android.triggerHaptic(35);
      } catch (_) {}
      window.location.href = '../journal/index.html?prefill=mapping';
    };

    const btnJournalBuy = $('btn-journal-buy');
    if (btnJournalBuy) btnJournalBuy.addEventListener('click', () => triggerQuickJournal('BUY'));

    const btnJournalSell = $('btn-journal-sell');
    if (btnJournalSell) btnJournalSell.addEventListener('click', () => triggerQuickJournal('SELL'));

    // News Lock banner synced with Market Intel USD High-Impact calendar
    const applyNewsLockBanner = events => {
      const banner = $('poi-news-lock-banner');
      const tagEl = $('poi-news-lock-tag');
      const msgEl = $('poi-news-lock-msg');
      if (!banner || !tagEl || !msgEl) return;
      const status = evaluateMappingNewsLock(events, Date.now());
      if (status.level === 'SAFE') {
        banner.hidden = true;
        banner.classList.remove('is-lock', 'is-warn');
        return;
      }
      banner.hidden = false;
      banner.classList.toggle('is-lock', status.level === 'LOCK');
      banner.classList.toggle('is-warn', status.level === 'WARN');
      tagEl.textContent = status.level === 'LOCK' ? 'NEWS LOCK' : 'WASPADA BERITA';
      msgEl.textContent = status.message;
    };

    const refreshNewsLockStatus = async () => {
      try {
        const raw = localStorage.getItem('amy_economic_calendar_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.events) && parsed.events.length) {
            applyNewsLockBanner(parsed.events);
          }
        }
      } catch (_) {}

      try {
        if (typeof location !== 'undefined' && location.origin && !location.origin.startsWith('file:')) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 4500);
          const res = await fetch(`${location.origin}/api/calendar`, { signal: controller.signal, cache: 'no-store' });
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data?.events) ? data.events : (Array.isArray(data) ? data : []);
            if (list.length) applyNewsLockBanner(list);
          }
        }
      } catch (_) {}
    };

    void refreshNewsLockStatus();
    setInterval(() => void refreshNewsLockStatus(), 60_000);

    // Riwayat Reaksi & Hasil POI interactions
    document.querySelectorAll('[data-history-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-history-tab');
        setActiveHistoryTab(tab);
      });
    });

    document.querySelectorAll('[data-history-range]').forEach(btn => {
      btn.addEventListener('click', () => {
        const range = btn.getAttribute('data-history-range');
        setActiveHistoryRange(range);
      });
    });

    const btnHistoryMore = $('btn-history-toggle-all');
    if (btnHistoryMore) {
      btnHistoryMore.addEventListener('click', () => {
        historyShowAll = !historyShowAll;
        renderMappingHistory();
      });
    }

    const btnHistoryClear = $('btn-history-clear');
    if (btnHistoryClear) {
      btnHistoryClear.addEventListener('click', () => {
        const now = Date.now();
        if (now > historyClearArmedUntil) {
          historyClearArmedUntil = now + 4500;
          btnHistoryClear.textContent = 'Ketuk lagi untuk hapus';
          btnHistoryClear.classList.add('is-armed');
          if (historyClearArmTimer) clearTimeout(historyClearArmTimer);
          historyClearArmTimer = setTimeout(() => {
            historyClearArmedUntil = 0;
            btnHistoryClear.textContent = 'Reset Riwayat';
            btnHistoryClear.classList.remove('is-armed');
          }, 4600);
          return;
        }
        if (historyClearArmTimer) clearTimeout(historyClearArmTimer);
        historyClearArmedUntil = 0;
        btnHistoryClear.textContent = 'Reset Riwayat';
        btnHistoryClear.classList.remove('is-armed');
        historyResetFloorMs = now;
        historyShowAll = false;
        calendarDayShowAll = false;
        selectedCalendarDate = '';
        mappingHistoryState = createEmptyHistoryState();
        saveHistoryState(historyStorage, mappingHistoryState);
        try { window.dispatchEvent(new CustomEvent('amyfx:poi-history-updated')); } catch (_) {}
        renderMappingHistory();
      });
    }

    const btnCalPrev = $('btn-poi-cal-prev');
    if (btnCalPrev) {
      btnCalPrev.addEventListener('click', () => shiftHistoryCalendarMonth(-1));
    }
    const btnCalNext = $('btn-poi-cal-next');
    if (btnCalNext) {
      btnCalNext.addEventListener('click', () => shiftHistoryCalendarMonth(1));
    }

    // Reload local POI history whenever GitHub Cloud Sync pulls fresh data
    window.addEventListener('amyfx:cloud-sync-pulled', () => {
      mappingHistoryState = loadHistoryState(historyStorage);
      renderMappingHistory();
    });
  }

  function shiftHistoryCalendarMonth(offset) {
    const next = new Date(Date.UTC(historyCalendarYear, historyCalendarMonth + offset, 1));
    historyCalendarYear = next.getUTCFullYear();
    historyCalendarMonth = next.getUTCMonth();
    calendarDayFilter = 'ALL';
    calendarDayShowAll = false;
    selectedCalendarDate = '';
    renderMappingHistory();
  }

  /* ── Riwayat Reaksi & Hasil POI Rendering & Sync ── */
  function setActiveHistoryTab(tab) {
    const upper = String(tab).toUpperCase();
    activeHistoryTab = upper === 'TIMELINE' ? 'TIMELINE' : (upper === 'CALENDAR' ? 'CALENDAR' : 'POI');
    historyShowAll = false;
    const isPoi = activeHistoryTab === 'POI';
    const isTl = activeHistoryTab === 'TIMELINE';
    const isCal = activeHistoryTab === 'CALENDAR';

    const tabPoi = $('tab-history-poi');
    const tabTl = $('tab-history-timeline');
    const tabCal = $('tab-history-calendar');
    const panelPoi = $('panel-history-poi');
    const panelTl = $('panel-history-timeline');
    const panelCal = $('panel-history-calendar');
    const rangeSwitch = $('history-range-switch');

    if (tabPoi) {
      tabPoi.classList.toggle('is-active', isPoi);
      tabPoi.setAttribute('aria-selected', isPoi ? 'true' : 'false');
    }
    if (tabTl) {
      tabTl.classList.toggle('is-active', isTl);
      tabTl.setAttribute('aria-selected', isTl ? 'true' : 'false');
    }
    if (tabCal) {
      tabCal.classList.toggle('is-active', isCal);
      tabCal.setAttribute('aria-selected', isCal ? 'true' : 'false');
    }
    if (panelPoi) panelPoi.hidden = !isPoi;
    if (panelTl) panelTl.hidden = !isTl;
    if (panelCal) panelCal.hidden = !isCal;
    if (rangeSwitch) rangeSwitch.hidden = isCal;

    renderMappingHistory();
  }

  function setActiveHistoryRange(range) {
    activeHistoryRange = String(range).toUpperCase() === '7D' ? '7D' : 'TODAY';
    historyShowAll = false;
    const isToday = activeHistoryRange === 'TODAY';

    const btnToday = $('history-range-today');
    const btn7d = $('history-range-7d');
    if (btnToday) {
      btnToday.classList.toggle('is-active', isToday);
      btnToday.setAttribute('aria-pressed', isToday ? 'true' : 'false');
    }
    if (btn7d) {
      btn7d.classList.toggle('is-active', !isToday);
      btn7d.setAttribute('aria-pressed', !isToday ? 'true' : 'false');
    }

    renderMappingHistory();
  }

  function formatPoiOutcomeBadge(rec) {
    switch (rec?.status) {
      case 'TP2_HIT':
        return { text: 'TP2 DOL ★', cls: 'is-tp2' };
      case 'TP1_HIT':
        return { text: 'TP1 BEP ✓', cls: 'is-tp1' };
      case 'REACTING':
        return { text: `Memantul +$${Number(rec.maxFavorable || 0).toFixed(1)}`, cls: 'is-react' };
      case 'SL_HIT':
        return { text: 'Jebol SL ✕', cls: 'is-sl' };
      default:
        return { text: 'Disentuh', cls: 'is-test' };
    }
  }

  function formatTimelineCategory(ev) {
    const sideUpper = String(ev?.side || '').toUpperCase();
    const isBuy = sideUpper === 'BUY';
    const isSell = sideUpper === 'SELL';
    const sideTone = isBuy ? 'is-buy' : isSell ? 'is-sell' : 'is-gold';

    switch (ev?.category) {
      case 'POI_TOUCH':
        return { label: 'POI', tagCls: isBuy ? 'is-buy' : isSell ? 'is-sell' : 'is-cat', itemCls: sideTone };
      case 'POI_OUTCOME':
        return { label: 'HASIL', tagCls: isBuy ? 'is-buy' : isSell ? 'is-sell' : 'is-cat', itemCls: sideTone };
      case 'SWEEP':
        return { label: 'SWEEP', tagCls: 'is-gold', itemCls: 'is-gold' };
      case 'BREAK':
        return { label: 'STRUKTUR', tagCls: isBuy ? 'is-buy' : isSell ? 'is-sell' : 'is-cat', itemCls: sideTone };
      case 'KEY_LEVEL':
        return { label: 'LEVEL', tagCls: 'is-gold', itemCls: 'is-gold' };
      default:
        return { label: 'EVENT', tagCls: 'is-cat', itemCls: 'is-gold' };
    }
  }

  function readProfileAccountParams() {
    let baseBalanceUsd = 5000;
    let riskPct = 1.5;
    let currency = 'IDR';
    let usdIdrRate = 16500;
    let cashflowTotalUsd = 0;
    try {
      const b = Number(localStorage.getItem('amy_default_balance'));
      if (Number.isFinite(b) && b > 0) baseBalanceUsd = b;
      const r = Number(localStorage.getItem('amy_default_risk'));
      if (Number.isFinite(r) && r > 0) riskPct = Math.max(0.1, Math.min(25, r));
      const cur = String(localStorage.getItem('amy_account_currency') || '').toUpperCase();
      if (cur === 'USD' || cur === 'IDR') currency = cur;
      const rate = Number(localStorage.getItem('amy_usd_idr_rate'));
      if (Number.isFinite(rate) && rate >= 1000) usdIdrRate = rate;
      const rawCf = localStorage.getItem('amy_sim_cashflows_v1');
      if (rawCf) {
        const list = JSON.parse(rawCf);
        if (Array.isArray(list)) {
          cashflowTotalUsd = list.reduce((acc, item) => acc + (Number(item?.amountUsd) || 0), 0);
        }
      }
    } catch (_) {}
    const initialCapitalUsd = Math.max(0, Math.round((baseBalanceUsd + cashflowTotalUsd) * 100) / 100);
    return { baseBalanceUsd, initialCapitalUsd, riskPct, currency, usdIdrRate };
  }

  function formatPoiMoney(usdAmount, profileParams, { signed = true } = {}) {
    const val = Math.round((Number(usdAmount) || 0) * 100) / 100;
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : (signed && val > 0 ? '+' : '');
    if (profileParams?.currency === 'IDR') {
      const rate = Number(profileParams?.usdIdrRate) >= 1000 ? Number(profileParams.usdIdrRate) : 16500;
      const idr = Math.round(abs * rate);
      return `${sign}Rp${idr.toLocaleString('id-ID')}`;
    }
    return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatSignedPipsLabel(pips) {
    const val = Math.round((Number(pips) || 0) * 10) / 10;
    const sign = val < 0 ? '-' : (val > 0 ? '+' : '');
    const abs = Math.abs(val);
    return `${sign}${Number.isInteger(abs) ? abs : abs.toFixed(1)}p`;
  }

  function renderPoiRecordCard(rec, includeDate = false, ledger = null, profileParams = null) {
    const params = profileParams || readProfileAccountParams();
    const isSell = rec.side === 'SELL';
    const sideCls = isSell ? 'is-sell' : 'is-buy';
    const badge = formatPoiOutcomeBadge(rec);
    const clock = formatWitaClock(rec.touchedAt, includeDate);
    const tp2Part = Number.isFinite(Number(rec.tp2)) && Number(rec.tp2) > 0 ? ` · TP2 $${fmt(rec.tp2)}` : '';
    const fallbackRisk = Math.round(((params.initialCapitalUsd * params.riskPct) / 100) * 100) / 100;
    const pnl = ledger?.perRecord?.get(rec.id) || computePoiRecordPnl(rec, fallbackRisk);
    const slPipsTag = pnl.slPips > 0 ? ` (${pnl.slPips}p)` : '';

    let pnlText = '';
    let pnlCls = 'is-open';
    if (pnl.isLoss) {
      pnlCls = 'is-loss';
      pnlText = `${formatSignedPipsLabel(pnl.pips)} · ${formatPoiMoney(pnl.pnlUsd, params, { signed: true })}`;
    } else if (pnl.isWin) {
      pnlCls = 'is-win';
      pnlText = `${formatSignedPipsLabel(pnl.pips)} · ${formatPoiMoney(pnl.pnlUsd, params, { signed: true })}`;
    } else {
      const maxFav = Number(rec.maxFavorable) || 0;
      pnlText = maxFav > 0 ? `Reaksi +$${maxFav.toFixed(1)}` : `Sentuh $${fmt(rec.touchPrice)}`;
    }

    const tCount = Number(rec.touchCount) || 1;
    const touchBadgeText = `${tCount}×${rec.ceTouched ? ' · CE' : ''}`;
    return `
      <div class="history-item ${sideCls}">
        <div class="history-item-top">
          <div class="history-item-left">
            <span class="history-side-tag ${sideCls}">${esc(rec.side)}</span>
            <span class="history-item-title">${esc(rec.kind)} ${esc(rec.tf)} · $${fmt(rec.low)}–$${fmt(rec.high)}</span>
          </div>
          <div class="history-item-left">
            <span class="history-touch-tag${rec.ceTouched ? ' is-ce' : ''}" title="Riwayat sentuhan zona">${esc(touchBadgeText)}</span>
            <span class="history-outcome-badge ${badge.cls}">${esc(badge.text)}</span>
            <span class="history-item-time">${esc(clock)}</span>
          </div>
        </div>
        <div class="history-item-meta">
          <span>CE $${fmt(rec.ce)} · SL $${fmt(rec.sl)}${slPipsTag} · TP1 $${fmt(rec.tp1)}${tp2Part}</span>
          <span class="history-item-pnl ${pnlCls}">${esc(pnlText)}</span>
        </div>
      </div>
    `;
  }

  function renderPoiCalendarPanel(calData, poiLedger = null, profileParams = null) {
    const labelEl = $('poi-cal-month-label');
    const subMetaEl = $('poi-cal-sub-meta');
    const gridWrapEl = $('poi-cal-grid-wrap');
    const detailEl = $('poi-cal-day-detail');
    if (!gridWrapEl || !detailEl) return;

    const ms = calData.monthSummary;
    if (labelEl) labelEl.textContent = calData.label;
    if (subMetaEl) {
      const parts = [];
      if (ms.fvgTotal > 0) parts.push(`FVG ${ms.fvgTotal}`);
      if (ms.obTotal > 0) parts.push(`OB ${ms.obTotal}`);
      if (ms.ifvgTotal > 0) parts.push(`iFVG ${ms.ifvgTotal}`);
      if (ms.bbTotal > 0) parts.push(`BB ${ms.bbTotal}`);
      const zoneSplit = parts.length > 0 ? ` · ${parts.join(' · ')}` : '';
      subMetaEl.textContent = ms.activeDays > 0
        ? `${ms.activeDays} hari aktif${zoneSplit}`
        : 'Belum ada data bulan ini · arsip 180 hari detail';
    }

    // Auto-select a sensible date in the active month if none selected or outside current month
    const monthActiveCells = calData.weeks
      .flatMap(w => w.days)
      .filter(c => !c.empty && c.hasData);
    const hasSelectedInMonth = Boolean(
      selectedCalendarDate &&
      selectedCalendarDate.startsWith(calData.monthPrefix) &&
      monthActiveCells.some(c => c.date === selectedCalendarDate)
    );
    if (!hasSelectedInMonth) {
      const todayCell = monthActiveCells.find(c => c.isToday);
      selectedCalendarDate = todayCell
        ? todayCell.date
        : (monthActiveCells.length > 0 ? monthActiveCells[monthActiveCells.length - 1].date : '');
    }

    const dayLabels = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MGG'];
    const headerHtml = dayLabels.map(lbl => `<div class="poi-cal-head">${lbl}</div>`).join('');
    const rowsHtml = calData.weeks.map(week => {
      const cellsHtml = week.days.map(cell => {
        if (cell.empty) return '<div class="poi-cal-cell is-empty" aria-hidden="true"></div>';
        if (!cell.hasData) {
          const emptyCls = [
            'poi-cal-cell',
            cell.isWeekend ? 'is-weekend' : 'is-nodata',
            cell.isToday ? 'is-today' : ''
          ].filter(Boolean).join(' ');
          return `<div class="${emptyCls}"><strong class="poi-cal-day-num">${cell.day}</strong><span class="poi-cal-rate"></span></div>`;
        }
        const s = cell.summary;
        const toneCls = s.resolved > 0
          ? (s.respectRate >= 60 ? 'is-win' : (s.respectRate < 50 ? 'is-loss' : 'is-neutral'))
          : 'is-neutral';
        const isSelected = cell.date === selectedCalendarDate;
        const rateTxt = s.respectRate !== null ? `${s.respectRate}%` : `${s.total}p`;
        const subTxt = s.resolved > 0 ? `${s.wins}/${s.sl}` : `${s.total}p`;
        const ariaText = `${cell.date}: ${s.total} POI, Respect ${rateTxt}, ${s.wins} TP, ${s.sl} SL`;
        return `
          <button type="button"
            class="poi-cal-cell ${toneCls} is-clickable${cell.isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}"
            data-poi-cal-date="${esc(cell.date)}"
            aria-pressed="${isSelected ? 'true' : 'false'}"
            aria-label="${esc(ariaText)}"
            title="${esc(ariaText)}">
            <strong class="poi-cal-day-num">${cell.day}</strong>
            <span class="poi-cal-rate">${esc(rateTxt)}</span>
            <span class="poi-cal-sub">${esc(subTxt)}</span>
          </button>
        `;
      }).join('');

      const ws = week.weekSummary;
      const wToneCls = ws.tone === 'win' ? 'is-win' : (ws.tone === 'loss' ? 'is-loss' : (ws.tone === 'neutral' ? 'is-neutral' : ''));
      const wRateTxt = ws.total > 0 && ws.respectRate !== null ? `${ws.respectRate}%` : '—';
      const wSubTxt = ws.total > 0 ? `${ws.wins}/${ws.sl}` : '';
      const weekCellHtml = `
        <div class="poi-cal-cell poi-cal-week ${wToneCls}" title="Rekap mingguan: ${ws.total} POI (${ws.wins} TP / ${ws.sl} SL)">
          <span class="poi-cal-week-rate">${esc(wRateTxt)}</span>
          ${wSubTxt ? `<span class="poi-cal-week-sub">${esc(wSubTxt)}</span>` : ''}
        </div>
      `;
      return cellsHtml + weekCellHtml;
    }).join('');

    gridWrapEl.innerHTML = `<div class="poi-cal-grid" role="grid" aria-label="Kalender bulanan hasil POI">${headerHtml}${rowsHtml}</div>`;

    gridWrapEl.querySelectorAll('[data-poi-cal-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        const picked = btn.getAttribute('data-poi-cal-date') || '';
        if (!picked) return;
        selectedCalendarDate = picked;
        calendarDayFilter = 'ALL';
        calendarDayShowAll = false;
        renderMappingHistory();
      });
    });

    // Day Drill-Down
    if (!selectedCalendarDate) {
      const archiveDates = Object.keys(mappingHistoryState.dailyArchive || {}).sort();
      const latestDate = archiveDates.length > 0 ? archiveDates[archiveDates.length - 1] : '';
      const jumpBtnHtml = latestDate && !latestDate.startsWith(calData.monthPrefix)
        ? `<button type="button" class="poi-cal-jump-btn" id="btn-poi-cal-jump-latest" data-jump-date="${esc(latestDate)}">Lihat bulan terakhir berdata (${esc(latestDate.slice(0, 7))})</button>`
        : '';
      detailEl.innerHTML = `
        <div class="history-empty poi-cal-empty">
          <div>Belum ada catatan POI pada ${esc(calData.label)}. Data terekam otomatis setiap hari saat Mapping Cockpit dibuka dan tersinkron ke Cloud Sync.</div>
          ${jumpBtnHtml}
        </div>
      `;
      const jumpBtn = $('btn-poi-cal-jump-latest');
      if (jumpBtn) {
        jumpBtn.addEventListener('click', () => {
          const dt = jumpBtn.getAttribute('data-jump-date') || '';
          const parts = dt.split('-').map(Number);
          if (parts.length === 3 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
            historyCalendarYear = parts[0];
            historyCalendarMonth = parts[1] - 1;
            selectedCalendarDate = dt;
            calendarDayFilter = 'ALL';
            calendarDayShowAll = false;
            renderMappingHistory();
          }
        });
      }
      return;
    }

    const dayData = getDayPoiRecords(mappingHistoryState, selectedCalendarDate, calendarDayFilter);
    const sum = dayData.summary;
    const rateTxt = sum && sum.respectRate !== null ? `Respect ${sum.respectRate}%` : 'Belum selesai';
    const metaLine = sum
      ? `${sum.total} POI · ${rateTxt} · ${sum.wins} TP · ${sum.sl} SL${(sum.reacting + sum.testing) > 0 ? ` · ${sum.reacting + sum.testing} Aktif` : ''}`
      : 'Tidak ada data';

    const filters = [
      { id: 'ALL', label: `Semua (${dayData.allCount})` },
      { id: 'M15', label: 'M15' },
      { id: 'M5', label: 'M5' },
      { id: 'TP', label: 'TP' },
      { id: 'SL', label: 'SL' }
    ];

    const filterBarHtml = !dayData.isArchivedOnly && dayData.allCount > 0
      ? `
        <div class="poi-cal-filter-row" role="group" aria-label="Filter POI harian">
          ${filters.map(f => `
            <button type="button" class="poi-cal-filter-btn${calendarDayFilter === f.id ? ' is-active' : ''}" data-cal-day-filter="${f.id}" aria-pressed="${calendarDayFilter === f.id ? 'true' : 'false'}">${esc(f.label)}</button>
          `).join('')}
        </div>
      `
      : '';

    let bodyHtml = '';
    if (dayData.isArchivedOnly && sum) {
      const m15Res = sum.m15Wins + sum.m15Sl;
      const m15Pct = m15Res > 0 ? `${Math.round((sum.m15Wins / m15Res) * 100)}%` : '—';
      const m5Res = sum.m5Wins + sum.m5Sl;
      const m5Pct = m5Res > 0 ? `${Math.round((sum.m5Wins / m5Res) * 100)}%` : '—';
      bodyHtml = `
        <div class="poi-cal-archive-card">
          <div class="poi-cal-archive-note">Arsip ringkasan harian permanen (detail kartu penuh disimpan untuk 180 hari terakhir).</div>
          <div class="poi-cal-archive-grid">
            <div class="poi-cal-archive-stat"><span>Total POI</span><strong>${sum.total}</strong></div>
            <div class="poi-cal-archive-stat"><span>Respect</span><strong>${sum.respectRate !== null ? `${sum.respectRate}%` : '—'}</strong></div>
            <div class="poi-cal-archive-stat"><span>TP2 / TP1</span><strong>${sum.tp2} / ${sum.tp1}</strong></div>
            <div class="poi-cal-archive-stat"><span>Jebol SL</span><strong>${sum.sl}</strong></div>
            <div class="poi-cal-archive-stat"><span>M15 (${sum.m15Total})</span><strong>${m15Pct}</strong></div>
            <div class="poi-cal-archive-stat"><span>M5 (${sum.m5Total})</span><strong>${m5Pct}</strong></div>
          </div>
          <div class="poi-cal-archive-foot">Komposisi zona: FVG ${sum.fvgTotal} · OB ${sum.obTotal}${sum.ifvgTotal ? ` · iFVG ${sum.ifvgTotal}` : ''}${sum.bbTotal ? ` · BB ${sum.bbTotal}` : ''}</div>
        </div>
      `;
    } else if (dayData.items.length === 0) {
      bodyHtml = `<div class="history-empty">Tidak ada POI yang cocok dengan filter <strong>${esc(calendarDayFilter)}</strong> pada tanggal ini.</div>`;
    } else {
      const visible = calendarDayShowAll ? dayData.items : dayData.items.slice(0, 6);
      const moreHtml = dayData.items.length > 6
        ? `<button type="button" class="history-more-btn poi-cal-more-btn" id="btn-poi-cal-day-more">${calendarDayShowAll ? 'Ringkas (6)' : `Tampilkan semua (${dayData.items.length})`}</button>`
        : '';
      bodyHtml = `<div class="history-list">${visible.map(rec => renderPoiRecordCard(rec, false, poiLedger, profileParams)).join('')}</div>${moreHtml}`;
    }

    detailEl.innerHTML = `
      <div class="poi-cal-detail-head">
        <div class="poi-cal-detail-title-group">
          <strong class="poi-cal-detail-date">${esc(dayData.dateLabel)}</strong>
          <span class="poi-cal-detail-meta">${esc(metaLine)}</span>
        </div>
        ${filterBarHtml}
      </div>
      ${bodyHtml}
    `;

    detailEl.querySelectorAll('[data-cal-day-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        calendarDayFilter = btn.getAttribute('data-cal-day-filter') || 'ALL';
        calendarDayShowAll = false;
        renderMappingHistory();
      });
    });

    const dayMoreBtn = $('btn-poi-cal-day-more');
    if (dayMoreBtn) {
      dayMoreBtn.addEventListener('click', () => {
        calendarDayShowAll = !calendarDayShowAll;
        renderMappingHistory();
      });
    }
  }

  function renderMappingHistory() {
    const nowMs = Date.now();
    const includeDate = activeHistoryRange === '7D';
    const scopeLabel = activeHistoryRange === '7D' ? '7 Hari' : 'Hari Ini';

    const profileParams = readProfileAccountParams();
    const poiLedger = computePoiPortfolioLedger(mappingHistoryState.poiRecords, {
      baseBalanceUsd: profileParams.initialCapitalUsd,
      riskPct: profileParams.riskPct
    });
    const poiStats = summarizePoiStats(mappingHistoryState.poiRecords, activeHistoryRange, nowMs);
    const timelineItems = filterByRange(mappingHistoryState.timelineEvents, 'ts', activeHistoryRange, nowMs);
    const calData = buildPoiCalendarMonth(mappingHistoryState, historyCalendarYear, historyCalendarMonth, nowMs);

    const poiCountEl = $('history-poi-count');
    const tlCountEl = $('history-timeline-count');
    const calCountEl = $('history-calendar-count');
    if (poiCountEl) poiCountEl.textContent = String(poiStats.total);
    if (tlCountEl) tlCountEl.textContent = String(timelineItems.length);
    if (calCountEl) calCountEl.textContent = String(calData.totalRecordedDays);

    // Scorecard bar
    const scoreMainEl = $('history-score-main');
    const scoreChipsEl = $('history-score-chips');
    if (scoreMainEl && scoreChipsEl) {
      if (activeHistoryTab === 'POI') {
        if (poiStats.total === 0) {
          scoreMainEl.textContent = `Belum ada zona POI tersentuh (${scopeLabel.toLowerCase()}) — pantau rencana aktif di atas.`;
          scoreChipsEl.innerHTML = '';
        } else {
          const rateTxt = poiStats.respectRate !== null ? ` · Respect ${poiStats.respectRate}%` : '';
          scoreMainEl.textContent = `${scopeLabel}: ${poiStats.total} POI Disentuh${rateTxt}`;
          let scopeNetUsd = 0;
          let scopeResolved = 0;
          for (const rec of poiStats.items) {
            const p = poiLedger.perRecord.get(rec.id);
            if (p && p.isRealized) {
              scopeNetUsd += p.pnlUsd;
              scopeResolved += 1;
            }
          }
          scopeNetUsd = Math.round(scopeNetUsd * 100) / 100;
          const chips = [
            `<span class="history-chip is-respect">TP1/TP2: ${poiStats.tp1Count + poiStats.tp2Count}</span>`,
            `<span class="history-chip is-sl">Jebol SL: ${poiStats.slCount}</span>`,
            `<span class="history-chip is-active">Aktif: ${poiStats.reactingCount + poiStats.testingCount}</span>`
          ];
          if (scopeResolved > 0) {
            const netCls = scopeNetUsd > 0 ? 'is-respect' : (scopeNetUsd < 0 ? 'is-sl' : '');
            chips.push(`<span class="history-chip ${netCls}">Net: ${esc(formatPoiMoney(scopeNetUsd, profileParams, { signed: true }))}</span>`);
            chips.push(`<span class="history-chip">Saldo: ${esc(formatPoiMoney(poiLedger.endingBalanceUsd, profileParams, { signed: false }))}</span>`);
          }
          scoreChipsEl.innerHTML = chips.join('');
        }
      } else if (activeHistoryTab === 'TIMELINE') {
        if (timelineItems.length === 0) {
          scoreMainEl.textContent = `Belum ada jejak kejadian market (${scopeLabel.toLowerCase()}).`;
          scoreChipsEl.innerHTML = '';
        } else {
          const poiEv = timelineItems.filter(e => e.category === 'POI_TOUCH' || e.category === 'POI_OUTCOME').length;
          const sweepEv = timelineItems.filter(e => e.category === 'SWEEP').length;
          const breakEv = timelineItems.filter(e => e.category === 'BREAK').length;
          const levelEv = timelineItems.filter(e => e.category === 'KEY_LEVEL').length;
          scoreMainEl.textContent = `${scopeLabel}: ${timelineItems.length} Kejadian Market Tercatat`;
          const chips = [];
          if (poiEv > 0) chips.push(`<span class="history-chip is-respect">POI: ${poiEv}</span>`);
          if (sweepEv > 0) chips.push(`<span class="history-chip is-active">Sweep: ${sweepEv}</span>`);
          if (breakEv > 0) chips.push(`<span class="history-chip">Struktur: ${breakEv}</span>`);
          if (levelEv > 0) chips.push(`<span class="history-chip">Level: ${levelEv}</span>`);
          scoreChipsEl.innerHTML = chips.join('');
        }
      } else {
        const ms = calData.monthSummary;
        if (ms.total === 0) {
          scoreMainEl.textContent = `${calData.label}: Belum ada POI tercatat`;
          scoreChipsEl.innerHTML = '';
        } else {
          const rateTxt = ms.respectRate !== null ? ` · Respect ${ms.respectRate}%` : '';
          scoreMainEl.textContent = `${calData.label}: ${ms.total} POI${rateTxt}`;
          const chips = [
            `<span class="history-chip is-respect">TP1/TP2: ${ms.wins}</span>`,
            `<span class="history-chip is-sl">Jebol SL: ${ms.sl}</span>`
          ];
          if (ms.m15Total > 0 || ms.m5Total > 0) {
            const m15Txt = ms.m15RespectRate !== null ? `M15 ${ms.m15RespectRate}%` : `M15 ${ms.m15Total}`;
            const m5Txt = ms.m5RespectRate !== null ? `M5 ${ms.m5RespectRate}%` : `M5 ${ms.m5Total}`;
            chips.push(`<span class="history-chip">${m15Txt} · ${m5Txt}</span>`);
          }
          scoreChipsEl.innerHTML = chips.join('');
        }
      }
    }

    // Panel 1: Hasil POI
    const poiListEl = $('history-poi-list');
    if (poiListEl) {
      if (poiStats.items.length === 0) {
        poiListEl.innerHTML = `<div class="history-empty">Belum ada POI yang disentuh pada rentang ${esc(scopeLabel.toLowerCase())}. Saat harga menyentuh zona Demand/Supply aktif, status dan hasilnya tercatat otomatis di sini.</div>`;
      } else {
        const visible = historyShowAll ? poiStats.items : poiStats.items.slice(0, 5);
        poiListEl.innerHTML = visible.map(rec => renderPoiRecordCard(rec, includeDate, poiLedger, profileParams)).join('');
      }
    }

    const breakdownEl = $('history-poi-breakdown');
    if (breakdownEl) {
      const bd = summarizePoiBreakdown(mappingHistoryState.poiRecords, activeHistoryRange, nowMs, poiLedger);
      if (bd.total === 0) {
        breakdownEl.hidden = true;
        breakdownEl.innerHTML = '';
      } else {
        const fmtPips = v => {
          const n = Number(v) || 0;
          if (n > 0) return `+${n.toFixed(0)}p`;
          if (n < 0) return `${n.toFixed(0)}p`;
          return '0p';
        };
        const renderBdRows = (rows) => rows.slice(0, 5).map(r => {
          const wrTxt = r.respectRate !== null ? `${r.respectRate}%` : '—';
          const pipsCls = r.netPips > 0 ? 'is-pos' : (r.netPips < 0 ? 'is-neg' : '');
          const wrCls = r.respectRate === null ? '' : (r.respectRate >= 55 ? 'is-pos' : (r.respectRate < 45 ? 'is-neg' : ''));
          return `
            <div class="poi-bd-row">
              <span class="poi-bd-key">${esc(r.key)}</span>
              <span class="poi-bd-cnt">${r.wins}W/${r.losses}L${r.active ? ` · ${r.active}A` : ''}</span>
              <span class="poi-bd-wr ${wrCls}">${wrTxt}</span>
              <span class="poi-bd-pips ${pipsCls}">${fmtPips(r.netPips)}</span>
            </div>
          `;
        }).join('');

        breakdownEl.hidden = false;
        breakdownEl.innerHTML = `
          <div class="poi-bd-grid">
            <div class="poi-bd-col">
              <div class="poi-bd-head">
                <span>Performa Jenis Zona</span>
                <span>Respect · Pips</span>
              </div>
              <div class="poi-bd-rows">${renderBdRows(bd.byKind)}</div>
            </div>
            <div class="poi-bd-col">
              <div class="poi-bd-head">
                <span>Performa Sesi (WITA)</span>
                <span>Respect · Pips</span>
              </div>
              <div class="poi-bd-rows">${renderBdRows(bd.bySession)}</div>
            </div>
          </div>
        `;
      }
    }

    // Panel 2: Timeline Market
    const tlListEl = $('history-timeline-list');
    if (tlListEl) {
      if (timelineItems.length === 0) {
        tlListEl.innerHTML = `<div class="history-empty">Belum ada kejadian market pada rentang ${esc(scopeLabel.toLowerCase())}.</div>`;
      } else {
        const visible = historyShowAll ? timelineItems : timelineItems.slice(0, 5);
        tlListEl.innerHTML = visible.map(ev => {
          const cat = formatTimelineCategory(ev);
          const clock = formatWitaClock(ev.ts, includeDate);
          const priceStr = Number.isFinite(Number(ev.price)) && Number(ev.price) > 0 ? `$${fmt(ev.price)}` : '';
          return `
            <div class="history-item ${cat.itemCls}">
              <div class="history-item-top">
                <div class="history-item-left">
                  <span class="history-side-tag ${cat.tagCls}">${esc(cat.label)}</span>
                  <span class="history-item-title">${esc(ev.title)}</span>
                </div>
                <span class="history-item-time">${esc(clock)}</span>
              </div>
              <div class="history-item-meta">
                <span>${esc(ev.detail)}</span>
                ${priceStr ? `<span>${esc(priceStr)}</span>` : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Panel 3: Kalender Reaksi & POI Bulanan
    if (activeHistoryTab === 'CALENDAR') {
      renderPoiCalendarPanel(calData, poiLedger, profileParams);
    }

    // Footer controls (Expand/Collapse + Reset)
    const activeList = activeHistoryTab === 'POI' ? poiStats.items : (activeHistoryTab === 'TIMELINE' ? timelineItems : []);
    const totalStored = (mappingHistoryState.poiRecords?.length || 0)
      + (mappingHistoryState.timelineEvents?.length || 0)
      + Object.keys(mappingHistoryState.dailyArchive || {}).length;
    const footerEl = $('history-footer-row');
    const moreBtn = $('btn-history-toggle-all');
    if (footerEl) {
      footerEl.hidden = activeList.length === 0 && totalStored === 0;
    }
    if (moreBtn) {
      if (activeHistoryTab !== 'CALENDAR' && activeList.length > 5) {
        moreBtn.hidden = false;
        moreBtn.textContent = historyShowAll ? 'Ringkas (5)' : `Tampilkan semua (${activeList.length})`;
      } else {
        moreBtn.hidden = true;
      }
    }
  }

  function filterTrackableLivePlans(plans) {
    return plans.filter(p => {
      if (!p || !p.area || p.skip) return false;
      const lo = Number(p.area.low);
      const hi = Number(p.area.high);
      if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return false;
      const tf = String(p.tf || 'M15').toUpperCase();
      const maxW = tf === 'M5' ? 8.0 : 11.0;
      return (hi - lo) <= maxW;
    });
  }

  function syncMappingHistoryFromContext(ctx, ngM15, ngM5, livePrice) {
    const amy = ctx?.amy || ctx;
    const m15Candles = amy?.chartCandles?.M15 || [];
    const m5Candles = amy?.chartCandles?.M5 || [];
    const lastM15 = m15Candles[m15Candles.length - 1];
    const lastM5 = m5Candles[m5Candles.length - 1];
    const backfillKey = `v${BACKFILL_ENGINE_VERSION}:${m15Candles.length}:${lastM15?.open_time || 0}:${m5Candles.length}:${lastM5?.open_time || 0}:${historyResetFloorMs}`;
    const nowMs = Date.now();

    let stateChanged = false;
    if (backfillKey !== lastHistoryBackfillKey && (m15Candles.length >= 10 || m5Candles.length >= 10)) {
      lastHistoryBackfillKey = backfillKey;
      const rawBackfill = backfillFromCandles({
        m15Candles,
        m5Candles,
        ctx,
        ngM15,
        ngM5,
        nowMs,
        lookbackHours: 48
      });
      const filteredBackfill = historyResetFloorMs > 0
        ? {
            version: rawBackfill.version || 2,
            engineVersion: rawBackfill.engineVersion || BACKFILL_ENGINE_VERSION,
            lookbackStartMs: Math.max(rawBackfill.lookbackStartMs || 0, historyResetFloorMs),
            poiRecords: rawBackfill.poiRecords.filter(r => r.touchedAt >= historyResetFloorMs),
            timelineEvents: rawBackfill.timelineEvents.filter(e => e.ts >= historyResetFloorMs)
          }
        : rawBackfill;
      mappingHistoryState = mergeHistoryState(mappingHistoryState, filteredBackfill, nowMs);
      stateChanged = true;
    }

    const activePlans = filterTrackableLivePlans([latestBuyOverlay, backupBuyOverlay, latestSellOverlay, backupSellOverlay]);
    if (Number.isFinite(livePrice) && livePrice > 0 && activePlans.length > 0) {
      const liveRes = recordLivePoiProgress({
        state: mappingHistoryState,
        plans: activePlans,
        livePrice,
        nowMs
      });
      if (liveRes.changed) {
        mappingHistoryState = liveRes.state;
        stateChanged = true;
      }
      if (liveRes.alerts && liveRes.alerts.length > 0) {
        dispatchPoiNotifications(liveRes.alerts);
      }
    }

    if (stateChanged) {
      saveHistoryState(historyStorage, mappingHistoryState);
      try { window.dispatchEvent(new CustomEvent('amyfx:poi-history-updated')); } catch (_) {}
      try {
        window.AmyGitHubSync?.scheduleAutoSync?.('mapping-history', { delayMs: 15000 });
      } catch (_) {}
    }
    renderMappingHistory();
  }

  function dispatchPoiNotifications(alerts) {
    if (!Array.isArray(alerts) || alerts.length === 0) return;
    for (const a of alerts) {
      if (!a || !a.title || !a.body) continue;
      const targetUrl = typeof location !== 'undefined' ? `${location.href.split('#')[0]}#Dashboard` : '';
      try {
        if (typeof window !== 'undefined' && window.Android?.showNotificationWithUrl) {
          window.Android.showNotificationWithUrl(a.title, a.body, targetUrl);
        } else if (typeof window !== 'undefined' && window.Android?.showNotification) {
          window.Android.showNotification(a.title, a.body);
        } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(a.title, { body: a.body });
        }
        if (a.sound === 'gold' && typeof window !== 'undefined' && window.Android?.playNotificationSound) {
          window.Android.playNotificationSound('gold');
        }
      } catch (err) {
        console.warn('[DashboardV2] Gagal mengirim notifikasi POI:', err);
      }
    }
  }

  function tickMappingHistory(livePrice) {
    if (!Number.isFinite(livePrice) || livePrice <= 0) return;
    const activePlans = filterTrackableLivePlans([latestBuyOverlay, backupBuyOverlay, latestSellOverlay, backupSellOverlay]);
    const liveRes = recordLivePoiProgress({
      state: mappingHistoryState,
      plans: activePlans,
      livePrice,
      nowMs: Date.now()
    });
    if (liveRes.changed) {
      mappingHistoryState = liveRes.state;
      saveHistoryState(historyStorage, mappingHistoryState);
      renderMappingHistory();
    }
    if (liveRes.alerts && liveRes.alerts.length > 0) {
      dispatchPoiNotifications(liveRes.alerts);
    }
  }

  /* ── Live price sync ── */
  function applyHeroPrice(price) {
    if (!Number.isFinite(price) || price <= 0) return;
    const el = $('hero-price');
    if (el) el.textContent = '$' + price.toFixed(2);
    const sp = $('scenario-price');
    if (sp) sp.textContent = '$' + price.toFixed(2);
    updateEntryDistanceTelemetry(price);
  }

  /* ── Range Harian vs ADR (Real Calculation from H1/M15 Candles & PDH/PDL) ── */
  function computeDailyAdrTelemetry(ctx, livePrice) {
    const amy = ctx?.amy || ctx;
    const ng = window.amyfxLastIndicators || null;
    const h1Candles = Array.isArray(amy?.chartCandles?.H1) ? amy.chartCandles.H1 : [];
    const m15Candles = Array.isArray(amy?.chartCandles?.M15) ? amy.chartCandles.M15 : [];
    const sourceCandles = h1Candles.length >= 24 ? h1Candles : m15Candles;

    // Gold trading day key: rollover 17:00 America/New_York (add +7h to NY time so 17:00 rolls into next date)
    const dayKeyOf = sec => {
      const shiftedMs = (sec * 1000) + (7 * 3600 * 1000);
      try {
        return new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/New_York',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(shiftedMs));
      } catch (_) {
        return new Date(shiftedMs).toISOString().slice(0, 10);
      }
    };

    const buckets = new Map();
    for (const c of sourceCandles) {
      const t = Number(c.open_time ?? c.time);
      const hi = Number(c.high);
      const lo = Number(c.low);
      if (!Number.isFinite(t) || !Number.isFinite(hi) || !Number.isFinite(lo) || hi <= 0 || lo <= 0) continue;
      const key = dayKeyOf(t);
      const prev = buckets.get(key);
      if (!prev) buckets.set(key, { key, high: hi, low: lo, count: 1 });
      else {
        if (hi > prev.high) prev.high = hi;
        if (lo < prev.low) prev.low = lo;
        prev.count += 1;
      }
    }

    const days = [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
    const today = days.length ? days[days.length - 1] : null;
    if (today && Number.isFinite(livePrice) && livePrice > 0) {
      if (livePrice > today.high) today.high = livePrice;
      if (livePrice < today.low) today.low = livePrice;
    }

    const todayRange = today ? (today.high - today.low) : NaN;
    const priorComplete = days.slice(0, -1).filter(d => (d.high - d.low) > 2);
    let refAdr = NaN;
    let refLabel = '';

    if (priorComplete.length >= 2) {
      const recent = priorComplete.slice(-5);
      refAdr = recent.reduce((s, d) => s + (d.high - d.low), 0) / recent.length;
      refLabel = `ADR ${recent.length}h`;
    } else {
      const pdh = num(amy?.levels?.pdh || ng?.keyLevels?.pdh);
      const pdl = num(amy?.levels?.pdl || ng?.keyLevels?.pdl);
      if (Number.isFinite(pdh) && Number.isFinite(pdl) && pdh > pdl) {
        refAdr = pdh - pdl;
        refLabel = 'PD';
      }
    }

    if (!Number.isFinite(todayRange) || todayRange <= 0) {
      return { text: 'Data harian belum lengkap', tone: '' };
    }
    if (!Number.isFinite(refAdr) || refAdr <= 0) {
      return { text: `Range $${todayRange.toFixed(1)}`, tone: '' };
    }

    const pct = Math.round((todayRange / refAdr) * 100);
    const refTag = refLabel ? ` · ${refLabel}` : '';
    if (pct >= 120) {
      return { text: `$${todayRange.toFixed(1)} / $${refAdr.toFixed(1)} (${pct}% · Ekstrem Jenuh${refTag})`, tone: 'is-bear' };
    }
    if (pct >= 90) {
      return { text: `$${todayRange.toFixed(1)} / $${refAdr.toFixed(1)} (${pct}% · Waspada Jenuh${refTag})`, tone: 'is-gold' };
    }
    return { text: `$${todayRange.toFixed(1)} / $${refAdr.toFixed(1)} (${pct}% · Napas Sehat${refTag})`, tone: 'is-bull' };
  }

  /* ── Single Source of Truth: Dealing Range & EQ (Hero · Gauge · POI · Chart Badge) ── */
  function resolveUnifiedDealingRange(ctx, livePrice) {
    const amy = ctx?.amy || ctx;
    const dashboard = amy?.dashboard;
    const ng = window.amyfxLastIndicators || null;
    const ngIsM15 = !ng?.tf || String(ng.tf).toUpperCase() === 'M15';

    const sources = [
      ctx?.m15?.dealingRange,
      ngIsM15 ? ng?.dealingRange : null,
      amy?.levels?.dealingRange,
      ctx?.dealingRange,
      dashboard
    ];

    const candidates = [];
    for (const src of sources) {
      if (!src) continue;
      const hi = num(src.rangeHigh ?? src.high ?? src.rHigh);
      const lo = num(src.rangeLow ?? src.low ?? src.rLow);
      if (Number.isFinite(hi) && Number.isFinite(lo) && hi > lo) {
        const spanCheck = hi - lo;
        const outsideDist = Number.isFinite(livePrice) && livePrice > 0
          ? (livePrice > hi ? (livePrice - hi) : (livePrice < lo ? (lo - livePrice) : 0))
          : 0;
        const isStale = outsideDist > Math.max(15, spanCheck * 0.25);
        candidates.push({ hi, lo, eqFallback: num(src.eq ?? src.equilibrium), outsideDist, isStale });
      }
    }

    // Prefer first non-stale Dealing Range; if all are outside live price, pick the one closest to livePrice
    const chosen = candidates.find(c => !c.isStale)
      || (candidates.length ? [...candidates].sort((a, b) => a.outsideDist - b.outsideDist)[0] : null);
    let rHigh = chosen ? chosen.hi : NaN;
    let rLow = chosen ? chosen.lo : NaN;
    let eqFallback = chosen ? chosen.eqFallback : NaN;

    const span = (Number.isFinite(rHigh) && Number.isFinite(rLow) && rHigh > rLow) ? (rHigh - rLow) : NaN;
    const eq = Number.isFinite(span) ? (rLow + rHigh) / 2 : eqFallback;
    const isSslSwept = livePrice > 0 && Number.isFinite(rLow) && livePrice < rLow;
    const isBslSwept = livePrice > 0 && Number.isFinite(rHigh) && livePrice > rHigh;

    let rawPct = 50;
    let pct = 50;
    if (Number.isFinite(span) && span > 0 && Number.isFinite(livePrice) && livePrice > 0) {
      rawPct = ((livePrice - rLow) / span) * 100;
      pct = Math.min(100, Math.max(0, Math.round(rawPct)));
    }

    const isDiscount = rawPct < 47.5;
    const isPremium = rawPct > 52.5;
    const isEq = !isDiscount && !isPremium;
    const noTradeLow = Number.isFinite(span) ? rLow + span * 0.475 : (Number.isFinite(eq) ? eq - 2.0 : NaN);
    const noTradeHigh = Number.isFinite(span) ? rLow + span * 0.525 : (Number.isFinite(eq) ? eq + 2.0 : NaN);

    let m15Dir = 0;
    const m15Struct = String(ctx?.m15?.structure || '').toUpperCase();
    const m15Control = String(ctx?.m15?.control || '').toUpperCase();
    if (m15Struct.includes('BEAR') || m15Control.includes('SELLER') || dashboard?.biasDir === -1) m15Dir = -1;
    else if (m15Struct.includes('BULL') || m15Control.includes('BUYER') || dashboard?.biasDir === 1) m15Dir = 1;
    const lastEv = ng?.structure?.lastEvent || null;
    const lastEvBear = Boolean(lastEv && (String(lastEv.direction || lastEv.side || '').toUpperCase().includes('BEAR') || lastEv.dir === -1));
    const lastEvBull = Boolean(lastEv && (String(lastEv.direction || lastEv.side || '').toUpperCase().includes('BULL') || lastEv.dir === 1));
    const sslDiff = isSslSwept ? (rLow - livePrice) : 0;
    const bslDiff = isBslSwept ? (livePrice - rHigh) : 0;
    const isBearBreakdown = isSslSwept && (m15Dir === -1 && (sslDiff > 3.0 || lastEvBear));
    const isBullBreakout = isBslSwept && (m15Dir === 1 && (bslDiff > 3.0 || lastEvBull));

    if (Number.isFinite(rHigh) && Number.isFinite(rLow) && rHigh > rLow) {
      const location = isBearBreakdown ? 'BREAKDOWN' : (isBullBreakout ? 'BREAKOUT' : (isDiscount ? 'DISCOUNT' : (isPremium ? 'PREMIUM' : 'EQUILIBRIUM')));
      window.amyfxLastDealingRange = {
        rangeHigh: rHigh,
        rangeLow: rLow,
        high: rHigh,
        low: rLow,
        eq,
        equilibrium: eq,
        location,
        pct,
        rawPct,
        m15Dir,
        lastEvBear,
        lastEvBull,
        isBearBreakdown,
        isBullBreakout
      };

      const badgeEl = $('chart-dealing-range-badge');
      if (badgeEl && livePrice > 0) {
        if (isBearBreakdown) {
          badgeEl.textContent = `BREAKDOWN · ${pct}%`;
          badgeEl.className = 'dr-badge dr-breakdown';
        } else if (isBullBreakout) {
          badgeEl.textContent = `BREAKOUT · ${pct}%`;
          badgeEl.className = 'dr-badge dr-breakout';
        } else if (isDiscount) {
          badgeEl.textContent = `ZONA DISKON · ${pct}%`;
          badgeEl.className = 'dr-badge dr-discount';
        } else if (isPremium) {
          badgeEl.textContent = `ZONA PREMIUM · ${pct}%`;
          badgeEl.className = 'dr-badge dr-premium';
        } else {
          badgeEl.textContent = `EQUILIBRIUM · ${pct}%`;
          badgeEl.className = 'dr-badge dr-neutral';
        }
      }
    }

    return {
      rHigh,
      rLow,
      eq,
      span,
      rawPct,
      pct,
      m15Dir,
      sslDiff,
      bslDiff,
      isSslSwept,
      isBslSwept,
      isBearBreakdown,
      isBullBreakout,
      isDiscount,
      isPremium,
      isEq,
      noTradeLow,
      noTradeHigh
    };
  }

  /* ── Telemetry Merger: Break · Sweep · DOL (Single Source of Truth M15) ── */
  function resolveLiveTelemetry(ctx, livePrice) {
    return resolveSsotTelemetry(ctx, window.amyfxLastIndicators || null, livePrice);
  }

  /* ── 1. Hero Ringkas: Bias 3-TF + Telemetri Break/Sweep/DOL ── */
  function updateHeroCard(ctx) {
    if (!ctx) return;
    const amy = ctx.amy || ctx;
    const dashboard = amy?.dashboard;

    const livePrice = Number(window.amyfxCurrentPrice) || Number(ctx.price) || Number(dashboard?.candle?.close) || 0;
    if (livePrice > 0) applyHeroPrice(livePrice);

    const drState = resolveUnifiedDealingRange(ctx, livePrice);
    const rHigh = drState.rHigh;
    const rLow  = drState.rLow;
    const eqVal = drState.eq;

    const eqEl = $('hero-eq');
    if (eqEl) {
      eqEl.textContent = Number.isFinite(eqVal) ? `EQ $${fmt(eqVal)}` : 'EQ —';
    }

    // H1
    let h1Dir = 0, h1Desc = 'Struktur netral — tunggu break';
    const h1BiasStr = String(ctx.h1?.bias || '').toUpperCase();
    const h1Health = String(ctx.h1?.health || '').toUpperCase();
    const h1BreakType = String(ctx.h1?.lastBreak?.type || '').toUpperCase() || 'Break';
    const h1Pattern = (ctx.h1?.highPattern && ctx.h1?.lowPattern) ? ` (${ctx.h1.highPattern}/${ctx.h1.lowPattern})` : '';
    if (h1BiasStr.includes('BEAR') || ctx.h1?.trend?.dir === -1 || ctx.h1Dir === -1) {
      h1Dir = -1;
      h1Desc = h1Health === 'WEAKENING'
        ? `${h1BreakType} Bear melemah${h1Pattern}`
        : `${h1BreakType} Bear terkonfirmasi${h1Pattern}`;
    } else if (h1BiasStr.includes('BULL') || ctx.h1?.trend?.dir === 1 || ctx.h1Dir === 1) {
      h1Dir = 1;
      h1Desc = h1Health === 'WEAKENING'
        ? `${h1BreakType} Bull melemah${h1Pattern}`
        : `${h1BreakType} Bull terkonfirmasi${h1Pattern}`;
    }

    // M15
    let m15Dir = 0, m15Desc = 'Konsolidasi — tunggu break';
    const m15Struct = String(ctx.m15?.structure || '').toUpperCase();
    const m15Control = String(ctx.m15?.control || '').toUpperCase();
    const dashBiasDir = dashboard?.biasDir;
    if (m15Struct.includes('BEAR') || m15Control.includes('SELLER') || dashBiasDir === -1) {
      m15Dir = -1;
      m15Desc = 'Struktur turun · Seller kontrol';
    } else if (m15Struct.includes('BULL') || m15Control.includes('BUYER') || dashBiasDir === 1) {
      m15Dir = 1;
      m15Desc = 'Struktur naik · Buyer aktif';
    }

    // M5 — Evaluasi independen dari sinyal/trigger M5 (jangan dipaksa mengikuti M15)
    let m5Dir = 0, m5Desc = 'Choppy — tunggu trigger';
    const m5Status = String(ctx.m5?.status || '').toUpperCase();
    const m5DirStr = String(ctx.m5?.direction || ctx.m5?.side || '').toUpperCase();
    const trig = amy?.trigger || {};
    const trigBull = Boolean(trig.bullBreak || trig.bullDisp || trig.bullMss || m5DirStr.includes('BULL') || m5DirStr === 'BUY');
    const trigBear = Boolean(trig.bearBreak || trig.bearDisp || trig.bearMss || m5DirStr.includes('BEAR') || m5DirStr === 'SELL');
    const m5Mss = ctx.m5?.mss;
    if (m5Status === 'CONFIRMED' || m5Mss || trigBull || trigBear) {
      if (trigBull && !trigBear) {
        m5Dir = 1;
        m5Desc = (m5Mss || trig.bullMss) ? 'Rebound · MSS Bullish M5' : 'Momentum beli · Displacement naik';
      } else if (trigBear && !trigBull) {
        m5Dir = -1;
        m5Desc = (m5Mss || trig.bearMss) ? 'Pembalikan · MSS Bearish M5' : 'Tekanan jual · Displacement turun';
      } else if (m5Status === 'CONFIRMED' && ctx.primary?.side) {
        const pSide = String(ctx.primary.side).toUpperCase();
        if (pSide === 'BUY') {
          m5Dir = 1;
          m5Desc = 'Konfirmasi M5 · Setup Buy aktif';
        } else if (pSide === 'SELL') {
          m5Dir = -1;
          m5Desc = 'Konfirmasi M5 · Setup Sell aktif';
        }
      }
    }

    const demandRef = num(ctx.m15?.poi?.side === 'BUY' ? ctx.m15?.poi?.low : null) || num(rLow) || num(dashboard?.ssl);
    const demandHi  = num(ctx.m15?.poi?.side === 'BUY' ? ctx.m15?.poi?.high : null) || num(rLow);
    const supplyRef = num(ctx.m15?.poi?.side === 'SELL' ? ctx.m15?.poi?.high : null) || num(rHigh) || num(dashboard?.bsl);
    const supplyLo  = num(ctx.m15?.poi?.side === 'SELL' ? ctx.m15?.poi?.low : null) || num(rHigh);

    const demandLabel = (Number.isFinite(demandRef) && Number.isFinite(demandHi) && Math.abs(demandHi - demandRef) >= 0.01)
      ? `$${fmt(demandRef)}–$${fmt(demandHi)}`
      : (Number.isFinite(demandRef) ? `$${fmt(demandRef)}` : 'Demand');
    const supplyLabel = (Number.isFinite(supplyLo) && Number.isFinite(supplyRef) && Math.abs(supplyLo - supplyRef) >= 0.01)
      ? `$${fmt(supplyLo)}–$${fmt(supplyRef)}`
      : (Number.isFinite(supplyRef) ? `$${fmt(supplyRef)}` : 'Supply');

    const pipsToDemand = (livePrice > 0 && Number.isFinite(demandRef)) ? Math.max(0, ((livePrice - demandRef) * 10)).toFixed(1) : null;
    const pipsToSupply = (livePrice > 0 && Number.isFinite(supplyRef)) ? Math.max(0, ((supplyRef - livePrice) * 10)).toFixed(1) : null;

    // Banner Utama Bias
    const bannerEl = $('hero-bias-banner');
    const isPremiumZone = drState.isPremium;
    const isDiscountZone = drState.isDiscount;
    if (bannerEl) {
      let bannerClass = 'bias-neutral';
      let bannerText = 'Menunggu Data Bias';

      if (m15Dir === -1 && m5Dir === -1) {
        bannerClass = 'bias-bearish';
        bannerText = h1Dir === 1 ? 'Bearish M15/M5 · Koreksi ke Demand HTF' : 'Bearish Tren Kuat · H1 + M15 Selaras';
      } else if (m15Dir === 1 && m5Dir === 1) {
        bannerClass = 'bias-bullish';
        bannerText = h1Dir === -1 ? 'Bullish M15/M5 · Pullback ke Supply HTF' : 'Bullish Tren Kuat · H1 + M15 Selaras';
      } else if (h1Dir === -1 && m15Dir === 1) {
        bannerClass = 'bias-pullback';
        bannerText = 'Pullback Naik M15 · Uji Supply HTF';
      } else if (h1Dir === 1 && m15Dir === -1) {
        bannerClass = 'bias-pullback';
        bannerText = 'Koreksi Turun M15 · Uji Demand HTF';
      } else if (m15Dir === 1 && isPremiumZone) {
        bannerClass = 'bias-bullish';
        bannerText = 'Bullish Lokal M15 · Zona Premium';
      } else if (m15Dir === -1 && isDiscountZone) {
        bannerClass = 'bias-bearish';
        bannerText = 'Bearish Lokal M15 · Zona Diskon';
      } else if (m15Dir === -1 || h1Dir === -1) {
        bannerClass = 'bias-bearish';
        bannerText = 'Bearish · Tekanan Sell Dominan';
      } else if (m15Dir === 1 || h1Dir === 1) {
        bannerClass = 'bias-bullish';
        bannerText = 'Bullish · Momentum Buy Aktif';
      }

      bannerEl.className = `hero-bias-pill ${bannerClass}`;
      bannerEl.textContent = bannerText;
    }

    // 3-TF Horizontal Grid
    const tfRows = [
      { tf: 'H1 · HTF', dir: h1Dir, desc: h1Desc },
      { tf: 'M15 · MTF', dir: m15Dir, desc: m15Desc },
      { tf: 'M5 · LTF', dir: m5Dir, desc: m5Desc }
    ];

    const tfGrid = $('hero-tf-grid');
    if (tfGrid) {
      tfGrid.innerHTML = tfRows.map(r => {
        const dirLabel = r.dir === 1 ? 'BULL' : r.dir === -1 ? 'BEAR' : 'NETRAL';
        const dirClass = r.dir === 1 ? 'bias-bull' : r.dir === -1 ? 'bias-bear' : 'bias-neutral';
        return `<div class="hero-tf-cell">
          <div class="hero-tf-head">
            <span class="hero-tf-name">${esc(r.tf)}</span>
            <span class="hero-tf-dir ${dirClass}">${dirLabel}</span>
          </div>
          <span class="hero-tf-desc">${esc(r.desc)}</span>
        </div>`;
      }).join('');
    }

    // Sync hidden compat tbody
    const tbody = $('hero-tf-tbody');
    if (tbody) {
      tbody.innerHTML = tfRows.map(r => {
        const dirLabel = r.dir === 1 ? 'BULL' : r.dir === -1 ? 'BEAR' : 'NETRAL';
        const dirClass = r.dir === 1 ? 'bias-bull' : r.dir === -1 ? 'bias-bear' : 'bias-neutral';
        return `<tr><td>${esc(r.tf)}</td><td class="${dirClass}">${dirLabel}</td><td>${esc(r.desc)}</td></tr>`;
      }).join('');
    }

    // Telemetri Break · Sweep · DOL
    const telemetry = resolveLiveTelemetry(ctx, livePrice);
    const breakEl = $('hero-break-val');
    if (breakEl) {
      breakEl.textContent = telemetry.breakText;
      breakEl.className = `hero-ict-val ${telemetry.breakTone}`.trim();
    }
    const sweepEl = $('hero-sweep-val');
    if (sweepEl) {
      sweepEl.textContent = telemetry.sweepText;
      sweepEl.className = `hero-ict-val ${telemetry.sweepTone}`.trim();
    }
    const dolEl = $('hero-dol-val');
    if (dolEl) {
      dolEl.textContent = telemetry.dolText;
      dolEl.className = `hero-ict-val ${telemetry.dolTone}`.trim();
    }

    // Telemetri ADR / Range Harian (Real-time dari Candle H1/M15 & PDH/PDL)
    const adr = computeDailyAdrTelemetry(ctx, livePrice);
    const adrEl = $('hero-adr-val');
    if (adrEl) {
      adrEl.textContent = adr.text;
      adrEl.className = `hero-ict-val ${adr.tone}`.trim();
    }
    updateEntryDistanceTelemetry(livePrice);
  }

  /* ── 2. Dealing Range Horizontal Gauge (Single Source of Truth + Anti-Falling Knife) ── */
  function updateDealingRange(ctx) {
    if (!ctx) return;
    const amy = ctx.amy || ctx;
    const dashboard = amy?.dashboard;
    const ng = window.amyfxLastIndicators || null;
    const livePrice = Number(window.amyfxCurrentPrice) || Number(ctx.price) || Number(dashboard?.candle?.close) || 0;
    const drState = resolveUnifiedDealingRange(ctx, livePrice);

    const {
      rHigh,
      rLow,
      eq: eqVal,
      pct,
      rawPct,
      m15Dir,
      sslDiff,
      bslDiff,
      isSslSwept,
      isBslSwept,
      isBearBreakdown,
      isBullBreakout,
      noTradeLow,
      noTradeHigh
    } = drState;
    if (!Number.isFinite(rHigh) || !Number.isFinite(rLow) || rHigh <= rLow) return;

    const pctTag = $('dr-pct-tag');
    if (pctTag) pctTag.textContent = `${pct}%`;

    const bslEl = $('dr-bsl-val');
    if (bslEl) bslEl.textContent = isBslSwept ? `$${fmt(rHigh)} · ${isBullBreakout ? 'Break' : 'Swept'}` : '$' + fmt(rHigh);
    const eqEl = $('dr-eq-val');
    if (eqEl) eqEl.textContent = Number.isFinite(eqVal) ? `$${fmt(eqVal)}` : '—';
    const sslEl = $('dr-ssl-val');
    if (sslEl) sslEl.textContent = isSslSwept ? `$${fmt(rLow)} · ${isBearBreakdown ? 'Break' : 'Swept'}` : '$' + fmt(rLow);

    // Horizontal gauge fill & dot
    const fill = $('dr-bar-fill');
    const dot  = $('dr-bar-dot');
    if (fill) fill.style.width = `${pct}%`;
    if (dot)  dot.style.left = `${pct}%`;

    // Range Mayor (PDL–PDH urutan Low ke High agar konsisten dengan label)
    const pdh = Number(amy?.levels?.pdh || ng?.keyLevels?.pdh || ctx.h1?.swingHigh);
    const pdl = Number(amy?.levels?.pdl || ng?.keyLevels?.pdl || ctx.h1?.swingLow);
    const majorRangeEl = $('dr-major-range');
    const majorEqEl = $('dr-major-eq');
    const majorFmt = formatPdlPdhRange(pdl, pdh);
    if (majorRangeEl) majorRangeEl.textContent = majorFmt.rangeText;
    if (majorEqEl) majorEqEl.textContent = majorFmt.eqText;

    // Status badge ringkas (bedakan Sweep dangkal vs Breakdown/Breakout valid!)
    const badge = $('dr-status-badge');
    if (badge) {
      let cls = 'zone-eq', text = '';
      if (isBearBreakdown) {
        cls = 'zone-breakdown';
        text = `Breakdown Bearish (${pct}%) · Range Low $${fmt(rLow)} ditembus (-$${sslDiff.toFixed(2)}). Tunggu pullback Supply — hindari Buy tanpa MSS M5.`;
      } else if (isBullBreakout) {
        cls = 'zone-breakout';
        text = `Breakout Bullish (${pct}%) · Range High $${fmt(rHigh)} ditembus (+$${bslDiff.toFixed(2)}). Tunggu koreksi Demand — hindari Sell tanpa MSS M5.`;
      } else if (isSslSwept) {
        cls = 'zone-discount';
        text = `Extreme Discount (${pct}%) · SSL $${fmt(rLow)} tersapu (-$${sslDiff.toFixed(2)}). Amati reaksi rejection M5.`;
      } else if (isBslSwept) {
        cls = 'zone-premium';
        text = `Extreme Premium (${pct}%) · BSL $${fmt(rHigh)} tersapu (+$${bslDiff.toFixed(2)}). Amati reaksi rejection M5.`;
      } else if (rawPct > 75) {
        cls = 'zone-premium';
        text = `Extreme Premium (${pct}%) · Mendekati Range High $${fmt(rHigh)}. Prioritaskan konfirmasi Sell.`;
      } else if (rawPct > 52.5) {
        cls = 'zone-premium';
        text = `Zona Premium (${pct}%) · Area ideal pencarian Supply / Sell, hindari FOMO Buy di pucuk.`;
      } else if (rawPct < 25) {
        cls = m15Dir === -1 ? 'zone-breakdown' : 'zone-discount';
        text = m15Dir === -1
          ? `Extreme Discount (${pct}%) · Tren masih Bearish — tunggu pullback Supply, jangan kejar Sell di dasar.`
          : `Extreme Discount (${pct}%) · Mendekati Range Low $${fmt(rLow)}. Siaga konfirmasi pantulan Buy.`;
      } else if (rawPct < 47.5) {
        cls = 'zone-discount';
        text = m15Dir === -1
          ? `Zona Diskon (${pct}%) · Tren M15 Bearish — tunggu pullback ke area Supply/OTE sebelum Sell.`
          : `Zona Diskon (${pct}%) · Area ideal pencarian Demand / Buy, tunggu sweep atau validasi M5.`;
      } else {
        cls = 'zone-eq';
        text = `Equilibrium (${pct}%) · Area tengah 50% adalah No-Trade Zone, tunggu harga keluar ke Premium/Diskon.`;
      }
      badge.className = `dr-status-badge ${cls}`;
      badge.textContent = text;
    }

    // No-Trade Zone EQ (dipindah dari Peta Skenario ke dalam Dealing Range)
    const noTradeEl = $('no-trade-label');
    if (noTradeEl && Number.isFinite(noTradeLow) && Number.isFinite(noTradeHigh)) {
      const bLow  = noTradeLow.toFixed(2);
      const bHigh = noTradeHigh.toFixed(2);
      const inside = livePrice >= noTradeLow && livePrice <= noTradeHigh;
      noTradeEl.classList.toggle('is-inside-eq', inside);
      noTradeEl.textContent = inside
        ? `No-Trade Zone Aktif ($${bLow} – $${bHigh} · EQ) · Hindari eksekusi impulsif di tengah range.`
        : `No-Trade Zone EQ: $${bLow} – $${bHigh} (47.5%–52.5%) · Hindari entry di area tengah.`;
    }
  }

  /* ── 3. Panel Eksekusi POI (BUY / SELL Tab Switch) + Skenario ── */
  function renderPOICards(ctx) {
    if (!ctx) return;
    const amy = ctx.amy || ctx;
    const dashboard = amy?.dashboard;
    const { ngM15, ngM5 } = getDualLayerNextGen(amy, window.amyfxLastIndicators || null);
    const ng = ngM15 || window.amyfxLastIndicators || null;
    const livePrice = Number(window.amyfxCurrentPrice) || Number(ctx.price) || Number(dashboard?.candle?.close) || 0;

    // Subtitle badge berdasarkan bias
    const sellBadgeEl = $('poi-sell-badge');
    const buyBadgeEl  = $('poi-buy-badge');
    let m15Dir = 0;
    const m15Struct = String(ctx.m15?.structure || '').toUpperCase();
    const m15Control = String(ctx.m15?.control || '').toUpperCase();
    if (m15Struct.includes('BEAR') || m15Control.includes('SELLER') || dashboard?.biasDir === -1) m15Dir = -1;
    else if (m15Struct.includes('BULL') || m15Control.includes('BUYER') || dashboard?.biasDir === 1) m15Dir = 1;

    let h1Dir = 0;
    const h1BiasStr = String(ctx.h1?.bias || '').toUpperCase();
    if (h1BiasStr.includes('BEAR') || ctx.h1?.trend?.dir === -1 || ctx.h1Dir === -1) h1Dir = -1;
    else if (h1BiasStr.includes('BULL') || ctx.h1?.trend?.dir === 1 || ctx.h1Dir === 1) h1Dir = 1;

    if (sellBadgeEl && buyBadgeEl) {
      sellBadgeEl.className = 'poi-badge poi-badge--sell';
      buyBadgeEl.className = 'poi-badge poi-badge--buy';
      if (h1Dir === -1 && m15Dir === 1) {
        sellBadgeEl.textContent = 'High Probability HTF · Reversal Supply / PDH';
        buyBadgeEl.textContent  = 'Pullback Retest · Jemput di Demand M15';
      } else if (h1Dir === 1 && m15Dir === -1) {
        sellBadgeEl.textContent = 'Pullback Koreksi · Resistance Ekstrem';
        buyBadgeEl.textContent  = 'High Probability HTF · Reversal Demand / SSL';
      } else if (m15Dir === 1) {
        sellBadgeEl.textContent = 'Target Pembalikan · Resistance Ekstrem / PDH';
        buyBadgeEl.textContent  = 'Sejalan Bias M15 · Jemput di Demand';
      } else if (m15Dir === -1) {
        sellBadgeEl.textContent = 'Sejalan Bias M15 · Supply Premium';
        buyBadgeEl.textContent  = 'Counter-Trend · Support Ekstrem Saja';
      } else {
        sellBadgeEl.textContent = 'Target Pembalikan · Resistance Ekstrem';
        buyBadgeEl.textContent  = 'Pijakan Retest · Jemput di Demand';
      }
    }

    // Helper validasi zona aktif (ketat: buang BROKEN, INVALIDATED, FAILED, mitigated, breaker, removed, status=4)
    const isActiveZone = z => {
      if (!z) return false;
      if (z.mitigated === true || z.breaker === true || z.removed === true || z.status === 4) return false;
      const lc = String(z.lifecycle || z.status || '').toUpperCase();
      return lc !== 'BROKEN' && lc !== 'INVALIDATED' && lc !== 'FAILED';
    };

    // Kumpulkan FVG dari NextGen (chart) + AmyICT (backend)
    const fvgs = [
      ...(Array.isArray(ng?.poi?.fvg) ? ng.poi.fvg : []),
      ...(Array.isArray(amy?.visuals?.fvg) ? amy.visuals.fvg : []),
      ...(Array.isArray(amy?.levels?.fvgs) ? amy.levels.fvgs : []),
      ...(Array.isArray(amy?.fvgs) ? amy.fvgs : [])
    ];
    const zoneOf = f => {
      const lo = num(f.bot ?? f.low ?? f.gapLow ?? f.zoneLow);
      const hi = num(f.top ?? f.high ?? f.gapHigh ?? f.zoneHigh);
      const ce = num(f.ce ?? f.consequentEncroachment) || (lo + hi) / 2;
      const touchCount = Number.isFinite(Number(f.touchCount)) ? Number(f.touchCount) : (f.tested ? 1 : 0);
      return {
        lo,
        hi,
        ce,
        tested: Boolean(f.tested || touchCount > 0),
        touchCount,
        ceTouched: Boolean(f.ceTouched),
        lastTouchTime: Number(f.lastTouchTime) || null,
        touches: Array.isArray(f.touches) ? f.touches : [],
        lifecycle: String(f.lifecycle || (touchCount > 0 ? 'TESTED' : 'FRESH')).toUpperCase()
      };
    };
    const dedupeZones = arr => arr.filter((z, i) => arr.findIndex(y => Math.abs(y.lo - z.lo) < 0.25 && Math.abs(y.hi - z.hi) < 0.25) === i);

    const bearFVGs = dedupeZones(fvgs.filter(f => {
      const s = String(f.side || f.direction || f.type || '').toUpperCase();
      return (s === 'SELL' || s === 'BEARISH' || f.dir === -1) && isActiveZone(f);
    }).map(zoneOf).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi) && z.hi > z.lo));

    const bullFVGs = dedupeZones(fvgs.filter(f => {
      const s = String(f.side || f.direction || f.type || '').toUpperCase();
      return (s === 'BUY' || s === 'BULLISH' || f.dir === 1) && isActiveZone(f);
    }).map(zoneOf).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi) && z.hi > z.lo));

    // Kumpulkan Order Blocks (OB) dari seluruh sumber engine (Chart NextGen diprioritaskan agar sinkron 100%)
    const rawObs = [
      ...(Array.isArray(ng?.poi?.ob) ? ng.poi.ob : []),
      ...(Array.isArray(amy?.visuals?.ob) ? amy.visuals.ob : []),
      ...(Array.isArray(amy?.obs) ? amy.obs : []),
      ...(Array.isArray(ctx.orderBlocks) ? ctx.orderBlocks : []),
      ...(Array.isArray(ctx.m15?.orderBlocks) ? ctx.m15.orderBlocks : [])
    ];

    const m15Poi = ctx.m15?.poi;
    if (m15Poi && Number.isFinite(num(m15Poi.low)) && Number.isFinite(num(m15Poi.high)) && isActiveZone(m15Poi)) {
      rawObs.push({
        side: String(m15Poi.side || (m15Poi.dir === 1 ? 'BUY' : 'SELL')).toUpperCase(),
        direction: String(m15Poi.direction || (m15Poi.dir === 1 ? 'BULLISH' : 'BEARISH')).toUpperCase(),
        bot: num(m15Poi.low),
        top: num(m15Poi.high),
        ce: num(m15Poi.ce) || (num(m15Poi.low) + num(m15Poi.high)) / 2,
        label: `M15 ${m15Poi.kind || 'POI'}`,
        lifecycle: 'ACTIVE'
      });
    }

    const supStr = String(dashboard?.dashboard_rows?.['7_supply_mtf'] || dashboard?.supply || '');
    const supMatch = supStr.match(/Supply\s*\[(.*?)\]\s*([\d.]+)[-\s]+([\d.]+)/i);
    if (supMatch) {
      const sLo = num(supMatch[2]), sHi = num(supMatch[3]);
      if (Number.isFinite(sLo) && Number.isFinite(sHi) && sHi > sLo) {
        rawObs.push({ side: 'SELL', direction: 'BEARISH', bot: sLo, top: sHi, ce: (sLo + sHi) / 2, label: `Supply [${supMatch[1] || 'OB'}] M15`, lifecycle: 'ACTIVE' });
      }
    }

    const demStr = String(dashboard?.dashboard_rows?.['8_demand_mtf'] || dashboard?.demand || '');
    const demMatch = demStr.match(/Demand\s*\[(.*?)\]\s*([\d.]+)[-\s]+([\d.]+)/i);
    if (demMatch) {
      const dLo = num(demMatch[2]), dHi = num(demMatch[3]);
      if (Number.isFinite(dLo) && Number.isFinite(dHi) && dHi > dLo) {
        rawObs.push({ side: 'BUY', direction: 'BULLISH', bot: dLo, top: dHi, ce: (dLo + dHi) / 2, label: `Demand [${demMatch[1] || 'OB'}] M15`, lifecycle: 'ACTIVE' });
      }
    }

    const obZoneOf = o => {
      const lo = num(o.bot ?? o.low ?? o.zoneLow);
      const hi = num(o.top ?? o.high ?? o.zoneHigh);
      const ce = num(o.ce ?? o.meanThreshold) || (lo + hi) / 2;
      const sideUpper = String(o.side || o.direction || o.type || '').toUpperCase();
      const label = o.label || ((sideUpper === 'BUY' || sideUpper === 'BULLISH') ? '+OB Demand M15' : '-OB Supply M15');
      const touchCount = Number.isFinite(Number(o.touchCount)) ? Number(o.touchCount) : (o.tested ? 1 : 0);
      return {
        lo,
        hi,
        ce,
        label,
        tested: Boolean(o.tested || touchCount > 0),
        touchCount,
        ceTouched: Boolean(o.ceTouched),
        lastTouchTime: Number(o.lastTouchTime) || null,
        touches: Array.isArray(o.touches) ? o.touches : [],
        lifecycle: String(o.lifecycle || (touchCount > 0 ? 'TESTED' : 'FRESH')).toUpperCase(),
        raw: o
      };
    };

    const isBearOb = o => {
      const s = String(o.side || o.direction || o.bias || o.type || '').toUpperCase();
      return (s === 'SELL' || s === 'BEARISH' || s === '-OB' || o.dir === -1) && isActiveZone(o);
    };
    const isBullOb = o => {
      const s = String(o.side || o.direction || o.bias || o.type || '').toUpperCase();
      return (s === 'BUY' || s === 'BULLISH' || s === '+OB' || o.dir === 1) && isActiveZone(o);
    };

    const uniqueBearOBs = dedupeZones(rawObs.filter(isBearOb).map(obZoneOf).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi) && z.hi > z.lo));
    const uniqueBullOBs = dedupeZones(rawObs.filter(isBullOb).map(obZoneOf).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi) && z.hi > z.lo));
    const viableBearOBs = uniqueBearOBs.filter(z => z.hi >= livePrice - 1.5);
    const viableBullOBs = uniqueBullOBs.filter(z => z.lo <= livePrice + 1.5);

    // Lapisan Refinement M5 (Scalper Dual-Layer: FVG & OB M5 aktif langsung dari candle M5 server)
    const m5RawFvgs = Array.isArray(ngM5?.poi?.fvg) ? ngM5.poi.fvg : [];
    const m5BearFVGs = dedupeZones(m5RawFvgs.filter(f => {
      const s = String(f.side || f.direction || f.type || '').toUpperCase();
      return (s === 'SELL' || s === 'BEARISH' || f.dir === -1) && isActiveZone(f);
    }).map(zoneOf).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi) && z.hi > z.lo));

    const m5BullFVGs = dedupeZones(m5RawFvgs.filter(f => {
      const s = String(f.side || f.direction || f.type || '').toUpperCase();
      return (s === 'BUY' || s === 'BULLISH' || f.dir === 1) && isActiveZone(f);
    }).map(zoneOf).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi) && z.hi > z.lo));

    const m5RawObs = Array.isArray(ngM5?.poi?.ob) ? ngM5.poi.ob : [];
    const m5BearOBs = dedupeZones(m5RawObs.filter(isBearOb).map(o => ({ ...obZoneOf(o), label: o.label || '-OB Supply M5' })).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi) && z.hi > z.lo));
    const m5BullOBs = dedupeZones(m5RawObs.filter(isBullOb).map(o => ({ ...obZoneOf(o), label: o.label || '+OB Demand M5' })).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi) && z.hi > z.lo));

    // Lapisan Zona Flip Institusional: Inverse FVG (iFVG) & Breaker Block (BB) — M15 & M5
    const extractTypedZones = (list, sideTarget, defaultLabel) => dedupeZones(
      (Array.isArray(list) ? list : [])
        .filter(z => {
          const s = String(z.side || z.direction || z.type || '').toUpperCase();
          const matchSide = sideTarget === 'SELL'
            ? (s === 'SELL' || s === 'BEARISH' || z.dir === -1)
            : (s === 'BUY' || s === 'BULLISH' || z.dir === 1);
          return matchSide && isActiveZone(z);
        })
        .map(z => ({ ...zoneOf(z), label: z.label || defaultLabel }))
        .filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi) && z.hi > z.lo)
    );
    const bearIFVGs = extractTypedZones(ng?.poi?.ifvg, 'SELL', '-iFVG Supply M15');
    const bullIFVGs = extractTypedZones(ng?.poi?.ifvg, 'BUY', '+iFVG Demand M15');
    const bearBBs = extractTypedZones(ng?.poi?.bb, 'SELL', '-BB Breaker M15');
    const bullBBs = extractTypedZones(ng?.poi?.bb, 'BUY', '+BB Breaker M15');
    const m5BearIFVGs = extractTypedZones(ngM5?.poi?.ifvg, 'SELL', '-iFVG Supply M5');
    const m5BullIFVGs = extractTypedZones(ngM5?.poi?.ifvg, 'BUY', '+iFVG Demand M5');
    const m5BearBBs = extractTypedZones(ngM5?.poi?.bb, 'SELL', '-BB Breaker M5');
    const m5BullBBs = extractTypedZones(ngM5?.poi?.bb, 'BUY', '+BB Breaker M5');

    // Evaluasi M5 independen (selaras 100% dengan Hero Card)
    let m5Dir = 0;
    const m5Status = String(ctx.m5?.status || '').toUpperCase();
    const m5DirStr = String(ctx.m5?.direction || ctx.m5?.side || '').toUpperCase();
    const trig = amy?.trigger || {};
    const trigBull = Boolean(trig.bullBreak || trig.bullDisp || trig.bullMss || m5DirStr.includes('BULL') || m5DirStr === 'BUY');
    const trigBear = Boolean(trig.bearBreak || trig.bearDisp || trig.bearMss || m5DirStr.includes('BEAR') || m5DirStr === 'SELL');
    const m5Mss = ctx.m5?.mss;
    if (m5Status === 'CONFIRMED' || m5Mss || trigBull || trigBear) {
      if (trigBull && !trigBear) m5Dir = 1;
      else if (trigBear && !trigBull) m5Dir = -1;
      else if (m5Status === 'CONFIRMED' && ctx.primary?.side) {
        const pSide = String(ctx.primary.side).toUpperCase();
        if (pSide === 'BUY') m5Dir = 1;
        else if (pSide === 'SELL') m5Dir = -1;
      }
    }

    // Filter Sesi Killzone & Berita High-Impact USD untuk Scalper (Single Source: market-session-clock.js)
    const sessionState = resolveGoldSessionState(Date.now());
    const newsStatus = String(ctx.news?.status || '').toUpperCase();
    let sessionGuard = { label: 'Sesi Aktif · Selektif M5', tone: 'is-caution', ok: true, halfLot: false, blocked: false };
    if (sessionState.isClosed) {
      sessionGuard = { label: sessionState.label, tone: 'is-danger', ok: false, halfLot: false, blocked: true };
    } else if (newsStatus === 'NEWS_LOCK') {
      sessionGuard = { label: 'News USD Aktif · Tahan Entry', tone: 'is-danger', ok: false, halfLot: true, blocked: true };
    } else if (newsStatus === 'UPCOMING') {
      sessionGuard = { label: 'News USD <30m · Kurangi Lot 50%', tone: 'is-caution', ok: true, halfLot: true, blocked: false };
    } else if (sessionState.isKillzone) {
      sessionGuard = { label: `${sessionState.label} · Ideal Scalping`, tone: 'is-killzone', ok: true, halfLot: false, blocked: false };
    } else if (sessionState.code === 'LONDON-NY PRE-OPEN' || sessionState.code === 'NEW YORK SIANG') {
      sessionGuard = { label: `${sessionState.label} · Selektif M5`, tone: 'is-caution', ok: true, halfLot: false, blocked: false };
    } else {
      sessionGuard = { label: `${sessionState.label} · Luar Killzone (Lot 50%)`, tone: 'is-caution', ok: false, halfLot: true, blocked: false };
    }

    // Kandidat Likuiditas Riil (Single Source: NextGen DOL + keyLevels + Protected Swings + Dashboard)
    const drState = resolveUnifiedDealingRange(ctx, livePrice);
    const { rHigh, rLow, eq: eqVal, pct, rawPct, isDiscount, isPremium, noTradeLow, noTradeHigh } = drState;
    const ngKey = ng?.keyLevels || {};
    const chartTrend = String(ng?.structure?.trend || '').toUpperCase();
    const protectedHigh = num(ng?.structure?.protectedHigh);
    const protectedLow = num(ng?.structure?.protectedLow);
    const ngPoolsAbove = Array.isArray(ng?.dol?.poolsAbove) ? ng.dol.poolsAbove.map(p => ({ name: p.name, k: 'H', v: num(p.level ?? p.price) })) : [];
    const ngPoolsBelow = Array.isArray(ng?.dol?.poolsBelow) ? ng.dol.poolsBelow.map(p => ({ name: p.name, k: 'L', v: num(p.level ?? p.price) })) : [];

    // Active BOS Leg & OTE (61.8% – 78.6%) — hanya pakai NextGen activeLeg jika searah SSOT M15!
    let activeLeg = null;
    const ngLegTrend = String(ng?.activeLeg?.trend || '').toUpperCase();
    const ngLegMatchesM15 = (m15Dir === 1 && ngLegTrend === 'BULL') || (m15Dir === -1 && ngLegTrend === 'BEAR') || m15Dir === 0;
    if (ng?.activeLeg && ngLegMatchesM15 && Number.isFinite(num(ng.activeLeg.high)) && Number.isFinite(num(ng.activeLeg.low))) {
      const aHigh = ngLegTrend === 'BULL' && livePrice > 0 ? Math.max(ng.activeLeg.high, livePrice) : ng.activeLeg.high;
      const aLow = ngLegTrend === 'BEAR' && livePrice > 0 ? Math.min(ng.activeLeg.low, livePrice) : ng.activeLeg.low;
      if (aHigh > aLow) {
        const span = aHigh - aLow;
        const aEq = (aHigh + aLow) / 2;
        const o1 = ngLegTrend === 'BEAR' ? aLow + span * 0.618 : aHigh - span * 0.786;
        const o2 = ngLegTrend === 'BEAR' ? aLow + span * 0.786 : aHigh - span * 0.618;
        activeLeg = { trend: ngLegTrend, high: aHigh, low: aLow, eq: aEq, oteLow: Math.min(o1, o2), oteHigh: Math.max(o1, o2) };
      }
    }

    // Recent M15 Impulse Leg (16 bar M15 terakhir ~4 jam) untuk validasi Continuation FVG/OB saat ekspansi
    let impulseHigh = NaN;
    let impulseLow = NaN;
    const recentM15Bars = Array.isArray(amy?.chartCandles?.M15) ? amy.chartCandles.M15.slice(-16) : [];
    if (recentM15Bars.length >= 6) {
      const hiVals = recentM15Bars.map(b => Number(b.high)).filter(Number.isFinite);
      const loVals = recentM15Bars.map(b => Number(b.low)).filter(Number.isFinite);
      if (hiVals.length && loVals.length) {
        impulseHigh = Math.max(...hiVals, livePrice > 0 ? livePrice : -Infinity);
        impulseLow = Math.min(...loVals, livePrice > 0 ? livePrice : Infinity);
      }
    }

    const takenKeyLabels = new Set(
      (Array.isArray(ctx?.liquidity) ? ctx.liquidity : [])
        .filter(l => String(l?.status || '').toUpperCase() === 'TAKEN')
        .map(l => String(l?.label || '').toUpperCase())
    );
    const pdhFresh = !ngKey.pdhConsumed && !takenKeyLabels.has('PDH');
    const pdlFresh = !ngKey.pdlConsumed && !takenKeyLabels.has('PDL');
    const asiaHighFresh = !ngKey.asiaHighConsumed && !takenKeyLabels.has('ASIA HIGH');
    const asiaLowFresh = !ngKey.asiaLowConsumed && !takenKeyLabels.has('ASIA LOW');

    const liqCandidates = [
      ...ngPoolsAbove,
      ...ngPoolsBelow,
      { name: 'Protected High M15', k: 'H', v: protectedHigh },
      { name: 'BSL M15', k: 'H', v: num(dashboard?.bsl) },
      { name: 'Range High M15', k: 'H', v: num(rHigh) },
      { name: 'BSL Swing', k: 'H', v: num(amy?.levels?.bsl) },
      ...(pdhFresh ? [{ name: 'PDH', k: 'H', v: num(amy?.levels?.pdh ?? ngKey.pdh) }] : []),
      ...(asiaHighFresh ? [{ name: 'Asia High', k: 'H', v: num(amy?.levels?.asiaHigh ?? ngKey.asiaHigh) }] : []),
      { name: 'Protected Low M15', k: 'L', v: protectedLow },
      { name: 'SSL M15', k: 'L', v: num(dashboard?.ssl) },
      { name: 'Range Low M15', k: 'L', v: num(rLow) },
      { name: 'SSL Swing', k: 'L', v: num(amy?.levels?.ssl) },
      ...(pdlFresh ? [{ name: 'PDL', k: 'L', v: num(amy?.levels?.pdl ?? ngKey.pdl) }] : []),
      ...(asiaLowFresh ? [{ name: 'Asia Low', k: 'L', v: num(amy?.levels?.asiaLow ?? ngKey.asiaLow) }] : [])
    ].filter(x => Number.isFinite(x.v));

    const dedupeLiq = arr => arr.filter((x, i) => arr.findIndex(y => Math.abs(y.v - x.v) < 0.08) === i);
    const highPools = dedupeLiq(liqCandidates.filter(x => x.k === 'H'));
    const lowPools  = dedupeLiq(liqCandidates.filter(x => x.k === 'L'));
    const liqAbove  = livePrice > 0 ? highPools.filter(x => x.v > livePrice).sort((a, b) => a.v - b.v) : [];
    const liqBelow  = livePrice > 0 ? lowPools.filter(x => x.v < livePrice).sort((a, b) => b.v - a.v) : [];

    const MAX_STRUCTURAL_SL_BUFFER = 9.0;

    // Helper pilih POI Scalper Dual-Layer (M5 Refinement + M15 Structural Swing + iFVG & Breaker Block)
    function selectDualLayerPOI(side) {
      const isSell = side === 'SELL';
      return selectScalperDualLayerPoi({
        side,
        m15Obs: isSell ? uniqueBearOBs : uniqueBullOBs,
        m15Fvgs: isSell ? bearFVGs : bullFVGs,
        m15Ifvgs: isSell ? bearIFVGs : bullIFVGs,
        m15Bbs: isSell ? bearBBs : bullBBs,
        m5Obs: isSell ? m5BearOBs : m5BullOBs,
        m5Fvgs: isSell ? m5BearFVGs : m5BullFVGs,
        m5Ifvgs: isSell ? m5BearIFVGs : m5BullIFVGs,
        m5Bbs: isSell ? m5BearBBs : m5BullBBs,
        livePrice,
        m15Dir,
        activeLeg,
        eqVal,
        protectedHigh,
        protectedLow,
        impulseHigh,
        impulseLow
      });
    }

    // Helper buffer SL realistis XAU/USD (anti wick-sweep $0.40 saat anchor tepat di tepi POI)
    function resolveLiveSlBuffer(invObj, zone) {
      const isPoiEdge = !invObj || /^Batas (Atas|Bawah)/i.test(String(invObj.name || ''));
      if (isPoiEdge && zone) {
        return computeGoldSlBuffer(zone.tf || 'M15', Math.max(0.5, zone.high - zone.low));
      }
      return 0.80;
    }

    // Helper pilih Invalidasi & SL yang WAJIB berada di LUAR batas zona entry (anti-terbalik) + Guardrail SL Scalper
    function resolveStructuralInvalidation(zone, side) {
      const isSell = side === 'SELL';
      if (zone) {
        if (isSell) {
          // Jika Protected High M15 di atas zona dan dalam jarak scalper yang wajar, prioritaskan
          if (Number.isFinite(protectedHigh) && protectedHigh >= zone.high && (protectedHigh - zone.high) <= MAX_STRUCTURAL_SL_BUFFER) {
            return { name: 'Protected High M15', k: 'H', v: protectedHigh };
          }
          const validHighs = highPools
            .filter(x => x.v >= zone.high)
            .sort((a, b) => a.v - b.v);
          const nearHigh = validHighs.find(x => (x.v - zone.high) <= MAX_STRUCTURAL_SL_BUFFER);
          if (nearHigh) return nearHigh;
          return { name: `Batas Atas ${zone.kind || 'OB'}`, k: 'H', v: zone.high };
        } else {
          if (Number.isFinite(protectedLow) && protectedLow <= zone.low && (zone.low - protectedLow) <= MAX_STRUCTURAL_SL_BUFFER) {
            return { name: 'Protected Low M15', k: 'L', v: protectedLow };
          }
          const validLows = lowPools
            .filter(x => x.v <= zone.low)
            .sort((a, b) => b.v - a.v);
          const nearLow = validLows.find(x => (zone.low - x.v) <= MAX_STRUCTURAL_SL_BUFFER);
          if (nearLow) return nearLow;
          return { name: `Batas Bawah ${zone.kind || 'OB'}`, k: 'L', v: zone.low };
        }
      }
      return isSell ? (liqAbove[0] || null) : (liqBelow[0] || null);
    }

    function evaluateSlGuard(entryCe, slPrice) {
      if (!Number.isFinite(entryCe) || !Number.isFinite(slPrice)) {
        return { dist: NaN, status: 'unknown', label: 'Menunggu SL' };
      }
      const dist = Math.abs(entryCe - slPrice);
      const pips = Math.round(dist * 10);
      if (dist < 6.0) return { dist, status: 'tight', label: `SL $${dist.toFixed(2)} (${pips}p) · Ketat (<60p)` };
      if (dist > 10.0) return { dist, status: 'wide', label: `SL $${dist.toFixed(2)} (${pips}p) · Lebar (>100p)` };
      return { dist, status: 'ideal', label: `SL $${dist.toFixed(2)} (${pips}p) · Ideal 60–100p` };
    }

    // Helper Target 2-Tahap Scalper: TP1 Cepat (Close 60% & Geser BEP) + TP2 Runner (DOL Utama)
    function resolveScalperTargets(zone, slPrice, side) {
      const isSell = side === 'SELL';
      const entryCe = zone ? zone.ce : livePrice;
      const risk = (Number.isFinite(entryCe) && Number.isFinite(slPrice))
        ? Math.max(1.2, isSell ? (slPrice - entryCe) : (entryCe - slPrice))
        : 4.0;

      const basePools = isSell ? [...lowPools] : [...highPools];
      if (Number.isFinite(eqVal)) {
        if (isSell && zone && eqVal < zone.low - 2.0) basePools.push({ name: 'EQ 50%', k: 'L', v: eqVal });
        else if (!isSell && zone && eqVal > zone.high + 2.0) basePools.push({ name: 'EQ 50%', k: 'H', v: eqVal });
      }
      if (activeLeg && Number.isFinite(activeLeg.eq)) {
        if (isSell && zone && activeLeg.eq < zone.low - 2.0) basePools.push({ name: 'EQ Leg Aktif', k: 'L', v: activeLeg.eq });
        else if (!isSell && zone && activeLeg.eq > zone.high + 2.0) basePools.push({ name: 'EQ Leg Aktif', k: 'H', v: activeLeg.eq });
      }

      const validPools = dedupeLiq(basePools)
        .filter(x => {
          const boundary = isSell ? (zone ? zone.low - 1.5 : livePrice - 1.5) : (zone ? zone.high + 1.5 : livePrice + 1.5);
          return isSell ? x.v < boundary : x.v > boundary;
        })
        .sort((a, b) => isSell ? (b.v - a.v) : (a.v - b.v));

      if (!validPools.length) {
        if (!Number.isFinite(entryCe)) return { tp1: null, tp2: null, risk, rr1: NaN, rr2: NaN };
        const synth1 = isSell ? entryCe - Math.max(risk * 1.8, 5.5) : entryCe + Math.max(risk * 1.8, 5.5);
        const synth2 = isSell ? entryCe - Math.max(risk * 3.0, 10.0) : entryCe + Math.max(risk * 3.0, 10.0);
        return {
          tp1: { name: 'Partial BEP (1:1.8)', k: isSell ? 'L' : 'H', v: Number(synth1.toFixed(2)), synthetic: true },
          tp2: { name: 'Ekspansi 3R', k: isSell ? 'L' : 'H', v: Number(synth2.toFixed(2)), synthetic: true },
          risk,
          rr1: Math.abs(synth1 - entryCe) / risk,
          rr2: Math.abs(synth2 - entryCe) / risk
        };
      }

      // Cari pool struktural yang cocok sebagai TP1 Cepat Scalper (1.4R – 2.6R dan jarak <= $18)
      const scalperPool = validPools.find(x => {
        const dist = Math.abs(x.v - entryCe);
        const rr = dist / risk;
        return rr >= 1.4 && rr <= 2.6 && dist <= 18.0;
      });
      const healthyPool = validPools.find(x => (Math.abs(x.v - entryCe) / risk) >= 1.4);

      let tp1 = null;
      let tp2 = null;

      if (scalperPool) {
        tp1 = scalperPool;
        tp2 = validPools.find(x => isSell ? (x.v < tp1.v - 2.0) : (x.v > tp1.v + 2.0)) || null;
      } else if (healthyPool && Number.isFinite(entryCe) && ((Math.abs(healthyPool.v - entryCe) / risk) > 2.6 || Math.abs(healthyPool.v - entryCe) > 18.0)) {
        // Pool terdekat jauh (>2.6R atau >$18): buat TP1 Cepat (BEP) lebih dekat, lalu DOL struktural asli jadi TP2 Runner!
        const targetMult = risk > 7.5 ? 1.6 : 1.8;
        const fastDist = Math.max(risk * targetMult, 5.5);
        const fastVal = isSell ? (entryCe - fastDist) : (entryCe + fastDist);
        const stillBeforeDol = isSell ? (fastVal > healthyPool.v + 2.5) : (fastVal < healthyPool.v - 2.5);
        if (stillBeforeDol) {
          tp1 = { name: `Partial BEP (1:${targetMult.toFixed(1)})`, k: isSell ? 'L' : 'H', v: Number(fastVal.toFixed(2)), synthetic: true };
          tp2 = healthyPool;
        } else {
          tp1 = healthyPool;
          tp2 = validPools.find(x => isSell ? (x.v < tp1.v - 2.0) : (x.v > tp1.v + 2.0)) || null;
        }
      } else {
        tp1 = healthyPool || validPools[Math.min(validPools.length - 1, 1)];
        tp2 = validPools.find(x => isSell ? (x.v < tp1.v - 2.0) : (x.v > tp1.v + 2.0)) || null;
      }

      const rr1 = tp1 && Number.isFinite(entryCe) ? (Math.abs(tp1.v - entryCe) / risk) : NaN;
      const rr2 = tp2 && Number.isFinite(entryCe) ? (Math.abs(tp2.v - entryCe) / risk) : NaN;
      return { tp1, tp2, risk, rr1, rr2 };
    }

    // Helper Evaluasi & Render 5-Poin Scalper Verdict Gate (Delegasi ke pure module mapping-accuracy.js)
    function evaluateAndRenderVerdict(side, cfg) {
      const isSell = side === 'SELL';
      const prefix = isSell ? 'sell' : 'buy';
      const barEl = $(`${prefix}-verdict-bar`);
      const gradeEl = $(`${prefix}-verdict-grade`);
      const scoreEl = $(`${prefix}-verdict-score`);
      const guardEl = $(`${prefix}-session-guard`);
      const checksEl = $(`${prefix}-verdict-checks`);
      if (!barEl) return { grade: 'WAIT', skip: false, score: 0 };

      const verdict = evaluateScalperPoiVerdict({
        side,
        h1Dir,
        m15Dir,
        m5Dir,
        zone: cfg.zone,
        livePrice,
        slGuard: cfg.slGuard,
        rr1: cfg.rr1,
        tp1: cfg.tp1 || null,
        isSlHit: cfg.isSlHit,
        sessionGuard,
        newsStatus
      });

      barEl.className = `poi-verdict-card ${verdict.cls}`;
      if (gradeEl) gradeEl.textContent = verdict.grade;
      if (scoreEl) scoreEl.textContent = `${verdict.score}/5`;
      if (guardEl) {
        guardEl.textContent = sessionGuard.label;
        guardEl.className = `poi-session-guard ${sessionGuard.tone}`;
      }
      if (checksEl) {
        checksEl.innerHTML = verdict.checks.map(c => {
          const itemCls = c.ok ? 'is-pass' : (c.warn ? 'is-warn' : 'is-fail');
          const mark = c.ok ? '✓' : (c.warn ? '•' : '✕');
          return `<span class="poi-check-item ${itemCls}"><span class="poi-check-mark">${mark}</span><span>${esc(c.label)}</span></span>`;
        }).join('');
      }

      return verdict;
    }

    // ══════════════════════════════════════════════
    // SELL SETUP COMPUTATION & RENDER (SCALPER PRO)
    // ══════════════════════════════════════════════
    const sellTbody = $('sell-poi-tbody');
    const sellSelection = selectDualLayerPOI('SELL');
    let primarySellZone = sellSelection.primary;
    const backupSellZone = sellSelection.backup;
    let isSellTesting = false;
    let isSellReacting = false;
    let isSellTpHit = false;
    let isSellSlHit = false;

    const prevSellBuf = Number.isFinite(activeSellSession?.slBuffer) ? activeSellSession.slBuffer : 1.50;
    if (activeSellSession && Number.isFinite(activeSellSession.sl) && livePrice > activeSellSession.sl + prevSellBuf) {
      isSellSlHit = true;
      activeSellSession = null;
    }

    const invSell = resolveStructuralInvalidation(primarySellZone, 'SELL');
    const trueSlBoundary = invSell ? invSell.v : (primarySellZone ? primarySellZone.high : NaN);
    const sellSlBuf = resolveLiveSlBuffer(invSell, primarySellZone);
    const rawSlSell = Number.isFinite(trueSlBoundary) ? Number((trueSlBoundary + sellSlBuf).toFixed(2)) : NaN;
    const slLevelSellNum = primarySellZone
      ? computeGoldSlPrice('SELL', primarySellZone.low, primarySellZone.high, primarySellZone.ce, primarySellZone.tf || 'M15', rawSlSell)
      : rawSlSell;
    const sellSlGuard = evaluateSlGuard(primarySellZone?.ce, slLevelSellNum);
    const sellTargets = resolveScalperTargets(primarySellZone, slLevelSellNum, 'SELL');
    const tpCandSell = sellTargets.tp1;
    const tpCandSell2 = sellTargets.tp2;
    const sellRr = sellTargets.rr1;

    if (primarySellZone && primarySellZone.breached) {
      isSellSlHit = true;
    } else if (primarySellZone && Number.isFinite(trueSlBoundary)) {
      const sameZone = activeSellSession?.zone
        && Math.abs(activeSellSession.zone.low - primarySellZone.low) < 0.25
        && Math.abs(activeSellSession.zone.high - primarySellZone.high) < 0.25;
      const inZoneNow = livePrice >= primarySellZone.low - 0.20 && livePrice <= primarySellZone.high + 0.25;
      const prevTriggered = sameZone ? Boolean(activeSellSession.triggered) : false;
      const prevTrigPrice = sameZone ? activeSellSession.triggeredPrice : null;

      activeSellSession = {
        zone: primarySellZone,
        sl: trueSlBoundary,
        slBuffer: sellSlBuf,
        slLevel: Number.isFinite(slLevelSellNum) ? slLevelSellNum.toFixed(2) : null,
        slName: invSell?.name || 'Batas Atas POI',
        tp: tpCandSell?.v,
        tpName: tpCandSell?.name || 'SSL M15',
        triggered: Boolean(prevTriggered || inZoneNow),
        triggeredPrice: prevTrigPrice || (inZoneNow ? livePrice : null),
        lastSeenTime: Date.now()
      };
    } else if (activeSellSession && activeSellSession.zone) {
      if (Number.isFinite(activeSellSession.tp) && livePrice <= activeSellSession.tp) {
        isSellTpHit = true;
        primarySellZone = activeSellSession.zone;
      } else if (Date.now() - activeSellSession.lastSeenTime < 4 * 3600 * 1000) {
        primarySellZone = activeSellSession.zone;
      }
    }

    if (primarySellZone && !primarySellZone.breached && activeSellSession) {
      if (livePrice >= primarySellZone.low - 0.20 && livePrice <= primarySellZone.high + 0.25) {
        isSellTesting = true;
        activeSellSession.triggered = true;
        if (!activeSellSession.triggeredPrice) activeSellSession.triggeredPrice = livePrice;
      } else if (activeSellSession.triggered && livePrice < primarySellZone.low - 0.30 && (!Number.isFinite(activeSellSession.tp) || livePrice > activeSellSession.tp)) {
        isSellReacting = true;
      }
    }
    const isSellInPlay = isSellTesting || isSellReacting;

    // Render 5-Poin Scalper Verdict (SELL)
    const sellVerdict = evaluateAndRenderVerdict('SELL', {
      zone: primarySellZone,
      slGuard: sellSlGuard,
      rr1: sellRr,
      tp1: tpCandSell,
      isSlHit: isSellSlHit
    });

    // Cache plan for Lot Calculator, 1-Click Alarm & Chart Sync (SELL)
    const sellTpVal = tpCandSell?.v ?? activeSellSession?.tp;
    const sellSlVal = Number.isFinite(slLevelSellNum) ? slLevelSellNum : (Number.isFinite(activeSellSession?.sl) ? Number((activeSellSession.sl + (activeSellSession.slBuffer || 1.50)).toFixed(2)) : NaN);
    latestSellPlan = primarySellZone && Number.isFinite(sellSlVal)
      ? {
          entry: Number(primarySellZone.ce.toFixed(2)),
          sl: sellSlVal,
          tp1: Number.isFinite(sellTpVal) ? Number(sellTpVal.toFixed(2)) : Number((primarySellZone.ce - 8).toFixed(2)),
          tp2: tpCandSell2 ? Number(tpCandSell2.v.toFixed(2)) : undefined
        }
      : null;
    latestSellOverlay = primarySellZone && !primarySellZone.breached
      ? {
          scalper: true,
          side: 'SELL',
          tf: primarySellZone.tf || 'M15',
          kind: primarySellZone.kind || 'OB',
          label: primarySellZone.label || '-OB',
          skip: Boolean(sellVerdict?.skip),
          alarmPrice: Number(primarySellZone.low.toFixed(2)),
          area: {
            low: Number(primarySellZone.low.toFixed(2)),
            high: Number(primarySellZone.high.toFixed(2)),
            ce: Number(primarySellZone.ce.toFixed(2))
          },
          tp1: Number.isFinite(sellTpVal) ? Number(sellTpVal.toFixed(2)) : NaN,
          tp2: tpCandSell2 ? Number(tpCandSell2.v.toFixed(2)) : NaN,
          sl: sellSlVal
        }
      : null;
    backupSellOverlay = backupSellZone && !backupSellZone.breached
      ? {
          scalper: true,
          side: 'SELL',
          tf: backupSellZone.tf || 'M5',
          kind: backupSellZone.kind || 'FVG',
          label: backupSellZone.label || backupSellZone.kind || 'POI',
          skip: Boolean(sellVerdict?.skip),
          alarmPrice: Number(backupSellZone.low.toFixed(2)),
          area: {
            low: Number(backupSellZone.low.toFixed(2)),
            high: Number(backupSellZone.high.toFixed(2)),
            ce: Number(backupSellZone.ce.toFixed(2))
          },
          tp1: Number.isFinite(sellTpVal) ? Number(sellTpVal.toFixed(2)) : NaN,
          tp2: tpCandSell2 ? Number(tpCandSell2.v.toFixed(2)) : NaN,
          sl: sellSlVal
        }
      : null;

    // Update 3 Structured Level Tiles (SELL)
    const sellEntryValEl = $('sell-entry-val');
    const sellEntrySubEl = $('sell-entry-sub');
    if (sellEntryValEl) sellEntryValEl.textContent = primarySellZone ? fmtRange(primarySellZone.low, primarySellZone.high) : 'Belum Ada';
    if (sellEntrySubEl) {
      const tfTag = primarySellZone?.tf ? ` ${primarySellZone.tf}` : '';
      const oteTag = primarySellZone?.inOte ? ' · OTE' : '';
      const sTouchCnt = Number(primarySellZone?.touchCount) || 0;
      const touchTag = primarySellZone
        ? (sTouchCnt > 0
            ? ` · Sentuh ${sTouchCnt}×${primarySellZone.ceTouched ? ' CE' : ''}`
            : (primarySellZone.fresh ? ' · Fresh' : ''))
        : '';
      const distTag = (primarySellZone && Number.isFinite(sellVerdict.zoneDist) && sellVerdict.zoneDist >= 0.5)
        ? ` · +$${sellVerdict.zoneDist.toFixed(1)}`
        : (primarySellZone && Number.isFinite(sellVerdict.zoneDist) ? ' · Di Zona' : '');
      sellEntrySubEl.textContent = primarySellZone
        ? `${primarySellZone.kind || 'OB'}${tfTag}${touchTag}${oteTag} · CE $${fmt(primarySellZone.ce)}${distTag}`
        : 'Tunggu Supply/OB di atas harga';
    }
    const sellTpValEl = $('sell-tp-val');
    const sellTpSubEl = $('sell-tp-sub');
    if (sellTpValEl) sellTpValEl.textContent = Number.isFinite(sellTpVal) ? `$${fmt(sellTpVal)}` : '—';
    if (sellTpSubEl) {
      const subText = formatTp1Subtitle(tpCandSell, tpCandSell2, sellRr);
      sellTpSubEl.textContent = subText || 'Likuiditas SSL bawah';
    }
    const sellSlValEl = $('sell-sl-val');
    const sellSlSubEl = $('sell-sl-sub');
    if (sellSlValEl) sellSlValEl.textContent = Number.isFinite(sellSlVal) ? `$${fmt(sellSlVal)}` : '—';
    if (sellSlSubEl) {
      const slBase = Number.isFinite(trueSlBoundary) ? trueSlBoundary : activeSellSession?.sl;
      sellSlSubEl.textContent = Number.isFinite(slBase)
        ? `${sellSlGuard.label} · ${invSell?.name || 'POI'}`
        : 'Batas invalidasi BSL';
    }

    if (sellBadgeEl) {
      if (primarySellZone?.breached || isSellSlHit) {
        sellBadgeEl.className = 'poi-badge poi-badge--sell';
        sellBadgeEl.textContent = 'Zona Tembus / Invalid · Tunggu Struktur Baru';
      } else if (isSellTesting) {
        sellBadgeEl.className = 'poi-badge poi-badge--sell poi-badge--active';
        sellBadgeEl.textContent = `Menguji Zona · Pantau Rejection M5 ($${fmt(livePrice)})`;
      } else if (isSellReacting) {
        sellBadgeEl.className = 'poi-badge poi-badge--sell poi-badge--active';
        sellBadgeEl.textContent = `Zona Teruji · Reaksi Aktif dari $${fmt(activeSellSession?.triggeredPrice || primarySellZone.low)}`;
      } else if (isSellTpHit) {
        sellBadgeEl.className = 'poi-badge poi-badge--sell poi-badge--hit';
        sellBadgeEl.textContent = 'Target TP1 Tercapai · Amankan BEP / Runner';
      }
    }

    if (sellTbody) {
      const sellRows = [];
      if (primarySellZone) {
        const sTouchCnt = Number(primarySellZone.touchCount) || 0;
        const sTouchMeta = sTouchCnt > 0
          ? ` · Disentuh ${sTouchCnt}×${primarySellZone.ceTouched ? ' (50% CE)' : ''}${primarySellZone.lastTouchTime ? ` @ ${formatWitaClock(primarySellZone.lastTouchTime * 1000)}` : ''}`
          : ' · Zona Fresh (belum tersentuh)';
        const trigNote = primarySellZone.breached
          ? `Harga ($${fmt(livePrice)}) menembus atas zona — jangan paksa entry`
          : isSellTesting
            ? `Sedang diuji ($${fmt(livePrice)}) — tunggu candle rejection/MSS M5${sTouchMeta}`
            : isSellReacting
              ? `Reaksi dari $${fmt(activeSellSession?.triggeredPrice || primarySellZone.low)} · Bergerak -$${fmt(Math.max(0, (activeSellSession?.triggeredPrice || primarySellZone.low) - livePrice))}${sTouchMeta}`
              : `50% CE: $${fmt(primarySellZone.ce)}${primarySellZone.inOte ? ' · Area OTE 62%–79%' : ''}${sTouchMeta}`;
        sellRows.push({
          poi: `${isSellInPlay ? '[Aktif] ' : ''}Entry [${primarySellZone.kind || 'OB'} ${primarySellZone.tf || 'M15'}] · ${primarySellZone.label}`,
          level: fmtRange(primarySellZone.low, primarySellZone.high),
          note: trigNote
        });
        if (backupSellZone) {
          const bDist = livePrice > 0 ? Math.max(0, backupSellZone.low - livePrice) : NaN;
          sellRows.push({
            poi: `Cadangan [${backupSellZone.kind} ${backupSellZone.tf}] · Pullback Dalam`,
            level: fmtRange(backupSellZone.low, backupSellZone.high),
            note: `CE $${fmt(backupSellZone.ce)}${Number.isFinite(bDist) ? ` (+$${fmt(bDist)})` : ''} — zona Supply sekunder jika zona pertama ditembus`
          });
        }
      } else {
        sellRows.push({
          poi: 'Status OB & FVG',
          level: 'Belum Ada',
          note: 'Belum ada OB/FVG valid di atas harga — tunggu zona terbentuk.'
        });
      }

      if (tpCandSell) {
        const refEntry = primarySellZone ? primarySellZone.ce : livePrice;
        const dist1 = Math.max(0, refEntry - tpCandSell.v);
        const rr1Str = Number.isFinite(sellRr) ? ` · R:R 1:${sellRr.toFixed(1)}` : '';
        sellRows.push({
          poi: tpCandSell.synthetic
            ? `TP1 Proyeksi R:R (Non-Struktural) · ${tpCandSell.name}`
            : `TP1 DOL Struktural (BEP 60%) · ${tpCandSell.name}`,
          level: '$' + fmt(tpCandSell.v),
          note: tpCandSell.synthetic
            ? `-$${fmt(dist1)} dari CE${rr1Str} — Estimasi partial BEP (bukan pool likuiditas asli)`
            : `-$${fmt(dist1)} dari CE${rr1Str} — Close 60% & geser SL ke BEP`
        });
      }
      if (tpCandSell2) {
        const refEntry = primarySellZone ? primarySellZone.ce : livePrice;
        const dist2 = Math.max(0, refEntry - tpCandSell2.v);
        const rr2Str = Number.isFinite(sellTargets.rr2) ? ` · R:R 1:${sellTargets.rr2.toFixed(1)}` : '';
        sellRows.push({
          poi: `TP2 Runner (40%) · ${tpCandSell2.name}`,
          level: '$' + fmt(tpCandSell2.v),
          note: `-$${fmt(dist2)} dari CE${rr2Str} — Magnet DOL utama`
        });
      }

      const invLevelSell = Number.isFinite(trueSlBoundary) ? trueSlBoundary : activeSellSession?.sl;
      const invNameSell = invSell?.name || activeSellSession?.slName || 'Batas Atas POI';
      if (Number.isFinite(invLevelSell)) {
        const refEntry = primarySellZone ? primarySellZone.ce : livePrice;
        const riskDist = Math.max(0, invLevelSell - refEntry);
        sellRows.push({
          poi: `Invalidasi · ${invNameSell}`,
          level: '$' + fmt(invLevelSell),
          note: `+$${fmt(riskDist)} dari CE · SL $${fmt(sellSlVal)} (${sellSlGuard.label})`
        });
      }

      sellTbody.innerHTML = sellRows.map(r =>
        `<tr><td>${esc(r.poi)}</td><td>${esc(r.level)}</td><td>${esc(r.note)}</td></tr>`
      ).join('');
    }

    const sopSell = $('sell-sop-list');
    if (sopSell) {
      const entryLo = primarySellZone?.low;
      const entryHi = primarySellZone?.high;
      const entryCe = primarySellZone?.ce;
      const slStr = Number.isFinite(sellSlVal) ? sellSlVal.toFixed(2) : (entryHi ? (entryHi + sellSlBuf).toFixed(2) : null);
      const slAnchorLabel = invSell?.name || activeSellSession?.slName || 'Batas Atas POI';
      const lotRule = sessionGuard.halfLot ? ' · <strong>Kurangi lot 50%</strong> (filter sesi/news).' : '';

      if (!Number.isFinite(entryLo) || !Number.isFinite(entryHi) || primarySellZone?.breached) {
        sopSell.innerHTML = '<li>Zona Supply tidak tersedia atau sudah tembus — <strong>jangan paksa entry Sell</strong> sampai struktur baru terbentuk.</li>';
      } else {
        sopSell.innerHTML = [
          `<li><strong>Konfirmasi Masuk:</strong> Tunggu pullback ke Supply $${fmt(entryLo)}–$${fmt(entryHi)} (50% CE $${fmt(entryCe)}) + Rejection / MSS Bearish M5${lotRule}</li>`,
          Number.isFinite(sellTpVal)
            ? `<li><strong>TP1 Cepat (BEP):</strong> $${fmt(sellTpVal)} (${esc(tpCandSell?.name || 'TP1')}) · Pasang di <strong>$${fmt(sellTpVal + 0.50)}</strong> (spread Ask). Close 60% lalu geser SL ke BEP!</li>`
            : '<li><strong>TP1 Cepat:</strong> Likuiditas internal / 1:1.8 lalu geser SL ke BEP.</li>',
          tpCandSell2
            ? `<li><strong>TP2 Runner (40%):</strong> $${fmt(tpCandSell2.v)} (${esc(tpCandSell2.name)}) · Biarkan berjalan bebas risiko.</li>`
            : '',
          `<li><strong>SL Scalper:</strong> di atas <strong>$${slStr}</strong> (${esc(slAnchorLabel)} + $${sellSlBuf.toFixed(2)} buffer wick Gold · ${esc(sellSlGuard.label)}).</li>`
        ].filter(Boolean).join('');
      }
    }

    // ══════════════════════════════════════════════
    // BUY SETUP COMPUTATION & RENDER (SCALPER PRO)
    // ══════════════════════════════════════════════
    const buyTbody = $('buy-poi-tbody');
    const buySelection = selectDualLayerPOI('BUY');
    let primaryBuyZone = buySelection.primary;
    const backupBuyZone = buySelection.backup;
    let isBuyTesting = false;
    let isBuyReacting = false;
    let isBuyTpHit = false;
    let isBuySlHit = false;

    const prevBuyBuf = Number.isFinite(activeBuySession?.slBuffer) ? activeBuySession.slBuffer : 1.50;
    if (activeBuySession && Number.isFinite(activeBuySession.sl) && livePrice < activeBuySession.sl - prevBuyBuf) {
      isBuySlHit = true;
      activeBuySession = null;
    }

    const invBuy = resolveStructuralInvalidation(primaryBuyZone, 'BUY');
    const trueBuySlBoundary = invBuy ? invBuy.v : (primaryBuyZone ? primaryBuyZone.low : NaN);
    const buySlBuf = resolveLiveSlBuffer(invBuy, primaryBuyZone);
    const rawSlBuy = Number.isFinite(trueBuySlBoundary) ? Number((trueBuySlBoundary - buySlBuf).toFixed(2)) : NaN;
    const slLevelBuyNum = primaryBuyZone
      ? computeGoldSlPrice('BUY', primaryBuyZone.low, primaryBuyZone.high, primaryBuyZone.ce, primaryBuyZone.tf || 'M15', rawSlBuy)
      : rawSlBuy;
    const buySlGuard = evaluateSlGuard(primaryBuyZone?.ce, slLevelBuyNum);
    const buyTargets = resolveScalperTargets(primaryBuyZone, slLevelBuyNum, 'BUY');
    const tpCandBuy = buyTargets.tp1;
    const tpCandBuy2 = buyTargets.tp2;
    const buyRr = buyTargets.rr1;

    if (primaryBuyZone && primaryBuyZone.breached) {
      isBuySlHit = true;
    } else if (primaryBuyZone && Number.isFinite(trueBuySlBoundary)) {
      const sameZone = activeBuySession?.zone
        && Math.abs(activeBuySession.zone.low - primaryBuyZone.low) < 0.25
        && Math.abs(activeBuySession.zone.high - primaryBuyZone.high) < 0.25;
      const inZoneNow = livePrice <= primaryBuyZone.high + 0.20 && livePrice >= primaryBuyZone.low - 0.25;
      const prevTriggered = sameZone ? Boolean(activeBuySession.triggered) : false;
      const prevTrigPrice = sameZone ? activeBuySession.triggeredPrice : null;

      activeBuySession = {
        zone: primaryBuyZone,
        sl: trueBuySlBoundary,
        slBuffer: buySlBuf,
        slLevel: Number.isFinite(slLevelBuyNum) ? slLevelBuyNum.toFixed(2) : null,
        slName: invBuy?.name || 'Batas Bawah POI',
        tp: tpCandBuy?.v,
        tpName: tpCandBuy?.name || 'BSL M15',
        triggered: Boolean(prevTriggered || inZoneNow),
        triggeredPrice: prevTrigPrice || (inZoneNow ? livePrice : null),
        lastSeenTime: Date.now()
      };
    } else if (activeBuySession && activeBuySession.zone) {
      if (Number.isFinite(activeBuySession.tp) && livePrice >= activeBuySession.tp) {
        isBuyTpHit = true;
        primaryBuyZone = activeBuySession.zone;
      } else if (Date.now() - activeBuySession.lastSeenTime < 4 * 3600 * 1000) {
        primaryBuyZone = activeBuySession.zone;
      }
    }

    if (primaryBuyZone && !primaryBuyZone.breached && activeBuySession) {
      if (livePrice <= primaryBuyZone.high + 0.20 && livePrice >= primaryBuyZone.low - 0.25) {
        isBuyTesting = true;
        activeBuySession.triggered = true;
        if (!activeBuySession.triggeredPrice) activeBuySession.triggeredPrice = livePrice;
      } else if (activeBuySession.triggered && livePrice > primaryBuyZone.high + 0.30 && (!Number.isFinite(activeBuySession.tp) || livePrice < activeBuySession.tp)) {
        isBuyReacting = true;
      }
    }
    const isBuyInPlay = isBuyTesting || isBuyReacting;

    // Render 5-Poin Scalper Verdict (BUY)
    const buyVerdict = evaluateAndRenderVerdict('BUY', {
      zone: primaryBuyZone,
      slGuard: buySlGuard,
      rr1: buyRr,
      tp1: tpCandBuy,
      isSlHit: isBuySlHit
    });

    // Cache plan for Lot Calculator, 1-Click Alarm & Chart Sync (BUY)
    const buyTpVal = tpCandBuy?.v ?? activeBuySession?.tp;
    const buySlVal = Number.isFinite(slLevelBuyNum) ? slLevelBuyNum : (Number.isFinite(activeBuySession?.sl) ? Number((activeBuySession.sl - (activeBuySession.slBuffer || 1.50)).toFixed(2)) : NaN);
    latestBuyPlan = primaryBuyZone && Number.isFinite(buySlVal)
      ? {
          entry: Number(primaryBuyZone.ce.toFixed(2)),
          sl: buySlVal,
          tp1: Number.isFinite(buyTpVal) ? Number(buyTpVal.toFixed(2)) : Number((primaryBuyZone.ce + 8).toFixed(2)),
          tp2: tpCandBuy2 ? Number(tpCandBuy2.v.toFixed(2)) : undefined
        }
      : null;
    latestBuyOverlay = primaryBuyZone && !primaryBuyZone.breached
      ? {
          scalper: true,
          side: 'BUY',
          tf: primaryBuyZone.tf || 'M15',
          kind: primaryBuyZone.kind || 'OB',
          label: primaryBuyZone.label || '+OB',
          skip: Boolean(buyVerdict?.skip),
          alarmPrice: Number(primaryBuyZone.high.toFixed(2)),
          area: {
            low: Number(primaryBuyZone.low.toFixed(2)),
            high: Number(primaryBuyZone.high.toFixed(2)),
            ce: Number(primaryBuyZone.ce.toFixed(2))
          },
          tp1: Number.isFinite(buyTpVal) ? Number(buyTpVal.toFixed(2)) : NaN,
          tp2: tpCandBuy2 ? Number(tpCandBuy2.v.toFixed(2)) : NaN,
          sl: buySlVal
        }
      : null;
    backupBuyOverlay = backupBuyZone && !backupBuyZone.breached
      ? {
          scalper: true,
          side: 'BUY',
          tf: backupBuyZone.tf || 'M5',
          kind: backupBuyZone.kind || 'FVG',
          label: backupBuyZone.label || backupBuyZone.kind || 'POI',
          skip: Boolean(buyVerdict?.skip),
          alarmPrice: Number(backupBuyZone.high.toFixed(2)),
          area: {
            low: Number(backupBuyZone.low.toFixed(2)),
            high: Number(backupBuyZone.high.toFixed(2)),
            ce: Number(backupBuyZone.ce.toFixed(2))
          },
          tp1: Number.isFinite(buyTpVal) ? Number(buyTpVal.toFixed(2)) : NaN,
          tp2: tpCandBuy2 ? Number(tpCandBuy2.v.toFixed(2)) : NaN,
          sl: buySlVal
        }
      : null;

    // Update 3 Structured Level Tiles (BUY)
    const buyEntryValEl = $('buy-entry-val');
    const buyEntrySubEl = $('buy-entry-sub');
    if (buyEntryValEl) buyEntryValEl.textContent = primaryBuyZone ? fmtRange(primaryBuyZone.low, primaryBuyZone.high) : 'Belum Ada';
    if (buyEntrySubEl) {
      const tfTag = primaryBuyZone?.tf ? ` ${primaryBuyZone.tf}` : '';
      const oteTag = primaryBuyZone?.inOte ? ' · OTE' : '';
      const bTouchCnt = Number(primaryBuyZone?.touchCount) || 0;
      const touchTag = primaryBuyZone
        ? (bTouchCnt > 0
            ? ` · Sentuh ${bTouchCnt}×${primaryBuyZone.ceTouched ? ' CE' : ''}`
            : (primaryBuyZone.fresh ? ' · Fresh' : ''))
        : '';
      const distTag = (primaryBuyZone && Number.isFinite(buyVerdict.zoneDist) && buyVerdict.zoneDist >= 0.5)
        ? ` · -$${buyVerdict.zoneDist.toFixed(1)}`
        : (primaryBuyZone && Number.isFinite(buyVerdict.zoneDist) ? ' · Di Zona' : '');
      buyEntrySubEl.textContent = primaryBuyZone
        ? `${primaryBuyZone.kind || 'OB'}${tfTag}${touchTag}${oteTag} · CE $${fmt(primaryBuyZone.ce)}${distTag}`
        : 'Tunggu Demand/OB di bawah harga';
    }
    const buyTpValEl = $('buy-tp-val');
    const buyTpSubEl = $('buy-tp-sub');
    if (buyTpValEl) buyTpValEl.textContent = Number.isFinite(buyTpVal) ? `$${fmt(buyTpVal)}` : '—';
    if (buyTpSubEl) {
      const subText = formatTp1Subtitle(tpCandBuy, tpCandBuy2, buyRr);
      buyTpSubEl.textContent = subText || 'Likuiditas BSL atas';
    }
    const buySlValEl = $('buy-sl-val');
    const buySlSubEl = $('buy-sl-sub');
    if (buySlValEl) buySlValEl.textContent = Number.isFinite(buySlVal) ? `$${fmt(buySlVal)}` : '—';
    if (buySlSubEl) {
      const slBase = Number.isFinite(trueBuySlBoundary) ? trueBuySlBoundary : activeBuySession?.sl;
      buySlSubEl.textContent = Number.isFinite(slBase)
        ? `${buySlGuard.label} · ${invBuy?.name || 'POI'}`
        : 'Batas invalidasi SSL';
    }

    if (buyBadgeEl) {
      if (primaryBuyZone?.breached || isBuySlHit) {
        buyBadgeEl.className = 'poi-badge poi-badge--buy';
        buyBadgeEl.textContent = 'Zona Tembus / Invalid · Jangan Tangkap Pisau Jatuh';
      } else if (isBuyTesting) {
        buyBadgeEl.className = 'poi-badge poi-badge--buy poi-badge--active';
        buyBadgeEl.textContent = `Menguji Zona · Wajib Tunggu MSS M5 ($${fmt(livePrice)})`;
      } else if (isBuyReacting) {
        buyBadgeEl.className = 'poi-badge poi-badge--buy poi-badge--active';
        buyBadgeEl.textContent = `Zona Teruji · Reaksi Aktif dari $${fmt(activeBuySession?.triggeredPrice || primaryBuyZone.high)}`;
      } else if (isBuyTpHit) {
        buyBadgeEl.className = 'poi-badge poi-badge--buy poi-badge--hit';
        buyBadgeEl.textContent = 'Target TP1 Tercapai · Amankan BEP / Runner';
      }
    }

    if (buyTbody) {
      const buyRows = [];
      if (primaryBuyZone) {
        const bTouchCnt = Number(primaryBuyZone.touchCount) || 0;
        const bTouchMeta = bTouchCnt > 0
          ? ` · Disentuh ${bTouchCnt}×${primaryBuyZone.ceTouched ? ' (50% CE)' : ''}${primaryBuyZone.lastTouchTime ? ` @ ${formatWitaClock(primaryBuyZone.lastTouchTime * 1000)}` : ''}`
          : ' · Zona Fresh (belum tersentuh)';
        const trigNote = primaryBuyZone.breached
          ? `Harga ($${fmt(livePrice)}) menembus bawah zona — dilarang Buy`
          : isBuyTesting
            ? `Sedang diuji ($${fmt(livePrice)}) — wajib tunggu candle rejection/MSS M5${bTouchMeta}`
            : isBuyReacting
              ? `Reaksi dari $${fmt(activeBuySession?.triggeredPrice || primaryBuyZone.high)} · Bergerak +$${fmt(Math.max(0, livePrice - (activeBuySession?.triggeredPrice || primaryBuyZone.high)))}${bTouchMeta}`
              : `50% CE: $${fmt(primaryBuyZone.ce)}${primaryBuyZone.inOte ? ' · Area OTE 62%–79%' : ''}${bTouchMeta}`;
        buyRows.push({
          poi: `${isBuyInPlay ? '[Aktif] ' : ''}Entry [${primaryBuyZone.kind || 'OB'} ${primaryBuyZone.tf || 'M15'}] · ${primaryBuyZone.label}`,
          level: fmtRange(primaryBuyZone.low, primaryBuyZone.high),
          note: trigNote
        });
        if (backupBuyZone) {
          const bDist = livePrice > 0 ? Math.max(0, livePrice - backupBuyZone.high) : NaN;
          buyRows.push({
            poi: `Cadangan [${backupBuyZone.kind} ${backupBuyZone.tf}] · Pullback Dalam`,
            level: fmtRange(backupBuyZone.low, backupBuyZone.high),
            note: `CE $${fmt(backupBuyZone.ce)}${Number.isFinite(bDist) ? ` (-$${fmt(bDist)})` : ''} — zona Demand sekunder jika retest lebih dalam`
          });
        }
      } else {
        buyRows.push({
          poi: 'Status OB & FVG',
          level: 'Belum Ada',
          note: 'Belum ada OB/FVG valid di bawah harga — tunggu zona terbentuk.'
        });
      }

      if (tpCandBuy) {
        const refEntry = primaryBuyZone ? primaryBuyZone.ce : livePrice;
        const dist1 = Math.max(0, tpCandBuy.v - refEntry);
        const rr1Str = Number.isFinite(buyRr) ? ` · R:R 1:${buyRr.toFixed(1)}` : '';
        buyRows.push({
          poi: tpCandBuy.synthetic
            ? `TP1 Proyeksi R:R (Non-Struktural) · ${tpCandBuy.name}`
            : `TP1 DOL Struktural (BEP 60%) · ${tpCandBuy.name}`,
          level: '$' + fmt(tpCandBuy.v),
          note: tpCandBuy.synthetic
            ? `+$${fmt(dist1)} dari CE${rr1Str} — Estimasi partial BEP (bukan pool likuiditas asli)`
            : `+$${fmt(dist1)} dari CE${rr1Str} — Close 60% & geser SL ke BEP`
        });
      }
      if (tpCandBuy2) {
        const refEntry = primaryBuyZone ? primaryBuyZone.ce : livePrice;
        const dist2 = Math.max(0, tpCandBuy2.v - refEntry);
        const rr2Str = Number.isFinite(buyTargets.rr2) ? ` · R:R 1:${buyTargets.rr2.toFixed(1)}` : '';
        buyRows.push({
          poi: `TP2 Runner (40%) · ${tpCandBuy2.name}`,
          level: '$' + fmt(tpCandBuy2.v),
          note: `+$${fmt(dist2)} dari CE${rr2Str} — Magnet DOL utama`
        });
      }

      const invLevelBuy = Number.isFinite(trueBuySlBoundary) ? trueBuySlBoundary : activeBuySession?.sl;
      const invNameBuy = invBuy?.name || activeBuySession?.slName || 'Batas Bawah POI';
      if (Number.isFinite(invLevelBuy)) {
        const refEntry = primaryBuyZone ? primaryBuyZone.ce : livePrice;
        const riskDist = Math.max(0, refEntry - invLevelBuy);
        buyRows.push({
          poi: `Invalidasi · ${invNameBuy}`,
          level: '$' + fmt(invLevelBuy),
          note: `-$${fmt(riskDist)} dari CE · SL $${fmt(buySlVal)} (${buySlGuard.label})`
        });
      }

      buyTbody.innerHTML = buyRows.map(r =>
        `<tr><td>${esc(r.poi)}</td><td>${esc(r.level)}</td><td>${esc(r.note)}</td></tr>`
      ).join('');
    }

    const sopBuy = $('buy-sop-list');
    if (sopBuy) {
      const entryLo = primaryBuyZone?.low;
      const entryHi = primaryBuyZone?.high;
      const entryCe = primaryBuyZone?.ce;
      const limitOrder = Number.isFinite(entryLo) ? (entryLo + 0.40).toFixed(2) : null;
      const slStr = Number.isFinite(buySlVal) ? buySlVal.toFixed(2) : (Number.isFinite(entryLo) ? (entryLo - buySlBuf).toFixed(2) : null);
      const slAnchorLabel = invBuy?.name || activeBuySession?.slName || 'Batas Bawah POI';
      const lotRule = sessionGuard.halfLot ? ' · <strong>Kurangi lot 50%</strong> (filter sesi/news).' : '';

      if (!Number.isFinite(entryLo) || !Number.isFinite(entryHi) || primaryBuyZone?.breached) {
        sopBuy.innerHTML = '<li>Zona Demand tidak tersedia atau sudah jebol — <strong>jangan menangkap pisau jatuh</strong>, tunggu MSS Bullish M5 atau zona baru.</li>';
      } else {
        sopBuy.innerHTML = [
          `<li><strong>Konfirmasi Masuk:</strong> Tunggu retest Demand $${fmt(entryLo)}–$${fmt(entryHi)} (50% CE $${fmt(entryCe)}) + Rejection / MSS Bullish M5${lotRule}</li>`,
          `<li><strong>Pending Referensi (Ask):</strong> Buy Limit di <strong>$${limitOrder}</strong> (+$0.40 spread), hanya jika searah tren.</li>`,
          Number.isFinite(buyTpVal)
            ? `<li><strong>TP1 Cepat (BEP):</strong> $${fmt(buyTpVal)} (${esc(tpCandBuy?.name || 'TP1')}) · Close 60% lalu geser SL ke BEP!</li>`
            : '<li><strong>TP1 Cepat:</strong> Likuiditas internal / 1:1.8 lalu geser SL ke BEP.</li>',
          tpCandBuy2
            ? `<li><strong>TP2 Runner (40%):</strong> $${fmt(tpCandBuy2.v)} (${esc(tpCandBuy2.name)}) · Biarkan berjalan bebas risiko.</li>`
            : '',
          `<li><strong>SL Scalper:</strong> di bawah <strong>$${slStr}</strong> (${esc(slAnchorLabel)} - $${buySlBuf.toFixed(2)} buffer wick Gold · ${esc(buySlGuard.label)}).</li>`
        ].filter(Boolean).join('');
      }
    }

    // ══════════════════════════════════════════════
    // TREND-FIRST TAB PRIORITY & SCENARIO LABELS (ANTI-FALLING KNIFE)
    // ══════════════════════════════════════════════
    const sellLabelZone = primarySellZone || (liqAbove[0] ? { low: liqAbove[0].v, high: liqAbove[0].v } : null);
    const buyLabelZone  = primaryBuyZone  || (liqBelow[0] ? { low: liqBelow[0].v, high: liqBelow[0].v } : null);

    if (livePrice > 0) applyHeroPrice(livePrice);

    const zoneLabelEl = $('scenario-zone-label');
    if (Number.isFinite(rHigh) && Number.isFinite(rLow) && rHigh > rLow && livePrice > 0) {
      if (zoneLabelEl) {
        if (rawPct > 75)        zoneLabelEl.textContent = `Extreme Premium ${pct}%`;
        else if (rawPct > 52.5) zoneLabelEl.textContent = `Premium ${pct}%`;
        else if (rawPct < 25)   zoneLabelEl.textContent = `Extreme Discount ${pct}%`;
        else if (rawPct < 47.5) zoneLabelEl.textContent = `Discount ${pct}%`;
        else                    zoneLabelEl.textContent = `EQ ${pct}%`;
      }
    }

    // Update Segmented Tab Dots & Trend-First Priority Tags
    const buyDot = $('tab-buy-dot');
    const sellDot = $('tab-sell-dot');
    if (buyDot) buyDot.classList.toggle('is-in-play', isBuyInPlay);
    if (sellDot) sellDot.classList.toggle('is-in-play', isSellInPlay);

    const buyTag = $('tab-buy-tag');
    const sellTag = $('tab-sell-tag');
    // Trend-First: Saat M15 (atau H1+M15) BEAR, SELL selalu Prioritas kecuali BUY punya MSS M5 terkonfirmasi & tidak SKIP
    let sellPriority = false;
    let buyPriority = false;
    if (m15Dir === -1) {
      if (isDiscount && m5Dir === 1 && !buyVerdict.skip) buyPriority = true;
      else sellPriority = true;
    } else if (m15Dir === 1) {
      if (isPremium && m5Dir === -1 && !sellVerdict.skip) sellPriority = true;
      else buyPriority = true;
    } else {
      buyPriority = isDiscount || (!isPremium && h1Dir === 1);
      sellPriority = isPremium || (!isDiscount && h1Dir === -1);
    }

    if (buyTag) buyTag.hidden = !buyPriority;
    if (sellTag) sellTag.hidden = !sellPriority;

    // Auto-select priority tab ONLY if user hasn't manually switched
    if (!userLockedTab) {
      if (sellPriority && !buyPriority) setActivePoiTab('SELL', false);
      else if (buyPriority && !sellPriority) setActivePoiTab('BUY', false);
    }

    // Zone-ban & Counter-trend warnings inside each tab panel
    const sellWarn = $('poi-sell-zone-ban');
    if (sellWarn) {
      if (isDiscount) {
        if (isSellReacting) {
          sellWarn.className = 'poi-warning-box';
          sellWarn.innerHTML = `<strong>Reaksi Sell Aktif:</strong> Harga telah masuk area Diskon (${pct}%) menuju target SSL. Jangan tambah posisi Sell baru di bawah; amankan SL ke BEP.`;
          sellWarn.hidden = false;
        } else {
          sellWarn.className = 'poi-warning-box is-danger';
          sellWarn.innerHTML = `<strong>Tunggu Pullback — Jangan Kejar Sell di Dasar (${pct}%):</strong> Tren memang Bearish, tetapi entry Sell yang sehat hanya setelah pullback ke Supply (${sellLabelZone ? fmtRange(sellLabelZone.low, sellLabelZone.high) : 'Supply atas'}) + Rejection M5.`;
          sellWarn.hidden = false;
        }
      } else {
        sellWarn.hidden = true;
      }
    }

    const buyWarn = $('poi-buy-zone-ban');
    if (buyWarn) {
      if (h1Dir === -1 && m15Dir === -1 && m5Dir !== 1) {
        buyWarn.className = 'poi-warning-box is-danger';
        buyWarn.innerHTML = `<strong>Peringatan Counter-Trend (H1 + M15 Bearish):</strong> Jangan menangkap pisau jatuh hanya karena harga di zona Diskon (${pct}%). Buy scalping hanya layak setelah muncul <strong>Sweep + MSS Bullish M5</strong>.`;
        buyWarn.hidden = false;
      } else if (isPremium) {
        if (isBuyReacting) {
          buyWarn.className = 'poi-warning-box is-active-buy';
          buyWarn.innerHTML = `<strong>Reaksi Buy Aktif:</strong> Harga telah masuk area Premium (${pct}%) menuju target BSL. Hindari tambah posisi Buy di pucuk; kunci profit secara bertahap.`;
          buyWarn.hidden = false;
        } else {
          buyWarn.className = 'poi-warning-box is-danger';
          const backupTxt = backupBuyZone ? ` · Cadangan ${backupBuyZone.tf}: ${fmtRange(backupBuyZone.low, backupBuyZone.high)}` : '';
          buyWarn.innerHTML = `<strong>Dilarang FOMO Buy di Pucuk:</strong> Posisi berada di Zona Premium Makro (${pct}%). Tunggu retest ke POI terdekat (${buyLabelZone ? fmtRange(buyLabelZone.low, buyLabelZone.high) : 'Demand bawah'}${primaryBuyZone?.tf ? ` · ${primaryBuyZone.tf}` : ''})${backupTxt}.`;
          buyWarn.hidden = false;
        }
      } else {
        buyWarn.hidden = true;
      }
    }

    // Scenario Path Labels
    const sellZoneEl = $('sell-zone-label');
    if (sellZoneEl) {
      const ceStr = primarySellZone?.ce ? ` (50% CE $${fmt(primarySellZone.ce)})` : '';
      sellZoneEl.textContent = sellLabelZone
        ? (Math.abs(sellLabelZone.high - sellLabelZone.low) < 0.01 ? `$${fmt(sellLabelZone.high)}` : `$${fmt(sellLabelZone.low)}–$${fmt(sellLabelZone.high)}${ceStr}`)
        : 'zona supply (menunggu validasi)';
    }

    const buyZoneEl = $('buy-zone-label');
    if (buyZoneEl) {
      const ceStr = primaryBuyZone?.ce ? ` (50% CE $${fmt(primaryBuyZone.ce)})` : '';
      buyZoneEl.textContent = buyLabelZone
        ? (Math.abs(buyLabelZone.high - buyLabelZone.low) < 0.01 ? `$${fmt(buyLabelZone.low)}` : `$${fmt(buyLabelZone.low)}–$${fmt(buyLabelZone.high)}${ceStr}`)
        : 'zona demand (menunggu validasi)';
    }

    // Sinkronkan Single Source of Truth POI ke Chart Gold, Hero Distance, Tombol Alarm 1-Klik & Riwayat Reaksi POI
    publishActiveScalperPlan();
    syncEntryAlarmButtons();
    syncMappingHistoryFromContext(ctx, ngM15, ngM5, livePrice);

    // Publish read-only Cockpit Snapshot untuk AMY Live Chat & Voice agar 100% sinkron dengan layar Mapping
    try {
      const packPoi = (z, backup, verdict, slVal, tp1Val, tp1Obj, tp2Obj, rr1, state) => ({
        zone: z ? {
          low: Number(z.low.toFixed(2)),
          high: Number(z.high.toFixed(2)),
          ce: Number(z.ce.toFixed(2)),
          tf: z.tf || 'M15',
          kind: z.kind || 'OB',
          label: z.label || '',
          touchCount: Number(z.touchCount) || 0,
          ceTouched: Boolean(z.ceTouched),
          fresh: Boolean(z.fresh),
          breached: Boolean(z.breached),
          inOte: Boolean(z.inOte)
        } : null,
        backup: backup ? {
          low: Number(backup.low.toFixed(2)),
          high: Number(backup.high.toFixed(2)),
          ce: Number(backup.ce.toFixed(2)),
          tf: backup.tf || 'M15',
          kind: backup.kind || 'OB'
        } : null,
        verdict: verdict ? {
          grade: verdict.grade || 'WAIT',
          score: Number(verdict.score || 0),
          skip: Boolean(verdict.skip)
        } : null,
        sl: Number.isFinite(slVal) ? Number(slVal.toFixed(2)) : null,
        tp1: Number.isFinite(tp1Val) ? Number(tp1Val.toFixed(2)) : null,
        tp1Name: tp1Obj?.name || null,
        tp2: tp2Obj && Number.isFinite(tp2Obj.v) ? Number(tp2Obj.v.toFixed(2)) : null,
        tp2Name: tp2Obj?.name || null,
        rr1: Number.isFinite(rr1) ? Number(rr1.toFixed(2)) : null,
        state
      });
      const dirLabel = d => (d === 1 ? 'BULLISH' : d === -1 ? 'BEARISH' : 'NETRAL');
      const cockpitSnapshot = {
        version: 1,
        updatedAt: Date.now(),
        livePrice: Number.isFinite(livePrice) && livePrice > 0 ? Number(livePrice.toFixed(2)) : null,
        prioritySide: sellPriority && !buyPriority ? 'SELL' : (buyPriority && !sellPriority ? 'BUY' : 'NETRAL'),
        dealingRange: (Number.isFinite(rLow) && Number.isFinite(rHigh) && rHigh > rLow)
          ? {
              low: Number(rLow.toFixed(2)),
              high: Number(rHigh.toFixed(2)),
              eq: Number(((rLow + rHigh) / 2).toFixed(2)),
              pct: Number(pct)
            }
          : null,
        bias: { h1: dirLabel(h1Dir), m15: dirLabel(m15Dir), m5: dirLabel(m5Dir) },
        sessionGuard: sessionGuard ? { label: sessionGuard.label || '', tone: sessionGuard.tone || '', halfLot: Boolean(sessionGuard.halfLot) } : null,
        newsStatus: newsStatus || 'SAFE',
        weekendClosed: Boolean(ctx?.marketClosed || ctx?.weekendClosed),
        sell: packPoi(
          primarySellZone, backupSellZone, sellVerdict, sellSlVal, sellTpVal, tpCandSell, tpCandSell2, sellRr,
          primarySellZone?.breached || isSellSlHit ? 'INVALID' : isSellTpHit ? 'TP_HIT' : isSellReacting ? 'REACTING' : isSellTesting ? 'TESTING' : 'STANDBY'
        ),
        buy: packPoi(
          primaryBuyZone, backupBuyZone, buyVerdict, buySlVal, buyTpVal, tpCandBuy, tpCandBuy2, buyRr,
          primaryBuyZone?.breached || isBuySlHit ? 'INVALID' : isBuyTpHit ? 'TP_HIT' : isBuyReacting ? 'REACTING' : isBuyTesting ? 'TESTING' : 'STANDBY'
        )
      };
      window.AmyMappingLiveCockpit = cockpitSnapshot;
      localStorage.setItem('amyfx.mapping.cockpit_snapshot.v1', JSON.stringify(cockpitSnapshot));
    } catch (_) {}
  }

  /* ── Master Update ── */
  function updateAll(ctx) {
    if (!ctx) return;
    updateHeroCard(ctx);
    updateDealingRange(ctx);
    renderPOICards(ctx);
    const lastEl = $('dashboard-last-update');
    if (lastEl) {
      lastEl.textContent = 'Terakhir diperbarui · ' + getWITA();
    }
  }

  /* ── Listeners ── */
  window.addEventListener('amyfx:market-context', event => {
    const ctx = event?.detail;
    if (ctx) updateAll(ctx);
  });

  window.addEventListener('amyfx:indicators-updated', () => {
    if (window.amyfxLastContext) updateAll(window.amyfxLastContext);
  });

  window.addEventListener('amyfx:price-alerts-updated', () => {
    syncEntryAlarmButtons();
  });

  window.addEventListener('amyfx:twelvedata-price', event => {
    const p = Number(event?.detail?.price);
    if (Number.isFinite(p) && p > 0) {
      applyHeroPrice(p);
      if (window.amyfxLastContext) updateDealingRange(window.amyfxLastContext);
      tickMappingHistory(p);
    }
  });

  window.addEventListener('amyfx:live-price-display', event => {
    const p = Number(event?.detail?.price);
    if (Number.isFinite(p) && p > 0) {
      applyHeroPrice(p);
      if (window.amyfxLastContext) updateDealingRange(window.amyfxLastContext);
      tickMappingHistory(p);
    }
  });

  /* ── Init ── */
  function init() {
    bindCockpitInteractions();
    setActivePoiTab(activePoiTab, false);
    startClock();
    syncEntryAlarmButtons();
    renderMappingHistory();
    if (window.amyfxLastContext) {
      updateAll(window.amyfxLastContext);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
