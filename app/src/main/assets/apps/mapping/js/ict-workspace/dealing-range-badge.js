/**
 * Amy FX Pro — Dealing Range Mini-Badge Engine
 * Item 2.7 Blueprint: Mini-Badge Status Dealing Range di Header Chart Gold.
 *
 * Logika ICT murni:
 * - Harga < 50% Equilibrium: [ ZONA DISKON (<47.5%) 🟢 ] (.dr-discount)
 * - Harga > 50% Equilibrium: [ ZONA PREMIUM (>52.5%) 🔴 ] (.dr-premium)
 * - Kisaran 50% Equilibrium (CE): [ EQUILIBRIUM 50% · NO-TRADE ⚪ ] (.dr-neutral)
 */

export function getDealingRangeStatus(price, dealingRange) {
  const p = Number(price);
  if (!Number.isFinite(p) || p <= 0) {
    return {
      zone: 'EQUILIBRIUM',
      text: 'EQUILIBRIUM 50% · NO-TRADE ⚪',
      className: 'dr-badge dr-neutral'
    };
  }

  // 1. Fallback cerdas ke window.amyfxLastDealingRange jika parameter dealingRange kosong / parsial
  const dr = (dealingRange && (dealingRange.high || dealingRange.top || dealingRange.rangeHigh || dealingRange.rHigh || dealingRange.location))
    ? dealingRange
    : (typeof window !== 'undefined' ? window.amyfxLastDealingRange : null);

  // 2. Prioritas string lokasi terkonfirmasi dari model
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

  // 3. Perhitungan matematis level Equilibrium 50%
  let eq = Number(dr?.equilibrium ?? dr?.eq);
  const top = Number(dr?.rangeHigh ?? dr?.rHigh ?? dr?.top ?? dr?.high);
  const bottom = Number(dr?.rangeLow ?? dr?.rLow ?? dr?.bottom ?? dr?.low);

  if (!Number.isFinite(eq) && Number.isFinite(top) && Number.isFinite(bottom) && top > bottom) {
    eq = (top + bottom) / 2;
  }

  if (Number.isFinite(eq) && eq > 0) {
    const span = Number.isFinite(top) && Number.isFinite(bottom) && top > bottom ? (top - bottom) : 20.0;
    const threshold = Math.max(0.5, span * 0.05); // Band netral 5% di sekitar 50% CE

    if (Math.abs(p - eq) <= threshold) {
      return {
        zone: 'EQUILIBRIUM',
        text: 'EQUILIBRIUM 50% · NO-TRADE ⚪',
        className: 'dr-badge dr-neutral',
        eq
      };
    } else if (p < eq) {
      return {
        zone: 'DISCOUNT',
        text: 'ZONA DISKON (<47.5%) 🟢',
        className: 'dr-badge dr-discount',
        eq
      };
    } else {
      return {
        zone: 'PREMIUM',
        text: 'ZONA PREMIUM (>52.5%) 🔴',
        className: 'dr-badge dr-premium',
        eq
      };
    }
  }

  // Default fallback
  return {
    zone: 'EQUILIBRIUM',
    text: 'EQUILIBRIUM 50% · NO-TRADE ⚪',
    className: 'dr-badge dr-neutral'
  };
}

export function updateDealingRangeBadge(badgeEl, price, dealingRange) {
  if (!badgeEl) return;
  const status = getDealingRangeStatus(price, dealingRange);
  badgeEl.textContent = status.text;
  badgeEl.className = status.className;
}
