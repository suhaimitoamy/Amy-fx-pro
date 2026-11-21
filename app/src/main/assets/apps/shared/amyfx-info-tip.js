/* Amy FX Pro — Global Tap-to-Toggle Info Disclosure System (ⓘ)
 * Progressive disclosure helper across all modules (Home, Journal, Backtest, Mapping, Academy, Market Intel).
 * Pure geometry & markup helpers are exported for node:test unit verification.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    const api = factory();
    root.AmyInfoTip = api;
    if (typeof document !== "undefined") {
      api.init();
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  const STYLE_ID = "amyfx-info-tip-style";
  const POPOVER_ID = "amyfx-info-popover";

  function escapeAttr(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function createInfoTipMarkup(text, options = {}) {
    const cleanText = String(text ?? "").trim();
    if (!cleanText) return "";
    const label = String(options.label || "Info").trim();
    const extraClass = options.className ? ` ${String(options.className).trim()}` : "";
    return `<button type="button" class="amy-info-btn${extraClass}" data-info-tip="${escapeAttr(cleanText)}" aria-label="${escapeAttr(label)}" aria-expanded="false">i</button>`;
  }

  function computePopoverPosition(anchorRect, popoverSize, viewport, options = {}) {
    const margin = Number.isFinite(options.margin) ? options.margin : 12;
    const gap = Number.isFinite(options.gap) ? options.gap : 8;
    const vw = Math.max(200, Number(viewport?.width) || 390);
    const vh = Math.max(200, Number(viewport?.height) || 844);
    const pw = Math.min(Number(popoverSize?.width) || 260, vw - margin * 2);
    const ph = Number(popoverSize?.height) || 80;

    const anchorCenterX = (Number(anchorRect?.left) || 0) + ((Number(anchorRect?.width) || 18) / 2);
    let left = anchorCenterX - pw / 2;
    left = Math.max(margin, Math.min(left, vw - pw - margin));

    const belowTop = (Number(anchorRect?.bottom) || 0) + gap;
    const aboveTop = (Number(anchorRect?.top) || 0) - ph - gap;

    let placement = "bottom";
    let top = belowTop;
    if (belowTop + ph > vh - margin && aboveTop >= margin) {
      placement = "top";
      top = aboveTop;
    } else if (belowTop + ph > vh - margin) {
      top = Math.max(margin, vh - ph - margin);
    }

    const arrowLeft = Math.max(14, Math.min(pw - 14, anchorCenterX - left));

    return {
      left: Math.round(left),
      top: Math.round(top),
      placement,
      arrowLeft: Math.round(arrowLeft)
    };
  }

  const STYLES = `
button.amy-info-btn {
  position: relative;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  min-height: 18px !important;
  max-width: 18px !important;
  max-height: 18px !important;
  padding: 0 !important;
  margin: 0 0 0 6px !important;
  border-radius: 999px !important;
  border: 1px solid rgba(148, 163, 184, 0.42) !important;
  background: transparent !important;
  box-shadow: none !important;
  color: #94a3b8 !important;
  font-family: ui-serif, Georgia, "Times New Roman", serif !important;
  font-style: italic !important;
  font-weight: 700 !important;
  font-size: 11px !important;
  line-height: 1 !important;
  vertical-align: middle;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.14s ease, color 0.14s ease, background-color 0.14s ease;
  -webkit-tap-highlight-color: transparent;
}
button.amy-info-btn::after {
  content: "";
  position: absolute;
  inset: -10px;
}
button.amy-info-btn:hover,
button.amy-info-btn:focus-visible,
button.amy-info-btn[aria-expanded="true"] {
  border-color: #d4af37 !important;
  color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.14) !important;
  outline: none;
}
[data-amyfx-theme="light"] button.amy-info-btn,
[data-theme="light"] button.amy-info-btn {
  border-color: rgba(15, 23, 42, 0.28) !important;
  color: #64748b !important;
}
[data-amyfx-theme="light"] button.amy-info-btn:hover,
[data-amyfx-theme="light"] button.amy-info-btn:focus-visible,
[data-amyfx-theme="light"] button.amy-info-btn[aria-expanded="true"],
[data-theme="light"] button.amy-info-btn:hover,
[data-theme="light"] button.amy-info-btn:focus-visible,
[data-theme="light"] button.amy-info-btn[aria-expanded="true"] {
  border-color: #b45309 !important;
  color: #b45309 !important;
  background: rgba(180, 83, 9, 0.1) !important;
}
.amy-info-popover {
  position: fixed;
  z-index: 99999;
  max-width: min(300px, calc(100vw - 24px));
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.34);
  background: rgba(13, 19, 31, 0.96);
  color: #e2e8f0;
  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 0.78rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.5;
  text-align: left;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  opacity: 0;
  transform: translateY(-3px);
  transition: opacity 0.12s ease, transform 0.12s ease;
  pointer-events: auto;
}
.amy-info-popover.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.amy-info-popover[hidden] {
  display: none !important;
}
[data-amyfx-theme="light"] .amy-info-popover,
[data-theme="light"] .amy-info-popover {
  background: rgba(255, 255, 255, 0.98);
  color: #1e293b;
  border-color: rgba(15, 23, 42, 0.16);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.16);
}
`;

  let initialized = false;
  let activeTrigger = null;
  let popoverEl = null;

  function ensureStyle() {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = STYLES;
    (document.head || document.documentElement).appendChild(style);
  }

  function ensurePopover(host) {
    if (typeof document === "undefined") return null;
    const targetParent = host || document.body || document.documentElement;
    if (!popoverEl) {
      popoverEl = document.createElement("div");
      popoverEl.id = POPOVER_ID;
      popoverEl.className = "amy-info-popover";
      popoverEl.setAttribute("role", "tooltip");
      popoverEl.hidden = true;
    }
    if (popoverEl.parentNode !== targetParent) {
      targetParent.appendChild(popoverEl);
    }
    return popoverEl;
  }

  function close() {
    if (activeTrigger) {
      activeTrigger.setAttribute("aria-expanded", "false");
      activeTrigger.removeAttribute("aria-describedby");
      activeTrigger = null;
    }
    if (popoverEl) {
      popoverEl.classList.remove("is-visible");
      popoverEl.hidden = true;
    }
  }

  function positionActive() {
    if (!activeTrigger || !popoverEl || popoverEl.hidden) return;
    const anchorRect = activeTrigger.getBoundingClientRect();
    const popRect = popoverEl.getBoundingClientRect();
    const pos = computePopoverPosition(
      anchorRect,
      { width: popRect.width || 260, height: popRect.height || 64 },
      { width: window.innerWidth, height: window.innerHeight }
    );
    popoverEl.style.left = `${pos.left}px`;
    popoverEl.style.top = `${pos.top}px`;
    popoverEl.dataset.placement = pos.placement;
  }

  function open(trigger) {
    if (!trigger) return;
    const text = String(trigger.getAttribute("data-info-tip") || "").trim();
    if (!text) return;

    if (activeTrigger === trigger && popoverEl && !popoverEl.hidden) {
      close();
      return;
    }

    close();
    ensureStyle();

    const openDialog = trigger.closest?.("dialog[open]");
    const pop = ensurePopover(openDialog || document.body);
    if (!pop) return;

    pop.textContent = text;
    pop.hidden = false;
    pop.style.left = "-9999px";
    pop.style.top = "-9999px";

    activeTrigger = trigger;
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-describedby", POPOVER_ID);

    positionActive();
    requestAnimationFrame(() => {
      if (activeTrigger === trigger && pop && !pop.hidden) {
        pop.classList.add("is-visible");
      }
    });
  }

  function init() {
    if (initialized || typeof document === "undefined") return;
    initialized = true;
    ensureStyle();

    document.addEventListener("click", (event) => {
      const btn = event.target?.closest?.("[data-info-tip]");
      if (btn) {
        event.preventDefault();
        event.stopPropagation();
        open(btn);
        return;
      }
      if (popoverEl && !popoverEl.hidden && !event.target?.closest?.(`#${POPOVER_ID}`)) {
        close();
      }
    }, true);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activeTrigger) {
        close();
      }
    });

    window.addEventListener("scroll", () => {
      if (activeTrigger) close();
    }, true);

    window.addEventListener("resize", () => {
      if (activeTrigger) positionActive();
    });
  }

  return Object.freeze({
    init,
    open,
    close,
    createInfoTipMarkup,
    computePopoverPosition,
    escapeAttr
  });
});
