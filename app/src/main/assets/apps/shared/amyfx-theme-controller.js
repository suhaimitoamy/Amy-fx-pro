(function () {
  "use strict";

  if (window.__amyFxThemeController) return;
  window.__amyFxThemeController = true;

  const STORAGE_KEY = "amyfx.ui.theme.v1";
  const CUSTOM_KEY = "amyfx.ui.colors.v1";
  const LEGACY_KEYS = ["amyfx.theme", "amy_theme"];
  const media = window.matchMedia?.("(prefers-color-scheme: light)");
  const root = document.documentElement;
  let preference = readPreference();

  const CUSTOM_PROPERTIES = Object.freeze({
    background: ["--amy-bg", "--amy-bg-secondary"],
    surface: ["--amy-surface", "--amy-surface-strong", "--amy-surface-solid"],
    text: ["--amy-text", "--amy-text-secondary", "--amy-text-muted"],
    accent: ["--amy-accent", "--amy-accent-strong", "--amy-cyan"]
  });
  let customColors = readCustomColors();

  function validColor(value) {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : "";
  }

  function readCustomColors() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "{}");
      return Object.fromEntries(Object.keys(CUSTOM_PROPERTIES)
        .map(key => [key, validColor(parsed?.[key])])
        .filter(([, value]) => value));
    } catch (_) {
      return {};
    }
  }

  function applyCustomColors() {
    Object.entries(CUSTOM_PROPERTIES).forEach(([key, properties]) => {
      const value = validColor(customColors[key]);
      properties.forEach(property => {
        if (value) root.style.setProperty(property, value);
        else root.style.removeProperty(property);
      });
    });
    root.toggleAttribute("data-amyfx-custom-colors", Object.keys(customColors).length > 0);
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
    return media?.matches ? "light" : "dark";
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
  updateThemeColor(root.dataset.amyfxTheme);

  window.AmyFXTheme = Object.freeze({
    key: STORAGE_KEY,
    get preference() { return preference; },
    get resolved() { return resolvedTheme(preference); },
    get colors() { return Object.freeze({ ...customColors }); },
    set(value) { return apply(value, { persist: true }); },
    setColors(values = {}) {
      customColors = Object.fromEntries(Object.keys(CUSTOM_PROPERTIES)
        .map(key => [key, validColor(values[key])])
        .filter(([, value]) => value));
      try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(customColors)); } catch (_) {}
      return apply(preference);
    },
    resetColors() {
      customColors = {};
      try { localStorage.removeItem(CUSTOM_KEY); } catch (_) {}
      return apply(preference);
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
