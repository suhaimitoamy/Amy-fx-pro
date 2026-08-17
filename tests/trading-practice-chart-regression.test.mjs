import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const scriptBase = new URL('../app/src/main/assets/apps/academy/trading-practice/assets/js/', import.meta.url);

function classList() {
  const values = new Set();
  return {
    add: (...items) => items.forEach(item => values.add(item)),
    remove: (...items) => items.forEach(item => values.delete(item)),
    toggle: (item, force) => force === undefined ? (values.has(item) ? !values.delete(item) : Boolean(values.add(item))) : (force ? Boolean(values.add(item)) : !values.delete(item)),
    contains: item => values.has(item)
  };
}

function node(name = 'div') {
  return {
    nodeName: name.toUpperCase(), className: '', classList: classList(), style: {}, attributes: {}, children: [],
    clientWidth: 360, clientHeight: 520, firstChild: null, textContent: '',
    appendChild(child) { this.children.push(child); this.firstChild = this.children[0] || null; child.parentNode = this; return child; },
    removeChild(child) { this.children = this.children.filter(item => item !== child); this.firstChild = this.children[0] || null; },
    setAttribute(key, value) { this.attributes[key] = String(value); },
    getAttribute(key) { return this.attributes[key] ?? null; },
    addEventListener() {}, removeEventListener() {}, querySelector() { return null; },
    getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight }; }
  };
}

function createRuntime() {
  const chartCalls = { create: null, apply: [], series: null, data: [] };
  const timeScale = {
    width: () => 276,
    height: () => 24,
    timeToCoordinate: time => time === 0 || time === 120 ? time : null,
    coordinateToTime: coordinate => coordinate,
    fitContent() {}, subscribeVisibleTimeRangeChange() {}, unsubscribeVisibleTimeRangeChange() {}
  };
  const series = {
    setData(value) { chartCalls.data = value; }, update() {},
    priceToCoordinate: price => 5000 - price,
    coordinateToPrice: coordinate => 5000 - coordinate,
    createPriceLine: options => options, removePriceLine() {}
  };
  const lightweight = {
    CrosshairMode: { Normal: 0 }, LineStyle: { Dashed: 2 },
    createChart(host, options) {
      chartCalls.create = options;
      return {
        addCandlestickSeries(optionsForSeries) { chartCalls.series = optionsForSeries; return series; },
        subscribeCrosshairMove() {}, unsubscribeCrosshairMove() {}, subscribeClick() {}, unsubscribeClick() {},
        timeScale: () => timeScale,
        priceScale: () => ({ width: () => 84 }),
        applyOptions(optionsToApply) { chartCalls.apply.push(optionsToApply); },
        remove() {}
      };
    }
  };
  const localValues = new Map();
  const document = {
    createElement: name => node(name), createElementNS: (_, name) => node(name),
    addEventListener() {}, removeEventListener() {}
  };
  const runtime = {
    console, document, LightweightCharts: lightweight,
    localStorage: { getItem: key => localValues.get(key) ?? null, setItem: (key, value) => localValues.set(key, String(value)) },
    addEventListener() {}, removeEventListener() {}, requestAnimationFrame: callback => callback(),
    setTimeout, clearTimeout
  };
  runtime.window = runtime;
  runtime.globalThis = runtime;
  vm.createContext(runtime);
  for (const name of ['drawing-core.js', 'chart-engine.js']) {
    vm.runInContext(readFileSync(new URL(name, scriptBase), 'utf8'), runtime, { filename: name });
  }
  return { runtime, chartCalls, container: node('section'), localValues };
}

test('four-digit XAUUSD prices and the current-price label have a dedicated unclipped axis', () => {
  const { runtime, chartCalls, container } = createRuntime();
  const chart = new runtime.AmyCandleChart.CandleChart(container, { storageKey: 'price-axis-test' });

  assert.equal(chartCalls.create.localization.priceFormatter(4101.27), '4101.27');
  assert.equal(chartCalls.create.rightPriceScale.entireTextOnly, true);
  assert.ok(chartCalls.create.rightPriceScale.minimumWidth >= 84);
  assert.equal(chartCalls.series.lastValueVisible, true);
  assert.equal(chartCalls.series.priceLineVisible, true);
  assert.equal(chartCalls.series.priceFormat.precision, 2);
  assert.equal(chartCalls.apply.at(-1).rightPriceScale.minimumWidth, 84, 'mobile width keeps an explicit price-axis minimum');
  assert.equal(chart.overlay.style.width, '276px', 'drawing overlay stops at plot edge instead of covering the price axis');
});

test('TIME + PRICE drawing interpolation and persistence survive chart recreation', () => {
  const { runtime, container, localValues } = createRuntime();
  const first = new runtime.AmyCandleChart.CandleChart(container, { storageKey: 'drawing-persistence-test' });
  first.setCandles([
    { time: 0, open: 4099, high: 4102, low: 4098, close: 4101 },
    { time: 120, open: 4101, high: 4110, low: 4100, close: 4108 }
  ]);
  assert.equal(first.timeToX(60), 60, 'time between candles is interpolated after a timeframe change');
  const saved = first.addDrawing('trend', [{ time: 60, price: 4101.25 }, { time: 120, price: 4108.5 }]);
  assert.ok(saved);
  assert.ok(localValues.has('drawing-persistence-test'));
  first.setTool('select');
  first.selectedId = saved.id;
  assert.equal(first.deleteSelected(), true);
  assert.equal(first.drawings.length, 0);
  assert.equal(first.undo(), true);
  assert.equal(first.drawings.length, 1);
  first.clearDrawings();
  assert.equal(first.drawings.length, 0);
  assert.equal(first.undo(), true, 'clear-all remains recoverable with Undo');
  assert.equal(first.drawings.length, 1);
  first.setDrawingTimeBoundary(60);
  assert.equal(first.isDrawingVisible(saved), false, 'a replay rewind must hide drawing anchors from a future cursor');
  const clamped = first.pointFromEvent({ clientX: 100, clientY: 100 });
  assert.equal(clamped.time, 60, 'new drawing anchors cannot move past the replay cursor');

  const nextContainer = node('section');
  const second = new runtime.AmyCandleChart.CandleChart(nextContainer, { storageKey: 'drawing-persistence-test' });
  assert.equal(second.drawings.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(second.drawings[0].points)), [
    { time: 60, price: 4101.25 }, { time: 120, price: 4108.5 }
  ]);
  assert.equal(second.activeTool, null);
  assert.equal(second.overlay.classList.contains('is-drawing'), false, 'normal chart gestures remain available while no tool is active');
});

test('analysis and replay expose every required drawing tool and load the domain model first', () => {
  const required = [
    'select', 'trend', 'horizontal', 'horizontalRay', 'parallelChannel', 'fibonacci', 'longPosition',
    'shortPosition', 'priceRange', 'rectangle', 'arrow', 'path', 'circle', 'text', 'note', 'priceNote'
  ];
  for (const page of ['chart-analysis.html', 'candle-replay.html']) {
    const source = readFileSync(new URL(`../app/src/main/assets/apps/academy/trading-practice/${page}`, import.meta.url), 'utf8');
    for (const type of required) assert.match(source, new RegExp(`data-drawing-tool=["']${type}["']`), `${page} is missing ${type}`);
    assert.ok(source.indexOf('drawing-core.js') < source.indexOf('chart-engine.js'));
    assert.match(source, /id="deleteDrawing"/);
    assert.match(source, /id="clearDrawings"/);
  }
});

test('live mode keeps the active pack as an immutable base and does not refit the viewport', () => {
  const source = readFileSync(new URL('../app/src/main/assets/apps/academy/trading-practice/assets/js/chart-analysis.js', import.meta.url), 'utf8');
  assert.match(source, /provider\.getCandles\(\{ symbol: 'XAUUSD', timeframe: timeframe\(\), sourceId: sourceId\(\) \}\)/);
  assert.match(source, /mergeCandleSeries\(historicalCandles, nativeContext\)/);
  assert.match(source, /immutableThrough: historicalEnd/);
  assert.match(source, /seedLiveContext\(false\)/);
  assert.match(source, /item\.sourceId === payload\.sourceId|sourceId\(\)/);
});
