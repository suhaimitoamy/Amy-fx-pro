import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();

function loadProAnalytics() {
  const code = fs.readFileSync(path.join(ROOT, "app/src/main/assets/apps/shared/journal-analytics-pro.js"), "utf8");
  const sandbox = { window: {}, globalThis: {} };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.runInNewContext(code, sandbox);
  return sandbox.AmyJournalAnalyticsPro;
}

function makeFakeContainer() {
  let html = "";
  const listeners = new Map();
  const makeNode = (selector) => ({
    getAttribute: () => null,
    addEventListener: (ev, fn) => {
      if (!listeners.has(selector)) listeners.set(selector, []);
      listeners.get(selector).push({ ev, fn });
    },
    querySelector: () => null,
    querySelectorAll: () => []
  });
  return {
    get innerHTML() { return html; },
    set innerHTML(v) { html = String(v); },
    querySelector(sel) {
      if (sel === "[data-jp-chart]") return null;
      return makeNode(sel);
    },
    querySelectorAll(sel) {
      if (sel === "[data-jp-subtab]") {
        const matches = [...html.matchAll(/data-jp-subtab="([^"]+)"/g)].map((m) => m[1]);
        return matches.map((val) => {
          const btn = {
            getAttribute: (attr) => (attr === "data-jp-subtab" ? val : null),
            addEventListener: (ev, fn) => {
              listeners.set(`subtab:${val}`, fn);
            }
          };
          return btn;
        });
      }
      return [];
    },
    clickSubtab(tabId) {
      const fn = listeners.get(`subtab:${tabId}`);
      if (fn) fn();
    }
  };
}

test("mountProAnalytics renders Hero Equity Curve, 4 KPI cells, and 3 sub-tabs (Kalender, Sesi & Setup, Kebocoran)", () => {
  const api = loadProAnalytics();
  const container = makeFakeContainer();
  let calendarBindCalls = 0;

  const entries = [
    { id: "1", date: "2026-11-18", market: "XAU/USD", direction: "Buy", session: "NY AM", setup: "OB + FVG", result: "Win", profit: 120, loss: 0, mistakes: "" },
    { id: "2", date: "2026-11-19", market: "XAU/USD", direction: "Sell", session: "London", setup: "Sweep M5", result: "Loss", profit: 0, loss: 40, mistakes: "FOMO" },
    { id: "3", date: "2026-11-20", market: "XAU/USD", direction: "Buy", session: "NY AM", setup: "OB + FVG", result: "Win", profit: 95, loss: 0, mistakes: "" }
  ];

  api.mountProAnalytics(container, entries, {
    renderCalendar: () => `<div class="jl-calendar-pane">CALENDAR_MOCK</div>`,
    onBindCalendar: () => { calendarBindCalls += 1; }
  });

  // Hero Equity Curve + 4 KPI strip
  assert.match(container.innerHTML, /class="jp-hero-equity"/);
  const kpiCells = container.innerHTML.match(/class="jp-kpi-cell"/g) || [];
  assert.equal(kpiCells.length, 4, "Performa must display exactly 4 KPI cells");

  // 3 Sub-tabs present & defaults to Kalender when renderCalendar is provided
  assert.match(container.innerHTML, /data-jp-subtab="calendar"/);
  assert.match(container.innerHTML, /data-jp-subtab="breakdown"/);
  assert.match(container.innerHTML, /data-jp-subtab="leaks"/);
  assert.match(container.innerHTML, /CALENDAR_MOCK/);
  assert.equal(calendarBindCalls, 1);

  // Switch to Sesi & Setup sub-tab
  container.clickSubtab("breakdown");
  assert.match(container.innerHTML, /Performa per Sesi \(WITA\)/);
  assert.match(container.innerHTML, /Performa per Setup ICT/);
  assert.doesNotMatch(container.innerHTML, /CALENDAR_MOCK/);

  // Switch to Kebocoran sub-tab
  container.clickSubtab("leaks");
  assert.match(container.innerHTML, /Kebocoran/);
  assert.match(container.innerHTML, /FOMO/);
});

test("apps/journal/index.html has zero duplicate IDs, preserves legacy & drawer hooks, and includes Pro Ledger components", () => {
  const html = fs.readFileSync(path.join(ROOT, "app/src/main/assets/apps/journal/index.html"), "utf8");

  // Verify no duplicate IDs (ignoring known pre-existing assistantModeTabs attribute quirk if any)
  const idCounts = new Map();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) {
    const id = m[1];
    idCounts.set(id, (idCounts.get(id) || 0) + 1);
  }
  const duplicates = [...idCounts.entries()].filter(([, count]) => count > 1);
  assert.deepEqual(duplicates, [], `Duplicate IDs found in apps/journal/index.html: ${JSON.stringify(duplicates)}`);

  // Pro Ledger new components
  for (const requiredId of [
    "journalSheetDialog",
    "closeJournalSheetBtn",
    "journalSheetTitle",
    "jHabitProgressRing",
    "jHabitProgressPct",
    "jHabitWeekStrip",
    "jHabitMatrixDisclosure",
    "jHabitCalcDisclosure",
    "jCalcSummaryMeta"
  ]) {
    assert.ok(idCounts.has(requiredId), `Missing new Pro Ledger ID #${requiredId}`);
  }

  // Legacy data & script compatibility IDs preserved
  for (const legacyId of [
    "journalForm",
    "journalDateInput",
    "journalMarketInput",
    "journalDirectionInput",
    "journalSessionInput",
    "journalSetupInput",
    "journalResultInput",
    "journalPnlInput",
    "journalRrInput",
    "journalList",
    "statisticsViewContent",
    "jHabitMonthLabel",
    "jHabitDayLabel",
    "jHabitHeatmapGrid",
    "jHabitsCardsList",
    "jCalcBal",
    "jCalcRisk",
    "jCalcSL",
    "jCalcLotResult"
  ]) {
    assert.ok(idCounts.has(legacyId), `Missing preserved legacy ID #${legacyId}`);
  }

  // User-restored side-drawer views preserved
  assert.match(html, /data-view="journal"/);
  assert.match(html, /data-view="statistics"/);
  assert.match(html, /data-view="habits"/);
  assert.match(html, /data-view="notes"/);
  assert.match(html, /journal-pro-ledger\.css/);
});

test("Pro Ledger stylesheets have balanced braces and Dark + Light theme parity", () => {
  for (const rel of ["app/src/main/assets/apps/journal/journal-pro-ledger.css", "app/src/main/assets/apps/shared/journal-analytics-pro.css"]) {
    const css = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const opens = (css.match(/\{/g) || []).length;
    const closes = (css.match(/\}/g) || []).length;
    assert.equal(opens, closes, `Unbalanced CSS braces in ${rel}: ${opens} vs ${closes}`);
    assert.match(css, /\[data-amyfx-theme="light"\]/, `Missing light theme tokens in ${rel}`);
    assert.match(css, /@media\s*\(max-width:\s*720px\)/, `Missing mobile responsive rules in ${rel}`);
    assert.match(css, /tabular-nums/, `Missing tabular-nums typography in ${rel}`);
  }
});
