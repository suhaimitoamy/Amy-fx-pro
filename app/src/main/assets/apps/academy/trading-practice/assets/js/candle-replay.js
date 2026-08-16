(function () {
  'use strict';
  var ui = window.AmyPracticeUI;
  var core = window.AmyPracticeCore;
  var storage = window.AmyPracticeStorage;
  var chart;
  var replay;
  var latestPayload = null;
  var firstRender = true;
  var playing = false;

  function timelineIndex(value) {
    var list = replay.timeline;
    var index = window.AmyReplayEngine.lowerBound(list, value);
    return Math.max(0, Math.min(index, list.length - 1));
  }

  async function updateOutcomes(payload) {
    var trades = await storage.listTrades();
    var matching = trades.filter(function (item) {
      return item.symbol === payload.symbol && item.timeframe === payload.timeframe && item.result === 'OPEN' && item.bias !== 'WAIT';
    });
    for (var i = 0; i < matching.length; i += 1) {
      var evaluated = window.AmyPracticeTrades.evaluate(matching[i], payload.candles);
      if (evaluated.result !== matching[i].result || evaluated.entryStatus !== matching[i].entryStatus) await storage.saveTrade(evaluated);
    }
  }

  async function render(payload) {
    latestPayload = payload;
    chart.setCandles(payload.candles, firstRender);
    firstRender = false;
    var current = ui.currentCandle(payload.candles);
    ui.renderOhlc('ohlc', current, payload.cursor);
    ui.text('visibleCount', payload.candles.length + ' candle');
    var slider = ui.byId('replaySlider');
    slider.max = Math.max(0, replay.timeline.length - 1);
    slider.value = timelineIndex(payload.cursor);
    ui.status('replayStatus', 'Cursor ' + core.formatWita(payload.cursor, true) + ' · data sesudah cursor tidak dikirim ke chart.');
    ui.text('sourceNote', 'Sumber: ' + payload.source + (payload.sampleOnly ? ' · sample UI, bukan hasil backtest.' : ' · dataset impor lokal.'));
    storage.saveReplayState({ timeframe: payload.timeframe, cursor: payload.cursor, speedMs: replay.speedMs });
    await updateOutcomes(payload);
  }

  async function move(count) {
    try { await replay.move(count); }
    catch (error) { ui.status('replayStatus', error.message, true); }
  }

  async function saveTrade(event) {
    event.preventDefault();
    if (!latestPayload) return;
    var current = ui.currentCandle(latestPayload.candles);
    try {
      var record = await ui.saveTrade(event.currentTarget, {
        symbol: latestPayload.symbol, timeframe: latestPayload.timeframe,
        tradeTime: latestPayload.cursor, replayStartTime: latestPayload.startTime,
        currentPrice: current && current.close
      });
      chart.setTradeLevels(record.bias === 'WAIT' ? [] : [
        { type: 'entry', price: record.entry, title: 'Entry' }, { type: 'stop', price: record.stopLoss, title: 'SL' }, { type: 'target', price: record.takeProfit, title: 'TP' }
      ]);
      ui.status('tradeStatus', record.bias + ' dikunci pada ' + core.formatWita(record.tradeTime, true) + '.');
    } catch (error) { ui.status('tradeStatus', error.message, true); }
  }

  async function init() {
    var saved = storage.loadReplayState() || {};
    ui.byId('timeframe').value = saved.timeframe || 'M15';
    ui.byId('speed').value = String(saved.speedMs || 900);
    chart = new window.AmyCandleChart.CandleChart(ui.byId('chart'), {
      storageKey: 'amy.practice.v1.drawings.replay',
      onCrosshair: function (candle, time) { if (candle) ui.renderOhlc('ohlc', candle, Number(time)); }
    });
    ui.bindDrawingToolbar(chart);
    replay = new window.AmyReplayEngine.ReplayController({
      symbol: 'XAUUSD', timeframe: ui.byId('timeframe').value, speedMs: Number(ui.byId('speed').value),
      onChange: render,
      onEnd: function () { playing = false; ui.text('playPause', 'Putar'); }
    });
    ui.byId('previousCandle').addEventListener('click', function () { move(-1); });
    ui.byId('nextCandle').addEventListener('click', function () { move(1); });
    ui.byId('nextFive').addEventListener('click', function () { move(5); });
    ui.byId('resetReplay').addEventListener('click', function () { replay.start(replay.timeline[Math.min(80, replay.timeline.length - 1)]); });
    ui.byId('playPause').addEventListener('click', function () {
      playing = !playing;
      if (playing) replay.play(); else replay.pause();
      ui.text('playPause', playing ? 'Jeda' : 'Putar');
    });
    ui.byId('speed').addEventListener('change', function () { replay.setSpeed(Number(this.value)); });
    ui.byId('timeframe').addEventListener('change', async function () {
      firstRender = true;
      try { await replay.setTimeframe(this.value); } catch (error) { ui.status('replayStatus', error.message, true); }
    });
    ui.byId('replaySlider').addEventListener('input', function () {
      var time = replay.timeline[Number(this.value)];
      if (time != null) replay.seek(time).catch(function (error) { ui.status('replayStatus', error.message, true); });
    });
    ui.byId('tradeForm').addEventListener('submit', saveTrade);
    window.addEventListener('pagehide', function () { replay.destroy(); chart.destroy(); }, { once: true });
    try { await replay.start(saved.cursor); }
    catch (error) { ui.status('replayStatus', error.message, true); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
