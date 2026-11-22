(function () {
  'use strict';
  var ui = window.AmyPracticeUI;
  var session = window.AmyGuidedSession;
  var chart = null;
  var bank = [];
  var exercises = [];
  var results = [];
  var index = 0;
  var answered = false;
  var blindMode = false;
  var afterTimer = null;
  var afterIndex = 0;
  var afterRevealed = false;
  var isFullscreen = false;

  var SEEN_KEY = 'amy-guided-v3-seen';
  var MASTERY_KEY = 'amy-guided-v3-mastery';
  var SUMMARY_KEY = 'amy-guided-v3-summary';
  var CHOICE_LETTERS = ['A', 'B', 'C', 'D'];

  var seen = [];
  var masteryMap = {};
  try {
    seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
    if (!Array.isArray(seen)) seen = [];
  } catch (_) { seen = []; }
  try {
    masteryMap = JSON.parse(localStorage.getItem(MASTERY_KEY) || '{}');
    if (!masteryMap || typeof masteryMap !== 'object' || Array.isArray(masteryMap)) masteryMap = {};
  } catch (_) { masteryMap = {}; }

  function remember(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function element(tag, text, parent) {
    var node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }

  function clearAfterTimer() {
    if (afterTimer) {
      clearInterval(afterTimer);
      afterTimer = null;
    }
  }

  function buildStudyZone(q) {
    var e = q && q.evidence;
    if (!e || !q.candles || !q.candles.length) return null;
    if (e.pattern === 'fvg') {
      var aCandle = q.candles[e.a];
      var cCandle = q.candles[e.c];
      if (!aCandle || !cCandle) return null;
      var isBull = e.direction === 'bullish';
      var gapLow = isBull ? aCandle.high : cCandle.high;
      var gapHigh = isBull ? cCandle.low : aCandle.low;
      return {
        type: 'fvg',
        direction: e.direction,
        startTime: aCandle.time,
        endTime: q.candles[q.candles.length - 1].time,
        bottomPrice: Math.min(gapLow, gapHigh),
        topPrice: Math.max(gapLow, gapHigh),
        cePrice: (gapLow + gapHigh) / 2,
        title: e.title || (isBull ? 'FVG (Bullish) · BISI' : 'FVG (Bearish) · SIBI')
      };
    }
    if (e.pattern === 'sweep' && q.levels && q.levels[0]) {
      return {
        type: 'sweep',
        direction: e.direction,
        level: q.levels[0].price,
        startTime: q.candles[e.a] ? q.candles[e.a].time : null,
        endTime: q.candles[e.c] ? q.candles[e.c].time : null
      };
    }
    if (e.pattern === 'break' && q.levels && q.levels[0]) {
      return {
        type: 'break',
        direction: e.direction,
        level: q.levels[0].price,
        startTime: q.candles[e.a] ? q.candles[e.a].time : null,
        endTime: q.candles[e.c] ? q.candles[e.c].time : null
      };
    }
    if (e.pattern === 'range' && q.levels && q.levels.length >= 3) {
      return {
        type: 'range',
        lowPrice: q.levels[0].price,
        eqPrice: q.levels[1].price,
        highPrice: q.levels[2].price,
        startTime: q.candles[0] ? q.candles[0].time : null,
        endTime: q.candles[e.closeIndex || (q.candles.length - 1)].time
      };
    }
    if (e.pattern === 'risk' && q.levels && q.levels.length >= 3) {
      return {
        type: 'risk',
        side: e.side,
        entryPrice: q.levels[0].price,
        stopPrice: q.levels[1].price,
        targetPrice: q.levels[2].price,
        startTime: q.candles[Math.max(0, q.candles.length - 10)] ? q.candles[Math.max(0, q.candles.length - 10)].time : null,
        endTime: q.candles[q.candles.length - 1].time
      };
    }
    if (e.pattern === 'ob') {
      var obCandle = q.candles[e.startIdx || 0];
      return {
        type: 'ob',
        direction: e.direction || 'bullish',
        startTime: obCandle ? obCandle.time : null,
        topPrice: e.topPrice,
        bottomPrice: e.bottomPrice,
        midPrice: e.midPrice,
        title: e.title || 'Order Block'
      };
    }
    return null;
  }

  function applyChartAnnotations(q, showFullEvidence) {
    if (!chart || !q) return;
    var showHints = showFullEvidence || !blindMode;
    var zone = showFullEvidence ? buildStudyZone(q) : null;
    var activeLevels = showHints
      ? (q.levels || []).map(function (lvl) {
          return zone ? Object.assign({}, lvl, { title: '' }) : lvl;
        })
      : [];
    chart.setTradeLevels(activeLevels);
    chart.series.setMarkers(showHints ? (q.markers || []) : []);
    if (typeof chart.setStudyZone === 'function') {
      chart.setStudyZone(zone);
    }
    var guideEl = ui.byId('chartGuide');
    if (guideEl) {
      if (showFullEvidence) {
        guideEl.textContent = q.chartGuide || '';
        guideEl.hidden = false;
      } else if (blindMode) {
        guideEl.textContent = 'Mode Polos aktif — baca struktur candle langsung, atau ketuk "📐 Level" jika ingin bantuan garis.';
        guideEl.hidden = false;
      } else {
        guideEl.textContent = q.chartGuide || '';
        guideEl.hidden = false;
      }
    }
    var blindBtn = ui.byId('toggleBlindMode');
    if (blindBtn) {
      blindBtn.textContent = blindMode ? '📐 Level' : '👁️ Polos';
      blindBtn.classList.toggle('is-active', blindMode);
    }
  }

  function applyPriceAutoscale(candleList, levels) {
    if (!chart) return;
    var prices = candleList.flatMap(function (c) { return [c.low, c.high]; });
    if (Array.isArray(levels)) {
      levels.forEach(function (l) {
        if (Number.isFinite(Number(l.price))) prices.push(Number(l.price));
      });
    }
    if (!prices.length) return;
    var low = Math.min.apply(null, prices);
    var high = Math.max.apply(null, prices);
    var span = Math.max(1.5, high - low);
    var padding = span * 0.16;
    chart.series.applyOptions({
      autoscaleInfoProvider: function () {
        return { priceRange: { minValue: low - padding, maxValue: high + padding } };
      }
    });
  }

  function frameChartSafely(count) {
    if (!chart) return;
    var run = function () {
      if (typeof chart.fitStudyRange === 'function') chart.fitStudyRange(count);
    };
    requestAnimationFrame(function () {
      run();
      requestAnimationFrame(run);
    });
  }

  function renderPillarMastery() {
    var grid = ui.byId('pillarMasteryGrid');
    var badge = ui.byId('masteryOverallBadge');
    var drillBtn = ui.byId('drillMistakesBtn');
    if (!grid || !bank.length) return;

    var pillars = session.computePillarMastery(bank, masteryMap);
    var totalMastered = 0;
    var totalMistakes = 0;
    grid.replaceChildren();

    pillars.forEach(function (p) {
      totalMastered += p.mastered;
      totalMistakes += p.mistakes;
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'bt-mastery-item';
      item.innerHTML =
        '<div class="bt-mastery-item-top">' +
          '<span class="bt-mastery-name"></span>' +
          '<strong class="bt-mastery-pct tabular"></strong>' +
        '</div>' +
        '<div class="bt-mastery-bar"><div class="bt-mastery-fill"></div></div>' +
        '<small class="bt-mastery-meta"></small>';
      item.querySelector('.bt-mastery-name').textContent = p.category;
      item.querySelector('.bt-mastery-pct').textContent = p.pct + '%';
      item.querySelector('.bt-mastery-fill').style.width = p.pct + '%';
      item.querySelector('.bt-mastery-meta').textContent = p.mastered + '/' + p.total + ' dikuasai' + (p.mistakes ? ' · ' + p.mistakes + ' salah' : '');
      item.addEventListener('click', function () {
        var topicSel = ui.byId('exerciseTopic');
        if (topicSel) topicSel.value = p.topic;
        var box = ui.byId('pillarMasteryBox');
        if (box) box.open = false;
        start({ mistakesOnly: false });
      });
      grid.appendChild(item);
    });

    if (badge) badge.textContent = totalMastered + ' / ' + bank.length + ' dikuasai';
    if (drillBtn) {
      drillBtn.hidden = totalMistakes === 0;
      drillBtn.textContent = 'Ulangi Salah (' + totalMistakes + ')';
    }
  }

  function renderScenarioCard(q) {
    var card = ui.byId('scenarioCard');
    if (!card) return;
    if (!q || !q.scenario) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    ui.text('scenarioSession', q.scenario.session || '—');
    ui.text('scenarioPnl', q.scenario.pnlToday || '—');
    ui.text('scenarioStreak', q.scenario.streak || '—');
    ui.text('scenarioTrades', q.scenario.tradesToday || '—');
    ui.text('scenarioTrigger', 'Pemicu: ' + (q.scenario.trigger || '—'));
  }

  function revealAfterCandles(instant) {
    var q = exercises[index];
    if (!q || !Array.isArray(q.afterCandles) || !q.afterCandles.length) return;
    var playBtn = ui.byId('playAfterCandles');
    var outcomeEl = ui.byId('outcomeBanner');

    if (afterRevealed) return;

    // If currently animating and clicked again, jump straight to full reveal
    if (afterTimer && !instant) {
      clearAfterTimer();
      var full = q.candles.concat(q.afterCandles);
      applyPriceAutoscale(full, q.levels);
      chart.setCandles(full, false);
      frameChartSafely(full.length);
      ui.renderOhlc('ohlc', full[full.length - 1], full[full.length - 1].time);
      afterRevealed = true;
      if (playBtn) {
        playBtn.textContent = '✓ Kelanjutan Market Ditampilkan (+8 Candle)';
        playBtn.disabled = true;
      }
      if (outcomeEl && q.outcomeNote) {
        outcomeEl.textContent = 'HASIL MARKET: ' + q.outcomeNote;
        outcomeEl.hidden = false;
      }
      return;
    }

    clearAfterTimer();
    var allBars = q.candles.concat(q.afterCandles);
    applyPriceAutoscale(allBars, q.levels);
    afterIndex = 0;

    if (playBtn) playBtn.textContent = '⏩ Tampilkan Semua Sekaligus';

    afterTimer = setInterval(function () {
      afterIndex += 1;
      var slice = q.candles.concat(q.afterCandles.slice(0, afterIndex));
      chart.setCandles(slice, false);
      frameChartSafely(slice.length);
      var lastBar = slice[slice.length - 1];
      if (lastBar) ui.renderOhlc('ohlc', lastBar, lastBar.time);

      if (afterIndex >= q.afterCandles.length) {
        clearAfterTimer();
        afterRevealed = true;
        if (playBtn) {
          playBtn.textContent = '✓ Kelanjutan Market Ditampilkan (+' + q.afterCandles.length + ' Candle)';
          playBtn.disabled = true;
        }
        if (outcomeEl && q.outcomeNote) {
          outcomeEl.textContent = 'HASIL MARKET: ' + q.outcomeNote;
          outcomeEl.hidden = false;
        }
      }
    }, 210);
  }

  function answer(choice) {
    if (answered) return;
    answered = true;
    var q = exercises[index];
    var correct = choice === q.answer;
    results.push({ exercise: q, answer: choice, correct: correct });

    if (!seen.includes(q.id)) seen.push(q.id);
    remember(SEEN_KEY, seen);

    var prevRec = masteryMap[q.id] || { attempts: 0, wins: 0, lastCorrect: false };
    masteryMap[q.id] = {
      attempts: Number(prevRec.attempts || 0) + 1,
      wins: Number(prevRec.wins || 0) + (correct ? 1 : 0),
      lastCorrect: correct,
      updatedAt: Date.now()
    };
    remember(MASTERY_KEY, masteryMap);
    renderPillarMastery();

    ui.byId('exerciseChoices').querySelectorAll('button').forEach(function (button) {
      button.disabled = true;
      var txt = button.dataset.choiceText;
      if (txt === q.answer) button.dataset.result = 'correct';
      else if (txt === choice) button.dataset.result = 'wrong';
    });

    // Reveal full ICT study zone & levels immediately after answering
    blindMode = false;
    applyChartAnnotations(q, true);

    var afterBar = ui.byId('afterMarketBar');
    var playBtn = ui.byId('playAfterCandles');
    var outcomeEl = ui.byId('outcomeBanner');
    if (afterBar && Array.isArray(q.afterCandles) && q.afterCandles.length) {
      afterBar.hidden = false;
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.textContent = '▶ Lihat Kelanjutan Market (+' + q.afterCandles.length + ' Candle)';
      }
      if (outcomeEl) outcomeEl.hidden = true;
    }

    ui.text('exercisePrinciple', q.principle);
    ui.status(
      'guidedStatus',
      (correct ? 'Tepat! ' : 'Belum tepat. Jawaban paling akurat: ' + q.answer + ' — ') +
        'Zona bukti ICT sudah menyala di chart; tekan "Lihat Kelanjutan Market" untuk cek hasil candlenya.',
      !correct
    );
    ui.byId('exerciseLesson').hidden = false;
    ui.byId('nextExercise').hidden = false;
    ui.byId('nextExercise').textContent = index === exercises.length - 1 ? 'Lihat Rangkuman Sesi' : 'Soal Berikutnya →';
    ui.byId('guidedProgress').style.width = ((index + 1) / exercises.length * 100) + '%';

    window.AmyPracticeStorage.saveGuidedResult({
      exerciseId: q.id,
      title: q.title,
      answer: choice,
      correct: correct,
      timeframe: q.timeframe,
      source: q.source
    }).catch(function () {
      ui.text('saveNotice', 'Riwayat tidak dapat disimpan di perangkat ini. Rangkuman sesi tetap tersedia.');
    });
  }

  function loadExercise() {
    clearAfterTimer();
    answered = false;
    afterRevealed = false;
    afterIndex = 0;

    var q = exercises[index];
    // Blind Mode active by default on sedang & advanced so user reads price action directly
    blindMode = q.difficulty !== 'mudah' && !q.scenario;

    ui.byId('nextExercise').hidden = true;
    ui.byId('afterMarketBar').hidden = true;
    ui.byId('outcomeBanner').hidden = true;

    ui.text('exerciseLabel', 'SOAL ' + (index + 1) + ' / ' + exercises.length + ' · ' + q.difficulty.toUpperCase());
    ui.text('exercisePillarTag', q.category || q.topic);
    ui.text('exerciseTitle', q.title);
    ui.text('exercisePrompt', q.prompt);
    ui.text('exercisePrinciple', 'Jawab satu kali untuk membuka zona bukti ICT, kelanjutan market, dan tautan materi Academy.');
    ui.text('exerciseTimeframe', q.timeframe || 'M15');

    renderScenarioCard(q);

    var lastBar = q.candles[q.candles.length - 1];
    if (lastBar) ui.renderOhlc('ohlc', lastBar, Number(lastBar.time));
    else ['Time', 'Open', 'High', 'Low', 'Close'].forEach(function (k) { ui.text('ohlc' + k, '—'); });

    ui.byId('exerciseLesson').href = q.lesson.href;
    ui.byId('exerciseLesson').textContent = q.lesson.title + ' →';
    ui.byId('exerciseLesson').hidden = true;
    ui.byId('guidedProgress').style.width = (index / exercises.length * 100) + '%';
    ui.status(
      'guidedStatus',
      blindMode
        ? 'Mode Polos aktif — baca candle & struktur sendiri, lalu pilih 1 dari 4 keputusan terbaik.'
        : 'Amati struktur candle dan level kunci pada chart, lalu pilih 1 dari 4 keputusan terbaik.'
    );

    chart.series.setMarkers([]);
    applyPriceAutoscale(q.candles, q.levels);
    chart.setCandles(q.candles, false);
    applyChartAnnotations(q, false);
    frameChartSafely(q.candles.length);

    var host = ui.byId('exerciseChoices');
    host.replaceChildren();
    session.shuffle(q.choices).forEach(function (choice, i) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'bt-choice-btn';
      button.dataset.choiceText = choice;

      var badge = document.createElement('span');
      badge.className = 'bt-choice-key';
      badge.textContent = CHOICE_LETTERS[i] || String(i + 1);

      var label = document.createElement('span');
      label.className = 'bt-choice-text';
      label.textContent = choice;

      button.appendChild(badge);
      button.appendChild(label);
      button.addEventListener('click', function () { answer(choice); });
      host.appendChild(button);
    });
  }

  function toggleFullscreen(forceState) {
    var next = typeof forceState === 'boolean' ? forceState : !isFullscreen;
    isFullscreen = next;
    document.body.classList.toggle('bt-guided-fullscreen', isFullscreen);
    var stage = ui.byId('guidedChartStage');
    if (stage) stage.classList.toggle('is-fullscreen', isFullscreen);
    var btn = ui.byId('toggleChartFullscreen');
    if (btn) btn.textContent = isFullscreen ? '✕ Keluar' : '⛶ Fullscreen';
    if (isFullscreen) window.AmyScrollGuard?.lock?.('guided-fullscreen');
    else window.AmyScrollGuard?.unlock?.('guided-fullscreen');
    if (chart) {
      setTimeout(function () {
        chart.resize();
        frameChartSafely(chart.candles.length);
      }, 60);
    }
  }

  function showSummary() {
    clearAfterTimer();
    if (isFullscreen) toggleFullscreen(false);
    var report = session.summary(results);
    var host = ui.byId('reviewTopics');
    host.replaceChildren();
    ui.byId('guidedWorkspace').hidden = true;
    ui.byId('guidedSummary').hidden = false;

    var pct = report.total ? Math.round((report.correct / report.total) * 100) : 0;
    ui.text('summaryScore', report.correct + ' / ' + report.total + ' benar · ' + pct + '%');
    ui.text(
      'summaryIntro',
      report.topics.length
        ? 'Fokus perbaiki pilar berikut berdasarkan soal yang masih salah, lalu ulangi lewat tombol "Latih Ulang Soal Salah".'
        : 'Sempurna! Semua soal di sesi ini benar. Naikkan tingkat kesulitan atau coba pilar lainnya.'
    );

    var drillSessionBtn = ui.byId('drillSessionMistakes');
    if (drillSessionBtn) {
      drillSessionBtn.hidden = !report.wrongIds.length;
      drillSessionBtn.textContent = 'Latih Ulang Soal Salah (' + report.wrongIds.length + ')';
    }

    report.topics.forEach(function (topic) {
      var card = element('article', '', host);
      card.className = 'practice-panel';
      element('h3', topic.lesson.title + ' · ' + topic.mistakes.length + ' perlu ditinjau', card);
      var link = element('a', 'Buka materi ini →', card);
      link.href = topic.lesson.href;
      link.className = 'btn primary';
      link.addEventListener('click', saveReport);
      topic.mistakes.forEach(function (r) {
        var detail = element('details', '', card);
        element('summary', r.exercise.title + ' — ' + r.exercise.prompt, detail);
        element('p', 'Jawaban Anda: ' + r.answer, detail);
        element('p', 'Jawaban Benar: ' + r.exercise.answer, detail);
        element('p', r.exercise.principle, detail);
      });
    });

    saveReport();
    ui.byId('guidedSummary').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function saveReport() {
    remember(SUMMARY_KEY, {
      review: session.summary(results).topics.map(function (t) {
        return { title: t.lesson.title, href: t.lesson.href };
      }),
      results: results.map(function (r) {
        return { id: r.exercise.id, answer: r.answer, correct: r.correct };
      })
    });
  }

  function start(opts) {
    opts = opts || {};
    clearAfterTimer();
    if (isFullscreen) toggleFullscreen(false);

    var difficulty = opts.mistakesOnly ? 'ALL' : ui.byId('exerciseCategory').value;
    var topic = opts.mistakesOnly ? 'ALL' : ui.byId('exerciseTopic').value;
    var length = opts.mistakesOnly ? 100 : Number(ui.byId('sessionLength').value);

    exercises = session.select(bank, difficulty, length, seen, Math.random, {
      topic: topic,
      mistakesOnly: Boolean(opts.mistakesOnly),
      masteryMap: masteryMap
    });

    if (!exercises.length) {
      ui.status(
        'guidedStatus',
        opts.mistakesOnly
          ? 'Belum ada soal salah untuk diulang. Mantap!'
          : 'Tidak ada soal untuk kombinasi pilar dan level ini. Coba ubah ke "Semua Level".',
        true
      );
      return;
    }

    index = 0;
    results = [];
    ui.byId('guidedSummary').hidden = true;
    ui.byId('guidedWorkspace').hidden = false;
    loadExercise();
  }

  async function init() {
    try {
      chart = new window.AmyCandleChart.CandleChart(ui.byId('chart'), {
        storageKey: '',
        onCrosshair: function (candle, time) {
          if (candle) ui.renderOhlc('ohlc', candle, Number(time));
        }
      });

      var response = await fetch('assets/data/guided-exercises.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Bank soal gagal dimuat. Buka ulang latihan.');
      var data = await response.json();
      bank = Array.isArray(data.exercises) ? data.exercises : [];

      if (
        bank.length < 60 ||
        bank.some(function (q) {
          return !q.candles || !q.candles.length || !Array.isArray(q.choices) || !q.choices.includes(q.answer);
        })
      ) {
        throw new Error('Bank soal tidak lengkap.');
      }

      renderPillarMastery();

      ui.byId('startSession').disabled = false;
      ui.byId('startSession').addEventListener('click', function () { start({ mistakesOnly: false }); });
      ui.byId('restartSession').addEventListener('click', function () { start({ mistakesOnly: false }); });
      ui.byId('drillMistakesBtn').addEventListener('click', function () { start({ mistakesOnly: true }); });
      ui.byId('drillSessionMistakes').addEventListener('click', function () { start({ mistakesOnly: true }); });

      ui.byId('toggleBlindMode').addEventListener('click', function () {
        if (answered) return;
        blindMode = !blindMode;
        applyChartAnnotations(exercises[index], false);
      });

      ui.byId('toggleChartFullscreen').addEventListener('click', function () {
        toggleFullscreen();
      });

      ui.byId('playAfterCandles').addEventListener('click', function () {
        revealAfterCandles(false);
      });

      ui.byId('nextExercise').addEventListener('click', function () {
        if (!answered) return;
        if (index === exercises.length - 1) showSummary();
        else {
          index += 1;
          loadExercise();
        }
      });

      ui.byId('endSession').addEventListener('click', function () {
        if (results.length) showSummary();
        else ui.status('guidedStatus', 'Jawab minimal satu soal untuk membuat rangkuman.');
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isFullscreen) toggleFullscreen(false);
      });

      start({ mistakesOnly: false });

      // Preserve the last report after opening a lesson and returning to this page.
      try {
        var last = JSON.parse(localStorage.getItem(SUMMARY_KEY) || 'null');
        if (last && Array.isArray(last.results) && last.results.length) {
          ui.byId('lastSummary').hidden = false;
          ui.byId('lastSummary').addEventListener('click', function () {
            var stored = JSON.parse(localStorage.getItem(SUMMARY_KEY) || 'null');
            if (!stored || !Array.isArray(stored.results)) return;
            results = stored.results
              .map(function (r) {
                return {
                  exercise: bank.find(function (q) { return q.id === r.id; }),
                  answer: r.answer,
                  correct: r.correct
                };
              })
              .filter(function (r) { return r.exercise; });
            if (results.length) showSummary();
          });
        }
      } catch (_) {}
    } catch (error) {
      ui.status('guidedStatus', error.message, true);
    }

    window.addEventListener('pagehide', function () {
      clearAfterTimer();
      if (isFullscreen) window.AmyScrollGuard?.unlock?.('guided-fullscreen');
      if (chart) chart.destroy();
    }, { once: true });
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) location.reload();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
