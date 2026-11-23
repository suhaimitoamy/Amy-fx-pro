/* Amy FX Academy — Mastery Path Assembler & Strict Duolingo-Style Locking Engine
 * Combines all 43 sequential Mastery Modules (Modul 01–43) + Deep Enrichment Layer
 * + Pure Mastery Locking, 80% Quiz Pass Gate, 100% Placement Exam, XP & Amy Live Knowledge.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const p0 = require('./level-0.js');
    const p1 = require('./levels-1-2.js');
    const p2 = require('./levels-3-4.js');
    const p3 = require('./levels-5-6.js');
    const p4 = require('./mastery-advanced.js');
    const enrich = require('./mastery-deep-enrichment.js');
    module.exports = factory(p0, p1, p2, p3, p4, enrich);
  } else {
    root.AmyAcademyCurriculum = factory(
      root.AmyAcademyPart0,
      root.AmyAcademyPart1,
      root.AmyAcademyPart2,
      root.AmyAcademyPart3,
      root.AmyAcademyPart4,
      root.AmyAcademyEnrichment
    );
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function (part0, part1, part2, part3, part4, enrichmentMap) {
  'use strict';

  const STORAGE_KEY = 'amy_academy_progress_v2';
  const TRACK_STORAGE_KEY = 'amy_academy_track_v1';
  const PASS_THRESHOLD = 0.8; // Minimal 80% benar (mis. 3/3, 4/4, atau 4/5) untuk membuka kunci modul berikutnya
  const XP_PER_MASTERED_MODULE = 100;
  const XP_PLACEMENT_BONUS = 250;

  const STAGE_META = [
    {
      id: 0,
      code: 'Babak 01',
      title: 'Persiapan & Dasar MT5',
      tagline: 'Pahami broker, akun Cent vs Standard, spread & pips Gold, hitung lot aman, dan eksekusi order MT5 dari nol.'
    },
    {
      id: 1,
      code: 'Babak 02',
      title: 'Membaca Harga & Kerangka Waktu Gold',
      tagline: 'Cara berpikir probabilitas, anatomi body vs wick, karakter XAU/USD di jam WITA, struktur pasar, dan alur H1 → M15 → M5.'
    },
    {
      id: 2,
      code: 'Babak 03',
      title: 'Struktur Pasar & Peta Likuiditas',
      tagline: 'Bedakan BOS valid vs sweep palsu, kuasai Dealing Range (IRL ↔ ERL), peta BSL/SSL, PDH/PDL, dan Inducement (IDM).'
    },
    {
      id: 3,
      code: 'Babak 04',
      title: 'Mesin PD Array Inti (Tuntas)',
      tagline: 'Displacement, FVG + 50% CE + pilih multi-FVG, High-Probability OB vs Trap OB, CISD vs MSS, dan zona Discount/Premium OTE.'
    },
    {
      id: 4,
      code: 'Babak 05',
      title: '4 Model Entry Presisi & Filter Gagal',
      tagline: 'Empat model entry scalper XAU/USD (Model 2022, OB Sniper, IFVG, Turtle Soup) dan saringan 5 bendera merah auto-skip.'
    },
    {
      id: 5,
      code: 'Babak 06',
      title: 'Waktu WITA, Daily Bias & Draw on Liquidity',
      tagline: 'Siklus AMD & Judas Swing, Killzone WITA & Silver Bullet, News Lock, bedah tuntas Hierarki DOL, dan SOP Harian.'
    },
    {
      id: 6,
      code: 'Babak 07',
      title: 'Risiko, Manajemen Trade & Psikologi',
      tagline: 'Lot dinamis 0.5%–1%, SL struktural + napas spread, Partial Close & BEP, anti-FOMO/Revenge, dan Protokol 100 Sample.'
    },
    {
      id: 7,
      code: 'Babak 08',
      title: 'ICT Institusional Lanjutan & Mapping Mandiri',
      tagline: 'Breaker/Mitigation/Unicorn, BPR & NWOG/NDOG, SMT Gold vs Silver/DXY, MMXM, ICT Macros & Weekly Profile, Std Dev & CRT, hingga Capstone Chart Kosong.'
    }
  ];

  const parts = [part0, part1, part2, part3, part4].filter(Boolean);
  const enrich = enrichmentMap && typeof enrichmentMap === 'object' ? enrichmentMap : {};

  const rawLevels = parts
    .flatMap(p => (Array.isArray(p.LEVELS) ? p.LEVELS : []))
    .slice()
    .sort((a, b) => a.id - b.id);

  // STAGES (user-facing Babak tanpa "Level 0/1/2") + LEVELS alias for backward compatibility
  const STAGES = STAGE_META.map(meta => {
    const raw = rawLevels.find(l => l.id === meta.id);
    return Object.freeze({
      id: meta.id,
      code: meta.code,
      title: meta.title,
      tagline: meta.tagline || (raw ? raw.tagline : '')
    });
  });
  const LEVELS = STAGES;

  const rawLessons = parts
    .flatMap(p => (Array.isArray(p.LESSONS) ? p.LESSONS : []))
    .slice()
    .sort((a, b) => a.number - b.number);

  const LESSONS = rawLessons.map((lesson, idx) => {
    const ext = enrich[lesson.id] || {};
    const stepNumber = idx + 1;
    const stepCode = String(stepNumber).padStart(2, '0');

    const mergedConceptBlocks = [
      ...(Array.isArray(lesson.conceptBlocks) ? lesson.conceptBlocks : []),
      ...(Array.isArray(ext.extraConceptBlocks) ? ext.extraConceptBlocks : [])
    ];

    const mergedQuiz = [
      ...(Array.isArray(lesson.quiz) ? lesson.quiz : []),
      ...(Array.isArray(ext.extraQuiz) ? ext.extraQuiz : [])
    ];

    const mappingSteps = Array.isArray(lesson.mappingSteps) && lesson.mappingSteps.length
      ? lesson.mappingSteps
      : (Array.isArray(ext.mappingSteps) ? ext.mappingSteps : []);

    const decisionTree = Array.isArray(lesson.decisionTree) && lesson.decisionTree.length
      ? lesson.decisionTree
      : (Array.isArray(ext.decisionTree) ? ext.decisionTree : []);

    const failedCase = lesson.failedCase || ext.failedCase || null;

    return Object.freeze({
      ...lesson,
      stageId: lesson.levelId,
      stepNumber,
      stepCode,
      conceptBlocks: mergedConceptBlocks,
      mappingSteps,
      decisionTree,
      failedCase,
      quiz: mergedQuiz,
      readMinutes: Math.max(lesson.readMinutes || 5, mappingSteps.length >= 4 || decisionTree.length >= 3 ? (lesson.readMinutes || 5) + 2 : (lesson.readMinutes || 5))
    });
  });

  const levelMap = new Map(STAGES.map(lvl => [lvl.id, lvl]));
  const lessonMap = new Map(LESSONS.map(l => [l.id, l]));
  const lessonIndexMap = new Map(LESSONS.map((l, i) => [l.id, i]));

  // Tes Loncat Pra-Trading (Modul 01–06 -> langsung buka Modul 07 ICT): WAJIB 4/4 (100% benar)
  const PLACEMENT_QUIZ = Object.freeze([
    {
      question: 'Seorang pemula memiliki modal latihan $25 dan ingin merasakan uang asli tanpa risiko margin call dalam 1 kali gerak $10 di XAU/USD. Jenis akun mana yang wajib dipilih?',
      options: [
        'Akun Standard dengan leverage 1:2000 dan 0.05 lot',
        'Akun Cent (USC) agar $25 menjadi 2.500 USC dan risiko per 0.01 cent lot hanya beberapa sen',
        'Akun ECN VIP minimal 1.00 lot',
        'Akun tanpa Stop Loss di pasar kripto'
      ],
      answerIndex: 1,
      explanation: 'Akun Cent mengubah $25 menjadi 2.500 USC sehingga ukuran lot tetap proporsional dengan aturan risiko ≤ 1% per transaksi.'
    },
    {
      question: 'Pada XAU/USD, kamu memasang posisi SELL dengan Stop Loss di 2.660,00. Saat spread sedang $0,40, harga chart (garis BID) baru naik ke 2.659,65 namun posisi sudah tertutup SL. Mengapa hal ini terjadi?',
      options: [
        'Chart MT5 rusak permanen',
        'Posisi SELL selalu ditutup oleh garis ASK (Bid + Spread = 2.659,65 + 0,40 = 2.660,05), yang sudah melewati SL 2.660,00',
        'Karena 1 pips Gold sama dengan $10',
        'Karena SL hanya berlaku untuk posisi BUY'
      ],
      answerIndex: 1,
      explanation: 'Posisi BUY ditutup oleh BID, sedangkan posisi SELL ditutup oleh ASK. Itulah sebabnya SL Sell wajib diberi napas spread.'
    },
    {
      question: 'Modal Akun Standard = $1.000, batas risiko disiplin = 1% ($10), dan jarak Stop Loss struktural XAU/USD = $5,00 (50 pips). Berapa ukuran lot yang tepat?',
      options: [
        '0.20 lot',
        '0.10 lot',
        '0.02 lot (karena $10 ÷ ($5 × 100) = 0.02 lot)',
        '1.00 lot'
      ],
      answerIndex: 2,
      explanation: 'Di Standard Gold, 0.01 lot = $1 per gerak $1. Untuk jarak SL $5: 0.02 lot × $5 × 100 = tepat $10 (1% modal).'
    },
    {
      question: 'Harga XAU/USD sekarang di 2.658,00. Kamu ingin menunggu harga turun dulu ke area diskon 2.648,00 baru otomatis membuka posisi BUY. Jenis pending order MT5 apa yang dipilih?',
      options: [
        'Buy Stop',
        'Buy Limit',
        'Sell Limit',
        'Sell Stop'
      ],
      answerIndex: 1,
      explanation: 'Buy Limit dipasang di bawah harga saat ini untuk menangkap pantulan naik di harga lebih murah (diskon).'
    }
  ]);

  function getLevelById(levelId) {
    return levelMap.get(Number(levelId)) || null;
  }

  function getStageById(stageId) {
    return getLevelById(stageId);
  }

  function getLessonById(lessonId) {
    if (!lessonId) return null;
    return lessonMap.get(String(lessonId).trim()) || null;
  }

  function getLessonsByLevel(levelId) {
    const id = Number(levelId);
    return LESSONS.filter(l => l.levelId === id);
  }

  function getLessonsByStage(stageId) {
    return getLessonsByLevel(stageId);
  }

  function formatStepNumber(lesson) {
    if (!lesson) return '';
    return lesson.stepCode || String(lesson.stepNumber ?? '').padStart(2, '0');
  }

  function formatLessonNumber(lesson) {
    if (!lesson) return '';
    if (lesson.stepCode) return lesson.stepCode;
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

  function requiredCorrectCount(totalQuestions) {
    const total = Math.max(1, Number(totalQuestions) || 3);
    return Math.ceil(total * PASS_THRESHOLD);
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
      placementPassed: false,
      xp: 0,
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
        const lesson = lessonMap.get(id);
        const total = Math.max(1, Number(rec.total) || (lesson ? lesson.quiz.length : 3));
        const correct = Math.max(0, Math.min(total, Number(rec.correct) || 0));
        const passed = Boolean(rec.passed ?? (correct >= requiredCorrectCount(total)));
        base.quizScores[id] = {
          correct,
          total,
          passed,
          lastCorrect: Number.isFinite(Number(rec.lastCorrect)) ? Number(rec.lastCorrect) : correct,
          updatedAt: rec.updatedAt || null
        };
      }
    }

    base.placementPassed = Boolean(raw.placementPassed);
    const computedXp = base.completedIds.length * XP_PER_MASTERED_MODULE + (base.placementPassed ? XP_PLACEMENT_BONUS : 0);
    base.xp = Math.max(computedXp, Number(raw.xp) || 0);

    if (raw.lastLessonId && lessonMap.has(String(raw.lastLessonId))) {
      base.lastLessonId = String(raw.lastLessonId);
    }

    if (raw.updatedAt && typeof raw.updatedAt === 'string') {
      base.updatedAt = raw.updatedAt;
    }

    return base;
  }

  // ── STRICT DUOLINGO-STYLE MASTERY LOCKING ENGINE ─────────────────────────
  function isLessonMastered(progress, lessonId) {
    const norm = normalizeProgress(progress);
    const id = String(lessonId || '').trim();
    return norm.completedIds.includes(id);
  }

  function getFrontierIndex(progress) {
    const norm = normalizeProgress(progress);
    const doneSet = new Set(norm.completedIds);
    for (let i = 0; i < LESSONS.length; i += 1) {
      if (!doneSet.has(LESSONS[i].id)) return i;
    }
    return Math.max(0, LESSONS.length - 1);
  }

  function getFrontierLesson(progress) {
    return LESSONS[getFrontierIndex(progress)] || LESSONS[0] || null;
  }

  function getModuleLockState(progress, lessonId) {
    const idx = lessonIndexMap.get(String(lessonId || '').trim());
    if (idx === undefined) return 'locked';
    const norm = normalizeProgress(progress);
    if (norm.completedIds.includes(LESSONS[idx].id)) return 'mastered';
    const frontierIdx = getFrontierIndex(norm);
    if (idx === frontierIdx) return 'unlocked';
    // Also allow if immediate predecessor is already mastered (e.g. non-linear legacy migration)
    if (idx === 0 || norm.completedIds.includes(LESSONS[idx - 1].id)) return 'unlocked';
    return 'locked';
  }

  function canOpenLesson(progress, lessonId) {
    const lockState = getModuleLockState(progress, lessonId);
    return lockState === 'mastered' || lockState === 'unlocked';
  }

  function getUnlockRequirement(progress, lessonId) {
    const target = getLessonById(lessonId);
    if (!target) {
      return { allowed: false, state: 'locked', targetLesson: null, blockedByLesson: null, requiredPercent: Math.round(PASS_THRESHOLD * 100) };
    }
    const state = getModuleLockState(progress, target.id);
    if (state !== 'locked') {
      return { allowed: true, state, targetLesson: target, blockedByLesson: null, requiredPercent: Math.round(PASS_THRESHOLD * 100) };
    }
    const frontier = getFrontierLesson(progress);
    return {
      allowed: false,
      state: 'locked',
      targetLesson: target,
      blockedByLesson: frontier,
      requiredPercent: Math.round(PASS_THRESHOLD * 100)
    };
  }

  function evaluatePlacementAttempt(progress, answersMap) {
    const norm = normalizeProgress(progress);
    const ans = answersMap && typeof answersMap === 'object' ? answersMap : {};
    const total = PLACEMENT_QUIZ.length;
    let correct = 0;
    const results = PLACEMENT_QUIZ.map((q, idx) => {
      const selected = ans[idx];
      const ok = selected === q.answerIndex;
      if (ok) correct += 1;
      return { index: idx, selected, correct: ok, answerIndex: q.answerIndex, explanation: q.explanation };
    });

    const passed = correct === total; // Wajib 100% (4/4) agar benar-benar terbukti paham dasar MT5
    if (!passed) {
      return { passed: false, correct, total, results, nextProgress: norm };
    }

    const now = new Date().toISOString();
    const prepLessons = getLessonsByStage(0);
    for (const l of prepLessons) {
      if (!norm.completedIds.includes(l.id)) {
        norm.completedIds.push(l.id);
      }
      if (!norm.quizScores[l.id]) {
        norm.quizScores[l.id] = {
          correct: l.quiz.length,
          total: l.quiz.length,
          passed: true,
          lastCorrect: l.quiz.length,
          updatedAt: now
        };
      }
    }
    norm.placementPassed = true;
    const firstIct = LESSONS.find(l => l.levelId === 1) || LESSONS[6] || LESSONS[0];
    if (firstIct) norm.lastLessonId = firstIct.id;
    norm.xp = norm.completedIds.length * XP_PER_MASTERED_MODULE + XP_PLACEMENT_BONUS;
    norm.updatedAt = now;

    return { passed: true, correct, total, results, unlockedLesson: firstIct, nextProgress: norm };
  }

  function getRecommendedLessonForTrack(progress, track) {
    const norm = normalizeProgress(progress);
    const frontier = getFrontierLesson(norm);
    // Respect strict locking: never recommend a locked lesson!
    if (norm.lastLessonId && canOpenLesson(norm, norm.lastLessonId) && !isLessonMastered(norm, norm.lastLessonId)) {
      return getLessonById(norm.lastLessonId);
    }
    // Keep track param accepted for backward compatibility
    void normalizeTrack(track);
    return frontier || LESSONS[0] || null;
  }

  function setLastLesson(progress, lessonId) {
    const next = normalizeProgress(progress);
    if (!lessonMap.has(lessonId)) return next;
    if (!canOpenLesson(next, lessonId)) return next;
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
    next.xp = next.completedIds.length * XP_PER_MASTERED_MODULE + (next.placementPassed ? XP_PLACEMENT_BONUS : 0);
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
    const minNeeded = requiredCorrectCount(total);
    const passed = correct >= minNeeded;
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
    next.xp = next.completedIds.length * XP_PER_MASTERED_MODULE + (next.placementPassed ? XP_PLACEMENT_BONUS : 0);
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
      const stage = getStageById(lesson.levelId);
      const haystack = normalizeText([
        lesson.stepCode,
        lesson.title,
        lesson.summary,
        lesson.id,
        lesson.diagramId,
        stage ? `${stage.code} ${stage.title}` : '',
        ...(lesson.conceptBlocks || []).map(b => `${b.heading} ${(b.paragraphs || []).join(' ')}`),
        ...(lesson.mappingSteps || []),
        ...(lesson.decisionTree || []).map(d => `${d.condition} ${d.action}`),
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

    const byStage = STAGES.map(stage => {
      const items = getLessonsByStage(stage.id);
      const done = items.filter(l => completedSet.has(l.id)).length;
      const total = items.length;
      return {
        stageId: stage.id,
        levelId: stage.id,
        code: stage.code,
        title: stage.title,
        total,
        completed: done,
        percent: total > 0 ? Math.round((done / total) * 100) : 0
      };
    });

    const frontierLesson = getFrontierLesson(norm);
    const lastLesson = norm.lastLessonId ? getLessonById(norm.lastLessonId) : null;
    const nextRecommendedLesson = frontierLesson || LESSONS[0] || null;
    const allMastered = completedCount >= totalLessons && totalLessons > 0;

    return {
      totalLessons,
      completedCount,
      masteredCount: completedCount,
      percent,
      xp: norm.xp,
      placementPassed: norm.placementPassed,
      allMastered,
      quizPassedCount,
      totalQuizQuestions,
      totalQuizCorrect,
      byStage,
      byLevel: byStage,
      lastLesson,
      frontierLesson,
      frontierStep: frontierLesson ? frontierLesson.stepNumber : totalLessons,
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
      return 'Bantu saya memahami jalur mastery ICT XAU/USD di Amy FX Academy hari ini.';
    }
    const stage = getStageById(lesson.levelId);
    const stageLabel = stage ? `${stage.code} (${stage.title})` : '';
    const numLabel = formatStepNumber(lesson);
    return `Saya sedang mempelajari Amy FX Academy Modul ${numLabel}: "${lesson.title}" (${stageLabel}). Tolong bantu jelaskan cara mapping langkah demi langkah di chart XAU/USD dan kesalahan paling sering terjadi pada materi ini.`;
  }

  function buildAmyKnowledgeEntries() {
    return LESSONS.map(lesson => {
      const stage = getStageById(lesson.levelId);
      const stageHeader = stage ? `${stage.code}: ${stage.title}` : '';
      const numLabel = formatStepNumber(lesson);
      const concepts = (lesson.conceptBlocks || [])
        .map(b => `${b.heading}: ${(b.paragraphs || []).join(' ')}`)
        .join(' | ');
      const mapStr = (lesson.mappingSteps || []).join(' ');
      const decStr = (lesson.decisionTree || []).map(d => `Jika ${d.condition} -> ${d.action}`).join(' ');
      const validStr = (lesson.validRules || []).join('; ');
      const invalidStr = (lesson.invalidRules || []).join('; ');
      const scenarioStr = lesson.xauScenario
        ? `${lesson.xauScenario.context} ${(lesson.xauScenario.steps || []).join(' ')}`
        : '';
      const failStr = lesson.failedCase
        ? `Kasus Gagal: ${lesson.failedCase.context} ${lesson.failedCase.whyFailed}`
        : '';
      const goldenStr = (lesson.goldenRules || []).join(' ');

      return {
        title: `Modul ${numLabel} — ${lesson.title} (${stageHeader})`,
        path: `apps/academy/index.html?lesson=${lesson.id}`,
        text: [
          lesson.summary,
          concepts,
          mapStr ? `Cara Mapping: ${mapStr}` : '',
          decStr ? `Pohon Keputusan: ${decStr}` : '',
          `Syarat Valid: ${validStr}`,
          `Invalid / Jebakan: ${invalidStr}`,
          `Contoh XAU/USD: ${scenarioStr}`,
          failStr,
          `Aturan Emas: ${goldenStr}`
        ].filter(Boolean).join(' ')
      };
    });
  }

  function evaluateLevel0Readiness(progress) {
    const norm = normalizeProgress(progress);
    const completedSet = new Set(norm.completedIds);
    const prepLessons = getLessonsByStage(0);
    const total = prepLessons.length;

    let completed = 0;
    let quizPassed = 0;
    let quizCorrectSum = 0;
    let quizTotalSum = 0;

    const items = prepLessons.map(lesson => {
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
        code: formatStepNumber(lesson),
        title: lesson.title,
        done,
        quizPassed: Boolean(rec?.passed),
        quizScore: rec ? `${rec.correct}/${rec.total}` : null
      };
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgQuizAccuracy = quizTotalSum > 0 ? Math.round((quizCorrectSum / quizTotalSum) * 100) : null;
    const nextLesson = prepLessons.find(l => !completedSet.has(l.id)) || null;
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
    PASS_THRESHOLD,
    XP_PER_MASTERED_MODULE,
    XP_PLACEMENT_BONUS,
    PLACEMENT_QUIZ,
    STAGES,
    LEVELS,
    LESSONS,
    getStageById,
    getLevelById,
    getLessonById,
    getLessonsByStage,
    getLessonsByLevel,
    formatStepNumber,
    formatLessonNumber,
    normalizeTrack,
    requiredCorrectCount,
    isLessonMastered,
    getFrontierIndex,
    getFrontierLesson,
    getModuleLockState,
    canOpenLesson,
    getUnlockRequirement,
    evaluatePlacementAttempt,
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
