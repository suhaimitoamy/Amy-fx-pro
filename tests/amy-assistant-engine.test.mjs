import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {
  isValidGeminiApiKey,
  detectAssistantIntents,
  calculateGoldLotFromQuery,
  buildMappingSnapshotSummary,
  formatAssistantMarkdownToSafeHtml
} from '../lib/amy-assistant-engine.mjs';

function resolveAsset(rel) {
  const p1 = path.resolve('app/src/main/assets', rel);
  if (fs.existsSync(p1)) return p1;
  return path.resolve(rel);
}

function loadAmyLocalAssistantSandbox(storageSeed = {}, globals = {}) {
  const store = new Map(Object.entries(storageSeed).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
  };
  const sandbox = {
    console,
    Date,
    Intl,
    Math,
    Number,
    String,
    Array,
    Object,
    Set,
    Map,
    JSON,
    RegExp,
    Promise,
    URL,
    setTimeout,
    clearTimeout,
    localStorage,
    ...globals
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  const code = fs.readFileSync(resolveAsset('apps/shared/amy-local-assistant.js'), 'utf-8');
  vm.runInNewContext(code, sandbox, { filename: 'amy-local-assistant.js' });
  return { api: sandbox.AmyLocalAssistant, sandbox, store };
}

test('isValidGeminiApiKey rejects placeholders and accepts real Gemini key prefixes', () => {
  assert.equal(isValidGeminiApiKey(''), false);
  assert.equal(isValidGeminiApiKey('MY_GEMINI_API_KEY'), false);
  assert.equal(isValidGeminiApiKey('YOUR_API_KEY_HERE_123456'), false);
  assert.equal(isValidGeminiApiKey('AIzaShort'), false);
  assert.equal(isValidGeminiApiKey('AIzaSyD-1234567890abcdef1234567890'), true);
  assert.equal(isValidGeminiApiKey('AQ.Ab8RN6LLxAkT3a6psfBBI5R4Ncm05rIWQs-5Xj9'), true);
});

test('detectAssistantIntents routes trading modules accurately without false chart vision or nav spam', () => {
  const q1 = detectAssistantIntents('Evaluasi performa jurnal trading dan emosi saya');
  assert.deepEqual(q1.modules, ['journal']);
  assert.equal(q1.wantsChartVision, false);
  assert.equal(q1.explicitNav, false);

  const q2 = detectAssistantIntents('Analisa chart gold M15 di layar sekarang');
  assert.ok(q2.modules.includes('mapping'));
  assert.equal(q2.wantsChartVision, true);
  assert.equal(q2.explicitNav, false);

  const q3 = detectAssistantIntents('Buka halaman jurnal trading');
  assert.equal(q3.explicitNav, true);
  assert.equal(q3.navTarget, 'journal');

  const q4 = detectAssistantIntents('Modal $500 risiko 1% entry 3708 SL 3715 pakai lot berapa?');
  assert.equal(q4.wantsLotCalc, true);
  assert.ok(q4.modules.includes('risk_calc'));
  assert.equal(q4.wantsChartVision, false);

  const q5 = detectAssistantIntents('Ganti chart ke M5');
  assert.equal(q5.switchTimeframe, 'M5');

  const q6 = detectAssistantIntents('Apa berita High Impact dan kalender FOMC minggu ini?');
  assert.deepEqual(q6.modules, ['market_intel']);
  assert.equal(q6.wantsChartVision, false);

  const q7 = detectAssistantIntents('Berapa respect rate riwayat POI hari ini dan status Daily Loss Guard?');
  assert.ok(q7.modules.includes('mapping'));
  assert.ok(q7.modules.includes('journal'));

  const q8 = detectAssistantIntents('Progres 100 kasus 8 pilar practice dan kesiapan Level 0 pemula saya');
  assert.ok(q8.modules.includes('practice'));
  assert.ok(q8.modules.includes('academy'));

  const q9 = detectAssistantIntents('Hitung lot XAU/USD untuk modal $1000 risiko 1% stop loss 50 pips');
  assert.equal(q9.wantsLotCalc, true);
  assert.ok(q9.modules.includes('risk_calc'));
  assert.equal(q9.modules.includes('journal'), false, 'Lot calc with SL/pips must NOT falsely trigger journal');
});

test('calculateGoldLotFromQuery computes exact XAU/USD lot size and RR targets', () => {
  const res = calculateGoldLotFromQuery('Modal $1000 risiko 1% entry 3708 SL 3718');
  assert.equal(res.ok, true);
  assert.equal(res.balance, 1000);
  assert.equal(res.riskUsd, 10);
  assert.equal(res.slPoints, 10);
  assert.equal(res.slPips, 100);
  assert.equal(res.lot, 0.01);
  assert.equal(res.direction, 'SELL');
  assert.equal(res.tp1, 3693);
  assert.equal(res.tp2, 3678);

  const resPips = calculateGoldLotFromQuery('Saldo 2000 risk 2% SL 50 pips');
  assert.equal(resPips.ok, true);
  assert.equal(resPips.slPoints, 5);
  assert.equal(resPips.lot, 0.08);

  const missingSl = calculateGoldLotFromQuery('Hitung lot dong');
  assert.equal(missingSl.ok, false);
  assert.equal(missingSl.needsInput, true);
});

test('buildMappingSnapshotSummary syncs BREAKDOWN 0% and strictly filters valid BSL/SSL', () => {
  const ctx = {
    price: 3698.09,
    h1: { bias: 'BEARISH', health: 'HEALTHY' },
    m15: {
      control: 'SELLER',
      structure: 'BEARISH',
      dealingRange: { rangeLow: 3725.09, rangeHigh: 3758.13, eq: 3741.61 }
    },
    m5: { status: 'CONFIRMED' },
    liquidity: [
      { label: 'BSL Swing', level: 3727.35 },
      { label: 'SSL Swing', level: 3695.08 },
      { label: 'Old SSL', level: 3725.09 }
    ]
  };
  const snap = buildMappingSnapshotSummary(ctx, 3698.09);
  assert.equal(snap.zoneLabel, 'BREAKDOWN · 0%');
  assert.equal(snap.isBreakdown, true);
  assert.equal(snap.bslAbove.level, 3727.35);
  assert.equal(snap.sslBelow.level, 3695.08);
});

test('formatAssistantMarkdownToSafeHtml escapes XSS and formats bold, bullets, and inline code', () => {
  const html = formatAssistantMarkdownToSafeHtml('**Harga Gold**: `$3698.09`\n- Cek *zone* <script>alert(1)</script>');
  assert.ok(html.includes('<strong>Harga Gold</strong>'));
  assert.ok(html.includes('<code class="amy-inline-code">$3698.09</code>'));
  assert.ok(html.includes('• Cek <em>zone</em>'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('AmyLocalAssistant exports all 4 repaired bridge contracts (getLivePrice, buildMappingSnapshot, readJournals, calculateLot)', async () => {
  const todayWita = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' });
  const { api } = loadAmyLocalAssistantSandbox(
    {
      amy_default_balance: '1000',
      amy_default_risk: '1',
      'tradingLibraryManager.journals.v1': [
        { id: 'r1', date: todayWita, pair: 'XAU/USD', result: 'Loss', pnlMoney: -12, accountMode: 'REAL', emotion: 'FOMO' },
        { id: 'r2', date: todayWita, pair: 'XAU/USD', result: 'Loss', pnlMoney: -11, accountMode: 'REAL', emotion: 'Revenge' },
        { id: 's1', date: todayWita, pair: 'XAU/USD', result: 'Win', pnlMoney: 50, accountMode: 'SIM', source: 'backtest-lab' }
      ],
      amy_daily_loss_guard_v1: { enabled: true, maxDailySl: 2, maxDailyLossPct: 3 },
      'amyfx.mapping.cockpit_snapshot.v1': {
        version: 1,
        updatedAt: Date.now(),
        livePrice: 3615.07,
        prioritySide: 'SELL',
        dealingRange: { low: 3600, high: 3640, eq: 3620, pct: 38 },
        bias: { h1: 'BEARISH', m15: 'BEARISH', m5: 'BEARISH' },
        sell: { zone: { low: 3624, high: 3628, ce: 3626, tf: 'M15', kind: 'OB', fresh: true, touchCount: 0 }, verdict: { grade: 'A+ SIAP', score: 5, skip: false }, sl: 3630.5, tp1: 3608, rr1: 4.0, state: 'STANDBY' }
      },
      'amyfx.mapping.reaction_history.v1': {
        version: 2,
        dailyArchive: { [todayWita]: { total: 4, respected: 3, broken: 1 } }
      }
    },
    { amyfxCurrentPrice: 3615.07 }
  );

  // 1. getLivePrice
  assert.equal(typeof api.getLivePrice, 'function');
  assert.equal(api.getLivePrice(), 3615.07);

  // 2. buildMappingSnapshot
  assert.equal(typeof api.buildMappingSnapshot, 'function');
  const snap = api.buildMappingSnapshot(
    {
      price: 3615.07,
      h1: { bias: 'BEARISH', health: 'HEALTHY' },
      m15: { control: 'SELLER', dealingRange: { rangeLow: 3600, rangeHigh: 3640, eq: 3620 } },
      liquidity: [
        { label: 'PDH', level: 3638.5 },
        { label: 'PDL', level: 3598.2 }
      ]
    },
    3615.07
  );
  assert.equal(snap.zoneLabel, 'DISKON · 38%');
  assert.equal(snap.bslAbove.label, 'PDH');
  assert.equal(snap.sslBelow.label, 'PDL');
  assert.equal(snap.cockpit.prioritySide, 'SELL');
  assert.equal(snap.reactionToday.respectRate, 75);

  // 3. readJournals + REAL vs SIM split + Daily Loss Guard
  assert.equal(typeof api.readJournals, 'function');
  const jData = await api.readJournals();
  assert.equal(jData.rows.length, 3);
  const realSummary = api.journal('evaluasi jurnal emosi', jData);
  assert.ok(realSummary.includes('2 REAL, 1 SIM/Backtest'), 'Should separate REAL vs SIM counts');
  assert.ok(realSummary.includes('LOCKED / STOP TRADING HARI INI'), 'Should trigger Daily Loss Guard on 2 SL');
  const simSummary = api.journal('evaluasi akun simulasi backtest saya', jData);
  assert.ok(simSummary.includes('Jurnal (SIM/Backtest: 1 trade'), 'Should analyze SIM trades when asked');

  // 4. calculateLot (structured) & riskCalc (string backward-compat)
  assert.equal(typeof api.calculateLot, 'function');
  const calc = api.calculateLot('Modal $1000 risiko 1% SL 50 pips');
  assert.equal(calc.ok, true);
  assert.equal(calc.lot, 0.02);
  assert.equal(typeof calc.text, 'string');
  assert.ok(calc.text.includes('0.02 LOT'));
  assert.equal(typeof api.riskCalc('Modal $1000 risiko 1% SL 50 pips'), 'string');
});

test('AmyLocalAssistant syncs Academy 36-bab Mastery Path, Practice 100-case v3 mastery, Calendar dateIso, and Weekend Guard', () => {
  const futureIso = new Date(Date.now() + 90 * 60000).toISOString();
  const { api } = loadAmyLocalAssistantSandbox({
    amy_academy_progress_v2: {
      completedIds: [
        'kenal-trading-broker-akun',
        'bid-ask-spread-pips-gold',
        'lot-leverage-margin-equity',
        'panduan-mt5-lima-jenis-order',
        'membaca-chart-candlestick-nol',
        'dasar-tren-sr-rencana-14-hari',
        'logika-trading-probabilitas'
      ],
      quizScores: {
        'kenal-trading-broker-akun': { correct: 3, total: 3, passed: true },
        'bid-ask-spread-pips-gold': { correct: 3, total: 3, passed: true }
      },
      xp: 200
    },
    amy_academy_track_v1: 'beginner',
    amy_academy_bookmarks_v1: ['lot-leverage-margin-equity'],
    'amy-guided-v3-mastery': {
      c1: { attempts: 2, lastCorrect: true, topic: 'FVG' },
      c2: { attempts: 1, lastCorrect: true, topic: 'OB' },
      c3: { attempts: 3, lastCorrect: false, topic: 'Sweep' }
    },
    amy_economic_calendar_v1: {
      events: [
        { country: 'USD', impact: 'High', title: 'US CPI m/m', dateIso: futureIso, forecast: '0.3%', previous: '0.2%' }
      ]
    }
  });

  const acdText = api.academy();
  assert.ok(acdText.includes('7/36 modul'), 'Should count completedIds out of 36');
  assert.ok(acdText.includes('6/6 modul (SIAP MASUK INTI ICT)'), 'Should detect full foundation readiness');
  assert.ok(acdText.includes('200 XP'), 'Should display earned Mastery XP');
  assert.ok(acdText.includes('2/2 lulus'), 'Should report quiz pass rate');

  const pracText = api.practice();
  assert.ok(pracText.includes('100 Kasus ICT'), 'Should show 100-case Practice v3');
  assert.ok(pracText.includes('2/100 dikuasai'), 'Should compute mastery out of 100');
  assert.ok(pracText.includes('Sweep'), 'Should highlight weak topic');

  const calText = api.calendar();
  assert.ok(calText.includes('US CPI m/m'), 'Should read amy_economic_calendar_v1 dateIso events');

  // Weekend guard: Saturday 12:00 UTC is closed; Wednesday 12:00 UTC is open
  assert.equal(api.isWeekendClosure(new Date('2026-11-21T12:00:00Z')), true);
  assert.equal(api.isWeekendClosure(new Date('2026-11-25T12:00:00Z')), false);
});

test('Zero dead 404 links (practice or kalkulator-resiko) remain in AMY Live assistant files', () => {
  const localSrc = fs.readFileSync(resolveAsset('apps/shared/amy-local-assistant.js'), 'utf-8');
  const bridgeSrc = fs.readFileSync(resolveAsset('apps/shared/amy-gemini-live-bridge.js'), 'utf-8');
  assert.equal(localSrc.includes('apps/practice/index.html'), false, 'amy-local-assistant.js must not link to 404 apps/practice/index.html');
  assert.equal(bridgeSrc.includes('apps/practice/index.html'), false, 'amy-gemini-live-bridge.js must not link to 404 apps/practice/index.html');
  assert.equal(localSrc.includes('kalkulator-resiko.html'), false, 'amy-local-assistant.js must not link to 404 kalkulator-resiko.html');
  assert.equal(bridgeSrc.includes('kalkulator-resiko.html'), false, 'amy-gemini-live-bridge.js must not link to 404 kalkulator-resiko.html');
  assert.ok(localSrc.includes('apps/academy/trading-practice/index.html'));
  assert.ok(bridgeSrc.includes('apps/academy/trading-practice/index.html'));
  assert.ok(localSrc.includes('apps/mapping/index.html?tool=lot-calc'));
  assert.ok(bridgeSrc.includes('apps/mapping/index.html?tool=lot-calc'));
  assert.ok(localSrc.includes('apps/academy/index.html?view=glossary'));
  assert.ok(bridgeSrc.includes('apps/academy/index.html?view=glossary'));
});
