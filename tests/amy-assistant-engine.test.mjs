import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidGeminiApiKey,
  detectAssistantIntents,
  calculateGoldLotFromQuery,
  buildMappingSnapshotSummary,
  formatAssistantMarkdownToSafeHtml
} from '../lib/amy-assistant-engine.mjs';

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
