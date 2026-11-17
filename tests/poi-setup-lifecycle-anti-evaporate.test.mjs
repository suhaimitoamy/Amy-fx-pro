import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('POI Setup Lifecycle Anti-Evaporate Invariants', () => {
  const code = fs.readFileSync('app/src/main/assets/apps/mapping/js/ict-workspace/dashboard-v2.js', 'utf8');

  // 1. Invariant: isActiveZone must NOT reject 'MITIGATED' zones
  assert.match(code, /lc !== 'BROKEN' && lc !== 'INVALIDATED'/);
  assert.doesNotMatch(code, /lc !== 'MITIGATED'/);

  // 2. Invariant: Active Setup Session Memory exists to prevent setup evaporation
  assert.match(code, /let activeSellSession = null;/);
  assert.match(code, /let activeBuySession = null;/);

  // 3. Invariant: In-Play detection and badge update
  assert.match(code, /isSellInPlay/);
  assert.match(code, /isBuyInPlay/);
  assert.match(code, /poi-badge--active/);

  // 4. Invariant: Safe buffer for livePrice testing (+-1.5)
  assert.match(code, /uniqueBearOBs\s*\.filter\(z => z\.hi >= livePrice - 1\.5\)/);
  assert.match(code, /uniqueBullOBs\s*\.filter\(z => z\.lo <= livePrice \+ 1\.5\)/);
});

test('NextGen Indicators Viable POI Retains Tested Zones', () => {
  const code = fs.readFileSync('app/src/main/assets/apps/mapping/js/ict-workspace/nextgen-indicators.js', 'utf8');

  // Invariant: Viable POIs must retain tested zones within active window
  assert.match(code, /const isViablePoi = z => !z\.mitigated \|\| \(z\.tested && \(!z\.endTime \|\| z\.endTime >= lastBarTime - 3600\)\);/);
});
