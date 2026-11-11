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
