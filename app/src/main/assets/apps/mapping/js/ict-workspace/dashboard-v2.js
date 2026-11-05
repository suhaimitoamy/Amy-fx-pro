/**
 * ICT DASHBOARD V2 — Amy FX Pro Mapping
 * Render 5 card bernarasi ICT terintegrasi:
 *   1. Hero Context (bias 3-TF riil + live price)
 *   2. Dealing Range (visual bar vertikal BSL/EQ/SSL)
 *   3. POI Sell Setup (FVG/OB Bearish + SOP napas spread)
 *   4. POI Buy Setup (FVG/OB Bullish + konfirmasi)
 *   5. Skenario Prioritas
 */

(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = id => document.getElementById(id);
  const fmt = v => (Number.isFinite(Number(v)) && Number(v) > 0) ? Number(v).toFixed(2) : '—';
  const fmtRange = (lo, hi) => (fmt(lo) !== '—' && fmt(hi) !== '—') ? `$${fmt(lo)} – $${fmt(hi)}` : '—';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ── Jam WITA live ── */
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
    if (!el) return;
    el.textContent = getWITA();
    setInterval(() => { const e = $('hero-clock'); if (e) e.textContent = getWITA(); }, 1000);
  }

  /* ── Live price sync ── */
  function applyHeroPrice(price) {
    if (!Number.isFinite(price) || price <= 0) return;
    const el = $('hero-price');
    if (el) el.textContent = '$' + price.toFixed(2);
    const sp = $('scenario-price');
    if (sp) sp.textContent = '$' + price.toFixed(2);
  }

  /* ── 1. Hero Card: Bias 3-TF ── */
  function updateHeroCard(ctx) {
    if (!ctx) return;
    const amy = ctx.amy || ctx;
    const dashboard = amy?.dashboard;

    // Harga terkini: utamakan livePrice, lalu c.price, lalu close candle
    const livePrice = Number(window.amyfxCurrentPrice) || Number(ctx.price) || Number(dashboard?.candle?.close) || 0;
    if (livePrice > 0) applyHeroPrice(livePrice);

    // Dealing range: cari dari berbagai kemungkinan struktur
    const dr = ctx.m15?.dealingRange || amy?.levels?.dealingRange || ctx.dealingRange || dashboard;
    const rHigh = Number(dr?.rangeHigh ?? dr?.high);
    const rLow  = Number(dr?.rangeLow ?? dr?.low);
    const eqVal = Number(dr?.eq ?? (Number.isFinite(rHigh) && Number.isFinite(rLow) ? (rHigh + rLow) / 2 : NaN));

    const eqEl = $('hero-eq');
    if (eqEl) {
      eqEl.textContent = Number.isFinite(eqVal) ? `≈ EQ $${fmt(eqVal)}` : '≈ EQ —';
    }

    // Resolusi Arah Bias Tiap Timeframe:
    // H1:
    let h1Dir = 0, h1Desc = 'Struktur netral — menunggu konfirmasi';
    const h1BiasStr = String(ctx.h1?.bias || '').toUpperCase();
    // Kalibrasi Twelve Data: deskripsi H1 mengikuti health + jenis break riil, bukan klaim "dominan" statis.
    const h1Health = String(ctx.h1?.health || '').toUpperCase();
    const h1BreakType = String(ctx.h1?.lastBreak?.type || '').toUpperCase() || 'Break';
    const h1Pattern = (ctx.h1?.highPattern && ctx.h1?.lowPattern) ? ` (${ctx.h1.highPattern}/${ctx.h1.lowPattern})` : '';
    if (h1BiasStr.includes('BEAR') || ctx.h1?.trend?.dir === -1 || ctx.h1Dir === -1) {
      h1Dir = -1;
      h1Desc = h1Health === 'WEAKENING'
        ? `${h1BreakType} Bearish, namun struktur melemah${h1Pattern}`
        : `${h1BreakType} Bearish terkonfirmasi${h1Pattern}`;
    } else if (h1BiasStr.includes('BULL') || ctx.h1?.trend?.dir === 1 || ctx.h1Dir === 1) {
      h1Dir = 1;
      h1Desc = h1Health === 'WEAKENING'
        ? `${h1BreakType} Bullish, namun struktur melemah${h1Pattern}`
        : `${h1BreakType} Bullish terkonfirmasi${h1Pattern}`;
    }

    // M15:
    let m15Dir = 0, m15Desc = 'Konsolidasi — menunggu konfirmasi break';
    const m15Struct = String(ctx.m15?.structure || '').toUpperCase();
    const m15Control = String(ctx.m15?.control || '').toUpperCase();
    const dashBiasDir = dashboard?.biasDir;
    if (m15Struct.includes('BEAR') || m15Control.includes('SELLER') || dashBiasDir === -1) {
      m15Dir = -1;
      m15Desc = 'Struktur turun masih dominan (Seller control)';
    } else if (m15Struct.includes('BULL') || m15Control.includes('BUYER') || dashBiasDir === 1) {
      m15Dir = 1;
      m15Desc = 'Struktur naik, momentum buyer aktif';
    }

    // M5:
    let m5Dir = 0, m5Desc = 'Candle choppy — tunggu arah';
    const m5Status = String(ctx.m5?.status || '').toUpperCase();
    const m5Mss = ctx.m5?.mss;
    if (m5Status === 'CONFIRMED' || m5Mss) {
      // Jika M15 bull dan M5 confirmed -> Bullish
      if (m15Dir === 1 || dashboard?.bullMss) {
        m5Dir = 1;
        m5Desc = 'Rebound lokal — MSS Bullish terbentuk';
      } else {
        m5Dir = -1;
        m5Desc = 'Tekanan jual lokal — displacement turun';
      }
    }

    // Banner Utama
    const bannerEl = $('hero-bias-banner');
    if (bannerEl) {
      let bannerClass = 'bias-neutral';
      let bannerText = '🧭 MENUNGGU DATA BIAS...';

      const isPremiumZone = Number.isFinite(eqVal) && livePrice > (eqVal + 0.5);
      const isDiscountZone = Number.isFinite(eqVal) && livePrice < (eqVal - 0.5);

      if (h1Dir === -1 && m15Dir === 1) {
        bannerClass = 'bias-pullback';
        bannerText = '🧭 BIAS HARI INI: BEARISH HTF — FASE PULLBACK NAIK';
      } else if (h1Dir === 1 && m15Dir === -1) {
        bannerClass = 'bias-pullback';
        bannerText = '🧭 BIAS HARI INI: BULLISH HTF — FASE PULLBACK TURUN';
      } else if (m15Dir === 1 && isPremiumZone) {
        bannerClass = 'bias-bullish';
        bannerText = '🧭 BIAS HARI INI: BULLISH LOKAL (M15) — MENGUJI ZONA PREMIUM';
      } else if (m15Dir === -1 && isDiscountZone) {
        bannerClass = 'bias-bearish';
        bannerText = '🧭 BIAS HARI INI: BEARISH LOKAL (M15) — MENGUJI ZONA DISKON';
      } else if (m15Dir === -1 || h1Dir === -1) {
        bannerClass = 'bias-bearish';
        bannerText = '🧭 BIAS HARI INI: BEARISH — SELL PRESSURE DOMINAN';
      } else if (m15Dir === 1 || h1Dir === 1) {
        bannerClass = 'bias-bullish';
        bannerText = '🧭 BIAS HARI INI: BULLISH — BUY MOMENTUM AKTIF';
      }

      bannerEl.className = `hero-bias-banner ${bannerClass}`;
      bannerEl.textContent = bannerText;
    }

    // Warning Counter-trend & Premium/Discount
    const warnEl = $('hero-warning');
    if (warnEl) {
      const isCounter = (h1Dir === -1 && m15Dir === 1) || (h1Dir === 1 && m15Dir === -1);
      const isPremiumBuy = m15Dir === 1 && Number.isFinite(eqVal) && livePrice > (eqVal + 0.5);
      const isDiscountSell = m15Dir === -1 && Number.isFinite(eqVal) && livePrice < (eqVal - 0.5);
      if (isCounter) {
        warnEl.textContent = '⚠️ WASPADA: Ini bukan sinyal Buy bebas. Ini hanya koreksi naik sementara di dalam tren Bear HTF.';
        warnEl.hidden = false;
      } else if (isPremiumBuy) {
        warnEl.textContent = '⚠️ WASPADA: Harga berada di ZONA PREMIUM (>50% EQ). Dilarang FOMO Buy di pucuk, tunggu retest Demand atau pembalikan di Supply!';
        warnEl.hidden = false;
      } else if (isDiscountSell) {
        warnEl.textContent = '⚠️ WASPADA: Harga berada di ZONA DISKON (<50% EQ). Dilarang FOMO Sell di dasar, tunggu retest Supply atau pembalikan di Demand!';
        warnEl.hidden = false;
      } else {
        warnEl.hidden = true;
      }
    }

    // Tabel 3-TF
    const tbody = $('hero-tf-tbody');
    if (tbody) {
      const rows = [
        { tf: 'H1 (HTF)', dir: h1Dir, desc: h1Desc },
        { tf: 'M15 (MTF)', dir: m15Dir, desc: m15Desc },
        { tf: 'M5 (LTF)', dir: m5Dir, desc: m5Desc }
      ];

      tbody.innerHTML = rows.map(r => {
        const dirLabel = r.dir === 1 ? '🟢 BULL' : r.dir === -1 ? '🔴 BEAR' : '⚪ NETRAL';
        const dirClass = r.dir === 1 ? 'bias-bull' : r.dir === -1 ? 'bias-bear' : 'bias-neutral';
        return `<tr>
          <td>${esc(r.tf)}</td>
          <td class="${dirClass}">${dirLabel}</td>
          <td>${esc(r.desc)}</td>
        </tr>`;
      }).join('');
    }

    // Kesimpulan Bernarasi
    const conclusionEl = $('hero-conclusion');
    if (conclusionEl) {
      if (h1Dir === -1 && m15Dir === 1) {
        conclusionEl.innerHTML = 'Trend utama <strong>BEARISH</strong>. Harga saat ini sedang pullback naik menuju zona Supply untuk kemudian melanjutkan perjalanan turun. Smart Money sedang mengisi bensin sebelum dump lanjutan.';
      } else if (h1Dir === 1 && m15Dir === -1) {
        conclusionEl.innerHTML = 'Trend utama <strong>BULLISH</strong>. Harga saat ini sedang koreksi turun menuju zona Demand untuk mencari pijakan ekspansi berikutnya.';
      } else if (m15Dir === 1 && Number.isFinite(eqVal) && livePrice > (eqVal + 0.5)) {
        // Kalibrasi Twelve Data: tanpa angka hardcode — level riil ada di kartu POI.
        conclusionEl.innerHTML = 'Momentum lokal dikuasai oleh <strong>BUYER (M15)</strong>, namun harga sudah berada di <strong>ZONA PREMIUM</strong>. Disiplin menanti jemputan di Demand M15 atau amati rejection di Supply atas (lihat kartu POI).';
      } else if (m15Dir === 1) {
        conclusionEl.innerHTML = 'Momentum pasar saat ini dikuasai oleh <strong>BUYER</strong>. Struktur lokal membentuk Higher High dan Higher Low di M15.';
      } else if (m15Dir === -1 && Number.isFinite(rLow) && livePrice > 0 && livePrice < rLow) {
        conclusionEl.innerHTML = 'Trend pasar didominasi oleh <strong>SELLER</strong>. Harga sudah breakdown di bawah Range Low M15.';
      } else if (m15Dir === -1) {
        conclusionEl.innerHTML = 'Trend pasar didominasi oleh <strong>SELLER</strong>. Harga masih di dalam Dealing Range M15 — tunggu reaksi di Supply atas atau SSL bawah.';
      } else {
        conclusionEl.innerHTML = 'Struktur belum searah — tunggu konfirmasi break sebelum mengambil posisi.';
      }
    }
  }

  /* ── 2. Dealing Range Card ── */
  function updateDealingRange(ctx) {
    if (!ctx) return;
    const amy = ctx.amy || ctx;
    const dashboard = amy?.dashboard;
    const dr = ctx.m15?.dealingRange || amy?.levels?.dealingRange || ctx.dealingRange || dashboard;
    if (!dr) return;

    let rHigh = Number(dr.rangeHigh ?? dr.high);
    let rLow  = Number(dr.rangeLow ?? dr.low);
    const livePrice = Number(window.amyfxCurrentPrice) || Number(ctx.price) || Number(dashboard?.candle?.close) || 0;

    // Adaptasi Cerdas (Dynamic Expansion):
    // Jika harga live melompat menembus rHigh atau rLow lama (breakout di luar range),
    // dealing range otomatis ekspansi agar persentase bar tetap logis dan tidak overflow >100%
    if (livePrice > 0 && Number.isFinite(rHigh) && livePrice > rHigh) {
      rHigh = Math.max(rHigh, Math.ceil(livePrice + 2.0));
    }
    if (livePrice > 0 && Number.isFinite(rLow) && livePrice < rLow) {
      rLow = Math.min(rLow, Math.floor(livePrice - 2.0));
    }

    const eqVal = (rHigh + rLow) / 2;

    let pct = 50;
    if (Number.isFinite(rHigh) && Number.isFinite(rLow) && rHigh > rLow && Number.isFinite(livePrice)) {
      pct = Math.min(100, Math.max(0, Math.round(((livePrice - rLow) / (rHigh - rLow)) * 100)));
    }

    // Tampilkan label angka M15 Dealing Range
    const bslEl = $('dr-bsl-val'); if (bslEl) bslEl.textContent = Number.isFinite(rHigh) ? '$' + fmt(rHigh) : '—';
    const eqEl  = $('dr-eq-val');  if (eqEl)  eqEl.textContent  = Number.isFinite(eqVal) ? `$${fmt(eqVal)} (${pct}%)` : '—';
    const sslEl = $('dr-ssl-val'); if (sslEl) sslEl.textContent = Number.isFinite(rLow)  ? '$' + fmt(rLow)  : '—';

    // Bar visual
    const fill = $('dr-bar-fill');
    const dot  = $('dr-bar-dot');
    if (fill) fill.style.height = pct + '%';
    if (dot)  dot.style.bottom  = `calc(${pct}% - 8px)`;

    // Kalibrasi Range Mayor (PDH/PDL riil dari engine — tanpa fallback angka hardcode)
    const pdh = Number(amy?.levels?.pdh || ctx.h1?.swingHigh);
    const pdl = Number(amy?.levels?.pdl || ctx.h1?.swingLow);
    const majorRangeEl = $('dr-major-range');
    const majorEqEl = $('dr-major-eq');
    if (pdh > 0 && pdl > 0) {
      if (majorRangeEl) majorRangeEl.textContent = `$${fmt(pdl)} – $${fmt(pdh)}`;
      if (majorEqEl) majorEqEl.textContent = `$${fmt((pdh + pdl) / 2)}`;
    } else {
      if (majorRangeEl) majorRangeEl.textContent = 'Data belum tersedia';
      if (majorEqEl) majorEqEl.textContent = '—';
    }

    // Status badge dinamis
    const badge = $('dr-status-badge');
    if (badge) {
      let cls = 'zone-eq', text = '';
      if (pct > 75) {
        cls = 'zone-premium';
        text = `🔴 M15 di ${pct}% (EXTREME PREMIUM). Harga mendekati Range High / BSL ($${fmt(rHigh)}). Hati-hati jangan Buy di pucuk!`;
      } else if (pct > 52.5) {
        cls = 'zone-premium';
        text = `🔴 M15 di ${pct}% (PREMIUM). Rentan rejection / false breakout. Hindari Buy di pucuk!`;
      } else if (pct < 25) {
        cls = 'zone-discount';
        text = `🟢 M15 di ${pct}% (EXTREME DISCOUNT). Dekat Range Low / SSL ($${fmt(rLow)}). Siaga setup pembalikan Buy!`;
      } else if (pct < 47.5) {
        cls = 'zone-discount';
        text = `🟢 M15 di ${pct}% (DISCOUNT). Buy preferred, tunggu sweep / validasi demand.`;
      } else {
        cls = 'zone-eq';
        text = `⚠️ M15 di ${pct}% (EQUILIBRIUM). Zona abu-abu 50%, no-trade zone!`;
      }
      badge.className = `dr-status-badge ${cls}`;
      badge.textContent = text;
    }
  }

  /* ── 3. POI Cards (SELL & BUY) ── */
  function renderPOICards(ctx) {
    if (!ctx) return;
    const amy = ctx.amy || ctx;
    const dashboard = amy?.dashboard;
    const livePrice = Number(window.amyfxCurrentPrice) || Number(ctx.price) || Number(dashboard?.candle?.close) || 0;

    // ── Update Dinamis Subtitle POI Badges (Harmonisasi dengan Bias) ──
    const sellBadgeEl = $('poi-sell-badge');
    const buyBadgeEl  = $('poi-buy-badge');
    if (sellBadgeEl && buyBadgeEl) {
      let m15Dir = 0;
      const m15Struct = String(ctx.m15?.structure || '').toUpperCase();
      const m15Control = String(ctx.m15?.control || '').toUpperCase();
      const dashBiasDir = dashboard?.biasDir;
      if (m15Struct.includes('BEAR') || m15Control.includes('SELLER') || dashBiasDir === -1) {
        m15Dir = -1;
      } else if (m15Struct.includes('BULL') || m15Control.includes('BUYER') || dashBiasDir === 1) {
        m15Dir = 1;
      }

      let h1Dir = 0;
      const h1BiasStr = String(ctx.h1?.bias || '').toUpperCase();
      if (h1BiasStr.includes('BEAR') || ctx.h1?.trend?.dir === -1 || ctx.h1Dir === -1) {
        h1Dir = -1;
      } else if (h1BiasStr.includes('BULL') || ctx.h1?.trend?.dir === 1 || ctx.h1Dir === 1) {
        h1Dir = 1;
      }

      if (h1Dir === -1 && m15Dir === 1) {
        sellBadgeEl.textContent = 'High Probability HTF — Reversal di Supply / PDH';
        buyBadgeEl.textContent  = 'Pullback Retest — Jemput di Demand M15';
      } else if (h1Dir === 1 && m15Dir === -1) {
        sellBadgeEl.textContent = 'Pullback Koreksi — Resistance Ekstrem';
        buyBadgeEl.textContent  = 'High Probability HTF — Reversal di Demand / SSL';
      } else if (m15Dir === 1) {
        sellBadgeEl.textContent = 'Target Pembalikan — Resistance Ekstrem / PDH';
        buyBadgeEl.textContent  = 'Pijakan Retest — Jemput di Demand M15 (Sejalan Bias)';
      } else if (m15Dir === -1) {
        sellBadgeEl.textContent = 'Trend Follower — High Probability (Supply M15)';
        buyBadgeEl.textContent  = 'Counter-Trend — Retracement (Hanya Support Ekstrem)';
      } else {
        sellBadgeEl.textContent = 'Target Pembalikan — Resistance Ekstrem';
        buyBadgeEl.textContent  = 'Pijakan Retest — Jemput di Demand';
      }
    }

    // ── KALIBRASI TWELVE DATA (5 Nov 2026) ──
    // Seluruh level POI diambil dari engine riil (ctx.m15 / amy.dashboard / amy.levels / amy.visuals).
    // DILARANG fallback angka hardcode. Supply/BSL wajib DI ATAS harga, Demand/SSL wajib DI BAWAH harga.
    const num = v => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : NaN; };
    const fvgs = amy?.visuals?.fvg || amy?.levels?.fvgs || amy?.fvgs || [];
    const isActiveZone = z => {
      const lc = String(z?.lifecycle || '').toUpperCase();
      return lc !== 'BROKEN' && lc !== 'MITIGATED' && lc !== 'INVALIDATED';
    };
    const zoneOf = f => {
      const lo = num(f.low ?? f.gapLow ?? f.zoneLow);
      const hi = num(f.high ?? f.gapHigh ?? f.zoneHigh);
      const ce = num(f.ce ?? f.consequentEncroachment) || (lo + hi) / 2;
      return { lo, hi, ce };
    };
    const bearFVGs = fvgs.filter(f => {
      const s = String(f.side || f.direction || '').toUpperCase();
      return (s === 'SELL' || s === 'BEARISH' || f.dir === -1) && isActiveZone(f);
    });
    const bullFVGs = fvgs.filter(f => {
      const s = String(f.side || f.direction || '').toUpperCase();
      return (s === 'BUY' || s === 'BULLISH' || f.dir === 1) && isActiveZone(f);
    });

    // POI aktif M15 jika ada
    const m15Poi = ctx.m15?.poi;
    const isM15SellPoi = m15Poi && String(m15Poi.side || '').toUpperCase() === 'SELL' && isActiveZone(m15Poi);
    const isM15BuyPoi  = m15Poi && String(m15Poi.side || '').toUpperCase() === 'BUY' && isActiveZone(m15Poi);

    // Kandidat likuiditas riil
    const drM15 = ctx.m15?.dealingRange || dashboard || {};
    const liqCandidates = [
      { name: 'BSL M15 (Protected High)', k: 'H', v: num(dashboard?.bsl) },
      { name: 'Range High M15', k: 'H', v: num(drM15.rangeHigh ?? drM15.high) },
      { name: 'BSL Swing', k: 'H', v: num(amy?.levels?.bsl) },
      { name: 'PDH', k: 'H', v: num(amy?.levels?.pdh) },
      { name: 'Asia High', k: 'H', v: num(amy?.levels?.asiaHigh) },
      { name: 'SSL M15 (Protected Low)', k: 'L', v: num(dashboard?.ssl) },
      { name: 'Range Low M15', k: 'L', v: num(drM15.rangeLow ?? drM15.low) },
      { name: 'SSL Swing', k: 'L', v: num(amy?.levels?.ssl) },
      { name: 'PDL', k: 'L', v: num(amy?.levels?.pdl) },
      { name: 'Asia Low', k: 'L', v: num(amy?.levels?.asiaLow) }
    ].filter(x => Number.isFinite(x.v));
    const dedupe = arr => arr.filter((x, i) => arr.findIndex(y => Math.abs(y.v - x.v) < 0.05) === i);
    const liqAbove = livePrice > 0 ? dedupe(liqCandidates.filter(x => x.v > livePrice).sort((a, b) => a.v - b.v)) : [];
    const liqBelow = livePrice > 0 ? dedupe(liqCandidates.filter(x => x.v < livePrice).sort((a, b) => b.v - a.v)) : [];

    // ── Table SELL POI (hanya zona DI ATAS / menyentuh harga) ──
    const sellTbody = $('sell-poi-tbody');
    let primarySellZone = null;
    if (sellTbody) {
      const sellRows = [];

      if (isM15SellPoi && num(m15Poi.high) >= livePrice) {
        sellRows.push({
          poi: `Supply [${m15Poi.kind || 'OB'}] M15 ⭐`,
          level: fmtRange(m15Poi.low, m15Poi.high),
          note: `CE: $${fmt(m15Poi.ce)} — Mitigasi Supply terdekat`
        });
        primarySellZone = { low: num(m15Poi.low), high: num(m15Poi.high), ce: num(m15Poi.ce) };
      }

      bearFVGs.map(zoneOf)
        .filter(z => Number.isFinite(z.hi) && z.hi >= livePrice)
        .sort((a, b) => a.lo - b.lo)
        .slice(0, 2)
        .forEach((z, i) => {
          sellRows.push({ poi: `Bearish FVG #${i + 1}`, level: fmtRange(z.lo, z.hi), note: `CE: $${fmt(z.ce)} — FVG unmitigated premium` });
          if (!primarySellZone) primarySellZone = { low: z.lo, high: z.hi, ce: z.ce };
        });

      liqAbove.slice(0, 2).forEach(x => {
        sellRows.push(x.k === 'L'
          ? { poi: `${x.name} — tertembus`, level: '$' + fmt(x.v), note: `+$${fmt(x.v - livePrice)} di atas harga — bekas Support, kini Resistance (retest)` }
          : { poi: `${x.name}`, level: '$' + fmt(x.v), note: `+$${fmt(x.v - livePrice)} di atas harga — likuiditas BSL / area sweep` });
      });

      sellTbody.innerHTML = sellRows.length ? sellRows.map(r =>
        `<tr><td>${esc(r.poi)}</td><td>${esc(r.level)}</td><td>${esc(r.note)}</td></tr>`
      ).join('') : `<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:12px;">Belum ada Supply/BSL tervalidasi di atas harga.</td></tr>`;
    }

    // SOP Sell Presisi — TP wajib DI BAWAH entry (SSL riil terdekat di bawah zona)
    const sopSell = $('sell-sop-list');
    if (sopSell) {
      const entryLo = primarySellZone?.low;
      const entryHi = primarySellZone?.high;
      const tpCand = Number.isFinite(entryLo) ? liqBelow.find(x => x.v < entryLo && x.v < livePrice) : null;
      if (!Number.isFinite(entryLo) || !Number.isFinite(entryHi)) {
        sopSell.innerHTML = '<li>Belum ada zona Supply tervalidasi di atas harga — <strong>jangan Sell</strong>, tunggu engine membentuk POI.</li>';
      } else {
        const tp = tpCand?.v;
        sopSell.innerHTML = [
          `<li><strong>Entry area:</strong> tunggu retest/sweep Supply $${fmt(entryLo)} – $${fmt(entryHi)} + Rejection M5</li>`,
          Number.isFinite(tp)
            ? `<li><strong>TP target:</strong> $${fmt(tp)} (${esc(tpCand.name)})</li><li><strong>TP dengan napas spread:</strong> pasang TP di $${fmt(tp + 0.50)} (terjemput Ask)</li>`
            : '<li><strong>TP target:</strong> belum ada SSL riil di bawah zona — tentukan manual.</li>',
          `<li><strong>SL aman:</strong> di atas $${fmt(entryHi + 0.60)} (zona invalidasi + napas spread)</li>`
        ].join('');
      }
    }

    // ── Table BUY POI (hanya zona DI BAWAH / menyentuh harga) ──
    const buyTbody = $('buy-poi-tbody');
    let primaryBuyZone = null;
    if (buyTbody) {
      const buyRows = [];

      if (isM15BuyPoi && num(m15Poi.low) <= livePrice) {
        buyRows.push({
          poi: `Demand [${m15Poi.kind || 'OB'}] M15 ⭐`,
          level: fmtRange(m15Poi.low, m15Poi.high),
          note: `CE: $${fmt(m15Poi.ce)} — Pijakan pantulan lokal terdekat`
        });
        primaryBuyZone = { low: num(m15Poi.low), high: num(m15Poi.high), ce: num(m15Poi.ce) };
      }

      bullFVGs.map(zoneOf)
        .filter(z => Number.isFinite(z.lo) && z.lo <= livePrice)
        .sort((a, b) => b.hi - a.hi)
        .slice(0, 2)
        .forEach(z => {
          buyRows.push({ poi: 'Bullish FVG Diskon', level: fmtRange(z.lo, z.hi), note: `CE: $${fmt(z.ce)} — FVG unmitigated discount` });
          if (!primaryBuyZone) primaryBuyZone = { low: z.lo, high: z.hi, ce: z.ce };
        });

      liqBelow.slice(0, 2).forEach(x => {
        buyRows.push(x.k === 'H'
          ? { poi: `${x.name} — tertembus`, level: '$' + fmt(x.v), note: `-$${fmt(livePrice - x.v)} di bawah harga — bekas Resistance, kini Support (retest)` }
          : { poi: `${x.name}`, level: '$' + fmt(x.v), note: `-$${fmt(livePrice - x.v)} di bawah harga — likuiditas SSL / area sweep` });
      });

      buyTbody.innerHTML = buyRows.length ? buyRows.map(r =>
        `<tr><td>${esc(r.poi)}</td><td>${esc(r.level)}</td><td>${esc(r.note)}</td></tr>`
      ).join('') : `<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:12px;">Belum ada Demand/SSL tervalidasi di bawah harga.</td></tr>`;
    }

    // Label skenario: zona Sell/Buy terdekat (POI atau likuiditas riil)
    const sellLabelZone = primarySellZone || (liqAbove[0] ? { low: liqAbove[0].v, high: liqAbove[0].v } : null);
    const buyLabelZone  = primaryBuyZone  || (liqBelow[0] ? { low: liqBelow[0].v, high: liqBelow[0].v } : null);
    // ── Skenario Prioritas ──
    if (livePrice > 0) {
      const priceEl = $('scenario-price');
      if (priceEl) priceEl.textContent = '$' + livePrice.toFixed(2);
    }

    const zoneLabelEl = $('scenario-zone-label');
    const dr = ctx.m15?.dealingRange || amy?.levels?.dealingRange || ctx.dealingRange || dashboard;
    let rHigh = Number(dr?.rangeHigh ?? dr?.high);
    let rLow  = Number(dr?.rangeLow ?? dr?.low);

    // Dynamic Range Expansion agar tidak overflow/mabuk >100%
    if (livePrice > 0 && Number.isFinite(rHigh) && livePrice > rHigh) {
      rHigh = Math.max(rHigh, Math.ceil(livePrice + 2.0));
    }
    if (livePrice > 0 && Number.isFinite(rLow) && livePrice < rLow) {
      rLow = Math.min(rLow, Math.floor(livePrice - 2.0));
    }
    const eqVal = (rHigh + rLow) / 2;

    if (zoneLabelEl && Number.isFinite(rHigh) && Number.isFinite(rLow) && livePrice > 0) {
      const pct = Math.min(100, Math.max(0, Math.round(((livePrice - rLow) / (rHigh - rLow)) * 100)));
      if (pct > 75)        zoneLabelEl.textContent = `(zona EXTREME PREMIUM ${pct}%)`;
      else if (pct > 52.5) zoneLabelEl.textContent = `(zona PREMIUM ${pct}%)`;
      else if (pct < 25)   zoneLabelEl.textContent = `(zona EXTREME DISCOUNT ${pct}%)`;
      else if (pct < 47.5) zoneLabelEl.textContent = `(zona DISCOUNT ${pct}%)`;
      else                 zoneLabelEl.textContent = `(zona abu-abu EQ ${pct}%)`;
    }

    const sellZoneEl = $('sell-zone-label');
    if (sellZoneEl) {
      sellZoneEl.textContent = sellLabelZone
        ? (Math.abs(sellLabelZone.high - sellLabelZone.low) < 0.01 ? `$${fmt(sellLabelZone.high)}` : `$${fmt(sellLabelZone.low)}–$${fmt(sellLabelZone.high)}`)
        : 'zona supply (belum tervalidasi)';
    }

    const buyZoneEl = $('buy-zone-label');
    if (buyZoneEl) {
      buyZoneEl.textContent = buyLabelZone
        ? (Math.abs(buyLabelZone.high - buyLabelZone.low) < 0.01 ? `$${fmt(buyLabelZone.low)}` : `$${fmt(buyLabelZone.low)}–$${fmt(buyLabelZone.high)}`)
        : 'zona demand (belum tervalidasi)';
    }

    const noTradeEl = $('no-trade-label');
    if (noTradeEl && Number.isFinite(eqVal)) {
      const bLow  = (eqVal - 2.5).toFixed(2);
      const bHigh = (eqVal + 2.5).toFixed(2);
      const inside = livePrice >= eqVal - 2.5 && livePrice <= eqVal + 2.5;
      noTradeEl.textContent = inside
        ? `🚫 NO-TRADE ZONE sekarang: $${bLow} – $${bHigh} — Jangan pencet apapun di sini Sayang! Harga di tengah EQ.`
        : `🚫 NO-TRADE ZONE (EQ M15): $${bLow} – $${bHigh} — Harga saat ini di luar zona ini; tetap jangan entry bila harga masuk ke tengah EQ.`;
    }
  }

  /* ── Master Update ── */
  function updateAll(ctx) {
    if (!ctx) return;
    updateHeroCard(ctx);
    updateDealingRange(ctx);
    renderPOICards(ctx);
    const lastEl = $('dashboard-last-update');
    if (lastEl) {
      lastEl.textContent = '🔄 Terakhir diperbarui: ' + getWITA();
    }
  }

  /* ── Listeners ── */
  window.addEventListener('amyfx:market-context', event => {
    const ctx = event?.detail;
    if (ctx) updateAll(ctx);
  });

  window.addEventListener('amyfx:twelvedata-price', event => {
    const p = Number(event?.detail?.price);
    if (Number.isFinite(p) && p > 0) {
      applyHeroPrice(p);
      if (window.amyfxLastContext) updateDealingRange(window.amyfxLastContext);
    }
  });

  window.addEventListener('amyfx:live-price-display', event => {
    const p = Number(event?.detail?.price);
    if (Number.isFinite(p) && p > 0) applyHeroPrice(p);
  });

  /* ── Init ── */
  function init() {
    startClock();
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
