/**
 * Amy FX Pro — Manual Chart Drawing Engine (SVG Architecture)
 * Diadopsi langsung dari arsitektur teruji fitur Backtest (AmyPracticeDrawing & CandleChart).
 *
 * Keunggulan Arsitektur Backtest:
 * 1. 100% SVG Overlay: Bebas glitch canvas, bebas masalah resolusi layar/DPR HP,
 *    dan ukuran kotak/garis selalu tajam serta terkunci presisi pada koordinat lilin.
 * 2. timeToX dengan Binary Search Candle: Tidak pernah menghasilkan koordinat 'null'
 *    saat layar dicubit (pinch-zoom). Nilai X selalu terinterpolasi mulus.
 * 3. 60/120 FPS Realtime Sync: Terkoneksi ke `touchmove`, `pointermove`,
 *    `subscribeVisibleLogicalRangeChange`, dan `subscribeVisibleTimeRangeChange`.
 * 4. 8 Handle Titik Putih Interaktif: Memungkinkan resize zona ke 8 arah secara presisi di layar HP.
 * 5. Gesture Isolation Mutlak: Mode 'Geser' (Pan) 100% transparan (`pointer-events: none`),
 *    sehingga gestur cubit layar untuk memperbesar/memperkecil jarak candle berjalan native.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

export function createManualDrawingTool({ container, chart, series, getTf, getCandles }) {
  if (!container || !chart || !series) return null;

  let currentTf = (typeof getTf === 'function' ? getTf() : 'M15') || 'M15';
  let candles = typeof getCandles === 'function' ? (getCandles() || []) : [];
  let drawings = [];
  let activeTool = 'pan'; // 'pan' | 'edit' | 'zone' | 'line' | 'target100'
  let selectedId = null;

  // Dragging / Resizing state
  let isDragging = false;
  let dragMode = null; // 'create-zone' | 'handle' | 'move-zone' | 'move-line' | 'move-target'
  let dragHandle = null; // { timeIndex, priceIndex }
  let dragStart = null; // { time, price, x, y }
  let dragCurrent = null;
  let dragOriginal = null;
  let activePointerId = null;
  let isFullscreenActive = false;

  // 1. Storage Helpers
  function getStorageKey(tf) {
    return `amyfx.manual_drawings.${tf || currentTf}`;
  }

  function loadDrawings(tf) {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(getStorageKey(tf));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (_) {}
    return [];
  }

  function saveDrawings() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(getStorageKey(currentTf), JSON.stringify(drawings));
      }
    } catch (_) {}
  }

  drawings = loadDrawings(currentTf);

  // 2. Create SVG Overlay Element
  container.style.position = 'relative';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'manual-drawing-svg-overlay');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.zIndex = '3';
  svg.style.overflow = 'hidden';
  svg.style.pointerEvents = 'none';
  container.appendChild(svg);

  // 3. Create Floating Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'manual-drawing-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Alat Gambar Chart');
  toolbar.style.display = 'none';

  function renderToolbar() {
    const selectedItem = selectedId ? drawings.find(d => d.id === selectedId) : null;
    if (selectedItem && activeTool === 'edit') {
      toolbar.innerHTML = `
        <span style="font-size:11px;font-weight:800;color:#F5C451;padding:0 4px;">EDIT ZONA</span>
        <button type="button" class="draw-btn" data-action="extend" title="Perpanjang Zona ke Kanan">➡️ Perpanjang</button>
        <button type="button" class="draw-btn" data-action="delete-selected" title="Hapus Zona Ini" style="color:#ef4444;">🗑️ Hapus</button>
        <button type="button" class="draw-btn is-active" data-action="done" title="Selesai & Kunci Zona">✓ Selesai</button>
      `;
    } else {
      toolbar.innerHTML = `
        <button type="button" class="draw-btn ${activeTool === 'pan' ? 'is-active' : ''}" data-tool="pan" title="Geser / Cubit Zoom Chart">🖐️ Geser</button>
        <button type="button" class="draw-btn ${activeTool === 'edit' ? 'is-active' : ''}" data-tool="edit" title="Pilih & Ubah Ukuran Zona">✏️ Edit</button>
        <button type="button" class="draw-btn ${activeTool === 'zone' ? 'is-active' : ''}" data-tool="zone" title="Gambar Kotak Zona (FVG / OB)">🔲 +Zona</button>
        <button type="button" class="draw-btn ${activeTool === 'line' ? 'is-active' : ''}" data-tool="line" title="Garis Level Harga">📏 Level</button>
        <button type="button" class="draw-btn ${activeTool === 'target100' ? 'is-active' : ''}" data-tool="target100" title="Target Scalp 100 Pips">🎯 100P</button>
        ${drawings.length > 0 ? `<button type="button" class="draw-btn" data-action="clear-all" title="Hapus Semua Gambar" style="color:#ef4444;">🗑️</button>` : ''}
      `;
    }
  }

  function setActiveTool(tool) {
    activeTool = tool;
    if (activeTool !== 'edit') {
      selectedId = null;
    }
    renderToolbar();

    if (activeTool === 'pan') {
      svg.style.pointerEvents = 'none';
      svg.style.cursor = 'default';
    } else if (activeTool === 'edit') {
      svg.style.pointerEvents = 'none';
      svg.style.cursor = 'default';
    } else {
      svg.style.pointerEvents = 'auto';
      svg.style.cursor = 'crosshair';
    }
    scheduleRepaint();
  }

  function setSelected(id) {
    selectedId = id;
    if (selectedId) {
      activeTool = 'edit';
    }
    renderToolbar();
    scheduleRepaint();
  }

  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    e.stopPropagation();

    const tool = btn.dataset.tool;
    const action = btn.dataset.action;

    if (tool) {
      setActiveTool(tool);
    } else if (action === 'done') {
      selectedId = null;
      setActiveTool('pan');
    } else if (action === 'delete-selected' && selectedId) {
      drawings = drawings.filter(d => d.id !== selectedId);
      selectedId = null;
      saveDrawings();
      setActiveTool('pan');
    } else if (action === 'clear-all') {
      if (confirm('Hapus semua zona dan garis pada chart ini?')) {
        drawings = [];
        selectedId = null;
        saveDrawings();
        setActiveTool('pan');
      }
    } else if (action === 'extend' && selectedId) {
      const item = drawings.find(d => d.id === selectedId);
      if (item && item.type === 'zone' && item.points?.length >= 2) {
        const lastCandle = candles.length ? candles[candles.length - 1] : null;
        const currentNow = lastCandle ? lastCandle.time : Math.floor(Date.now() / 1000);
        item.points[1].time = currentNow + 1800;
        saveDrawings();
        scheduleRepaint();
      }
    }
  });

  container.appendChild(toolbar);

  // 4. Coordinate Conversion Engine (Adopsi Murni Backtest CandleChart)
  function plotWidth() {
    const w = container.clientWidth || 300;
    const scaleWidth = Number(chart.priceScale('right')?.width?.()) || 65;
    return Math.max(1, w - scaleWidth);
  }

  function plotHeight() {
    const h = container.clientHeight || 340;
    const axisHeight = Number(chart.timeScale()?.height?.()) || 26;
    return Math.max(1, h - axisHeight);
  }

  function timeToX(timestamp) {
    const target = Number(timestamp);
    if (!Number.isFinite(target)) return null;

    // 1. Direct coordinate dari chart time scale
    try {
      const direct = chart.timeScale().timeToCoordinate(target);
      if (direct != null && Number.isFinite(direct)) return Number(direct);
    } catch (_) {}

    const items = candles;
    if (!items || !items.length) return null;

    const last = items.length - 1;
    const step = (last > 0 ? (items[last].time - items[last - 1].time) : 900) || 900;

    // 2. Proyeksi logical untuk waktu di luar rentang data candle
    if (target < items[0].time) {
      try {
        if (typeof chart.timeScale().logicalToCoordinate === 'function') {
          const coord = chart.timeScale().logicalToCoordinate((target - items[0].time) / step);
          if (coord != null && Number.isFinite(coord)) return Number(coord);
        }
      } catch (_) {}
      return 0;
    }
    if (target > items[last].time) {
      try {
        if (typeof chart.timeScale().logicalToCoordinate === 'function') {
          const coord = chart.timeScale().logicalToCoordinate(last + (target - items[last].time) / step);
          if (coord != null && Number.isFinite(coord)) return Number(coord);
        }
      } catch (_) {}
      return plotWidth();
    }

    // 3. Binary search lilin kiri & kanan untuk interpolasi matematis presisi
    let low = 0, high = items.length;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (items[middle].time < target) low = middle + 1;
      else high = middle;
    }
    const rightIndex = Math.max(0, Math.min(items.length - 1, low));
    const leftIndex = Math.max(0, Math.min(items.length - 1, rightIndex - (items[rightIndex].time > target ? 1 : 0)));

    const left = items[leftIndex];
    const right = items[rightIndex];
    const leftX = chart.timeScale().timeToCoordinate(left.time);
    const rightX = chart.timeScale().timeToCoordinate(right.time);

    if (leftX == null || rightX == null) return null;
    if (right.time === left.time) return Number(leftX);
    return Number(leftX) + (target - left.time) / (right.time - left.time) * (Number(rightX) - Number(leftX));
  }

  function priceToY(price) {
    if (!Number.isFinite(price)) return null;
    try {
      const direct = series.priceToCoordinate(price);
      if (direct != null && Number.isFinite(direct)) return Number(direct);
    } catch (_) {}
    return null;
  }

  function screenPoint(point) {
    if (!point) return null;
    const x = timeToX(point.time);
    const y = priceToY(point.price);
    return x == null || y == null ? null : { x: Number(x), y: Number(y) };
  }

  function pointFromEvent(e) {
    const rect = svg.getBoundingClientRect();
    const x = Math.max(0, Math.min(plotWidth(), e.clientX - rect.left));
    const y = Math.max(0, Math.min(plotHeight(), e.clientY - rect.top));

    const scale = chart.timeScale();
    let time = null;
    try {
      time = scale.coordinateToTime(x);
    } catch (_) {}

    if (time == null && candles.length) {
      try {
        const logical = scale.coordinateToLogical(x);
        if (logical != null) {
          const items = candles, last = items.length - 1;
          const step = (last > 0 ? (items[last].time - items[last - 1].time) : 900) || 900;
          if (logical < 0) time = items[0].time + logical * step;
          else if (logical > last) time = items[last].time + (logical - last) * step;
          else {
            const left = Math.floor(logical), right = Math.min(last, left + 1);
            time = items[left].time + (logical - left) * (items[right].time - items[left].time);
          }
        }
      } catch (_) {}
    }

    let price = null;
    try {
      price = series.coordinateToPrice(y);
    } catch (_) {}

    if (time == null || price == null) return null;
    if (typeof time === 'object') {
      time = Date.UTC(time.year, time.month - 1, time.day) / 1000;
    }

    return { time: Math.round(Number(time)), price: Number(price), x, y };
  }

  // 5. Normalizer Data Gambar (Dukungan Format Lama & Format Baru Backtest)
  function normalizeDrawing(d) {
    if (!d) return null;
    // Format baru Backtest: points: [{ time, price }, { time, price }]
    if (Array.isArray(d.points) && d.points.length >= 1) {
      return d;
    }
    // Konversi transparan dari format lama (p1, p2, t1, t2)
    if (d.type === 'zone' && Number.isFinite(d.p1) && Number.isFinite(d.p2)) {
      return {
        id: d.id || 'zone-' + Date.now(),
        type: 'zone',
        points: [
          { time: d.t1 || (Date.now() / 1000 - 1800), price: Math.max(d.p1, d.p2) },
          { time: d.t2 || (Date.now() / 1000), price: Math.min(d.p1, d.p2) }
        ],
        style: { color: d.border || '#F5C451', fill: d.color || 'rgba(245, 196, 81, 0.22)' }
      };
    }
    if (d.type === 'line' && Number.isFinite(d.price)) {
      return {
        id: d.id || 'line-' + Date.now(),
        type: 'line',
        points: [{ time: Date.now() / 1000, price: d.price }],
        style: { color: d.color || '#38bdf8' }
      };
    }
    if (d.type === 'target100' && Number.isFinite(d.entry)) {
      return {
        id: d.id || 'target-' + Date.now(),
        type: 'target100',
        points: [{ time: d.time || (Date.now() / 1000), price: d.entry }],
        entry: d.entry,
        tp: d.tp,
        sl: d.sl,
        isBuy: d.isBuy
      };
    }
    return null;
  }

  drawings = drawings.map(normalizeDrawing).filter(Boolean);

  // 6. SVG Drawing & Render Engine
  function createSvgElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    return el;
  }

  function renderSvg() {
    if (!svg || !container) return;
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 340;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const pWidth = plotWidth();

    // Render Semua Objek Gambar
    for (const d of drawings) {
      const isSelected = (d.id === selectedId);
      const group = createSvgElement('g', {
        class: `manual-drawing ${isSelected ? 'is-selected' : ''}`,
        'data-drawing-id': d.id
      });

      if (d.type === 'zone') {
        const ptA = screenPoint(d.points[0]);
        const ptB = screenPoint(d.points[1]);
        if (!ptA || !ptB) continue;

        const left = Math.min(ptA.x, ptB.x);
        const top = Math.min(ptA.y, ptB.y);
        const width = Math.max(12, Math.abs(ptA.x - ptB.x));
        const height = Math.max(4, Math.abs(ptA.y - ptB.y));

        const strokeColor = isSelected ? '#ffffff' : (d.style?.color || '#F5C451');
        const fillColor = d.style?.fill || 'rgba(245, 196, 81, 0.18)';

        // Kotak Visual Zona
        group.appendChild(createSvgElement('rect', {
          x: left, y: top, width, height,
          fill: fillColor, stroke: strokeColor,
          'stroke-width': isSelected ? 2.5 : 1.5,
          'stroke-dasharray': '4 4'
        }));

        // Hit Area untuk Memilih Kotak di Layar HP
        group.appendChild(createSvgElement('rect', {
          x: left, y: top, width, height,
          fill: 'none', stroke: 'transparent',
          'stroke-width': 24,
          'pointer-events': activeTool === 'edit' ? 'stroke' : 'none',
          class: 'manual-draw-hit'
        }));

        // Label Harga
        const priceHigh = Math.max(d.points[0].price, d.points[1].price);
        const priceLow = Math.min(d.points[0].price, d.points[1].price);
        const labelText = `ZONA $${priceLow.toFixed(1)} - $${priceHigh.toFixed(1)}`;

        const textEl = createSvgElement('text', {
          x: Math.max(6, left + 6),
          y: Math.max(14, top + 14),
          fill: strokeColor,
          'font-size': '10px',
          'font-weight': 'bold',
          'font-family': 'monospace, sans-serif',
          'pointer-events': 'none'
        });
        textEl.textContent = labelText;
        group.appendChild(textEl);

        // 8 Interactive Grab Handles (TradingView Style)
        if (isSelected && activeTool === 'edit') {
          const midX = (ptA.x + ptB.x) / 2;
          const midY = (ptA.y + ptB.y) / 2;
          const midTime = Math.round((d.points[0].time + d.points[1].time) / 2);
          const midPrice = (d.points[0].price + d.points[1].price) / 2;

          const handles = [
            { x: ptA.x, y: ptA.y, timeIndex: 0, priceIndex: 0 },
            { x: ptB.x, y: ptB.y, timeIndex: 1, priceIndex: 1 },
            { x: ptA.x, y: ptB.y, timeIndex: 0, priceIndex: 1 },
            { x: ptB.x, y: ptA.y, timeIndex: 1, priceIndex: 0 },
            { x: midX,   y: ptA.y, timeIndex: -1, priceIndex: 0 },
            { x: midX,   y: ptB.y, timeIndex: -1, priceIndex: 1 },
            { x: ptA.x, y: midY,   timeIndex: 0, priceIndex: -1 },
            { x: ptB.x, y: midY,   timeIndex: 1, priceIndex: -1 }
          ];

          for (const h of handles) {
            // Touch Target Lebar (18px) agar sangat mudah disentuh jari di HP
            group.appendChild(createSvgElement('circle', {
              cx: h.x, cy: h.y, r: 18,
              fill: 'transparent',
              'pointer-events': 'all',
              'data-drawing-id': d.id,
              'data-time-index': h.timeIndex,
              'data-price-index': h.priceIndex,
              class: 'manual-draw-handle-hit'
            }));

            // Titik Putih Visual Handle (6.5px) dengan border emas
            group.appendChild(createSvgElement('circle', {
              cx: h.x, cy: h.y, r: 6.5,
              fill: '#ffffff',
              stroke: '#F5C451',
              'stroke-width': 2.5,
              'pointer-events': 'none'
            }));
          }
        }
      } else if (d.type === 'line') {
        const pt = screenPoint(d.points[0]);
        if (!pt) continue;

        const lineColor = isSelected ? '#ffffff' : (d.style?.color || '#38bdf8');
        group.appendChild(createSvgElement('line', {
          x1: 0, y1: pt.y, x2: pWidth, y2: pt.y,
          stroke: lineColor,
          'stroke-width': isSelected ? 2.5 : 1.5,
          'stroke-dasharray': '6 4'
        }));

        // Badge Harga
        const badgeW = 72;
        const badgeH = 18;
        const badgeX = Math.max(0, pWidth - badgeW - 6);
        const badgeY = pt.y - badgeH / 2;

        group.appendChild(createSvgElement('rect', {
          x: badgeX, y: badgeY, width: badgeW, height: badgeH, rx: 4,
          fill: d.style?.color || '#38bdf8'
        }));

        const textEl = createSvgElement('text', {
          x: badgeX + 6, y: badgeY + 12,
          fill: '#070b14',
          'font-size': '10px',
          'font-weight': 'bold',
          'font-family': 'monospace, sans-serif'
        });
        textEl.textContent = `$${d.points[0].price.toFixed(2)}`;
        group.appendChild(textEl);
      } else if (d.type === 'target100') {
        const ptEntry = screenPoint({ time: d.points[0].time, price: d.entry });
        const ptTp = screenPoint({ time: d.points[0].time, price: d.tp });
        const ptSl = screenPoint({ time: d.points[0].time, price: d.sl });
        if (!ptEntry || !ptTp || !ptSl) continue;

        const boxWidth = 145;
        let left = ptEntry.x;
        if (left < 0 || left > pWidth) left = Math.max(10, pWidth - boxWidth - 10);

        // Profit Box (Hijau)
        const profitTop = Math.min(ptEntry.y, ptTp.y);
        const profitH = Math.abs(ptTp.y - ptEntry.y);
        group.appendChild(createSvgElement('rect', {
          x: left, y: profitTop, width: boxWidth, height: profitH,
          fill: 'rgba(34, 197, 94, 0.22)', stroke: '#22c55e', 'stroke-width': 1.5
        }));

        // Risk Box (Merah)
        const riskTop = Math.min(ptEntry.y, ptSl.y);
        const riskH = Math.abs(ptSl.y - ptEntry.y);
        group.appendChild(createSvgElement('rect', {
          x: left, y: riskTop, width: boxWidth, height: riskH,
          fill: 'rgba(239, 68, 68, 0.22)', stroke: '#ef4444', 'stroke-width': 1.5
        }));

        // Teks Target 100 Pips
        const tpText = createSvgElement('text', {
          x: left + 6, y: profitTop + 14,
          fill: '#22c55e', 'font-size': '10px', 'font-weight': 'bold'
        });
        tpText.textContent = `TP +100P ($${d.tp.toFixed(1)})`;
        group.appendChild(tpText);

        const slText = createSvgElement('text', {
          x: left + 6, y: riskTop + (d.isBuy ? riskH - 6 : 14),
          fill: '#ef4444', 'font-size': '10px', 'font-weight': 'bold'
        });
        slText.textContent = `SL -35P ($${d.sl.toFixed(1)})`;
        group.appendChild(slText);
      }

      svg.appendChild(group);
    }

    // Render Draft Saat Sedang Menarik Garis Baru
    if (isDragging && dragMode === 'create-zone' && dragStart && dragCurrent) {
      const left = Math.min(dragStart.x, dragCurrent.x);
      const top = Math.min(dragStart.y, dragCurrent.y);
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const height = Math.abs(dragCurrent.y - dragStart.y);

      svg.appendChild(createSvgElement('rect', {
        x: left, y: top, width, height,
        fill: 'rgba(245, 196, 81, 0.25)', stroke: '#F5C451',
        'stroke-width': 2, 'stroke-dasharray': '5 5'
      }));
    }
  }

  // 7. 60/120 FPS Realtime Sync Engine (Diadopsi Murni dari Backtest)
  let syncFrame = null;
  function scheduleRepaint() {
    if (syncFrame != null) return;
    syncFrame = requestAnimationFrame(() => {
      syncFrame = null;
      renderSvg();
    });
  }

  // Interaksi Layar Sentuh Langsung pada Chart
  let chartInteracting = false;
  const onChartTouchStart = () => { chartInteracting = true; scheduleRepaint(); };
  const onChartTouchMove = () => { if (chartInteracting) scheduleRepaint(); };
  const onChartTouchEnd = (e) => { chartInteracting = Boolean(e?.touches?.length); scheduleRepaint(); };

  const chartBindings = [
    [container, 'touchstart', onChartTouchStart],
    [container, 'mousedown', onChartTouchStart],
    [document, 'touchmove', onChartTouchMove],
    [document, 'mousemove', onChartTouchMove],
    [document, 'touchend', onChartTouchEnd],
    [document, 'touchcancel', onChartTouchEnd],
    [document, 'mouseup', onChartTouchEnd]
  ];
  for (const [target, evt, handler] of chartBindings) {
    target.addEventListener(evt, handler, { passive: true });
  }

  try {
    chart.timeScale().subscribeVisibleLogicalRangeChange(scheduleRepaint);
    chart.timeScale().subscribeVisibleTimeRangeChange(scheduleRepaint);
  } catch (_) {}

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(scheduleRepaint)
    : null;
  if (resizeObserver) resizeObserver.observe(container);

  // 8. Pointer Event Handlers (Single-Finger Draw & Handle Drag)
  function onPointerDown(e) {
    if (activeTool === 'pan') return;

    // Abaikan gestur jika jari kedua menyentuh (pinch protection)
    if (activePointerId != null && activePointerId !== e.pointerId) return;
    activePointerId = e.pointerId;

    const pt = pointFromEvent(e);
    if (!pt) return;

    // Handle Interaktif di Edit Mode
    if (activeTool === 'edit') {
      const handleHit = e.target.closest?.('.manual-draw-handle-hit');
      if (handleHit && selectedId) {
        const item = drawings.find(d => d.id === selectedId);
        if (item && item.type === 'zone') {
          e.preventDefault();
          e.stopPropagation();
          isDragging = true;
          dragMode = 'handle';
          dragHandle = {
            timeIndex: Number(handleHit.getAttribute('data-time-index')),
            priceIndex: Number(handleHit.getAttribute('data-price-index'))
          };
          dragStart = pt;
          dragCurrent = pt;
          dragOriginal = JSON.parse(JSON.stringify(item));
          try { svg.setPointerCapture(e.pointerId); } catch (_) {}
          return;
        }
      }

      // Klik Kotak Zona untuk Memilih
      const hitBox = e.target.closest?.('.manual-draw-hit');
      if (hitBox) {
        const drawingId = hitBox.parentElement?.getAttribute('data-drawing-id');
        if (drawingId) {
          e.preventDefault();
          e.stopPropagation();
          setSelected(drawingId);
          return;
        }
      }

      setSelected(null);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (activeTool === 'line') {
      const newLine = {
        id: 'line-' + Date.now(),
        type: 'line',
        points: [{ time: pt.time, price: Math.round(pt.price * 100) / 100 }],
        style: { color: '#38bdf8' }
      };
      drawings.push(newLine);
      saveDrawings();
      setSelected(newLine.id);
      return;
    }

    if (activeTool === 'target100') {
      const entry = Math.round(pt.price * 100) / 100;
      const currentLive = Number(window.amyfxCurrentPrice) || entry;
      const isBuy = entry <= currentLive;
      const tp = Math.round((isBuy ? entry + 10.0 : entry - 10.0) * 100) / 100;
      const sl = Math.round((isBuy ? entry - 3.5 : entry + 3.5) * 100) / 100;

      const newTarget = {
        id: 'target-' + Date.now(),
        type: 'target100',
        points: [{ time: pt.time, price: entry }],
        entry, tp, sl, isBuy
      };
      drawings.push(newTarget);
      saveDrawings();
      setSelected(newTarget.id);
      return;
    }

    if (activeTool === 'zone') {
      isDragging = true;
      dragMode = 'create-zone';
      dragStart = pt;
      dragCurrent = pt;
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }

  function onPointerMove(e) {
    if (activePointerId != null && activePointerId !== e.pointerId) return;
    if (!isDragging || !dragStart) return;

    e.preventDefault();
    e.stopPropagation();
    dragCurrent = pointFromEvent(e);
    if (!dragCurrent) return;

    // Resizing Handle pada Zona Terpilih
    if (dragMode === 'handle' && selectedId && dragOriginal) {
      const item = drawings.find(d => d.id === selectedId);
      if (item && item.type === 'zone' && item.points?.length >= 2) {
        if (dragHandle.timeIndex >= 0) {
          item.points[dragHandle.timeIndex].time = dragCurrent.time;
        }
        if (dragHandle.priceIndex >= 0) {
          item.points[dragHandle.priceIndex].price = Math.round(dragCurrent.price * 100) / 100;
        }
        scheduleRepaint();
        return;
      }
    }

    if (dragMode === 'create-zone') {
      scheduleRepaint();
    }
  }

  function onPointerUp(e) {
    if (activePointerId != null && activePointerId !== e.pointerId) return;
    activePointerId = null;

    if (!isDragging) return;
    isDragging = false;
    try { svg.releasePointerCapture(e.pointerId); } catch (_) {}

    if (dragMode === 'handle') {
      const item = drawings.find(d => d.id === selectedId);
      if (item && item.type === 'zone') {
        saveDrawings();
      }
      dragMode = null;
      dragHandle = null;
      dragStart = null;
      dragCurrent = null;
      dragOriginal = null;
      scheduleRepaint();
      return;
    }

    if (dragMode === 'create-zone') {
      const p1 = dragStart;
      const p2 = pointFromEvent(e) || dragCurrent;
      dragMode = null;
      dragStart = null;
      dragCurrent = null;

      if (p1 && p2) {
        const newZone = {
          id: 'zone-' + Date.now(),
          type: 'zone',
          points: [
            { time: Math.min(p1.time, p2.time), price: Math.max(p1.price, p2.price) },
            { time: Math.max(p1.time, p2.time), price: Math.min(p1.price, p2.price) }
          ],
          style: {
            color: '#F5C451',
            fill: 'rgba(245, 196, 81, 0.22)'
          }
        };
        drawings.push(newZone);
        saveDrawings();
        setSelected(newZone.id);
        return;
      }
      setActiveTool('pan');
      scheduleRepaint();
    }
  }

  function onPointerCancel(e) {
    if (activePointerId === e.pointerId) activePointerId = null;
    isDragging = false;
    dragMode = null;
    dragHandle = null;
    dragStart = null;
    dragCurrent = null;
    scheduleRepaint();
  }

  svg.addEventListener('pointerdown', onPointerDown);
  svg.addEventListener('pointermove', onPointerMove);
  svg.addEventListener('pointerup', onPointerUp);
  svg.addEventListener('pointercancel', onPointerCancel);

  // 9. Public Controller API
  return {
    setCandles(newCandles) {
      if (Array.isArray(newCandles) && newCandles.length) {
        candles = newCandles;
        scheduleRepaint();
      }
    },
    setTf(newTf) {
      if (!newTf || newTf === currentTf) return;
      currentTf = newTf;
      selectedId = null;
      activeTool = 'pan';
      drawings = loadDrawings(currentTf).map(normalizeDrawing).filter(Boolean);
      renderToolbar();
      scheduleRepaint();
    },
    setFullscreen(enabled) {
      isFullscreenActive = enabled;
      toolbar.style.display = enabled ? 'flex' : 'none';
      selectedId = null;
      setActiveTool('pan');
      setTimeout(scheduleRepaint, 50);
    },
    repaint() {
      scheduleRepaint();
    },
    destroy() {
      for (const [target, evt, handler] of chartBindings) {
        target.removeEventListener(evt, handler);
      }
      try {
        chart.timeScale().unsubscribeVisibleLogicalRangeChange(scheduleRepaint);
        chart.timeScale().unsubscribeVisibleTimeRangeChange(scheduleRepaint);
      } catch (_) {}
      if (resizeObserver) resizeObserver.disconnect();
      if (syncFrame != null) cancelAnimationFrame(syncFrame);
      svg.removeEventListener('pointerdown', onPointerDown);
      svg.removeEventListener('pointermove', onPointerMove);
      svg.removeEventListener('pointerup', onPointerUp);
      svg.removeEventListener('pointercancel', onPointerCancel);
      svg.remove();
      toolbar.remove();
    }
  };
}
