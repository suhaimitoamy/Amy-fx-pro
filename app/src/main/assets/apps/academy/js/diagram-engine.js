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
      pairTag: 'BAGIAN I · FONDASI AKUN',
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
          caption: 'BUY dibuka di garis ASK (atas) dan ditutup di BID (bawah), sehingga posisi baru langsung minus tipis sebesar Spread ($0,30 / 3 Pips).',
          priceDecimals: 2,
          series: [
            { o: 2649.20, h: 2649.55, l: 2649.00, c: 2649.45 },
            { o: 2649.45, h: 2649.70, l: 2649.30, c: 2649.35 },
            { o: 2649.35, h: 2649.85, l: 2649.25, c: 2649.75 },
            { o: 2649.75, h: 2650.10, l: 2649.60, c: 2649.95 },
            { o: 2649.95, h: 2650.20, l: 2649.70, c: 2649.80 },
            { o: 2649.80, h: 2650.15, l: 2649.65, c: 2650.05 },
            { o: 2650.05, h: 2650.28, l: 2649.90, c: 2650.00 },
            { o: 2650.00, h: 2650.38, l: 2649.88, c: 2650.25 },
            { o: 2650.25, h: 2650.70, l: 2650.15, c: 2650.60 },
            { o: 2650.60, h: 2650.85, l: 2650.45, c: 2650.50 },
            { o: 2650.50, h: 2651.05, l: 2650.40, c: 2650.95 },
            { o: 2650.95, h: 2651.25, l: 2650.80, c: 2650.85 },
            { o: 2650.85, h: 2651.40, l: 2650.75, c: 2651.30 },
            { o: 2651.30, h: 2651.55, l: 2651.15, c: 2651.45 }
          ],
          seriesZones: [
            { low: 2650.00, high: 2650.30, tone: 'sweep', label: 'SPREAD $0,30 (3 PIPS)', labelPos: 'tr', labelFront: true }
          ],
          seriesLevels: [
            { price: 2650.30, tone: 'bear', style: 'solid', label: 'ASK 2.650,30 (Buka BUY)', labelSide: 'left', labelPos: 'above' },
            { price: 2650.00, tone: 'bull', style: 'solid', label: 'BID 2.650,00 (Buka SELL)', labelSide: 'left', labelPos: 'below' }
          ],
          seriesCallouts: [
            { idx: 9.5, price: 2649.25, text: 'Aktifkan Ask Line di MT5 agar SL Sell tidak mengejutkan', tone: 'gold' }
          ]
        },
        {
          label: 'Hitung Pips & Point Gold',
          caption: 'Di XAU/USD, perubahan $1,00 = 10 Pips = 100 Points. Naik $5,00 (2.650,00 → 2.655,00) = 50 Pips (500 Points).',
          priceDecimals: 2,
          series: [
            { o: 2649.40, h: 2649.90, l: 2649.10, c: 2649.70 },
            { o: 2649.70, h: 2650.10, l: 2649.40, c: 2649.55 },
            { o: 2649.55, h: 2650.25, l: 2649.45, c: 2650.00 },
            { o: 2650.00, h: 2650.90, l: 2649.85, c: 2650.70 },
            { o: 2650.70, h: 2651.35, l: 2650.50, c: 2651.10 },
            { o: 2651.10, h: 2651.45, l: 2650.75, c: 2650.90 },
            { o: 2650.90, h: 2652.20, l: 2650.80, c: 2652.00 },
            { o: 2652.00, h: 2652.95, l: 2651.80, c: 2652.75 },
            { o: 2652.75, h: 2653.15, l: 2652.25, c: 2652.45 },
            { o: 2652.45, h: 2653.65, l: 2652.35, c: 2653.45 },
            { o: 2653.45, h: 2654.35, l: 2653.25, c: 2654.15 },
            { o: 2654.15, h: 2654.50, l: 2653.70, c: 2653.95 },
            { o: 2653.95, h: 2655.15, l: 2653.85, c: 2655.00 },
            { o: 2655.00, h: 2655.50, l: 2654.70, c: 2655.30 }
          ],
          seriesZones: [
            { fromIdx: 2, toIdx: 12, low: 2650.00, high: 2655.00, tone: 'tp', label: '+$5,00 = 50 PIPS (500 PTS)', labelPos: 'tl', labelFront: true }
          ],
          seriesLevels: [
            { price: 2655.00, tone: 'bull', style: 'dashed', label: 'TARGET 2.655,00 (+50 Pips)', labelSide: 'left', labelPos: 'above' },
            { price: 2651.00, tone: 'cyan', style: 'dotted', label: '2.651,00 (+$1 = 10 Pips)', labelSide: 'right', labelPos: 'below' },
            { price: 2650.00, tone: 'gold', style: 'solid', label: 'ENTRY 2.650,00', labelSide: 'left', labelPos: 'below' }
          ],
          seriesCallouts: [
            { idx: 9.2, price: 2649.35, text: 'Hafalkan: $1,00 Gold = 10 Pips = 100 Points', tone: 'bull' }
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
          seriesSlots: 15,
          series: [
            { o: 2653.6, h: 2655.2, l: 2653.1, c: 2654.8 },
            { o: 2654.8, h: 2656.4, l: 2654.4, c: 2656.0 },
            { o: 2656.0, h: 2656.8, l: 2654.8, c: 2655.1 },
            { o: 2655.1, h: 2655.6, l: 2653.5, c: 2653.9 },
            { o: 2653.9, h: 2655.4, l: 2653.6, c: 2655.0 },
            { o: 2655.0, h: 2656.5, l: 2654.7, c: 2656.1 },
            { o: 2656.1, h: 2656.5, l: 2654.5, c: 2654.8 },
            { o: 2654.8, h: 2655.8, l: 2654.2, c: 2655.4 },
            { o: 2655.4, h: 2655.9, l: 2654.6, c: 2655.0 }
          ],
          seriesLevels: [
            { price: 2662.0, tone: 'bear', style: 'dashed', label: 'SELL LIMIT 2.662,0 (Di Atas)', labelSide: 'left', labelPos: 'above' },
            { price: 2655.0, tone: 'gold', style: 'solid', label: 'HARGA SEKARANG 2.655,0', labelSide: 'left', labelPos: 'above' },
            { price: 2648.0, tone: 'bull', style: 'dashed', label: 'BUY LIMIT 2.648,0 (Di Bawah)', labelSide: 'left', labelPos: 'below' }
          ],
          seriesArrows: [
            { fromIdx: 8.7, fromPrice: 2655.5, toIdx: 11.4, toPrice: 2661.6, tone: 'muted', label: 'Jemput', labelDx: -16, labelDy: -6 },
            { fromIdx: 11.7, fromPrice: 2661.6, toIdx: 14.3, toPrice: 2656.8, tone: 'bear', label: 'Pantul Sell', labelDx: 12, labelDy: -10 },
            { fromIdx: 8.7, fromPrice: 2654.5, toIdx: 11.4, toPrice: 2648.4, tone: 'muted', label: 'Jemput', labelDx: -16, labelDy: 10 },
            { fromIdx: 11.7, fromPrice: 2648.4, toIdx: 14.3, toPrice: 2653.2, tone: 'bull', label: 'Pantul Buy', labelDx: 12, labelDy: 12 }
          ]
        },
        {
          label: 'Buy Stop & Sell Stop',
          caption: 'STOP = ikut searah TEMBUSAN (breakout). Buy Stop dipasang DI ATAS harga sekarang; Sell Stop DI BAWAH harga sekarang.',
          seriesSlots: 15,
          series: [
            { o: 2653.6, h: 2655.2, l: 2653.1, c: 2654.8 },
            { o: 2654.8, h: 2656.4, l: 2654.4, c: 2656.0 },
            { o: 2656.0, h: 2656.8, l: 2654.8, c: 2655.1 },
            { o: 2655.1, h: 2655.6, l: 2653.5, c: 2653.9 },
            { o: 2653.9, h: 2655.4, l: 2653.6, c: 2655.0 },
            { o: 2655.0, h: 2656.5, l: 2654.7, c: 2656.1 },
            { o: 2656.1, h: 2656.5, l: 2654.5, c: 2654.8 },
            { o: 2654.8, h: 2655.8, l: 2654.2, c: 2655.4 },
            { o: 2655.4, h: 2655.9, l: 2654.6, c: 2655.0 }
          ],
          seriesLevels: [
            { price: 2660.0, tone: 'bull', style: 'dashed', label: 'BUY STOP 2.660,0 (Tembus Atas)', labelSide: 'left', labelPos: 'above' },
            { price: 2655.0, tone: 'gold', style: 'solid', label: 'HARGA SEKARANG 2.655,0', labelSide: 'left', labelPos: 'above' },
            { price: 2650.0, tone: 'bear', style: 'dashed', label: 'SELL STOP 2.650,0 (Tembus Bawah)', labelSide: 'left', labelPos: 'below' }
          ],
          seriesArrows: [
            { fromIdx: 8.7, fromPrice: 2655.5, toIdx: 14.2, toPrice: 2663.6, tone: 'bull', label: 'Tembus → Buy', labelDx: -8, labelDy: -16 },
            { fromIdx: 8.7, fromPrice: 2654.5, toIdx: 14.2, toPrice: 2646.4, tone: 'bear', label: 'Tembus → Sell', labelDx: -8, labelDy: 18 }
          ],
          seriesCallouts: [
            { idx: 4.5, price: 2647.1, text: 'Selalu lengkapi SL & TP sebelum klik Place', tone: 'gold' }
          ]
        }
      ]
    },

    'zero-ohlc-timeframe': {
      title: '4 Titik Harga Candlestick (OHLC) & Pecahan Timeframe',
      pairTag: 'BAGIAN I · CHART & TIMEFRAME',
      priceLabels: ['High', 'Mid', 'Low'],
      stages: [
        {
          label: '4 Titik Harga (OHLC)',
          caption: 'Candle Hijau = harga tutup (Close) lebih tinggi dari buka (Open). Candle Merah = tutup lebih rendah dari buka. Garis tipis = High & Low.',
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
          label: '1 Candle H1 = 4 Candle M15',
          caption: 'Timeframe besar (H1) merangkum perjalanan 4 candle M15 (atau 12 candle M5) di dalamnya. Lihat H1 untuk arah, M15/M5 untuk detail.',
          zones: [
            { x1: 8, x2: 32, y1: 14, y2: 86, tone: 'gold', label: '1 CANDLE H1 (60 MNT)', labelPos: 'tl' },
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
      title: 'Anatomi Candlestick: 4 Titik OHLC, Wick Sweep & Pecahan Timeframe',
      pairTag: 'XAU/USD · BACA PRICE ACTION',
      priceLabels: ['High', 'Mid', 'Low'],
      stages: [
        {
          label: 'Anatomi 4 Titik OHLC',
          caption: 'Candle Hijau (Bullish) ditutup di atas Open — bukti buyer mendominasi. Candle Merah (Bearish) ditutup di bawah Open — seller mendominasi. Garis tipis atas/bawah adalah Wick (High & Low).',
          ohlcAnatomy: {
            bull: { o: 26, h: 92, l: 10, c: 76, title: 'BULLISH CANDLE', sub: 'Close > Open (Naik)' },
            bear: { o: 76, h: 92, l: 10, c: 26, title: 'BEARISH CANDLE', sub: 'Close < Open (Turun)' }
          }
        },
        {
          label: 'Wick Sweep / Penolakan',
          caption: 'Wick panjang menembus Support (SSL) atau Resistance (BSL) lalu menutup body kembali masuk menandakan Stop Hunt & penolakan keras — bukan breakout sejati.',
          series: [
            { o: 2650.2, h: 2651.2, l: 2648.8, c: 2649.1 },
            { o: 2649.1, h: 2649.6, l: 2647.4, c: 2647.7 },
            { o: 2647.7, h: 2648.4, l: 2645.9, c: 2646.3 },
            { o: 2646.3, h: 2646.9, l: 2645.2, c: 2645.6 },
            { o: 2645.6, h: 2648.2, l: 2641.6, c: 2647.8 },
            { o: 2647.8, h: 2650.4, l: 2647.4, c: 2650.0 },
            { o: 2650.0, h: 2651.8, l: 2649.4, c: 2651.4 },
            { o: 2651.4, h: 2652.0, l: 2650.3, c: 2650.7 },
            { o: 2650.7, h: 2652.8, l: 2650.4, c: 2652.5 },
            { o: 2652.5, h: 2653.4, l: 2651.8, c: 2652.1 },
            { o: 2652.1, h: 2653.6, l: 2651.9, c: 2653.3 },
            { o: 2653.3, h: 2653.9, l: 2652.6, c: 2653.6 },
            { o: 2653.6, h: 2657.4, l: 2650.9, c: 2651.3 },
            { o: 2651.3, h: 2651.9, l: 2649.0, c: 2649.4 },
            { o: 2649.4, h: 2649.9, l: 2647.2, c: 2647.6 },
            { o: 2647.6, h: 2648.3, l: 2646.2, c: 2646.8 }
          ],
          seriesLevels: [
            { price: 2654.0, tone: 'sweep', style: 'dashed', label: 'RESISTANCE / BSL 2.654,0', labelSide: 'left', labelPos: 'above' },
            { price: 2645.0, tone: 'sweep', style: 'dashed', label: 'SUPPORT / SSL 2.645,0', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 4, which: 'low', tone: 'ink' },
            { idx: 12, which: 'high', tone: 'ink' }
          ],
          seriesCallouts: [
            { idx: 4.8, price: 2639.0, text: 'Wick Bawah Panjang = Sweep SSL', tone: 'bull' },
            { idx: 11.4, price: 2659.9, text: 'Wick Atas Panjang = Sweep BSL', tone: 'bear' }
          ]
        },
        {
          label: '1 Candle H1 = 4 Candle M15',
          caption: 'Satu candle H1 (60 menit) merangkum persis 4 candle M15 (4 × 15 menit): Open, High, Low, dan Close identik. Gunakan H1 untuk peta besar, M15/M5 untuk detail eksekusi.',
          mtfSplit: {
            htfLabel: '1 CANDLE H1 (60 MNT)',
            ltfLabel: 'ISI DI M15 (4 × 15 MNT)',
            htf: { o: 2648.0, h: 2656.0, l: 2646.0, c: 2654.4 },
            ltf: [
              { label: '15:00', o: 2648.0, h: 2649.8, l: 2646.0, c: 2647.2 },
              { label: '15:15', o: 2647.2, h: 2651.6, l: 2647.0, c: 2651.2 },
              { label: '15:30', o: 2651.2, h: 2653.8, l: 2650.4, c: 2653.2 },
              { label: '15:45', o: 2653.2, h: 2656.0, l: 2652.8, c: 2654.4 }
            ]
          }
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
          caption: 'Liquidity & akurasi struktur XAU/USD memuncak pada Sesi London (15:00–18:00) dan NY Overlap (20:30–23:30 WITA). Hindari jam Rollover (05:00–07:00).',
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
          caption: 'Posisi Sell ditutup oleh harga ASK (lebih tinggi sebesar spread). Wajib tambah napas $0,50–$1,00 di atas Swing High agar SL tidak tersentuh spread saat retest.',
          series: [
            { o: 2646.2, h: 2647.6, l: 2645.8, c: 2647.4 },
            { o: 2647.4, h: 2649.1, l: 2647.1, c: 2648.9 },
            { o: 2648.9, h: 2650.0, l: 2648.4, c: 2649.3 },
            { o: 2649.3, h: 2649.6, l: 2647.2, c: 2647.5 },
            { o: 2647.5, h: 2648.2, l: 2646.9, c: 2648.0 },
            { o: 2648.0, h: 2649.1, l: 2647.7, c: 2648.8 },
            { o: 2648.8, h: 2649.8, l: 2647.4, c: 2647.7 },
            { o: 2647.7, h: 2648.1, l: 2646.0, c: 2646.3 },
            { o: 2646.3, h: 2646.8, l: 2645.1, c: 2645.4 },
            { o: 2645.4, h: 2646.1, l: 2645.0, c: 2645.8 },
            { o: 2645.8, h: 2646.0, l: 2644.2, c: 2644.5 },
            { o: 2644.5, h: 2645.0, l: 2643.6, c: 2643.9 },
            { o: 2643.9, h: 2644.4, l: 2643.2, c: 2644.1 },
            { o: 2644.1, h: 2644.3, l: 2642.8, c: 2643.2 }
          ],
          seriesZones: [
            { low: 2650.0, high: 2651.2, tone: 'sl', label: 'BUFFER SPREAD ($1,20)', labelPos: 'tr', labelFront: true }
          ],
          seriesLevels: [
            { price: 2651.2, tone: 'bear', style: 'solid', label: 'SL AMAN 2.651,2 (+Buffer)', labelSide: 'left', labelPos: 'above' },
            { price: 2650.3, tone: 'sweep', style: 'dashed', label: 'ASK (+Spread $0,30)', labelSide: 'right', labelPos: 'below' },
            { price: 2650.0, tone: 'gold', style: 'solid', label: 'SWING HIGH 2.650,0', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'high', tone: 'ink' }
          ],
          seriesCallouts: [
            { idx: 4.5, price: 2643.4, text: 'Retest BID 2.649,8 → ASK 2.650,1 (SL nempel kena!)', tone: 'sweep' }
          ]
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
          caption: 'Selama Higher Low (HL) terakhir bertahan, tren tetap Bullish. Pullback ke HL adalah peluang beli mengikuti arah BOS naik, bukan alasan melawan tren.',
          series: [
            { o: 2641.2, h: 2642.8, l: 2640.5, c: 2642.5 },
            { o: 2642.5, h: 2645.2, l: 2642.1, c: 2644.9 },
            { o: 2644.9, h: 2646.4, l: 2644.5, c: 2646.0 },
            { o: 2646.0, h: 2646.3, l: 2644.4, c: 2644.7 },
            { o: 2644.7, h: 2645.1, l: 2643.2, c: 2643.6 },
            { o: 2643.6, h: 2645.4, l: 2642.6, c: 2645.0 },
            { o: 2645.0, h: 2647.8, l: 2644.7, c: 2647.5 },
            { o: 2647.5, h: 2650.2, l: 2647.2, c: 2649.8 },
            { o: 2649.8, h: 2650.5, l: 2648.4, c: 2648.7 },
            { o: 2648.7, h: 2649.1, l: 2647.0, c: 2647.4 },
            { o: 2647.4, h: 2648.8, l: 2646.2, c: 2648.5 },
            { o: 2648.5, h: 2651.6, l: 2648.2, c: 2651.2 },
            { o: 2651.2, h: 2653.8, l: 2650.9, c: 2653.4 },
            { o: 2653.4, h: 2654.4, l: 2652.0, c: 2652.4 },
            { o: 2652.4, h: 2655.6, l: 2652.1, c: 2655.2 },
            { o: 2655.2, h: 2656.8, l: 2654.6, c: 2656.2 }
          ],
          seriesLevels: [
            { price: 2646.4, fromIdx: 2, toIdx: 7, tone: 'bull', style: 'dashed', label: 'BOS 1', labelSide: 'left', labelPos: 'above' },
            { price: 2650.5, fromIdx: 8, toIdx: 12, tone: 'bull', style: 'dashed', label: 'BOS 2', labelSide: 'left', labelPos: 'above' }
          ],
          seriesWickRings: [
            { idx: 5, which: 'low', tone: 'bull' },
            { idx: 10, which: 'low', tone: 'bull' }
          ],
          seriesCallouts: [
            { idx: 5, price: 2640.4, text: 'HL 1', tone: 'bull' },
            { idx: 10, price: 2643.9, text: 'HL 2 (Valid)', tone: 'bull' },
            { idx: 14.3, price: 2657.6, text: 'HH Baru', tone: 'gold' }
          ]
        },
        {
          label: 'Downtrend (LH – LL)',
          caption: 'Dalam Downtrend, harga mencetak Lower High (LH) dan Lower Low (LL) berturut-turut. Cari peluang Sell saat retrace naik mendekati LH.',
          series: [
            { o: 2656.8, h: 2657.5, l: 2654.8, c: 2655.2 },
            { o: 2655.2, h: 2655.6, l: 2652.4, c: 2652.8 },
            { o: 2652.8, h: 2653.2, l: 2651.2, c: 2651.6 },
            { o: 2651.6, h: 2653.6, l: 2651.4, c: 2653.2 },
            { o: 2653.2, h: 2655.0, l: 2652.8, c: 2654.2 },
            { o: 2654.2, h: 2654.6, l: 2651.8, c: 2652.1 },
            { o: 2652.1, h: 2652.5, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.2, l: 2647.4, c: 2647.8 },
            { o: 2647.8, h: 2649.8, l: 2647.5, c: 2649.4 },
            { o: 2649.4, h: 2651.2, l: 2649.0, c: 2650.4 },
            { o: 2650.4, h: 2650.8, l: 2648.0, c: 2648.3 },
            { o: 2648.3, h: 2648.7, l: 2645.6, c: 2646.0 },
            { o: 2646.0, h: 2646.5, l: 2643.8, c: 2644.2 },
            { o: 2644.2, h: 2645.6, l: 2643.9, c: 2645.1 },
            { o: 2645.1, h: 2645.4, l: 2642.2, c: 2642.6 },
            { o: 2642.6, h: 2643.1, l: 2640.8, c: 2641.2 }
          ],
          seriesLevels: [
            { price: 2651.2, fromIdx: 2, toIdx: 7, tone: 'bear', style: 'dashed', label: 'BOS 1', labelSide: 'left', labelPos: 'below' },
            { price: 2647.4, fromIdx: 7, toIdx: 12, tone: 'bear', style: 'dashed', label: 'BOS 2', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 4, which: 'high', tone: 'bear' },
            { idx: 9, which: 'high', tone: 'bear' }
          ],
          seriesCallouts: [
            { idx: 4, price: 2657.2, text: 'LH 1', tone: 'bear' },
            { idx: 9.2, price: 2653.4, text: 'LH 2 (Valid)', tone: 'bear' },
            { idx: 14.3, price: 2640.0, text: 'LL Baru', tone: 'gold' }
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
          caption: 'H1 adalah kompas utama: struktur naik menuju liquidity atas (BSL). Hari ini kita sabar menunggu harga retrace ke Zona Discount H1 untuk mencari BUY.',
          seriesSlots: 15,
          series: [
            { o: 2644.8, h: 2647.4, l: 2644.2, c: 2647.0 },
            { o: 2647.0, h: 2650.2, l: 2646.6, c: 2649.8 },
            { o: 2649.8, h: 2654.0, l: 2649.4, c: 2653.5 },
            { o: 2653.5, h: 2658.4, l: 2653.1, c: 2657.8 },
            { o: 2657.8, h: 2662.2, l: 2657.2, c: 2661.4 },
            { o: 2661.4, h: 2662.6, l: 2658.6, c: 2659.0 },
            { o: 2659.0, h: 2659.6, l: 2655.4, c: 2656.0 },
            { o: 2656.0, h: 2656.8, l: 2652.8, c: 2653.2 },
            { o: 2653.2, h: 2653.8, l: 2649.6, c: 2650.2 },
            { o: 2650.2, h: 2650.8, l: 2647.6, c: 2648.6 }
          ],
          seriesZones: [
            { fromIdx: 6, toIdx: 14, low: 2646.2, high: 2651.5, tone: 'discount', label: 'ZONA DISCOUNT H1 / M15', labelPos: 'br', labelFront: true }
          ],
          seriesLevels: [
            { price: 2662.6, tone: 'gold', style: 'dashed', label: 'TARGET H1 (BSL 2.662,6)', labelSide: 'right', labelPos: 'above' }
          ],
          seriesArrows: [
            { fromIdx: 9.8, fromPrice: 2648.8, toIdx: 14.0, toPrice: 2661.8, tone: 'bull', label: 'Target H1', labelDx: -10, labelDy: -10 }
          ],
          seriesCallouts: [
            { idx: 3.5, price: 2644.6, text: 'Impulse H1 Bullish · Fokus BUY di Discount', tone: 'bull' }
          ]
        },
        {
          label: '2. M15 Area & M5/M1 Entry',
          caption: 'Zoom-in ke dalam zona Discount H1: M5 mencetak Sweep SSL + MSS Bullish + FVG (BISI). SL cukup ketat di bawah low M5, sementara TP membidik target H1!',
          series: [
            { o: 2651.2, h: 2651.6, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.3, l: 2648.0, c: 2648.4 },
            { o: 2648.4, h: 2649.2, l: 2647.8, c: 2648.9 },
            { o: 2648.9, h: 2649.1, l: 2647.1, c: 2647.4 },
            { o: 2647.4, h: 2647.9, l: 2646.2, c: 2646.6 },
            { o: 2646.6, h: 2647.4, l: 2644.4, c: 2646.8 },
            { o: 2646.8, h: 2648.0, l: 2646.4, c: 2647.8 },
            { o: 2647.8, h: 2652.0, l: 2647.6, c: 2651.6 },
            { o: 2651.6, h: 2653.2, l: 2650.2, c: 2652.4 },
            { o: 2652.4, h: 2652.7, l: 2650.5, c: 2650.8 },
            { o: 2650.8, h: 2651.2, l: 2649.0, c: 2650.9 },
            { o: 2650.9, h: 2653.8, l: 2650.6, c: 2653.4 },
            { o: 2653.4, h: 2655.6, l: 2653.0, c: 2655.2 },
            { o: 2655.2, h: 2657.2, l: 2654.8, c: 2656.8 },
            { o: 2656.8, h: 2658.4, l: 2656.2, c: 2658.0 }
          ],
          seriesZones: [
            { low: 2644.0, high: 2651.5, tone: 'discount', label: 'DI DALAM DISCOUNT H1', labelPos: 'bl', labelFront: false }
          ],
          autoFvgs: [
            { c1Idx: 6, c3Idx: 8, type: 'bull', showCE: true, label: 'M5 FVG ENTRY', ceLabel: '50% CE', extendToIdx: 14, showWickMarkers: false }
          ],
          seriesLevels: [
            { price: 2649.2, fromIdx: 2, toIdx: 8, tone: 'bull', style: 'dashed', label: 'M5 MSS', labelSide: 'left', labelPos: 'above' }
          ],
          seriesWickRings: [
            { idx: 5, which: 'low', tone: 'ink' }
          ],
          seriesCallouts: [
            { idx: 5.5, price: 2642.8, text: 'Sweep SSL + SL Ketat LTF · Target Besar HTF', tone: 'gold' }
          ]
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
          caption: 'Body candle menutup TEGAS di atas Swing High sebelumnya ($2.654,0) dengan dorongan kuat — menandakan kelanjutan tren Bullish sah.',
          series: [
            { o: 2648.6, h: 2650.8, l: 2648.2, c: 2650.4 },
            { o: 2650.4, h: 2652.6, l: 2650.0, c: 2652.2 },
            { o: 2652.2, h: 2654.0, l: 2651.8, c: 2653.4 },
            { o: 2653.4, h: 2653.7, l: 2651.2, c: 2651.6 },
            { o: 2651.6, h: 2652.0, l: 2649.8, c: 2650.2 },
            { o: 2650.2, h: 2651.6, l: 2649.4, c: 2651.2 },
            { o: 2651.2, h: 2653.5, l: 2650.9, c: 2653.2 },
            { o: 2653.2, h: 2658.0, l: 2652.9, c: 2657.4 },
            { o: 2657.4, h: 2659.2, l: 2656.8, c: 2658.6 },
            { o: 2658.6, h: 2659.0, l: 2656.4, c: 2656.9 },
            { o: 2656.9, h: 2658.8, l: 2656.6, c: 2658.4 },
            { o: 2658.4, h: 2660.6, l: 2658.0, c: 2660.1 },
            { o: 2660.1, h: 2661.4, l: 2659.5, c: 2660.8 },
            { o: 2660.8, h: 2662.2, l: 2660.2, c: 2661.8 }
          ],
          seriesLevels: [
            { price: 2654.0, fromIdx: 2, toIdx: 13, tone: 'bull', style: 'solid', label: 'SWING HIGH 2.654,0 (BOS ✓)', labelSide: 'right', labelPos: 'below' }
          ],
          seriesCallouts: [
            { idx: 7.0, price: 2661.8, text: 'VALID BOS · Body Close Tegas di Atas Garis', tone: 'bull' }
          ]
        },
        {
          label: 'Sweep Palsu (Wick Raid)',
          caption: 'Hanya wick yang menusuk ke atas Swing High ($2.654,0) untuk sweep Stop Loss, lalu Body tutup KEMBALI di bawah garis. Waspada reversal tajam!',
          series: [
            { o: 2649.0, h: 2651.2, l: 2648.6, c: 2650.8 },
            { o: 2650.8, h: 2652.9, l: 2650.4, c: 2652.4 },
            { o: 2652.4, h: 2654.0, l: 2651.8, c: 2653.2 },
            { o: 2653.2, h: 2653.6, l: 2651.0, c: 2651.4 },
            { o: 2651.4, h: 2652.0, l: 2650.2, c: 2650.8 },
            { o: 2650.8, h: 2652.8, l: 2650.5, c: 2652.5 },
            { o: 2652.5, h: 2653.9, l: 2652.1, c: 2653.4 },
            { o: 2653.4, h: 2657.8, l: 2651.8, c: 2652.4 },
            { o: 2652.4, h: 2652.8, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.4, l: 2647.4, c: 2647.8 },
            { o: 2647.8, h: 2649.0, l: 2647.5, c: 2648.6 },
            { o: 2648.6, h: 2649.0, l: 2646.0, c: 2646.4 },
            { o: 2646.4, h: 2646.9, l: 2644.4, c: 2644.8 },
            { o: 2644.8, h: 2645.4, l: 2643.4, c: 2643.8 }
          ],
          seriesLevels: [
            { price: 2654.0, fromIdx: 2, toIdx: 13, tone: 'sweep', style: 'dashed', label: 'BSL / SWING HIGH 2.654,0', labelSide: 'right', labelPos: 'above' }
          ],
          seriesWickRings: [
            { idx: 7, which: 'high', tone: 'ink' }
          ],
          seriesCallouts: [
            { idx: 7.2, price: 2659.6, text: 'LIQUIDITY SWEEP · Wick Tembus, Body Tutup Bawah', tone: 'sweep' }
          ]
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
          caption: 'Tentukan batas atas (Swing High / ERL) dan batas bawah (Swing Low / ERL) impuls terakhir. Garis tengah 50% (Equilibrium) memisahkan Premium dan Discount.',
          series: [
            { o: 2645.2, h: 2646.2, l: 2644.0, c: 2645.8 },
            { o: 2645.8, h: 2647.6, l: 2645.4, c: 2647.2 },
            { o: 2647.2, h: 2651.2, l: 2646.9, c: 2650.8 },
            { o: 2650.8, h: 2654.2, l: 2650.4, c: 2653.8 },
            { o: 2653.8, h: 2656.8, l: 2653.4, c: 2656.4 },
            { o: 2656.4, h: 2658.8, l: 2656.0, c: 2658.4 },
            { o: 2658.4, h: 2660.0, l: 2657.8, c: 2659.2 },
            { o: 2659.2, h: 2659.6, l: 2656.8, c: 2657.2 },
            { o: 2657.2, h: 2657.6, l: 2654.8, c: 2655.2 },
            { o: 2655.2, h: 2655.8, l: 2653.2, c: 2653.6 },
            { o: 2653.6, h: 2654.0, l: 2651.4, c: 2651.8 },
            { o: 2651.8, h: 2652.3, l: 2649.6, c: 2650.0 },
            { o: 2650.0, h: 2650.6, l: 2648.2, c: 2648.8 },
            { o: 2648.8, h: 2650.2, l: 2648.0, c: 2649.6 }
          ],
          seriesZones: [
            { low: 2652.0, high: 2660.0, tone: 'premium', label: 'PREMIUM (>50% · MAHAL)', labelPos: 'tr', labelFront: true },
            { low: 2644.0, high: 2652.0, tone: 'discount', label: 'DISCOUNT (<50% · MURAH)', labelPos: 'br', labelFront: true }
          ],
          seriesLevels: [
            { price: 2660.0, tone: 'gold', style: 'solid', label: 'ERL HIGH 2.660,0 (TARGET)', labelSide: 'left', labelPos: 'above' },
            { price: 2652.0, tone: 'muted', style: 'dotted', label: 'EQ 50% (2.652,0)', labelSide: 'left', labelPos: 'above' },
            { price: 2644.0, tone: 'muted', style: 'solid', label: 'ERL LOW 2.644,0 (INVALIDASI)', labelSide: 'left', labelPos: 'below' }
          ]
        },
        {
          label: '2. IRL FVG → ERL High',
          caption: 'Algoritma selalu bergerak bolak-balik: retrace mengambil IRL (Bullish FVG di Discount), lalu melesat naik menembus ERL (Swing High lama).',
          series: [
            { o: 2645.2, h: 2646.2, l: 2644.0, c: 2645.8 },
            { o: 2645.8, h: 2647.2, l: 2645.4, c: 2646.8 },
            { o: 2646.8, h: 2652.4, l: 2646.6, c: 2652.0 },
            { o: 2652.0, h: 2654.8, l: 2650.4, c: 2654.4 },
            { o: 2654.4, h: 2657.2, l: 2654.0, c: 2656.8 },
            { o: 2656.8, h: 2659.2, l: 2656.4, c: 2658.8 },
            { o: 2658.8, h: 2660.0, l: 2658.0, c: 2658.6 },
            { o: 2658.6, h: 2659.0, l: 2655.6, c: 2656.0 },
            { o: 2656.0, h: 2656.4, l: 2653.0, c: 2653.4 },
            { o: 2653.4, h: 2653.8, l: 2650.8, c: 2651.2 },
            { o: 2651.2, h: 2652.0, l: 2648.7, c: 2651.4 },
            { o: 2651.4, h: 2655.0, l: 2651.0, c: 2654.6 },
            { o: 2654.6, h: 2658.0, l: 2654.2, c: 2657.6 },
            { o: 2657.6, h: 2660.8, l: 2657.2, c: 2660.4 },
            { o: 2660.4, h: 2662.2, l: 2659.8, c: 2661.8 }
          ],
          autoFvgs: [
            { c1Idx: 1, c3Idx: 3, type: 'bull', showCE: true, label: 'IRL · FVG DISCOUNT', ceLabel: '50% CE', extendToIdx: 13, showWickMarkers: false }
          ],
          seriesLevels: [
            { price: 2660.0, fromIdx: 6, toIdx: 14, tone: 'gold', style: 'dashed', label: 'ERL HIGH (BSL) SWEPT', labelSide: 'left', labelPos: 'above' },
            { price: 2652.0, tone: 'muted', style: 'dotted', label: 'EQ 50%', labelSide: 'left', labelPos: 'above' }
          ],
          seriesWickRings: [
            { idx: 10, which: 'low', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 9.5, price: 2644.6, text: 'Retrace Ambil IRL (50% CE) → Melesat ke ERL High', tone: 'bull' }
          ]
        }
      ]
    },

    'bsl-ssl-pools': {
      title: 'Peta Liquidity: Equal Highs (BSL) & Equal Lows (SSL)',
      pairTag: 'XAU/USD · LIQUIDITY POOL STOP LOSS',
      priceLabels: ['BSL $$$', 'Range', 'SSL $$$'],
      stages: [
        {
          label: 'BSL Pool (Atas)',
          caption: 'Equal Highs (puncak kembar rapi) tampak seperti tembok resistance kuat bagi ritel, padahal di atasnya menumpuk Stop Loss Seller (BSL) yang jadi magnet sweep.',
          series: [
            { o: 2648.4, h: 2651.2, l: 2648.0, c: 2650.8 },
            { o: 2650.8, h: 2653.6, l: 2650.4, c: 2653.2 },
            { o: 2653.2, h: 2655.0, l: 2652.4, c: 2652.8 },
            { o: 2652.8, h: 2653.2, l: 2650.4, c: 2650.8 },
            { o: 2650.8, h: 2651.4, l: 2649.6, c: 2650.4 },
            { o: 2650.4, h: 2653.2, l: 2650.0, c: 2652.8 },
            { o: 2652.8, h: 2655.0, l: 2652.2, c: 2652.6 },
            { o: 2652.6, h: 2653.0, l: 2650.6, c: 2651.0 },
            { o: 2651.0, h: 2653.4, l: 2650.7, c: 2653.0 },
            { o: 2653.0, h: 2654.9, l: 2652.4, c: 2653.6 },
            { o: 2653.6, h: 2658.4, l: 2652.8, c: 2653.2 },
            { o: 2653.2, h: 2653.6, l: 2650.0, c: 2650.4 },
            { o: 2650.4, h: 2650.8, l: 2647.8, c: 2648.2 },
            { o: 2648.2, h: 2649.2, l: 2647.6, c: 2648.8 },
            { o: 2648.8, h: 2649.1, l: 2646.0, c: 2646.4 },
            { o: 2646.4, h: 2647.0, l: 2644.6, c: 2645.0 }
          ],
          seriesLevels: [
            { price: 2655.0, fromIdx: 2, toIdx: 15, tone: 'sweep', style: 'dashed', label: 'EQH · BSL $$$ (2.655,0)', labelSide: 'right', labelPos: 'above' }
          ],
          seriesWickRings: [
            { idx: 2, which: 'high', tone: 'gold', r: 5.5 },
            { idx: 6, which: 'high', tone: 'gold', r: 5.5 },
            { idx: 10, which: 'high', tone: 'ink', r: 7.5 }
          ],
          seriesCallouts: [
            { idx: 9.2, price: 2660.2, text: 'BSL Di-sweep → Harga Berbalik Turun Tajam', tone: 'sweep' }
          ]
        },
        {
          label: 'SSL Pool (Bawah)',
          caption: 'Equal Lows (lembah kembar) menyimpan tumpukan Stop Loss Buyer (SSL). Sabar tunggu SSL di-sweep lebih dulu sebelum mencari konfirmasi Buy.',
          series: [
            { o: 2652.0, h: 2652.6, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.2, l: 2647.0, c: 2647.4 },
            { o: 2647.4, h: 2648.2, l: 2645.0, c: 2647.6 },
            { o: 2647.6, h: 2650.0, l: 2647.2, c: 2649.6 },
            { o: 2649.6, h: 2650.2, l: 2647.8, c: 2648.2 },
            { o: 2648.2, h: 2648.6, l: 2646.0, c: 2646.4 },
            { o: 2646.4, h: 2647.8, l: 2645.0, c: 2647.4 },
            { o: 2647.4, h: 2649.6, l: 2647.0, c: 2649.0 },
            { o: 2649.0, h: 2649.4, l: 2646.4, c: 2646.8 },
            { o: 2646.8, h: 2647.2, l: 2645.1, c: 2646.2 },
            { o: 2646.2, h: 2647.8, l: 2641.6, c: 2647.2 },
            { o: 2647.2, h: 2650.4, l: 2646.9, c: 2650.0 },
            { o: 2650.0, h: 2652.6, l: 2649.6, c: 2652.2 },
            { o: 2652.2, h: 2652.8, l: 2651.0, c: 2651.5 },
            { o: 2651.5, h: 2654.4, l: 2651.2, c: 2654.0 },
            { o: 2654.0, h: 2655.8, l: 2653.4, c: 2655.2 }
          ],
          seriesLevels: [
            { price: 2645.0, fromIdx: 2, toIdx: 15, tone: 'sweep', style: 'dashed', label: 'EQL · SSL $$$ (2.645,0)', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 2, which: 'low', tone: 'gold', r: 5.5 },
            { idx: 6, which: 'low', tone: 'gold', r: 5.5 },
            { idx: 10, which: 'low', tone: 'ink', r: 7.5 }
          ],
          seriesCallouts: [
            { idx: 9.2, price: 2639.8, text: 'SSL Di-sweep → Bahan Bakar Rally Bullish', tone: 'bull' }
          ]
        }
      ]
    },

    'key-liquidity-levels': {
      title: 'Level Liquidity Wajib: PDH/PDL, PWH/PWL & Asia Range',
      pairTag: 'XAU/USD · LEVEL INSTITUSI',
      priceLabels: ['PWH/PDH', 'Asia', 'PDL'],
      stages: [
        {
          label: 'Peta Harian Lengkap',
          caption: 'Tandai 6 garis kunci sebelum London buka: PWH/PWL, PDH/PDL, dan kotak Asia High/Low. 80% pergerakan Gold harian berputar di level ini.',
          series: [
            { o: 2651.2, h: 2653.2, l: 2650.6, c: 2652.8 },
            { o: 2652.8, h: 2653.4, l: 2649.8, c: 2650.4 },
            { o: 2650.4, h: 2653.0, l: 2649.6, c: 2652.2 },
            { o: 2652.2, h: 2652.8, l: 2649.4, c: 2650.0 },
            { o: 2650.0, h: 2652.4, l: 2649.2, c: 2651.6 },
            { o: 2651.6, h: 2652.0, l: 2649.0, c: 2649.6 },
            { o: 2649.6, h: 2651.4, l: 2646.2, c: 2650.8 },
            { o: 2650.8, h: 2655.0, l: 2650.4, c: 2654.6 },
            { o: 2654.6, h: 2657.4, l: 2654.0, c: 2656.8 },
            { o: 2656.8, h: 2657.2, l: 2654.6, c: 2655.4 },
            { o: 2655.4, h: 2658.8, l: 2655.0, c: 2658.4 },
            { o: 2658.4, h: 2661.0, l: 2658.0, c: 2660.4 },
            { o: 2660.4, h: 2660.8, l: 2658.6, c: 2659.2 },
            { o: 2659.2, h: 2662.8, l: 2658.8, c: 2662.2 },
            { o: 2662.2, h: 2665.2, l: 2661.8, c: 2664.6 },
            { o: 2664.6, h: 2666.6, l: 2664.2, c: 2666.0 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 5, low: 2649.0, high: 2655.4, tone: 'asia', label: 'ASIA RANGE (08–12)', labelPos: 'tl', labelFront: true }
          ],
          seriesLevels: [
            { price: 2666.5, tone: 'gold', style: 'solid', label: 'PWH 2.666,5 (Weekly High)', labelSide: 'left', labelPos: 'above' },
            { price: 2662.0, tone: 'sweep', style: 'dashed', label: 'PDH 2.662,0 (DOL Utama)', labelSide: 'left', labelPos: 'above' },
            { price: 2642.0, tone: 'cyan', style: 'dashed', label: 'PDL 2.642,0 (Daily Low)', labelSide: 'right', labelPos: 'above' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'low', tone: 'ink' }
          ],
          seriesCallouts: [
            { idx: 7.4, price: 2644.6, text: 'Sweep Asia Low → Target PDH & PWH', tone: 'bull' }
          ]
        },
        {
          label: 'Reaksi di PDH (Rejection)',
          caption: 'Saat harga sweep PDH (Previous Day High) dengan wick lalu mematahkan struktur M5 ke bawah, PDH menjadi bahan bakar Sell menuju Asia Low / PDL.',
          series: [
            { o: 2650.4, h: 2653.0, l: 2649.8, c: 2652.6 },
            { o: 2652.6, h: 2655.8, l: 2652.2, c: 2655.2 },
            { o: 2655.2, h: 2655.6, l: 2653.4, c: 2654.0 },
            { o: 2654.0, h: 2657.8, l: 2653.6, c: 2657.4 },
            { o: 2657.4, h: 2660.8, l: 2657.0, c: 2660.2 },
            { o: 2660.2, h: 2661.8, l: 2659.6, c: 2661.4 },
            { o: 2661.4, h: 2665.2, l: 2659.8, c: 2660.2 },
            { o: 2660.2, h: 2660.6, l: 2654.4, c: 2655.0 },
            { o: 2655.0, h: 2656.4, l: 2653.4, c: 2654.0 },
            { o: 2654.0, h: 2658.2, l: 2653.6, c: 2657.2 },
            { o: 2657.2, h: 2657.6, l: 2652.6, c: 2653.2 },
            { o: 2653.2, h: 2653.8, l: 2649.8, c: 2650.4 },
            { o: 2650.4, h: 2652.0, l: 2649.8, c: 2651.4 },
            { o: 2651.4, h: 2651.8, l: 2648.0, c: 2648.6 },
            { o: 2648.6, h: 2649.2, l: 2646.2, c: 2646.8 },
            { o: 2646.8, h: 2647.4, l: 2644.8, c: 2645.4 }
          ],
          autoFvgs: [
            { c1Idx: 6, c3Idx: 8, type: 'bear', showCE: true, label: 'SIBI (FVG)', ceLabel: '50% CE', extendToIdx: 15, showWickMarkers: false }
          ],
          seriesLevels: [
            { price: 2662.0, tone: 'sweep', style: 'dashed', label: 'PDH 2.662,0 SWEPT ✓', labelSide: 'left', labelPos: 'above' },
            { price: 2646.0, tone: 'cyan', style: 'dashed', label: 'TARGET: PDL 2.646,0', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'high', tone: 'ink' },
            { idx: 9, which: 'high', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 11.4, price: 2664.6, text: 'Sweep PDH + Retest 50% CE → Distribusi ke PDL', tone: 'bear' }
          ]
        }
      ]
    },

    'inducement-trap': {
      title: 'Liquidity Sweep (Purge & Revert) vs Liquidity Run (Expansion)',
      pairTag: 'XAU/USD · PURE ICT MECHANICS',
      priceLabels: ['DOL (PDH)', 'Asia H', 'Asia L'],
      stages: [
        {
          label: '1. Liquidity Sweep (Purge & Revert)',
          caption: 'Melawan HTF Bias di awal sesi: wick menusuk Asia Low (SSL), Body Close kembali di dalam range, lalu 1–3 candle aftermath mencetak Displacement naik + BISI.',
          series: [
            { o: 2648.6, h: 2650.8, l: 2648.0, c: 2650.4 },
            { o: 2650.4, h: 2651.2, l: 2648.4, c: 2648.8 },
            { o: 2648.8, h: 2650.2, l: 2647.4, c: 2647.8 },
            { o: 2647.8, h: 2649.6, l: 2647.2, c: 2649.2 },
            { o: 2649.2, h: 2649.8, l: 2646.4, c: 2647.0 },
            { o: 2647.0, h: 2647.8, l: 2646.0, c: 2646.8 },
            { o: 2646.8, h: 2647.6, l: 2642.8, c: 2647.4 },
            { o: 2647.4, h: 2652.4, l: 2647.2, c: 2652.0 },
            { o: 2652.0, h: 2653.8, l: 2650.2, c: 2653.0 },
            { o: 2653.0, h: 2653.4, l: 2650.6, c: 2651.0 },
            { o: 2651.0, h: 2652.2, l: 2648.8, c: 2651.6 },
            { o: 2651.6, h: 2654.4, l: 2651.2, c: 2654.0 },
            { o: 2654.0, h: 2656.2, l: 2653.6, c: 2655.8 },
            { o: 2655.8, h: 2657.6, l: 2655.2, c: 2657.2 },
            { o: 2657.2, h: 2658.8, l: 2656.8, c: 2658.4 },
            { o: 2658.4, h: 2659.6, l: 2657.8, c: 2659.2 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 5, low: 2646.0, high: 2651.2, tone: 'asia', label: 'ASIA RANGE', labelPos: 'bl', labelFront: true }
          ],
          autoFvgs: [
            { c1Idx: 6, c3Idx: 8, type: 'bull', showCE: true, label: 'BISI (FVG)', ceLabel: '50% CE', extendToIdx: 15, showWickMarkers: false }
          ],
          seriesLevels: [
            { price: 2646.0, fromIdx: 0, toIdx: 15, tone: 'sweep', style: 'dashed', label: 'Asia Low 2.646,0 SWEPT ✓', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'low', tone: 'ink' }
          ],
          seriesCallouts: [
            { idx: 6.5, price: 2640.8, text: 'Wick Sweep + Body Close Balik + CISD ↑', tone: 'bull' }
          ]
        },
        {
          label: '2. Liquidity Run (Expansion)',
          caption: 'Searah HTF Bias menuju DOL PDH: Asia High ($2.652,0) ditembus oleh Body Close penuh (acceptance) tanpa CISD turun — harga lanjut melesat ke PDH, JANGAN dilawan Sell!',
          series: [
            { o: 2648.6, h: 2651.0, l: 2648.5, c: 2650.6 },
            { o: 2650.6, h: 2652.0, l: 2648.7, c: 2649.0 },
            { o: 2649.0, h: 2649.8, l: 2647.0, c: 2647.6 },
            { o: 2647.6, h: 2650.2, l: 2647.2, c: 2649.8 },
            { o: 2649.8, h: 2651.6, l: 2649.0, c: 2651.2 },
            { o: 2651.2, h: 2651.8, l: 2649.6, c: 2650.4 },
            { o: 2650.4, h: 2655.2, l: 2650.0, c: 2654.8 },
            { o: 2654.8, h: 2656.4, l: 2654.0, c: 2655.6 },
            { o: 2655.6, h: 2656.0, l: 2653.6, c: 2654.2 },
            { o: 2654.2, h: 2657.4, l: 2653.8, c: 2657.0 },
            { o: 2657.0, h: 2659.6, l: 2656.6, c: 2659.2 },
            { o: 2659.2, h: 2660.2, l: 2658.0, c: 2658.6 },
            { o: 2658.6, h: 2661.4, l: 2658.2, c: 2661.0 },
            { o: 2661.0, h: 2663.2, l: 2660.6, c: 2662.8 },
            { o: 2662.8, h: 2664.2, l: 2662.0, c: 2663.8 },
            { o: 2663.8, h: 2664.8, l: 2663.0, c: 2664.4 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 5, low: 2647.0, high: 2652.0, tone: 'asia', label: 'ASIA RANGE', labelPos: 'bl', labelFront: true }
          ],
          seriesLevels: [
            { price: 2664.0, tone: 'tp', style: 'solid', label: 'DOL UTAMA: PDH 2.664,0', labelSide: 'left', labelPos: 'above' },
            { price: 2652.0, fromIdx: 0, toIdx: 15, tone: 'bull', style: 'dashed', label: 'Asia High 2.652,0 TEMBUS BODY (RUN)', labelSide: 'right', labelPos: 'below' }
          ],
          seriesCallouts: [
            { idx: 9.5, price: 2647.8, text: 'Acceptance di Atas Asia High = Liquidity Run', tone: 'gold' }
          ]
        }
      ]
    },

    // ── LEVEL 3 ──────────────────────────────────────────────────────────
    'displacement-signature': {
      title: 'Displacement Valid (Energi Institusi) vs Gerakan Lemah',
      pairTag: 'XAU/USD · M5 · JEJAK ALGORITMA',
      priceLabels: ['Break', 'FVG', 'Base'],
      stages: [
        {
          label: '1. Displacement Valid',
          caption: 'Pasca-sweep Asia Low ($2,642.0), candle berbadan penuh (≥ 65% body) memecah Swing High MSS ($2,646.5) sekaligus mencetak Bullish FVG bersih ($2,644.0–$2,646.6) yang langsung diuji tepat di 50% CE.',
          series: [
            { o: 2645.4, h: 2646.2, l: 2644.8, c: 2645.0 },
            { o: 2645.0, h: 2646.5, l: 2644.6, c: 2645.9 },
            { o: 2645.9, h: 2646.1, l: 2644.2, c: 2644.5 },
            { o: 2644.5, h: 2645.1, l: 2643.2, c: 2643.6 },
            { o: 2643.6, h: 2644.0, l: 2641.8, c: 2642.6 },
            { o: 2642.6, h: 2644.0, l: 2642.3, c: 2643.8 },
            { o: 2643.8, h: 2648.6, l: 2643.6, c: 2648.2 },
            { o: 2648.2, h: 2650.8, l: 2646.6, c: 2650.2 },
            { o: 2650.2, h: 2651.2, l: 2648.8, c: 2649.1 },
            { o: 2649.1, h: 2649.5, l: 2647.2, c: 2647.6 },
            { o: 2647.6, h: 2648.0, l: 2645.3, c: 2647.1 },
            { o: 2647.1, h: 2649.8, l: 2646.8, c: 2649.4 },
            { o: 2649.4, h: 2652.0, l: 2649.0, c: 2651.6 },
            { o: 2651.6, h: 2653.8, l: 2651.2, c: 2653.4 },
            { o: 2653.4, h: 2654.6, l: 2652.8, c: 2654.2 }
          ],
          autoFvgs: [
            {
              c1Idx: 5,
              c3Idx: 7,
              type: 'bull',
              extendToIdx: 14,
              showCE: true,
              showWickMarkers: true,
              label: 'FVG TERBENTUK (BISI)',
              ceLabel: '50% CE · 2645.3'
            }
          ],
          seriesLevels: [
            { price: 2646.5, toIdx: 8, tone: 'bull', style: 'dashed', label: 'MSS / BOS 2.646,5', labelSide: 'left' },
            { price: 2642.0, toIdx: 6, tone: 'sweep', style: 'dotted', label: 'ASIA LOW 2.642,0', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 4, which: 'low', tone: 'sweep' },
            { idx: 10, which: 'low', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 7.4, price: 2653.2, text: 'Body ≥65% + Pecah MSS + FVG = Valid', tone: 'bull' }
          ]
        },
        {
          label: '2. Gerakan Lemah (Skip)',
          caption: 'Candle kecil saling tumpang tindih dengan wick panjang di sekitar level struktur ($2,646.5) tanpa satu pun celah FVG. Bukan Displacement — hindari entry.',
          series: [
            { o: 2644.8, h: 2646.2, l: 2643.8, c: 2644.2 },
            { o: 2644.2, h: 2646.5, l: 2643.5, c: 2645.1 },
            { o: 2645.1, h: 2646.3, l: 2643.9, c: 2644.4 },
            { o: 2644.4, h: 2645.8, l: 2643.4, c: 2644.9 },
            { o: 2644.9, h: 2646.4, l: 2644.0, c: 2645.3 },
            { o: 2645.3, h: 2646.7, l: 2644.5, c: 2645.7 },
            { o: 2645.7, h: 2647.1, l: 2644.8, c: 2645.4 },
            { o: 2645.4, h: 2647.3, l: 2644.9, c: 2646.1 },
            { o: 2646.1, h: 2647.6, l: 2645.2, c: 2645.8 },
            { o: 2645.8, h: 2647.8, l: 2645.3, c: 2646.4 },
            { o: 2646.4, h: 2648.0, l: 2645.6, c: 2646.0 },
            { o: 2646.0, h: 2648.1, l: 2645.5, c: 2646.7 },
            { o: 2646.7, h: 2648.2, l: 2645.9, c: 2646.3 },
            { o: 2646.3, h: 2647.9, l: 2645.4, c: 2645.9 },
            { o: 2645.9, h: 2647.6, l: 2645.1, c: 2646.5 }
          ],
          seriesZones: [
            { fromIdx: 4, toIdx: 14, low: 2644.5, high: 2648.4, tone: 'danger', label: 'CHOPPY / WICK OVERLAP', labelPos: 'tr' }
          ],
          seriesLevels: [
            { price: 2646.5, tone: 'muted', style: 'dashed', label: 'LEVEL STRUKTUR 2.646,5', labelSide: 'left' }
          ],
          seriesCallouts: [
            { idx: 7.5, price: 2642.1, text: 'Overlapping / Choppy · Tanpa FVG → NO TRADE', tone: 'bear' }
          ]
        }
      ]
    },

    'fvg-ce-anatomy': {
      title: 'Fair Value Gap (FVG / BISI & SIBI): Valid vs Invalid & 50% CE',
      pairTag: 'XAU/USD · FVG ANATOMY',
      priceLabels: ['C3', '50% CE', 'C1'],
      stages: [
        {
          label: '1. Bearish FVG (Valid vs Invalid)',
          caption: 'Bearish FVG (SIBI) VALID hanya jika ada celah bersih antara Low wick Candle 1 dan High wick Candle 3. Jika wick C1 & C3 saling tumpang tindih (kanan), itu BUKAN FVG.',
          splitPanels: [
            {
              heading: 'BEARISH FVG',
              badgeTitle: 'VALID',
              badgeSub: 'BEARISH FVG (SIBI)',
              verdict: 'valid',
              fvgType: 'bear',
              fvgLabel: 'CELAH FVG (SIBI)',
              showCE: true,
              candles: [
                { o: 84, h: 84, l: 55, c: 63 },
                { o: 63, h: 63, l: 28, c: 32 },
                { o: 32, h: 37, l: 9, c: 17 }
              ]
            },
            {
              heading: 'BEARISH FVG',
              badgeTitle: 'INVALID',
              badgeSub: 'WICK TUMPANG TINDIH',
              verdict: 'invalid',
              fvgType: 'bear',
              overlapLabel: 'OVERLAP · BUKAN FVG',
              candles: [
                { o: 88, h: 88, l: 48, c: 67 },
                { o: 67, h: 67, l: 33, c: 37 },
                { o: 37, h: 52, l: 13, c: 22 }
              ]
            }
          ]
        },
        {
          label: '2. Bullish FVG (Valid vs Invalid)',
          caption: 'Bullish FVG (BISI) VALID jika High wick Candle 1 lebih rendah dari Low wick Candle 3 sehingga menyisakan ruang imbalance murni di badan Candle 2. Bila wick saling menyentuh/tumpang tindih, tidak valid.',
          splitPanels: [
            {
              heading: 'BULLISH FVG',
              badgeTitle: 'VALID',
              badgeSub: 'BULLISH FVG (BISI)',
              verdict: 'valid',
              fvgType: 'bull',
              fvgLabel: 'CELAH FVG (BISI)',
              showCE: true,
              candles: [
                { o: 16, h: 45, l: 16, c: 37 },
                { o: 37, h: 72, l: 37, c: 68 },
                { o: 68, h: 91, l: 63, c: 83 }
              ]
            },
            {
              heading: 'BULLISH FVG',
              badgeTitle: 'INVALID',
              badgeSub: 'WICK TUMPANG TINDIH',
              verdict: 'invalid',
              fvgType: 'bull',
              overlapLabel: 'OVERLAP · BUKAN FVG',
              candles: [
                { o: 12, h: 52, l: 12, c: 33 },
                { o: 33, h: 67, l: 33, c: 63 },
                { o: 63, h: 87, l: 48, c: 78 }
              ]
            }
          ]
        },
        {
          label: '3. Retrace 50% CE di Chart Gold',
          caption: 'Di chart M5 XAU/USD, harga kembali masuk ke celah Bullish FVG (High C1 $2,647.20 – Low C3 $2,651.00), wick menyentuh persis garis 50% CE ($2,649.10), body tutup di atas CE, lalu melesat naik.',
          series: [
            { o: 2645.8, h: 2646.5, l: 2645.1, c: 2645.4 },
            { o: 2645.4, h: 2646.3, l: 2644.7, c: 2646.0 },
            { o: 2646.0, h: 2646.8, l: 2645.2, c: 2645.5 },
            { o: 2645.5, h: 2646.2, l: 2644.3, c: 2645.8 },
            { o: 2645.8, h: 2647.2, l: 2645.4, c: 2646.7 },
            { o: 2646.7, h: 2652.8, l: 2646.1, c: 2652.3 },
            { o: 2652.3, h: 2654.2, l: 2651.0, c: 2653.6 },
            { o: 2653.6, h: 2654.6, l: 2652.6, c: 2653.0 },
            { o: 2653.0, h: 2653.4, l: 2651.7, c: 2652.1 },
            { o: 2652.1, h: 2652.6, l: 2650.5, c: 2650.9 },
            { o: 2650.9, h: 2651.4, l: 2649.0, c: 2650.1 },
            { o: 2650.1, h: 2652.9, l: 2649.8, c: 2652.5 },
            { o: 2652.5, h: 2654.8, l: 2651.4, c: 2654.3 },
            { o: 2654.3, h: 2656.5, l: 2652.9, c: 2656.1 },
            { o: 2656.1, h: 2657.8, l: 2654.8, c: 2657.3 },
            { o: 2657.3, h: 2658.2, l: 2656.4, c: 2656.9 }
          ],
          autoFvgs: [
            {
              c1Idx: 4,
              c3Idx: 6,
              type: 'bull',
              extendToIdx: 15,
              showCE: true,
              showWickMarkers: true,
              label: 'BULLISH FVG (BISI)',
              ceLabel: '50% CE · 2649.1'
            }
          ],
          seriesCallouts: [
            { idx: 3.1, price: 2643.8, text: 'C1', tone: 'muted' },
            { idx: 5.5, price: 2643.8, text: 'C2 Impuls', tone: 'bull' },
            { idx: 6, price: 2655.6, text: 'C3', tone: 'muted' },
            { idx: 11.2, price: 2645.2, text: 'Wick sentuh 50% CE → Reaksi Instan', tone: 'gold' }
          ]
        }
      ]
    },

    'order-block-mt': {
      title: 'Order Block Institusi & 50% Mean Threshold (MT)',
      pairTag: 'XAU/USD · M15 · BULLISH OB',
      priceLabels: ['OB Open', '50% MT', 'OB Low'],
      stages: [
        {
          label: '1. Syarat OB Valid',
          caption: 'Bullish OB adalah candle turun terakhir (Open $2,646.0 · Close $2,642.0 · Low $2,640.0) SEBELUM Displacement kuat yang memecah MSS ($2,651.8) dan mencetak FVG. Garis 50% MT diukur tepat di tengah BODY ($2,644.0).',
          seriesSlots: 16,
          series: [
            { o: 2651.4, h: 2652.2, l: 2650.0, c: 2650.4 },
            { o: 2650.4, h: 2651.8, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.2, l: 2647.4, c: 2647.8 },
            { o: 2647.8, h: 2648.2, l: 2645.6, c: 2646.0 },
            { o: 2646.0, h: 2646.4, l: 2640.0, c: 2642.0 },
            { o: 2642.0, h: 2647.6, l: 2641.8, c: 2647.2 },
            { o: 2647.2, h: 2653.4, l: 2646.9, c: 2652.8 },
            { o: 2652.8, h: 2655.2, l: 2650.2, c: 2654.6 },
            { o: 2654.6, h: 2655.8, l: 2653.6, c: 2654.0 }
          ],
          seriesZones: [
            { fromIdx: 4, toIdx: 15, low: 2640.0, high: 2646.0, tone: 'ob', label: 'BULLISH ORDER BLOCK', labelPos: 'tr' }
          ],
          autoFvgs: [
            {
              c1Idx: 5,
              c3Idx: 7,
              type: 'bull',
              extendToIdx: 14,
              showCE: false,
              showWickMarkers: false,
              label: 'FVG (BISI)'
            }
          ],
          seriesLevels: [
            { price: 2644.0, fromIdx: 4, tone: 'gold', style: 'dashed', label: '50% MT 2.644,0 (BODY)', labelSide: 'right', labelPos: 'below' },
            { price: 2651.8, toIdx: 10, tone: 'bull', style: 'dashed', label: 'MSS VALID 2.651,8', labelSide: 'left' }
          ],
          seriesWickRings: [
            { idx: 4, which: 'low', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 11.4, price: 2654.8, text: 'Syarat OB: Sweep + FVG + MSS', tone: 'bull' }
          ]
        },
        {
          label: '2. Mitigasi OB & Filter MT',
          caption: 'Retrace masuk ke Open OB ($2,646.0), wick menyentuh persis 50% Mean Threshold ($2,644.0), namun Body Close tetap bertahan di atas MT — pertanda OB kuat dan siap melesat naik.',
          seriesSlots: 16,
          series: [
            { o: 2651.4, h: 2652.2, l: 2650.0, c: 2650.4 },
            { o: 2650.4, h: 2651.8, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.2, l: 2647.4, c: 2647.8 },
            { o: 2647.8, h: 2648.2, l: 2645.6, c: 2646.0 },
            { o: 2646.0, h: 2646.4, l: 2640.0, c: 2642.0 },
            { o: 2642.0, h: 2647.6, l: 2641.8, c: 2647.2 },
            { o: 2647.2, h: 2653.4, l: 2646.9, c: 2652.8 },
            { o: 2652.8, h: 2655.2, l: 2650.2, c: 2654.6 },
            { o: 2654.6, h: 2655.8, l: 2653.6, c: 2654.0 },
            { o: 2654.0, h: 2654.4, l: 2651.2, c: 2651.6 },
            { o: 2651.6, h: 2652.0, l: 2648.2, c: 2648.6 },
            { o: 2648.6, h: 2649.0, l: 2645.6, c: 2646.2 },
            { o: 2646.2, h: 2648.4, l: 2644.0, c: 2647.8 },
            { o: 2647.8, h: 2651.8, l: 2647.4, c: 2651.4 },
            { o: 2651.4, h: 2655.4, l: 2651.0, c: 2655.0 },
            { o: 2655.0, h: 2658.4, l: 2654.6, c: 2657.8 }
          ],
          seriesZones: [
            { fromIdx: 4, toIdx: 15, low: 2640.0, high: 2646.0, tone: 'ob', label: 'BULLISH OB', labelPos: 'bl' }
          ],
          seriesLevels: [
            { price: 2646.0, fromIdx: 4, tone: 'gold', style: 'solid', label: 'OPEN OB 2.646,0', labelSide: 'right' },
            { price: 2644.0, fromIdx: 4, tone: 'sweep', style: 'dashed', label: '50% MT 2.644,0 (BATAS BODY)', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 12, which: 'low', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 10.2, price: 2638.4, text: 'Body bertahan di atas 50% MT = OB Kuat', tone: 'bull' }
          ]
        }
      ]
    },

    'cisd-vs-mss': {
      title: 'CISD (Sinyal Awal Cepat) vs MSS (Konfirmasi Struktural)',
      pairTag: 'XAU/USD · M5 · PERUBAHAN ARAH',
      priceLabels: ['MSS', 'CISD', 'Sweep'],
      stages: [
        {
          label: '1. CISD Lebih Cepat',
          caption: 'Setelah sweep SSL ($2,644.2), candle bullish langsung menutup Body di atas harga OPEN rangkaian candle turun terakhir ($2,649.2) → inilah CISD, terpicu lebih dulu sebelum MSS ($2,652.6).',
          seriesSlots: 15,
          series: [
            { o: 2651.2, h: 2652.0, l: 2649.8, c: 2650.2 },
            { o: 2650.2, h: 2652.6, l: 2649.8, c: 2651.8 },
            { o: 2651.8, h: 2652.2, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.2, l: 2648.2, c: 2649.2 },
            { o: 2649.2, h: 2649.6, l: 2646.8, c: 2647.2 },
            { o: 2647.2, h: 2647.5, l: 2644.6, c: 2645.0 },
            { o: 2645.0, h: 2645.8, l: 2641.8, c: 2644.6 },
            { o: 2644.6, h: 2648.2, l: 2644.2, c: 2647.8 },
            { o: 2647.8, h: 2651.4, l: 2647.4, c: 2650.8 }
          ],
          seriesLevels: [
            { price: 2652.6, fromIdx: 1, tone: 'muted', style: 'dotted', label: 'SWING HIGH (MSS) 2.652,6', labelSide: 'right' },
            { price: 2649.2, fromIdx: 4, tone: 'cyan', style: 'solid', label: 'CISD 2.649,2 (OPEN DOWN)', labelSide: 'right', labelPos: 'below' },
            { price: 2644.2, toIdx: 7, tone: 'sweep', style: 'dashed', label: 'SSL SWEEP 2.644,2', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'low', tone: 'sweep' }
          ],
          seriesCallouts: [
            { idx: 10.6, price: 2643.4, text: 'CISD terpicu lebih dulu dari MSS!', tone: 'cyan' }
          ]
        },
        {
          label: '2. Konfirmasi Penuh MSS',
          caption: 'Candle berikutnya menembus Swing High ($2,652.6) dengan Body Close penuh + mencetak FVG Entry ($2,648.2–$2,650.4). Retest ke 50% CE lalu ekspansi naik — probabilitas tertinggi.',
          seriesSlots: 17,
          series: [
            { o: 2651.2, h: 2652.0, l: 2649.8, c: 2650.2 },
            { o: 2650.2, h: 2652.6, l: 2649.8, c: 2651.8 },
            { o: 2651.8, h: 2652.2, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.2, l: 2648.2, c: 2649.2 },
            { o: 2649.2, h: 2649.6, l: 2646.8, c: 2647.2 },
            { o: 2647.2, h: 2647.5, l: 2644.6, c: 2645.0 },
            { o: 2645.0, h: 2645.8, l: 2641.8, c: 2644.6 },
            { o: 2644.6, h: 2648.2, l: 2644.2, c: 2647.8 },
            { o: 2647.8, h: 2651.4, l: 2647.4, c: 2650.8 },
            { o: 2650.8, h: 2655.2, l: 2650.4, c: 2654.6 },
            { o: 2654.6, h: 2655.6, l: 2652.8, c: 2653.2 },
            { o: 2653.2, h: 2653.6, l: 2650.8, c: 2651.2 },
            { o: 2651.2, h: 2651.8, l: 2649.2, c: 2651.4 },
            { o: 2651.4, h: 2655.4, l: 2651.0, c: 2655.0 },
            { o: 2655.0, h: 2658.2, l: 2654.6, c: 2657.6 }
          ],
          autoFvgs: [
            {
              c1Idx: 7,
              c3Idx: 9,
              type: 'bull',
              extendToIdx: 16.4,
              showCE: true,
              showWickMarkers: false,
              label: 'FVG ENTRY',
              ceLabel: '50% CE · 2649.3'
            }
          ],
          seriesLevels: [
            { price: 2652.6, toIdx: 10, tone: 'bull', style: 'solid', label: 'MSS VALID ✓ 2.652,6', labelSide: 'left' },
            { price: 2649.2, fromIdx: 4, toIdx: 9, tone: 'cyan', style: 'dotted', label: 'CISD ✓', labelSide: 'left' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'low', tone: 'sweep' },
            { idx: 12, which: 'low', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 12.2, price: 2644.4, text: 'Sweep + CISD + MSS + FVG = A+', tone: 'bull' }
          ]
        }
      ]
    },

    'premium-discount-ote': {
      title: 'Matriks Premium / Discount & Zona OTE (61.8% – 78.6%)',
      pairTag: 'XAU/USD · M15 · FILTER HARGA MURAH',
      priceLabels: ['100% High', '50% EQ', '0% Low'],
      stages: [
        {
          label: '1. Zona Buy (Discount + OTE)',
          caption: 'Dealing Range $2,640–$2,660 (50% EQ di $2,650). Jangan Buy di Premium (>50%); tunggu harga turun masuk zona Discount + OTE (61.8%–78.6%, sweet spot 70.5% di $2,645.9) lalu melesat naik.',
          series: [
            { o: 2641.2, h: 2643.8, l: 2640.0, c: 2643.4 },
            { o: 2643.4, h: 2647.8, l: 2643.0, c: 2647.4 },
            { o: 2647.4, h: 2652.2, l: 2647.0, c: 2651.8 },
            { o: 2651.8, h: 2656.4, l: 2651.4, c: 2655.8 },
            { o: 2655.8, h: 2660.0, l: 2655.4, c: 2659.2 },
            { o: 2659.2, h: 2659.6, l: 2656.2, c: 2656.6 },
            { o: 2656.6, h: 2657.2, l: 2653.8, c: 2654.2 },
            { o: 2654.2, h: 2654.8, l: 2651.4, c: 2651.8 },
            { o: 2651.8, h: 2652.2, l: 2649.0, c: 2649.4 },
            { o: 2649.4, h: 2650.0, l: 2647.2, c: 2647.6 },
            { o: 2647.6, h: 2648.2, l: 2645.9, c: 2647.4 },
            { o: 2647.4, h: 2651.6, l: 2647.0, c: 2651.2 },
            { o: 2651.2, h: 2655.4, l: 2650.8, c: 2655.0 },
            { o: 2655.0, h: 2658.8, l: 2654.6, c: 2658.4 },
            { o: 2658.4, h: 2661.4, l: 2658.0, c: 2661.0 },
            { o: 2661.0, h: 2663.0, l: 2660.4, c: 2662.4 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 15, low: 2650.0, high: 2660.0, tone: 'premium', label: 'PREMIUM · NO BUY', labelPos: 'tl' },
            { fromIdx: 0, toIdx: 15, low: 2640.0, high: 2650.0, tone: 'discount', label: 'DISCOUNT', labelPos: 'br' },
            { fromIdx: 5, toIdx: 15, low: 2644.3, high: 2647.6, tone: 'gold', label: 'OTE 61.8%–78.6%', labelPos: 'tl', labelFront: true }
          ],
          seriesLevels: [
            { price: 2650.0, tone: 'muted', style: 'dashed', label: '50% EQ 2.650,0', labelSide: 'left' },
            { price: 2645.9, fromIdx: 5, tone: 'gold', style: 'dotted', label: '70.5% SWEET SPOT 2.645,9', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 10, which: 'low', tone: 'gold' }
          ]
        },
        {
          label: '2. Zona Sell (Premium + OTE)',
          caption: 'Saat Downtrend ($2,660→$2,640), tunggu pullback naik melewati 50% EQ ($2,650) masuk ke zona OTE Premium (61.8%–78.6%, sweet spot 70.5% di $2,654.1) sebelum eksekusi Sell.',
          series: [
            { o: 2658.8, h: 2660.0, l: 2656.2, c: 2656.6 },
            { o: 2656.6, h: 2657.0, l: 2652.2, c: 2652.6 },
            { o: 2652.6, h: 2653.0, l: 2647.8, c: 2648.2 },
            { o: 2648.2, h: 2648.6, l: 2643.6, c: 2644.2 },
            { o: 2644.2, h: 2644.6, l: 2640.0, c: 2640.8 },
            { o: 2640.8, h: 2643.8, l: 2640.4, c: 2643.4 },
            { o: 2643.4, h: 2646.2, l: 2642.8, c: 2645.8 },
            { o: 2645.8, h: 2648.6, l: 2645.2, c: 2648.2 },
            { o: 2648.2, h: 2651.0, l: 2647.8, c: 2650.6 },
            { o: 2650.6, h: 2652.8, l: 2650.0, c: 2652.4 },
            { o: 2652.4, h: 2654.1, l: 2651.8, c: 2652.6 },
            { o: 2652.6, h: 2653.0, l: 2648.4, c: 2648.8 },
            { o: 2648.8, h: 2649.2, l: 2644.6, c: 2645.0 },
            { o: 2645.0, h: 2645.4, l: 2641.2, c: 2641.6 },
            { o: 2641.6, h: 2642.0, l: 2638.6, c: 2639.0 },
            { o: 2639.0, h: 2639.6, l: 2637.0, c: 2637.6 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 15, low: 2650.0, high: 2660.0, tone: 'premium', label: 'PREMIUM · AREA SELL', labelPos: 'tr' },
            { fromIdx: 5, toIdx: 15, low: 2652.4, high: 2655.7, tone: 'gold', label: 'OTE SELL 61.8%–78.6%', labelPos: 'bl', labelFront: true },
            { fromIdx: 0, toIdx: 15, low: 2640.0, high: 2650.0, tone: 'discount', label: 'DISCOUNT · NO SELL', labelPos: 'bl' }
          ],
          seriesLevels: [
            { price: 2650.0, tone: 'muted', style: 'dashed', label: '50% EQ 2.650,0', labelSide: 'left', labelPos: 'below' },
            { price: 2654.1, fromIdx: 5, tone: 'gold', style: 'dotted', label: '70.5% SWEET SPOT 2.654,1', labelSide: 'right' }
          ],
          seriesWickRings: [
            { idx: 10, which: 'high', tone: 'gold' }
          ]
        }
      ]
    },

    // ── LEVEL 4 (4 MODEL ENTRY SCALPER A+) ───────────────────────────────
    'model-sweep-fvg': {
      title: 'Model 1 (Core): Liquidity Sweep → MSS/CISD → FVG Entry',
      pairTag: 'XAU/USD · M5 · MODEL #1 CORE',
      priceLabels: ['2.660', '2.650', '2.641'],
      stages: [
        {
          label: '1. Sweep SSL',
          caption: 'Tahap 1: Harga menyapu Liquidity Pool SSL (Asia Low $2,644.0 → $2,641.2) dengan wick tajam di dalam Killzone WITA lalu tutup kembali di atas level. Belum entry — baru siaga!',
          seriesSlots: 16,
          series: [
            { o: 2647.8, h: 2648.6, l: 2645.2, c: 2645.8 },
            { o: 2645.8, h: 2647.4, l: 2644.6, c: 2647.0 },
            { o: 2647.0, h: 2648.4, l: 2646.4, c: 2648.0 },
            { o: 2648.0, h: 2648.2, l: 2645.0, c: 2645.6 },
            { o: 2645.6, h: 2646.2, l: 2644.2, c: 2644.6 },
            { o: 2644.6, h: 2645.8, l: 2644.0, c: 2645.4 },
            { o: 2645.4, h: 2645.6, l: 2643.8, c: 2644.2 },
            { o: 2644.2, h: 2645.4, l: 2641.2, c: 2645.0 }
          ],
          seriesLevels: [
            { price: 2648.4, fromIdx: 2, toIdx: 14, tone: 'muted', style: 'dotted', label: 'SWING HIGH (MSS) 2.648,4', labelSide: 'right' },
            { price: 2644.0, toIdx: 14, tone: 'sweep', style: 'dashed', label: 'SSL (ASIA LOW) 2.644,0', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 7, which: 'low', tone: 'sweep' }
          ],
          seriesCallouts: [
            { idx: 11.4, price: 2641.2, text: '1. SWEEP SSL ✓ · Tunggu MSS', tone: 'sweep' }
          ]
        },
        {
          label: '2. Displacement & MSS + FVG',
          caption: 'Tahap 2: Muncul candle dorongan kuat (Displacement) yang mematahkan Swing High ($2,648.4 → MSS Valid) sambil mencetak kotak FVG bersih ($2,646.2–$2,649.4) di area Discount.',
          seriesSlots: 16,
          series: [
            { o: 2647.8, h: 2648.6, l: 2645.2, c: 2645.8 },
            { o: 2645.8, h: 2647.4, l: 2644.6, c: 2647.0 },
            { o: 2647.0, h: 2648.4, l: 2646.4, c: 2648.0 },
            { o: 2648.0, h: 2648.2, l: 2645.0, c: 2645.6 },
            { o: 2645.6, h: 2646.2, l: 2644.2, c: 2644.6 },
            { o: 2644.6, h: 2645.8, l: 2644.0, c: 2645.4 },
            { o: 2645.4, h: 2645.6, l: 2643.8, c: 2644.2 },
            { o: 2644.2, h: 2645.4, l: 2641.2, c: 2645.0 },
            { o: 2645.0, h: 2646.2, l: 2644.6, c: 2645.8 },
            { o: 2645.8, h: 2652.2, l: 2645.6, c: 2651.6 },
            { o: 2651.6, h: 2654.4, l: 2649.4, c: 2653.8 }
          ],
          autoFvgs: [
            {
              c1Idx: 8,
              c3Idx: 10,
              type: 'bull',
              extendToIdx: 15,
              showCE: true,
              showWickMarkers: true,
              label: 'FVG ENTRY',
              ceLabel: '50% CE · 2647.8'
            }
          ],
          seriesLevels: [
            { price: 2648.4, fromIdx: 2, toIdx: 11, tone: 'bull', style: 'solid', label: '2. MSS VALID ✓', labelSide: 'left' },
            { price: 2644.0, toIdx: 8, tone: 'sweep', style: 'dashed', label: 'SSL 2.644,0', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 7, which: 'low', tone: 'sweep' }
          ]
        },
        {
          label: '3. Retrace Entry + SL/TP',
          caption: 'Tahap 3: Buy Limit di 50% CE FVG ($2,647.8), SL struktural di bawah wick sweep ($2,640.6 + napas spread), TP membidik BSL atas ($2,660.0) minimal 1:2 R:R.',
          seriesSlots: 16,
          series: [
            { o: 2647.8, h: 2648.6, l: 2645.2, c: 2645.8 },
            { o: 2645.8, h: 2647.4, l: 2644.6, c: 2647.0 },
            { o: 2647.0, h: 2648.4, l: 2646.4, c: 2648.0 },
            { o: 2648.0, h: 2648.2, l: 2645.0, c: 2645.6 },
            { o: 2645.6, h: 2646.2, l: 2644.2, c: 2644.6 },
            { o: 2644.6, h: 2645.8, l: 2644.0, c: 2645.4 },
            { o: 2645.4, h: 2645.6, l: 2643.8, c: 2644.2 },
            { o: 2644.2, h: 2645.4, l: 2641.2, c: 2645.0 },
            { o: 2645.0, h: 2646.2, l: 2644.6, c: 2645.8 },
            { o: 2645.8, h: 2652.2, l: 2645.6, c: 2651.6 },
            { o: 2651.6, h: 2654.4, l: 2649.4, c: 2653.8 },
            { o: 2653.8, h: 2654.0, l: 2650.4, c: 2650.8 },
            { o: 2650.8, h: 2651.2, l: 2647.6, c: 2650.2 },
            { o: 2650.2, h: 2654.8, l: 2649.8, c: 2654.2 },
            { o: 2654.2, h: 2657.8, l: 2653.6, c: 2657.2 },
            { o: 2657.2, h: 2660.6, l: 2656.6, c: 2660.0 }
          ],
          seriesZones: [
            { fromIdx: 12, toIdx: 15, low: 2647.8, high: 2660.0, tone: 'tp', label: 'TP BSL (+2.5R)', labelPos: 'tl', labelFront: true },
            { fromIdx: 12, toIdx: 15, low: 2640.6, high: 2647.8, tone: 'sl', label: 'SL (-1R)', labelPos: 'br', labelFront: true }
          ],
          autoFvgs: [
            {
              c1Idx: 8,
              c3Idx: 10,
              type: 'bull',
              extendToIdx: 12,
              showCE: true,
              showWickMarkers: false,
              label: 'FVG',
              labelSide: 'left'
            }
          ],
          seriesLevels: [
            { price: 2660.0, fromIdx: 6, tone: 'bull', style: 'dashed', label: 'BSL 2.660,0', labelSide: 'left' },
            { price: 2640.6, fromIdx: 7, toIdx: 15, tone: 'bear', style: 'solid', label: 'SL 2.640,6', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 12, which: 'low', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 4.2, price: 2655.6, text: 'Entry 50% CE · 2.647,8', tone: 'gold' }
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
          caption: 'Pilih candle berlawanan terakhir yang sweep Liquidity lalu langsung memicu Displacement + FVG. Tandai Open OB dan garis 50% MT.',
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
      title: 'Inversion Fair Value Gap (iFVG) — Pembalikan Kutub M1/M5',
      pairTag: 'XAU/USD · M5 · IFVG FLIP',
      priceLabels: ['Target', 'iFVG', 'SSL'],
      stages: [
        {
          label: '1. Bearish FVG Gagal',
          caption: 'Harga turun mencetak Bearish FVG ($2,648.2–$2,651.2) lalu menyapu SSL ($2,644.0). Normalnya kotak merah menahan harga turun, tetapi buyer justru membalas keras masuk kembali ke celah tersebut.',
          seriesSlots: 15,
          series: [
            { o: 2653.8, h: 2654.4, l: 2652.6, c: 2653.0 },
            { o: 2653.0, h: 2653.4, l: 2651.2, c: 2651.6 },
            { o: 2651.6, h: 2651.9, l: 2646.8, c: 2647.2 },
            { o: 2647.2, h: 2648.2, l: 2645.4, c: 2645.8 },
            { o: 2645.8, h: 2646.4, l: 2644.4, c: 2644.8 },
            { o: 2644.8, h: 2645.6, l: 2641.6, c: 2644.9 },
            { o: 2644.9, h: 2647.8, l: 2644.6, c: 2647.4 },
            { o: 2647.4, h: 2649.8, l: 2647.0, c: 2649.2 }
          ],
          autoFvgs: [
            {
              c1Idx: 1,
              c3Idx: 3,
              type: 'bear',
              extendToIdx: 14,
              showCE: false,
              showWickMarkers: true,
              label: 'BEARISH FVG LAMA (SIBI)'
            }
          ],
          seriesLevels: [
            { price: 2644.0, toIdx: 7, tone: 'sweep', style: 'dashed', label: 'SSL SWEEP 2.644,0', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 5, which: 'low', tone: 'sweep' }
          ],
          seriesCallouts: [
            { idx: 10.6, price: 2644.2, text: 'Buyer balas masuk ke kotak merah', tone: 'gold' }
          ]
        },
        {
          label: '2. Body Close Tembus → iFVG!',
          caption: 'Candle bullish menutup Body TEGAS DI ATAS batas atas Bearish FVG ($2,651.2). Seketika kotak merah berbalik kutub menjadi Bullish iFVG (+iFVG) sebagai lantai peluncuran.',
          seriesSlots: 15,
          series: [
            { o: 2653.8, h: 2654.4, l: 2652.6, c: 2653.0 },
            { o: 2653.0, h: 2653.4, l: 2651.2, c: 2651.6 },
            { o: 2651.6, h: 2651.9, l: 2646.8, c: 2647.2 },
            { o: 2647.2, h: 2648.2, l: 2645.4, c: 2645.8 },
            { o: 2645.8, h: 2646.4, l: 2644.4, c: 2644.8 },
            { o: 2644.8, h: 2645.6, l: 2641.6, c: 2644.9 },
            { o: 2644.9, h: 2647.8, l: 2644.6, c: 2647.4 },
            { o: 2647.4, h: 2649.8, l: 2647.0, c: 2649.2 },
            { o: 2649.2, h: 2652.4, l: 2648.8, c: 2651.8 },
            { o: 2651.8, h: 2654.4, l: 2651.4, c: 2653.8 }
          ],
          autoFvgs: [
            {
              c1Idx: 1,
              c3Idx: 3,
              type: 'bear',
              tone: 'fvg',
              extendToIdx: 14,
              showCE: false,
              showWickMarkers: true,
              label: 'BULLISH iFVG (FLIPPED!)'
            }
          ],
          seriesLevels: [
            { price: 2651.2, fromIdx: 7, tone: 'bull', style: 'solid', label: 'BODY CLOSE DI ATAS ✓', labelSide: 'right' },
            { price: 2644.0, toIdx: 7, tone: 'sweep', style: 'dashed', label: 'SSL SWEPT', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 5, which: 'low', tone: 'sweep' }
          ],
          seriesCallouts: [
            { idx: 11.0, price: 2644.2, text: 'Kutub berbalik: Resist → Support iFVG', tone: 'bull' }
          ]
        },
        {
          label: '3. Retest Kotak iFVG → Terbang',
          caption: 'Pullback menyentuh kotak +iFVG ($2,649.7) dengan body tetap bertahan di atas $2,651.2 — sinyal entry Buy presisi dengan SL di bawah kotak/swing low menuju TP BSL ($2,659.5).',
          seriesSlots: 15,
          series: [
            { o: 2653.8, h: 2654.4, l: 2652.6, c: 2653.0 },
            { o: 2653.0, h: 2653.4, l: 2651.2, c: 2651.6 },
            { o: 2651.6, h: 2651.9, l: 2646.8, c: 2647.2 },
            { o: 2647.2, h: 2648.2, l: 2645.4, c: 2645.8 },
            { o: 2645.8, h: 2646.4, l: 2644.4, c: 2644.8 },
            { o: 2644.8, h: 2645.6, l: 2641.6, c: 2644.9 },
            { o: 2644.9, h: 2647.8, l: 2644.6, c: 2647.4 },
            { o: 2647.4, h: 2649.8, l: 2647.0, c: 2649.2 },
            { o: 2649.2, h: 2652.4, l: 2648.8, c: 2651.8 },
            { o: 2651.8, h: 2654.4, l: 2651.4, c: 2653.8 },
            { o: 2653.8, h: 2654.2, l: 2651.6, c: 2652.0 },
            { o: 2652.0, h: 2652.6, l: 2649.7, c: 2651.7 },
            { o: 2651.7, h: 2655.0, l: 2651.5, c: 2654.6 },
            { o: 2654.6, h: 2657.6, l: 2654.2, c: 2657.2 },
            { o: 2657.2, h: 2659.8, l: 2656.8, c: 2659.2 }
          ],
          seriesZones: [
            { fromIdx: 11, toIdx: 14.3, low: 2651.2, high: 2659.5, tone: 'tp', label: 'TP BSL (+2.5R)', labelPos: 'tl' }
          ],
          autoFvgs: [
            {
              c1Idx: 1,
              c3Idx: 3,
              type: 'bear',
              tone: 'fvg',
              extendToIdx: 14,
              showCE: false,
              showWickMarkers: false,
              label: 'iFVG SUPPORT'
            }
          ],
          seriesLevels: [
            { price: 2659.5, fromIdx: 7, tone: 'bull', style: 'dashed', label: 'BSL 2.659,5', labelSide: 'left' },
            { price: 2644.0, toIdx: 7, tone: 'muted', style: 'dotted', label: 'SSL 2.644,0', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 11, which: 'low', tone: 'gold' }
          ],
          seriesArrows: [
            { fromIdx: 11.4, fromPrice: 2652.2, toIdx: 14.0, toPrice: 2658.4, tone: 'bull', label: 'Entry → TP', labelDx: -18, labelDy: -10 }
          ],
          seriesCallouts: [
            { idx: 11.0, price: 2644.2, text: 'Retest iFVG → Entry Instan', tone: 'gold' }
          ]
        }
      ]
    },

    'model-turtle-soup': {
      title: 'Model Alternatif: Turtle Soup & Smart Money Reversal (SMR)',
      pairTag: 'XAU/USD · M5 · SMR REVERSAL',
      priceLabels: ['PDH/BSL', 'CISD', 'Target'],
      stages: [
        {
          label: '1. Jebakan False Breakout',
          caption: 'Harga sengaja mendorong naik menyapu PDH / Asia High ($2,658.0 → $2,661.4) di pembukaan Killzone lalu tutup kembali di bawah garis, menjebak buyer breakout di puncak.',
          seriesSlots: 15,
          series: [
            { o: 2651.2, h: 2653.6, l: 2650.8, c: 2653.0 },
            { o: 2653.0, h: 2655.6, l: 2652.6, c: 2655.2 },
            { o: 2655.2, h: 2657.6, l: 2654.8, c: 2657.0 },
            { o: 2657.0, h: 2657.8, l: 2654.4, c: 2655.0 },
            { o: 2655.0, h: 2656.4, l: 2654.0, c: 2656.0 },
            { o: 2656.0, h: 2658.0, l: 2655.6, c: 2657.6 },
            { o: 2657.6, h: 2661.4, l: 2657.0, c: 2657.4 },
            { o: 2657.4, h: 2658.2, l: 2655.6, c: 2656.0 }
          ],
          seriesLevels: [
            { price: 2658.0, toIdx: 14, tone: 'sweep', style: 'dashed', label: 'PDH / BSL (TRAP) 2.658,0', labelSide: 'right' },
            { price: 2654.0, fromIdx: 3, toIdx: 14, tone: 'muted', style: 'dotted', label: 'BATAS CISD 2.654,0', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'high', tone: 'sweep' }
          ],
          seriesCallouts: [
            { idx: 10.6, price: 2661.2, text: 'Turtle Soup Sweep di Atas PDH!', tone: 'sweep' }
          ]
        },
        {
          label: '2. Rejection + CISD / M1 Shift',
          caption: 'Pasca sweep, harga banting menembus CISD ($2,654.0) sambil meninggalkan SIBI ($2,652.8–$2,655.6). Entry Sell saat retest dengan SL di atas puncak sweep menuju Opposing SSL (+3R).',
          seriesSlots: 15,
          series: [
            { o: 2651.2, h: 2653.6, l: 2650.8, c: 2653.0 },
            { o: 2653.0, h: 2655.6, l: 2652.6, c: 2655.2 },
            { o: 2655.2, h: 2657.6, l: 2654.8, c: 2657.0 },
            { o: 2657.0, h: 2657.8, l: 2654.4, c: 2655.0 },
            { o: 2655.0, h: 2656.4, l: 2654.0, c: 2656.0 },
            { o: 2656.0, h: 2658.0, l: 2655.6, c: 2657.6 },
            { o: 2657.6, h: 2661.4, l: 2657.0, c: 2657.4 },
            { o: 2657.4, h: 2658.2, l: 2655.6, c: 2656.0 },
            { o: 2656.0, h: 2656.4, l: 2650.6, c: 2651.2 },
            { o: 2651.2, h: 2652.8, l: 2649.2, c: 2649.8 },
            { o: 2649.8, h: 2654.6, l: 2649.4, c: 2653.0 },
            { o: 2653.0, h: 2653.4, l: 2648.6, c: 2649.2 },
            { o: 2649.2, h: 2649.8, l: 2646.4, c: 2647.0 },
            { o: 2647.0, h: 2647.6, l: 2644.8, c: 2645.4 },
            { o: 2645.4, h: 2646.0, l: 2643.2, c: 2643.8 }
          ],
          seriesZones: [
            { fromIdx: 10, toIdx: 14, low: 2654.6, high: 2662.0, tone: 'sl', label: 'SL DI ATAS WICK', labelPos: 'tr', labelFront: true },
            { fromIdx: 10, toIdx: 14, low: 2643.6, high: 2654.6, tone: 'tp', label: 'TP SSL (+3R)', labelPos: 'bl', labelFront: true }
          ],
          autoFvgs: [
            {
              c1Idx: 7,
              c3Idx: 9,
              type: 'bear',
              extendToIdx: 10.2,
              showCE: false,
              showWickMarkers: false,
              label: 'SIBI',
              labelSide: 'right'
            }
          ],
          seriesLevels: [
            { price: 2658.0, toIdx: 8, tone: 'sweep', style: 'dashed', label: 'PDH 2.658,0', labelSide: 'left' },
            { price: 2654.0, fromIdx: 0, toIdx: 9.5, tone: 'bear', style: 'solid', label: 'CISD / SMR SHIFT', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'high', tone: 'sweep' },
            { idx: 10, which: 'high', tone: 'gold' }
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
          caption: 'Saat harga sweep PDH/PDL/PWH/PWL lalu menolak tajam: pilih Model 4 (Turtle Soup SMR) atau Model 2 (Order Block Sniper) untuk R:R maksimal.',
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
          caption: 'Babak 1 (08:00–12:00 WITA): Harga bergerak rapat di sekitar Daily Open membangun Liquidity Pool atas & bawah.',
          seriesSlots: 16,
          series: [
            { o: 2650.0, h: 2651.5, l: 2649.4, c: 2651.0 },
            { o: 2651.0, h: 2651.4, l: 2648.6, c: 2649.2 },
            { o: 2649.2, h: 2651.3, l: 2648.8, c: 2650.8 },
            { o: 2650.8, h: 2651.2, l: 2648.8, c: 2649.4 },
            { o: 2649.4, h: 2651.1, l: 2649.0, c: 2650.6 },
            { o: 2650.6, h: 2651.0, l: 2648.6, c: 2649.6 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 5, low: 2648.4, high: 2653.0, tone: 'asia', label: 'A · ACCUMULATION (ASIA)', labelPos: 'tl', labelFront: true }
          ],
          seriesLevels: [
            { price: 2650.0, tone: 'gold', style: 'dashed', label: 'NY MIDNIGHT OPEN 2.650,0', labelSide: 'right', labelPos: 'above' }
          ],
          seriesCallouts: [
            { idx: 10.2, price: 2646.6, text: 'Sesi Asia: Bangun Liquidity Pool Atas & Bawah', tone: 'asia' }
          ]
        },
        {
          label: '2. Manipulation (Judas Swing)',
          caption: 'Babak 2 (Awal London/NY): Harga sengaja dibanting turun DI BAWAH Daily Open sweep Asia Low untuk menipu seller breakout.',
          seriesSlots: 16,
          series: [
            { o: 2650.0, h: 2651.5, l: 2649.4, c: 2651.0 },
            { o: 2651.0, h: 2651.4, l: 2648.6, c: 2649.2 },
            { o: 2649.2, h: 2651.3, l: 2648.8, c: 2650.8 },
            { o: 2650.8, h: 2651.2, l: 2648.8, c: 2649.4 },
            { o: 2649.4, h: 2651.1, l: 2649.0, c: 2650.6 },
            { o: 2650.6, h: 2651.0, l: 2648.6, c: 2649.6 },
            { o: 2649.6, h: 2650.0, l: 2646.6, c: 2647.2 },
            { o: 2647.2, h: 2647.6, l: 2644.2, c: 2644.8 },
            { o: 2644.8, h: 2647.0, l: 2642.4, c: 2646.4 },
            { o: 2646.4, h: 2648.8, l: 2645.8, c: 2648.4 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 5, low: 2648.4, high: 2653.0, tone: 'asia', label: 'A · ASIA', labelPos: 'tl', labelFront: true },
            { fromIdx: 6, toIdx: 9, low: 2642.0, high: 2650.0, tone: 'sweep', label: 'M · JUDAS', labelPos: 'bl', labelFront: true }
          ],
          seriesLevels: [
            { price: 2650.0, tone: 'gold', style: 'dashed', label: 'NY MIDNIGHT OPEN 2.650,0', labelSide: 'right', labelPos: 'above' }
          ],
          seriesWickRings: [
            { idx: 8, which: 'low', tone: 'ink' }
          ],
          seriesCallouts: [
            { idx: 9.8, price: 2640.4, text: 'Buy Terbaik: DI BAWAH Daily Open (Discount)!', tone: 'gold' }
          ]
        },
        {
          label: '3. Distribution (Ekspansi Asli)',
          caption: 'Babak 3 (London/NY): Setelah manipulasi penuh, harga melesat naik menembus Daily Open dan Asia High menuju target harian.',
          seriesSlots: 16,
          series: [
            { o: 2650.0, h: 2651.5, l: 2649.4, c: 2651.0 },
            { o: 2651.0, h: 2651.4, l: 2648.6, c: 2649.2 },
            { o: 2649.2, h: 2651.3, l: 2648.8, c: 2650.8 },
            { o: 2650.8, h: 2651.2, l: 2648.8, c: 2649.4 },
            { o: 2649.4, h: 2651.1, l: 2649.0, c: 2650.6 },
            { o: 2650.6, h: 2651.0, l: 2648.6, c: 2649.6 },
            { o: 2649.6, h: 2650.0, l: 2646.6, c: 2647.2 },
            { o: 2647.2, h: 2647.6, l: 2644.2, c: 2644.8 },
            { o: 2644.8, h: 2647.0, l: 2642.4, c: 2646.4 },
            { o: 2646.4, h: 2648.8, l: 2645.8, c: 2648.4 },
            { o: 2648.4, h: 2654.4, l: 2648.0, c: 2653.8 },
            { o: 2653.8, h: 2656.2, l: 2652.2, c: 2655.6 },
            { o: 2655.6, h: 2656.0, l: 2653.2, c: 2654.2 },
            { o: 2654.2, h: 2658.4, l: 2653.8, c: 2657.8 },
            { o: 2657.8, h: 2661.0, l: 2657.2, c: 2660.4 },
            { o: 2660.4, h: 2662.8, l: 2659.8, c: 2662.2 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 5, low: 2648.4, high: 2654.6, tone: 'asia', label: 'A · ASIA', labelPos: 'tl', labelFront: true },
            { fromIdx: 6, toIdx: 9, low: 2642.0, high: 2650.0, tone: 'sweep', label: 'M · JUDAS', labelPos: 'bl', labelFront: true },
            { fromIdx: 10, toIdx: 15, low: 2650.0, high: 2663.4, tone: 'tp', label: 'D · DISTRIBUTION', labelPos: 'tl', labelFront: true }
          ],
          seriesLevels: [
            { price: 2650.0, tone: 'gold', style: 'dashed', label: 'DAILY OPEN 2.650,0', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 8, which: 'low', tone: 'ink' }
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
            { x1: 27, x2: 53, y1: 14, y2: 86, tone: 'killzone', label: 'London KZ', sub: '15:00–18:00 WITA' },
            { x1: 56, x2: 70, y1: 14, y2: 38, tone: 'neutral', label: 'Lunch', sub: 'Istirahat' },
            { x1: 73, x2: 96, y1: 14, y2: 94, tone: 'bull', label: 'NY KZ', sub: '20:30–23:30 WITA' }
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
          series: [
            { o: 2650.2, h: 2651.8, l: 2649.6, c: 2651.2 },
            { o: 2651.2, h: 2651.8, l: 2649.8, c: 2650.4 },
            { o: 2650.4, h: 2652.0, l: 2649.8, c: 2651.4 },
            { o: 2651.4, h: 2652.0, l: 2650.2, c: 2650.8 },
            { o: 2650.8, h: 2652.2, l: 2650.2, c: 2651.6 },
            { o: 2651.6, h: 2652.2, l: 2650.0, c: 2650.6 },
            { o: 2650.6, h: 2652.0, l: 2649.8, c: 2651.2 },
            { o: 2651.2, h: 2661.4, l: 2641.2, c: 2649.4 },
            { o: 2649.4, h: 2657.8, l: 2644.6, c: 2654.2 },
            { o: 2654.2, h: 2655.6, l: 2643.8, c: 2646.8 },
            { o: 2646.8, h: 2653.4, l: 2645.4, c: 2651.4 },
            { o: 2651.4, h: 2652.6, l: 2647.4, c: 2648.6 },
            { o: 2648.6, h: 2650.4, l: 2648.0, c: 2649.6 },
            { o: 2649.6, h: 2650.4, l: 2648.2, c: 2648.8 }
          ],
          seriesZones: [
            { fromIdx: 5, toIdx: 11, low: 2640.4, high: 2663.2, tone: 'danger', label: 'NEWS LOCK (-15m / +30m)', labelPos: 'tr', labelFront: true }
          ],
          seriesVLines: [
            { idx: 7, tone: 'bear', style: 'dashed', label: 'T = 0 RILIS', labelPos: 'top' }
          ],
          seriesWickRings: [
            { idx: 7, which: 'high', tone: 'bear' },
            { idx: 7, which: 'low', tone: 'bear' }
          ],
          seriesCallouts: [
            { idx: 7.0, price: 2637.8, text: 'Whipsaw 2 Arah + Spread 5× → SL Buyer & Seller Kena', tone: 'bear' }
          ]
        },
        {
          label: 'Post-News Setup (+30m Aman)',
          caption: 'Tunggu 30 menit pasca rilis hingga spread kembali normal dan arah struktur M5 jelas. Gunakan FVG yang tercipta dari dorongan news sebagai tumpangan aman.',
          series: [
            { o: 2647.4, h: 2649.0, l: 2646.8, c: 2648.4 },
            { o: 2648.4, h: 2649.2, l: 2646.4, c: 2647.2 },
            { o: 2647.2, h: 2648.8, l: 2646.6, c: 2648.0 },
            { o: 2648.0, h: 2650.2, l: 2647.4, c: 2649.2 },
            { o: 2649.2, h: 2656.6, l: 2644.6, c: 2655.6 },
            { o: 2655.6, h: 2658.4, l: 2654.2, c: 2657.2 },
            { o: 2657.2, h: 2658.0, l: 2655.0, c: 2655.8 },
            { o: 2655.8, h: 2656.4, l: 2654.0, c: 2654.6 },
            { o: 2654.6, h: 2655.0, l: 2652.4, c: 2653.0 },
            { o: 2653.0, h: 2655.4, l: 2652.0, c: 2654.8 },
            { o: 2654.8, h: 2658.0, l: 2654.4, c: 2657.4 },
            { o: 2657.4, h: 2659.8, l: 2656.8, c: 2659.2 },
            { o: 2659.2, h: 2659.8, l: 2657.8, c: 2658.4 },
            { o: 2658.4, h: 2661.6, l: 2658.0, c: 2661.0 },
            { o: 2661.0, h: 2663.2, l: 2660.4, c: 2662.6 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 6, low: 2643.8, high: 2663.6, tone: 'danger', label: 'LOCKED (-15m/+30m)', labelPos: 'tl', labelFront: true }
          ],
          autoFvgs: [
            { c1Idx: 3, c3Idx: 5, type: 'bull', showCE: true, label: 'POST-NEWS FVG AMAN', ceLabel: '50% CE', extendToIdx: 14, showWickMarkers: false }
          ],
          seriesWickRings: [
            { idx: 9, which: 'low', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 10.6, price: 2646.2, text: 'Spread Normal + Arah Jelas = Entry Berkualitas', tone: 'bull' }
          ]
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
          caption: 'Jika candle kemarin tutup kuat di atas High sebelumnya atau baru saja sweep PDL dan memantul keras, Draw on Liquidity (magnet harga) mengarah ke PDH.',
          seriesSlots: 15,
          series: [
            { o: 2658.0, h: 2658.8, l: 2654.0, c: 2654.6 },
            { o: 2654.6, h: 2655.2, l: 2649.8, c: 2650.4 },
            { o: 2650.4, h: 2651.0, l: 2646.0, c: 2647.2 },
            { o: 2647.2, h: 2650.2, l: 2642.8, c: 2649.6 },
            { o: 2649.6, h: 2654.0, l: 2649.2, c: 2653.4 },
            { o: 2653.4, h: 2656.2, l: 2652.8, c: 2655.6 },
            { o: 2655.6, h: 2656.0, l: 2653.2, c: 2654.0 },
            { o: 2654.0, h: 2657.4, l: 2653.6, c: 2656.8 },
            { o: 2656.8, h: 2659.2, l: 2656.2, c: 2658.6 },
            { o: 2658.6, h: 2659.0, l: 2656.8, c: 2657.4 },
            { o: 2657.4, h: 2660.4, l: 2657.0, c: 2659.8 }
          ],
          seriesLevels: [
            { price: 2664.0, tone: 'gold', style: 'dashed', label: 'DOL TARGET: PDH 2.664,0', labelSide: 'right', labelPos: 'above' },
            { price: 2646.0, tone: 'sweep', style: 'dashed', label: 'PDL 2.646,0 SWEPT ✓', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 3, which: 'low', tone: 'ink' }
          ],
          seriesArrows: [
            { fromIdx: 10.6, fromPrice: 2659.8, toIdx: 14.0, toPrice: 2663.5, tone: 'bull', label: 'Magnet ke PDH', labelDx: -8, labelDy: 16 }
          ],
          seriesCallouts: [
            { idx: 5.0, price: 2640.8, text: 'Sweep PDL + Tutup Kuat → Bias Bullish ke PDH', tone: 'bull' }
          ]
        },
        {
          label: 'Netral / Inside Bar (No Bias)',
          caption: 'Jika harga terjebak di tengah range kemarin (Equilibrium) tanpa sweep PDH maupun PDL, jangan paksa menebak arah. Tunggu salah satu ujung di-sweep lebih dulu.',
          series: [
            { o: 2645.8, h: 2653.2, l: 2644.0, c: 2652.4 },
            { o: 2652.4, h: 2662.0, l: 2651.8, c: 2660.6 },
            { o: 2660.6, h: 2661.2, l: 2656.0, c: 2656.8 },
            { o: 2656.8, h: 2657.4, l: 2651.8, c: 2652.6 },
            { o: 2652.6, h: 2656.2, l: 2652.0, c: 2655.4 },
            { o: 2655.4, h: 2656.0, l: 2650.4, c: 2651.2 },
            { o: 2651.2, h: 2655.4, l: 2650.6, c: 2654.6 },
            { o: 2654.6, h: 2655.2, l: 2649.6, c: 2650.4 },
            { o: 2650.4, h: 2654.6, l: 2649.8, c: 2653.8 },
            { o: 2653.8, h: 2654.4, l: 2650.8, c: 2651.6 },
            { o: 2651.6, h: 2655.8, l: 2651.0, c: 2655.0 },
            { o: 2655.0, h: 2655.6, l: 2651.2, c: 2652.0 },
            { o: 2652.0, h: 2655.0, l: 2651.4, c: 2654.2 },
            { o: 2654.2, h: 2654.8, l: 2651.8, c: 2652.8 }
          ],
          seriesZones: [
            { fromIdx: 3, toIdx: 13, low: 2648.8, high: 2658.2, tone: 'neutral', label: 'ZONA NETRAL / INSIDE CHOP', labelPos: 'tr', labelFront: true }
          ],
          seriesLevels: [
            { price: 2662.0, tone: 'muted', style: 'dotted', label: 'PDH 2.662,0 (Belum Tersentuh)', labelSide: 'right', labelPos: 'above' },
            { price: 2644.0, tone: 'muted', style: 'dotted', label: 'PDL 2.644,0 (Belum Tersentuh)', labelSide: 'right', labelPos: 'below' }
          ],
          seriesCallouts: [
            { idx: 8.0, price: 2646.4, text: 'Tunggu Sweep PDH atau PDL sebelum ambil posisi', tone: 'gold' }
          ]
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
      title: 'Rekayasa SL Struktural (+Napas Spread) & TP Berbasis Liquidity',
      pairTag: 'XAU/USD · M5 · SL & TP PRESISI',
      priceLabels: ['TP2 BSL', 'TP1 2R', 'SL+Napas'],
      stages: [
        {
          label: 'Penempatan SL & TP Valid',
          caption: 'SL ditaruh di balik swing invalidasi ($2,642.4) ditambah napas spread $0.80 ($2,641.6). TP1 di 2R ($2,657.8) untuk Partial, TP2 di BSL mayor ($2,664.2 = 3.2R).',
          series: [
            { o: 2646.4, h: 2647.0, l: 2644.6, c: 2645.0 },
            { o: 2645.0, h: 2645.4, l: 2643.2, c: 2643.8 },
            { o: 2643.8, h: 2644.6, l: 2642.4, c: 2644.2 },
            { o: 2644.2, h: 2645.6, l: 2643.8, c: 2645.2 },
            { o: 2645.2, h: 2651.4, l: 2645.0, c: 2650.8 },
            { o: 2650.8, h: 2652.8, l: 2648.6, c: 2652.2 },
            { o: 2652.2, h: 2652.4, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.2, l: 2646.8, c: 2649.2 },
            { o: 2649.2, h: 2653.4, l: 2648.8, c: 2652.8 },
            { o: 2652.8, h: 2655.6, l: 2652.2, c: 2655.0 },
            { o: 2655.0, h: 2658.2, l: 2654.6, c: 2657.8 },
            { o: 2657.8, h: 2658.2, l: 2655.8, c: 2656.4 },
            { o: 2656.4, h: 2660.2, l: 2656.0, c: 2659.6 },
            { o: 2659.6, h: 2662.4, l: 2659.0, c: 2661.8 },
            { o: 2661.8, h: 2664.6, l: 2661.2, c: 2664.2 }
          ],
          seriesZones: [
            { fromIdx: 7, toIdx: 14, low: 2647.0, high: 2664.2, tone: 'tp', label: 'TP2 BSL (3.2R)', labelPos: 'tl', labelFront: true },
            { fromIdx: 7, toIdx: 14, low: 2641.6, high: 2647.0, tone: 'sl', label: 'SL STRUKTURAL + NAPAS', labelPos: 'br', labelFront: true }
          ],
          autoFvgs: [
            {
              c1Idx: 3,
              c3Idx: 5,
              type: 'bull',
              extendToIdx: 10,
              showCE: false,
              showWickMarkers: false,
              label: 'FVG',
              labelSide: 'right'
            }
          ],
          seriesLevels: [
            { price: 2657.8, fromIdx: 3, tone: 'bull', style: 'dashed', label: 'TP1 PARTIAL (2R)', labelSide: 'left' },
            { price: 2647.0, fromIdx: 4, toIdx: 14, tone: 'gold', style: 'solid', label: 'ENTRY FVG 2.647,0', labelSide: 'right' },
            { price: 2641.6, toIdx: 14, tone: 'bear', style: 'solid', label: 'SL 2.641,6 (-1R)', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 7, which: 'low', tone: 'gold' }
          ]
        },
        {
          label: 'Kesalahan SL Terlalu Sempit',
          caption: 'SL yang ditempel tepat di dalam FVG ($2,644.6) tanpa napas spread sering kena sapu wick retest ($2,643.6) sebelum harga terbang ke TP — sedangkan SL struktural ($2,641.6) tetap selamat!',
          series: [
            { o: 2646.4, h: 2647.0, l: 2644.6, c: 2645.0 },
            { o: 2645.0, h: 2645.4, l: 2643.2, c: 2643.8 },
            { o: 2643.8, h: 2644.6, l: 2642.4, c: 2644.2 },
            { o: 2644.2, h: 2645.6, l: 2643.8, c: 2645.2 },
            { o: 2645.2, h: 2651.4, l: 2645.0, c: 2650.8 },
            { o: 2650.8, h: 2652.8, l: 2648.6, c: 2652.2 },
            { o: 2652.2, h: 2652.4, l: 2649.4, c: 2649.8 },
            { o: 2649.8, h: 2650.0, l: 2646.4, c: 2646.8 },
            { o: 2646.8, h: 2648.2, l: 2643.6, c: 2647.8 },
            { o: 2647.8, h: 2652.0, l: 2647.4, c: 2651.4 },
            { o: 2651.4, h: 2655.4, l: 2651.0, c: 2654.8 },
            { o: 2654.8, h: 2658.6, l: 2654.2, c: 2658.0 },
            { o: 2658.0, h: 2661.2, l: 2657.6, c: 2660.6 },
            { o: 2660.6, h: 2663.4, l: 2660.0, c: 2662.8 },
            { o: 2662.8, h: 2664.6, l: 2662.2, c: 2664.2 }
          ],
          autoFvgs: [
            {
              c1Idx: 3,
              c3Idx: 5,
              type: 'bull',
              extendToIdx: 14,
              showCE: false,
              showWickMarkers: false,
              label: 'FVG',
              labelSide: 'right'
            }
          ],
          seriesLevels: [
            { price: 2644.6, fromIdx: 3, tone: 'bear', style: 'dashed', label: 'SL TERLALU SEMPIT (KENA!)', labelSide: 'right' },
            { price: 2641.6, tone: 'bull', style: 'solid', label: 'SL STRUKTURAL 2.641,6 (SELAMAT)', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 8, which: 'low', tone: 'sweep' }
          ],
          seriesCallouts: [
            { idx: 5.8, price: 2659.8, text: 'Wick retest menyenggol SL sempit lalu terbang!', tone: 'sweep' }
          ]
        }
      ]
    },

    'trade-management-scale': {
      title: 'Manajemen Trade: Partial 50% di 1:2 R:R & BEP pada Waktu Tepat',
      pairTag: 'XAU/USD · M5 · TRADE MANAGEMENT',
      priceLabels: ['Runner 3.5R', 'TP1 2R', 'Entry/BEP'],
      stages: [
        {
          label: '1. Jangan BEP Terlalu Cepat',
          caption: 'Menggeser SL ke Break Even ($2,646.0) saat baru +0.5R membuat posisimu kena sapu retest wajar ($2,644.8) dengan hasil $0 tepat sebelum harga terbang ke +3R.',
          series: [
            { o: 2648.2, h: 2648.6, l: 2645.6, c: 2646.2 },
            { o: 2646.2, h: 2646.8, l: 2643.2, c: 2644.0 },
            { o: 2644.0, h: 2646.6, l: 2642.4, c: 2646.0 },
            { o: 2646.0, h: 2648.4, l: 2645.8, c: 2647.8 },
            { o: 2647.8, h: 2649.2, l: 2647.2, c: 2648.6 },
            { o: 2648.6, h: 2648.8, l: 2646.4, c: 2646.8 },
            { o: 2646.8, h: 2647.6, l: 2644.8, c: 2647.2 },
            { o: 2647.2, h: 2650.8, l: 2647.0, c: 2650.2 },
            { o: 2650.2, h: 2653.4, l: 2649.8, c: 2652.8 },
            { o: 2652.8, h: 2653.2, l: 2651.0, c: 2651.6 },
            { o: 2651.6, h: 2655.6, l: 2651.2, c: 2655.0 },
            { o: 2655.0, h: 2658.2, l: 2654.6, c: 2657.6 },
            { o: 2657.6, h: 2660.4, l: 2657.2, c: 2659.8 },
            { o: 2659.8, h: 2662.2, l: 2659.2, c: 2661.6 },
            { o: 2661.6, h: 2663.6, l: 2661.0, c: 2663.0 }
          ],
          seriesLevels: [
            { price: 2646.0, fromIdx: 2, tone: 'gold', style: 'solid', label: 'ENTRY / BEP TERLALU CEPAT', labelSide: 'right' },
            { price: 2641.0, tone: 'muted', style: 'dotted', label: 'SL ASLI 2.641,0 (MASIH AMAN)', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'low', tone: 'sweep' }
          ],
          seriesCallouts: [
            { idx: 5.4, price: 2656.6, text: 'Kena BEP $0, lalu nonton harga terbang', tone: 'sweep' }
          ]
        },
        {
          label: '2. Partial di 1:2 + BEP + Runner',
          caption: 'Tunggu TP1 +2R ($2,656.0) tercapai → tutup 50% posisi (amankan profit pasti), geser SL ke BEP ($2,646.0), lalu biarkan 50% Runner melaju bebas stres ke 3.5R ($2,663.5)!',
          series: [
            { o: 2647.8, h: 2648.4, l: 2644.2, c: 2644.8 },
            { o: 2644.8, h: 2646.6, l: 2643.0, c: 2646.0 },
            { o: 2646.0, h: 2649.6, l: 2645.6, c: 2649.0 },
            { o: 2649.0, h: 2649.4, l: 2647.2, c: 2647.8 },
            { o: 2647.8, h: 2651.8, l: 2647.4, c: 2651.2 },
            { o: 2651.2, h: 2654.4, l: 2650.8, c: 2653.8 },
            { o: 2653.8, h: 2656.4, l: 2653.4, c: 2656.0 },
            { o: 2656.0, h: 2656.4, l: 2653.2, c: 2653.8 },
            { o: 2653.8, h: 2654.4, l: 2651.8, c: 2652.6 },
            { o: 2652.6, h: 2655.6, l: 2652.2, c: 2655.2 },
            { o: 2655.2, h: 2658.4, l: 2654.8, c: 2657.8 },
            { o: 2657.8, h: 2660.2, l: 2657.2, c: 2659.6 },
            { o: 2659.6, h: 2660.0, l: 2658.2, c: 2658.8 },
            { o: 2658.8, h: 2662.0, l: 2658.4, c: 2661.4 },
            { o: 2661.4, h: 2664.2, l: 2661.0, c: 2663.6 }
          ],
          seriesZones: [
            { fromIdx: 9, toIdx: 14, low: 2656.0, high: 2664.2, tone: 'tp', label: 'RUNNER 50% → 3.5R', labelPos: 'tl', labelFront: true }
          ],
          seriesLevels: [
            { price: 2656.0, tone: 'bull', style: 'dashed', label: 'TP1 1:2 → PARTIAL 50% & BEP', labelSide: 'left' },
            { price: 2646.0, fromIdx: 1, tone: 'gold', style: 'solid', label: 'ENTRY 2.646,0 → SL GESER BEP', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'high', tone: 'gold' }
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
          caption: 'Jangan ganti strategi tiap minggu. Eksekusi 1 model utama selama 100 sample: 50 Backtest Replay → 30 Forward Test (Demo/Cent) → 20 Live Terukur.',
          bars: [
            { x1: 6, x2: 32, y1: 16, y2: 52, tone: 'cyan', label: 'Sample 1–50', sub: 'Backtest / Replay' },
            { x1: 36, x2: 64, y1: 16, y2: 72, tone: 'gold', label: 'Sample 51–80', sub: 'Forward Demo / Cent' },
            { x1: 68, x2: 94, y1: 16, y2: 92, tone: 'bull', label: 'Sample 81–100', sub: 'Live 1% · Konsisten' }
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
      pairTag: 'XAU/USD · M15 · BREAKER & UNICORN',
      priceLabels: ['2.656', '2.648', '2.640'],
      stages: [
        {
          label: '1. Sweep → Jebol Struktur',
          caption: 'Harga sweep BSL ($2,654.0 → $2,656.4) lalu langsung dibanting menembus Swing Low ($2,648.4) dengan Displacement keras — rangkaian up-close terakhir yang gagal berubah menjadi Bearish Breaker Block.',
          seriesSlots: 15,
          series: [
            { o: 2649.6, h: 2652.0, l: 2649.2, c: 2651.6 },
            { o: 2651.6, h: 2654.0, l: 2651.2, c: 2653.4 },
            { o: 2653.4, h: 2653.8, l: 2650.2, c: 2650.6 },
            { o: 2650.6, h: 2651.0, l: 2648.4, c: 2648.9 },
            { o: 2648.9, h: 2651.4, l: 2648.6, c: 2651.0 },
            { o: 2651.0, h: 2653.4, l: 2650.8, c: 2653.0 },
            { o: 2653.0, h: 2656.4, l: 2652.2, c: 2652.6 },
            { o: 2652.6, h: 2652.9, l: 2651.4, c: 2651.8 },
            { o: 2651.8, h: 2652.0, l: 2645.6, c: 2646.0 },
            { o: 2646.0, h: 2647.8, l: 2644.0, c: 2644.4 },
            { o: 2644.4, h: 2645.4, l: 2643.2, c: 2644.8 }
          ],
          seriesZones: [
            { fromIdx: 4, toIdx: 14, low: 2649.4, high: 2653.0, tone: 'ob', label: 'BEARISH BREAKER BLOCK', labelPos: 'tr' }
          ],
          seriesLevels: [
            { price: 2654.0, toIdx: 7, tone: 'sweep', style: 'dashed', label: 'BSL 2.654,0 (SWEPT)', labelSide: 'left' },
            { price: 2648.4, fromIdx: 3, tone: 'bear', style: 'dashed', label: 'MSS JEBOL 2.648,4', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'high', tone: 'sweep' }
          ],
          seriesCallouts: [
            { idx: 11.2, price: 2655.6, text: 'Sweep BSL (Syarat Wajib Breaker)', tone: 'sweep' }
          ]
        },
        {
          label: '2. Irisan ICT Unicorn',
          caption: 'Dorongan turun meninggalkan SIBI / FVG ($2,647.8–$2,651.4) yang bertumpuk langsung dengan Bearish Breaker Block ($2,649.4–$2,653.0). Retest di irisan keduanya = Zona ICT Unicorn berprobabilitas tertinggi.',
          seriesSlots: 17,
          series: [
            { o: 2649.6, h: 2652.0, l: 2649.2, c: 2651.6 },
            { o: 2651.6, h: 2654.0, l: 2651.2, c: 2653.4 },
            { o: 2653.4, h: 2653.8, l: 2650.2, c: 2650.6 },
            { o: 2650.6, h: 2651.0, l: 2648.4, c: 2648.9 },
            { o: 2648.9, h: 2651.4, l: 2648.6, c: 2651.0 },
            { o: 2651.0, h: 2653.4, l: 2650.8, c: 2653.0 },
            { o: 2653.0, h: 2656.4, l: 2652.2, c: 2652.6 },
            { o: 2652.6, h: 2652.9, l: 2651.4, c: 2651.8 },
            { o: 2651.8, h: 2652.0, l: 2645.6, c: 2646.0 },
            { o: 2646.0, h: 2647.8, l: 2644.0, c: 2644.4 },
            { o: 2644.4, h: 2645.4, l: 2643.2, c: 2644.8 },
            { o: 2644.8, h: 2648.4, l: 2644.6, c: 2648.0 },
            { o: 2648.0, h: 2650.8, l: 2647.6, c: 2648.4 },
            { o: 2648.4, h: 2648.8, l: 2643.8, c: 2644.2 },
            { o: 2644.2, h: 2644.6, l: 2639.6, c: 2640.2 }
          ],
          seriesZones: [
            { fromIdx: 4, toIdx: 16.4, low: 2649.4, high: 2653.0, tone: 'ob', label: 'BREAKER', labelPos: 'tr' }
          ],
          autoFvgs: [
            {
              c1Idx: 7,
              c3Idx: 9,
              type: 'bear',
              extendToIdx: 16.4,
              showCE: false,
              showWickMarkers: false,
              label: 'UNICORN (BB + FVG)',
              labelSide: 'right'
            }
          ],
          seriesLevels: [
            { price: 2656.8, fromIdx: 6, tone: 'sl', style: 'solid', label: 'SL DI ATAS SWEEP 2.656,8', labelSide: 'right' }
          ],
          seriesWickRings: [
            { idx: 12, which: 'high', tone: 'gold' }
          ],
          seriesArrows: [
            { fromIdx: 12.6, fromPrice: 2648.8, toIdx: 14.4, toPrice: 2641.0, tone: 'bear', label: 'Unicorn → TP', labelDx: 34, labelDy: 8 }
          ],
          seriesCallouts: [
            { idx: 4.8, price: 2641.6, text: 'Retest irisan Breaker + FVG = A+', tone: 'gold' }
          ]
        },
        {
          label: '3. Beda Mitigation Block',
          caption: 'Pada Mitigation Block, puncak kedua GAGAL menyapu High lama ($2,655.6 → Lower High $2,652.8) sebelum jebol turun. Tetap valid sebagai resistance jika diikuti FVG searah tren H1.',
          series: [
            { o: 2650.4, h: 2653.2, l: 2650.0, c: 2652.8 },
            { o: 2652.8, h: 2655.6, l: 2652.4, c: 2654.8 },
            { o: 2654.8, h: 2655.0, l: 2651.2, c: 2651.6 },
            { o: 2651.6, h: 2652.0, l: 2648.2, c: 2648.8 },
            { o: 2648.8, h: 2651.4, l: 2648.5, c: 2651.0 },
            { o: 2651.0, h: 2652.8, l: 2650.4, c: 2651.6 },
            { o: 2651.6, h: 2652.0, l: 2650.4, c: 2650.8 },
            { o: 2650.8, h: 2651.1, l: 2645.2, c: 2645.6 },
            { o: 2645.6, h: 2647.4, l: 2643.8, c: 2644.2 },
            { o: 2644.2, h: 2645.6, l: 2643.4, c: 2645.2 },
            { o: 2645.2, h: 2648.4, l: 2644.9, c: 2648.0 },
            { o: 2648.0, h: 2650.2, l: 2647.4, c: 2647.8 },
            { o: 2647.8, h: 2648.2, l: 2644.6, c: 2645.0 },
            { o: 2645.0, h: 2645.4, l: 2642.2, c: 2642.6 },
            { o: 2642.6, h: 2643.0, l: 2640.4, c: 2640.8 }
          ],
          seriesZones: [
            { fromIdx: 4, toIdx: 14, low: 2649.4, high: 2652.6, tone: 'cyan', label: 'MITIGATION BLOCK (TANPA SWEEP)', labelPos: 'tr' }
          ],
          autoFvgs: [
            {
              c1Idx: 6,
              c3Idx: 8,
              type: 'bear',
              extendToIdx: 13,
              showCE: false,
              showWickMarkers: false,
              label: 'SIBI (FVG)'
            }
          ],
          seriesLevels: [
            { price: 2655.6, fromIdx: 1, tone: 'muted', style: 'dotted', label: 'HIGH LAMA 2.655,6 (TIDAK DI-SWEEP)', labelSide: 'right' }
          ],
          seriesWickRings: [
            { idx: 5, which: 'high', tone: 'cyan' },
            { idx: 11, which: 'high', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 4.8, price: 2642.2, text: 'Lower High → Gagal Sweep High Lama', tone: 'cyan' }
          ]
        }
      ]
    },

    'bpr-nwog-ndog': {
      title: 'Balanced Price Range (BPR), Volume Imbalance & NWOG/NDOG',
      pairTag: 'XAU/USD · M15 · BPR / VI / NWOG',
      priceLabels: ['2.668', '2.658', '2.648'],
      stages: [
        {
          label: '1. Irisan Bearish BPR',
          caption: 'Harga naik cepat meninggalkan BISI ($2,656.6–$2,661.4) lalu langsung dibanting meninggalkan SIBI ($2,658.2–$2,663.0). Irisan tepat keduanya ($2,658.2–$2,661.4) adalah dinding kaca BPR.',
          series: [
            { o: 2654.0, h: 2655.4, l: 2653.6, c: 2655.0 },
            { o: 2655.0, h: 2656.6, l: 2654.6, c: 2656.2 },
            { o: 2656.2, h: 2663.6, l: 2656.0, c: 2663.0 },
            { o: 2663.0, h: 2666.8, l: 2661.4, c: 2666.2 },
            { o: 2666.2, h: 2667.8, l: 2665.2, c: 2665.6 },
            { o: 2665.6, h: 2666.0, l: 2663.0, c: 2663.4 },
            { o: 2663.4, h: 2663.8, l: 2655.4, c: 2656.0 },
            { o: 2656.0, h: 2658.2, l: 2653.4, c: 2654.0 },
            { o: 2654.0, h: 2655.4, l: 2652.8, c: 2654.8 },
            { o: 2654.8, h: 2657.6, l: 2654.4, c: 2657.2 },
            { o: 2657.2, h: 2660.2, l: 2656.8, c: 2657.6 },
            { o: 2657.6, h: 2658.0, l: 2653.8, c: 2654.2 },
            { o: 2654.2, h: 2654.8, l: 2650.8, c: 2651.4 },
            { o: 2651.4, h: 2652.0, l: 2648.8, c: 2649.4 },
            { o: 2649.4, h: 2650.0, l: 2647.0, c: 2647.6 }
          ],
          autoFvgs: [
            {
              c1Idx: 1,
              c3Idx: 3,
              type: 'bull',
              extendToIdx: 5.2,
              showCE: false,
              showWickMarkers: false,
              label: 'BISI',
              labelSide: 'right'
            },
            {
              c1Idx: 5,
              c3Idx: 7,
              type: 'bear',
              extendToIdx: 14,
              showCE: false,
              showWickMarkers: false,
              label: 'SIBI (Turun)',
              labelSide: 'right'
            }
          ],
          seriesZones: [
            { fromIdx: 6, toIdx: 14, low: 2658.2, high: 2661.4, tone: 'gold', label: 'BPR OVERLAP', labelPos: 'br', labelFront: true }
          ],
          seriesWickRings: [
            { idx: 10, which: 'high', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 10.2, price: 2665.6, text: 'Retest BPR → Pantulan Keras', tone: 'gold' }
          ]
        },
        {
          label: '2. NWOG & Volume Imbalance',
          caption: 'Tandai NWOG (Close Jumat $2,653.6 → Open Senin $2,656.8) dan 50% CE-nya ($2,655.2), serta Volume Imbalance (celah antar-body $2,662.2–$2,663.6). NWOG bekerja sebagai magnet DOL mingguan.',
          intentionalGapIndices: [3, 7],
          series: [
            { o: 2651.4, h: 2653.2, l: 2650.8, c: 2652.6 },
            { o: 2652.6, h: 2654.4, l: 2652.0, c: 2653.8 },
            { o: 2653.8, h: 2654.6, l: 2652.8, c: 2653.6 },
            { o: 2656.8, h: 2659.2, l: 2656.2, c: 2658.6 },
            { o: 2658.6, h: 2662.2, l: 2658.2, c: 2661.6 },
            { o: 2661.6, h: 2666.0, l: 2661.0, c: 2665.2 },
            { o: 2665.2, h: 2666.4, l: 2662.4, c: 2663.6 },
            { o: 2662.2, h: 2663.0, l: 2658.8, c: 2659.4 },
            { o: 2659.4, h: 2661.4, l: 2658.8, c: 2660.8 },
            { o: 2660.8, h: 2662.8, l: 2660.2, c: 2660.6 },
            { o: 2660.6, h: 2661.0, l: 2657.6, c: 2658.0 },
            { o: 2658.0, h: 2658.4, l: 2655.2, c: 2655.8 },
            { o: 2655.8, h: 2656.2, l: 2653.6, c: 2654.2 },
            { o: 2654.2, h: 2655.6, l: 2653.2, c: 2655.2 },
            { o: 2655.2, h: 2658.8, l: 2654.8, c: 2658.2 }
          ],
          seriesZones: [
            { fromIdx: 2, toIdx: 14, low: 2653.6, high: 2656.8, tone: 'fvg', label: '', labelPos: 'tl' },
            { fromIdx: 6, toIdx: 14, low: 2662.2, high: 2663.6, tone: 'gold', label: 'VI (Celah Body)', labelPos: 'tr', labelFront: true }
          ],
          seriesLevels: [
            { price: 2656.8, fromIdx: 3.8, toIdx: 10.5, tone: 'cyan', style: 'dotted', label: 'NWOG (Jumat–Senin)', labelSide: 'left' },
            { price: 2655.2, fromIdx: 2, toIdx: 11.2, tone: 'gold', style: 'dashed', label: '50% CE NWOG 2.655,2', labelSide: 'left', labelPos: 'below' }
          ],
          seriesVLines: [
            { idx: 2.5, tone: 'cyan', style: 'dotted', label: 'OPEN SENIN', labelPos: 'top' }
          ],
          seriesWickRings: [
            { idx: 9, which: 'high', tone: 'gold' },
            { idx: 13, which: 'low', tone: 'bull' }
          ],
          seriesArrows: [
            { fromIdx: 9.6, fromPrice: 2661.6, toIdx: 12.6, toPrice: 2656.4, tone: 'cyan', label: 'Magnet NWOG', labelDx: 32, labelDy: -6 }
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
          caption: 'Pada timestamp Killzone identik di PDL: XAU/USD sweep SSL mencetak Lower Low ($2,641.2), sementara XAG/USD (Silver) gagal turun lebih rendah (Higher Low $31.12) → sidik jari akumulasi beli!',
          dualAssetPanels: {
            banner: { text: 'Timestamp Identik di Killzone → Bullish SMT Valid!', tone: 'bull' },
            panels: [
              {
                heading: 'XAU/USD (GOLD)',
                tone: 'gold',
                decimals: 1,
                series: [
                  { o: 2648.6, h: 2649.2, l: 2646.4, c: 2647.0 },
                  { o: 2647.0, h: 2647.4, l: 2644.8, c: 2645.2 },
                  { o: 2645.2, h: 2646.4, l: 2644.0, c: 2646.0 },
                  { o: 2646.0, h: 2648.6, l: 2645.6, c: 2648.2 },
                  { o: 2648.2, h: 2648.8, l: 2646.0, c: 2646.4 },
                  { o: 2646.4, h: 2646.8, l: 2643.8, c: 2644.2 },
                  { o: 2644.2, h: 2645.4, l: 2641.2, c: 2645.0 },
                  { o: 2645.0, h: 2648.8, l: 2644.8, c: 2648.4 },
                  { o: 2648.4, h: 2651.2, l: 2648.0, c: 2650.6 },
                  { o: 2650.6, h: 2653.4, l: 2650.2, c: 2652.8 }
                ],
                level: { price: 2644.0, tone: 'sweep', label: 'PDL 2.644,0' },
                trendline: { fromIdx: 2, fromWhich: 'low', toIdx: 6, toWhich: 'low', tone: 'sweep', label: 'LL (Sweep SSL)' }
              },
              {
                heading: 'XAG/USD (SILVER)',
                tone: 'cyan',
                decimals: 2,
                series: [
                  { o: 31.42, h: 31.48, l: 31.18, c: 31.22 },
                  { o: 31.22, h: 31.26, l: 30.94, c: 30.98 },
                  { o: 30.98, h: 31.14, l: 30.80, c: 31.10 },
                  { o: 31.10, h: 31.44, l: 31.06, c: 31.38 },
                  { o: 31.38, h: 31.42, l: 31.20, c: 31.24 },
                  { o: 31.24, h: 31.28, l: 31.14, c: 31.18 },
                  { o: 31.18, h: 31.34, l: 31.12, c: 31.30 },
                  { o: 31.30, h: 31.66, l: 31.26, c: 31.60 },
                  { o: 31.60, h: 31.92, l: 31.56, c: 31.86 },
                  { o: 31.86, h: 32.14, l: 31.82, c: 32.08 }
                ],
                level: { price: 30.80, tone: 'muted', label: 'PDL 30.80' },
                trendline: { fromIdx: 2, fromWhich: 'low', toIdx: 6, toWhich: 'low', tone: 'bull', label: 'HL (Menolak Turun)' }
              }
            ]
          }
        },
        {
          label: '2. Bearish SMT (Gold vs DXY)',
          caption: 'Korelasi terbalik: saat Gold cetak Higher High sweep PDH ($2,661.4), seharusnya DXY cetak Lower Low. Ketika DXY justru cetak Higher Low (104.34), Dolar menguat & Gold siap banting turun!',
          dualAssetPanels: {
            banner: { text: 'DXY Gagal Cetak LL = Bearish SMT untuk Gold!', tone: 'bear' },
            panels: [
              {
                heading: 'XAU/USD (GOLD)',
                tone: 'gold',
                decimals: 1,
                series: [
                  { o: 2652.0, h: 2654.8, l: 2651.6, c: 2654.4 },
                  { o: 2654.4, h: 2657.2, l: 2654.0, c: 2656.8 },
                  { o: 2656.8, h: 2658.0, l: 2655.4, c: 2656.0 },
                  { o: 2656.0, h: 2656.4, l: 2653.8, c: 2654.2 },
                  { o: 2654.2, h: 2656.6, l: 2654.0, c: 2656.2 },
                  { o: 2656.2, h: 2658.8, l: 2655.8, c: 2658.4 },
                  { o: 2658.4, h: 2661.4, l: 2657.2, c: 2657.6 },
                  { o: 2657.6, h: 2658.0, l: 2653.4, c: 2654.0 },
                  { o: 2654.0, h: 2654.6, l: 2650.8, c: 2651.4 },
                  { o: 2651.4, h: 2652.0, l: 2648.6, c: 2649.2 }
                ],
                level: { price: 2658.0, tone: 'sweep', label: 'PDH 2.658,0' },
                trendline: { fromIdx: 2, fromWhich: 'high', toIdx: 6, toWhich: 'high', tone: 'sweep', label: 'HH (Sweep BSL)' }
              },
              {
                heading: 'DXY (INDEKS DOLAR)',
                tone: 'bear',
                decimals: 2,
                series: [
                  { o: 104.64, h: 104.68, l: 104.42, c: 104.46 },
                  { o: 104.46, h: 104.50, l: 104.22, c: 104.26 },
                  { o: 104.26, h: 104.38, l: 104.10, c: 104.34 },
                  { o: 104.34, h: 104.62, l: 104.30, c: 104.56 },
                  { o: 104.56, h: 104.60, l: 104.40, c: 104.44 },
                  { o: 104.44, h: 104.48, l: 104.36, c: 104.40 },
                  { o: 104.40, h: 104.56, l: 104.34, c: 104.52 },
                  { o: 104.52, h: 104.84, l: 104.48, c: 104.80 },
                  { o: 104.80, h: 105.08, l: 104.76, c: 105.02 },
                  { o: 105.02, h: 105.26, l: 104.98, c: 105.20 }
                ],
                level: { price: 104.10, tone: 'muted', label: 'Low 104.10' },
                trendline: { fromIdx: 2, fromWhich: 'low', toIdx: 6, toWhich: 'low', tone: 'bull', label: 'HL (Gagal LL)' }
              }
            ]
          }
        }
      ]
    },

    'mmxm-market-maker-model': {
      title: 'Market Maker Buy Model (MMBM) — Siklus Kurva Lengkap',
      pairTag: 'XAU/USD · M15 · MMXM CURVE',
      priceLabels: ['Terminus', 'Mid', 'HTF POI'],
      stages: [
        {
          label: '1. Sisi Kiri (Engineering)',
          caption: 'Dari Original Consolidation (OC $2,658–$2,661), harga turun bertahap menanam tangga Swing High (BSL #1 & #2) menuju HTF PD Array di dasar kurva ($2,641–$2,644).',
          seriesSlots: 17,
          series: [
            { o: 2658.8, h: 2660.8, l: 2658.2, c: 2660.2 },
            { o: 2660.2, h: 2660.6, l: 2658.0, c: 2658.6 },
            { o: 2658.6, h: 2660.4, l: 2658.2, c: 2659.6 },
            { o: 2659.6, h: 2659.8, l: 2653.4, c: 2654.0 },
            { o: 2654.0, h: 2656.0, l: 2653.6, c: 2655.4 },
            { o: 2655.4, h: 2655.6, l: 2648.6, c: 2649.2 },
            { o: 2649.2, h: 2651.2, l: 2648.8, c: 2650.6 },
            { o: 2650.6, h: 2650.8, l: 2645.2, c: 2645.8 },
            { o: 2645.8, h: 2646.4, l: 2643.8, c: 2644.2 },
            { o: 2644.2, h: 2644.6, l: 2641.2, c: 2643.8 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 2.4, low: 2658.0, high: 2661.2, tone: 'asia', label: '' },
            { fromIdx: 7, toIdx: 15.8, low: 2641.0, high: 2644.4, tone: 'bull', label: 'HTF PD ARRAY (PDL/H1 OB)', labelPos: 'br', labelFront: true }
          ],
          seriesLevels: [
            { price: 2661.2, fromIdx: 0, toIdx: 8.5, tone: 'cyan', style: 'dotted', label: 'ORIGINAL CONSOLIDATION', labelSide: 'right' }
          ],
          seriesWickRings: [
            { idx: 4, which: 'high', tone: 'muted' },
            { idx: 6, which: 'high', tone: 'muted' },
            { idx: 9, which: 'low', tone: 'sweep' }
          ],
          seriesCallouts: [
            { idx: 8.6, price: 2656.4, text: 'Tangga BSL #1', tone: 'muted' },
            { idx: 10.6, price: 2651.2, text: 'Tangga BSL #2', tone: 'muted' }
          ]
        },
        {
          label: '2. SMR → Re-Accumulation → LRLR',
          caption: 'Di HTF PD Array terjadi Smart Money Reversal (SMR) dengan FVG bersih. Harga pindah ke Buy-Side of the Curve, jeda 1× Re-Accumulation, lalu melesat (LRLR) menyapu Terminus (OC)!',
          seriesSlots: 17,
          series: [
            { o: 2658.8, h: 2660.8, l: 2658.2, c: 2660.2 },
            { o: 2660.2, h: 2660.6, l: 2658.0, c: 2658.6 },
            { o: 2658.6, h: 2660.4, l: 2658.2, c: 2659.6 },
            { o: 2659.6, h: 2659.8, l: 2653.4, c: 2654.0 },
            { o: 2654.0, h: 2656.0, l: 2653.6, c: 2655.4 },
            { o: 2655.4, h: 2655.6, l: 2648.6, c: 2649.2 },
            { o: 2649.2, h: 2651.2, l: 2648.8, c: 2650.6 },
            { o: 2650.6, h: 2650.8, l: 2645.2, c: 2645.8 },
            { o: 2645.8, h: 2646.4, l: 2643.8, c: 2644.2 },
            { o: 2644.2, h: 2644.6, l: 2641.2, c: 2643.8 },
            { o: 2643.8, h: 2648.6, l: 2643.4, c: 2648.0 },
            { o: 2648.0, h: 2651.2, l: 2647.2, c: 2650.4 },
            { o: 2650.4, h: 2651.4, l: 2649.2, c: 2649.8 },
            { o: 2649.8, h: 2651.8, l: 2649.4, c: 2651.4 },
            { o: 2651.4, h: 2655.6, l: 2651.0, c: 2655.0 },
            { o: 2655.0, h: 2658.8, l: 2654.6, c: 2658.2 },
            { o: 2658.2, h: 2661.6, l: 2657.8, c: 2661.0 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 16, low: 2658.4, high: 2661.8, tone: 'tp', label: '' },
            { fromIdx: 8, toIdx: 11, low: 2641.0, high: 2644.4, tone: 'bull', label: 'SMR', labelPos: 'bl', labelFront: true },
            { fromIdx: 11.4, toIdx: 13.6, low: 2649.0, high: 2652.0, tone: 'gold', label: '' }
          ],
          seriesLevels: [
            { price: 2661.8, fromIdx: 3, toIdx: 14, tone: 'tp', style: 'dashed', label: 'TERMINUS (TARGET OC)', labelSide: 'left' }
          ],
          autoFvgs: [
            {
              c1Idx: 9,
              c3Idx: 11,
              type: 'bull',
              extendToIdx: 16,
              showCE: false,
              showWickMarkers: false,
              label: 'SMR FVG',
              labelSide: 'right'
            }
          ],
          seriesWickRings: [
            { idx: 9, which: 'low', tone: 'sweep' }
          ],
          seriesArrows: [
            { fromIdx: 13.6, fromPrice: 2652.4, toIdx: 16.0, toPrice: 2660.2, tone: 'bull', label: 'Buy-Side LRLR', labelDx: -50, labelDy: -6 }
          ],
          seriesCallouts: [
            { idx: 15.2, price: 2650.4, text: 'RE-ACC', tone: 'gold' }
          ]
        }
      ]
    },

    'ict-macros-weekly-ipda': {
      title: 'Weekly Profile (Senin–Jumat), IPDA 20/40/60 & Sinergi Macro',
      pairTag: 'XAU/USD · WITA (UTC+8) · TIME ENGINE',
      priceLabels: ['Ekspansi', 'Mid', 'Akumulasi'],
      stages: [
        {
          label: '1. Weekly Profile (Senin–Jumat)',
          caption: 'Classic Bullish Expansion (H4): Senin akumulasi, Selasa London membentuk Low of the Week ($2,641.4), Rabu–Kamis ekspansi penuh menuju puncak ($2,665.2), Jumat pullback TGIF 20–30%.',
          series: [
            { o: 2649.0, h: 2650.8, l: 2648.2, c: 2650.2 },
            { o: 2650.2, h: 2650.6, l: 2647.8, c: 2648.4 },
            { o: 2648.4, h: 2650.4, l: 2648.0, c: 2649.6 },
            { o: 2649.6, h: 2650.0, l: 2645.2, c: 2645.8 },
            { o: 2645.8, h: 2648.2, l: 2641.4, c: 2647.6 },
            { o: 2647.6, h: 2651.4, l: 2647.2, c: 2650.8 },
            { o: 2650.8, h: 2654.8, l: 2650.4, c: 2654.2 },
            { o: 2654.2, h: 2654.6, l: 2652.4, c: 2653.0 },
            { o: 2653.0, h: 2658.4, l: 2652.6, c: 2657.8 },
            { o: 2657.8, h: 2661.4, l: 2657.2, c: 2660.8 },
            { o: 2660.8, h: 2663.6, l: 2660.2, c: 2663.0 },
            { o: 2663.0, h: 2665.4, l: 2662.4, c: 2664.6 },
            { o: 2664.6, h: 2665.0, l: 2661.2, c: 2661.8 },
            { o: 2661.8, h: 2662.4, l: 2659.4, c: 2660.0 },
            { o: 2660.0, h: 2661.6, l: 2659.0, c: 2661.0 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 2, low: 2647.4, high: 2653.8, tone: 'asia', label: 'SENIN', labelPos: 'tl', labelFront: true },
            { fromIdx: 12, toIdx: 14, low: 2656.2, high: 2665.6, tone: 'gold', label: 'TGIF -25%', labelPos: 'br', labelFront: true }
          ],
          seriesVLines: [
            { idx: 2.5, tone: 'muted', style: 'dotted', label: 'SELASA', labelPos: 'top' },
            { idx: 5.5, tone: 'muted', style: 'dotted', label: 'RABU', labelPos: 'top' },
            { idx: 8.5, tone: 'muted', style: 'dotted', label: 'KAMIS', labelPos: 'top' },
            { idx: 11.5, tone: 'gold', style: 'dotted', label: 'JUMAT', labelPos: 'top' }
          ],
          seriesWickRings: [
            { idx: 4, which: 'low', tone: 'sweep' },
            { idx: 11, which: 'high', tone: 'bull' }
          ],
          seriesCallouts: [
            { idx: 7.4, price: 2642.2, text: 'Selasa: Low of Week · Panen Rabu–Kamis', tone: 'gold' }
          ]
        },
        {
          label: '2. Jendela ICT Macro WITA',
          caption: 'Di dalam Killzone NY AM, mesin algoritma aktif tajam pada jendela 20 menit (:50–:10): Macro 1 (20:50–21:10 WITA) menyapu SSL + cetak FVG, Macro 2 (21:50–22:10 WITA) ekspansi penuh ke DOL.',
          series: [
            { o: 2649.8, h: 2650.8, l: 2648.6, c: 2649.2 },
            { o: 2649.2, h: 2650.4, l: 2648.4, c: 2649.8 },
            { o: 2649.8, h: 2650.2, l: 2648.0, c: 2648.4 },
            { o: 2648.4, h: 2648.8, l: 2646.0, c: 2646.4 },
            { o: 2646.4, h: 2647.4, l: 2642.8, c: 2646.8 },
            { o: 2646.8, h: 2652.8, l: 2646.4, c: 2652.2 },
            { o: 2652.2, h: 2654.2, l: 2650.0, c: 2653.4 },
            { o: 2653.4, h: 2653.8, l: 2651.2, c: 2651.8 },
            { o: 2651.8, h: 2652.4, l: 2649.2, c: 2650.0 },
            { o: 2650.0, h: 2651.4, l: 2648.6, c: 2650.8 },
            { o: 2650.8, h: 2655.4, l: 2650.4, c: 2654.8 },
            { o: 2654.8, h: 2658.6, l: 2654.2, c: 2658.0 },
            { o: 2658.0, h: 2661.2, l: 2657.6, c: 2660.6 },
            { o: 2660.6, h: 2662.0, l: 2659.8, c: 2661.4 },
            { o: 2661.4, h: 2662.2, l: 2660.2, c: 2660.8 },
            { o: 2660.8, h: 2662.8, l: 2660.4, c: 2662.2 }
          ],
          seriesZones: [
            { fromIdx: 3, toIdx: 6, low: 2642.2, high: 2663.2, tone: 'killzone', label: '20:50–21:10', labelPos: 'tl', labelFront: true },
            { fromIdx: 10, toIdx: 13, low: 2642.2, high: 2663.2, tone: 'gold', label: '21:50–22:10', labelPos: 'tl', labelFront: true }
          ],
          autoFvgs: [
            {
              c1Idx: 4,
              c3Idx: 6,
              type: 'bull',
              extendToIdx: 15,
              showCE: false,
              showWickMarkers: false,
              label: 'FVG MACRO',
              labelSide: 'right'
            }
          ],
          seriesWickRings: [
            { idx: 4, which: 'low', tone: 'sweep' },
            { idx: 9, which: 'low', tone: 'gold' }
          ],
          seriesCallouts: [
            { idx: 4.5, price: 2641.8, text: 'Macro 1: Sweep', tone: 'sweep' },
            { idx: 11.8, price: 2644.6, text: 'Macro 2: Ekspansi DOL', tone: 'bull' }
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
          caption: 'Saat Gold di All-Time High tanpa swing kiri, tarik Fib Manipulation Leg ($2,648.0 → $2,642.0, rentang $6): -1.0 SD ($2,654.0) = Partial/BEP, -2.0 s.d. -2.5 SD ($2,660–$2,663) = Sweet Spot TP!',
          seriesSlots: 19,
          series: [
            { o: 2646.2, h: 2648.0, l: 2645.8, c: 2647.6 },
            { o: 2647.6, h: 2647.8, l: 2644.6, c: 2645.2 },
            { o: 2645.2, h: 2645.6, l: 2642.0, c: 2643.8 },
            { o: 2643.8, h: 2649.4, l: 2643.4, c: 2648.8 },
            { o: 2648.8, h: 2651.2, l: 2647.2, c: 2650.6 },
            { o: 2650.6, h: 2651.0, l: 2648.2, c: 2648.8 },
            { o: 2648.8, h: 2652.8, l: 2648.4, c: 2652.2 },
            { o: 2652.2, h: 2654.4, l: 2651.8, c: 2654.0 },
            { o: 2654.0, h: 2654.4, l: 2652.2, c: 2652.8 },
            { o: 2652.8, h: 2656.6, l: 2652.4, c: 2656.0 },
            { o: 2656.0, h: 2659.2, l: 2655.6, c: 2658.6 },
            { o: 2658.6, h: 2660.6, l: 2658.2, c: 2660.2 },
            { o: 2660.2, h: 2662.8, l: 2659.8, c: 2662.2 },
            { o: 2662.2, h: 2663.2, l: 2660.4, c: 2660.8 },
            { o: 2660.8, h: 2661.4, l: 2658.6, c: 2659.2 },
            { o: 2659.2, h: 2659.8, l: 2657.8, c: 2658.4 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 2.6, low: 2642.0, high: 2648.0, tone: 'sweep', label: 'MANIP. LEG', labelPos: 'bl', labelFront: true },
            { fromIdx: 6, toIdx: 18.4, low: 2660.0, high: 2663.0, tone: 'tp', label: 'SWEET SPOT TP (-2.0 / -2.5 SD)', labelPos: 'tl', labelFront: true }
          ],
          seriesLevels: [
            { price: 2660.0, fromIdx: 4, tone: 'bull', style: 'dashed', label: '-2.0 SD · 2.660', labelSide: 'right', labelPos: 'below' },
            { price: 2654.0, fromIdx: 3, tone: 'cyan', style: 'dashed', label: '-1.0 SD (BEP) · 2.654', labelSide: 'right', labelPos: 'below' },
            { price: 2648.0, tone: 'muted', style: 'solid', label: '0.0 (Origin) · 2.648', labelSide: 'right', labelPos: 'below' },
            { price: 2642.0, tone: 'sl', style: 'solid', label: '1.0 (Low) · 2.642', labelSide: 'right', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 2, which: 'low', tone: 'sweep' },
            { idx: 13, which: 'high', tone: 'bull' }
          ]
        },
        {
          label: '2. Profil Candle OLHC & CRT',
          caption: 'CRT 3-Candle (H4/Daily): C1 menetapkan Range ($2,646–$2,656) → C2 Purge Low C1 ke $2,641.6 lalu body tutup kembali DI DALAM range ($2,649.4) → C3 ekspansi OLHC menembus High C1!',
          series: [
            { o: 2653.4, h: 2654.2, l: 2651.2, c: 2651.8 },
            { o: 2651.8, h: 2652.4, l: 2648.6, c: 2649.2 },
            { o: 2649.2, h: 2651.6, l: 2648.2, c: 2650.8 },
            { o: 2650.8, h: 2651.2, l: 2647.8, c: 2648.4 },
            { o: 2648.4, h: 2649.2, l: 2646.6, c: 2647.8 },
            { o: 2647.8, h: 2656.0, l: 2646.0, c: 2654.2 },
            { o: 2654.2, h: 2654.8, l: 2641.6, c: 2649.4 },
            { o: 2649.4, h: 2658.4, l: 2648.4, c: 2657.6 },
            { o: 2657.6, h: 2660.2, l: 2656.8, c: 2659.4 }
          ],
          seriesZones: [
            { fromIdx: 5, toIdx: 8.3, low: 2646.0, high: 2656.0, tone: 'asia', label: 'RANGE C1 (CRT)', labelPos: 'br', labelFront: true }
          ],
          seriesLevels: [
            { price: 2656.0, fromIdx: 0, tone: 'tp', style: 'dashed', label: 'Target CRT (High C1 · 2.656)', labelSide: 'left' },
            { price: 2646.0, fromIdx: 0, tone: 'sweep', style: 'dashed', label: 'Low C1 · 2.646 (Di-sweep C2)', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 6, which: 'low', tone: 'sweep' },
            { idx: 7, which: 'high', tone: 'bull' }
          ],
          seriesCallouts: [
            { idx: 5.0, price: 2659.6, text: 'C1: Range', tone: 'cyan' },
            { idx: 6.2, price: 2639.8, text: 'C2: Purge & Tutup Dalam', tone: 'sweep' },
            { idx: 7.5, price: 2661.4, text: 'C3: OLHC', tone: 'bull' }
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
          caption: 'Selalu urut dari atas ke bawah: Berita/Weekly → Daily (Origin & DOL) → H1 (Dealing Range & POI) → M15 (Asia & STH/STL) → M5 (Sweep+CISD di Killzone) → Risiko 0.5–1%.',
          bars: [
            { x1: 2, x2: 16.5, y1: 60, y2: 90, tone: 'danger', label: '1. News', sub: 'Weekly' },
            { x1: 18.2, x2: 32.7, y1: 52, y2: 84, tone: 'gold', label: '2. Daily', sub: 'Origin→DOL' },
            { x1: 34.4, x2: 48.9, y1: 44, y2: 78, tone: 'cyan', label: '3. H1', sub: 'Range+POI' },
            { x1: 50.6, x2: 65.1, y1: 34, y2: 70, tone: 'sweep', label: '4. M15', sub: 'Asia+SSL' },
            { x1: 66.8, x2: 81.3, y1: 24, y2: 62, tone: 'bull', label: '5. M5', sub: 'Trigger' },
            { x1: 83.0, x2: 97.5, y1: 14, y2: 54, tone: 'gold', label: '6. Lot', sub: '≤1% Risk' }
          ],
          callouts: [
            { x: 50, y: 7, text: 'Chart Bersih = 1 Bias · 1 DOL · 1–2 POI · 1 Invalidasi', tone: 'gold' }
          ]
        },
        {
          label: '2. Peta Akhir Siap Eksekusi',
          caption: 'Hasil akhir chart polos setelah 10 menit mapping: hanya 5 elemen bersih (DOL PDH $2,662, 50% EQ H1, Asia Low SSL $2,647, 1 POI Discount + FVG M5, dan 1 garis Invalidasi $2,641).',
          series: [
            { o: 2650.2, h: 2651.4, l: 2648.6, c: 2649.2 },
            { o: 2649.2, h: 2651.2, l: 2647.8, c: 2650.6 },
            { o: 2650.6, h: 2651.0, l: 2647.2, c: 2647.8 },
            { o: 2647.8, h: 2649.6, l: 2647.0, c: 2649.0 },
            { o: 2649.0, h: 2649.4, l: 2645.2, c: 2645.6 },
            { o: 2645.6, h: 2646.0, l: 2643.2, c: 2644.8 },
            { o: 2644.8, h: 2646.2, l: 2644.4, c: 2645.8 },
            { o: 2645.8, h: 2651.6, l: 2645.6, c: 2651.0 },
            { o: 2651.0, h: 2653.2, l: 2648.8, c: 2652.4 },
            { o: 2652.4, h: 2652.8, l: 2649.6, c: 2650.0 },
            { o: 2650.0, h: 2650.4, l: 2647.4, c: 2649.6 },
            { o: 2649.6, h: 2653.8, l: 2649.2, c: 2653.2 },
            { o: 2653.2, h: 2656.6, l: 2652.8, c: 2656.0 },
            { o: 2656.0, h: 2659.2, l: 2655.6, c: 2658.6 },
            { o: 2658.6, h: 2661.4, l: 2658.0, c: 2660.8 },
            { o: 2660.8, h: 2662.6, l: 2660.2, c: 2662.0 }
          ],
          seriesZones: [
            { fromIdx: 0, toIdx: 15, low: 2643.0, high: 2646.0, tone: 'ob', label: '1 POI UTAMA (DISCOUNT + OTE)', labelPos: 'br', labelFront: true }
          ],
          autoFvgs: [
            {
              c1Idx: 6,
              c3Idx: 8,
              type: 'bull',
              extendToIdx: 15,
              showCE: false,
              showWickMarkers: false,
              label: 'FVG M5',
              labelSide: 'right'
            }
          ],
          seriesLevels: [
            { price: 2662.0, tone: 'tp', style: 'solid', label: 'DOL UTAMA: PDH 2.662,0', labelSide: 'left' },
            { price: 2652.0, tone: 'muted', style: 'dotted', label: '50% EQ H1', labelSide: 'left' },
            { price: 2647.0, toIdx: 7, tone: 'sweep', style: 'dashed', label: 'Asia Low (SSL $$$)', labelSide: 'left' },
            { price: 2641.0, tone: 'sl', style: 'solid', label: 'INVALIDASI BIAS 2.641,0', labelSide: 'left', labelPos: 'below' }
          ],
          seriesWickRings: [
            { idx: 5, which: 'low', tone: 'sweep' },
            { idx: 10, which: 'low', tone: 'gold' }
          ],
          seriesArrows: [
            { fromIdx: 10.6, fromPrice: 2650.4, toIdx: 15.0, toPrice: 2661.2, tone: 'bull', label: '1:4 R:R ke DOL', labelDx: -38, labelDy: -10 }
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

  /**
   * Flux-Charts Style Side-by-Side Split Panel Renderer (Valid vs Invalid Anatomy).
   * Candles are rendered edge-to-edge flush (0px horizontal drift) so Close[i-1] === Open[i]
   * aligns pixel-perfectly, with exact wick boundary lines and dashed wick highlight circles.
   */
  function renderSplitPanels(panels) {
    if (!Array.isArray(panels) || panels.length === 0) return '';
    const outerX = 20;
    const outerY = 28;
    const outerW = VIEW_W - 40;
    const outerH = VIEW_H - 40;
    const midX = VIEW_W / 2;
    const panelW = outerW / 2;

    let out = `<rect x="${outerX}" y="${outerY}" width="${outerW}" height="${outerH}" rx="10" fill="var(--acd-chart-bg, #131722)" stroke="var(--acd-grid-border, rgba(148, 163, 184, 0.22))" stroke-width="1"/>`;
    out += `<line x1="${midX}" y1="${outerY + 6}" x2="${midX}" y2="${outerY + outerH - 6}" stroke="var(--acd-grid-border, rgba(148, 163, 184, 0.32))" stroke-width="1.5"/>`;

    panels.slice(0, 2).forEach((p, idx) => {
      const px = outerX + idx * panelW;
      const py = outerY;
      const pTop = py + 44;
      const pBot = py + outerH - 22;
      const pH = pBot - pTop;
      const valToY = (v) => +(pBot - (clamp(v, 0, 100) / 100) * pH).toFixed(1);

      const isValid = p.verdict === 'valid';
      const verdictColor = isValid ? 'var(--acd-bull, #22c55e)' : 'var(--acd-bear, #ef4444)';
      const candles = Array.isArray(p.candles) ? p.candles : [];
      const bodyW = 24;
      const startX = px + 26;

      // Subtle panel heading (top-left)
      if (p.heading) {
        out += `<text x="${px + 18}" y="${py + 24}" fill="var(--acd-ink, #f8fafc)" font-size="13" font-weight="800" letter-spacing="0.04em">${esc(p.heading)}</text>`;
      }

      // Verdict status badge cleanly isolated in right column of each panel
      const badgeCx = px + panelW - 64;
      const badgeCy = py + 114;
      out += `<text x="${badgeCx}" y="${badgeCy - 40}" text-anchor="middle" fill="${verdictColor}" font-size="11.5" font-weight="800" letter-spacing="0.05em">${esc(p.badgeTitle || (isValid ? 'VALID' : 'INVALID'))}</text>`;
      if (p.badgeSub) {
        out += `<text x="${badgeCx}" y="${badgeCy - 25}" text-anchor="middle" fill="var(--acd-muted, #94a3b8)" font-size="9" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(p.badgeSub)}</text>`;
      }
      out += `<circle cx="${badgeCx}" cy="${badgeCy + 6}" r="18" fill="${verdictColor}"/>`;
      if (isValid) {
        out += `<path d="M ${badgeCx - 7} ${badgeCy + 6.5} L ${badgeCx - 2} ${badgeCy + 11.5} L ${badgeCx + 8} ${badgeCy + 0.5}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else {
        out += `<path d="M ${badgeCx - 6.5} ${badgeCy - 0.5} L ${badgeCx + 6.5} ${badgeCy + 12.5} M ${badgeCx + 6.5} ${badgeCy - 0.5} L ${badgeCx - 6.5} ${badgeCy + 12.5}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`;
      }

      // Pre-compute exact FVG / overlap geometry from C1 (idx 0) and C3 (idx 2)
      let zoneMarkup = '';
      let markerMarkup = '';
      if (candles.length >= 3) {
        const c1 = candles[0];
        const c3 = candles[2];
        const xC1 = +(startX + bodyW / 2).toFixed(1);
        const xC3 = +(startX + bodyW * 2 + bodyW / 2).toFixed(1);
        const isBear = p.fvgType === 'bear';
        const c1WickVal = isBear ? c1.l : c1.h;
        const c3WickVal = isBear ? c3.h : c3.l;
        const y1 = valToY(c1WickVal);
        const y3 = valToY(c3WickVal);
        const topY = Math.min(y1, y3);
        const botY = Math.max(y1, y3);
        const hasRealGap = isBear ? (c1.l > c3.h) : (c1.h < c3.l);

        const lineLeft = +(startX - 4).toFixed(1);
        const lineRight = +(startX + bodyW * 3 + 18).toFixed(1);

        if (hasRealGap && isValid) {
          // Stop FVG band cleanly before the right verdict badge column (zero overlap!)
          const zoneX = +(startX + bodyW).toFixed(1);
          const zoneRight = +(px + panelW - 126).toFixed(1);
          const zoneW = Math.max(76, +(zoneRight - zoneX).toFixed(1));
          const fvgTone = isBear ? TONE_MAP.bear : TONE_MAP.bull;
          zoneMarkup += `<rect x="${zoneX}" y="${topY}" width="${zoneW}" height="${Math.max(4, botY - topY).toFixed(1)}" rx="2" fill="${fvgTone.fill}" stroke="${fvgTone.stroke}" stroke-opacity="0.45" stroke-width="1"/>`;
          if (p.showCE) {
            const ceY = +((topY + botY) / 2).toFixed(1);
            zoneMarkup += `<line x1="${zoneX}" y1="${ceY}" x2="${(zoneX + zoneW).toFixed(1)}" y2="${ceY}" stroke="var(--acd-gold, #f5b942)" stroke-width="1.2" stroke-dasharray="4 3"/>`;
            zoneMarkup += `<text x="${(zoneX + zoneW - 4).toFixed(1)}" y="${(ceY - 3.5).toFixed(1)}" text-anchor="end" fill="var(--acd-gold, #f5b942)" font-size="8.6" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">50% CE</text>`;
          }
          if (p.fvgLabel) {
            const shortLbl = isBear ? 'FVG (SIBI)' : 'FVG (BISI)';
            zoneMarkup += `<text x="${(zoneX + zoneW - 4).toFixed(1)}" y="${(botY - 4).toFixed(1)}" text-anchor="end" fill="${fvgTone.text}" font-size="8.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${shortLbl}</text>`;
          }
        } else if (!isValid) {
          // Overlap highlight tint between overlapping wick tips
          const ovX = +(startX + 4).toFixed(1);
          const ovW = +(bodyW * 3 - 4).toFixed(1);
          zoneMarkup += `<rect x="${ovX}" y="${topY}" width="${ovW}" height="${Math.max(4, botY - topY).toFixed(1)}" fill="var(--acd-bear-soft, rgba(239,68,68,0.22))" stroke="var(--acd-bear, #ef4444)" stroke-width="0.9" stroke-dasharray="3 2"/>`;
        }

        // Exact crisp wick boundary lines + dashed circles on C1 & C3 wick endpoints (Flux Charts style)
        const strokeInk = 'var(--acd-ink, #f8fafc)';
        markerMarkup += `<line x1="${xC1}" y1="${y1}" x2="${lineRight}" y2="${y1}" stroke="${strokeInk}" stroke-width="1.5" stroke-opacity="0.92"/>`;
        markerMarkup += `<line x1="${lineLeft}" y1="${y3}" x2="${(xC3 + bodyW / 2 + 16).toFixed(1)}" y2="${y3}" stroke="${strokeInk}" stroke-width="1.5" stroke-opacity="0.92"/>`;
        markerMarkup += `<circle cx="${xC1}" cy="${y1}" r="8.5" fill="none" stroke="${strokeInk}" stroke-width="1.25" stroke-dasharray="3 2.5" opacity="0.9"/>`;
        markerMarkup += `<circle cx="${xC3}" cy="${y3}" r="8.5" fill="none" stroke="${strokeInk}" stroke-width="1.25" stroke-dasharray="3 2.5" opacity="0.9"/>`;

        // Small crisp C1/C2/C3 labels at bottom
        ['C1', 'C2', 'C3'].forEach((lbl, ci) => {
          const cxLbl = +(startX + ci * bodyW + bodyW / 2).toFixed(1);
          markerMarkup += `<text x="${cxLbl}" y="${(py + outerH - 7).toFixed(1)}" text-anchor="middle" fill="var(--acd-muted, #94a3b8)" font-size="9.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${lbl}</text>`;
        });

        if (!isValid && p.overlapLabel) {
          markerMarkup += `<text x="${badgeCx}" y="${(badgeCy + 44).toFixed(1)}" text-anchor="middle" fill="var(--acd-bear, #ef4444)" font-size="9" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(p.overlapLabel)}</text>`;
        } else if (isValid) {
          const hintTxt = isBear ? 'Low C1 > High C3' : 'High C1 < Low C3';
          markerMarkup += `<text x="${badgeCx}" y="${(badgeCy + 44).toFixed(1)}" text-anchor="middle" fill="var(--acd-bull, #22c55e)" font-size="9" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${hintTxt}</text>`;
        }
      }

      // Render flush edge-to-edge candles (bodyW = 24, gap = 0 so Close[i-1] === Open[i] snaps pixel-perfect!)
      let candlesMarkup = '';
      candles.forEach((c, ci) => {
        const bx = +(startX + ci * bodyW).toFixed(1);
        const cx = +(bx + bodyW / 2).toFixed(1);
        const yO = valToY(c.o);
        const yC = valToY(c.c);
        const yH = valToY(c.h);
        const yL = valToY(c.l);
        const isBull = c.c >= c.o;
        const bodyTop = Math.min(yO, yC);
        const bodyH = Math.max(2, Math.abs(yC - yO));
        const col = isBull ? 'var(--acd-bull, #22c55e)' : 'var(--acd-bear, #ef4444)';
        candlesMarkup += `<g class="acd-candle">
          <line x1="${cx}" y1="${yH}" x2="${cx}" y2="${yL}" stroke="${col}" stroke-width="2" stroke-linecap="butt"/>
          <rect x="${bx}" y="${bodyTop.toFixed(1)}" width="${bodyW}" height="${bodyH.toFixed(1)}" rx="0.5" fill="${col}"/>
        </g>`;
      });

      out += `<g class="acd-split-panel">${zoneMarkup}${candlesMarkup}${markerMarkup}</g>`;
    });

    return out;
  }

  /**
   * Flux-Style 2-Candle OHLC Anatomy Renderer (Bullish vs Bearish).
   * Pixel-aligned High/Close/Open/Low leader lines and Body/Wick callouts with zero overlaps.
   */
  function renderOhlcAnatomy(cfg) {
    if (!cfg || !cfg.bull || !cfg.bear) return '';
    const outerX = 20;
    const outerY = 28;
    const outerW = VIEW_W - 40;
    const outerH = VIEW_H - 40;
    const midX = VIEW_W / 2;
    const panelW = outerW / 2;
    const pTop = outerY + 46;
    const pBot = outerY + outerH - 22;
    const pH = pBot - pTop;
    const valToY = (v) => +(pBot - (clamp(v, 0, 100) / 100) * pH).toFixed(1);

    let out = `<rect x="${outerX}" y="${outerY}" width="${outerW}" height="${outerH}" rx="10" fill="var(--acd-chart-bg, #131722)" stroke="var(--acd-grid-border, rgba(148, 163, 184, 0.22))" stroke-width="1"/>`;
    out += `<line x1="${midX}" y1="${outerY + 8}" x2="${midX}" y2="${outerY + outerH - 8}" stroke="var(--acd-grid-border, rgba(148, 163, 184, 0.30))" stroke-width="1.4"/>`;

    const sides = [
      { key: 'bull', data: cfg.bull, isBull: true, px: outerX, cx: outerX + 160, labelSide: 'left' },
      { key: 'bear', data: cfg.bear, isBull: false, px: midX, cx: midX + 140, labelSide: 'right' }
    ];

    const bodyW = 34;
    const half = bodyW / 2;

    for (const s of sides) {
      const c = s.data;
      const col = s.isBull ? 'var(--acd-bull, #22c55e)' : 'var(--acd-bear, #ef4444)';
      const yO = valToY(c.o);
      const yC = valToY(c.c);
      const yH = valToY(c.h);
      const yL = valToY(c.l);
      const top = Math.min(yO, yC);
      const bot = Math.max(yO, yC);
      const bh = Math.max(4, bot - top);
      const midBodyY = +((top + bot) / 2).toFixed(1);
      const upperWickY = +((yH + top) / 2).toFixed(1);
      const lowerWickY = +((bot + yL) / 2).toFixed(1);

      // Panel title & subtitle
      const headX = s.px + panelW / 2;
      out += `<text x="${headX}" y="${outerY + 21}" text-anchor="middle" fill="${col}" font-size="12" font-weight="800" letter-spacing="0.05em">${esc(c.title)}</text>`;
      out += `<text x="${headX}" y="${outerY + 35}" text-anchor="middle" fill="var(--acd-muted, #94a3b8)" font-size="9.2" font-weight="600" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(c.sub)}</text>`;

      // Candle wick & crisp solid body
      out += `<g class="acd-candle">
        <line x1="${s.cx}" y1="${yH}" x2="${s.cx}" y2="${yL}" stroke="${col}" stroke-width="2.4" stroke-linecap="butt"/>
        <rect x="${(s.cx - half).toFixed(1)}" y="${top.toFixed(1)}" width="${bodyW}" height="${bh.toFixed(1)}" rx="1.5" fill="${col}"/>
      </g>`;

      // 4 OHLC leader lines & labels
      const rows = s.isBull
        ? [
            { y: yH, lbl: 'HIGH (Tertinggi)', tone: 'var(--acd-muted, #94a3b8)', dash: '2 3', edge: s.cx },
            { y: yC, lbl: 'CLOSE (Tutup)', tone: col, dash: '4 3', edge: s.cx - half },
            { y: yO, lbl: 'OPEN (Buka)', tone: 'var(--acd-gold, #f5b942)', dash: '4 3', edge: s.cx - half },
            { y: yL, lbl: 'LOW (Terendah)', tone: 'var(--acd-muted, #94a3b8)', dash: '2 3', edge: s.cx }
          ]
        : [
            { y: yH, lbl: 'HIGH (Tertinggi)', tone: 'var(--acd-muted, #94a3b8)', dash: '2 3', edge: s.cx },
            { y: yO, lbl: 'OPEN (Buka)', tone: 'var(--acd-gold, #f5b942)', dash: '4 3', edge: s.cx + half },
            { y: yC, lbl: 'CLOSE (Tutup)', tone: col, dash: '4 3', edge: s.cx + half },
            { y: yL, lbl: 'LOW (Terendah)', tone: 'var(--acd-muted, #94a3b8)', dash: '2 3', edge: s.cx }
          ];

      for (const r of rows) {
        if (s.labelSide === 'left') {
          const lx = s.px + 118;
          out += `<line x1="${lx + 4}" y1="${r.y}" x2="${r.edge - 3}" y2="${r.y}" stroke="${r.tone}" stroke-width="1.2" stroke-dasharray="${r.dash}"/>`;
          out += `<circle cx="${r.edge}" cy="${r.y}" r="2.5" fill="${r.tone}"/>`;
          out += `<text x="${lx}" y="${(r.y + 3.5).toFixed(1)}" text-anchor="end" fill="${r.tone}" font-size="9.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(r.lbl)}</text>`;
        } else {
          const rx = s.px + panelW - 118;
          out += `<line x1="${r.edge + 3}" y1="${r.y}" x2="${rx - 4}" y2="${r.y}" stroke="${r.tone}" stroke-width="1.2" stroke-dasharray="${r.dash}"/>`;
          out += `<circle cx="${r.edge}" cy="${r.y}" r="2.5" fill="${r.tone}"/>`;
          out += `<text x="${rx}" y="${(r.y + 3.5).toFixed(1)}" text-anchor="start" fill="${r.tone}" font-size="9.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(r.lbl)}</text>`;
        }
      }

      // Opposite-side anatomy tags (Upper Wick, Body, Lower Wick)
      const tagAnchor = s.labelSide === 'left' ? 'start' : 'end';
      const tagX = s.labelSide === 'left' ? (s.cx + half + 14) : (s.cx - half - 14);
      const tickX1 = s.labelSide === 'left' ? (s.cx + half + 4) : (s.cx - half - 4);
      const tickX2 = s.labelSide === 'left' ? (tagX - 3) : (tagX + 3);
      out += `<line x1="${tickX1}" y1="${midBodyY}" x2="${tickX2}" y2="${midBodyY}" stroke="${col}" stroke-width="1.2"/>`;
      out += `<text x="${tagX}" y="${(upperWickY + 3).toFixed(1)}" text-anchor="${tagAnchor}" fill="var(--acd-muted, #94a3b8)" font-size="9" font-weight="600">Wick Atas</text>`;
      out += `<text x="${tagX}" y="${(midBodyY - 1).toFixed(1)}" text-anchor="${tagAnchor}" fill="var(--acd-ink, #f8fafc)" font-size="9.5" font-weight="700">BODY</text>`;
      out += `<text x="${tagX}" y="${(midBodyY + 11).toFixed(1)}" text-anchor="${tagAnchor}" fill="${col}" font-size="8.6" font-weight="700">${s.isBull ? '(Buyer Kuat)' : '(Seller Kuat)'}</text>`;
      out += `<text x="${tagX}" y="${(lowerWickY + 3).toFixed(1)}" text-anchor="${tagAnchor}" fill="var(--acd-muted, #94a3b8)" font-size="9" font-weight="600">Wick Bawah</text>`;
    }

    return `<g class="acd-ohlc-anatomy">${out}</g>`;
  }

  /**
   * Multi-Timeframe Candle Decomposition Renderer (1 Candle H1 === 4 Flush Candles M15).
   * Draws exact dashed horizontal OHLC alignment guides proving Open/High/Low/Close parity.
   */
  function renderMtfSplit(cfg) {
    if (!cfg || !cfg.htf || !Array.isArray(cfg.ltf) || cfg.ltf.length === 0) return '';
    const outerX = 20;
    const outerY = 28;
    const outerW = VIEW_W - 40;
    const outerH = VIEW_H - 40;

    const all = [cfg.htf, ...cfg.ltf];
    let minP = Infinity;
    let maxP = -Infinity;
    for (const c of all) {
      if (c.l < minP) minP = c.l;
      if (c.h > maxP) maxP = c.h;
    }
    const span = Math.max(2, maxP - minP);
    const pMin = minP - span * 0.14;
    const pMax = maxP + span * 0.14;

    const plotT = outerY + 42;
    const plotB = outerY + outerH - 28;
    const plotH = plotB - plotT;
    const priceToY = (p) => +(plotT + ((pMax - p) / (pMax - pMin)) * plotH).toFixed(1);

    const htfBox = { x: 34, w: 158 };
    const ltfBox = { x: 268, w: 274 };
    const axisX = 550;

    let out = `<rect x="${outerX}" y="${outerY}" width="${outerW}" height="${outerH}" rx="10" fill="var(--acd-chart-bg, #131722)" stroke="var(--acd-grid-border, rgba(148, 163, 184, 0.22))" stroke-width="1"/>`;
    out += `<rect x="${htfBox.x}" y="${outerY + 12}" width="${htfBox.w}" height="${outerH - 24}" rx="8" fill="var(--acd-gold-soft, rgba(245, 185, 66, 0.08))" stroke="var(--acd-gold, #f5b942)" stroke-opacity="0.4" stroke-width="1"/>`;
    out += `<rect x="${ltfBox.x}" y="${outerY + 12}" width="${ltfBox.w}" height="${outerH - 24}" rx="8" fill="var(--acd-cyan-soft, rgba(56, 189, 248, 0.07))" stroke="var(--acd-cyan, #38bdf8)" stroke-opacity="0.4" stroke-width="1"/>`;

    out += `<text x="${htfBox.x + htfBox.w / 2}" y="${outerY + 29}" text-anchor="middle" fill="var(--acd-gold, #f5b942)" font-size="10" font-weight="800" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(cfg.htfLabel || '1 CANDLE H1')}</text>`;
    out += `<text x="${ltfBox.x + ltfBox.w / 2}" y="${outerY + 29}" text-anchor="middle" fill="var(--acd-cyan, #38bdf8)" font-size="10" font-weight="800" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(cfg.ltfLabel || '4 CANDLE M15')}</text>`;

    // Horizontal parity guides from H1 across to M15 & right axis
    const guides = [
      { price: cfg.htf.h, tag: `H ${cfg.htf.h.toFixed(1)}`, tone: 'var(--acd-muted, #94a3b8)' },
      { price: cfg.htf.c, tag: `C ${cfg.htf.c.toFixed(1)}`, tone: 'var(--acd-bull, #22c55e)' },
      { price: cfg.htf.o, tag: `O ${cfg.htf.o.toFixed(1)}`, tone: 'var(--acd-gold, #f5b942)' },
      { price: cfg.htf.l, tag: `L ${cfg.htf.l.toFixed(1)}`, tone: 'var(--acd-muted, #94a3b8)' }
    ];
    for (const g of guides) {
      const y = priceToY(g.price);
      out += `<line x1="${htfBox.x + 20}" y1="${y}" x2="${axisX - 4}" y2="${y}" stroke="${g.tone}" stroke-width="1.15" stroke-dasharray="4 3" stroke-opacity="0.72"/>`;
      out += `<text x="${axisX}" y="${(y + 3.5).toFixed(1)}" fill="${g.tone}" font-size="9.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(g.tag)}</text>`;
    }

    // Center equals / zoom badge
    const eqCx = +((htfBox.x + htfBox.w + ltfBox.x) / 2).toFixed(1);
    const eqCy = +((plotT + plotB) / 2).toFixed(1);
    out += `<rect x="${(eqCx - 26).toFixed(1)}" y="${(eqCy - 14).toFixed(1)}" width="52" height="28" rx="6" fill="var(--acd-callout-bg, #0d1526)" stroke="var(--acd-gold, #f5b942)" stroke-width="1.2"/>`;
    out += `<text x="${eqCx}" y="${(eqCy + 4).toFixed(1)}" text-anchor="middle" fill="var(--acd-gold, #f5b942)" font-size="10.5" font-weight="800" font-family="var(--acd-mono, ui-monospace, monospace)">= 4×</text>`;

    // Helper to draw crisp solid candlestick
    const drawCandle = (c, cx, bw) => {
      const yO = priceToY(c.o);
      const yC = priceToY(c.c);
      const yH = priceToY(c.h);
      const yL = priceToY(c.l);
      const isBull = c.c >= c.o;
      const top = Math.min(yO, yC);
      const bh = Math.max(2, Math.abs(yC - yO));
      const col = isBull ? 'var(--acd-bull, #22c55e)' : 'var(--acd-bear, #ef4444)';
      return `<g class="acd-candle">
        <line x1="${cx}" y1="${yH}" x2="${cx}" y2="${yL}" stroke="${col}" stroke-width="2" stroke-linecap="butt"/>
        <rect x="${(cx - bw / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bw}" height="${bh.toFixed(1)}" rx="1" fill="${col}"/>
      </g>`;
    };

    // HTF single candle
    const htfCx = +(htfBox.x + htfBox.w / 2).toFixed(1);
    out += drawCandle(cfg.htf, htfCx, 36);
    out += `<text x="${htfCx}" y="${(outerY + outerH - 18).toFixed(1)}" text-anchor="middle" fill="var(--acd-muted, #94a3b8)" font-size="9.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">15:00–16:00</text>`;

    // 4 LTF candles (tight TradingView spacing)
    const ltfCount = cfg.ltf.length;
    const ltfStep = (ltfBox.w - 36) / ltfCount;
    const ltfBw = Math.max(18, Math.min(36, +(ltfStep * 0.72).toFixed(1)));
    cfg.ltf.forEach((c, i) => {
      const cx = +(ltfBox.x + 18 + (i + 0.5) * ltfStep).toFixed(1);
      out += drawCandle(c, cx, ltfBw);
      if (c.label) {
        out += `<text x="${cx}" y="${(outerY + outerH - 18).toFixed(1)}" text-anchor="middle" fill="var(--acd-muted, #94a3b8)" font-size="9.2" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(c.label)}</text>`;
      }
    });

    return `<g class="acd-mtf-split">${out}</g>`;
  }

  /**
   * TradingView-Grade OHLC Series Chart Renderer.
   * Uniform slot pitch, 76% body density, automatic price axis, exact wick-computed Auto-FVG overlays,
   * zones, labelled levels, wick highlight rings, and directional projection arrows.
   */
  function renderSeriesStage(stage) {
    const series = Array.isArray(stage.series) ? stage.series : [];
    if (series.length === 0) return '';

    let minP = Infinity;
    let maxP = -Infinity;
    for (const c of series) {
      if (c.l < minP) minP = c.l;
      if (c.h > maxP) maxP = c.h;
    }
    if (Array.isArray(stage.seriesLevels)) {
      for (const lv of stage.seriesLevels) {
        if (lv.price < minP) minP = lv.price;
        if (lv.price > maxP) maxP = lv.price;
      }
    }
    if (Array.isArray(stage.seriesZones)) {
      for (const z of stage.seriesZones) {
        if (z.low < minP) minP = z.low;
        if (z.high > maxP) maxP = z.high;
      }
    }
    if (Array.isArray(stage.seriesArrows)) {
      for (const a of stage.seriesArrows) {
        if (a.fromPrice < minP) minP = a.fromPrice;
        if (a.fromPrice > maxP) maxP = a.fromPrice;
        if (a.toPrice < minP) minP = a.toPrice;
        if (a.toPrice > maxP) maxP = a.toPrice;
      }
    }
    if (Array.isArray(stage.seriesCallouts)) {
      for (const co of stage.seriesCallouts) {
        if (co.price < minP) minP = co.price;
        if (co.price > maxP) maxP = co.price;
      }
    }
    const span = Math.max(1.5, maxP - minP);
    const padP = span * 0.12;
    const pMin = minP - padP;
    const pMax = maxP + padP;

    const plotL = PLOT.left;
    const plotR = PLOT.right;
    const plotT = PLOT.top;
    const plotB = PLOT.bottom;
    const plotW = plotR - plotL;
    const plotH = plotB - plotT;

    const totalSlots = Math.max(series.length, Number(stage.seriesSlots) || series.length);
    const padX = 12;
    const stepX = (plotW - padX * 2) / totalSlots;
    const bodyW = Math.max(6, Math.min(24, +(stepX * 0.76).toFixed(1)));
    const half = bodyW / 2;
    const idxToX = (i) => +(plotL + padX + (i + 0.5) * stepX).toFixed(1);
    const priceToY = (p) => +(plotT + ((pMax - p) / (pMax - pMin)) * plotH).toFixed(1);
    const decimals = Number.isInteger(stage.priceDecimals) ? stage.priceDecimals : 1;

    // Background + 4 price grid ticks
    let gridHtml = `<rect x="${plotL}" y="${plotT}" width="${plotW}" height="${plotH}" rx="8" fill="var(--acd-chart-bg, #131722)" stroke="var(--acd-grid-border, rgba(148, 163, 184, 0.18))" stroke-width="1"/>`;
    for (let i = 0; i <= 4; i += 1) {
      const frac = i / 4;
      const y = +(plotT + frac * plotH).toFixed(1);
      const price = pMax - frac * (pMax - pMin);
      gridHtml += `<line x1="${plotL}" y1="${y}" x2="${plotR}" y2="${y}" stroke="var(--acd-grid, rgba(148, 163, 184, 0.12))" stroke-dasharray="3 4" stroke-width="1"/>`;
      gridHtml += `<text x="${plotR + 6}" y="${(y + 3.5).toFixed(1)}" fill="var(--acd-muted, #94a3b8)" font-size="9.5" font-family="var(--acd-mono, ui-monospace, monospace)">${price.toFixed(decimals)}</text>`;
    }

    // Series shaded zones (Spread bands, TP/SL ranges, Buffers, Support/Resistance)
    let zonesBackHtml = '';
    let zonesFrontHtml = '';
    for (const z of (stage.seriesZones || [])) {
      const x1 = z.fromIdx != null ? Math.max(plotL + 2, idxToX(z.fromIdx) - half) : plotL + 3;
      const x2 = z.toIdx != null ? Math.min(plotR - 2, idxToX(z.toIdx) + half) : plotR - 3;
      const yTop = priceToY(z.high);
      const yBot = priceToY(z.low);
      const zh = Math.max(4, +(yBot - yTop).toFixed(1));
      const t = toneOf(z.tone);
      zonesBackHtml += `<rect x="${x1.toFixed(1)}" y="${yTop}" width="${Math.max(8, x2 - x1).toFixed(1)}" height="${zh}" rx="3" fill="${t.fill}" stroke="${t.stroke}" stroke-opacity="0.45" stroke-width="1"/>`;
      if (z.label) {
        const isRight = z.labelPos === 'tr' || z.labelPos === 'br';
        const isBottom = z.labelPos === 'bl' || z.labelPos === 'br';
        const lx = isRight ? (x2 - 6) : (x1 + 6);
        const ly = isBottom ? (yBot - 5) : (yTop + Math.min(13, zh * 0.72));
        const anchor = isRight ? 'end' : 'start';
        const lblSvg = `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" fill="${t.text}" font-size="9.2" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(z.label)}</text>`;
        if (z.labelFront) zonesFrontHtml += lblSvg;
        else zonesBackHtml += lblSvg;
      }
    }

    // Auto-computed FVG zones (behind candles) + crisp wick markers & labels (above candles)
    let fvgBackHtml = '';
    let fvgFrontHtml = '';
    for (const fvg of (stage.autoFvgs || [])) {
      const c1 = series[fvg.c1Idx];
      const c3 = series[fvg.c3Idx];
      if (!c1 || !c3) continue;
      const isBear = fvg.type === 'bear';
      const lowP = isBear ? c3.h : c1.h;
      const highP = isBear ? c1.l : c3.l;
      if (!(highP > lowP)) continue;

      const xC1 = idxToX(fvg.c1Idx);
      const xC3 = idxToX(fvg.c3Idx);
      const xStart = xC1;
      const xEnd = fvg.extendToIdx != null ? Math.min(plotR - 6, idxToX(fvg.extendToIdx) + half) : (plotR - 6);
      const yTop = priceToY(highP);
      const yBot = priceToY(lowP);
      const ceY = priceToY((highP + lowP) / 2);
      const t = toneOf(fvg.tone || (isBear ? 'bear' : 'fvg'));

      fvgBackHtml += `<rect x="${xStart}" y="${yTop}" width="${Math.max(8, xEnd - xStart).toFixed(1)}" height="${Math.max(4, yBot - yTop).toFixed(1)}" rx="2" fill="${t.fill}" stroke="${t.stroke}" stroke-opacity="0.55" stroke-width="1"/>`;
      if (fvg.label) {
        const lblY = fvg.showCE ? Math.min(yTop + 10.5, ceY - 3.5) : (yTop + 11.5);
        const isLeft = fvg.labelSide === 'left';
        const lx = isLeft ? (xStart + 6) : (xEnd - 6);
        const anchor = isLeft ? 'start' : 'end';
        fvgFrontHtml += `<text x="${lx.toFixed(1)}" y="${lblY.toFixed(1)}" text-anchor="${anchor}" fill="${t.text}" font-size="9.2" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(fvg.label)}</text>`;
      }
      if (fvg.showCE) {
        fvgBackHtml += `<line x1="${xStart}" y1="${ceY}" x2="${xEnd}" y2="${ceY}" stroke="var(--acd-gold, #f5b942)" stroke-width="1.35" stroke-dasharray="5 3"/>`;
        if (fvg.ceLabel) {
          const ceLblY = Math.max(ceY + 9.5, Math.min(yBot - 2.5, ceY + 10.5));
          fvgFrontHtml += `<text x="${(xEnd - 6).toFixed(1)}" y="${ceLblY.toFixed(1)}" text-anchor="end" fill="var(--acd-gold, #f5b942)" font-size="8.9" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(fvg.ceLabel)}</text>`;
        }
      }
      if (fvg.showWickMarkers) {
        const yC1Wick = isBear ? yTop : yBot;
        const yC3Wick = isBear ? yBot : yTop;
        const ink = 'var(--acd-ink, #f8fafc)';
        fvgFrontHtml += `<line x1="${xC1}" y1="${yC1Wick}" x2="${(xC3 + half + 8).toFixed(1)}" y2="${yC1Wick}" stroke="${ink}" stroke-width="1.25" stroke-opacity="0.85"/>`;
        fvgFrontHtml += `<line x1="${(xC1 - half - 4).toFixed(1)}" y1="${yC3Wick}" x2="${(xC3 + half + 8).toFixed(1)}" y2="${yC3Wick}" stroke="${ink}" stroke-width="1.25" stroke-opacity="0.85"/>`;
        fvgFrontHtml += `<circle cx="${xC1}" cy="${yC1Wick}" r="6.5" fill="none" stroke="${ink}" stroke-width="1.2" stroke-dasharray="2.5 2"/>`;
        fvgFrontHtml += `<circle cx="${xC3}" cy="${yC3Wick}" r="6.5" fill="none" stroke="${ink}" stroke-width="1.2" stroke-dasharray="2.5 2"/>`;
      }
    }

    // Series horizontal levels (lines behind candles, crisp pill labels above candles)
    let levelsHtml = '';
    let levelLabelsHtml = '';
    for (const lv of (stage.seriesLevels || [])) {
      const y = priceToY(lv.price);
      const x1 = lv.fromIdx != null ? idxToX(lv.fromIdx) : plotL + 4;
      const x2 = lv.toIdx != null ? idxToX(lv.toIdx) : plotR - 4;
      const t = toneOf(lv.tone);
      const dash = lv.style === 'dashed' ? '5 4' : lv.style === 'dotted' ? '2 3' : '';
      levelsHtml += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${t.stroke}" stroke-width="1.45" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
      if (lv.label) {
        const txt = String(lv.label);
        const pillW = Math.min(240, Math.max(64, txt.length * 5.8 + 14));
        const isRight = lv.labelSide === 'right';
        const pillX = isRight ? (x2 - pillW - 4) : (x1 + 4);
        const isBelow = lv.labelPos === 'below';
        const pillY = clamp(isBelow ? (y + 3) : (y - 17), plotT + 3, plotB - 17);
        const textX = isRight ? (pillX + pillW - 6) : (pillX + 6);
        const anchor = isRight ? 'end' : 'start';
        levelLabelsHtml += `<g class="acd-level-pill">
          <rect x="${pillX.toFixed(1)}" y="${pillY.toFixed(1)}" width="${pillW.toFixed(1)}" height="14.5" rx="3.5" fill="var(--acd-callout-bg, #0d1526)" fill-opacity="0.92" stroke="${t.stroke}" stroke-opacity="0.55" stroke-width="0.9"/>
          <text x="${textX.toFixed(1)}" y="${(pillY + 10.2).toFixed(1)}" text-anchor="${anchor}" fill="${t.text}" font-size="8.8" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(txt)}</text>
        </g>`;
      }
    }

    // Crisp TradingView-density candlesticks
    let candlesHtml = '';
    series.forEach((c, i) => {
      const cx = idxToX(i);
      const yO = priceToY(c.o);
      const yC = priceToY(c.c);
      const yH = priceToY(c.h);
      const yL = priceToY(c.l);
      const isBull = c.c >= c.o;
      const top = Math.min(yO, yC);
      const bh = Math.max(2, Math.abs(yC - yO));
      const col = isBull ? 'var(--acd-bull, #22c55e)' : 'var(--acd-bear, #ef4444)';
      candlesHtml += `<g class="acd-candle">
        <line x1="${cx}" y1="${yH}" x2="${cx}" y2="${yL}" stroke="${col}" stroke-width="1.65" stroke-linecap="butt"/>
        <rect x="${(cx - half).toFixed(1)}" y="${top.toFixed(1)}" width="${bodyW}" height="${bh.toFixed(1)}" rx="1" fill="${col}"/>
      </g>`;
    });

    // Exact wick highlight rings (dashed circles centered on sweep/rejection wick tips)
    let ringsHtml = '';
    for (const rg of (stage.seriesWickRings || [])) {
      const c = series[rg.idx];
      if (!c) continue;
      const cx = idxToX(rg.idx);
      const cy = priceToY(rg.which === 'high' ? c.h : c.l);
      const stroke = rg.tone === 'ink' || !rg.tone ? 'var(--acd-ink, #f8fafc)' : toneOf(rg.tone).stroke;
      const r = rg.r || 7;
      ringsHtml += `<circle class="acd-wick-ring" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="1.35" stroke-dasharray="3 2"/>`;
    }

    // Projection / directional arrows in exact candle-index + price space
    let arrowsHtml = '';
    (stage.seriesArrows || []).forEach((a, idx) => {
      const x1 = idxToX(a.fromIdx);
      const y1 = priceToY(a.fromPrice);
      const x2 = idxToX(a.toIdx);
      const y2 = priceToY(a.toPrice);
      const t = toneOf(a.tone);
      const txt = a.label ? String(a.label) : '';
      const pillW = txt ? Math.min(130, Math.max(44, txt.length * 6.0 + 12)) : 0;
      const mx = clamp(+((x1 + x2) / 2 + (a.labelDx || 0)).toFixed(1), plotL + pillW / 2 + 4, plotR - pillW / 2 - 4);
      const my = clamp(+((y1 + y2) / 2 + (a.labelDy != null ? a.labelDy : -10)).toFixed(1), plotT + 10, plotB - 10);
      const markerId = `acd-sarr-${idx}-${a.tone || 'gold'}`;
      const dash = a.dashed === false ? '' : 'stroke-dasharray="5 3"';
      arrowsHtml += `<g class="acd-arrow">
        <defs>
          <marker id="${markerId}" markerWidth="7.5" markerHeight="7.5" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 7.5 3.5, 0 7" fill="${t.stroke}"/>
          </marker>
        </defs>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.stroke}" stroke-width="2" ${dash} marker-end="url(#${markerId})"/>
        ${txt ? `<rect x="${(mx - pillW / 2).toFixed(1)}" y="${(my - 9.5).toFixed(1)}" width="${pillW.toFixed(1)}" height="14.5" rx="3.5" fill="var(--acd-callout-bg, #0d1526)" fill-opacity="0.92" stroke="${t.stroke}" stroke-opacity="0.45" stroke-width="0.8"/><text x="${mx}" y="${(my + 0.8).toFixed(1)}" text-anchor="middle" fill="${t.text}" font-size="9" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(txt)}</text>` : ''}
      </g>`;
    });

    // Series callouts
    let calloutsHtml = '';
    for (const co of (stage.seriesCallouts || [])) {
      const t = toneOf(co.tone);
      const txt = String(co.text || '');
      const pillW = Math.min(315, Math.max(30, txt.length * 5.9 + 16));
      const cx = clamp(idxToX(co.idx), plotL + pillW / 2 + 4, plotR - pillW / 2 - 4);
      const cy = clamp(priceToY(co.price), plotT + 13, plotB - 12);
      calloutsHtml += `<g class="acd-callout">
        <rect x="${(cx - pillW / 2).toFixed(1)}" y="${(cy - 10).toFixed(1)}" width="${pillW.toFixed(1)}" height="20" rx="5" fill="var(--acd-callout-bg, #0d1526)" stroke="${t.stroke}" stroke-width="1.15"/>
        <text x="${cx.toFixed(1)}" y="${(cy + 3.5).toFixed(1)}" text-anchor="middle" fill="${t.text}" font-size="9.6" font-weight="700">${esc(txt)}</text>
      </g>`;
    }

    // Vertical event guide lines (e.g. T = 0 RILIS, session opens)
    let vLinesBackHtml = '';
    let vLinesFrontHtml = '';
    for (const vl of (stage.seriesVLines || [])) {
      const x = idxToX(vl.idx);
      const t = toneOf(vl.tone);
      const dash = vl.style === 'dashed' ? '4 3' : vl.style === 'dotted' ? '2 3' : '';
      vLinesBackHtml += `<line x1="${x}" y1="${plotT + 2}" x2="${x}" y2="${plotB - 2}" stroke="${t.stroke}" stroke-width="1.4" ${dash ? `stroke-dasharray="${dash}"` : ''} opacity="0.88"/>`;
      if (vl.label) {
        const txt = String(vl.label);
        const pillW = Math.min(140, Math.max(58, txt.length * 5.8 + 12));
        const px = clamp(x - pillW / 2, plotL + 4, plotR - pillW - 4);
        const py = vl.labelPos === 'bottom' ? (plotB - 18) : (plotT + 4);
        vLinesFrontHtml += `<g class="acd-vline-pill">
          <rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pillW.toFixed(1)}" height="14.5" rx="3.5" fill="var(--acd-callout-bg, #0d1526)" fill-opacity="0.94" stroke="${t.stroke}" stroke-width="0.95"/>
          <text x="${(px + pillW / 2).toFixed(1)}" y="${(py + 10.2).toFixed(1)}" text-anchor="middle" fill="${t.text}" font-size="8.7" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(txt)}</text>
        </g>`;
      }
    }

    return `${gridHtml}${zonesBackHtml}${fvgBackHtml}${levelsHtml}${vLinesBackHtml}${candlesHtml}${zonesFrontHtml}${fvgFrontHtml}${ringsHtml}${levelLabelsHtml}${vLinesFrontHtml}${arrowsHtml}${calloutsHtml}`;
  }

  /**
   * Dual-Asset Side-by-Side Candlestick Comparison Renderer (SMT Divergence: XAU vs XAG / DXY).
   * Renders synchronized continuous OHLC series per asset with independent price axes,
   * exact swing-to-swing divergence trendlines, dashed wick highlight rings, and a clean bottom banner.
   */
  function renderDualAssetPanels(cfg) {
    if (!cfg || !Array.isArray(cfg.panels) || cfg.panels.length === 0) return '';
    const outerX = 20;
    const outerY = 28;
    const outerW = VIEW_W - 40;
    const outerH = VIEW_H - 40;
    const midX = VIEW_W / 2;
    const panelW = outerW / 2;

    let out = `<rect x="${outerX}" y="${outerY}" width="${outerW}" height="${outerH}" rx="10" fill="var(--acd-chart-bg, #131722)" stroke="var(--acd-grid-border, rgba(148, 163, 184, 0.22))" stroke-width="1"/>`;
    out += `<line x1="${midX}" y1="${outerY + 8}" x2="${midX}" y2="${outerY + outerH - 30}" stroke="var(--acd-grid-border, rgba(148, 163, 184, 0.30))" stroke-width="1.4"/>`;

    cfg.panels.slice(0, 2).forEach((p, pIdx) => {
      const px = outerX + pIdx * panelW;
      const plotL = px + 10;
      const plotR = px + panelW - 46;
      const plotT = outerY + 34;
      const plotB = outerY + outerH - 34;
      const plotW = plotR - plotL;
      const plotH = plotB - plotT;
      const series = Array.isArray(p.series) ? p.series : [];
      if (series.length === 0) return;

      let minP = Infinity;
      let maxP = -Infinity;
      for (const c of series) {
        if (c.l < minP) minP = c.l;
        if (c.h > maxP) maxP = c.h;
      }
      if (p.level) {
        if (p.level.price < minP) minP = p.level.price;
        if (p.level.price > maxP) maxP = p.level.price;
      }
      const span = Math.max(0.4, maxP - minP);
      const pMin = minP - span * 0.16;
      const pMax = maxP + span * 0.16;
      const decimals = Number.isInteger(p.decimals) ? p.decimals : 1;

      const stepX = (plotW - 12) / series.length;
      const bodyW = Math.max(6, Math.min(18, +(stepX * 0.74).toFixed(1)));
      const half = bodyW / 2;
      const idxToX = (i) => +(plotL + 6 + (i + 0.5) * stepX).toFixed(1);
      const priceToY = (v) => +(plotT + ((pMax - v) / (pMax - pMin)) * plotH).toFixed(1);
      const tHead = toneOf(p.tone);

      // Panel header & subtle horizontal grid
      out += `<text x="${plotL + 2}" y="${outerY + 21}" fill="${tHead.text}" font-size="10.2" font-weight="800" letter-spacing="0.04em" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(p.heading)}</text>`;
      if (p.trendline && p.trendline.label) {
        const tTr = toneOf(p.trendline.tone);
        const lbl = String(p.trendline.label);
        const pw = Math.min(132, Math.max(66, lbl.length * 5.6 + 12));
        const rx = px + panelW - pw - 8;
        out += `<rect x="${rx.toFixed(1)}" y="${outerY + 10}" width="${pw.toFixed(1)}" height="15" rx="3.5" fill="var(--acd-callout-bg, #0d1526)" stroke="${tTr.stroke}" stroke-opacity="0.65" stroke-width="0.9"/>`;
        out += `<text x="${(rx + pw / 2).toFixed(1)}" y="${outerY + 20.5}" text-anchor="middle" fill="${tTr.text}" font-size="8.4" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(lbl)}</text>`;
      }

      for (let g = 0; g <= 3; g += 1) {
        const frac = g / 3;
        const y = +(plotT + frac * plotH).toFixed(1);
        const pr = pMax - frac * (pMax - pMin);
        out += `<line x1="${plotL}" y1="${y}" x2="${plotR}" y2="${y}" stroke="var(--acd-grid, rgba(148, 163, 184, 0.11))" stroke-dasharray="3 4" stroke-width="0.9"/>`;
        out += `<text x="${plotR + 4}" y="${(y + 3).toFixed(1)}" fill="var(--acd-muted, #94a3b8)" font-size="8.4" font-family="var(--acd-mono, ui-monospace, monospace)">${pr.toFixed(decimals)}</text>`;
      }

      // Optional horizontal key level (PDL/PDH)
      if (p.level) {
        const ly = priceToY(p.level.price);
        const tl = toneOf(p.level.tone);
        out += `<line x1="${plotL}" y1="${ly}" x2="${plotR}" y2="${ly}" stroke="${tl.stroke}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.82"/>`;
        if (p.level.label) {
          const isLow = p.level.price < (pMin + pMax) / 2;
          const lTxtY = isLow ? (ly - 3.5) : (ly + 10);
          out += `<text x="${plotR - 3}" y="${lTxtY.toFixed(1)}" text-anchor="end" fill="${tl.text}" font-size="8.2" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(p.level.label)}</text>`;
        }
      }

      // Candles
      series.forEach((c, i) => {
        const cx = idxToX(i);
        const yO = priceToY(c.o);
        const yC = priceToY(c.c);
        const yH = priceToY(c.h);
        const yL = priceToY(c.l);
        const isBull = c.c >= c.o;
        const top = Math.min(yO, yC);
        const bh = Math.max(2, Math.abs(yC - yO));
        const col = isBull ? 'var(--acd-bull, #22c55e)' : 'var(--acd-bear, #ef4444)';
        out += `<g class="acd-candle">
          <line x1="${cx}" y1="${yH}" x2="${cx}" y2="${yL}" stroke="${col}" stroke-width="1.5" stroke-linecap="butt"/>
          <rect x="${(cx - half).toFixed(1)}" y="${top.toFixed(1)}" width="${bodyW}" height="${bh.toFixed(1)}" rx="0.8" fill="${col}"/>
        </g>`;
      });

      // Exact SMT swing-to-swing divergence trendline + wick rings
      if (p.trendline) {
        const tl = p.trendline;
        const cA = series[tl.fromIdx];
        const cB = series[tl.toIdx];
        if (cA && cB) {
          const x1 = idxToX(tl.fromIdx);
          const y1 = priceToY(tl.fromWhich === 'high' ? cA.h : cA.l);
          const x2 = idxToX(tl.toIdx);
          const y2 = priceToY(tl.toWhich === 'high' ? cB.h : cB.l);
          const tTr = toneOf(tl.tone);
          out += `<line class="acd-smt-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tTr.stroke}" stroke-width="2" stroke-dasharray="4 3"/>`;
          out += `<circle class="acd-wick-ring" cx="${x1}" cy="${y1}" r="5.5" fill="none" stroke="${tTr.stroke}" stroke-width="1.3" stroke-dasharray="2.5 2"/>`;
          out += `<circle class="acd-wick-ring" cx="${x2}" cy="${y2}" r="5.5" fill="none" stroke="${tTr.stroke}" stroke-width="1.3" stroke-dasharray="2.5 2"/>`;
        }
      }
    });

    // Centered bottom takeaway banner
    if (cfg.banner && cfg.banner.text) {
      const tb = toneOf(cfg.banner.tone);
      const txt = String(cfg.banner.text);
      const bw = Math.min(outerW - 24, Math.max(160, txt.length * 6.0 + 22));
      const bx = midX - bw / 2;
      const by = outerY + outerH - 25;
      out += `<g class="acd-callout">
        <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="19" rx="5" fill="var(--acd-callout-bg, #0d1526)" stroke="${tb.stroke}" stroke-width="1.15"/>
        <text x="${midX}" y="${(by + 12.8).toFixed(1)}" text-anchor="middle" fill="${tb.text}" font-size="9.4" font-weight="700">${esc(txt)}</text>
      </g>`;
    }

    return `<g class="acd-dual-panels">${out}</g>`;
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

    let bodySvg = '';
    if (Array.isArray(stage.splitPanels) && stage.splitPanels.length > 0) {
      bodySvg = renderSplitPanels(stage.splitPanels);
    } else if (stage.dualAssetPanels) {
      bodySvg = renderDualAssetPanels(stage.dualAssetPanels);
    } else if (stage.ohlcAnatomy) {
      bodySvg = renderOhlcAnatomy(stage.ohlcAnatomy);
    } else if (stage.mtfSplit) {
      bodySvg = renderMtfSplit(stage.mtfSplit);
    } else if (Array.isArray(stage.series) && stage.series.length > 0) {
      bodySvg = renderSeriesStage(stage);
    } else {
      bodySvg = [
        renderGrid(bp.priceLabels),
        renderZones(stage.zones),
        renderBars(stage.bars),
        renderLines(stage.lines),
        renderCandles(stage.candles),
        renderLineLabels(stage.lines),
        renderArrows(stage.arrows),
        renderCallouts(stage.callouts)
      ].join('');
    }

    const svg = [
      `<svg class="acd-svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="${esc(bp.title)} — ${esc(stage.label)}" xmlns="http://www.w3.org/2000/svg">`,
      `<text x="${PLOT.left}" y="19" fill="var(--acd-muted, #94a3b8)" font-size="10.5" font-weight="700" letter-spacing="0.06em" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(bp.pairTag)}</text>`,
      `<text x="${PLOT.right}" y="19" text-anchor="end" fill="var(--acd-gold, #f5b942)" font-size="10.5" font-weight="700" font-family="var(--acd-mono, ui-monospace, monospace)">${esc(stage.label.toUpperCase())}</text>`,
      bodySvg,
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
