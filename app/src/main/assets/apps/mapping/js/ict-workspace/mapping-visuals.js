/**
 * Pure interactive visual geometry & SVG renderers for Mapping Cockpit:
 * 1) XAU/USD Live — 3-TF Institutional Bias Compass (H1 / M15 / M5 concentric arcs + weighted needle + ADR energy)
 * 2) Dealing Range — Vertical Price Ladder (BSL / OTE Sell / No-Trade EQ / OTE Buy / SSL + Live Pin + POI markers + M15|PDL-PDH mode)
 *
 * Pure ES module with zero DOM dependencies so every coordinate and state transition is unit-testable.
 */

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function toFinite(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function fmtUsd(v) {
  return Number.isFinite(v) ? `$${v.toFixed(2)}` : '—';
}

function fmtSignedUsd(diff) {
  if (!Number.isFinite(diff)) return '';
  if (Math.abs(diff) < 0.05) return 'di level';
  return `${diff > 0 ? '+' : '-'}$${Math.abs(diff).toFixed(2)}`;
}

function escSvg(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function polarToCartesian(cx, cy, r, angleDeg) {
  // 0 deg = top (12 o'clock), -90 = left (9 o'clock), +90 = right (3 o'clock)
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: Number((cx + r * Math.cos(rad)).toFixed(2)),
    y: Number((cy + r * Math.sin(rad)).toFixed(2))
  };
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const a0 = Math.min(startDeg, endDeg);
  const a1 = Math.max(startDeg, endDeg);
  const start = polarToCartesian(cx, cy, r, a0);
  const end = polarToCartesian(cx, cy, r, a1);
  const largeArc = (a1 - a0) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/**
 * Compute pure data model for the XAU/USD Live 3-TF Bias Compass.
 */
export function computeBiasCompassModel({
  h1Dir = 0,
  m15Dir = 0,
  m5Dir = 0,
  h1Desc = 'Struktur netral — tunggu break',
  m15Desc = 'Konsolidasi — tunggu break',
  m5Desc = 'Choppy — tunggu trigger',
  adrPct = NaN,
  adrText = '—',
  adrTone = ''
} = {}) {
  const normDir = d => (d > 0 ? 1 : d < 0 ? -1 : 0);
  const dH1 = normDir(h1Dir);
  const dM15 = normDir(m15Dir);
  const dM5 = normDir(m5Dir);

  // Weighted institutional hierarchy: H1 (50) + M15 (35) + M5 (15) = [-100 .. +100]
  const score = (dH1 * 50) + (dM15 * 35) + (dM5 * 15);
  const needleAngle = Number(((score / 100) * 78).toFixed(1));
  const tone = score >= 25 ? 'bull' : (score <= -25 ? 'bear' : 'neutral');

  const bullCount = [dH1, dM15, dM5].filter(d => d === 1).length;
  const bearCount = [dH1, dM15, dM5].filter(d => d === -1).length;

  let alignmentLabel = 'Netral · Tunggu Break';
  if (bullCount === 3) alignmentLabel = 'Selaras Bullish · 3/3 TF';
  else if (bearCount === 3) alignmentLabel = 'Selaras Bearish · 3/3 TF';
  else if (dH1 === 1 && dM15 === 1) alignmentLabel = 'Dominan Bullish · H1 + M15';
  else if (dH1 === -1 && dM15 === -1) alignmentLabel = 'Dominan Bearish · H1 + M15';
  else if ((dH1 === 1 && dM15 === -1) || (dH1 === -1 && dM15 === 1)) alignmentLabel = 'Tarik-Menarik · H1 vs M15';
  else if (score > 0) alignmentLabel = 'Condong Bullish';
  else if (score < 0) alignmentLabel = 'Condong Bearish';

  const makeSeg = (key, role, weight, dir, desc, radius) => ({
    key,
    role,
    weight,
    dir,
    dirLabel: dir === 1 ? 'BULL' : (dir === -1 ? 'BEAR' : 'NETRAL'),
    tone: dir === 1 ? 'bull' : (dir === -1 ? 'bear' : 'neutral'),
    desc: String(desc || '—'),
    radius
  });

  const segments = [
    makeSeg('H1', 'HTF', 50, dH1, h1Desc, 96),
    makeSeg('M15', 'MTF', 35, dM15, m15Desc, 79),
    makeSeg('M5', 'LTF', 15, dM5, m5Desc, 62)
  ];

  const cleanAdrPct = toFinite(adrPct);
  const adrBarPct = Number.isFinite(cleanAdrPct) ? clamp(Math.round(cleanAdrPct), 0, 100) : 0;
  let adrState = 'neutral';
  if (Number.isFinite(cleanAdrPct)) {
    if (cleanAdrPct >= 115) adrState = 'exhausted';
    else if (cleanAdrPct >= 88) adrState = 'warm';
    else adrState = 'fresh';
  } else if (adrTone === 'is-bear') adrState = 'exhausted';
  else if (adrTone === 'is-gold') adrState = 'warm';
  else if (adrTone === 'is-bull') adrState = 'fresh';

  return {
    score,
    scoreText: score > 0 ? `+${score}` : `${score}`,
    needleAngle,
    tone,
    bullCount,
    bearCount,
    alignmentLabel,
    segments,
    adr: {
      pct: Number.isFinite(cleanAdrPct) ? Math.round(cleanAdrPct) : null,
      barPct: adrBarPct,
      state: adrState,
      text: String(adrText || '—')
    }
  };
}

/**
 * Render clean interactive SVG for the 3-TF Institutional Bias Compass.
 */
export function renderBiasCompassSvg(model, selectedTf = 'M15') {
  const m = model || computeBiasCompassModel();
  const cx = 140;
  const cy = 124;
  const activeKey = ['H1', 'M15', 'M5'].includes(selectedTf) ? selectedTf : 'M15';

  // Background guide tracks for H1 (outer), M15 (mid), M5 (inner)
  const ringTracks = m.segments.map(seg => {
    const bgPath = describeArc(cx, cy, seg.radius, -82, 82);
    let valPath = '';
    if (seg.dir === 1) {
      valPath = describeArc(cx, cy, seg.radius, 3, 82);
    } else if (seg.dir === -1) {
      valPath = describeArc(cx, cy, seg.radius, -82, -3);
    } else {
      valPath = describeArc(cx, cy, seg.radius, -14, 14);
    }
    const isSel = seg.key === activeKey;
    const strokeW = seg.key === 'H1' ? 9 : (seg.key === 'M15' ? 8 : 7);
    const hitW = 15;
    return `
      <g class="bc-ring bc-ring--${seg.tone} ${isSel ? 'is-selected' : ''}" data-bc-tf="${seg.key}" role="button" tabindex="0" aria-label="${seg.key} ${seg.dirLabel}: ${escSvg(seg.desc)}">
        <path class="bc-track" d="${bgPath}" stroke-width="${strokeW}" />
        <path class="bc-fill bc-fill--${seg.tone}" d="${valPath}" stroke-width="${isSel ? strokeW + 1.5 : strokeW}" />
        <path class="bc-hit" d="${bgPath}" stroke-width="${hitW}" />
      </g>
    `;
  }).join('');

  // Subtle calibration ticks around the outer perimeter
  const tickAngles = [-82, -41, 0, 41, 82];
  const ticks = tickAngles.map(ang => {
    const p1 = polarToCartesian(cx, cy, 105, ang);
    const p2 = polarToCartesian(cx, cy, ang === 0 ? 111 : 109, ang);
    return `<line class="bc-tick ${ang === 0 ? 'bc-tick--zero' : ''}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />`;
  }).join('');

  return `
    <svg class="bias-compass-svg" viewBox="0 -6 280 150" role="img" aria-label="Kompas bias 3 timeframe skor ${escSvg(m.scoreText)}">
      <g class="bc-ticks">${ticks}</g>
      <g class="bc-rings">${ringTracks}</g>

      <!-- Perimeter polarity labels -->
      <text class="bc-axis-label bc-axis-bear" x="22" y="138" text-anchor="start">BEAR</text>
      <text class="bc-axis-label bc-axis-zero" x="${cx}" y="5" text-anchor="middle">0</text>
      <text class="bc-axis-label bc-axis-bull" x="258" y="138" text-anchor="end">BULL</text>

      <!-- Weighted Needle -->
      <g class="bc-needle-wrap" style="transform: rotate(${m.needleAngle}deg); transform-origin: ${cx}px ${cy}px;">
        <line class="bc-needle-stem bc-needle--${m.tone}" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 86}" />
        <polygon class="bc-needle-tip bc-needle--${m.tone}" points="${cx},${cy - 93} ${cx - 4},${cy - 81} ${cx + 4},${cy - 81}" />
      </g>
      <circle class="bc-hub-outer" cx="${cx}" cy="${cy}" r="8" />
      <circle class="bc-hub-inner bc-hub--${m.tone}" cx="${cx}" cy="${cy}" r="4" />

      <!-- Center Score Readout -->
      <text class="bc-score-val bc-score--${m.tone}" x="${cx}" y="106" text-anchor="middle">${escSvg(m.scoreText)}</text>
    </svg>
  `.trim();
}

/**
 * Compute pure data model for the Dealing Range Interactive Vertical Price Ladder.
 */
export function computeDealingLadderModel({
  rLow = NaN,
  rHigh = NaN,
  eq = NaN,
  livePrice = NaN,
  pdl = NaN,
  pdh = NaN,
  mode = 'M15',
  buyPoi = null,
  sellPoi = null,
  isBslSwept = false,
  isSslSwept = false,
  isBullBreakout = false,
  isBearBreakdown = false
} = {}) {
  const m15Lo = toFinite(rLow);
  const m15Hi = toFinite(rHigh);
  const majLo = toFinite(pdl);
  const majHi = toFinite(pdh);
  const hasMajor = Number.isFinite(majLo) && Number.isFinite(majHi) && majHi > majLo;
  const activeMode = (mode === 'MAJOR' && hasMajor) ? 'MAJOR' : 'M15';

  const low = activeMode === 'MAJOR' ? majLo : m15Lo;
  const high = activeMode === 'MAJOR' ? majHi : m15Hi;
  const valid = Number.isFinite(low) && Number.isFinite(high) && high > low;
  const span = valid ? (high - low) : 1;
  const mid = valid
    ? (activeMode === 'M15' && Number.isFinite(toFinite(eq)) ? toFinite(eq) : (low + high) / 2)
    : NaN;

  const price = toFinite(livePrice);
  const rawPct = (valid && Number.isFinite(price))
    ? ((price - low) / span) * 100
    : 50;
  const pct = Math.round(clamp(rawPct, 0, 100));

  const topY = 24;
  const botY = 198;
  const trackH = botY - topY;
  const pctToY = p => Number((botY - (clamp(p, -6, 106) / 100) * trackH).toFixed(1));
  const priceToY = pr => {
    if (!valid || !Number.isFinite(pr)) return pctToY(50);
    return pctToY(((pr - low) / span) * 100);
  };

  const oteSellHigh = valid ? low + span * 0.79 : NaN;
  const oteSellLow = valid ? low + span * 0.62 : NaN;
  const noTradeHigh = valid ? low + span * 0.525 : NaN;
  const noTradeLow = valid ? low + span * 0.475 : NaN;
  const oteBuyHigh = valid ? low + span * 0.38 : NaN;
  const oteBuyLow = valid ? low + span * 0.21 : NaN;

  const liveY = priceToY(price);

  let zoneKey = 'eq';
  let zoneLabel = 'No-Trade EQ';
  let zoneTone = 'neutral';
  if (valid && Number.isFinite(price)) {
    if (rawPct > 100) {
      zoneKey = 'bsl';
      zoneLabel = activeMode === 'M15' && isBullBreakout ? 'Breakout Atas' : 'Di Atas High';
      zoneTone = 'bull';
    } else if (rawPct < 0) {
      zoneKey = 'ssl';
      zoneLabel = activeMode === 'M15' && isBearBreakdown ? 'Breakdown Bawah' : 'Di Bawah Low';
      zoneTone = 'bear';
    } else if (rawPct >= 62 && rawPct <= 79) {
      zoneKey = 'ote_sell';
      zoneLabel = 'OTE Sell (62–79%)';
      zoneTone = 'bear';
    } else if (rawPct > 52.5) {
      zoneKey = 'bsl';
      zoneLabel = 'Zona Premium';
      zoneTone = 'bear';
    } else if (rawPct >= 21 && rawPct <= 38) {
      zoneKey = 'ote_buy';
      zoneLabel = 'OTE Buy (21–38%)';
      zoneTone = 'bull';
    } else if (rawPct < 47.5) {
      zoneKey = 'ssl';
      zoneLabel = 'Zona Diskon';
      zoneTone = 'bull';
    }
  }

  const topName = activeMode === 'MAJOR' ? 'PDH' : 'BSL';
  const botName = activeMode === 'MAJOR' ? 'PDL' : 'SSL';

  const makePoiMarker = (poi, side) => {
    if (!valid || !poi) return null;
    const ce = toFinite(poi.ce ?? ((toFinite(poi.low) + toFinite(poi.high)) / 2));
    if (!Number.isFinite(ce)) return null;
    const pPct = ((ce - low) / span) * 100;
    if (pPct < -12 || pPct > 112) return null;
    const lo = toFinite(poi.low);
    const hi = toFinite(poi.high);
    const yCe = pctToY(pPct);
    const yTop = Number.isFinite(hi) ? pctToY(((hi - low) / span) * 100) : yCe - 3;
    const yBot = Number.isFinite(lo) ? pctToY(((lo - low) / span) * 100) : yCe + 3;
    return {
      side,
      kind: String(poi.kind || 'POI'),
      tf: String(poi.tf || 'M15'),
      ce: Number(ce.toFixed(2)),
      y: yCe,
      bandTop: Math.min(yTop, yBot),
      bandHeight: Math.max(4, Math.abs(yBot - yTop)),
      diffText: Number.isFinite(price) ? fmtSignedUsd(ce - price) : ''
    };
  };

  const poiMarkers = [
    makePoiMarker(sellPoi, 'SELL'),
    makePoiMarker(buyPoi, 'BUY')
  ].filter(Boolean);

  const zones = [
    {
      key: 'bsl',
      name: activeMode === 'MAJOR' ? 'PDH (High Harian)' : 'Range High (BSL)',
      priceText: fmtUsd(high),
      diffText: valid && Number.isFinite(price) ? fmtSignedUsd(high - price) : '',
      hint: activeMode === 'M15' && isBslSwept
        ? `${topName} ${fmtUsd(high)} sudah tersapu — pantau konfirmasi arah`
        : `${topName} ${fmtUsd(high)}${valid && Number.isFinite(price) ? ` (${fmtSignedUsd(high - price)})` : ''} · Target likuiditas atas`
    },
    {
      key: 'ote_sell',
      name: 'OTE Sell (62%–79%)',
      priceText: valid ? `${fmtUsd(oteSellLow)}–${fmtUsd(oteSellHigh)}` : '—',
      diffText: '',
      hint: valid ? `OTE Sell ${fmtUsd(oteSellLow)}–${fmtUsd(oteSellHigh)} · Area optimal Supply Premium` : 'Menunggu range'
    },
    {
      key: 'eq',
      name: 'No-Trade EQ (50%)',
      priceText: valid ? `${fmtUsd(noTradeLow)}–${fmtUsd(noTradeHigh)}` : '—',
      diffText: valid && Number.isFinite(price) ? fmtSignedUsd(mid - price) : '',
      hint: valid ? `No-Trade EQ ${fmtUsd(noTradeLow)}–${fmtUsd(noTradeHigh)} · Hindari entry di tengah range` : 'Menunggu range'
    },
    {
      key: 'ote_buy',
      name: 'OTE Buy (21%–38%)',
      priceText: valid ? `${fmtUsd(oteBuyLow)}–${fmtUsd(oteBuyHigh)}` : '—',
      diffText: '',
      hint: valid ? `OTE Buy ${fmtUsd(oteBuyLow)}–${fmtUsd(oteBuyHigh)} · Area optimal Demand Diskon` : 'Menunggu range'
    },
    {
      key: 'ssl',
      name: activeMode === 'MAJOR' ? 'PDL (Low Harian)' : 'Range Low (SSL)',
      priceText: fmtUsd(low),
      diffText: valid && Number.isFinite(price) ? fmtSignedUsd(low - price) : '',
      hint: activeMode === 'M15' && isSslSwept
        ? `${botName} ${fmtUsd(low)} sudah tersapu — pantau konfirmasi arah`
        : `${botName} ${fmtUsd(low)}${valid && Number.isFinite(price) ? ` (${fmtSignedUsd(low - price)})` : ''} · Target likuiditas bawah`
    }
  ];

  return {
    valid,
    mode: activeMode,
    hasMajor,
    topName,
    botName,
    low: valid ? Number(low.toFixed(2)) : NaN,
    high: valid ? Number(high.toFixed(2)) : NaN,
    eq: Number.isFinite(mid) ? Number(mid.toFixed(2)) : NaN,
    livePrice: Number.isFinite(price) ? Number(price.toFixed(2)) : NaN,
    rawPct: Number(rawPct.toFixed(1)),
    pct,
    zoneKey,
    zoneLabel,
    zoneTone,
    isBslSwept: activeMode === 'M15' && isBslSwept,
    isSslSwept: activeMode === 'M15' && isSslSwept,
    coords: {
      topY,
      botY,
      eqY: pctToY(50),
      liveY,
      oteSellTopY: pctToY(79),
      oteSellBotY: pctToY(62),
      noTradeTopY: pctToY(52.5),
      noTradeBotY: pctToY(47.5),
      oteBuyTopY: pctToY(38),
      oteBuyBotY: pctToY(21)
    },
    poiMarkers,
    zones
  };
}

/**
 * Render clean interactive SVG Vertical Price Ladder for Dealing Range.
 */
export function renderDealingLadderSvg(model, selectedZone = null) {
  const m = model || computeDealingLadderModel();
  const c = m.coords;
  const shaftX = 10;
  const shaftW = 176;
  const rightX = shaftX + shaftW; // 186
  const rulerX = 192;
  const pinTagX = 198;
  const pinTagW = 114;
  const liveTagY = clamp(c.liveY, 15, 207);

  const isSel = key => selectedZone === key;
  const premiumH = Math.max(0, c.noTradeTopY - c.topY);
  const noTradeH = Math.max(10, c.noTradeBotY - c.noTradeTopY);
  const discountH = Math.max(0, c.botY - c.noTradeBotY);
  const oteSellH = Math.max(8, c.oteSellBotY - c.oteSellTopY);
  const oteBuyH = Math.max(8, c.oteBuyBotY - c.oteBuyTopY);

  // Smart collision avoidance for ruler reference labels vs 24px live price tag
  const nearLive = y => Math.abs(y - liveTagY) < 23;

  const poiSvg = (m.poiMarkers || []).map(p => {
    const cls = p.side === 'BUY' ? 'dl-poi--buy' : 'dl-poi--sell';
    const labelText = `${p.side} ${p.kind}`;
    return `
      <g class="dl-poi ${cls}">
        <rect class="dl-poi-band" x="${shaftX + 4}" y="${p.bandTop}" width="${shaftW - 8}" height="${p.bandHeight}" rx="3" />
        <line class="dl-poi-ce" x1="${shaftX + 4}" y1="${p.y}" x2="${rightX - 4}" y2="${p.y}" />
        <circle class="dl-poi-dot" cx="${shaftX + 10}" cy="${p.y}" r="3" />
        <text class="dl-poi-tag" x="${shaftX + 17}" y="${p.y + 3}">${escSvg(labelText)}</text>
      </g>
    `;
  }).join('');

  const topPriceLabel = m.valid ? fmtUsd(m.high) : '—';
  const eqPriceLabel = m.valid ? fmtUsd(m.eq) : '—';
  const botPriceLabel = m.valid ? fmtUsd(m.low) : '—';
  const liveText = Number.isFinite(m.livePrice) ? fmtUsd(m.livePrice) : '—';

  return `
    <svg class="dealing-ladder-svg" viewBox="0 0 320 222" role="img" aria-label="Peta Dealing Range ${escSvg(m.mode)} posisi ${m.pct}%">
      <defs>
        <pattern id="dl-notrade-hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" class="dl-hatch-line" />
        </pattern>
      </defs>

      <!-- Main vertical range shaft -->
      <rect class="dl-shaft-bg" x="${shaftX}" y="${c.topY}" width="${shaftW}" height="${c.botY - c.topY}" rx="10" />

      <!-- Premium / Discount base tints -->
      <rect class="dl-zone-premium" x="${shaftX}" y="${c.topY}" width="${shaftW}" height="${premiumH}" rx="10" />
      <rect class="dl-zone-discount" x="${shaftX}" y="${c.noTradeBotY}" width="${shaftW}" height="${discountH}" rx="10" />

      <!-- OTE Sell (62-79%) & OTE Buy (21-38%) clickable bands (labels right-aligned) -->
      <g class="dl-hit-zone ${isSel('ote_sell') ? 'is-selected' : ''}" data-dr-zone="ote_sell" role="button" tabindex="0" aria-label="OTE Sell 62 sampai 79 persen">
        <rect class="dl-ote-sell" x="${shaftX + 3}" y="${c.oteSellTopY}" width="${shaftW - 6}" height="${oteSellH}" rx="5" />
        <text class="dl-band-label dl-band-label--sell" x="${rightX - 8}" y="${c.oteSellTopY + (oteSellH / 2) + 3}" text-anchor="end">OTE Sell</text>
      </g>

      <g class="dl-hit-zone ${isSel('ote_buy') ? 'is-selected' : ''}" data-dr-zone="ote_buy" role="button" tabindex="0" aria-label="OTE Buy 21 sampai 38 persen">
        <rect class="dl-ote-buy" x="${shaftX + 3}" y="${c.oteBuyTopY}" width="${shaftW - 6}" height="${oteBuyH}" rx="5" />
        <text class="dl-band-label dl-band-label--buy" x="${rightX - 8}" y="${c.oteBuyTopY + (oteBuyH / 2) + 3}" text-anchor="end">OTE Buy</text>
      </g>

      <!-- No-Trade EQ 50% hatched strip (label right-aligned so left-side POI tags never collide) -->
      <g class="dl-hit-zone ${isSel('eq') ? 'is-selected' : ''}" data-dr-zone="eq" role="button" tabindex="0" aria-label="Zona Equilibrium 50 persen No-Trade">
        <rect class="dl-notrade-fill" x="${shaftX + 1}" y="${c.noTradeTopY}" width="${shaftW - 2}" height="${noTradeH}" />
        <rect fill="url(#dl-notrade-hatch)" x="${shaftX + 1}" y="${c.noTradeTopY}" width="${shaftW - 2}" height="${noTradeH}" />
        <line class="dl-eq-line" x1="${shaftX}" y1="${c.eqY}" x2="${rightX + 6}" y2="${c.eqY}" />
        <text class="dl-eq-inner-label" x="${rightX - 8}" y="${c.eqY + 3}" text-anchor="end">No-Trade EQ</text>
      </g>

      <!-- Active POI markers inside ladder (left-aligned tags) -->
      ${poiSvg}

      <!-- Top BSL / PDH interactive boundary -->
      <g class="dl-hit-zone ${isSel('bsl') ? 'is-selected' : ''}" data-dr-zone="bsl" role="button" tabindex="0" aria-label="${escSvg(m.topName)} ${escSvg(topPriceLabel)}">
        <rect class="dl-edge-hit" x="${shaftX}" y="${c.topY - 12}" width="${rightX - shaftX + 124}" height="24" />
        <line class="dl-bound-line dl-bound-line--high ${m.isBslSwept ? 'is-swept' : ''}" x1="${shaftX}" y1="${c.topY}" x2="${rightX + 6}" y2="${c.topY}" />
        <text class="dl-bound-tag dl-bound-tag--high" x="${shaftX + 8}" y="${c.topY - 6}">${escSvg(m.topName)}${m.isBslSwept ? ' · Swept' : ''}</text>
      </g>

      <!-- Bottom SSL / PDL interactive boundary -->
      <g class="dl-hit-zone ${isSel('ssl') ? 'is-selected' : ''}" data-dr-zone="ssl" role="button" tabindex="0" aria-label="${escSvg(m.botName)} ${escSvg(botPriceLabel)}">
        <rect class="dl-edge-hit" x="${shaftX}" y="${c.botY - 10}" width="${rightX - shaftX + 124}" height="24" />
        <line class="dl-bound-line dl-bound-line--low ${m.isSslSwept ? 'is-swept' : ''}" x1="${shaftX}" y1="${c.botY}" x2="${rightX + 6}" y2="${c.botY}" />
        <text class="dl-bound-tag dl-bound-tag--low" x="${shaftX + 8}" y="${c.botY + 13}">${escSvg(m.botName)}${m.isSslSwept ? ' · Swept' : ''}</text>
      </g>

      <!-- Outer shaft border -->
      <rect class="dl-shaft-border" x="${shaftX}" y="${c.topY}" width="${shaftW}" height="${c.botY - c.topY}" rx="10" />

      <!-- Right price axis reference labels -->
      <text class="dl-price-ref dl-price-ref--high ${nearLive(c.topY) ? 'is-faded' : ''}" x="${rulerX + 6}" y="${c.topY + 4}">${escSvg(topPriceLabel)}</text>
      <text class="dl-price-ref dl-price-ref--eq ${nearLive(c.eqY) ? 'is-faded' : ''}" x="${rulerX + 6}" y="${c.eqY + 4}">${escSvg(eqPriceLabel)}</text>
      <text class="dl-price-ref dl-price-ref--low ${nearLive(c.botY) ? 'is-faded' : ''}" x="${rulerX + 6}" y="${c.botY + 4}">${escSvg(botPriceLabel)}</text>

      <!-- Live Price Pin & Pointer Tag -->
      <g class="dl-live-pin dl-live-pin--${m.zoneTone}">
        <line class="dl-live-line" x1="${shaftX + 2}" y1="${c.liveY}" x2="${pinTagX - 4}" y2="${c.liveY}" />
        <circle class="dl-live-dot" cx="${rightX}" cy="${c.liveY}" r="4.5" />
        <polygon class="dl-live-arrow" points="${pinTagX - 5},${liveTagY} ${pinTagX + 1},${liveTagY - 4.5} ${pinTagX + 1},${liveTagY + 4.5}" />
        <rect class="dl-live-tag" x="${pinTagX}" y="${liveTagY - 12}" width="${pinTagW}" height="24" rx="6" />
        <text class="dl-live-val" x="${pinTagX + 8}" y="${liveTagY + 4}">${escSvg(liveText)}</text>
        <text class="dl-live-pct" x="${pinTagX + pinTagW - 7}" y="${liveTagY + 4}" text-anchor="end">${m.pct}%</text>
      </g>
    </svg>
  `.trim();
}

if (typeof window !== 'undefined') {
  window.AmyMappingVisuals = {
    computeBiasCompassModel,
    renderBiasCompassSvg,
    computeDealingLadderModel,
    renderDealingLadderSvg
  };
}
