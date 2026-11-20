const DISPLAY_ZONE = 'Asia/Makassar';

const SESSION_DEFINITIONS = Object.freeze({
  ASIA: Object.freeze({
    id: 'ASIA',
    label: 'Tokyo / Asia',
    timeZone: 'Asia/Makassar',
    startMinute: 8 * 60,
    endMinute: 12 * 60
  }),
  LONDON: Object.freeze({
    id: 'LONDON',
    label: 'London',
    timeZone: 'Europe/London',
    startMinute: 8 * 60,
    endMinute: 11 * 60
  }),
  NEW_YORK: Object.freeze({
    id: 'NEW_YORK',
    label: 'New York',
    timeZone: 'America/New_York',
    startMinute: 7 * 60 + 30,
    endMinute: 16 * 60
  })
});

function timestampMs(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return NaN;
  return number > 10_000_000_000 ? number : number * 1000;
}

function zonedParts(timestamp, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(timestamp));
  const read = type => Number(parts.find(item => item.type === type)?.value || 0);
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second')
  };
}

function sourceOffsetMinutes(timestamp, timeZone) {
  const observed = zonedParts(timestamp, timeZone);
  const observedAsUtc = Date.UTC(
    observed.year,
    observed.month - 1,
    observed.day,
    observed.hour,
    observed.minute,
    observed.second
  );
  return Math.round((observedAsUtc - timestamp) / 60000);
}

function sourceSeason(timestamp, timeZone) {
  if (timeZone === 'Asia/Makassar' || timeZone === 'Asia/Tokyo') {
    return 'WITA';
  }
  const offset = sourceOffsetMinutes(timestamp, timeZone);
  if (timeZone === 'America/New_York') {
    if (offset === -240) return 'EDT';
    if (offset === -300) return 'EST';
  }
  if (timeZone === 'Europe/London') {
    if (offset === 60) return 'BST';
    if (offset === 0) return 'GMT';
  }
  const sign = offset >= 0 ? '+' : '-';
  const absolute = Math.abs(offset);
  return `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
}

function zonedTimestamp(dateParts, minuteOfDay, timeZone) {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const targetAsUtc = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    hour,
    minute,
    0
  );
  let guess = targetAsUtc;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const observed = zonedParts(guess, timeZone);
    const observedAsUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second
    );
    const correction = targetAsUtc - observedAsUtc;
    guess += correction;
    if (Math.abs(correction) < 1000) break;
  }
  return guess;
}

function formatWita(timestamp) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: DISPLAY_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(timestamp)).replace('.', ':');
}

function minuteInZone(timestamp, timeZone) {
  const parts = zonedParts(timestamp, timeZone);
  return parts.hour * 60 + parts.minute;
}

function inWindow(minute, start, end) {
  return start < end
    ? minute >= start && minute < end
    : minute >= start || minute < end;
}

function sessionDetail(definition, timestamp) {
  const sourceDate = zonedParts(timestamp, definition.timeZone);
  const start = zonedTimestamp(sourceDate, definition.startMinute, definition.timeZone);
  const end = zonedTimestamp(sourceDate, definition.endMinute, definition.timeZone);
  return {
    id: definition.id,
    label: definition.label,
    timeZone: definition.timeZone,
    season: sourceSeason(timestamp, definition.timeZone),
    active: inWindow(
      minuteInZone(timestamp, definition.timeZone),
      definition.startMinute,
      definition.endMinute
    ),
    sourceStartMinute: definition.startMinute,
    sourceEndMinute: definition.endMinute,
    start,
    end,
    witaStart: formatWita(start),
    witaEnd: formatWita(end)
  };
}

export function executionSessionState(value, mode = 'NONE') {
  const timestamp = timestampMs(value);
  if (!Number.isFinite(timestamp)) {
    return {
      mode,
      ready: false,
      allowed: mode === 'NONE',
      activeSession: 'UNKNOWN',
      asia: null,
      london: null,
      newYork: null,
      source: 'DST_AWARE_SESSION_CLOCK_V1'
    };
  }
  const asia = sessionDetail(SESSION_DEFINITIONS.ASIA, timestamp);
  const london = sessionDetail(SESSION_DEFINITIONS.LONDON, timestamp);
  const newYork = sessionDetail(SESSION_DEFINITIONS.NEW_YORK, timestamp);
  const allowed = mode === 'NONE'
    ? true
    : mode === 'NEW_YORK_ONLY'
      ? newYork.active
      : mode === 'LONDON_ONLY'
        ? london.active
        : mode === 'ASIA_ONLY'
          ? asia.active
          : london.active || newYork.active;
  const activeSession = newYork.active
    ? 'NEW_YORK'
    : london.active
      ? 'LONDON'
      : asia.active
        ? 'ASIA'
        : 'OFF_SESSION';
  return {
    mode,
    ready: true,
    allowed,
    activeSession,
    asia,
    london,
    newYork,
    displayZone: DISPLAY_ZONE,
    source: 'DST_AWARE_SESSION_CLOCK_V1'
  };
}

export function executionSessionAllowed(value, mode = 'NONE') {
  return executionSessionState(value, mode).allowed;
}

export function executionSessionRequirement(mode = 'NONE', value = Date.now()) {
  if (mode === 'NONE') return 'Tidak menjadi hard gate';
  const state = executionSessionState(value, mode);
  if (!state.ready) return 'Jam sesi belum dapat dihitung';
  const asia = `Asia ${state.asia.witaStart}–${state.asia.witaEnd} WITA`;
  const london = `London ${state.london.witaStart}–${state.london.witaEnd} WITA (${state.london.season})`;
  const newYork = `New York ${state.newYork.witaStart}–${state.newYork.witaEnd} WITA (${state.newYork.season})`;
  if (mode === 'ASIA_ONLY') return `${asia} · WITA`;
  if (mode === 'NEW_YORK_ONLY') return `${newYork} · DST otomatis`;
  if (mode === 'LONDON_ONLY') return `${london} · DST otomatis`;
  return `${london} / ${newYork} · DST otomatis`;
}

export const EXECUTION_SESSION_CONFIG = Object.freeze({
  displayZone: DISPLAY_ZONE,
  asia: SESSION_DEFINITIONS.ASIA,
  london: SESSION_DEFINITIONS.LONDON,
  newYork: SESSION_DEFINITIONS.NEW_YORK
});

function formatDuration(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}j ${minutes}m`;
  return `${minutes}m`;
}

function nyClockParts(timestamp) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date(timestamp));
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const hour = Number(map.hour || 0);
  const minute = Number(map.minute || 0);
  return {
    weekday: map.weekday || '',
    hour,
    minute,
    totalMinutes: hour * 60 + minute
  };
}

export function resolveGoldSessionState(value = Date.now()) {
  const timestamp = timestampMs(value);
  if (!Number.isFinite(timestamp)) {
    return {
      code: 'UNKNOWN',
      label: 'Memuat Sesi…',
      pillText: 'Memuat Sesi…',
      status: 'OFFLINE',
      isKillzone: false,
      isClosed: false,
      remainingMs: 0
    };
  }

  const ny = nyClockParts(timestamp);
  const mins = ny.totalMinutes;

  // Weekend closure: Fri 17:00 NY -> Sun 17:00 NY
  const isWeekend =
    ny.weekday === 'Sat' ||
    (ny.weekday === 'Fri' && mins >= 17 * 60) ||
    (ny.weekday === 'Sun' && mins < 17 * 60);
  if (isWeekend) {
    return {
      code: 'PASAR TUTUP',
      label: 'Pasar Tutup · Akhir Pekan',
      pillText: 'Pasar Tutup · Akhir Pekan',
      status: 'CLOSED',
      isKillzone: false,
      isClosed: true,
      remainingMs: 0
    };
  }

  // Daily Gold rollover: 17:00 - 18:00 NY
  if (mins >= 17 * 60 && mins < 18 * 60) {
    const remMs = (18 * 60 - mins) * 60000;
    return {
      code: 'PASAR TUTUP',
      label: 'Rollover Harian · 17:00–18:00 NY',
      pillText: `Rollover Harian · Buka ${formatDuration(remMs)}`,
      status: 'CLOSED',
      isKillzone: false,
      isClosed: true,
      remainingMs: remMs
    };
  }

  // London Killzone: 02:00 - 05:00 NY
  if (mins >= 2 * 60 && mins < 5 * 60) {
    const remMs = (5 * 60 - mins) * 60000;
    return {
      code: 'LONDON',
      label: 'London Killzone',
      pillText: `London Killzone · Sisa ${formatDuration(remMs)}`,
      status: 'ACTIVE',
      activeSession: 'LONDON',
      isKillzone: true,
      isClosed: false,
      remainingMs: remMs
    };
  }

  // London-NY Pre-Open: 05:00 - 07:00 NY
  if (mins >= 5 * 60 && mins < 7 * 60) {
    const remMs = (7 * 60 - mins) * 60000;
    return {
      code: 'LONDON-NY PRE-OPEN',
      label: 'London–NY Pre-Open',
      pillText: `London–NY Pre-Open · NY ${formatDuration(remMs)}`,
      status: 'UPCOMING',
      activeSession: 'OFF_SESSION',
      nextSession: 'NEW_YORK',
      isKillzone: false,
      isClosed: false,
      remainingMs: remMs
    };
  }

  // New York Killzone: 07:00 - 11:00 NY
  if (mins >= 7 * 60 && mins < 11 * 60) {
    const remMs = (11 * 60 - mins) * 60000;
    return {
      code: 'NEW YORK',
      label: 'NY Killzone',
      pillText: `NY Killzone · Sisa ${formatDuration(remMs)}`,
      status: 'ACTIVE',
      activeSession: 'NEW_YORK',
      isKillzone: true,
      isClosed: false,
      remainingMs: remMs
    };
  }

  // New York Afternoon: 11:00 - 17:00 NY
  if (mins >= 11 * 60 && mins < 17 * 60) {
    const remMs = (17 * 60 - mins) * 60000;
    return {
      code: 'NEW YORK SIANG',
      label: 'New York Siang',
      pillText: `New York Siang · Sisa ${formatDuration(remMs)}`,
      status: 'ACTIVE',
      activeSession: 'NEW_YORK',
      isKillzone: false,
      isClosed: false,
      remainingMs: remMs
    };
  }

  // Asia Session: 20:00 - 00:00 NY
  if (mins >= 20 * 60) {
    const remMs = (24 * 60 - mins) * 60000;
    return {
      code: 'ASIA',
      label: 'Sesi Asia',
      pillText: `Sesi Asia · Sisa ${formatDuration(remMs)}`,
      status: 'ACTIVE',
      activeSession: 'ASIA',
      isKillzone: false,
      isClosed: false,
      remainingMs: remMs
    };
  }

  // Transition windows: 00:00-02:00 NY (to London) or 18:00-20:00 NY (to Asia)
  if (mins < 2 * 60) {
    const remMs = (2 * 60 - mins) * 60000;
    return {
      code: 'TRANSISI',
      label: 'Transisi Sesi',
      pillText: `Transisi · London ${formatDuration(remMs)}`,
      status: 'UPCOMING',
      activeSession: 'OFF_SESSION',
      nextSession: 'LONDON',
      isKillzone: false,
      isClosed: false,
      remainingMs: remMs
    };
  }

  const remMs = (20 * 60 - mins) * 60000;
  return {
    code: 'TRANSISI',
    label: 'Transisi Sesi',
    pillText: `Transisi · Asia ${formatDuration(remMs)}`,
    status: 'UPCOMING',
    activeSession: 'OFF_SESSION',
    nextSession: 'ASIA',
    isKillzone: false,
    isClosed: false,
    remainingMs: remMs
  };
}

export function sessionCountdownPill(value = Date.now()) {
  const timestamp = timestampMs(value);
  const state = resolveGoldSessionState(timestamp);
  const asia = sessionDetail(SESSION_DEFINITIONS.ASIA, timestamp);
  const london = sessionDetail(SESSION_DEFINITIONS.LONDON, timestamp);
  const newYork = sessionDetail(SESSION_DEFINITIONS.NEW_YORK, timestamp);

  let text = state.pillText;
  let status = state.status;
  let activeSession = state.activeSession || 'OFF_SESSION';
  let nextSession = state.nextSession || null;

  if (asia.active) {
    const remaining = Math.max(0, asia.end - timestamp);
    text = `🇯🇵 Sesi Asia Aktif (Sisa ${formatDuration(remaining)})`;
    status = 'ACTIVE';
    activeSession = 'ASIA';
  } else if (london.active) {
    const remaining = Math.max(0, london.end - timestamp);
    text = `🇬🇧 London Killzone Aktif (Sisa ${formatDuration(remaining)})`;
    status = 'ACTIVE';
    activeSession = 'LONDON';
  } else if (newYork.active) {
    const remaining = Math.max(0, newYork.end - timestamp);
    text = `🇺🇸 New York Sesi Aktif (Sisa ${formatDuration(remaining)})`;
    status = 'ACTIVE';
    activeSession = 'NEW_YORK';
  } else if (timestamp < newYork.start && (timestamp >= london.end || timestamp >= newYork.start - 2 * 3600 * 1000)) {
    const msUntil = newYork.start - timestamp;
    text = `🇺🇸 Menuju NY Open dalam ${formatDuration(msUntil)} (${newYork.witaStart} WITA)`;
    status = 'UPCOMING';
    nextSession = 'NEW_YORK';
    activeSession = 'OFF_SESSION';
  } else if (timestamp < london.start && timestamp >= london.start - 2 * 3600 * 1000) {
    const msUntil = london.start - timestamp;
    text = `🇬🇧 Menuju London Open dalam ${formatDuration(msUntil)} (${london.witaStart} WITA)`;
    status = 'UPCOMING';
    nextSession = 'LONDON';
    activeSession = 'OFF_SESSION';
  } else if (timestamp < asia.start) {
    const msUntil = asia.start - timestamp;
    text = `🇯🇵 Menuju Sesi Asia dalam ${formatDuration(msUntil)} (${asia.witaStart} WITA)`;
    status = 'UPCOMING';
    nextSession = 'ASIA';
    activeSession = 'OFF_SESSION';
  }

  return {
    text,
    label: state.label,
    code: state.code,
    activeSession,
    nextSession,
    status,
    isKillzone: state.isKillzone,
    isClosed: state.isClosed,
    remainingMs: state.remainingMs
  };
}

export function updateCockpitSessionPill(element, timestamp = Date.now()) {
  const pillEl = typeof element === 'string' ? (typeof document !== 'undefined' ? document.getElementById(element) : null) : element;
  if (!pillEl) return null;
  const info = sessionCountdownPill(timestamp);
  pillEl.textContent = info.text;
  if (info.status === 'CLOSED') {
    pillEl.className = 'cockpit-session-pill session-closed';
    pillEl.style.color = '#f87171';
    pillEl.style.borderColor = 'rgba(248,113,113,0.38)';
    pillEl.style.background = 'rgba(248,113,113,0.12)';
  } else if (info.status === 'ACTIVE' && info.isKillzone) {
    pillEl.className = 'cockpit-session-pill session-active';
    pillEl.style.color = '#22C55E';
    pillEl.style.borderColor = 'rgba(34,197,94,0.4)';
    pillEl.style.background = 'rgba(34,197,94,0.12)';
  } else if (info.status === 'ACTIVE') {
    pillEl.className = 'cockpit-session-pill session-active';
    pillEl.style.color = '#38bdf8';
    pillEl.style.borderColor = 'rgba(56,189,248,0.35)';
    pillEl.style.background = 'rgba(56,189,248,0.10)';
  } else {
    pillEl.className = 'cockpit-session-pill session-upcoming';
    pillEl.style.color = 'var(--amy-accent,#F5C451)';
    pillEl.style.borderColor = 'rgba(245,196,81,0.3)';
    pillEl.style.background = 'rgba(245,196,81,0.1)';
  }
  return info;
}

export function startCockpitSessionPill(element = 'cockpit-session-pill', intervalMs = 30000) {
  updateCockpitSessionPill(element);
  if (typeof setInterval !== 'undefined' && intervalMs > 0) {
    return setInterval(() => updateCockpitSessionPill(element), intervalMs);
  }
  return null;
}

if (typeof window !== 'undefined') {
  window.AmySessionClock = { resolveGoldSessionState, sessionCountdownPill, updateCockpitSessionPill };
}
