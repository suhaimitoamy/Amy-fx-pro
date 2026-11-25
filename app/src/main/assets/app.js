document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('main-content');
  const navBtns = document.querySelectorAll('.nav-btn');

  const projects = [
    { id: 'mapping', title: 'Mapping', badge: 'Mapping', icon: 'mapping', desc: '', target: 'apps/mapping/index.html' },
    { id: 'intel', title: 'Berita', badge: 'News', icon: 'intel', desc: '', target: 'apps/market-intel/index.html' },
    { id: 'jurnal', title: 'Jurnal Trading', badge: 'Jurnal', icon: 'journal', desc: '', target: 'apps/journal/index.html' },
    { id: 'academy', title: 'Tutorial Trading', badge: 'Learning', icon: 'academy', desc: '', target: 'apps/academy/index.html' },
  ];

  const practiceItems = [
    {
      id: 'candle-replay',
      title: 'Replay Lab',
      badge: 'Replay',
      icon: 'mapping',
      desc: 'Chart & Order Cloud',
      target: 'apps/academy/trading-practice/candle-replay.html'
    },
    {
      id: 'backtest-history',
      title: 'Performa',
      badge: 'Analitik',
      icon: 'journal',
      desc: 'Kurva & Ledger',
      target: 'apps/academy/trading-practice/backtest-history.html'
    },
    {
      id: 'guided-practice',
      title: 'Latihan',
      badge: 'Latihan',
      icon: 'academy',
      desc: '60 Studi Kasus',
      target: 'apps/academy/trading-practice/guided-practice.html'
    }
  ];

  function showLoadingOverlay() {
    if (window.AmyFXLoading?.start) {
      window.AmyFXLoading.start({
        delay: 350,
        message: 'Memuat modul…',
        timeout: 12000,
        retry: () => location.reload()
      });
      return;
    }
    document.documentElement.classList.add('is-loading');
  }

  let indicators = [
    { name: 'Memuat data...', category: 'Loading', desc: 'Mengambil indikator lokal...', code: 'Loading...' }
  ];

  let selectedIndicator = indicators[0];
  const fallbackIndicatorsEmbedded = [{"name": "Amy Breakout Retest Rejection Assistant", "category": "Pine Script", "desc": "File sumber lokal: AMY_Breakout_Retest_Rejection_Assistant.pine.txt", "url": "apps/indikator/files/AMY_Breakout_Retest_Rejection_Assistant.pine.txt", "code": ""}, {"name": "Amy Kronos Filter Bot Signal", "category": "Pine Script", "desc": "File sumber lokal: AMY_Kronos_Filter_Bot_Signal.pine.txt", "url": "apps/indikator/files/AMY_Kronos_Filter_Bot_Signal.pine.txt", "code": ""}, {"name": "Amy Neo Wave Structure Entry Map", "category": "Pine Script", "desc": "File sumber lokal: AMY_Neo_Wave_Structure_Entry_Map.pine.txt", "url": "apps/indikator/files/AMY_Neo_Wave_Structure_Entry_Map.pine.txt", "code": ""}, {"name": "Amy Pro Clean Sd Snr Fibo Scalping Engine Nowarning", "category": "Pine Script", "desc": "File sumber lokal: AMY_PRO_Clean_SD_SNR_Fibo_Scalping_Engine_NoWarning.pine.txt", "url": "apps/indikator/files/AMY_PRO_Clean_SD_SNR_Fibo_Scalping_Engine_NoWarning.pine.txt", "code": ""}, {"name": "Amy Pro Sd Snr Fibo Scalping Engine", "category": "Pine Script", "desc": "File sumber lokal: AMY_PRO_SD_SNR_Fibo_Scalping_Engine.pine.txt", "url": "apps/indikator/files/AMY_PRO_SD_SNR_Fibo_Scalping_Engine.pine.txt", "code": ""}, {"name": "Amy Supply Demand Snr Fibo Entry Calculator", "category": "Pine Script", "desc": "File sumber lokal: AMY_Supply_Demand_SNR_Fibo_Entry_Calculator.pine.txt", "url": "apps/indikator/files/AMY_Supply_Demand_SNR_Fibo_Entry_Calculator.pine.txt", "code": ""}, {"name": "Amy Ultimate Professional Suite", "category": "Pine Script", "desc": "File sumber lokal: AMY_Ultimate_Professional_Suite.pine", "url": "apps/indikator/files/AMY_Ultimate_Professional_Suite.pine", "code": ""}, {"name": "Gcx Entry Only V1", "category": "Pine Script", "desc": "File sumber lokal: GCX-Entry-Only-V1.pine", "url": "apps/indikator/files/GCX-Entry-Only-V1.pine", "code": ""}, {"name": "Gcx Matrix V12", "category": "Pine Script", "desc": "File sumber lokal: GCX-Matrix-V12.pine", "url": "apps/indikator/files/GCX-Matrix-V12.pine", "code": ""}, {"name": "Ict Yang Di Sempurnakan Edited", "category": "Pine Script", "desc": "File sumber lokal: ICT yang di sempurnakan edited.pine", "url": "apps/indikator/files/ICT yang di sempurnakan edited.pine", "code": ""}, {"name": "Ict Amy Entry Assistant V3 Break Retest Rejection", "category": "Pine Script", "desc": "File sumber lokal: ICT_AMY_Entry_Assistant_V3_Break_Retest_Rejection.pine.txt", "url": "apps/indikator/files/ICT_AMY_Entry_Assistant_V3_Break_Retest_Rejection.pine.txt", "code": ""}, {"name": "Ict Amy Entry Assistant V3 Mathzone Stable Nowarning", "category": "Pine Script", "desc": "File sumber lokal: ICT_AMY_Entry_Assistant_V3_MathZone_Stable_NoWarning.pine.txt", "url": "apps/indikator/files/ICT_AMY_Entry_Assistant_V3_MathZone_Stable_NoWarning.pine.txt", "code": ""}, {"name": "Ict Concepts Amygmgo Fixed Ready", "category": "Pine Script", "desc": "File sumber lokal: ICT_Concepts_amygmgo_FIXED_READY.pine", "url": "apps/indikator/files/ICT_Concepts_amygmgo_FIXED_READY.pine", "code": ""}, {"name": "Ict Validated Smc V1 Clean", "category": "Pine Script", "desc": "File sumber lokal: ICT_Validated_SMC_v1_clean.pine", "url": "apps/indikator/files/ICT_Validated_SMC_v1_clean.pine", "code": ""}, {"name": "Smc", "category": "Pine Script", "desc": "File sumber lokal: Smc.pine", "url": "apps/indikator/files/Smc.pine", "code": ""}, {"name": "Indikator Baru", "category": "Pine Script", "desc": "File sumber lokal: indikator-baru.pine", "url": "apps/indikator/files/indikator-baru.pine", "code": ""}, {"name": "Indikator V1", "category": "Pine Script", "desc": "File sumber lokal: indikator-v1.pine", "url": "apps/indikator/files/indikator-v1.pine", "code": ""}, {"name": "Indikator V10", "category": "Pine Script", "desc": "File sumber lokal: indikator-v10.pine", "url": "apps/indikator/files/indikator-v10.pine", "code": ""}, {"name": "Indikator V2", "category": "Pine Script", "desc": "File sumber lokal: indikator-v2.pine", "url": "apps/indikator/files/indikator-v2.pine", "code": ""}, {"name": "Indikator V3", "category": "Pine Script", "desc": "File sumber lokal: indikator-v3.pine", "url": "apps/indikator/files/indikator-v3.pine", "code": ""}, {"name": "Indikator V3 V4", "category": "Pine Script", "desc": "File sumber lokal: indikator-v3_v4.pine", "url": "apps/indikator/files/indikator-v3_v4.pine", "code": ""}];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'\"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '\"': '&quot;' }[ch]));
  }

  function readJsonSafe(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null || raw === '') return fallback;
      return JSON.parse(raw);
    } catch (_) {
      try { localStorage.removeItem(key); } catch (_) {}
      return fallback;
    }
  }

  function readJsonArray(key) {
    const value = readJsonSafe(key, []);
    return Array.isArray(value) ? value : [];
  }

  function deleteIndexedDatabase(name) {
    return new Promise(resolve => {
      if (!('indexedDB' in window)) return resolve(false);
      let settled = false;
      const finish = value => { if (!settled) { settled = true; resolve(value); } };
      try {
        const request = indexedDB.deleteDatabase(name);
        request.onsuccess = () => finish(true);
        request.onerror = () => finish(false);
        request.onblocked = () => finish(false);
        setTimeout(() => finish(false), 2500);
      } catch (_) { finish(false); }
    });
  }

  async function clearPersonalLocalData() {
    const keys = [
      'amy_mapping_logs', 'amy_mapping_analyses', 'amy_mapping_setups',
      'amy_mapping_lifecycle_v4', 'amy_mapping_active_pointer_v4',
      'amy_entry_watch_state_v3', 'amy_recent_projects', 'amy_saved_code',
      'amy_journal_entries', 'amy_mapping_notified', 'amy_indicator_favorites',
      'tradingLibraryManager.journals.v1', 'tradingLibraryManager.notes.v1',
      'tradingLibraryManager.items.v1', 'amy_sim_positions_v1',
      'amy_sim_cashflows_v1', 'amy_daily_loss_guard_v1',
      'amy_media_watched_v1', 'amy_replay_bookmarks_v1',
      'amy_academy_bookmarks_v1', 'amy_academy_progress_v2',
      'amy_media_items', 'amy.backtest.exportedJournalIds.v1'
    ];
    keys.forEach(key => { try { localStorage.removeItem(key); } catch (_) {} });
    if (mediaDbPromise) {
      try {
        const db = await mediaDbPromise;
        db?.close?.();
      } catch (_) {}
      mediaDbPromise = null;
    }
    return deleteIndexedDatabase('tradingLibraryManager.files');
  }

  async function loadRepoIndicators() {
    async function readLocalManifest() {
      const paths = [
        'apps/indikator/manifest.json',
        './apps/indikator/manifest.json',
        'file:///android_asset/apps/indikator/manifest.json'
      ];
      for (const p of paths) {
        try {
          const res = await fetch(p, { cache: 'no-store' });
          if (res && res.ok) return await res.json();
        } catch (e) {}
      }
      for (const p of paths) {
        try {
          const text = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', p, true);
            xhr.onload = () => (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) ? resolve(xhr.responseText) : reject(new Error('xhr status ' + xhr.status));
            xhr.onerror = reject;
            xhr.send();
          });
          return JSON.parse(text);
        } catch (e) {}
      }
      return fallbackIndicatorsEmbedded || [];
    }
    try {
      const repoIndicators = await readLocalManifest();
      if (Array.isArray(repoIndicators) && repoIndicators.length > 0) {
        indicators = repoIndicators.map((x, idx) => ({
          name: x.name || ('Indikator ' + (idx + 1)),
          category: x.category || 'Library',
          desc: x.desc || x.description || 'Pine Script lokal',
          code: x.code || '',
          url: x.url || x.path || ''
        }));
        selectedIndicator = indicators[0];
      } else {
        indicators = [{ name: 'Kosong', category: 'Empty', desc: 'Tidak ada indikator di manifest lokal.', code: 'Belum ada kode.' }];
        selectedIndicator = indicators[0];
      }
    } catch (err) {
      console.error(err);
      indicators = (fallbackIndicatorsEmbedded || []).length ? fallbackIndicatorsEmbedded : [{ name: 'Error', category: 'Error', desc: 'Manifest lokal tidak terbaca.', code: 'Gagal membaca manifest lokal.' }];
      selectedIndicator = indicators[0];
    }
    if (document.getElementById('indicator-list')) renderIndikator();
  }

  loadRepoIndicators();

  const svgs = {
    mapping: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>`,
    intel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v14H4z"></path><path d="M8 9h8M8 13h5M8 17h8"></path></svg>`,
    journal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14v16H5z"></path><path d="M8 8h8M8 12h8M8 16h5"></path></svg>`,
    academy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-5 9 5-9 5z"></path><path d="M7 12.5V17c2.7 2 7.3 2 10 0v-4.5M21 10v6"></path></svg>`,
    indicator: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"></path><path d="m3 12 6-5 6 4 6-7"></path></svg>`,
    code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`
  };

  const badgeSvgs = {
    Library: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    Jurnal: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
    Learning: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    Mapping: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    News: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"></path><path d="M8 8h8M8 12h8M8 16h5"></path></svg>`,
    Praktik: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"></path></svg>`,
    Replay: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    Latihan: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>`,
    Riwayat: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg>`,
    'System 1': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    'Jalur 03': `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`
  };

  function icon(type) {
    return `<span class="app-icon ${type}">${svgs[type] || ''}</span>`;
  }

  let disposeHomeChart=null;
  let currentRootView = 'beranda';
  let lastMainTab = 'beranda';
  function setActive(target) {
    disposeHomeChart?.();disposeHomeChart=null;
    currentRootView = target;
    if (target !== 'pengaturan') {
      lastMainTab = target;
    }
    const isVideo = t => t === 'video' || t === 'media';
    navBtns.forEach(btn => {
      const match = btn.dataset.target === target || (isVideo(target) && isVideo(btn.dataset.target));
      btn.classList.toggle('active', Boolean(match));
    });
    const gearBtn = document.getElementById('openSettingsBtn');
    if (gearBtn) {
      const isSettings = target === 'pengaturan';
      gearBtn.classList.toggle('is-active', isSettings);
      gearBtn.setAttribute('aria-pressed', isSettings ? 'true' : 'false');
    }
    try { localStorage.setItem('amy_root_tab', target); } catch (_) {}
  }

  function projectCard(item) {
    const badgeIcon = badgeSvgs[item.badge] || '';
    const descMarkup = item.desc ? `<p>${item.desc}</p>` : '';
    return `<button class="card project-card" data-open="${item.id}" data-module="${item.id}">${icon(item.icon)}<span class="card-content"><h3>${item.title}</h3>${descMarkup}<span class="badge">${badgeIcon} ${item.badge}</span></span><span class="chevron" aria-hidden="true">›</span></button>`;
  }

  function quickCard(item, wide = false) {
    const badgeIcon = badgeSvgs[item.badge] || '';
    const descMarkup = item.desc ? `<small>${item.desc}</small>` : '';
    return `<button class="quick-card${wide ? ' quick-card--wide' : ''}" data-open="${item.id}" data-module="${item.id}">${icon(item.icon)}<span><strong>${item.title}</strong>${descMarkup}</span><span class="chevron" aria-hidden="true">›</span></button>`;
  }

  function renderHome() {
    setActive('beranda');
    mainContent.innerHTML = `<section class="home-price-panel" aria-label="Peta harga XAU/USD">
      <div class="section-heading home-price-head">
        <div class="home-price-identity">
          <div class="home-price-title-row">
            <h2>XAU/USD</h2>
            <span class="home-price-subtitle">Peta Harga</span>
          </div>
          <div class="home-price-meta">
            <span id="home-chart-dealing-range-badge" class="dr-badge dr-neutral" title="Status Dealing Range (ICT)">Equilibrium · 50%</span>
            <span class="home-price-sep" aria-hidden="true">·</span>
            <span id="home-chart-source" role="status">Memuat…</span>
          </div>
        </div>
        <div class="home-price-quote">
          <strong id="home-chart-price">—</strong>
        </div>
      </div>
      <div class="home-chart-controls" role="toolbar" aria-label="Kontrol Peta Harga">
        <div class="home-tf-seg" role="group" aria-label="Pilih Timeframe">
          <button type="button" class="home-tf-btn is-active" data-tf="M15" aria-pressed="true">M15</button>
          <button type="button" class="home-tf-btn" data-tf="M5" aria-pressed="false">M5</button>
          <select id="home-chart-tf" class="home-tf-native" aria-label="Timeframe" tabindex="-1"><option value="M15" selected>M15</option><option value="M5">M5</option></select>
        </div>
        <div class="home-chart-actions">
          <button type="button" id="home-chart-alert" class="home-ctrl-btn home-ctrl-btn--alarm" title="Pasang Alarm Target Harga" aria-label="Pasang Alarm Target Harga">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span>Alarm</span>
          </button>
          <button type="button" id="home-chart-refresh" class="home-ctrl-btn home-ctrl-btn--icon" title="Perbarui Chart" aria-label="Perbarui Chart">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          </button>
          <button type="button" id="home-chart-fullscreen" class="home-ctrl-btn home-ctrl-btn--icon" title="Layar Penuh" aria-label="Buka fullscreen Peta Harga" aria-pressed="false">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
          </button>
        </div>
      </div>
      <p id="home-chart-error" role="alert"></p>
      <div id="home-price-chart" aria-label="Chart candlestick XAU/USD dengan level model ICT"></div>
      <p id="home-chart-note"></p>
    </section>
    <section class="home-cmd-strip" id="home-cmd-strip" aria-label="Ringkasan Hari Ini">
      <button type="button" class="home-cmd-cell" id="home-cmd-balance" data-cmd-nav="profil">
        <span class="home-cmd-label">Saldo Aktif</span>
        <strong class="home-cmd-val" id="home-cmd-balance-val">—</strong>
        <span class="home-cmd-sub" id="home-cmd-balance-sub">Sinkron Profil &amp; POI</span>
      </button>
      <button type="button" class="home-cmd-cell" id="home-cmd-session" data-cmd-open="mapping">
        <span class="home-cmd-label">Sesi &amp; News</span>
        <strong class="home-cmd-val" id="home-cmd-session-val">Memuat…</strong>
        <span class="home-cmd-sub" id="home-cmd-session-sub">Kalender USD</span>
      </button>
      <button type="button" class="home-cmd-cell" id="home-cmd-macro" data-cmd-open="news">
        <span class="home-cmd-label">Kompas XAU</span>
        <strong class="home-cmd-val" id="home-cmd-macro-val">Memuat…</strong>
        <span class="home-cmd-sub" id="home-cmd-macro-sub">DXY · US10Y · VIX</span>
      </button>
    </section>
    <div class="section-heading home-menu-heading"><h2>Menu Utama</h2></div><div class="quick-grid slide-up">${projects.map(item => quickCard(item)).join('')}</div>`;
    if (typeof mainContent.querySelector === 'function') {
      const tfSelect = mainContent.querySelector('#home-chart-tf');
      const tfButtons = Array.from(typeof mainContent.querySelectorAll === 'function' ? mainContent.querySelectorAll('.home-tf-btn') : []);
      const syncTfButtons = (val) => {
        tfButtons.forEach((btn) => {
          const active = btn.getAttribute('data-tf') === val;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-pressed', String(active));
        });
      };
      tfButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const nextTf = btn.getAttribute('data-tf');
          if (!tfSelect || !nextTf || tfSelect.value === nextTf) return;
          tfSelect.value = nextTf;
          syncTfButtons(nextTf);
          tfSelect.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
      tfSelect?.addEventListener('change', () => syncTfButtons(tfSelect.value));

      mainContent.querySelector('#home-chart-alert')?.addEventListener('click', () => {
        if (typeof window.AmyPriceAlertManager?.openAddAlertDialog === 'function') {
          window.AmyPriceAlertManager.openAddAlertDialog();
        }
      });
      window.AmyPriceAlertManager?.syncAlertButtonBadges?.();
      if(window.AmyHomeChart)disposeHomeChart=window.AmyHomeChart.mount(mainContent.querySelector('.home-price-panel'));
      if (typeof window.AmyHomeAccountCockpit?.render === 'function') {
        window.AmyHomeAccountCockpit.render();
      }
      populateHomeCommandStrip();
      try { window.dispatchEvent(new CustomEvent('amyfx:home-rendered')); } catch (_) {}
    }
  }

  function resolveHomeGoldSessionSummary(nowDate = new Date()) {
    try {
      const nyParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(nowDate);
      const wd = nyParts.find((p) => p.type === 'weekday')?.value || '';
      const nyHour = Number(nyParts.find((p) => p.type === 'hour')?.value || 0);
      if (wd === 'Sat' || (wd === 'Fri' && nyHour >= 17) || (wd === 'Sun' && nyHour < 17)) {
        return { label: 'Pasar Tutup', tone: 'is-muted', detail: 'Akhir Pekan · Ref Jumat' };
      }
      if (nyHour === 17) {
        return { label: 'Rollover Harian', tone: 'is-warn', detail: 'Spread lebar · tunggu 18:00 NY' };
      }
      const witaHour = (nowDate.getUTCHours() + 8) % 24;
      if (witaHour >= 15 && witaHour <= 18) return { label: 'London Killzone', tone: 'is-pos', detail: 'Likuiditas aktif · WITA' };
      if (witaHour >= 20 && witaHour <= 23) return { label: 'NY AM Killzone', tone: 'is-pos', detail: 'Volatilitas puncak · WITA' };
      if (witaHour >= 7 && witaHour <= 14) return { label: 'Sesi Asia', tone: 'is-flat', detail: 'Range pembentukan likuiditas' };
      if (witaHour === 19) return { label: 'Pre-NY Overlap', tone: 'is-warn', detail: 'Waspada rilis data USD' };
      return { label: 'NY PM / Late', tone: 'is-flat', detail: 'Momentum melambat' };
    } catch (_) {
      return { label: 'Sesi Gold', tone: 'is-flat', detail: 'WITA aktif' };
    }
  }

  function resolveHomeNewsGuardNote() {
    try {
      const raw = localStorage.getItem('amyfx.market.calendar.v1') || localStorage.getItem('amy_economic_calendar_v1');
      if (!raw) return 'Cek jadwal di Berita';
      const parsed = JSON.parse(raw);
      const events = Array.isArray(parsed?.events) ? parsed.events : (Array.isArray(parsed?.items) ? parsed.items : (Array.isArray(parsed) ? parsed : []));
      const nowMs = Date.now();
      const upcomingHigh = events
        .map((ev) => {
          const ts = Number.isFinite(Number(ev?.timestampMs)) && Number(ev.timestampMs) > 0
            ? Number(ev.timestampMs)
            : (ev?.dateIso ? Date.parse(ev.dateIso) : NaN);
          return { ...ev, _ts: ts };
        })
        .filter((ev) => Number.isFinite(ev._ts) && ev._ts >= nowMs - 15 * 60000 && ev._ts <= nowMs + 12 * 3600000)
        .filter((ev) => /high|tinggi|3/i.test(String(ev.impact || 'HIGH')))
        .sort((a, b) => a._ts - b._ts);
      if (!upcomingHigh.length) return 'News Guard: Aman (tidak ada USD High)';
      const next = upcomingHigh[0];
      const diffMin = Math.round((next._ts - nowMs) / 60000);
      const title = String(next.title || next.event || 'USD High').slice(0, 22);
      if (diffMin <= 30 && diffMin >= -15) return `News Lock: ${title}`;
      if (diffMin < 60) return `${title} (${diffMin}m lagi)`;
      return `${title} (${Math.floor(diffMin / 60)}j ${diffMin % 60}m)`;
    } catch (_) {
      return 'News Guard: Aman';
    }
  }

  function summarizeMacroSnapshotForHome(snap) {
    const q = snap?.quotes || {};
    const dxy = q.dxy;
    const y10 = q.us10y;
    const vix = q.vix;
    const parts = [];
    let score = 0;
    let count = 0;
    if (dxy && Number.isFinite(Number(dxy.changePct))) {
      count += 1;
      score += Number(dxy.changePct) <= -0.1 ? 1 : (Number(dxy.changePct) >= 0.1 ? -1 : 0);
      parts.push(`DXY ${Number(dxy.changePct) >= 0 ? '+' : ''}${Number(dxy.changePct).toFixed(2)}%`);
    }
    if (y10 && Number.isFinite(Number(y10.changePct))) {
      count += 1;
      score += Number(y10.changePct) <= -0.3 ? 1 : (Number(y10.changePct) >= 0.3 ? -1 : 0);
      parts.push(`10Y ${Number(y10.price || 0).toFixed(2)}%`);
    }
    if (vix && Number.isFinite(Number(vix.price))) {
      count += 1;
      if (Number(vix.price) >= 22) score += 1;
      parts.push(`VIX ${Number(vix.price).toFixed(1)}`);
    }
    if (!count) {
      return { label: 'Menunggu Data', tone: 'is-muted', sub: 'Ketuk untuk buka Kompas' };
    }
    const label = score >= 1 ? 'Dukung Bullish' : (score <= -1 ? 'Tekanan Bearish' : 'Makro Netral');
    const tone = score >= 1 ? 'is-pos' : (score <= -1 ? 'is-neg' : 'is-flat');
    return { label, tone, sub: parts.slice(0, 2).join(' · ') };
  }

  function populateHomeCommandStrip() {
    const strip = document.getElementById('home-cmd-strip');
    if (!strip) return;

    // Bind navigation clicks
    strip.querySelector('#home-cmd-balance')?.addEventListener('click', () => {
      const profileBtn = document.querySelector('.nav-btn[data-target="profil"]');
      if (profileBtn) profileBtn.click();
    });
    strip.querySelector('#home-cmd-session')?.addEventListener('click', () => {
      openProject('mapping');
    });
    strip.querySelector('#home-cmd-macro')?.addEventListener('click', () => {
      openProject('news');
    });

    // Cell 1: Active Balance (Synced with Profile + Riwayat POI)
    const balValEl = document.getElementById('home-cmd-balance-val');
    const balSubEl = document.getElementById('home-cmd-balance-sub');
    if (balValEl && balSubEl) {
      try {
        const sim = window.AmyAccountSimEngine;
        if (sim && typeof sim.computeAccountSnapshot === 'function') {
          const params = sim.readParams();
          const cashflows = sim.readCashflows();
          const positions = sim.readPositions();
          const poiRecords = sim.readPoiHistoryRecords ? sim.readPoiHistoryRecords() : [];
          let journals = [];
          try {
            const rawJ = JSON.parse(localStorage.getItem('tradingLibraryManager.journals.v1') || '[]');
            if (Array.isArray(rawJ)) journals = rawJ;
          } catch (_) {}
          const snap = sim.computeAccountSnapshot({ params, cashflows, journals, openPositions: positions, poiRecords });
          const fmtMoney = (usd, signed = false) => sim.formatMoney(usd, {
            currency: params.currency,
            usdIdrRate: params.usdIdrRate,
            signed
          });
          balValEl.textContent = fmtMoney(snap.balanceUsd, false);
          balValEl.className = `home-cmd-val ${snap.realizedAllUsd > 0 ? 'is-pos' : (snap.realizedAllUsd < 0 ? 'is-neg' : '')}`;
          const todayTxt = fmtMoney(snap.todayTotalUsd, true);
          balSubEl.textContent = snap.poiClosedCount > 0
            ? `Hari ini ${todayTxt} · ${snap.poiClosedCount} POI`
            : `Hari ini ${todayTxt} · Risiko ${params.riskPct}%`;
        } else {
          const rawBal = Number(localStorage.getItem('amy_default_balance') || 5000);
          balValEl.textContent = `$${rawBal.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          balSubEl.textContent = `Risiko ${localStorage.getItem('amy_default_risk') || '1.5'}% · Profil`;
        }
      } catch (_) {}
    }

    // Cell 2: Gold Session & News Guard
    const sessValEl = document.getElementById('home-cmd-session-val');
    const sessSubEl = document.getElementById('home-cmd-session-sub');
    if (sessValEl && sessSubEl) {
      const sess = resolveHomeGoldSessionSummary();
      sessValEl.textContent = sess.label;
      sessValEl.className = `home-cmd-val ${sess.tone}`;
      const newsNote = resolveHomeNewsGuardNote();
      sessSubEl.textContent = sess.tone === 'is-muted' ? sess.detail : newsNote;
    }

    // Cell 3: Kompas Makro XAU (instant cache + non-blocking refresh)
    const macroValEl = document.getElementById('home-cmd-macro-val');
    const macroSubEl = document.getElementById('home-cmd-macro-sub');
    if (macroValEl && macroSubEl) {
      const applyMacro = (snap) => {
        const m = summarizeMacroSnapshotForHome(snap);
        macroValEl.textContent = m.label;
        macroValEl.className = `home-cmd-val ${m.tone}`;
        macroSubEl.textContent = m.sub;
      };
      let cached = null;
      try {
        cached = JSON.parse(localStorage.getItem('amy_macro_snapshot_v1') || 'null');
      } catch (_) {}
      if (cached && cached.quotes) {
        applyMacro(cached);
      }
      const ageMs = cached ? (Date.now() - Number(cached._fetchedAt || Date.parse(cached.updatedAt || '') || 0)) : Infinity;
      if (!cached || ageMs > 8 * 60 * 1000) {
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const tId = ctrl ? setTimeout(() => ctrl.abort(), 4500) : null;
        fetch('/api/macro-snapshot', { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (!data || !data.quotes) return;
            const snap = { ...data, _fetchedAt: Date.now() };
            try { localStorage.setItem('amy_macro_snapshot_v1', JSON.stringify(snap)); } catch (_) {}
            if (document.getElementById('home-cmd-macro-val')) applyMacro(snap);
          })
          .catch(() => {
            if (!cached && document.getElementById('home-cmd-macro-val')) {
              applyMacro(null);
            }
          })
          .finally(() => { if (tId) clearTimeout(tId); });
      }
    }
  }

  function renderProjectList(title) {
    setActive('proyek');
    mainContent.innerHTML = `<div class="section-heading"><h2>${title || 'Backtest'}</h2></div><div class="quick-grid slide-up">${practiceItems.map((item, idx) => quickCard(item, idx === 0)).join('')}</div>`;
  }

  // ─── AMY FX PRO ROOT MEDIA HUB & VAULT ──────────────────────────────
  const MEDIA_DB_NAME = 'tradingLibraryManager.files';
  const MEDIA_DB_VERSION = 2;
  const MEDIA_FILE_STORE = 'files';
  const MEDIA_META_STORE = 'metadata';
  const MEDIA_ITEMS_META_RECORD = 'items.v2';
  const MEDIA_LEGACY_KEY = 'tradingLibraryManager.items.v1';

  let mediaDbPromise = null;
  function openMediaDb() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB tidak tersedia'));
    if (mediaDbPromise) return mediaDbPromise;
    mediaDbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(MEDIA_DB_NAME, MEDIA_DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(MEDIA_FILE_STORE)) db.createObjectStore(MEDIA_FILE_STORE, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(MEDIA_META_STORE)) db.createObjectStore(MEDIA_META_STORE, { keyPath: 'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return mediaDbPromise;
  }

  async function getMediaMetadataRecord(recordId) {
    try {
      const db = await openMediaDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_META_STORE, 'readonly');
        const req = tx.objectStore(MEDIA_META_STORE).get(recordId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (_) { return null; }
  }

  async function putMediaMetadataRecord(record) {
    try {
      const db = await openMediaDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_META_STORE, 'readwrite');
        const req = tx.objectStore(MEDIA_META_STORE).put(record);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (_) { return false; }
  }

  async function getMediaFileRecord(fileId) {
    if (!fileId) return null;
    try {
      const db = await openMediaDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_FILE_STORE, 'readonly');
        const req = tx.objectStore(MEDIA_FILE_STORE).get(fileId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (_) { return null; }
  }

  async function putMediaFileRecord(record) {
    try {
      const db = await openMediaDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_FILE_STORE, 'readwrite');
        const req = tx.objectStore(MEDIA_FILE_STORE).put(record);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (_) { return false; }
  }

  async function deleteMediaFileRecord(fileId) {
    if (!fileId) return;
    try {
      const db = await openMediaDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_FILE_STORE, 'readwrite');
        const req = tx.objectStore(MEDIA_FILE_STORE).delete(fileId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    } catch (_) {}
  }

  async function loadAllMediaItems() {
    const itemMap = new Map();
    // 1. IndexedDB items.v2 (Library Utama)
    try {
      const rec = await getMediaMetadataRecord(MEDIA_ITEMS_META_RECORD);
      if (Array.isArray(rec?.value)) {
        rec.value.forEach(it => { if (it && it.id) itemMap.set(it.id, it); });
      }
    } catch (_) {}

    // 2. localStorage tradingLibraryManager.items.v1 (Legacy Library)
    try {
      const legacy = JSON.parse(localStorage.getItem(MEDIA_LEGACY_KEY) || '[]');
      if (Array.isArray(legacy)) {
        legacy.forEach(it => { if (it && it.id && !itemMap.has(it.id)) itemMap.set(it.id, it); });
      }
    } catch (_) {}

    // 3. localStorage amy_media_items
    try {
      const extra = JSON.parse(localStorage.getItem('amy_media_items') || '[]');
      if (Array.isArray(extra)) {
        extra.forEach(it => { if (it && it.id && !itemMap.has(it.id)) itemMap.set(it.id, it); });
      }
    } catch (_) {}

    // 4. Video attachments dari Jurnal Trading (IndexedDB journals.v2 + fallback localStorage)
    try {
      let journals = [];
      try {
        const idbJournals = await getMediaMetadataRecord('journals.v2');
        if (Array.isArray(idbJournals?.value)) journals = idbJournals.value;
      } catch (_) {}
      if (!journals.length) {
        const journalsRaw = localStorage.getItem('tradingLibraryManager.journals.v1') || localStorage.getItem('amy_journal_entries') || '[]';
        const parsed = JSON.parse(journalsRaw);
        if (Array.isArray(parsed)) journals = parsed;
      }
      if (Array.isArray(journals)) {
        journals.forEach(j => {
          (j?.attachments || []).forEach(att => {
            const isVid = att.kind === 'video' || (att.type && String(att.type).startsWith('video/')) || /\.(mp4|mkv|webm|ogg|mov|m4v|3gp|avi)$/i.test(att.name || '');
            if (isVid) {
              const attId = att.id || att.fileId || `journal_vid_${j.id}_${att.name}`;
              if (!itemMap.has(attId)) {
                itemMap.set(attId, {
                  id: attId,
                  journalId: j.id || '',
                  title: att.name || j.title || 'Video Jurnal Trading',
                  type: 'Video Pembelajaran',
                  category: 'Video',
                  status: 'Selesai dibaca',
                  collection: 'Jurnal',
                  tags: ['Video', 'Jurnal'],
                  fileId: att.fileId || '',
                  nativeUri: att.nativeUri || att.uri || '',
                  externalUri: att.externalUri || att.uri || '',
                  mediaUrl: att.mediaUrl || att.url || '',
                  thumbnailUrl: att.thumbnailUrl || att.thumbnailUri || '',
                  mediaKind: 'video',
                  mediaName: att.name || 'video.mp4',
                  mediaType: att.type || 'video/mp4',
                  mediaSize: Number(att.size || 0),
                  createdAt: j.date || j.createdAt || new Date().toISOString()
                });
              }
            }
          });
        });
      }
    } catch (_) {}

    return Array.from(itemMap.values());
  }

  async function saveAllMediaItems(items) {
    const cleaned = items.map(it => {
      const { data, file, blob, objectUrl, textPreview, ...meta } = it;
      return meta;
    });
    await putMediaMetadataRecord({ id: MEDIA_ITEMS_META_RECORD, value: cleaned, updatedAt: new Date().toISOString() });
    try { localStorage.setItem(MEDIA_LEGACY_KEY, JSON.stringify(cleaned)); } catch (_) {}
  }

  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  let currentMediaFilter = 'Semua';
  let currentMediaSearch = '';
  const MEDIA_WATCHED_STORAGE_KEY = 'amy_media_watched_v1';

  function getWatchedMediaSet() {
    try {
      const raw = JSON.parse(localStorage.getItem(MEDIA_WATCHED_STORAGE_KEY) || '[]');
      return new Set(Array.isArray(raw) ? raw.map(String) : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveWatchedMediaSet(set) {
    try {
      localStorage.setItem(MEDIA_WATCHED_STORAGE_KEY, JSON.stringify(Array.from(set).slice(-300)));
    } catch (_) {}
  }

  function markMediaWatched(itemId, watched = true) {
    if (!itemId) return;
    const set = getWatchedMediaSet();
    if (watched) set.add(String(itemId));
    else set.delete(String(itemId));
    saveWatchedMediaSet(set);
  }

  const activeMediaThumbUrls = new Set();
  let mediaSearchDebounceTimer = null;

  function revokeActiveMediaThumbUrls() {
    activeMediaThumbUrls.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch (_) {}
    });
    activeMediaThumbUrls.clear();
  }

  async function renderMedia(options = {}) {
    setActive('video');
    const allItems = await loadAllMediaItems();
    const watchedSet = getWatchedMediaSet();

    const isMediaItem = item => {
      return item.mediaKind === 'image' || item.mediaKind === 'video' || item.mediaKind === 'audio' ||
             item.type === 'Gambar Chart' || item.type === 'Video Pembelajaran' ||
             item.collection === 'Media' || Boolean(item.fileId && item.mediaName);
    };

    const isDocItem = item => {
      return item.mediaKind === 'document' || item.type === 'Dokumen' || Boolean(item.documentType);
    };

    const baseLibrary = allItems.filter(it => isMediaItem(it) || isDocItem(it));
    const hasAnyVideo = baseLibrary.some(isVideoMediaItem);

    function computeFiltered(list) {
      let filtered = list;
      if (currentMediaFilter === 'Video') {
        filtered = list.filter(it => it.mediaKind === 'video' || it.type === 'Video Pembelajaran' || (it.mediaType && it.mediaType.startsWith('video/')));
      } else if (currentMediaFilter === 'Belum') {
        filtered = list.filter(it => isVideoMediaItem(it) && !watchedSet.has(String(it.id)));
      } else if (currentMediaFilter === 'Gambar') {
        filtered = list.filter(it => it.mediaKind === 'image' || it.type === 'Gambar Chart' || (it.mediaType && it.mediaType.startsWith('image/')));
      } else if (currentMediaFilter === 'Dokumen') {
        filtered = list.filter(isDocItem);
      }

      const q = String(currentMediaSearch || '').trim().toLowerCase();
      if (q) {
        filtered = filtered.filter(it =>
          String(it.title || '').toLowerCase().includes(q) ||
          String(it.category || '').toLowerCase().includes(q) ||
          String(it.notes || '').toLowerCase().includes(q)
        );
      }
      return { filtered, q };
    }

    function buildResultsHtml(filtered, q) {
      if (filtered.length === 0) {
        const emptyMsg = q
          ? `Tidak ditemukan media untuk "${escapeHtml(currentMediaSearch)}".`
          : currentMediaFilter === 'Belum'
            ? (hasAnyVideo ? 'Semua video sudah ditonton.' : 'Belum ada video tersimpan')
            : 'Belum ada item tersimpan';
        return `
          <div class="empty-state-card media-empty-clean slide-up">
            <strong class="media-empty-title">${emptyMsg} <button type="button" class="amy-info-btn" data-info-tip="Simpan rekaman video replay setup XAU/USD, video materi, screenshot chart, atau dokumen trading Anda. Semua fitur Video Reel, Timer Tidur, dan Scan HP tetap aktif." aria-label="Info media" aria-expanded="false">i</button></strong>
            ${q || currentMediaFilter !== 'Semua'
              ? `<button type="button" id="rootResetMediaFilterBtn" class="media-upload-btn">Tampilkan Semua</button>`
              : `<button type="button" id="rootEmptyUploadMediaBtn" class="media-upload-btn">+ Upload Media</button>`}
          </div>
        `;
      }

      const cardsHTML = filtered.map(item => {
        const isVid = isVideoMediaItem(item);
        const isDoc = isDocItem(item);
        const isAudio = item.mediaKind === 'audio' || (item.mediaType && item.mediaType.startsWith('audio/'));
        const isWatched = watchedSet.has(String(item.id));
        const itemSize = formatBytes(item.mediaSize || item.fileSize || 0);
        const metaParts = [item.category || item.type || 'Media', itemSize];
        if (isVid && isWatched) metaParts.push('Ditonton');

        let thumbMarkup = '';
        if (isVid) {
          thumbMarkup = `
            <div class="media-video-thumb is-loading" data-video-thumb-id="${escapeHtml(item.id)}" aria-hidden="true"></div>
            <div class="media-play-overlay" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8 5 19 12 8 19 8 5"></polygon></svg></div>
            ${isWatched ? '<span class="media-watched-tag">✓ Ditonton</span>' : '<span class="media-video-badge">▶ Video</span>'}
          `;
        } else if (isAudio) {
          thumbMarkup = `
            <div class="media-doc-box">
              <strong style="font-size:22px;">🎵</strong>
              <strong style="font-size:11px; letter-spacing:0.05em;">AUDIO</strong>
            </div>
          `;
        } else if (isDoc) {
          const docLabel = (item.documentType || (item.mediaName ? item.mediaName.split('.').pop() : 'DOC')).toUpperCase();
          thumbMarkup = `
            <div class="media-doc-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <strong style="font-size:11px; letter-spacing:0.05em;">${escapeHtml(docLabel)}</strong>
            </div>
          `;
        } else {
          thumbMarkup = `<img class="media-thumb-img" data-media-thumb="${item.fileId || ''}" alt="${escapeHtml(item.title)}" loading="lazy" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 10'%3E%3Crect width='16' height='10' fill='%230b1020'/%3E%3C/svg%3E">`;
        }

        return `
          <article class="media-card media-card--clean slide-up ${isWatched ? 'is-watched' : ''}" data-item-id="${escapeHtml(item.id)}">
            <div class="media-thumb-box" data-view-media="${escapeHtml(item.id)}">
              ${thumbMarkup}
            </div>
            <div class="media-card-body">
              <div class="media-card-meta-line">${escapeHtml(metaParts.join(' · '))}</div>
              <strong class="media-card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</strong>
              <div class="media-card-actions">
                <button type="button" class="media-card-btn${isVid ? ' is-video-action' : ''}" data-view-media="${escapeHtml(item.id)}">
                  <span>${isVid ? '▶ Putar' : (isAudio ? '▶ Audio' : 'Buka')}</span>
                </button>
                ${isVid ? `<button type="button" class="media-card-btn media-watch-btn ${isWatched ? 'is-watched' : ''}" data-toggle-watched="${escapeHtml(item.id)}" title="${isWatched ? 'Tandai belum ditonton' : 'Tandai sudah ditonton'}" aria-label="${isWatched ? 'Tandai belum ditonton' : 'Tandai sudah ditonton'}">${isWatched ? '✓' : '○'}</button>` : ''}
                <button type="button" class="media-card-btn danger-btn" data-delete-media="${escapeHtml(item.id)}" data-confirm-arm="0" title="Hapus Media" aria-label="Hapus Media">
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      return `<div class="media-grid">${cardsHTML}</div>`;
    }

    function hydrateResultsHost(host, filtered) {
      revokeActiveMediaThumbUrls();
      if (!host) return;
      host.querySelectorAll('[data-media-thumb]').forEach(async img => {
        const fileId = img.dataset.mediaThumb;
        if (!fileId) return;
        const fileRec = await getMediaFileRecord(fileId);
        if (fileRec?.blob && img.isConnected) {
          const url = URL.createObjectURL(fileRec.blob);
          activeMediaThumbUrls.add(url);
          img.src = url;
        }
      });
      host.querySelectorAll('[data-video-thumb-id]').forEach(el => {
        const item = filtered.find(it => it.id === el.dataset.videoThumbId);
        const cached = item ? getCachedVideoThumb(item) : '';
        if (cached) applyVideoThumbToEl(el, cached);
        else getVideoThumbObserver().observe(el);
      });
      host.querySelector('#rootResetMediaFilterBtn')?.addEventListener('click', () => {
        currentMediaFilter = 'Semua';
        currentMediaSearch = '';
        renderMedia({ autoPlay: false });
      });
    }

    const { filtered: filteredItems, q } = computeFiltered(baseLibrary);
    const totalMediaCount = baseLibrary.length;
    const watchedCount = baseLibrary.filter(it => watchedSet.has(String(it.id))).length;
    const countLabel = totalMediaCount > 0
      ? `${totalMediaCount} item${watchedCount > 0 ? ` · ${watchedCount} ditonton` : ''}`
      : 'Belum ada media tersimpan';

    const pillsHTML = [
      { id: 'Semua', label: `Semua (${totalMediaCount})` },
      { id: 'Video', label: 'Video' },
      { id: 'Belum', label: 'Belum Ditonton' },
      { id: 'Gambar', label: 'Gambar' },
      { id: 'Dokumen', label: 'Dokumen' }
    ].map(p => `
      <button class="pill ${currentMediaFilter === p.id ? 'active' : ''}" data-media-filter="${p.id}" type="button">${p.label}</button>
    `).join('');

    revokeActiveMediaThumbUrls();

    mainContent.innerHTML = `
      <div class="media-section-head media-section-head--clean">
        <div class="page-title-group">
          <h2>Video &amp; Media <button type="button" class="amy-info-btn" data-info-tip="Putar video dalam mode Reel layar penuh lengkap dengan Auto-Next/Loop dan Timer Tidur, atau simpan chart &amp; PDF trading lokal." aria-label="Info video" aria-expanded="false">i</button></h2>
          <small class="media-count-meta">${countLabel}</small>
        </div>
        <div class="media-head-actions">
          <input type="file" id="rootMediaFileInput" multiple accept="video/*,image/*,audio/*,.mp4,.mkv,.webm,.ogg,.mov,.m4v,.png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.txt" style="display:none;">
          <button type="button" id="rootUploadMediaBtn" class="media-upload-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div class="media-toolbar-clean">
        <input type="search" id="rootMediaSearchInput" class="media-search-input" placeholder="Cari video, chart, atau dokumen..." value="${escapeHtml(currentMediaSearch)}" autocomplete="off" aria-label="Cari media">
        <div class="media-filter-pills">${pillsHTML}</div>
      </div>

      <div id="rootMediaResultsHost">${buildResultsHtml(filteredItems, q)}</div>

      <a href="apps/journal/index.html" class="media-journal-shortcut media-journal-shortcut--clean">
        <strong>Jurnal Trading &amp; Disiplin</strong>
        <span class="chevron" aria-hidden="true">›</span>
      </a>
    `;

    const resultsHost = document.getElementById('rootMediaResultsHost');
    hydrateResultsHost(resultsHost, filteredItems);

    const fileInput = document.getElementById('rootMediaFileInput');
    fileInput?.addEventListener('change', handleRootMediaUpload);

    const searchInput = document.getElementById('rootMediaSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        currentMediaSearch = e.target.value || '';
        clearTimeout(mediaSearchDebounceTimer);
        mediaSearchDebounceTimer = setTimeout(() => {
          const host = document.getElementById('rootMediaResultsHost');
          if (!host) return;
          const next = computeFiltered(baseLibrary);
          host.innerHTML = buildResultsHtml(next.filtered, next.q);
          hydrateResultsHost(host, next.filtered);
        }, 120);
      });
    }

    const videoItems = allItems.filter(isVideoMediaItem);
    if (options.autoPlay && !reelState.open && videoItems.length > 0) {
      openVideoReel(videoItems[0]);
    }
  }

  // ─── VIDEO THUMBNAIL ENGINE & REEL FEED (paritas dengan Jurnal Trading) ───
  function isVideoMediaItem(item) {
    if (!item) return false;
    if (item.mediaKind === 'video') return true;
    if (item.type === 'Video' || item.type === 'Video Pembelajaran') return true;
    if (item.category === 'Video' || item.category === 'Video Replay') return true;
    if (item.mediaType && String(item.mediaType).toLowerCase().startsWith('video/')) return true;
    const path = String(item.mediaName || item.title || item.nativeUri || item.externalUri || item.mediaUrl || '').toLowerCase();
    return /\.(mp4|mkv|webm|ogg|mov|m4v|3gp|avi)(\?.*)?$/i.test(path);
  }

  function toWebViewSrc(value) {
    const v = String(value || '');
    if (!v) return '';
    if (v.startsWith('content://')) return v;
    if (v.startsWith('file://') && window.Capacitor?.convertFileSrc) {
      try { return window.Capacitor.convertFileSrc(v); } catch (_) {}
    }
    return v;
  }

  function getCachedVideoThumb(item) {
    return toWebViewSrc(item.thumbnailUrl || item.thumbnailUri || item.videoThumb || item.imageThumb || '');
  }

  function triggerStorageScan() {
    if (window.TradingStorageScanner && typeof window.TradingStorageScanner.scanFiles === 'function') {
      try { window.TradingStorageScanner.scanFiles(); } catch (_) {}
    }
  }

  function requestNativeThumbnail(item) {
    const nativeUri = item.nativeUri || item.externalUri || (String(item.mediaUrl || '').startsWith('content://') ? item.mediaUrl : '');
    if (!item?.id || !nativeUri) return;
    if (window.TradingStorageScanner && typeof window.TradingStorageScanner.requestThumbnail === 'function') {
      try { window.TradingStorageScanner.requestThumbnail(item.id, nativeUri, 'video'); } catch (_) {}
    }
  }

  function handleThumbnailResult(detail) {
    const itemId = detail?.itemId || detail?.id || '';
    const thumb = detail?.thumbnailUri || detail?.thumbnailUrl || '';
    if (itemId && thumb) applyVideoThumbToDom(itemId, toWebViewSrc(thumb));
  }
  window.addEventListener('trading_storage_thumbnail_result', e => handleThumbnailResult(e?.detail));
  window.addEventListener('amyNativeThumbnailResult', e => handleThumbnailResult(e?.detail));
  window.handleNativeThumbnailResult = detail => handleThumbnailResult(detail);

  async function handleScanResult(detail) {
    const status = detail?.status || '';
    const files = Array.isArray(detail?.files) ? detail.files : [];
    if (status === 'success' && files.length) {
      const now = new Date().toISOString();
      const current = await loadAllMediaItems();
      const newItems = [];
      for (const f of files) {
        const uri = f.uri || f.contentUri || '';
        if (!uri) continue;
        const name = f.name || f.displayName || 'Video Trading';
        const isVid = f.mimeType?.startsWith('video/') || /\.(mp4|mkv|webm|ogg|mov|m4v|3gp|avi)$/i.test(name);
        if (!isVid) continue;
        if (current.some(it => it.nativeUri === uri || it.mediaUrl === uri || it.externalUri === uri)) continue;
        newItems.push({
          id: 'scan_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          title: name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          type: 'Video Pembelajaran',
          category: 'Video',
          status: 'Belum dibaca',
          collection: 'Scan HP',
          tags: ['Video', 'Scan HP'],
          notes: 'File video dari scan storage HP.',
          nativeUri: uri,
          externalUri: uri,
          thumbnailUrl: f.thumbnailUri || f.thumbnailUrl || '',
          mediaKind: 'video',
          mediaName: name,
          mediaType: f.mimeType || 'video/mp4',
          mediaSize: Number(f.size || 0),
          createdAt: now,
          updatedAt: now
        });
      }
      if (newItems.length > 0) {
        await saveAllMediaItems([...newItems, ...current]);
        if (localStorage.getItem('amy_root_tab') === 'video') {
          await renderMedia({ autoPlay: false });
          if (!reelState.open) {
            const freshAll = await loadAllMediaItems();
            const freshVids = freshAll.filter(isVideoMediaItem);
            if (freshVids.length > 0) openVideoReel(freshVids[0]);
          }
        }
      }
    }
  }
  window.addEventListener('trading_storage_scan_result', e => handleScanResult(e?.detail));
  window.addEventListener('amyNativeStorageScanResult', e => handleScanResult(e?.detail));
  window.handleNativeStorageScanResult = detail => handleScanResult(detail);

  async function resolveMediaSource(item, trackSet) {
    if (!item) return '';
    if (item.blob) {
      const url = URL.createObjectURL(item.blob);
      trackSet?.add(url);
      return url;
    }
    const direct = toWebViewSrc(item.mediaUrl || '');
    if (direct && !direct.startsWith('blob:')) return direct;
    const nativeUri = item.nativeUri || item.externalUri || (String(item.mediaUrl || '').startsWith('content://') ? item.mediaUrl : '');
    if (nativeUri) return toWebViewSrc(nativeUri);
    if (!item.fileId) return '';
    const rec = await getMediaFileRecord(item.fileId);
    if (!rec?.blob) return '';
    let blob = rec.blob;
    const mime = rec.type || item.mediaType || 'video/mp4';
    if (!blob.type || blob.type === 'application/octet-stream') blob = new Blob([blob], { type: mime });
    const url = URL.createObjectURL(blob);
    trackSet?.add(url);
    return url;
  }

  function applyVideoThumbToEl(el, thumb) {
    el.classList.remove('is-loading');
    el.classList.add('has-thumb');
    el.style.backgroundImage = `linear-gradient(rgba(0,0,0,.08), rgba(0,0,0,.4)), url("${thumb}")`;
  }

  function applyVideoThumbToDom(itemId, thumb) {
    document.querySelectorAll(`[data-video-thumb-id="${CSS.escape(itemId)}"]`).forEach(el => applyVideoThumbToEl(el, thumb));
  }

  function captureVideoFrame(source) {
    return new Promise(resolve => {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      if (!source.startsWith('blob:') && !source.startsWith('content://')) video.crossOrigin = 'anonymous';
      let done = false;
      const finish = (value = '') => {
        if (done) return;
        done = true;
        video.removeAttribute('src');
        try { video.load(); } catch (_) {}
        resolve(value);
      };
      const capture = () => {
        if (!video.videoWidth || !video.videoHeight) return finish('');
        try {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(1, 360 / video.videoWidth);
          canvas.width = Math.max(1, Math.round(video.videoWidth * ratio));
          canvas.height = Math.max(1, Math.round(video.videoHeight * ratio));
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          finish(canvas.toDataURL('image/jpeg', 0.66));
        } catch (_) { finish(''); }
      };
      video.addEventListener('error', () => finish(''), { once: true });
      video.addEventListener('loadedmetadata', () => {
        try {
          video.currentTime = Number.isFinite(video.duration) && video.duration > 1 ? Math.min(1, video.duration * 0.08) : 0;
        } catch (_) { capture(); }
      }, { once: true });
      video.addEventListener('seeked', capture, { once: true });
      video.addEventListener('loadeddata', () => setTimeout(capture, 120), { once: true });
      setTimeout(() => finish(''), 3500);
      video.src = source;
    });
  }

  const videoThumbQueue = [];
  const videoThumbFailed = new Set();
  let videoThumbBusy = false;
  let videoThumbObserver = null;

  function getVideoThumbObserver() {
    if (videoThumbObserver) return videoThumbObserver;
    videoThumbObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        videoThumbObserver.unobserve(entry.target);
        const id = entry.target.dataset.videoThumbId;
        if (id && !videoThumbQueue.includes(id) && !videoThumbFailed.has(id)) videoThumbQueue.push(id);
      });
      processVideoThumbQueue();
    }, { rootMargin: '200px' });
    return videoThumbObserver;
  }

  async function processVideoThumbQueue() {
    if (videoThumbBusy) return;
    if (reelState.open) { setTimeout(processVideoThumbQueue, 1500); return; }
    const id = videoThumbQueue.shift();
    if (!id) return;
    videoThumbBusy = true;
    try {
      const items = await loadAllMediaItems();
      const item = items.find(it => it.id === id);
      const cached = item ? getCachedVideoThumb(item) : '';
      if (cached) {
        applyVideoThumbToDom(id, cached);
      } else if (item) {
        const urls = new Set();
        const src = await resolveMediaSource(item, urls);
        const thumb = src ? await captureVideoFrame(src) : '';
        urls.forEach(u => URL.revokeObjectURL(u));
        if (thumb) {
          const fresh = await loadAllMediaItems();
          await saveAllMediaItems(fresh.map(it => it.id === id ? { ...it, videoThumb: thumb } : it));
          applyVideoThumbToDom(id, thumb);
        } else {
          videoThumbFailed.add(id);
          document.querySelectorAll(`[data-video-thumb-id="${CSS.escape(id)}"]`).forEach(el => el.classList.remove('is-loading'));
        }
      }
    } catch (_) {}
    videoThumbBusy = false;
    setTimeout(processVideoThumbQueue, 200);
  }

  const reelState = {
    open: false,
    dialog: null,
    observer: null,
    urls: new Set(),
    pushedHistory: false,
    sleepTimerTarget: 0,
    sleepTimerInterval: null,
    sleepTimerMode: 'off',
    sleepTimerMinutes: 0
  };

  const REEL_PLAY_MODE_KEY = 'amy_reel_play_mode';
  function getReelPlayMode() {
    try {
      return localStorage.getItem(REEL_PLAY_MODE_KEY) || 'auto_next';
    } catch (_) {
      return 'auto_next';
    }
  }
  function setReelPlayMode(mode) {
    try {
      localStorage.setItem(REEL_PLAY_MODE_KEY, mode);
    } catch (_) {}
  }

  function clearReelSleepTimer() {
    if (reelState.sleepTimerInterval) {
      clearInterval(reelState.sleepTimerInterval);
      reelState.sleepTimerInterval = null;
    }
    reelState.sleepTimerTarget = 0;
    reelState.sleepTimerMode = 'off';
    reelState.sleepTimerMinutes = 0;
  }

  function triggerSleepTimerExpiry() {
    clearReelSleepTimer();
    const dialog = reelState.dialog;
    if (!dialog || !reelState.open) return;
    const activeVideo = dialog.querySelector('.amy-reel-panel[data-is-active="1"] video');
    if (activeVideo && !activeVideo.paused) {
      let vol = activeVideo.volume;
      const fadeStep = Math.max(0.05, vol / 8);
      const fadeTimer = setInterval(() => {
        vol = Math.max(0, vol - fadeStep);
        try { activeVideo.volume = vol; } catch (_) {}
        if (vol <= 0.05) {
          clearInterval(fadeTimer);
          closeVideoReel();
          showToast('🌙 Waktu tidur tercapai. Video dihentikan otomatis.');
        }
      }, 120);
    } else {
      closeVideoReel();
      showToast('🌙 Waktu tidur tercapai. Video dihentikan otomatis.');
    }
  }

  function shuffleMedia(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function closeVideoReel(fromPopState = false) {
    if (!reelState.open && !document.body.classList.contains('is-reel-open') && !document.getElementById('rootVideoReelDialog')?.hasAttribute('open')) return;
    reelState.open = false;
    clearReelSleepTimer();
    reelState.observer?.disconnect();
    reelState.observer = null;
    const dialog = reelState.dialog || document.getElementById('rootVideoReelDialog');
    dialog?.querySelectorAll('video').forEach(v => {
      v.pause();
      v.removeAttribute('src');
      try { v.load(); } catch (_) {}
    });
    reelState.urls.forEach(u => URL.revokeObjectURL(u));
    reelState.urls.clear();
    if (dialog) {
      if (typeof dialog.close === 'function' && dialog.open) {
        try { dialog.close(); } catch (_) {}
      }
      dialog.removeAttribute('open');
      dialog.style.display = 'none';
      dialog.innerHTML = '';
    }
    document.documentElement.classList.remove('is-reel-open');
    document.body.classList.remove('is-reel-open');
    window.AmyScrollGuard?.unlock?.('video-reel');
    if (reelState.pushedHistory && !fromPopState && history.state?.amyReel) history.back();
    reelState.pushedHistory = false;
    if (currentRootView === 'video') {
      renderMedia({ autoPlay: false });
    }
  }
  window.AmyFXCloseVideoReel = closeVideoReel;

  window.addEventListener('popstate', () => { if (reelState.open) closeVideoReel(true); });

  async function openVideoReel(activeItem) {
    if (activeItem?.id) markMediaWatched(activeItem.id, true);
    const all = await loadAllMediaItems();
    const others = shuffleMedia(all.filter(it => isVideoMediaItem(it) && it.id !== activeItem.id)).slice(0, 20);
    const feedItems = [activeItem, ...others];

    let dialog = document.getElementById('rootVideoReelDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'rootVideoReelDialog';
      dialog.className = 'amy-reel-dialog';
      dialog.style.display = 'none';
      dialog.addEventListener('cancel', e => { e.preventDefault(); closeVideoReel(); });
      document.body.appendChild(dialog);
    }
    reelState.dialog = dialog;

    dialog.innerHTML = `
      <div class="amy-reel-bar">
        <div class="amy-reel-title-box">
          <small id="amyReelMeta"></small>
          <h3 id="amyReelTitle"></h3>
        </div>
        <div class="amy-reel-actions">
          <button type="button" class="amy-reel-btn" id="amyReelPlayModeBtn" title="Mode Putar: Auto-Next / Loop">
            <span class="amy-reel-btn-icon" id="amyReelModeIcon">🔁</span>
            <span class="amy-reel-btn-label" id="amyReelModeLabel">Auto</span>
          </button>
          <button type="button" class="amy-reel-btn" id="amyReelSleepTimerBtn" title="Timer Tidur">
            <span class="amy-reel-btn-icon">🌙</span>
            <span class="amy-reel-btn-label" id="amyReelTimerBadge">Timer</span>
          </button>
          <button type="button" class="amy-reel-close" id="amyReelClose" aria-label="Tutup">×</button>
        </div>
      </div>
      <div class="amy-reel-feed"></div>
      <div class="amy-reel-timer-sheet" id="amyReelTimerSheet" hidden>
        <div class="amy-reel-sheet-backdrop" id="amyReelSheetBackdrop"></div>
        <div class="amy-reel-sheet-card">
          <div class="amy-reel-sheet-header">
            <div class="amy-reel-sheet-title">
              <span style="font-size:18px;">🌙</span>
              <strong>Timer Tidur <button type="button" class="amy-info-btn" data-info-tip="Pilih kapan video berhenti otomatis agar Anda bisa istirahat dengan nyaman." aria-label="Info timer tidur" aria-expanded="false">i</button></strong>
            </div>
            <button type="button" class="amy-reel-sheet-close" id="amyReelSheetCloseBtn" aria-label="Tutup Menu">×</button>
          </div>
          <div class="amy-reel-sheet-grid" id="amyReelTimerGrid">
            <button type="button" class="amy-timer-btn" data-timer-val="off">
              <span class="timer-btn-icon">❌</span>
              <span class="timer-btn-text">Nonaktif</span>
            </button>
            <button type="button" class="amy-timer-btn" data-timer-val="15">
              <span class="timer-btn-icon">⏱️</span>
              <span class="timer-btn-text">15 Menit</span>
            </button>
            <button type="button" class="amy-timer-btn" data-timer-val="30">
              <span class="timer-btn-icon">⏱️</span>
              <span class="timer-btn-text">30 Menit</span>
            </button>
            <button type="button" class="amy-timer-btn" data-timer-val="45">
              <span class="timer-btn-icon">⏱️</span>
              <span class="timer-btn-text">45 Menit</span>
            </button>
            <button type="button" class="amy-timer-btn" data-timer-val="60">
              <span class="timer-btn-icon">⏱️</span>
              <span class="timer-btn-text">1 Jam</span>
            </button>
            <button type="button" class="amy-timer-btn" data-timer-val="120">
              <span class="timer-btn-icon">⏱️</span>
              <span class="timer-btn-text">2 Jam</span>
            </button>
            <button type="button" class="amy-timer-btn col-span-2" data-timer-val="end_of_video">
              <span class="timer-btn-icon">🎬</span>
              <span class="timer-btn-text">Sampai Video Ini Selesai</span>
            </button>
          </div>
          <div class="amy-reel-sheet-custom">
            <label for="amyReelCustomMinInput">Atur Sendiri (Menit):</label>
            <div class="amy-custom-input-group">
              <input type="number" id="amyReelCustomMinInput" min="1" max="600" placeholder="Misal: 90" inputmode="numeric">
              <button type="button" id="amyReelCustomApplyBtn">Setel</button>
            </div>
          </div>
        </div>
      </div>
    `;
    const feed = dialog.querySelector('.amy-reel-feed');
    const titleEl = dialog.querySelector('#amyReelTitle');
    const metaEl = dialog.querySelector('#amyReelMeta');
    dialog.querySelector('#amyReelClose').addEventListener('click', () => closeVideoReel());

    // Setup Play Mode (Auto-Next vs Loop)
    let currentPlayMode = getReelPlayMode();
    const modeBtn = dialog.querySelector('#amyReelPlayModeBtn');
    const modeIcon = dialog.querySelector('#amyReelModeIcon');
    const modeLabel = dialog.querySelector('#amyReelModeLabel');

    function updatePlayModeUI() {
      if (currentPlayMode === 'loop') {
        modeBtn.classList.add('is-active');
        modeIcon.textContent = '🔂';
        modeLabel.textContent = 'Loop';
        modeBtn.setAttribute('title', 'Mode: Ulang Video Ini (Ketuk untuk beralih ke Auto-Next)');
      } else {
        modeBtn.classList.remove('is-active');
        modeIcon.textContent = '🔁';
        modeLabel.textContent = 'Auto';
        modeBtn.setAttribute('title', 'Mode: Lanjut Otomatis (Ketuk untuk beralih ke Loop)');
      }
      dialog.querySelectorAll('.amy-reel-video').forEach(v => {
        v.loop = (reelState.sleepTimerMode === 'end_of_video') ? false : (currentPlayMode === 'loop');
      });
    }
    updatePlayModeUI();

    modeBtn.addEventListener('click', e => {
      e.stopPropagation();
      currentPlayMode = (currentPlayMode === 'loop') ? 'auto_next' : 'loop';
      setReelPlayMode(currentPlayMode);
      updatePlayModeUI();
      showToast(currentPlayMode === 'loop' ? '🔂 Mode: Ulang Video yang Sama' : '🔁 Mode: Lanjut Otomatis ke Video Berikutnya');
    });

    // Setup Sleep Timer
    const timerBtn = dialog.querySelector('#amyReelSleepTimerBtn');
    const timerBadge = dialog.querySelector('#amyReelTimerBadge');
    const timerSheet = dialog.querySelector('#amyReelTimerSheet');
    const sheetCloseBtn = dialog.querySelector('#amyReelSheetCloseBtn');
    const sheetBackdrop = dialog.querySelector('#amyReelSheetBackdrop');
    const timerGrid = dialog.querySelector('#amyReelTimerGrid');
    const customMinInput = dialog.querySelector('#amyReelCustomMinInput');
    const customApplyBtn = dialog.querySelector('#amyReelCustomApplyBtn');

    function updateSheetActiveOption() {
      timerGrid.querySelectorAll('.amy-timer-btn').forEach(btn => {
        const val = btn.dataset.timerVal;
        const isActive = (reelState.sleepTimerMode === 'off' && val === 'off') ||
                         (reelState.sleepTimerMode === 'end_of_video' && val === 'end_of_video') ||
                         (reelState.sleepTimerMode === 'time' && String(reelState.sleepTimerMinutes) === val);
        btn.classList.toggle('is-selected', isActive);
      });
    }

    function renderTimerBadge() {
      if (reelState.sleepTimerMode === 'off') {
        timerBtn.classList.remove('is-active');
        timerBadge.textContent = 'Timer';
      } else if (reelState.sleepTimerMode === 'end_of_video') {
        timerBtn.classList.add('is-active');
        timerBadge.textContent = '1 Video';
      } else if (reelState.sleepTimerMode === 'time') {
        timerBtn.classList.add('is-active');
        const rem = Math.max(0, Math.ceil((reelState.sleepTimerTarget - Date.now()) / 1000));
        if (rem <= 0) {
          triggerSleepTimerExpiry();
          return;
        }
        if (rem >= 3600) {
          const h = Math.floor(rem / 3600);
          const m = Math.floor((rem % 3600) / 60);
          timerBadge.textContent = `${h}j ${m}m`;
        } else if (rem >= 60) {
          const m = Math.floor(rem / 60);
          const s = rem % 60;
          timerBadge.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        } else {
          timerBadge.textContent = `${rem}s`;
        }
      }
    }

    function openTimerSheet() {
      timerSheet.removeAttribute('hidden');
      updateSheetActiveOption();
    }
    function closeTimerSheet() {
      timerSheet.setAttribute('hidden', '');
    }

    timerBtn.addEventListener('click', e => {
      e.stopPropagation();
      openTimerSheet();
    });
    sheetCloseBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeTimerSheet();
    });
    sheetBackdrop.addEventListener('click', e => {
      e.stopPropagation();
      closeTimerSheet();
    });

    function setSleepTimer(val) {
      clearReelSleepTimer();
      if (val === 'off' || val === 0) {
        showToast('🌙 Timer tidur dinonaktifkan.');
      } else if (val === 'end_of_video') {
        reelState.sleepTimerMode = 'end_of_video';
        dialog.querySelectorAll('.amy-reel-video').forEach(v => { v.loop = false; });
        showToast('🌙 Timer aktif: Berhenti setelah video ini selesai.');
      } else {
        const mins = Number(val);
        if (!mins || mins <= 0) return;
        reelState.sleepTimerMode = 'time';
        reelState.sleepTimerMinutes = mins;
        reelState.sleepTimerTarget = Date.now() + mins * 60 * 1000;
        reelState.sleepTimerInterval = setInterval(() => {
          renderTimerBadge();
        }, 1000);
        showToast(`🌙 Timer tidur disetel: ${mins} menit.`);
      }
      renderTimerBadge();
      closeTimerSheet();
    }

    timerGrid.querySelectorAll('.amy-timer-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        setSleepTimer(btn.dataset.timerVal);
      });
    });

    customApplyBtn.addEventListener('click', e => {
      e.stopPropagation();
      const val = parseInt(customMinInput.value, 10);
      if (!val || val <= 0) {
        showToast('Masukkan jumlah menit yang valid.');
        return;
      }
      setSleepTimer(val);
      customMinInput.value = '';
    });

    renderTimerBadge();

    // Cegah pull-to-refresh saat swipe ke bawah di video pertama
    let feedStartY = 0, feedStartX = 0;
    feed.addEventListener('touchstart', e => {
      if (e.touches?.length === 1) { feedStartY = e.touches[0].clientY; feedStartX = e.touches[0].clientX; }
    }, { passive: true });
    feed.addEventListener('touchmove', e => {
      if (e.touches?.length !== 1) return;
      const dy = e.touches[0].clientY - feedStartY;
      const dx = Math.abs(e.touches[0].clientX - feedStartX);
      if (Math.abs(dy) > dx && feed.scrollTop <= 0 && dy > 0) e.preventDefault();
    }, { passive: false });

    const panelMap = new Map();

    const setMuted = (panel, video) => {
      video.muted = true;
      const st = panel.querySelector('.amy-reel-sound');
      if (st) st.textContent = '🔇';
    };

    const tryPlay = (panel, video) => {
      const p = video.play();
      if (p !== undefined) p.catch(() => { setMuted(panel, video); video.play().catch(() => {}); });
    };

    async function loadAndPlay(panel, item) {
      const video = panel.querySelector('video');
      if (!video) return;
      if (panel.dataset.sourceLoaded === '1') {
        if (panel.dataset.isActive === '1' && panel.dataset.userPaused !== '1') tryPlay(panel, video);
        return;
      }
      panel.dataset.sourceLoaded = '1';
      panel.classList.add('is-buffering');
      try {
        const src = await resolveMediaSource(item, reelState.urls);
        if (!reelState.open) return;
        if (!src) {
          panel.classList.remove('is-buffering');
          const err = document.createElement('div');
          err.className = 'amy-reel-error';
          err.textContent = 'Video belum bisa dimuat.';
          panel.append(err);
          return;
        }
        video.src = src;
        video.autoplay = true;
        video.load();
        const onReady = () => {
          panel.classList.remove('is-buffering');
          if (panel.dataset.isActive === '1' && panel.dataset.userPaused !== '1') tryPlay(panel, video);
        };
        if (video.readyState >= 2) onReady();
        else {
          video.addEventListener('canplay', onReady, { once: true });
          video.addEventListener('loadeddata', onReady, { once: true });
        }
      } catch (err) {
        panel.classList.remove('is-buffering');
        console.warn('Reel load error:', err);
      }
    }

    function unloadPanel(panel) {
      const video = panel.querySelector('video');
      if (!video || panel.dataset.sourceLoaded !== '1') return;
      video.pause();
      video.removeAttribute('src');
      try { video.load(); } catch (_) {}
      panel.dataset.sourceLoaded = '0';
      panel.classList.remove('is-buffering');
    }

    function createPanel(item) {
      const panel = document.createElement('section');
      panel.className = 'amy-reel-panel';
      panel.dataset.id = item.id;
      panel.dataset.userPaused = '0';

      const video = document.createElement('video');
      video.className = 'amy-reel-video';
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.loop = (reelState.sleepTimerMode === 'end_of_video') ? false : (currentPlayMode === 'loop');
      video.preload = 'none';
      video.controls = false;
      const thumb = getCachedVideoThumb(item);
      if (thumb) video.poster = thumb;

      const spinner = document.createElement('div');
      spinner.className = 'amy-reel-spinner';
      const playIndicator = document.createElement('div');
      playIndicator.className = 'amy-reel-play-indicator';
      playIndicator.textContent = '▶';

      const overlay = document.createElement('div');
      overlay.className = 'amy-reel-overlay';
      const tags = Array.isArray(item.tags) && item.tags.length ? `#${item.tags.slice(0, 3).join(' #')}` : '';
      overlay.innerHTML = `
        <h3 class="amy-reel-overlay-title">${escapeHtml(item.title || item.mediaName || 'Video Edukasi')}</h3>
        <div class="amy-reel-overlay-meta">
          <span class="amy-reel-tag">${escapeHtml(item.category || 'Media')}</span>
          ${tags ? `<span>${escapeHtml(tags)}</span>` : ''}
        </div>
      `;

      const progressBar = document.createElement('div');
      progressBar.className = 'amy-reel-progress';
      const progressFill = document.createElement('div');
      progressFill.className = 'amy-reel-progress-fill';
      progressBar.append(progressFill);
      progressBar.addEventListener('click', e => {
        e.stopPropagation();
        const rect = progressBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (Number.isFinite(video.duration) && video.duration > 0) video.currentTime = ratio * video.duration;
      });

      const sound = document.createElement('button');
      sound.type = 'button';
      sound.className = 'amy-reel-sound';
      sound.setAttribute('aria-label', 'Toggle Suara');
      sound.textContent = '🔊';
      sound.addEventListener('click', e => { e.stopPropagation(); video.muted = !video.muted; });
      video.addEventListener('volumechange', () => { sound.textContent = video.muted ? '🔇' : '🔊'; });

      video.addEventListener('waiting', () => panel.classList.add('is-buffering'));
      video.addEventListener('playing', () => { panel.classList.remove('is-buffering'); playIndicator.classList.remove('is-visible'); });
      video.addEventListener('timeupdate', () => {
        if (video.duration && Number.isFinite(video.duration)) progressFill.style.width = `${(video.currentTime / video.duration) * 100}%`;
        if (reelState.sleepTimerMode === 'time' && reelState.sleepTimerTarget > 0 && Date.now() >= reelState.sleepTimerTarget) {
          triggerSleepTimerExpiry();
        }
      });
      video.addEventListener('ended', () => {
        if (reelState.sleepTimerMode === 'end_of_video') {
          triggerSleepTimerExpiry();
          return;
        }
        if (currentPlayMode === 'auto_next') {
          const currentIdx = Array.prototype.indexOf.call(feed.children, panel);
          const nextIdx = currentIdx + 1;
          if (nextIdx < feed.children.length) {
            feed.children[nextIdx].scrollIntoView({ behavior: 'smooth' });
          } else if (feed.children.length > 1) {
            feed.children[0].scrollIntoView({ behavior: 'smooth' });
          }
        }
      });

      // Tap untuk play/pause, abaikan jika jari bergeser (swipe)
      let moved = false, sy = 0, sx = 0;
      panel.addEventListener('touchstart', e => {
        if (e.touches?.length === 1) { moved = false; sy = e.touches[0].clientY; sx = e.touches[0].clientX; }
      }, { passive: true });
      panel.addEventListener('touchmove', e => {
        if (e.touches?.length === 1 && (Math.abs(e.touches[0].clientY - sy) > 10 || Math.abs(e.touches[0].clientX - sx) > 10)) moved = true;
      }, { passive: true });
      panel.addEventListener('click', e => {
        if (moved) return;
        if (e.target.closest('button, .amy-reel-progress')) return;
        e.stopPropagation();
        if (video.paused) {
          panel.dataset.userPaused = '0';
          tryPlay(panel, video);
          playIndicator.classList.remove('is-visible');
        } else {
          panel.dataset.userPaused = '1';
          video.pause();
          playIndicator.classList.add('is-visible');
        }
      });

      panel.append(video, spinner, playIndicator, overlay, progressBar, sound);
      panelMap.set(panel, item);
      return panel;
    }

    feedItems.forEach((item, idx) => {
      const panel = createPanel(item);
      if (idx === 0) panel.dataset.isActive = '1';
      feed.append(panel);
    });

    const setHeader = item => {
      titleEl.textContent = item.title || 'Video';
      metaEl.textContent = `${item.category || item.type || 'Media'} • ${formatBytes(item.mediaSize || item.fileSize || 0)}`;
    };
    setHeader(activeItem);

    reelState.open = true;
    document.documentElement.classList.add('is-reel-open');
    document.body.classList.add('is-reel-open');
    window.AmyScrollGuard?.lock?.('video-reel');
    if (!dialog.hasAttribute('open')) {
      dialog.setAttribute('open', '');
      if (typeof dialog.show === 'function' && !dialog.open) {
        try { dialog.show(); } catch (_) {}
      }
    }
    dialog.style.display = 'block';
    try {
      history.pushState({ ...(history.state || {}), amyReel: true }, '', location.href);
      reelState.pushedHistory = true;
    } catch (_) {}

    loadAndPlay(feed.children[0], activeItem);

    let activeIndex = 0;
    reelState.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const panel = entry.target;
        const item = panelMap.get(panel);
        const video = panel.querySelector('video');
        const idx = Array.prototype.indexOf.call(feed.children, panel);
        if (entry.isIntersecting) {
          panel.dataset.isActive = '1';
          activeIndex = idx;
          if (item) {
            setHeader(item);
            if (item.id) markMediaWatched(item.id, true);
          }
          if (video) {
            video.loop = (reelState.sleepTimerMode === 'end_of_video') ? false : (currentPlayMode === 'loop');
          }
          loadAndPlay(panel, item);
        } else {
          panel.dataset.isActive = '0';
          panel.dataset.userPaused = '0';
          video?.pause();
          panel.querySelector('.amy-reel-play-indicator')?.classList.remove('is-visible');
          // Lepas decoder GPU untuk panel yang jauh dari posisi aktif
          if (Math.abs(idx - activeIndex) > 2) unloadPanel(panel);
        }
      });
    }, { root: feed, threshold: 0.65 });
    Array.from(feed.children).forEach(p => reelState.observer.observe(p));
  }

  async function showMediaFullscreen(item) {
    let dialog = document.getElementById('rootMediaViewerDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'rootMediaViewerDialog';
      dialog.className = 'media-fullscreen-dialog';
      document.body.appendChild(dialog);
    }
    if (dialog._activeBlobUrl) {
      try { URL.revokeObjectURL(dialog._activeBlobUrl); } catch (_) {}
      dialog._activeBlobUrl = '';
    }
    const fileRec = item.fileId ? await getMediaFileRecord(item.fileId) : null;
    const createdBlobUrl = fileRec?.blob ? URL.createObjectURL(fileRec.blob) : '';
    if (createdBlobUrl) dialog._activeBlobUrl = createdBlobUrl;
    const blobUrl = createdBlobUrl || (item.mediaUrl || '');

    const isVid = item.mediaKind === 'video' || item.type === 'Video Pembelajaran' || (item.mediaType && item.mediaType.startsWith('video/')) || (fileRec?.blob?.type || '').startsWith('video/');
    const isAudio = item.mediaKind === 'audio' || (item.mediaType && item.mediaType.startsWith('audio/')) || (fileRec?.blob?.type || '').startsWith('audio/');
    const isDoc = item.mediaKind === 'document' || item.type === 'Dokumen';

    let stageContent = '';
    if (isVid) {
      stageContent = `<video src="${blobUrl}" controls autoplay playsinline style="max-width:100%; max-height:80vh; border-radius:12px;"></video>`;
    } else if (isAudio) {
      stageContent = `
        <div style="text-align:center; padding:32px 20px; background:var(--surface-color); border-radius:20px; border:1px solid var(--border-color); max-width:420px; width:100%; margin:auto;">
          <div style="font-size:48px; margin-bottom:12px;">🎵</div>
          <h3 style="color:var(--text-main, var(--amy-text, #f5f8fc)); margin-bottom:14px; font-size:16px;">${escapeHtml(item.title)}</h3>
          ${blobUrl ? `<audio src="${blobUrl}" controls autoplay style="width:100%;"></audio>` : '<p style="color:var(--text-muted); font-size:12px;">File audio tidak ditemukan.</p>'}
        </div>
      `;
    } else if (isDoc) {
      stageContent = `
        <div style="text-align:center; padding:32px 20px; background:var(--surface-color); border-radius:20px; border:1px solid var(--border-color); max-width:400px; margin:auto;">
          <div style="font-size:52px; margin-bottom:12px;">📄</div>
          <h3 style="color:var(--text-main, var(--amy-text, #f5f8fc)); margin-bottom:8px; font-size:16px;">${escapeHtml(item.title)}</h3>
          <p style="color:var(--text-muted); font-size:12px; margin-bottom:20px;">${escapeHtml(item.mediaName || item.title)} • ${formatBytes(item.mediaSize || fileRec?.size)}</p>
          ${blobUrl ? `<a href="${blobUrl}" download="${escapeHtml(item.mediaName || item.title)}" class="media-upload-btn" style="text-decoration:none; display:inline-flex;">💾 Unduh / Buka Dokumen</a>` : ''}
        </div>
      `;
    } else {
      stageContent = `<img src="${blobUrl}" alt="${escapeHtml(item.title)}" style="max-width:100%; max-height:80vh; object-fit:contain; border-radius:12px;">`;
    }

    dialog.innerHTML = `
      <div class="media-fullscreen-bar">
        <div class="media-fullscreen-title-box">
          <small>${escapeHtml(item.category || item.type || 'Media')} • ${formatBytes(item.mediaSize || fileRec?.size)}</small>
          <h3>${escapeHtml(item.title)}</h3>
        </div>
        <div class="media-fullscreen-actions">
          ${blobUrl ? `<a href="${blobUrl}" download="${escapeHtml(item.mediaName || item.title)}" class="media-fullscreen-close-btn" style="text-decoration:none;" title="Unduh File">💾</a>` : ''}
          <button type="button" class="media-fullscreen-close-btn" id="closeMediaViewerBtn" title="Tutup">×</button>
        </div>
      </div>
      <div class="media-fullscreen-stage">${stageContent}</div>
    `;

    if (typeof dialog.show === 'function') {
      try { dialog.show(); } catch (_) { dialog.setAttribute('open', ''); }
    } else {
      dialog.setAttribute('open', '');
    }
    dialog.style.display = 'flex';
    const closeBtn = dialog.querySelector('#closeMediaViewerBtn');
    const closeDialog = () => {
      if (typeof dialog.close === 'function' && dialog.open) {
        try { dialog.close(); } catch (_) {}
      }
      dialog.removeAttribute('open');
      dialog.style.display = 'none';
      const mediaEl = dialog.querySelector('video, audio');
      if (mediaEl) { mediaEl.pause(); mediaEl.removeAttribute('src'); try { mediaEl.load(); } catch (_) {} }
      if (dialog._activeBlobUrl) {
        try { URL.revokeObjectURL(dialog._activeBlobUrl); } catch (_) {}
        dialog._activeBlobUrl = '';
      }
    };
    if (closeBtn) closeBtn.onclick = closeDialog;
    dialog.onclick = e => {
      if (e.target === dialog) closeDialog();
    };
  }

  async function handleRootMediaUpload(event) {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    showToast('Memproses upload media...');
    let uploadedCount = 0;
    const now = new Date().toISOString();

    try {
      for (const file of files) {
        if (file.size > 200 * 1024 * 1024) {
          showToast(`File "${file.name}" terlalu besar (>200MB).`);
          continue;
        }
        let kind = 'document';
        let itemType = 'Dokumen';
        if (file.type.startsWith('image/')) {
          kind = 'image';
          itemType = 'Gambar Chart';
        } else if (file.type.startsWith('video/')) {
          kind = 'video';
          itemType = 'Video Pembelajaran';
        } else if (file.type.startsWith('audio/')) {
          kind = 'audio';
          itemType = 'Audio';
        }

        const id = 'media_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        const item = {
          id,
          title,
          type: itemType,
          category: 'Setup XAU',
          status: 'Selesai dibaca',
          collection: 'Media',
          tags: [itemType.toLowerCase(), 'media'],
          notes: `File ${file.name} diupload ke Media Utama.`,
          checklist: [],
          code: '',
          mediaUrl: '',
          fileId,
          mediaKind: kind,
          mediaName: file.name,
          mediaType: file.type,
          mediaSize: file.size,
          documentType: kind === 'document' ? (file.name.split('.').pop() || 'doc').toUpperCase() : '',
          documentText: '',
          favorite: false,
          archived: false,
          revisionHistory: [],
          uploadedAt: now,
          createdAt: now,
          updatedAt: now
        };

        await putMediaFileRecord({
          id: fileId,
          itemId: id,
          blob: file,
          name: file.name,
          type: file.type,
          size: file.size,
          kind,
          uploadedAt: now
        });

        const currentItems = await loadAllMediaItems();
        await saveAllMediaItems([item, ...currentItems]);
        uploadedCount++;
      }

      if (uploadedCount > 0) {
        showToast(`${uploadedCount} media berhasil ditambahkan!`);
        renderMedia({ autoPlay: false });
      }
    } finally {
      if (event.target) event.target.value = '';
    }
  }

  async function handleRootMediaDelete(itemId) {
    const allItems = await loadAllMediaItems();
    const item = allItems.find(it => it.id === itemId);
    if (!item) return;

    if (item.fileId) {
      await deleteMediaFileRecord(item.fileId);
    }
    if (item.collection === 'Jurnal' && (item.fileId || item.journalId)) {
      try {
        const meta = await getMediaMetadataRecord('journals.v2');
        const list = Array.isArray(meta?.value) ? meta.value : readJsonArray('tradingLibraryManager.journals.v1');
        if (Array.isArray(list) && list.length) {
          const nextJournals = list.map(j => {
            if (item.journalId && j.id !== item.journalId) return j;
            const atts = Array.isArray(j.attachments) ? j.attachments : [];
            const filtered = atts.filter(a => (a.fileId && a.fileId !== item.fileId) && (a.id !== item.id));
            return filtered.length === atts.length ? j : { ...j, attachments: filtered, updatedAt: new Date().toISOString() };
          });
          await putMediaMetadataRecord({ id: 'journals.v2', value: nextJournals, updatedAt: new Date().toISOString() });
          try { localStorage.setItem('tradingLibraryManager.journals.v1', JSON.stringify(nextJournals)); } catch (_) {}
        }
      } catch (_) {}
    }
    const updated = allItems.filter(it => it.id !== itemId && it.collection !== 'Jurnal');
    await saveAllMediaItems(updated);
    markMediaWatched(itemId, false);
    showToast(`Media "${item.title}" dihapus.`);
    renderMedia({ autoPlay: false });
  }

  function renderKoleksi() {
    renderMedia();
  }

  function renderProfile() {
    setActive('profil');
    const traderName = localStorage.getItem('amy_trader_name') || 'Trader';
    const simEngine = window.AmyAccountSimEngine;
    const simParams = simEngine?.readParams
      ? simEngine.readParams()
      : {
          baseBalanceUsd: Number(localStorage.getItem('amy_default_balance') || 5000) || 5000,
          riskPct: Number(localStorage.getItem('amy_default_risk') || 1.5) || 1.5,
          currency: localStorage.getItem('amy_account_currency') === 'USD' ? 'USD' : 'IDR',
          usdIdrRate: Number(localStorage.getItem('amy_usd_idr_rate') || 16500) || 16500,
          leverage: Number(localStorage.getItem('amy_account_leverage') || 500) || 500,
          spreadUsd: Number(localStorage.getItem('amy_account_spread') ?? 0.2)
        };
    const userBalance = String(simParams.baseBalanceUsd);
    const userRisk = String(simParams.riskPct);

    const getInitials = (name) => {
      const parts = String(name || 'TR').trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return String(parts[0] || 'TR').slice(0, 2).toUpperCase();
    };

    const formatMoney = (val) => {
      const num = Number(val);
      return Number.isFinite(num) ? num.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '5,000';
    };

    const formatIdrQuick = (usd, rate) => {
      if (simEngine?.formatIdr) return simEngine.formatIdr(Number(usd) * Number(rate));
      const idr = Math.round((Number(usd) || 0) * (Number(rate) || 16500));
      return 'Rp' + Math.abs(idr).toLocaleString('id-ID');
    };

    const calcRiskUsd = (bal, risk) => {
      const b = Number(bal);
      const r = Number(risk);
      if (!Number.isFinite(b) || !Number.isFinite(r) || b <= 0 || r <= 0) return '0.00';
      return ((b * r) / 100).toFixed(2);
    };

    const computePoiAdjustedState = (baseBalUsd, riskPctVal, currency, rate) => {
      const baseNum = Math.max(0, Number(baseBalUsd) || 0);
      const riskNum = Math.max(0.1, Math.min(25, Number(riskPctVal) || 1.5));
      if (!simEngine?.computeAccountSnapshot) {
        return { activeBalUsd: baseNum, poiPnlUsd: 0, poiClosedCount: 0 };
      }
      const cashflows = simEngine.readCashflows ? simEngine.readCashflows() : [];
      const poiRecords = simEngine.readPoiHistoryRecords ? simEngine.readPoiHistoryRecords() : [];
      const snap = simEngine.computeAccountSnapshot({
        params: {
          ...simParams,
          baseBalanceUsd: baseNum,
          riskPct: riskNum,
          currency: currency || simParams.currency,
          usdIdrRate: Number(rate) >= 1000 ? Number(rate) : simParams.usdIdrRate
        },
        cashflows,
        journals: [],
        openPositions: [],
        poiRecords
      });
      return {
        activeBalUsd: snap.balanceUsd,
        poiPnlUsd: snap.poiRealizedAllUsd || 0,
        poiClosedCount: snap.poiClosedCount || 0
      };
    };

    const buildIdentityBalanceText = (balUsd, currency, rate) => {
      if (currency === 'IDR') {
        return formatIdrQuick(balUsd, rate);
      }
      return `$${formatMoney(balUsd)}`;
    };

    const formatSignedQuick = (usd, currency, rate) => {
      const n = Number(usd) || 0;
      const sign = n < 0 ? '-' : (n > 0 ? '+' : '');
      const absText = buildIdentityBalanceText(Math.abs(n), currency, rate);
      return `${sign}${absText}`;
    };

    const buildRiskSummaryText = (balUsd, riskPct, currency, rate) => {
      const adj = computePoiAdjustedState(balUsd, riskPct, currency, rate);
      const effectiveBal = adj.activeBalUsd;
      const riskUsd = Number(calcRiskUsd(effectiveBal, riskPct));
      const riskIdrText = formatIdrQuick(riskUsd, rate);
      const riskPart = currency === 'IDR'
        ? `Risiko ${riskIdrText} ($${riskUsd.toFixed(2)}) / trade`
        : `Risiko $${riskUsd.toFixed(2)} (${riskIdrText}) / trade`;
      if (adj.poiClosedCount > 0) {
        const activeStr = buildIdentityBalanceText(effectiveBal, currency, rate);
        const poiStr = formatSignedQuick(adj.poiPnlUsd, currency, rate);
        return `Saldo Aktif ${activeStr} (POI ${poiStr}) · ${riskPart}`;
      }
      return riskPart;
    };

    const initialAdj = computePoiAdjustedState(userBalance, userRisk, simParams.currency, simParams.usdIdrRate);

    mainContent.innerHTML = `
      <div class="profile-page profile-page--clean">
        <!-- Identitas Trader Ringkas -->
        <section class="profile-panel profile-identity-card slide-up" aria-label="Identitas Trader">
          <div class="profile-identity-main">
            <div class="profile-monogram" id="traderAvatarInitials" aria-hidden="true">${escapeHtml(getInitials(traderName))}</div>
            <div class="profile-identity-copy">
              <strong id="traderNameTitle">${escapeHtml(traderName)}</strong>
              <div class="profile-identity-meta" id="traderIdentityMeta">
                <span>XAU/USD</span>
                <span aria-hidden="true">·</span>
                <span>${escapeHtml(buildIdentityBalanceText(initialAdj.activeBalUsd, simParams.currency, simParams.usdIdrRate))}</span>
                <span aria-hidden="true">·</span>
                <span>${escapeHtml(userRisk)}%</span>
              </div>
            </div>
            <button type="button" id="editTraderNameBtn" class="profile-btn-ghost profile-btn-sm" aria-expanded="false" aria-controls="traderNameEditor">
              Ubah
            </button>
          </div>

          <form id="traderNameEditor" class="profile-name-editor" hidden>
            <label class="sr-only" for="traderNameInput">Nama Trader</label>
            <input type="text" id="traderNameInput" class="profile-input" value="${escapeHtml(traderName)}" maxlength="36" placeholder="Nama trader" autocomplete="name">
            <div class="profile-name-editor-actions">
              <button type="submit" class="profile-btn-primary profile-btn-sm">Simpan</button>
              <button type="button" id="cancelTraderNameBtn" class="profile-btn-ghost profile-btn-sm">Batal</button>
            </div>
          </form>
        </section>

        <!-- Akun Pro Simulasi & Parameter Modal -->
        <div class="profile-akun-layout">
          <section id="home-account-cockpit-slot" class="home-account-cockpit-slot profile-cockpit-slot" aria-label="Cockpit Akun Simulasi Pro"></section>

          <section class="profile-panel slide-up" id="profileTradingParamsPanel" aria-label="Parameter Modal dan Risiko">
            <div class="profile-label-row">
              <span class="profile-label" style="margin-bottom:0;">Parameter Modal <button type="button" class="amy-info-btn" data-info-tip="Dipakai otomatis oleh Akun Pro Simulasi, Backtest Replay Lab, dan Kalkulator Lot Jurnal." aria-label="Info parameter modal" aria-expanded="false">i</button></span>
              <span class="profile-section-meta">Pro · 100 oz</span>
            </div>

            <div class="profile-fields-grid profile-fields-grid--compact">
              <div class="profile-field">
                <label for="profileBalance">Modal (USD)</label>
                <div class="profile-input-wrap">
                  <span class="profile-input-affix">$</span>
                  <input type="number" id="profileBalance" class="profile-input profile-input-num" value="${escapeHtml(userBalance)}" min="1" step="any">
                </div>
              </div>
              <div class="profile-field">
                <label for="profileRisk">Risiko</label>
                <div class="profile-input-wrap">
                  <input type="number" step="0.25" min="0.1" max="25" id="profileRisk" class="profile-input profile-input-num" value="${escapeHtml(userRisk)}">
                  <span class="profile-input-affix">%</span>
                </div>
              </div>
              <div class="profile-field">
                <label for="profileUsdIdrRate">Kurs IDR</label>
                <div class="profile-input-wrap">
                  <span class="profile-input-affix">Rp</span>
                  <input type="number" id="profileUsdIdrRate" class="profile-input profile-input-num" value="${escapeHtml(simParams.usdIdrRate)}" min="1000" step="50">
                </div>
              </div>
              <div class="profile-field">
                <label for="profileLeverage">Leverage</label>
                <div class="profile-input-wrap">
                  <select id="profileLeverage" class="profile-input profile-input-num profile-select-bare" aria-label="Pilih leverage akun pro">
                    ${[100, 200, 500, 1000].map(lv => `<option value="${lv}" ${Number(simParams.leverage) === lv ? 'selected' : ''}>1:${lv}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="profile-field">
                <label for="profileSpread">Spread XAU</label>
                <div class="profile-input-wrap">
                  <span class="profile-input-affix">$</span>
                  <input type="number" id="profileSpread" class="profile-input profile-input-num" value="${escapeHtml(simParams.spreadUsd)}" min="0" max="5" step="0.05">
                </div>
              </div>
              <div class="profile-field">
                <label>Mata Uang</label>
                <div class="profile-sim-seg profile-sim-seg--full" role="group" aria-label="Mata uang akun simulasi">
                  <button type="button" class="profile-sim-seg-btn ${simParams.currency === 'IDR' ? 'is-active' : ''}" data-profile-currency="IDR" aria-pressed="${simParams.currency === 'IDR' ? 'true' : 'false'}">Rp</button>
                  <button type="button" class="profile-sim-seg-btn ${simParams.currency === 'USD' ? 'is-active' : ''}" data-profile-currency="USD" aria-pressed="${simParams.currency === 'USD' ? 'true' : 'false'}">$</button>
                </div>
              </div>
            </div>

            <div class="profile-panel-footer">
              <p class="profile-hint" id="profileRiskSummary">${escapeHtml(buildRiskSummaryText(userBalance, userRisk, simParams.currency, simParams.usdIdrRate))}</p>
              <button type="button" id="saveTradingParamsBtn" class="profile-btn-gold">Simpan</button>
            </div>

            <details class="profile-accordion profile-divider">
              <summary class="profile-accordion-summary">
                <span>Kas &amp; Reset Simulasi</span>
                <svg class="profile-accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div class="profile-accordion-body profile-sim-ops--compact">
                <div class="profile-sim-cashflow-row">
                  <div class="profile-input-wrap profile-cashflow-input-wrap">
                    <span class="profile-input-affix">$</span>
                    <input type="number" id="profileCashflowUsd" class="profile-input profile-input-num" min="1" step="any" placeholder="500" aria-label="Nominal top up atau tarik dalam USD">
                  </div>
                  <button type="button" id="profileDepositBtn" class="profile-btn-ghost">+ Top Up</button>
                  <button type="button" id="profileWithdrawBtn" class="profile-btn-ghost">- Tarik</button>
                </div>
                <div class="profile-sim-reset-row profile-sim-reset-row--compact">
                  <span class="profile-sublabel" style="margin-bottom:0;">Reset simulasi <button type="button" class="amy-info-btn" data-info-tip="Menghapus saldo, cashflow, dan riwayat trade Simulasi saja. Jurnal Real tetap aman." aria-label="Info reset simulasi" aria-expanded="false">i</button></span>
                  <button type="button" id="profileResetSimBtn" class="profile-btn-danger-ghost profile-btn-sm" data-confirm-arm="0">Reset</button>
                </div>
              </div>
            </details>
          </section>
        </div>
      </div>
    `;

    const editNameBtn = document.getElementById('editTraderNameBtn');
    const nameEditor = document.getElementById('traderNameEditor');
    const nameInput = document.getElementById('traderNameInput');
    const cancelNameBtn = document.getElementById('cancelTraderNameBtn');

    function setNameEditorOpen(open) {
      if (!nameEditor || !editNameBtn) return;
      nameEditor.hidden = !open;
      editNameBtn.setAttribute('aria-expanded', String(open));
      if (open && nameInput) {
        nameInput.value = localStorage.getItem('amy_trader_name') || 'Trader';
        nameInput.focus();
        nameInput.select();
      }
    }

    editNameBtn?.addEventListener('click', () => {
      setNameEditorOpen(nameEditor ? nameEditor.hidden : true);
    });

    cancelNameBtn?.addEventListener('click', () => setNameEditorOpen(false));

    nameEditor?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = (nameInput?.value || '').trim();
      if (!updated) {
        showToast('Nama trader tidak boleh kosong.');
        nameInput?.focus();
        return;
      }
      localStorage.setItem('amy_trader_name', updated);
      const titleEl = document.getElementById('traderNameTitle');
      const avatarEl = document.getElementById('traderAvatarInitials');
      if (titleEl) titleEl.textContent = updated;
      if (avatarEl) avatarEl.textContent = getInitials(updated);
      setNameEditorOpen(false);
      showToast('Nama profil trader berhasil diperbarui.');
    });

    const balanceInput = document.getElementById('profileBalance');
    const riskInput = document.getElementById('profileRisk');
    const rateInput = document.getElementById('profileUsdIdrRate');
    const leverageInput = document.getElementById('profileLeverage');
    const spreadInput = document.getElementById('profileSpread');
    const riskSummaryEl = document.getElementById('profileRiskSummary');
    const identityMetaEl = document.getElementById('traderIdentityMeta');
    const currencyBtns = document.querySelectorAll('[data-profile-currency]');
    let selectedCurrency = simParams.currency;

    function refreshRiskPreview() {
      const bal = balanceInput?.value || '5000';
      const r = riskInput?.value || '1.5';
      const rate = rateInput?.value || '16500';
      if (riskSummaryEl) {
        riskSummaryEl.textContent = buildRiskSummaryText(bal, r, selectedCurrency, rate);
      }
      if (identityMetaEl) {
        const adj = computePoiAdjustedState(bal, r, selectedCurrency, rate);
        identityMetaEl.innerHTML = `<span>XAU/USD</span><span aria-hidden="true">·</span><span>${escapeHtml(buildIdentityBalanceText(adj.activeBalUsd, selectedCurrency, rate))}</span><span aria-hidden="true">·</span><span>${escapeHtml(r)}%</span>`;
      }
    }

    function syncProfileCurrencyUi(nextCurrency) {
      selectedCurrency = nextCurrency === 'USD' ? 'USD' : 'IDR';
      currencyBtns.forEach((b) => {
        const isAct = b.dataset.profileCurrency === selectedCurrency;
        b.classList.toggle('is-active', isAct);
        b.setAttribute('aria-pressed', isAct ? 'true' : 'false');
      });
      refreshRiskPreview();
    }

    currencyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        syncProfileCurrencyUi(btn.dataset.profileCurrency);
      });
    });

    if (window.__amyProfileSimSyncHandler) {
      window.removeEventListener('amyfx:sim-state-change', window.__amyProfileSimSyncHandler);
      window.removeEventListener('amyfx:poi-history-updated', window.__amyProfileSimSyncHandler);
    }
    window.__amyProfileSimSyncHandler = (ev) => {
      if (!document.getElementById('profileTradingParamsPanel')) return;
      const cur = ev?.detail?.currency || (simEngine?.readParams ? simEngine.readParams().currency : null);
      if (cur && cur !== selectedCurrency) {
        syncProfileCurrencyUi(cur);
      } else {
        refreshRiskPreview();
      }
    };
    window.addEventListener('amyfx:sim-state-change', window.__amyProfileSimSyncHandler);
    window.addEventListener('amyfx:poi-history-updated', window.__amyProfileSimSyncHandler);

    balanceInput?.addEventListener('input', refreshRiskPreview);
    riskInput?.addEventListener('input', refreshRiskPreview);
    rateInput?.addEventListener('input', refreshRiskPreview);

    document.getElementById('saveTradingParamsBtn')?.addEventListener('click', () => {
      const nextRaw = {
        baseBalanceUsd: Number(balanceInput?.value || 5000),
        riskPct: Number(riskInput?.value || 1.5),
        currency: selectedCurrency,
        usdIdrRate: Number(rateInput?.value || 16500),
        leverage: Number(leverageInput?.value || 500),
        spreadUsd: Number(spreadInput?.value ?? 0.2)
      };
      const saved = simEngine?.saveParams
        ? simEngine.saveParams(nextRaw)
        : nextRaw;
      if (!simEngine?.saveParams) {
        localStorage.setItem('amy_default_balance', String(saved.baseBalanceUsd));
        localStorage.setItem('amy_default_risk', String(saved.riskPct));
        localStorage.setItem('amy_account_currency', saved.currency);
        localStorage.setItem('amy_usd_idr_rate', String(saved.usdIdrRate));
        localStorage.setItem('amy_account_leverage', String(saved.leverage));
        localStorage.setItem('amy_account_spread', String(saved.spreadUsd));
      }
      if (balanceInput) balanceInput.value = String(saved.baseBalanceUsd);
      if (riskInput) riskInput.value = String(saved.riskPct);
      if (rateInput) rateInput.value = String(saved.usdIdrRate);
      if (leverageInput) leverageInput.value = String(saved.leverage);
      if (spreadInput) spreadInput.value = String(saved.spreadUsd);
      refreshRiskPreview();
      try { window.dispatchEvent(new CustomEvent('amyfx:sim-state-change')); } catch (_) {}
      showToast('Parameter Akun Pro tersimpan.');
    });

    const cashflowInput = document.getElementById('profileCashflowUsd');
    function handleSimCashflow(type) {
      const amount = Number(cashflowInput?.value);
      if (!Number.isFinite(amount) || amount <= 0) {
        showToast('Masukkan nominal USD yang valid (mis. 500).');
        cashflowInput?.focus();
        return;
      }
      const liveSnap = window.AmyHomeAccountCockpit?.getSnapshot?.();
      const currentBal = Number.isFinite(Number(liveSnap?.balanceUsd))
        ? Number(liveSnap.balanceUsd)
        : Number(balanceInput?.value || simParams.baseBalanceUsd || 0);
      if (type === 'withdraw' && amount > currentBal) {
        showToast('Saldo tidak mencukupi untuk penarikan tersebut.');
        cashflowInput?.focus();
        return;
      }
      if (simEngine?.addCashflow) {
        simEngine.addCashflow({ type, amountUsd: amount, note: type === 'deposit' ? 'Top Up Profil' : 'Tarik Dana Profil' });
      }
      if (cashflowInput) cashflowInput.value = '';
      try { window.dispatchEvent(new CustomEvent('amyfx:sim-state-change')); } catch (_) {}
      const updatedSnap = window.AmyHomeAccountCockpit?.getSnapshot?.();
      if (identityMetaEl && updatedSnap) {
        const effBal = Number.isFinite(Number(updatedSnap.initialCapitalUsd)) ? updatedSnap.initialCapitalUsd : Number(balanceInput?.value || simParams.baseBalanceUsd);
        const rateVal = Number(rateInput?.value || simParams.usdIdrRate);
        const riskVal = Number(riskInput?.value || simParams.riskPct);
        identityMetaEl.innerHTML = `<span>XAU/USD</span><span aria-hidden="true">·</span><span>${escapeHtml(buildIdentityBalanceText(effBal, selectedCurrency, rateVal))}</span><span aria-hidden="true">·</span><span>${escapeHtml(riskVal)}%</span>`;
      }
      const label = type === 'deposit' ? 'Top Up' : 'Penarikan';
      const idrText = formatIdrQuick(amount, Number(rateInput?.value || simParams.usdIdrRate));
      showToast(`${label} simulasi $${formatMoney(amount)} (${idrText}) tercatat.`);
    }
    document.getElementById('profileDepositBtn')?.addEventListener('click', () => handleSimCashflow('deposit'));
    document.getElementById('profileWithdrawBtn')?.addEventListener('click', () => handleSimCashflow('withdraw'));

    const resetSimBtn = document.getElementById('profileResetSimBtn');
    let resetSimTimer = null;
    resetSimBtn?.addEventListener('click', async () => {
      if (resetSimBtn.dataset.confirmArm !== '1') {
        resetSimBtn.dataset.confirmArm = '1';
        resetSimBtn.textContent = 'Ketuk Lagi: Yakin?';
        resetSimBtn.classList.add('is-armed');
        clearTimeout(resetSimTimer);
        resetSimTimer = setTimeout(() => {
          resetSimBtn.dataset.confirmArm = '0';
          resetSimBtn.textContent = 'Reset';
          resetSimBtn.classList.remove('is-armed');
        }, 4000);
        return;
      }
      clearTimeout(resetSimTimer);
      resetSimBtn.dataset.confirmArm = '0';
      resetSimBtn.textContent = 'Reset';
      resetSimBtn.classList.remove('is-armed');
      if (typeof window.AmyHomeAccountCockpit?.resetSimulationAccount === 'function') {
        const res = await window.AmyHomeAccountCockpit.resetSimulationAccount();
        showToast(`Akun Simulasi direset (${res?.removedSimCount || 0} trade SIM dibersihkan · ${res?.keptRealCount || 0} jurnal REAL aman).`);
      } else {
        localStorage.setItem('amy_sim_positions_v1', '[]');
        localStorage.setItem('amy_sim_cashflows_v1', '[]');
        try { window.dispatchEvent(new CustomEvent('amyfx:sim-state-change')); } catch (_) {}
        showToast('Akun Simulasi direset. Jurnal REAL tetap aman.');
      }
    });

    if (typeof window.AmyHomeAccountCockpit?.render === 'function') {
      window.AmyHomeAccountCockpit.render();
    }
    try { window.dispatchEvent(new CustomEvent('amyfx:profile-rendered')); } catch (_) {}
  }

  function renderSettings() {
    setActive('pengaturan');

    const reminderConfig = window.AmyLearningReminder ? window.AmyLearningReminder.getConfig() : {
      enabled: localStorage.getItem('amy_learning_reminder_enabled') !== 'false',
      time: localStorage.getItem('amy_learning_reminder_time') || '20:00',
      lastTitle: localStorage.getItem('amy_last_opened_title') || 'Fondasi ICT & Market Structure Dasar',
      lastTimeText: 'Belum ada riwayat belajar'
    };
    const reminderSlots = reminderConfig.slots || {
      morning: { enabled: true, time: '08:00', label: 'Pagi' },
      afternoon: { enabled: true, time: '13:00', label: 'Siang' },
      night: { enabled: true, time: reminderConfig.time || '20:00', label: 'Malam' }
    };

    const customBgData = window.AmyFXTheme?.customBg;
    const hasCustomBg = Boolean(customBgData && customBgData.image);
    const customBgDim = customBgData?.dim ?? 50;
    const customBgBlur = customBgData?.blur ?? 20;

    const themeColors = window.AmyFXTheme?.colors || {};
    const isLightResolved = window.AmyFXTheme?.resolved === 'light';
    const themeDefaults = isLightResolved
      ? { background: '#eef4fa', surface: '#ffffff', text: '#111a25', accent: '#216bdb', opacity: 80 }
      : { background: '#070b12', surface: '#111c29', text: '#f5f8fc', accent: '#69b7ff', opacity: 68 };
    const opacityVal = themeColors.opacity !== undefined ? Number(themeColors.opacity) : themeDefaults.opacity;

    const ghSyncApi = window.AmyGitHubSync;
    const ghCfg = ghSyncApi?.loadConfig?.() || {
      repo: 'suhaimitoamy/amyfx-private-sync',
      branch: 'main',
      token: '',
      autoSync: false,
      connected: false,
      isPrivate: null,
      lastSyncAt: ''
    };
    const ghLastSyncText = ghCfg.lastSyncAt && ghSyncApi?.formatSyncTimestamp
      ? ghSyncApi.formatSyncTimestamp(ghCfg.lastSyncAt)
      : '';
    const ghStatusLabel = ghCfg.connected
      ? (ghLastSyncText ? `Tersinkron · ${ghLastSyncText}` : 'Terhubung')
      : (ghCfg.token ? 'Belum diuji' : 'Belum terhubung');
    const ghStatusClass = ghCfg.connected ? 'is-ok' : (ghCfg.token ? 'is-warn' : '');
    const ghPrivacyMarkup = ghCfg.connected
      ? (ghCfg.isPrivate === false
        ? '<span id="ghSyncPrivacyBadge" class="gh-sync-badge is-warn">Publik!</span>'
        : '<span id="ghSyncPrivacyBadge" class="gh-sync-badge is-private">Private</span>')
      : '<span id="ghSyncPrivacyBadge" class="gh-sync-badge" hidden></span>';

    mainContent.innerHTML = `
      <div class="profile-page profile-page--clean settings-page">
        <div class="settings-topbar">
          <button type="button" class="settings-back-btn" data-nav="back-from-settings" aria-label="Kembali">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <h1>Pengaturan</h1>
        </div>

        <!-- GRUP 1: TAMPILAN -->
        <div class="settings-group">
          <span class="settings-group-label">Tampilan</span>
          <section class="profile-panel slide-up" data-amyfx-unified-appearance="true" data-amyfx-color-settings="true">
            <div class="profile-block">
              <div class="profile-label-row">
                <span class="profile-label" style="margin-bottom:0;">Mode</span>
                <button type="button" class="profile-link-action" data-theme-colors-reset aria-label="Kembalikan warna bawaan">Reset</button>
              </div>
              <div class="theme-selector profile-segmented" role="group" aria-label="Pilih tema aplikasi">
                <button class="theme-choice" type="button" data-amyfx-theme-choice="system">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8M12 16v4"></path></svg>
                  <span>Sistem</span>
                </button>
                <button class="theme-choice" type="button" data-amyfx-theme-choice="light">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>
                  <span>Terang</span>
                </button>
                <button class="theme-choice" type="button" data-amyfx-theme-choice="dark">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2z"></path></svg>
                  <span>Gelap</span>
                </button>
              </div>
            </div>

            <div class="profile-block profile-divider">
              <span class="profile-label">Tema Kaca</span>
              <div class="profile-presets-grid" data-glass-presets-grid></div>
            </div>

            <div class="profile-block profile-divider">
              <div class="profile-wallpaper-row">
                <div>
                  <span class="profile-label" style="margin-bottom:2px;">Wallpaper</span>
                  <span id="customBgBadge" class="profile-inline-status ${hasCustomBg ? 'is-active' : ''}">${hasCustomBg ? 'Foto aktif' : 'Default'}</span>
                </div>
                <div class="profile-wallpaper-actions">
                  <input type="file" id="customBgFileInput" accept="image/*" hidden>
                  <button type="button" id="uploadCustomBgBtn" class="profile-btn-ghost profile-btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span>Pilih Foto</span>
                  </button>
                  <button type="button" id="removeCustomBgBtn" class="profile-btn-danger-ghost profile-btn-sm" style="${hasCustomBg ? '' : 'display:none;'}">
                    Hapus
                  </button>
                </div>
              </div>

              <div id="customBgControls" class="profile-wallpaper-sliders" style="${hasCustomBg ? '' : 'display:none;'}">
                <div class="profile-subblock">
                  <div class="profile-slider-head">
                    <span class="profile-sublabel">Redup</span>
                    <span class="profile-slider-value" id="customBgDimVal">${customBgDim}%</span>
                  </div>
                  <input type="range" id="customBgDimSlider" min="0" max="100" value="${customBgDim}" class="profile-range">
                </div>
                <div class="profile-subblock">
                  <div class="profile-slider-head">
                    <span class="profile-sublabel">Blur</span>
                    <span class="profile-slider-value" id="customBgBlurVal">${customBgBlur}px</span>
                  </div>
                  <input type="range" id="customBgBlurSlider" min="0" max="25" value="${customBgBlur}" class="profile-range">
                </div>
              </div>
            </div>

            <details class="profile-accordion profile-divider">
              <summary class="profile-accordion-summary">
                <span>Warna &amp; Transparansi</span>
                <svg class="profile-accordion-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div class="profile-accordion-body">
                <div class="profile-subblock">
                  <div class="profile-color-grid">
                    ${[
                      ['background', 'Latar'], ['surface', 'Kaca'], ['text', 'Teks'], ['accent', 'Aksen']
                    ].map(([key, label]) => {
                      const val = themeColors[key] || themeDefaults[key];
                      return `
                      <div class="profile-color-item" data-color-cell="${key}">
                        <input type="color" data-theme-color="${key}" value="${val}" aria-label="Warna ${label.toLowerCase()}">
                        <span class="profile-color-name">${label}</span>
                        <span class="profile-color-hex" data-hex-for="${key}">${val.toUpperCase()}</span>
                      </div>
                    `;}).join('')}
                  </div>
                </div>

                <div class="profile-subblock">
                  <div class="profile-slider-head">
                    <span class="profile-sublabel">Transparansi</span>
                    <span class="profile-slider-value" id="glass-opacity-val">${opacityVal}%</span>
                  </div>
                  <div class="profile-slider-wrap">
                    <span class="profile-slider-edge">Bening</span>
                    <input type="range" min="15" max="95" value="${opacityVal}" class="profile-range" data-theme-glass-opacity aria-label="Tingkat transparansi kaca">
                    <span class="profile-slider-edge">Pekat</span>
                  </div>
                  <div class="profile-quick-row">
                    <button type="button" class="profile-quick-btn" data-quick-opacity="30">30%</button>
                    <button type="button" class="profile-quick-btn" data-quick-opacity="65">65%</button>
                    <button type="button" class="profile-quick-btn" data-quick-opacity="90">90%</button>
                  </div>
                </div>
              </div>
            </details>
          </section>
        </div>

        <!-- GRUP 2: NOTIFIKASI -->
        <div class="settings-group">
          <span class="settings-group-label">Notifikasi</span>
          <section class="profile-panel slide-up">
            <div class="profile-switch-row">
              <div class="profile-switch-copy">
                <strong>Pengingat Belajar &amp; Skill <button type="button" class="amy-info-btn" data-info-tip="Notifikasi jadwal belajar &amp; evaluasi harian pada perangkat ini." aria-label="Info pengingat belajar" aria-expanded="false">i</button></strong>
                <small class="profile-subtle">Jadwal Sesi Belajar Harian (Pagi, Siang, Malam)</small>
              </div>
              <label class="profile-switch" aria-label="Aktifkan notifikasi pengingat belajar">
                <input type="checkbox" id="learningReminderEnabled" ${reminderConfig.enabled ? 'checked' : ''}>
                <span class="profile-switch-track"></span>
              </label>
            </div>

            <div id="learningReminderSettingsWrap" class="profile-reminder-body" style="${reminderConfig.enabled ? '' : 'display:none;'}">
              <input type="hidden" id="learningReminderTimeInput" value="${escapeHtml(reminderConfig.time)}">

              <div class="profile-reminder-list">
                <div class="profile-reminder-row">
                  <label class="profile-switch profile-switch--sm" aria-label="Aktifkan sesi pagi">
                    <input type="checkbox" id="reminderMorningEnabled" ${reminderSlots.morning?.enabled ? 'checked' : ''}>
                    <span class="profile-switch-track"></span>
                  </label>
                  <div class="profile-reminder-copy"><strong>Pagi</strong></div>
                  <input type="time" id="reminderMorningTime" class="profile-time-input" aria-label="Jam sesi pagi" value="${escapeHtml(reminderSlots.morning?.time || '08:00')}">
                </div>

                <div class="profile-reminder-row">
                  <label class="profile-switch profile-switch--sm" aria-label="Aktifkan sesi siang">
                    <input type="checkbox" id="reminderAfternoonEnabled" ${reminderSlots.afternoon?.enabled ? 'checked' : ''}>
                    <span class="profile-switch-track"></span>
                  </label>
                  <div class="profile-reminder-copy"><strong>Siang</strong></div>
                  <input type="time" id="reminderAfternoonTime" class="profile-time-input" aria-label="Jam sesi siang" value="${escapeHtml(reminderSlots.afternoon?.time || '13:00')}">
                </div>

                <div class="profile-reminder-row">
                  <label class="profile-switch profile-switch--sm" aria-label="Aktifkan sesi malam">
                    <input type="checkbox" id="reminderNightEnabled" ${reminderSlots.night?.enabled ? 'checked' : ''}>
                    <span class="profile-switch-track"></span>
                  </label>
                  <div class="profile-reminder-copy"><strong>Malam</strong></div>
                  <input type="time" id="reminderNightTime" class="profile-time-input" aria-label="Jam sesi malam" value="${escapeHtml(reminderSlots.night?.time || '20:00')}">
                </div>
              </div>

              <div class="profile-last-lesson profile-last-lesson--compact">
                <div id="learningReminderLastTitle" class="profile-last-lesson-title">${escapeHtml(reminderConfig.lastTitle)}</div>
                <small id="learningReminderLastTime" class="profile-last-lesson-time">${escapeHtml(reminderConfig.lastTimeText)}</small>
              </div>

              <div class="profile-actions-row">
                <button type="button" id="saveLearningReminderBtn" class="profile-btn-primary">Simpan</button>
                <button type="button" id="testLearningReminderBtn" class="profile-btn-ghost">Uji</button>
              </div>
            </div>
          </section>
        </div>

        <!-- GRUP 3: CLOUD SYNC (GITHUB) -->
        <div class="settings-group">
          <span class="settings-group-label">Cloud Sync (GitHub)</span>
          <section class="profile-panel gh-sync-panel slide-up" aria-label="Sinkronisasi Cloud GitHub">
            <div class="gh-sync-head">
              <div class="gh-sync-title-wrap">
                <strong>GitHub Private Repo</strong>
                <button type="button" class="amy-info-btn" data-info-tip="Sinkronisasi gratis Jurnal, Catatan Pribadi, Profil Simulasi, Daily Loss Guard, progres Academy, dan Bookmark Replay ke repo privat GitHub Anda. File video besar &amp; Token PAT tidak pernah diunggah." aria-label="Info Cloud Sync GitHub" aria-expanded="false">i</button>
              </div>
              <div class="gh-sync-badges">
                <span id="ghSyncStatusBadge" class="gh-sync-badge ${ghStatusClass}">${escapeHtml(ghStatusLabel)}</span>
                ${ghPrivacyMarkup}
              </div>
            </div>

            <div class="gh-sync-grid">
              <div class="gh-sync-field">
                <label for="ghSyncRepoInput">Repositori (owner/repo)</label>
                <input type="text" id="ghSyncRepoInput" class="gh-sync-input" value="${escapeHtml(ghCfg.repo || 'suhaimitoamy/amyfx-private-sync')}" placeholder="suhaimitoamy/amyfx-private-sync" autocomplete="off" spellcheck="false">
              </div>
              <div class="gh-sync-field">
                <label for="ghSyncBranchInput">Branch</label>
                <input type="text" id="ghSyncBranchInput" class="gh-sync-input" value="${escapeHtml(ghCfg.branch || 'main')}" placeholder="main" autocomplete="off" spellcheck="false">
              </div>
            </div>

            <div class="gh-sync-field">
              <label for="ghSyncTokenInput">Token PAT (Fine-Grained · Contents R/W)</label>
              <div class="gh-sync-token-wrap">
                <input type="password" id="ghSyncTokenInput" class="gh-sync-input" value="${escapeHtml(ghCfg.token || '')}" placeholder="github_pat_..." autocomplete="off" spellcheck="false">
                <button type="button" id="ghSyncTokenToggleBtn" class="gh-sync-eye-btn" aria-label="Tampilkan token" aria-pressed="false">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>

            <button type="button" id="ghSyncTestBtn" class="profile-btn-primary">Simpan &amp; Tes Koneksi</button>
            <p id="ghSyncFeedback" class="gh-sync-feedback" role="status" aria-live="polite"></p>

            <div class="profile-divider" style="padding-top:12px;">
              <div class="profile-switch-row">
                <div class="profile-switch-copy">
                  <strong>Auto-Sync <button type="button" class="amy-info-btn" data-info-tip="Otomatis mengirim perubahan Jurnal &amp; Catatan ke GitHub 5 detik setelah disimpan (saat online). Default nonaktif agar kontrol penuh tetap di tangan Anda." aria-label="Info Auto-Sync" aria-expanded="false">i</button></strong>
                </div>
                <label class="profile-switch" aria-label="Aktifkan Auto-Sync GitHub">
                  <input type="checkbox" id="ghSyncAutoToggle" ${ghCfg.autoSync ? 'checked' : ''}>
                  <span class="profile-switch-track"></span>
                </label>
              </div>
            </div>

            <div class="gh-sync-actions-grid">
              <button type="button" id="ghSyncPushBtn" class="profile-btn-ghost">Kirim ke Cloud (Push)</button>
              <button type="button" id="ghSyncPullBtn" class="profile-btn-ghost" data-confirm-arm="0">Ambil dari Cloud (Pull)</button>
            </div>

            <div id="ghSyncConflictBox" class="gh-sync-conflict" hidden>
              <p id="ghSyncConflictMsg">Data di GitHub Cloud lebih baru dari perangkat lain.</p>
              <div class="gh-sync-actions-grid">
                <button type="button" id="ghSyncConflictPullBtn" class="profile-btn-primary">Ambil Versi Cloud</button>
                <button type="button" id="ghSyncConflictForcePushBtn" class="profile-btn-ghost">Timpa Paksa</button>
              </div>
            </div>

            <button type="button" id="ghSyncDisconnectBtn" class="gh-sync-disconnect-btn" data-confirm-arm="0" ${ghCfg.token || ghCfg.connected ? '' : 'hidden'}>Putuskan Cloud</button>
          </section>
        </div>

        <!-- GRUP 4: DATA & APLIKASI -->
        <div class="settings-group">
          <span class="settings-group-label">Data &amp; Aplikasi</span>
          <section class="profile-list profile-system-list" aria-label="Data dan Aplikasi">
            <button class="profile-row profile-row--compact" id="profileClearCacheBtn" type="button">
              <span class="tool-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>
              </span>
              <span><strong>Bersihkan Cache</strong></span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
            <button class="profile-row profile-row--compact" id="profileExportBtn" type="button">
              <span class="tool-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </span>
              <span><strong>Ekspor Cadangan</strong></span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
            <button class="profile-row profile-row--compact" id="profileImportBtn" type="button">
              <span class="tool-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </span>
              <span><strong>Pulihkan Cadangan</strong></span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
            <input type="file" id="profileImportFileInput" accept="application/json" hidden>
            <button class="profile-row profile-row--compact danger-row" data-profile-action="clear" data-confirm-arm="0" type="button">
              <span class="tool-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </span>
              <span><strong data-clear-label>Hapus Data Lokal</strong></span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </section>
        </div>
      </div>
    `;

    // Sync unified appearance presets & sliders
    window.AmyFXProfileSettings?.sync?.();

    document.getElementById('profileClearCacheBtn')?.addEventListener('click', () => {
      if (typeof window.Android?.clearAppCache === 'function') {
        const freedMb = window.Android.clearAppCache();
        showToast(`Berhasil membebaskan ${freedMb || '0'} MB ruang penyimpanan.`);
        return;
      }
      let clearedCount = 0;
      try {
        const keys = Object.keys(sessionStorage);
        for (const k of keys) {
          if (k.startsWith('amy_cache_') || k.startsWith('temp_')) {
            sessionStorage.removeItem(k);
            clearedCount += 1;
          }
        }
      } catch (_) {}
      showToast(clearedCount > 0
        ? `Cache sementara dibersihkan (${clearedCount} item).`
        : 'Cache sementara sudah bersih.');
    });

    // Learning Reminder event bindings
    const reminderToggle = document.getElementById('learningReminderEnabled');
    const reminderSettingsWrap = document.getElementById('learningReminderSettingsWrap');

    function collectCurrentSlots() {
      const mEn = document.getElementById('reminderMorningEnabled')?.checked ?? true;
      const mTime = document.getElementById('reminderMorningTime')?.value || '08:00';
      const aEn = document.getElementById('reminderAfternoonEnabled')?.checked ?? true;
      const aTime = document.getElementById('reminderAfternoonTime')?.value || '13:00';
      const nEn = document.getElementById('reminderNightEnabled')?.checked ?? true;
      const nTime = document.getElementById('reminderNightTime')?.value || '20:00';
      return {
        morning: { enabled: mEn, time: mTime, label: 'Pagi' },
        afternoon: { enabled: aEn, time: aTime, label: 'Siang' },
        night: { enabled: nEn, time: nTime, label: 'Malam' }
      };
    }

    reminderToggle?.addEventListener('change', () => {
      const isChecked = reminderToggle.checked;
      if (reminderSettingsWrap) reminderSettingsWrap.style.display = isChecked ? 'block' : 'none';
      const slots = collectCurrentSlots();
      if (window.AmyLearningReminder?.saveSlots) {
        window.AmyLearningReminder.saveSlots(isChecked, slots);
      } else {
        localStorage.setItem('amy_learning_reminder_enabled', isChecked ? 'true' : 'false');
        localStorage.setItem('amy_learning_reminder_slots', JSON.stringify(slots));
      }
      showToast(isChecked ? 'Pengingat belajar diaktifkan.' : 'Pengingat belajar dinonaktifkan.');
    });

    document.getElementById('saveLearningReminderBtn')?.addEventListener('click', () => {
      const isChecked = document.getElementById('learningReminderEnabled')?.checked ?? true;
      const slots = collectCurrentSlots();
      if (window.AmyLearningReminder?.saveSlots) {
        window.AmyLearningReminder.saveSlots(isChecked, slots);
      } else {
        localStorage.setItem('amy_learning_reminder_enabled', isChecked ? 'true' : 'false');
        localStorage.setItem('amy_learning_reminder_slots', JSON.stringify(slots));
      }

      const activeList = [];
      if (slots.morning.enabled) activeList.push(`Pagi (${slots.morning.time})`);
      if (slots.afternoon.enabled) activeList.push(`Siang (${slots.afternoon.time})`);
      if (slots.night.enabled) activeList.push(`Malam (${slots.night.time})`);

      const summaryText = activeList.length ? activeList.join(', ') : 'Semua sesi nonaktif';
      showToast(`Jadwal pengingat disimpan: ${summaryText}`);
    });

    document.getElementById('testLearningReminderBtn')?.addEventListener('click', () => {
      if (window.AmyLearningReminder) {
        window.AmyLearningReminder.triggerReminderNotification();
      } else if (window.Android?.triggerLearningReminderNotification) {
        window.Android.triggerLearningReminderNotification();
      }
      showToast('Notifikasi pengingat belajar dikirim!');
    });

    // GitHub Cloud Sync handlers
    const ghRepoInput = document.getElementById('ghSyncRepoInput');
    const ghBranchInput = document.getElementById('ghSyncBranchInput');
    const ghTokenInput = document.getElementById('ghSyncTokenInput');
    const ghTokenToggleBtn = document.getElementById('ghSyncTokenToggleBtn');
    const ghTestBtn = document.getElementById('ghSyncTestBtn');
    const ghStatusBadge = document.getElementById('ghSyncStatusBadge');
    const ghPrivacyBadge = document.getElementById('ghSyncPrivacyBadge');
    const ghFeedback = document.getElementById('ghSyncFeedback');
    const ghAutoToggle = document.getElementById('ghSyncAutoToggle');
    const ghPushBtn = document.getElementById('ghSyncPushBtn');
    const ghPullBtn = document.getElementById('ghSyncPullBtn');
    const ghConflictBox = document.getElementById('ghSyncConflictBox');
    const ghConflictMsg = document.getElementById('ghSyncConflictMsg');
    const ghConflictPullBtn = document.getElementById('ghSyncConflictPullBtn');
    const ghConflictForcePushBtn = document.getElementById('ghSyncConflictForcePushBtn');
    const ghDisconnectBtn = document.getElementById('ghSyncDisconnectBtn');

    function setGhFeedback(msg, tone = '') {
      if (!ghFeedback) return;
      ghFeedback.textContent = msg || '';
      ghFeedback.classList.remove('is-ok', 'is-error');
      if (tone) ghFeedback.classList.add(tone);
    }

    function refreshGhBadges(cfgOverride) {
      const cfg = cfgOverride || ghSyncApi?.loadConfig?.();
      if (!cfg) return;
      const syncText = cfg.lastSyncAt && ghSyncApi?.formatSyncTimestamp
        ? ghSyncApi.formatSyncTimestamp(cfg.lastSyncAt)
        : '';
      if (ghStatusBadge) {
        ghStatusBadge.classList.remove('is-ok', 'is-warn');
        if (cfg.connected) {
          ghStatusBadge.textContent = syncText ? `Tersinkron · ${syncText}` : 'Terhubung';
          ghStatusBadge.classList.add('is-ok');
        } else if (cfg.token) {
          ghStatusBadge.textContent = 'Belum diuji';
          ghStatusBadge.classList.add('is-warn');
        } else {
          ghStatusBadge.textContent = 'Belum terhubung';
        }
      }
      if (ghPrivacyBadge) {
        ghPrivacyBadge.classList.remove('is-private', 'is-warn');
        if (cfg.connected) {
          ghPrivacyBadge.hidden = false;
          if (cfg.isPrivate === false) {
            ghPrivacyBadge.textContent = 'Publik!';
            ghPrivacyBadge.classList.add('is-warn');
          } else {
            ghPrivacyBadge.textContent = 'Private';
            ghPrivacyBadge.classList.add('is-private');
          }
        } else {
          ghPrivacyBadge.hidden = true;
          ghPrivacyBadge.textContent = '';
        }
      }
      if (ghDisconnectBtn) {
        ghDisconnectBtn.hidden = !(cfg.token || cfg.connected);
      }
    }

    function setGhBusy(isBusy) {
      [ghTestBtn, ghPushBtn, ghPullBtn, ghConflictPullBtn, ghConflictForcePushBtn].forEach((btn) => {
        if (btn) btn.disabled = Boolean(isBusy);
      });
    }

    ghTokenToggleBtn?.addEventListener('click', () => {
      if (!ghTokenInput) return;
      const showing = ghTokenInput.type === 'text';
      ghTokenInput.type = showing ? 'password' : 'text';
      ghTokenToggleBtn.setAttribute('aria-pressed', showing ? 'false' : 'true');
      ghTokenToggleBtn.setAttribute('aria-label', showing ? 'Tampilkan token' : 'Sembunyikan token');
      ghTokenToggleBtn.innerHTML = showing
        ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
        : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
    });

    ghTestBtn?.addEventListener('click', async () => {
      if (!ghSyncApi) {
        showToast('Modul Cloud Sync belum siap.');
        return;
      }
      if (ghConflictBox) ghConflictBox.hidden = true;
      setGhBusy(true);
      setGhFeedback('Menguji koneksi ke GitHub...');
      try {
        const res = await ghSyncApi.testConnection({
          repo: ghRepoInput?.value || '',
          branch: ghBranchInput?.value || 'main',
          token: ghTokenInput?.value || ''
        });
        refreshGhBadges();
        if (res.ok) {
          setGhFeedback(res.message, res.isPrivate ? 'is-ok' : 'is-error');
          showToast(res.message);
        } else {
          setGhFeedback(res.error || 'Koneksi gagal.', 'is-error');
          showToast(res.error || 'Koneksi GitHub gagal.');
        }
      } finally {
        setGhBusy(false);
      }
    });

    ghAutoToggle?.addEventListener('change', () => {
      if (!ghSyncApi) return;
      const wantOn = Boolean(ghAutoToggle.checked);
      const current = ghSyncApi.loadConfig();
      const tokenNow = String(ghTokenInput?.value || current.token || '').trim();
      if (wantOn && !tokenNow) {
        ghAutoToggle.checked = false;
        setGhFeedback('Isi Token PAT dan tes koneksi dulu sebelum mengaktifkan Auto-Sync.', 'is-error');
        showToast('Isi Token PAT dan tes koneksi dulu.');
        return;
      }
      ghSyncApi.saveConfig({
        repo: ghRepoInput?.value || current.repo,
        branch: ghBranchInput?.value || current.branch,
        token: tokenNow,
        autoSync: wantOn
      });
      if (!wantOn) ghSyncApi.cancelAutoSync?.();
      setGhFeedback(wantOn ? 'Auto-Sync aktif (jeda 5 detik setelah perubahan Jurnal/Catatan).' : 'Auto-Sync nonaktif.', wantOn ? 'is-ok' : '');
      showToast(wantOn ? 'Auto-Sync GitHub diaktifkan.' : 'Auto-Sync GitHub dinonaktifkan.');
    });

    async function runGhPush(force = false) {
      if (!ghSyncApi) return;
      const current = ghSyncApi.loadConfig();
      const tokenNow = String(ghTokenInput?.value || current.token || '').trim();
      if (!tokenNow) {
        setGhFeedback('Tempelkan Token PAT GitHub terlebih dahulu.', 'is-error');
        showToast('Token PAT belum diisi.');
        return;
      }
      ghSyncApi.saveConfig({
        repo: ghRepoInput?.value || current.repo,
        branch: ghBranchInput?.value || current.branch,
        token: tokenNow
      });
      setGhBusy(true);
      if (ghConflictBox) ghConflictBox.hidden = true;
      setGhFeedback(force ? 'Menimpa cadangan di GitHub...' : 'Mengirim data ke GitHub Cloud...');
      try {
        const res = await ghSyncApi.pushToCloud({ force, reason: force ? 'manual-force' : 'manual' });
        refreshGhBadges();
        if (res.ok) {
          const summary = `Terkirim ke Cloud (${res.journalCount} jurnal · ${res.noteCount} catatan).`;
          setGhFeedback(summary, 'is-ok');
          showToast(summary);
        } else if (res.conflict) {
          const when = res.remoteUpdatedAt ? ghSyncApi.formatSyncTimestamp(res.remoteUpdatedAt) : '';
          if (ghConflictMsg) {
            ghConflictMsg.textContent = `Data di GitHub Cloud lebih baru${when ? ` (${when})` : ''} dari perangkat lain. Ambil versi Cloud dulu agar tidak hilang, atau timpa paksa.`;
          }
          if (ghConflictBox) ghConflictBox.hidden = false;
          setGhFeedback('Push ditahan: ditemukan data Cloud yang lebih baru.', 'is-error');
          showToast('Data Cloud lebih baru — periksa peringatan konflik.');
        } else {
          setGhFeedback(res.error || 'Gagal mengirim ke Cloud.', 'is-error');
          showToast(res.error || 'Gagal mengirim ke Cloud.');
        }
      } finally {
        setGhBusy(false);
      }
    }

    async function runGhPull() {
      if (!ghSyncApi) return;
      const current = ghSyncApi.loadConfig();
      const tokenNow = String(ghTokenInput?.value || current.token || '').trim();
      if (!tokenNow) {
        setGhFeedback('Tempelkan Token PAT GitHub terlebih dahulu.', 'is-error');
        showToast('Token PAT belum diisi.');
        return;
      }
      ghSyncApi.saveConfig({
        repo: ghRepoInput?.value || current.repo,
        branch: ghBranchInput?.value || current.branch,
        token: tokenNow
      });
      setGhBusy(true);
      if (ghConflictBox) ghConflictBox.hidden = true;
      setGhFeedback('Mengambil data dari GitHub Cloud...');
      try {
        const res = await ghSyncApi.pullFromCloud();
        refreshGhBadges();
        if (res.ok) {
          const summary = `Dipulihkan dari Cloud (${res.journalCount} jurnal · ${res.noteCount} catatan).`;
          setGhFeedback(summary, 'is-ok');
          showToast(summary);
        } else {
          setGhFeedback(res.error || 'Gagal mengambil dari Cloud.', 'is-error');
          showToast(res.error || 'Gagal mengambil dari Cloud.');
        }
      } finally {
        setGhBusy(false);
      }
    }

    ghPushBtn?.addEventListener('click', () => runGhPush(false));

    ghPullBtn?.addEventListener('click', () => {
      if (ghPullBtn.dataset.confirmArm !== '1') {
        ghPullBtn.dataset.confirmArm = '1';
        ghPullBtn.classList.add('is-armed');
        ghPullBtn.textContent = 'Ketuk Lagi: Timpa Lokal?';
        clearTimeout(ghPullBtn._armTimer);
        ghPullBtn._armTimer = setTimeout(() => {
          ghPullBtn.dataset.confirmArm = '0';
          ghPullBtn.classList.remove('is-armed');
          ghPullBtn.textContent = 'Ambil dari Cloud (Pull)';
        }, 4000);
        return;
      }
      clearTimeout(ghPullBtn._armTimer);
      ghPullBtn.dataset.confirmArm = '0';
      ghPullBtn.classList.remove('is-armed');
      ghPullBtn.textContent = 'Ambil dari Cloud (Pull)';
      runGhPull();
    });

    ghConflictPullBtn?.addEventListener('click', () => runGhPull());
    ghConflictForcePushBtn?.addEventListener('click', () => runGhPush(true));

    ghDisconnectBtn?.addEventListener('click', () => {
      if (!ghSyncApi) return;
      if (ghDisconnectBtn.dataset.confirmArm !== '1') {
        ghDisconnectBtn.dataset.confirmArm = '1';
        ghDisconnectBtn.classList.add('is-armed');
        ghDisconnectBtn.textContent = 'Ketuk Lagi: Hapus Token Lokal?';
        clearTimeout(ghDisconnectBtn._armTimer);
        ghDisconnectBtn._armTimer = setTimeout(() => {
          ghDisconnectBtn.dataset.confirmArm = '0';
          ghDisconnectBtn.classList.remove('is-armed');
          ghDisconnectBtn.textContent = 'Putuskan Cloud';
        }, 4000);
        return;
      }
      clearTimeout(ghDisconnectBtn._armTimer);
      ghDisconnectBtn.dataset.confirmArm = '0';
      ghDisconnectBtn.classList.remove('is-armed');
      ghDisconnectBtn.textContent = 'Putuskan Cloud';
      const cleared = ghSyncApi.disconnectConfig();
      if (ghTokenInput) {
        ghTokenInput.value = '';
        ghTokenInput.type = 'password';
      }
      if (ghAutoToggle) ghAutoToggle.checked = false;
      if (ghConflictBox) ghConflictBox.hidden = true;
      refreshGhBadges(cleared);
      setGhFeedback('Koneksi Cloud diputus. Token PAT lokal telah dihapus.');
      showToast('Koneksi Cloud GitHub diputus.');
    });

    async function openJournalLibraryDbV2() {
      if (!('indexedDB' in window)) return null;
      return new Promise((res, rej) => {
        const req = indexedDB.open('tradingLibraryManager.files', 2);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('metadata')) db.createObjectStore('metadata', { keyPath: 'id' });
        };
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
    }

    async function loadJournalsForBackup() {
      let journals = [];
      let notes = [];
      try {
        const db = await openJournalLibraryDbV2();
        if (db && db.objectStoreNames.contains('metadata')) {
          const readRec = (key) => new Promise((res) => {
            const tx = db.transaction('metadata', 'readonly');
            const req = tx.objectStore('metadata').get(key);
            req.onsuccess = () => res(req.result?.value || []);
            req.onerror = () => res([]);
          });
          const jRow = await readRec('journals.v2');
          if (Array.isArray(jRow) && jRow.length) journals = jRow;
          const nRow = await readRec('notes.v2');
          if (Array.isArray(nRow) && nRow.length) notes = nRow;
        }
        db?.close();
      } catch (_) {}

      if (!journals.length) {
        try {
          const raw = localStorage.getItem('tradingLibraryManager.journals.v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length) journals = parsed;
          }
        } catch (_) {}
      }
      if (!journals.length) journals = readJsonArray('amy_journal_entries');
      if (!notes.length) notes = readJsonArray('tradingLibraryManager.notes.v1');

      return { journals, notes };
    }

    document.getElementById('profileExportBtn')?.addEventListener('click', async () => {
      showToast('Menyiapkan file cadangan profil & data...');
      const { journals: journalsList, notes: personalNotes } = await loadJournalsForBackup();
      const backupData = {
        app: 'Amy FX Pro',
        exportedAt: new Date().toISOString(),
        traderName: localStorage.getItem('amy_trader_name') || 'Trader',
        balance: localStorage.getItem('amy_default_balance') || '5000',
        risk: localStorage.getItem('amy_default_risk') || '1.5',
        accountSim: {
          currency: localStorage.getItem('amy_account_currency') || 'IDR',
          usdIdrRate: localStorage.getItem('amy_usd_idr_rate') || '16500',
          leverage: localStorage.getItem('amy_account_leverage') || '500',
          spreadUsd: localStorage.getItem('amy_account_spread') || '0.20',
          positions: readJsonSafe('amy_sim_positions_v1', []),
          cashflows: readJsonSafe('amy_sim_cashflows_v1', [])
        },
        dailyLossGuard: readJsonSafe('amy_daily_loss_guard_v1', null),
        mappingPoiHistory: readJsonSafe('amyfx.mapping.reaction_history.v1', null),
        priceAlerts: readJsonSafe('amy_price_alerts_v1', []),
        guidedPracticeMastery: readJsonSafe('amy-guided-v3-mastery', null),
        academyProgress: readJsonSafe('amy_academy_progress_v2', null),
        academyBookmarks: readJsonSafe('amy_academy_bookmarks_v1', []),
        replayBookmarks: readJsonSafe('amy_replay_bookmarks_v1', []),
        mediaWatched: readJsonSafe('amy_media_watched_v1', []),
        habits: readJsonSafe('amy_habits_v2', []),
        completedHabits: readJsonSafe('amy_completed_dates_v2', {}),
        personalNotes,
        journals: journalsList
      };
      const poiCount = Array.isArray(backupData.mappingPoiHistory?.poiRecords)
        ? backupData.mappingPoiHistory.poiRecords.length
        : 0;
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amyfx-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Cadangan diunduh (${journalsList.length} jurnal · ${poiCount} POI · ${personalNotes.length} catatan).`);
    });

    const importFileInput = document.getElementById('profileImportFileInput');
    document.getElementById('profileImportBtn')?.addEventListener('click', () => {
      importFileInput?.click();
    });

    importFileInput?.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data || typeof data !== 'object') throw new Error('Format file tidak valid.');

        if (data.traderName) localStorage.setItem('amy_trader_name', String(data.traderName));
        if (data.balance) localStorage.setItem('amy_default_balance', String(data.balance));
        if (data.risk) localStorage.setItem('amy_default_risk', String(data.risk));
        if (data.accountSim && typeof data.accountSim === 'object') {
          if (data.accountSim.currency) localStorage.setItem('amy_account_currency', String(data.accountSim.currency));
          if (data.accountSim.usdIdrRate) localStorage.setItem('amy_usd_idr_rate', String(data.accountSim.usdIdrRate));
          if (data.accountSim.leverage) localStorage.setItem('amy_account_leverage', String(data.accountSim.leverage));
          if (data.accountSim.spreadUsd !== undefined) localStorage.setItem('amy_account_spread', String(data.accountSim.spreadUsd));
          if (Array.isArray(data.accountSim.positions)) localStorage.setItem('amy_sim_positions_v1', JSON.stringify(data.accountSim.positions));
          if (Array.isArray(data.accountSim.cashflows)) localStorage.setItem('amy_sim_cashflows_v1', JSON.stringify(data.accountSim.cashflows));
        }
        if (data.dailyLossGuard && typeof data.dailyLossGuard === 'object') {
          localStorage.setItem('amy_daily_loss_guard_v1', JSON.stringify(data.dailyLossGuard));
        }
        let restoredPoiCount = 0;
        if (data.mappingPoiHistory && typeof data.mappingPoiHistory === 'object') {
          localStorage.setItem('amyfx.mapping.reaction_history.v1', JSON.stringify(data.mappingPoiHistory));
          if (Array.isArray(data.mappingPoiHistory.poiRecords)) {
            restoredPoiCount = data.mappingPoiHistory.poiRecords.length;
          }
        }
        if (Array.isArray(data.priceAlerts)) {
          localStorage.setItem('amy_price_alerts_v1', JSON.stringify(data.priceAlerts));
        }
        if (data.guidedPracticeMastery && typeof data.guidedPracticeMastery === 'object') {
          localStorage.setItem('amy-guided-v3-mastery', JSON.stringify(data.guidedPracticeMastery));
        }
        if (data.academyProgress && typeof data.academyProgress === 'object') {
          localStorage.setItem('amy_academy_progress_v2', JSON.stringify(data.academyProgress));
        }
        if (Array.isArray(data.academyBookmarks)) localStorage.setItem('amy_academy_bookmarks_v1', JSON.stringify(data.academyBookmarks));
        if (Array.isArray(data.replayBookmarks)) localStorage.setItem('amy_replay_bookmarks_v1', JSON.stringify(data.replayBookmarks));
        if (Array.isArray(data.mediaWatched)) localStorage.setItem('amy_media_watched_v1', JSON.stringify(data.mediaWatched));
        if (Array.isArray(data.habits)) localStorage.setItem('amy_habits_v2', JSON.stringify(data.habits));
        if (data.completedHabits && typeof data.completedHabits === 'object') {
          localStorage.setItem('amy_completed_dates_v2', JSON.stringify(data.completedHabits));
        }

        let journalCount = 0;
        let noteCount = 0;
        const hasJournals = Array.isArray(data.journals) && data.journals.length > 0;
        const hasNotes = Array.isArray(data.personalNotes) && data.personalNotes.length > 0;

        if (hasJournals) {
          journalCount = data.journals.length;
          localStorage.setItem('tradingLibraryManager.journals.v1', JSON.stringify(data.journals));
          localStorage.setItem('amy_journal_entries', JSON.stringify(data.journals));
        }
        if (hasNotes) {
          noteCount = data.personalNotes.length;
          localStorage.setItem('tradingLibraryManager.notes.v1', JSON.stringify(data.personalNotes));
        }

        if (hasJournals || hasNotes) {
          try {
            const db = await openJournalLibraryDbV2();
            if (db && db.objectStoreNames.contains('metadata')) {
              await new Promise((res) => {
                const tx = db.transaction('metadata', 'readwrite');
                const store = tx.objectStore('metadata');
                const nowIso = new Date().toISOString();
                if (hasJournals) store.put({ id: 'journals.v2', value: data.journals, updatedAt: nowIso });
                if (hasNotes) store.put({ id: 'notes.v2', value: data.personalNotes, updatedAt: nowIso });
                tx.oncomplete = () => res();
                tx.onerror = () => res();
              });
            }
            db?.close();
          } catch (_) {}
        }

        showToast(`Cadangan dipulihkan (${journalCount} jurnal · ${restoredPoiCount} POI · ${noteCount} catatan).`);
        renderSettings();
      } catch (err) {
        showToast('Gagal memulihkan cadangan: ' + (err.message || 'File rusak'));
      } finally {
        event.target.value = '';
      }
    });

    // Custom Background Photo Handlers
    const fileInput = document.getElementById('customBgFileInput');
    const uploadBtn = document.getElementById('uploadCustomBgBtn');
    const removeBtn = document.getElementById('removeCustomBgBtn');
    const controls = document.getElementById('customBgControls');
    const badge = document.getElementById('customBgBadge');
    const dimSlider = document.getElementById('customBgDimSlider');
    const blurSlider = document.getElementById('customBgBlurSlider');
    const dimVal = document.getElementById('customBgDimVal');
    const blurVal = document.getElementById('customBgBlurVal');

    uploadBtn?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Pilih file gambar (JPG, PNG, WebP).');
        return;
      }
      showToast('Memproses foto latar...');
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const dataUrl = (window.AmyFXTheme && typeof window.AmyFXTheme.compressWallpaper === 'function')
            ? window.AmyFXTheme.compressWallpaper(img, 1080, 720, 0.75)
            : (() => {
                const maxWidth = 1080;
                const maxHeight = 720;
                let w = img.width;
                let h = img.height;
                if (w > maxWidth || h > maxHeight) {
                  const ratio = Math.min(maxWidth / w, maxHeight / h);
                  w = Math.round(w * ratio);
                  h = Math.round(h * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                let u = '';
                try { u = canvas.toDataURL('image/webp', 0.75); } catch (_) {}
                return (u && u.startsWith('data:image/webp')) ? u : canvas.toDataURL('image/jpeg', 0.72);
              })();

          const currentDim = dimSlider ? Number(dimSlider.value) : 50;
          const currentBlur = blurSlider ? Number(blurSlider.value) : 20;
          window.AmyFXTheme?.setCustomBg?.({
            image: dataUrl,
            dim: currentDim,
            blur: currentBlur
          });

          if (controls) controls.style.display = 'block';
          if (removeBtn) removeBtn.style.display = 'inline-flex';
          if (badge) {
            badge.textContent = 'Foto aktif';
            badge.classList.add('is-active');
          }
          showToast('Wallpaper kustom berhasil dipasang!');
        };
        img.onerror = () => showToast('Gagal memuat gambar.');
        img.src = e.target.result;
      };
      reader.onerror = () => showToast('Gagal membaca file gambar.');
      reader.readAsDataURL(file);
    });

    dimSlider?.addEventListener('input', e => {
      const val = Number(e.target.value);
      if (dimVal) dimVal.textContent = `${val}%`;
      const overlay = document.getElementById('amyfx-custom-bg-overlay');
      if (overlay) {
        overlay.style.backgroundColor = `rgba(7, 11, 20, ${(val / 100).toFixed(2)})`;
      }
      const current = window.AmyFXTheme?.customBg;
      if (current) {
        window.AmyFXTheme?.setCustomBg?.({ ...current, dim: val });
      }
    });

    blurSlider?.addEventListener('input', e => {
      const val = Number(e.target.value);
      if (blurVal) blurVal.textContent = `${val}px`;
      document.documentElement.style.setProperty('--glass-blur', `${val}px`);
      const current = window.AmyFXTheme?.customBg;
      if (current) {
        window.AmyFXTheme?.setCustomBg?.({ ...current, blur: val });
      }
    });

    removeBtn?.addEventListener('click', () => {
      window.AmyFXTheme?.removeCustomBg?.();
      if (controls) controls.style.display = 'none';
      if (removeBtn) removeBtn.style.display = 'none';
      if (badge) {
        badge.textContent = 'Default';
        badge.classList.remove('is-active');
      }
      if (fileInput) fileInput.value = '';
      showToast('Wallpaper kustom dihapus.');
    });

    const activePref = window.AmyFXTheme?.preference || 'system';
    document.querySelectorAll('[data-amyfx-theme-choice]').forEach(b => {
      b.classList.toggle('is-active', b.dataset.amyfxThemeChoice === activePref);
    });

    window.AmyFXTheme?.apply?.();
    try { window.dispatchEvent(new CustomEvent('amyfx:settings-rendered')); } catch (_) {}
  }

  function handleKoleksi(action) {
    if (action === 'kode') {
      const savedCode = localStorage.getItem('amy_saved_code');
      mainContent.innerHTML = `<div class="page-header row"><button class="back-btn" data-nav="koleksi">‹</button><h2>Kode Tersimpan</h2></div><section class="code-panel"><pre id="code-display"></pre><div class="actions"><button class="action-btn primary" data-copy-koleksi>Salin Kode</button></div></section>`;
      const savedDisplay = document.getElementById('code-display');
      if (savedDisplay) savedDisplay.textContent = savedCode || 'Belum ada kode tersimpan.';
    } else if (action === 'favorit' || action === 'riwayat') {
      showToast('Fitur ini akan segera hadir pada update berikutnya.');
    } else if (action === 'update') {
      window.AmyFXUpdate?.checkNow?.({ announce: true });
    }
  }

  function renderIndicatorList(category = 'Semua', query = '') {
    const list = document.getElementById('indicator-list');
    if (!list) return;
    const q = String(query || '').toLowerCase();
    const filtered = indicators.filter(item => (category === 'Semua' || String(item.category || '') === category) && (String(item.name || '').toLowerCase().includes(q) || String(item.desc || '').toLowerCase().includes(q)));
    list.innerHTML = filtered.map(item => {
      const originalIndex = indicators.indexOf(item);
      return `<button class="indicator-item" data-select-indicator="${originalIndex}">${icon('code')}<span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.desc)}</small></span><span class="chevron">›</span></button>`;
    }).join('') || '<div class="empty">Indikator tidak ditemukan.</div>';
  }

  async function renderIndikator() {
    setActive('proyek');
    const categoryOptions = ['Semua', ...new Set(indicators.map(i => i.category))];
    const pillsHTML = categoryOptions.map(cat => `<button class="pill ${cat === 'Semua' ? 'active' : ''}" data-filter="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`).join('');

    mainContent.innerHTML = `<div class="page-header row"><button class="back-btn" data-nav="proyek">‹</button><h2>Indikator TradingView</h2></div><input id="indicator-search" class="search-input" placeholder="Cari indikator..."><div class="pill-row">${pillsHTML}</div><div id="indicator-list" class="indicator-list slide-up"></div><section class="code-panel"><span class="badge">Terpilih</span><h3>${escapeHtml((selectedIndicator||{}).name)}</h3><p>${escapeHtml((selectedIndicator||{}).desc)}</p><pre id="code-display"></pre><div class="actions"><button class="action-btn" data-save-code>Simpan Kode</button><button class="action-btn primary" data-copy-code>Salin Kode</button></div></section>`;
    const codeDisplay = document.getElementById('code-display');
    if (codeDisplay) codeDisplay.textContent = (selectedIndicator||{}).code || 'Mengambil source code...';
    
    renderIndicatorList();

    if (selectedIndicator && !selectedIndicator.code && selectedIndicator.url) {
       try {
         const res = await fetch(selectedIndicator.url);
         const text = await res.text();
         selectedIndicator.code = text;
         const codeDisplay = document.getElementById('code-display');
         if (codeDisplay) codeDisplay.textContent = text;
       } catch (err) {
         const codeDisplay = document.getElementById('code-display');
         if (codeDisplay) codeDisplay.textContent = 'Gagal memuat kode lokal.';
       }
    }
  }

  function openProject(id) {
    const project = [...projects, ...practiceItems].find(item => item.id === id);
    if (!project) return;
    const recent = readJsonArray('amy_recent_projects').filter(item => item !== id);
    localStorage.setItem('amy_recent_projects', JSON.stringify([id, ...recent].slice(0, 8)));
    if (project.target === 'internal') {
      renderIndikator();
    } else {
      showLoadingOverlay();
      setTimeout(() => location.assign(project.target), 100);
    }
  }

  function navigate(target, options = {}) {
    if (target === 'beranda') renderHome();
    if (target === 'proyek' || target === 'backtest') renderProjectList('Backtest');
    if (target === 'video' || target === 'media' || target === 'koleksi') renderMedia(options);
    if (target === 'profil') renderProfile();
    if (target === 'pengaturan' || target === 'settings') renderSettings();
    if (target === 'back-from-settings') {
      const dest = ['beranda', 'proyek', 'video', 'profil'].includes(lastMainTab) ? lastMainTab : 'beranda';
      navigate(dest);
    }
  }


  async function copyTextSafe(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  document.addEventListener('click', async event => {
    const openBtn = event.target.closest('[data-open]');
    const navBtn = event.target.closest('[data-nav]');
    const indicatorBtn = event.target.closest('[data-select-indicator]');
    const filterBtn = event.target.closest('[data-filter]');
    const copyBtn = event.target.closest('[data-copy-code]');
    const saveBtn = event.target.closest('[data-save-code]');
    const koleksiBtn = event.target.closest('[data-koleksi]');
    const copyKoleksiBtn = event.target.closest('[data-copy-koleksi]');
    const profileBtn = event.target.closest('[data-profile-action]');
    const mediaFilterBtn = event.target.closest('[data-media-filter]');
    const viewMediaBtn = event.target.closest('[data-view-media]');
    const deleteMediaBtn = event.target.closest('[data-delete-media]');
    const uploadMediaBtn = event.target.closest('#rootUploadMediaBtn, #rootEmptyUploadMediaBtn');
    if (openBtn) openProject(openBtn.dataset.open);
    if (navBtn) {
      const target = navBtn.dataset.nav;
      if (target === 'pengaturan' && currentRootView === 'pengaturan') {
        navigate('back-from-settings');
        return;
      }
      if (target === 'video' || target === 'media') {
        setActive('video');
        const all = await loadAllMediaItems();
        const vids = all.filter(isVideoMediaItem);
        await renderMedia({ autoPlay: false });
        if (vids.length > 0) {
          openVideoReel(vids[0]);
        }
        return;
      }
      navigate(target);
    }
    if (indicatorBtn) { selectedIndicator = indicators[Number(indicatorBtn.dataset.selectIndicator)]; renderIndikator(); }
    if (filterBtn) { document.querySelectorAll('.pill').forEach(item => item.classList.remove('active')); filterBtn.classList.add('active'); renderIndicatorList(filterBtn.dataset.filter, document.getElementById('indicator-search')?.value || ''); }
    if (copyBtn) {
      const ok = await copyTextSafe(selectedIndicator.code || '');
      copyBtn.textContent = ok ? 'Tersalin' : 'Gagal Salin';
      if (!ok) showToast('Gagal menyalin kode. Pilih teks lalu salin manual.');
    }
    if (saveBtn) { localStorage.setItem('amy_saved_code', selectedIndicator.code || ''); saveBtn.textContent = 'Tersimpan'; }
    if (koleksiBtn) handleKoleksi(koleksiBtn.dataset.koleksi);
    if (mediaFilterBtn) {
      currentMediaFilter = mediaFilterBtn.dataset.mediaFilter;
      renderMedia({ autoPlay: false });
    }
    if (viewMediaBtn) {
      const itemId = viewMediaBtn.dataset.viewMedia;
      const all = await loadAllMediaItems();
      const targetItem = all.find(it => it.id === itemId);
      if (targetItem) {
        // Video dibuka sebagai feed swipe vertikal ala Jurnal Trading; gambar/dokumen tetap viewer biasa
        if (isVideoMediaItem(targetItem)) openVideoReel(targetItem);
        else showMediaFullscreen(targetItem);
      }
    }
    const toggleWatchedBtn = event.target.closest('[data-toggle-watched]');
    if (toggleWatchedBtn) {
      event.stopPropagation();
      const id = toggleWatchedBtn.dataset.toggleWatched;
      const wasWatched = getWatchedMediaSet().has(String(id));
      markMediaWatched(id, !wasWatched);
      renderMedia({ autoPlay: false });
      return;
    }
    if (deleteMediaBtn) {
      event.stopPropagation();
      if (deleteMediaBtn.dataset.confirmArm === '1') {
        await handleRootMediaDelete(deleteMediaBtn.dataset.deleteMedia);
      } else {
        deleteMediaBtn.dataset.confirmArm = '1';
        deleteMediaBtn.classList.add('is-armed');
        const lbl = deleteMediaBtn.querySelector('span');
        if (lbl) lbl.textContent = 'Yakin?';
        setTimeout(() => {
          if (deleteMediaBtn.dataset.confirmArm === '1') {
            deleteMediaBtn.dataset.confirmArm = '0';
            deleteMediaBtn.classList.remove('is-armed');
            if (lbl) lbl.textContent = 'Hapus';
          }
        }, 3500);
      }
    }
    if (uploadMediaBtn) {
      document.getElementById('rootMediaFileInput')?.click();
    }
    if (profileBtn && profileBtn.dataset.profileAction === 'clear') {
      const labelEl = profileBtn.querySelector('[data-clear-label]');
      if (profileBtn.dataset.confirmArm !== '1') {
        profileBtn.dataset.confirmArm = '1';
        profileBtn.classList.add('is-armed');
        if (labelEl) labelEl.textContent = 'Ketuk Lagi: Hapus Semua Data Lokal?';
        clearTimeout(profileBtn._clearArmTimer);
        profileBtn._clearArmTimer = setTimeout(() => {
          profileBtn.dataset.confirmArm = '0';
          profileBtn.classList.remove('is-armed');
          if (labelEl) labelEl.textContent = 'Hapus Data Lokal';
        }, 4000);
        return;
      }
      clearTimeout(profileBtn._clearArmTimer);
      await clearPersonalLocalData();
      showToast('Data lokal sudah dibersihkan. API key tetap tersimpan.');
      renderSettings();
    }
    if (copyKoleksiBtn) {
      const ok = await copyTextSafe(localStorage.getItem('amy_saved_code') || '');
      copyKoleksiBtn.textContent = ok ? 'Tersalin' : 'Gagal Salin';
      if (!ok) showToast('Gagal menyalin kode tersimpan.');
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'indicator-search') {
      const activeFilter = document.querySelector('.pill.active')?.dataset.filter || 'Semua';
      renderIndicatorList(activeFilter, event.target.value);
    }
  });

  navBtns.forEach(btn => btn.addEventListener('click', async () => {
    const target = btn.dataset.target;
    // Saat klik menu Video di menu utama: langsung putar video pertama ala TikTok!
    if (target === 'video' || target === 'media') {
      setActive('video');
      const allItems = await loadAllMediaItems();
      const vids = allItems.filter(isVideoMediaItem);
      await renderMedia({ autoPlay: false });
      if (vids.length > 0) {
        openVideoReel(vids[0]);
      }
      return;
    }
    navigate(target);
  }));
  function resolveTabFromHash() {
    const h = String(window.location.hash || '').replace(/^#/, '').toLowerCase();
    if (h === 'backtest' || h === 'proyek') return 'proyek';
    if (h === 'beranda' || h === 'home') return 'beranda';
    if (h === 'video' || h === 'media' || h === 'koleksi') return 'video';
    if (h === 'profil' || h === 'profile') return 'profil';
    if (h === 'pengaturan' || h === 'settings') return 'pengaturan';
    return '';
  }

  let initialTab = resolveTabFromHash();
  if (!initialTab) {
    initialTab = 'beranda';
    try { initialTab = localStorage.getItem('amy_root_tab') || initialTab; } catch (_) {}
  }
  if (initialTab === 'koleksi' || initialTab === 'media') initialTab = 'video';
  navigate(['beranda', 'proyek', 'video', 'media', 'profil', 'pengaturan'].includes(initialTab) ? initialTab : 'beranda');

  window.addEventListener('hashchange', () => {
    const nextTab = resolveTabFromHash();
    if (nextTab) navigate(nextTab);
  });

  // Non-blocking startup Cloud Sync check when Auto-Sync is enabled
  setTimeout(async () => {
    try {
      const cfg = window.AmyGitHubSync?.loadConfig?.();
      if (!cfg?.autoSync || !cfg?.connected || !cfg?.token) return;
      const check = await window.AmyGitHubSync.checkRemoteUpdate();
      if (check?.ok && check?.hasUpdate) {
        showToast('Pembaruan data tersedia di Cloud (Pengaturan → Cloud Sync).');
      }
    } catch (_) {}
  }, 2500);
});


// GLOBAL AMY FX JS SYSTEM
window.showToast = function(msg) {
  const plainMsg = String(msg ?? '').replace(/<[^>]*>?/gm, '').trim();
  if (!plainMsg) return;
  if (window.Android && window.Android.showAppToast) {
    window.Android.showAppToast(plainMsg);
    return;
  }
  if (typeof document === 'undefined' || !document.body) return;
  let toast = document.getElementById('amyfx-web-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'amyfx-web-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    Object.assign(toast.style, {
      position: 'fixed',
      left: '50%',
      bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))',
      transform: 'translate(-50%, 10px)',
      maxWidth: 'min(92vw, 380px)',
      padding: '10px 16px',
      borderRadius: '14px',
      background: 'var(--amy-surface-strong, #142132)',
      color: 'var(--amy-text, #f5f8fc)',
      border: '1px solid var(--amy-border-strong, rgba(168, 198, 232, 0.28))',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.32)',
      fontSize: '13px',
      fontWeight: '600',
      lineHeight: '1.4',
      textAlign: 'center',
      zIndex: '2147483000',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 180ms ease, transform 180ms ease'
    });
    document.body.appendChild(toast);
  }
  toast.textContent = plainMsg;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
  });
  clearTimeout(window.__amyWebToastTimer);
  window.__amyWebToastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 10px)';
  }, 2800);
};

window.triggerHaptic = function(pattern) {
  // Use native Android Haptic Vibration
  if (window.Android && window.Android.triggerHaptic) {
    window.Android.triggerHaptic(pattern || 20);
  } else if ('vibrate' in navigator) {
    navigator.vibrate(pattern || 20);
  }
};

if (!window.amyHapticListenerAdded) {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, a, .clickable, .nav-btn, .action-btn, .card');
      if (btn) window.triggerHaptic(20);
    });
    window.amyHapticListenerAdded = true;
}


/* AMYFX_NOTIFY_GUARD_START */
(function(){
  if(window.__amyfxNotifyGuardLoaded)return;
  window.__amyfxNotifyGuardLoaded=true;

  const STORE='amyfx.notify.last.sent';
  const COOLDOWN=5*60*1000;
  const RESUME_MUTE=9000;
  const MAX_ITEMS=80;
  let muteUntil=0;

  function now(){return Date.now()}
  function norm(x){
    return String(x||'')
      .replace(/\d+([.,]\d+)?/g,'#')
      .replace(/\s+/g,' ')
      .trim()
      .slice(0,180);
  }
  function kind(t,b){
    const x=(String(t||'')+' '+String(b||'')).toLowerCase();
    if(x.includes('scanner terhubung'))return 'scanner_connected';
    if(x.includes('amy fx aktif'))return 'scanner_alive';
    if(x.includes('liquidity sweep'))return 'liquidity_sweep';
    if(x.includes('ssl')||x.includes('bsl'))return 'bsl_ssl_touched';
    return 'amyfx_alert';
  }
  function key(t,b){
    return kind(t,b)+'|'+norm(t)+'|'+norm(b);
  }
  function read(){
    try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return{}}
  }
  function write(o){
    const arr=Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,MAX_ITEMS);
    localStorage.setItem(STORE,JSON.stringify(Object.fromEntries(arr)));
  }
  function route(t,b){
    const k=kind(t,b);
    if(k==='liquidity_sweep')return 'Analyze';
    if(k==='bsl_ssl_touched')return 'Analyze';
    if(k==='scanner_connected'||k==='scanner_alive')return 'Dashboard';
    return 'Analyze';
  }
  function openRoute(t,b){
    const r=route(t,b);
    try{localStorage.setItem('amyfx.notification.route',r)}catch(e){}
    try{if(typeof setTab==='function')setTab(r)}catch(e){}
    try{window.focus()}catch(e){}
  }
  function allow(t,b){
    const n=now();
    const k=key(t,b);

    if(n<muteUntil && kind(t,b)!=='scanner_alive')return false;

    const last=read();
    const prev=last[k]||0;
    if(n-prev<COOLDOWN)return false;

    last[k]=n;
    write(last);
    return true;
  }

  document.addEventListener('visibilitychange',function(){
    if(!document.hidden){
      muteUntil=now()+RESUME_MUTE;
    }
  });

  window.addEventListener('pageshow',function(){
    muteUntil=now()+RESUME_MUTE;
  });

  try{
    if('Notification' in window && !window.Notification.__amyfxWrapped){
      const OriginalNotification=window.Notification;
      const WrappedNotification=function(title,opts){
        opts=opts||{};
        const body=opts.body||'';
        if(!allow(title,body))return null;
        const n=new OriginalNotification(title,opts);
        n.onclick=function(){openRoute(title,body)};
        return n;
      };
      Object.getOwnPropertyNames(OriginalNotification).forEach(function(k){
        try{WrappedNotification[k]=OriginalNotification[k]}catch(e){}
      });
      WrappedNotification.prototype=OriginalNotification.prototype;
      WrappedNotification.__amyfxWrapped=true;
      window.Notification=WrappedNotification;
    }
  }catch(e){}

  function wrapBridge(obj){
    if(!obj||obj.__amyfxNotifyBridgeWrapped)return;
    Object.keys(obj).forEach(function(k){
      if(!/notify|notification|alert|push/i.test(k))return;
      if(typeof obj[k]!=='function')return;
      const old=obj[k];
      obj[k]=function(){
        const args=[].slice.call(arguments);
        const title=args[0]||'Amy FX';
        const body=args[1]||args[0]||'';
        if(!allow(title,body))return null;
        try{return old.apply(this,args)}catch(e){return null}
      };
    });
    obj.__amyfxNotifyBridgeWrapped=true;
  }

  function wrapAll(){
    ['Android','AndroidBridge','AmyFX','AmyFx','Native','NotificationBridge','AppBridge'].forEach(function(n){
      try{wrapBridge(window[n])}catch(e){}
    });
  }

  wrapAll();
  setInterval(wrapAll,1500);

  window.__amyfxNotifyAllow=allow;
  window.__amyfxNotifyOpenRoute=openRoute;
})();
/* AMYFX_NOTIFY_GUARD_END */
