/* Amy FX Academy — Interactive Browser Application Controller
 * Handles Overview, Level Filter & Search, Two-Zone Reader, Interactive SVG Diagrams,
 * 3-Question Diagnostic Quiz, localStorage Persistence, URL Deep-Linking, Mobile Drawer, and Tanya Amy.
 */
(function (root) {
  'use strict';

  const C = root.AmyAcademyCurriculum;
  const D = root.AmyAcademyDiagrams;
  if (!C || !D) return;

  const state = {
    view: 'overview', // 'overview' | 'lesson'
    activeLessonId: null,
    filterLevel: 'all',
    searchQuery: '',
    diagramStageIndex: 0,
    quizAnswers: {}, // { [lessonId]: { [qIndex]: selectedOptionIndex } }
    drawerOpen: false,
    progress: C.createEmptyProgress()
  };

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadProgress() {
    try {
      const raw = root.localStorage.getItem(C.STORAGE_KEY);
      state.progress = C.normalizeProgress(raw ? JSON.parse(raw) : null);
    } catch {
      state.progress = C.createEmptyProgress();
    }
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
    const filtered = C.filterLessons({
      levelId: state.filterLevel,
      query: state.searchQuery,
      completedIds: state.progress.completedIds
    });

    const primaryLesson = stats.nextRecommendedLesson || C.LESSONS[0];
    const primaryCtaLabel = stats.completedCount > 0
      ? `Lanjutkan: Pelajaran ${String(primaryLesson.number).padStart(2, '0')}`
      : 'Mulai Pelajaran 01';

    const levelTabsHtml = [
      `<button type="button" class="acd-tab-btn ${state.filterLevel === 'all' ? 'is-active' : ''}" data-filter-level="all">Semua (30)</button>`,
      ...C.LEVELS.map(lvl => {
        const active = String(state.filterLevel) === String(lvl.id);
        return `<button type="button" class="acd-tab-btn ${active ? 'is-active' : ''}" data-filter-level="${lvl.id}">Level ${lvl.id}</button>`;
      })
    ].join('');

    const groupedHtml = C.LEVELS.map(level => {
      const items = filtered.filter(l => l.levelId === level.id);
      if (items.length === 0) return '';
      const lvlStat = stats.byLevel.find(b => b.levelId === level.id);

      const rowsHtml = items.map(lesson => {
        const isDone = completedSet.has(lesson.id);
        const quizRec = state.progress.quizScores[lesson.id];
        const numStr = String(lesson.number).padStart(2, '0');
        const quizTag = quizRec
          ? `<span class="acd-quiz-tag">Kuis ${quizRec.correct}/${quizRec.total}</span>`
          : `<span>${lesson.readMinutes} mnt</span>`;

        return `<button type="button" class="acd-lesson-row ${isDone ? 'is-done' : ''}" data-open-lesson="${esc(lesson.id)}">
          <span class="acd-lesson-num" aria-hidden="true">${isDone ? '✓' : numStr}</span>
          <div>
            <p class="acd-lesson-row-title">${numStr}. ${esc(lesson.title)}</p>
            <p class="acd-lesson-row-meta">${esc(lesson.summary)}</p>
          </div>
          <span class="acd-lesson-row-right">${quizTag} <span aria-hidden="true">›</span></span>
        </button>`;
      }).join('');

      return `<section class="acd-level-section" aria-labelledby="lvl-heading-${level.id}">
        <div class="acd-level-head">
          <div>
            <span class="acd-level-code">${esc(level.code)}</span>
            <h2 id="lvl-heading-${level.id}">${esc(level.title)}</h2>
            <p>${esc(level.tagline)}</p>
          </div>
          <span class="acd-level-progress acd-nums">${lvlStat ? `${lvlStat.completed} / ${lvlStat.total} selesai` : ''}</span>
        </div>
        <div class="acd-lesson-list">${rowsHtml}</div>
      </section>`;
    }).filter(Boolean).join('');

    const emptyHtml = `<div class="acd-empty-state">
      <p style="margin:0 0 12px; font-weight:700; color:var(--acd-ink);">Tidak ada pelajaran yang cocok dengan pencarian "${esc(state.searchQuery)}".</p>
      <button type="button" class="acd-btn-secondary" id="acdResetFilterBtn">Reset Filter &amp; Pencarian</button>
    </div>`;

    return `<div class="acd-overview">
      <section class="acd-hero" aria-label="Ringkasan Kurikulum">
        <div>
          <p class="acd-hero-kicker">Kurikulum ICT Scalper · XAU/USD · Standar WITA</p>
          <h1>Zero to Scalper Academy</h1>
          <p class="acd-hero-sub">6 Level terstruktur berisi 30 pelajaran inti tanpa basa-basi: dari nol anatomi candlestick, peta likuiditas, 4 model entry A+ (Sweep-FVG, OB, IFVG, Turtle Soup), Killzone WITA, hingga protokol 100 sample.</p>
        </div>
        <div class="acd-hero-right">
          <div class="acd-hero-stats">
            <div class="acd-hero-stats-row">
              <span>Progres Belajar</span>
              <strong class="acd-nums">${stats.completedCount} / ${stats.totalLessons} Pelajaran · ${stats.percent}%</strong>
            </div>
            <div class="acd-progress-bar-lg" role="progressbar" aria-valuenow="${stats.percent}" aria-valuemin="0" aria-valuemax="100">
              <span style="width:${stats.percent}%"></span>
            </div>
          </div>
          <button type="button" class="acd-btn-primary" data-open-lesson="${esc(primaryLesson.id)}">${esc(primaryCtaLabel)} →</button>
        </div>
      </section>

      <div class="acd-toolbar" role="search">
        <div class="acd-level-tabs" role="tablist" aria-label="Filter level kurikulum">
          ${levelTabsHtml}
        </div>
        <div class="acd-search-wrap">
          <svg class="acd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="acdSearchInput" class="acd-search-input" type="search" placeholder="Cari topik (mis. IFVG, Killzone, Sweep, Lot)..." value="${esc(state.searchQuery)}" autocomplete="off" aria-label="Cari materi pelajaran">
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
        const numStr = String(lesson.number).padStart(2, '0');
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

    return `<aside id="acdSidebar" class="acd-sidebar ${state.drawerOpen ? 'is-open' : ''}" aria-label="Daftar kurikulum 30 pelajaran">
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

    const graduationHtml = lesson.number === C.LESSONS.length
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
            <span class="acd-pager-dir">← Sebelumnya · Pelajaran ${String(adj.prev.number).padStart(2, '0')}</span>
            <span class="acd-pager-title">${esc(adj.prev.title)}</span>
          </button>`
        : `<div></div>`}
      ${adj.next
        ? `<button type="button" class="acd-pager-btn acd-pager-btn--next" data-open-lesson="${esc(adj.next.id)}">
            <span class="acd-pager-dir">Berikutnya · Pelajaran ${String(adj.next.number).padStart(2, '0')} →</span>
            <span class="acd-pager-title">${esc(adj.next.title)}</span>
          </button>`
        : `<button type="button" class="acd-pager-btn acd-pager-btn--next" id="acdFinishOverviewBtn">
            <span class="acd-pager-dir">Selesai Kurikulum →</span>
            <span class="acd-pager-title">Kembali ke Ringkasan 6 Level</span>
          </button>`}
    </nav>`;

    return `<div class="acd-workspace">
      <div id="acdBackdrop" class="acd-backdrop ${state.drawerOpen ? 'is-open' : ''}"></div>
      ${renderSidebar()}
      <main class="acd-reader">
        <article class="acd-article">
          <header class="acd-lesson-header">
            <p class="acd-breadcrumb">${esc(level ? level.code : `Level ${lesson.levelId}`)} · Pelajaran ${String(lesson.number).padStart(2, '0')} dari ${C.LESSONS.length} · ${lesson.readMinutes} menit baca</p>
            <h1>${esc(lesson.title)}</h1>
            <p class="acd-lesson-summary">${esc(lesson.summary)}</p>
            <div class="acd-lesson-actions">
              <button type="button" class="acd-btn-secondary ${isDone ? 'is-done' : ''}" id="acdToggleCompleteBtn">
                ${isDone ? '✓ Selesai Dipelajari' : 'Tandai Selesai'}
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
            <p class="acd-section-kicker">02 · Filter Eksekusi Valid vs Invalid</p>
            <div class="acd-compare-grid">
              <div class="acd-compare-card acd-compare-card--valid">
                <h3><span aria-hidden="true">✓</span> Syarat Valid (A+)</h3>
                <ul class="acd-rule-list">${validList}</ul>
              </div>
              <div class="acd-compare-card acd-compare-card--invalid">
                <h3><span aria-hidden="true">✕</span> Invalid / Jebakan</h3>
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

          ${renderQuizSection(lesson)}
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
