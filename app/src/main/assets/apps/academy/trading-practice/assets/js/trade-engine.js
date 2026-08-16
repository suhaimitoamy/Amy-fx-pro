/* Amy FX Trading Practice — manual setup records and simple forward outcome updates. */
(function (root) {
  'use strict';

  if (root.AmyPracticeTrades) return;
  var core = root.AmyPracticeCore;

  function plannedR(bias, entry, stopLoss, takeProfit) {
    var risk = Math.abs(Number(entry) - Number(stopLoss));
    var reward = Math.abs(Number(takeProfit) - Number(entry));
    return risk > 0 && reward > 0 ? reward / risk : null;
  }

  function validate(input) {
    var bias = String(input.bias || 'WAIT').toUpperCase();
    if (!['BUY', 'SELL', 'WAIT'].includes(bias)) throw new Error('Bias harus BUY, SELL, atau WAIT.');
    if (bias === 'WAIT') return { bias: bias, entry: null, stopLoss: null, takeProfit: null };
    var entry = core.finite(input.entry);
    var stopLoss = core.finite(input.stopLoss);
    var takeProfit = core.finite(input.takeProfit);
    if (![entry, stopLoss, takeProfit].every(Number.isFinite)) throw new Error('Entry, Stop Loss, dan Take Profit wajib diisi.');
    if (bias === 'BUY' && !(stopLoss < entry && entry < takeProfit)) throw new Error('Setup BUY wajib memiliki SL < Entry < TP.');
    if (bias === 'SELL' && !(takeProfit < entry && entry < stopLoss)) throw new Error('Setup SELL wajib memiliki TP < Entry < SL.');
    return { bias: bias, entry: entry, stopLoss: stopLoss, takeProfit: takeProfit };
  }

  function create(input) {
    var geometry = validate(input);
    var currentPrice = core.finite(input.currentPrice);
    var activeAtSave = geometry.bias !== 'WAIT' && currentPrice != null && Math.abs(currentPrice - geometry.entry) <= 0.000001;
    return {
      id: input.id || root.AmyPracticeStorage.identifier('trade'),
      symbol: String(input.symbol || 'XAUUSD').toUpperCase(),
      timeframe: String(input.timeframe || 'M15').toUpperCase(),
      replayStartTime: Number(input.replayStartTime || input.tradeTime),
      tradeTime: Number(input.tradeTime),
      bias: geometry.bias,
      entry: geometry.entry,
      stopLoss: geometry.stopLoss,
      takeProfit: geometry.takeProfit,
      result: geometry.bias === 'WAIT' ? 'OPEN' : 'OPEN',
      entryStatus: geometry.bias === 'WAIT' ? 'NOT_APPLICABLE' : (activeAtSave ? 'ACTIVE' : 'WAITING_FILL'),
      entryActivatedAt: activeAtSave ? Number(input.tradeTime) : null,
      plannedR: geometry.bias === 'WAIT' ? null : plannedR(geometry.bias, geometry.entry, geometry.stopLoss, geometry.takeProfit),
      r: null,
      notes: String(input.notes || '').trim(),
      createdAt: Number(input.createdAt || Date.now()),
      updatedAt: Date.now()
    };
  }

  function touched(candle, level) {
    return Number(candle.low) <= Number(level) && Number(candle.high) >= Number(level);
  }

  function evaluate(record, candles) {
    if (!record || record.result !== 'OPEN' || !['BUY', 'SELL'].includes(record.bias)) return record;
    var next = Object.assign({}, record);
    var sequence = core.normalizeCandles(candles).filter(function (candle) { return candle.time > Number(record.tradeTime || 0); });
    for (var i = 0; i < sequence.length; i += 1) {
      var candle = sequence[i];
      if (next.entryStatus !== 'ACTIVE') {
        if (!touched(candle, next.entry)) continue;
        next.entryStatus = 'ACTIVE';
        next.entryActivatedAt = candle.time;
      }
      var stopHit = touched(candle, next.stopLoss);
      var targetHit = touched(candle, next.takeProfit);
      if (stopHit) {
        next.result = 'LOSS';
        next.r = -1;
        next.closedAt = candle.time;
        next.resolution = targetHit ? 'SL_FIRST_AMBIGUOUS_CANDLE' : 'SL_HIT';
        break;
      }
      if (targetHit) {
        next.result = 'WIN';
        next.r = Number(next.plannedR || 0);
        next.closedAt = candle.time;
        next.resolution = 'TP_HIT';
        break;
      }
    }
    next.updatedAt = Date.now();
    return next;
  }

  root.AmyPracticeTrades = Object.freeze({ create: create, validate: validate, evaluate: evaluate, plannedR: plannedR });
})(typeof window !== 'undefined' ? window : globalThis);
