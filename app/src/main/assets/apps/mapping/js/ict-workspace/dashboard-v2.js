/**
 * ICT DASHBOARD V3 — Amy FX Pro Modern Glass Cockpit
 * Menggerakkan:
 *   1. Hero Ringkas (Live Price, Bias 3-TF Horizontal, Telemetri Break/Sweep/DOL)
 *   2. Dealing Range Horizontal Gauge (Discount / EQ 50% / Premium + PDH/PDL)
 *   3. Peta Skenario Prioritas + No-Trade Zone
 *   4. Panel Eksekusi POI Terpadu dengan Tab Switch BUY / SELL + Hitung Lot
 */

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

  /* ── Tab Switch BUY / SELL & Latest Plan Cache (untuk Tombol Hitung Lot) ── */
  let activePoiTab = 'BUY';
  let userLockedTab = false;
  let latestBuyPlan = null;
  let latestSellPlan = null;

  /* ── Jam WITA & Deteksi Sesi Trading Gold ── */
  function getWITA() {
    return new Date().toLocaleTimeString('id-ID', {
      timeZone: 'Asia/Makassar',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WITA';
  }

  function resolveSessionLabel() {
    const now = new Date();
    const nyParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(now);
    const day = nyParts.find(p => p.type === 'weekday')?.value || '';
    const hour = Number(nyParts.find(p => p.type === 'hour')?.value || 0);
    if (day === 'Sat' || (day === 'Fri' && hour >= 17) || (day === 'Sun' && hour < 17)) {
      return 'Pasar Tutup · Akhir Pekan';
    }
    if (hour >= 8 && hour < 12) return 'NY Killzone · Aktif';
    if (hour >= 12 && hour < 17) return 'New York · Sesi Siang';
    if (hour >= 2 && hour < 5) return 'London Killzone · Aktif';
    if (hour >= 5 && hour < 8) return 'London–NY Pre-Open';
    if (hour >= 20 || hour < 2) return 'Sesi Asia';
    return 'Transisi Sesi';
  }

  function updateSessionPill() {
    const el = $('cockpit-session-pill');
    if (el) el.textContent = resolveSessionLabel();
  }

  function startClock() {
    const el = $('hero-clock');
    if (el) el.textContent = getWITA();
    updateSessionPill();
    setInterval(() => {
      const e = $('hero-clock');
      if (e) e.textContent = getWITA();
    }, 1000);
    setInterval(updateSessionPill, 60000);
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
  }

  /* ── Live price sync ── */
  function applyHeroPrice(price) {
    if (!Number.isFinite(price) || price <= 0) return;
    const el = $('hero-price');
    if (el) el.textContent = '$' + price.toFixed(2);
    const sp = $('scenario-price');
    if (sp) sp.textContent = '$' + price.toFixed(2);
  }

  /* ── Single Source of Truth: Dealing Range & EQ (Hero · Gauge · POI · Chart Badge) ── */
  function resolveUnifiedDealingRange(ctx, livePrice) {
    const amy = ctx?.amy || ctx;
    const dashboard = amy?.dashboard;
    const ng = window.amyfxLastIndicators || null;

    const sources = [
      ctx?.m15?.dealingRange,
      ng?.dealingRange,
      amy?.levels?.dealingRange,
      ctx?.dealingRange,
      dashboard
    ];

    let rHigh = NaN;
    let rLow = NaN;
    let eqFallback = NaN;

    for (const src of sources) {
      if (!src) continue;
      const hi = num(src.rangeHigh ?? src.high ?? src.rHigh);
      const lo = num(src.rangeLow ?? src.low ?? src.rLow);
      if (Number.isFinite(hi) && Number.isFinite(lo) && hi > lo) {
        rHigh = hi;
        rLow = lo;
        eqFallback = num(src.eq ?? src.equilibrium);
        break;
      }
    }

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

    if (Number.isFinite(rHigh) && Number.isFinite(rLow) && rHigh > rLow) {
      const location = isDiscount ? 'DISCOUNT' : (isPremium ? 'PREMIUM' : 'EQUILIBRIUM');
      window.amyfxLastDealingRange = {
        rangeHigh: rHigh,
        rangeLow: rLow,
        high: rHigh,
        low: rLow,
        eq,
        equilibrium: eq,
        location
      };

      const badgeEl = $('chart-dealing-range-badge');
      if (badgeEl && livePrice > 0) {
        if (isDiscount) {
          badgeEl.textContent = 'ZONA DISKON (<47.5%) 🟢';
          badgeEl.className = 'dr-badge dr-discount';
        } else if (isPremium) {
          badgeEl.textContent = 'ZONA PREMIUM (>52.5%) 🔴';
          badgeEl.className = 'dr-badge dr-premium';
        } else {
          badgeEl.textContent = 'EQUILIBRIUM 50% · NO-TRADE ⚪';
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
      isSslSwept,
      isBslSwept,
      isDiscount,
      isPremium,
      isEq,
      noTradeLow,
      noTradeHigh
    };
  }

  /* ── Telemetry Merger: Break · Sweep · DOL (NextGen + AmyICT) ── */
  function resolveLiveTelemetry(ctx, livePrice) {
    const amy = ctx?.amy || ctx;
    const dashboard = amy?.dashboard;
    const ng = window.amyfxLastIndicators || null;

    // 1. Structure Break (BOS / MSS)
    let breakText = 'Menunggu Break';
    let breakTone = '';
    const lastEv = ng?.structure?.lastEvent || dashboard?.lastBreak || ctx?.h1?.lastBreak || null;
    if (lastEv && (lastEv.type || lastEv.kind || lastEv.label)) {
      const evType = String(lastEv.type || lastEv.kind || lastEv.label).toUpperCase();
      const evDir = String(lastEv.direction || lastEv.side || '').toUpperCase();
      const isBull = evDir.includes('BULL') || evDir === 'BUY' || lastEv.dir === 1;
      const isBear = evDir.includes('BEAR') || evDir === 'SELL' || lastEv.dir === -1;
      const lvl = num(lastEv.level ?? lastEv.price);
      const dirTxt = isBull ? 'Bull' : (isBear ? 'Bear' : '');
      breakText = `${evType}${dirTxt ? ' ' + dirTxt : ''}${Number.isFinite(lvl) ? ` @ $${fmt(lvl)}` : ''}`;
      breakTone = isBull ? 'is-bull' : (isBear ? 'is-bear' : '');
    } else if (dashboard?.bullMss || dashboard?.bearMss || dashboard?.bullBos || dashboard?.bearBos) {
      const isBull = Boolean(dashboard.bullMss || dashboard.bullBos);
      const kind = (dashboard.bullMss || dashboard.bearMss) ? 'MSS' : 'BOS';
      breakText = `${kind} ${isBull ? 'Bull' : 'Bear'}`;
      breakTone = isBull ? 'is-bull' : 'is-bear';
    }

    // 2. Liquidity Sweep
    let sweepText = 'Belum ada sweep';
    let sweepTone = '';
    const latestNgSweep = ng?.liquidity?.latestSweep || (Array.isArray(ng?.liquidity?.sweeps) && ng.liquidity.sweeps.length ? ng.liquidity.sweeps[ng.liquidity.sweeps.length - 1] : null);
    const dashSweep = dashboard?.latestSweep || null;
    const activeSweep = latestNgSweep || dashSweep;
    if (activeSweep) {
      const poolName = activeSweep.pool || String(activeSweep.type || '').replace(/_SWEEP$/i, '').replace(/_/g, ' ') || 'Likuiditas';
      const lvl = num(activeSweep.level ?? activeSweep.price);
      const rSide = String(activeSweep.reactionSide || activeSweep.side || '').toUpperCase();
      const isBuyReact = rSide === 'BUY' || rSide === 'BULLISH' || activeSweep.type === 'SSL_SWEEP' || activeSweep.type === 'PDL_SWEEP' || activeSweep.type === 'ASIA_LOW_SWEEP';
      const isSellReact = rSide === 'SELL' || rSide === 'BEARISH' || activeSweep.type === 'BSL_SWEEP' || activeSweep.type === 'PDH_SWEEP' || activeSweep.type === 'ASIA_HIGH_SWEEP';
      const reactLabel = isBuyReact ? 'Reaksi Buy' : (isSellReact ? 'Reaksi Sell' : '');
      sweepText = `${poolName}${Number.isFinite(lvl) ? ` $${fmt(lvl)}` : ''}${reactLabel ? ` · ${reactLabel}` : ''}`;
      sweepTone = isBuyReact ? 'is-bull' : (isSellReact ? 'is-bear' : 'is-gold');
    }

    // 3. Draw on Liquidity (DOL)
    let dolText = 'Menunggu arah DOL';
    let dolTone = 'is-gold';
    const ngDol = ng?.dol && Number.isFinite(num(ng.dol.level)) ? ng.dol : null;
    const dashDolLvl = num(dashboard?.dolTarget);
    if (ngDol) {
      const dist = Number.isFinite(livePrice) && livePrice > 0 ? Math.abs(ngDol.level - livePrice) : num(ngDol.distance);
      const arrow = ngDol.side === 'BUY' ? '↑' : (ngDol.side === 'SELL' ? '↓' : '');
      dolText = `${arrow} ${ngDol.name || 'DOL'} $${fmt(ngDol.level)}${Number.isFinite(dist) ? ` ($${fmt(dist)})` : ''}`;
      dolTone = ngDol.side === 'BUY' ? 'is-bull' : (ngDol.side === 'SELL' ? 'is-bear' : 'is-gold');
    } else if (Number.isFinite(dashDolLvl)) {
      const dir = dashboard?.dolDir || dashboard?.biasDir || 0;
      const arrow = dir === 1 ? '↑' : (dir === -1 ? '↓' : '');
      const dist = livePrice > 0 ? Math.abs(dashDolLvl - livePrice) : NaN;
      const dName = dashboard?.dolName || (dir === 1 ? 'BSL' : (dir === -1 ? 'SSL' : 'DOL'));
      dolText = `${arrow} ${dName} $${fmt(dashDolLvl)}${Number.isFinite(dist) ? ` ($${fmt(dist)})` : ''}`;
      dolTone = dir === 1 ? 'is-bull' : (dir === -1 ? 'is-bear' : 'is-gold');
    }

    return { breakText, breakTone, sweepText, sweepTone, dolText, dolTone };
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

    // Warning Kontekstual Tunggal
    const warnEl = $('hero-warning');
    if (warnEl) {
      const isPremiumBuy = m15Dir === 1 && isPremiumZone;
      const isDiscountSell = m15Dir === -1 && isDiscountZone;

      if (h1Dir === 1 && m15Dir === -1) {
        const dStr = pipsToDemand ? ` (${pipsToDemand} pips lagi)` : '';
        warnEl.textContent = `Waspada: Koreksi turun M15 mendekati Demand ${demandLabel}${dStr}. Hindari mengejar Sell di zona diskon; tunggu konfirmasi pantulan Buy.`;
        warnEl.hidden = false;
      } else if (h1Dir === -1 && m15Dir === 1) {
        const sStr = pipsToSupply ? ` (${pipsToSupply} pips lagi)` : '';
        warnEl.textContent = `Waspada: Pullback naik sementara di tren Bear HTF mendekati Supply ${supplyLabel}${sStr}. Amati potensi rejection Sell.`;
        warnEl.hidden = false;
      } else if (isPremiumBuy) {
        warnEl.textContent = `Waspada: Harga berada di Zona Premium (>50% EQ). Hindari FOMO Buy di pucuk; tunggu retest Demand ${demandLabel} atau rejection Supply ${supplyLabel}.`;
        warnEl.hidden = false;
      } else if (isDiscountSell) {
        warnEl.textContent = `Waspada: Harga berada di Zona Diskon (<50% EQ). Hindari FOMO Sell di dasar; tunggu retest Supply ${supplyLabel} atau pantulan Demand ${demandLabel}.`;
        warnEl.hidden = false;
      } else {
        warnEl.hidden = true;
      }
    }

    // Narasi 1 Baris Objektif
    const conclusionEl = $('hero-conclusion');
    if (conclusionEl) {
      if (h1Dir === -1 && m15Dir === 1) {
        conclusionEl.innerHTML = `Tren HTF <strong>Bearish</strong> dengan pullback lokal <strong>M15 naik</strong> ke Supply <strong>${supplyLabel}</strong>${pipsToSupply ? ` (${pipsToSupply} pips di atas harga)` : ''}. Pantau reaksi premium sebelum lanjut turun.`;
      } else if (h1Dir === 1 && m15Dir === -1) {
        conclusionEl.innerHTML = `Tren HTF <strong>Bullish</strong> dengan koreksi lokal <strong>M15 turun</strong> menuju Demand/SSL <strong>${demandLabel}</strong>${pipsToDemand ? ` (${pipsToDemand} pips di bawah harga)` : ''}. Tunggu konfirmasi M5 sebelum Buy.`;
      } else if (m15Dir === 1 && isPremiumZone) {
        conclusionEl.innerHTML = `Momentum M15 dikuasai <strong>Buyer</strong>, namun posisi sudah di <strong>Zona Premium</strong>. Tunggu retracement ke Demand <strong>${demandLabel}</strong> atau amati rejection di Supply <strong>${supplyLabel}</strong>.`;
      } else if (m15Dir === 1) {
        conclusionEl.innerHTML = `Momentum M15 dikuasai <strong>Buyer</strong>. Struktur menjaga Higher Low mengarah ke likuiditas BSL <strong>${supplyLabel}</strong>.`;
      } else if (m15Dir === -1 && Number.isFinite(rLow) && livePrice > 0 && livePrice < rLow) {
        conclusionEl.innerHTML = `Struktur M15 didominasi <strong>Seller</strong> dan harga baru menyapu Range Low ($${fmt(rLow)}). Waspadai potensi rebound cepat (Judas Swing) di sekitar SSL <strong>${demandLabel}</strong>.`;
      } else if (m15Dir === -1) {
        conclusionEl.innerHTML = `Struktur M15 didominasi <strong>Seller</strong> menuju SSL <strong>${demandLabel}</strong>. Prioritaskan setup Sell on Rally di Supply Premium <strong>${supplyLabel}</strong>.`;
      } else {
        conclusionEl.innerHTML = 'Struktur belum searah — tunggu konfirmasi BOS/MSS dan validasi zona POI sebelum eksekusi.';
      }
    }
  }

  /* ── 2. Dealing Range Horizontal Gauge (Single Source of Truth) ── */
  function updateDealingRange(ctx) {
    if (!ctx) return;
    const amy = ctx.amy || ctx;
    const dashboard = amy?.dashboard;
    const livePrice = Number(window.amyfxCurrentPrice) || Number(ctx.price) || Number(dashboard?.candle?.close) || 0;
    const drState = resolveUnifiedDealingRange(ctx, livePrice);

    const { rHigh, rLow, eq: eqVal, pct, rawPct, isSslSwept, isBslSwept } = drState;
    if (!Number.isFinite(rHigh) || !Number.isFinite(rLow) || rHigh <= rLow) return;

    const pctTag = $('dr-pct-tag');
    if (pctTag) pctTag.textContent = `${pct}%`;

    const bslEl = $('dr-bsl-val');
    if (bslEl) bslEl.textContent = isBslSwept ? `$${fmt(rHigh)} · Swept` : '$' + fmt(rHigh);
    const eqEl = $('dr-eq-val');
    if (eqEl) eqEl.textContent = Number.isFinite(eqVal) ? `$${fmt(eqVal)}` : '—';
    const sslEl = $('dr-ssl-val');
    if (sslEl) sslEl.textContent = isSslSwept ? `$${fmt(rLow)} · Swept` : '$' + fmt(rLow);

    // Horizontal gauge fill & dot
    const fill = $('dr-bar-fill');
    const dot  = $('dr-bar-dot');
    if (fill) fill.style.width = `${pct}%`;
    if (dot)  dot.style.left = `${pct}%`;

    // Range Mayor (PDH / PDL — baca keyLevels NextGen yang akurat)
    const pdh = Number(amy?.levels?.pdh || window.amyfxLastIndicators?.keyLevels?.pdh || ctx.h1?.swingHigh);
    const pdl = Number(amy?.levels?.pdl || window.amyfxLastIndicators?.keyLevels?.pdl || ctx.h1?.swingLow);
    const majorRangeEl = $('dr-major-range');
    const majorEqEl = $('dr-major-eq');
    if (pdh > 0 && pdl > 0) {
      if (majorRangeEl) majorRangeEl.textContent = `$${fmt(pdl)} – $${fmt(pdh)}`;
      if (majorEqEl) majorEqEl.textContent = `$${fmt((pdh + pdl) / 2)}`;
    } else {
      if (majorRangeEl) majorRangeEl.textContent = 'Belum tersedia';
      if (majorEqEl) majorEqEl.textContent = '—';
    }

    // Status badge ringkas (batas eksak 47.5% – 52.5% selaras dengan Chart Badge)
    const badge = $('dr-status-badge');
    if (badge) {
      let cls = 'zone-eq', text = '';
      if (isSslSwept) {
        cls = 'zone-discount';
        const sweepDiff = (rLow - livePrice).toFixed(2);
        text = `Extreme Discount (${pct}%) · SSL $${fmt(rLow)} tersapu (-$${sweepDiff}). Siaga konfirmasi pembalikan Buy.`;
      } else if (isBslSwept) {
        cls = 'zone-premium';
        const sweepDiff = (livePrice - rHigh).toFixed(2);
        text = `Extreme Premium (${pct}%) · BSL $${fmt(rHigh)} tersapu (+$${sweepDiff}). Waspadai rejection Sell.`;
      } else if (rawPct > 75) {
        cls = 'zone-premium';
        text = `Extreme Premium (${pct}%) · Mendekati Range High $${fmt(rHigh)}. Prioritaskan konfirmasi Sell.`;
      } else if (rawPct > 52.5) {
        cls = 'zone-premium';
        text = `Zona Premium (${pct}%) · Area ideal pencarian Supply / Sell, hindari FOMO Buy di pucuk.`;
      } else if (rawPct < 25) {
        cls = 'zone-discount';
        text = `Extreme Discount (${pct}%) · Mendekati Range Low $${fmt(rLow)}. Siaga konfirmasi pantulan Buy.`;
      } else if (rawPct < 47.5) {
        cls = 'zone-discount';
        text = `Zona Diskon (${pct}%) · Area ideal pencarian Demand / Buy, tunggu sweep atau validasi M5.`;
      } else {
        cls = 'zone-eq';
        text = `Equilibrium (${pct}%) · Area tengah 50% adalah No-Trade Zone, tunggu harga keluar ke Premium/Diskon.`;
      }
      badge.className = `dr-status-badge ${cls}`;
      badge.textContent = text;
    }
  }

  /* ── 3. Panel Eksekusi POI (BUY / SELL Tab Switch) + Skenario ── */
  function renderPOICards(ctx) {
    if (!ctx) return;
    const amy = ctx.amy || ctx;
    const dashboard = amy?.dashboard;
    const ng = window.amyfxLastIndicators || null;
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

    // Helper validasi zona aktif (hanya buang BROKEN/INVALIDATED/FAILED)
    const isActiveZone = z => {
      if (!z) return false;
      if (z.mitigated === true && String(z.lifecycle || z.status || '').toUpperCase() === 'BROKEN') return false;
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
      return { lo, hi, ce, tested: Boolean(f.tested) };
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
      return { lo, hi, ce, label, raw: o };
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

    // Kandidat Likuiditas Riil (Single Source: NextGen DOL + keyLevels + Protected Swings + Dashboard)
    const drState = resolveUnifiedDealingRange(ctx, livePrice);
    const { rHigh, rLow, eq: eqVal, pct, rawPct, isDiscount, isPremium, noTradeLow, noTradeHigh } = drState;
    const ngKey = ng?.keyLevels || {};
    const ngPoolsAbove = Array.isArray(ng?.dol?.poolsAbove) ? ng.dol.poolsAbove.map(p => ({ name: p.name, k: 'H', v: num(p.level ?? p.price) })) : [];
    const ngPoolsBelow = Array.isArray(ng?.dol?.poolsBelow) ? ng.dol.poolsBelow.map(p => ({ name: p.name, k: 'L', v: num(p.level ?? p.price) })) : [];

    const liqCandidates = [
      ...ngPoolsAbove,
      ...ngPoolsBelow,
      { name: 'Protected High M15', k: 'H', v: num(ng?.structure?.protectedHigh ?? dashboard?.protectedHigh) },
      { name: 'BSL M15', k: 'H', v: num(dashboard?.bsl) },
      { name: 'Range High M15', k: 'H', v: num(rHigh) },
      { name: 'BSL Swing', k: 'H', v: num(amy?.levels?.bsl) },
      { name: 'PDH', k: 'H', v: num(amy?.levels?.pdh ?? ngKey.pdh) },
      { name: 'Asia High', k: 'H', v: num(amy?.levels?.asiaHigh ?? ngKey.asiaHigh) },
      { name: 'Protected Low M15', k: 'L', v: num(ng?.structure?.protectedLow ?? dashboard?.protectedLow) },
      { name: 'SSL M15', k: 'L', v: num(dashboard?.ssl) },
      { name: 'Range Low M15', k: 'L', v: num(rLow) },
      { name: 'SSL Swing', k: 'L', v: num(amy?.levels?.ssl) },
      { name: 'PDL', k: 'L', v: num(amy?.levels?.pdl ?? ngKey.pdl) },
      { name: 'Asia Low', k: 'L', v: num(amy?.levels?.asiaLow ?? ngKey.asiaLow) }
    ].filter(x => Number.isFinite(x.v));

    const dedupeLiq = arr => arr.filter((x, i) => arr.findIndex(y => Math.abs(y.v - x.v) < 0.08) === i);
    const highPools = dedupeLiq(liqCandidates.filter(x => x.k === 'H'));
    const lowPools  = dedupeLiq(liqCandidates.filter(x => x.k === 'L'));
    const liqAbove  = livePrice > 0 ? highPools.filter(x => x.v > livePrice).sort((a, b) => a.v - b.v) : [];
    const liqBelow  = livePrice > 0 ? lowPools.filter(x => x.v < livePrice).sort((a, b) => b.v - a.v) : [];

    const MAX_STRUCTURAL_SL_BUFFER = 12.0;

    // Helper pilih POI lokasi-aware (OB + FVG terpadu: utamakan Premium untuk SELL, Diskon untuk BUY)
    function selectBestPOI(obs, fvgList, side) {
      const isSell = side === 'SELL';
      const combined = [
        ...obs.map(z => ({ low: z.lo, high: z.hi, ce: z.ce, label: z.label, kind: 'OB' })),
        ...fvgList.map((z, i) => ({ low: z.lo, high: z.hi, ce: z.ce, label: `${isSell ? 'Bearish' : 'Bullish'} FVG #${i + 1}`, kind: 'FVG' }))
      ].filter(z => isSell ? z.high >= livePrice - 1.5 : z.low <= livePrice + 1.5);

      if (!combined.length) return null;

      const scoreZone = z => {
        const dist = isSell ? Math.max(0, z.low - livePrice) : Math.max(0, livePrice - z.high);
        const obBonus = z.kind === 'OB' ? 1.5 : 0;
        return dist - obBonus;
      };

      const locationMatched = Number.isFinite(eqVal)
        ? combined.filter(z => isSell ? z.ce >= eqVal : z.ce <= eqVal)
        : [];
      const pool = locationMatched.length ? locationMatched : combined;
      pool.sort((a, b) => scoreZone(a) - scoreZone(b));
      return pool[0] || null;
    }

    // Helper pilih Invalidasi & SL yang WAJIB berada di LUAR batas zona entry (anti-terbalik)
    function resolveStructuralInvalidation(zone, side) {
      const isSell = side === 'SELL';
      if (zone) {
        if (isSell) {
          const validHighs = highPools
            .filter(x => x.v >= zone.high)
            .sort((a, b) => a.v - b.v);
          const nearHigh = validHighs.find(x => (x.v - zone.high) <= MAX_STRUCTURAL_SL_BUFFER);
          if (nearHigh) return nearHigh;
          return { name: `Batas Atas ${zone.kind || 'OB'}`, k: 'H', v: zone.high };
        } else {
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

    // Helper pilih Target DOL / TP yang searah, bersih dari pool tersapu, dan memenuhi R:R sehat
    function resolveDolTargets(zone, slPrice, side) {
      const isSell = side === 'SELL';
      const entryCe = zone ? zone.ce : livePrice;
      const risk = (Number.isFinite(entryCe) && Number.isFinite(slPrice))
        ? Math.max(1.0, isSell ? (slPrice - entryCe) : (entryCe - slPrice))
        : 5.0;

      const basePools = isSell ? [...lowPools] : [...highPools];
      if (Number.isFinite(eqVal)) {
        if (isSell && zone && eqVal < zone.low - 2.0) {
          basePools.push({ name: 'EQ 50%', k: 'L', v: eqVal });
        } else if (!isSell && zone && eqVal > zone.high + 2.0) {
          basePools.push({ name: 'EQ 50%', k: 'H', v: eqVal });
        }
      }

      const validPools = dedupeLiq(basePools)
        .filter(x => {
          if (isSell) {
            const boundary = zone ? zone.low - 1.5 : livePrice - 1.5;
            return x.v < boundary;
          } else {
            const boundary = zone ? zone.high + 1.5 : livePrice + 1.5;
            return x.v > boundary;
          }
        })
        .sort((a, b) => isSell ? (b.v - a.v) : (a.v - b.v));

      if (!validPools.length) return { tp1: null, tp2: null, risk, rr1: NaN };

      // Prioritaskan pool pertama dengan R:R >= 1.5; bila belum ada, ambil pool terjauh dari 3 terdekat agar R:R paling masuk akal
      const healthy = validPools.find(x => (Math.abs(x.v - entryCe) / risk) >= 1.5);
      const tp1 = healthy || validPools[Math.min(validPools.length - 1, 2)];
      const tp2 = validPools.find(x => isSell ? (x.v < tp1.v - 1.5) : (x.v > tp1.v + 1.5)) || null;
      const rr1 = Number.isFinite(entryCe) ? (Math.abs(tp1.v - entryCe) / risk) : NaN;
      return { tp1, tp2, risk, rr1 };
    }

    // ══════════════════════════════════════════════
    // SELL SETUP COMPUTATION & RENDER
    // ══════════════════════════════════════════════
    const sellTbody = $('sell-poi-tbody');
    let primarySellZone = selectBestPOI(uniqueBearOBs, bearFVGs, 'SELL');
    let isSellTesting = false;
    let isSellReacting = false;
    let isSellTpHit = false;
    let isSellSlHit = false;

    // Validasi apakah sesi SELL sebelumnya sudah kena SL sebelum refresh
    if (activeSellSession && Number.isFinite(activeSellSession.sl) && livePrice > activeSellSession.sl + 0.40) {
      isSellSlHit = true;
      activeSellSession = null;
    }

    const invSell = resolveStructuralInvalidation(primarySellZone, 'SELL');
    const trueSlBoundary = invSell ? invSell.v : (primarySellZone ? primarySellZone.high : NaN);
    const slLevelSellNum = Number.isFinite(trueSlBoundary) ? Number((trueSlBoundary + 0.40).toFixed(2)) : NaN;
    const sellTargets = resolveDolTargets(primarySellZone, slLevelSellNum, 'SELL');
    const tpCandSell = sellTargets.tp1;
    const tpCandSell2 = sellTargets.tp2;
    const sellRr = sellTargets.rr1;

    if (primarySellZone && Number.isFinite(trueSlBoundary)) {
      const sameZone = activeSellSession?.zone
        && Math.abs(activeSellSession.zone.low - primarySellZone.low) < 0.25
        && Math.abs(activeSellSession.zone.high - primarySellZone.high) < 0.25;
      const inZoneNow = livePrice >= primarySellZone.low - 0.20 && livePrice <= trueSlBoundary + 0.40;
      const prevTriggered = sameZone ? Boolean(activeSellSession.triggered) : false;
      const prevTrigPrice = sameZone ? activeSellSession.triggeredPrice : null;

      activeSellSession = {
        zone: primarySellZone,
        sl: trueSlBoundary,
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

    if (primarySellZone && activeSellSession) {
      if (livePrice >= primarySellZone.low - 0.20 && livePrice <= activeSellSession.sl + 0.40) {
        isSellTesting = true;
        activeSellSession.triggered = true;
        if (!activeSellSession.triggeredPrice) activeSellSession.triggeredPrice = livePrice;
      } else if (activeSellSession.triggered && livePrice < primarySellZone.low - 0.30 && (!Number.isFinite(activeSellSession.tp) || livePrice > activeSellSession.tp)) {
        isSellReacting = true;
      }
    }
    const isSellInPlay = isSellTesting || isSellReacting;

    // Cache plan for Lot Calculator (SELL)
    const sellTpVal = tpCandSell?.v ?? activeSellSession?.tp;
    const sellSlVal = Number.isFinite(slLevelSellNum) ? slLevelSellNum : (Number.isFinite(activeSellSession?.sl) ? Number((activeSellSession.sl + 0.40).toFixed(2)) : NaN);
    latestSellPlan = primarySellZone && Number.isFinite(sellSlVal)
      ? {
          entry: Number(primarySellZone.ce.toFixed(2)),
          sl: sellSlVal,
          tp1: Number.isFinite(sellTpVal) ? Number(sellTpVal.toFixed(2)) : Number((primarySellZone.ce - 8).toFixed(2)),
          tp2: tpCandSell2 ? Number(tpCandSell2.v.toFixed(2)) : undefined
        }
      : null;

    // Update 3 Structured Level Tiles (SELL)
    const sellEntryValEl = $('sell-entry-val');
    const sellEntrySubEl = $('sell-entry-sub');
    if (sellEntryValEl) sellEntryValEl.textContent = primarySellZone ? fmtRange(primarySellZone.low, primarySellZone.high) : 'Belum Ada';
    if (sellEntrySubEl) {
      sellEntrySubEl.textContent = primarySellZone
        ? `${primarySellZone.kind || 'OB'} · 50% CE $${fmt(primarySellZone.ce)}`
        : 'Tunggu Supply/OB di atas harga';
    }
    const sellTpValEl = $('sell-tp-val');
    const sellTpSubEl = $('sell-tp-sub');
    if (sellTpValEl) sellTpValEl.textContent = Number.isFinite(sellTpVal) ? `$${fmt(sellTpVal)}` : '—';
    if (sellTpSubEl) {
      const refEntrySell = primarySellZone ? primarySellZone.ce : livePrice;
      const distSell = Number.isFinite(sellTpVal) && Number.isFinite(refEntrySell) ? (refEntrySell - sellTpVal) : NaN;
      const rrTag = Number.isFinite(sellRr) && sellRr > 0 ? ` · R:R 1:${sellRr.toFixed(1)}` : '';
      sellTpSubEl.textContent = Number.isFinite(sellTpVal)
        ? `${tpCandSell?.name || activeSellSession?.tpName || 'SSL M15'}${Number.isFinite(distSell) && distSell > 0 ? ` · -$${fmt(distSell)}` : ''}${rrTag}`
        : 'Likuiditas SSL bawah';
    }
    const sellSlValEl = $('sell-sl-val');
    const sellSlSubEl = $('sell-sl-sub');
    if (sellSlValEl) sellSlValEl.textContent = Number.isFinite(sellSlVal) ? `$${fmt(sellSlVal)}` : '—';
    if (sellSlSubEl) {
      const slBase = Number.isFinite(trueSlBoundary) ? trueSlBoundary : activeSellSession?.sl;
      const slName = invSell?.name || activeSellSession?.slName || 'Batas Atas POI';
      sellSlSubEl.textContent = Number.isFinite(slBase)
        ? `${slName} $${fmt(slBase)} + $0.40`
        : 'Batas invalidasi BSL';
    }

    if (sellBadgeEl) {
      if (isSellTesting) {
        sellBadgeEl.className = 'poi-badge poi-badge--sell poi-badge--active';
        sellBadgeEl.textContent = `Menguji Zona · Pantau Rejection M5 ($${fmt(livePrice)})`;
      } else if (isSellReacting) {
        sellBadgeEl.className = 'poi-badge poi-badge--sell poi-badge--active';
        sellBadgeEl.textContent = `Zona Teruji · Reaksi Aktif dari $${fmt(activeSellSession?.triggeredPrice || primarySellZone.low)}`;
      } else if (isSellTpHit) {
        sellBadgeEl.className = 'poi-badge poi-badge--sell poi-badge--hit';
        sellBadgeEl.textContent = 'Target TP Tercapai · Likuiditas SSL Terpanen';
      } else if (isSellSlHit) {
        sellBadgeEl.className = 'poi-badge poi-badge--sell';
        sellBadgeEl.textContent = 'Invalidasi Ditembus · Batas SL Terlewati';
      }
    }

    if (sellTbody) {
      const sellRows = [];
      if (primarySellZone) {
        const trigNote = isSellTesting
          ? `Sedang diuji ($${fmt(livePrice)}) — tunggu konfirmasi rejection M5`
          : isSellReacting
            ? `Reaksi dari $${fmt(activeSellSession?.triggeredPrice || primarySellZone.low)} · Bergerak -$${fmt(Math.max(0, (activeSellSession?.triggeredPrice || primarySellZone.low) - livePrice))}`
            : `50% MT/CE: $${fmt(primarySellZone.ce)} — area jemputan Sell`;
        sellRows.push({
          poi: `${isSellInPlay ? '[Aktif] ' : ''}Entry [${primarySellZone.kind || 'OB'}] · ${primarySellZone.label}`,
          level: fmtRange(primarySellZone.low, primarySellZone.high),
          note: trigNote
        });
      } else {
        sellRows.push({
          poi: 'Status OB & FVG',
          level: 'Belum Ada',
          note: 'Belum ada OB/FVG valid di atas harga — tunggu zona terbentuk.'
        });
      }

      [tpCandSell, tpCandSell2].filter(Boolean).forEach((x, idx) => {
        const refEntry = primarySellZone ? primarySellZone.ce : livePrice;
        const distFromEntry = Math.max(0, refEntry - x.v);
        const rr = Number.isFinite(sellTargets.risk) && sellTargets.risk > 0 ? (distFromEntry / sellTargets.risk) : NaN;
        const rrStr = Number.isFinite(rr) ? ` · R:R 1:${rr.toFixed(1)}` : '';
        sellRows.push({
          poi: `Target DOL ${idx === 0 ? 'TP1' : 'TP2'} · ${x.name}`,
          level: '$' + fmt(x.v),
          note: `-$${fmt(distFromEntry)} dari Entry CE${rrStr}`
        });
      });

      const invLevelSell = Number.isFinite(trueSlBoundary) ? trueSlBoundary : activeSellSession?.sl;
      const invNameSell = invSell?.name || activeSellSession?.slName || 'Batas Atas POI';
      if (Number.isFinite(invLevelSell)) {
        const refEntry = primarySellZone ? primarySellZone.ce : livePrice;
        const riskDist = Math.max(0, invLevelSell - refEntry);
        sellRows.push({
          poi: `Invalidasi · ${invNameSell}`,
          level: '$' + fmt(invLevelSell),
          note: `+$${fmt(riskDist)} di atas Entry CE · SL $${fmt(sellSlVal)}`
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
      const slStr = Number.isFinite(sellSlVal) ? sellSlVal.toFixed(2) : (entryHi ? (entryHi + 0.40).toFixed(2) : null);
      const slAnchorLabel = invSell?.name || activeSellSession?.slName || 'Batas Atas POI';

      if (!Number.isFinite(entryLo) || !Number.isFinite(entryHi)) {
        sopSell.innerHTML = '<li>Belum ada Order Block (OB) atau FVG di atas harga — <strong>jangan entry Sell</strong> sampai zona jemputan terbentuk.</li>';
      } else if (isSellTesting) {
        sopSell.innerHTML = [
          `<li><strong>Status Zona:</strong> Harga sedang menguji Supply $${fmt(entryLo)}–$${fmt(entryHi)} (50% CE $${fmt(entryCe)}). Tunggu candle rejection/MSS M5 sebelum eksekusi.</li>`,
          Number.isFinite(sellTpVal)
            ? `<li><strong>Target TP:</strong> $${fmt(sellTpVal)} (${esc(tpCandSell?.name || activeSellSession?.tpName || 'SSL M15')}) · Pasang di <strong>$${fmt(sellTpVal + 0.50)}</strong> (napas spread Ask).</li>`
            : '<li><strong>Target TP:</strong> Range Low / SSL M15.</li>',
          `<li><strong>Batas SL Aman:</strong> di atas <strong>$${slStr}</strong> (${esc(slAnchorLabel)} + $0.40 napas spread).</li>`
        ].join('');
      } else if (isSellReacting) {
        sopSell.innerHTML = [
          `<li><strong>Status Zona:</strong> Zona Supply $${fmt(entryLo)}–$${fmt(entryHi)} teruji dan reaksi turun aktif.</li>`,
          Number.isFinite(sellTpVal)
            ? `<li><strong>Target TP:</strong> $${fmt(sellTpVal)} (${esc(tpCandSell?.name || activeSellSession?.tpName || 'SSL M15')}) · Pasang di <strong>$${fmt(sellTpVal + 0.50)}</strong> (napas spread Ask).</li>`
            : '<li><strong>Target TP:</strong> Range Low / SSL M15.</li>',
          `<li><strong>Batas SL Aman:</strong> di atas <strong>$${slStr}</strong> (${esc(slAnchorLabel)} + $0.40 napas spread).</li>`,
          '<li><strong>Panduan:</strong> Pertahankan disiplin SL dan hindari menambah posisi saat harga sudah masuk zona diskon.</li>'
        ].join('');
      } else {
        sopSell.innerHTML = [
          `<li><strong>Area Entry:</strong> tunggu retest/sweep Supply $${fmt(entryLo)}–$${fmt(entryHi)} (50% CE: $${fmt(entryCe)}) + Rejection M5.</li>`,
          Number.isFinite(sellTpVal)
            ? `<li><strong>Target TP:</strong> $${fmt(sellTpVal)} (${esc(tpCandSell?.name || 'SSL M15')}) · Napas spread XAUUSDc di <strong>$${fmt(sellTpVal + 0.50)}</strong>.</li>`
            : '<li><strong>Target TP:</strong> Range Low / SSL M15.</li>',
          `<li><strong>SL Aman:</strong> di atas <strong>$${slStr}</strong> (${esc(slAnchorLabel)} + $0.40 napas spread).</li>`
        ].join('');
      }
    }

    // ══════════════════════════════════════════════
    // BUY SETUP COMPUTATION & RENDER
    // ══════════════════════════════════════════════
    const buyTbody = $('buy-poi-tbody');
    let primaryBuyZone = selectBestPOI(uniqueBullOBs, bullFVGs, 'BUY');
    let isBuyTesting = false;
    let isBuyReacting = false;
    let isBuyTpHit = false;
    let isBuySlHit = false;

    // Validasi apakah sesi BUY sebelumnya sudah kena SL sebelum refresh
    if (activeBuySession && Number.isFinite(activeBuySession.sl) && livePrice < activeBuySession.sl - 0.40) {
      isBuySlHit = true;
      activeBuySession = null;
    }

    const invBuy = resolveStructuralInvalidation(primaryBuyZone, 'BUY');
    const trueBuySlBoundary = invBuy ? invBuy.v : (primaryBuyZone ? primaryBuyZone.low : NaN);
    const slLevelBuyNum = Number.isFinite(trueBuySlBoundary) ? Number((trueBuySlBoundary - 0.40).toFixed(2)) : NaN;
    const buyTargets = resolveDolTargets(primaryBuyZone, slLevelBuyNum, 'BUY');
    const tpCandBuy = buyTargets.tp1;
    const tpCandBuy2 = buyTargets.tp2;
    const buyRr = buyTargets.rr1;

    if (primaryBuyZone && Number.isFinite(trueBuySlBoundary)) {
      const sameZone = activeBuySession?.zone
        && Math.abs(activeBuySession.zone.low - primaryBuyZone.low) < 0.25
        && Math.abs(activeBuySession.zone.high - primaryBuyZone.high) < 0.25;
      const inZoneNow = livePrice <= primaryBuyZone.high + 0.20 && livePrice >= trueBuySlBoundary - 0.40;
      const prevTriggered = sameZone ? Boolean(activeBuySession.triggered) : false;
      const prevTrigPrice = sameZone ? activeBuySession.triggeredPrice : null;

      activeBuySession = {
        zone: primaryBuyZone,
        sl: trueBuySlBoundary,
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

    if (primaryBuyZone && activeBuySession) {
      if (livePrice <= primaryBuyZone.high + 0.20 && livePrice >= activeBuySession.sl - 0.40) {
        isBuyTesting = true;
        activeBuySession.triggered = true;
        if (!activeBuySession.triggeredPrice) activeBuySession.triggeredPrice = livePrice;
      } else if (activeBuySession.triggered && livePrice > primaryBuyZone.high + 0.30 && (!Number.isFinite(activeBuySession.tp) || livePrice < activeBuySession.tp)) {
        isBuyReacting = true;
      }
    }
    const isBuyInPlay = isBuyTesting || isBuyReacting;

    // Cache plan for Lot Calculator (BUY)
    const buyTpVal = tpCandBuy?.v ?? activeBuySession?.tp;
    const buySlVal = Number.isFinite(slLevelBuyNum) ? slLevelBuyNum : (Number.isFinite(activeBuySession?.sl) ? Number((activeBuySession.sl - 0.40).toFixed(2)) : NaN);
    latestBuyPlan = primaryBuyZone && Number.isFinite(buySlVal)
      ? {
          entry: Number(primaryBuyZone.ce.toFixed(2)),
          sl: buySlVal,
          tp1: Number.isFinite(buyTpVal) ? Number(buyTpVal.toFixed(2)) : Number((primaryBuyZone.ce + 8).toFixed(2)),
          tp2: tpCandBuy2 ? Number(tpCandBuy2.v.toFixed(2)) : undefined
        }
      : null;

    // Update 3 Structured Level Tiles (BUY)
    const buyEntryValEl = $('buy-entry-val');
    const buyEntrySubEl = $('buy-entry-sub');
    if (buyEntryValEl) buyEntryValEl.textContent = primaryBuyZone ? fmtRange(primaryBuyZone.low, primaryBuyZone.high) : 'Belum Ada';
    if (buyEntrySubEl) {
      buyEntrySubEl.textContent = primaryBuyZone
        ? `${primaryBuyZone.kind || 'OB'} · 50% CE $${fmt(primaryBuyZone.ce)}`
        : 'Tunggu Demand/OB di bawah harga';
    }
    const buyTpValEl = $('buy-tp-val');
    const buyTpSubEl = $('buy-tp-sub');
    if (buyTpValEl) buyTpValEl.textContent = Number.isFinite(buyTpVal) ? `$${fmt(buyTpVal)}` : '—';
    if (buyTpSubEl) {
      const refEntryBuy = primaryBuyZone ? primaryBuyZone.ce : livePrice;
      const distBuy = Number.isFinite(buyTpVal) && Number.isFinite(refEntryBuy) ? (buyTpVal - refEntryBuy) : NaN;
      const rrTag = Number.isFinite(buyRr) && buyRr > 0 ? ` · R:R 1:${buyRr.toFixed(1)}` : '';
      buyTpSubEl.textContent = Number.isFinite(buyTpVal)
        ? `${tpCandBuy?.name || activeBuySession?.tpName || 'BSL M15'}${Number.isFinite(distBuy) && distBuy > 0 ? ` · +$${fmt(distBuy)}` : ''}${rrTag}`
        : 'Likuiditas BSL atas';
    }
    const buySlValEl = $('buy-sl-val');
    const buySlSubEl = $('buy-sl-sub');
    if (buySlValEl) buySlValEl.textContent = Number.isFinite(buySlVal) ? `$${fmt(buySlVal)}` : '—';
    if (buySlSubEl) {
      const slBase = Number.isFinite(trueBuySlBoundary) ? trueBuySlBoundary : activeBuySession?.sl;
      const slName = invBuy?.name || activeBuySession?.slName || 'Batas Bawah POI';
      buySlSubEl.textContent = Number.isFinite(slBase)
        ? `${slName} $${fmt(slBase)} - $0.40`
        : 'Batas invalidasi SSL';
    }

    if (buyBadgeEl) {
      if (isBuyTesting) {
        buyBadgeEl.className = 'poi-badge poi-badge--buy poi-badge--active';
        buyBadgeEl.textContent = `Menguji Zona · Pantau Rejection M5 ($${fmt(livePrice)})`;
      } else if (isBuyReacting) {
        buyBadgeEl.className = 'poi-badge poi-badge--buy poi-badge--active';
        buyBadgeEl.textContent = `Zona Teruji · Reaksi Aktif dari $${fmt(activeBuySession?.triggeredPrice || primaryBuyZone.high)}`;
      } else if (isBuyTpHit) {
        buyBadgeEl.className = 'poi-badge poi-badge--buy poi-badge--hit';
        buyBadgeEl.textContent = 'Target TP Tercapai · Likuiditas BSL Terpanen';
      } else if (isBuySlHit) {
        buyBadgeEl.className = 'poi-badge poi-badge--buy';
        buyBadgeEl.textContent = 'Invalidasi Ditembus · Batas SL Terlewati';
      }
    }

    if (buyTbody) {
      const buyRows = [];
      if (primaryBuyZone) {
        const trigNote = isBuyTesting
          ? `Sedang diuji ($${fmt(livePrice)}) — tunggu konfirmasi rejection M5`
          : isBuyReacting
            ? `Reaksi dari $${fmt(activeBuySession?.triggeredPrice || primaryBuyZone.high)} · Bergerak +$${fmt(Math.max(0, livePrice - (activeBuySession?.triggeredPrice || primaryBuyZone.high)))}`
            : `50% MT/CE: $${fmt(primaryBuyZone.ce)} — area jemputan Buy`;
        buyRows.push({
          poi: `${isBuyInPlay ? '[Aktif] ' : ''}Entry [${primaryBuyZone.kind || 'OB'}] · ${primaryBuyZone.label}`,
          level: fmtRange(primaryBuyZone.low, primaryBuyZone.high),
          note: trigNote
        });
      } else {
        buyRows.push({
          poi: 'Status OB & FVG',
          level: 'Belum Ada',
          note: 'Belum ada OB/FVG valid di bawah harga — tunggu zona terbentuk.'
        });
      }

      [tpCandBuy, tpCandBuy2].filter(Boolean).forEach((x, idx) => {
        const refEntry = primaryBuyZone ? primaryBuyZone.ce : livePrice;
        const distFromEntry = Math.max(0, x.v - refEntry);
        const rr = Number.isFinite(buyTargets.risk) && buyTargets.risk > 0 ? (distFromEntry / buyTargets.risk) : NaN;
        const rrStr = Number.isFinite(rr) ? ` · R:R 1:${rr.toFixed(1)}` : '';
        buyRows.push({
          poi: `Target DOL ${idx === 0 ? 'TP1' : 'TP2'} · ${x.name}`,
          level: '$' + fmt(x.v),
          note: `+$${fmt(distFromEntry)} dari Entry CE${rrStr}`
        });
      });

      const invLevelBuy = Number.isFinite(trueBuySlBoundary) ? trueBuySlBoundary : activeBuySession?.sl;
      const invNameBuy = invBuy?.name || activeBuySession?.slName || 'Batas Bawah POI';
      if (Number.isFinite(invLevelBuy)) {
        const refEntry = primaryBuyZone ? primaryBuyZone.ce : livePrice;
        const riskDist = Math.max(0, refEntry - invLevelBuy);
        buyRows.push({
          poi: `Invalidasi · ${invNameBuy}`,
          level: '$' + fmt(invLevelBuy),
          note: `-$${fmt(riskDist)} di bawah Entry CE · SL $${fmt(buySlVal)}`
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
      const slStr = Number.isFinite(buySlVal) ? buySlVal.toFixed(2) : (Number.isFinite(entryLo) ? (entryLo - 0.40).toFixed(2) : null);
      const slAnchorLabel = invBuy?.name || activeBuySession?.slName || 'Batas Bawah POI';

      if (!Number.isFinite(entryLo) || !Number.isFinite(entryHi)) {
        sopBuy.innerHTML = '<li>Belum ada Order Block (OB) atau FVG di bawah harga — <strong>jangan entry Buy</strong> sampai zona jemputan diskon terbentuk.</li>';
      } else if (isBuyTesting) {
        sopBuy.innerHTML = [
          `<li><strong>Status Zona:</strong> Harga sedang menguji Demand $${fmt(entryLo)}–$${fmt(entryHi)} (50% CE $${fmt(entryCe)}). Tunggu candle rejection/MSS M5 sebelum eksekusi.</li>`,
          `<li><strong>Buy Limit Referensi:</strong> $${limitOrder} (+$0.40 napas spread Ask).</li>`,
          Number.isFinite(buyTpVal)
            ? `<li><strong>Target TP:</strong> $${fmt(buyTpVal)} (${esc(tpCandBuy?.name || activeBuySession?.tpName || 'BSL M15')}).</li>`
            : '<li><strong>Target TP:</strong> Range EQ / BSL M15.</li>',
          `<li><strong>Batas SL Aman:</strong> di bawah <strong>$${slStr}</strong> (${esc(slAnchorLabel)} - $0.40 napas spread).</li>`
        ].join('');
      } else if (isBuyReacting) {
        sopBuy.innerHTML = [
          `<li><strong>Status Zona:</strong> Zona Demand $${fmt(entryLo)}–$${fmt(entryHi)} teruji dan reaksi naik aktif.</li>`,
          Number.isFinite(buyTpVal)
            ? `<li><strong>Target TP:</strong> $${fmt(buyTpVal)} (${esc(tpCandBuy?.name || activeBuySession?.tpName || 'BSL M15')}).</li>`
            : '<li><strong>Target TP:</strong> Range EQ / BSL M15.</li>',
          `<li><strong>Batas SL Aman:</strong> di bawah <strong>$${slStr}</strong> (${esc(slAnchorLabel)} - $0.40 napas spread).</li>`,
          '<li><strong>Panduan:</strong> Jaga disiplin SL dan hindari FOMO menambah posisi saat harga sudah memasuki zona premium.</li>'
        ].join('');
      } else {
        sopBuy.innerHTML = [
          `<li><strong>Area Entry:</strong> tunggu sweep Demand $${fmt(entryLo)}–$${fmt(entryHi)} (50% CE: $${fmt(entryCe)}) + Rejection M5.</li>`,
          `<li><strong>Pending Order (Napas Spread XAUUSDc):</strong> Buy Limit di <strong>$${limitOrder}</strong> (+$0.40 agar tersamber Ask).</li>`,
          Number.isFinite(buyTpVal)
            ? `<li><strong>Target TP:</strong> $${fmt(buyTpVal)} (${esc(tpCandBuy?.name || 'BSL M15')}).</li>`
            : '<li><strong>Target TP:</strong> Range EQ / BSL M15.</li>',
          `<li><strong>SL Aman:</strong> di bawah <strong>$${slStr}</strong> (${esc(slAnchorLabel)} - $0.40 napas spread).</li>`
        ].join('');
      }
    }

    // ══════════════════════════════════════════════
    // ZONE-GATED TAB PRIORITY & SCENARIO LABELS
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

    // Update Segmented Tab Dots & Priority Tags
    const buyDot = $('tab-buy-dot');
    const sellDot = $('tab-sell-dot');
    if (buyDot) buyDot.classList.toggle('is-in-play', isBuyInPlay);
    if (sellDot) sellDot.classList.toggle('is-in-play', isSellInPlay);

    const buyTag = $('tab-buy-tag');
    const sellTag = $('tab-sell-tag');
    const buyPriority = isDiscount || (!isPremium && m15Dir === 1);
    const sellPriority = isPremium || (!isDiscount && m15Dir === -1);
    if (buyTag) buyTag.hidden = !buyPriority;
    if (sellTag) sellTag.hidden = !sellPriority;

    // Auto-select priority tab ONLY if user hasn't manually switched
    if (!userLockedTab) {
      if (sellPriority && !buyPriority) setActivePoiTab('SELL', false);
      else if (buyPriority && !sellPriority) setActivePoiTab('BUY', false);
    }

    // Zone-ban warnings inside each tab panel
    const sellWarn = $('poi-sell-zone-ban');
    if (sellWarn) {
      if (isDiscount) {
        if (isSellReacting) {
          sellWarn.className = 'poi-warning-box';
          sellWarn.innerHTML = `<strong>Reaksi Sell Aktif:</strong> Harga telah masuk area Diskon (${pct}%) menuju target SSL. Jangan tambah posisi Sell baru di bawah; amankan SL ke BEP.`;
          sellWarn.hidden = false;
        } else {
          sellWarn.className = 'poi-warning-box is-danger';
          sellWarn.innerHTML = `<strong>Dilarang Entry Sell di Harga Sekarang:</strong> Posisi berada di Zona Diskon (${pct}%). Sell valid hanya setelah pullback ke Supply Premium (${sellLabelZone ? fmtRange(sellLabelZone.low, sellLabelZone.high) : 'Supply atas'}).`;
          sellWarn.hidden = false;
        }
      } else {
        sellWarn.hidden = true;
      }
    }

    const buyWarn = $('poi-buy-zone-ban');
    if (buyWarn) {
      if (isPremium) {
        if (isBuyReacting) {
          buyWarn.className = 'poi-warning-box is-active-buy';
          buyWarn.innerHTML = `<strong>Reaksi Buy Aktif:</strong> Harga telah masuk area Premium (${pct}%) menuju target BSL. Hindari tambah posisi Buy di pucuk; kunci profit secara bertahap.`;
          buyWarn.hidden = false;
        } else {
          buyWarn.className = 'poi-warning-box is-danger';
          buyWarn.innerHTML = `<strong>Dilarang FOMO Buy di Pucuk:</strong> Posisi berada di Zona Premium (${pct}%). Buy valid hanya setelah koreksi ke Demand Diskon (${buyLabelZone ? fmtRange(buyLabelZone.low, buyLabelZone.high) : 'Demand bawah'}).`;
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

    const noTradeEl = $('no-trade-label');
    if (noTradeEl && Number.isFinite(noTradeLow) && Number.isFinite(noTradeHigh)) {
      const bLow  = noTradeLow.toFixed(2);
      const bHigh = noTradeHigh.toFixed(2);
      const inside = livePrice >= noTradeLow && livePrice <= noTradeHigh;
      noTradeEl.textContent = inside
        ? `NO-TRADE ZONE AKTIF ($${bLow} – $${bHigh} · 47.5%–52.5% EQ) · Harga berada tepat di tengah EQ — hindari eksekusi impulsif.`
        : `NO-TRADE ZONE EQ M15: $${bLow} – $${bHigh} (47.5%–52.5%) · Hindari entry bila harga kembali masuk area tengah ini.`;
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
    bindCockpitInteractions();
    setActivePoiTab(activePoiTab, false);
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
