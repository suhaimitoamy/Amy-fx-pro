/* Amy FX Academy — Curriculum Assembler & Pure Progress Logic
 * Combines Level 1–6 (30 Lessons) + pure helpers for filtering, progress, quiz scoring, and Amy Live knowledge.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const p1 = require('./levels-1-2.js');
    const p2 = require('./levels-3-4.js');
    const p3 = require('./levels-5-6.js');
    module.exports = factory(p1, p2, p3);
  } else {
    root.AmyAcademyCurriculum = factory(
      root.AmyAcademyPart1,
      root.AmyAcademyPart2,
      root.AmyAcademyPart3
    );
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function (part1, part2, part3) {
  'use strict';

  const STORAGE_KEY = 'amy_academy_progress_v2';

  const parts = [part1, part2, part3].filter(Boolean);

  const LEVELS = parts
    .flatMap(p => (Array.isArray(p.LEVELS) ? p.LEVELS : []))
    .slice()
    .sort((a, b) => a.id - b.id);

  const LESSONS = parts
    .flatMap(p => (Array.isArray(p.LESSONS) ? p.LESSONS : []))
    .slice()
    .sort((a, b) => a.number - b.number);

  const levelMap = new Map(LEVELS.map(lvl => [lvl.id, lvl]));
  const lessonMap = new Map(LESSONS.map(l => [l.id, l]));

  function getLevelById(levelId) {
    return levelMap.get(Number(levelId)) || null;
  }

  function getLessonById(lessonId) {
    if (!lessonId) return null;
    return lessonMap.get(String(lessonId).trim()) || null;
  }

  function getLessonsByLevel(levelId) {
    const id = Number(levelId);
    return LESSONS.filter(l => l.levelId === id);
  }

  function normalizeText(value) {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9/$.%\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function createEmptyProgress() {
    return {
      completedIds: [],
      quizScores: {},
      lastLessonId: null,
      updatedAt: null
    };
  }

  function normalizeProgress(raw) {
    const base = createEmptyProgress();
    if (!raw || typeof raw !== 'object') return base;

    const seen = new Set();
    if (Array.isArray(raw.completedIds)) {
      for (const id of raw.completedIds) {
        const key = String(id || '').trim();
        if (lessonMap.has(key) && !seen.has(key)) {
          seen.add(key);
          base.completedIds.push(key);
        }
      }
    }

    if (raw.quizScores && typeof raw.quizScores === 'object') {
      for (const [id, rec] of Object.entries(raw.quizScores)) {
        if (!lessonMap.has(id) || !rec || typeof rec !== 'object') continue;
        const total = Math.max(1, Number(rec.total) || 3);
        const correct = Math.max(0, Math.min(total, Number(rec.correct) || 0));
        const passed = Boolean(rec.passed ?? (correct >= Math.ceil(total * 0.67)));
        base.quizScores[id] = {
          correct,
          total,
          passed,
          updatedAt: rec.updatedAt || null
        };
      }
    }

    if (raw.lastLessonId && lessonMap.has(String(raw.lastLessonId))) {
      base.lastLessonId = String(raw.lastLessonId);
    }

    if (raw.updatedAt && typeof raw.updatedAt === 'string') {
      base.updatedAt = raw.updatedAt;
    }

    return base;
  }

  function setLastLesson(progress, lessonId) {
    const next = normalizeProgress(progress);
    if (!lessonMap.has(lessonId)) return next;
    next.lastLessonId = lessonId;
    next.updatedAt = new Date().toISOString();
    return next;
  }

  function toggleLessonCompleted(progress, lessonId, forceState) {
    const next = normalizeProgress(progress);
    if (!lessonMap.has(lessonId)) return next;
    const exists = next.completedIds.includes(lessonId);
    const shouldComplete = typeof forceState === 'boolean' ? forceState : !exists;

    if (shouldComplete && !exists) {
      next.completedIds.push(lessonId);
    } else if (!shouldComplete && exists) {
      next.completedIds = next.completedIds.filter(id => id !== lessonId);
    }
    next.lastLessonId = lessonId;
    next.updatedAt = new Date().toISOString();
    return next;
  }

  function recordQuizAttempt(progress, lessonId, correctCount, totalQuestions) {
    const next = normalizeProgress(progress);
    const lesson = lessonMap.get(lessonId);
    if (!lesson) return next;

    const total = Math.max(1, Number(totalQuestions) || lesson.quiz.length || 3);
    const correct = Math.max(0, Math.min(total, Number(correctCount) || 0));
    const passed = correct >= Math.ceil(total * 0.67);
    const now = new Date().toISOString();

    const prev = next.quizScores[lessonId];
    const bestCorrect = prev ? Math.max(prev.correct, correct) : correct;
    const bestPassed = prev ? (prev.passed || passed) : passed;

    next.quizScores[lessonId] = {
      correct: bestCorrect,
      total,
      passed: bestPassed,
      lastCorrect: correct,
      updatedAt: now
    };

    if (passed && !next.completedIds.includes(lessonId)) {
      next.completedIds.push(lessonId);
    }
    next.lastLessonId = lessonId;
    next.updatedAt = now;
    return next;
  }

  function filterLessons(options) {
    const opts = options || {};
    const levelFilter = opts.levelId === undefined || opts.levelId === null || opts.levelId === 'all'
      ? 'all'
      : Number(opts.levelId);
    const statusFilter = opts.status || 'all';
    const q = normalizeText(opts.query || '');
    const completedSet = new Set(Array.isArray(opts.completedIds) ? opts.completedIds : []);

    return LESSONS.filter(lesson => {
      if (levelFilter !== 'all' && lesson.levelId !== levelFilter) return false;

      if (statusFilter === 'completed' && !completedSet.has(lesson.id)) return false;
      if (statusFilter === 'incomplete' && completedSet.has(lesson.id)) return false;

      if (!q) return true;
      const level = getLevelById(lesson.levelId);
      const haystack = normalizeText([
        lesson.title,
        lesson.summary,
        lesson.id,
        lesson.diagramId,
        level ? `${level.code} ${level.title}` : '',
        ...(lesson.conceptBlocks || []).map(b => `${b.heading} ${(b.paragraphs || []).join(' ')}`),
        ...(lesson.goldenRules || [])
      ].join(' '));

      const tokens = q.split(' ').filter(Boolean);
      return tokens.every(tok => haystack.includes(tok));
    });
  }

  function computeProgressStats(progress) {
    const norm = normalizeProgress(progress);
    const completedSet = new Set(norm.completedIds);
    const totalLessons = LESSONS.length;
    const completedCount = completedSet.size;
    const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    let quizPassedCount = 0;
    let totalQuizQuestions = 0;
    let totalQuizCorrect = 0;

    for (const lesson of LESSONS) {
      totalQuizQuestions += Array.isArray(lesson.quiz) ? lesson.quiz.length : 0;
      const rec = norm.quizScores[lesson.id];
      if (rec) {
        if (rec.passed) quizPassedCount += 1;
        totalQuizCorrect += rec.correct;
      }
    }

    const byLevel = LEVELS.map(level => {
      const items = getLessonsByLevel(level.id);
      const done = items.filter(l => completedSet.has(l.id)).length;
      const total = items.length;
      return {
        levelId: level.id,
        code: level.code,
        title: level.title,
        total,
        completed: done,
        percent: total > 0 ? Math.round((done / total) * 100) : 0
      };
    });

    const firstIncomplete = LESSONS.find(l => !completedSet.has(l.id)) || LESSONS[0] || null;
    const lastLesson = norm.lastLessonId ? getLessonById(norm.lastLessonId) : null;
    const nextRecommendedLesson = lastLesson && !completedSet.has(lastLesson.id)
      ? lastLesson
      : firstIncomplete;

    return {
      totalLessons,
      completedCount,
      percent,
      quizPassedCount,
      totalQuizQuestions,
      totalQuizCorrect,
      byLevel,
      lastLesson,
      nextRecommendedLesson
    };
  }

  function getAdjacentLessons(lessonId) {
    const idx = LESSONS.findIndex(l => l.id === lessonId);
    if (idx === -1) return { prev: null, next: null, index: -1, total: LESSONS.length };
    return {
      prev: idx > 0 ? LESSONS[idx - 1] : null,
      next: idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null,
      index: idx,
      total: LESSONS.length
    };
  }

  function buildAmyPromptForLesson(lesson) {
    if (!lesson) {
      return 'Bantu saya memilih pelajaran ICT scalping XAU/USD terbaik di Amy FX Academy hari ini.';
    }
    const level = getLevelById(lesson.levelId);
    const levelLabel = level ? `${level.code} (${level.title})` : `Level ${lesson.levelId}`;
    return `Saya sedang belajar Amy FX Academy Pelajaran ${lesson.number}: "${lesson.title}" (${levelLabel}). Tolong jelaskan poin kunci eksekusinya di chart XAU/USD saat ini dan kesalahan terbesar yang harus saya hindari.`;
  }

  function buildAmyKnowledgeEntries() {
    return LESSONS.map(lesson => {
      const level = getLevelById(lesson.levelId);
      const levelHeader = level ? `${level.code}: ${level.title}` : `Level ${lesson.levelId}`;
      const concepts = (lesson.conceptBlocks || [])
        .map(b => `${b.heading}: ${(b.paragraphs || []).join(' ')}`)
        .join(' | ');
      const validStr = (lesson.validRules || []).join('; ');
      const invalidStr = (lesson.invalidRules || []).join('; ');
      const scenarioStr = lesson.xauScenario
        ? `${lesson.xauScenario.context} ${(lesson.xauScenario.steps || []).join(' ')}`
        : '';
      const goldenStr = (lesson.goldenRules || []).join(' ');

      return {
        title: `Pelajaran ${String(lesson.number).padStart(2, '0')} — ${lesson.title} (${levelHeader})`,
        path: `apps/academy/index.html?lesson=${lesson.id}`,
        text: [
          lesson.summary,
          concepts,
          `Syarat Valid: ${validStr}`,
          `Invalid / Jebakan: ${invalidStr}`,
          `Contoh XAU/USD: ${scenarioStr}`,
          `Aturan Emas: ${goldenStr}`
        ].filter(Boolean).join(' ')
      };
    });
  }

  return Object.freeze({
    STORAGE_KEY,
    LEVELS,
    LESSONS,
    getLevelById,
    getLessonById,
    getLessonsByLevel,
    filterLessons,
    createEmptyProgress,
    normalizeProgress,
    setLastLesson,
    toggleLessonCompleted,
    recordQuizAttempt,
    computeProgressStats,
    getAdjacentLessons,
    buildAmyPromptForLesson,
    buildAmyKnowledgeEntries
  });
});
