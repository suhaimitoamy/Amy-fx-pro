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

  // 2. Perhitungan matematis langsung terhadap harga live (selaras 100% dengan Dealing Range Card: <47.5% Diskon, >52.5% Premium)
  const top = Number(dr?.rangeHigh ?? dr?.rHigh ?? dr?.top ?? dr?.high);
  const bottom = Number(dr?.rangeLow ?? dr?.rLow ?? dr?.bottom ?? dr?.low);
  let eq = Number(dr?.equilibrium ?? dr?.eq);
  if ((!Number.isFinite(eq) || eq <= 0) && Number.isFinite(top) && Number.isFinite(bottom) && top > bottom) {
    eq = (top + bottom) / 2;
  }

  if (Number.isFinite(top) && Number.isFinite(bottom) && top > bottom) {
    const pct = Math.min(100, Math.max(0, ((p - bottom) / (top - bottom)) * 100));
    if (pct < 47.5) {
      return {
        zone: 'DISCOUNT',
        text: 'ZONA DISKON (<47.5%) 🟢',
        className: 'dr-badge dr-discount',
        eq
      };
    }
    if (pct > 52.5) {
      return {
        zone: 'PREMIUM',
        text: 'ZONA PREMIUM (>52.5%) 🔴',
        className: 'dr-badge dr-premium',
        eq
      };
    }
    return {
      zone: 'EQUILIBRIUM',
      text: 'EQUILIBRIUM 50% · NO-TRADE ⚪',
      className: 'dr-badge dr-neutral',
      eq
    };
  }

  if (Number.isFinite(eq) && eq > 0) {
    const threshold = 0.5;
    if (Math.abs(p - eq) <= threshold) {
      return {
        zone: 'EQUILIBRIUM',
        text: 'EQUILIBRIUM 50% · NO-TRADE ⚪',
        className: 'dr-badge dr-neutral',
        eq
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
    className: 'dr-badge dr-neutral'
  };
}

export function updateDealingRangeBadge(badgeEl, price, dealingRange) {
  if (!badgeEl) return;
  const status = getDealingRangeStatus(price, dealingRange);
  badgeEl.textContent = status.text;
  badgeEl.className = status.className;
}
