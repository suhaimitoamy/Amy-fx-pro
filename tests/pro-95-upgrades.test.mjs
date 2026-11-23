import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const cockpitBridgePath = fs.existsSync(path.resolve(import.meta.dirname, '../app/src/main/assets/apps/mapping/js/engine/cockpit-bridge-helpers.js'))
  ? '../app/src/main/assets/apps/mapping/js/engine/cockpit-bridge-helpers.js'
  : '../apps/mapping/js/engine/cockpit-bridge-helpers.js';

const {
  buildMappingJournalPrefill,
  evaluateMappingNewsLock,
  inferWitaSessionLabel
} = await import(cockpitBridgePath);

import {
  inspectProviderPayload,
  buildProviderErrorBody
} from '../lib/provider-error-guard.mjs';

function loadAcademyCurriculum() {
  const ctx = vm.createContext({ console, Date, Math, Set, Map, Array, Object, Number, String, Boolean, JSON });
  ctx.globalThis = ctx;
  ctx.window = ctx;
  for (const rel of [
    'apps/academy/data/level-0.js',
    'apps/academy/data/levels-1-2.js',
    'apps/academy/data/levels-3-4.js',
    'apps/academy/data/levels-5-6.js',
    'apps/academy/data/curriculum.js'
  ]) {
    const p1 = path.resolve(process.cwd(), 'app/src/main/assets', rel);
    const fullPath = fs.existsSync(p1) ? p1 : path.resolve(process.cwd(), rel);
    vm.runInContext(fs.readFileSync(fullPath, 'utf8'), ctx, { filename: rel });
  }
  return ctx.AmyAcademyCurriculum;
}

const require = createRequire(import.meta.url);
const curriculum = loadAcademyCurriculum();

const journalAnalyticsPath = fs.existsSync(path.resolve(import.meta.dirname, '../app/src/main/assets/apps/shared/journal-analytics-pro.js'))
  ? path.resolve(import.meta.dirname, '../app/src/main/assets/apps/shared/journal-analytics-pro.js')
  : path.resolve(import.meta.dirname, '../apps/shared/journal-analytics-pro.js');
require(journalAnalyticsPath);
const journalPro = globalThis.AmyJournalAnalyticsPro;

test('Pillar 1: buildMappingJournalPrefill builds complete XAU/USD BUY/SELL Journal payload', () => {
  const prefill = buildMappingJournalPrefill(
    { side: 'BUY', entry: 3616.1, sl: 3614.1, tp1: 3621.6, tp2: 3626.1 },
    { kind: 'OB', tf: 'M15', area: { low: 3614.84, high: 3617.36, ce: 3616.1 } },
    { grade: 'GRADE A', bias: 'Bullish M15', session: 'London Killzone Aktif', nowMs: Date.UTC(2026, 10, 23, 8, 30, 0) }
  );

  assert.equal(prefill.source, 'mapping-poi');
  assert.equal(prefill.market, 'XAU/USD');
  assert.equal(prefill.direction, 'Buy');
  assert.equal(prefill.result, 'Belum selesai');
  assert.equal(prefill.session, 'London');
  assert.equal(prefill.riskReward, 5);
  assert.match(prefill.setup, /ICT OB M15/);
  assert.match(prefill.title, /BUY XAU\/USD/);
  assert.match(prefill.evaluation, /Entry CE: \$3616\.10/);
  assert.match(prefill.evaluation, /SL: \$3614\.10/);
});

test('Pillar 1: inferWitaSessionLabel classifies WITA clock hours accurately', () => {
  assert.equal(inferWitaSessionLabel(Date.UTC(2026, 10, 23, 2, 0, 0)), 'Asia');    // 10:00 WITA
  assert.equal(inferWitaSessionLabel(Date.UTC(2026, 10, 23, 8, 0, 0)), 'London');  // 16:00 WITA
  assert.equal(inferWitaSessionLabel(Date.UTC(2026, 10, 23, 13, 0, 0)), 'NY AM');  // 21:00 WITA
  assert.equal(inferWitaSessionLabel(Date.UTC(2026, 10, 23, 19, 0, 0)), 'NY PM');  // 03:00 WITA
});

test('Pillar 1: evaluateMappingNewsLock triggers LOCK within -15m/+30m, WARN within +90m, SAFE otherwise', () => {
  const now = Date.UTC(2026, 10, 23, 13, 20, 0); // 21:20 WITA
  const eventsLock = [
    { country: 'USD', impact: 'High', title: 'Core CPI m/m', dateIso: new Date(now + 10 * 60_000).toISOString() },
    { country: 'EUR', impact: 'High', title: 'ECB Speech', dateIso: new Date(now + 5 * 60_000).toISOString() }
  ];
  const resLock = evaluateMappingNewsLock(eventsLock, now);
  assert.equal(resLock.level, 'LOCK');
  assert.equal(resLock.locked, true);
  assert.match(resLock.message, /Core CPI/);

  const eventsWarn = [
    { country: 'USD', impact: 'High', title: 'FOMC Statement', dateIso: new Date(now + 45 * 60_000).toISOString() }
  ];
  const resWarn = evaluateMappingNewsLock(eventsWarn, now);
  assert.equal(resWarn.level, 'WARN');
  assert.equal(resWarn.locked, false);
  assert.match(resWarn.message, /45 menit/);

  const eventsSafe = [
    { country: 'USD', impact: 'Medium', title: 'Flash PMI', dateIso: new Date(now + 5 * 60_000).toISOString() },
    { country: 'USD', impact: 'High', title: 'NFP', dateIso: new Date(now + 180 * 60_000).toISOString() }
  ];
  const resSafe = evaluateMappingNewsLock(eventsSafe, now);
  assert.equal(resSafe.level, 'SAFE');
  assert.equal(resSafe.locked, false);
});

test('Pillar 2: evaluateLevel0Readiness tracks beginner readiness toward Level 1 ICT', () => {
  const empty = curriculum.evaluateLevel0Readiness(curriculum.createEmptyProgress());
  assert.equal(empty.total, 6);
  assert.equal(empty.completed, 0);
  assert.equal(empty.readyForIct, false);
  assert.equal(empty.nextLesson.id, 'kenal-trading-broker-akun');

  let prog = curriculum.createEmptyProgress();
  for (const lesson of curriculum.getLessonsByLevel(0)) {
    prog = curriculum.recordQuizAttempt(prog, lesson.id, 3, 3);
  }
  const done = curriculum.evaluateLevel0Readiness(prog);
  assert.equal(done.completed, 6);
  assert.equal(done.percent, 100);
  assert.equal(done.avgQuizAccuracy, 100);
  assert.equal(done.readyForIct, true);
  assert.equal(done.nextLesson, null);
});

test('Pillar 2: calculateBeginnerRiskLot computes safe Standard and Cent lot sizing accurately', () => {
  const centRes = curriculum.calculateBeginnerRiskLot({
    balanceUsd: 100,
    riskPct: 1,
    slPoints: 5,
    accountType: 'cent'
  });
  assert.equal(centRes.recommendedLot, 0.2);
  assert.equal(centRes.actualRiskUsd, 1);
  assert.equal(centRes.safetyLevel, 'safe');
  assert.equal(centRes.needsCentHint, false);

  const smallStd = curriculum.calculateBeginnerRiskLot({
    balanceUsd: 100,
    riskPct: 1,
    slPoints: 5,
    accountType: 'standard'
  });
  assert.equal(smallStd.recommendedLot, 0.01);
  assert.equal(smallStd.needsCentHint, true);
  assert.equal(smallStd.safetyLevel, 'danger'); // $5 risk on $100 = 5%

  const stdRes = curriculum.calculateBeginnerRiskLot({
    balanceUsd: 1000,
    riskPct: 1,
    slPoints: 5,
    accountType: 'standard'
  });
  assert.equal(stdRes.recommendedLot, 0.02);
  assert.equal(stdRes.actualRiskUsd, 10);
  assert.equal(stdRes.safetyLevel, 'safe');
});

test('Pillar 3: inspectProviderPayload detects TwelveData status=error and 429 rate limits cleanly', () => {
  const rateErr = inspectProviderPayload({ status: 'error', code: 429, message: 'You have run out of API credits for the current minute.' });
  assert.equal(rateErr.ok, false);
  assert.equal(rateErr.code, 429);
  assert.equal(rateErr.isRateLimited, true);
  const body = buildProviderErrorBody(rateErr, { zones: [] });
  assert.equal(body.status, 'error');
  assert.equal(body.rateLimited, true);
  assert.deepEqual(body.zones, []);

  const valid = inspectProviderPayload({ status: 'ok', values: [{ datetime: '2026-11-23 10:00:00', open: '3600', high: '3605', low: '3598', close: '3602' }] });
  assert.equal(valid.ok, true);
  assert.equal(valid.code, 200);
});

test('Pillar 5: computeWeeklySnapshot summarizes last 7 days winrate, best session, best setup, and top leak', () => {
  const nowMs = Date.UTC(2026, 10, 23, 12, 0, 0);
  const trades = [
    { id: '1', date: '2026-11-22', result: 'Win', pnlMoney: 45, riskReward: 2.5, session: 'London', setup: 'ICT OB M15', mistakes: '' },
    { id: '2', date: '2026-11-21', result: 'Win', pnlMoney: 30, riskReward: 2.0, session: 'London', setup: 'ICT OB M15', mistakes: '' },
    { id: '3', date: '2026-11-20', result: 'Loss', pnlMoney: -15, riskReward: 1.0, session: 'Asia', setup: 'FVG M5', mistakes: 'FOMO kejar harga' },
    { id: '4', date: '2026-10-01', result: 'Loss', pnlMoney: -100, riskReward: 1.0, session: 'NY PM', setup: 'Old Trade', mistakes: 'Revenge' }
  ];

  const snap = journalPro.computeWeeklySnapshot(trades, { days: 7, nowMs });
  assert.equal(snap.empty, false);
  assert.equal(snap.closedCount, 3);
  assert.equal(snap.wins, 2);
  assert.equal(snap.losses, 1);
  assert.equal(snap.winRate, 67);
  assert.equal(snap.netMoney, 60);
  assert.equal(snap.bestSession.key, 'London');
  assert.equal(snap.bestSetup.key, 'ICT OB M15');
  assert.equal(snap.topLeak.key, 'FOMO');
});
