/* Amy FX Academy — Kamus Istilah Gold & ICT Klik Instan + Smart Paragraph Splitter
 * Pure UMD module (Browser window.AmyAcademyGlossary + Node module.exports)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AmyAcademyGlossary = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const CATEGORIES = Object.freeze([
    { id: 'all', label: 'Semua' },
    { id: 'dasar', label: 'Dasar Gold' },
    { id: 'struktur', label: 'Struktur & Liquidity' },
    { id: 'waktu', label: 'Waktu & Bias' },
    { id: 'pdarray', label: 'Zona Entry (PD Array)' },
    { id: 'eksekusi', label: 'Eksekusi & Risiko' },
    { id: 'lanjutan', label: 'ICT Lanjutan' }
  ]);

  // Urutan definisi istilah Gold & ICT lengkap dengan penjelasan bahasa awam + contoh nyata XAU/USD
  const TERMS = Object.freeze([
    // ── Dasar Gold ───────────────────────────────────────────────────────────
    {
      id: 'pips',
      term: 'Pips',
      fullName: 'Percentage in Point (Satuan Jarak Harga)',
      category: 'dasar',
      simple: 'Satuan ukur jarak gerak harga. Di Gold (XAU/USD), 1 pip = $0,10 dan $1,00 = 10 pips.',
      example: 'Gold naik dari 2.650,00 ke 2.655,00 = naik $5,00 atau 50 pips.',
      lessonId: 'bid-ask-spread-pips-gold',
      matchExact: ['Pips']
    },
    {
      id: 'spread',
      term: 'Spread',
      fullName: 'Selisih Harga Ask dan Bid',
      category: 'dasar',
      simple: 'Biaya transaksi broker berupa selisih tipis antara harga beli (Ask) dan harga jual (Bid). Itulah kenapa posisi baru dibuka langsung sedikit minus.',
      example: 'Bid 2.650,00 & Ask 2.650,30 berarti Spread = $0,30 (3 pips).',
      lessonId: 'bid-ask-spread-pips-gold',
      matchExact: ['Spread']
    },
    {
      id: 'lot',
      term: 'Lot',
      fullName: 'Ukuran Kontrak Transaksi',
      category: 'dasar',
      simple: 'Pengatur seberapa besar nilai uang per pip. Di Akun Standard Gold, 0.01 lot = $1 per gerak $1 (10 pips).',
      example: 'Modal $1.000, risiko 1% ($10), SL $5 → pakai 0.02 lot.',
      lessonId: 'lot-leverage-margin-equity',
      matchExact: []
    },
    {
      id: 'leverage',
      term: 'Leverage',
      fullName: 'Daya Ungkit Modal Broker',
      category: 'dasar',
      simple: 'Fasilitas broker agar modal kecil bisa membuka posisi dengan jaminan (Margin) lebih ringan. Leverage TIDAK memperkecil kerugian jika lot kegedean.',
      example: 'Leverage 1:500 membuat jaminan 0.01 lot Gold hanya sekitar $5,30.',
      lessonId: 'lot-leverage-margin-equity',
      matchExact: ['Leverage']
    },
    {
      id: 'margin',
      term: 'Margin',
      fullName: 'Uang Jaminan Sementara Transaksi',
      category: 'dasar',
      simple: 'Dana yang ditahan sementara oleh broker selama posisimu terbuka, lalu dikembalikan otomatis saat posisi ditutup.',
      example: 'Saat posisi ditutup, Margin kembali ke Free Margin akunmu.',
      lessonId: 'lot-leverage-margin-equity',
      matchExact: ['Free Margin']
    },
    {
      id: 'equity',
      term: 'Equity',
      fullName: 'Nilai Riil Akun Saat Ini',
      category: 'dasar',
      simple: 'Balance ditambah atau dikurangi profit/rugi posisi yang masih berjalan (floating). Inilah saldo asli akunmu detik ini.',
      example: 'Balance $1.000 tapi floating -$30 berarti Equity = $970.',
      lessonId: 'lot-leverage-margin-equity',
      matchExact: ['Equity']
    },
    {
      id: 'ohlc',
      term: 'OHLC',
      fullName: 'Open, High, Low, Close',
      category: 'dasar',
      simple: 'Empat harga wajib dalam satu candle: harga buka (Open), tertinggi (High), terendah (Low), dan harga tutup (Close).',
      example: 'Candle M15 baru sah dibaca sebagai BOS kalau Close-nya sudah lewat garis.',
      lessonId: 'membaca-chart-candlestick-nol',
      matchExact: ['OHLC']
    },
    {
      id: 'swap',
      term: 'Swap',
      fullName: 'Biaya Inap Posisi Lewat Ganti Hari (Rollover)',
      category: 'dasar',
      simple: 'Biaya (atau bunga) yang dikenakan broker jika kamu menahan posisi terbuka melewati jam pergantian hari pasar (sekitar 05:00/06:00 WITA). Malam Rabu ke Kamis biasanya kena Triple Swap (3× lipat).',
      example: 'Trader intraday yang selalu menutup posisi sebelum ganti hari tidak terkena biaya Swap.',
      lessonId: 'bid-ask-spread-pips-gold',
      matchExact: ['Swap', 'Triple Swap']
    },
    {
      id: 'komisi-raw',
      term: 'Komisi / Raw Spread',
      fullName: 'Biaya Tetap per Lot pada Akun Raw / ECN',
      category: 'dasar',
      simple: 'Akun Raw/ECN memberikan Spread jauh lebih tipis daripada Akun Standard, tetapi memotong komisi tetap per lot (misal $6–$7 per 1.00 lot pulang-pergi).',
      example: 'Di akun Raw, 0.01 lot Gold hanya terkena komisi sekitar $0,07 dengan spread lebih ramping.',
      lessonId: 'bid-ask-spread-pips-gold',
      matchExact: ['Raw / ECN', 'Raw Spread']
    },
    {
      id: 'slippage',
      term: 'Slippage',
      fullName: 'Geseran Harga Eksekusi Saat Pasar Loncat',
      category: 'dasar',
      simple: 'Selisih antara harga yang kamu ketik (entry atau Stop Loss) dengan harga eksekusi nyata di pasar ketika volatilitas meledak — biasanya saat berita besar USD atau pembukaan Senin.',
      example: 'SL dipasang di 2.650,00 tetapi saat detik rilis NFP harga meloncat ke 2.652,00 sehingga tereksekusi di 2.652,00.',
      lessonId: 'bid-ask-spread-pips-gold',
      matchExact: ['Slippage']
    },
    {
      id: 'margin-call',
      term: 'Margin Call / Stop Out',
      fullName: 'Peringatan & Penutupan Paksa Akun Broker',
      category: 'dasar',
      simple: 'Margin Call adalah peringatan saat Equity menipis akibat floating minus besar; Stop Out adalah penutupan paksa posisi oleh broker saat Margin Level menyentuh batas minimum.',
      example: 'Bisa dicegah 100% jika selalu memakai risiko maksimal 1% per transaksi dan memasang Stop Loss.',
      lessonId: 'lot-leverage-margin-equity',
      matchExact: ['Margin Call', 'Stop Out']
    },
    {
      id: 'rollover',
      term: 'Rollover',
      fullName: 'Jam Pergantian Hari Pasar Global (17:00 NY)',
      category: 'waktu',
      simple: 'Jeda tipis pergantian hari pasar dunia (sekitar 05:00 WITA EDT / 06:00 WITA EST) saat bank tutup buku — Spread Gold melebar drastis dan biaya Swap dihitung.',
      example: 'Hindari membuka transaksi baru pada jam 04:00–07:00 WITA karena spread tidak wajar.',
      lessonId: 'karakter-xauusd-spread-wita',
      matchExact: ['Rollover']
    },

    // ── Struktur & Liquidity ─────────────────────────────────────────────────
    {
      id: 'bos',
      term: 'BOS',
      fullName: 'Break of Structure',
      category: 'struktur',
      simple: 'Tanda tren masih lanjut: Body candle ditutup penuh melewati Swing High (tren naik) atau Swing Low (tren turun) sebelumnya.',
      example: 'M15 close penuh di atas Swing High 2.660 → BOS Bullish valid.',
      lessonId: 'bos-valid-vs-sweep-palsu',
      matchExact: ['BOS']
    },
    {
      id: 'mss',
      term: 'MSS',
      fullName: 'Market Structure Shift',
      category: 'struktur',
      simple: 'Sinyal perubahan arah tren dari turun ke naik (atau sebaliknya) yang ditandai Body Close keras menembus swing lawan pasca-Sweep.',
      example: 'Setelah sweep Asia Low, M5 melesat menembus Swing High terakhir → MSS Bullish.',
      lessonId: 'cisd-vs-mss-sinyal-awal',
      matchExact: ['MSS']
    },
    {
      id: 'cisd',
      term: 'CISD',
      fullName: 'Change in State of Delivery',
      category: 'pdarray',
      simple: 'Sinyal balik arah paling dini (lebih cepat dari MSS): Body Close menembus harga Open rangkaian candle terakhir yang melakukan Sweep.',
      example: 'Harga sweep PDL lalu 1 candle hijau close di atas Open candle merah terakhir → Bullish CISD.',
      lessonId: 'cisd-vs-mss-sinyal-awal',
      matchExact: ['CISD']
    },
    {
      id: 'liquidity',
      term: 'Liquidity',
      fullName: 'Kumpulan Order Lawan (Bahan Bakar Pasar)',
      category: 'struktur',
      simple: 'Area tempat ribuan Stop Loss dan order breakout ritel menumpuk. Institusi butuh area ini sebagai lawan transaksi untuk mengisi posisi besarnya.',
      example: 'Di atas puncak Double Top (EQH) menumpuk banyak SL Seller.',
      lessonId: 'bsl-dan-ssl-liquidity',
      matchExact: []
    },
    {
      id: 'sweep',
      term: 'Liquidity Sweep',
      fullName: 'Sapuan Stop Loss / Breakout Palsu',
      category: 'struktur',
      simple: 'Harga menusuk sedikit melewati High/Low lama dengan wick untuk mengambil Stop Loss, lalu Body-nya tutup kembali di dalam range.',
      example: 'Wick tembus PDH 2.670 sampai 2.672, tapi close di 2.668 → Sweep valid.',
      lessonId: 'bos-valid-vs-sweep-palsu',
      matchExact: ['Liquidity Sweep']
    },
    {
      id: 'bsl',
      term: 'BSL',
      fullName: 'Buy-Side Liquidity',
      category: 'struktur',
      simple: 'Kumpulan order BUY di atas puncak (SL trader Sell + Buy Stop trader breakout). Jadi magnet harga naik atau bahan bakar reversal turun.',
      example: 'BSL kuat di Gold biasanya ada di atas PDH, PWH, Asia High, atau EQH.',
      lessonId: 'bsl-dan-ssl-liquidity',
      matchExact: ['BSL']
    },
    {
      id: 'ssl',
      term: 'SSL',
      fullName: 'Sell-Side Liquidity',
      category: 'struktur',
      simple: 'Kumpulan order SELL di bawah lembah (SL trader Buy + Sell Stop trader breakout). Jadi magnet harga turun atau bahan bakar reversal naik.',
      example: 'SSL kuat di Gold biasanya ada di bawah PDL, PWL, Asia Low, atau EQL.',
      lessonId: 'bsl-dan-ssl-liquidity',
      matchExact: ['SSL']
    },
    {
      id: 'eqh-eql',
      term: 'EQH / EQL',
      fullName: 'Equal Highs / Equal Lows',
      category: 'struktur',
      simple: 'Dua atau lebih puncak/lembah yang berhenti nyaris sejajar (Double Top/Bottom rapi). Bukan tembok kuat, melainkan magnet Stop Loss tebal.',
      example: 'Dua puncak M15 di 2.665,10 dan 2.665,30 membentuk EQH yang rawan di-sweep.',
      lessonId: 'bsl-dan-ssl-liquidity',
      matchExact: ['EQH', 'EQL']
    },
    {
      id: 'pdh-pdl',
      term: 'PDH / PDL',
      fullName: 'Previous Day High / Previous Day Low',
      category: 'struktur',
      simple: 'Harga tertinggi dan terendah hari perdagangan kemarin (reset tiap 17:00 NY). Level harian paling rutin diburu sesi London & New York.',
      example: 'Jika PDH masih Fresh, sering jadi target TP atau titik Sweep harian.',
      lessonId: 'bsl-dan-ssl-liquidity',
      matchExact: ['PDH', 'PDL']
    },
    {
      id: 'pwh-pwl',
      term: 'PWH / PWL',
      fullName: 'Previous Week High / Previous Week Low',
      category: 'struktur',
      simple: 'Harga tertinggi dan terendah minggu lalu. Magnet Liquidity makro paling kuat untuk arah swing dan target besar.',
      example: 'Saat Gold sudah menembus PDH, magnet besar berikutnya sering mengarah ke PWH.',
      lessonId: 'bsl-dan-ssl-liquidity',
      matchExact: ['PWH', 'PWL']
    },
    {
      id: 'dealing-range',
      term: 'Dealing Range',
      fullName: 'Kotak Arena Pergerakan Harga Aktif',
      category: 'struktur',
      simple: 'Rentang dari titik asal dorongan (Strong Point) sampai ujung gelombangnya (Weak Point) setelah terjadi BOS valid.',
      example: 'Dari Dealing Range inilah kita mengukur garis 50% Equilibrium, Discount, dan Premium.',
      lessonId: 'internal-external-dealing-range',
      matchExact: ['Dealing Range']
    },
    {
      id: 'erl',
      term: 'ERL',
      fullName: 'External Range Liquidity',
      category: 'struktur',
      simple: 'Liquidity di batas luar Dealing Range (Swing High atas & Swing Low bawah). Harga bergerak bolak-balik antara ERL dan IRL.',
      example: 'Setelah harga mengambil IRL (FVG di dalam range), target berikutnya adalah ERL.',
      lessonId: 'internal-external-dealing-range',
      matchExact: ['ERL']
    },
    {
      id: 'irl',
      term: 'IRL',
      fullName: 'Internal Range Liquidity',
      category: 'struktur',
      simple: 'Area Imbalance (FVG) atau swing minor yang berada di dalam kotak Dealing Range. Tempat harga retrace sebelum lanjut ke ERL.',
      example: 'Setelah tembus ERL atas, harga sering mundur dulu menjemput IRL (FVG Discount).',
      lessonId: 'internal-external-dealing-range',
      matchExact: ['IRL']
    },
    {
      id: 'liquidity-run',
      term: 'Liquidity Run',
      fullName: 'Liquidity Run vs Sweep (Purge & Revert)',
      category: 'struktur',
      simple: 'Tembusan level likuiditas (BSL/SSL) yang dilanjutkan ekspansi searah HTF Bias menuju DOL lebih jauh — kebalikan dari Liquidity Sweep (Purge & Revert) yang hanya menyapu SL lalu berbalik dengan CISD/MSS.',
      example: 'Pada hari Bullish menuju PDH, tembusan Asia High dengan Body Close penuh adalah Liquidity Run, bukan sinyal Sell counter-trend.',
      lessonId: 'inducement-idm-umpan-ritel',
      matchExact: ['Liquidity Run', 'Purge & Revert', 'Stop Hunt']
    },

    // ── Waktu & Bias ─────────────────────────────────────────────────────────
    {
      id: 'dol',
      term: 'DOL',
      fullName: 'Draw on Liquidity (Magnet Tujuan Harga)',
      category: 'waktu',
      simple: 'Target utama ke mana harga sedang ditarik hari ini (bisa ke Liquidity Pool Fresh atau ke FVG/OB HTF yang belum terisi).',
      example: 'Kalau PDL baru di-sweep keras, DOL bergeser ke atas menuju Asia High atau PDH.',
      lessonId: 'level-likuiditas-kunci-xauusd',
      matchExact: ['DOL']
    },
    {
      id: 'amd',
      term: 'AMD / PO3',
      fullName: 'Accumulation, Manipulation, Distribution (Power of Three)',
      category: 'waktu',
      simple: 'Siklus 3 fase harian ICT: Asia diam menyusun range (A), London/NY awal gerak palsu menjebak (M), lalu meluncur ke arah asli (D).',
      example: 'Pada hari Bullish, harga sering turun dulu di bawah NY Midnight Open (Manipulation) sebelum naik tinggi.',
      lessonId: 'siklus-amd-judas-swing',
      matchExact: ['AMD', 'PO3', 'Judas Swing']
    },
    {
      id: 'killzone',
      term: 'Killzone',
      fullName: 'Jam Emas Volume Institusional',
      category: 'waktu',
      simple: 'Jendela jam aktif London & New York saat bank besar masuk pasar, sehingga Sweep dan Displacement paling bersih terjadi.',
      example: 'NY AM Killzone di WITA = 19:00–22:00 (EDT) atau 20:00–23:00 (EST).',
      lessonId: 'jadwal-killzone-wita-silver-bullet',
      matchExact: ['Killzone', 'Silver Bullet']
    },
    {
      id: 'htf-ltf',
      term: 'HTF / LTF',
      fullName: 'Higher Timeframe / Lower Timeframe',
      category: 'waktu',
      simple: 'HTF = timeframe besar (Daily, H4, H1) untuk menentukan peta arah; LTF = timeframe kecil (M15, M5, M1) untuk konfirmasi entry presisi.',
      example: 'Cek Bias & POI di H1/M15 (HTF), lalu tunggu MSS & entry di M5 (LTF).',
      lessonId: 'multi-timeframe-h1-m15-m5',
      matchExact: ['HTF', 'LTF']
    },

    // ── Zona Entry (PD Arrays) ───────────────────────────────────────────────
    {
      id: 'pd-array',
      term: 'PD Array',
      fullName: 'Premium / Discount Array (Zona Referensi ICT)',
      category: 'pdarray',
      simple: 'Nama payung untuk semua zona penting tempat institusi bereaksi: FVG, iFVG, Order Block, Breaker Block, Mitigation Block, dan BPR.',
      example: 'Untuk Buy, pilih PD Array yang berada di area Discount (< 50% Dealing Range).',
      lessonId: 'premium-discount-equilibrium',
      matchExact: ['PD Array', 'PD Arrays']
    },
    {
      id: 'poi',
      term: 'POI',
      fullName: 'Point of Interest (Area Tunggu Entry)',
      category: 'pdarray',
      simple: 'Satu atau dua zona terbaik (OB/FVG/BB/iFVG) yang sudah kamu tandai untuk menunggu harga datang — bukan mengejar harga di tengah jalan.',
      example: 'Tandai POI Bullish FVG M15 di Discount, lalu tunggu harga retrace ke sana.',
      lessonId: 'fvg-bisi-sibi-ce-50',
      matchExact: ['POI']
    },
    {
      id: 'displacement',
      term: 'Displacement',
      fullName: 'Dorongan Kuat Jejak Institusi',
      category: 'pdarray',
      simple: 'Gerakan cepat dengan body candle panjang-tebal yang langsung menembus struktur dan meninggalkan celah FVG. Bukti uang besar benar-benar masuk.',
      example: 'Berbeda dengan harga merayap pelan, Displacement melesat $5–$8 dalam 1–3 candle M5.',
      lessonId: 'displacement-jejak-institusi',
      matchExact: ['Displacement']
    },
    {
      id: 'fvg',
      term: 'FVG',
      fullName: 'Fair Value Gap (Imbalance 3 Candle)',
      category: 'pdarray',
      simple: 'Celah kosong antara wick Candle 1 dan wick Candle 3 akibat dorongan cepat Candle 2. Harga sering mundur sejenak ke sini sebelum lanjut.',
      example: 'BISI = Bullish FVG (area Buy); SIBI = Bearish FVG (area Sell).',
      lessonId: 'fvg-bisi-sibi-ce-50',
      matchExact: ['FVG', 'BISI', 'SIBI']
    },
    {
      id: 'ce',
      term: 'CE (50%)',
      fullName: 'Consequent Encroachment (Titik Tengah 50% FVG)',
      category: 'pdarray',
      simple: 'Garis tepat di tengah (50%) kotak FVG atau wick panjang. Dipakai sebagai titik entry presisi sekaligus pengukur apakah FVG masih dihormati.',
      example: 'Wick menyentuh 50% CE lalu body tutup di atasnya = reaksi Bullish FVG sangat sehat.',
      lessonId: 'fvg-bisi-sibi-ce-50',
      matchExact: ['50% CE', 'Consequent Encroachment']
    },
    {
      id: 'ifvg',
      term: 'iFVG',
      fullName: 'Inversion Fair Value Gap',
      category: 'pdarray',
      simple: 'FVG lawan yang gagal menahan harga dan dijebol penuh oleh Body Close, lalu berubah fungsi (flip) menjadi pijakan entry ke arah sebaliknya.',
      example: 'Bearish FVG ditembus close ke atas pasca-Sweep SSL → berubah jadi Bullish iFVG (+iFVG).',
      lessonId: 'model-ifvg-inversion',
      matchExact: ['iFVG']
    },
    {
      id: 'ob',
      term: 'OB',
      fullName: 'Order Block',
      category: 'pdarray',
      simple: 'Candle (atau rangkaian candle) berlawanan terakhir yang melakukan sweep Liquidity tepat sebelum melahirkan Displacement kuat dan FVG.',
      example: 'Candle merah terakhir sebelum harga melesat naik menembus struktur = Bullish OB.',
      lessonId: 'order-block-valid-mean-threshold',
      matchExact: ['OB', 'Order Block']
    },
    {
      id: 'mt',
      term: 'Mean Threshold',
      fullName: 'Titik Tengah 50% Body Order Block (MT)',
      category: 'pdarray',
      simple: 'Garis 50% yang diukur khusus dari Body (Open ke Close) sebuah Order Block — bukan termasuk wick. Berguna memperketat SL saat OB lebar.',
      example: 'Jika Open OB 2.650 dan Close OB 2.646, maka 50% MT = 2.648,00.',
      lessonId: 'order-block-valid-mean-threshold',
      matchExact: ['Mean Threshold']
    },
    {
      id: 'bb',
      term: 'Breaker Block (BB)',
      fullName: 'Order Block Gagal yang Berbalik Arah',
      category: 'pdarray',
      simple: 'Order Block yang terbentuk setelah Sweep lalu langsung dijebol balik keras oleh Displacement. Sering jadi zona pantulan paling agresif (A+).',
      example: 'Digabung dengan FVG di koordinat yang sama, Breaker Block membentuk ICT Unicorn.',
      lessonId: 'breaker-mitigation-unicorn',
      matchExact: ['Breaker Block', 'Unicorn']
    },
    {
      id: 'ote',
      term: 'OTE',
      fullName: 'Optimal Trade Entry (61,8% – 78,6% Fib)',
      category: 'pdarray',
      simple: 'Zona masuk "harga murah" paling manis di dalam area Discount/Premium berdasarkan Fibonacci retracement (titik manis di 70,5%).',
      example: 'FVG atau OB yang jatuh tepat di zona OTE 62%–79% punya R:R jauh lebih besar.',
      lessonId: 'premium-discount-equilibrium',
      matchExact: ['OTE']
    },
    {
      id: 'discount-premium',
      term: 'Discount / Premium',
      fullName: 'Area Murah (<50%) vs Area Mahal (>50%)',
      category: 'pdarray',
      simple: 'Pembagian Dealing Range di garis tengah 50% (Equilibrium). Aturan disiplin: cari BUY hanya di Discount (bawah 50%), cari SELL hanya di Premium (atas 50%).',
      example: 'Menghindari kebiasaan pemula beli di pucuk (Premium) atau jual di dasar (Discount).',
      lessonId: 'premium-discount-equilibrium',
      matchExact: ['Equilibrium']
    },

    // ── Eksekusi & Risiko ────────────────────────────────────────────────────
    {
      id: 'rr',
      term: 'R:R',
      fullName: 'Risk to Reward Ratio',
      category: 'eksekusi',
      simple: 'Perbandingan jarak risiko (SL) terhadap target profit (TP). Dengan R:R minimal 1:2, menang 40% saja akun tetap profit.',
      example: 'Risiko SL $10 (1R) dengan target TP $25 = R:R 1 : 2,5.',
      lessonId: 'sl-struktural-napas-spread-tp',
      matchExact: ['R:R']
    },
    {
      id: 'bep',
      term: 'BEP',
      fullName: 'Breakeven Point (SL di Harga Entry)',
      category: 'eksekusi',
      simple: 'Menggeser Stop Loss ke titik entry (+ sedikit biaya spread) setelah harga membuktikan struktur baru agar posisi bebas risiko.',
      example: 'Jangan geser BEP terlalu cepat saat profit baru +0,5R agar tidak tersentuh wick napas Gold.',
      lessonId: 'manajemen-trade-partial-bep-notrade',
      matchExact: ['BEP']
    },
    {
      id: 'smr',
      term: 'SMR / Turtle Soup',
      fullName: 'Smart Money Reversal',
      category: 'eksekusi',
      simple: 'Model entry agresif tepat pasca-Sweep level HTF kunci (PDH/PDL/PWH/PWL) begitu muncul sinyal reversal dini seperti CISD/iFVG.',
      example: 'Hanya dipakai setelah paham betul lokasi HTF POI dan konfirmasi penolakan nyata.',
      lessonId: 'model-turtle-soup-smr',
      matchExact: ['Turtle Soup', 'SMR']
    },

    // ── ICT Lanjutan ─────────────────────────────────────────────────────────
    {
      id: 'bpr',
      term: 'BPR',
      fullName: 'Balanced Price Range',
      category: 'lanjutan',
      simple: 'Area irisan (overlap) antara Bullish FVG dan Bearish FVG yang saling bertumpuk. Jadi magnet sekaligus benteng reaksi sangat kuat.',
      example: 'Saat harga kembali menyentuh kotak irisan BPR di NY AM, reaksi pantulannya sangat presisi.',
      lessonId: 'bpr-nwog-ndog-imbalance',
      matchExact: ['BPR']
    },
    {
      id: 'nwog-ndog',
      term: 'NWOG / NDOG',
      fullName: 'New Week / New Day Opening Gap',
      category: 'lanjutan',
      simple: 'Celah antara harga penutupan Jumat→pembukaan Minggu (NWOG) atau penutupan harian 17:00→18:00 NY (NDOG). Sering bertindak sebagai magnet & support/resistance tersembunyi.',
      example: 'Tandai kotak NWOG 3–5 minggu terakhir di chart Gold sebagai referensi HTF.',
      lessonId: 'bpr-nwog-ndog-imbalance',
      matchExact: ['NWOG', 'NDOG']
    },
    {
      id: 'smt',
      term: 'SMT',
      fullName: 'Smart Money Technique (Divergence Antar Aset)',
      category: 'lanjutan',
      simple: 'Ketidaksepakatan antara 2 aset berkorelasi (Gold vs Silver, atau Gold vs DXY) di jam yang sama — membocorkan jejak manipulasi institusi.',
      example: 'Gold mencetak Lower Low (sweep SSL), tapi Silver gagal membuat Lower Low di jam yang sama → Bullish SMT.',
      lessonId: 'smt-divergence-gold',
      matchExact: ['SMT']
    },
    {
      id: 'mmxm',
      term: 'MMXM',
      fullName: 'Market Maker Buy / Sell Model (MMBM / MMSM)',
      category: 'lanjutan',
      simple: 'Peta utuh satu siklus perjalanan harga: Konsolidasi Awal → Penurunan/Kenaikan ke HTF POI → Reversal (SMR) → Distribusi balik ke Konsolidasi Awal.',
      example: 'Membantu melihat posisi kita sekarang ada di sisi kiri kurva (menuju POI) atau sisi kanan (menuju target).',
      lessonId: 'mmxm-market-maker-model',
      matchExact: ['MMXM', 'MMBM', 'MMSM']
    },
    {
      id: 'ipda',
      term: 'IPDA',
      fullName: 'Interbank Price Delivery Algorithm (Lookback 20/40/60)',
      category: 'lanjutan',
      simple: 'Kerangka lihat-balik 20, 40, dan 60 hari perdagangan terakhir untuk menandai High/Low makro paling relevan yang masih diingat algoritma pasar.',
      example: 'Cek High/Low 20 hari perdagangan terakhir untuk peta target swing bulanan Gold.',
      lessonId: 'ict-macros-weekly-ipda',
      matchExact: ['IPDA']
    },
    {
      id: 'crt',
      term: 'CRT',
      fullName: 'Candle Range Theory',
      category: 'lanjutan',
      simple: 'Kerangka 3 candle HTF (Candle 1 = Range, Candle 2 = Sweep/Manipulasi 1 sisi, Candle 3 = Ekspansi ke sisi seberang) yang sejalan dengan AMD.',
      example: 'Candle H4 #2 melakukan sweep Low Candle #1 lalu tutup kembali di dalam → cari Buy di Candle #3.',
      lessonId: 'stdev-crt-profiling',
      matchExact: ['CRT']
    }
  ]);

  const termMap = new Map();
  const aliasMap = new Map();

  for (const item of TERMS) {
    termMap.set(item.id, item);
    aliasMap.set(item.id.toLowerCase(), item);
    aliasMap.set(item.term.toLowerCase(), item);
    for (const m of item.matchExact || []) {
      aliasMap.set(m.toLowerCase(), item);
    }
  }

  // Build single regex sorted longest-first for safe inline annotation
  const exactTokenPairs = [];
  for (const item of TERMS) {
    for (const tok of item.matchExact || []) {
      exactTokenPairs.push({ tok, id: item.id });
    }
  }
  exactTokenPairs.sort((a, b) => b.tok.length - a.tok.length);

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const INLINE_MATCH_RE = exactTokenPairs.length
    ? new RegExp(
        `(?<![A-Za-z0-9_/-])(${exactTokenPairs.map((p) => escapeRegex(p.tok)).join('|')})(?![A-Za-z0-9_])`,
        'g'
      )
    : null;

  const TOKEN_TO_ID = new Map(exactTokenPairs.map((p) => [p.tok, p.id]));

  function lookupTerm(key) {
    const clean = String(key || '').trim();
    if (!clean) return null;
    return termMap.get(clean) || aliasMap.get(clean.toLowerCase()) || null;
  }

  function filterGlossary(query, category) {
    const cat = String(category || 'all').trim().toLowerCase();
    const q = String(query || '').trim().toLowerCase();
    return TERMS.filter((item) => {
      if (cat && cat !== 'all' && item.category !== cat) return false;
      if (!q) return true;
      const hay = `${item.term} ${item.fullName} ${item.simple} ${item.example} ${(item.matchExact || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }

  /**
   * Annotate already-escaped + markdown-formatted HTML by wrapping the FIRST occurrence
   * of each recognized ICT term/acronym per paragraph in a clickable <button>.
   * Strictly skips HTML tags, <code>...</code> spans, and existing <button> elements.
   */
  function annotateTermsHtml(safeHtml) {
    if (!safeHtml || !INLINE_MATCH_RE) return String(safeHtml || '');
    const seenIds = new Set();
    // Tokenize into HTML tags / code spans / plain text chunks
    const chunks = String(safeHtml).split(/(<code\b[^>]*>[\s\S]*?<\/code>|<button\b[^>]*>[\s\S]*?<\/button>|<[^>]+>)/gi);
    return chunks
      .map((chunk) => {
        if (!chunk || chunk.startsWith('<')) return chunk;
        return chunk.replace(INLINE_MATCH_RE, (matched) => {
          const id = TOKEN_TO_ID.get(matched);
          if (!id || seenIds.has(id)) return matched;
          seenIds.add(id);
          const item = termMap.get(id);
          const titleAttr = item ? `${item.term} — ${item.fullName}` : matched;
          const escTitle = titleAttr.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
          return `<button type="button" class="acd-term-btn" data-glossary-term="${id}" title="${escTitle}" aria-label="Lihat arti istilah ${escTitle}">${matched}</button>`;
        });
      })
      .join('');
  }

  /**
   * Split long dense paragraphs into crisp, book-like readable blocks without
   * mutating underlying data or breaking markdown/numbers/quotes.
   * Returns an array of blocks: { type: 'p', text } | { type: 'list', items: string[] }
   */
  function splitReadableParagraph(rawText, options) {
    const text = String(rawText || '').trim();
    if (!text) return [];
    const opts = options || {};
    const maxLen = Math.max(200, Number(opts.maxLen) || 285);
    const minChunk = Math.max(45, Number(opts.minChunk) || 65);

    // 1. Detect inline numbered list inside a single paragraph: "1. **...** ... 2. **...**"
    const numberedListMatch = text.match(/^(.*?)(?:^|\s)1\.\s+([\s\S]+)$/);
    if (numberedListMatch && /\s2\.\s+/.test(text)) {
      const lead = (numberedListMatch[1] || '').trim();
      const rest = `1. ${numberedListMatch[2]}`.trim();
      const items = rest
        .split(/(?:^|\s)(?=\d+\.\s+(?:\*\*|[A-Z]))/)
        .map((s) => s.replace(/^\d+\.\s+/, '').trim())
        .filter(Boolean);
      if (items.length >= 2) {
        const blocks = [];
        if (lead) blocks.push({ type: 'p', text: lead });
        blocks.push({ type: 'list', items });
        return blocks;
      }
    }

    // Short/medium paragraphs stay untouched
    if (text.length <= maxLen) {
      return [{ type: 'p', text }];
    }

    // 2. Find safe sentence boundaries (ignore decimals, abbreviations, inside **bold** or quotes)
    const boundaries = [];
    let inBold = false;
    let inCode = false;
    let parenDepth = 0;
    let quoteOpen = false;

    for (let i = 0; i < text.length - 1; i += 1) {
      const ch = text[i];
      const next = text[i + 1];
      if (ch === '`') {
        inCode = !inCode;
        continue;
      }
      if (inCode) continue;
      if (ch === '*' && next === '*') {
        inBold = !inBold;
        i += 1;
        continue;
      }
      if (ch === '(') parenDepth += 1;
      else if (ch === ')' && parenDepth > 0) parenDepth -= 1;
      else if (ch === '"') quoteOpen = !quoteOpen;

      if (inBold || parenDepth > 0 || quoteOpen) continue;

      if ((ch === '.' || ch === '!' || ch === '?') && next === ' ') {
        // Avoid splitting after decimal/abbreviations like "mis." or "No." or "1."
        const before = text.slice(Math.max(0, i - 6), i + 1);
        if (/(?:mis|dll|dsb|dst|no|dr|mr|vs|s\.d)\.$|\b\d+\.$/i.test(before)) continue;
        // Check that after space starts a new sentence (capital, **bold**, quote, digit)
        const after = text.slice(i + 2, i + 5);
        if (!/^(?:\*\*|"|“|\*|[A-Z0-9])/.test(after)) continue;
        boundaries.push(i + 1);
      }
    }

    if (!boundaries.length) {
      return [{ type: 'p', text }];
    }

    // Partition greedily into balanced chunks <= maxLen (or split near midpoint for 2-way split)
    const targetParts = text.length > maxLen * 1.85 ? 3 : 2;
    const idealStep = text.length / targetParts;
    const result = [];
    let start = 0;

    for (let part = 1; part < targetParts; part += 1) {
      const idealPos = idealStep * part;
      let best = -1;
      let bestDist = Infinity;
      for (const b of boundaries) {
        if (b - start < minChunk) continue;
        if (text.length - b < minChunk) continue;
        const dist = Math.abs(b - idealPos);
        if (dist < bestDist) {
          bestDist = dist;
          best = b;
        }
      }
      if (best > start) {
        result.push(text.slice(start, best).trim());
        start = best;
      }
    }

    const tail = text.slice(start).trim();
    if (tail) result.push(tail);

    return result.filter(Boolean).map((p) => ({ type: 'p', text: p }));
  }

  return Object.freeze({
    CATEGORIES,
    TERMS,
    lookupTerm,
    filterGlossary,
    annotateTermsHtml,
    splitReadableParagraph
  });
});
