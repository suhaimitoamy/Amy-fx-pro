import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidTwelveDataKey,
  getTwelveDataKeys,
  getOrderedCandidateKeys,
  markKeyFailure,
  markKeySuccess,
  getPoolStatus,
  resetKeyPoolState
} from '../lib/twelvedata-key-pool.mjs';

test('getTwelveDataKeys merges comma-separated, numbered env vars, and rejects placeholders', () => {
  const keys = getTwelveDataKeys({
    explicitKey: 'aaaa1111bbbb2222cccc, YOUR_API_KEY',
    env: {
      TWELVEDATA_API_KEYS: 'dddd3333eeee4444ffff\naaaa1111bbbb2222cccc',
      TWELVEDATA_API_KEY: 'placeholder_key',
      TWELVEDATA_API_KEY_2: 'gggg5555hhhh6666iiii',
      TWELVEDATA_API_KEY_3: 'short'
    },
    keyFilePath: ''
  });

  assert.deepEqual(keys, [
    'aaaa1111bbbb2222cccc',
    'dddd3333eeee4444ffff',
    'gggg5555hhhh6666iiii'
  ]);
  assert.equal(isValidTwelveDataKey('MY_TWELVEDATA_KEY_12345'), false);
  assert.equal(isValidTwelveDataKey('a1b2c3d4e5f6g7h8i9j0'), true);
});

test('getOrderedCandidateKeys rotates round-robin and skips cooled-down 429 keys', () => {
  resetKeyPoolState();
  const env = {
    TWELVEDATA_API_KEYS: 'key1_1111222233334444,key2_1111222233334444,key3_1111222233334444'
  };
  const t0 = 1_700_000_000_000;

  const firstCall = getOrderedCandidateKeys({ env, keyFilePath: '', nowMs: t0 });
  const secondCall = getOrderedCandidateKeys({ env, keyFilePath: '', nowMs: t0 });
  assert.equal(firstCall[0], 'key1_1111222233334444');
  assert.equal(secondCall[0], 'key2_1111222233334444');

  // Mark key1 as daily credit exhausted
  const info = markKeyFailure(
    'key1_1111222233334444',
    { statusCode: 429, message: 'You have run out of API credits for the day. 800 API credits used.' },
    t0
  );
  assert.equal(info.reason, 'DAILY_LIMIT');
  assert.equal(info.retryable, true);

  // Mark key2 as per-minute rate limited
  const info2 = markKeyFailure(
    'key2_1111222233334444',
    { statusCode: 429, message: 'You have run out of API credits for the current minute.' },
    t0
  );
  assert.equal(info2.reason, 'MINUTE_LIMIT');

  // Only key3 should be healthy right now
  const afterFail = getOrderedCandidateKeys({ env, keyFilePath: '', nowMs: t0 + 1000 });
  assert.deepEqual(afterFail, ['key3_1111222233334444']);
  assert.deepEqual(getPoolStatus({ env, keyFilePath: '', nowMs: t0 + 1000 }), {
    totalKeys: 3,
    healthyKeys: 1,
    cooledDownKeys: 2
  });

  // After 70s, key2 (minute limit) recovers automatically while key1 stays cooled down
  const afterMinute = getOrderedCandidateKeys({ env, keyFilePath: '', nowMs: t0 + 70_000 });
  assert.equal(afterMinute.includes('key2_1111222233334444'), true);
  assert.equal(afterMinute.includes('key3_1111222233334444'), true);
  assert.equal(afterMinute.includes('key1_1111222233334444'), false);

  // Explicit success clears cooldown
  markKeySuccess('key1_1111222233334444');
  assert.equal(getPoolStatus({ env, keyFilePath: '', nowMs: t0 + 70_000 }).healthyKeys, 3);
  resetKeyPoolState();
});
