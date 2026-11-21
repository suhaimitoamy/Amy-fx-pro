import {createIctCanvas} from './ict-canvas.js';
import {calculateNextGenIndicators} from './nextgen-indicators.js';

export const DEFAULT_CHART_LAYERS = Object.freeze({
  poi: true,
  touches: true,
  structure: true,
  liquidity: true,
  pdhl: true,
  alarms: true,
  asia: false,
  pwhl: false,
  idm: false,
  expansion: false,
  killzones: false
});

function isWeekendClosure(timeSec) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hourCycle: 'h23', hour: '2-digit', minute: '2-digit', weekday: 'short'
    }).formatToParts(new Date(timeSec * 1000));
    const values = Object.fromEntries(parts.map(x => [x.type, x.value]));
    const weekday = values.weekday, hour = Number(values.hour) + Number(values.minute) / 60;
    if (weekday === 'Sat') return true;
    if (weekday === 'Sun') return hour < 17;
    if (weekday === 'Fri') return hour >= 17;
    return false;
  } catch (_) {
    const d = new Date(timeSec * 1000), day = d.getUTCDay();
    return day === 6 || day === 0;
  }
}

function formatWitaCrosshairTime(timeSec) {
  const ts = typeof timeSec === 'number' ? timeSec : Number(timeSec);
  if (!Number.isFinite(ts) || ts <= 0) return '';
  try {
    const d = new Date(ts * 1000);
    const parts = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(d);
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return `${p.day} ${p.month} ${p.hour}:${p.minute} WITA`;
  } catch (_) {
    return '';
  }
}

function formatWitaTickMark(timeSec, tickMarkType) {
  const ts = typeof timeSec === 'number' ? timeSec : Number(timeSec);
  if (!Number.isFinite(ts) || ts <= 0) return '';
  try {
    const d = new Date(ts * 1000);
    if (tickMarkType <= 2) {
      return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        day: '2-digit',
        month: 'short'
      }).format(d);
    }
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(d);
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return `${p.hour}:${p.minute}`;
  } catch (_) {
    return '';
  }
}

function getThemeColors() {
  const light = typeof document !== 'undefined' && (
    document.documentElement.dataset.amyfxTheme === 'light' ||
    document.documentElement.dataset.theme === 'light'
  );
  if (light) {
    return {
      light: true,
      bg: '#FFFFFF',
      text: '#475569',
      grid: '#E2E8F0',
      border: '#CBD5E1',
      crosshair: '#64748B',
      crosshairBg: '#1E293B',
      up: '#059669',
      down: '#E11D48'
    };
  }
  return {
    light: false,
    bg: '#06090F',
    text: '#94A3B8',
    grid: '#141B29',
    border: '#1E293B',
    crosshair: '#64748B',
    crosshairBg: '#1E293B',
    up: '#00C896',
    down: '#FF4D6A'
  };
}

// Shared presentation only; candle/model ownership remains with each caller.
export function createPriceChart(element, { touchAxes = false, onCrosshairOHLC = null } = {}) {
  let lastClosePrice = null, lastResult = null, activeBar = null;
  let activeLayers = { ...DEFAULT_CHART_LAYERS };
  let isHoveringCrosshair = false;
  let crosshairCallback = onCrosshairOHLC;

  const palette = getThemeColors();
  const chart = window.LightweightCharts.createChart(element, {
    autoSize: true,
    localization: {
      timeFormatter: formatWitaCrosshairTime
    },
    layout: {
      background: { color: palette.bg },
      textColor: palette.text,
      fontFamily: "ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace"
    },
    grid: {
      vertLines: { color: palette.grid },
      horzLines: { color: palette.grid }
    },
    crosshair: {
      vertLine: { color: palette.crosshair, labelBackgroundColor: palette.crosshairBg },
      horzLine: { color: palette.crosshair, labelBackgroundColor: palette.crosshairBg }
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
      borderColor: palette.border,
      tickMarkFormatter: formatWitaTickMark
    },
    rightPriceScale: {
      minimumWidth: 68,
      autoScale: true,
      borderColor: palette.border,
      scaleMargins: { top: 0.14, bottom: 0.12 }
    },
    handleScale: {
      pinch: true,
      mouseWheel: true,
      axisPressedMouseMove: { time: true, price: true },
      axisDoubleClickReset: { time: true, price: true }
    },
    handleScroll: {
      vertTouchDrag: touchAxes,
      horzTouchDrag: true,
      pressedMouseMove: true,
      mouseWheel: true
    }
  });

  const series = chart.addCandlestickSeries({
    upColor: palette.up,
    downColor: palette.down,
    borderVisible: false,
    wickUpColor: palette.up,
    wickDownColor: palette.down,
    autoscaleInfoProvider: (original) => {
      const res = original ? original() : null;
      if (!res || !res.priceRange) return res;
      let min = res.priceRange.minValue, max = res.priceRange.maxValue;
      if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return res;
      const tf = lastResult?.tf || 'M15';
      const maxSpan = tf === 'H1' ? 140 : 70;
      if (max - min > maxSpan) {
        const anchor = (Number.isFinite(lastClosePrice) && lastClosePrice >= min && lastClosePrice <= max)
          ? lastClosePrice
          : (min + max) / 2;
        min = anchor - maxSpan / 2;
        max = anchor + maxSpan / 2;
      }
      return { priceRange: { minValue: min, maxValue: max }, margins: res.margins };
    }
  });

  let ict = null;
  let key = '', lines = [], indicatorLines = [], alertLines = [], rightBars = null;

  function emitOHLC(bar, hovering) {
    const cb = crosshairCallback || onCrosshairOHLC;
    if (typeof cb !== 'function' || !bar) return;
    const o = Number(bar.open), h = Number(bar.high), l = Number(bar.low), c = Number(bar.close);
    if (!Number.isFinite(o) || !Number.isFinite(h) || !Number.isFinite(l) || !Number.isFinite(c)) return;
    cb({
      time: bar.time,
      open: o,
      high: h,
      low: l,
      close: c,
      diff: c - o,
      range: h - l,
      hovering: Boolean(hovering),
      tf: lastResult?.tf || 'M15'
    });
  }

  function getLatestDisplayBar() {
    if (activeBar && Number.isFinite(activeBar.close)) return activeBar;
    const cs = lastResult?.candles;
    return cs && cs.length ? cs[cs.length - 1] : null;
  }

  const handleCrosshairMove = (param) => {
    const cb = crosshairCallback || onCrosshairOHLC;
    if (typeof cb !== 'function') return;
    const bar = param?.seriesData?.get?.(series);
    if (bar && Number.isFinite(bar.close)) {
      isHoveringCrosshair = true;
      emitOHLC({ ...bar, time: param.time ?? bar.time }, true);
    } else {
      isHoveringCrosshair = false;
      const latest = getLatestDisplayBar();
      if (latest) emitOHLC(latest, false);
    }
  };
  if (typeof chart.subscribeCrosshairMove === 'function') {
    chart.subscribeCrosshairMove(handleCrosshairMove);
  }

  function readActiveAlerts() {
    try {
      if (typeof window !== 'undefined' && typeof window.AmyPriceAlertManager?.getAlerts === 'function') {
        return window.AmyPriceAlertManager.getAlerts().filter(a => a && a.status === 'ACTIVE' && Number.isFinite(Number(a.targetPrice)));
      }
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('amyfx_custom_price_alerts');
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter(a => a && a.status === 'ACTIVE' && Number.isFinite(Number(a.targetPrice))) : [];
      }
    } catch (_) {}
    return [];
  }

  function drawAlertLines() {
    alertLines.forEach(line => { try { series.removePriceLine(line); } catch (_) {} });
    alertLines = [];
    if (activeLayers.alarms === false) return;
    if (typeof series.createPriceLine !== 'function') return;
    const active = readActiveAlerts();
    for (const a of active) {
      const price = Number(a.targetPrice);
      const isAbove = a.direction === 'CROSS_ABOVE';
      const rawNote = String(a.note || '').replace(/^[^\w$]+/, '').trim();
      const shortNote = rawNote && rawNote !== 'Alarm Target Harga' ? rawNote.slice(0, 14) : 'ALARM';
      alertLines.push(series.createPriceLine({
        price,
        title: `${isAbove ? '▲' : '▼'} ${shortNote}`,
        color: isAbove ? '#34d399' : '#f87171',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true
      }));
    }
  }

  function theme() {
    const t = getThemeColors();
    if (typeof chart.applyOptions === 'function') {
      chart.applyOptions({
        layout: { background: { color: t.bg }, textColor: t.text },
        grid: { vertLines: { color: t.grid }, horzLines: { color: t.grid } },
        timeScale: { borderColor: t.border },
        rightPriceScale: { borderColor: t.border },
        crosshair: {
          vertLine: { color: t.crosshair, labelBackgroundColor: t.crosshairBg },
          horzLine: { color: t.crosshair, labelBackgroundColor: t.crosshairBg }
        }
      });
    }
    if (typeof series?.applyOptions === 'function') {
      series.applyOptions({
        upColor: t.up,
        downColor: t.down,
        wickUpColor: t.up,
        wickDownColor: t.down
      });
    }
    ict?.invalidate();
  }

  theme();
  window.addEventListener('amyfx:theme-change', theme);
  window.addEventListener('amyfx:price-alerts-updated', drawAlertLines);
  let themeObserver = null;
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && document.documentElement) {
    themeObserver = new MutationObserver(() => theme());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-amyfx-theme', 'data-theme']
    });
  }

  let lastMeasuredWidth = element?.clientWidth || 0;

  function getResponsiveRightOffset(requested) {
    const w = element?.clientWidth || 360;
    const req = Number.isFinite(Number(requested)) ? Number(requested) : 6;
    return w < 520 ? Math.max(2, Math.min(4, req)) : Math.max(4, Math.min(10, req));
  }

  function fitRecentCandles() {
    const cs = lastResult?.candles;
    if (!cs || !cs.length) return;
    const w = element?.clientWidth || 360;
    const rightPad = w < 520 ? 3 : 6;
    if (typeof chart.applyOptions === 'function') {
      chart.applyOptions({ timeScale: { rightOffset: rightPad } });
    }
    if (typeof chart.priceScale === 'function') {
      chart.priceScale('right')?.applyOptions?.({ autoScale: true });
    }
    if (typeof chart.timeScale === 'function') {
      const ts = chart.timeScale();
      if (typeof ts?.setVisibleLogicalRange === 'function') {
        const total = cs.length;
        const visibleBars = w < 520
          ? (lastResult?.tf === 'H1' ? 28 : 24)
          : (lastResult?.tf === 'H1' ? 52 : 42);
        ts.setVisibleLogicalRange({
          from: Math.max(0, total - visibleBars),
          to: total + rightPad
        });
      } else if (typeof ts?.fitContent === 'function') {
        ts.fitContent();
      }
    }
    ict?.invalidate();
  }

  return {
    setOnCrosshairOHLC(fn) {
      crosshairCallback = fn;
    },
    draw(result, plan = result.plan, presentation = null) {
      lastResult = result;
      activeBar = null;
      if (presentation?.layers) {
        activeLayers = { ...DEFAULT_CHART_LAYERS, ...presentation.layers };
      }

      if (presentation && !ict) ict = createIctCanvas(element, chart, series);
      if (presentation) {
        const nextRightBars = presentation.settings?.rightBars ?? 6;
        if (rightBars !== nextRightBars) {
          rightBars = nextRightBars;
          chart.applyOptions({ timeScale: { rightOffset: rightBars } });
        }
      }

      const cs = result.candles || [];
      const first = cs[0], last = cs[cs.length - 1];
      if (last && Number.isFinite(last.close)) lastClosePrice = last.close;
      const next = `${result.tf}:${cs.length}:${first?.time}:${first?.close}:${last?.time}:${last?.open}:${last?.high}:${last?.low}:${last?.close}`;
      if (next !== key) {
        const initial = !key;
        series.setData(result.candles);
        key = result.candles.length ? next : '';
        if (initial && result.candles.length) {
          fitRecentCandles();
        }
      }

      const getInd = typeof calculateNextGenIndicators === 'function' ? calculateNextGenIndicators : null;
      const indicators = presentation
        ? (presentation.indicators || (getInd ? getInd(result.candles, {
            context: presentation.context || (presentation.amy ? { amy: presentation.amy } : null),
            tf: result.tf
          }) : null))
        : null;
      if (typeof window !== 'undefined' && indicators) window.amyfxLastIndicators = indicators;

      ict?.update(presentation ? { ...presentation, layers: activeLayers, indicators, candles: result.candles, tf: result.tf } : null);

      const signalMarkers = [];
      if (presentation?.amy && presentation.settings?.signals) {
        const duration = { M1: 60, M5: 300, M15: 900, H1: 3600 }[result.tf] || 900;
        const times = new Set(result.candles.map(c => c.time));
        const seen = new Set();
        for (const signal of presentation.amy.signals || []) {
          const time = Math.floor(signal.time / duration) * duration;
          const id = time + ':' + signal.winDir;
          if (!times.has(time) || seen.has(id)) continue;
          seen.add(id);
          signalMarkers.push({
            time,
            position: signal.winDir === 1 ? 'belowBar' : 'aboveBar',
            color: signal.winDir === 1 ? '#00c853' : '#ef5350',
            shape: signal.winDir === 1 ? 'arrowUp' : 'arrowDown',
            text: ''
          });
        }
      }
      if (presentation?.settings?.displacement && presentation.amy) {
        for (const marker of presentation.amy.visuals?.displacement || []) {
          if (result.candles.some(c => c.time === marker.time)) {
            signalMarkers.push({
              time: marker.time,
              position: marker.side === 'BUY' ? 'belowBar' : 'aboveBar',
              color: '#f5c562',
              shape: 'circle',
              text: 'Disp'
            });
          }
        }
      }
      series.setMarkers?.(signalMarkers.sort((a, b) => a.time - b.time));

      // Plan / scenario price lines (Single Source of Truth: Scalper Pro POI / Driver / Overlay)
      lines.forEach(line => { try { series.removePriceLine(line); } catch (_) {} });
      lines = [];
      const placedPlanPrices = [];
      const proximityLimit = result.tf === 'H1' ? 75 : 42;
      const klRef = indicators?.keyLevels || null;
      if (plan && activeLayers.poi !== false) {
        const lastPrice = Number(window.amyfxCurrentPrice) || result.candles?.at(-1)?.close;
        const structInvLevel = Number(indicators?.structure?.invalidation?.level);
        const nearStructInv = v => activeLayers.structure && Number.isFinite(structInvLevel) && Math.abs(v - structInvLevel) <= 1.0;

        if (plan.scalper && plan.area) {
          const tp1NearPdl = activeLayers.pdhl && Number.isFinite(klRef?.pdl) && Number.isFinite(plan.tp1) && Math.abs(plan.tp1 - klRef.pdl) <= 0.35;
          const tp1NearPdh = activeLayers.pdhl && Number.isFinite(klRef?.pdh) && Number.isFinite(plan.tp1) && Math.abs(plan.tp1 - klRef.pdh) <= 0.35;
          const tp1Title = tp1NearPdl ? 'TP1 · PDL' : (tp1NearPdh ? 'TP1 · PDH' : 'TP1 BEP');
          const tp1TooCloseToTp2 = Number.isFinite(plan.tp1) && Number.isFinite(plan.tp2) && Math.abs(plan.tp1 - plan.tp2) <= 0.5;
          // Shaded OB/FVG box already renders POI top/bottom bounds on canvas;
          // plot only the 4 clean execution lines so right-axis labels never collide with SL.
          const items = [
            { value: plan.area.ce, title: '50% CE', color: '#f5c451', lineStyle: 0 },
            ...(tp1TooCloseToTp2 ? [] : [{ value: plan.tp1, title: tp1Title, color: '#eab308', lineStyle: 2 }]),
            { value: plan.tp2, title: 'TP2 DOL', color: '#22c55e', lineStyle: 2 },
            { value: plan.sl, title: 'SL', color: '#ef4444', lineStyle: 1 }
          ];
          for (const it of items) {
            if (!Number.isFinite(it.value)) continue;
            if (it.title === 'SL' && nearStructInv(it.value)) continue;
            if (lastPrice && Math.abs(it.value - lastPrice) > proximityLimit) continue;
            lines.push(series.createPriceLine({ price: it.value, title: it.title, color: it.color, lineWidth: 1, lineStyle: it.lineStyle, axisLabelVisible: true }));
            placedPlanPrices.push(it.value);
          }
        } else if (plan.area) {
          const markers = [
            ['area.low', 'AREA BAWAH', '#8bb9ff', 0],
            ['area.high', 'AREA ATAS', '#8bb9ff', 0],
            ['area.ce', '50% CE', '#ffd166', 2],
            ['invalidation', 'INVALIDASI', '#ef4444', 1],
            ['target', 'LIKUIDITAS', '#22c55e', 0]
          ];
          for (const [field, title, color, lineStyle] of markers) {
            const value = field === 'area.low' ? plan.area.low : field === 'area.high' ? plan.area.high : field === 'area.ce' ? plan.area?.ce : plan[field];
            if (Number.isFinite(value)) {
              if (title === 'INVALIDASI' && nearStructInv(value)) continue;
              if (lastPrice && Math.abs(value - lastPrice) > proximityLimit) continue;
              lines.push(series.createPriceLine({ price: value, title, color, lineWidth: 1, lineStyle, axisLabelVisible: true }));
              placedPlanPrices.push(value);
            }
          }
        } else {
          const entryVal = plan.entry;
          const slVal = plan.stopLoss ?? plan.sl;
          const tp1Val = plan.target1 ?? plan.tp1;
          const tp2Val = plan.target2 ?? plan.target ?? plan.tp;
          const items = [
            { value: entryVal, title: 'ENTRY', color: '#38bdf8', lineStyle: 0 },
            { value: slVal, title: 'SL', color: '#ef4444', lineStyle: 0 },
            { value: tp1Val, title: 'TP1', color: '#eab308', lineStyle: 0 },
            { value: tp2Val, title: tp1Val ? 'TP2' : 'TARGET', color: '#22c55e', lineStyle: 0 }
          ];
          for (const it of items) {
            if (Number.isFinite(it.value)) {
              if (lastPrice && Math.abs(it.value - lastPrice) > proximityLimit) continue;
              lines.push(series.createPriceLine({ price: it.value, title: it.title, color: it.color, lineWidth: 1, lineStyle: it.lineStyle, axisLabelVisible: true }));
              placedPlanPrices.push(it.value);
            }
          }
        }
      }

      // Single-source Key Level & Structure Invalidation price lines (no duplicate canvas drawing!)
      indicatorLines.forEach(line => { try { series.removePriceLine(line); } catch (_) {} });
      indicatorLines = [];
      if (presentation && typeof series.createPriceLine === 'function' && indicators?.keyLevels) {
        const kl = indicators.keyLevels;
        const lastPrice = Number(window.amyfxCurrentPrice) || result.candles?.at(-1)?.close;
        const nearPlanLine = v => placedPlanPrices.some(p => Math.abs(p - v) <= 0.35);
        const valid = v => Number.isFinite(v) && (!lastPrice || Math.abs(v - lastPrice) <= proximityLimit);

        if (activeLayers.pdhl) {
          if (valid(kl.pdh) && !nearPlanLine(kl.pdh)) indicatorLines.push(series.createPriceLine({ price: kl.pdh, title: 'PDH', color: '#f97316', lineWidth: 1, lineStyle: 2, axisLabelVisible: true }));
          if (valid(kl.pdl) && !nearPlanLine(kl.pdl)) indicatorLines.push(series.createPriceLine({ price: kl.pdl, title: 'PDL', color: '#3b82f6', lineWidth: 1, lineStyle: 2, axisLabelVisible: true }));
        }
        if (activeLayers.pwhl) {
          if (valid(kl.pwh) && !nearPlanLine(kl.pwh)) indicatorLines.push(series.createPriceLine({ price: kl.pwh, title: 'PWH', color: '#d946ef', lineWidth: 1, lineStyle: 1, axisLabelVisible: true }));
          if (valid(kl.pwl) && !nearPlanLine(kl.pwl)) indicatorLines.push(series.createPriceLine({ price: kl.pwl, title: 'PWL', color: '#06b6d4', lineWidth: 1, lineStyle: 1, axisLabelVisible: true }));
          if (valid(kl.pdEq) && !nearPlanLine(kl.pdEq)) indicatorLines.push(series.createPriceLine({ price: kl.pdEq, title: 'PD EQ', color: '#94a3b8', lineWidth: 1, lineStyle: 2, axisLabelVisible: true }));
        }
        if (activeLayers.structure && indicators.structure?.invalidation && valid(indicators.structure.invalidation.level)) {
          const inv = indicators.structure.invalidation;
          indicatorLines.push(series.createPriceLine({
            price: inv.level,
            title: inv.text || 'INVALID',
            color: inv.color || '#ef4444',
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: true
          }));
        }
      }

      drawAlertLines();
      if (!isHoveringCrosshair && last) {
        emitOHLC(last, false);
      }
    },
    reset() {
      key = '';
      rightBars = null;
      lastResult = null;
      activeBar = null;
      indicatorLines.forEach(line => { try { series.removePriceLine(line); } catch (_) {} });
      indicatorLines = [];
      alertLines.forEach(line => { try { series.removePriceLine(line); } catch (_) {} });
      alertLines = [];
    },
    updateActiveCandle(price, timeMs = Date.now()) {
      if (!Number.isFinite(price) || price <= 0) return;
      const cs = lastResult?.candles;
      if (!cs || !cs.length) return;
      const lastClosed = cs[cs.length - 1];
      if (!lastClosed || !Number.isFinite(lastClosed.time)) return;

      const tf = lastResult.tf || 'M15';
      const duration = { M1: 60, M5: 300, M15: 900, H1: 3600 }[tf] || 900;
      const nowSec = Math.floor((Number(timeMs) || Date.now()) / 1000);

      // Do not synthesize weekend bars (Weekend Anti-Spam)
      if (isWeekendClosure(nowSec)) return;

      const bucketTime = Math.floor(nowSec / duration) * duration;
      const activeBarTime = Math.max(lastClosed.time + duration, bucketTime);

      if (activeBarTime <= lastClosed.time) {
        lastClosed.high = Math.max(lastClosed.high, price);
        lastClosed.low = Math.min(lastClosed.low, price);
        lastClosed.close = price;
        lastClosePrice = price;
        if (typeof series.update === 'function') {
          series.update(lastClosed);
        }
        if (!isHoveringCrosshair) emitOHLC(lastClosed, false);
        ict?.invalidate();
        return;
      }

      if (!activeBar || activeBar.time !== activeBarTime) {
        activeBar = {
          time: activeBarTime,
          open: lastClosed.close,
          high: Math.max(lastClosed.close, price),
          low: Math.min(lastClosed.close, price),
          close: price
        };
      } else {
        activeBar.high = Math.max(activeBar.high, price);
        activeBar.low = Math.min(activeBar.low, price);
        activeBar.close = price;
      }

      lastClosePrice = price;
      if (typeof series.update === 'function') {
        series.update(activeBar);
      }
      if (!isHoveringCrosshair) emitOHLC(activeBar, false);
      ict?.invalidate();
    },
    autoPrice() {
      if (typeof chart.priceScale === 'function') {
        chart.priceScale('right')?.applyOptions?.({ autoScale: true });
      }
      ict?.invalidate();
    },
    chart,
    series,
    element,
    resize() {
      chart.applyOptions({ autoSize: true });
      const w = element?.clientWidth || 0;
      if (w && chart.resize) chart.resize(w, element.clientHeight || 340);
      if (w && Math.abs(w - lastMeasuredWidth) > 100) {
        lastMeasuredWidth = w;
        fitRecentCandles();
      } else {
        ict?.invalidate();
      }
    },
    setFullscreen(enabled) {
      chart.applyOptions({
        layout: { fontSize: enabled ? 16 : 12 },
        rightPriceScale: { minimumWidth: enabled ? 90 : 65 },
        handleScroll: { vertTouchDrag: enabled ? true : Boolean(touchAxes), horzTouchDrag: true, pressedMouseMove: true, mouseWheel: true },
        handleScale: { pinch: true, mouseWheel: true, axisPressedMouseMove: { time: true, price: true }, axisDoubleClickReset: { time: true, price: true } }
      });
      ict?.invalidate();
    },
    destroy() {
      window.removeEventListener('amyfx:theme-change', theme);
      window.removeEventListener('amyfx:price-alerts-updated', drawAlertLines);
      if (themeObserver) {
        try { themeObserver.disconnect(); } catch (_) {}
      }
      if (typeof chart.unsubscribeCrosshairMove === 'function') {
        try { chart.unsubscribeCrosshairMove(handleCrosshairMove); } catch (_) {}
      }
      ict?.destroy();
      indicatorLines.forEach(line => { try { series.removePriceLine(line); } catch (_) {} });
      alertLines.forEach(line => { try { series.removePriceLine(line); } catch (_) {} });
      chart.remove();
    }
  };
}
createPriceChart.DEFAULT_CHART_LAYERS = DEFAULT_CHART_LAYERS;
