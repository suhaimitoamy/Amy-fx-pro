/* Amy FX Academy — Duolingo-Style Mastery Path & Anti-Bingung Guided Reader
 * Features:
 * - Linear 43-Module Mastery Path (No Level Bureaucracy)
 * - Strict Mastery Locking (must pass >= 80% Uji Paham to unlock next module)
 * - Optional 100% (4/4) Placement Exam to prove MT5 basics & jump to Modul 07 (ICT)
 * - Anti-Bingung Guided Reader Tabs: Pahami & Gambar | Kasus Abu-Abu | Bedah Kasus | Uji Paham
 * - Interactive Multi-Stage SVG Diagrams, Mini Risk Lab, Bookmarks, Deep-Link Lock Guard & Tanya Amy
 */
(function (root) {
  'use strict';

  const C = root.AmyAcademyCurriculum;
  const D = root.AmyAcademyDiagrams;
  if (!C || !D) return;

  const BOOKMARKS_KEY = 'amy_academy_bookmarks_v1';

  const state = {
    view: 'overview', // 'overview' | 'lesson'
    activeLessonId: null,
    filterMode: 'all', // 'all' | 'mastered' | 'saved'
    searchQuery: '',
    readerTab: 'understand', // 'understand' | 'decisions' | 'cases' | 'exam' | 'all'
    diagramStageIndex: 0,
    quizAnswers: {}, // { [lessonId]: { [qIndex]: selectedOptionIndex } }
    justUnlockedLessonId: null,
    lockModal: null, // { targetLesson, blockedByLesson, requiredPercent }
    placementModalOpen: false,
    placementAnswers: {},
    placementResult: null,
    drawerOpen: false,
    progress: C.createEmptyProgress(),
    bookmarks: [],
    riskLab: {
      balanceUsd: 100,
      riskPct: 1,
      slPoints: 5,
      accountType: 'cent'
    }
  };

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Safely render **bold**, *italic*, and `code` inline formatting after strict HTML escaping
  function fmtRich(str) {
    return esc(str)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^\s*](?:[^*\n]*[^\s*])?)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code class="acd-inline-code">$1</code>');
  }

  function fmtStep(lesson) {
    return typeof C.formatStepNumber === 'function'
      ? C.formatStepNumber(lesson)
      : String(lesson ? lesson.stepNumber || lesson.number : '').padStart(2, '0');
  }

  function loadProgress() {
    try {
      const raw = root.localStorage.getItem(C.STORAGE_KEY);
      state.progress = C.normalizeProgress(raw ? JSON.parse(raw) : null);
    } catch {
      state.progress = C.createEmptyProgress();
    }
    try {
      const bRaw = root.localStorage.getItem(BOOKMARKS_KEY);
      const parsed = bRaw ? JSON.parse(bRaw) : [];
      state.bookmarks = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      state.bookmarks = [];
    }
  }

  function saveBookmarks() {
    try {
      root.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(state.bookmarks));
    } catch {
      // Ignore storage quota errors
    }
  }

  function toggleBookmark(lessonId) {
    if (!lessonId) return;
    const id = String(lessonId);
    const idx = state.bookmarks.indexOf(id);
    if (idx >= 0) state.bookmarks.splice(idx, 1);
    else state.bookmarks.unshift(id);
    saveBookmarks();
  }

  function saveProgress() {
    try {
      root.localStorage.setItem(C.STORAGE_KEY, JSON.stringify(state.progress));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }

  function syncUrl(lessonId, replace) {
    try {
      const url = new URL(root.location.href);
      if (lessonId) url.searchParams.set('lesson', lessonId);
      else url.searchParams.delete('lesson');
      if (replace) root.history.replaceState({ lessonId }, '', url.toString());
      else root.history.pushState({ lessonId }, '', url.toString());
    } catch {
      // Ignore history API restrictions
    }
  }

  function readLessonFromUrl() {
    try {
      const params = new URLSearchParams(root.location.search);
      const id = params.get('lesson');
      return id && C.getLessonById(id) ? id : null;
    } catch {
      return null;
    }
  }

  function showLockFeedback(lessonId) {
    const req = C.getUnlockRequirement(state.progress, lessonId);
    if (req.allowed) return false;
    state.lockModal = req;
    state.drawerOpen = false;
    document.body.style.overflow = 'hidden';
    render();
    return true;
  }

  function closeModals() {
    state.lockModal = null;
    state.placementModalOpen = false;
    document.body.style.overflow = state.drawerOpen ? 'hidden' : '';
    render();
  }

  function openLesson(lessonId, opts) {
    const lesson = C.getLessonById(lessonId);
    if (!lesson) return;

    // Hard Mastery Lock Guard (cannot bypass via click, pager, sidebar, or URL!)
    if (!C.canOpenLesson(state.progress, lesson.id)) {
      const req = C.getUnlockRequirement(state.progress, lesson.id);
      state.lockModal = req;
      state.drawerOpen = false;
      if (state.view !== 'overview') {
        state.view = 'overview';
        state.activeLessonId = null;
        syncUrl(null, true);
      }
      document.body.style.overflow = 'hidden';
      render();
      return;
    }

    const options = opts || {};
    state.view = 'lesson';
    state.activeLessonId = lesson.id;
    state.diagramStageIndex = 0;
    state.readerTab = options.tab || 'understand';
    state.justUnlockedLessonId = null;
    state.lockModal = null;
    state.placementModalOpen = false;
    state.drawerOpen = false;
    document.body.style.overflow = '';

    state.progress = C.setLastLesson(state.progress, lesson.id);
    saveProgress();

    if (!options.skipUrl) syncUrl(lesson.id, Boolean(options.replaceUrl));
    render();
    if (!options.skipScroll) root.scrollTo({ top: 0, behavior: 'auto' });
  }

  function openOverview(opts) {
    const options = opts || {};
    state.view = 'overview';
    state.activeLessonId = null;
    state.drawerOpen = false;
    state.justUnlockedLessonId = null;
    document.body.style.overflow = state.lockModal || state.placementModalOpen ? 'hidden' : '';
    if (!options.skipUrl) syncUrl(null, Boolean(options.replaceUrl));
    render();
    if (!options.skipScroll) root.scrollTo({ top: 0, behavior: 'auto' });
  }

  function setDrawerOpen(open) {
    state.drawerOpen = Boolean(open);
    const sidebar = document.getElementById('acdSidebar');
    const backdrop = document.getElementById('acdBackdrop');
    if (sidebar) sidebar.classList.toggle('is-open', state.drawerOpen);
    if (backdrop) backdrop.classList.toggle('is-open', state.drawerOpen);
    document.body.style.overflow = state.drawerOpen ? 'hidden' : '';
  }

  function updateHeaderProgress() {
    const stats = C.computeProgressStats(state.progress);
    const labelEl = document.getElementById('acdHeaderProgressText');
    const fillEl = document.getElementById('acdHeaderProgressFill');
    const menuBtn = document.getElementById('acdMenuToggleBtn');
    if (labelEl) labelEl.textContent = `${stats.completedCount} / ${stats.totalLessons} (${stats.percent}%)`;
    if (fillEl) fillEl.style.width = `${stats.percent}%`;
    if (menuBtn) menuBtn.hidden = state.view !== 'lesson';
  }

  function renderLockModal() {
    if (!state.lockModal) return '';
    const { targetLesson, blockedByLesson, requiredPercent } = state.lockModal;
    if (!targetLesson) return '';

    const blockerTitle = blockedByLesson
      ? `Modul ${fmtStep(blockedByLesson)} · ${blockedByLesson.title}`
      : 'Modul sebelumnya';

    return `<div class="acd-modal-backdrop" id="acdLockModalBackdrop" role="presentation">
      <div class="acd-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="acdLockModalTitle">
        <div class="acd-modal-icon acd-modal-icon--lock" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 id="acdLockModalTitle" class="acd-modal-title">Modul ${fmtStep(targetLesson)} Masih Terkunci</h2>
        <p class="acd-modal-subtitle">${esc(targetLesson.title)}</p>
        <p class="acd-modal-body">
          Untuk mencegah kebingungan akibat materi yang loncat-loncat, setiap modul baru hanya terbuka setelah kamu <strong>lulus Uji Paham (minimal ${requiredPercent}% benar)</strong> pada modul aktif saat ini:
        </p>
        <div class="acd-modal-prereq">
          <span class="acd-modal-prereq-kicker">Prasyarat Aktif</span>
          <strong>${esc(blockerTitle)}</strong>
        </div>
        <div class="acd-modal-actions">
          ${blockedByLesson ? `<button type="button" class="acd-btn-primary" id="acdGoFrontierBtn" data-open-lesson="${esc(blockedByLesson.id)}">Buka Modul ${fmtStep(blockedByLesson)} Sekarang →</button>` : ''}
          <button type="button" class="acd-btn-secondary" id="acdCloseLockModalBtn">Tutup</button>
        </div>
      </div>
    </div>`;
  }

  function renderPlacementModal() {
    if (!state.placementModalOpen) return '';
    const questions = C.PLACEMENT_QUIZ || [];
    const total = questions.length;
    const answers = state.placementAnswers || {};
    const answeredCount = Object.keys(answers).length;
    const res = state.placementResult;
    const letters = ['A', 'B', 'C', 'D'];

    const qsHtml = questions.map((q, qIdx) => {
      const selected = answers[qIdx];
      const submitted = Boolean(res);
      const itemRes = submitted ? res.results[qIdx] : null;
      const optsHtml = q.options.map((opt, oIdx) => {
        let cls = 'acd-quiz-opt';
        let keyLabel = letters[oIdx] || String(oIdx + 1);
        if (submitted) {
          if (oIdx === q.answerIndex) {
            cls += ' is-correct';
            keyLabel = '✓';
          } else if (oIdx === selected) {
            cls += ' is-wrong';
            keyLabel = '✕';
          }
        } else if (selected === oIdx) {
          cls += ' is-selected';
        }
        return `<button type="button" class="${cls}" data-place-q="${qIdx}" data-place-opt="${oIdx}" ${submitted ? 'disabled' : ''}>
          <span class="acd-quiz-opt-key" aria-hidden="true">${keyLabel}</span>
          <span>${esc(opt)}</span>
        </button>`;
      }).join('');

      const feedback = submitted && itemRes
        ? `<div class="acd-quiz-feedback ${itemRes.correct ? 'is-correct' : 'is-wrong'}">
            <strong>${itemRes.correct ? '✓ Benar' : '✕ Salah'}</strong> — ${esc(itemRes.explanation)}
          </div>`
        : '';

      return `<div class="acd-quiz-q">
        <p class="acd-quiz-q-title">${qIdx + 1}. ${esc(q.question)}</p>
        <div class="acd-quiz-options">${optsHtml}</div>
        ${feedback}
      </div>`;
    }).join('');

    const footerHtml = res
      ? (res.passed
        ? `<div class="acd-unlock-banner" role="status">
            <strong>🔓 Lulus 4/4! Modul 01–06 Tuntas (+${C.XP_PLACEMENT_BONUS} XP)</strong>
            <p>Fondasi MT5 &amp; Lot Gold terbukti kuat. Jalur langsung terbuka ke Modul 07 (Pintu Masuk ICT).</p>
            <div class="acd-modal-actions">
              <button type="button" class="acd-btn-primary" id="acdPlacementContinueBtn" data-open-lesson="${esc(res.unlockedLesson?.id || 'logika-trading-probabilitas')}">Buka Modul 07 Sekarang →</button>
              <button type="button" class="acd-btn-secondary" id="acdClosePlacementBtn">Lihat Peta Jalur</button>
            </div>
          </div>`
        : `<div class="acd-quiz-summary" role="status">
            <div>
              <strong>Belum Lulus Tes Loncat (${res.correct}/${res.total} Benar)</strong>
              <p class="acd-muted-note">Syarat tes loncat wajib 4/4 benar. Sebaiknya pelajari dari Modul 01 agar fondasi spread, lot &amp; order MT5 benar-benar matang.</p>
            </div>
            <div class="acd-modal-actions">
              <button type="button" class="acd-btn-primary" id="acdRetryPlacementBtn">Coba Lagi</button>
              <button type="button" class="acd-btn-secondary" id="acdClosePlacementBtn">Belajar dari Modul 01</button>
            </div>
          </div>`)
      : `<div class="acd-modal-actions">
          <button type="button" class="acd-btn-primary" id="acdSubmitPlacementBtn" ${answeredCount < total ? 'disabled' : ''}>
            Periksa Jawaban (${answeredCount}/${total})
          </button>
          <button type="button" class="acd-btn-secondary" id="acdClosePlacementBtn">Batal</button>
        </div>`;

    return `<div class="acd-modal-backdrop" id="acdPlacementBackdrop" role="presentation">
      <div class="acd-modal-sheet acd-modal-sheet--wide" role="dialog" aria-modal="true" aria-labelledby="acdPlacementTitle">
        <div class="acd-modal-top-row">
          <div>
            <p class="acd-hero-kicker">Uji Bukti Paham · Wajib 4/4 Benar</p>
            <h2 id="acdPlacementTitle" class="acd-modal-title">Tes Loncat Dasar MT5 &amp; Lot Gold</h2>
          </div>
          <button type="button" class="acd-icon-btn" id="acdClosePlacementTopBtn" aria-label="Tutup Tes Loncat">×</button>
        </div>
        <p class="acd-modal-body">Sudah terbiasa memakai MT5, menghitung lot XAU/USD, dan paham Bid/Ask? Jawab 4 skenario nyata ini dengan sempurna (4/4) untuk membuka langsung <strong>Modul 07 (Pintu Masuk ICT)</strong>.</p>
        <div class="acd-placement-questions">${qsHtml}</div>
        ${footerHtml}
      </div>
    </div>`;
  }

  function renderOverview() {
    const stats = C.computeProgressStats(state.progress);
    const bookmarkSet = new Set(state.bookmarks);
    const frontier = stats.frontierLesson || C.LESSONS[0];
    const prepReadiness = C.evaluateLevel0Readiness(state.progress);
    const showPlacementBanner = !prepReadiness.readyForIct && !state.searchQuery.trim();

    const baseFiltered = C.filterLessons({
      levelId: 'all',
      query: state.searchQuery,
      completedIds: state.progress.completedIds,
      status: state.filterMode === 'mastered' ? 'completed' : 'all'
    });
    const filtered = state.filterMode === 'saved'
      ? baseFiltered.filter(l => bookmarkSet.has(String(l.id)))
      : baseFiltered;

    const primaryCtaLabel = stats.allMastered
      ? 'Review Capstone · Modul 43'
      : stats.completedCount > 0
        ? `Lanjutkan · Modul ${fmtStep(frontier)}`
        : `Mulai Modul 01`;

    const placementHtml = showPlacementBanner
      ? `<section class="acd-placement-banner" aria-label="Tes loncat bagi trader yang sudah paham dasar MT5">
          <div class="acd-placement-copy">
            <span class="acd-track-kicker">Sudah Paham Dasar MT5 &amp; Lot Gold?</span>
            <p>Lewati Modul 01–06 tanpa curang: buktikan pemahamanmu lewat <strong>Tes Loncat (wajib 4/4 benar)</strong> untuk langsung membuka Modul 07 (Pintu Masuk ICT).</p>
          </div>
          <button type="button" class="acd-btn-secondary" id="acdOpenPlacementBtn">Ikuti Tes Loncat (4 Soal)</button>
        </section>`
      : '';

    const stagesHtml = C.STAGES.map(stage => {
      const items = filtered.filter(l => l.stageId === stage.id);
      if (items.length === 0) return '';
      const stageStat = stats.byStage.find(s => s.stageId === stage.id);
      const stagePct = stageStat ? stageStat.percent : 0;
      const stageAllDone = stageStat && stageStat.completed === stageStat.total && stageStat.total > 0;

      const nodesHtml = items.map((lesson, idxInStage) => {
        const lockState = C.getModuleLockState(state.progress, lesson.id);
        const isMastered = lockState === 'mastered';
        const isActive = lockState === 'unlocked';
        const isLocked = lockState === 'locked';
        const isSaved = bookmarkSet.has(String(lesson.id));
        const quizRec = state.progress.quizScores[lesson.id];
        const stepStr = fmtStep(lesson);
        const zigClass = idxInStage % 2 === 1 ? 'acd-path-item--offset' : '';

        let statusText = `${lesson.readMinutes} mnt · Uji Paham ${lesson.quiz.length} soal`;
        let nodeSymbol = stepStr;
        if (isMastered) {
          nodeSymbol = '✓';
          statusText = quizRec
            ? `Dikuasai · Skor ${quizRec.correct}/${quizRec.total} · Ketuk untuk review`
            : 'Dikuasai · Ketuk untuk review';
        } else if (isActive) {
          nodeSymbol = '▶';
          statusText = `Sedang Aktif · Lulus Uji Paham ≥80% untuk buka berikutnya`;
        } else {
          nodeSymbol = '🔒';
          statusText = 'Terkunci · Tuntaskan modul aktif sebelumnya';
        }

        return `<div class="acd-path-item is-${lockState} ${zigClass}" data-module-state="${lockState}" data-module-id="${esc(lesson.id)}">
          <div class="acd-path-rail" aria-hidden="true">
            <span class="acd-path-line"></span>
            <span class="acd-path-node">${nodeSymbol}</span>
          </div>
          <div class="acd-path-card-wrap">
            <button type="button"
              class="acd-path-card is-${lockState}"
              data-open-lesson="${esc(lesson.id)}"
              aria-label="Modul ${stepStr}: ${esc(lesson.title)} — ${isMastered ? 'Dikuasai' : isActive ? 'Aktif' : 'Terkunci'}">
              <div class="acd-path-card-head">
                <span class="acd-path-step acd-nums">Modul ${stepStr}</span>
                <span class="acd-path-state-label is-${lockState}">
                  ${isMastered ? 'Tuntas' : isActive ? 'Aktif Sekarang' : 'Terkunci'}
                </span>
              </div>
              <p class="acd-path-title">${esc(lesson.title)}</p>
              <p class="acd-path-meta">${esc(statusText)}</p>
            </button>
            ${!isLocked
              ? `<button type="button" class="acd-bookmark-icon-btn ${isSaved ? 'is-saved' : ''}" data-toggle-bookmark="${esc(lesson.id)}" aria-label="${isSaved ? 'Hapus favorit' : 'Simpan favorit'}" aria-pressed="${isSaved ? 'true' : 'false'}">${isSaved ? '★' : '☆'}</button>`
              : ''}
          </div>
        </div>`;
      }).join('');

      return `<section class="acd-stage-block ${stageAllDone ? 'is-stage-done' : ''}" aria-labelledby="stage-heading-${stage.id}">
        <header class="acd-stage-head">
          <div class="acd-stage-head-top">
            <div>
              <span class="acd-stage-code">${esc(stage.code)}</span>
              <h2 id="stage-heading-${stage.id}">${esc(stage.title)}</h2>
            </div>
            <span class="acd-stage-count acd-nums">${stageStat ? `${stageStat.completed}/${stageStat.total}` : ''}</span>
          </div>
          <p class="acd-stage-tagline">${esc(stage.tagline)}</p>
          <div class="acd-level-bar" aria-hidden="true"><span style="width:${stagePct}%"></span></div>
        </header>
        <div class="acd-path-list">${nodesHtml}</div>
      </section>`;
    }).filter(Boolean).join('');

    const emptyMsg = state.filterMode === 'saved' && !state.searchQuery
      ? 'Belum ada modul favorit tersimpan. Ketuk ikon bintang (☆) pada modul yang terbuka untuk menyimpannya.'
      : state.filterMode === 'mastered' && !state.searchQuery
        ? 'Belum ada modul yang dituntaskan. Mulai dari Modul 01 dan lulus Uji Paham minimal 80% untuk membuka jalurmu.'
        : `Tidak ada modul yang cocok dengan "${esc(state.searchQuery)}".`;

    const emptyHtml = `<div class="acd-empty-state">
      <p style="margin:0 0 12px; font-weight:700; color:var(--acd-ink);">${emptyMsg}</p>
      <button type="button" class="acd-btn-secondary" id="acdResetFilterBtn">Tampilkan Seluruh Jalur</button>
    </div>`;

    return `<div class="acd-overview">
      <section class="acd-hero" aria-label="Ringkasan Jalur Penguasaan ICT">
        <div>
          <p class="acd-hero-kicker">${C.LESSONS.length} Modul Berurutan · Sistem Kunci Pemahaman 80% · XAU/USD</p>
          <h1>Jalur Penguasaan ICT Mandiri</h1>
          <p class="acd-hero-sub">Pelajari ICT secara tuntas tanpa loncat-loncat dan tanpa duplikasi. Setiap modul baru terbuka setelah kamu lulus Uji Paham minimal 80%.</p>
          <p class="acd-hero-resume-meta">
            ${stats.allMastered
              ? 'Selamat — seluruh 43 modul hingga Capstone Mapping Mandiri telah kamu kuasai.'
              : `Target Aktif: <strong>Modul ${fmtStep(frontier)} · ${esc(frontier.title)}</strong>`}
          </p>
        </div>
        <div class="acd-hero-right">
          <div class="acd-hero-stats">
            <div class="acd-hero-stats-row">
              <span>Progres Penguasaan</span>
              <strong class="acd-nums">${stats.completedCount} / ${stats.totalLessons} (${stats.percent}%) · ${stats.xp} XP</strong>
            </div>
            <div class="acd-progress-bar-lg" role="progressbar" aria-valuenow="${stats.percent}" aria-valuemin="0" aria-valuemax="100">
              <span style="width:${stats.percent}%"></span>
            </div>
          </div>
          <button type="button" class="acd-btn-primary" id="acdHeroPrimaryCta" data-open-lesson="${esc(frontier.id)}">${esc(primaryCtaLabel)} →</button>
        </div>
      </section>

      ${placementHtml}

      <div class="acd-toolbar" role="search">
        <div class="acd-level-tabs" role="tablist" aria-label="Filter jalur modul">
          <button type="button" class="acd-tab-btn ${state.filterMode === 'all' ? 'is-active' : ''}" data-filter-mode="all">Semua (${C.LESSONS.length})</button>
          <button type="button" class="acd-tab-btn ${state.filterMode === 'mastered' ? 'is-active' : ''}" data-filter-mode="mastered">Dikuasai (${stats.completedCount})</button>
          <button type="button" class="acd-tab-btn ${state.filterMode === 'saved' ? 'is-active' : ''}" data-filter-mode="saved">Tersimpan (${state.bookmarks.length})</button>
        </div>
        <div class="acd-search-wrap">
          <svg class="acd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="acdSearchInput" class="acd-search-input" type="search" placeholder="Cari topik (mis. DOL, Unicorn, SMT, MMXM, FVG, Lot)..." value="${esc(state.searchQuery)}" autocomplete="off" aria-label="Cari materi modul">
        </div>
      </div>

      <div class="acd-stages-stack">
        ${stagesHtml || emptyHtml}
      </div>
    </div>`;
  }

  function renderSidebar() {
    const groupsHtml = C.STAGES.map(stage => {
      const items = C.getLessonsByStage(stage.id);
      const done = items.filter(l => C.isLessonMastered(state.progress, l.id)).length;
      const itemsHtml = items.map(lesson => {
        const active = lesson.id === state.activeLessonId;
        const lockState = C.getModuleLockState(state.progress, lesson.id);
        const isDone = lockState === 'mastered';
        const isLocked = lockState === 'locked';
        const stepStr = fmtStep(lesson);
        const icon = isDone ? '✓' : isLocked ? '🔒' : stepStr;

        return `<button type="button"
          class="acd-nav-item ${active ? 'is-active' : ''} is-${lockState}"
          data-open-lesson="${esc(lesson.id)}"
          ${active ? 'aria-current="page"' : ''}>
          <span class="acd-nav-num">${icon}</span>
          <span>${esc(lesson.title)}</span>
        </button>`;
      }).join('');

      return `<div class="acd-sidebar-group">
        <div class="acd-sidebar-group-title">
          <span>${esc(stage.code)} · ${esc(stage.title.split('&')[0].trim())}</span>
          <span class="acd-nums">${done}/${items.length}</span>
        </div>
        ${itemsHtml}
      </div>`;
    }).join('');

    return `<aside id="acdSidebar" class="acd-sidebar ${state.drawerOpen ? 'is-open' : ''}" aria-label="Jalur ${C.LESSONS.length} modul">
      <div class="acd-sidebar-top">
        <button type="button" class="acd-sidebar-overview-btn" id="acdOverviewBtn">← Peta Jalur</button>
        <button type="button" class="acd-drawer-close" id="acdDrawerCloseBtn" aria-label="Tutup daftar jalur">×</button>
      </div>
      ${groupsHtml}
    </aside>`;
  }

  function renderDiagramCard(lesson) {
    const rendered = D.renderDiagramSVG(lesson.diagramId, state.diagramStageIndex);
    const tabsHtml = rendered.stages.map(s => {
      const active = s.index === rendered.activeIndex;
      return `<button type="button" class="acd-stage-btn ${active ? 'is-active' : ''}" data-diagram-stage="${s.index}" aria-pressed="${active ? 'true' : 'false'}">${esc(s.label)}</button>`;
    }).join('');

    return `<section class="acd-diagram-card" aria-label="Diagram chart interaktif">
      <div class="acd-diagram-head">
        <h2 class="acd-diagram-title">${esc(rendered.title)}</h2>
        <div class="acd-stage-tabs" role="group" aria-label="Tahap diagram">${tabsHtml}</div>
      </div>
      <div class="acd-diagram-canvas" id="acdDiagramCanvas">${rendered.svg}</div>
      <div class="acd-diagram-caption" id="acdDiagramCaption">
        <strong>Catatan Chart:</strong> ${esc(rendered.caption)}
      </div>
    </section>`;
  }

  function renderQuizSection(lesson, adj) {
    const answers = state.quizAnswers[lesson.id] || {};
    const total = lesson.quiz.length;
    const minPass = C.requiredCorrectCount(total);
    const answeredKeys = Object.keys(answers);
    const allAnswered = answeredKeys.length === total;
    const currentCorrect = lesson.quiz.reduce((acc, q, idx) => (
      answers[idx] === q.answerIndex ? acc + 1 : acc
    ), 0);

    const savedRec = state.progress.quizScores[lesson.id];
    const isMastered = C.isLessonMastered(state.progress, lesson.id);
    const scoreBadge = allAnswered
      ? `Skor: ${currentCorrect}/${total}`
      : savedRec
        ? `Skor Terbaik: ${savedRec.correct}/${savedRec.total}`
        : `Syarat Lulus: ${minPass}/${total} (≥80%)`;

    const questionsHtml = lesson.quiz.map((q, qIdx) => {
      const selected = answers[qIdx];
      const hasAnswered = selected !== undefined;
      const isRight = hasAnswered && selected === q.answerIndex;
      const letters = ['A', 'B', 'C', 'D'];

      const optsHtml = q.options.map((opt, oIdx) => {
        let cls = 'acd-quiz-opt';
        let prefix = letters[oIdx] || String(oIdx + 1);
        if (hasAnswered) {
          if (oIdx === q.answerIndex) {
            cls += ' is-correct';
            prefix = '✓';
          } else if (oIdx === selected) {
            cls += ' is-wrong';
            prefix = '✕';
          }
        }
        return `<button type="button" class="${cls}" data-quiz-q="${qIdx}" data-quiz-opt="${oIdx}" ${hasAnswered ? 'disabled' : ''}>
          <span class="acd-quiz-opt-key" aria-hidden="true">${prefix}</span>
          <span>${fmtRich(opt)}</span>
        </button>`;
      }).join('');

      const feedbackHtml = hasAnswered
        ? `<div class="acd-quiz-feedback ${isRight ? 'is-correct' : 'is-wrong'}" role="status">
            <strong>${isRight ? '✓ Benar' : '✕ Kurang Tepat'}</strong> — ${fmtRich(q.explanation)}
          </div>`
        : '';

      return `<div class="acd-quiz-q">
        <p class="acd-quiz-q-title">${qIdx + 1}. ${fmtRich(q.question)}</p>
        <div class="acd-quiz-options">${optsHtml}</div>
        ${feedbackHtml}
      </div>`;
    }).join('');

    const passedNow = allAnswered && currentCorrect >= minPass;
    let summaryHtml = '';
    if (allAnswered) {
      if (passedNow) {
        const nextBtn = adj.next
          ? `<button type="button" class="acd-btn-primary" id="acdUnlockedNextBtn" data-open-lesson="${esc(adj.next.id)}">Buka Modul ${fmtStep(adj.next)} →</button>`
          : `<button type="button" class="acd-btn-primary" id="acdFinishOverviewBtn">Lihat Wisuda Jalur →</button>`;
        summaryHtml = `<div class="acd-unlock-banner" role="status">
          <strong>🔓 Lulus Uji Paham (${currentCorrect}/${total}) — ${adj.next ? `Modul ${fmtStep(adj.next)} Resmi Terbuka!` : 'Seluruh Jalur ICT Tuntas!'}</strong>
          <p>Pemahamanmu terverifikasi (+${C.XP_PER_MASTERED_MODULE} XP). Progres otomatis tersimpan.</p>
          <div class="acd-unlock-actions">
            ${nextBtn}
            <button type="button" class="acd-btn-secondary" id="acdRetryQuizBtn">Ulangi Uji Paham</button>
          </div>
        </div>`;
      } else {
        summaryHtml = `<div class="acd-quiz-summary is-failed" role="status">
          <div>
            <strong>🔒 Belum Lulus (${currentCorrect}/${total} — Minimal ${minPass}/${total} Benar)</strong>
            <p class="acd-muted-note">Modul berikutnya tetap terkunci agar tidak bingung di langkah lanjut. Baca kembali tab <strong>Kasus Abu-Abu</strong> dan <strong>Pahami &amp; Gambar</strong> lalu ulangi Uji Paham.</p>
          </div>
          <div class="acd-unlock-actions">
            <button type="button" class="acd-btn-primary" id="acdRetryQuizBtn">Ulangi Uji Paham</button>
            <button type="button" class="acd-btn-secondary" data-reader-tab="decisions">Baca Kasus Abu-Abu</button>
          </div>
        </div>`;
      }
    }

    return `<section class="acd-quiz-card" id="acdExamSection" aria-labelledby="acdQuizHeading">
      <div class="acd-quiz-head">
        <div>
          <p class="acd-section-kicker" style="margin-bottom:4px;">Gerbang Buka Kunci · Minimal ${minPass}/${total} Benar (80%)</p>
          <h2 id="acdQuizHeading">Uji Paham Modul ${fmtStep(lesson)} ${isMastered ? '· ✓ Tuntas' : ''}</h2>
        </div>
        <span class="acd-quiz-score acd-nums">${esc(scoreBadge)}</span>
      </div>
      ${questionsHtml}
      ${summaryHtml}
    </section>`;
  }

  function renderMiniRiskLab() {
    if (typeof C.calculateBeginnerRiskLot !== 'function') return '';
    const calc = C.calculateBeginnerRiskLot(state.riskLab);
    const idrFmt = calc.riskIdr.toLocaleString('id-ID');
    return `<section id="acdMiniRiskLab" class="acd-risk-lab" aria-label="Simulasi Latihan Lot dan Risiko Gold">
      <div class="acd-risk-lab-head">
        <div>
          <span class="acd-track-kicker">Lab Praktik Langsung · XAU/USD</span>
          <h2>Simulasi Hitung Lot &amp; Risiko Aman</h2>
        </div>
        <div class="acd-risk-seg" role="group" aria-label="Tipe akun latihan">
          <button type="button" class="acd-risk-seg-btn ${calc.accountType === 'cent' ? 'is-active' : ''}" data-risk-acct="cent">Akun Cent</button>
          <button type="button" class="acd-risk-seg-btn ${calc.accountType === 'standard' ? 'is-active' : ''}" data-risk-acct="standard">Standard</button>
        </div>
      </div>
      <div class="acd-risk-inputs">
        <label class="acd-risk-field">
          <span>Modal ($)</span>
          <input id="acdRiskBalance" type="number" min="10" step="10" value="${esc(calc.balanceUsd)}" inputmode="decimal">
        </label>
        <label class="acd-risk-field">
          <span>Risiko (%)</span>
          <input id="acdRiskPct" type="number" min="0.1" max="20" step="0.1" value="${esc(calc.riskPct)}" inputmode="decimal">
        </label>
        <label class="acd-risk-field">
          <span>Jarak SL ($)</span>
          <input id="acdRiskSl" type="number" min="0.5" max="50" step="0.5" value="${esc(calc.slPoints)}" inputmode="decimal">
        </label>
      </div>
      <div class="acd-risk-presets" role="group" aria-label="Preset risiko cepat">
        <button type="button" class="acd-risk-preset-btn" data-risk-preset="0.5">0.5% Aman</button>
        <button type="button" class="acd-risk-preset-btn" data-risk-preset="1">1% Standar</button>
        <button type="button" class="acd-risk-preset-btn" data-risk-preset="2">2% Maks</button>
      </div>
      <div class="acd-risk-results" aria-live="polite">
        <div class="acd-risk-metric">
          <span>Lot Rekomendasi</span>
          <strong id="acdRiskOutLot" class="acd-nums">${calc.recommendedLot.toFixed(2)} ${calc.accountType === 'cent' ? 'Cent Lot' : 'Lot'}</strong>
        </div>
        <div class="acd-risk-metric">
          <span>Risiko Maks / Trade</span>
          <strong id="acdRiskOutUsd" class="acd-nums">$${calc.actualRiskUsd.toFixed(2)} (~Rp${idrFmt})</strong>
        </div>
        <div class="acd-risk-metric">
          <span>Jarak SL</span>
          <strong id="acdRiskOutPips" class="acd-nums">${calc.slPips} pips ($${calc.slPoints.toFixed(1)})</strong>
        </div>
      </div>
      <p id="acdRiskOutStatus" class="acd-risk-status is-${calc.safetyLevel}">${esc(calc.safetyLabel)}${calc.needsCentHint ? ' · Modal ini terlalu kecil untuk 0.01 Standard — disarankan pakai Akun Cent.' : ''}</p>
    </section>`;
  }

  function renderLessonWorkspace() {
    const lesson = C.getLessonById(state.activeLessonId);
    if (!lesson) return renderOverview();

    const stage = C.getStageById(lesson.stageId);
    const isMastered = C.isLessonMastered(state.progress, lesson.id);
    const adj = C.getAdjacentLessons(lesson.id);
    const nextUnlocked = adj.next ? C.canOpenLesson(state.progress, adj.next.id) : true;
    const tab = state.readerTab;
    const showAll = tab === 'all';

    const conceptsHtml = (lesson.conceptBlocks || []).map(b => `
      <div class="acd-concept-block">
        <h2>${esc(b.heading)}</h2>
        ${(b.paragraphs || []).map(p => `<p>${fmtRich(p)}</p>`).join('')}
      </div>
    `).join('');

    const mappingStepsHtml = Array.isArray(lesson.mappingSteps) && lesson.mappingSteps.length
      ? `<div class="acd-mapping-box">
          <p class="acd-section-kicker">Langkah Mekanis di Chart Kosong</p>
          <h3>Cara Gambar &amp; Praktik Langkah demi Langkah</h3>
          <ol class="acd-step-list">${lesson.mappingSteps.map(s => `<li>${fmtRich(s)}</li>`).join('')}</ol>
        </div>`
      : '';

    const decisionTreeHtml = Array.isArray(lesson.decisionTree) && lesson.decisionTree.length
      ? `<div class="acd-decision-stack">
          <p class="acd-section-kicker">Pohon Keputusan Kasus Abu-Abu</p>
          <h2 class="acd-subhead">Kalau Bingung di Chart Asli, Ikuti Ini</h2>
          ${lesson.decisionTree.map((item, i) => `
            <div class="acd-decision-card">
              <p class="acd-decision-q"><span class="acd-decision-tag acd-nums">IF ${i + 1}</span> ${fmtRich(item.condition)}</p>
              <p class="acd-decision-a"><span class="acd-decision-tag acd-decision-tag--then">THEN</span> ${fmtRich(item.action)}</p>
            </div>
          `).join('')}
        </div>`
      : '';

    const isPrepStage = lesson.stageId === 0;
    const validHeading = isPrepStage ? 'Kebiasaan Aman Pemula' : 'Syarat Valid (A+)';
    const invalidHeading = isPrepStage ? 'Kesalahan Fatal Pemula' : 'Invalid / Jebakan';
    const validList = (lesson.validRules || []).map(r => `<li>${fmtRich(r)}</li>`).join('');
    const invalidList = (lesson.invalidRules || []).map(r => `<li>${fmtRich(r)}</li>`).join('');

    const scenarioSteps = (lesson.xauScenario?.steps || []).map(s => `<li>${fmtRich(s)}</li>`).join('');
    const goldenItems = (lesson.goldenRules || []).map(g => `<li>${fmtRich(g)}</li>`).join('');

    const failedCaseHtml = lesson.failedCase
      ? `<div class="acd-failed-card">
          <h3>✕ ${esc(lesson.failedCase.title || 'Contoh Kasus Gagal (Kenapa Kena SL?)')}</h3>
          <p class="acd-scenario-context">${fmtRich(lesson.failedCase.context)}</p>
          <p class="acd-failed-reason"><strong>Penyebab Gagal:</strong> ${fmtRich(lesson.failedCase.whyFailed)}</p>
        </div>`
      : '';

    const practiceCtaHtml = lesson.practiceCta
      ? `<section class="acd-practice-cta" aria-label="Praktik langsung di aplikasi">
          <div class="acd-practice-copy">
            <p class="acd-practice-kicker">Praktik Langsung · Amy FX Pro</p>
            <h3>${esc(lesson.practiceCta.label)}</h3>
            <p>${esc(lesson.practiceCta.description)}</p>
          </div>
          <a class="acd-btn-primary acd-practice-link" href="${esc(lesson.practiceCta.href)}">Buka Fitur →</a>
        </section>`
      : '';

    const graduationHtml = !adj.next
      ? `<section class="acd-graduation-card" aria-label="Langkah eksekusi setelah lulus">
          <h2>Wisuda Jalur Penguasaan ICT Mandiri</h2>
          <p>Kamu berada di modul puncak ke-43. Lulus Uji Paham Capstone untuk menuntaskan 100% Academy, lalu buktikan langsung di Cockpit Mapping &amp; Lab 100 Kasus ICT.</p>
          <div class="acd-graduation-links">
            <a class="acd-btn-primary" href="../mapping/index.html">Buka Cockpit Mapping →</a>
            <a class="acd-btn-secondary" href="trading-practice/index.html">Buka Latihan 100 Kasus ICT</a>
          </div>
        </section>`
      : '';

    const sectionUnderstand = (showAll || tab === 'understand')
      ? `<section class="acd-section" aria-label="Konsep inti dan cara mapping">
          <p class="acd-section-kicker">01 · Logika Inti &amp; Cara Mapping</p>
          ${conceptsHtml}
          ${mappingStepsHtml}
          ${!showAll ? `<div class="acd-tab-next-row"><button type="button" class="acd-btn-primary" data-reader-tab="decisions">Lanjut ke Kasus Abu-Abu →</button></div>` : ''}
        </section>`
      : '';

    const sectionDecisions = (showAll || tab === 'decisions')
      ? `<section class="acd-section" aria-label="Pohon keputusan kasus abu-abu dan filter valid vs invalid">
          ${decisionTreeHtml}
          <div class="acd-compare-grid" style="margin-top:18px;">
            <div class="acd-compare-card acd-compare-card--valid">
              <h3><span aria-hidden="true">✓</span> ${validHeading}</h3>
              <ul class="acd-rule-list">${validList}</ul>
            </div>
            <div class="acd-compare-card acd-compare-card--invalid">
              <h3><span aria-hidden="true">✕</span> ${invalidHeading}</h3>
              <ul class="acd-rule-list">${invalidList}</ul>
            </div>
          </div>
          ${!showAll ? `<div class="acd-tab-next-row"><button type="button" class="acd-btn-primary" data-reader-tab="cases">Lanjut ke Bedah Kasus Nyata →</button></div>` : ''}
        </section>`
      : '';

    const sectionCases = (showAll || tab === 'cases')
      ? `<section class="acd-section" aria-label="Bedah kasus sukses vs gagal dan aturan emas">
          <p class="acd-section-kicker">03 · Bedah Kasus Nyata XAU/USD (Sukses vs Gagal)</p>
          <div class="acd-scenario-card">
            <h3>✓ Studi Kasus Sukses XAU/USD (WITA)</h3>
            <p class="acd-scenario-context">${fmtRich(lesson.xauScenario?.context || '')}</p>
            <ol class="acd-step-list">${scenarioSteps}</ol>
          </div>
          ${failedCaseHtml}
          <div class="acd-golden-box">
            <h3>Aturan Emas</h3>
            <ul>${goldenItems}</ul>
          </div>
          ${lesson.id === 'lot-leverage-margin-equity' ? renderMiniRiskLab() : ''}
          ${practiceCtaHtml}
          ${!showAll ? `<div class="acd-tab-next-row"><button type="button" class="acd-btn-primary" data-reader-tab="exam">Masuk ke Uji Paham (Buka Kunci 🔓) →</button></div>` : ''}
        </section>`
      : '';

    const sectionExam = (showAll || tab === 'exam')
      ? `${renderQuizSection(lesson, adj)}${graduationHtml}`
      : '';

    const nextPagerBtn = adj.next
      ? (nextUnlocked
        ? `<button type="button" class="acd-pager-btn acd-pager-btn--next" data-open-lesson="${esc(adj.next.id)}">
            <span class="acd-pager-dir">Berikutnya · Modul ${fmtStep(adj.next)} →</span>
            <span class="acd-pager-title">${esc(adj.next.title)}</span>
          </button>`
        : `<button type="button" class="acd-pager-btn acd-pager-btn--next is-locked" id="acdLockedNextBtn" data-reader-tab="exam">
            <span class="acd-pager-dir">🔒 Modul ${fmtStep(adj.next)} Terkunci</span>
            <span class="acd-pager-title">Lulus Uji Paham (≥80%) untuk membuka</span>
          </button>`)
      : `<button type="button" class="acd-pager-btn acd-pager-btn--next" id="acdFinishOverviewBtn">
          <span class="acd-pager-dir">Kembali ke Peta Jalur →</span>
          <span class="acd-pager-title">Lihat Progres ${C.LESSONS.length} Modul</span>
        </button>`;

    const pagerHtml = `<nav class="acd-pager" aria-label="Navigasi modul">
      ${adj.prev
        ? `<button type="button" class="acd-pager-btn" data-open-lesson="${esc(adj.prev.id)}">
            <span class="acd-pager-dir">← Sebelumnya · Modul ${fmtStep(adj.prev)}</span>
            <span class="acd-pager-title">${esc(adj.prev.title)}</span>
          </button>`
        : `<div></div>`}
      ${nextPagerBtn}
    </nav>`;

    const readerTabsHtml = `<nav class="acd-reader-tabs" role="tablist" aria-label="Bagian pembelajaran modul">
      <button type="button" role="tab" class="acd-reader-tab ${tab === 'understand' ? 'is-active' : ''}" data-reader-tab="understand" aria-selected="${tab === 'understand' ? 'true' : 'false'}">1. Pahami &amp; Gambar</button>
      <button type="button" role="tab" class="acd-reader-tab ${tab === 'decisions' ? 'is-active' : ''}" data-reader-tab="decisions" aria-selected="${tab === 'decisions' ? 'true' : 'false'}">2. Kasus Abu-Abu</button>
      <button type="button" role="tab" class="acd-reader-tab ${tab === 'cases' ? 'is-active' : ''}" data-reader-tab="cases" aria-selected="${tab === 'cases' ? 'true' : 'false'}">3. Bedah Kasus</button>
      <button type="button" role="tab" class="acd-reader-tab acd-reader-tab--exam ${tab === 'exam' ? 'is-active' : ''}" data-reader-tab="exam" aria-selected="${tab === 'exam' ? 'true' : 'false'}">4. Uji Paham ${isMastered ? '✓' : '🔓'}</button>
      <button type="button" role="tab" class="acd-reader-tab ${tab === 'all' ? 'is-active' : ''}" data-reader-tab="all" aria-selected="${tab === 'all' ? 'true' : 'false'}">Semua</button>
    </nav>`;

    return `<div class="acd-workspace">
      <div id="acdBackdrop" class="acd-backdrop ${state.drawerOpen ? 'is-open' : ''}"></div>
      ${renderSidebar()}
      <main class="acd-reader">
        <article class="acd-article">
          <header class="acd-lesson-header">
            <p class="acd-breadcrumb">${esc(stage ? stage.code : '')} · Modul ${fmtStep(lesson)} dari ${C.LESSONS.length} · ${lesson.readMinutes} menit · ${isMastered ? 'Status: Dikuasai ✓' : 'Status: Wajib Lulus Uji Paham ≥80%'}</p>
            <h1>${esc(lesson.title)}</h1>
            <p class="acd-lesson-summary">${esc(lesson.summary)}</p>
            <div class="acd-lesson-actions">
              <button type="button" class="acd-btn-secondary ${state.bookmarks.includes(String(lesson.id)) ? 'is-saved' : ''}" id="acdToggleBookmarkBtn">
                ${state.bookmarks.includes(String(lesson.id)) ? '★ Tersimpan' : '☆ Simpan Modul'}
              </button>
              <button type="button" class="acd-btn-primary" id="acdAskAmyBtn">
                Tanya Amy Tentang Modul Ini
              </button>
            </div>
          </header>

          ${renderDiagramCard(lesson)}
          ${readerTabsHtml}

          ${sectionUnderstand}
          ${sectionDecisions}
          ${sectionCases}
          ${sectionExam}

          ${pagerHtml}
        </article>
      </main>
    </div>`;
  }

  function render() {
    const mount = document.getElementById('acdApp');
    if (!mount) return;
    updateHeaderProgress();
    const mainHtml = state.view === 'lesson' ? renderLessonWorkspace() : renderOverview();
    mount.innerHTML = `${mainHtml}${renderLockModal()}${renderPlacementModal()}`;
    bindViewEvents();
    if (state.view === 'lesson') {
      const activeNav = mount.querySelector('#acdSidebar .acd-nav-item.is-active');
      if (activeNav && typeof activeNav.scrollIntoView === 'function') {
        activeNav.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function bindViewEvents() {
    const mount = document.getElementById('acdApp');
    if (!mount) return;

    const searchInput = document.getElementById('acdSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.searchQuery = e.target.value;
        const pos = searchInput.selectionStart;
        render();
        const nextInput = document.getElementById('acdSearchInput');
        if (nextInput) {
          nextInput.focus();
          if (typeof pos === 'number') nextInput.setSelectionRange(pos, pos);
        }
      });
    }

    const resetBtn = document.getElementById('acdResetFilterBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.filterMode = 'all';
        state.searchQuery = '';
        render();
      });
    }

    const overviewBtn = document.getElementById('acdOverviewBtn');
    if (overviewBtn) overviewBtn.addEventListener('click', () => openOverview());

    const finishOverviewBtn = document.getElementById('acdFinishOverviewBtn');
    if (finishOverviewBtn) finishOverviewBtn.addEventListener('click', () => openOverview());

    const drawerCloseBtn = document.getElementById('acdDrawerCloseBtn');
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', () => setDrawerOpen(false));

    const backdrop = document.getElementById('acdBackdrop');
    if (backdrop) backdrop.addEventListener('click', () => setDrawerOpen(false));

    // Lock modal controls
    const closeLockBtn = document.getElementById('acdCloseLockModalBtn');
    if (closeLockBtn) closeLockBtn.addEventListener('click', () => closeModals());
    const lockBackdrop = document.getElementById('acdLockModalBackdrop');
    if (lockBackdrop) {
      lockBackdrop.addEventListener('click', e => {
        if (e.target === lockBackdrop) closeModals();
      });
    }

    // Placement test modal controls
    const openPlaceBtn = document.getElementById('acdOpenPlacementBtn');
    if (openPlaceBtn) {
      openPlaceBtn.addEventListener('click', () => {
        state.placementModalOpen = true;
        state.placementAnswers = {};
        state.placementResult = null;
        document.body.style.overflow = 'hidden';
        render();
      });
    }

    const closePlaceBtn = document.getElementById('acdClosePlacementBtn');
    if (closePlaceBtn) closePlaceBtn.addEventListener('click', () => closeModals());
    const closePlaceTopBtn = document.getElementById('acdClosePlacementTopBtn');
    if (closePlaceTopBtn) closePlaceTopBtn.addEventListener('click', () => closeModals());
    const placeBackdrop = document.getElementById('acdPlacementBackdrop');
    if (placeBackdrop) {
      placeBackdrop.addEventListener('click', e => {
        if (e.target === placeBackdrop) closeModals();
      });
    }

    mount.querySelectorAll('[data-place-q]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.placementResult) return;
        const qIdx = Number(btn.getAttribute('data-place-q'));
        const optIdx = Number(btn.getAttribute('data-place-opt'));
        state.placementAnswers[qIdx] = optIdx;
        render();
      });
    });

    const submitPlaceBtn = document.getElementById('acdSubmitPlacementBtn');
    if (submitPlaceBtn) {
      submitPlaceBtn.addEventListener('click', () => {
        const res = C.evaluatePlacementAttempt(state.progress, state.placementAnswers);
        state.placementResult = res;
        if (res.passed) {
          state.progress = res.nextProgress;
          saveProgress();
        }
        render();
      });
    }

    const retryPlaceBtn = document.getElementById('acdRetryPlacementBtn');
    if (retryPlaceBtn) {
      retryPlaceBtn.addEventListener('click', () => {
        state.placementAnswers = {};
        state.placementResult = null;
        render();
      });
    }

    const toggleBookmarkBtn = document.getElementById('acdToggleBookmarkBtn');
    if (toggleBookmarkBtn) {
      toggleBookmarkBtn.addEventListener('click', () => {
        if (!state.activeLessonId) return;
        toggleBookmark(state.activeLessonId);
        render();
      });
    }

    mount.querySelectorAll('[data-toggle-bookmark]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.getAttribute('data-toggle-bookmark');
        if (id) {
          toggleBookmark(id);
          render();
        }
      });
    });

    const askAmyBtn = document.getElementById('acdAskAmyBtn');
    if (askAmyBtn) {
      askAmyBtn.addEventListener('click', () => {
        const lesson = C.getLessonById(state.activeLessonId);
        const prompt = C.buildAmyPromptForLesson(lesson);
        if (root.AmyLocalAssistant && typeof root.AmyLocalAssistant.openWithPrompt === 'function') {
          root.AmyLocalAssistant.openWithPrompt(prompt);
        } else {
          root.dispatchEvent(new CustomEvent('amyfx:open-mentor'));
        }
      });
    }

    const retryQuizBtn = document.getElementById('acdRetryQuizBtn');
    if (retryQuizBtn) {
      retryQuizBtn.addEventListener('click', () => {
        if (!state.activeLessonId) return;
        delete state.quizAnswers[state.activeLessonId];
        render();
      });
    }

    mount.querySelectorAll('[data-filter-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filterMode = btn.getAttribute('data-filter-mode') || 'all';
        render();
      });
    });

    mount.querySelectorAll('[data-reader-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextTab = btn.getAttribute('data-reader-tab') || 'understand';
        state.readerTab = nextTab;
        render();
        const tabBar = document.querySelector('.acd-reader-tabs');
        if (tabBar && typeof tabBar.scrollIntoView === 'function') {
          tabBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });

    mount.querySelectorAll('[data-open-lesson]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-open-lesson');
        if (id) openLesson(id);
      });
    });

    mount.querySelectorAll('[data-diagram-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextIdx = Number(btn.getAttribute('data-diagram-stage')) || 0;
        const lesson = C.getLessonById(state.activeLessonId);
        if (!lesson) return;
        state.diagramStageIndex = nextIdx;
        const rendered = D.renderDiagramSVG(lesson.diagramId, nextIdx);
        const canvas = document.getElementById('acdDiagramCanvas');
        const caption = document.getElementById('acdDiagramCaption');
        if (canvas) canvas.innerHTML = rendered.svg;
        if (caption) caption.innerHTML = `<strong>Catatan Chart:</strong> ${esc(rendered.caption)}`;
        mount.querySelectorAll('[data-diagram-stage]').forEach(b => {
          const isAct = Number(b.getAttribute('data-diagram-stage')) === rendered.activeIndex;
          b.classList.toggle('is-active', isAct);
          b.setAttribute('aria-pressed', isAct ? 'true' : 'false');
        });
      });
    });

    mount.querySelectorAll('[data-quiz-q]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lesson = C.getLessonById(state.activeLessonId);
        if (!lesson) return;
        const qIdx = Number(btn.getAttribute('data-quiz-q'));
        const optIdx = Number(btn.getAttribute('data-quiz-opt'));
        if (!state.quizAnswers[lesson.id]) state.quizAnswers[lesson.id] = {};
        if (state.quizAnswers[lesson.id][qIdx] !== undefined) return;
        state.quizAnswers[lesson.id][qIdx] = optIdx;

        const answers = state.quizAnswers[lesson.id];
        if (Object.keys(answers).length === lesson.quiz.length) {
          const correct = lesson.quiz.reduce((acc, q, i) => (answers[i] === q.answerIndex ? acc + 1 : acc), 0);
          const wasMastered = C.isLessonMastered(state.progress, lesson.id);
          state.progress = C.recordQuizAttempt(state.progress, lesson.id, correct, lesson.quiz.length);
          saveProgress();
          const nowMastered = C.isLessonMastered(state.progress, lesson.id);
          if (!wasMastered && nowMastered) {
            const adj = C.getAdjacentLessons(lesson.id);
            state.justUnlockedLessonId = adj.next ? adj.next.id : null;
          }
        }
        render();
      });
    });

    // Interactive Mini Risk/Lot Calculator (Modul 03)
    const riskLabEl = document.getElementById('acdMiniRiskLab');
    if (riskLabEl && typeof C.calculateBeginnerRiskLot === 'function') {
      const balInput = document.getElementById('acdRiskBalance');
      const pctInput = document.getElementById('acdRiskPct');
      const slInput = document.getElementById('acdRiskSl');
      const outLot = document.getElementById('acdRiskOutLot');
      const outUsd = document.getElementById('acdRiskOutUsd');
      const outPips = document.getElementById('acdRiskOutPips');
      const outStatus = document.getElementById('acdRiskOutStatus');

      const syncRiskOutputs = () => {
        state.riskLab.balanceUsd = Math.max(10, Number(balInput?.value) || 100);
        state.riskLab.riskPct = Math.max(0.1, Math.min(20, Number(pctInput?.value) || 1));
        state.riskLab.slPoints = Math.max(0.5, Number(slInput?.value) || 5);
        const calc = C.calculateBeginnerRiskLot(state.riskLab);
        if (outLot) outLot.textContent = `${calc.recommendedLot.toFixed(2)} ${calc.accountType === 'cent' ? 'Cent Lot' : 'Lot'}`;
        if (outUsd) outUsd.textContent = `$${calc.actualRiskUsd.toFixed(2)} (~Rp${calc.riskIdr.toLocaleString('id-ID')})`;
        if (outPips) outPips.textContent = `${calc.slPips} pips ($${calc.slPoints.toFixed(1)})`;
        if (outStatus) {
          outStatus.className = `acd-risk-status is-${calc.safetyLevel}`;
          outStatus.textContent = `${calc.safetyLabel}${calc.needsCentHint ? ' · Modal ini terlalu kecil untuk 0.01 Standard — disarankan pakai Akun Cent.' : ''}`;
        }
      };

      [balInput, pctInput, slInput].forEach(inp => {
        if (inp) inp.addEventListener('input', syncRiskOutputs);
      });

      riskLabEl.querySelectorAll('[data-risk-acct]').forEach(btn => {
        btn.addEventListener('click', () => {
          const acct = btn.getAttribute('data-risk-acct') === 'standard' ? 'standard' : 'cent';
          state.riskLab.accountType = acct;
          riskLabEl.querySelectorAll('[data-risk-acct]').forEach(b => {
            b.classList.toggle('is-active', b.getAttribute('data-risk-acct') === acct);
          });
          syncRiskOutputs();
        });
      });

      riskLabEl.querySelectorAll('[data-risk-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = Number(btn.getAttribute('data-risk-preset')) || 1;
          if (pctInput) pctInput.value = String(p);
          syncRiskOutputs();
        });
      });
    }
  }

  function init() {
    loadProgress();

    const brandBtn = document.getElementById('acdBrandBtn');
    if (brandBtn) brandBtn.addEventListener('click', () => openOverview());

    const menuBtn = document.getElementById('acdMenuToggleBtn');
    if (menuBtn) menuBtn.addEventListener('click', () => setDrawerOpen(!state.drawerOpen));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (state.lockModal || state.placementModalOpen) closeModals();
        else if (state.drawerOpen) setDrawerOpen(false);
      }
    });

    root.addEventListener('popstate', () => {
      const id = readLessonFromUrl();
      if (id) openLesson(id, { skipUrl: true });
      else openOverview({ skipUrl: true });
    });

    const initialLesson = readLessonFromUrl();
    if (initialLesson) {
      openLesson(initialLesson, { skipUrl: true, skipScroll: true });
    } else {
      render();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
