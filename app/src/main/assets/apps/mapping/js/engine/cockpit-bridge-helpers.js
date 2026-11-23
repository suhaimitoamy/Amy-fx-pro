/* Amy FX Pro — Pure Bridge Helpers for Mapping Cockpit
 * 1. buildMappingJournalPrefill: Converts an active BUY/SELL POI plan into a pre-filled Journal entry.
 * 2. evaluateMappingNewsLock: Evaluates USD High-Impact calendar events for Mapping News Lock warnings.
 */

const DAY_MIN_MS = 60_000;

function finiteNum(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function fmtPrice(val) {
  const n = finiteNum(val);
  return n === null ? '—' : n.toFixed(2);
}

export function inferWitaSessionLabel(nowMs = Date.now(), sessionHint = '') {
  const hint = String(sessionHint || '').trim();
  if (/ny\s*pm|london\s*close/i.test(hint)) return 'NY PM';
  if (/ny\s*am|new\s*york|silver\s*bullet/i.test(hint)) return 'NY AM';
  if (/london|frankfurt/i.test(hint)) return 'London';
  if (/asia|tokyo|sydney/i.test(hint)) return 'Asia';

  const d = new Date(Number.isFinite(Number(nowMs)) ? Number(nowMs) : Date.now());
  const witaHour = (d.getUTCHours() + 8) % 24;
  if (witaHour >= 7 && witaHour <= 14) return 'Asia';
  if (witaHour >= 15 && witaHour <= 19) return 'London';
  if (witaHour >= 20 || witaHour === 0) return 'NY AM';
  return 'NY PM';
}

export function buildMappingJournalPrefill(plan, overlay = null, context = {}) {
  const sideRaw = String(plan?.side || overlay?.side || context.side || 'BUY').toUpperCase();
  const isSell = sideRaw === 'SELL';
  const direction = isSell ? 'Sell' : 'Buy';
  const nowMs = Number.isFinite(Number(context.nowMs)) ? Number(context.nowMs) : Date.now();
  const witaDate = new Date(nowMs + 8 * 3600_000).toISOString().slice(0, 10);

  const entry = finiteNum(plan?.entry ?? overlay?.area?.ce ?? overlay?.alarmPrice);
  const sl = finiteNum(plan?.sl);
  const tp1 = finiteNum(plan?.tp1 ?? plan?.tp);
  const tp2 = finiteNum(plan?.tp2 ?? plan?.dol);

  const riskDist = entry !== null && sl !== null ? Math.abs(entry - sl) : null;
  const rewardDist = entry !== null && tp2 !== null
    ? Math.abs(tp2 - entry)
    : entry !== null && tp1 !== null
      ? Math.abs(tp1 - entry)
      : null;
  const computedRr = riskDist && riskDist > 0 && rewardDist && rewardDist > 0
    ? Math.round((rewardDist / riskDist) * 10) / 10
    : finiteNum(plan?.rr);

  const kindLabel = String(overlay?.kind || plan?.kind || 'POI').trim();
  const tfLabel = String(overlay?.tf || plan?.tf || 'M15').trim().toUpperCase();
  const gradeLabel = String(context.grade || '').trim();
  const biasLabel = String(context.bias || '').trim();
  const session = inferWitaSessionLabel(nowMs, context.session);

  const areaLow = finiteNum(overlay?.area?.low);
  const areaHigh = finiteNum(overlay?.area?.high);
  const zoneText = areaLow !== null && areaHigh !== null
    ? `$${fmtPrice(areaLow)}–$${fmtPrice(areaHigh)}`
    : entry !== null
      ? `$${fmtPrice(entry)}`
      : '';

  const setupParts = [`ICT ${kindLabel} ${tfLabel}`];
  if (gradeLabel) setupParts.push(gradeLabel);
  const setup = setupParts.join(' · ');

  const title = zoneText
    ? `${isSell ? 'SELL' : 'BUY'} XAU/USD · ${kindLabel} ${tfLabel} (${zoneText})`
    : `${isSell ? 'SELL' : 'BUY'} XAU/USD · ${kindLabel} ${tfLabel}`;

  const evalLines = [
    `[Rencana POI Mapping · ${isSell ? 'SELL' : 'BUY'} ${kindLabel} ${tfLabel}]`,
    `Entry CE: $${fmtPrice(entry)} | SL: $${fmtPrice(sl)} | TP1: $${fmtPrice(tp1)}${tp2 !== null ? ` | TP2/DOL: $${fmtPrice(tp2)}` : ''}`
  ];
  if (biasLabel) evalLines.push(`Konteks Bias: ${biasLabel}`);
  if (gradeLabel) evalLines.push(`Kelayakan: ${gradeLabel}`);

  return {
    source: 'mapping-poi',
    accountMode: context.accountMode === 'SIM' ? 'SIM' : 'REAL',
    date: witaDate,
    market: 'XAU/USD',
    direction,
    result: 'Belum selesai',
    riskReward: computedRr !== null && computedRr > 0 ? computedRr : null,
    setup,
    session,
    title,
    evaluation: evalLines.join('\n'),
    meta: {
      entry,
      sl,
      tp1,
      tp2,
      kind: kindLabel,
      tf: tfLabel,
      createdAt: nowMs
    }
  };
}

function parseEventTimestampMs(ev) {
  if (!ev || typeof ev !== 'object') return null;
  const direct = finiteNum(ev.timestampMs ?? ev.ts ?? ev.epochMs);
  if (direct !== null) return direct > 1e11 ? direct : direct * 1000;
  const raw = ev.dateIso || ev.iso || ev.datetime || ev.date || ev.timeIso;
  if (!raw) return null;
  const ms = Date.parse(String(raw));
  return Number.isFinite(ms) ? ms : null;
}

function formatWitaClock(ms) {
  try {
    const d = new Date(ms + 8 * 3600_000);
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm} WITA`;
  } catch {
    return '';
  }
}

export function evaluateMappingNewsLock(events, nowMs = Date.now()) {
  const now = Number.isFinite(Number(nowMs)) ? Number(nowMs) : Date.now();
  const list = Array.isArray(events) ? events : [];

  const relevant = [];
  for (const ev of list) {
    if (!ev || typeof ev !== 'object') continue;
    const country = String(ev.country || ev.currency || '').toUpperCase();
    const impact = String(ev.impact || '').toLowerCase();
    const isUsd = country === 'USD' || country === 'US';
    const isHigh = impact === 'high' || impact === 'red' || impact === 'tinggi';
    if (!isUsd || !isHigh) continue;

    const ts = parseEventTimestampMs(ev);
    if (ts === null) continue;
    const diffMin = Math.round((ts - now) / DAY_MIN_MS);
    // Lock window: 15 min before through 30 min after release; Warn window: up to 90 min before
    if (diffMin >= -30 && diffMin <= 90) {
      relevant.push({
        title: String(ev.title || ev.event || 'Berita USD High-Impact').trim(),
        ts,
        diffMin,
        timeLabel: formatWitaClock(ts)
      });
    }
  }

  if (!relevant.length) {
    return {
      level: 'SAFE',
      locked: false,
      title: '',
      timeLabel: '',
      minsUntil: null,
      message: ''
    };
  }

  // Prioritize active LOCK events first, then nearest upcoming event
  relevant.sort((a, b) => {
    const aLock = a.diffMin <= 15 ? 0 : 1;
    const bLock = b.diffMin <= 15 ? 0 : 1;
    if (aLock !== bLock) return aLock - bLock;
    return Math.abs(a.diffMin) - Math.abs(b.diffMin);
  });

  const top = relevant[0];
  if (top.diffMin <= 15) {
    const timing = top.diffMin > 0
      ? `rilis ${top.diffMin}m lagi`
      : top.diffMin === 0
        ? 'sedang rilis sekarang'
        : `rilis ${Math.abs(top.diffMin)}m lalu`;
    return {
      level: 'LOCK',
      locked: true,
      title: top.title,
      timeLabel: top.timeLabel,
      minsUntil: top.diffMin,
      message: `News Lock ±15m · ${top.title} (${timing}, ${top.timeLabel}) — tahan eksekusi baru.`
    };
  }

  return {
    level: 'WARN',
    locked: false,
    title: top.title,
    timeLabel: top.timeLabel,
    minsUntil: top.diffMin,
    message: `Waspada Berita USD High-Impact dalam ${top.diffMin} menit: ${top.title} (${top.timeLabel}).`
  };
}
