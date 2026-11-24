import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(import.meta.dirname, '..');
function resolveAsset(rel) {
  const p1 = path.join(ROOT, 'app/src/main/assets', rel);
  return fs.existsSync(p1) ? p1 : path.join(ROOT, rel);
}
const NAV_SCRIPT_PATH = resolveAsset('apps/shared/amyfx-universal-nav.js');
const NAV_CODE = fs.readFileSync(NAV_SCRIPT_PATH, 'utf8');

function loadUniversalNav(initialLocation = {}) {
  const location = {
    origin: 'http://localhost:3000',
    pathname: '/apps/academy/index.html',
    search: '',
    hash: '',
    href: 'http://localhost:3000/apps/academy/index.html',
    assign(url) {
      this._assigned = url;
    },
    ...initialLocation
  };

  const sandbox = {
    window: {
      location,
      history: {
        length: 2,
        back() {
          this._backCalled = true;
        },
        forward() {
          this._forwardCalled = true;
        }
      },
      localStorage: { getItem: () => null, setItem: () => {} },
      sessionStorage: { getItem: () => null, setItem: () => {} }
    },
    setTimeout: () => 1,
    setInterval: () => 1,
    URL
  };
  sandbox.globalThis = sandbox.window;
  vm.runInNewContext(NAV_CODE, sandbox);
  return sandbox.window;
}

test('getParentFallbackUrl maps sub-pages 1 logical step up (never blindly to Beranda)', () => {
  const win = loadUniversalNav();
  const { getParentFallbackUrl } = win.AmyUniversalNav;

  // Academy chapter -> Academy Daftar Materi
  assert.equal(
    getParentFallbackUrl('/apps/academy/index.html', '?lesson=bab-01-trading-broker', ''),
    '/apps/academy/index.html'
  );
  // Academy overview -> Home
  assert.equal(getParentFallbackUrl('/apps/academy/index.html', '', ''), '/index.html');

  // Backtest modules -> Backtest tab on Home (#backtest)
  assert.equal(
    getParentFallbackUrl('/apps/academy/trading-practice/candle-replay.html', '', ''),
    '/index.html#backtest'
  );
  assert.equal(
    getParentFallbackUrl('/apps/academy/trading-practice/backtest-history.html', '', ''),
    '/index.html#backtest'
  );
  assert.equal(
    getParentFallbackUrl('/apps/academy/trading-practice/guided-practice.html', '', ''),
    '/index.html#backtest'
  );
  assert.equal(
    getParentFallbackUrl('/apps/academy/trading-practice/index.html', '', ''),
    '/index.html#backtest'
  );

  // Android WebView /assets/ prefix preserved
  assert.equal(
    getParentFallbackUrl('/assets/apps/academy/index.html', '?lesson=bab-07-struktur', ''),
    '/assets/apps/academy/index.html'
  );
  assert.equal(
    getParentFallbackUrl('/assets/apps/academy/trading-practice/candle-replay.html', '', ''),
    '/assets/index.html#backtest'
  );

  // Top-level sub-apps -> Home
  assert.equal(getParentFallbackUrl('/apps/mapping/index.html', '', ''), '/index.html');
  assert.equal(getParentFallbackUrl('/apps/journal/index.html', '', ''), '/index.html');
  assert.equal(getParentFallbackUrl('/apps/market-intel/index.html', '', ''), '/index.html');
});

test('resolveBackStep enforces priority: page-handler -> overlay -> history-back -> parent fallback', () => {
  const win = loadUniversalNav();
  const { resolveBackStep } = win.AmyUniversalNav;
  const plain = (v) => JSON.parse(JSON.stringify(v));

  // Root home is noop
  assert.deepEqual(plain(resolveBackStep({ pathname: '/' })), { action: 'noop', targetUrl: null });
  assert.deepEqual(plain(resolveBackStep({ pathname: '/index.html' })), { action: 'noop', targetUrl: null });

  // Page handler wins over everything
  assert.deepEqual(
    plain(resolveBackStep({ pathname: '/apps/academy/index.html', search: '?lesson=bab-01', pageHandled: true })),
    { action: 'page-handler', targetUrl: null }
  );

  // Overlay wins over history-back
  assert.deepEqual(
    plain(resolveBackStep({ pathname: '/apps/mapping/index.html', overlayClosed: true, historyLength: 5 })),
    { action: 'overlay', targetUrl: null }
  );

  // Same-origin referrer + history -> real 1-step history-back with safe parent fallback
  assert.deepEqual(
    plain(resolveBackStep({
      pathname: '/apps/academy/trading-practice/candle-replay.html',
      historyLength: 3,
      referrer: 'http://localhost:3000/apps/academy/trading-practice/index.html',
      origin: 'http://localhost:3000'
    })),
    { action: 'history-back', targetUrl: '/index.html#backtest' }
  );

  // Direct deep-link (historyLength === 1) -> navigates 1 step up to parent fallback
  assert.deepEqual(
    plain(resolveBackStep({
      pathname: '/apps/academy/index.html',
      search: '?lesson=bab-05-mt5',
      historyLength: 1,
      origin: 'http://localhost:3000'
    })),
    { action: 'navigate', targetUrl: '/apps/academy/index.html' }
  );

  // External referrer -> navigates 1 step up instead of leaving app
  assert.deepEqual(
    plain(resolveBackStep({
      pathname: '/apps/academy/trading-practice/candle-replay.html',
      historyLength: 4,
      referrer: 'https://external.example.com/',
      origin: 'http://localhost:3000'
    })),
    { action: 'navigate', targetUrl: '/index.html#backtest' }
  );
});

test('goBack does NOT short-circuit to Android.goHome() when page handler or history exists', () => {
  let goHomeCalled = false;
  let handlerCalled = false;
  const win = loadUniversalNav({
    pathname: '/apps/academy/index.html',
    search: '?lesson=bab-02-pips',
    href: 'http://localhost:3000/apps/academy/index.html?lesson=bab-02-pips'
  });
  win.Android = {
    goHome() {
      goHomeCalled = true;
    }
  };
  win.__amyfxPageBackHandler = () => {
    handlerCalled = true;
    return true;
  };

  win.AmyUniversalNav.goBack();
  assert.equal(handlerCalled, true, 'Page back handler must run first');
  assert.equal(goHomeCalled, false, 'Android.goHome must NOT hijack in-page back');
  assert.equal(win.history._backCalled, undefined);

  // Without page handler, history.back() must run first instead of Android.goHome()
  win.__amyfxPageBackHandler = null;
  win.AmyUniversalNav.goBack();
  assert.equal(win.history._backCalled, true, 'history.back() must run before Android.goHome()');
  assert.equal(goHomeCalled, false, 'Android.goHome must NOT fire before history.back()');
});

test('Backtest & Academy HTML files wire clean 1-step back navigation & unified TradingView Replay dock', () => {
  const replayHtml = fs.readFileSync(
    resolveAsset('apps/academy/trading-practice/candle-replay.html'),
    'utf8'
  );
  assert.match(replayHtml, /id="btBackBtn"/, 'Candle Replay must have top-left #btBackBtn');
  assert.match(replayHtml, /id="tvDrawingDock"/, 'Candle Replay must have unified #tvDrawingDock container');
  assert.match(replayHtml, /id="replayFullscreen"/, 'Candle Replay must pin #replayFullscreen in top bar');
  assert.match(replayHtml, /id="replayIctToggle"/, 'Candle Replay must pin #replayIctToggle in top bar');
  assert.match(replayHtml, /id="replayFollow"/, 'Candle Replay must pin #replayFollow in top bar');

  const academyHtml = fs.readFileSync(resolveAsset('apps/academy/index.html'), 'utf8');
  assert.match(academyHtml, /id="acdBackLink"/, 'Academy must expose #acdBackLink');
  assert.match(academyHtml, /id="acdBackLabel"/, 'Academy must expose #acdBackLabel');

  const academyJs = fs.readFileSync(resolveAsset('apps/academy/js/academy-app.js'), 'utf8');
  assert.match(academyJs, /__amyfxPageBackHandler/, 'Academy must register __amyfxPageBackHandler');

  const rootAppJs = fs.readFileSync(resolveAsset('app.js'), 'utf8');
  assert.match(rootAppJs, /resolveTabFromHash/, 'Root app.js must resolve #backtest hash to proyek tab');
});
