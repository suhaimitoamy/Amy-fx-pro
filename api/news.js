const SUPABASE_NEWS_FEED =
  'https://wliecyxzlwhmtftnfnps.supabase.co/functions/v1/news-feed';
const TELEGRAM_SOURCE = 'SM_News_24h';
const TELEGRAM_WEB_BASES = [
  'https://telegram.me/s',
  'https://telegram.dog/s'
];

let newsRelevancePromise;

function loadNewsRelevance() {
  if (!newsRelevancePromise) {
    newsRelevancePromise = import('../lib/news-relevance.mjs');
  }
  return newsRelevancePromise;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const requestedLimit = Number.parseInt(String(req.query.limit || '20'), 10);
  const limit = Math.max(1, Math.min(Number.isFinite(requestedLimit) ? requestedLimit : 20, 50));
  const telegramOnly = String(req.query.source || '').toLowerCase() === 'telegram';
  const useSupabaseNews = process.env.AMY_USE_SUPABASE_NEWS === '1';

  if (!telegramOnly && useSupabaseNews) {
    try {
      const central = await fetchJsonWithTimeout(
        `${SUPABASE_NEWS_FEED}?limit=${limit}`,
        { headers: { Accept: 'application/json' } },
        1500
      );

      if (Array.isArray(central?.news) && central.news.length > 0) {
        central.news = await Promise.all(
          central.news.map(normalizeNewsTranslation)
        );

        res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
        return res.status(200).json({
          ...central,
          count: central.news.length,
          backend: 'supabase'
        });
      }
    } catch (error) {
      console.warn('Supabase news feed unavailable, using Telegram fallback:', error?.message || error);
    }
  }

  try {
    const fallback = await scrapeTelegram(limit, true);
    res.setHeader('Cache-Control', telegramOnly
      ? 'no-store'
      : 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({
      source: TELEGRAM_SOURCE,
      updated: new Date().toISOString(),
      count: fallback.length,
      news: fallback,
      backend: telegramOnly ? 'telegram_direct' : 'telegram_fallback'
    });
  } catch (error) {
    console.error('News API failed:', error);
    return res.status(502).json({
      source: TELEGRAM_SOURCE,
      updated: new Date().toISOString(),
      count: 0,
      news: [],
      error: 'fetch_failed'
    });
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 10000) {
  const response = await fetchWithTimeout(url, options, timeoutMs);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchTelegramHtml(retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    for (const base of TELEGRAM_WEB_BASES) {
      const url = `${base}/${TELEGRAM_SOURCE}?_=${Date.now()}`;
      try {
        const response = await fetchWithTimeout(url, {
          headers: {
            Accept: 'text/html,application/xhtml+xml',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 AmyFX/1.0'
          }
        }, 15000);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        if (!html.includes(`data-post="${TELEGRAM_SOURCE}/`)) {
          throw new Error('Telegram response contained no posts');
        }
        return html;
      } catch (error) {
        lastError = error;
      }
    }
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw lastError || new Error('Telegram fetch failed');
}

const translationCache = new Map();
let translateBackoffUntil = 0;

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

function sanitizeNewsText(raw) {
  let out = decodeHtmlEntities(raw)
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u200b|\u200c|\u200d|\ufeff/g, '');

  // Strip Telegram scrape footers, handles, promo lines, divider rules, and reaction counts
  out = out
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
    // Trailing reaction counters like 🔥1👏1👌1 or 👍2⚡1
    .replace(/(?:[\u{1F300}-\u{1FAFF}\u2600-\u27BF]\s*\d+\s*)+$/gmu, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return out;
}

const isTest = typeof process !== 'undefined' && (
  process.env.NODE_ENV === 'test' ||
  process.env.npm_lifecycle_event === 'test' ||
  process.execArgv?.includes('--test') ||
  Boolean(process.env.NODE_TEST_CONTEXT)
);

async function translateToId(text) {
  const clean = sanitizeNewsText(text);
  if (!clean) return '';
  if (!isTest && translationCache.has(clean)) return translationCache.get(clean);
  if (!isTest && Date.now() < translateBackoffUntil) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(clean)}`;
    const response = await fetchWithTimeout(url, {}, 5000);
    if (response.status === 429 || response.status === 403) {
      translateBackoffUntil = Date.now() + 5 * 60 * 1000;
      return '';
    }
    if (!response.ok) return '';
    const data = await response.json();
    if (!Array.isArray(data?.[0])) return '';
    const translated = sanitizeNewsText(data[0].map(chunk => chunk?.[0] || '').join(''));
    const result = translated === clean && data[2] !== 'id' ? '' : translated;
    if (result) {
      if (translationCache.size > 400) {
        const firstKey = translationCache.keys().next().value;
        translationCache.delete(firstKey);
      }
      translationCache.set(clean, result);
    }
    return result;
  } catch (_) {
    return '';
  }
}

const TRANSLATION_UNAVAILABLE = 'Terjemahan Bahasa Indonesia belum tersedia. Buka sumber untuk membaca berita asli.';

async function normalizeNewsTranslation(item) {
  if (!item || typeof item !== 'object') return item;
  const { getNewsImpact, isRelevantNews } = await loadNewsRelevance();
  const rawText = sanitizeNewsText(typeof item.text === 'string' ? item.text : '');
  const original = sanitizeNewsText(
    typeof item.textOriginal === 'string' && item.textOriginal.trim()
      ? item.textOriginal
      : rawText
  );
  if (!original) return { ...item, text: TRANSLATION_UNAVAILABLE, relevant: false, impact: 'medium' };

  const needsTranslation = !rawText || rawText === original
    || rawText === TRANSLATION_UNAVAILABLE;
  const translated = needsTranslation ? await translateToId(original) : rawText;
  const cleanTranslated = sanitizeNewsText(translated);
  return {
    ...item,
    impact: item.impact || getNewsImpact(original),
    relevant: typeof item.relevant === 'boolean' ? item.relevant : isRelevantNews(original),
    textOriginal: original,
    text: cleanTranslated || original || TRANSLATION_UNAVAILABLE
  };
}

async function scrapeTelegram(limit, shouldTranslate = true) {
  const { getNewsImpact, isRelevantNews } = await loadNewsRelevance();
  const html = await fetchTelegramHtml();
  const latest = sortNewestFirst(extractPosts(html)).slice(0, limit);

  return Promise.all(latest.map(async item => {
    const cleanOrig = sanitizeNewsText(item.text);
    const translated = shouldTranslate ? await translateToId(cleanOrig) : '';
    return {
      ...item,
      impact: getNewsImpact(cleanOrig),
      relevant: isRelevantNews(item.text),
      textOriginal: cleanOrig,
      text: translated || cleanOrig || TRANSLATION_UNAVAILABLE
    };
  }));
}

function extractPosts(html) {
  const posts = [];
  const postPattern = /data-post="SM_News_24h\/(\d+)"/g;
  const indices = [];
  let m;
  while ((m = postPattern.exec(html)) !== null) {
    indices.push({ id: m[1], index: m.index });
  }

  for (let i = 0; i < indices.length; i++) {
    const current = indices[i];
    const nextIndex = (i + 1 < indices.length) ? indices[i + 1].index : html.length;
    const postChunk = html.slice(current.index, nextIndex);

    const textMatch = postChunk.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (!textMatch) continue;

    const rawText = sanitizeNewsText(textMatch[1]);
    if (rawText.length < 20) continue;

    const timeMatch = postChunk.match(/datetime="([^"]+)"/i);
    const time = timeMatch ? timeMatch[1] : '';

    posts.push({
      id: current.id,
      text: rawText,
      link: `https://telegram.me/${TELEGRAM_SOURCE}/${current.id}`,
      time
    });
  }
  return posts;
}

function filterGold(posts, isRelevantNews) {
  return posts.filter(post => isRelevantNews(post.text));
}

function sortNewestFirst(posts) {
  return [...posts].sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
}

export { extractPosts, filterGold, sanitizeNewsText, sortNewestFirst };
