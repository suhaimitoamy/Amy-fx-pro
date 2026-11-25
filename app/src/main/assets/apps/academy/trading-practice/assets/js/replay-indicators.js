/* Amy FX Backtest Lab — Pure zero-DOM indicator math, Magnet OHLC snap, Measure Ruler & Session Band helpers. */
(function (root) {
  'use strict';

  if (root.AmyReplayIndicators) return;

  function toNum(v) {
    var n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function computeEMA(candles, period) {
    var len = Number(period);
    if (!Array.isArray(candles) || !candles.length || !Number.isFinite(len) || len < 1) return [];
    var k = 2 / (len + 1);
    var out = [];
    var sum = 0;
    var ema = null;

    for (var i = 0; i < candles.length; i += 1) {
      var c = candles[i];
      var close = toNum(c && c.close);
      var time = toNum(c && c.time);
      if (close == null || time == null) continue;

      if (ema == null) {
        sum += close;
        if (i + 1 === len) {
          ema = sum / len;
          out.push({ time: time, value: Math.round(ema * 10000) / 10000 });
        }
      } else {
        ema = close * k + ema * (1 - k);
        out.push({ time: time, value: Math.round(ema * 10000) / 10000 });
      }
    }
    return out;
  }

  function computeBollingerBands(candles, period, multiplier) {
    var len = Math.max(2, Number(period || 20));
    var mult = Number.isFinite(Number(multiplier)) ? Number(multiplier) : 2;
    var upper = [];
    var middle = [];
    var lower = [];
    if (!Array.isArray(candles) || candles.length < len) {
      return { upper: upper, middle: middle, lower: lower };
    }

    var windowCloses = [];
    var sum = 0;
    for (var i = 0; i < candles.length; i += 1) {
      var c = candles[i];
      var close = toNum(c && c.close);
      var time = toNum(c && c.time);
      if (close == null || time == null) continue;

      windowCloses.push(close);
      sum += close;
      if (windowCloses.length > len) {
        sum -= windowCloses.shift();
      }
      if (windowCloses.length === len) {
        var mean = sum / len;
        var sqSum = 0;
        for (var j = 0; j < len; j += 1) {
          var diff = windowCloses[j] - mean;
          sqSum += diff * diff;
        }
        var std = Math.sqrt(sqSum / len);
        var u = mean + mult * std;
        var l = mean - mult * std;
        upper.push({ time: time, value: Math.round(u * 10000) / 10000 });
        middle.push({ time: time, value: Math.round(mean * 10000) / 10000 });
        lower.push({ time: time, value: Math.round(l * 10000) / 10000 });
      }
    }
    return { upper: upper, middle: middle, lower: lower };
  }

  function computeIntradayVWAP(candles) {
    if (!Array.isArray(candles) || !candles.length) return [];
    var out = [];
    var currentDay = null;
    var cumPV = 0;
    var cumVol = 0;

    for (var i = 0; i < candles.length; i += 1) {
      var c = candles[i];
      var time = toNum(c && c.time);
      var high = toNum(c && c.high);
      var low = toNum(c && c.low);
      var close = toNum(c && c.close);
      if (time == null || high == null || low == null || close == null) continue;

      var dayKey = Math.floor(time / 86400);
      if (dayKey !== currentDay) {
        currentDay = dayKey;
        cumPV = 0;
        cumVol = 0;
      }

      var typical = (high + low + close) / 3;
      var rawVol = toNum(c && c.volume);
      var weight = rawVol != null && rawVol > 0 ? rawVol : Math.max(0.05, Math.abs(high - low));
      cumPV += typical * weight;
      cumVol += weight;
      if (cumVol > 0) {
        out.push({ time: time, value: Math.round((cumPV / cumVol) * 10000) / 10000 });
      }
    }
    return out;
  }

  function findNearestCandle(candles, targetTime) {
    if (!Array.isArray(candles) || !candles.length || !Number.isFinite(Number(targetTime))) return null;
    var t = Number(targetTime);
    var low = 0;
    var high = candles.length - 1;
    while (low < high) {
      var mid = (low + high) >> 1;
      if (candles[mid].time < t) low = mid + 1;
      else high = mid;
    }
    var idx = low;
    if (idx > 0 && Math.abs(candles[idx - 1].time - t) < Math.abs(candles[idx].time - t)) {
      idx = idx - 1;
    }
    return { candle: candles[idx], index: idx };
  }

  function snapPointToCandleOHLC(point, candles, mode, priceTolerance) {
    if (!point || !Array.isArray(candles) || !candles.length) return point;
    var normalizedMode = String(mode || 'off').toLowerCase();
    if (normalizedMode !== 'weak' && normalizedMode !== 'strong') {
      return { time: point.time, price: point.price, x: point.x, y: point.y, snapped: false, ohlcKey: null };
    }

    var found = findNearestCandle(candles, point.time);
    if (!found || !found.candle) {
      return { time: point.time, price: point.price, x: point.x, y: point.y, snapped: false, ohlcKey: null };
    }

    var bar = found.candle;
    var candidates = [
      { key: 'high', price: Number(bar.high) },
      { key: 'low', price: Number(bar.low) },
      { key: 'open', price: Number(bar.open) },
      { key: 'close', price: Number(bar.close) }
    ].filter(function (item) { return Number.isFinite(item.price); });

    if (!candidates.length) {
      return { time: point.time, price: point.price, x: point.x, y: point.y, snapped: false, ohlcKey: null };
    }

    var best = candidates[0];
    var bestDiff = Math.abs(point.price - best.price);
    for (var i = 1; i < candidates.length; i += 1) {
      var diff = Math.abs(point.price - candidates[i].price);
      if (diff < bestDiff) {
        best = candidates[i];
        bestDiff = diff;
      }
    }

    var tol = Number.isFinite(Number(priceTolerance)) ? Math.max(0.01, Number(priceTolerance)) : 2.5;
    if (normalizedMode === 'strong' || bestDiff <= tol) {
      return {
        time: Number(bar.time),
        price: best.price,
        x: point.x,
        y: point.y,
        snapped: true,
        ohlcKey: best.key
      };
    }

    return { time: point.time, price: point.price, x: point.x, y: point.y, snapped: false, ohlcKey: null };
  }

  function formatDuration(seconds) {
    var total = Math.max(0, Math.round(Number(seconds || 0)));
    if (total < 60) return total + 'd';
    var mins = Math.round(total / 60);
    if (mins < 60) return mins + 'm';
    var hours = Math.floor(mins / 60);
    var remMins = mins % 60;
    if (hours < 24) return remMins ? (hours + 'j ' + remMins + 'm') : (hours + 'j');
    var days = Math.floor(hours / 24);
    var remHours = hours % 24;
    return remHours ? (days + 'h ' + remHours + 'j') : (days + 'h');
  }

  function computeMeasureStats(a, b, candles, timeframeSeconds) {
    if (!a || !b) return null;
    var p1 = toNum(a.price);
    var p2 = toNum(b.price);
    var t1 = toNum(a.time);
    var t2 = toNum(b.time);
    if (p1 == null || p2 == null || t1 == null || t2 == null) return null;

    var deltaPrice = p2 - p1;
    // XAU/USD standard pip = $0.10 ($1.00 = 10 pips)
    var pips = Math.round(deltaPrice * 100) / 10;
    var pct = p1 !== 0 ? (deltaPrice / p1) * 100 : 0;
    var deltaSeconds = Math.abs(t2 - t1);

    var bars = 0;
    if (Array.isArray(candles) && candles.length > 1) {
      var minT = Math.min(t1, t2);
      var maxT = Math.max(t1, t2);
      var first = findNearestCandle(candles, minT);
      var last = findNearestCandle(candles, maxT);
      if (first && last) {
        bars = Math.abs(last.index - first.index);
      }
    }
    if (!bars && deltaSeconds > 0) {
      var tf = Math.max(60, Number(timeframeSeconds || 900));
      bars = Math.round(deltaSeconds / tf);
    }

    return {
      deltaPrice: deltaPrice,
      pips: pips,
      pct: pct,
      bars: bars,
      deltaSeconds: deltaSeconds,
      durationLabel: formatDuration(deltaSeconds),
      bullish: deltaPrice >= 0
    };
  }

  function classifyUtcSession(unixSec) {
    var hour = new Date(Number(unixSec) * 1000).getUTCHours();
    if (hour >= 0 && hour < 7) return 'Asia';
    if (hour >= 7 && hour < 12) return 'London';
    if (hour >= 12 && hour < 17) return 'New York';
    return null;
  }

  function computeSessionBands(candles) {
    if (!Array.isArray(candles) || !candles.length) return [];
    var bands = [];
    var active = null;

    for (var i = 0; i < candles.length; i += 1) {
      var c = candles[i];
      var t = toNum(c && c.time);
      if (t == null) continue;
      var sess = classifyUtcSession(t);
      var dayKey = Math.floor(t / 86400);
      if (!sess) {
        if (active) {
          bands.push(active);
          active = null;
        }
        continue;
      }
      if (!active || active.session !== sess || active.dayKey !== dayKey) {
        if (active) bands.push(active);
        active = { session: sess, dayKey: dayKey, startTime: t, endTime: t };
      } else {
        active.endTime = t;
      }
    }
    if (active) bands.push(active);
    return bands;
  }

  function resolveCutBarTimestamp(timeline, clickedTime) {
    if (!Array.isArray(timeline) || !timeline.length) return null;
    var target = toNum(clickedTime);
    if (target == null) return timeline[Math.min(5, timeline.length - 1)];

    var minIdx = Math.min(5, timeline.length - 1);
    var low = 0;
    var high = timeline.length - 1;
    while (low < high) {
      var mid = (low + high) >> 1;
      if (timeline[mid] < target) low = mid + 1;
      else high = mid;
    }
    var idx = low;
    if (idx > 0 && Math.abs(timeline[idx - 1] - target) < Math.abs(timeline[idx] - target)) {
      idx = idx - 1;
    }
    idx = Math.max(minIdx, Math.min(timeline.length - 1, idx));
    return timeline[idx];
  }

  root.AmyReplayIndicators = Object.freeze({
    computeEMA: computeEMA,
    computeBollingerBands: computeBollingerBands,
    computeIntradayVWAP: computeIntradayVWAP,
    findNearestCandle: findNearestCandle,
    snapPointToCandleOHLC: snapPointToCandleOHLC,
    formatDuration: formatDuration,
    computeMeasureStats: computeMeasureStats,
    classifyUtcSession: classifyUtcSession,
    computeSessionBands: computeSessionBands,
    resolveCutBarTimestamp: resolveCutBarTimestamp
  });
})(typeof window !== 'undefined' ? window : globalThis);
