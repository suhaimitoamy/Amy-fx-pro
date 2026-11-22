/* Amy FX Backtest Lab — pure trade execution, gap-safe evaluation, BE, partial close, & Akun Pro PnL math. */
(function (root) {
  'use strict';

  if (root.AmyPracticeTrades) return;
  var core = root.AmyPracticeCore;
  var CONTRACT_OZ = 100; // Pro Standard 1.00 lot = 100 oz XAU/USD (never Cent)

  function round2(v) { return Math.round(Number(v || 0) * 100) / 100; }

  function plannedR(bias, entry, stopLoss, takeProfit) {
    var risk = Math.abs(Number(entry) - Number(stopLoss));
    var reward = Math.abs(Number(takeProfit) - Number(entry));
    return risk > 0 && reward > 0 ? round2(reward / risk) : null;
  }

  function requiredNumber(value) {
    if (value == null || String(value).trim() === '') return null;
    return core.finite(value);
  }

  function stableKey(value) {
    var text = String(value || 'local');
    var hash = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function decisionId(input) {
    var symbol = String(input.symbol || 'XAUUSD').toUpperCase().replace(/[^A-Z0-9]/g, '');
    var timeframe = String(input.timeframe || 'M15').toUpperCase().replace(/[^A-Z0-9]/g, '');
    var suffix = input.nonce ? ('-' + String(input.nonce)) : '';
    return 'decision-' + symbol + '-' + timeframe + '-' + Math.round(Number(input.tradeTime || 0)) + '-' + stableKey(input.sourceId) + suffix;
  }

  function computeLotFromRisk(balanceUsd, riskPercent, entry, stopLoss) {
    var bal = Math.max(0, Number(balanceUsd) || 0);
    var pct = Math.max(0.05, Math.min(20, Number(riskPercent) || 1));
    var dist = Math.abs(Number(entry) - Number(stopLoss));
    if (!Number.isFinite(dist) || dist <= 0 || bal <= 0) return 0.01;
    var riskUsd = bal * (pct / 100);
    var rawLot = riskUsd / (dist * CONTRACT_OZ);
    return Math.max(0.01, Math.min(50, Math.floor(rawLot * 100) / 100));
  }

  function validate(input) {
    var bias = String(input.bias || 'WAIT').toUpperCase();
    if (!['BUY', 'SELL', 'WAIT'].includes(bias)) throw new Error('Keputusan harus BUY, SELL, atau WAIT.');
    if (bias === 'WAIT') return { bias: bias, entry: null, stopLoss: null, takeProfit: null };
    var entry = requiredNumber(input.entry);
    var stopLoss = requiredNumber(input.stopLoss);
    var takeProfit = requiredNumber(input.takeProfit);
    if (![entry, stopLoss, takeProfit].every(Number.isFinite)) throw new Error('Entry, Stop Loss, dan Take Profit wajib diisi.');
    if (bias === 'BUY' && !(stopLoss < entry && entry < takeProfit)) throw new Error('Setup BUY wajib memiliki SL < Entry < TP.');
    if (bias === 'SELL' && !(takeProfit < entry && entry < stopLoss)) throw new Error('Setup SELL wajib memiliki TP < Entry < SL.');
    return { bias: bias, entry: entry, stopLoss: stopLoss, takeProfit: takeProfit };
  }

  function calculateExecutionFriction(bias, entryPrice, candle, options) {
    options = options || {};
    if (!Number.isFinite(entryPrice)) return { fillPrice: entryPrice, spreadPips: 0, slippagePips: 0, frictionCost: 0 };
    var candleRange = (candle && Number.isFinite(candle.high) && Number.isFinite(candle.low))
      ? Math.max(0.1, Number(candle.high) - Number(candle.low))
      : 2.0;
    var isVolatile = candleRange > 4.0;
    var customSpreadUsd = core.finite(options.spreadUsd);
    var spreadPoints = customSpreadUsd != null && customSpreadUsd >= 0
      ? customSpreadUsd
      : (isVolatile ? 0.45 : 0.20);
    var baseSpreadPips = round2(spreadPoints * 10);

    var isMarket = Boolean(options.isMarket);
    var slippagePips = isMarket ? ((candleRange > 6.0 ? 1.5 : 0.5) * (options.slippageFactor !== undefined ? options.slippageFactor : 1.0)) : 0;
    var slippagePoints = slippagePips * 0.10;

    var rawFill = entryPrice;
    if (bias === 'BUY') rawFill = round2(entryPrice + (spreadPoints / 2) + slippagePoints);
    else if (bias === 'SELL') rawFill = round2(entryPrice - (spreadPoints / 2) - slippagePoints);

    // Guard: friction must never push fillPrice past SL or TP on creation
    var sl = core.finite(options.stopLoss);
    var tp = core.finite(options.takeProfit);
    if (bias === 'BUY') {
      if (tp != null && rawFill >= tp) rawFill = round2(Math.max(entryPrice, tp - 0.01));
      if (sl != null && rawFill <= sl) rawFill = entryPrice;
    } else if (bias === 'SELL') {
      if (tp != null && rawFill <= tp) rawFill = round2(Math.min(entryPrice, tp + 0.01));
      if (sl != null && rawFill >= sl) rawFill = entryPrice;
    }

    return {
      fillPrice: rawFill,
      spreadPips: baseSpreadPips,
      slippagePips: round2(slippagePips),
      frictionCost: round2(Math.abs(rawFill - entryPrice))
    };
  }

  function create(input) {
    var geometry = validate(input);
    var currentPrice = core.finite(input.currentPrice);
    var requestedType = String(input.orderType || '').toUpperCase();
    var isMarket = requestedType === 'MARKET' ||
      (requestedType !== 'LIMIT' && currentPrice != null && geometry.entry != null && Math.abs(currentPrice - geometry.entry) <= 0.25);
    var activeAtSave = geometry.bias !== 'WAIT' && isMarket;
    var tradeTime = Number(input.tradeTime);
    if (!Number.isFinite(tradeTime)) throw new Error('Timestamp keputusan tidak valid. Tunggu sampai cursor replay siap.');

    var friction = activeAtSave
      ? calculateExecutionFriction(geometry.bias, geometry.entry, input.currentCandle, {
          isMarket: true,
          spreadUsd: input.spreadUsd,
          slippageFactor: input.slippageFactor,
          stopLoss: geometry.stopLoss,
          takeProfit: geometry.takeProfit
        })
      : { fillPrice: geometry.entry, spreadPips: 0, slippagePips: 0, frictionCost: 0 };

    var initialRiskPrice = geometry.bias === 'WAIT'
      ? 0
      : Math.max(0.01, Math.abs((friction.fillPrice != null ? friction.fillPrice : geometry.entry) - geometry.stopLoss));

    var lot = geometry.bias === 'WAIT'
      ? 0
      : Math.max(0.01, round2(core.finite(input.lot) != null
          ? Number(input.lot)
          : computeLotFromRisk(input.balanceUsd || 1000, input.riskPercent || 1, geometry.entry, geometry.stopLoss)));

    var riskUsd = geometry.bias === 'WAIT' ? 0 : round2(initialRiskPrice * lot * CONTRACT_OZ);

    return {
      id: input.id || (input.lockDecision ? decisionId(input) : (root.AmyPracticeStorage ? root.AmyPracticeStorage.identifier('trade') : ('trade-' + Date.now()))),
      sessionId: String(input.sessionId || 'default'),
      symbol: String(input.symbol || 'XAUUSD').toUpperCase(),
      timeframe: String(input.timeframe || 'M15').toUpperCase(),
      replayStartTime: Number(input.replayStartTime || input.tradeTime),
      tradeTime: tradeTime,
      decisionCandleTime: tradeTime,
      orderType: requestedType === 'LIMIT' ? 'LIMIT' : (activeAtSave ? 'MARKET' : 'LIMIT'),
      placedAtPrice: currentPrice != null ? currentPrice : null,
      sourceId: String(input.sourceId || ''),
      locked: Boolean(input.lockDecision),
      lockedAt: input.lockDecision ? Number(input.lockedAt || Date.now()) : null,
      bias: geometry.bias,
      setupType: String(input.setupType || '').trim() || null,
      entry: geometry.entry,
      fillPrice: friction.fillPrice,
      spreadPips: friction.spreadPips,
      slippagePips: friction.slippagePips,
      frictionCost: friction.frictionCost,
      initialStopLoss: geometry.stopLoss,
      stopLoss: geometry.stopLoss,
      takeProfit: geometry.takeProfit,
      initialRiskPrice: initialRiskPrice,
      lot: lot,
      remainingLot: lot,
      remainingFraction: 1,
      riskUsd: riskUsd,
      realizedR: 0,
      realizedUsd: 0,
      partials: [],
      breakevenMoved: false,
      result: geometry.bias === 'WAIT' ? 'WAIT' : 'OPEN',
      entryStatus: geometry.bias === 'WAIT' ? 'NOT_APPLICABLE' : (activeAtSave ? 'ACTIVE' : 'WAITING_FILL'),
      entryActivatedAt: activeAtSave ? tradeTime : null,
      plannedR: geometry.bias === 'WAIT' ? null : plannedR(geometry.bias, geometry.entry, geometry.stopLoss, geometry.takeProfit),
      r: null,
      pnlUsd: null,
      notes: String(input.notes || '').trim(),
      createdAt: Number(input.createdAt || Date.now()),
      updatedAt: Date.now()
    };
  }

  function touched(candle, level) {
    return Number(candle.low) <= Number(level) && Number(candle.high) >= Number(level);
  }

  function directionalPriceDiff(bias, entryPrice, exitPrice) {
    return bias === 'BUY' ? (Number(exitPrice) - Number(entryPrice)) : (Number(entryPrice) - Number(exitPrice));
  }

  function initialRiskDist(record) {
    if (Number.isFinite(Number(record.initialRiskPrice)) && Number(record.initialRiskPrice) > 0) {
      return Number(record.initialRiskPrice);
    }
    var refEntry = Number.isFinite(Number(record.fillPrice)) ? Number(record.fillPrice) : Number(record.entry);
    var refSl = Number.isFinite(Number(record.initialStopLoss)) ? Number(record.initialStopLoss) : Number(record.stopLoss);
    return Math.max(0.01, Math.abs(refEntry - refSl));
  }

  function computeFloatingPnl(record, currentPrice) {
    if (!record || !['BUY', 'SELL'].includes(record.bias)) return null;
    if (record.result !== 'OPEN' || record.entryStatus !== 'ACTIVE') return null;
    var px = core.finite(currentPrice);
    if (px == null) return null;
    var entryPx = Number.isFinite(Number(record.fillPrice)) ? Number(record.fillPrice) : Number(record.entry);
    var remFrac = record.remainingFraction != null ? Number(record.remainingFraction) : 1;
    var remLot = record.remainingLot != null ? Number(record.remainingLot) : (Number(record.lot) || 0.01);
    var diff = directionalPriceDiff(record.bias, entryPx, px);
    var riskDist = initialRiskDist(record);
    var floatingR = round2((diff / riskDist) * remFrac);
    var floatingUsd = round2(diff * remLot * CONTRACT_OZ);
    var pips = round2(diff * 10);
    return {
      pips: pips,
      floatingR: floatingR,
      floatingUsd: floatingUsd,
      totalR: round2(Number(record.realizedR || 0) + floatingR),
      totalUsd: round2(Number(record.realizedUsd || 0) + floatingUsd)
    };
  }

  function finalizeClose(next, exitPrice, closeTime, resolution, evidence) {
    var entryPx = Number.isFinite(Number(next.fillPrice)) ? Number(next.fillPrice) : Number(next.entry);
    var remFrac = next.remainingFraction != null ? Number(next.remainingFraction) : 1;
    var remLot = next.remainingLot != null ? Number(next.remainingLot) : (Number(next.lot) || 0.01);
    var diff = directionalPriceDiff(next.bias, entryPx, exitPrice);
    var riskDist = initialRiskDist(next);

    var legR = (diff / riskDist) * remFrac;
    var legUsd = diff * remLot * CONTRACT_OZ;
    var totalR = round2(Number(next.realizedR || 0) + legR);
    var totalUsd = round2(Number(next.realizedUsd || 0) + legUsd);

    next.exitPrice = round2(exitPrice);
    next.r = totalR;
    next.pnlUsd = totalUsd;
    next.remainingFraction = 0;
    next.remainingLot = 0;
    next.closedAt = closeTime;
    next.resolution = resolution;
    next.outcomeEvidence = evidence;

    if (Math.abs(totalR) < 0.05) {
      next.result = 'BE';
      next.r = 0;
      next.pnlUsd = Math.abs(totalUsd) < 0.5 ? 0 : totalUsd;
    } else {
      next.result = totalR > 0 ? 'WIN' : 'LOSS';
    }
    next.updatedAt = Date.now();
    return next;
  }

  function moveStopToBreakeven(record, currentPrice) {
    if (!record || record.result !== 'OPEN' || record.entryStatus !== 'ACTIVE') {
      throw new Error('Hanya posisi aktif yang dapat dipindahkan ke BE.');
    }
    var entryPx = Number.isFinite(Number(record.fillPrice)) ? Number(record.fillPrice) : Number(record.entry);
    var px = core.finite(currentPrice);
    if (px != null) {
      var inProfit = record.bias === 'BUY' ? px > entryPx : px < entryPx;
      if (!inProfit) throw new Error('Harga harus sedang profit sebelum menggeser SL ke BE.');
    }
    var next = Object.assign({}, record, {
      initialStopLoss: record.initialStopLoss != null ? record.initialStopLoss : record.stopLoss,
      stopLoss: entryPx,
      breakevenMoved: true,
      updatedAt: Date.now()
    });
    return next;
  }

  function closePartial(record, currentPrice, fraction, closeTime) {
    if (!record || record.result !== 'OPEN' || record.entryStatus !== 'ACTIVE') {
      throw new Error('Hanya posisi aktif yang bisa di-partial close.');
    }
    var px = core.finite(currentPrice);
    if (px == null) throw new Error('Harga penutupan parsial tidak valid.');
    var frac = Math.max(0.1, Math.min(0.9, Number(fraction) || 0.5));
    var remFrac = record.remainingFraction != null ? Number(record.remainingFraction) : 1;
    var remLot = record.remainingLot != null ? Number(record.remainingLot) : (Number(record.lot) || 0.01);
    if (remFrac <= 0.15 || remLot < 0.02) throw new Error('Sisa lot terlalu kecil untuk partial close (gunakan Tutup Manual).');

    var closeLot = Math.min(round2(remLot - 0.01), Math.max(0.01, round2(remLot * frac)));
    var actualFrac = remLot > 0 ? (closeLot / remLot) : frac;
    var closeFrac = round2(remFrac * actualFrac);
    var entryPx = Number.isFinite(Number(record.fillPrice)) ? Number(record.fillPrice) : Number(record.entry);
    var diff = directionalPriceDiff(record.bias, entryPx, px);
    var riskDist = initialRiskDist(record);
    var partR = round2((diff / riskDist) * closeFrac);
    var partUsd = round2(diff * closeLot * CONTRACT_OZ);

    var next = Object.assign({}, record);
    next.partials = (Array.isArray(record.partials) ? record.partials : []).concat([{
      time: closeTime || Date.now(),
      price: round2(px),
      fraction: closeFrac,
      lot: closeLot,
      r: partR,
      pnlUsd: partUsd
    }]);
    next.realizedR = round2(Number(record.realizedR || 0) + partR);
    next.realizedUsd = round2(Number(record.realizedUsd || 0) + partUsd);
    next.remainingFraction = round2(Math.max(0, remFrac - closeFrac));
    next.remainingLot = round2(Math.max(0, remLot - closeLot));
    next.updatedAt = Date.now();
    return next;
  }

  function closeManual(record, currentPrice, closeTime) {
    if (!record || record.result !== 'OPEN') return record;
    var next = Object.assign({}, record);
    if (next.entryStatus !== 'ACTIVE') {
      next.result = 'CANCELLED';
      next.entryStatus = 'CANCELLED_MANUAL';
      next.r = 0;
      next.pnlUsd = 0;
      next.closedAt = closeTime || Date.now();
      next.resolution = 'CANCELLED_MANUAL';
      next.outcomeEvidence = {
        type: 'CANCELLED', level: Number(next.entry), candleTime: closeTime || Date.now(),
        candleHigh: Number(currentPrice || next.entry), candleLow: Number(currentPrice || next.entry),
        ambiguous: false
      };
      next.updatedAt = Date.now();
      return next;
    }
    var px = core.finite(currentPrice);
    if (px == null) throw new Error('Harga tutup manual tidak valid.');
    return finalizeClose(next, px, closeTime || Date.now(), 'MANUAL_CLOSE', {
      type: 'MANUAL', level: round2(px), candleTime: closeTime || Date.now(),
      candleHigh: round2(px), candleLow: round2(px), ambiguous: false
    });
  }

  function evaluate(record, candles) {
    if (!record || !['BUY', 'SELL'].includes(record.bias)) return record;
    var needsEvidenceRepair = ['WIN', 'LOSS'].includes(record.result) && !record.outcomeEvidence;
    if (record.result !== 'OPEN' && !needsEvidenceRepair) return record;

    var next = Object.assign({}, record);
    if (needsEvidenceRepair) {
      next.result = 'OPEN';
      next.r = null;
      next.pnlUsd = null;
      delete next.closedAt;
      delete next.resolution;
    }

    var decisionTs = Number(next.tradeTime || 0);
    var activatedTs = Number(next.entryActivatedAt || decisionTs);

    // Strictly evaluate candles AFTER decision candle (fixes M1 same-candle instant SL bug!)
    var sequence = core.normalizeCandles(candles).filter(function (candle) {
      if (next.entryStatus === 'ACTIVE') {
        return candle.time > activatedTs;
      }
      return candle.time > decisionTs;
    });

    for (var i = 0; i < sequence.length; i += 1) {
      var candle = sequence[i];

      if (next.entryStatus !== 'ACTIVE') {
        var entryHit = touched(candle, next.entry);
        var gapFillPrice = null;
        if (!entryHit && next.placedAtPrice != null && Number.isFinite(Number(next.placedAtPrice))) {
          var placed = Number(next.placedAtPrice);
          var openPx = Number(candle.open);
          var entryVal = Number(next.entry);
          var slVal = Number(next.stopLoss);
          var tpVal = Number(next.takeProfit);
          if (next.bias === 'BUY') {
            if (placed > entryVal && openPx <= entryVal && openPx > slVal) gapFillPrice = openPx;
            else if (placed < entryVal && openPx >= entryVal && openPx < tpVal) gapFillPrice = openPx;
          } else if (next.bias === 'SELL') {
            if (placed < entryVal && openPx >= entryVal && openPx < slVal) gapFillPrice = openPx;
            else if (placed > entryVal && openPx <= entryVal && openPx > tpVal) gapFillPrice = openPx;
          }
        }
        if (entryHit || gapFillPrice != null) {
          next.entryStatus = 'ACTIVE';
          next.entryActivatedAt = candle.time;
          if (gapFillPrice != null) next.fillPrice = round2(gapFillPrice);
          // Evaluate SL/TP on fill candle conservatively (SL checked first)
        } else {
          var targetHitBeforeEntry =
            (next.bias === 'BUY' && Number(candle.high) >= Number(next.takeProfit)) ||
            (next.bias === 'SELL' && Number(candle.low) <= Number(next.takeProfit));
          if (targetHitBeforeEntry) {
            next.result = 'MISSED';
            next.entryStatus = 'EXPIRED_TARGET_HIT_FIRST';
            next.r = 0;
            next.pnlUsd = 0;
            next.closedAt = candle.time;
            next.resolution = 'TARGET_HIT_BEFORE_FILL';
            next.outcomeEvidence = {
              type: 'MISSED', level: Number(next.takeProfit), candleTime: candle.time,
              candleHigh: Number(candle.high), candleLow: Number(candle.low),
              ambiguous: false
            };
            break;
          }
          var slHitBeforeEntry =
            (next.bias === 'BUY' && Number(candle.low) <= Number(next.stopLoss)) ||
            (next.bias === 'SELL' && Number(candle.high) >= Number(next.stopLoss));
          if (slHitBeforeEntry) {
            next.result = 'CANCELLED';
            next.entryStatus = 'CANCELLED_GAP_SL';
            next.r = 0;
            next.pnlUsd = 0;
            next.closedAt = candle.time;
            next.resolution = 'SL_HIT_BEFORE_FILL';
            next.outcomeEvidence = {
              type: 'CANCELLED_GAP', level: Number(next.stopLoss), candleTime: candle.time,
              candleHigh: Number(candle.high), candleLow: Number(candle.low),
              ambiguous: false
            };
            break;
          }
          continue;
        }
      }

      // Gap-safe directional SL & TP hit detection (handles weekend/news gaps past level!)
      var stopHit = next.bias === 'BUY'
        ? Number(candle.low) <= Number(next.stopLoss)
        : Number(candle.high) >= Number(next.stopLoss);
      var targetHit = next.bias === 'BUY'
        ? Number(candle.high) >= Number(next.takeProfit)
        : Number(candle.low) <= Number(next.takeProfit);

      if (stopHit) {
        var gappedSl = next.bias === 'BUY'
          ? Number(candle.open) < Number(next.stopLoss)
          : Number(candle.open) > Number(next.stopLoss);
        var slFill = gappedSl ? Number(candle.open) : Number(next.stopLoss);
        finalizeClose(next, slFill, candle.time,
          targetHit ? 'SL_FIRST_AMBIGUOUS_CANDLE' : (gappedSl ? 'SL_GAP_HIT' : (next.breakevenMoved ? 'BE_HIT' : 'SL_HIT')),
          {
            type: next.breakevenMoved ? 'BE' : 'SL',
            level: round2(slFill),
            candleTime: candle.time,
            candleHigh: Number(candle.high),
            candleLow: Number(candle.low),
            ambiguous: Boolean(targetHit),
            gapped: Boolean(gappedSl)
          });
        break;
      }

      if (targetHit) {
        var gappedTp = next.bias === 'BUY'
          ? Number(candle.open) > Number(next.takeProfit)
          : Number(candle.open) < Number(next.takeProfit);
        var tpFill = gappedTp ? Number(candle.open) : Number(next.takeProfit);
        finalizeClose(next, tpFill, candle.time, gappedTp ? 'TP_GAP_HIT' : 'TP_HIT', {
          type: 'TP',
          level: round2(tpFill),
          candleTime: candle.time,
          candleHigh: Number(candle.high),
          candleLow: Number(candle.low),
          ambiguous: false,
          gapped: Boolean(gappedTp)
        });
        break;
      }
    }

    if (needsEvidenceRepair && next.result === 'OPEN') return record;
    next.updatedAt = Date.now();
    return next;
  }

  root.AmyPracticeTrades = Object.freeze({
    CONTRACT_OZ: CONTRACT_OZ,
    create: create,
    validate: validate,
    evaluate: evaluate,
    plannedR: plannedR,
    decisionId: decisionId,
    computeLotFromRisk: computeLotFromRisk,
    calculateExecutionFriction: calculateExecutionFriction,
    computeFloatingPnl: computeFloatingPnl,
    moveStopToBreakeven: moveStopToBreakeven,
    closePartial: closePartial,
    closeManual: closeManual
  });
})(typeof window !== 'undefined' ? window : globalThis);
