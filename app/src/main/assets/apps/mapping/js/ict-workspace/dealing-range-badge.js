/**
 * Amy FX Pro — Dealing Range Mini-Badge Engine
 * Single Source of Truth dengan Card Dealing Range:
 * - Breakdown Bearish (tembus Range Low searah tren/BOS): [ BREAKDOWN · 0% ] (.dr-breakdown)
 * - Breakout Bullish (tembus Range High searah tren/BOS): [ BREAKOUT · 100% ] (.dr-breakout)
 * - Harga < 47.5%: [ ZONA DISKON · XX% ] (.dr-discount)
 * - Harga > 52.5%: [ ZONA PREMIUM · XX% ] (.dr-premium)
 * - Kisaran 47.5%–52.5%: [ EQUILIBRIUM · XX% ] (.dr-neutral)
 */

function resolveStructureDirection(dr) {
  let m15Dir = Number(dr?.m15Dir) || 0;
  let lastEvBear = Boolean(dr?.lastEvBear);
  let lastEvBull = Boolean(dr?.lastEvBull);

  if (typeof window !== 'undefined') {
    const ctx = window.amyfxLastContext;
    const ng = window.amyfxLastIndicators;
    if (!m15Dir && ctx) {
      const m15Struct = String(ctx.m15?.structure || '').toUpperCase();
      const m15Control = String(ctx.m15?.control || '').toUpperCase();
      const biasDir = ctx.amy?.dashboard?.biasDir;
      if (m15Struct.includes('BEAR') || m15Control.includes('SELLER') || biasDir === -1) m15Dir = -1;
      else if (m15Struct.includes('BULL') || m15Control.includes('BUYER') || biasDir === 1) m15Dir = 1;
    }
    if (!lastEvBear && !lastEvBull && ng?.structure?.lastEvent) {
      const ev = ng.structure.lastEvent;
      const evDir = String(ev.direction || ev.side || '').toUpperCase();
      if (evDir.includes('BEAR') || ev.dir === -1) lastEvBear = true;
      else if (evDir.includes('BULL') || ev.dir === 1) lastEvBull = true;
    }
  }
  return { m15Dir, lastEvBear, lastEvBull };
}

export function getDealingRangeStatus(price, dealingRange) {
  const p = Number(price);
  if (!Number.isFinite(p) || p <= 0) {
    return {
      zone: 'EQUILIBRIUM',
      text: 'EQUILIBRIUM 50% · NO-TRADE ⚪',
      className: 'dr-badge dr-neutral',
      pct: 50
    };
  }

  // 1. Fallback cerdas ke window.amyfxLastDealingRange jika parameter dealingRange kosong / parsial
  const winDr = typeof window !== 'undefined' ? window.amyfxLastDealingRange : null;
  const dr = (dealingRange && (dealingRange.high || dealingRange.top || dealingRange.rangeHigh || dealingRange.rHigh || dealingRange.location))
    ? { ...winDr, ...dealingRange }
    : winDr;

  // 2. Perhitungan matematis langsung terhadap harga live (selaras 100% dengan Dealing Range Card)
  const top = Number(dr?.rangeHigh ?? dr?.rHigh ?? dr?.top ?? dr?.high);
  const bottom = Number(dr?.rangeLow ?? dr?.rLow ?? dr?.bottom ?? dr?.low);
  let eq = Number(dr?.equilibrium ?? dr?.eq);
  if ((!Number.isFinite(eq) || eq <= 0) && Number.isFinite(top) && Number.isFinite(bottom) && top > bottom) {
    eq = (top + bottom) / 2;
  }

  if (Number.isFinite(top) && Number.isFinite(bottom) && top > bottom) {
    const rawPct = ((p - bottom) / (top - bottom)) * 100;
    const pct = Math.min(100, Math.max(0, Math.round(rawPct)));
    const { m15Dir, lastEvBear, lastEvBull } = resolveStructureDirection(dr);
    const isSslSwept = p < bottom;
    const isBslSwept = p > top;
    const isBearBreakdown = isSslSwept && (m15Dir === -1 && ((bottom - p) > 3.0 || lastEvBear));
    const isBullBreakout = isBslSwept && (m15Dir === 1 && ((p - top) > 3.0 || lastEvBull));

    if (isBearBreakdown) {
      return {
        zone: 'BREAKDOWN',
        text: `BREAKDOWN · ${pct}%`,
        className: 'dr-badge dr-breakdown',
        eq,
        pct
      };
    }
    if (isBullBreakout) {
      return {
        zone: 'BREAKOUT',
        text: `BREAKOUT · ${pct}%`,
        className: 'dr-badge dr-breakout',
        eq,
        pct
      };
    }
    if (rawPct < 47.5) {
      return {
        zone: 'DISCOUNT',
        text: 'ZONA DISKON (<47.5%) 🟢',
        className: 'dr-badge dr-discount',
        eq,
        pct
      };
    }
    if (rawPct > 52.5) {
      return {
        zone: 'PREMIUM',
        text: 'ZONA PREMIUM (>52.5%) 🔴',
        className: 'dr-badge dr-premium',
        eq,
        pct
      };
    }
    return {
      zone: 'EQUILIBRIUM',
      text: 'EQUILIBRIUM 50% · NO-TRADE ⚪',
      className: 'dr-badge dr-neutral',
      eq,
      pct
    };
  }

  if (Number.isFinite(eq) && eq > 0) {
    const threshold = 0.5;
    if (Math.abs(p - eq) <= threshold) {
      return {
        zone: 'EQUILIBRIUM',
        text: 'EQUILIBRIUM 50% · NO-TRADE ⚪',
        className: 'dr-badge dr-neutral',
        eq,
        pct: 50
      };
    }
    if (p < eq) {
      return {
        zone: 'DISCOUNT',
        text: 'ZONA DISKON (<47.5%) 🟢',
        className: 'dr-badge dr-discount',
        eq
      };
    }
    return {
      zone: 'PREMIUM',
      text: 'ZONA PREMIUM (>52.5%) 🔴',
      className: 'dr-badge dr-premium',
      eq
    };
  }

  // 3. Fallback string lokasi hanya jika batas numerik Dealing Range belum tersedia
  const loc = String(dr?.location || dr?.currentZone || dr?.zone || '').toUpperCase();
  if (loc.includes('DISCOUNT')) {
    return {
      zone: 'DISCOUNT',
      text: 'ZONA DISKON (<47.5%) 🟢',
      className: 'dr-badge dr-discount'
    };
  }
  if (loc.includes('PREMIUM')) {
    return {
      zone: 'PREMIUM',
      text: 'ZONA PREMIUM (>52.5%) 🔴',
      className: 'dr-badge dr-premium'
    };
  }

  // Default fallback
  return {
    zone: 'EQUILIBRIUM',
    text: 'EQUILIBRIUM 50% · NO-TRADE ⚪',
    className: 'dr-badge dr-neutral',
    pct: 50
  };
}

export function updateDealingRangeBadge(badgeEl, price, dealingRange) {
  if (!badgeEl) return;
  const status = getDealingRangeStatus(price, dealingRange);
  badgeEl.textContent = status.text;
  badgeEl.className = status.className;
}
