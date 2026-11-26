/* Amy FX Academy — Interactive 36-Chapter Trading Book & Strict Mastery Locking Reader
 * Features:
 * - Single-Flow Textbook Reader (no fragmented 5-tab chopping)
 * - 6 Book Parts (Bagian I–VI) · 36 Zero-Duplication Chapters (Bab 01–36)
 * - Inline Multi-Stage Interactive SVG Diagrams placed directly inside relevant sub-chapters
 * - Inline Mini Risk & Lot Lab inside Bab 03
 * - Strict Duolingo-Style Locking (>= 80% Uji Paham required to unlock next chapter)
 * - Optional 100% (4/4) Placement Exam to prove Bagian I basics & jump to Bab 07 (Bagian II)
 */
(function (root) {
  'use strict';

  const C = root.AmyAcademyCurriculum;
  const D = root.AmyAcademyDiagrams;
  const G = root.AmyAcademyGlossary || null;
  if (!C || !D) return;

  const BOOKMARKS_KEY = 'amy_academy_bookmarks_v1';

  const state = {
    view: 'overview', // 'overview' | 'lesson'
    activeLessonId: null,
    filterMode: 'all', // 'all' | 'mastered' | 'saved'
    searchQuery: '',
    diagramStageIndex: 0,
    quizAnswers: {}, // { [lessonId]: { [qIndex]: selectedOptionIndex } }
    justUnlockedLessonId: null,
    lockModal: null, // { targetLesson, blockedByLesson, requiredPercent }
    placementModalOpen: false,
    placementAnswers: {},
    placementResult: null,
    glossaryTermId: null,
    glossaryModalOpen: false,
    glossaryQuery: '',
    glossaryCategory: 'all',
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
      .replace(/\*\*((?:(?!\*\*).)+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^\s*](?:[^*\n]*[^\s*])?)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code class="acd-inline-code">$1</code>');
  }

  // Same as fmtRich + auto-link first occurrence of ICT acronyms to instant glossary popovers
  function fmtBookRich(str) {
    const html = fmtRich(str);
    return G && typeof G.annotateTermsHtml === 'function' ? G.annotateTermsHtml(html) : html;
  }

  // Split dense paragraphs into breathable book-like blocks & structured inline numbered lists
  function renderReadableParagraphs(paragraphs) {
    const list = Array.isArray(paragraphs) ? paragraphs : [];
    return list.map(p => {
      const blocks = G && typeof G.splitReadableParagraph === 'function'
        ? G.splitReadableParagraph(p)
        : [{ type: 'p', text: p }];
      return blocks.map(block => {
        if (block.type === 'list' && Array.isArray(block.items)) {
          return `<ol class="acd-book-inline-list">${block.items.map(item => `<li>${fmtBookRich(item)}</li>`).join('')}</ol>`;
        }
        return `<p class="acd-book-p">${fmtBookRich(block.text)}</p>`;
      }).join('');
    }).join('');
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
      state.bookmarks = Array.isArray(parsed)
        ? Array.from(new Set(parsed.map(id => (typeof C.resolveLessonId === 'function' ? C.resolveLessonId(id) : String(id)))))
        : [];
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
    const id = typeof C.resolveLessonId === 'function' ? C.resolveLessonId(lessonId) : String(lessonId);
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
      const rawId = params.get('lesson');
      const resolved = rawId ? C.getLessonById(rawId) : null;
      return resolved ? resolved.id : null;
    } catch {
      return null;
    }
  }

  function closeModals() {
    state.lockModal = null;
    state.placementModalOpen = false;
    state.glossaryTermId = null;
    state.glossaryModalOpen = false;
    document.body.style.overflow = state.drawerOpen ? 'hidden' : '';
    render();
  }

  function openGlossaryTerm(termId) {
    if (!G || !termId) return;
    const found = G.lookupTerm(termId);
    if (!found) return;
    state.glossaryTermId = found.id;
    state.glossaryModalOpen = false;
    document.body.style.overflow = 'hidden';
    render();
  }

  function openGlossaryModal(initialQuery) {
    if (!G) return;
    state.glossaryTermId = null;
    state.glossaryModalOpen = true;
    if (typeof initialQuery === 'string') state.glossaryQuery = initialQuery;
    document.body.style.overflow = 'hidden';
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
    state.justUnlockedLessonId = null;
    state.lockModal = null;
    state.placementModalOpen = false;
    state.glossaryTermId = null;
    state.glossaryModalOpen = false;
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
    state.glossaryTermId = null;
    document.body.style.overflow = state.lockModal || state.placementModalOpen || state.glossaryModalOpen ? 'hidden' : '';
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

    const backLink = document.getElementById('acdBackLink');
    const backLabel = document.getElementById('acdBackLabel');
    if (backLink) {
      const inLesson = state.view === 'lesson';
      backLink.setAttribute('aria-label', inLesson ? 'Kembali ke Daftar Materi Academy' : 'Kembali ke Beranda Amy FX Pro');
      backLink.setAttribute('href', inLesson ? 'index.html' : '../../index.html');
      if (backLabel) backLabel.textContent = inLesson ? 'Daftar Bab' : 'Beranda';
    }
  }

  function renderLockModal() {
    if (!state.lockModal) return '';
    const { targetLesson, blockedByLesson, requiredPercent } = state.lockModal;
    if (!targetLesson) return '';

    const blockerTitle = blockedByLesson
      ? `Bab ${fmtStep(blockedByLesson)} · ${blockedByLesson.title}`
      : 'Bab sebelumnya';

    return `<div class="acd-modal-backdrop" id="acdLockModalBackdrop" role="presentation">
      <div class="acd-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="acdLockModalTitle">
        <div class="acd-modal-icon acd-modal-icon--lock" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 id="acdLockModalTitle" class="acd-modal-title">Bab ${fmtStep(targetLesson)} Masih Terkunci</h2>
        <p class="acd-modal-subtitle">${esc(targetLesson.title)}</p>
        <p class="acd-modal-body">
          Setiap bab disusun berurutan biar pondasinya kuat. Bab baru terbuka otomatis setelah kamu <strong>lulus Uji Paham (minimal ${requiredPercent}% benar)</strong> di bab aktif saat ini:
        </p>
        <div class="acd-modal-prereq">
          <span class="acd-modal-prereq-kicker">Bab Aktif Saat Ini</span>
          <strong>${esc(blockerTitle)}</strong>
        </div>
        <div class="acd-modal-actions">
          ${blockedByLesson ? `<button type="button" class="acd-btn-primary" id="acdGoFrontierBtn" data-open-lesson="${esc(blockedByLesson.id)}">Buka Bab ${fmtStep(blockedByLesson)} Sekarang →</button>` : ''}
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
            <strong>🔓 Lulus 4/4! Bagian I (Bab 01–06) Tuntas (+${C.XP_PLACEMENT_BONUS} XP)</strong>
            <p>Fondasi MT5, Spread &amp; Lot Gold terbukti kuat. Kamu langsung dapat membuka Bab 07 (Bagian II: Struktur Pasar Murni).</p>
            <div class="acd-modal-actions">
              <button type="button" class="acd-btn-primary" id="acdPlacementContinueBtn" data-open-lesson="${esc(res.unlockedLesson?.id || 'struktur-pasar-dasar')}">Buka Bab 07 Sekarang →</button>
              <button type="button" class="acd-btn-secondary" id="acdClosePlacementBtn">Lihat Daftar Isi</button>
            </div>
          </div>`
        : `<div class="acd-quiz-summary" role="status">
            <div>
              <strong>Belum Lulus Tes Loncat (${res.correct}/${res.total} Benar)</strong>
              <p class="acd-muted-note">Syarat tes loncat wajib 4/4 benar. Sebaiknya baca dulu dari Bab 01 agar fondasi pips, spread, lot &amp; order MT5 benar-benar matang.</p>
            </div>
            <div class="acd-modal-actions">
              <button type="button" class="acd-btn-primary" id="acdRetryPlacementBtn">Coba Lagi</button>
              <button type="button" class="acd-btn-secondary" id="acdClosePlacementBtn">Baca dari Bab 01</button>
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
            <h2 id="acdPlacementTitle" class="acd-modal-title">Tes Loncat Bagian I (Dasar MT5 &amp; Lot Gold)</h2>
          </div>
          <button type="button" class="acd-icon-btn" id="acdClosePlacementTopBtn" aria-label="Tutup Tes Loncat">×</button>
        </div>
        <p class="acd-modal-body">Sudah terbiasa memakai MT5, menghitung lot XAU/USD, dan paham Bid/Ask? Jawab 4 skenario nyata ini dengan sempurna (4/4) untuk membuka langsung <strong>Bab 07 (Bagian II: Struktur Pasar &amp; Peta Liquidity)</strong>.</p>
        <div class="acd-placement-questions">${qsHtml}</div>
        ${footerHtml}
      </div>
    </div>`;
  }

  function renderGlossaryTermPopover() {
    if (!G || !state.glossaryTermId) return '';
    const item = G.lookupTerm(state.glossaryTermId);
    if (!item) return '';
    const catMeta = (G.CATEGORIES || []).find(c => c.id === item.category);
    const refLesson = item.lessonId ? C.getLessonById(item.lessonId) : null;
    const canJump = refLesson && refLesson.id !== state.activeLessonId && C.canOpenLesson(state.progress, refLesson.id);

    return `<div class="acd-modal-backdrop acd-glossary-backdrop" id="acdGlossaryTermBackdrop" role="presentation">
      <div class="acd-glossary-sheet" role="dialog" aria-modal="true" aria-labelledby="acdGlossaryTermTitle">
        <div class="acd-modal-top-row">
          <div>
            <p class="acd-hero-kicker">Kamus Cepat · ${esc(catMeta ? catMeta.label : 'Istilah ICT')}</p>
            <h2 id="acdGlossaryTermTitle" class="acd-modal-title">${esc(item.term)}</h2>
            <p class="acd-glossary-fullname">${esc(item.fullName)}</p>
          </div>
          <button type="button" class="acd-icon-btn" id="acdCloseGlossaryTermBtn" aria-label="Tutup penjelasan istilah">×</button>
        </div>
        <p class="acd-glossary-simple">${esc(item.simple)}</p>
        <div class="acd-glossary-example">
          <span class="acd-glossary-example-label">Contoh di XAU/USD</span>
          <p>${esc(item.example)}</p>
        </div>
        <div class="acd-modal-actions">
          ${canJump
            ? `<button type="button" class="acd-btn-primary" data-open-lesson="${esc(refLesson.id)}">Pelajari di Bab ${fmtStep(refLesson)} →</button>`
            : (refLesson ? `<span class="acd-glossary-ref-note">Dibahas tuntas di Bab ${fmtStep(refLesson)}</span>` : '')}
          <button type="button" class="acd-btn-secondary" id="acdOpenFullGlossaryFromTermBtn">Lihat Semua Istilah (${G.TERMS.length})</button>
          <button type="button" class="acd-btn-secondary" id="acdDismissGlossaryTermBtn">Tutup</button>
        </div>
      </div>
    </div>`;
  }

  function renderGlossaryModal() {
    if (!G || !state.glossaryModalOpen) return '';
    const filtered = G.filterGlossary(state.glossaryQuery, state.glossaryCategory);
    const catsHtml = (G.CATEGORIES || []).map(cat => `
      <button type="button" class="acd-tab-btn ${state.glossaryCategory === cat.id ? 'is-active' : ''}" data-glossary-cat="${esc(cat.id)}">${esc(cat.label)}</button>
    `).join('');

    const itemsHtml = filtered.length
      ? filtered.map(item => {
          const refLesson = item.lessonId ? C.getLessonById(item.lessonId) : null;
          const canJump = refLesson && C.canOpenLesson(state.progress, refLesson.id);
          return `<article class="acd-glossary-row">
            <div class="acd-glossary-row-head">
              <div>
                <h3 class="acd-glossary-row-term">${esc(item.term)}</h3>
                <p class="acd-glossary-row-full">${esc(item.fullName)}</p>
              </div>
              ${refLesson
                ? (canJump
                  ? `<button type="button" class="acd-glossary-bab-btn" data-open-lesson="${esc(refLesson.id)}">Bab ${fmtStep(refLesson)} →</button>`
                  : `<span class="acd-glossary-bab-ref acd-nums">Bab ${fmtStep(refLesson)}</span>`)
                : ''}
            </div>
            <p class="acd-glossary-row-simple">${esc(item.simple)}</p>
            <p class="acd-glossary-row-ex"><strong>Contoh XAU/USD:</strong> ${esc(item.example)}</p>
          </article>`;
        }).join('')
      : `<div class="acd-empty-state" style="padding:28px 16px;">
          <p style="margin:0 0 10px; font-weight:700; color:var(--acd-ink);">Istilah "${esc(state.glossaryQuery)}" belum ditemukan.</p>
          <button type="button" class="acd-btn-secondary" id="acdResetGlossaryBtn">Tampilkan Semua Istilah</button>
        </div>`;

    return `<div class="acd-modal-backdrop" id="acdGlossaryModalBackdrop" role="presentation">
      <div class="acd-modal-sheet acd-modal-sheet--wide acd-glossary-modal" role="dialog" aria-modal="true" aria-labelledby="acdGlossaryModalTitle">
        <div class="acd-modal-top-row">
          <div>
            <p class="acd-hero-kicker">Referensi Cepat · ${G.TERMS.length} Istilah Gold &amp; ICT</p>
            <h2 id="acdGlossaryModalTitle" class="acd-modal-title">Kamus Istilah Trading &amp; ICT</h2>
          </div>
          <button type="button" class="acd-icon-btn" id="acdCloseGlossaryModalBtn" aria-label="Tutup Kamus Istilah">×</button>
        </div>
        <p class="acd-modal-body" style="margin-bottom:12px;">Lupa singkatan seperti <strong>ERL</strong>, <strong>CISD</strong>, atau <strong>OTE</strong>? Ketuk langsung istilah bergaris putus di dalam bab atau cari cepat di sini.</p>
        <div class="acd-glossary-controls">
          <div class="acd-search-wrap" style="flex:1 1 100%; max-width:none;">
            <svg class="acd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input id="acdGlossarySearchInput" class="acd-search-input" type="search" placeholder="Cari singkatan atau istilah (mis. CISD, BSL, OTE, FVG, SMT)..." value="${esc(state.glossaryQuery)}" autocomplete="off" aria-label="Cari istilah ICT">
          </div>
          <div class="acd-glossary-cats" role="tablist" aria-label="Filter kategori istilah">${catsHtml}</div>
        </div>
        <div class="acd-glossary-list">${itemsHtml}</div>
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
      ? `Review Capstone · Bab ${C.LESSONS.length}`
      : stats.completedCount > 0
        ? `Lanjutkan Membaca · Bab ${fmtStep(frontier)}`
        : 'Mulai Baca Bab 01';

    const placementHtml = showPlacementBanner
      ? `<section class="acd-placement-banner" aria-label="Tes loncat bagi trader yang sudah paham dasar MT5">
          <div class="acd-placement-copy">
            <span class="acd-track-kicker">Sudah Paham Dasar MT5, Pips &amp; Lot Gold?</span>
            <p>Lewati Bagian I (Bab 01–06) tanpa melewatkan fondasi: buktikan pemahamanmu lewat <strong>Tes Loncat (wajib 4/4 benar)</strong> untuk langsung membuka Bab 07 (Bagian II).</p>
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

      const nodesHtml = items.map(lesson => {
        const lockState = C.getModuleLockState(state.progress, lesson.id);
        const isMastered = lockState === 'mastered';
        const isActive = lockState === 'unlocked';
        const isLocked = lockState === 'locked';
        const isSaved = bookmarkSet.has(String(lesson.id));
        const quizRec = state.progress.quizScores[lesson.id];
        const stepStr = fmtStep(lesson);

        let statusText = `${lesson.readMinutes} mnt baca · Uji Paham ${lesson.quiz.length} soal`;
        let nodeSymbol = stepStr;
        if (isMastered) {
          nodeSymbol = '✓';
          statusText = quizRec
            ? `Dikuasai · Skor ${quizRec.correct}/${quizRec.total} · Ketuk untuk baca ulang`
            : 'Dikuasai · Ketuk untuk baca ulang';
        } else if (isActive) {
          nodeSymbol = '▶';
          statusText = `${lesson.readMinutes} mnt baca · Lulus Uji Paham ≥80% untuk buka bab berikutnya`;
        } else {
          nodeSymbol = '🔒';
          statusText = 'Terkunci · Tuntaskan bab aktif sebelumnya';
        }

        return `<div class="acd-path-item is-${lockState}" data-module-state="${lockState}" data-module-id="${esc(lesson.id)}">
          <div class="acd-path-rail" aria-hidden="true">
            <span class="acd-path-line"></span>
            <span class="acd-path-node">${nodeSymbol}</span>
          </div>
          <div class="acd-path-card-wrap">
            <button type="button"
              class="acd-path-card is-${lockState}"
              data-open-lesson="${esc(lesson.id)}"
              aria-label="Bab ${stepStr}: ${esc(lesson.title)} — ${isMastered ? 'Dikuasai' : isActive ? 'Aktif' : 'Terkunci'}">
              <div class="acd-path-card-head">
                <span class="acd-path-step acd-nums">Bab ${stepStr}</span>
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
      ? 'Belum ada bab favorit tersimpan. Ketuk ikon bintang (☆) pada bab yang terbuka untuk menyimpannya.'
      : state.filterMode === 'mastered' && !state.searchQuery
        ? 'Belum ada bab yang dituntaskan. Mulai dari Bab 01 dan lulus Uji Paham minimal 80% untuk membuka bab berikutnya.'
        : `Tidak ada bab yang cocok dengan "${esc(state.searchQuery)}".`;

    const emptyHtml = `<div class="acd-empty-state">
      <p style="margin:0 0 12px; font-weight:700; color:var(--acd-ink);">${emptyMsg}</p>
      <button type="button" class="acd-btn-secondary" id="acdResetFilterBtn">Tampilkan Seluruh Daftar Isi</button>
    </div>`;

    return `<div class="acd-overview">
      <section class="acd-hero" aria-label="Ringkasan Buku Panduan ICT">
        <div>
          <p class="acd-hero-kicker">Kurikulum Praktis ${C.LESSONS.length} Bab · XAU/USD · Lulus Uji Paham ≥80%</p>
          <h1>Playbook Trading Gold &amp; ICT (XAU/USD)</h1>
          <p class="acd-hero-sub">Disusun urut dari nol sampai bisa mapping chart kosong sendiri — pakai istilah trading asli biar langsung nyambung saat buka MT5. Setiap bab terbuka setelah lulus Uji Paham minimal 80%.</p>
          <p class="acd-hero-resume-meta">
            ${stats.allMastered
              ? `Selamat — seluruh ${C.LESSONS.length} bab hingga Capstone Mapping Mandiri sudah kamu kuasai.`
              : `Bab Aktif: <strong>Bab ${fmtStep(frontier)} · ${esc(frontier.title)}</strong>`}
          </p>
        </div>
        <div class="acd-hero-right">
          <div class="acd-hero-stats">
            <div class="acd-hero-stats-row">
              <span>Progres Belajar</span>
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
        <div class="acd-level-tabs" role="tablist" aria-label="Filter daftar isi buku">
          <button type="button" class="acd-tab-btn ${state.filterMode === 'all' ? 'is-active' : ''}" data-filter-mode="all">Semua (${C.LESSONS.length})</button>
          <button type="button" class="acd-tab-btn ${state.filterMode === 'mastered' ? 'is-active' : ''}" data-filter-mode="mastered">Dikuasai (${stats.completedCount})</button>
          <button type="button" class="acd-tab-btn ${state.filterMode === 'saved' ? 'is-active' : ''}" data-filter-mode="saved">Tersimpan (${state.bookmarks.length})</button>
        </div>
        <div class="acd-search-wrap">
          <svg class="acd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="acdSearchInput" class="acd-search-input" type="search" placeholder="Cari topik (mis. Pips, Lot, DOL, FVG, iFVG, Breaker, SMT)..." value="${esc(state.searchQuery)}" autocomplete="off" aria-label="Cari materi bab">
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
          <span>${esc(stage.code)} · ${esc(stage.title.split(':')[0].split('&')[0].trim())}</span>
          <span class="acd-nums">${done}/${items.length}</span>
        </div>
        ${itemsHtml}
      </div>`;
    }).join('');

    return `<aside id="acdSidebar" class="acd-sidebar ${state.drawerOpen ? 'is-open' : ''}" aria-label="Daftar isi ${C.LESSONS.length} bab">
      <div class="acd-sidebar-top">
        <button type="button" class="acd-sidebar-overview-btn" id="acdOverviewBtn">← Daftar Semua Bab</button>
        <button type="button" class="acd-drawer-close" id="acdDrawerCloseBtn" aria-label="Tutup daftar isi">×</button>
      </div>
      ${groupsHtml}
    </aside>`;
  }

  function renderDiagramCard(lesson, figureLabel) {
    const rendered = D.renderDiagramSVG(lesson.diagramId, state.diagramStageIndex);
    const tabsHtml = rendered.stages.map(s => {
      const active = s.index === rendered.activeIndex;
      return `<button type="button" class="acd-stage-btn ${active ? 'is-active' : ''}" data-diagram-stage="${s.index}" aria-pressed="${active ? 'true' : 'false'}">${esc(s.label)}</button>`;
    }).join('');

    return `<figure class="acd-diagram-card acd-book-figure" aria-label="Ilustrasi chart interaktif">
      <div class="acd-diagram-head">
        <div>
          <span class="acd-book-fig-kicker">${esc(figureLabel || `Ilustrasi Bab ${fmtStep(lesson)}`)}</span>
          <h3 class="acd-diagram-title">${esc(rendered.title)}</h3>
        </div>
        <div class="acd-stage-tabs" role="group" aria-label="Tahap ilustrasi">${tabsHtml}</div>
      </div>
      <div class="acd-diagram-canvas" id="acdDiagramCanvas">${rendered.svg}</div>
      <figcaption class="acd-diagram-caption" id="acdDiagramCaption">
        <strong>Penjelasan Gambar:</strong> ${esc(rendered.caption)}
      </figcaption>
    </figure>`;
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
          ? `<button type="button" class="acd-btn-primary" id="acdUnlockedNextBtn" data-open-lesson="${esc(adj.next.id)}">Lanjut ke Bab ${fmtStep(adj.next)} →</button>`
          : `<button type="button" class="acd-btn-primary" id="acdFinishOverviewBtn">Lihat Ringkasan Progres →</button>`;
        summaryHtml = `<div class="acd-unlock-banner" role="status">
          <strong>🔓 Lulus Uji Paham (${currentCorrect}/${total}) — ${adj.next ? `Bab ${fmtStep(adj.next)} Resmi Terbuka!` : 'Seluruh 36 Bab Tuntas!'}</strong>
          <p>Pemahamanmu terverifikasi (+${C.XP_PER_MASTERED_MODULE} XP). Progres belajarmu tersimpan otomatis.</p>
          <div class="acd-unlock-actions">
            ${nextBtn}
            <button type="button" class="acd-btn-secondary" id="acdRetryQuizBtn">Ulangi Uji Paham</button>
          </div>
        </div>`;
      } else {
        summaryHtml = `<div class="acd-quiz-summary is-failed" role="status">
          <div>
            <strong>🔒 Belum Lulus (${currentCorrect}/${total} — Minimal ${minPass}/${total} Benar)</strong>
            <p class="acd-muted-note">Bab berikutnya tetap terkunci agar kamu benar-benar menguasai materi ini dulu. Baca kembali bagian yang masih ragu di atas, lalu ulangi Uji Paham.</p>
          </div>
          <div class="acd-unlock-actions">
            <button type="button" class="acd-btn-primary" id="acdRetryQuizBtn">Ulangi Uji Paham</button>
            <button type="button" class="acd-btn-secondary" data-scroll-target="acdBookTop">Baca Ulang dari Atas ↑</button>
          </div>
        </div>`;
      }
    }

    return `<section class="acd-quiz-card" id="acdExamSection" aria-labelledby="acdQuizHeading">
      <div class="acd-quiz-head">
        <div>
          <p class="acd-section-kicker" style="margin-bottom:4px;">Gerbang Buka Kunci · Minimal ${minPass}/${total} Benar (80%)</p>
          <h2 id="acdQuizHeading">Uji Paham Bab ${fmtStep(lesson)} ${isMastered ? '· ✓ Tuntas' : ''}</h2>
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
    return `<section id="acdMiniRiskLab" class="acd-risk-lab acd-book-lab" aria-label="Simulasi Latihan Lot dan Risiko Gold">
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

  function renderBookBody(lesson) {
    const sections = lesson.bookSections || [];
    const diagramIdx = Number.isInteger(lesson.diagramAfterSection)
      ? Math.max(0, Math.min(sections.length - 1, lesson.diagramAfterSection))
      : 0;
    const labIdx = Number.isInteger(lesson.interactiveLabAfterSection)
      ? lesson.interactiveLabAfterSection
      : -1;

    const sectionsHtml = sections.map((sec, idx) => {
      const secId = `acd-sec-${idx}`;
      const paras = renderReadableParagraphs(sec.paragraphs);
      const parasAfter = renderReadableParagraphs(sec.paragraphsAfter);

      const exampleHtml = sec.exampleBox && Array.isArray(sec.exampleBox.rows)
        ? `<div class="acd-book-example">
            <h3 class="acd-book-example-title">${esc(sec.exampleBox.title)}</h3>
            <dl class="acd-book-example-list">
              ${sec.exampleBox.rows.map(r => `
                <div class="acd-book-example-row">
                  <dt>${fmtBookRich(r.label)}</dt>
                  <dd>${fmtBookRich(r.detail)}</dd>
                </div>
              `).join('')}
            </dl>
          </div>`
        : '';

      const tableHtml = sec.table && Array.isArray(sec.table.headers) && Array.isArray(sec.table.rows)
        ? `<div class="acd-book-table-wrap">
            ${sec.table.caption ? `<p class="acd-book-table-caption">${esc(sec.table.caption)}</p>` : ''}
            <table class="acd-book-table">
              <thead>
                <tr>${sec.table.headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${sec.table.rows.map(row => `<tr>${row.map((cell, cIdx) => `<td class="${cIdx === 0 ? 'is-lead' : ''}">${fmtBookRich(cell)}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>`
        : '';

      const calloutTone = sec.callout?.tone || 'tip';
      const calloutBadge = calloutTone === 'warn' ? 'Perhatian' : calloutTone === 'story' ? 'Contoh Nyata' : 'Catatan Praktis';
      const calloutHtml = sec.callout
        ? `<aside class="acd-book-callout is-${esc(calloutTone)}" aria-label="${esc(calloutBadge)}">
            <p class="acd-book-callout-kicker">${esc(calloutBadge)}</p>
            <h3 class="acd-book-callout-title">${esc(sec.callout.title)}</h3>
            <p class="acd-book-callout-body">${fmtBookRich(sec.callout.body)}</p>
          </aside>`
        : '';

      const secNum = sec.number || `${lesson.stepNumber || lesson.number}.${idx + 1}`;
      const inlineDiagram = idx === diagramIdx
        ? renderDiagramCard(lesson, `Ilustrasi Bab ${fmtStep(lesson)} · Bagian ${secNum}`)
        : '';

      const inlineLab = idx === labIdx && lesson.id === 'lot-leverage-margin-equity'
        ? renderMiniRiskLab()
        : '';

      return `<section class="acd-book-chapter-sec" id="${secId}" aria-labelledby="${secId}-h">
        <h2 id="${secId}-h" class="acd-book-h2">
          <span class="acd-book-sec-num acd-nums">${esc(secNum)}</span>
          <span>${esc(sec.heading)}</span>
        </h2>
        ${paras}
        ${exampleHtml}
        ${tableHtml}
        ${calloutHtml}
        ${parasAfter}
        ${inlineLab}
        ${inlineDiagram}
      </section>`;
    }).join('');

    const takeawaysHtml = Array.isArray(lesson.keyTakeaways) && lesson.keyTakeaways.length
      ? `<section class="acd-book-takeaways" aria-label="Inti Bab ${fmtStep(lesson)}">
          <p class="acd-section-kicker">Rangkuman Inti Bab ${fmtStep(lesson)}</p>
          <ul>${lesson.keyTakeaways.map(t => `<li>${fmtBookRich(t)}</li>`).join('')}</ul>
        </section>`
      : '';

    const bridgeHtml = lesson.bridgeNext
      ? `<section class="acd-book-bridge" aria-label="Jembatan ke bab berikutnya">
          <p class="acd-section-kicker">Menuju Bab Berikutnya</p>
          ${renderReadableParagraphs([lesson.bridgeNext])}
        </section>`
      : '';

    return `${sectionsHtml}${takeawaysHtml}${bridgeHtml}`;
  }

  function renderClassicSingleFlowBody(lesson) {
    const conceptsHtml = (lesson.conceptBlocks || []).map((b, idx) => `
      <section class="acd-book-chapter-sec" id="acd-sec-${idx}">
        <h2 class="acd-book-h2">
          <span class="acd-book-sec-num acd-nums">${fmtStep(lesson)}.${idx + 1}</span>
          <span>${esc(b.heading)}</span>
        </h2>
        ${(b.paragraphs || []).map(p => `<p class="acd-book-p">${fmtRich(p)}</p>`).join('')}
        ${idx === 0 ? renderDiagramCard(lesson, `Ilustrasi Bab ${fmtStep(lesson)}`) : ''}
      </section>
    `).join('');

    const mappingStepsHtml = Array.isArray(lesson.mappingSteps) && lesson.mappingSteps.length
      ? `<section class="acd-book-chapter-sec">
          <h2 class="acd-book-h2"><span>Langkah Praktik di Chart</span></h2>
          <div class="acd-book-example">
            <ol class="acd-step-list">${lesson.mappingSteps.map(s => `<li>${fmtRich(s)}</li>`).join('')}</ol>
          </div>
        </section>`
      : '';

    const decisionHtml = Array.isArray(lesson.decisionTree) && lesson.decisionTree.length
      ? `<section class="acd-book-chapter-sec">
          <h2 class="acd-book-h2"><span>Menyikapi Situasi Abu-Abu di Chart</span></h2>
          <div class="acd-decision-stack">
            ${lesson.decisionTree.map((item, i) => `
              <div class="acd-decision-card">
                <p class="acd-decision-q"><span class="acd-decision-tag acd-nums">Situasi ${i + 1}</span> ${fmtRich(item.condition)}</p>
                <p class="acd-decision-a"><span class="acd-decision-tag acd-decision-tag--then">Tindakan</span> ${fmtRich(item.action)}</p>
              </div>
            `).join('')}
          </div>
        </section>`
      : '';

    const scenarioSteps = (lesson.xauScenario?.steps || []).map(s => `<li>${fmtRich(s)}</li>`).join('');
    const failedCaseHtml = lesson.failedCase
      ? `<aside class="acd-book-callout is-warn">
          <p class="acd-book-callout-kicker">Jebakan Umum</p>
          <h3 class="acd-book-callout-title">${esc(lesson.failedCase.title || 'Contoh Kasus Gagal')}</h3>
          <p class="acd-book-callout-body">${fmtRich(lesson.failedCase.context)} <strong>Penyebabnya:</strong> ${fmtRich(lesson.failedCase.whyFailed)}</p>
        </aside>`
      : '';

    const goldenItems = (lesson.goldenRules || []).map(g => `<li>${fmtRich(g)}</li>`).join('');

    return `${conceptsHtml}
      ${mappingStepsHtml}
      ${decisionHtml}
      <section class="acd-book-chapter-sec">
        <h2 class="acd-book-h2"><span>Studi Kasus Nyata di Chart Gold (XAU/USD)</span></h2>
        <div class="acd-book-example">
          <p class="acd-scenario-context" style="margin-bottom:10px;">${fmtRich(lesson.xauScenario?.context || '')}</p>
          <ol class="acd-step-list">${scenarioSteps}</ol>
        </div>
        ${failedCaseHtml}
      </section>
      <section class="acd-book-takeaways">
        <p class="acd-section-kicker">Inti Bab ${fmtStep(lesson)}</p>
        <ul>${goldenItems}</ul>
      </section>`;
  }

  function renderLessonWorkspace() {
    const lesson = C.getLessonById(state.activeLessonId);
    if (!lesson) return renderOverview();

    const stage = C.getStageById(lesson.stageId);
    const isMastered = C.isLessonMastered(state.progress, lesson.id);
    const adj = C.getAdjacentLessons(lesson.id);
    const nextUnlocked = adj.next ? C.canOpenLesson(state.progress, adj.next.id) : true;

    const outlineItems = lesson.bookFormat
      ? (lesson.bookSections || []).map((s, idx) => {
          const secNum = s.number || `${lesson.stepNumber || lesson.number}.${idx + 1}`;
          return {
            target: `acd-sec-${idx}`,
            label: `${secNum} ${s.heading.split('(')[0].split(':')[0].trim()}`
          };
        })
      : (lesson.conceptBlocks || []).map((b, idx) => ({
          target: `acd-sec-${idx}`,
          label: b.heading.split(':')[0].trim()
        }));

    const outlineHtml = `<nav class="acd-book-outline" aria-label="Isi bab ini">
      ${outlineItems.map(item => `<button type="button" class="acd-book-outline-link" data-scroll-target="${esc(item.target)}">${esc(item.label)}</button>`).join('')}
      <button type="button" class="acd-book-outline-link is-exam" data-scroll-target="acdExamSection">Uji Paham ${isMastered ? '✓' : '🔓'}</button>
    </nav>`;

    const practiceCtaHtml = lesson.practiceCta
      ? `<section class="acd-practice-cta" aria-label="Praktik langsung di aplikasi">
          <div class="acd-practice-copy">
            <p class="acd-practice-kicker">Praktik Langsung · Amy FX Pro</p>
            <h3>${esc(lesson.practiceCta.label)}</h3>
            <p>${esc(lesson.practiceCta.description || lesson.practiceCta.detail || '')}</p>
          </div>
          <a class="acd-btn-primary acd-practice-link" href="${esc(lesson.practiceCta.href)}">Buka Fitur →</a>
        </section>`
      : '';

    const graduationHtml = !adj.next
      ? `<section class="acd-graduation-card" aria-label="Langkah eksekusi setelah lulus">
          <h2>Tuntas Semua 36 Bab — Siap Mapping Mandiri</h2>
          <p>Kamu sudah sampai di Bab terakhir (ke-${C.LESSONS.length}). Lulus Uji Paham Capstone untuk menyelesaikan 100% Academy, lalu langsung praktik di Cockpit Mapping &amp; Lab 100 Kasus ICT.</p>
          <div class="acd-graduation-links">
            <a class="acd-btn-primary" href="../mapping/index.html">Buka Cockpit Mapping →</a>
            <a class="acd-btn-secondary" href="trading-practice/index.html">Buka Latihan 100 Kasus ICT</a>
          </div>
        </section>`
      : '';

    const nextPagerBtn = adj.next
      ? (nextUnlocked
        ? `<button type="button" class="acd-pager-btn acd-pager-btn--next" data-open-lesson="${esc(adj.next.id)}">
            <span class="acd-pager-dir">Bab Berikutnya · Bab ${fmtStep(adj.next)} →</span>
            <span class="acd-pager-title">${esc(adj.next.title)}</span>
          </button>`
        : `<button type="button" class="acd-pager-btn acd-pager-btn--next is-locked" id="acdLockedNextBtn" data-scroll-target="acdExamSection">
            <span class="acd-pager-dir">🔒 Bab ${fmtStep(adj.next)} Terkunci</span>
            <span class="acd-pager-title">Selesaikan Uji Paham (≥80%) di bawah untuk membuka</span>
          </button>`)
      : `<button type="button" class="acd-pager-btn acd-pager-btn--next" id="acdFinishOverviewBtn">
          <span class="acd-pager-dir">Kembali ke Daftar Isi →</span>
          <span class="acd-pager-title">Lihat Progres ${C.LESSONS.length} Bab</span>
        </button>`;

    const pagerHtml = `<nav class="acd-pager" aria-label="Navigasi antar bab">
      ${adj.prev
        ? `<button type="button" class="acd-pager-btn" data-open-lesson="${esc(adj.prev.id)}">
            <span class="acd-pager-dir">← Sebelumnya · Bab ${fmtStep(adj.prev)}</span>
            <span class="acd-pager-title">${esc(adj.prev.title)}</span>
          </button>`
        : `<div></div>`}
      ${nextPagerBtn}
    </nav>`;

    const bodyHtml = lesson.bookFormat ? renderBookBody(lesson) : renderClassicSingleFlowBody(lesson);

    return `<div class="acd-workspace">
      <div id="acdBackdrop" class="acd-backdrop ${state.drawerOpen ? 'is-open' : ''}"></div>
      ${renderSidebar()}
      <main class="acd-reader">
        <article class="acd-article acd-book-article" id="acdBookTop">
          <header class="acd-lesson-header acd-book-header">
            <p class="acd-breadcrumb">${esc(stage ? `${stage.code} · ${stage.title}` : '')} · Bab ${fmtStep(lesson)} dari ${C.LESSONS.length} · ${lesson.readMinutes} menit baca · ${isMastered ? 'Dikuasai ✓' : 'Wajib Uji Paham ≥80%'}</p>
            <h1>${esc(lesson.title)}</h1>
            <p class="acd-lesson-summary">${esc(lesson.subtitle || lesson.summary)}</p>
            <div class="acd-lesson-actions">
              <button type="button" class="acd-btn-secondary ${state.bookmarks.includes(String(lesson.id)) ? 'is-saved' : ''}" id="acdToggleBookmarkBtn">
                ${state.bookmarks.includes(String(lesson.id)) ? '★ Tersimpan' : '☆ Simpan Bab'}
              </button>
              <button type="button" class="acd-btn-secondary" id="acdAskAmyBtn">
                Tanya Amy Tentang Bab Ini
              </button>
              ${G ? `<button type="button" class="acd-btn-secondary" id="acdOpenGlossaryLessonBtn">Kamus Istilah</button>` : ''}
              <button type="button" class="acd-btn-primary" data-scroll-target="acdExamSection">
                Ke Uji Paham ↓
              </button>
            </div>
          </header>

          ${outlineHtml}

          <div class="acd-book-flow">
            ${bodyHtml}
          </div>

          ${practiceCtaHtml}
          ${renderQuizSection(lesson, adj)}
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
    const mainHtml = state.view === 'lesson' ? renderLessonWorkspace() : renderOverview();
    mount.innerHTML = `${mainHtml}${renderLockModal()}${renderPlacementModal()}${renderGlossaryTermPopover()}${renderGlossaryModal()}`;
    bindViewEvents();
    if (state.view === 'lesson' && !state.glossaryTermId && !state.glossaryModalOpen) {
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

    // Smooth in-chapter section jump links
    mount.querySelectorAll('[data-scroll-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-scroll-target');
        const target = targetId ? document.getElementById(targetId) : null;
        if (target && typeof target.scrollIntoView === 'function') {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

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

    const openGlossaryLessonBtn = document.getElementById('acdOpenGlossaryLessonBtn');
    if (openGlossaryLessonBtn) {
      openGlossaryLessonBtn.addEventListener('click', () => openGlossaryModal());
    }

    // Inline clickable ICT terms -> instant popover
    mount.querySelectorAll('[data-glossary-term]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const termId = btn.getAttribute('data-glossary-term');
        if (termId) openGlossaryTerm(termId);
      });
    });

    // Term popover controls
    const closeTermBtn = document.getElementById('acdCloseGlossaryTermBtn');
    if (closeTermBtn) closeTermBtn.addEventListener('click', () => closeModals());
    const dismissTermBtn = document.getElementById('acdDismissGlossaryTermBtn');
    if (dismissTermBtn) dismissTermBtn.addEventListener('click', () => closeModals());
    const termBackdrop = document.getElementById('acdGlossaryTermBackdrop');
    if (termBackdrop) {
      termBackdrop.addEventListener('click', e => {
        if (e.target === termBackdrop) closeModals();
      });
    }
    const openFullFromTermBtn = document.getElementById('acdOpenFullGlossaryFromTermBtn');
    if (openFullFromTermBtn) {
      openFullFromTermBtn.addEventListener('click', () => openGlossaryModal(''));
    }

    // Full Kamus modal controls
    const closeGlossaryBtn = document.getElementById('acdCloseGlossaryModalBtn');
    if (closeGlossaryBtn) closeGlossaryBtn.addEventListener('click', () => closeModals());
    const glossaryBackdrop = document.getElementById('acdGlossaryModalBackdrop');
    if (glossaryBackdrop) {
      glossaryBackdrop.addEventListener('click', e => {
        if (e.target === glossaryBackdrop) closeModals();
      });
    }
    const glossarySearch = document.getElementById('acdGlossarySearchInput');
    if (glossarySearch) {
      glossarySearch.addEventListener('input', e => {
        state.glossaryQuery = e.target.value;
        const pos = glossarySearch.selectionStart;
        render();
        const nextEl = document.getElementById('acdGlossarySearchInput');
        if (nextEl) {
          nextEl.focus();
          if (typeof pos === 'number') nextEl.setSelectionRange(pos, pos);
        }
      });
    }
    const resetGlossaryBtn = document.getElementById('acdResetGlossaryBtn');
    if (resetGlossaryBtn) {
      resetGlossaryBtn.addEventListener('click', () => {
        state.glossaryQuery = '';
        state.glossaryCategory = 'all';
        render();
      });
    }
    mount.querySelectorAll('[data-glossary-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.glossaryCategory = btn.getAttribute('data-glossary-cat') || 'all';
        render();
      });
    });

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
        if (caption) caption.innerHTML = `<strong>Penjelasan Gambar:</strong> ${esc(rendered.caption)}`;
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

    // Interactive Mini Risk/Lot Calculator (Bab 03)
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

    const glossaryTopBtn = document.getElementById('acdGlossaryTopBtn');
    if (glossaryTopBtn) glossaryTopBtn.addEventListener('click', () => openGlossaryModal());

    const handleAcademyStepBack = () => {
      if (state.lockModal || state.placementModalOpen || state.glossaryTermId || state.glossaryModalOpen) {
        closeModals();
        return true;
      }
      if (state.drawerOpen) {
        setDrawerOpen(false);
        return true;
      }
      if (state.view === 'lesson') {
        openOverview();
        return true;
      }
      return false;
    };

    root.__amyfxPageBackHandler = handleAcademyStepBack;

    const backLink = document.getElementById('acdBackLink');
    if (backLink) {
      backLink.addEventListener('click', (e) => {
        if (handleAcademyStepBack()) {
          e.preventDefault();
          return;
        }
        // On Academy Overview: step back to same-origin non-academy referrer (e.g. Latihan 100 Kasus), else Beranda
        const ref = document.referrer || '';
        const isSameOrigin = ref.startsWith(root.location.origin);
        const isSelfAcademy = /\/apps\/academy\/(?:index\.html)?(?:[?#]|$)/i.test(ref);
        if (isSameOrigin && !isSelfAcademy && root.history.length > 1) {
          e.preventDefault();
          const originHref = root.location.href;
          root.history.back();
          setTimeout(() => {
            if (root.location.href === originHref) root.location.assign('../../index.html');
          }, 360);
        }
      });
    }

    const menuBtn = document.getElementById('acdMenuToggleBtn');
    if (menuBtn) menuBtn.addEventListener('click', () => setDrawerOpen(!state.drawerOpen));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (state.lockModal || state.placementModalOpen || state.glossaryTermId || state.glossaryModalOpen) closeModals();
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
