/* Amy FX Academy — Bagian II: Struktur Pasar & Peta Likuiditas (Bab 07–12)
 * Format Buku Trading Interaktif (Single-Flow Textbook · Nol Skip · Nol Duplikasi)
 * Catatan: Entri `level-likuiditas-kunci-xauusd` tetap dipertahankan sementara di akhir file
 * untuk Bab 13 (Bagian III) sampai penulisan ulang Tahap 3.
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
      code: 'Bagian II',
      title: 'Struktur Pasar & Peta Liquidity',
      tagline: 'Membaca struktur harga murni tanpa indikator, menyatukan H4/H1/M15/M5, membedakan BOS valid vs sweep palsu, Dealing Range, peta BSL/SSL, hingga Liquidity Sweep vs Liquidity Run.'
    }
  ];

  const LESSONS = [
    // =========================================================================
    // BAB 07 — STRUKTUR PASAR MURNI
    // =========================================================================
    {
      id: 'struktur-pasar-dasar',
      number: 7,
      levelId: 1,
      bookFormat: true,
      title: 'Struktur Pasar Murni: Swing High/Low, Tren Naik, Tren Turun & Konsolidasi',
      subtitle: 'Cara membaca kerangka pergerakan harga langsung dari candlestick tanpa indikator: definisi mekanis 3-Candle Swing, klasifikasi tiga kondisi pasar, serta perbedaan Strong vs Weak Point.',
      readMinutes: 10,
      diagramId: 'market-structure-basic',
      diagramAfterSection: 1,
      summary: 'Pahami cara menentukan Swing High/Low secara objektif (aturan 3-candle fraktal), membedakan tren naik (HH–HL), tren turun (LH–LL), dan konsolidasi, serta mengenali Strong vs Weak High/Low di XAU/USD.',
      bookSections: [
        {
          number: '7.1',
          heading: 'Pengertian Struktur Pasar dan Definisi Objektif Swing (Aturan 3-Candle)',
          paragraphs: [
            '**Struktur Pasar (*Market Structure*)** adalah susunan puncak dan lembah harga yang menunjukkan arah dominasi pasar dari waktu ke waktu. Harga di pasar keuangan tidak bergerak dalam satu garis lurus, melainkan membentuk rangkaian ayunan naik menuju puncak (**Swing High**) dan ayunan turun menuju lembah (**Swing Low**).',
            'Agar penandaan puncak dan lembah tidak berdasarkan perkiraan subjektif, metodologi ICT menggunakan **Aturan Mekanis 3-Candle Fraktal** (standar Larry Williams) yang memiliki kriteria objektif:'
          ],
          exampleBox: {
            title: 'Definisi Mekanis 3-Candle Fraktal',
            rows: [
              {
                label: 'Swing High Valid',
                detail: 'Satu candle tengah memiliki titik **High lebih tinggi** daripada candle tepat di sebelah kiri **dan** candle tepat di sebelah kanannya. Kondisi ini menandakan tekanan beli sempat mencapai puncak lalu gagal dilanjutkan pada candle ketiga.'
              },
              {
                label: 'Swing Low Valid',
                detail: 'Satu candle tengah memiliki titik **Low lebih rendah** daripada candle tepat di sebelah kiri **dan** candle tepat di sebelah kanannya. Kondisi ini menandakan tekanan jual sempat mencapai titik terendah lalu gagal dilanjutkan pada candle ketiga.'
              },
              {
                label: 'Syarat Konfirmasi',
                detail: 'Swing High atau Swing Low baru dinyatakan sah **setelah candle ke-3 selesai ditutup (*Candle Close*)**. Candle yang masih berjalan belum boleh dilabeli sebagai swing resmi.'
              }
            ]
          }
        },
        {
          number: '7.2',
          heading: 'Tiga Kondisi Struktur Pasar: Bullish, Bearish, dan Konsolidasi',
          paragraphs: [
            'Dengan menghubungkan urutan Swing High dan Swing Low dari kiri ke kanan, pergerakan harga pada seluruh instrumen — termasuk Gold (`XAU/USD`) — terbagi menjadi tiga kondisi struktur:',
            '1. **Tren Naik (*Bullish Structure*):** Harga secara konsisten membentuk puncak lebih tinggi (**Higher High / HH**) diikuti lembah koreksi yang lebih tinggi daripada lembah sebelumnya (**Higher Low / HL**). 2. **Tren Turun (*Bearish Structure*):** Harga membentuk puncak pantulan lebih rendah (**Lower High / LH**) diikuti penembusan ke lembah baru yang lebih rendah (**Lower Low / LL**). 3. **Konsolidasi (*Sideways / Range*):** Harga bergerak mendatar di dalam rentang atas dan bawah yang relatif sejajar tanpa mencetak `HH` maupun `LL` baru. Di Gold, fase ini paling sering muncul pada **Sesi Asia** sebelum volume Eropa dan AS masuk.'
          ],
          table: {
            caption: 'Klasifikasi 3 Kondisi Struktur Pasar pada XAU/USD',
            headers: ['Kondisi Pasar', 'Urutan Swing', 'Dominasi Pasar', 'Prioritas Keputusan Trader'],
            rows: [
              ['Tren Naik (Bullish)', 'HH → HL → HH → HL', 'Pembeli mengendalikan arah; penurunan bersifat koreksi', 'Prioritaskan peluang BUY saat harga koreksi ke area Discount'],
              ['Tren Turun (Bearish)', 'LH → LL → LH → LL', 'Penjual mengendalikan arah; kenaikan bersifat koreksi', 'Prioritaskan peluang SELL saat harga koreksi ke area Premium'],
              ['Konsolidasi (Sideways)', 'High & Low sejajar', 'Akumulasi order; belum ada pihak yang menguasai arah', 'Hindari entry di tengah range; tunggu tembusan valid atau sweep batas luar']
            ]
          }
        },
        {
          number: '7.3',
          heading: 'Perbedaan Strong High/Low dan Weak High/Low',
          paragraphs: [
            'Dalam sebuah tren yang sedang berjalan, tidak setiap puncak dan lembah memiliki fungsi yang sama. Membedakan titik kuat (*Strong*) dan titik lemah (*Weak*) sangat penting untuk menentukan batas validitas struktur dan target harga:',
            '1. **Pada Tren Naik (`HH → HL → HH`):** Titik **Higher Low (`HL`)** yang menjadi asal dorongan hingga berhasil menembus puncak sebelumnya disebut **Strong Low** — titik ini melindungi kelanjutan tren naik dan menjadi batas invalidasi struktur. Sebaliknya, puncak terbaru (**Higher High / HH**) disebut **Weak High** karena dalam arus Bullish titik tersebut berprobabilitas tinggi untuk ditembus kembali oleh dorongan berikutnya. 2. **Pada Tren Turun (`LH → LL → LH`):** Titik **Lower High (`LH`)** yang menjadi asal penurunan hingga berhasil menembus lembah sebelumnya disebut **Strong High** (batas invalidasi tren turun), sedangkan lembah terbaru (**Lower Low / LL**) disebut **Weak Low** (target kelanjutan penurunan).'
          ],
          exampleBox: {
            title: 'Contoh Penentuan Strong Low dan Weak High di M15 XAU/USD',
            rows: [
              {
                label: 'Gelombang 1',
                detail: 'Gold naik dari `2.640,00` (Swing Low awal) ke `2.655,00` (Swing High pertama), lalu terkoreksi ke `2.646,00`.'
              },
              {
                label: 'Gelombang 2 (Terbentuknya Strong Low)',
                detail: 'Dari `2.646,00`, dorongan beli menembus dan menutup candle di `2.662,00` (melewati `2.655,00`). Titik **`2.646,00` resmi menjadi Strong Low**, sedangkan **`2.662,00` menjadi Weak High**.'
              },
              {
                label: 'Implikasi Analisis',
                detail: 'Selama harga bertahan di atas `2.646,00`, struktur tetap sah **Bullish**. Penurunan setelah `2.662,00` dibaca sebagai koreksi dengan target kelanjutan menembus Weak High `2.662,00`.'
              }
            ]
          }
        },
        {
          number: '7.4',
          heading: 'Menghindari Over-Labeling pada Koreksi Minor',
          paragraphs: [
            'Kesalahan umum saat mulai memetakan struktur adalah melabeli setiap 1–2 candle koreksi kecil sebagai perubahan arah tren. Akibatnya, chart dipenuhi label `HH/HL/LH/LL` yang saling bertentangan.',
            'Bedakan secara tegas antara **swing struktural utama** (gelombang yang benar-benar menghasilkan penembusan High atau Low sebelumnya) dengan **koreksi minor** di tengah perjalanan harga. Pada **Bab 08** kita akan menyatukan struktur ini lintas timeframe (`H4/H1`, `M15`, `M5`), lalu pada **Bab 10** kita akan membingkainya ke dalam *Dealing Range* agar struktur selalu terbaca rapi.'
          ],
          callout: {
            tone: 'info',
            title: 'Latihan Praktis Pemetaan Struktur',
            body: 'Buka chart XAU/USD timeframe M15 atau H1 tanpa indikator tambahan. Tandai 5 Swing High dan 5 Swing Low utama yang memenuhi aturan 3-candle, lalu klasifikasikan apakah rangkaiannya membentuk tren Bullish (`HH–HL`), Bearish (`LH–LL`), atau Konsolidasi.'
          }
        }
      ],
      keyTakeaways: [
        '**Swing High** valid = 1 candle tengah dengan `High` lebih tinggi dari candle kiri & kanan; **Swing Low** valid = 1 candle tengah dengan `Low` lebih rendah dari kiri & kanan (wajib menunggu candle ke-3 close).',
        'Struktur pasar terbagi menjadi 3 kondisi: **Bullish (`HH–HL`)**, **Bearish (`LH–LL`)**, dan **Konsolidasi** (High & Low sejajar).',
        '**Strong Low** (tren naik) atau **Strong High** (tren turun) adalah titik asal dorongan yang menembus struktur lama dan menjadi batas validitas tren, sedangkan **Weak High/Low** menjadi target kelanjutan.',
        'Fokus pada swing struktural utama yang menciptakan break struktur, bukan pada setiap 1–2 candle koreksi minor.'
      ],
      bridgeNext: 'Setelah mampu membaca struktur `HH–HL` dan `LH–LL` pada satu timeframe, tantangan berikutnya muncul ketika arah di `H1` tampak berbeda dari `M5`. Di **Bab 08**, kita mempelajari **Analisis Multi-Timeframe (Top-Down)** untuk menyatukan `H4/H1`, `M15`, dan `M5` secara terukur.',
      conceptBlocks: [
        {
          heading: 'Aturan 3-Candle Swing, HH/HL vs LH/LL & Strong/Weak Point',
          paragraphs: [
            'Swing High valid memiliki High lebih tinggi daripada candle kiri dan kanannya; Swing Low valid memiliki Low lebih rendah daripada kiri dan kanannya.',
            'Tren Naik membentuk HH–HL (Strong Low dilindungi, Weak High ditargetkan); Tren Turun membentuk LH–LL (Strong High dilindungi, Weak Low ditargetkan); Konsolidasi bergerak mendatar dalam range.'
          ]
        }
      ],
      mappingSteps: [
        'Buka chart XAU/USD bersih tanpa indikator agar gelombang harga terlihat jelas.',
        'Tandai Swing High dan Swing Low yang memenuhi aturan mekanis 3-candle fraktal.',
        'Identifikasi kondisi tren aktif (HH–HL Bullish, LH–LL Bearish, atau Sideways) lalu tandai Strong Point terakhir sebagai batas validitas struktur.'
      ],
      decisionTree: [
        {
          condition: 'Harga mencetak HH baru lalu terkoreksi, tetapi masih bertahan di atas Strong Low (HL) sebelumnya.',
          action: 'Struktur masih sah Bullish; perlakukan penurunan sebagai koreksi (pullback), bukan perubahan tren.'
        },
        {
          condition: 'Harga bergerak bolak-balik di antara batas atas dan bawah yang sejajar tanpa mencetak HH maupun LL baru.',
          action: 'Klasifikasikan sebagai Konsolidasi (Sideways) dan hindari membuka posisi di tengah range.'
        }
      ],
      failedCase: {
        context: 'Trader langsung membuka SELL hanya karena muncul 2 candle merah kecil di tengah tren naik M15 yang masih jauh di atas Strong Low.',
        whyFailed: 'Menganggap koreksi minor sebagai perubahan tren membuat trader melawan arus pembeli utama.'
      },
      validRules: [
        'Tunggu candle ke-3 selesai ditutup untuk mengonfirmasi Swing High/Low 3-candle.',
        'Gunakan Strong Low (tren naik) atau Strong High (tren turun) sebagai batas validitas struktur.'
      ],
      invalidRules: [
        'Melabeli candle yang masih berjalan (belum close) sebagai swing resmi.',
        'Menganggap setiap 1–2 candle koreksi sebagai tanda reversal tren penuh.'
      ],
      xauScenario: {
        context: 'Chart M15 XAU/USD naik dari 2.640 → 2.655 → koreksi 2.646 → tembus dan close di 2.662.',
        steps: [
          'Titik 2.646 menjadi Strong Low karena berhasil meluncurkan harga menembus puncak 2.655.',
          'Titik 2.662 menjadi Weak High yang menjadi target kelanjutan setelah koreksi selesai.'
        ]
      },
      goldenRules: [
        'Struktur pasar adalah dasar objektif pertama sebelum menerapkan konsep ICT lanjutan.'
      ],
      practiceCta: {
        label: 'Latih Baca Struktur di Simulator 100 Kasus',
        description: 'Uji ketepatan membedakan tren naik, tren turun, dan konsolidasi pada chart latihan XAU/USD.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Menurut aturan mekanis 3-candle fraktal, kapan sebuah **Swing High** dinyatakan sah terbentuk?',
          options: [
            'Saat satu candle hijau terlihat panjang meskipun belum selesai ditutup',
            'Saat 1 candle tengah memiliki High lebih tinggi daripada candle tepat di kiri dan kanannya, dan candle ke-3 sudah selesai close',
            'Saat harga berada di atas garis Moving Average 200',
            'Setiap kali muncul satu candle merah kecil di M1'
          ],
          answerIndex: 1,
          explanation: 'Aturan 3-candle fraktal mensyaratkan High candle tengah tertinggi dibanding kiri & kanannya, serta terkonfirmasi setelah candle ke-3 close.'
        },
        {
          question: 'Pada struktur tren naik Gold (`2.640 → 2.655 → koreksi 2.646 → tembus 2.662`), titik harga `2.646` disebut sebagai apa?',
          options: [
            'Weak Low yang pasti segera ditembus ke bawah',
            'Strong Low — titik lembah kuat asal dorongan yang menembus puncak lama dan menjadi batas validitas tren naik',
            'Konsolidasi akhir pekan',
            'Area spread rollover'
          ],
          answerIndex: 1,
          explanation: 'Karena dorongan dari 2.646 berhasil menembus puncak lama 2.655, maka 2.646 berstatus Strong Low yang melindungi tren naik.'
        },
        {
          question: 'Dalam tren naik yang sehat (`HH–HL`), mengapa puncak terbaru (`HH`) disebut **Weak High**?',
          options: [
            'Karena harganya pasti langsung jatuh ke nol',
            'Karena dalam arus tren naik, puncak tersebut cenderung kembali ditembus oleh gelombang naik berikutnya setelah koreksi selesai',
            'Karena candle puncaknya selalu berwarna merah',
            'Karena tidak boleh dijadikan target Take Profit'
          ],
          answerIndex: 1,
          explanation: 'Weak High berarti puncak tersebut tidak menahan arus tren utama dan secara probabilitas tinggi ditargetkan untuk ditembus kembali.'
        },
        {
          question: 'Ketika harga XAU/USD terus bergerak bolak-balik di antara `2.646` dan `2.654` tanpa mencetak puncak lebih tinggi maupun lembah lebih rendah, kondisi apa yang sedang terjadi?',
          options: [
            'Tren Naik (Bullish HH–HL)',
            'Tren Turun (Bearish LH–LL)',
            'Konsolidasi (Sideways / Range) — pasar sedang akumulasi tanpa arah tren jelas',
            'Sinyal wajib membuka 5 posisi sekaligus di tengah range'
          ],
          answerIndex: 2,
          explanation: 'Puncak dan lembah yang sejajar dalam satu rentang menunjukkan konsolidasi; trader disiplin menunggu arah keluar atau sweep batas luar.'
        }
      ]
    },

    // =========================================================================
    // BAB 08 — MULTI-TIMEFRAME (TOP-DOWN)
    // =========================================================================
    {
      id: 'multi-timeframe-h1-m15-m5',
      number: 8,
      levelId: 1,
      bookFormat: true,
      title: 'Multi-Timeframe (Top-Down): Menyatukan H4/H1, M15, dan M5 Tanpa Bingung',
      subtitle: 'Memahami sifat fraktal pasar lintas timeframe, pembagian tugas tegas tiga layar Top-Down, serta matriks keputusan saat timeframe besar dan kecil berbeda arah.',
      readMinutes: 10,
      diagramId: 'mtf-alignment',
      diagramAfterSection: 2,
      summary: 'Kuasai analisis Top-Down (H4/H1 sebagai peta arah, M15 sebagai struktur kerja, M5 sebagai konfirmasi presisi), sifat fraktal pasar, dan matriks sinkronisasi 3 timeframe.',
      bookSections: [
        {
          number: '8.1',
          heading: 'Mengapa Analisis Membutuhkan Multi-Timeframe (Top-Down Analysis)',
          paragraphs: [
            'Pada Bab 05 telah dijelaskan bahwa 1 candle `H1` tersusun dari 4 candle `M15` dan 12 candle `M5`. Dalam pengambilan keputusan trading, mengandalkan satu timeframe saja selalu menimbulkan keterbatasan struktural:',
            '1. **Hanya melihat timeframe kecil (`M5` / `M1`):** Detail pergerakan jangka pendek terlihat jelas, tetapi arah tren utama dan level penahanan besar di `H1/H4` tidak tampak sehingga mudah terjebak membuka posisi melawan arus besar. 2. **Hanya melihat timeframe besar (`D1` / `H4`):** Arah utama terlihat jelas, tetapi jarak Stop Loss struktural terlalu lebar (`$15–$30` di Gold) untuk eksekusi intraday.',
            'Solusi bakunya adalah **Top-Down Analysis**: selalu mulai membaca struktur dari **timeframe besar terlebih dahulu** untuk menetapkan arah dan target, lalu turun bertahap ke **timeframe lebih kecil** untuk mencari zona tunggu dan titik eksekusi yang presisi.'
          ]
        },
        {
          number: '8.2',
          heading: 'Sifat Fraktal Pasar: Perbedaan Tampilan Koreksi di H1 vs M5',
          paragraphs: [
            'Pasar keuangan bersifat **fraktal**, artinya struktur `HH–HL` dan `LH–LL` berulang di setiap skala waktu. Konsekuensi langsungnya: **satu fase koreksi sehat pada timeframe besar selalu tersusun dari satu tren mini lengkap pada timeframe kecil.**',
            'Perhatikan contoh perbandingan satu pergerakan Gold (`XAU/USD`) yang sama pada dua layar berbeda berikut:'
          ],
          exampleBox: {
            title: 'Satu Pergerakan Harga yang Sama di H1 vs M5 (XAU/USD)',
            rows: [
              {
                label: 'Tampilan di Layar H1 (Arah Utama)',
                detail: 'Gold naik kuat dari `2.640,00` ke `2.680,00` (`+$40`). Selanjutnya harga terkoreksi selama 2 jam menuju `2.658,00` — masih jauh di atas Strong Low `2.640,00`. Struktur H1 tetap **100% Bullish**.'
              },
              {
                label: 'Tampilan di Layar M5 (Detail Internal)',
                detail: 'Penurunan koreksi `$22` (`2.680 → 2.658`) selama 2 jam tersebut terdiri dari **24 batang candle M5** yang membentuk struktur turun rapi (`LH → LL → LH → LL`). Trader yang hanya memantau M5 keliru menganggap pasar sedang tren turun kuat lalu membuka SELL tepat di dasar koreksi H1.'
              },
              {
                label: 'Kelanjutan Pergerakan',
                detail: 'Saat harga menyentuh zona permintaan H1 di `2.658,00`, tekanan beli institusi kembali masuk dan mendorong harga naik ke `2.685,00`, menyapu seluruh posisi SELL counter-trend M5.'
              }
            ]
          },
          paragraphsAfter: [
            'Prinsip operasionalnya jelas: **ketika timeframe kecil (`M5`) bergerak berlawanan dengan timeframe besar (`H1/M15`), perlakukan gerak `M5` sebagai fase koreksi, bukan sinyal untuk melawan arus utama.** Tunggu hingga `M5` selesai terkoreksi di area kerja dan kembali berbalik searah dengan `H1/M15`.'
          ]
        },
        {
          number: '8.3',
          heading: 'Protokol 3-Layar Top-Down untuk Trading Intraday & Scalping Gold',
          paragraphs: [
            'Membuka terlalu banyak timeframe sekaligus dari `Monthly` hingga `M1` justru menghasilkan sinyal saling bertabrakan (*analysis paralysis*). Untuk trading intraday dan scalping XAU/USD (sejalan dengan panel 3-TF pada Cockpit Mapping Amy FX Pro), bagi peran secara tegas pada **tiga lapisan timeframe**:'
          ],
          table: {
            caption: 'Pembagian Peran 3 Lapisan Timeframe Top-Down XAU/USD',
            headers: ['Lapisan', 'Timeframe', 'Tugas Utama', 'Hal yang Dihindari'],
            rows: [
              ['1. Peta Besar (HTF)', 'H4 / H1', 'Menentukan arah arus utama (Bullish/Bearish) dan target Liquidity besar (PDH/PDL, Swing H1/H4)', 'Mencari titik entry langsung di H4 karena jarak Stop Loss terlalu lebar ($15–$30)'],
              ['2. Struktur Kerja (MTF)', 'M15', 'Membaca struktur intraday aktif, membingkai Dealing Range, dan menandai zona tunggu (POI)', 'Masuk posisi di tengah range sebelum harga mencapai zona POI atau saat M15 belum selaras'],
              ['3. Eksekusi Presisi (LTF)', 'M5', 'Mengamati reaksi harga di zona M15/H1 dan menunggu konfirmasi balik arah searah arus utama', 'Melawan arah H1/M15 hanya berdasarkan 2–3 candle cepat di M5']
            ]
          }
        },
        {
          number: '8.4',
          heading: 'Matriks Sinkronisasi: Kapan Eksekusi Penuh vs Kapan Wajib WAIT',
          paragraphs: [
            'Sebelum mengambil keputusan transaksi, cocokkan hubungan arah antara `H1`, `M15`, dan `M5` menggunakan tiga skenario objektif berikut:'
          ],
          exampleBox: {
            title: '3 Skenario Sinkronisasi H1 · M15 · M5',
            rows: [
              {
                label: 'Skenario 1: H1 Bullish + M15 Bullish + M5 Bullish (Selaras 3/3)',
                detail: '**Kualitas Tertinggi (A+).** Arus besar, struktur kerja, dan momentum eksekusi mendukung satu arah yang sama. Layak eksekusi penuh dengan risiko baku (0,5%–1%).'
              },
              {
                label: 'Skenario 2: H1 Bullish + M15 Bullish + M5 Bearish (Fase Koreksi)',
                detail: '**Status: SIAGA / TUNGGU.** Jangan membuka SELL melawan arah di M5. Biarkan M5 menyelesaikan penurunan menuju area Discount M15, lalu cari BUY setelah M5 berbalik kembali menjadi Bullish.'
              },
              {
                label: 'Skenario 3: H1 Bullish + M15 Bearish (Konflik Arah Utama)',
                detail: '**Status: WAIT.** H1 sedang mengalami koreksi dalam (*deep pullback*) atau melemah. Tunggu hingga M15 kembali selaras dengan H1, atau hingga H1 resmi mengonfirmasi perubahan struktur.'
              }
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Risiko Melawan Arus Utama (Counter-Trend) di Gold',
            body: 'Pada instrumen bervolatilitas tinggi seperti Gold, posisi counter-trend di M5 yang melawan arah H1/M15 sangat rentan. Ketika aliran order institusi H1 kembali aktif, satu candle M5 dapat melompat $8 hingga $15 dalam beberapa menit dan langsung menembus Stop Loss.'
          }
        }
      ],
      keyTakeaways: [
        'Gunakan **Top-Down Analysis** berurutan: **H4/H1** (peta arah) → **M15** (struktur & zona kerja) → **M5** (konfirmasi eksekusi).',
        'Karena pasar bersifat **fraktal**, koreksi normal pada `H1` tampil sebagai tren penuh pada `M5` — hindari membuka posisi melawan arah HTF.',
        'Peluang kualitas tertinggi muncul saat **M5 menyelesaikan koreksi lalu berbalik selaras** dengan `H1` dan `M15` (sinkronisasi 3/3).',
        'Jika `H1` dan `M15` saling bertabrakan arah, keputusan paling rasional adalah **WAIT** sampai struktur kembali selaras.'
      ],
      bridgeNext: 'Setelah memahami penyelarasan `H4/H1`, `M15`, dan `M5`, langkah krusial berikutnya adalah memastikan apakah penembusan sebuah Swing High atau Swing Low benar-benar valid atau sekadar jebakan. Di **Bab 09**, kita membedah aturan mekanis **Break of Structure (BOS) Valid vs Liquidity Sweep**.',
      conceptBlocks: [
        {
          heading: 'Alur Top-Down H4/H1 → M15 → M5 & Sifat Fraktal Pasar',
          paragraphs: [
            'H4/H1 menentukan arah arus utama dan target besar, M15 membingkai struktur kerja dan zona tunggu, sedangkan M5 bertugas mencari konfirmasi saat harga tiba di zona M15.',
            'Koreksi pada H1 selalu terlihat seperti tren penuh pada M5; trader disiplin menunggu M5 berbalik kembali searah H1/M15 daripada melawan arus utama.'
          ]
        }
      ],
      mappingSteps: [
        'Buka H4/H1 terlebih dahulu untuk menentukan apakah arus besar sedang Bullish, Bearish, atau Range.',
        'Turun ke M15 untuk membaca struktur kerja aktif dan menandai area tunggu searah H1.',
        'Turun ke M5 hanya saat harga sudah menyentuh area M15 untuk menunggu konfirmasi searah H1/M15.'
      ],
      decisionTree: [
        {
          condition: 'H1 Bullish dan M15 Bullish, tetapi M5 sedang turun membentuk LH–LL menuju area M15.',
          action: 'Hindari SELL counter-trend di M5. Tunggu M5 selesai terkoreksi di area M15 lalu berbalik Bullish untuk mencari BUY.'
        },
        {
          condition: 'H1 dan M15 saling berlawanan arah tanpa struktur jelas.',
          action: 'Pilih WAIT hingga M15 kembali selaras dengan arah H1 atau H1 resmi berpindah struktur.'
        }
      ],
      failedCase: {
        context: 'Trader hanya memantau layar M5, melihat penurunan $18 selama 1,5 jam, lalu membuka SELL tepat saat harga menyentuh zona beli H1.',
        whyFailed: 'Tidak mengecek H1 bahwa penurunan M5 tersebut hanyalah koreksi dalam tren naik H1; saat pembeli H1 masuk kembali, posisi SELL langsung terkena SL.'
      },
      validRules: [
        'Selalu baca chart dari timeframe besar ke kecil (Top-Down) sebelum mengambil keputusan.',
        'Prioritaskan setup ketika H1, M15, dan M5 kembali selaras ke satu arah.'
      ],
      invalidRules: [
        'Menentukan arah utama hanya dari chart M5 atau M1.',
        'Melawan arus M15/H1 di M5 saat koreksi mendekati zona permintaan HTF.'
      ],
      xauScenario: {
        context: 'H1 Gold naik 2.640 → 2.680 lalu koreksi ke 2.658; di M5 koreksi tampil sebagai tren turun.',
        steps: [
          'Pertahankan bias H1 Bullish selama harga berada di atas Strong Low 2.640.',
          'Pantau M5 saat harga tiba di 2.658: tunggu M5 berhenti mencetak LL dan berbalik naik sebelum membuka BUY.'
        ]
      },
      goldenRules: [
        'Timeframe besar menetapkan arah utama; timeframe kecil menyediakan presisi eksekusi searah timeframe besar.'
      ],
      practiceCta: {
        label: 'Bandingkan H1, M15 & M5 di Cockpit Mapping',
        description: 'Amati bagaimana panel 3-TF (H1, M15, M5) menyelaraskan arah Gold secara real-time.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Mengapa penurunan koreksi `$22` di chart `H1` yang masih Bullish sering membuat trader pemula keliru membuka SELL?',
          options: [
            'Karena broker menonaktifkan chart H1',
            'Karena sifat fraktal pasar: koreksi 2 jam di H1 tampil sebagai tren turun rapi (`LH–LL`) sepanjang 24 candle di layar M5',
            'Karena M5 selalu lebih dominan daripada H1',
            'Karena Gold tidak pernah mengalami koreksi'
          ],
          answerIndex: 1,
          explanation: 'Satu fase koreksi pada HTF (H1) tersusun dari tren mini pada LTF (M5). Tanpa mengecek H1, trader M5 rawan menjual tepat di dasar koreksi.'
        },
        {
          question: 'Dalam protokol 3-layar Top-Down (`H4/H1 → M15 → M5`), apa tugas utama timeframe **M5**?',
          options: [
            'Menentukan arah tren mingguan dan bulanan',
            'Mengamati reaksi harga dan menunggu konfirmasi balik arah saat harga sudah tiba di area kerja M15/H1',
            'Menggantikan seluruh analisis H1 dan M15',
            'Menentukan jadwal tutup akhir pekan'
          ],
          answerIndex: 1,
          explanation: 'H4/H1 menetapkan arah utama, M15 membingkai struktur & area tunggu, dan M5 digunakan untuk konfirmasi presisi di area tersebut.'
        },
        {
          question: 'Kondisi layar menunjukkan: **H1 Bullish**, **M15 Bullish**, namun **M5 sedang turun (Bearish)** mendekati zona tunggu M15. Apa tindakan paling tepat?',
          options: [
            'Segera buka SELL besar di M5 karena candle merah sedang kuat',
            'SIAGA / TUNGGU: biarkan M5 menyelesaikan koreksinya ke area M15, lalu cari peluang BUY setelah M5 berbalik naik searah H1/M15',
            'Menutup akun trading',
            'Membuka BUY dan SELL bersamaan pada harga yang sama'
          ],
          answerIndex: 1,
          explanation: 'M5 yang turun dalam arus H1/M15 Bullish adalah koreksi sehat. Tunggu M5 kembali selaras Bullish untuk setup probabilitas tinggi.'
        },
        {
          question: 'Manakah kondisi sinkronisasi Multi-Timeframe yang memberikan kualitas setup tertinggi (A+)?',
          options: [
            'H1 Bullish, M15 Bearish, M5 Sideways',
            'H1, M15, dan M5 ketiganya selaras ke satu arah yang sama',
            'Hanya melihat M1 tanpa memperhatikan H1 maupun M15',
            'Saat H1 dan M15 saling bertabrakan menjelang rilis data CPI'
          ],
          answerIndex: 1,
          explanation: 'Keselarasan 3/3 (H1 + M15 + M5 searah) memastikan arus besar, struktur kerja, dan momentum eksekusi saling mendukung.'
        }
      ]
    },

    // =========================================================================
    // BAB 09 — BOS VALID VS LIQUIDITY SWEEP
    // =========================================================================
    {
      id: 'bos-valid-vs-sweep-palsu',
      number: 9,
      levelId: 1,
      bookFormat: true,
      title: 'Break of Structure (BOS) Valid vs Liquidity Sweep (Breakout Palsu)',
      subtitle: 'Cara membedakan Break of Structure (BOS) yang valid dengan Liquidity Sweep (breakout palsu), ciri-ciri keduanya, serta langkah praktis agar tidak terjebak di chart XAU/USD.',
      readMinutes: 10,
      diagramId: 'bos-vs-sweep',
      diagramAfterSection: 2,
      summary: 'Pahami perbedaan Break of Structure (BOS) Valid dengan Liquidity Sweep melalui tabel perbandingan, ciri-ciri masing-masing, cara praktis menghindari jebakan breakout palsu, kasus transisi di Gold, dan studi kasus XAU/USD.',
      bookSections: [
        {
          number: '9.1',
          heading: 'Pengertian dan Perbandingan BOS Valid vs Liquidity Sweep',
          paragraphs: [
            'Dalam analisis teknikal ICT, membedakan **Break of Structure (BOS) yang valid** dengan **Liquidity Sweep (breakout palsu)** adalah kunci utama agar kamu tidak terjebak menjadi likuiditas pasar.',
            'Secara singkat, **BOS Valid** terjadi ketika harga menutup **badan candle (*Body Close*)** di atas Swing High atau di bawah Swing Low sebelumnya dengan momentum kuat. Sebaliknya, **Liquidity Sweep** terjadi ketika harga hanya menembus level tersebut menggunakan **sumbu (*Wick*)**, lalu badan candle ditutup kembali di dalam area lama dan harga segera berbalik arah.'
          ],
          table: {
            caption: 'Perbandingan Break of Structure (BOS) Valid vs Liquidity Sweep',
            headers: ['Karakteristik', 'Break of Structure (BOS) Valid', 'Liquidity Sweep (Breakout Palsu)'],
            rows: [
              ['Penutupan Candle', 'Badan candle (**Body**) menutup penuh melewati level struktur (Swing High atau Swing Low)', 'Harga hanya menembus level menggunakan sumbu (**Wick**), lalu Body ditutup kembali di dalam area lama'],
              ['Momentum & Volume', 'Diikuti candle berbadan besar (**Displacement**) dan sering meninggalkan **Fair Value Gap (FVG)**', 'Terjadi penolakan (*rejection*) tajam dan cepat setelah menyentuh area Liquidity'],
              ['Tujuan Pasar', 'Mengonfirmasi kelanjutan tren (*trend continuation*) ke arah baru', 'Mengambil pesanan Stop Loss trader ritel (*stop hunt*) sebelum bergerak ke arah sebenarnya'],
              ['Reaksi Harga Berikutnya', 'Harga biasanya melakukan pullback sehat ke area **Order Block** atau **FVG**, lalu melanjutkan tren', 'Harga langsung berbalik arah secara agresif dan menembus struktur berlawanan (memicu **Market Structure Shift / MSS**)']
            ]
          }
        },
        {
          number: '9.2',
          heading: 'Ciri-Ciri Break of Structure (BOS) yang Valid',
          paragraphs: [
            'BOS Valid menandakan bahwa pembeli (*buyer*) atau penjual (*seller*) benar-benar memegang kendali dan siap mendorong harga lebih jauh. Berikut ciri utama yang perlu kamu periksa:',
            '1. **Body Close (Wajib):** Pastikan ada minimal satu candle pada timeframe yang kamu gunakan yang menutup badannya di luar titik tertinggi atau terendah sebelumnya. Jika yang melewati level hanya sumbu (*wick*), struktur belum dianggap patah secara valid.',
            '2. **Adanya Displacement:** Pergerakan penembusan terlihat impulsif dan bertenaga dengan badan candle yang besar, bukan merangkak perlahan menggunakan deretan candle kecil yang lemah.',
            '3. **Meninggalkan Imbalance (FVG):** Dorongan penembusan yang kuat sering menyisakan celah ketidakseimbangan harga (*Fair Value Gap*) yang nantinya menjadi area ideal untuk mencari peluang entry saat harga melakukan pullback.',
            '4. **Didukung Candle Berikutnya (*Follow-Through*):** Setelah candle penembus ditutup di luar level, candle berikutnya bertahan di area baru atau hanya melakukan koreksi ringan — bukan langsung berbalik tajam masuk kembali ke dalam rentang harga lama.'
          ]
        },
        {
          number: '9.3',
          heading: 'Ciri-Ciri Liquidity Sweep (Breakout Palsu)',
          paragraphs: [
            'Liquidity Sweep adalah jebakan klasik di mana pelaku pasar besar mencari kumpulan Stop Loss di atas resistance atau di bawah support agar pesanan besar mereka bisa terisi. Di atas Swing High berkumpul Stop Loss posisi SELL sekaligus Buy Stop trader breakout, sedangkan di bawah Swing Low berkumpul Stop Loss posisi BUY dan Sell Stop.',
            'Berikut ciri-ciri Liquidity Sweep yang paling sering muncul di chart Gold (`XAU/USD`):',
            '1. **Sumbu Panjang (*Long Wick*):** Harga menembus Swing High atau Swing Low hanya beberapa pips/poin untuk menyapu Stop Loss, lalu ditarik kembali dengan cepat sebelum candle ditutup sehingga meninggalkan wick panjang.',
            '2. **Terjadi di Area Liquidity Jelas:** Sangat sering muncul di puncak sejajar (*Equal Highs / EQH*), dasar sejajar (*Equal Lows / EQL*), Swing High/Low mencolok, atau level tertinggi dan terendah hari sebelumnya (`PDH` / `PDL`).',
            '3. **Diikuti Pembalikan Cepat (MSS):** Setelah menyapu Liquidity, harga tidak melanjutkan tren ke arah tembusan, melainkan berbalik cepat dan mematahkan struktur internal ke arah sebaliknya (*Market Structure Shift / MSS*).'
          ]
        },
        {
          number: '9.4',
          heading: 'Cara Praktis Menghindari Jebakan Liquidity Sweep',
          paragraphs: [
            'Agar tidak sering masuk posisi tepat di ujung breakout palsu, terapkan lima langkah praktis berikut setiap kali harga mendekati Swing High atau Swing Low:',
            '1. **Tunggu Penutupan Candle (*Candle Close*):** Jangan terburu-buru masuk pasar (*FOMO*) saat harga baru saja menembus garis struktur sementara candle masih berjalan. Tunggu hingga waktu candle benar-benar selesai dan resmi tertutup.',
            '2. **Perhatikan Timeframe Lebih Tinggi (HTF):** Jika penembusan terjadi tepat saat harga menyentuh area penting timeframe besar (seperti `H4/H1 Order Block`, `FVG HTF`, atau `PDH/PDL`), kemungkinan besar itu adalah Liquidity Sweep, bukan BOS kelanjutan.',
            '3. **Cari Konfirmasi Kedua (Retest & Reaksi):** Setelah terjadi BOS Valid, jangan langsung mengejar harga di ujung candle. Tunggu harga melakukan koreksi (*pullback*) ke area Order Block atau FVG dan menunjukkan reaksi penolakan sebelum membuka posisi.',
            '4. **Waspadai Penutupan Body Terlalu Tipis (*Weak Break*):** Pada Gold, jika badan candle hanya ditutup tipis sekali melewati level (`< $0,30` atau `< 3 pips`) disertai sumbu penolakan yang jauh lebih panjang dari badannya, jangan langsung menyimpulkan BOS kuat. Tunggu 1 candle berikutnya untuk memastikan apakah harga benar-benar bertahan di luar level.',
            '5. **Kenali Perubahan Status pada Candle Kedua:** Jika candle pertama hanya menyapu level dengan wick, tetapi candle kedua mendorong kuat dan menutup **Body penuh** di atas puncak candle pertama, maka statusnya berubah dari Liquidity Sweep menjadi **BOS Valid**. Sebaliknya, jika candle kedua langsung bergerak menjauh kembali ke dalam area lama, maka candle pertama terkonfirmasi sebagai **Liquidity Sweep**.'
          ],
          callout: {
            tone: 'warn',
            title: 'Jangan Menyimpulkan BOS Sebelum Candle Ditutup',
            body: 'Pada timeframe M15 XAU/USD, candle yang tampak naik `+$4,00` di atas Swing High pada menit ke-10 masih bisa berbalik penuh sebelum menit ke-15 berakhir hingga hanya menyisakan sumbu atas panjang. **BOS Valid hanya sah setelah candle resmi ditutup.**'
          }
        },
        {
          number: '9.5',
          heading: 'Studi Kasus XAU/USD pada Level Swing High 2.660,00',
          paragraphs: [
            'Perhatikan bagaimana satu level Swing High yang sama (`2.660,00`) pada chart M15 Gold menghasilkan dua keputusan trading yang berlawanan berdasarkan cara penutupan candle-nya:'
          ],
          exampleBox: {
            title: 'Dua Skenario pada Swing High 2.660,00 (M15 XAU/USD)',
            rows: [
              {
                label: 'Skenario A — BOS Valid (Kelanjutan Tren Naik)',
                detail: 'Candle M15 menembus `2.660,00` dengan body besar dan **ditutup (*Close*) di `2.663,80`** sambil meninggalkan Bullish FVG di `2.658,50 – 2.661,00`. Pembeli terkonfirmasi memegang kendali. **Tindakan:** Struktur Bullish berlanjut; hindari mengejar BUY di `2.663,80`, lalu tunggu pullback sehat ke area FVG/Order Block untuk mencari peluang BUY.'
              },
              {
                label: 'Skenario B — Liquidity Sweep (Breakout Palsu)',
                detail: 'Candle M15 sempat naik ke High `2.662,90` (menyapu Stop Loss di atas `2.660,00`), lalu langsung ditarik turun hingga **ditutup (*Close*) di `2.658,40`** dengan wick atas `$4,50`. **Tindakan:** Jangan membuka BUY breakout; amati pembalikan arah turun dan tunggu konfirmasi **MSS Bearish** di timeframe eksekusi (`M5`) sebelum mencari peluang SELL.'
              }
            ]
          }
        }
      ],
      keyTakeaways: [
        '**BOS Valid** terjadi ketika **badan candle (*Body Close*)** menutup penuh melewati Swing High atau Swing Low sebelumnya dengan momentum kuat (**Displacement**) dan sering meninggalkan **FVG**.',
        '**Liquidity Sweep** terjadi ketika hanya **sumbu (*Wick*)** yang menembus level untuk menyapu Stop Loss sementara badan candle ditutup kembali di dalam area lama.',
        'Selalu tunggu **penutupan candle (*Candle Close*)**, cek konteks **HTF**, dan cari konfirmasi kedua saat retest agar tidak terjebak FOMO di ujung breakout palsu.',
        'Penutupan body tipis (`< $0,30` di Gold) dengan sumbu panjang perlu dikonfirmasi 1 candle berikutnya; sedangkan jika candle kedua menutup body tegas melewati puncak sweep pertama, statusnya berubah menjadi BOS Valid.'
      ],
      bridgeNext: 'Setelah bisa membedakan penembusan valid (`BOS`) dari breakout palsu (`Liquidity Sweep`), langkah berikutnya adalah membingkai rentang harga aktif setelah BOS agar area koreksi dan target selalu jelas. Di **Bab 10**, kita mempelajari **Dealing Range: Arena Eksternal (ERL) vs Internal (IRL)**.',
      conceptBlocks: [
        {
          heading: 'BOS Valid (Body Close) vs Liquidity Sweep (Wick-Only)',
          paragraphs: [
            'BOS Valid membutuhkan badan candle (Body Close) menutup penuh melewati Swing High atau Swing Low sebelumnya dengan momentum (Displacement) untuk mengonfirmasi kelanjutan tren.',
            'Liquidity Sweep hanya menembus level dengan sumbu (Wick) lalu menutup body kembali di dalam area lama untuk mengambil Stop Loss sebelum berbalik arah memicu MSS.'
          ]
        }
      ],
      mappingSteps: [
        'Tarik garis horizontal tepat di ujung Swing High atau Swing Low yang sedang diuji.',
        'Tunggu candle benar-benar selesai ditutup (Candle Close) sebelum mengambil kesimpulan.',
        'Cek posisi penutupan: Body penuh di luar level + Displacement = BOS Valid; hanya Wick di luar sementara Body kembali di dalam = Liquidity Sweep.',
        'Periksa lokasi HTF (PDH/PDL, Order Block, atau FVG H1/H4) dan tunggu pullback/retest sebagai konfirmasi kedua sebelum entry.'
      ],
      decisionTree: [
        {
          condition: 'Candle M15 menembus Swing High dengan wick $3 lalu body ditutup kembali di bawah Swing High.',
          action: 'Itu Liquidity Sweep (breakout palsu), bukan BOS. Jangan BUY breakout dan pantau konfirmasi pembalikan (MSS Bearish).'
        },
        {
          condition: 'Candle M15 menutup body penuh $3,50 di atas Swing High sebelumnya sambil meninggalkan FVG.',
          action: 'Itu Bullish BOS Valid. Tandai struktur baru dan tunggu pullback sehat ke area FVG/Order Block untuk peluang BUY.'
        }
      ],
      failedCase: {
        context: 'Trader langsung membuka BUY pada menit ke-9 candle M15 karena harga sedang berada di atas Swing High 2.660,00.',
        whyFailed: 'Saat menit ke-15 berakhir, candle ditutup di 2.658,40 (Liquidity Sweep); posisi BUY terbuka tepat di ujung sumbu penolakan.'
      },
      validRules: [
        'Selalu tunggu Candle Close untuk membedakan BOS Valid dan Liquidity Sweep.',
        'Akui BOS Valid jika Body Close tegas melewati level swing sebelumnya dengan momentum (Displacement).'
      ],
      invalidRules: [
        'Menyebut penembusan sumbu (wick-only) sebagai Break of Structure.',
        'Masuk posisi breakout saat candle masih berjalan sebelum ditutup.'
      ],
      xauScenario: {
        context: 'Swing High M15 Gold berada di 2.660,00.',
        steps: [
          'Jika candle close di 2.663,80 (Body di atas 2.660,00 + FVG) → BOS Valid Bullish, tunggu pullback untuk BUY.',
          'Jika candle sempat ke 2.662,90 lalu close di 2.658,40 → Liquidity Sweep, hindari BUY dan pantau MSS Bearish.'
        ]
      },
      goldenRules: [
        'Sumbu (wick) hanya mengambil likuiditas; penutupan badan candle (Body Close) yang menentukan arah penerimaan harga.'
      ],
      practiceCta: {
        label: 'Uji Mata: BOS Valid vs Sweep di Latihan Kasus',
        description: 'Latih ketepatan membedakan Body Close BOS dan Wick Sweep pada skenario chart Gold nyata.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Apa syarat utama agar penembusan Swing High diakui sebagai **Break of Structure (BOS) Valid**?',
          options: [
            'Cukup ujung sumbu (wick) menyentuh $0,50 di atas Swing High',
            'Badan candle (Body) harus selesai ditutup (Close) melewati Swing High sebelumnya dengan momentum kuat',
            'Harga bergerak cepat di menit ke-3 meski candle belum ditutup',
            'Indikator RSI melewati angka 70'
          ],
          answerIndex: 1,
          explanation: 'Dalam ICT, BOS hanya sah apabila badan candle (Body Close) ditutup penuh melewati swing sebelumnya setelah candle resmi close.'
        },
        {
          question: 'Swing High M15 XAU/USD berada di `2.660,00`. Candle M15 sempat naik ke `2.663,20`, namun saat menit ke-15 selesai candle ditutup di `2.658,70`. Peristiwa apa ini?',
          options: [
            'Bullish BOS Valid yang sangat kuat',
            'Liquidity Sweep (breakout palsu) karena hanya wick yang melewati 2.660 sementara body ditutup kembali di dalam area lama',
            'Konsolidasi pasar tutup',
            'Sinyal wajib BUY tanpa Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Hanya sumbu (wick) yang menembus 2.660 sementara body ditutup di 2.658,70 — ini adalah ciri utama Liquidity Sweep.'
        },
        {
          question: 'Mengapa kamu tidak boleh menyimpulkan BOS pada menit ke-10 saat candle M15 masih berjalan?',
          options: [
            'Karena MT5 melarang eksekusi di menit ke-10',
            'Karena sebelum candle benar-benar ditutup, harga masih bisa berbalik penuh dan hanya menyisakan sumbu Liquidity Sweep',
            'Karena menit ke-10 tidak memiliki spread',
            'Karena BOS hanya berlaku pada hari Jumat'
          ],
          answerIndex: 1,
          explanation: 'Status BOS atau Liquidity Sweep hanya sah ditentukan dari harga Close resmi setelah durasi candle selesai.'
        },
        {
          question: 'Jika candle pertama hanya menyapu Swing High dengan sumbu (wick), lalu candle kedua mendorong kuat dan **menutup body penuh** di atas puncak candle pertama, bagaimana statusnya?',
          options: [
            'Tetap Liquidity Sweep selamanya walaupun harga naik $30',
            'Harga terkonfirmasi diterima di luar level — statusnya berubah menjadi BOS Valid',
            'Chart sedang error dan perlu dimulai ulang',
            'Pasar otomatis masuk mode sideways'
          ],
          answerIndex: 1,
          explanation: 'Jika candle berikutnya menutup body secara tegas melampaui puncak sweep pertama, penerimaan harga terjadi dan struktur sah berlanjut (BOS).'
        }
      ]
    },

    // =========================================================================
    // BAB 10 — DEALING RANGE (ERL VS IRL)
    // =========================================================================
    {
      id: 'internal-external-dealing-range',
      number: 10,
      levelId: 1,
      bookFormat: true,
      title: 'Dealing Range: Membaca Arena Eksternal (ERL) vs Internal (IRL)',
      subtitle: 'Cara memetakan Dealing Range dari Swing Low ke Swing High valid, memahami siklus ERL ↔ IRL, serta contoh penerapan lengkap pada tren naik (bullish) dengan zona Premium dan Discount.',
      readMinutes: 11,
      diagramId: 'dealing-range-ie',
      diagramAfterSection: 1,
      summary: 'Pahami konsep Dealing Range, tabel perbandingan External Range Liquidity (ERL) vs Internal Range Liquidity (IRL), siklus pasar IRL → ERL → IRL, langkah praktis penggunaan dengan Premium & Discount, serta studi kasus tren naik XAU/USD.',
      bookSections: [
        {
          number: '10.1',
          heading: 'Pengertian Dealing Range dan Perbandingan ERL vs IRL',
          paragraphs: [
            'Dalam metodologi ICT, **Dealing Range** adalah rentang harga aktif yang dibatasi oleh titik tertinggi (**Swing High**) dan titik terendah (**Swing Low**) yang valid, di mana algoritma pengiriman harga (**IPDA**) bekerja menyeimbangkan harga antara **External Range Liquidity (`ERL`)** dan **Internal Range Liquidity (`IRL`)**.',
            'Memahami Dealing Range memberimu panduan arah yang jelas setiap kali membuka chart: kamu selalu tahu dari mana harga berasal, ke mana harga sedang mengarah, dan kapan harus bersabar menunggu koreksi sebelum membuka posisi.'
          ],
          table: {
            caption: 'Perbandingan External Range Liquidity (ERL) vs Internal Range Liquidity (IRL)',
            headers: ['Aspek', 'External Range Liquidity (ERL)', 'Internal Range Liquidity (IRL)'],
            rows: [
              ['Lokasi di Grafik', 'Berada di batas luar Dealing Range (titik **Swing High** dan **Swing Low** utama)', 'Berada di bagian dalam Dealing Range (di antara Swing High dan Swing Low)'],
              ['Bentuk Liquidity', '`Old Highs`, `Old Lows`, `Equal Highs (EQH)`, `Equal Lows (EQL)`, dan kumpulan Stop Loss ritel', '**Fair Value Gap (FVG)**, **Order Block (OB)**, **Breaker Block**, dan area Imbalance'],
              ['Fungsi Utama', 'Target pergerakan tren (*expansion*) dan area pengambilan Stop Loss (*Liquidity Sweep*)', 'Area koreksi (*retracement / pullback*) untuk menyeimbangkan ketidakseimbangan harga'],
              ['Peran bagi Trader', 'Sebagai **Target Profit (TP)** atau sinyal pembalikan arah jika terjadi sweep', 'Sebagai **Area Entry** berprobabilitas tinggi dengan risiko lebih terukur']
            ]
          },
          paragraphsAfter: [
            '*(Penjelasan detail mengenai Fair Value Gap, Order Block, dan Breaker Block dibahas mendalam pada Bagian IV. Pada bab ini, cukup pahami bahwa seluruh zona ketidakseimbangan di dalam rentang disebut **IRL**, sedangkan ujung batas atas dan bawah rentang disebut **ERL**.)*'
          ]
        },
        {
          number: '10.2',
          heading: 'Cara Kerja Siklus Pasar: IRL → ERL → IRL',
          paragraphs: [
            'Pasar tidak pernah bergerak lurus dalam satu arah selamanya. Algoritma harga secara konstan bergerak bolak-balik di antara dua jenis likuiditas ini dalam dua fase utama:',
            '1. **Dari ERL ke IRL (Fase Koreksi / Retracement):** Ketika harga menyapu atau menembus likuiditas di batas luar (`ERL`) — misalnya melewati Swing High lama — dorongan searah tren melemah sementara. Harga kemudian turun masuk kembali ke dalam Dealing Range untuk mengisi celah ketidakseimbangan (`IRL`) seperti Fair Value Gap (`FVG`) atau menyentuh Order Block (`OB`).',
            '2. **Dari IRL ke ERL (Fase Ekspansi / Expansion):** Setelah harga mendapatkan pijakan dan mengisi pesanan di area `IRL` (idealnya di area **Discount** pada tren naik, atau **Premium** pada tren turun), harga kembali terdorong kuat keluar untuk menargetkan `ERL` berikutnya (membentuk Swing High atau Swing Low baru).'
          ]
        },
        {
          number: '10.3',
          heading: 'Langkah Praktis Menggunakan Dealing Range & Pembagian Premium–Discount',
          paragraphs: [
            'Agar Dealing Range langsung bisa diterapkan di grafik harian tanpa kebingungan, ikuti empat langkah praktis berikut:',
            '1. **Tentukan Batas Dealing Range:** Tarik garis dari **Swing Low** ke **Swing High** terbaru yang memicu **Break of Structure (BOS) valid** pada timeframe acuan kamu (misalnya `H4` atau `H1`). Pada tren naik, batas bawah adalah **Strong Low** dan batas atas adalah **Weak High**; pada tren turun berlaku sebaliknya.',
            '2. **Bagi Rentang Menjadi Zona Premium dan Discount (`50% Equilibrium`):** Tarik Fibonacci (`0% – 50% – 100%`) dari batas bawah ke batas atas Dealing Range. Bagian atas (`50% – 100%`) adalah **Zona Premium** (harga relatif mahal — ideal untuk mencari **SELL** saat tren turun), sedangkan bagian bawah (`0% – 50%`) adalah **Zona Discount** (harga relatif murah — ideal untuk mencari **BUY** saat tren naik).',
            '3. **Identifikasi Posisi Harga Saat Ini:** Jika harga baru saja menyapu atau menembus **ERL** (batas atas/bawah), jangan mengejar harga (*FOMO*) — bersiaplah menunggu harga masuk ke dalam mencari **IRL**. Sebaliknya, jika harga sudah berada di dalam **IRL** (misalnya menyentuh FVG di area Discount pada tren bullish), cari konfirmasi pembalikan pada timeframe lebih kecil (`M15`/`M5`) untuk membuka posisi beli.',
            '4. **Tetapkan Target Profit & Perbarui Range Pasca-BOS Baru:** Jika kamu masuk di area `IRL`, tempatkan **Take Profit (TP)** pada batas `ERL` yang berlawanan. Setiap kali batas `ERL` tersebut ditembus dengan **BOS Valid** baru, hapus kotak lama dan tarik ulang Dealing Range mengikuti kaki dorongan terbaru.'
          ]
        },
        {
          number: '10.4',
          heading: 'Contoh Penerapan Dealing Range pada Tren Naik (Bullish) dengan Premium & Discount',
          paragraphs: [
            'Misalkan pada timeframe `H1` XAU/USD, harga sedang berada dalam tren naik dan baru saja mencetak **Bullish BOS Valid** dari Swing Low **`2.640,00`** hingga puncak **`2.680,00`** (lebar rentang **`$40,00`**). Berikut pembagian peta Dealing Range lengkap dengan area Premium dan Discount-nya:'
          ],
          table: {
            caption: 'Peta Pembagian Dealing Range Bullish XAU/USD (2.640,00 – 2.680,00)',
            headers: ['Zona / Level', 'Rentang Harga XAU/USD', 'Persentase Range', 'Fungsi & Tindakan Trader (Tren Bullish)'],
            rows: [
              ['**ERL Atas** (*Weak High*)', '`2.680,00`', '`100%`', '**Target Profit utama (TP2)**; hindari mengejar BUY baru tepat di sini'],
              ['**Zona Premium** (*Mahal*)', '`2.660,00 – 2.680,00`', '`50% – 100%`', 'Area terlalu mahal untuk BUY — bersabar menunggu harga turun melewati `50%`'],
              ['**Equilibrium (EQ)**', '`2.660,00`', '`50%`', 'Garis batas tengah keseimbangan antara Premium dan Discount'],
              ['**Zona Discount** (*Murah*)', '`2.640,00 – 2.660,00`', '`0% – 50%`', '**Area prioritas mencari BUY** pada zona IRL (Bullish FVG `2.650–2.654` / Bullish OB `2.646–2.650`)'],
              ['**ERL Bawah** (*Strong Low*)', '`2.640,00`', '`0%`', 'Batas invalidasi struktur Bullish; jika ditembus Body Close, tren naik batal']
            ]
          },
          exampleBox: {
            title: 'Simulasi Eksekusi Siklus Bullish Dealing Range XAU/USD (H1 → M5)',
            rows: [
              {
                label: 'Tahap 1 — Pembentukan Range & Pembagian 50%',
                detail: 'Gold naik dari **Strong Low `2.640,00` (`ERL Bawah`)** menembus Swing High lama dengan BOS Valid hingga **`2.680,00` (`ERL Atas`)**. Garis `50% Equilibrium` berada di **`2.660,00`**. Di zona **Discount (`< 2.660,00`)**, terlihat jelas area **IRL** berupa Bullish FVG pada **`2.650,00 – 2.654,00`**.'
              },
              {
                label: 'Tahap 2 — Fase Koreksi (ERL → IRL)',
                detail: 'Setelah mencapai `2.680,00` (`ERL Atas`), harga berhenti naik dan mulai terkoreksi turun. Saat harga masih di **`2.670,00` (Zona Premium `75%`)**, trader tetap disiplin tidak membuka BUY karena harga belum masuk ke area murah (`Discount`). Harga terus turun menembus `2.660,00` dan menyentuh Bullish FVG di **`2.652,00` (`30% Discount`)**.'
              },
              {
                label: 'Tahap 3 — Konfirmasi & Eksekusi BUY di Discount IRL',
                detail: 'Di dalam Bullish FVG `2.652,00`, timeframe `M5` mencetak Liquidity Sweep minor diikuti **MSS Bullish**. Trader membuka **BUY di `2.653,00`**, memasang **SL di `2.647,00`** (di bawah zona FVG/Order Block, risiko **`$6,00`**), **TP1** di internal high **`2.668,00`** (**`+$15,00` / `2,5R`**), dan **TP2** di **ERL Atas `2.680,00`** (**`+$27,00` / `4,5R`**).'
              },
              {
                label: 'Tahap 4 — Fase Ekspansi (IRL → ERL) & Pembaruan Range',
                detail: 'Harga terdorong naik dari area Discount IRL menuju dan menembus **ERL Atas `2.680,00`** dengan Body Close hingga puncak baru **`2.694,00`**. Karena BOS Valid baru telah terjadi, Dealing Range lama (`2.640–2.680`) dihapus dan diperbarui menjadi **`2.652,00` (Strong Low baru) – `2.694,00` (Weak High baru)** dengan garis Equilibrium baru di **`2.673,00`**.'
              }
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Dua Kesalahan Umum Saat Menggunakan Dealing Range',
            body: '1. **Membeli di Zona Premium (`> 50%`) saat tren naik:** Harga yang masih berada di area mahal rawan turun lebih dalam menuju Discount IRL sehingga memicu Stop Loss lebih dulu sebelum tren berlanjut.\n2. **Mempertahankan Dealing Range usang:** Begitu batas ERL ditembus oleh BOS Valid baru, segera geser kotak ke kaki dorongan terakhir agar pembagian Premium–Discount tetap akurat.'
          }
        }
      ],
      keyTakeaways: [
        '**Dealing Range** adalah rentang harga valid dari **Swing Low** ke **Swing High** pasca-BOS yang membingkai pergerakan antara **ERL** (batas luar) dan **IRL** (area ketidakseimbangan di dalam).',
        'Harga bergerak bolak-balik dalam siklus **`ERL → IRL → ERL`**: setelah menyapu batas luar (`ERL`), harga cenderung terkoreksi ke `IRL`, lalu berekspansi kembali menuju `ERL` yang berlawanan.',
        'Bagi Dealing Range dengan garis **`50% Equilibrium`**: pada tren bullish, prioritaskan entry BUY hanya pada area `IRL` di **Zona Discount (`< 50%`)** dengan target TP di **ERL Atas (`100%`)**.',
        'Setiap kali terjadi **BOS Valid** baru yang menembus batas ERL, segera perbarui Dealing Range mengikuti kaki dorongan terakhir.'
      ],
      bridgeNext: 'Setelah memahami bingkai Dealing Range, pembagian Premium–Discount, serta siklus `ERL ↔ IRL`, langkah selanjutnya adalah mengenali bentuk-bentuk Liquidity Pool utama yang paling sering diincar pasar Gold. Di **Bab 11**, kita memetakan seluruh **Liquidity Pool Utama XAU/USD (`BSL/SSL`, `EQH/EQL`, `PDH/PDL`, `PWH/PWL`, dan `Asia Range`)**.',
      conceptBlocks: [
        {
          heading: 'Dealing Range Aktif, Premium–Discount & Siklus ERL ↔ IRL',
          paragraphs: [
            'Dealing Range dibatasi oleh Swing Low dan Swing High valid hasil BOS terakhir, lalu dibagi garis 50% Equilibrium menjadi Zona Premium (mahal) dan Zona Discount (murah).',
            'Pergerakan harga berputar dalam siklus ERL → IRL → ERL: tunggu koreksi masuk ke IRL di Discount (untuk Buy) atau Premium (untuk Sell), lalu arahkan Take Profit ke batas ERL yang berlawanan.'
          ]
        }
      ],
      mappingSteps: [
        'Tentukan batas Dealing Range dari Swing Low ke Swing High terbaru yang memicu BOS Valid di H4 atau H1.',
        'Tarik garis 50% Equilibrium untuk memisahkan Zona Premium (>50%) dan Zona Discount (<50%).',
        'Amati posisi harga: jika baru menyapu ERL, tunggu koreksi masuk ke IRL; jika sudah di IRL (Discount untuk tren naik), cari konfirmasi LTF untuk entry.',
        'Tempatkan Take Profit pada batas ERL berlawanan, dan perbarui Dealing Range setelah muncul BOS Valid baru.'
      ],
      decisionTree: [
        {
          condition: 'Tren H1 Bullish (range 2.640–2.680), harga sedang di 2.670 (75% Premium) tepat di bawah ERL Atas.',
          action: 'Jangan FOMO membuka BUY di Zona Premium. Tunggu harga terkoreksi melewati Equilibrium 2.660 masuk ke IRL di Zona Discount.'
        },
        {
          condition: 'Harga menyentuh Bullish FVG (IRL) di 30% Discount (2.652) dan M5 mencetak MSS Bullish.',
          action: 'Cari peluang BUY searah tren dengan target Take Profit menuju batas ERL Atas (2.680).'
        },
        {
          condition: 'Harga mencetak BOS Valid baru menembus batas ERL Atas (2.680) hingga 2.694.',
          action: 'Hapus kotak lama dan perbarui Dealing Range mengikuti kaki dorongan baru (2.652–2.694).'
        }
      ],
      failedCase: {
        context: 'Pada Dealing Range Bullish 2.640–2.680, trader langsung membeli di FVG kecil pada 2.671 (Zona Premium 77%) tepat setelah harga menyentuh ERL Atas.',
        whyFailed: 'Harga masih berada di zona mahal (Premium) dan belum menyeimbangkan FVG utama di Discount (2.650–2.654); koreksi ERL → IRL menyapu SL terlebih dahulu sebelum harga berbalik naik ke 2.694.'
      },
      validRules: [
        'Tentukan Dealing Range dari kaki dorongan yang menghasilkan BOS Valid terakhir.',
        'Prioritaskan entry BUY pada IRL di Zona Discount (<50%) pada tren bullish, dan SELL pada IRL di Zona Premium (>50%) pada tren bearish.',
        'Gunakan batas ERL berlawanan sebagai target Take Profit utama.'
      ],
      invalidRules: [
        'Mengejar posisi BUY di Zona Premium (>50%) tepat setelah harga menyapu ERL Atas.',
        'Mempertahankan Dealing Range lama yang batas ERL-nya sudah ditembus BOS Valid baru.'
      ],
      xauScenario: {
        context: 'Gold H1 Bullish membentuk Dealing Range 2.640,00 (ERL Bawah) hingga 2.680,00 (ERL Atas), dengan 50% Equilibrium di 2.660,00.',
        steps: [
          'Harga terkoreksi dari ERL Atas 2.680 melewati Premium & EQ 2.660 masuk ke Bullish FVG (IRL) di Discount 2.650–2.654.',
          'Konfirmasi M5 MSS di 2.652 → BUY 2.653, SL 2.647 ($6), TP1 2.668 (2,5R), TP2 ERL Atas 2.680 (4,5R); setelah BOS ke 2.694, range bergeser ke 2.652–2.694.'
        ]
      },
      goldenRules: [
        'Pasar bergerak dalam siklus IRL → ERL → IRL: masuk di area IRL pada lokasi murah/mahal yang tepat, lalu targetkan ERL di sisi berlawanan.'
      ],
      practiceCta: {
        label: 'Lihat Dealing Range Live di Cockpit Mapping',
        description: 'Amati tampilan Dealing Range aktif dan posisi harga live secara langsung di Chart Gold.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Bagaimana cara menentukan batas bawah dan batas atas sebuah **Dealing Range Bullish** yang valid?',
          options: [
            'Mengambil harga pembukaan bulan lalu dan harga penutupan tahun lalu',
            'Dari **Swing Low (Strong Low)** ke **Swing High (Weak High)** terbaru yang memicu Break of Structure (BOS) valid',
            'Dari 2 candle M1 acak yang sedang berjalan',
            'Dari garis indikator Bollinger Bands'
          ],
          answerIndex: 1,
          explanation: 'Dealing Range aktif selalu membingkai kaki dorongan sah terakhir: dari Swing Low asal BOS Valid hingga Swing High puncak gelombang.'
        },
        {
          question: 'Dalam siklus pasar ICT (**`IRL → ERL → IRL`**), jika harga XAU/USD baru saja bereaksi dari area **IRL** (Bullish FVG) di Zona Discount pada tren bullish, di mana target Take Profit paling logis?',
          options: [
            'Berhenti di garis 50% tanpa target lanjutan',
            'Pada batas **ERL Atas** (Swing High) di ujung seberang Dealing Range',
            'Di bawah Swing Low 0%',
            'Pada harga pembukaan tahun lalu'
          ],
          answerIndex: 1,
          explanation: 'Saat kamu masuk di area IRL, fase berikutnya adalah ekspansi IRL → ERL sehingga batas ERL berlawanan menjadi target Take Profit logis.'
        },
        {
          question: 'Dealing Range Bullish H1 XAU/USD berada di `2.640,00 – 2.680,00` (Equilibrium `50%` di `2.660,00`). Jika harga saat ini sedang turun ke `2.670,00`, mengapa area tersebut belum ideal untuk membuka BUY?',
          options: [
            'Karena `2.670,00` masih berada di **Zona Premium (`75%`, mahal)** sehingga harga masih berpotensi turun lebih dalam menuju IRL di **Zona Discount (`< 2.660,00`)**',
            'Karena tombol BUY dinonaktifkan broker di atas 2.660',
            'Karena 2.670 berarti pasar sedang tutup',
            'Karena spread selalu berubah menjadi $100 di atas 50%'
          ],
          answerIndex: 0,
          explanation: 'Pada tren bullish, area entry probabilitas tinggi berada pada IRL di Zona Discount (di bawah 50% Equilibrium), bukan di Zona Premium.'
        },
        {
          question: 'Kapan sebuah Dealing Range lama harus dihapus dan ditarik ulang?',
          options: [
            'Setiap 5 menit sekali walaupun harga tidak bergerak',
            'Ketika batas ERL ditembus oleh **BOS Valid baru** dan harga membentuk kaki dorongan baru',
            'Hanya setiap tanggal 1 awal bulan',
            'Tidak pernah diperbarui selamanya'
          ],
          answerIndex: 1,
          explanation: 'Begitu BOS Valid baru menembus batas ERL, rentang pergerakan aktif telah berpindah ke kaki dorongan terakhir sehingga Dealing Range wajib diperbarui.'
        }
      ]
    },

    // =========================================================================
    // BAB 11 — PETA LIKUIDITAS GOLD (BSL/SSL, EQH/EQL, PDH/PDL, PWH/PWL, ASIA)
    // =========================================================================
    {
      id: 'bsl-dan-ssl-liquidity',
      number: 11,
      levelId: 1,
      bookFormat: true,
      title: 'Peta Liquidity Gold: BSL/SSL, EQH/EQL, PDH/PDL, PWH/PWL & Asia Range',
      subtitle: 'Pemetaan titik Stop Loss dan pending order utama pada XAU/USD (BSL/SSL, EQH/EQL, PDH/PDL, PWH/PWL, dan Asia Range), konsep Judas Swing, serta urutan pemetaan praktis sebelum trading.',
      readMinutes: 11,
      diagramId: 'bsl-ssl-pools',
      diagramAfterSection: 1,
      summary: 'Pahami Peta Liquidity Gold (XAU/USD) mencakup BSL/SSL, EQH/EQL, PDH/PDL, PWH/PWL, Asia Range beserta konsep Judas Swing, status Fresh vs Taken, dan urutan pemetaan praktis sebelum Sesi London dan New York.',
      bookSections: [
        {
          number: '11.1',
          heading: 'Peta Liquidity Gold (XAU/USD): BSL & SSL sebagai Fondasi Dasar',
          paragraphs: [
            '**Peta Liquidity Gold (`XAU/USD`)** adalah pemetaan titik-titik harga krusial tempat terkumpulnya ribuan pesanan **Stop Loss** dan *pending order* para pelaku pasar—mencakup **BSL/SSL**, **EQH/EQL**, **PDH/PDL**, **PWH/PWL**, serta **Asia Range**—yang menjadi tujuan utama pergerakan harga emas harian.',
            'Karena emas (`XAU/USD`) memiliki volatilitas tinggi dan sangat sensitif terhadap pergantian sesi perdagangan global, institusi besar secara rutin mengarahkan harga menuju peta likuiditas ini untuk mengisi volume pesanan mereka sebelum menjalankan pergerakan tren yang sebenarnya.',
            'Fondasi dasar dari seluruh peta likuiditas di grafik terbagi menjadi dua sisi utama:'
          ],
          exampleBox: {
            title: 'Fondasi Peta Likuiditas: BSL vs. SSL',
            rows: [
              {
                label: 'BSL (Buy-Side Liquidity)',
                detail: 'Kumpulan pesanan **Stop Loss dari para seller** (yang secara mekanis tereksekusi sebagai order beli saat tersentuh) serta pesanan **Buy Stop dari trader breakout** yang menumpuk tepat **di atas** titik tertinggi (`Swing High` / Resistance).'
              },
              {
                label: 'SSL (Sell-Side Liquidity)',
                detail: 'Kumpulan pesanan **Stop Loss dari para buyer** (yang tereksekusi sebagai order jual saat tersentuh) serta pesanan **Sell Stop dari trader breakout** yang menumpuk tepat **di bawah** titik terendah (`Swing Low` / Support).'
              }
            ]
          }
        },
        {
          number: '11.2',
          heading: 'EQH & EQL (Equal Highs & Equal Lows)',
          paragraphs: [
            'Pola yang sering disebut trader ritel sebagai *Double Top* atau *Double Bottom* justru menjadi salah satu target likuiditas terkuat bagi institusi:',
            '1. **Equal Highs (`EQH`):** Dua atau lebih puncak harga yang sejajar secara horizontal. Banyak trader ritel menganggapnya sebagai Resistance kuat lalu menaruh Stop Loss tepat di atasnya, sehingga membentuk **Liquidity Pool `BSL`** yang sangat besar dan berprobabilitas tinggi untuk disapu (*sweep*).',
            '2. **Equal Lows (`EQL`):** Dua atau lebih dasar harga yang sejajar secara horizontal. Banyak trader ritel menganggapnya sebagai Support kuat lalu memasang Stop Loss tepat di bawahnya, sehingga menciptakan **Liquidity Pool `SSL`** besar yang sangat sering disapu terlebih dahulu oleh harga emas sebelum bergerak naik.'
          ]
        },
        {
          number: '11.3',
          heading: 'PDH/PDL & PWH/PWL (Liquidity Berbasis Waktu)',
          paragraphs: [
            'Algoritma pasar (`IPDA`) sangat menghormati batas harga dari periode waktu sebelumnya sebagai acuan harian dan mingguan. Level-level ini menjadi peta prioritas pada grafik `H4` dan `H1`:'
          ],
          table: {
            caption: 'PDH/PDL & PWH/PWL — Liquidity Berbasis Waktu pada Gold (XAU/USD)',
            headers: ['Istilah', 'Kepanjangan', 'Lokasi & Fungsi Utama pada Gold (XAU/USD)'],
            rows: [
              ['**PDH**', 'Previous Day High', 'Harga tertinggi hari kemarin (area **BSL harian**, reset 17:00 NY / 05:00 WITA EDT atau 06:00 WITA EST). Sering menjadi target utama atau area pembalikan arah di Sesi London dan New York.'],
              ['**PDL**', 'Previous Day Low', 'Harga terendah hari kemarin (area **SSL harian**). Jika disapu dengan sumbu (*wick*) panjang lalu ditutup kembali di atasnya, sering memicu pembalikan naik (*bullish*).'],
              ['**PWH**', 'Previous Week High', 'Harga tertinggi minggu lalu (area **BSL jangka menengah**). Menjadi target makro utama sekaligus penentu arah bias mingguan emas.'],
              ['**PWL**', 'Previous Week Low', 'Harga terendah minggu lalu (area **SSL jangka menengah**). Penembusan valid dengan *body close* menandakan tren turun mingguan berlanjut.']
            ]
          }
        },
        {
          number: '11.4',
          heading: 'Asia Range (Rentang Likuiditas Sesi Asia & Konsep Judas Swing)',
          paragraphs: [
            'Pada pasangan `XAU/USD`, Sesi Asia umumnya memiliki volume transaksi yang lebih tenang dan bergerak menyamping (*konsolidasi*) dibandingkan Sesi London dan New York:',
            '1. **Waktu Acuan:** Rentang baku ICT **Asia Range** diukur pada pukul **`20:00–00:00 NY`** — setara **`08:00–12:00 WITA`** saat Musim Panas/EDT (`07:00–11:00 WIB`) atau **`09:00–13:00 WITA`** saat Musim Dingin/EST (`08:00–12:00 WIB`). Secara keseluruhan, fase konsolidasi Asia ini terus berlangsung hingga menjelang pembukaan Sesi London sekitar pukul **`14:00–15:00 WITA`** (`13:00–14:00 WIB`).',
            '2. **Cara Kerja (Konsep Judas Swing):** Batas atas (**Asia High**) dan batas bawah (**Asia Low**) menjadi dua Liquidity Pool terdekat. Saat Sesi London dibuka, harga emas sangat sering melakukan gerakan tipuan (**Judas Swing**) dengan menyapu salah satu sisi Asia Range terlebih dahulu untuk menyerap tumpukan Stop Loss, lalu berbalik arah secara agresif menuju sisi berlawanannya hingga Sesi New York.'
          ]
        },
        {
          number: '11.5',
          heading: 'Urutan Praktis Memetakan Liquidity Gold, Status Fresh vs Taken & Contoh XAU/USD',
          paragraphs: [
            'Agar peta grafik tetap bersih dan langsung siap pakai sebelum Sesi London dibuka, ikuti **5 langkah praktis** berikut secara berurutan:',
            '1. **Tandai Level Mingguan & Harian:** Mulai dari timeframe `H4` atau `H1`, tarik garis horizontal pada **PWH**, **PWL**, **PDH**, dan **PDL**.',
            '2. **Cari Pola Sejajar (`EQH` / `EQL`):** Perhatikan apakah ada dua puncak sejajar (`EQH`) atau dua dasar sejajar (`EQL`) yang terbentuk di dekat level harian tersebut.',
            '3. **Tandai `Asia Range`:** Menjelang pembukaan Sesi London, tandai **Asia High** dan **Asia Low** pada timeframe `M15` sebagai batas likuiditas intraday terdekat.',
            '4. **Pisahkan Status `FRESH` vs `TAKEN`:** Level yang belum tersentuh hari ini berstatus **FRESH** (Stop Loss di baliknya masih utuh dan sah dijadikan target). Begitu harga sudah melampauinya, langsung ubah statusnya menjadi **TAKEN / SWEPT** agar Anda tidak lagi menargetkan area yang likuiditasnya sudah terambil.',
            '5. **Tunggu Sweep & Konfirmasi Struktur (`MSS` / `CISD`):** Jangan terburu-buru masuk saat harga baru menyentuh garis. Tunggu Sesi London atau New York menyapu salah satu sisi likuiditas terlebih dahulu, lalu tunggu konfirmasi perubahan struktur (**`MSS`** atau **`CISD`**) sebelum membuka posisi dengan target mengarah ke Liquidity Pool **FRESH** di sisi berlawanan.'
          ],
          exampleBox: {
            title: 'Contoh Penerapan Peta Liquidity Gold (XAU/USD) — Judas Swing Sesi London',
            rows: [
              {
                label: '1. Peta Pra-London (13:45 WITA / 12:45 WIB)',
                detail: 'Bias harian **Bullish**. Di grafik tercatat: **PDH** di `2.670,00` (Fresh), **Asia High** di `2.654,00` (Fresh), **Asia Low** di `2.646,00` (Fresh, sekaligus membentuk **EQL**), dan **PDL** tepat di bawahnya pada `2.644,50` (Fresh).'
              },
              {
                label: '2. Sweep SSL (Judas Swing 14:15 WITA)',
                detail: 'Saat Sesi London dibuka, harga Gold turun cepat menembus `Asia Low` (`2.646,00`) sekaligus menyapu `PDL` (`2.644,50`) hingga menyentuh `2.642,80`, lalu segera ditarik kembali ke atas dengan sumbu (*wick*) panjang. Status `Asia Low` dan `PDL` kini berubah menjadi **TAKEN**.'
              },
              {
                label: '3. Konfirmasi & Entry (M5)',
                detail: 'Harga mencetak dorongan naik bertenaga (*Displacement*) yang memicu **`MSS` / `CISD` bullish** dan meninggalkan **Fair Value Gap (`FVG`)** di `2.647,00 – 2.649,00`. Trader masuk **BUY** saat pullback menyentuh `FVG` dengan Stop Loss aman di bawah titik terendah sweep (`2.641,50`).'
              },
              {
                label: '4. Penetapan Target (TP)',
                detail: '**TP1** diletakkan pada Liquidity Pool terdekat yang masih Fresh yaitu **Asia High (`2.654,00`)**, dan **TP2** diarahkan ke **PDH (`2.670,00`)** yang masih Fresh.'
              }
            ]
          },
          callout: {
            tone: 'info',
            title: 'Rutinitas Pemetaan Harian Sebelum Sesi London',
            body: 'Luangkan 5 menit setiap hari sekitar pukul **13:30–14:30 WITA** (`12:30–13:30 WIB`) untuk menandai **PWH/PWL**, **PDH/PDL**, **Asia High/Low**, dan **EQH/EQL** di chart `XAU/USD`. Perbarui status level dari **FRESH** menjadi **TAKEN** segera setelah tersapu agar fokus selalu tertuju pada area likuiditas yang masih utuh.'
          }
        }
      ],
      keyTakeaways: [
        '**BSL** adalah tumpukan Stop Loss *seller* + *Buy Stop* di atas Swing High/Resistance; **SSL** adalah tumpukan Stop Loss *buyer* + *Sell Stop* di bawah Swing Low/Support.',
        '**EQH** (*Double Top*) dan **EQL** (*Double Bottom*) merupakan area penumpukan Stop Loss ganda yang berprobabilitas tinggi untuk disapu (*sweep*).',
        'Tandai level berbasis waktu utama (**PWH/PWL**, **PDH/PDL**) dan **Asia Range** (`20:00–00:00 NY` = `08:00–12:00 WITA` EDT / `09:00–13:00 WITA` EST) untuk mengantisipasi *Judas Swing* saat pembukaan Sesi London.',
        'Selalu pisahkan status **FRESH** vs **TAKEN**, tunggu sweep terjadi terlebih dahulu, lalu konfirmasi arah lewat **`MSS` / `CISD`** sebelum membidik Liquidity Pool Fresh di sisi seberang.'
      ],
      bridgeNext: 'Setelah mampu memetakan seluruh titik likuiditas utama (`BSL/SSL`, `EQH/EQL`, `PDH/PDL`, `PWH/PWL`, dan `Asia Range`), langkah penting berikutnya adalah membedakan penembusan yang langsung berbalik arah (**Liquidity Sweep**) dari penembusan yang terus melaju mengikuti tren (**Liquidity Run**). Pembahasannya ada di **Bab 12**.',
      conceptBlocks: [
        {
          heading: 'Peta Liquidity Gold: BSL/SSL, EQH/EQL, PDH/PDL, PWH/PWL & Asia Range',
          paragraphs: [
            'BSL menumpuk di atas puncak (SL seller + Buy Stop) dan SSL menumpuk di bawah lembah (SL buyer + Sell Stop). Pola sejajar EQH/EQL menjadi target sweep prioritas karena menumpuk Stop Loss ganda.',
            'Tandai PWH/PWL, PDH/PDL, dan Asia Range (20:00–00:00 NY) menjelang Sesi London untuk mengantisipasi Judas Swing, pisahkan status Fresh vs Taken, lalu tunggu konfirmasi MSS/CISD sebelum entry.'
          ]
        }
      ],
      mappingSteps: [
        'Tandai level mingguan & harian (PWH, PWL, PDH, PDL) pada timeframe H4/H1.',
        'Cari pola puncak/dasar sejajar (EQH/EQL) di dekat level harian, lalu tandai Asia High & Asia Low di M15 menjelang Sesi London.',
        'Pisahkan status FRESH vs TAKEN, tunggu sweep salah satu sisi, lalu tunggu konfirmasi MSS/CISD sebelum membuka posisi menuju Liquidity Pool Fresh di sisi seberang.'
      ],
      decisionTree: [
        {
          condition: 'Terdapat dua puncak sejajar (EQH) di M15 tepat di bawah PDH yang masih Fresh.',
          action: 'Perlakukan EQH sebagai area BSL padat yang berpotensi disapu; hindari menaruh Stop Loss SELL terlalu rapat tepat di atasnya.'
        },
        {
          condition: 'Harga saat pembukaan Sesi London menyapu Asia Low + PDL dengan wick panjang lalu memicu MSS/CISD bullish.',
          action: 'Ubah status Asia Low & PDL menjadi TAKEN, lalu cari peluang BUY dengan target ke Asia High (Fresh) dan PDH (Fresh).'
        }
      ],
      failedCase: {
        context: 'Trader melihat pola Double Top (EQH) di 2.665,00, langsung membuka SELL tanpa menunggu sweep atau konfirmasi, lalu menaruh SL rapat di 2.666,50.',
        whyFailed: 'EQH menyimpan tumpukan BSL besar; harga naik menyapu 2.667,50 terlebih dahulu untuk menyerap Stop Loss ritel sebelum akhirnya berbalik turun.'
      },
      validRules: [
        'Selalu petakan PWH/PWL, PDH/PDL, Asia Range, dan EQH/EQL sebelum Sesi London dibuka.',
        'Pisahkan level yang masih Fresh dari yang sudah Taken/Swept agar target TP selalu rasional.'
      ],
      invalidRules: [
        'Menganggap Double Top (EQH) atau Double Bottom (EQL) sebagai batas anti-tembus untuk meletakkan Stop Loss tipis.',
        'Tetap menjadikan PDH atau Asia High sebagai target segar padahal level tersebut sudah disapu (TAKEN).'
      ],
      xauScenario: {
        context: 'Pukul 14:15 WITA (EDT), Gold menyapu Asia Low 2.646,00 dan PDL 2.644,50 hingga 2.642,80 dengan wick panjang, sementara Asia High 2.654,00 dan PDH 2.670,00 masih Fresh.',
        steps: [
          'Tandai Asia Low dan PDL sebagai TAKEN; tunggu konfirmasi MSS/CISD bullish pada M5.',
          'Masuk BUY saat pullback ke FVG dengan SL di bawah 2.642,80 dan arahkan target ke Asia High (2.654,00) serta PDH (2.670,00).'
        ]
      },
      goldenRules: [
        'Kenali peta BSL/SSL, EQH/EQL, PDH/PDL, PWH/PWL, dan Asia Range sebelum entry — tunggu likuiditas disapu dan terkonfirmasi MSS/CISD agar tidak terjebak menjadi likuiditas pasar.'
      ],
      practiceCta: {
        label: 'Amati PDH/PDL & Asia High/Low di Chart Gold',
        description: 'Lihat garis PWH/PWL, PDH/PDL, dan Asia Range yang terpetakan otomatis pada Cockpit Mapping.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Secara mekanis di sistem bursa, mengapa kumpulan Stop Loss milik para trader **BUY** di bawah sebuah Swing Low disebut **Sell-Side Liquidity (SSL)**?',
          options: [
            'Karena hanya berlaku pada Sesi Asia',
            'Karena ketika Stop Loss posisi BUY tersentuh, perintah yang tereksekusi adalah order **SELL** — menjadi pasokan jual bagi institusi yang ingin membeli dalam volume besar',
            'Karena semua trader BUY wajib menutup akunnya',
            'Karena SSL selalu berada di atas puncak tertinggi tahunan'
          ],
          answerIndex: 1,
          explanation: 'Menutup posisi BUY secara otomatis mengeksekusi order SELL. Kumpulan Stop Loss BUY di bawah lembah membentuk Liquidity Pool pesanan jual (SSL).'
        },
        {
          question: 'Dalam kerangka ICT, bagaimana seharusnya trader memperlakukan dua puncak yang sejajar (**Equal Highs / EQH**) pada chart Gold?',
          options: [
            'Sebagai Resistance kuat yang mustahil ditembus sehingga aman menaruh SL SELL rapat di atasnya',
            'Sebagai area penumpukan BSL besar yang berprobabilitas tinggi untuk disapu (*sweep*) guna mengambil tumpukan Stop Loss ritel',
            'Sebagai tanda pasar akhir pekan',
            'Sebagai garis batas margin call'
          ],
          answerIndex: 1,
          explanation: 'EQH/EQL menarik banyak trader ritel memasang SL rapat tepat di baliknya, sehingga menjadi salah satu target sweep utama pada XAU/USD.'
        },
        {
          question: 'Jam berapakah rentang baku **Asia Range (`20:00–00:00 NY`)** jika dikonversi ke waktu **WITA**?',
          options: [
            '00:00–04:00 WITA sepanjang tahun',
            '**08:00–12:00 WITA** saat Musim Panas (EDT, +12 jam) dan **09:00–13:00 WITA** saat Musim Dingin (EST, +13 jam)',
            '19:00–23:00 WITA sepanjang tahun',
            '14:00–18:00 WITA setiap hari Jumat saja'
          ],
          answerIndex: 1,
          explanation: 'Pada waktu WITA (UTC+8): saat EDT (+12 jam) 20:00–00:00 NY = 08:00–12:00 WITA (07:00–11:00 WIB); saat EST (+13 jam) = 09:00–13:00 WITA (08:00–12:00 WIB).'
        },
        {
          question: 'PDH kemarin berada di `2.670,00`. Pada pukul 15:30 WITA hari ini, harga Gold sudah sempat naik ke `2.673,00` lalu turun ke `2.668,00`. Bagaimana status level `PDH 2.670,00` sekarang?',
          options: [
            'Masih Fresh dan menjadi target BUY paling segar',
            'Sudah **TAKEN / SWEPT** — Liquidity Pool di atas PDH sudah terambil sehingga tidak lagi diperlakukan sebagai target segar',
            'Otomatis berubah menjadi PWL',
            'Tidak valid karena terjadi pada hari kerja'
          ],
          answerIndex: 1,
          explanation: 'Begitu harga melampaui PDH, likuiditas di atasnya sudah terambil (TAKEN/SWEPT). Evaluasi potensi pembalikan arah atau target Fresh berikutnya.'
        }
      ]
    },

    // =========================================================================
    // BAB 12 — LIQUIDITY SWEEP (PURGE & REVERT) VS LIQUIDITY RUN (EXPANSION)
    // =========================================================================
    {
      id: 'inducement-idm-umpan-ritel',
      number: 12,
      levelId: 1,
      bookFormat: true,
      title: 'Liquidity Sweep vs Liquidity Run: Stop Hunt, Purge & Revert vs Ekspansi',
      subtitle: 'Cara membedakan penembusan level likuiditas yang akan berbalik arah (Liquidity Sweep) dari penembusan yang terus melaju mengikuti tren (Liquidity Run) pada grafik Gold (XAU/USD).',
      readMinutes: 11,
      diagramId: 'inducement-trap',
      diagramAfterSection: 1,
      summary: 'Pahami perbedaan Liquidity Sweep (Purge & Revert) dan Liquidity Run (Expansion), ciri masing-masing pada penutupan candle dan reaksi 1–3 candle berikutnya, langkah praktis menghindari salah tebak, serta studi kasus XAU/USD dalam satu hari trading.',
      bookSections: [
        {
          number: '12.1',
          heading: 'Perbandingan Liquidity Sweep vs. Liquidity Run',
          shortTitle: 'Sweep vs Liquidity Run',
          paragraphs: [
            'Setelah mampu memetakan titik likuiditas utama di Bab 11 (`PWH/PWL`, `PDH/PDL`, `Asia High/Low`, dan `EQH/EQL`), tantangan paling krusial saat harga menyentuh salah satu garis tersebut adalah membaca niat pasar: apakah harga akan berbalik arah atau justru terus melaju?',
            'Secara singkat, **Liquidity Sweep (*Purge & Revert*)** terjadi ketika harga menembus level likuiditas semata untuk menyapu pesanan Stop Loss lalu segera berbalik arah ke sisi berlawanan. Sebaliknya, **Liquidity Run (*Expansion*)** terjadi ketika harga menembus level likuiditas dengan tenaga penuh dan terus melanjutkan tren karena target utama (*Draw on Liquidity / DOL*) masih berada lebih jauh di arah yang sama.'
          ],
          table: {
            caption: 'Perbandingan Liquidity Sweep vs. Liquidity Run pada Gold (XAU/USD)',
            headers: ['Aspek', 'Liquidity Sweep (Purge & Revert)', 'Liquidity Run (Expansion)'],
            rows: [
              [
                '**Konteks Arah Tren (HTF Bias)**',
                'Terjadi **melawan** arah tren utama (misalnya menyapu `Asia Low` saat bias harian *Bullish*) atau tepat menyentuh zona `FVG`/`Order Block` di timeframe besar.',
                'Terjadi **searah** tren utama menuju target `DOL` yang lebih jauh dan masih *Fresh* (misalnya menembus `Asia High` menuju `PDH`/`PWH` saat hari *Bullish*).'
              ],
              [
                '**Penutupan Candle (`Body` vs `Wick`)**',
                'Harga hanya menusuk keluar dengan **sumbu (*wick*) panjang**, lalu badan candle (*body*) ditutup kembali di dalam area lama.',
                'Badan candle (*body*) menutup **penuh dan solid di luar level** dengan sumbu penolakan yang sangat kecil.'
              ],
              [
                '**Reaksi 1–3 Candle Berikutnya**',
                'Segera muncul dorongan balik bertenaga (*Displacement*), meninggalkan `FVG` baru, dan mematahkan struktur internal (**`MSS` / `CISD`**).',
                'Harga bertahan (*acceptance*) di luar level, koreksi tipis hanya menyentuh `FVG` searah, lalu melanjutkan ekspansi menembus level baru.'
              ],
              [
                '**Waktu Kemunculan (Sesi)**',
                'Paling sering muncul di awal **Sesi London** (`14:00–17:00 WITA` / `13:00–16:00 WIB`) atau awal **Sesi New York** (`19:00–22:00 WITA` / `18:00–21:00 WIB`) sebagai *Judas Swing*.',
                'Terjadi pada fase ekspansi utama setelah sisi likuiditas berlawanan lebih dulu disapu pada awal sesi.'
              ]
            ]
          }
        },
        {
          number: '12.2',
          heading: 'Ciri-Ciri Liquidity Sweep (Purge & Revert)',
          shortTitle: 'Ciri Liquidity Sweep',
          paragraphs: [
            '**Liquidity Sweep** menandakan institusi sedang mengambil kumpulan Stop Loss di satu sisi untuk mengisi posisi besar sebelum menggerakkan harga ke arah sebaliknya:',
            '1. **Penolakan Sumbu (*Wick Rejection*):** Prinsip ICT menyebutkan *"Bodies tell the story, wicks do the damage"*. Saat candle `M15` atau `H1` menusuk melewati level hanya dengan sumbu lalu *body* ditutup kembali di dalam range, itu adalah tanda awal Stop Loss sudah diambil.',
            '2. **Terjadi Melawan Bias atau di Zona HTF:** Penembusan `Asia Low` atau `PDL` pada hari *Bullish*—terutama jika menyentuh area `FVG` atau `Order Block` `H1`/`H4`—memiliki peluang tinggi berakhir sebagai sweep pembalikan.',
            '3. **Diikuti Pembalikan Cepat (`Displacement` + `MSS` / `CISD`):** Dalam 1–3 candle `M5` setelahnya, harga langsung memantul impulsif meninggalkan `FVG` searah pembalikan dan mematahkan struktur internal (`MSS` atau `CISD`). Bahkan jika satu candle sempat menutup *body* tipis di luar level, kembalinya harga dengan `Displacement` kuat dan `CISD` tetap mengonfirmasi terjadinya sweep.'
          ]
        },
        {
          number: '12.3',
          heading: 'Ciri-Ciri Liquidity Run (Expansion)',
          shortTitle: 'Ciri Liquidity Run',
          paragraphs: [
            '**Liquidity Run** adalah kesalahan paling mahal jika dilawan dengan posisi *counter-trend*, karena harga memang sedang bergerak menuju target likuiditas yang lebih tinggi atau lebih rendah:',
            '1. **Body Close Solid di Luar Level:** Candle `M15` atau `H1` menutup penuh di luar batas `Asia High/Low` atau `PDH/PDL` tanpa penolakan sumbu berarti. Ini menandakan pasar menerima (*acceptance*) harga baru tersebut.',
            '2. **Searah Tren Utama & Masih Ada Target Lebih Jauh:** Ketika bias harian sedang *Bullish* dan `PDH` masih berjarak `$15` di atas, penembusan `Asia High` bukanlah akhir kenaikan, melainkan titik lintasan menuju `PDH`.',
            '3. **Sisi Berlawanan Sudah Disapu Lebih Dulu:** Apabila `SSL` di sisi bawah (`Asia Low`/`PDL`) sudah disapu pada awal Sesi London, maka penembusan `BSL` di sisi atas (`Asia High`) setelahnya jauh lebih condong menjadi *Liquidity Run* yang melaju kencang.'
          ]
        },
        {
          number: '12.4',
          heading: 'Langkah Praktis Menghindari Salah Tebak Sweep vs. Run',
          shortTitle: 'Langkah Praktis',
          paragraphs: [
            'Agar tidak terjebak melawan tren saat *Liquidity Run* atau ikut mengejar breakout palsu saat *Liquidity Sweep*, terapkan **4 langkah praktis** berikut:',
            '1. **Tentukan Peran Level Sebelum Tersentuh:** Sebelum Sesi London dibuka, catat mana level yang berlawanan dengan Bias harian (kandidat **Sweep**) dan mana level yang searah Bias menuju target lebih jauh (kandidat **Run**).',
            '2. **Perlakukan Level sebagai Area Observasi, Bukan Tombol Entry:** Jangan langsung membuka posisi di detik pertama harga menyentuh `PDH/PDL` atau `Asia High/Low`. Tunggu candle `M15` selesai ditutup.',
            '3. **Tunggu Bukti 1–3 Candle Berikutnya di `M5`:** Hanya cari entry pembalikan arah jika muncul `Displacement` balik disertai **`MSS` / `CISD`**. Jika harga bertahan di luar level tanpa tanda pembalikan, jangan sekali-kali memaksakan posisi lawan arah.',
            '4. **Jadikan Level Liquidity Run sebagai Target Profit (`TP1`):** Jika Anda sudah memegang posisi searah tren dari area sweep awal, gunakan level pertama yang ditembus dalam *Liquidity Run* (seperti `Asia High`) sebagai `TP1` atau tempat mengamankan sebagian profit sambil membiarkan sisa posisi menuju `PDH`.'
          ]
        },
        {
          number: '12.5',
          heading: 'Contoh Penerapan pada Gold (XAU/USD): Sweep di Asia Low vs. Run di Asia High',
          shortTitle: 'Contoh Kasus XAU/USD',
          paragraphs: [
            'Perhatikan bagaimana kedua kejadian ini sering muncul berurutan dalam satu hari trading yang sama pada `XAU/USD`:'
          ],
          exampleBox: {
            title: 'Studi Kasus Satu Hari Trading XAU/USD (Daily Bias: BULLISH · Target DOL: PDH 2.670,00)',
            rows: [
              {
                label: '1. Peta Awal (Asia Range: 2.646,00 – 2.654,00)',
                detail: 'Tren `Daily` dan `H1` sedang **Bullish** dengan target utama masih jauh di **PDH `2.670,00`** (*Fresh*). Artinya, `Asia Low` (`2.646,00`) berlawanan dengan Bias (**kandidat Sweep**), sedangkan `Asia High` (`2.654,00`) searah menuju `PDH` (**kandidat Liquidity Run**).'
              },
              {
                label: '2. Kejadian A — 14:35 WITA (13:35 WIB) · Asia Low Ditembus',
                detail: 'Saat pembukaan London, harga turun ke `2.643,20` menyapu `Asia Low` (`2.646,00`) dan menyentuh `H1 Discount FVG`. Candle `M15` ditutup kembali di `2.647,40` dengan *wick* bawah panjang. Dua candle `M5` berikutnya mencetak *Displacement* naik meninggalkan `Bullish FVG` dan memicu **`MSS` / `CISD`**. **Kesimpulan:** **Liquidity Sweep valid** — peluang ideal mencari **BUY**.'
              },
              {
                label: '3. Kejadian B — 15:45 WITA (14:45 WIB) · Asia High Ditembus',
                detail: 'Satu jam kemudian harga menembus `Asia High` (`2.654,00`). Candle `M15` menutup **body penuh di `2.657,80`** tanpa *wick* penolakan, sisi bawah sudah selesai disapu, dan `PDH` (`2.670,00`) masih `$12` di atas. Tiga candle berikutnya hanya koreksi tipis ke `2.655,50` lalu terus melaju hingga `2.669,50`. **Kesimpulan:** **Liquidity Run (Expansion)** — jadikan `Asia High` sebagai `TP1` posisi BUY, bukan tempat membuka SELL melawan arus.'
              }
            ]
          },
          callout: {
            tone: 'info',
            title: 'Penutup Bagian II & Jembatan ke Bagian III',
            body: 'Seluruh fondasi **Bagian II (Bab 07–12)** kini telah lengkap: struktur pasar 3-candle, analisis Top-Down, BOS Valid vs Sweep, Dealing Range `ERL ↔ IRL`, Peta Liquidity Gold, serta perbedaan **Liquidity Sweep vs. Liquidity Run**. Di **Bagian III (Bab 13–17)**, kita akan mendalami dua penentu utama arah dan waktu: **Draw on Liquidity (`DOL`)**, **Daily Bias**, serta jadwal sesi **Killzone & Macro**.'
          }
        }
      ],
      keyTakeaways: [
        'Tidak semua penembusan level likuiditas berakhir pembalikan arah: bedakan **Liquidity Sweep (*Purge & Revert*)** dari **Liquidity Run (*Expansion*)**.',
        'Uji setiap penembusan lewat 4 aspek utama: keselarasan **HTF Bias & target DOL**, penutupan **Wick vs Body Close**, reaksi **1–3 candle berikutnya (`Displacement` + `MSS`/`CISD`)**, dan **waktu sesi**.',
        'Penembusan level yang **melawan Bias pada awal sesi** (seperti `Asia Low` saat hari *Bullish*) condong menjadi **Sweep**; penembusan level **searah Bias menuju DOL yang lebih jauh** condong menjadi **Liquidity Run**.',
        'Perlakukan setiap garis likuiditas sebagai area observasi reaksi—tunggu penutupan candle dan konfirmasi `MSS`/`CISD` sebelum mengambil posisi pembalikan.'
      ],
      bridgeNext: 'Fondasi **Bagian II (Bab 07–12)** telah selesai. Selanjutnya di **Bagian III: Kompas Arah**, kita membahas penentu arah harian paling penting pada **Bab 13 — Draw on Liquidity (`DOL`): Cara Menentukan Target Utama Harga Langkah demi Langkah**.',
      conceptBlocks: [
        {
          heading: 'Liquidity Sweep (Purge & Revert) vs. Liquidity Run (Expansion)',
          paragraphs: [
            'Liquidity Sweep menembus level BSL/SSL untuk menyapu Stop Loss lalu segera berbalik dengan Displacement + MSS/CISD menuju sisi berlawanan.',
            'Liquidity Run menembus level searah HTF Bias dengan Body Close solid dan bertahan di luar level karena Draw on Liquidity (DOL) utama masih berada lebih jauh di arah yang sama.'
          ]
        }
      ],
      mappingSteps: [
        'Tentukan peran level sebelum tersentuh: sisi melawan HTF Bias = kandidat Sweep (Purge & Revert); sisi searah menuju DOL lebih jauh = kandidat Liquidity Run.',
        'Saat harga menembus PDH/PDL, Asia H/L, atau EQH/EQL, tunggu penutupan candle M15/H1 (Wick rejection kembali ke range vs Body Close penuh di luar level).',
        'Amati 1–3 candle berikutnya di M5: hanya entry pembalikan jika muncul Displacement balik + MSS/CISD; jika harga bertahan di luar level, perlakukan sebagai Liquidity Run.'
      ],
      decisionTree: [
        {
          condition: 'Daily & H1 Bullish menuju PDH, lalu pembukaan London menyapu Asia Low hanya dengan wick dan M5 langsung mencetak Displacement naik + CISD.',
          action: 'Liquidity Sweep (Purge & Revert) terkonfirmasi — valid mencari peluang BUY menuju Asia High dan PDH.'
        },
        {
          condition: 'Daily & H1 Bullish menuju PDH yang masih $15 di atas, lalu Asia High ditembus Body Close M15 penuh tanpa penolakan.',
          action: 'Liquidity Run (Expansion) searah tren — hindari SELL melawan arah; jadikan Asia High sebagai TP1 atau tunggu pullback searah tren.'
        }
      ],
      failedCase: {
        context: 'Pada hari Bullish (target PDH 2.670) setelah Asia Low sudah disapu, trader langsung SELL saat harga menembus Asia High 2.654 hanya karena garis BSL tersentuh.',
        whyFailed: 'Gagal membedakan Sweep vs Liquidity Run: tidak ada wick rejection, tidak ada MSS/CISD turun, dan target utama PDH masih $16 lebih tinggi.'
      },
      validRules: [
        'Selalu kombinasikan 4 aspek: arah HTF Bias & DOL, Body Close vs Wick, reaksi 1–3 candle berikutnya (MSS/CISD), dan waktu sesi.',
        'Perlakukan level likuiditas sebagai area pengamatan reaksi, bukan tombol eksekusi spontan saat candle masih berjalan.'
      ],
      invalidRules: [
        'Menganggap setiap penembusan Old High / Old Low pasti langsung berbalik arah di tengah Liquidity Run.',
        'Membuka posisi pembalikan sebelum muncul bukti Displacement balik dan MSS/CISD pada timeframe eksekusi.'
      ],
      xauScenario: {
        context: 'XAU/USD Daily Bullish (DOL PDH 2.670), Asia Range 2.646–2.654. Pukul 14:35 WITA pembukaan London menyapu 2.643,20 lalu close balik di 2.647,40.',
        steps: [
          'Konfirmasi Asia Low 2.646 sebagai Liquidity Sweep setelah M5 mencetak Displacement naik + MSS/CISD (cari Buy menuju Asia High & PDH).',
          'Saat Asia High 2.654 ditembus Body Close penuh pukul 15:45 WITA, kenali sebagai Liquidity Run menuju PDH 2.670 dan hindari Sell melawan tren.'
        ]
      },
      goldenRules: [
        'Penembusan melawan HTF Bias + Wick Rejection + MSS/CISD balik = Liquidity Sweep; penembusan searah HTF Bias + Body Close solid menuju DOL lebih jauh = Liquidity Run.'
      ],
      practiceCta: {
        label: 'Latih Deteksi Stop Hunt & Sweep di 100 Kasus',
        description: 'Uji ketepatan membedakan Liquidity Sweep (Purge & Revert) valid dari jebakan penembusan dan Liquidity Run pada kasus XAU/USD.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Pada hari dengan Daily & H1 **Bullish** (target DOL masih jauh di `PDH 2.670`), harga baru saja selesai menyapu Asia Low pukul `14:35 WITA`, lalu pukul `15:45 WITA` menembus **Asia High `2.654`** dengan **Body Close M15 penuh** di `2.657,80` tanpa *wick* penolakan. Penembusan Asia High ini paling tepat dibaca sebagai...',
          options: [
            'Sinyal wajib langsung SELL melawan tren karena BSL Asia High sudah tersentuh',
            '**Liquidity Run (Expansion)** searah HTF Bias menuju target PDH `2.670` — bukan area melawan tren',
            'Tanda pasar memasuki sesi akhir pekan',
            'Bukti bahwa Daily Bias otomatis berubah menjadi Bearish'
          ],
          answerIndex: 1,
          explanation: 'Karena penembusan searah HTF Bias menuju target PDH yang masih jauh, SSL bawah sudah terambil, dan M15 menutup body penuh di luar level, itu adalah Liquidity Run (Expansion).'
        },
        {
          question: 'Manakah bukti reaksi **1–3 candle berikutnya** yang paling kuat mengonfirmasi bahwa penembusan di bawah `PDL / Asia Low` adalah **Liquidity Sweep (Purge & Revert)** dan bukan awal Liquidity Run turun?',
          options: [
            'Harga terus bertahan di bawah level selama 6 candle dengan body merah penuh',
            'Candle segera kembali masuk ke dalam range diikuti **Displacement naik** yang meninggalkan **Bullish FVG** dan mematahkan struktur internal (**`MSS` / `CISD`**)',
            'Spread melebar selama 2 menit di tengah jam sepi Asia',
            'Muncul 1 candle doji kecil tanpa ada perubahan struktur sama sekali'
          ],
          answerIndex: 1,
          explanation: 'Konfirmasi objektif Liquidity Sweep adalah perpindahan kendali nyata: harga kembali masuk range disertai Displacement berlawanan, FVG baru, dan patah struktur internal (MSS/CISD).'
        },
        {
          question: 'Dalam konsep ICT, apa makna praktis prinsip **"Bodies tell the story, wicks do the damage"** saat menilai penembusan level likuiditas (`PDH/PDL` atau `Asia High/Low`)?',
          options: [
            'Sumbu panjang di luar level tidak boleh dilihat di chart',
            'Menusuk level hanya dengan **sumbu (*wick*)** lalu **Body Close kembali di dalam range** menandakan pengambilan likuiditas (*Sweep*), sedangkan **Body Close solid di luar level** menandakan penerimaan (*Liquidity Run*)',
            'Semua candle yang memiliki sumbu wajib diabaikan saat menentukan tren',
            'Body candle hanya berlaku pada timeframe M1, bukan M15 atau H1'
          ],
          answerIndex: 1,
          explanation: 'Sumbu di luar level menunjukkan pengambilan Stop Loss (*damage*), sementara posisi penutupan badan candle menunjukkan arah yang sebenarnya diterima pasar (*the story*).'
        },
        {
          question: 'Harga XAU/USD baru saja menyentuh `PDH 2.670,00` pada pukul `20:55 WITA` (`19:55 WIB`), dan candle M15 masih berjalan. Tindakan paling disiplin adalah...',
          options: [
            'Langsung klik SELL Market detik itu juga agar mendapat harga puncak tertinggi',
            'Langsung klik BUY Breakout tanpa melihat Daily Bias',
            'Menjadikan `PDH 2.670,00` sebagai **area observasi** — tunggu penutupan candle dan reaksi 1–3 candle berikutnya (Wick vs Body Close + `MSS`/`CISD`) sebelum menyimpulkan Sweep atau Liquidity Run',
            'Melepas Stop Loss agar posisi tahan ke dua arah'
          ],
          answerIndex: 2,
          explanation: 'Level likuiditas adalah titik pengamatan reaksi, bukan tombol eksekusi spontan. Menunggu penutupan candle dan konfirmasi reaksi mencegah salah arah melawan Liquidity Run.'
        }
      ]
    },

    // =========================================================================
    // BAB 13 (BAGIAN III) — DRAW ON LIQUIDITY (DOL)
    // =========================================================================
    {
      id: 'level-likuiditas-kunci-xauusd',
      number: 13,
      levelId: 2,
      bookFormat: true,
      title: 'Draw on Liquidity (DOL): Cara Menentukan Tujuan Utama Pergerakan Harga',
      subtitle: 'Cara menentukan satu arah tujuan harga yang paling jelas pada Gold (XAU/USD) menggunakan konsep Origin → DOL, pemisahan target DOL 1 & DOL 2, serta aturan Wait for First Sweep.',
      readMinutes: 10,
      diagramId: 'key-liquidity-levels',
      diagramAfterSection: 1,
      summary: 'Pahami pengertian Draw on Liquidity (DOL), dua jenis target pergerakan harga (External Liquidity vs Internal Imbalance), hubungan Origin ke DOL, 4 langkah praktis menentukan DOL 1 & DOL 2, aturan Wait for First Sweep di tengah range, serta contoh skenario XAU/USD.',
      bookSections: [
        {
          number: '13.1',
          heading: 'Pengertian Draw on Liquidity (DOL) & Dua Jenis Target Harga',
          paragraphs: [
            'Pada grafik Gold (`XAU/USD`), di atas harga selalu ada `BSL` dan di bawah harga selalu ada `SSL`. Pertanyaan paling penting sebelum menyusun rencana trading bukan lagi sekadar *di mana* letak likuiditas, melainkan **sisi mana yang sedang dituju harga lebih dulu?**',
            'Dalam konsep ICT, jawaban atas pertanyaan tersebut disebut **Draw on Liquidity (`DOL`)**. Secara sederhana, **Draw on Liquidity adalah level harga spesifik yang sedang menjadi tujuan utama pergerakan pasar pada sesi atau hari tersebut**—berfungsi seperti kompas arah agar Anda tahu apakah prioritas hari ini mencari peluang *Buy* ke atas atau *Sell* ke bawah.',
            'Pada setiap timeframe, pergerakan harga hanya bergerak menuju salah satu dari **dua jenis target** berikut:'
          ],
          table: {
            caption: 'Dua Jenis Target Draw on Liquidity (DOL) dalam ICT',
            headers: ['Jenis Target DOL', 'Bentuk di Grafik', 'Fungsi dalam Pergerakan Harga'],
            rows: [
              [
                '**External Range Liquidity (`ERL`)**',
                '`Old High/Low`, `EQH/EQL`, `PDH/PDL`, `PWH/PWL`, serta `Asia High/Low` yang masih berstatus **Fresh**.',
                'Menjadi tujuan utama saat fase ekspansi tren untuk mengambil kumpulan Stop Loss di batas luar rentang harga.'
              ],
              [
                '**Internal Range Liquidity (`IRL`)**',
                '**Fair Value Gap (`FVG`)** atau **Order Block (`OB`)** yang jelas pada timeframe besar (`H1` / `H4`).',
                'Menjadi tujuan fase koreksi (*pullback*) agar harga menyeimbangkan ketidakseimbangan sebelum kembali melaju menuju `ERL`.'
              ]
            ]
          }
        },
        {
          number: '13.2',
          heading: 'Hubungan Origin → DOL: Dari Mana Harga Berasal, Ke Mana Harga Menuju',
          paragraphs: [
            'Harga di pasar Gold jarang berbalik arah secara acak di ruang kosong. Untuk menentukan **DOL** secara objektif tanpa menebak, selalu perhatikan **Origin (Titik Asal Reaksi)** terbaru terlebih dahulu:',
            '1. **Origin dari Sweep Bawah (`SSL`):** Saat harga baru saja menyapu `Asia Low` atau `PDL` lalu ditutup kembali naik dengan penolakan tegas, **Origin** berada di bawah—sehingga **DOL aktif berpindah ke sisi atas (`BSL`)**.',
            '2. **Origin dari Sweep Atas (`BSL`):** Saat harga baru saja menyapu `Asia High` atau `PDH` lalu ditutup kembali turun di bawahnya, **Origin** berada di atas—sehingga **DOL aktif berpindah ke sisi bawah (`SSL`)**.',
            '3. **Origin dari Zona Internal (`IRL`):** Saat tren `H1`/`H4` sedang naik lalu harga selesai koreksi menyentuh `FVG` atau `Order Block` di area *Discount*, zona tersebut menjadi **Origin** baru untuk mendorong harga kembali membidik `BSL` eksternal (`Old High` / `PDH`).'
          ]
        },
        {
          number: '13.3',
          heading: '4 Langkah Praktis Menentukan DOL pada Gold (XAU/USD)',
          paragraphs: [
            'Gunakan **4 langkah berurutan** ini sebelum Sesi London atau New York dibuka agar target transaksi Anda selalu terukur:',
            '1. **Cek Origin Terbaru:** Amati Liquidity Pool (`Asia High/Low`, `PDH/PDL`) atau zona `FVG`/`OB` HTF mana yang baru saja disapu atau menolak harga.',
            '2. **Cocokkan dengan Arah Timeframe Besar (`H4` / `H1`):** Pastikan arah pantulan dari Origin tersebut searah dengan struktur `H4`/`H1` agar Anda bergerak bersama arus utama pasar.',
            '3. **Bagi Target Menjadi `DOL 1` & `DOL 2` (Hanya yang Masih Fresh):** Urutan prioritas target intraday adalah `Asia High/Low` → `Session High/Low` → `EQH/EQL` → `PDH/PDL` → `PWH/PWL`. Tetapkan level **Fresh** terdekat sebagai **`DOL 1` (`TP1`)** dan level harian utama sebagai **`DOL 2` (`TP2`)**.',
            '4. **Tetapkan Batas Invalidasi:** Pastikan jarak menuju target masih memberi rasio *Risk:Reward* minimal `1:2`, lalu tandai ujung ekstrem titik Origin. Jika candle timeframe kerja (`M15`/`H1`) berbalik dan menutup **body** melewati titik Origin tersebut, skenario DOL lama langsung dinyatakan **batal**.'
          ]
        },
        {
          number: '13.4',
          heading: 'Aturan Saat Harga di Tengah Range (Wait for First Sweep)',
          paragraphs: [
            'Kesalahan yang sangat sering terjadi adalah memaksakan analisis arah saat harga `XAU/USD` masih berada tepat di tengah rentang harian (sekitar `50%` antara `PDH` dan `PDL`), sementara `Asia High` maupun `Asia Low` sama-sama belum disapu.',
            'Pada posisi tengah seperti itu, **Origin belum terbentuk sehingga DOL belum terkonfirmasi**. Memilih *Buy* atau *Sell* di tengah range sama dengan menebak tanpa keunggulan probabilitas.',
            'Solusi paling disiplin adalah aturan **Wait for First Sweep (Tunggu Sweep Pertama)**:',
            '1. Jika pembukaan London atau New York turun lebih dulu menyapu `Asia Low` atau `PDL` lalu ditutup kembali di atasnya, **Origin bawah** resmi terbentuk dan **DOL terkunci ke atas (`Asia High` → `PDH`)**.',
            '2. Jika harga naik lebih dulu menyapu `Asia High` atau `PDH` lalu ditutup kembali di bawahnya, **Origin atas** resmi terbentuk dan **DOL terkunci ke bawah (`Asia Low` → `PDL`)**.'
          ],
          callout: {
            tone: 'warn',
            title: 'Dua Kesalahan Umum Saat Memilih Target DOL',
            body: 'Pertama, hindari langsung membidik target terlalu jauh untuk gaya intraday (misalnya menargetkan `PWH` berjarak `$65` saat masih ada `EQH` dan `PDH` berjarak `$14` di depan harga). Kedua, jangan lagi memakai level yang sudah berstatus **TAKEN** sebagai target utama—selalu arahkan DOL ke Liquidity Pool yang masih **Fresh**.'
          }
        },
        {
          number: '13.5',
          heading: 'Contoh Penerapan pada Gold (XAU/USD): Menentukan DOL 1 & DOL 2',
          paragraphs: [
            'Berikut contoh nyata penerapan 4 langkah penentuan DOL pada `XAU/USD` menjelang pembukaan Sesi London:'
          ],
          exampleBox: {
            title: 'Studi Kasus Penentuan DOL 2 Tahap pada XAU/USD',
            rows: [
              {
                label: '1. Kondisi Awal (14:45 WITA / 13:45 WIB)',
                detail: 'Struktur `H1` sedang **Bullish** (`HH–HL`, Strong Low di `2.636,00`). **PDH** Fresh di `2.672,00` dan **PDL** Fresh di `2.638,00`. Rentang Asia berada di `2.646,00` (`Asia Low`) hingga `2.654,00` (`Asia High`). Harga berada di tengah kotak pada `2.650,00`—status masih **Wait for First Sweep**.'
              },
              {
                label: '2. Terbentuknya Origin (15:15 WITA / 14:15 WIB)',
                detail: 'Saat Sesi London aktif, Gold turun cepat ke `2.643,50` menyapu `Asia Low` (`2.646,00`) dengan *wick* panjang, lalu candle `M15` ditutup kembali di atas `2.647,50`. Sweep valid dan **Origin bawah** resmi terbentuk.'
              },
              {
                label: '3. Penetapan DOL 1 & DOL 2',
                detail: '**DOL 1 (`TP1` Terdekat):** `Asia High` `2.654,00` (*Fresh*, jarak `+$6,50`). **DOL 2 (`TP2` Utama):** `PDH` `2.672,00` (*Fresh*, searah dengan struktur Bullish `H1`).'
              },
              {
                label: '4. Batas Invalidasi DOL',
                detail: 'Skenario DOL ke atas dinyatakan **batal** apabila candle `M15` atau `H1` berbalik dan menutup **body** di bawah `2.643,50` (titik terendah sweep). Jika itu terjadi, arah DOL berpindah menuju `PDL` `2.638,00`.'
              }
            ]
          }
        }
      ],
      keyTakeaways: [
        '**Draw on Liquidity (`DOL`)** adalah target spesifik yang sedang dituju pasar: **External Range Liquidity (`BSL`/`SSL` Fresh)** atau **Internal Range Liquidity (`FVG`/`OB` HTF)**.',
        'Penentuan DOL selalu berangkat dari **Origin** (level likuiditas atau zona HTF yang baru saja disapu atau menolak harga), bukan dari tebakan subjektif.',
        'Ikuti **4 langkah praktis**: cek **Origin**, cocokkan arah **HTF (`H4`/`H1`)**, pisahkan target Fresh menjadi **`DOL 1` (`TP1`) & `DOL 2` (`TP2`)**, dan pasang **batas invalidasi** di ujung Origin.',
        'Saat harga masih berada di tengah range tanpa sweep Origin, terapkan aturan **Wait for First Sweep** sebelum menentukan arah.'
      ],
      bridgeNext: 'Setelah mampu menentukan tujuan utama harga (**Draw on Liquidity**), langkah berikutnya adalah menggabungkannya dengan struktur penutupan candle harian agar arah prioritas setiap hari dapat disusun sejak pagi. Pembahasannya ada di **Bab 14: Menentukan Daily Bias dan Membaca Arah Candle Harian (Next-Day Expansion)**.',
      conceptBlocks: [
        {
          heading: 'Draw on Liquidity (DOL): Hubungan Origin → Target Fresh',
          paragraphs: [
            'Draw on Liquidity adalah satu tujuan utama (External BSL/SSL Fresh atau Internal FVG/OB HTF) yang sedang dituju pergerakan harga.',
            'Tentukan DOL melalui 4 langkah: identifikasi Origin terbaru, pastikan selaras struktur H4/H1, bagi target Fresh menjadi DOL 1 (TP1) & DOL 2 (TP2), serta pasang batas invalidasi pada body close melewati ujung Origin.'
          ]
        }
      ],
      mappingSteps: [
        'Identifikasi Origin terbaru: Liquidity Pool atau zona FVG/OB HTF mana yang baru saja disapu atau menolak harga.',
        'Cocokkan arah pantulan dari Origin tersebut dengan struktur tren H4/H1.',
        'Tetapkan DOL 1 (target intraday Fresh terdekat seperti Asia H/L atau EQH/EQL), DOL 2 (target harian seperti PDH/PDL), serta batas invalidasinya.'
      ],
      decisionTree: [
        {
          condition: 'Harga berada di tengah (50%) antara PDH dan PDL serta belum menyapu Asia High maupun Asia Low.',
          action: 'Jangan menebak arah DOL. Terapkan aturan Wait for First Sweep hingga salah satu ujung Asia Range disapu lebih dulu.'
        },
        {
          condition: 'Harga baru saja menyapu Asia Low dengan penolakan tegas sementara struktur H1 Bullish dan PDH masih Fresh.',
          action: 'Tetapkan DOL ke atas: Asia High sebagai DOL 1 (TP1) dan PDH sebagai DOL 2 (TP2), dengan batas invalidasi di bawah ujung sweep.'
        }
      ],
      failedCase: {
        context: 'Trader memilih PDH sebagai target DOL Buy padahal harga baru saja menyapu PDH 30 menit sebelumnya dan ditutup kembali di bawahnya dengan wick panjang.',
        whyFailed: 'PDH sudah berubah status menjadi TAKEN sekaligus menjadi Origin sweep atas, sehingga arah DOL justru berpotensi berpindah ke bawah.'
      },
      validRules: [
        'Selalu hubungkan Origin (sisi yang baru disapu atau ditolak) dengan DOL (Liquidity Pool Fresh di sisi berlawanan).',
        'Pisahkan DOL 1 (target terdekat/TP1) dan DOL 2 (target harian utama/TP2).'
      ],
      invalidRules: [
        'Menebak arah DOL ketika harga masih di tengah range tanpa sweep Origin.',
        'Tetap menargetkan level likuiditas yang sudah berstatus TAKEN sebagai DOL baru.'
      ],
      xauScenario: {
        context: 'Pukul 15:15 WITA (14:15 WIB), struktur H1 Bullish, XAU/USD menyapu Asia Low 2.646,00 hingga 2.643,50 lalu close kembali di atas 2.647,50.',
        steps: [
          'Origin terkonfirmasi = Sweep Asia Low.',
          'DOL 1 ditetapkan pada Asia High 2.654,00 dan DOL 2 pada PDH Fresh 2.672,00; skenario batal jika body close di bawah 2.643,50.'
        ]
      },
      goldenRules: [
        'Penentuan tujuan harga (DOL) selalu berangkat dari bukti titik asal reaksi (Origin) menuju Liquidity Pool Fresh terdekat, bukan dari perkiraan subjektif.'
      ],
      practiceCta: {
        label: 'Lihat Target DOL Live di Cockpit Mapping',
        description: 'Bandingkan langsung target DOL aktif, Liquidity Pool BSL/SSL Fresh, dan status Dealing Range Gold di Cockpit Mapping.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Dalam konsep ICT, hanya ada **dua jenis target** yang menjadi tujuan pergerakan harga (**Draw on Liquidity**). Apa saja keduanya?',
          options: [
            'Mengejar garis Moving Average 50 dan menunggu indikator RSI jenuh',
            'Menuju Liquidity Pool eksternal yang masih Fresh (`Old High/Low`, `PDH/PDL`, `EQH/EQL`) atau menuju area ketidakseimbangan internal (`FVG`/`OB` HTF)',
            'Naik setiap hari Senin dan turun setiap hari Jumat',
            'Hanya bergerak saat spread melebar di jam rollover'
          ],
          answerIndex: 1,
          explanation: 'Pergerakan harga dalam ICT mengarah ke salah satu dari dua tujuan: Liquidity Pool eksternal (ERL) yang masih Fresh atau area Imbalance internal (IRL).'
        },
        {
          question: 'Struktur H1 Gold sedang Bullish, `PDH 2.672` masih Fresh, dan saat pembukaan London harga turun menyapu **Asia Low `2.646`** dengan *wick* lalu ditutup kembali di atasnya. Ke manakah **DOL 1 dan DOL 2** yang paling rasional?',
          options: [
            'Menuju bawah ke `2.600` karena tadi sempat muncul wick turun',
            'DOL 1 ke `Asia High` (Liquidity Pool Fresh terdekat di sisi atas) dan DOL 2 ke `PDH 2.672`',
            'Tidak ada target sama sekali karena Asia Low sudah hilang',
            'Menuju PWL 3 bulan lalu dalam 15 menit'
          ],
          answerIndex: 1,
          explanation: 'Setelah Origin sweep bawah (Asia Low) terbentuk selaras tren H1 Bullish, target DOL berpindah ke Liquidity Pool Fresh di atas: Asia High (DOL 1) lalu PDH (DOL 2).'
        },
        {
          question: 'Pukul `13:30 WITA` (`12:30 WIB`), harga Gold berada tepat di tengah antara PDH dan PDL, serta belum menyapu Asia High maupun Asia Low. Apa aturan paling disiplin untuk menentukan DOL?',
          options: [
            'Langsung buka BUY dan SELL bersamaan supaya pasti kena salah satu',
            'Menerapkan aturan **Wait for First Sweep** — tidak menebak arah sampai pasar menyapu salah satu ujung kotak lebih dulu untuk membentuk Origin yang jelas',
            'Menebak turun karena merasa harga sudah mahal',
            'Memperbesar lot 3 kali lipat di tengah kotak'
          ],
          answerIndex: 1,
          explanation: 'Di tengah range tanpa Origin, arah DOL belum terkonfirmasi. Menunggu sweep pertama memberi fakta objektif ke sisi mana target berpindah.'
        },
        {
          question: 'Kapan skenario DOL ke atas pasca sweep Asia Low `2.643,50` dinyatakan **resmi BATAL**?',
          options: [
            'Saat muncul 1 candle merah kecil di M1',
            'Saat candle timeframe kerja (`M15`/`H1`) berbalik dan **body close** menembus ke bawah titik ekstrem sweep `2.643,50`',
            'Saat harga baru naik $2 menuju Asia High',
            'Saat spread berada di angka normal $0,25'
          ],
          answerIndex: 1,
          explanation: 'Jika titik ekstrem Origin ditembus oleh body close, penolakan awal dinyatakan gagal dan target DOL beralih ke Liquidity Pool bawah berikutnya.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
