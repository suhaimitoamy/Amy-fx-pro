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

test('Academy curriculum has 7 levels (Level 0–6), 36 lessons, and 108 diagnostic quiz questions', () => {
  assert.equal(curriculum.LEVELS.length, 7);
  assert.equal(curriculum.LEVELS[0].id, 0);
  assert.equal(curriculum.LESSONS.length, 36);

  const level0Lessons = curriculum.getLessonsByLevel(0);
  assert.equal(level0Lessons.length, 6);
  assert.deepEqual(
    Array.from(level0Lessons, l => curriculum.formatLessonNumber(l)),
    ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6']
  );

  const ids = new Set();
  let totalQuestions = 0;

  curriculum.LESSONS.forEach((lesson, idx) => {
    if (idx > 0) {
      assert.ok(lesson.number > curriculum.LESSONS[idx - 1].number, `Lesson ${lesson.id} must be strictly ordered`);
    }
    assert.ok(lesson.id && !ids.has(lesson.id), `Duplicate or missing lesson id: ${lesson.id}`);
    ids.add(lesson.id);

    assert.ok(curriculum.getLevelById(lesson.levelId), `Invalid levelId on ${lesson.id}`);
    assert.ok(typeof lesson.title === 'string' && lesson.title.length >= 8);
    assert.ok(typeof lesson.summary === 'string' && lesson.summary.length >= 30);
    assert.ok(Array.isArray(lesson.conceptBlocks) && lesson.conceptBlocks.length >= 1);
    assert.ok(Array.isArray(lesson.validRules) && lesson.validRules.length >= 2);
    assert.ok(Array.isArray(lesson.invalidRules) && lesson.invalidRules.length >= 2);
    assert.ok(lesson.xauScenario && Array.isArray(lesson.xauScenario.steps) && lesson.xauScenario.steps.length >= 2);
    assert.ok(Array.isArray(lesson.goldenRules) && lesson.goldenRules.length >= 1);

    if (lesson.levelId === 0) {
      assert.ok(lesson.practiceCta && lesson.practiceCta.label && lesson.practiceCta.href, `Level 0 lesson ${lesson.id} needs practiceCta`);
      const targetPath = path.resolve(fs.existsSync(path.resolve(process.cwd(), 'app/src/main/assets/apps/academy')) ? path.resolve(process.cwd(), 'app/src/main/assets/apps/academy') : path.resolve(process.cwd(), 'apps/academy'), lesson.practiceCta.href);
      assert.ok(fs.existsSync(targetPath), `Practice CTA href must resolve to existing file: ${lesson.practiceCta.href}`);
    } else {
      assert.equal(curriculum.formatLessonNumber(lesson), String(lesson.number).padStart(2, '0'));
    }

    assert.ok(Array.isArray(lesson.quiz) && lesson.quiz.length === 3, `Lesson ${lesson.id} must have 3 quiz questions`);
    lesson.quiz.forEach((q, qIdx) => {
      assert.ok(q.question && q.question.length >= 10, `Empty question ${qIdx} in ${lesson.id}`);
      assert.ok(Array.isArray(q.options) && q.options.length === 4, `Question ${qIdx} in ${lesson.id} needs 4 options`);
      assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4);
      assert.ok(q.explanation && q.explanation.length >= 15);
      totalQuestions += 1;
    });
  });

  assert.equal(totalQuestions, 108);
});

test('Every lesson maps to an interactive multi-stage SVG diagram without NaN or undefined', () => {
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

test('Filtering, search, learner track, progress tracking, and quiz persistence logic behave deterministically', () => {
  const lvl0 = curriculum.filterLessons({ levelId: 0 });
  assert.equal(lvl0.length, 6);
  assert.ok(lvl0.every(l => l.levelId === 0));

  const lvl4 = curriculum.filterLessons({ levelId: 4 });
  assert.equal(lvl4.length, 5);
  assert.ok(lvl4.every(l => l.levelId === 4));

  const mt5Hits = curriculum.filterLessons({ query: 'Buy Limit' });
  assert.ok(mt5Hits.some(l => l.id === 'panduan-mt5-lima-jenis-order'));

  const ifvgHits = curriculum.filterLessons({ query: 'IFVG' });
  assert.ok(ifvgHits.length >= 1);
  assert.ok(ifvgHits.some(l => l.diagramId === 'model-ifvg-flip'));

  let prog = curriculum.createEmptyProgress();
  assert.equal(curriculum.normalizeTrack('beginner'), 'beginner');
  assert.equal(curriculum.normalizeTrack('ICT'), 'ict');
  assert.equal(curriculum.normalizeTrack('unknown'), null);
  assert.equal(curriculum.getRecommendedLessonForTrack(prog, 'beginner').id, 'kenal-trading-broker-akun');
  assert.equal(curriculum.getRecommendedLessonForTrack(prog, 'ict').id, 'logika-trading-probabilitas');

  // Failing quiz (1/3) records score but does not mark completed
  prog = curriculum.recordQuizAttempt(prog, curriculum.LESSONS[0].id, 1, 3);
  assert.equal(prog.completedIds.length, 0);
  assert.equal(prog.quizScores[curriculum.LESSONS[0].id].passed, false);

  // Passing quiz (3/3) marks completed and updates best score
  prog = curriculum.recordQuizAttempt(prog, curriculum.LESSONS[0].id, 3, 3);
  assert.equal(prog.completedIds.length, 1);
  assert.equal(prog.quizScores[curriculum.LESSONS[0].id].passed, true);
  assert.equal(prog.quizScores[curriculum.LESSONS[0].id].correct, 3);

  // Manual toggle off & on
  prog = curriculum.toggleLessonCompleted(prog, curriculum.LESSONS[0].id, false);
  assert.equal(prog.completedIds.length, 0);
  prog = curriculum.toggleLessonCompleted(prog, curriculum.LESSONS[0].id, true);
  assert.equal(prog.completedIds.length, 1);

  const stats = curriculum.computeProgressStats(prog);
  assert.equal(stats.totalLessons, 36);
  assert.equal(stats.completedCount, 1);
  assert.equal(stats.percent, 3);
  assert.equal(stats.byLevel[0].levelId, 0);
  assert.equal(stats.byLevel[0].completed, 1);
  assert.equal(stats.nextRecommendedLesson.id, 'bid-ask-spread-pips-gold');

  // Adjacent navigation bridges seamlessly from Level 0 Bab 0.6 to Level 1 Bab 01
  const bridgeAdj = curriculum.getAdjacentLessons('dasar-tren-sr-rencana-14-hari');
  assert.equal(bridgeAdj.prev.id, 'membaca-chart-candlestick-nol');
  assert.equal(bridgeAdj.next.id, 'logika-trading-probabilitas');
});

test('Amy Live local knowledge file is synced with all 36 Academy lessons and valid deep-links', () => {
  const knowledgePath = (fs.existsSync(path.resolve(process.cwd(), 'app/src/main/assets/apps/shared/amy-local-knowledge.js')) ? path.resolve(process.cwd(), 'app/src/main/assets/apps/shared/amy-local-knowledge.js') : path.resolve(process.cwd(), 'apps/shared/amy-local-knowledge.js'));
  const code = fs.readFileSync(knowledgePath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);

  assert.ok(Array.isArray(sandbox.window.AmyLocalKnowledge));
  assert.equal(sandbox.window.AmyLocalKnowledge.length, 36);

  sandbox.window.AmyLocalKnowledge.forEach((entry, idx) => {
    const lesson = curriculum.LESSONS[idx];
    assert.equal(entry.path, `apps/academy/index.html?lesson=${lesson.id}`);
    assert.ok(entry.title.includes(lesson.title));
    assert.ok(entry.text.length >= 120);
  });
});
