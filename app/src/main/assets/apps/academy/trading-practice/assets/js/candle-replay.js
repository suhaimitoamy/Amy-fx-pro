/* Amy FX Backtest Lab — Candle Replay Controller (Cloud 2019–2026, Akun Pro Rp/$, Persistent Active Trade Lines, BE/Partial/Manual Close, ICT Levels, Killzone Jump). */
(function () {
  'use strict';

  var core = window.AmyPracticeCore;
  var data = window.AmyPracticeData;
  var storage = window.AmyPracticeStorage;
  var tradesApi = window.AmyPracticeTrades;
  var analytics = window.AmyPracticeAnalytics;
  var ui = window.AmyPracticeUI;

  var chart = null;
  var replay = null;
  var cloudUi = null;

  var visibleCandles = [];
  var activeSession = null;
  var profileParams = storage.readProfileAccountParams();
  var displayCurrency = profileParams.currency || 'IDR';
  var usdIdrRate = profileParams.usdIdrRate || 16500;
  var spreadUsd = profileParams.spreadUsd != null ? profileParams.spreadUsd : 0.25;

  var sessionTrades = [];
  var ictOverlayEnabled = false;
  var tapTarget = null; // null | 'entry' | 'stopLoss' | 'takeProfit' (OFF by default)
  var slTpPinnedByUser = false;
  var sessionDialogMode = 'create'; // 'create' | 'edit'
  var tradeQueue = Promise.resolve();
  var pendingDeleteTradeId = null;
  var pendingResetSession = false;
  var resetTimer = null;
  var nextMonthCandidate = null;
  var cachedCloudManifest = null;
  var replayBookmarks = [];

  function enqueueTradeTask(taskFn) {
    var next = tradeQueue.then(taskFn, taskFn);
    tradeQueue = next.catch(function () {});
    return next;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function fmtMoney(usd, signed) {
    return storage.formatMoney(usd, displayCurrency, usdIdrRate, { signed: Boolean(signed) });
  }

  function currentBar() {
    return visibleCandles.length ? visibleCandles[visibleCandles.length - 1] : null;
  }

  function currentPrice() {
    var bar = currentBar();
    return bar ? Number(bar.close) : null;
  }

  function isTradeOnCurrentSource(t) {
    if (!t) return false;
    if (!t.sourceId || !replay || !replay.sourceId) return true;
    return t.sourceId === replay.sourceId;
  }

  function isTradeAfterCursor(t) {
    if (!t || !replay || replay.cursor == null) return false;
    var ts = Number(t.tradeTime);
    return Number.isFinite(ts) && ts > Number(replay.cursor);
  }

  function openTradesInSession() {
    return sessionTrades.filter(function (t) {
      return t && t.result === 'OPEN' && t.bias !== 'WAIT';
    });
  }

  function getSessionStats() {
    var initBal = activeSession ? Number(activeSession.initialBalanceUsd || 5000) : 5000;
    var riskPct = activeSession ? Number(activeSession.riskPercent || 1) : 1;
    var stats = analytics.computeStats(sessionTrades, {
      initialBalanceUsd: initBal,
      defaultRiskUsd: initBal * (riskPct / 100)
    });
    return stats;
  }

  function syncOrderTypeButtons(val) {
    var form = ui.byId('tradeForm');
    if (form && form.elements.orderType) form.elements.orderType.value = val;
    var orderSeg = ui.byId('orderTypeSeg');
    if (orderSeg) {
      orderSeg.querySelectorAll('button[data-order-type]').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.orderType === val);
      });
    }
  }

  function syncTapChips() {
    document.querySelectorAll('[data-tap-target]').forEach(function (c) {
      var active = tapTarget !== null && c.dataset.tapTarget === tapTarget;
      c.classList.toggle('is-active', active);
      c.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderAccountBar() {
    var initBal = activeSession ? Number(activeSession.initialBalanceUsd || 5000) : 5000;
    var stats = getSessionStats();
    var px = currentPrice();
    var openList = openTradesInSession();
    var activeOnChartCount = 0;
    var floatUsd = 0;
    var floatR = 0;

    openList.forEach(function (t) {
      if (!isTradeOnCurrentSource(t) || isTradeAfterCursor(t)) return;
      var fl = tradesApi.computeFloatingPnl(t, px);
      if (fl) {
        activeOnChartCount += 1;
        // Unrealized PnL of remaining lot only (stats.currentBalanceUsd already includes realized partials!)
        floatUsd += fl.floatingUsd;
        floatR += fl.floatingR;
      }
    });

    var equityUsd = Math.round((stats.currentBalanceUsd + floatUsd) * 100) / 100;

    var eqEl = ui.byId('accEquity');
    if (eqEl) {
      eqEl.textContent = fmtMoney(equityUsd, false);
      eqEl.classList.toggle('is-pos', equityUsd > initBal + 0.005);
      eqEl.classList.toggle('is-neg', equityUsd < initBal - 0.005);
      eqEl.classList.toggle('is-gold', Math.abs(equityUsd - initBal) <= 0.005);
    }

    var balEl = ui.byId('accBalance');
    if (balEl) {
      balEl.textContent = fmtMoney(stats.currentBalanceUsd, false);
      balEl.classList.toggle('is-pos', stats.currentBalanceUsd > initBal + 0.005);
      balEl.classList.toggle('is-neg', stats.currentBalanceUsd < initBal - 0.005);
    }

    var floatEl = ui.byId('accFloating');
    if (floatEl) {
      floatEl.textContent = activeOnChartCount
        ? (fmtMoney(floatUsd, true) + ' (' + (floatR >= 0 ? '+' : '') + floatR.toFixed(2) + 'R)')
        : fmtMoney(0, false);
      floatEl.classList.toggle('is-pos', floatUsd > 0);
      floatEl.classList.toggle('is-neg', floatUsd < 0);
    }

    var netREl = ui.byId('accNetR');
    if (netREl) {
      netREl.textContent = (stats.totalRealizedR >= 0 ? '+' : '') + stats.totalRealizedR.toFixed(2) + 'R';
      netREl.classList.toggle('is-pos', stats.totalRealizedR > 0);
      netREl.classList.toggle('is-neg', stats.totalRealizedR < 0);
    }

    var wrEl = ui.byId('accWinRate');
    if (wrEl) {
      wrEl.textContent = stats.closedTrades ? (stats.winRate.toFixed(1) + '% (' + stats.wins + 'W/' + stats.losses + 'L)') : '—';
    }

    var riskHint = ui.byId('riskProfileHint');
    if (riskHint && activeSession) {
      var riskUsd = stats.currentBalanceUsd * (Number(activeSession.riskPercent || 1) / 100);
      riskHint.textContent = 'Risiko ' + activeSession.riskPercent + '% ≈ ' + fmtMoney(riskUsd, false) + ' · Spread $' + Number(spreadUsd).toFixed(2);
    }
  }

  function syncCurrencyButtons() {
    var wrap = ui.byId('currencyToggle');
    if (!wrap) return;
    wrap.querySelectorAll('button[data-currency]').forEach(function (btn) {
      var active = btn.dataset.currency === displayCurrency;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderSessionSelect() {
    var sel = ui.byId('sessionSelect');
    if (!sel) return;
    var sessions = storage.listSessions();
    activeSession = storage.getActiveSession();
    sel.innerHTML = sessions.map(function (s) {
      return '<option value="' + escapeHtml(s.id) + '">' + escapeHtml(s.name) + ' (' + fmtMoney(s.initialBalanceUsd, false) + ')</option>';
    }).join('');
    sel.value = activeSession.id;
  }

  // Keep active trade lines pinned on chart across every candle step (+ optional draft preview lines)
  function syncChartTradeLevels() {
    if (!chart) return;
    var levels = [];
    var openList = openTradesInSession().filter(function (t) {
      return isTradeOnCurrentSource(t) && !isTradeAfterCursor(t);
    });

    openList.forEach(function (t, idx) {
      var tag = openList.length > 1 ? (' #' + (idx + 1)) : '';
      var entryPx = Number.isFinite(Number(t.fillPrice)) ? Number(t.fillPrice) : Number(t.entry);
      var statusPrefix = t.entryStatus === 'ACTIVE' ? t.bias : (t.bias + ' LIMIT');
      levels.push({
        type: 'entry',
        price: entryPx,
        solid: t.entryStatus === 'ACTIVE',
        color: '#facc15',
        title: statusPrefix + tag + ' ' + Number(t.remainingLot || t.lot || 0.01).toFixed(2) + 'L'
      });
      if (Number.isFinite(Number(t.stopLoss))) {
        levels.push({
          type: 'stop',
          price: Number(t.stopLoss),
          solid: false,
          color: t.breakevenMoved ? '#38bdf8' : '#fb7185',
          title: (t.breakevenMoved ? 'BE' : 'SL') + tag
        });
      }
      if (Number.isFinite(Number(t.takeProfit))) {
        levels.push({
          type: 'target',
          price: Number(t.takeProfit),
          solid: false,
          color: '#2dd4bf',
          title: 'TP' + tag
        });
      }
    });

    // If no open trade lines, preview current form values cleanly
    if (!levels.length) {
      var form = ui.byId('tradeForm');
      if (form) {
        var bias = form.elements.bias ? form.elements.bias.value : 'BUY';
        if (bias !== 'WAIT') {
          var eVal = core.finite(form.elements.entry && form.elements.entry.value);
          var slVal = core.finite(form.elements.stopLoss && form.elements.stopLoss.value);
          var tpVal = core.finite(form.elements.takeProfit && form.elements.takeProfit.value);
          if (eVal != null) levels.push({ type: 'entry', price: eVal, color: '#facc15', title: 'RENCANA ENTRY' });
          if (slVal != null) levels.push({ type: 'stop', price: slVal, color: '#fb7185', title: 'RENCANA SL' });
          if (tpVal != null) levels.push({ type: 'target', price: tpVal, color: '#2dd4bf', title: 'RENCANA TP' });
        }
      }
    }

    chart.setTradeLevels(levels);
  }

  function syncIctLevels() {
    if (!chart) return;
    if (!ictOverlayEnabled || !visibleCandles.length) {
      chart.setIctLevels([]);
      return;
    }
    var levels = core.computeReplayIctLevels(visibleCandles, replay ? replay.cursor : null);
    chart.setIctLevels(levels);
  }

  function renderActivePositions() {
    var host = ui.byId('activePositionsList');
    var badge = ui.byId('openPositionsCount');
    if (!host) return;
    var openList = openTradesInSession();
    if (badge) badge.textContent = String(openList.length);

    if (!openList.length) {
      host.innerHTML = '<div class="bt-empty-inline">Belum ada posisi aktif.</div>';
      return;
    }

    var px = currentPrice();
    host.innerHTML = openList.map(function (t) {
      var isBuy = t.bias === 'BUY';
      var isActive = t.entryStatus === 'ACTIVE';
      var sameSource = isTradeOnCurrentSource(t);
      var preEntry = isTradeAfterCursor(t);
      var canManageLive = isActive && sameSource && !preEntry;
      var fl = canManageLive ? tradesApi.computeFloatingPnl(t, px) : null;
      var entryPx = Number.isFinite(Number(t.fillPrice)) ? Number(t.fillPrice) : Number(t.entry);
      var inProfit = canManageLive && px != null && (isBuy ? px > entryPx : px < entryPx);
      var remLot = Number(t.remainingLot != null ? t.remainingLot : (t.lot || 0.01));
      var canBe = canManageLive && inProfit && !t.breakevenMoved;
      var canPartial = canManageLive && Number(t.remainingFraction != null ? t.remainingFraction : 1) > 0.15 && remLot >= 0.02;

      var pnlHtml;
      if (!sameSource) {
        pnlHtml = '<span class="bt-tag bt-tag-wait">PACK LAIN</span>';
      } else if (preEntry) {
        pnlHtml = '<span class="bt-tag bt-tag-wait">PRA-ENTRY</span>';
      } else if (isActive && fl) {
        pnlHtml = '<span class="bt-pos-pnl ' + (fl.floatingUsd >= 0 ? 'is-pos' : 'is-neg') + '">' + fmtMoney(fl.floatingUsd, true) + '<small>' + (fl.floatingR >= 0 ? '+' : '') + fl.floatingR.toFixed(2) + 'R</small></span>';
      } else {
        pnlHtml = '<span class="bt-tag bt-tag-wait">LIMIT WAIT</span>';
      }
      var shortType = t.orderType === 'LIMIT' ? 'LMT' : 'MKT';

      return '<div class="bt-pos-card ' + (isBuy ? 'is-buy' : 'is-sell') + '">' +
        '<div class="bt-pos-top">' +
          '<div class="bt-pos-title">' +
            '<span class="bt-tag ' + (isBuy ? 'bt-tag-buy' : 'bt-tag-sell') + '">' + escapeHtml(t.bias + ' ' + shortType) + '</span>' +
            '<span class="tabular">' + remLot.toFixed(2) + 'L</span>' +
            (t.breakevenMoved ? '<span class="bt-tag bt-tag-be">BE</span>' : '') +
          '</div>' +
          pnlHtml +
        '</div>' +
        '<div class="bt-pos-meta">' +
          '<span>Entry ' + core.price(entryPx) + '</span>' +
          '<span>SL ' + core.price(t.stopLoss) + '</span>' +
          '<span>TP ' + core.price(t.takeProfit) + '</span>' +
          (t.realizedUsd ? '<span>Terkunci ' + fmtMoney(t.realizedUsd, true) + '</span>' : '') +
        '</div>' +
        '<div class="bt-pos-actions">' +
          (isActive ? '<button type="button" class="bt-btn-sm" data-pos-be="' + escapeHtml(t.id) + '"' + (canBe ? '' : ' disabled') + '>Set BE</button>' : '') +
          (isActive ? '<button type="button" class="bt-btn-sm" data-pos-partial="' + escapeHtml(t.id) + '"' + (canPartial ? '' : ' disabled') + '>Partial 50%</button>' : '') +
          '<button type="button" class="bt-btn-sm bt-btn-danger" data-pos-close="' + escapeHtml(t.id) + '"' + (isActive && !canManageLive ? ' disabled' : '') + '>' + (isActive ? 'Tutup Manual' : 'Batal Limit') + '</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function resultTagClass(result) {
    var r = String(result || '').toUpperCase();
    if (r === 'WIN') return 'bt-tag-win';
    if (r === 'LOSS') return 'bt-tag-loss';
    if (r === 'BE') return 'bt-tag-be';
    if (r === 'OPEN') return 'bt-tag-open';
    return 'bt-tag-wait';
  }

  function renderSessionTradesTable() {
    var tbody = ui.byId('replayTradesBody');
    if (!tbody) return;
    if (!sessionTrades.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="bt-empty-inline">Belum ada trade di sesi ini.</div></td></tr>';
      return;
    }

    tbody.innerHTML = sessionTrades.slice(0, 25).map(function (t) {
      var isClosed = ['WIN', 'LOSS', 'BE'].includes(t.result);
      var rStr = t.r != null ? ((Number(t.r) >= 0 ? '+' : '') + Number(t.r).toFixed(2) + 'R') : (t.plannedR != null ? ('Plan ' + Number(t.plannedR).toFixed(2) + 'R') : '—');
      var usdStr = t.pnlUsd != null ? fmtMoney(t.pnlUsd, true) : '—';
      var setupLabel = analytics.classifySetup(t.notes, t.reason, t.setupType);
      var sessLabel = analytics.classifySession(t.tradeTime);
      var isConfirm = pendingDeleteTradeId === t.id;

      return '<tr>' +
        '<td class="tabular">' + escapeHtml(core.formatWita(t.tradeTime, true)) + '<br><span style="color:var(--bt-text-muted);font-size:11px">' + escapeHtml(t.timeframe || 'M15') + ' · ' + escapeHtml(sessLabel) + '</span></td>' +
        '<td><span class="bt-tag ' + (t.bias === 'BUY' ? 'bt-tag-buy' : (t.bias === 'SELL' ? 'bt-tag-sell' : 'bt-tag-wait')) + '">' + escapeHtml(t.bias) + '</span> <span class="tabular" style="font-size:11.5px;color:var(--bt-text-muted)">' + (t.lot ? Number(t.lot).toFixed(2) + 'L' : '') + '</span></td>' +
        '<td class="tabular">' + (t.bias === 'WAIT' ? 'WAIT' : ('E ' + core.price(t.fillPrice || t.entry) + ' · SL ' + core.price(t.stopLoss) + ' · TP ' + core.price(t.takeProfit))) + '</td>' +
        '<td>' + escapeHtml(setupLabel) + '</td>' +
        '<td><span class="bt-tag ' + resultTagClass(t.result) + '">' + escapeHtml(t.result || 'OPEN') + '</span></td>' +
        '<td class="num ' + (Number(t.r || 0) > 0 ? 'is-pos' : (Number(t.r || 0) < 0 ? 'is-neg' : '')) + '">' + escapeHtml(rStr) + '<br><span style="font-size:11px;color:var(--bt-text-muted)">' + escapeHtml(usdStr) + '</span></td>' +
        '<td><div class="bt-row-actions">' +
          (isClosed ? '<button type="button" class="bt-btn-sm" data-export-journal="' + escapeHtml(t.id) + '">Jurnal</button>' : '') +
          '<button type="button" class="bt-btn-sm bt-btn-danger' + (isConfirm ? ' is-confirm' : '') + '" data-delete-trade="' + escapeHtml(t.id) + '">' + (isConfirm ? 'Yakin?' : 'Hapus') + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  async function runRefreshTradesAndEvaluate() {
    var sid = activeSession ? activeSession.id : storage.getActiveSessionId();
    sessionTrades = await storage.listTrades(sid);

    if (visibleCandles.length) {
      var changed = false;
      for (var i = 0; i < sessionTrades.length; i += 1) {
        var t = sessionTrades[i];
        if (!t || t.result !== 'OPEN' || !['BUY', 'SELL'].includes(t.bias)) continue;
        // Strictly scope evaluation to candles from the same dataset pack and after trade creation
        if (!isTradeOnCurrentSource(t) || isTradeAfterCursor(t)) continue;
        var updated = tradesApi.evaluate(t, visibleCandles);
        if (updated.result !== t.result || updated.entryStatus !== t.entryStatus || updated.r !== t.r) {
          await storage.saveTrade(updated);
          sessionTrades[i] = updated;
          changed = true;
          if (updated.result === 'WIN' || updated.result === 'LOSS' || updated.result === 'BE') {
            ui.status('tradeStatus', 'Posisi ' + updated.bias + ' selesai: ' + updated.result + ' (' + (updated.r >= 0 ? '+' : '') + Number(updated.r).toFixed(2) + 'R · ' + fmtMoney(updated.pnlUsd, true) + ').', updated.result === 'LOSS', updated.result === 'WIN');
          } else if (updated.result === 'MISSED') {
            ui.status('tradeStatus', 'Limit order ' + updated.bias + ' MISSED (harga mencapai TP sebelum fill).', false, false);
          } else if (updated.result === 'CANCELLED') {
            ui.status('tradeStatus', 'Limit order ' + updated.bias + ' dibatalkan otomatis (harga menyentuh SL sebelum entry ter-fill).', true, false);
          } else if (updated.entryStatus === 'ACTIVE' && t.entryStatus !== 'ACTIVE') {
            ui.status('tradeStatus', 'Limit order ' + updated.bias + ' TER-FILL di ' + core.price(updated.fillPrice || updated.entry) + '!', false, true);
          }
        }
      }
      if (changed) {
        sessionTrades = await storage.listTrades(sid);
      }
    }

    renderAccountBar();
    renderActivePositions();
    renderSessionTradesTable();
    syncChartTradeLevels();
  }

  function refreshTradesAndEvaluate() {
    return enqueueTradeTask(runRefreshTradesAndEvaluate);
  }

  function syncMarketOrderPrices(px) {
    var form = ui.byId('tradeForm');
    if (!form || px == null || !Number.isFinite(Number(px))) return;
    var bias = form.elements.bias ? form.elements.bias.value : 'BUY';
    var orderType = form.elements.orderType ? form.elements.orderType.value : 'MARKET';
    if (orderType !== 'MARKET' || bias === 'WAIT') return;

    var prevEntry = core.finite(form.elements.entry && form.elements.entry.value);
    var prevSl = core.finite(form.elements.stopLoss && form.elements.stopLoss.value);
    var prevTp = core.finite(form.elements.takeProfit && form.elements.takeProfit.value);
    var slDist = (prevEntry != null && prevSl != null && Math.abs(prevEntry - prevSl) >= 0.5) ? Math.abs(prevEntry - prevSl) : 5;
    var tpDist = (prevEntry != null && prevTp != null && Math.abs(prevTp - prevEntry) >= 0.5) ? Math.abs(prevTp - prevEntry) : 10;

    form.elements.entry.value = Number(px).toFixed(2);
    if (!slTpPinnedByUser) {
      form.elements.stopLoss.value = (bias === 'BUY' ? (px - slDist) : (px + slDist)).toFixed(2);
      form.elements.takeProfit.value = (bias === 'BUY' ? (px + tpDist) : (px - tpDist)).toFixed(2);
      autoCalculateLot();
    }
  }

  function updateOrderPreview() {
    var form = ui.byId('tradeForm');
    if (!form) return;
    var bias = form.elements.bias.value;
    var orderType = form.elements.orderType.value;
    var isWait = bias === 'WAIT';

    ['entry', 'stopLoss', 'takeProfit', 'lot'].forEach(function (field) {
      if (form.elements[field]) form.elements[field].disabled = isWait;
    });

    if (isWait) {
      ui.text('orderRrPreview', 'Keputusan WAIT (Observasi)');
      ui.text('orderRiskPreview', '0 lot · Risiko 0');
      syncChartTradeLevels();
      return;
    }

    var px = currentPrice();
    if (orderType === 'MARKET' && px != null && form.elements.entry) {
      form.elements.entry.value = px.toFixed(2);
    }

    var entry = core.finite(form.elements.entry.value);
    var sl = core.finite(form.elements.stopLoss.value);
    var tp = core.finite(form.elements.takeProfit.value);
    var lot = core.finite(form.elements.lot.value);

    var validGeometry = entry != null && sl != null && tp != null && (
      (bias === 'BUY' && sl < entry && entry < tp) ||
      (bias === 'SELL' && tp < entry && entry < sl)
    );
    var rr = validGeometry ? tradesApi.plannedR(bias, entry, sl, tp) : null;
    if (rr != null) {
      ui.text('orderRrPreview', 'R:R 1 : ' + rr.toFixed(2));
    } else if (entry != null && sl != null && tp != null) {
      ui.text('orderRrPreview', 'SL/TP terlewati harga');
    } else {
      ui.text('orderRrPreview', 'Isi SL & TP');
    }

    if (entry != null && sl != null && lot != null && lot > 0) {
      var riskUsd = Math.abs(entry - sl) * lot * tradesApi.CONTRACT_OZ;
      ui.text('orderRiskPreview', lot.toFixed(2) + ' lot · Risiko ' + fmtMoney(riskUsd, false));
    } else {
      ui.text('orderRiskPreview', 'Risiko belum terhitung');
    }

    syncChartTradeLevels();
  }

  function autoCalculateLot() {
    var form = ui.byId('tradeForm');
    if (!form) return;
    var entry = core.finite(form.elements.entry.value);
    var sl = core.finite(form.elements.stopLoss.value);
    if (entry == null || sl == null || Math.abs(entry - sl) <= 0) return;
    var stats = getSessionStats();
    var riskPct = activeSession ? Number(activeSession.riskPercent || 1) : 1;
    var lot = tradesApi.computeLotFromRisk(stats.currentBalanceUsd, riskPct, entry, sl);
    form.elements.lot.value = lot.toFixed(2);
    updateOrderPreview();
  }

  function applyQuickRr(multiplier) {
    var form = ui.byId('tradeForm');
    if (!form) return;
    var bias = form.elements.bias.value;
    if (bias === 'WAIT') return;
    var entry = core.finite(form.elements.entry.value);
    var sl = core.finite(form.elements.stopLoss.value);
    if (entry == null || sl == null || entry === sl) {
      ui.status('tradeStatus', 'Isi Entry dan Stop Loss terlebih dahulu untuk hitung TP ' + multiplier + 'R.', true);
      return;
    }
    var dist = Math.abs(entry - sl);
    var tp = bias === 'BUY' ? (entry + dist * multiplier) : (entry - dist * multiplier);
    form.elements.takeProfit.value = tp.toFixed(2);
    slTpPinnedByUser = true;
    autoCalculateLot();
    updateOrderPreview();
  }

  function syncTimeframeButtons(tf) {
    var bar = ui.byId('tfSegBar');
    if (!bar) return;
    bar.querySelectorAll('button[data-tf]').forEach(function (btn) {
      var active = btn.dataset.tf === tf;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  async function populateSources(preferredId) {
    var sel = ui.byId('replaySourceSelect');
    if (!sel) return data.SAMPLE_ID;
    var sources = await data.listSources('XAUUSD');
    sel.innerHTML = sources.map(function (s) {
      var label = s.sampleOnly ? s.label : window.AmyCloudLibraryUI.optionLabel(s);
      return '<option value="' + escapeHtml(s.id) + '">' + escapeHtml(label) + '</option>';
    }).join('');
    var targetId = preferredId || data.selectedSourceId();
    if (!sources.some(function (s) { return s.id === targetId; })) {
      targetId = sources.length > 1 ? sources[sources.length - 1].id : (sources[0] ? sources[0].id : data.SAMPLE_ID);
    }
    sel.value = targetId;
    data.setSelectedSourceId(targetId);
    return targetId;
  }

  function persistReplayCursor() {
    if (!replay || replay.cursor == null) return;
    storage.saveReplayState({
      sourceId: replay.sourceId,
      timeframe: replay.timeframe,
      cursor: replay.cursor
    });
  }

  function setPlayButtonLabel(playing) {
    var btn = ui.byId('playToggle');
    if (!btn) return;
    btn.textContent = playing ? 'Jeda' : 'Putar';
    btn.classList.toggle('bt-btn-primary', !playing);
  }

  function loadReplayBookmarks() {
    var insights = window.AmyTraderInsights;
    var key = (insights && insights.REPLAY_BOOKMARKS_KEY) || 'amy_replay_bookmarks_v1';
    try {
      var raw = localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      replayBookmarks = insights && insights.sortReplayBookmarks
        ? insights.sortReplayBookmarks(parsed)
        : (Array.isArray(parsed) ? parsed : []);
    } catch (_) {
      replayBookmarks = [];
    }
    return replayBookmarks;
  }

  function saveReplayBookmarks() {
    var insights = window.AmyTraderInsights;
    var key = (insights && insights.REPLAY_BOOKMARKS_KEY) || 'amy_replay_bookmarks_v1';
    try {
      localStorage.setItem(key, JSON.stringify(replayBookmarks));
    } catch (_) {}
  }

  function renderReplayBookmarks() {
    var countEl = ui.byId('bookmarkCount');
    var listEl = ui.byId('bookmarkList');
    if (countEl) countEl.textContent = String(replayBookmarks.length);
    if (!listEl) return;

    if (!replayBookmarks.length) {
      listEl.innerHTML = '<div class="bt-bm-empty">Belum ada momen tersimpan. Ketuk ★ Simpan saat menemukan setup A+.</div>';
      return;
    }

    listEl.innerHTML = replayBookmarks.slice(0, 25).map(function (bm) {
      var pxStr = bm.price != null ? ('$' + core.price(bm.price)) : '';
      return '<div class="bt-bm-row">' +
        '<button type="button" class="bt-bm-jump" data-bm-jump="' + escapeHtml(bm.id) + '">' +
          '<strong>' + escapeHtml(bm.note || 'Momen Setup') + '</strong>' +
          '<span class="tabular">' + escapeHtml(bm.timeLabel || '') + ' · ' + escapeHtml(bm.timeframe) + (pxStr ? ' · ' + pxStr : '') + '</span>' +
        '</button>' +
        '<button type="button" class="bt-bm-del" data-bm-del="' + escapeHtml(bm.id) + '" aria-label="Hapus bookmark">×</button>' +
      '</div>';
    }).join('');
  }

  function bindBookmarkControls() {
    loadReplayBookmarks();
    renderReplayBookmarks();

    var saveBtn = ui.byId('bookmarkMomentBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var bar = currentBar();
        if (!bar || !replay || replay.cursor == null) {
          ui.status('replayStatus', 'Tunggu data candle dimuat untuk menyimpan bookmark.', true);
          return;
        }
        var insights = window.AmyTraderInsights;
        var sess = core.classifyIctSession(replay.cursor);
        var sourceLabel = ui.byId('replaySourceBadge') ? ui.byId('replaySourceBadge').textContent : replay.sourceId;
        var rawBm = {
          id: 'bm_' + Date.now().toString(36),
          packId: replay.sourceId,
          sourceLabel: sourceLabel,
          timeframe: replay.timeframe,
          timestamp: replay.cursor,
          timeLabel: core.formatWita(replay.cursor, true),
          price: Number(bar.close),
          note: sess + ' · ' + replay.timeframe + ' · $' + core.price(bar.close),
          createdAt: Date.now()
        };
        var normalized = insights && insights.normalizeReplayBookmark ? insights.normalizeReplayBookmark(rawBm) : rawBm;
        if (!normalized) return;
        replayBookmarks = [normalized].concat(replayBookmarks.filter(function (item) {
          return !(item.packId === normalized.packId && item.timestamp === normalized.timestamp && item.timeframe === normalized.timeframe);
        })).slice(0, 40);
        saveReplayBookmarks();
        renderReplayBookmarks();
        ui.status('replayStatus', 'Momen setup tersimpan: ' + normalized.timeLabel + ' (' + normalized.timeframe + ').', false, true);
      });
    }

    var listEl = ui.byId('bookmarkList');
    if (listEl) {
      listEl.addEventListener('click', async function (evt) {
        var delBtn = evt.target.closest('[data-bm-del]');
        if (delBtn) {
          var delId = delBtn.dataset.bmDel;
          replayBookmarks = replayBookmarks.filter(function (b) { return b.id !== delId; });
          saveReplayBookmarks();
          renderReplayBookmarks();
          return;
        }
        var jumpBtn = evt.target.closest('[data-bm-jump]');
        if (!jumpBtn || !replay) return;
        var bmId = jumpBtn.dataset.bmJump;
        var bm = replayBookmarks.find(function (b) { return b.id === bmId; });
        if (!bm) return;

        var drawer = ui.byId('bookmarkDrawer');
        if (drawer) drawer.open = false;
        replay.pause();
        setPlayButtonLabel(false);

        try {
          if (bm.packId && bm.packId !== replay.sourceId) {
            var sources = await data.listSources('XAUUSD');
            if (sources.some(function (s) { return s.id === bm.packId; })) {
              await populateSources(bm.packId);
              await replay.setSource(bm.packId, bm.timestamp);
            } else {
              ui.status('replayStatus', 'Pack "' + bm.sourceLabel + '" belum terpasang. Unduh di Data Cloud terlebih dahulu.', true);
              return;
            }
          }
          if (bm.timeframe && bm.timeframe !== replay.timeframe) {
            syncTimeframeButtons(bm.timeframe);
            await replay.setTimeframe(bm.timeframe);
          }
          await replay.seek(bm.timestamp);
          ui.status('replayStatus', 'Melompat ke bookmark: ' + (bm.timeLabel || bm.note), false, true);
        } catch (err) {
          ui.status('replayStatus', err && err.message || 'Gagal melompat ke bookmark.', true);
        }
      });
    }
  }

  function hideNextMonthBanner() {
    var banner = ui.byId('nextMonthBanner');
    if (banner) banner.hidden = true;
    nextMonthCandidate = null;
  }

  async function showNextMonthHandoff() {
    var banner = ui.byId('nextMonthBanner');
    var textEl = ui.byId('nextMonthText');
    var btnEl = ui.byId('loadNextMonthBtn');
    var insights = window.AmyTraderInsights;
    if (!banner || !textEl || !btnEl || !insights || typeof insights.resolveNextMonthPack !== 'function') return;

    var bar = currentBar();
    var barYm = bar && bar.time ? new Date(Number(bar.time) * 1000).toISOString().slice(0, 7) : '';
    var badgeTxt = ui.byId('replaySourceBadge') ? ui.byId('replaySourceBadge').textContent : '';
    var hintSource = (replay && replay.sourceId && insights.parseYearMonth(replay.sourceId))
      ? replay.sourceId
      : (insights.parseYearMonth(badgeTxt) ? badgeTxt : barYm);

    var sources = await data.listSources('XAUUSD');
    var installedPacks = sources.filter(function (s) { return s.kind === 'pack'; }).map(function (s) {
      var startYm = s.start ? new Date(Number(s.start) * 1000).toISOString().slice(0, 7) : '';
      return { id: s.id, month: startYm, label: s.fileName || s.label || startYm };
    });

    if (!cachedCloudManifest) {
      try { cachedCloudManifest = await data.loadCloudManifest(); } catch (_) { cachedCloudManifest = null; }
    }
    var catalogItems = [];
    if (cachedCloudManifest && typeof cachedCloudManifest === 'object') {
      Object.keys(cachedCloudManifest).forEach(function (yr) {
        var list = cachedCloudManifest[yr];
        if (!Array.isArray(list)) return;
        list.forEach(function (item) {
          catalogItems.push({
            id: item.file,
            file: item.file,
            year: Number(yr),
            month: item.file,
            label: item.label
          });
        });
      });
    }

    var resolved = insights.resolveNextMonthPack(hintSource, catalogItems, installedPacks);
    nextMonthCandidate = resolved;

    if (!resolved) {
      textEl.textContent = 'Akhir bulan tercapai. Pilih dataset bulan lain di Data Cloud.';
      btnEl.textContent = 'Buka Data Cloud';
      banner.hidden = false;
      return;
    }

    if (resolved.installedPack) {
      textEl.textContent = 'Akhir ' + resolved.currentYm + ' tercapai · ' + resolved.label + ' sudah terpasang.';
      btnEl.textContent = 'Lanjut ke ' + resolved.label;
    } else if (resolved.cloudItem) {
      textEl.textContent = 'Akhir ' + resolved.currentYm + ' tercapai · Lanjut otomatis ke ' + resolved.label + '.';
      btnEl.textContent = 'Unduh & Buka ' + resolved.label;
    } else {
      textEl.textContent = 'Akhir ' + resolved.currentYm + ' tercapai · Pilih bulan lain di Data Cloud.';
      btnEl.textContent = 'Buka Data Cloud';
    }
    banner.hidden = false;
  }

  function bindNextMonthButton() {
    var btnEl = ui.byId('loadNextMonthBtn');
    if (!btnEl) return;
    btnEl.addEventListener('click', async function () {
      if (!nextMonthCandidate) {
        if (cloudUi) cloudUi.open();
        return;
      }
      if (nextMonthCandidate.installedPack) {
        var nextId = nextMonthCandidate.installedPack.id;
        hideNextMonthBanner();
        await populateSources(nextId);
        await replay.setSource(nextId, null);
        ui.status('replayStatus', 'Berpindah otomatis ke bulan berikutnya.', false, true);
        return;
      }
      if (nextMonthCandidate.cloudItem) {
        var origLabel = btnEl.textContent;
        btnEl.disabled = true;
        btnEl.textContent = 'Mengunduh…';
        try {
          var results = await data.installCloudPack(
            String(nextMonthCandidate.nextYear),
            nextMonthCandidate.cloudItem.file,
            function (prog) {
              if (prog && prog.message) ui.status('replayStatus', prog.message);
            }
          );
          if (cloudUi && cloudUi.refresh) await cloudUi.refresh();
          var targetId = results && results[0] ? results[0].id : null;
          hideNextMonthBanner();
          var selected = await populateSources(targetId);
          await replay.setSource(selected, null);
          ui.status('replayStatus', 'Bulan berikutnya berhasil diunduh & dibuka.', false, true);
        } catch (err) {
          ui.status('replayStatus', 'Gagal mengunduh bulan berikutnya: ' + (err && err.message || 'cek koneksi'), true);
        } finally {
          btnEl.disabled = false;
          btnEl.textContent = origLabel;
        }
        return;
      }
      if (cloudUi) cloudUi.open();
    });
  }

  function bindFormControls() {
    var form = ui.byId('tradeForm');
    if (!form) return;

    // Bias segmented buttons
    var biasSeg = ui.byId('biasSeg');
    if (biasSeg) {
      biasSeg.addEventListener('click', function (evt) {
        var btn = evt.target.closest('button[data-bias]');
        if (!btn) return;
        var val = btn.dataset.bias;
        form.elements.bias.value = val;
        biasSeg.querySelectorAll('button[data-bias]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.bias === val);
        });
        // Reset pinned SL/TP and suggest clean SL/TP geometry for chosen direction
        var px = currentPrice();
        if (px != null && val !== 'WAIT') {
          slTpPinnedByUser = false;
          if (form.elements.orderType.value === 'MARKET') form.elements.entry.value = px.toFixed(2);
          var entry = core.finite(form.elements.entry.value) || px;
          var sl = core.finite(form.elements.stopLoss.value);
          var tp = core.finite(form.elements.takeProfit.value);
          var validGeom = sl != null && tp != null && (
            (val === 'BUY' && sl < entry && entry < tp) ||
            (val === 'SELL' && tp < entry && entry < sl)
          );
          if (!validGeom) {
            form.elements.stopLoss.value = (val === 'BUY' ? entry - 5 : entry + 5).toFixed(2);
            form.elements.takeProfit.value = (val === 'BUY' ? entry + 10 : entry - 10).toFixed(2);
            autoCalculateLot();
          }
        }
        updateOrderPreview();
      });
    }

    // Order type segmented buttons
    var orderSeg = ui.byId('orderTypeSeg');
    if (orderSeg) {
      orderSeg.addEventListener('click', function (evt) {
        var btn = evt.target.closest('button[data-order-type]');
        if (!btn) return;
        var val = btn.dataset.orderType;
        syncOrderTypeButtons(val);
        var px = currentPrice();
        if (val === 'MARKET' && px != null) {
          slTpPinnedByUser = false;
          syncMarketOrderPrices(px);
        }
        updateOrderPreview();
      });
    }

    // Tap target selector for clicking chart (explicit toggle ON/OFF, never stuck ON by default)
    document.querySelectorAll('[data-tap-target]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var target = chip.dataset.tapTarget;
        tapTarget = tapTarget === target ? null : target;
        syncTapChips();
        if (tapTarget) {
          ui.status('tradeStatus', 'Mode Tap aktif: ketuk chart untuk mengisi ' + tapTarget.toUpperCase() + '.');
        } else {
          ui.status('tradeStatus', 'Mode Tap dimatikan.');
        }
      });
    });

    ['entry', 'stopLoss', 'takeProfit', 'lot'].forEach(function (name) {
      if (!form.elements[name]) return;
      form.elements[name].addEventListener('input', function () {
        if (name === 'entry' && form.elements.orderType.value === 'MARKET') {
          syncOrderTypeButtons('LIMIT');
        }
        if (name === 'stopLoss' || name === 'takeProfit') {
          slTpPinnedByUser = true;
        }
        if (name === 'stopLoss' || name === 'entry') autoCalculateLot();
        else updateOrderPreview();
      });
    });

    var autoLotBtn = ui.byId('autoLotBtn');
    if (autoLotBtn) autoLotBtn.addEventListener('click', autoCalculateLot);
    var rr2Btn = ui.byId('quickRr2');
    if (rr2Btn) rr2Btn.addEventListener('click', function () { applyQuickRr(2); });
    var rr3Btn = ui.byId('quickRr3');
    if (rr3Btn) rr3Btn.addEventListener('click', function () { applyQuickRr(3); });

    form.addEventListener('submit', function (evt) {
      evt.preventDefault();
      var bar = currentBar();
      if (!bar || !replay || replay.cursor == null) {
        ui.status('tradeStatus', 'Tunggu hingga data candle selesai dimuat.', true);
        return;
      }
      enqueueTradeTask(async function () {
        try {
          var liveBar = currentBar() || bar;
          var stats = getSessionStats();
          var record = await ui.saveTrade(form, {
            sessionId: activeSession ? activeSession.id : storage.getActiveSessionId(),
            symbol: 'XAUUSD',
            timeframe: replay.timeframe,
            sourceId: replay.sourceId,
            replayStartTime: replay.startTime || replay.cursor,
            tradeTime: replay.cursor,
            currentPrice: liveBar.close,
            currentCandle: liveBar,
            spreadUsd: spreadUsd,
            balanceUsd: stats.currentBalanceUsd,
            riskPercent: activeSession ? activeSession.riskPercent : 1,
            nonce: Date.now().toString(36)
          });
          slTpPinnedByUser = false;
          ui.status('tradeStatus', record.bias === 'WAIT'
            ? 'Catatan observasi WAIT tersimpan di riwayat sesi.'
            : (record.bias + ' ' + record.orderType + ' ' + record.lot.toFixed(2) + ' lot dieksekusi di ' + core.price(record.fillPrice || record.entry) + '.'), false, true);
          if (form.elements.notes) form.elements.notes.value = '';
          await runRefreshTradesAndEvaluate();
        } catch (err) {
          ui.status('tradeStatus', err && err.message || 'Gagal mencatat eksekusi.', true);
        }
      });
    });
  }

  function bindActivePositionActions() {
    var host = ui.byId('activePositionsList');
    if (!host) return;
    host.addEventListener('click', function (evt) {
      var beBtn = evt.target.closest('[data-pos-be]');
      if (beBtn) {
        var idBe = beBtn.dataset.posBe;
        enqueueTradeTask(async function () {
          var bar = currentBar();
          var px = bar ? bar.close : null;
          var trBe = sessionTrades.find(function (t) { return t.id === idBe; });
          if (!trBe) return;
          try {
            var updatedBe = tradesApi.moveStopToBreakeven(trBe, px);
            await storage.saveTrade(updatedBe);
            ui.status('tradeStatus', 'Stop Loss digeser ke Breakeven (' + core.price(updatedBe.stopLoss) + ').', false, true);
            await runRefreshTradesAndEvaluate();
          } catch (err) {
            ui.status('tradeStatus', err && err.message || 'Gagal memindahkan ke BE.', true);
          }
        });
        return;
      }

      var partBtn = evt.target.closest('[data-pos-partial]');
      if (partBtn) {
        var idP = partBtn.dataset.posPartial;
        enqueueTradeTask(async function () {
          var bar = currentBar();
          var px = bar ? bar.close : null;
          var ts = replay ? replay.cursor : Math.floor(Date.now() / 1000);
          var trP = sessionTrades.find(function (t) { return t.id === idP; });
          if (!trP) return;
          try {
            var updatedP = tradesApi.closePartial(trP, px, 0.5, ts);
            await storage.saveTrade(updatedP);
            var lastPart = updatedP.partials[updatedP.partials.length - 1];
            ui.status('tradeStatus', 'Partial 50% dikunci ke Saldo: ' + fmtMoney(lastPart.pnlUsd, true) + ' (' + (lastPart.r >= 0 ? '+' : '') + lastPart.r.toFixed(2) + 'R).', false, true);
            await runRefreshTradesAndEvaluate();
          } catch (err) {
            ui.status('tradeStatus', err && err.message || 'Gagal partial close.', true);
          }
        });
        return;
      }

      var closeBtn = evt.target.closest('[data-pos-close]');
      if (closeBtn) {
        var idC = closeBtn.dataset.posClose;
        enqueueTradeTask(async function () {
          var bar = currentBar();
          var px = bar ? bar.close : null;
          var ts = replay ? replay.cursor : Math.floor(Date.now() / 1000);
          var trC = sessionTrades.find(function (t) { return t.id === idC; });
          if (!trC) return;
          try {
            var updatedC = tradesApi.closeManual(trC, px, ts);
            await storage.saveTrade(updatedC);
            ui.status('tradeStatus', updatedC.result === 'CANCELLED'
              ? 'Limit order dibatalkan.'
              : ('Posisi ditutup manual di ' + core.price(updatedC.exitPrice) + ' · ' + fmtMoney(updatedC.pnlUsd, true) + ' (' + (updatedC.r >= 0 ? '+' : '') + Number(updatedC.r).toFixed(2) + 'R).'), updatedC.result === 'LOSS', updatedC.result === 'WIN');
            await runRefreshTradesAndEvaluate();
          } catch (err) {
            ui.status('tradeStatus', err && err.message || 'Gagal menutup posisi.', true);
          }
        });
      }
    });
  }

  function bindTradesTableActions() {
    var tbody = ui.byId('replayTradesBody');
    if (!tbody) return;
    tbody.addEventListener('click', function (evt) {
      var expBtn = evt.target.closest('[data-export-journal]');
      if (expBtn) {
        var tid = expBtn.dataset.exportJournal;
        var rec = sessionTrades.find(function (t) { return t.id === tid; });
        if (!rec) return;
        try {
          storage.exportTradeToJournal(rec);
          expBtn.textContent = '✓ Jurnal';
          expBtn.disabled = true;
          ui.status('tradeStatus', 'Trade dikirim ke Jurnal Trading (Mode SIM · Backtest Lab).', false, true);
        } catch (err) {
          ui.status('tradeStatus', err && err.message || 'Gagal mengirim ke Jurnal.', true);
        }
        return;
      }

      var delBtn = evt.target.closest('[data-delete-trade]');
      if (delBtn) {
        var delId = delBtn.dataset.deleteTrade;
        if (pendingDeleteTradeId !== delId) {
          pendingDeleteTradeId = delId;
          renderSessionTradesTable();
          return;
        }
        pendingDeleteTradeId = null;
        enqueueTradeTask(async function () {
          await storage.deleteTrade(delId);
          await runRefreshTradesAndEvaluate();
        });
      }
    });
  }

  function bindSessionControls() {
    var sel = ui.byId('sessionSelect');
    if (sel) {
      sel.addEventListener('change', function () {
        enqueueTradeTask(async function () {
          storage.setActiveSessionId(sel.value);
          activeSession = storage.getActiveSession();
          pendingDeleteTradeId = null;
          await runRefreshTradesAndEvaluate();
          autoCalculateLot();
        });
      });
    }

    var currWrap = ui.byId('currencyToggle');
    if (currWrap) {
      currWrap.addEventListener('click', function (evt) {
        var btn = evt.target.closest('button[data-currency]');
        if (!btn) return;
        displayCurrency = storage.saveDisplayCurrency ? storage.saveDisplayCurrency(btn.dataset.currency) : btn.dataset.currency;
        syncCurrencyButtons();
        renderSessionSelect();
        renderAccountBar();
        renderActivePositions();
        renderSessionTradesTable();
        updateOrderPreview();
      });
    }

    var resetBtn = ui.byId('resetSessionBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!pendingResetSession) {
          pendingResetSession = true;
          resetBtn.textContent = 'Yakin Reset?';
          resetBtn.classList.add('is-confirm');
          clearTimeout(resetTimer);
          resetTimer = setTimeout(function () {
            pendingResetSession = false;
            resetBtn.textContent = 'Reset';
            resetBtn.classList.remove('is-confirm');
          }, 4000);
          return;
        }
        clearTimeout(resetTimer);
        pendingResetSession = false;
        resetBtn.textContent = 'Reset';
        resetBtn.classList.remove('is-confirm');
        enqueueTradeTask(async function () {
          await storage.resetSessionTrades(activeSession ? activeSession.id : 'default');
          ui.status('tradeStatus', 'Riwayat trade pada sesi ini telah di-reset ke saldo awal.', false, true);
          await runRefreshTradesAndEvaluate();
          autoCalculateLot();
        });
      });
    }

    var editBtn = ui.byId('editSessionBtn');
    var newBtn = ui.byId('newSessionBtn');
    var dlg = ui.byId('sessionDialog');
    var closeDlg = ui.byId('closeSessionDialog');
    var sessForm = ui.byId('newSessionForm');

    function openSessionDialog(mode) {
      if (!dlg || !sessForm) return;
      sessionDialogMode = mode === 'edit' ? 'edit' : 'create';
      var prof = storage.readProfileAccountParams();
      usdIdrRate = prof.usdIdrRate || usdIdrRate;
      var curSess = storage.getActiveSession();
      var titleEl = ui.byId('sessionDialogTitle');
      var nameField = ui.byId('sessionNameField');
      var balLabel = ui.byId('sessionBalLabel');
      var submitBtn = ui.byId('sessionSubmitBtn');
      var isIdr = displayCurrency === 'IDR';

      if (titleEl) titleEl.textContent = sessionDialogMode === 'edit' ? ('Atur Modal · ' + curSess.name) : 'Sesi Baru';
      if (nameField) nameField.hidden = sessionDialogMode === 'edit';
      if (sessForm.elements.sessionName) {
        sessForm.elements.sessionName.required = sessionDialogMode !== 'edit';
        sessForm.elements.sessionName.value = sessionDialogMode === 'edit' ? curSess.name : '';
      }
      if (balLabel) balLabel.textContent = isIdr ? 'Modal (Rp)' : 'Modal ($)';
      if (submitBtn) submitBtn.textContent = sessionDialogMode === 'edit' ? 'Simpan Modal & Risiko' : 'Simpan Sesi';

      var baseUsd = sessionDialogMode === 'edit' ? Number(curSess.initialBalanceUsd || prof.balanceUsd) : Number(prof.balanceUsd);
      var baseRisk = sessionDialogMode === 'edit' ? Number(curSess.riskPercent || prof.riskPercent) : Number(prof.riskPercent);
      if (sessForm.elements.sessionBalance) {
        sessForm.elements.sessionBalance.value = isIdr ? String(Math.round(baseUsd * usdIdrRate)) : String(Math.round(baseUsd * 100) / 100);
      }
      if (sessForm.elements.sessionRisk) {
        sessForm.elements.sessionRisk.value = String(baseRisk);
      }
      ui.status('sessionDialogStatus', '');
      if (typeof dlg.showModal === 'function' && !dlg.open) dlg.showModal();
      else dlg.setAttribute('open', '');
    }

    if (editBtn && dlg) {
      editBtn.addEventListener('click', function () { openSessionDialog('edit'); });
    }
    if (newBtn && dlg) {
      newBtn.addEventListener('click', function () { openSessionDialog('create'); });
    }
    if (closeDlg && dlg) {
      closeDlg.addEventListener('click', function () { if (dlg.open) dlg.close(); });
    }
    if (sessForm && dlg) {
      sessForm.addEventListener('submit', function (evt) {
        evt.preventDefault();
        enqueueTradeTask(async function () {
          try {
            var rawInputBal = Number(sessForm.elements.sessionBalance.value);
            var riskVal = Number(sessForm.elements.sessionRisk.value);
            if (!Number.isFinite(rawInputBal) || rawInputBal <= 0) {
              throw new Error('Modal harus berupa angka lebih besar dari 0.');
            }
            var balUsd = displayCurrency === 'IDR' ? (rawInputBal / usdIdrRate) : rawInputBal;
            if (balUsd < 10) {
              throw new Error(displayCurrency === 'IDR'
                ? ('Modal minimal ' + fmtMoney(10, false) + '.')
                : 'Modal minimal $10.');
            }
            if (sessionDialogMode === 'edit') {
              storage.updateSessionParams(activeSession ? activeSession.id : 'default', balUsd, riskVal);
              if (dlg.open) dlg.close();
              profileParams = storage.readProfileAccountParams();
              renderSessionSelect();
              await runRefreshTradesAndEvaluate();
              autoCalculateLot();
              ui.status('tradeStatus', 'Modal simulasi diperbarui menjadi ' + fmtMoney(activeSession.initialBalanceUsd, false) + ' (Risiko ' + activeSession.riskPercent + '%).', false, true);
            } else {
              storage.createSession(sessForm.elements.sessionName.value, balUsd, riskVal);
              if (dlg.open) dlg.close();
              renderSessionSelect();
              await runRefreshTradesAndEvaluate();
              autoCalculateLot();
              ui.status('tradeStatus', 'Sesi backtest baru dibuat & aktif.', false, true);
            }
          } catch (err) {
            ui.status('sessionDialogStatus', err && err.message || 'Gagal menyimpan sesi.', true);
          }
        });
      });
    }

    // Live-sync if Profile parameters change in another tab/page
    window.addEventListener('storage', function (evt) {
      if (!evt || !evt.key || /^(amy_default_|amy_account_|amy_usd_idr_rate|amy_sim_cashflows_v1|amy\.backtest\.)/.test(evt.key)) {
        profileParams = storage.readProfileAccountParams();
        displayCurrency = profileParams.currency || displayCurrency;
        usdIdrRate = profileParams.usdIdrRate || usdIdrRate;
        spreadUsd = profileParams.spreadUsd != null ? profileParams.spreadUsd : spreadUsd;
        syncCurrencyButtons();
        renderSessionSelect();
        renderAccountBar();
        renderActivePositions();
        renderSessionTradesTable();
        autoCalculateLot();
      }
    });
  }

  async function init() {
    renderSessionSelect();
    syncCurrencyButtons();
    syncTapChips();

    var chartEl = ui.byId('chart');
    chart = new window.AmyCandleChart.CandleChart(chartEl, {
      storageKey: 'amy.backtest.replay.drawings.v2',
      followReplay: true,
      allowDrawingProjection: true,
      timeframeSeconds: 900,
      onCrosshair: function (candle, time) {
        if (candle) ui.renderOhlc('ohlc', candle, Number(time));
        else {
          var bar = currentBar();
          if (bar) ui.renderOhlc('ohlc', bar, bar.time);
        }
      },
      onCutModeChange: function (active) {
        var cutBtn = ui.byId('replayCutBtn');
        if (cutBtn) {
          cutBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
          cutBtn.classList.toggle('active', Boolean(active));
        }
      },
      onChartTap: function (pt) {
        // Only populate form when user explicitly enabled a Tap chip (never hijack casual chart taps!)
        if (!tapTarget) return;
        var form = ui.byId('tradeForm');
        if (!form || !pt || !Number.isFinite(pt.price)) return;
        if (form.elements.bias.value === 'WAIT') return;
        var field = tapTarget;
        if (field === 'entry' && form.elements.orderType.value === 'MARKET') {
          syncOrderTypeButtons('LIMIT');
        }
        if (field === 'stopLoss' || field === 'takeProfit') {
          slTpPinnedByUser = true;
        }
        if (form.elements[field]) {
          form.elements[field].value = pt.price.toFixed(2);
          if (field === 'stopLoss' || field === 'entry') autoCalculateLot();
          else updateOrderPreview();
          ui.status('tradeStatus', 'Harga ' + field.toUpperCase() + ' diisi dari chart: ' + pt.price.toFixed(2) + '.');
        }
        tapTarget = null;
        syncTapChips();
      }
    });
    chart.setTool(null);
    ui.bindDrawingToolbar(chart);

    function setIctEnabled(enabled) {
      ictOverlayEnabled = Boolean(enabled);
      var ictBtnEl = ui.byId('replayIctToggle');
      var indIctCb = ui.byId('indIctCheckbox');
      if (ictBtnEl) {
        ictBtnEl.setAttribute('aria-pressed', ictOverlayEnabled ? 'true' : 'false');
        ictBtnEl.classList.toggle('active', ictOverlayEnabled);
      }
      if (indIctCb) indIctCb.checked = ictOverlayEnabled;
      syncIctLevels();
    }

    function updateQuickTradePrices(px) {
      var bidEl = ui.byId('qtBidPrice');
      var askEl = ui.byId('qtAskPrice');
      var spEl = ui.byId('qtSpreadLabel');
      var sp = Math.max(0, Number(spreadUsd || 0.25));
      if (spEl) spEl.textContent = sp.toFixed(2);
      if (px == null || !Number.isFinite(Number(px))) {
        if (bidEl) bidEl.textContent = '—';
        if (askEl) askEl.textContent = '—';
        return;
      }
      var half = sp / 2;
      if (bidEl) bidEl.textContent = (Number(px) - half).toFixed(2);
      if (askEl) askEl.textContent = (Number(px) + half).toFixed(2);
    }

    function updateScrubber(payload) {
      var scrub = ui.byId('replayScrubber');
      var counter = ui.byId('replayBarCounter');
      if (!payload) return;
      var total = Number(payload.totalBars || 0);
      var idx = Number(payload.cursorIndex || 0);
      if (scrub && total > 0) {
        scrub.min = '0';
        scrub.max = String(Math.max(0, total - 1));
        scrub.value = String(idx);
      }
      if (counter) {
        counter.textContent = total > 0 ? ('Bar ' + (idx + 1).toLocaleString('id-ID') + ' / ' + total.toLocaleString('id-ID')) : 'Bar — / —';
      }
    }

    // Wire ICT Level overlay toggle (synced with Indicators menu checkbox)
    var ictBtn = ui.byId('replayIctToggle');
    if (ictBtn) {
      ictBtn.addEventListener('click', function () { setIctEnabled(!ictOverlayEnabled); });
    }

    var savedState = storage.loadReplayState();
    var initialSourceId = await populateSources(savedState && savedState.sourceId);
    var initialTf = (savedState && savedState.timeframe && core.timeframeSeconds(savedState.timeframe)) ? savedState.timeframe : 'M15';
    syncTimeframeButtons(initialTf);

    replay = new window.AmyReplayEngine.ReplayController({
      provider: data,
      symbol: 'XAUUSD',
      timeframe: initialTf,
      sourceId: initialSourceId,
      speedMs: Number(ui.byId('speedSelect') ? ui.byId('speedSelect').value : 700),
      onEnd: function () {
        setPlayButtonLabel(false);
        ui.status('replayStatus', 'Akhir pack tercapai. Lanjut ke bulan berikutnya di bawah atau buka Data Cloud.');
        showNextMonthHandoff();
      },
      onChange: async function (payload) {
        if (!payload) return;
        visibleCandles = payload.candles || [];
        chart.options.timeframeSeconds = core.timeframeSeconds(payload.timeframe) || 900;
        chart.setWatermark('XAU/USD · ' + payload.timeframe);
        chart.setDrawingTimeBoundary(payload.cursor);
        chart.setCandles(visibleCandles, payload.reason === 'start' || payload.reason === 'timeframe');

        var bar = currentBar();
        if (bar) {
          ui.renderOhlc('ohlc', bar, bar.time);
          updateQuickTradePrices(Number(bar.close));
        }
        updateScrubber(payload);
        var sess = core.classifyIctSession(payload.cursor);
        ui.text('replaySessionBadge', sess);
        ui.text('replaySourceBadge', payload.sampleOnly ? 'Sample · Jan 2025' : payload.source);
        ui.status('replayStatus', payload.timeframe + ' · ' + visibleCandles.length.toLocaleString('id-ID') + ' candle terlihat · Sesi ' + sess);

        if (payload.atEnd || (payload.endTime && payload.cursor >= payload.endTime)) {
          showNextMonthHandoff();
        } else {
          hideNextMonthBanner();
        }

        // Auto-sync MARKET entry (and unpinned SL/TP distance) to current close
        if (bar) {
          syncMarketOrderPrices(Number(bar.close));
        }

        persistReplayCursor();
        syncIctLevels();
        await refreshTradesAndEvaluate();
        updateOrderPreview();
      }
    });

    // Cloud Library Data Manager Modal
    cloudUi = window.AmyCloudLibraryUI.mount({
      dialogId: 'dataManagerDialog',
      onDatasetChanged: async function (newSourceId) {
        var selected = await populateSources(newSourceId);
        await replay.setSource(selected, null);
      }
    });

    var openCloudBtn = ui.byId('openDataManager');
    if (openCloudBtn && cloudUi) {
      openCloudBtn.addEventListener('click', function () { cloudUi.open(); });
    }

    // Source dropdown switch
    var sourceSelect = ui.byId('replaySourceSelect');
    if (sourceSelect) {
      sourceSelect.addEventListener('change', async function () {
        var nextId = sourceSelect.value;
        data.setSelectedSourceId(nextId);
        setPlayButtonLabel(false);
        try {
          await replay.setSource(nextId, null);
        } catch (err) {
          ui.status('replayStatus', err && err.message || 'Gagal memuat pack.', true);
        }
      });
    }

    // Quick MTF segmented bar
    var tfBar = ui.byId('tfSegBar');
    if (tfBar) {
      tfBar.addEventListener('click', async function (evt) {
        var btn = evt.target.closest('button[data-tf]');
        if (!btn) return;
        var nextTf = btn.dataset.tf;
        syncTimeframeButtons(nextTf);
        setPlayButtonLabel(false);
        try {
          await replay.setTimeframe(nextTf);
        } catch (err) {
          ui.status('replayStatus', err && err.message || 'Timeframe tidak tersedia pada pack ini.', true);
        }
      });
    }

    // Playback transport buttons
    document.querySelectorAll('[data-step]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        replay.pause();
        setPlayButtonLabel(false);
        await replay.move(Number(btn.dataset.step));
      });
    });

    var playBtn = ui.byId('playToggle');
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        if (replay.playTimer) {
          replay.pause();
          setPlayButtonLabel(false);
        } else {
          replay.play();
          setPlayButtonLabel(true);
        }
      });
    }

    var speedSel = ui.byId('speedSelect');
    if (speedSel) {
      speedSel.addEventListener('change', function () {
        replay.setSpeed(Number(speedSel.value));
      });
    }

    // Killzone jump buttons
    document.querySelectorAll('[data-killzone]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        setPlayButtonLabel(false);
        var target = btn.dataset.killzone;
        var jumped = await replay.jumpToKillzone(target);
        if (!jumped) {
          ui.status('replayStatus', 'Tidak ada Killzone ' + target + ' berikutnya di pack ini.', true);
        }
      });
    });

    // Jump to date/time
    var jumpBtn = ui.byId('jumpDateBtn');
    var jumpInput = ui.byId('jumpDateInput');
    if (jumpBtn && jumpInput) {
      jumpBtn.addEventListener('click', async function () {
        if (!jumpInput.value) return;
        var ts = Math.floor(Date.parse(jumpInput.value) / 1000);
        if (!Number.isFinite(ts)) return;
        setPlayButtonLabel(false);
        await replay.seek(ts);
      });
    }

    // Pro Studio Controls: Chart Style, Indicators, Bar-Cut, 1-Click Execution, RR->Order, Scrubber, Scale, Random, Snapshot, Shortcuts
    var styleSel = ui.byId('chartStyleSelect');
    if (styleSel) {
      styleSel.addEventListener('change', function () {
        chart.setChartStyle(styleSel.value);
      });
    }

    var indPanel = ui.byId('tvIndicatorPanel');
    if (indPanel) {
      indPanel.addEventListener('change', function (evt) {
        var cb = evt.target;
        if (!cb || cb.type !== 'checkbox') return;
        if (cb.id === 'indIctCheckbox') {
          setIctEnabled(cb.checked);
          return;
        }
        var key = cb.dataset.indicator;
        if (!key) return;
        var patch = {};
        patch[key] = cb.checked;
        chart.setIndicators(patch);
        var activeCount = Object.keys(chart.indicators).filter(function (k) { return chart.indicators[k]; }).length;
        var summaryEl = document.querySelector('#tvIndicatorMenu > summary');
        if (summaryEl) summaryEl.setAttribute('aria-pressed', activeCount > 0 ? 'true' : 'false');
      });
    }

    // Bar-Cut ("Potong Bar" scissor mode)
    var cutBtn = ui.byId('replayCutBtn');
    if (cutBtn) {
      cutBtn.addEventListener('click', async function () {
        if (chart.cutMode && chart.cutMode.active) {
          chart.setCutMode(false);
          ui.status('replayStatus', 'Mode Potong Bar dibatalkan.');
          return;
        }
        replay.pause();
        setPlayButtonLabel(false);
        ui.status('replayStatus', 'Memuat timeline penuh untuk Potong Bar…');
        try {
          var full = await replay.getFullTimelineCandles();
          chart.setCutMode(true, full, async function (clickedTime) {
            var targetTs = window.AmyReplayIndicators
              ? window.AmyReplayIndicators.resolveCutBarTimestamp(replay.timeline, clickedTime)
              : clickedTime;
            await replay.seek(targetTs);
            ui.status('replayStatus', 'Replay dipotong & dimulai dari ' + core.formatWita(targetTs, true) + '.', false, true);
          });
        } catch (err) {
          ui.status('replayStatus', err && err.message || 'Gagal membuka mode Potong Bar.', true);
        }
      });
    }

    // 1-Click Floating Instant Order Strip
    var qtToggle = ui.byId('replayQuickTradeToggle');
    var qtBar = ui.byId('tvQuickTradeBar');
    if (qtToggle && qtBar) {
      qtToggle.addEventListener('click', function () {
        var show = qtBar.hidden;
        qtBar.hidden = !show;
        qtToggle.setAttribute('aria-pressed', show ? 'true' : 'false');
        var form = ui.byId('tradeForm');
        var lotIn = ui.byId('qtLotInput');
        if (show && form && form.elements.lot && lotIn) {
          lotIn.value = Number(form.elements.lot.value || 0.10).toFixed(2);
        }
      });
    }

    function executeQuickMarketOrder(direction) {
      var bar = currentBar();
      if (!bar || !replay || replay.cursor == null) {
        ui.status('tradeStatus', 'Tunggu data candle dimuat sebelum eksekusi 1-Klik.', true);
        return;
      }
      var lotIn = ui.byId('qtLotInput');
      var lotVal = Math.max(0.01, Math.min(50, Number(lotIn ? lotIn.value : 0.10) || 0.10));
      var px = Number(bar.close);
      var sl = direction === 'BUY' ? (px - 5) : (px + 5);
      var tp = direction === 'BUY' ? (px + 10) : (px - 10);
      enqueueTradeTask(async function () {
        try {
          var stats = getSessionStats();
          var rec = tradesApi.create({
            bias: direction,
            orderType: 'MARKET',
            entry: px,
            stopLoss: sl,
            takeProfit: tp,
            lot: lotVal,
            setupType: 'Auto',
            notes: '1-Klik Instant Order',
            sessionId: activeSession ? activeSession.id : storage.getActiveSessionId(),
            symbol: 'XAUUSD',
            timeframe: replay.timeframe,
            sourceId: replay.sourceId,
            replayStartTime: replay.startTime || replay.cursor,
            tradeTime: replay.cursor,
            currentPrice: px,
            currentCandle: bar,
            spreadUsd: spreadUsd,
            balanceUsd: stats.currentBalanceUsd,
            riskPercent: activeSession ? activeSession.riskPercent : 1,
            nonce: Date.now().toString(36)
          });
          await storage.saveTrade(rec);
          ui.status('tradeStatus', '1-Klik ' + direction + ' ' + rec.lot.toFixed(2) + ' lot dieksekusi di ' + core.price(rec.fillPrice || rec.entry) + ' (SL ' + core.price(sl) + ' · TP ' + core.price(tp) + ').', false, true);
          await runRefreshTradesAndEvaluate();
        } catch (err) {
          ui.status('tradeStatus', err && err.message || 'Gagal eksekusi 1-Klik.', true);
        }
      });
    }

    var qtSellBtn = ui.byId('qtSellBtn');
    var qtBuyBtn = ui.byId('qtBuyBtn');
    if (qtSellBtn) qtSellBtn.addEventListener('click', function () { executeQuickMarketOrder('SELL'); });
    if (qtBuyBtn) qtBuyBtn.addEventListener('click', function () { executeQuickMarketOrder('BUY'); });

    // Send Long/Short Position Drawing directly into Order Ticket (1-Click Sync!)
    var sendObjBtn = ui.byId('tvObjSendOrderBtn');
    if (sendObjBtn) {
      sendObjBtn.addEventListener('click', function () {
        var sel = chart.getSelectedDrawing ? chart.getSelectedDrawing() : null;
        if (!sel || (sel.type !== 'longPosition' && sel.type !== 'shortPosition')) return;
        var pos = window.AmyPracticeDrawing && window.AmyPracticeDrawing.positionStats(sel);
        if (!pos || !pos.valid) {
          ui.status('tradeStatus', 'Geometri proyeksi R:R tidak valid untuk dikirim ke Order.', true);
          return;
        }
        var form = ui.byId('tradeForm');
        if (!form) return;
        var bias = sel.type === 'longPosition' ? 'BUY' : 'SELL';
        form.elements.bias.value = bias;
        var biasSeg = ui.byId('biasSeg');
        if (biasSeg) {
          biasSeg.querySelectorAll('button[data-bias]').forEach(function (b) {
            b.classList.toggle('is-active', b.dataset.bias === bias);
          });
        }
        var px = currentPrice();
        var isNearMarket = px != null && Math.abs(pos.entry - px) <= 0.5;
        syncOrderTypeButtons(isNearMarket ? 'MARKET' : 'LIMIT');
        form.elements.entry.value = pos.entry.toFixed(2);
        form.elements.stopLoss.value = pos.stop.toFixed(2);
        form.elements.takeProfit.value = pos.target.toFixed(2);
        slTpPinnedByUser = true;
        autoCalculateLot();
        updateOrderPreview();
        ui.status('tradeStatus', 'Proyeksi ' + bias + ' (' + pos.rr.toFixed(2) + 'R) disalin ke Tiket Order.', false, true);
      });
    }

    // Timeline Scrubber Seek
    var scrubEl = ui.byId('replayScrubber');
    if (scrubEl) {
      scrubEl.addEventListener('change', async function () {
        replay.pause();
        setPlayButtonLabel(false);
        await replay.seekByIndex(Number(scrubEl.value));
      });
    }

    // Reset to Replay Start & Random Bar
    var resetStartBtn = ui.byId('replayResetStartBtn');
    if (resetStartBtn) {
      resetStartBtn.addEventListener('click', async function () {
        replay.pause();
        setPlayButtonLabel(false);
        var startTs = replay.startTime || (replay.timeline && replay.timeline[Math.min(80, Math.max(0, replay.timeline.length - 1))]);
        if (startTs != null) {
          await replay.seek(startTs);
          ui.status('replayStatus', 'Kembali ke titik awal sesi Replay.', false, true);
        }
      });
    }

    var randomBtn = ui.byId('replayRandomBtn');
    if (randomBtn) {
      randomBtn.addEventListener('click', async function () {
        replay.pause();
        setPlayButtonLabel(false);
        await replay.jumpToRandom();
        ui.status('replayStatus', 'Melompat ke candle acak untuk latihan blind backtest.', false, true);
      });
    }

    // Scale Modes (%, Log, Auto)
    document.querySelectorAll('[data-scale-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.dataset.scaleMode;
        var nextMode = chart.priceScaleMode === mode ? 'normal' : mode;
        chart.setPriceScaleMode(nextMode);
        document.querySelectorAll('[data-scale-mode]').forEach(function (other) {
          var on = other.dataset.scaleMode === nextMode;
          other.classList.toggle('is-active', on);
          other.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        var autoBtn = ui.byId('scaleAutoBtn');
        if (autoBtn) autoBtn.classList.toggle('is-active', nextMode === 'normal');
      });
    });

    var scaleAutoBtn = ui.byId('scaleAutoBtn');
    if (scaleAutoBtn) {
      scaleAutoBtn.addEventListener('click', function () {
        chart.setPriceScaleMode('normal');
        chart.resetChartScale();
        document.querySelectorAll('[data-scale-mode]').forEach(function (other) {
          other.classList.remove('is-active');
          other.setAttribute('aria-pressed', 'false');
        });
        scaleAutoBtn.classList.add('is-active');
      });
    }

    // Chart PNG Snapshot
    var snapBtn = ui.byId('replaySnapshotBtn');
    if (snapBtn) {
      snapBtn.addEventListener('click', async function () {
        var bar = currentBar();
        var stamp = bar ? core.formatWita(bar.time, true) : '';
        var dataUrl = await chart.exportSnapshotDataUrl('Amy FX Replay · XAU/USD ' + replay.timeframe + (stamp ? ' · ' + stamp : ''));
        if (!dataUrl) {
          ui.status('replayStatus', 'Gagal membuat screenshot chart.', true);
          return;
        }
        var link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'amyfx-replay-XAUUSD-' + replay.timeframe + '-' + Date.now() + '.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
        ui.status('replayStatus', 'Screenshot chart berhasil disimpan (PNG).', false, true);
      });
    }

    // Keyboard Shortcuts Modal & Pro Hotkeys
    var shortcutDlg = ui.byId('shortcutHelpDialog');
    var shortcutBtn = ui.byId('replayShortcutBtn');
    var closeShortcutBtn = ui.byId('closeShortcutHelp');
    function toggleShortcutHelp() {
      if (!shortcutDlg) return;
      if (shortcutDlg.open) shortcutDlg.close();
      else if (typeof shortcutDlg.showModal === 'function') shortcutDlg.showModal();
      else shortcutDlg.setAttribute('open', '');
    }
    if (shortcutBtn) shortcutBtn.addEventListener('click', toggleShortcutHelp);
    if (closeShortcutBtn && shortcutDlg) closeShortcutBtn.addEventListener('click', function () { if (shortcutDlg.open) shortcutDlg.close(); });

    function handleReplayHotkeys(evt) {
      var tag = evt.target && evt.target.tagName ? evt.target.tagName.toUpperCase() : '';
      var isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (evt.target && evt.target.isContentEditable);
      if (isEditable || chart.textEditor) return;

      var key = evt.key;
      var lower = String(key || '').toLowerCase();

      if (key === '?' || (evt.shiftKey && key === '/')) {
        evt.preventDefault();
        toggleShortcutHelp();
        return;
      }
      if (key === ' ' && !evt.ctrlKey && !evt.metaKey && !evt.altKey) {
        evt.preventDefault();
        var pBtn = ui.byId('playToggle');
        if (pBtn) pBtn.click();
        return;
      }
      if (evt.shiftKey && key === 'ArrowRight') {
        evt.preventDefault();
        replay.pause();
        setPlayButtonLabel(false);
        replay.move(1);
        return;
      }
      if (evt.shiftKey && key === 'ArrowLeft') {
        evt.preventDefault();
        replay.pause();
        setPlayButtonLabel(false);
        replay.move(-1);
        return;
      }
      if (evt.altKey && !evt.ctrlKey && !evt.metaKey) {
        var altTools = { h: 'horizontal', t: 'trend', v: 'vertical', f: 'fibonacci', r: 'rectangle' };
        if (altTools[lower]) {
          evt.preventDefault();
          chart.setTool(altTools[lower]);
          return;
        }
        if (lower === 'm') {
          evt.preventDefault();
          var order = ['off', 'weak', 'strong'];
          chart.setMagnetMode(order[(order.indexOf(chart.magnetMode || 'off') + 1) % order.length]);
          return;
        }
      }
      if (!evt.ctrlKey && !evt.metaKey && !evt.altKey && lower === 'm') {
        evt.preventDefault();
        chart.setTool(chart.activeTool === 'measure' ? null : 'measure');
      }
    }
    document.addEventListener('keydown', handleReplayHotkeys);

    bindSessionControls();
    bindFormControls();
    bindActivePositionActions();
    bindTradesTableActions();
    bindBookmarkControls();
    bindNextMonthButton();

    try {
      var startTs = (savedState && savedState.sourceId === initialSourceId) ? savedState.cursor : null;
      await replay.start(startTs);
      // Pre-fill initial BUY SL/TP cleanly so user can immediately execute
      var bar = currentBar();
      var form = ui.byId('tradeForm');
      if (bar && form) {
        form.elements.entry.value = Number(bar.close).toFixed(2);
        form.elements.stopLoss.value = (Number(bar.close) - 5).toFixed(2);
        form.elements.takeProfit.value = (Number(bar.close) + 10).toFixed(2);
        autoCalculateLot();
      }
    } catch (err) {
      ui.status('replayStatus', err && err.message || 'Gagal memulai replay.', true);
    }

    window.addEventListener('pagehide', function () {
      document.removeEventListener('keydown', handleReplayHotkeys);
      if (replay) replay.destroy();
      if (chart) chart.destroy();
    }, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
