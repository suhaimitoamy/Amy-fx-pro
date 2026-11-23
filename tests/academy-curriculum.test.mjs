import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

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
  for (const rel of files) {
    const p1 = path.resolve(process.cwd(), 'app/src/main/assets', rel);
    const fullPath = fs.existsSync(p1) ? p1 : path.resolve(process.cwd(), rel);
    const code = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(code, ctx, { filename: rel });
  }
  return {
    curriculum: ctx.AmyAcademyCurriculum,
    diagrams: ctx.AmyAcademyDiagrams
  };
}

const { curriculum, diagrams } = loadAcademyRuntime();

test('Academy Mastery Path has 8 stages, 43 sequential modules, deep enrichment, and valid quizzes', () => {
  assert.equal(curriculum.STAGES.length, 8);
  assert.equal(curriculum.LEVELS.length, 8);
  assert.equal(curriculum.LESSONS.length, 43);

  const ids = new Set();
  let totalQuestions = 0;

  curriculum.LESSONS.forEach((lesson, idx) => {
    assert.equal(lesson.stepNumber, idx + 1, `Module ${lesson.id} must have sequential stepNumber`);
    assert.equal(lesson.stepCode, String(idx + 1).padStart(2, '0'));
    assert.equal(curriculum.formatLessonNumber(lesson), String(idx + 1).padStart(2, '0'));

    assert.ok(lesson.id && !ids.has(lesson.id), `Duplicate or missing lesson id: ${lesson.id}`);
    ids.add(lesson.id);

    assert.ok(curriculum.getStageById(lesson.stageId), `Invalid stageId on ${lesson.id}`);
    assert.ok(typeof lesson.title === 'string' && lesson.title.length >= 8);
    assert.ok(typeof lesson.summary === 'string' && lesson.summary.length >= 30);
    assert.ok(Array.isArray(lesson.conceptBlocks) && lesson.conceptBlocks.length >= 1, `Module ${lesson.id} needs >= 1 conceptBlock`);
    assert.ok(Array.isArray(lesson.validRules) && lesson.validRules.length >= 2);
    assert.ok(Array.isArray(lesson.invalidRules) && lesson.invalidRules.length >= 2);
    assert.ok(lesson.xauScenario && Array.isArray(lesson.xauScenario.steps) && lesson.xauScenario.steps.length >= 2);
    assert.ok(Array.isArray(lesson.goldenRules) && lesson.goldenRules.length >= 1);

    // Deep anti-confusion fields required on EVERY module (01..43)
    assert.ok(Array.isArray(lesson.mappingSteps) && lesson.mappingSteps.length >= 3, `Module ${lesson.id} needs >= 3 mappingSteps`);
    assert.ok(Array.isArray(lesson.decisionTree) && lesson.decisionTree.length >= 2, `Module ${lesson.id} needs >= 2 decisionTree rows`);
    lesson.decisionTree.forEach((row) => {
      assert.ok(row.condition && row.action, `Invalid decisionTree row in ${lesson.id}`);
    });
    assert.ok(lesson.failedCase && lesson.failedCase.context && lesson.failedCase.whyFailed, `Module ${lesson.id} needs failedCase`);

    if (lesson.levelId === 0) {
      assert.ok(lesson.practiceCta && lesson.practiceCta.label && lesson.practiceCta.href, `Foundation module ${lesson.id} needs practiceCta`);
      const academyDir = fs.existsSync(path.resolve(process.cwd(), 'app/src/main/assets/apps/academy')) ? path.resolve(process.cwd(), 'app/src/main/assets/apps/academy') : path.resolve(process.cwd(), 'apps/academy');
      const targetPath = path.resolve(academyDir, lesson.practiceCta.href);
      assert.ok(fs.existsSync(targetPath), `Practice CTA href must resolve to existing file: ${lesson.practiceCta.href}`);
    }

    const minQuiz = lesson.stepNumber >= 37 ? 5 : 3;
    assert.ok(Array.isArray(lesson.quiz) && lesson.quiz.length >= minQuiz, `Module ${lesson.id} must have >= ${minQuiz} quiz questions`);
    lesson.quiz.forEach((q, qIdx) => {
      assert.ok(q.question && q.question.length >= 10, `Empty question ${qIdx} in ${lesson.id}`);
      assert.ok(Array.isArray(q.options) && q.options.length === 4, `Question ${qIdx} in ${lesson.id} needs 4 options`);
      assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4);
      assert.ok(q.explanation && q.explanation.length >= 15);
      totalQuestions += 1;
    });
  });

  // 7 brand-new advanced ICT modules (Modul 37–43) must be present and non-overlapping
  const advancedIds = [
    'breaker-mitigation-unicorn',
    'bpr-nwog-ndog-imbalance',
    'smt-divergence-gold',
    'mmxm-market-maker-model',
    'ict-macros-weekly-ipda',
    'stdev-crt-profiling',
    'capstone-mapping-mandiri'
  ];
  advancedIds.forEach((id, i) => {
    const mod = curriculum.getLessonById(id);
    assert.ok(mod, `Missing advanced module: ${id}`);
    assert.equal(mod.stepNumber, 37 + i);
  });

  assert.ok(totalQuestions >= 150, `Expected >= 150 scenario quiz questions, got ${totalQuestions}`);
});

test('Every single one of 43 modules maps to an interactive multi-stage SVG diagram without NaN or undefined', () => {
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

test('Strict Duolingo-style Mastery Locking enforces >=80% Uji Paham before unlocking next module', () => {
  let prog = curriculum.createEmptyProgress();
  const mod1 = curriculum.LESSONS[0];
  const mod2 = curriculum.LESSONS[1];
  const mod3 = curriculum.LESSONS[2];

  // Fresh state: only Modul 01 is unlocked; Modul 02..43 are locked
  assert.equal(curriculum.getFrontierIndex(prog), 0);
  assert.equal(curriculum.getModuleLockState(prog, mod1.id), 'unlocked');
  assert.equal(curriculum.getModuleLockState(prog, mod2.id), 'locked');
  assert.equal(curriculum.canOpenLesson(prog, mod1.id), true);
  assert.equal(curriculum.canOpenLesson(prog, mod2.id), false);
  assert.equal(curriculum.canOpenLesson(prog, 'capstone-mapping-mandiri'), false);

  const req = curriculum.getUnlockRequirement(prog, mod2.id);
  assert.equal(req.allowed, false);
  assert.ok(req.blockedByLesson && req.blockedByLesson.id === mod1.id);

  // Failing Uji Paham (2/3 = 67% < 80%) must NOT unlock Modul 02
  prog = curriculum.recordQuizAttempt(prog, mod1.id, 2, 3);
  assert.equal(prog.quizScores[mod1.id].passed, false);
  assert.equal(curriculum.isLessonMastered(prog, mod1.id), false);
  assert.equal(curriculum.canOpenLesson(prog, mod2.id), false);
  assert.equal(curriculum.getModuleLockState(prog, mod2.id), 'locked');

  // Passing Uji Paham (3/3 = 100% >= 80%) masters Modul 01 and unlocks Modul 02 (only)
  prog = curriculum.recordQuizAttempt(prog, mod1.id, 3, 3);
  assert.equal(prog.quizScores[mod1.id].passed, true);
  assert.equal(curriculum.isLessonMastered(prog, mod1.id), true);
  assert.equal(curriculum.getModuleLockState(prog, mod1.id), 'mastered');
  assert.equal(curriculum.getModuleLockState(prog, mod2.id), 'unlocked');
  assert.equal(curriculum.getModuleLockState(prog, mod3.id), 'locked');
  assert.equal(curriculum.canOpenLesson(prog, mod2.id), true);
  assert.equal(curriculum.canOpenLesson(prog, mod3.id), false);
  assert.ok(prog.xp > 0, 'Passing Uji Paham must award Mastery XP');

  // Threshold test for 5-question advanced quiz: 3/5 (60%) fails, 4/5 (80%) passes
  let advProg = curriculum.createEmptyProgress();
  advProg = curriculum.recordQuizAttempt(advProg, 'breaker-mitigation-unicorn', 3, 5);
  assert.equal(advProg.quizScores['breaker-mitigation-unicorn'].passed, false);
  advProg = curriculum.recordQuizAttempt(advProg, 'breaker-mitigation-unicorn', 4, 5);
  assert.equal(advProg.quizScores['breaker-mitigation-unicorn'].passed, true);

  const stats = curriculum.computeProgressStats(prog);
  assert.equal(stats.totalLessons, 43);
  assert.equal(stats.completedCount, 1);
  assert.equal(stats.frontierLesson.id, mod2.id);
  assert.equal(stats.nextRecommendedLesson.id, mod2.id);
});

test('Placement Exam requires 100% (4/4) to unlock Modul 07 directly without skipping on partial score', () => {
  assert.equal(curriculum.PLACEMENT_QUIZ.length, 4);

  const fresh = curriculum.createEmptyProgress();
  const wrongAnswers = curriculum.PLACEMENT_QUIZ.map((q, idx) => (idx === 0 ? (q.answerIndex + 1) % 4 : q.answerIndex));
  const failRes = curriculum.evaluatePlacementAttempt(fresh, wrongAnswers);
  assert.equal(failRes.passed, false);
  assert.equal(failRes.correct, 3);
  assert.equal(curriculum.canOpenLesson(failRes.nextProgress, 'logika-trading-probabilitas'), false);

  const perfectAnswers = curriculum.PLACEMENT_QUIZ.map((q) => q.answerIndex);
  const passRes = curriculum.evaluatePlacementAttempt(fresh, perfectAnswers);
  assert.equal(passRes.passed, true);
  assert.equal(passRes.correct, 4);
  assert.equal(passRes.nextProgress.placementPassed, true);
  assert.equal(curriculum.canOpenLesson(passRes.nextProgress, 'logika-trading-probabilitas'), true);
  assert.equal(curriculum.getModuleLockState(passRes.nextProgress, 'logika-trading-probabilitas'), 'unlocked');
  assert.equal(curriculum.canOpenLesson(passRes.nextProgress, 'membaca-candlestick-body-wick'), false);
});

test('Search, filtering, and adjacent navigation work across all 43 modules', () => {
  const mt5Hits = curriculum.filterLessons({ query: 'Buy Limit' });
  assert.ok(mt5Hits.some((l) => l.id === 'panduan-mt5-lima-jenis-order'));

  const unicornHits = curriculum.filterLessons({ query: 'Unicorn' });
  assert.ok(unicornHits.some((l) => l.id === 'breaker-mitigation-unicorn'));

  const smtHits = curriculum.filterLessons({ query: 'SMT' });
  assert.ok(smtHits.some((l) => l.id === 'smt-divergence-gold'));

  const mmxmHits = curriculum.filterLessons({ query: 'MMXM' });
  assert.ok(mmxmHits.some((l) => l.id === 'mmxm-market-maker-model'));

  const bridgeAdj = curriculum.getAdjacentLessons('dasar-tren-sr-rencana-14-hari');
  assert.equal(bridgeAdj.prev.id, 'membaca-chart-candlestick-nol');
  assert.equal(bridgeAdj.next.id, 'logika-trading-probabilitas');

  const advBridge = curriculum.getAdjacentLessons('protokol-100-sample-mandiri');
  assert.equal(advBridge.next.id, 'breaker-mitigation-unicorn');
});

test('Amy Live local knowledge file is synced with all 43 Academy Mastery Modules and valid deep-links', () => {
  const knowledgePath = fs.existsSync(path.resolve(process.cwd(), 'app/src/main/assets/apps/shared/amy-local-knowledge.js')) ? path.resolve(process.cwd(), 'app/src/main/assets/apps/shared/amy-local-knowledge.js') : path.resolve(process.cwd(), 'apps/shared/amy-local-knowledge.js');
  const code = fs.readFileSync(knowledgePath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);

  assert.ok(Array.isArray(sandbox.window.AmyLocalKnowledge));
  assert.equal(sandbox.window.AmyLocalKnowledge.length, 43);

  sandbox.window.AmyLocalKnowledge.forEach((entry, idx) => {
    const lesson = curriculum.LESSONS[idx];
    assert.equal(entry.path, `apps/academy/index.html?lesson=${lesson.id}`);
    assert.ok(entry.title.includes(lesson.title));
    assert.ok(entry.text.length >= 160);
  });
});
