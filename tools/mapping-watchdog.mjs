// Amy FX Pro — Autonomous Mapping Watchdog & Sentinel Audit
// Runs deterministic verification against real market structure data.

import fs from 'node:fs';
import { execSync } from 'node:child_process';

export function runMappingAudit() {
  const anomalies = [];
  
  // 1. Ambil data struktur pasar riil via amy_context_v432
  let rawCtx = null;
  try {
    const out = execSync('python3 /root/amy-market-data/amy_context_v432.py', { encoding: 'utf8', timeout: 8000 });
    rawCtx = JSON.parse(out);
  } catch (err) {
    anomalies.push({ type: 'CONTEXT_FETCH_ERROR', detail: err.message });
  }

  if (!rawCtx) {
    return { healthy: false, anomalies, report: 'Gagal mengambil context pasar riil' };
  }

  const livePrice = Number(rawCtx.current_price) || 0;
  const rows = rawCtx.dashboard_rows || {};
  const dr = rawCtx.dealing_range || {};

  // 2. Audit Dealing Range & Nilai EQ
  const eq = Number(dr.eq);
  const isDiscount = dr.is_discount;
  const isPremium = dr.is_premium;
  const pct = Math.round(Number(dr.pct) || 50);

  if (livePrice > eq && isDiscount) {
    anomalies.push({
      type: 'LOGIC_CONTRADICTION',
      detail: `Harga ($${livePrice}) di atas EQ ($${eq}) tapi terlabel DISCOUNT`
    });
  }
  if (livePrice < eq && isPremium) {
    anomalies.push({
      type: 'LOGIC_CONTRADICTION',
      detail: `Harga ($${livePrice}) di bawah EQ ($${eq}) tapi terlabel PREMIUM`
    });
  }

  // 3. Audit Kode dashboard-v2.js untuk memastikan parser Order Block & FVG aktif
  const dashCode = fs.readFileSync('app/src/main/assets/apps/mapping/js/ict-workspace/dashboard-v2.js', 'utf8');
  if (!dashCode.includes('uniqueBearOBs') || !dashCode.includes('uniqueBullOBs')) {
    anomalies.push({
      type: 'CODE_DEFECT',
      detail: 'dashboard-v2.js kehilangan parser OB mandiri (uniqueBearOBs/uniqueBullOBs)'
    });
  }
  if (!dashCode.includes('poi-sell-zone-ban') || !dashCode.includes('poi-buy-zone-ban')) {
    anomalies.push({
      type: 'CODE_DEFECT',
      detail: 'dashboard-v2.js kehilangan pelindung zone-ban (larangan Sell di diskon / Buy di premium)'
    });
  }

  // 4. Audit Level POI MTF Supply & Demand
  const supMatch = String(rows['7_supply_mtf'] || '').match(/([\d.]+)[-\s]+([\d.]+)/);
  if (supMatch) {
    const sLo = Number(supMatch[1]), sHi = Number(supMatch[2]);
    if (sLo > sHi) {
      anomalies.push({ type: 'POI_RANGE_INVERSION', detail: `Supply MTF terbalik: low (${sLo}) > high (${sHi})` });
    }
  }

  const demMatch = String(rows['8_demand_mtf'] || '').match(/([\d.]+)[-\s]+([\d.]+)/);
  if (demMatch) {
    const dLo = Number(demMatch[1]), dHi = Number(demMatch[2]);
    if (dLo > dHi) {
      anomalies.push({ type: 'POI_RANGE_INVERSION', detail: `Demand MTF terbalik: low (${dLo}) > high (${dHi})` });
    }
  }

  const healthy = anomalies.length === 0;
  return {
    healthy,
    livePrice,
    pct,
    eq,
    isDiscount,
    isPremium,
    bias: rows['1_3tf_bias'],
    fase: rows['2_fase_market'],
    supply: rows['7_supply_mtf'],
    demand: rows['8_demand_mtf'],
    panduan: rows['10_panduan'],
    anomalies
  };
}

// Eksekusi jika dijalankan langsung via node
if (process.argv[1]?.endsWith('mapping-watchdog.mjs')) {
  const result = runMappingAudit();
  console.log(JSON.stringify(result, null, 2));
}
