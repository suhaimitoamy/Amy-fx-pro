/* Amy FX Backtest Lab — unified Cloud 2019-2026 & local ZIP/CSV/JSON Data Manager modal controller. */
(function (root) {
  'use strict';

  if (root.AmyCloudLibraryUI) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function formatBytes(value) {
    var n = Number(value || 0);
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function dateYm(ts) {
    var v = Number(ts || 0);
    if (!v) return '—';
    return new Date(v * 1000).toISOString().slice(0, 7);
  }

  function optionLabel(item) {
    if (item && item.sampleOnly) return item.label || 'Sample · Jan 2025';
    return dateYm(item.start) + ' · ' + Number(item.rowCount || 0).toLocaleString('id-ID') + ' bar M1' + (item.repairedAudited ? ' · audited' : '');
  }

  function mount(options) {
    options = options || {};
    var dialog = document.getElementById(options.dialogId || 'dataManagerDialog');
    if (!dialog) return null;

    var provider = root.AmyPracticeData;
    var ui = root.AmyPracticeUI;
    var onDatasetChanged = typeof options.onDatasetChanged === 'function' ? options.onDatasetChanged : function () {};

    var yearSelect = document.getElementById('cloudYearSelect');
    var monthSelect = document.getElementById('cloudMonthSelect');
    var installBtn = document.getElementById('cloudInstallBtn');
    var cloudStatus = document.getElementById('cloudInstallStatus');
    var fileInput = document.getElementById('datasetFile');
    var importTf = document.getElementById('importTimeframe');
    var importBtn = document.getElementById('importButton');
    var importStatus = document.getElementById('importStatus');
    var packSummary = document.getElementById('packSummary');
    var packLibrary = document.getElementById('packLibrary');
    var closeBtn = document.getElementById('closeDataManager');
    var manifest = null;
    var pendingDeletePackId = null;

    function setStatus(node, msg, isError, isSuccess) {
      if (!node) return;
      node.textContent = msg;
      node.classList.toggle('error', Boolean(isError));
      node.classList.toggle('success', !isError && Boolean(isSuccess));
    }

    function updateMonths() {
      if (!yearSelect || !monthSelect) return;
      var y = yearSelect.value;
      monthSelect.innerHTML = '';
      if (manifest && Array.isArray(manifest[y]) && manifest[y].length) {
        manifest[y].forEach(function (m) {
          var opt = document.createElement('option');
          opt.value = m.file;
          opt.textContent = m.label + ' (' + m.sizeKb + ' KB)';
          monthSelect.appendChild(opt);
        });
        var allOpt = document.createElement('option');
        allOpt.value = 'ALL';
        allOpt.textContent = 'Semua Bulan ' + y + ' (' + manifest[y].length + ' pack bertahap)';
        monthSelect.appendChild(allOpt);
      } else {
        var opt0 = document.createElement('option');
        opt0.value = 'ALL';
        opt0.textContent = 'Memuat daftar bulan…';
        monthSelect.appendChild(opt0);
      }
    }

    async function loadManifest() {
      try {
        manifest = await provider.loadCloudManifest();
        if (manifest) {
          var years = Object.keys(manifest).sort(function (a, b) { return Number(b) - Number(a); });
          if (yearSelect && years.length) {
            var prev = yearSelect.value;
            yearSelect.innerHTML = years.map(function (y) {
              var count = Array.isArray(manifest[y]) ? manifest[y].length : 0;
              return '<option value="' + escapeHtml(y) + '">' + escapeHtml(y) + ' (' + count + ' bulan)</option>';
            }).join('');
            if (years.includes(prev)) yearSelect.value = prev;
          }
          updateMonths();
          setStatus(cloudStatus, 'Cloud siap (2019–2026 XAU/USD M1 audited). Pilih bulan lalu pasang.', false, false);
        } else {
          setStatus(cloudStatus, 'Daftar cloud belum dapat dijangkau. Cek koneksi atau gunakan impor lokal.', true);
        }
      } catch (err) {
        setStatus(cloudStatus, 'Cloud offline: ' + (err && err.message || 'gagal memuat manifest'), true);
      }
    }

    async function renderPacks() {
      if (!packLibrary) return [];
      var sources = await provider.listSources('XAUUSD');
      var packs = sources.filter(function (s) { return s.kind === 'pack'; });
      var totalBytes = packs.reduce(function (acc, p) { return acc + Number(p.size || 0); }, 0);
      if (packSummary) {
        packSummary.textContent = packs.length + ' pack lokal terpasang · ' + formatBytes(totalBytes);
      }
      if (!packs.length) {
        packLibrary.innerHTML = '<div class="bt-empty-inline">Belum ada pack tersimpan <button type="button" class="amy-info-btn" data-info-tip="Unduh pack dari katalog Cloud di atas atau impor file ZIP/CSV lokal." aria-label="Info pack lokal" aria-expanded="false">i</button></div>';
        return sources;
      }
      var activeId = provider.selectedSourceId();
      packLibrary.innerHTML = packs.map(function (item) {
        var isSelected = item.id === activeId;
        var isConfirm = pendingDeletePackId === item.id;
        return '<div class="bt-pack-row' + (isSelected ? ' is-active' : '') + '">' +
          '<div class="bt-pack-meta">' +
            '<strong>' + escapeHtml(optionLabel(item)) + '</strong>' +
            '<span>' + escapeHtml(item.fileName || item.source || '') + ' · ' + formatBytes(item.size) + '</span>' +
          '</div>' +
          '<div class="bt-pack-actions">' +
            '<button type="button" class="bt-btn-sm" data-use-pack="' + escapeHtml(item.id) + '">' + (isSelected ? 'Aktif' : 'Pakai') + '</button>' +
            '<button type="button" class="bt-btn-sm bt-btn-danger' + (isConfirm ? ' is-confirm' : '') + '" data-delete-pack="' + escapeHtml(item.id) + '">' + (isConfirm ? 'Yakin?' : 'Hapus') + '</button>' +
          '</div>' +
        '</div>';
      }).join('');
      return sources;
    }

    if (yearSelect) yearSelect.addEventListener('change', updateMonths);

    if (installBtn) {
      installBtn.addEventListener('click', async function () {
        var y = yearSelect ? yearSelect.value : '2025';
        var m = monthSelect ? monthSelect.value : 'ALL';
        installBtn.disabled = true;
        var origText = installBtn.textContent;
        installBtn.textContent = 'Mengunduh…';
        setStatus(cloudStatus, 'Menghubungkan ke Cloud…');
        try {
          var results = await provider.installCloudPack(y, m, function (prog) {
            if (prog && prog.message) setStatus(cloudStatus, prog.message);
          });
          setStatus(cloudStatus, (results.length || 1) + ' pack berhasil dipasang ke perangkat.', false, true);
          await renderPacks();
          var targetId = results[0] ? results[0].id : null;
          await onDatasetChanged(targetId);
        } catch (err) {
          setStatus(cloudStatus, 'Gagal: ' + (err && err.message || 'unduhan gagal'), true);
        } finally {
          installBtn.disabled = false;
          installBtn.textContent = origText;
        }
      });
    }

    if (importBtn && fileInput) {
      importBtn.addEventListener('click', async function () {
        importBtn.disabled = true;
        setStatus(importStatus, 'Memindai arsip lokal…');
        try {
          var records = await provider.importFiles(fileInput.files, {
            symbol: 'XAUUSD',
            timeframe: importTf ? importTf.value : 'M1'
          }, function (prog) {
            if (prog && prog.message) setStatus(importStatus, prog.message);
          });
          fileInput.value = '';
          setStatus(importStatus, records.length + ' pack lokal berhasil disimpan.', false, true);
          await renderPacks();
          var targetId = records[records.length - 1] ? records[records.length - 1].id : null;
          await onDatasetChanged(targetId);
        } catch (err) {
          setStatus(importStatus, err && err.message || 'Impor gagal.', true);
        } finally {
          importBtn.disabled = false;
        }
      });
    }

    if (packLibrary) {
      packLibrary.addEventListener('click', async function (event) {
        var useBtn = event.target.closest('[data-use-pack]');
        if (useBtn) {
          pendingDeletePackId = null;
          var useId = useBtn.dataset.usePack;
          await onDatasetChanged(useId);
          await renderPacks();
          if (dialog.open) dialog.close();
          return;
        }
        var delBtn = event.target.closest('[data-delete-pack]');
        if (delBtn) {
          var delId = delBtn.dataset.deletePack;
          if (pendingDeletePackId !== delId) {
            pendingDeletePackId = delId;
            await renderPacks();
            return;
          }
          pendingDeletePackId = null;
          try {
            await provider.deleteSource(delId);
            setStatus(importStatus, 'Pack dihapus dari perangkat.', false, true);
            await renderPacks();
            await onDatasetChanged(null);
          } catch (err) {
            setStatus(importStatus, err && err.message || 'Gagal menghapus pack.', true);
          }
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        pendingDeletePackId = null;
        if (dialog.open) dialog.close();
      });
    }

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog && dialog.open) {
        pendingDeletePackId = null;
        dialog.close();
      }
    });

    function open() {
      pendingDeletePackId = null;
      renderPacks();
      if (!manifest) loadManifest();
      if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
      else dialog.setAttribute('open', '');
    }

    loadManifest();
    renderPacks();

    return { open: open, refresh: renderPacks, optionLabel: optionLabel };
  }

  root.AmyCloudLibraryUI = Object.freeze({
    mount: mount,
    optionLabel: optionLabel,
    formatBytes: formatBytes
  });
})(typeof window !== 'undefined' ? window : globalThis);
