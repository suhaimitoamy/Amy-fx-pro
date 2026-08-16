/* Amy FX Trading Practice — small shared UI helpers. */
(function (root) {
  'use strict';
  if (root.AmyPracticeUI) return;
  var core = root.AmyPracticeCore;

  function byId(id) { return document.getElementById(id); }
  function text(id, value) { var node = byId(id); if (node) node.textContent = value == null ? '' : String(value); }
  function status(id, message, error) {
    var node = byId(id);
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', Boolean(error));
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
    document.querySelectorAll('[data-drawing-tool]').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('[data-drawing-tool]').forEach(function (item) { item.classList.remove('active'); });
        button.classList.add('active');
        chart.setTool(button.dataset.drawingTool);
      });
    });
    var clear = byId('clearDrawings');
    if (clear) clear.addEventListener('click', function () {
      chart.clearDrawings();
      document.querySelectorAll('[data-drawing-tool]').forEach(function (item) { item.classList.remove('active'); });
    });
  }

  root.AmyPracticeUI = Object.freeze({
    byId: byId, text: text, status: status, renderOhlc: renderOhlc,
    currentCandle: currentCandle, saveTrade: saveTrade, bindDrawingToolbar: bindDrawingToolbar
  });
})(typeof window !== 'undefined' ? window : globalThis);
