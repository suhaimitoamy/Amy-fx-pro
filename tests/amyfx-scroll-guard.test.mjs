import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const guardPath = path.resolve('apps/shared/amyfx-scroll-guard.js');
const guardSource = fs.readFileSync(guardPath, 'utf8');

function loadScrollGuard() {
  const sandbox = { globalThis: {} };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(guardSource, sandbox, { filename: guardPath });
  return sandbox.AmyScrollGuard;
}

const guard = loadScrollGuard();

test('shouldPreventPullToRefresh allows native scroll when inner container scrollTop > 0', () => {
  assert.equal(
    guard.shouldPreventPullToRefresh({
      dy: 32,
      dx: 2,
      scrollTop: 120,
      inOverlay: true,
      onNonScrollableOverlayArea: false
    }),
    false
  );
});

test('shouldPreventPullToRefresh blocks pull-to-refresh at scrollTop <= 0 inside overlay or backtest', () => {
  assert.equal(
    guard.shouldPreventPullToRefresh({
      dy: 28,
      dx: 3,
      scrollTop: 0,
      inOverlay: true,
      onNonScrollableOverlayArea: false
    }),
    true
  );

  assert.equal(
    guard.shouldPreventPullToRefresh({
      dy: 25,
      dx: 2,
      scrollTop: 0,
      inOverlay: false,
      isBacktestInteractive: true
    }),
    true
  );
});

test('shouldPreventPullToRefresh ignores upward swipes and horizontal swipes', () => {
  // Swiping up (dy < 0)
  assert.equal(
    guard.shouldPreventPullToRefresh({
      dy: -30,
      dx: 1,
      scrollTop: 0,
      inOverlay: true,
      onNonScrollableOverlayArea: false
    }),
    false
  );

  // Horizontal swipe (|dx| >= |dy|)
  assert.equal(
    guard.shouldPreventPullToRefresh({
      dy: 12,
      dx: 24,
      scrollTop: 0,
      inOverlay: true,
      onNonScrollableOverlayArea: true
    }),
    false
  );
});

test('shouldPreventPullToRefresh blocks downward drag on non-scrollable overlay chrome (e.g. orb hero / reel bar)', () => {
  assert.equal(
    guard.shouldPreventPullToRefresh({
      dy: 22,
      dx: 2,
      scrollTop: 0,
      inOverlay: true,
      onNonScrollableOverlayArea: true
    }),
    true
  );
});

test('computeRootScrollNudge ensures scrollY >= 2 and requests buffer on short pages', () => {
  const shortAtTop = guard.computeRootScrollNudge({
    currentScrollY: 0,
    docScrollHeight: 844,
    viewportHeight: 844
  });
  assert.equal(shortAtTop.needsBuffer, true);
  assert.equal(shortAtTop.shouldNudge, true);
  assert.equal(shortAtTop.targetScrollY, 2);

  const alreadyScrolled = guard.computeRootScrollNudge({
    currentScrollY: 140,
    docScrollHeight: 1600,
    viewportHeight: 844
  });
  assert.equal(alreadyScrolled.needsBuffer, false);
  assert.equal(alreadyScrolled.shouldNudge, false);
  assert.equal(alreadyScrolled.targetScrollY, 140);
});

test('createLockManager ref-counts multiple overlays and restores scrollY + native PTR only when all locks release', () => {
  let scrollY = 0;
  let bufferActive = false;
  const nativePtrCalls = [];

  const mgr = guard.createLockManager({
    getScrollY: () => scrollY,
    setScrollY: (y) => { scrollY = y; },
    getMetrics: () => ({ docScrollHeight: 844, viewportHeight: 844 }),
    setBufferClass: (v) => { bufferActive = v; },
    setNativePtrEnabled: (v) => { nativePtrCalls.push(v); }
  });

  mgr.lock('amy-live');
  assert.equal(mgr.isLocked(), true);
  assert.equal(bufferActive, true);
  assert.equal(scrollY, 2);
  assert.deepEqual(nativePtrCalls, [false]);

  // Second overlapping lock should not duplicate native PTR disable
  mgr.lock('dom-dialog');
  assert.equal(mgr.getActiveLocks().length, 2);
  assert.deepEqual(nativePtrCalls, [false]);

  // Unlocking first still keeps guard active
  mgr.unlock('amy-live');
  assert.equal(mgr.isLocked(), true);
  assert.equal(bufferActive, true);
  assert.equal(scrollY, 2);
  assert.deepEqual(nativePtrCalls, [false]);

  // Unlocking last restores everything cleanly
  mgr.unlock('dom-dialog');
  assert.equal(mgr.isLocked(), false);
  assert.equal(bufferActive, false);
  assert.equal(scrollY, 0);
  assert.deepEqual(nativePtrCalls, [false, true]);
});

test('isMappingChartTarget exempts Chart Gold elements inside /apps/mapping/ only', () => {
  const chartEl = {
    tagName: 'CANVAS',
    closest: (sel) => (sel.includes('.gold-price-panel') ? {} : null)
  };
  const normalEl = {
    tagName: 'DIV',
    closest: () => null
  };

  assert.equal(guard.isMappingChartTarget(chartEl, '/apps/mapping/index.html'), true);
  assert.equal(guard.isMappingChartTarget(normalEl, '/apps/mapping/index.html'), false);
  assert.equal(guard.isMappingChartTarget(chartEl, '/index.html'), false);
  assert.equal(guard.isMappingChartTarget(chartEl, '/apps/academy/trading-practice/candle-replay.html'), false);
});

test('isBacktestRoute detects trading-practice and practice routes', () => {
  assert.equal(guard.isBacktestRoute('/apps/academy/trading-practice/candle-replay.html'), true);
  assert.equal(guard.isBacktestRoute('/apps/academy/trading-practice/backtest-history.html'), true);
  assert.equal(guard.isBacktestRoute('/apps/academy/trading-practice/guided-practice.html'), true);
  assert.equal(guard.isBacktestRoute('/index.html'), false);
  assert.equal(guard.isBacktestRoute('/apps/mapping/index.html'), false);
});
