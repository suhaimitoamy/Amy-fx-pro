import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBiasCompassModel,
  renderBiasCompassSvg,
  computeDealingLadderModel,
  renderDealingLadderSvg
} from '../app/src/main/assets/apps/mapping/js/ict-workspace/mapping-visuals.js';

test('computeBiasCompassModel: weights H1 (50) + M15 (35) + M5 (15) accurately across bullish, bearish, and conflict states', () => {
  const fullBull = computeBiasCompassModel({
    h1Dir: 1,
    m15Dir: 1,
    m5Dir: 1,
    adrPct: 64,
    adrText: '$82.0 / $128.0 (64% · Sehat)'
  });
  assert.equal(fullBull.score, 100);
  assert.equal(fullBull.tone, 'bull');
  assert.equal(fullBull.needleAngle, 78);
  assert.equal(fullBull.alignmentLabel, 'Selaras Bullish · 3/3 TF');
  assert.equal(fullBull.adr.state, 'fresh');

  const h1M15BullM5Neutral = computeBiasCompassModel({
    h1Dir: 1,
    m15Dir: 1,
    m5Dir: 0,
    adrPct: 98
  });
  assert.equal(h1M15BullM5Neutral.score, 85);
  assert.equal(h1M15BullM5Neutral.tone, 'bull');
  assert.equal(h1M15BullM5Neutral.adr.state, 'warm');

  const conflict = computeBiasCompassModel({
    h1Dir: -1,
    m15Dir: 1,
    m5Dir: 1,
    adrPct: 125
  });
  assert.equal(conflict.score, 0);
  assert.equal(conflict.tone, 'neutral');
  assert.equal(conflict.alignmentLabel, 'Tarik-Menarik · H1 vs M15');
  assert.equal(conflict.adr.state, 'exhausted');

  const fullBear = computeBiasCompassModel({ h1Dir: -1, m15Dir: -1, m5Dir: -1 });
  assert.equal(fullBear.score, -100);
  assert.equal(fullBear.needleAngle, -78);
  assert.equal(fullBear.tone, 'bear');
});

test('renderBiasCompassSvg: outputs valid SVG with interactive H1/M15/M5 targets and needle rotation', () => {
  const model = computeBiasCompassModel({
    h1Dir: 1,
    m15Dir: 1,
    m5Dir: 0,
    h1Desc: 'MSS Bull',
    m15Desc: 'Buyer aktif',
    m5Desc: 'Choppy'
  });
  const svg = renderBiasCompassSvg(model, 'H1');
  assert.match(svg, /<svg class="bias-compass-svg"/);
  assert.match(svg, /data-bc-tf="H1"/);
  assert.match(svg, /data-bc-tf="M15"/);
  assert.match(svg, /data-bc-tf="M5"/);
  assert.match(svg, /\+85/);
  assert.match(svg, /rotate\(66\.3deg\)/);
});

test('computeDealingLadderModel: maps M15 and PDL-PDH modes, OTE zones, POI markers, and safe clamping', () => {
  const m15 = computeDealingLadderModel({
    rLow: 3600,
    rHigh: 3700,
    eq: 3650,
    livePrice: 3670,
    pdl: 3550,
    pdh: 3750,
    mode: 'M15',
    buyPoi: { side: 'BUY', kind: 'FVG', tf: 'M15', low: 3630, high: 3638, ce: 3634 },
    sellPoi: { side: 'SELL', kind: 'OB', tf: 'M15', low: 3682, high: 3690, ce: 3686 }
  });
  assert.equal(m15.valid, true);
  assert.equal(m15.mode, 'M15');
  assert.equal(m15.pct, 70);
  assert.equal(m15.zoneKey, 'ote_sell');
  assert.equal(m15.poiMarkers.length, 2);
  assert.ok(m15.coords.liveY < m15.coords.eqY, 'Premium live price must sit above EQ on vertical ladder');
  assert.ok(m15.coords.topY < m15.coords.botY, 'BSL topY must sit above SSL botY');

  const major = computeDealingLadderModel({
    rLow: 3600,
    rHigh: 3700,
    eq: 3650,
    livePrice: 3650,
    pdl: 3550,
    pdh: 3750,
    mode: 'MAJOR'
  });
  assert.equal(major.mode, 'MAJOR');
  assert.equal(major.topName, 'PDH');
  assert.equal(major.botName, 'PDL');
  assert.equal(major.pct, 50);
  assert.equal(major.zoneKey, 'eq');

  // Extreme breakout above high stays safely clamped within SVG viewport
  const breakout = computeDealingLadderModel({
    rLow: 3600,
    rHigh: 3700,
    livePrice: 3740,
    isBullBreakout: true
  });
  assert.equal(breakout.pct, 100);
  assert.ok(breakout.coords.liveY >= 10 && breakout.coords.liveY <= 210);
});

test('renderDealingLadderSvg: outputs vertical ladder with OTE bands, hatched No-Trade EQ, POI tags, and live price pin', () => {
  const model = computeDealingLadderModel({
    rLow: 3617.16,
    rHigh: 3680.12,
    eq: 3648.64,
    livePrice: 3654.41,
    pdl: 3556.04,
    pdh: 3684.87,
    buyPoi: { side: 'BUY', kind: 'FVG', tf: 'M15', low: 3645.13, high: 3650.46, ce: 3647.80 }
  });
  const svg = renderDealingLadderSvg(model, 'bsl');
  assert.match(svg, /<svg class="dealing-ladder-svg"/);
  assert.match(svg, /data-dr-zone="bsl"/);
  assert.match(svg, /data-dr-zone="ote_sell"/);
  assert.match(svg, /data-dr-zone="eq"/);
  assert.match(svg, /data-dr-zone="ote_buy"/);
  assert.match(svg, /data-dr-zone="ssl"/);
  assert.match(svg, /\$3654\.41/);
  assert.match(svg, /BUY FVG/);
});
