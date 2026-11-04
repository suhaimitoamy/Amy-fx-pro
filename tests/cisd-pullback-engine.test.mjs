import test from 'node:test';
import assert from 'node:assert/strict';
import { entryAssistantV3 } from '../app/src/main/assets/apps/mapping/js/ict-workspace/amy-ict.js';

test('CISD Pullback Engine: Prevents fake wick-only sell when body has not closed below last bull candle open', () => {
  // Simulates market condition at 16:30 - 16:45 today:
  // Candle 1 (16:30): Strong bull candle running to high 4038.28, open at 4030.24, close at 4034.77
  // Candle 2 (16:45): Upper wick rejection candle, high 4037.47, close at 4033.73 (still above 4030.24!)
  const candles = [
    { open_time: 1000, close_time: 1900, open: 4015, high: 4022, low: 4014, close: 4020, is_closed: true },
    { open_time: 1900, close_time: 2800, open: 4020, high: 4031, low: 4019, close: 4030, is_closed: true },
    { open_time: 2800, close_time: 3700, open: 4030.24, high: 4038.28, low: 4027.21, close: 4034.77, is_closed: true },
    { open_time: 3700, close_time: 4600, open: 4035.74, high: 4037.47, low: 4032.91, close: 4033.73, is_closed: true }
  ];

  const d = {
    biasDir: 1, // Bullish trend (pullback sell candidate)
    atr: 2.5,
    priceZone: 1, // Premium
    rangeHigh: 4038.28,
    rangeLow: 3950.00,
    invalidStatus: 0
  };

  const res = entryAssistantV3(d, candles, {}, {}, {});
  assert.equal(res.cisd?.bearConfirmed, false, 'CISD Bearish must be FALSE because close (4033.73) > bull open (4030.24)');
  assert.notEqual(res.signalType, -2, 'PULLBACK SELL must NOT trigger without valid CISD body close');
});

test('CISD Pullback Engine: Confirms Bearish CISD and triggers PULLBACK SELL when body closes below last bull open', () => {
  // Candle 3 closes at 4028.50, decisively breaking below the 4030.24 open of the last bull candle
  const candles = [
    { open_time: 1000, close_time: 1900, open: 4015, high: 4022, low: 4014, close: 4020, is_closed: true },
    { open_time: 1900, close_time: 2800, open: 4020, high: 4031, low: 4019, close: 4030, is_closed: true },
    { open_time: 2800, close_time: 3700, open: 4030.24, high: 4038.28, low: 4027.21, close: 4034.77, is_closed: true },
    { open_time: 3700, close_time: 4600, open: 4034.00, high: 4035.00, low: 4027.00, close: 4028.50, is_closed: true }
  ];

  const d = {
    biasDir: 1,
    atr: 2.5,
    priceZone: 1,
    rangeHigh: 4038.28,
    rangeLow: 3950.00,
    invalidStatus: 0
  };

  const res = entryAssistantV3(d, candles, {}, {}, {});
  assert.equal(res.cisd?.bearConfirmed, true, 'CISD Bearish must be confirmed when body closes below last bull open');
  assert.equal(res.rawSignalType, -2, 'Raw signal type must be -2 (PULLBACK SELL)');
  assert.match(res.signalName, /PULLBACK SELL \(CISD Pucuk Premium\)/);
  assert.ok(res.plan, 'Plan must be generated');
  assert.equal(res.plan.side, 'SELL');
});

test('CISD Pullback Engine: Confirms Bullish CISD and triggers PULLBACK BUY at Discount', () => {
  // Downtrend, last bear candle opens at 3920.00, lowest low 3915.00.
  // Current candle closes at 3922.50 (above 3920.00) with bullish body.
  const candles = [
    { open_time: 1000, close_time: 1900, open: 3940, high: 3942, low: 3930, close: 3932, is_closed: true },
    { open_time: 1900, close_time: 2800, open: 3932, high: 3933, low: 3920, close: 3922, is_closed: true },
    { open_time: 2800, close_time: 3700, open: 3920.00, high: 3921.00, low: 3915.00, close: 3916.50, is_closed: true },
    { open_time: 3700, close_time: 4600, open: 3917.00, high: 3924.00, low: 3916.00, close: 3922.50, is_closed: true }
  ];

  const d = {
    biasDir: -1,
    atr: 2.5,
    priceZone: -1,
    rangeHigh: 4000.00,
    rangeLow: 3915.00,
    invalidStatus: 0
  };

  const res = entryAssistantV3(d, candles, {}, {}, {});
  assert.equal(res.cisd?.bullConfirmed, true, 'CISD Bullish must be confirmed when body closes above last bear open');
  assert.equal(res.rawSignalType, 2, 'Raw signal type must be 2 (PULLBACK BUY)');
  assert.match(res.signalName, /PULLBACK BUY \(CISD Dasar Diskon\)/);
  assert.ok(res.plan, 'Plan must be generated');
  assert.equal(res.plan.side, 'BUY');
});
