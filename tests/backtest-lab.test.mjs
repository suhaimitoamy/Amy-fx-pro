import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = process.cwd();
const TP_DIR = path.join(ROOT, 'app', 'src', 'main', 'assets', 'apps', 'academy', 'trading-practice');

function loadBrowserModules(files) {
  const sandbox = {
    console,
    Date,
    Math,
    Number,
    String,
    Array,
    Object,
    Map,
    Set,
    RegExp,
    JSON,
    Intl,
    Error,
    Promise,
    setTimeout,
    clearTimeout
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const rel of files) {
    const code = fs.readFileSync(path.join(TP_DIR, 'assets', 'js', rel), 'utf8');
    vm.runInContext(code, sandbox, { filename: rel });
  }
  return sandbox;
}

const env = loadBrowserModules([
  'practice-core.js',
  'trade-engine.js',
  'practice-analytics.js',
  'replay-engine.js'
]);

const core = env.AmyPracticeCore;
const trades = env.AmyPracticeTrades;
const analytics = env.AmyPracticeAnalytics;

test('practice-core: DST-aware ICT session classification (winter EST & summer EDT)', () => {
  // Winter (Jan 15 2025): NY is UTC-5
  // 08:30 NY = 13:30 UTC -> New York
  assert.equal(core.classifyIctSession(Date.UTC(2025, 0, 15, 13, 30) / 1000), 'New York');
  // 03:00 NY = 08:00 UTC -> London
  assert.equal(core.classifyIctSession(Date.UTC(2025, 0, 15, 8, 0) / 1000), 'London');
  // 21:00 NY = 02:00 UTC next day -> Asia
  assert.equal(core.classifyIctSession(Date.UTC(2025, 0, 16, 2, 0) / 1000), 'Asia');

  // Summer (Jul 15 2025): NY is UTC-4
  // 08:30 NY = 12:30 UTC -> New York
  assert.equal(core.classifyIctSession(Date.UTC(2025, 6, 15, 12, 30) / 1000), 'New York');
  // 03:00 NY = 07:00 UTC -> London
  assert.equal(core.classifyIctSession(Date.UTC(2025, 6, 15, 7, 0) / 1000), 'London');
});

test('practice-core: computeReplayIctLevels strictly enforces zero future leak', () => {
  const day1 = Date.UTC(2025, 0, 14, 15, 0) / 1000; // 10:00 NY Jan 14
  const asiaDay2 = Date.UTC(2025, 0, 15, 2, 0) / 1000; // 21:00 NY Jan 14 (trading day Jan 15 Asia)
  const londonDay2 = Date.UTC(2025, 0, 15, 8, 0) / 1000; // 03:00 NY Jan 15
  const futureCandle = Date.UTC(2025, 0, 15, 14, 0) / 1000; // 09:00 NY Jan 15 (AFTER cursor)

  const candles = [
    { time: day1, open: 2650, high: 2670, low: 2640, close: 2660 },
    { time: asiaDay2, open: 2660, high: 2668, low: 2655, close: 2662 },
    { time: londonDay2, open: 2662, high: 2665, low: 2658, close: 2664 },
    { time: futureCandle, open: 2664, high: 2999, low: 2100, close: 2950 }
  ];

  const levels = core.computeReplayIctLevels(candles, londonDay2);
  const pdh = levels.find((l) => l.id === 'pdh');
  const pdl = levels.find((l) => l.id === 'pdl');
  const asiaH = levels.find((l) => l.id === 'asiaH');
  const asiaL = levels.find((l) => l.id === 'asiaL');

  assert.equal(pdh?.price, 2670);
  assert.equal(pdl?.price, 2640);
  assert.equal(asiaH?.price, 2668);
  assert.equal(asiaL?.price, 2655);
  assert.ok(levels.every((l) => l.price !== 2999 && l.price !== 2100), 'Future candle must not leak');
});

test('trade-engine: M1 same-candle instant SL bug is fixed', () => {
  const t0 = 1735754400;
  const decisionBar = { time: t0, open: 2650, high: 2652, low: 2640, close: 2650 };
  const nextBar = { time: t0 + 60, open: 2650, high: 2653, low: 2649, close: 2652 };

  const trade = trades.create({
    bias: 'BUY',
    orderType: 'MARKET',
    entry: 2650,
    stopLoss: 2645,
    takeProfit: 2660,
    tradeTime: t0,
    currentPrice: 2650,
    currentCandle: decisionBar,
    spreadUsd: 0.2,
    slippageFactor: 0,
    lot: 0.1
  });

  // Even though decisionBar.low (2640) < SL (2645), decision candle is BEFORE activation close, so trade must remain OPEN
  const evaluated = trades.evaluate(trade, [decisionBar, nextBar]);
  assert.equal(evaluated.result, 'OPEN');
});

test('trade-engine: gap-through SL & TP executes at gap open price', () => {
  const t0 = 1735754400;
  const trade = trades.create({
    bias: 'BUY',
    orderType: 'MARKET',
    entry: 2650,
    stopLoss: 2645,
    takeProfit: 2660,
    tradeTime: t0,
    currentPrice: 2650,
    spreadUsd: 0,
    slippageFactor: 0,
    lot: 0.1
  });

  // Market gaps down past SL: open=2640, high=2642, low=2638
  const gapBar = { time: t0 + 900, open: 2640, high: 2642, low: 2638, close: 2641 };
  const res = trades.evaluate(trade, [gapBar]);
  assert.equal(res.result, 'LOSS');
  assert.equal(res.exitPrice, 2640);
  assert.equal(res.resolution, 'SL_GAP_HIT');
  assert.equal(res.r, -2);
  assert.equal(res.pnlUsd, -100);
});

test('trade-engine: Akun Pro Auto-Lot, Partial 50%, Set BE, and BE close math', () => {
  // $5000 balance, 1% risk = $50, SL distance = $5 -> 50 / (5 * 100 oz) = 0.10 lot
  assert.equal(trades.computeLotFromRisk(5000, 1, 2650, 2645), 0.1);

  const t0 = 1735754400;
  let tr = trades.create({
    bias: 'BUY',
    orderType: 'MARKET',
    entry: 2650,
    stopLoss: 2645,
    takeProfit: 2665,
    tradeTime: t0,
    currentPrice: 2650,
    spreadUsd: 0,
    slippageFactor: 0,
    lot: 0.2
  });

  // Price moves to 2660 (+2R): take partial 50% (+1.0R = +$100) then move SL to BE
  tr = trades.closePartial(tr, 2660, 0.5, t0 + 900);
  assert.equal(tr.remainingLot, 0.1);
  assert.equal(tr.remainingFraction, 0.5);
  assert.equal(tr.realizedR, 1);
  assert.equal(tr.realizedUsd, 100);

  tr = trades.moveStopToBreakeven(tr, 2660);
  assert.equal(tr.stopLoss, 2650);
  assert.equal(tr.breakevenMoved, true);

  // Price retraces and hits BE at 2650: remaining 50% closes at 0R, net trade stays +1.0R (+$100) WIN!
  const retraceBar = { time: t0 + 1800, open: 2655, high: 2656, low: 2649, close: 2650 };
  const closed = trades.evaluate(tr, [retraceBar]);
  assert.equal(closed.result, 'WIN');
  assert.equal(closed.r, 1);
  assert.equal(closed.pnlUsd, 100);
});

test('practice-analytics: word-boundary OB regex, null-R guard, and equity/drawdown math', () => {
  assert.equal(analytics.classifySetup('coba dobel problem saat entry', '', null), 'ICT General');
  assert.equal(analytics.classifySetup('retest OB M15 setelah sweep', '', null), 'Order Block');
  assert.equal(analytics.classifySetup('retest IFVG M5', '', null), 'IFVG');

  const sampleTrades = [
    { id: '1', bias: 'BUY', result: 'WIN', r: 2, pnlUsd: 100, tradeTime: 1735754400, closedAt: 1735755000, notes: 'FVG M15' },
    { id: '2', bias: 'SELL', result: 'LOSS', r: -1, pnlUsd: -50, tradeTime: 1735756000, closedAt: 1735757000, notes: 'coba entry' },
    { id: '3', bias: 'BUY', result: 'WIN', r: null, plannedR: 3, pnlUsd: null, riskUsd: 50, tradeTime: 1735758000, closedAt: 1735759000, notes: 'sweep SSL' },
    { id: '4', bias: 'BUY', result: 'BE', r: 0, pnlUsd: 0, tradeTime: 1735760000, closedAt: 1735761000, notes: 'BOS' },
    { id: '5', bias: 'SELL', result: 'MISSED', r: 0, pnlUsd: 0, tradeTime: 1735762000, closedAt: 1735763000, notes: 'OB limit' },
    { id: '6', bias: 'WAIT', result: 'WAIT', r: null, tradeTime: 1735764000, notes: 'tidak ada setup' }
  ];

  const stats = analytics.computeStats(sampleTrades, { initialBalanceUsd: 5000, defaultRiskUsd: 50 });
  assert.equal(stats.wins, 2);
  assert.equal(stats.losses, 1);
  assert.equal(stats.breakevens, 1);
  assert.equal(stats.missed, 1);
  assert.equal(stats.waits, 1);
  assert.equal(stats.totalRealizedR, 4); // +2 -1 +3 +0
  assert.equal(stats.maxDrawdownR, 1);
  assert.equal(stats.currentBalanceUsd, 5200);
  assert.equal(stats.equityCurve.length, 5); // Awal + 4 closed trades
});

test('guided-exercises.json: all 60 exercises map to valid Academy 6-Level lesson IDs', () => {
  const guided = JSON.parse(fs.readFileSync(path.join(TP_DIR, 'assets', 'data', 'guided-exercises.json'), 'utf8'));
  assert.equal(guided.exercises.length, 60);

  const validIds = new Set();
  for (const f of ['levels-1-2.js', 'levels-3-4.js', 'levels-5-6.js']) {
    const src = fs.readFileSync(path.join(ROOT, 'app', 'src', 'main', 'assets', 'apps', 'academy', 'data', f), 'utf8');
    for (const m of src.matchAll(/id:\s*'([^']+)'/g)) validIds.add(m[1]);
  }

  for (const ex of guided.exercises) {
    assert.ok(ex.lesson && ex.lesson.href, `Missing lesson href on ${ex.id}`);
    assert.ok(!ex.lesson.href.includes('bagian-'), `Legacy broken link still present: ${ex.lesson.href}`);
    const match = ex.lesson.href.match(/^\.\.\/index\.html\?lesson=([a-z0-9-]+)$/);
    assert.ok(match, `Invalid lesson deep-link format: ${ex.lesson.href}`);
    assert.ok(validIds.has(match[1]), `Lesson ID does not exist in Academy curriculum: ${match[1]}`);
  }
});

test('backtest hygiene: zero legacy 404 assets, zero confirm(), zero Aktifkan Live', () => {
  const htmlFiles = ['index.html', 'candle-replay.html', 'backtest-history.html', 'guided-practice.html'];
  for (const file of htmlFiles) {
    const content = fs.readFileSync(path.join(TP_DIR, file), 'utf8');
    assert.ok(!content.includes('../assets/css/style.css'), `${file} references deleted legacy CSS`);
    assert.ok(!content.includes('../assets/js/auth.js'), `${file} references deleted legacy auth.js`);
    assert.ok(!content.includes('../assets/js/main.js'), `${file} references deleted legacy main.js`);
    assert.ok(!content.includes('requireLogin'), `${file} still calls requireLogin()`);
    assert.ok(!content.includes('live-price.js'), `${file} still references live-price.js`);
    assert.ok(!content.includes('Aktifkan Live'), `${file} still contains Aktifkan Live`);
  }

  const jsFiles = ['candle-replay.js', 'backtest-history.js', 'cloud-library-ui.js', 'practice-ui.js'];
  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(TP_DIR, 'assets', 'js', file), 'utf8');
    assert.ok(!/\bconfirm\s*\(/.test(content), `${file} still uses native confirm()`);
    assert.ok(!/\balert\s*\(/.test(content), `${file} uses native alert()`);
  }
});

function loadStorageEnv(initialStore = {}) {
  const store = new Map(Object.entries(initialStore));
  const localStorage = {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(k, String(v)); },
    removeItem(k) { store.delete(k); },
    clear() { store.clear(); }
  };
  const sandbox = {
    console, Date, Math, Number, String, Array, Object, Map, Set, RegExp, JSON, Intl, Error, Promise,
    setTimeout, clearTimeout, setInterval, clearInterval, localStorage
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const rel of ['practice-core.js', 'practice-analytics.js', 'storage.js']) {
    const code = fs.readFileSync(path.join(TP_DIR, 'assets', 'js', rel), 'utf8');
    vm.runInContext(code, sandbox, { filename: rel });
  }
  const simCode = fs.readFileSync(path.join(ROOT, 'app', 'src', 'main', 'assets', 'apps', 'shared', 'account-sim-engine.js'), 'utf8');
  vm.runInContext(simCode, sandbox, { filename: 'account-sim-engine.js' });
  return { sandbox, store };
}

test('storage: readProfileAccountParams syncs real Profile keys, cashflows, currency persistence, and updateSessionParams', () => {
  const { sandbox, store } = loadStorageEnv({
    amy_default_balance: '1000',
    amy_sim_cashflows_v1: JSON.stringify([{ amountUsd: 250 }]),
    amy_default_risk: '2.5',
    amy_account_currency: 'USD',
    amy_usd_idr_rate: '17000',
    amy_account_spread: '0.40'
  });
  const storage = sandbox.AmyPracticeStorage;
  const params = storage.readProfileAccountParams();
  assert.equal(params.balanceUsd, 1250);
  assert.equal(params.baseBalanceUsd, 1000);
  assert.equal(params.cashflowTotalUsd, 250);
  assert.equal(params.riskPercent, 2.5);
  assert.equal(params.currency, 'USD');
  assert.equal(params.usdIdrRate, 17000);
  assert.equal(params.spreadUsd, 0.4);

  // Create a custom session then change Profile balance — default session in listSessions() must stay live-synced
  storage.createSession('NY Test', 2000, 1);
  store.set('amy_default_balance', '3000');
  const sessions = storage.listSessions();
  const def = sessions.find((s) => s.id === 'default');
  assert.equal(def.initialBalanceUsd, 3250);

  // Persist currency toggle
  assert.equal(storage.saveDisplayCurrency('IDR'), 'IDR');
  assert.equal(store.get('amy_account_currency'), 'IDR');

  // Update active custom session modal & risk
  const active = storage.getActiveSession();
  const updated = storage.updateSessionParams(active.id, 4500, 1.5);
  assert.equal(updated.initialBalanceUsd, 4500);
  assert.equal(updated.riskPercent, 1.5);
});

test('practice-analytics: partial close on OPEN trade immediately updates Saldo & Net R without double counting', () => {
  const openWithPartial = {
    id: 'p1',
    bias: 'BUY',
    result: 'OPEN',
    entryStatus: 'ACTIVE',
    realizedUsd: 120,
    realizedR: 1.2,
    tradeTime: 1735754400
  };
  const stats = analytics.computeStats([openWithPartial], { initialBalanceUsd: 5000, defaultRiskUsd: 100 });
  assert.equal(stats.currentBalanceUsd, 5120);
  assert.equal(stats.totalRealizedUsd, 120);
  assert.equal(stats.totalRealizedR, 1.2);
  assert.equal(stats.open, 1);
  assert.equal(stats.closedTrades, 0);
});

test('trade-engine: gap-through BUY LIMIT fills at gap open, BUY STOP above market does not false-fill, and min 0.01 lot partial guard works', () => {
  const t0 = 1735754400;
  // True BUY LIMIT placed below market (market 2655, limit 2650, SL 2645, TP 2665)
  const limitTrade = trades.create({
    bias: 'BUY',
    orderType: 'LIMIT',
    entry: 2650,
    stopLoss: 2645,
    takeProfit: 2665,
    tradeTime: t0,
    currentPrice: 2655,
    spreadUsd: 0,
    slippageFactor: 0,
    lot: 0.1
  });
  // Next candle gaps down and opens at 2648 (below limit 2650, above SL 2645), high 2649 (never re-touches 2650)
  const gapDownBar = { time: t0 + 900, open: 2648, high: 2649, low: 2647, close: 2648.5 };
  const filled = trades.evaluate(limitTrade, [gapDownBar]);
  assert.equal(filled.entryStatus, 'ACTIVE');
  assert.equal(filled.fillPrice, 2648);
  assert.equal(filled.result, 'OPEN');

  // Pending BUY STOP placed above market (market 2655, entry 2660, SL 2650, TP 2675) must NOT fill at 2655!
  const stopTrade = trades.create({
    bias: 'BUY',
    orderType: 'LIMIT',
    entry: 2660,
    stopLoss: 2650,
    takeProfit: 2675,
    tradeTime: t0,
    currentPrice: 2655,
    spreadUsd: 0,
    slippageFactor: 0,
    lot: 0.1
  });
  const waitBar = { time: t0 + 900, open: 2655, high: 2658, low: 2653, close: 2656 };
  const stillWaiting = trades.evaluate(stopTrade, [waitBar]);
  assert.equal(stillWaiting.entryStatus, 'WAITING_FILL');

  // Minimum lot 0.01 partial close throws clear guard error
  const tiny = trades.create({
    bias: 'BUY', orderType: 'MARKET', entry: 2650, stopLoss: 2645, takeProfit: 2660,
    tradeTime: t0, currentPrice: 2650, spreadUsd: 0, slippageFactor: 0, lot: 0.01
  });
  assert.throws(() => trades.closePartial(tiny, 2655, 0.5, t0 + 60), /Sisa lot terlalu kecil/);
});

test('replay-engine: pause() aborts in-flight autoplay advance and preserves cursor', async () => {
  let resolveCandles;
  const provider = {
    async getTimeline() { return [1000, 1900, 2800, 3700]; },
    getCandles({ cursor }) {
      if (cursor === 1900) {
        return new Promise((res) => {
          resolveCandles = () => res({ sourceId: 's1', source: 'Test', sampleOnly: true, candles: [{ time: 1000, open: 1, high: 2, low: 1, close: 2 }, { time: 1900, open: 2, high: 3, low: 2, close: 3 }] });
        });
      }
      return Promise.resolve({ sourceId: 's1', source: 'Test', sampleOnly: true, candles: [{ time: cursor, open: 1, high: 2, low: 1, close: 2 }] });
    }
  };
  let emittedCursors = [];
  const rc = new env.AmyReplayEngine.ReplayController({
    provider,
    onChange(payload) { emittedCursors.push(payload.cursor); }
  });
  await rc.start(1000);
  assert.equal(rc.cursor, 1000);

  // Start autoplay step with token, then pause BEFORE getCandles resolves
  const token = ++rc.playSessionId;
  const pendingMove = rc.move(1, { autoplayToken: token });
  await new Promise((r) => setTimeout(r, 10));
  rc.pause();
  resolveCandles();
  const res = await pendingMove;
  assert.equal(res, null);
  assert.equal(rc.cursor, 1000);
  assert.deepEqual(emittedCursors, [1000]);
});

test('storage: exportTradeToJournal produces schema compatible with AmyAccountSimEngine', () => {
  const { sandbox } = loadStorageEnv();
  const storage = sandbox.AmyPracticeStorage;
  const sim = sandbox.AmyAccountSimEngine;

  const entry = storage.exportTradeToJournal({
    id: 'tr-101',
    bias: 'BUY',
    result: 'WIN',
    pnlUsd: 150,
    r: 2.5,
    lot: 0.15,
    fillPrice: 2650,
    exitPrice: 2660,
    stopLoss: 2646,
    takeProfit: 2660,
    riskUsd: 60,
    timeframe: 'M15',
    tradeTime: 1735754400,
    closedAt: 1735758000,
    setupType: 'FVG',
    notes: 'Reaksi FVG NY'
  });

  assert.equal(entry.accountMode, 'SIM');
  assert.equal(entry.pnlMoney, 150);
  assert.equal(entry.profit, 150);
  assert.equal(entry.loss, 0);
  assert.equal(entry.pnlPips, 100);
  assert.equal(entry.sl, 2646);
  assert.equal(entry.tp, 2660);
  assert.equal(sim.resolveJournalNetUsd(entry), 150);
  assert.equal(storage.isTradeExportedToJournal('tr-101'), true);
  assert.equal(storage.isTradeExportedToJournal('tr-unknown'), false);
});


