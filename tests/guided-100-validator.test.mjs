import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const candidateTpDirs = [
  path.join(ROOT, 'app', 'src', 'main', 'assets', 'apps', 'academy', 'trading-practice'),
  path.join(ROOT, 'apps', 'academy', 'trading-practice')
];
const TP_DIR = candidateTpDirs.find((d) => fs.existsSync(d)) || candidateTpDirs[0];
const DATA_PATH = path.join(TP_DIR, 'assets', 'data', 'guided-exercises.json');
const SESSION_PATH = path.join(TP_DIR, 'assets', 'js', 'guided-session.js');

const guided = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const exercises = guided.exercises;

test('Schema v3: exactly 100 unique cases across 8 ICT pillars with 30/40/30 difficulty split', () => {
  assert.equal(guided.schemaVersion, 3);
  assert.equal(exercises.length, 100);

  const ids = new Set(exercises.map((q) => q.id));
  assert.equal(ids.size, 100, 'Every exercise ID must be unique');

  const byDiff = { mudah: 0, sedang: 0, advanced: 0 };
  const byTopic = new Map();
  for (const q of exercises) {
    byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1;
    byTopic.set(q.topic, (byTopic.get(q.topic) || 0) + 1);
  }
  assert.deepEqual(byDiff, { mudah: 30, sedang: 40, advanced: 30 });
  assert.equal(byTopic.size, 8, 'Must cover all 8 ICT pillars');
});

test('Anti-guessing quality: every case has 4 unique balanced choices and no extreme length bias', () => {
  let longestCorrect = 0;
  for (const q of exercises) {
    assert.equal(Array.isArray(q.choices), true);
    assert.equal(q.choices.length, 4, `${q.id} must have 4 choices`);
    assert.equal(new Set(q.choices).size, 4, `${q.id} choices must be unique`);
    assert.equal(q.choices.includes(q.answer), true, `${q.id} answer must be in choices`);
    assert.ok(q.principle && q.principle.length >= 40, `${q.id} needs rich principle`);
    assert.ok(q.outcomeNote && q.outcomeNote.length >= 20, `${q.id} needs outcomeNote`);

    const maxLen = Math.max(...q.choices.map((c) => c.length));
    if (q.answer.length === maxLen) longestCorrect += 1;
  }
  assert.ok(
    longestCorrect <= 45,
    `Correct answer is longest too often (${longestCorrect}/100 > 45); choices would be guessable by length`
  );
});

test('Mathematical chart integrity: 24 before candles + 8 seamless afterCandles + valid OHLC + levels in range', () => {
  for (const q of exercises) {
    assert.equal(q.candles.length, 24, `${q.id} must have 24 before candles`);
    assert.equal(Array.isArray(q.afterCandles) && q.afterCandles.length, 8, `${q.id} must have 8 afterCandles`);

    const combined = [...q.candles, ...q.afterCandles];
    for (let i = 0; i < combined.length; i++) {
      const b = combined[i];
      assert.ok(b.low <= Math.min(b.open, b.close) + 1e-6, `${q.id} bar ${i} invalid low`);
      assert.ok(b.high >= Math.max(b.open, b.close) - 1e-6, `${q.id} bar ${i} invalid high`);
      if (i > 0) {
        assert.ok(b.time > combined[i - 1].time, `${q.id} bar ${i} non-monotonic time`);
      }
    }

    // Seamless transition from Decision Point candle[23].close to afterCandles[0].open
    const jump = Math.abs(q.afterCandles[0].open - q.candles[23].close);
    assert.ok(jump <= 0.05, `${q.id} has price discontinuity (${jump}) between before and after candles`);

    // Every level must lie within realistic envelope of the chart (no floating lines in outer space)
    const minL = Math.min(...combined.map((b) => b.low));
    const maxH = Math.max(...combined.map((b) => b.high));
    const margin = Math.max(12, (maxH - minL) * 0.65);
    for (const lv of q.levels || []) {
      assert.ok(
        lv.price >= minL - margin && lv.price <= maxH + margin,
        `${q.id} level "${lv.title}" (${lv.price}) out of chart envelope [${minL}, ${maxH}]`
      );
    }
  }
});

test('Mathematical ICT pattern verification: FVG gaps, Sweep wicks, BOS body closes, and OB zones match candles', () => {
  let fvgChecked = 0;
  let sweepChecked = 0;
  let breakChecked = 0;
  let obChecked = 0;
  let psyScenarioChecked = 0;

  for (const q of exercises) {
    if (q.topic === 'psychology-execution') {
      assert.ok(q.scenario && q.scenario.session && q.scenario.trigger, `${q.id} psychology case must have desk scenario`);
      psyScenarioChecked += 1;
      continue;
    }

    const e = q.evidence;
    assert.ok(e && e.pattern, `${q.id} technical case must define chart visual evidence`);

    if (e.pattern === 'fvg') {
      const a = q.candles[e.a];
      const c = q.candles[e.c];
      assert.ok(a && c, `${q.id} FVG indices out of bounds`);
      if (e.direction === 'bullish') {
        assert.ok(c.low > a.high, `${q.id} bullish FVG must have c.low (${c.low}) > a.high (${a.high})`);
      } else {
        assert.ok(c.high < a.low, `${q.id} bearish FVG must have c.high (${c.high}) < a.low (${a.low})`);
      }
      fvgChecked += 1;
    } else if (e.pattern === 'sweep') {
      const sweepBar = q.candles[e.c];
      const pool = q.levels[0].price;
      if (e.direction === 'high') {
        assert.ok(sweepBar.high > pool && sweepBar.close < pool, `${q.id} high sweep must wick above ${pool} and close below`);
      } else {
        assert.ok(sweepBar.low < pool && sweepBar.close > pool, `${q.id} low sweep must wick below ${pool} and close above`);
      }
      sweepChecked += 1;
    } else if (e.pattern === 'break') {
      const breakBar = q.candles[e.c];
      const swing = q.levels[0].price;
      if (e.direction === 'up') {
        assert.ok(breakBar.close > swing, `${q.id} bullish BOS/MSS must body-close above ${swing}`);
      } else {
        assert.ok(breakBar.close < swing, `${q.id} bearish BOS/MSS must body-close below ${swing}`);
      }
      breakChecked += 1;
    } else if (e.pattern === 'ob') {
      assert.ok(e.topPrice > e.bottomPrice, `${q.id} OB topPrice must exceed bottomPrice`);
      assert.ok(e.midPrice >= e.bottomPrice && e.midPrice <= e.topPrice, `${q.id} OB 50% MT must sit inside OB`);
      obChecked += 1;
    }
  }

  assert.ok(fvgChecked >= 15, `Expected >=15 mathematically verified FVG cases, got ${fvgChecked}`);
  assert.ok(sweepChecked >= 10, `Expected >=10 mathematically verified Sweep cases, got ${sweepChecked}`);
  assert.ok(breakChecked >= 10, `Expected >=10 mathematically verified BOS/MSS cases, got ${breakChecked}`);
  assert.ok(obChecked >= 10, `Expected >=10 mathematically verified OB/Breaker cases, got ${obChecked}`);
  assert.equal(psyScenarioChecked, 12, 'All 12 psychology cases must include trading desk scenario cards');
});

test('guided-session.js: filters by pillar, prioritizes missed questions, and computes pillar mastery', () => {
  const sandbox = { globalThis: {} };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(SESSION_PATH, 'utf8'), sandbox, { filename: SESSION_PATH });
  const sess = sandbox.AmyGuidedSession;

  const pdOnly = sess.select(exercises, 'ALL', 20, [], () => 0.4, { topic: 'pd-array' });
  assert.equal(pdOnly.length, 14);
  assert.ok(pdOnly.every((q) => q.topic === 'pd-array'));

  const masteryMap = {
    'ict-001': { attempts: 1, wins: 0, lastCorrect: false },
    'ict-002': { attempts: 1, wins: 1, lastCorrect: true }
  };
  const drill = sess.select(exercises, 'ALL', 10, ['ict-001', 'ict-002'], () => 0.5, {
    mistakesOnly: true,
    masteryMap
  });
  assert.deepEqual(drill.map((q) => q.id), ['ict-001']);

  const pillars = sess.computePillarMastery(exercises, masteryMap);
  assert.equal(pillars.length, 8);
  const idm = pillars.find((p) => p.topic === 'inducement');
  assert.equal(idm.mastered, 1);
  assert.equal(idm.mistakes, 1);
});
