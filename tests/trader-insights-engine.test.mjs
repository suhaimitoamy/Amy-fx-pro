import test from 'node:test';
import assert from 'node:assert/strict';

await import('../app/src/main/assets/apps/shared/trader-insights-engine.js');
const Engine = globalThis.AmyTraderInsights;

test('evaluateDailyLossGuard locks when daily SL count or loss % limit reached', () => {
  const nowMs = Date.parse('2026-11-21T14:00:00Z'); // 22:00 WITA -> 2026-11-21
  const trades = [
    { result: 'Loss', pnlMoney: -75, exitTime: '2026-11-21T08:00:00Z' },
    { result: 'Loss', pnlMoney: -80, exitTime: '2026-11-21T12:00:00Z' },
    { result: 'Loss', pnlMoney: -100, exitTime: '2026-11-20T10:00:00Z' } // yesterday ignored
  ];
  const res = Engine.evaluateDailyLossGuard(trades, {
    nowMs,
    balanceUsd: 5000,
    config: { enabled: true, maxDailySl: 2, maxDailyLossPct: 3 }
  });
  assert.equal(res.status, 'LOCKED');
  assert.equal(res.lossCount, 2);
  assert.equal(res.todayLossPct, 3.1);
  assert.match(res.headline, /Batas risiko harian tercapai/i);
});

test('evaluateDailyLossGuard returns WARNING when 1 SL away from limit and SAFE at 0 SL', () => {
  const nowMs = Date.parse('2026-11-21T14:00:00Z');
  const warnRes = Engine.evaluateDailyLossGuard(
    [{ result: 'Loss', pnlMoney: -50, exitTime: '2026-11-21T09:00:00Z' }],
    { nowMs, balanceUsd: 5000, config: { enabled: true, maxDailySl: 2, maxDailyLossPct: 3 } }
  );
  assert.equal(warnRes.status, 'WARNING');
  assert.equal(warnRes.lossCount, 1);

  const safeRes = Engine.evaluateDailyLossGuard([], {
    nowMs,
    balanceUsd: 5000,
    config: { enabled: true, maxDailySl: 2, maxDailyLossPct: 3 }
  });
  assert.equal(safeRes.status, 'SAFE');
  assert.equal(safeRes.lossCount, 0);
});

test('computeWeeklyReview summarizes best trade, best session, and costliest leak tag', () => {
  const nowMs = Date.parse('2026-11-21T12:00:00Z');
  const entries = [
    { id: '1', pair: 'XAU/USD', setup: 'Sweep-FVG', session: 'NY AM', result: 'Win', pnlMoney: 220, executionTag: 'Sesuai Plan', date: '2026-11-20' },
    { id: '2', pair: 'XAU/USD', setup: 'OB', session: 'NY AM', result: 'Win', pnlMoney: 140, executionTag: 'Sesuai Plan', date: '2026-11-19' },
    { id: '3', pair: 'XAU/USD', setup: 'Chasing', session: 'London', result: 'Loss', pnlMoney: -95, executionTag: 'FOMO', date: '2026-11-18' },
    { id: '4', pair: 'XAU/USD', setup: 'Early', session: 'Asia', result: 'Loss', pnlMoney: -45, executionTag: 'Entry Kepagian', date: '2026-11-17' },
    { id: 'old', pair: 'XAU/USD', setup: 'Old', session: 'Asia', result: 'Loss', pnlMoney: -500, executionTag: 'Revenge Trade', date: '2026-10-01' }
  ];
  const rev = Engine.computeWeeklyReview(entries, { nowMs, days: 7 });
  assert.equal(rev.empty, false);
  assert.equal(rev.tradeCount, 4);
  assert.equal(rev.winRate, 50);
  assert.equal(rev.netMoney, 220);
  assert.equal(rev.bestTrade.id, '1');
  assert.equal(rev.bestSession.session, 'NY AM');
  assert.equal(rev.costliestLeak.tag, 'FOMO');
  assert.equal(rev.costliestLeak.totalMoney, -95);
});

test('buildSessionPlanNote formats structured note ready for Catatan Pribadi', () => {
  const note = Engine.buildSessionPlanNote({
    dateLabel: '2026-11-21',
    session: 'NY AM',
    bias: 'Bullish',
    keyLevels: 'PDH 2665 / PDL 2638',
    poiPlan: 'FVG M15 2644-2647',
    maxLoss: '2 SL / -2%',
    newsNote: 'CPI 20:30 WITA'
  });
  assert.equal(note.category, 'Rencana Sesi');
  assert.match(note.title, /NY AM/);
  assert.match(note.content, /Bias HTF: Bullish/);
  assert.match(note.content, /PDH 2665/);
});

test('evaluateMarketSessionStatus detects DANGER news lock, CAUTION upcoming, and SAFE window', () => {
  const now = Date.parse('2026-11-21T12:00:00Z');
  const danger = Engine.evaluateMarketSessionStatus([
    { currency: 'USD', impact: 'High', title: 'US CPI y/y', timestampMs: now + 10 * 60000 }
  ], now);
  assert.equal(danger.tone, 'DANGER');
  assert.equal(danger.badge, 'NEWS LOCK');

  const caution = Engine.evaluateMarketSessionStatus([
    { currency: 'USD', impact: 'High', title: 'FOMC Statement', timestampMs: now + 180 * 60000 }
  ], now);
  assert.equal(caution.tone, 'CAUTION');

  const safe = Engine.evaluateMarketSessionStatus([
    { currency: 'EUR', impact: 'High', title: 'ECB Speech', timestampMs: now + 20 * 60000 }
  ], now);
  assert.equal(safe.tone, 'SAFE');
});

test('resolveNextMonthPack handles year rollover and matches installed or cloud packs', () => {
  const res = Engine.resolveNextMonthPack(
    'cloud-2024-12',
    [{ id: 'cloud-2025-01', year: 2025, month: '01' }],
    []
  );
  assert.equal(res.nextYm, '2025-01');
  assert.equal(res.label, 'Jan 2025');
  assert.equal(res.installedPack, null);
  assert.equal(res.cloudItem.id, 'cloud-2025-01');
});

test('sortReplayBookmarks normalizes valid records and orders newest first', () => {
  const list = Engine.sortReplayBookmarks([
    { timestamp: 1700000000, timeframe: 'm5', note: 'Older', createdAt: 100 },
    { timestamp: 1700050000, timeframe: 'm15', note: 'Newer', createdAt: 200 },
    { timestamp: 0, note: 'Invalid' }
  ]);
  assert.equal(list.length, 2);
  assert.equal(list[0].note, 'Newer');
  assert.equal(list[0].timeframe, 'M15');
});

test('extractExecutionTags prioritizes leak tags over emotion and captures multiple mistakes', () => {
  const tags = Engine.extractExecutionTags({
    mistakes: 'FOMO lalu Geser SL',
    emotion: 'Tenang'
  });
  assert.deepEqual(tags, ['FOMO', 'Geser SL']);
  assert.equal(Engine.extractExecutionTag({ mistakes: 'FOMO', emotion: 'Tenang' }), 'FOMO');
  assert.deepEqual(Engine.extractExecutionTags({ mistakes: 'Kurang disiplin', emotion: '' }), []);

  const nowMs = Date.parse('2026-11-21T12:00:00Z');
  const rev = Engine.computeWeeklyReview([
    { id: 'm1', market: 'EUR/USD', setup: 'FVG', session: 'London', result: 'Win', pnlMoney: 180, emotion: 'Tenang', date: '2026-11-20' },
    { id: 'm2', market: 'XAU/USD', setup: 'Impulse', session: 'NY AM', result: 'Loss', pnlMoney: -60, mistakes: 'FOMO & Geser SL', emotion: 'Tenang', date: '2026-11-20' }
  ], { nowMs, days: 7 });
  assert.equal(rev.bestTrade.pair, 'EUR/USD');
  const leakNames = rev.mistakeSummary.map(m => m.tag).sort();
  assert.deepEqual(leakNames, ['FOMO', 'Geser SL']);
});

test('evaluateMarketSessionStatus returns CAUTION when calendar is empty/offline or stale', () => {
  const now = Date.parse('2026-11-21T12:00:00Z');
  const offline = Engine.evaluateMarketSessionStatus([], now, { allowEmptyAsSafe: false });
  assert.equal(offline.tone, 'CAUTION');
  assert.equal(offline.badge, 'KALENDER OFFLINE');

  const stale = Engine.evaluateMarketSessionStatus(
    [{ currency: 'EUR', impact: 'Low', title: 'Old Event', timestampMs: now - 3600000 }],
    now,
    { allowEmptyAsSafe: false, isStale: true }
  );
  assert.equal(stale.tone, 'CAUTION');
  assert.equal(stale.badge, 'CACHE USANG');
});

