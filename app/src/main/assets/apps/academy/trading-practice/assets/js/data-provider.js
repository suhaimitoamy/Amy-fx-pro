/* Amy FX Backtest Lab — packaged sample + Cloud 2019-2026 + local ZIP/CSV/JSON historical pack provider. */
(function (root) {
  'use strict';

  if (root.AmyPracticeData) return;
  var scriptUrl = (typeof document !== 'undefined' && document.currentScript && document.currentScript.src)
    ? document.currentScript.src
    : (typeof location !== 'undefined' ? location.href : 'http://localhost/');
  var sampleUrl = new URL('../data/xauusd-m1-sample.json', scriptUrl).href;
  var core = root.AmyPracticeCore;
  var storage = root.AmyPracticeStorage;
  var SAMPLE_ID = 'packaged:XAUUSD:M1';
  var SELECTED_KEY = 'amy.practice.v2.selectedSource';
  var samplePromise = null;
  var candleCache = new Map();
  var CACHE_LIMIT = 3;
  var cloudManifestCache = null;

  function formatMonthLabel(timestampSec) {
    var ts = Number(timestampSec || 0);
    if (!ts) return 'Sample Lokal';
    try {
      return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'UTC', month: 'short', year: 'numeric'
      }).format(new Date(ts * 1000));
    } catch (_) {
      return new Date(ts * 1000).toISOString().slice(0, 7);
    }
  }

  function unpackSample(payload) {
    var candles = core.normalizeCandles((payload && payload.candles) || []);
    var start = candles.length ? candles[0].time : null;
    var end = candles.length ? candles[candles.length - 1].time : null;
    var periodLabel = formatMonthLabel(start);
    return {
      id: SAMPLE_ID,
      kind: 'sample',
      symbol: String(payload.symbol || 'XAUUSD').toUpperCase(),
      timeframe: String(payload.baseTimeframe || 'M1').toUpperCase(),
      source: 'Sample Bawaan XAU/USD (' + periodLabel + ')',
      sampleOnly: true,
      timezone: payload.timezone || 'UTC',
      start: start,
      end: end,
      rowCount: candles.length,
      label: 'Sample · ' + periodLabel + ' (' + candles.length.toLocaleString('id-ID') + ' M1)',
      candles: candles
    };
  }

  function loadSample() {
    if (!samplePromise) {
      var candidateUrls = [
        sampleUrl,
        typeof location !== 'undefined' ? new URL('assets/data/xauusd-m1-sample.json', location.href).href : null,
        typeof location !== 'undefined' ? new URL('../data/xauusd-m1-sample.json', location.href).href : null
      ].filter(Boolean);

      samplePromise = (async function () {
        for (var i = 0; i < candidateUrls.length; i += 1) {
          try {
            var resp = await fetch(candidateUrls[i], { cache: 'no-store' });
            if (resp.ok) {
              var json = await resp.json();
              return unpackSample(json);
            }
          } catch (_) {}
        }
        return {
          id: SAMPLE_ID, kind: 'sample', symbol: 'XAUUSD', timeframe: 'M1',
          source: 'Sample Lokal', sampleOnly: true, start: null, end: null, rowCount: 0,
          label: 'Sample Lokal', candles: []
        };
      })();
    }
    return samplePromise;
  }

  function selectedSourceId() {
    try { return localStorage.getItem(SELECTED_KEY) || SAMPLE_ID; }
    catch (_) { return SAMPLE_ID; }
  }

  function setSelectedSourceId(value) {
    var id = String(value || SAMPLE_ID);
    try { localStorage.setItem(SELECTED_KEY, id); } catch (_) {}
    return id;
  }

  function timeframeRank(timeframe) { return core.timeframeSeconds(timeframe) || Number.MAX_SAFE_INTEGER; }

  function sourceLabel(meta) {
    if (meta && meta.sampleOnly) {
      return meta.label || ('Sample · ' + formatMonthLabel(meta.start));
    }
    var date = meta && meta.start ? new Date(Number(meta.start) * 1000) : null;
    var ym = date && Number.isFinite(date.getTime())
      ? date.toISOString().slice(0, 7)
      : 'tanpa tanggal';
    return ym + ' · ' + Number(meta && meta.rowCount || 0).toLocaleString('id-ID') + ' bar (M1–D1)';
  }

  function cachePut(id, value) {
    if (candleCache.has(id)) candleCache.delete(id);
    candleCache.set(id, value);
    while (candleCache.size > CACHE_LIMIT) candleCache.delete(candleCache.keys().next().value);
    return value;
  }

  function cacheDelete(id) { candleCache.delete(id); }

  function compatibleCsv(text) {
    var value = String(text || '').replace(/^\uFEFF/, '');
    var newline = value.indexOf('\n');
    var head = newline >= 0 ? value.slice(0, newline) : value;
    var rest = newline >= 0 ? value.slice(newline) : '';
    head = head.replace(/^(timestamp_utc|datetime_utc|time_utc)(?=,|;|\t)/i, 'timestamp');
    return head + rest;
  }

  function metadataFromCsv(text) {
    var clean = compatibleCsv(text).trim();
    if (!clean) throw new Error('CSV harus berisi header dan minimal 2 candle.');

    var firstNl = clean.indexOf('\n');
    if (firstNl < 0) throw new Error('CSV harus berisi header dan minimal 2 candle.');

    var header = clean.slice(0, firstNl).trim();
    var firstLine = null;
    var lineStart = firstNl + 1;
    var lineEnd = clean.indexOf('\n', lineStart);

    while (lineStart < clean.length) {
      var candidateEnd = lineEnd < 0 ? clean.length : lineEnd;
      var candidate = clean.slice(lineStart, candidateEnd).trim();
      if (candidate.length > 0) {
        firstLine = candidate;
        break;
      }
      if (lineEnd < 0) break;
      lineStart = lineEnd + 1;
      lineEnd = clean.indexOf('\n', lineStart);
    }

    var lastNl = clean.lastIndexOf('\n');
    var lastLine = clean.slice(lastNl + 1).trim();

    if (!firstLine || !lastLine || lastNl <= firstNl) {
      throw new Error('CSV harus berisi header dan minimal 2 candle.');
    }

    var first = core.parseCsv(header + '\n' + firstLine);
    var last = core.parseCsv(header + '\n' + lastLine);
    if (!first.length || !last.length) throw new Error('CSV tidak memiliki candle OHLC valid.');

    var rowCount = 0;
    var prevPos = firstNl;
    var nextPos = clean.indexOf('\n', prevPos + 1);
    while (prevPos !== -1) {
      var end = nextPos === -1 ? clean.length : nextPos;
      var hasContent = false;
      for (var i = prevPos + 1; i < end; i += 1) {
        if (clean.charCodeAt(i) > 32) {
          hasContent = true;
          break;
        }
      }
      if (hasContent) rowCount += 1;
      prevPos = nextPos;
      if (nextPos !== -1) nextPos = clean.indexOf('\n', nextPos + 1);
    }

    if (rowCount < 2) throw new Error('CSV harus berisi header dan minimal 2 candle.');

    return { start: first[0].time, end: last[last.length - 1].time, rowCount: rowCount };
  }

  function metadataFromJson(text) {
    var parsed = JSON.parse(text);
    var candles = core.normalizeCandles(Array.isArray(parsed) ? parsed : parsed && parsed.candles);
    if (candles.length < 20) throw new Error('Dataset JSON harus berisi minimal 20 candle OHLC valid.');
    return { start: candles[0].time, end: candles[candles.length - 1].time, rowCount: candles.length, candles: candles };
  }

  function packMeta(options) {
    var meta = {
      symbol: String(options.symbol || 'XAUUSD').toUpperCase(),
      timeframe: String(options.timeframe || 'M1').toUpperCase(),
      source: options.source,
      fileName: options.fileName,
      format: options.format,
      entryPath: options.entryPath || null,
      start: Number(options.start),
      end: Number(options.end),
      rowCount: Number(options.rowCount || 0),
      size: Number(options.size || 0),
      provenance: options.provenance || options.source,
      repairedAudited: /REPAIRED[_ -]?AUDITED/i.test(String(options.provenance || options.source || options.fileName || '')),
      importedAt: Date.now()
    };
    meta.id = storage.packId(meta);
    meta.label = sourceLabel(meta);
    return meta;
  }

  async function saveZipPack(blob, entry, provenance, timeframe, results) {
    var archive = await root.AmyZipArchive.open(blob);
    var text = await archive.text(entry);
    var info = metadataFromCsv(text);
    var meta = packMeta({
      symbol: 'XAUUSD', timeframe: timeframe || 'M1', source: provenance,
      provenance: provenance, fileName: blob.name || entry.name.replace(/\.csv$/i, '.zip'),
      format: 'zip', entryPath: entry.name,
      start: info.start, end: info.end, rowCount: info.rowCount, size: blob.size
    });
    await storage.saveHistoricalPack(meta, blob);
    results.push(meta);
    return meta;
  }

  async function saveTextPack(blob, options, results) {
    var text = await blob.text();
    var info = options.format === 'json' ? metadataFromJson(text) : metadataFromCsv(text);
    if (info.rowCount < 20) throw new Error('Dataset harus berisi minimal 20 candle OHLC valid.');
    var meta = packMeta({
      symbol: options.symbol || 'XAUUSD', timeframe: options.timeframe || 'M1',
      source: options.source, provenance: options.source, fileName: options.fileName,
      format: options.format, start: info.start, end: info.end, rowCount: info.rowCount, size: blob.size
    });
    await storage.saveHistoricalPack(meta, blob);
    results.push(meta);
    return meta;
  }

  async function scanZip(blob, context, depth, results, onProgress, fallbackTimeframe) {
    if (!root.AmyZipArchive) throw new Error('ZIP reader belum dimuat.');
    if (depth > 5) throw new Error('Struktur ZIP terlalu dalam. Maksimal 5 lapisan.');
    var archive = await root.AmyZipArchive.open(blob);
    var entries = archive.list();
    var csvEntries = entries.filter(root.AmyZipArchive.isM1CsvEntry);
    var detectedTf = 'M1';
    if (!csvEntries.length) {
      csvEntries = entries.filter(root.AmyZipArchive.isCsvEntry);
      detectedTf = fallbackTimeframe || 'M1';
    }

    if (csvEntries.length === 1) {
      if (onProgress) onProgress({ stage: 'validate', fileName: context.name, message: 'Memvalidasi ' + context.name });
      await saveZipPack(blob, csvEntries[0], context.provenance, detectedTf, results);
      if (onProgress) onProgress({ stage: 'saved', fileName: context.name, packCount: results.length, message: results[results.length - 1].label + ' tersimpan' });
      return;
    }

    if (csvEntries.length > 1) {
      for (var m = 0; m < csvEntries.length; m += 1) {
        if (onProgress) onProgress({ stage: 'extract', fileName: csvEntries[m].name, index: m + 1, total: csvEntries.length, message: 'Mengekstrak ' + csvEntries[m].name });
        var csvBytes = await archive.extract(csvEntries[m]);
        var csvBlob = new Blob([csvBytes], { type: 'text/csv' });
        var childSource = context.provenance + ' → ' + csvEntries[m].name;
        await saveTextPack(csvBlob, { symbol: 'XAUUSD', timeframe: detectedTf, source: childSource, fileName: csvEntries[m].name, format: 'csv' }, results);
        if (onProgress) onProgress({ stage: 'saved', fileName: csvEntries[m].name, packCount: results.length, message: results[results.length - 1].label + ' tersimpan' });
        await new Promise(function (resolve) { setTimeout(resolve, 16); });
      }
      return;
    }

    var nested = entries.filter(root.AmyZipArchive.isZipEntry);
    if (!nested.length) throw new Error('Tidak ditemukan file CSV atau ZIP turunan di ' + context.name + '.');
    for (var i = 0; i < nested.length; i += 1) {
      if (onProgress) onProgress({ stage: 'extract', fileName: nested[i].name, message: 'Membuka ' + nested[i].name });
      var bytes = await archive.extract(nested[i]);
      var childBlob = new Blob([bytes], { type: 'application/zip' });
      try { Object.defineProperty(childBlob, 'name', { value: nested[i].name }); } catch (_) {}
      await scanZip(childBlob, {
        name: nested[i].name,
        provenance: context.provenance + ' → ' + nested[i].name
      }, depth + 1, results, onProgress, fallbackTimeframe);
      await new Promise(function (resolve) { setTimeout(resolve, 16); });
    }
  }

  async function importFiles(files, options, onProgress) {
    options = options || {};
    var list = Array.prototype.slice.call(files || []);
    if (!list.length) throw new Error('Pilih file ZIP, CSV, atau JSON terlebih dahulu.');
    var results = [];
    for (var i = 0; i < list.length; i += 1) {
      var file = list[i];
      var name = String(file.name || 'dataset-' + (i + 1));
      if (onProgress) onProgress({ stage: 'file', fileName: name, index: i + 1, total: list.length, message: 'Memproses ' + name });
      if (/\.zip$/i.test(name) || file.type === 'application/zip') {
        await scanZip(file, { name: name, provenance: name }, 0, results, onProgress, options.timeframe || 'M1');
      } else if (/\.json$/i.test(name) || file.type === 'application/json') {
        await saveTextPack(file, { symbol: options.symbol || 'XAUUSD', timeframe: options.timeframe || 'M1', source: 'Impor lokal: ' + name, fileName: name, format: 'json' }, results);
      } else {
        await saveTextPack(file, { symbol: options.symbol || 'XAUUSD', timeframe: options.timeframe || 'M1', source: 'Impor lokal: ' + name, fileName: name, format: 'csv' }, results);
      }
      await new Promise(function (resolve) { setTimeout(resolve, 0); });
    }
    if (!results.length) throw new Error('Tidak ada pack candle yang berhasil ditemukan.');
    return results;
  }

  async function loadPackCandles(id) {
    if (candleCache.has(id)) return candleCache.get(id);
    var stored = await storage.loadHistoricalPack(id);
    if (!stored) throw new Error('Pack historis tidak ditemukan di perangkat.');
    var meta = stored.meta;
    var text;
    var candles;
    if (meta.format === 'zip') {
      if (!root.AmyZipArchive) throw new Error('ZIP reader belum dimuat.');
      var archive = await root.AmyZipArchive.open(stored.blob);
      text = await archive.text(meta.entryPath);
      candles = core.parseCsv(compatibleCsv(text));
    } else if (meta.format === 'json') {
      text = await stored.blob.text();
      var parsed = JSON.parse(text);
      candles = core.normalizeCandles(Array.isArray(parsed) ? parsed : parsed && parsed.candles);
    } else {
      text = await stored.blob.text();
      candles = core.parseCsv(compatibleCsv(text));
    }
    if (candles.length < 20) throw new Error('Pack historis rusak atau tidak lagi memiliki candle valid.');
    return cachePut(id, {
      id: id, kind: 'pack', symbol: meta.symbol, timeframe: meta.timeframe,
      source: meta.source, sampleOnly: false, start: meta.start, end: meta.end,
      rowCount: meta.rowCount, candles: candles, aggregatedByTf: {}
    });
  }

  async function listSources(symbol) {
    var requested = String(symbol || 'XAUUSD').toUpperCase();
    var sample = null;
    try { sample = await loadSample(); } catch (_) {}
    var packs = [];
    try {
      packs = (await storage.listHistoricalPacks()).filter(function (item) { return item.symbol === requested; }).map(function (item) {
        return Object.assign({ kind: 'pack', sampleOnly: false }, item);
      });
    } catch (_) {}
    var output = [];
    if (sample && sample.symbol === requested && (sample.rowCount > 0 || !packs.length)) {
      output.push({
        id: sample.id, kind: 'sample', symbol: sample.symbol, timeframe: sample.timeframe,
        source: sample.source, sampleOnly: true, start: sample.start, end: sample.end,
        rowCount: sample.rowCount, label: sample.label
      });
    }
    return output.concat(packs);
  }

  async function resolveSource(symbol, sourceId) {
    var id = String(sourceId || selectedSourceId() || SAMPLE_ID);
    if (id === SAMPLE_ID) {
      var s = await loadSample();
      if (!s.aggregatedByTf) s.aggregatedByTf = {};
      return s;
    }
    if (id.indexOf('pack:') === 0) return loadPackCandles(id);
    setSelectedSourceId(SAMPLE_ID);
    var fallback = await loadSample();
    if (!fallback.aggregatedByTf) fallback.aggregatedByTf = {};
    return fallback;
  }

  async function sourceFor(symbol, timeframe, sourceId) {
    var targetSeconds = timeframeRank(timeframe);
    var source = await resolveSource(symbol, sourceId);
    var sourceSeconds = timeframeRank(source.timeframe || 'M1');
    if (sourceSeconds > targetSeconds || targetSeconds % sourceSeconds !== 0) {
      throw new Error('Pack ' + (source.timeframe || 'M1') + ' tidak dapat dipakai untuk ' + timeframe + '.');
    }
    return source;
  }

  function fullAggregated(source, timeframe) {
    if (!source.aggregatedByTf) source.aggregatedByTf = {};
    if (!source.aggregatedByTf[timeframe]) {
      source.aggregatedByTf[timeframe] = core.aggregateCandles(source.candles, timeframe, {
        sourceTimeframe: source.timeframe,
        trustedSeries: true
      });
    }
    return source.aggregatedByTf[timeframe];
  }

  // Fast O(log n) visible candle slice for replay playback (eliminates full-dataset re-aggregation on every step!)
  function fastVisibleCandles(source, timeframe, cursor) {
    var tfSec = core.timeframeSeconds(timeframe);
    var srcSec = core.timeframeSeconds(source.timeframe || 'M1');
    var full = fullAggregated(source, timeframe);
    if (cursor == null) return full.slice();

    if (tfSec === srcSec) {
      var lo = 0, hi = full.length;
      while (lo < hi) {
        var mid = (lo + hi) >> 1;
        if (full[mid].time <= cursor) lo = mid + 1;
        else hi = mid;
      }
      return full.slice(0, lo);
    }

    // Binary search last fully completed bar where lastSourceTime <= cursor
    var l = 0, h = full.length;
    while (l < h) {
      var m = (l + h) >> 1;
      var lastTs = full[m].lastSourceTime != null ? full[m].lastSourceTime : full[m].time;
      if (lastTs <= cursor) l = m + 1;
      else h = m;
    }
    var result = full.slice(0, l);

    // Check if next bar is partially formed at cursor (intra-candle MTF parity without future leak)
    if (l < full.length && full[l].time <= cursor) {
      var bucketStart = full[l].time;
      var src = source.candles;
      var sLo = 0, sHi = src.length;
      while (sLo < sHi) {
        var sm = (sLo + sHi) >> 1;
        if (src[sm].time < bucketStart) sLo = sm + 1;
        else sHi = sm;
      }
      var partial = null;
      for (var k = sLo; k < src.length; k += 1) {
        var c = src[k];
        if (c.time > cursor) break;
        if (!partial) {
          partial = {
            time: bucketStart, open: c.open, high: c.high, low: c.low, close: c.close,
            sourceCount: 1, lastSourceTime: c.time
          };
        } else {
          if (c.high > partial.high) partial.high = c.high;
          if (c.low < partial.low) partial.low = c.low;
          partial.close = c.close;
          partial.sourceCount += 1;
          partial.lastSourceTime = c.time;
        }
      }
      if (partial) result.push(partial);
    }

    return result;
  }

  async function getCandles(options) {
    options = options || {};
    var timeframe = String(options.timeframe || 'M15').toUpperCase();
    var source = await sourceFor(options.symbol || 'XAUUSD', timeframe, options.sourceId);
    var cursor = options.cursor == null ? null : core.finite(options.cursor);
    var candles = fastVisibleCandles(source, timeframe, cursor);
    return {
      sourceId: source.id,
      symbol: source.symbol,
      timeframe: timeframe,
      sourceTimeframe: source.timeframe,
      source: source.source,
      sampleOnly: Boolean(source.sampleOnly),
      start: source.start,
      end: source.end,
      rowCount: source.rowCount || source.candles.length,
      candles: candles
    };
  }

  async function getTimeline(options) {
    var result = await getCandles(Object.assign({}, options, { cursor: null }));
    return result.candles.map(function (candle) { return candle.lastSourceTime == null ? candle.time : candle.lastSourceTime; });
  }

  async function deleteSource(id) {
    if (String(id || '').indexOf('pack:') !== 0) return false;
    await storage.deleteHistoricalPack(id);
    cacheDelete(id);
    if (selectedSourceId() === id) setSelectedSourceId(SAMPLE_ID);
    return true;
  }

  function cloudApiBase() {
    if (typeof location !== 'undefined') {
      var proto = String(location.protocol || '').toLowerCase();
      var host = String(location.hostname || '').toLowerCase();
      // On any HTTP/HTTPS deployment (localhost, Vercel, preview URL), always use relative /api/candles
      if ((proto === 'http:' || proto === 'https:') && host && host !== 'appassets.androidplatform.net') {
        return '/api/candles';
      }
    }
    return 'https://amy-fx.vercel.app/api/candles';
  }

  async function loadCloudManifest() {
    if (cloudManifestCache) return cloudManifestCache;
    try {
      var resp = await fetch(cloudApiBase() + '?manifest=1');
      if (resp.ok) {
        cloudManifestCache = await resp.json();
        return cloudManifestCache;
      }
    } catch (_) {}
    return null;
  }

  async function downloadSingleCloudZip(fileName, provenance, onProgress, results) {
    var resp = await fetch(cloudApiBase() + '?file=' + encodeURIComponent(fileName));
    if (!resp.ok) {
      throw new Error('Gagal mengunduh ' + fileName + ' dari Cloud (HTTP ' + resp.status + ').');
    }
    var blob = await resp.blob();
    try { Object.defineProperty(blob, 'name', { value: fileName }); } catch (_) {}
    await scanZip(blob, { name: fileName, provenance: provenance }, 0, results, onProgress, 'M1');
  }

  // Safe cloud pack installer: for ALL months, downloads monthly ZIPs sequentially (~425KB each)
  // so it NEVER exceeds Vercel's 4.5MB serverless payload limit!
  async function installCloudPack(year, monthOption, onProgress) {
    if (!root.AmyZipArchive) throw new Error('ZIP reader belum dimuat.');
    var results = [];
    var y = String(year || '2025');

    if (!monthOption || monthOption === 'ALL') {
      var manifest = await loadCloudManifest();
      var months = manifest && Array.isArray(manifest[y]) ? manifest[y] : null;
      if (months && months.length) {
        for (var i = 0; i < months.length; i += 1) {
          var item = months[i];
          if (onProgress) {
            onProgress({
              stage: 'download',
              index: i + 1,
              total: months.length,
              message: 'Mengunduh bulan ' + (i + 1) + '/' + months.length + ': ' + item.label + ' (' + item.sizeKb + ' KB)…'
            });
          }
          await downloadSingleCloudZip(item.file, 'Cloud XAUUSD ' + y + ' (' + item.label + ')', onProgress, results);
          await new Promise(function (resolve) { setTimeout(resolve, 25); });
        }
        if (onProgress) onProgress({ stage: 'done', packCount: results.length, message: results.length + ' pack bulanan ' + y + ' berhasil dipasang!' });
        return results;
      }
      // Fallback if manifest unavailable
      var fallbackFile = 'XAUUSD_' + y + '_MONTHLY_ARCHIVES_REPAIRED_AUDITED.zip';
      if (onProgress) onProgress({ stage: 'download', message: 'Mengunduh ' + fallbackFile + '…' });
      await downloadSingleCloudZip(fallbackFile, 'Cloud XAUUSD ' + y + ' (Tahun Penuh)', onProgress, results);
      if (onProgress) onProgress({ stage: 'done', packCount: results.length, message: results.length + ' pack berhasil dipasang!' });
      return results;
    }

    var fileName = String(monthOption);
    if (onProgress) onProgress({ stage: 'download', message: 'Mengunduh ' + fileName + ' dari Cloud…' });
    await downloadSingleCloudZip(fileName, 'Cloud XAUUSD ' + y + ' (' + fileName + ')', onProgress, results);
    if (onProgress) onProgress({ stage: 'done', packCount: results.length, message: results.length + ' pack berhasil dipasang!' });
    return results;
  }

  root.AmyPracticeData = Object.freeze({
    SAMPLE_ID: SAMPLE_ID,
    loadSample: loadSample,
    listSources: listSources,
    selectedSourceId: selectedSourceId,
    setSelectedSourceId: setSelectedSourceId,
    getCandles: getCandles,
    getTimeline: getTimeline,
    importFiles: importFiles,
    deleteSource: deleteSource,
    sourceFor: sourceFor,
    sourceLabel: sourceLabel,
    cloudApiBase: cloudApiBase,
    loadCloudManifest: loadCloudManifest,
    installCloudPack: installCloudPack
  });
})(typeof window !== 'undefined' ? window : globalThis);
