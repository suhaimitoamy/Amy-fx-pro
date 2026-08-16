/* Amy FX Trading Practice — packaged sample + imported local candle provider. */
(function (root) {
  'use strict';

  if (root.AmyPracticeData) return;
  var scriptUrl = document.currentScript && document.currentScript.src ? document.currentScript.src : location.href;
  var sampleUrl = new URL('../data/xauusd-m1-sample.json', scriptUrl).href;
  var core = root.AmyPracticeCore;
  var storage = root.AmyPracticeStorage;
  var samplePromise = null;

  function unpackSample(payload) {
    var candles = core.normalizeCandles((payload && payload.candles) || []);
    return {
      id: 'packaged:XAUUSD:M1',
      symbol: String(payload.symbol || 'XAUUSD').toUpperCase(),
      timeframe: String(payload.baseTimeframe || 'M1').toUpperCase(),
      source: payload.source || 'Packaged sample',
      sampleOnly: true,
      timezone: payload.timezone || 'UTC',
      candles: candles
    };
  }

  function loadSample() {
    if (!samplePromise) {
      samplePromise = fetch(sampleUrl, { cache: 'no-store' })
        .then(function (response) {
          if (!response.ok) throw new Error('Dataset sample tidak dapat dibaca.');
          return response.json();
        })
        .then(unpackSample);
    }
    return samplePromise;
  }

  function timeframeRank(timeframe) {
    return core.timeframeSeconds(timeframe) || Number.MAX_SAFE_INTEGER;
  }

  async function candidates(symbol, targetTimeframe) {
    var requested = String(symbol || 'XAUUSD').toUpperCase();
    var targetSeconds = timeframeRank(targetTimeframe);
    var imported = (await storage.listDatasets()).filter(function (dataset) {
      var seconds = timeframeRank(dataset.timeframe);
      return dataset.symbol === requested && seconds <= targetSeconds && targetSeconds % seconds === 0;
    });
    if (requested === 'XAUUSD') imported.push(await loadSample());
    return imported.filter(function (dataset) {
      var seconds = timeframeRank(dataset.timeframe);
      return seconds <= targetSeconds && targetSeconds % seconds === 0;
    }).sort(function (a, b) {
      if (Boolean(a.sampleOnly) !== Boolean(b.sampleOnly)) return a.sampleOnly ? 1 : -1;
      return timeframeRank(a.timeframe) - timeframeRank(b.timeframe);
    });
  }

  async function sourceFor(symbol, timeframe) {
    var list = await candidates(symbol, timeframe);
    if (!list.length) throw new Error('Dataset lokal untuk symbol/timeframe ini belum tersedia.');
    return list[0];
  }

  async function getCandles(options) {
    options = options || {};
    var timeframe = String(options.timeframe || 'M15').toUpperCase();
    var source = await sourceFor(options.symbol || 'XAUUSD', timeframe);
    var cursor = options.cursor == null ? null : core.finite(options.cursor);
    var candles = cursor == null
      ? core.aggregateCandles(source.candles, timeframe, { sourceTimeframe: source.timeframe })
      : core.visibleCandles(source.candles, cursor, timeframe, source.timeframe);
    return {
      symbol: source.symbol,
      timeframe: timeframe,
      sourceTimeframe: source.timeframe,
      source: source.source,
      sampleOnly: Boolean(source.sampleOnly),
      candles: candles.map(function (candle) { return Object.assign({}, candle); })
    };
  }

  async function getTimeline(options) {
    var result = await getCandles(Object.assign({}, options, { cursor: null }));
    // A replay step represents the latest real source candle visible inside
    // each target bucket. This reveals a completed target candle without ever
    // advancing the global cursor beyond a real source timestamp.
    return result.candles.map(function (candle) { return candle.lastSourceTime == null ? candle.time : candle.lastSourceTime; });
  }

  async function range(options) {
    var result = await getCandles(Object.assign({}, options, { cursor: null }));
    return {
      start: result.candles.length ? result.candles[0].time : null,
      end: result.candles.length ? result.candles[result.candles.length - 1].time : null,
      count: result.candles.length,
      source: result.source,
      sampleOnly: result.sampleOnly
    };
  }

  async function importFile(file, options) {
    options = options || {};
    if (!file) throw new Error('Pilih file CSV atau JSON terlebih dahulu.');
    var text = await file.text();
    var candles;
    if (/\.json$/i.test(file.name || '')) {
      var parsed = JSON.parse(text);
      candles = core.normalizeCandles(Array.isArray(parsed) ? parsed : parsed.candles);
    } else {
      candles = core.parseCsv(text);
    }
    if (candles.length < 20) throw new Error('Dataset harus berisi minimal 20 candle OHLC valid.');
    var symbol = String(options.symbol || 'XAUUSD').toUpperCase();
    var timeframe = String(options.timeframe || 'M1').toUpperCase();
    if (!core.timeframeSeconds(timeframe)) throw new Error('Timeframe dataset tidak didukung.');
    var record = await storage.saveDataset({
      symbol: symbol,
      timeframe: timeframe,
      source: 'Imported local: ' + String(file.name || 'dataset'),
      sampleOnly: false,
      candles: candles,
      rowCount: candles.length,
      start: candles[0].time,
      end: candles[candles.length - 1].time
    });
    return record;
  }

  root.AmyPracticeData = Object.freeze({
    loadSample: loadSample,
    getCandles: getCandles,
    getTimeline: getTimeline,
    range: range,
    importFile: importFile,
    sourceFor: sourceFor
  });
})(typeof window !== 'undefined' ? window : globalThis);
