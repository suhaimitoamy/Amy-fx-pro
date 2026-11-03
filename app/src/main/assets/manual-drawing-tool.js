/**
 * Amy FX Pro — Manual Chart Drawing Engine
 * Memberikan kemampuan menggambar Zona (Rectangle), Level Harga (Horizontal Ray),
 * dan Target 100 Pips (Risk-Reward Box) langsung di atas TradingView Lightweight Charts.
 */

export function createManualDrawingTool({ container, chart, series, getTf }) {
  if (!container || !chart || !series) return null;

  let currentTf = (typeof getTf === 'function' ? getTf() : 'M15') || 'M15';
  let drawings = [];
  let activeTool = 'pan'; // 'pan' | 'zone' | 'line' | 'target100'
  let isDragging = false;
  let dragStart = null;
  let dragCurrent = null;
  let isFullscreenActive = false;

  // 1. Storage helpers
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

  // 2. Create overlay canvas
  container.style.position = 'relative';
  const canvas = document.createElement('canvas');
  canvas.className = 'manual-drawings-canvas';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '3';
  canvas.style.pointerEvents = 'none';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // 3. Create Floating Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'manual-drawing-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Alat Gambar Chart');
  toolbar.style.display = 'none'; // Visible when fullscreen or toggled

  toolbar.innerHTML = `
    <button type="button" class="draw-btn is-active" data-tool="pan" title="Geser / Zoom Chart">🖐️ Geser</button>
    <button type="button" class="draw-btn" data-tool="zone" title="Gambar Kotak Zona (FVG / OB)">🔲 Zona</button>
    <button type="button" class="draw-btn" data-tool="line" title="Garis Level Harga">📏 Level</button>
    <button type="button" class="draw-btn" data-tool="target100" title="Target Scalp 100 Pips">🎯 100P</button>
    <button type="button" class="draw-btn draw-btn-action" data-action="undo" title="Batalkan Gambar Terakhir">↩️</button>
    <button type="button" class="draw-btn draw-btn-action" data-action="clear" title="Hapus Semua Gambar">🗑️</button>
  `;
  container.appendChild(toolbar);

  function setActiveTool(tool) {
    activeTool = tool;
    toolbar.querySelectorAll('.draw-btn[data-tool]').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-tool') === tool);
    });

    if (activeTool === 'pan') {
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
    } else {
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = 'crosshair';
    }
  }

  toolbar.addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.target.closest('.draw-btn');
    if (!btn) return;

    const tool = btn.getAttribute('data-tool');
    const action = btn.getAttribute('data-action');

    if (tool) {
      setActiveTool(tool);
    } else if (action === 'undo') {
      if (drawings.length > 0) {
        drawings.pop();
        saveDrawings();
        paint();
      }
    } else if (action === 'clear') {
      if (drawings.length > 0) {
        drawings = [];
        saveDrawings();
        paint();
      }
    }
  });

  // 4. Coordinate Conversions
  function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let time = null;
    let price = null;

    try {
      if (typeof chart.timeScale().coordinateToTime === 'function') {
        time = chart.timeScale().coordinateToTime(x);
      }
    } catch (_) {}

    try {
      if (typeof series.coordinateToPrice === 'function') {
        price = series.coordinateToPrice(y);
      }
    } catch (_) {}

    return { x, y, time, price };
  }

  // 5. Pointer Event Handlers for Drawing
  function onPointerDown(e) {
    if (activeTool === 'pan') return;
    e.preventDefault();
    e.stopPropagation();

    const p = getCoords(e);
    if (!Number.isFinite(p.price)) return;

    if (activeTool === 'line') {
      const roundedPrice = Math.round(p.price * 100) / 100;
      drawings.push({
        id: 'line-' + Date.now(),
        type: 'line',
        price: roundedPrice,
        color: '#38bdf8'
      });
      saveDrawings();
      paint();
      setActiveTool('pan');
      return;
    }

    if (activeTool === 'target100') {
      const entry = Math.round(p.price * 100) / 100;
      const currentLive = Number(window.amyfxCurrentPrice) || entry;
      const isBuy = entry <= currentLive;
      const tp = Math.round((isBuy ? entry + 10.0 : entry - 10.0) * 100) / 100;
      const sl = Math.round((isBuy ? entry - 3.5 : entry + 3.5) * 100) / 100;

      drawings.push({
        id: 'target-' + Date.now(),
        type: 'target100',
        entry,
        tp,
        sl,
        isBuy,
        time: p.time || Math.floor(Date.now() / 1000)
      });
      saveDrawings();
      paint();
      setActiveTool('pan');
      return;
    }

    if (activeTool === 'zone') {
      isDragging = true;
      dragStart = p;
      dragCurrent = p;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }

  function onPointerMove(e) {
    if (!isDragging || !dragStart || activeTool !== 'zone') return;
    e.preventDefault();
    e.stopPropagation();
    dragCurrent = getCoords(e);
    paint();
  }

  function onPointerUp(e) {
    if (!isDragging || activeTool !== 'zone') return;
    isDragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}

    const p1 = dragStart;
    const p2 = getCoords(e);
    dragStart = null;
    dragCurrent = null;

    if (p1 && p2 && Number.isFinite(p1.price) && Number.isFinite(p2.price)) {
      const priceDiff = Math.abs(p1.price - p2.price);
      if (priceDiff >= 0.2) {
        const t1 = p1.time || p2.time || Math.floor(Date.now() / 1000) - 1800;
        const t2 = p2.time || p1.time || Math.floor(Date.now() / 1000);

        drawings.push({
          id: 'zone-' + Date.now(),
          type: 'zone',
          t1: Math.min(t1, t2),
          p1: Math.max(p1.price, p2.price),
          t2: Math.max(t1, t2),
          p2: Math.min(p1.price, p2.price),
          color: 'rgba(245, 196, 81, 0.22)',
          border: '#F5C451'
        });
        saveDrawings();
      }
    }

    paint();
    setActiveTool('pan');
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  // 6. Paint Engine
  function paint() {
    if (!ctx || !container) return;
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 340;
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Render Saved Drawings
    for (const d of drawings) {
      if (d.type === 'zone') {
        const y1 = series.priceToCoordinate(d.p1);
        const y2 = series.priceToCoordinate(d.p2);
        let x1 = d.t1 ? chart.timeScale().timeToCoordinate(d.t1) : null;
        let x2 = d.t2 ? chart.timeScale().timeToCoordinate(d.t2) : null;

        if (y1 != null && y2 != null) {
          if (x1 == null && x2 != null) x1 = 0;
          if (x2 == null && x1 != null) x2 = w;
          if (x1 == null && x2 == null) { x1 = 0; x2 = w; }

          const left = Math.min(x1, x2);
          const top = Math.min(y1, y2);
          const width = Math.max(24, Math.abs(x2 - x1));
          const height = Math.max(4, Math.abs(y2 - y1));

          ctx.fillStyle = d.color || 'rgba(245, 196, 81, 0.22)';
          ctx.fillRect(left, top, width, height);

          ctx.strokeStyle = d.border || '#F5C451';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(left, top, width, height);
          ctx.setLineDash([]);

          ctx.font = 'bold 10px monospace, sans-serif';
          ctx.fillStyle = d.border || '#F5C451';
          ctx.fillText(`ZONA $${d.p2.toFixed(1)} - $${d.p1.toFixed(1)}`, left + 6, top + 13);
        }
      } else if (d.type === 'line') {
        const y = series.priceToCoordinate(d.price);
        if (y != null) {
          ctx.strokeStyle = d.color || '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = d.color || '#38bdf8';
          const badgeW = 74;
          const badgeH = 18;
          const badgeX = Math.max(0, w - badgeW - 6);
          const badgeY = y - badgeH / 2;

          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
            ctx.fill();
          } else {
            ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
          }

          ctx.font = 'bold 10px monospace, sans-serif';
          ctx.fillStyle = '#070b14';
          ctx.fillText(`$${d.price.toFixed(2)}`, badgeX + 6, badgeY + 12);
        }
      } else if (d.type === 'target100') {
        const yEntry = series.priceToCoordinate(d.entry);
        const yTp = series.priceToCoordinate(d.tp);
        const ySl = series.priceToCoordinate(d.sl);
        let x = d.time ? chart.timeScale().timeToCoordinate(d.time) : null;
        if (x == null || x < 0 || x > w) x = Math.max(20, w - 170);

        if (yEntry != null && yTp != null && ySl != null) {
          const boxWidth = 145;
          const left = Math.max(8, Math.min(w - boxWidth - 8, x));

          // Profit Box
          const profitTop = Math.min(yEntry, yTp);
          const profitHeight = Math.abs(yTp - yEntry);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
          ctx.fillRect(left, profitTop, boxWidth, profitHeight);
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(left, profitTop, boxWidth, profitHeight);

          // Risk Box
          const riskTop = Math.min(yEntry, ySl);
          const riskHeight = Math.abs(ySl - yEntry);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.fillRect(left, riskTop, boxWidth, riskHeight);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(left, riskTop, boxWidth, riskHeight);

          // Text labels
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#22c55e';
          ctx.fillText(`TP +100P ($${d.tp.toFixed(1)})`, left + 6, profitTop + (d.isBuy ? 14 : profitHeight - 6));

          ctx.fillStyle = '#ef4444';
          ctx.fillText(`SL -35P ($${d.sl.toFixed(1)})`, left + 6, riskTop + (d.isBuy ? riskHeight - 6 : 14));

          ctx.fillStyle = '#f8fafc';
          ctx.fillText(`Entry $${d.entry.toFixed(1)} [${d.isBuy ? 'BUY' : 'SELL'}]`, left + 6, yEntry + (d.isBuy ? -4 : 12));
        }
      }
    }

    // Render Dragging Draft Zone
    if (isDragging && dragStart && dragCurrent) {
      const left = Math.min(dragStart.x, dragCurrent.x);
      const top = Math.min(dragStart.y, dragCurrent.y);
      const width = Math.abs(dragCurrent.x - dragStart.x);
      const height = Math.abs(dragCurrent.y - dragStart.y);

      ctx.fillStyle = 'rgba(245, 196, 81, 0.28)';
      ctx.fillRect(left, top, width, height);
      ctx.strokeStyle = '#F5C451';
      ctx.lineWidth = 2;
      ctx.strokeRect(left, top, width, height);

      const pHigh = Math.max(dragStart.price || 0, dragCurrent.price || 0);
      const pLow = Math.min(dragStart.price || 0, dragCurrent.price || 0);
      ctx.font = 'bold 10px monospace, sans-serif';
      ctx.fillStyle = '#F5C451';
      ctx.fillText(`DRAFT ZONA: $${pLow.toFixed(1)} - $${pHigh.toFixed(1)}`, left + 6, top + 14);
    }
  }

  // 7. Subscribe to Chart Updates
  let unsubTimeRange = null;
  try {
    if (typeof chart.timeScale().subscribeVisibleTimeRangeChange === 'function') {
      unsubTimeRange = () => paint();
      chart.timeScale().subscribeVisibleTimeRangeChange(unsubTimeRange);
    }
  } catch (_) {}

  // 8. Public Controller API
  return {
    setTf(newTf) {
      if (!newTf || newTf === currentTf) return;
      currentTf = newTf;
      drawings = loadDrawings(currentTf);
      paint();
    },
    setFullscreen(enabled) {
      isFullscreenActive = enabled;
      toolbar.style.display = enabled ? 'flex' : 'none';
      if (!enabled) {
        setActiveTool('pan');
      }
      setTimeout(paint, 50);
    },
    repaint() {
      paint();
    },
    destroy() {
      if (unsubTimeRange) {
        try { chart.timeScale().unsubscribeVisibleTimeRangeChange(unsubTimeRange); } catch (_) {}
      }
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.remove();
      toolbar.remove();
    }
  };
}
