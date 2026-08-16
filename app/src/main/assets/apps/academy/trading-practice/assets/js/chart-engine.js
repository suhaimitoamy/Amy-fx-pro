/* Amy FX Trading Practice — reusable local Lightweight Charts surface + SVG drawings. */
(function (root) {
  'use strict';

  if (root.AmyCandleChart) return;

  var COLORS = Object.freeze({
    horizontal: '#9ca3af',
    trend: '#60a5fa',
    zone: 'rgba(139, 92, 246, 0.20)',
    entry: '#facc15',
    stop: '#ef4444',
    target: '#22c55e'
  });

  function escapeSelector(value) {
    return String(value || '').replace(/[^a-zA-Z0-9_-]/g, '-');
  }

  function CandleChart(container, options) {
    options = options || {};
    if (!container) throw new Error('Container chart tidak ditemukan.');
    if (!root.LightweightCharts) throw new Error('Lightweight Charts lokal belum dimuat.');

    this.container = container;
    this.options = options;
    this.storageKey = options.storageKey || '';
    this.activeTool = null;
    this.startPoint = null;
    this.drawings = this.loadDrawings();
    this.priceLines = [];
    this.onCrosshair = typeof options.onCrosshair === 'function' ? options.onCrosshair : function () {};
    this.onChartTap = typeof options.onChartTap === 'function' ? options.onChartTap : function () {};

    container.classList.add('practice-chart-shell');
    this.host = document.createElement('div');
    this.host.className = 'practice-chart-canvas';
    this.overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.overlay.classList.add('practice-chart-overlay');
    this.overlay.setAttribute('aria-hidden', 'true');
    container.appendChild(this.host);
    container.appendChild(this.overlay);

    this.chart = root.LightweightCharts.createChart(this.host, {
      width: Math.max(280, container.clientWidth || 800),
      height: Math.max(360, Number(options.height || container.clientHeight || 520)),
      layout: { background: { color: '#0b111a' }, textColor: '#a8b3c4' },
      grid: { vertLines: { color: '#17202d' }, horzLines: { color: '#17202d' } },
      crosshair: { mode: root.LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#263244', scaleMargins: { top: 0.08, bottom: 0.12 } },
      timeScale: { borderColor: '#263244', timeVisible: true, secondsVisible: false, rightOffset: 4 },
      handleScale: true,
      handleScroll: true,
      localization: { locale: 'id-ID' }
    });
    this.series = this.chart.addCandlestickSeries({
      upColor: '#2dd4bf', downColor: '#fb7185', borderVisible: false,
      wickUpColor: '#2dd4bf', wickDownColor: '#fb7185', priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
    });

    this.handleCrosshair = this.handleCrosshair.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.renderDrawings = this.renderDrawings.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.chart.subscribeCrosshairMove(this.handleCrosshair);
    this.chart.subscribeClick(this.handleClick);
    this.chart.timeScale().subscribeVisibleTimeRangeChange(this.renderDrawings);
    this.overlay.addEventListener('pointerdown', this.handlePointerDown);
    this.overlay.addEventListener('pointerup', this.handlePointerUp);

    var self = this;
    this.resizeObserver = root.ResizeObserver ? new ResizeObserver(function () { self.resize(); }) : null;
    if (this.resizeObserver) this.resizeObserver.observe(container);
    root.addEventListener('resize', this.renderDrawings);
    this.resize();
  }

  CandleChart.prototype.loadDrawings = function () {
    if (!this.storageKey) return [];
    try {
      var value = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  };

  CandleChart.prototype.saveDrawings = function () {
    if (!this.storageKey) return;
    try { localStorage.setItem(this.storageKey, JSON.stringify(this.drawings)); } catch (_) {}
  };

  CandleChart.prototype.resize = function () {
    var width = Math.max(280, this.container.clientWidth || 800);
    var height = Math.max(360, Number(this.options.height || this.container.clientHeight || 520));
    this.chart.applyOptions({ width: width, height: height });
    this.overlay.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    this.overlay.setAttribute('width', width);
    this.overlay.setAttribute('height', height);
    this.renderDrawings();
  };

  CandleChart.prototype.setCandles = function (candles, fit) {
    var safe = (Array.isArray(candles) ? candles : []).map(function (candle) {
      return { time: candle.time, open: candle.open, high: candle.high, low: candle.low, close: candle.close };
    });
    this.series.setData(safe);
    if (fit !== false && safe.length) this.chart.timeScale().fitContent();
    this.renderDrawings();
  };

  CandleChart.prototype.updateCandle = function (candle) {
    if (!candle) return;
    this.series.update({ time: candle.time, open: candle.open, high: candle.high, low: candle.low, close: candle.close });
  };

  CandleChart.prototype.setTool = function (tool) {
    this.activeTool = tool || null;
    this.startPoint = null;
    this.overlay.classList.toggle('is-drawing', Boolean(this.activeTool));
    this.overlay.setAttribute('aria-hidden', this.activeTool ? 'false' : 'true');
  };

  CandleChart.prototype.clearDrawings = function () {
    this.drawings = [];
    this.saveDrawings();
    this.renderDrawings();
  };

  CandleChart.prototype.pointFromEvent = function (event) {
    var rect = this.overlay.getBoundingClientRect();
    var x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    var y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    var time = this.chart.timeScale().coordinateToTime(x);
    var price = this.series.coordinateToPrice(y);
    if (time == null || price == null) return null;
    if (typeof time === 'object') time = Date.UTC(time.year, time.month - 1, time.day) / 1000;
    return { time: Number(time), price: Number(price) };
  };

  CandleChart.prototype.handlePointerDown = function (event) {
    if (!this.activeTool) return;
    event.preventDefault();
    var point = this.pointFromEvent(event);
    if (!point) return;
    if (['horizontal', 'entry', 'stop', 'target'].includes(this.activeTool)) {
      this.drawings.push({ id: Date.now() + '-' + Math.random(), type: this.activeTool, a: point });
      this.saveDrawings();
      this.renderDrawings();
      this.setTool(null);
      return;
    }
    this.startPoint = point;
  };

  CandleChart.prototype.handlePointerUp = function (event) {
    if (!this.activeTool || !this.startPoint) return;
    event.preventDefault();
    var point = this.pointFromEvent(event);
    if (point) {
      this.drawings.push({ id: Date.now() + '-' + Math.random(), type: this.activeTool, a: this.startPoint, b: point });
      this.saveDrawings();
      this.renderDrawings();
    }
    this.setTool(null);
  };

  CandleChart.prototype.xy = function (point) {
    if (!point) return null;
    var x = this.chart.timeScale().timeToCoordinate(point.time);
    var y = this.series.priceToCoordinate(point.price);
    return x == null || y == null ? null : { x: Number(x), y: Number(y) };
  };

  CandleChart.prototype.svgElement = function (name, attributes) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.keys(attributes).forEach(function (key) { element.setAttribute(key, attributes[key]); });
    return element;
  };

  CandleChart.prototype.renderDrawings = function () {
    if (!this.overlay || !this.series) return;
    while (this.overlay.firstChild) this.overlay.removeChild(this.overlay.firstChild);
    var width = this.container.clientWidth || 800;
    var self = this;
    this.drawings.forEach(function (drawing) {
      var a = self.xy(drawing.a);
      var b = self.xy(drawing.b);
      var element;
      if (!a) return;
      if (drawing.type === 'zone' && b) {
        element = self.svgElement('rect', {
          x: Math.min(a.x, b.x), y: Math.min(a.y, b.y),
          width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y),
          fill: COLORS.zone, stroke: '#a78bfa', 'stroke-width': 1.5
        });
      } else if (drawing.type === 'trend' && b) {
        element = self.svgElement('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: COLORS.trend, 'stroke-width': 2 });
      } else {
        element = self.svgElement('line', { x1: 0, y1: a.y, x2: width, y2: a.y, stroke: COLORS[drawing.type] || COLORS.horizontal, 'stroke-width': 2, 'stroke-dasharray': drawing.type === 'horizontal' ? '5 5' : 'none' });
      }
      element.dataset.drawingId = escapeSelector(drawing.id);
      self.overlay.appendChild(element);
    });
  };

  CandleChart.prototype.handleCrosshair = function (parameter) {
    var candle = parameter && parameter.seriesData && parameter.seriesData.get(this.series);
    this.onCrosshair(candle || null, parameter && parameter.time != null ? parameter.time : null);
  };

  CandleChart.prototype.handleClick = function (parameter) {
    if (!parameter || !parameter.point) return;
    var time = parameter.time;
    if (typeof time === 'object' && time) time = Date.UTC(time.year, time.month - 1, time.day) / 1000;
    var price = this.series.coordinateToPrice(parameter.point.y);
    this.onChartTap({ time: Number(time), price: Number(price), x: parameter.point.x, y: parameter.point.y });
  };

  CandleChart.prototype.setTradeLevels = function (levels) {
    var self = this;
    this.priceLines.forEach(function (line) { try { self.series.removePriceLine(line); } catch (_) {} });
    this.priceLines = [];
    (Array.isArray(levels) ? levels : []).forEach(function (level) {
      if (!Number.isFinite(Number(level.price))) return;
      self.priceLines.push(self.series.createPriceLine({
        price: Number(level.price), color: level.color || COLORS[level.type] || '#facc15',
        lineWidth: 2, lineStyle: root.LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true, title: String(level.title || level.type || '').toUpperCase()
      }));
    });
  };

  CandleChart.prototype.destroy = function () {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    root.removeEventListener('resize', this.renderDrawings);
    this.chart.timeScale().unsubscribeVisibleTimeRangeChange(this.renderDrawings);
    this.chart.unsubscribeCrosshairMove(this.handleCrosshair);
    this.chart.unsubscribeClick(this.handleClick);
    this.chart.remove();
  };

  root.AmyCandleChart = Object.freeze({ CandleChart: CandleChart, COLORS: COLORS });
})(typeof window !== 'undefined' ? window : globalThis);
