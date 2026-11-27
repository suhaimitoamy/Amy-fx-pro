/* Amy FX Academy — 36-Chapter Interactive Trading Book & Strict Mastery Locking Engine
 * Single-Flow Textbook Architecture (Bagian I–VI · Bab 01–36 · Zero Duplication)
 * + Duolingo-Style 80% Uji Paham Gate + 100% Placement Exam + Legacy Deep-Link Aliases
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
  const PASS_THRESHOLD = 0.8; // Minimal 80% benar (mis. 4/4 atau 4/5) untuk membuka bab berikutnya
  const XP_PER_MASTERED_MODULE = 100;
  const XP_PLACEMENT_BONUS = 250;

  // 6 Bagian Buku (tanpa label "Level 0/1/2")
  const STAGE_META = [
    {
      id: 0,
      code: 'Bagian I',
      title: 'Fondasi Pemula & Cara Kerja Pasar Gold',
      tagline: 'Mulai dari nol sampai siap buka chart: cara kerja trading Gold, pips, bid/ask, spread, rumus lot 1%, panduan MT5, candlestick, hingga ritme sesi pasar dunia.'
    },
    {
      id: 1,
      code: 'Bagian II',
      title: 'Struktur Pasar & Peta Liquidity',
      tagline: 'Membaca struktur harga murni tanpa indikator, menyatukan H4/H1/M15/M5, membedakan BOS valid vs sweep palsu, Dealing Range, peta BSL/SSL, hingga Liquidity Sweep vs Liquidity Run.'
    },
    {
      id: 2,
      code: 'Bagian III',
      title: 'Kompas Arah: Draw on Liquidity, Bias & Waktu',
      tagline: 'Pahami dulu ke mana harga menuju (DOL & Daily Bias) dan kapan algoritma bergerak (AMD, Killzone, Silver Bullet, Macro 20 menit, News Lock) sebelum mencari entry.'
    },
    {
      id: 3,
      code: 'Bagian IV',
      title: 'Mesin Zona Entry ICT (PD Arrays)',
      tagline: 'Bedah tuntas satu per satu tanpa tumpang tindih: Displacement, FVG + 50% CE, iFVG, Order Block, Breaker/Mitigation/Unicorn, CISD vs MSS, hingga Premium/Discount OTE.'
    },
    {
      id: 4,
      code: 'Bagian V',
      title: 'Model Eksekusi, Filter Gagal & Manajemen Trade',
      tagline: 'Merakit ICT 2022 Model, variasi iFVG/Unicorn/Turtle Soup, filter 5 bendera merah, SL struktural + target DOL, Partial/BEP, hingga psikologi & 100 sample jurnal.'
    },
    {
      id: 5,
      code: 'Bagian VI',
      title: 'ICT Institusional Lanjutan & Mapping Mandiri',
      tagline: 'Murni materi lanjutan tanpa mengulang dasar: BPR & NWOG/NDOG, SMT Gold vs Silver/DXY, MMXM, Weekly Profile & IPDA 20/40/60, Std Dev & CRT, hingga Capstone chart kosong.'
    }
  ];

  // Urutan resmi 36 Bab Buku (Zero Duplication · Dependency-Ordered)
  const BOOK_CHAPTER_SPEC = [
    // Bagian I (Bab 01–06)
    { id: 'kenal-trading-broker-akun', stageId: 0 },
    { id: 'bid-ask-spread-pips-gold', stageId: 0 },
    { id: 'lot-leverage-margin-equity', stageId: 0 },
    { id: 'panduan-mt5-lima-jenis-order', stageId: 0 },
    { id: 'membaca-chart-candlestick-nol', stageId: 0 },
    { id: 'karakter-xauusd-spread-wita', stageId: 0 },

    // Bagian II (Bab 07–12)
    { id: 'struktur-pasar-dasar', stageId: 1, titleOverride: 'Struktur Pasar Murni: Swing High/Low, Tren Naik, Tren Turun & Konsolidasi' },
    { id: 'multi-timeframe-h1-m15-m5', stageId: 1, titleOverride: 'Multi-Timeframe (Top-Down): Menyatukan H4/H1, M15, dan M5 Tanpa Bingung' },
    { id: 'bos-valid-vs-sweep-palsu', stageId: 1, titleOverride: 'Break of Structure (BOS) Valid vs Liquidity Sweep (Breakout Palsu)' },
    { id: 'internal-external-dealing-range', stageId: 1, titleOverride: 'Dealing Range: Membaca Arena Eksternal (ERL) vs Internal (IRL)' },
    { id: 'bsl-dan-ssl-liquidity', stageId: 1, titleOverride: 'Peta Liquidity Gold: BSL/SSL, EQH/EQL, PDH/PDL, PWH/PWL & Asia Range' },
    { id: 'inducement-idm-umpan-ritel', stageId: 1, titleOverride: 'Liquidity Sweep vs Liquidity Run: Stop Hunt, Purge & Revert vs Ekspansi' },

    // Bagian III (Bab 13–17)
    { id: 'level-likuiditas-kunci-xauusd', stageId: 2, titleOverride: 'Draw on Liquidity (DOL) Tuntas: Cara Menemukan Magnet Harga Langkah demi Langkah' },
    { id: 'daily-bias-draw-on-liquidity', stageId: 2, titleOverride: 'Menentukan Daily Bias & Membaca Arah Candle Harian (Next-Day Expansion)' },
    { id: 'siklus-amd-judas-swing', stageId: 2, titleOverride: 'Siklus Harian ICT: Power of Three (AMD), NY Midnight Open & Judas Swing' },
    { id: 'jadwal-killzone-wita-silver-bullet', stageId: 2, titleOverride: 'Waktu Institusional: Killzone, Silver Bullet & Macro 20 Menit (Panduan WITA)' },
    { id: 'protokol-news-lock-usd', stageId: 2, titleOverride: 'Berita Ekonomi USD (CPI, NFP, FOMC) & Protokol News Lock' },

    // Bagian IV (Bab 18–24)
    { id: 'displacement-jejak-institusi', stageId: 3, titleOverride: 'Displacement: Mengenali Jejak Dorongan Institusi yang Sah' },
    { id: 'fvg-bisi-sibi-ce-50', stageId: 3, titleOverride: 'Fair Value Gap (BISI/SIBI), 50% Consequent Encroachment & Memilih Multi-FVG' },
    { id: 'model-ifvg-inversion', stageId: 3, titleOverride: 'Inversion Fair Value Gap (iFVG): Saat FVG Gagal Berubah Jadi Peluang' },
    { id: 'order-block-valid-mean-threshold', stageId: 3, titleOverride: 'Order Block (OB) Bermutu Tinggi vs Trap OB & 50% Mean Threshold' },
    { id: 'breaker-mitigation-unicorn', stageId: 3, titleOverride: 'Breaker Block (BB), Mitigation Block & ICT Unicorn Model' },
    { id: 'cisd-vs-mss-sinyal-awal', stageId: 3, titleOverride: 'CISD vs Market Structure Shift (MSS): Sinyal Balik Arah Paling Presisi' },
    { id: 'premium-discount-equilibrium', stageId: 3, titleOverride: 'Premium, Discount, Equilibrium (50%), OTE (62%–79%) & Hierarki PD Array' },

    // Bagian V (Bab 25–30)
    { id: 'model-sweep-mss-fvg', stageId: 4, titleOverride: 'Model Entry Utama (ICT 2022): Merakit Sweep → MSS/CISD → FVG/OB dari Nol' },
    { id: 'model-turtle-soup-smr', stageId: 4, titleOverride: 'Model Entry Alternatif: iFVG Entry, Unicorn Setup & Turtle Soup (SMR)' },
    { id: 'memilih-1-model-dan-filter-gagal', stageId: 4, titleOverride: 'Filter Setup Gagal (5 Bendera Merah Auto-Skip) & Memilih 1 Model Fokus' },
    { id: 'sl-struktural-napas-spread-tp', stageId: 4, titleOverride: 'Stop Loss Struktural, Napas Spread & Target Liquidity Bertingkat (TP1/TP2)' },
    { id: 'manajemen-trade-partial-bep-notrade', stageId: 4, titleOverride: 'Manajemen Posisi Aktif: Partial Close, Breakeven (BEP) & Batas Berhenti Harian' },
    { id: 'protokol-100-sample-mandiri', stageId: 4, titleOverride: 'Psikologi Eksekusi (Anti-FOMO/Revenge) & Protokol Jurnal 100 Sample' },

    // Bagian VI (Bab 31–36)
    { id: 'bpr-nwog-ndog-imbalance', stageId: 5, titleOverride: 'Balanced Price Range (BPR), Volume Imbalance & Gap Pembukaan (NWOG / NDOG)' },
    { id: 'smt-divergence-gold', stageId: 5, titleOverride: 'SMT Divergence: Membaca Jejak Manipulasi Gold vs Silver (XAG) & DXY' },
    { id: 'mmxm-market-maker-model', stageId: 5, titleOverride: 'Market Maker Buy & Sell Model (MMXM): Peta Besar Perjalanan Harga' },
    { id: 'ict-macros-weekly-ipda', stageId: 5, titleOverride: 'Weekly Profile (Classic Expansion, Midweek Reversal, TGIF) & IPDA 20/40/60' },
    { id: 'stdev-crt-profiling', stageId: 5, titleOverride: 'Standard Deviation Projections (-1 / -2 / -2,5 / -4) & Candle Range Theory (CRT)' },
    { id: 'capstone-mapping-mandiri', stageId: 5, titleOverride: 'Ujian Praktik Akhir (Capstone): Protokol Mapping Mandiri dari Chart Kosong' }
  ];

  // Alias ID lama agar seluruh tautan dari Latihan 100 Kasus, bookmark, & URL lama tetap 100% hidup
  const LEGACY_ID_ALIASES = Object.freeze({
    'logika-trading-probabilitas': 'kenal-trading-broker-akun',
    'membaca-candlestick-body-wick': 'membaca-chart-candlestick-nol',
    'dasar-tren-sr-rencana-14-hari': 'struktur-pasar-dasar',
    'sizing-lot-xauusd-risiko': 'lot-leverage-margin-equity',
    'model-order-block-sniper': 'order-block-valid-mean-threshold',
    'sop-playbook-harian-xauusd': 'capstone-mapping-mandiri',
    'psikologi-scalper-anti-fomo': 'protokol-100-sample-mandiri',
    'draw-on-liquidity-tuntas': 'level-likuiditas-kunci-xauusd'
  });

  const parts = [part0, part1, part2, part3, part4].filter(Boolean);
  const enrich = enrichmentMap && typeof enrichmentMap === 'object' ? enrichmentMap : {};

  // Indeks semua modul mentah; part0 diutamakan bila ID sama (mis. karakter-xauusd-spread-wita yang dipindah ke Bagian I)
  const rawLessonMap = new Map();
  for (const p of parts) {
    const arr = Array.isArray(p.LESSONS) ? p.LESSONS : [];
    for (const item of arr) {
      if (item && item.id && !rawLessonMap.has(item.id)) {
        rawLessonMap.set(item.id, item);
      }
    }
  }

  const STAGES = STAGE_META.map(meta => Object.freeze({
    id: meta.id,
    code: meta.code,
    title: meta.title,
    tagline: meta.tagline
  }));
  const LEVELS = STAGES;

  const LESSONS = BOOK_CHAPTER_SPEC.map((spec, idx) => {
    const lesson = rawLessonMap.get(spec.id);
    if (!lesson) return null;

    const ext = enrich[lesson.id] || {};
    const stepNumber = idx + 1;
    const stepCode = String(stepNumber).padStart(2, '0');
    const isBook = Boolean(lesson.bookFormat && Array.isArray(lesson.bookSections) && lesson.bookSections.length > 0);

    const mergedConceptBlocks = isBook
      ? (Array.isArray(lesson.conceptBlocks) ? lesson.conceptBlocks : [])
      : [
          ...(Array.isArray(lesson.conceptBlocks) ? lesson.conceptBlocks : []),
          ...(Array.isArray(ext.extraConceptBlocks) ? ext.extraConceptBlocks : [])
        ];

    const mergedQuiz = isBook
      ? (Array.isArray(lesson.quiz) ? lesson.quiz : [])
      : [
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
      title: isBook ? lesson.title : (spec.titleOverride || lesson.title),
      levelId: spec.stageId,
      stageId: spec.stageId,
      number: stepNumber,
      code: stepCode,
      stepNumber,
      stepCode,
      bookFormat: isBook,
      bookSections: isBook ? lesson.bookSections : [],
      keyTakeaways: Array.isArray(lesson.keyTakeaways) ? lesson.keyTakeaways : [],
      bridgeNext: lesson.bridgeNext || '',
      conceptBlocks: mergedConceptBlocks,
      mappingSteps,
      decisionTree,
      failedCase,
      quiz: mergedQuiz,
      readMinutes: isBook
        ? (lesson.readMinutes || 9)
        : Math.max(lesson.readMinutes || 5, mappingSteps.length >= 4 || decisionTree.length >= 3 ? (lesson.readMinutes || 5) + 2 : (lesson.readMinutes || 5))
    });
  }).filter(Boolean);

  const levelMap = new Map(STAGES.map(lvl => [lvl.id, lvl]));
  const lessonMap = new Map(LESSONS.map(l => [l.id, l]));
  const lessonIndexMap = new Map(LESSONS.map((l, i) => [l.id, i]));

  function resolveLessonId(rawId) {
    const key = String(rawId || '').trim();
    if (!key) return '';
    if (lessonMap.has(key)) return key;
    if (LEGACY_ID_ALIASES[key] && lessonMap.has(LEGACY_ID_ALIASES[key])) {
      return LEGACY_ID_ALIASES[key];
    }
    return key;
  }

  // Tes Loncat Bagian I (Bab 01–06 → langsung buka Bab 07 Bagian II): WAJIB 4/4 (100% benar)
  const PLACEMENT_QUIZ = Object.freeze([
    {
      question: 'Seorang pemula memiliki modal latihan $25 dan ingin merasakan psikologi uang asli tanpa cepat habis oleh satu gerakan $10 di XAU/USD. Jenis akun mana yang wajib dipilih?',
      options: [
        'Akun Standard dengan leverage 1:2000 dan 0.05 lot',
        'Akun Cent (USC) agar $25 tampil sebagai 2.500 USC dan risiko per 0.01 cent lot hanya beberapa sen',
        'Akun ECN VIP minimal 1.00 lot',
        'Menitipkan modal pada pihak lain dengan janji profit tetap harian'
      ],
      answerIndex: 1,
      explanation: 'Akun Cent mengubah $25 menjadi 2.500 USC sehingga ukuran lot tetap proporsional dengan aturan risiko ≤ 1% per transaksi.'
    },
    {
      question: 'Pada XAU/USD, kamu memasang posisi SELL dengan Stop Loss di 2.660,00. Saat spread sedang $0,40 (4 pips), harga chart (garis BID) baru naik ke 2.659,65 namun posisi sudah tertutup SL. Mengapa hal ini terjadi?',
      options: [
        'Chart MT5 rusak permanen',
        'Posisi SELL selalu ditutup oleh garis ASK (Bid + Spread = 2.659,65 + 0,40 = 2.660,05), yang sudah melewati SL 2.660,00',
        'Karena 1 pip Gold sama dengan $10',
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
      question: 'Harga XAU/USD sekarang di 2.658,00. Kamu ingin menunggu harga turun dulu ke area Discount 2.648,00 baru otomatis membuka posisi BUY. Jenis pending order MT5 apa yang dipilih?',
      options: [
        'Buy Stop',
        'Buy Limit',
        'Sell Limit',
        'Sell Stop'
      ],
      answerIndex: 1,
      explanation: 'Buy Limit dipasang di bawah harga saat ini untuk menangkap pantulan naik di harga lebih murah (Discount).'
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
    const resolved = resolveLessonId(lessonId);
    return lessonMap.get(resolved) || null;
  }

  function getLessonsByLevel(levelId) {
    const id = Number(levelId);
    return LESSONS.filter(l => l.stageId === id);
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

  const FREE_READ_HASH_DIGEST = 'cf28ddcc497315e0';

  function hashFreeReadPasscode(input) {
    const s = 'amyfx-academy-owner-v2::' + String(input ?? '').trim();
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b1;
    for (let i = 0; i < s.length; i += 1) {
      const ch = s.charCodeAt(i);
      h1 ^= ch;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ (ch + i * 31), 0x85ebca6b) >>> 0;
      h2 ^= h2 >>> 13;
    }
    h1 ^= h1 >>> 16;
    h1 = Math.imul(h1, 0x85ebca6b) >>> 0;
    h1 ^= h1 >>> 13;
    h2 = Math.imul(h2, 0xc2b2ae35) >>> 0;
    h2 ^= h2 >>> 16;
    return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  }

  function verifyFreeReadPasscode(code) {
    if (typeof code !== 'string' && typeof code !== 'number') return false;
    const trimmed = String(code).trim();
    if (!trimmed) return false;
    return hashFreeReadPasscode(trimmed) === FREE_READ_HASH_DIGEST;
  }

  function createEmptyProgress() {
    return {
      completedIds: [],
      quizScores: {},
      placementPassed: false,
      freeReadUnlocked: false,
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
        const key = resolveLessonId(id);
        if (lessonMap.has(key) && !seen.has(key)) {
          seen.add(key);
          base.completedIds.push(key);
        }
      }
    }

    if (raw.quizScores && typeof raw.quizScores === 'object') {
      for (const [rawKey, rec] of Object.entries(raw.quizScores)) {
        const id = resolveLessonId(rawKey);
        if (!lessonMap.has(id) || !rec || typeof rec !== 'object') continue;
        const lesson = lessonMap.get(id);
        const total = Math.max(1, Number(rec.total) || (lesson ? lesson.quiz.length : 4));
        const correct = Math.max(0, Math.min(total, Number(rec.correct) || 0));
        const passed = Boolean(rec.passed ?? (correct >= requiredCorrectCount(total)));
        const existing = base.quizScores[id];
        if (!existing || correct >= existing.correct) {
          base.quizScores[id] = {
            correct,
            total,
            passed: existing ? (existing.passed || passed) : passed,
            lastCorrect: Number.isFinite(Number(rec.lastCorrect)) ? Number(rec.lastCorrect) : correct,
            updatedAt: rec.updatedAt || null
          };
        }
      }
    }

    base.placementPassed = Boolean(raw.placementPassed);
    base.freeReadUnlocked = Boolean(raw.freeReadUnlocked);
    const computedXp = base.completedIds.length * XP_PER_MASTERED_MODULE + (base.placementPassed ? XP_PLACEMENT_BONUS : 0);
    base.xp = Math.max(computedXp, Number(raw.xp) || 0);

    if (raw.lastLessonId) {
      const resolvedLast = resolveLessonId(raw.lastLessonId);
      if (lessonMap.has(resolvedLast)) base.lastLessonId = resolvedLast;
    }

    if (raw.updatedAt && typeof raw.updatedAt === 'string') {
      base.updatedAt = raw.updatedAt;
    }

    return base;
  }

  // ── STRICT DUOLINGO-STYLE MASTERY LOCKING ENGINE ─────────────────────────
  function isLessonMastered(progress, lessonId) {
    const norm = normalizeProgress(progress);
    const id = resolveLessonId(lessonId);
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
    const id = resolveLessonId(lessonId);
    const idx = lessonIndexMap.get(id);
    if (idx === undefined) return 'locked';
    const norm = normalizeProgress(progress);
    if (norm.completedIds.includes(LESSONS[idx].id)) return 'mastered';
    if (norm.freeReadUnlocked) return 'unlocked';
    const frontierIdx = getFrontierIndex(norm);
    if (idx === frontierIdx) return 'unlocked';
    if (idx === 0 || norm.completedIds.includes(LESSONS[idx - 1].id)) return 'unlocked';
    return 'locked';
  }

  function unlockFreeReadWithCode(progress, code) {
    const norm = normalizeProgress(progress);
    if (!verifyFreeReadPasscode(code)) {
      return { ok: false, progress: norm };
    }
    norm.freeReadUnlocked = true;
    norm.updatedAt = new Date().toISOString();
    return { ok: true, progress: norm };
  }

  function disableFreeReadMode(progress) {
    const norm = normalizeProgress(progress);
    norm.freeReadUnlocked = false;
    norm.updatedAt = new Date().toISOString();
    return norm;
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

    const passed = correct === total; // Wajib 100% (4/4) agar terbukti paham fondasi Bagian I
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
    const firstIct = LESSONS.find(l => l.stageId === 1) || LESSONS[6] || LESSONS[0];
    if (firstIct) norm.lastLessonId = firstIct.id;
    norm.xp = norm.completedIds.length * XP_PER_MASTERED_MODULE + XP_PLACEMENT_BONUS;
    norm.updatedAt = now;

    return { passed: true, correct, total, results, unlockedLesson: firstIct, nextProgress: norm };
  }

  function getRecommendedLessonForTrack(progress, track) {
    const norm = normalizeProgress(progress);
    const frontier = getFrontierLesson(norm);
    if (norm.lastLessonId && canOpenLesson(norm, norm.lastLessonId) && !isLessonMastered(norm, norm.lastLessonId)) {
      return getLessonById(norm.lastLessonId);
    }
    void normalizeTrack(track);
    return frontier || LESSONS[0] || null;
  }

  function setLastLesson(progress, lessonId) {
    const next = normalizeProgress(progress);
    const id = resolveLessonId(lessonId);
    if (!lessonMap.has(id)) return next;
    if (!canOpenLesson(next, id)) return next;
    next.lastLessonId = id;
    next.updatedAt = new Date().toISOString();
    return next;
  }

  function toggleLessonCompleted(progress, lessonId, forceState) {
    const next = normalizeProgress(progress);
    const id = resolveLessonId(lessonId);
    if (!lessonMap.has(id)) return next;
    const exists = next.completedIds.includes(id);
    const shouldComplete = typeof forceState === 'boolean' ? forceState : !exists;

    if (shouldComplete && !exists) {
      next.completedIds.push(id);
    } else if (!shouldComplete && exists) {
      next.completedIds = next.completedIds.filter(item => item !== id);
    }
    next.xp = next.completedIds.length * XP_PER_MASTERED_MODULE + (next.placementPassed ? XP_PLACEMENT_BONUS : 0);
    next.lastLessonId = id;
    next.updatedAt = new Date().toISOString();
    return next;
  }

  function recordQuizAttempt(progress, lessonId, correctCount, totalQuestions) {
    const next = normalizeProgress(progress);
    const id = resolveLessonId(lessonId);
    const lesson = lessonMap.get(id);
    if (!lesson) return next;

    const total = Math.max(1, Number(totalQuestions) || lesson.quiz.length || 4);
    const correct = Math.max(0, Math.min(total, Number(correctCount) || 0));
    const minNeeded = requiredCorrectCount(total);
    const passed = correct >= minNeeded;
    const now = new Date().toISOString();

    const prev = next.quizScores[id];
    const bestCorrect = prev ? Math.max(prev.correct, correct) : correct;
    const bestPassed = prev ? (prev.passed || passed) : passed;

    next.quizScores[id] = {
      correct: bestCorrect,
      total,
      passed: bestPassed,
      lastCorrect: correct,
      updatedAt: now
    };

    if (passed && !next.completedIds.includes(id)) {
      next.completedIds.push(id);
    }
    next.xp = next.completedIds.length * XP_PER_MASTERED_MODULE + (next.placementPassed ? XP_PLACEMENT_BONUS : 0);
    next.lastLessonId = id;
    next.updatedAt = now;
    return next;
  }

  function flattenBookText(lesson) {
    if (!lesson || !Array.isArray(lesson.bookSections) || !lesson.bookSections.length) return '';
    return lesson.bookSections.map(sec => {
      const partsArr = [sec.heading || '', ...(sec.paragraphs || []), ...(sec.paragraphsAfter || [])];
      if (sec.exampleBox && Array.isArray(sec.exampleBox.rows)) {
        partsArr.push(sec.exampleBox.title || '');
        sec.exampleBox.rows.forEach(r => partsArr.push(`${r.label || ''} ${r.detail || ''}`));
      }
      if (sec.table && Array.isArray(sec.table.rows)) {
        partsArr.push(sec.table.caption || '');
        sec.table.rows.forEach(r => partsArr.push((r || []).join(' ')));
      }
      if (sec.callout) {
        partsArr.push(`${sec.callout.title || ''} ${sec.callout.body || ''}`);
      }
      return partsArr.join(' ');
    }).join(' ');
  }

  function filterLessons(options) {
    const opts = options || {};
    const levelFilter = opts.levelId === undefined || opts.levelId === null || opts.levelId === 'all'
      ? 'all'
      : Number(opts.levelId);
    const statusFilter = opts.status || 'all';
    const q = normalizeText(opts.query || '');
    const completedSet = new Set(Array.isArray(opts.completedIds) ? opts.completedIds.map(resolveLessonId) : []);

    return LESSONS.filter(lesson => {
      if (levelFilter !== 'all' && lesson.stageId !== levelFilter) return false;

      if (statusFilter === 'completed' && !completedSet.has(lesson.id)) return false;
      if (statusFilter === 'incomplete' && completedSet.has(lesson.id)) return false;

      if (!q) return true;
      const stage = getStageById(lesson.stageId);
      const haystack = normalizeText([
        lesson.stepCode,
        lesson.title,
        lesson.subtitle || '',
        lesson.summary,
        lesson.id,
        lesson.diagramId,
        stage ? `${stage.code} ${stage.title}` : '',
        flattenBookText(lesson),
        ...(lesson.keyTakeaways || []),
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
      freeReadUnlocked: norm.freeReadUnlocked,
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
    const id = resolveLessonId(lessonId);
    const idx = LESSONS.findIndex(l => l.id === id);
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
      return 'Bantu saya memahami materi ICT XAU/USD di Amy FX Academy hari ini.';
    }
    const stage = getStageById(lesson.stageId);
    const stageLabel = stage ? `${stage.code} (${stage.title})` : '';
    const numLabel = formatStepNumber(lesson);
    return `Saya sedang membaca Amy FX Academy Bab ${numLabel}: "${lesson.title}" (${stageLabel}). Tolong bantu jelaskan pelan-pelan dengan contoh angka nyata di chart XAU/USD.`;
  }

  function buildAmyKnowledgeEntries() {
    return LESSONS.map(lesson => {
      const stage = getStageById(lesson.stageId);
      const stageHeader = stage ? `${stage.code}: ${stage.title}` : '';
      const numLabel = formatStepNumber(lesson);
      const bookProse = flattenBookText(lesson);
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
      const goldenStr = (lesson.keyTakeaways && lesson.keyTakeaways.length ? lesson.keyTakeaways : (lesson.goldenRules || [])).join(' ');

      return {
        title: `Bab ${numLabel} — ${lesson.title} (${stageHeader})`,
        path: `apps/academy/index.html?lesson=${lesson.id}`,
        text: [
          lesson.summary,
          bookProse || concepts,
          mapStr ? `Cara Mapping: ${mapStr}` : '',
          decStr ? `Pohon Keputusan: ${decStr}` : '',
          validStr ? `Syarat Valid: ${validStr}` : '',
          invalidStr ? `Invalid / Jebakan: ${invalidStr}` : '',
          scenarioStr ? `Contoh XAU/USD: ${scenarioStr}` : '',
          failStr,
          goldenStr ? `Inti Bab: ${goldenStr}` : ''
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
    LEGACY_ID_ALIASES,
    STAGES,
    LEVELS,
    LESSONS,
    resolveLessonId,
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
    verifyFreeReadPasscode,
    unlockFreeReadWithCode,
    disableFreeReadMode,
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
