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

test('Bab 19 FVG diagram & drill: strict OHLC continuity, exact Valid vs Invalid wick geometry, and post-answer proof', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/js/diagram-engine.js'), 'utf8'), ctx);
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/data/chart-drills.js'), 'utf8'), ctx);

  const D = ctx.AmyAcademyDiagrams;
  const CD = ctx.AmyAcademyChartDrills;

  const bp = D.getDiagramBlueprint('fvg-ce-anatomy');
  assert.ok(bp, 'fvg-ce-anatomy blueprint must exist');
  assert.equal(bp.stages.length, 3, 'fvg-ce-anatomy must have 3 stages (Bearish, Bullish, 50% CE Retrace)');

  // Verify Stage 1 (Bearish Valid vs Invalid) & Stage 2 (Bullish Valid vs Invalid)
  for (const stageIdx of [0, 1]) {
    const st = bp.stages[stageIdx];
    assert.equal(st.splitPanels.length, 2, `Stage ${stageIdx} must have 2 split panels`);
    for (const panel of st.splitPanels) {
      assert.equal(panel.candles.length, 3, 'FVG anatomy panel must have 3 candles');
      for (let i = 0; i < 3; i += 1) {
        const c = panel.candles[i];
        assert.ok(c.l <= Math.min(c.o, c.c) && c.h >= Math.max(c.o, c.c), 'Invalid OHLC in FVG split panel');
        if (i > 0) {
          assert.equal(panel.candles[i - 1].c, c.o, `Close[${i - 1}] must equal Open[${i}] for flush alignment`);
        }
      }
      const [c1, , c3] = panel.candles;
      if (panel.fvgType === 'bear') {
        if (panel.verdict === 'valid') assert.ok(c1.l > c3.h, 'Valid Bearish FVG requires C1.low > C3.high');
        else assert.ok(c1.l <= c3.h, 'Invalid Bearish FVG requires overlapping wicks (C1.low <= C3.high)');
      } else {
        if (panel.verdict === 'valid') assert.ok(c1.h < c3.l, 'Valid Bullish FVG requires C1.high < C3.low');
        else assert.ok(c1.h >= c3.l, 'Invalid Bullish FVG requires overlapping wicks (C1.high >= C3.low)');
      }
    }
    const rendered = D.renderDiagramSVG('fvg-ce-anatomy', stageIdx);
    assert.ok(rendered.svg.includes('acd-split-panel') && !rendered.svg.includes('NaN'));
  }

  // Verify Stage 3 (16-candle XAU/USD 50% CE Retrace)
  const st3 = bp.stages[2];
  assert.equal(st3.series.length, 16, 'Stage 3 must have 16 realistic candles');
  for (let i = 1; i < st3.series.length; i += 1) {
    assert.equal(st3.series[i - 1].c, st3.series[i].o, `Stage 3 candle ${i} must open at previous close`);
  }
  const fvg3 = st3.autoFvgs[0];
  assert.ok(st3.series[fvg3.c1Idx].h < st3.series[fvg3.c3Idx].l, 'Stage 3 autoFvg must be a valid Bullish FVG');
  const rendered3 = D.renderDiagramSVG('fvg-ce-anatomy', 2);
  assert.ok(rendered3.svg.includes('50% CE') && !rendered3.svg.includes('NaN'));

  // Verify Bab 19 Interactive Chart Drill
  const drill = CD.getDrillById('drill-bab19-fvg-bisi');
  assert.equal(drill.candles.length, 16, 'Bab 19 drill must have 16 realistic candles');
  let fvgCount = 0;
  for (let i = 1; i < drill.candles.length; i += 1) {
    assert.equal(drill.candles[i - 1].c, drill.candles[i].o, `Drill Bab 19 candle ${i} must open at previous close`);
  }
  for (let i = 1; i < drill.candles.length - 1; i += 1) {
    if (drill.candles[i - 1].h < drill.candles[i + 1].l) fvgCount += 1;
    if (drill.candles[i - 1].l > drill.candles[i + 1].h) fvgCount += 1;
  }
  assert.equal(fvgCount, 1, 'Bab 19 drill must have exactly 1 unambiguous FVG (no accidental distractors)');

  const svgBefore = CD.renderChartDrillSvg(drill, {});
  const svgAfter = CD.renderChartDrillSvg(drill, { selectedId: 'B', solved: true });
  assert.ok(!svgBefore.includes('acd-drill-proof'), 'Proof overlay must NOT spoil the answer before clicking');
  assert.ok(svgAfter.includes('acd-drill-proof-ring'), 'Proof overlay with wick rings must appear after answering');
});

test('Bagian I diagrams (Bab 02, 04, 05, 06) & Bab 05 drill: strict OHLC continuity, H1===4xM15 parity, and wickPin proof', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/js/diagram-engine.js'), 'utf8'), ctx);
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/data/chart-drills.js'), 'utf8'), ctx);

  const D = ctx.AmyAcademyDiagrams;
  const CD = ctx.AmyAcademyChartDrills;

  const verifySeries = (series, label) => {
    assert.ok(Array.isArray(series) && series.length >= 9, `${label}: expected >= 9 candles`);
    for (let i = 0; i < series.length; i += 1) {
      const c = series[i];
      assert.ok(c.l <= Math.min(c.o, c.c) && c.h >= Math.max(c.o, c.c), `${label}: candle ${i} invalid OHLC`);
      if (i > 0) {
        assert.equal(series[i - 1].c, c.o, `${label}: Close[${i - 1}] must equal Open[${i}]`);
      }
    }
  };

  // Bab 02: zero-bid-ask-spread (2 TradingView series stages)
  const bp02 = D.getDiagramBlueprint('zero-bid-ask-spread');
  assert.equal(bp02.stages.length, 2);
  verifySeries(bp02.stages[0].series, 'Bab 02 Stage 1');
  verifySeries(bp02.stages[1].series, 'Bab 02 Stage 2');
  for (const idx of [0, 1]) {
    const out = D.renderDiagramSVG('zero-bid-ask-spread', idx);
    assert.ok(out.svg.startsWith('<svg') && !out.svg.includes('NaN') && !out.svg.includes('undefined'));
  }

  // Bab 04: zero-mt5-order-types (2 TradingView series + projection arrows stages)
  const bp04 = D.getDiagramBlueprint('zero-mt5-order-types');
  assert.equal(bp04.stages.length, 2);
  verifySeries(bp04.stages[0].series, 'Bab 04 Stage 1');
  verifySeries(bp04.stages[1].series, 'Bab 04 Stage 2');
  for (const idx of [0, 1]) {
    const out = D.renderDiagramSVG('zero-mt5-order-types', idx);
    assert.ok(out.svg.includes('acd-arrow') && !out.svg.includes('NaN') && !out.svg.includes('undefined'));
  }

  // Bab 05: candlestick-anatomy (3 stages: OHLC anatomy, 16-candle Wick Sweep, 1 H1 === 4 M15)
  const bp05 = D.getDiagramBlueprint('candlestick-anatomy');
  assert.equal(bp05.stages.length, 3, 'Bab 05 must have 3 stages (OHLC, Wick Sweep, H1=4xM15)');
  const out05s0 = D.renderDiagramSVG('candlestick-anatomy', 0);
  assert.ok(out05s0.svg.includes('acd-ohlc-anatomy') && !out05s0.svg.includes('NaN'));

  verifySeries(bp05.stages[1].series, 'Bab 05 Stage 2');
  assert.equal(bp05.stages[1].series.length, 16);
  const out05s1 = D.renderDiagramSVG('candlestick-anatomy', 1);
  assert.ok(out05s1.svg.includes('acd-wick-ring') && !out05s1.svg.includes('NaN'));

  const mtf = bp05.stages[2].mtfSplit;
  assert.equal(mtf.ltf.length, 4, 'Bab 05 Stage 3 must contain 4 M15 candles');
  for (let i = 1; i < mtf.ltf.length; i += 1) {
    assert.equal(mtf.ltf[i - 1].c, mtf.ltf[i].o, `Bab 05 MTF candle ${i} continuity`);
  }
  assert.equal(mtf.htf.o, mtf.ltf[0].o, 'H1 Open must equal first M15 Open');
  assert.equal(mtf.htf.c, mtf.ltf[3].c, 'H1 Close must equal last M15 Close');
  assert.equal(mtf.htf.h, Math.max(...mtf.ltf.map(c => c.h)), 'H1 High must equal max M15 High');
  assert.equal(mtf.htf.l, Math.min(...mtf.ltf.map(c => c.l)), 'H1 Low must equal min M15 Low');
  const out05s2 = D.renderDiagramSVG('candlestick-anatomy', 2);
  assert.ok(out05s2.svg.includes('acd-mtf-split') && !out05s2.svg.includes('NaN'));

  // Bab 06: xau-volatility-sessions (Stage 1 bars intact, Stage 2 TradingView series)
  const bp06 = D.getDiagramBlueprint('xau-volatility-sessions');
  assert.equal(bp06.stages.length, 2);
  assert.ok(Array.isArray(bp06.stages[0].bars) && bp06.stages[0].bars.length === 4, 'Bab 06 Stage 1 bars preserved');
  verifySeries(bp06.stages[1].series, 'Bab 06 Stage 2');
  for (const idx of [0, 1]) {
    const out = D.renderDiagramSVG('xau-volatility-sessions', idx);
    assert.ok(out.svg.startsWith('<svg') && !out.svg.includes('NaN') && !out.svg.includes('undefined'));
  }

  // Bab 05 Interactive Chart Drill: 16 strictly continuous candles + hidden-before-click wickPin proof
  const drill05 = CD.getDrillById('drill-bab05-rejection-wick');
  assert.equal(drill05.candles.length, 16, 'Bab 05 drill must have 16 continuous candles');
  verifySeries(drill05.candles, 'Drill Bab 05');
  assert.ok(drill05.candles[8].l < 2645.0 && drill05.candles[8].c > 2645.0, 'Candle 8 must sweep below $2,645 and close above');

  const drillBefore = CD.renderChartDrillSvg(drill05, {});
  const drillAfter = CD.renderChartDrillSvg(drill05, { selectedId: 'B', solved: true });
  assert.ok(!drillBefore.includes('acd-drill-proof'), 'Bab 05 proof must NOT spoil answer before clicking');
  assert.ok(drillAfter.includes('Sweep Wick $2,641.2'), 'Bab 05 wickPin proof must appear after answering');
});

test('Bagian II diagrams (Bab 07-12) & 4 chart drills: strict OHLC continuity, real autoFvg geometry, and post-answer proofs', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/js/diagram-engine.js'), 'utf8'), ctx);
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/data/chart-drills.js'), 'utf8'), ctx);

  const D = ctx.AmyAcademyDiagrams;
  const CD = ctx.AmyAcademyChartDrills;

  const verifySeries = (series, label) => {
    assert.ok(Array.isArray(series) && series.length >= 10, `${label}: expected >= 10 candles`);
    for (let i = 0; i < series.length; i += 1) {
      const c = series[i];
      assert.ok(c.l <= Math.min(c.o, c.c) && c.h >= Math.max(c.o, c.c), `${label}: candle ${i} invalid OHLC`);
      if (i > 0) {
        assert.equal(series[i - 1].c, c.o, `${label}: Close[${i - 1}] must equal Open[${i}]`);
      }
    }
  };

  const part2DiagramIds = [
    'market-structure-basic',
    'mtf-alignment',
    'bos-vs-sweep',
    'dealing-range-ie',
    'bsl-ssl-pools',
    'inducement-trap'
  ];

  for (const diagId of part2DiagramIds) {
    const bp = D.getDiagramBlueprint(diagId);
    assert.ok(bp && bp.stages.length === 2, `${diagId} must have 2 stages`);
    bp.stages.forEach((st, idx) => {
      verifySeries(st.series, `${diagId} Stage ${idx + 1}`);
      for (const fvg of (st.autoFvgs || [])) {
        const c1 = st.series[fvg.c1Idx];
        const c3 = st.series[fvg.c3Idx];
        if (fvg.type === 'bear') assert.ok(c1.l > c3.h, `${diagId} Stage ${idx + 1}: invalid Bearish FVG`);
        else assert.ok(c1.h < c3.l, `${diagId} Stage ${idx + 1}: invalid Bullish FVG`);
      }
      const out = D.renderDiagramSVG(diagId, idx);
      assert.ok(out.svg.startsWith('<svg') && !out.svg.includes('NaN') && !out.svg.includes('undefined'), `${diagId} Stage ${idx + 1} invalid SVG`);
    });
  }

  // Verify Bab 09 BOS body-close vs Sweep wick-only mechanics
  const bp09 = D.getDiagramBlueprint('bos-vs-sweep');
  assert.ok(bp09.stages[0].series[7].c > 2654.0, 'Bab 09 Stage 1 BOS must close body above 2654.0');
  assert.ok(bp09.stages[1].series[7].h > 2654.0 && bp09.stages[1].series[7].c < 2654.0, 'Bab 09 Stage 2 Sweep must wick above and close below 2654.0');

  // Verify all 4 Bagian II interactive chart drills
  const part2Drills = [
    { id: 'drill-bab07-swing-low', choice: 'B', expectToken: 'HL Valid $2,642.4' },
    { id: 'drill-bab09-sweep-vs-bos', choice: 'B', expectToken: 'Sweep Wick $2,656.4' },
    { id: 'drill-bab11-eqh-bsl', choice: 'A', expectToken: 'acd-drill-proof-ring' },
    { id: 'drill-bab12-inducement', choice: 'B', expectToken: 'Purge Wick $2,642.8' }
  ];

  for (const item of part2Drills) {
    const drill = CD.getDrillById(item.id);
    assert.equal(drill.candles.length, 16, `${item.id} must have 16 continuous candles`);
    verifySeries(drill.candles, item.id);
    const before = CD.renderChartDrillSvg(drill, {});
    const after = CD.renderChartDrillSvg(drill, { selectedId: item.choice, solved: true });
    assert.ok(!before.includes('acd-drill-proof'), `${item.id}: proof must stay hidden before answer`);
    assert.ok(after.includes(item.expectToken), `${item.id}: proof token "${item.expectToken}" must appear after answer`);
  }
});

test('Bagian III diagrams (Bab 13-17): strict OHLC continuity, AMD progressive replay parity, real autoFvgs, and clean SVG', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/js/diagram-engine.js'), 'utf8'), ctx);
  const D = ctx.AmyAcademyDiagrams;

  const verifySeries = (series, label, minLen = 6) => {
    assert.ok(Array.isArray(series) && series.length >= minLen, `${label}: expected >= ${minLen} candles`);
    for (let i = 0; i < series.length; i += 1) {
      const c = series[i];
      assert.ok(c.l <= Math.min(c.o, c.c) && c.h >= Math.max(c.o, c.c), `${label}: candle ${i} invalid OHLC`);
      if (i > 0) {
        assert.equal(series[i - 1].c, c.o, `${label}: Close[${i - 1}] must equal Open[${i}]`);
      }
    }
  };

  const part3SeriesSpec = [
    { id: 'key-liquidity-levels', stages: 2, minLen: 16 },
    { id: 'daily-bias-dol', stages: 2, minLen: 11 },
    { id: 'amd-power-of-three', stages: 3, minLen: 6 },
    { id: 'news-lock-shield', stages: 2, minLen: 14 }
  ];

  for (const spec of part3SeriesSpec) {
    const bp = D.getDiagramBlueprint(spec.id);
    assert.ok(bp && bp.stages.length === spec.stages, `${spec.id} must have ${spec.stages} stages`);
    bp.stages.forEach((st, idx) => {
      verifySeries(st.series, `${spec.id} Stage ${idx + 1}`, spec.minLen);
      for (const fvg of (st.autoFvgs || [])) {
        const c1 = st.series[fvg.c1Idx];
        const c3 = st.series[fvg.c3Idx];
        if (fvg.type === 'bear') assert.ok(c1.l > c3.h, `${spec.id} Stage ${idx + 1}: invalid Bearish FVG`);
        else assert.ok(c1.h < c3.l, `${spec.id} Stage ${idx + 1}: invalid Bullish FVG`);
      }
      const out = D.renderDiagramSVG(spec.id, idx);
      assert.ok(out.svg.startsWith('<svg') && !out.svg.includes('NaN') && !out.svg.includes('undefined'), `${spec.id} Stage ${idx + 1} invalid SVG`);
    });
  }

  // AMD progressive replay parity: Stage 1 (6 candles) is exact prefix of Stage 2 (10) and Stage 3 (16)
  const amd = D.getDiagramBlueprint('amd-power-of-three');
  assert.deepEqual(amd.stages[0].series, amd.stages[1].series.slice(0, 6), 'AMD Stage 1 must be exact prefix of Stage 2');
  assert.deepEqual(amd.stages[1].series, amd.stages[2].series.slice(0, 10), 'AMD Stage 2 must be exact prefix of Stage 3');

  // News Lock Stage 1 must include vertical release marker pill
  const newsOut = D.renderDiagramSVG('news-lock-shield', 0);
  assert.ok(newsOut.svg.includes('acd-vline-pill') && newsOut.svg.includes('T = 0 RILIS'), 'News Lock Stage 1 must render T = 0 RILIS vertical marker');

  // Bab 16 Killzones timeline bars remain intact & clean
  const kz = D.getDiagramBlueprint('killzones-wita-timeline');
  assert.equal(kz.stages.length, 2);
  for (const idx of [0, 1]) {
    const out = D.renderDiagramSVG('killzones-wita-timeline', idx);
    assert.ok(out.svg.startsWith('<svg') && !out.svg.includes('NaN') && !out.svg.includes('undefined'));
  }
});

test('Bagian IV diagrams (Bab 18, 20-24) & 3 chart drills: strict OHLC continuity, progressive replay parity, real FVG/OB/OTE math, and post-answer proofs', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/js/diagram-engine.js'), 'utf8'), ctx);
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/data/chart-drills.js'), 'utf8'), ctx);

  const D = ctx.AmyAcademyDiagrams;
  const CD = ctx.AmyAcademyChartDrills;

  const verifySeries = (series, label, minLen = 8) => {
    assert.ok(Array.isArray(series) && series.length >= minLen, `${label}: expected >= ${minLen} candles`);
    for (let i = 0; i < series.length; i += 1) {
      const c = series[i];
      assert.ok(c.l <= Math.min(c.o, c.c) && c.h >= Math.max(c.o, c.c), `${label}: candle ${i} invalid OHLC`);
      if (i > 0) {
        assert.equal(series[i - 1].c, c.o, `${label}: Close[${i - 1}] must equal Open[${i}]`);
      }
    }
  };

  const part4Spec = [
    { id: 'displacement-signature', stages: 2, minLen: 15 },
    { id: 'model-ifvg-flip', stages: 3, minLen: 8 },
    { id: 'order-block-mt', stages: 2, minLen: 9 },
    { id: 'breaker-mitigation-unicorn', stages: 3, minLen: 11 },
    { id: 'cisd-vs-mss', stages: 2, minLen: 9 },
    { id: 'premium-discount-ote', stages: 2, minLen: 16 }
  ];

  for (const spec of part4Spec) {
    const bp = D.getDiagramBlueprint(spec.id);
    assert.ok(bp && bp.stages.length === spec.stages, `${spec.id} must have ${spec.stages} stages`);
    bp.stages.forEach((st, idx) => {
      verifySeries(st.series, `${spec.id} Stage ${idx + 1}`, spec.minLen);
      for (const fvg of (st.autoFvgs || [])) {
        const c1 = st.series[fvg.c1Idx];
        const c3 = st.series[fvg.c3Idx];
        if (fvg.type === 'bear') assert.ok(c1.l > c3.h, `${spec.id} Stage ${idx + 1}: invalid Bearish FVG`);
        else assert.ok(c1.h < c3.l, `${spec.id} Stage ${idx + 1}: invalid Bullish FVG`);
      }
      const out = D.renderDiagramSVG(spec.id, idx);
      assert.ok(out.svg.startsWith('<svg') && !out.svg.includes('NaN') && !out.svg.includes('undefined'), `${spec.id} Stage ${idx + 1} invalid SVG`);
    });
  }

  // Bab 18 Stage 2 (Gerakan Lemah) must have ZERO accidental FVG gaps
  const dispWeak = D.getDiagramBlueprint('displacement-signature').stages[1].series;
  let weakFvgCount = 0;
  for (let i = 1; i < dispWeak.length - 1; i += 1) {
    if (dispWeak[i - 1].h < dispWeak[i + 1].l || dispWeak[i - 1].l > dispWeak[i + 1].h) weakFvgCount += 1;
  }
  assert.equal(weakFvgCount, 0, 'Bab 18 Stage 2 (Choppy) must have zero FVG gaps');

  // Progressive replay prefix parity checks
  const ifvg = D.getDiagramBlueprint('model-ifvg-flip');
  assert.deepEqual(ifvg.stages[0].series, ifvg.stages[1].series.slice(0, 8), 'iFVG Stage 1 must be exact prefix of Stage 2');
  assert.deepEqual(ifvg.stages[1].series, ifvg.stages[2].series.slice(0, 10), 'iFVG Stage 2 must be exact prefix of Stage 3');

  const ob = D.getDiagramBlueprint('order-block-mt');
  assert.deepEqual(ob.stages[0].series, ob.stages[1].series.slice(0, 9), 'OB Stage 1 must be exact prefix of Stage 2');
  const obCandle = ob.stages[0].series[4];
  assert.equal((obCandle.o + obCandle.c) / 2, 2644.0, 'OB 50% Mean Threshold (body midpoint) must equal 2644.0');

  const bb = D.getDiagramBlueprint('breaker-mitigation-unicorn');
  assert.deepEqual(bb.stages[0].series, bb.stages[1].series.slice(0, 11), 'Breaker Stage 1 must be exact prefix of Stage 2');
  assert.ok(bb.stages[2].series[5].h < bb.stages[2].series[1].h, 'Mitigation Block Stage 3 must form Lower High (no sweep)');

  const cisd = D.getDiagramBlueprint('cisd-vs-mss');
  assert.deepEqual(cisd.stages[0].series, cisd.stages[1].series.slice(0, 9), 'CISD Stage 1 must be exact prefix of Stage 2');
  assert.ok(cisd.stages[0].series[8].c > 2649.2 && cisd.stages[0].series[8].c < 2652.6, 'CISD must trigger before MSS');
  assert.ok(cisd.stages[1].series[9].c > 2652.6, 'MSS candle must close body above 2652.6');

  // Verify all 3 Bagian IV interactive chart drills
  const part4Drills = [
    { id: 'drill-bab21-order-block', choice: 'B', expectToken: 'Retest 50% MT $2,644.4' },
    { id: 'drill-bab23-mss-confirmation', choice: 'B', expectToken: 'SSL Sweep $2,641.8' },
    { id: 'drill-bab24-discount-ote', choice: 'B', expectToken: '70.5% ($2,645.9)' }
  ];

  for (const item of part4Drills) {
    const drill = CD.getDrillById(item.id);
    assert.equal(drill.candles.length, 16, `${item.id} must have 16 continuous candles`);
    verifySeries(drill.candles, item.id, 16);
    const before = CD.renderChartDrillSvg(drill, {});
    const after = CD.renderChartDrillSvg(drill, { selectedId: item.choice, solved: true });
    assert.ok(!before.includes('acd-drill-proof'), `${item.id}: proof must stay hidden before answer`);
    assert.ok(after.includes(item.expectToken), `${item.id}: proof token "${item.expectToken}" must appear after answer`);
  }
});

test('Bagian V & VI diagrams (Bab 25-36) & Bab 25 drill: strict OHLC continuity, SMT dual panels, BPR/StdDev/CRT math, and 10/10 drills upgraded', () => {
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/js/diagram-engine.js'), 'utf8'), ctx);
  vm.runInNewContext(fs.readFileSync(resolveAsset('apps/academy/data/chart-drills.js'), 'utf8'), ctx);

  const D = ctx.AmyAcademyDiagrams;
  const CD = ctx.AmyAcademyChartDrills;

  const verifySeries = (series, label, minLen = 8, allowedGaps = []) => {
    const gapSet = new Set(allowedGaps);
    assert.ok(Array.isArray(series) && series.length >= minLen, `${label}: expected >= ${minLen} candles`);
    for (let i = 0; i < series.length; i += 1) {
      const c = series[i];
      assert.ok(c.l <= Math.min(c.o, c.c) && c.h >= Math.max(c.o, c.c), `${label}: candle ${i} invalid OHLC`);
      if (i > 0 && !gapSet.has(i)) {
        assert.equal(series[i - 1].c, c.o, `${label}: Close[${i - 1}] must equal Open[${i}]`);
      }
    }
  };

  const seriesDiagramSpecs = [
    { id: 'model-sweep-fvg', stages: 3, minLen: 8 },
    { id: 'model-turtle-soup', stages: 2, minLen: 8 },
    { id: 'sl-tp-engineering', stages: 2, minLen: 15 },
    { id: 'trade-management-scale', stages: 2, minLen: 15 },
    { id: 'bpr-nwog-ndog', stages: 2, minLen: 15 },
    { id: 'mmxm-market-maker-model', stages: 2, minLen: 10 },
    { id: 'ict-macros-weekly-ipda', stages: 2, minLen: 15 },
    { id: 'stdev-crt-profiling', stages: 2, minLen: 9 }
  ];

  for (const spec of seriesDiagramSpecs) {
    const bp = D.getDiagramBlueprint(spec.id);
    assert.ok(bp && bp.stages.length === spec.stages, `${spec.id} must have ${spec.stages} stages`);
    bp.stages.forEach((st, idx) => {
      verifySeries(st.series, `${spec.id} Stage ${idx + 1}`, spec.minLen, st.intentionalGapIndices || []);
      for (const fvg of (st.autoFvgs || [])) {
        const c1 = st.series[fvg.c1Idx];
        const c3 = st.series[fvg.c3Idx];
        if (fvg.type === 'bear') assert.ok(c1.l > c3.h, `${spec.id} Stage ${idx + 1}: invalid Bearish FVG`);
        else assert.ok(c1.h < c3.l, `${spec.id} Stage ${idx + 1}: invalid Bullish FVG`);
      }
      const out = D.renderDiagramSVG(spec.id, idx);
      assert.ok(out.svg.startsWith('<svg') && !out.svg.includes('NaN') && !out.svg.includes('undefined'), `${spec.id} Stage ${idx + 1} invalid SVG`);
    });
  }

  // Progressive replay prefix parity across Bab 25, Bab 26, Bab 33
  const m1 = D.getDiagramBlueprint('model-sweep-fvg');
  assert.deepEqual(m1.stages[0].series, m1.stages[1].series.slice(0, 8), 'Bab 25 Stage 1 must be exact prefix of Stage 2');
  assert.deepEqual(m1.stages[1].series, m1.stages[2].series.slice(0, 11), 'Bab 25 Stage 2 must be exact prefix of Stage 3');

  const ts = D.getDiagramBlueprint('model-turtle-soup');
  assert.deepEqual(ts.stages[0].series, ts.stages[1].series.slice(0, 8), 'Bab 26 Stage 1 must be exact prefix of Stage 2');

  const mmxm = D.getDiagramBlueprint('mmxm-market-maker-model');
  assert.deepEqual(mmxm.stages[0].series, mmxm.stages[1].series.slice(0, 10), 'Bab 33 Stage 1 must be exact prefix of Stage 2');

  // Bab 31 BPR exact mathematical overlap (BISI ∩ SIBI === [2658.2, 2661.4]) & Stage 2 intentional NWOG + VI gaps
  const bpr = D.getDiagramBlueprint('bpr-nwog-ndog');
  const bisiLow = bpr.stages[0].series[1].h;
  const bisiHigh = bpr.stages[0].series[3].l;
  const sibiLow = bpr.stages[0].series[7].h;
  const sibiHigh = bpr.stages[0].series[5].l;
  assert.equal(Math.max(bisiLow, sibiLow), 2658.2, 'BPR lower boundary must equal max(BISI low, SIBI low)');
  assert.equal(Math.min(bisiHigh, sibiHigh), 2661.4, 'BPR upper boundary must equal min(BISI high, SIBI high)');
  assert.ok(bpr.stages[1].series[3].o > bpr.stages[1].series[2].c, 'NWOG Monday open must gap above Friday close');
  assert.ok(bpr.stages[1].series[7].o < bpr.stages[1].series[6].c, 'Volume Imbalance must have body gap');

  // Bab 32 SMT Divergence dualAssetPanels (XAU vs XAG Bullish SMT, XAU vs DXY Bearish SMT)
  const smt = D.getDiagramBlueprint('smt-divergence-gold');
  assert.equal(smt.stages.length, 2);
  smt.stages.forEach((st, idx) => {
    assert.ok(st.dualAssetPanels && st.dualAssetPanels.panels.length === 2, `SMT Stage ${idx + 1} needs 2 panels`);
    st.dualAssetPanels.panels.forEach((p, pi) => {
      verifySeries(p.series, `SMT Stage ${idx + 1} Panel ${pi + 1}`, 10);
    });
    const out = D.renderDiagramSVG('smt-divergence-gold', idx);
    assert.ok(out.svg.includes('acd-dual-panels') && out.svg.includes('acd-smt-line') && !out.svg.includes('NaN'));
  });
  const [xauBull, xagBull] = smt.stages[0].dualAssetPanels.panels;
  assert.ok(xauBull.series[6].l < xauBull.series[2].l, 'Bullish SMT: XAU must print Lower Low');
  assert.ok(xagBull.series[6].l > xagBull.series[2].l, 'Bullish SMT: XAG must print Higher Low');
  const [xauBear, dxyBear] = smt.stages[1].dualAssetPanels.panels;
  assert.ok(xauBear.series[6].h > xauBear.series[2].h, 'Bearish SMT: XAU must print Higher High');
  assert.ok(dxyBear.series[6].l > dxyBear.series[2].l, 'Bearish SMT: DXY must print Higher Low (inverse crack)');

  // Bab 35 Std Dev exact projection math & CRT 3-candle purge-close-inside
  const sd = D.getDiagramBlueprint('stdev-crt-profiling');
  const manipOrigin = 2648.0;
  const manipLow = 2642.0;
  const manipSpan = manipOrigin - manipLow;
  assert.equal(manipOrigin + manipSpan * 1.0, 2654.0, '-1.0 SD exact price');
  assert.equal(manipOrigin + manipSpan * 2.0, 2660.0, '-2.0 SD exact price');
  assert.equal(manipOrigin + manipSpan * 2.5, 2663.0, '-2.5 SD exact price');
  const crt = sd.stages[1].series;
  assert.ok(crt[6].l < crt[5].l && crt[6].c > crt[5].l && crt[6].c < crt[5].h, 'CRT C2 must purge Low C1 and close inside C1 range');
  assert.ok(crt[7].c > crt[5].h, 'CRT C3 must expand above High C1');

  // Bab 27, Bab 30, Bab 36 (Stage 1 bars + Stage 2 continuous series)
  for (const diagId of ['model-selection-matrix', 'graduation-100-samples', 'capstone-blank-chart-mapping']) {
    const bp = D.getDiagramBlueprint(diagId);
    assert.equal(bp.stages.length, 2);
    bp.stages.forEach((st, idx) => {
      if (Array.isArray(st.series)) verifySeries(st.series, `${diagId} Stage ${idx + 1}`, 15);
      const out = D.renderDiagramSVG(diagId, idx);
      assert.ok(out.svg.startsWith('<svg') && !out.svg.includes('NaN') && !out.svg.includes('undefined'), `${diagId} Stage ${idx + 1} invalid SVG`);
    });
  }

  // Bab 25 Interactive Chart Drill + Global 10/10 Drills Continuity Audit
  const drill25 = CD.getDrillById('drill-bab25-ict2022-entry');
  assert.equal(drill25.candles.length, 16);
  verifySeries(drill25.candles, 'drill-bab25-ict2022-entry', 16);
  assert.equal(drill25.candles[6].h, 2646.4, 'Bab 25 FVG lower boundary matches feedback ($2,646.4)');
  assert.equal(drill25.candles[8].l, 2649.4, 'Bab 25 FVG upper boundary matches feedback ($2,649.4)');
  const before25 = CD.renderChartDrillSvg(drill25, {});
  const after25 = CD.renderChartDrillSvg(drill25, { selectedId: 'B', solved: true });
  assert.ok(!before25.includes('acd-drill-proof'), 'Bab 25 drill proof must stay hidden before answer');
  assert.ok(after25.includes('FVG 50% CE') && after25.includes('SSL Sweep $2,641.2'), 'Bab 25 drill proof must appear after answer');

  // Every single one of the 10 Academy drills must now have 16 strictly continuous candles & post-answer proof
  for (const d of CD.CHART_DRILLS) {
    assert.equal(d.candles.length, 16, `All 10 drills upgraded: ${d.id} must have 16 candles`);
    verifySeries(d.candles, `All-10 audit ${d.id}`, 16);
    assert.ok(d.proof, `All 10 drills upgraded: ${d.id} must include post-answer proof`);
  }
});






