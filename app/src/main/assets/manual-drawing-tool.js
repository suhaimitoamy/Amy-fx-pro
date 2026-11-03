/**
 * Amy FX Pro — Manual Chart Drawing Engine
 * Memberikan kemampuan menggambar Zona (Rectangle), Level Harga (Horizontal Ray),
 * dan Target 100 Pips (Risk-Reward Box), serta memilih, menggeser, dan mengubah
 * ukuran (resize) kotak zona dengan handle titik putih interaktif seperti TradingView.
 */

export function createManualDrawingTool({ container, chart, series, getTf }) {
  if (!container || !chart || !series) return null;

  let currentTf = (typeof getTf === 'function' ? getTf() : 'M15') || 'M15';
  let drawings = [];
  let activeTool = 'pan'; // 'pan' | 'edit' | 'zone' | 'line' | 'target100'
  let selectedId = null;

  // Dragging / Resizing state
  let isDragging = false;
  let dragMode = null; // 'create-zone' | 'handle' | 'move-zone' | 'move-line' | 'move-target'
  let dragHandle = null; // 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  let dragStart = null;
  let dragCurrent = null;
  let dragItemStart = null;
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
  toolbar.style.display = 'none'; // Visible when fullscreen

  function renderToolbar() {
    const selectedItem = selectedId ? drawings.find(d => d.id === selectedId) : null;
    if (selectedItem) {
      toolbar.innerHTML = `
        <span style="font-size:11px;font-weight:800;color:#F5C451;padding:0 4px;">EDIT ZONA</span>
        <button type="button" class="draw-btn" data-action="extend" title="Perpanjang Zona ke Kanan">➡️ Perpanjang</button>
        <button type="button" class="draw-btn" data-action="delete-selected" title="Hapus Zona Ini" style="color:#ef4444;">🗑️ Hapus</button>
        <button type="button" class="draw-btn is-active" data-action="done" title="Selesai Edit">✓ Selesai</button>
      `;
    } else {
      toolbar.innerHTML = `
        <button type="button" class="draw-btn ${activeTool === 'pan' ? 'is-active' : ''}" data-tool="pan" title="Geser / Zoom Chart">🖐️ Geser</button>
        <button type="button" class="draw-btn ${activeTool === 'edit' ? 'is-active' : ''}" data-tool="edit" title="Pilih & Ubah Ukuran Zona">✏️ Edit</button>
        <button type="button" class="draw-btn ${activeTool === 'zone' ? 'is-active' : ''}" data-tool="zone" title="Gambar Kotak Zona (FVG / OB)">🔲 +Zona</button>
        <button type="button" class="draw-btn ${activeTool === 'line' ? 'is-active' : ''}" data-tool="line" title="Garis Level Harga">📏 Level</button>
        <button type="button" class="draw-btn ${activeTool === 'target100' ? 'is-active' : ''}" data-tool="target100" title="Target Scalp 100 Pips">🎯 100P</button>
        <button type="button" class="draw-btn draw-btn-action" data-action="undo" title="Batalkan Gambar Terakhir">↩️</button>
        <button type="button" class="draw-btn draw-btn-action" data-action="clear" title="Hapus Semua Gambar">🗑️</button>
      `;
    }
  }

  renderToolbar();
  container.appendChild(toolbar);

  function setActiveTool(tool) {
    activeTool = tool;
    if (activeTool !== 'edit' && !selectedId) {
      selectedId = null;
    }
    renderToolbar();

    if (activeTool === 'pan' && !selectedId) {
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
    } else {
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = activeTool === 'edit' || selectedId ? 'pointer' : 'crosshair';
    }
  }

  function setSelected(id) {
    selectedId = id;
    renderToolbar();
    if (selectedId) {
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = 'default';
    } else if (activeTool === 'pan') {
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
    }
    paint();
  }

  toolbar.addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.target.closest('.draw-btn');
    if (!btn) return;

    const tool = btn.getAttribute('data-tool');
    const action = btn.getAttribute('data-action');

    if (tool) {
      setSelected(null);
      setActiveTool(tool);
    } else if (action === 'extend') {
      const item = drawings.find(d => d.id === selectedId);
      if (item && item.type === 'zone') {
        const nowSec = Math.floor(Date.now() / 1000);
        item.t2 = nowSec + 7200; // extend 2 hours into current/future bars
        saveDrawings();
        paint();
      }
    } else if (action === 'delete-selected') {
      if (selectedId) {
        drawings = drawings.filter(d => d.id !== selectedId);
        selectedId = null;
        saveDrawings();
        renderToolbar();
        setActiveTool('pan');
        paint();
      }
    } else if (action === 'done') {
      setSelected(null);
      setActiveTool('pan');
    } else if (action === 'undo') {
      if (drawings.length > 0) {
        drawings.pop();
        selectedId = null;
        saveDrawings();
        renderToolbar();
        paint();
      }
    } else if (action === 'clear') {
      if (drawings.length > 0) {
        drawings = [];
        selectedId = null;
        saveDrawings();
        renderToolbar();
        setActiveTool('pan');
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

  // 5. Hit Testing for Selection & Resizing
  function getZoneBounds(d) {
    const y1 = series.priceToCoordinate(d.p1);
    const y2 = series.priceToCoordinate(d.p2);
    let x1 = d.t1 ? chart.timeScale().timeToCoordinate(d.t1) : null;
    let x2 = d.t2 ? chart.timeScale().timeToCoordinate(d.t2) : null;
    const w = container.clientWidth || 300;

    if (y1 == null || y2 == null) return null;
    if (x1 == null && x2 != null) x1 = 0;
    if (x2 == null && x1 != null) x2 = w;
    if (x1 == null && x2 == null) { x1 = 0; x2 = w; }

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return { minX, maxX, minY, maxY, width: Math.max(20, maxX - minX), height: Math.max(6, maxY - minY) };
  }

  function getZoneHandles(d) {
    const b = getZoneBounds(d);
    if (!b) return [];
    const midX = (b.minX + b.maxX) / 2;
    const midY = (b.minY + b.maxY) / 2;

    return [
      { name: 'nw', x: b.minX, y: b.minY },
      { name: 'n',  x: midX,   y: b.minY },
      { name: 'ne', x: b.maxX, y: b.minY },
      { name: 'e',  x: b.maxX, y: midY   },
      { name: 'se', x: b.maxX, y: b.maxY },
      { name: 's',  x: midX,   y: b.maxY },
      { name: 'sw', x: b.minX, y: b.maxY },
      { name: 'w',  x: b.minX, y: midY   }
    ];
  }

  function findDrawingAt(x, y) {
    for (let i = drawings.length - 1; i >= 0; i--) {
      const d = drawings[i];
      if (d.type === 'zone') {
        const b = getZoneBounds(d);
        if (b && x >= b.minX - 10 && x <= b.maxX + 10 && y >= b.minY - 10 && y <= b.maxY + 10) {
          return d;
        }
      } else if (d.type === 'line') {
        const yLine = series.priceToCoordinate(d.price);
        if (yLine != null && Math.abs(y - yLine) <= 16) {
          return d;
        }
      } else if (d.type === 'target100') {
        const yEntry = series.priceToCoordinate(d.entry);
        const yTp = series.priceToCoordinate(d.tp);
        const ySl = series.priceToCoordinate(d.sl);
        let xTarget = d.time ? chart.timeScale().timeToCoordinate(d.time) : null;
        const w = container.clientWidth || 300;
        if (xTarget == null) xTarget = Math.max(10, w - 165);

        if (yEntry != null && yTp != null && ySl != null) {
          const top = Math.min(yTp, ySl);
          const bottom = Math.max(yTp, ySl);
          if (x >= xTarget - 10 && x <= xTarget + 160 && y >= top - 10 && y <= bottom + 10) {
            return d;
          }
        }
      }
    }
    return null;
  }

  // 6. Pointer Event Handlers
  function onPointerDown(e) {
    const p = getCoords(e);
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return;

    // Check if user is clicking on a selected zone's handle
    if (selectedId) {
      const selectedItem = drawings.find(d => d.id === selectedId);
      if (selectedItem && selectedItem.type === 'zone') {
        const handles = getZoneHandles(selectedItem);
        // generous 24px touch target radius for mobile fingers
        const hitHandle = handles.find(h => Math.hypot(h.x - p.x, h.y - p.y) <= 24);
        if (hitHandle) {
          e.preventDefault();
          e.stopPropagation();
          isDragging = true;
          dragMode = 'handle';
          dragHandle = hitHandle.name;
          dragStart = p;
          dragCurrent = p;
          dragItemStart = JSON.parse(JSON.stringify(selectedItem));
          try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
          return;
        }

        // Check if user is dragging inside the selected zone to move it
        const b = getZoneBounds(selectedItem);
        if (b && p.x >= b.minX && p.x <= b.maxX && p.y >= b.minY && p.y <= b.maxY) {
          e.preventDefault();
          e.stopPropagation();
          isDragging = true;
          dragMode = 'move-zone';
          dragStart = p;
          dragCurrent = p;
          dragItemStart = JSON.parse(JSON.stringify(selectedItem));
          try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
          return;
        }
      }
    }

    // If Edit tool is active or user clicked on an existing shape
    if (activeTool === 'edit' || selectedId) {
      const hit = findDrawingAt(p.x, p.y);
      if (hit) {
        e.preventDefault();
        e.stopPropagation();
        setSelected(hit.id);
        return;
      } else {
        // Tapped outside
        setSelected(null);
        if (activeTool === 'edit') {
          setActiveTool('pan');
        }
        return;
      }
    }

    if (activeTool === 'pan') return;

    e.preventDefault();
    e.stopPropagation();

    if (!Number.isFinite(p.price)) return;

    if (activeTool === 'line') {
      const roundedPrice = Math.round(p.price * 100) / 100;
      const newLine = {
        id: 'line-' + Date.now(),
        type: 'line',
        price: roundedPrice,
        color: '#38bdf8'
      };
      drawings.push(newLine);
      saveDrawings();
      setSelected(newLine.id);
      return;
    }

    if (activeTool === 'target100') {
      const entry = Math.round(p.price * 100) / 100;
      const currentLive = Number(window.amyfxCurrentPrice) || entry;
      const isBuy = entry <= currentLive;
      const tp = Math.round((isBuy ? entry + 10.0 : entry - 10.0) * 100) / 100;
      const sl = Math.round((isBuy ? entry - 3.5 : entry + 3.5) * 100) / 100;

      const newTarget = {
        id: 'target-' + Date.now(),
        type: 'target100',
        entry,
        tp,
        sl,
        isBuy,
        time: p.time || Math.floor(Date.now() / 1000)
      };
      drawings.push(newTarget);
      saveDrawings();
      setSelected(newTarget.id);
      return;
    }

    if (activeTool === 'zone') {
      isDragging = true;
      dragMode = 'create-zone';
      dragStart = p;
      dragCurrent = p;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }

  function onPointerMove(e) {
    if (!isDragging || !dragStart) return;
    e.preventDefault();
    e.stopPropagation();
    dragCurrent = getCoords(e);

    // Resizing handle on selected zone
    if (dragMode === 'handle' && selectedId && dragItemStart) {
      const item = drawings.find(d => d.id === selectedId);
      if (item && item.type === 'zone') {
        const deltaY = dragCurrent.y - dragStart.y;
        const currPrice = dragCurrent.price != null ? dragCurrent.price : (dragItemStart.p1 - deltaY * 0.1);
        const currTime = dragCurrent.time != null ? dragCurrent.time : dragItemStart.t2;

        if (dragHandle === 'n' || dragHandle === 'nw' || dragHandle === 'ne') {
          item.p1 = Math.round(currPrice * 100) / 100;
        }
        if (dragHandle === 's' || dragHandle === 'sw' || dragHandle === 'se') {
          item.p2 = Math.round(currPrice * 100) / 100;
        }
        if (dragHandle === 'e' || dragHandle === 'ne' || dragHandle === 'se') {
          if (currTime) item.t2 = currTime;
        }
        if (dragHandle === 'w' || dragHandle === 'nw' || dragHandle === 'sw') {
          if (currTime) item.t1 = currTime;
        }
        paint();
        return;
      }
    }

    // Moving entire zone
    if (dragMode === 'move-zone' && selectedId && dragItemStart) {
      const item = drawings.find(d => d.id === selectedId);
      if (item && item.type === 'zone') {
        if (dragCurrent.price != null && dragStart.price != null) {
          const deltaPrice = dragCurrent.price - dragStart.price;
          item.p1 = Math.round((dragItemStart.p1 + deltaPrice) * 100) / 100;
          item.p2 = Math.round((dragItemStart.p2 + deltaPrice) * 100) / 100;
        }
        if (dragCurrent.time != null && dragStart.time != null) {
          const deltaTime = dragCurrent.time - dragStart.time;
          item.t1 = Math.round(dragItemStart.t1 + deltaTime);
          item.t2 = Math.round(dragItemStart.t2 + deltaTime);
        }
        paint();
        return;
      }
    }

    // Creating new zone
    if (dragMode === 'create-zone') {
      paint();
    }
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}

    if (dragMode === 'handle' || dragMode === 'move-zone') {
      const item = drawings.find(d => d.id === selectedId);
      if (item && item.type === 'zone') {
        // Normalize so p1 is always high and p2 is always low
        const high = Math.max(item.p1, item.p2);
        const low = Math.min(item.p1, item.p2);
        item.p1 = high;
        item.p2 = low;
        if (item.t1 > item.t2) {
          const tmp = item.t1;
          item.t1 = item.t2;
          item.t2 = tmp;
        }
        saveDrawings();
      }
      dragMode = null;
      dragHandle = null;
      dragStart = null;
      dragCurrent = null;
      dragItemStart = null;
      paint();
      return;
    }

    if (dragMode === 'create-zone') {
      const p1 = dragStart;
      const p2 = getCoords(e);
      dragMode = null;
      dragStart = null;
      dragCurrent = null;

      if (p1 && p2 && Number.isFinite(p1.price) && Number.isFinite(p2.price)) {
        const priceDiff = Math.abs(p1.price - p2.price);
        if (priceDiff >= 0.2) {
          const t1 = p1.time || p2.time || Math.floor(Date.now() / 1000) - 1800;
          const t2 = p2.time || p1.time || Math.floor(Date.now() / 1000);

          const newZone = {
            id: 'zone-' + Date.now(),
            type: 'zone',
            t1: Math.min(t1, t2),
            p1: Math.max(p1.price, p2.price),
            t2: Math.max(t1, t2),
            p2: Math.min(p1.price, p2.price),
            color: 'rgba(245, 196, 81, 0.22)',
            border: '#F5C451'
          };
          drawings.push(newZone);
          saveDrawings();
          // Automatically select the newly created zone so Sayang can fine-tune handles immediately!
          setSelected(newZone.id);
          return;
        }
      }
      setActiveTool('pan');
      paint();
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  // 7. Subscribe to Chart Tap when in Pan mode to allow selecting zones
  let unsubClick = null;
  try {
    if (typeof chart.subscribeClick === 'function') {
      unsubClick = (param) => {
        if (!param || !param.point) return;
        const hit = findDrawingAt(param.point.x, param.point.y);
        if (hit) {
          setSelected(hit.id);
        } else if (selectedId) {
          setSelected(null);
        }
      };
      chart.subscribeClick(unsubClick);
    }
  } catch (_) {}

  // 8. Paint Engine
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
      const isSelected = d.id === selectedId;

      if (d.type === 'zone') {
        const b = getZoneBounds(d);
        if (b) {
          ctx.fillStyle = d.color || 'rgba(245, 196, 81, 0.22)';
          ctx.fillRect(b.minX, b.minY, b.width, b.height);

          ctx.strokeStyle = isSelected ? '#ffffff' : (d.border || '#F5C451');
          ctx.lineWidth = isSelected ? 2 : 1.5;
          ctx.setLineDash(isSelected ? [6, 3] : [4, 3]);
          ctx.strokeRect(b.minX, b.minY, b.width, b.height);
          ctx.setLineDash([]);

          ctx.font = 'bold 10px monospace, sans-serif';
          ctx.fillStyle = isSelected ? '#ffffff' : (d.border || '#F5C451');
          ctx.fillText(`ZONA $${d.p2.toFixed(1)} - $${d.p1.toFixed(1)}`, b.minX + 6, b.minY + 13);

          // If selected: Render 8 white grab handles (TradingView parity)
          if (isSelected) {
            const handles = getZoneHandles(d);
            for (const handle of handles) {
              ctx.beginPath();
              ctx.arc(handle.x, handle.y, 6.5, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
              ctx.strokeStyle = '#F5C451';
              ctx.lineWidth = 2.5;
              ctx.stroke();
            }
          }
        }
      } else if (d.type === 'line') {
        const y = series.priceToCoordinate(d.price);
        if (y != null) {
          ctx.strokeStyle = isSelected ? '#ffffff' : (d.color || '#38bdf8');
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
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

          if (isSelected) {
            ctx.beginPath();
            ctx.arc(w / 2, y, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
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
          ctx.strokeStyle = isSelected ? '#ffffff' : '#22c55e';
          ctx.lineWidth = isSelected ? 2 : 1.5;
          ctx.strokeRect(left, profitTop, boxWidth, profitHeight);

          // Risk Box
          const riskTop = Math.min(yEntry, ySl);
          const riskHeight = Math.abs(ySl - yEntry);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.fillRect(left, riskTop, boxWidth, riskHeight);
          ctx.strokeStyle = isSelected ? '#ffffff' : '#ef4444';
          ctx.lineWidth = isSelected ? 2 : 1.5;
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
    if (isDragging && dragMode === 'create-zone' && dragStart && dragCurrent) {
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

  // 9. Subscribe to Chart Visible Range & Zoom Updates
  let unsubTimeRange = null;
  try {
    if (typeof chart.timeScale().subscribeVisibleTimeRangeChange === 'function') {
      unsubTimeRange = () => paint();
      chart.timeScale().subscribeVisibleTimeRangeChange(unsubTimeRange);
    }
  } catch (_) {}

  // 10. Public Controller API
  return {
    setTf(newTf) {
      if (!newTf || newTf === currentTf) return;
      currentTf = newTf;
      selectedId = null;
      drawings = loadDrawings(currentTf);
      renderToolbar();
      paint();
    },
    setFullscreen(enabled) {
      isFullscreenActive = enabled;
      toolbar.style.display = enabled ? 'flex' : 'none';
      if (!enabled) {
        selectedId = null;
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
      if (unsubClick) {
        try { chart.unsubscribeClick(unsubClick); } catch (_) {}
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
