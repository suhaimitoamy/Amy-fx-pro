import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const resolveAsset = rel => (fs.existsSync(`app/src/main/assets/${rel}`) ? `app/src/main/assets/${rel}` : rel);

function loadAcademyAndGuided() {
  const ctx = { URLSearchParams };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  const academyFiles = [
    'apps/academy/data/level-0.js',
    'apps/academy/data/levels-1-2.js',
    'apps/academy/data/levels-3-4.js',
    'apps/academy/data/levels-5-6.js',
    'apps/academy/data/mastery-advanced.js',
    'apps/academy/data/curriculum.js',
    'apps/academy/data/chart-drills.js',
    'apps/academy/trading-practice/assets/js/guided-session.js'
  ];
  for (const file of academyFiles) {
    vm.runInNewContext(fs.readFileSync(resolveAsset(file), 'utf8'), ctx);
  }
  const guidedBank = JSON.parse(
    fs.readFileSync(resolveAsset('apps/academy/trading-practice/assets/data/guided-exercises.json'), 'utf8')
  );
  return {
    C: ctx.AmyAcademyCurriculum,
    CD: ctx.AmyAcademyChartDrills,
    GS: ctx.AmyGuidedSession,
    bank: guidedBank.exercises
  };
}

test('chart-drills: all 10 candlestick spotting drills map to real lessons, valid OHLC, and clean SVG', () => {
  const { C, CD } = loadAcademyAndGuided();
  const lessonIds = new Set(C.LESSONS.map(l => l.id));

  assert.equal(CD.CHART_DRILLS.length, 10, 'Expected 10 milestone chart drills');
  const seenIds = new Set();

  for (const drill of CD.CHART_DRILLS) {
    assert.ok(!seenIds.has(drill.id), `Duplicate drill id: ${drill.id}`);
    seenIds.add(drill.id);
    assert.ok(lessonIds.has(drill.lessonId), `Drill ${drill.id} maps to unknown lesson ${drill.lessonId}`);
    assert.ok(drill.candles.length >= 8, `Drill ${drill.id} needs >= 8 candles`);

    for (const [i, c] of drill.candles.entries()) {
      assert.ok(c.l <= Math.min(c.o, c.c), `Drill ${drill.id} candle ${i} low > min(o,c)`);
      assert.ok(c.h >= Math.max(c.o, c.c), `Drill ${drill.id} candle ${i} high < max(o,c)`);
    }

    assert.equal(drill.hotspots.length, 3, `Drill ${drill.id} should have 3 candidate hotspots`);
    const correctCount = drill.hotspots.filter(h => h.isCorrect).length;
    assert.equal(correctCount, 1, `Drill ${drill.id} must have exactly 1 correct hotspot`);

    for (const hs of drill.hotspots) {
      assert.ok(hs.low < hs.high, `Drill ${drill.id} hotspot ${hs.id} invalid price range`);
      assert.ok(hs.feedback && hs.feedback.length > 20, `Drill ${drill.id} hotspot ${hs.id} needs mentor feedback`);
    }

    const svgDefault = CD.renderChartDrillSvg(drill, {});
    const svgSelected = CD.renderChartDrillSvg(drill, { selectedId: 'B', solved: true });
    for (const svg of [svgDefault, svgSelected]) {
      assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `Drill ${drill.id} SVG malformed`);
      assert.ok(!svg.includes('NaN') && !svg.includes('undefined'), `Drill ${drill.id} SVG contains NaN/undefined`);
      assert.ok(svg.includes('data-drill-choice="A"') && svg.includes('data-drill-choice="B"') && svg.includes('data-drill-choice="C"'));
    }
  }
});

test('chart-drills: LESSON_TO_GUIDED_TOPIC maps real lessons to real 100-case Guided Practice pillars', () => {
  const { C, CD, bank } = loadAcademyAndGuided();
  const lessonIds = new Set(C.LESSONS.map(l => l.id));
  const bankTopics = new Set(bank.map(q => q.topic));

  const entries = Object.entries(CD.LESSON_TO_GUIDED_TOPIC);
  assert.ok(entries.length >= 25, 'Expected >= 25 chapters mapped to Guided Practice pillars');

  for (const [lessonId, topicId] of entries) {
    assert.ok(lessonIds.has(lessonId), `Mapped lessonId ${lessonId} does not exist`);
    assert.ok(CD.GUIDED_TOPICS[topicId], `Mapped topic ${topicId} missing from GUIDED_TOPICS`);
    assert.ok(bankTopics.has(topicId), `Mapped topic ${topicId} missing from guided-exercises.json`);
  }

  const fvgHref = CD.buildGuidedPracticeHref('fvg-bisi-sibi-ce-50');
  assert.equal(fvgHref, 'trading-practice/guided-practice.html?topic=pd-array&fromLesson=fvg-bisi-sibi-ce-50');

  const mistakesHref = CD.buildGuidedPracticeHref('model-sweep-mss-fvg', { mistakesOnly: true });
  assert.equal(mistakesHref, 'trading-practice/guided-practice.html?mode=mistakes&fromLesson=model-sweep-mss-fvg');

  const summary = CD.summarizeGuidedMastery({
    q1: { attempts: 2, lastCorrect: true },
    q2: { attempts: 1, lastCorrect: false },
    q3: { attempts: 3, lastCorrect: false },
    q4: { attempts: 0, lastCorrect: false }
  });
  assert.deepEqual({ ...summary }, { totalAttempted: 3, totalMastered: 1, totalMistakes: 2 });
});

test('guided-session: parseGuidedUrlParams validates topic, difficulty, mode=mistakes, and sanitizes fromLesson', () => {
  const { GS, bank } = loadAcademyAndGuided();
  const validTopics = Array.from(new Set(bank.map(q => q.topic)));

  const parsed = GS.parseGuidedUrlParams('?topic=pd-array&difficulty=sedang&fromLesson=fvg-bisi-sibi-ce-50&count=20', validTopics);
  assert.deepEqual({ ...parsed }, {
    topic: 'pd-array',
    difficulty: 'sedang',
    mode: null,
    fromLesson: 'fvg-bisi-sibi-ce-50',
    count: 20
  });

  const mistakes = GS.parseGuidedUrlParams('?mode=mistakes&fromLesson=model-sweep-mss-fvg', validTopics);
  assert.equal(mistakes.mode, 'mistakes');
  assert.equal(mistakes.fromLesson, 'model-sweep-mss-fvg');

  const dirty = GS.parseGuidedUrlParams('?topic=hacked&difficulty=ultra&fromLesson=../evil.js&count=999', validTopics);
  assert.deepEqual({ ...dirty }, {
    topic: null,
    difficulty: null,
    mode: null,
    fromLesson: null,
    count: null
  });
});
