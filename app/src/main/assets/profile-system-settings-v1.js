(function () {
  'use strict';

  // Personalisasi warna & Kaca - Panel tema & sistem warna Amy FX Pro
  if (window.__amyFxProfileSystemSettingsInstalled) return;
  window.__amyFxProfileSystemSettingsInstalled = true;

  const DARK_GLASS_PRESETS = [
    { id: 'sapphire', name: 'Safir Cobalt', background: '#070e1b', surface: '#10213d', text: '#f0f6ff', accent: '#38bdf8', opacity: 60 },
    { id: 'crystal', name: 'Kristal Es', background: '#08101a', surface: '#1a2c42', text: '#ffffff', accent: '#5de6ff', opacity: 40 },
    { id: 'obsidian', name: 'Obsidian Kaca', background: '#070b12', surface: '#111c29', text: '#f5f8fc', accent: '#69b7ff', opacity: 72 },
    { id: 'emerald', name: 'Zamrud Hutan', background: '#05130d', surface: '#0d2719', text: '#eafaf1', accent: '#34d399', opacity: 58 },
    { id: 'amethyst', name: 'Royal Amethyst', background: '#0d0718', surface: '#1f0f35', text: '#f8f0ff', accent: '#c084fc', opacity: 58 },
    { id: 'amber', name: 'Amber Gold', background: '#110b05', surface: '#2c1e0e', text: '#fff9ed', accent: '#fbbf24', opacity: 62 }
  ];

  const LIGHT_GLASS_PRESETS = [
    { id: 'frosted-light', name: 'Kristal Terang', background: '#eef4fa', surface: '#ffffff', text: '#111a25', accent: '#216bdb', opacity: 75 },
    { id: 'aqua-light', name: 'Aquamarine', background: '#e8f5f8', surface: '#cbe7ee', text: '#0d252b', accent: '#0284c7', opacity: 70 },
    { id: 'rose-light', name: 'Rose Quartz', background: '#faeff3', surface: '#f7dce5', text: '#291018', accent: '#e11d48', opacity: 70 }
  ];

  function getActivePresets() {
    return window.AmyFXTheme?.resolved === 'light' ? LIGHT_GLASS_PRESETS : DARK_GLASS_PRESETS;
  }

  function getThemeDefaults() {
    return window.AmyFXTheme?.resolved === 'light'
      ? { background: '#eef4fa', surface: '#ffffff', text: '#111a25', accent: '#216bdb', opacity: 80 }
      : { background: '#070b12', surface: '#111c29', text: '#f5f8fc', accent: '#69b7ff', opacity: 68 };
  }

  function renderPresetButtons(presetsGrid) {
    if (!presetsGrid) return;
    const presets = getActivePresets();
    const currentPreset = window.AmyFXTheme?.colors?.preset || '';
    presetsGrid.innerHTML = presets.map(p => `
      <button type="button" class="profile-preset-btn ${currentPreset === p.id ? 'is-active' : ''}" data-glass-preset="${p.id}" title="${p.name}">
        <span class="profile-preset-swatch" style="background:${p.surface}; border-color:${p.accent}; box-shadow: 0 0 0 2px color-mix(in srgb, ${p.accent} 28%, transparent);"></span>
        <span class="profile-preset-label">${p.name}</span>
      </button>
    `).join('');
  }

  function syncColorPanel(panel) {
    if (!panel) return;
    const colors = window.AmyFXTheme?.colors || {};
    const defaults = getThemeDefaults();
    const opacity = colors.opacity !== undefined ? Number(colors.opacity) : defaults.opacity;

    const activePref = window.AmyFXTheme?.preference || 'system';
    panel.querySelectorAll('[data-amyfx-theme-choice]').forEach(btn => {
      const isActive = btn.dataset.amyfxThemeChoice === activePref;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    renderPresetButtons(panel.querySelector('[data-glass-presets-grid]'));

    panel.querySelectorAll('[data-theme-color]').forEach(input => {
      const key = input.dataset.themeColor;
      const val = colors[key] || defaults[key];
      if (val) {
        input.value = val;
        const hexSpan = panel.querySelector(`[data-hex-for="${key}"]`);
        if (hexSpan) hexSpan.textContent = val.toUpperCase();
      }
    });

    const slider = panel.querySelector('[data-theme-glass-opacity]');
    if (slider) slider.value = opacity;

    const badge = panel.querySelector('#glass-opacity-val');
    if (badge) badge.textContent = `${opacity}%`;

    panel.querySelectorAll('[data-quick-opacity]').forEach(chip => {
      chip.classList.toggle('is-active', Number(chip.dataset.quickOpacity) === opacity);
    });
  }

  function hydrateUnifiedSettings() {
    const unified = document.querySelector('#main-content [data-amyfx-unified-appearance="true"]');
    if (unified) {
      if (unified.dataset.amyfxHydrated === 'true') return;
      unified.dataset.amyfxHydrated = 'true';
      syncColorPanel(unified);
      return;
    }

    // Fallback for any legacy page layout without unified appearance panel
    const selector = document.querySelector('#main-content .theme-selector');
    if (!selector) return;
    const prevTitle = selector.previousElementSibling;
    if (prevTitle && prevTitle.classList.contains('profile-section-title') && prevTitle.textContent !== 'Tampilan & Gaya Kaca') {
      prevTitle.textContent = 'Tampilan & Gaya Kaca';
    }
    if (document.querySelector('[data-amyfx-color-settings]')) return;
    syncColorPanel(selector.closest('section'));
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

    const colorCell = event.target.closest('[data-color-cell]');
    if (colorCell && event.target.tagName !== 'INPUT') {
      const input = colorCell.querySelector('input[type="color"]');
      input?.click?.();
      return;
    }

    const resetBtn = event.target.closest('[data-theme-colors-reset]');
    if (resetBtn) {
      window.AmyFXTheme?.resetColors?.();
      const panel = document.querySelector('[data-amyfx-color-settings]');
      if (panel) syncColorPanel(panel);
      window.showToast?.('Warna dan efek kaca dikembalikan ke tema bawaan.');
      return;
    }

    const presetBtn = event.target.closest('[data-glass-preset]');
    if (presetBtn) {
      const presetId = presetBtn.dataset.glassPreset;
      const presets = getActivePresets();
      const preset = presets.find(p => p.id === presetId);
      if (preset) {
        window.AmyFXTheme?.setColors?.({
          background: preset.background,
          surface: preset.surface,
          text: preset.text,
          accent: preset.accent,
          opacity: preset.opacity,
          preset: preset.id
        });
        const panel = document.querySelector('[data-amyfx-color-settings]');
        if (panel) syncColorPanel(panel);
        window.showToast?.(`Tema kaca ${preset.name} diterapkan.`);
      }
      return;
    }

    const chipBtn = event.target.closest('[data-quick-opacity]');
    if (chipBtn) {
      const op = parseInt(chipBtn.dataset.quickOpacity, 10);
      const current = window.AmyFXTheme?.colors || {};
      window.AmyFXTheme?.setColors?.({ ...current, opacity: op });
      const panel = document.querySelector('[data-amyfx-color-settings]');
      if (panel) syncColorPanel(panel);
      window.showToast?.(`Transparansi kaca diatur ke ${op}%.`);
      return;
    }
  });

  function handleColorOrOpacity(event) {
    const colorInput = event.target.closest?.('[data-theme-color]');
    if (colorInput) {
      const key = colorInput.dataset.themeColor;
      const val = colorInput.value;
      const values = { ...(window.AmyFXTheme?.colors || {}), [key]: val };
      window.AmyFXTheme?.setColors?.(values);
      const panel = document.querySelector('[data-amyfx-color-settings]');
      const hexSpan = panel?.querySelector(`[data-hex-for="${key}"]`);
      if (hexSpan) hexSpan.textContent = val.toUpperCase();
      return;
    }

    const opacityInput = event.target.closest?.('[data-theme-glass-opacity]');
    if (opacityInput) {
      const op = parseInt(opacityInput.value, 10);
      const values = { ...(window.AmyFXTheme?.colors || {}), opacity: op };
      window.AmyFXTheme?.setColors?.(values);
      const panel = document.querySelector('[data-amyfx-color-settings]');
      if (panel) {
        const badge = panel.querySelector('#glass-opacity-val');
        if (badge) badge.textContent = `${op}%`;
        panel.querySelectorAll('[data-quick-opacity]').forEach(chip => {
          chip.classList.toggle('is-active', Number(chip.dataset.quickOpacity) === op);
        });
      }
      return;
    }
  }

  document.addEventListener('input', handleColorOrOpacity);
  document.addEventListener('change', handleColorOrOpacity);

  window.addEventListener('amyfx:theme-change', () => {
    const panel = document.querySelector('[data-amyfx-color-settings]');
    if (panel) syncColorPanel(panel);
  });

  window.AmyFXProfileSettings = { sync: hydrateUnifiedSettings };

  const main = document.getElementById('main-content');
  if (main) {
    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-amyfx-color-settings]')) {
        observer.disconnect();
        return;
      }
      hydrateUnifiedSettings();
    });
    observer.observe(main, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateUnifiedSettings, { once: true });
  } else {
    hydrateUnifiedSettings();
  }
})();
