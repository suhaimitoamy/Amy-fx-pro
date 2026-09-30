/**
 * Amy FX — Market Intel App
 * ========================
 * Fetch: News dari SM_News_24h (via API)
 *        Heatmap dari liquidity calculation (via API)
 */

// ─── Config ──────────────────────────────────────────────
const API_BASE = 'https://amy-fx.vercel.app/api';
const REFRESH_INTERVAL = 60 * 1000; // Auto-refresh setiap 1 menit

// ─── State ───────────────────────────────────────────────
let currentTab = 'sentiment';
let pendingNewsId = '';
let newsRouteRetries = 0;
let newsFetchSequence = 0;
let isCalendarLive = false;
const requestControllers = {};
const panelLoadedAt = {};

function newsId(item) {
  return String(item?.id || `${item?.time || ''}:${item?.textOriginal || item?.text || ''}`);
}

function newsTargetUrl(id) {
  const base = 'file:///android_asset/apps/market-intel/index.html';
  return `${base}#news=${encodeURIComponent(id)}`;
}

function isNewsRelevantForGold(item) {
  if (!item) return false;
  if (item.relevant === true) return true;
  const text = (item.text || item.textOriginal || '').toLowerCase();
  const goldKeywords = [
    'gold', 'xau', 'emas', 'bullion', 'fed', 'fomc', 'powell',
    'inflation', 'cpi', 'pce', 'treasury', 'yield', 'dxy', 'dollar',
    'dolar', 'nfp', 'payroll', 'jobless', 'claims', 'war', 'perang',
    'geopolit', 'safe haven', 'central bank', 'bank sentral',
    'suku bunga', 'rate cut', 'rate hike'
  ];
  return goldKeywords.some(kw => text.includes(kw));
}

window.openEvidenceNews = function(id) {
  activateTab('news');
  focusNewsItem(id);
};

window.openEvidenceCalendar = function() {
  activateTab('calendar');
};

function cleanNewsContent(value) {
  return String(value || '')
    .replace(/https?:\/\/(?:t\.me|telegram\.me|telegram\.dog)\/\S+/gi, '')
    .replace(/@?SM[\s_-]*News[\s_-]*(?:24h?|24[\s_-]*jam)?/gi, '')
    .replace(/^\s*(?:sumber|source)\s*:\s*$/gim, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function prepareNewsItem(item) {
  const prepared = { ...item };
  prepared.textOriginal = cleanNewsContent(prepared.textOriginal);
  prepared.text = cleanNewsContent(prepared.text) || prepared.textOriginal || 'Berita terbaru XAU/USD.';
  delete prepared.link;
  delete prepared.source;
  return prepared;
}

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

function clearHeatmapState() {
  const canvas = document.getElementById('heatmap-canvas');
  if (canvas) canvas.replaceChildren();
  const price = document.getElementById('heatmap-price');
  if (price) price.textContent = '--';
  hideLoading();
}

function payloadIsFresh(updated, maxAgeMs = 10 * 60 * 1000) {
  if (!updated) return true;
  const timestamp = new Date(updated).getTime();
  return !Number.isFinite(timestamp) || Date.now() - timestamp <= maxAgeMs;
}

// ─── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  pendingNewsId = readNewsRoute();
  // ICT Intel owns the hero; legacy snapshots cannot overwrite Mapping levels.

  setupTabs();
  setupNewsInteractions();
  setupCalendarFilters();

  if (pendingNewsId) {
    activateTab('news');
  } else {
    activateTab('sentiment');
  }

  // Instant render from local cache first, then sync in background
  loadSentiment();
  loadCalendar();
  loadNews();

  // Auto-refresh
  setInterval(() => {
    if (document.hidden) return;
    if (currentTab === 'news') loadNews(true);
    else if (currentTab === 'calendar') loadCalendar(true);
    else if (currentTab === 'sentiment') loadSentiment(true);
    else if (currentTab === 'heatmap') loadHeatmap(true);
    else if (currentTab === 'liquidity') loadLiquidity(true);
  }, REFRESH_INTERVAL);

  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('webview-idle', document.hidden);
    if (!document.hidden) {
      if (currentTab === 'news' && shouldRefresh('news', REFRESH_INTERVAL)) loadNews(true);
      if (currentTab === 'calendar' && shouldRefresh('calendar', REFRESH_INTERVAL)) loadCalendar(true);
      if (currentTab === 'sentiment') loadSentiment(true);
      if (currentTab === 'heatmap' && shouldRefresh('heatmap', REFRESH_INTERVAL)) loadHeatmap(true);
      if (currentTab === 'liquidity' && shouldRefresh('liquidity', REFRESH_INTERVAL)) loadLiquidity(true);
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

// ─── Tab Navigation ──────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.intel-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
    });
  });
}

function activateTab(tab) {
  if (!['news', 'calendar', 'sentiment', 'heatmap', 'liquidity'].includes(tab)) return;
  currentTab = tab;
  document.querySelectorAll('.intel-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.intel-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  if (tab === 'calendar' && shouldRefresh('calendar')) loadCalendar();
  else if (tab === 'news' && shouldRefresh('news')) loadNews();
  else if (tab === 'sentiment') loadSentiment();
  else if (tab === 'heatmap' && shouldRefresh('heatmap')) loadHeatmap();
  else if (tab === 'liquidity' && shouldRefresh('liquidity')) loadLiquidity();
}

// ─── Dynamic 5-Point Fundamental Briefing Engine ──────────────
function parseCalendarNumber(str) {
  if (!str || str === '—' || str === '--') return null;
  const match = String(str).match(/([+-]?\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function analyzeMacroEvent(ev) {
  if (!ev) return null;
  const title = String(ev.title || '').trim();
  const titleLower = title.toLowerCase();
  const fVal = parseCalendarNumber(ev.forecast);
  const pVal = parseCalendarNumber(ev.previous);
  const aVal = parseCalendarNumber(ev.actual);
  const isReleased = aVal !== null;

  let category = 'other';
  let bias = 'NEUTRAL';
  let scenarioDesc = '';

  if (titleLower.includes('unemployment claims') || titleLower.includes('jobless claims')) {
    category = 'claims';
    if (isReleased) {
      const refVal = fVal !== null ? fVal : pVal;
      if (refVal !== null && aVal > refVal) {
        bias = 'BULLISH_BOUNCE';
        scenarioDesc = `Klaim pengangguran aktual lebih tinggi dari proyeksi (${aVal}K vs ${refVal}K), mengindikasikan pasar tenaga kerja AS mulai mendingin dan membuka peluang nafas lega bagi Gold.`;
      } else if (refVal !== null && aVal < refVal) {
        bias = 'BEARISH_PRESSURE';
        scenarioDesc = `Klaim pengangguran aktual lebih rendah dari proyeksi (${aVal}K vs ${refVal}K), mencerminkan pasar tenaga kerja AS yang masih solid dan menjaga Dolar AS tetap perkasa menekan Gold.`;
      } else {
        bias = 'NEUTRAL';
        scenarioDesc = `Klaim pengangguran aktual keluar sesuai proyeksi (${aVal}K), reaksi pasar cenderung berimbang.`;
      }
    } else {
      if (fVal !== null && pVal !== null && fVal > pVal) {
        bias = 'BULLISH_BOUNCE';
        scenarioDesc = 'Proyeksi kenaikan klaim pengangguran mengindikasikan pasar tenaga kerja AS mulai mendingin, membuka peluang nafas lega bagi Gold.';
      } else {
        bias = 'BEARISH_PRESSURE';
        scenarioDesc = 'Klaim pengangguran masih rendah mencerminkan pasar tenaga kerja AS yang solid, menjaga Dolar AS tetap perkasa menekan Gold.';
      }
    }
  } else if (titleLower.includes('cpi') || titleLower.includes('pce') || titleLower.includes('inflation')) {
    category = 'inflation';
    if (isReleased) {
      const refVal = fVal !== null ? fVal : pVal;
      if (refVal !== null && aVal > refVal) {
        bias = 'BEARISH_PRESSURE';
        scenarioDesc = `Data inflasi aktual keluar lebih panas dari perkiraan (${aVal}% vs ${refVal}%), memperkuat ekspektasi suku bunga ketat The Fed dan menekan Gold.`;
      } else if (refVal !== null && aVal < refVal) {
        bias = 'BULLISH_BOUNCE';
        scenarioDesc = `Data inflasi aktual melandai di bawah perkiraan (${aVal}% vs ${refVal}%), meredakan kekhawatiran suku bunga dan mendukung reli Gold.`;
      } else {
        bias = 'NEUTRAL';
        scenarioDesc = `Data inflasi aktual sesuai konsensus (${aVal}%), fokus pasar beralih ke rincian komponen inti.`;
      }
    } else {
      bias = (fVal !== null && pVal !== null && fVal > pVal) ? 'BEARISH_PRESSURE' : 'BULLISH_BOUNCE';
      scenarioDesc = 'Data inflasi sangat menentukan arah suku bunga The Fed. Inflasi panas menekan emas, sedangkan inflasi melandai mendorong reli emas.';
    }
  } else if (titleLower.includes('non-farm') || titleLower.includes('payrolls') || titleLower.includes('unemployment rate')) {
    category = 'labor';
    if (isReleased) {
      if (titleLower.includes('unemployment rate')) {
        const refVal = fVal !== null ? fVal : pVal;
        bias = (refVal !== null && aVal > refVal) ? 'BULLISH_BOUNCE' : 'BEARISH_PRESSURE';
      } else {
        const refVal = fVal !== null ? fVal : pVal;
        bias = (refVal !== null && aVal > refVal) ? 'BEARISH_PRESSURE' : 'BULLISH_BOUNCE';
      }
      scenarioDesc = `Rilis aktual data tenaga kerja AS (${aVal}) telah memicu volatilitas tinggi pada DXY dan Gold.`;
    } else {
      bias = 'VOLATILE';
      scenarioDesc = 'Rilis data ketenagakerjaan tier-1 menciptakan volatilitas tinggi dan menentukan ekspektasi pelonggaran moneter The Fed.';
    }
  } else if (titleLower.includes('fomc') || titleLower.includes('rate decision') || titleLower.includes('powell')) {
    category = 'fomc';
    bias = 'FED_POLICY';
    scenarioDesc = 'Sinyal arah suku bunga dan pernyataan ketua The Fed menjadi kompas utama pergerakan Dolar AS dan imbal hasil obligasi riil.';
  } else if (titleLower.includes('pmi')) {
    category = 'pmi';
    if (isReleased) {
      const refVal = fVal !== null ? fVal : 50;
      bias = (aVal > refVal) ? 'BEARISH_PRESSURE' : 'BULLISH_BOUNCE';
      scenarioDesc = `Indeks PMI aktual (${aVal}) ${aVal > 50 ? 'mengonfirmasi ekspansi ekonomi AS yang mendukung USD' : 'mengindikasikan kontraksi ekonomi yang menopang Gold'}.`;
    } else {
      bias = (fVal !== null && pVal !== null && fVal > 50) ? 'BEARISH_PRESSURE' : 'BULLISH_BOUNCE';
      scenarioDesc = 'Indeks manufaktur & jasa mengukur ekspansi ekonomi AS yang memicu penguatan Dolar jika berada di atas 50.';
    }
  }

  return { title, category, bias, scenarioDesc, fVal, pVal, aVal, isReleased };
}

async function loadSentiment(isBackground = false) {
  const container = document.getElementById('sentiment-content');
  const statusEl = document.getElementById('sentiment-status');
  if (!container) return;

  const now = new Date();
  const timeZone = 'Asia/Makassar';

  // Format Tanggal & Jam WITA
  const dateStrWita = now.toLocaleDateString('id-ID', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const todayYMD = now.toLocaleDateString('en-CA', { timeZone });
  const timeStrWita = now.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }) + ' WITA';

  const cached = getCachedCalendar();
  const events = (cached?.events || calendarEvents || []);
  const usdEvents = events.filter(e => String(e.country || '').toUpperCase() === 'USD');
  const hasEvents = usdEvents.length > 0;

  // Filter event USD hari ini (WITA)
  const todayUsd = usdEvents.filter(e => {
    const d = new Date(e.date);
    if (!Number.isFinite(d.getTime())) return false;
    return d.toLocaleDateString('en-CA', { timeZone }) === todayYMD;
  });

  // Urutkan event berdasarkan jam
  todayUsd.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prioritaskan event High & Medium
  const importantToday = todayUsd.filter(e => {
    const imp = String(e.impact || '').toLowerCase();
    return imp === 'high' || imp === 'medium';
  });

  // Ambil event utama hari ini
  const mainEvent = importantToday[0] || todayUsd[0] || usdEvents.find(e => {
    const t = new Date(e.date).getTime();
    return Number.isFinite(t) && t >= now.getTime();
  });

  const eventAnalysis = analyzeMacroEvent(mainEvent);

  // Ambil berita lokal untuk bukti geopolitik & energi
  let newsItems = [];
  try {
    const rawNews = localStorage.getItem('amyfx.assistant.news.v1');
    if (rawNews) {
      const parsedNews = JSON.parse(rawNews);
      if (Array.isArray(parsedNews?.items)) {
        newsItems = parsedNews.items;
      }
    }
  } catch (_) {}

  const newsTextCombined = newsItems.map(n => String(n.text || n.textOriginal || '')).join(' ').toLowerCase();

  const geopoliticsItems = newsItems.filter(n => {
    const t = (n.text || n.textOriginal || '').toLowerCase();
    return t.includes('perang') || t.includes('war') || t.includes('geopolit') ||
           t.includes('serangan') || t.includes('attack') || t.includes('israel') ||
           t.includes('iran') || t.includes('russia') || t.includes('ukraina') ||
           t.includes('timur tengah') || t.includes('middle east');
  });
  const hasGeopolitics = geopoliticsItems.length > 0;

  const deescalationItems = newsItems.filter(n => {
    const t = (n.text || n.textOriginal || '').toLowerCase();
    return t.includes('gencatan senjata') || t.includes('ceasefire') || t.includes('damai') ||
           t.includes('peace') || t.includes('deescalat') || t.includes('de-eskalasi');
  });
  const isDeescalation = deescalationItems.length > 0;

  const energyItems = newsItems.filter(n => {
    const t = (n.text || n.textOriginal || '').toLowerCase();
    return t.includes('minyak') || t.includes('oil') || t.includes('brent') ||
           t.includes('opec') || t.includes('energi') || t.includes('energy');
  });
  const hasEnergyRisk = energyItems.length > 0;

  // Cache freshness check (Bug 3)
  const cacheAgeMs = cached?.savedAt ? Date.now() - cached.savedAt : 0;
  const isStaleCache = cacheAgeMs > 24 * 60 * 60 * 1000;

  // Header Sync Badge (Bug 1 & 3)
  let syncBadgeHtml = '';
  if (!hasEvents) {
    syncBadgeHtml = '<div class="briefing-sync-badge sync-disconnected">🔴 Kalender Belum Terhubung</div>';
  } else if (isCalendarLive) {
    syncBadgeHtml = '<div class="briefing-sync-badge sync-live">🟢 Kalender Terhubung (Live)</div>';
  } else if (isStaleCache) {
    syncBadgeHtml = '<div class="briefing-sync-badge sync-cache">🟠 Kalender Terhubung (Cache Usang >24 Jam)</div>';
  } else {
    syncBadgeHtml = '<div class="briefing-sync-badge sync-cache">🟡 Kalender Terhubung (Cache Lokal)</div>';
  }

  // Sintesis Status Scorecard & Kompas
  let usdScore = '🟢 Cenderung Kuat';
  let yieldScore = '🟢 Menjadi Tekanan untuk Emas';
  let riskScore = '⚖️ Campuran — Pasar Menanti Data';
  let goldBias = '↘️ Netral Cenderung Bearish (Jangka Pendek)';
  let goldBiasClass = 'bearish';
  let conclusionBias = '⚠️ WAIT / SELL ON RALLY';
  let horizonStr = 'Sesi Berjalan';
  let conclusionGuide = '';
  let dom1Title = '';
  let dom1Reason = '';
  let dom2Title = '';
  let dom2Reason = '';
  let dom3Title = 'Imbal Hasil US Treasury 10-Year';
  let dom3Reason = 'Korelasi negatif yield obligasi terhadap daya tarik emas non-yielding tetap menjadi faktor penentu arus modal institusi.';
  let mainScenario = '';
  let confirmCondition = '';
  let invalidationCondition = '';
  let mappingBridgeText = '';

  const isReleased = Boolean(eventAnalysis?.isReleased);

  if (!hasEvents) {
    // Baseline Bug 1: No data should NOT give SELL ON RALLY
    usdScore = '⚪ Data Belum Tersedia';
    yieldScore = '⚪ Menunggu Sinyal Pasar';
    riskScore = '⚪ Data Netral / Tidak Ada Rilis';
    goldBias = '⚪ Belum Cukup Data Fundamental Baru';
    goldBiasClass = 'insufficient';
    conclusionBias = '⚪ BELUM CUKUP DATA';
    horizonStr = 'Menunggu Jadwal Katalis Baru';
    conclusionGuide = 'Belum ada rilis data ekonomi AS atau data kalender belum tersinkronisasi. Analisis fundamental memerlukan data makro terverifikasi. Untuk sesi ini, fokuskan keputusan transaksi pada struktur teknikal Dealing Range dan konfirmasi Price Action di tab Mapping.';
    dom1Title = 'Ketiadaan Katalis Makro AS Terjadwal';
    dom1Reason = 'Belum ada rilis data ekonomi atau jadwal kalender belum tersinkronisasi.';
    dom2Title = 'Struktur Likuiditas & Dealing Range';
    dom2Reason = 'Pergerakan harga saat ini sepenuhnya dipandu oleh sapuan likuiditas teknis di chart.';
    mainScenario = 'Disiplin menunggu konfirmasi Price Action ICT murni di zona PD Array Mapping.';
    confirmCondition = 'Sinyal teknikal MSS valid di Dealing Range M5/M15.';
    invalidationCondition = 'Munculnya breaking news atau kejutan data fundamental baru.';
    mappingBridgeText = 'Tanpa data ekonomi tier-1 terjadwal, jangan paksakan bias arah fundamental. Tunggu konfirmasi sapuan likuiditas (BSL/SSL) dan entri di Diskon/Premium PD Array pada tab Mapping.';
  } else if (eventAnalysis?.bias === 'BULLISH_BOUNCE') {
    usdScore = isReleased ? '🔴 Melemah Pasca Rilis' : '🔴 Cenderung Melemah';
    yieldScore = '🔴 Mereda — Memberi Ruang Reli Emas';
    goldBias = '↗️ Netral Cenderung Bullish';
    goldBiasClass = 'bullish';
    conclusionBias = '🟢 BUY ON DIPS';
    horizonStr = isReleased ? 'Sesi Berjalan (Pasca Rilis Data)' : 'Menjelang Rilis Katalis Sesi Ini';
    dom1Title = isReleased ? `Data Aktual: ${mainEvent.title}` : `Konsensus Proyeksi: ${mainEvent.title}`;
    dom1Reason = eventAnalysis.scenarioDesc || 'Pendinginan ekonomi AS menekan Dolar dan membuka peluang penguatan Gold.';
    mainScenario = isReleased
      ? 'Mencari entri Buy on Dips pasca data dovish sesudah likuiditas bawah (SSL) tersapu.'
      : 'Mencari peluang Buy on Dips di zona Diskon PD Array jika konsensus data terkonfirmasi.';
    confirmCondition = isReleased
      ? 'DXY menembus support dan yield 10-Year bergerak turun.'
      : `Actual rilis ${mainEvent.forecast ? 'lebih dingin/lemah dari ' + mainEvent.forecast : 'melemah'}.`;
    invalidationCondition = 'Harga gagal bertahan di atas demand kunci atau data lanjutan berbalik kuat.';
    conclusionGuide = isReleased
      ? `Data aktual ${mainEvent.title} (${mainEvent.actual}) mengonfirmasi pelemahan DXY. Cari konfirmasi Buy di zona Diskon PD Array atau demand support sesudah likuiditas bawah diambil.`
      : `Konsensus proyeksi ${mainEvent.title} mengindikasikan pendinginan data AS. Cari konfirmasi Buy di zona Diskon PD Array sesudah likuiditas bawah diambil.`;
    mappingBridgeText = 'Cari konfirmasi entri BUY di area Diskon PD Array (FVG/OB Bullish) sesudah Sell-Side Liquidity (SSL) tersapu.';
  } else if (eventAnalysis?.bias === 'BEARISH_PRESSURE') {
    usdScore = isReleased ? '🟢 Menguat Pasca Rilis' : '🟢 Cenderung Kuat';
    yieldScore = '🟢 Menjadi Tekanan untuk Emas';
    goldBias = '↘️ Netral Cenderung Bearish';
    goldBiasClass = 'bearish';
    conclusionBias = '⚠️ WAIT / SELL ON RALLY';
    horizonStr = isReleased ? 'Sesi Berjalan (Pasca Rilis Data)' : 'Menjelang Rilis Katalis Sesi Ini';
    dom1Title = isReleased ? `Data Aktual: ${mainEvent.title}` : `Konsensus Proyeksi: ${mainEvent.title}`;
    dom1Reason = eventAnalysis.scenarioDesc || 'Kekuatan ekonomi dan Dolar AS membatasi potensi reli harga emas.';
    mainScenario = 'Mencari setup SELL ON RALLY di zona Premium PD Array / Supply sesudah pullback atau sapuan likuiditas atas.';
    confirmCondition = isReleased
      ? 'DXY menembus resistance dan yield US 10-Year naik kuat.'
      : `Actual rilis ${mainEvent.forecast ? 'lebih panas/kuat dari ' + mainEvent.forecast : 'menguat'}.`;
    invalidationCondition = 'Sentimen geopolitik eskalatif mendadak atau kejutan data dovish yang menyapu zona supply.';
    conclusionGuide = (eventAnalysis?.category === 'claims' && !isReleased && eventAnalysis.fVal !== null && eventAnalysis.pVal !== null && eventAnalysis.fVal > eventAnalysis.pVal)
      ? `Bias harian tetap waspada Sell on Rally di zona supply, namun jangan mengejar sell di harga bawah sebelum rilis data jam ${new Date(mainEvent.date).toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' })} WITA karena ada potensi pantulan teknikal jika klaim naik ke ${escapeHtml(mainEvent.forecast)}.`
      : `Secara fundamental, mencari setup SELL ON RALLY di zona resistance/supply lebih masuk akal hari ini. Namun, hindari mengejar posisi sell di harga bawah (diskon) sebelum terjadi pullback atau sapuan likuiditas atas.`;
    mappingBridgeText = 'Fokus Sell on Rally di zona Premium PD Array (FVG/OB Bearish) sesudah Buy-Side Liquidity (BSL) tersapu. Hindari mengejar sell di harga diskon.';
  } else {
    usdScore = '⚖️ Konsolidasi / Campuran';
    yieldScore = '⚖️ Bergerak Terbatas';
    goldBias = '⚖️ Campuran / Menanti Katalis';
    goldBiasClass = 'mixed';
    conclusionBias = '⚖️ WAIT / NETRAL';
    horizonStr = 'Sesi Berjalan';
    dom1Title = mainEvent ? mainEvent.title : 'Dinamika Dolar AS & Suku Bunga';
    dom1Reason = eventAnalysis?.scenarioDesc || 'Pasar menanti kejelasan rilis data ekonomi untuk menentukan arah tren berikutnya.';
    mainScenario = 'Disiplin menunggu rilis data dan reaksi konfirmasi di Dealing Range.';
    confirmCondition = 'Breakout struktur Dealing Range dengan volume dan momentum terkonfirmasi.';
    invalidationCondition = 'Fakeout likuiditas dua arah (whipsaw) menjelang rilis.';
    conclusionGuide = 'Faktor penggerak fundamental berada dalam kondisi berimbang. Tunggu kejelasan arah pasar dari reaksi rilis berita atau konfirmasi struktur Price Action di Mapping.';
    mappingBridgeText = 'Pasar dalam fase konsolidasi/menanti katalis. Utamakan skenario range-bound atau tunggu sapuan likuiditas ekstrem sebelum entri.';
  }

  // Dominant factor 2 (Safe Haven / Geopolitics)
  if (hasGeopolitics && !isDeescalation) {
    dom2Title = 'Tensi Geopolitik Global (Safe Haven Aktif)';
    dom2Reason = 'Konflik dan tensi regional menopang minat lindung nilai institusi, bertindak sebagai bantalan penahan penurunan emas.';
  } else if (isDeescalation) {
    dom2Title = 'Peredaan Risiko Geopolitik (De-eskalasi)';
    dom2Reason = 'Kabar gencatan senjata atau dialog damai meredakan premi risiko safe haven pada emas.';
  } else {
    dom2Title = 'Permintaan Safe Haven & Bank Sentral';
    dom2Reason = 'Pembelian fisik jangka panjang oleh bank sentral menjadi fondasi penopang struktural.';
  }

  // Status line (Bug 1 & 3)
  if (statusEl) {
    if (!hasEvents) {
      statusEl.textContent = `Pembaruan: ${timeStrWita} • Data Kalender Belum Tersedia • Mode Offline`;
    } else if (isCalendarLive) {
      statusEl.textContent = `Pembaruan: ${timeStrWita} • Kalender Tersinkron: ${usdEvents.length} Data USD • Live Engine`;
    } else if (isStaleCache) {
      statusEl.textContent = `Pembaruan: ${timeStrWita} • Kalender: ${usdEvents.length} Data USD (Cache Usang >24 Jam)`;
    } else {
      statusEl.textContent = `Pembaruan: ${timeStrWita} • Kalender: ${usdEvents.length} Data USD (Cache Lokal)`;
    }
  }

  // Bukti Pendukung vs Bertentangan
  const supportItems = [];
  const opposeItems = [];

  if (!hasEvents) {
    supportItems.push('Belum ada data kalender ekonomi yang tersinkronisasi.');
    opposeItems.push('Belum ada data fundamental pembatal yang terverifikasi.');
  } else if (eventAnalysis?.bias === 'BEARISH_PRESSURE') {
    supportItems.push(`Ekspektasi/Reaksi data AS (${escapeHtml(mainEvent?.title || 'Data Makro')}): Menopang kekuatan DXY & yield.`);
    supportItems.push('Kekuatan yield US Treasury mengurangi daya tarik emas non-yielding.');
    if (mainEvent) {
      supportItems.push(`<button class="intel-evidence-link" onclick="openEvidenceCalendar()">📅 Bukti Kalender: ${escapeHtml(mainEvent.title)} (F: ${escapeHtml(mainEvent.forecast || '—')}, P: ${escapeHtml(mainEvent.previous || '—')})</button>`);
    }
    if (hasGeopolitics && !isDeescalation) {
      opposeItems.push('Tensi geopolitik aktif memberikan bantalan safe haven penahan kejatuhan harga.');
      const topGeo = geopoliticsItems[0];
      if (topGeo) {
        opposeItems.push(`<button class="intel-evidence-link" onclick="openEvidenceNews('${escapeHtml(newsId(topGeo))}')">📰 Bukti Berita: ${escapeHtml(truncate(topGeo.text || topGeo.textOriginal, 45))} [${escapeHtml(formatTime(topGeo.time))}]</button>`);
      }
    } else {
      opposeItems.push('Akumulasi beli bank sentral dunia menjaga level harga struktural jangka panjang.');
    }
  } else if (eventAnalysis?.bias === 'BULLISH_BOUNCE') {
    supportItems.push(`Ekspektasi/Reaksi data AS (${escapeHtml(mainEvent?.title || 'Data Makro')}): Sinyal pendinginan ekonomi AS melemahkan DXY.`);
    if (mainEvent) {
      supportItems.push(`<button class="intel-evidence-link" onclick="openEvidenceCalendar()">📅 Bukti Kalender: ${escapeHtml(mainEvent.title)} (F: ${escapeHtml(mainEvent.forecast || '—')}, P: ${escapeHtml(mainEvent.previous || '—')})</button>`);
    }
    if (hasGeopolitics) {
      supportItems.push('Dukungan safe haven geopolitik memperkuat momentum kenaikan emas.');
    }
    opposeItems.push('Potensi Dolar AS menguat kembali jika rilis lanjutan melampaui ekspektasi.');
    opposeItems.push('Tingkat suku bunga The Fed saat ini masih berada di zona restriktif.');
  } else {
    supportItems.push('Faktor teknis dan arus safe haven jangka panjang mendukung harga.');
    opposeItems.push('Ekspektasi Dolar AS yang masih resilien membatasi ruang kenaikan agresif.');
    if (mainEvent) {
      supportItems.push(`<button class="intel-evidence-link" onclick="openEvidenceCalendar()">📅 Kalender Terdekat: ${escapeHtml(mainEvent.title)}</button>`);
    }
  }

  const supportListHtml = supportItems.map(item => `<li>${item}</li>`).join('');
  const opposeListHtml = opposeItems.map(item => `<li>${item}</li>`).join('');

  // Generate Event List HTML
  let eventListHtml = '';
  if (importantToday.length > 0) {
    eventListHtml = importantToday.map(ev => {
      const evDate = new Date(ev.date);
      const timeStr = Number.isFinite(evDate.getTime())
        ? evDate.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }) + ' WITA'
        : 'Sesi NY';
      const imp = String(ev.impact || '').toLowerCase();
      const impLabel = imp === 'high' ? 'High Impact' : 'Medium Impact';
      const impClass = imp === 'high' ? 'tag-high' : 'tag-med';
      const hasActual = Boolean(ev.actual && ev.actual !== '--' && ev.actual !== '—');

      return `
        <div class="briefing-event-item">
          <div class="event-item-top">
            <span class="event-item-time">🇺🇸 ⏰ ${escapeHtml(timeStr)}</span>
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
      : 'Sesi Mendatang';
    eventListHtml = `
      <div class="briefing-event-item">
        <div class="event-item-top">
          <span class="event-item-time">🇺🇸 ⏰ ${escapeHtml(timeStr)}</span>
          <span class="event-item-tag tag-med">Event Terdekat</span>
        </div>
        <div class="event-item-title">${escapeHtml(mainEvent.title)}</div>
        <div class="event-item-numbers">
          <span>Forecast: <strong>${escapeHtml(mainEvent.forecast || '—')}</strong></span>
          <span>Previous: <strong>${escapeHtml(mainEvent.previous || '—')}</strong></span>
          <span>Actual: <strong>${escapeHtml(mainEvent.actual || '—')}</strong></span>
        </div>
      </div>
    `;
  } else {
    eventListHtml = `
      <div class="briefing-empty-events">
        ℹ️ Tidak ada rilis data tier-1 AS terjadwal malam ini. Pergerakan Gold murni dipandu oleh teknikal dan dinamika likuiditas pasar.
      </div>
    `;
  }

  // Skenario reaksi dinamis untuk event utama
  let scenarioReactionHtml = '';
  if (mainEvent && (mainEvent.forecast || mainEvent.previous)) {
    const fStr = escapeHtml(mainEvent.forecast || 'Forecast');
    const pStr = escapeHtml(mainEvent.previous || 'Previous');
    const isClaims = String(mainEvent.title || '').toLowerCase().includes('claims');

    if (isClaims) {
      scenarioReactionHtml = `
        <div class="reaction-guide-box">
          <div class="reaction-title">📊 Skenario Reaksi Gold Terhadap ${escapeHtml(mainEvent.title)}:</div>
          <ul class="briefing-list">
            <li><strong>Jika Actual &gt; ${fStr} (Klaim Naik / Buruk):</strong> USD melemah ➔ Gold berpeluang memantul naik (Pullback / Reli).</li>
            <li><strong>Jika Actual &lt; ${pStr} (Klaim Turun / Bagus):</strong> USD semakin perkasa ➔ Tekanan jual ke Gold berlanjut ke bawah.</li>
          </ul>
        </div>
      `;
    } else {
      scenarioReactionHtml = `
        <div class="reaction-guide-box">
          <div class="reaction-title">📊 Skenario Reaksi Gold Terhadap ${escapeHtml(mainEvent.title)}:</div>
          <ul class="briefing-list">
            <li><strong>Jika Actual &gt; ${fStr} (Data AS Panas):</strong> DXY &amp; Yield menguat ➔ Tekanan turun (*Bearish pressure*) untuk Gold.</li>
            <li><strong>Jika Actual &lt; ${fStr} (Data AS Dingin):</strong> DXY melemah ➔ Memberi katalis dorongan naik (*Bullish boost*) untuk Gold.</li>
          </ul>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <div class="fundamental-briefing-wrap">
      <!-- Header Briefing -->
      <div class="briefing-main-header">
        <div>
          <span class="briefing-kicker">KOMPAS FUNDAMENTAL XAU/USD</span>
          <h2 class="briefing-headline">Fundamental XAU/USD (Gold vs USD) Hari Ini — ${escapeHtml(dateStrWita)}</h2>
          <div class="kompas-horizon-pill">Horizon Analisis: <strong>${escapeHtml(horizonStr)}</strong></div>
        </div>
        ${syncBadgeHtml}
      </div>

      <!-- 1. Faktor Utama: USD & The Fed -->
      <article class="briefing-card card-primary">
        <div class="card-head">
          <div class="card-title-wrap">
            <span class="card-step-num">1</span>
            <h3 class="card-title">Faktor Utama: USD &amp; The Fed</h3>
          </div>
          <span class="bias-pill ${goldBiasClass}">${escapeHtml(goldBias)}</span>
        </div>
        <p class="card-desc">
          ${hasEvents
            ? (mainEvent && (mainEvent.forecast || mainEvent.previous)
                ? `Pasar saat ini mencermati katalis <strong>${escapeHtml(mainEvent.title)}</strong> (Forecast: ${escapeHtml(mainEvent.forecast || '—')} vs Previous: ${escapeHtml(mainEvent.previous || '—')}). Kekuatan Dolar AS dan yield obligasi menjadi penentu utama minat beli emas non-yielding.`
                : 'Saat ini emas berada dalam pantauan kebijakan moneter AS dan arah pergerakan indeks Dolar AS.')
            : 'Belum ada data kalender ekonomi AS terjadwal. Pergerakan Dolar dan emas bergerak dalam koridor teknikal murni.'}
        </p>
        <div class="dominant-factors-box">
          <div class="dominant-factors-title">🏆 3 Faktor Paling Dominan Penggerak Emas:</div>
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
      </article>

      <!-- 2. Faktor Safe Haven (Penahan Penurunan) -->
      <article class="briefing-card">
        <div class="card-head">
          <div class="card-title-wrap">
            <span class="card-step-num">2</span>
            <h3 class="card-title">Faktor Safe Haven (Penahan Penurunan)</h3>
          </div>
          <span class="bias-pill neutral">Bantalan Dukungan</span>
        </div>
        <p class="card-desc">
          Meskipun tertekan oleh Dolar, emas tetap memiliki bantalan penahan penurunan yang mencegah kejatuhan harga tanpa henti:
        </p>
        <ul class="briefing-list">
          <li><strong>Ketidakpastian Geopolitik:</strong> ${hasGeopolitics ? 'Tensi geopolitik global aktif menjaga minat lindung nilai institusi.' : 'Konflik global dan dinamika regional menahan penurunan drastis emas.'}</li>
          <li><strong>Risiko Inflasi Energi:</strong> ${hasEnergyRisk ? 'Harga energi dan komoditas minyak mentah memicu kekhawatiran inflasi jangka menengah.' : 'Potensi lonjakan biaya energi sewaktu-waktu dapat memantik inflasi kembali.'}</li>
          <li><strong>Permintaan Aset Aman:</strong> Pembelian emas fisik oleh bank-bank sentral dunia tetap menjadi fondasi jangka panjang.</li>
        </ul>
        <div class="kompas-evidence-cols">
          <div class="kompas-evidence-col col-support">
            <div class="evidence-col-title">✅ Bukti Pendukung Bias</div>
            <ul class="evidence-list">
              ${supportListHtml}
            </ul>
          </div>
          <div class="kompas-evidence-col col-oppose">
            <div class="evidence-col-title">⚠️ Bukti Bertentangan / Risiko</div>
            <ul class="evidence-list">
              ${opposeListHtml}
            </ul>
          </div>
        </div>
      </article>

      <!-- 3. Sentimen Pasar Hari Ini -->
      <article class="briefing-card">
        <div class="card-head">
          <div class="card-title-wrap">
            <span class="card-step-num">3</span>
            <h3 class="card-title">Sentimen Pasar Hari Ini</h3>
          </div>
          <span class="bias-pill mixed">Scorecard Harian</span>
        </div>
        <div class="scorecard-grid">
          <div class="scorecard-item">
            <span class="score-label">💵 USD</span>
            <span class="score-value">${escapeHtml(usdScore)}</span>
          </div>
          <div class="scorecard-item">
            <span class="score-label">📈 Yield US Treasury</span>
            <span class="score-value">${escapeHtml(yieldScore)}</span>
          </div>
          <div class="scorecard-item">
            <span class="score-label">🌐 Risk Sentiment</span>
            <span class="score-value">${escapeHtml(riskScore)}</span>
          </div>
          <div class="scorecard-item">
            <span class="score-label">🧭 Gold Bias Fundamental</span>
            <span class="score-value">${escapeHtml(goldBias)}</span>
          </div>
        </div>
      </article>

      <!-- 4. News yang Perlu Diperhatikan -->
      <article class="briefing-card">
        <div class="card-head">
          <div class="card-title-wrap">
            <span class="card-step-num">4</span>
            <h3 class="card-title">News yang Perlu Diperhatikan (Sesi New York &amp; London)</h3>
          </div>
          <span class="bias-pill highlight">Jadwal Kalender Terhubung</span>
        </div>
        <p class="card-desc">
          Rilis data ekonomi AS terjadwal dari kalender ekonomi yang menjadi penggerak volatilitas malam ini:
        </p>
        <div class="briefing-events-container">
          ${eventListHtml}
        </div>
        ${scenarioReactionHtml}
        <div class="card-watch-footer">
          ⚠️ <strong>Pantau Khusus:</strong> Pernyataan pejabat The Fed, pergerakan indeks DXY, dan arah yield US 10-Year.
        </div>
      </article>

      <!-- 5. Kesimpulan Fundamental -->
      <article class="briefing-card card-conclusion">
        <div class="card-head">
          <div class="card-title-wrap">
            <span class="card-step-num">5</span>
            <h3 class="card-title">Kesimpulan Fundamental</h3>
          </div>
          <span class="conclusion-badge">${escapeHtml(conclusionBias)}</span>
        </div>
        <div class="conclusion-content">
          <p class="conclusion-guide">
            ${escapeHtml(conclusionGuide)}
          </p>
          <div class="scenario-box">
            <div class="scenario-box-title">🧭 Skenario Fundamental Terstruktur:</div>
            <ul class="briefing-list">
              <li><strong>Skenario Utama:</strong> ${escapeHtml(mainScenario)}</li>
              <li><strong>Kondisi Penguat:</strong> ${escapeHtml(confirmCondition)}</li>
              <li><strong>Kondisi Pembatalan Bias (Invalidasi):</strong> ${escapeHtml(invalidationCondition)}</li>
            </ul>
          </div>
          <div class="scenario-box" style="border-left: 3px solid var(--gold); margin-top: 8px;">
            <div class="scenario-box-title">🎯 Jembatan Eksekusi ke Chart Mapping:</div>
            <p style="font-size: 11.5px; line-height: 1.45; color: var(--text); margin: 0;">
              ${escapeHtml(mappingBridgeText)}
            </p>
          </div>
        </div>
      </article>
    </div>
  `;
}

function setupNewsInteractions() {
  document.getElementById('news-list')?.addEventListener('click', event => {
    const item = event.target.closest('.news-item');
    if (!item) return;
    item.classList.toggle('expanded');
    item.classList.remove('news-focus');
  });
  document.getElementById('news-list')?.addEventListener('keydown', event => {
    if (event.target.closest('a')) return;
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

// ─── Client Translation Cache & Engine ───────────────────
const TRANSLATION_CACHE_KEY = 'amy_news_tr_cache_v1';

function getTranslationCache() {
  try {
    return JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY) || '{}');
  } catch (_) {
    return {};
  }
}

function saveTranslationToCache(id, translatedText) {
  if (!id || !translatedText) return;
  // Bug 10: Never save truncated translations to permanent cache
  if (translatedText.endsWith('…') || translatedText.endsWith('...')) return;
  try {
    const cache = getTranslationCache();
    cache[String(id)] = translatedText;
    const keys = Object.keys(cache);
    if (keys.length > 300) {
      keys.slice(0, keys.length - 200).forEach(k => delete cache[k]);
    }
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch (_) {}
}

function isTextEnglish(text) {
  if (!text || typeof text !== 'string') return false;
  return /\b(the|and|to|of|in|for|with|on|at|by|from|about|against|between|into|through|after|before|above|below|is|was|are|were|been|has|had|have|will|would|could|should|says|said|told|warns|warned|urged|declares|report|reported|sources?)\b/i.test(text);
}

function needsClientTranslation(item) {
  if (!item) return false;
  const original = String(item.textOriginal || '').trim();
  const text = String(item.text || '').trim();
  if (!text) return true;
  if (text.includes('Terjemahan Bahasa Indonesia belum tersedia')) return true;
  if (original && text === original) return true;
  return isTextEnglish(text);
}

function splitIntoTranslationChunks(text, maxLen = 450) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let splitIdx = remaining.lastIndexOf('. ', maxLen);
    if (splitIdx === -1 || splitIdx < maxLen / 2) {
      splitIdx = remaining.lastIndexOf(' ', maxLen);
    }
    if (splitIdx === -1) {
      splitIdx = maxLen;
    } else {
      splitIdx += 1;
    }
    chunks.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }
  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

async function translateTextClient(text) {
  const cleanText = String(text || '').trim();
  if (!cleanText) return null;

  // Method 1: Google Translate web endpoint (works directly from user mobile/residential IP)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(cleanText)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.[0])) {
        const translated = data[0].map(chunk => chunk?.[0] || '').join('').trim();
        if (translated && (translated !== cleanText || data[2] === 'id')) {
          return translated;
        }
      }
    }
  } catch (_) {}

  // Method 2: MyMemory Translation API fallback with sentence chunking (Bug 10: no truncation)
  try {
    const chunks = splitIntoTranslationChunks(cleanText, 450);
    const translatedChunks = [];
    let allSucceeded = true;

    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|id`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const tr = data?.responseData?.translatedText?.trim();
        if (tr && !tr.toUpperCase().includes('MYMEMORY WARNING') && tr !== chunk) {
          translatedChunks.push(tr);
          continue;
        }
      }
      allSucceeded = false;
      break;
    }

    if (allSucceeded && translatedChunks.length === chunks.length) {
      return translatedChunks.join(' ');
    }
  } catch (_) {}

  return null;
}

function applyCachedTranslations(newsList) {
  const cache = getTranslationCache();
  for (const item of newsList) {
    const id = newsId(item);
    if (cache[id]) {
      item.text = cache[id];
    }
  }
}

async function autoTranslateNewsItems(sortedNews, sequence = 0) {
  const pending = sortedNews.filter(item => needsClientTranslation(item));
  if (!pending.length) return;

  for (let i = 0; i < pending.length; i += 2) {
    // Bug 9: Stale translation sequence guard
    if (sequence && sequence !== newsFetchSequence) return;
    const batch = pending.slice(i, i + 2);
    await Promise.allSettled(batch.map(async item => {
      const id = newsId(item);
      const sourceText = item.textOriginal || item.text;
      const translated = await translateTextClient(sourceText);
      if (translated) {
        item.text = translated;
        saveTranslationToCache(id, translated);
        const card = [...document.querySelectorAll('.news-item')].find(el => el.dataset.newsId === String(id));
        if (card) {
          const textEl = card.querySelector('.news-text');
          if (textEl) textEl.textContent = translated;
        }
      }
    }));
  }
}

// ─── News Loader ─────────────────────────────────────────
async function loadNews(silent = false) {
  const currentSequence = ++newsFetchSequence;
  const status = document.getElementById('news-status');
  const list = document.getElementById('news-list');
  if (!silent && (!list || !list.children.length)) status.textContent = 'Memuat berita...';

  // Preserve expanded news card state and scroll position across refresh
  const currentExpandedIds = new Set(
    [...document.querySelectorAll('.news-item.expanded')].map(el => el.dataset.newsId).filter(Boolean)
  );
  const prevScrollTop = (currentTab === 'news') ? (window.scrollY || document.documentElement.scrollTop) : 0;

  // Instant render from local cache if DOM is currently empty
  if (list && !list.children.length) {
    try {
      const cachedRaw = localStorage.getItem('amyfx.assistant.news.v1');
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
          renderNews(cached.items, currentExpandedIds);
          if (status) status.textContent = `${cached.items.length} berita (tersimpan) • Sinkronisasi latar belakang…`;
        }
      }
    } catch (_) {}
  }

  try {
    const minuteKey = Math.floor(Date.now() / 60000);
    // Bug 7: Increase limit to 50 when deep link pendingNewsId is present
    const fetchLimit = pendingNewsId ? 50 : 20;
    const res = await fetch(`${API_BASE}/news?limit=${fetchLimit}&fresh=${minuteKey}`, {
      signal: beginRequest('news'),
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    if (currentSequence !== newsFetchSequence) return;

    if (!data.news || data.news.length === 0) {
      if (list && list.children.length > 0) {
        status.textContent = 'Tidak ada update berita baru';
      } else {
        status.textContent = 'Tidak ada berita gold saat ini';
        list.innerHTML = '<div class="empty-state">Belum ada breaking news untuk XAU/USD.</div>';
      }
      return;
    }

    const sortedNews = data.news.map(prepareNewsItem).sort((a, b) => {
      const byId = Number(b.id || 0) - Number(a.id || 0);
      return byId || new Date(b.time || 0) - new Date(a.time || 0);
    });

    applyCachedTranslations(sortedNews);

    const latestNews = sortedNews[0];
    if (latestNews) {
      const currentNewsId = newsId(latestNews);
      const lastNewsId = localStorage.getItem('amy_last_news_id');

      // Bug 8: Only trigger notification if news is relevant to Gold
      if (lastNewsId && lastNewsId !== currentNewsId && isNewsRelevantForGold(latestNews)) {
        if (needsClientTranslation(latestNews)) {
          const sourceText = latestNews.textOriginal || latestNews.text;
          const tr = await translateTextClient(sourceText);
          if (tr) {
            latestNews.text = tr;
            saveTranslationToCache(currentNewsId, tr);
          }
        }
        const title = 'Breaking News XAU/USD';
        const msg = latestNews.text || 'Berita baru telah tiba.';
        if (window.Android?.showNotificationWithUrl) {
          window.Android.showNotificationWithUrl(title, msg, newsTargetUrl(currentNewsId));
        } else if (typeof Notification !== 'undefined') {
          Notification.requestPermission().then(p => {
            if (p !== 'granted') return;
            const notification = new Notification(title, { body: msg, tag: `amy-news-${currentNewsId}` });
            notification.onclick = () => {
              window.focus();
              location.hash = `news=${encodeURIComponent(currentNewsId)}`;
            };
          });
        }
      }
      localStorage.setItem('amy_last_news_id', currentNewsId);
    }

    status.textContent = `${data.news.length} berita relevan • ${formatTime(data.updated)}`;
    panelLoadedAt.news = Date.now();
    window.AmyFXIntel?.write('news', { updated: data.updated, capturedAt: data.updated, source: 'VERCEL_NEWS', items: sortedNews.slice(0, 10) });

    if (currentSequence === newsFetchSequence) {
      try { localStorage.setItem('amyfx.assistant.news.v1', JSON.stringify({ updated: data.updated, items: sortedNews.slice(0, 20) })); } catch {}
      renderNews(sortedNews, currentExpandedIds);
      if (currentTab === 'news' && prevScrollTop > 0) {
        window.scrollTo({ top: prevScrollTop, behavior: 'instant' });
      }
      autoTranslateNewsItems(sortedNews, currentSequence).then(() => {
        if (currentSequence === newsFetchSequence) {
          try { localStorage.setItem('amyfx.assistant.news.v1', JSON.stringify({ updated: data.updated, items: sortedNews.slice(0, 20) })); } catch {}
        }
      });
    }

    if (pendingNewsId) {
      activateTab('news');
      if (!focusNewsItem(pendingNewsId)) {
        newsRouteRetries += 1;
        if (newsRouteRetries <= 3) {
          status.textContent = 'Berita dari notifikasi sedang disinkronkan...';
          setTimeout(() => loadNews(true), 1500);
        } else {
          status.textContent = 'Berita tujuan belum tersedia pada feed terbaru';
          pendingNewsId = '';
          newsRouteRetries = 0;
        }
      }
    }
  } catch (e) {
    if (e.name === 'AbortError') return;
    // Bug 5: Preserve cached news DOM on failed request
    if (list && list.children.length > 0) {
      status.textContent = 'Gagal sinkronisasi feed baru • Menampilkan berita tersimpan';
    } else {
      status.textContent = 'Gagal memuat berita';
      list.innerHTML = '<div class="empty-state">Gagal terhubung. Coba lagi nanti.</div>';
    }
  }
}

function renderNews(sortedNews, expandedIds = new Set()) {
  const list = document.getElementById('news-list');
  if (!list) return;
  list.innerHTML = sortedNews.map((item, i) => {
    const id = newsId(item);
    const isExpanded = expandedIds.has(String(id));
    return `
      <article class="news-item ${isExpanded ? 'expanded' : ''}" data-news-id="${escapeHtml(id)}" style="animation-delay:${i * 0.05}s" tabindex="0">
        <div class="news-time">${formatTime(item.time)}</div>
        <div class="news-text">${escapeHtml(item.text)}</div>
      </article>
    `;
  }).join('');
}

// ─── Heatmap Loader ──────────────────────────────────────
async function loadHeatmap(silent = false) {
  if (window.AmyICTIntel) return window.AmyICTIntel.refresh();
  const status = document.getElementById('heatmap-status');
  if (!silent) status.textContent = 'Menghitung heatmap...';

  try {
    const res = await fetch(`${API_BASE}/heatmap?interval=15min&outputsize=200`, { signal: beginRequest('heatmap') });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    if (!data.zones || data.zones.length === 0) {
      status.textContent = 'Data belum cukup untuk heatmap';
      clearHeatmapState();
      return;
    }
    if (!payloadIsFresh(data.updated)) throw new Error('Heatmap yang diterima sudah usang');

    document.getElementById('heatmap-price').textContent =
      `XAU/USD ${data.currentPrice?.toFixed(2) || '--'}`;
    status.textContent = `${data.zones.length} zona likuiditas • ${formatTime(data.updated)}`;
    panelLoadedAt.heatmap = Date.now();
    window.AmyFXIntel?.write('heatmap', { updated: data.updated, capturedAt: data.updated, source: 'SUPABASE_EDGE', currentPrice: data.currentPrice, zones: data.zones });
    renderHeatmap(data.zones, data.currentPrice);
  } catch (e) {
    if (e.name === 'AbortError') return;
    clearHeatmapState();
    status.textContent = 'Gagal memuat heatmap';
  }
}

function renderHeatmap(zones, currentPrice) {
  const canvas = document.getElementById('heatmap-canvas');
  if (!zones.length) return;

  const sortedZones = [...zones].sort((a,b) => b.price - a.price);
  const maxActivity = Math.max(...sortedZones.map(z => z.totalActivity), 1);

  canvas.style.display = 'flex';
  canvas.style.flexDirection = 'column';
  canvas.style.gap = '0';
  canvas.style.padding = '8px 0';
  canvas.style.overflowY = 'auto';

  function genBlocks(count, max, isResist) {
    if(!count || count === 0) return '';
    const maxBlocks = 20;
    const blocks = Math.ceil((count / max) * maxBlocks);
    const typeClass = isResist ? 'block-resist' : 'block-support';
    return Array(blocks).fill(`<div class="heat-block ${typeClass}"></div>`).join('');
  }

  canvas.innerHTML = sortedZones.map(z => {
    const isCurrent = z.isCurrent;
    return `
      <div class="ladder-row ${isCurrent ? 'ladder-now' : ''}">
        <div class="ladder-price-col">
          <span class="ladder-price">${z.price}</span>
          ${isCurrent ? '<span class="ladder-now-indicator">◀</span>' : ''}
        </div>
        <div class="ladder-blocks-col">
          <div class="ladder-blocks">
            ${genBlocks(z.resistCount, maxActivity, true)}
            ${genBlocks(z.supportCount, maxActivity, false)}
          </div>
        </div>
        <div class="ladder-meta-col">
          ${z.label ? `<span class="ladder-label">${z.label}</span>` : ''}
          <span class="ladder-vol">${z.totalActivity}</span>
        </div>
      </div>
    `;
  }).join('');

  hideLoading();
}

// ─── Liquidity Loader ────────────────────────────────────
async function loadLiquidity(silent = false) {
  if (window.AmyICTIntel) return window.AmyICTIntel.refresh();
  const status = document.getElementById('liquidity-status');
  const list = document.getElementById('liquidity-list');
  if (!status || !list) return;
  if (!silent) status.textContent = 'Melacak likuiditas...';

  try {
    const res = await fetch(`${API_BASE}/liquidity?interval=15min&outputsize=200`, { signal: beginRequest('liquidity') });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    if (!data.levels || data.levels.length === 0) {
      status.textContent = 'Belum ada level likuiditas terdeteksi';
      list.innerHTML = '<div class="empty-state">Belum ada swing level aktif.<br><small>Data dari TwelveData M15</small></div>';
      return;
    }

    const priceStr = data.currentPrice ? data.currentPrice.toFixed(2) : '--';
    status.textContent = `${data.levels.length} level aktif • XAU/USD ${priceStr} • ${formatTime(data.updated)}`;
    panelLoadedAt.liquidity = Date.now();
    if (!payloadIsFresh(data.updated)) throw new Error('Liquidity yang diterima sudah usang');
    window.AmyFXIntel?.write('liquidity', { updated: data.updated, capturedAt: data.updated, source: 'SUPABASE_EDGE', currentPrice: data.currentPrice, levels: data.levels });
    renderLiquidity(data.levels, data.currentPrice);
  } catch (e) {
    if (e.name === 'AbortError') return;
    status.textContent = 'Gagal memuat likuiditas';
    list.innerHTML = '<div class="empty-state">Gagal terhubung. Coba lagi nanti.</div>';
  }
}

function renderLiquidity(levels, currentPrice) {
  const list = document.getElementById('liquidity-list');
  const bslLevels = levels.filter(lv => lv.type === 'BSL').sort((a,b) => b.price - a.price);
  const sslLevels = levels.filter(lv => lv.type === 'SSL').sort((a,b) => b.price - a.price);
  const priceStr = currentPrice ? currentPrice.toFixed(2) : '--';
  const maxDistance = Math.max(...levels.map(lv => Math.abs(Number(lv.distance) || 0)), 1);
  const nearest = [...levels].sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance))[0];

  function renderNodes(arr, isBSL) {
    return arr.map((lv, i) => {
      const distAbs = Math.abs(lv.distance).toFixed(1);
      const timeText = lv.candlesAgo < 4 ? 'Baru' : `${lv.candlesAgo}`;
      const typeClass = isBSL ? 'bsl' : 'ssl';
      const proximity = 1 - Math.min(Math.abs(Number(lv.distance) || 0) / maxDistance, 1);
      const freshness = 1 - Math.min(Number(lv.candlesAgo || 0) / 200, 1);
      const strength = Math.max(0.16, proximity * 0.72 + freshness * 0.28);
      const isNearest = nearest && nearest.type === lv.type && Number(nearest.price) === Number(lv.price);
      
      return `
        <div class="liq-node-wrapper" style="--distance:${Math.abs(Number(lv.distance) || 0)};--strength:${strength.toFixed(2)};--node-scale:${(0.94 + strength * 0.06).toFixed(3)};animation-delay:${i * 0.05}s">
          <div class="node-card ${typeClass} ${isNearest ? 'nearest-draw' : ''}">
            <div class="node-head">
              <span class="node-badge">${lv.type}</span>
              <span class="node-active" title="Aktif"></span>
            </div>
            ${isNearest ? '<div class="nearest-label">NEAREST DRAW</div>' : ''}
            <div class="node-price">${lv.price.toFixed(2)}</div>
            <div class="node-stats">
              <span class="node-stat">⟷ ${distAbs}p</span>
              <span class="node-stat">⏱ ${timeText}c</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  list.innerHTML = `
    <div class="liq-network">
      <div class="liq-branch">
        ${renderNodes(bslLevels, true)}
      </div>

      <div class="liq-center">
        <span>XAU/USD</span>
        <strong>${priceStr}</strong>
      </div>

      <div class="liq-branch">
        ${renderNodes(sslLevels, false)}
      </div>
    </div>
    
    <div class="liq-legend">
      <div class="leg-item"><span class="leg-dot bsl-dot"></span> BSL (Buy Stop)</div>
      <div class="leg-item"><span class="leg-dot ssl-dot"></span> SSL (Sell Stop)</div>
      <div class="leg-item">⟷ Pips Jarak</div>
      <div class="leg-item">⏱ Usia Candle</div>
      <div class="leg-item"><span class="node-active leg-active"></span> Aktif</div>
    </div>
  `;
}

// ─── Helpers ─────────────────────────────────────────────
function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60 * 1000) return 'Baru saja';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m lalu`;
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' }) + ' WITA';
  } catch { return iso; }
}

function truncate(text, max) {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

function openLink(url) {
  try {
    if (window.Android?.openUrl) window.Android.openUrl(url);
    else window.open(url, '_blank');
  } catch { window.open(url, '_blank'); }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ─── Economic Calendar Engine ─────────────────────────────
const CALENDAR_ENDPOINTS = [
  'https://wliecyxzlwhmtftnfnps.supabase.co/functions/v1/economic-calendar',
  'https://amy-fx.vercel.app/api/calendar',
  'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://nfs.faireconomy.media/ff_calendar_thisweek.json'),
  'https://nfs.faireconomy.media/ff_calendar_thisweek.json'
];
const CALENDAR_CACHE_KEY = 'amy_economic_calendar_v1';
let calendarEvents = [];
let currentCalendarFilter = 'gold';

const COUNTRY_FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
  CAD: '🇨🇦', AUD: '🇦🇺', NZD: '🇳🇿', CHF: '🇨🇭', CNY: '🇨🇳'
};

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

async function loadCalendar(silent = false) {
  const status = document.getElementById('calendar-status');
  if (!status) return;
  if (!silent && calendarEvents.length === 0) status.textContent = 'Memuat jadwal kalender ekonomi...';

  const cached = getCachedCalendar();
  if (cached?.events?.length > 0 && calendarEvents.length === 0) {
    calendarEvents = cached.events;
    renderCalendar();
  }

  try {
    let data = null;

    // Bug 6: Per-endpoint 4s timeout prevents indefinite client hanging
    for (const url of CALENDAR_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutTimer = setTimeout(() => controller.abort(), 4000);
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
      } catch (fetchErr) {
        // Continue to fallback endpoint on error or timeout
      }
    }

    if (Array.isArray(data) && data.length > 0) {
      calendarEvents = data;
      saveCalendarToCache(data);
      panelLoadedAt.calendar = Date.now();
      renderCalendar();
      loadSentiment(true);
    } else if (calendarEvents.length === 0 && cached?.events?.length > 0) {
      calendarEvents = cached.events;
      isCalendarLive = false;
      renderCalendar();
      loadSentiment(true);
    } else if (calendarEvents.length === 0) {
      // Bug 6: Render retry state when all endpoints fail and cache is empty
      if (status) status.textContent = 'Gagal memuat kalender. Periksa koneksi.';
      const list = document.getElementById('calendar-list');
      if (list && list.children.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            Gagal memuat jadwal kalender ekonomi.<br>
            <button class="cal-retry-btn" onclick="loadCalendar()">🔄 Coba Lagi</button>
          </div>
        `;
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    if (status && calendarEvents.length === 0) status.textContent = 'Gagal memuat kalender. Coba lagi nanti.';
  } finally {
    hideLoading();
  }
}

function computeEventCountdown(eventTimeMs) {
  const diffMinutes = Math.round((eventTimeMs - Date.now()) / 60000);
  if (diffMinutes >= -15 && diffMinutes <= 15) {
    return { text: '🔴 Sedang Rilis / Volatilitas Tinggi', className: 'imminent' };
  }
  if (diffMinutes > 15 && diffMinutes <= 60) {
    return { text: `⏳ Rilis ${diffMinutes}m lagi`, className: 'soon' };
  }
  if (diffMinutes > 60 && diffMinutes <= 24 * 60) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return { text: `⏳ Rilis ${hours}j ${mins}m lagi`, className: 'soon' };
  }
  if (diffMinutes < -15) {
    return { text: '✓ Selesai', className: 'done' };
  }
  return { text: '⏳ Terjadwal', className: 'future' };
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

  // Filter events
  const filtered = calendarEvents.filter(item => {
    const impact = String(item.impact || '').toLowerCase();
    const country = String(item.country || '').toUpperCase();
    const isGoldDriver = country === 'USD' && (impact === 'high' || impact === 'medium');

    if (currentCalendarFilter === 'gold') return isGoldDriver;
    if (currentCalendarFilter === 'high') return impact === 'high';
    if (currentCalendarFilter === 'medium') return impact === 'medium';
    if (currentCalendarFilter === 'usd') return country === 'USD';
    return true; // 'all'
  });

  // Bug 3: Accurate sync and cache indicators
  const cached = getCachedCalendar();
  const cacheAgeMs = cached?.savedAt ? Date.now() - cached.savedAt : 0;
  const isStale = cacheAgeMs > 24 * 60 * 60 * 1000;

  if (status) {
    if (isCalendarLive) {
      status.textContent = `${filtered.length} rilis ekonomi • 🟢 Sinkronisasi Live (WITA)`;
    } else if (isStale) {
      status.textContent = `${filtered.length} rilis ekonomi • 🟠 Cache Usang (>24 Jam)`;
    } else {
      status.textContent = `${filtered.length} rilis ekonomi • 🟡 Cache Lokal (Tersimpan)`;
    }
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">Tidak ada rilis berita untuk filter yang dipilih.</div>';
    return;
  }

  // Group events by local date string
  const groups = new Map();
  for (const item of filtered) {
    const d = new Date(item.date);
    const dateKey = Number.isFinite(d.getTime())
      ? d.toLocaleDateString('id-ID', { timeZone: 'Asia/Makassar', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : 'Tanggal Tidak Diketahui';

    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey).push(item);
  }

  const html = [];
  groups.forEach((items, dateLabel) => {
    html.push(`<div class="calendar-group">`);
    html.push(`<div class="calendar-date-header"><span>📅 ${escapeHtml(dateLabel)}</span><small>${items.length} rilis</small></div>`);

    items.forEach(ev => {
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
        numbersHtml = `<span class="cal-badge-pill cal-pill-speech">🎙️ Pidato / Sentimen Kebijakan</span>`;
      } else if (isHoliday) {
        numbersHtml = `<span class="cal-badge-pill cal-pill-holiday">🏦 Libur Pasar / Bank Tutup</span>`;
      } else if (!hasNumbers) {
        numbersHtml = `<span class="cal-badge-pill cal-pill-nondata">📋 Agenda Non-Data Konsensus</span>`;
      } else {
        numbersHtml = `
          <span>Forecast: <strong class="cal-val">${escapeHtml(ev.forecast || '—')}</strong></span>
          <span>Previous: <strong class="cal-val">${escapeHtml(ev.previous || '—')}</strong></span>
          ${hasActual ? `<span>Actual: <strong class="cal-val act-live">${escapeHtml(ev.actual)}</strong></span>` : ''}
        `;
      }

      html.push(`
        <article class="calendar-card impact-${impactClass}">
          <div class="cal-top">
            <div class="cal-badge-wrap">
              <span class="cal-currency">${flag} ${escapeHtml(ev.country)}</span>
              <span class="impact-tag ${impactClass}">${impactLabel}</span>
            </div>
            <div class="cal-time-wrap">
              <span class="cal-time">⏰ ${timeStr}</span>
            </div>
          </div>
          <h2 class="cal-title">${escapeHtml(ev.title)}</h2>
          <div class="cal-bottom">
            <div class="cal-numbers">
              ${numbersHtml}
            </div>
            ${countdown.text ? `<span class="cal-countdown ${countdown.className}">${countdown.text}</span>` : ''}
          </div>
        </article>
      `);
    });

    html.push(`</div>`);
  });

  list.innerHTML = html.join('');
}
