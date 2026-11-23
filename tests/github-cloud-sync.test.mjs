import test from 'node:test';
import assert from 'node:assert/strict';

await import('../apps/shared/github-cloud-sync.js');
const Sync = globalThis.AmyGitHubSync;

function createMemoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial).map(([k, v]) => [k, String(v)]));
  return {
    getItem(k) { return map.has(k) ? map.get(k) : null; },
    setItem(k, v) { map.set(k, String(v)); },
    removeItem(k) { map.delete(k); },
    dump() { return Object.fromEntries(map.entries()); }
  };
}

test('UTF-8 Base64 encode/decode preserves emojis, Bahasa Indonesia, and currency symbols', () => {
  const sample = JSON.stringify({
    note: 'Rencana Sesi London 🔥📊 XAU/USD — Disiplin SL ketat! +Rp2.475.000 ✅ "No FOMO"',
    tags: ['Sesuai Plan', 'Sweep–FVG']
  });
  const encoded = Sync.encodeBase64Utf8(sample);
  assert.ok(encoded.length > 0);
  assert.equal(/^[A-Za-z0-9+/=]+$/.test(encoded), true);
  // GitHub contents API inserts newlines every 60 chars — decoder must handle whitespace cleanly
  const withNewlines = encoded.replace(/(.{60})/g, '$1\n');
  const decoded = Sync.decodeBase64Utf8(withNewlines);
  assert.equal(decoded, sample);
});

test('parseRepoSlug, validateBranchName, and validateFilePath enforce strict validation', () => {
  const okRepo = Sync.parseRepoSlug('suhaimitoamy/amyfx-private-sync');
  assert.equal(okRepo.valid, true);
  assert.equal(okRepo.owner, 'suhaimitoamy');
  assert.equal(okRepo.name, 'amyfx-private-sync');

  assert.equal(Sync.parseRepoSlug('').valid, false);
  assert.equal(Sync.parseRepoSlug('https://github.com/suhaimitoamy/amyfx-private-sync').valid, false);
  assert.equal(Sync.parseRepoSlug('suhaimitoamy/../etc').valid, false);
  assert.equal(Sync.parseRepoSlug('onlyowner').valid, false);
  assert.equal(Sync.parseRepoSlug('owner/repo/extra').valid, false);

  assert.equal(Sync.validateBranchName('main').valid, true);
  assert.equal(Sync.validateBranchName('sync/v1').valid, true);
  assert.equal(Sync.validateBranchName('../bad').valid, false);
  assert.equal(Sync.validateBranchName('/leading').valid, false);

  assert.equal(Sync.validateFilePath('amyfx-cloud-sync.json').valid, true);
  assert.equal(Sync.validateFilePath('backups/sync.json').valid, true);
  assert.equal(Sync.validateFilePath('../secret.json').valid, false);
  assert.equal(Sync.validateFilePath('notes.txt').valid, false);
});

test('buildSnapshot & collectLocalPayload strictly exclude PAT token, API keys, and binary media blobs', async () => {
  const storage = createMemoryStorage({
    amy_github_sync_config_v1: JSON.stringify({
      repo: 'suhaimitoamy/amyfx-private-sync',
      branch: 'main',
      token: 'github_pat_SUPER_SECRET_123456',
      autoSync: true
    }),
    amy_trader_name: 'Amy Pro',
    amy_default_balance: '10000',
    amy_default_risk: '2',
    amy_account_currency: 'IDR',
    amy_usd_idr_rate: '16500',
    amy_account_spread: '0.25',
    amy_sim_cashflows_v1: JSON.stringify([{ id: 'cf1', type: 'deposit', amountUsd: 500 }]),
    amy_daily_loss_guard_v1: JSON.stringify({ enabled: true, maxDailySl: 2, maxDailyLossPct: 3 }),
    amy_academy_progress_v2: JSON.stringify({ completedLessons: ['L1'] }),
    amy_academy_bookmarks_v1: JSON.stringify(['L2']),
    amy_replay_bookmarks_v1: JSON.stringify([{ id: 'bm1', label: 'Sweep London' }]),
    amy_media_watched_v1: JSON.stringify(['vid_1', 'vid_2']),
    'amy.backtest.exportedJournalIds.v1': JSON.stringify(['bt_1']),
    'tradingLibraryManager.notes.v1': JSON.stringify([
      { id: 'n1', title: 'Rencana Harian', content: 'Fokus NY AM', token: 'SHOULD_BE_STRIPPED' }
    ]),
    'tradingLibraryManager.journals.v1': JSON.stringify([
      {
        id: 'j1',
        pair: 'XAU/USD',
        result: 'Win',
        pnlMoney: 150,
        videoThumb: 'data:image/jpeg;base64,HUGE_THUMB',
        objectUrl: 'blob:http://localhost:3000/abc',
        apiKey: 'SHOULD_NOT_LEAK',
        attachments: [
          { id: 'a1', name: 'chart.png', kind: 'image', size: 12000, data: 'RAW_BINARY', objectUrl: 'blob:xyz' }
        ]
      }
    ])
  });

  const payload = await Sync.collectLocalPayload({ storage, openDb: async () => null });
  const snapshot = Sync.buildSnapshot(payload, { deviceId: 'dev_test', updatedAt: '2026-11-22T10:00:00.000Z' });
  const serialized = JSON.stringify(snapshot);

  assert.equal(serialized.includes('github_pat_SUPER_SECRET_123456'), false);
  assert.equal(serialized.includes('SHOULD_BE_STRIPPED'), false);
  assert.equal(serialized.includes('SHOULD_NOT_LEAK'), false);
  assert.equal(serialized.includes('HUGE_THUMB'), false);
  assert.equal(serialized.includes('RAW_BINARY'), false);
  assert.equal(serialized.includes('blob:http'), false);

  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.app, 'amy-fx-pro');
  assert.equal(snapshot.payload.journals.length, 1);
  assert.equal(snapshot.payload.journals[0].attachments[0].name, 'chart.png');
  assert.equal(snapshot.payload.journals[0].attachments[0].data, undefined);
  assert.equal(snapshot.payload.personalNotes.length, 1);
  assert.equal(snapshot.payload.profile.traderName, 'Amy Pro');
  assert.equal(snapshot.payload.profile.defaultBalance, 10000);
  assert.deepEqual(snapshot.payload.mediaWatched, ['vid_1', 'vid_2']);
  assert.deepEqual(snapshot.payload.exportedBacktestIds, ['bt_1']);
});

test('detectPushConflict blocks overwriting newer data from another device unless forced', () => {
  const remoteSnapshot = {
    schemaVersion: 1,
    app: 'amy-fx-pro',
    updatedAt: '2026-11-22T12:00:00.000Z',
    deviceId: 'dev_hp_lain',
    payload: {}
  };

  // Remote is newer than our last known sync and from another device -> CONFLICT
  const blocked = Sync.detectPushConflict({
    remoteSnapshot,
    localDeviceId: 'dev_hp_ini',
    lastRemoteUpdatedAt: '2026-11-22T11:00:00.000Z',
    force: false
  });
  assert.equal(blocked.conflict, true);

  // Same device -> NO conflict
  const sameDevice = Sync.detectPushConflict({
    remoteSnapshot,
    localDeviceId: 'dev_hp_lain',
    lastRemoteUpdatedAt: '2026-11-22T11:00:00.000Z',
    force: false
  });
  assert.equal(sameDevice.conflict, false);

  // Already up to date -> NO conflict
  const upToDate = Sync.detectPushConflict({
    remoteSnapshot,
    localDeviceId: 'dev_hp_ini',
    lastRemoteUpdatedAt: '2026-11-22T12:00:00.000Z',
    force: false
  });
  assert.equal(upToDate.conflict, false);

  // Force override -> NO conflict
  const forced = Sync.detectPushConflict({
    remoteSnapshot,
    localDeviceId: 'dev_hp_ini',
    lastRemoteUpdatedAt: '2026-11-22T11:00:00.000Z',
    force: true
  });
  assert.equal(forced.conflict, false);
});

test('testConnection, first-time push (404 -> PUT), conflict guard, and pull round-trip with mocked fetch', async () => {
  const storage = createMemoryStorage({
    amy_trader_name: 'Amy FX',
    'tradingLibraryManager.journals.v1': JSON.stringify([{ id: 't1', pair: 'XAU/USD', result: 'Win', pnlMoney: 200 }]),
    'tradingLibraryManager.notes.v1': JSON.stringify([{ id: 'n1', title: 'Sesi NY', content: 'Setup valid 🎯' }])
  });

  const remoteStore = { file: null, sha: 'sha_v1' };

  const mockFetch = async (url, init = {}) => {
    const method = (init.method || 'GET').toUpperCase();
    assert.equal(init.headers.Authorization, 'Bearer test_pat_token');

    if (url.endsWith('/repos/suhaimitoamy/amyfx-private-sync') && method === 'GET') {
      return { ok: true, status: 200, json: async () => ({ private: true, default_branch: 'main' }) };
    }
    if (url.endsWith('/branches/main') && method === 'GET') {
      return { ok: true, status: 200, json: async () => ({ name: 'main' }) };
    }
    if (url.includes('/contents/amyfx-cloud-sync.json') && method === 'GET') {
      if (!remoteStore.file) {
        return { ok: false, status: 404, json: async () => ({ message: 'Not Found' }) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ sha: remoteStore.sha, content: remoteStore.file })
      };
    }
    if (url.includes('/contents/amyfx-cloud-sync.json') && method === 'PUT') {
      const parsedBody = JSON.parse(init.body);
      remoteStore.file = parsedBody.content;
      remoteStore.sha = parsedBody.sha ? 'sha_v2' : 'sha_v1';
      return {
        ok: true,
        status: 200,
        json: async () => ({ content: { sha: remoteStore.sha } })
      };
    }
    return { ok: false, status: 500, json: async () => ({}) };
  };

  // 1. Test connection
  const conn = await Sync.testConnection({
    repo: 'suhaimitoamy/amyfx-private-sync',
    branch: 'main',
    token: 'test_pat_token'
  }, { fetchImpl: mockFetch, storage });
  assert.equal(conn.ok, true);
  assert.equal(conn.isPrivate, true);

  // 2. First push (GET returns 404, PUT creates file without sha)
  const push1 = await Sync.pushToCloud({ fetchImpl: mockFetch, storage, openDb: async () => null });
  assert.equal(push1.ok, true);
  assert.equal(push1.sha, 'sha_v1');
  assert.equal(push1.journalCount, 1);
  assert.equal(push1.noteCount, 1);

  // 3. Simulate another device updating remote -> Conflict Guard blocks push
  const otherSnap = Sync.buildSnapshot({
    journals: [{ id: 't1', pair: 'XAU/USD', result: 'Win', pnlMoney: 200 }, { id: 't2', pair: 'XAU/USD', result: 'Win', pnlMoney: 350 }],
    personalNotes: [{ id: 'n2', title: 'Dari HP 2', content: 'Sinkron sukses 🚀' }],
    profile: { traderName: 'Amy HP 2', defaultBalance: 7500 }
  }, { deviceId: 'dev_second_phone', updatedAt: '2099-01-01T00:00:00.000Z' });
  remoteStore.file = Sync.encodeBase64Utf8(JSON.stringify(otherSnap));
  remoteStore.sha = 'sha_remote_newer';

  const blockedPush = await Sync.pushToCloud({ fetchImpl: mockFetch, storage, openDb: async () => null });
  assert.equal(blockedPush.ok, false);
  assert.equal(blockedPush.conflict, true);

  // 4. Pull from Cloud restores 2 journals + note with emoji + profile
  const pulled = await Sync.pullFromCloud({ fetchImpl: mockFetch, storage, openDb: async () => null });
  assert.equal(pulled.ok, true);
  assert.equal(pulled.journalCount, 2);
  assert.equal(pulled.noteCount, 1);
  assert.equal(storage.getItem('amy_trader_name'), 'Amy HP 2');
  const restoredNotes = JSON.parse(storage.getItem('tradingLibraryManager.notes.v1'));
  assert.equal(restoredNotes[0].content, 'Sinkron sukses 🚀');
});

test('error handling for 401 unauthorized and debounced scheduleAutoSync behavior', async () => {
  const storage = createMemoryStorage();
  const res401 = await Sync.testConnection({
    repo: 'suhaimitoamy/amyfx-private-sync',
    branch: 'main',
    token: 'bad_token'
  }, {
    fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({}) }),
    storage
  });
  assert.equal(res401.ok, false);
  assert.equal(res401.status, 401);
  assert.match(res401.error, /401/);

  // Auto-sync OFF by default -> scheduleAutoSync returns false
  Sync.saveConfig({ connected: true, token: 'good_tok', autoSync: false }, storage);
  assert.equal(Sync.scheduleAutoSync('journal', { delayMs: 20, storage }), false);

  // Auto-sync ON -> debounces rapid calls into a single push
  Sync.saveConfig({ connected: true, token: 'good_tok', autoSync: true }, storage);
  let putCalls = 0;
  const mockDebounceFetch = async (url, init = {}) => {
    const method = (init.method || 'GET').toUpperCase();
    if (method === 'GET') return { ok: false, status: 404, json: async () => ({}) };
    if (method === 'PUT') {
      putCalls += 1;
      return { ok: true, status: 200, json: async () => ({ content: { sha: 'sha_auto' } }) };
    }
    return { ok: false, status: 500, json: async () => ({}) };
  };

  assert.equal(Sync.scheduleAutoSync('journal', { delayMs: 30, fetchImpl: mockDebounceFetch, storage, openDb: async () => null }), true);
  assert.equal(Sync.scheduleAutoSync('notes', { delayMs: 30, fetchImpl: mockDebounceFetch, storage, openDb: async () => null }), true);
  assert.equal(Sync.scheduleAutoSync('journal', { delayMs: 30, fetchImpl: mockDebounceFetch, storage, openDb: async () => null }), true);

  await new Promise((r) => setTimeout(r, 90));
  assert.equal(putCalls, 1);
  Sync.cancelAutoSync();
});

test('GitHub Cloud Sync persists and union-merges Mapping Reaction & POI History (poiRecords + permanent dailyArchive)', async () => {
  const localTs = Date.UTC(2026, 10, 23, 5, 0, 0);
  const remoteTs = Date.UTC(2026, 10, 22, 5, 0, 0);
  const storage = createMemoryStorage({
    'amyfx.mapping.reaction_history.v1': JSON.stringify({
      version: 2,
      poiRecords: [
        {
          id: 'POI:M15:FVG:BUY:3600.0-3602.0',
          side: 'BUY',
          tf: 'M15',
          kind: 'FVG',
          low: 3600,
          high: 3602,
          ce: 3601,
          touchedAt: localTs,
          status: 'TP1_HIT',
          source: 'LIVE',
          touches: [{ index: 1, time: 123, price: 3601 }]
        }
      ],
      timelineEvents: [
        { id: 'EV:LOCAL', ts: localTs, category: 'POI_TOUCH', side: 'BUY', title: 'Local Touch' }
      ],
      dailyArchive: {
        '2026-11-23': { date: '2026-11-23', total: 1, tp1: 1, tp2: 0, sl: 0, respectRate: 100 }
      }
    })
  });

  // 1. Collect & buildSnapshot includes mappingReactionHistory and strips bulky touches
  const payload = await Sync.collectLocalPayload({ storage, openDb: async () => null });
  const snap = Sync.buildSnapshot(payload, { deviceId: 'dev_1', updatedAt: '2026-11-23T06:00:00.000Z' });
  assert.equal(snap.payload.mappingReactionHistory.poiRecords.length, 1);
  assert.equal(snap.payload.mappingReactionHistory.poiRecords[0].touches, undefined);
  assert.equal(snap.payload.mappingReactionHistory.dailyArchive['2026-11-23'].total, 1);

  // 2. Apply remote payload with older day + upgraded status -> union-merge keeps BOTH devices' POIs & archives
  const remotePayload = {
    journals: [],
    personalNotes: [],
    mappingReactionHistory: {
      version: 2,
      poiRecords: [
        {
          id: 'POI:M15:FVG:BUY:3600.0-3602.0',
          side: 'BUY',
          tf: 'M15',
          kind: 'FVG',
          low: 3600,
          high: 3602,
          ce: 3601,
          touchedAt: localTs,
          status: 'TP2_HIT',
          source: 'LIVE'
        },
        {
          id: 'POI:M5:OB:SELL:3620.0-3622.0',
          side: 'SELL',
          tf: 'M5',
          kind: 'OB',
          low: 3620,
          high: 3622,
          ce: 3621,
          touchedAt: remoteTs,
          status: 'SL_HIT',
          source: 'BACKFILL'
        }
      ],
      timelineEvents: [
        { id: 'EV:REMOTE', ts: remoteTs, category: 'BREAK', side: 'SELL', title: 'Remote Break' }
      ],
      dailyArchive: {
        '2026-05-10': { date: '2026-05-10', total: 12, tp2: 5, tp1: 4, sl: 3, respectRate: 75 }
      }
    }
  };

  const applied = await Sync.applyCloudPayload(remotePayload, { storage, openDb: async () => null });
  assert.equal(applied.mappingPoiCount, 2);
  assert.equal(applied.mappingDayCount, 2);

  const restored = JSON.parse(storage.getItem('amyfx.mapping.reaction_history.v1'));
  assert.equal(restored.poiRecords.length, 2);
  const upgraded = restored.poiRecords.find(r => r.id === 'POI:M15:FVG:BUY:3600.0-3602.0');
  assert.equal(upgraded.status, 'TP2_HIT');
  assert.ok(restored.dailyArchive['2026-11-23'], 'must retain local dailyArchive date');
  assert.ok(restored.dailyArchive['2026-05-10'], 'must merge remote archived date');
});

