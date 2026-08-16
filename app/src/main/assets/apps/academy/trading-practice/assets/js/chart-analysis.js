(function () {
  'use strict';
  var ui = window.AmyPracticeUI;
  var core = window.AmyPracticeCore;
  var provider = window.AmyPracticeData;
  var chart;
  var candles = [];
  var liveCandles = [];
  var live = null;
  var isLive = false;

  function timeframe() { return ui.byId('timeframe').value; }

  async function loadHistorical(fit) {
    try {
      var result = await provider.getCandles({ symbol: 'XAUUSD', timeframe: timeframe() });
      candles = result.candles;
      chart.setCandles(candles, fit !== false);
      var last = ui.currentCandle(candles);
      ui.renderOhlc('ohlc', last, last && last.time);
      ui.text('chartMode', 'Historis');
      ui.status('chartStatus', candles.length + ' candle ' + timeframe() + ' siap. Zoom, pan, atau pilih alat gambar.');
      ui.text('sourceNote', 'Sumber: ' + result.source + (result.sampleOnly ? ' · sample UI, bukan hasil backtest.' : ' · dataset impor lokal.'));
    } catch (error) { ui.status('chartStatus', error.message, true); }
  }

  function setLive(enabled) {
    isLive = enabled;
    var button = ui.byId('liveToggle');
    button.textContent = enabled ? 'Kembali ke Historis' : 'Aktifkan Live';
    button.classList.toggle('active', enabled);
    if (!enabled) {
      if (live) live.stop();
      live = null;
      loadHistorical(true);
      return;
    }
    liveCandles = [];
    candles = liveCandles;
    chart.setCandles([], true);
    ui.text('chartMode', 'Live WebSocket');
    ui.text('sourceNote', 'Sumber: native AmyLivePrice → Twelve Data WebSocket. Tanpa REST dan tanpa polling.');
    live = new window.AmyPracticeLive.LivePriceAdapter({
      timeframe: timeframe(),
      onCandle: function (update) {
        var current = update.current;
        var index = liveCandles.findIndex(function (item) { return item.time === current.time; });
        if (index >= 0) liveCandles[index] = current; else liveCandles.push(current);
        liveCandles.sort(function (a, b) { return a.time - b.time; });
        chart.updateCandle(current);
        ui.renderOhlc('ohlc', current, current.time);
      },
      onStatus: function (value) { ui.status('chartStatus', value.message, /ERROR|FAILED/.test(value.status)); }
    });
    live.start();
  }

  async function importDataset() {
    var file = ui.byId('datasetFile').files[0];
    try {
      ui.status('importStatus', 'Memvalidasi candle…');
      var record = await provider.importFile(file, { symbol: 'XAUUSD', timeframe: ui.byId('importTimeframe').value });
      ui.status('importStatus', record.candles.length + ' candle tersimpan lokal sebagai ' + record.timeframe + '.');
      if (isLive) setLive(false); else await loadHistorical(true);
    } catch (error) { ui.status('importStatus', error.message, true); }
  }

  async function saveTrade(event) {
    event.preventDefault();
    var current = ui.currentCandle(candles);
    try {
      var record = await ui.saveTrade(event.currentTarget, {
        symbol: 'XAUUSD', timeframe: timeframe(), tradeTime: current ? current.time : Math.floor(Date.now() / 1000),
        replayStartTime: current ? current.time : Math.floor(Date.now() / 1000), currentPrice: current && current.close
      });
      chart.setTradeLevels(record.bias === 'WAIT' ? [] : [
        { type: 'entry', price: record.entry, title: 'Entry' }, { type: 'stop', price: record.stopLoss, title: 'SL' }, { type: 'target', price: record.takeProfit, title: 'TP' }
      ]);
      ui.status('tradeStatus', record.bias + ' tersimpan. Planned R: ' + (record.plannedR == null ? '—' : record.plannedR.toFixed(2)) + '.');
    } catch (error) { ui.status('tradeStatus', error.message, true); }
  }

  function init() {
    chart = new window.AmyCandleChart.CandleChart(ui.byId('chart'), {
      storageKey: 'amy.practice.v1.drawings.analysis',
      onCrosshair: function (candle, time) { if (candle) ui.renderOhlc('ohlc', candle, Number(time)); }
    });
    ui.bindDrawingToolbar(chart);
    ui.byId('timeframe').addEventListener('change', function () {
      if (isLive) { liveCandles = []; candles = liveCandles; chart.setCandles([], true); live.setTimeframe(timeframe()); }
      else loadHistorical(true);
    });
    ui.byId('liveToggle').addEventListener('click', function () { setLive(!isLive); });
    ui.byId('importButton').addEventListener('click', importDataset);
    ui.byId('tradeForm').addEventListener('submit', saveTrade);
    window.addEventListener('pagehide', function () { if (live) live.stop(); chart.destroy(); }, { once: true });
    loadHistorical(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
