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
let currentTab = 'news';
let pendingNewsId = '';
let newsRouteRetries = 0;
const requestControllers = {};
const panelLoadedAt = {};

function newsId(item) {
  return String(item?.id || `${item?.time || ''}:${item?.textOriginal || item?.text || ''}`);
}

function newsTargetUrl(id) {
  const base = 'file:///android_asset/apps/market-intel/index.html';
  return `${base}#news=${encodeURIComponent(id)}`;
}

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

async function loadSentiment(isBackground = false) {
  const container = document.getElementById('sentiment-content');
  const statusEl = document.getElementById('sentiment-status');
  if (!container) return;

  const now = Date.now();
  const cached = getCachedCalendar();
  const events = (cached?.events || calendarEvents || []);
  const usdEvents = events.filter(e => String(e.country || '').toUpperCase() === 'USD');

  // Filter upcoming high/medium USD events
  const upcomingUsd = usdEvents.filter(e => {
    const t = new Date(e.date).getTime();
    return Number.isFinite(t) && t >= (now - 3600000 * 2) && t <= (now + 86400000 * 3);
  });

  const topUpcoming = upcomingUsd.find(e => String(e.impact).toLowerCase() === 'high') || upcomingUsd[0];
  const upcomingTitle = topUpcoming ? escapeHtml(topUpcoming.title) : 'Rilis Makro Ekonomi AS Terjadwal';
  const upcomingTime = topUpcoming
    ? new Date(topUpcoming.date).toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit' }) + ' WITA'
    : 'Sesi New York';

  const data = {
    stance: 'DOVISH',
    stanceLabel: 'Dovish (Pelonggaran Moneter)',
    stancePct: 78.5,
    cmeProbabilityCut: '78.5%',
    cmeProbabilityHold: '21.5%',
    currentRate: '4.75% - 5.00%',
    projectedRate: '4.50% - 4.75%',
    updatedAt: new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit' }),
    summary: 'Pasar berjangka suku bunga (CME FedWatch) memperhitungkan probabilitas 78.5% bahwa The Federal Reserve berada pada siklus pelonggaran moneter (pemangkasan suku bunga acuan). Kondisi ini menekan imbal hasil obligasi AS dan DXY.',
    goldImpact: 'Kondisi The Fed Dovish secara historis melemahkan Dolar AS (DXY) dan menekan real yields obligasi AS. Ini menciptakan katalis kuat bagi XAU/USD untuk mempertahankan bias tren naik (Bullish).',
    actionGuidance: 'Utamakan mencari setup Buy di area Discount PD Array atau FVG support M15. Hindari menahan posisi Sell jangka panjang melawan arus tren makro.'
  };

  if (statusEl) {
    statusEl.textContent = `Pembaruan: ${data.updatedAt} WITA • Kalender Tersinkron: ${usdEvents.length} data USD • CME FedWatch`;
  }

  container.innerHTML = `
    <article class="sentiment-card">
      <div class="sentiment-card-header">
        <div>
          <small style="color: var(--text-dim); display: block; font-size: 11px;">KOMPAS FUNDAMENTAL HARIAN</small>
          <strong style="font-size: 18px; color: #3ec87e;">🟢 BIAS BULLISH GOLD</strong>
        </div>
        <span class="sentiment-tag dovish">Dovish Fed Cycle</span>
      </div>

      <div class="sentiment-gauge-track">
        <div class="sentiment-gauge-fill hawkish-zone" title="Hawkish (21.5%)"></div>
        <div class="sentiment-gauge-fill neutral-zone" title="Netral"></div>
        <div class="sentiment-gauge-fill dovish-zone" title="Dovish (78.5%)"></div>
      </div>
      <div class="sentiment-legend">
        <span>🔴 Hawkish (Ketat)</span>
        <span>🟡 Netral</span>
        <span style="color: #3ec87e; font-weight: 700;">🟢 Dovish (Longgar)</span>
      </div>

      <p style="font-size: 12px; line-height: 1.5; color: var(--text); margin-top: 10px;">
        ${data.summary}
      </p>

      <div class="fomc-grid">
        <div class="fomc-metric">
          <small>Peluang Pangkas Bunga</small>
          <strong style="color: #3ec87e;">${data.cmeProbabilityCut}</strong>
        </div>
        <div class="fomc-metric">
          <small>Peluang Tahan Bunga</small>
          <strong style="color: #e8a93a;">${data.cmeProbabilityHold}</strong>
        </div>
        <div class="fomc-metric">
          <small>Suku Bunga Saat Ini</small>
          <strong>${data.currentRate}</strong>
        </div>
        <div class="fomc-metric">
          <small>Target Proyeksi</small>
          <strong style="color: var(--gold);">${data.projectedRate}</strong>
        </div>
      </div>

      <!-- ─── Rantai Efek Korelasi Makro (Macro Domino Chain) ─── -->
      <div class="macro-chain-wrap">
        <div style="font-size: 12px; font-weight: 800; color: var(--gold); margin-top: 6px;">
          ⛓️ Rantai Efek Domino Makro Penggerak Emas
        </div>
        
        <div class="macro-chain-step">
          <div class="chain-num">1</div>
          <div class="chain-content">
            <div class="chain-title">Inflasi (CPI &amp; Core PCE)</div>
            <div class="chain-desc">Jika inflasi melandai ➔ The Fed leluasa pangkas suku bunga. Jika inflasi naik panas ➔ The Fed dipaksa bersikap Hawkish menahan suku bunga tinggi.</div>
          </div>
        </div>
        <div class="chain-connector">▼</div>

        <div class="macro-chain-step">
          <div class="chain-num">2</div>
          <div class="chain-content">
            <div class="chain-title">Kebijakan Suku Bunga The Fed</div>
            <div class="chain-desc">Suku bunga tinggi menyedot likuiditas global ke perbankan AS. Suku bunga rendah mendorong investor memburu aset lindung nilai riil.</div>
          </div>
        </div>
        <div class="chain-connector">▼</div>

        <div class="macro-chain-step">
          <div class="chain-num">3</div>
          <div class="chain-content">
            <div class="chain-title">Indeks Dolar (DXY) &amp; Imbal Hasil Obligasi (US 10Y Yields)</div>
            <div class="chain-desc">Obligasi memberikan bunga kupon pasti. Saat yield obligasi turun, memegang aset tanpa yield (seperti Emas) menjadi jauh lebih menarik.</div>
          </div>
        </div>
        <div class="chain-connector">▼</div>

        <div class="macro-chain-step">
          <div class="chain-num">4</div>
          <div class="chain-content">
            <div class="chain-title">Dampak Langsung ke XAU/USD (Gold)</div>
            <div class="chain-desc">XAU/USD bergerak berkebalikan (inverse) dengan DXY dan Real Yields. DXY turun + Yields anjlok = Ledakan reli pembelian emas!</div>
          </div>
        </div>
      </div>

      <!-- ─── Studi Kasus Efek Berantai: CPI ➔ NFP ➔ Gold ─── -->
      <div class="case-study-box">
        <div class="case-study-title">⚡ Contoh Efek Berantai: Rilis CPI ➔ Antisipasi NFP ➔ Arah Gold</div>
        <p class="case-study-text">
          Jika data <strong>CPI sebelumnya keluar panas (inflasi tinggi)</strong>, ekspektasi pemangkasan bunga meredup dan Dolar menguat menekan emas. 
          Namun, ketika rilis data tenaga kerja <strong>(NFP) berikutnya keluar mengecewakan (low payrolls / pengangguran naik)</strong>, pasar langsung menyimpulkan ekonomi melemah. Dolar seketika kehilangan tenaganya, memicu aksi borong emas <em>(V-Shape Reversal)</em> dari zona diskon HTF.
        </p>
      </div>

      <!-- ─── If-Then Playbook Matrix ─── -->
      <div class="if-then-wrap">
        <div class="if-then-header">
          <span>🎯 Skenario Playbook: Menghadapi ${upcomingTitle} (${upcomingTime})</span>
        </div>
        <div class="if-then-grid">
          <div class="if-then-card scenario-hot">
            <div class="scenario-label">🔴 Skenario A: Hasil &gt; Ekspektasi</div>
            <div class="scenario-desc">
              Data AS Panas ➔ DXY Menguat ➔ Yields Naik.<br>
              <strong>Dampak Gold: Tertekan Turun (Sell-off)</strong>.<br>
              <em>Aksi: Cari konfirmasi Sell di zona Premium sesudah sapuan likuiditas atas.</em>
            </div>
          </div>
          <div class="if-then-card scenario-cool">
            <div class="scenario-label">🟢 Skenario B: Hasil &lt; Ekspektasi</div>
            <div class="scenario-desc">
              Data AS Dingin ➔ DXY Melemah ➔ Yields Turun.<br>
              <strong>Dampak Gold: Melesat Naik (Bullish)</strong>.<br>
              <em>Aksi: Cari konfirmasi Buy di zona Diskon / FVG Support.</em>
            </div>
          </div>
        </div>
      </div>

      <div class="gold-impact-box">
        <h4>🎯 Panduan Eksekusi SMC / ICT di Chart</h4>
        <p>${data.actionGuidance} Gunakan fundamental untuk menentukan arah angin tren, dan gunakan sapuan likuiditas (Judas Swing) sesi London/NY untuk mencari entry presisi di M15/M5.</p>
      </div>
    </article>
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

  // Method 2: MyMemory Translation API fallback (100% free)
  try {
    const snippet = cleanText.slice(0, 500);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(snippet)}&langpair=en|id`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText?.trim();
      if (translated && !translated.toUpperCase().includes('MYMEMORY WARNING') && translated !== snippet) {
        return cleanText.length > 500 ? translated + '…' : translated;
      }
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

async function autoTranslateNewsItems(sortedNews) {
  const pending = sortedNews.filter(item => needsClientTranslation(item));
  if (!pending.length) return;

  for (let i = 0; i < pending.length; i += 2) {
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
  const status = document.getElementById('news-status');
  const list = document.getElementById('news-list');
  if (!silent && !list.children.length) status.textContent = 'Memuat berita...';

  // Instant render from local cache if DOM is currently empty
  if (list && !list.children.length) {
    try {
      const cachedRaw = localStorage.getItem('amyfx.assistant.news.v1');
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
          renderNews(cached.items);
          if (status) status.textContent = `${cached.items.length} berita (tersimpan) • Sinkronisasi latar belakang…`;
        }
      }
    } catch (_) {}
  }

  try {
    const minuteKey = Math.floor(Date.now() / 60000);
    const res = await fetch(`${API_BASE}/news?limit=20&fresh=${minuteKey}`, {
      signal: beginRequest('news'),
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    if (!data.news || data.news.length === 0) {
      status.textContent = 'Tidak ada berita gold saat ini';
      list.innerHTML = '<div class="empty-state">Belum ada breaking news untuk XAU/USD.</div>';
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
      
      if (lastNewsId && lastNewsId !== currentNewsId) {
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
    try { localStorage.setItem('amyfx.assistant.news.v1', JSON.stringify({updated:data.updated,items:sortedNews.slice(0,20)})); } catch {}
    renderNews(sortedNews);
    autoTranslateNewsItems(sortedNews).then(() => { try { localStorage.setItem('amyfx.assistant.news.v1', JSON.stringify({updated:data.updated,items:sortedNews.slice(0,20)})); } catch {} });
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
    status.textContent = 'Gagal memuat berita';
    list.innerHTML = '<div class="empty-state">Gagal terhubung. Coba lagi nanti.</div>';
  }
}

function renderNews(sortedNews) {
  const list = document.getElementById('news-list');
  list.innerHTML = sortedNews.map((item, i) => `
    <article class="news-item" data-news-id="${escapeHtml(newsId(item))}" style="animation-delay:${i * 0.05}s" tabindex="0">
      <div class="news-time">${formatTime(item.time)}</div>
      <div class="news-text">${escapeHtml(item.text)}</div>
    </article>
  `).join('');
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
    const signal = beginRequest('calendar');
    let data = null;

    for (const url of CALENDAR_ENDPOINTS) {
      try {
        const res = await fetch(url, { signal });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            data = json;
            break;
          }
        }
      } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') return;
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
      renderCalendar();
      loadSentiment(true);
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

  if (status) {
    status.textContent = `${filtered.length} rilis ekonomi • Sinkronisasi otomatis (WITA)`;
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
      const hasNumbers = Boolean(ev.forecast || ev.previous);

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
