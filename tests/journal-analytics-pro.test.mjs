import test from 'node:test';
import assert from 'node:assert/strict';

await import('../app/src/main/assets/apps/shared/journal-analytics-pro.js');
const Pro = globalThis.AmyJournalAnalyticsPro;

const NOW = Date.parse('2026-11-19T12:00:00Z');

const SAMPLE_TRADES = [
  {
    id: 't1',
    date: '2026-11-01',
    actualEntryTime: '2026-11-01T08:30:00Z', // 16:30 WITA -> London
    market: 'XAU/USD',
    setup: 'Liquidity Sweep + OB',
    result: 'Win',
    profit: 120,
    loss: 0,
    riskReward: 2.4,
    mistakes: '',
    emotion: 'Tenang'
  },
  {
    id: 't2',
    date: '2026-11-05',
    actualEntryTime: '2026-11-05T13:15:00Z', // 21:15 WITA -> NY AM
    market: 'XAU/USD',
    setup: 'FVG Entry',
    result: 'Loss',
    profit: 0,
    loss: 50,
    riskReward: 2,
    mistakes: 'FOMO kejar candle sebelum close M5',
    emotion: 'Terburu-buru'
  },
  {
    id: 't3',
    date: '2026-11-10',
    actualEntryTime: '2026-11-10T13:45:00Z', // 21:45 WITA -> NY AM
    market: 'XAU/USD',
    setup: 'FVG Entry',
    result: 'Loss',
    profit: 0,
    loss: 60,
    riskReward: 2,
    mistakes: 'Revenge trade setelah SL',
    emotion: 'Kesal'
  },
  {
    id: 't4',
    date: '2026-11-15',
    actualEntryTime: '2026-11-15T07:30:00Z', // 15:30 WITA -> London
    market: 'XAU/USD',
    setup: 'Liquidity Sweep + OB',
    result: 'Win',
    profit: 150,
    loss: 0,
    riskReward: 3,
    mistakes: '',
    emotion: 'Disiplin'
  },
  {
    id: 't5',
    date: '2026-11-18',
    actualEntryTime: '2026-11-18T02:00:00Z', // 10:00 WITA -> Asia
    market: 'XAU/USD',
    setup: 'Asia Range Sweep',
    result: 'BE',
    profit: 0,
    loss: 0,
    riskReward: 2,
    mistakes: '',
    emotion: 'Netral'
  },
  {
    id: 't6',
    date: '2026-11-19',
    actualEntryTime: '2026-11-19T08:00:00Z', // 16:00 WITA -> London
    market: 'XAU/USD',
    setup: 'Liquidity Sweep + OB',
    result: 'Win',
    profit: 90,
    loss: 0,
    riskReward: 1.8,
    mistakes: '',
    emotion: 'Tenang'
  },
  {
    id: 't7',
    date: '2026-11-19',
    market: 'XAU/USD',
    setup: 'OB M15',
    result: 'Belum selesai',
    profit: 0,
    loss: 0
  }
];

test('analyzePro computes exact equity curve, drawdown, profit factor, expectancy, and streaks', () => {
  const res = Pro.analyzePro(SAMPLE_TRADES, {
    range: 'all',
    unit: 'money',
    defaultBalance: 1000,
    defaultRisk: 1,
    nowMs: NOW
  });

  assert.equal(res.unit, 'money');
  assert.equal(res.summary.closedCount, 6);
  assert.equal(res.summary.openCount, 1);
  assert.equal(res.summary.wins, 3);
  assert.equal(res.summary.losses, 2);
  assert.equal(res.summary.breakevens, 1);
  assert.equal(res.summary.winRate, 50);

  // Gross Profit = 120 + 150 + 90 = 360; Gross Loss = 50 + 60 = 110; Net = +250
  assert.equal(res.summary.grossProfit, 360);
  assert.equal(res.summary.grossLoss, 110);
  assert.equal(res.summary.netValue, 250);
  assert.equal(res.summary.returnPct, 25);
  assert.equal(res.summary.profitFactor, 3.27); // 360 / 110 = 3.2727
  assert.equal(res.summary.expectancy, 41.67); // 250 / 6

  // Equity sequence: 120 -> 70 (dd 50) -> 10 (dd 110) -> 160 (peak) -> 160 -> 250 (peak)
  assert.equal(res.summary.maxDrawdown, 110);
  assert.equal(res.summary.currentDrawdown, 0);
  assert.equal(res.equitySeries.length, 6);
  assert.equal(res.equitySeries[2].equity, 10);
  assert.equal(res.equitySeries[2].drawdownAbs, 110);

  // Streaks: W(1) -> L(1) -> L(2) -> W(1) -> BE(keeps W1) -> W(2)
  assert.equal(res.summary.bestWinStreak, 2);
  assert.equal(res.summary.worstLossStreak, 2);
  assert.deepEqual(res.summary.currentStreak, { type: 'Win', count: 2 });
  assert.equal(res.summary.sampleWarning, false);
});

test('analyzePro supports 7d timeframe filter and R-Multiple unit mode', () => {
  const res7d = Pro.analyzePro(SAMPLE_TRADES, {
    range: '7d',
    unit: 'r',
    nowMs: NOW
  });

  // Within 7 days of 2026-11-19: t4 (Nov 15, +3R), t5 (Nov 18, 0R), t6 (Nov 19, +1.8R)
  assert.equal(res7d.unit, 'r');
  assert.equal(res7d.summary.closedCount, 3);
  assert.equal(res7d.summary.netValue, 4.8);
  assert.equal(res7d.summary.profitFactor, Infinity);
  assert.equal(res7d.summary.sampleWarning, true);
});

test('analyzePro classifies WITA sessions, setups, and mistake leak costs accurately', () => {
  const res = Pro.analyzePro(SAMPLE_TRADES, { range: 'all', unit: 'money', nowMs: NOW });

  const london = res.breakdowns.bySession.find((s) => s.key === 'London');
  const nyAm = res.breakdowns.bySession.find((s) => s.key === 'NY AM');
  assert.ok(london, 'London session must be classified from WITA 15:00-19:59');
  assert.equal(london.total, 3);
  assert.equal(london.winRate, 100);
  assert.equal(london.net, 360);

  assert.ok(nyAm, 'NY AM session must be classified from WITA 20:00-00:59');
  assert.equal(nyAm.total, 2);
  assert.equal(nyAm.net, -110);

  assert.equal(res.executionBrief.bestSession?.key, 'London');
  assert.equal(res.executionBrief.bestSetup?.key, 'Liquidity Sweep + OB');

  const revenge = res.breakdowns.byLeak.find((l) => l.key === 'Revenge Trade');
  const fomo = res.breakdowns.byLeak.find((l) => l.key === 'FOMO');
  assert.ok(revenge && revenge.lossImpact === 60);
  assert.ok(fomo && fomo.lossImpact === 50);
  assert.equal(res.executionBrief.topLeak?.key, 'Revenge Trade');
});

test('analyzePro handles empty entries cleanly without fabricated numbers', () => {
  const empty = Pro.analyzePro([], { range: 'all', unit: 'auto', nowMs: NOW });
  assert.equal(empty.summary.closedCount, 0);
  assert.equal(empty.summary.netValue, 0);
  assert.equal(empty.summary.maxDrawdown, 0);
  assert.equal(empty.equitySeries.length, 0);
  assert.equal(Pro.formatForAssistant([]), null);
});

test('computePlaybookScorecard buckets ICT playbooks & WITA weekdays with accurate grades', () => {
  const pb = Pro.computePlaybookScorecard(SAMPLE_TRADES, { range: 'all', unit: 'money', nowMs: NOW });
  assert.equal(pb.closedCount, 6);
  assert.ok(pb.byPlaybook.length >= 2);
  assert.ok(pb.byWeekday.length >= 1);

  const obRow = pb.byPlaybook.find((r) => r.key === 'Order Block' || r.key === 'Sweep');
  assert.ok(obRow, 'must bucket Sweep/OB setups cleanly');
  assert.ok(obRow.net > 0);
  assert.ok(pb.bestPlaybook && pb.bestPlaybook.net > 0);
});

test('detectTradingLeaks detects rapid revenge re-entry, overtrade days, leaky sessions, and repeat mistake tags without false positives on empty data', () => {
  assert.deepEqual(Pro.detectTradingLeaks([]), []);

  const day = '2026-04-14';
  const leakyTrades = [
    // 5 trades on same day with net negative + rapid 10-minute revenge loss + 3 losses in Asia + repeated FOMO
    { id: 'L1', date: day, actualEntryTime: '2026-04-14T02:00:00Z', result: 'Loss', pnlMoney: -50, setup: 'FVG', mistakes: 'FOMO kejar candle' },
    { id: 'L2', date: day, actualEntryTime: '2026-04-14T02:10:00Z', result: 'Loss', pnlMoney: -55, setup: 'FVG', mistakes: 'Revenge setelah loss' },
    { id: 'L3', date: day, actualEntryTime: '2026-04-14T03:30:00Z', result: 'Loss', pnlMoney: -45, setup: 'OB', mistakes: 'FOMO lagi' },
    { id: 'L4', date: day, actualEntryTime: '2026-04-14T08:00:00Z', result: 'Win', pnlMoney: 70, setup: 'OB', mistakes: '' },
    { id: 'L5', date: day, actualEntryTime: '2026-04-14T09:30:00Z', result: 'Loss', pnlMoney: -40, setup: 'Breaker', mistakes: '' }
  ];

  const leaks = Pro.detectTradingLeaks(leakyTrades, { range: 'all', unit: 'money', nowMs: NOW });
  assert.ok(leaks.some((l) => l.id === 'revenge-rapid'), 'must detect rapid revenge re-entry within 25m');
  assert.ok(leaks.some((l) => l.id === 'overtrade-day'), 'must detect overtrade day (>=5 trades net negative)');
  assert.ok(leaks.some((l) => l.id === 'leaky-session-asia'), 'must detect Asia leaky session (<40% WR, >=3 trades)');
  assert.ok(leaks.some((l) => l.id === 'repeat-tag-fomo'), 'must detect repeated FOMO mistake tag');

  const revenge = leaks.find((l) => l.id === 'revenge-rapid');
  assert.equal(revenge.severity, 'high');
  assert.equal(revenge.costMoney, 55);
});

