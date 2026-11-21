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

  // Self-contained mobile nav drawer & theme button wiring (replaces dead ../assets/js/main.js!)
  function initShell() {
    var burger = byId('hamburger');
    var nav = byId('navlinks');
    if (burger && nav) {
      burger.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function (evt) {
        if (!nav.classList.contains('is-open')) return;
        if (!nav.contains(evt.target) && !burger.contains(evt.target)) {
          nav.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
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
      root.addEventListener('amyfx:theme-change', syncThemeBtn);
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
      if (sum) sum.focus();
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
    if (clear) clear.addEventListener('click', function () { chart.clearDrawings(); });
    var remove = byId('deleteDrawing');
    if (remove) remove.addEventListener('click', function () { chart.deleteSelected(); });
    var undo = byId('undoDrawing');
    if (undo) undo.addEventListener('click', function () { chart.undo(); });
    var finish = byId('finishDrawing');
    if (finish) finish.addEventListener('click', function () { chart.setTool(null); closeTools(); });

    if (byId('replayWorkspace')) bindReplayWorkspace(chart);
    sync({ activeTool: chart.activeTool, selectedId: chart.selectedId, message: 'Gesture chart aktif · ' + chart.drawings.length + ' objek.' });
  }

  function bindReplayWorkspace(chart) {
    var workspace = byId('replayWorkspace');
    var quick = document.createElement('div');
    quick.className = 'replay-drawing-actions';
    quick.innerHTML =
      '<button type="button" data-quick="pan">Geser</button>' +
      '<button type="button" data-quick="select">Pilih</button>' +
      '<button type="button" data-quick="rectangle">Zona</button>' +
      '<button type="button" data-quick="trend">Garis</button>' +
      '<button type="button" data-quick="horizontal">Level</button>' +
      '<button type="button" data-quick="longPosition">Long RR</button>' +
      '<button type="button" data-quick="shortPosition">Short RR</button>' +
      '<button type="button" id="replayFollow" aria-pressed="true">Ke Cursor</button>' +
      '<button type="button" id="replayIctToggle" aria-pressed="false" title="Tampilkan garis PDH/PDL dan Asia High/Low tanpa membocorkan masa depan">ICT Level</button>' +
      '<button type="button" id="replayFullscreen" aria-pressed="false">Layar Penuh</button>';
    chart.container.parentNode.insertBefore(quick, chart.container);

    chart.refreshObjectControls = function (state) {
      var follow = byId('replayFollow');
      if (follow) follow.setAttribute('aria-pressed', String(chart.followReplay));
      quick.querySelectorAll('[data-quick]').forEach(function (button) {
        button.classList.toggle('active', button.dataset.quick === (state.activeTool || 'pan'));
      });
    };

    quick.querySelectorAll('[data-quick]').forEach(function (button) {
      button.addEventListener('click', function () {
        var tool = button.dataset.quick;
        chart.setTool(tool === 'pan' ? null : tool);
      });
    });

    var followBtn = byId('replayFollow');
    if (followBtn) followBtn.addEventListener('click', function () { chart.goToCursor(); });

    var full = byId('replayFullscreen');
    var scrollY = 0;
    var placeholder = document.createComment('replay workspace position');
    var nativeActive = false;

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
      full.textContent = enabled ? 'Keluar' : 'Layar Penuh';
      full.setAttribute('aria-label', enabled ? 'Keluar layar penuh' : 'Buka layar penuh');
      full.setAttribute('aria-pressed', String(enabled));
      root.requestAnimationFrame(function () {
        chart.resize();
        if (!enabled) root.scrollTo(0, scrollY);
        full.focus({ preventScroll: true });
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

    document.addEventListener('fullscreenchange', function () {
      if (document.fullscreenElement === workspace) nativeActive = true;
      else if (nativeActive) { nativeActive = false; layout(false); }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && workspace.classList.contains('is-fullscreen') && !chart.textEditor) leaveFullscreen();
    });

    root.addEventListener('resize', function () {
      if (workspace.classList.contains('is-fullscreen')) root.requestAnimationFrame(function () { chart.resize(); });
    });

    chart.refreshObjectControls({ activeTool: chart.activeTool, selectedId: chart.selectedId });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initShell, { once: true });
  else initShell();

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
