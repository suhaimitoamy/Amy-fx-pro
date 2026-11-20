import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveM15Direction,
  formatPdlPdhRange,
  resolveSsotTelemetry,
  formatTp1Subtitle,
  selectScalperDualLayerPoi,
  evaluateScalperPoiVerdict
} from '../app/src/main/assets/apps/mapping/js/ict-workspace/mapping-accuracy.js';
import {
  resolveGoldSessionState,
  sessionCountdownPill
} from '../app/src/main/assets/apps/mapping/js/engine/market-session-clock.js';
import {
  keyLevelHistory,
  keyLevels,
  analyzeAmy,
  dashboardEngine
} from '../lib/scalper-engine/amy-ict.mjs';
import {
  goldSession,
  goldSessionDetail
} from '../lib/scalper-engine/market-context.mjs';

function buildUniformBars(startUnixSec, count, stepSec, basePrice = 3550) {
  const bars = [];
  for (let i = 0; i < count; i += 1) {
    const openTime = startUnixSec + i * stepSec;
    const wave = Math.sin(i / 5) * 4;
    const open = +(basePrice + wave).toFixed(2);
    const close = +(open + (i % 2 === 0 ? 1.4 : -0.9)).toFixed(2);
    const high = +(Math.max(open, close) + 2.2).toFixed(2);
    const low = +(Math.min(open, close) - 2.1).toFixed(2);
    bars.push({
      open_time: openTime,
      close_time: openTime + stepSec,
      open,
      high,
      low,
      close,
      is_closed: true
    });
  }
  return bars;
}

test('1. SSOT Telemetry prevents dual-engine contradiction when NextGen opposes backend M15', () => {
  const ctx = {
    price: 3580.25,
    m15: {
      structure: 'BULLISH',
      control: 'BUYER',
      lastBreak: { type: 'MSS', side: 'BUY', level: 3565.77 }
    },
    amy: {
      dashboard: {
        biasDir: 1,
        bsl: 3602.5,
        ssl: 3543.08,
        dolDir: 1,
        dolTarget: 3602.5,
        sweepStatus: 0
      },
      levels: {
        pdh: 3610.0,
        pdl: 3530.0,
        asiaHigh: 3596.4,
        asiaLow: 3555.2
      }
    }
  };
  // Simulated opposing NextGen M15 state (which previously leaked Bear BOS & SSL into Hero)
  const conflictingNextGen = {
    tf: 'M15',
    structure: { lastEvent: { label: 'BOS', direction: 'BEARISH', level: 3591.41 } },
    dol: {
      dir: -1,
      poolsBelow: [{ name: 'SSL', level: 3543.08 }],
      poolsAbove: [{ name: 'BSL', level: 3602.5 }]
    }
  };

  assert.equal(resolveM15Direction(ctx), 1);
  const tel = resolveSsotTelemetry(ctx, conflictingNextGen, 3580.25);

  assert.equal(tel.breakDir, 1);
  assert.match(tel.breakText, /^MSS Bull @ \$3565\.77$/);
  assert.equal(tel.breakTone, 'is-bull');
  assert.equal(tel.dolSide, 'BUY');
  assert.match(tel.dolText, /^↑ Asia High \$3596\.40 \(\+\$16\.15\)$/);
  assert.equal(tel.dolTone, 'is-bull');
});

test('1b. SSOT Telemetry ignores non-M15 NextGen state (e.g. when user views H1 or M5 chart)', () => {
  const ctx = {
    price: 3580.0,
    m15: { structure: 'BEARISH', control: 'SELLER' },
    amy: {
      dashboard: { biasDir: -1, ssl: 3550.0, bsl: 3610.0 },
      levels: { pdl: 3540.0, pdh: 3620.0 }
    }
  };
  const h1NextGen = {
    tf: 'H1',
    structure: { lastEvent: { label: 'BOS', direction: 'BULLISH', level: 3570.0 } },
    liquidity: { latestSweep: { pool: 'H1 SSL', level: 3545.0, reactionSide: 'BUY' } }
  };

  const tel = resolveSsotTelemetry(ctx, h1NextGen, 3580.0);
  assert.equal(tel.breakText, 'Menunggu Break');
  assert.equal(tel.sweepText, 'Belum ada sweep');
  assert.equal(tel.dolSide, 'SELL');
  assert.match(tel.dolText, /^↓ SSL M15 \$3550\.00/);
});

test('2. KeyLevels M5/M15 fallback computes NY Midnight Open and Asia High/Low when M1 is absent', () => {
  // 2026-04-15 is EDT (UTC-4):
  // 2026-04-14 20:00 NY = 2026-04-15T00:00:00Z (Asia starts)
  // 2026-04-15 00:00 NY = 2026-04-15T04:00:00Z (Midnight Open, Asia locks)
  // 2026-04-15 03:30 NY = 2026-04-15T07:30:00Z (London Killzone)
  const asiaStartUtc = Math.floor(Date.parse('2026-04-15T00:00:00Z') / 1000);
  const m5Bars = buildUniformBars(asiaStartUtc, 90, 300, 3560); // 7.5 hours of M5 bars -> ends 07:30Z
  // Stamp known extremes inside Asia (bars 0..47) and known open at Midnight Open (bar 48 = 04:00Z)
  m5Bars[10].high = 3599.5;
  m5Bars[22].low = 3521.25;
  m5Bars[48].open = 3568.8;
  m5Bars[48].high = Math.max(m5Bars[48].high, 3569.5);
  m5Bars[48].low = Math.min(m5Bars[48].low, 3567.0);

  const m15Bars = buildUniformBars(asiaStartUtc, 30, 900, 3560);
  const nowSec = m5Bars[m5Bars.length - 1].close_time + 60; // 1 min after last closed M5 bar

  const hist = keyLevelHistory(m5Bars);
  assert.equal(hist.length, m5Bars.length);
  const lastSnap = hist[hist.length - 1];
  assert.equal(lastSnap.midnightStatus, 'FIXED');
  assert.equal(lastSnap.midnightOpen, 3568.8);
  assert.equal(lastSnap.asiaStatus, 'LOCKED');
  assert.equal(lastSnap.asiaHigh, 3599.5);
  assert.equal(lastSnap.asiaLow, 3521.25);

  // KeyLevels with empty m1 falls back cleanly to m5
  const levelsFromM5 = keyLevels({ m1: [], m5: m5Bars, m15: m15Bars, d1: [], nowSeconds: nowSec });
  assert.equal(levelsFromM5.midnightOpen, 3568.8);
  assert.equal(levelsFromM5.midnightStatus, 'FIXED');
  assert.equal(levelsFromM5.midnightSource, 'M5');
  assert.equal(levelsFromM5.asiaHigh, 3599.5);
  assert.equal(levelsFromM5.asiaLow, 3521.25);
  assert.equal(levelsFromM5.asiaStatus, 'LOCKED');
  assert.equal(levelsFromM5.asiaSource, 'M5');

  // KeyLevels with empty m1 and m5 falls back cleanly to m15
  m15Bars[16].open = 3571.1; // 16 * 15m = 4h -> 04:00Z = 00:00 NY
  m15Bars[16].high = Math.max(m15Bars[16].high, 3572.0);
  m15Bars[16].low = Math.min(m15Bars[16].low, 3570.0);
  const levelsFromM15 = keyLevels({ m1: [], m5: [], m15: m15Bars, d1: [], nowSeconds: nowSec });
  assert.equal(levelsFromM15.midnightOpen, 3571.1);
  assert.equal(levelsFromM15.midnightSource, 'M15');
  assert.equal(levelsFromM15.asiaStatus, 'LOCKED');
  assert.equal(levelsFromM15.asiaSource, 'M15');
});

test('2b. analyzeAmy exposes H1 in chartCandles alongside M15 and M5', () => {
  const startUtc = Math.floor(Date.parse('2026-04-10T00:00:00Z') / 1000);
  const h1 = buildUniformBars(startUtc, 120, 3600, 3540);
  const m15 = buildUniformBars(startUtc + 100 * 3600, 80, 900, 3550);
  const m5 = buildUniformBars(startUtc + 115 * 3600, 60, 300, 3555);
  const nowSec = m5[m5.length - 1].close_time + 30;

  const res = analyzeAmy({ h1, m15, m5, m1: [], d1: [], nowSeconds: nowSec });
  assert.equal(res.chartCandles.H1.length, 120);
  assert.equal(res.chartCandles.M15.length, 80);
  assert.equal(res.chartCandles.M5.length, 60);
});

test('3. formatPdlPdhRange always renders Low – High with accurate EQ', () => {
  const normal = formatPdlPdhRange(3510.2, 3590.8);
  assert.equal(normal.rangeText, '$3510.20 – $3590.80');
  assert.equal(normal.eqText, '$3550.50');

  const swapped = formatPdlPdhRange(3590.8, 3510.2);
  assert.equal(swapped.rangeText, '$3510.20 – $3590.80');
  assert.equal(swapped.eqText, '$3550.50');

  const missing = formatPdlPdhRange(null, 3590.8);
  assert.equal(missing.rangeText, 'Belum tersedia');
  assert.equal(missing.eqText, '—');
});

test('4. Honest TP1 subtitle & strict Scalper POI Verdict grading', () => {
  const synthSub = formatTp1Subtitle({ v: 3592.0, synthetic: true }, { v: 3610.0 }, 1.6);
  assert.match(synthSub, /Proyeksi R:R 1:1\.6 \(Non-Struktural\)/);
  assert.match(synthSub, /DOL \$3610\.00/);

  const realSub = formatTp1Subtitle({ v: 3596.4, name: 'Asia High', synthetic: false }, null, 2.1);
  assert.equal(realSub, 'DOL Asia High (1:2.1)');

  // Ideal 5/5 A+ setup with real structural TP1 and SL <= $7.5
  const ideal = evaluateScalperPoiVerdict({
    side: 'BUY',
    h1Dir: 1,
    m15Dir: 1,
    m5Dir: 1,
    zone: { low: 3570, high: 3576, inRightHalf: true, inOte: true, fresh: true, kind: 'FVG' },
    livePrice: 3577.5,
    slGuard: { dist: 5.2, status: 'ideal' },
    rr1: 2.0,
    tp1: { v: 3588, name: 'BSL M15', synthetic: false }
  });
  assert.equal(ideal.score, 5);
  assert.equal(ideal.cls, 'is-ready');
  assert.match(ideal.grade, /GRADE A\+ · SIAP EKSEKUSI/);

  // 5/5 setup when live price is $14.3 above BUY zone -> standby TUNGGU PULLBACK (not SIAP EKSEKUSI)
  const pullbackAPlus = evaluateScalperPoiVerdict({
    side: 'BUY',
    h1Dir: 1,
    m15Dir: 1,
    m5Dir: 1,
    zone: { low: 3555.93, high: 3566.68, inRightHalf: true, inOte: false, fresh: true, kind: 'FVG' },
    livePrice: 3581.02,
    slGuard: { dist: 5.78, status: 'ideal' },
    rr1: 1.7,
    tp1: { v: 3571.03, name: 'EQ Leg Aktif', synthetic: false }
  });
  assert.equal(pullbackAPlus.score, 5);
  assert.equal(pullbackAPlus.cls, 'is-wait');
  assert.match(pullbackAPlus.grade, /GRADE A\+ · TUNGGU PULLBACK \(-\$14\.3\)/);

  // Synthetic TP1 cannot pass check #5 as green DOL -> drops from 5/5 to 4/5 with warning
  const synthVerdict = evaluateScalperPoiVerdict({
    side: 'BUY',
    h1Dir: 1,
    m15Dir: 1,
    m5Dir: 1,
    zone: { low: 3570, high: 3576, inRightHalf: true, inOte: true, fresh: true, kind: 'FVG' },
    livePrice: 3577.5,
    slGuard: { dist: 5.2, status: 'ideal' },
    rr1: 1.6,
    tp1: { v: 3585, synthetic: true }
  });
  assert.equal(synthVerdict.score, 4);
  assert.equal(synthVerdict.checks[4].ok, false);
  assert.equal(synthVerdict.checks[4].warn, true);
  assert.match(synthVerdict.checks[4].label, /^Proyeksi 1:1\.6$/);

  // Wide SL ($8.8 > $7.5) is flagged as SL Lebar, not green
  const wideSl = evaluateScalperPoiVerdict({
    side: 'BUY',
    h1Dir: 1,
    m15Dir: 1,
    m5Dir: 1,
    zone: { low: 3570, high: 3576, inRightHalf: true, fresh: true, kind: 'OB' },
    livePrice: 3577.0,
    slGuard: { dist: 8.8, status: 'wide' },
    rr1: 1.8,
    tp1: { v: 3592, name: 'PDH', synthetic: false }
  });
  assert.equal(wideSl.checks[4].ok, false);
  assert.match(wideSl.checks[4].label, /SL Lebar \(\$8\.8\)/);

  // Far zone (> $18 away) is capped to PANTAU JAUH
  const farZone = evaluateScalperPoiVerdict({
    side: 'SELL',
    h1Dir: -1,
    m15Dir: -1,
    m5Dir: -1,
    zone: { low: 3620, high: 3628, inRightHalf: true, fresh: true, kind: 'OB' },
    livePrice: 3590.0,
    slGuard: { dist: 5.0, status: 'ideal' },
    rr1: 2.2,
    tp1: { v: 3570, name: 'SSL', synthetic: false }
  });
  assert.equal(farZone.isZoneFar, true);
  assert.match(farZone.grade, /PANTAU JAUH/);

  // Counter-M15 without M5 MSS is capped to WAIT (never Grade A)
  const counterM15 = evaluateScalperPoiVerdict({
    side: 'SELL',
    h1Dir: -1,
    m15Dir: 1,
    m5Dir: 1,
    zone: { low: 3585, high: 3590, inRightHalf: true, fresh: true, kind: 'FVG' },
    livePrice: 3584.0,
    slGuard: { dist: 4.5, status: 'ideal' },
    rr1: 2.0,
    tp1: { v: 3570, name: 'SSL', synthetic: false }
  });
  assert.match(counterM15.grade, /WAIT · COUNTER M15/);
});

test('5. Backend goldSessionDetail and frontend resolveGoldSessionState match 100% across all ICT windows', () => {
  // Using April 2026 (EDT = UTC-4)
  const cases = [
    { name: 'Saturday Weekend', iso: '2026-04-18T14:00:00Z', expectedCode: 'PASAR TUTUP', isClosed: true, isKillzone: false },
    { name: 'Friday 17:15 NY Weekend Start', iso: '2026-04-17T21:15:00Z', expectedCode: 'PASAR TUTUP', isClosed: true, isKillzone: false },
    { name: 'Daily Rollover 17:30 NY (Wed)', iso: '2026-04-15T21:30:00Z', expectedCode: 'PASAR TUTUP', isClosed: true, isKillzone: false },
    { name: 'London Killzone 03:15 NY', iso: '2026-04-15T07:15:00Z', expectedCode: 'LONDON', isClosed: false, isKillzone: true },
    { name: 'London-NY Pre-Open 06:00 NY', iso: '2026-04-15T10:00:00Z', expectedCode: 'LONDON-NY PRE-OPEN', isClosed: false, isKillzone: false },
    { name: 'NY Killzone 08:30 NY', iso: '2026-04-15T12:30:00Z', expectedCode: 'NEW YORK', isClosed: false, isKillzone: true },
    { name: 'NY Afternoon 13:30 NY', iso: '2026-04-15T17:30:00Z', expectedCode: 'NEW YORK SIANG', isClosed: false, isKillzone: false },
    { name: 'Asia Session 21:00 NY', iso: '2026-04-16T01:00:00Z', expectedCode: 'ASIA', isClosed: false, isKillzone: false },
    { name: 'Transition 01:00 NY', iso: '2026-04-15T05:00:00Z', expectedCode: 'TRANSISI', isClosed: false, isKillzone: false }
  ];

  for (const tc of cases) {
    const ms = Date.parse(tc.iso);
    const sec = Math.floor(ms / 1000);
    const backend = goldSessionDetail(sec);
    const frontend = resolveGoldSessionState(ms);
    const pill = sessionCountdownPill(ms);

    assert.equal(backend.code, tc.expectedCode, `backend code mismatch for ${tc.name}`);
    assert.equal(goldSession(sec), tc.expectedCode, `goldSession mismatch for ${tc.name}`);
    assert.equal(frontend.code, backend.code, `frontend/backend code mismatch for ${tc.name}`);
    assert.equal(frontend.label, backend.label, `frontend/backend label mismatch for ${tc.name}`);
    assert.equal(frontend.isClosed, tc.isClosed, `isClosed mismatch for ${tc.name}`);
    assert.equal(frontend.isKillzone, tc.isKillzone, `isKillzone mismatch for ${tc.name}`);
    assert.equal(pill.code, tc.expectedCode, `pill code mismatch for ${tc.name}`);
    assert.ok(pill.text.length > 0 && !pill.text.includes('['), `pill text clean for ${tc.name}`);
  }
});

test('6. Dual-Layer Scalper POI picks close M5/M15 continuation over distant deep EQ zone and exposes M15 backup', () => {
  const livePrice = 3594.34;
  const res = selectScalperDualLayerPoi({
    side: 'BUY',
    livePrice,
    m15Dir: 1,
    eqVal: 3555.35, // deep macro EQ
    activeLeg: { trend: 'BEAR', high: 3626.87, low: 3515.19, eq: 3571.03 }, // opposing leg must be ignored for BUY!
    impulseHigh: 3595.51,
    impulseLow: 3566.72,
    m15Fvgs: [
      { lo: 3555.93, hi: 3566.68, ce: 3561.31, tested: false }, // deep old zone (-$27.66)
      { lo: 3577.07, hi: 3580.89, ce: 3578.98, tested: false }  // fresh M15 FVG (-$13.45)
    ],
    m5Fvgs: [
      { lo: 3584.87, hi: 3591.70, ce: 3588.28, tested: false }  // fresh M5 refinement FVG (-$2.64)
    ]
  });

  assert.ok(res.primary, 'must return primary POI');
  assert.equal(res.primary.tf, 'M5');
  assert.equal(res.primary.low, 3584.87);
  assert.equal(res.primary.high, 3591.70);
  assert.ok(res.primary.dist < 3.0, 'primary distance should be actionable scalper reach');

  assert.ok(res.backup, 'must return M15 backup POI');
  assert.equal(res.backup.tf, 'M15');
  assert.equal(res.backup.low, 3577.07);
  assert.equal(res.backup.high, 3580.89);

  // When M15 and M5 are at similar close distance, M15 structural preference still wins
  const tieRes = selectScalperDualLayerPoi({
    side: 'BUY',
    livePrice: 3585.0,
    m15Dir: 1,
    eqVal: 3582.0,
    m15Fvgs: [{ lo: 3578.0, hi: 3581.5, ce: 3579.75, tested: false }], // $3.5 away
    m5Fvgs: [{ lo: 3579.0, hi: 3582.0, ce: 3580.5, tested: false }]    // $3.0 away
  });
  assert.equal(tieRes.primary.tf, 'M15');
});

test('7. dashboardEngine never produces zero-height Order Block on marubozu displacement candles', () => {
  const start = Math.floor(Date.parse('2026-04-15T08:00:00Z') / 1000);
  const bars = [];
  for (let i = 0; i < 25; i += 1) {
    const t = start + i * 900;
    const isDisp = i === 24;
    const open = isDisp ? 3580.89 : 3570 + i * 0.4;
    const close = isDisp ? 3594.34 : open + (i === 22 ? -0.6 : 0.5);
    const low = isDisp ? open : Math.min(open, close) - 0.5; // marubozu: low === open on displacement bar
    const high = Math.max(open, close) + 0.5;
    bars.push({ open_time: t, close_time: t + 900, open, high, low, close, is_closed: true });
  }
  const eng = dashboardEngine(bars);
  assert.ok(eng.zones.bullOb, 'bullOb should be created on strong displacement');
  assert.ok(eng.zones.bullOb.high > eng.zones.bullOb.low, 'bullOb must never be zero-height');
});
