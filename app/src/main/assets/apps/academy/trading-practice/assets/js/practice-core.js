/* Amy FX Backtest Lab — pure candle, ICT session (DST-aware), and zero-future-leak primitives. */
(function (root) {
  'use strict';

  if (root.AmyPracticeCore) return;

  var TIMEFRAME_SECONDS = Object.freeze({
    M1: 60,
    M5: 300,
    M15: 900,
    M30: 1800,
    H1: 3600,
    H4: 14400,
    D1: 86400
  });

  var nyFormatter = null;
  var witaFormatterDate = null;
  var witaFormatterTime = null;

  function getNyFormatter() {
    if (!nyFormatter) {
      nyFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
    }
    return nyFormatter;
  }

  function finite(value) {
    if (value == null || value === '') return null;
    var number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function parseTime(value) {
    if (typeof value === 'number' || /^\d+(?:\.\d+)?$/.test(String(value || '').trim())) {
      var numeric = Number(value);
      if (!Number.isFinite(numeric)) return null;
      return Math.floor(numeric > 100000000000 ? numeric / 1000 : numeric);
    }
    var text = String(value || '').trim();
    if (!text) return null;
    var normalized = text.indexOf('T') >= 0 ? text : text.replace(' ', 'T');
    if (!/[zZ]|[+-]\d\d:?\d\d$/.test(normalized)) normalized += 'Z';
    var millis = Date.parse(normalized);
    return Number.isFinite(millis) ? Math.floor(millis / 1000) : null;
  }

  function normalizeCandle(input) {
    if (!input) return null;
    if (input.isSynthetic === true || input.synthetic === true || input.isClosed === false) return null;
    var isArray = Array.isArray(input);
    var time = parseTime(isArray ? input[0] : (input.time ?? input.timestamp ?? input.datetime ?? input.open_time));
    var open = finite(isArray ? input[1] : input.open);
    var high = finite(isArray ? input[2] : input.high);
    var low = finite(isArray ? input[3] : input.low);
    var close = finite(isArray ? input[4] : input.close);
    if (![time, open, high, low, close].every(Number.isFinite)) return null;
    if (high < low || high < Math.max(open, close) || low > Math.min(open, close)) return null;
    return { time: time, open: open, high: high, low: low, close: close };
  }

  function normalizeCandles(items) {
    var byTime = new Map();
    (Array.isArray(items) ? items : []).forEach(function (item) {
      var candle = normalizeCandle(item);
      if (candle) byTime.set(candle.time, candle);
    });
    return Array.from(byTime.values()).sort(function (a, b) { return a.time - b.time; });
  }

  function timeframeSeconds(timeframe) {
    return TIMEFRAME_SECONDS[String(timeframe || '').toUpperCase()] || null;
  }

  function nyParts(timestampSec) {
    try {
      var parts = getNyFormatter().formatToParts(new Date(timestampSec * 1000));
      var vals = {};
      for (var i = 0; i < parts.length; i += 1) vals[parts[i].type] = parts[i].value;
      var hour = parseInt(vals.hour, 10);
      if (hour === 24) hour = 0;
      return {
        year: parseInt(vals.year, 10),
        month: parseInt(vals.month, 10),
        day: parseInt(vals.day, 10),
        hour: hour,
        minute: parseInt(vals.minute, 10)
      };
    } catch (_) {
      var d = new Date((timestampSec - 5 * 3600) * 1000);
      return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        hour: d.getUTCHours(),
        minute: d.getUTCMinutes()
      };
    }
  }

  // DST-aware ICT trading day key (rolls at 17:00 America/New_York)
  function nyTradingDayKey(timestampSec) {
    var p = nyParts(timestampSec);
    var dt = new Date(Date.UTC(p.year, p.month - 1, p.hour >= 17 ? p.day + 1 : p.day));
    return dt.toISOString().slice(0, 10);
  }

  function nyTradingDayBucket(timestampSec) {
    try {
      var p = nyParts(timestampSec);
      var startDay = p.hour >= 17 ? p.day : p.day - 1;
      var guess = Date.UTC(p.year, p.month - 1, startDay, 17, 0, 0);
      for (var attempt = 0; attempt < 3; attempt += 1) {
        var chk = nyParts(Math.floor(guess / 1000));
        var diffMin = (17 * 60) - (chk.hour * 60 + chk.minute);
        if (diffMin === 0) break;
        guess += diffMin * 60000;
      }
      return Math.floor(guess / 1000);
    } catch (_) {
      var off = 17 * 3600;
      return Math.floor((timestampSec - off) / 86400) * 86400 + off;
    }
  }

  // DST-aware ICT Killzone / Session classifier (America/New_York)
  // Asia: 20:00–00:59 NY | London: 02:00–06:59 NY | New York: 07:00–15:59 NY | Other: rollover/deadzone
  function classifyIctSession(timestampSec) {
    var ts = finite(timestampSec);
    if (ts == null) return 'Other';
    var p = nyParts(ts);
    var h = p.hour;
    if (h >= 20 || h < 2) return 'Asia';
    if (h >= 2 && h < 7) return 'London';
    if (h >= 7 && h < 16) return 'New York';
    return 'Other';
  }

  // Find next cursor timestamp in timeline that enters targetSession killzone open
  // targetSession: 'Asia' (20:00 NY), 'London' (02:00 NY), 'New York' (08:00 NY)
  function findNextKillzoneCursor(timeline, currentCursor, targetSession) {
    if (!Array.isArray(timeline) || !timeline.length) return null;
    var target = String(targetSession || 'London').toLowerCase();
    var targetStartHour = target === 'asia' ? 20 : (target === 'new york' || target === 'ny' ? 8 : 2);
    var targetEndHour = target === 'asia' ? 23 : (target === 'new york' || target === 'ny' ? 11 : 5);

    var cur = finite(currentCursor);
    var startIdx = 0;
    if (cur != null) {
      var lo = 0, hi = timeline.length;
      while (lo < hi) {
        var mid = (lo + hi) >> 1;
        if (timeline[mid] <= cur) lo = mid + 1;
        else hi = mid;
      }
      startIdx = lo;
    }

    var currentDayKey = cur != null ? nyTradingDayKey(cur) : null;
    var curParts = cur != null ? nyParts(cur) : null;
    var alreadyInside = Boolean(curParts && curParts.hour >= targetStartHour && curParts.hour <= targetEndHour);

    for (var i = startIdx; i < timeline.length; i += 1) {
      var ts = timeline[i];
      var p = nyParts(ts);
      if (p.hour >= targetStartHour && p.hour <= targetEndHour) {
        if (alreadyInside && nyTradingDayKey(ts) === currentDayKey) continue;
        return ts;
      }
    }
    return null;
  }

  // Pure zero-future-leak ICT reference levels strictly from candles <= cursor
  // Returns PDH, PDL (previous NY trading day), Asia High, Asia Low (20:00–00:00 NY of current day)
  function computeReplayIctLevels(candles, cursor) {
    if (!Array.isArray(candles) || !candles.length) return [];
    var safeCursor = finite(cursor);
    var currentDay = null;
    var prevDay = null;
    var daysOrder = [];
    var dayStats = {};
    var asiaByDay = {};

    for (var i = 0; i < candles.length; i += 1) {
      var c = candles[i];
      if (!c) continue;
      var ts = Number(c.lastSourceTime != null ? c.lastSourceTime : c.time);
      if (safeCursor != null && (c.time > safeCursor || ts > safeCursor)) break;

      var dayKey = nyTradingDayKey(c.time);
      if (!dayStats[dayKey]) {
        dayStats[dayKey] = { high: c.high, low: c.low };
        daysOrder.push(dayKey);
      } else {
        if (c.high > dayStats[dayKey].high) dayStats[dayKey].high = c.high;
        if (c.low < dayStats[dayKey].low) dayStats[dayKey].low = c.low;
      }

      var p = nyParts(c.time);
      if (p.hour >= 20 && p.hour <= 23) {
        if (!asiaByDay[dayKey]) {
          asiaByDay[dayKey] = { high: c.high, low: c.low };
        } else {
          if (c.high > asiaByDay[dayKey].high) asiaByDay[dayKey].high = c.high;
          if (c.low < asiaByDay[dayKey].low) asiaByDay[dayKey].low = c.low;
        }
      }
    }

    if (!daysOrder.length) return [];
    currentDay = daysOrder[daysOrder.length - 1];
    prevDay = daysOrder.length >= 2 ? daysOrder[daysOrder.length - 2] : null;

    var levels = [];
    if (prevDay && dayStats[prevDay]) {
      levels.push({ id: 'pdh', type: 'pdh', price: dayStats[prevDay].high, title: 'PDH' });
      levels.push({ id: 'pdl', type: 'pdl', price: dayStats[prevDay].low, title: 'PDL' });
    }
    var asia = asiaByDay[currentDay] || (prevDay ? asiaByDay[prevDay] : null);
    if (asia) {
      levels.push({ id: 'asiaH', type: 'asia', price: asia.high, title: 'Asia H' });
      levels.push({ id: 'asiaL', type: 'asia', price: asia.low, title: 'Asia L' });
    }
    return levels;
  }

  function aggregateCandles(items, targetTimeframe, options) {
    options = options || {};
    var targetSeconds = timeframeSeconds(targetTimeframe);
    var sourceSeconds = timeframeSeconds(options.sourceTimeframe || 'M1');
    if (!targetSeconds || !sourceSeconds || targetSeconds < sourceSeconds || targetSeconds % sourceSeconds !== 0) {
      throw new Error('Timeframe tidak dapat diagregasi dari sumber yang dipilih.');
    }
    var cursor = finite(options.cursor);
    var normalized;
    if (options.trustedSeries === true && Array.isArray(items)) {
      normalized = items;
      if (cursor != null) {
        var low = 0;
        var high = normalized.length;
        while (low < high) {
          var mid = (low + high) >> 1;
          if (normalized[mid].time <= cursor) low = mid + 1;
          else high = mid;
        }
        normalized = normalized.slice(0, low);
      }
    } else {
      normalized = normalizeCandles(items).filter(function (candle) {
        return cursor == null || candle.time <= cursor;
      });
    }
    if (targetSeconds === sourceSeconds) {
      return normalized.map(function (candle) {
        return { time: candle.time, open: candle.open, high: candle.high, low: candle.low, close: candle.close };
      });
    }

    var output = [];
    var current = null;
    var isD1 = String(targetTimeframe || '').toUpperCase() === 'D1';
    var useNyDst = isD1 && options.nyCloseDst === true;
    var offset = isD1 ? 17 * 3600 : 0;
    for (var i = 0; i < normalized.length; i += 1) {
      var candle = normalized[i];
      var bucket = useNyDst
        ? nyTradingDayBucket(candle.time)
        : (Math.floor((candle.time - offset) / targetSeconds) * targetSeconds + offset);
      if (!current || current.time !== bucket) {
        if (current) output.push(current);
        current = {
          time: bucket,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          sourceCount: 1,
          lastSourceTime: candle.time
        };
      } else {
        if (candle.high > current.high) current.high = candle.high;
        if (candle.low < current.low) current.low = candle.low;
        current.close = candle.close;
        current.sourceCount += 1;
        current.lastSourceTime = candle.time;
      }
    }
    if (current) output.push(current);
    return output;
  }

  function visibleCandles(items, cursor, timeframe, sourceTimeframe, options) {
    var safeCursor = finite(cursor);
    if (safeCursor == null) return [];
    var opts = Object.assign({}, options, {
      sourceTimeframe: sourceTimeframe || 'M1',
      cursor: safeCursor
    });
    var visible = aggregateCandles(items, timeframe, opts);
    if (visible.length) {
      var tail = visible[visible.length - 1];
      if ((tail.lastSourceTime != null && tail.lastSourceTime > safeCursor) || tail.time > safeCursor) {
        throw new Error('Replay invariant gagal: future candle terdeteksi.');
      }
    }
    return visible;
  }

  function nearestCandle(candles, time) {
    var target = finite(time);
    if (target == null || !Array.isArray(candles) || candles.length === 0) return null;
    var best = candles[0];
    var distance = Math.abs(best.time - target);
    for (var i = 1; i < candles.length; i += 1) {
      var nextDistance = Math.abs(candles[i].time - target);
      if (nextDistance < distance) {
        best = candles[i];
        distance = nextDistance;
      }
    }
    return best;
  }

  function parseCsv(text) {
    var str = String(text || '').replace(/^\uFEFF/, '').trim();
    if (!str) return [];
    var len = str.length;
    var firstNl = str.indexOf('\n');
    if (firstNl < 0) return [];
    var headerLine = str.slice(0, firstNl).trim();
    if (!headerLine) return [];

    var delimiter = headerLine.indexOf(';') >= 0 ? ';' : (headerLine.indexOf('\t') >= 0 ? '\t' : ',');
    var headers = headerLine.split(delimiter).map(function (value) { return value.trim().toLowerCase(); });
    function indexOf(names) {
      for (var i = 0; i < names.length; i += 1) {
        var index = headers.indexOf(names[i]);
        if (index >= 0) return index;
      }
      return -1;
    }
    var indexes = {
      time: indexOf(['datetime', 'timestamp', 'time', 'date', 'open_time']),
      open: indexOf(['open', 'o']),
      high: indexOf(['high', 'h']),
      low: indexOf(['low', 'l']),
      close: indexOf(['close', 'c'])
    };
    if (Object.keys(indexes).some(function (key) { return indexes[key] < 0; })) {
      throw new Error('CSV wajib memiliki kolom datetime/time, open, high, low, close.');
    }

    var candles = [];
    var pos = firstNl + 1;
    while (pos < len) {
      var nextNl = str.indexOf('\n', pos);
      var end = nextNl < 0 ? len : nextNl;
      var line = str.slice(pos, end).trim();
      if (line.length > 0) {
        var cells = line.split(delimiter);
        candles.push({
          time: cells[indexes.time],
          open: cells[indexes.open],
          high: cells[indexes.high],
          low: cells[indexes.low],
          close: cells[indexes.close]
        });
      }
      if (nextNl < 0) break;
      pos = nextNl + 1;
    }
    return normalizeCandles(candles);
  }

  function formatWita(timestamp, includeDate) {
    var value = finite(timestamp);
    if (value == null) return '—';
    try {
      if (includeDate) {
        if (!witaFormatterDate) {
          witaFormatterDate = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Makassar',
            year: 'numeric', month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
          });
        }
        return witaFormatterDate.format(new Date(value * 1000)) + ' WITA';
      }
      if (!witaFormatterTime) {
        witaFormatterTime = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Makassar',
          hour: '2-digit', minute: '2-digit', hour12: false
        });
      }
      return witaFormatterTime.format(new Date(value * 1000)) + ' WITA';
    } catch (_) {
      return new Date(value * 1000).toISOString();
    }
  }

  function price(value) {
    var number = finite(value);
    return number == null ? '—' : number.toFixed(2);
  }

  root.AmyPracticeCore = Object.freeze({
    TIMEFRAME_SECONDS: TIMEFRAME_SECONDS,
    finite: finite,
    parseTime: parseTime,
    normalizeCandle: normalizeCandle,
    normalizeCandles: normalizeCandles,
    timeframeSeconds: timeframeSeconds,
    aggregateCandles: aggregateCandles,
    visibleCandles: visibleCandles,
    nearestCandle: nearestCandle,
    parseCsv: parseCsv,
    formatWita: formatWita,
    price: price,
    nyParts: nyParts,
    nyTradingDayKey: nyTradingDayKey,
    nyTradingDayBucket: nyTradingDayBucket,
    classifyIctSession: classifyIctSession,
    findNextKillzoneCursor: findNextKillzoneCursor,
    computeReplayIctLevels: computeReplayIctLevels
  });
})(typeof window !== 'undefined' ? window : globalThis);
