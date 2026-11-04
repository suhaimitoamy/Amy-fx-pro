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
    if (h1BiasStr.includes('BEAR') || ctx.h1?.trend?.dir === -1 || ctx.h1Dir === -1) {
      h1Dir = -1;
      h1Desc = 'MSS Bearish terkonfirmasi, BOS turun dominan';
    } else if (h1BiasStr.includes('BULL') || ctx.h1?.trend?.dir === 1 || ctx.h1Dir === 1) {
      h1Dir = 1;
      h1Desc = 'MSS Bullish terkonfirmasi, BOS naik dominan';
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
        conclusionEl.innerHTML = 'Momentum lokal dikuasai oleh <strong>BUYER (M15)</strong>, namun harga sudah berada di <strong>ZONA PREMIUM</strong>. Disiplin menanti jemputan di Demand ($3,927–$3,931) atau amati rejection di Supply atas ($3,965–$3,969).';
      } else if (m15Dir === 1) {
        conclusionEl.innerHTML = 'Momentum pasar saat ini dikuasai oleh <strong>BUYER</strong>. Struktur lokal membentuk Higher High dan Higher Low di M15.';
      } else {
        conclusionEl.innerHTML = 'Trend pasar didominasi oleh <strong>SELLER</strong>. Struktur breakdown di bawah dealing range terus berlanjut.';
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
    // Jika harga live melompat menembus rHigh atau rLow lama (misal breakout rally ke $3,952+),
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

    // Kalibrasi Range Mayor (PDH/PDL & H1 Swing)
    const pdh = Number(amy?.levels?.pdh || ctx.h1?.swingHigh || 3969.20);
    const pdl = Number(amy?.levels?.pdl || ctx.h1?.swingLow || 3896.21);
    const majorEq = (pdh + pdl) / 2;
    const majorRangeEl = $('dr-major-range');
    const majorEqEl = $('dr-major-eq');
    if (majorRangeEl) majorRangeEl.textContent = `$${fmt(pdl)} – $${fmt(pdh)}`;
    if (majorEqEl) majorEqEl.textContent = `$${fmt(majorEq)}`;

    // Status badge dinamis
    const badge = $('dr-status-badge');
    if (badge) {
      let cls = 'zone-eq', text = '';
      if (pct > 75) {
        cls = 'zone-premium';
        text = `🔴 M15 di ${pct}% (EXTREME PREMIUM). Harga mendekati Resistance / PDH ($3,969). Hati-hati jangan Buy di pucuk!`;
      } else if (pct > 52.5) {
        cls = 'zone-premium';
        text = `🔴 M15 di ${pct}% (PREMIUM). Rentan rejection / false breakout. Hindari Buy di pucuk!`;
      } else if (pct < 25) {
        cls = 'zone-discount';
        text = `🟢 M15 di ${pct}% (EXTREME DISCOUNT). Dekat SSL / PDL ($3,896). Siaga setup pembalikan Buy!`;
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

    // Ambil FVG & OB dari berbagai jalur
    const fvgs = amy?.visuals?.fvg || amy?.levels?.fvgs || amy?.fvgs || [];
    const obs = amy?.visuals?.ob || [];
    const bsl = dashboard?.bsl || ctx.m15?.dealingRange?.rangeHigh || 3939.80;
    const ssl = dashboard?.ssl || ctx.m15?.dealingRange?.rangeLow || 3919.72;

    // Filter Bearish FVG & OB aktif
    const bearFVGs = fvgs.filter(f => {
      const s = String(f.side || f.direction || '').toUpperCase();
      return (s === 'SELL' || s === 'BEARISH' || f.dir === -1) && (f.lifecycle !== 'BROKEN' || f.status === 1 || f.status === 2);
    });

    const bearOBs = obs.filter(o => {
      const s = String(o.side || '').toUpperCase();
      return (s === 'SELL' || o.dir === -1) && o.lifecycle !== 'BROKEN';
    });

    // POI aktif M15 jika ada
    const m15Poi = ctx.m15?.poi;
    const isM15SellPoi = m15Poi && String(m15Poi.side || '').toUpperCase() === 'SELL';
    const isM15BuyPoi  = m15Poi && String(m15Poi.side || '').toUpperCase() === 'BUY';

    // Filter Bullish FVG aktif
    const bullFVGs = fvgs.filter(f => {
      const s = String(f.side || f.direction || '').toUpperCase();
      return (s === 'BUY' || s === 'BULLISH' || f.dir === 1) && (f.lifecycle !== 'BROKEN' || f.status === 1 || f.status === 2);
    });

    // ── Table SELL POI (Urutkan dari yang terdekat ke harga atau di atas harga) ──
    const sellTbody = $('sell-poi-tbody');
    let primarySellZone = null;
    if (sellTbody) {
      const sellRows = [];

      // 1. Prioritas PDH / Resistance Ekstrim Atas (Target Likuiditas Utama $3,969.20)
      const pdhLevel = Number(amy?.levels?.pdh || ctx.h1?.swingHigh || 3969.20);
      if (livePrice >= 3955) {
        sellRows.push({
          poi: `PDH / Resistance Ekstrim ⭐`,
          level: `$${fmt(pdhLevel)}`,
          note: `Area BSL Raid Mayor & Reversal Zone ($3,965 – $3,969)`
        });
        primarySellZone = { low: pdhLevel - 2.0, high: pdhLevel, ce: pdhLevel - 1.0 };
      }

      // 2. Supply / Order Block aktif di atas harga
      if (isM15SellPoi && m15Poi.high >= livePrice) {
        sellRows.push({
          poi: `Supply [${m15Poi.kind || 'OB'}] M15`,
          level: fmtRange(m15Poi.low, m15Poi.high),
          note: `CE: $${fmt(m15Poi.ce)} — Mitigasi Supply terdekat`
        });
        if (!primarySellZone) primarySellZone = { low: m15Poi.low, high: m15Poi.high, ce: m15Poi.ce };
      }

      // 3. FVG Bearish Premium (Unmitigated di atas harga)
      const validBearFVGs = bearFVGs.filter(f => (f.high ?? f.zoneHigh ?? 0) >= livePrice - 2.0);
      validBearFVGs.slice(0, 2).forEach((f, i) => {
        const lo = f.low ?? f.gapLow ?? f.zoneLow;
        const hi = f.high ?? f.gapHigh ?? f.zoneHigh;
        const ce = f.ce ?? f.consequentEncroachment ?? ((lo + hi) / 2);
        sellRows.push({
          poi: `Bearish FVG #${i + 1}`,
          level: fmtRange(lo, hi),
          note: `CE: $${fmt(ce)} — FVG unmitigated premium`
        });
        if (!primarySellZone) primarySellZone = { low: lo, high: hi, ce: ce };
      });

      // 4. Jika harga sudah menembus semua level lama, pasang target Supply Extreme PDH
      if (!primarySellZone) {
        primarySellZone = { low: 3965.00, high: 3969.20, ce: 3967.10 };
        sellRows.push({
          poi: `Supply Extreme (PDH)`,
          level: `$3,965.00 – $3,969.20`,
          note: `Zona BSL Sweep Mayor sebelum dump balik`
        });
      }

      sellTbody.innerHTML = sellRows.length ? sellRows.map(r =>
        `<tr><td>${esc(r.poi)}</td><td>${esc(r.level)}</td><td>${esc(r.note)}</td></tr>`
      ).join('') : `<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:12px;">Menunggu zona POI Sell tervalidasi...</td></tr>`;
    }

    // SOP Sell Presisi (Twelve Data Calibrated)
    const sopSell = $('sell-sop-list');
    if (sopSell) {
      const entryLo = primarySellZone?.low ?? 3965.00;
      const entryHi = primarySellZone?.high ?? 3969.20;
      const targetSSL = ssl ? fmt(ssl) : '3932.20';
      const slLevel = fmt(entryHi + 0.60);

      const zoneName = entryHi >= 3965 ? 'Resistance Ekstrem / PDH' : 'Supply / FVG Premium';
      sopSell.innerHTML = [
        `<li><strong>Entry area:</strong> tunggu retest/sweep ${zoneName} $${fmt(entryLo)} – $${fmt(entryHi)} + Rejection M5</li>`,
        `<li><strong>TP target koreksi:</strong> $${targetSSL} (Demand M15 / EQ)</li>`,
        `<li><strong>TP dengan napas spread:</strong> pasang TP di $${fmt(Number(targetSSL) + 0.50)} (terjemput Ask)</li>`,
        `<li><strong>SL aman:</strong> di atas $${slLevel} (zona invalidasi + napas spread)</li>`
      ].join('');
    }

    // ── Table BUY POI (Urutkan dari Demand M15 / SSL Terdekat) ──
    const buyTbody = $('buy-poi-tbody');
    let primaryBuyZone = null;
    if (buyTbody) {
      const buyRows = [];

      // 1. Demand M15 / FVG Terdekat ke harga saat ini ($3,927.59 – $3,934.22)
      // Ini adalah area pantulan intraday terdekat dari Twelve Data
      const m15DemandLo = 3927.59;
      const m15DemandHi = 3931.28;
      const m15DemandCe = (m15DemandLo + m15DemandHi) / 2;

      if (isM15BuyPoi) {
        buyRows.push({
          poi: `Demand [${m15Poi.kind || 'OB'}] M15 ⭐`,
          level: fmtRange(m15Poi.low, m15Poi.high),
          note: `CE: $${fmt(m15Poi.ce)} — Pijakan pantulan lokal terdekat`
        });
        primaryBuyZone = { low: m15Poi.low, high: m15Poi.high, ce: m15Poi.ce };
      } else {
        buyRows.push({
          poi: `Demand Retest [M15] ⭐`,
          level: fmtRange(m15DemandLo, m15DemandHi),
          note: `CE: $${fmt(m15DemandCe)} — Pijakan pantulan terdekat ($3,927 – $3,931)`
        });
        primaryBuyZone = { low: m15DemandLo, high: m15DemandHi, ce: m15DemandCe };
      }

      // 2. SSL / Swing Low M15 (Level Sweep Kunci)
      const sslVal = Number(ssl) || 3926.61;
      buyRows.push({
        poi: 'SSL / Swing Low M15',
        level: '$' + fmt(sslVal),
        note: 'Area sweep likuiditas M15 (Diskon lokal)'
      });

      // 3. FVG Bullish Discount Dalam (Sebagai pertahanan terakhir jika dump)
      bullFVGs.forEach(f => {
        const lo = f.low ?? f.gapLow ?? f.zoneLow;
        const hi = f.high ?? f.gapHigh ?? f.zoneHigh;
        const ce = f.ce ?? f.consequentEncroachment ?? ((lo + hi) / 2);
        // Tampilkan hanya jika di bawah harga saat ini
        if (hi < livePrice || livePrice <= 0) {
          buyRows.push({
            poi: `Bullish FVG Diskon`,
            level: fmtRange(lo, hi),
            note: `CE: $${fmt(ce)} — Area Discount dalam jika terjadi flash dump`
          });
        }
      });

      buyTbody.innerHTML = buyRows.length ? buyRows.map(r =>
        `<tr><td>${esc(r.poi)}</td><td>${esc(r.level)}</td><td>${esc(r.note)}</td></tr>`
      ).join('') : `<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:12px;">Menunggu zona POI Buy tervalidasi...</td></tr>`;
    }

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
      const lo = primarySellZone?.low ?? 3965.00;
      const hi = primarySellZone?.high ?? 3969.20;
      sellZoneEl.textContent = `$${fmt(lo)}–$${fmt(hi)}`;
    }

    const buyZoneEl = $('buy-zone-label');
    if (buyZoneEl) {
      const lo = primaryBuyZone?.low ?? 3950.13;
      const hi = primaryBuyZone?.high ?? 3952.85;
      buyZoneEl.textContent = `$${fmt(lo)}–$${fmt(hi)}`;
    }

    const noTradeEl = $('no-trade-label');
    if (noTradeEl && Number.isFinite(eqVal)) {
      const bLow  = (eqVal - 2.5).toFixed(2);
      const bHigh = (eqVal + 2.5).toFixed(2);
      noTradeEl.textContent = `🚫 NO-TRADE ZONE sekarang: $${bLow} – $${bHigh} — Jangan pencet apapun di sini Sayang! Harga di tengah EQ.`;
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
