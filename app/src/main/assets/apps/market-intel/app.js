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
      btn.textContent = 'Memuat…';
      try {
        await fn();
      } finally {
        btn.disabled = false;
        btn.textContent = 'Perbarui';
      }
    });
  };
  bindRefresh('btn-refresh-sentiment', async () => {
    await Promise.allSettled([loadCalendar(true), loadNews(true)]);
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

  for (const item of newsItems) {
    if (item.time && ev.date) {
      const itemDate = new Date(item.time).getTime();
      const evDate = new Date(ev.date).getTime();
      if (Number.isFinite(itemDate) && Number.isFinite(evDate)) {
        const diffHours = Math.abs(itemDate - evDate) / 3600000;
        if (diffHours > 18) continue;
      }
    }

    const raw = `${item.text || ''}\n${item.textOriginal || ''}`;
    const lower = raw.toLowerCase();
    const matchedKw = keywords.find(kw => lower.includes(kw));
    if (!matchedKw) continue;

    const p1 = raw.match(/(?:[•\-\*\s]|^)(?:Aktual|Actual|Saat\s*ini|Current|Sebenarnya|Hasil|Result|Rilis)\s*[:=]?\s*([+-]?\d+(?:[\.,]\d+)?[%KkMmBb]?)/im);
    if (p1?.[1]) return p1[1].trim();

    const kwEsc = matchedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const p2 = new RegExp(`${kwEsc}[^\\n\\r:]*[:=]?\\s*([+-]?\\d+(?:[\\.,]\\d+)?[%KkMmBb]?)`, 'i').exec(raw);
    if (p2?.[1]) return p2[1].trim();

    const p3 = raw.match(/(?:tercatat|keluar|sebesar|mencapai)\s*([+-]?\d+(?:[\.,]\d+)?[%KkMmBb]?)/i);
    if (p3?.[1]) return p3[1].trim();
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

  for (const ev of events) {
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

// ─── Kompas Fundamental Renderer ─────────────────────────
async function loadSentiment(isBackground = false, forceCtxRefresh = false) {
  const container = document.getElementById('sentiment-content');
  const statusEl = document.getElementById('sentiment-status');
  if (!container) return;

  const now = new Date();
  const timeZone = 'Asia/Makassar';
  const nyTimeZone = 'America/New_York';
  const dateStrWita = now.toLocaleDateString('id-ID', {
    timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const timeStrWita = now.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }) + ' WITA';

  const cached = getCachedCalendar();
  const events = (calendarEvents.length > 0 ? calendarEvents : (cached?.events || []));
  const usdEvents = events.filter(e => String(e.country || '').toUpperCase() === 'USD');
  const hasEvents = usdEvents.length > 0;
  const newsItems = getCachedNewsItems();

  // Filter event USD hari ini berdasarkan kalender New York
  const todayNY = now.toLocaleDateString('en-CA', { timeZone: nyTimeZone });
  const todayUsd = usdEvents.filter(e => {
    const d = new Date(e.date);
    return Number.isFinite(d.getTime()) && d.toLocaleDateString('en-CA', { timeZone: nyTimeZone }) === todayNY;
  });
  todayUsd.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  enrichCalendarEventsWithNews(todayUsd, newsItems);

  const importantToday = todayUsd.filter(e => {
    const imp = String(e.impact || '').toLowerCase();
    return imp === 'high' || imp === 'medium';
  });

  // Prioritaskan event yang SUDAH rilis (ada actual) & paling berdampak, lalu upcoming terdekat
  const rankedToday = [...(importantToday.length ? importantToday : todayUsd)]
    .sort((a, b) => scoreEventImportance(b, now.getTime()) - scoreEventImportance(a, now.getTime()));
  const mainEvent = rankedToday[0] || usdEvents.find(e => {
    const t = new Date(e.date).getTime();
    return Number.isFinite(t) && t >= now.getTime();
  }) || null;

  const nfpEvent = todayUsd.find(e => /non-farm|nonfarm|payroll/i.test(e.title));
  const unempEvent = todayUsd.find(e => /unemployment rate/i.test(e.title));
  const wageEvent = todayUsd.find(e => /hourly earnings/i.test(e.title));
  const isLaborPackage = Boolean(nfpEvent && (unempEvent || wageEvent));

  const evTime = mainEvent ? new Date(mainEvent.date).getTime() : 0;
  const isTimePassed = Number.isFinite(evTime) && evTime > 0 && now.getTime() > evTime;
  const minutesSinceScheduled = isTimePassed ? Math.floor((now.getTime() - evTime) / 60000) : 0;
  const eventAnalysis = analyzeMacroEvent(mainEvent);
  const isReleased = Boolean(eventAnalysis?.isReleased);

  // Bukti berita Gold (Geopolitik & Energi)
  const goldNews = newsItems.filter(isNewsRelevantForGold);
  const geopoliticsItems = goldNews.filter(n => {
    const t = `${n.text || ''} ${n.textOriginal || ''}`.toLowerCase();
    return /\b(perang|war|geopolit|serangan|attack|israel|iran|hormuz|russia|rusia|ukraina|ukraine|putin|rudal|missile|nuklir|nuclear|timur tengah|middle east)\b/i.test(t);
  });
  const deescalationItems = goldNews.filter(n => {
    const t = `${n.text || ''} ${n.textOriginal || ''}`.toLowerCase();
    return /\b(gencatan senjata|ceasefire|kesepakatan damai|peace deal|de-eskalasi|deescalation)\b/i.test(t) &&
      !/\b(ended|berakhir|gagal|tolak|no nuclear talks|tidak ada pembicaraan)\b/i.test(t);
  });
  const energyItems = goldNews.filter(n => {
    const t = `${n.text || ''} ${n.textOriginal || ''}`.toLowerCase();
    return /\b(minyak|oil|brent|opec|energi|energy|hormuz)\b/i.test(t);
  });
  const hasGeopolitics = geopoliticsItems.length > 0;
  const isDeescalation = deescalationItems.length > 0;
  const hasEnergyRisk = energyItems.length > 0;

  // Live Context untuk Jembatan Mapping
  let liveCtx = null;
  try {
    liveCtx = window.AmyMarketContext || window.parent?.AmyMarketContext || null;
    if (!liveCtx) {
      const rawCtx = localStorage.getItem('amyfx.market-context.v1');
      if (rawCtx) liveCtx = JSON.parse(rawCtx);
    }
  } catch (_) {}

  const isCtxStale = forceCtxRefresh || !liveCtx || !liveCtx.price || (liveCtx.source?.M15 && (Date.now() / 1000 - Number(liveCtx.source.M15) > 900));
  if (isCtxStale) {
    try {
      const res = await fetch(`${API_BASE}/scalper-setups`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.context) {
          liveCtx = data.context;
          try { localStorage.setItem('amyfx.market-context.v1', JSON.stringify(liveCtx)); } catch (_) {}
        }
      }
    } catch (_) {}
  }

  const bridge = computeMappingBridgeState(liveCtx);
  const cacheAgeMs = cached?.savedAt ? Date.now() - cached.savedAt : 0;
  const isStaleCache = cacheAgeMs > 24 * 60 * 60 * 1000;

  let syncBadgeHtml = '';
  if (!hasEvents) {
    syncBadgeHtml = '<span class="briefing-sync-badge sync-disconnected">Kalender Offline</span>';
  } else if (isCalendarLive) {
    syncBadgeHtml = '<span class="briefing-sync-badge sync-live">Kalender Live</span>';
  } else if (isStaleCache) {
    syncBadgeHtml = '<span class="briefing-sync-badge sync-cache">Cache Usang &gt;24j</span>';
  } else {
    syncBadgeHtml = '<span class="briefing-sync-badge sync-cache">Cache Lokal</span>';
  }

  // ── Sintesis Single Source of Truth (Kompas Utama + Scorecard + Komparasi USD vs Gold) ──
  let usdScore = 'Menanti Data';
  let yieldScore = 'Menanti Sinyal';
  let riskScore = hasGeopolitics && !isDeescalation ? 'Risk-Off · Geopolitik Aktif' : 'Seimbang · Menanti Katalis';
  let goldBias = 'Netral — Menanti Konfirmasi';
  let goldBiasClass = 'mixed';
  let conclusionBias = 'WAIT / NETRAL';
  let horizonStr = 'Sesi Berjalan';
  let dom1Title = mainEvent ? mainEvent.title : 'Dinamika USD & Suku Bunga';
  let dom1Reason = eventAnalysis?.scenarioDesc || 'Pasar menunggu rilis data ekonomi AS untuk mengonfirmasi arah likuiditas berikutnya.';
  let mainScenario = 'Disiplin menunggu reaksi struktur Dealing Range sebelum eksekusi.';
  let confirmCondition = 'Konfirmasi MSS / Displacement valid di M5/M15.';
  let invalidationCondition = 'Sapuan whipsaw dua arah atau kejutan berita mendadak.';
  let mappingBridgeText = 'Gunakan struktur teknikal di Mapping Cockpit sebagai pemicu entri utama.';

  // Komparasi Aset (100% sinkron dengan goldBiasClass — ZERO kontradiksi!)
  let usdDualStatus = 'Konsolidasi';
  let usdDualTone = 'neutral';
  let usdDualText = 'Dolar AS bergerak terbatas sambil menunggu kejelasan katalis makro sesi New York.';
  let goldDualStatus = 'Menanti Katalis';
  let goldDualTone = 'neutral';
  let goldDualText = 'XAU/USD bergerak mengikuti struktur teknikal Dealing Range sampai data resmi menggeser ekspektasi.';

  if (!hasEvents) {
    usdScore = 'Data Belum Tersedia';
    yieldScore = 'Menunggu Sinyal';
    riskScore = 'Tanpa Katalis Terjadwal';
    goldBias = 'Belum Cukup Data Makro';
    goldBiasClass = 'insufficient';
    conclusionBias = 'TEKNIKAL MURNI · TANPA RILIS BESAR';
    horizonStr = 'Mode Teknikal';
    dom1Title = 'Ketiadaan Katalis Makro AS';
    dom1Reason = 'Belum ada jadwal data ekonomi AS yang tersinkronisasi; pergerakan sepenuhnya dipandu struktur teknikal.';
    mainScenario = 'Fokus pada struktur Dealing Range, OB/FVG, dan sapuan likuiditas di Mapping Cockpit.';
    confirmCondition = 'MSS valid di M5 selaras bias M15.';
    invalidationCondition = 'Munculnya breaking news geopolitik atau pernyataan mendadak The Fed.';
    mappingBridgeText = 'Tanpa rilis data tier-1 terjadwal, ikuti sepenuhnya bias dan zona POI aktif pada Mapping Cockpit.';
    usdDualStatus = 'Netral';
    usdDualText = 'Belum ada rilis data AS yang mengubah arah Dolar secara fundamental hari ini.';
    goldDualStatus = 'Ikuti Teknikal';
    goldDualText = 'Fokus penuh pada peta Dealing Range dan zona POI aktif di Mapping Cockpit.';
  } else if (eventAnalysis?.bias === 'BULLISH_BOUNCE') {
    usdScore = isReleased ? 'Melemah Pasca Rilis' : 'Cenderung Melemah';
    yieldScore = 'Mereda · Mendukung Emas';
    goldBias = isReleased ? 'Bullish Bounce (Pasca Data)' : 'Condong Bullish';
    goldBiasClass = 'bullish';
    conclusionBias = isReleased ? 'DUKUNGAN BULLISH · PANTAU KONFIRMASI M5' : 'BIASKAN BUY ON DIPS (MENJELANG RILIS)';
    horizonStr = isReleased ? 'Pasca-Rilis Data' : 'Menjelang Rilis';
    dom1Title = isReleased ? `Rilis Aktual: ${mainEvent.title} (${mainEvent.actual})` : `Proyeksi: ${mainEvent.title}`;
    dom1Reason = eventAnalysis.scenarioDesc;
    mainScenario = bridge.isBearBreakdown
      ? 'Fundamental memberi ruang pantulan, tetapi teknikal masih Breakdown Bearish — tunggu MSS Bullish M5 sebelum Buy, atau tunggu pullback ke Supply jika tren turun bertahan.'
      : 'Cari peluang Buy on Dips di zona Demand/Diskon setelah sapuan SSL dan konfirmasi MSS M5.';
    confirmCondition = isReleased
      ? `Data aktual (${mainEvent.actual}) menekan DXY dan harga membentuk MSS Bullish di M5.`
      : `Actual rilis lebih lemah dari perkiraan (${mainEvent.forecast || 'konsensus'}).`;
    invalidationCondition = 'Harga gagal bertahan di atas demand kunci atau data AS lanjutan berbalik kuat.';
    mappingBridgeText = bridge.isBearBreakdown
      ? 'Hati-hati: fundamental cenderung mendukung pantulan Gold, tetapi struktur M15 sedang Breakdown Bearish. Jangan tangkap pisau jatuh — wajib tunggu MSS Bullish M5 atau pantau pullback Supply di Mapping.'
      : 'Cari konfirmasi entri BUY di area Diskon PD Array (OB/FVG Bullish) setelah SSL tersapu di Mapping Cockpit.';
    usdDualStatus = isReleased ? 'Melemah Pasca Rilis' : 'Cenderung Melemah';
    usdDualTone = 'bear';
    usdDualText = isReleased
      ? `Rilis aktual ${mainEvent.title} (${mainEvent.actual} vs ${mainEvent.forecast || mainEvent.previous || 'konsensus'}) menekan daya tarik Dolar AS dan yield Treasury.`
      : `Ekspektasi pendinginan pada ${mainEvent.title} berpotensi menekan Dolar AS jika terkonfirmasi saat rilis.`;
    goldDualStatus = isReleased ? 'Ruang Pantulan Bullish' : 'Condong Bullish';
    goldDualTone = 'bull';
    goldDualText = bridge.isBearBreakdown
      ? 'Pelemahan USD memberi bantalan pantulan untuk Gold, namun tetap wajib selaraskan dengan struktur M15 yang masih Breakdown di Mapping.'
      : 'Pelemahan USD bersama dukungan safe haven memberi ruang reli bagi XAU/USD menuju likuiditas atas.';
  } else if (eventAnalysis?.bias === 'BEARISH_PRESSURE') {
    usdScore = isReleased ? 'Menguat Pasca Rilis' : 'Cenderung Kuat';
    yieldScore = 'Menekan Emas';
    goldBias = isReleased ? 'Tekanan Bearish (Pasca Data)' : 'Condong Bearish';
    goldBiasClass = 'bearish';
    conclusionBias = isReleased ? 'TEKANAN BEARISH · SELL ON RALLY DI SUPPLY' : 'WASPADA SELL ON RALLY (MENJELANG RILIS)';
    horizonStr = isReleased ? 'Pasca-Rilis Data' : 'Menjelang Rilis';
    dom1Title = isReleased ? `Rilis Aktual: ${mainEvent.title} (${mainEvent.actual})` : `Proyeksi: ${mainEvent.title}`;
    dom1Reason = eventAnalysis.scenarioDesc;
    mainScenario = 'Fokus mencari setup Sell on Rally di zona Supply / Premium PD Array setelah pullback — hindari mengejar Sell di harga bawah.';
    confirmCondition = isReleased
      ? `Data aktual (${mainEvent.actual}) menjaga DXY kuat dan retest Supply M15/M5 ditolak.`
      : `Actual rilis lebih kuat dari perkiraan (${mainEvent.forecast || 'konsensus'}).`;
    invalidationCondition = 'Eskalasi geopolitik mendadak atau penembusan struktur atas (Bear Invalid) di Mapping.';
    mappingBridgeText = bridge.isBearBreakdown
      ? 'Fundamental dan teknikal selaras Bearish (Breakdown). Jangan kejar Sell di dasar — tunggu pullback ke zona Supply/FVG terdekat di Mapping Cockpit.'
      : 'Fokus Sell on Rally di zona Premium PD Array (Bearish OB/FVG) sesudah BSL tersapu di Mapping Cockpit.';
    usdDualStatus = isReleased ? 'Menguat Pasca Rilis' : 'Cenderung Kuat';
    usdDualTone = 'bull';
    usdDualText = isReleased
      ? `Rilis aktual ${mainEvent.title} (${mainEvent.actual} vs ${mainEvent.forecast || mainEvent.previous || 'konsensus'}) menjaga ketahanan Dolar AS dan yield obligasi.`
      : `Proyeksi solid pada ${mainEvent.title} menopang Dolar AS dan menahan ekspektasi pemangkasan suku bunga agresif.`;
    goldDualStatus = 'Tekanan Bearish';
    goldDualTone = 'bear';
    goldDualText = hasGeopolitics && !isDeescalation
      ? 'Penguatan Dolar menekan Gold, namun tensi geopolitik aktif tetap menjadi bantalan yang bisa memicu pullback tajam.'
      : 'Kekuatan Dolar dan yield membatasi kenaikan emas non-yielding; fokus disiplin mencari Sell saat pullback ke zona Supply.';
  } else if (isLaborPackage && !isReleased) {
    usdScore = 'Siaga Volatilitas NFP';
    yieldScore = 'Menanti Data NFP';
    goldBias = 'Siaga Volatilitas Tinggi (Pra-NFP)';
    goldBiasClass = 'mixed';
    conclusionBias = 'NEWS LOCK · MENJELANG PAKET DATA NFP';
    horizonStr = 'Pra-Rilis NFP';
    dom1Title = 'Paket Ketenagakerjaan AS (NFP · Unemployment · Upah)';
    dom1Reason = 'Rilis gabungan tenaga kerja AS adalah katalis tier-1 paling volatil bagi XAU/USD; hindari eksekusi sebelum angka resmi keluar.';
    mainScenario = 'Tahan posisi baru 15 menit sebelum hingga 15 menit sesudah rilis NFP, lalu ikuti arah konfirmasi pasca-sweep di Mapping.';
    confirmCondition = 'Terbentuk MSS dan Displacement bersih di M5 setelah spike awal mereda.';
    invalidationCondition = 'Pergerakan whipsaw dua arah tanpa penutupan candle yang jelas.';
    mappingBridgeText = 'Gunakan protokol News Lock menjelang NFP. Eksekusi baru dibuka setelah likuiditas BSL/SSL tersapu dan MSS M5 terbentuk.';
    usdDualStatus = 'Siaga NFP';
    usdDualTone = 'neutral';
    usdDualText = 'Dolar AS menunggu angka resmi NFP dan Tingkat Pengangguran untuk menentukan arah tren berikutnya.';
    goldDualStatus = 'Siaga Volatilitas';
    goldDualTone = 'neutral';
    goldDualText = 'Spread dan spike XAU/USD biasanya melebar drastis saat NFP; tunggu pasar memilih arah pasca-rilis.';
  } else {
    usdScore = 'Konsolidasi';
    yieldScore = 'Bergerak Terbatas';
    goldBias = 'Campuran / Menanti Katalis';
    goldBiasClass = 'mixed';
    conclusionBias = 'WAIT / NETRAL';
    horizonStr = 'Sesi Berjalan';
    usdDualStatus = 'Konsolidasi';
    usdDualTone = 'neutral';
    usdDualText = `Pasar masih menunggu kepastian arah dari ${mainEvent ? mainEvent.title : 'katalis makro AS'} sebelum mendorong DXY satu arah.`;
    goldDualStatus = 'Campuran / Range';
    goldDualTone = 'neutral';
    goldDualText = 'Belum ada kejutan fundamental yang kuat; ikuti disiplin struktur teknikal dan zona POI pada Mapping Cockpit.';
  }

  // Time-aware adjustment jika jadwal mainEvent sudah lewat tapi actual belum tersedia
  if (!isReleased && isTimePassed && minutesSinceScheduled >= 5 && hasEvents && mainEvent) {
    const evTimeStr = new Date(mainEvent.date).toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' });
    horizonStr = `Pasca-Rilis (${minutesSinceScheduled}m lalu)`;
    if (goldBiasClass === 'mixed' || goldBiasClass === 'insufficient') {
      conclusionBias = 'EVALUASI REAKSI PASAR';
      mainScenario = 'Amati respon harga pasca-rilis di Mapping Cockpit; hindari mengejar spike awal.';
      mappingBridgeText = `Jadwal ${mainEvent.title} (${evTimeStr} WITA) sudah lewat. Pantau apakah terjadi sapuan likuiditas dan tunggu MSS M5 sebelum entri.`;
    }
  }

  // Faktor Dominan #2 (Geopolitik / Safe Haven) & #3 (Yield)
  const dom2Title = hasGeopolitics && !isDeescalation
    ? 'Tensi Geopolitik Aktif (Safe Haven)'
    : (isDeescalation ? 'Peredaan Tensi Geopolitik' : 'Permintaan Safe Haven & Bank Sentral');
  const dom2Reason = hasGeopolitics && !isDeescalation
    ? `Berita geopolitik terbaru (${truncate(geopoliticsItems[0]?.text || '', 72)}) menjaga minat lindung nilai pada Gold.`
    : (isDeescalation
      ? 'Sinyal de-eskalasi dan pembicaraan damai mengurangi premi risiko safe haven pada Gold.'
      : 'Akumulasi cadangan emas bank sentral tetap menjadi fondasi penopang jangka panjang.');
  const dom3Title = 'Imbal Hasil US Treasury 10-Year';
  const dom3Reason = 'Korelasi terbalik yield obligasi riil AS tetap menjadi penentu arus modal institusi terhadap emas non-yielding.';

  if (statusEl) {
    if (!hasEvents) {
      statusEl.textContent = `Pembaruan ${timeStrWita} • Kalender offline • Mode teknikal`;
    } else if (isCalendarLive) {
      statusEl.textContent = `Pembaruan ${timeStrWita} • ${usdEvents.length} agenda USD tersinkron (Live)`;
    } else if (isStaleCache) {
      statusEl.textContent = `Pembaruan ${timeStrWita} • ${usdEvents.length} agenda USD (Cache usang >24j)`;
    } else {
      statusEl.textContent = `Pembaruan ${timeStrWita} • ${usdEvents.length} agenda USD (Cache lokal)`;
    }
  }

  // Bukti Pendukung vs Risiko Pembatal (Dinamis & Dapat Diklik)
  const supportItems = [];
  const opposeItems = [];
  if (!hasEvents) {
    supportItems.push('Tidak ada rilis ekonomi AS terjadwal; keputusan fokus pada struktur Mapping.');
    opposeItems.push('Waspadai berita mendadak (geopolitik / pidato The Fed) di luar kalender.');
  } else if (goldBiasClass === 'bullish') {
    supportItems.push(`${escapeHtml(mainEvent?.title || 'Data AS')}: melemahkan USD & memberi ruang pantulan Gold.`);
    if (mainEvent) {
      supportItems.push(`<button type="button" class="intel-evidence-link" onclick="openEvidenceCalendar()">Lihat Kalender: ${escapeHtml(mainEvent.title)} (${escapeHtml(mainEvent.actual ? `Act ${mainEvent.actual}` : `F ${mainEvent.forecast || '—'}`)})</button>`);
    }
    if (hasGeopolitics && !isDeescalation && geopoliticsItems[0]) {
      supportItems.push(`<button type="button" class="intel-evidence-link" onclick="openEvidenceNews('${escapeHtml(newsId(geopoliticsItems[0]))}')">Berita Geopolitik: ${escapeHtml(truncate(geopoliticsItems[0].text, 48))}</button>`);
    }
    if (bridge.isBearBreakdown) {
      opposeItems.push(`Struktur teknikal M15 masih ${escapeHtml(bridge.zoneText)} — hindari Buy sebelum ada MSS Bullish M5.`);
    }
    opposeItems.push('Suku bunga The Fed masih di level restriktif jika data AS berikutnya kembali kuat.');
  } else if (goldBiasClass === 'bearish') {
    supportItems.push(`${escapeHtml(mainEvent?.title || 'Data AS')}: menopang DXY & menekan Gold.`);
    if (mainEvent) {
      supportItems.push(`<button type="button" class="intel-evidence-link" onclick="openEvidenceCalendar()">Lihat Kalender: ${escapeHtml(mainEvent.title)} (${escapeHtml(mainEvent.actual ? `Act ${mainEvent.actual}` : `F ${mainEvent.forecast || '—'}`)})</button>`);
    }
    if (hasGeopolitics && !isDeescalation && geopoliticsItems[0]) {
      opposeItems.push('Tensi geopolitik aktif bertindak sebagai bantalan safe haven penahan penurunan.');
      opposeItems.push(`<button type="button" class="intel-evidence-link" onclick="openEvidenceNews('${escapeHtml(newsId(geopoliticsItems[0]))}')">Berita Geopolitik: ${escapeHtml(truncate(geopoliticsItems[0].text, 48))}</button>`);
    } else {
      opposeItems.push('Permintaan fisik bank sentral menjaga level support struktural jangka panjang.');
    }
  } else {
    supportItems.push('Struktur likuiditas Mapping & dinamika safe haven menjadi panduan utama.');
    if (mainEvent) {
      supportItems.push(`<button type="button" class="intel-evidence-link" onclick="openEvidenceCalendar()">Agenda Utama: ${escapeHtml(mainEvent.title)}</button>`);
    }
    opposeItems.push('Potensi whipsaw dua arah sebelum arah data/struktur benar-benar terkonfirmasi.');
  }

  // Event list sesi ini
  let eventListHtml = '';
  if (importantToday.length > 0) {
    eventListHtml = importantToday.map(ev => {
      const evDate = new Date(ev.date);
      const timeStr = Number.isFinite(evDate.getTime())
        ? evDate.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }) + ' WITA'
        : 'Sesi NY';
      const imp = String(ev.impact || '').toLowerCase();
      const impLabel = imp === 'high' ? 'High Impact' : 'Medium';
      const impClass = imp === 'high' ? 'tag-high' : 'tag-med';
      const hasActual = Boolean(ev.actual && ev.actual !== '--' && ev.actual !== '—');
      const isMain = mainEvent && ev.title === mainEvent.title && ev.date === mainEvent.date;

      return `
        <div class="briefing-event-item ${isMain ? 'is-primary-event' : ''}">
          <div class="event-item-top">
            <span class="event-item-time">🇺🇸 ${escapeHtml(timeStr)}${isMain ? ' · Fokus Utama' : ''}</span>
            <span class="event-item-tag ${impClass}">${impLabel}</span>
          </div>
          <div class="event-item-title">${escapeHtml(ev.title)}</div>
          <div class="event-item-numbers">
            <span>Forecast: <strong>${escapeHtml(ev.forecast || '—')}</strong></span>
            <span>Previous: <strong>${escapeHtml(ev.previous || '—')}</strong></span>
            <span>Actual: <strong class="${hasActual ? 'act-live' : ''}">${escapeHtml(ev.actual || '—')}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  } else if (mainEvent) {
    const evDate = new Date(mainEvent.date);
    const timeStr = Number.isFinite(evDate.getTime())
      ? evDate.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }) + ' WITA'
      : 'Mendatang';
    const hasActual = Boolean(mainEvent.actual && mainEvent.actual !== '—' && mainEvent.actual !== '--');
    eventListHtml = `
      <div class="briefing-event-item is-primary-event">
        <div class="event-item-top">
          <span class="event-item-time">🇺🇸 ${escapeHtml(timeStr)}</span>
          <span class="event-item-tag tag-med">Agenda Terdekat</span>
        </div>
        <div class="event-item-title">${escapeHtml(mainEvent.title)}</div>
        <div class="event-item-numbers">
          <span>Forecast: <strong>${escapeHtml(mainEvent.forecast || '—')}</strong></span>
          <span>Previous: <strong>${escapeHtml(mainEvent.previous || '—')}</strong></span>
          <span>Actual: <strong class="${hasActual ? 'act-live' : ''}">${escapeHtml(mainEvent.actual || '—')}</strong></span>
        </div>
      </div>
    `;
  } else {
    eventListHtml = '<div class="briefing-empty-events">Tidak ada rilis USD berdampak tinggi hari ini <button type="button" class="amy-info-btn" data-info-tip="Tidak ada rilis data USD berdampak tinggi/menengah hari ini. Pergerakan XAU/USD dipandu struktur teknikal Mapping." aria-label="Info rilis USD" aria-expanded="false">i</button></div>';
  }

  // Playbook reaksi dinamis (ZERO harga hardcoded, ZERO raw markdown *...*)
  let scenarioReactionHtml = '';
  const eventReleaseTimeWita = (mainEvent?.date && Number.isFinite(new Date(mainEvent.date).getTime()))
    ? new Date(mainEvent.date).toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }) + ' WITA'
    : 'Sesi NY';

  if (isLaborPackage) {
    const fNfp = escapeHtml(nfpEvent?.forecast || 'konsensus');
    const verdictHtml = isReleased
      ? `<div class="verdict-banner-box ${goldBiasClass === 'bearish' ? 'verdict-bear' : (goldBiasClass === 'bullish' ? 'verdict-bull' : 'verdict-neutral')}">
           <div class="verdict-banner-head">Hasil Resmi Rilis NFP (${escapeHtml(mainEvent.actual)})</div>
           <p class="verdict-banner-body">${escapeHtml(eventAnalysis.scenarioDesc)} Fokus validasi zona PD Array di Mapping Cockpit.</p>
         </div>`
      : '';
    scenarioReactionHtml = `
      <div class="reaction-guide-box">
        ${verdictHtml}
        <div class="reaction-title">${isReleased ? 'Evaluasi Skenario Pasca-Rilis NFP' : 'Playbook Reaksi Gold Terhadap NFP'}</div>
        <ul class="briefing-list">
          <li><strong>Data Lebih Kuat dari ${fNfp} (Strong USD):</strong> Tekanan jual <em>bearish</em> ke Gold — pantau <em>Sell on Rally</em> di zona Supply menuju EQ (${escapeHtml(bridge.rangeEqStr)}) hingga Range Low (${escapeHtml(bridge.rangeLowStr)}).</li>
          <li><strong>Data Lebih Lemah dari ${fNfp} (Weak USD):</strong> Katalis reli <em>bullish</em> Gold — tunggu retest Demand setelah <em>sweep</em> menuju likuiditas atas (${escapeHtml(bridge.bslStr)}).</li>
          <li><strong>Sesuai Konsensus (Mixed):</strong> Risiko <em>whipsaw</em> dua arah; hindari entri di tengah EQ (${escapeHtml(bridge.rangeEqStr)}).</li>
        </ul>
      </div>
    `;
  } else if (mainEvent && (mainEvent.forecast || mainEvent.previous)) {
    const fStr = escapeHtml(mainEvent.forecast || mainEvent.previous || 'Konsensus');
    const aStr = escapeHtml(mainEvent.actual || '—');
    const isInverse = Boolean(eventAnalysis?.inverseUsd);

    const verdictHtml = isReleased
      ? `<div class="verdict-banner-box ${goldBiasClass === 'bearish' ? 'verdict-bear' : (goldBiasClass === 'bullish' ? 'verdict-bull' : 'verdict-neutral')}">
           <div class="verdict-banner-head">${goldBiasClass === 'bullish' ? 'Hasil Resmi: Dukungan Bullish Gold (USD Melemah)' : (goldBiasClass === 'bearish' ? 'Hasil Resmi: Tekanan Bearish Gold (USD Menguat)' : 'Hasil Resmi: Sesuai Konsensus / Netral')}</div>
           <p class="verdict-banner-body">Data aktual <strong>${escapeHtml(mainEvent.title)}</strong> rilis <strong class="act-live">${aStr}</strong> (vs perkiraan ${fStr}). ${escapeHtml(eventAnalysis.scenarioDesc)}</p>
         </div>`
      : '';

    scenarioReactionHtml = `
      <div class="reaction-guide-box">
        ${verdictHtml}
        <div class="reaction-title">${isReleased ? 'Evaluasi Skenario Pasca-Rilis' : 'Playbook Reaksi Gold'}: ${escapeHtml(mainEvent.title)}</div>
        <ul class="briefing-list">
          ${isInverse ? `
            <li class="${isReleased && goldBiasClass === 'bullish' ? 'playbook-hit-bull' : ''}"><strong>Actual &gt; ${fStr} (Klaim Naik):</strong> USD melemah ➔ peluang pantulan <em>bullish</em> untuk Gold.${isReleased && goldBiasClass === 'bullish' ? ' <strong>[Terkonfirmasi]</strong>' : ''}</li>
            <li class="${isReleased && goldBiasClass === 'bearish' ? 'playbook-hit-bear' : ''}"><strong>Actual &lt; ${fStr} (Klaim Turun):</strong> USD menguat ➔ tekanan <em>bearish</em> ke Gold.${isReleased && goldBiasClass === 'bearish' ? ' <strong>[Terkonfirmasi]</strong>' : ''}</li>
          ` : `
            <li class="${isReleased && goldBiasClass === 'bearish' ? 'playbook-hit-bear' : ''}"><strong>Actual &gt; ${fStr} (Data AS Kuat):</strong> DXY &amp; Yield menguat ➔ tekanan <em>bearish</em> untuk Gold.${isReleased && goldBiasClass === 'bearish' ? ' <strong>[Terkonfirmasi]</strong>' : ''}</li>
            <li class="${isReleased && goldBiasClass === 'bullish' ? 'playbook-hit-bull' : ''}"><strong>Actual &lt; ${fStr} (Data AS Lemah):</strong> DXY melemah ➔ dorongan <em>bullish</em> untuk Gold.${isReleased && goldBiasClass === 'bullish' ? ' <strong>[Terkonfirmasi]</strong>' : ''}</li>
          `}
        </ul>
      </div>
    `;
  }

  const narrativeSummary = hasEvents
    ? (isReleased
        ? `Pasca rilis <strong>${escapeHtml(mainEvent.title)}</strong> (Aktual <strong class="act-live">${escapeHtml(mainEvent.actual)}</strong> vs perkiraan ${escapeHtml(mainEvent.forecast || mainEvent.previous || '—')}), bias fundamental XAU/USD berada pada kondisi <strong>${escapeHtml(goldBias)}</strong>. ${escapeHtml(eventAnalysis.scenarioDesc)}`
        : (!isReleased && isTimePassed && minutesSinceScheduled >= 5
            ? `Jadwal rilis <strong>${escapeHtml(mainEvent.title)}</strong> telah lewat (${escapeHtml(eventReleaseTimeWita)}). Angka resmi belum terpublikasi di feed — hindari mengejar <em>spike</em> awal dan pantau struktur Dealing Range di Mapping Cockpit.`
            : `Fokus sesi ini tertuju pada <strong>${escapeHtml(mainEvent?.title || 'agenda ekonomi AS')}</strong> (Forecast ${escapeHtml(mainEvent?.forecast || '—')} vs Previous ${escapeHtml(mainEvent?.previous || '—')}). ${escapeHtml(eventAnalysis?.scenarioDesc || '')}`))
    : 'Belum ada rilis data ekonomi AS terjadwal. Pergerakan XAU/USD dipandu oleh struktur teknikal dan likuiditas di Mapping Cockpit.';

  container.innerHTML = `
    <div class="fundamental-briefing-wrap">
      <!-- 1. Kompas Utama & Scorecard -->
      <article class="briefing-card card-primary card-conclusion tone-${goldBiasClass}">
        <div class="card-head card-head-tight">
          <div class="card-title-wrap">
            <h2 class="card-title">Kompas Fundamental XAU/USD</h2>
          </div>
          ${syncBadgeHtml}
        </div>

        <div class="kompas-subrow">
          <span class="kompas-date-label">${escapeHtml(dateStrWita)}</span>
          <span class="kompas-horizon-pill">Horizon: <strong>${escapeHtml(horizonStr)}</strong></span>
        </div>

        <div class="conclusion-badge tone-${goldBiasClass}">${escapeHtml(conclusionBias)}</div>

        <div class="editorial-narrative-box">
          <p class="conclusion-guide">${narrativeSummary}</p>
        </div>

        <div class="scorecard-grid">
          <div class="scorecard-item">
            <span class="score-label">USD / DXY</span>
            <span class="score-value">${escapeHtml(usdScore)}</span>
          </div>
          <div class="scorecard-item">
            <span class="score-label">Yield US Treasury</span>
            <span class="score-value">${escapeHtml(yieldScore)}</span>
          </div>
          <div class="scorecard-item">
            <span class="score-label">Risk Sentiment</span>
            <span class="score-value">${escapeHtml(riskScore)}</span>
          </div>
          <div class="scorecard-item">
            <span class="score-label">Bias Fundamental Gold</span>
            <span class="score-value">${escapeHtml(goldBias)}</span>
          </div>
        </div>
      </article>

      <!-- 2. Katalis & Playbook Sesi Ini -->
      <article class="briefing-card">
        <div class="card-head">
          <div class="card-title-wrap">
            <h3 class="card-title">Katalis Sesi Ini &amp; Playbook <button type="button" class="amy-info-btn" data-info-tip="Pantau khusus pernyataan pejabat The Fed, arah indeks DXY, dan imbal hasil US 10-Year." aria-label="Info katalis" aria-expanded="false">i</button></h3>
          </div>
          <span class="bias-pill highlight">Kalender USD</span>
        </div>
        <div class="briefing-events-container">${eventListHtml}</div>
        ${scenarioReactionHtml}
      </article>

      <!-- 3. Komparasi Aset & Jembatan Eksekusi Mapping -->
      <article class="briefing-card card-execution">
        <div class="card-head">
          <div class="card-title-wrap">
            <h3 class="card-title">Sinkronisasi Aset &amp; Jembatan Mapping</h3>
          </div>
          <span class="bias-pill ${goldBiasClass}">${escapeHtml(goldBias)}</span>
        </div>

        <div class="intel-dual-grid">
          <div class="intel-dual-card card-usd">
            <div class="intel-dual-head">
              <span class="intel-dual-title">Dolar AS (USD / DXY)</span>
              <span class="intel-dual-status ${usdDualTone}">${escapeHtml(usdDualStatus)}</span>
            </div>
            <p class="intel-dual-text">${escapeHtml(usdDualText)}</p>
          </div>
          <div class="intel-dual-card card-gold">
            <div class="intel-dual-head">
              <span class="intel-dual-title">Gold (XAU/USD)</span>
              <span class="intel-dual-status ${goldDualTone}">${escapeHtml(goldDualStatus)}</span>
            </div>
            <p class="intel-dual-text">${escapeHtml(goldDualText)}</p>
          </div>
        </div>

        <div class="scenario-box bridge-box">
          <div class="bridge-box-head">
            <span class="scenario-box-title">Jembatan Eksekusi ke Mapping Cockpit</span>
            <a class="intel-bridge-cta" href="../mapping/index.html">Buka Mapping →</a>
          </div>
          <div class="intel-ict-strip">
            <div class="intel-ict-pill">Harga: <strong>${escapeHtml(bridge.priceStr)}</strong></div>
            <div class="intel-ict-pill zone-pill-${bridge.zoneTone}">Zona: <strong>${escapeHtml(bridge.zoneText)}</strong></div>
            <div class="intel-ict-pill">Range High: <strong>${escapeHtml(bridge.rangeHighStr)}</strong></div>
            <div class="intel-ict-pill">Range Low: <strong>${escapeHtml(bridge.rangeLowStr)}</strong></div>
            <div class="intel-ict-pill">EQ 50%: <strong>${escapeHtml(bridge.rangeEqStr)}</strong></div>
            <div class="intel-ict-pill">BSL Atas: <strong>${escapeHtml(bridge.bslStr)}</strong></div>
            <div class="intel-ict-pill">SSL Bawah: <strong>${escapeHtml(bridge.sslStr)}</strong></div>
          </div>
          <p class="bridge-guide-text">${escapeHtml(mappingBridgeText)}</p>
        </div>

        <div class="judas-swing-warning-box ${isReleased ? 'is-post-release' : ''}">
          <div class="judas-swing-head">
            <span>${isReleased ? 'Fase Pasca-Rilis · Konfirmasi M5/M15' : `News Lock ±15m · Waspada Judas Swing (${escapeHtml(eventReleaseTimeWita)})`} <button type="button" class="amy-info-btn" data-info-tip="${escapeHtml(isReleased
              ? 'Data aktual telah rilis. Fase News Lock berakhir — validasi pembentukan Market Structure Shift (MSS) dan Displacement di M5/M15 pada Mapping Cockpit sebelum eksekusi.'
              : `Disiplin tahan posisi (News Lock) 15 menit sebelum hingga 15 menit sesudah rilis untuk menghindari sapuan likuiditas palsu (Judas Swing) pada BSL (${bridge.bslStr}) maupun SSL (${bridge.sslStr}).`)}" aria-label="Info protokol risiko" aria-expanded="false">i</button></span>
          </div>
        </div>
      </article>

      <!-- 4. Rincian Faktor & Bukti Makro (Collapsible) -->
      <details class="briefing-card briefing-accordion">
        <summary class="briefing-accordion-summary">
          <span>Rincian 3 Faktor Dominan, Skenario &amp; Bukti Makro</span>
          <span class="accordion-arrow">▾</span>
        </summary>
        <div class="briefing-accordion-body">
          <div class="scenario-box">
            <div class="scenario-box-title">Skenario Fundamental Terstruktur</div>
            <ul class="briefing-list">
              <li><strong>Skenario Utama:</strong> ${escapeHtml(mainScenario)}</li>
              <li><strong>Kondisi Penguat:</strong> ${escapeHtml(confirmCondition)}</li>
              <li><strong>Batas Pembatalan (Invalidasi):</strong> ${escapeHtml(invalidationCondition)}</li>
            </ul>
          </div>

          <div class="dominant-factors-box">
            <div class="dominant-factors-title">3 Faktor Penggerak Utama</div>
            <div class="dominant-factor-item">
              <span class="dominant-factor-rank">#1</span>
              <div class="dominant-factor-text"><strong>${escapeHtml(dom1Title)}:</strong> ${escapeHtml(dom1Reason)}</div>
            </div>
            <div class="dominant-factor-item">
              <span class="dominant-factor-rank">#2</span>
              <div class="dominant-factor-text"><strong>${escapeHtml(dom2Title)}:</strong> ${escapeHtml(dom2Reason)}</div>
            </div>
            <div class="dominant-factor-item">
              <span class="dominant-factor-rank">#3</span>
              <div class="dominant-factor-text"><strong>${escapeHtml(dom3Title)}:</strong> ${escapeHtml(dom3Reason)}</div>
            </div>
          </div>

          <div class="kompas-evidence-cols">
            <div class="kompas-evidence-col col-support">
              <div class="evidence-col-title">Bukti Pendukung Bias</div>
              <ul class="evidence-list">${supportItems.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
            <div class="kompas-evidence-col col-oppose">
              <div class="evidence-col-title">Risiko &amp; Faktor Pembatal</div>
              <ul class="evidence-list">${opposeItems.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
          </div>
          ${hasEnergyRisk ? '<p class="energy-risk-note">Risiko Energi Aktif <button type="button" class="amy-info-btn" data-info-tip="Berita minyak/energi terdeteksi aktif — waspadai efek rambatan ke ekspektasi inflasi." aria-label="Info risiko energi" aria-expanded="false">i</button></p>' : ''}
        </div>
      </details>
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

function renderCalendar() {
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
