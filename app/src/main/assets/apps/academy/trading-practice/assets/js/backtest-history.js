/* Amy FX Backtest Lab — Pro Ledger Performance & History (Hero SVG Equity Curve, Underwater Drawdown, KPIs, ICT Setup & DST Session Breakdowns, Journal SIM Export, 2-Tap Delete). */
(function () {
  'use strict';

  var core = window.AmyPracticeCore;
  var storage = window.AmyPracticeStorage;
  var analytics = window.AmyPracticeAnalytics;
  var ui = window.AmyPracticeUI;

  var allTrades = [];
  var allGuided = [];
  var profileParams = storage.readProfileAccountParams();
  var displayCurrency = profileParams.currency || 'IDR';
  var usdIdrRate = profileParams.usdIdrRate || 16500;
  var curveMode = 'R'; // 'R' | 'MONEY'
  var pendingDeleteId = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function fmtMoney(usd, signed) {
    return storage.formatMoney(usd, displayCurrency, usdIdrRate, { signed: Boolean(signed) });
  }

  function selectedSessionObj() {
    var sel = ui.byId('filterSession');
    var id = sel ? sel.value : 'ALL';
    if (id === 'ALL') return null;
    return storage.listSessions().find(function (s) { return s.id === id; }) || null;
  }

  function filteredTrades() {
    var sessId = ui.byId('filterSession') ? ui.byId('filterSession').value : 'ALL';
    var statusVal = ui.byId('filterStatus') ? ui.byId('filterStatus').value : 'ALL';
    var tfVal = ui.byId('filterTimeframe') ? ui.byId('filterTimeframe').value : 'ALL';

    return allTrades.filter(function (t) {
      if (!t) return false;
      if (sessId !== 'ALL' && (t.sessionId || 'default') !== sessId) return false;
      if (statusVal !== 'ALL' && String(t.result || 'OPEN').toUpperCase() !== statusVal) return false;
      if (tfVal !== 'ALL' && String(t.timeframe || '').toUpperCase() !== tfVal) return false;
      return true;
    });
  }

  function renderSessionFilter() {
    var sel = ui.byId('filterSession');
    if (!sel) return;
    var current = sel.value || 'ALL';
    var sessions = storage.listSessions();
    sel.innerHTML = '<option value="ALL">Semua Sesi</option>' +
      sessions.map(function (s) {
        return '<option value="' + escapeHtml(s.id) + '">' + escapeHtml(s.name) + '</option>';
      }).join('');
    sel.value = sessions.some(function (s) { return s.id === current; }) ? current : 'ALL';
  }

  function renderHeroEquityCurve(stats, initBalUsd) {
    var host = ui.byId('equityCurveChart');
    if (!host) return;
    var pts = stats.equityCurve || [];
    if (pts.length <= 1) {
      host.innerHTML = '<div class="bt-empty-inline" style="padding:36px 16px">Belum ada trade tertutup.<br><a href="candle-replay.html" class="bt-btn bt-btn-primary" style="margin-top:12px">Buka Replay Lab →</a></div>';
      return;
    }

    var W = 820;
    var H = 190;
    var DD_H = 54;
    var PAD_L = 56;
    var PAD_R = 16;
    var PAD_T = 16;
    var PAD_B = 22;
    var plotW = W - PAD_L - PAD_R;
    var plotH = H - PAD_T - PAD_B;

    var values = pts.map(function (p) { return curveMode === 'R' ? p.cumR : p.equityUsd; });
    var baseVal = curveMode === 'R' ? 0 : initBalUsd;
    var minV = Math.min.apply(null, values.concat([baseVal]));
    var maxV = Math.max.apply(null, values.concat([baseVal]));
    var span = Math.max(curveMode === 'R' ? 1 : 10, maxV - minV);
    minV -= span * 0.1;
    maxV += span * 0.1;

    function sx(idx) { return PAD_L + (pts.length <= 1 ? 0 : (idx / (pts.length - 1)) * plotW); }
    function sy(v) { return PAD_T + plotH - ((v - minV) / (maxV - minV)) * plotH; }

    var linePath = pts.map(function (p, i) {
      var v = curveMode === 'R' ? p.cumR : p.equityUsd;
      return (i === 0 ? 'M' : 'L') + sx(i).toFixed(1) + ',' + sy(v).toFixed(1);
    }).join(' ');

    var lastV = values[values.length - 1];
    var isPositive = lastV >= baseVal;
    var strokeColor = isPositive ? 'var(--bt-green)' : 'var(--bt-red)';
    var baseY = sy(baseVal);
    var areaPath = linePath + ' L' + sx(pts.length - 1).toFixed(1) + ',' + (PAD_T + plotH).toFixed(1) + ' L' + sx(0).toFixed(1) + ',' + (PAD_T + plotH).toFixed(1) + ' Z';

    // Underwater Drawdown coordinates
    var ddValues = pts.map(function (p) { return curveMode === 'R' ? p.ddR : p.ddUsd; });
    var maxDd = Math.max(curveMode === 'R' ? 1 : 10, Math.max.apply(null, ddValues));
    var ddTop = H + 8;
    var ddPlotH = DD_H - 14;
    var ddLine = pts.map(function (p, i) {
      var d = ddValues[i];
      var y = ddTop + (d / maxDd) * ddPlotH;
      return (i === 0 ? 'M' : 'L') + sx(i).toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    var ddArea = ddLine + ' L' + sx(pts.length - 1).toFixed(1) + ',' + ddTop.toFixed(1) + ' L' + sx(0).toFixed(1) + ',' + ddTop.toFixed(1) + ' Z';

    function fmtAxis(v) {
      if (curveMode === 'R') return (v >= 0 ? '+' : '') + v.toFixed(1) + 'R';
      return fmtMoney(v, false);
    }

    var totalH = H + DD_H + 12;
    host.innerHTML =
      '<svg class="bt-equity-svg" viewBox="0 0 ' + W + ' ' + totalH + '" role="img" aria-label="Kurva Ekuitas & Drawdown Backtest">' +
        '<defs>' +
          '<linearGradient id="btEqGrad" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="' + strokeColor + '" stop-opacity="0.28"/>' +
            '<stop offset="100%" stop-color="' + strokeColor + '" stop-opacity="0.01"/>' +
          '</linearGradient>' +
        '</defs>' +
        // Horizontal reference lines
        '<line x1="' + PAD_L + '" y1="' + PAD_T + '" x2="' + (W - PAD_R) + '" y2="' + PAD_T + '" stroke="var(--bt-border)" stroke-dasharray="3 4"/>' +
        '<line x1="' + PAD_L + '" y1="' + baseY.toFixed(1) + '" x2="' + (W - PAD_R) + '" y2="' + baseY.toFixed(1) + '" stroke="var(--bt-text-dim)" stroke-dasharray="4 4"/>' +
        '<line x1="' + PAD_L + '" y1="' + (PAD_T + plotH) + '" x2="' + (W - PAD_R) + '" y2="' + (PAD_T + plotH) + '" stroke="var(--bt-border)"/>' +
        // Axis labels
        '<text x="' + (PAD_L - 6) + '" y="' + (PAD_T + 4) + '" text-anchor="end" fill="var(--bt-text-muted)" font-size="10" font-family="var(--bt-font-mono)">' + escapeHtml(fmtAxis(maxV)) + '</text>' +
        '<text x="' + (PAD_L - 6) + '" y="' + (baseY + 3).toFixed(1) + '" text-anchor="end" fill="var(--bt-text-muted)" font-size="10" font-family="var(--bt-font-mono)">' + escapeHtml(fmtAxis(baseVal)) + '</text>' +
        '<text x="' + (PAD_L - 6) + '" y="' + (PAD_T + plotH + 3) + '" text-anchor="end" fill="var(--bt-text-muted)" font-size="10" font-family="var(--bt-font-mono)">' + escapeHtml(fmtAxis(minV)) + '</text>' +
        // Equity Area & Line
        '<path d="' + areaPath + '" fill="url(#btEqGrad)"/>' +
        '<path d="' + linePath + '" fill="none" stroke="' + strokeColor + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
        // Endpoint dot
        '<circle cx="' + sx(pts.length - 1).toFixed(1) + '" cy="' + sy(lastV).toFixed(1) + '" r="4" fill="' + strokeColor + '"/>' +
        // Drawdown label & underwater strip
        '<line x1="' + PAD_L + '" y1="' + ddTop + '" x2="' + (W - PAD_R) + '" y2="' + ddTop + '" stroke="var(--bt-border)"/>' +
        '<text x="' + (PAD_L - 6) + '" y="' + (ddTop + 10) + '" text-anchor="end" fill="var(--bt-red)" font-size="9.5" font-family="var(--bt-font-mono)">DD</text>' +
        '<path d="' + ddArea + '" fill="var(--bt-red-soft)"/>' +
        '<path d="' + ddLine + '" fill="none" stroke="var(--bt-red)" stroke-width="1.4"/>' +
        '<text x="' + (W - PAD_R) + '" y="' + (totalH - 2) + '" text-anchor="end" fill="var(--bt-text-muted)" font-size="10" font-family="var(--bt-font-mono)">' +
          'Max DD: -' + (curveMode === 'R' ? (stats.maxDrawdownR.toFixed(2) + 'R') : fmtMoney(stats.maxDrawdownUsd, false)) + ' · ' + stats.closedTrades + ' trade tertutup' +
        '</text>' +
      '</svg>';
  }

  function renderKpis(stats) {
    var netEl = ui.byId('kpiNetProfit');
    if (netEl) {
      netEl.textContent = fmtMoney(stats.totalRealizedUsd, true);
      netEl.classList.toggle('is-pos', stats.totalRealizedUsd > 0);
      netEl.classList.toggle('is-neg', stats.totalRealizedUsd < 0);
    }
    ui.text('kpiNetSub', (stats.totalRealizedR >= 0 ? '+' : '') + stats.totalRealizedR.toFixed(2) + 'R · Saldo ' + fmtMoney(stats.currentBalanceUsd, false));

    ui.text('kpiWinRate', stats.closedTrades ? (stats.winRate.toFixed(1) + '%') : '—');
    ui.text('kpiWinSub', stats.wins + 'W · ' + stats.losses + 'L · ' + stats.breakevens + ' BE · ' + stats.missed + ' Missed');

    ui.text('kpiProfitFactor', stats.closedTrades ? (stats.profitFactor >= 99 ? '∞' : stats.profitFactor.toFixed(2)) : '—');
    ui.text('kpiExpectancySub', 'Expectancy ' + (stats.expectancyR >= 0 ? '+' : '') + stats.expectancyR.toFixed(2) + 'R / trade');

    ui.text('kpiMaxDd', '-' + stats.maxDrawdownR.toFixed(2) + 'R');
    ui.text('kpiStreakSub', fmtMoney(-stats.maxDrawdownUsd, true) + ' · Streak ' + stats.maxWinStreak + 'W / ' + stats.maxLossStreak + 'L');
  }

  function renderBreakdowns(stats) {
    var setupBody = ui.byId('setupBreakdownBody');
    if (setupBody) {
      if (!stats.breakdownBySetup.length) {
        setupBody.innerHTML = '<tr><td colspan="4"><div class="bt-empty-inline">Belum ada data setup ICT.</div></td></tr>';
      } else {
        setupBody.innerHTML = stats.breakdownBySetup.map(function (s) {
          return '<tr>' +
            '<td><strong>' + escapeHtml(s.setup) + '</strong></td>' +
            '<td class="num">' + s.wins + 'W / ' + s.losses + 'L' + (s.be ? (' / ' + s.be + 'B') : '') + '</td>' +
            '<td class="num">' + s.winRate + '%<span class="bt-bar-track"><span class="bt-bar-fill" style="width:' + s.winRate + '%"></span></span></td>' +
            '<td class="num ' + (s.totalR >= 0 ? 'is-pos' : 'is-neg') + '">' + (s.totalR >= 0 ? '+' : '') + s.totalR.toFixed(2) + 'R</td>' +
          '</tr>';
        }).join('');
      }
    }

    var sessBody = ui.byId('sessionBreakdownBody');
    if (sessBody) {
      var rows = stats.breakdownBySession.filter(function (s) { return s.total > 0; });
      if (!rows.length) {
        sessBody.innerHTML = '<tr><td colspan="4"><div class="bt-empty-inline">Belum ada data sesi ICT.</div></td></tr>';
      } else {
        sessBody.innerHTML = rows.map(function (s) {
          return '<tr>' +
            '<td><strong>' + escapeHtml(s.session) + '</strong></td>' +
            '<td class="num">' + s.wins + 'W / ' + s.losses + 'L</td>' +
            '<td class="num">' + s.winRate + '%<span class="bt-bar-track"><span class="bt-bar-fill" style="width:' + s.winRate + '%"></span></span></td>' +
            '<td class="num ' + (s.totalR >= 0 ? 'is-pos' : 'is-neg') + '">' + (s.totalR >= 0 ? '+' : '') + s.totalR.toFixed(2) + 'R</td>' +
          '</tr>';
        }).join('');
      }
    }
  }

  function resultTagClass(result) {
    var r = String(result || '').toUpperCase();
    if (r === 'WIN') return 'bt-tag-win';
    if (r === 'LOSS') return 'bt-tag-loss';
    if (r === 'BE') return 'bt-tag-be';
    if (r === 'OPEN') return 'bt-tag-open';
    return 'bt-tag-wait';
  }

  function renderLedgerTable(list) {
    var tbody = ui.byId('historyTradesBody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="bt-empty-inline">Tidak ada riwayat trade yang cocok dengan filter saat ini.</div></td></tr>';
      return;
    }

    tbody.innerHTML = list.map(function (t) {
      var isClosed = ['WIN', 'LOSS', 'BE'].includes(t.result);
      var setup = analytics.classifySetup(t.notes, t.reason, t.setupType);
      var sess = analytics.classifySession(t.tradeTime);
      var rStr = t.r != null ? ((Number(t.r) >= 0 ? '+' : '') + Number(t.r).toFixed(2) + 'R') : (t.plannedR != null ? ('Plan ' + Number(t.plannedR).toFixed(2) + 'R') : '—');
      var usdStr = t.pnlUsd != null ? fmtMoney(t.pnlUsd, true) : '—';
      var isConfirm = pendingDeleteId === t.id;
      var isExported = Boolean(isClosed && storage.isTradeExportedToJournal && storage.isTradeExportedToJournal(t.id));

      return '<tr>' +
        '<td class="tabular">' + escapeHtml(core.formatWita(t.tradeTime, true)) + '</td>' +
        '<td class="tabular">' + escapeHtml(t.timeframe || 'M15') + ' · ' + escapeHtml(sess) + '</td>' +
        '<td><span class="bt-tag ' + (t.bias === 'BUY' ? 'bt-tag-buy' : (t.bias === 'SELL' ? 'bt-tag-sell' : 'bt-tag-wait')) + '">' + escapeHtml(t.bias) + '</span> ' + (t.lot ? ('<span class="tabular" style="font-size:11px;color:var(--bt-text-muted)">' + Number(t.lot).toFixed(2) + 'L</span>') : '') + '</td>' +
        '<td class="tabular">' + (t.bias === 'WAIT' ? 'WAIT' : ('E ' + core.price(t.fillPrice || t.entry) + ' / SL ' + core.price(t.stopLoss) + ' / TP ' + core.price(t.takeProfit))) + '</td>' +
        '<td>' + escapeHtml(setup) + (t.notes ? ('<div style="font-size:11px;color:var(--bt-text-muted);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escapeHtml(t.notes) + '</div>') : '') + '</td>' +
        '<td><span class="bt-tag ' + resultTagClass(t.result) + '">' + escapeHtml(t.result || 'OPEN') + '</span></td>' +
        '<td class="num ' + (Number(t.r || 0) > 0 ? 'is-pos' : (Number(t.r || 0) < 0 ? 'is-neg' : '')) + '">' + escapeHtml(rStr) + '<br><span style="font-size:11px;color:var(--bt-text-muted)">' + escapeHtml(usdStr) + '</span></td>' +
        '<td><div class="bt-row-actions">' +
          (isClosed ? '<button type="button" class="bt-btn-sm" data-export-journal="' + escapeHtml(t.id) + '"' + (isExported ? ' disabled' : '') + '>' + (isExported ? '✓ Di Jurnal' : 'Kirim Jurnal') + '</button>' : '') +
          '<button type="button" class="bt-btn-sm bt-btn-danger' + (isConfirm ? ' is-confirm' : '') + '" data-delete-trade="' + escapeHtml(t.id) + '">' + (isConfirm ? 'Yakin?' : 'Hapus') + '</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');
  }

  function renderGuidedSummary() {
    var host = ui.byId('guidedHistoryBody');
    var statEl = ui.byId('guidedAccuracyBadge');
    if (!host) return;
    if (!allGuided.length) {
      if (statEl) statEl.textContent = '0 soal';
      host.innerHTML = '<tr><td colspan="4"><div class="bt-empty-inline">Belum ada riwayat Latihan Soal. <a href="guided-practice.html" style="color:var(--bt-gold);font-weight:700">Mulai Latihan 100 Kasus →</a></div></td></tr>';
      return;
    }
    var correct = allGuided.filter(function (g) { return g && g.correct; }).length;
    var pct = Math.round((correct / allGuided.length) * 100);
    if (statEl) statEl.textContent = correct + '/' + allGuided.length + ' benar (' + pct + '%)';

    var sorted = allGuided.slice().sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); }).slice(0, 15);
    host.innerHTML = sorted.map(function (g) {
      return '<tr>' +
        '<td>' + escapeHtml(g.title || g.exerciseId || 'Soal') + '</td>' +
        '<td class="tabular">' + escapeHtml(g.timeframe || 'M15') + '</td>' +
        '<td>' + escapeHtml(g.answer || '—') + '</td>' +
        '<td><span class="bt-tag ' + (g.correct ? 'bt-tag-win' : 'bt-tag-loss') + '">' + (g.correct ? 'BENAR' : 'SALAH') + '</span></td>' +
      '</tr>';
    }).join('');
  }

  function exportCsv(list) {
    var headers = ['Waktu_WITA', 'Sesi_ICT', 'Timeframe', 'Bias', 'OrderType', 'Lot', 'Entry', 'SL', 'TP', 'Exit', 'Result', 'R', 'PnL_USD', 'Setup', 'Catatan'];
    var rows = list.map(function (t) {
      return [
        core.formatWita(t.tradeTime, true),
        analytics.classifySession(t.tradeTime),
        t.timeframe || 'M15',
        t.bias || '',
        t.orderType || '',
        t.lot || '',
        t.fillPrice || t.entry || '',
        t.stopLoss || '',
        t.takeProfit || '',
        t.exitPrice || '',
        t.result || '',
        t.r != null ? t.r : '',
        t.pnlUsd != null ? t.pnlUsd : '',
        analytics.classifySetup(t.notes, t.reason, t.setupType),
        String(t.notes || '').replace(/"/g, '""')
      ].map(function (v) { return '"' + String(v) + '"'; }).join(',');
    });
    var blob = new Blob([[headers.join(',')].concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'amyfx-backtest-ledger-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function renderAll() {
    var list = filteredTrades();
    var sessObj = selectedSessionObj();
    var initBal = sessObj ? Number(sessObj.initialBalanceUsd || profileParams.balanceUsd) : Number(profileParams.balanceUsd || 5000);
    var riskPct = sessObj ? Number(sessObj.riskPercent || profileParams.riskPercent) : Number(profileParams.riskPercent || 1);

    var stats = analytics.computeStats(list, {
      initialBalanceUsd: initBal,
      defaultRiskUsd: initBal * (riskPct / 100)
    });

    renderHeroEquityCurve(stats, initBal);
    renderKpis(stats);
    renderBreakdowns(stats);
    renderLedgerTable(list);
    renderGuidedSummary();
  }

  async function reloadData() {
    allTrades = await storage.listTrades('ALL');
    allGuided = await storage.listGuidedResults();
    renderSessionFilter();
    renderAll();
  }

  async function init() {
    ['filterSession', 'filterStatus', 'filterTimeframe'].forEach(function (id) {
      var el = ui.byId(id);
      if (el) el.addEventListener('change', function () {
        pendingDeleteId = null;
        renderAll();
      });
    });

    var currWrap = ui.byId('historyCurrencyToggle');
    if (currWrap) {
      currWrap.querySelectorAll('button[data-currency]').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.dataset.currency === displayCurrency);
      });
      currWrap.addEventListener('click', function (evt) {
        var btn = evt.target.closest('button[data-currency]');
        if (!btn) return;
        displayCurrency = storage.saveDisplayCurrency ? storage.saveDisplayCurrency(btn.dataset.currency) : btn.dataset.currency;
        currWrap.querySelectorAll('button[data-currency]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.currency === displayCurrency);
        });
        renderAll();
      });
    }

    window.addEventListener('storage', function (evt) {
      if (!evt || !evt.key || /^(amy_default_|amy_account_|amy_usd_idr_rate|amy_sim_cashflows_v1|amy\.backtest\.)/.test(evt.key)) {
        profileParams = storage.readProfileAccountParams();
        displayCurrency = profileParams.currency || displayCurrency;
        usdIdrRate = profileParams.usdIdrRate || usdIdrRate;
        if (currWrap) {
          currWrap.querySelectorAll('button[data-currency]').forEach(function (b) {
            b.classList.toggle('is-active', b.dataset.currency === displayCurrency);
          });
        }
        renderSessionFilter();
        renderAll();
      }
    });

    var modeWrap = ui.byId('curveModeToggle');
    if (modeWrap) {
      modeWrap.addEventListener('click', function (evt) {
        var btn = evt.target.closest('button[data-curve-mode]');
        if (!btn) return;
        curveMode = btn.dataset.curveMode;
        modeWrap.querySelectorAll('button[data-curve-mode]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.curveMode === curveMode);
        });
        renderAll();
      });
    }

    var exportCsvBtn = ui.byId('exportCsvBtn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', function () {
        var list = filteredTrades();
        if (!list.length) {
          ui.status('historyStatus', 'Belum ada trade untuk diekspor ke CSV.', true);
          return;
        }
        exportCsv(list);
        ui.status('historyStatus', list.length + ' baris diekspor ke CSV.', false, true);
      });
    }

    var tbody = ui.byId('historyTradesBody');
    if (tbody) {
      tbody.addEventListener('click', async function (evt) {
        var expBtn = evt.target.closest('[data-export-journal]');
        if (expBtn) {
          var id = expBtn.dataset.exportJournal;
          var rec = allTrades.find(function (t) { return t.id === id; });
          if (!rec) return;
          try {
            if (storage.exportTradeToJournalAsync) {
              await storage.exportTradeToJournalAsync(rec);
            } else {
              storage.exportTradeToJournal(rec);
            }
            expBtn.textContent = '✓ Di Jurnal';
            expBtn.disabled = true;
            ui.status('historyStatus', 'Trade berhasil dikirim ke Jurnal Trading (Mode SIM · Backtest Lab).', false, true);
          } catch (err) {
            ui.status('historyStatus', err && err.message || 'Gagal mengirim ke Jurnal.', true);
          }
          return;
        }

        var delBtn = evt.target.closest('[data-delete-trade]');
        if (delBtn) {
          var delId = delBtn.dataset.deleteTrade;
          if (pendingDeleteId !== delId) {
            pendingDeleteId = delId;
            renderLedgerTable(filteredTrades());
            return;
          }
          pendingDeleteId = null;
          await storage.deleteTrade(delId);
          ui.status('historyStatus', 'Trade dihapus dari riwayat backtest.', false, true);
          await reloadData();
        }
      });
    }

    await reloadData();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
