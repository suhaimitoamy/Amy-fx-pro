/* Amy FX Trading Practice — small shared UI helpers. */
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
      bias: data.get('bias'), entry: data.get('entry'), stopLoss: data.get('stopLoss'),
      takeProfit: data.get('takeProfit'), notes: data.get('notes')
    };
  }
  async function saveTrade(form, context) {
    var input = Object.assign(readTradeForm(form), context || {});
    var record = root.AmyPracticeTrades.create(input);
    await root.AmyPracticeStorage.saveTrade(record);
    return record;
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
    if (toolbar) {
      var styles = document.createElement('div');
      styles.className = 'drawing-style-controls';
      styles.innerHTML = '<label>Warna <input type="color" data-style="color" value="#60a5fa"></label><label>Ketebalan <input type="range" data-style="width" min="1" max="8" value="2"></label><label>Opasitas <input type="range" data-style="opacity" min="0.1" max="1" step="0.1" value="1"></label>';
      toolbar.appendChild(styles);
      styles.addEventListener('change', function (event) {
        var key = event.target.dataset.style;
        if (!key) return;
        var patch = {}; patch[key] = key === 'color' ? event.target.value : Number(event.target.value);
        chart.setDrawingStyle(patch);
      });
    }
    chart.onDrawingState = function (state) {
      sync(state);
      var selected = chart.drawings.find(function (item) { return item.id === state.selectedId; });
      var style = selected ? selected.style : chart.drawingStyle;
      if (toolbar && style) toolbar.querySelectorAll('[data-style]').forEach(function (input) {
        input.value = style[input.dataset.style] == null ? '#60a5fa' : style[input.dataset.style];
      });
    };
    document.querySelectorAll('[data-drawing-tool]').forEach(function (button) {
      button.addEventListener('click', function () {
        chart.setTool(button.dataset.drawingTool);
        var menu = button.closest('details');
        if (menu) menu.removeAttribute('open');
      });
    });
    var clear = byId('clearDrawings');
    if (clear) clear.addEventListener('click', function () {
      chart.clearDrawings();
    });
    var remove = byId('deleteDrawing');
    if (remove) remove.addEventListener('click', function () { chart.deleteSelected(); });
    var undo = byId('undoDrawing');
    if (undo) undo.addEventListener('click', function () { chart.undo(); });
    var finish = byId('finishDrawing');
    if (finish) finish.addEventListener('click', function () { chart.setTool(null); });
    sync({ activeTool: chart.activeTool, selectedId: chart.selectedId, message: 'Gesture chart aktif. ' + chart.drawings.length + ' gambar tersimpan.' });
  }

  root.AmyPracticeUI = Object.freeze({
    byId: byId, text: text, status: status, decisionState: decisionState, tradeReady: tradeReady, renderOhlc: renderOhlc,
    currentCandle: currentCandle, saveTrade: saveTrade, bindDrawingToolbar: bindDrawingToolbar
  });
})(typeof window !== 'undefined' ? window : globalThis);
