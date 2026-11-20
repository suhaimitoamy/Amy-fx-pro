/* Amy FX Academy — Level 5 & Level 6 (Pelajaran 21–30)
 * Kurikulum Zero to Scalper ICT XAU/USD (Standar Waktu WITA)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AmyAcademyPart3 = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const LEVELS = [
    {
      id: 5,
      code: 'Level 05',
      title: 'Waktu, Killzone WITA & Playbook Harian',
      tagline: 'Dalam ICT, Time > Price. Kuasai siklus AMD, jam emas Killzone WITA, proteksi News Lock, Daily Bias, dan SOP harian.'
    },
    {
      id: 6,
      code: 'Level 06',
      title: 'Risiko, Psikologi & Konsistensi Profit',
      tagline: 'Kunci terakhir scalper profesional: sizing lot matematis, manajemen posisi anti-panik, psikologi baja, dan protokol 100 sample.'
    }
  ];

  const LESSONS = [
    // ═══════════════════════════════════════════════════════════════
    // LEVEL 5 — WAKTU, KILLZONE WITA & PLAYBOOK HARIAN
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'siklus-amd-judas-swing',
      number: 21,
      levelId: 5,
      title: 'Siklus AMD (Power of Three) & Judas Swing',
      readMinutes: 5,
      diagramId: 'amd-power-of-three',
      summary: 'Hampir setiap hari pasar Gold memutar skenario teater yang sama: Akumulasi di Asia, Manipulasi palsu (Judas Swing) di awal London/NY, lalu Distribusi arah asli.',
      conceptBlocks: [
        {
          heading: 'Anatomi Power of Three (A – M – D)',
          paragraphs: [
            'Jika kamu membedah satu candle harian (Daily) yang bullish, di dalamnya tersimpan 3 babak yang disebut AMD (Power of Three):',
            '1. Accumulation (Akumulasi): Harga bergerak sempit/datar dekat harga pembukaan harian (biasanya sepanjang sesi Asia 08:00–12:00 WITA) untuk membangun likuiditas atas dan bawah.\n2. Manipulation (Judas Swing): Saat sesi London atau NY dibuka, harga sengaja digerakkan cepat ke ARAH SALAH (turun dulu menyapu Asia Low pada hari bullish) untuk menipu trader breakout dan mengisi order institusi.\n3. Distribution (Distribusi): Setelah bahan bakar penuh, harga berbalik melesat kencang menuju arah tren sesungguhnya sepanjang hari.'
          ]
        },
        {
          heading: 'Jangan Jadi Korban Babak ke-2 (Judas Swing)',
          paragraphs: [
            'Kebanyakan trader pemula hancur tepat di fase Manipulasi karena mengira dorongan awal pembukaan sesi adalah tren hari itu. Begitu kamu tahu bahwa gerakan pertama pembukaan sesi sering kali adalah Judas Swing, kamu akan tersenyum menunggu manipulasi selesai lalu menumpang gelombang Distribusi!'
          ]
        }
      ],
      validRules: [
        'Tandai garis Midnight Open / Daily Open sebagai acuan: pada hari Bullish, idealnya Buy DI BAWAH Daily Open (setelah manipulasi turun).',
        'Pada hari Bearish, idealnya Sell DI ATAS Daily Open (setelah manipulasi naik).',
        'Tunggu Judas Swing menyapu ujung kotak Asia sebelum mencari MSS/CISD.'
      ],
      invalidRules: [
        'Langsung mengejar candle breakout pertama saat pembukaan London tanpa menunggu struktur.',
        'Mencoba mencari tren besar di fase Akumulasi Asia yang sempit.',
        'Menganggap setiap hari pasti punya pola AMD rapi (pada hari news ekstrem atau trending parah dari pagi, manipulasi bisa sangat singkat).'
      ],
      xauScenario: {
        context: 'Hari Bullish XAU/USD: Daily Open di 2.648, Asia Range di 2.645–2.651.',
        steps: [
          'Akumulasi (08:00–14:30 WITA): Harga bolak-balik tenang di 2.645–2.651.',
          'Manipulasi / Judas Swing (15:30 WITA): Harga dibanting turun ke 2.642,50 (di bawah Daily Open & menyapu Asia Low).',
          'Distribusi (16:00–22:00 WITA): Muncul MSS Bullish M5 + FVG di 2.645 → harga melesat naik menembus Asia High hingga 2.668 (+230 pips).'
        ]
      },
      goldenRules: [
        'Pada hari Bullish, cari harga di bawah Daily Open; pada hari Bearish, cari harga di atas Daily Open.',
        'Gerakan pertama pembukaan sesi sering kali adalah tipuan — tunggu patah arah sesudahnya.'
      ],
      quiz: [
        {
          question: 'Apa urutan 3 fase dalam konsep ICT Power of Three (AMD)?',
          options: [
            'Distribution → Manipulation → Accumulation',
            'Accumulation → Manipulation (Judas Swing) → Distribution',
            'Breakout → Retest → Sideways',
            'Entry → Averaging → Margin Call'
          ],
          answerIndex: 1,
          explanation: 'Institusi mengakumulasi range, memanipulasi publik ke arah salah (Judas Swing), lalu mendistribusikan harga ke target asli.'
        },
        {
          question: 'Jika Daily Bias hari ini adalah BEARISH, di mana area terbaik mencari setup Sell relatif terhadap harga Daily Open?',
          options: [
            'Jauh di bawah Daily Open setelah harga jatuh $25',
            'Di atas Daily Open setelah terjadi manipulasi naik (Judas Swing) menyapu likuiditas atas',
            'Tepat di dasar terendah minggu lalu',
            'Tidak ada hubungannya dengan Daily Open'
          ],
          answerIndex: 1,
          explanation: 'Menjual di atas Daily Open (Premium harian) saat bias Bearish menyelaraskanmu tepat di puncak Judas Swing.'
        },
        {
          question: 'Sesi manakah yang paling sering membentuk fase Akumulasi (kotak konsolidasi awal) pada XAU/USD?',
          options: [
            'Sesi Asia (08:00–12:00 WITA)',
            'Menit rilis NFP',
            'Tengah sesi NY Overlap',
            'Hari Sabtu pagi'
          ],
          answerIndex: 0,
          explanation: 'Sesi Asia umumnya memiliki rentang lebih tenang yang membangun batas atas dan bawah untuk disapu sesi London/NY.'
        }
      ]
    },
    {
      id: 'jadwal-killzone-wita-silver-bullet',
      number: 22,
      levelId: 5,
      title: 'Jadwal Killzone WITA & ICT Silver Bullet',
      readMinutes: 5,
      diagramId: 'killzones-wita-timeline',
      summary: 'Dalam ICT, "Time" datang lebih dulu sebelum "Price". Setup A+ di luar jam Killzone sering macet; setup yang sama di dalam Killzone WITA & Silver Bullet langsung melesat.',
      conceptBlocks: [
        {
          heading: 'Peta Resmi Jam Killzone XAU/USD (WITA / UTC+8)',
          paragraphs: [
            'Semua jam berikut sudah diselaraskan ke waktu lokal **WITA** (perhatikan pergeseran 1 jam antara musim panas DST [Mar–Nov] dan musim dingin Winter [Nov–Mar]):',
            '• **Asia Session (08:00 – 12:00 WITA):** Fokus pemetaan kotak Asia High/Low & pantau ekstrem — hindari overtrading di tengah range.\n• **London Killzone (15:00 – 18:00 WITA DST / 16:00 – 19:00 WITA Winter):** Jendela utama Judas Swing & pembentukan High/Low harian.\n• **New York AM Killzone (20:00 – 23:00 WITA DST / 21:00 – 24:00 WITA Winter):** Volume puncak dunia, rilis berita makro USD, dan ekspansi terbesar XAU/USD.'
          ]
        },
        {
          heading: 'Jendela Emas 1 Jam: ICT Silver Bullet',
          paragraphs: [
            'Silver Bullet adalah jendela waktu spesifik 60 menit saat algoritma nyaris selalu mencetak satu setup FVG bersih menuju likuiditas terdekat. Dua jendela Silver Bullet terbaik untuk scalper WITA adalah **London Silver Bullet (15:00–16:00 / 16:00–17:00 WITA)** dan **NY AM Silver Bullet (22:00–23:00 DST / 23:00–24:00 Winter WITA, tepat 10:00–11:00 NY)**.',
            'Aturannya sederhana: begitu jam Silver Bullet mulai, tandai likuiditas terdekat yang belum tersapu, tunggu Sweep/MSS, dan ambil FVG pertama yang muncul dengan target 50–100 pips XAU/USD.'
          ]
        }
      ],
      validRules: [
        'Tentukan 1 atau maksimal 2 sesi tetap tiap hari (misal hanya London atau hanya NY AM) agar mental tetap segar.',
        'Gunakan jam NY AM Silver Bullet (10:00–11:00 waktu NY / 22:00–23:00 WITA DST) setelah debu berita 20:30/21:30 mereda.',
        'Tutup layar di luar Killzone — jangan buang energi memelototi chart yang mati.'
      ],
      invalidRules: [
        'Trading di jam makan siang London (18:30–20:00 WITA) saat volume turun dan sering terjadi retracement acak.',
        'Mencampuradukkan jam WIB, WITA, dan EST hingga keliru jadwal pembukaan sesi.',
        'Memaksa entry di luar Killzone hanya karena baru sempat buka HP.'
      ],
      xauScenario: {
        context: 'Rutinitas Silver Bullet NY AM (22:00–23:00 WITA DST).',
        steps: [
          'Pukul 20:30 WITA berita CPI/Jobless Claims rilis → kita DIAM menunggu volatilitas liar mereda.',
          'Pukul 22:00 WITA jendela Silver Bullet dimulai: arah dorongan pasca-berita sudah jelas Bullish menuju PDH.',
          'Pukul 22:15 WITA harga melakukan pullback kecil menyapu low M5, lalu mencetak FVG Bullish pertama → Entry Buy, TP +80–100 pips sebelum pukul 23:15 WITA.'
        ]
      },
      goldenRules: [
        'Time > Price: setup di dalam Killzone memiliki kecepatan dan akurasi jauh di atas jam mati.',
        'Lebih baik fokus penuh 2 jam di Killzone daripada melotot lelah 12 jam di depan chart.'
      ],
      quiz: [
        {
          question: 'Kapan jendela waktu utama NY AM Killzone dalam standar waktu WITA (musim panas DST / musim dingin Winter)?',
          options: [
            '08:00 – 10:00 WITA',
            '20:00 – 23:00 WITA (DST) atau 21:00 – 24:00 WITA (Winter)',
            '12:00 – 14:00 WITA',
            '03:00 – 05:00 WITA'
          ],
          answerIndex: 1,
          explanation: 'NY AM Killzone berlangsung di malam hari WITA dan bergeser 1 jam saat pergantian Daylight Saving Time (DST) AS.'
        },
        {
          question: 'Apa keunggulan utama jendela 1 jam NY AM Silver Bullet (10:00–11:00 waktu New York)?',
          options: [
            'Spread selalu 0 di semua broker',
            'Terjadi tepat setelah volatilitas berita 08:30 NY mereda, sehingga arah ekspansi dan FVG bersih lebih mudah dibaca',
            'Pasar bergerak sangat pelan dan datar',
            'Tidak memerlukan Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Pada jam 10:00–11:00 NY (22:00–23:00 / 23:00–24:00 WITA), pasar saham AS sudah buka dan arah pasca-news umumnya sudah jernih.'
        },
        {
          question: 'Apa yang sebaiknya dilakukan scalper di luar jam Killzone?',
          options: [
            'Menurunkan timeframe ke 5 detik agar tetap bisa klik entry',
            'Menutup chart, istirahat, atau melakukan review Jurnal & Backtest',
            'Menggandakan lot karena gerakan lambat',
            'Membuka 10 pair kripto acak'
          ],
          answerIndex: 1,
          explanation: 'Menjaga fokus hanya pada jendela likuiditas puncak melindungi modal dari overtrading di jam sepi.'
        }
      ]
    },
    {
      id: 'protokol-news-lock-usd',
      number: 23,
      levelId: 5,
      title: 'Protokol News Lock: CPI, NFP, FOMC & Spread Spike',
      readMinutes: 4,
      diagramId: 'news-lock-shield',
      summary: 'Satu candle berita merah USD bisa menelan Stop Loss di kedua sisi dalam 3 detik beserta slippage parah. Kenali aturan wajib News Lock di Amy FX Pro.',
      conceptBlocks: [
        {
          heading: 'Mengapa Teknikal ICT Sementara "Buta" Saat Detik Rilis Berita',
          paragraphs: [
            'Berita berdampak tinggi (Red Folder USD) seperti **CPI (Inflasi)**, **NFP (Tenaga Kerja)**, **FOMC (Suku Bunga The Fed)**, **Core PCE**, dan **Initial Jobless Claims** menginjeksi repricing algoritma instan. Dalam hitungan detik, spread XAU/USD bisa melebar dari $0,30 menjadi $2,00–$5,00 dan harga melonjak $15 atas-bawah secara bersamaan (whipsaw).',
            'Pada menit rilis, FVG dan Order Block M5 bisa ditembus dua arah tanpa ampun — bahkan Stop Loss kamu bisa terkena *slippage* (tertutup jauh lebih rugi dari harga yang kamu pasang).'
          ]
        },
        {
          heading: 'Aturan Keras News Lock (-15 Menit s.d. +30 Menit)',
          paragraphs: [
            'Sistem Mapping dan Market Intel Amy FX Pro menerapkan **News Lock otomatis**: dilarang membuka posisi baru mulai **15 menit sebelum** hingga **30 menit sesudah** rilis berita High Impact USD (khusus FOMC 02:00–03:00 WITA, hindari seluruh jendela sampai konferensi pers usai).',
            'Bagaimana jika kamu sudah punya posisi profit sebelum berita? Amankan minimal 70%–100% profit atau tutup penuh sebelum berita rilis — jangan berjudi menyerahkan profit yang sudah di tangan ke lemparan koin berita.'
          ]
        }
      ],
      validRules: [
        'Cek tab Kalender Ekonomi di modul Market Intel setiap pagi sebelum menyusun rencana.',
        'Patuhi News Lock: 0 entry baru pada -15 menit hingga +30 menit rilis Red Folder USD.',
        'Tunggu debu whipsaw mereda (+15 hingga +30 menit), lalu manfaatkan FVG/IFVG yang terbentuk pasca-berita.'
      ],
      invalidRules: [
        'Memasang jebakan Buy Stop & Sell Stop bersamaan tepat sebelum berita (sering kena dua-duanya oleh whipsaw & spread spike).',
        'Menahan posisi scalping M5 dengan SL ketat melewati detik rilis CPI atau NFP.',
        'Trading saat tidak tahu hari itu ada jadwal berita merah USD.'
      ],
      xauScenario: {
        context: 'Hari Rabu malam: Jadwal rilis US CPI pukul 20:30 WITA.',
        steps: [
          '20:15 WITA (News Lock Aktif): Jangan buka entry baru. Jika ada posisi terbuka, amankan profit.',
          '20:30 WITA (Rilis): Gold melonjak naik $12 menyapu London High lalu jatuh $18 dalam 2 menit — semua penjudi news tersapu bersih.',
          '21:00 WITA (Pasca-News): Arah riil Bearish sudah terbuka lebar meninggalkan FVG M5 bersih. Barulah scalper masuk dengan risiko tenang dan spread normal.'
        ]
      },
      goldenRules: [
        'Berita bukan musuh — berita adalah mesin pembuat likuiditas. Biarkan ia selesai menyapu dulu, baru kita masuk.',
        'Jaga selalu aturan News Lock: -15 menit sampai +30 menit tangan jauh dari tombol entry.'
      ],
      quiz: [
        {
          question: 'Berapa jendela waktu proteksi News Lock standar di Amy FX Pro untuk berita High Impact USD?',
          options: [
            '-1 menit hingga +1 menit',
            '-15 menit sebelum hingga +30 menit sesudah rilis berita',
            'Hanya 5 detik tepat saat rilis',
            'Tidak perlu menunggu berita sama sekali'
          ],
          answerIndex: 1,
          explanation: 'Rentang -15m hingga +30m menghindari pelebaran spread pra-rilis dan ayunan whipsaw pasca-rilis.'
        },
        {
          question: 'Apa bahaya terbesar menahan posisi scalping dengan SL ketat melewati rilis berita CPI atau NFP?',
          options: [
            'Keuntungan otomatis berlipat ganda',
            'Spread spike dan slippage yang bisa menembus Stop Loss jauh lebih buruk dari rencana risiko',
            'Chart berubah ke EUR/USD',
            'Tidak ada risiko jika sudah ada FVG M5'
          ],
          answerIndex: 1,
          explanation: 'Saat likuiditas pasar terhenti sejenak di detik rilis, order SL bisa terisi dengan slippage parah.'
        },
        {
          question: 'Bagaimana cara profesional memanfaatkan hari dengan berita merah USD?',
          options: [
            'Tebak angka rilis 2 menit sebelumnya',
            'Tunggu rilis dan whipsaw selesai, lalu entry searah dorongan pasca-berita pada FVG/IFVG yang bersih',
            'Pasang Buy Stop dan Sell Stop berjarak 5 pips',
            'Matikan Stop Loss selama berita berlangsung'
          ],
          answerIndex: 1,
          explanation: 'Setelah manipulasi detik awal reda, dorongan pasca-berita sering melahirkan tren paling bersih hari itu.'
        }
      ]
    },
    {
      id: 'daily-bias-draw-on-liquidity',
      number: 24,
      levelId: 5,
      title: 'Menentukan Daily Bias & Draw on Liquidity (DOL)',
      readMinutes: 5,
      diagramId: 'daily-bias-dol',
      summary: 'Daily Bias bukan ramalan dukun — cukup jawab dua pertanyaan di chart Daily & H1: "Dari mana harga baru saja memantul?" dan "Kolam likuiditas terdekat mana yang belum diambil?".',
      conceptBlocks: [
        {
          heading: 'Rumus Sederhana Daily Bias Dalam 2 Menit',
          paragraphs: [
            'Banyak trader bingung menentukan Daily Bias karena mencampur terlalu banyak opini makro dan indikator. Dalam ICT, Daily Bias cukup dijawab dari dua fakta obyektif di chart Daily & H1:',
            '1. **Lokasi Asal (Origin):** Apakah harga baru saja menyapu PDL/SSL atau memantul dari FVG/OB Bullish H1/Daily? Jika ya, dorongan berpeluang menuju atas (Bullish). Jika baru saja menyapu PDH/BSL atau menyentuh Supply H1/Daily, dorongan berpeluang menuju bawah (Bearish).\n2. **Magnet Tujuan (Draw on Liquidity / DOL):** Ke mana kolam likuiditas terdekat yang masih utuh (PDH, PDL, EQH/EQL, atau H1 FVG kosong)? Arah menuju magnet itulah Bias hari ini.'
          ]
        },
        {
          heading: 'Anti-Narrative Bias: Wajib Punya Titik Batal',
          paragraphs: [
            'Bahaya terbesar Daily Bias adalah jatuh cinta pada satu arah (*Narrative Bias*). Walau pagi hari kamu menetapkan bias Bullish, kamu WAJIB menuliskan satu level batal: "Jika H1 menutup body di bawah level X, skenario Bullish batal dan saya bersikap netral atau pindah ke Bearish."'
          ]
        }
      ],
      validRules: [
        'Tentukan Draw on Liquidity (DOL) spesifik — misal PDH atau PDL — sebelum sesi London dimulai.',
        'Periksa keselarasan korelasi terbalik DXY (US Dollar Index): DXY menuju SSL mendukung XAU/USD menuju BSL.',
        'Selalu tetapkan 1 garis Invalidasi Bias agar tidak keras kepala melawan fakta pasar.'
      ],
      invalidRules: [
        'Memaksakan bias pada hari "tidak jelas" (saat harga terjepit di tengah inside bar tanpa arah) — boleh menetapkan bias NETRAL dan menunggu konfirmasi sesi.',
        'Terus mencari Buy meski level invalidasi H1 sudah jebol oleh candle tebal.',
        'Mengubah bias setiap 5 menit hanya karena 1 candle M5 berwarna berlawanan.'
      ],
      xauScenario: {
        context: 'Analisis pagi XAU/USD (08:30 WITA) sebelum beraktivitas.',
        steps: [
          'Cek Daily: Kemarin candle menutup bullish kuat setelah menyapu Low 2 hari lalu, sementara PDH hanya berjarak $12 di atas.',
          'Cek H1: Struktur HH/HL rapi, ada FVG H1 segar di bawah harga sekarang.',
          'Kesimpulan 1 Kalimat: "Bias BULLISH menuju DOL PDH 2.672. Batal jika H1 close di bawah 2.640."'
        ]
      },
      goldenRules: [
        'Daily Bias = Dari mana harga baru menyapu/memantul → Menuju kolam likuiditas terdekat mana.',
        'Tidak apa-apa punya bias Netral jika peta pagi tidak jelas — tunggu sesi London membuka kartunya.'
      ],
      quiz: [
        {
          question: 'Dua pertanyaan obyektif apa yang menjadi fondasi menentukan Daily Bias dalam ICT?',
          options: [
            'Berapa indikator hijau dan apa kata berita TV?',
            'Dari POI/Sweep mana harga baru bereaksi, dan kolam likuiditas (Draw on Liquidity) terdekat mana yang belum terambil?',
            'Apakah hari ini tanggal ganjil atau genap?',
            'Berapa profit trader lain di media sosial?'
          ],
          answerIndex: 1,
          explanation: 'Asal reaksi (Origin) + Magnet tujuan (DOL) menentukan arah perjalanan harga secara obyektif.'
        },
        {
          question: 'Bagaimana cara paling efektif mencegah kutukan Narrative Bias (keras kepala menahan satu arah meski pasar berbalik)?',
          options: [
            'Tidak usah punya bias sama sekali',
            'Menetapkan 1 level Invalidasi Bias yang tegas sejak awal: jika H1 close melewati level tersebut, bias lama otomatis batal',
            'Mematikan chart H1 dan hanya melihat M1',
            'Menambah lot saat arah berlawanan'
          ],
          answerIndex: 1,
          explanation: 'Garis invalidasi objektif memaksa kita tunduk pada fakta harga, bukan ego prediksi pribadi.'
        },
        {
          question: 'Jika indeks Dolar AS (DXY) sedang menunjukkan bias Bearish kuat menuju SSL, apa implikasi umumnya terhadap XAU/USD?',
          options: [
            'XAU/USD cenderung memiliki dorongan Bullish (korelasi terbalik)',
            'XAU/USD pasti diam 0 pips',
            'XAU/USD pasti selalu jatuh bersama DXY',
            'Tidak pernah ada hubungan antara DXY dan emas'
          ],
          answerIndex: 0,
          explanation: 'Karena emas dinilai dalam USD, pelemahan DXY umumnya memberikan dukungan naik bagi XAU/USD (tetap validasi di struktur chart XAU).'
        }
      ]
    },
    {
      id: 'sop-playbook-harian-xauusd',
      number: 25,
      levelId: 5,
      title: 'SOP Playbook Harian XAU/USD (Dari Bangun Sampai Tutup)',
      readMinutes: 5,
      diagramId: 'daily-playbook-flow',
      summary: 'Scalper profesional itu membosankan — mereka mengulang SOP 4 langkah yang sama persis setiap hari sehingga tidak ada ruang bagi kepanikan atau keputusan impulsif.',
      conceptBlocks: [
        {
          heading: 'Ritual 4 Fase Harian Terintegrasi di Amy FX Pro',
          paragraphs: [
            'Berikut alur eksekusi harian yang menghubungkan seluruh modul di aplikasimu:',
            '• **Fase 1 — Peta Pagi (08:00–08:30 WITA, 10 menit):** Buka modul *Market Intel* cek berita merah USD. Buka modul *Mapping* tandai Daily Bias, Dealing Range H1, PDH/PDL, dan PWH/PWL. Tutup chart — jalani aktivitas normalmu.\n• **Fase 2 — London Killzone (15:00/16:00–18:30 WITA):** Tandai kotak Asia High/Low. Tunggu apakah muncul Judas Swing menyapu satu sisi Asia + konfirmasi Model Utama di M5. Jika tidak rapi, SKIP tanpa penyesalan.\n• **Fase 3 — New York AM & Silver Bullet (20:00–23:30 WITA):** Patuhi News Lock (-15m/+30m). Tandai London High/Low, lalu buru 1 setup A+ bersih searah dorongan pasca-berita.\n• **Fase 4 — Tutup Hari & Jurnal (5 menit):** Maksimal 1–2 trade per hari (atau berhenti segera jika target harian tercapai / terkena 2x SL). Catat hasilnya di modul *Jurnal Trading* lengkap dengan sesi WITA, setup, dan catatan emosi.'
          ]
        }
      ],
      validRules: [
        'Batas maksimal 2 trade per hari (atau berhenti otomatis setelah 2x Loss beruntun).',
        'Setiap trade wajib lolos 4 gerbang: Waktu Killzone → Tidak News Lock → Arah/POI H1 → Konfirmasi Model M5.',
        'Wajib catat setiap eksekusi ke Jurnal di hari yang sama saat ingatan emosi masih segar.'
      ],
      invalidRules: [
        'Terus duduk memelototi chart setelah target harian sudah tercapai (rawan mengembalikan profit ke pasar).',
        'Masuk trade ke-4 dan ke-5 di malam hari untuk "balas dendam" kekalahan sesi London.',
        'Tidak mencatat trade yang rugi ke dalam Jurnal.'
      ],
      xauScenario: {
        context: 'Checklist 30 Detik Sebelum Klik Entry (Wajib 5x YA).',
        steps: [
          '1. Apakah sekarang di dalam Killzone WITA dan bebas News Lock? (YA)',
          '2. Apakah arah entry selaras dengan Bias H1 / tidak menabrak POI H1 lawan? (YA)',
          '3. Apakah sudah ada Sweep likuiditas nyata + konfirmasi Model Utama (MSS/CISD/FVG/IFVG)? (YA)',
          '4. Apakah Stop Loss berada di luar struktur + napas spread dan R:R ≥ 1:2? (YA)',
          '5. Apakah ukuran lot pas dengan batas risiko 0,5%–1% modal? (YA → Eksekusi!)'
        ]
      },
      goldenRules: [
        'Profesional dibayar karena mematuhi SOP yang membosankan, bukan karena sensasi adrenalin.',
        'Batas maksimal 2x SL per hari melindungi akunmu dari hari-hari pasar yang tidak ramah.'
      ],
      quiz: [
        {
          question: 'Apa tindakan paling disiplin jika kamu sudah mengalami 2 kali Stop Loss di hari yang sama?',
          options: [
            'Gunakan lot 2x lipat di trade ke-3 agar langsung impas',
            'Berhenti trading hari ini, catat di Jurnal, dan kembali besok dengan pikiran jernih',
            'Pindah ke strategi baru di YouTube malam itu juga',
            'Tunggu jam 03:00 subuh untuk balas dendam'
          ],
          answerIndex: 1,
          explanation: 'Batas harian (max 2 SL) memutus siklus revenge trading dan menjaga drawdown tetap dangkal.'
        },
        {
          question: 'Jika pada Checklist 30 Detik sebelum entry ada 4 jawaban YA dan 1 jawaban TIDAK (karena 10 menit lagi rilis NFP), apa keputusannya?',
          options: [
            'Tetap entry karena sudah 80% terpenuhi',
            'TIDAK ENTRY — semua syarat inti harus terpenuhi tanpa kompromi',
            'Entry setengah lot tanpa Stop Loss',
            'Geser jam HP agar tidak terlihat dekat NFP'
          ],
          answerIndex: 1,
          explanation: 'Satu pelanggaran besar (seperti News Lock) cukup untuk merusak seluruh keunggulan statistik setup.'
        },
        {
          question: 'Kapan waktu terbaik mencatat detail eksekusi dan kondisi emosi ke dalam Jurnal Trading?',
          options: [
            'Akhir tahun sebelum liburan',
            'Segera setelah trade selesai di hari yang sama saat alasan dan emosi masih segar',
            'Hanya mencatat trade yang Win saja agar grafik terlihat cantik',
            'Tidak perlu jurnal jika sudah hafal di kepala'
          ],
          answerIndex: 1,
          explanation: 'Mencatat segera memastikan data kesalahan dan emosi jujur serta akurat untuk Analitik Jurnal Pro.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════
    // LEVEL 6 — RISIKO, PSIKOLOGI & KONSISTENSI PROFIT
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sizing-lot-xauusd-risiko',
      number: 26,
      levelId: 6,
      title: 'Sizing Lot XAU/USD & Aturan Risiko 0,5%–1%',
      readMinutes: 5,
      diagramId: 'lot-sizing-math',
      summary: 'Strategi sehebat apa pun akan bangkrut jika ukuran lot-nya ngawur. Pelajari rumus matematis penentuan lot XAU/USD agar setiap SL selalu bernilai sama persis.',
      conceptBlocks: [
        {
          heading: 'Rumus Wajib Lot XAU/USD (100% Objektif)',
          paragraphs: [
            'Jangan pernah memakai lot tetap (misal selalu 0,10 lot) untuk semua trade! Jika Trade A punya jarak SL $3 dan Trade B punya jarak SL $9, memakai lot sama berarti Trade B punya risiko 3 kali lipat lebih besar.',
            'Gunakan rumus standar XAU/USD (kontrak 100 oz per 1,00 lot, di mana gerak $1 = $100 untuk 1 lot, atau $1 untuk 0,01 lot):\n**Lot = Risiko Uang ($) ÷ (Jarak SL dalam Dolar × 100)**.\nContoh: Saldo $1.000, Risiko 1% = $10. Jarak SL struktural = $5 (50 pips). Maka Lot = $10 ÷ ($5 × 100) = **0,02 lot**. (Kamu juga bisa langsung menghitungnya di Kalkulator Lot modul Jurnal atau bertanya langsung ke Amy Live!).'
          ]
        },
        {
          heading: 'Matematika Drawdown: Kenapa Maksimal 0,5%–1%?',
          paragraphs: [
            'Jika kamu merisikokan 10% per trade dan mengalami 5 loss beruntun (hal yang wajar secara statistik), akunmu langsung anjlok -50% dan butuh profit +100% cuma untuk kembali modal! Dengan risiko **0,5%–1% per trade**, 5 loss beruntun hanya menyentuh drawdown -2,5% hingga -5% — emosi tetap tenang dan pemulihan sangat ringan.'
          ]
        }
      ],
      validRules: [
        'Risiko tetap 0,5% (akun prop firm / pemula) hingga maksimal 1% (akun pribadi) per trade.',
        'Hitung ulang lot setiap trade berdasarkan jarak SL struktural aktual — bukan lot tebak-tebakan.',
        'Jika modal kecil (misal <$200) sehingga 0,01 lot melebihi 2% risiko, gunakan akun Cent (XAUUSDc) agar persentase risiko tetap terjaga.'
      ],
      invalidRules: [
        'Memakai lot tetap (misal selalu 0,05 lot) tanpa peduli lebar jarak SL.',
        'Memperkecil jarak SL secara paksa hanya supaya bisa memakai lot besar.',
        'Merisikokan 5%–20% modal dalam satu kali klik ("all-in").'
      ],
      xauScenario: {
        context: 'Perbandingan 2 setup pada akun $500 dengan batas risiko disiplin 1% ($5).',
        steps: [
          'Setup 1 (M5 Sniper): Jarak SL = $2,50 → Lot = $5 ÷ ($2,50 × 100) = 0,02 lot. Jika SL kena = -$5; jika TP 1:2,5 = +$12,50.',
          'Setup 2 (M15 Normal): Jarak SL = $5,00 → Lot = $5 ÷ ($5,00 × 100) = 0,01 lot. Jika SL kena = tetap -$5!',
          'Hasil: Keduanya memiliki tekanan psikologis identik karena risiko nominal selalu terkunci di $5.'
        ]
      },
      goldenRules: [
        'Lebar SL ditentukan oleh struktur chart; ukuran Lot ditentukan oleh rumus risiko.',
        'Akun yang aman dari drawdown besar adalah akun yang pasti punya kesempatan untuk bertumbuh.'
      ],
      quiz: [
        {
          question: 'Saldo akun $1.000 dengan risiko 1% ($10). Jarak SL struktural XAU/USD adalah $4,00 (40 pips). Berapa ukuran lot standar yang benar?',
          options: [
            '0,25 lot',
            '0,025 lot (dibulatkan aman ke 0,02 lot)',
            '0,10 lot',
            '1,00 lot'
          ],
          answerIndex: 1,
          explanation: 'Lot = $10 ÷ ($4 × 100) = $10 ÷ 400 = 0,025 lot. Selalu bulatkan ke bawah (0,02 lot) agar risiko tidak melampaui 1%.'
        },
        {
          question: 'Jika sebuah akun kehilangan 50% modalnya akibat over-leverage, berapa persen keuntungan yang dibutuhkan hanya untuk kembali ke modal awal (BEP)?',
          options: [
            '50%',
            '75%',
            '100%',
            '25%'
          ],
          answerIndex: 2,
          explanation: 'Dari $500 kembali ke $1.000 membutuhkan kenaikan +$500, yaitu +100% dari saldo tersisa. Inilah mengapa mencegah drawdown dalam adalah kunci.'
        },
        {
          question: 'Bagaimana solusi paling bijak jika modal tradingmu masih $50–$100 tetapi ingin belajar XAU/USD dengan risiko ≤1%?',
          options: [
            'Tetap pakai 0,10 lot di akun standar',
            'Gunakan akun Demo atau akun Cent (XAUUSDc) agar ukuran lot tetap proporsional dengan batas risiko 1%',
            'Pasang SL 2 pips saja',
            'Hilangkan Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Akun Cent mengecilkan nilai per lot 100x sehingga modal kecil tetap bisa menerapkan manajemen risiko profesional.'
        }
      ]
    },
    {
      id: 'sl-struktural-napas-spread-tp',
      number: 27,
      levelId: 6,
      title: 'Stop Loss Struktural + Napas Spread & Target Likuiditas',
      readMinutes: 5,
      diagramId: 'sl-tp-engineering',
      summary: 'Stop Loss bukan musuh — ia adalah sabuk pengaman. Pelajari cara menempatkan SL di titik invalidasi sejati dan memetakan TP1/TP2 di kolam likuiditas nyata.',
      conceptBlocks: [
        {
          heading: 'Menempatkan Stop Loss yang Benar-Benar Melindungi',
          paragraphs: [
            'Penempatan SL yang benar selalu berbasis **Titik Invalidasi Struktural**: di bawah ujung wick terendah sweep (untuk Buy) atau di atas ujung wick tertinggi sweep (untuk Sell). Tambahkan **Napas Spread** ($0,40–$0,80 tergantung broker) di luar ujung wick tersebut agar pelebaran spread biasa tidak menyenggol SL-mu.',
            'Jangan pernah menaruh SL di tengah-tengah ruang kosong hanya agar terlihat kecil. SL yang terlalu rapat di dalam area noise justru membuatmu menjadi "sumbangan" pasar berulang kali.'
          ]
        },
        {
          heading: 'Memetakan TP1 (Aman) & TP2 (Magnet Utama)',
          paragraphs: [
            'Target Take Profit tidak boleh dikarang dari keinginan pribadi ("pengen untung $100 hari ini"). Target wajib menempel pada peta likuiditas: **TP1** di kolam likuiditas internal/terdekat (misal Asia High/Low atau ujung swing M15, minimal 1,5R–2R) dan **TP2** di Draw on Liquidity eksternal H1 (PDH/PDL atau H1 FVG). Khusus posisi Sell, naikkan garis TP sedikit (+$0,40) sebagai napas spread Ask.'
          ]
        }
      ],
      validRules: [
        'SL diletakkan di luar ujung wick sweep/swing invalidasi + buffer napas spread.',
        'TP1 diarahkan ke kolam likuiditas terdekat (min 1,5R–2R); TP2 ke magnet H1 (PDH/PDL).',
        'Rasio R:R keseluruhan setup minimal 1:2 sebelum tombol entry ditekan.'
      ],
      invalidRules: [
        'Memasang SL tepat menempel persis di ujung wick tanpa buffer spread.',
        'Memasang TP 500 pips jauh melampaui ADR harian Gold tanpa dasar likuiditas.',
        'Memindahkan SL makin menjauh saat posisi mendekati titik invalidasi.'
      ],
      xauScenario: {
        context: 'Setup Buy XAU/USD M5 setelah sweep Asia Low di 2.642,00; Entry FVG di 2.645,50.',
        steps: [
          'SL Struktural + Napas Spread: 2.642,00 - $0,60 = 2.641,40 (risiko $4,10).',
          'TP1 (Likuiditas Internal / Asia High 2.654,00): jarak +$8,50 (~2,07R) → kunci 70% posisi.',
          'TP2 (Magnet Eksternal / PDH 2.662,00): jarak +$16,50 (~4,02R) → biarkan sisa 30% berlari.'
        ]
      },
      goldenRules: [
        'SL yang tersentuh di titik invalidasi adalah SL yang baik — ia menyelamatkanmu dari kerugian lebih besar.',
        'Jangan memaksa pasar memberi 1:10 jika kolam likuiditas terdekat hanya berjarak 1:2,5.'
      ],
      quiz: [
        {
          question: 'Di mana letak Stop Loss yang paling logis secara struktur pada setup Buy pasca-sweep?',
          options: [
            'Di tengah-tengah FVG',
            'Di bawah ujung wick terendah candle sweep ditambah buffer napas spread',
            'Selalu persis 15 pips dari harga entry',
            'Di bawah harga terendah 6 bulan lalu'
          ],
          answerIndex: 1,
          explanation: 'Jika ujung wick sweep ditembus kembali, premis pembalikan resmi gagal — itulah titik keluar paling rasional.'
        },
        {
          question: 'Bagaimana cara menentukan target TP1 dan TP2 secara objektif?',
          options: [
            'Sesuai kebutuhan bayar cicilan bulan ini',
            'TP1 pada kolam likuiditas terdekat (minimal 1,5R–2R) dan TP2 pada Draw on Liquidity H1 (seperti PDH/PDL)',
            'Menunggu sampai merasa cukup secara emosi',
            'Tutup selalu saat profit $2'
          ],
          answerIndex: 1,
          explanation: 'Target berbasis likuiditas memastikan kamu keluar tepat di area tempat institusi juga mengambil profit.'
        },
        {
          question: 'Apa kesalahan fatal yang tidak boleh dilakukan ketika harga hampir menyentuh Stop Loss?',
          options: [
            'Menerima risiko sesuai rencana awal',
            'Menggeser Stop Loss menjauh dengan harapan harga akan berbalik',
            'Mencatat evaluasi di Jurnal setelah kena SL',
            'Berhenti sejenak untuk menenangkan diri'
          ],
          answerIndex: 1,
          explanation: 'Menggeser SL menjauh mengubah kerugian kecil yang terencana menjadi kerusakan akun permanen.'
        }
      ]
    },
    {
      id: 'manajemen-trade-partial-bep-notrade',
      number: 28,
      levelId: 6,
      title: 'Manajemen Trade: Partial Close, BEP & Kapan Tidak Trade',
      readMinutes: 5,
      diagramId: 'trade-management-scale',
      summary: 'Banyak trader hebat dalam entry tetapi buruk dalam exit: profit +2R berbalik jadi minus karena tamak, atau selalu geser BEP terlalu dini sampai tersapu napas normal Gold.',
      conceptBlocks: [
        {
          heading: 'Strategi Partial Close (Amankan Kantong) & Aturan Geser BEP',
          paragraphs: [
            'Gold terkenal cepat berbalik arah. Begitu harga mencapai **TP1 (minimal 1,5R–2R atau kolam likuiditas terdekat)**, terapkan disiplin **Partial Close**: tutup 60%–70% volume posisi untuk langsung mengunci profit nyata ke saldo, lalu pindahkan Stop Loss sisa 30%–40% lot (runner) ke **Break Even (BEP + spread)**.',
            'Kesalahan umum kedua adalah menggeser SL ke BEP terlalu cepat (misal baru profit +0,5R). Di XAU/USD, pullback normal hampir pasti menyenggol BEP terlalu dini dan meninggalkanmu gigit jari saat harga terbang ke TP2. Aturannya: **Hanya geser BEP setelah harga memecah struktur internal baru atau menyentuh TP1!**'
          ]
        },
        {
          heading: 'Seni Tidak Trade (No-Trade Days)',
          paragraphs: [
            'Trader konsisten sadar bahwa tidak semua hari cocok untuk scalping. Hari-hari yang sebaiknya kamu hindari: (1) Hari libur bank AS (Bank Holiday — pasar tipis dan datar), (2) Pagi hingga sore menjelang pengumuman FOMC malam hari, dan (3) Setelah hari sebelumnya terjadi lonjakan raksasa >$60 sehingga pasar masuk fase konsolidasi lebar (Seek & Destroy).'
          ]
        }
      ],
      validRules: [
        'Tutup 60%–70% posisi (Partial) di TP1 (≥1,5R–2R), lalu geser SL sisanya ke BEP.',
        'Hindari Trailing Stop ketat otomatis (10–15 pips) karena Gold sering membuat wick pullback tajam.',
        'Kenali kondisi Seek & Destroy (sweep atas-bawah bergantian tanpa arah) dan segera keluar dari pasar.'
      ],
      invalidRules: [
        'Menggeser SL ke BEP saat baru floating profit +10 pips (terlalu dini).',
        'Membiarkan floating profit +2,5R berbalik penuh menyentuh Stop Loss -1R tanpa mengamankan sepeser pun.',
        'Memaksa trading di hari libur bank AS atau menjelang FOMC.'
      ],
      xauScenario: {
        context: 'Kamu Buy 0,04 lot XAU/USD di 2.645, SL 2.641 (-$16 / 1R), TP1 2.653 (+2R), TP2 2.661 (+4R).',
        steps: [
          'Harga naik ke 2.648 (+0,75R): JANGAN sentuh SL! Biarkan posisi bernapas.',
          'Harga menyentuh TP1 2.653 (+2R): Close 0,03 lot (75%) → profit tunai +$24 masuk saldo! Geser SL sisa 0,01 lot ke 2.645,50 (BEP+).',
          'Skenario terbaik: runner 0,01 lot menyentuh TP2 2.661 (+$16 lagi → total +$40). Skenario terburuk: harga balik ke BEP → tetap pulang membawa +$24 bersih.'
        ]
      },
      goldenRules: [
        'Jangan biarkan trade yang sudah mencapai +2R berubah menjadi kerugian.',
        'Jangan geser BEP sebelum struktur baru terbentuk atau TP1 tercapai.'
      ],
      quiz: [
        {
          question: 'Kapan waktu paling tepat memindahkan Stop Loss ke titik impas (BEP) pada scalping XAU/USD?',
          options: [
            'Segera setelah profit +5 pips',
            'Setelah harga menyentuh TP1 (≥1,5R–2R) atau berhasil mencetak penembusan struktur searah baru',
            'Sebelum harga menyentuh harga entry',
            'Tidak pernah menggeser SL meski sudah +4R'
          ],
          answerIndex: 1,
          explanation: 'Menunggu TP1 atau struktur baru memberi ruang napas bagi retracement normal Gold agar tidak tertendang terlalu dini.'
        },
        {
          question: 'Apa yang dimaksud kondisi pasar "Seek & Destroy" yang wajib dihindari scalper?',
          options: [
            'Tren searah yang sangat rapi dan bersih',
            'Pasar yang menyapu High lalu langsung menyapu Low berulang kali tanpa arah (sering terjadi sebelum FOMC/NFP atau pasca-hari ekstrem)',
            'Jam pembukaan Silver Bullet',
            'Kondisi akun profit 5 kali berturut-turut'
          ],
          answerIndex: 1,
          explanation: 'Profil Seek & Destroy dirancang menghancurkan trader tren maupun reversal di kedua sisi; pilihan terbaik adalah diam.'
        },
        {
          question: 'Mengapa fitur Trailing Stop otomatis berjarak 10 pips kurang cocok untuk XAU/USD?',
          options: [
            'Karena XAU/USD sering melakukan wick pullback tajam yang langsung menyenggol trailing ketat sebelum melanjutkan tren',
            'Karena broker tidak punya fitur trailing',
            'Karena 10 pips terlalu lebar di Gold',
            'Karena trailing membuat risiko jadi 10%'
          ],
          answerIndex: 0,
          explanation: 'Volatilitas alami Gold jauh lebih besar dari 10 pips; gunakan partial close + BEP berbasis struktur.'
        }
      ]
    },
    {
      id: 'psikologi-scalper-anti-fomo',
      number: 29,
      levelId: 6,
      title: 'Psikologi Scalper: Anti-FOMO, Revenge & Analysis Freeze',
      readMinutes: 5,
      diagramId: 'psychology-discipline-loop',
      summary: '80% kebocoran profit di Analitik Jurnal bukan berasal dari teknik yang salah — melainkan dari 4 virus emosi: FOMO, Revenge Trading, Overtrading, dan Analysis Freeze.',
      conceptBlocks: [
        {
          heading: '4 Virus Emosi Terbesar & Penawarnya',
          paragraphs: [
            '1. **FOMO (Takut Ketinggalan):** Muncul saat melihat candle besar melesat tanpa kamu. Penawar: ingat hukum bus — setiap minggu ada puluhan sesi London & NY; ketinggalan 1 trade saldo tetap 100% utuh, mengejar trade jelek saldo berkurang.\n2. **Revenge Trading (Balas Dendam):** Muncul tepat 5 menit setelah kena SL karena ego terluka. Penawar: aturan jeda paksa 30 menit pasca-SL + batas mutlak maks 2 SL/hari.\n3. **Analysis Freeze (Kebanyakan Mikir):** Setup A+ sudah jelas tapi takut klik karena mencari "1 konfirmasi tambahan lagi". Penawar: batasi checklist hanya 5 poin utama; jika 5 poin terpenuhi dan risiko 0,5%–1% aman, tekan tombol dan serahkan hasil ke probabilitas.\n4. **Euphoria (Terlalu Percaya Diri):** Setelah 3x Win beruntun lalu mendadak menaikkan lot 3x lipat. Penawar: risiko persentase selalu tetap sama baik saat habis menang maupun habis kalah.'
          ]
        }
      ],
      validRules: [
        'Gunakan kolom "Kesalahan" & "Emosi" di modul Jurnal Trading agar Detektor Kebocoran menghitung berapa dolar biaya riil FOMO/Revenge kamu.',
        'Terapkan jeda pendinginan 30 menit (jauhkan layar) setiap kali terkena Stop Loss.',
        'Lakukan review mingguan setiap akhir pekan untuk melihat pola emosi mana yang paling mahal.'
      ],
      invalidRules: [
        'Trading saat sedang marah, kurang tidur, dikejar tagihan mendesak, atau multitasking berat.',
        'Menaikkan ukuran lot setelah menang besar karena merasa "tak terkalahkan".',
        'Menyalahkan "bandar/broker" saat kena SL padahal diri sendiri melanggar checklist.'
      ],
      xauScenario: {
        context: 'Membaca kebocoran psikologi di Analitik Jurnal Pro Amy FX.',
        steps: [
          'Dari 20 trade bulan ini: 14 trade sesuai SOP menghasilkan +$180 (Win Rate 64%).',
          'Namun 6 trade berlabel kesalahan "FOMO" & "Revenge" menghabiskan -$135!',
          'Kesimpulan nyata: strategimu SUDAH profitabel; cukup hapus 2 kebiasaan FOMO & Revenge, maka profit bersihmu langsung melesat 4 kali lipat tanpa perlu belajar indikator baru!'
        ]
      },
      goldenRules: [
        'Satu kesalahan psikologi (FOMO/Revenge) bisa menghapus kerja keras 3 trade disiplin.',
        'Ukur keberhasilan harian dari skor disiplin SOP, bukan semata warna hijau/merah saldo hari itu.'
      ],
      quiz: [
        {
          question: 'Kamu baru saja terkena Stop Loss dan muncul dorongan kuat untuk langsung masuk posisi baru agar saldo hari ini kembali hijau. Virus emosi apakah ini?',
          options: [
            'Analysis Freeze',
            'Revenge Trading (Balas Dendam)',
            'Backtest Bias',
            'Disiplin SOP'
          ],
          answerIndex: 1,
          explanation: 'Keinginan impulsif segera membalikkan kerugian dalam sesi yang sama adalah ciri khas Revenge Trading.'
        },
        {
          question: 'Apa obat paling praktis untuk mengatasi Analysis Freeze (ragu klik meski setup sudah memenuhi seluruh syarat)?',
          options: [
            'Tambahkan 8 indikator lagi supaya lebih yakin',
            'Ringkas checklist ke 5 syarat inti, kecilkan risiko ke 0,5% agar tidak takut rugi, lalu eksekusi mekanis saat 5 syarat terpenuhi',
            'Tunggu sampai harga hampir menyentuh TP baru masuk',
            'Minta orang lain yang klik'
          ],
          answerIndex: 1,
          explanation: 'Analysis Freeze lahir dari terlalu banyak filter dan rasa takut rugi; checklist ringkas + risiko kecil meluruhkan keraguan.'
        },
        {
          question: 'Bagaimana sikap yang benar setelah mencatat 4 kali Win beruntun?',
          options: [
            'Langsung lipatgandakan lot menjadi 5% risiko karena sedang hoki',
            'Pertahankan persentase risiko 0,5%–1% dan standar checklist A+ yang persis sama — waspadai overconfidence',
            'Mulai entry di luar jam Killzone',
            'Berhenti menggunakan Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Euphoria pasca-win streak sering memicu over-leverage yang menghapus seluruh profit beruntun dalam 1 trade.'
        }
      ]
    },
    {
      id: 'protokol-100-sample-mandiri',
      number: 30,
      levelId: 6,
      title: 'Protokol 100 Sample Backtest, Evaluasi Jurnal & Lulus Mandiri',
      readMinutes: 6,
      diagramId: 'graduation-100-samples',
      summary: 'Membaca 30 pelajaran ini baru memberi kamu peta — konsistensi profit lahir dari mengeksekusi Protokol 3 Tahap: 50 Backtest + 30 Forward Demo/Cent + 20 Live Terukur.',
      conceptBlocks: [
        {
          heading: 'Jembatan Nyata Dari "Paham Teori" ke "Profit Konsisten"',
          paragraphs: [
            'Jangan langsung memasukkan uang tabungan besar begitu selesai membaca Academy! Gunakan **Protokol 100 Sample** yang dipakai para trader institusional:',
            '• **Tahap 1 — 50 Sample Backtest (Replay):** Pilih **1 Model Utama** (misal Model 1: Sweep → MSS → FVG). Mundurkan chart XAU/USD, jalankan bar-by-bar di sesi London/NY WITA, catat Win, Loss, R:R, dan screenshot tanpa curang melihat masa depan (hindari *Hindsight Bias*).\n• **Tahap 2 — 30 Sample Forward Test (Akun Demo / Cent):** Eksekusi model yang sama persis di pasar live menggunakan uang virtual atau akun Cent dengan risiko 0,5%–1%. Rekam SEMUA trade ke modul **Jurnal Trading** dan pantau **Analitik Jurnal Pro**.\n• **Tahap 3 — 20 Sample Live Terukur & Scaling:** Kamu baru boleh naik ke akun real/prop firm jika pada Tahap 2 kamu mencatat **Profit Factor ≥ 1,4**, **Expectancy positif**, **Max Drawdown < 8%**, dan **tingkat pelanggaran SOP < 10%**.'
          ]
        },
        {
          heading: 'Ekosistem Harianmu di Amy FX Pro Sudah Lengkap',
          paragraphs: [
            'Mulai hari ini, kamu punya satu siklus kerja tertutup yang lengkap: cek berita di **Market Intel** → baca struktur & peta likuiditas di **Mapping** → catat & audit kebocoran di **Jurnal Trading + Analitik Pro** → diskusikan review rutinmu bersama **Amy Live**. Selamat menyelesaikan seluruh 6 Level Amy FX Academy!'
          ]
        }
      ],
      validRules: [
        'Selesaikan minimal 50 sample Backtest + 30 sample Forward Test dengan 1 model utama sebelum scaling modal.',
        'Evaluasi performa dari 4 metrik objektif di Analitik Jurnal Pro: Profit Factor, Expectancy, Max Drawdown, dan Biaya Kebocoran Emosi.',
        'Lakukan review mingguan setiap Sabtu/Minggu saat pasar Gold tutup.'
      ],
      invalidRules: [
        'Langsung deposit besar di akun real tanpa pernah punya data 30 trade di Jurnal.',
        'Memanipulasi hasil backtest dengan hanya mencatat setup yang kena TP dan melupakan yang kena SL.',
        'Berhenti mengisi Jurnal setelah mulai merasakan beberapa kali profit.'
      ],
      xauScenario: {
        context: 'Kriteria Lulus Mandiri di Analitik Jurnal Pro (dari 30 trade Forward Test).',
        steps: [
          'Profit Factor ≥ 1,40 dan Expectancy > +0,25R per trade.',
          'Max Drawdown terjaga di bawah 8% tanpa satu pun trade melampaui batas risiko 1%.',
          'Kebocoran psikologi (FOMO/Revenge) menyusut mendekati $0 → Kamu resmi siap scaling modal bertahap!'
        ]
      },
      goldenRules: [
        'Data 100 sample mengubah harapan menjadi keyakinan matematis.',
        'Profit konsisten adalah efek samping alami dari eksekusi SOP yang bersih dan berulang.'
      ],
      quiz: [
        {
          question: 'Bagaimana pembagian ideal Protokol 100 Sample sebelum melakukan scaling modal besar di akun real?',
          options: [
            'Langsung 100 trade di akun real hari pertama',
            '50 Sample Backtest Replay → 30 Sample Forward Test (Demo/Cent) → 20 Sample Live Terukur',
            '100 kali ganti strategi di YouTube',
            '5 trade menang lalu langsung pinjam uang untuk deposit'
          ],
          answerIndex: 1,
          explanation: 'Tahapan 50–30–20 membuktikan keunggulan strategi di data historis sekaligus menguji mentalmu di pasar live berisiko rendah.'
        },
        {
          question: 'Apa metrik kelulusan objektif di Analitik Jurnal Pro yang menandakan kamu siap naik tahap ke akun real/scaling?',
          options: [
            'Pernah profit 1 kali sebesar +$500 dengan lot acak',
            'Profit Factor ≥ 1,4, Expectancy positif, Max Drawdown terkendali (<8%), dan disiplin SOP tinggi selama minimal 30 trade',
            'Jumlah trade di atas 200 per minggu',
            'Tidak pernah sekalipun terkena Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Konsistensi diukur dari Profit Factor, Expectancy, kontrol drawdown, dan kepatuhan SOP — bukan 1 kali hoki besar.'
        },
        {
          question: 'Bagaimana cara menghindari Backtest Bias (Hindsight Bias) saat melatih mata di chart historis?',
          options: [
            'Melihat chart yang sudah jadi dari kiri ke kanan lalu mencatat setup yang TP saja',
            'Gunakan mode Replay candle-by-candle tanpa melihat masa depan, dan catat SEMUA setup baik yang TP maupun yang SL',
            'Hanya backtest pada hari-hari yang bullish saja',
            'Tidak perlu mencatat hasil backtest'
          ],
          answerIndex: 1,
          explanation: 'Replay bar-by-bar memaksa otak membuat keputusan real-time lengkap dengan ketidakpastian seperti pasar live.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
