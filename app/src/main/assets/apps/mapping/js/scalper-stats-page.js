import {
  SCALPER_VAULT_SCHEMA_VERSION,
  loadScalperVault,
  mergeScalperHistory,
  persistScalperVault,
  scalperTradeOutcome,
  scalperVaultStats
} from './scalper-vault.js';

const ENDPOINT = 'https://wliecyxzlwhmtftnfnps.supabase.co/functions/v1/scalper-setups';
const PAGE_SIZE = 100;
const app = document.getElementById('scalper-stats-app');
const stateDot = document.getElementById('vault-state');

let archive = [];
let filter = 'ALL';
let visibleLimit = PAGE_SIZE;
let notice = '';
let sourceState = 'LOCAL';
let syncing = false;

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const price = value => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number.toFixed(2) : '-';
};

const resultR = value => {
  const number = Number(value);
  return Number.isFinite(number) ? `${number >= 0 ? '+' : ''}${number.toFixed(2)}R` : '-';
};

const driver = setup => setup?.driverName
  || setup?.methodName
  || setup?.entryMethod
  || setup?.patternName
  || (setup?.model === 'IFVG_SCALPER' ? 'IFVG LEGACY' : String(setup?.model || 'SCALPER ENGINE').replaceAll('_', ' '));

const statusLabel = value => ({
  TP_HIT: 'TP HIT',
  SL_HIT: 'SL HIT',
  BE_HIT: 'BREAKEVEN',
  TIME_EXIT: 'TIME EXIT',
  INVALIDATED: 'INVALIDATED',
  CANCELLED: 'CANCELLED'
})[String(value || '').toUpperCase()] || String(value || 'TERMINAL').replaceAll('_', ' ');

function setupTimestamp(setup) {
  const raw = setup?.exitTime
    || setup?.updatedAt
    || setup?.updated_at
    || setup?.signalCandleCloseTime
    || setup?.sourceCandleTimestamp;
  const number = Number(raw);
  if (Number.isFinite(number) && number > 10_000_000_000) return number;
  if (Number.isFinite(number) && number > 0) return number * 1000;
  const parsed = Date.parse(String(raw || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function witaTime(setup) {
  const timestamp = setupTimestamp(setup);
  if (!timestamp) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(timestamp));
  } catch (_) {
    return '-';
  }
}

function outcomeLabel(setup) {
  const outcome = scalperTradeOutcome(setup);
  if (outcome === 'WIN') return { key: 'WIN', label: 'WIN', className: 'win' };
  if (outcome === 'LOSS') return { key: 'LOSS', label: 'LOSS', className: 'loss' };
  if (outcome === 'BE') return { key: 'BE', label: 'BE', className: 'be' };
  return { key: 'EXCLUDED', label: 'BATAL', className: '' };
}

function filteredArchive() {
  if (filter === 'ALL') return archive;
  return archive.filter(setup => outcomeLabel(setup).key === filter);
}

function methodPerformance(history) {
  const grouped = new Map();
  for (const setup of history) {
    const name = String(driver(setup) || 'METODE TIDAK DIKENAL').trim() || 'METODE TIDAK DIKENAL';
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name).push(setup);
  }

  return [...grouped.entries()].map(([name, setups]) => {
    const stats = scalperVaultStats(setups);
    const decisive = Number(stats.wins || 0) + Number(stats.losses || 0);
    return {
      name,
      archiveCount: Number(stats.archiveCount || setups.length),
      totalTrades: Number(stats.totalTrades || 0),
      wins: Number(stats.wins || 0),
      losses: Number(stats.losses || 0),
      breakeven: Number(stats.breakeven || 0),
      excluded: Number(stats.excludedSetups || 0),
      winRate: stats.winRate == null ? null : Number(stats.winRate),
      lossRate: decisive > 0 ? (Number(stats.losses || 0) / decisive) * 100 : null,
      netR: stats.netR == null ? null : Number(stats.netR)
    };
  }).sort((a, b) =>
    b.losses - a.losses
    || (b.lossRate ?? -1) - (a.lossRate ?? -1)
    || b.totalTrades - a.totalTrades
    || a.name.localeCompare(b.name)
  );
}

function methodCard(method, index) {
  const winRate = method.winRate == null ? '-' : `${method.winRate.toFixed(1)}%`;
  const lossRate = method.lossRate == null ? '-' : `${method.lossRate.toFixed(1)}%`;
  const netR = method.netR == null ? '-' : resultR(method.netR);
  const priority = index === 0 && method.losses > 0;
  return `<article class="stats-method-card${priority ? ' is-priority' : ''}">
    <div class="stats-method-head">
      <div><span class="stats-method-rank">#${index + 1}</span><strong>${esc(method.name)}</strong></div>
      ${priority ? '<span class="stats-method-priority">PRIORITAS EVALUASI</span>' : `<span class="stats-method-sample">${method.archiveCount} setup</span>`}
    </div>
    <div class="stats-method-grid">
      <div><small>Trade</small><strong>${method.totalTrades}</strong></div>
      <div class="win"><small>Win</small><strong>${method.wins}</strong></div>
      <div class="loss"><small>Loss</small><strong>${method.losses}</strong></div>
      <div><small>BE</small><strong>${method.breakeven}</strong></div>
      <div class="wr"><small>WR</small><strong>${winRate}</strong></div>
      <div><small>Net R</small><strong>${netR}</strong></div>
    </div>
    <div class="stats-method-foot"><span>Loss rate <b>${lossRate}</b></span><span>Invalid/Batal <b>${method.excluded}</b></span></div>
  </article>`;
}

function historyItem(setup) {
  const outcome = outcomeLabel(setup);
  const cssOutcome = outcome.key === 'WIN' ? ' is-win' : outcome.key === 'LOSS' ? ' is-loss' : '';
  const tf = setup?.timeframe || 'M15';
  const direction = setup?.direction || 'WAIT';
  return `<article class="stats-history-item${cssOutcome}">
    <div class="stats-history-item-head">
      <div class="stats-history-title">${esc(driver(setup))} · ${esc(tf)} · ${esc(direction)}<small>${esc(statusLabel(setup?.status))} · ${esc(witaTime(setup))} WITA</small></div>
      <span class="stats-outcome ${outcome.className}">${esc(outcome.label)}${outcome.key !== 'EXCLUDED' && Number.isFinite(Number(setup?.resultR)) ? ` · ${esc(resultR(setup.resultR))}` : ''}</span>
    </div>
    <div class="stats-history-grid">
      <div><small>Entry</small><strong>${price(setup?.entry)}</strong></div>
      <div><small>SL</small><strong>${price(setup?.stopLoss)}</strong></div>
      <div><small>TP1</small><strong>${price(setup?.tp1 ?? setup?.breakEvenTrigger)}</strong></div>
      <div><small>TP2</small><strong>${price(setup?.tp2 ?? setup?.target)}</strong></div>
    </div>
    <div class="stats-history-meta"><span>${esc(setup?.reason || setup?.invalidationReason || 'Riwayat terminal Scalper Engine.')}</span><span>${esc(String(setup?.id || '').slice(-10) || '-')}</span></div>
  </article>`;
}

function render() {
  if (!app) return;
  const stats = scalperVaultStats(archive);
  const methods = methodPerformance(archive);
  const list = filteredArchive();
  const visible = list.slice(0, visibleLimit);
  const remaining = Math.max(0, list.length - visible.length);
  const winRate = stats.winRate == null ? '-' : `${stats.winRate.toFixed(1)}%`;
  const netR = stats.netR == null ? '-' : resultR(stats.netR);
  const sourceText = sourceState === 'LIVE'
    ? 'Vault lokal sudah digabung dengan riwayat backend terbaru.'
    : 'Menampilkan Vault lokal. Data lama tetap dipertahankan.';

  app.innerHTML = `<section class="card stats-hero">
    <div class="stats-hero-row"><div><div class="kicker">SCALPER VAULT · ALL TIME</div><h1>Riwayat & Statistik</h1><div class="muted">${esc(sourceText)}</div></div><span class="stats-archive-badge">${stats.archiveCount} setup tersimpan</span></div>
    <div class="stats-primary">
      <div><small>Total Trade</small><strong>${stats.totalTrades}</strong></div>
      <div class="win"><small>Win</small><strong>${stats.wins}</strong></div>
      <div class="loss"><small>Loss</small><strong>${stats.losses}</strong></div>
      <div class="wr"><small>Win Rate</small><strong>${winRate}</strong></div>
    </div>
    <div class="stats-secondary">
      <div><small>Breakeven</small><strong>${stats.breakeven}</strong></div>
      <div><small>Net R</small><strong>${netR}</strong></div>
      <div><small>Invalid / Batal</small><strong>${stats.excludedSetups}</strong></div>
    </div>
    <p class="stats-formula">WR = Win ÷ (Win + Loss). Breakeven, invalidated, dan cancelled tidak masuk denominator WR. Total Trade tetap memasukkan breakeven yang benar-benar selesai.</p>
    ${notice ? `<div class="stats-note">${esc(notice)}</div>` : ''}
    <div class="stats-actions">
      <button type="button" class="primary" data-vault-export>Backup JSON</button>
      <button type="button" data-vault-import>Pulihkan Backup</button>
      <button type="button" class="sync" data-vault-sync ${syncing ? 'disabled' : ''}>${syncing ? 'Menyinkronkan…' : 'Perbarui dari Backend'}</button>
      <input type="file" accept="application/json,.json" data-vault-import-file hidden>
    </div>
  </section>
  <section class="card stats-method-section">
    <div class="stats-history-head"><div><div class="kicker">PERFORMA PER METODE</div><h2>Metode yang Perlu Dievaluasi</h2></div><span class="stats-history-count">${methods.length} metode</span></div>
    <p class="stats-method-note">Diurutkan dari jumlah Loss terbanyak. Gunakan juga jumlah Trade, WR, Loss Rate, dan Net R untuk menilai kualitas metode secara adil.</p>
    <div class="stats-method-list">${methods.map(methodCard).join('') || '<div class="stats-empty">Belum ada metode dengan riwayat yang bisa dihitung.</div>'}</div>
  </section>
  <section class="card">
    <div class="stats-history-head"><div><div class="kicker">ARSIP PERMANEN</div><h2>Seluruh Riwayat Scalper</h2></div><span class="stats-history-count">${list.length} setup pada filter ini</span></div>
    <div class="stats-filter-row">
      ${[['ALL','Semua'],['WIN','Win'],['LOSS','Loss'],['BE','BE'],['EXCLUDED','Invalid/Batal']].map(([key,label]) => `<button type="button" class="stats-filter${filter === key ? ' active' : ''}" data-history-filter="${key}">${label}</button>`).join('')}
    </div>
    <div class="stats-history-list">${visible.map(historyItem).join('') || '<div class="stats-empty">Belum ada riwayat pada filter ini.</div>'}</div>
    ${remaining > 0 ? `<button type="button" class="stats-more" data-history-more>Muat ${Math.min(PAGE_SIZE, remaining)} lagi · tersisa ${remaining}</button>` : ''}
  </section>`;

  if (stateDot) {
    stateDot.className = sourceState === 'LIVE' ? 'status on' : 'status warn';
    stateDot.title = sourceState === 'LIVE' ? 'Vault + backend tersinkron' : 'Vault lokal';
  }
}

function downloadBackup() {
  const backup = {
    app: 'Amy FX Pro',
    type: 'scalper-vault-backup',
    schemaVersion: SCALPER_VAULT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    stats: scalperVaultStats(archive),
    history: archive
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `AmyFX-Pro-Scalper-Vault-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  queueMicrotask(() => URL.revokeObjectURL(href));
  notice = `Backup dibuat: ${archive.length} setup permanen.`;
  render();
}

async function restoreBackup(file) {
  try {
    const parsed = JSON.parse(await file.text());
    const imported = mergeScalperHistory(
      Array.isArray(parsed?.history) ? parsed.history : [],
      Array.isArray(parsed?.setups) ? parsed.setups : []
    );
    if (!imported.length) throw new Error('Backup tidak berisi riwayat Scalper yang valid.');
    archive = mergeScalperHistory(archive, imported);
    await persistScalperVault(archive);
    visibleLimit = PAGE_SIZE;
    notice = `Backup dipulihkan: ${imported.length} setup dibaca, ${archive.length} setup tersimpan total.`;
  } catch (error) {
    notice = `Gagal memulihkan backup: ${error?.message || error}`;
  }
  render();
}

async function syncRemote({ announce = true } = {}) {
  if (syncing) return;
  syncing = true;
  if (announce) notice = 'Menyinkronkan riwayat terbaru tanpa menghapus arsip lama.';
  render();
  try {
    const params = new URLSearchParams({ limit: '50', history: 'all', history_limit: '2000' });
    const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) throw new Error(payload?.detail || payload?.error || `HTTP ${response.status}`);
    const remote = Array.isArray(payload?.history)
      ? payload.history
      : Array.isArray(payload?.recent)
        ? payload.recent
        : [];
    archive = mergeScalperHistory(archive, remote);
    await persistScalperVault(archive, payload?.generatedAt || new Date().toISOString());
    sourceState = 'LIVE';
    if (announce) notice = `Sinkron selesai. ${archive.length} setup permanen tersimpan; data lama tidak dipotong.`;
  } catch (error) {
    sourceState = 'LOCAL';
    if (announce) notice = `Backend belum dapat dibaca. Vault lokal tetap aman: ${error?.message || error}`;
  } finally {
    syncing = false;
    render();
  }
}

async function init() {
  try {
    archive = await loadScalperVault();
    sourceState = 'LOCAL';
    render();
  } catch (error) {
    notice = `Vault lokal belum dapat dibaca: ${error?.message || error}`;
    render();
  }
  void syncRemote({ announce: false });
}

app?.addEventListener('click', event => {
  const filterButton = event.target.closest('[data-history-filter]');
  if (filterButton) {
    filter = filterButton.dataset.historyFilter || 'ALL';
    visibleLimit = PAGE_SIZE;
    render();
    return;
  }
  if (event.target.closest('[data-history-more]')) {
    visibleLimit += PAGE_SIZE;
    render();
    return;
  }
  if (event.target.closest('[data-vault-export]')) {
    downloadBackup();
    return;
  }
  if (event.target.closest('[data-vault-import]')) {
    app.querySelector('[data-vault-import-file]')?.click();
    return;
  }
  if (event.target.closest('[data-vault-sync]')) void syncRemote();
});

app?.addEventListener('change', event => {
  const input = event.target.closest('[data-vault-import-file]');
  if (!input) return;
  const file = input.files?.[0];
  input.value = '';
  if (file) void restoreBackup(file);
});

void init();
