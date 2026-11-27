/* Amy FX Academy — Interactive In-Chapter Chart Spotting Drills & Guided Topic Sync (UMD)
 * Turns passive reading into active XAU/USD candlestick eye-training across 10 core milestones
 * and connects every Academy chapter directly to its matching pillar in Latihan 100 Kasus ICT.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AmyAcademyChartDrills = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const STORAGE_KEY = 'amyfx.academy.chart_drills.v1';
  const GUIDED_MASTERY_KEY = 'amy-guided-v3-mastery';

  const GUIDED_TOPICS = {
    'inducement': { id: 'inducement', label: 'Stop Hunt & Sweep', count: 12 },
    'killzone': { id: 'killzone', label: 'Killzone Sisi Kanan', count: 12 },
    'dealing-range': { id: 'dealing-range', label: 'Dealing Range & NO TRADE', count: 12 },
    'market-structure': { id: 'market-structure', label: 'BOS, MSS & CISD', count: 14 },
    'pd-array': { id: 'pd-array', label: 'OB, Breaker & Unicorn', count: 14 },
    'entry-playbook': { id: 'entry-playbook', label: 'Silver Bullet, 2022 & PO3', count: 12 },
    'risk-sl-rr': { id: 'risk-sl-rr', label: 'SL Invalidation & RR', count: 12 },
    'psychology-execution': { id: 'psychology-execution', label: 'Psikologi Eksekusi', count: 12 }
  };

  const LESSON_TO_GUIDED_TOPIC = {
    'karakter-xauusd-spread-wita': 'killzone',
    'struktur-pasar-dasar': 'market-structure',
    'multi-timeframe-h1-m15-m5': 'market-structure',
    'bos-valid-vs-sweep-palsu': 'market-structure',
    'internal-external-dealing-range': 'dealing-range',
    'bsl-dan-ssl-liquidity': 'inducement',
    'inducement-idm-umpan-ritel': 'inducement',
    'level-likuiditas-kunci-xauusd': 'inducement',
    'daily-bias-draw-on-liquidity': 'dealing-range',
    'siklus-amd-judas-swing': 'killzone',
    'jadwal-killzone-wita-silver-bullet': 'killzone',
    'protokol-news-lock-usd': 'killzone',
    'displacement-jejak-institusi': 'market-structure',
    'fvg-bisi-sibi-ce-50': 'pd-array',
    'model-ifvg-inversion': 'pd-array',
    'order-block-valid-mean-threshold': 'pd-array',
    'breaker-mitigation-unicorn': 'pd-array',
    'cisd-vs-mss-sinyal-awal': 'market-structure',
    'premium-discount-equilibrium': 'dealing-range',
    'model-sweep-mss-fvg': 'entry-playbook',
    'model-turtle-soup-smr': 'entry-playbook',
    'memilih-1-model-dan-filter-gagal': 'psychology-execution',
    'sl-struktural-napas-spread-tp': 'risk-sl-rr',
    'manajemen-trade-partial-bep-notrade': 'risk-sl-rr',
    'protokol-100-sample-mandiri': 'psychology-execution',
    'bpr-nwog-ndog-imbalance': 'pd-array',
    'smt-divergence-gold': 'entry-playbook',
    'mmxm-market-maker-model': 'entry-playbook',
    'ict-macros-weekly-ipda': 'killzone',
    'stdev-crt-profiling': 'dealing-range',
    'capstone-mapping-mandiri': 'entry-playbook'
  };

  /**
   * 10 Visual Candlestick Spotting Drills — every candle satisfies l <= min(o,c) and h >= max(o,c),
   * and every hotspot uses exact candle-index + XAU/USD price coordinates.
   */
  const CHART_DRILLS = [
    {
      id: 'drill-bab05-rejection-wick',
      lessonId: 'membaca-chart-candlestick-nol',
      stepLabel: 'Bab 05',
      timeframe: 'M15',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Temukan Candle Rejection / Sweep Wick',
      prompt: 'Harga turun mendekati support $2,645. Klik area di chart yang menunjukkan penolakan keras oleh buyer (Wick bawah panjang, Body tutup kembali di atas garis).',
      candles: [
        { o: 2653.6, h: 2654.4, l: 2652.4, c: 2652.7 },
        { o: 2652.7, h: 2653.2, l: 2651.1, c: 2651.5 },
        { o: 2651.5, h: 2652.1, l: 2649.8, c: 2650.2 },
        { o: 2650.2, h: 2650.9, l: 2648.6, c: 2649.0 },
        { o: 2649.0, h: 2649.6, l: 2647.3, c: 2647.7 },
        { o: 2647.7, h: 2648.3, l: 2646.0, c: 2646.4 },
        { o: 2646.4, h: 2647.2, l: 2645.4, c: 2646.8 },
        { o: 2646.8, h: 2647.1, l: 2645.2, c: 2645.7 },
        { o: 2645.7, h: 2648.0, l: 2641.2, c: 2647.5 },
        { o: 2647.5, h: 2650.4, l: 2647.1, c: 2650.0 },
        { o: 2650.0, h: 2652.1, l: 2649.5, c: 2651.7 },
        { o: 2651.7, h: 2652.3, l: 2650.6, c: 2651.0 },
        { o: 2651.0, h: 2653.2, l: 2650.8, c: 2652.9 },
        { o: 2652.9, h: 2654.2, l: 2652.3, c: 2653.7 },
        { o: 2653.7, h: 2654.6, l: 2652.8, c: 2653.2 },
        { o: 2653.2, h: 2654.8, l: 2652.9, c: 2654.4 }
      ],
      levels: [
        { price: 2645.0, label: 'Support $2,645', tone: 'gold', dashed: true, align: 'right' }
      ],
      proof: {
        wickPin: { idx: 8, which: 'low', label: 'Sweep Wick $2,641.2' }
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A',
          fromIdx: 1.5,
          toIdx: 4.5,
          low: 2647.0,
          high: 2653.4,
          isCorrect: false,
          feedback: 'Belum tepat. Area A adalah rangkaian candle merah berbadan penuh yang masih dikuasai seller—belum ada perlawanan atau wick penolakan.'
        },
        {
          id: 'B',
          label: 'Area B',
          fromIdx: 7.3,
          toIdx: 8.7,
          low: 2640.7,
          high: 2648.5,
          isCorrect: true,
          feedback: 'Tepat! Candle di Area B menusuk ke bawah $2,645 hanya dengan wick panjang sampai $2,641.2 lalu menutup body kuat di atas garis—ciri klasik Rejection / Sweep oleh buyer.'
        },
        {
          id: 'C',
          label: 'Area C',
          fromIdx: 12.2,
          toIdx: 15.0,
          low: 2651.8,
          high: 2655.2,
          isCorrect: false,
          feedback: 'Belum tepat. Area C adalah lanjutan kenaikan setelah harga sudah jauh meninggalkan support, bukan titik candle penolakan utamanya.'
        }
      ]
    },
    {
      id: 'drill-bab07-swing-low',
      lessonId: 'struktur-pasar-dasar',
      stepLabel: 'Bab 07',
      timeframe: 'M15',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Tunjuk Swing Low (Higher Low / HL) Valid',
      prompt: 'Pada tren naik XAU/USD ini, klik area yang membentuk Swing Low (HL) valid secara fraktal 3-candle (low tengah lebih rendah dari kiri dan kanannya) sebelum mencetak HH baru.',
      candles: [
        { o: 2639.8, h: 2641.6, l: 2639.2, c: 2641.2 },
        { o: 2641.2, h: 2643.8, l: 2640.9, c: 2643.4 },
        { o: 2643.4, h: 2646.4, l: 2643.0, c: 2646.0 },
        { o: 2646.0, h: 2648.6, l: 2645.6, c: 2648.1 },
        { o: 2648.1, h: 2648.4, l: 2646.2, c: 2646.6 },
        { o: 2646.6, h: 2647.0, l: 2644.6, c: 2645.0 },
        { o: 2645.0, h: 2645.4, l: 2643.6, c: 2644.1 },
        { o: 2644.1, h: 2645.8, l: 2642.4, c: 2645.4 },
        { o: 2645.4, h: 2647.6, l: 2644.8, c: 2647.2 },
        { o: 2647.2, h: 2650.2, l: 2646.9, c: 2649.8 },
        { o: 2649.8, h: 2652.0, l: 2649.4, c: 2651.6 },
        { o: 2651.6, h: 2652.4, l: 2650.6, c: 2651.0 },
        { o: 2651.0, h: 2653.4, l: 2650.7, c: 2653.0 },
        { o: 2653.0, h: 2654.6, l: 2652.4, c: 2654.1 },
        { o: 2654.1, h: 2655.0, l: 2653.2, c: 2653.6 },
        { o: 2653.6, h: 2655.2, l: 2653.1, c: 2654.7 }
      ],
      levels: [
        { price: 2648.6, label: 'Previous High (BOS)', tone: 'bull', dashed: true, align: 'right' }
      ],
      proof: {
        wickPin: { idx: 7, which: 'low', label: 'HL Valid $2,642.4', labelOffsetX: 54 }
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A',
          fromIdx: 2.2,
          toIdx: 4.3,
          low: 2645.4,
          high: 2649.2,
          isCorrect: false,
          feedback: 'Belum tepat. Area A adalah puncak Swing High (HH) awal sebelum koreksi, bukan titik lembah Swing Low (HL).'
        },
        {
          id: 'B',
          label: 'Area B',
          fromIdx: 6.2,
          toIdx: 8.2,
          low: 2641.9,
          high: 2646.5,
          isCorrect: true,
          feedback: 'Tepat! Area B adalah Higher Low (HL) valid: low candle tengah ($2,642.4) lebih rendah dari candle kiri dan kanannya, lalu mendorong harga memecahkan High lama (BOS).'
        },
        {
          id: 'C',
          label: 'Area C',
          fromIdx: 12.2,
          toIdx: 15.0,
          low: 2652.0,
          high: 2655.6,
          isCorrect: false,
          feedback: 'Belum tepat. Area C adalah puncak Higher High (HH) baru di atas garis BOS, bukan titik pijakan Higher Low.'
        }
      ]
    },
    {
      id: 'drill-bab09-sweep-vs-bos',
      lessonId: 'bos-valid-vs-sweep-palsu',
      stepLabel: 'Bab 09',
      timeframe: 'M15',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Mana Liquidity Sweep (Wick-Only), Bukan BOS?',
      prompt: 'Garis merah adalah Swing High lama di $2,654. Klik area yang merupakan Liquidity Sweep palsu (hanya tusukan wick tanpa Body Close di atas garis).',
      candles: [
        { o: 2648.8, h: 2650.8, l: 2648.4, c: 2650.4 },
        { o: 2650.4, h: 2652.6, l: 2650.0, c: 2652.2 },
        { o: 2652.2, h: 2654.0, l: 2651.6, c: 2653.1 },
        { o: 2653.1, h: 2653.5, l: 2651.0, c: 2651.4 },
        { o: 2651.4, h: 2651.9, l: 2649.8, c: 2650.2 },
        { o: 2650.2, h: 2651.4, l: 2649.5, c: 2651.0 },
        { o: 2651.0, h: 2652.8, l: 2650.6, c: 2652.4 },
        { o: 2652.4, h: 2653.6, l: 2652.0, c: 2653.2 },
        { o: 2653.2, h: 2656.4, l: 2652.2, c: 2652.8 },
        { o: 2652.8, h: 2653.2, l: 2650.0, c: 2650.4 },
        { o: 2650.4, h: 2650.9, l: 2647.8, c: 2648.2 },
        { o: 2648.2, h: 2649.2, l: 2647.4, c: 2648.8 },
        { o: 2648.8, h: 2649.1, l: 2646.4, c: 2646.8 },
        { o: 2646.8, h: 2647.4, l: 2645.2, c: 2645.6 },
        { o: 2645.6, h: 2646.4, l: 2644.6, c: 2645.9 },
        { o: 2645.9, h: 2646.2, l: 2644.0, c: 2644.4 }
      ],
      levels: [
        { price: 2654.0, label: 'Swing High $2,654', tone: 'bear', dashed: true, align: 'right' }
      ],
      proof: {
        wickPin: { idx: 8, which: 'high', label: 'Sweep Wick $2,656.4' }
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A',
          fromIdx: 1.2,
          toIdx: 3.1,
          low: 2651.0,
          high: 2654.6,
          isCorrect: false,
          feedback: 'Belum tepat. Area A baru membentuk Swing High acuan pertama di $2,654—belum ada level sebelumnya yang ditembus atau di-sweep.'
        },
        {
          id: 'B',
          label: 'Area B',
          fromIdx: 7.3,
          toIdx: 8.8,
          low: 2651.8,
          high: 2656.9,
          isCorrect: true,
          feedback: 'Tepat! Di Area B wick menusuk sampai $2,656.4 menyapu SL seller, namun Body Close tetap di $2,652.8 (di bawah $2,654). Itu murni Liquidity Sweep, bukan BOS naik!'
        },
        {
          id: 'C',
          label: 'Area C',
          fromIdx: 10.2,
          toIdx: 13.5,
          low: 2645.0,
          high: 2649.6,
          isCorrect: false,
          feedback: 'Belum tepat. Area C adalah dorongan turun (Displacement) yang terjadi SETELAH Liquidity Sweep selesai menjebak buyer breakout.'
        }
      ]
    },
    {
      id: 'drill-bab11-eqh-bsl',
      lessonId: 'bsl-dan-ssl-liquidity',
      stepLabel: 'Bab 11',
      timeframe: 'M15',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Tandai Kolam Equal Highs (EQH / BSL)',
      prompt: 'Trader ritel sering memasang Stop Loss di atas puncak kembar (double top). Klik area yang menjadi magnet Buy-Side Liquidity (EQH / BSL) paling jelas di chart ini.',
      candles: [
        { o: 2646.2, h: 2648.6, l: 2645.8, c: 2648.2 },
        { o: 2648.2, h: 2650.8, l: 2647.8, c: 2650.4 },
        { o: 2650.4, h: 2652.8, l: 2650.0, c: 2651.8 },
        { o: 2651.8, h: 2652.2, l: 2649.4, c: 2649.8 },
        { o: 2649.8, h: 2650.2, l: 2648.0, c: 2648.4 },
        { o: 2648.4, h: 2649.6, l: 2647.8, c: 2649.2 },
        { o: 2649.2, h: 2651.4, l: 2648.8, c: 2651.0 },
        { o: 2651.0, h: 2652.9, l: 2650.4, c: 2651.7 },
        { o: 2651.7, h: 2652.1, l: 2649.2, c: 2649.6 },
        { o: 2649.6, h: 2650.0, l: 2647.6, c: 2648.0 },
        { o: 2648.0, h: 2648.6, l: 2646.4, c: 2647.0 },
        { o: 2647.0, h: 2648.8, l: 2646.6, c: 2648.4 },
        { o: 2648.4, h: 2650.4, l: 2648.0, c: 2650.0 },
        { o: 2650.0, h: 2651.6, l: 2649.6, c: 2651.2 },
        { o: 2651.2, h: 2652.2, l: 2650.4, c: 2650.9 },
        { o: 2650.9, h: 2652.0, l: 2650.2, c: 2651.6 }
      ],
      levels: [
        { price: 2652.9, label: 'EQH / BSL $2,652.9', tone: 'gold', dashed: true, align: 'right' }
      ],
      proof: {
        wickPins: [
          { idx: 2, which: 'high' },
          { idx: 7, which: 'high' }
        ],
        connectLine: true
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A',
          fromIdx: 1.6,
          toIdx: 7.7,
          low: 2651.6,
          high: 2653.8,
          isCorrect: true,
          feedback: 'Tepat! Dua puncak hampir sejajar di $2,652.8–$2,652.9 membentuk Equal Highs (EQH). Tepat di atas garis ini bertumpuk Stop Loss seller (BSL) yang sangat rawan di-sweep.'
        },
        {
          id: 'B',
          label: 'Area B',
          fromIdx: 3.6,
          toIdx: 6.0,
          low: 2647.4,
          high: 2650.6,
          isCorrect: false,
          feedback: 'Belum tepat. Area B berada di tengah range internal—bukan kumpulan puncak kembar EQH tempat BSL menumpuk.'
        },
        {
          id: 'C',
          label: 'Area C',
          fromIdx: 9.4,
          toIdx: 11.8,
          low: 2646.0,
          high: 2649.2,
          isCorrect: false,
          feedback: 'Belum tepat. Area C adalah lembah bawah (SSL), bukan zona Equal Highs / Buy-Side Liquidity (BSL) yang diminta.'
        }
      ]
    },
    {
      id: 'drill-bab12-inducement',
      lessonId: 'inducement-idm-umpan-ritel',
      stepLabel: 'Bab 12',
      timeframe: 'M15',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Bedakan Liquidity Sweep (Purge) vs Liquidity Run',
      prompt: 'Daily Bias BULLISH menuju PDH $2,665. Pada pembukaan London, Asia Low ($2,646) disapu lalu Asia High ($2,652) ditembus body penuh. Klik area yang merupakan Liquidity Sweep (Purge & Revert) sah—bukan Liquidity Run!',
      candles: [
        { o: 2648.6, h: 2651.0, l: 2648.0, c: 2650.6 },
        { o: 2650.6, h: 2652.0, l: 2649.2, c: 2649.6 },
        { o: 2649.6, h: 2650.2, l: 2647.6, c: 2648.0 },
        { o: 2648.0, h: 2649.2, l: 2647.2, c: 2648.6 },
        { o: 2648.6, h: 2649.0, l: 2646.0, c: 2646.8 },
        { o: 2646.8, h: 2648.2, l: 2642.8, c: 2647.8 },
        { o: 2647.8, h: 2651.4, l: 2647.4, c: 2651.0 },
        { o: 2651.0, h: 2654.4, l: 2650.6, c: 2654.0 },
        { o: 2654.0, h: 2655.2, l: 2652.8, c: 2653.4 },
        { o: 2653.4, h: 2656.6, l: 2653.0, c: 2656.2 },
        { o: 2656.2, h: 2658.4, l: 2655.8, c: 2658.0 },
        { o: 2658.0, h: 2658.8, l: 2656.8, c: 2657.4 },
        { o: 2657.4, h: 2660.2, l: 2657.0, c: 2659.8 },
        { o: 2659.8, h: 2661.8, l: 2659.2, c: 2661.4 },
        { o: 2661.4, h: 2662.6, l: 2660.6, c: 2662.0 },
        { o: 2662.0, h: 2663.6, l: 2661.4, c: 2663.2 }
      ],
      levels: [
        { price: 2652.0, label: 'Asia High $2,652', tone: 'bull', dashed: true, align: 'right' },
        { price: 2646.0, label: 'Asia Low $2,646 (SSL)', tone: 'gold', dashed: true, align: 'right' }
      ],
      proof: {
        wickPin: { idx: 5, which: 'low', label: 'Purge Wick $2,642.8', labelOffsetX: 40 }
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A',
          fromIdx: 0.2,
          toIdx: 2.2,
          low: 2647.4,
          high: 2652.6,
          isCorrect: false,
          feedback: 'Belum tepat. Area A baru membentuk batas atas Asia High ($2,652) sebelum London Open menyapu likuiditas.'
        },
        {
          id: 'B',
          label: 'Area B',
          fromIdx: 4.3,
          toIdx: 5.8,
          low: 2642.2,
          high: 2649.0,
          isCorrect: true,
          feedback: 'Tepat! Area B adalah Liquidity Sweep (Purge & Revert): wick menusuk ke $2,642.8 menyapu SSL di bawah Asia Low ($2,646), Body Close kembali di dalam range ($2,647.8), lalu langsung diikuti Displacement naik.'
        },
        {
          id: 'C',
          label: 'Area C',
          fromIdx: 7.0,
          toIdx: 11.4,
          low: 2653.4,
          high: 2659.2,
          isCorrect: false,
          feedback: 'Belum tepat. Area C adalah Liquidity Run (Expansion): Body Close penuh di atas Asia High ($2,652) searah Daily Bias Bullish menuju PDH—bukan Sweep untuk dilawan Sell.'
        }
      ]
    },
    {
      id: 'drill-bab19-fvg-bisi',
      lessonId: 'fvg-bisi-sibi-ce-50',
      stepLabel: 'Bab 19',
      timeframe: 'M5',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Klik Celah Bullish FVG (BISI) yang Benar',
      prompt: 'Ingat aturan 3-candle Bullish FVG: celah kosong antara ujung High wick Candle 1 dan ujung Low wick Candle 3 yang tidak saling tumpang tindih. Klik area FVG yang valid pada impuls naik ini!',
      candles: [
        { o: 2645.2, h: 2646.1, l: 2644.4, c: 2644.7 },
        { o: 2644.7, h: 2645.8, l: 2644.1, c: 2645.4 },
        { o: 2645.4, h: 2646.3, l: 2644.6, c: 2644.9 },
        { o: 2644.9, h: 2645.9, l: 2643.8, c: 2644.3 },
        { o: 2644.3, h: 2645.6, l: 2644.0, c: 2645.2 },
        { o: 2645.2, h: 2646.4, l: 2644.8, c: 2646.0 },
        { o: 2646.0, h: 2652.0, l: 2645.5, c: 2651.5 },
        { o: 2651.5, h: 2653.4, l: 2650.0, c: 2652.8 },
        { o: 2652.8, h: 2653.9, l: 2651.8, c: 2652.2 },
        { o: 2652.2, h: 2652.7, l: 2650.9, c: 2651.3 },
        { o: 2651.3, h: 2651.9, l: 2649.8, c: 2650.2 },
        { o: 2650.2, h: 2650.9, l: 2648.1, c: 2649.5 },
        { o: 2649.5, h: 2652.4, l: 2649.2, c: 2652.0 },
        { o: 2652.0, h: 2654.2, l: 2650.9, c: 2653.8 },
        { o: 2653.8, h: 2655.6, l: 2652.4, c: 2655.1 },
        { o: 2655.1, h: 2656.0, l: 2654.1, c: 2654.6 }
      ],
      levels: [
        { price: 2646.3, label: 'Swing High $2,646.3', tone: 'muted', dashed: true, align: 'right' }
      ],
      proof: {
        fvg: {
          c1Idx: 5,
          c3Idx: 7,
          type: 'bull',
          extendToIdx: 12,
          label: 'FVG VALID ($2,646.4–$2,650.0)',
          ceLabel: '50% CE $2,648.2'
        }
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A',
          fromIdx: 0.4,
          toIdx: 4.3,
          low: 2643.8,
          high: 2646.5,
          isCorrect: false,
          feedback: 'Belum tepat. Di Area A wick seluruh candle saling bertumpuk rapat (overlap)—tidak ada celah kosong antara High C1 dan Low C3, jadi BUKAN FVG.'
        },
        {
          id: 'B',
          label: 'Area B',
          fromIdx: 5.0,
          toIdx: 8.2,
          low: 2646.4,
          high: 2650.0,
          isCorrect: true,
          feedback: 'Tepat! Celah bersih antara High wick C1 ($2,646.4) dan Low wick C3 ($2,650.0) adalah Bullish FVG (BISI) yang valid. Lihat bukti garis & lingkaran wick: pullback menyentuh tepat 50% CE ($2,648.2) lalu melanjutkan rally!'
        },
        {
          id: 'C',
          label: 'Area C',
          fromIdx: 7.5,
          toIdx: 10.6,
          low: 2650.4,
          high: 2654.2,
          isCorrect: false,
          feedback: 'Belum tepat. Area C adalah fase koreksi di atas celah dengan wick yang saling bersentuhan—bukan ruang celah FVG-nya.'
        }
      ]
    },
    {
      id: 'drill-bab21-order-block',
      lessonId: 'order-block-valid-mean-threshold',
      stepLabel: 'Bab 21',
      timeframe: 'M15',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Pilih Order Block (OB) Bullish yang Valid',
      prompt: 'Mana candle Order Block Bullish yang valid? Ingat syaratnya: candle bearish terakhir tepat sebelum dorongan Displacement kuat yang meninggalkan FVG & BOS.',
      candles: [
        { o: 2651.6, h: 2652.2, l: 2649.8, c: 2650.2 },
        { o: 2650.2, h: 2650.6, l: 2648.2, c: 2648.6 },
        { o: 2648.6, h: 2649.2, l: 2647.0, c: 2647.4 },
        { o: 2647.4, h: 2648.0, l: 2646.0, c: 2646.5 },
        { o: 2646.5, h: 2646.9, l: 2645.2, c: 2645.6 },
        { o: 2645.6, h: 2646.0, l: 2642.4, c: 2643.2 },
        { o: 2643.2, h: 2647.4, l: 2643.0, c: 2647.0 },
        { o: 2647.0, h: 2652.2, l: 2646.8, c: 2651.6 },
        { o: 2651.6, h: 2653.4, l: 2649.6, c: 2652.8 },
        { o: 2652.8, h: 2653.2, l: 2650.8, c: 2651.2 },
        { o: 2651.2, h: 2651.6, l: 2648.4, c: 2648.8 },
        { o: 2648.8, h: 2649.2, l: 2646.2, c: 2646.6 },
        { o: 2646.6, h: 2647.2, l: 2644.4, c: 2646.4 },
        { o: 2646.4, h: 2649.8, l: 2646.0, c: 2649.4 },
        { o: 2649.4, h: 2652.4, l: 2649.0, c: 2652.0 },
        { o: 2652.0, h: 2654.2, l: 2651.6, c: 2653.6 }
      ],
      levels: [
        { price: 2645.6, label: 'OB Open $2,645.6', tone: 'bull', dashed: true, align: 'left' },
        { price: 2644.4, label: '50% MT $2,644.4', tone: 'gold', dashed: true, align: 'left', labelPos: 'below' }
      ],
      proof: {
        zone: {
          fromIdx: 4.7,
          toIdx: 12.6,
          low: 2642.4,
          high: 2645.6,
          midPrice: 2644.4,
          label: 'BULLISH OB ($2,645.6–$2,642.4)'
        },
        wickPin: { idx: 12, which: 'low', label: 'Retest 50% MT $2,644.4', labelOffsetX: 16 }
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A',
          fromIdx: 0.4,
          toIdx: 2.6,
          low: 2646.8,
          high: 2652.4,
          isCorrect: false,
          feedback: 'Belum tepat. Area A memang candle bearish, tetapi belum memicu Displacement naik atau BOS—itu masih bagian dari gelombang turun biasa.'
        },
        {
          id: 'B',
          label: 'Area B',
          fromIdx: 4.5,
          toIdx: 5.7,
          low: 2642.0,
          high: 2646.3,
          isCorrect: true,
          feedback: 'Tepat! Candle bearish terakhir di dasar (Open $2,645.6 · Close $2,643.2 · Low $2,642.4) tepat sebelum ledakan Displacement + FVG adalah Bullish Order Block valid, dengan 50% Mean Threshold body tepat di $2,644.4.'
        },
        {
          id: 'C',
          label: 'Area C',
          fromIdx: 8.5,
          toIdx: 11.2,
          low: 2647.8,
          high: 2653.6,
          isCorrect: false,
          feedback: 'Belum tepat. Area C adalah candle pullback merah di pucuk atas, bukan titik awal (origin) dorongan institusi.'
        }
      ]
    },
    {
      id: 'drill-bab23-mss-confirmation',
      lessonId: 'cisd-vs-mss-sinyal-awal',
      stepLabel: 'Bab 23',
      timeframe: 'M5',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Klik Candle Konfirmasi MSS Setelah Sweep SSL',
      prompt: 'Harga sudah menyapu SSL di $2,644. Klik area candle yang mengonfirmasi perubahan arah (MSS Bullish) karena Body Close tegas menembus Swing High internal di $2,648.5.',
      candles: [
        { o: 2650.6, h: 2651.2, l: 2648.6, c: 2649.0 },
        { o: 2649.0, h: 2649.4, l: 2646.6, c: 2647.0 },
        { o: 2647.0, h: 2647.8, l: 2645.8, c: 2646.6 },
        { o: 2646.6, h: 2648.5, l: 2646.2, c: 2647.9 },
        { o: 2647.9, h: 2648.2, l: 2645.6, c: 2646.0 },
        { o: 2646.0, h: 2646.4, l: 2644.4, c: 2644.8 },
        { o: 2644.8, h: 2645.8, l: 2641.8, c: 2645.2 },
        { o: 2645.2, h: 2647.8, l: 2644.9, c: 2647.4 },
        { o: 2647.4, h: 2652.0, l: 2647.2, c: 2651.5 },
        { o: 2651.5, h: 2653.4, l: 2650.0, c: 2652.8 },
        { o: 2652.8, h: 2653.2, l: 2651.0, c: 2651.4 },
        { o: 2651.4, h: 2651.8, l: 2649.6, c: 2650.0 },
        { o: 2650.0, h: 2650.6, l: 2648.6, c: 2649.8 },
        { o: 2649.8, h: 2652.6, l: 2649.4, c: 2652.2 },
        { o: 2652.2, h: 2654.2, l: 2651.8, c: 2653.8 },
        { o: 2653.8, h: 2655.0, l: 2653.2, c: 2654.6 }
      ],
      levels: [
        { price: 2648.5, label: 'Level MSS $2,648.5', tone: 'bull', dashed: true, align: 'left', labelPos: 'below' },
        { price: 2644.0, label: 'SSL $2,644', tone: 'gold', dashed: true, align: 'right' }
      ],
      proof: {
        fvg: {
          c1Idx: 7,
          c3Idx: 9,
          type: 'bull',
          extendToIdx: 15,
          ceLabel: 'FVG 50% CE'
        },
        wickPin: { idx: 6, which: 'low', label: 'SSL Sweep $2,641.8', labelOffsetX: 30 }
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A',
          fromIdx: 5.3,
          toIdx: 6.7,
          low: 2641.4,
          high: 2646.4,
          isCorrect: false,
          feedback: 'Belum tepat. Area A adalah momen Sweep SSL-nya (Langkah 1), bukan konfirmasi balik arah (MSS). Entry langsung di sini tanpa menunggu struktur patah sangat berisiko.'
        },
        {
          id: 'B',
          label: 'Area B',
          fromIdx: 7.5,
          toIdx: 8.7,
          low: 2647.0,
          high: 2652.4,
          isCorrect: true,
          feedback: 'Tepat! Candle hijau panjang di Area B melakukan Displacement & Body Close tegas di atas $2,648.5 sekaligus mencetak FVG ($2,647.8–$2,650.0)—inilah konfirmasi MSS Bullish yang valid.'
        },
        {
          id: 'C',
          label: 'Area C',
          fromIdx: 10.2,
          toIdx: 12.6,
          low: 2648.2,
          high: 2653.5,
          isCorrect: false,
          feedback: 'Belum tepat. Area C adalah fase pullback menuju zona entry FVG setelah MSS sudah terbentuk lebih dulu di Area B.'
        }
      ]
    },
    {
      id: 'drill-bab24-discount-ote',
      lessonId: 'premium-discount-equilibrium',
      stepLabel: 'Bab 24',
      timeframe: 'M15',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Klik Zona Discount + OTE (61,8%–78,6%) untuk Buy',
      prompt: 'Dealing Range naik ditarik dari Swing Low $2,640 (1) ke Swing High $2,660 (0) dengan garis tengah 50% di $2,650. Klik zona paling sehat untuk antre Buy Limit (Discount + OTE)!',
      candles: [
        { o: 2641.2, h: 2642.8, l: 2640.0, c: 2642.4 },
        { o: 2642.4, h: 2645.8, l: 2642.0, c: 2645.4 },
        { o: 2645.4, h: 2649.2, l: 2645.0, c: 2648.8 },
        { o: 2648.8, h: 2652.8, l: 2648.4, c: 2652.4 },
        { o: 2652.4, h: 2656.6, l: 2652.0, c: 2656.2 },
        { o: 2656.2, h: 2660.0, l: 2655.8, c: 2659.2 },
        { o: 2659.2, h: 2659.6, l: 2656.4, c: 2656.8 },
        { o: 2656.8, h: 2657.4, l: 2654.0, c: 2654.4 },
        { o: 2654.4, h: 2654.8, l: 2651.4, c: 2651.8 },
        { o: 2651.8, h: 2652.2, l: 2648.8, c: 2649.2 },
        { o: 2649.2, h: 2649.8, l: 2647.2, c: 2647.6 },
        { o: 2647.6, h: 2648.0, l: 2645.9, c: 2646.8 },
        { o: 2646.8, h: 2648.8, l: 2646.4, c: 2648.4 },
        { o: 2648.4, h: 2651.4, l: 2648.0, c: 2651.0 },
        { o: 2651.0, h: 2654.0, l: 2650.6, c: 2653.6 },
        { o: 2653.6, h: 2656.2, l: 2653.2, c: 2655.8 }
      ],
      levels: [
        { price: 2650.0, label: '50% EQ ($2,650)', tone: 'muted', dashed: true, align: 'left' },
        { price: 2645.9, label: 'OTE 70.5% ($2,645.9)', tone: 'gold', dashed: true, align: 'left', labelPos: 'below' }
      ],
      proof: {
        zone: {
          fromIdx: 6.8,
          toIdx: 14.5,
          low: 2644.3,
          high: 2647.6,
          midPrice: 2645.9,
          label: 'OTE 61.8%–78.6%'
        },
        wickPin: { idx: 11, which: 'low', label: '70.5% ($2,645.9)', labelOffsetX: 12 }
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A (Premium)',
          fromIdx: 6.8,
          toIdx: 14.5,
          low: 2651.4,
          high: 2659.8,
          isCorrect: false,
          feedback: 'Belum tepat. Area A berada di atas 50% Equilibrium ($2,650), artinya masih zona mahal (Premium). Membeli di sini membuat jarak SL terlalu jauh dan rawan tersapu koreksi.'
        },
        {
          id: 'B',
          label: 'Area B (OTE Discount)',
          fromIdx: 6.8,
          toIdx: 14.5,
          low: 2644.2,
          high: 2647.8,
          isCorrect: true,
          feedback: 'Tepat! Area B ($2,644.3–$2,647.6) adalah zona Discount sekaligus Sweet Spot OTE (61,8%–78,6%, titik manis 70,5% di $2,645.9)—harga murah dengan SL struktural ketat dan R:R terbaik.'
        },
        {
          id: 'C',
          label: 'Area C (Di Bawah SL)',
          fromIdx: 6.8,
          toIdx: 14.5,
          low: 2639.4,
          high: 2642.2,
          isCorrect: false,
          feedback: 'Belum tepat. Jika harga sudah menembus ke bawah Swing Low $2,640 (Level 1), struktur bullish batal (Invalidation)—bukan tempat antre Buy lagi.'
        }
      ]
    },
    {
      id: 'drill-bab25-ict2022-entry',
      lessonId: 'model-sweep-mss-fvg',
      stepLabel: 'Bab 25',
      timeframe: 'M5',
      symbol: 'XAU/USD',
      title: 'Latihan Mata: Pilih Titik Entry Limit ICT 2022 Paling Ideal',
      prompt: 'Lengkap sudah: (1) Sweep SSL di $2,642, (2) Displacement + MSS di atas $2,647 sambil mencetak FVG. Di area mana kamu menaruh Buy Limit yang disiplin sesuai SOP ICT 2022?',
      candles: [
        { o: 2647.8, h: 2648.2, l: 2645.4, c: 2646.0 },
        { o: 2646.0, h: 2646.8, l: 2644.6, c: 2645.2 },
        { o: 2645.2, h: 2647.0, l: 2644.8, c: 2646.6 },
        { o: 2646.6, h: 2646.9, l: 2643.8, c: 2644.4 },
        { o: 2644.4, h: 2645.0, l: 2642.2, c: 2643.2 },
        { o: 2643.2, h: 2645.2, l: 2641.2, c: 2644.8 },
        { o: 2644.8, h: 2646.4, l: 2644.4, c: 2646.0 },
        { o: 2646.0, h: 2651.2, l: 2645.8, c: 2650.8 },
        { o: 2650.8, h: 2653.0, l: 2649.4, c: 2652.4 },
        { o: 2652.4, h: 2653.2, l: 2650.6, c: 2651.0 },
        { o: 2651.0, h: 2651.4, l: 2649.2, c: 2649.6 },
        { o: 2649.6, h: 2650.0, l: 2647.6, c: 2649.4 },
        { o: 2649.4, h: 2652.2, l: 2649.0, c: 2651.8 },
        { o: 2651.8, h: 2654.0, l: 2651.4, c: 2653.4 },
        { o: 2653.4, h: 2655.2, l: 2653.0, c: 2654.6 },
        { o: 2654.6, h: 2656.0, l: 2654.2, c: 2655.6 }
      ],
      levels: [
        { price: 2647.0, label: 'MSS $2,647', tone: 'bull', dashed: true, align: 'left' },
        { price: 2642.0, label: 'SSL $2,642', tone: 'gold', dashed: true, align: 'left' }
      ],
      proof: {
        fvg: {
          c1Idx: 6,
          c3Idx: 8,
          type: 'bull',
          extendToIdx: 15,
          showCE: true,
          ceLabel: 'FVG 50% CE'
        },
        wickPin: {
          idx: 5,
          which: 'low',
          label: 'SSL Sweep $2,641.2',
          tone: 'gold',
          labelOffsetX: 22
        }
      },
      hotspots: [
        {
          id: 'A',
          label: 'Area A (Kejar Pucuk)',
          fromIdx: 7.8,
          toIdx: 10.0,
          low: 2650.4,
          high: 2653.6,
          isCorrect: false,
          feedback: 'Belum tepat. Masuk di Area A berarti kamu mengejar candle hijau di pucuk (FOMO)—SL harus terlalu lebar ke bawah $2,641 dan langsung kena floating merah saat pullback.'
        },
        {
          id: 'B',
          label: 'Area B (FVG Pullback)',
          fromIdx: 10.4,
          toIdx: 12.6,
          low: 2646.4,
          high: 2649.4,
          isCorrect: true,
          feedback: 'Tepat! Area B adalah retracement bersih masuk ke dalam Bullish FVG ($2,646.4–$2,649.4) tepat setelah Sweep + MSS. Antre Buy Limit di sini memberi SL aman di bawah ujung Sweep dengan R:R optimal!'
        },
        {
          id: 'C',
          label: 'Area C (Ujung Sweep)',
          fromIdx: 4.1,
          toIdx: 6.1,
          low: 2640.8,
          high: 2644.4,
          isCorrect: false,
          feedback: 'Belum tepat. Area C adalah titik saat Sweep baru terjadi (sebelum ada konfirmasi MSS) sekaligus lokasi penempatan Stop Loss struktural kita—bukan titik entry model ICT 2022.'
        }
      ]
    }
  ];

  const DRILL_BY_LESSON = new Map();
  const DRILL_BY_ID = new Map();
  for (const drill of CHART_DRILLS) {
    DRILL_BY_LESSON.set(drill.lessonId, drill);
    DRILL_BY_ID.set(drill.id, drill);
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getDrillForLesson(lessonId) {
    return DRILL_BY_LESSON.get(String(lessonId || '')) || null;
  }

  function getDrillById(drillId) {
    return DRILL_BY_ID.get(String(drillId || '')) || null;
  }

  function getGuidedTopicForLesson(lessonId) {
    const topicId = LESSON_TO_GUIDED_TOPIC[String(lessonId || '')];
    return topicId ? (GUIDED_TOPICS[topicId] || null) : null;
  }

  function buildGuidedPracticeHref(lessonId, opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    const base = 'trading-practice/guided-practice.html';
    const params = [];
    if (options.mistakesOnly) {
      params.push('mode=mistakes');
      if (lessonId) params.push('fromLesson=' + encodeURIComponent(String(lessonId)));
      return params.length ? `${base}?${params.join('&')}` : base;
    }
    const topic = options.topic || LESSON_TO_GUIDED_TOPIC[String(lessonId || '')];
    if (topic && GUIDED_TOPICS[topic]) {
      params.push('topic=' + encodeURIComponent(topic));
    }
    if (lessonId) {
      params.push('fromLesson=' + encodeURIComponent(String(lessonId)));
    }
    return params.length ? `${base}?${params.join('&')}` : base;
  }

  function summarizeGuidedMastery(rawMap) {
    const map = rawMap && typeof rawMap === 'object' && !Array.isArray(rawMap) ? rawMap : {};
    let totalAttempted = 0;
    let totalMastered = 0;
    let totalMistakes = 0;
    for (const rec of Object.values(map)) {
      if (!rec || typeof rec !== 'object') continue;
      if (Number(rec.attempts) > 0) {
        totalAttempted += 1;
        if (rec.lastCorrect === true) totalMastered += 1;
        else if (rec.lastCorrect === false) totalMistakes += 1;
      }
    }
    return { totalAttempted, totalMastered, totalMistakes };
  }

  function readGuidedMasterySummary() {
    try {
      if (typeof localStorage === 'undefined') return { totalAttempted: 0, totalMastered: 0, totalMistakes: 0 };
      const raw = JSON.parse(localStorage.getItem(GUIDED_MASTERY_KEY) || '{}');
      return summarizeGuidedMastery(raw);
    } catch {
      return { totalAttempted: 0, totalMastered: 0, totalMistakes: 0 };
    }
  }

  function loadSolvedDrillIds() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(id => DRILL_BY_ID.has(String(id)));
    } catch {
      return [];
    }
  }

  function saveSolvedDrillId(drillId) {
    if (!DRILL_BY_ID.has(String(drillId || ''))) return loadSolvedDrillIds();
    const list = loadSolvedDrillIds();
    if (!list.includes(drillId)) {
      list.push(drillId);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
      } catch {
        // Ignore storage quota errors
      }
    }
    return list;
  }

  /**
   * Pure SVG Candlestick + Clickable Hotspot Renderer (zero DOM dependency).
   * @param {object} drill
   * @param {{ selectedId?: string|null, solved?: boolean }} [opts]
   */
  function renderChartDrillSvg(drill, opts) {
    if (!drill || !Array.isArray(drill.candles) || drill.candles.length === 0) return '';
    const state = opts && typeof opts === 'object' ? opts : {};
    const selectedId = state.selectedId || null;

    const W = 640;
    const H = 268;
    const padL = 16;
    const padR = 76;
    const padT = 18;
    const padB = 22;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    let minP = Infinity;
    let maxP = -Infinity;
    for (const c of drill.candles) {
      if (c.l < minP) minP = c.l;
      if (c.h > maxP) maxP = c.h;
    }
    if (Array.isArray(drill.levels)) {
      for (const lv of drill.levels) {
        if (lv.price < minP) minP = lv.price;
        if (lv.price > maxP) maxP = lv.price;
      }
    }
    if (Array.isArray(drill.hotspots)) {
      for (const hs of drill.hotspots) {
        if (hs.low < minP) minP = hs.low;
        if (hs.high > maxP) maxP = hs.high;
      }
    }
    const span = Math.max(2, maxP - minP);
    const padP = span * 0.1;
    const pMin = minP - padP;
    const pMax = maxP + padP;

    const n = drill.candles.length;
    const stepX = plotW / n;
    const idxToX = (idx) => padL + (idx + 0.5) * stepX;
    const priceToY = (p) => padT + ((pMax - p) / (pMax - pMin)) * plotH;

    const r1 = (v) => Number(v.toFixed(1));

    // Horizontal grid & price axis ticks (4 intervals)
    let gridHtml = '';
    for (let i = 0; i <= 4; i += 1) {
      const frac = i / 4;
      const y = r1(padT + frac * plotH);
      const price = pMax - frac * (pMax - pMin);
      gridHtml += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" class="acd-drill-grid" />`;
      gridHtml += `<text x="${W - padR + 8}" y="${r1(y + 4)}" class="acd-drill-axis">${price.toFixed(1)}</text>`;
    }

    // Reference price levels (lines behind candles, label pills above candles for 100% legibility)
    let levelLinesHtml = '';
    let levelLabelsHtml = '';
    for (const lv of (drill.levels || [])) {
      const y = r1(priceToY(lv.price));
      const tone = esc(lv.tone || 'muted');
      const dash = lv.dashed !== false ? ' stroke-dasharray="5 4"' : '';
      levelLinesHtml += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" class="acd-drill-level is-${tone}"${dash} />`;
      const pillW = Math.min(180, Math.max(66, lv.label.length * 6.5 + 14));
      const isRight = lv.align === 'right';
      const isBelow = lv.labelPos === 'below';
      const pillX = isRight ? r1(W - padR - pillW - 6) : (padL + 6);
      const pillY = isBelow ? r1(y + 2.5) : r1(y - 16);
      const textX = isRight ? r1(pillX + pillW - 6) : (padL + 12);
      const anchor = isRight ? ' text-anchor="end"' : '';
      levelLabelsHtml += `<rect x="${pillX}" y="${pillY}" width="${r1(pillW)}" height="15" rx="4" class="acd-drill-level-pill is-${tone}" />`;
      levelLabelsHtml += `<text x="${textX}" y="${r1(pillY + 11)}"${anchor} class="acd-drill-level-text is-${tone}">${esc(lv.label)}</text>`;
    }

    // TradingView-density Candles (74% body ratio so Close->Open continuity reads cleanly)
    const bodyW = Math.max(8, Math.min(28, stepX * 0.74));
    let candlesHtml = '';
    drill.candles.forEach((c, idx) => {
      const cx = r1(idxToX(idx));
      const yH = r1(priceToY(c.h));
      const yL = r1(priceToY(c.l));
      const yO = r1(priceToY(c.o));
      const yC = r1(priceToY(c.c));
      const isBull = c.c >= c.o;
      const top = Math.min(yO, yC);
      const bh = Math.max(2, Math.abs(yC - yO));
      const cls = isBull ? 'is-bull' : 'is-bear';
      candlesHtml += `<line x1="${cx}" y1="${yH}" x2="${cx}" y2="${yL}" class="acd-drill-wick ${cls}" />`;
      candlesHtml += `<rect x="${r1(cx - bodyW / 2)}" y="${r1(top)}" width="${r1(bodyW)}" height="${r1(bh)}" rx="1" class="acd-drill-body ${cls}" />`;
    });

    // Post-answer visual proof overlay (revealed ONLY once user answers or solved, never before)
    let proofBackHtml = '';
    let proofFrontHtml = '';
    const revealProof = Boolean(selectedId || state.solved);
    if (revealProof && drill.proof && drill.proof.fvg) {
      const pf = drill.proof.fvg;
      const c1 = drill.candles[pf.c1Idx];
      const c3 = drill.candles[pf.c3Idx];
      if (c1 && c3) {
        const isBear = pf.type === 'bear';
        const lowP = isBear ? c3.h : c1.h;
        const highP = isBear ? c1.l : c3.l;
        if (highP > lowP) {
          const xC1 = r1(idxToX(pf.c1Idx));
          const xC3 = r1(idxToX(pf.c3Idx));
          const xEnd = pf.extendToIdx != null ? r1(Math.min(W - padR - 4, idxToX(pf.extendToIdx) + bodyW / 2)) : r1(W - padR - 4);
          const yTop = r1(priceToY(highP));
          const yBot = r1(priceToY(lowP));
          const ceY = r1(priceToY((highP + lowP) / 2));
          const yC1Wick = isBear ? yTop : yBot;
          const yC3Wick = isBear ? yBot : yTop;

          proofBackHtml += `<rect x="${xC1}" y="${yTop}" width="${r1(Math.max(10, xEnd - xC1))}" height="${r1(Math.max(4, yBot - yTop))}" rx="2" class="acd-drill-proof-zone" />`;
          proofBackHtml += `<line x1="${xC1}" y1="${ceY}" x2="${xEnd}" y2="${ceY}" class="acd-drill-proof-ce" />`;

          proofFrontHtml += `<g class="acd-drill-proof">
            <line x1="${xC1}" y1="${yC1Wick}" x2="${r1(xC3 + bodyW / 2 + 10)}" y2="${yC1Wick}" class="acd-drill-proof-wickline" />
            <line x1="${r1(xC1 - bodyW / 2 - 4)}" y1="${yC3Wick}" x2="${r1(xC3 + bodyW / 2 + 10)}" y2="${yC3Wick}" class="acd-drill-proof-wickline" />
            <circle cx="${xC1}" cy="${yC1Wick}" r="6.5" class="acd-drill-proof-ring" />
            <circle cx="${xC3}" cy="${yC3Wick}" r="6.5" class="acd-drill-proof-ring" />
            ${pf.ceLabel ? `<rect x="${r1(xEnd - 96)}" y="${r1(ceY - 14)}" width="94" height="13" rx="3" class="acd-drill-level-pill" /><text x="${r1(xEnd - 4)}" y="${r1(ceY - 4.5)}" text-anchor="end" class="acd-drill-level-text is-gold">${esc(pf.ceLabel)}</text>` : ''}
          </g>`;
        }
      }
    }
    if (revealProof && drill.proof && drill.proof.zone) {
      const pz = drill.proof.zone;
      const x1 = r1(Math.max(padL + 4, idxToX(pz.fromIdx)));
      const x2 = r1(Math.min(W - padR - 4, idxToX(pz.toIdx)));
      const yTop = r1(priceToY(pz.high));
      const yBot = r1(priceToY(pz.low));
      proofBackHtml += `<g class="acd-drill-proof">
        <rect x="${x1}" y="${yTop}" width="${r1(Math.max(10, x2 - x1))}" height="${r1(Math.max(4, yBot - yTop))}" rx="3" class="acd-drill-proof-zone" />
        ${pz.midPrice != null ? `<line x1="${x1}" y1="${r1(priceToY(pz.midPrice))}" x2="${x2}" y2="${r1(priceToY(pz.midPrice))}" class="acd-drill-proof-ce" />` : ''}
      </g>`;
    }
    if (revealProof && drill.proof && drill.proof.wickPin) {
      const wp = drill.proof.wickPin;
      const target = drill.candles[wp.idx];
      if (target) {
        const cx = r1(idxToX(wp.idx));
        const cy = r1(priceToY(wp.which === 'high' ? target.h : target.l));
        const pillW = wp.label ? r1(Math.min(180, Math.max(76, wp.label.length * 6.3 + 14))) : 0;
        const offsetX = Number.isFinite(wp.labelOffsetX) ? wp.labelOffsetX : 32;
        const pillX = r1(Math.min(W - padR - pillW - 6, cx + offsetX));
        const pillY = r1(Math.max(padT + 4, Math.min(H - padB - 18, cy - 7)));
        proofFrontHtml += `<g class="acd-drill-proof">
          <circle cx="${cx}" cy="${cy}" r="7.5" class="acd-drill-proof-ring" />
          ${wp.label ? `<line x1="${r1(cx + 8)}" y1="${cy}" x2="${pillX}" y2="${cy}" class="acd-drill-proof-wickline" /><rect x="${pillX}" y="${pillY}" width="${pillW}" height="14.5" rx="3.5" class="acd-drill-level-pill is-gold" /><text x="${r1(pillX + 6)}" y="${r1(pillY + 10.2)}" class="acd-drill-level-text is-gold">${esc(wp.label)}</text>` : ''}
        </g>`;
      }
    }
    if (revealProof && drill.proof && Array.isArray(drill.proof.wickPins) && drill.proof.wickPins.length > 0) {
      const pts = [];
      let ringsMarkup = '';
      for (const wp of drill.proof.wickPins) {
        const target = drill.candles[wp.idx];
        if (!target) continue;
        const cx = r1(idxToX(wp.idx));
        const cy = r1(priceToY(wp.which === 'high' ? target.h : target.l));
        pts.push({ cx, cy });
        ringsMarkup += `<circle cx="${cx}" cy="${cy}" r="7" class="acd-drill-proof-ring" />`;
      }
      const lineMarkup = (drill.proof.connectLine && pts.length >= 2)
        ? `<line x1="${pts[0].cx}" y1="${pts[0].cy}" x2="${pts[pts.length - 1].cx}" y2="${pts[pts.length - 1].cy}" class="acd-drill-proof-wickline" />`
        : '';
      proofFrontHtml += `<g class="acd-drill-proof">${lineMarkup}${ringsMarkup}</g>`;
    }

    // Clickable hotspots overlaid cleanly
    let hotspotsHtml = '';
    for (const hs of (drill.hotspots || [])) {
      const x1 = r1(Math.max(padL + 2, idxToX(hs.fromIdx) - stepX * 0.2));
      const x2 = r1(Math.min(W - padR - 2, idxToX(hs.toIdx) + stepX * 0.2));
      const y1 = r1(Math.max(padT + 2, priceToY(hs.high)));
      const y2 = r1(Math.min(H - padB - 2, priceToY(hs.low)));
      const rw = r1(Math.max(38, x2 - x1));
      const rh = r1(Math.max(28, y2 - y1));

      let stateCls = '';
      if (selectedId) {
        if (selectedId === hs.id) {
          stateCls = hs.isCorrect ? ' is-correct' : ' is-wrong';
        } else if (state.solved && hs.isCorrect) {
          stateCls = ' is-correct';
        }
      } else if (state.solved && hs.isCorrect) {
        stateCls = ' is-correct';
      }

      const tagText = hs.id;
      hotspotsHtml += `<g class="acd-drill-hotspot${stateCls}" data-drill-choice="${esc(hs.id)}" role="button" tabindex="0" aria-label="Pilih ${esc(hs.label)} di chart">
        <rect x="${x1}" y="${y1}" width="${rw}" height="${rh}" rx="7" class="acd-drill-zone-rect" />
        <rect x="${r1(x1 + 4)}" y="${r1(y1 + 4)}" width="20" height="18" rx="4" class="acd-drill-badge-bg" />
        <text x="${r1(x1 + 14)}" y="${r1(y1 + 16.5)}" text-anchor="middle" class="acd-drill-badge-text">${esc(tagText)}</text>
      </g>`;
    }

    return `<svg class="acd-drill-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(drill.title)} (${esc(drill.symbol)} ${esc(drill.timeframe)})">
      <rect x="0" y="0" width="${W}" height="${H}" rx="10" class="acd-drill-bg" />
      ${gridHtml}
      ${levelLinesHtml}
      ${proofBackHtml}
      ${candlesHtml}
      ${proofFrontHtml}
      ${levelLabelsHtml}
      ${hotspotsHtml}
      <text x="${padL + 4}" y="${H - 6}" class="acd-drill-watermark">${esc(drill.symbol)} · ${esc(drill.timeframe)} · Ketuk area A / B / C langsung di chart</text>
    </svg>`;
  }

  return {
    STORAGE_KEY,
    GUIDED_MASTERY_KEY,
    GUIDED_TOPICS,
    LESSON_TO_GUIDED_TOPIC,
    CHART_DRILLS,
    getDrillForLesson,
    getDrillById,
    getGuidedTopicForLesson,
    buildGuidedPracticeHref,
    summarizeGuidedMastery,
    readGuidedMasterySummary,
    loadSolvedDrillIds,
    saveSolvedDrillId,
    renderChartDrillSvg
  };
});
