(function() {
  'use strict';

  function getRootPrefix(pathname) {
    return String(pathname || '').startsWith('/assets/') ? '/assets' : '';
  }

  function getHomeUrl(pathname) {
    const p = pathname != null ? pathname : (typeof window !== 'undefined' && window.location ? window.location.pathname : '/');
    return `${getRootPrefix(p)}/index.html`;
  }

  /**
   * Pure deterministic parent-fallback resolver (1-step-up hierarchy)
   * Used when browser history cannot step back further (direct deep-link / stack bottom).
   */
  function getParentFallbackUrl(pathname, search, hash) {
    const p = String(pathname || '');
    const s = String(search || '');
    const prefix = getRootPrefix(p);

    // 1. Inside an Academy chapter (?lesson=...) -> return to Academy Daftar Materi
    if (p.includes('/apps/academy/index.html') && /[?&]lesson=/.test(s)) {
      return `${prefix}/apps/academy/index.html`;
    }

    // 2. Inside a Backtest sub-module (Candle Replay / Performa / Latihan) -> return to Backtest tab/hub
    if (/\/apps\/academy\/trading-practice\/(candle-replay|backtest-history|guided-practice)\.html$/i.test(p)) {
      return `${prefix}/index.html#backtest`;
    }

    // 3. Backtest Hub -> return to Home Backtest tab
    if (/\/apps\/academy\/trading-practice\/(?:index\.html)?$/i.test(p)) {
      return `${prefix}/index.html#backtest`;
    }

    // 4. Top-level sub-apps (Academy overview, Mapping, Journal, Market Intel) -> Home
    return `${prefix}/index.html`;
  }

  function isSameOriginUrl(urlStr, currentOrigin) {
    if (!urlStr || !currentOrigin) return false;
    try {
      const parsed = new URL(urlStr, currentOrigin);
      return parsed.origin === currentOrigin;
    } catch (_) {
      return false;
    }
  }

  /**
   * Pure decision helper for unit-testing 1-step-back navigation.
   */
  function resolveBackStep(opts) {
    const o = opts || {};
    const pathname = String(o.pathname || '/');
    const search = String(o.search || '');
    const hash = String(o.hash || '');

    // Already at app root (Beranda)
    if (pathname === '/' || (pathname.endsWith('/index.html') && !pathname.includes('/apps/'))) {
      return { action: 'noop', targetUrl: null };
    }

    if (o.pageHandled) {
      return { action: 'page-handler', targetUrl: null };
    }

    if (o.overlayClosed) {
      return { action: 'overlay', targetUrl: null };
    }

    const fallbackUrl = o.explicitFallback || getParentFallbackUrl(pathname, search, hash);
    const hasUsableHistory = Number(o.historyLength || 0) > 1 &&
      (!o.referrer || isSameOriginUrl(o.referrer, o.origin || 'http://localhost'));

    if (hasUsableHistory) {
      return { action: 'history-back', targetUrl: fallbackUrl };
    }

    return { action: 'navigate', targetUrl: fallbackUrl };
  }

  /**
   * Automatically close active in-page overlays (fullscreen, dialogs, modals, drawers)
   * before leaving the current page. Returns true if an overlay was closed.
   */
  function tryCloseActiveOverlay() {
    if (typeof document === 'undefined') return false;

    // 1. Native <dialog open>
    const openDialogs = document.querySelectorAll('dialog[open]');
    if (openDialogs.length) {
      const topDialog = openDialogs[openDialogs.length - 1];
      try {
        if (typeof topDialog.close === 'function') topDialog.close();
        else topDialog.removeAttribute('open');
        return true;
      } catch (_) {}
    }

    // 2. Mapping Chart Fullscreen
    const mappingFs = document.querySelector('#gold-chart-workspace.is-fullscreen');
    if (mappingFs) {
      const exitBtn = document.querySelector('#chart-fullscreen, #btn-chart-fullscreen, .chart-fullscreen-exit');
      if (exitBtn) {
        exitBtn.click();
        return true;
      }
    }

    // 3. Backtest Replay / Guided Chart Fullscreen
    const replayFs = document.querySelector('#replayWorkspace.is-fullscreen, .bt-chart-stage.is-fullscreen');
    if (replayFs) {
      const exitBtn = document.querySelector('#replayFullscreen, #guidedFullscreenBtn');
      if (exitBtn) {
        exitBtn.click();
        return true;
      }
    }

    // 4. Mapping Lot Calculator / Price Alerts / generic active modals
    const activeModal = document.querySelector('.amy-lot-modal-backdrop.active, .amyfx-alert-overlay:not([hidden]), .amy-lot-modal.active, .amy-alert-modal.active, #fullscreenModal:not([hidden])');
    if (activeModal) {
      const closeBtn = activeModal.querySelector('#lot-calc-close, #amyfx-alert-close, [data-close], .close-btn, #fullscreenBackBtn, button[aria-label*="Tutup"]');
      if (closeBtn) closeBtn.click();
      else {
        activeModal.classList.remove('active');
        activeModal.hidden = true;
      }
      return true;
    }

    // 5. Open Journal Sidebar Drawer
    if (document.body && document.body.classList.contains('sidebar-open')) {
      const backdrop = document.getElementById('sidebarBackdrop');
      if (backdrop) {
        backdrop.click();
        return true;
      }
    }

    // 6. Open Amy Assistant floating panel
    const amyPanel = document.querySelector('#amy-local-panel.is-open');
    if (amyPanel) {
      const closeAmy = document.querySelector('#amy-local-close');
      if (closeAmy) {
        closeAmy.click();
        return true;
      }
    }

    return false;
  }

  function navigateToFallback(targetUrl) {
    const homeUrl = getHomeUrl();
    const isExactHome = targetUrl === homeUrl || targetUrl === `${homeUrl}#beranda`;
    if (isExactHome && window.Android && typeof window.Android.goHome === 'function') {
      window.Android.goHome();
      return;
    }
    window.location.assign(targetUrl || homeUrl);
  }

  function goBack(explicitFallback) {
    if (typeof window === 'undefined' || !window.location) return;

    const pathname = window.location.pathname;
    if (pathname === '/' || (pathname.endsWith('/index.html') && !pathname.includes('/apps/'))) {
      return;
    }

    // Priority 1: Module-specific 1-step back handler (e.g., Academy Lesson -> Daftar Bab)
    let pageHandled = false;
    if (typeof window.__amyfxPageBackHandler === 'function') {
      try {
        pageHandled = Boolean(window.__amyfxPageBackHandler());
      } catch (_) {
        pageHandled = false;
      }
    }
    if (pageHandled) return;

    // Priority 2: Active overlay / fullscreen / dialog / drawer
    if (tryCloseActiveOverlay()) return;

    // Priority 3: Real 1-step-back via browser/WebView history (NEVER short-circuit to Android.goHome!)
    const step = resolveBackStep({
      pathname,
      search: window.location.search,
      hash: window.location.hash,
      historyLength: window.history ? window.history.length : 0,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      origin: window.location.origin,
      explicitFallback
    });

    if (step.action === 'noop') return;

    if (step.action === 'history-back') {
      const originHref = window.location.href;
      try {
        window.history.back();
      } catch (_) {
        navigateToFallback(step.targetUrl);
        return;
      }
      // Safety fallback ONLY if full URL (including ?query & #hash) did not change
      setTimeout(() => {
        if (window.location.href === originHref) {
          navigateToFallback(step.targetUrl);
        }
      }, 360);
      return;
    }

    navigateToFallback(step.targetUrl);
  }

  function goForward() {
    try {
      window.history.forward();
    } catch (_) {}
  }

  if (typeof window !== 'undefined') {
    window.__amyfxGoBack = goBack;
    window.__amyfxGoForward = goForward;
    window.AmyUniversalNav = Object.freeze({
      getHomeUrl,
      getParentFallbackUrl,
      resolveBackStep,
      goBack,
      goForward
    });
  }

  if (typeof document === 'undefined') return;

  // Global click delegate for any button or link with data-amyfx-nav="back" or "forward"
  document.addEventListener('click', (e) => {
    const backBtn = e.target.closest('[data-amyfx-nav="back"], #amyfxNavBack, .amyfx-nav-back');
    if (backBtn) {
      e.preventDefault();
      e.stopPropagation();
      const explicitFallback = backBtn.getAttribute('data-back-fallback') || '';
      goBack(explicitFallback || undefined);
      return;
    }
    const forwardBtn = e.target.closest('[data-amyfx-nav="forward"], #amyfxNavForward, .amyfx-nav-forward');
    if (forwardBtn) {
      e.preventDefault();
      e.stopPropagation();
      goForward();
    }
  }, true);

  // If in a sub-app (/apps/...), inject navigation arrows at opposite ends if not present
  function ensureNavArrows() {
    if (!window.location.pathname.includes('/apps/')) return;
    // Skip injection on pages with their own dedicated back arrow (Academy & Backtest Lab)
    if (document.querySelector('#amyfxNavBack, #acdBackLink, #btBackBtn')) return;

    const header = document.querySelector('header.app-header, header.intel-header, header.topbar, header');
    if (header) {
      const leftBtn = document.createElement('button');
      leftBtn.type = 'button';
      leftBtn.className = 'nav-arrow-btn nav-arrow-left';
      leftBtn.id = 'amyfxNavBack';
      leftBtn.setAttribute('data-amyfx-nav', 'back');
      leftBtn.setAttribute('aria-label', 'Kembali');
      leftBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      `;

      const rightBtn = document.createElement('button');
      rightBtn.type = 'button';
      rightBtn.className = 'nav-arrow-btn nav-arrow-right';
      rightBtn.id = 'amyfxNavForward';
      rightBtn.setAttribute('data-amyfx-nav', 'forward');
      rightBtn.setAttribute('aria-label', 'Maju');
      rightBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;

      header.prepend(leftBtn);
      header.append(rightBtn);
    }
  }

  // ─── Background Breaking News Observer ─────────────────────────────
  // Memastikan breaking news tetap dicek dan dimunculkan notifikasinya
  // saat pengguna sedang berada di halaman Mapping, Beranda, Jurnal, atau Akademi.
  function checkBreakingNews() {
    if (typeof window === 'undefined' || !window.location) return;
    if (window.location.pathname.includes('/market-intel/')) return; // Ditangani oleh market-intel/app.js

    const now = Date.now();
    const lastCheck = Number(sessionStorage.getItem('amy_last_news_poll_ms') || 0);
    if (now - lastCheck < 60_000) return;
    sessionStorage.setItem('amy_last_news_poll_ms', String(now));

    fetch('https://amy-fx.vercel.app/api/news?limit=8', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!data?.news || !Array.isArray(data.news) || !data.news.length) return;
        const goldKeywords = [
          'gold', 'xau', 'emas', 'bullion', 'fed', 'fomc', 'powell',
          'inflation', 'cpi', 'pce', 'treasury', 'yield', 'dxy', 'dollar',
          'dolar', 'nfp', 'payroll', 'jobless', 'claims', 'war', 'perang',
          'geopolit', 'safe haven', 'central bank', 'bank sentral',
          'suku bunga', 'rate cut', 'rate hike', 'iran', 'israel', 'houthi',
          'oil', 'minyak', 'russia', 'rusia', 'ukraine', 'ukraina'
        ];
        const isRel = item => {
          if (item?.relevant === true) return true;
          const t = ((item?.text || '') + ' ' + (item?.textOriginal || '')).toLowerCase();
          return goldKeywords.some(k => t.includes(k));
        };
        const relevant = data.news.filter(isRel);
        if (!relevant.length) return;
        const latest = relevant[0];
        const latestId = String(latest.id || '');
        const lastNotified = localStorage.getItem('amy_last_notified_news_id');
        const lastKnown = localStorage.getItem('amy_last_news_id');

        if (lastKnown && latestId && latestId !== lastNotified && Number(latestId) > Number(lastNotified || 0)) {
          const impact = String(latest.impact || '').toLowerCase();
          const title = impact === 'high' ? '🚨 Breaking News Penting XAU/USD' : '📰 Breaking News XAU/USD';
          const msg = latest.text || latest.textOriginal || 'Berita baru XAU/USD tersedia.';
          const targetUrl = 'https://appassets.androidplatform.net/assets/apps/market-intel/index.html#news=' + encodeURIComponent(latestId);
          if (window.Android?.showNotificationWithUrl) {
            window.Android.showNotificationWithUrl(title, msg, targetUrl);
          } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(title, { body: msg });
          }
          localStorage.setItem('amy_last_notified_news_id', latestId);
        }
        if (data.news[0]?.id) {
          localStorage.setItem('amy_last_news_id', String(data.news[0].id));
        }
      })
      .catch(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureNavArrows();
      setTimeout(checkBreakingNews, 3000);
    });
  } else {
    ensureNavArrows();
    setTimeout(checkBreakingNews, 3000);
  }

  setInterval(checkBreakingNews, 60_000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkBreakingNews();
  });
})();
