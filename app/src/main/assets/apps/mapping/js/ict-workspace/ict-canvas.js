import {compactChartNarration} from './ict-presentation.js';
import {sessions} from './amy-ict.js';
import {calculateNextGenIndicators} from './nextgen-indicators.js';

export function getCandlesFingerprint(tf, candles) {
  if (!candles || !candles.length) return '';
  const firstC = candles[0];
  const lastC = candles[candles.length - 1];
  const t0 = firstC?.time ?? firstC?.datetime ?? 0;
  const t1 = lastC?.time ?? lastC?.datetime ?? 0;
  const c1 = lastC?.close ?? 0;
  return `${tf}:${candles.length}:${t0}:${t1}:${c1}`;
}

export function createIctCanvas(element, chart, series) {
  const canvas = document.createElement('canvas');
  canvas.className = 'ict-overlay';
  canvas.style.pointerEvents = 'none';
  canvas.setAttribute('aria-hidden', 'true');
  element.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let state = null, frame = null, visualKey = '', indicators = null;

  const request = () => {
    if (frame == null) frame = requestAnimationFrame(paint);
  };

  function paint() {
    frame = null;
    if (!ctx) return;
    const w = element.clientWidth, h = element.clientHeight, scale = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * scale) || canvas.height !== Math.round(h * scale)) {
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!state?.candles?.length) return;

    const {candles, amy, settings: s = {}, layers = {}, tf} = state;
    const showPoi = layers.poi !== false;
    const showTouches = layers.touches !== false;
    const showStructure = layers.structure !== false;
    const showLiquidity = layers.liquidity !== false;
    const showAsia = layers.asia === true;
    const showIdm = layers.idm === true;
    const showExpansion = layers.expansion === true;
    const showKillzones = layers.killzones === true;

    const fullscreen = Boolean(element.closest('#gold-chart-workspace.is-fullscreen'));
    const fontSize = fullscreen ? 13 : 10;
    const plotRight = Math.max(0, w - chart.priceScale('right').width());
    const plotBottom = Math.max(0, h - chart.timeScale().height());

    const key = getCandlesFingerprint(tf, candles);
    if (key !== visualKey || !indicators) {
      visualKey = key;
      indicators = state.indicators || calculateNextGenIndicators(candles, {
        context: state.context || (amy ? {amy} : null),
        tf
      });
      if (typeof window !== 'undefined') {
        window.amyfxLastIndicators = indicators;
        window.dispatchEvent(new CustomEvent('amyfx:indicators-updated', { detail: indicators }));
      }
    }

    const x = t => Number.isFinite(t) ? chart.timeScale().timeToCoordinate(t) : null;
    const y = p => series.priceToCoordinate(p);
    const logical = chart.timeScale().getVisibleLogicalRange();
    const first = logical ? Math.max(0, Math.floor(logical.from)) : 0;
    const last = Math.min(candles.length - 1, logical ? Math.ceil(logical.to) : candles.length - 1);

    const leftAt = t => {
      const index = candles.findIndex(c => c.time >= t);
      if (index < 0) return null;
      const v = x(candles[index].time);
      return v == null ? (index < first ? 0 : null) : v;
    };

    const light = document.documentElement.dataset.amyfxTheme === 'light' || document.documentElement.dataset.theme === 'light';
    const labelBounds = [];
    // Reserve top-left safe area for OHLC HUD so labels never collide with OHLC strip
    labelBounds.push({ left: 0, right: Math.min(plotRight, 250), top: 0, bottom: 26 });

    const label = (text, xx, yy, color) => {
      if (!text || yy < fontSize + 4 || yy > plotBottom - 6) return;
      ctx.font = `600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      const textWidth = ctx.measureText(text).width;
      const padX = 5;
      const boxW = Math.min(textWidth + padX * 2, Math.max(0, plotRight - xx - 2));
      const boxH = fontSize + 5;
      const bx = Math.max(4, Math.min(xx - 2, plotRight - boxW - 4));
      const by = yy - fontSize - 2;
      const bounds = { left: bx, right: bx + boxW, top: by, bottom: by + boxH };
      if (labelBounds.some(b => bounds.left < b.right + 2 && bounds.right > b.left - 2 && bounds.top < b.bottom + 2 && bounds.bottom > b.top - 2)) return;
      labelBounds.push(bounds);

      ctx.fillStyle = light ? 'rgba(255, 255, 255, 0.92)' : 'rgba(6, 9, 15, 0.88)';
      ctx.fillRect(bx, by, boxW, boxH);
      ctx.strokeStyle = color + (light ? '55' : '66');
      ctx.lineWidth = 0.75;
      ctx.strokeRect(bx, by, boxW, boxH);
      ctx.fillStyle = color;
      ctx.fillText(text, bx + padX, yy, Math.max(0, boxW - padX * 2));
    };

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, plotRight, plotBottom);
    ctx.clip();

    // 1. Killzones / Session background shading (Layer: killzones)
    if (showKillzones) {
      for (let i = first; i <= last; i++) {
        const c = candles[i], names = sessions(c.time);
        const active = names.find(n => ({NY: s.ny !== false, LONDON_OPEN: s.londonOpen !== false, LONDON_CLOSE: s.londonClose !== false, ASIA: s.asian !== false})[n]);
        if (!active) continue;
        const xx = x(c.time), next = x(candles[i + 1]?.time);
        if (xx == null) continue;
        ctx.fillStyle = {
          NY: light ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255, 140, 0, 0.10)',
          LONDON_OPEN: light ? 'rgba(6, 182, 212, 0.08)' : 'rgba(0, 188, 212, 0.10)',
          LONDON_CLOSE: light ? 'rgba(37, 99, 235, 0.08)' : 'rgba(59, 130, 246, 0.11)',
          ASIA: light ? 'rgba(168, 85, 247, 0.07)' : 'rgba(168, 85, 247, 0.10)'
        }[active];
        ctx.fillRect(xx, 0, Math.max(2, (next ?? xx + 8) - xx), plotBottom);
      }
    }

    const lineRight = Math.min(plotRight, chart.timeScale().logicalToCoordinate(candles.length - 1 + (s.rightBars || 10)) ?? plotRight);

    const line = (price, title, color, time = null, end = null, dashed = false) => {
      const yy = y(price);
      if (yy == null || yy < 0 || yy > plotBottom) return;
      const origin = time != null ? leftAt(time) : x(candles[Math.max(0, candles.length - (s.backBars || 80))]?.time);
      const xx = origin ?? 0, right = end != null ? leftAt(end) ?? plotRight : lineRight;
      ctx.strokeStyle = color;
      ctx.lineWidth = s.lineWidth || 1;
      if (dashed) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.lineTo(right, yy);
      ctx.stroke();
      if (dashed) ctx.setLineDash([]);
      label(title, Math.max(4, Math.min(xx + 4, plotRight - 96)), yy - 4, color);
    };

    // 2. Asia Session High / Low (Layer: asia)
    const kl = indicators?.keyLevels;
    if (showAsia && kl?.asiaStart && kl.asiaHigh != null && kl.asiaLow != null) {
      const aX1 = leftAt(kl.asiaStart);
      const aX2 = kl.asiaEnd ? leftAt(kl.asiaEnd) : lineRight;
      const aTop = y(kl.asiaHigh);
      const aBot = y(kl.asiaLow);
      if (aX1 != null && aTop != null && aBot != null) {
        ctx.fillStyle = light ? 'rgba(168, 85, 247, 0.06)' : 'rgba(168, 85, 247, 0.10)';
        ctx.fillRect(aX1, aTop, Math.max(0, Math.min(plotRight, aX2 ?? plotRight) - aX1), Math.max(0, aBot - aTop));
      }
      line(kl.asiaHigh, `ASIA H ${kl.asiaHigh.toFixed(2)}`, '#a855f7', kl.asiaStart, null, true);
      line(kl.asiaLow, `ASIA L ${kl.asiaLow.toFixed(2)}`, '#a855f7', kl.asiaStart, null, true);
    }

    // Helper: Draw pinpoint zone touch history markers directly on touched candles (Layer: touches)
    const drawTouchMarkers = (zone, baseColor) => {
      if (!showTouches || !Array.isArray(zone?.touches) || !zone.touches.length) return;
      const ceColor = light ? '#D97706' : '#F5C451';
      const breakColor = light ? '#DC2626' : '#EF4444';
      const ringBg = light ? '#FFFFFF' : '#06090F';

      for (const touch of zone.touches) {
        const tx = x(touch.time);
        const ty = y(touch.price);
        if (tx == null || ty == null || tx < 2 || tx > plotRight - 2 || ty < 2 || ty > plotBottom - 2) continue;

        if (touch.broken) {
          // Crisp crimson ✕ cross for structural zone invalidation / break
          ctx.save();
          ctx.fillStyle = breakColor + '26';
          ctx.beginPath();
          ctx.arc(tx, ty, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = ringBg;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(tx - 3.6, ty - 3.6);
          ctx.lineTo(tx + 3.6, ty + 3.6);
          ctx.moveTo(tx + 3.6, ty - 3.6);
          ctx.lineTo(tx - 3.6, ty + 3.6);
          ctx.stroke();
          ctx.strokeStyle = breakColor;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(tx - 3.6, ty - 3.6);
          ctx.lineTo(tx + 3.6, ty + 3.6);
          ctx.moveTo(tx + 3.6, ty - 3.6);
          ctx.lineTo(tx - 3.6, ty + 3.6);
          ctx.stroke();
          ctx.restore();
          label('✕', Math.max(4, tx - 6), ty - 7, breakColor);
        } else if (touch.hitCe) {
          // Gold diamond ◆ for 50% CE touch
          const r = 4.6;
          ctx.save();
          ctx.fillStyle = ceColor + '33';
          ctx.beginPath();
          ctx.arc(tx, ty, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(tx, ty - r);
          ctx.lineTo(tx + r, ty);
          ctx.lineTo(tx, ty + r);
          ctx.lineTo(tx - r, ty);
          ctx.closePath();
          ctx.fillStyle = ceColor;
          ctx.fill();
          ctx.strokeStyle = ringBg;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
          const tagY = zone.side === 'BUY' ? Math.min(plotBottom - 4, ty + fontSize + 7) : Math.max(fontSize + 6, ty - 7);
          label(`T${touch.index}·CE`, Math.max(4, tx - 14), tagY, ceColor);
        } else {
          // Glowing circle dot for edge touch
          ctx.save();
          ctx.fillStyle = baseColor + '33';
          ctx.beginPath();
          ctx.arc(tx, ty, 6.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = baseColor;
          ctx.beginPath();
          ctx.arc(tx, ty, 3.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = ringBg;
          ctx.lineWidth = 1.1;
          ctx.stroke();
          ctx.restore();
          const tagY = zone.side === 'BUY' ? Math.min(plotBottom - 4, ty + fontSize + 6) : Math.max(fontSize + 6, ty - 6);
          label(`T${touch.index}`, Math.max(4, tx - 8), tagY, baseColor);
        }
      }
    };

    const formatZoneStatus = (prefix, z) => {
      const cnt = Number(z.touchCount) || (z.tested ? 1 : 0);
      if (z.mitigated || z.lifecycle === 'BROKEN') return `${prefix} · ✕ JEBOL`;
      if (cnt <= 0) return `${prefix} · FRESH`;
      return `${prefix} · ${cnt}×${z.ceTouched ? ' CE' : ''}`;
    };

    // 3. Time-bounded POI Boxes: FVG & Order Blocks with 50% CE + Touch History (Layer: poi)
    if (showPoi) {
      for (const fvg of indicators?.poi?.fvg || []) {
        const xx = leftAt(fvg.startTime);
        const top = y(fvg.top), bottom = y(fvg.bot);
        if (xx == null || top == null || bottom == null || xx > plotRight) continue;
        const end = (fvg.mitigated && !fvg.tested) ? leftAt(fvg.endTime) : lineRight;
        const right = Math.min(plotRight, end ?? lineRight);
        const color = fvg.side === 'BUY' ? (light ? '#059669' : '#00C896') : (light ? '#E11D48' : '#FF4D6A');
        const isTested = Boolean(fvg.tested || (fvg.touchCount || 0) > 0);

        ctx.fillStyle = color + (light ? (isTested ? '10' : '18') : (isTested ? '15' : '20'));
        ctx.fillRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));
        ctx.strokeStyle = color + (isTested ? '88' : 'BB');
        ctx.lineWidth = s.lineWidth || 1;
        if (isTested) ctx.setLineDash([3, 3]);
        ctx.strokeRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));
        ctx.setLineDash([]);

        const ceY = y(fvg.ce);
        if (ceY != null) {
          ctx.setLineDash(fvg.ceTouched ? [5, 2] : [3, 3]);
          ctx.strokeStyle = light ? '#D97706' : '#F5C451';
          ctx.lineWidth = fvg.ceTouched ? 1.35 : 1;
          ctx.beginPath();
          ctx.moveTo(xx, ceY);
          ctx.lineTo(right, ceY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        label(formatZoneStatus(`${fvg.side === 'BUY' ? 'Bull' : 'Bear'} FVG`, fvg), Math.max(4, xx + 4), top + fontSize + 3, color);
        drawTouchMarkers(fvg, color);
      }

      for (const ob of indicators?.poi?.ob || []) {
        const xx = leftAt(ob.startTime);
        const top = y(ob.top), bottom = y(ob.bot);
        if (xx == null || top == null || bottom == null || xx > plotRight) continue;
        const end = (ob.mitigated && !ob.tested) ? leftAt(ob.endTime) : lineRight;
        const right = Math.min(plotRight, end ?? lineRight);
        const color = ob.side === 'BUY' ? (light ? '#2563EB' : '#38BDF8') : (light ? '#DC2626' : '#F87171');
        const isTested = Boolean(ob.tested || (ob.touchCount || 0) > 0);

        ctx.fillStyle = color + (light ? (isTested ? '12' : '1B') : (isTested ? '16' : '24'));
        ctx.fillRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));
        ctx.strokeStyle = color + (isTested ? '88' : 'CC');
        ctx.lineWidth = s.lineWidth || 1;
        if (isTested) ctx.setLineDash([3, 3]);
        ctx.strokeRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));
        ctx.setLineDash([]);

        const ceY = y(ob.ce);
        if (ceY != null) {
          ctx.setLineDash(ob.ceTouched ? [5, 2] : [3, 3]);
          ctx.strokeStyle = light ? '#D97706' : '#F5C451';
          ctx.lineWidth = ob.ceTouched ? 1.35 : 1;
          ctx.beginPath();
          ctx.moveTo(xx, ceY);
          ctx.lineTo(right, ceY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        label(formatZoneStatus(ob.label || (ob.side === 'BUY' ? '+OB' : '-OB'), ob), Math.max(4, xx + 4), top + fontSize + 3, color);
        drawTouchMarkers(ob, color);
      }

      // Inverse Fair Value Gaps (iFVG) — Institutional polarity-flip zones
      for (const inv of indicators?.poi?.ifvg || []) {
        const xx = leftAt(inv.startTime);
        const top = y(inv.top), bottom = y(inv.bot);
        if (xx == null || top == null || bottom == null || xx > plotRight) continue;
        const end = (inv.mitigated && !inv.tested) ? leftAt(inv.endTime) : lineRight;
        const right = Math.min(plotRight, end ?? lineRight);
        const color = inv.side === 'BUY' ? (light ? '#7C3AED' : '#A855F7') : (light ? '#D97706' : '#F59E0B');
        const isTested = Boolean(inv.tested || (inv.touchCount || 0) > 0);

        ctx.fillStyle = color + (light ? (isTested ? '10' : '18') : (isTested ? '14' : '22'));
        ctx.fillRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));
        ctx.strokeStyle = color + (isTested ? '88' : 'CC');
        ctx.lineWidth = s.lineWidth || 1.1;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));
        ctx.setLineDash([]);

        const ceY = y(inv.ce);
        if (ceY != null) {
          ctx.setLineDash(inv.ceTouched ? [5, 2] : [2, 3]);
          ctx.strokeStyle = light ? '#D97706' : '#F5C451';
          ctx.lineWidth = inv.ceTouched ? 1.35 : 1;
          ctx.beginPath();
          ctx.moveTo(xx, ceY);
          ctx.lineTo(right, ceY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        label(formatZoneStatus(inv.label || (inv.side === 'BUY' ? '+iFVG' : '-iFVG'), inv), Math.max(4, xx + 4), top + fontSize + 3, color);
        drawTouchMarkers(inv, color);
      }

      // Breaker Blocks (BB) — Violated OB reclaimed as high-probability institutional support/resistance
      for (const bb of indicators?.poi?.bb || []) {
        const xx = leftAt(bb.startTime);
        const top = y(bb.top), bottom = y(bb.bot);
        if (xx == null || top == null || bottom == null || xx > plotRight) continue;
        const end = (bb.mitigated && !bb.tested) ? leftAt(bb.endTime) : lineRight;
        const right = Math.min(plotRight, end ?? lineRight);
        const color = bb.side === 'BUY' ? (light ? '#0891B2' : '#22D3EE') : (light ? '#EA580C' : '#FB923C');
        const isTested = Boolean(bb.tested || (bb.touchCount || 0) > 0);

        ctx.fillStyle = color + (light ? (isTested ? '12' : '1E') : (isTested ? '18' : '28'));
        ctx.fillRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));
        ctx.strokeStyle = color + (isTested ? '99' : 'DD');
        ctx.lineWidth = Math.max(1.25, s.lineWidth || 1.25);
        ctx.strokeRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));

        const ceY = y(bb.ce);
        if (ceY != null) {
          ctx.setLineDash(bb.ceTouched ? [5, 2] : [3, 3]);
          ctx.strokeStyle = light ? '#D97706' : '#F5C451';
          ctx.lineWidth = bb.ceTouched ? 1.35 : 1;
          ctx.beginPath();
          ctx.moveTo(xx, ceY);
          ctx.lineTo(right, ceY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        label(formatZoneStatus(bb.label || (bb.side === 'BUY' ? '+BB' : '-BB'), bb), Math.max(4, xx + 4), top + fontSize + 3, color);
        drawTouchMarkers(bb, color);
      }

      // Subtle ghost boxes for recently broken zones (up to 2) when Touch History layer is ON
      if (showTouches) {
        for (const brk of (indicators?.poi?.recentBroken || []).slice(-2)) {
          const xx = leftAt(brk.startTime);
          const endX = leftAt(brk.endTime);
          const top = y(brk.top), bottom = y(brk.bot);
          if (xx == null || endX == null || top == null || bottom == null || xx > plotRight) continue;
          const right = Math.min(plotRight, Math.max(xx + 8, endX));
          const ghostColor = light ? '#64748B' : '#94A3B8';

          ctx.fillStyle = ghostColor + (light ? '0E' : '12');
          ctx.fillRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = ghostColor + '80';
          ctx.lineWidth = 0.9;
          ctx.strokeRect(xx, top, Math.max(0, right - xx), Math.max(0, bottom - top));
          ctx.setLineDash([]);

          const prefix = brk.kind === 'OB'
            ? (brk.label || (brk.side === 'BUY' ? '+OB' : '-OB'))
            : `${brk.side === 'BUY' ? 'Bull' : 'Bear'} FVG`;
          label(`${prefix} · ✕ JEBOL`, Math.max(4, xx + 4), top + fontSize + 3, ghostColor);
          drawTouchMarkers(brk, ghostColor);
        }
      }
    }

    // 4. Market Structure: BOS & MSS lines (Layer: structure)
    if (showStructure) {
      for (const ev of indicators?.structure?.events || []) {
        const x1 = leftAt(ev.startTime), x2 = leftAt(ev.endTime), yy = y(ev.level);
        if (x1 == null || x2 == null || yy == null) continue;
        const evColor = ev.side === 'BULL' ? (light ? '#059669' : '#00C896') : (light ? '#E11D48' : '#FF4D6A');
        ctx.strokeStyle = evColor;
        ctx.lineWidth = Math.max(1.25, s.lineWidth || 1);
        ctx.beginPath();
        ctx.moveTo(x1, yy);
        ctx.lineTo(x2, yy);
        ctx.stroke();
        const xMid = Math.round((x1 + x2) / 2);
        label(`${ev.type}`, Math.max(4, xMid - 14), yy - 4, evColor);
      }
    }

    // 5. Internal Liquidity (BSL / SSL) & Sweep Markers (Layer: liquidity)
    if (showLiquidity) {
      for (const bsl of indicators?.liquidity?.bsl || []) {
        const xx = leftAt(bsl.time), yy = y(bsl.level);
        if (xx == null || yy == null) continue;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = light ? '#E11D48' : '#FF4D6A';
        ctx.lineWidth = s.lineWidth || 1;
        ctx.beginPath();
        ctx.moveTo(xx, yy);
        ctx.lineTo(lineRight, yy);
        ctx.stroke();
        ctx.setLineDash([]);
        label(`BSL ${bsl.level.toFixed(2)}`, Math.max(4, Math.min(xx + 4, plotRight - 96)), yy - 4, light ? '#E11D48' : '#FF4D6A');
      }
      for (const ssl of indicators?.liquidity?.ssl || []) {
        const xx = leftAt(ssl.time), yy = y(ssl.level);
        if (xx == null || yy == null) continue;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = light ? '#059669' : '#00C896';
        ctx.lineWidth = s.lineWidth || 1;
        ctx.beginPath();
        ctx.moveTo(xx, yy);
        ctx.lineTo(lineRight, yy);
        ctx.stroke();
        ctx.setLineDash([]);
        label(`SSL ${ssl.level.toFixed(2)}`, Math.max(4, Math.min(xx + 4, plotRight - 96)), yy - 4, light ? '#059669' : '#00C896');
      }

      const swList = indicators?.liquidity?.sweeps || [];
      for (let i = 0; i < swList.length; i++) {
        const sw = swList[i];
        const xx = x(sw.time), yy = y(sw.price);
        if (xx == null || yy == null || xx < 0 || xx > plotRight) continue;
        ctx.font = 'bold ' + (fontSize + 2) + 'px sans-serif';
        ctx.fillStyle = sw.color;
        ctx.textAlign = 'center';
        const offset = sw.side === 'BUY' ? -4 : (fontSize + 4);
        ctx.fillText(sw.symbol, xx, yy + offset);
        ctx.textAlign = 'left';

        if (i === swList.length - 1) {
          const sweepLevel = Number(sw.level ?? sw.price);
          const syy = y(sweepLevel);
          if (syy != null) {
            ctx.setLineDash([5, 3]);
            ctx.strokeStyle = sw.color || '#f59e0b';
            ctx.lineWidth = s.lineWidth || 1;
            ctx.beginPath();
            ctx.moveTo(xx, syy);
            ctx.lineTo(lineRight, syy);
            ctx.stroke();
            ctx.setLineDash([]);
            const tag = sw.reclaimed ? '🎯 Reclaimed Valid' : '⚖️ Menunggu Rejection Close';
            label(`${sw.label || sw.pool || 'SWEEP'} ${tag}`, Math.max(4, Math.min(xx + 8, plotRight - 110)), syy - 4, sw.color || '#f59e0b');
          }
        }
      }
    }

    // 6. Batas Ekspansi (Layer: expansion — off by default)
    if (showExpansion && indicators?.expansion) {
      const exp = indicators.expansion;
      if (Number.isFinite(exp.expNorm)) {
        line(exp.expNorm, `TARGET ${exp.expNorm.toFixed(2)}`, exp.trend === 'BULL' ? '#00C896' : '#FF4D6A', exp.startTime, null, true);
      }
      if (Number.isFinite(exp.expMax)) {
        line(exp.expMax, `KLIMAKS ${exp.expMax.toFixed(2)}`, '#F5C451', exp.startTime, null, false);
      }
    }

    // 7. Inducement IDM (Layer: idm — off by default)
    if (showIdm && indicators?.idm && Number.isFinite(indicators.idm.level)) {
      const idm = indicators.idm;
      line(idm.level, `IDM ${idm.level.toFixed(2)}${idm.swept ? ' [SWEPT]' : ''}`, '#a78bfa', idm.time, null, true);
    }

    // 8. Compact Chart Narration (Hanya jika fullscreen & diaktifkan)
    if (s.narration && fullscreen && amy?.entry) {
      const lines = compactChartNarration(amy, state.news);
      ctx.font = (fullscreen ? 13 : 11) + 'px sans-serif';
      const lineHeight = fullscreen ? 19 : 15;
      const bw = Math.min(plotRight - 16, fullscreen ? 420 : 280);
      const bh = lines.length * lineHeight + 12;
      ctx.fillStyle = light ? 'rgba(255,255,255,0.92)' : 'rgba(6,9,15,0.90)';
      ctx.fillRect(8, 30, bw, bh);
      ctx.strokeStyle = light ? '#cbd5e1' : '#334155';
      ctx.strokeRect(8, 30, bw, bh);
      ctx.fillStyle = light ? '#0f172a' : '#e2e8f0';
      lines.forEach((text, i) => ctx.fillText(text, 14, 30 + lineHeight + i * lineHeight, bw - 12));
    }

    ctx.restore();
  }

  let interacting = false;
  const begin = () => { interacting = true; request(); };
  const move = () => { if (interacting) request(); };
  const end = event => { interacting = Boolean(event?.touches?.length); request(); };
  const bindings = [
    [element, 'touchstart', begin], [element, 'mousedown', begin], [element, 'dblclick', request],
    [document, 'touchmove', move], [document, 'mousemove', move], [document, 'touchend', end],
    [document, 'touchcancel', end], [document, 'mouseup', end], [window, 'blur', end]
  ];
  for (const [target, name, handler] of bindings) target.addEventListener(name, handler, {passive: true});
  chart.timeScale().subscribeVisibleLogicalRangeChange(request);
  const observer = new ResizeObserver(request);
  observer.observe(element);

  return {
    update(next) {
      state = next;
      indicators = next?.indicators || null;
      request();
    },
    invalidate: request,
    destroy() {
      for (const [target, name, handler] of bindings) target.removeEventListener(name, handler);
      if (frame != null) cancelAnimationFrame(frame);
      observer.disconnect();
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(request);
      canvas.remove();
    }
  };
}
