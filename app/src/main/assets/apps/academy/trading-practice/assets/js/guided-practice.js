(function () {
  'use strict';
  var ui = window.AmyPracticeUI;
  var provider = window.AmyPracticeData;
  var chart;
  var exercises = [];
  var allExercises = [];
  var loadSequence = 0;
  var index = 0;
  var active = null;
  var completed = false;

  async function record(answer, correct) {
    await window.AmyPracticeStorage.saveGuidedResult({
      exerciseId: active.id, title: active.title, answer: String(answer), correct: Boolean(correct),
      timeframe: active.timeframe, source: provider.SAMPLE_ID
    });
  }

  function finishAttempt(answer, correct) {
    record(answer, correct).catch(function () {});
    ui.text('exercisePrinciple', active.principle);
    ui.status('guidedStatus', correct ? active.success : active.retry, !correct);
    if (correct) {
      completed = true;
      var button = ui.byId('nextExercise');
      button.hidden = false;
      button.textContent = index === exercises.length - 1 ? 'Selesai — lihat riwayat' : 'Latihan berikutnya';
    }
  }

  function handleTap(point) {
    if (!active || active.type !== 'tap' || completed) return;
    var correct = Math.abs(point.time - active.answerTime) <= active.timeTolerance && point.price >= active.priceMin && point.price <= active.priceMax;
    finishAttempt(coreAnswer(point), correct);
  }

  function coreAnswer(point) { return window.AmyPracticeCore.formatWita(point.time, true) + ' @ ' + window.AmyPracticeCore.price(point.price); }

  function renderChoices() {
    var host = ui.byId('exerciseChoices');
    host.innerHTML = '';
    if (active.type !== 'choice') return;
    active.choices.forEach(function (choice) {
      var button = document.createElement('button');
      button.type = 'button'; button.textContent = choice;
      button.addEventListener('click', function () { if (!completed) finishAttempt(choice, choice === active.answer); });
      host.appendChild(button);
    });
  }

  async function loadExercise() {
    const sequence=++loadSequence;
    active = exercises[index];
    completed = false;
    ui.byId('nextExercise').hidden = true;
    ui.text('exerciseLabel', 'LATIHAN ' + (index + 1) + ' DARI ' + exercises.length);
    ui.text('exerciseTitle', active.title);
    ui.text('exercisePrompt', active.prompt);
    ui.text('exercisePrinciple', 'Penjelasan tersedia setelah Anda menjawab.');
    ui.text('exerciseTimeframe', active.timeframe);
    ui.byId('guidedProgress').style.width = ((index / exercises.length) * 100) + '%';
    ui.status('guidedStatus', active.type === 'tap' ? 'Ketuk jawaban langsung pada chart.' : 'Pilih satu keputusan di bawah.');
    renderChoices();
    // Guided answers are frozen against the bundled March 2009 sample. Never let
    // a user-selected historical pack silently move the expected timestamps.
    var result = await provider.getCandles({ symbol: 'XAUUSD', timeframe: active.timeframe, sourceId: provider.SAMPLE_ID });
    if(sequence!==loadSequence)return;
    var visible = result.candles.filter(function (candle) { return candle.time >= active.visibleStart && candle.time <= active.visibleEnd; });
    chart.setCandles(visible, true);
    chart.setTradeLevels(active.referenceLevel == null ? [] : [{type:'entry',price:active.referenceLevel,title:'Level acuan latihan'}]);
  }

  async function init() {
    chart = new window.AmyCandleChart.CandleChart(ui.byId('chart'), {
      storageKey: '', onChartTap: handleTap,
      onCrosshair: function (candle, time) { if (candle) ui.renderOhlc('ohlc', candle, Number(time)); }
    });
    try {
      var response = await fetch('assets/data/guided-exercises.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Daftar latihan tidak dapat dibaca.');
      allExercises = (await response.json()).exercises || [];
      exercises = allExercises;
      var categories=Array.from(new Set(allExercises.map(item=>item.category)));
      var select=ui.byId('exerciseCategory');
      categories.forEach(category=>{var option=document.createElement('option');option.value=category;option.textContent=category;select.appendChild(option);});
      select.addEventListener('change',()=>{exercises=select.value==='ALL'?allExercises:allExercises.filter(item=>item.category===select.value);index=0;loadExercise().catch(error=>ui.status('guidedStatus',error.message,true));});
      if (!exercises.length) throw new Error('Latihan belum tersedia.');
      await loadExercise();
    } catch (error) { ui.status('guidedStatus', error.message, true); }
    ui.byId('nextExercise').addEventListener('click', function () {
      if (index === exercises.length - 1) { location.href = 'backtest-history.html'; return; }
      index += 1; loadExercise().catch(function (error) { ui.status('guidedStatus', error.message, true); });
    });
    window.addEventListener('pagehide', function () { chart.destroy(); }, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
