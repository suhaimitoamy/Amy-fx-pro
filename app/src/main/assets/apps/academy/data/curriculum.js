/* Amy FX Academy — Curriculum Assembler & Pure Progress Logic
 * Combines Level 0–6 (36 Lessons) + pure helpers for filtering, learner track, progress, quiz scoring, and Amy Live knowledge.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const p0 = require('./level-0.js');
    const p1 = require('./levels-1-2.js');
    const p2 = require('./levels-3-4.js');
    const p3 = require('./levels-5-6.js');
    module.exports = factory(p0, p1, p2, p3);
  } else {
    root.AmyAcademyCurriculum = factory(
      root.AmyAcademyPart0,
      root.AmyAcademyPart1,
      root.AmyAcademyPart2,
      root.AmyAcademyPart3
    );
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function (part0, part1, part2, part3) {
  'use strict';

  const STORAGE_KEY = 'amy_academy_progress_v2';
  const TRACK_STORAGE_KEY = 'amy_academy_track_v1';

  const parts = [part0, part1, part2, part3].filter(Boolean);

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

  function formatLessonNumber(lesson) {
    if (!lesson) return '';
    if (lesson.code) return String(lesson.code);
    const num = Number(lesson.number);
    if (!Number.isFinite(num)) return String(lesson.number ?? '');
    if (Number.isInteger(num)) return String(num).padStart(2, '0');
    return String(num);
  }

  function normalizeTrack(raw) {
    const v = String(raw || '').trim().toLowerCase();
    if (v === 'beginner' || v === 'ict') return v;
    return null;
  }

  function getRecommendedLessonForTrack(progress, track) {
    const norm = normalizeProgress(progress);
    const completedSet = new Set(norm.completedIds);
    const mode = normalizeTrack(track) || 'beginner';

    if (norm.lastLessonId) {
      const last = getLessonById(norm.lastLessonId);
      if (last && !completedSet.has(last.id)) {
        if (mode !== 'ict' || last.levelId >= 1) return last;
      }
    }

    const pool = mode === 'ict' ? LESSONS.filter(l => l.levelId >= 1) : LESSONS;
    return pool.find(l => !completedSet.has(l.id)) || pool[0] || LESSONS[0] || null;
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
      return 'Bantu saya memilih pelajaran trading XAU/USD terbaik di Amy FX Academy hari ini.';
    }
    const level = getLevelById(lesson.levelId);
    const levelLabel = level ? `${level.code} (${level.title})` : `Level ${lesson.levelId}`;
    const numLabel = formatLessonNumber(lesson);
    return `Saya sedang belajar Amy FX Academy Bab ${numLabel}: "${lesson.title}" (${levelLabel}). Tolong jelaskan poin kunci praktiknya di XAU/USD dan kesalahan terbesar yang harus saya hindari.`;
  }

  function buildAmyKnowledgeEntries() {
    return LESSONS.map(lesson => {
      const level = getLevelById(lesson.levelId);
      const levelHeader = level ? `${level.code}: ${level.title}` : `Level ${lesson.levelId}`;
      const numLabel = formatLessonNumber(lesson);
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
        title: `Pelajaran ${numLabel} — ${lesson.title} (${levelHeader})`,
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

  function evaluateLevel0Readiness(progress) {
    const norm = normalizeProgress(progress);
    const completedSet = new Set(norm.completedIds);
    const level0Lessons = getLessonsByLevel(0);
    const total = level0Lessons.length;

    let completed = 0;
    let quizPassed = 0;
    let quizCorrectSum = 0;
    let quizTotalSum = 0;

    const items = level0Lessons.map(lesson => {
      const done = completedSet.has(lesson.id);
      if (done) completed += 1;
      const rec = norm.quizScores[lesson.id] || null;
      if (rec) {
        if (rec.passed) quizPassed += 1;
        quizCorrectSum += rec.correct;
        quizTotalSum += rec.total;
      }
      return {
        id: lesson.id,
        code: formatLessonNumber(lesson),
        title: lesson.title,
        done,
        quizPassed: Boolean(rec?.passed),
        quizScore: rec ? `${rec.correct}/${rec.total}` : null
      };
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgQuizAccuracy = quizTotalSum > 0 ? Math.round((quizCorrectSum / quizTotalSum) * 100) : null;
    const nextLesson = level0Lessons.find(l => !completedSet.has(l.id)) || null;
    const readyForIct = total > 0 && completed >= total;

    return {
      total,
      completed,
      percent,
      quizPassed,
      avgQuizAccuracy,
      readyForIct,
      nextLesson,
      items
    };
  }

  function calculateBeginnerRiskLot(input) {
    const opts = input && typeof input === 'object' ? input : {};
    const balanceUsd = Math.max(10, Number(opts.balanceUsd) || 100);
    const riskPct = Math.max(0.1, Math.min(20, Number(opts.riskPct) || 1));
    const slPoints = Math.max(0.5, Number(opts.slPoints) || 5);
    const accountType = String(opts.accountType || 'standard').toLowerCase() === 'cent' ? 'cent' : 'standard';
    const usdIdrRate = Math.max(1000, Number(opts.usdIdrRate) || 16500);

    const riskUsd = Math.round(((balanceUsd * riskPct) / 100) * 100) / 100;
    const riskIdr = Math.round(riskUsd * usdIdrRate);
    // Standard XAU/USD: 1.00 lot = $100 per $1.00 price move -> 0.01 lot = $1 per $1.00 move
    // Cent XAU/USDc: 1.00 cent lot = $1.00 per $1.00 price move -> 0.01 cent lot = $0.01 per $1.00 move
    const usdPerPointPerLot = accountType === 'cent' ? 1 : 100;
    const rawLot = riskUsd / (slPoints * usdPerPointPerLot);
    const recommendedLot = Math.max(0.01, Math.floor(rawLot * 100) / 100);
    const actualRiskUsd = Math.round(recommendedLot * slPoints * usdPerPointPerLot * 100) / 100;
    const actualRiskPct = Math.round((actualRiskUsd / balanceUsd) * 1000) / 10;
    const slPips = Math.round(slPoints * 10);

    let safetyLevel = 'safe';
    let safetyLabel = 'Aman (Disiplin Pemula ≤ 1%)';
    if (actualRiskPct > 2 || riskPct > 2) {
      safetyLevel = 'danger';
      safetyLabel = 'Terlalu Besar (> 2% · Rawan Margin Call)';
    } else if (actualRiskPct > 1.05 || riskPct > 1.05) {
      safetyLevel = 'moderate';
      safetyLabel = 'Cukup Agresif (1%–2% · Perlu Hati-hati)';
    }

    const needsCentHint = accountType === 'standard' && rawLot < 0.01;

    return {
      balanceUsd,
      riskPct,
      slPoints,
      slPips,
      accountType,
      riskUsd,
      riskIdr,
      recommendedLot,
      actualRiskUsd,
      actualRiskPct,
      safetyLevel,
      safetyLabel,
      needsCentHint
    };
  }

  return Object.freeze({
    STORAGE_KEY,
    TRACK_STORAGE_KEY,
    LEVELS,
    LESSONS,
    getLevelById,
    getLessonById,
    getLessonsByLevel,
    formatLessonNumber,
    normalizeTrack,
    getRecommendedLessonForTrack,
    filterLessons,
    createEmptyProgress,
    normalizeProgress,
    setLastLesson,
    toggleLessonCompleted,
    recordQuizAttempt,
    computeProgressStats,
    evaluateLevel0Readiness,
    calculateBeginnerRiskLot,
    getAdjacentLessons,
    buildAmyPromptForLesson,
    buildAmyKnowledgeEntries
  });
});
