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
  function sourceId() { return ui.byId('datasetSource').value || provider.SAMPLE_ID; }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>\"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function bytes(value) {
    var number = Number(value || 0);
    if (number < 1024) return number + ' B';
    if (number < 1024 * 1024) return (number / 1024).toFixed(1) + ' KB';
    return (number / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function dateLabel(timestamp) {
    var value = Number(timestamp || 0);
    if (!value) return 'tanpa tanggal';
    return new Date(value * 1000).toISOString().slice(0, 7);
  }

  function optionLabel(item) {
    if (item.sampleOnly) return 'Sample · Maret 2009';
    return dateLabel(item.start) + ' · ' + Number(item.rowCount || 0).toLocaleString('id-ID') + ' M1' + (item.repairedAudited ? ' · audited' : '');
  }

  async function renderPackLibrary(sources) {
    var host = ui.byId('packLibrary');
    var packs = sources.filter(function (item) { return item.kind === 'pack'; });
    var total = packs.reduce(function (sum, item) { return sum + Number(item.size || 0); }, 0);
    ui.text('packSummary', packs.length + ' pack terpasang · ' + bytes(total));
    if (!packs.length) {
      host.innerHTML = '<div class="pack-empty">Belum ada pack historis. Pilih ZIP tahunan/bulanan repaired-audited, CSV, atau JSON.</div>';
      return;
    }
    host.innerHTML = packs.map(function (item) {
      return '<div class="pack-row"><div><strong>' + escapeHtml(optionLabel(item)) + '</strong><small>' + escapeHtml(String(item.fileName || item.source || '')) + ' · ' + bytes(item.size) + '</small></div><button type="button" data-delete-pack="' + escapeHtml(item.id) + '">Hapus</button></div>';
    }).join('');
  }

  async function refreshSources(preferredId) {
    var select = ui.byId('datasetSource');
    var sources = await provider.listSources('XAUUSD');
    select.innerHTML = sources.map(function (item) {
      return '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(optionLabel(item)) + '</option>';
    }).join('');
    var desired = preferredId || provider.selectedSourceId();
    if (!sources.some(function (item) { return item.id === desired; })) desired = provider.SAMPLE_ID;
    select.value = desired;
    provider.setSelectedSourceId(desired);
    await renderPackLibrary(sources);
    return sources;
  }

  async function loadHistorical(fit) {
    try {
      var result = await provider.getCandles({ symbol: 'XAUUSD', timeframe: timeframe(), sourceId: sourceId() });
      candles = result.candles;
      chart.setCandles(candles, fit !== false);
      var last = ui.currentCandle(candles);
      ui.renderOhlc('ohlc', last, last && last.time);
      ui.text('chartMode', 'Historis');
      ui.status('chartStatus', candles.length + ' candle ' + timeframe() + ' siap. Zoom, pan, atau pilih alat gambar.');
      ui.text('sourceNote', 'Sumber: ' + result.source + (result.sampleOnly ? ' · sample UI, bukan hasil backtest.' : ' · pack historis lokal.'));
    } catch (error) { ui.status('chartStatus', error.message, true); }
  }

  function nativeRows(symbol, tf) {
    if (!window.Android || typeof window.Android.getNativeCandles !== 'function') return [];
    try {
      var raw = window.Android.getNativeCandles(symbol, tf, '400');
      var parsed = JSON.parse(raw || '[]');
      return core.normalizeCandles(Array.isArray(parsed) ? parsed : []);
    } catch (_) { return []; }
  }

  function nativeClosedContext(tf) {
    var exact = nativeRows('XAU/USD', tf);
    if (!exact.length) exact = nativeRows('XAUUSD', tf);
    if (exact.length) return exact.slice(-400);
    if (tf === 'M1') return [];
    var m1 = nativeRows('XAU/USD', 'M1');
    if (!m1.length) m1 = nativeRows('XAUUSD', 'M1');
    if (!m1.length) return [];
    try { return core.aggregateCandles(m1, tf, { sourceTimeframe: 'M1' }).slice(-400); }
    catch (_) { return []; }
  }

  function seedLiveContext() {
    liveCandles = nativeClosedContext(timeframe());
    candles = liveCandles;
    chart.setCandles(liveCandles, true);
    var last = ui.currentCandle(liveCandles);
    if (last) ui.renderOhlc('ohlc', last, last.time);
    return liveCandles.length;
  }

  async function setLive(enabled) {
    isLive = enabled;
    var button = ui.byId('liveToggle');
    button.textContent = enabled ? 'Kembali ke Historis' : 'Aktifkan Live';
    button.classList.toggle('active', enabled);
    if (!enabled) {
      if (live) live.stop();
      live = null;
      await loadHistorical(true);
      return;
    }

    if (live) live.stop();
    var contextCount = seedLiveContext();
    ui.text('chartMode', 'Live WebSocket');
    ui.text('sourceNote', contextCount
      ? 'Konteks: ' + contextCount + ' candle closed dari CandleStore lokal → dilanjutkan native AmyLivePrice / Twelve Data WebSocket. Tanpa REST Twelve Data.'
      : 'Konteks closed lokal belum tersedia. Chart akan mulai dari tick WebSocket berikutnya; tidak ada REST Twelve Data.');
    live = new window.AmyPracticeLive.LivePriceAdapter({
      timeframe: timeframe(),
      onCandle: function (update) {
        var current = update.current;
        var last = liveCandles.length ? liveCandles[liveCandles.length - 1] : null;
        if (last && Number(current.time) < Number(last.time)) return;
        var index = liveCandles.findIndex(function (item) { return item.time === current.time; });
        if (index >= 0) liveCandles[index] = current;
        else liveCandles.push(current);
        liveCandles.sort(function (a, b) { return a.time - b.time; });
        if (liveCandles.length > 600) liveCandles.splice(0, liveCandles.length - 600);
        candles = liveCandles;
        chart.updateCandle(current);
        ui.renderOhlc('ohlc', current, current.time);
      },
      onStatus: function (value) {
        var suffix = contextCount ? ' · konteks closed lokal tetap tampil' : '';
        ui.status('chartStatus', value.message + suffix, /ERROR|FAILED/.test(value.status));
      }
    });
    live.start();
  }

  async function importDataset() {
    var files = ui.byId('datasetFile').files;
    var button = ui.byId('importButton');
    try {
      button.disabled = true;
      ui.status('importStatus', 'Memindai arsip…');
      var records = await provider.importFiles(files, {
        symbol: 'XAUUSD', timeframe: ui.byId('importTimeframe').value
      }, function (progress) {
        if (progress && progress.message) ui.status('importStatus', progress.message);
      });
      var selected = records[records.length - 1];
      await refreshSources(selected && selected.id);
      ui.byId('datasetFile').value = '';
      ui.status('importStatus', records.length + ' pack historis tersimpan. Data tetap lokal dan tidak menambah ukuran APK.');
      if (isLive) await setLive(false); else await loadHistorical(true);
    } catch (error) { ui.status('importStatus', error.message, true); }
    finally { button.disabled = false; }
  }

  async function deletePack(id) {
    try {
      var wasSelected = sourceId() === id;
      await provider.deleteSource(id);
      await refreshSources(wasSelected ? provider.SAMPLE_ID : sourceId());
      if (!isLive) await loadHistorical(true);
      ui.status('importStatus', 'Pack dihapus dari perangkat.');
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

  async function init() {
    chart = new window.AmyCandleChart.CandleChart(ui.byId('chart'), {
      storageKey: 'amy.practice.v1.drawings.analysis',
      onCrosshair: function (candle, time) { if (candle) ui.renderOhlc('ohlc', candle, Number(time)); }
    });
    ui.bindDrawingToolbar(chart);
    await refreshSources();
    ui.byId('timeframe').addEventListener('change', async function () {
      if (isLive) {
        if (live) live.setTimeframe(timeframe());
        var count = seedLiveContext();
        ui.text('sourceNote', count
          ? 'Konteks: ' + count + ' candle closed dari CandleStore lokal → WebSocket live.'
          : 'Konteks closed lokal belum tersedia pada timeframe ini → WebSocket live.');
      } else await loadHistorical(true);
    });
    ui.byId('datasetSource').addEventListener('change', async function () {
      provider.setSelectedSourceId(this.value);
      if (!isLive) await loadHistorical(true);
    });
    ui.byId('liveToggle').addEventListener('click', function () { setLive(!isLive).catch(function (error) { ui.status('chartStatus', error.message, true); }); });
    ui.byId('importButton').addEventListener('click', importDataset);
    ui.byId('packLibrary').addEventListener('click', function (event) {
      var button = event.target.closest('[data-delete-pack]');
      if (button) deletePack(button.dataset.deletePack);
    });
    ui.byId('tradeForm').addEventListener('submit', saveTrade);
    window.addEventListener('pagehide', function () { if (live) live.stop(); chart.destroy(); }, { once: true });
    await loadHistorical(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init().catch(function (error) { ui.status('chartStatus', error.message, true); }); }, { once: true });
  else init().catch(function (error) { ui.status('chartStatus', error.message, true); });
})();
