/* Amy FX Pro — Pure Shared Trader Insights, Daily Loss Guard, Session Plan & Replay Helpers (UMD) */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.AmyTraderInsights = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const DAY_MS = 86400000;
  const GUARD_STORAGE_KEY = 'amy_daily_loss_guard_v1';
  const REPLAY_BOOKMARKS_KEY = 'amy_replay_bookmarks_v1';
  const ACADEMY_BOOKMARKS_KEY = 'amy_academy_bookmarks_v1';
  const MEDIA_WATCHED_KEY = 'amy_media_watched_v1';

  const MISTAKE_TAGS = Object.freeze([
    { id: 'Sesuai Plan', label: 'Sesuai Plan', tone: 'good' },
    { id: 'FOMO', label: 'FOMO', tone: 'leak' },
    { id: 'Entry Kepagian', label: 'Entry Kepagian', tone: 'leak' },
    { id: 'Geser SL', label: 'Geser SL', tone: 'leak' },
    { id: 'Overtrade', label: 'Overtrade', tone: 'leak' },
    { id: 'Revenge Trade', label: 'Revenge', tone: 'leak' }
  ]);

  const DEFAULT_GUARD_CONFIG = Object.freeze({
    enabled: true,
    maxDailySl: 2,
    maxDailyLossPct: 3
  });

  const MONTH_NAMES_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function clampNumber(val, min, max, fallback) {
    const n = Number(val);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function normalizeGuardConfig(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      enabled: src.enabled !== false,
      maxDailySl: Math.round(clampNumber(src.maxDailySl, 1, 10, DEFAULT_GUARD_CONFIG.maxDailySl)),
      maxDailyLossPct: Number(clampNumber(src.maxDailyLossPct, 0.5, 25, DEFAULT_GUARD_CONFIG.maxDailyLossPct).toFixed(1))
    };
  }

  function readDailyGuardConfig(storage) {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return normalizeGuardConfig(null);
    try {
      const raw = store.getItem(GUARD_STORAGE_KEY);
      return normalizeGuardConfig(raw ? JSON.parse(raw) : null);
    } catch (_) {
      return normalizeGuardConfig(null);
    }
  }

  function saveDailyGuardConfig(cfg, storage) {
    const normalized = normalizeGuardConfig(cfg);
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (store) {
      try { store.setItem(GUARD_STORAGE_KEY, JSON.stringify(normalized)); } catch (_) {}
    }
    return normalized;
  }

  function toWitaDateKey(ms) {
    const n = Number(ms);
    if (!Number.isFinite(n) || n <= 0) return '';
    // WITA = UTC+8
    const d = new Date(n + 8 * 3600000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function extractEntryDateKey(entry) {
    if (!entry || typeof entry !== 'object') return '';
    const dateField = String(entry.date || '').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(dateField)) return dateField.slice(0, 10);
    const tsCandidates = [entry.exitTime, entry.actualEntryTime, entry.entryTime, entry.createdAt, entry.timestamp];
    for (const c of tsCandidates) {
      if (!c) continue;
      if (typeof c === 'number' && Number.isFinite(c)) {
        return toWitaDateKey(c > 1e11 ? c : c * 1000);
      }
      const parsed = Date.parse(String(c));
      if (Number.isFinite(parsed)) return toWitaDateKey(parsed);
    }
    return '';
  }

  function extractEntryTimestamp(entry) {
    if (!entry || typeof entry !== 'object') return 0;
    const candidates = [entry.exitTime, entry.actualEntryTime, entry.entryTime, entry.createdAt, entry.updatedAt, entry.date];
    for (const c of candidates) {
      if (!c) continue;
      if (typeof c === 'number' && Number.isFinite(c)) return c > 1e11 ? c : c * 1000;
      const raw = String(c).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const ms = Date.parse(raw + 'T12:00:00Z');
        if (Number.isFinite(ms)) return ms;
      } else {
        const ms = Date.parse(raw);
        if (Number.isFinite(ms)) return ms;
      }
    }
    return 0;
  }

  function normalizeOutcome(entry) {
    const raw = String(entry?.result ?? entry?.outcome ?? '').trim().toUpperCase();
    if (raw === 'WIN' || raw === 'PROFIT' || raw === 'TP') return 'Win';
    if (raw === 'LOSS' || raw === 'RUGI' || raw === 'SL') return 'Loss';
    if (raw === 'BE' || raw === 'BREAKEVEN' || raw === 'BREAK EVEN') return 'BE';
    return null;
  }

  function extractEntryMoney(entry) {
    if (entry?.pnlMoney !== undefined && entry?.pnlMoney !== null && entry?.pnlMoney !== '') {
      const n = Number(entry.pnlMoney);
      if (Number.isFinite(n)) return n;
    }
    const p = Number(entry?.profit) || 0;
    const l = Math.abs(Number(entry?.loss) || 0);
    return p - l;
  }

  function extractEntryR(entry, defaultRiskMoney) {
    const outcome = normalizeOutcome(entry);
    if (outcome === 'BE') return 0;
    const rr = Number(entry?.riskReward);
    if (Number.isFinite(rr) && rr > 0) {
      return outcome === 'Win' ? rr : -1;
    }
    const money = extractEntryMoney(entry);
    if (money !== 0 && Number(defaultRiskMoney) > 0) {
      return money / Number(defaultRiskMoney);
    }
    if (outcome === 'Win') return 2;
    if (outcome === 'Loss') return -1;
    return 0;
  }

  function evaluateDailyLossGuard(entries, options = {}) {
    const cfg = normalizeGuardConfig(options.config || DEFAULT_GUARD_CONFIG);
    const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
    const todayKey = options.todayKey || toWitaDateKey(nowMs);
    const balanceUsd = Number(options.balanceUsd) > 0 ? Number(options.balanceUsd) : 0;

    const list = Array.isArray(entries) ? entries : [];
    const todayClosed = list
      .filter(e => normalizeOutcome(e) !== null && extractEntryDateKey(e) === todayKey)
      .sort((a, b) => extractEntryTimestamp(a) - extractEntryTimestamp(b));

    let lossCount = 0;
    let winCount = 0;
    let currentLossStreak = 0;
    let maxConsecutiveSl = 0;
    let todayNetMoney = 0;

    for (const item of todayClosed) {
      const res = normalizeOutcome(item);
      todayNetMoney += extractEntryMoney(item);
      if (res === 'Loss') {
        lossCount += 1;
        currentLossStreak += 1;
        if (currentLossStreak > maxConsecutiveSl) maxConsecutiveSl = currentLossStreak;
      } else if (res === 'Win') {
        winCount += 1;
        currentLossStreak = 0;
      }
    }

    const todayLossUsd = todayNetMoney < 0 ? Math.abs(todayNetMoney) : 0;
    const todayLossPct = balanceUsd > 0 ? Number(((todayLossUsd / balanceUsd) * 100).toFixed(2)) : 0;

    if (!cfg.enabled) {
      return {
        status: 'OFF',
        todayKey,
        closedCount: todayClosed.length,
        winCount,
        lossCount,
        consecutiveSl: maxConsecutiveSl,
        todayNetMoney,
        todayLossPct,
        headline: 'Penjaga Risiko Nonaktif',
        detail: '',
        config: cfg
      };
    }

    const hitSlLimit = lossCount >= cfg.maxDailySl;
    const hitPctLimit = balanceUsd > 0 && todayLossPct >= cfg.maxDailyLossPct;

    if (hitSlLimit || hitPctLimit) {
      const reasons = [];
      if (hitSlLimit) reasons.push(`${lossCount}/${cfg.maxDailySl} SL harian`);
      if (hitPctLimit) reasons.push(`-${todayLossPct}% (batas -${cfg.maxDailyLossPct}%)`);
      return {
        status: 'LOCKED',
        todayKey,
        closedCount: todayClosed.length,
        winCount,
        lossCount,
        consecutiveSl: maxConsecutiveSl,
        todayNetMoney,
        todayLossPct,
        headline: 'Batas risiko harian tercapai — stop trading hari ini',
        detail: `${reasons.join(' · ')}. Tutup chart agar terhindar dari revenge trade.`,
        config: cfg
      };
    }

    const nearSl = cfg.maxDailySl > 1 && lossCount === cfg.maxDailySl - 1;
    const nearPct = balanceUsd > 0 && todayLossPct >= cfg.maxDailyLossPct * 0.7;

    if (nearSl || nearPct) {
      const remSl = Math.max(0, cfg.maxDailySl - lossCount);
      return {
        status: 'WARNING',
        todayKey,
        closedCount: todayClosed.length,
        winCount,
        lossCount,
        consecutiveSl: maxConsecutiveSl,
        todayNetMoney,
        todayLossPct,
        headline: `Sisa toleransi ${remSl} SL lagi hari ini`,
        detail: balanceUsd > 0 && todayLossPct > 0
          ? `Drawdown hari ini -${todayLossPct}% dari batas -${cfg.maxDailyLossPct}%. Ambil setup A+ saja.`
          : 'Selektif penuh — tunggu konfirmasi valid di area POI.',
        config: cfg
      };
    }

    return {
      status: 'SAFE',
      todayKey,
      closedCount: todayClosed.length,
      winCount,
      lossCount,
      consecutiveSl: maxConsecutiveSl,
      todayNetMoney,
      todayLossPct,
      headline: `Batas Harian Aman (${lossCount}/${cfg.maxDailySl} SL)`,
      detail: `Maksimal ${cfg.maxDailySl} SL atau -${cfg.maxDailyLossPct}% modal per hari.`,
      config: cfg
    };
  }

  function extractExecutionTags(entry) {
    const tags = [];
    const pushTag = (tag) => {
      if (tag && !tags.includes(tag)) tags.push(tag);
    };

    const explicit = String(entry?.executionTag || entry?.mistakeTag || '').trim();
    const mistakesRaw = [entry?.mistakes, entry?.mistake].filter(Boolean).join(' ').trim();
    const emotionRaw = String(entry?.emotion || '').trim();
    const leakText = [explicit, mistakesRaw, emotionRaw].filter(Boolean).join(' ').trim();

    if (leakText) {
      if (/\bfomo\b|kejar/i.test(leakText)) pushTag('FOMO');
      if (/kepagian|prematur|terlalu cepat|belum konfirmasi/i.test(leakText)) pushTag('Entry Kepagian');
      if (/geser\s*sl|lebar.*sl|tanpa\s*sl/i.test(leakText)) pushTag('Geser SL');
      if (/over\s*trad/i.test(leakText)) pushTag('Overtrade');
      if (/revenge|balas dendam/i.test(leakText)) pushTag('Revenge Trade');
    }

    if (explicit && explicit !== 'Sesuai Plan' && !tags.length) {
      pushTag(explicit);
    }

    if (!tags.length) {
      const positiveText = [explicit, mistakesRaw, emotionRaw].filter(Boolean).join(' ').trim();
      const hasNegatedDiscipline = /(?:tidak|kurang|bukan|tanpa|gagal)\s+(?:sesuai\s*plan|disiplin|valid|tenang)/i.test(positiveText);
      if (positiveText && !hasNegatedDiscipline && /sesuai\s*plan|disiplin|valid|tenang/i.test(positiveText)) {
        pushTag('Sesuai Plan');
      }
    }

    return tags;
  }

  function extractExecutionTag(entry) {
    return extractExecutionTags(entry)[0] || '';
  }

  function computeWeeklyReview(entries, options = {}) {
    const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
    const days = clampNumber(options.days, 1, 90, 7);
    const cutoff = nowMs - days * DAY_MS;
    const defaultRiskMoney = Number(options.defaultRiskMoney) > 0 ? Number(options.defaultRiskMoney) : 0;

    const list = Array.isArray(entries) ? entries : [];
    const recent = list.filter(e => {
      if (normalizeOutcome(e) === null) return false;
      const ts = extractEntryTimestamp(e);
      return ts >= cutoff && ts <= nowMs + DAY_MS;
    });

    if (!recent.length) {
      return {
        empty: true,
        days,
        tradeCount: 0,
        wins: 0,
        losses: 0,
        breakevens: 0,
        winRate: 0,
        netMoney: 0,
        netR: 0,
        bestTrade: null,
        bestSession: null,
        costliestLeak: null,
        mistakeSummary: []
      };
    }

    let wins = 0;
    let losses = 0;
    let breakevens = 0;
    let netMoney = 0;
    let netR = 0;
    let bestTrade = null;
    const sessionMap = new Map();
    const tagMap = new Map();

    for (const item of recent) {
      const outcome = normalizeOutcome(item);
      const money = extractEntryMoney(item);
      const rVal = extractEntryR(item, defaultRiskMoney);
      netMoney += money;
      netR += rVal;
      if (outcome === 'Win') wins += 1;
      else if (outcome === 'Loss') losses += 1;
      else breakevens += 1;

      const score = money !== 0 ? money : rVal;
      if (!bestTrade || score > bestTrade.score) {
        bestTrade = {
          id: item.id || '',
          pair: String(item.market || item.pair || 'XAU/USD').toUpperCase(),
          setup: String(item.setup || item.setupType || item.title || 'Setup').trim(),
          dateLabel: extractEntryDateKey(item),
          money,
          rVal,
          score
        };
      }

      const sess = String(item.session || '').trim() || 'Lainnya';
      const sRec = sessionMap.get(sess) || { session: sess, count: 0, wins: 0, money: 0, rVal: 0 };
      sRec.count += 1;
      if (outcome === 'Win') sRec.wins += 1;
      sRec.money += money;
      sRec.rVal += rVal;
      sessionMap.set(sess, sRec);

      const tags = extractExecutionTags(item);
      for (const tag of tags) {
        if (tag && tag !== 'Sesuai Plan') {
          const tRec = tagMap.get(tag) || { tag, count: 0, totalMoney: 0, totalR: 0 };
          tRec.count += 1;
          tRec.totalMoney += money;
          tRec.totalR += rVal;
          tagMap.set(tag, tRec);
        }
      }
    }

    const sessions = Array.from(sessionMap.values()).sort((a, b) => (b.money - a.money) || (b.rVal - a.rVal));
    const bestSession = sessions[0] || null;
    const mistakeSummary = Array.from(tagMap.values()).sort((a, b) => (a.totalMoney - b.totalMoney) || (a.totalR - b.totalR));
    const costliestLeak = mistakeSummary.find(m => m.totalMoney < 0 || m.totalR < 0) || mistakeSummary[0] || null;

    return {
      empty: false,
      days,
      tradeCount: recent.length,
      wins,
      losses,
      breakevens,
      winRate: Math.round((wins / recent.length) * 100),
      netMoney: Number(netMoney.toFixed(2)),
      netR: Number(netR.toFixed(2)),
      bestTrade,
      bestSession,
      costliestLeak,
      mistakeSummary
    };
  }

  function buildSessionPlanNote(plan = {}) {
    const today = String(plan.dateLabel || toWitaDateKey(Date.now()));
    const session = String(plan.session || 'NY AM').trim();
    const bias = String(plan.bias || 'Netral').trim();
    const keyLevels = String(plan.keyLevels || '').trim() || 'Belum ditentukan';
    const poiPlan = String(plan.poiPlan || '').trim() || 'Tunggu sweep + MSS M5 di area POI';
    const maxLoss = String(plan.maxLoss || '2 SL / -3%').trim();
    const newsNote = String(plan.newsNote || 'Cek kalender USD sebelum entry').trim();

    const title = `Rencana Sesi ${session} · ${today} (${bias})`;
    const lines = [
      `Bias HTF: ${bias}`,
      `Sesi Fokus: ${session} (WITA)`,
      `Level Kunci (PDH/PDL/Asia): ${keyLevels}`,
      `Skenario POI & Konfirmasi: ${poiPlan}`,
      `Batas Risiko Harian: ${maxLoss}`,
      `Catatan Berita USD: ${newsNote}`,
      `Aturan Eksekusi: Masuk hanya jika syarat A+ terpenuhi, SL wajib terpasang sebelum entry.`
    ];

    return {
      title,
      category: 'Rencana Sesi',
      content: lines.join('\n')
    };
  }

  function evaluateMarketSessionStatus(events, nowMs, options = {}) {
    const now = Number.isFinite(nowMs) ? nowMs : Date.now();
    const list = Array.isArray(events) ? events : [];
    const allowEmptyAsSafe = options.allowEmptyAsSafe !== false;
    if (options.unavailable || (!list.length && !allowEmptyAsSafe)) {
      return {
        tone: 'CAUTION',
        badge: 'KALENDER OFFLINE',
        headline: 'Jadwal berita USD belum tersedia — cek kalender sebelum entry',
        detail: 'Periksa koneksi atau ketuk Perbarui di tab Kalender agar jadwal High-Impact termuat.',
        nextEvent: null
      };
    }

    const usdHigh = list
      .filter(ev => {
        const cur = String(ev?.currency || ev?.country || '').toUpperCase();
        const imp = String(ev?.impact || '').toUpperCase();
        const ts = Number(ev?.timestampMs || (ev?.timestamp ? ev.timestamp * 1000 : Date.parse(ev?.date || ev?.iso || '')));
        return cur === 'USD' && (imp === 'HIGH' || imp === 'RED' || imp === '3') && Number.isFinite(ts);
      })
      .map(ev => {
        const ts = Number(ev?.timestampMs || (ev?.timestamp ? ev.timestamp * 1000 : Date.parse(ev?.date || ev?.iso || '')));
        return {
          title: String(ev.title || ev.event || 'Berita USD High Impact').trim(),
          ts,
          diffMin: Math.round((ts - now) / 60000)
        };
      })
      .sort((a, b) => a.ts - b.ts);

    // Active window: -15m to +30m around release (News Lock Gate parity)
    const active = usdHigh.find(e => e.diffMin <= 15 && e.diffMin >= -30);
    if (active) {
      const stateText = active.diffMin > 0
        ? `rilis dalam ${active.diffMin} menit`
        : active.diffMin === 0
          ? 'sedang rilis sekarang'
          : `baru rilis ${Math.abs(active.diffMin)} menit lalu`;
      return {
        tone: 'DANGER',
        badge: 'NEWS LOCK',
        headline: `Hati-hati: ${active.title} (${stateText})`,
        detail: 'Tunggu volatilitas & spread mereda sebelum eksekusi XAU/USD.',
        nextEvent: active
      };
    }

    const upcomingSoon = usdHigh.find(e => e.diffMin > 15 && e.diffMin <= 720);
    if (upcomingSoon) {
      const hrs = Math.floor(upcomingSoon.diffMin / 60);
      const mins = upcomingSoon.diffMin % 60;
      const eta = hrs > 0 ? `${hrs} jam ${mins} mnt` : `${mins} menit`;
      const d = new Date(upcomingSoon.ts + 8 * 3600000);
      const witaStr = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} WITA`;
      return {
        tone: upcomingSoon.diffMin <= 60 ? 'DANGER' : 'CAUTION',
        badge: upcomingSoon.diffMin <= 60 ? 'SEGERA RILIS' : 'WASPADA USD',
        headline: `${upcomingSoon.title} · ${witaStr} (${eta} lagi)`,
        detail: 'Amankan posisi aktif minimal 15 menit sebelum rilis High Impact.',
        nextEvent: upcomingSoon
      };
    }

    if (options.isStale) {
      return {
        tone: 'CAUTION',
        badge: 'CACHE USANG',
        headline: 'Data kalender >24 jam — perbarui jadwal sebelum eksekusi',
        detail: 'Ketuk Perbarui di tab Kalender untuk memastikan tidak ada rilis USD High-Impact.',
        nextEvent: null
      };
    }

    return {
      tone: 'SAFE',
      badge: 'SESI AMAN',
      headline: 'Tidak ada rilis USD High-Impact dalam 12 jam ke depan',
      detail: 'Kondisi kalender makro kondusif untuk eksekusi teknikal XAU/USD.',
      nextEvent: null
    };
  }

  function parseYearMonth(input) {
    const str = String(input || '');
    const m = str.match(/(20\d{2})[-_/]?(0[1-9]|1[0-2])/);
    if (!m) return null;
    return { year: Number(m[1]), month: Number(m[2]), ym: `${m[1]}-${m[2]}` };
  }

  function resolveNextMonthPack(currentPackIdOrLabel, catalogItems, installedPacks) {
    const parsed = parseYearMonth(currentPackIdOrLabel);
    if (!parsed) return null;
    const nextYear = parsed.month === 12 ? parsed.year + 1 : parsed.year;
    const nextMonth = parsed.month === 12 ? 1 : parsed.month + 1;
    const nextMonthStr = String(nextMonth).padStart(2, '0');
    const nextYm = `${nextYear}-${nextMonthStr}`;
    const label = `${MONTH_NAMES_ID[nextMonth - 1]} ${nextYear}`;

    const installedList = Array.isArray(installedPacks) ? installedPacks : [];
    const installedPack = installedList.find(p => {
      const pYm = parseYearMonth(p?.id || p?.month || p?.name || p?.label);
      return pYm && pYm.ym === nextYm;
    }) || null;

    const catList = Array.isArray(catalogItems) ? catalogItems : [];
    const cloudItem = catList.find(c => {
      const cYm = parseYearMonth(c?.id || c?.ym || c?.month || `${c?.year || ''}-${String(c?.monthNum || c?.month || '').padStart(2, '0')}`);
      return cYm && cYm.ym === nextYm;
    }) || null;

    return {
      currentYm: parsed.ym,
      nextYm,
      nextYear,
      nextMonth,
      label,
      installedPack,
      cloudItem
    };
  }

  function normalizeReplayBookmark(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const ts = Number(raw.timestamp);
    if (!Number.isFinite(ts) || ts <= 0) return null;
    return {
      id: String(raw.id || `bm_${ts}_${Math.random().toString(36).slice(2, 6)}`),
      packId: String(raw.packId || 'sample'),
      sourceLabel: String(raw.sourceLabel || 'Dataset').trim(),
      timeframe: String(raw.timeframe || 'M15').toUpperCase(),
      timestamp: ts,
      timeLabel: String(raw.timeLabel || '').trim(),
      price: Number.isFinite(Number(raw.price)) ? Number(raw.price) : null,
      note: String(raw.note || 'Momen Setup A+').trim().slice(0, 120),
      createdAt: Number(raw.createdAt) || Date.now()
    };
  }

  function sortReplayBookmarks(list) {
    return (Array.isArray(list) ? list : [])
      .map(normalizeReplayBookmark)
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  return {
    GUARD_STORAGE_KEY,
    REPLAY_BOOKMARKS_KEY,
    ACADEMY_BOOKMARKS_KEY,
    MEDIA_WATCHED_KEY,
    MISTAKE_TAGS,
    DEFAULT_GUARD_CONFIG,
    normalizeGuardConfig,
    readDailyGuardConfig,
    saveDailyGuardConfig,
    toWitaDateKey,
    evaluateDailyLossGuard,
    extractExecutionTag,
    extractExecutionTags,
    computeWeeklyReview,
    buildSessionPlanNote,
    evaluateMarketSessionStatus,
    parseYearMonth,
    resolveNextMonthPack,
    normalizeReplayBookmark,
    sortReplayBookmarks
  };
});
