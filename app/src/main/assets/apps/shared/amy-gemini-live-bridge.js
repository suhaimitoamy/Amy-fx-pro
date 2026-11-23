/* Amy FX Pro — Amy Live 2.0 (Client Bridge + Direct WS Live Voice + All-App Trading Brain + Dark/Light Mode) */
(function (root) {
  'use strict';
  if (root.__AmyGeminiLiveBridgeLoaded) return;
  root.__AmyGeminiLiveBridgeLoaded = true;

  const CHAT_STORAGE_KEY = 'amyfx.gemini.chat.v1';
  const DEFAULT_LIVE_MODEL = 'models/gemini-3.8-live';
  const DEFAULT_CHAT_MODELS = ['gemini-3.1-flash-lite', 'gemini-4-hydrogen'];
  const DEFAULT_VOICE_NAME = 'Aoede';

  let geminiConfig = null;
  let pendingImageBase64 = '';
  let pendingImageLabel = '';

  // Live Voice State (Client-Side Direct WebSocket to Gemini BidiGenerateContent)
  let ws = null;
  let isLiveConnected = false;
  let isLiveConnecting = false;
  let isMicMuted = false;
  let micStream = null;
  let micAudioCtx = null;
  let micProcessor = null;
  let playAudioCtx = null;
  let nextPlayTime = 0;
  let activeSources = [];
  let isStreamingMic = true;
  let isUserSpeaking = false;
  let silenceTimer = null;
  let lastCanvasSentAt = 0;
  let currentLiveAiBubble = null;
  let currentLiveUserBubble = null;
  let isBubbleFullscreen = false;
  let pendingAutoResumeGreeting = '';

  const VAD_SPEECH_THRESHOLD = 0.0085;
  const VAD_SILENCE_MS = 1400;

  function isValidGeminiKey(rawKey) {
    const k = String(rawKey || '').trim();
    if (!k || k.length < 20) return false;
    if (/MY_GEMINI|YOUR_API|PLACEHOLDER|REPLACE_ME|EXAMPLE/i.test(k)) return false;
    return k.startsWith('AIza') || k.startsWith('AQ.');
  }

  function cleanPlainText(text) {
    return String(text || '')
      .replace(/^[ \t]*---+[ \t]*$/gm, '')
      .replace(/^[ \t]*#{1,6}[ \t]*/gm, '')
      .replace(/^[ \t]*[*-][ \t]+/gm, '• ')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/[*#`]/g, '')
      .replace(/\bGold([a-zA-Z])/g, 'Gold $1')
      .replace(/([.!?])([A-Za-z])/g, '$1 $2')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function formatMarkdownSafeHtml(rawText) {
    const escaped = String(rawText || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const codeBlocks = [];
    let out = escaped.replace(/```(?:[a-z0-9_-]+)?\n?([\s\S]*?)```/gi, (_, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push(`<pre class="amy-code-block"><code>${code.trim()}</code></pre>`);
      return `@@CODEBLOCK_${idx}@@`;
    });

    out = out.replace(/^[ \t]*#{1,6}[ \t]+(.+)$/gm, '<strong>$1</strong>');
    out = out.replace(/^[ \t]*---+[ \t]*$/gm, '');
    out = out.replace(/^[ \t]*[*-][ \t]+/gm, '• ');
    out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
    out = out.replace(/`([^`\n]+)`/g, '<code class="amy-inline-code">$1</code>');
    out = out.replace(/\n{3,}/g, '\n\n').trim().replace(/\n/g, '<br>');
    out = out.replace(/@@CODEBLOCK_(\d+)@@/g, (_, idx) => codeBlocks[Number(idx)] || '');
    return out;
  }

  function normQuery(str) {
    return String(str ?? '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9/$.%\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function detectIntents(rawQuery) {
    const q = normQuery(rawQuery);
    const modules = [];

    const wantsLotCalc =
      /\b(hitung lot|kalkulator|ukuran lot|lot berapa|pakai lot|berapa lot|risk calculator|risiko \d|risk \d|modal \$?\d|saldo \$?\d)\b/i.test(q) ||
      (/\b(entry|sl)\b/i.test(q) && /\b(modal|saldo|risiko|risk|lot)\b/i.test(q));

    const wantsMapping =
      /\b(harga|price|mapping|xau|gold|emas|chart|grafik|candle|sinyal|signal|bias|arah|entry|setup|poi|ob|order block|fvg|bsl|ssl|pdh|pdl|pwh|pwl|asia high|asia low|dealing range|diskon|discount|premium|equilibrium|eq|bos|mss|sweep|likuiditas|liquidity|adr|no-trade|breakdown|breakout|scalp|buy|sell|sl|tp|timeframe|m15|m5|h1|respect|riwayat poi|riwayat reaksi|akhir pekan|weekend|pasar tutup)\b/i.test(q);

    const wantsMarketIntel =
      /\b(news|berita|kabar|headline|kalender|calendar|ekonomi|kompas|fundamental|makro|fomc|nfp|cpi|ppi|pce|gdp|fed|powell|yield|dxy|dollar|dolar|inflasi|pengangguran|unemployment|philly|ism|geopolitik|iran|israel|hormuz|perang|news lock|high impact)\b/i.test(q);

    const wantsJournal =
      /\b(jurnal|journal|transaksi|trade saya|riwayat trade|profit|rugi|winrate|win rate|profit factor|net pips|total pips|performa|evaluasi|kesalahan|emosi|disiplin|psikologi|fomo|overtrade|revenge|habit|kebiasaan|streak|catatan trading|daily loss|loss guard|evaluasi mingguan|mingguan|7 hari|akun real|akun sim)\b/i.test(q) ||
      (/\bloss\b/i.test(q) && !/\bstop\s*loss\b/i.test(q));

    const wantsPractice =
      /\b(practice|praktik|simulasi|latihan|replay|candle replay|chart analysis|guided|60 kasus|100 kasus|8 pilar|mastery|backtest|riwayat backtest|skor latihan|soal)\b/i.test(q);

    const wantsAcademy =
      /\b(academy|akademi|belajar|materi|modul|level \d|level 0|pemula|bab|bagian \d|pelajaran|tutorial|bacaan|progres belajar|kurikulum|glosarium|kamus|istilah|akun cent|mt5|apa itu|jelaskan konsep|pengertian|definisi|cara kerja|bedanya|perbedaan)\b/i.test(q);

    const wantsAll = /\b(semua menu|semua modul|ringkasan aplikasi|status lengkap|cek semua|briefing lengkap|kondisi hari ini)\b/i.test(q);

    if (wantsAll) {
      modules.push('mapping', 'market_intel', 'journal', 'academy', 'practice');
    } else {
      if (wantsLotCalc) modules.push('risk_calc');
      if (wantsMapping) modules.push('mapping');
      if (wantsMarketIntel) modules.push('market_intel');
      if (wantsJournal) modules.push('journal');
      if (wantsPractice) modules.push('practice');
      if (wantsAcademy) modules.push('academy');
    }

    const filteredModules =
      modules.includes('journal') &&
      !wantsAll &&
      !/\b(mapping|harga|xau|gold|emas|chart|grafik|sinyal|bias|poi|ob|fvg|dealing range|bsl|ssl|respect|riwayat poi|riwayat reaksi|weekend|akhir pekan|pasar tutup)\b/i.test(q)
        ? modules.filter(m => m !== 'mapping')
        : modules;

    const explicitNav =
      /\b(buka halaman|buka menu|buka tab|pindah ke|pindahkan ke|arahkan ke|tampilkan halaman|masuk ke|pergi ke)\b/i.test(q) ||
      /^(buka|lihat|ke)\s+(halaman\s+)?(beranda|home|mapping|chart gold|berita|kalender|market intel|jurnal|academy|akademi|kalkulator|glosarium|practice|latihan|replay|indikator)\b/i.test(q);

    let navTarget = null;
    if (explicitNav) {
      if (/\b(mapping|chart gold|peta harga)\b/i.test(q)) navTarget = 'mapping';
      else if (/\b(berita|kalender|market intel|kompas)\b/i.test(q)) navTarget = 'market_intel';
      else if (/\b(jurnal|journal|habit)\b/i.test(q)) navTarget = 'journal';
      else if (/\b(practice|latihan|replay|backtest|simulasi)\b/i.test(q)) navTarget = 'practice';
      else if (/\b(kalkulator|resiko|risiko)\b/i.test(q)) navTarget = 'kalkulator';
      else if (/\b(glosarium|kamus)\b/i.test(q)) navTarget = 'glosarium';
      else if (/\b(academy|akademi|tutorial|materi)\b/i.test(q)) navTarget = 'academy';
      else if (/\b(indikator|pine)\b/i.test(q)) navTarget = 'indikator';
      else if (/\b(beranda|home)\b/i.test(q)) navTarget = 'home';
    }

    const wantsChartVision =
      /\b(chart di layar|grafik di layar|analisa chart|analisis chart|baca chart|lihat chart|candle di layar|chart gold|pola candle|struktur candle|screenshot chart)\b/i.test(q) ||
      (/\b(chart|grafik|candle)\b/i.test(q) && /\b(gold|xau|emas|m15|m5|h1|layar|sekarang|ini)\b/i.test(q));

    let switchTimeframe = null;
    if (/\b(ganti|ubah|pindah|switch)\b/i.test(q) && /\b(m5|m15|h1|5 menit|15 menit)\b/i.test(q)) {
      if (/\b(m5|5 menit)\b/i.test(q)) switchTimeframe = 'M5';
      else if (/\b(m15|15 menit)\b/i.test(q)) switchTimeframe = 'M15';
      else if (/\b(h1|1 jam)\b/i.test(q)) switchTimeframe = 'H1';
    }

    return {
      modules: [...new Set(filteredModules)],
      explicitNav,
      navTarget,
      wantsChartVision,
      wantsLotCalc,
      switchTimeframe
    };
  }

  function isTransientErrorReply(text) {
    const t = String(text || '').toLowerCase();
    return (
      !t ||
      t.includes('koneksi sedang sibuk') ||
      t.includes('gagal mengaktifkan mikrofon') ||
      t.includes('sedang disiapkan oleh server') ||
      t.includes('data belum dapat dibaca')
    );
  }

  function loadHistory() {
    try {
      const raw = root.localStorage.getItem(CHAT_STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr
        .filter(
          it =>
            it &&
            typeof it.text === 'string' &&
            !isTransientErrorReply(it.text) &&
            !it.text.includes('Mekanisme Algoritmik IPDA') &&
            !it.text.includes('MOC: Trauma & Recovery') &&
            !it.text.includes('Kronologi Kehancuran')
        )
        .map(it => ({ role: it.role, text: String(it.text).trim() }))
        .slice(-30);
    } catch (_) {
      return [];
    }
  }

  function saveHistory(arr) {
    try {
      const safe = (arr || []).filter(it => it && typeof it.text === 'string' && !isTransientErrorReply(it.text));
      root.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(safe.slice(-30)));
    } catch (_) {}
  }

  function getApiBaseUrl() {
    if (typeof window !== 'undefined' && window.location?.origin?.includes('appassets.androidplatform.net')) {
      return 'https://amy-fx.vercel.app';
    }
    return '';
  }

  function resolveAppUrl(rawPath) {
    if (!rawPath) return '#';
    const clean = String(rawPath).replace(/^(\/assets\/|\.\/|\/)/, '');
    if (typeof window !== 'undefined' && window.location?.origin?.includes('appassets.androidplatform.net')) {
      return 'https://appassets.androidplatform.net/assets/' + clean;
    }
    if (typeof window !== 'undefined' && window.location?.pathname?.startsWith('/assets/')) {
      return '/assets/' + clean;
    }
    return '/' + clean;
  }

  // Preserved Client Bridge config loader (/api/gemini-config + optional user key) with strict key validation
  async function ensureGeminiConfig() {
    if (geminiConfig && isValidGeminiKey(geminiConfig.apiKey)) return geminiConfig;
    try {
      const userKey = root.localStorage?.getItem('amy_user_gemini_api_key')?.trim();
      if (isValidGeminiKey(userKey)) {
        geminiConfig = {
          ok: true,
          apiKey: userKey,
          liveModel: DEFAULT_LIVE_MODEL,
          chatModel: DEFAULT_CHAT_MODELS[0],
          fallbackChatModel: DEFAULT_CHAT_MODELS[1],
          voiceName: DEFAULT_VOICE_NAME
        };
        return geminiConfig;
      }
    } catch (_) {}
    try {
      const res = await fetch(getApiBaseUrl() + '/api/gemini-config');
      if (res.ok) {
        const d = await res.json();
        if (d && isValidGeminiKey(d.apiKey)) {
          geminiConfig = {
            ...d,
            liveModel: d.liveModel || DEFAULT_LIVE_MODEL,
            chatModel: d.chatModel || DEFAULT_CHAT_MODELS[0],
            fallbackChatModel: d.fallbackChatModel || DEFAULT_CHAT_MODELS[1],
            voiceName: d.voiceName || DEFAULT_VOICE_NAME
          };
          return geminiConfig;
        }
      }
    } catch (_) {}
    return null;
  }

  function captureChartCanvasBase64() {
    try {
      const container =
        document.querySelector('#gold-chart-workspace') ||
        document.querySelector('.gold-price-panel') ||
        document.querySelector('#home-gold-chart') ||
        document.querySelector('.tv-lightweight-charts');
      if (!container) return '';
      const canvases = Array.from(container.querySelectorAll('canvas')).filter(c => c.width > 50 && c.height > 50);
      if (!canvases.length) return '';

      const rect = container.getBoundingClientRect();
      const outW = Math.min(960, Math.max(480, Math.round(rect.width || canvases[0].width)));
      const outH = Math.min(640, Math.max(280, Math.round(rect.height || canvases[0].height)));
      const out = document.createElement('canvas');
      out.width = outW;
      out.height = outH;
      const ctx = out.getContext('2d');
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, outW, outH);

      for (const c of canvases) {
        try {
          const r = c.getBoundingClientRect();
          const x = Math.max(0, Math.round(r.left - rect.left));
          const y = Math.max(0, Math.round(r.top - rect.top));
          const w = Math.round(r.width || c.width);
          const h = Math.round(r.height || c.height);
          ctx.drawImage(c, x, y, w, h);
        } catch (_) {}
      }
      return out.toDataURL('image/jpeg', 0.8).replace(/^data:image\/\w+;base64,/, '');
    } catch (_) {
      return '';
    }
  }

  function getLivePriceNumber() {
    if (root.AmyLocalAssistant?.getLivePrice) {
      const p = root.AmyLocalAssistant.getLivePrice();
      if (Number.isFinite(p) && p > 0) return p;
    }
    if (Number.isFinite(Number(root.amyfxCurrentPrice)) && Number(root.amyfxCurrentPrice) > 0) {
      return Number(root.amyfxCurrentPrice);
    }
    return null;
  }

  function summarizeCandles(tf) {
    try {
      const raw =
        root.localStorage.getItem(`amyfx.mapping.candles.${tf}`) ||
        root.localStorage.getItem(`amyfx.candles.XAU/USD.${tf}`) ||
        root.localStorage.getItem(`amyfx.mapping.candles.${tf === 'M15' ? '15min' : tf === 'M5' ? '5min' : tf}`);
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.candles)
        ? parsed.candles
        : Array.isArray(parsed?.values)
        ? parsed.values
        : [];
      if (!list.length) return '';

      const getTime = c => {
        if (!c) return 0;
        if (typeof c.time === 'number') return c.time;
        if (typeof c.timestamp === 'number') return c.timestamp;
        if (c.datetime) return new Date(String(c.datetime).replace(' ', 'T')).getTime() || 0;
        return 0;
      };
      let chronological = list;
      if (list.length > 1 && getTime(list[0]) > getTime(list[list.length - 1])) {
        chronological = [...list].reverse();
      }
      const recent = chronological.slice(-5);
      const last = recent[recent.length - 1];
      const closeVal = Number(last?.close || last?.c || 0);
      if (!Number.isFinite(closeVal) || closeVal <= 0) return '';
      const candlesText = recent
        .map(c => {
          const o = Number(c.open || c.o || 0).toFixed(2);
          const h = Number(c.high || c.h || 0).toFixed(2);
          const l = Number(c.low || c.l || 0).toFixed(2);
          const cl = Number(c.close || c.c || 0).toFixed(2);
          return `[${Number(cl) >= Number(o) ? 'BULL' : 'BEAR'} O:${o} H:${h} L:${l} C:${cl}]`;
        })
        .join(' → ');
      return `• Candle ${tf}: Close $${closeVal.toFixed(2)} | 5 Candle Terakhir: ${candlesText}`;
    } catch (_) {
      return '';
    }
  }

  let lastRequestedLesson = null;
  let lastReadLessonDetails = null;

  function resolveLessonHtmlPath(rawPath) {
    if (!rawPath) return 'apps/academy/index.html';
    let p = rawPath.replace(/^.*\/apps\/academy\//, 'apps/academy/');
    if (!p.startsWith('apps/academy/')) p = 'apps/academy/' + p;
    const hashIdx = p.indexOf('#');
    if (hashIdx !== -1) {
      const base = p.slice(0, hashIdx);
      const anchor = p.slice(hashIdx + 1);
      if (base.endsWith('/index.html') && anchor) {
        return base.replace(/\/index\.html$/, '/' + anchor + '.html');
      }
    }
    return p;
  }

  function findInLocalKnowledge(queryOrTitle, knowledgeList) {
    if (!queryOrTitle) return null;
    const knowledge = Array.isArray(knowledgeList) ? knowledgeList : root.AmyLocalKnowledge || [];
    if (!Array.isArray(knowledge) || !knowledge.length) return null;
    const q = String(queryOrTitle).toLowerCase().trim();

    let match = knowledge.find(k => k.title && k.title.toLowerCase() === q);
    if (match) return match;

    // Match Level 0 sub-lessons like "Bab 0.3", "Pelajaran 0.2", "0.4"
    const subBabMatch = q.match(/(?:pelajaran|bab|modul|bagian)?\s*\b(0\.[1-6])\b/i);
    if (subBabMatch) {
      const code = subBabMatch[1];
      match = knowledge.find(k => (k.title || '').toLowerCase().includes(`pelajaran ${code}`));
      if (match) return match;
    }

    // Match numbered lessons like "Bab 3", "Pelajaran 03", "Modul 12", "Bagian 08"
    const modMatch = q.match(/(?:pelajaran|bab|modul|bagian)\s*0?(\d{1,2})\b/i);
    if (modMatch) {
      const rawNum = String(Number(modMatch[1]));
      const padNum = rawNum.padStart(2, '0');
      match = knowledge.find(k => {
        const t = (k.title || '').toLowerCase();
        const p = (k.path || '').toLowerCase();
        return (
          t.startsWith(`pelajaran ${padNum} `) ||
          t.startsWith(`pelajaran ${padNum}—`) ||
          t.startsWith(`pelajaran ${rawNum} `) ||
          p.includes(`bagian-${padNum}`) ||
          p.includes(`modul-${padNum}`)
        );
      });
      if (match) return match;
    }

    // Match Level 0..6 ("Level 0", "Level 00", "Level 2")
    const lvlMatch = q.match(/level\s*0?(\d)\b/i);
    if (lvlMatch) {
      const n = String(Number(lvlMatch[1]));
      const pad = n.padStart(2, '0');
      match = knowledge.find(k => {
        const t = (k.title || '').toLowerCase();
        const p = (k.path || '').toLowerCase();
        return t.includes(`(level ${pad}:`) || t.includes(`(level ${n}:`) || p.includes(`level-${n}`);
      });
      if (match) return match;
    }

    const stopWords = new Set(['apa', 'itu', 'cara', 'yang', 'dan', 'di', 'ke', 'dari', 'materi', 'materinya', 'bab', 'pelajaran', 'buka', 'pelajari', 'belajar', 'jelaskan', 'ringkas', 'tampilkan', 'baca', 'lihat', 'tolong', 'coba', 'dong', 'ya', 'tentang', 'kita', 'sedang', 'bedanya', 'perbedaan', 'pengertian', 'definisi', 'arti']);
    const terms = q
      .replace(/[^a-z0-9.\s/-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1 && !stopWords.has(t));
    if (terms.length) {
      const ranked = knowledge
        .map(k => {
          const title = (k.title || '').toLowerCase();
          const body = (k.text || '').toLowerCase();
          let score = 0;
          let hits = 0;
          for (const term of terms) {
            if (title.includes(term)) {
              score += 5;
              hits += 1;
            } else if (body.includes(term)) {
              score += 1;
              hits += 1;
            }
          }
          return { k, score, hits };
        })
        .filter(r => r.score > 0)
        .sort((a, b) => (b.hits - a.hits) || (b.score - a.score));
      if (ranked[0]) return ranked[0].k;
    }
    return null;
  }

  function findLessonFromChatHistory(knowledgeList) {
    const knowledge = Array.isArray(knowledgeList) ? knowledgeList : (root.AmyLocalKnowledge || (typeof window !== 'undefined' ? window.AmyLocalKnowledge : []));
    if (!Array.isArray(knowledge) || !knowledge.length) return null;
    const hist = loadHistory();
    if (!Array.isArray(hist) || !hist.length) return null;

    const candidates = knowledge.map(k => {
      const match = k.title && (k.title.match(/—\s*([^:]+):/) || k.title.match(/—\s*(.+)\s*\(/));
      const term = match ? match[1].trim() : (k.title || '');
      return { entry: k, term, fullTitle: k.title || '' };
    }).sort((a, b) => (b.term.length || b.fullTitle.length) - (a.term.length || a.fullTitle.length));

    for (let i = hist.length - 1; i >= Math.max(0, hist.length - 6); i--) {
      const text = hist[i]?.text || '';
      if (!text) continue;
      for (const { entry, term, fullTitle } of candidates) {
        if (term) {
          const escTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (new RegExp('\\b' + escTerm + '\\b', 'i').test(text)) return entry;
        }
        if (fullTitle) {
          const escFull = fullTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (new RegExp('\\b' + escFull + '\\b', 'i').test(text)) return entry;
        }
      }
    }
    return null;
  }

  function resolveLessonFromQuery(queryOrTitle) {
    const rawQ = String(queryOrTitle || '').trim();
    const q = rawQ.toLowerCase();
    const knowledge = root.AmyLocalKnowledge || (typeof window !== 'undefined' ? window.AmyLocalKnowledge : []);

    const isGenericRef =
      !q ||
      /^(buka\s+)?(materi\s+)?(itu|nya|materinya|terakhir|tadi|lanjutkan|ini)$/i.test(q) ||
      /\b(materi itu|materinya|buka materi itu|buka materinya|materi terakhir|yang tadi|materi tadi|lanjutkan materi|materi ini|bab ini)\b/i.test(q);

    if (isGenericRef) {
      if (lastRequestedLesson && lastRequestedLesson.title) return lastRequestedLesson;
      if (lastReadLessonDetails && lastReadLessonDetails.title) return lastReadLessonDetails;

      const fromHist = findLessonFromChatHistory(knowledge);
      if (fromHist) {
        const path = resolveLessonHtmlPath(fromHist.path);
        return {
          title: fromHist.title,
          relPath: path.replace(/^apps\/academy\//, ''),
          fullPath: path,
          summary: (fromHist.text || '').slice(0, 1800),
          fullText: fromHist.text || ''
        };
      }
    }

    const found = findInLocalKnowledge(rawQ, knowledge);
    if (found) {
      const path = resolveLessonHtmlPath(found.path);
      return {
        title: found.title,
        relPath: path.replace(/^apps\/academy\//, ''),
        fullPath: path,
        summary: (found.text || '').slice(0, 1800),
        fullText: found.text || ''
      };
    }

    const fallbackHist = findLessonFromChatHistory(knowledge);
    if (fallbackHist) {
      const path = resolveLessonHtmlPath(fallbackHist.path);
      return {
        title: fallbackHist.title,
        relPath: path.replace(/^apps\/academy\//, ''),
        fullPath: path,
        summary: (fallbackHist.text || '').slice(0, 1800),
        fullText: fallbackHist.text || ''
      };
    }

    return null;
  }

  async function collectAcademyReadingContext(userQuestion) {
    try {
      const out = [];
      if (root.AmyLocalAssistant?.academy) {
        const prog = root.AmyLocalAssistant.academy();
        if (prog) out.push(prog);
      }
      const requestedLesson = resolveLessonFromQuery(userQuestion);
      if (requestedLesson?.title) {
        lastRequestedLesson = requestedLesson;
        out.push(`=== MATERI ICT / ACADEMY TERKAIT ===\n• Judul: ${requestedLesson.title}\n• Isi:\n${(requestedLesson.fullText || requestedLesson.summary).slice(0, 2200)}`);
      }
      return out.join('\n\n');
    } catch (_) {
      return '';
    }
  }

  function formatCockpitSnapshotLines(cockpit, reactionToday, isWeekend) {
    const out = [];
    if (isWeekend || cockpit?.weekendClosed) {
      out.push('• STATUS PASAR: **Pasar Tutup (Akhir Pekan)** (Jumat 17:00 NY s.d. Minggu 17:00 NY) — harga terakhir adalah penutupan Jumat, jangan eksekusi live.');
    }
    if (cockpit) {
      out.push(
        `• Mapping Cockpit Aktif: Prioritas **${cockpit.prioritySide || 'NETRAL'}** | Bias H1 ${cockpit.bias?.h1 || 'NETRAL'} · M15 ${cockpit.bias?.m15 || 'NETRAL'} · M5 ${cockpit.bias?.m5 || 'NETRAL'}${cockpit.sessionGuard?.label ? ' | Sesi: ' + cockpit.sessionGuard.label : ''}`
      );
      const fmtSide = (side, plan) => {
        if (!plan || !plan.zone) return;
        const z = plan.zone;
        const v = plan.verdict ? `${plan.verdict.grade} (${plan.verdict.score}/5)` : 'WAIT';
        const touch = z.touchCount > 0 ? `Sentuh ${z.touchCount}x${z.ceTouched ? ' CE' : ''}` : (z.fresh ? 'Fresh' : '');
        const details = [
          `${side} [${z.kind} ${z.tf}]: $${Number(z.low).toFixed(2)}–$${Number(z.high).toFixed(2)} (CE $${Number(z.ce).toFixed(2)})`,
          `Verdict ${v} · ${plan.state || 'STANDBY'}${touch ? ' · ' + touch : ''}`,
          plan.sl ? `SL $${Number(plan.sl).toFixed(2)}` : '',
          plan.tp1 ? `TP1 $${Number(plan.tp1).toFixed(2)}${plan.rr1 ? ' (1:' + Number(plan.rr1).toFixed(1) + 'R)' : ''}` : '',
          plan.tp2 ? `TP2 $${Number(plan.tp2).toFixed(2)}` : ''
        ].filter(Boolean);
        out.push(`• Dual-Layer POI ${details.join(' | ')}`);
      };
      fmtSide('SELL', cockpit.sell);
      fmtSide('BUY', cockpit.buy);
    }
    if (reactionToday) {
      out.push(
        `• Riwayat Reaksi POI Hari Ini (${reactionToday.dayWita}): ${reactionToday.respected} Respected, ${reactionToday.broken} Broken${reactionToday.respectRate != null ? ` (**Respect Rate ${reactionToday.respectRate}%**)` : ''} dari ${reactionToday.total} POI.`
      );
    }
    return out;
  }

  // Synchronized Mapping Structure Summary (100% aligned with Mapping Cockpit Dealing Range, Dual-Layer POI & Valid BSL/SSL)
  async function fetchLiveMarketStructureSummary() {
    let ctx = null;
    try {
      const res = await fetch(getApiBaseUrl() + '/api/scalper-setups', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4500)
      });
      if (res.ok) {
        const data = await res.json();
        const candidate = data.context || data;
        if (candidate && (candidate.version || candidate.m15)) {
          ctx = candidate;
          try {
            root.AmyMarketContext = ctx;
            root.localStorage.setItem('amyfx.market-context.v1', JSON.stringify(ctx));
          } catch (_) {}
        }
      }
    } catch (_) {}

    if (!ctx) {
      try {
        ctx = root.AmyMarketContext || JSON.parse(root.localStorage.getItem('amyfx.market-context.v1') || 'null');
      } catch (_) {}
    }

    const livePrice = getLivePriceNumber() || Number(ctx?.price || 0);
    const snap = ctx && root.AmyLocalAssistant?.buildMappingSnapshot
      ? root.AmyLocalAssistant.buildMappingSnapshot(ctx, livePrice)
      : null;

    let cockpit = snap?.cockpit || root.AmyMappingLiveCockpit || null;
    if (!cockpit) {
      try {
        const rawC = JSON.parse(root.localStorage.getItem('amyfx.mapping.cockpit_snapshot.v1') || 'null');
        if (rawC && (Date.now() - Number(rawC.updatedAt || 0) < 6 * 3600 * 1000 || root.AmyLocalAssistant?.isWeekendClosure?.())) {
          cockpit = rawC;
        }
      } catch (_) {}
    }
    const reactionToday = snap?.reactionToday || root.AmyLocalAssistant?.getReactionHistoryToday?.() || null;
    const isWeekend = Boolean(snap?.weekendClosed || root.AmyLocalAssistant?.isWeekendClosure?.());

    const lines = [];
    if (livePrice > 0) lines.push(`• Harga Live XAU/USD: $${livePrice.toFixed(2)}`);

    if (snap) {
      lines.push(
        `• Dealing Range M15 (SINKRON COCKPIT): **${snap.zoneLabel}** | Low $${Number(snap.rangeLow || 0).toFixed(2)} — High $${Number(snap.rangeHigh || 0).toFixed(2)} | EQ 50%: $${Number(snap.eq || 0).toFixed(2)}`
      );
      const liqArr = [];
      if (snap.bslAbove) liqArr.push(`BSL Valid di Atas: ${snap.bslAbove.label} $${snap.bslAbove.level.toFixed(2)}`);
      if (snap.sslBelow) liqArr.push(`SSL Valid di Bawah: ${snap.sslBelow.label} $${snap.sslBelow.level.toFixed(2)}`);
      if (liqArr.length) lines.push(`• Likuiditas Valid (Belum Tertembus): ${liqArr.join(' | ')}`);
    } else if (cockpit?.dealingRange) {
      lines.push(
        `• Dealing Range M15 (COCKPIT): ${cockpit.dealingRange.pct}% | Low $${cockpit.dealingRange.low.toFixed(2)} — High $${cockpit.dealingRange.high.toFixed(2)} | EQ 50%: $${cockpit.dealingRange.eq.toFixed(2)}`
      );
    }

    lines.push(...formatCockpitSnapshotLines(cockpit, reactionToday, isWeekend));

    if (ctx) {
      lines.push(
        `• Bias Multi-TF: H1 ${ctx.h1?.bias || 'NEUTRAL'} (${ctx.h1?.health || ''}, Protected $${Number(ctx.h1?.protectedLevel || 0).toFixed(2)}) | M15 ${ctx.m15?.structure || ''} (Kontrol ${ctx.m15?.control || 'SEIMBANG'}, Invalidasi $${Number(ctx.m15?.invalidLevel || 0).toFixed(2)}) | M5 ${ctx.m5?.status || 'WAIT'}`
      );

      const poi = ctx.m15?.poi;
      if (poi?.low && poi?.high) {
        lines.push(
          `• Order Block M15 (${poi.label || poi.side}): $${Number(poi.low).toFixed(2)}–$${Number(poi.high).toFixed(2)} | 50% CE: $${Number(poi.ce).toFixed(2)} (${poi.lifecycle || 'FRESH'})`
        );
      }

      const freshFvgs = (ctx.indicators?.m15?.fvg || []).filter(f => f.status === 1 || f.lifecycle === 'FRESH');
      if (freshFvgs.length) {
        lines.push(
          `• FVG Fresh M15: ` +
            freshFvgs
              .slice(0, 2)
              .map(f => `${f.side} $${Number(f.low).toFixed(2)}–$${Number(f.high).toFixed(2)} (CE $${Number(f.ce).toFixed(2)})`)
              .join(' | ')
        );
      }

      if (ctx.confluence?.score != null) {
        lines.push(`• Confluence: ${ctx.confluence.score}/100 [${ctx.confluence.grade || 'WAIT'}] | Skenario Utama: ${ctx.primary?.label || 'WAIT'}`);
      }
      if (ctx.plan?.entry) {
        lines.push(
          `• Plan Pantauan: ${ctx.plan.signalName || 'Setup'} · Entry $${Number(ctx.plan.entry).toFixed(2)} | SL $${Number(ctx.plan.sl).toFixed(2)} | TP $${Number(ctx.plan.tp1).toFixed(2)} (RR ${Number(ctx.plan.rr1 || 0).toFixed(2)}R) | Status Eksekusi: ${ctx.execution?.status || 'WAIT'}`
        );
      }
      if (ctx.news?.note) {
        lines.push(`• Status Kalender Mapping: ${ctx.news.note}`);
      }
    }

    return lines.join('\n');
  }

  // Synchronized Market Intel (Live Calendar USD Aktual vs Forecast + WITA Countdown + Gold-focused News)
  async function fetchLiveMarketIntelSummary(topic) {
    const sections = [];

    // 1. Live Calendar USD High-Impact (with Market Intel localStorage fallback supporting timestampMs & dateIso)
    try {
      let calData = null;
      try {
        const calRes = await fetch(getApiBaseUrl() + '/api/calendar', {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(4500)
        });
        if (calRes.ok) {
          calData = await calRes.json();
          try {
            root.localStorage.setItem('amyfx.market.calendar.v1', JSON.stringify(calData));
          } catch (_) {}
        }
      } catch (_) {}

      if (!calData) {
        try {
          calData =
            JSON.parse(root.localStorage.getItem('amyfx.market.calendar.v1') || 'null') ||
            JSON.parse(root.localStorage.getItem('amy_economic_calendar_v1') || 'null');
        } catch (_) {}
      }

      const rawEvents = Array.isArray(calData?.events)
        ? calData.events
        : Array.isArray(calData?.items)
        ? calData.items
        : Array.isArray(calData)
        ? calData
        : [];
      if (rawEvents.length) {
        const nowMs = Date.now();
        const events = rawEvents.map(e => ({
          ...e,
          _ts: Number.isFinite(Number(e.timestampMs)) && Number(e.timestampMs) > 0
            ? Number(e.timestampMs)
            : (e.dateIso ? Date.parse(e.dateIso) : NaN)
        }));
        const upcoming = events
          .filter(e => Number.isFinite(e._ts) && e._ts > nowMs)
          .sort((a, b) => a._ts - b._ts);
        const released = events.filter(e => e.actual && String(e.actual).trim() && String(e.actual).trim() !== '—').slice(-3).reverse();

        const calLines = ['KALENDER EKONOMI USD (REAL-TIME):'];
        if (upcoming.length) {
          upcoming.slice(0, 3).forEach(ev => {
            const diffMin = Math.max(0, Math.round((ev._ts - nowMs) / 60000));
            const h = Math.floor(diffMin / 60);
            const m = diffMin % 60;
            const cd = h > 24 ? `${Math.floor(h / 24)}h ${h % 24}j lagi` : h > 0 ? `${h}j ${m}m lagi` : `${m}m lagi`;
            const wita = ev.timeWita || new Date(ev._ts).toLocaleString('id-ID', { timeZone: 'Asia/Makassar', hour12: false }) + ' WITA';
            calLines.push(`• Upcoming: ${ev.title || ev.event} (${ev.impact || 'HIGH'}) — ${wita} (${cd}) | Forecast: ${ev.forecast || '—'}, Prev: ${ev.previous || '—'}`);
          });
        } else {
          calLines.push('• Tidak ada jadwal USD High-Impact dalam waktu dekat.');
        }
        if (released.length) {
          released.forEach(ev => {
            calLines.push(`• Rilis Aktual: ${ev.title || ev.event} → Aktual ${ev.actual} vs Forecast ${ev.forecast || '—'}${ev.goldBias ? ' [' + ev.goldBias + ']' : ''}`);
          });
        }
        sections.push(calLines.join('\n'));
      }
    } catch (_) {}

    // 2. Live News Fokus Gold & Kompas
    try {
      const newsRes = await fetch(getApiBaseUrl() + '/api/news', {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4500)
      });
      if (newsRes.ok) {
        const data = await newsRes.json();
        try {
          root.localStorage.setItem('amyfx.assistant.news.v1', JSON.stringify(data));
        } catch (_) {}
        const items = data.items || data.news || [];
        if (items.length) {
          let filtered = items;
          if (topic) {
            const tLower = topic.toLowerCase();
            const matched = items.filter(it => `${it.title || ''} ${it.text || ''}`.toLowerCase().includes(tLower));
            if (matched.length) filtered = matched;
          }
          const listText = filtered
            .slice(0, 5)
            .map((it, i) => `${i + 1}. ${String(it.title || it.text || '').trim().slice(0, 240)} (${it.source || 'Market Intel'}${it.goldImpact ? ' · ' + it.goldImpact : ''})`)
            .join('\n');
          sections.push(`BERITA FOKUS GOLD & MAKRO TERKINI:\n${listText}`);
        }
      }
    } catch (_) {}

    return sections.join('\n\n') || 'Belum ada jadwal berita berdampak tinggi saat ini. Kondisi makro stabil.';
  }

  // Smart Context Router — fetches ONLY modules relevant to the user's question (fast + free-tier quota friendly)
  async function collectAmyAppContext(userQuestion, forcedIntents = null) {
    const intents = forcedIntents || detectIntents(userQuestion || '');
    const mods = intents.modules.length ? intents.modules : ['mapping'];
    const lines = [];
    const nowWita = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar', hour12: false }) + ' WITA';
    lines.push(`Waktu Sekarang: ${nowWita} | Halaman Aktif: ${document.title || window.location.pathname}`);

    const livePrice = getLivePriceNumber();
    if (livePrice) lines.push(`Harga Live Layar XAU/USD: $${livePrice.toFixed(2)}`);

    const tasks = [];

    if (mods.includes('mapping')) {
      tasks.push(
        fetchLiveMarketStructureSummary().then(txt => {
          if (txt) lines.push(`DATA MAPPING & CHART GOLD (REAL-TIME):\n${txt}`);
          const m15Sum = summarizeCandles('M15') || summarizeCandles('15min');
          const m5Sum = summarizeCandles('M5') || summarizeCandles('5min');
          if (m15Sum) lines.push(m15Sum);
          if (m5Sum) lines.push(m5Sum);
        })
      );
    }

    if (mods.includes('market_intel')) {
      tasks.push(
        fetchLiveMarketIntelSummary('').then(txt => {
          if (txt) lines.push(txt);
        })
      );
    }

    if (mods.includes('journal')) {
      tasks.push(
        (async () => {
          if (root.AmyLocalAssistant?.readJournals) {
            const jData = await root.AmyLocalAssistant.readJournals();
            const jSummary = root.AmyLocalAssistant.journal(userQuestion || '', jData);
            if (jSummary) lines.push(`DATA JURNAL, HABITS & DAILY LOSS GUARD PENGGUNA:\n${jSummary}`);
          }
        })()
      );
    }

    if (mods.includes('risk_calc') && (root.AmyLocalAssistant?.calculateLot || root.AmyLocalAssistant?.riskCalc)) {
      const calc = root.AmyLocalAssistant.calculateLot
        ? root.AmyLocalAssistant.calculateLot(userQuestion || '')
        : { text: root.AmyLocalAssistant.riskCalc(userQuestion || '') };
      if (calc?.text) lines.push(`HASIL HITUNGAN LOT PRESISI:\n${calc.text}`);
    }

    if (mods.includes('practice') && root.AmyLocalAssistant?.practice) {
      lines.push(root.AmyLocalAssistant.practice());
    }

    if (mods.includes('academy')) {
      tasks.push(
        collectAcademyReadingContext(userQuestion).then(txt => {
          if (txt) lines.push(txt);
        })
      );
    }

    await Promise.allSettled(tasks);
    return lines.join('\n\n');
  }

  function switchChartTimeframeOnPage(validTf) {
    const buttons = Array.from(document.querySelectorAll('[data-tf], .tf-btn, button'));
    for (const btn of buttons) {
      const ds = String(btn.getAttribute('data-tf') || btn.textContent || '').trim().toUpperCase();
      if (ds === validTf && (btn.closest('#gold-chart-workspace, .gold-price-panel, .tf-switch, .chart-controls') || btn.hasAttribute('data-tf'))) {
        btn.click();
        return true;
      }
    }
    const selectEl = document.querySelector('#timeframe, #home-chart-tf');
    if (selectEl) {
      selectEl.value = validTf;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      const refBtn = document.querySelector('#refresh, #home-chart-refresh');
      if (refBtn) refBtn.click();
      return true;
    }
    return false;
  }

  function downsampleTo16k(inputBuffer, inputSampleRate) {
    if (inputSampleRate === 16000) {
      const pcm16 = new Int16Array(inputBuffer.length);
      for (let i = 0; i < inputBuffer.length; i++) {
        const s = Math.max(-1, Math.min(1, inputBuffer[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return pcm16;
    }
    const ratio = inputSampleRate / 16000;
    const newLength = Math.round(inputBuffer.length / ratio);
    const pcm16 = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetInput = 0;
    while (offsetResult < pcm16.length) {
      const nextOffsetInput = Math.round((offsetResult + 1) * ratio);
      let accum = 0;
      let count = 0;
      for (let i = offsetInput; i < nextOffsetInput && i < inputBuffer.length; i++) {
        accum += inputBuffer[i];
        count++;
      }
      const sample = count > 0 ? accum / count : 0;
      const clamped = Math.max(-1, Math.min(1, sample));
      pcm16[offsetResult] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      offsetResult++;
      offsetInput = nextOffsetInput;
    }
    return pcm16;
  }

  function playPcm24k(base64Data, onSpeakingStateChange) {
    if (!playAudioCtx) return;
    if (playAudioCtx.state === 'suspended') {
      playAudioCtx.resume().catch(() => {});
    }
    const bin = atob(base64Data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

    const buf = playAudioCtx.createBuffer(1, float32.length, 24000);
    buf.getChannelData(0).set(float32);

    const src = playAudioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(playAudioCtx.destination);

    const now = playAudioCtx.currentTime;
    if (nextPlayTime < now) nextPlayTime = now + 0.06;
    src.start(nextPlayTime);
    nextPlayTime += buf.duration;

    isStreamingMic = false;
    activeSources.push(src);
    if (onSpeakingStateChange) onSpeakingStateChange(true);

    src.onended = () => {
      const idx = activeSources.indexOf(src);
      if (idx !== -1) activeSources.splice(idx, 1);
      if (activeSources.length === 0) {
        setTimeout(() => {
          if (activeSources.length === 0) {
            isStreamingMic = true;
            if (onSpeakingStateChange) onSpeakingStateChange(false);
          }
        }, 220);
      }
    };
  }

  function stopPlayback() {
    for (const s of activeSources) {
      try { s.stop(); } catch (_) {}
    }
    activeSources = [];
    if (playAudioCtx) nextPlayTime = playAudioCtx.currentTime;
    isStreamingMic = true;
  }

  function upgradeAssistantPanel() {
    const host = document.getElementById('amy-local-root');
    if (!host) return false;
    if (host.dataset.geminiUpgraded === 'true') return true;
    host.dataset.geminiUpgraded = 'true';

    const panel = host.querySelector('#amy-local-panel');
    const fab = host.querySelector('#amy-local-fab');
    const messages = host.querySelector('#amy-local-messages');
    const form = host.querySelector('form');
    const input = form.querySelector('input');
    const promptsWrap = host.querySelector('.prompts');
    const header = panel.querySelector('header');
    const small = panel.querySelector('small');

    const extraStyle = document.createElement('style');
    extraStyle.textContent = `
      #amy-local-panel small { display: none !important; }
      #amy-local-panel header {
        padding: 12px 14px !important;
        background: rgba(12, 18, 34, 0.92) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        align-items: center;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        box-sizing: border-box;
      }
      #amy-local-panel .amy-brand-title {
        color: #f8fafc;
        font-weight: 800;
        font-size: 14.5px;
        letter-spacing: 0.02em;
      }
      #amy-local-panel.amy-minimized {
        height: auto !important;
        max-height: none !important;
        width: min(320px, calc(100vw - 24px)) !important;
      }
      #amy-local-panel.amy-minimized .prompts,
      #amy-local-panel.amy-minimized #amy-local-messages,
      #amy-local-panel.amy-minimized form,
      #amy-local-panel.amy-minimized #amy-attach-preview,
      #amy-local-panel.amy-minimized #amy-orb-hero {
        display: none !important;
      }

      /* FULLSCREEN BUBBLE ORB MODE */
      #amy-local-root {
        position: relative !important;
        z-index: 2147483640 !important;
        pointer-events: auto !important;
      }
      #amy-local-panel { pointer-events: auto !important; overscroll-behavior: none !important; }
      #amy-local-panel.amy-bubble-fullscreen {
        position: fixed !important;
        inset: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
        max-height: 100dvh !important;
        border-radius: 0 !important;
        border: none !important;
        background: radial-gradient(circle at 50% 18%, rgba(37, 35, 92, 0.88) 0%, rgba(10, 14, 26, 0.98) 54%, rgba(5, 8, 15, 1) 100%) !important;
        z-index: 2147483645 !important;
        pointer-events: auto !important;
      }
      #amy-local-panel.amy-bubble-fullscreen * { pointer-events: auto; }
      #amy-local-panel.amy-bubble-fullscreen header {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 14px 20px !important;
      }
      #amy-local-panel.amy-bubble-fullscreen .prompts,
      #amy-local-panel.amy-bubble-fullscreen #amy-local-messages,
      #amy-local-panel.amy-bubble-fullscreen form,
      #amy-local-panel.amy-bubble-fullscreen #amy-attach-preview {
        width: 100%;
        max-width: 780px;
        margin-inline: auto;
        box-sizing: border-box;
      }
      #amy-local-panel.amy-bubble-fullscreen form {
        border-radius: 16px 16px 0 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      #amy-orb-hero {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 14px 16px 12px;
        text-align: center;
        position: relative;
        flex-shrink: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        width: 100%;
        box-sizing: border-box;
        transition: padding 0.2s ease, gap 0.2s ease;
      }
      #amy-local-panel.amy-bubble-fullscreen #amy-orb-hero { display: flex; }
      #amy-local-panel.amy-bubble-fullscreen.amy-orb-compact #amy-orb-hero {
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        padding: 8px 14px !important;
        text-align: left !important;
      }
      #amy-local-panel.amy-bubble-fullscreen.amy-orb-compact .amy-bubble-stage {
        width: 40px !important;
        height: 40px !important;
        margin: 0 !important;
        flex-shrink: 0 !important;
      }
      #amy-local-panel.amy-bubble-fullscreen.amy-orb-compact .amy-bubble-halo {
        inset: -4px !important;
        filter: blur(8px) !important;
      }
      #amy-local-panel.amy-bubble-fullscreen.amy-orb-compact .amy-bubble-core {
        width: 34px !important;
        height: 34px !important;
      }
      #amy-local-panel.amy-bubble-fullscreen.amy-orb-compact .amy-bubble-core .orb-spark {
        font-size: 14px !important;
      }
      #amy-local-panel.amy-bubble-fullscreen.amy-orb-compact .amy-orb-title {
        flex: 1 !important;
        min-width: 0 !important;
        margin-top: 0 !important;
        font-size: 12px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      #amy-local-panel.amy-bubble-fullscreen.amy-orb-compact .amy-vu-wrap {
        display: none !important;
      }
      #amy-local-panel.amy-bubble-fullscreen.amy-orb-compact .amy-orb-controls {
        margin-top: 0 !important;
        flex-shrink: 0 !important;
      }
      #amy-local-panel.amy-bubble-fullscreen.amy-orb-compact .amy-orb-btn {
        padding: 6px 11px !important;
        font-size: 11px !important;
      }
      .amy-bubble-stage {
        position: relative;
        width: 122px;
        height: 122px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 2px 0 6px;
        cursor: pointer;
        user-select: none;
      }
      .amy-bubble-halo {
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(245, 196, 81, 0.38) 0%, rgba(99, 102, 241, 0.25) 48%, transparent 72%);
        filter: blur(16px);
        transition: transform 0.18s ease, opacity 0.25s ease, background 0.25s ease;
        opacity: 0.65;
      }
      .amy-bubble-ring {
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        border: 1.5px solid rgba(245, 196, 81, 0.32);
        box-shadow: 0 0 24px rgba(245, 196, 81, 0.18), inset 0 0 14px rgba(99, 102, 241, 0.22);
        animation: amyBubblePulse 3.2s infinite ease-in-out;
      }
      .amy-bubble-core {
        position: relative;
        width: 92px;
        height: 92px;
        border-radius: 50%;
        background: radial-gradient(circle at 32% 28%, #fde68a 0%, #f59e0b 26%, #6366f1 68%, #0f172a 100%);
        box-shadow: 0 0 32px rgba(245, 196, 81, 0.4), 0 0 54px rgba(99, 102, 241, 0.3), inset 0 3px 14px rgba(255, 255, 255, 0.65), inset 0 -8px 20px rgba(15, 23, 42, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.12s ease-out, box-shadow 0.25s ease, background 0.25s ease;
      }
      .amy-bubble-core .orb-spark {
        font-size: 30px;
        line-height: 1;
        color: #fff;
        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45));
      }
      .amy-bubble-stage.listening .amy-bubble-halo {
        opacity: 0.95;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.65) 0%, rgba(6, 182, 212, 0.42) 52%, transparent 74%);
      }
      .amy-bubble-stage.listening .amy-bubble-core {
        background: radial-gradient(circle at 32% 28%, #a7f3d0 0%, #10b981 30%, #0284c7 72%, #0f172a 100%);
        box-shadow: 0 0 38px rgba(16, 185, 129, 0.6), inset 0 3px 14px rgba(255, 255, 255, 0.75);
      }
      .amy-bubble-stage.speaking .amy-bubble-halo {
        opacity: 1;
        background: radial-gradient(circle, rgba(236, 72, 153, 0.68) 0%, rgba(245, 196, 81, 0.48) 52%, transparent 75%);
        animation: amyBubbleSpeak 0.9s infinite alternate ease-in-out;
      }
      .amy-bubble-stage.speaking .amy-bubble-core {
        background: radial-gradient(circle at 32% 28%, #fbcfe8 0%, #ec4899 30%, #f59e0b 70%, #1e1b4b 100%);
        box-shadow: 0 0 44px rgba(236, 72, 153, 0.7), inset 0 3px 16px rgba(255, 255, 255, 0.8);
        animation: amyCoreSpeak 0.65s infinite alternate ease-in-out;
      }
      .amy-bubble-stage.thinking .amy-bubble-halo {
        opacity: 0.95;
        background: radial-gradient(circle, rgba(245, 158, 11, 0.7) 0%, rgba(99, 102, 241, 0.5) 55%, transparent 75%);
      }
      @keyframes amyBubblePulse { 0%, 100% { transform: scale(0.98); opacity: 0.7; } 50% { transform: scale(1.05); opacity: 1; } }
      @keyframes amyBubbleSpeak { 0% { transform: scale(1.02); } 100% { transform: scale(1.24); } }
      @keyframes amyCoreSpeak { 0% { transform: scale(0.98); } 100% { transform: scale(1.08); } }
      @keyframes amyDotBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.45; } 40% { transform: translateY(-4px); opacity: 1; } }

      .amy-orb-title { font-size: 13px; font-weight: 700; letter-spacing: 0.02em; color: #e2e8f0; margin-top: 2px; }
      .amy-vu-wrap { width: 140px; height: 4px; background: rgba(255, 255, 255, 0.08); border-radius: 999px; overflow: hidden; margin-top: 7px; }
      .amy-vu-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #10b981, #38bdf8, #f5c451); border-radius: 999px; transition: width 0.08s ease; }
      .amy-orb-controls { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; }
      .amy-orb-btn {
        border-radius: 999px !important;
        padding: 8px 16px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.07) !important;
        color: #f8fafc !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
      }
      .amy-orb-btn.call-active {
        background: linear-gradient(135deg, #ef4444, #dc2626) !important;
        color: #fff !important;
        border-color: rgba(239, 68, 68, 0.75) !important;
      }
      .amy-orb-btn.muted-btn {
        background: rgba(239, 68, 68, 0.18) !important;
        color: #fca5a5 !important;
        border-color: rgba(239, 68, 68, 0.45) !important;
      }

      /* Quick Chips */
      #amy-local-panel .prompts {
        display: flex !important;
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        gap: 6px !important;
        padding: 8px 12px !important;
        scrollbar-width: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        flex-shrink: 0;
      }
      #amy-local-panel .prompts::-webkit-scrollbar { display: none; }
      #amy-local-panel .prompts button {
        white-space: nowrap !important;
        flex-shrink: 0 !important;
        border-radius: 999px !important;
        padding: 6px 12px !important;
        min-height: 0 !important;
        height: auto !important;
        line-height: 1.2 !important;
        font-size: 11.5px !important;
        font-weight: 600 !important;
        background: rgba(255, 255, 255, 0.06) !important;
        color: #cbd5e1 !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
      }
      #amy-local-panel .prompts button:hover {
        border-color: rgba(245, 196, 81, 0.55) !important;
        color: #fef08a !important;
      }

      .amy-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; display: inline-block; flex-shrink: 0; }
      .amy-status-dot.live { background: #ef4444; box-shadow: 0 0 10px #ef4444; animation: aiSparkBreathe 1.4s infinite ease-in-out; }

      /* Messages */
      #amy-local-messages {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain !important;
        overscroll-behavior-y: contain !important;
        touch-action: pan-y !important;
        padding: 12px 14px !important;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      #amy-local-messages p {
        margin: 0 !important;
        padding: 11px 14px !important;
        border-radius: 16px !important;
        font-size: 13.5px !important;
        line-height: 1.55 !important;
        max-width: 92%;
        position: relative;
      }
      .amy-msg-user {
        align-self: flex-end;
        background: linear-gradient(135deg, rgba(245, 196, 81, 0.22), rgba(245, 196, 81, 0.1)) !important;
        border: 1px solid rgba(245, 196, 81, 0.35) !important;
        border-bottom-right-radius: 4px !important;
        color: #fef3c7 !important;
      }
      .amy-msg-ai {
        align-self: flex-start;
        background: rgba(255, 255, 255, 0.055) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-bottom-left-radius: 4px !important;
        color: #f1f5f9 !important;
      }
      .amy-msg-ai strong { color: #fde68a; font-weight: 700; }
      .amy-inline-code {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 5px;
        padding: 1px 5px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
      }
      .amy-code-block {
        background: rgba(5, 9, 18, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 9px 11px;
        margin: 8px 0;
        overflow-x: auto;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
        line-height: 1.45;
        color: #e2e8f0;
      }
      .amy-msg-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-top: 6px;
        gap: 6px;
      }
      .amy-copy-btn {
        background: transparent !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        color: #94a3b8 !important;
        border-radius: 7px !important;
        padding: 4px 10px !important;
        min-height: 0 !important;
        height: auto !important;
        line-height: 1.2 !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .amy-copy-btn:hover {
        color: #f5c451 !important;
        border-color: rgba(245, 196, 81, 0.45) !important;
        background: rgba(245, 196, 81, 0.1) !important;
      }
      .amy-typing-bubble {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #cbd5e1 !important;
        font-size: 12.5px !important;
      }
      .amy-typing-dots { display: inline-flex; gap: 4px; align-items: center; }
      .amy-typing-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #f5c451;
        display: inline-block;
        animation: amyDotBounce 1.2s infinite ease-in-out;
      }
      .amy-typing-dots span:nth-child(2) { animation-delay: 0.16s; }
      .amy-typing-dots span:nth-child(3) { animation-delay: 0.32s; }

      .amy-msg-img {
        display: block;
        max-width: 100%;
        max-height: 170px;
        border-radius: 10px;
        margin-bottom: 6px;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .amy-action-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 6px;
        padding: 6px 12px;
        background: linear-gradient(135deg, rgba(245, 196, 81, 0.2), rgba(245, 196, 81, 0.08)) !important;
        border: 1px solid rgba(245, 196, 81, 0.42) !important;
        border-radius: 10px !important;
        color: #fef08a !important;
        font-weight: 700 !important;
        font-size: 12px !important;
        text-decoration: none !important;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      .amy-action-link:hover {
        background: linear-gradient(135deg, rgba(245, 196, 81, 0.34), rgba(245, 196, 81, 0.16)) !important;
        border-color: #f5c451 !important;
        transform: translateY(-1px);
      }
      #amy-attach-preview {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(15, 23, 42, 0.9);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 11px;
        color: #fde68a;
      }
      #amy-attach-preview img { width: 34px; height: 34px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(245, 196, 81, 0.5); }
      .amy-hdr-btn {
        width: 32px !important;
        height: 32px !important;
        padding: 0 !important;
        border-radius: 9px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: rgba(255, 255, 255, 0.06) !important;
        color: #cbd5e1 !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        cursor: pointer;
      }
      .amy-hdr-btn:hover {
        background: rgba(245, 196, 81, 0.18) !important;
        color: #f5c451 !important;
        border-color: rgba(245, 196, 81, 0.4) !important;
      }
      #amy-local-panel form {
        gap: 6px !important;
        padding: 10px 10px !important;
        align-items: center;
      }
      #amy-local-panel form input {
        font-size: 13.5px !important;
        padding: 8px 11px !important;
      }
      .amy-bar-btn {
        width: 34px !important;
        height: 34px !important;
        padding: 0 !important;
        border-radius: 10px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
        background: rgba(255, 255, 255, 0.06) !important;
        color: #e2e8f0 !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
      }
      .amy-bar-btn.active-mic {
        background: rgba(239, 68, 68, 0.25) !important;
        color: #fca5a5 !important;
        border-color: rgba(239, 68, 68, 0.7) !important;
      }
      .amy-send-btn {
        width: 36px !important;
        height: 34px !important;
        padding: 0 !important;
        border-radius: 10px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
        background: linear-gradient(135deg, #f5c451, #d97706) !important;
        color: #090d16 !important;
        border: none !important;
      }

      /* Mobile 360x820 (1080x2460 @ DPR 3) Calibration */
      @media (max-width: 440px) {
        #amy-local-panel:not(.amy-bubble-fullscreen) {
          left: 8px !important;
          right: 8px !important;
          width: auto !important;
          bottom: 80px !important;
          max-height: calc(100dvh - 102px) !important;
          border-radius: 18px !important;
        }
        #amy-local-panel .prompts {
          flex-wrap: wrap !important;
          overflow-x: visible !important;
          gap: 5px !important;
          padding: 7px 10px !important;
        }
        #amy-local-panel .prompts button {
          padding: 5px 9px !important;
          font-size: 11px !important;
        }
        #amy-local-panel form {
          gap: 5px !important;
          padding: 8px 8px !important;
        }
        #amy-local-panel form input {
          font-size: 13px !important;
          padding: 8px 9px !important;
        }
        .amy-bar-btn {
          width: 32px !important;
          height: 32px !important;
        }
        .amy-send-btn {
          width: 34px !important;
          height: 32px !important;
        }
      }

      /* FULL LIGHT MODE OVERRIDES (data-amyfx-theme="light" & data-theme="light") */
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-fab {
        background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%) !important;
        color: #0f172a !important;
        border: 1px solid rgba(180, 122, 14, 0.45) !important;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16), 0 0 14px rgba(217, 119, 6, 0.16) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-fab .ai-spark {
        color: #d97706 !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel {
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.99) 100%) !important;
        border: 1px solid rgba(15, 23, 42, 0.14) !important;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(217, 119, 6, 0.12) !important;
        color: #0f172a !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel.amy-bubble-fullscreen {
        background: radial-gradient(circle at 50% 14%, rgba(254, 243, 199, 0.55) 0%, #f8fafc 48%, #f1f5f9 100%) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel header {
        background: rgba(255, 255, 255, 0.94) !important;
        border-bottom: 1px solid rgba(15, 23, 42, 0.1) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel .amy-brand-title {
        color: #0f172a !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-hdr-btn {
        background: #f1f5f9 !important;
        color: #334155 !important;
        border: 1px solid rgba(15, 23, 42, 0.12) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-hdr-btn:hover {
        background: #fef3c7 !important;
        color: #b45309 !important;
        border-color: rgba(217, 119, 6, 0.4) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-orb-hero {
        border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-orb-title {
        color: #1e293b !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-vu-wrap {
        background: rgba(15, 23, 42, 0.1) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-orb-btn {
        background: #ffffff !important;
        color: #0f172a !important;
        border: 1px solid rgba(15, 23, 42, 0.16) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel .prompts {
        border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
        background: rgba(248, 250, 252, 0.9) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel .prompts button {
        background: #ffffff !important;
        color: #334155 !important;
        border: 1px solid rgba(15, 23, 42, 0.14) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel .prompts button:hover {
        background: #fef3c7 !important;
        color: #92400e !important;
        border-color: rgba(217, 119, 6, 0.5) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-msg-user {
        background: linear-gradient(135deg, #fef3c7, #fde68a) !important;
        border: 1px solid rgba(180, 122, 14, 0.35) !important;
        color: #0f172a !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-msg-ai {
        background: #ffffff !important;
        border: 1px solid rgba(15, 23, 42, 0.1) !important;
        color: #1e293b !important;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-msg-ai strong {
        color: #92400e !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-inline-code {
        background: #f1f5f9 !important;
        border-color: rgba(15, 23, 42, 0.14) !important;
        color: #0f172a !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-code-block {
        background: #0f172a !important;
        color: #f8fafc !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-copy-btn {
        color: #64748b !important;
        border-color: rgba(15, 23, 42, 0.14) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-copy-btn:hover {
        color: #b45309 !important;
        border-color: rgba(217, 119, 6, 0.45) !important;
        background: #fef3c7 !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-action-link {
        background: #fef3c7 !important;
        border: 1px solid rgba(180, 122, 14, 0.4) !important;
        color: #92400e !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-typing-bubble {
        color: #475569 !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel form {
        background: rgba(255, 255, 255, 0.96) !important;
        border-top: 1px solid rgba(15, 23, 42, 0.1) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel form input {
        background: #f8fafc !important;
        color: #0f172a !important;
        border: 1px solid rgba(15, 23, 42, 0.16) !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) #amy-local-panel form input::placeholder {
        color: #64748b !important;
      }
      :is(html[data-amyfx-theme="light"], html[data-theme="light"]) .amy-bar-btn {
        background: #f1f5f9 !important;
        color: #334155 !important;
        border: 1px solid rgba(15, 23, 42, 0.12) !important;
      }
    `;
    document.head.appendChild(extraStyle);

    header.innerHTML = `
      <div style="flex:1;min-width:0;display:flex;align-items:center;gap:8px">
        <span id="amy-gemini-dot" class="amy-status-dot"></span>
        <strong class="amy-brand-title">✦ AMY</strong>
      </div>
      <button type="button" id="amy-btn-fullbubble" class="amy-hdr-btn" title="Layar Penuh / Normal">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
      </button>
      <button type="button" id="amy-btn-min" class="amy-hdr-btn" title="Kecilkan Panel">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button type="button" id="amy-btn-clear" class="amy-hdr-btn" title="Bersihkan Obrolan">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
      <button type="button" id="amy-local-close" class="amy-hdr-btn" aria-label="Tutup asisten" title="Tutup">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    small.textContent = '';

    const orbHero = document.createElement('div');
    orbHero.id = 'amy-orb-hero';
    orbHero.innerHTML = `
      <div class="amy-bubble-stage" id="amy-bubble-stage" title="Ketuk gelembung untuk bicara atau menjawab langsung">
        <div class="amy-bubble-halo" id="amy-bubble-halo"></div>
        <div class="amy-bubble-ring"></div>
        <div class="amy-bubble-core" id="amy-bubble-core">
          <span class="orb-spark">✦</span>
        </div>
      </div>
      <div class="amy-orb-title" id="amy-orb-title">Ketuk Gelembung untuk Bicara</div>
      <div class="amy-vu-wrap"><div class="amy-vu-fill" id="amy-vu-fill"></div></div>
      <div class="amy-orb-controls">
        <button type="button" id="amy-orb-call-btn" class="amy-orb-btn">Mulai Suara</button>
        <button type="button" id="amy-orb-mute-btn" class="amy-orb-btn" hidden>Mic Aktif</button>
      </div>
    `;
    panel.insertBefore(orbHero, promptsWrap);

    const attachBar = document.createElement('div');
    attachBar.id = 'amy-attach-preview';
    attachBar.hidden = true;
    panel.insertBefore(attachBar, form);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.hidden = true;
    panel.appendChild(fileInput);

    const btnChartSnap = document.createElement('button');
    btnChartSnap.type = 'button';
    btnChartSnap.className = 'amy-bar-btn';
    btnChartSnap.title = 'Analisa Chart Gold di layar';
    btnChartSnap.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5c451" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`;

    const btnAttach = document.createElement('button');
    btnAttach.type = 'button';
    btnAttach.className = 'amy-bar-btn';
    btnAttach.title = 'Lampirkan gambar chart';
    btnAttach.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`;

    const btnVoice = document.createElement('button');
    btnVoice.type = 'button';
    btnVoice.id = 'amy-btn-voice';
    btnVoice.className = 'amy-bar-btn';
    btnVoice.title = 'Suara Live (Aoede)';
    btnVoice.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;

    const submitBtnEl = form.querySelector('button[type="submit"]');
    submitBtnEl.className = 'amy-send-btn';
    submitBtnEl.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;

    input.placeholder = 'Tanya Gold, Jurnal, Lot…';
    form.insertBefore(btnChartSnap, input);
    form.insertBefore(btnAttach, input);
    form.insertBefore(btnVoice, submitBtnEl);

    const statusDot = header.querySelector('#amy-gemini-dot');
    const closeBtn = header.querySelector('#amy-local-close');
    const fullBubbleBtn = header.querySelector('#amy-btn-fullbubble');
    const minBtn = header.querySelector('#amy-btn-min');
    const clearBtn = header.querySelector('#amy-btn-clear');

    const bubbleStage = orbHero.querySelector('#amy-bubble-stage');
    const bubbleCore = orbHero.querySelector('#amy-bubble-core');
    const orbTitle = orbHero.querySelector('#amy-orb-title');
    const vuFill = orbHero.querySelector('#amy-vu-fill');
    const orbCallBtn = orbHero.querySelector('#amy-orb-call-btn');
    const orbMuteBtn = orbHero.querySelector('#amy-orb-mute-btn');

    function setOrbVisualState(mode, titleText) {
      bubbleStage.className = 'amy-bubble-stage' + (mode ? ' ' + mode : '');
      if (titleText) orbTitle.textContent = titleText;
      if (statusDot) {
        statusDot.className = 'amy-status-dot' + (isLiveConnected || mode ? ' live' : '');
      }
    }

    let compactToggleCooldownUntil = 0;
    function isMessagesNearBottom(threshold = 96) {
      const dist = messages.scrollHeight - messages.scrollTop - messages.clientHeight;
      return dist <= threshold;
    }
    function scrollMessagesToBottom(force = false) {
      if (force || isMessagesNearBottom(96)) {
        messages.scrollTop = messages.scrollHeight;
      }
    }
    function setCompactOrb(compact) {
      const next = Boolean(compact && isBubbleFullscreen);
      if (panel.classList.contains('amy-orb-compact') === next) return;
      compactToggleCooldownUntil = Date.now() + 340;
      panel.classList.toggle('amy-orb-compact', next);
    }
    messages.addEventListener('scroll', () => {
      if (!isBubbleFullscreen || Date.now() < compactToggleCooldownUntil) return;
      const overflow = messages.scrollHeight - messages.clientHeight;
      if (overflow <= 64) {
        if (panel.classList.contains('amy-orb-compact')) setCompactOrb(false);
        return;
      }
      const distFromBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight;
      if (distFromBottom > 48) {
        setCompactOrb(true);
      } else if (distFromBottom <= 8) {
        setCompactOrb(false);
      }
    }, { passive: true });

    function setBubbleFullscreen(enabled) {
      isBubbleFullscreen = Boolean(enabled);
      panel.classList.remove('amy-minimized');
      if (isBubbleFullscreen) {
        try { if (typeof window.AmyFXCloseVideoReel === 'function') window.AmyFXCloseVideoReel(); } catch (_) {}
        document.querySelectorAll('dialog[open]').forEach(d => {
          if (!d.closest('#amy-local-root')) {
            try { d.close(); } catch (_) {}
            d.removeAttribute('open');
            if (d.classList.contains('amy-reel-dialog')) d.style.display = 'none';
          }
        });
        panel.classList.add('amy-bubble-fullscreen');
        window.AmyScrollGuard?.lock?.('amy-live');
      } else {
        panel.classList.remove('amy-bubble-fullscreen');
        panel.classList.remove('amy-orb-compact');
      }
      setTimeout(() => { scrollMessagesToBottom(true); }, 60);
    }

    fullBubbleBtn.onclick = () => setBubbleFullscreen(!isBubbleFullscreen);
    closeBtn.onclick = () => {
      setBubbleFullscreen(false);
      panel.hidden = true;
      fab.hidden = false;
      window.AmyScrollGuard?.unlock?.('amy-live');
    };
    minBtn.onclick = () => {
      if (isBubbleFullscreen) setBubbleFullscreen(false);
      panel.classList.toggle('amy-minimized');
      if (panel.classList.contains('amy-minimized')) {
        window.AmyScrollGuard?.unlock?.('amy-live');
      } else {
        window.AmyScrollGuard?.lock?.('amy-live');
      }
    };

    // Clean, non-spammy action links strictly aligned with user intent & existing routes
    function resolveActionLinks(intents, replyText) {
      if (!intents || !intents.modules.length || isTransientErrorReply(replyText)) return [];
      const curPath = window.location.pathname || '';
      const links = [];

      const addIfNotCurrent = (label, path) => {
        if (curPath.endsWith('/' + path) || curPath.endsWith(path)) return;
        links.push({ label, path });
      };

      for (const mod of intents.modules) {
        if (mod === 'mapping') addIfNotCurrent('📈 Buka Chart Gold & Mapping', 'apps/mapping/index.html');
        if (mod === 'market_intel') addIfNotCurrent('📰 Buka Berita & Kalender', 'apps/market-intel/index.html');
        if (mod === 'journal') addIfNotCurrent('📓 Buka Jurnal & Habits', 'apps/journal/index.html');
        if (mod === 'risk_calc') addIfNotCurrent('🧮 Buka Kalkulator Lot', 'apps/academy/tools/kalkulator-resiko.html');
        if (mod === 'practice') addIfNotCurrent('🎯 Buka Trading Practice (100 Kasus)', 'apps/academy/trading-practice/index.html');
        if (mod === 'academy') addIfNotCurrent('🎓 Buka Amy FX Academy', 'apps/academy/index.html');
      }

      const unique = [];
      const seen = new Set();
      for (const l of links) {
        if (!seen.has(l.path)) {
          seen.add(l.path);
          unique.push(l);
        }
      }
      return unique.slice(0, 2);
    }

    let typingBubbleEl = null;
    function showTypingIndicator() {
      removeTypingIndicator();
      const p = document.createElement('p');
      p.className = 'amy-msg-ai amy-typing-bubble';
      p.innerHTML = `<span class="amy-typing-dots"><span></span><span></span><span></span></span><span>AMY sedang menganalisa…</span>`;
      const wasNearBottom = isMessagesNearBottom(96);
      messages.appendChild(p);
      if (wasNearBottom) messages.scrollTop = messages.scrollHeight;
      typingBubbleEl = p;
    }
    function removeTypingIndicator() {
      if (typingBubbleEl) {
        typingBubbleEl.remove();
        typingBubbleEl = null;
      }
    }

    function renderBubble(role, text, opts = {}) {
      const shouldAutoScroll = opts.forceScroll !== undefined
        ? Boolean(opts.forceScroll)
        : (role === 'user' || isMessagesNearBottom(96));
      const p = document.createElement('p');
      p.className = role === 'user' ? 'amy-msg-user' : 'amy-msg-ai';

      if (opts.imageBase64) {
        const img = document.createElement('img');
        img.className = 'amy-msg-img';
        img.src = 'data:image/jpeg;base64,' + opts.imageBase64;
        img.alt = 'Chart';
        p.appendChild(img);
      }

      const body = document.createElement('span');
      const rawClean =
        role === 'user'
          ? String(text || '').replace(/^Sayang:\s*/i, '').trim()
          : String(text || '').replace(/^✦\s*AMY:\s*/i, '').trim();

      if (role === 'user' || opts.plainText) {
        body.textContent = opts.plainText ? cleanPlainText(rawClean) : rawClean;
      } else {
        body.innerHTML = formatMarkdownSafeHtml(rawClean);
      }
      p.appendChild(body);

      if (Array.isArray(opts.links) && opts.links.length) {
        const linkWrap = document.createElement('div');
        linkWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;';
        const seenPaths = new Set();
        opts.links.forEach(l => {
          if (!l || !l.path || seenPaths.has(l.path)) return;
          seenPaths.add(l.path);
          try {
            const a = document.createElement('a');
            a.className = 'amy-action-link';
            a.textContent = l.label || 'Buka Halaman';
            const targetUrl = resolveAppUrl(l.path);
            a.href = targetUrl;
            a.onclick = e => {
              e.preventDefault();
              if (isLiveConnected || isLiveConnecting) {
                try {
                  sessionStorage.setItem(
                    'amyfx.auto_resume_live',
                    JSON.stringify({
                      active: true,
                      timestamp: Date.now(),
                      targetTitle: l.label || 'halaman baru',
                      fullscreen: isBubbleFullscreen
                    })
                  );
                } catch (_) {}
              }
              window.location.href = targetUrl;
            };
            linkWrap.appendChild(a);
          } catch (_) {}
        });
        if (linkWrap.children.length) p.appendChild(linkWrap);
      }

      if (role !== 'user' && !opts.hideCopy && rawClean.length > 12) {
        const footer = document.createElement('div');
        footer.className = 'amy-msg-footer';
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'amy-copy-btn';
        copyBtn.textContent = 'Salin';
        copyBtn.onclick = async () => {
          const toCopy = cleanPlainText(rawClean);
          try {
            await navigator.clipboard.writeText(toCopy);
            copyBtn.textContent = 'Tersalin ✓';
            setTimeout(() => { copyBtn.textContent = 'Salin'; }, 1600);
          } catch (_) {
            copyBtn.textContent = 'Gagal';
            setTimeout(() => { copyBtn.textContent = 'Salin'; }, 1200);
          }
        };
        footer.appendChild(copyBtn);
        p.appendChild(footer);
      }

      messages.appendChild(p);
      while (messages.children.length > 40) messages.firstChild.remove();
      if (shouldAutoScroll) messages.scrollTop = messages.scrollHeight;
      return body;
    }

    function restoreSavedChat() {
      messages.innerHTML = '';
      setCompactOrb(false);
      const saved = loadHistory();
      if (!saved.length) {
        renderBubble(
          'model',
          'Halo Sayang! Saya **✦ AMY**, asisten khusus trading **XAU/USD** yang terhubung langsung ke **Chart Gold**, **Berita & Kalender**, **Jurnal & Habits**, **Hitung Lot**, dan **Practice**.\nMau cek apa hari ini?',
          { hideCopy: true, forceScroll: true }
        );
        return;
      }
      for (const item of saved) {
        renderBubble(item.role, item.text, { forceScroll: true });
      }
    }

    clearBtn.onclick = () => {
      saveHistory([]);
      restoreSavedChat();
    };

    function setPendingAttachment(base64, label) {
      pendingImageBase64 = base64;
      pendingImageLabel = label || 'Gambar Chart';
      if (!base64) {
        attachBar.hidden = true;
        attachBar.innerHTML = '';
        return;
      }
      attachBar.hidden = false;
      attachBar.innerHTML = `
        <img src="data:image/jpeg;base64,${base64}" alt="Preview">
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${pendingImageLabel} siap dianalisa</span>
        <button type="button" id="amy-cancel-attach" style="padding:4px 8px;font-size:11px">✕</button>
      `;
      attachBar.querySelector('#amy-cancel-attach').onclick = () => setPendingAttachment('', '');
    }

    btnAttach.onclick = () => fileInput.click();
    fileInput.onchange = e => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = 960;
          let w = img.width;
          let h = img.height;
          if (w > maxW) {
            h = Math.round(h * (maxW / w));
            w = maxW;
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const b64 = canvas.toDataURL('image/jpeg', 0.82).replace(/^data:image\/\w+;base64,/, '');
          setPendingAttachment(b64, file.name);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    };

    btnChartSnap.onclick = () => {
      const snap = captureChartCanvasBase64();
      if (snap) {
        setPendingAttachment(snap, 'Kanvas Chart Gold Live');
        sendChatMessage('Tolong analisa Chart Gold di layar saya sekarang (struktur M15/M5, Dealing Range, BSL/SSL, dan area pantau).');
      } else {
        sendChatMessage('Bagaimana analisa struktur dan harga Gold di Mapping sekarang?');
      }
    };

    let isSending = false;
    async function sendChatMessage(rawText) {
      const q = String(rawText ?? input.value ?? '').trim();
      if (isSending || (!q && !pendingImageBase64)) return;
      isSending = true;
      input.value = '';

      const intents = detectIntents(q);
      let imgToSend = pendingImageBase64;
      // Strict chart screenshot trigger — zero false positives on journal/lot/news queries
      if (!imgToSend && intents.wantsChartVision) {
        imgToSend = captureChartCanvasBase64();
      }
      setPendingAttachment('', '');

      renderBubble('user', q || 'Analisa gambar chart ini', { imageBase64: imgToSend });

      // 1. Live Voice active session path
      if (isLiveConnected && ws && ws.readyState === WebSocket.OPEN) {
        stopPlayback();
        isStreamingMic = false;
        setOrbVisualState('thinking', 'Memproses…');
        if (imgToSend) {
          ws.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ mimeType: 'image/jpeg', data: imgToSend }] } }));
        }
        ws.send(
          JSON.stringify({
            clientContent: {
              turns: [{ role: 'user', parts: [{ text: q || 'Tolong analisa gambar chart ini.' }] }],
              turnComplete: true
            }
          })
        );
        isSending = false;
        return;
      }

      // 2. Explicit chart timeframe switch in text chat
      if (intents.switchTimeframe) {
        const switched = switchChartTimeframeOnPage(intents.switchTimeframe);
        const msg = switched
          ? `Siap Sayang! Grafik Chart Gold sudah saya alihkan ke timeframe **${intents.switchTimeframe}**.`
          : `Halaman ini belum menampilkan kontrol grafik Chart Gold. Buka **Chart Gold & Mapping** untuk memilih timeframe **${intents.switchTimeframe}**.`;
        renderBubble('model', msg, {
          links: switched ? [] : [{ label: '📈 Buka Chart Gold & Mapping', path: 'apps/mapping/index.html' }]
        });
        isSending = false;
        return;
      }

      // 3. Explicit page navigation command
      if (intents.explicitNav && intents.navTarget) {
        const navMap = {
          mapping: ['Chart Gold & Mapping', 'apps/mapping/index.html'],
          market_intel: ['Berita & Kalender', 'apps/market-intel/index.html'],
          journal: ['Jurnal & Habits', 'apps/journal/index.html'],
          practice: ['Trading Practice', 'apps/academy/trading-practice/index.html'],
          academy: ['Amy FX Academy', 'apps/academy/index.html'],
          kalkulator: ['Kalkulator Risiko & Lot', 'apps/academy/tools/kalkulator-resiko.html'],
          glosarium: ['Glosarium ICT', 'apps/academy/glosarium/index.html'],
          indikator: ['Indikator ICT', 'apps/indikator/index.html'],
          home: ['Beranda', 'index.html']
        };
        const target = navMap[intents.navTarget];
        if (target) {
          renderBubble('model', `Membuka **${target[0]}** untuk Sayang…`, {
            links: [{ label: `👉 Buka ${target[0]}`, path: target[1] }],
            hideCopy: true
          });
          setTimeout(() => {
            try { window.location.assign(resolveAppUrl(target[1])); } catch (_) {}
          }, 420);
          isSending = false;
          return;
        }
      }

      // 4. Instant pure XAU/USD Lot Calculation (exact deterministic math, zero quota burn)
      if (
        intents.wantsLotCalc &&
        !imgToSend &&
        !intents.modules.includes('market_intel') &&
        !intents.modules.includes('journal') &&
        root.AmyLocalAssistant?.calculateLot
      ) {
        const calc = root.AmyLocalAssistant.calculateLot(q);
        if (calc?.ok) {
          renderBubble('model', calc.text, { links: resolveActionLinks(intents, calc.text) });
          const hist = loadHistory();
          hist.push({ role: 'user', text: q }, { role: 'model', text: calc.text });
          saveHistory(hist);
          isSending = false;
          return;
        }
      }

      setOrbVisualState('thinking', 'Menganalisa…');
      showTypingIndicator();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        const hist = loadHistory();
        const appContext = await collectAmyAppContext(q, intents);
        let data = null;

        // Primary chat path: /api/gemini-chat
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 11000);
          const resp = await fetch(getApiBaseUrl() + '/api/gemini-chat', {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: q,
              appContext,
              imageBase64: imgToSend,
              history: hist
            })
          });
          clearTimeout(timer);
          if (resp.ok) data = await resp.json();
        } catch (_) {}

        // Direct client-bridge fallback (ONLY if a valid real Gemini API key exists — never triggers 400 on placeholder keys!)
        if ((!data || !data.ok) && data?.code !== 'NO_VALID_KEY') {
          try {
            const cfg = await ensureGeminiConfig();
            if (cfg && isValidGeminiKey(cfg.apiKey)) {
              const directModels = [cfg.chatModel || DEFAULT_CHAT_MODELS[0], cfg.fallbackChatModel || DEFAULT_CHAT_MODELS[1]];
              const sysText =
                `Kamu adalah ✦ AMY, asisten khusus trading XAU/USD di Amy FX Pro (Pure Gold Scalper M15/M5 WITA).\n` +
                `Sapa pengguna dengan "Sayang", jawab tegas, jujur (Anti-Yes-Man), dan 100% berdasar data live aplikasi.\n` +
                `FORMAT ANGKA (MUTLAK): Wajib gunakan DIGIT ANGKA ($3595.57, 3611.41, 50%, 100 pips). Dilarang keras mengeja angka menjadi huruf (jangan eja "tiga ribu...").\n` +
                `KONTEKS LIVE APLIKASI:\n${appContext}`;
              const gContents = [];
              for (const h of hist.slice(-6)) {
                if (h?.text) gContents.push({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: String(h.text) }] });
              }
              const parts = [];
              if (imgToSend) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imgToSend } });
              parts.push({ text: q || 'Analisa chart' });
              gContents.push({ role: 'user', parts });

              for (const modelName of directModels) {
                const gUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 8000);
                const genCfg = { maxOutputTokens: 950 };
                if (!modelName.startsWith('gemini-4')) genCfg.temperature = 0.25;
                const gResp = await fetch(gUrl, {
                  method: 'POST',
                  signal: controller.signal,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    systemInstruction: { parts: [{ text: sysText }] },
                    generationConfig: genCfg,
                    contents: gContents
                  })
                });
                clearTimeout(timer);
                if (gResp.ok) {
                  const gJson = await gResp.json();
                  const gParts = gJson?.candidates?.[0]?.content?.parts || [];
                  const reply = gParts.filter(p => !p.thought && p.text).map(p => p.text).join('').trim();
                  if (reply) {
                    data = { ok: true, reply, model: modelName };
                    break;
                  }
                }
              }
            }
          } catch (_) {}
        }

        // Local Pro Trading Engine fallback (100% synced offline/free-tier mode)
        let replyText = data && data.ok && data.reply ? data.reply : '';
        if (!replyText && root.AmyLocalAssistant) {
          try {
            const localRes = await root.AmyLocalAssistant.ask(q);
            if (localRes?.text) replyText = localRes.text;
          } catch (_) {}
        }
        if (!replyText) {
          replyText = 'Maaf Sayang, data sementara belum terbaca. Coba ketuk kirim sekali lagi ya.';
        }

        const links = resolveActionLinks(intents, replyText);
        removeTypingIndicator();
        renderBubble('model', replyText, { links });

        if (!isTransientErrorReply(replyText)) {
          hist.push({ role: 'user', text: q });
          hist.push({ role: 'model', text: replyText });
          saveHistory(hist);
        }
      } catch (_) {
        removeTypingIndicator();
        if (root.AmyLocalAssistant) {
          const fallback = await root.AmyLocalAssistant.ask(q);
          renderBubble('model', fallback.text, { links: resolveActionLinks(intents, fallback.text) });
        }
      } finally {
        removeTypingIndicator();
        setOrbVisualState('', 'Ketuk Gelembung untuk Bicara');
        submitBtn.disabled = false;
        isSending = false;
        input.focus();
      }
    }

    form.onsubmit = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      sendChatMessage(input.value);
    };

    promptsWrap.innerHTML = '';
    [
      { label: 'Chart Gold', q: 'Harga Gold sekarang berapa, di zona Dealing Range apa, dan mana level BSL/SSL serta OB terdekat?' },
      { label: 'Berita & Kalender', q: 'Apa berita fokus Gold terbaru dan jadwal kalender ekonomi USD terdekat?' },
      { label: 'Jurnal & Habits', q: 'Evaluasi performa jurnal trading, win rate, habit disiplin, dan emosi saya' },
      { label: 'Hitung Lot', q: 'Hitung lot XAU/USD untuk modal $1000 risiko 1% SL 50 pips' },
      { label: 'Practice', q: 'Bagaimana skor latihan Trading Practice saya dan apa yang perlu diulang?' }
    ].forEach(item => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = item.label;
      b.onclick = () => sendChatMessage(item.q);
      promptsWrap.appendChild(b);
    });

    function commitUserSpeechTurn() {
      if (!isLiveConnected || !ws || ws.readyState !== WebSocket.OPEN) return;
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      isUserSpeaking = false;
      isStreamingMic = false;
      vuFill.style.width = '0%';
      bubbleCore.style.transform = 'scale(1)';
      setOrbVisualState('thinking', 'Memproses…');
      try {
        ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
      } catch (_) {}
      setTimeout(() => {
        if (isLiveConnected && !isStreamingMic && activeSources.length === 0) {
          isStreamingMic = true;
          if (!isMicMuted) setOrbVisualState('listening', 'Mendengarkan…');
        }
      }, 6000);
    }

    // --- AMY LIVE VOICE (DIRECT CLIENT WEBSOCKET TO GEMINI 3.8 LIVE · AOEDE) ---
    async function toggleLiveVoice() {
      if (isLiveConnected || isLiveConnecting) {
        stopLiveVoice();
        return;
      }

      if (!isBubbleFullscreen) setBubbleFullscreen(true);

      const cfg = await ensureGeminiConfig();
      if (!cfg || !isValidGeminiKey(cfg.apiKey)) {
        renderBubble(
          'model',
          'Mode **Suara Live (Aoede)** membutuhkan kunci Gemini aktif di server (`/api/gemini-config`). Sementara itu, Sayang tetap bisa menggunakan **Chat Teks & Hitung Lot** yang aktif penuh dengan data live aplikasi!',
          { hideCopy: true }
        );
        return;
      }

      isLiveConnecting = true;
      btnVoice.classList.add('active-mic');
      orbCallBtn.classList.add('call-active');
      orbCallBtn.textContent = 'Menyambungkan…';
      setOrbVisualState('thinking', 'Menyambungkan…');

      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });

        micAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        await micAudioCtx.resume();
        const nativeRate = micAudioCtx.sampleRate;

        playAudioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        await playAudioCtx.resume();
        nextPlayTime = 0;

        const appContext = await collectAmyAppContext('briefing lengkap', {
          modules: ['mapping', 'market_intel', 'journal', 'practice'],
          explicitNav: false,
          navTarget: null,
          wantsChartVision: false,
          wantsLotCalc: false,
          switchTimeframe: null
        });

        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(cfg.apiKey)}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          const setupMsg = {
            setup: {
              model: cfg.liveModel || DEFAULT_LIVE_MODEL,
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: cfg.voiceName || DEFAULT_VOICE_NAME
                    }
                  }
                }
              },
              tools: [
                {
                  functionDeclarations: [
                    {
                      name: 'get_mapping_structure_details',
                      description:
                        'Mengambil data live struktur XAU/USD (Harga Live, Dealing Range %/BREAKDOWN/DISKON/PREMIUM, BSL & SSL valid, Order Block + 50% CE, FVG fresh, H1/M15/M5 bias, dan Plan). WAJIB dipanggil saat Sayang bertanya kondisi pasar/mapping dan JAWAB LANGSUNG DI TEMPAT.',
                      parameters: { type: 'OBJECT', properties: {} }
                    },
                    {
                      name: 'get_live_gold_price',
                      description: 'Mengambil harga live XAU/USD terbaru di layar.',
                      parameters: { type: 'OBJECT', properties: {} }
                    },
                    {
                      name: 'get_market_news_summary',
                      description:
                        'Mengambil rangkuman Kalender Ekonomi USD (Aktual vs Forecast, Countdown WITA) dan berita fokus Gold terbaru. JAWAB LANGSUNG DI TEMPAT.',
                      parameters: {
                        type: 'OBJECT',
                        properties: {
                          topic: { type: 'STRING', description: 'Topik berita opsional (contoh: "fed", "inflasi", "cpi", "nfp").' }
                        }
                      }
                    },
                    {
                      name: 'get_journal_summary',
                      description:
                        'Mengambil Analitik Jurnal Pro lengkap (IndexedDB + localStorage: Equity Curve Net $/R, Win Rate, Profit Factor, Expectancy, Max Drawdown & Drawdown Aktif, Streak, Sesi WITA & Setup ICT terkuat, Leak Cost kesalahan psikologi) serta Habit & Discipline Streak.',
                      parameters: { type: 'OBJECT', properties: {} }
                    },
                    {
                      name: 'calculate_gold_lot',
                      description:
                        'Menghitung ukuran LOT XAU/USD presisi beserta risiko USD, TP1 (1:1.5R), dan TP2 (1:3R) berdasarkan modal, persen risiko, entry & SL atau jarak SL pips.',
                      parameters: {
                        type: 'OBJECT',
                        properties: {
                          query: {
                            type: 'STRING',
                            description: 'Rincian hitungan lot, misalnya "modal 1000 risiko 1% entry 3708 SL 3718" atau "saldo 500 risk 1% SL 50 pips".'
                          }
                        },
                        required: ['query']
                      }
                    },
                    {
                      name: 'get_practice_summary',
                      description: 'Mengambil skor latihan Trading Practice dan topik yang perlu diulang.',
                      parameters: { type: 'OBJECT', properties: {} }
                    },
                    {
                      name: 'open_academy_material',
                      description:
                        'Mengambil isi materi ICT/Academy untuk dijelaskan langsung di tempat. Set navigate=true HANYA jika Sayang secara eksplisit menyuruh membuka halaman materinya.',
                      parameters: {
                        type: 'OBJECT',
                        properties: {
                          query: { type: 'STRING', description: 'Topik atau nama materi ICT (contoh: "FVG", "Order Block", "Liquidity Sweep").' },
                          navigate: { type: 'BOOLEAN', description: 'Default false (jawab di tempat). Set true hanya jika diminta berpindah halaman.' }
                        },
                        required: ['query']
                      }
                    },
                    {
                      name: 'switch_chart_timeframe',
                      description: 'Mengganti timeframe Chart Gold di layar antara M15, M5, atau H1.',
                      parameters: {
                        type: 'OBJECT',
                        properties: {
                          timeframe: { type: 'STRING', description: 'Target timeframe: "M15", "M5", atau "H1".' }
                        },
                        required: ['timeframe']
                      }
                    },
                    {
                      name: 'navigate_to_page',
                      description:
                        'HANYA dipanggil jika Sayang SECARA EKSPLISIT memerintahkan pindah halaman (contoh: "buka halaman mapping", "pindah ke berita", "buka jurnal", "buka academy"). JANGAN dipanggil jika hanya bertanya informasi.',
                      parameters: {
                        type: 'OBJECT',
                        properties: {
                          page: {
                            type: 'STRING',
                            description: 'Pilihan: "home", "mapping", "news", "journal", "practice", "academy", "kalkulator", "glosarium", "indikator".'
                          }
                        },
                        required: ['page']
                      }
                    },
                    {
                      name: 'refresh_chart_view',
                      description: 'Mengambil snapshot visual Chart Gold terbaru di layar.',
                      parameters: { type: 'OBJECT', properties: {} }
                    }
                  ]
                }
              ],
              systemInstruction: {
                parts: [
                  {
                    text:
                      `Kamu adalah ✦ AMY, asisten trading suara khusus XAU/USD (Gold) di Amy FX Pro.\n` +
                      `FOKUS 100% TRADING XAU/USD & FITUR AMY FX PRO: Tolak halus topik non-trading dan arahkan kembali ke trading Gold atau fitur aplikasi.\n` +
                      `PROFIL: Sayang adalah Pure Gold Scalper M15/M5 target 100 Pips ($10), zona waktu WITA (UTC+8). Panggil selalu "Sayang" dengan hangat, tajam, dan jujur (Anti-Yes-Man).\n` +
                      `FITUR TERKINI AMY FX PRO: Mapping Cockpit Dual-Layer POI + 5-Point Verdict + Riwayat Reaksi/Respect Rate POI + status Pasar Tutup Akhir Pekan; Jurnal REAL vs SIM/Backtest + Evaluasi Mingguan 7H + Daily Loss Guard + Habits; Academy Jalur Penguasaan 43 Modul ICT (sistem kunci 80% ala Duolingo, Tes Loncat Dasar MT5, Unicorn/BPR/SMT/MMXM/Macros/StdDev/Capstone Chart Kosong); Trading Practice 100 Kasus ICT (8 Pilar).\n` +
                      `ATURAN FORMAT ANGKA & LEVEL (MUTLAK):\n` +
                      `- WAJIB menuliskan dan menyebutkan SEMUA angka harga, level support/resistance, Order Block, FVG, persentase, dan pips MENGGUNAKAN DIGIT ANGKA (contoh: $3595.57, 3611.41 - 3624.32, 50%, 100 pips).\n` +
                      `- DILARANG KERAS mengeja angka menjadi huruf atau kata-kata panjang (JANGAN PERNAH tulis "tiga ribu lima ratus...", "seventeen", dll). Trader butuh melihat angka digit riil dengan cepat dan presisi.\n` +
                      `ATURAN TOOL:\n` +
                      `- Selalu panggil tool data (get_mapping_structure_details, get_market_news_summary, get_journal_summary, calculate_gold_lot, get_practice_summary) dan JAWAB LANGSUNG DI TEMPAT.\n` +
                      `- Jangan panggil navigate_to_page kecuali Sayang eksplisit menyuruh pindah halaman.\n` +
                      `- Jangan gunakan simbol markdown (*, #, ---) karena suaramu langsung dibacakan.\n\n` +
                      `DATA AWAL APLIKASI:\n${appContext}\n`
                  }
                ]
              }
            }
          };
          ws.send(JSON.stringify(setupMsg));
        };

        ws.onmessage = async event => {
          let raw = '';
          if (typeof event.data === 'string') raw = event.data;
          else if (event.data instanceof Blob) raw = await event.data.text();

          try {
            const data = JSON.parse(raw);
            if (data.setupComplete) {
              isLiveConnecting = false;
              isLiveConnected = true;
              isStreamingMic = true;
              isMicMuted = false;
              orbCallBtn.textContent = 'Akhiri';
              orbMuteBtn.hidden = false;
              orbMuteBtn.className = 'amy-orb-btn';
              orbMuteBtn.textContent = 'Mic Aktif';
              setOrbVisualState('listening', 'Mendengarkan…');

              const snap = captureChartCanvasBase64();
              if (snap && ws && ws.readyState === WebSocket.OPEN) {
                lastCanvasSentAt = Date.now();
                ws.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ mimeType: 'image/jpeg', data: snap }] } }));
              }

              if (pendingAutoResumeGreeting && ws && ws.readyState === WebSocket.OPEN) {
                const greetingText = pendingAutoResumeGreeting;
                pendingAutoResumeGreeting = '';
                try {
                  ws.send(
                    JSON.stringify({
                      clientContent: { turns: [{ role: 'user', parts: [{ text: greetingText }] }], turnComplete: true }
                    })
                  );
                } catch (_) {}
              }
            }

            if (data.toolCall && Array.isArray(data.toolCall.functionCalls)) {
              setOrbVisualState('thinking', 'Memproses…');
              const functionResponses = [];

              for (const fc of data.toolCall.functionCalls) {
                if (fc.name === 'get_live_gold_price') {
                  const p = getLivePriceNumber();
                  functionResponses.push({
                    id: fc.id,
                    name: fc.name,
                    response: {
                      output: p
                        ? `Harga Live XAU/USD saat ini adalah $${p.toFixed(2)}. Gunakan angka persis ini.`
                        : 'Harga live sedang dimuat, tunggu sebentar.'
                    }
                  });
                } else if (fc.name === 'get_mapping_structure_details') {
                  const engineData = await fetchLiveMarketStructureSummary();
                  const localMap = root.AmyLocalAssistant ? root.AmyLocalAssistant.mapping('mapping', null, Date.now()) : '';
                  const finalOut = [engineData, localMap].filter(Boolean).join('\n\n');
                  functionResponses.push({
                    id: fc.id,
                    name: fc.name,
                    response: { output: finalOut || 'Data Mapping sedang dimuat.' }
                  });
                } else if (fc.name === 'get_market_news_summary') {
                  const topic = String(fc.args?.topic || '').trim();
                  const intelText = await fetchLiveMarketIntelSummary(topic);
                  functionResponses.push({
                    id: fc.id,
                    name: fc.name,
                    response: { output: intelText }
                  });
                } else if (fc.name === 'get_journal_summary') {
                  let journalText = '';
                  if (root.AmyLocalAssistant?.readJournals) {
                    const jData = await root.AmyLocalAssistant.readJournals();
                    journalText = root.AmyLocalAssistant.journal('evaluasi jurnal emosi habit', jData);
                  }
                  functionResponses.push({
                    id: fc.id,
                    name: fc.name,
                    response: { output: journalText || 'Belum ada catatan jurnal trading tersimpan.' }
                  });
                } else if (fc.name === 'calculate_gold_lot') {
                  const qArg = String(fc.args?.query || '').trim();
                  const calc = root.AmyLocalAssistant?.calculateLot
                    ? root.AmyLocalAssistant.calculateLot(qArg)
                    : (root.AmyLocalAssistant?.riskCalc ? { text: root.AmyLocalAssistant.riskCalc(qArg) } : null);
                  functionResponses.push({
                    id: fc.id,
                    name: fc.name,
                    response: { output: calc?.text || 'Sebutkan modal, persen risiko, dan jarak SL dalam pips atau harga.' }
                  });
                } else if (fc.name === 'get_practice_summary') {
                  const prac = root.AmyLocalAssistant?.practice ? root.AmyLocalAssistant.practice() : 'Belum ada data Trading Practice.';
                  functionResponses.push({
                    id: fc.id,
                    name: fc.name,
                    response: { output: prac }
                  });
                } else if (fc.name === 'open_academy_material') {
                  const qArg = String(fc.args?.query || '').trim();
                  const shouldNavigate = Boolean(fc.args?.navigate);
                  const les = resolveLessonFromQuery(qArg);
                  let output = `Materi "${qArg}" belum ada di indeks lokal. Jelaskan konsep ICT ini secara ringkas berdasarkan keahlian trading XAU/USD.`;
                  if (les?.title) {
                    lastRequestedLesson = les;
                    output = `Materi "${les.title}":\n${(les.fullText || les.summary || '').slice(0, 2200)}`;
                    if (shouldNavigate && les.fullPath) {
                      renderBubble('model', `Membuka materi **${les.title}**…`, { hideCopy: true });
                      setTimeout(() => {
                        try { window.location.assign(resolveAppUrl(les.fullPath)); } catch (_) {}
                      }, 500);
                      setTimeout(() => {
                        if (isLiveConnected) {
                          setOrbVisualState(isStreamingMic ? 'listening' : '', isStreamingMic ? 'Mendengarkan…' : 'Siap Menemani Sayang');
                        } else {
                          setOrbVisualState('', 'Ketuk Gelembung untuk Bicara');
                        }
                        isSending = false;
                      }, 2200);
                    }
                  }
                  functionResponses.push({ id: fc.id, name: fc.name, response: { output } });
                } else if (fc.name === 'switch_chart_timeframe') {
                  const tfArg = String(fc.args?.timeframe || '').toUpperCase().trim();
                  const validTf = tfArg.includes('H1') ? 'H1' : tfArg.includes('5') && !tfArg.includes('15') ? 'M5' : 'M15';
                  const switched = switchChartTimeframeOnPage(validTf);
                  functionResponses.push({
                    id: fc.id,
                    name: fc.name,
                    response: {
                      output: switched
                        ? `Grafik Chart Gold di layar berhasil diubah ke ${validTf}.`
                        : `Layar ini tidak memiliki kontrol Chart Gold. Buka Mapping untuk mengubah timeframe ke ${validTf}.`
                    }
                  });
                } else if (fc.name === 'navigate_to_page') {
                  const pArg = String(fc.args?.page || '').toLowerCase().trim();
                  let targetPath = '';
                  let title = '';
                  if (pArg.includes('map') || pArg.includes('chart')) {
                    targetPath = 'apps/mapping/index.html';
                    title = 'Chart Gold & Mapping';
                  } else if (pArg.includes('journ') || pArg.includes('jurnal') || pArg.includes('habit')) {
                    targetPath = 'apps/journal/index.html';
                    title = 'Jurnal & Habits';
                  } else if (pArg.includes('news') || pArg.includes('intel') || pArg.includes('berita') || pArg.includes('kalender')) {
                    targetPath = 'apps/market-intel/index.html';
                    title = 'Berita & Kalender';
                  } else if (pArg.includes('practice') || pArg.includes('latih') || pArg.includes('replay') || pArg.includes('backtest')) {
                    targetPath = 'apps/academy/trading-practice/index.html';
                    title = 'Trading Practice';
                  } else if (pArg.includes('kalkulator') || pArg.includes('risiko') || pArg.includes('lot')) {
                    targetPath = 'apps/academy/tools/kalkulator-resiko.html';
                    title = 'Kalkulator Risiko & Lot';
                  } else if (pArg.includes('glosarium') || pArg.includes('kamus')) {
                    targetPath = 'apps/academy/glosarium/index.html';
                    title = 'Glosarium ICT';
                  } else if (pArg.includes('academ') || pArg.includes('akadem') || pArg.includes('tutorial') || pArg.includes('materi')) {
                    targetPath = 'apps/academy/index.html';
                    title = 'Amy FX Academy';
                  } else if (pArg.includes('indik')) {
                    targetPath = 'apps/indikator/index.html';
                    title = 'Indikator ICT';
                  } else if (pArg.includes('home') || pArg.includes('beranda')) {
                    targetPath = 'index.html';
                    title = 'Beranda';
                  }

                  if (targetPath) {
                    const curPath = window.location.pathname;
                    const isCurrent = curPath.endsWith(targetPath) || (targetPath === 'index.html' && (curPath === '/' || curPath.endsWith('/index.html')));
                    if (isCurrent) {
                      functionResponses.push({ id: fc.id, name: fc.name, response: { output: `Sayang sudah berada di halaman ${title}.` } });
                    } else {
                      try {
                        sessionStorage.setItem(
                          'amyfx.auto_resume_live',
                          JSON.stringify({ active: true, timestamp: Date.now(), targetTitle: title, fullscreen: isBubbleFullscreen })
                        );
                      } catch (_) {}
                      stopPlayback();
                      isStreamingMic = false;
                      renderBubble('model', `Membuka **${title}** untuk Sayang…`, {
                        links: [{ label: `👉 Buka ${title}`, path: targetPath }],
                        hideCopy: true
                      });
                      setTimeout(() => {
                        try { window.location.assign(resolveAppUrl(targetPath)); } catch (_) {}
                      }, 600);
                      functionResponses.push({
                        id: fc.id,
                        name: fc.name,
                        response: { output: `Layar sedang dialihkan ke ${title}.` }
                      });
                    }
                  } else {
                    functionResponses.push({
                      id: fc.id,
                      name: fc.name,
                      response: { output: `Halaman "${pArg}" tidak dikenali. Pilihan: Beranda, Mapping, Berita & Kalender, Jurnal, Practice, Indikator.` }
                    });
                  }
                } else if (fc.name === 'refresh_chart_view') {
                  const freshSnap = captureChartCanvasBase64();
                  if (freshSnap && ws && ws.readyState === WebSocket.OPEN) {
                    lastCanvasSentAt = Date.now();
                    ws.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ mimeType: 'image/jpeg', data: freshSnap }] } }));
                  }
                  functionResponses.push({
                    id: fc.id,
                    name: fc.name,
                    response: { output: freshSnap ? 'Snapshot Chart Gold terbaru sudah terkirim.' : 'Tidak ada kanvas chart di halaman ini.' }
                  });
                }
              }

              if (functionResponses.length > 0 && ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ toolResponse: { functionResponses } }));
              }
            }

            if (data.serverContent) {
              const parts = data.serverContent.modelTurn?.parts || [];
              for (const part of parts) {
                if (part.inlineData?.data) {
                  playPcm24k(part.inlineData.data, speaking => {
                    if (!isLiveConnected) return;
                    if (speaking) setOrbVisualState('speaking', 'AMY Berbicara…');
                    else setOrbVisualState(isMicMuted ? '' : 'listening', isMicMuted ? 'Mic Nonaktif' : 'Mendengarkan…');
                  });
                }
              }

              if (data.serverContent.inputTranscription?.text) {
                const t = data.serverContent.inputTranscription.text;
                if (!currentLiveUserBubble) {
                  currentLiveUserBubble = renderBubble('user', t, { plainText: true });
                } else {
                  const wasNearBottom = isMessagesNearBottom(96);
                  const prev = currentLiveUserBubble.textContent || '';
                  const needsSpace = prev.length > 0 && !/\s$/.test(prev) && !/^\s/.test(t) && /[a-zA-Z0-9.,!?]$/.test(prev) && /^[a-zA-Z0-9]/.test(t);
                  currentLiveUserBubble.textContent += (needsSpace ? ' ' : '') + t;
                  if (wasNearBottom) messages.scrollTop = messages.scrollHeight;
                }
              }

              if (data.serverContent.outputTranscription?.text) {
                const t = data.serverContent.outputTranscription.text.replace(/[*#`]/g, '');
                if (!currentLiveAiBubble) {
                  currentLiveAiBubble = renderBubble('model', t, { plainText: true });
                } else {
                  const wasNearBottom = isMessagesNearBottom(96);
                  const prev = currentLiveAiBubble.textContent || '';
                  const needsSpace = prev.length > 0 && !/\s$/.test(prev) && !/^\s/.test(t) && /[a-zA-Z0-9.,!?]$/.test(prev) && /^[a-zA-Z0-9]/.test(t);
                  currentLiveAiBubble.textContent += (needsSpace ? ' ' : '') + t;
                  if (wasNearBottom) messages.scrollTop = messages.scrollHeight;
                }
              }

              if (data.serverContent.turnComplete) {
                const hist = loadHistory();
                if (currentLiveUserBubble) {
                  hist.push({ role: 'user', text: currentLiveUserBubble.textContent });
                  currentLiveUserBubble = null;
                }
                if (currentLiveAiBubble) {
                  const cleanedFinal = cleanPlainText(currentLiveAiBubble.textContent);
                  currentLiveAiBubble.textContent = cleanedFinal;
                  hist.push({ role: 'model', text: cleanedFinal });
                  currentLiveAiBubble = null;
                }
                saveHistory(hist);
                setTimeout(() => {
                  if (isLiveConnected && activeSources.length === 0) {
                    isStreamingMic = true;
                    if (!isMicMuted) setOrbVisualState('listening', 'Mendengarkan…');
                  }
                }, 280);
              }
            }
          } catch (_) {}
        };

        ws.onerror = () => stopLiveVoice();
        ws.onclose = () => stopLiveVoice();

        const source = micAudioCtx.createMediaStreamSource(micStream);
        micProcessor = micAudioCtx.createScriptProcessor(4096, 1, 1);
        micProcessor.onaudioprocess = e => {
          if (!isLiveConnected || !ws || ws.readyState !== WebSocket.OPEN) return;
          if (micAudioCtx && micAudioCtx.state === 'suspended') micAudioCtx.resume().catch(() => {});
          if (isMicMuted || !isStreamingMic || activeSources.length > 0) {
            vuFill.style.width = '0%';
            return;
          }

          const inputData = e.inputBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) sum += Math.abs(inputData[i]);
          const vol = sum / inputData.length;

          vuFill.style.width = Math.min(100, Math.round(vol * 650)) + '%';
          bubbleCore.style.transform = `scale(${(1 + Math.min(0.22, vol * 2.4)).toFixed(2)})`;

          const pcm16 = downsampleTo16k(inputData, nativeRate);
          const bytes = new Uint8Array(pcm16.buffer);
          let bin = '';
          for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
          ws.send(JSON.stringify({ realtimeInput: { audio: { mimeType: 'audio/pcm;rate=16000', data: btoa(bin) } } }));

          if (vol > VAD_SPEECH_THRESHOLD) {
            if (!isUserSpeaking) {
              isUserSpeaking = true;
              setOrbVisualState('listening', 'Mendengarkan…');
              if (Date.now() - lastCanvasSentAt > 12000) {
                const snap = captureChartCanvasBase64();
                if (snap) {
                  lastCanvasSentAt = Date.now();
                  ws.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ mimeType: 'image/jpeg', data: snap }] } }));
                }
              }
            }
            if (silenceTimer) {
              clearTimeout(silenceTimer);
              silenceTimer = null;
            }
          } else if (isUserSpeaking && !silenceTimer) {
            silenceTimer = setTimeout(() => commitUserSpeechTurn(), VAD_SILENCE_MS);
          }
        };
        source.connect(micProcessor);
        micProcessor.connect(micAudioCtx.destination);
      } catch (err) {
        renderBubble('model', 'Gagal mengaktifkan mikrofon: ' + err.message, { hideCopy: true });
        stopLiveVoice();
      }
    }

    function stopLiveVoice() {
      try { sessionStorage.removeItem('amyfx.auto_resume_live'); } catch (_) {}
      isLiveConnecting = false;
      isLiveConnected = false;
      isUserSpeaking = false;
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      stopPlayback();
      if (ws) {
        try { ws.close(); } catch (_) {}
        ws = null;
      }
      if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        micStream = null;
      }
      if (micProcessor) {
        try { micProcessor.disconnect(); } catch (_) {}
        micProcessor = null;
      }
      if (micAudioCtx) {
        try { micAudioCtx.close(); } catch (_) {}
        micAudioCtx = null;
      }
      if (playAudioCtx) {
        try { playAudioCtx.close(); } catch (_) {}
        playAudioCtx = null;
      }
      btnVoice.classList.remove('active-mic');
      orbCallBtn.classList.remove('call-active');
      orbCallBtn.textContent = 'Mulai Suara';
      orbMuteBtn.hidden = true;
      vuFill.style.width = '0%';
      bubbleCore.style.transform = 'scale(1)';
      setOrbVisualState('', 'Ketuk Gelembung untuk Bicara');
      currentLiveAiBubble = null;
      currentLiveUserBubble = null;
    }

    bubbleStage.onclick = () => {
      if (!isLiveConnected && !isLiveConnecting) {
        toggleLiveVoice();
        return;
      }
      if (activeSources.length > 0) {
        stopPlayback();
        isStreamingMic = true;
        setOrbVisualState('listening', 'Mendengarkan…');
        return;
      }
      commitUserSpeechTurn();
    };

    orbCallBtn.onclick = toggleLiveVoice;
    orbMuteBtn.onclick = () => {
      if (!isLiveConnected) return;
      isMicMuted = !isMicMuted;
      if (isMicMuted) {
        orbMuteBtn.className = 'amy-orb-btn muted-btn';
        orbMuteBtn.textContent = 'Mic Nonaktif';
        setOrbVisualState('', 'Mic Nonaktif');
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
      } else {
        orbMuteBtn.className = 'amy-orb-btn';
        orbMuteBtn.textContent = 'Mic Aktif';
        isStreamingMic = true;
        setOrbVisualState('listening', 'Mendengarkan…');
      }
    };

    btnVoice.onclick = toggleLiveVoice;
    restoreSavedChat();

    // Auto-resume Live Voice across pages
    try {
      const rawAutoResume = sessionStorage.getItem('amyfx.auto_resume_live');
      if (rawAutoResume) {
        sessionStorage.removeItem('amyfx.auto_resume_live');
        const autoData = JSON.parse(rawAutoResume);
        if (autoData?.active && Date.now() - Number(autoData.timestamp || 0) < 18000) {
          panel.hidden = false;
          fab.hidden = true;
          if (autoData.fullscreen) setBubbleFullscreen(true);
          const pageTitle = document.title || autoData.targetTitle || 'halaman baru';
          pendingAutoResumeGreeting = `Kita sudah berada di halaman "${pageTitle}". Sapa Sayang satu kalimat singkat dan santai.`;
          renderBubble('model', `Menyambungkan kembali Amy Live di **${pageTitle}**…`, { hideCopy: true });
          setTimeout(() => {
            if (!isLiveConnected && !isLiveConnecting) toggleLiveVoice().catch(() => {});
          }, 350);
        }
      }
    } catch (_) {}

    return true;
  }

  function schedulePanelUpgrade() {
    if (upgradeAssistantPanel()) return;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (upgradeAssistantPanel() || attempts > 30) clearInterval(interval);
    }, 80);

    if (typeof MutationObserver !== 'undefined' && document.body) {
      const observer = new MutationObserver(() => {
        if (upgradeAssistantPanel()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedulePanelUpgrade, { once: true });
  } else {
    schedulePanelUpgrade();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (isLiveConnected || isLiveConnecting) {
        try {
          sessionStorage.setItem(
            'amyfx.auto_resume_live',
            JSON.stringify({
              active: true,
              timestamp: Date.now(),
              targetTitle: document.title || 'halaman baru',
              fullscreen: isBubbleFullscreen
            })
          );
        } catch (_) {}
      }
    });

    const ensureAudioUnmuted = () => {
      if (micAudioCtx && micAudioCtx.state === 'suspended') micAudioCtx.resume().catch(() => {});
      if (playAudioCtx && playAudioCtx.state === 'suspended') playAudioCtx.resume().catch(() => {});
    };
    window.addEventListener('click', ensureAudioUnmuted, { passive: true });
    window.addEventListener('touchstart', ensureAudioUnmuted, { passive: true });
    window.addEventListener('pointerdown', ensureAudioUnmuted, { passive: true });
  }
})(typeof window === 'undefined' ? globalThis : window);
