import fs from 'node:fs';
import path from 'node:path';

let cachedKnowledge = null;

function loadKnowledge() {
  if (cachedKnowledge && Array.isArray(cachedKnowledge)) {
    return cachedKnowledge;
  }
  try {
    const candidates = [
      path.join(process.cwd(), 'app/src/main/assets/apps/shared/amy-local-knowledge.js'),
      '/root/Amy-fx-pro/app/src/main/assets/apps/shared/amy-local-knowledge.js',
      '/root/Amy-fx/app/src/main/assets/apps/shared/amy-local-knowledge.js'
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const jsonMatch = raw.match(/window\.AmyLocalKnowledge\s*=\s*(\[[\s\S]*?\]);?\s*$/);
        if (jsonMatch && jsonMatch[1]) {
          cachedKnowledge = JSON.parse(jsonMatch[1]);
          return cachedKnowledge;
        }
      }
    }
  } catch (_) {}
  return [];
}

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

function findBestLesson(query, knowledge) {
  if (!query || !Array.isArray(knowledge) || !knowledge.length) return null;
  const q = String(query).toLowerCase().trim();

  // 1. Direct title exact match
  let match = knowledge.find(k => k.title && k.title.toLowerCase() === q);
  if (match) return match;

  // 2. Modul atau Bagian match (e.g. "modul 2" or "bagian 05")
  const modulMatch = q.match(/(?:modul|bagian)\s*0?(\d+)/i);
  if (modulMatch) {
    const num = String(modulMatch[1]).padStart(2, '0');
    match = knowledge.find(k => k.path && (k.path.includes(`bagian-${num}`) || k.path.includes(`modul-${num}`)));
    if (match) return match;
  }

  // 3. Level match (e.g. "level 0" or "level 1")
  const levelMatch = q.match(/level\s*(\d+)/i);
  if (levelMatch) {
    const num = levelMatch[1];
    match = knowledge.find(k => k.path && k.path.includes(`level-${num}`));
    if (match) return match;
  }

  // 4. Keyword match in title
  const terms = q.split(/\s+/).filter(t => t.length > 2 && !['apa', 'itu', 'cara', 'yang', 'dan', 'di', 'ke', 'materi', 'bab', 'buka', 'pelajari', 'jelaskan', 'ringkum'].includes(t));
  if (terms.length) {
    match = knowledge.find(k => {
      const t = (k.title || '').toLowerCase();
      return terms.every(term => t.includes(term));
    });
    if (match) return match;

    match = knowledge.find(k => {
      const t = (k.title || '').toLowerCase();
      return terms.some(term => t.includes(term));
    });
    if (match) return match;
  }

  // 5. Search in text content
  if (terms.length > 1) {
    match = knowledge.find(k => {
      const txt = (k.text || '').toLowerCase();
      return terms.every(term => txt.includes(term));
    });
    if (match) return match;
  }

  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const knowledge = loadKnowledge();

  let body = {};
  if (req.method === 'POST') {
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch (_) {
      body = {};
    }
  }

  const query = req.query?.q || body.query || '';
  const lastRead = body.lastRead || null;
  const history = Array.isArray(body.history) ? body.history : [];

  let lessonDetails = null;
  let requestedLesson = null;

  // Process requested lesson if query exists
  if (query) {
    let searchQ = query;
    const isGenericRef = /\b(materi itu|materinya|buka materi itu|buka materinya|materi terakhir|terakhir|yang tadi|tadi|lanjutkan|materi ini)\b/i.test(query);
    if (isGenericRef && lastRead && (lastRead.title || lastRead.path)) {
      searchQ = lastRead.title || lastRead.path;
    }
    const found = findBestLesson(searchQ, knowledge);
    if (found) {
      const realHtmlPath = resolveLessonHtmlPath(found.path);
      requestedLesson = {
        title: found.title,
        relPath: realHtmlPath.replace(/^apps\/academy\//, ''),
        fullPath: realHtmlPath,
        summary: (found.text || '').slice(0, 1500),
        fullText: found.text || '',
        nextLessonTitle: '',
        nextLessonPath: ''
      };
    }
  }

  // Process lastRead details
  if (lastRead && (lastRead.title || lastRead.path)) {
    const foundLast = findBestLesson(lastRead.title || lastRead.path, knowledge);
    if (foundLast) {
      const realLastPath = resolveLessonHtmlPath(foundLast.path);
      lessonDetails = {
        title: foundLast.title,
        relPath: realLastPath.replace(/^apps\/academy\//, ''),
        fullPath: realLastPath,
        summary: (foundLast.text || '').slice(0, 1500),
        fullText: foundLast.text || '',
        nextLessonTitle: '',
        nextLessonPath: '',
        nextLessonSummary: ''
      };
    }
  }

  const catalogText =
    `KURIKULUM RESMI AMY FX ACADEMY:\n` +
    `• Level 0 — Fondasi Berdagang Tanpa Grafik (Logika Jual-Beli, Lot, Spread, Leverage)\n` +
    `• Level 1 — Candlestick & Swing Structure (Anatomi Lilin, High/Low, Close adalah Raja)\n` +
    `• Level 2 — Dealing Range & Equilibrium (Premium > 52.5%, Discount < 47.5%, OTE 78.6%)\n` +
    `• Level 3 — Likuiditas Institusional & Pool (BSL, SSL, Internal/External Liquidity, Sweep vs Run)\n` +
    `• Level 4 — Imbalance & Fair Value Gap / FVG (BISI, SIBI, CE 50%, Inversion IFVG)\n` +
    `• Level 5 — Order Block & Breaker Block (Validasi Displacement, Mitigasi, Failure Swing)\n` +
    `• Level 6 — Eksekusi Sniper M15 & M5 Target 100 Pips WITA (Dealing Range, Killzone, CISD, MSS)`;

  return res.status(200).json({
    ok: true,
    totalLessons: knowledge.length,
    state: { lastRead, history },
    lessonDetails,
    requestedLesson,
    catalogText
  });
}
