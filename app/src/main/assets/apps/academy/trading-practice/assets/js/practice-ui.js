/* Amy FX Backtest Lab — shared UI, mobile navigation drawer, theme toggle, & core drawing controls. */
(function (root) {
  'use strict';
  if (root.AmyPracticeUI) return;
  var core = root.AmyPracticeCore;

  function byId(id) { return document.getElementById(id); }
  function text(id, value) { var node = byId(id); if (node) node.textContent = value == null ? '' : String(value); }

  function status(id, message, error, success) {
    var node = byId(id);
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', Boolean(error));
    node.classList.toggle('success', !error && Boolean(success));
  }

  function decisionState(state, label, detail) {
    var node = byId('decisionLockState');
    if (!node) return;
    node.dataset.state = state || 'idle';
    var title = node.querySelector('span');
    var body = node.querySelector('strong');
    if (title) title.textContent = label || '';
    if (body) body.textContent = detail || '';
  }

  function tradeReady(ready) {
    var button = byId('tradeSubmit');
    if (!button) return;
    button.disabled = !ready;
    button.setAttribute('aria-disabled', ready ? 'false' : 'true');
  }

  function renderOhlc(prefix, candle, time) {
    text(prefix + 'Time', time == null ? '—' : core.formatWita(time, true));
    ['Open', 'High', 'Low', 'Close'].forEach(function (key) {
      text(prefix + key, candle ? core.price(candle[key.toLowerCase()]) : '—');
    });
  }

  function currentCandle(candles) { return candles && candles.length ? candles[candles.length - 1] : null; }

  function readTradeForm(form) {
    var data = new FormData(form);
    return {
      bias: data.get('bias'),
      orderType: data.get('orderType'),
      entry: data.get('entry'),
      stopLoss: data.get('stopLoss'),
      takeProfit: data.get('takeProfit'),
      lot: data.get('lot'),
      setupType: data.get('setupType'),
      notes: data.get('notes')
    };
  }

  async function saveTrade(form, context) {
    var input = Object.assign(readTradeForm(form), context || {});
    var record = root.AmyPracticeTrades.create(input);
    await root.AmyPracticeStorage.saveTrade(record);
    return record;
  }

  function handleBacktestBack(explicitFallback) {
    var fallback = explicitFallback || '../../../index.html#backtest';

    // 1. Exit active Replay or Guided Fullscreen first
    var activeFs = document.querySelector('#replayWorkspace.is-fullscreen, .bt-chart-stage.is-fullscreen');
    if (activeFs) {
      var exitBtn = byId('replayFullscreen') || byId('guidedFullscreenBtn');
      if (exitBtn) {
        exitBtn.click();
        return true;
      }
    }

    // 2. Close any open native <dialog>
    var openDialogs = document.querySelectorAll('dialog[open]');
    if (openDialogs.length) {
      var topDlg = openDialogs[openDialogs.length - 1];
      try {
        if (typeof topDlg.close === 'function') topDlg.close();
        else topDlg.removeAttribute('open');
        return true;
      } catch (_) {}
    }

    // 3. Close open mobile nav drawer
    var nav = byId('navlinks');
    var burger = byId('hamburger');
    if (nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
      return true;
    }

    // 4. Delegate to universal nav if loaded, otherwise 1-step real history.back() -> parent fallback
    if (root.AmyUniversalNav && typeof root.AmyUniversalNav.goBack === 'function') {
      root.AmyUniversalNav.goBack(fallback);
      return true;
    }

    var sameOriginRef = false;
    try {
      if (document.referrer) {
        sameOriginRef = new URL(document.referrer, root.location.origin).origin === root.location.origin;
      }
    } catch (_) {
      sameOriginRef = false;
    }

    if (root.history && root.history.length > 1 && (!document.referrer || sameOriginRef)) {
      var originHref = root.location.href;
      try {
        root.history.back();
        setTimeout(function () {
          if (root.location.href === originHref) {
            root.location.assign(fallback);
          }
        }, 360);
        return true;
      } catch (_) {}
    }

    root.location.assign(fallback);
    return true;
  }

  // Self-contained mobile nav drawer, 1-step back arrow & theme button wiring
  function initShell() {
    var backBtn = byId('btBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', function (evt) {
        evt.preventDefault();
        var fallback = backBtn.getAttribute('data-back-fallback') || '../../../index.html#backtest';
        handleBacktestBack(fallback);
      });
    }

    // Allow universal nav / Android hardware back to exit fullscreen or open dialog before leaving page
    root.__amyfxPageBackHandler = function () {
      var activeFs = document.querySelector('#replayWorkspace.is-fullscreen, .bt-chart-stage.is-fullscreen');
      if (activeFs) {
        var exitBtn = byId('replayFullscreen') || byId('guidedFullscreenBtn');
        if (exitBtn) { exitBtn.click(); return true; }
      }
      var openDialogs = document.querySelectorAll('dialog[open]');
      if (openDialogs.length) {
        var topDlg = openDialogs[openDialogs.length - 1];
        try {
          if (typeof topDlg.close === 'function') topDlg.close();
          else topDlg.removeAttribute('open');
          return true;
        } catch (_) {}
      }
      return false;
    };

    var burger = byId('hamburger');
    var nav = byId('navlinks');
    if (burger && nav) {
      burger.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      if (typeof document.addEventListener === 'function') {
        document.addEventListener('click', function (evt) {
          if (!nav.classList.contains('is-open')) return;
          if (!nav.contains(evt.target) && !burger.contains(evt.target)) {
            nav.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }

    var themeBtn = byId('themeToggleBtn');
    if (themeBtn && root.AmyFXTheme) {
      function syncThemeBtn() {
        var isLight = root.AmyFXTheme.resolved === 'light';
        themeBtn.textContent = isLight ? 'Gelap' : 'Terang';
        themeBtn.setAttribute('aria-label', isLight ? 'Ubah ke mode gelap' : 'Ubah ke mode terang');
      }
      syncThemeBtn();
      themeBtn.addEventListener('click', function () {
        var next = root.AmyFXTheme.resolved === 'light' ? 'dark' : 'light';
        root.AmyFXTheme.set(next);
        syncThemeBtn();
      });
      if (typeof root.addEventListener === 'function') root.addEventListener('amyfx:theme-change', syncThemeBtn);
    }

    // Close open tool/jump/indicator popovers when tapping outside
    if (typeof document.addEventListener === 'function') {
      document.addEventListener('click', function (evt) {
        if (typeof document.querySelectorAll === 'function') {
          document.querySelectorAll('details.drawing-menu[open], details.bt-jump-pop[open], details.tv-pop-menu[open]').forEach(function (det) {
            if (!det.contains(evt.target)) det.removeAttribute('open');
          });
        }
      });
    }
  }

  function bindDrawingToolbar(chart) {
    function sync(state) {
      document.querySelectorAll('[data-drawing-tool]').forEach(function (item) {
        item.classList.toggle('active', item.dataset.drawingTool === state.activeTool);
      });
      var remove = byId('deleteDrawing');
      if (remove) remove.disabled = !state.selectedId;
      text('drawingStatus', state.message || (state.activeTool ? 'Alat gambar aktif.' : 'Gesture chart aktif.'));
    }

    var toolbar = document.querySelector('.drawing-menu');
    function closeTools() {
      if (!toolbar) return;
      toolbar.removeAttribute('open');
      var sum = toolbar.querySelector('summary');
      if (sum && typeof sum.focus === 'function') sum.focus();
    }

    if (toolbar) {
      var grid = toolbar.querySelector('.drawing-menu-grid') || toolbar;
      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'drawing-menu-close';
      close.textContent = '× Tutup';
      close.setAttribute('aria-label', 'Tutup alat gambar');
      close.addEventListener('click', closeTools);
      grid.insertBefore(close, grid.firstChild);

      var styles = document.createElement('div');
      styles.className = 'drawing-style-controls';
      styles.innerHTML = '<label>Warna <input type="color" data-style="color" value="#d4af37"></label><label>Tebal <input type="range" data-style="width" min="1" max="6" value="2"></label><label>Opasitas <input type="range" data-style="opacity" min="0.1" max="1" step="0.1" value="1"></label>';
      grid.appendChild(styles);
      styles.addEventListener('change', function (event) {
        var key = event.target.dataset.style;
        if (!key) return;
        var patch = {};
        patch[key] = key === 'color' ? event.target.value : Number(event.target.value);
        chart.setDrawingStyle(patch);
      });
    }

    chart.onDrawingState = function (state) {
      sync(state);
      var selected = chart.drawings.find(function (item) { return item.id === state.selectedId; });
      var style = selected ? selected.style : chart.drawingStyle;
      if (chart.refreshObjectControls) chart.refreshObjectControls(state);
      if (toolbar && style) {
        toolbar.querySelectorAll('[data-style]').forEach(function (input) {
          input.value = style[input.dataset.style] == null ? '#d4af37' : style[input.dataset.style];
        });
      }
    };

    document.querySelectorAll('[data-drawing-tool]').forEach(function (button) {
      button.addEventListener('click', function () {
        chart.setTool(button.dataset.drawingTool);
        closeTools();
      });
    });

    var clear = byId('clearDrawings');
    if (clear) clear.addEventListener('click', function () { chart.clearDrawings(); closeTools(); });
    var remove = byId('deleteDrawing');
    if (remove) remove.addEventListener('click', function () { chart.deleteSelected(); closeTools(); });
    var undo = byId('undoDrawing');
    if (undo) undo.addEventListener('click', function () { chart.undo(); });
    var redo = byId('redoDrawing');
    if (redo) redo.addEventListener('click', function () { chart.redo(); });
    var finish = byId('finishDrawing');
    if (finish) finish.addEventListener('click', function () { chart.setTool(null); closeTools(); });
    var stayBtn = byId('stayDrawingToggle');
    if (stayBtn) {
      stayBtn.addEventListener('click', function () {
        chart.setStayInDrawingMode(!chart.stayInDrawingMode);
      });
    }

    if (byId('replayWorkspace')) bindReplayWorkspace(chart);
    sync({ activeTool: chart.activeTool, selectedId: chart.selectedId, message: 'Gesture chart aktif · ' + chart.drawings.length + ' objek.' });
  }

  var TV_QUICK_TOOLS = [
    {
      id: 'pan',
      label: 'Geser',
      title: 'Geser & Crosshair Chart',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><circle cx="12" cy="12" r="2.2"></circle></svg>'
    },
    {
      id: 'select',
      label: 'Pilih',
      title: 'Pilih / Pindahkan Gambar',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3l14 9-6.5 1.8L9 20 5 3z"></path></svg>'
    },
    {
      id: 'trend',
      label: 'Garis',
      title: 'Garis Tren (Alt+T)',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="19" x2="19" y2="5"></line><circle cx="5" cy="19" r="2"></circle><circle cx="19" cy="5" r="2"></circle></svg>'
    },
    {
      id: 'horizontal',
      label: 'Level',
      title: 'Garis Level Horizontal (Alt+H)',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"></line><circle cx="12" cy="12" r="2.2"></circle></svg>'
    },
    {
      id: 'rectangle',
      label: 'Zona',
      title: 'Kotak Zona FVG / OB (Alt+R)',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="1.5"></rect><circle cx="4" cy="6" r="1.5"></circle><circle cx="20" cy="18" r="1.5"></circle></svg>'
    },
    {
      id: 'longPosition',
      label: 'Long RR',
      title: 'Proyeksi Posisi Long (Buy R:R)',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="9" rx="1" fill="rgba(45,212,191,0.22)" stroke="#2dd4bf"></rect><rect x="4" y="13" width="16" height="7" rx="1" fill="rgba(251,113,133,0.18)" stroke="#fb7185"></rect><line x1="3" y1="13" x2="21" y2="13" stroke="currentColor"></line></svg>'
    },
    {
      id: 'shortPosition',
      label: 'Short RR',
      title: 'Proyeksi Posisi Short (Sell R:R)',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="7" rx="1" fill="rgba(251,113,133,0.18)" stroke="#fb7185"></rect><rect x="4" y="11" width="16" height="9" rx="1" fill="rgba(45,212,191,0.22)" stroke="#2dd4bf"></rect><line x1="3" y1="11" x2="21" y2="11" stroke="currentColor"></line></svg>'
    },
    {
      id: 'measure',
      label: 'Ukur',
      title: 'Pengukur Pips, % & Bar (M)',
      svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"></path><line x1="14.5" y1="12.5" x2="12" y2="15"></line><line x1="11.5" y1="9.5" x2="9" y2="12"></line><line x1="8.5" y1="6.5" x2="6" y2="9"></line></svg>'
    }
  ];

  var TV_UTILITY_TOOLS = [
    {
      id: 'magnetToggleBtn',
      action: 'magnet',
      title: 'Magnet OHLC: Mati (Klik untuk Lemah / Kuat · Alt+M)',
      svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15v-5a6 6 0 1 1 12 0v5"></path><path d="M6 15h4v5H6z"></path><path d="M14 15h4v5h-4z"></path></svg>'
    },
    {
      id: 'lockDrawingsBtn',
      action: 'lock',
      title: 'Kunci Semua Objek Gambar',
      svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>'
    },
    {
      id: 'hideDrawingsBtn',
      action: 'hide',
      title: 'Sembunyikan / Tampilkan Semua Objek Gambar',
      svg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
    }
  ];

  function bindReplayWorkspace(chart) {
    var workspace = byId('replayWorkspace');
    var dock = byId('tvDrawingDock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'tvDrawingDock';
      dock.className = 'tv-tool-dock replay-drawing-actions';
      chart.container.parentNode.insertBefore(dock, chart.container);
    }

    var extraMenu = byId('tvExtraToolsMenu') || dock.querySelector('.drawing-menu');

    // Insert crisp SVG studio tool buttons + Magnet/Lock/Eye utility toggles inside the unified dock
    if (!dock.querySelector('[data-quick]')) {
      var frag = document.createDocumentFragment();
      TV_QUICK_TOOLS.forEach(function (tool) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tv-tool-btn';
        btn.dataset.quick = tool.id;
        btn.title = tool.title;
        btn.setAttribute('aria-label', tool.title);
        btn.innerHTML = tool.svg + '<span class="tv-tool-label">' + tool.label + '</span>';
        frag.appendChild(btn);
      });
      var divider = document.createElement('span');
      divider.className = 'tv-dock-divider';
      divider.setAttribute('aria-hidden', 'true');
      frag.appendChild(divider);
      TV_UTILITY_TOOLS.forEach(function (util) {
        var ubtn = document.createElement('button');
        ubtn.type = 'button';
        ubtn.id = util.id;
        ubtn.className = 'tv-tool-btn tv-util-btn';
        ubtn.dataset.dockUtil = util.action;
        ubtn.title = util.title;
        ubtn.setAttribute('aria-label', util.title);
        ubtn.setAttribute('aria-pressed', 'false');
        ubtn.innerHTML = util.svg;
        frag.appendChild(ubtn);
      });
      if (extraMenu) dock.insertBefore(frag, extraMenu);
      else dock.appendChild(frag);
    }

    // Fallback creation only if static view controls were absent from markup
    if (!byId('replayFollow') || !byId('replayIctToggle') || !byId('replayFullscreen')) {
      var fallbackView = document.createElement('div');
      fallbackView.className = 'tv-view-actions';
      fallbackView.innerHTML =
        '<button type="button" id="replayIctToggle" class="tv-view-btn" aria-pressed="false"><span>ICT</span></button>' +
        '<button type="button" id="replayFollow" class="tv-view-btn" aria-pressed="true"><span>Cursor</span></button>' +
        '<button type="button" id="replayFullscreen" class="tv-view-btn tv-fs-btn" aria-pressed="false"><span class="tv-fs-label">Penuh</span></button>';
      workspace.insertBefore(fallbackView, workspace.firstChild);
    }

    var extraTools = ['fibonacci', 'horizontalRay', 'vertical', 'datePriceRange', 'priceRange', 'parallelChannel', 'arrow', 'path', 'circle', 'text', 'note', 'priceNote'];

    // Floating Selected-Object Mini Toolbar & Object Tree wiring
    var floatBar = byId('tvFloatingObjBar');
    var objWidthSel = byId('tvObjWidthSelect');
    var objStyleSel = byId('tvObjLineStyleSelect');
    var objSendBtn = byId('tvObjSendOrderBtn');
    var objDupBtn = byId('tvObjDuplicateBtn');
    var objDelBtn = byId('tvObjDeleteBtn');
    var objSwatches = byId('tvObjSwatches');
    var objTreeList = byId('tvObjectTreeList');
    var objCountEl = byId('tvObjectCount');

    if (objSwatches) {
      objSwatches.addEventListener('click', function (evt) {
        var sw = evt.target.closest('[data-swatch]');
        if (!sw) return;
        chart.setDrawingStyle({ color: sw.dataset.swatch });
      });
    }
    if (objWidthSel) {
      objWidthSel.addEventListener('change', function () {
        chart.setDrawingStyle({ width: Number(objWidthSel.value) });
      });
    }
    if (objStyleSel) {
      objStyleSel.addEventListener('change', function () {
        chart.setDrawingStyle({ lineStyle: objStyleSel.value });
      });
    }
    if (objDupBtn) objDupBtn.addEventListener('click', function () { chart.duplicateSelected(); });
    if (objDelBtn) objDelBtn.addEventListener('click', function () { chart.deleteSelected(); });

    function escTree(v) {
      return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
      });
    }

    function renderObjectTree() {
      if (objCountEl) objCountEl.textContent = String(chart.drawings.length);
      if (!objTreeList) return;
      if (!chart.drawings.length) {
        objTreeList.innerHTML = '<div class="tv-obj-tree-empty">Belum ada objek gambar.</div>';
        return;
      }
      var labels = (root.AmyCandleChart && root.AmyCandleChart.TOOL_LABELS) || {};
      objTreeList.innerHTML = chart.drawings.slice().reverse().map(function (d) {
        var name = labels[d.type] || d.type;
        var isSel = d.id === chart.selectedId;
        var visOff = d.visible === false;
        var safeId = escTree(d.id);
        var safeLabel = escTree(name + (d.text ? ' · ' + d.text.slice(0, 14) : ''));
        return '<div class="tv-obj-row' + (isSel ? ' is-selected' : '') + '">' +
          '<button type="button" class="tv-obj-select" data-obj-select="' + safeId + '">' + safeLabel + '</button>' +
          '<button type="button" class="tv-obj-mini" data-obj-vis="' + safeId + '" title="Sembunyikan/Tampilkan">' + (visOff ? '🚫' : '👁') + '</button>' +
          '<button type="button" class="tv-obj-mini" data-obj-lock="' + safeId + '" title="Kunci/Buka">' + (d.locked ? '🔒' : '🔓') + '</button>' +
          '<button type="button" class="tv-obj-mini is-del" data-obj-del="' + safeId + '" title="Hapus">×</button>' +
        '</div>';
      }).join('');
    }

    if (objTreeList) {
      objTreeList.addEventListener('click', function (evt) {
        var selBtn = evt.target.closest('[data-obj-select]');
        if (selBtn) { chart.selectDrawing(selBtn.dataset.objSelect); return; }
        var visBtn = evt.target.closest('[data-obj-vis]');
        if (visBtn) { chart.toggleDrawingVisibility(visBtn.dataset.objVis); return; }
        var lockBtn = evt.target.closest('[data-obj-lock]');
        if (lockBtn) { chart.toggleDrawingLock(lockBtn.dataset.objLock); return; }
        var delBtn = evt.target.closest('[data-obj-del]');
        if (delBtn) { chart.deleteDrawingById(delBtn.dataset.objDel); return; }
      });
    }

    chart.refreshObjectControls = function (state) {
      var follow = byId('replayFollow');
      if (follow) follow.setAttribute('aria-pressed', String(Boolean(chart.followReplay)));
      var activeKey = state.activeTool || 'pan';
      dock.querySelectorAll('[data-quick]').forEach(function (button) {
        var isOn = button.dataset.quick === activeKey;
        button.classList.toggle('active', isOn);
        button.setAttribute('aria-pressed', String(isOn));
      });
      if (extraMenu) {
        var extraActive = extraTools.indexOf(activeKey) >= 0;
        extraMenu.classList.toggle('has-active-tool', extraActive);
      }

      var magBtn = byId('magnetToggleBtn');
      if (magBtn) {
        var m = chart.magnetMode || 'off';
        magBtn.classList.toggle('active', m !== 'off');
        magBtn.classList.toggle('is-strong', m === 'strong');
        magBtn.setAttribute('aria-pressed', String(m !== 'off'));
        magBtn.title = 'Magnet OHLC: ' + (m === 'off' ? 'Mati' : (m === 'weak' ? 'Lemah' : 'Kuat')) + ' (Klik untuk ubah · Alt+M)';
      }
      var lockBtn = byId('lockDrawingsBtn');
      if (lockBtn) {
        lockBtn.classList.toggle('active', Boolean(chart.drawingsLocked));
        lockBtn.setAttribute('aria-pressed', String(Boolean(chart.drawingsLocked)));
      }
      var hideBtn = byId('hideDrawingsBtn');
      if (hideBtn) {
        hideBtn.classList.toggle('active', Boolean(chart.drawingsHidden));
        hideBtn.setAttribute('aria-pressed', String(Boolean(chart.drawingsHidden)));
      }
      var stayBtnEl = byId('stayDrawingToggle');
      if (stayBtnEl) {
        stayBtnEl.classList.toggle('active', Boolean(chart.stayInDrawingMode));
        stayBtnEl.setAttribute('aria-pressed', String(Boolean(chart.stayInDrawingMode)));
      }

      var selected = chart.getSelectedDrawing ? chart.getSelectedDrawing() : null;
      if (floatBar) {
        var showFloat = Boolean(selected && !chart.drawingsHidden && chart.activeTool === 'select');
        floatBar.hidden = !showFloat;
        if (showFloat && selected) {
          if (objWidthSel) objWidthSel.value = String(Math.min(4, Math.max(1, Math.round(selected.style.width || 2))));
          if (objStyleSel) objStyleSel.value = selected.style.lineStyle || 'solid';
          if (objSendBtn) {
            objSendBtn.hidden = !(selected.type === 'longPosition' || selected.type === 'shortPosition');
          }
        }
      }
      renderObjectTree();
    };

    dock.querySelectorAll('[data-quick]').forEach(function (button) {
      button.addEventListener('click', function () {
        var tool = button.dataset.quick;
        chart.setTool(tool === 'pan' ? null : tool);
        if (extraMenu) extraMenu.removeAttribute('open');
      });
    });

    var magBtnInit = byId('magnetToggleBtn');
    if (magBtnInit) {
      magBtnInit.addEventListener('click', function () {
        var order = ['off', 'weak', 'strong'];
        var next = order[(order.indexOf(chart.magnetMode || 'off') + 1) % order.length];
        chart.setMagnetMode(next);
      });
    }
    var lockBtnInit = byId('lockDrawingsBtn');
    if (lockBtnInit) {
      lockBtnInit.addEventListener('click', function () {
        chart.setDrawingsLocked(!chart.drawingsLocked);
      });
    }
    var hideBtnInit = byId('hideDrawingsBtn');
    if (hideBtnInit) {
      hideBtnInit.addEventListener('click', function () {
        chart.setDrawingsHidden(!chart.drawingsHidden);
      });
    }

    var followBtn = byId('replayFollow');
    if (followBtn) followBtn.addEventListener('click', function () { chart.goToCursor(); });

    var full = byId('replayFullscreen');
    var scrollY = 0;
    var placeholder = document.createComment('replay workspace position');
    var nativeActive = false;

    function syncFullscreenButton(enabled) {
      if (!full) return;
      var labelNode = full.querySelector('.tv-fs-label');
      if (labelNode) labelNode.textContent = enabled ? 'Keluar' : 'Penuh';
      else full.textContent = enabled ? 'Keluar' : 'Penuh';
      full.setAttribute('aria-label', enabled ? 'Keluar layar penuh' : 'Buka layar penuh');
      full.setAttribute('title', enabled ? 'Keluar Layar Penuh (Esc)' : 'Layar Penuh');
      full.setAttribute('aria-pressed', String(enabled));
    }

    function layout(enabled) {
      if (enabled === workspace.classList.contains('is-fullscreen')) return;
      if (enabled) {
        scrollY = root.scrollY;
        workspace.parentNode.insertBefore(placeholder, workspace);
        document.body.appendChild(workspace);
      } else if (placeholder.parentNode) {
        placeholder.parentNode.replaceChild(workspace, placeholder);
      }
      document.body.classList.toggle('replay-fullscreen', enabled);
      workspace.classList.toggle('is-fullscreen', enabled);
      syncFullscreenButton(enabled);
      root.requestAnimationFrame(function () {
        chart.resize();
        if (!enabled) root.scrollTo(0, scrollY);
        if (full) full.focus({ preventScroll: true });
      });
    }

    function leaveFullscreen() {
      if (document.fullscreenElement === workspace && document.exitFullscreen) {
        try { Promise.resolve(document.exitFullscreen()).catch(function () {}); } catch (_) {}
      }
      nativeActive = false;
      layout(false);
    }

    if (full) {
      full.addEventListener('click', function () {
        if (workspace.classList.contains('is-fullscreen')) { leaveFullscreen(); return; }
        layout(true);
        if (!root.Android && workspace.requestFullscreen) {
          try { Promise.resolve(workspace.requestFullscreen()).catch(function () {}); } catch (_) {}
        }
      });
    }

    if (typeof document.addEventListener === 'function') {
      document.addEventListener('fullscreenchange', function () {
        if (document.fullscreenElement === workspace) nativeActive = true;
        else if (nativeActive) { nativeActive = false; layout(false); }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && workspace.classList.contains('is-fullscreen') && !chart.textEditor) leaveFullscreen();
      });
    }

    if (typeof root.addEventListener === 'function') {
      root.addEventListener('resize', function () {
        if (workspace.classList.contains('is-fullscreen') && typeof root.requestAnimationFrame === 'function') {
          root.requestAnimationFrame(function () { chart.resize(); });
        }
      });
    }

    chart.refreshObjectControls({ activeTool: chart.activeTool, selectedId: chart.selectedId });
  }

  if (typeof document.addEventListener === 'function' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShell, { once: true });
  } else {
    initShell();
  }

  root.AmyPracticeUI = Object.freeze({
    byId: byId,
    text: text,
    status: status,
    decisionState: decisionState,
    tradeReady: tradeReady,
    renderOhlc: renderOhlc,
    currentCandle: currentCandle,
    saveTrade: saveTrade,
    bindDrawingToolbar: bindDrawingToolbar
  });
})(typeof window !== 'undefined' ? window : globalThis);
