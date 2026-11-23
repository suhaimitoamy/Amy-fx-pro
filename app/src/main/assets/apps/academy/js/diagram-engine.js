/* Amy FX Academy — Interactive Candlestick & ICT Chart SVG Diagram Engine
 * Pure zero-dependency UMD renderer covering all 30 curriculum diagram blueprints.
 * Dual-theme CSS tokens (--acd-*) ensure crisp contrast in Dark Mode & Light Mode.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AmyAcademyDiagrams = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const VIEW_W = 680;
  const VIEW_H = 300;
  const PLOT = { left: 36, right: 608, top: 30, bottom: 262 };
  const PLOT_W = PLOT.right - PLOT.left;
  const PLOT_H = PLOT.bottom - PLOT.top;

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function clamp(v, min, max) {
    const n = Number(v);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function mapX(pct) {
    return +(PLOT.left + (clamp(pct, 0, 100) / 100) * PLOT_W).toFixed(1);
  }

  function mapY(pct) {
    return +(PLOT.bottom - (clamp(pct, 0, 100) / 100) * PLOT_H).toFixed(1);
  }

  const TONE_MAP = {
    bull: { stroke: 'var(--acd-bull, #22c55e)', fill: 'var(--acd-bull-soft, rgba(34,197,94,0.16))', text: 'var(--acd-bull, #22c55e)' },
    bear: { stroke: 'var(--acd-bear, #ef4444)', fill: 'var(--acd-bear-soft, rgba(239,68,68,0.16))', text: 'var(--acd-bear, #ef4444)' },
    gold: { stroke: 'var(--acd-gold, #f5b942)', fill: 'var(--acd-gold-soft, rgba(245,185,66,0.16))', text: 'var(--acd-gold, #f5b942)' },
    fvg: { stroke: 'var(--acd-fvg-stroke, #38bdf8)', fill: 'var(--acd-fvg-fill, rgba(56,189,248,0.16))', text: 'var(--acd-cyan, #38bdf8)' },
    ob: { stroke: 'var(--acd-ob-stroke, #f5b942)', fill: 'var(--acd-ob-fill, rgba(245,185,66,0.17))', text: 'var(--acd-gold, #f5b942)' },
    sweep: { stroke: 'var(--acd-sweep, #f97316)', fill: 'var(--acd-sweep-soft, rgba(249,115,22,0.16))', text: 'var(--acd-sweep, #f97316)' },
    cyan: { stroke: 'var(--acd-cyan, #38bdf8)', fill: 'var(--acd-fvg-fill, rgba(56,189,248,0.15))', text: 'var(--acd-cyan, #38bdf8)' },
    discount: { stroke: 'var(--acd-bull, #22c55e)', fill: 'var(--acd-bull-soft, rgba(34,197,94,0.09))', text: 'var(--acd-bull, #22c55e)' },
    premium: { stroke: 'var(--acd-bear, #ef4444)', fill: 'var(--acd-bear-soft, rgba(239,68,68,0.09))', text: 'var(--acd-bear, #ef4444)' },
    asia: { stroke: 'var(--acd-cyan, #38bdf8)', fill: 'var(--acd-fvg-fill, rgba(56,189,248,0.11))', text: 'var(--acd-cyan, #38bdf8)' },
    killzone: { stroke: 'var(--acd-gold, #f5b942)', fill: 'var(--acd-gold-soft, rgba(245,185,66,0.13))', text: 'var(--acd-gold, #f5b942)' },
    sl: { stroke: 'var(--acd-bear, #ef4444)', fill: 'var(--acd-bear-soft, rgba(239,68,68,0.18))', text: 'var(--acd-bear, #ef4444)' },
    tp: { stroke: 'var(--acd-bull, #22c55e)', fill: 'var(--acd-bull-soft, rgba(34,197,94,0.16))', text: 'var(--acd-bull, #22c55e)' },
    danger: { stroke: 'var(--acd-bear, #ef4444)', fill: 'var(--acd-bear-soft, rgba(239,68,68,0.2))', text: 'var(--acd-bear, #ef4444)' },
    neutral: { stroke: 'var(--acd-muted, #94a3b8)', fill: 'var(--acd-neutral-soft, rgba(148,163,184,0.12))', text: 'var(--acd-muted, #94a3b8)' },
    muted: { stroke: 'var(--acd-muted, #94a3b8)', fill: 'var(--acd-neutral-soft, rgba(148,163,184,0.12))', text: 'var(--acd-muted, #94a3b8)' }
  };

  function toneOf(name) {
    return TONE_MAP[name] || TONE_MAP.neutral;
  }

  /* ═══════════════════════════════════════════════════════════════════════
   * 36 DIAGRAM BLUEPRINTS (Level 0 Pemula → Level 6 ICT)
   * Every candle tuple: [xPct, open, high, low, close, optHighlight]
   * ═══════════════════════════════════════════════════════════════════════ */
  const BLUEPRINTS = {
    // ── LEVEL 0 (PRA-TRADING & DASAR MT5) ────────────────────────────────
    'zero-account-types': {
      title: 'Peran Broker & Perbandingan Akun Demo, Cent (USC) & Standard',
      pairTag: 'LEVEL 00 · FONDASI AKUN',
      priceLabels: ['Besar', 'Sedang', 'Aman'],
      stages: [
        {
          label: 'Demo vs Cent vs Standard',
          caption: 'Mulai dari Akun Demo (risiko $0), naik ke Akun Cent ($10 = 1.000 USC, rugi latihan hanya sen), baru ke Standard setelah konsisten.',
          bars: [
            { x1: 6, x2: 32, y1: 12, y2: 46, tone: 'cyan', label: 'Akun Demo', sub: 'Virtual · Risiko $0' },
            { x1: 37, x2: 63, y1: 12, y2: 72, tone: 'bull', label: 'Akun Cent (USC)', sub: '$10 = 1.000 USC' },
            { x1: 68, x2: 94, y1: 12, y2: 92, tone: 'gold', label: 'Akun Standard', sub: '100% USD · Pro' }
          ],
          arrows: [
            { x1: 28, y1: 52, x2: 42, y2: 74, tone: 'bull', label: 'Lancar MT5' },
            { x1: 60, y1: 76, x2: 74, y2: 92, tone: 'gold', label: 'Jurnal Stabil' }
          ],
          callouts: [
            { x: 50, y: 6, text: 'Naik bertahap: Demo → Cent → Standard', tone: 'gold' }
          ]
        },
        {
          label: 'Dampak Rugi -$5 di 0.01 Lot',
          caption: 'Dengan modal $20, gerak berlawanan -$5 di Standard memangkas 25% modal, sedangkan di Akun Cent hanya -5 USC ($0,05 / 0,25% modal).',
          bars: [
            { x1: 8, x2: 34, y1: 12, y2: 30, tone: 'cyan', label: 'Demo (0.01)', sub: '-$5 Virtual (Aman)' },
            { x1: 38, x2: 64, y1: 12, y2: 38, tone: 'bull', label: 'Cent (0.01)', sub: '-$0,05 (0,25% Modal)' },
            { x1: 68, x2: 94, y1: 12, y2: 78, tone: 'danger', label: 'Standard (0.01)', sub: '-$5,00 (25% Modal!)' }
          ],
          callouts: [
            { x: 36, y: 93, text: 'Akun Cent melindungi mental & modal pemula', tone: 'bull' }
          ]
        }
      ]
    },

    'zero-bid-ask-spread': {
      title: 'Cara Kerja Garis Bid vs Ask, Spread & Satuan Pips Gold',
      pairTag: 'XAU/USD · BID / ASK / PIPS',
      priceLabels: ['2.655', '2.652', '2.649'],
      stages: [
        {
          label: 'Bid vs Ask & Spread',
          caption: 'BUY dibuka di garis ASK (atas) dan ditutup di BID (bawah), sehingga posisi baru langsung minus tipis sebesar Spread ($0,30).',
          zones: [
            { x1: 10, x2: 90, y1: 48, y2: 62, tone: 'sweep', label: 'SPREAD ($0.30 / 3 PIPS)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 8, x2: 92, y1: 62, y2: 62, style: 'solid', tone: 'bear', label: 'ASK 2.650,30 (Buka BUY / Tutup SELL)', labelSide: 'left' },
            { x1: 8, x2: 92, y1: 48, y2: 48, style: 'solid', tone: 'bull', label: 'BID 2.650,00 (Buka SELL / Tutup BUY)', labelSide: 'left' }
          ],
          candles: [
            [18, 36, 46, 32, 44], [30, 44, 52, 40, 48, 'gold'], [42, 48, 56, 45, 52],
            [56, 52, 72, 50, 68], [70, 68, 82, 65, 78]
          ],
          callouts: [
            { x: 50, y: 16, text: 'Aktifkan Ask Price Line di MT5 agar SL Sell tidak mengejutkan', tone: 'gold' }
          ]
        },
        {
          label: 'Hitung Pips & Point Gold',
          caption: 'Di XAU/USD, perubahan $1,00 = 10 Pips = 100 Points. Naik $5,00 (2.650,00 → 2.655,00) = 50 Pips (500 Points).',
          zones: [
            { x1: 24, x2: 84, y1: 28, y2: 78, tone: 'tp', label: '+$5,00 = 50 PIPS (500 POINTS)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 10, x2: 90, y1: 78, y2: 78, style: 'dashed', tone: 'bull', label: '2.655,00 (Target)', labelSide: 'left' },
            { x1: 10, x2: 90, y1: 38, y2: 38, style: 'dotted', tone: 'cyan', label: '2.651,00 (+$1 = 10 Pips)', labelSide: 'right' },
            { x1: 10, x2: 90, y1: 28, y2: 28, style: 'solid', tone: 'gold', label: '2.650,00 (Entry)', labelSide: 'left' }
          ],
          candles: [
            [20, 24, 30, 20, 28], [32, 28, 40, 26, 38, 'bull'], [46, 38, 54, 36, 52],
            [60, 52, 66, 49, 64], [74, 64, 80, 62, 78, 'bull']
          ],
          callouts: [
            { x: 48, y: 12, text: 'Hafalkan: $1,00 di Gold = 10 Pips = 100 Points', tone: 'bull' }
          ]
        }
      ]
    },

    'zero-lot-margin-meter': {
      title: 'Nilai Lot XAU/USD, Balance vs Equity & Batas Margin Call',
      pairTag: 'XAU/USD · LOT & MARGIN',
      priceLabels: ['Risiko', 'Aman', 'Kecil'],
      stages: [
        {
          label: 'Nilai Gerak $1 per Lot',
          caption: 'Di Akun Standard Gold: 0.01 lot = $1 per gerak $1; 0.05 lot = $5; 0.10 lot = $10. Modal $100 memakai 0.10 lot sangat rawan habis.',
          bars: [
            { x1: 6, x2: 26, y1: 10, y2: 32, tone: 'cyan', label: '0.01 Cent', sub: '$0,01 / $1 gerak' },
            { x1: 29, x2: 50, y1: 10, y2: 48, tone: 'bull', label: '0.01 Std', sub: '$1 / $1 gerak' },
            { x1: 53, x2: 73, y1: 10, y2: 66, tone: 'sweep', label: '0.05 Std', sub: '$5 / $1 gerak' },
            { x1: 76, x2: 96, y1: 10, y2: 82, tone: 'danger', label: '0.10 Std', sub: '$10 / $1 gerak' }
          ],
          callouts: [
            { x: 35, y: 94, text: 'Selalu hitung lot dengan Kalkulator sebelum klik', tone: 'gold' }
          ]
        },
        {
          label: 'Balance vs Equity vs MC',
          caption: 'Balance ($100) adalah saldo tertutup. Jika floating minus -$30, Equity nyata tinggal $70. Jika Equity jatuh ke batas Stop Out = Margin Call!',
          bars: [
            { x1: 8, x2: 34, y1: 12, y2: 78, tone: 'cyan', label: 'Balance', sub: '$100 (Tercatat)' },
            { x1: 38, x2: 64, y1: 12, y2: 58, tone: 'gold', label: 'Equity', sub: '$70 (Nyata -30)' },
            { x1: 68, x2: 94, y1: 12, y2: 28, tone: 'danger', label: 'Stop Out', sub: 'Tutup Paksa (MC)' }
          ],
          lines: [
            { x1: 6, x2: 96, y1: 32, y2: 32, style: 'dashed', tone: 'bear', label: 'ZONA BAHAYA MARGIN CALL', labelSide: 'right' }
          ],
          callouts: [
            { x: 50, y: 94, text: 'Pasang SL + risiko 1%–2% membuat akun kebal MC', tone: 'bull' }
          ]
        }
      ]
    },

    'zero-mt5-order-types': {
      title: 'Peta 5 Jenis Order MT5: Market Execution vs Limit & Stop',
      pairTag: 'MT5 · 5 JENIS ORDER',
      priceLabels: ['2.665', '2.655', '2.645'],
      stages: [
        {
          label: 'Buy Limit & Sell Limit',
          caption: 'LIMIT = tunggu harga menjemput lebih bagus lalu MEMANTUL. Buy Limit dipasang DI BAWAH harga sekarang; Sell Limit DI ATAS harga sekarang.',
          lines: [
            { x1: 8, x2: 92, y1: 78, y2: 78, style: 'dashed', tone: 'bear', label: 'SELL LIMIT (Di Atas)', labelSide: 'left' },
            { x1: 8, x2: 92, y1: 48, y2: 48, style: 'solid', tone: 'gold', label: 'HARGA SEKARANG 2.655', labelSide: 'left' },
            { x1: 8, x2: 92, y1: 18, y2: 18, style: 'dashed', tone: 'bull', label: 'BUY LIMIT (Di Bawah)', labelSide: 'left' }
          ],
          candles: [
            [14, 44, 50, 40, 48], [22, 48, 52, 44, 48, 'gold']
          ],
          arrows: [
            { x1: 46, y1: 50, x2: 64, y2: 76, tone: 'muted', label: 'Naik' },
            { x1: 66, y1: 76, x2: 88, y2: 56, tone: 'bear', label: 'Pantul Sell' },
            { x1: 46, y1: 46, x2: 64, y2: 20, tone: 'muted', label: 'Turun' },
            { x1: 66, y1: 20, x2: 88, y2: 40, tone: 'bull', label: 'Pantul Buy' }
          ],
          callouts: [
            { x: 52, y: 94, text: 'LIMIT = tunggu harga menjemput lalu memantul', tone: 'cyan' }
          ]
        },
        {
          label: 'Buy Stop & Sell Stop',
          caption: 'STOP = ikut searah TEMBUSAN (breakout). Buy Stop dipasang DI ATAS harga sekarang; Sell Stop DI BAWAH harga sekarang.',
          lines: [
            { x1: 8, x2: 92, y1: 72, y2: 72, style: 'dashed', tone: 'bull', label: 'BUY STOP (Tembus Atas)', labelSide: 'left' },
            { x1: 8, x2: 92, y1: 48, y2: 48, style: 'solid', tone: 'gold', label: 'HARGA SEKARANG', labelSide: 'left' },
            { x1: 8, x2: 92, y1: 24, y2: 24, style: 'dashed', tone: 'bear', label: 'SELL STOP (Tembus Bawah)', labelSide: 'left' }
          ],
          candles: [
            [14, 44, 52, 42, 48], [22, 48, 51, 45, 48, 'gold']
          ],
          arrows: [
            { x1: 46, y1: 50, x2: 84, y2: 84, tone: 'bull', label: 'Tembus → Buy' },
            { x1: 46, y1: 46, x2: 84, y2: 12, tone: 'bear', label: 'Tembus → Sell' }
          ],
          callouts: [
            { x: 52, y: 95, text: 'Selalu lengkapi order dengan SL dan TP sebelum Place', tone: 'gold' }
          ]
        }
      ]
    },

    'zero-ohlc-timeframe': {
      title: '4 Titik Harga Candlestick (OHLC) & Pecahan Timeframe',
      pairTag: 'LEVEL 00 · CHART & TIMEFRAME',
      priceLabels: ['High', 'Mid', 'Low'],
      stages: [
        {
          label: '4 Titik Harga (OHLC)',
          caption: 'Lilin Hijau = harga tutup (Close) lebih tinggi dari buka (Open). Lilin Merah = tutup lebih rendah dari buka. Garis tipis = High & Low.',
          candles: [
            [28, 30, 86, 16, 72, 'bull'],
            [70, 72, 86, 16, 30, 'bear']
          ],
          lines: [
            { x1: 10, x2: 28, y1: 86, y2: 86, style: 'dotted', tone: 'muted', label: 'HIGH (Tertinggi)', labelSide: 'left' },
            { x1: 10, x2: 28, y1: 72, y2: 72, style: 'dashed', tone: 'bull', label: 'CLOSE (Tutup)', labelSide: 'left' },
            { x1: 10, x2: 28, y1: 30, y2: 30, style: 'dashed', tone: 'gold', label: 'OPEN (Buka)', labelSide: 'left' },
            { x1: 10, x2: 28, y1: 16, y2: 16, style: 'dotted', tone: 'muted', label: 'LOW (Terendah)', labelSide: 'left' },
            { x1: 70, x2: 90, y1: 72, y2: 72, style: 'dashed', tone: 'gold', label: 'OPEN (Buka)', labelSide: 'right' },
            { x1: 70, x2: 90, y1: 30, y2: 30, style: 'dashed', tone: 'bear', label: 'CLOSE (Tutup)', labelSide: 'right' }
          ],
          callouts: [
            { x: 28, y: 95, text: 'HIJAU = Naik (Bullish)', tone: 'bull' },
            { x: 70, y: 95, text: 'MERAH = Turun (Bearish)', tone: 'bear' }
          ]
        },
        {
          label: '1 Lilin H1 = 4 Lilin M15',
          caption: 'Timeframe besar (H1) merangkum perjalanan 4 batang lilin M15 (atau 12 lilin M5) di dalamnya. Lihat H1 untuk arah, M15/M5 untuk detail.',
          zones: [
            { x1: 8, x2: 32, y1: 14, y2: 86, tone: 'gold', label: '1 LILIN H1 (60 MNT)', labelPos: 'tl' },
            { x1: 42, x2: 92, y1: 14, y2: 86, tone: 'cyan', label: 'ISI DI M15 (4 × 15 MNT)', labelPos: 'tl' }
          ],
          candles: [
            [20, 26, 78, 20, 72, 'gold'],
            [50, 26, 44, 20, 42],
            [62, 42, 48, 34, 38],
            [74, 38, 62, 36, 58],
            [86, 58, 78, 56, 72]
          ],
          arrows: [
            { x1: 32, y1: 50, x2: 42, y2: 50, tone: 'gold', label: 'Zoom' }
          ],
          callouts: [
            { x: 50, y: 7, text: 'Harga Open & Close tetap sama — cuma beda tingkat zoom waktu', tone: 'cyan' }
          ]
        }
      ]
    },

    'zero-trend-sr-roadmap': {
      title: 'Support (Lantai), Resistance (Atap) & Peta Latihan 14 Hari',
      pairTag: 'LEVEL 00 · TREN & ROADMAP',
      priceLabels: ['Atap', 'Tengah', 'Lantai'],
      stages: [
        {
          label: 'Support & Resistance Dasar',
          caption: 'Support (lantai) adalah area pantulan bawah; Resistance (atap) adalah batas atas. Ikuti arah tangga utama dan selalu pasang SL.',
          zones: [
            { x1: 8, x2: 92, y1: 74, y2: 86, tone: 'bear', label: 'RESISTANCE (ATAP)', labelPos: 'tr' },
            { x1: 8, x2: 92, y1: 16, y2: 28, tone: 'bull', label: 'SUPPORT (LANTAI)', labelPos: 'tr' }
          ],
          candles: [
            [14, 40, 44, 22, 26], [22, 26, 48, 24, 46, 'bull'], [30, 46, 68, 44, 66],
            [38, 66, 80, 62, 74], [46, 74, 78, 56, 58, 'bear'], [54, 58, 60, 34, 36],
            [62, 36, 38, 22, 28, 'bull'], [70, 28, 54, 27, 52], [78, 52, 76, 50, 74],
            [86, 74, 82, 60, 62]
          ],
          callouts: [
            { x: 30, y: 10, text: 'Harga sering memantul di Lantai & tertahan di Atap', tone: 'gold' }
          ]
        },
        {
          label: 'Peta Latihan Aman 14 Hari',
          caption: 'Jangan buru-buru deposit besar: selesaikan Level 0–1, latih baca chart + Kalkulator Lot di Simulasi/Replay, lalu catat di Jurnal.',
          bars: [
            { x1: 5, x2: 26, y1: 10, y2: 42, tone: 'cyan', label: 'Hari 1–4', sub: 'Level 0 & Level 1' },
            { x1: 29, x2: 51, y1: 10, y2: 56, tone: 'gold', label: 'Hari 5–10', sub: 'Replay + Hitung Lot' },
            { x1: 54, x2: 75, y1: 10, y2: 68, tone: 'bull', label: 'Hari 11–14', sub: '15 Trade Jurnal' },
            { x1: 78, x2: 96, y1: 10, y2: 80, tone: 'killzone', label: 'Siap ICT!', sub: 'Lanjut Level 01–06' }
          ],
          callouts: [
            { x: 44, y: 94, text: 'Cek Market Intel setiap hari · Hindari jam berita merah USD', tone: 'sweep' }
          ]
        }
      ]
    },

    // ── LEVEL 1 ──────────────────────────────────────────────────────────
    'two-way-probability': {
      title: 'Trading Dua Arah & Keunggulan R:R 1:2',
      pairTag: 'XAU/USD · LOGIKA PROBABILITAS',
      priceLabels: ['2.670', '2.650', '2.630'],
      stages: [
        {
          label: 'Posisi Buy (1:2 R:R)',
          caption: 'Saat bias bullish: risiko diukur lebih dulu (-1R di SL struktural), target +2R di atas. Cukup 50% win rate untuk profit bersih konsisten.',
          zones: [
            { x1: 42, x2: 88, y1: 42, y2: 82, tone: 'tp', label: 'TARGET +2R (+$20)', labelPos: 'tr' },
            { x1: 42, x2: 88, y1: 22, y2: 42, tone: 'sl', label: 'RISIKO -1R (-$10)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 38, x2: 92, y1: 42, y2: 42, style: 'solid', tone: 'gold', label: 'ENTRY BUY', labelSide: 'left' }
          ],
          candles: [
            [12, 54, 58, 46, 48], [20, 48, 50, 36, 38], [28, 38, 40, 26, 30],
            [36, 30, 45, 28, 43], [44, 43, 45, 38, 42, 'gold'], [54, 42, 58, 41, 56],
            [64, 56, 68, 53, 66], [74, 66, 78, 64, 75], [84, 75, 86, 73, 83]
          ],
          callouts: [{ x: 44, y: 15, text: 'Invalidasi SL ditentukan SEBELUM klik', tone: 'bear' }]
        },
        {
          label: 'Posisi Sell (1:2 R:R)',
          caption: 'Saat bias bearish: jual di area premium, pasang SL ketat di atas swing high (-1R), dan ambil profit saat harga turun (+2R).',
          zones: [
            { x1: 42, x2: 88, y1: 62, y2: 82, tone: 'sl', label: 'RISIKO -1R (-$10)', labelPos: 'tr' },
            { x1: 42, x2: 88, y1: 22, y2: 62, tone: 'tp', label: 'TARGET +2R (+$20)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 38, x2: 92, y1: 62, y2: 62, style: 'solid', tone: 'gold', label: 'ENTRY SELL', labelSide: 'left' }
          ],
          candles: [
            [12, 46, 56, 44, 54], [20, 54, 66, 52, 64], [28, 64, 76, 61, 74],
            [36, 74, 77, 58, 60], [44, 60, 64, 57, 62, 'gold'], [54, 62, 63, 46, 48],
            [64, 48, 51, 36, 38], [74, 38, 41, 26, 29], [84, 29, 32, 18, 21]
          ],
          callouts: [{ x: 48, y: 89, text: 'Profit sama besar baik pasar naik maupun turun', tone: 'bull' }]
        }
      ]
    },

    'candlestick-anatomy': {
      title: 'Anatomi Candlestick: Body Komitmen vs Wick Penolakan',
      pairTag: 'XAU/USD · BACA PRICE ACTION',
      priceLabels: ['High', 'Mid', 'Low'],
      stages: [
        {
          label: 'Bullish vs Bearish Body',
          caption: 'Body tebal (close dekat ujung) menunjukkan dominasi buyer/seller penuh. Harga dibuka di Open dan ditutup tegas di Close.',
          candles: [
            [26, 24, 86, 16, 78, 'bull'],
            [70, 78, 86, 16, 24, 'bear']
          ],
          lines: [
            { x1: 12, x2: 26, y1: 78, y2: 78, style: 'dashed', tone: 'bull', label: 'CLOSE', labelSide: 'left' },
            { x1: 12, x2: 26, y1: 24, y2: 24, style: 'dashed', tone: 'muted', label: 'OPEN', labelSide: 'left' },
            { x1: 70, x2: 88, y1: 78, y2: 78, style: 'dashed', tone: 'muted', label: 'OPEN', labelSide: 'right' },
            { x1: 70, x2: 88, y1: 24, y2: 24, style: 'dashed', tone: 'bear', label: 'CLOSE', labelSide: 'right' }
          ],
          callouts: [
            { x: 26, y: 92, text: 'BULLISH (Buyer Kuat)', tone: 'bull' },
            { x: 70, y: 92, text: 'BEARISH (Seller Kuat)', tone: 'bear' }
          ]
        },
        {
          label: 'Wick Sweep / Penolakan',
          caption: 'Sumbu panjang di zona kunci menandakan Stop Hunt: harga sempat menembus level lalu ditolak keras kembali masuk sebelum candle tutup.',
          lines: [
            { x1: 8, x2: 92, y1: 30, y2: 30, style: 'dashed', tone: 'sweep', label: 'SUPPORT / SSL', labelSide: 'right' },
            { x1: 8, x2: 92, y1: 72, y2: 72, style: 'dashed', tone: 'sweep', label: 'RESISTANCE / BSL', labelSide: 'right' }
          ],
          candles: [
            [18, 46, 50, 34, 36],
            [30, 36, 48, 12, 44, 'bull'],
            [42, 44, 62, 42, 60],
            [62, 58, 68, 56, 66],
            [74, 66, 90, 52, 56, 'bear'],
            [86, 56, 58, 40, 42]
          ],
          callouts: [
            { x: 30, y: 8, text: 'Wick Bawah Panjang = Sweep SSL', tone: 'bull' },
            { x: 74, y: 94, text: 'Wick Atas Panjang = Sweep BSL', tone: 'bear' }
          ]
        }
      ]
    },

    'xau-volatility-sessions': {
      title: 'Karakter Volatilitas & Spread XAU/USD per Sesi (WITA)',
      pairTag: 'WITA (UTC+8) · XAU/USD',
      priceLabels: ['Tinggi', 'Sedang', 'Rendah'],
      stages: [
        {
          label: 'Peta 24 Jam WITA',
          caption: 'Likuiditas & akurasi struktur XAU/USD memuncak pada Sesi London (15:00–18:00) dan NY Overlap (20:30–23:30 WITA). Hindari jam Rollover (05:00–07:00).',
          bars: [
            { x1: 4, x2: 18, y1: 10, y2: 26, tone: 'danger', label: 'Rollover', sub: '05-07 · Spread Lebar' },
            { x1: 21, x2: 40, y1: 10, y2: 48, tone: 'asia', label: 'Sesi Asia', sub: '08-12 · Akumulasi' },
            { x1: 43, x2: 65, y1: 10, y2: 84, tone: 'killzone', label: 'London KZ', sub: '15-18 · Ekspansi' },
            { x1: 68, x2: 96, y1: 10, y2: 95, tone: 'bull', label: 'NY Overlap', sub: '20:30-23:30 · Puncak' }
          ],
          callouts: [
            { x: 54, y: 92, text: 'Fokus Scalping Utama', tone: 'gold' }
          ]
        },
        {
          label: 'Dampak Spread pada SL',
          caption: 'Posisi Sell ditutup oleh harga ASK (lebih tinggi sebesar spread). Wajib tambah napas $0.50–$1.00 di luar swing high agar tidak tersentuh spread.',
          lines: [
            { x1: 12, x2: 88, y1: 66, y2: 66, style: 'solid', tone: 'gold', label: 'SWING HIGH (2.650,00)', labelSide: 'left' },
            { x1: 12, x2: 88, y1: 74, y2: 74, style: 'dashed', tone: 'sweep', label: 'HARGA ASK (+SPREAD $0.30)', labelSide: 'right' },
            { x1: 12, x2: 88, y1: 86, y2: 86, style: 'solid', tone: 'bear', label: 'SL AMAN (+NAPAS $1.00 = 2.651,00)', labelSide: 'left' }
          ],
          zones: [
            { x1: 12, x2: 88, y1: 66, y2: 86, tone: 'sl', label: 'BUFFER SPREAD', labelPos: 'tr' }
          ],
          candles: [
            [26, 48, 66, 45, 62], [38, 62, 65, 44, 46], [50, 46, 65, 44, 52],
            [62, 52, 55, 32, 34], [74, 34, 38, 18, 22]
          ],
          callouts: [{ x: 50, y: 12, text: 'SL terlalu nempel = kena spread lalu harga tetap turun', tone: 'sweep' }]
        }
      ]
    },

    'market-structure-basic': {
      title: 'Struktur Pasar: Uptrend (HH-HL) vs Downtrend (LH-LL)',
      pairTag: 'XAU/USD · M15 STRUKTUR',
      priceLabels: ['Tinggi', 'Tengah', 'Rendah'],
      stages: [
        {
          label: 'Uptrend (HH – HL)',
          caption: 'Selama Higher Low (HL) terakhir bertahan, tren tetap Bullish. Pullback ke HL adalah peluang beli, bukan alasan melawan tren.',
          candles: [
            [10, 18, 26, 14, 24], [18, 24, 40, 22, 38], [26, 38, 42, 30, 32],
            [34, 32, 35, 26, 34], [42, 34, 58, 33, 56], [50, 56, 62, 46, 48],
            [58, 48, 52, 42, 50], [66, 50, 78, 49, 76], [74, 76, 82, 64, 66],
            [82, 66, 92, 65, 88]
          ],
          lines: [
            { x1: 18, x2: 46, y1: 42, y2: 42, style: 'dashed', tone: 'bull', label: 'BOS', labelSide: 'right' },
            { x1: 48, x2: 70, y1: 62, y2: 62, style: 'dashed', tone: 'bull', label: 'BOS', labelSide: 'right' }
          ],
          callouts: [
            { x: 34, y: 18, text: 'HL 1', tone: 'bull' },
            { x: 58, y: 34, text: 'HL 2 (Valid)', tone: 'bull' },
            { x: 82, y: 95, text: 'HH Baru', tone: 'gold' }
          ]
        },
        {
          label: 'Downtrend (LH – LL)',
          caption: 'Dalam Downtrend, harga mencetak Lower High (LH) dan Lower Low (LL). Cari peluang Sell saat retrace naik mendekati LH.',
          candles: [
            [10, 84, 88, 74, 76], [18, 76, 78, 58, 60], [26, 60, 72, 59, 70],
            [34, 70, 74, 50, 52], [42, 52, 54, 38, 40], [50, 40, 56, 39, 54],
            [58, 54, 58, 32, 34], [66, 34, 36, 20, 22], [74, 22, 38, 21, 35],
            [82, 35, 37, 10, 14]
          ],
          lines: [
            { x1: 18, x2: 46, y1: 58, y2: 58, style: 'dashed', tone: 'bear', label: 'BOS', labelSide: 'right' },
            { x1: 42, x2: 70, y1: 38, y2: 38, style: 'dashed', tone: 'bear', label: 'BOS', labelSide: 'right' }
          ],
          callouts: [
            { x: 26, y: 80, text: 'LH 1', tone: 'bear' },
            { x: 50, y: 64, text: 'LH 2', tone: 'bear' },
            { x: 82, y: 6, text: 'LL Baru', tone: 'gold' }
          ]
        }
      ]
    },

    'mtf-alignment': {
      title: 'Top-Down Multi-Timeframe: H1 (Peta) → M15 (Area) → M5/M1 (Trigger)',
      pairTag: 'HTF → LTF ALIGNMENT',
      priceLabels: ['Target', 'Zona', 'SL'],
      stages: [
        {
          label: '1. H1 Arah & Bias',
          caption: 'H1 adalah kompas utama: struktur naik menuju liquidity atas (BSL). Hari ini kita hanya mencari posisi BUY di area diskon.',
          zones: [{ x1: 38, x2: 92, y1: 22, y2: 44, tone: 'discount', label: 'ZONA DISKON H1 / M15', labelPos: 'tr' }],
          lines: [{ x1: 12, x2: 92, y1: 86, y2: 86, style: 'dashed', tone: 'gold', label: 'TARGET H1 (BSL)', labelSide: 'right' }],
          candles: [
            [14, 18, 32, 16, 30], [24, 30, 54, 28, 52], [34, 52, 78, 50, 76],
            [46, 76, 78, 54, 56], [58, 56, 58, 34, 36]
          ],
          arrows: [{ x1: 60, y1: 36, x2: 86, y2: 82, tone: 'bull', label: 'Target H1' }]
        },
        {
          label: '2. M15 Area & M5/M1 Entry',
          caption: 'Zoom-in ke dalam zona diskon H1: M5/M1 mencetak Sweep SSL + MSS Bullish + FVG. SL cukup di M5/M1, tapi TP membidik H1!',
          zones: [
            { x1: 8, x2: 94, y1: 14, y2: 48, tone: 'discount', label: 'DI DALAM ZONA DISKON H1', labelPos: 'tr' },
            { x1: 54, x2: 92, y1: 30, y2: 42, tone: 'fvg', label: 'M5 FVG ENTRY', labelPos: 'tr' }
          ],
          lines: [
            { x1: 16, x2: 62, y1: 42, y2: 42, style: 'dashed', tone: 'bull', label: 'M5 MSS', labelSide: 'left' }
          ],
          candles: [
            [18, 44, 46, 28, 30], [28, 30, 42, 29, 40], [38, 40, 41, 18, 22],
            [48, 22, 32, 14, 28, 'gold'], [56, 28, 56, 27, 54, 'bull'],
            [66, 54, 56, 34, 38], [76, 38, 72, 36, 70], [86, 70, 92, 68, 88]
          ],
          callouts: [{ x: 48, y: 8, text: 'SL kecil LTF · Target besar HTF', tone: 'gold' }]
        }
      ]
    },

    // ── LEVEL 2 ──────────────────────────────────────────────────────────
    'bos-vs-sweep': {
      title: 'BOS Asli (Body Close) vs Liquidity Sweep (Wick Only)',
      pairTag: 'XAU/USD · FILTER JEBAKAN',
      priceLabels: ['2.660', '2.652', '2.644'],
      stages: [
        {
          label: 'BOS Valid (Body Close)',
          caption: 'Body candle menutup TEGAS di atas swing high sebelumnya dengan momentum. Menandakan kelanjutan tren sah.',
          lines: [{ x1: 12, x2: 92, y1: 60, y2: 60, style: 'solid', tone: 'bull', label: 'SWING HIGH', labelSide: 'left' }],
          candles: [
            [18, 34, 60, 32, 56], [28, 56, 58, 42, 44], [38, 44, 48, 36, 46],
            [50, 46, 78, 45, 74, 'bull'], [62, 74, 84, 68, 82], [74, 82, 88, 76, 86]
          ],
          callouts: [{ x: 52, y: 88, text: 'VALID BOS · Body Close Jelas di Atas Garis', tone: 'bull' }]
        },
        {
          label: 'Sweep Palsu (Wick Raid)',
          caption: 'Hanya sumbu (wick) yang menusuk ke atas swing high untuk menyapu SL, lalu body tutup KEMBALI di bawah garis. Waspada pembalikan tajam!',
          lines: [{ x1: 12, x2: 92, y1: 60, y2: 60, style: 'dashed', tone: 'sweep', label: 'BSL (SWING HIGH)', labelSide: 'left' }],
          candles: [
            [18, 36, 60, 34, 56], [28, 56, 58, 44, 46], [38, 46, 58, 44, 55],
            [50, 55, 82, 50, 52, 'sweep'], [62, 52, 54, 34, 36, 'bear'], [74, 36, 38, 18, 22, 'bear']
          ],
          callouts: [{ x: 52, y: 90, text: 'LIQUIDITY SWEEP · Wick Tembus, Body Tutup Bawah', tone: 'sweep' }]
        }
      ]
    },

    'dealing-range-ie': {
      title: 'Internal Range Liquidity (IRL) ↔ External Range Liquidity (ERL)',
      pairTag: 'DEALING RANGE M15',
      priceLabels: ['ERL High', 'EQ 50%', 'ERL Low'],
      stages: [
        {
          label: '1. Tarik Dealing Range',
          caption: 'Tentukan batas atas (Swing High / ERL) dan batas bawah (Swing Low / ERL) impuls terakhir. Garis tengah 50% adalah Equilibrium.',
          zones: [
            { x1: 12, x2: 92, y1: 50, y2: 86, tone: 'premium', label: 'PREMIUM (>50%)', labelPos: 'tr' },
            { x1: 12, x2: 92, y1: 14, y2: 50, tone: 'discount', label: 'DISCOUNT (<50%)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 12, x2: 92, y1: 86, y2: 86, style: 'solid', tone: 'gold', label: 'ERL HIGH (TARGET)', labelSide: 'left' },
            { x1: 12, x2: 92, y1: 50, y2: 50, style: 'dotted', tone: 'muted', label: 'EQ 50%', labelSide: 'left' },
            { x1: 12, x2: 92, y1: 14, y2: 14, style: 'solid', tone: 'muted', label: 'ERL LOW (INVALIDASI)', labelSide: 'left' }
          ],
          candles: [
            [18, 18, 28, 14, 26], [28, 26, 52, 24, 50], [38, 50, 86, 48, 84],
            [50, 84, 85, 62, 64], [62, 64, 66, 36, 38]
          ]
        },
        {
          label: '2. IRL FVG → ERL High',
          caption: 'Algoritma selalu bolak-balik: turun mengambil IRL (FVG di Diskon), lalu melesat naik menyapu ERL (Swing High lama).',
          zones: [
            { x1: 24, x2: 72, y1: 26, y2: 40, tone: 'fvg', label: 'IRL (FVG DISKON)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 12, x2: 92, y1: 86, y2: 86, style: 'dashed', tone: 'gold', label: 'ERL HIGH (BSL)', labelSide: 'left' },
            { x1: 12, x2: 92, y1: 50, y2: 50, style: 'dotted', tone: 'muted', label: 'EQ 50%', labelSide: 'left' }
          ],
          candles: [
            [18, 18, 28, 14, 26], [28, 26, 52, 24, 50], [38, 50, 86, 48, 84],
            [50, 84, 85, 58, 60], [60, 60, 62, 30, 34, 'gold'], [70, 34, 62, 32, 60],
            [80, 60, 92, 58, 90, 'bull']
          ],
          arrows: [{ x1: 60, y1: 32, x2: 82, y2: 88, tone: 'bull', label: 'IRL → ERL' }]
        }
      ]
    },

    'bsl-ssl-pools': {
      title: 'Peta Likuiditas: Equal Highs (BSL) & Equal Lows (SSL)',
      pairTag: 'XAU/USD · KOLAM STOP LOSS',
      priceLabels: ['BSL $$$', 'Range', 'SSL $$$'],
      stages: [
        {
          label: 'Kolam BSL (Atas)',
          caption: 'Equal Highs (Double/Triple Top rapi) terlihat seperti tembok kuat bagi retail, padahal di atasnya menumpuk ribuan Stop Loss Seller (BSL) yang jadi magnet institusi.',
          lines: [{ x1: 16, x2: 88, y1: 72, y2: 72, style: 'dashed', tone: 'sweep', label: 'EQH · BSL $$$', labelSide: 'right' }],
          candles: [
            [18, 42, 72, 40, 68], [28, 68, 70, 48, 50], [38, 50, 72, 49, 69],
            [48, 69, 71, 52, 54], [58, 54, 72, 52, 68], [68, 68, 88, 64, 66, 'sweep'],
            [78, 66, 68, 34, 36, 'bear']
          ],
          callouts: [{ x: 68, y: 94, text: 'BSL Disapu → Harga Berbalik Turun', tone: 'sweep' }]
        },
        {
          label: 'Kolam SSL (Bawah)',
          caption: 'Equal Lows (Double Bottom) menyimpan tumpukan Stop Loss Buyer (SSL). Tunggu SSL disapu lebih dulu sebelum mencari Buy.',
          lines: [{ x1: 16, x2: 88, y1: 30, y2: 30, style: 'dashed', tone: 'sweep', label: 'EQL · SSL $$$', labelSide: 'right' }],
          candles: [
            [18, 58, 62, 30, 34], [28, 34, 52, 32, 50], [38, 50, 52, 30, 34],
            [48, 34, 50, 32, 48], [58, 48, 50, 30, 35], [68, 35, 38, 12, 36, 'sweep'],
            [78, 36, 72, 35, 70, 'bull']
          ],
          callouts: [{ x: 68, y: 7, text: 'SSL Disapu → Bahan Bakar Rally', tone: 'bull' }]
        }
      ]
    },

    'key-liquidity-levels': {
      title: 'Level Likuiditas Wajib: PDH/PDL, PWH/PWL & Asia Range',
      pairTag: 'XAU/USD · LEVEL INSTITUSI',
      priceLabels: ['PWH/PDH', 'Asia', 'PDL'],
      stages: [
        {
          label: 'Peta Harian Lengkap',
          caption: 'Tandai 6 garis kunci sebelum London buka: PWH/PWL, PDH/PDL, dan kotak Asia High/Low. 80% pergerakan Gold harian berputar di level ini.',
          zones: [{ x1: 10, x2: 46, y1: 42, y2: 60, tone: 'asia', label: 'ASIA RANGE (08-12 WITA)', labelPos: 'tl' }],
          lines: [
            { x1: 8, x2: 94, y1: 88, y2: 88, style: 'solid', tone: 'gold', label: 'PWH (Weekly High)', labelSide: 'right' },
            { x1: 8, x2: 94, y1: 76, y2: 76, style: 'dashed', tone: 'sweep', label: 'PDH (Daily High)', labelSide: 'right' },
            { x1: 8, x2: 94, y1: 22, y2: 22, style: 'dashed', tone: 'cyan', label: 'PDL (Daily Low)', labelSide: 'right' }
          ],
          candles: [
            [16, 48, 58, 44, 56], [24, 56, 60, 46, 48], [32, 48, 58, 42, 52], [40, 52, 57, 45, 50],
            [52, 50, 52, 34, 42, 'sweep'], [62, 42, 68, 40, 66, 'bull'], [74, 66, 82, 64, 78, 'bull']
          ],
          callouts: [{ x: 52, y: 28, text: 'Sweep Asia Low → Target PDH', tone: 'bull' }]
        },
        {
          label: 'Reaksi di PDH (Rejection)',
          caption: 'Saat harga menyapu PDH (Previous Day High) dengan wick lalu mematahkan struktur M5 ke bawah, PDH menjadi bahan bakar Sell menuju Asia Low / PDL.',
          lines: [
            { x1: 8, x2: 94, y1: 76, y2: 76, style: 'dashed', tone: 'sweep', label: 'PDH DISAPU', labelSide: 'left' },
            { x1: 8, x2: 94, y1: 24, y2: 24, style: 'dashed', tone: 'cyan', label: 'TARGET: PDL', labelSide: 'left' }
          ],
          candles: [
            [18, 44, 58, 42, 56], [28, 56, 72, 54, 70], [38, 70, 88, 66, 68, 'sweep'],
            [48, 68, 70, 50, 52, 'bear'], [58, 52, 62, 50, 58], [68, 58, 60, 36, 38, 'bear'],
            [78, 38, 40, 22, 24, 'bear']
          ],
          arrows: [{ x1: 42, y1: 78, x2: 78, y2: 26, tone: 'bear', label: 'Distribusi ke PDL' }]
        }
      ]
    },

    'inducement-trap': {
      title: 'Inducement (IDM): Umpan Swing Pertama Sebelum Area Asli',
      pairTag: 'XAU/USD · ANTI-EARLY ENTRY',
      priceLabels: ['Target', 'IDM', 'OB Asli'],
      stages: [
        {
          label: 'Jebakan Entry Terlalu Cepat',
          caption: 'Swing minor pertama di tengah jalan sering terlihat seperti support/OB cantik. Pemula langsung Buy di sana — padahal itu hanyalah Inducement (IDM).',
          zones: [
            { x1: 28, x2: 64, y1: 52, y2: 60, tone: 'danger', label: 'JEBAKAN IDM', labelPos: 'tr' },
            { x1: 12, x2: 90, y1: 18, y2: 32, tone: 'ob', label: 'ORDER BLOCK ASLI (EXTREME)', labelPos: 'tr' }
          ],
          candles: [
            [16, 22, 32, 18, 30], [26, 30, 58, 28, 56], [36, 56, 60, 52, 54],
            [46, 54, 86, 53, 84], [56, 84, 86, 56, 58], [66, 58, 62, 42, 44, 'bear']
          ],
          callouts: [{ x: 66, y: 70, text: 'Buyer di IDM langsung kena SL!', tone: 'bear' }]
        },
        {
          label: 'Sabar Tunggu IDM Disapu',
          caption: 'Setelah Inducement disapu dan harga menyentuh Extreme OB/FVG di bawahnya, barulah energi institusi mendorong harga terbang.',
          zones: [
            { x1: 12, x2: 90, y1: 18, y2: 32, tone: 'ob', label: 'OB ASLI (SETELAH IDM)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 30, x2: 74, y1: 52, y2: 52, style: 'dashed', tone: 'sweep', label: 'IDM DISAPU ✓', labelSide: 'right' }
          ],
          candles: [
            [16, 22, 32, 18, 30], [26, 30, 58, 28, 56], [36, 56, 60, 52, 54],
            [46, 54, 86, 53, 84], [56, 84, 86, 46, 48], [66, 48, 50, 22, 28, 'gold'],
            [76, 28, 62, 27, 60, 'bull'], [86, 60, 92, 58, 90, 'bull']
          ],
          callouts: [{ x: 66, y: 10, text: 'Entry Sniper Setelah IDM Dibersihkan', tone: 'bull' }]
        }
      ]
    },

    // ── LEVEL 3 ──────────────────────────────────────────────────────────
    'displacement-signature': {
      title: 'Displacement Valid (Energi Institusi) vs Gerakan Lemah',
      pairTag: 'XAU/USD · JEJAK ALGORITMA',
      priceLabels: ['Break', 'FVG', 'Base'],
      stages: [
        {
          label: 'Displacement Valid',
          caption: '1–3 candle berbadan penuh yang menembus struktur dengan cepat sekaligus meninggalkan Fair Value Gap (FVG) yang jelas.',
          zones: [{ x1: 38, x2: 88, y1: 42, y2: 58, tone: 'fvg', label: 'FVG TERBENTUK', labelPos: 'tr' }],
          lines: [{ x1: 14, x2: 88, y1: 62, y2: 62, style: 'dashed', tone: 'bull', label: 'MSS / BOS', labelSide: 'left' }],
          candles: [
            [18, 44, 62, 40, 42], [28, 42, 46, 22, 26], [38, 26, 42, 24, 40],
            [48, 40, 82, 39, 80, 'bull'], [58, 80, 90, 58, 86, 'bull']
          ],
          callouts: [{ x: 48, y: 94, text: 'Body Panjang + FVG = Modal Besar Masuk', tone: 'bull' }]
        },
        {
          label: 'Gerakan Lemah (Skip)',
          caption: 'Candle kecil saling tumpang tindih dengan banyak sumbu (choppy). Tidak ada FVG = bukan Displacement, hindari entry.',
          lines: [{ x1: 14, x2: 88, y1: 62, y2: 62, style: 'dashed', tone: 'muted', label: 'LEVEL STRUKTUR', labelSide: 'left' }],
          candles: [
            [18, 44, 62, 40, 42], [28, 42, 48, 34, 38], [38, 38, 52, 36, 44],
            [48, 44, 58, 40, 50], [58, 50, 64, 46, 56], [68, 56, 66, 50, 54]
          ],
          callouts: [{ x: 52, y: 82, text: 'Overlapping / Choppy · Tanpa FVG → NO TRADE', tone: 'bear' }]
        }
      ]
    },

    'fvg-ce-anatomy': {
      title: 'Anatomi Fair Value Gap (3 Candle) & 50% Consequent Encroachment',
      pairTag: 'XAU/USD · FVG & 50% CE',
      priceLabels: ['C3 Low', '50% CE', 'C1 High'],
      stages: [
        {
          label: '1. Celah 3 Candle',
          caption: 'Bullish FVG adalah celah kosong antara High Candle 1 dan Low Candle 3 yang tidak tertutup oleh sumbu. Di tengahnya terdapat titik 50% CE.',
          zones: [{ x1: 22, x2: 88, y1: 38, y2: 62, tone: 'fvg', label: 'BULLISH FVG (BISI)', labelPos: 'tr' }],
          lines: [
            { x1: 22, x2: 88, y1: 62, y2: 62, style: 'solid', tone: 'cyan', label: 'LOW C3', labelSide: 'left' },
            { x1: 22, x2: 88, y1: 50, y2: 50, style: 'dashed', tone: 'gold', label: '50% CE (SNIPER)', labelSide: 'right' },
            { x1: 22, x2: 88, y1: 38, y2: 38, style: 'solid', tone: 'cyan', label: 'HIGH C1', labelSide: 'left' }
          ],
          candles: [
            [24, 18, 38, 14, 34],
            [36, 34, 78, 32, 74, 'bull'],
            [48, 74, 88, 62, 84]
          ],
          callouts: [
            { x: 24, y: 8, text: 'C1', tone: 'muted' },
            { x: 36, y: 8, text: 'C2 (Impuls)', tone: 'bull' },
            { x: 48, y: 8, text: 'C3', tone: 'muted' }
          ]
        },
        {
          label: '2. Retrace ke 50% CE',
          caption: 'Harga kembali mengisi celah FVG hingga garis 50% CE, menghormati batas bawah tanpa body close menembus, lalu melesat melanjutkan tren.',
          zones: [{ x1: 22, x2: 88, y1: 38, y2: 62, tone: 'fvg', label: 'FVG TERHORMATI', labelPos: 'tr' }],
          lines: [
            { x1: 22, x2: 88, y1: 50, y2: 50, style: 'dashed', tone: 'gold', label: '50% CE ENTRY', labelSide: 'right' }
          ],
          candles: [
            [20, 18, 38, 14, 34], [30, 34, 78, 32, 74, 'bull'], [40, 74, 86, 62, 82],
            [52, 82, 84, 60, 64], [62, 64, 66, 48, 56, 'gold'],
            [74, 56, 82, 54, 80, 'bull'], [84, 80, 94, 78, 92, 'bull']
          ],
          callouts: [{ x: 62, y: 26, text: 'Wick menyentuh 50% CE → Reaksi Instan', tone: 'gold' }]
        }
      ]
    },

    'order-block-mt': {
      title: 'Order Block Institusi & 50% Mean Threshold (MT)',
      pairTag: 'XAU/USD · BULLISH OB',
      priceLabels: ['OB Open', '50% MT', 'OB Low'],
      stages: [
        {
          label: '1. Syarat OB Valid',
          caption: 'Bullish OB adalah candle turun terakhir SEBELUM Displacement kuat yang mematahkan struktur (MSS) dan meninggalkan FVG. Tanpa Displacement, itu bukan OB!',
          zones: [
            { x1: 24, x2: 88, y1: 22, y2: 40, tone: 'ob', label: 'BULLISH ORDER BLOCK', labelPos: 'tr' },
            { x1: 36, x2: 66, y1: 44, y2: 58, tone: 'fvg', label: 'FVG', labelPos: 'tr' }
          ],
          lines: [
            { x1: 24, x2: 88, y1: 31, y2: 31, style: 'dashed', tone: 'gold', label: '50% MEAN THRESHOLD', labelSide: 'right' },
            { x1: 14, x2: 72, y1: 64, y2: 64, style: 'dashed', tone: 'bull', label: 'MSS VALID', labelSide: 'left' }
          ],
          candles: [
            [16, 52, 64, 48, 50], [26, 40, 44, 22, 26, 'gold'],
            [38, 26, 76, 25, 74, 'bull'], [48, 74, 84, 58, 80]
          ]
        },
        {
          label: '2. Mitigasi OB & Filter MT',
          caption: 'Entry di Open OB atau 50% MT. Jika body candle retrace menutup DI BAWAH 50% Mean Threshold, kualitas OB melemah — bersiap cut/validasi ulang.',
          zones: [{ x1: 24, x2: 88, y1: 22, y2: 40, tone: 'ob', label: 'BULLISH OB', labelPos: 'tr' }],
          lines: [
            { x1: 24, x2: 88, y1: 40, y2: 40, style: 'solid', tone: 'gold', label: 'OPEN OB (ENTRY)', labelSide: 'left' },
            { x1: 24, x2: 88, y1: 31, y2: 31, style: 'dashed', tone: 'sweep', label: '50% MT (BATAS BODY)', labelSide: 'right' }
          ],
          candles: [
            [16, 52, 64, 48, 50], [26, 40, 44, 22, 26, 'gold'], [36, 26, 76, 25, 74, 'bull'],
            [46, 74, 82, 60, 62], [56, 62, 64, 42, 44], [66, 44, 46, 30, 38, 'bull'],
            [76, 38, 72, 36, 70, 'bull'], [86, 70, 92, 68, 88, 'bull']
          ],
          callouts: [{ x: 66, y: 12, text: 'Body bertahan di atas 50% MT = OB Kuat', tone: 'bull' }]
        }
      ]
    },

    'cisd-vs-mss': {
      title: 'CISD (Sinyal Awal Cepat) vs MSS (Konfirmasi Struktural)',
      pairTag: 'XAU/USD · PERUBAHAN ARAH',
      priceLabels: ['MSS', 'CISD', 'Sweep'],
      stages: [
        {
          label: '1. CISD Lebih Cepat',
          caption: 'Setelah sweep SSL, candle bullish langsung menutup di atas harga OPEN rangkaian candle turun terakhir → inilah CISD (Change in State of Delivery).',
          lines: [
            { x1: 14, x2: 44, y1: 24, y2: 24, style: 'dashed', tone: 'sweep', label: 'SSL SWEEP', labelSide: 'left' },
            { x1: 34, x2: 88, y1: 52, y2: 52, style: 'solid', tone: 'cyan', label: 'CISD (OPEN DOWN-CLOSE)', labelSide: 'right' },
            { x1: 14, x2: 88, y1: 72, y2: 72, style: 'dotted', tone: 'muted', label: 'SWING HIGH (MSS)', labelSide: 'right' }
          ],
          candles: [
            [18, 60, 72, 54, 56], [28, 56, 58, 38, 40], [38, 52, 54, 30, 32, 'bear'],
            [46, 32, 34, 14, 22, 'sweep'], [56, 22, 62, 20, 58, 'bull']
          ],
          callouts: [{ x: 56, y: 88, text: 'CISD terpicu lebih dulu dari MSS!', tone: 'cyan' }]
        },
        {
          label: '2. Konfirmasi Penuh MSS',
          caption: 'Candle berikutnya menembus Swing High sebelumnya dengan body close + FVG (MSS). Kombinasi Sweep + CISD + MSS memberi probabilitas tertinggi.',
          zones: [{ x1: 52, x2: 88, y1: 42, y2: 56, tone: 'fvg', label: 'FVG ENTRY', labelPos: 'tr' }],
          lines: [
            { x1: 34, x2: 72, y1: 52, y2: 52, style: 'dotted', tone: 'cyan', label: 'CISD ✓', labelSide: 'left' },
            { x1: 14, x2: 88, y1: 72, y2: 72, style: 'solid', tone: 'bull', label: 'MSS VALID ✓', labelSide: 'left' }
          ],
          candles: [
            [18, 60, 72, 54, 56], [28, 56, 58, 38, 40], [38, 52, 54, 30, 32],
            [46, 32, 34, 14, 22], [56, 22, 62, 20, 58, 'bull'], [66, 58, 84, 56, 82, 'bull'],
            [76, 82, 84, 48, 52, 'gold'], [86, 52, 92, 50, 90, 'bull']
          ]
        }
      ]
    },

    'premium-discount-ote': {
      title: 'Matriks Premium / Discount & Zona OTE (61.8% – 78.6%)',
      pairTag: 'XAU/USD · FILTER HARGA MURAH',
      priceLabels: ['100% High', '50% EQ', '0% Low'],
      stages: [
        {
          label: 'Zona Buy (Discount + OTE)',
          caption: 'Dalam tren naik, JANGAN Buy di Premium (>50%). Tunggu harga turun di bawah Equilibrium ke zona OTE (61.8%–78.6%, sweet spot 70.5%).',
          zones: [
            { x1: 14, x2: 92, y1: 50, y2: 88, tone: 'premium', label: 'PREMIUM · NO BUY', labelPos: 'tr' },
            { x1: 14, x2: 92, y1: 12, y2: 50, tone: 'discount', label: 'DISCOUNT', labelPos: 'tr' },
            { x1: 42, x2: 92, y1: 24, y2: 38, tone: 'gold', label: 'OTE (61.8%–78.6%)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 14, x2: 92, y1: 50, y2: 50, style: 'dashed', tone: 'muted', label: '50% EQ', labelSide: 'left' },
            { x1: 42, x2: 92, y1: 31, y2: 31, style: 'dotted', tone: 'gold', label: '70.5% SWEET SPOT', labelSide: 'left' }
          ],
          candles: [
            [18, 16, 34, 12, 32], [28, 32, 62, 30, 60], [38, 60, 88, 58, 86],
            [48, 86, 87, 62, 64], [58, 64, 66, 44, 46], [68, 46, 48, 28, 32, 'gold'],
            [78, 32, 68, 30, 66, 'bull'], [88, 66, 94, 64, 92, 'bull']
          ]
        },
        {
          label: 'Zona Sell (Premium + OTE)',
          caption: 'Sebaliknya saat Downtrend, tunggu pullback naik melewati 50% EQ masuk ke zona OTE Premium (61.8%–78.6%) sebelum menekan tombol Sell.',
          zones: [
            { x1: 14, x2: 92, y1: 50, y2: 88, tone: 'premium', label: 'PREMIUM · AREA SELL', labelPos: 'tr' },
            { x1: 42, x2: 92, y1: 62, y2: 76, tone: 'gold', label: 'OTE SELL (61.8%–78.6%)', labelPos: 'tr' },
            { x1: 14, x2: 92, y1: 12, y2: 50, tone: 'discount', label: 'DISCOUNT · NO SELL', labelPos: 'tr' }
          ],
          lines: [
            { x1: 14, x2: 92, y1: 50, y2: 50, style: 'dashed', tone: 'muted', label: '50% EQ', labelSide: 'left' }
          ],
          candles: [
            [18, 84, 88, 62, 64], [28, 64, 66, 38, 40], [38, 40, 42, 12, 16],
            [48, 16, 44, 14, 42], [58, 42, 58, 40, 56], [68, 56, 74, 54, 68, 'gold'],
            [78, 68, 70, 34, 36, 'bear'], [88, 36, 38, 10, 14, 'bear']
          ]
        }
      ]
    },

    // ── LEVEL 4 (4 MODEL ENTRY SCALPER A+) ───────────────────────────────
    'model-sweep-fvg': {
      title: 'Model 1 (Core): Liquidity Sweep → MSS/CISD → FVG Entry',
      pairTag: 'XAU/USD · MODEL #1 CORE',
      priceLabels: ['2.665', '2.650', '2.642'],
      stages: [
        {
          label: '1. Sweep SSL',
          caption: 'Tahap 1: Harga menyapu kolam SSL (Asia Low / PDL) dengan wick tajam di dalam jam Killzone WITA. Belum entry — baru siaga!',
          lines: [
            { x1: 10, x2: 90, y1: 30, y2: 30, style: 'dashed', tone: 'sweep', label: 'SSL (ASIA LOW)', labelSide: 'right' },
            { x1: 24, x2: 72, y1: 54, y2: 54, style: 'dotted', tone: 'muted', label: 'SWING HIGH (MSS)', labelSide: 'right' }
          ],
          candles: [
            [16, 46, 54, 32, 34], [26, 34, 54, 32, 50], [36, 50, 52, 34, 36],
            [46, 36, 42, 14, 34, 'sweep']
          ],
          callouts: [{ x: 46, y: 7, text: '1. SWEEP SSL ✓', tone: 'sweep' }]
        },
        {
          label: '2. Displacement & MSS + FVG',
          caption: 'Tahap 2: Muncul candle dorongan kuat (Displacement) yang mematahkan Swing High (MSS) dan mencetak kotak FVG bersih di bawah 50%.',
          zones: [{ x1: 50, x2: 90, y1: 38, y2: 50, tone: 'fvg', label: 'FVG ENTRY ZONE', labelPos: 'tr' }],
          lines: [
            { x1: 10, x2: 56, y1: 30, y2: 30, style: 'dashed', tone: 'sweep', label: 'SSL', labelSide: 'left' },
            { x1: 24, x2: 88, y1: 54, y2: 54, style: 'solid', tone: 'bull', label: '2. MSS VALID ✓', labelSide: 'right' }
          ],
          candles: [
            [16, 46, 54, 32, 34], [26, 34, 54, 32, 50], [36, 50, 52, 34, 36],
            [46, 36, 42, 14, 38], [56, 38, 72, 36, 68, 'bull'], [66, 68, 76, 50, 72]
          ]
        },
        {
          label: '3. Retrace Entry + SL/TP',
          caption: 'Tahap 3: Limit Buy di atas/50% CE FVG, SL di bawah wick sweep (+napas spread), TP membidik BSL atas minimal 1:2 R:R.',
          zones: [
            { x1: 50, x2: 92, y1: 38, y2: 50, tone: 'fvg', label: 'FVG', labelPos: 'tl' },
            { x1: 72, x2: 92, y1: 44, y2: 88, tone: 'tp', label: 'TP BSL (+2.5R)', labelPos: 'tr' },
            { x1: 72, x2: 92, y1: 12, y2: 44, tone: 'sl', label: 'SL (-1R)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 24, x2: 72, y1: 54, y2: 54, style: 'dashed', tone: 'bull', label: 'MSS', labelSide: 'left' },
            { x1: 50, x2: 92, y1: 44, y2: 44, style: 'solid', tone: 'gold', label: 'ENTRY 50% CE', labelSide: 'left' }
          ],
          candles: [
            [16, 46, 54, 32, 34], [26, 34, 54, 32, 50], [36, 50, 52, 34, 36],
            [46, 36, 42, 14, 38], [56, 38, 72, 36, 68, 'bull'], [64, 68, 74, 50, 70],
            [74, 70, 72, 42, 48, 'gold'], [82, 48, 76, 46, 74, 'bull'], [90, 74, 92, 72, 90, 'bull']
          ]
        }
      ]
    },

    'model-ob-sniper': {
      title: 'Model 2: Order Block Sniper + 50% Mean Threshold',
      pairTag: 'XAU/USD · MODEL #2 OB',
      priceLabels: ['2.662', '2.648', '2.642'],
      stages: [
        {
          label: '1. Identifikasi OB + FVG',
          caption: 'Pilih candle berlawanan terakhir yang menyapu likuiditas lalu langsung memicu Displacement + FVG. Tandai Open OB dan garis 50% MT.',
          zones: [
            { x1: 30, x2: 90, y1: 18, y2: 36, tone: 'ob', label: 'HIGH-PROB BULLISH OB', labelPos: 'tr' },
            { x1: 40, x2: 76, y1: 40, y2: 54, tone: 'fvg', label: 'FVG DI ATAS OB', labelPos: 'tr' }
          ],
          lines: [
            { x1: 30, x2: 90, y1: 27, y2: 27, style: 'dashed', tone: 'gold', label: '50% MT', labelSide: 'right' }
          ],
          candles: [
            [16, 48, 52, 34, 36], [24, 36, 42, 32, 38], [34, 36, 40, 18, 22, 'gold'],
            [44, 22, 70, 21, 68, 'bull'], [54, 68, 80, 54, 76]
          ]
        },
        {
          label: '2. Entry di Open OB / 50% MT',
          caption: 'Saat harga menembus FVG dan menyentuh Open OB / 50% MT, SL sangat ketat (di bawah Low OB + spread) menghasilkan R:R 1:3 hingga 1:4.',
          zones: [
            { x1: 30, x2: 90, y1: 18, y2: 36, tone: 'ob', label: 'OB', labelPos: 'tl' },
            { x1: 68, x2: 92, y1: 32, y2: 88, tone: 'tp', label: 'TP +3.5R', labelPos: 'tr' },
            { x1: 68, x2: 92, y1: 14, y2: 32, tone: 'sl', label: 'SL KETAT (-1R)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 30, x2: 90, y1: 32, y2: 32, style: 'solid', tone: 'gold', label: 'LIMIT BUY OB', labelSide: 'left' }
          ],
          candles: [
            [16, 48, 52, 34, 36], [24, 36, 42, 32, 38], [34, 36, 40, 18, 22, 'gold'],
            [44, 22, 70, 21, 68, 'bull'], [54, 68, 78, 54, 72], [62, 72, 74, 44, 46],
            [70, 46, 48, 27, 36, 'gold'], [80, 36, 72, 34, 70, 'bull'], [88, 70, 92, 68, 90, 'bull']
          ]
        }
      ]
    },

    'model-ifvg-flip': {
      title: 'Model 3: Inversion Fair Value Gap (IFVG) — Senjata Cepat M1/M5',
      pairTag: 'XAU/USD · MODEL #3 IFVG',
      priceLabels: ['Target', 'IFVG', 'SSL'],
      stages: [
        {
          label: '1. Bearish FVG Gagal',
          caption: 'Harga turun menyapu SSL sambil mencetak Bearish FVG. Normalnya Bearish FVG menahan harga turun — tetapi kali ini buyer justru membalas keras!',
          zones: [{ x1: 24, x2: 88, y1: 40, y2: 56, tone: 'danger', label: 'BEARISH FVG LAMA', labelPos: 'tr' }],
          lines: [{ x1: 10, x2: 52, y1: 24, y2: 24, style: 'dashed', tone: 'sweep', label: 'SSL SWEEP', labelSide: 'left' }],
          candles: [
            [16, 70, 74, 56, 58], [26, 58, 60, 30, 32, 'bear'], [36, 32, 40, 14, 22, 'sweep'],
            [46, 22, 46, 20, 42, 'bull']
          ]
        },
        {
          label: '2. Body Close Tembus → IFVG!',
          caption: 'Body candle bullish menutup TEGAS DI ATAS Bearish FVG. Seketika kotak merah berbalik fungsi menjadi Bullish IFVG (lantai peluncuran).',
          zones: [{ x1: 24, x2: 90, y1: 40, y2: 56, tone: 'fvg', label: 'BULLISH IFVG (FLIPPED!)', labelPos: 'tr' }],
          lines: [{ x1: 48, x2: 90, y1: 56, y2: 56, style: 'solid', tone: 'bull', label: 'BODY CLOSE DI ATAS ✓', labelSide: 'right' }],
          candles: [
            [16, 70, 74, 56, 58], [26, 58, 60, 30, 32, 'bear'], [36, 32, 40, 14, 22, 'sweep'],
            [46, 22, 46, 20, 42, 'bull'], [56, 42, 68, 40, 64, 'bull']
          ]
        },
        {
          label: '3. Retest Kotak IFVG → Terbang',
          caption: 'Entry Buy saat retest ke sisi atas kotak IFVG (atau langsung saat close jika momentum tinggi), SL di bawah kotak/swing low, TP ke BSL.',
          zones: [
            { x1: 24, x2: 90, y1: 40, y2: 56, tone: 'fvg', label: 'IFVG SUPPORT', labelPos: 'tl' },
            { x1: 68, x2: 92, y1: 56, y2: 90, tone: 'tp', label: 'TP BSL (+2.5R)', labelPos: 'tr' }
          ],
          candles: [
            [16, 70, 74, 56, 58], [26, 58, 60, 30, 32], [36, 32, 40, 14, 22],
            [46, 22, 46, 20, 42, 'bull'], [56, 42, 68, 40, 64, 'bull'],
            [68, 64, 66, 48, 56, 'gold'], [78, 56, 82, 54, 80, 'bull'], [88, 80, 94, 78, 92, 'bull']
          ],
          callouts: [{ x: 68, y: 30, text: 'Retest IFVG = Entry Instan', tone: 'gold' }]
        }
      ]
    },

    'model-turtle-soup': {
      title: 'Model 4: Turtle Soup & Smart Money Reversal (SMR)',
      pairTag: 'XAU/USD · MODEL #4 REVERSAL',
      priceLabels: ['PDH/BSL', 'CISD', 'Target'],
      stages: [
        {
          label: '1. Jebakan False Breakout',
          caption: 'Harga sengaja mendorong naik menembus PDH/Asia High di pembukaan Killzone agar trader breakout terperangkap Buy tepat di puncak.',
          lines: [{ x1: 10, x2: 92, y1: 70, y2: 70, style: 'dashed', tone: 'sweep', label: 'PDH / BSL (TRAP)', labelSide: 'left' }],
          candles: [
            [16, 44, 68, 42, 64], [26, 64, 66, 52, 56], [36, 56, 70, 54, 68],
            [46, 68, 88, 64, 66, 'sweep']
          ],
          callouts: [{ x: 46, y: 94, text: 'Turtle Soup Sweep di Atas PDH!', tone: 'sweep' }]
        },
        {
          label: '2. Rejection + CISD / M1 Shift',
          caption: 'Setelah sweep, harga langsung banting masuk kembali di bawah PDH dan mematahkan CISD M1/M5. Entry Sell di retest dengan SL di atas puncak sweep.',
          zones: [
            { x1: 64, x2: 92, y1: 66, y2: 90, tone: 'sl', label: 'SL DI ATAS WICK', labelPos: 'tr' },
            { x1: 64, x2: 92, y1: 14, y2: 66, tone: 'tp', label: 'TP OPPOSING SSL (+3R)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 10, x2: 64, y1: 70, y2: 70, style: 'dashed', tone: 'sweep', label: 'PDH', labelSide: 'left' },
            { x1: 36, x2: 92, y1: 56, y2: 56, style: 'solid', tone: 'bear', label: 'CISD / SMR SHIFT', labelSide: 'left' }
          ],
          candles: [
            [16, 44, 68, 42, 64], [26, 64, 66, 52, 56], [36, 56, 70, 54, 68],
            [46, 68, 88, 64, 66, 'sweep'], [56, 66, 68, 46, 48, 'bear'],
            [66, 48, 66, 46, 62, 'gold'], [76, 62, 64, 30, 32, 'bear'], [86, 32, 34, 14, 16, 'bear']
          ]
        }
      ]
    },

    'model-selection-matrix': {
      title: 'Matriks Memilih 1 dari 4 Model Entry Berdasarkan Kondisi Pasar',
      pairTag: 'DECISION TREE · SCALPER',
      priceLabels: ['A+', 'Kondisi', 'Model'],
      stages: [
        {
          label: 'Pasar Trending / Impulsif',
          caption: 'Jika momentum kuat meninggalkan celah lebar: pilih Model 1 (Sweep-FVG) atau Model 3 (IFVG). Jangan paksa tunggu OB terdalam yang sering ditinggal lari.',
          bars: [
            { x1: 6, x2: 47, y1: 52, y2: 88, tone: 'fvg', label: 'Model 1: Sweep-FVG', sub: 'Terbaik saat Displacement bersih' },
            { x1: 53, x2: 94, y1: 52, y2: 88, tone: 'bull', label: 'Model 3: IFVG Flip', sub: 'Terbaik saat reversal cepat M1/M5' },
            { x1: 6, x2: 47, y1: 10, y2: 42, tone: 'neutral', label: 'Model 2: OB Sniper', sub: 'Standby bila retrace dalam' },
            { x1: 53, x2: 94, y1: 10, y2: 42, tone: 'neutral', label: 'Model 4: Turtle Soup', sub: 'Hanya di ekstrem PDH/PDL' }
          ]
        },
        {
          label: 'Reversal di Level Ekstrem',
          caption: 'Saat harga menyapu PDH/PDL/PWH/PWL lalu menolak tajam: pilih Model 4 (Turtle Soup SMR) atau Model 2 (Order Block Sniper) untuk R:R maksimal.',
          bars: [
            { x1: 6, x2: 47, y1: 52, y2: 88, tone: 'neutral', label: 'Model 1: Sweep-FVG', sub: 'Opsi konfirmasi lanjutan' },
            { x1: 53, x2: 94, y1: 52, y2: 88, tone: 'neutral', label: 'Model 3: IFVG Flip', sub: 'Trigger sekunder M1' },
            { x1: 6, x2: 47, y1: 10, y2: 42, tone: 'ob', label: 'Model 2: OB Sniper', sub: 'Aktif saat retrace ke Extreme OB' },
            { x1: 53, x2: 94, y1: 10, y2: 42, tone: 'sweep', label: 'Model 4: Turtle Soup', sub: 'Aktif di Sweep PDH/PDL/Asia' }
          ]
        }
      ]
    },

    // ── LEVEL 5 (WAKTU, KILLZONE WITA & PLAYBOOK) ────────────────────────
    'amd-power-of-three': {
      title: 'Power of Three (AMD): Accumulation → Manipulation → Distribution',
      pairTag: 'XAU/USD · HARIAN BULLISH',
      priceLabels: ['High', 'Open', 'Low'],
      stages: [
        {
          label: '1. Accumulation (Asia)',
          caption: 'Babak 1 (08:00–12:00 WITA): Harga bergerak rapat di sekitar Daily Open membangun kolam likuiditas atas & bawah.',
          zones: [{ x1: 10, x2: 40, y1: 38, y2: 54, tone: 'asia', label: 'A · ACCUMULATION', labelPos: 'tl' }],
          lines: [{ x1: 8, x2: 94, y1: 46, y2: 46, style: 'dashed', tone: 'gold', label: 'DAILY OPEN', labelSide: 'right' }],
          candles: [
            [14, 46, 52, 42, 50], [21, 50, 54, 40, 42], [28, 42, 51, 39, 48], [35, 48, 53, 41, 45]
          ]
        },
        {
          label: '2. Manipulation (Judas Swing)',
          caption: 'Babak 2 (Awal London/NY): Harga sengaja dibanting turun DI BAWAH Daily Open menyapu Asia Low untuk menipu seller breakout.',
          zones: [
            { x1: 10, x2: 40, y1: 38, y2: 54, tone: 'asia', label: 'A · ASIA', labelPos: 'tl' },
            { x1: 41, x2: 60, y1: 14, y2: 46, tone: 'sweep', label: 'M · JUDAS SWING', labelPos: 'tl' }
          ],
          lines: [{ x1: 8, x2: 94, y1: 46, y2: 46, style: 'dashed', tone: 'gold', label: 'DAILY OPEN', labelSide: 'right' }],
          candles: [
            [14, 46, 52, 42, 50], [21, 50, 54, 40, 42], [28, 42, 51, 39, 48], [35, 48, 53, 41, 45],
            [45, 45, 47, 26, 28, 'bear'], [54, 28, 34, 16, 30, 'sweep']
          ],
          callouts: [{ x: 54, y: 8, text: 'Buy Terbaik: DI BAWAH Daily Open!', tone: 'gold' }]
        },
        {
          label: '3. Distribution (Ekspansi Asli)',
          caption: 'Babak 3 (London/NY): Setelah manipulasi penuh, harga melesat naik menembus Daily Open dan Asia High menuju target harian.',
          zones: [
            { x1: 10, x2: 40, y1: 38, y2: 54, tone: 'asia', label: 'A', labelPos: 'tl' },
            { x1: 41, x2: 58, y1: 14, y2: 46, tone: 'sweep', label: 'M', labelPos: 'tl' },
            { x1: 59, x2: 94, y1: 46, y2: 92, tone: 'tp', label: 'D · DISTRIBUTION', labelPos: 'tr' }
          ],
          lines: [{ x1: 8, x2: 94, y1: 46, y2: 46, style: 'dashed', tone: 'gold', label: 'DAILY OPEN', labelSide: 'left' }],
          candles: [
            [14, 46, 52, 42, 50], [21, 50, 54, 40, 42], [28, 42, 51, 39, 48], [35, 48, 53, 41, 45],
            [45, 45, 47, 26, 28], [54, 28, 34, 16, 32, 'gold'],
            [64, 32, 60, 30, 58, 'bull'], [74, 58, 76, 56, 74, 'bull'], [84, 74, 92, 72, 90, 'bull']
          ]
        }
      ]
    },

    'killzones-wita-timeline': {
      title: 'Jadwal Killzone WITA & Jendela Emas Silver Bullet',
      pairTag: 'WITA (UTC+8) · TIME > PRICE',
      priceLabels: ['Puncak', 'Aktif', 'Sepi'],
      stages: [
        {
          label: 'Killzone Utama WITA',
          caption: 'Hanya perlu 2–3 jam fokus per hari: London Killzone (15:00–18:00 WITA) atau New York Killzone (20:30–23:30 WITA).',
          bars: [
            { x1: 4, x2: 24, y1: 14, y2: 44, tone: 'asia', label: 'Asia (08-12)', sub: 'Tandai Range' },
            { x1: 28, x2: 54, y1: 14, y2: 86, tone: 'killzone', label: 'London KZ', sub: '15:00–18:00 WITA' },
            { x1: 58, x2: 68, y1: 14, y2: 32, tone: 'neutral', label: 'Lunch', sub: 'Istirahat' },
            { x1: 72, x2: 96, y1: 14, y2: 94, tone: 'bull', label: 'NY KZ', sub: '20:30–23:30 WITA' }
          ]
        },
        {
          label: 'Jendela Silver Bullet (60 Menit)',
          caption: 'Tiga jendela 1 jam algoritmik berprobabilitas tinggi untuk setup FVG cepat: London SB (15:00–16:00), NY AM SB (22:00–23:00), dan NY PM SB (02:00–03:00 WITA).',
          bars: [
            { x1: 6, x2: 34, y1: 18, y2: 82, tone: 'gold', label: 'London SB', sub: '15:00–16:00 WITA' },
            { x1: 38, x2: 68, y1: 18, y2: 94, tone: 'bull', label: 'NY AM SB ★', sub: '22:00–23:00 WITA (Favorit)' },
            { x1: 72, x2: 94, y1: 18, y2: 68, tone: 'cyan', label: 'NY PM SB', sub: '02:00–03:00 WITA' }
          ],
          callouts: [{ x: 53, y: 10, text: '1 Jam · Cari Sweep → FVG → Target 1:2 R:R', tone: 'gold' }]
        }
      ]
    },

    'news-lock-shield': {
      title: 'Protokol News Lock (-15 Menit / +30 Menit) Anti-Slippage',
      pairTag: 'CPI · NFP · FOMC · WITA',
      priceLabels: ['Spike+', 'Rilis', 'Spike-'],
      stages: [
        {
          label: 'Zona Bahaya (-15m s/d +30m)',
          caption: 'Saat rilis berita merah USD (20:30 / 21:30 WITA), harga Gold bisa whipsaw 2 arah sekaligus dan spread melebar 5×. Dilarang entry baru!',
          zones: [{ x1: 30, x2: 72, y1: 10, y2: 92, tone: 'danger', label: 'NEWS LOCK (-15m / +30m)', labelPos: 'tl' }],
          lines: [{ x1: 46, x2: 46, y1: 10, y2: 92, style: 'solid', tone: 'bear', label: 'T = 0 RILIS', labelSide: 'right' }],
          candles: [
            [14, 48, 54, 44, 52], [22, 52, 55, 47, 50],
            [36, 50, 56, 46, 52], [46, 52, 90, 12, 48, 'bear'],
            [58, 48, 76, 22, 62, 'sweep'], [68, 62, 66, 36, 40]
          ],
          callouts: [{ x: 46, y: 6, text: 'Whipsaw 2 Arah → SL Buyer & Seller Kena Semua', tone: 'bear' }]
        },
        {
          label: 'Post-News Setup (+30m Aman)',
          caption: 'Tunggu 30 menit pasca rilis hingga spread kembali normal dan arah struktur M5 jelas. Gunakan FVG yang tercipta dari dorongan news sebagai tumpangan aman.',
          zones: [
            { x1: 16, x2: 50, y1: 10, y2: 92, tone: 'danger', label: 'LOCKED', labelPos: 'tl' },
            { x1: 52, x2: 94, y1: 44, y2: 58, tone: 'fvg', label: 'POST-NEWS FVG AMAN', labelPos: 'tr' }
          ],
          candles: [
            [24, 48, 52, 44, 46], [36, 46, 78, 22, 72, 'sweep'], [48, 72, 82, 58, 78],
            [62, 78, 80, 48, 54, 'gold'], [74, 54, 84, 52, 82, 'bull'], [86, 82, 94, 80, 92, 'bull']
          ],
          callouts: [{ x: 74, y: 12, text: 'Spread Normal + Arah Jelas = Entry Berkualitas', tone: 'bull' }]
        }
      ]
    },

    'daily-bias-dol': {
      title: 'Menentukan Daily Bias & Draw on Liquidity (DOL)',
      pairTag: 'XAU/USD · DAILY & H4',
      priceLabels: ['PDH (DOL)', 'Open', 'PDL'],
      stages: [
        {
          label: 'Bias Bullish → DOL Atas',
          caption: 'Jika candle kemarin tutup kuat di atas High sebelumnya atau baru saja menyapu PDL dan memantul keras, Draw on Liquidity (magnet harga) mengarah ke PDH.',
          lines: [
            { x1: 10, x2: 92, y1: 84, y2: 84, style: 'dashed', tone: 'gold', label: 'DOL TARGET: PDH', labelSide: 'right' },
            { x1: 10, x2: 92, y1: 24, y2: 24, style: 'dashed', tone: 'sweep', label: 'PDL DISAPU ✓', labelSide: 'left' }
          ],
          candles: [
            [18, 58, 62, 24, 28], [30, 28, 42, 16, 38, 'sweep'],
            [44, 38, 60, 36, 58, 'bull'], [58, 58, 72, 54, 68, 'bull']
          ],
          arrows: [{ x1: 60, y1: 68, x2: 86, y2: 84, tone: 'bull', label: 'Magnet ke PDH' }]
        },
        {
          label: 'Netral / Inside Bar (No Bias)',
          caption: 'Jika harga terjebak di tengah range kemarin (Equilibrium) tanpa menyapu PDH maupun PDL, jangan paksa menebak arah. Tunggu salah satu ujung disapu lebih dulu.',
          zones: [{ x1: 24, x2: 86, y1: 34, y2: 68, tone: 'neutral', label: 'ZONA NETRAL / CHOP', labelPos: 'tr' }],
          lines: [
            { x1: 10, x2: 92, y1: 82, y2: 82, style: 'dotted', tone: 'muted', label: 'PDH', labelSide: 'right' },
            { x1: 10, x2: 92, y1: 20, y2: 20, style: 'dotted', tone: 'muted', label: 'PDL', labelSide: 'right' }
          ],
          candles: [
            [16, 26, 82, 20, 76], [32, 74, 76, 42, 46], [46, 46, 66, 44, 62],
            [60, 62, 64, 38, 42], [74, 42, 60, 40, 54]
          ],
          callouts: [{ x: 54, y: 10, text: 'Tunggu Sweep PDH atau PDL sebelum ambil posisi', tone: 'gold' }]
        }
      ]
    },

    'daily-playbook-flow': {
      title: 'SOP Playbook Harian 15 Menit Sebelum Killzone WITA',
      pairTag: 'CHECKLIST EKSEKUSI',
      priceLabels: ['Tahap 4', 'Tahap 2', 'Tahap 1'],
      stages: [
        {
          label: 'Pra-Sesi (14:45 & 20:15 WITA)',
          caption: 'Jalankan 4 langkah cepat sebelum chart bergerak liar: Cek Kalender Merah → Tandai PDH/PDL/Asia → Tetapkan 1 Bias & DOL → Tentukan 1 Harga Alert.',
          bars: [
            { x1: 6, x2: 26, y1: 22, y2: 82, tone: 'danger', label: '1. News', sub: 'Cek Jam Merah' },
            { x1: 29, x2: 49, y1: 22, y2: 82, tone: 'cyan', label: '2. Level', sub: 'PDH/PDL/Asia' },
            { x1: 52, x2: 72, y1: 22, y2: 82, tone: 'gold', label: '3. Bias', sub: '1 Arah DOL' },
            { x1: 75, x2: 95, y1: 22, y2: 82, tone: 'bull', label: '4. Alert', sub: 'Tunggu & Eksekusi' }
          ]
        },
        {
          label: 'Aturan Tutup Layar',
          caption: 'Batas disiplin harian: maksimal 2–3 setup berkualitas per hari, berhenti total jika mencapai +2R/+3R atau batas rugi -2R harian.',
          bars: [
            { x1: 8, x2: 36, y1: 26, y2: 82, tone: 'bull', label: 'Target +2R/+3R', sub: 'STOP · Amankan Profit' },
            { x1: 39, x2: 65, y1: 26, y2: 82, tone: 'danger', label: 'Batas -2R', sub: 'STOP · Cegah Tilt' },
            { x1: 68, x2: 94, y1: 26, y2: 82, tone: 'gold', label: 'Jurnal 3 Menit', sub: 'Catat & Tutup Chart' }
          ]
        }
      ]
    },

    // ── LEVEL 6 (RISIKO, PSIKOLOGI & KONSISTENSI) ────────────────────────
    'lot-sizing-math': {
      title: 'Rumus Lot XAU/USD: Risiko Konstan 0.5% – 1% per Trade',
      pairTag: 'RISK ENGINE · XAU/USD',
      priceLabels: ['Modal', 'SL ($)', 'Lot'],
      stages: [
        {
          label: 'SL Ketat ($2) vs SL Lebar ($5)',
          caption: 'Dengan saldo $1.000 dan risiko tetap 1% ($10): jika SL $2 (20 pips) → 0.05 lot; jika SL $5 (50 pips) → 0.02 lot. Kerugian dolar SELALU sama!',
          bars: [
            { x1: 6, x2: 46, y1: 18, y2: 84, tone: 'bull', label: 'SL $2.00 (20 pips)', sub: '$10 / ($2 × 100) = 0.05 Lot' },
            { x1: 54, x2: 94, y1: 18, y2: 62, tone: 'gold', label: 'SL $5.00 (50 pips)', sub: '$10 / ($5 × 100) = 0.02 Lot' }
          ],
          callouts: [{ x: 50, y: 92, text: 'Rumus: Lot = Risiko ($) ÷ (Jarak SL $ × 100)', tone: 'cyan' }]
        },
        {
          label: 'Bahaya Lot Statis / Overlot',
          caption: 'Memakai lot tetap 0.10 di semua jarak SL membuat risiko melompat liar dari 2% ke 5%+. Dua kali loss beruntun langsung memicu panik dan balas dendam.',
          bars: [
            { x1: 6, x2: 32, y1: 16, y2: 36, tone: 'bull', label: 'Risiko 1%', sub: '10 Loss = -10% (Aman)' },
            { x1: 36, x2: 64, y1: 16, y2: 66, tone: 'sweep', label: 'Risiko 5%', sub: '10 Loss = -40% (Berat)' },
            { x1: 68, x2: 94, y1: 16, y2: 94, tone: 'danger', label: 'Risiko 10%', sub: '10 Loss = -65% (Kritis)' }
          ]
        }
      ]
    },

    'sl-tp-engineering': {
      title: 'Rekayasa SL Struktural (+Napas Spread) & TP Berbasis Likuiditas',
      pairTag: 'XAU/USD · SL & TP PRESISI',
      priceLabels: ['TP2 BSL', 'TP1 2R', 'SL+Napas'],
      stages: [
        {
          label: 'Penempatan SL & TP Valid',
          caption: 'SL ditaruh di balik swing invalidasi ditambah napas $0.50–$1.00. TP1 di likuiditas terdekat (min 1:2 R:R), TP2 di PDH/BSL mayor.',
          zones: [
            { x1: 42, x2: 90, y1: 42, y2: 88, tone: 'tp', label: 'TP2 BSL (3.2R)', labelPos: 'tr' },
            { x1: 42, x2: 90, y1: 22, y2: 42, tone: 'sl', label: 'SL STRUKTURAL + NAPAS', labelPos: 'tr' }
          ],
          lines: [
            { x1: 36, x2: 92, y1: 72, y2: 72, style: 'dashed', tone: 'bull', label: 'TP1 PARTIAL (2R)', labelSide: 'left' },
            { x1: 36, x2: 92, y1: 42, y2: 42, style: 'solid', tone: 'gold', label: 'ENTRY FVG', labelSide: 'left' },
            { x1: 14, x2: 92, y1: 22, y2: 22, style: 'solid', tone: 'bear', label: 'SL (-1R)', labelSide: 'left' }
          ],
          candles: [
            [18, 44, 48, 28, 32], [28, 32, 62, 30, 60, 'bull'], [38, 60, 62, 40, 44, 'gold'],
            [50, 44, 66, 42, 64, 'bull'], [62, 64, 76, 62, 74, 'bull'], [76, 74, 90, 72, 88, 'bull']
          ]
        },
        {
          label: 'Kesalahan SL Terlalu Sempit',
          caption: 'SL yang ditempel tepat di dalam FVG atau persis di ujung wick tanpa napas spread sering tersapu 0.30 poin sebelum harga terbang ke TP.',
          lines: [
            { x1: 14, x2: 92, y1: 34, y2: 34, style: 'dashed', tone: 'bear', label: 'SL TERLALU SEMPIT (KENA!)', labelSide: 'right' },
            { x1: 14, x2: 92, y1: 22, y2: 22, style: 'solid', tone: 'bull', label: 'SL STRUKTURAL (SELAMAT)', labelSide: 'right' }
          ],
          candles: [
            [18, 44, 48, 28, 32], [28, 32, 62, 30, 60], [38, 60, 62, 40, 44],
            [50, 44, 46, 31, 42, 'sweep'], [64, 42, 74, 40, 72, 'bull'], [78, 72, 92, 70, 90, 'bull']
          ],
          callouts: [{ x: 50, y: 12, text: 'Wick retest menyenggol SL sempit lalu terbang!', tone: 'sweep' }]
        }
      ]
    },

    'trade-management-scale': {
      title: 'Manajemen Trade: Partial 50% di 1:2 R:R & BEP pada Waktu Tepat',
      pairTag: 'XAU/USD · TRADE MANAGEMENT',
      priceLabels: ['Runner 3R+', 'TP1 2R', 'Entry/BEP'],
      stages: [
        {
          label: '1. Jangan BEP Terlalu Cepat',
          caption: 'Menggeser SL ke Break Even saat baru +0.5R membuat posisimu sering kena sapu retest wajar sebelum harga lanjut ke target.',
          lines: [
            { x1: 16, x2: 90, y1: 38, y2: 38, style: 'solid', tone: 'gold', label: 'ENTRY / BEP TERLALU CEPAT', labelSide: 'right' },
            { x1: 16, x2: 90, y1: 18, y2: 18, style: 'dotted', tone: 'muted', label: 'SL ASLI (MASIH AMAN)', labelSide: 'right' }
          ],
          candles: [
            [20, 38, 52, 36, 50], [32, 50, 52, 36, 40, 'sweep'], [46, 40, 68, 38, 66, 'bull'],
            [60, 66, 86, 64, 84, 'bull']
          ],
          callouts: [{ x: 32, y: 26, text: 'Kena BEP $0, lalu nonton harga terbang', tone: 'sweep' }]
        },
        {
          label: '2. Partial di 1:2 + BEP + Runner',
          caption: 'Tunggu BOS internal atau +1.5R/+2R tercapai → tutup 50% posisi (amankan profit pasti), geser SL ke BEP, biarkan 50% sisa lari bebas stres ke BSL!',
          zones: [
            { x1: 52, x2: 90, y1: 72, y2: 92, tone: 'tp', label: 'RUNNER 50% → 3.5R', labelPos: 'tr' }
          ],
          lines: [
            { x1: 14, x2: 90, y1: 72, y2: 72, style: 'dashed', tone: 'bull', label: 'TP1 1:2 → PARTIAL 50% & GESER BEP', labelSide: 'left' },
            { x1: 14, x2: 90, y1: 36, y2: 36, style: 'solid', tone: 'gold', label: 'ENTRY → SL DIGESER KE SINI', labelSide: 'left' }
          ],
          candles: [
            [18, 36, 54, 34, 52, 'bull'], [30, 52, 56, 42, 46], [42, 46, 74, 44, 72, 'gold'],
            [56, 72, 76, 62, 66], [68, 66, 84, 64, 82, 'bull'], [80, 82, 92, 80, 90, 'bull']
          ]
        }
      ]
    },

    'psychology-discipline-loop': {
      title: 'Memutus Lingkaran Setan Tilt & Revenge Trading',
      pairTag: 'PSIKOLOGI · DISIPLIN BAJA',
      priceLabels: ['Stabil', 'Peringatan', 'Tilt'],
      stages: [
        {
          label: 'Pola Gagal (Revenge Loop)',
          caption: '1 Loss → Emosi/Ego → Naikkan Lot (Overlot) → Entry Tanpa Setup → Loss Besar → Akun Hancur dalam 1 malam.',
          bars: [
            { x1: 6, x2: 26, y1: 42, y2: 68, tone: 'sweep', label: '1. Loss -1R', sub: 'Normal' },
            { x1: 29, x2: 49, y1: 28, y2: 76, tone: 'danger', label: '2. Panik/Ego', sub: 'Ingin Cepat Balik' },
            { x1: 52, x2: 72, y1: 16, y2: 86, tone: 'danger', label: '3. Overlot', sub: 'Entry Asal' },
            { x1: 75, x2: 95, y1: 8, y2: 94, tone: 'danger', label: '4. Blowup', sub: 'Hancur 1 Hari' }
          ]
        },
        {
          label: 'Pola Pro (Circuit Breaker)',
          caption: 'Begitu batas rugi harian (-2R) tercapai, aktifkan Circuit Breaker: tutup platform, catat di Jurnal, dan kembali segar besok.',
          bars: [
            { x1: 6, x2: 26, y1: 46, y2: 70, tone: 'neutral', label: '1. Loss -1R', sub: 'Evaluasi Tenang' },
            { x1: 29, x2: 49, y1: 40, y2: 74, tone: 'sweep', label: '2. Batas -2R', sub: 'Circuit Breaker!' },
            { x1: 52, x2: 72, y1: 36, y2: 82, tone: 'cyan', label: '3. Catat Jurnal', sub: 'Tutup Chart' },
            { x1: 75, x2: 95, y1: 30, y2: 90, tone: 'bull', label: '4. Modal Utuh', sub: 'Siap Esok Hari' }
          ]
        }
      ]
    },

    'graduation-100-samples': {
      title: 'Protokol 100 Sample Trade & Evolusi Equity Curve',
      pairTag: 'GRADUATION · ROADMAP PRO',
      priceLabels: ['+35R', '+15R', '0R'],
      stages: [
        {
          label: 'Fase 1–3 (100 Sample)',
          caption: 'Jangan ganti strategi tiap minggu. Eksekusi 1 model favorit (misal Sweep-FVG) selama 100 sample: 30 Backtest → 30 Demo/Micro → 40 Live Terukur.',
          bars: [
            { x1: 6, x2: 32, y1: 16, y2: 52, tone: 'cyan', label: 'Sample 1–30', sub: 'Backtest / Replay' },
            { x1: 36, x2: 64, y1: 16, y2: 72, tone: 'gold', label: 'Sample 31–60', sub: 'Micro Lot / 0.5% Risk' },
            { x1: 68, x2: 94, y1: 16, y2: 92, tone: 'bull', label: 'Sample 61–100', sub: 'Scale 1% · Konsisten' }
          ]
        },
        {
          label: 'Kurva Ekuitas Realistis',
          caption: 'Equity curve trader konsisten TIDAK naik garis lurus. Ada drawdown wajar (-2R hingga -4R) yang selalu ditutup oleh kepatuhan R:R ≥ 1:2.',
          lines: [
            { x1: 10, x2: 24, y1: 22, y2: 34, style: 'solid', tone: 'bull' },
            { x1: 24, x2: 34, y1: 34, y2: 26, style: 'solid', tone: 'bear' },
            { x1: 34, x2: 50, y1: 26, y2: 54, style: 'solid', tone: 'bull' },
            { x1: 50, x2: 62, y1: 54, y2: 44, style: 'solid', tone: 'bear' },
            { x1: 62, x2: 78, y1: 44, y2: 74, style: 'solid', tone: 'bull' },
            { x1: 78, x2: 86, y1: 74, y2: 68, style: 'solid', tone: 'bear' },
            { x1: 86, x2: 94, y1: 68, y2: 88, style: 'solid', tone: 'bull' }
          ],
          callouts: [
            { x: 34, y: 18, text: 'Drawdown Wajar', tone: 'muted' },
            { x: 78, y: 86, text: 'Compounding + Disiplin Jurnal', tone: 'bull' }
          ]
        }
      ]
    },

    // ── MASTERY ICT LANJUTAN & MAPPING MANDIRI (7 BLUEPRINT BARU) ──────────
    'breaker-mitigation-unicorn': {
      title: 'Breaker Block vs Mitigation Block & Konfluensi ICT Unicorn',
      pairTag: 'XAU/USD · BREAKER & UNICORN',
      priceLabels: ['2.656', '2.648', '2.636'],
      stages: [
        {
          label: '1. Sweep → Jebol Struktur',
          caption: 'Harga menyapu BSL (puncak baru) lalu langsung dibanting menembus Swing Low dengan Displacement keras — melahirkan Bearish Breaker Block.',
          zones: [
            { x1: 28, x2: 92, y1: 60, y2: 72, tone: 'ob', label: 'BEARISH BREAKER BLOCK', labelPos: 'tr' }
          ],
          lines: [
            { x1: 8, x2: 52, y1: 80, y2: 80, style: 'dashed', tone: 'sweep', label: 'BSL (Swept)', labelSide: 'left' },
            { x1: 22, x2: 92, y1: 48, y2: 48, style: 'dashed', tone: 'bear', label: 'MSS Jebol', labelSide: 'left' }
          ],
          candles: [
            [12, 56, 78, 54, 74], [20, 74, 76, 50, 52], [28, 52, 62, 48, 60],
            [36, 60, 73, 58, 72, 'gold'], [44, 72, 87, 70, 74, 'sweep'],
            [52, 74, 75, 42, 44, 'bear'], [60, 44, 46, 30, 32]
          ],
          callouts: [
            { x: 44, y: 92, text: 'Sweep BSL (Syarat Breaker)', tone: 'sweep' }
          ]
        },
        {
          label: '2. Irisan ICT Unicorn',
          caption: 'Saat dorongan jatuh meninggalkan SIBI (FVG) yang bertumpuk langsung di atas kotak Breaker Block, area irisannya adalah Zona Unicorn berprobabilitas tertinggi.',
          zones: [
            { x1: 28, x2: 92, y1: 60, y2: 72, tone: 'ob', label: 'BREAKER', labelPos: 'tr' },
            { x1: 52, x2: 92, y1: 54, y2: 68, tone: 'fvg', label: 'UNICORN (BB + FVG)', labelPos: 'tl' }
          ],
          lines: [
            { x1: 52, x2: 92, y1: 88, y2: 88, style: 'solid', tone: 'sl', label: 'SL di Atas Sweep', labelSide: 'right' }
          ],
          candles: [
            [12, 56, 78, 54, 74], [20, 74, 76, 50, 52], [36, 60, 73, 58, 72, 'gold'],
            [44, 72, 87, 70, 74], [52, 74, 75, 40, 42, 'bear'], [60, 42, 45, 34, 38],
            [68, 38, 65, 36, 61], [76, 61, 66, 44, 46, 'bear'], [84, 46, 48, 18, 22, 'bear']
          ],
          arrows: [
            { x1: 72, y1: 64, x2: 86, y2: 20, tone: 'bear', label: 'Entry Unicorn → TP' }
          ],
          callouts: [
            { x: 68, y: 78, text: 'Retest Irisan Breaker + FVG', tone: 'gold' }
          ]
        },
        {
          label: '3. Beda Mitigation Block',
          caption: 'Pada Mitigation Block, puncak kedua GAGAL menyapu High lama (membentuk Lower High) sebelum jebol turun. Tetap valid, namun wajib disertai FVG searah H1.',
          zones: [
            { x1: 34, x2: 92, y1: 56, y2: 68, tone: 'cyan', label: 'MITIGATION BLOCK (TANPA SWEEP)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 8, x2: 56, y1: 84, y2: 84, style: 'dotted', tone: 'muted', label: 'High Lama (Tidak Disapu)', labelSide: 'left' }
          ],
          candles: [
            [14, 52, 84, 50, 78], [24, 78, 80, 46, 48], [34, 48, 68, 46, 66, 'cyan'],
            [44, 66, 74, 62, 64], [54, 64, 65, 34, 36, 'bear'], [66, 36, 60, 34, 58],
            [78, 58, 60, 22, 24, 'bear']
          ],
          callouts: [
            { x: 44, y: 79, text: 'Lower High (Gagal Sweep)', tone: 'cyan' }
          ]
        }
      ]
    },

    'bpr-nwog-ndog': {
      title: 'Balanced Price Range (BPR), Volume Imbalance & NWOG/NDOG',
      pairTag: 'XAU/USD · BPR / VI / NWOG',
      priceLabels: ['2.670', '2.662', '2.654'],
      stages: [
        {
          label: '1. Irisan Bearish BPR',
          caption: 'Harga naik cepat meninggalkan BISI lalu langsung dibanting turun meninggalkan SIBI di rentang yang sama — irisan keduanya adalah dinding kaca BPR.',
          zones: [
            { x1: 20, x2: 52, y1: 42, y2: 64, tone: 'bull', label: 'BISI (Naik)', labelPos: 'tl' },
            { x1: 44, x2: 92, y1: 48, y2: 70, tone: 'bear', label: 'SIBI (Turun)', labelPos: 'tr' },
            { x1: 44, x2: 92, y1: 48, y2: 64, tone: 'gold', label: 'ZONA BPR (OVERLAP)', labelPos: 'tl' }
          ],
          candles: [
            [16, 26, 42, 24, 40], [26, 40, 72, 38, 70, 'bull'], [36, 70, 82, 64, 78],
            [46, 78, 80, 42, 44, 'bear'], [56, 44, 46, 28, 30], [68, 30, 56, 28, 52],
            [78, 52, 55, 22, 24, 'bear'], [86, 24, 26, 14, 16, 'bear']
          ],
          callouts: [
            { x: 68, y: 74, text: 'Retest BPR → Pantulan Keras', tone: 'gold' }
          ]
        },
        {
          label: '2. NWOG & Volume Imbalance',
          caption: 'Tandai NWOG (Close Jumat → Open Senin) beserta 50% CE-nya. Saat struktur reversal terbentuk di Killzone, NWOG bekerja sebagai magnet DOL utama sepanjang minggu.',
          zones: [
            { x1: 8, x2: 92, y1: 22, y2: 36, tone: 'fvg', label: 'NWOG (Close Jumat – Open Senin)', labelPos: 'tr' },
            { x1: 48, x2: 76, y1: 60, y2: 65, tone: 'gold', label: 'VI (Celah Antar-Body)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 8, x2: 92, y1: 29, y2: 29, style: 'dashed', tone: 'gold', label: '50% CE NWOG', labelSide: 'left' }
          ],
          candles: [
            [14, 16, 24, 14, 22], [28, 36, 54, 34, 52], [38, 52, 76, 50, 74],
            [48, 74, 78, 64, 65, 'bear'], [58, 60, 66, 44, 46, 'bear'],
            [70, 46, 61, 44, 58], [80, 58, 59, 28, 30, 'bear'], [88, 30, 32, 20, 22, 'bear']
          ],
          arrows: [
            { x1: 72, y1: 60, x2: 86, y2: 26, tone: 'cyan', label: 'Magnet DOL: NWOG' }
          ]
        }
      ]
    },

    'smt-divergence-gold': {
      title: 'SMT Divergence: Retakan Korelasi XAU/USD vs XAG/USD & DXY',
      pairTag: 'XAU vs XAG / DXY · SMT',
      priceLabels: ['High', 'Mid', 'Low'],
      stages: [
        {
          label: '1. Bullish SMT (Gold vs Silver)',
          caption: 'Pada jam Killzone yang sama di PDL: XAU/USD menyapu SSL membuat Lower Low, sementara XAG/USD (Silver) gagal turun lebih rendah (Higher Low) → sidik jari manipulasi beli!',
          zones: [
            { x1: 8, x2: 48, y1: 12, y2: 88, tone: 'gold', label: 'XAU/USD (GOLD)', labelPos: 'tl' },
            { x1: 52, x2: 92, y1: 12, y2: 88, tone: 'cyan', label: 'XAG/USD (SILVER)', labelPos: 'tl' }
          ],
          lines: [
            { x1: 12, x2: 44, y1: 30, y2: 18, style: 'dashed', tone: 'sweep', label: 'LL (Sweep SSL)', labelSide: 'left' },
            { x1: 56, x2: 88, y1: 24, y2: 36, style: 'dashed', tone: 'bull', label: 'HL (Menolak Turun)', labelSide: 'right' }
          ],
          candles: [
            [16, 60, 64, 28, 32], [24, 32, 54, 30, 50], [32, 50, 52, 16, 22, 'sweep'], [40, 22, 66, 20, 62, 'bull'],
            [60, 58, 62, 22, 26], [68, 26, 52, 24, 48], [76, 48, 50, 34, 38, 'bull'], [84, 38, 72, 36, 70, 'bull']
          ],
          callouts: [
            { x: 50, y: 92, text: 'Timestamp Identik di Killzone → Bullish SMT Valid!', tone: 'bull' }
          ]
        },
        {
          label: '2. Bearish SMT (Gold vs DXY)',
          caption: 'Korelasi terbalik: saat Gold cetak Higher High menyapu PDH, seharusnya DXY cetak Lower Low. Ketika DXY justru cetak Higher Low, Dolar mulai menguat & Gold siap banting turun!',
          zones: [
            { x1: 8, x2: 48, y1: 12, y2: 88, tone: 'gold', label: 'XAU/USD (GOLD)', labelPos: 'tl' },
            { x1: 52, x2: 92, y1: 12, y2: 88, tone: 'bear', label: 'DXY (INDEKS DOLAR)', labelPos: 'tl' }
          ],
          lines: [
            { x1: 12, x2: 44, y1: 68, y2: 82, style: 'dashed', tone: 'sweep', label: 'HH (Sweep BSL)', labelSide: 'left' },
            { x1: 56, x2: 88, y1: 22, y2: 36, style: 'dashed', tone: 'bear', label: 'HL (Gagal LL)', labelSide: 'right' }
          ],
          candles: [
            [16, 40, 70, 38, 66], [24, 66, 68, 48, 50], [32, 50, 84, 48, 78, 'sweep'], [40, 78, 80, 34, 38, 'bear'],
            [60, 54, 56, 20, 24], [68, 24, 48, 22, 46], [76, 46, 48, 34, 38, 'bull'], [84, 38, 72, 36, 70, 'bull']
          ],
          callouts: [
            { x: 50, y: 92, text: 'DXY Gagal Turun = Bearish SMT untuk Gold!', tone: 'bear' }
          ]
        }
      ]
    },

    'mmxm-market-maker-model': {
      title: 'Market Maker Buy Model (MMBM) — Siklus Kurva Lengkap',
      pairTag: 'XAU/USD · MMXM CURVE',
      priceLabels: ['Terminus', 'Mid', 'HTF POI'],
      stages: [
        {
          label: '1. Sisi Kiri (Engineering)',
          caption: 'Dari Original Consolidation (OC), harga turun bertahap menanam tangga Swing High (BSL) menuju HTF PD Array di dasar kurva.',
          zones: [
            { x1: 8, x2: 28, y1: 72, y2: 86, tone: 'asia', label: 'ORIGINAL CONSOLIDATION', labelPos: 'tl' },
            { x1: 36, x2: 64, y1: 10, y2: 24, tone: 'bull', label: 'HTF PD ARRAY (PDL/H1 OB)', labelPos: 'tl' }
          ],
          candles: [
            [12, 76, 84, 73, 81], [18, 81, 85, 74, 76], [24, 76, 82, 72, 74],
            [32, 74, 75, 54, 56], [38, 56, 66, 54, 63], [44, 63, 64, 38, 40],
            [50, 40, 48, 38, 46], [56, 46, 47, 14, 18, 'sweep']
          ],
          callouts: [
            { x: 40, y: 70, text: 'Tangga BSL #1', tone: 'muted' },
            { x: 52, y: 53, text: 'Tangga BSL #2', tone: 'muted' }
          ]
        },
        {
          label: '2. SMR → Re-Accumulation → LRLR',
          caption: 'Di HTF PD Array terjadi Smart Money Reversal (SMR). Harga berpindah ke Buy-Side of the Curve, jeda 1× Re-Accumulation, lalu melesat cepat (LRLR) menyapu Terminus (OC)!',
          zones: [
            { x1: 8, x2: 92, y1: 76, y2: 86, tone: 'tp', label: 'TERMINUS (TARGET AKHIR OC)', labelPos: 'tr' },
            { x1: 36, x2: 62, y1: 10, y2: 24, tone: 'bull', label: 'SMR (TAHAP 1)', labelPos: 'tl' },
            { x1: 64, x2: 78, y1: 44, y2: 56, tone: 'gold', label: 'RE-ACC (TAHAP 2)', labelPos: 'tl' }
          ],
          candles: [
            [12, 76, 84, 73, 81], [22, 81, 82, 72, 74], [32, 74, 75, 52, 56],
            [40, 56, 64, 42, 44], [50, 44, 46, 14, 22, 'sweep'], [58, 22, 48, 20, 46, 'bull'],
            [66, 46, 54, 44, 50], [72, 50, 55, 45, 53, 'gold'],
            [80, 53, 74, 52, 72, 'bull'], [88, 72, 92, 70, 90, 'bull']
          ],
          arrows: [
            { x1: 54, y1: 22, x2: 88, y2: 88, tone: 'bull', label: 'Buy-Side LRLR' }
          ],
          callouts: [
            { x: 74, y: 34, text: 'Bearish FVG Kiri Ditembus Mudah', tone: 'bull' }
          ]
        }
      ]
    },

    'ict-macros-weekly-ipda': {
      title: 'ICT Macros (:50–:10), Weekly Profile & IPDA 20/40/60 Hari',
      pairTag: 'WITA (UTC+8) · TIME ENGINE',
      priceLabels: ['Ekspansi', 'Mid', 'Akumulasi'],
      stages: [
        {
          label: '1. Weekly Profile (Senin–Jumat)',
          caption: 'Classic Bullish Expansion: Senin akumulasi, Selasa/Rabu London membentuk Low of the Week (manipulasi), Rabu–Kamis ekspansi penuh, Jumat waspada TGIF pullback 20–30%.',
          bars: [
            { x1: 6, x2: 22, y1: 36, y2: 54, tone: 'asia', label: 'Senin', sub: 'Akumulasi' },
            { x1: 25, x2: 41, y1: 16, y2: 48, tone: 'sweep', label: 'Selasa', sub: 'Low of Week' },
            { x1: 44, x2: 60, y1: 32, y2: 76, tone: 'bull', label: 'Rabu', sub: 'Ekspansi 1' },
            { x1: 63, x2: 79, y1: 52, y2: 92, tone: 'bull', label: 'Kamis', sub: 'Puncak Tren' },
            { x1: 82, x2: 95, y1: 64, y2: 86, tone: 'gold', label: 'Jumat', sub: 'TGIF -25%' }
          ],
          callouts: [
            { x: 52, y: 8, text: 'Fokus Panen Utama: Selasa–Kamis · Jumat Waspada TGIF', tone: 'gold' }
          ]
        },
        {
          label: '2. Jendela ICT Macro WITA',
          caption: 'Di dalam Killzone NY AM, mesin algoritma aktif tajam pada jendela 20 menit (:50–:10), terutama NY Open Macro 20:50–21:10 dan 21:50–22:10 WITA.',
          zones: [
            { x1: 18, x2: 34, y1: 12, y2: 88, tone: 'killzone', label: '20:50–21:10', labelPos: 'tl' },
            { x1: 58, x2: 74, y1: 12, y2: 88, tone: 'gold', label: '21:50–22:10', labelPos: 'tl' }
          ],
          candles: [
            [10, 46, 52, 44, 48], [16, 48, 50, 42, 44], [24, 44, 45, 26, 30, 'sweep'],
            [32, 30, 58, 29, 55, 'bull'], [44, 55, 60, 48, 50], [54, 50, 54, 45, 47],
            [64, 47, 74, 46, 72, 'bull'], [74, 72, 86, 70, 84, 'bull'], [86, 84, 90, 80, 88]
          ],
          callouts: [
            { x: 26, y: 18, text: 'Macro 1: Sweep', tone: 'sweep' },
            { x: 66, y: 18, text: 'Macro 2: Ekspansi DOL', tone: 'bull' }
          ]
        }
      ]
    },

    'stdev-crt-profiling': {
      title: 'Standard Deviation (-1/-2/-2.5/-4) & Profil Candle CRT / OLHC',
      pairTag: 'XAU/USD · STD DEV & CRT',
      priceLabels: ['-2.5 SD', '-1.0 SD', 'Origin'],
      stages: [
        {
          label: '1. Proyeksi Std Dev (ATH)',
          caption: 'Saat Gold di All-Time High tanpa swing di kiri, tarik Fib dari Manipulation Leg: -1.0 SD = Partial/BEP, -2.0 s.d. -2.5 SD = Sweet Spot TP Utama!',
          zones: [
            { x1: 16, x2: 36, y1: 16, y2: 36, tone: 'sweep', label: 'MANIPULATION LEG', labelPos: 'tl' },
            { x1: 42, x2: 92, y1: 74, y2: 86, tone: 'tp', label: 'SWEET SPOT TP (-2.0 s.d. -2.5 SD)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 16, x2: 92, y1: 16, y2: 16, style: 'solid', tone: 'sl', label: '1.0 (Low Manipulasi)', labelSide: 'right' },
            { x1: 16, x2: 92, y1: 36, y2: 36, style: 'solid', tone: 'muted', label: '0.0 (Origin)', labelSide: 'right' },
            { x1: 36, x2: 92, y1: 56, y2: 56, style: 'dashed', tone: 'cyan', label: '-1.0 SD (Partial/BEP)', labelSide: 'right' },
            { x1: 36, x2: 92, y1: 76, y2: 76, style: 'dashed', tone: 'bull', label: '-2.0 SD (Target Utama)', labelSide: 'right' }
          ],
          candles: [
            [18, 36, 38, 24, 26], [26, 26, 28, 16, 20, 'sweep'], [36, 20, 44, 19, 42, 'bull'],
            [46, 42, 44, 34, 38], [56, 38, 58, 37, 56, 'bull'], [66, 56, 62, 50, 54],
            [76, 54, 82, 53, 80, 'bull'], [86, 80, 86, 72, 74]
          ]
        },
        {
          label: '2. Profil Candle OLHC & CRT',
          caption: 'Candle Bullish H4/Daily sehat mengikuti OLHC: buka di Open → turun menyapu Low Candle 1 (sumbu manipulasi) lalu body tutup kembali di dalam range → Candle 3 melesat ke High!',
          zones: [
            { x1: 16, x2: 88, y1: 34, y2: 74, tone: 'asia', label: 'RANGE CANDLE 1 (CRT)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 14, x2: 90, y1: 74, y2: 74, style: 'dashed', tone: 'tp', label: 'Target CRT (High C1)', labelSide: 'left' },
            { x1: 14, x2: 90, y1: 34, y2: 34, style: 'dashed', tone: 'sweep', label: 'Low C1 (Disapu C2)', labelSide: 'left' }
          ],
          candles: [
            [26, 42, 74, 34, 68, 'cyan'],
            [50, 62, 66, 18, 48, 'sweep'],
            [74, 48, 86, 44, 82, 'bull']
          ],
          callouts: [
            { x: 26, y: 18, text: 'C1: Range', tone: 'cyan' },
            { x: 50, y: 10, text: 'C2: Purge & Tutup di Dalam', tone: 'sweep' },
            { x: 74, y: 92, text: 'C3: Ekspansi OLHC', tone: 'bull' }
          ]
        }
      ]
    },

    'capstone-blank-chart-mapping': {
      title: 'Protokol Mapping Mandiri 6 Langkah (Chart Polos Tanpa Indikator)',
      pairTag: 'CAPSTONE · TOP-DOWN 10 MENIT',
      priceLabels: ['DOL', '50% EQ', 'POI'],
      stages: [
        {
          label: '1. Alur Top-Down 6 Langkah',
          caption: 'Selalu urut dari atas ke bawah: Berita/Weekly → Daily (Origin & DOL) → H1 (Dealing Range & POI) → M15 (Asia & IDM) → M5 (Sweep+CISD di Killzone) → Risiko 0.5–1%.',
          bars: [
            { x1: 6, x2: 20, y1: 60, y2: 90, tone: 'danger', label: '1. News', sub: 'Weekly' },
            { x1: 22, x2: 36, y1: 52, y2: 84, tone: 'gold', label: '2. Daily', sub: 'Origin→DOL' },
            { x1: 38, x2: 52, y1: 44, y2: 78, tone: 'cyan', label: '3. H1', sub: 'Range+POI' },
            { x1: 54, x2: 68, y1: 34, y2: 70, tone: 'sweep', label: '4. M15', sub: 'Asia+IDM' },
            { x1: 70, x2: 84, y1: 24, y2: 62, tone: 'bull', label: '5. M5', sub: 'Trigger' },
            { x1: 86, x2: 96, y1: 14, y2: 54, tone: 'gold', label: '6. Lot', sub: '≤1% Risk' }
          ],
          callouts: [
            { x: 50, y: 8, text: 'Chart Bersih = 1 Bias · 1 DOL · 1–2 POI · 1 Invalidasi', tone: 'gold' }
          ]
        },
        {
          label: '2. Peta Akhir Siap Eksekusi',
          caption: 'Hasil akhir chart polos setelah 10 menit mapping: hanya 5 elemen bersih (DOL di atas, Asia Low/IDM di tengah, 1 POI Discount, 1 garis Invalidasi, dan Entry M5).',
          zones: [
            { x1: 12, x2: 90, y1: 24, y2: 36, tone: 'ob', label: '1 POI UTAMA (DISCOUNT + OTE)', labelPos: 'tr' }
          ],
          lines: [
            { x1: 10, x2: 92, y1: 86, y2: 86, style: 'solid', tone: 'tp', label: 'DOL UTAMA: PDH', labelSide: 'left' },
            { x1: 10, x2: 92, y1: 56, y2: 56, style: 'dotted', tone: 'muted', label: '50% EQ H1', labelSide: 'right' },
            { x1: 10, x2: 62, y1: 44, y2: 44, style: 'dashed', tone: 'sweep', label: 'IDM / Asia Low ($$$)', labelSide: 'left' },
            { x1: 10, x2: 92, y1: 14, y2: 14, style: 'solid', tone: 'sl', label: 'GARIS INVALIDASI BIAS', labelSide: 'left' }
          ],
          candles: [
            [18, 46, 62, 44, 58], [28, 58, 66, 46, 52], [38, 52, 54, 43, 46],
            [48, 46, 50, 26, 30, 'sweep'], [58, 30, 48, 29, 46, 'bull'],
            [68, 46, 52, 34, 42, 'gold'], [78, 42, 68, 40, 66, 'bull'], [88, 66, 88, 64, 86, 'bull']
          ],
          arrows: [
            { x1: 68, y1: 38, x2: 88, y2: 86, tone: 'bull', label: '1:4 R:R ke DOL' }
          ]
        }
      ]
    }
  };

  function renderGrid(priceLabels) {
    const labels = Array.isArray(priceLabels) && priceLabels.length === 3 ? priceLabels : ['High', 'Mid', 'Low'];
    const yTicks = [85, 50, 15];
    let out = `<rect x="${PLOT.left}" y="${PLOT.top}" width="${PLOT_W}" height="${PLOT_H}" rx="8" fill="var(--acd-chart-bg, rgba(9, 14, 24, 0.72))" stroke="var(--acd-grid-border, rgba(148, 163, 184, 0.18))" stroke-width="1"/>`;

    yTicks.forEach((pct, i) => {
      const y = mapY(pct);
      out += `<line x1="${PLOT.left}" y1="${y}" x2="${PLOT.right}" y2="${y}" stroke="var(--acd-grid, rgba(148, 163, 184, 0.12))" stroke-dasharray="3 4" stroke-width="1"/>`;
      out += `<text x="${PLOT.right + 8}" y="${y + 4}" fill="var(--acd-muted, #94a3b8)" font-size="10.5" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(labels[i])}</text>`;
    });

    [25, 50, 75].forEach(xPct => {
      const x = mapX(xPct);
      out += `<line x1="${x}" y1="${PLOT.top}" x2="${x}" y2="${PLOT.bottom}" stroke="var(--acd-grid, rgba(148, 163, 184, 0.08))" stroke-width="1"/>`;
    });

    return out;
  }

  function renderZones(zones) {
    if (!Array.isArray(zones)) return '';
    return zones.map(z => {
      const x1 = mapX(Math.min(z.x1, z.x2));
      const x2 = mapX(Math.max(z.x1, z.x2));
      const yTop = mapY(Math.max(z.y1, z.y2));
      const yBot = mapY(Math.min(z.y1, z.y2));
      const w = Math.max(4, x2 - x1);
      const h = Math.max(4, yBot - yTop);
      const t = toneOf(z.tone);

      let labelMarkup = '';
      if (z.label) {
        const isRight = z.labelPos === 'tr';
        const lx = isRight ? x2 - 8 : x1 + 8;
        const anchor = isRight ? 'end' : 'start';
        const ly = Math.min(yBot - 6, yTop + 14);
        labelMarkup = `<text x="${lx}" y="${ly}" text-anchor="${anchor}" fill="${t.text}" font-size="10.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(z.label)}</text>`;
      }

      return `<g class="acd-zone">
        <rect x="${x1}" y="${yTop}" width="${w}" height="${h}" rx="4" fill="${t.fill}" stroke="${t.stroke}" stroke-opacity="0.55" stroke-width="1"/>
        ${labelMarkup}
      </g>`;
    }).join('');
  }

  function renderBars(bars) {
    if (!Array.isArray(bars)) return '';
    return bars.map(b => {
      const x1 = mapX(b.x1);
      const x2 = mapX(b.x2);
      const yTop = mapY(Math.max(b.y1, b.y2));
      const yBot = mapY(Math.min(b.y1, b.y2));
      const w = Math.max(20, x2 - x1);
      const h = Math.max(24, yBot - yTop);
      const cx = +(x1 + w / 2).toFixed(1);
      const cy = +(yTop + h / 2).toFixed(1);
      const t = toneOf(b.tone);

      return `<g class="acd-bar">
        <rect x="${x1}" y="${yTop}" width="${w}" height="${h}" rx="8" fill="${t.fill}" stroke="${t.stroke}" stroke-width="1.5"/>
        <text x="${cx}" y="${b.sub ? cy - 4 : cy + 4}" text-anchor="middle" fill="var(--acd-ink, #f8fafc)" font-size="12" font-weight="700">${esc(b.label)}</text>
        ${b.sub ? `<text x="${cx}" y="${cy + 13}" text-anchor="middle" fill="${t.text}" font-size="10" font-weight="600" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(b.sub)}</text>` : ''}
      </g>`;
    }).join('');
  }

  function renderLines(lines) {
    if (!Array.isArray(lines)) return '';
    return lines.map(ln => {
      const x1 = mapX(ln.x1);
      const x2 = mapX(ln.x2);
      const y1 = mapY(ln.y1);
      const y2 = mapY(ln.y2);
      const t = toneOf(ln.tone);
      const dash = ln.style === 'dashed' ? '6 4' : ln.style === 'dotted' ? '2 4' : '';

      return `<g class="acd-line">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.stroke}" stroke-width="1.6" ${dash ? `stroke-dasharray="${dash}"` : ''}/>
      </g>`;
    }).join('');
  }

  function renderLineLabels(lines) {
    if (!Array.isArray(lines)) return '';
    return lines.filter(ln => ln && ln.label).map(ln => {
      const x1 = mapX(ln.x1);
      const x2 = mapX(ln.x2);
      const y1 = mapY(ln.y1);
      const t = toneOf(ln.tone);
      const isLeft = ln.labelSide === 'left';
      const lx = isLeft ? x1 + 6 : x2 - 6;
      const anchor = isLeft ? 'start' : 'end';
      const ly = Math.max(PLOT.top + 13, y1 - 6);
      const estW = Math.min(260, Math.max(42, String(ln.label).length * 6.5 + 10));
      const rx = isLeft ? lx - 4 : lx - estW + 4;
      return `<g class="acd-line-label">
        <rect x="${rx.toFixed(1)}" y="${(ly - 11).toFixed(1)}" width="${estW.toFixed(1)}" height="14" rx="3" fill="var(--acd-chart-bg, #0b1220)" fill-opacity="0.92"/>
        <text x="${lx}" y="${ly}" text-anchor="${anchor}" fill="${t.text}" font-size="10.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(ln.label)}</text>
      </g>`;
    }).join('');
  }

  function renderCandles(candles) {
    if (!Array.isArray(candles) || candles.length === 0) return '';
    const bodyW = candles.length <= 4 ? 22 : candles.length <= 7 ? 16 : 12;
    const half = bodyW / 2;

    return candles.map(c => {
      const [xPct, o, h, l, cl, highlight] = c;
      const cx = mapX(xPct);
      const yO = mapY(o);
      const yH = mapY(h);
      const yL = mapY(l);
      const yC = mapY(cl);
      const isBull = cl >= o;
      const bodyTop = Math.min(yO, yC);
      const bodyH = Math.max(3, Math.abs(yC - yO));
      const color = isBull ? 'var(--acd-bull, #22c55e)' : 'var(--acd-bear, #ef4444)';
      const ring = highlight ? toneOf(highlight).stroke : '';

      return `<g class="acd-candle">
        ${ring ? `<rect x="${(cx - half - 4).toFixed(1)}" y="${(yH - 4).toFixed(1)}" width="${(bodyW + 8).toFixed(1)}" height="${Math.max(12, yL - yH + 8).toFixed(1)}" rx="5" fill="none" stroke="${ring}" stroke-width="1.4" stroke-dasharray="3 2" opacity="0.9"/>` : ''}
        <line x1="${cx}" y1="${yH}" x2="${cx}" y2="${yL}" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
        <rect x="${(cx - half).toFixed(1)}" y="${bodyTop.toFixed(1)}" width="${bodyW}" height="${bodyH.toFixed(1)}" rx="2" fill="${color}"/>
      </g>`;
    }).join('');
  }

  function renderArrows(arrows) {
    if (!Array.isArray(arrows)) return '';
    return arrows.map((a, idx) => {
      const x1 = mapX(a.x1);
      const y1 = mapY(a.y1);
      const x2 = mapX(a.x2);
      const y2 = mapY(a.y2);
      const t = toneOf(a.tone);
      const mx = +((x1 + x2) / 2).toFixed(1);
      const my = +((y1 + y2) / 2 - 8).toFixed(1);
      const markerId = `acd-arr-${idx}-${a.tone || 'gold'}`;
      return `<g class="acd-arrow">
        <defs>
          <marker id="${markerId}" markerWidth="8" markerHeight="8" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 8 3.5, 0 7" fill="${t.stroke}"/>
          </marker>
        </defs>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.stroke}" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#${markerId})"/>
        ${a.label ? `<text x="${mx}" y="${my}" text-anchor="middle" fill="${t.text}" font-size="10.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(a.label)}</text>` : ''}
      </g>`;
    }).join('');
  }

  function renderCallouts(callouts) {
    if (!Array.isArray(callouts)) return '';
    return callouts.map(c => {
      const t = toneOf(c.tone);
      const txt = String(c.text || '');
      const pillW = Math.min(340, Math.max(66, txt.length * 6.4 + 18));
      const rawX = mapX(c.x);
      const cx = clamp(rawX, PLOT.left + pillW / 2 + 4, PLOT.right - pillW / 2 - 4);
      const cy = clamp(mapY(c.y), PLOT.top + 14, PLOT.bottom - 14);
      return `<g class="acd-callout">
        <rect x="${(cx - pillW / 2).toFixed(1)}" y="${(cy - 11).toFixed(1)}" width="${pillW.toFixed(1)}" height="22" rx="6" fill="var(--acd-callout-bg, #0d1526)" stroke="${t.stroke}" stroke-width="1.2"/>
        <text x="${cx.toFixed(1)}" y="${(cy + 3.5).toFixed(1)}" text-anchor="middle" fill="${t.text}" font-size="10.5" font-weight="700">${esc(txt)}</text>
      </g>`;
    }).join('');
  }

  function getDiagramIds() {
    return Object.keys(BLUEPRINTS);
  }

  function hasDiagram(id) {
    return Object.prototype.hasOwnProperty.call(BLUEPRINTS, id);
  }

  function getDiagramBlueprint(id) {
    return BLUEPRINTS[id] || null;
  }

  function renderDiagramSVG(diagramId, stageIndex) {
    const bp = BLUEPRINTS[diagramId] || BLUEPRINTS['model-sweep-fvg'];
    const totalStages = bp.stages.length;
    const idx = Math.max(0, Math.min(totalStages - 1, Number(stageIndex) || 0));
    const stage = bp.stages[idx];

    const svg = [
      `<svg class="acd-svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="${esc(bp.title)} — ${esc(stage.label)}" xmlns="http://www.w3.org/2000/svg">`,
      `<text x="${PLOT.left}" y="19" fill="var(--acd-muted, #94a3b8)" font-size="10.5" font-weight="700" letter-spacing="0.06em" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(bp.pairTag)}</text>`,
      `<text x="${PLOT.right}" y="19" text-anchor="end" fill="var(--acd-gold, #f5b942)" font-size="10.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(stage.label.toUpperCase())}</text>`,
      renderGrid(bp.priceLabels),
      renderZones(stage.zones),
      renderBars(stage.bars),
      renderLines(stage.lines),
      renderCandles(stage.candles),
      renderLineLabels(stage.lines),
      renderArrows(stage.arrows),
      renderCallouts(stage.callouts),
      `</svg>`
    ].join('');

    return {
      diagramId,
      title: bp.title,
      pairTag: bp.pairTag,
      stages: bp.stages.map((s, i) => ({ index: i, label: s.label })),
      activeIndex: idx,
      caption: stage.caption,
      svg
    };
  }

  return Object.freeze({
    getDiagramIds,
    hasDiagram,
    getDiagramBlueprint,
    renderDiagramSVG
  });
});
