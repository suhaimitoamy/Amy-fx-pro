/**
 * Amy FX Pro — Market Intelligence Engine
 * =======================================
 * - Kompas Fundamental XAU/USD (Live Calendar + News Evidence + Mapping Bridge)
 * - Berita Real-Time (Sanitized Server Translation, Gold/Impact Filtering, Zero CORS)
 * - Kalender Ekonomi (Hari Ini & Mendatang di Atas, Riwayat Selesai dalam Akordeon)
 */

function resolveApiBase() {
  const host = typeof location !== 'undefined' ? String(location.hostname || '') : '';
  const isLocal = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  return isLocal ? '/api' : 'https://amy-fx.vercel.app/api';
}
const API_BASE = resolveApiBase();
const REFRESH_INTERVAL = 60 * 1000;

// ─── State ───────────────────────────────────────────────
let currentTab = 'sentiment';
let pendingNewsId = '';
let newsRouteRetries = 0;
let newsFetchSequence = 0;
let isCalendarLive = false;
let latestNewsItems = [];
let currentNewsFilter = 'gold';
let calendarEvents = [];
let currentCalendarFilter = 'gold';
const requestControllers = {};
const panelLoadedAt = {};

const CALENDAR_ENDPOINTS = [
  ...(typeof location !== 'undefined' && location.origin && !location.origin.startsWith('file:') ? [`${location.origin}/api/calendar`] : []),
  'https://amy-fx.vercel.app/api/calendar',
  'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
  'https://wliecyxzlwhmtftnfnps.supabase.co/functions/v1/economic-calendar'
];
const CALENDAR_CACHE_KEY = 'amy_economic_calendar_v1';
const NEWS_CACHE_KEY = 'amyfx.assistant.news.v1';
const MACRO_CACHE_KEY = 'amy_macro_snapshot_v1';
const MACRO_MEMORY_TTL_MS = 45 * 1000;
const MACRO_CACHE_MAX_AGE_MS = 15 * 60 * 1000;
let latestMacroSnapshot = null;
let macroFetchInFlight = null;

const COUNTRY_FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  CAD: '🇨🇦', AUD: '🇦🇺', NZD: '🇳🇿', CHF: '🇨🇭', CNY: '🇨🇳'
};

// ─── Shared Helpers ──────────────────────────────────────
function newsId(item) {
  return String(item?.id || `${item?.time || ''}:${item?.textOriginal || item?.text || ''}`);
}

function newsTargetUrl(id) {
  return `file:///android_asset/apps/market-intel/index.html#news=${encodeURIComponent(id)}`;
}

function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ');
}

function cleanNewsContent(value) {
  return decodeHtmlEntities(value)
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u200b|\u200c|\u200d|\ufeff/g, '')
    .replace(/https?:\/\/(?:t\.me|telegram\.me|telegram\.dog)\/\S+/gi, '')
    .replace(/Please open Telegram to view this post/gi, '')
    .replace(/VIEW IN TELEGRAM/gi, '')
    .replace(/Buka Telegram untuk melihat postingan ini/gi, '')
    .replace(/LIHAT DI TELEGRAM/gi, '')
    .replace(/@?SM[\s_-]*News[\s_-]*(?:24h?|24[\s_-]*jam)?/gi, '')
    .replace(/Follow\s+For\s+Real-Time\s+Company\s+Profit\s+Reports!?/gi, '')
    .replace(/Ikuti\s+Untuk\s+Laporan\s+Laba\s+Perusahaan\s+Real-Time!?/gi, '')
    .replace(/^\s*(?:Updates\s+From|Explore\s+Results\s+On|Info\s+Terbaru\s+dari|Telusuri\s+Hasil\s+Pada)\b.*$/gim, '')
    .replace(/^\s*(?:sumber|source)\s*:\s*$/gim, '')
    .replace(/[_\u2014\u2013\-]{5,}/g, '')
    .replace(/(?:[\u{1F300}-\u{1FAFF}\u2600-\u27BF]\s*\d+\s*)+$/gmu, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isStockNoise(textLower) {
  return (
    textLower.includes('earnings report') ||
    textLower.includes('laporan laba') ||
    textLower.includes('eps |') ||
    textLower.includes('market cap:') ||
    textLower.includes('min left for the new york session') ||
    textLower.includes('menit lagi menjelang sesi new york') ||
    textLower.includes('us30 companies') ||
    textLower.includes('perusahaan us30') ||
    textLower.includes('usnas100') ||
    /\bipo\b/i.test(textLower)
  );
}

const GOLD_CORE_KEYWORDS = [
  'gold', 'xau', 'emas', 'bullion', 'fed', 'fomc', 'powell', 'warsh',
  'inflation', 'inflasi', 'cpi', 'pce', 'ppi', 'treasury', 'yield', 'obligasi',
  'dxy', 'dollar', 'dolar', 'nfp', 'payroll', 'jobless', 'unemployment', 'klaim pengangguran',
  'war', 'perang', 'geopolit', 'iran', 'israel', 'hormuz', 'russia', 'rusia', 'ukraine', 'ukraina',
  'putin', 'gencatan senjata', 'ceasefire', 'nuklir', 'nuclear', 'serangan', 'attack', 'strike',
  'rudal', 'missile', 'safe haven', 'central bank', 'bank sentral', 'suku bunga', 'interest rate',
  'rate cut', 'rate hike', 'tariff', 'tarif', 'sanctions', 'sanksi', 'oil', 'minyak', 'brent', 'opec',
  'gdp', 'pdb', 'retail sales', 'pmi', 'recession', 'resesi', 'sofr', 'financing rate'
];

function isNewsRelevantForGold(item) {
  if (!item) return false;
  const text = `${item.text || ''} ${item.textOriginal || ''}`.toLowerCase();
  const hasCoreKeyword = GOLD_CORE_KEYWORDS.some(kw => text.includes(kw));
  if (isStockNoise(text) && !hasCoreKeyword) return false;
  if (hasCoreKeyword) return true;
  return item.relevant === true && !isStockNoise(text);
}

function classifyNewsCategory(item) {
  const t = `${item?.text || ''} ${item?.textOriginal || ''}`.toLowerCase();
  if (/\b(fed|fomc|powell|warsh|suku bunga|interest rate|rate cut|rate hike|bank sentral|central bank|sofr|yield|treasury|obligasi)\b/i.test(t)) {
    return { label: 'The Fed & Yield', cls: 'cat-fed' };
  }
  if (/\b(cpi|pce|ppi|inflasi|inflation|nfp|payroll|jobless|unemployment|klaim|gdp|pdb|retail sales|pmi|philly fed)\b/i.test(t)) {
    return { label: 'Data Makro AS', cls: 'cat-macro' };
  }
  if (/\b(iran|israel|hormuz|russia|rusia|ukraine|ukraina|putin|war|perang|nuklir|nuclear|rudal|missile|ceasefire|gencatan|geopolit|serangan|attack|retaliat|pentagon|crimea|krimea|tariff|tarif|sanksi|sanctions)\b/i.test(t)) {
    return { label: 'Geopolitik', cls: 'cat-geo' };
  }
  if (/\b(oil|minyak|brent|wti|opec|energi|energy)\b/i.test(t)) {
    return { label: 'Energi', cls: 'cat-energy' };
  }
  if (/\b(gold|xau|emas|bullion|dxy|dollar|dolar|safe haven)\b/i.test(t)) {
    return { label: 'Gold & USD', cls: 'cat-gold' };
  }
  return { label: 'Pasar Global', cls: 'cat-global' };
}

function getNewsImpactLevel(item) {
  if (String(item?.impact || '').toLowerCase() === 'high') return 'high';
  const t = `${item?.text || ''} ${item?.textOriginal || ''}`.toLowerCase();
  if (/\b(fomc|powell|cpi|nfp|payroll|pce|ppi|rate cut|rate hike|war|perang|nuklir|nuclear|rudal|missile|hormuz|retaliat|ceasefire|gencatan|recession|resesi|tariff|tarif|sanctions|sanksi)\b/i.test(t)) {
    return 'high';
  }
  return 'medium';
}

function prepareNewsItem(item) {
  const prepared = { ...item };
  prepared.textOriginal = cleanNewsContent(prepared.textOriginal);
  prepared.text = cleanNewsContent(prepared.text) || prepared.textOriginal || 'Berita terbaru XAU/USD.';
  prepared.impact = getNewsImpactLevel(prepared);
  prepared.relevant = isNewsRelevantForGold(prepared);
  delete prepared.link;
  delete prepared.source;
  return prepared;
}

window.openEvidenceNews = function(id) {
  activateTab('news');
  if (!focusNewsItem(id)) {
    setNewsFilter('all');
    focusNewsItem(id);
  }
};

window.openEvidenceCalendar = function() {
  activateTab('calendar');
};

function readNewsRoute() {
  try {
    const hash = (location.hash || '').replace(/^#/, '');
    const params = new URLSearchParams(hash.includes('=') ? hash : location.search);
    return params.get('news') || '';
  } catch (_) {
    return '';
  }
}

function beginRequest(panel) {
  if (requestControllers[panel]) requestControllers[panel].abort();
  requestControllers[panel] = new AbortController();
  return requestControllers[panel].signal;
}

function shouldRefresh(panel, maxAge = 30000) {
  return !panelLoadedAt[panel] || Date.now() - panelLoadedAt[panel] > maxAge;
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    if (diff >= 0 && diff < 60 * 1000) return 'Baru saja';
    if (diff >= 0 && diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m lalu`;
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' }) + ' WITA';
  } catch (_) {
    return '';
  }
}

function truncate(text, max) {
  const s = String(text || '');
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ─── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  pendingNewsId = readNewsRoute();

  setupTabs();
  setupNewsInteractions();
  setupNewsFilters();
  setupCalendarFilters();
  setupRefreshButtons();

  if (pendingNewsId) {
    activateTab('news');
  } else {
    activateTab('sentiment');
  }

  // Instant render from cache then background live sync
  loadSentiment();
  loadCalendar();
  loadNews();

  setInterval(() => {
    if (document.hidden) return;
    if (currentTab === 'news') loadNews(true);
    else if (currentTab === 'calendar') loadCalendar(true);
    else if (currentTab === 'sentiment') loadSentiment(true);
  }, REFRESH_INTERVAL);

  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('webview-idle', document.hidden);
    if (!document.hidden) {
      if (currentTab === 'news' && shouldRefresh('news', REFRESH_INTERVAL)) loadNews(true);
      if (currentTab === 'calendar' && shouldRefresh('calendar', REFRESH_INTERVAL)) loadCalendar(true);
      if (currentTab === 'sentiment') loadSentiment(true);
    }
  });
});

window.addEventListener('hashchange', () => {
  pendingNewsId = readNewsRoute();
  if (pendingNewsId) {
    activateTab('news');
    if (!focusNewsItem(pendingNewsId)) loadNews(true);
  }
});

// ─── Navigation & Controls ───────────────────────────────
function setupTabs() {
  document.querySelectorAll('.intel-tab').forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });
}

function activateTab(tab) {
  if (!['news', 'calendar', 'sentiment'].includes(tab)) return;
  currentTab = tab;
  document.querySelectorAll('.intel-tab').forEach(b => {
    const active = b.dataset.tab === tab;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.intel-panel').forEach(p => {
    p.classList.toggle('active', p.id === `panel-${tab}`);
  });
  if (tab === 'calendar' && shouldRefresh('calendar')) loadCalendar();
  else if (tab === 'news' && shouldRefresh('news')) loadNews();
  else if (tab === 'sentiment') loadSentiment();
}

function setupRefreshButtons() {
  const bindRefresh = (id, fn) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      btn.disabled = true;
      btn.classList.add('is-loading');
      try {
        await fn();
      } finally {
        btn.disabled = false;
        btn.classList.remove('is-loading');
      }
    });
  };
  bindRefresh('btn-refresh-sentiment', async () => {
    await Promise.allSettled([fetchMacroSnapshot(true), loadCalendar(true), loadNews(true)]);
    await loadSentiment(false, true);
  });
  bindRefresh('btn-refresh-news', () => loadNews(false));
  bindRefresh('btn-refresh-calendar', () => loadCalendar(false));
}

function setupNewsFilters() {
  document.querySelectorAll('.news-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      setNewsFilter(btn.dataset.newsFilter || 'gold');
    });
  });
}

function setNewsFilter(filter) {
  currentNewsFilter = filter;
  document.querySelectorAll('.news-filter').forEach(b => {
    b.classList.toggle('active', (b.dataset.newsFilter || 'gold') === filter);
  });
  const expanded = new Set(
    [...document.querySelectorAll('.news-item.expanded')].map(el => el.dataset.newsId).filter(Boolean)
  );
  renderNews(latestNewsItems, expanded);
}

// ─── Macro Event Analysis Engine ─────────────────────────
function parseCalendarNumber(str) {
  if (!str || str === '—' || str === '--') return null;
  const match = String(str).match(/([+-]?\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function scoreEventImportance(ev, nowMs) {
  const t = String(ev?.title || '').toLowerCase();
  const imp = String(ev?.impact || '').toLowerCase();
  const hasActual = Boolean(ev?.actual && ev.actual !== '—' && ev.actual !== '--');
  let score = imp === 'high' ? 50 : (imp === 'medium' ? 30 : 10);

  if (/non-farm|nonfarm|payrolls|cpi|pce|fomc|rate decision/i.test(t)) score += 60;
  else if (/retail sales|gdp|ppi|powell|fed chair|fomc meeting minutes|unemployment rate/i.test(t)) score += 45;
  else if (/unemployment claims|jobless claims|ism|pmi|adp|jolts|hourly earnings/i.test(t)) score += 35;
  else if (/philly fed|empire state|consumer sentiment|consumer confidence|durable goods/i.test(t)) score += 25;

  // Prioritaskan rilis hari ini yang SUDAH memiliki angka aktual resmi
  if (hasActual) score += 80;

  // Sedikit bonus untuk event yang waktunya paling dekat dengan sekarang
  const evMs = new Date(ev?.date).getTime();
  if (Number.isFinite(evMs)) {
    const diffHours = Math.abs(evMs - nowMs) / 3600000;
    if (diffHours <= 3) score += 12;
    else if (diffHours <= 8) score += 6;
  }
  return score;
}

function analyzeMacroEvent(ev) {
  if (!ev) return null;
  const title = String(ev.title || '').trim();
  const titleLower = title.toLowerCase();
  const fVal = parseCalendarNumber(ev.forecast);
  const pVal = parseCalendarNumber(ev.previous);
  const aVal = parseCalendarNumber(ev.actual);
  const isReleased = aVal !== null;
  const refVal = fVal !== null ? fVal : pVal;

  let category = 'other';
  let bias = 'NEUTRAL';
  let scenarioDesc = '';
  let inverseUsd = false; // true = angka lebih tinggi → buruk bagi USD → bullish Gold

  if (titleLower.includes('unemployment claims') || titleLower.includes('jobless claims') || titleLower.includes('continuing claims')) {
    category = 'claims';
    inverseUsd = true;
    if (isReleased) {
      if (refVal !== null && aVal > refVal) {
        bias = 'BULLISH_BOUNCE';
        scenarioDesc = `Klaim pengangguran aktual (${ev.actual}) lebih tinggi dari perkiraan (${ev.forecast || ev.previous}), menandakan pasar tenaga kerja AS mulai melonggar sehingga menekan USD dan membuka ruang pantulan bagi Gold.`;
      } else if (refVal !== null && aVal < refVal) {
        bias = 'BEARISH_PRESSURE';
        scenarioDesc = `Klaim pengangguran aktual (${ev.actual}) lebih rendah dari perkiraan (${ev.forecast || ev.previous}), menandakan pasar tenaga kerja AS masih ketat sehingga menopang USD dan menekan Gold.`;
      } else {
        bias = 'NEUTRAL';
        scenarioDesc = `Klaim pengangguran aktual (${ev.actual}) keluar sesuai proyeksi pasar; reaksi USD dan Gold cenderung berimbang.`;
      }
    } else if (fVal !== null && pVal !== null) {
      bias = fVal > pVal ? 'BULLISH_BOUNCE' : (fVal < pVal ? 'BEARISH_PRESSURE' : 'NEUTRAL');
      scenarioDesc = fVal > pVal
        ? `Proyeksi kenaikan klaim pengangguran (${ev.forecast} vs ${ev.previous}) memberi peluang pelemahan USD dan pantulan Gold.`
        : `Klaim pengangguran diproyeksikan tetap rendah (${ev.forecast} vs ${ev.previous}), menjaga USD tetap solid terhadap Gold.`;
    }
  } else if (titleLower.includes('unemployment rate')) {
    category = 'labor';
    inverseUsd = true;
    if (isReleased && refVal !== null) {
      bias = aVal > refVal ? 'BULLISH_BOUNCE' : (aVal < refVal ? 'BEARISH_PRESSURE' : 'NEUTRAL');
      scenarioDesc = `Tingkat pengangguran AS aktual (${ev.actual}) vs proyeksi (${ev.forecast || ev.previous}) menjadi sinyal langsung arah kebijakan The Fed.`;
    } else {
      bias = 'VOLATILE';
      scenarioDesc = 'Tingkat pengangguran AS adalah data tier-1 yang memicu volatilitas tinggi pada DXY dan Gold.';
    }
  } else if (titleLower.includes('non-farm') || titleLower.includes('nonfarm') || titleLower.includes('payrolls') || titleLower.includes('adp') || titleLower.includes('jolts')) {
    category = 'labor';
    if (isReleased && refVal !== null) {
      bias = aVal > refVal ? 'BEARISH_PRESSURE' : (aVal < refVal ? 'BULLISH_BOUNCE' : 'NEUTRAL');
      scenarioDesc = aVal > refVal
        ? `Data tenaga kerja AS aktual (${ev.actual}) melampaui ekspektasi (${ev.forecast || ev.previous}), memperkuat DXY dan menekan Gold.`
        : (aVal < refVal
          ? `Data tenaga kerja AS aktual (${ev.actual}) meleset di bawah ekspektasi (${ev.forecast || ev.previous}), melemahkan DXY dan mendukung reli Gold.`
          : `Data tenaga kerja AS aktual (${ev.actual}) sesuai ekspektasi konsensus.`);
    } else {
      bias = 'VOLATILE';
      scenarioDesc = 'Rilis data ketenagakerjaan AS menentukan ekspektasi suku bunga The Fed dan memicu volatilitas tajam pada XAU/USD.';
    }
  } else if (titleLower.includes('cpi') || titleLower.includes('pce') || titleLower.includes('ppi') || titleLower.includes('inflation') || titleLower.includes('hourly earnings')) {
    category = 'inflation';
    if (isReleased && refVal !== null) {
      bias = aVal > refVal ? 'BEARISH_PRESSURE' : (aVal < refVal ? 'BULLISH_BOUNCE' : 'NEUTRAL');
      scenarioDesc = aVal > refVal
        ? `Tekanan inflasi/upah aktual (${ev.actual}) lebih panas dari ekspektasi (${ev.forecast || ev.previous}), menjaga sikap ketat The Fed dan menekan Gold.`
        : (aVal < refVal
          ? `Data inflasi/upah aktual (${ev.actual}) lebih dingin dari ekspektasi (${ev.forecast || ev.previous}), meredakan yield dan mendorong reli Gold.`
          : `Data inflasi aktual (${ev.actual}) sesuai konsensus pasar.`);
    } else {
      bias = (fVal !== null && pVal !== null && fVal !== pVal) ? (fVal > pVal ? 'BEARISH_PRESSURE' : 'BULLISH_BOUNCE') : 'NEUTRAL';
      scenarioDesc = 'Data inflasi sangat menentukan ekspektasi suku bunga The Fed. Angka lebih panas menekan Gold; angka lebih dingin mendorong reli Gold.';
    }
  } else if (titleLower.includes('fomc') || titleLower.includes('rate decision') || titleLower.includes('powell') || titleLower.includes('fed chair') || titleLower.includes('fed governor') || titleLower.includes('fed vice')) {
    category = 'fomc';
    bias = 'FED_POLICY';
    scenarioDesc = 'Sinyal kebijakan suku bunga, notulen FOMC, dan pernyataan pejabat The Fed menjadi penggerak utama DXY dan imbal hasil US Treasury.';
  } else if (titleLower.includes('philly fed') || titleLower.includes('empire state') || titleLower.includes('pmi') || titleLower.includes('ism') || titleLower.includes('retail sales') || titleLower.includes('gdp') || titleLower.includes('durable goods') || titleLower.includes('consumer sentiment') || titleLower.includes('consumer confidence') || titleLower.includes('home sales') || titleLower.includes('housing') || titleLower.includes('building permits')) {
    category = titleLower.includes('pmi') || titleLower.includes('philly fed') || titleLower.includes('empire state') ? 'manufacturing' : 'macro';
    if (isReleased && refVal !== null) {
      bias = aVal > refVal ? 'BEARISH_PRESSURE' : (aVal < refVal ? 'BULLISH_BOUNCE' : 'NEUTRAL');
      scenarioDesc = aVal > refVal
        ? `Data ${title} aktual (${ev.actual}) lebih kuat dari ekspektasi (${ev.forecast || ev.previous}), mendukung penguatan USD dan menahan reli Gold.`
        : (aVal < refVal
          ? `Data ${title} aktual (${ev.actual}) lebih lemah dari ekspektasi (${ev.forecast || ev.previous}), melemahkan USD dan membuka peluang reli Gold.`
          : `Data ${title} aktual (${ev.actual}) sejalan dengan ekspektasi konsensus.`);
    } else if (fVal !== null && pVal !== null && fVal !== pVal) {
      bias = fVal > pVal ? 'BEARISH_PRESSURE' : 'BULLISH_BOUNCE';
      scenarioDesc = `Konsensus ${title} (${ev.forecast} vs ${ev.previous}) menjadi pengukur kekuatan aktivitas ekonomi AS untuk sesi ini.`;
    } else {
      bias = 'NEUTRAL';
      scenarioDesc = `Rilis ${title} mengukur kekuatan sektor ekonomi AS. Data di atas konsensus menopang USD; di bawah konsensus menopang Gold.`;
    }
  } else {
    scenarioDesc = `Rilis ${title} berpotensi memicu pergerakan volatilitas jangka pendek pada DXY dan XAU/USD.`;
  }

  return { title, category, bias, scenarioDesc, fVal, pVal, aVal, isReleased, inverseUsd };
}

function extractActualForEvent(ev, newsItems) {
  if (!ev || !Array.isArray(newsItems) || newsItems.length === 0) return null;
  const title = String(ev.title || '').toLowerCase();

  const keywords = [];
  if (title.includes('unemployment claims') || title.includes('jobless claims')) {
    keywords.push('unemployment claims', 'jobless claims', 'initial claims', 'initial jobless', 'klaim pengangguran', 'klaim awal');
  } else if (title.includes('continuing claims')) {
    keywords.push('continuing claims', 'continuing jobless', 'klaim lanjutan');
  } else if (title.includes('philly fed')) {
    keywords.push('philly fed', 'philadelphia fed');
  } else if (title.includes('non-farm') || title.includes('nonfarm') || title.includes('payrolls')) {
    keywords.push('non-farm', 'nonfarm', 'payroll', 'nfp', 'tenaga kerja non-pertanian');
  } else if (title.includes('unemployment rate')) {
    keywords.push('unemployment rate', 'tingkat pengangguran');
  } else if (title.includes('hourly earnings')) {
    keywords.push('hourly earnings', 'average hourly earnings', 'penghasilan rata-rata per jam', 'upah per jam');
  } else if (title.includes('cpi')) {
    keywords.push('cpi', 'ihk', 'inflasi', 'consumer price');
  } else if (title.includes('ppi')) {
    keywords.push('ppi', 'ihp', 'producer price');
  } else if (title.includes('pce')) {
    keywords.push('pce');
  } else if (title.includes('pmi')) {
    keywords.push('pmi', 'ism manufacturing', 'ism services');
  } else if (title.includes('retail sales')) {
    keywords.push('retail sales', 'penjualan ritel');
  } else if (title.includes('gdp')) {
    keywords.push('gdp', 'pdb', 'gross domestic');
  } else {
    keywords.push(title);
  }

  const evDateMs = ev.date ? new Date(ev.date).getTime() : NaN;
  const nowMs = Date.now();
  if (Number.isFinite(evDateMs) && evDateMs > nowMs + 60 * 1000) return null;

  const expectPct = /%/.test(String(ev.forecast || ev.previous || ''));
  const expectScale = /[KkMmBb]$/.test(String(ev.forecast || ev.previous || '').trim());
  const isPlausibleVal = (rawVal) => {
    const v = String(rawVal || '').trim();
    if (!v) return false;
    if (expectPct && !v.includes('%')) return false;
    if (expectScale && !/[KkMmBb]$/.test(v)) return false;
    return true;
  };

  for (const item of newsItems) {
    if (item.time && Number.isFinite(evDateMs)) {
      const itemDate = new Date(item.time).getTime();
      if (Number.isFinite(itemDate)) {
        // News reporting an actual release cannot arrive more than 5 min BEFORE scheduled release
        if (itemDate < evDateMs - 5 * 60 * 1000) continue;
        const diffHours = (itemDate - evDateMs) / 3600000;
        if (diffHours > 18) continue;
      }
    }

    const raw = `${item.text || ''}\n${item.textOriginal || ''}`;
    const lower = raw.toLowerCase();
    const matchedKw = keywords.find(kw => lower.includes(kw));
    if (!matchedKw) continue;

    const p1 = raw.match(/(?:[•\-\*\s]|^)(?:Aktual|Actual|Saat\s*ini|Current|Sebenarnya|Hasil|Result|Rilis)\s*[:=]?\s*([+-]?\d+(?:[\.,]\d+)?[%KkMmBb]?)/im);
    if (p1?.[1] && isPlausibleVal(p1[1])) return p1[1].trim();

    const kwEsc = matchedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const p2 = new RegExp(`${kwEsc}[^\\n\\r:]*[:=]\\s*([+-]?\\d+(?:[\\.,]\\d+)?[%KkMmBb]?)`, 'i').exec(raw);
    if (p2?.[1] && isPlausibleVal(p2[1])) return p2[1].trim();
  }
  return null;
}

function getCachedNewsItems() {
  if (latestNewsItems.length > 0) return latestNewsItems;
  try {
    const raw = localStorage.getItem(NEWS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.items)) return parsed.items.map(prepareNewsItem);
    }
  } catch (_) {}
  return [];
}

function enrichCalendarEventsWithNews(events, newsItems) {
  if (!Array.isArray(events) || events.length === 0) return;
  const items = Array.isArray(newsItems) && newsItems.length > 0 ? newsItems : getCachedNewsItems();
  if (!items.length) return;
  const nowMs = Date.now();

  for (const ev of events) {
    const evMs = Date.parse(ev.date);
    if (Number.isFinite(evMs) && evMs > nowMs + 60 * 1000) continue;
    if (!ev.actual || ev.actual === '—' || ev.actual === '--') {
      const ext = extractActualForEvent(ev, items);
      if (ext) {
        ev.actual = ext;
        ev.actualSource = 'news_feed';
      }
    }
  }
}

// ─── Mapping Bridge Sync (100% Parity with Mapping Cockpit) ───
function computeMappingBridgeState(liveCtx) {
  const num = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };
  const livePrice = num(liveCtx?.price ?? liveCtx?.currentPrice ?? (typeof window !== 'undefined' ? window.amyfxCurrentPrice : NaN));
  const dr = liveCtx?.m15?.dealingRange || liveCtx?.dealingRange || liveCtx?.amy?.levels?.dealingRange || {};
  const rHigh = num(dr.rangeHigh ?? dr.high ?? liveCtx?.h1?.swingHigh);
  const rLow = num(dr.rangeLow ?? dr.low ?? liveCtx?.h1?.swingLow);
  const validRange = Number.isFinite(rHigh) && Number.isFinite(rLow) && rHigh > rLow;
  const span = validRange ? (rHigh - rLow) : NaN;
  const rEq = validRange ? (rHigh + rLow) / 2 : num(dr.eq ?? dr.equilibrium);

  let rawPct = 50;
  let pct = 50;
  if (validRange && Number.isFinite(livePrice) && livePrice > 0) {
    rawPct = ((livePrice - rLow) / span) * 100;
    pct = Math.min(100, Math.max(0, Math.round(rawPct)));
  }

  let m15Dir = 0;
  const m15Struct = String(liveCtx?.m15?.structure || '').toUpperCase();
  const m15Control = String(liveCtx?.m15?.control || '').toUpperCase();
  const biasDir = liveCtx?.amy?.dashboard?.biasDir;
  if (m15Struct.includes('BEAR') || m15Control.includes('SELLER') || biasDir === -1) m15Dir = -1;
  else if (m15Struct.includes('BULL') || m15Control.includes('BUYER') || biasDir === 1) m15Dir = 1;

  const isSslSwept = validRange && Number.isFinite(livePrice) && livePrice < rLow;
  const isBslSwept = validRange && Number.isFinite(livePrice) && livePrice > rHigh;
  const isBearBreakdown = isSslSwept && m15Dir === -1 && (rLow - livePrice) > 3.0;
  const isBullBreakout = isBslSwept && m15Dir === 1 && (livePrice - rHigh) > 3.0;

  let zoneText = 'EQUILIBRIUM · 50%';
  let zoneTone = 'neutral';
  if (validRange && Number.isFinite(livePrice)) {
    if (isBearBreakdown) { zoneText = `BREAKDOWN · ${pct}%`; zoneTone = 'breakdown'; }
    else if (isBullBreakout) { zoneText = `BREAKOUT · ${pct}%`; zoneTone = 'breakout'; }
    else if (rawPct < 47.5) { zoneText = `DISKON · ${pct}%`; zoneTone = 'discount'; }
    else if (rawPct > 52.5) { zoneText = `PREMIUM · ${pct}%`; zoneTone = 'premium'; }
    else { zoneText = `EQ · ${pct}%`; zoneTone = 'neutral'; }
  }

  // Strictly pick liquidity pools ahead of live price (never show a broken SSL above price!)
  const liqList = Array.isArray(liveCtx?.liquidity) ? liveCtx.liquidity : [];
  const rawBslCandidates = [
    num(liveCtx?.amy?.dashboard?.bsl),
    ...liqList.filter(x => String(x?.label || x?.side || '').toUpperCase().includes('BSL') || String(x?.side || '').toUpperCase() === 'BUY').map(x => num(x.level)),
    rHigh
  ].filter(v => Number.isFinite(v) && (!Number.isFinite(livePrice) || v > livePrice + 0.5));
  const rawSslCandidates = [
    num(liveCtx?.amy?.dashboard?.ssl),
    ...liqList.filter(x => String(x?.label || x?.side || '').toUpperCase().includes('SSL') || String(x?.side || '').toUpperCase() === 'SELL').map(x => num(x.level)),
    rLow
  ].filter(v => Number.isFinite(v) && (!Number.isFinite(livePrice) || v < livePrice - 0.5));

  const bslVal = rawBslCandidates.length ? Math.min(...rawBslCandidates) : NaN;
  const sslVal = rawSslCandidates.length ? Math.max(...rawSslCandidates) : NaN;

  const fmtP = v => Number.isFinite(v) ? `$${v.toFixed(2)}` : '—';

  return {
    livePrice,
    rHigh,
    rLow,
    rEq,
    span,
    pct,
    zoneText,
    zoneTone,
    isBearBreakdown,
    isBullBreakout,
    isSslSwept,
    isBslSwept,
    priceStr: fmtP(livePrice),
    rangeHighStr: fmtP(rHigh),
    rangeLowStr: validRange ? (isSslSwept ? `${fmtP(rLow)} (Break)` : fmtP(rLow)) : '—',
    rangeEqStr: fmtP(rEq),
    bslStr: fmtP(bslVal),
    sslStr: Number.isFinite(sslVal) ? fmtP(sslVal) : (isBearBreakdown ? 'Area Low Baru' : '—')
  };
}

// ─── Live Macro Snapshot Fetcher (DXY, US10Y, VIX, Gold, Silver) ───
function readCachedMacroSnapshot() {
  try {
    const raw = localStorage.getItem(MACRO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.quotes) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

async function fetchMacroSnapshot(force = false) {
  const now = Date.now();
  if (!force && latestMacroSnapshot && (now - (latestMacroSnapshot._fetchedAt || 0)) < MACRO_MEMORY_TTL_MS) {
    return latestMacroSnapshot;
  }
  if (!force && macroFetchInFlight) {
    return macroFetchInFlight;
  }

  const runFetch = (async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 5200) : null;
    try {
      const url = `${API_BASE}/macro-snapshot${force ? '?force=1' : ''}`;
      const res = await fetch(url, {
        cache: 'no-store',
        signal: controller ? controller.signal : undefined
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.quotes) {
        const availableCount = Number(data.availableCount ?? data.liveCount ?? 0);
        const snap = {
          ...data,
          availableCount,
          _fetchedAt: Date.now(),
          _sourceMode: availableCount > 0 ? 'live' : 'offline'
        };
        latestMacroSnapshot = snap;
        try { localStorage.setItem(MACRO_CACHE_KEY, JSON.stringify(snap)); } catch (_) {}
        return snap;
      }
    } catch (_) {
      // Fall back honestly to localStorage cache if still within 15m freshness window
      const cached = latestMacroSnapshot || readCachedMacroSnapshot();
      if (cached && cached.quotes) {
        const ageMs = Date.now() - (cached._fetchedAt || Date.parse(cached.updatedAt || cached.fetchedAt) || 0);
        return {
          ...cached,
          _sourceMode: ageMs > MACRO_CACHE_MAX_AGE_MS ? 'stale' : 'cache'
        };
      }
    } finally {
      if (timer) clearTimeout(timer);
    }
    return {
      ok: false,
      liveCount: 0,
      quotes: { dxy: null, us10y: null, vix: null, gold: null, silver: null },
      _fetchedAt: Date.now(),
      _sourceMode: 'offline'
    };
  })();

  if (!force) {
    macroFetchInFlight = runFetch;
    runFetch.finally(() => {
      if (macroFetchInFlight === runFetch) macroFetchInFlight = null;
    });
  }
  return runFetch;
}

// ─── Kompas Institutional SVG Helpers ────────────────────
function renderCompassGaugeSvg(score, tone, counts, activeFactorCount) {
  const clamped = Math.max(-100, Math.min(100, Number(score) || 0));
  // Map -100..+100 onto -90deg..+90deg needle rotation around (100, 96)
  const angleDeg = (clamped / 100) * 86;
  const scoreSign = clamped > 0 ? '+' : '';
  const scoreDisplay = activeFactorCount > 0 ? `${scoreSign}${clamped}` : '—';
  const toneColor = tone === 'bull'
    ? 'var(--km-bull)'
    : (tone === 'bear'
      ? 'var(--km-bear)'
      : (tone === 'lock' ? 'var(--km-lock)' : 'var(--km-gold)'));

  const bullCount = Number(counts?.bull || 0);
  const bearCount = Number(counts?.bear || 0);
  const neutralCount = Number(counts?.neutral || 0);

  return `
    <div class="km-gauge" aria-label="Skor Makro Kompas ${escapeHtml(scoreDisplay)} dari rentang -100 sampai +100">
      <svg class="km-gauge__svg" viewBox="0 0 200 124" fill="none" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="kmGaugeGrad" x1="18" y1="92" x2="182" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.85" />
            <stop offset="48%" stop-color="#94a3b8" stop-opacity="0.45" />
            <stop offset="52%" stop-color="#94a3b8" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#22c55e" stop-opacity="0.85" />
          </linearGradient>
        </defs>
        <!-- Outer hairline reference arc -->
        <path d="M 18 92 A 82 82 0 0 1 182 92" stroke="currentColor" stroke-opacity="0.12" stroke-width="10" stroke-linecap="round" />
        <!-- Active semantic spectrum arc -->
        <path d="M 18 92 A 82 82 0 0 1 182 92" stroke="url(#kmGaugeGrad)" stroke-width="4" stroke-linecap="round" />
        <!-- Precision calibration ticks (-100, -50, 0, +50, +100) -->
        <line x1="18" y1="92" x2="26" y2="92" stroke="currentColor" stroke-opacity="0.32" stroke-width="1.2" />
        <line x1="42" y1="34" x2="48" y2="40" stroke="currentColor" stroke-opacity="0.28" stroke-width="1.2" />
        <line x1="100" y1="10" x2="100" y2="19" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.5" />
        <line x1="158" y1="34" x2="152" y2="40" stroke="currentColor" stroke-opacity="0.28" stroke-width="1.2" />
        <line x1="182" y1="92" x2="174" y2="92" stroke="currentColor" stroke-opacity="0.32" stroke-width="1.2" />
        <!-- Compass needle -->
        <g transform="rotate(${angleDeg.toFixed(1)} 100 92)">
          <line x1="100" y1="92" x2="100" y2="24" stroke="${toneColor}" stroke-width="2.4" stroke-linecap="round" />
          <circle cx="100" cy="24" r="2.6" fill="${toneColor}" />
        </g>
        <!-- Center pivot -->
        <circle cx="100" cy="92" r="5" fill="var(--km-surface)" stroke="${toneColor}" stroke-width="2.2" />
        <!-- Scale end labels with crisp clearance below pivot -->
        <text x="18" y="118" class="km-gauge__scale" text-anchor="start">BEAR</text>
        <text x="100" y="118" class="km-gauge__scale" text-anchor="middle">0</text>
        <text x="182" y="118" class="km-gauge__scale" text-anchor="end">BULL</text>
      </svg>
      <div class="km-gauge__readout">
        <span class="km-gauge__score tone-${escapeHtml(tone)}">${escapeHtml(scoreDisplay)}</span>
        <span class="km-gauge__tally">
          <b class="tone-bull">${bullCount} Bull</b> · <b class="tone-bear">${bearCount} Bear</b> · <span>${neutralCount} Netral</span>
        </span>
      </div>
    </div>
  `;
}

function renderSparklineSvg(values, tone) {
  const pts = Array.isArray(values)
    ? values.map(Number).filter(Number.isFinite)
    : [];
  if (pts.length < 2) {
    return `<svg class="km-spark km-spark--empty" viewBox="0 0 64 22" fill="none" aria-hidden="true"><line x1="2" y1="11" x2="62" y2="11" stroke="currentColor" stroke-opacity="0.18" stroke-dasharray="2 2" stroke-width="1.2" /></svg>`;
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const w = 64;
  const h = 22;
  const padY = 3;
  const coords = pts.map((v, idx) => {
    const x = (idx / (pts.length - 1)) * (w - 4) + 2;
    const y = h - padY - ((v - min) / span) * (h - padY * 2);
    return [x, y];
  });
  const lineD = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const areaD = `${lineD} L${coords[coords.length - 1][0].toFixed(1)} ${h} L${coords[0][0].toFixed(1)} ${h} Z`;
  const stroke = tone === 'bull'
    ? 'var(--km-bull)'
    : (tone === 'bear'
      ? 'var(--km-bear)'
      : (tone === 'warn' ? 'var(--km-gold)' : 'var(--km-muted)'));
  const last = coords[coords.length - 1];

  return `
    <svg class="km-spark" viewBox="0 0 ${w} ${h}" fill="none" aria-hidden="true">
      <path d="${areaD}" fill="${stroke}" fill-opacity="0.11" />
      <path d="${lineD}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2" fill="${stroke}" />
    </svg>
  `;
}

function formatAgendaCountdown(dateIso, nowMs, hasActual) {
  if (hasActual) return { text: 'Rilis', cls: 'is-done' };
  const ms = Date.parse(dateIso);
  if (!Number.isFinite(ms)) return { text: 'Jadwal NY', cls: '' };
  const diffMin = Math.round((ms - nowMs) / 60000);
  if (diffMin >= -15 && diffMin <= 30) {
    return {
      text: diffMin > 0 ? `LOCK ${diffMin}m` : 'LOCK RILIS',
      cls: 'is-lock'
    };
  }
  if (diffMin < -15) {
    return { text: 'Menunggu Act', cls: 'is-passed' };
  }
  if (diffMin < 60) {
    return { text: `${diffMin}m lagi`, cls: 'is-soon' };
  }
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h < 24) {
    return { text: m > 0 ? `${h}j ${m}m` : `${h}j lagi`, cls: '' };
  }
  const d = Math.floor(h / 24);
  return { text: `${d}h lagi`, cls: '' };
}

// ─── Kompas Fundamental Renderer (100% Real-Data Grounded) ───
async function loadSentiment(isBackground = false, forceCtxRefresh = false) {
  const container = document.getElementById('sentiment-content');
  const statusEl = document.getElementById('sentiment-status');
  if (!container) return;

  const engine = window.AmyKompasEngine;
  if (!engine || typeof engine.computeKompasState !== 'function') return;

  const now = new Date();
  const nowMs = now.getTime();
  const timeZone = 'Asia/Makassar';
  const nyTimeZone = 'America/New_York';
  const dateStrWita = now.toLocaleDateString('id-ID', {
    timeZone, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
  const timeStrWita = now.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }) + ' WITA';

  // Gather calendar + news already available
  const cachedCal = getCachedCalendar();
  const events = (calendarEvents.length > 0 ? calendarEvents : (cachedCal?.events || []));
  const usdEvents = events.filter(e => String(e.country || '').toUpperCase() === 'USD');
  const newsItems = getCachedNewsItems();
  const goldNews = newsItems.filter(isNewsRelevantForGold);

  // Filter today's USD events (NY date) + upcoming USD events
  const todayNY = now.toLocaleDateString('en-CA', { timeZone: nyTimeZone });
  const todayUsd = usdEvents
    .filter(e => {
      const d = new Date(e.date);
      return Number.isFinite(d.getTime()) && d.toLocaleDateString('en-CA', { timeZone: nyTimeZone }) === todayNY;
    })
    .sort((a, b) => (Date.parse(a.date) || 0) - (Date.parse(b.date) || 0));
  enrichCalendarEventsWithNews(todayUsd, newsItems);

  const upcomingUsd = usdEvents
    .filter(e => {
      const ms = Date.parse(e.date);
      return Number.isFinite(ms) && ms >= nowMs;
    })
    .sort((a, b) => (Date.parse(a.date) || 0) - (Date.parse(b.date) || 0));

  // Read live Mapping Cockpit context
  let liveCtx = null;
  try {
    liveCtx = window.AmyMarketContext || window.parent?.AmyMarketContext || null;
    if (!liveCtx) {
      const rawCtx = localStorage.getItem('amyfx.market-context.v1');
      if (rawCtx) liveCtx = JSON.parse(rawCtx);
    }
  } catch (_) {}

  const isCtxStale = forceCtxRefresh || !liveCtx || !liveCtx.price || (liveCtx.source?.M15 && (Date.now() / 1000 - Number(liveCtx.source.M15) > 900));

  // Fetch live macro quotes + fresh scalper context in parallel when needed
  const [macroRes, ctxRes] = await Promise.allSettled([
    fetchMacroSnapshot(forceCtxRefresh),
    isCtxStale
      ? fetch(`${API_BASE}/scalper-setups`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null))
      : Promise.resolve(null)
  ]);

  const macroSnap = macroRes.status === 'fulfilled' && macroRes.value
    ? macroRes.value
    : { ok: false, liveCount: 0, quotes: {}, _sourceMode: 'offline' };

  if (ctxRes.status === 'fulfilled' && ctxRes.value?.context) {
    liveCtx = ctxRes.value.context;
    try { localStorage.setItem('amyfx.market-context.v1', JSON.stringify(liveCtx)); } catch (_) {}
  }

  const bridge = computeMappingBridgeState(liveCtx);
  const k = engine.computeKompasState({
    macroQuotes: macroSnap.quotes || {},
    usdTodayEvents: todayUsd,
    usdUpcomingEvents: upcomingUsd,
    goldNews,
    liveCtx,
    bridge,
    nowMs
  });

  // Honest sync label
  const liveQuotesCount = [
    macroSnap.quotes?.dxy,
    macroSnap.quotes?.us10y,
    macroSnap.quotes?.vix,
    macroSnap.quotes?.gold
  ].filter(q => q && Number.isFinite(Number(q.price))).length;

  let syncText = 'Feed Offline';
  let syncTone = 'offline';
  if (macroSnap._sourceMode === 'live' && liveQuotesCount > 0) {
    syncText = `Live Makro · ${liveQuotesCount}/4 Feed`;
    syncTone = 'live';
  } else if (macroSnap._sourceMode === 'cache' && liveQuotesCount > 0) {
    syncText = `Cache Makro · ${liveQuotesCount}/4`;
    syncTone = 'cache';
  } else if (macroSnap._sourceMode === 'stale' && liveQuotesCount > 0) {
    syncText = 'Cache >15m';
    syncTone = 'cache';
  }

  if (statusEl) {
    const calSummary = usdEvents.length > 0
      ? `${todayUsd.length} agenda USD hari ini`
      : 'Kalender offline';
    statusEl.textContent = `${timeStrWita} · ${syncText} · ${calSummary}`;
  }

  // Build 4-column Live Telemetry Strip
  const telemetryHtml = k.factors.map(f => {
    const toneCls = f.available ? `tone-${f.tone}` : 'tone-offline';
    return `
      <div class="km-metric ${toneCls}">
        <div class="km-metric__top">
          <span class="km-metric__label">${escapeHtml(f.label)}</span>
          ${renderSparklineSvg(f.sparkline, f.tone)}
        </div>
        <div class="km-metric__val">${escapeHtml(f.priceText)}</div>
        <div class="km-metric__foot">
          <span class="km-metric__delta">${escapeHtml(f.deltaText)}</span>
          <span class="km-metric__impact">
            <span class="km-dot ${toneCls}" aria-hidden="true"></span>
            ${escapeHtml(f.goldImpact)}
          </span>
        </div>
      </div>
    `;
  }).join('');

  // Build Agenda USD rows (up to 4 compact rows)
  let agendaRowsHtml = '';
  if (k.displayEvents.length > 0) {
    agendaRowsHtml = k.displayEvents.map(ev => {
      const evDate = new Date(ev.date);
      const timeLabel = Number.isFinite(evDate.getTime())
        ? evDate.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' })
        : 'NY';
      const imp = String(ev.impact || '').toLowerCase();
      const impText = imp === 'high' ? 'HIGH' : 'MED';
      const impCls = imp === 'high' ? 'is-high' : 'is-med';
      const hasAct = Boolean(ev.actual && ev.actual !== '—' && ev.actual !== '--') && !(Number.isFinite(evDate.getTime()) && evDate.getTime() > nowMs + 60 * 1000);
      const releasedEval = hasAct ? engine.evaluateReleasedEvent(ev, nowMs) : null;
      const actTone = releasedEval
        ? (releasedEval.direction === 1 ? 'tone-bull' : (releasedEval.direction === -1 ? 'tone-bear' : ''))
        : '';
      const cd = formatAgendaCountdown(ev.date, nowMs, hasAct);

      return `
        <div class="km-event-row ${cd.cls === 'is-lock' ? 'is-lock-row' : ''}">
          <div class="km-event-row__main">
            <span class="km-event-time">${escapeHtml(timeLabel)}</span>
            <span class="km-event-imp ${impCls}">${impText}</span>
            <span class="km-event-title">${escapeHtml(ev.title)}</span>
          </div>
          <div class="km-event-row__meta">
            <span class="km-event-nums">
              <span>F <b>${escapeHtml(ev.forecast || '—')}</b></span>
              <span>P <b>${escapeHtml(ev.previous || '—')}</b></span>
              <span>Act <b class="${actTone}">${escapeHtml(hasAct ? ev.actual : '—')}</b></span>
            </span>
            <span class="km-event-cd ${cd.cls}">${escapeHtml(cd.text)}</span>
          </div>
        </div>
      `;
    }).join('');
  } else {
    agendaRowsHtml = `
      <div class="km-empty-inline">
        Tidak ada jadwal USD berdampak High/Medium tersisa hari ini — fokus penuh pada struktur Mapping.
      </div>
    `;
  }

  // Build compact 2-line Trigger Playbook (only when forecast/previous exists)
  let playbookHtml = '';
  if (k.triggerPlaybook) {
    const tp = k.triggerPlaybook;
    const bullHit = tp.isReleased && tp.releasedDirection === 1;
    const bearHit = tp.isReleased && tp.releasedDirection === -1;
    playbookHtml = `
      <div class="km-playbook">
        <div class="km-playbook__head">
          <span>Pemicu Reaksi · ${escapeHtml(tp.title)}</span>
          ${tp.isReleased ? `<span class="km-playbook__act">Aktual ${escapeHtml(tp.actual)}</span>` : ''}
        </div>
        <div class="km-playbook__row ${bullHit ? 'is-hit-bull' : ''}">
          <span class="km-playbook__cond tone-bull">${escapeHtml(tp.bullCondition)}</span>
          <span class="km-playbook__eff">${escapeHtml(tp.bullEffect)}${bullHit ? ' · Terkonfirmasi' : ''}</span>
        </div>
        <div class="km-playbook__row ${bearHit ? 'is-hit-bear' : ''}">
          <span class="km-playbook__cond tone-bear">${escapeHtml(tp.bearCondition)}</span>
          <span class="km-playbook__eff">${escapeHtml(tp.bearEffect)}${bearHit ? ' · Terkonfirmasi' : ''}</span>
        </div>
      </div>
    `;
  }

  // Build Dealing Range Position Gauge
  const markerPct = Math.max(2, Math.min(98, Number.isFinite(bridge.pct) ? bridge.pct : 50));
  const h1Cls = k.tech.h1Dir === 1 ? 'tone-bull' : (k.tech.h1Dir === -1 ? 'tone-bear' : '');
  const m15Cls = k.tech.m15Dir === 1 ? 'tone-bull' : (k.tech.m15Dir === -1 ? 'tone-bear' : '');
  const zoneCls = bridge.zoneTone === 'discount' || bridge.zoneTone === 'breakout'
    ? 'tone-bull'
    : (bridge.zoneTone === 'premium' || bridge.zoneTone === 'breakdown' ? 'tone-bear' : '');

  // Build compact 2-item Berita Penggerak Utama strip
  const topNewsHtml = k.topNews.length > 0
    ? k.topNews.map(item => {
        const id = newsId(item);
        const cat = classifyNewsCategory(item);
        const relTime = formatTime(item.time) || 'Terkini';
        const isHigh = getNewsImpactLevel(item) === 'high';
        return `
          <button type="button" class="km-news-row" onclick="openEvidenceNews('${escapeHtml(id)}')">
            <div class="km-news-row__body">
              <div class="km-news-row__meta">
                <span class="km-news-cat">${escapeHtml(cat.label)}</span>
                <span class="km-sep" aria-hidden="true">·</span>
                <span class="km-news-time">${escapeHtml(relTime)}</span>
                ${isHigh ? '<span class="km-sep" aria-hidden="true">·</span><span class="km-news-high">High Impact</span>' : ''}
              </div>
              <p class="km-news-text">${escapeHtml(truncate(item.text, 148))}</p>
            </div>
            <span class="km-news-arrow" aria-hidden="true">→</span>
          </button>
        `;
      }).join('')
    : `<div class="km-empty-inline">Belum ada headline penggerak Gold terbaru pada sesi ini.</div>`;

  container.innerHTML = `
    <div class="km-shell" data-km-tone="${escapeHtml(k.tone)}">
      <!-- 1. Institutional Hero Verdict & SVG Macro Compass Gauge -->
      <section class="km-hero">
        <div class="km-hero__copy">
          <div class="km-kicker">
            <span class="km-kicker__title">KOMPAS MAKRO XAU/USD</span>
            <span class="km-sep" aria-hidden="true">·</span>
            <span>${escapeHtml(dateStrWita)}</span>
            <span class="km-sep" aria-hidden="true">·</span>
            <span class="km-sync tone-${escapeHtml(syncTone)}">
              <span class="km-dot tone-${escapeHtml(syncTone)}" aria-hidden="true"></span>
              ${escapeHtml(syncText)}
            </span>
          </div>
          <h2 class="km-verdict tone-${escapeHtml(k.tone)}">${escapeHtml(k.verdictTitle)}</h2>
          <p class="km-summary">${escapeHtml(k.summary)}</p>
          <div class="km-meta-strip">
            <div class="km-meta-item">
              <span class="km-meta-label">Kesesuaian</span>
              <strong class="km-meta-val tone-${escapeHtml(k.alignment.tone)}">${escapeHtml(k.alignment.label)}</strong>
            </div>
            <div class="km-meta-item">
              <span class="km-meta-label">H1 / M15</span>
              <strong class="km-meta-val"><span class="${h1Cls}">${escapeHtml(k.tech.h1Label)}</span> / <span class="${m15Cls}">${escapeHtml(k.tech.m15Label)}</span></strong>
            </div>
            <div class="km-meta-item">
              <span class="km-meta-label">Sesi Aktif</span>
              <strong class="km-meta-val">${escapeHtml(k.tech.sessionLabel)}</strong>
            </div>
          </div>
        </div>
        <div class="km-hero__dial">
          ${renderCompassGaugeSvg(k.score, k.tone, k.counts, k.activeFactorCount)}
        </div>
      </section>

      <!-- 2. 4-Column Live Macro Telemetry Strip -->
      <section class="km-telemetry" aria-label="Telemetri Makro Real-Time">
        ${telemetryHtml}
      </section>

      <!-- 3. Split Action Desk: Agenda USD + Jembatan Mapping -->
      <section class="km-split">
        <article class="km-panel">
          <div class="km-panel__head">
            <h3 class="km-panel__title">${k.isTodayAgenda ? 'Agenda USD Hari Ini' : 'Agenda USD Terdekat'}</h3>
            <button type="button" class="km-link-btn" onclick="openEvidenceCalendar()">Kalender Lengkap →</button>
          </div>
          <div class="km-event-list">
            ${agendaRowsHtml}
          </div>
          ${playbookHtml}
        </article>

        <article class="km-panel">
          <div class="km-panel__head">
            <div class="km-panel__title-group">
              <h3 class="km-panel__title">Mapping XAU/USD</h3>
              <span class="km-spot-price">${escapeHtml(bridge.priceStr)}</span>
            </div>
            <a class="km-link-btn" href="../mapping/index.html">Buka Mapping →</a>
          </div>

          <div class="km-bridge-stats">
            <div class="km-bridge-stat">
              <span class="km-stat-k">H1 Bias</span>
              <strong class="km-stat-v ${h1Cls}">${escapeHtml(k.tech.h1Label)}</strong>
            </div>
            <div class="km-bridge-stat">
              <span class="km-stat-k">M15 Struktur</span>
              <strong class="km-stat-v ${m15Cls}">${escapeHtml(k.tech.m15Label)}</strong>
            </div>
            <div class="km-bridge-stat">
              <span class="km-stat-k">Posisi Range</span>
              <strong class="km-stat-v ${zoneCls}">${escapeHtml(bridge.zoneText)}</strong>
            </div>
          </div>

          <div class="km-range" aria-label="Posisi harga pada Dealing Range">
            <div class="km-range__labels-top">
              <span>DISKON</span>
              <span>EQ 50%</span>
              <span>PREMIUM</span>
            </div>
            <div class="km-range__track">
              <div class="km-range__eq-tick" aria-hidden="true"></div>
              <div class="km-range__marker" style="left: ${markerPct}%;" title="Harga Live ${escapeHtml(bridge.priceStr)}"></div>
            </div>
            <div class="km-range__levels">
              <span>${escapeHtml(bridge.rangeLowStr)}</span>
              <span>${escapeHtml(bridge.rangeEqStr)}</span>
              <span>${escapeHtml(bridge.rangeHighStr)}</span>
            </div>
          </div>

          <div class="km-liq-row">
            <div class="km-liq-cell">
              <span class="km-stat-k">BSL Atas (Target Buy)</span>
              <strong class="km-stat-v tone-bear">${escapeHtml(bridge.bslStr)}</strong>
            </div>
            <div class="km-liq-cell">
              <span class="km-stat-k">SSL Bawah (Target Sell)</span>
              <strong class="km-stat-v tone-bull">${escapeHtml(bridge.sslStr)}</strong>
            </div>
          </div>

          <p class="km-bridge-note">${escapeHtml(k.bridgeNote)}</p>
        </article>
      </section>

      <!-- 4. Berita Penggerak Utama (Compact 2-Row Clickable Strip) -->
      <section class="km-panel km-news">
        <div class="km-panel__head">
          <h3 class="km-panel__title">Berita Penggerak Utama</h3>
          <button type="button" class="km-link-btn" onclick="activateTab('news')">Semua Berita →</button>
        </div>
        <div class="km-news-list">
          ${topNewsHtml}
        </div>
      </section>
    </div>
  `;
}

// ─── News Feed Interactions & Loader (Zero Browser CORS) ───
function setupNewsInteractions() {
  const list = document.getElementById('news-list');
  list?.addEventListener('click', event => {
    const item = event.target.closest('.news-item');
    if (!item) return;
    item.classList.toggle('expanded');
    item.classList.remove('news-focus');
  });
  list?.addEventListener('keydown', event => {
    if (event.target.closest('a, button')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const item = event.target.closest('.news-item');
    if (!item) return;
    event.preventDefault();
    item.classList.toggle('expanded');
    item.classList.remove('news-focus');
  });
}

function focusNewsItem(id) {
  if (!id) return false;
  const item = [...document.querySelectorAll('.news-item')].find(el => el.dataset.newsId === String(id));
  if (!item) return false;
  item.classList.add('expanded', 'news-focus');
  item.scrollIntoView({ behavior: 'smooth', block: 'center' });
  pendingNewsId = '';
  newsRouteRetries = 0;
  return true;
}

async function loadNews(silent = false) {
  const currentSequence = ++newsFetchSequence;
  const status = document.getElementById('news-status');
  const list = document.getElementById('news-list');
  if (!silent && (!list || !list.children.length) && status) {
    status.textContent = 'Memuat berita...';
  }

  const currentExpandedIds = new Set(
    [...document.querySelectorAll('.news-item.expanded')].map(el => el.dataset.newsId).filter(Boolean)
  );
  const prevScrollTop = currentTab === 'news' ? (window.scrollY || document.documentElement.scrollTop) : 0;

  if (list && !list.children.length) {
    try {
      const cachedRaw = localStorage.getItem(NEWS_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (Array.isArray(cached?.items) && cached.items.length > 0) {
          latestNewsItems = cached.items.map(prepareNewsItem);
          renderNews(latestNewsItems, currentExpandedIds);
          if (status) status.textContent = `${latestNewsItems.length} berita tersimpan • Menyinkronkan…`;
        }
      }
    } catch (_) {}
  }

  try {
    const fetchLimit = pendingNewsId ? 50 : 30;
    const res = await fetch(`${API_BASE}/news?limit=${fetchLimit}`, {
      signal: beginRequest('news'),
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    if (!Array.isArray(data.news) || data.news.length === 0) {
      if (list && list.children.length > 0) {
        if (status) status.textContent = 'Tidak ada pembaruan berita baru';
      } else {
        if (status) status.textContent = 'Belum ada berita tersedia';
        if (list) list.innerHTML = '<div class="empty-state">Belum ada breaking news XAU/USD saat ini.</div>';
      }
      return;
    }

    const sortedNews = data.news
      .map(prepareNewsItem)
      .filter(item => item.text && item.text.length >= 12)
      .sort((a, b) => {
        const byId = Number(b.id || 0) - Number(a.id || 0);
        return byId || new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime();
      });

    latestNewsItems = sortedNews;
    const relevantNews = sortedNews.filter(isNewsRelevantForGold);
    const latestRelevant = relevantNews[0];
    const latestNews = sortedNews[0];

    if (latestNews) {
      const currentNewsId = newsId(latestNews);
      const lastNewsId = localStorage.getItem('amy_last_news_id');
      const lastNotifiedId = localStorage.getItem('amy_last_notified_news_id') || lastNewsId;

      const notifyNews = item => {
        const targetId = newsId(item);
        const impact = getNewsImpactLevel(item);
        const title = impact === 'high' ? 'Breaking News Penting XAU/USD' : 'Breaking News XAU/USD';
        const msg = item.text || item.textOriginal || 'Berita baru telah tiba.';
        if (window.Android?.showNotificationWithUrl) {
          window.Android.showNotificationWithUrl(title, msg, newsTargetUrl(targetId));
        } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const notification = new Notification(title, { body: msg, tag: `amy-news-${targetId}` });
          notification.onclick = () => {
            window.focus();
            location.hash = `news=${encodeURIComponent(targetId)}`;
          };
        }
        localStorage.setItem('amy_last_notified_news_id', targetId);
      };

      if (lastNewsId && lastNewsId !== currentNewsId && isNewsRelevantForGold(latestNews)) {
        notifyNews(latestNews);
      } else if (lastNewsId && latestRelevant && newsId(latestRelevant) !== lastNotifiedId && Number(latestRelevant.id || 0) > Number(lastNotifiedId || 0)) {
        notifyNews(latestRelevant);
      }
      localStorage.setItem('amy_last_news_id', currentNewsId);
    }

    panelLoadedAt.news = Date.now();
    window.AmyFXIntel?.write('news', {
      updated: data.updated,
      capturedAt: data.updated,
      source: 'VERCEL_NEWS',
      items: relevantNews.slice(0, 10)
    });

    if (currentSequence === newsFetchSequence) {
      try {
        localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({
          updated: data.updated,
          items: sortedNews.slice(0, 30)
        }));
      } catch (_) {}

      renderNews(sortedNews, currentExpandedIds, data.updated);

      if (calendarEvents.length > 0) {
        enrichCalendarEventsWithNews(calendarEvents, sortedNews);
        renderCalendar();
      } else {
        loadCalendar(true);
      }
      loadSentiment(true);

      if (currentTab === 'news' && prevScrollTop > 0) {
        window.scrollTo({ top: prevScrollTop, behavior: 'instant' });
      }
    }

    if (pendingNewsId) {
      activateTab('news');
      if (!focusNewsItem(pendingNewsId)) {
        setNewsFilter('all');
        if (!focusNewsItem(pendingNewsId)) {
          newsRouteRetries += 1;
          if (newsRouteRetries <= 3) {
            if (status) status.textContent = 'Menyinkronkan berita tujuan…';
            setTimeout(() => loadNews(true), 1500);
          } else {
            if (status) status.textContent = 'Berita tujuan belum tersedia pada feed terbaru';
            pendingNewsId = '';
            newsRouteRetries = 0;
          }
        }
      }
    }
  } catch (e) {
    if (e.name === 'AbortError') return;
    if (list && list.children.length > 0) {
      if (status) status.textContent = 'Gagal menyinkronkan feed baru • Menampilkan berita tersimpan';
    } else {
      if (status) status.textContent = 'Gagal memuat berita';
      if (list) list.innerHTML = '<div class="empty-state">Gagal terhubung ke feed berita. Klik Perbarui untuk mencoba lagi.</div>';
    }
  }
}

function renderNews(allNews, expandedIds = new Set(), updatedIso = null) {
  const list = document.getElementById('news-list');
  const status = document.getElementById('news-status');
  if (!list) return;

  const goldOnly = allNews.filter(isNewsRelevantForGold);
  const filtered = currentNewsFilter === 'gold'
    ? goldOnly
    : (currentNewsFilter === 'high'
      ? allNews.filter(item => getNewsImpactLevel(item) === 'high' && isNewsRelevantForGold(item))
      : allNews);

  if (status) {
    const timeSuffix = updatedIso ? ` • ${formatTime(updatedIso)}` : '';
    if (currentNewsFilter === 'gold') {
      status.textContent = `${filtered.length} berita Fokus Gold (dari ${allNews.length} feed)${timeSuffix}`;
    } else if (currentNewsFilter === 'high') {
      status.textContent = `${filtered.length} berita High Impact Gold${timeSuffix}`;
    } else {
      status.textContent = `${filtered.length} total berita global${timeSuffix}`;
    }
  }

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty-state">
        Belum ada berita untuk filter ini.
        <small>Coba beralih ke tab "Semua Berita" untuk melihat feed global.</small>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map((item, i) => {
    const id = newsId(item);
    const isExpanded = expandedIds.has(String(id));
    const impact = getNewsImpactLevel(item);
    const cat = classifyNewsCategory(item);
    return `
      <article class="news-item impact-${impact} ${isExpanded ? 'expanded' : ''}" data-news-id="${escapeHtml(id)}" style="animation-delay:${Math.min(i, 10) * 0.03}s" tabindex="0">
        <div class="news-item-head">
          <div class="news-meta-tags">
            <span class="news-impact-badge ${impact}">${impact === 'high' ? 'HIGH' : 'MED'}</span>
            <span class="news-cat-badge ${cat.cls}">${escapeHtml(cat.label)}</span>
          </div>
          <span class="news-time">${escapeHtml(formatTime(item.time))}</span>
        </div>
        <div class="news-text">${escapeHtml(item.text)}</div>
      </article>
    `;
  }).join('');
}

// ─── Economic Calendar Engine ─────────────────────────────
function setupCalendarFilters() {
  document.querySelectorAll('.cal-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cal-filter').forEach(b => b.classList.toggle('active', b === btn));
      currentCalendarFilter = btn.dataset.filter || 'gold';
      renderCalendar();
    });
  });
}

function getCachedCalendar() {
  try {
    const raw = localStorage.getItem(CALENDAR_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function saveCalendarToCache(events) {
  try {
    if (Array.isArray(events) && events.length > 0) {
      localStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), events }));
    }
  } catch (_) {}
}

function extractCalendarEventsFromNews() {
  const events = [];
  try {
    const newsItems = getCachedNewsItems();
    const regex = /([A-Z]{3})\s*\|\s*([^\n\r]+)[\s\S]*?(?:Waktu|Time)\s*:\s*([^\n\r]+)[\s\S]*?(?:Efek|Effects?)\s*:\s*([^\n\r]+)[\s\S]*?(?:Sebelumnya|Previously)\s*:\s*([^\n\r]+)[\s\S]*?(?:Perkiraan|Forecast)\s*:\s*([^\n\r_]+)/gi;
    const seen = new Set();
    for (const item of newsItems) {
      const text = `${item.text || ''}\n${item.textOriginal || ''}`;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const rawTitle = match[2].trim();
        const country = match[1].trim();
        const normKey = `${country}_${rawTitle.toLowerCase()}`;
        if (seen.has(normKey)) continue;
        seen.add(normKey);

        const rawTime = match[3].trim();
        const impactRaw = match[4].toLowerCase();
        const previous = match[5].trim();
        const forecast = match[6].trim();

        const baseDate = item.time ? new Date(item.time) : new Date();
        const ymd = Number.isFinite(baseDate.getTime()) ? baseDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const dateStr = `${ymd}T${rawTime.length === 5 ? rawTime + ':00' : '12:00:00'}+07:00`;

        events.push({
          title: rawTitle,
          country,
          date: dateStr,
          impact: impactRaw.includes('tinggi') || impactRaw.includes('high') ? 'High' : 'Medium',
          forecast,
          previous,
          actual: '',
          source: 'telegram_news_feed'
        });
      }
    }
  } catch (_) {}
  return events;
}

async function loadCalendar(silent = false) {
  const status = document.getElementById('calendar-status');
  if (!status) return;
  if (!silent && calendarEvents.length === 0) status.textContent = 'Memuat jadwal kalender ekonomi...';

  const cached = getCachedCalendar();
  if (cached?.events?.length > 0 && calendarEvents.length === 0) {
    calendarEvents = cached.events;
    enrichCalendarEventsWithNews(calendarEvents);
    renderCalendar();
  }

  try {
    let data = null;
    for (const url of CALENDAR_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutTimer = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutTimer);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json) ? json : (Array.isArray(json?.events) ? json.events : []);
          if (items.length > 0) {
            data = items;
            isCalendarLive = true;
            break;
          }
        }
      } catch (_) {}
    }

    if (!data || data.length === 0) {
      const extractedNewsEvents = extractCalendarEventsFromNews();
      if (extractedNewsEvents.length > 0) {
        data = extractedNewsEvents;
        isCalendarLive = true;
      }
    }

    if (Array.isArray(data) && data.length > 0) {
      enrichCalendarEventsWithNews(data);
      calendarEvents = data;
      saveCalendarToCache(data);
      panelLoadedAt.calendar = Date.now();
      renderCalendar();
      loadSentiment(true);
    } else if (calendarEvents.length === 0 && cached?.events?.length > 0) {
      calendarEvents = cached.events;
      enrichCalendarEventsWithNews(calendarEvents);
      isCalendarLive = false;
      renderCalendar();
      loadSentiment(true);
    } else if (calendarEvents.length === 0) {
      status.textContent = 'Gagal memuat kalender. Periksa koneksi.';
      const list = document.getElementById('calendar-list');
      if (list && list.children.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            Gagal memuat jadwal kalender ekonomi.<br>
            <button type="button" class="cal-retry-btn" onclick="loadCalendar()">Coba Lagi</button>
          </div>
        `;
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    if (calendarEvents.length === 0) status.textContent = 'Gagal memuat kalender. Coba lagi nanti.';
  } finally {
    hideLoading();
  }
}

function computeEventCountdown(eventTimeMs) {
  const diffMinutes = Math.round((eventTimeMs - Date.now()) / 60000);
  if (diffMinutes >= -15 && diffMinutes <= 15) {
    return { text: 'Sedang Rilis · Volatilitas Tinggi', className: 'imminent' };
  }
  if (diffMinutes > 15 && diffMinutes <= 60) {
    return { text: `Rilis ${diffMinutes}m lagi`, className: 'soon' };
  }
  if (diffMinutes > 60 && diffMinutes <= 24 * 60) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return { text: `Rilis ${hours}j ${mins}m lagi`, className: 'soon' };
  }
  if (diffMinutes < -15) {
    return { text: 'Selesai', className: 'done' };
  }
  return { text: 'Terjadwal', className: 'future' };
}

function buildCalendarCardHtml(ev) {
  if (!ev.actual || ev.actual === '—' || ev.actual === '--') {
    const ext = extractActualForEvent(ev, getCachedNewsItems());
    if (ext) {
      ev.actual = ext;
      ev.actualSource = 'news_feed';
    }
  }
  const d = new Date(ev.date);
  const timeMs = d.getTime();
  const timeStr = Number.isFinite(timeMs)
    ? d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit' }) + ' WITA'
    : '—';
  const countdown = Number.isFinite(timeMs) ? computeEventCountdown(timeMs) : { text: '', className: '' };
  const impact = String(ev.impact || '').toLowerCase();
  const flag = COUNTRY_FLAGS[ev.country] || '🌐';
  const isHigh = impact === 'high';
  const isMed = impact === 'medium';
  const impactClass = isHigh ? 'high' : (isMed ? 'medium' : 'low');
  const impactLabel = isHigh ? 'High Impact' : (isMed ? 'Medium' : (ev.impact || 'Low'));

  const titleLower = String(ev.title || '').toLowerCase();
  const isSpeech = titleLower.includes('speaks') || titleLower.includes('speech') || titleLower.includes('testifies');
  const isHoliday = impact === 'holiday' || titleLower.includes('holiday');
  const hasActual = Boolean(ev.actual && ev.actual !== '--' && ev.actual !== '—');
  const hasNumbers = Boolean(ev.forecast || ev.previous || hasActual);

  let numbersHtml = '';
  if (isSpeech) {
    numbersHtml = '<span class="cal-badge-pill cal-pill-speech">Pidato / Sentimen Kebijakan</span>';
  } else if (isHoliday) {
    numbersHtml = '<span class="cal-badge-pill cal-pill-holiday">Libur Pasar / Bank Tutup</span>';
  } else if (!hasNumbers) {
    numbersHtml = '<span class="cal-badge-pill cal-pill-nondata">Agenda Non-Data Konsensus</span>';
  } else {
    numbersHtml = `
      <span>Forecast: <strong class="cal-val">${escapeHtml(ev.forecast || '—')}</strong></span>
      <span>Previous: <strong class="cal-val">${escapeHtml(ev.previous || '—')}</strong></span>
      ${hasActual ? `<span>Actual: <strong class="cal-val act-live">${escapeHtml(ev.actual)}</strong></span>` : ''}
    `;
  }

  return `
    <article class="calendar-card impact-${impactClass}">
      <div class="cal-top">
        <div class="cal-badge-wrap">
          <span class="cal-currency">${flag} ${escapeHtml(ev.country)}</span>
          <span class="impact-tag ${impactClass}">${escapeHtml(impactLabel)}</span>
        </div>
        <div class="cal-time-wrap">
          <span class="cal-time">${escapeHtml(timeStr)}</span>
        </div>
      </div>
      <h2 class="cal-title">${escapeHtml(ev.title)}</h2>
      <div class="cal-bottom">
        <div class="cal-numbers">${numbersHtml}</div>
        ${countdown.text ? `<span class="cal-countdown ${countdown.className}">${escapeHtml(countdown.text)}</span>` : ''}
      </div>
    </article>
  `;
}

function updateSessionReadinessStrip() {
  const strip = document.getElementById('intelSessionStrip');
  const badgeEl = document.getElementById('intelSessionBadge');
  const titleEl = document.getElementById('intelSessionTitle');
  const jumpBtn = document.getElementById('intelSessionJumpBtn');
  if (!strip || !badgeEl || !titleEl) return;

  if (jumpBtn && !jumpBtn.dataset.bound) {
    jumpBtn.dataset.bound = '1';
    jumpBtn.addEventListener('click', () => {
      document.querySelector('.intel-tab[data-tab="calendar"]')?.click();
    });
  }

  const engine = window.AmyTraderInsights;
  if (!engine || typeof engine.evaluateMarketSessionStatus !== 'function') return;
  const normalized = (calendarEvents || []).map(ev => ({
    currency: ev.currency || ev.country || '',
    impact: ev.impact || '',
    title: ev.title || ev.event || '',
    timestampMs: ev.timestampMs || (ev.date ? Date.parse(ev.date) : NaN)
  }));
  const cached = getCachedCalendar();
  const cacheAgeMs = cached?.savedAt ? Date.now() - cached.savedAt : 0;
  const isStale = !isCalendarLive && Boolean(cached?.savedAt) && cacheAgeMs > 24 * 60 * 60 * 1000;
  const res = engine.evaluateMarketSessionStatus(normalized, Date.now(), {
    allowEmptyAsSafe: false,
    isStale
  });
  strip.classList.remove('is-safe', 'is-caution', 'is-danger');
  strip.classList.add(res.tone === 'DANGER' ? 'is-danger' : res.tone === 'CAUTION' ? 'is-caution' : 'is-safe');
  badgeEl.textContent = res.badge;
  titleEl.textContent = res.headline;
}

function renderCalendar() {
  updateSessionReadinessStrip();
  const list = document.getElementById('calendar-list');
  const status = document.getElementById('calendar-status');
  if (!list) return;

  if (!calendarEvents || calendarEvents.length === 0) {
    list.innerHTML = '<div class="empty-state">Tidak ada jadwal kalender ekonomi tersedia saat ini.</div>';
    if (status) status.textContent = 'Data kalender belum tersedia.';
    return;
  }

  const filtered = calendarEvents.filter(item => {
    const impact = String(item.impact || '').toLowerCase();
    const country = String(item.country || '').toUpperCase();
    const isGoldDriver = country === 'USD' && (impact === 'high' || impact === 'medium');

    if (currentCalendarFilter === 'gold') return isGoldDriver;
    if (currentCalendarFilter === 'high') return impact === 'high';
    if (currentCalendarFilter === 'medium') return impact === 'medium';
    if (currentCalendarFilter === 'usd') return country === 'USD';
    return true;
  });

  const cached = getCachedCalendar();
  const cacheAgeMs = cached?.savedAt ? Date.now() - cached.savedAt : 0;
  const isStale = cacheAgeMs > 24 * 60 * 60 * 1000;

  if (status) {
    if (isCalendarLive) {
      status.textContent = `${filtered.length} rilis ekonomi • Sinkronisasi Live (WITA)`;
    } else if (isStale) {
      status.textContent = `${filtered.length} rilis ekonomi • Cache Usang (>24 Jam)`;
    } else {
      status.textContent = `${filtered.length} rilis ekonomi • Cache Lokal`;
    }
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">Tidak ada rilis berita untuk filter yang dipilih.</div>';
    return;
  }

  filtered.sort((a, b) => (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0));

  const todayWitaYmd = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' });
  const activeGroups = new Map();
  const pastGroups = new Map();

  for (const item of filtered) {
    const d = new Date(item.date);
    const valid = Number.isFinite(d.getTime());
    const ymd = valid ? d.toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' }) : '';
    const dateKey = valid
      ? d.toLocaleDateString('id-ID', { timeZone: 'Asia/Makassar', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : 'Tanggal Tidak Diketahui';
    const isPastDay = Boolean(ymd && ymd < todayWitaYmd);
    const targetMap = isPastDay ? pastGroups : activeGroups;
    const label = ymd === todayWitaYmd ? `${dateKey} · Hari Ini` : dateKey;
    if (!targetMap.has(label)) targetMap.set(label, []);
    targetMap.get(label).push(item);
  }

  const renderGroupMap = map => {
    const out = [];
    map.forEach((items, dateLabel) => {
      out.push('<div class="calendar-group">');
      out.push(`<div class="calendar-date-header"><span>${escapeHtml(dateLabel)}</span><small>${items.length} rilis</small></div>`);
      items.forEach(ev => out.push(buildCalendarCardHtml(ev)));
      out.push('</div>');
    });
    return out.join('');
  };

  const parts = [];
  if (activeGroups.size > 0) {
    parts.push(renderGroupMap(activeGroups));
  } else {
    parts.push('<div class="cal-upcoming-empty">Semua agenda untuk filter ini telah selesai pada hari sebelumnya.</div>');
  }

  if (pastGroups.size > 0) {
    const pastCount = [...pastGroups.values()].reduce((sum, arr) => sum + arr.length, 0);
    parts.push(`
      <details class="cal-past-accordion">
        <summary class="cal-past-summary">
          <span>Riwayat Rilis Selesai (${pastCount} agenda sebelumnya)</span>
          <span class="accordion-arrow">▾</span>
        </summary>
        <div class="cal-past-body">
          ${renderGroupMap(pastGroups)}
        </div>
      </details>
    `);
  }

  list.innerHTML = parts.join('');
}
