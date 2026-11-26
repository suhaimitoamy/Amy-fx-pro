import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const api = readFileSync(new URL('../api/live-price.js', import.meta.url), 'utf8');
const bridge = readFileSync(new URL('../app/src/main/java/com/amyelitesuite/TwelveDataPriceBridge.kt', import.meta.url), 'utf8');

test('live-price shared hub lifetime is 50s (under maxDuration 60s), heartbeat 12s, and OkHttp readTimeout is 35s', () => {
  // Lifetime & SSE heartbeat in serverless Vercel function
  assert.match(api, /SERVERLESS_STREAM_LIFETIME_MS\s*=\s*50_000/, 'Vercel shared stream lifetime must be 50 seconds');
  assert.match(api, /SSE_HEARTBEAT_MS\s*=\s*12_000/, 'SSE heartbeat must stay at 12 seconds (< OkHttp readTimeout)');

  // Client OkHttp readTimeout
  assert.match(bridge, /\.readTimeout\(35,\s*TimeUnit\.SECONDS\)/, 'OkHttp readTimeout must be 35 seconds (23s margin over 12s heartbeat)');
});

test('TwelveDataPriceBridge reconnects with 0ms delay on graceful stream completion', () => {
  assert.match(bridge, /reconnect\(currentGeneration,\s*current,\s*graceful\)/);
  assert.match(bridge, /val delay = if \(graceful\) 0L else minOf/);
  assert.match(bridge, /if \(graceful\) reconnectAttempt = 0/);
});
