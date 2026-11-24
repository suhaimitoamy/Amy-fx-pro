import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(import.meta.dirname, '..');

function loadAcademyRuntime() {
  const ctx = vm.createContext({ console, Date, Math, Set, Map, Array, Object, Number, String, Boolean, JSON });
  ctx.globalThis = ctx;
  ctx.window = ctx;
  const files = [
    'apps/academy/data/level-0.js',
    'apps/academy/data/levels-1-2.js',
    'apps/academy/data/levels-3-4.js',
    'apps/academy/data/levels-5-6.js',
    'apps/academy/data/mastery-advanced.js',
    'apps/academy/data/mastery-deep-enrichment.js',
    'apps/academy/data/curriculum.js',
    'apps/academy/js/diagram-engine.js'
  ];
  const ROOT = path.resolve(import.meta.dirname, '..');
  for (const rel of files) {
    const p1 = path.resolve(ROOT, 'app/src/main/assets', rel);
    const fullPath = fs.existsSync(p1) ? p1 : path.resolve(ROOT, rel);
    const code = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(code, ctx, { filename: rel });
  }
  return {
    curriculum: ctx.AmyAcademyCurriculum,
    diagrams: ctx.AmyAcademyDiagrams
  };
}

const { curriculum, diagrams } = loadAcademyRuntime();

test('Academy Interactive Trading Book has 6 Parts (Bagian I–VI), 36 unique sequential chapters, and valid quizzes', () => {
  assert.equal(curriculum.STAGES.length, 6);
  assert.equal(curriculum.LEVELS.length, 6);
  assert.equal(curriculum.LESSONS.length, 36);

  const ids = new Set();
  let totalQuestions = 0;

  curriculum.LESSONS.forEach((lesson, idx) => {
    assert.equal(lesson.stepNumber, idx + 1, `Bab ${lesson.id} must have sequential stepNumber`);
    assert.equal(lesson.stepCode, String(idx + 1).padStart(2, '0'));
    assert.equal(curriculum.formatLessonNumber(lesson), String(idx + 1).padStart(2, '0'));

    assert.ok(lesson.id && !ids.has(lesson.id), `Duplicate or missing chapter id: ${lesson.id}`);
    ids.add(lesson.id);

    assert.ok(curriculum.getStageById(lesson.stageId), `Invalid stageId on ${lesson.id}`);
    assert.ok(typeof lesson.title === 'string' && lesson.title.length >= 8);
    assert.ok(typeof lesson.summary === 'string' && lesson.summary.length >= 30);

    if (lesson.bookFormat) {
      assert.ok(Array.isArray(lesson.bookSections) && lesson.bookSections.length >= 3, `Book chapter ${lesson.id} needs >= 3 bookSections`);
      let totalParas = 0;
      lesson.bookSections.forEach((sec, sIdx) => {
        assert.ok(typeof sec.number === 'string' && sec.number.length >= 3, `Book section ${sIdx} number missing in ${lesson.id}`);
        assert.ok(sec.heading && sec.heading.length >= 6, `Book section ${sIdx} heading missing in ${lesson.id}`);
        const hasVisualBlock = Boolean(sec.table || sec.exampleBox || sec.callout);
        const minParas = hasVisualBlock ? 1 : 2;
        assert.ok(Array.isArray(sec.paragraphs) && sec.paragraphs.length >= minParas, `Book section ${sIdx} needs >= ${minParas} narrative paragraphs in ${lesson.id}`);
        if (sec.callout && sec.callout.body) {
          assert.ok(!/<(strong|code|em|b)\b/i.test(sec.callout.body), `Raw HTML tag found in callout.body of ${lesson.id} section ${sIdx}`);
        }
        totalParas += sec.paragraphs.length + (Array.isArray(sec.paragraphsAfter) ? sec.paragraphsAfter.length : 0);
      });
      assert.ok(totalParas >= 7, `Book chapter ${lesson.id} needs >= 7 narrative paragraphs total, got ${totalParas}`);
      assert.ok(Array.isArray(lesson.keyTakeaways) && lesson.keyTakeaways.length >= 3, `Book chapter ${lesson.id} needs >= 3 keyTakeaways`);
      assert.ok(typeof lesson.bridgeNext === 'string' && lesson.bridgeNext.length >= 60, `Book chapter ${lesson.id} needs narrative bridgeNext`);
    } else {
      assert.ok(Array.isArray(lesson.conceptBlocks) && lesson.conceptBlocks.length >= 1, `Chapter ${lesson.id} needs >= 1 conceptBlock`);
      assert.ok(Array.isArray(lesson.validRules) && lesson.validRules.length >= 2);
      assert.ok(Array.isArray(lesson.invalidRules) && lesson.invalidRules.length >= 2);
      assert.ok(lesson.xauScenario && Array.isArray(lesson.xauScenario.steps) && lesson.xauScenario.steps.length >= 2);
      assert.ok(Array.isArray(lesson.goldenRules) && lesson.goldenRules.length >= 1);
      assert.ok(Array.isArray(lesson.mappingSteps) && lesson.mappingSteps.length >= 3, `Chapter ${lesson.id} needs >= 3 mappingSteps`);
      assert.ok(Array.isArray(lesson.decisionTree) && lesson.decisionTree.length >= 2, `Chapter ${lesson.id} needs >= 2 decisionTree rows`);
      assert.ok(lesson.failedCase && lesson.failedCase.context && lesson.failedCase.whyFailed, `Chapter ${lesson.id} needs failedCase`);
    }

    if (lesson.practiceCta && lesson.practiceCta.href) {
      const academyDir = fs.existsSync(path.resolve(ROOT, 'app/src/main/assets/apps/academy')) ? path.resolve(ROOT, 'app/src/main/assets/apps/academy') : path.resolve(ROOT, 'apps/academy');
      const targetPath = path.resolve(academyDir, lesson.practiceCta.href);
      assert.ok(fs.existsSync(targetPath), `Practice CTA href must resolve to existing file: ${lesson.practiceCta.href}`);
      assert.ok(typeof lesson.practiceCta.description === 'string' && lesson.practiceCta.description.length >= 20, `Practice CTA description missing in ${lesson.id}`);
    }

    const minQuiz = lesson.bookFormat ? 4 : 3;
    assert.ok(Array.isArray(lesson.quiz) && lesson.quiz.length >= minQuiz, `Chapter ${lesson.id} must have >= ${minQuiz} quiz questions`);
    lesson.quiz.forEach((q, qIdx) => {
      assert.ok(q.question && q.question.length >= 10, `Empty question ${qIdx} in ${lesson.id}`);
      assert.ok(Array.isArray(q.options) && q.options.length === 4, `Question ${qIdx} in ${lesson.id} needs 4 options`);
      assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4);
      assert.ok(q.explanation && q.explanation.length >= 15);
      totalQuestions += 1;
    });
  });

  // Bagian I (Bab 01–06), Bagian II (Bab 07–12) & Bagian III (Bab 13–17) must all be full Single-Flow Book Format
  const part1 = curriculum.getLessonsByStage(0);
  assert.equal(part1.length, 6);
  part1.forEach((lesson, idx) => {
    assert.equal(lesson.stepNumber, idx + 1);
    assert.equal(lesson.bookFormat, true, `Bagian I Bab ${idx + 1} (${lesson.id}) must have bookFormat: true`);
    assert.ok(lesson.quiz.length >= 4, `Bagian I Bab ${idx + 1} (${lesson.id}) must have >= 4 quiz questions`);
  });

  const part2 = curriculum.getLessonsByStage(1);
  assert.equal(part2.length, 6);
  part2.forEach((lesson, idx) => {
    assert.equal(lesson.stepNumber, 7 + idx);
    assert.equal(lesson.bookFormat, true, `Bagian II Bab ${7 + idx} (${lesson.id}) must have bookFormat: true`);
    assert.ok(lesson.quiz.length >= 4, `Bagian II Bab ${7 + idx} (${lesson.id}) must have >= 4 quiz questions`);
  });

  const part3 = curriculum.getLessonsByStage(2);
  assert.equal(part3.length, 5);
  part3.forEach((lesson, idx) => {
    assert.equal(lesson.stepNumber, 13 + idx);
    assert.equal(lesson.bookFormat, true, `Bagian III Bab ${13 + idx} (${lesson.id}) must have bookFormat: true`);
    assert.ok(lesson.quiz.length >= 4, `Bagian III Bab ${13 + idx} (${lesson.id}) must have >= 4 quiz questions`);
  });

  const part4 = curriculum.getLessonsByStage(3);
  assert.equal(part4.length, 7);
  part4.forEach((lesson, idx) => {
    assert.equal(lesson.stepNumber, 18 + idx);
    assert.equal(lesson.bookFormat, true, `Bagian IV Bab ${18 + idx} (${lesson.id}) must have bookFormat: true`);
    assert.ok(lesson.quiz.length >= 4, `Bagian IV Bab ${18 + idx} (${lesson.id}) must have >= 4 quiz questions`);
  });

  const part5 = curriculum.getLessonsByStage(4);
  assert.equal(part5.length, 6);
  part5.forEach((lesson, idx) => {
    assert.equal(lesson.stepNumber, 25 + idx);
    assert.equal(lesson.bookFormat, true, `Bagian V Bab ${25 + idx} (${lesson.id}) must have bookFormat: true`);
    assert.ok(lesson.quiz.length >= 4, `Bagian V Bab ${25 + idx} (${lesson.id}) must have >= 4 quiz questions`);
  });

  const part6 = curriculum.getLessonsByStage(5);
  assert.equal(part6.length, 6);
  part6.forEach((lesson, idx) => {
    assert.equal(lesson.stepNumber, 31 + idx);
    assert.equal(lesson.bookFormat, true, `Bagian VI Bab ${31 + idx} (${lesson.id}) must have bookFormat: true`);
    assert.ok(lesson.quiz.length >= 4, `Bagian VI Bab ${31 + idx} (${lesson.id}) must have >= 4 quiz questions`);
  });

  // Entire 36-chapter book (Bagian I–VI) must be 100% Single-Flow Interactive Book Format
  assert.equal(
    curriculum.LESSONS.filter((l) => l.bookFormat === true).length,
    36,
    'All 36 chapters across Bagian I–VI must have bookFormat: true'
  );

  // Capstone chapter is Bab 36
  const capstone = curriculum.getLessonById('capstone-mapping-mandiri');
  assert.ok(capstone, 'Missing Bab 36 capstone chapter');
  assert.equal(capstone.stepNumber, 36);

  assert.ok(totalQuestions >= 150, `Expected >= 150 scenario quiz questions across 36 chapters, got ${totalQuestions}`);
});

test('Verified XAU/USD Risk & Lot Calculator matches Kamus Patokan Baku formulas', () => {
  // Standard account: $1,000 balance, 1% risk ($10), $5 SL (50 pips) -> 0.02 Standard Lot
  const std = curriculum.calculateBeginnerRiskLot({
    balanceUsd: 1000,
    riskPct: 1,
    slPoints: 5,
    accountType: 'standard'
  });
  assert.equal(std.riskUsd, 10);
  assert.equal(std.slPips, 50);
  assert.equal(std.recommendedLot, 0.02);
  assert.equal(std.actualRiskUsd, 10);
  assert.equal(std.actualRiskPct, 1);
  assert.equal(std.safetyLevel, 'safe');
  assert.equal(std.needsCentHint, false);

  // Cent account: $50 balance (5,000 USC), 1% risk ($0.50 = 50 USC), $5 SL -> 0.10 Cent Lot
  const cent = curriculum.calculateBeginnerRiskLot({
    balanceUsd: 50,
    riskPct: 1,
    slPoints: 5,
    accountType: 'cent'
  });
  assert.equal(cent.riskUsd, 0.5);
  assert.equal(cent.recommendedLot, 0.1);
  assert.equal(cent.actualRiskUsd, 0.5);
  assert.equal(cent.actualRiskPct, 1);
  assert.equal(cent.safetyLevel, 'safe');
  assert.equal(cent.needsCentHint, false);

  // Small Standard account ($50, 1% risk, $5 SL) warns user to switch to Cent
  const smallStd = curriculum.calculateBeginnerRiskLot({
    balanceUsd: 50,
    riskPct: 1,
    slPoints: 5,
    accountType: 'standard'
  });
  assert.equal(smallStd.needsCentHint, true);
  assert.equal(smallStd.recommendedLot, 0.01);
  assert.equal(smallStd.actualRiskUsd, 5);
  assert.equal(smallStd.actualRiskPct, 10);
  assert.equal(smallStd.safetyLevel, 'danger');
});

test('Every single one of 36 book chapters maps to an interactive multi-stage SVG diagram without NaN or undefined', () => {
  for (const lesson of curriculum.LESSONS) {
    assert.ok(diagrams.hasDiagram(lesson.diagramId), `Missing diagram blueprint: ${lesson.diagramId}`);
    const bp = diagrams.getDiagramBlueprint(lesson.diagramId);
    assert.ok(Array.isArray(bp.stages) && bp.stages.length >= 2, `Diagram ${lesson.diagramId} must have >= 2 stages`);

    bp.stages.forEach((_, stageIdx) => {
      const rendered = diagrams.renderDiagramSVG(lesson.diagramId, stageIdx);
      assert.ok(rendered.svg.startsWith('<svg '), `Diagram ${lesson.diagramId} stage ${stageIdx} must start with <svg`);
      assert.ok(rendered.svg.endsWith('</svg>'), `Diagram ${lesson.diagramId} stage ${stageIdx} must end with </svg>`);
      assert.ok(!rendered.svg.includes('NaN'), `NaN found in SVG for ${lesson.diagramId} stage ${stageIdx}`);
      assert.ok(!rendered.svg.includes('undefined'), `undefined found in SVG for ${lesson.diagramId} stage ${stageIdx}`);
      assert.ok(rendered.caption && rendered.caption.length >= 15);
    });
  }
});

test('Strict Duolingo-style Mastery Locking enforces >=80% Uji Paham before unlocking next chapter', () => {
  let prog = curriculum.createEmptyProgress();
  const bab1 = curriculum.LESSONS[0];
  const bab2 = curriculum.LESSONS[1];
  const bab3 = curriculum.LESSONS[2];

  // Fresh state: only Bab 01 is unlocked; Bab 02..36 are locked
  assert.equal(curriculum.getFrontierIndex(prog), 0);
  assert.equal(curriculum.getModuleLockState(prog, bab1.id), 'unlocked');
  assert.equal(curriculum.getModuleLockState(prog, bab2.id), 'locked');
  assert.equal(curriculum.canOpenLesson(prog, bab1.id), true);
  assert.equal(curriculum.canOpenLesson(prog, bab2.id), false);
  assert.equal(curriculum.canOpenLesson(prog, 'capstone-mapping-mandiri'), false);

  const req = curriculum.getUnlockRequirement(prog, bab2.id);
  assert.equal(req.allowed, false);
  assert.ok(req.blockedByLesson && req.blockedByLesson.id === bab1.id);

  // Failing Uji Paham (3/4 = 75% < 80%) must NOT unlock Bab 02
  prog = curriculum.recordQuizAttempt(prog, bab1.id, 3, 4);
  assert.equal(prog.quizScores[bab1.id].passed, false);
  assert.equal(curriculum.isLessonMastered(prog, bab1.id), false);
  assert.equal(curriculum.canOpenLesson(prog, bab2.id), false);
  assert.equal(curriculum.getModuleLockState(prog, bab2.id), 'locked');

  // Passing Uji Paham (4/4 = 100% >= 80%) masters Bab 01 and unlocks Bab 02 (only)
  prog = curriculum.recordQuizAttempt(prog, bab1.id, 4, 4);
  assert.equal(prog.quizScores[bab1.id].passed, true);
  assert.equal(curriculum.isLessonMastered(prog, bab1.id), true);
  assert.equal(curriculum.getModuleLockState(prog, bab1.id), 'mastered');
  assert.equal(curriculum.getModuleLockState(prog, bab2.id), 'unlocked');
  assert.equal(curriculum.getModuleLockState(prog, bab3.id), 'locked');
  assert.equal(curriculum.canOpenLesson(prog, bab2.id), true);
  assert.equal(curriculum.canOpenLesson(prog, bab3.id), false);
  assert.ok(prog.xp > 0, 'Passing Uji Paham must award Mastery XP');

  // Threshold test for 5-question quiz: 3/5 (60%) fails, 4/5 (80%) passes
  let advProg = curriculum.createEmptyProgress();
  advProg = curriculum.recordQuizAttempt(advProg, 'breaker-mitigation-unicorn', 3, 5);
  assert.equal(advProg.quizScores['breaker-mitigation-unicorn'].passed, false);
  advProg = curriculum.recordQuizAttempt(advProg, 'breaker-mitigation-unicorn', 4, 5);
  assert.equal(advProg.quizScores['breaker-mitigation-unicorn'].passed, true);

  const stats = curriculum.computeProgressStats(prog);
  assert.equal(stats.totalLessons, 36);
  assert.equal(stats.completedCount, 1);
  assert.equal(stats.frontierLesson.id, bab2.id);
  assert.equal(stats.nextRecommendedLesson.id, bab2.id);
});

test('Placement Exam requires 100% (4/4) to unlock Bab 07 (struktur-pasar-dasar) directly', () => {
  assert.equal(curriculum.PLACEMENT_QUIZ.length, 4);

  const fresh = curriculum.createEmptyProgress();
  const wrongAnswers = curriculum.PLACEMENT_QUIZ.map((q, idx) => (idx === 0 ? (q.answerIndex + 1) % 4 : q.answerIndex));
  const failRes = curriculum.evaluatePlacementAttempt(fresh, wrongAnswers);
  assert.equal(failRes.passed, false);
  assert.equal(failRes.correct, 3);
  assert.equal(curriculum.canOpenLesson(failRes.nextProgress, 'struktur-pasar-dasar'), false);

  const perfectAnswers = curriculum.PLACEMENT_QUIZ.map((q) => q.answerIndex);
  const passRes = curriculum.evaluatePlacementAttempt(fresh, perfectAnswers);
  assert.equal(passRes.passed, true);
  assert.equal(passRes.correct, 4);
  assert.equal(passRes.nextProgress.placementPassed, true);
  assert.equal(curriculum.canOpenLesson(passRes.nextProgress, 'struktur-pasar-dasar'), true);
  assert.equal(curriculum.getModuleLockState(passRes.nextProgress, 'struktur-pasar-dasar'), 'unlocked');
  assert.equal(curriculum.canOpenLesson(passRes.nextProgress, 'swing-high-low-fractals'), false);
});

test('LEGACY_ID_ALIASES preserve deep-links from guided-exercises and bookmarks without breakage', () => {
  const expectedAliases = {
    'logika-trading-probabilitas': 'kenal-trading-broker-akun',
    'membaca-candlestick-body-wick': 'membaca-chart-candlestick-nol',
    'sizing-lot-xauusd-risiko': 'lot-leverage-margin-equity',
    'dasar-tren-sr-rencana-14-hari': 'struktur-pasar-dasar',
    'model-order-block-sniper': 'order-block-valid-mean-threshold',
    'sop-playbook-harian-xauusd': 'capstone-mapping-mandiri',
    'psikologi-scalper-anti-fomo': 'protokol-100-sample-mandiri'
  };

  for (const [legacyId, canonicalId] of Object.entries(expectedAliases)) {
    assert.equal(curriculum.resolveLessonId(legacyId), canonicalId);
    const resolved = curriculum.getLessonById(legacyId);
    assert.ok(resolved && resolved.id === canonicalId, `Legacy id ${legacyId} must resolve to ${canonicalId}`);
  }
});

test('Search across bookSections, filtering, and adjacent navigation work across all 36 chapters', () => {
  const mt5Hits = curriculum.filterLessons({ query: 'Buy Limit' });
  assert.ok(mt5Hits.some((l) => l.id === 'panduan-mt5-lima-jenis-order'));

  const witaHits = curriculum.filterLessons({ query: 'EDT' });
  assert.ok(witaHits.some((l) => l.id === 'karakter-xauusd-spread-wita'));

  const unicornHits = curriculum.filterLessons({ query: 'Unicorn' });
  assert.ok(unicornHits.some((l) => l.id === 'breaker-mitigation-unicorn'));

  const smtHits = curriculum.filterLessons({ query: 'SMT' });
  assert.ok(smtHits.some((l) => l.id === 'smt-divergence-gold'));

  const mmxmHits = curriculum.filterLessons({ query: 'MMXM' });
  assert.ok(mmxmHits.some((l) => l.id === 'mmxm-market-maker-model'));

  const part1Bridge = curriculum.getAdjacentLessons('karakter-xauusd-spread-wita');
  assert.equal(part1Bridge.prev.id, 'membaca-chart-candlestick-nol');
  assert.equal(part1Bridge.next.id, 'struktur-pasar-dasar');

  const capstoneAdj = curriculum.getAdjacentLessons('capstone-mapping-mandiri');
  assert.equal(capstoneAdj.prev.id, 'stdev-crt-profiling');
  assert.equal(capstoneAdj.next, null);
});

test('Amy Live local knowledge file is synced with all 36 Academy Book Chapters and valid deep-links', () => {
  const knowledgePath = fs.existsSync(path.resolve(ROOT, 'app/src/main/assets/apps/shared/amy-local-knowledge.js')) ? path.resolve(ROOT, 'app/src/main/assets/apps/shared/amy-local-knowledge.js') : path.resolve(ROOT, 'apps/shared/amy-local-knowledge.js');
  const code = fs.readFileSync(knowledgePath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);

  assert.ok(Array.isArray(sandbox.window.AmyLocalKnowledge));
  assert.equal(sandbox.window.AmyLocalKnowledge.length, 36);

  sandbox.window.AmyLocalKnowledge.forEach((entry, idx) => {
    const lesson = curriculum.LESSONS[idx];
    assert.equal(entry.path, `apps/academy/index.html?lesson=${lesson.id}`);
    assert.ok(entry.title.includes(lesson.title));
    assert.ok(entry.text.length >= 160);
  });
});
