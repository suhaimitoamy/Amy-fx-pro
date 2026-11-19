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

  /* ── Tab Switch BUY / SELL & Latest Plan Cache (untuk Hitung Lot, Alarm Entry, Chart Sync) ── */
  let activePoiTab = 'BUY';
  let userLockedTab = false;
  let latestBuyPlan = null;
  let latestSellPlan = null;
  let latestBuyOverlay = null;
  let latestSellOverlay = null;
  let lastPublishedPlanSig = '';

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
    if (pct >= 120) {
      return { text: `$${todayRange.toFixed(1)} / $${refAdr.toFixed(1)} (${pct}% · Ekstrem Jenuh)`, tone: 'is-bear' };
    }
    if (pct >= 90) {
      return { text: `$${todayRange.toFixed(1)} / $${refAdr.toFixed(1)} (${pct}% · Waspada Jenuh)`, tone: 'is-gold' };
    }
    return { text: `$${todayRange.toFixed(1)} / $${refAdr.toFixed(1)} (${pct}% · Napas Sehat)`, tone: 'is-bull' };
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

    // 2. Liquidity Sweep (gugurkan reaksi sweep yang sudah ditembus BOS)
    let sweepText = 'Belum ada sweep';
    let sweepTone = '';
    const latestNgSweep = ng?.liquidity?.latestSweep || (Array.isArray(ng?.liquidity?.sweeps) && ng.liquidity.sweeps.length ? ng.liquidity.sweeps[ng.liquidity.sweeps.length - 1] : null);
    const dashSweep = dashboard?.latestSweep || null;
    const activeSweep = latestNgSweep || dashSweep;
    if (activeSweep) {
      const poolName = activeSweep.pool || String(activeSweep.type || '').replace(/_SWEEP$/i, '').replace(/_/g, ' ') || 'Likuiditas';
      const lvl = num(activeSweep.level ?? activeSweep.price);
      if (activeSweep.broken) {
        sweepText = `${poolName}${Number.isFinite(lvl) ? ` $${fmt(lvl)}` : ''} · Tembus BOS`;
        sweepTone = '';
      } else {
        const rSide = String(activeSweep.reactionSide || activeSweep.side || '').toUpperCase();
        const isBuyReact = rSide === 'BUY' || rSide === 'BULLISH' || activeSweep.type === 'SSL_SWEEP' || activeSweep.type === 'PDL_SWEEP' || activeSweep.type === 'ASIA_LOW_SWEEP';
        const isSellReact = rSide === 'SELL' || rSide === 'BEARISH' || activeSweep.type === 'BSL_SWEEP' || activeSweep.type === 'PDH_SWEEP' || activeSweep.type === 'ASIA_HIGH_SWEEP';
        const reactLabel = isBuyReact ? 'Reaksi Buy' : (isSellReact ? 'Reaksi Sell' : '');
        sweepText = `${poolName}${Number.isFinite(lvl) ? ` $${fmt(lvl)}` : ''}${reactLabel ? ` · ${reactLabel}` : ''}`;
        sweepTone = isBuyReact ? 'is-bull' : (isSellReact ? 'is-bear' : 'is-gold');
      }
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

    // Range Mayor (PDH / PDL — baca keyLevels NextGen yang akurat)
    const pdh = Number(amy?.levels?.pdh || ng?.keyLevels?.pdh || ctx.h1?.swingHigh);
    const pdl = Number(amy?.levels?.pdl || ng?.keyLevels?.pdl || ctx.h1?.swingLow);
    const majorRangeEl = $('dr-major-range');
    const majorEqEl = $('dr-major-eq');
    if (pdh > 0 && pdl > 0) {
      if (majorRangeEl) majorRangeEl.textContent = `$${fmt(pdl)} – $${fmt(pdh)}`;
      if (majorEqEl) majorEqEl.textContent = `$${fmt((pdh + pdl) / 2)}`;
    } else {
      if (majorRangeEl) majorRangeEl.textContent = 'Belum tersedia';
      if (majorEqEl) majorEqEl.textContent = '—';
    }

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

    // Filter Sesi Killzone & Berita High-Impact USD untuk Scalper
    const sessionLabel = resolveSessionLabel();
    const newsStatus = String(ctx.news?.status || '').toUpperCase();
    let sessionGuard = { label: 'Sesi Aktif · Selektif M5', tone: 'is-caution', ok: true, halfLot: false, blocked: false };
    if (sessionLabel.includes('Pasar Tutup')) {
      sessionGuard = { label: 'Pasar Tutup · Akhir Pekan', tone: 'is-danger', ok: false, halfLot: false, blocked: true };
    } else if (newsStatus === 'NEWS_LOCK') {
      sessionGuard = { label: 'News USD Aktif · Tahan Entry', tone: 'is-danger', ok: false, halfLot: true, blocked: true };
    } else if (newsStatus === 'UPCOMING') {
      sessionGuard = { label: 'News USD <30m · Kurangi Lot 50%', tone: 'is-caution', ok: true, halfLot: true, blocked: false };
    } else if (sessionLabel.includes('Killzone')) {
      sessionGuard = { label: `${sessionLabel.split('·')[0].trim()} · Ideal Scalping`, tone: 'is-killzone', ok: true, halfLot: false, blocked: false };
    } else if (sessionLabel.includes('Pre-Open') || sessionLabel.includes('Siang')) {
      sessionGuard = { label: `${sessionLabel} · Selektif M5`, tone: 'is-caution', ok: true, halfLot: false, blocked: false };
    } else {
      sessionGuard = { label: `${sessionLabel} · Luar Killzone (Lot 50%)`, tone: 'is-caution', ok: false, halfLot: true, blocked: false };
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

    // Active BOS Leg & OTE (61.8% – 78.6%) yang mengikuti ekspansi harga live
    let activeLeg = null;
    if (ng?.activeLeg && Number.isFinite(num(ng.activeLeg.high)) && Number.isFinite(num(ng.activeLeg.low))) {
      const aHigh = chartTrend === 'BULL' && livePrice > 0 ? Math.max(ng.activeLeg.high, livePrice) : ng.activeLeg.high;
      const aLow = chartTrend === 'BEAR' && livePrice > 0 ? Math.min(ng.activeLeg.low, livePrice) : ng.activeLeg.low;
      if (aHigh > aLow) {
        const span = aHigh - aLow;
        const aEq = (aHigh + aLow) / 2;
        const o1 = chartTrend === 'BEAR' ? aLow + span * 0.618 : aHigh - span * 0.786;
        const o2 = chartTrend === 'BEAR' ? aLow + span * 0.786 : aHigh - span * 0.618;
        activeLeg = { high: aHigh, low: aLow, eq: aEq, oteLow: Math.min(o1, o2), oteHigh: Math.max(o1, o2) };
      }
    }

    const liqCandidates = [
      ...ngPoolsAbove,
      ...ngPoolsBelow,
      { name: 'Protected High M15', k: 'H', v: protectedHigh },
      { name: 'BSL M15', k: 'H', v: num(dashboard?.bsl) },
      { name: 'Range High M15', k: 'H', v: num(rHigh) },
      { name: 'BSL Swing', k: 'H', v: num(amy?.levels?.bsl) },
      { name: 'PDH', k: 'H', v: num(amy?.levels?.pdh ?? ngKey.pdh) },
      { name: 'Asia High', k: 'H', v: num(amy?.levels?.asiaHigh ?? ngKey.asiaHigh) },
      { name: 'Protected Low M15', k: 'L', v: protectedLow },
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

    const MAX_STRUCTURAL_SL_BUFFER = 9.0;

    // Helper pilih POI Scalper Pro: Leg Aktif + OTE (61.8%–78.6%) + Anti-Kontradiksi Invalidasi
    function selectBestPOI(obs, fvgList, side) {
      const isSell = side === 'SELL';
      const combined = [
        ...obs.map(z => ({
          low: z.lo,
          high: z.hi,
          ce: z.ce,
          label: z.label,
          kind: 'OB',
          fresh: z.raw?.lifecycle === 'FRESH' || z.raw?.tested === false
        })),
        ...fvgList.map((z, i) => ({
          low: z.lo,
          high: z.hi,
          ce: z.ce,
          label: `${isSell ? 'Bearish' : 'Bullish'} FVG #${i + 1}`,
          kind: 'FVG',
          fresh: !z.tested
        }))
      ]
        .filter(z => isSell ? z.high >= livePrice - 1.0 : z.low <= livePrice + 1.0)
        .map(z => {
          const breached = livePrice > 0 && (isSell ? livePrice > z.high + 0.25 : livePrice < z.low - 0.25);
          const outsideInvalidation = isSell
            ? (Number.isFinite(protectedHigh) && (chartTrend === 'BEAR' || m15Dir === -1) && z.low > protectedHigh + 0.25)
            : (Number.isFinite(protectedLow) && (chartTrend === 'BULL' || m15Dir === 1) && z.high < protectedLow - 0.25);
          const inOte = Boolean(activeLeg && z.high >= activeLeg.oteLow - 0.5 && z.low <= activeLeg.oteHigh + 0.5);
          const refEq = activeLeg ? activeLeg.eq : eqVal;
          const inRightHalf = Number.isFinite(refEq) ? (isSell ? z.ce >= refEq - 1.0 : z.ce <= refEq + 1.0) : true;
          return { ...z, breached, outsideInvalidation, inOte, inRightHalf };
        });

      if (!combined.length) return null;

      // Utamakan zona yang belum jebol DAN berada di dalam batas Protected High/Low leg aktif
      const unbrokenInside = combined.filter(z => !z.breached && !z.outsideInvalidation);
      const insideAny = combined.filter(z => !z.outsideInvalidation);
      const unbrokenAny = combined.filter(z => !z.breached);
      const basePool = unbrokenInside.length
        ? unbrokenInside
        : (unbrokenAny.length ? unbrokenAny : (insideAny.length ? insideAny : combined));

      // Jika di basePool ada zona di paruh leg aktif yang tepat (Premium/OTE untuk SELL, Diskon/OTE untuk BUY) dalam jarak scalping (<$18), prioritaskan
      const legMatched = basePool.filter(z => {
        const dist = isSell ? Math.max(0, z.low - livePrice) : Math.max(0, livePrice - z.high);
        return z.inRightHalf && dist <= 18.0;
      });
      const pool = legMatched.length ? legMatched : basePool;

      const scoreZone = z => {
        const dist = isSell ? Math.max(0, z.low - livePrice) : Math.max(0, livePrice - z.high);
        let score = dist;
        if (z.fresh) score -= 3.5;
        if (z.inOte) score -= 4.0;
        if (z.kind === 'OB') score -= 1.2;
        if (z.outsideInvalidation) score += 25.0;
        if (z.breached) score += 30.0;
        return score;
      };

      pool.sort((a, b) => scoreZone(a) - scoreZone(b));
      return pool[0] || null;
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
      if (dist < 2.0) return { dist, status: 'tight', label: `SL $${dist.toFixed(2)} · Ketat (<$2 Rawan Wick)` };
      if (dist > 7.5) return { dist, status: 'wide', label: `SL $${dist.toFixed(2)} · Lebar (Refine M5)` };
      return { dist, status: 'ideal', label: `SL $${dist.toFixed(2)} · Ideal Scalper` };
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

    // Helper Evaluasi & Render 5-Poin Scalper Verdict Gate
    function evaluateAndRenderVerdict(side, cfg) {
      const isSell = side === 'SELL';
      const sideDir = isSell ? -1 : 1;
      const prefix = isSell ? 'sell' : 'buy';
      const barEl = $(`${prefix}-verdict-bar`);
      const gradeEl = $(`${prefix}-verdict-grade`);
      const scoreEl = $(`${prefix}-verdict-score`);
      const guardEl = $(`${prefix}-session-guard`);
      const checksEl = $(`${prefix}-verdict-checks`);
      if (!barEl) return { grade: 'WAIT', skip: false, score: 0 };

      const isWithM15 = m15Dir === sideDir;
      const isWithH1 = h1Dir === sideDir;
      const isCounterFull = (h1Dir === -sideDir && m15Dir === -sideDir);
      const isM5Aligned = m5Dir === sideDir;

      // 5 Cek Konfluensi Scalper
      const trendPass = isWithM15 || (m15Dir === 0 && isWithH1);
      const trendLabel = isWithH1 && isWithM15
        ? 'Tren H1+M15'
        : isWithM15
          ? 'Searah M15'
          : isCounterFull
            ? (isM5Aligned ? 'Counter H1+M15' : 'Counter 3-TF')
            : 'Counter M15';

      const zone = cfg.zone;
      const locPass = Boolean(zone && zone.inRightHalf && !zone.outsideInvalidation);
      const locLabel = zone?.inOte
        ? 'Zona OTE'
        : locPass
          ? (isSell ? 'Premium Leg' : 'Diskon Leg')
          : 'Lokasi Lemah';

      const poiPass = Boolean(zone && !zone.breached && !zone.outsideInvalidation && !cfg.isSlHit);
      const poiLabel = !zone
        ? 'Belum Ada POI'
        : zone.breached || cfg.isSlHit
          ? 'Zona Jebol'
          : zone.outsideInvalidation
            ? 'Di Luar Invalid'
            : (zone.fresh ? `Fresh ${zone.kind}` : `${zone.kind} Aktif`);

      const m5Pass = isM5Aligned;
      const m5Label = isM5Aligned ? 'M5 Konfirm' : 'Tunggu M5';

      const slOk = cfg.slGuard.status !== 'tight' && Number.isFinite(cfg.slGuard.dist) && cfg.slGuard.dist <= 9.0;
      const rrOk = Number.isFinite(cfg.rr1) && cfg.rr1 >= 1.4;
      const rrSlPass = Boolean(zone) && slOk && rrOk && !sessionGuard.blocked;
      const rrSlLabel = sessionGuard.blocked
        ? 'Sesi/News Lock'
        : !zone
          ? 'Menunggu R:R'
          : !slOk
            ? (cfg.slGuard.status === 'tight' ? 'SL Terlalu Ketat' : 'SL Lebar')
            : rrOk
              ? `R:R 1:${cfg.rr1.toFixed(1)}`
              : 'R:R Kecil';

      const checks = [
        { ok: trendPass, warn: !trendPass && isM5Aligned, label: trendLabel },
        { ok: locPass, warn: false, label: locLabel },
        { ok: poiPass, warn: false, label: poiLabel },
        { ok: m5Pass, warn: !m5Pass && trendPass, label: m5Label },
        { ok: rrSlPass, warn: slOk && rrOk && sessionGuard.halfLot, label: rrSlLabel }
      ];

      const score = checks.reduce((n, c) => n + (c.ok ? 1 : 0), 0);

      let cls = 'is-wait';
      let gradeText = 'GRADE B · TUNGGU KONFIRMASI';
      let isSkip = false;

      if (sessionGuard.blocked) {
        cls = 'is-skip';
        gradeText = newsStatus === 'NEWS_LOCK' ? 'SKIP · NEWS USD AKTIF' : 'SKIP · PASAR TUTUP';
        isSkip = true;
      } else if (!zone || zone.breached || cfg.isSlHit) {
        cls = 'is-skip';
        gradeText = zone?.breached || cfg.isSlHit ? 'SKIP · ZONA SUDAH JEBOL' : 'SKIP · BELUM ADA ZONA';
        isSkip = true;
      } else if (zone.outsideInvalidation) {
        cls = 'is-skip';
        gradeText = 'SKIP · ZONA DI LUAR INVALIDASI';
        isSkip = true;
      } else if (isCounterFull && !isM5Aligned) {
        cls = 'is-skip';
        gradeText = 'SKIP · COUNTER-TREND (WAJIB MSS M5)';
        isSkip = true;
      } else if (score === 5) {
        cls = isSell ? 'is-ready-sell' : 'is-ready';
        gradeText = 'GRADE A+ · SIAP EKSEKUSI SCALPER';
      } else if (score === 4 && trendPass && poiPass) {
        cls = 'is-wait';
        gradeText = isM5Aligned ? 'GRADE A · SIAP EKSEKUSI' : 'GRADE A · SIAP PANTAU M5';
      } else if (score >= 3 && poiPass) {
        cls = 'is-wait';
        gradeText = isCounterFull ? 'GRADE B · SCALP REVERSAL M5' : 'GRADE B · TUNGGU PULLBACK & M5';
      } else {
        cls = 'is-skip';
        gradeText = 'SKIP · PROBABILITAS RENDAH';
        isSkip = true;
      }

      barEl.className = `poi-verdict-card ${cls}`;
      if (gradeEl) gradeEl.textContent = gradeText;
      if (scoreEl) scoreEl.textContent = `${score}/5`;
      if (guardEl) {
        guardEl.textContent = sessionGuard.label;
        guardEl.className = `poi-session-guard ${sessionGuard.tone}`;
      }
      if (checksEl) {
        checksEl.innerHTML = checks.map(c => {
          const itemCls = c.ok ? 'is-pass' : (c.warn ? 'is-warn' : 'is-fail');
          const mark = c.ok ? '✓' : (c.warn ? '•' : '✕');
          return `<span class="poi-check-item ${itemCls}"><span class="poi-check-mark">${mark}</span><span>${esc(c.label)}</span></span>`;
        }).join('');
      }

      return { grade: gradeText, skip: isSkip, score };
    }

    // ══════════════════════════════════════════════
    // SELL SETUP COMPUTATION & RENDER (SCALPER PRO)
    // ══════════════════════════════════════════════
    const sellTbody = $('sell-poi-tbody');
    let primarySellZone = selectBestPOI(uniqueBearOBs, bearFVGs, 'SELL');
    let isSellTesting = false;
    let isSellReacting = false;
    let isSellTpHit = false;
    let isSellSlHit = false;

    if (activeSellSession && Number.isFinite(activeSellSession.sl) && livePrice > activeSellSession.sl + 0.40) {
      isSellSlHit = true;
      activeSellSession = null;
    }

    const invSell = resolveStructuralInvalidation(primarySellZone, 'SELL');
    const trueSlBoundary = invSell ? invSell.v : (primarySellZone ? primarySellZone.high : NaN);
    const slLevelSellNum = Number.isFinite(trueSlBoundary) ? Number((trueSlBoundary + 0.40).toFixed(2)) : NaN;
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

    // Cache plan for Lot Calculator, 1-Click Alarm & Chart Sync (SELL)
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
    latestSellOverlay = primarySellZone && !primarySellZone.breached
      ? {
          scalper: true,
          side: 'SELL',
          kind: primarySellZone.kind || 'OB',
          label: primarySellZone.label || '-OB',
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

    // Render 5-Poin Scalper Verdict (SELL)
    const sellVerdict = evaluateAndRenderVerdict('SELL', {
      zone: primarySellZone,
      slGuard: sellSlGuard,
      rr1: sellRr,
      isSlHit: isSellSlHit
    });

    // Update 3 Structured Level Tiles (SELL)
    const sellEntryValEl = $('sell-entry-val');
    const sellEntrySubEl = $('sell-entry-sub');
    if (sellEntryValEl) sellEntryValEl.textContent = primarySellZone ? fmtRange(primarySellZone.low, primarySellZone.high) : 'Belum Ada';
    if (sellEntrySubEl) {
      const oteTag = primarySellZone?.inOte ? ' · OTE' : '';
      const freshTag = primarySellZone?.fresh ? 'Fresh ' : '';
      sellEntrySubEl.textContent = primarySellZone
        ? `${freshTag}${primarySellZone.kind || 'OB'}${oteTag} · CE $${fmt(primarySellZone.ce)}`
        : 'Tunggu Supply/OB di atas harga';
    }
    const sellTpValEl = $('sell-tp-val');
    const sellTpSubEl = $('sell-tp-sub');
    if (sellTpValEl) sellTpValEl.textContent = Number.isFinite(sellTpVal) ? `$${fmt(sellTpVal)}` : '—';
    if (sellTpSubEl) {
      const rrTag = Number.isFinite(sellRr) && sellRr > 0 ? `1:${sellRr.toFixed(1)}` : '';
      const runnerTag = tpCandSell2 ? ` · Runner $${fmt(tpCandSell2.v)}` : '';
      const tp1Desc = tpCandSell?.synthetic
        ? `Partial BEP (${rrTag || '1:1.8'})`
        : `BEP ${tpCandSell?.name || 'TP1'}${rrTag ? ` (${rrTag})` : ''}`;
      sellTpSubEl.textContent = Number.isFinite(sellTpVal)
        ? `${tp1Desc}${runnerTag}`
        : 'Likuiditas SSL bawah';
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
        const trigNote = primarySellZone.breached
          ? `Harga ($${fmt(livePrice)}) menembus atas zona — jangan paksa entry`
          : isSellTesting
            ? `Sedang diuji ($${fmt(livePrice)}) — tunggu candle rejection/MSS M5`
            : isSellReacting
              ? `Reaksi dari $${fmt(activeSellSession?.triggeredPrice || primarySellZone.low)} · Bergerak -$${fmt(Math.max(0, (activeSellSession?.triggeredPrice || primarySellZone.low) - livePrice))}`
              : `50% CE: $${fmt(primarySellZone.ce)}${primarySellZone.inOte ? ' · Area OTE 62%–79%' : ''} — jemputan Sell`;
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

      if (tpCandSell) {
        const refEntry = primarySellZone ? primarySellZone.ce : livePrice;
        const dist1 = Math.max(0, refEntry - tpCandSell.v);
        const rr1Str = Number.isFinite(sellRr) ? ` · R:R 1:${sellRr.toFixed(1)}` : '';
        sellRows.push({
          poi: `TP1 Cepat (BEP 60%) · ${tpCandSell.name}`,
          level: '$' + fmt(tpCandSell.v),
          note: `-$${fmt(dist1)} dari CE${rr1Str} — Close 60% & geser SL ke BEP`
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
      const slStr = Number.isFinite(sellSlVal) ? sellSlVal.toFixed(2) : (entryHi ? (entryHi + 0.40).toFixed(2) : null);
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
          `<li><strong>SL Scalper:</strong> di atas <strong>$${slStr}</strong> (${esc(slAnchorLabel)} + $0.40 spread · ${esc(sellSlGuard.label)}).</li>`
        ].filter(Boolean).join('');
      }
    }

    // ══════════════════════════════════════════════
    // BUY SETUP COMPUTATION & RENDER (SCALPER PRO)
    // ══════════════════════════════════════════════
    const buyTbody = $('buy-poi-tbody');
    let primaryBuyZone = selectBestPOI(uniqueBullOBs, bullFVGs, 'BUY');
    let isBuyTesting = false;
    let isBuyReacting = false;
    let isBuyTpHit = false;
    let isBuySlHit = false;

    if (activeBuySession && Number.isFinite(activeBuySession.sl) && livePrice < activeBuySession.sl - 0.40) {
      isBuySlHit = true;
      activeBuySession = null;
    }

    const invBuy = resolveStructuralInvalidation(primaryBuyZone, 'BUY');
    const trueBuySlBoundary = invBuy ? invBuy.v : (primaryBuyZone ? primaryBuyZone.low : NaN);
    const slLevelBuyNum = Number.isFinite(trueBuySlBoundary) ? Number((trueBuySlBoundary - 0.40).toFixed(2)) : NaN;
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

    // Cache plan for Lot Calculator, 1-Click Alarm & Chart Sync (BUY)
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
    latestBuyOverlay = primaryBuyZone && !primaryBuyZone.breached
      ? {
          scalper: true,
          side: 'BUY',
          kind: primaryBuyZone.kind || 'OB',
          label: primaryBuyZone.label || '+OB',
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

    // Render 5-Poin Scalper Verdict (BUY)
    const buyVerdict = evaluateAndRenderVerdict('BUY', {
      zone: primaryBuyZone,
      slGuard: buySlGuard,
      rr1: buyRr,
      isSlHit: isBuySlHit
    });

    // Update 3 Structured Level Tiles (BUY)
    const buyEntryValEl = $('buy-entry-val');
    const buyEntrySubEl = $('buy-entry-sub');
    if (buyEntryValEl) buyEntryValEl.textContent = primaryBuyZone ? fmtRange(primaryBuyZone.low, primaryBuyZone.high) : 'Belum Ada';
    if (buyEntrySubEl) {
      const oteTag = primaryBuyZone?.inOte ? ' · OTE' : '';
      const freshTag = primaryBuyZone?.fresh ? 'Fresh ' : '';
      buyEntrySubEl.textContent = primaryBuyZone
        ? `${freshTag}${primaryBuyZone.kind || 'OB'}${oteTag} · CE $${fmt(primaryBuyZone.ce)}`
        : 'Tunggu Demand/OB di bawah harga';
    }
    const buyTpValEl = $('buy-tp-val');
    const buyTpSubEl = $('buy-tp-sub');
    if (buyTpValEl) buyTpValEl.textContent = Number.isFinite(buyTpVal) ? `$${fmt(buyTpVal)}` : '—';
    if (buyTpSubEl) {
      const rrTag = Number.isFinite(buyRr) && buyRr > 0 ? `1:${buyRr.toFixed(1)}` : '';
      const runnerTag = tpCandBuy2 ? ` · Runner $${fmt(tpCandBuy2.v)}` : '';
      const tp1Desc = tpCandBuy?.synthetic
        ? `Partial BEP (${rrTag || '1:1.8'})`
        : `BEP ${tpCandBuy?.name || 'TP1'}${rrTag ? ` (${rrTag})` : ''}`;
      buyTpSubEl.textContent = Number.isFinite(buyTpVal)
        ? `${tp1Desc}${runnerTag}`
        : 'Likuiditas BSL atas';
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
        const trigNote = primaryBuyZone.breached
          ? `Harga ($${fmt(livePrice)}) menembus bawah zona — dilarang Buy`
          : isBuyTesting
            ? `Sedang diuji ($${fmt(livePrice)}) — wajib tunggu candle rejection/MSS M5`
            : isBuyReacting
              ? `Reaksi dari $${fmt(activeBuySession?.triggeredPrice || primaryBuyZone.high)} · Bergerak +$${fmt(Math.max(0, livePrice - (activeBuySession?.triggeredPrice || primaryBuyZone.high)))}`
              : `50% CE: $${fmt(primaryBuyZone.ce)}${primaryBuyZone.inOte ? ' · Area OTE 62%–79%' : ''} — jemputan Buy`;
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

      if (tpCandBuy) {
        const refEntry = primaryBuyZone ? primaryBuyZone.ce : livePrice;
        const dist1 = Math.max(0, tpCandBuy.v - refEntry);
        const rr1Str = Number.isFinite(buyRr) ? ` · R:R 1:${buyRr.toFixed(1)}` : '';
        buyRows.push({
          poi: `TP1 Cepat (BEP 60%) · ${tpCandBuy.name}`,
          level: '$' + fmt(tpCandBuy.v),
          note: `+$${fmt(dist1)} dari CE${rr1Str} — Close 60% & geser SL ke BEP`
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
      const slStr = Number.isFinite(buySlVal) ? buySlVal.toFixed(2) : (Number.isFinite(entryLo) ? (entryLo - 0.40).toFixed(2) : null);
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
          `<li><strong>SL Scalper:</strong> di bawah <strong>$${slStr}</strong> (${esc(slAnchorLabel)} - $0.40 spread · ${esc(buySlGuard.label)}).</li>`
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

    // Sinkronkan Single Source of Truth POI ke Chart Gold, Hero Distance, dan Tombol Alarm 1-Klik
    publishActiveScalperPlan();
    syncEntryAlarmButtons();
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
    syncEntryAlarmButtons();
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
