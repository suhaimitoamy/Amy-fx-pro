/**
 * Amy FX Pro — Shared Pure Logic Engine for Amy Live Assistant (Chat + Voice + Local Pro Engine)
 * Zero external dependencies; safe for Node (ESM) and unit testing.
 */

export function isValidGeminiApiKey(rawKey) {
  const k = String(rawKey || '').trim();
  if (!k || k.length < 20) return false;
  if (/MY_GEMINI|YOUR_API|PLACEHOLDER|REPLACE_ME|EXAMPLE/i.test(k)) return false;
  return k.startsWith('AIza') || k.startsWith('AQ.');
}

export function normQuery(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9/$.%\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Smart Intent Router — determines exactly which Amy FX Pro modules need to be fetched
 * so simple queries stay fast, free-tier quota is preserved, and irrelevant links/screenshots never fire.
 */
export function detectAssistantIntents(rawQuery) {
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

  // Personal journal query shouldn't pull heavy Mapping unless explicitly asked
  const filteredModules = (modules.includes('journal') && !wantsAll &&
    !/\b(mapping|harga|xau|gold|emas|chart|grafik|sinyal|bias|poi|ob|fvg|dealing range|bsl|ssl|respect|riwayat poi|riwayat reaksi|weekend|akhir pekan|pasar tutup)\b/i.test(q))
    ? modules.filter(m => m !== 'mapping')
    : modules;

  // Explicit navigation command ONLY (never trigger on info questions)
  const explicitNav =
    /\b(buka halaman|buka menu|buka tab|pindah ke|pindahkan ke|arahkan ke|tampilkan halaman|masuk ke|pergi ke)\b/i.test(q) ||
    /^(buka|lihat|ke)\s+(halaman\s+)?(beranda|home|mapping|chart gold|berita|kalender|market intel|jurnal|academy|akademi|kalkulator|glosarium|practice|latihan|replay)\b/i.test(q);

  let navTarget = null;
  if (explicitNav) {
    if (/\b(mapping|chart gold|peta harga)\b/i.test(q)) navTarget = 'mapping';
    else if (/\b(berita|kalender|market intel|kompas)\b/i.test(q)) navTarget = 'market_intel';
    else if (/\b(jurnal|journal|habit)\b/i.test(q)) navTarget = 'journal';
    else if (/\b(practice|latihan|replay|backtest|simulasi)\b/i.test(q)) navTarget = 'practice';
    else if (/\b(kalkulator|resiko|risiko)\b/i.test(q)) navTarget = 'kalkulator';
    else if (/\b(glosarium|kamus)\b/i.test(q)) navTarget = 'glosarium';
    else if (/\b(academy|akademi|tutorial|materi)\b/i.test(q)) navTarget = 'academy';
    else if (/\b(beranda|home)\b/i.test(q)) navTarget = 'home';
  }

  // Strict chart screenshot trigger — ONLY when clearly discussing XAU/chart visual on screen
  const wantsChartVision =
    /\b(chart di layar|grafik di layar|analisa chart|analisis chart|baca chart|lihat chart|candle di layar|chart gold|pola candle|struktur candle|screenshot chart)\b/i.test(q) ||
    (/\b(chart|grafik|candle)\b/i.test(q) && /\b(gold|xau|emas|m15|m5|h1|layar|sekarang|ini)\b/i.test(q));

  // Explicit timeframe switch command
  let switchTimeframe = null;
  if (/\b(ganti|ubah|pindah|switch|lihat)\b/i.test(q) && /\b(m5|m15|h1|5 menit|15 menit)\b/i.test(q)) {
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

/**
 * Parses natural Bahasa Indonesia XAU/USD risk/lot queries and computes exact lot size.
 * Standard Gold (XAU/USD): 1.00 lot = $100 per $1.00 price move ($10 per 10 pips / $1 per pip).
 * 0.01 lot = $1.00 per $1.00 price move ($0.10 per pip; 1 pip = $0.10 price move).
 */
export function calculateGoldLotFromQuery(rawQuery, defaults = {}) {
  const text = String(rawQuery || '').replace(/,/g, '.');
  const lower = text.toLowerCase();

  const balMatch = lower.match(/(?:modal|saldo|balance|ekuitas|equity|akun)\s*(?:rp|usd|\$)?\s*(\d+(?:\.\d+)?)/i)
    || lower.match(/\$\s*(\d+(?:\.\d+)?)\b/);
  const riskPctMatch = lower.match(/(?:risiko|risk|resiko)\s*(\d+(?:\.\d+)?)\s*%/i)
    || lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:risiko|risk|resiko)?/i);
  const riskUsdMatch = lower.match(/(?:risiko|risk|resiko)\s*\$\s*(\d+(?:\.\d+)?)/i);
  const entryMatch = lower.match(/(?:entry|masuk|buy|sell|harga)\s*(?:di|at|@)?\s*\$?\s*(\d{3,4}(?:\.\d+)?)/i);
  const slPriceMatch = lower.match(/(?:sl|stop\s*loss)\s*(?:di|at|@)?\s*\$?\s*(\d{3,4}(?:\.\d+)?)/i);
  const slPipsMatch = lower.match(/(?:sl|stop\s*loss|jarak)\s*(\d+(?:\.\d+)?)\s*(?:pips?|pip)/i);
  const slPtsMatch = lower.match(/(?:sl|stop\s*loss|jarak)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:poin|pts?|point|dollar|dolar)/i);

  const balance = balMatch ? Number(balMatch[1]) : Number(defaults.balance || 1000);
  const riskPct = riskPctMatch ? Number(riskPctMatch[1]) : Number(defaults.riskPct || 1.0);
  const entry = entryMatch ? Number(entryMatch[1]) : (Number(defaults.livePrice) || null);
  const slPrice = slPriceMatch ? Number(slPriceMatch[1]) : null;

  let slPoints = null;
  if (entry && slPrice && Math.abs(entry - slPrice) > 0.05) {
    slPoints = Math.abs(entry - slPrice);
  } else if (slPipsMatch) {
    slPoints = Number(slPipsMatch[1]) / 10; // 10 pips = $1.00 on XAU/USD
  } else if (slPtsMatch) {
    slPoints = Number(slPtsMatch[1]);
  }

  if (!Number.isFinite(balance) || balance <= 0 || !Number.isFinite(slPoints) || slPoints <= 0) {
    return {
      ok: false,
      needsInput: true,
      balance: Number.isFinite(balance) && balance > 0 ? balance : 1000,
      riskPct: Number.isFinite(riskPct) && riskPct > 0 ? riskPct : 1.0,
      message:
        `Untuk hitung lot XAU/USD presisi, sebutkan jarak SL (atau harga Entry & SL), Sayang.\n` +
        `• Contoh: "Modal $500 risiko 1% entry 3708 SL 3715" atau "Saldo $1000 risk 1% SL 50 pips".`
    };
  }

  const riskUsd = riskUsdMatch ? Number(riskUsdMatch[1]) : (balance * (riskPct / 100));
  const slPips = Math.round(slPoints * 10);
  // XAU/USD: $1 move at 1.00 lot = $100 -> lot = riskUsd / (slPoints * 100)
  const rawLot = riskUsd / (slPoints * 100);
  const safeLot = Math.max(0.01, Math.floor(rawLot * 100) / 100);
  const actualRiskUsd = safeLot * slPoints * 100;
  const actualRiskPct = (actualRiskUsd / balance) * 100;

  let direction = null;
  let tp1 = null;
  let tp2 = null;
  if (entry && slPrice) {
    direction = entry > slPrice ? 'BUY' : 'SELL';
    tp1 = direction === 'BUY' ? entry + slPoints * 1.5 : entry - slPoints * 1.5;
    tp2 = direction === 'BUY' ? entry + slPoints * 3.0 : entry - slPoints * 3.0;
  }

  const warnOverMin = rawLot < 0.01;
  const lines = [
    `**Kalkulator Lot & Risiko XAU/USD**`,
    `• Modal Akun: **$${balance.toFixed(2)}** | Target Risiko: **${riskPct.toFixed(1)}% ($${riskUsd.toFixed(2)})**`,
    entry && slPrice
      ? `• Setup **${direction}**: Entry **$${entry.toFixed(2)}** | SL **$${slPrice.toFixed(2)}** (Jarak **$${slPoints.toFixed(2)} / ${slPips} pips**)`
      : `• Jarak Stop Loss: **$${slPoints.toFixed(2)} (${slPips} pips)**`,
    `• Ukuran Lot Rekomendasi: **${safeLot.toFixed(2)} LOT** (Risiko aktual: **-$${actualRiskUsd.toFixed(2)}** / ${actualRiskPct.toFixed(2)}%)`
  ];

  if (tp1 && tp2) {
    lines.push(`• Proyeksi TP1 (1:1.5R): **$${tp1.toFixed(2)}** (+$${(actualRiskUsd * 1.5).toFixed(2)}) | TP2 Runner (1:3R): **$${tp2.toFixed(2)}** (+$${(actualRiskUsd * 3).toFixed(2)})`);
  }
  if (warnOverMin) {
    lines.push(`• Peringatan: Lot ideal (${rawLot.toFixed(3)}) di bawah minimum 0.01 lot standar. Risiko 0.01 lot = ${actualRiskPct.toFixed(2)}% — pertimbangkan akun Cent (XAUUSDc) atau perketat SL di struktur M5.`);
  }

  return {
    ok: true,
    balance,
    riskPct,
    riskUsd: Number(riskUsd.toFixed(2)),
    slPoints: Number(slPoints.toFixed(2)),
    slPips,
    lot: Number(safeLot.toFixed(2)),
    actualRiskUsd: Number(actualRiskUsd.toFixed(2)),
    actualRiskPct: Number(actualRiskPct.toFixed(2)),
    direction,
    entry,
    slPrice,
    tp1: tp1 ? Number(tp1.toFixed(2)) : null,
    tp2: tp2 ? Number(tp2.toFixed(2)) : null,
    warnOverMin,
    text: lines.join('\n')
  };
}

/**
 * Computes synchronized Mapping & Dealing Range snapshot so Amy matches Mapping Cockpit 100%.
 */
export function buildMappingSnapshotSummary(ctx, domPrice = null) {
  if (!ctx || typeof ctx !== 'object') return null;

  const livePrice = Number(domPrice) > 0
    ? Number(domPrice)
    : (Number(ctx.price || ctx.livePrice || ctx.close || 0) || null);

  const dr = ctx.m15?.dealingRange || null;
  const rHigh = Number(dr?.rangeHigh || dr?.high || 0);
  const rLow = Number(dr?.rangeLow || dr?.low || 0);
  const eq = Number(dr?.eq || (rHigh && rLow ? (rHigh + rLow) / 2 : 0));

  let pct = 50;
  let zoneLabel = 'EQUILIBRIUM · 50%';
  let isBreakdown = false;
  let isBreakout = false;
  let isNoTradeEq = false;

  if (livePrice && rHigh > rLow) {
    const rawPct = ((livePrice - rLow) / (rHigh - rLow)) * 100;
    pct = Math.max(0, Math.min(100, Math.round(rawPct)));
    if (livePrice < rLow) {
      isBreakdown = true;
      zoneLabel = 'BREAKDOWN · 0%';
    } else if (livePrice > rHigh) {
      isBreakout = true;
      zoneLabel = 'BREAKOUT · 100%';
    } else if (pct >= 45 && pct <= 55) {
      isNoTradeEq = true;
      zoneLabel = `NO-TRADE EQ · ${pct}%`;
    } else if (pct > 55) {
      zoneLabel = `PREMIUM · ${pct}%`;
    } else {
      zoneLabel = `DISKON · ${pct}%`;
    }
  }

  // Filter strictly valid unconsumed liquidity levels relative to livePrice
  const liqList = Array.isArray(ctx.liquidity) ? ctx.liquidity : [];
  let bslAbove = null;
  let sslBelow = null;
  if (livePrice) {
    const above = liqList
      .filter(l => Number(l.level) > livePrice && /bsl|pdh|pwh|asia high|high/i.test(`${l.label} ${l.kind || ''}`))
      .sort((a, b) => Number(a.level) - Number(b.level));
    const below = liqList
      .filter(l => Number(l.level) < livePrice && /ssl|pdl|pwl|asia low|low/i.test(`${l.label} ${l.kind || ''}`))
      .sort((a, b) => Number(b.level) - Number(a.level));
    bslAbove = above[0] || (rHigh > livePrice ? { label: 'Range High', level: rHigh } : null);
    sslBelow = below[0] || (rLow < livePrice ? { label: 'Range Low', level: rLow } : null);
  }

  const h1Bias = ctx.h1?.bias || 'NEUTRAL';
  const h1Health = ctx.h1?.health || '';
  const m15Control = ctx.m15?.control || 'BALANCED';
  const m15Structure = ctx.m15?.structure || '';
  const m5Status = ctx.m5?.status || 'WAITING';
  const poi = ctx.m15?.poi || null;

  return {
    livePrice,
    rangeHigh: rHigh || null,
    rangeLow: rLow || null,
    eq: eq || null,
    pct,
    zoneLabel,
    isBreakdown,
    isBreakout,
    isNoTradeEq,
    bslAbove: bslAbove ? { label: bslAbove.label, level: Number(bslAbove.level) } : null,
    sslBelow: sslBelow ? { label: sslBelow.label, level: Number(sslBelow.level) } : null,
    h1Bias,
    h1Health,
    m15Control,
    m15Structure,
    m5Status,
    poi,
    primaryLabel: ctx.primary?.label || null,
    primaryArea: ctx.primary?.area || null,
    primaryInvalidation: ctx.primary?.invalidation || null,
    executionStatus: ctx.execution?.status || null,
    executionReason: ctx.execution?.reason || '',
    newsStatus: ctx.news?.status || 'SAFE',
    newsNote: ctx.news?.note || ''
  };
}

/**
 * XSS-safe lightweight Markdown renderer for Amy chat bubbles.
 * Preserves bold, italic, inline code, fenced code blocks, and clean bullet lists.
 */
export function formatAssistantMarkdownToSafeHtml(rawText) {
  const escaped = String(rawText || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Protect fenced code blocks first
  const codeBlocks = [];
  let out = escaped.replace(/```(?:[a-z0-9_-]+)?\n?([\s\S]*?)```/gi, (_, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre class="amy-code-block"><code>${code.trim()}</code></pre>`);
    return `@@CODEBLOCK_${idx}@@`;
  });

  // Headings -> bold line
  out = out.replace(/^[ \t]*#{1,6}[ \t]+(.+)$/gm, '<strong>$1</strong>');
  // Horizontal rules -> subtle spacer
  out = out.replace(/^[ \t]*---+[ \t]*$/gm, '');
  // Bullet points (- or * at start of line) -> •
  out = out.replace(/^[ \t]*[*-][ \t]+/gm, '• ');
  // Bold (**text**)
  out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  // Italic (*text*)
  out = out.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
  // Inline code (`code`)
  out = out.replace(/`([^`\n]+)`/g, '<code class="amy-inline-code">$1</code>');
  // Collapse excess blank lines & convert newlines to <br>
  out = out.replace(/\n{3,}/g, '\n\n').trim().replace(/\n/g, '<br>');

  // Restore code blocks
  out = out.replace(/@@CODEBLOCK_(\d+)@@/g, (_, idx) => codeBlocks[Number(idx)] || '');
  return out;
}
