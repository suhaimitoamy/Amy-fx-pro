(function () {
  'use strict';

  if (window.__amyFxProfileSystemSettingsInstalled) return;
  window.__amyFxProfileSystemSettingsInstalled = true;

  function injectSettings() {
    const selector = document.querySelector('#main-content .theme-selector');
    if (!selector || document.querySelector('[data-amyfx-color-settings]')) return;
    const colors = window.AmyFXTheme?.colors || {};
    const defaults = window.AmyFXTheme?.resolved === 'light'
      ? { background: '#eef4fa', surface: '#ffffff', text: '#111a25', accent: '#216bdb' }
      : { background: '#070b12', surface: '#111c29', text: '#f5f8fc', accent: '#69b7ff' };
    const section = document.createElement('section');
    section.className = 'color-customizer';
    section.dataset.amyfxColorSettings = 'true';
    section.innerHTML = `<div class="color-customizer-head"><div><strong>Personalisasi warna</strong><small>Atur warna utama untuk semua menu.</small></div><button type="button" data-theme-colors-reset>Reset</button></div><div class="color-customizer-grid">${[
      ['background', 'Latar'], ['surface', 'Kartu'], ['text', 'Teks'], ['accent', 'Aksen']
    ].map(([key, label]) => `<label><span>${label}</span><input type="color" data-theme-color="${key}" value="${colors[key] || defaults[key]}" aria-label="Warna ${label.toLowerCase()}"></label>`).join('')}</div>`;
    selector.insertAdjacentElement('afterend', section);
  }

  function browserNotification(title, body) {
    if (typeof Notification === 'undefined') return false;
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') new Notification(title, { body, tag: 'amyfx-profile-test' });
    });
    return true;
  }

  function testNotification() {
    const title = 'AMY FX — TES NOTIFIKASI';
    const body = 'Notifikasi Amy FX berfungsi pada perangkat ini.';
    const target = location.href.split('#')[0];

    if (window.Android?.showNotificationWithUrl) {
      window.Android.showNotificationWithUrl(title, body, target);
      window.showToast?.('Tes notifikasi dikirim.');
      return;
    }

    if (browserNotification(title, body)) {
      window.showToast?.('Tes notifikasi dikirim.');
      return;
    }

    window.showToast?.('Notifikasi belum tersedia pada perangkat ini.');
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-profile-action="test-notification"]')) testNotification();
    if (event.target.closest('[data-theme-colors-reset]')) {
      window.AmyFXTheme?.resetColors?.();
      document.querySelector('[data-amyfx-color-settings]')?.remove();
      injectSettings();
      window.showToast?.('Warna dikembalikan ke tema bawaan.');
    }
  });

  document.addEventListener('input', event => {
    const input = event.target.closest?.('[data-theme-color]');
    if (!input) return;
    const values = { ...(window.AmyFXTheme?.colors || {}), [input.dataset.themeColor]: input.value };
    window.AmyFXTheme?.setColors?.(values);
  });

  const main = document.getElementById('main-content');
  if (main) new MutationObserver(injectSettings).observe(main, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSettings, { once: true });
  } else {
    injectSettings();
  }
})();
