/* Amy FX Backtest Lab — local-first IndexedDB storage + Sessions + Profile Parameter Sync + Journal Export. */
(function (root) {
  'use strict';

  if (root.AmyPracticeStorage) return;

  var DB_NAME = 'amy_fx_trading_practice_v1';
  var DB_VERSION = 3;
  var FALLBACK_PREFIX = 'amy.practice.v1.';
  var SESSIONS_KEY = 'amy.backtest.sessions.v1';
  var ACTIVE_SESSION_KEY = 'amy.backtest.active_session.v1';
  var JOURNAL_LOCAL_KEY = 'tradingLibraryManager.journals.v1';
  var EXPORTED_JOURNAL_IDS_KEY = 'amy.backtest.exportedJournalIds.v1';
  var JOURNAL_IDB_NAME = 'tradingLibraryManager.files';
  var JOURNAL_IDB_VERSION = 2;
  var JOURNAL_META_STORE = 'metadata';
  var JOURNAL_META_RECORD = 'journals.v2';
  var STORES = Object.freeze({
    datasets: 'datasets',
    trades: 'trades',
    guided: 'guidedResults',
    packs: 'historicalPacks',
    packFiles: 'historicalPackFiles',
    analytics: 'amy_practice_analytics'
  });
  var dbPromise = null;

  function fallbackKey(store) { return FALLBACK_PREFIX + store; }

  function readFallback(store) {
    try {
      var value = JSON.parse(localStorage.getItem(fallbackKey(store)) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  function writeFallback(store, items) {
    try { localStorage.setItem(fallbackKey(store), JSON.stringify(items)); } catch (_) {}
  }

  function openDb() {
    if (!root.indexedDB) return Promise.reject(new Error('IndexedDB unavailable'));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains(STORES.datasets)) db.createObjectStore(STORES.datasets, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORES.trades)) {
          var trades = db.createObjectStore(STORES.trades, { keyPath: 'id' });
          trades.createIndex('createdAt', 'createdAt');
        }
        if (!db.objectStoreNames.contains(STORES.guided)) db.createObjectStore(STORES.guided, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORES.packs)) {
          var packs = db.createObjectStore(STORES.packs, { keyPath: 'id' });
          packs.createIndex('start', 'start');
          packs.createIndex('importedAt', 'importedAt');
        }
        if (!db.objectStoreNames.contains(STORES.packFiles)) db.createObjectStore(STORES.packFiles, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORES.analytics)) {
          var analytics = db.createObjectStore(STORES.analytics, { keyPath: 'id' });
          analytics.createIndex('timestamp', 'timestamp');
          analytics.createIndex('setupType', 'setupType');
          analytics.createIndex('session', 'session');
        }
      };
      request.onsuccess = function () {
        var db = request.result;
        if (db) {
          db.onclose = function () { dbPromise = null; };
          db.onversionchange = function () {
            try { db.close(); } catch (_) {}
            dbPromise = null;
          };
        }
        resolve(db);
      };
      request.onerror = function () {
        dbPromise = null;
        reject(request.error || new Error('IndexedDB gagal dibuka'));
      };
      request.onblocked = function () {
        dbPromise = null;
        reject(new Error('Upgrade database Backtest terblokir. Tutup tab Backtest lain lalu coba lagi.'));
      };
    });
    return dbPromise;
  }

  async function withStore(store, mode, operation) {
    var db = await openDb();
    return new Promise(function (resolve, reject) {
      var transaction = db.transaction(store, mode);
      var objectStore = transaction.objectStore(store);
      var request;
      var result;
      transaction.oncomplete = function () { resolve(result); };
      transaction.onerror = function () { reject(transaction.error || new Error('Transaksi penyimpanan gagal')); };
      transaction.onabort = function () { reject(transaction.error || new Error('Transaksi penyimpanan dibatalkan')); };
      try { request = operation(objectStore); }
      catch (error) {
        try { transaction.abort(); } catch (_) {}
        reject(error);
        return;
      }
      request.onsuccess = function () { result = request.result; };
      request.onerror = function () { reject(request.error || new Error('Operasi penyimpanan gagal')); };
    });
  }

  async function put(store, value) {
    try {
      await withStore(store, 'readwrite', function (objectStore) { return objectStore.put(value); });
      return value;
    } catch (_) {
      if (store === STORES.packs || store === STORES.packFiles) throw _;
      var items = readFallback(store).filter(function (item) { return item && item.id !== value.id; });
      items.push(value);
      writeFallback(store, items);
      return value;
    }
  }

  function newest(primary, fallback) {
    if (!primary) return fallback || null;
    if (!fallback) return primary;
    return Number(fallback.updatedAt || fallback.createdAt || 0) > Number(primary.updatedAt || primary.createdAt || 0) ? fallback : primary;
  }

  async function get(store, id) {
    try {
      var value = await withStore(store, 'readonly', function (objectStore) { return objectStore.get(id); });
      if (store === STORES.packs || store === STORES.packFiles) return value || null;
      return newest(value, readFallback(store).find(function (item) { return item && item.id === id; }));
    } catch (_) {
      if (store === STORES.packs || store === STORES.packFiles) return null;
      return readFallback(store).find(function (item) { return item && item.id === id; }) || null;
    }
  }

  async function getAll(store) {
    try {
      var primary = await withStore(store, 'readonly', function (objectStore) { return objectStore.getAll(); });
      if (store === STORES.packs || store === STORES.packFiles) return primary;
      var merged = new Map();
      readFallback(store).forEach(function (item) { if (item && item.id) merged.set(item.id, item); });
      primary.forEach(function (item) { if (item && item.id) merged.set(item.id, newest(item, merged.get(item.id))); });
      return Array.from(merged.values());
    } catch (_) {
      if (store === STORES.packs || store === STORES.packFiles) return [];
      return readFallback(store);
    }
  }

  async function remove(store, id) {
    try {
      await withStore(store, 'readwrite', function (objectStore) { return objectStore.delete(id); });
      if (store !== STORES.packs && store !== STORES.packFiles) {
        writeFallback(store, readFallback(store).filter(function (item) { return item && item.id !== id; }));
      }
    } catch (_) {
      if (store === STORES.packs || store === STORES.packFiles) throw _;
      writeFallback(store, readFallback(store).filter(function (item) { return item && item.id !== id; }));
    }
  }

  function identifier(prefix) {
    if (root.crypto && typeof root.crypto.randomUUID === 'function') return prefix + '-' + root.crypto.randomUUID();
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function cleanSymbol(symbol) { return String(symbol || 'XAUUSD').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

  function packId(record) {
    var start = Number(record && record.start || 0);
    var end = Number(record && record.end || 0);
    return 'pack:' + cleanSymbol(record && record.symbol) + ':' + String(record && record.timeframe || 'M1').toUpperCase() + ':' + start + ':' + end;
  }

  async function saveHistoricalPack(record, blob) {
    if (!blob || typeof blob.arrayBuffer !== 'function') throw new Error('File pack historis tidak valid.');
    var meta = Object.assign({}, record);
    meta.id = meta.id || packId(meta);
    meta.symbol = String(meta.symbol || 'XAUUSD').toUpperCase();
    meta.timeframe = String(meta.timeframe || 'M1').toUpperCase();
    meta.importedAt = Number(meta.importedAt || Date.now());
    meta.size = Number(meta.size || blob.size || 0);
    delete meta.blob;

    var db = await openDb();
    return new Promise(function (resolve, reject) {
      var transaction = db.transaction([STORES.packs, STORES.packFiles], 'readwrite');
      transaction.oncomplete = function () { resolve(meta); };
      transaction.onerror = function () { reject(transaction.error || new Error('Pack historis gagal disimpan.')); };
      transaction.onabort = function () { reject(transaction.error || new Error('Penyimpanan pack historis dibatalkan.')); };
      transaction.objectStore(STORES.packs).put(meta);
      transaction.objectStore(STORES.packFiles).put({ id: meta.id, blob: blob });
    });
  }

  async function loadHistoricalPack(id) {
    var pair = await Promise.all([get(STORES.packs, id), get(STORES.packFiles, id)]);
    if (!pair[0] || !pair[1] || !pair[1].blob) return null;
    return { meta: pair[0], blob: pair[1].blob };
  }

  async function listHistoricalPacks() {
    var items = await getAll(STORES.packs);
    return items.sort(function (a, b) {
      var byTime = Number(a.start || 0) - Number(b.start || 0);
      return byTime || Number(a.importedAt || 0) - Number(b.importedAt || 0);
    });
  }

  async function deleteHistoricalPack(id) {
    var db = await openDb();
    return new Promise(function (resolve, reject) {
      var transaction = db.transaction([STORES.packs, STORES.packFiles], 'readwrite');
      transaction.oncomplete = function () { resolve(true); };
      transaction.onerror = function () { reject(transaction.error || new Error('Pack historis gagal dihapus.')); };
      transaction.objectStore(STORES.packs).delete(id);
      transaction.objectStore(STORES.packFiles).delete(id);
    });
  }

  async function saveTrade(record) {
    var value = Object.assign({}, record);
    if (!value.id) value.id = identifier('trade');
    if (!value.sessionId) value.sessionId = getActiveSessionId();
    if (!value.createdAt) value.createdAt = Date.now();
    value.updatedAt = Date.now();
    return put(STORES.trades, value);
  }

  async function listTrades(sessionId) {
    var items = await getAll(STORES.trades);
    var sorted = items.sort(function (a, b) { return Number(b.createdAt || 0) - Number(a.createdAt || 0); });
    if (!sessionId || sessionId === 'ALL') return sorted;
    return sorted.filter(function (t) { return (t.sessionId || 'default') === sessionId; });
  }

  async function resetSessionTrades(sessionId) {
    var target = sessionId || getActiveSessionId();
    var items = await listTrades(target);
    for (var i = 0; i < items.length; i += 1) {
      await remove(STORES.trades, items[i].id);
    }
    return items.length;
  }

  async function saveGuidedResult(record) {
    var value = Object.assign({}, record);
    if (!value.id) value.id = identifier('guided');
    if (!value.createdAt) value.createdAt = Date.now();
    return put(STORES.guided, value);
  }

  function saveReplayState(value) {
    try { localStorage.setItem(FALLBACK_PREFIX + 'replayState', JSON.stringify(value)); } catch (_) {}
  }

  function loadReplayState() {
    try { return JSON.parse(localStorage.getItem(FALLBACK_PREFIX + 'replayState') || 'null'); }
    catch (_) { return null; }
  }

  // Read live Akun Pro settings from Profile -> Parameter Trading & AccountSimEngine
  function readProfileAccountParams() {
    var baseBalanceUsd = 5000;
    var cashflowTotalUsd = 0;
    var riskPercent = 1;
    var currency = 'IDR';
    var usdIdrRate = 16500;
    var spreadUsd = 0.25;
    try {
      var rawBal = Number(localStorage.getItem('amy_default_balance'));
      if (Number.isFinite(rawBal) && rawBal > 0) baseBalanceUsd = rawBal;

      var rawCashflows = JSON.parse(localStorage.getItem('amy_sim_cashflows_v1') || '[]');
      if (Array.isArray(rawCashflows)) {
        cashflowTotalUsd = rawCashflows.reduce(function (acc, item) {
          var amt = Number(item && item.amountUsd);
          return acc + (Number.isFinite(amt) ? amt : 0);
        }, 0);
      }

      var rawRisk = Number(localStorage.getItem('amy_default_risk'));
      if (Number.isFinite(rawRisk) && rawRisk > 0) riskPercent = rawRisk;

      var rawCurrency = String(localStorage.getItem('amy_account_currency') || '').toUpperCase();
      if (rawCurrency === 'USD' || rawCurrency === 'IDR') currency = rawCurrency;

      var rawRate = Number(localStorage.getItem('amy_usd_idr_rate'));
      if (Number.isFinite(rawRate) && rawRate >= 1000) usdIdrRate = Math.round(rawRate);

      var rawSpreadStr = localStorage.getItem('amy_account_spread');
      if (rawSpreadStr !== null && String(rawSpreadStr).trim() !== '') {
        var rawSpread = Number(rawSpreadStr);
        if (Number.isFinite(rawSpread) && rawSpread >= 0 && rawSpread <= 5) spreadUsd = rawSpread;
      }

      // Legacy fallback only when modern keys are absent
      var rawSim = JSON.parse(localStorage.getItem('amyfx.account_sim.v1') || 'null');
      if (rawSim && rawSim.params) {
        if (!rawCurrency && (rawSim.params.currency === 'USD' || rawSim.params.currency === 'IDR')) {
          currency = rawSim.params.currency;
        }
        if (!(Number.isFinite(rawRate) && rawRate >= 1000) && Number.isFinite(Number(rawSim.params.usdIdrRate)) && Number(rawSim.params.usdIdrRate) >= 1000) {
          usdIdrRate = Number(rawSim.params.usdIdrRate);
        }
        if (rawSpreadStr === null && Number.isFinite(Number(rawSim.params.spreadUsd)) && Number(rawSim.params.spreadUsd) >= 0) {
          spreadUsd = Number(rawSim.params.spreadUsd);
        }
      }
    } catch (_) {}

    var effectiveBalanceUsd = Math.round((baseBalanceUsd + cashflowTotalUsd) * 100) / 100;
    var balanceUsd = effectiveBalanceUsd > 0 ? effectiveBalanceUsd : baseBalanceUsd;

    return {
      balanceUsd: balanceUsd,
      baseBalanceUsd: baseBalanceUsd,
      cashflowTotalUsd: Math.round(cashflowTotalUsd * 100) / 100,
      riskPercent: riskPercent,
      currency: currency,
      usdIdrRate: usdIdrRate,
      spreadUsd: spreadUsd
    };
  }

  function saveDisplayCurrency(currency) {
    var next = String(currency || 'IDR').toUpperCase() === 'USD' ? 'USD' : 'IDR';
    try { localStorage.setItem('amy_account_currency', next); } catch (_) {}
    return next;
  }

  function formatMoney(usdAmount, currency, usdIdrRate, options) {
    options = options || {};
    var signed = Boolean(options.signed);
    var num = Number(usdAmount || 0);
    var rate = Number(usdIdrRate || 16500);
    var sign = num > 0 ? (signed ? '+' : '') : (num < 0 ? '-' : '');
    var abs = Math.abs(num);
    if (currency === 'IDR') {
      var idr = Math.round(abs * rate);
      return sign + 'Rp' + idr.toLocaleString('id-ID');
    }
    return sign + '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Named Backtest Sessions
  function listSessions() {
    var profile = readProfileAccountParams();
    var def = {
      id: 'default',
      name: 'Sesi Utama',
      initialBalanceUsd: profile.balanceUsd,
      riskPercent: profile.riskPercent,
      createdAt: 0
    };
    try {
      var stored = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
      if (!Array.isArray(stored) || !stored.length) return [def];
      var mapped = stored.filter(Boolean).map(function (s) {
        if (s.id === 'default') {
          return Object.assign({}, s, {
            initialBalanceUsd: profile.balanceUsd,
            riskPercent: profile.riskPercent
          });
        }
        return s;
      });
      var hasDef = mapped.some(function (s) { return s && s.id === 'default'; });
      return hasDef ? mapped : [def].concat(mapped);
    } catch (_) {
      return [def];
    }
  }

  function saveSessions(list) {
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(list)); } catch (_) {}
  }

  function getActiveSessionId() {
    try { return localStorage.getItem(ACTIVE_SESSION_KEY) || 'default'; } catch (_) { return 'default'; }
  }

  function setActiveSessionId(id) {
    var next = String(id || 'default');
    try { localStorage.setItem(ACTIVE_SESSION_KEY, next); } catch (_) {}
    return next;
  }

  function getActiveSession() {
    var activeId = getActiveSessionId();
    var sessions = listSessions();
    var found = sessions.find(function (s) { return s.id === activeId; }) || sessions[0];
    if (found.id === 'default') {
      var prof = readProfileAccountParams();
      return Object.assign({}, found, { initialBalanceUsd: prof.balanceUsd, riskPercent: prof.riskPercent });
    }
    return found;
  }

  function createSession(name, initialBalanceUsd, riskPercent) {
    var cleanName = String(name || '').trim();
    if (!cleanName) throw new Error('Nama sesi backtest wajib diisi.');
    var prof = readProfileAccountParams();
    var bal = Number(initialBalanceUsd);
    var risk = Number(riskPercent);
    var sess = {
      id: identifier('sess'),
      name: cleanName.slice(0, 60),
      initialBalanceUsd: Number.isFinite(bal) && bal > 0 ? Math.round(bal * 100) / 100 : prof.balanceUsd,
      riskPercent: Number.isFinite(risk) && risk > 0 ? Math.min(25, Math.max(0.1, Math.round(risk * 100) / 100)) : prof.riskPercent,
      createdAt: Date.now()
    };
    var list = listSessions().concat([sess]);
    saveSessions(list);
    setActiveSessionId(sess.id);
    return sess;
  }

  function updateSessionParams(sessionId, initialBalanceUsd, riskPercent) {
    var targetId = String(sessionId || getActiveSessionId() || 'default');
    var bal = Number(initialBalanceUsd);
    var risk = Number(riskPercent);
    if (!Number.isFinite(bal) || bal <= 0) throw new Error('Modal awal harus lebih besar dari 0.');
    if (!Number.isFinite(risk) || risk < 0.1 || risk > 25) throw new Error('Risiko harus antara 0.1% hingga 25%.');
    var cleanBal = Math.round(bal * 100) / 100;
    var cleanRisk = Math.round(risk * 100) / 100;

    if (targetId === 'default') {
      var prof = readProfileAccountParams();
      var adjustedBase = Math.round((cleanBal - prof.cashflowTotalUsd) * 100) / 100;
      try {
        if (adjustedBase > 0) {
          localStorage.setItem('amy_default_balance', String(adjustedBase));
        } else {
          localStorage.setItem('amy_default_balance', String(cleanBal));
          localStorage.setItem('amy_sim_cashflows_v1', '[]');
        }
        localStorage.setItem('amy_default_risk', String(cleanRisk));
      } catch (_) {}
      return getActiveSession();
    }

    var list = listSessions().map(function (s) {
      if (s && s.id === targetId) {
        return Object.assign({}, s, {
          initialBalanceUsd: cleanBal,
          riskPercent: cleanRisk
        });
      }
      return s;
    });
    saveSessions(list);
    return list.find(function (s) { return s && s.id === targetId; }) || getActiveSession();
  }

  async function deleteSession(id) {
    if (!id || id === 'default') throw new Error('Sesi Utama tidak dapat dihapus (gunakan Reset Sesi).');
    await resetSessionTrades(id);
    var list = listSessions().filter(function (s) { return s.id !== id; });
    saveSessions(list);
    if (getActiveSessionId() === id) setActiveSessionId('default');
    return true;
  }

  function readExportedJournalIds() {
    try {
      var parsed = JSON.parse(localStorage.getItem(EXPORTED_JOURNAL_IDS_KEY) || '[]');
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (_) { return []; }
  }

  function isTradeExportedToJournal(tradeId) {
    if (!tradeId) return false;
    var key = String(tradeId);
    if (readExportedJournalIds().indexOf(key) >= 0) return true;
    try {
      var existing = JSON.parse(localStorage.getItem(JOURNAL_LOCAL_KEY) || '[]');
      if (Array.isArray(existing)) {
        var targetId = 'bt-journal-' + key;
        return existing.some(function (item) { return item && item.id === targetId; });
      }
    } catch (_) {}
    return false;
  }

  function markTradeExportedToJournal(tradeId) {
    if (!tradeId) return;
    var key = String(tradeId);
    var ids = readExportedJournalIds();
    if (ids.indexOf(key) < 0) {
      ids.push(key);
      try { localStorage.setItem(EXPORTED_JOURNAL_IDS_KEY, JSON.stringify(ids.slice(-500))); } catch (_) {}
    }
  }

  function upsertJournalIntoIndexedDb(entry, fallbackList) {
    if (!root.indexedDB) return Promise.resolve(false);
    return new Promise(function (resolve) {
      var settled = false;
      var finish = function (ok) {
        if (!settled) { settled = true; resolve(ok); }
      };
      try {
        var req = root.indexedDB.open(JOURNAL_IDB_NAME, JOURNAL_IDB_VERSION);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'id' });
          if (!db.objectStoreNames.contains(JOURNAL_META_STORE)) db.createObjectStore(JOURNAL_META_STORE, { keyPath: 'id' });
        };
        req.onsuccess = function () {
          var db = req.result;
          if (!db || !db.objectStoreNames.contains(JOURNAL_META_STORE)) {
            try { db && db.close(); } catch (_) {}
            finish(false);
            return;
          }
          try {
            var tx = db.transaction(JOURNAL_META_STORE, 'readwrite');
            var store = tx.objectStore(JOURNAL_META_STORE);
            var getReq = store.get(JOURNAL_META_RECORD);
            getReq.onsuccess = function () {
              var current = Array.isArray(getReq.result && getReq.result.value)
                ? getReq.result.value.slice()
                : (Array.isArray(fallbackList) ? fallbackList.slice() : []);
              var idx = current.findIndex(function (item) { return item && item.id === entry.id; });
              if (idx >= 0) current[idx] = entry;
              else current.unshift(entry);
              store.put({
                id: JOURNAL_META_RECORD,
                value: current,
                updatedAt: new Date().toISOString()
              });
            };
            tx.oncomplete = function () {
              try { db.close(); } catch (_) {}
              finish(true);
            };
            tx.onerror = function () {
              try { db.close(); } catch (_) {}
              finish(false);
            };
            tx.onabort = function () {
              try { db.close(); } catch (_) {}
              finish(false);
            };
          } catch (_) {
            try { db.close(); } catch (_) {}
            finish(false);
          }
        };
        req.onerror = function () { finish(false); };
        setTimeout(function () { finish(false); }, 2500);
      } catch (_) {
        finish(false);
      }
    });
  }

  function exportTradeInternal(trade) {
    if (!trade || !['WIN', 'LOSS', 'BE'].includes(trade.result)) {
      throw new Error('Hanya trade tertutup (WIN / LOSS / BE) yang dapat dikirim ke Jurnal.');
    }
    var rawTs = Number(trade.tradeTime || trade.createdAt || Date.now());
    var tradeMs = rawTs < 1e12 ? rawTs * 1000 : rawTs;
    var dt = new Date(tradeMs);
    var dateStr = dt.toISOString().slice(0, 10);
    var closeRaw = Number(trade.closedAt || rawTs);
    var closeMs = closeRaw < 1e12 ? closeRaw * 1000 : closeRaw;
    var resultLabel = trade.result === 'WIN' ? 'Win' : (trade.result === 'LOSS' ? 'Loss' : 'BE');
    var pnlUsd = Math.round(Number(trade.pnlUsd != null ? trade.pnlUsd : 0) * 100) / 100;
    var rVal = Math.round(Number(trade.r != null ? trade.r : 0) * 100) / 100;
    var entryPx = Number(trade.fillPrice || trade.entry || 0);
    var exitPx = Number(trade.exitPrice || entryPx || 0);
    var slPx = Number(trade.stopLoss || 0);
    var tpPx = Number(trade.takeProfit || 0);
    var dirSign = trade.bias === 'SELL' ? -1 : 1;
    var pnlPips = Math.round((exitPx - entryPx) * dirSign * 10 * 10) / 10;
    var riskMoney = Number(trade.riskUsd || 0);
    var setupLabel = (root.AmyPracticeAnalytics && root.AmyPracticeAnalytics.classifySetup(trade.notes, trade.reason, trade.setupType))
      || trade.setupType || 'Backtest ICT';
    var sessionLabel = (root.AmyPracticeAnalytics && root.AmyPracticeAnalytics.classifySession(trade.tradeTime)) || 'Other';
    var nowIso = new Date().toISOString();
    var noteText = '[Backtest ' + (trade.timeframe || 'M15') + '] ' + (trade.notes || 'Eksekusi Replay Lab');

    var entry = {
      id: 'bt-journal-' + String(trade.id),
      accountMode: 'SIM',
      source: 'backtest-lab',
      date: dateStr,
      title: (trade.bias === 'SELL' ? 'SELL' : 'BUY') + ' XAU/USD · ' + setupLabel + ' (' + resultLabel + ')',
      market: 'XAU/USD',
      pair: 'XAU/USD',
      direction: trade.bias === 'SELL' ? 'Sell' : 'Buy',
      result: resultLabel,
      profit: pnlUsd > 0 ? pnlUsd : 0,
      loss: pnlUsd < 0 ? Math.abs(pnlUsd) : 0,
      pnlMoney: pnlUsd,
      pnl: pnlUsd,
      pnlPips: pnlPips,
      riskMoney: riskMoney > 0 ? riskMoney : undefined,
      riskReward: (rVal >= 0 ? '+' : '') + rVal.toFixed(2) + 'R',
      rMultiple: rVal,
      lot: Number(trade.lot || 0.01),
      entryPrice: entryPx,
      sl: slPx,
      tp: tpPx,
      slPrice: slPx,
      tpPrice: tpPx,
      exitPrice: exitPx,
      setup: setupLabel,
      session: sessionLabel,
      evaluation: noteText,
      notes: noteText,
      tags: ['Backtest', trade.timeframe || 'M15', 'SIM'],
      entryTime: new Date(tradeMs).toISOString(),
      exitTime: new Date(closeMs).toISOString(),
      createdAt: nowIso,
      updatedAt: nowIso
    };

    var existing = [];
    try { existing = JSON.parse(localStorage.getItem(JOURNAL_LOCAL_KEY) || '[]'); } catch (_) { existing = []; }
    if (!Array.isArray(existing)) existing = [];
    var idx = existing.findIndex(function (item) { return item && item.id === entry.id; });
    if (idx >= 0) existing[idx] = entry;
    else existing.unshift(entry);
    try { localStorage.setItem(JOURNAL_LOCAL_KEY, JSON.stringify(existing)); } catch (_) {}
    markTradeExportedToJournal(trade.id);

    var idbPromise = upsertJournalIntoIndexedDb(entry, existing).then(function (ok) {
      try {
        if (typeof root.dispatchEvent === 'function' && typeof root.CustomEvent === 'function') {
          root.dispatchEvent(new root.CustomEvent('amyfx:journal-state-change', { detail: { source: 'backtest-lab', id: entry.id } }));
        }
      } catch (_) {}
      return ok;
    });
    return { entry: entry, promise: idbPromise };
  }

  function exportTradeToJournal(trade) {
    return exportTradeInternal(trade).entry;
  }

  function exportTradeToJournalAsync(trade) {
    var out = exportTradeInternal(trade);
    return out.promise.then(function () { return out.entry; });
  }

  root.AmyPracticeStorage = Object.freeze({
    packId: packId,
    saveHistoricalPack: saveHistoricalPack,
    loadHistoricalPack: loadHistoricalPack,
    listHistoricalPacks: listHistoricalPacks,
    deleteHistoricalPack: deleteHistoricalPack,
    saveTrade: saveTrade,
    getTrade: function (id) { return get(STORES.trades, id); },
    listTrades: listTrades,
    deleteTrade: function (id) { return remove(STORES.trades, id); },
    resetSessionTrades: resetSessionTrades,
    saveGuidedResult: saveGuidedResult,
    listGuidedResults: function () { return getAll(STORES.guided); },
    saveReplayState: saveReplayState,
    loadReplayState: loadReplayState,
    readProfileAccountParams: readProfileAccountParams,
    saveDisplayCurrency: saveDisplayCurrency,
    formatMoney: formatMoney,
    listSessions: listSessions,
    getActiveSessionId: getActiveSessionId,
    setActiveSessionId: setActiveSessionId,
    getActiveSession: getActiveSession,
    createSession: createSession,
    updateSessionParams: updateSessionParams,
    deleteSession: deleteSession,
    isTradeExportedToJournal: isTradeExportedToJournal,
    exportTradeToJournal: exportTradeToJournal,
    exportTradeToJournalAsync: exportTradeToJournalAsync,
    identifier: identifier
  });
})(typeof window !== 'undefined' ? window : globalThis);
