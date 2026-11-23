/* Amy FX Academy — Interactive Browser Application Controller
 * Handles Overview, Level Filter & Search, Two-Zone Reader, Interactive SVG Diagrams,
 * 3-Question Diagnostic Quiz, localStorage Persistence, URL Deep-Linking, Mobile Drawer, and Tanya Amy.
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
    filterLevel: 'all',
    searchQuery: '',
    track: 'beginner', // 'beginner' | 'ict'
    level0ExpandedOverride: false,
    diagramStageIndex: 0,
    quizAnswers: {}, // { [lessonId]: { [qIndex]: selectedOptionIndex } }
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

  function fmtNum(lesson) {
    return typeof C.formatLessonNumber === 'function'
      ? C.formatLessonNumber(lesson)
      : String(lesson ? lesson.number : '').padStart(2, '0');
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
    try {
      const tRaw = root.localStorage.getItem(C.TRACK_STORAGE_KEY || 'amy_academy_track_v1');
      const normTrack = typeof C.normalizeTrack === 'function' ? C.normalizeTrack(tRaw) : null;
      state.track = normTrack || 'beginner';
    } catch {
      state.track = 'beginner';
    }
  }

  function saveTrack() {
    try {
      root.localStorage.setItem(C.TRACK_STORAGE_KEY || 'amy_academy_track_v1', state.track);
    } catch {
      // Ignore storage quota errors
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

  function openLesson(lessonId, opts) {
    const lesson = C.getLessonById(lessonId);
    if (!lesson) return;
    const options = opts || {};
    state.view = 'lesson';
    state.activeLessonId = lesson.id;
    state.diagramStageIndex = 0;
    state.drawerOpen = false;

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

  function renderOverview() {
    const stats = C.computeProgressStats(state.progress);
    const completedSet = new Set(state.progress.completedIds);
    const bookmarkSet = new Set(state.bookmarks);
    const isBookmarksFilter = state.filterLevel === 'saved';

    const baseFiltered = C.filterLessons({
      levelId: isBookmarksFilter ? 'all' : state.filterLevel,
      query: state.searchQuery,
      completedIds: state.progress.completedIds
    });
    const filtered = isBookmarksFilter
      ? baseFiltered.filter(l => bookmarkSet.has(String(l.id)))
      : baseFiltered;

    const lastOpenedLesson = state.progress.lastLessonId ? C.getLessonById(state.progress.lastLessonId) : null;
    const recommendedByTrack = typeof C.getRecommendedLessonForTrack === 'function'
      ? C.getRecommendedLessonForTrack(state.progress, state.track)
      : (stats.nextRecommendedLesson || C.LESSONS[0]);
    const useLastOpened = Boolean(
      lastOpenedLesson && (state.track !== 'ict' || lastOpenedLesson.levelId >= 1)
    );
    const primaryLesson = useLastOpened ? lastOpenedLesson : (recommendedByTrack || C.LESSONS[0]);
    const primaryNum = fmtNum(primaryLesson);
    const primaryCtaLabel = useLastOpened
      ? `Lanjut Baca · Bab ${primaryNum}`
      : stats.completedCount > 0
        ? `Lanjutkan · Bab ${primaryNum}`
        : state.track === 'ict'
          ? `Mulai Level 01 · Bab ${primaryNum}`
          : `Mulai Level 0 · Bab ${primaryNum}`;

    const levelTabsHtml = [
      `<button type="button" class="acd-tab-btn ${state.filterLevel === 'all' ? 'is-active' : ''}" data-filter-level="all">Semua (${C.LESSONS.length})</button>`,
      `<button type="button" class="acd-tab-btn ${isBookmarksFilter ? 'is-active' : ''}" data-filter-level="saved">Tersimpan (${state.bookmarks.length})</button>`,
      ...C.LEVELS.map(lvl => {
        const active = String(state.filterLevel) === String(lvl.id);
        const label = `Lv ${lvl.id}`;
        return `<button type="button" class="acd-tab-btn ${active ? 'is-active' : ''} ${lvl.id === 0 ? 'acd-tab-btn--zero' : ''}" data-filter-level="${lvl.id}">${label}</button>`;
      })
    ].join('');

    const groupedHtml = C.LEVELS.map(level => {
      const items = filtered.filter(l => l.levelId === level.id);
      if (items.length === 0) return '';
      const lvlStat = stats.byLevel.find(b => b.levelId === level.id);
      const lvlPct = lvlStat && lvlStat.total ? Math.round((lvlStat.completed / lvlStat.total) * 100) : 0;

      const collapseLevel0 = (
        level.id === 0 &&
        state.track === 'ict' &&
        state.filterLevel === 'all' &&
        !state.searchQuery.trim() &&
        !state.level0ExpandedOverride
      );

      if (collapseLevel0) {
        return `<section class="acd-level-section acd-level-section--collapsed" aria-labelledby="lvl-heading-0">
          <div class="acd-level-collapsed-row">
            <div class="acd-level-collapsed-copy">
              <span class="acd-level-code">${esc(level.code)} · Opsional</span>
              <h2 id="lvl-heading-0">${esc(level.title)}</h2>
              <p class="acd-level-collapsed-note">Dilewati karena kamu memilih jalur ICT (${lvlStat ? `${lvlStat.completed}/${lvlStat.total}` : '0/6'} selesai).</p>
            </div>
            <button type="button" class="acd-btn-secondary" id="acdExpandLevel0Btn">Tampilkan 6 Bab Dasar</button>
          </div>
        </section>`;
      }

      const rowsHtml = items.map(lesson => {
        const isDone = completedSet.has(lesson.id);
        const isSaved = bookmarkSet.has(String(lesson.id));
        const quizRec = state.progress.quizScores[lesson.id];
        const numStr = fmtNum(lesson);
        const quizTag = quizRec
          ? `<span class="acd-quiz-tag">Kuis ${quizRec.correct}/${quizRec.total}</span>`
          : `<span>${lesson.readMinutes} mnt</span>`;

        return `<div class="acd-lesson-row-wrap ${isDone ? 'is-done' : ''}">
          <button type="button" class="acd-lesson-row ${isDone ? 'is-done' : ''}" data-open-lesson="${esc(lesson.id)}">
            <span class="acd-lesson-num" aria-hidden="true">${isDone ? '✓' : numStr}</span>
            <div class="acd-lesson-copy">
              <p class="acd-lesson-row-title">${numStr}. ${esc(lesson.title)}</p>
              <p class="acd-lesson-row-meta">${esc(lesson.summary)}</p>
            </div>
            <span class="acd-lesson-row-right">${quizTag} <span aria-hidden="true">›</span></span>
          </button>
          <button type="button" class="acd-bookmark-icon-btn ${isSaved ? 'is-saved' : ''}" data-toggle-bookmark="${esc(lesson.id)}" aria-label="${isSaved ? 'Hapus bookmark' : 'Simpan ke favorit'}" aria-pressed="${isSaved ? 'true' : 'false'}" title="${isSaved ? 'Tersimpan' : 'Simpan bab'}">${isSaved ? '★' : '☆'}</button>
        </div>`;
      }).join('');

      return `<section class="acd-level-section ${level.id === 0 ? 'acd-level-section--zero' : ''}" aria-labelledby="lvl-heading-${level.id}">
        <div class="acd-level-head">
          <div class="acd-level-head-top">
            <div>
              <span class="acd-level-code">${esc(level.code)}${level.id === 0 ? ' · Mulai Dari Nol' : ''}</span>
              <h2 id="lvl-heading-${level.id}">${esc(level.title)} <button type="button" class="amy-info-btn" data-info-tip="${esc(level.tagline)}" aria-label="Info ${esc(level.code)}" aria-expanded="false">i</button></h2>
            </div>
            <span class="acd-level-progress acd-nums">${lvlStat ? `${lvlStat.completed}/${lvlStat.total}` : ''}</span>
          </div>
          <div class="acd-level-bar" aria-hidden="true"><span style="width:${lvlPct}%"></span></div>
        </div>
        <div class="acd-lesson-list">${rowsHtml}</div>
      </section>`;
    }).filter(Boolean).join('');

    const emptyMsg = isBookmarksFilter && !state.searchQuery
      ? 'Belum ada bab favorit tersimpan. Ketuk ikon bintang (☆) di bab mana saja untuk menandainya.'
      : `Tidak ada pelajaran yang cocok dengan "${esc(state.searchQuery)}".`;
    const emptyHtml = `<div class="acd-empty-state">
      <p style="margin:0 0 12px; font-weight:700; color:var(--acd-ink);">${emptyMsg}</p>
      <button type="button" class="acd-btn-secondary" id="acdResetFilterBtn">Tampilkan Semua Bab</button>
    </div>`;

    const trackSelectorHtml = `<section class="acd-track-card" aria-label="Pilih jalur belajar sesuai pengalaman">
      <div class="acd-track-head">
        <span class="acd-track-kicker">Titik Mulai</span>
        <span class="acd-track-hint">Bisa diganti kapan saja</span>
      </div>
      <div class="acd-track-grid" role="group" aria-label="Jalur kurikulum">
        <button type="button" class="acd-track-option ${state.track === 'beginner' ? 'is-active' : ''}" data-select-track="beginner" aria-pressed="${state.track === 'beginner' ? 'true' : 'false'}">
          <span class="acd-track-badge">Level 0</span>
          <strong class="acd-track-title">Pemula Nol</strong>
          <span class="acd-track-desc">Broker, lot, order MT5 &amp; baca chart.</span>
        </button>
        <button type="button" class="acd-track-option ${state.track === 'ict' ? 'is-active' : ''}" data-select-track="ict" aria-pressed="${state.track === 'ict' ? 'true' : 'false'}">
          <span class="acd-track-badge">Level 1–6</span>
          <strong class="acd-track-title">Langsung ICT</strong>
          <span class="acd-track-desc">Likuiditas, FVG, OB &amp; Killzone XAU.</span>
        </button>
      </div>
    </section>`;

    const readinessHtml = (
      typeof C.evaluateLevel0Readiness === 'function' &&
      (state.track === 'beginner' || String(state.filterLevel) === '0') &&
      !state.searchQuery.trim()
    ) ? (() => {
      const r = C.evaluateLevel0Readiness(state.progress);
      const chipsHtml = r.items.map(item => `
        <button type="button" class="acd-ready-item ${item.done ? 'is-done' : ''}" data-open-lesson="${esc(item.id)}" title="${esc(item.title)}">
          <span class="acd-ready-check" aria-hidden="true">${item.done ? '✓' : esc(item.code)}</span>
          <span class="acd-ready-title">${esc(item.title)}</span>
          ${item.quizScore ? `<span class="acd-ready-quiz acd-nums">${esc(item.quizScore)}</span>` : ''}
        </button>
      `).join('');
      const ctaTarget = r.readyForIct
        ? 'logika-trading-probabilitas'
        : (r.nextLesson ? r.nextLesson.id : 'kenal-trading-broker-akun');
      const ctaLabel = r.readyForIct
        ? 'Siap Naik ke Level 01 ICT →'
        : `Lanjut Fondasi ${esc(r.nextLesson ? r.nextLesson.code : '0.1')} →`;
      return `<section id="acdReadinessCard" class="acd-readiness-card ${r.readyForIct ? 'is-ready' : ''}" aria-label="Checklist Kesiapan Naik ke Level ICT">
        <div class="acd-readiness-head">
          <div>
            <span class="acd-track-kicker">Checklist Kesiapan ICT</span>
            <h2 class="acd-readiness-title">${r.readyForIct ? 'Fondasi Level 0 Tuntas — Siap Naik ke ICT' : `${r.completed} / ${r.total} Fondasi Pemula Tuntas`}</h2>
          </div>
          <span class="acd-readiness-pct acd-nums">${r.percent}%${r.avgQuizAccuracy != null ? ` · Kuis ${r.avgQuizAccuracy}%` : ''}</span>
        </div>
        <div class="acd-level-bar" aria-hidden="true"><span style="width:${r.percent}%"></span></div>
        <div class="acd-ready-grid">${chipsHtml}</div>
        <div class="acd-readiness-foot">
          <span class="acd-readiness-hint">${r.readyForIct ? 'Semua 6 fondasi selesai. Lanjutkan ke konsep likuiditas & struktur ICT.' : 'Tuntaskan 6 bab dasar atau lulus kuis (≥2/3) sebelum masuk ke Level 1 ICT.'}</span>
          <button type="button" class="acd-btn-secondary acd-ready-cta" data-open-lesson="${esc(ctaTarget)}">${ctaLabel}</button>
        </div>
      </section>`;
    })() : '';

    return `<div class="acd-overview">
      <section class="acd-hero" aria-label="Ringkasan Kurikulum">
        <div>
          <p class="acd-hero-kicker">${C.LEVELS.length} Level · ${C.LESSONS.length} Pelajaran · XAU/USD</p>
          <h1>Zero to Scalper Academy <button type="button" class="amy-info-btn" data-info-tip="7 Level terstruktur berisi 36 pelajaran inti: Level 0 Pra-Trading & Dasar MT5 untuk pemula nol, dilanjutkan Level 1–6 ICT XAU/USD hingga protokol 100 sample." aria-label="Info kurikulum" aria-expanded="false">i</button></h1>
          ${lastOpenedLesson ? `<p class="acd-hero-resume-meta">Terakhir dibaca: <strong>${fmtNum(lastOpenedLesson)}. ${esc(lastOpenedLesson.title)}</strong></p>` : ''}
        </div>
        <div class="acd-hero-right">
          <div class="acd-hero-stats">
            <div class="acd-hero-stats-row">
              <span>Progres Belajar</span>
              <strong class="acd-nums">${stats.completedCount} / ${stats.totalLessons} · ${stats.percent}%</strong>
            </div>
            <div class="acd-progress-bar-lg" role="progressbar" aria-valuenow="${stats.percent}" aria-valuemin="0" aria-valuemax="100">
              <span style="width:${stats.percent}%"></span>
            </div>
          </div>
          <button type="button" class="acd-btn-primary" data-open-lesson="${esc(primaryLesson.id)}">${esc(primaryCtaLabel)} →</button>
        </div>
      </section>

      ${trackSelectorHtml}
      ${readinessHtml}

      <div class="acd-toolbar" role="search">
        <div class="acd-level-tabs" role="tablist" aria-label="Filter level kurikulum">
          ${levelTabsHtml}
        </div>
        <div class="acd-search-wrap">
          <svg class="acd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="acdSearchInput" class="acd-search-input" type="search" placeholder="Cari topik (mis. Lot, MT5, Bid, IFVG, Killzone)..." value="${esc(state.searchQuery)}" autocomplete="off" aria-label="Cari materi pelajaran">
        </div>
      </div>

      <div class="acd-levels-stack">
        ${groupedHtml || emptyHtml}
      </div>
    </div>`;
  }

  function renderSidebar() {
    const completedSet = new Set(state.progress.completedIds);

    const groupsHtml = C.LEVELS.map(level => {
      const items = C.getLessonsByLevel(level.id);
      const done = items.filter(l => completedSet.has(l.id)).length;
      const itemsHtml = items.map(lesson => {
        const active = lesson.id === state.activeLessonId;
        const isDone = completedSet.has(lesson.id);
        const numStr = fmtNum(lesson);
        return `<button type="button" class="acd-nav-item ${active ? 'is-active' : ''} ${isDone ? 'is-done' : ''}" data-open-lesson="${esc(lesson.id)}" ${active ? 'aria-current="page"' : ''}>
          <span class="acd-nav-num">${isDone ? '✓' : numStr}</span>
          <span>${esc(lesson.title)}</span>
        </button>`;
      }).join('');

      return `<div class="acd-sidebar-group">
        <div class="acd-sidebar-group-title">
          <span>${esc(level.code)} · ${esc(level.title.split('&')[0].trim())}</span>
          <span class="acd-nums">${done}/${items.length}</span>
        </div>
        ${itemsHtml}
      </div>`;
    }).join('');

    return `<aside id="acdSidebar" class="acd-sidebar ${state.drawerOpen ? 'is-open' : ''}" aria-label="Daftar kurikulum ${C.LESSONS.length} pelajaran">
      <div class="acd-sidebar-top">
        <button type="button" class="acd-sidebar-overview-btn" id="acdOverviewBtn">← Semua Level</button>
        <button type="button" class="acd-drawer-close" id="acdDrawerCloseBtn" aria-label="Tutup daftar pelajaran">×</button>
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

  function renderQuizSection(lesson) {
    const answers = state.quizAnswers[lesson.id] || {};
    const total = lesson.quiz.length;
    const answeredKeys = Object.keys(answers);
    const allAnswered = answeredKeys.length === total;
    const currentCorrect = lesson.quiz.reduce((acc, q, idx) => (
      answers[idx] === q.answerIndex ? acc + 1 : acc
    ), 0);

    const savedRec = state.progress.quizScores[lesson.id];
    const scoreBadge = allAnswered
      ? `Skor: ${currentCorrect}/${total}`
      : savedRec
        ? `Skor Terbaik: ${savedRec.correct}/${savedRec.total}`
        : `0/${total} dijawab`;

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
          <span>${esc(opt)}</span>
        </button>`;
      }).join('');

      const feedbackHtml = hasAnswered
        ? `<div class="acd-quiz-feedback ${isRight ? 'is-correct' : 'is-wrong'}" role="status">
            <strong>${isRight ? '✓ Benar' : '✕ Kurang Tepat'}</strong> — ${esc(q.explanation)}
          </div>`
        : '';

      return `<div class="acd-quiz-q">
        <p class="acd-quiz-q-title">${qIdx + 1}. ${esc(q.question)}</p>
        <div class="acd-quiz-options">${optsHtml}</div>
        ${feedbackHtml}
      </div>`;
    }).join('');

    const passed = currentCorrect >= Math.ceil(total * 0.67);
    const summaryHtml = allAnswered
      ? `<div class="acd-quiz-summary" role="status">
          <div>
            <strong>${passed ? '✓ Lulus Pelajaran' : 'Belum Lulus (Minimal 2/3 Benar)'}</strong>
            <span style="color:var(--acd-muted); margin-left:8px;">Hasil: <span class="acd-nums">${currentCorrect}/${total}</span>${passed ? ' · Progres tersimpan otomatis.' : ' · Pelajari ulang lalu coba lagi.'}</span>
          </div>
          <button type="button" class="acd-btn-secondary" id="acdRetryQuizBtn">Ulangi Kuis</button>
        </div>`
      : '';

    return `<section class="acd-quiz-card" aria-labelledby="acdQuizHeading">
      <div class="acd-quiz-head">
        <h2 id="acdQuizHeading">Kuis Diagnostik (3 Soal)</h2>
        <span class="acd-quiz-score">${esc(scoreBadge)}</span>
      </div>
      ${questionsHtml}
      ${summaryHtml}
    </section>`;
  }

  function renderLessonWorkspace() {
    const lesson = C.getLessonById(state.activeLessonId);
    if (!lesson) return renderOverview();

    const level = C.getLevelById(lesson.levelId);
    const isDone = state.progress.completedIds.includes(lesson.id);
    const adj = C.getAdjacentLessons(lesson.id);

    const conceptsHtml = (lesson.conceptBlocks || []).map(b => `
      <div class="acd-concept-block">
        <h2>${esc(b.heading)}</h2>
        ${(b.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join('')}
      </div>
    `).join('');

    const validList = (lesson.validRules || []).map(r => `<li>${esc(r)}</li>`).join('');
    const invalidList = (lesson.invalidRules || []).map(r => `<li>${esc(r)}</li>`).join('');
    const scenarioSteps = (lesson.xauScenario?.steps || []).map(s => `<li>${esc(s)}</li>`).join('');
    const goldenItems = (lesson.goldenRules || []).map(g => `<li>${esc(g)}</li>`).join('');

    const isLevel0 = lesson.levelId === 0;
    const compareKicker = isLevel0
      ? '02 · Kebiasaan Aman vs Kesalahan Pemula'
      : '02 · Filter Eksekusi Valid vs Invalid';
    const validHeading = isLevel0 ? 'Kebiasaan Aman Pemula' : 'Syarat Valid (A+)';
    const invalidHeading = isLevel0 ? 'Kesalahan Fatal Pemula' : 'Invalid / Jebakan';

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

    const level0BridgeHtml = lesson.id === 'dasar-tren-sr-rencana-14-hari'
      ? `<section class="acd-graduation-card" aria-label="Jembatan menuju Level 01 ICT">
          <h2>Fondasi Level 0 Selesai — Siap Masuk Level 01 ICT!</h2>
          <p>Kamu sudah memahami broker, akun Cent, Bid/Ask, hitung lot Gold, 5 order MT5, candlestick dasar, dan peta latihan 14 hari. Sekarang saatnya melangkah ke Level 01 untuk mempelajari cara kerja pasar XAU/USD secara lebih mendalam.</p>
          <div class="acd-graduation-links">
            <button type="button" class="acd-btn-primary" data-open-lesson="logika-trading-probabilitas">Lanjut ke Level 01 · Bab 01 →</button>
            <a class="acd-btn-secondary" href="trading-practice/index.html">Buka Lab Backtest &amp; Latihan</a>
          </div>
        </section>`
      : '';

    const graduationHtml = !adj.next
      ? `<section class="acd-graduation-card" aria-label="Langkah eksekusi setelah lulus">
          <h2>Siap Eksekusi Protokol 100 Sample XAU/USD</h2>
          <p>Kamu telah mencapai bab terakhir Kurikulum Zero to Scalper. Terapkan peta Killzone &amp; 4 Model Entry langsung di Cockpit Mapping lalu catat disiplin R:R setiap eksekusi di Jurnal Trading.</p>
          <div class="acd-graduation-links">
            <a class="acd-btn-primary" href="../mapping/index.html">Buka Cockpit Mapping →</a>
            <a class="acd-btn-secondary" href="../journal/index.html">Buka Jurnal &amp; Analitik Pro</a>
          </div>
        </section>`
      : '';

    const pagerHtml = `<nav class="acd-pager" aria-label="Navigasi pelajaran">
      ${adj.prev
        ? `<button type="button" class="acd-pager-btn" data-open-lesson="${esc(adj.prev.id)}">
            <span class="acd-pager-dir">← Sebelumnya · Bab ${fmtNum(adj.prev)}</span>
            <span class="acd-pager-title">${esc(adj.prev.title)}</span>
          </button>`
        : `<div></div>`}
      ${adj.next
        ? `<button type="button" class="acd-pager-btn acd-pager-btn--next" data-open-lesson="${esc(adj.next.id)}">
            <span class="acd-pager-dir">Berikutnya · Bab ${fmtNum(adj.next)} →</span>
            <span class="acd-pager-title">${esc(adj.next.title)}</span>
          </button>`
        : `<button type="button" class="acd-pager-btn acd-pager-btn--next" id="acdFinishOverviewBtn">
            <span class="acd-pager-dir">Selesai Kurikulum →</span>
            <span class="acd-pager-title">Kembali ke Ringkasan ${C.LEVELS.length} Level</span>
          </button>`}
    </nav>`;

    return `<div class="acd-workspace">
      <div id="acdBackdrop" class="acd-backdrop ${state.drawerOpen ? 'is-open' : ''}"></div>
      ${renderSidebar()}
      <main class="acd-reader">
        <article class="acd-article">
          <header class="acd-lesson-header">
            <p class="acd-breadcrumb">${esc(level ? level.code : `Level ${lesson.levelId}`)} · Bab ${fmtNum(lesson)} (${adj.index + 1} dari ${C.LESSONS.length}) · ${lesson.readMinutes} menit baca</p>
            <h1>${esc(lesson.title)}</h1>
            <p class="acd-lesson-summary">${esc(lesson.summary)}</p>
            <div class="acd-lesson-actions">
              <button type="button" class="acd-btn-secondary ${isDone ? 'is-done' : ''}" id="acdToggleCompleteBtn">
                ${isDone ? '✓ Selesai Dipelajari' : 'Tandai Selesai'}
              </button>
              <button type="button" class="acd-btn-secondary ${state.bookmarks.includes(String(lesson.id)) ? 'is-saved' : ''}" id="acdToggleBookmarkBtn">
                ${state.bookmarks.includes(String(lesson.id)) ? '★ Tersimpan' : '☆ Simpan Bab'}
              </button>
              <button type="button" class="acd-btn-primary" id="acdAskAmyBtn">
                ✦ Tanya Amy Tentang Bab Ini
              </button>
            </div>
          </header>

          ${renderDiagramCard(lesson)}

          <section class="acd-section" aria-label="Konsep inti">
            <p class="acd-section-kicker">01 · Konsep Inti</p>
            ${conceptsHtml}
          </section>

          <section class="acd-section" aria-label="Perbandingan syarat valid dan invalid">
            <p class="acd-section-kicker">${compareKicker}</p>
            <div class="acd-compare-grid">
              <div class="acd-compare-card acd-compare-card--valid">
                <h3><span aria-hidden="true">✓</span> ${validHeading}</h3>
                <ul class="acd-rule-list">${validList}</ul>
              </div>
              <div class="acd-compare-card acd-compare-card--invalid">
                <h3><span aria-hidden="true">✕</span> ${invalidHeading}</h3>
                <ul class="acd-rule-list">${invalidList}</ul>
              </div>
            </div>
          </section>

          <section class="acd-section" aria-label="Skenario XAU/USD dan aturan emas">
            <p class="acd-section-kicker">03 · Contoh Skenario XAU/USD &amp; Aturan Emas</p>
            <div class="acd-scenario-card">
              <h3>Studi Kasus XAU/USD (WITA)</h3>
              <p class="acd-scenario-context">${esc(lesson.xauScenario?.context || '')}</p>
              <ol class="acd-step-list">${scenarioSteps}</ol>
            </div>
            <div class="acd-golden-box">
              <h3>Aturan Emas</h3>
              <ul>${goldenItems}</ul>
            </div>
          </section>

          ${lesson.id === 'lot-leverage-margin-equity' && typeof C.calculateBeginnerRiskLot === 'function' ? (() => {
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
          })() : ''}

          ${practiceCtaHtml}
          ${renderQuizSection(lesson)}
          ${level0BridgeHtml}
          ${graduationHtml}
          ${pagerHtml}
        </article>
      </main>
    </div>`;
  }

  function render() {
    const mount = document.getElementById('acdApp');
    if (!mount) return;
    updateHeaderProgress();
    mount.innerHTML = state.view === 'lesson' ? renderLessonWorkspace() : renderOverview();
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
        state.filterLevel = 'all';
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

    const toggleCompleteBtn = document.getElementById('acdToggleCompleteBtn');
    if (toggleCompleteBtn) {
      toggleCompleteBtn.addEventListener('click', () => {
        if (!state.activeLessonId) return;
        state.progress = C.toggleLessonCompleted(state.progress, state.activeLessonId);
        saveProgress();
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

    mount.querySelectorAll('[data-select-track]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextTrack = btn.getAttribute('data-select-track');
        if (nextTrack !== 'beginner' && nextTrack !== 'ict') return;
        state.track = nextTrack;
        state.level0ExpandedOverride = false;
        saveTrack();
        render();
      });
    });

    const expandLevel0Btn = document.getElementById('acdExpandLevel0Btn');
    if (expandLevel0Btn) {
      expandLevel0Btn.addEventListener('click', () => {
        state.level0ExpandedOverride = true;
        render();
      });
    }

    mount.querySelectorAll('[data-filter-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.filterLevel = btn.getAttribute('data-filter-level') || 'all';
        render();
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
          state.progress = C.recordQuizAttempt(state.progress, lesson.id, correct, lesson.quiz.length);
          saveProgress();
        }
        render();
      });
    });

    // Interactive Mini Risk/Lot Calculator (Lesson 0.3)
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
      if (e.key === 'Escape' && state.drawerOpen) setDrawerOpen(false);
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
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
