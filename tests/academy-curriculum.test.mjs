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
    'app/src/main/assets/apps/academy/data/levels-1-2.js',
    'app/src/main/assets/apps/academy/data/levels-3-4.js',
    'app/src/main/assets/apps/academy/data/levels-5-6.js',
    'app/src/main/assets/apps/academy/data/curriculum.js',
    'app/src/main/assets/apps/academy/js/diagram-engine.js'
  ];
  for (const rel of files) {
    const code = fs.readFileSync(path.resolve(process.cwd(), rel), 'utf8');
    vm.runInContext(code, ctx, { filename: rel });
  }
  return {
    curriculum: ctx.AmyAcademyCurriculum,
    diagrams: ctx.AmyAcademyDiagrams
  };
}

const { curriculum, diagrams } = loadAcademyRuntime();

test('Academy curriculum has exactly 6 levels, 30 lessons, and 90 diagnostic quiz questions', () => {
  assert.equal(curriculum.LEVELS.length, 6);
  assert.equal(curriculum.LESSONS.length, 30);

  const ids = new Set();
  let totalQuestions = 0;

  curriculum.LESSONS.forEach((lesson, idx) => {
    assert.equal(lesson.number, idx + 1, `Lesson ${lesson.id} should have sequential number ${idx + 1}`);
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

    assert.ok(Array.isArray(lesson.quiz) && lesson.quiz.length === 3, `Lesson ${lesson.id} must have 3 quiz questions`);
    lesson.quiz.forEach((q, qIdx) => {
      assert.ok(q.question && q.question.length >= 10, `Empty question ${qIdx} in ${lesson.id}`);
      assert.ok(Array.isArray(q.options) && q.options.length === 4, `Question ${qIdx} in ${lesson.id} needs 4 options`);
      assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4);
      assert.ok(q.explanation && q.explanation.length >= 15);
      totalQuestions += 1;
    });
  });

  assert.equal(totalQuestions, 90);
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

test('Filtering, search, progress tracking, and quiz persistence logic behave deterministically', () => {
  const lvl4 = curriculum.filterLessons({ levelId: 4 });
  assert.equal(lvl4.length, 5);
  assert.ok(lvl4.every(l => l.levelId === 4));

  const ifvgHits = curriculum.filterLessons({ query: 'IFVG' });
  assert.ok(ifvgHits.length >= 1);
  assert.ok(ifvgHits.some(l => l.diagramId === 'model-ifvg-flip'));

  let prog = curriculum.createEmptyProgress();
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
  assert.equal(stats.totalLessons, 30);
  assert.equal(stats.completedCount, 1);
  assert.equal(stats.percent, 3);
  assert.equal(stats.byLevel[0].completed, 1);
  assert.equal(stats.nextRecommendedLesson.number, 2);

  const adj = curriculum.getAdjacentLessons(curriculum.LESSONS[15].id);
  assert.equal(adj.prev.number, 15);
  assert.equal(adj.next.number, 17);
});

test('Amy Live local knowledge file is synced with all 30 new Academy lessons and valid deep-links', () => {
  const candidatePaths = [
    path.resolve(process.cwd(), 'apps/shared/amy-local-knowledge.js'),
    path.resolve(process.cwd(), 'app/src/main/assets/apps/shared/amy-local-knowledge.js')
  ];
  const knowledgePath = candidatePaths.find(p => fs.existsSync(p));
  assert.ok(knowledgePath, 'amy-local-knowledge.js must exist');
  const code = fs.readFileSync(knowledgePath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);

  assert.ok(Array.isArray(sandbox.window.AmyLocalKnowledge));
  assert.equal(sandbox.window.AmyLocalKnowledge.length, 30);

  sandbox.window.AmyLocalKnowledge.forEach((entry, idx) => {
    const lesson = curriculum.LESSONS[idx];
    assert.equal(entry.path, `apps/academy/index.html?lesson=${lesson.id}`);
    assert.ok(entry.title.includes(lesson.title));
    assert.ok(entry.text.length >= 120);
  });
});
