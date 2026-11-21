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
  var tapTarget = 'entry'; // 'entry' | 'stopLoss' | 'takeProfit'
  var pendingDeleteTradeId = null;
  var pendingResetSession = false;
  var resetTimer = null;

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

  function renderAccountBar() {
    var stats = getSessionStats();
    var px = currentPrice();
    var openList = openTradesInSession();
    var floatUsd = 0;
    var floatR = 0;

    openList.forEach(function (t) {
      var fl = tradesApi.computeFloatingPnl(t, px);
      if (fl) {
        floatUsd += fl.totalUsd;
        floatR += fl.totalR;
      }
    });

    var balEl = ui.byId('accBalance');
    if (balEl) {
      balEl.textContent = fmtMoney(stats.currentBalanceUsd, false);
    }

    var floatEl = ui.byId('accFloating');
    if (floatEl) {
      floatEl.textContent = openList.length ? (fmtMoney(floatUsd, true) + ' (' + (floatR >= 0 ? '+' : '') + floatR.toFixed(2) + 'R)') : fmtMoney(0, false);
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
    var openList = openTradesInSession();

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
      var fl = isActive ? tradesApi.computeFloatingPnl(t, px) : null;
      var entryPx = Number.isFinite(Number(t.fillPrice)) ? Number(t.fillPrice) : Number(t.entry);
      var inProfit = isActive && px != null && (isBuy ? px > entryPx : px < entryPx);
      var canBe = isActive && inProfit && !t.breakevenMoved;
      var canPartial = isActive && Number(t.remainingFraction != null ? t.remainingFraction : 1) > 0.15;

      var pnlHtml = isActive && fl
        ? '<span class="bt-pos-pnl ' + (fl.totalUsd >= 0 ? 'is-pos' : 'is-neg') + '">' + fmtMoney(fl.totalUsd, true) + '<small>' + (fl.totalR >= 0 ? '+' : '') + fl.totalR.toFixed(2) + 'R</small></span>'
        : '<span class="bt-tag bt-tag-wait">LIMIT WAIT</span>';
      var shortType = t.orderType === 'LIMIT' ? 'LMT' : 'MKT';

      return '<div class="bt-pos-card ' + (isBuy ? 'is-buy' : 'is-sell') + '">' +
        '<div class="bt-pos-top">' +
          '<div class="bt-pos-title">' +
            '<span class="bt-tag ' + (isBuy ? 'bt-tag-buy' : 'bt-tag-sell') + '">' + escapeHtml(t.bias + ' ' + shortType) + '</span>' +
            '<span class="tabular">' + Number(t.remainingLot || t.lot || 0.01).toFixed(2) + 'L</span>' +
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
          '<button type="button" class="bt-btn-sm bt-btn-danger" data-pos-close="' + escapeHtml(t.id) + '">' + (isActive ? 'Tutup Manual' : 'Batal Limit') + '</button>' +
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

  async function refreshTradesAndEvaluate() {
    var sid = activeSession ? activeSession.id : storage.getActiveSessionId();
    sessionTrades = await storage.listTrades(sid);

    if (visibleCandles.length) {
      var changed = false;
      for (var i = 0; i < sessionTrades.length; i += 1) {
        var t = sessionTrades[i];
        if (!t || t.result !== 'OPEN' || !['BUY', 'SELL'].includes(t.bias)) continue;
        // Evaluate only against candles from same source or matching time span
        var updated = tradesApi.evaluate(t, visibleCandles);
        if (updated.result !== t.result || updated.entryStatus !== t.entryStatus || updated.r !== t.r) {
          await storage.saveTrade(updated);
          sessionTrades[i] = updated;
          changed = true;
          if (updated.result === 'WIN' || updated.result === 'LOSS' || updated.result === 'BE') {
            ui.status('tradeStatus', 'Posisi ' + updated.bias + ' selesai: ' + updated.result + ' (' + (updated.r >= 0 ? '+' : '') + Number(updated.r).toFixed(2) + 'R · ' + fmtMoney(updated.pnlUsd, true) + ').', updated.result === 'LOSS', updated.result === 'WIN');
          } else if (updated.result === 'MISSED') {
            ui.status('tradeStatus', 'Limit order ' + updated.bias + ' MISSED (harga mencapai TP sebelum fill).', false, false);
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

    var rr = (entry != null && sl != null && tp != null) ? tradesApi.plannedR(bias, entry, sl, tp) : null;
    ui.text('orderRrPreview', rr != null ? ('R:R 1 : ' + rr.toFixed(2)) : 'Isi SL & TP');

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
        // Auto-suggest sensible SL/TP distance when switching BUY/SELL
        var px = currentPrice();
        if (px != null && val !== 'WAIT') {
          if (form.elements.orderType.value === 'MARKET') form.elements.entry.value = px.toFixed(2);
          var entry = core.finite(form.elements.entry.value) || px;
          var sl = core.finite(form.elements.stopLoss.value);
          var validSl = sl != null && ((val === 'BUY' && sl < entry) || (val === 'SELL' && sl > entry));
          if (!validSl) {
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
        form.elements.orderType.value = val;
        orderSeg.querySelectorAll('button[data-order-type]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.orderType === val);
        });
        if (val === 'MARKET' && currentPrice() != null) {
          form.elements.entry.value = currentPrice().toFixed(2);
        }
        updateOrderPreview();
      });
    }

    // Tap target selector for clicking chart
    document.querySelectorAll('[data-tap-target]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        tapTarget = chip.dataset.tapTarget;
        document.querySelectorAll('[data-tap-target]').forEach(function (c) {
          c.classList.toggle('is-active', c.dataset.tapTarget === tapTarget);
        });
        ui.status('tradeStatus', 'Ketuk chart untuk mengisi harga ' + tapTarget.toUpperCase() + ' (saat mode Geser).');
      });
    });

    ['entry', 'stopLoss', 'takeProfit', 'lot'].forEach(function (name) {
      if (!form.elements[name]) return;
      form.elements[name].addEventListener('input', function () {
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

    form.addEventListener('submit', async function (evt) {
      evt.preventDefault();
      var bar = currentBar();
      if (!bar || !replay || replay.cursor == null) {
        ui.status('tradeStatus', 'Tunggu hingga data candle selesai dimuat.', true);
        return;
      }
      try {
        var stats = getSessionStats();
        var record = await ui.saveTrade(form, {
          sessionId: activeSession ? activeSession.id : storage.getActiveSessionId(),
          symbol: 'XAUUSD',
          timeframe: replay.timeframe,
          sourceId: replay.sourceId,
          replayStartTime: replay.startTime || replay.cursor,
          tradeTime: replay.cursor,
          currentPrice: bar.close,
          currentCandle: bar,
          spreadUsd: spreadUsd,
          balanceUsd: stats.currentBalanceUsd,
          riskPercent: activeSession ? activeSession.riskPercent : 1,
          nonce: Date.now().toString(36)
        });
        ui.status('tradeStatus', record.bias === 'WAIT'
          ? 'Catatan observasi WAIT tersimpan di riwayat sesi.'
          : (record.bias + ' ' + record.orderType + ' ' + record.lot.toFixed(2) + ' lot dieksekusi di ' + core.price(record.fillPrice || record.entry) + '.'), false, true);
        if (form.elements.notes) form.elements.notes.value = '';
        await refreshTradesAndEvaluate();
      } catch (err) {
        ui.status('tradeStatus', err && err.message || 'Gagal mencatat eksekusi.', true);
      }
    });
  }

  function bindActivePositionActions() {
    var host = ui.byId('activePositionsList');
    if (!host) return;
    host.addEventListener('click', async function (evt) {
      var bar = currentBar();
      var px = bar ? bar.close : null;
      var ts = replay ? replay.cursor : Math.floor(Date.now() / 1000);

      var beBtn = evt.target.closest('[data-pos-be]');
      if (beBtn) {
        var idBe = beBtn.dataset.posBe;
        var trBe = sessionTrades.find(function (t) { return t.id === idBe; });
        if (!trBe) return;
        try {
          var updatedBe = tradesApi.moveStopToBreakeven(trBe, px);
          await storage.saveTrade(updatedBe);
          ui.status('tradeStatus', 'Stop Loss digeser ke Breakeven (' + core.price(updatedBe.stopLoss) + ').', false, true);
          await refreshTradesAndEvaluate();
        } catch (err) {
          ui.status('tradeStatus', err && err.message || 'Gagal memindahkan ke BE.', true);
        }
        return;
      }

      var partBtn = evt.target.closest('[data-pos-partial]');
      if (partBtn) {
        var idP = partBtn.dataset.posPartial;
        var trP = sessionTrades.find(function (t) { return t.id === idP; });
        if (!trP) return;
        try {
          var updatedP = tradesApi.closePartial(trP, px, 0.5, ts);
          await storage.saveTrade(updatedP);
          var lastPart = updatedP.partials[updatedP.partials.length - 1];
          ui.status('tradeStatus', 'Partial 50% dikunci: ' + fmtMoney(lastPart.pnlUsd, true) + ' (' + (lastPart.r >= 0 ? '+' : '') + lastPart.r.toFixed(2) + 'R).', false, true);
          await refreshTradesAndEvaluate();
        } catch (err) {
          ui.status('tradeStatus', err && err.message || 'Gagal partial close.', true);
        }
        return;
      }

      var closeBtn = evt.target.closest('[data-pos-close]');
      if (closeBtn) {
        var idC = closeBtn.dataset.posClose;
        var trC = sessionTrades.find(function (t) { return t.id === idC; });
        if (!trC) return;
        try {
          var updatedC = tradesApi.closeManual(trC, px, ts);
          await storage.saveTrade(updatedC);
          ui.status('tradeStatus', updatedC.result === 'CANCELLED'
            ? 'Limit order dibatalkan.'
            : ('Posisi ditutup manual di ' + core.price(updatedC.exitPrice) + ' · ' + fmtMoney(updatedC.pnlUsd, true) + ' (' + (updatedC.r >= 0 ? '+' : '') + Number(updatedC.r).toFixed(2) + 'R).'), updatedC.result === 'LOSS', updatedC.result === 'WIN');
          await refreshTradesAndEvaluate();
        } catch (err) {
          ui.status('tradeStatus', err && err.message || 'Gagal menutup posisi.', true);
        }
      }
    });
  }

  function bindTradesTableActions() {
    var tbody = ui.byId('replayTradesBody');
    if (!tbody) return;
    tbody.addEventListener('click', async function (evt) {
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
        await storage.deleteTrade(delId);
        await refreshTradesAndEvaluate();
      }
    });
  }

  function bindSessionControls() {
    var sel = ui.byId('sessionSelect');
    if (sel) {
      sel.addEventListener('change', async function () {
        storage.setActiveSessionId(sel.value);
        activeSession = storage.getActiveSession();
        pendingDeleteTradeId = null;
        await refreshTradesAndEvaluate();
      });
    }

    var currWrap = ui.byId('currencyToggle');
    if (currWrap) {
      currWrap.addEventListener('click', function (evt) {
        var btn = evt.target.closest('button[data-currency]');
        if (!btn) return;
        displayCurrency = btn.dataset.currency;
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
      resetBtn.addEventListener('click', async function () {
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
        await storage.resetSessionTrades(activeSession ? activeSession.id : 'default');
        ui.status('tradeStatus', 'Riwayat trade pada sesi ini telah di-reset ke saldo awal.', false, true);
        await refreshTradesAndEvaluate();
      });
    }

    var newBtn = ui.byId('newSessionBtn');
    var dlg = ui.byId('sessionDialog');
    var closeDlg = ui.byId('closeSessionDialog');
    var sessForm = ui.byId('newSessionForm');
    if (newBtn && dlg) {
      newBtn.addEventListener('click', function () {
        var prof = storage.readProfileAccountParams();
        if (sessForm) {
          if (sessForm.elements.sessionName) sessForm.elements.sessionName.value = '';
          if (sessForm.elements.sessionBalance) sessForm.elements.sessionBalance.value = String(prof.balanceUsd);
          if (sessForm.elements.sessionRisk) sessForm.elements.sessionRisk.value = String(prof.riskPercent);
        }
        if (typeof dlg.showModal === 'function' && !dlg.open) dlg.showModal();
        else dlg.setAttribute('open', '');
      });
    }
    if (closeDlg && dlg) {
      closeDlg.addEventListener('click', function () { if (dlg.open) dlg.close(); });
    }
    if (sessForm && dlg) {
      sessForm.addEventListener('submit', async function (evt) {
        evt.preventDefault();
        try {
          storage.createSession(
            sessForm.elements.sessionName.value,
            Number(sessForm.elements.sessionBalance.value),
            Number(sessForm.elements.sessionRisk.value)
          );
          if (dlg.open) dlg.close();
          renderSessionSelect();
          await refreshTradesAndEvaluate();
          ui.status('tradeStatus', 'Sesi backtest baru dibuat & aktif.', false, true);
        } catch (err) {
          ui.status('sessionDialogStatus', err && err.message || 'Gagal membuat sesi.', true);
        }
      });
    }
  }

  async function init() {
    renderSessionSelect();
    syncCurrencyButtons();

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
      onChartTap: function (pt) {
        var form = ui.byId('tradeForm');
        if (!form || !pt || !Number.isFinite(pt.price)) return;
        if (form.elements.bias.value === 'WAIT') return;
        if (tapTarget === 'entry' && form.elements.orderType.value === 'MARKET') {
          // Switch to LIMIT automatically if tapping chart for entry
          form.elements.orderType.value = 'LIMIT';
          var orderSeg = ui.byId('orderTypeSeg');
          if (orderSeg) {
            orderSeg.querySelectorAll('button[data-order-type]').forEach(function (b) {
              b.classList.toggle('is-active', b.dataset.orderType === 'LIMIT');
            });
          }
        }
        if (form.elements[tapTarget]) {
          form.elements[tapTarget].value = pt.price.toFixed(2);
          if (tapTarget === 'stopLoss' || tapTarget === 'entry') autoCalculateLot();
          else updateOrderPreview();
        }
      }
    });
    chart.setTool(null);
    ui.bindDrawingToolbar(chart);

    // Wire ICT Level overlay toggle (injected inside quick bar by practice-ui.js)
    var ictBtn = ui.byId('replayIctToggle');
    if (ictBtn) {
      ictBtn.addEventListener('click', function () {
        ictOverlayEnabled = !ictOverlayEnabled;
        ictBtn.setAttribute('aria-pressed', ictOverlayEnabled ? 'true' : 'false');
        ictBtn.classList.toggle('active', ictOverlayEnabled);
        syncIctLevels();
      });
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
        ui.status('replayStatus', 'Akhir pack tercapai. Buka Kelola Data Cloud untuk bulan lain.');
      },
      onChange: async function (payload) {
        if (!payload) return;
        visibleCandles = payload.candles || [];
        chart.options.timeframeSeconds = core.timeframeSeconds(payload.timeframe) || 900;
        chart.setDrawingTimeBoundary(payload.cursor);
        chart.setCandles(visibleCandles, payload.reason === 'start' || payload.reason === 'timeframe');

        var bar = currentBar();
        if (bar) ui.renderOhlc('ohlc', bar, bar.time);
        var sess = core.classifyIctSession(payload.cursor);
        ui.text('replaySessionBadge', sess);
        ui.text('replaySourceBadge', payload.sampleOnly ? 'Sample · Jan 2025' : payload.source);
        ui.status('replayStatus', payload.timeframe + ' · ' + visibleCandles.length.toLocaleString('id-ID') + ' candle terlihat · Sesi ' + sess);

        // Auto-sync MARKET entry input to current close
        var form = ui.byId('tradeForm');
        if (form && bar && form.elements.orderType && form.elements.orderType.value === 'MARKET' && form.elements.bias.value !== 'WAIT') {
          form.elements.entry.value = Number(bar.close).toFixed(2);
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

    bindSessionControls();
    bindFormControls();
    bindActivePositionActions();
    bindTradesTableActions();

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
      if (replay) replay.destroy();
      if (chart) chart.destroy();
    }, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
