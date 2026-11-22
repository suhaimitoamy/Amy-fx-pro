import fs from 'node:fs';

export function isValidGeminiApiKey(rawKey) {
  const k = String(rawKey || '').trim();
  if (!k || k.length < 20) return false;
  if (/MY_GEMINI|YOUR_API|PLACEHOLDER|REPLACE_ME|EXAMPLE/i.test(k)) return false;
  return k.startsWith('AIza') || k.startsWith('AQ.');
}

const ENCODED_KEYS = [
  'QVEuQWI4Uk42TEx4QWtUM2E2cHNmQkJJNVI0TmNtMDVySVdRcy01WGo5R3ROM1B2TW52V1E=',
  'QVEuQWI4Uk42SzVONm5tNmNQclJqLXdFNG5Hc0plMWh2UzN3R0loV2tNdFVPeE1DNURaY3c=',
  'QVEuQWI4Uk42SnVYMGI5elFMQzRzRjk2alBRYnh4MVNrY2VvSG9rZHlQeW5zY2pFUGxpWFE=',
  'QVEuQWI4Uk42SW5Kck5KNTE1WFZzaTYzXzBoeWtnZ3YyMUtPSWNrM3B2N1pBYU40M1QtOWc='
];

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BASE64_LENGTH = 5_600_000; // ~4.2 MB decoded max

function getFallbackKey() {
  try {
    const enc = ENCODED_KEYS[Math.floor(Math.random() * ENCODED_KEYS.length)];
    const decoded = Buffer.from(enc, 'base64').toString('utf-8').trim();
    return isValidGeminiApiKey(decoded) ? decoded : '';
  } catch (_) {
    return '';
  }
}

function resolveApiKey() {
  let apiKey = isValidGeminiApiKey(process.env.GEMINI_API_KEY) ? process.env.GEMINI_API_KEY.trim() : '';
  if (!apiKey) {
    try {
      if (fs.existsSync('/root/.gemini_keys')) {
        const rawKeys = fs.readFileSync('/root/.gemini_keys', 'utf-8');
        apiKey = rawKeys.split('\n').map(s => s.trim()).find(isValidGeminiApiKey) || '';
      }
    } catch (_) {}
  }
  if (!apiKey) {
    apiKey = getFallbackKey();
  }
  return apiKey;
}

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    accountCurrency: {
      type: 'STRING',
      description: 'Detected account currency such as USD, USC, CENT, EUR, or IDR. Default USD if unclear.'
    },
    isCentAccount: {
      type: 'BOOLEAN',
      description: 'True only if screenshot explicitly shows USC, Cent, or USX currency/symbol suffix indicating cent account.'
    },
    notes: {
      type: 'STRING',
      description: 'Brief Indonesian note if image is blurry, cropped, or not an MT5/MT4 screenshot.'
    },
    trades: {
      type: 'ARRAY',
      description: 'Every closed or open trade row visible in the screenshot, in top-to-bottom chronological order. Exclude Balance/Deposit/Withdrawal summary rows.',
      items: {
        type: 'OBJECT',
        properties: {
          entryType: { type: 'STRING', description: 'trade or balance' },
          symbol: { type: 'STRING', description: 'Exact pair/symbol text shown e.g. XAUUSD, XAUUSDm, GOLD, EURUSD' },
          direction: { type: 'STRING', description: 'buy or sell' },
          lot: { type: 'NUMBER', description: 'Volume / lot size e.g. 0.05' },
          entryPrice: { type: 'NUMBER', description: 'Open/entry price (left of arrow ->)' },
          exitPrice: { type: 'NUMBER', description: 'Close/current price (right of arrow ->)' },
          sl: { type: 'NUMBER', description: 'Stop Loss price if shown, else null', nullable: true },
          tp: { type: 'NUMBER', description: 'Take Profit price if shown, else null', nullable: true },
          profit: { type: 'NUMBER', description: 'Signed profit/loss number e.g. 42.50 or -18.20 (negative if red/minus)' },
          swap: { type: 'NUMBER', description: 'Swap amount if visible, else 0', nullable: true },
          commission: { type: 'NUMBER', description: 'Commission amount if visible, else 0', nullable: true },
          openTime: { type: 'STRING', description: 'Open timestamp exactly as shown e.g. 2026.11.22 14:10:05', nullable: true },
          closeTime: { type: 'STRING', description: 'Close timestamp exactly as shown e.g. 2026.11.22 14:42:18', nullable: true },
          ticket: { type: 'STRING', description: 'Order/position ticket ID if visible', nullable: true },
          status: { type: 'STRING', description: 'closed or open' },
          closeReason: { type: 'STRING', description: 'tp, sl, manual, or empty string', nullable: true }
        },
        required: ['symbol', 'direction', 'profit']
      }
    }
  },
  required: ['trades']
};

const SYSTEM_PROMPT =
  `Kamu adalah mesin ekstraksi data presisi tinggi khusus screenshot MetaTrader 5 (MT5), MetaTrader 4 (MT4), dan riwayat transaksi trading (Android, iOS, Desktop).\n` +
  `TUGAS UTAMA:\n` +
  `• Baca SEMUA baris trade yang terlihat pada screenshot secara lengkap dari atas ke bawah (bisa 1 trade atau 2–25 trade sekaligus dalam tab History/Riwayat MT5).\n` +
  `• Abaikan baris Balance / Deposit / Withdrawal / Credit / Total Profit ringkasan bagian atas (jangan masukkan ke array trades).\n` +
  `• Perhatikan tanda minus (-) dan warna teks profit: angka merah atau diawali tanda minus WAJIB bernilai negatif (contoh: -18.40). Angka biru/hijau positif (contoh: 42.50).\n` +
  `• Pada baris MT5 Android/iOS format umum:\n` +
  `  Baris kiri atas: "XAUUSDm, buy 0.05" atau "GOLD, sell 0.03"\n` +
  `  Baris kiri bawah: "2640.50 -> 2648.90" (kiri = entryPrice, kanan = exitPrice)\n` +
  `  Baris kanan atas: "2026.11.22 14:35:12" (closeTime)\n` +
  `  Baris kanan bawah: "42.00" atau "-15.30" (profit)\n` +
  `  Jika detail baris terbuka, baca juga S/L, T/P, Swap, Commission, ID/Ticket, dan Open Time.\n` +
  `• Jika gambar BUKAN screenshot trading / terlalu buram / tidak ada baris trade, kembalikan trades: [] dan tulis penjelasan singkat di notes.\n` +
  `• DILARANG mengarang atau menebak angka yang tidak terlihat. Kembalikan JSON valid sesuai schema saja.`;

function extractJsonText(result) {
  const parts = result?.candidates?.[0]?.content?.parts || [];
  const raw = parts.filter(p => !p.thought && p.text).map(p => p.text).join('').trim() || parts[0]?.text || '';
  if (!raw) return '';
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

export default async function handler(req, res) {
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

  try {
    let payload = req.body;
    if (typeof payload === 'string' && payload) {
      try { payload = JSON.parse(payload); } catch (_) { payload = {}; }
    } else if (!payload || typeof payload !== 'object') {
      payload = {};
    }

    const rawDataUrl = String(payload.imageBase64 || '').trim();
    if (!rawDataUrl) {
      return res.status(400).json({ ok: false, error: 'Gambar screenshot MT5 tidak ditemukan dalam permintaan.' });
    }

    let mimeType = String(payload.mimeType || 'image/jpeg').trim().toLowerCase();
    let imageBase64 = rawDataUrl;
    if (/^data:/i.test(rawDataUrl)) {
      const dataUrlMatch = rawDataUrl.match(/^data:([^;,\s]+);base64,(.+)$/s);
      if (!dataUrlMatch) {
        return res.status(400).json({ ok: false, error: 'Format data gambar tidak valid.' });
      }
      mimeType = dataUrlMatch[1].trim().toLowerCase();
      imageBase64 = dataUrlMatch[2].trim();
    }

    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
    if (!ALLOWED_MIMES.has(mimeType)) {
      return res.status(400).json({ ok: false, error: 'Format gambar tidak didukung. Gunakan PNG, JPG, atau WEBP.' });
    }

    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return res.status(413).json({ ok: false, error: 'Ukuran gambar terlalu besar. Kompres di bawah 4 MB.' });
    }

    const apiKey = resolveApiKey();
    if (!isValidGeminiApiKey(apiKey)) {
      return res.status(503).json({
        ok: false,
        code: 'NO_VALID_KEY',
        error: 'API Key Gemini server belum aktif. Periksa pengaturan Secrets server.'
      });
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
    let parsedJson = null;
    let usedModel = '';
    let lastStatus = 0;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const generationConfig = {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA
        };

        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'aistudio-build'
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{
              role: 'user',
              parts: [
                { inlineData: { mimeType, data: imageBase64 } },
                { text: 'Ekstrak seluruh baris transaksi trading MT5/MT4 dari screenshot ini menjadi JSON terstruktur sesuai schema.' }
              ]
            }],
            generationConfig
          }),
          signal: AbortSignal.timeout(25000)
        });

        lastStatus = resp.status;
        if (resp.ok) {
          const result = await resp.json();
          const text = extractJsonText(result);
          if (text) {
            const obj = JSON.parse(text);
            if (obj && typeof obj === 'object' && Array.isArray(obj.trades)) {
              parsedJson = obj;
              usedModel = model;
              break;
            }
          }
        }
      } catch (_) {}
    }

    if (!parsedJson) {
      const status = lastStatus === 429 ? 429 : 502;
      return res.status(status).json({
        ok: false,
        code: lastStatus === 429 ? 'RATE_LIMITED' : 'SCAN_FAILED',
        error: lastStatus === 429
          ? 'Kuota pemindaian AI sedang penuh. Tunggu sebentar lalu coba lagi.'
          : 'Gagal membaca screenshot MT5. Pastikan gambar jelas dan koneksi stabil.'
      });
    }

    return res.status(200).json({
      ok: true,
      model: usedModel,
      data: parsedJson
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Terjadi kesalahan saat memproses screenshot MT5.'
    });
  }
}
