(function () {
  "use strict";

  if (window.__amyFxThemeController) return;
  window.__amyFxThemeController = true;

  const STORAGE_KEY = "amyfx.ui.theme.v1";
  const CUSTOM_KEY = "amyfx.ui.colors.v1";
  const BG_STORAGE_KEY = "amyfx.ui.custom_bg.v1";
  const LEGACY_KEYS = ["amyfx.theme", "amy_theme"];
  const media = window.matchMedia?.("(prefers-color-scheme: light)");
  const root = document.documentElement;
  let preference = readPreference();

  function readCustomBg() {
    try {
      const raw = localStorage.getItem(BG_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.image === "string" && parsed.image.startsWith("data:image/")) {
        return {
          image: parsed.image,
          dim: typeof parsed.dim === "number" ? Math.max(10, Math.min(95, parsed.dim)) : 60,
          blur: typeof parsed.blur === "number" ? Math.max(0, Math.min(30, parsed.blur)) : 0
        };
      }
    } catch (_) {}
    return null;
  }

  function applyCustomBg(bgData) {
    let layer = document.getElementById("amyfx-custom-bg-layer");
    let overlay = document.getElementById("amyfx-custom-bg-overlay");

    if (!bgData || !bgData.image) {
      if (layer) layer.style.display = "none";
      if (overlay) overlay.style.display = "none";
      root.removeAttribute("data-amyfx-custom-bg");
      return;
    }

    if (!layer) {
      layer = document.createElement("div");
      layer.id = "amyfx-custom-bg-layer";
      layer.style.cssText = "position:fixed;inset:0;z-index:-2;background-size:cover;background-position:center;background-repeat:no-repeat;pointer-events:none;transform:scale(1.05);transition:filter 0.25s ease, opacity 0.3s ease;";
      (document.body || document.documentElement).appendChild(layer);
    }
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "amyfx-custom-bg-overlay";
      overlay.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;transition:background-color 0.25s ease;";
      (document.body || document.documentElement).appendChild(overlay);
    }

    const resolved = resolvedTheme(preference);
    const dimAlpha = (bgData.dim ?? 60) / 100;
    const overlayColor = resolved === "light"
      ? `rgba(238, 244, 250, ${Math.max(0.35, dimAlpha)})`
      : `rgba(7, 11, 18, ${Math.max(0.35, dimAlpha)})`;

    layer.style.display = "block";
    layer.style.backgroundImage = `url("${bgData.image}")`;
    layer.style.filter = bgData.blur ? `blur(${bgData.blur}px)` : "none";
    overlay.style.display = "block";
    overlay.style.backgroundColor = overlayColor;
    root.setAttribute("data-amyfx-custom-bg", "true");
  }

  const CUSTOM_PROPERTIES = Object.freeze({
    background: ["--amy-bg", "--amy-bg-secondary", "--bg-color"],
    surface: ["--amy-surface", "--amy-surface-strong", "--amy-surface-solid", "--surface-color"],
    text: ["--amy-text", "--amy-text-secondary", "--amy-text-muted", "--text-main"],
    accent: ["--amy-accent", "--amy-accent-strong", "--amy-cyan", "--primary-gold", "--gold", "--gold-text"]
  });
  let customColors = readCustomColors();

  function hexToRgb(hex) {
    if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
    const num = parseInt(hex.slice(1), 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function hexToRgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  function validColor(value) {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : "";
  }

  function readCustomColors() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "{}");
      const result = Object.fromEntries(Object.keys(CUSTOM_PROPERTIES)
        .map(key => [key, validColor(parsed?.[key])])
        .filter(([, value]) => value));
      if (parsed?.opacity !== undefined) {
        const op = parseInt(parsed.opacity, 10);
        if (!isNaN(op) && op >= 10 && op <= 100) result.opacity = op;
      }
      if (parsed?.preset) result.preset = String(parsed.preset);
      return result;
    } catch (_) {
      return {};
    }
  }

  function applyCustomColors() {
    const resolved = resolvedTheme(preference);
    const hasCustom = Object.keys(customColors).length > 0;

    if (resolved === 'light') {
      // In Light Mode: strictly guarantee high-contrast dark typography and light surfaces
      root.style.setProperty('--amy-text', '#111a25');
      root.style.setProperty('--amy-text-secondary', '#556680');
      root.style.setProperty('--amy-text-muted', '#8592a2');
      root.style.setProperty('--text-main', '#16233a');
      root.style.setProperty('--text-muted', '#556680');
      root.style.setProperty('--amy-bg', '#eef4fa');
      root.style.setProperty('--amy-bg-secondary', '#f7fafd');
      root.style.setProperty('--bg-color', '#eef4fa');
      root.style.setProperty('--surface-color', '#ffffff');
      root.style.setProperty('--surface-soft', 'rgba(240, 246, 253, 0.88)');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--amy-surface', 'rgba(255, 255, 255, 0.82)');
      root.style.setProperty('--amy-surface-strong', 'rgba(255, 255, 255, 0.94)');
      root.style.setProperty('--amy-surface-solid', '#ffffff');
      root.style.setProperty('--amy-surface-soft', 'rgba(33, 107, 219, 0.065)');
      root.style.setProperty('--amy-highlight', 'rgba(255, 255, 255, 0.92)');
      root.style.setProperty('--amy-blur', '16px');

      if (customColors.accent) {
        root.style.setProperty('--glow-gold', hexToRgba(customColors.accent, 0.2));
        root.style.setProperty('--amy-border', hexToRgba(customColors.accent, 0.28));
        root.style.setProperty('--border-color', hexToRgba(customColors.accent, 0.25));
        root.style.setProperty('--primary-gold', customColors.accent);
        root.style.setProperty('--secondary-gold', customColors.accent);
        root.style.setProperty('--amy-accent', customColors.accent);
      } else {
        root.style.setProperty('--glow-gold', 'rgba(33, 107, 219, 0.16)');
        root.style.setProperty('--amy-border', 'rgba(46, 84, 126, 0.18)');
        root.style.setProperty('--border-color', 'rgba(46, 84, 126, 0.2)');
        root.style.setProperty('--primary-gold', '#1656b8');
        root.style.setProperty('--secondary-gold', '#1656b8');
        root.style.setProperty('--amy-accent', '#216bdb');
      }

      root.toggleAttribute("data-amyfx-custom-colors", hasCustom);
      return;
    }

    const opacityVal = customColors.opacity !== undefined ? Number(customColors.opacity) : 68;
    const alpha = Math.max(0.12, Math.min(0.96, opacityVal / 100));

    Object.entries(CUSTOM_PROPERTIES).forEach(([key, properties]) => {
      const value = validColor(customColors[key]);
      properties.forEach(property => {
        if (value) {
          if (key === 'surface') {
            if (property === '--amy-surface') {
              root.style.setProperty(property, hexToRgba(value, alpha));
            } else if (property === '--amy-surface-strong') {
              root.style.setProperty(property, hexToRgba(value, Math.min(0.96, alpha + 0.16)));
            } else if (property === '--amy-surface-solid') {
              root.style.setProperty(property, value);
            } else {
              root.style.setProperty(property, value);
            }
          } else if (key === 'background') {
            if (property === '--amy-bg-secondary') {
              root.style.setProperty(property, hexToRgba(value, 0.88));
            } else {
              root.style.setProperty(property, value);
            }
          } else {
            root.style.setProperty(property, value);
          }
        } else {
          root.style.removeProperty(property);
        }
      });
    });

    if (customColors.surface) {
      const surfVal = customColors.surface;
      root.style.setProperty('--amy-surface-soft', hexToRgba(surfVal, 0.14));
      root.style.setProperty('--surface-soft', hexToRgba(surfVal, Math.min(0.96, alpha + 0.12)));
      root.style.setProperty('--surface-color', hexToRgba(surfVal, alpha));
      root.style.setProperty('--card', hexToRgba(surfVal, alpha));
      root.style.setProperty('--bg-card', hexToRgba(surfVal, alpha));
      const highlightAlpha = Math.max(0.06, (100 - opacityVal) / 260);
      root.style.setProperty('--amy-highlight', `rgba(255, 255, 255, ${highlightAlpha.toFixed(2)})`);
      root.style.setProperty('--amy-blur', `${Math.round(16 + (100 - opacityVal) * 0.12)}px`);
    } else {
      root.style.removeProperty('--amy-surface-soft');
      root.style.removeProperty('--surface-soft');
      root.style.removeProperty('--surface-color');
      root.style.removeProperty('--card');
      root.style.removeProperty('--bg-card');
      root.style.removeProperty('--amy-highlight');
      root.style.removeProperty('--amy-blur');
    }

    if (customColors.accent) {
      root.style.setProperty('--glow-gold', hexToRgba(customColors.accent, 0.35));
      root.style.setProperty('--amy-border', hexToRgba(customColors.accent, 0.22));
      root.style.setProperty('--border-color', hexToRgba(customColors.accent, 0.22));
      root.style.setProperty('--primary-gold', customColors.accent);
      root.style.setProperty('--secondary-gold', customColors.accent);
    } else {
      root.style.removeProperty('--glow-gold');
      root.style.removeProperty('--amy-border');
      root.style.removeProperty('--border-color');
      root.style.removeProperty('--primary-gold');
      root.style.removeProperty('--secondary-gold');
    }

    root.toggleAttribute("data-amyfx-custom-colors", hasCustom);
  }

  function normalize(value) {
    const theme = String(value || "").toLowerCase();
    return ["system", "light", "dark"].includes(theme) ? theme : "system";
  }

  function readPreference() {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) return normalize(current);
      for (const key of LEGACY_KEYS) {
        const legacy = localStorage.getItem(key);
        if (legacy) return normalize(legacy);
      }
    } catch (_) {}
    return "system";
  }

  function resolvedTheme(value = preference) {
    if (value === "light" || value === "dark") return value;
    return "dark";
  }

  function moduleName() {
    const path = String(location.pathname || "").toLowerCase();
    if (path.includes("/apps/mapping/")) return "mapping";
    if (path.includes("/apps/market-intel/")) return "intel";
    if (path.includes("/apps/journal/")) return "journal";
    if (path.includes("/apps/academy/")) return "academy";
    return "home";
  }

  function updateThemeColor(theme) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head?.appendChild(meta);
    }
    meta.content = theme === "light" ? "#eef4fa" : "#070b12";
  }

  function syncNative(theme) {
    try { window.Android?.setSystemUiTheme?.(theme); } catch (_) {}
  }

  function syncControls() {
    document.querySelectorAll("[data-amyfx-theme-choice]").forEach(control => {
      const active = normalize(control.dataset.amyfxThemeChoice) === preference;
      control.classList.toggle("is-active", active);
      control.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function apply(nextPreference = preference, options = {}) {
    preference = normalize(nextPreference);
    const theme = resolvedTheme(preference);
    root.dataset.amyfxThemeChoice = preference;
    root.dataset.amyfxTheme = theme;
    root.style.colorScheme = theme;
    applyCustomColors();
    applyCustomBg(readCustomBg());
    updateThemeColor(theme);
    syncNative(theme);
    syncControls();
    if (options.persist) {
      try { localStorage.setItem(STORAGE_KEY, preference); } catch (_) {}
    }
    window.dispatchEvent(new CustomEvent("amyfx:theme-change", {
      detail: Object.freeze({ preference, theme })
    }));
    return theme;
  }

  function decorateDocument() {
    const name = moduleName();
    document.body?.classList.add("amyfx-module", `amyfx-module--${name}`);
    document.body?.setAttribute("data-amyfx-module", name);
    syncControls();
  }

  root.dataset.amyfxThemeChoice = preference;
  root.dataset.amyfxTheme = resolvedTheme(preference);
  root.style.colorScheme = root.dataset.amyfxTheme;
  applyCustomColors();
  applyCustomBg(readCustomBg());
  updateThemeColor(root.dataset.amyfxTheme);

  window.AmyFXTheme = Object.freeze({
    key: STORAGE_KEY,
    get preference() { return preference; },
    get resolved() { return resolvedTheme(preference); },
    get colors() { return Object.freeze({ ...customColors }); },
    get customBg() { return readCustomBg(); },
    setCustomBg(bgData) {
      if (!bgData || !bgData.image) {
        try { localStorage.removeItem(BG_STORAGE_KEY); } catch (_) {}
        applyCustomBg(null);
      } else {
        try { localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(bgData)); } catch (_) {}
        applyCustomBg(bgData);
      }
      return bgData;
    },
    removeCustomBg() {
      try { localStorage.removeItem(BG_STORAGE_KEY); } catch (_) {}
      applyCustomBg(null);
    },
    set(value) { return apply(value, { persist: true }); },
    setColors(values = {}) {
      const next = Object.fromEntries(Object.keys(CUSTOM_PROPERTIES)
        .map(key => [key, validColor(values[key])])
        .filter(([, value]) => value));
      if (values.opacity !== undefined) {
        const op = parseInt(values.opacity, 10);
        if (!isNaN(op) && op >= 10 && op <= 100) next.opacity = op;
      }
      if (values.preset) next.preset = String(values.preset);
      customColors = next;
      try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(customColors)); } catch (_) {}
      applyCustomColors();
      return preference;
    },
    resetColors() {
      customColors = {};
      try { localStorage.removeItem(CUSTOM_KEY); } catch (_) {}
      applyCustomColors();
      return preference;
    },
    setPreset(presetId) {
      const PRESETS = {
        obsidian: { background: '#070b14', surface: '#0f172a', text: '#f8fafc', accent: '#f5c451', opacity: 68 },
        emerald: { background: '#05130e', surface: '#0a2218', text: '#eafaf1', accent: '#22c55e', opacity: 62 },
        sapphire: { background: '#070e20', surface: '#0c1d38', text: '#f0f6ff', accent: '#3b82f6', opacity: 62 },
        cyber: { background: '#070e20', surface: '#0c1d38', text: '#f0f6ff', accent: '#3b82f6', opacity: 62 },
        gold: { background: '#0c0f18', surface: '#1e1910', text: '#fffdf5', accent: '#f5c451', opacity: 65 },
        amber: { background: '#0c0f18', surface: '#1e1910', text: '#fffdf5', accent: '#f5c451', opacity: 65 },
        amethyst: { background: '#0d0718', surface: '#1f0f35', text: '#f8f0ff', accent: '#c084fc', opacity: 60 }
      };
      const found = PRESETS[presetId];
      if (found) {
        return this.setColors({ ...found, preset: presetId });
      }
      return preference;
    },
    apply
  });

  document.addEventListener("click", event => {
    const target = event.target.closest?.("[data-amyfx-theme-choice]");
    if (!target) return;
    apply(target.dataset.amyfxThemeChoice, { persist: true });
  });

  const onSystemChange = () => { if (preference === "system") apply("system"); };
  if (media?.addEventListener) media.addEventListener("change", onSystemChange);
  else media?.addListener?.(onSystemChange);

  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) apply(event.newValue || "system");
    if (event.key === CUSTOM_KEY) {
      customColors = readCustomColors();
      apply(preference);
    }
    if (event.key === BG_STORAGE_KEY) {
      applyCustomBg(readCustomBg());
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      decorateDocument();
      apply(preference);
    }, { once: true });
  } else {
    decorateDocument();
    apply(preference);
  }
})();
