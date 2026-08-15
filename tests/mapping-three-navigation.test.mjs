import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Mapping exposes Dashboard, Analisis, and Riwayat as three primary navigations', () => {
  const html = read('app/src/main/assets/apps/mapping/index.html');
  assert.match(html, /data-tab="Dashboard"/);
  assert.match(html, /data-tab="Analyze"/);
  assert.match(html, /href="scalper-stats\.html"/);
  assert.match(html, />Dashboard<\/span>/);
  assert.match(html, />Analisis<\/span>/);
  assert.match(html, />Riwayat<\/span>/);
});

test('Dashboard and Analysis no longer render Scalper Vault statistics or permanent history', () => {
  const css = read('app/src/main/assets/apps/mapping/css/scalper-navigation-separation.css');
  assert.match(css, /#app \.scalper-vault/);
  assert.match(css, /#app \.scalper-watch__recent/);
  assert.match(css, /display:\s*none\s*!important/);
});

test('Dedicated Scalper statistics page reads the same persistent Vault', () => {
  const html = read('app/src/main/assets/apps/mapping/scalper-stats.html');
  const source = read('app/src/main/assets/apps/mapping/js/scalper-stats-page.js');
  for (const marker of ['Dashboard', 'Analisis', 'Riwayat & Statistik', 'Scalper Vault · All Time']) {
    assert.ok(html.includes(marker), `stats page marker missing: ${marker}`);
  }
  for (const marker of [
    "from './scalper-vault.js'",
    'loadScalperVault',
    'mergeScalperHistory',
    'persistScalperVault',
    'scalperVaultStats',
    "history_limit: '2000'",
    'Backup JSON',
    'Pulihkan Backup',
    'Perbarui dari Backend'
  ]) {
    assert.ok(source.includes(marker), `stats page source marker missing: ${marker}`);
  }
});
