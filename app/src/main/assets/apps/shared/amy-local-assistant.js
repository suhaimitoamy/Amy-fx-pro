/* Amy FX Pro — Local Pro Trading Engine & Shared App Data Bridge (100% Synced Offline/Free-Tier Fallback) */
(function (root) {
  'use strict';
  if (root.AmyLocalAssistant) return;

  const script = root.document?.currentScript?.src || (function () {
    const scripts = root.document?.getElementsByTagName('script') || [];
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('amy-local-assistant.js')) return scripts[i].src;
    }
    return '';
  })();
  const base = script ? new URL('../../', script).href : '';

  const routes = {
    mapping: ['Chart Gold & Mapping', 'apps/mapping/index.html'],
    market_intel: ['Berita & Kalender', 'apps/market-intel/index.html'],
    news: ['Berita & Kalender', 'apps/market-intel/index.html'],
    calendar: ['Kalender Ekonomi', 'apps/market-intel/index.html'],
    journal: ['Jurnal & Habits', 'apps/journal/index.html'],
    kalkulator: ['Jurnal & Risk Setup', 'apps/journal/index.html'],
    practice: ['Trading Practice', 'apps/practice/index.html'],
    indikator: ['Indikator ICT', 'apps/indikator/index.html'],
    home: ['Beranda', 'index.html']
  };

  const norm = s =>
    String(s ?? '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9/$.%\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const list = v => (Array.isArray(v) ? v : []);
  const read = (key, fallback = null) => {
    try {
      const val = root.localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };
  const raw = key => {
    try {
      return root.localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  };
  const stamp = t =>
    t && Number.isFinite(new Date(t).getTime())
      ? new Date(t).toLocaleString('id-ID', { timeZone: 'Asia/Makassar', hour12: false }) + ' WITA'
      : 'waktu tidak tersedia';
  const numFmt = v =>
    v !== null && v !== '' && Number.isFinite(Number(v))
      ? Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 })
      : 'belum tersedia';
  const usd = v => (Number.isFinite(Number(v)) && Number(v) > 0 ? '$' + Number(v).toFixed(2) : '—');

  let lastIntent = '';
  let lastQuery = '';
  let knowledgeReady = Promise.resolve();

  function getLivePrice() {
    if (Number.isFinite(Number(root.amyfxCurrentPrice)) && Number(root.amyfxCurrentPrice) > 0) {
      return Number(root.amyfxCurrentPrice);
    }
    try {
      const el = root.document?.querySelector(
        '#hero-price, #chart-price, #mapping-live-price, #home-chart-price, #home-price, #scenario-price, .hero-live-price, .gold-live-price, [data-live-price], [data-price]'
      );
      if (el) {
        const txt = String(el.textContent || el.getAttribute('data-live-price') || el.getAttribute('data-price') || '')
          .replace(/[^\d.,]/g, '')
          .replace(/,(?=\d{3}\b)/g, '')
          .replace(',', '.');
        const n = Number(txt);
        if (Number.isFinite(n) && n > 500) return n;
      }
    } catch (_) {}
    const ctx = root.AmyMarketContext || read('amyfx.market-context.v1');
    const cPrice = Number(ctx?.price || ctx?.livePrice || ctx?.close || 0);
    return Number.isFinite(cPrice) && cPrice > 500 ? cPrice : null;
  }

  function buildMappingSnapshot(ctx, overridePrice = null) {
    if (!ctx || typeof ctx !== 'object') return null;
    const livePrice = Number(overridePrice) > 0 ? Number(overridePrice) : getLivePrice();
    const dr = ctx.m15?.dealingRange || null;
    const rHigh = Number(dr?.rangeHigh || dr?.high || 0);
    const rLow = Number(dr?.rangeLow || dr?.low || 0);
    const eq = Number(dr?.eq || (rHigh && rLow ? (rHigh + rLow) / 2 : 0));

    let pct = 50;
    let zoneLabel = 'EQUILIBRIUM · 50%';
    let isBreakdown = false;
    let isBreakout = false;
    let isNoTradeEq = false;

    if (livePrice && rHigh > rLow) {
      const rawPct = ((livePrice - rLow) / (rHigh - rLow)) * 100;
      pct = Math.max(0, Math.min(100, Math.round(rawPct)));
      if (livePrice < rLow) {
        isBreakdown = true;
        zoneLabel = 'BREAKDOWN · 0%';
      } else if (livePrice > rHigh) {
        isBreakout = true;
        zoneLabel = 'BREAKOUT · 100%';
      } else if (pct >= 45 && pct <= 55) {
        isNoTradeEq = true;
        zoneLabel = `NO-TRADE EQ · ${pct}%`;
      } else if (pct > 55) {
        zoneLabel = `PREMIUM · ${pct}%`;
      } else {
        zoneLabel = `DISKON · ${pct}%`;
      }
    }

    const liqList = list(ctx.liquidity);
    let bslAbove = null;
    let sslBelow = null;
    if (livePrice) {
      const above = liqList
        .filter(l => Number(l.level) > livePrice && /bsl|pdh|pwh|asia high|high/i.test(`${l.label} ${l.kind || ''}`))
        .sort((a, b) => Number(a.level) - Number(b.level));
      const below = liqList
        .filter(l => Number(l.level) < livePrice && /ssl|pdl|pwl|asia low|low/i.test(`${l.label} ${l.kind || ''}`))
        .sort((a, b) => Number(b.level) - Number(a.level));
      bslAbove = above[0] || (rHigh > livePrice ? { label: 'Range High', level: rHigh } : null);
      sslBelow = below[0] || (rLow < livePrice ? { label: 'Range Low', level: rLow } : null);
    }

    return {
      livePrice,
      rangeHigh: rHigh || null,
      rangeLow: rLow || null,
      eq: eq || null,
      pct,
      zoneLabel,
      isBreakdown,
      isBreakout,
      isNoTradeEq,
      bslAbove: bslAbove ? { label: bslAbove.label, level: Number(bslAbove.level) } : null,
      sslBelow: sslBelow ? { label: sslBelow.label, level: Number(sslBelow.level) } : null,
      h1Bias: ctx.h1?.bias || 'NEUTRAL',
      h1Health: ctx.h1?.health || '',
      m15Control: ctx.m15?.control || 'BALANCED',
      m15Structure: ctx.m15?.structure || '',
      m5Status: ctx.m5?.status || 'WAITING',
      poi: ctx.m15?.poi || null,
      primary: ctx.primary || null,
      plan: ctx.plan || null,
      execution: ctx.execution || null,
      confluence: ctx.confluence || null,
      news: ctx.news || null,
      freshFvgs: list(ctx.indicators?.m15?.fvg).filter(f => f.status === 1 || f.lifecycle === 'FRESH')
    };
  }

  function readJournals() {
    return new Promise(resolve => {
      let done = false;
      let db;
      const finish = v => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { db?.close(); } catch (_) {}
        resolve(v);
      };
      const fallback = () => {
        const localRows = list(
          read('tradingLibraryManager.journals.v1') ||
          read('tradingLibraryManager.items.v1') ||
          read('amy_journal_entries', [])
        );
        finish({ rows: localRows, fallback: true });
      };
      const timer = setTimeout(fallback, 1600);
      try {
        if (!root.indexedDB) {
          fallback();
          return;
        }
        const req = root.indexedDB.open('tradingLibraryManager.files');
        req.onupgradeneeded = () => {
          try { req.transaction.abort(); } catch (_) {}
        };
        req.onerror = fallback;
        req.onblocked = fallback;
        req.onsuccess = () => {
          db = req.result;
          if (done) {
            try { db.close(); } catch (_) {}
            return;
          }
          if (!db.objectStoreNames.contains('metadata')) {
            fallback();
            return;
          }
          const store = db.transaction('metadata', 'readonly').objectStore('metadata');
          const checkItems = () => {
            const rItems = store.get('items.v2');
            rItems.onsuccess = () => {
              const iRows = rItems.result?.value;
              if (Array.isArray(iRows) && iRows.length) finish({ rows: iRows, fallback: false });
              else fallback();
            };
            rItems.onerror = fallback;
          };
          const rJournals = store.get('journals.v2');
          rJournals.onsuccess = () => {
            const jRows = rJournals.result?.value;
            if (Array.isArray(jRows) && jRows.length) finish({ rows: jRows, fallback: false });
            else checkItems();
          };
          rJournals.onerror = checkItems;
        };
      } catch {
        fallback();
      }
    });
  }

  function habits() {
    const habitList = list(read('amy_habits_v2', []));
    const completedDates = read('amy_completed_dates_v2', {}) || {};
    const startDate = raw('amy_discipline_start_date');
    const defaultBal = Number(raw('amy_default_balance') || 0);
    const defaultRisk = Number(raw('amy_default_risk') || 0);

    const todayWita = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' });
    const todayDone = list(completedDates[todayWita]);
    const activeDates = Object.keys(completedDates)
      .filter(d => Array.isArray(completedDates[d]) && completedDates[d].length > 0)
      .sort()
      .reverse();

    let streak = 0;
    if (activeDates.length) {
      let cursor = new Date(todayWita + 'T00:00:00Z');
      for (let i = 0; i < 60; i++) {
        const iso = cursor.toISOString().slice(0, 10);
        if (Array.isArray(completedDates[iso]) && completedDates[iso].length > 0) {
          streak++;
        } else if (i > 0) {
          break;
        }
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
    }

    return {
      totalHabits: habitList.length,
      todayDoneCount: todayDone.length,
      streak,
      startDate,
      defaultBalance: defaultBal > 0 ? defaultBal : null,
      defaultRisk: defaultRisk > 0 ? defaultRisk : null,
      summaryText:
        habitList.length > 0
          ? `• **Disiplin & Habits:** ${todayDone.length}/${habitList.length} habit selesai hari ini · Streak disiplin: **${streak} hari**` +
            (defaultBal > 0 ? ` · Profil Risiko Tersimpan: Modal **$${defaultBal.toFixed(0)}**, Risiko **${defaultRisk || 1}%**` : '')
          : defaultBal > 0
          ? `• **Profil Risiko Tersimpan:** Modal **$${defaultBal.toFixed(0)}**, Risiko **${defaultRisk || 1}%**`
          : ''
    };
  }

  function riskCalc(rawQuery) {
    const text = String(rawQuery || '').replace(/,/g, '.');
    const lower = text.toLowerCase();
    const savedBal = Number(raw('amy_default_balance') || 0);
    const savedRisk = Number(raw('amy_default_risk') || 0);
    const livePrice = getLivePrice();

    const balMatch =
      lower.match(/(?:modal|saldo|balance|ekuitas|equity|akun)\s*(?:rp|usd|\$)?\s*(\d+(?:\.\d+)?)/i) ||
      lower.match(/\$\s*(\d+(?:\.\d+)?)\b/);
    const riskPctMatch =
      lower.match(/(?:risiko|risk|resiko)\s*(\d+(?:\.\d+)?)\s*%/i) ||
      lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:risiko|risk|resiko)?/i);
    const riskUsdMatch = lower.match(/(?:risiko|risk|resiko)\s*\$\s*(\d+(?:\.\d+)?)/i);
    const entryMatch = lower.match(/(?:entry|masuk|buy|sell|harga)\s*(?:di|at|@)?\s*\$?\s*(\d{3,4}(?:\.\d+)?)/i);
    const slPriceMatch = lower.match(/(?:sl|stop\s*loss)\s*(?:di|at|@)?\s*\$?\s*(\d{3,4}(?:\.\d+)?)/i);
    const slPipsMatch = lower.match(/(?:sl|stop\s*loss|jarak)\s*(\d+(?:\.\d+)?)\s*(?:pips?|pip)/i);
    const slPtsMatch = lower.match(/(?:sl|stop\s*loss|jarak)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:poin|pts?|point|dollar|dolar)/i);

    const balance = balMatch ? Number(balMatch[1]) : savedBal > 0 ? savedBal : 1000;
    const riskPct = riskPctMatch ? Number(riskPctMatch[1]) : savedRisk > 0 ? savedRisk : 1.0;
    const entry = entryMatch ? Number(entryMatch[1]) : livePrice || null;
    const slPrice = slPriceMatch ? Number(slPriceMatch[1]) : null;

    let slPoints = null;
    if (entry && slPrice && Math.abs(entry - slPrice) > 0.05) {
      slPoints = Math.abs(entry - slPrice);
    } else if (slPipsMatch) {
      slPoints = Number(slPipsMatch[1]) / 10;
    } else if (slPtsMatch) {
      slPoints = Number(slPtsMatch[1]);
    }

    if (!Number.isFinite(balance) || balance <= 0 || !Number.isFinite(slPoints) || slPoints <= 0) {
      return {
        ok: false,
        needsInput: true,
        text:
          `**Kalkulator Lot XAU/USD**\n` +
          `Sebutkan jarak SL (atau harga Entry & SL) supaya saya hitung lot presisinya, Sayang.\n` +
          `• Default akun saat ini: Modal **$${balance.toFixed(0)}** · Risiko **${riskPct.toFixed(1)}%**\n` +
          `• Contoh: \`Modal $1000 risiko 1% entry 3708 SL 3718\` atau \`Saldo $500 risk 1% SL 50 pips\`.`
      };
    }

    const riskUsd = riskUsdMatch ? Number(riskUsdMatch[1]) : balance * (riskPct / 100);
    const slPips = Math.round(slPoints * 10);
    const rawLot = riskUsd / (slPoints * 100);
    const safeLot = Math.max(0.01, Math.floor(rawLot * 100) / 100);
    const actualRiskUsd = safeLot * slPoints * 100;
    const actualRiskPct = (actualRiskUsd / balance) * 100;

    let direction = null;
    let tp1 = null;
    let tp2 = null;
    if (entry && slPrice) {
      direction = entry > slPrice ? 'BUY' : 'SELL';
      tp1 = direction === 'BUY' ? entry + slPoints * 1.5 : entry - slPoints * 1.5;
      tp2 = direction === 'BUY' ? entry + slPoints * 3.0 : entry - slPoints * 3.0;
    }

    const lines = [
      `**Kalkulator Lot & Risiko XAU/USD**`,
      `• Modal Akun: **$${balance.toFixed(2)}** | Target Risiko: **${riskPct.toFixed(1)}% ($${riskUsd.toFixed(2)})**`,
      entry && slPrice
        ? `• Setup **${direction}**: Entry **$${entry.toFixed(2)}** | SL **$${slPrice.toFixed(2)}** (Jarak **$${slPoints.toFixed(2)} / ${slPips} pips**)`
        : `• Jarak Stop Loss: **$${slPoints.toFixed(2)} (${slPips} pips)**`,
      `• Ukuran Lot Rekomendasi: **${safeLot.toFixed(2)} LOT** (Risiko aktual: **-$${actualRiskUsd.toFixed(2)}** / ${actualRiskPct.toFixed(2)}%)`
    ];

    if (tp1 && tp2) {
      lines.push(
        `• Proyeksi TP1 (1:1.5R): **$${tp1.toFixed(2)}** (+$${(actualRiskUsd * 1.5).toFixed(2)}) | TP2 Runner (1:3R): **$${tp2.toFixed(2)}** (+$${(actualRiskUsd * 3).toFixed(2)})`
      );
    }
    if (rawLot < 0.01) {
      lines.push(
        `• Peringatan: Lot ideal (${rawLot.toFixed(3)}) di bawah minimum 0.01 lot standar. Risiko 0.01 lot = ${actualRiskPct.toFixed(2)}% — pertimbangkan akun Cent (XAUUSDc) atau perketat SL di struktur M5.`
      );
    }

    return {
      ok: true,
      balance,
      riskPct,
      riskUsd: Number(riskUsd.toFixed(2)),
      slPoints: Number(slPoints.toFixed(2)),
      slPips,
      lot: Number(safeLot.toFixed(2)),
      actualRiskUsd: Number(actualRiskUsd.toFixed(2)),
      actualRiskPct: Number(actualRiskPct.toFixed(2)),
      direction,
      entry,
      slPrice,
      tp1: tp1 ? Number(tp1.toFixed(2)) : null,
      tp2: tp2 ? Number(tp2.toFixed(2)) : null,
      text: lines.join('\n')
    };
  }

  function intent(rawQ) {
    const q = norm(rawQ);
    const found = [];
    const wantsLot =
      /\b(hitung lot|kalkulator|ukuran lot|lot berapa|pakai lot|berapa lot|risk calculator|risiko \d|risk \d|modal \$?\d|saldo \$?\d)\b/.test(q) ||
      (/\b(entry|sl)\b/.test(q) && /\b(modal|saldo|risiko|risk|lot)\b/.test(q));
    if (wantsLot) found.push('kalkulator');
    if (
      /\b(harga|price|mapping|market|xau|gold|emas|chart|grafik|candle|sinyal|signal|bias|arah|entry|setup|stop loss|target|sl|tp|poi|ob|order block|fvg|bsl|ssl|pdh|pdl|pwh|pwl|dealing range|diskon|discount|premium|eq|bos|mss|sweep|likuiditas|breakdown|breakout)\b/.test(
        q
      )
    ) {
      found.push('mapping');
    }
    if (
      /\b(news|berita|kabar|headline|kalender|calendar|ekonomi|kompas|fundamental|makro|fomc|nfp|cpi|ppi|pce|gdp|fed|powell|yield|dxy|dollar|dolar|inflasi|pengangguran|unemployment|philly|ism|geopolitik|news lock|high impact)\b/.test(
        q
      )
    ) {
      found.push('market_intel');
    }
    if (
      /\b(jurnal|journal|transaksi|profit|rugi|loss|winrate|win rate|profit factor|pips|performa|evaluasi|kesalahan|emosi|disiplin|psikologi|fomo|overtrade|revenge|habit|kebiasaan|streak|equity|ekuitas|kurva|drawdown|dd|expectancy|kebocoran|leak|sesi terbaik|sesi paling)\b/.test(
        q
      )
    ) {
      found.push('journal');
    }
    if (/\b(practice|praktik|simulasi|latihan|replay|backtest|60 kasus|skor latihan|soal)\b/.test(q)) {
      found.push('practice');
    }
    if (/\b(belajar|baca|bacaan|membaca|pelajari|academy|akademi|tutorial|progres|progress|materi|pelajaran|glosarium|kamus|istilah)\b/.test(q)) {
      found.push('academy');
    }
    if (
      found.includes('journal') &&
      !/mapping|harga|xau|gold|emas|chart|grafik|sinyal|bias|ob|fvg|dealing range|bsl|ssl/.test(q)
    ) {
      return found.filter(id => id !== 'mapping');
    }
    return [...new Set(found)];
  }

  function mapping(q, legacyM, now = Date.now()) {
    const context = root.AmyMarketContext || read('amyfx.market-context.v1');
    const livePrice = getLivePrice();

    if (context?.version === 'amyfx-gold-context-v1' || context?.m15?.dealingRange) {
      const snap = buildMappingSnapshot(context, livePrice);
      const tfName = context.source?.M5 ? 'M5' : 'M15';
      const h1Label = { BULLISH: 'Bullish (Naik)', BEARISH: 'Bearish (Turun)' }[snap.h1Bias] || 'Netral';
      const h1HealthLabel = { HEALTHY: 'Kuat', WEAKENING: 'Melemah', INVALIDATED: 'Batal' }[snap.h1Health] || '';
      const m15Label = { BUYER: 'Buyer (Pembeli)', SELLER: 'Seller (Penjual)' }[snap.m15Control] || 'Seimbang';
      const m5Label = { CONFIRMED: 'Terkonfirmasi', CONFIRMING: 'Sedang Konfirmasi', FAILED: 'Gagal' }[snap.m5Status] || 'Menunggu';

      const lines = [
        `**Mapping XAU/USD (Live Cockpit)**`,
        `• Harga Live: **${usd(snap.livePrice)}** | Posisi Dealing Range: **${snap.zoneLabel}**`
      ];

      if (snap.rangeLow && snap.rangeHigh) {
        lines.push(
          `• Dealing Range M15: Low **${usd(snap.rangeLow)}** — High **${usd(snap.rangeHigh)}** (EQ 50%: **${usd(snap.eq)}**)`
        );
      }

      const liqParts = [];
      if (snap.bslAbove) liqParts.push(`BSL Atas: **${usd(snap.bslAbove.level)}** (${snap.bslAbove.label})`);
      if (snap.sslBelow) liqParts.push(`SSL Bawah: **${usd(snap.sslBelow.level)}** (${snap.sslBelow.label})`);
      if (liqParts.length) lines.push(`• Likuiditas Valid: ${liqParts.join(' | ')}`);

      lines.push(
        `• Bias Multi-TF: H1 **${h1Label}${h1HealthLabel ? ' · ' + h1HealthLabel : ''}** | M15 **${m15Label}** | ${tfName} **${m5Label}**`
      );

      if (snap.poi && snap.poi.low && snap.poi.high) {
        lines.push(
          `• Order Block M15 (${snap.poi.label || snap.poi.side || 'POI'}): **${usd(snap.poi.low)} – ${usd(snap.poi.high)}** (50% CE: **${usd(snap.poi.ce)}**, ${snap.poi.lifecycle || 'FRESH'})`
        );
      }

      if (snap.freshFvgs.length) {
        const f = snap.freshFvgs[0];
        lines.push(
          `• FVG Fresh M15 (${f.side || ''}): **${usd(f.low)} – ${usd(f.high)}** (CE: **${usd(f.ce)}**)`
        );
      }

      if (snap.primary?.label) {
        const areaStr = snap.primary.area
          ? `${usd(snap.primary.area.low)} – ${usd(snap.primary.area.high)}`
          : 'menunggu area valid';
        lines.push(
          `• Skenario Utama: **${snap.primary.label}** · Area **${areaStr}** · Invalidasi **${usd(snap.primary.invalidation)}**`
        );
      }

      if (snap.isBreakdown) {
        lines.push(`• Catatan Eksekusi: Harga sedang **BREAKDOWN** di bawah Dealing Range Low (${usd(snap.rangeLow)}). Jangan tangkap pisau jatuh — tunggu sweep & konfirmasi MSS M5 atau retest supply sebelum entry.`);
      } else if (snap.isNoTradeEq) {
        lines.push(`• Catatan Eksekusi: Harga di **No-Trade Zone (EQ 50%)**. Tunggu harga masuk ke area ekstrem Diskon/Premium agar RR terjaga.`);
      } else if (snap.execution?.status === 'READY TO REVIEW') {
        lines.push(`• Status Eksekusi: **SIAP DITINJAU**. ${snap.execution?.reason || ''}`);
      } else {
        const planHint = snap.plan?.entry
          ? `Area pantauan siap di ${usd(snap.plan.entry)} (SL ${usd(snap.plan.sl)}), namun konfirmasi trigger ${tfName} masih **WAIT**.`
          : `Konfirmasi eksekusi ${tfName} masih **WAIT**.`;
        lines.push(`• Status Eksekusi: ${planHint} ${snap.execution?.reason || ''}`.trim());
      }

      if (snap.news?.note) {
        lines.push(`• Filter Kalender: ${snap.news.note}`);
      }
      return lines.join('\n');
    }

    if (livePrice) {
      return `**Harga Live XAU/USD:** **${usd(livePrice)}**\n• Snapshot struktur M15/M5 lengkap sedang disiapkan. Buka **Chart Gold & Mapping** untuk memuat Dealing Range, OB, FVG, dan likuiditas terbaru.`;
    }
    if (legacyM?.close) {
      return `**Snapshot Mapping (${legacyM.tf || 'M15'}):** Close **${usd(legacyM.close)}** (${stamp(Number(legacyM.sourceTime) * 1000)}). Buka Mapping untuk menyegarkan data live terbaru.`;
    }
    return 'Belum ada snapshot Mapping aktif di sesi ini. Buka **Chart Gold & Mapping** untuk memuat struktur XAU/USD terbaru.';
  }

  function calendar(calData) {
    const data = calData || read('amyfx.market.calendar.v1') || read('amyfx.market.intel.v1', {})?.calendar;
    const events = list(data?.events || data?.items || data);
    if (!events.length) {
      return '• **Kalender Ekonomi:** Belum ada cache jadwal kalender tersimpan. Buka menu **Berita & Kalender** untuk sinkronisasi jadwal USD High-Impact.';
    }
    const nowMs = Date.now();
    const upcoming = events
      .filter(e => e.timestampMs && Number(e.timestampMs) > nowMs)
      .sort((a, b) => Number(a.timestampMs) - Number(b.timestampMs));
    const released = events
      .filter(e => e.actual && String(e.actual).trim() !== '' && String(e.actual).trim() !== '—')
      .slice(-3)
      .reverse();

    const lines = ['**Kalender Ekonomi USD (Fokus XAU/USD)**'];
    if (upcoming.length) {
      upcoming.slice(0, 3).forEach(ev => {
        const diffMin = Math.max(0, Math.round((Number(ev.timestampMs) - nowMs) / 60000));
        const hours = Math.floor(diffMin / 60);
        const mins = diffMin % 60;
        const cd = hours > 24 ? `${Math.floor(hours / 24)}h ${hours % 24}j lagi` : hours > 0 ? `${hours}j ${mins}m lagi` : `${mins}m lagi`;
        lines.push(
          `• **${ev.title || ev.event}** (${ev.impact || 'HIGH'}) — ${ev.timeWita || stamp(ev.timestampMs)} (**${cd}**) | Forecast: ${ev.forecast || '—'} · Prev: ${ev.previous || '—'}`
        );
      });
    } else {
      lines.push('• Tidak ada jadwal USD High-Impact tersisa dalam waktu dekat.');
    }

    if (released.length) {
      lines.push('• **Rilis Terakhir (Aktual vs Forecast):**');
      released.forEach(ev => {
        const bias = ev.goldBias ? ` → **${ev.goldBias}**` : '';
        lines.push(`  - ${ev.title || ev.event}: Aktual **${ev.actual}** vs Forecast ${ev.forecast || '—'}${bias}`);
      });
    }
    return lines.join('\n');
  }

  function news(q, n) {
    const cache = n || read('amyfx.assistant.news.v1') || read('amyfx.market.intel.v1', {})?.news || read('amyfx.market.intel.v1');
    const items = list(cache?.items || cache?.news);
    if (!items.length) {
      return '**Berita Makro Gold:** Belum ada salinan berita tersimpan di cache lokal. Buka **Berita & Kalender** untuk memuat feed terbaru.';
    }
    const ignore = new Set([
      'berita', 'news', 'terbaru', 'apa', 'yang', 'ada', 'tentang', 'kabar', 'tolong',
      'ringkas', 'ringkasan', 'sekarang', 'dong', 'nih', 'kalender', 'ekonomi', 'hari', 'ini', 'terdekat'
    ]);
    const terms = norm(q).split(' ').filter(t => t.length > 2 && !ignore.has(t));
    const filtered = terms.length
      ? items.filter(r => terms.some(t => norm(`${r.title || ''} ${r.text || ''} ${r.textOriginal || ''}`).includes(t)))
      : items;
    const picked = (filtered.length ? filtered : items).slice(0, 4);

    const lines = [
      `**Berita Fokus Gold & Makro** (${stamp(cache.updated || cache.updatedAt || cache.capturedAt)})`
    ];
    picked.forEach((r, i) => {
      const title = String(r.title || r.text || r.textOriginal || '').replace(/\s+/g, ' ').trim().slice(0, 260);
      const impact = r.goldImpact ? ` [${r.goldImpact}]` : '';
      lines.push(`${i + 1}. ${title}${impact} — *${r.source || 'Market Intel'}*`);
    });
    return lines.join('\n');
  }

  function journal(q, data) {
    const rows = list(data?.rows);
    const habitInfo = habits();

    if (!rows.length) {
      const parts = [
        `**Jurnal Trading & Habits**`,
        `• Belum ada catatan transaksi jurnal tersimpan di perangkat ini.`
      ];
      if (habitInfo.summaryText) parts.push(habitInfo.summaryText);
      parts.push(`• Catat setiap setup XAU/USD (entry, SL, emosi, dan hasil R) di menu **Jurnal & Habits** agar saya bisa mengevaluasi win rate dan jam paling profitmu.`);
      return parts.join('\n');
    }

    if (root.AmyJournalAnalyticsPro?.formatForAssistant) {
      const proResult = root.AmyJournalAnalyticsPro.formatForAssistant(rows, {
        range: 'all',
        unit: 'auto',
        defaultBalance: habitInfo.defaultBalance || 0,
        defaultRisk: habitInfo.defaultRisk || 0
      });
      if (proResult?.text) {
        const proLines = [proResult.text];
        if (habitInfo.summaryText) proLines.push(habitInfo.summaryText);
        if (proResult.data?.executionBrief?.bullets?.length) {
          proLines.push(`• **Sorotan Eksekusi:** ${proResult.data.executionBrief.bullets.join(' ')}`);
        }
        let sortedPro = rows.slice().sort((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || '')));
        if (/loss|rugi|kalah/.test(norm(q))) sortedPro = sortedPro.filter(r => norm(r.result || r.outcome) === 'loss');
        else if (/win|menang/.test(norm(q)) && !/rate|rasio/.test(norm(q))) sortedPro = sortedPro.filter(r => norm(r.result || r.outcome) === 'win');
        const recentPro = sortedPro.slice(0, 3).map(r => {
          const note = r.evaluation || r.mistakes || r.lessons || r.setup || '';
          return `  - ${r.date || ''} · **${r.pair || r.market || r.title || 'XAU/USD'}** (${r.result || r.outcome || 'Open'})${note ? ' — ' + String(note).slice(0, 140) : ''}`;
        });
        if (recentPro.length) {
          proLines.push('• **Catatan Terbaru:**', ...recentPro);
        }
        return proLines.join('\n');
      }
    }

    const win = rows.filter(r => norm(r.result || r.outcome) === 'win').length;
    const loss = rows.filter(r => norm(r.result || r.outcome) === 'loss').length;
    const be = rows.filter(r => ['be', 'break even', 'breakeven'].includes(norm(r.result || r.outcome))).length;
    const profit = rows.reduce((s, r) => s + (Number(r.profit) || (Number(r.pnlMoney) > 0 ? Number(r.pnlMoney) : 0) || 0), 0);
    const lossAmount = rows.reduce((s, r) => s + (Number(r.loss) || (Number(r.pnlMoney) < 0 ? Math.abs(Number(r.pnlMoney)) : 0) || 0), 0);
    const netPips = rows.reduce((s, r) => s + (Number(r.pnlPips || r.pips) || 0), 0);
    const completed = win + loss + be;
    const winRate = completed ? numFmt((win / completed) * 100) + '%' : 'belum tersedia';
    const profitFactor = lossAmount > 0 ? numFmt(profit / lossAmount) : profit > 0 ? '∞ (tanpa loss)' : '1.00';
    const avgWin = win > 0 ? profit / win : 0;
    const avgLoss = loss > 0 ? lossAmount / loss : 0;
    const winLossRatio = avgLoss > 0 ? numFmt(avgWin / avgLoss) : '—';

    const hourProfits = {};
    rows.forEach(r => {
      const t = r.actualEntryTime || r.analysisTime || r.date || r.createdAt;
      if (t) {
        const d = new Date(t);
        if (!isNaN(d.getTime())) {
          const h = (d.getUTCHours() + 8) % 24;
          const p = Number(r.profit) || (Number(r.pnlMoney) > 0 ? Number(r.pnlMoney) : 0) || 0;
          hourProfits[h] = (hourProfits[h] || 0) + p;
        }
      }
    });
    let bestHour = null;
    let maxHProfit = -Infinity;
    for (const [h, p] of Object.entries(hourProfits)) {
      if (p > maxHProfit && p > 0) {
        maxHProfit = p;
        bestHour = h;
      }
    }
    const bestHourStr = bestHour !== null ? `${String(bestHour).padStart(2, '0')}:00 WITA` : 'belum cukup data';

    const emotionCounts = {};
    rows.forEach(r => {
      const rawText = [r.emotion, r.mistake, r.mistakes, r.notes, r.evaluation].filter(Boolean).join(' ').toLowerCase();
      if (/fomo/.test(rawText)) emotionCounts.FOMO = (emotionCounts.FOMO || 0) + 1;
      if (/overtrade|over trading/.test(rawText)) emotionCounts.Overtrade = (emotionCounts.Overtrade || 0) + 1;
      if (/revenge/.test(rawText)) emotionCounts['Revenge Trading'] = (emotionCounts['Revenge Trading'] || 0) + 1;
      if (/takut|fear/.test(rawText)) emotionCounts['Fear of Loss'] = (emotionCounts['Fear of Loss'] || 0) + 1;
      if (/serakah|greed/.test(rawText)) emotionCounts.Greed = (emotionCounts.Greed || 0) + 1;
      if (/geser sl|lebar sl|tanpa sl/.test(rawText)) emotionCounts['Pelanggaran SL'] = (emotionCounts['Pelanggaran SL'] || 0) + 1;
    });

    const lines = [
      `**Evaluasi Jurnal Trading (${rows.length} Transaksi)**`,
      `• Hasil: **${win} Win** · **${loss} Loss** · **${be} BE** | Win Rate: **${winRate}**`,
      `• Net P/L: **${numFmt(profit - lossAmount)}** (Profit ${numFmt(profit)} / Loss ${numFmt(lossAmount)}) | Profit Factor: **${profitFactor}** | Net Pips: **${numFmt(netPips)}**`,
      `• Avg Win/Loss: **${numFmt(avgWin)} / ${numFmt(avgLoss)}** (Rasio ${winLossRatio}) | Jam Terbaik: **${bestHourStr}**`
    ];

    if (habitInfo.summaryText) lines.push(habitInfo.summaryText);

    const emotionSummary = Object.entries(emotionCounts).map(([k, v]) => `${k} (${v}x)`).join(', ');
    if (emotionSummary || /emosi|psikologi|mental|fomo|overtrade|revenge|disiplin|habit/.test(norm(q))) {
      lines.push(
        `• **Psikologi & Disiplin:** ${emotionSummary || 'Belum ada catatan pelanggaran emosi negatif.'} — Tetap patuhi SOP M15/M5 dan batas risiko 1–2% per setup.`
      );
    }

    let sorted = rows.slice().sort((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || '')));
    if (/loss|rugi|kalah/.test(norm(q))) sorted = sorted.filter(r => norm(r.result || r.outcome) === 'loss');
    else if (/win|menang/.test(norm(q)) && !/rate|rasio/.test(norm(q))) sorted = sorted.filter(r => norm(r.result || r.outcome) === 'win');

    const recentLines = sorted.slice(0, 3).map(r => {
      const note = r.evaluation || r.mistakes || r.lessons || r.setup || '';
      return `  - ${r.date || ''} · **${r.pair || r.title || 'XAU/USD'}** (${r.result || r.outcome || 'Open'})${note ? ' — ' + String(note).slice(0, 140) : ''}`;
    });
    if (recentLines.length) {
      lines.push('• **Catatan Terbaru:**', ...recentLines);
    }
    return lines.join('\n');
  }

  function practice() {
    const report = read('amy-guided-v2-summary', {}) || {};
    const results = list(report.results);
    const review = list(report.review);
    if (!results.length) {
      return `**Trading Practice:** Belum ada skor sesi latihan tersimpan. Mulai latihan analisa struktur & eksekusi di menu **Trading Practice** untuk menguji ketajaman bacaan chartmu.`;
    }
    const correct = results.filter(r => r.correct === true).length;
    const pct = numFmt((correct / results.length) * 100);
    const lines = [
      `**Ringkasan Trading Practice**`,
      `• Skor Sesi Terakhir: **${correct}/${results.length} benar (${pct}%)**`
    ];
    if (review.length) {
      lines.push(`• Topik Perlu Diulang: ${review.map(t => t.title || t).slice(0, 5).join(', ')}`);
    } else if (correct < results.length) {
      lines.push(`• Ada ${results.length - correct} soal perlu dievaluasi ulang pada sesi terakhir.`);
    } else {
      lines.push(`• Semua soal pada sesi terakhir dijawab benar. Mantap, Sayang!`);
    }
    return lines.join('\n');
  }

  function academy() {
    const readTopics = list(read('amy_read_topics', []));
    const last = read('amy_academy_last_read_v2', {}) || {};
    const lines = [
      `**Progres Belajar & Materi ICT**`,
      `• Topik Ditandai Dibuka: **${new Set(readTopics).size} bagian**`,
      `• Terakhir Dibaca: **${last.title || raw('amy_last_opened_title') || 'Belum tercatat'}**`
    ];
    if (last.headingText) {
      lines.push(`• Sub-bab Terakhir: ${last.headingText} (${numFmt(last.progress)}%)`);
    }
    lines.push(practice());
    return lines.join('\n');
  }

  const stop = new Set(
    'apa itu adalah jelaskan jelasin tolong saya aku dong nih yang dengan dan di ke dari tentang bagaimana kenapa mengapa cara materi belajar tutorial arti maksud pengertian contoh nya'.split(' ')
  );

  function knowledge(q) {
    const tokens = norm(q).split(' ').filter(t => t.length > 1 && !stop.has(t));
    if (!tokens.length) return null;
    const ranked = list(root.AmyLocalKnowledge)
      .map(row => {
        const title = norm(row.title);
        const body = norm(row.text);
        return {
          row,
          score: tokens.reduce((s, t) => s + (title.includes(t) ? 5 : body.includes(t) ? 1 : 0), 0),
          hits: tokens.filter(t => title.includes(t) || body.includes(t)).length
        };
      })
      .filter(r => r.hits === tokens.length)
      .sort((a, b) => b.score - a.score);
    const match = ranked[0];
    if (!match) return null;
    return {
      text: `**${match.row.title}**\n${String(match.row.text || '').slice(0, 1400)}`,
      links: []
    };
  }

  async function ask(question) {
    let q = norm(question).slice(0, 2000);
    const links = [];
    let text = '';
    let intents = intent(q);

    const follow = /^(lalu|terus|kenapa|mengapa|jelaskan|detail|lanjut|yang terakhir|berapa|bagaimana)( itu| lagi| dong| nya)?$/.test(q);
    if (follow && lastIntent) {
      intents = lastIntent.split(',');
      q = lastQuery + ' ' + q;
    }

    const definition = /\b(apa itu|pengertian|definisi|arti|contoh|jelaskan konsep|cara kerja|perbedaan|bedanya)\b/.test(q);
    if (definition) {
      await knowledgeReady;
      const k = knowledge(q);
      if (k) {
        text = k.text;
        intents = [];
      }
    }

    if (!text && /^(hai|halo|hi|pagi|siang|malam|terima kasih|makasih|thanks|oke|ok|siap)$/.test(q)) {
      text =
        'Halo Sayang! Saya **✦ AMY**, asisten khusus trading XAU/USD di **Amy FX Pro**.\n' +
        '• Tanya **Chart Gold & Mapping** (harga live, Dealing Range, OB/FVG, BSL/SSL)\n' +
        '• Cek **Berita & Kalender USD** terdekat\n' +
        '• Evaluasi **Jurnal Trading & Habits**\n' +
        '• **Hitung Lot & Risiko** cepat (contoh: `Modal $1000 risk 1% entry 3708 SL 3718`)';
    }

    if (/semua menu|semua modul|ringkasan aplikasi|briefing lengkap/.test(q)) {
      intents = ['mapping', 'market_intel', 'journal', 'practice'];
    }

    if (!text && intents.length) {
      const parts = [];
      for (const id of intents) {
        if (id === 'kalkulator') {
          const calc = riskCalc(question);
          parts.push(calc.text);
        } else if (id === 'mapping') {
          parts.push(mapping(q, root.AmyICTMapping || read('amyfx.ict.mapping.v1'), Date.now()));
          links.push({ label: '📈 ' + routes.mapping[0], path: routes.mapping[1] });
        } else if (id === 'market_intel') {
          const calText = calendar();
          const newsText = news(q);
          parts.push(calText + '\n\n' + newsText);
          links.push({ label: '📰 ' + routes.market_intel[0], path: routes.market_intel[1] });
        } else if (id === 'journal') {
          parts.push(journal(q, await readJournals()));
          links.push({ label: '📓 ' + routes.journal[0], path: routes.journal[1] });
        } else if (id === 'practice') {
          parts.push(practice());
          links.push({ label: '🎯 ' + routes.practice[0], path: routes.practice[1] });
        } else if (id === 'academy') {
          await knowledgeReady;
          const k = knowledge(q);
          parts.push(k ? k.text : academy());
        }
      }
      text = parts.filter(Boolean).join('\n\n');
      lastIntent = intents.join(',');
      lastQuery = q;
    }

    if (!text) {
      await knowledgeReady;
      const k = knowledge(q);
      if (k) text = k.text;
    }

    if (!text) {
      text =
        'Saya fokus 100% mendampingi trading **XAU/USD** dan seluruh fitur **Amy FX Pro**, Sayang.\n' +
        '• Coba tanya: **"Harga Gold & zona sekarang"**, **"Berita & kalender USD terdekat"**, **"Evaluasi jurnal & habit saya"**, **"Modal $1000 risk 1% entry 3708 SL 3718"**, atau istilah ICT seperti **"Apa itu FVG?"**.';
    }

    const dedupLinks = [];
    const seen = new Set();
    for (const l of links) {
      if (l?.path && !seen.has(l.path)) {
        seen.add(l.path);
        dedupLinks.push(l);
      }
    }

    return {
      text,
      links: dedupLinks.slice(0, 2),
      provider: 'amy-local-pro',
      model: 'local-trading-engine-v2',
      source: 'Data Live & Lokal Amy FX Pro'
    };
  }

  function mount() {
    if (!root.document?.body || document.getElementById('amy-local-root')) return;
    const style = document.createElement('style');
    style.textContent = `#amy-local-root{font:14px/1.6 system-ui,-apple-system,sans-serif;color:#e4edf8;position:relative;z-index:2147483640;pointer-events:auto}#amy-local-root [hidden]{display:none!important}#amy-local-root button,#amy-local-root input,#amy-local-root a{font:inherit}@keyframes aiSparkBreathe{0%,100%{transform:scale(1);opacity:1;filter:drop-shadow(0 0 8px #f5c451)}50%{transform:scale(1.22);opacity:0.85;filter:drop-shadow(0 0 16px #f5c451)}}#amy-local-fab{position:fixed;right:20px;bottom:90px;z-index:10000;display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,rgba(24,34,58,0.92) 0%,rgba(10,14,26,0.95) 100%);backdrop-filter:blur(28px) saturate(200%);-webkit-backdrop-filter:blur(28px) saturate(200%);border:1px solid rgba(245,196,81,0.55);border-top:1px solid rgba(255,255,255,0.35);border-radius:9999px;color:#fff;font-size:11.5px;font-weight:800;letter-spacing:0.05em;padding:10px 18px;box-shadow:0 16px 40px rgba(0,0,0,0.65),inset 0 1px 1px 0 rgba(255,255,255,0.25),0 0 20px rgba(245,196,81,0.3);cursor:pointer;transition:transform .2s cubic-bezier(0.16,1,0.3,1),box-shadow .2s ease,border-color .2s ease}#amy-local-fab:hover{transform:translateY(-2px) scale(1.02);border-color:rgba(245,196,81,0.9);box-shadow:0 20px 48px rgba(0,0,0,0.75),inset 0 1px 1px 0 rgba(255,255,255,0.35),0 0 28px rgba(245,196,81,0.45)}#amy-local-fab:active{transform:scale(0.97)}#amy-local-fab .ai-spark{color:#f5c451;font-size:14px;line-height:1;display:inline-block;animation:aiSparkBreathe 2.4s infinite ease-in-out;filter:drop-shadow(0 0 8px #f5c451)}#amy-local-panel{position:fixed;right:16px;bottom:90px;width:min(430px,calc(100vw - 24px));height:min(600px,75dvh);max-height:75vh;z-index:10001;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(16,24,45,0.96) 0%,rgba(8,12,22,0.98) 100%);backdrop-filter:blur(32px) saturate(200%);-webkit-backdrop-filter:blur(32px) saturate(200%);border:1px solid rgba(245,196,81,0.35);border-top:1px solid rgba(255,255,255,0.3);border-radius:22px;box-shadow:0 24px 64px rgba(0,0,0,0.8),inset 0 1px 1px 0 rgba(255,255,255,0.2),0 0 25px rgba(245,196,81,0.15);overflow:hidden;pointer-events:auto}#amy-local-panel header,#amy-local-panel form{display:flex;gap:8px;padding:12px;background:rgba(20,29,51,0.9)}#amy-local-panel header strong{flex:1;color:#f8fafc;font-weight:800}#amy-local-panel button{background:rgba(245,196,81,0.15);color:#f5c451;border:1px solid rgba(245,196,81,0.35);border-radius:10px;padding:8px 12px;cursor:pointer;font-weight:700}#amy-local-panel button:hover{background:rgba(245,196,81,0.25)}#amy-local-panel input{min-width:0;flex:1;background:rgba(7,11,20,0.8);color:white;border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:8px 12px}#amy-local-messages{overflow:auto;flex:1;padding:12px;overscroll-behavior:contain}#amy-local-messages p{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 14px;padding:12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)}#amy-local-messages a{color:#60a5fa;display:block}#amy-local-panel small{padding:4px 12px 0;color:#94a3b8;font-size:11px}#amy-local-panel .prompts{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px}#amy-local-panel .prompts button{background:rgba(255,255,255,0.06);color:#cbd5e1;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:5px 10px;font-size:11px}#amy-local-panel .prompts button:hover{border-color:rgba(245,196,81,0.5);color:#fff}`;
    document.head.appendChild(style);

    const host = document.createElement('div');
    host.id = 'amy-local-root';
    host.innerHTML =
      '<button id="amy-local-fab" type="button" aria-label="Buka Asisten Amy"><span class="ai-spark">✦</span><span>AMY</span></button>' +
      '<section id="amy-local-panel" hidden aria-label="Asisten Amy">' +
      '<header><strong>✦ AMY</strong><button type="button" id="amy-local-close" aria-label="Tutup asisten">Tutup</button></header>' +
      '<small>Amy FX Pro Trading Assistant</small>' +
      '<div class="prompts"></div>' +
      '<div id="amy-local-messages" aria-live="polite"></div>' +
      '<form><input aria-label="Pertanyaan untuk Amy" placeholder="Tanya XAU/USD..." maxlength="2000"><button type="submit">Kirim</button></form>' +
      '</section>';
    document.body.appendChild(host);

    const panel = host.querySelector('section');
    const input = host.querySelector('input');
    const messages = host.querySelector('#amy-local-messages');
    const fab = host.querySelector('#amy-local-fab');

    const open = () => {
      try {
        if (typeof window.AmyFXCloseVideoReel === 'function') window.AmyFXCloseVideoReel();
      } catch (_) {}
      document.querySelectorAll('dialog[open]').forEach(d => {
        if (!d.closest('#amy-local-root')) {
          try { d.close(); } catch (_) {}
          d.removeAttribute('open');
          if (d.classList.contains('amy-reel-dialog')) d.style.display = 'none';
        }
      });
      panel.hidden = false;
      fab.hidden = true;
      input.focus();
    };
    const close = () => {
      panel.hidden = true;
      fab.hidden = false;
      fab.focus();
    };
    fab.onclick = open;
    host.querySelector('#amy-local-close').onclick = close;
    panel.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
    });
    root.addEventListener('amyfx:open-mentor', open);

    function append(text, links = []) {
      const p = document.createElement('p');
      p.textContent = text;
      messages.appendChild(p);
      links.forEach(l => {
        try {
          const url = new URL(l.path, base);
          if (!url.href.startsWith(base)) return;
          const a = document.createElement('a');
          a.href = url.href;
          a.textContent = l.label;
          p.appendChild(a);
        } catch {}
      });
      while (messages.children.length > 40) messages.firstChild.remove();
      messages.scrollTop = messages.scrollHeight;
    }

    let busy = false;
    async function send(q) {
      if (busy || !q.trim()) return;
      busy = true;
      input.value = '';
      append('Anda: ' + q);
      const button = host.querySelector('form button');
      button.disabled = true;
      try {
        const r = await ask(q);
        append(r.text, r.links);
      } catch {
        append('Data belum dapat dibaca. Buka menu terkait lalu coba lagi.');
      } finally {
        busy = false;
        button.disabled = false;
        input.focus();
      }
    }

    host.querySelector('form').onsubmit = e => {
      e.preventDefault();
      send(input.value);
    };

    ['Harga Gold & Zona', 'Berita & Kalender', 'Evaluasi Jurnal', 'Hitung Lot'].forEach(q => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = q;
      b.onclick = () => send(q);
      host.querySelector('.prompts').appendChild(b);
    });

    append('Halo Sayang! Saya ✦ AMY, asisten khusus trading XAU/USD. Pilih tombol cepat di atas atau ketik pertanyaanmu.');

    if (script) {
      knowledgeReady = new Promise(resolve => {
        const s = document.createElement('script');
        const timer = setTimeout(resolve, 5000);
        const done = () => {
          clearTimeout(timer);
          resolve();
        };
        s.onload = done;
        s.onerror = done;
        s.src = new URL('amy-local-knowledge.js', script).href;
        document.head.appendChild(s);
      });
      if (!root.AmyJournalAnalyticsPro) {
        const jp = document.createElement('script');
        jp.src = new URL('journal-analytics-pro.js', script).href;
        jp.async = true;
        document.head.appendChild(jp);
      }
      const g = document.createElement('script');
      g.src = new URL('amy-gemini-live-bridge.js', script).href;
      g.async = true;
      document.head.appendChild(g);
    }
  }

  function openWithPrompt(promptText) {
    if (!root.document) return false;
    root.dispatchEvent(new CustomEvent('amyfx:open-mentor'));
    const q = String(promptText || '').trim();
    if (!q) return true;
    setTimeout(() => {
      const panel = document.getElementById('amy-local-panel');
      const form = panel?.querySelector('form');
      const input = form?.querySelector('input');
      if (input && form) {
        input.value = q;
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 120);
    return true;
  }

  root.AmyLocalAssistant = Object.freeze({
    ask,
    intent,
    mapping,
    getLivePrice,
    buildMappingSnapshot,
    news,
    calendar,
    journal,
    habits,
    riskCalc,
    practice,
    academy,
    knowledge,
    readJournals,
    openWithPrompt
  });

  if (root.document) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
  }
})(typeof window === 'undefined' ? globalThis : window);
