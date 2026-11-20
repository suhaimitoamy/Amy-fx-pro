/* Amy FX Academy — Level 1 & Level 2 (Pelajaran 1–10)
 * Kurikulum Zero to Scalper ICT XAU/USD (Standar Waktu WITA)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AmyAcademyPart1 = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const LEVELS = [
    {
      id: 1,
      code: 'Level 01',
      title: 'Fondasi Nol & Anatomi XAU/USD',
      tagline: 'Pahami mekanisme profit dua arah, bahasa candlestick, karakter spread Gold, dan struktur pasar dari nol.'
    },
    {
      id: 2,
      code: 'Level 02',
      title: 'Struktur & Peta Likuiditas',
      tagline: 'Berhenti jadi mangsa Stop Loss: bedakan BOS asli vs sweep palsu dan petakan kolam likuiditas BSL/SSL.'
    }
  ];

  const LESSONS = [
    // ═══════════════════════════════════════════════════════════════
    // LEVEL 1 — FONDASI NOL & ANATOMI XAU/USD
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'logika-trading-probabilitas',
      number: 1,
      levelId: 1,
      title: 'Logika Trading Dua Arah & Probabilitas',
      readMinutes: 4,
      diagramId: 'two-way-probability',
      summary: 'Trading bukan menebak arah dengan kepastian 100%, melainkan mengeksekusi keunggulan probabilitas dengan risiko terukur di arah naik (Buy) maupun turun (Sell).',
      conceptBlocks: [
        {
          heading: 'Trading Dua Arah: Untung Saat Naik Maupun Turun',
          paragraphs: [
            'Di pasar derivatif XAU/USD (Gold), kamu tidak harus menunggu harga naik untuk menghasilkan profit. Saat analisis menunjukkan harga akan naik, kamu membuka posisi Buy (Long). Saat analisis menunjukkan harga akan turun, kamu membuka posisi Sell (Short) — ibarat menjual lebih dulu di harga mahal lalu menutupnya kembali di harga lebih murah.',
            'Perbedaan terbesar antara penjudi dan scalper profesional ada pada cara berpikir sebelum menekan tombol. Pemula bertanya "berapa profit kalau benar?", sedangkan profesional selalu bertanya "di titik mana analisis ini terbukti salah dan berapa kerugian maksimal yang siap saya terima?".'
          ]
        },
        {
          heading: 'Bisnis Probabilitas, Bukan Ramalan',
          paragraphs: [
            'Bahkan setup ICT kualitas A+ tidak punya win rate 100%. Dengan win rate 50% saja dan rasio Risk:Reward (R:R) minimal 1:2, setiap 10 trade (5 menang +10R, 5 kalah -5R) menghasilkan profit bersih +5R. Konsistensi lahir dari mengulang satu keunggulan statistik yang sama secara disiplin, bukan menghindari kekalahan secara mutlak.'
          ]
        }
      ],
      validRules: [
        'Setiap posisi memiliki titik invalidasi (Stop Loss) yang ditentukan sebelum klik entry.',
        'Target profit minimal 1:2 R:R terhadap jarak risiko struktural.',
        'Menilai hasil strategi dari kumpulan 20–30 trade, bukan dari 1 hasil menang atau kalah.'
      ],
      invalidRules: [
        'Masuk pasar hanya karena feeling atau candle terlihat kencang tanpa peta SL/TP.',
        'Menggeser Stop Loss menjauh ketika posisi mulai floating minus.',
        'Langsung mengganti strategi hanya karena mengalami 2–3 loss beruntun.'
      ],
      xauScenario: {
        context: 'Simulasi sederhana pada XAU/USD dengan risiko tetap $10 per trade (1R) dan target $20 (2R).',
        steps: [
          'Trade 1: Loss (-$10 / -1R) karena sweep lanjutan. Tetap tenang, jangan balas dendam.',
          'Trade 2: Win (+$20 / +2R) di sesi London. Akun langsung pulih dan surplus +$10.',
          'Trade 3: Loss (-$10 / -1R) di sesi NY. Saldo kembali impas.',
          'Trade 4: Win (+$20 / +2R) setelah konfirmasi M5 rapi. Total 4 trade (50% WR) = bersih +$20 (+2R).'
        ]
      },
      goldenRules: [
        'Tugas utama bulan pertama adalah bertahan hidup dan menjaga modal, bukan menggandakan akun.',
        'Diam tidak entry saat pasar tidak jelas adalah keputusan trading tingkat tinggi.'
      ],
      quiz: [
        {
          question: 'Seorang scalper memiliki Win Rate 45% dengan rata-rata R:R 1:2,5. Dalam 20 trade (9 Win, 11 Loss), bagaimana hasil akhirnya?',
          options: [
            'Rugi karena lebih sering kalah daripada menang',
            'Profit bersih +11,5R karena nilai kemenangan jauh lebih besar dari kerugian',
            'Impas (Break Even) karena di bawah 50%',
            'Tidak bisa dihitung tanpa indikator RSI'
          ],
          answerIndex: 1,
          explanation: '9 Win × 2,5R = +22,5R dikurangi 11 Loss × 1R = -11R, menghasilkan profit bersih +11,5R meski Win Rate di bawah 50%.'
        },
        {
          question: 'Apa pertanyaan pertama yang wajib dijawab trader profesional sebelum klik Buy atau Sell?',
          options: [
            'Berapa lot maksimal agar cepat balik modal?',
            'Di level mana analisis ini batal (Stop Loss) dan berapa risiko yang siap diterima?',
            'Apakah berita media sosial sedang bullish?',
            'Berapa pips target terjauh hari ini?'
          ],
          answerIndex: 1,
          explanation: 'Risiko adalah satu-satunya variabel yang 100% bisa kamu kendalikan sebelum posisi terbuka.'
        },
        {
          question: 'Dalam posisi Sell (Short) di XAU/USD pada harga 2.650, kapan kamu mendapatkan profit?',
          options: [
            'Saat harga naik ke 2.660',
            'Saat harga turun di bawah 2.650 (misal ke 2.640)',
            'Saat harga diam di 2.650 selama 1 jam',
            'Hanya jika akun memiliki emas fisik'
          ],
          answerIndex: 1,
          explanation: 'Posisi Sell (Short) memperoleh keuntungan dari selisih penurunan harga di bawah titik entry.'
        }
      ]
    },
    {
      id: 'membaca-candlestick-body-wick',
      number: 2,
      levelId: 1,
      title: 'Membaca Candlestick: Body vs Wick (Sumbu)',
      readMinutes: 5,
      diagramId: 'candlestick-anatomy',
      summary: 'Di dalam metodologi ICT, body candle menunjukkan niat nyata institusi sedangkan wick (sumbu) sering kali hanyalah jejak penyapuan likuiditas.',
      conceptBlocks: [
        {
          heading: 'Anatomi 4 Harga Dalam Satu Lilin',
          paragraphs: [
            'Setiap candlestick merekam pertempuran antara pembeli dan penjual dalam satu satuan waktu (misal 5 menit di M5 atau 15 menit di M15). Empat titik utamanya adalah Open (harga buka), Close (harga tutup), High (puncak tertinggi), dan Low (dasar terendah).',
            'Bagian tebal di antara Open dan Close disebut Body (Badan). Garis tipis yang menjulur di atas atau bawah body disebut Wick / Shadow (Sumbu).'
          ]
        },
        {
          heading: 'Hukum Emas ICT: Body Tells the Story, Wick Does the Damage',
          paragraphs: [
            'Pemula sering panik melihat harga menusuk garis level dengan sumbu panjang, lalu buru-buru menganggap harga sudah breakout. Padahal dalam ICT, yang menentukan arah penutupan adalah Body Close.',
            'Sumbu panjang yang menembus High/Low lalu ditarik masuk kembali (rejection) adalah tanda penolakan keras — harga hanya "mengambil bahan bakar" di luar level sebelum berbalik. Sebaliknya, body besar yang menutup penuh dengan sedikit sumbu menunjukkan Displacement (dorongan serius institusi).'
          ]
        }
      ],
      validRules: [
        'Tunggu candle benar-benar tutup (Close) sebelum menilai apakah sebuah level ditembus atau ditolak.',
        'Candle body penuh berukuran besar (minimal 2x rata-rata candle sebelumnya) menandakan dorongan dominan.',
        'Wick panjang di puncak/dasar level kunci menunjukkan penyerapan order (absorption / rejection).'
      ],
      invalidRules: [
        'Mengambil keputusan saat candle masih berjalan (belum close) karena takut ketinggalan.',
        'Menghafal puluhan nama pola candlestick Jepang tanpa melihat lokasi level likuiditas.',
        'Menganggap penembusan tipis oleh wick saja sebagai breakout valid.'
      ],
      xauScenario: {
        context: 'Chart M5 XAU/USD mendekati Previous Day Low (PDL) pada sesi London.',
        steps: [
          'Menit ke-2: Harga anjlok cepat menembus PDL sebesar $2,50 — trader breakout langsung klik Sell.',
          'Menit ke-5 (Close): Harga ditarik naik tajam dan ditutup kembali DI ATAS PDL, menyisakan ekor bawah panjang.',
          'Pembacaan ICT: Tidak ada Body Close di bawah PDL. Ekor panjang tersebut adalah bukti Sweep (penyapuan SL buyer) dan sinyal awal persiapan Buy.'
        ]
      },
      goldenRules: [
        'Jangan pernah menilai bentuk candle sebelum waktu penutupannya selesai.',
        'Sumbu (wick) merusak Stop Loss ritel; badan (body) menunjukkan arah algoritma.'
      ],
      quiz: [
        {
          question: 'Harga menembus level Resistance dengan sumbu panjang, tetapi body candle ditutup kembali di bawah Resistance. Apa maknanya dalam kacamata ICT?',
          options: [
            'Breakout bullish yang sangat kuat',
            'Liquidity Sweep / penolakan — belum ada konfirmasi tembus valid',
            'Pasar sedang libur akhir pekan',
            'Wajib langsung pasang Buy Stop di atas wick'
          ],
          answerIndex: 1,
          explanation: 'Tanpa Body Close melewati level, tusukan wick hanyalah pengambilan likuiditas dan penolakan harga.'
        },
        {
          question: 'Apa ciri utama candle yang menunjukkan niat dorongan institusi (Displacement)?',
          options: [
            'Candle doji kecil berderet dengan sumbu panjang di kedua sisi',
            'Body besar dan tegas, menutup dekat ujung ekstrem dengan sedikit sumbu lawan',
            'Candle warna abu-abu dengan volume nol',
            'Sumbu atas 4 kali lebih panjang dari body saat bullish'
          ],
          answerIndex: 1,
          explanation: 'Body besar dan tegas menunjukkan ketidakseimbangan agresif antara buyer dan seller.'
        },
        {
          question: 'Kapan waktu yang tepat untuk mengonfirmasi sebuah sinyal candle M5?',
          options: [
            'Di detik ke-10 saat harga sedang melonjak',
            'Tepat setelah candle M5 selesai menutup (Close)',
            'Menunggu akhir bulan',
            'Saat sumbu baru terbentuk setengah'
          ],
          answerIndex: 1,
          explanation: 'Bentuk candle bisa berubah total di 30 detik terakhir; hanya penutupan candle (Close) yang bersifat final.'
        }
      ]
    },
    {
      id: 'karakter-xauusd-spread-wita',
      number: 3,
      levelId: 1,
      title: 'Karakter XAU/USD, Spread & Jam Aktif WITA',
      readMinutes: 5,
      diagramId: 'xau-volatility-sessions',
      summary: 'Gold bukan pair forex biasa: volatilitas 150–300 pips per hari, sensitif terhadap DXY/berita USD, dan butuh toleransi napas spread agar tidak sering tersentuh SL palsu.',
      conceptBlocks: [
        {
          heading: 'Mengapa XAU/USD Sangat Menguntungkan Sekaligus Berbahaya',
          paragraphs: [
            'Rata-rata pergerakan harian (ADR) pasangan EUR/USD hanya sekitar 60–80 pips, sedangkan Gold (XAU/USD) bergerak 150 hingga 300 pips ($15–$30) di hari normal, bahkan bisa menembus $50+ saat berita CPI atau FOMC.',
            'Di Gold, 10 pips setara $1,00 per troy ounce (misal dari 2.650,00 ke 2.651,00). Karena ayunannya cepat, memasang Stop Loss sempit 5–10 pips di Gold sama saja menyerahkan modal ke fluktuasi spread dan noise.'
          ]
        },
        {
          heading: 'Peta Waktu Aktif XAU/USD (Standar WITA / UTC+8)',
          paragraphs: [
            'Jangan nongkrong 24 jam di depan chart. Volatilitas Gold terkonsentrasi pada tiga jendela utama waktu WITA: Sesi Asia (08:00–12:00 WITA, biasanya membentuk range/akumulasi), London Killzone (15:00/16:00–19:00 WITA, sering memicu manipulasi Judas Swing), dan New York AM Killzone (20:00–24:00 WITA, ekspansi terkuat sekaligus rilis data makro AS).',
            'Perhatikan pula spread broker (selisih harga Bid dan Ask). Pada akun standar/cent, spread XAU/USD berkisar $0,20–$0,45 (2–4,5 pips). Saat menempatkan SL Buy atau TP Sell, kamu wajib memperhitungkan napas spread agar order terjemput mulus.'
          ]
        }
      ],
      validRules: [
        'Fokus trading di jendela aktif WITA: London (15:00–19:00) atau NY AM (20:00–24:00).',
        'Tambahkan buffer napas spread ($0,40–$1,00) di luar ujung wick struktural saat pasang SL.',
        'Tahu jadwal penutupan akhir pekan Gold (Sabtu subuh hingga Senin pagi WITA) — hindari menahan posisi scalping lewat weekend.'
      ],
      invalidRules: [
        'Trading di jam mati rollover (05:00–07:00 WITA) saat spread melebar drastis.',
        'Memakai aturan SL kaku 10 pips dari forex biasa langsung ke XAU/USD.',
        'Mengabaikan arah DXY dan jadwal berita merah USD saat trading emas.'
      ],
      xauScenario: {
        context: 'Menghitung realitas Bid/Ask dan napas spread pada setup Sell XAU/USD.',
        steps: [
          'Swing High manipulasi M5 berada di 2.662,40. Jangan taruh SL pas di 2.662,40.',
          'Karena posisi Sell ditutup menggunakan harga Ask (Bid + Spread ~$0,35), tambahkan buffer aman di 2.663,20.',
          'Untuk TP Sell di area SSL 2.652,00, naikkan sedikit menjadi 2.652,50 agar harga Ask pasti menyentuh TP meski chart Bid hanya menyentuh tipis 2.652,15.'
        ]
      },
      goldenRules: [
        'Hargai napas spread: naikkan sedikit TP Sell dan beri ruang ekstra di luar wick untuk SL.',
        'Gold menghormati jam sesi — 80% uang bergerak di jendela London & NY WITA.'
      ],
      quiz: [
        {
          question: 'Pergerakan XAU/USD dari 2.650,00 ke 2.660,00 setara dengan berapa dolar per troy ounce dan berapa pips standar Gold?',
          options: [
            '$1,00 atau 10 pips',
            '$10,00 atau 100 pips',
            '$100,00 atau 1.000 pips',
            '$0,10 atau 1 pip'
          ],
          answerIndex: 1,
          explanation: 'Selisih $10,00 di XAU/USD (dari 2.650 ke 2.660) setara dengan 100 pips (1.000 poin di broker 2 desimal).'
        },
        {
          question: 'Mengapa TP pada posisi SELL di XAU/USD disarankan dinaikkan sedikit (+$0,40 hingga +$0,50) dari level target pas?',
          options: [
            'Agar risiko bertambah besar',
            'Karena posisi SELL ditutup menggunakan harga Ask (lebih tinggi dari garis Bid di chart)',
            'Karena broker melarang angka bulat',
            'Supaya posisi selalu terkena Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Chart biasanya menampilkan harga Bid. Posisi Sell baru tertutup saat harga Ask menyentuh TP, sehingga buffer spread mencegah TP gagal terjemput tipis.'
        },
        {
          question: 'Jam manakah dalam waktu WITA yang paling berbahaya untuk membuka posisi scalping karena pelebaran spread rollover?',
          options: [
            '20:30 – 22:30 WITA',
            '16:00 – 18:00 WITA',
            '05:00 – 07:00 WITA (pergantian hari broker)',
            '09:00 – 11:00 WITA'
          ],
          answerIndex: 2,
          explanation: 'Saat pergantian hari server/rollover (sekitar 05:00–07:00 WITA), likuiditas bank menipis dan spread XAU/USD sering melebar ekstrem.'
        }
      ]
    },
    {
      id: 'struktur-pasar-dasar',
      number: 4,
      levelId: 1,
      title: 'Struktur Pasar Dasar (HH/HL, LH/LL & Konsolidasi)',
      readMinutes: 5,
      diagramId: 'market-structure-basic',
      summary: 'Sebelum mencari FVG atau Order Block, kamu wajib bisa membedakan dalam 3 detik apakah pasar sedang Uptrend, Downtrend, atau Ranging (Zona Cincang).',
      conceptBlocks: [
        {
          heading: 'Tiga Kondisi Pasar yang Wajib Dikenali',
          paragraphs: [
            'Struktur pasar adalah rangka tulang grafik. Hanya ada tiga kondisi di pasar: Bullish / Uptrend (membentuk puncak lebih tinggi Higher High [HH] dan lembah lebih tinggi Higher Low [HL]), Bearish / Downtrend (membentuk puncak lebih rendah Lower High [LH] dan lembah lebih rendah Lower Low [LL]), serta Ranging / Konsolidasi (harga memantul bolak-balik di dalam kotak sempit tanpa mencetak HH atau LL baru).',
            'Kesalahan fatal pemula adalah menerapkan strategi tren di tengah pasar konsolidasi (zona cincang). Saat pasar ranging, breakout palsu terjadi berulang kali di kedua sisi.'
          ]
        },
        {
          heading: 'Cara Menentukan Swing High & Swing Low Objektif',
          paragraphs: [
            'Agar tidak menandai terlalu banyak riak kecil, gunakan definisi fraktal 3-candle: sebuah Swing High valid terbentuk jika satu candle puncak diapit oleh candle lebih rendah di kiri dan di kanannya. Sebaliknya, Swing Low valid diapit oleh candle lebih tinggi di kiri dan kanannya.',
            'Selama Higher Low utama pada Uptrend belum ditembus oleh Body Close ke bawah, tren naik secara teknis masih utuh. Jangan melompat melawan tren utama hanya karena muncul satu candle merah besar.'
          ]
        }
      ],
      validRules: [
        'Uptrend terkonfirmasi jika harga konsisten mencetak HH dan HL dengan Body Close bersih.',
        'Downtrend terkonfirmasi jika harga konsisten mencetak LH dan LL.',
        'Saat pasar di tengah kotak ranging, tunggu harga menyapu tepi luar kotak (ekstrem) alih-alih entry di tengah.'
      ],
      invalidRules: [
        'Mencoba menebak pucuk Sell saat struktur H1/M15 terus mencetak HH dan HL tanpa bukti pembalikan.',
        'Entry di tengah-tengah range konsolidasi (50% zona cincang).',
        'Menandai setiap 1 candle kecil sebagai struktur utama.'
      ],
      xauScenario: {
        context: 'Membaca tren pagi hari XAU/USD di timeframe H1.',
        steps: [
          'Tandai 2 Swing High dan 2 Swing Low terakhir yang jelas di H1.',
          'Jika Low terbaru lebih tinggi dari Low sebelumnya (HL) dan High terbaru menembus High sebelumnya (HH), maka kerangka utama hari ini adalah Bullish.',
          'Fokus utama: tunggu pullback ke bawah (Discount) untuk mencari peluang Buy, bukan mengejar Buy di pucuk HH.'
        ]
      },
      goldenRules: [
        'Ikuti arus struktur utama — berenang searah arus jauh lebih mudah daripada melawan arus.',
        'Tengah-tengah konsolidasi adalah Zona Larangan Trade (No-Trade Zone).'
      ],
      quiz: [
        {
          question: 'Rangkaian puncak dan lembah manakah yang menandakan pasar sedang dalam kondisi Downtrend (Bearish)?',
          options: [
            'Higher High (HH) dan Higher Low (HL)',
            'Lower High (LH) dan Lower Low (LL)',
            'Equal High (EQH) dan Equal Low (EQL)',
            'Higher High (HH) dan Lower Low (LL) acak'
          ],
          answerIndex: 1,
          explanation: 'Downtrend ditandai kegagalan harga membentuk puncak lebih tinggi (LH) diikuti penembusan dasar baru yang lebih rendah (LL).'
        },
        {
          question: 'Apa syarat fraktal 3-candle untuk menandai sebuah Swing Low yang objektif?',
          options: [
            'Satu candle warna hijau di tengah dua candle merah',
            'Satu candle dengan titik terendah (Low) lebih rendah dibanding candle tepat di kiri dan kanannya',
            'Tiga candle berurutan dengan ukuran sama persis',
            'Candle yang menyentuh garis Moving Average 200'
          ],
          answerIndex: 1,
          explanation: 'Definisi fraktal 3-candle menghilangkan subjektivitas saat menandai swing penting di chart.'
        },
        {
          question: 'Di area mana trader scalper paling sering terkena whipsaw (bolak-balik kena SL)?',
          options: [
            'Setelah sweep di tepi luar kotak range',
            'Di tengah-tengah range konsolidasi tanpa arah jelas',
            'Di area Discount saat struktur H1 bullish kuat',
            'Setelah konfirmasi displacement M5 searah H1'
          ],
          answerIndex: 1,
          explanation: 'Area tengah konsolidasi adalah zona cincang (equilibrium) tempat likuiditas belum tersapu dan arah belum diputuskan.'
        }
      ]
    },
    {
      id: 'multi-timeframe-h1-m15-m5',
      number: 5,
      levelId: 1,
      title: 'Multi-Timeframe Scalper: Alur H1 → M15 → M5',
      readMinutes: 5,
      diagramId: 'mtf-alignment',
      summary: 'Scalper bukan berarti hanya melototi M1. Kerangka profesional membagi tugas tegas: H1 untuk Arah & Target, M15 untuk Area Setup (POI), dan M5 untuk Pemicu Entry.',
      conceptBlocks: [
        {
          heading: 'Analogi Peta Negara, Peta Kota, dan Zoom Jalan',
          paragraphs: [
            'Banyak pemula tersesat karena langsung membuka M1/M5. Melihat chart M1 saja ibarat menyetir hanya melihat 5 meter aspal di depan bemper tanpa tahu apakah 100 meter lagi jalan buntu atau jurang.',
            'Di Amy FX Pro, seluruh modul Mapping dan Academy memakai sistem 3 lapisan yang bersih: H1 (Peta Arah & Target Likuiditas Utama), M15 (Zona Tunggu / Point of Interest tempat institusi bereaksi), dan M5 (Kaca Pembesar Konfirmasi Entry). Kamu tidak wajib turun ke M1.'
          ]
        },
        {
          heading: 'Hukum Prioritas Timeframe (HTF Selalu Menang)',
          paragraphs: [
            'Timeframe besar (HTF) selalu lebih kuat daripada timeframe kecil (LTF). Sebuah setup Sell M5 yang terlihat super rapi akan hancur seketika jika posisinya tepat menabrak zona Demand / Order Block Bullish di H1.',
            'Selaraskan minimal 2 dari 3 lapisan: ketahui dulu ke mana magnet harga H1 bergerak (Draw on Liquidity), tunggu harga tiba di zona M15, lalu baru turun ke M5 untuk menunggu Sweep dan perubahan arah.'
          ]
        }
      ],
      validRules: [
        'H1 menentukan Bias arah dan target eksternal (PDH/PDL, H1 BSL/SSL).',
        'M15 menentukan zona POI (FVG/OB/Asia High-Low) tempat kita mulai bersiaga.',
        'M5 digunakan murni untuk pemicu eksekusi (Sweep + MSS/CISD) agar SL tetap rapi dan R:R tinggi.'
      ],
      invalidRules: [
        'Langsung mencari entry di M5/M1 tanpa mengecek lokasi harga terhadap struktur H1.',
        'Memakai terlalu banyak timeframe sekaligus (W1, D1, H4, H2, H1, M30, M15, M5, M3, M1) hingga bingung sendiri.',
        'Mengambil counter-trend M5 tepat di depan tembok POI H1 yang masih fresh.'
      ],
      xauScenario: {
        context: 'Alur kerja 3 langkah sebelum klik entry XAU/USD.',
        steps: [
          'Cek H1 (1 menit): Struktur H1 Bullish, harga baru saja koreksi masuk ke area Discount H1, target atas di PDH.',
          'Cek M15 (1 menit): Tandai FVG Bullish M15 atau Asia Low sebagai zona tunggu. Jangan klik apa pun sebelum harga masuk zona ini.',
          'Cek M5 (Eksekusi): Setelah harga menyentuh zona M15, tunggu M5 melakukan sweep + CISD/MSS ke atas, lalu pasang entry dengan SL di bawah low M5 dan target ke arah H1.'
        ]
      },
      goldenRules: [
        '3 Timeframe sudah cukup untuk hidup dari scalping Gold: H1 (Arah), M15 (Zona), M5 (Pemicu).',
        'Jika sinyal M5 bertabrakan dengan tembok POI H1, selalu menangkan H1 atau pilih diam.'
      ],
      quiz: [
        {
          question: 'Dalam sistem scalping H1 → M15 → M5, apa peran utama timeframe H1?',
          options: [
            'Menentukan detik persis klik tombol Buy',
            'Menentukan arah tren utama (Bias), Dealing Range, dan target likuiditas (Draw on Liquidity)',
            'Menghitung spread broker',
            'Mengganti kebutuhan Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'H1 memberikan gambaran peta besar agar scalper tidak menabrak tembok order institusi.'
        },
        {
          question: 'Kamu melihat setup Sell yang sangat rapi di M5, tetapi saat zoom out ke H1 harga ternyata baru saja menyentuh Bullish Order Block H1 yang fresh. Keputusan terbaik?',
          options: [
            'Tetap Sell dengan lot dua kali lipat',
            'Batalkan Sell — HTF selalu lebih kuat daripada LTF; tunggu peluang Buy atau diam',
            'Pindah ke timeframe M1 untuk mencari alasan Sell lain',
            'Hapus Stop Loss agar tidak tersentuh'
          ],
          answerIndex: 1,
          explanation: 'Order institusi di HTF (H1/H4) jauh lebih besar daripada sinyal pembalikan mikro di M5.'
        },
        {
          question: 'Mengapa scalper tetap turun ke M5 untuk pemicu entry alih-alih langsung klik di H1?',
          options: [
            'Supaya bisa entry 50 kali sehari',
            'Untuk mendapatkan konfirmasi pergeseran order flow lebih awal dan jarak Stop Loss lebih presisi (R:R lebih optimal)',
            'Karena chart H1 tidak memiliki candlestick',
            'Agar tidak perlu melihat sesi waktu'
          ],
          answerIndex: 1,
          explanation: 'Refinement di M5 memperkecil jarak risiko (SL) sambil mempertahankan target besar H1, sehingga R:R melonjak.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════
    // LEVEL 2 — STRUKTUR & PETA LIKUIDITAS
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'bos-valid-vs-sweep-palsu',
      number: 6,
      levelId: 2,
      title: 'BOS Valid vs Sweep Palsu (Breakout Trap)',
      readMinutes: 5,
      diagramId: 'bos-vs-sweep',
      summary: '90% pemula kalah karena tidak bisa membedakan Break of Structure (BOS) yang sungguhan melanjutkan tren dengan Liquidity Sweep yang justru membalikkan harga.',
      conceptBlocks: [
        {
          heading: 'Syarat Mutlak Break of Structure (BOS) Valid',
          paragraphs: [
            'Break of Structure (BOS) adalah bukti bahwa tren yang sedang berjalan benar-benar dilanjutkan oleh uang besar. Agar BOS dianggap valid, harga tidak boleh sekadar menusuk High/Low sebelumnya dengan sumbu tipis.',
            'BOS valid mensyaratkan penutupan badan candle (Body Close) yang tegas melewati ujung Swing High (saat bullish) atau Swing Low (saat bearish), idealnya disertai momentum candle yang kuat (Displacement).'
          ]
        },
        {
          heading: 'Anatomi Sweep Palsu (Jebakan Breakout Ritel)',
          paragraphs: [
            'Ketika harga hanya melampaui Swing High/Low dengan ekor panjang lalu ditutup kembali di dalam rentang lama, itu BUKAN BOS — itu adalah Liquidity Sweep (Raid).',
            'Institusi sengaja mendorong harga melewati level yang mudah dilihat publik agar Stop Loss dan order breakout ritel terpicu semua, lalu menggunakan likuiditas tersebut untuk menggerakkan harga ke arah berlawanan.'
          ]
        }
      ],
      validRules: [
        'BOS Valid: Body candle penuh ditutup melampaui Swing High/Low sebelumnya.',
        'Didukung candle berbadan kuat (bukan 1 doji ragu-ragu yang nyaris menyentuh garis).',
        'Terjadi searah dengan arus timeframe lebih besar (H1/M15).'
      ],
      invalidRules: [
        'Hanya sumbu (wick) yang melewati swing lalu ditutup kembali di dalam range (ini Sweep, bukan BOS).',
        'Candle menembus sangat tipis lalu candle berikutnya langsung menelan balik penuh ke arah berlawanan.',
        'Mengejar entry breakout tepat setelah candle raksasa sudah melesat jauh dari zona asal.'
      ],
      xauScenario: {
        context: 'XAU/USD M15 mendekati puncak Asia High di 2.658,00.',
        steps: [
          'Skenario A (BOS Valid): Candle M15 melesat dan menutup body penuh di 2.660,20 meninggalkan FVG bullish. Tren naik lanjut — tunggu pullback untuk Buy.',
          'Skenario B (Sweep Palsu): Harga menusuk ke 2.659,80 lalu sebelum menit ke-15 selesai ditarik turun dan ditutup di 2.656,90 (di bawah Asia High). Ini sinyal bahaya bagi buyer dan potensi awal setup Sell.'
        ]
      },
      goldenRules: [
        'Body Close melewati swing = BOS (Lanjut). Hanya Wick melewati swing = Sweep (Waspada Balik Arah).',
        'Jangan pernah klik Buy/Sell tepat pada saat breakout; tunggu penutupan candle dan retracement.'
      ],
      quiz: [
        {
          question: 'Manakah syarat paling mendasar agar penembusan Swing High dianggap sebagai BOS Bullish yang valid?',
          options: [
            'Ekor atas candle melewati Swing High minimal 1 pip',
            'Body candle benar-benar ditutup (Close) di atas Swing High sebelumnya dengan dorongan tegas',
            'Indikator MACD memotong ke atas',
            'Terjadi di sesi Asia jam 09:00 WITA'
          ],
          answerIndex: 1,
          explanation: 'Dalam ICT, validitas BOS ditentukan oleh Body Close melewati level struktur, bukan sekadar sentuhan wick.'
        },
        {
          question: 'Harga menembus Swing Low dengan wick panjang sejauh $3,00 lalu ditutup kembali jauh di atas Swing Low. Apa sebutan peristiwa ini?',
          options: [
            'BOS Bearish Valid',
            'Liquidity Sweep (Raid) terhadap Sell-Side Liquidity',
            'Breakaway Gap',
            'Sideways Accumulation'
          ],
          answerIndex: 1,
          explanation: 'Tusukan wick melewati Low lalu ditutup masuk kembali adalah ciri khas Liquidity Sweep.'
        },
        {
          question: 'Mengapa institusi sering membuat breakout palsu di atas Resistance yang terlihat sangat rapi?',
          options: [
            'Karena komputer broker sedang error',
            'Untuk memicu Stop Loss seller dan order Buy Stop breakout ritel sebagai likuiditas lawan untuk posisi Sell besar mereka',
            'Untuk membantu trader pemula mendapat profit cepat',
            'Karena pasar emas selalu naik setiap hari'
          ],
          answerIndex: 1,
          explanation: 'Order raksasa butuh kumpulan order lawan (likuiditas) agar terisi tanpa slippage parah.'
        }
      ]
    },
    {
      id: 'internal-external-dealing-range',
      number: 7,
      levelId: 2,
      title: 'Internal vs External Structure & Dealing Range',
      readMinutes: 5,
      diagramId: 'dealing-range-ie',
      summary: 'Harga bergerak dalam siklus abadi: dari Likuiditas Eksternal (Swing High/Low) masuk ke Likuiditas Internal (FVG/OB di dalam range), lalu kembali menyerang Eksternal.',
      conceptBlocks: [
        {
          heading: 'Memahami Dealing Range (Arena Permainan)',
          paragraphs: [
            'Dealing Range adalah jarak antara satu titik terendah utama (Swing Low) dan titik tertinggi utama (Swing High) yang baru saja mencetak dorongan kuat. Garis tengah 50% disebut Equilibrium (EQ).',
            'Area di atas 50% disebut Premium (zona mahal — tempat masuk akal untuk mencari Sell). Area di bawah 50% disebut Discount (zona murah — tempat masuk akal untuk mencari Buy).'
          ]
        },
        {
          heading: 'Siklus Internal ↔ External Range Liquidity (IRL ↔ ERL)',
          paragraphs: [
            'Di dalam Dealing Range terdapat struktur kecil dan celah FVG — itulah Internal Range Liquidity (IRL). Sementara puncak dan dasar luar Dealing Range disebut External Range Liquidity (ERL).',
            'Algoritma harga bergerak seperti bandul: setelah menyapu ERL (misal High/Low luar), harga akan mundur masuk mencari IRL (FVG/OB di dalam range) untuk isi ulang energi, sebelum kembali menembak ERL di sisi seberang. Memahami bandul ini membuatmu tahu kapan harus menahan TP jauh dan kapan harus berhenti mengejar harga.'
          ]
        }
      ],
      validRules: [
        'Tarik Dealing Range dari pangkal dorongan (Low) ke ujung ekstrem (High) pada timeframe H1/M15.',
        'Cari peluang Buy di zona Discount (<50% range) saat bias Bullish.',
        'Cari peluang Sell di zona Premium (>50% range) saat bias Bearish.'
      ],
      invalidRules: [
        'Klik Buy saat harga sudah di zona 85–95% Premium tepat di dekat atap ERL.',
        'Klik Sell saat harga sudah jatuh ke dasar 5–15% Discount tepat di lantai ERL.',
        'Menganggap retracement internal (IRL) yang kecil sebagai perubahan tren besar.'
      ],
      xauScenario: {
        context: 'Dealing Range H1 XAU/USD membentang dari Low 2.630 ke High 2.660 (Equilibrium = 2.645).',
        steps: [
          'Harga berada di 2.656 (zona Premium 86%). Meski bias Bullish, DILARANG Buy di sini karena terlalu mahal dan rawan koreksi.',
          'Sabar tunggu harga turun melewati 2.645 masuk ke Discount (2.638–2.642) tempat ada FVG M15 (IRL).',
          'Setelah reaksi konfirmasi di 2.640, targetkan kembali ke puncak ERL di 2.660 (+200 pips / $20).'
        ]
      },
      goldenRules: [
        'Jangan pernah beli di harga mahal (Premium) dan jangan pernah jual di harga murah (Discount).',
        'Pasar selalu bergerak bolak-balik: Eksternal → Internal → Eksternal.'
      ],
      quiz: [
        {
          question: 'Dealing Range H1 berada di Low 2.620 dan High 2.660. Berapakah titik Equilibrium (50%) dan di mana zona Discount-nya?',
          options: [
            'EQ 2.640; Discount di bawah 2.640',
            'EQ 2.640; Discount di atas 2.640',
            'EQ 2.650; Discount di 2.655',
            'EQ 2.630; Discount di 2.660'
          ],
          answerIndex: 0,
          explanation: 'Titik tengah antara 2.620 dan 2.660 adalah 2.640. Semua harga di bawah 2.640 adalah zona Discount (murah).'
        },
        {
          question: 'Dalam siklus IRL ↔ ERL, setelah harga baru saja menyapu External Range Liquidity (puncak luar) lalu mulai melemah, ke mana magnet tujuan harga berikutnya?',
          options: [
            'Terus terbang lurus tanpa henti',
            'Kembali masuk ke dalam range menuju Internal Range Liquidity (FVG/OB/Equilibrium)',
            'Pasar langsung tutup',
            'Menuju angka acak 100 pips'
          ],
          answerIndex: 1,
          explanation: 'Setelah ERL tersapu, algoritma umumnya merebalancing harga menuju IRL terdekat sebelum menentukan dorongan lanjutan.'
        },
        {
          question: 'Mengapa entry Buy di posisi 90% Premium dalam Dealing Range sangat berisiko?',
          options: [
            'Karena jarak ke Stop Loss (bawah range) sangat lebar sementara ruang naik menuju atap ERL tinggal sempit',
            'Karena broker melarang Buy di atas 50%',
            'Karena candlestick berubah warna',
            'Karena spread selalu nol di Premium'
          ],
          answerIndex: 0,
          explanation: 'Membeli di puncak Premium membuat R:R buruk dan menempatkanmu tepat di area pengambilan profit institusi.'
        }
      ]
    },
    {
      id: 'bsl-dan-ssl-liquidity',
      number: 8,
      levelId: 2,
      title: 'Buy-Side (BSL) & Sell-Side Liquidity (SSL)',
      readMinutes: 5,
      diagramId: 'bsl-ssl-pools',
      summary: 'Likuiditas adalah bahan bakar pasar. BSL berada di atas Swing High (SL seller + Buy Stop), sedangkan SSL berada di bawah Swing Low (SL buyer + Sell Stop).',
      conceptBlocks: [
        {
          heading: 'Membaca Grafik Seperti Peta Bahan Bakar',
          paragraphs: [
            'Institusi penggerak pasar mengelola miliaran dolar. Mereka tidak bisa menekan Buy seenaknya tanpa menggerakkan harga melonjak sebelum pesanan mereka penuh. Untuk membeli dalam jumlah raksasa di harga bagus, mereka butuh jutaan order jual (Sell) di satu titik sempit.',
            'Di mana kumpulan order jual paling padat? Tepat di bawah Swing Low! Karena di sanalah trader ritel menaruh Stop Loss Buy (yang saat tersentuh berubah menjadi order Sell otomatis) plus order Sell Stop trader breakout. Itulah Sell-Side Liquidity (SSL).'
          ]
        },
        {
          heading: 'BSL vs SSL dalam Satu Pandangan',
          paragraphs: [
            'Buy-Side Liquidity (BSL) bertumpuk di atas puncak Swing High — berisi Stop Loss para seller dan order Buy Stop trader breakout. Saat institusi ingin menjual dalam jumlah besar, mereka mendorong harga naik menyapu BSL lebih dulu.',
            'Sebaliknya, Sell-Side Liquidity (SSL) bertumpuk di bawah lembah Swing Low. Begitu kamu memakai kacamata BSL & SSL, Support dan Resistance tidak lagi terlihat sebagai tembok pantul ajaib — melainkan target magnet yang siap disapu.'
          ]
        }
      ],
      validRules: [
        'Tandai BSL hanya pada Swing High yang menonjol dan belum tersentuh (unmitigated).',
        'Tandai SSL hanya pada Swing Low yang menonjol dan bersih.',
        'Gunakan kolam BSL/SSL terdekat yang masih utuh sebagai target Take Profit (Draw on Liquidity).'
      ],
      invalidRules: [
        'Menganggap setiap garis Support/Resistance yang sudah disentuh 3–4 kali sebagai tembok terkuat (justru itu kolam likuiditas paling empuk untuk dijebol).',
        'Menaruh Stop Loss persis sejajar dengan kumpulan Low/High yang terlalu mencolok.',
        'Menandai 20 garis BSL/SSL mikro sampai chart penuh coretan.'
      ],
      xauScenario: {
        context: 'Chart M15 XAU/USD memperlihatkan 2 puncak sejajar di 2.665 (BSL) dan 1 lembah bersih di 2.648 (SSL).',
        steps: [
          'Trader ritel menganggap 2.665 sebagai "Double Top kuat" dan langsung Sell dengan SL di 2.666.',
          'Scalper ICT membaca 2.665 sebagai kolam BSL empuk. Kita sabar menunggu harga naik menusuk 2.666,50 untuk menyapu semua SL seller.',
          'Begitu BSL 2.665 tersapu dan M5 menutup bearish tegas (MSS/CISD), barulah kita Sell membidik kolam SSL di 2.648.'
        ]
      },
      goldenRules: [
        'Jika kamu tidak melihat di mana likuiditasnya, besar kemungkinan Stop Loss kamulah likuiditasnya.',
        'Harga selalu bergerak dari satu kolam likuiditas ke kolam likuiditas berikutnya.'
      ],
      quiz: [
        {
          question: 'Pesanan apa saja yang menumpuk di area Sell-Side Liquidity (SSL) di bawah Swing Low?',
          options: [
            'Stop Loss para buyer (menjadi order Sell) dan order Sell Stop trader breakout',
            'Take Profit para buyer dan Buy Limit institusi',
            'Hanya order pending bank sentral Asia',
            'Tidak ada order apa pun di bawah Swing Low'
          ],
          answerIndex: 0,
          explanation: 'Stop Loss posisi Buy dieksekusi sebagai order Sell; ditambah Sell Stop breakout, tercipta kolam besar likuiditas jual (SSL).'
        },
        {
          question: 'Dalam pandangan ICT, pola klasik "Double Bottom" yang sangat rapi di Support biasanya berfungsi sebagai apa?',
          options: [
            'Jaminan 100% harga tidak akan pernah turun lagi',
            'Magnet Sell-Side Liquidity (SSL) yang sangat menarik untuk disapu sebelum harga benar-benar naik',
            'Tanda market akan libur',
            'Sinyal wajib langsung Buy tanpa Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Semakin rapi Double Bottom, semakin banyak SL buyer bertumpuk di bawahnya, menjadikannya target sweep utama.'
        },
        {
          question: 'Apa fungsi utama BSL dan SSL selain sebagai titik pemicu sweep entry?',
          options: [
            'Sebagai target Take Profit objektif (Draw on Liquidity)',
            'Sebagai pengganti ukuran lot',
            'Sebagai indikator berita inflasi',
            'Sebagai pengatur warna chart'
          ],
          answerIndex: 0,
          explanation: 'Kolam BSL/SSL yang masih utuh adalah magnet alami yang menjadi target Take Profit paling rasional.'
        }
      ]
    },
    {
      id: 'level-likuiditas-kunci-xauusd',
      number: 9,
      levelId: 2,
      title: 'EQH/EQL, PDH/PDL, PWH/PWL & Asia Range',
      readMinutes: 5,
      diagramId: 'key-liquidity-levels',
      summary: 'Tidak semua likuiditas setara. Empat peta level keramat di XAU/USD yang paling dihormati algoritma adalah PWH/PWL, PDH/PDL, Asia High/Low, dan Equal Highs/Lows.',
      conceptBlocks: [
        {
          heading: 'Hierarki Level Likuiditas Harian & Mingguan',
          paragraphs: [
            'Agar chart tetap bersih, cukup tandai 4 jenis likuiditas bernilai tinggi yang juga dipakai di Cockpit Mapping Amy FX Pro:',
            '1. PWH / PWL (Previous Week High / Low): Batas ekstrem minggu lalu — kolam likuiditas terkuat untuk target swing atau pembalikan besar.\n2. PDH / PDL (Previous Day High / Low): Puncak dan dasar hari kemarin — magnet harian paling sering diburu pada sesi London dan New York.\n3. Asia High / Asia Low (08:00–12:00 WITA): Kotak akumulasi pagi hari yang nyaris setiap hari disapu satu sisinya saat pembukaan London/NY.\n4. Equal Highs (EQH) & Equal Lows (EQL): Dua atau lebih puncak/lembah yang nyaris sejajar — ibarat papan reklame bertuliskan "banyak Stop Loss di sini".'
          ]
        },
        {
          heading: 'Status Utuh (Fresh) vs Sudah Tersapu (Swept)',
          paragraphs: [
            'Begitu sebuah level — misalnya PDH — sudah ditembus oleh harga hari ini, level itu tidak lagi menjadi magnet atas (statusnya berubah menjadi SWEPT). Jangan terus membidik level yang sudah terambil; segera alihkan fokus ke kolam likuiditas segar berikutnya atau amati apakah penembusan itu memicu pembalikan arah.'
          ]
        }
      ],
      validRules: [
        'Tandai PDH, PDL, dan kotak Asia High/Low setiap pagi sebelum sesi London (15:00 WITA).',
        'Prioritaskan setup yang muncul TEPAT setelah salah satu dari 4 level keramat ini tersapu.',
        'Hapus atau tandai [SWEPT] level yang sudah terambil agar peta tetap akurat.'
      ],
      invalidRules: [
        'Menggambar garis di setiap puncak kecil M1 sampai chart tidak bisa dibaca.',
        'Masih menjadikan PDH sebagai target Buy padahal harga live sudah berada di atas PDH.',
        'Mengabaikan Asia High/Low saat trading di pembukaan London Killzone.'
      ],
      xauScenario: {
        context: 'Persiapan rutin XAU/USD pukul 14:45 WITA menjelang London Open.',
        steps: [
          'Tandai PDH (2.670) dan PDL (2.638) di H1.',
          'Tandai kotak Asia High (2.654) dan Asia Low (2.646) di M15.',
          'Bias H1 Bullish menuju PDH 2.670. Rencana: tunggu harga turun menyapu Asia Low 2.646 di awal London, lalu cari konfirmasi Buy menuju Asia High (TP1) dan PDH 2.670 (TP2).'
        ]
      },
      goldenRules: [
        'Empat level saja sudah cukup menguasai peta likuiditas Gold: PWH/PWL, PDH/PDL, Asia Range, dan EQH/EQL.',
        'Level yang sudah tersapu (SWEPT) berubah fungsi dari magnet menjadi pemicu evaluasi arah.'
      ],
      quiz: [
        {
          question: 'Dari daftar berikut, level likuiditas manakah yang biasanya terbentuk pada pagi hari (08:00–12:00 WITA) dan paling sering disapu saat sesi London dibuka?',
          options: [
            'Monthly Open 3 tahun lalu',
            'Asia High dan Asia Low (Asia Range)',
            'Harga penutupan tahun lalu',
            'Moving Average 50'
          ],
          answerIndex: 1,
          explanation: 'Kotak akumulasi Asia (08:00–12:00 WITA) menjadi sumber bahan bakar manipulasi paling umum saat volume London masuk.'
        },
        {
          question: 'Jika harga XAU/USD saat ini di 2.675 sementara PDH berada di 2.670, bagaimana status PDH tersebut?',
          options: [
            'Masih menjadi target magnet atas',
            'Sudah SWEPT (tertembus/terambil), bukan lagi magnet atas',
            'Menjadi Stop Loss otomatis',
            'Tidak sah dipakai di hari Senin'
          ],
          answerIndex: 1,
          explanation: 'Karena harga live sudah melampaui 2.670, likuiditas di atas PDH sudah terambil (SWEPT).'
        },
        {
          question: 'Apa arti singkatan EQH dan EQL pada peta likuiditas ICT?',
          options: [
            'Entry Quick High dan Entry Quick Low',
            'Equal Highs dan Equal Lows — puncak/lembah sejajar yang menumpuk banyak Stop Loss',
            'Equilibrium Hour dan Equilibrium Line',
            'Equity High dan Equity Low akun broker'
          ],
          answerIndex: 1,
          explanation: 'EQH/EQL membentuk tampilan "Double Top/Bottom" yang sangat memancing penumpukan Stop Loss ritel.'
        }
      ]
    },
    {
      id: 'inducement-idm-umpan-ritel',
      number: 10,
      levelId: 2,
      title: 'Inducement (IDM): Umpan Ritel Sebelum Ekspansi',
      readMinutes: 5,
      diagramId: 'inducement-trap',
      summary: 'Pernahkah Order Block atau FVG kamu yang terlihat sempurna justru jebol dulu sebelum harga terbang persis sesuai analisismu? Penyebabnya 90% karena kamu lupa mengecek Inducement (IDM).',
      conceptBlocks: [
        {
          heading: 'Apa Itu Inducement (IDM)?',
          paragraphs: [
            'Inducement adalah ayunan kecil (pullback internal pertama) yang terletak TEPAT DI DEPAN area POI (Order Block / FVG) yang sebenarnya. Fungsinya cuma satu: memancing trader yang tidak sabar untuk entry terlalu cepat.',
            'Banyak trader SMC pemula langsung memasang Limit Order di FVG/OB paling atas (dekat harga sekarang) tanpa menyadari bahwa FVG/OB tersebut tidak punya bahan bakar di depannya. Akhirnya, POI pertama itulah yang dijadikan umpan (IDM) untuk disapu sebelum harga benar-benar memantul dari POI ekstrem di belakangnya.'
          ]
        },
        {
          heading: 'Hukum Emas: POI Tanpa Inducement = Kamu Adalah Inducement-nya',
          paragraphs: [
            'Sebelum menaruh entry di sebuah FVG atau Order Block, tanyakan satu hal: "Apakah sudah ada likuiditas kecil (IDM) di depan zona ini yang akan disapu sebelum harga masuk ke zonaku?"',
            'Jika ada ayunan kecil atau trendline ritel tepat di depan POI kamu, probabilitas POI tersebut bertahan melonjak tajam karena institusi sudah mendapat bahan bakar dari sapuan IDM tersebut.'
          ]
        }
      ],
      validRules: [
        'Tunggu pullback minor pertama (IDM) terbentuk dan DISAPU terlebih dahulu sebelum entry di POI belakangnya.',
        'POI paling kuat biasanya berada tepat di balik titik Inducement (sering kali di area Discount/Premium lebih dalam).',
        'Trendline diagonal yang menyentuh 3 titik sering menjadi Inducement raksasa tepat sebelum POI sejati.'
      ],
      invalidRules: [
        'Langsung memasang Limit Order di FVG/OB terluar yang tidak punya likuiditas di depannya.',
        'Panik menganggap bias gagal saat POI pertama (yang ternyata IDM) ditembus menuju POI ekstrem.',
        'Memakai IDM tanpa arah struktur HTF yang jelas.'
      ],
      xauScenario: {
        context: 'XAU/USD M15 Bullish. Terdapat 2 FVG Bullish: FVG atas di 2.649 dan FVG bawah (ekstrem) di 2.643.',
        steps: [
          'Harga turun menyentuh FVG atas 2.649 lalu memantul kecil ke 2.652 — trader tidak sabar langsung Buy di 2.649 dengan SL di 2.647.',
          'Scalper sabar menandai pantulan di 2.649 sebagai Inducement (IDM).',
          'Saat sesi NY dibuka, harga membanting turun menyapu 2.647 (IDM diambil!), masuk mulus ke FVG ekstrem 2.643, memunculkan MSS M5, lalu melesat naik +180 pips.'
        ]
      },
      goldenRules: [
        'POI pertama sering kali adalah umpan; POI di balik sapuan Inducement adalah arena institusi.',
        'Kesabaran menunggu IDM tersapu memotong separuh jumlah Stop Loss yang tidak perlu.'
      ],
      quiz: [
        {
          question: 'Di mana biasanya posisi Inducement (IDM) berada relatif terhadap POI (Order Block / FVG) yang paling valid?',
          options: [
            'Jauh di belakang Stop Loss',
            'Tepat di depan (sebelum) POI sejati, berfungsi sebagai umpan likuiditas yang disapu dulu',
            'Di luar jam buka pasar',
            'Selalu di angka bulat 500 pips jauhnya'
          ],
          answerIndex: 1,
          explanation: 'Inducement berada di depan POI utama untuk mengumpulkan Stop Loss trader yang masuk terlalu cepat.'
        },
        {
          question: 'Ada dua FVG Bullish searah tren: FVG #1 di 55% (Premium) tanpa sweep di depannya, dan FVG #2 di 25% (Discount) tepat di bawah sebuah Equal Lows kecil. Mana yang probabilitasnya lebih tinggi?',
          options: [
            'FVG #1 karena paling dekat dengan harga sekarang',
            'FVG #2 karena berada di Discount dan dilindungi bahan bakar Inducement (Equal Lows) di depannya',
            'Keduanya harus di-entry bersamaan dengan lot maksimal',
            'Keduanya wajib di-Sell'
          ],
          answerIndex: 1,
          explanation: 'FVG #2 memadukan lokasi Discount yang murah dengan Inducement jelas tepat di depannya.'
        },
        {
          question: 'Apa akibat paling umum jika trader mengabaikan konsep Inducement?',
          options: [
            'Profit terlalu besar',
            'Terkena Stop Loss lebih dulu di POI pertama, lalu harga tetap bergerak persis sesuai arah analisis awalnya',
            'Chart tidak bisa digeser',
            'Spread menjadi negatif'
          ],
          answerIndex: 1,
          explanation: 'Kena SL lalu harga tetap pergi sesuai arah analisis adalah gejala klasik masuk di zona Inducement.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
