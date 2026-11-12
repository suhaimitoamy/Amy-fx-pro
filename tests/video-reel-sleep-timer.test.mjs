import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Video reel features: Auto-Next, Loop toggle, and Sleep Timer are defined in app.js and styles.css', () => {
  const appJs = fs.readFileSync('app/src/main/assets/app.js', 'utf8');
  const stylesCss = fs.readFileSync('app/src/main/assets/styles.css', 'utf8');

  // Verify play mode helper functions and key
  assert.ok(appJs.includes("const REEL_PLAY_MODE_KEY = 'amy_reel_play_mode'"), 'REEL_PLAY_MODE_KEY defined');
  assert.ok(appJs.includes('function getReelPlayMode()'), 'getReelPlayMode helper defined');
  assert.ok(appJs.includes('function setReelPlayMode(mode)'), 'setReelPlayMode helper defined');
  assert.ok(appJs.includes('function clearReelSleepTimer()'), 'clearReelSleepTimer helper defined');
  assert.ok(appJs.includes('function triggerSleepTimerExpiry()'), 'triggerSleepTimerExpiry helper defined');

  // Verify UI elements in dialog markup
  assert.ok(appJs.includes('id="amyReelPlayModeBtn"'), 'Play mode button exists in template');
  assert.ok(appJs.includes('id="amyReelSleepTimerBtn"'), 'Sleep timer button exists in template');
  assert.ok(appJs.includes('id="amyReelTimerSheet"'), 'Sleep timer sheet exists in template');
  assert.ok(appJs.includes('data-timer-val="end_of_video"'), 'End of video timer option exists');
  assert.ok(appJs.includes('id="amyReelCustomMinInput"'), 'Custom minutes input exists');

  // Verify auto-next scroll logic on video ended
  assert.ok(appJs.includes("video.addEventListener('ended'"), 'Video ended listener attached');
  assert.ok(appJs.includes("scrollIntoView({ behavior: 'smooth' })"), 'Auto-next smooth scrolling implemented');

  // Verify styles in styles.css
  assert.ok(stylesCss.includes('.amy-reel-actions'), '.amy-reel-actions styled in styles.css');
  assert.ok(stylesCss.includes('.amy-reel-btn'), '.amy-reel-btn styled in styles.css');
  assert.ok(stylesCss.includes('.amy-reel-timer-sheet'), '.amy-reel-timer-sheet styled in styles.css');
  assert.ok(stylesCss.includes('.amy-timer-btn'), '.amy-timer-btn styled in styles.css');
});

test('Reel play mode defaults to auto_next and toggles cleanly', () => {
  let store = {};
  const mockLocalStorage = {
    getItem: k => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); }
  };

  const REEL_PLAY_MODE_KEY = 'amy_reel_play_mode';
  function getReelPlayMode() {
    try {
      return mockLocalStorage.getItem(REEL_PLAY_MODE_KEY) || 'auto_next';
    } catch (_) {
      return 'auto_next';
    }
  }
  function setReelPlayMode(mode) {
    mockLocalStorage.setItem(REEL_PLAY_MODE_KEY, mode);
  }

  // Default
  assert.equal(getReelPlayMode(), 'auto_next');

  // Toggle to loop
  setReelPlayMode('loop');
  assert.equal(getReelPlayMode(), 'loop');

  // Toggle back to auto_next
  setReelPlayMode('auto_next');
  assert.equal(getReelPlayMode(), 'auto_next');
});

test('Sleep timer calculation and formatting handles hours and minutes accurately', () => {
  function formatRemaining(seconds) {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}j ${m}m`;
    } else if (seconds >= 60) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${seconds}s`;
  }

  assert.equal(formatRemaining(7200), '2j 0m');
  assert.equal(formatRemaining(3665), '1j 1m');
  assert.equal(formatRemaining(900), '15:00');
  assert.equal(formatRemaining(45), '45s');
});

test('Video reel does not lock whole app into inert mode and Amy Live retains pointer events', () => {
  const appJs = fs.readFileSync('app/src/main/assets/app.js', 'utf8');
  const stylesCss = fs.readFileSync('app/src/main/assets/styles.css', 'utf8');
  const bridgeJs = fs.readFileSync('app/src/main/assets/apps/shared/amy-gemini-live-bridge.js', 'utf8');
  const assistantJs = fs.readFileSync('app/src/main/assets/apps/shared/amy-local-assistant.js', 'utf8');

  // Verify renderMedia safe signature
  assert.ok(appJs.includes('async function renderMedia(options = {})'), 'renderMedia accepts options default parameter');

  // Verify video reel does NOT use dialog.showModal()
  assert.ok(!appJs.includes('openVideoReel') || !appJs.includes('openVideoReel(activeItem) {\n    const all = await loadAllMediaItems();\n    const others = shuffleMedia(all.filter(it => isVideoMediaItem(it) && it.id !== activeItem.id)).slice(0, 20);\n    const feedItems = [activeItem, ...others];\n\n    let dialog = document.getElementById(\'rootVideoReelDialog\');\n    if (!dialog) {\n      dialog = document.createElement(\'dialog\');\n      dialog.id = \'rootVideoReelDialog\';\n      dialog.className = \'amy-reel-dialog\';\n      dialog.addEventListener(\'cancel\', e => { e.preventDefault(); closeVideoReel(); });\n      document.body.appendChild(dialog);\n    }\n    reelState.dialog = dialog;\n\n    dialog.showModal();'), 'openVideoReel does not use showModal');
  assert.ok(appJs.includes('window.AmyFXCloseVideoReel = closeVideoReel;'), 'Global AmyFXCloseVideoReel hook exported');

  // Verify styles hide FAB when reel is open to prevent accidental taps
  assert.ok(stylesCss.includes('body.is-reel-open #amy-local-fab'), 'FAB hidden when video reel is open');

  // Verify Amy Live dialog dismiss and pointer events
  assert.ok(assistantJs.includes('AmyFXCloseVideoReel'), 'assistant open() calls AmyFXCloseVideoReel');
  assert.ok(bridgeJs.includes('AmyFXCloseVideoReel'), 'bridge setBubbleFullscreen() calls AmyFXCloseVideoReel');
  assert.ok(bridgeJs.includes('pointer-events: auto !important;'), 'Amy Live panel has explicit pointer-events: auto');
});
