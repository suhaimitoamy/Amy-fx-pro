/**
 * TwelveData Multi-Key Rotation & Cooldown Pool
 * Supports multiple free-tier keys (800 credits/day each) via:
 * - TWELVEDATA_API_KEYS (comma/newline separated)
 * - TWELVEDATA_API_KEY (single or comma-separated)
 * - TWELVEDATA_API_KEY_1 .. TWELVEDATA_API_KEY_10
 * - Optional local key file (/root/.twelvedata_keys)
 *
 * Automatically rotates healthy keys round-robin and cools down rate-limited (429) keys
 * so requests fail over immediately to the next key without burning credits or stalling.
 */
import fs from 'node:fs';

const KEY_FILE_PATH = '/root/.twelvedata_keys';
const MINUTE_COOLDOWN_MS = 65_000;
const INVALID_KEY_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const MAX_DAILY_COOLDOWN_MS = 6 * 60 * 60 * 1000;

const poolState = globalThis.__amyFxTwelveDataKeyPool
  || (globalThis.__amyFxTwelveDataKeyPool = {
    cursor: 0,
    cooldownUntil: new Map(),
    reasons: new Map()
  });

export function isValidTwelveDataKey(raw) {
  const k = String(raw || '').trim();
  if (!k || k.length < 16) return false;
  if (/^(YOUR_|MY_|PLACEHOLDER|REPLACE|EXAMPLE|DEMO|TEST)/i.test(k)) return false;
  if (/[\s"'<>]/.test(k)) return false;
  return true;
}

export function parseKeyList(raw) {
  if (!raw) return [];
  return String(raw)
    .split(/[\n,;]+/)
    .map(part => part.replace(/#.*$/, '').trim())
    .filter(isValidTwelveDataKey);
}

export function getTwelveDataKeys({ explicitKey = '', env = process.env, keyFilePath = KEY_FILE_PATH } = {}) {
  const seen = new Set();
  const keys = [];
  const addAll = raw => {
    for (const k of parseKeyList(raw)) {
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
  };

  addAll(explicitKey);
  addAll(env?.TWELVEDATA_API_KEYS);
  addAll(env?.TWELVEDATA_API_KEY);

  for (let i = 1; i <= 10; i++) {
    addAll(env?.[`TWELVEDATA_API_KEY_${i}`]);
  }

  if (keyFilePath) {
    try {
      if (fs.existsSync(keyFilePath)) {
        addAll(fs.readFileSync(keyFilePath, 'utf8'));
      }
    } catch (_) {}
  }

  return keys;
}

function msUntilNextUtcMidnight(nowMs = Date.now()) {
  const d = new Date(nowMs);
  const nextMidnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 1, 0);
  return Math.max(60_000, Math.min(MAX_DAILY_COOLDOWN_MS, nextMidnight - nowMs));
}

export function classifyTwelveDataFailure(error, nowMs = Date.now()) {
  const msg = String(error?.providerData?.message || error?.message || '');
  const status = Number(error?.statusCode || error?.status || error?.providerData?.code || 0);

  if (status === 401 || /apikey.*(invalid|not valid|incorrect)|invalid api key/i.test(msg)) {
    return { retryable: true, reason: 'INVALID_KEY', cooldownMs: INVALID_KEY_COOLDOWN_MS };
  }
  if (/run out of api credits for the day|credits.*day|daily limit/i.test(msg)) {
    return { retryable: true, reason: 'DAILY_LIMIT', cooldownMs: msUntilNextUtcMidnight(nowMs) };
  }
  if (status === 429 || /429|rate limit|current minute|credits/i.test(msg)) {
    return { retryable: true, reason: 'MINUTE_LIMIT', cooldownMs: MINUTE_COOLDOWN_MS };
  }
  return { retryable: false, reason: 'PROVIDER_ERROR', cooldownMs: 0 };
}

export function markKeyFailure(key, error, nowMs = Date.now()) {
  if (!key) return { retryable: false, reason: 'NO_KEY', cooldownMs: 0 };
  const info = classifyTwelveDataFailure(error, nowMs);
  if (info.cooldownMs > 0) {
    poolState.cooldownUntil.set(key, nowMs + info.cooldownMs);
    poolState.reasons.set(key, info.reason);
  }
  return info;
}

export function markKeySuccess(key) {
  if (!key) return;
  poolState.cooldownUntil.delete(key);
  poolState.reasons.delete(key);
}

export function getOrderedCandidateKeys(options = {}) {
  const nowMs = options.nowMs ?? Date.now();
  const keys = getTwelveDataKeys(options);
  if (!keys.length) return [];

  const healthy = [];
  for (const k of keys) {
    const until = Number(poolState.cooldownUntil.get(k) || 0);
    if (until <= nowMs) {
      if (until > 0) {
        poolState.cooldownUntil.delete(k);
        poolState.reasons.delete(k);
      }
      healthy.push(k);
    }
  }

  if (!healthy.length) return [];

  const startIdx = poolState.cursor % healthy.length;
  poolState.cursor = (poolState.cursor + 1) % healthy.length;
  return [...healthy.slice(startIdx), ...healthy.slice(0, startIdx)];
}

export function getPoolStatus(options = {}) {
  const nowMs = options.nowMs ?? Date.now();
  const keys = getTwelveDataKeys(options);
  let healthy = 0;
  let cooledDown = 0;
  for (const k of keys) {
    const until = Number(poolState.cooldownUntil.get(k) || 0);
    if (until > nowMs) cooledDown++;
    else healthy++;
  }
  return { totalKeys: keys.length, healthyKeys: healthy, cooledDownKeys: cooledDown };
}

export function resetKeyPoolState() {
  poolState.cursor = 0;
  poolState.cooldownUntil.clear();
  poolState.reasons.clear();
}
