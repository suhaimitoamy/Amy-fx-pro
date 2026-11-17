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

    // Target angka persis untuk narasi
    const numVal = v => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : null; };
    const demandRef = numVal(ctx.m15?.poi?.side === 'BUY' ? ctx.m15?.poi?.low : null) || numVal(rLow) || numVal(dashboard?.ssl);
    const demandHi  = numVal(ctx.m15?.poi?.side === 'BUY' ? ctx.m15?.poi?.high : null) || numVal(rLow);
    const supplyRef = numVal(ctx.m15?.poi?.side === 'SELL' ? ctx.m15?.poi?.high : null) || numVal(rHigh) || numVal(dashboard?.bsl);
    const supplyLo  = numVal(ctx.m15?.poi?.side === 'SELL' ? ctx.m15?.poi?.low : null) || numVal(rHigh);

    const demandLabel = (demandRef && demandHi && Math.abs(demandHi - demandRef) >= 0.01) ? `$${fmt(demandRef)}–$${fmt(demandHi)}` : (demandRef ? `$${fmt(demandRef)}` : 'Demand');
    const supplyLabel = (supplyLo && supplyRef && Math.abs(supplyLo - supplyRef) >= 0.01) ? `$${fmt(supplyLo)}–$${fmt(supplyRef)}` : (supplyRef ? `$${fmt(supplyRef)}` : 'Supply');

    const pipsToDemand = (Number.isFinite(livePrice) && demandRef) ? Math.max(0, ((livePrice - demandRef) * 10)).toFixed(1) : null;
    const pipsToSupply = (Number.isFinite(livePrice) && supplyRef) ? Math.max(0, ((supplyRef - livePrice) * 10)).toFixed(1) : null;

    // Banner Utama: Prioritas Arah Scalper MTF-First
    const bannerEl = $('hero-bias-banner');
    if (bannerEl) {
      let bannerClass = 'bias-neutral';
      let bannerText = '🧭 MENUNGGU DATA BIAS...';

      const isPremiumZone = Number.isFinite(eqVal) && livePrice > (eqVal + 0.5);
      const isDiscountZone = Number.isFinite(eqVal) && livePrice < (eqVal - 0.5);

      if (m15Dir === -1 && m5Dir === -1) {
        bannerClass = 'bias-bearish';
        bannerText = h1Dir === 1
          ? '🧭 BIAS SCALPER: TEKANAN BEARISH (M15/M5) — KOREKSI MENGUJI DEMAND HTF'
          : '🧭 BIAS SCALPER: BEARISH TREN KUAT (H1+M15 SELARAS)';
      } else if (m15Dir === 1 && m5Dir === 1) {
        bannerClass = 'bias-bullish';
        bannerText = h1Dir === -1
          ? '🧭 BIAS SCALPER: REBOUND BULLISH (M15/M5) — PULLBACK MENGUJI SUPPLY HTF'
          : '🧭 BIAS SCALPER: BULLISH TREN KUAT (H1+M15 SELARAS)';
      } else if (h1Dir === -1 && m15Dir === 1) {
        bannerClass = 'bias-pullback';
        bannerText = '🧭 BIAS SCALPER: PULLBACK NAIK (M15) — MENGUJI SUPPLY BEAR HTF';
      } else if (h1Dir === 1 && m15Dir === -1) {
        bannerClass = 'bias-pullback';
        bannerText = '🧭 BIAS SCALPER: KOREKSI TURUN (M15) — MENGUJI DEMAND BULL HTF';
      } else if (m15Dir === 1 && isPremiumZone) {
        bannerClass = 'bias-bullish';
        bannerText = '🧭 BIAS SCALPER: BULLISH LOKAL (M15) — MENGUJI ZONA PREMIUM';
      } else if (m15Dir === -1 && isDiscountZone) {
        bannerClass = 'bias-bearish';
        bannerText = '🧭 BIAS SCALPER: BEARISH LOKAL (M15) — MENGUJI ZONA DISKON';
      } else if (m15Dir === -1 || h1Dir === -1) {
        bannerClass = 'bias-bearish';
        bannerText = '🧭 BIAS SCALPER: BEARISH — SELL PRESSURE DOMINAN';
      } else if (m15Dir === 1 || h1Dir === 1) {
        bannerClass = 'bias-bullish';
        bannerText = '🧭 BIAS SCALPER: BULLISH — BUY MOMENTUM AKTIF';
      }

      bannerEl.className = `hero-bias-banner ${bannerClass}`;
      bannerEl.textContent = bannerText;
    }

    // Warning Counter-trend & Premium/Discount (Dinamis Dua Arah)
    const warnEl = $('hero-warning');
    if (warnEl) {
      const isPremiumBuy = m15Dir === 1 && Number.isFinite(eqVal) && livePrice > (eqVal + 0.5);
      const isDiscountSell = m15Dir === -1 && Number.isFinite(eqVal) && livePrice < (eqVal - 0.5);

      if (h1Dir === 1 && m15Dir === -1) {
        const dStr = pipsToDemand ? ` (${pipsToDemand} pips lagi)` : '';
        warnEl.textContent = `⚠️ WASPADA: Harga sedang koreksi turun (M15/M5 Bear) mendekati area Demand ${demandLabel}${dStr}. Hindari mengejar Sell di harga bawah/diskon, tunggu konfirmasi pantulan Buy!`;
        warnEl.hidden = false;
      } else if (h1Dir === -1 && m15Dir === 1) {
        const sStr = pipsToSupply ? ` (${pipsToSupply} pips lagi)` : '';
        warnEl.textContent = `⚠️ WASPADA: Ini bukan sinyal Buy bebas. Ini hanya kenaikan pullback sementara di tren Bear HTF mendekati Supply ${supplyLabel}${sStr}. Waspadai pembalikan turun!`;
        warnEl.hidden = false;
      } else if (isPremiumBuy) {
        warnEl.textContent = `⚠️ WASPADA: Harga berada di ZONA PREMIUM (>50% EQ). Dilarang FOMO Buy di pucuk, tunggu retest Demand ${demandLabel} atau pembalikan di Supply ${supplyLabel}!`;
        warnEl.hidden = false;
      } else if (isDiscountSell) {
        warnEl.textContent = `⚠️ WASPADA: Harga berada di ZONA DISKON (<50% EQ). Dilarang FOMO Sell di dasar, tunggu retest Supply ${supplyLabel} atau pembalikan di Demand ${demandLabel}!`;
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

    // Kesimpulan Bernarasi dengan Angka Presisi
    const conclusionEl = $('hero-conclusion');
    if (conclusionEl) {
      if (h1Dir === -1 && m15Dir === 1) {
        conclusionEl.innerHTML = `Trend HTF <strong>BEARISH</strong>, namun momentum lokal sedang <strong>PULLBACK NAIK (M15)</strong> menuju Supply <strong>${supplyLabel}</strong> (${pipsToSupply ? `${pipsToSupply} pips di atas harga` : 'Supply atas'}). Smart Money sedang mencari likuiditas premium sebelum dump lanjutan.`;
      } else if (h1Dir === 1 && m15Dir === -1) {
        conclusionEl.innerHTML = `Trend HTF <strong>BULLISH</strong>, namun momentum scalper sedang <strong>KOREKSI TURUN (M15/M5 Bear)</strong> menuju area Demand/SSL <strong>${demandLabel}</strong> (${pipsToDemand ? `${pipsToDemand} pips di bawah harga` : 'area dasar'}). Disiplin menanti konfirmasi reaksi pantulan (MSS M5 / absorption wick) sebelum eksekusi Buy.`;
      } else if (m15Dir === 1 && isPremiumZone) {
        conclusionEl.innerHTML = `Momentum lokal dikuasai oleh <strong>BUYER (M15)</strong>, namun harga sudah berada di <strong>ZONA PREMIUM</strong>. Disiplin menanti jemputan di Demand <strong>${demandLabel}</strong> atau amati rejection di Supply <strong>${supplyLabel}</strong>.`;
      } else if (m15Dir === 1) {
        conclusionEl.innerHTML = `Momentum pasar dikuasai oleh <strong>BUYER (M15)</strong>. Struktur membentuk Higher High / Higher Low menuju target BSL <strong>${supplyLabel}</strong>.`;
      } else if (m15Dir === -1 && Number.isFinite(rLow) && livePrice > 0 && livePrice < rLow) {
        conclusionEl.innerHTML = `Trend pasar didominasi oleh <strong>SELLER (M15)</strong>. Harga sudah <strong>BREAKDOWN / SWEEP</strong> di bawah Range Low ($${fmt(rLow)}). Waspadai potensi rejection/rebound kilat (Judas Swing) di area SSL <strong>${demandLabel}</strong>!`;
      } else if (m15Dir === -1) {
        conclusionEl.innerHTML = `Trend pasar didominasi oleh <strong>SELLER (M15)</strong>. Harga bergerak menuju SSL <strong>${demandLabel}</strong>. Cari setup Sell on Rally di zona Premium Supply <strong>${supplyLabel}</strong>.`;
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

    const origRHigh = Number(dr.rangeHigh ?? dr.high);
    const origRLow  = Number(dr.rangeLow ?? dr.low);
    let rHigh = origRHigh;
    let rLow  = origRLow;
    const livePrice = Number(window.amyfxCurrentPrice) || Number(ctx.price) || Number(dashboard?.candle?.close) || 0;

    const isSslSwept = livePrice > 0 && Number.isFinite(origRLow) && livePrice < origRLow;
    const isBslSwept = livePrice > 0 && Number.isFinite(origRHigh) && livePrice > origRHigh;

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

    // Tampilkan label angka M15 Dealing Range (dengan deteksi Swept)
    const bslEl = $('dr-bsl-val');
    if (bslEl) bslEl.textContent = Number.isFinite(origRHigh) ? (isBslSwept ? `$${fmt(origRHigh)} (SWEPT)` : '$' + fmt(origRHigh)) : '—';
    const eqEl  = $('dr-eq-val');  if (eqEl)  eqEl.textContent  = Number.isFinite(eqVal) ? `$${fmt(eqVal)} (${pct}%)` : '—';
    const sslEl = $('dr-ssl-val');
    if (sslEl) sslEl.textContent = Number.isFinite(origRLow) ? (isSslSwept ? `$${fmt(origRLow)} (SWEPT)` : '$' + fmt(origRLow)) : '—';

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

    // Status badge dinamis dengan deteksi sapuan likuiditas (SSL/BSL Swept)
    const badge = $('dr-status-badge');
    if (badge) {
      let cls = 'zone-eq', text = '';
      if (isSslSwept) {
        cls = 'zone-discount';
        const sweepDiff = (origRLow - livePrice).toFixed(2);
        text = `🟢 M15 di ${pct}% (EXTREME DISCOUNT — SSL SWEPT). Lantai Range Low ($${fmt(origRLow)}) telah tersapu (-$${sweepDiff}). Siaga konfirmasi pembalikan Buy!`;
      } else if (isBslSwept) {
        cls = 'zone-premium';
        const sweepDiff = (livePrice - origRHigh).toFixed(2);
        text = `🔴 M15 di ${pct}% (EXTREME PREMIUM — BSL SWEPT). Atap Range High ($${fmt(origRHigh)}) telah tersapu (+$${sweepDiff}). Waspadai false breakout / rejection Sell!`;
      } else if (pct > 75) {
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

    // ── KUMPULKAN ORDER BLOCKS (OB) DARI SELURUH SUMBER ENGINE ──
    const rawObs = [
      ...(Array.isArray(window.amyfxLastIndicators?.poi?.ob) ? window.amyfxLastIndicators.poi.ob : []),
      ...(Array.isArray(amy?.visuals?.ob) ? amy.visuals.ob : []),
      ...(Array.isArray(amy?.obs) ? amy.obs : []),
      ...(Array.isArray(ctx.orderBlocks) ? ctx.orderBlocks : []),
      ...(Array.isArray(ctx.m15?.orderBlocks) ? ctx.m15.orderBlocks : [])
    ];

    // Sertakan POI aktif M15 jika tersedia
    const m15Poi = ctx.m15?.poi;
    if (m15Poi && Number.isFinite(num(m15Poi.low)) && Number.isFinite(num(m15Poi.high)) && isActiveZone(m15Poi)) {
      rawObs.push({
        side: String(m15Poi.side || (m15Poi.dir === 1 ? 'BUY' : 'SELL')).toUpperCase(),
        direction: String(m15Poi.direction || (m15Poi.dir === 1 ? 'BULLISH' : 'BEARISH')).toUpperCase(),
        bot: num(m15Poi.low),
        top: num(m15Poi.high),
        ce: num(m15Poi.ce) || (num(m15Poi.low) + num(m15Poi.high)) / 2,
        label: `M15 ${m15Poi.kind || 'POI'} ⭐`,
        mitigated: false
      });
    }

    // Ekstrak Supply [RBD/DBD] & Demand [DBR/RBR] dari Twelve Data Dashboard
    const supStr = String(dashboard?.dashboard_rows?.['7_supply_mtf'] || dashboard?.supply || '');
    const supMatch = supStr.match(/Supply\s*\[(.*?)\]\s*([\d.]+)[-\s]+([\d.]+)/i);
    if (supMatch) {
      const sLo = num(supMatch[2]), sHi = num(supMatch[3]);
      if (Number.isFinite(sLo) && Number.isFinite(sHi) && sHi > sLo) {
        rawObs.push({
          side: 'SELL',
          direction: 'BEARISH',
          bot: sLo, top: sHi, low: sLo, high: sHi,
          ce: (sLo + sHi) / 2,
          label: `Supply [${supMatch[1] || 'OB'}] M15 ⭐`,
          kind: supMatch[1] || 'OB',
          mitigated: false
        });
      }
    }

    const demStr = String(dashboard?.dashboard_rows?.['8_demand_mtf'] || dashboard?.demand || '');
    const demMatch = demStr.match(/Demand\s*\[(.*?)\]\s*([\d.]+)[-\s]+([\d.]+)/i);
    if (demMatch) {
      const dLo = num(demMatch[2]), dHi = num(demMatch[3]);
      if (Number.isFinite(dLo) && Number.isFinite(dHi) && dHi > dLo) {
        rawObs.push({
          side: 'BUY',
          direction: 'BULLISH',
          bot: dLo, top: dHi, low: dLo, high: dHi,
          ce: (dLo + dHi) / 2,
          label: `Demand [${demMatch[1] || 'OB'}] M15 ⭐`,
          kind: demMatch[1] || 'OB',
          mitigated: false
        });
      }
    }

    const obZoneOf = o => {
      const lo = num(o.bot ?? o.low ?? o.zoneLow);
      const hi = num(o.top ?? o.high ?? o.zoneHigh);
      const ce = num(o.ce ?? o.meanThreshold) || (lo + hi) / 2;
      const label = o.label || (String(o.side).toUpperCase() === 'BUY' ? '+OB Demand M15' : '-OB Supply M15');
      return { lo, hi, ce, label, raw: o };
    };

    const isBearOb = o => {
      const s = String(o.side || o.direction || o.bias || '').toUpperCase();
      return (s === 'SELL' || s === 'BEARISH' || s === '-OB' || o.dir === -1) && isActiveZone(o);
    };
    const isBullOb = o => {
      const s = String(o.side || o.direction || o.bias || '').toUpperCase();
      return (s === 'BUY' || s === 'BULLISH' || s === '+OB' || o.dir === 1) && isActiveZone(o);
    };

    const dedupeZones = arr => arr.filter((z, i) => arr.findIndex(y => Math.abs(y.lo - z.lo) < 0.2 && Math.abs(y.hi - z.hi) < 0.2) === i);
    const uniqueBearOBs = dedupeZones(rawObs.filter(isBearOb).map(obZoneOf).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi)));
    const uniqueBullOBs = dedupeZones(rawObs.filter(isBullOb).map(obZoneOf).filter(z => Number.isFinite(z.lo) && Number.isFinite(z.hi)));

    // Kandidat likuiditas riil (Target TP & Batas Invalidasi)
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

    // ── Table SELL SETUP (Anatomi ICT: Entry OB/FVG -> Target TP -> Invalidasi) ──
    const sellTbody = $('sell-poi-tbody');
    let primarySellZone = null;
    if (sellTbody) {
      const sellRows = [];

      // 1. ENTRY UTAMA: Order Block (OB / Supply M15) di atas atau menguji harga
      uniqueBearOBs
        .filter(z => z.hi >= livePrice - 0.5)
        .sort((a, b) => a.lo - b.lo)
        .slice(0, 2)
        .forEach(z => {
          sellRows.push({
            poi: `🎯 Entry [OB]: ${z.label}`,
            level: fmtRange(z.lo, z.hi),
            note: `50% MT: $${fmt(z.ce)} — Area jemputan Sell institusi`
          });
          if (!primarySellZone) primarySellZone = { low: z.lo, high: z.hi, ce: z.ce };
        });

      // 2. ENTRY CADANGAN: Fair Value Gap (FVG Bearish)
      bearFVGs.map(zoneOf)
        .filter(z => Number.isFinite(z.hi) && z.hi >= livePrice - 0.5)
        .sort((a, b) => a.lo - b.lo)
        .slice(0, 2)
        .forEach((z, i) => {
          sellRows.push({
            poi: `🎯 Entry [FVG]: Bearish FVG #${i + 1}`,
            level: fmtRange(z.lo, z.hi),
            note: `50% CE: $${fmt(z.ce)} — Mitigasi FVG premium`
          });
          if (!primarySellZone) primarySellZone = { low: z.lo, high: z.hi, ce: z.ce };
        });

      // 3. Status jika belum ada zona OB/FVG terbentuk
      if (!primarySellZone) {
        sellRows.push({
          poi: '⏳ Status OB & FVG',
          level: 'Belum Ada',
          note: 'Belum ada OB/FVG terbentuk di atas harga — Dilarang Sell sampai zona terbentuk!'
        });
      }

      // 4. TARGET LIKUIDITAS (Take Profit): SSL di bawah harga
      liqBelow.slice(0, 2).forEach(x => {
        const dist = livePrice - x.v;
        const noteText = dist > 0
          ? `-$${fmt(dist)} di bawah harga — Likuiditas SSL (Target TP)`
          : `✅ SUDAH TERCAPAI (Hit di $${fmt(x.v)}) — Level likuiditas terpanen!`;
        sellRows.push({
          poi: dist > 0 ? `🏁 Target TP: ${x.name}` : `✅ TP Hit: ${x.name}`,
          level: '$' + fmt(x.v),
          note: noteText
        });
      });

      // 5. BATAS RISIKO (Invalidasi / SL): BSL di atas harga
      const primaryInvalidasiSell = liqAbove.length ? liqAbove[0] : null;
      if (primaryInvalidasiSell) {
        sellRows.push({
          poi: `🛑 Invalidasi: ${primaryInvalidasiSell.name}`,
          level: '$' + fmt(primaryInvalidasiSell.v),
          note: `+$${fmt(primaryInvalidasiSell.v - livePrice)} di atas harga — Batas SL (Protected High)`
        });
      }

      sellTbody.innerHTML = sellRows.length ? sellRows.map(r =>
        `<tr><td>${esc(r.poi)}</td><td>${esc(r.level)}</td><td>${esc(r.note)}</td></tr>`
      ).join('') : `<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:12px;">Belum ada Supply/BSL tervalidasi di atas harga.</td></tr>`;
    }

    // SOP Sell Presisi — TP wajib DI BAWAH entry (SSL riil terdekat di bawah zona)
    const sopSell = $('sell-sop-list');
    if (sopSell) {
      const entryLo = primarySellZone?.low;
      const entryHi = primarySellZone?.high;
      const entryCe = primarySellZone?.ce;
      const tpCand = Number.isFinite(entryLo) ? (liqBelow.find(x => x.v < entryLo && x.v < livePrice) || liqBelow[0]) : null;
      if (!Number.isFinite(entryLo) || !Number.isFinite(entryHi)) {
        sopSell.innerHTML = '<li>Belum ada Order Block (OB) atau FVG di atas harga — <strong>JANGAN ENTRY SELL</strong>, tunggu engine membentuk zona jemputan.</li>';
      } else {
        const tp = tpCand?.v;
        const primaryInvalidasiSell = liqAbove.length ? liqAbove[0] : null;
        const invalidasiHi = primaryInvalidasiSell ? primaryInvalidasiSell.v : entryHi;
        // SL Aman wajib di atas Protected High / Invalidasi DAN di atas puncak zona Supply
        const trueSlBoundary = Math.max(entryHi, invalidasiHi);
        const slLevel = (trueSlBoundary + 0.40).toFixed(2); // Napas spread XAUUSDc +$0.40
        sopSell.innerHTML = [
          `<li><strong>Area Entry:</strong> tunggu retest/sweep Supply/OB $${fmt(entryLo)} – $${fmt(entryHi)} (50% MT/CE: $${fmt(entryCe)}) + Rejection M5</li>`,
          Number.isFinite(tp)
            ? `<li><strong>Target TP:</strong> $${fmt(tp)} (${esc(tpCand.name)})</li><li><strong>TP dengan napas spread XAUUSDc:</strong> pasang di <strong>$${fmt(tp + 0.50)}</strong> (agar terjemput Ask)</li>`
            : '<li><strong>Target TP:</strong> Range Low / SSL M15.</li>',
          `<li><strong>SL Aman:</strong> di atas <strong>$${slLevel}</strong> (Protected High $${fmt(trueSlBoundary)} + $0.40 napas spread)</li>`
        ].join('');
      }
    }

    // ── Table BUY SETUP (Anatomi ICT: Entry OB/FVG -> Target TP -> Invalidasi) ──
    const buyTbody = $('buy-poi-tbody');
    let primaryBuyZone = null;
    if (buyTbody) {
      const buyRows = [];

      // 1. ENTRY UTAMA: Order Block (Demand / +OB M15) di bawah atau menguji harga
      uniqueBullOBs
        .filter(z => z.lo <= livePrice + 0.5)
        .sort((a, b) => b.hi - a.hi)
        .slice(0, 2)
        .forEach(z => {
          buyRows.push({
            poi: `🎯 Entry [OB]: ${z.label}`,
            level: fmtRange(z.lo, z.hi),
            note: `50% MT: $${fmt(z.ce)} — Area jemputan Buy institusi`
          });
          if (!primaryBuyZone) primaryBuyZone = { low: z.lo, high: z.hi, ce: z.ce };
        });

      // 2. ENTRY CADANGAN: Fair Value Gap (FVG Bullish Diskon)
      bullFVGs.map(zoneOf)
        .filter(z => Number.isFinite(z.lo) && z.lo <= livePrice + 0.5)
        .sort((a, b) => b.hi - a.hi)
        .slice(0, 2)
        .forEach((z, i) => {
          buyRows.push({
            poi: `🎯 Entry [FVG]: Bullish FVG #${i + 1}`,
            level: fmtRange(z.lo, z.hi),
            note: `50% CE: $${fmt(z.ce)} — Mitigasi FVG diskon`
          });
          if (!primaryBuyZone) primaryBuyZone = { low: z.lo, high: z.hi, ce: z.ce };
        });

      // 3. Status jika belum ada zona OB/FVG terbentuk
      if (!primaryBuyZone) {
        buyRows.push({
          poi: '⏳ Status OB & FVG',
          level: 'Belum Ada',
          note: 'Belum ada OB/FVG terbentuk di bawah harga — Dilarang Buy sampai zona terbentuk!'
        });
      }

      // 4. TARGET LIKUIDITAS (Take Profit): BSL di atas harga
      liqAbove.slice(0, 2).forEach(x => {
        const dist = x.v - livePrice;
        const noteText = dist > 0
          ? `+$${fmt(dist)} di atas harga — Likuiditas BSL (Target TP)`
          : `✅ SUDAH TERCAPAI (Hit di $${fmt(x.v)}) — Level likuiditas terpanen!`;
        buyRows.push({
          poi: dist > 0 ? `🏁 Target TP: ${x.name}` : `✅ TP Hit: ${x.name}`,
          level: '$' + fmt(x.v),
          note: noteText
        });
      });

      // 5. BATAS RISIKO (Invalidasi / SL): SSL di bawah harga
      const primaryInvalidasiBuy = liqBelow.length ? liqBelow[0] : null;
      if (primaryInvalidasiBuy) {
        buyRows.push({
          poi: `🛑 Invalidasi: ${primaryInvalidasiBuy.name}`,
          level: '$' + fmt(primaryInvalidasiBuy.v),
          note: `-$${fmt(livePrice - primaryInvalidasiBuy.v)} di bawah harga — Batas SL (Protected Low)`
        });
      }

      buyTbody.innerHTML = buyRows.length ? buyRows.map(r =>
        `<tr><td>${esc(r.poi)}</td><td>${esc(r.level)}</td><td>${esc(r.note)}</td></tr>`
      ).join('') : `<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:12px;">Belum ada Demand/SSL tervalidasi di bawah harga.</td></tr>`;

      // SOP Buy Presisi (Napas Spread XAUUSDc)
      const sopBuy = $('buy-sop-list');
      if (sopBuy) {
        const entryLo = primaryBuyZone?.low;
        const entryHi = primaryBuyZone?.high;
        const entryCe = primaryBuyZone?.ce;
        const tpCand = Number.isFinite(entryHi) ? (liqAbove.find(x => x.v > entryHi && x.v > livePrice) || liqAbove[0]) : null;
        if (!Number.isFinite(entryLo) || !Number.isFinite(entryHi)) {
          sopBuy.innerHTML = '<li>Belum ada Order Block (OB) atau FVG di bawah harga — <strong>JANGAN ENTRY BUY</strong>, tunggu engine membentuk zona jemputan diskon.</li>';
        } else {
          const tp = tpCand?.v || (rHigh ? (rHigh + (entryLo || 0)) / 2 : (entryHi + 10.0));
          const primaryInvalidasiBuy = liqBelow.length ? liqBelow[0] : null;
          const invalidasiLo = primaryInvalidasiBuy ? primaryInvalidasiBuy.v : entryLo;
          // SL Aman wajib di bawah Protected Low / Invalidasi DAN di bawah dasar zona Demand
          const trueBuySlBoundary = Math.min(entryLo, invalidasiLo);
          const limitOrder = (entryLo + 0.40).toFixed(2); // Napas spread XAUUSDc (+0.40)
          const slLevel = (trueBuySlBoundary - 0.40).toFixed(2);    // Napas spread SL (-0.40)
          sopBuy.innerHTML = [
            `<li><strong>Area Entry:</strong> tunggu sweep Demand/OB $${fmt(entryLo)} – $${fmt(entryHi)} (50% MT/CE: $${fmt(entryCe)}) + Rejection M5</li>`,
            `<li><strong>Pending Order (Napas Spread XAUUSDc):</strong> pasang Buy Limit di <strong>$${limitOrder}</strong> (+$0.40 agar tersamber Ask)</li>`,
            Number.isFinite(tp)
              ? `<li><strong>Target TP:</strong> $${fmt(tp)} (${esc(tpCand?.name || 'Range EQ')})</li>`
              : '<li><strong>Target TP:</strong> Range EQ M15.</li>',
            `<li><strong>SL Aman:</strong> di bawah <strong>$${slLevel}</strong> (Protected Low $${fmt(trueBuySlBoundary)} - $0.40 napas spread)</li>`
          ].join('');
        }
      }
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

    let pct = 50;
    if (zoneLabelEl && Number.isFinite(rHigh) && Number.isFinite(rLow) && livePrice > 0) {
      pct = Math.min(100, Math.max(0, Math.round(((livePrice - rLow) / (rHigh - rLow)) * 100)));
      if (pct > 75)        zoneLabelEl.textContent = `(zona EXTREME PREMIUM ${pct}%)`;
      else if (pct > 52.5) zoneLabelEl.textContent = `(zona PREMIUM ${pct}%)`;
      else if (pct < 25)   zoneLabelEl.textContent = `(zona EXTREME DISCOUNT ${pct}%)`;
      else if (pct < 47.5) zoneLabelEl.textContent = `(zona DISCOUNT ${pct}%)`;
      else                 zoneLabelEl.textContent = `(zona abu-abu EQ ${pct}%)`;
    }

    // ── Zone-Gated Hierarchy: Tukar posisi kartu BUY/SELL & Peringatan Zona ──
    const sellCard = $('card-poi-sell');
    const buyCard  = $('card-poi-buy');
    const isDiscount = pct < 47.5;
    const isPremium = pct > 52.5;

    if (sellCard && buyCard && sellCard.parentNode === buyCard.parentNode) {
      if (isDiscount) {
        // Diskon: BUY Card tampil pertama di atas SELL Card
        sellCard.parentNode.insertBefore(buyCard, sellCard);
      } else if (isPremium) {
        // Premium: SELL Card tampil pertama di atas BUY Card
        sellCard.parentNode.insertBefore(sellCard, buyCard);
      }
    }

    // Peringatan larangan Sell di Diskon
    let sellWarn = $('poi-sell-zone-ban');
    if (!sellWarn && sellCard) {
      sellWarn = document.createElement('div');
      sellWarn.id = 'poi-sell-zone-ban';
      sellWarn.className = 'poi-warning-box';
      sellCard.insertBefore(sellWarn, sellCard.querySelector('table'));
    }
    if (sellWarn) {
      if (isDiscount) {
        sellWarn.style.cssText = 'border-left-color: #ef4444; background: rgba(239, 68, 68, 0.1); margin-bottom: 12px; color: #FCA5A5;';
        sellWarn.innerHTML = `🚫 <strong>DILARANG ENTRY SELL DI HARGA SEKARANG!</strong> Harga saat ini di ZONA DISKON (${pct}%). Hukum ICT melarang Sell di diskon. Sell HANYA valid jika harga pullback naik kembali ke Supply Premium ($${fmt(sellLabelZone?.low)} – $${fmt(sellLabelZone?.high)}).`;
        sellWarn.hidden = false;
      } else {
        sellWarn.hidden = true;
      }
    }

    // Peringatan larangan Buy di Premium
    let buyWarn = $('poi-buy-zone-ban');
    if (!buyWarn && buyCard) {
      buyWarn = document.createElement('div');
      buyWarn.id = 'poi-buy-zone-ban';
      buyWarn.className = 'poi-warning-box';
      buyCard.insertBefore(buyWarn, buyCard.querySelector('table'));
    }
    if (buyWarn) {
      if (isPremium) {
        buyWarn.style.cssText = 'border-left-color: #ef4444; background: rgba(239, 68, 68, 0.1); margin-bottom: 12px; color: #FCA5A5;';
        buyWarn.innerHTML = `🚫 <strong>DILARANG FOMO BUY DI SINI!</strong> Harga berada di ZONA PREMIUM (${pct}%). Dilarang Buy di pucuk. Buy HANYA valid jika harga diskon turun ke Demand ($${fmt(buyLabelZone?.low)} – $${fmt(buyLabelZone?.high)}).`;
        buyWarn.hidden = false;
      } else {
        buyWarn.hidden = true;
      }
    }

    const sellZoneEl = $('sell-zone-label');
    if (sellZoneEl) {
      const ceStr = primarySellZone?.ce ? ` (50% CE: $${fmt(primarySellZone.ce)})` : '';
      sellZoneEl.textContent = sellLabelZone
        ? (Math.abs(sellLabelZone.high - sellLabelZone.low) < 0.01 ? `$${fmt(sellLabelZone.high)}` : `$${fmt(sellLabelZone.low)}–$${fmt(sellLabelZone.high)}${ceStr}`)
        : 'zona supply (belum tervalidasi)';
    }

    const buyZoneEl = $('buy-zone-label');
    if (buyZoneEl) {
      const ceStr = primaryBuyZone?.ce ? ` (50% CE/MT: $${fmt(primaryBuyZone.ce)})` : '';
      buyZoneEl.textContent = buyLabelZone
        ? (Math.abs(buyLabelZone.high - buyLabelZone.low) < 0.01 ? `$${fmt(buyLabelZone.low)}` : `$${fmt(buyLabelZone.low)}–$${fmt(buyLabelZone.high)}${ceStr}`)
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
