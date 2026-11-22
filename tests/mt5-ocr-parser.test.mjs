import test from 'node:test';
import assert from 'node:assert/strict';
import mt5ScanHandler from '../api/mt5-scan.js';

await import('../apps/shared/mt5-ocr-parser.js');
const ocr = globalThis.AmyMt5Ocr;

test('normalizeMt5Symbol cleans broker suffixes into canonical pairs', () => {
  assert.equal(ocr.normalizeMt5Symbol('XAUUSDm'), 'XAU/USD');
  assert.equal(ocr.normalizeMt5Symbol('XAUUSD.c'), 'XAU/USD');
  assert.equal(ocr.normalizeMt5Symbol('XAUUSDpro'), 'XAU/USD');
  assert.equal(ocr.normalizeMt5Symbol('GOLD#'), 'XAU/USD');
  assert.equal(ocr.normalizeMt5Symbol('EURUSDm'), 'EUR/USD');
  assert.equal(ocr.normalizeMt5Symbol('GBPJPY.raw'), 'GBP/JPY');
});

test('parseMt5Timestamp shifts broker time to WITA and classifies ICT sessions accurately', () => {
  // MT5 GMT+3 15:30 + 5h = 20:30 WITA -> NY AM
  const ny = ocr.parseMt5Timestamp('2026.11.22 15:30:12', 5);
  assert.equal(ny.date, '2026-11-22');
  assert.equal(ny.timeWita, '20:30');
  assert.equal(ny.session, 'NY AM');

  // MT5 GMT+3 10:15 + 5h = 15:15 WITA -> London
  const london = ocr.parseMt5Timestamp('2026.11.22 10:15:00', 5);
  assert.equal(london.timeWita, '15:15');
  assert.equal(london.session, 'London');

  // Overnight rollover: MT5 GMT+3 20:45 + 5h = 01:45 next day WITA -> NY PM
  const rollover = ocr.parseMt5Timestamp('2026.11.22 20:45:00', 5);
  assert.equal(rollover.date, '2026-11-23');
  assert.equal(rollover.timeWita, '01:45');
  assert.equal(rollover.session, 'NY PM');
});

test('normalizeMt5ScanPayload computes XAU/USD pips, R:R, Cent USC conversion, and excludes balance rows', () => {
  const raw = {
    accountCurrency: 'USC',
    isCentAccount: true,
    trades: [
      { entryType: 'balance', symbol: 'USD', direction: 'buy', profit: 50000 },
      {
        entryType: 'trade',
        symbol: 'XAUUSDc',
        direction: 'buy',
        lot: 0.1,
        entryPrice: 2640.0,
        exitPrice: 2648.0,
        sl: 2636.0,
        tp: 2648.0,
        profit: 8000,
        swap: -50,
        commission: -150,
        closeTime: '2026.11.22 15:20:00',
        status: 'closed'
      },
      {
        entryType: 'trade',
        symbol: 'XAUUSDc',
        direction: 'sell',
        lot: 0.05,
        entryPrice: 2650.0,
        exitPrice: 2654.0,
        sl: 2654.0,
        profit: -2000,
        closeTime: '2026.11.22 16:05:00',
        status: 'closed'
      }
    ]
  };

  const parsed = ocr.normalizeMt5ScanPayload(raw, { brokerOffsetHours: 5 });
  assert.equal(parsed.detectedCent, true);
  assert.equal(parsed.isCentAccount, true);
  assert.equal(parsed.trades.length, 2);

  const t1 = parsed.trades[0];
  assert.equal(t1.market, 'XAU/USD');
  assert.equal(t1.direction, 'Buy');
  assert.equal(t1.pnlMoney, 78); // (8000 - 50 - 150) / 100
  assert.equal(t1.result, 'Win');
  assert.equal(t1.pnlPips, 80); // +$8 * 10
  assert.equal(t1.riskReward, 2); // 8 / 4
  assert.equal(t1.session, 'NY AM');

  const t2 = parsed.trades[1];
  assert.equal(t2.pnlMoney, -20);
  assert.equal(t2.result, 'Loss');
  assert.equal(t2.pnlPips, -40);
  assert.equal(t2.closeReason, 'sl');
});

test('annotateDuplicates flags existing Journal trades and intra-batch duplicates without unchecking fresh trades', () => {
  const existing = [
    {
      date: '2026-11-22',
      market: 'XAU/USD',
      direction: 'Buy',
      lot: 0.05,
      pnlMoney: 42.5,
      exitPrice: 2648.5,
      exitTime: '20:30'
    }
  ];

  const batch = ocr.normalizeMt5ScanPayload({
    trades: [
      { symbol: 'XAUUSDm', direction: 'buy', lot: 0.05, entryPrice: 2640, exitPrice: 2648.5, profit: 42.5, closeTime: '2026.11.22 15:30:00' },
      { symbol: 'XAUUSDm', direction: 'sell', lot: 0.05, entryPrice: 2652, exitPrice: 2646.0, profit: 30.0, closeTime: '2026.11.22 16:10:00' },
      { symbol: 'XAUUSDm', direction: 'sell', lot: 0.05, entryPrice: 2652, exitPrice: 2646.0, profit: 30.0, closeTime: '2026.11.22 16:10:00' }
    ]
  }, { brokerOffsetHours: 5 }).trades;

  const marked = ocr.annotateDuplicates(batch, existing);
  assert.equal(marked[0].isDuplicate, true);
  assert.equal(marked[0].selected, false);
  assert.equal(marked[1].isDuplicate, false);
  assert.equal(marked[1].selected, true);
  assert.equal(marked[2].isDuplicate, true);
  assert.equal(marked[2].selected, false);
});

test('buildJournalEntryFromMt5 produces canonical Journal v2 schema compatible with SIM/REAL & analytics', () => {
  const trade = ocr.normalizeScannedTrade({
    symbol: 'GOLD',
    direction: 'sell',
    lot: 0.04,
    entryPrice: 2660.5,
    exitPrice: 2652.5,
    sl: 2664.5,
    tp: 2652.5,
    profit: 32.0,
    closeTime: '2026.11.22 15:40:00',
    ticket: '9823411'
  }, { brokerOffsetHours: 5 });

  const entry = ocr.buildJournalEntryFromMt5(trade, {
    accountMode: 'REAL',
    defaultSetup: 'Sweep + FVG',
    defaultMistakes: 'Sesuai Plan',
    createId: () => 'test-id-1'
  });

  assert.equal(entry.id, 'test-id-1');
  assert.equal(entry.accountMode, 'REAL');
  assert.equal(entry.source, 'mt5-ocr');
  assert.equal(entry.market, 'XAU/USD');
  assert.equal(entry.pair, 'XAU/USD');
  assert.equal(entry.direction, 'Sell');
  assert.equal(entry.result, 'Win');
  assert.equal(entry.profit, 32);
  assert.equal(entry.loss, 0);
  assert.equal(entry.pnlMoney, 32);
  assert.equal(entry.riskReward, 2);
  assert.equal(entry.pnlPips, 80);
  assert.equal(entry.setup, 'Sweep + FVG');
  assert.equal(entry.mistakes, 'Sesuai Plan');
  assert.match(entry.evaluation, /Scan MT5:/);
  assert.match(entry.evaluation, /#9823411/);
});

test('/api/mt5-scan rejects non-POST, missing image, and invalid MIME types safely', async () => {
  const invoke = async (method, body) => {
    let statusCode = 200;
    let payload = null;
    const fakeRes = {
      setHeader() {},
      status(c) { statusCode = c; return this; },
      json(d) { payload = d; return this; },
      end() { return this; }
    };
    await mt5ScanHandler({ method, body }, fakeRes);
    return { statusCode, payload };
  };

  const getRes = await invoke('GET', null);
  assert.equal(getRes.statusCode, 405);

  const emptyRes = await invoke('POST', {});
  assert.equal(emptyRes.statusCode, 400);

  const badMime = await invoke('POST', { imageBase64: 'data:text/html;base64,PGgxPkJhZDwvaDE+' });
  assert.equal(badMime.statusCode, 400);
});
