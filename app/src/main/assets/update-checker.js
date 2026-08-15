(function () {
  const VERSION = window.AmyFXAppVersion || { name: '2.0.0-pro.316', code: 950316 };
  const CURRENT_VERSION_CODE = Number(VERSION.code) || 950316;
  const CURRENT_VERSION_NAME = String(VERSION.name || '2.0.0-pro.316');
  const UPDATE_URL = window.AmyFXUpdateManifestUrl
    || 'https://raw.githubusercontent.com/suhaimitoamy/Amy-fx-pro/main/update.json';
  const CHECK_INTERVAL_MS = 15 * 60 * 1000;
  const RESUME_DELAY_MS = 900;

  let lastCheckAt = 0;
  let hiddenAt = 0;
  let popupOpen = false;
  let checkingPromise = null;
  let nativeUi = null;

  try {
    localStorage.removeItem('amy_fx_update_dismissed_version');
    localStorage.removeItem('amy_fx_update_last_check');
  } catch (_) {}

  function css(el, styles) {
    Object.keys(styles).forEach(key => el.style[key] = styles[key]);
    return el;
  }

  function createButton(text, primary) {
    const btn = document.createElement('button');
    btn.textContent = text;
    css(btn, {
      flex: '1',
      border: primary ? '1px solid var(--amy-accent, #69B7FF)' : '1px solid var(--amy-border, rgba(255,255,255,.18))',
      borderRadius: '14px',
      padding: '13px 10px',
      fontWeight: '900',
      background: primary ? 'var(--amy-accent, #69B7FF)' : 'var(--amy-surface-soft, rgba(255,255,255,.06))',
      color: primary ? '#07111d' : 'var(--amy-text, #fff)'
    });
    return btn;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function displayVersionName(value) {
    const text = String(value || '');
    const compact = text.match(/^(\d+\.\d+\.\d+)(?:-(?:preview|pro)\.\d+)?$/i);
    return compact ? compact[1] : text;
  }

  function notify(message) {
    const text = String(message || '');
    try {
      if (window.Android?.showToast) {
        window.Android.showToast(text);
        return;
      }
    } catch (_) {}
    try { console.log(text); } catch (_) {}
  }

  function hasNativeUpdater() {
    return Boolean(window.Android?.startAppUpdate);
  }

  function announceNativeUpdate(latestCode, latestName) {
    try {
      if (window.Android?.notifyAppUpdateAvailable) {
        window.Android.notifyAppUpdateAvailable(Number(latestCode), String(latestName));
      }
    } catch (_) {}
  }

  function bytesToMb(value) {
    const bytes = Number(value || 0);
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 1 : 2)} MB`;
  }

  function setNativeState(kind, text) {
    if (!nativeUi) return;
    if (text) nativeUi.status.textContent = text;
    nativeUi.status.dataset.state = kind || '';
  }

  window.AmyFXUpdateNative = Object.freeze({
    onProgress(downloaded, total, percent) {
      if (!nativeUi) return;
      const numericPercent = Math.max(0, Math.min(100, Number(percent) || 0));
      nativeUi.progressWrap.style.display = '';
      nativeUi.bar.style.width = `${numericPercent}%`;
      nativeUi.percent.textContent = `${Math.round(numericPercent)}%`;
      nativeUi.bytes.textContent = total > 0
        ? `${bytesToMb(downloaded)} / ${bytesToMb(total)}`
        : bytesToMb(downloaded);
      setNativeState('downloading', 'Mengunduh pembaruan...');
    },
    onReady() {
      if (!nativeUi) return;
      nativeUi.bar.style.width = '100%';
      nativeUi.percent.textContent = '100%';
      nativeUi.updateBtn.disabled = true;
      setNativeState('ready', 'Unduhan selesai. Menyiapkan instalasi Android...');
    },
    onInstalling() {
      if (!nativeUi) return;
      nativeUi.updateBtn.disabled = true;
      setNativeState('installing', 'Android meminta konfirmasi instalasi pembaruan...');
    },
    onError(message) {
      if (!nativeUi) return;
      nativeUi.downloading = false;
      nativeUi.updateBtn.disabled = false;
      nativeUi.updateBtn.textContent = 'Coba Lagi';
      nativeUi.cancelBtn.disabled = false;
      nativeUi.status.style.color = '#ff9f9f';
      setNativeState('error', String(message || 'Pembaruan gagal diunduh.'));
    },
    onCancelled() {
      if (!nativeUi) return;
      nativeUi.downloading = false;
      nativeUi.updateBtn.disabled = false;
      nativeUi.updateBtn.textContent = 'Unduh & Perbarui';
      setNativeState('cancelled', 'Unduhan dibatalkan.');
    }
  });

  function showUpdatePopup(data, latestCode, latestName) {
    if (popupOpen || !document.body) return;
    popupOpen = true;

    const forceUpdate = Boolean(data.force_update ?? data.mandatory);
    const overlay = document.createElement('div');
    overlay.id = 'amyFxUpdateOverlay';
    css(overlay, {
      position: 'fixed', inset: '0', zIndex: '2147483647',
      background: 'rgba(0,0,0,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', boxSizing: 'border-box'
    });

    const box = document.createElement('div');
    css(box, {
      width: '100%', maxWidth: '420px', borderRadius: '20px',
      background: 'var(--amy-surface, #111)', color: 'var(--amy-text, #fff)',
      border: '1px solid var(--amy-border, rgba(255,255,255,.16))',
      boxShadow: '0 24px 80px rgba(0,0,0,.52)', padding: '20px'
    });

    const title = document.createElement('div');
    title.textContent = `Amy FX ${displayVersionName(latestName)} tersedia`;
    css(title, { fontSize: '19px', fontWeight: '900', marginBottom: '8px' });
    box.appendChild(title);

    const meta = document.createElement('div');
    meta.textContent = `Versi terpasang: ${displayVersionName(CURRENT_VERSION_NAME)} · Build ${CURRENT_VERSION_CODE} → ${latestCode}`;
    css(meta, { color: '#aaa', fontSize: '12px', marginBottom: '12px' });
    box.appendChild(meta);

    const notes = document.createElement('div');
    const releaseNotes = Array.isArray(data.release_notes) ? data.release_notes : [];
    notes.innerHTML = releaseNotes.length
      ? `<ul style="margin:0;padding-left:20px">${releaseNotes.slice(0, 5).map(item => `<li style="margin:5px 0">${escapeHtml(item)}</li>`).join('')}</ul>`
      : 'Pembaruan Amy FX tersedia.';
    css(notes, { color: '#ddd', fontSize: '13px', lineHeight: '1.5', marginBottom: '14px' });
    box.appendChild(notes);

    const progressWrap = document.createElement('div');
    progressWrap.style.display = 'none';
    css(progressWrap, {
      border: '1px solid var(--amy-border, rgba(255,255,255,.12))',
      borderRadius: '14px',
      background: 'rgba(255,255,255,.035)',
      padding: '12px',
      marginBottom: '12px'
    });
    const status = document.createElement('div');
    status.textContent = 'Menunggu unduhan...';
    css(status, { color: '#ddd', fontWeight: '800', marginBottom: '9px', lineHeight: '1.4' });
    const track = document.createElement('div');
    css(track, { height: '10px', background: '#2a2a2a', borderRadius: '999px', overflow: 'hidden' });
    const bar = document.createElement('div');
    css(bar, { width: '0%', height: '100%', background: 'var(--amy-accent, #69B7FF)', borderRadius: '999px', transition: 'width .18s ease' });
    track.appendChild(bar);
    const details = document.createElement('div');
    css(details, { display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '8px', color: '#aaa', fontSize: '12px' });
    const bytes = document.createElement('span');
    bytes.textContent = '0 MB';
    const percent = document.createElement('strong');
    percent.textContent = '0%';
    percent.style.color = 'var(--amy-accent, #69B7FF)';
    details.appendChild(bytes);
    details.appendChild(percent);
    progressWrap.appendChild(status);
    progressWrap.appendChild(track);
    progressWrap.appendChild(details);
    box.appendChild(progressWrap);

    const note = document.createElement('div');
    note.textContent = hasNativeUpdater()
      ? 'APK diunduh ke cache Amy FX, diverifikasi, lalu Android meminta konfirmasi instalasi. File tidak menumpuk di folder Download.'
      : 'Versi Amy FX ini masih memakai unduhan browser. Setelah pembaruan terpasang, update berikutnya akan berlangsung di dalam aplikasi.';
    css(note, { color: '#aaa', fontSize: '12px', lineHeight: '1.45', marginBottom: '16px' });
    box.appendChild(note);

    const row = document.createElement('div');
    css(row, { display: 'flex', gap: '10px' });

    const updateBtn = createButton('Unduh & Perbarui', true);
    const cancelBtn = createButton(forceUpdate ? 'Nanti' : 'Batal', false);

    function closePopup() {
      popupOpen = false;
      if (nativeUi?.overlay === overlay) nativeUi = null;
      overlay.remove();
    }

    function startDownload() {
      const downloadUrl = data.apk_url || data.downloadUrl || 'https://github.com/suhaimitoamy/Amy-fx-pro/releases/latest';
      status.style.color = '#ddd';
      if (hasNativeUpdater()) {
        nativeUi = {
          overlay,
          progressWrap,
          status,
          bar,
          bytes,
          percent,
          updateBtn,
          cancelBtn,
          downloading: true
        };
        setNativeState('starting', `Menyiapkan unduhan Amy FX ${displayVersionName(latestName)}...`);
        try {
          window.Android.startAppUpdate(String(downloadUrl), String(latestName), Number(latestCode));
        } catch (error) {
          window.AmyFXUpdateNative.onError(error?.message || 'Updater native tidak dapat dijalankan.');
        }
        return;
      }

      updateBtn.disabled = true;
      updateBtn.textContent = 'Membuka unduhan...';
      window.location.href = downloadUrl;
      setTimeout(() => {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Unduh & Perbarui';
      }, 4000);
    }

    updateBtn.onclick = startDownload;
    cancelBtn.onclick = function () {
      if (nativeUi?.overlay === overlay && nativeUi.downloading && window.Android?.cancelAppUpdate) {
        try { window.Android.cancelAppUpdate(); } catch (_) {}
      }
      closePopup();
    };
    row.appendChild(updateBtn);
    row.appendChild(cancelBtn);
    box.appendChild(row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  async function checkUpdate(options = {}) {
    const force = Boolean(options.force);
    const announce = Boolean(options.announce);
    const now = Date.now();

    if (checkingPromise) return checkingPromise;
    if (!force && now - lastCheckAt < 10000) return { status: 'throttled' };
    lastCheckAt = now;

    checkingPromise = (async () => {
      try {
        const res = await fetch(`${UPDATE_URL}?_=${now}`, {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const latestCode = Number(data.latest_version_code ?? data.versionCode ?? 0);
        const latestName = data.latest_version_name ?? data.version ?? latestCode;

        if (latestCode > CURRENT_VERSION_CODE) {
          announceNativeUpdate(latestCode, latestName);
          showUpdatePopup(data, latestCode, latestName);
          return { status: 'update_available', latestCode, latestName };
        }

        if (announce) notify(`Amy FX v${displayVersionName(CURRENT_VERSION_NAME)} (${CURRENT_VERSION_CODE}) sudah versi terbaru.`);
        return { status: 'up_to_date', latestCode, latestName };
      } catch (error) {
        if (announce) notify('Gagal memeriksa pembaruan. Coba lagi saat koneksi stabil.');
        console.log('Update check skipped:', error?.message || error);
        return { status: 'error', error };
      } finally {
        checkingPromise = null;
      }
    })();

    return checkingPromise;
  }

  function scheduleCheck() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => checkUpdate(), { timeout: 5000 });
    } else {
      setTimeout(() => checkUpdate(), 4000);
    }
  }

  window.AmyFXUpdate = {
    currentVersion: Object.freeze({ name: CURRENT_VERSION_NAME, code: CURRENT_VERSION_CODE }),
    nativeDownloadSupported: hasNativeUpdater,
    checkNow: options => checkUpdate({ force: true, announce: true, ...(options || {}) })
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = Date.now();
      return;
    }
    const wasAway = hiddenAt && Date.now() - hiddenAt > 1200;
    hiddenAt = 0;
    if (wasAway) setTimeout(() => checkUpdate({ force: true }), RESUME_DELAY_MS);
  });

  window.addEventListener('pageshow', event => {
    if (event.persisted) setTimeout(() => checkUpdate({ force: true }), RESUME_DELAY_MS);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleCheck, { once: true });
  } else {
    scheduleCheck();
  }
})();
