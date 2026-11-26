import { isValidGeminiApiKey } from '../lib/amy-assistant-engine.mjs';
import handleGeminiConfig, { resolveGeminiApiKey } from '../lib/api-gemini-config.mjs';
import handleAcademyReading from '../lib/api-academy-reading.mjs';

export default async function handler(req, res) {
  const route = String(req.query?.__route || '').trim();
  if (route === 'gemini-config') return handleGeminiConfig(req, res);
  if (route === 'academy-reading') return handleAcademyReading(req, res);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const apiKey = resolveGeminiApiKey();

  if (!isValidGeminiApiKey(apiKey)) {
    return res.status(200).json({ ok: false, code: 'NO_VALID_KEY', error: 'API Key Gemini belum aktif, menggunakan mesin lokal Amy.' });
  }

  try {
    let payload = req.body;
    if (typeof payload === 'string' && payload) {
      try { payload = JSON.parse(payload); } catch (_) { payload = {}; }
    } else if (!payload || typeof payload !== 'object') {
      payload = {};
    }

    const message = String(payload.message || '').trim();
    const appContext = String(payload.appContext || '').trim();
    const imageBase64 = payload.imageBase64 ? String(payload.imageBase64).replace(/^data:image\/\w+;base64,/, '') : '';
    const history = Array.isArray(payload.history) ? payload.history.slice(-10) : [];

    const isAskingDeep = /\b(full|lengkap|buka|pelajari|jelaskan|materi|modul|level|bab|evaluasi|analisa|breakdown|bandingkan)\b/i.test(message);

    const sysPrompt =
      `Kamu adalah AMY (✦ AMY), asisten trading XAU/USD (Gold) yang 100% terhubung ke seluruh fitur aplikasi Amy FX Pro.\n` +
      `Panggil pengguna dengan sebutan "Sayang" dengan nada hangat, tajam, suportif, jujur, dan profesional dalam Bahasa Indonesia.\n\n` +
      `FOKUS & PROFIL TRADING SAYANG:\n` +
      `• Spesialisasi penuh: Pure Gold Scalper (XAU/USD) timeframe M15 & M5 dengan zona waktu acuan WITA (UTC+8).\n` +
      `• Istilah standar ICT/Pro: Support/Demand, Resistance/Supply, No-Trade Zone (EQ 45–55%), Dealing Range (Breakdown/Diskon/EQ/Premium/Breakout), PDH/PDL, PWH/PWL, Asia High/Low, OB + 50% CE, FVG, BSL/SSL, BOS/MSS, Sweep, ADR.\n` +
      `• Prinsip Anti-Yes-Man: Jika harga di No-Trade Zone tengah, baru Breakdown tanpa MSS M5, atau sedang News Lock High Impact / akhir pekan, wajib ingatkan Sayang dengan jujur untuk menunggu konfirmasi.\n` +
      `• Jika ditanya hal di luar trading/aplikasi, arahkan kembali dengan lembut dan singkat bahwa kamu fokus penuh menjadi partner trading Gold & asisten semua modul Amy FX Pro.\n\n` +
      `KONEKSI PENUH KE SEMUA FITUR AMY FX PRO (DATA LIVE DI BAWAH):\n` +
      `Kamu memiliki akses langsung ke:\n` +
      `1. Mapping Cockpit & Chart Gold (harga live, Dealing Range %, OB/FVG/CE, BSL/SSL valid, BOS/MSS H1/M15/M5, Dual-Layer POI BUY/SELL + 5-Point Verdict Gate, Riwayat Reaksi & Respect Rate POI hari ini, serta status Pasar Tutup Akhir Pekan).\n` +
      `2. Market Intel (Kompas Fundamental, Kalender USD aktual vs forecast + countdown WITA, berita Fokus Gold, status News Lock).\n` +
      `3. Jurnal Trading & Psikologi (pemisahan akun REAL vs SIM/Backtest, Analitik Pro: Net PnL, Win Rate, Profit Factor, Expectancy, Max Drawdown, Evaluasi Mingguan 7H, jam profit WITA, Leak Cost pola emosi/kesalahan, Habits & Streak Disiplin, serta Daily Loss Guard).\n` +
      `4. Kalkulator Lot & Risiko XAU/USD (hitung lot presisi Standard & saran Cent bila < 0.01 lot, risiko $ & pips, proyeksi TP1 1:1.5R / TP2 1:3R).\n` +
      `5. Amy FX Academy Jalur Penguasaan 43 Modul ICT (tanpa level, sistem kunci Uji Paham >=80% ala Duolingo + Tes Loncat Dasar MT5, mencakup DOL mendalam, Breaker/Mitigation/Unicorn, BPR/NWOG/NDOG, SMT Divergence XAU vs Silver/DXY, MMXM, ICT Macros/Weekly Profile/IPDA, StdDev/CRT, hingga Capstone Mapping Chart Kosong), Glosarium ICT, dan Trading Practice 100 Kasus ICT (8 Pilar + Mastery & kesalahan terakhir).\n\n` +
      `DATA REAL-TIME APLIKASI SAAT INI:\n${appContext || 'Belum ada konteks spesifik yang dimuat.'}\n\n` +
      `ATURAN ANTI-HALUSINASI & FORMAT:\n` +
      `• DILARANG mengarang angka harga Gold, statistik jurnal, respect rate POI, atau angka kalender. Gunakan HANYA angka dari DATA REAL-TIME di atas. Jika suatu data kosong/belum tersedia, katakan jujur apa adanya.\n` +
      `• Jika Pasar Tutup Akhir Pekan (Jumat 17:00 NY s.d. Minggu 17:00 NY), jelaskan jujur bahwa harga terakhir adalah penutupan Jumat dan jangan sarankan eksekusi live.\n` +
      `• Jawab langsung di tempat secara padat, terstruktur, dan siap eksekusi. Gunakan **tebal** untuk angka/level kunci dan tanda bulat (•) untuk poin.\n` +
      `• Jangan menyuruh pengguna membuka halaman lain hanya untuk melihat angka yang sudah tersedia di DATA REAL-TIME di atas.`;

    const contents = [];
    for (const h of history) {
      if (!h || !h.text) continue;
      contents.push({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(h.text) }]
      });
    }

    const userParts = [];
    if (imageBase64) {
      userParts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    }
    userParts.push({ text: message || 'Tolong analisa gambar chart dan konteks aplikasi saat ini.' });
    contents.push({ role: 'user', parts: userParts });

    // Free-tier compatible active Gemini models — flash-lite first for fast, zero-503 free-tier responses
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-4-hydrogen'];
    let replyText = '';
    let usedModel = '';
    let lastStatus = 0;
    const maxTokens = isAskingDeep ? 1400 : 950;

    for (const m of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(apiKey)}`;
        // Do not pass deprecated sampling parameters (temperature/topP/topK) or thinkingBudget to gemini-4-*
        const generationConfig = m.startsWith('gemini-4-')
          ? { maxOutputTokens: maxTokens }
          : { maxOutputTokens: maxTokens };
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build'
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sysPrompt }] },
            contents,
            generationConfig
          }),
          signal: AbortSignal.timeout(14000)
        });
        lastStatus = resp.status;
        if (resp.ok) {
          const result = await resp.json();
          const parts = result?.candidates?.[0]?.content?.parts || [];
          const candidateText = parts.filter(p => !p.thought && p.text).map(p => p.text).join('').trim() || parts[0]?.text || '';
          if (candidateText) {
            replyText = candidateText;
            usedModel = m;
            break;
          }
        }
      } catch (_) {}
    }

    if (!replyText) {
      return res.status(200).json({
        ok: false,
        code: lastStatus === 429 ? 'RATE_LIMITED' : 'UPSTREAM_UNAVAILABLE',
        error: 'Koneksi Gemini sedang sibuk atau kuota tercapai, menampilkan data langsung dari aplikasi.'
      });
    }

    return res.status(200).json({ ok: true, reply: replyText, model: usedModel });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Internal Server Error' });
  }
}
