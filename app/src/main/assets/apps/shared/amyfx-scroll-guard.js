(function initAmyScrollGuard(globalScope) {
  'use strict';

  const BACKTEST_ROUTE_RE = /\/(?:trading-practice|practice)(?:\/|$)/i;
  const MAPPING_ROUTE_RE = /\/apps\/mapping(?:\/|$)/i;

  function isMappingChartTarget(el, pathname) {
    const path = String(pathname || '');
    if (!MAPPING_ROUTE_RE.test(path)) return false;
    if (!el || typeof el.closest !== 'function') return false;
    return Boolean(
      el.closest('#chart, #price-chart, .tv-lightweight-charts, .gold-price-panel, [data-chart-canvas]') ||
      String(el.tagName || '').toUpperCase() === 'CANVAS'
    );
  }

  function isBacktestRoute(pathname) {
    return BACKTEST_ROUTE_RE.test(String(pathname || ''));
  }

  function computeRootScrollNudge({
    currentScrollY = 0,
    docScrollHeight = 0,
    viewportHeight = 0,
    minScrollY = 2
  } = {}) {
    const safeScrollY = Number.isFinite(currentScrollY) ? Math.max(0, currentScrollY) : 0;
    const safeDocH = Number.isFinite(docScrollHeight) ? Math.max(0, docScrollHeight) : 0;
    const safeViewH = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0;
    const safeMin = Number.isFinite(minScrollY) && minScrollY > 0 ? minScrollY : 2;
    const needsBuffer = safeDocH <= safeViewH + 6;
    const shouldNudge = safeScrollY < safeMin;
    return {
      needsBuffer,
      shouldNudge,
      targetScrollY: shouldNudge ? safeMin : safeScrollY
    };
  }

  function shouldPreventPullToRefresh({
    dy = 0,
    dx = 0,
    scrollTop = 0,
    inOverlay = false,
    onNonScrollableOverlayArea = false,
    isBacktestInteractive = false
  } = {}) {
    // Only guard deliberate vertical downward drag
    if (!(dy > 4 && Math.abs(dy) > Math.abs(dx) * 1.15)) {
      return false;
    }
    // Always block pull-to-refresh when dragging down on non-scrollable overlay chrome (headers, orb, reel bar)
    if (inOverlay && onNonScrollableOverlayArea) {
      return true;
    }
    // Never block native scrolling when the inner container still has content above to scroll up to
    if (scrollTop > 0) {
      return false;
    }
    // Inner scroller is already at top (scrollTop <= 0) and user keeps pulling down
    if (inOverlay || isBacktestInteractive) {
      return true;
    }
    return false;
  }

  function createLockManager({
    getScrollY = () => 0,
    setScrollY = () => {},
    getMetrics = () => ({ docScrollHeight: 0, viewportHeight: 0 }),
    setBufferClass = () => {},
    setNativePtrEnabled = () => {}
  } = {}) {
    const activeLocks = new Set();
    let savedScrollY = 0;
    let appliedNudge = false;

    function nudgeIfNeeded() {
      const currentScrollY = getScrollY();
      const { docScrollHeight, viewportHeight } = getMetrics();
      const plan = computeRootScrollNudge({
        currentScrollY,
        docScrollHeight,
        viewportHeight,
        minScrollY: 2
      });
      if (plan.needsBuffer) {
        setBufferClass(true);
      }
      if (plan.shouldNudge) {
        setScrollY(plan.targetScrollY);
        appliedNudge = true;
      }
      return plan;
    }

    function lock(key = 'default') {
      const lockKey = String(key || 'default');
      const wasEmpty = activeLocks.size === 0;
      activeLocks.add(lockKey);
      if (wasEmpty) {
        savedScrollY = getScrollY();
        appliedNudge = false;
        setBufferClass(true);
        setNativePtrEnabled(false);
      }
      nudgeIfNeeded();
      return activeLocks.size;
    }

    function unlock(key = 'default') {
      const lockKey = String(key || 'default');
      activeLocks.delete(lockKey);
      if (activeLocks.size === 0) {
        setBufferClass(false);
        setNativePtrEnabled(true);
        const curY = getScrollY();
        if (appliedNudge && savedScrollY < 2 && curY <= 6) {
          setScrollY(savedScrollY);
        }
        appliedNudge = false;
      }
      return activeLocks.size;
    }

    function isLocked() {
      return activeLocks.size > 0;
    }

    function getActiveLocks() {
      return Array.from(activeLocks);
    }

    return {
      lock,
      unlock,
      nudgeIfNeeded,
      isLocked,
      getActiveLocks
    };
  }

  function findScrollableAncestor(startEl, boundaryEl) {
    if (typeof window === 'undefined' || !startEl) return null;
    let cur = startEl.nodeType === 1 ? startEl : startEl.parentElement;
    const stopAt = boundaryEl || document.body;
    while (cur && cur !== document.documentElement && cur !== document.body) {
      if (cur.scrollHeight > cur.clientHeight + 2) {
        const style = window.getComputedStyle(cur);
        const oy = style?.overflowY || '';
        if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') {
          return cur;
        }
      }
      if (cur === stopAt) break;
      cur = cur.parentElement;
    }
    return null;
  }

  function findActiveOverlay(target) {
    if (!target || typeof target.closest !== 'function') return null;
    const amyPanel = target.closest('#amy-local-panel');
    if (amyPanel && !amyPanel.hidden && !amyPanel.classList.contains('amy-minimized')) {
      return amyPanel;
    }
    const openDialog = target.closest('dialog[open]');
    if (openDialog) return openDialog;
    const openDrawer = target.closest(
      '.side-drawer.is-open, .amy-reel-dialog[open], .fullscreen-dialog[open], [data-scroll-guard-overlay="true"]'
    );
    if (openDrawer) return openDrawer;
    return null;
  }

  function setNativePtrEnabled(enabled) {
    const flag = Boolean(enabled);
    try {
      if (typeof window === 'undefined') return;
      if (typeof window.Android?.setPullToRefreshEnabled === 'function') {
        window.Android.setPullToRefreshEnabled(flag);
      }
      if (typeof window.Android?.setRefreshEnabled === 'function') {
        window.Android.setRefreshEnabled(flag);
      }
      if (typeof window.AndroidBridge?.setPullToRefreshEnabled === 'function') {
        window.AndroidBridge.setPullToRefreshEnabled(flag);
      }
    } catch (_) {}
  }

  function installDomGuard() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return createLockManager();
    }

    if (!document.getElementById('amyfx-scroll-guard-style')) {
      const style = document.createElement('style');
      style.id = 'amyfx-scroll-guard-style';
      style.textContent = `
        html.amy-ptr-buffer,
        body.amy-ptr-buffer {
          overscroll-behavior-y: none !important;
        }
        body.amy-ptr-buffer {
          min-height: calc(100dvh + 24px) !important;
        }
        body.amy-ptr-buffer::after {
          content: "";
          display: block;
          height: 24px;
          pointer-events: none;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    const manager = createLockManager({
      getScrollY: () => window.scrollY || window.pageYOffset || document.documentElement?.scrollTop || 0,
      setScrollY: (y) => {
        try {
          window.scrollTo({ top: y, left: window.scrollX || 0, behavior: 'instant' });
        } catch (_) {
          try { window.scrollTo(window.scrollX || 0, y); } catch (__) {}
        }
      },
      getMetrics: () => ({
        docScrollHeight: Math.max(
          document.documentElement?.scrollHeight || 0,
          document.body?.scrollHeight || 0
        ),
        viewportHeight: window.innerHeight || document.documentElement?.clientHeight || 0
      }),
      setBufferClass: (active) => {
        document.documentElement?.classList.toggle('amy-ptr-buffer', Boolean(active));
        document.body?.classList.toggle('amy-ptr-buffer', Boolean(active));
      },
      setNativePtrEnabled
    });

    function syncDomOverlayLocks() {
      const hasOpenDialog = Boolean(document.querySelector('dialog[open]'));
      if (hasOpenDialog) manager.lock('dom-dialog');
      else manager.unlock('dom-dialog');

      const amyPanel = document.getElementById('amy-local-panel');
      const amyOpen = Boolean(amyPanel && !amyPanel.hidden && !amyPanel.classList.contains('amy-minimized'));
      if (amyOpen) manager.lock('amy-live-dom');
      else manager.unlock('amy-live-dom');

      const hasOpenDrawer = Boolean(document.querySelector('.side-drawer.is-open'));
      if (hasOpenDrawer) manager.lock('side-drawer');
      else manager.unlock('side-drawer');
    }

    let touchState = null;

    document.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length !== 1) {
        touchState = null;
        return;
      }
      const target = e.target;
      const pathname = window.location?.pathname || '';

      // Strictly never interfere with Chart Gold on apps/mapping/
      if (isMappingChartTarget(target, pathname)) {
        touchState = null;
        return;
      }

      const overlay = findActiveOverlay(target);
      const scroller = findScrollableAncestor(target, overlay || document.body);
      const onBacktest = isBacktestRoute(pathname);
      const isBacktestInteractive = Boolean(
        onBacktest &&
        (scroller ||
          (target && typeof target.closest === 'function' &&
            target.closest('canvas, .replay-stage, .chart-wrap, .chart-container, .practice-shell, .backtest-shell, [data-replay-chart]')))
      );

      // Android SwipeRefreshLayout checks WebView.canScrollVertically(-1) at touchstart.
      // Nudging root scrollY to >= 2px before touchmove stops Android PTR from stealing inner swipes.
      if (overlay || scroller || isBacktestInteractive) {
        manager.nudgeIfNeeded();
      }

      touchState = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        scroller,
        inOverlay: Boolean(overlay),
        onNonScrollableOverlayArea: Boolean(overlay && !scroller),
        isBacktestInteractive
      };
    }, { capture: true, passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!touchState || !e.touches || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchState.startX;
      const dy = e.touches[0].clientY - touchState.startY;
      const scrollTop = touchState.scroller ? touchState.scroller.scrollTop : 0;

      const block = shouldPreventPullToRefresh({
        dy,
        dx,
        scrollTop,
        inOverlay: touchState.inOverlay,
        onNonScrollableOverlayArea: touchState.onNonScrollableOverlayArea,
        isBacktestInteractive: touchState.isBacktestInteractive
      });

      if (block && e.cancelable) {
        e.preventDefault();
      }
    }, { capture: true, passive: false });

    const clearTouch = () => { touchState = null; };
    document.addEventListener('touchend', clearTouch, { passive: true });
    document.addEventListener('touchcancel', clearTouch, { passive: true });

    // Observe dynamic dialogs, Amy Live panel, and drawers globally
    const startObserver = () => {
      syncDomOverlayLocks();
      if (typeof MutationObserver === 'undefined' || !document.body) return;
      const observer = new MutationObserver(() => {
        syncDomOverlayLocks();
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['open', 'hidden', 'class']
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startObserver, { once: true });
    } else {
      startObserver();
    }

    return manager;
  }

  const runtimeManager = installDomGuard();

  globalScope.AmyScrollGuard = Object.freeze({
    lock: runtimeManager.lock,
    unlock: runtimeManager.unlock,
    nudgeIfNeeded: runtimeManager.nudgeIfNeeded,
    isLocked: runtimeManager.isLocked,
    getActiveLocks: runtimeManager.getActiveLocks,
    isMappingChartTarget,
    isBacktestRoute,
    computeRootScrollNudge,
    shouldPreventPullToRefresh,
    findScrollableAncestor,
    createLockManager
  });
})(typeof window !== 'undefined' ? window : globalThis);
