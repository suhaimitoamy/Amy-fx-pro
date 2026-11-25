import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYahooChartResult } from '../api/macro-snapshot.js';

await import('../apps/market-intel/kompas-engine.js');
const kompas = globalThis.AmyKompasEngine;

test('parseYahooChartResult parses DXY and US10Y bps accurately and never fabricates empty payloads', () => {
  const dxyRaw = {
    chart: {
      result: [{
        meta: {
          symbol: 'DX-Y.NYB',
          regularMarketPrice: 104.25,
          chartPreviousClose: 103.80,
          regularMarketTime: 1732530000,
          marketState: 'REGULAR'
        },
        indicators: {
          quote: [{ close: [103.4, 103.6, 103.8, 104.25] }]
        }
      }]
    }
  };
  const dxy = parseYahooChartResult(dxyRaw, 'dxy');
  assert.equal(dxy.symbol, 'DX-Y.NYB');
  assert.equal(dxy.price, 104.25);
  assert.equal(dxy.prevClose, 103.8);
  assert.equal(dxy.changePct, 0.43);
  assert.equal(dxy.sparkline.length, 4);

  const tnxRaw = {
    chart: {
      result: [{
        meta: {
          symbol: '^TNX',
          regularMarketPrice: 4.904,
          previousClose: 5.066,
          regularMarketTime: 1732530000
        },
        indicators: {
          quote: [{ close: [5.01, 5.066, 4.904] }]
        }
      }]
    }
  };
  const tnx = parseYahooChartResult(tnxRaw, 'us10y');
  assert.equal(tnx.price, 4.904);
  assert.equal(tnx.changeBps, -16.2);

  assert.equal(parseYahooChartResult({}, 'dxy'), null);
  assert.equal(parseYahooChartResult({ chart: { result: [{ meta: { regularMarketPrice: 0 } }] } }, 'dxy'), null);
});

test('computeKompasState reports Bullish alignment when real DXY/US10Y/VIX/Metals & M15 agree', () => {
  const res = kompas.computeKompasState({
    macroQuotes: {
      dxy: { price: 103.10, changePct: -0.45, sparkline: [103.8, 103.5, 103.1] },
      us10y: { price: 4.72, prevClose: 4.82, changeBps: -10.0, sparkline: [4.85, 4.82, 4.72] },
      vix: { price: 22.4, changePct: 8.5, sparkline: [19.0, 20.5, 22.4] },
      gold: { price: 3540.0, changePct: 0.65, sparkline: [3500, 3520, 3540] },
      silver: { price: 40.9, changePct: 0.85, sparkline: [40.2, 40.5, 40.9] }
    },
    liveCtx: { h1: { bias: 'BULLISH' }, m15: { structure: 'BULLISH' }, sessionDetail: { label: 'London' } },
    bridge: { livePrice: 3540.0 },
    nowMs: Date.parse('2026-11-25T10:00:00Z')
  });

  assert.equal(res.tone, 'bull');
  assert.ok(res.score >= 50);
  assert.equal(res.alignment.label, 'Selaras Bullish');
  assert.equal(res.alignment.tone, 'bull');
  assert.equal(res.counts.bull, 4);
});

test('computeKompasState reports Bearish alignment when DXY & US10Y surge with Bearish M15', () => {
  const res = kompas.computeKompasState({
    macroQuotes: {
      dxy: { price: 105.20, changePct: 0.55 },
      us10y: { price: 5.08, prevClose: 4.95, changeBps: 13.0 },
      vix: { price: 12.8, changePct: -4.2 },
      gold: { price: 3480.0, changePct: -0.75 },
      silver: { price: 39.4, changePct: -0.95 }
    },
    liveCtx: { h1: { bias: 'BEARISH' }, m15: { structure: 'BEARISH' } },
    bridge: { livePrice: 3480.0, isBearBreakdown: true },
    nowMs: Date.parse('2026-11-25T10:00:00Z')
  });

  assert.equal(res.tone, 'bear');
  assert.ok(res.score <= -50);
  assert.equal(res.alignment.label, 'Selaras Bearish');
  assert.match(res.bridgeNote, /Breakdown/i);
});

test('computeKompasState honestly reports conflict when Macro Bullish disagrees with M15 Bearish', () => {
  const res = kompas.computeKompasState({
    macroQuotes: {
      dxy: { price: 103.0, changePct: -0.5 },
      us10y: { price: 4.70, prevClose: 4.82, changeBps: -12.0 }
    },
    liveCtx: { h1: { bias: 'BEARISH' }, m15: { structure: 'BEARISH' } },
    nowMs: Date.parse('2026-11-25T10:00:00Z')
  });

  assert.equal(res.tone, 'bull');
  assert.equal(res.alignment.label, 'Bentrok Makro vs M15');
  assert.equal(res.alignment.tone, 'warn');
});

test('anti-hallucination: unreleased calendar forecast NEVER fakes directional score', () => {
  const nowMs = Date.parse('2026-11-25T10:00:00Z');
  const res = kompas.computeKompasState({
    macroQuotes: {
      dxy: { price: 104.0, changePct: 0.02 },
      us10y: { price: 4.90, prevClose: 4.90, changeBps: 0.0 },
      vix: { price: 16.0, changePct: 0.5 }
    },
    usdTodayEvents: [{
      title: 'Core PCE Price Index m/m',
      country: 'USD',
      impact: 'High',
      date: '2026-11-25T15:00:00Z',
      forecast: '0.6%',
      previous: '0.2%',
      actual: ''
    }],
    nowMs
  });

  assert.equal(res.score, 0);
  assert.equal(res.tone, 'neutral');
  assert.equal(res.activeFactorCount, 3); // calendar NOT scored because unreleased!
  assert.equal(res.triggerPlaybook.isReleased, false);

  // Even if upstream/cache somehow attached a polluted actual string to a FUTURE event, ignore it!
  const pollutedFuture = kompas.evaluateReleasedEvent({
    title: 'Prelim GDP q/q',
    date: '2026-11-25T15:00:00Z',
    forecast: '3.5%',
    previous: '3.4%',
    actual: '3'
  }, nowMs);
  assert.equal(pollutedFuture, null);
});

test('released actual events score standard (Core PCE) and inverse (Unemployment Claims) correctly', () => {
  const hotPce = kompas.evaluateReleasedEvent({
    title: 'Core PCE Price Index m/m',
    forecast: '0.3%',
    previous: '0.2%',
    actual: '0.5%'
  });
  assert.equal(hotPce.direction, -1);

  const highClaims = kompas.evaluateReleasedEvent({
    title: 'Unemployment Claims',
    forecast: '215K',
    previous: '210K',
    actual: '240K'
  });
  assert.equal(highClaims.direction, 1);

  const lowClaims = kompas.evaluateReleasedEvent({
    title: 'Unemployment Claims',
    forecast: '215K',
    previous: '210K',
    actual: '198K'
  });
  assert.equal(lowClaims.direction, -1);
});

test('computeKompasState triggers News Lock within -15m..+30m of High Impact USD event', () => {
  const nowMs = Date.parse('2026-11-25T13:20:00Z');
  const res = kompas.computeKompasState({
    macroQuotes: {
      dxy: { price: 103.5, changePct: -0.3 },
      us10y: { price: 4.80, prevClose: 4.88, changeBps: -8.0 }
    },
    usdTodayEvents: [{
      title: 'Core PCE Price Index m/m',
      country: 'USD',
      impact: 'High',
      date: '2026-11-25T13:30:00Z',
      forecast: '0.3%',
      previous: '0.3%',
      actual: ''
    }],
    nowMs
  });

  assert.equal(res.isNewsLockWindow, true);
  assert.equal(res.tone, 'lock');
  assert.equal(res.alignment.label, 'Tahan Posisi (±15m Rilis)');
});

test('computeKompasState reports honest offline state when all macro feeds are unavailable', () => {
  const res = kompas.computeKompasState({
    macroQuotes: { dxy: null, us10y: null, vix: null, gold: null, silver: null },
    usdTodayEvents: [],
    nowMs: Date.parse('2026-11-25T10:00:00Z')
  });

  assert.equal(res.activeFactorCount, 0);
  assert.equal(res.tone, 'neutral');
  assert.equal(res.verdictTitle, 'Data Makro Offline');
  assert.ok(res.factors.every(f => f.available === false));
});
