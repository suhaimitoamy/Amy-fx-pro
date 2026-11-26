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
      tagline: 'Membaca struktur harga murni tanpa indikator, menyatukan H4/H1/M15/M5, membedakan BOS valid vs sweep palsu, Dealing Range, peta BSL/SSL, hingga Inducement.'
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
      subtitle: 'Belajar membaca kerangka gerak harga langsung dari candlestick tanpa satu pun indikator rumit — mulai dari definisi mekanis 3-candle Swing High/Low sampai membedakan titik kuat vs titik lemah.',
      readMinutes: 10,
      diagramId: 'market-structure-basic',
      diagramAfterSection: 1,
      summary: 'Cara membaca Swing High/Low secara objektif (aturan 3-candle fraktal), membedakan tren naik (HH–HL), tren turun (LH–LL), konsolidasi, serta Strong vs Weak High/Low di XAU/USD.',
      bookSections: [
        {
          number: '7.1',
          heading: 'Apa Itu Struktur Pasar, dan Bagaimana Cara Menentukan Swing Secara Objektif?',
          paragraphs: [
            'Selamat datang di **Bagian II**. Di Bagian I kamu sudah menguasai seluruh bahasa dasar trading Gold: pips, spread, rumus lot 1%, tombol MT5, anatomi candlestick, dan jam aktif sesi dunia. Sekarang kita masuk ke keterampilan pertama yang wajib dikuasai setiap trader sebelum memikirkan strategi entry apa pun: **membaca Struktur Pasar (Market Structure)**.',
            'Banyak pemula merasa chart Gold terlihat seperti garis acak yang naik turun sembarangan. Padahal jika kamu mundur sedikit, harga tidak pernah bergerak lurus ke atas atau lurus ke bawah. Harga selalu bergerak seperti **gelombang berayun** — naik membentuk puncak, mundur sedikit membentuk lembah, lalu naik lagi membentuk puncak berikutnya. puncak swing disebut **Swing High**, sedangkan lembah swing disebut **Swing Low**.',
            'Masalah terbesar pemula adalah menandai Swing High dan Swing Low secara *"kira-kira pakai perasaan"*. Hari ini candle kecil dianggap puncak, besok diabaikan. Dalam metodologi ICT (mengikuti definisi baku Larry Williams), kita memakai **Aturan Mekanis 3-Candle Fraktal** yang 100% objektif:'
          ],
          exampleBox: {
            title: 'Definisi Mekanis 3-Candle (Nol Tebak-Tebakan)',
            rows: [
              {
                label: 'Swing High Sah',
                detail: 'Terbentuk ketika **1 candle tengah memiliki titik tertinggi (High) lebih tinggi** daripada candle tepat di sebelah kirinya **dan** candle tepat di sebelah kanannya. Artinya, pembeli mencoba mendorong ke atas, lalu gagal dilanjutkan di candle ketiga.'
              },
              {
                label: 'Swing Low Sah',
                detail: 'Terbentuk ketika **1 candle tengah memiliki titik terendah (Low) lebih rendah** daripada candle tepat di sebelah kirinya **dan** candle tepat di sebelah kanannya. Artinya, penjual mencoba menekan ke bawah, lalu gagal dilanjutkan di candle ketiga.'
              },
              {
                label: 'Syarat Konfirmasi',
                detail: 'Sebuah Swing High atau Swing Low baru sah **setelah candle ke-3 selesai ditutup (close)**. Jangan pernah menganggap candle yang masih berkedip bergerak sebagai swing resmi.'
              }
            ]
          }
        },
        {
          number: '7.2',
          heading: 'Tiga Kondisi Pasar: Tren Naik (Bullish), Tren Turun (Bearish) & Konsolidasi',
          paragraphs: [
            'Begitu kamu menghubungkan titik-titik Swing High dan Swing Low dari kiri ke kanan, kamu akan langsung melihat **tangga pergerakan harga**. Di seluruh pasar keuangan dunia — termasuk XAU/USD — hanya ada tiga kondisi struktur yang mungkin terjadi:',
            'Pertama, **Tren Naik (Bullish Structure)**. Bayangkan seseorang sedang menaiki tangga ke lantai atas: setiap langkah kakinya selalu lebih tinggi daripada pijakan sebelumnya. Di chart, harga mencetak puncak lebih tinggi (**Higher High / HH**) dan saat mundur (koreksi), lembahnya tetap lebih tinggi daripada lembah sebelumnya (**Higher Low / HL**).',
            'Kedua, **Tren Turun (Bearish Structure)**. Kebalikannya, harga menuruni tangga: setiap pantulan ke atas selalu berhenti lebih rendah daripada puncak sebelumnya (**Lower High / LH**), lalu jatuh menembus dasar lama untuk mencetak lembah baru yang lebih rendah (**Lower Low / LL**).',
            'Ketiga, **Konsolidasi (Sideways / Range)**. Harga hanya bolak-balik di dalam satu kotak yang sama — puncak barunya sejajar dengan puncak lama, lembahnya pun sejajar dengan lembah lama. Di pasar Gold, kondisi ini paling sering terjadi saat **Sesi Asia (08:00–12:00 WITA saat EDT)** sebelum volume London masuk.'
          ],
          table: {
            caption: 'Panduan Cepat Membaca 3 Kondisi Struktur XAU/USD',
            headers: ['Kondisi Pasar', 'Pola Swing', 'Makna Psikologis', 'Sikap Trader Disiplin'],
            rows: [
              ['Tren Naik (Bullish)', 'HH → HL → HH → HL', 'Pembeli menguasai arus; koreksi hanya istirahat sementara', 'Fokus cari peluang BUY saat harga mundur ke area murah'],
              ['Tren Turun (Bearish)', 'LH → LL → LH → LL', 'Penjual menguasai arus; pantulan naik hanya koreksi sementara', 'Fokus cari peluang SELL saat harga memantul ke area mahal'],
              ['Konsolidasi (Sideways)', 'High & Low sejajar', 'Pasar sedang mengumpulkan order (akumulasi) tanpa arah jelas', 'Tunggu keluar dari kotak atau tunggu manipulasi batas luar']
            ]
          }
        },
        {
          number: '7.3',
          heading: 'Membedakan Strong High/Low (Dilindungi) vs Weak High/Low (Target)',
          paragraphs: [
            'Di sinilah banyak buku trading dasar berhenti terlalu cepat, padahal pemahaman berikut adalah kunci agar kamu tidak salah memasang Stop Loss maupun Take Profit di pasar Gold.',
            'Dalam sebuah tren naik (`HH → HL → HH`), tidak semua titik memiliki kekuatan yang sama. Titik **Higher Low (HL)** yang berhasil meluncurkan harga sampai menembus puncak lama disebut **Strong Low (Lembah Kuat)**. Mengapa kuat? Karena di sanalah uang besar masuk mempertahankan tren. Selama struktur masih bullish, titik Strong Low ini **tidak boleh ditembus ke bawah**.',
            'Sebaliknya, titik **Higher High (HH)** saat harga mulai mundur disebut **Weak High (Puncak Lemah)**. Disebut lemah bukan karena harganya rendah, melainkan karena puncak itu **ditakdirkan untuk ditembus lagi** oleh gelombang naik berikutnya. Kebalikannya berlaku penuh di tren turun: **Lower High (LH)** yang berhasil menjatuhkan harga menembus dasar lama adalah **Strong High**, sedangkan **Lower Low (LL)** di bawahnya adalah **Weak Low** yang siap ditembus lagi.'
          ],
          exampleBox: {
            title: 'Contoh Nyata di Chart M15 XAU/USD (Tren Naik)',
            rows: [
              {
                label: 'Gelombang 1',
                detail: 'Gold naik dari `2.640,00` (Swing Low awal) menuju `2.655,00` (Swing High pertama), lalu mundur sehat ke `2.646,00`.'
              },
              {
                label: 'Gelombang 2 (Lahirnya Strong Low)',
                detail: 'Dari `2.646,00`, pembeli mendorong kuat hingga candle ditutup di `2.662,00` (menembus `2.655,00`). Kini **`2.646,00` resmi naik pangkat menjadi Strong Low**, sedangkan **`2.662,00` adalah Weak High**.'
              },
              {
                label: 'Cara Memakainya',
                detail: 'Selama Gold tetap bertahan di atas `2.646,00`, struktur masih sah **Bullish**. Fokus utamamu adalah mencari peluang BUY saat koreksi, dengan target menembus Weak High `2.662,00` dan batas batal struktur di bawah `2.646,00`.'
              }
            ]
          }
        },
        {
          number: '7.4',
          heading: 'Menghindari Jebakan "Over-Labeling" pada Noise Kecil',
          paragraphs: [
            'Saat pertama kali berlatih menandai struktur di chart kosong, pemula sering jatuh ke satu kesalahan klasik: **setiap muncul 1 candle merah kecil di tengah dorongan naik, mereka langsung melabelinya sebagai tren berbalik turun.** Akibatnya chart penuh coretan `HH/HL/LH/LL` tiap 2 menit dan kepala langsung pusing.',
            'Solusinya sederhana: pisahkan antara **swing struktural utama** (gelombang yang benar-benar menciptakan break High/Low sebelumnya) dengan **jeda napas minor** di tengah jalan. Di **Bab 08** nanti kita akan melihat mengapa noise kecil di M5 sama sekali tidak mengubah arah besar di H1, dan di **Bab 10** kamu akan belajar membingkai satu gelombang utama dalam kotak *Dealing Range* agar matamu selalu tenang.'
          ],
          callout: {
            tone: 'info',
            title: 'Latihan 5 Menit Sebelum Lanjut Bab 08',
            body: 'Buka chart XAU/USD timeframe M15 atau H1 tanpa indikator apa pun. Mundurkan zoom sedikit, lalu tandai 5 puncak (Swing High) dan 5 lembah (Swing Low) paling jelas yang memenuhi aturan 3-candle. Tanyakan pada dirimu sendiri: "Tangga ini sedang naik, sedang turun, atau sedang mendatar?"'
          }
        }
      ],
      keyTakeaways: [
        '**Swing High** sah = 1 candle puncak dengan `High` lebih tinggi dari candle kiri & kanan; **Swing Low** sah = 1 candle lembah dengan `Low` lebih rendah dari kiri & kanan (tunggu candle ke-3 close).',
        'Hanya ada 3 kondisi struktur: **Bullish (`HH–HL`)**, **Bearish (`LH–LL`)**, dan **Konsolidasi** (bolak-balik dalam kotak).',
        '**Strong Low** (di tren naik) adalah titik asal dorongan yang sukses menembus puncak lama — titik inilah batas sehat tren, sedangkan **Weak High** adalah target berikutnya.',
        'Jangan melabeli setiap 1 candle jeda kecil sebagai perubahan tren; fokus pada swing yang membentuk tangga utama.'
      ],
      bridgeNext: 'Sekarang matamu sudah bisa membaca tangga `HH–HL` dan `LH–LL` pada satu layar chart. Namun, begitu kamu mengganti tombol timeframe di MT5 dari `H1` ke `M5`, kamu mungkin langsung kaget: *"Lho, kok di H1 terlihat tren naik, tapi pas aku buka M5 malah kelihatan jatuh bebas?!"* Di sinilah ratusan pemula kebingungan dan akhirnya entry melawan arus besar. Mari kita pecahkan teka-teki itu tuntas di **Bab 08: Multi-Timeframe (Top-Down): Menyatukan H4/H1, M15, dan M5 Tanpa Bingung**.',
      conceptBlocks: [
        {
          heading: 'Aturan 3-Candle Swing, HH/HL vs LH/LL & Strong/Weak Point',
          paragraphs: [
            'Swing High sah memiliki High lebih tinggi daripada candle kiri dan kanannya; Swing Low sah memiliki Low lebih rendah daripada kiri dan kanannya.',
            'Tren Naik membentuk HH–HL (Strong Low dilindungi, Weak High ditargetkan); Tren Turun membentuk LH–LL (Strong High dilindungi, Weak Low ditargetkan); Konsolidasi bergerak mendatar dalam range.'
          ]
        }
      ],
      mappingSteps: [
        'Buka chart XAU/USD bersih tanpa indikator, mundurkan zoom agar gelombang utama terlihat jelas.',
        'Tandai Swing High dan Swing Low yang memenuhi aturan 3-candle fraktal.',
        'Tentukan tangga aktif (HH–HL Bullish, LH–LL Bearish, atau Sideways) lalu tandai Strong Point terakhir sebagai batas sehat tren.'
      ],
      decisionTree: [
        {
          condition: 'Harga mencetak HH baru lalu mundur, tetapi masih bertahan di atas Strong Low (HL) sebelumnya.',
          action: 'Struktur masih sah Bullish; perlakukan penurunan sebagai koreksi (pullback), bukan perubahan tren.'
        },
        {
          condition: 'Harga bergerak bolak-balik di antara batas atas dan batas bawah yang sejajar tanpa mencetak HH maupun LL baru.',
          action: 'Klasifikasikan sebagai Konsolidasi (Sideways) dan hindari mengejar breakout di tengah kotak.'
        }
      ],
      failedCase: {
        context: 'Trader langsung panik membuka SELL hanya karena muncul 2 candle merah kecil di tengah tren naik M15 yang masih jauh di atas Strong Low.',
        whyFailed: 'Menganggap jeda napas minor sebagai perubahan tren membuat trader melawan arus pembeli utama dan mudah kena sweep SL.'
      },
      validRules: [
        'Tunggu candle ke-3 selesai ditutup untuk mengonfirmasi Swing High/Low 3-candle.',
        'Identifikasi Strong Low (tren naik) atau Strong High (tren turun) sebagai batas kesehatan struktur.'
      ],
      invalidRules: [
        'Melabeli candle yang masih berjalan (belum close) sebagai swing resmi.',
        'Menganggap setiap 1–2 candle koreksi sebagai tanda reversal tren penuh.'
      ],
      xauScenario: {
        context: 'Chart M15 XAU/USD naik dari 2.640 → 2.655 → koreksi 2.646 → tembus tutup di 2.662.',
        steps: [
          'Titik 2.646 kini menjadi Strong Low karena berhasil meluncurkan harga menembus puncak 2.655.',
          'Titik 2.662 menjadi Weak High yang berpotensi ditargetkan ulang setelah koreksi sehat.'
        ]
      },
      goldenRules: [
        'Struktur pasar adalah kompas paling jujur sebelum menambahkan satu pun konsep ICT lain.'
      ],
      practiceCta: {
        label: 'Latih Baca Struktur di Simulator 100 Kasus',
        description: 'Uji ketajaman matamu membedakan tren naik, tren turun, dan konsolidasi pada chart latihan XAU/USD.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Menurut aturan mekanis 3-candle fraktal, kapan sebuah **Swing High** dinyatakan sah terbentuk?',
          options: [
            'Saat satu candle hijau terlihat sangat panjang meskipun belum selesai ditutup',
            'Saat 1 candle tengah memiliki High lebih tinggi daripada candle tepat di kiri dan kanannya, dan candle ke-3 sudah selesai close',
            'Saat harga berada di atas garis Moving Average 200',
            'Setiap kali muncul satu candle merah kecil di M1'
          ],
          answerIndex: 1,
          explanation: 'Aturan 3-candle fraktal memastikan identifikasi Swing High 100% objektif: High candle tengah tertinggi di antara kiri & kanannya, terkonfirmasi setelah candle ke-3 close.'
        },
        {
          question: 'Pada struktur tren naik Gold (`2.640 → 2.655 → mundur 2.646 → tembus 2.662`), titik harga `2.646` disebut sebagai apa?',
          options: [
            'Weak Low yang pasti segera dijebol ke bawah',
            'Strong Low — titik lembah kuat yang melahirkan break High baru dan menjadi batas sehat tren naik',
            'Konsolidasi akhir pekan',
            'Area spread rollover'
          ],
          answerIndex: 1,
          explanation: 'Karena dorongan dari 2.646 berhasil menembus puncak lama 2.655, maka 2.646 berstatus Strong Low yang melindungi tren naik.'
        },
        {
          question: 'Dalam tren naik yang sehat (`HH–HL`), mengapa puncak terbaru (`HH`) disebut **Weak High**?',
          options: [
            'Karena harganya pasti langsung jatuh bebas ke nol',
            'Karena dalam arus tren naik, puncak tersebut cenderung kembali ditembus oleh gelombang naik berikutnya setelah koreksi selesai',
            'Karena candle puncaknya selalu berwarna merah',
            'Karena tidak boleh dijadikan target Take Profit'
          ],
          answerIndex: 1,
          explanation: 'Istilah Weak High berarti titik tersebut tidak kuat menahan arus tren utama dan secara probabilitas tinggi ditargetkan untuk ditembus kembali.'
        },
        {
          question: 'Ketika harga XAU/USD terus bergerak bolak-balik di antara `2.646` dan `2.654` tanpa mencetak puncak lebih tinggi maupun lembah lebih rendah, kondisi apa yang sedang terjadi?',
          options: [
            'Tren Naik (Bullish HH–HL)',
            'Tren Turun (Bearish LH–LL)',
            'Konsolidasi (Sideways / Range) — pasar sedang mengumpulkan order tanpa arah tren jelas',
            'Sinyal wajib membuka 5 posisi sekaligus di tengah kotak'
          ],
          answerIndex: 2,
          explanation: 'Puncak dan lembah yang sejajar dalam satu kotak menunjukkan pasar sedang konsolidasi/akumulasi; trader disiplin menunggu arah keluar atau sweep batas luar.'
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
      subtitle: 'Memahami sifat fraktal pasar agar kamu tidak pernah lagi terjebak membuka SELL di dasar koreksi tren naik besar, lengkap dengan pembagian tugas 3 layar Top-Down.',
      readMinutes: 10,
      diagramId: 'mtf-alignment',
      diagramAfterSection: 2,
      summary: 'Cara membaca struktur secara Top-Down (H4/H1 sebagai peta, M15 sebagai struktur kerja, M5 sebagai konfirmasi presisi) dan matriks keputusan saat timeframe besar dan kecil berbeda arah.',
      bookSections: [
        {
          number: '8.1',
          heading: 'Analogi Google Maps: Kenapa Melihat 1 Timeframe Saja Berbahaya?',
          paragraphs: [
            'Di Bab 05 kamu sudah mengetahui bahwa 1 candle `H1` berisi 4 candle `M15` dan 12 candle `M5`. Sekarang kita masuk ke cara memakainya untuk mengambil keputusan struktur tanpa bingung.',
            'Bayangkan kamu sedang menyetir mobil menuju kota sebelah menggunakan Google Maps. Jika layarmu di-zoom maksimal hingga hanya terlihat 50 meter jalan di depan bemper (ibarat hanya melihat chart `M5` atau `M1`), kamu memang melihat belokan kecil dengan sangat detail — tetapi kamu **sama sekali tidak tahu** bahwa 200 meter di depan ada jalan buntu atau jembatan putus!',
            'Sebaliknya, jika kamu hanya melihat peta satu pulau (ibarat hanya melihat chart `Daily` atau `H4`), kamu tahu tujuan besarmu ke arah utara, tetapi kamu tidak tahu persis di gang mana harus belok sekarang. Trader profesional menggabungkan keduanya melalui metode **Top-Down Analysis**: selalu membaca dari **timeframe besar dulu, baru turun ke timeframe kecil**.'
          ]
        },
        {
          number: '8.2',
          heading: 'Hukum Fraktal Pasar: Koreksi di H1 Terlihat Seperti "Crash" di M5',
          paragraphs: [
            'Inilah rahasia yang seketika menghilangkan 80% kebingungan pemula saat berpindah timeframe. Pasar bersifat **fraktal**: di dalam satu tarikan napas koreksi pada timeframe besar, terdapat satu tren mini lengkap di timeframe kecil!',
            'Mari kita lihat contoh nyata pergerakan Gold (XAU/USD) supaya langsung terbayang di kepalamu:'
          ],
          exampleBox: {
            title: 'Satu Harga yang Sama, Dua Cerita Berbeda di H1 vs M5',
            rows: [
              {
                label: 'Di Layar H1 (Cerita Besar)',
                detail: 'Gold baru saja melesat naik dari `2.640,00` ke `2.680,00` (naik `$40`). Sekarang harga sedang turun koreksi sehat selama 2 jam menuju `2.658,00` — masih jauh di atas Strong Low `2.640,00`. Jadi H1 **100% masih Bullish**.'
              },
              {
                label: 'Di Layar M5 (Kaca Pembesar)',
                detail: 'Penurunan koreksi `$22` (`2.680 → 2.658`) selama 2 jam itu berisi **24 candle M5** yang membentuk tangga `LH → LL → LH → LL` sangat rapi! Pemula yang hanya membuka M5 akan berteriak *"Wah tren turun kuat, ayo SELL!"* — padahal ia baru saja menekan tombol SELL tepat di dasar koreksi H1.'
              },
              {
                label: 'Yang Terjadi Selanjutnya',
                detail: 'Begitu Gold menyentuh area permintaan H1 di `2.658,00`, pembeli institusi masuk kembali. Dalam 15 menit harga meledak naik ke `2.685,00` — sweep habis semua trader M5 yang nekat SELL melawan H1!'
              }
            ]
          },
          paragraphsAfter: [
            'Dari contoh di atas, ingat satu kalimat emas ini: **ketika timeframe kecil (`M5`) bergerak berlawanan dengan timeframe besar (`H1/M15`), anggap dulu gerak `M5` itu sekadar koreksi (pullback) — BUKAN sinyal untuk melawan arus utama.** Tugas kita adalah menunggu sampai `M5` selesai turun dan **kembali berbalik searah** dengan `H1/M15`!'
          ]
        },
        {
          number: '8.3',
          heading: 'Protokol 3-Layar Top-Down untuk Scalper & Intraday Gold',
          paragraphs: [
            'Kamu tidak perlu membuka 8 timeframe sekaligus dari `Monthly` sampai `M1` — terlalu banyak layar justru membuatmu lumpuh analisis (*analysis paralysis*). Untuk trading harian dan scalping XAU/USD (persis seperti alur pada Cockpit Mapping Amy FX Pro), cukup bagi tugas secara tegas pada **3 lapisan timeframe**:'
          ],
          table: {
            caption: 'Pembagian Tugas Tegas 3 Timeframe Top-Down XAU/USD',
            headers: ['Lapisan', 'Timeframe', 'Tugas Tunggalnya', 'Yang DILARANG Dilakukan Di Sini'],
            rows: [
              ['1. Peta Besar (HTF)', 'H4 / H1', 'Menentukan arah arus utama (Bullish/Bearish) & target magnet besar (PDH/PDL, Swing besar)', 'Jangan mencari titik entry presisi di H4 karena jarak SL terlalu lebar ($15–$30)'],
              ['2. Struktur Kerja (MTF)', 'M15', 'Membaca struktur aktif hari ini, membingkai kotak kerja, & menandai area zona tunggu (POI)', 'Jangan langsung klik masuk saat M15 belum selaras atau masih di tengah jalan'],
              ['3. Kaca Pembesar (LTF)', 'M5', 'Melihat reaksi harga saat tiba di zona M15/H1 & menunggu sinyal balik arah searah arus besar', 'Jangan melawan arah M15/H1 hanya karena melihat 3 candle M5 bergerak cepat']
            ]
          }
        },
        {
          number: '8.4',
          heading: 'Matriks Sinkronisasi: Kapan Boleh Entry Penuh vs Kapan Wajib WAIT?',
          paragraphs: [
            'Sebelum membuka satu pun posisi di Gold, cocokkan dulu ketiga layar tersebut dengan matriks sinkronisasi berikut. Tidak ada ruang untuk tebak-tebakan:'
          ],
          exampleBox: {
            title: '3 Skenario Hubungan H1 · M15 · M5',
            rows: [
              {
                label: 'Skenario 1: H1 Bullish + M15 Bullish + M5 Bullish (Selaras 3/3)',
                detail: '**Kualitas Tertinggi (A+).** Arus besar, struktur kerja, dan momentum kecil mendorong ke arah yang sama. Boleh eksekusi penuh dengan risiko standar (0,5%–1%).'
              },
              {
                label: 'Skenario 2: H1 Bullish + M15 Bullish + M5 Bearish (Fase Koreksi)',
                detail: '**Status: SIAGA / TUNGGU.** Jangan nekat SELL di M5! M5 yang sedang turun justru kabar baik — ia sedang mengantar harga ke area Discount. Tunggu M5 tiba di zona M15 lalu berbalik menjadi Bullish, barulah BUY.'
              },
              {
                label: 'Skenario 3: H1 Bullish + M15 Bearish (Konflik Arah Utama)',
                detail: '**Status: HATI-HATI / WAIT.** H1 sedang melakukan koreksi dalam (deep pullback) atau mulai melemah. Pemula wajib menunggu sampai M15 kembali selaras dengan H1, atau hanya ambil porsi sangat kecil jika sudah mahir nanti.'
              }
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Mengapa Counter-Trend M5 Sering Kena SL di Gold?',
            body: 'Saat kamu membuka SELL di M5 melawan arus Bullish M15/H1, kamu sedang mencoba menahan kereta cepat dengan tangan kosong. Mungkin sesekali profit $3, tetapi begitu pesanan institusi H1 masuk, satu candle M5 Gold bisa meloncat +$8 sampai +$15 dalam 2 menit dan menghantam Stop Loss-mu tanpa ampun.'
          }
        }
      ],
      keyTakeaways: [
        'Selalu baca chart secara **Top-Down**: mulai dari **H4/H1** (peta arah) → **M15** (struktur & zona kerja) → **M5** (konfirmasi eksekusi).',
        'Pasar bersifat **fraktal**: koreksi wajar di `H1` akan tampak seperti tren penuh di `M5` — jangan tertipu membuka posisi melawan arus besar.',
        'Sinyal terkuat muncul saat **M5 selesai koreksi dan berbalik searah kembali** dengan `H1` dan `M15` (sinkronisasi 3/3).',
        'Saat `H1` dan `M15` masih bertabrakan arah, sikap paling profesional dan menguntungkan adalah **WAIT** (menjaga modal).'
      ],
      bridgeNext: 'Sekarang kamu tahu cara menyatukan `H1`, `M15`, dan `M5` agar tidak pernah salah arah lagi. Tetapi ada satu jebakan besar berikutnya yang terjadi di SEMUA timeframe: kamu melihat harga baru saja melewati garis Swing High, kamu yakin itu adalah break tren naik, lalu sedetik setelah klik BUY harga malah anjlok tajam! Mengapa bisa begitu? Mari kita bedah perbedaan paling krusial di seluruh ilmu ICT pada **Bab 09: Break of Structure (BOS) Valid vs Liquidity Sweep (Breakout Palsu)**.',
      conceptBlocks: [
        {
          heading: 'Alur Top-Down H4/H1 → M15 → M5 & Sifat Fraktal Pasar',
          paragraphs: [
            'H4/H1 menentukan arah arus utama dan magnet besar, M15 membingkai struktur kerja dan zona tunggu, sedangkan M5 bertugas mencari konfirmasi saat harga tiba di zona M15.',
            'Koreksi pada H1 selalu terlihat seperti tren penuh pada M5; trader disiplin menunggu M5 berbalik kembali searah H1/M15 daripada melawan arus utama.'
          ]
        }
      ],
      mappingSteps: [
        'Buka H4/H1 terlebih dahulu untuk menentukan apakah arus besar sedang Bullish, Bearish, atau Range.',
        'Turun ke M15 untuk melihat struktur kerja aktif dan menandai area tunggu searah H1.',
        'Turun ke M5 hanya saat harga sudah menyentuh area M15 untuk menunggu konfirmasi searah H1/M15.'
      ],
      decisionTree: [
        {
          condition: 'H1 Bullish dan M15 Bullish, tetapi M5 sedang turun membentuk LH–LL menuju area M15.',
          action: 'Tahan diri — jangan SELL counter-trend di M5. Tunggu M5 selesai turun dan berbalik bullish di area M15 untuk mencari BUY.'
        },
        {
          condition: 'H1 dan M15 saling berlawanan arah tanpa struktur jelas.',
          action: 'Pilih WAIT hingga M15 kembali selaras dengan arah H1 atau H1 resmi berpindah struktur.'
        }
      ],
      failedCase: {
        context: 'Trader hanya memantau layar M5, melihat penurunan $18 selama 1,5 jam, lalu agresif membuka SELL tepat saat harga menyentuh zona beli H1.',
        whyFailed: 'Lupa mengecek H1 bahwa penurunan M5 itu hanyalah koreksi sehat di dalam tren naik H1; begitu pembeli H1 masuk, posisi SELL langsung kena sweep.'
      },
      validRules: [
        'Selalu baca chart dari timeframe besar ke kecil (Top-Down) sebelum mengambil keputusan.',
        'Prioritaskan setup ketika H1, M15, dan M5 kembali selaras ke satu arah.'
      ],
      invalidRules: [
        'Mengambil keputusan arah besar hanya dengan melihat chart M5 atau M1.',
        'Melawan arus M15/H1 di M5 saat koreksi sudah hampir mencapai zona permintaan HTF.'
      ],
      xauScenario: {
        context: 'H1 Gold naik 2.640 → 2.680 lalu koreksi ke 2.658; di M5 koreksi terlihat seperti tren turun.',
        steps: [
          'Kunci bias di H1 (tetap Bullish selama di atas 2.640).',
          'Pantau M5 saat mencapai 2.658: tunggu M5 berhenti mencetak LL dan berbalik naik sebelum masuk BUY.'
        ]
      },
      goldenRules: [
        'Timeframe besar adalah bosnya arah; timeframe kecil adalah alat presisi untuk masuk searah bos.'
      ],
      practiceCta: {
        label: 'Bandingkan H1, M15 & M5 di Cockpit Mapping',
        description: 'Lihat langsung bagaimana panel 3-TF (H1, M15, M5) menyelaraskan arah Gold secara real-time.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Mengapa penurunan koreksi `$22` di chart `H1` yang masih Bullish sering membuat trader pemula terjebak membuka SELL?',
          options: [
            'Karena broker sengaja mematikan chart H1',
            'Karena sifat fraktal pasar: koreksi 2 jam di H1 tampil sebagai tren turun rapi (`LH–LL`) sepanjang 24 candle di layar M5',
            'Karena M5 selalu lebih kuat daripada H1',
            'Karena Gold tidak pernah mengalami koreksi'
          ],
          answerIndex: 1,
          explanation: 'Satu tarikan koreksi di HTF (H1) selalu tersusun dari tren mini di LTF (M5). Tanpa mengecek H1, trader M5 mudah terjebak menjual tepat di dasar koreksi.'
        },
        {
          question: 'Dalam protokol 3-layar Top-Down (`H4/H1 → M15 → M5`), apa tugas utama timeframe **M5**?',
          options: [
            'Menentukan arah tren mingguan dan bulanan',
            'Menjadi kaca pembesar untuk menunggu konfirmasi balik arah saat harga sudah tiba di area kerja M15/H1',
            'Menggantikan seluruh analisis H1 dan M15',
            'Menghitung jadwal libur akhir pekan'
          ],
          answerIndex: 1,
          explanation: 'H4/H1 menetapkan arah peta besar, M15 membingkai struktur & area tunggu, dan M5 dipakai sebagai konfirmasi presisi ketika harga sudah sampai di area tersebut.'
        },
        {
          question: 'Kondisi layar menunjukkan: **H1 Bullish**, **M15 Bullish**, namun **M5 sedang turun (Bearish)** mendekati zona tunggu M15. Apa tindakan terbaikmu?',
          options: [
            'Segera buka SELL besar di M5 karena candle merah sedang kencang',
            'SIAGA / TUNGGU: biarkan M5 menyelesaikan koreksinya ke area M15, lalu cari peluang BUY begitu M5 berbalik naik searah H1/M15',
            'Tutup aplikasi dan hapus akun trading',
            'Buka BUY dan SELL bersamaan pada harga yang sama'
          ],
          answerIndex: 1,
          explanation: 'M5 yang sedang turun di dalam arus H1/M15 Bullish adalah fase koreksi sehat. Tunggu koreksi selesai dan M5 kembali selaras Bullish untuk setup probabilitas tinggi.'
        },
        {
          question: 'Manakah kondisi sinkronisasi Multi-Timeframe yang memberikan probabilitas kualitas tertinggi (A+)?',
          options: [
            'H1 Bullish, M15 Bearish, M5 Sideways',
            'H1, M15, dan M5 ketiganya selaras ke satu arah yang sama',
            'Hanya melihat M1 tanpa peduli H1 maupun M15',
            'Saat H1 dan M15 saling bertabrakan tepat menjelang berita CPI'
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
      subtitle: 'Aturan paling tegas dalam ICT untuk membedakan break struktur yang asli (Body Close) dari jebakan Wick-Only Sweep yang sering membuat trader breakout kena Stop Loss.',
      readMinutes: 10,
      diagramId: 'bos-vs-sweep',
      diagramAfterSection: 1,
      summary: 'Perbedaan mutlak Break of Structure (body close penuh melewati swing) vs Liquidity Sweep (hanya wick menembus lalu close kembali di dalam), cara menangani kasus abu-abu, dan studi kasus XAU/USD.',
      bookSections: [
        {
          number: '9.1',
          heading: 'Kenapa Breakout "Rapi" di Gold Sering Berbalik Tepat Setelah Kamu Klik BUY?',
          paragraphs: [
            'Hampir semua trader ritel pernah mengalami kejadian menyakitkan ini: kamu melihat garis batas atas (Swing High / Resistance) di `2.660,00`. Tiba-tiba harga melonjak menembus `2.660,00` sampai `2.662,50`. Karena takut ketinggalan kereta, kamu langsung klik **BUY** di `2.662,00`. Eh, tiga menit kemudian candle itu malah kempes, menyisakan wick panjang di atas, lalu harga jatuh tajam ke `2.645,00`!',
            'Kenapa kejadian ini berulang terus setiap hari di XAU/USD? Jawabannya bukan karena "broker mengintip akunmu", melainkan **mekanika pesanan pasar**. Di atas puncak `2.660,00`, menumpuk dua jenis pesanan ritel: **Stop Loss** milik orang-orang yang sedang SELL, dan **Buy Stop** milik trader breakout yang ingin ikut beli.',
            'Ketika sebuah bank besar ingin menjual emas dalam jumlah raksasa, mereka membutuhkan ratusan ribu pembeli sebagai lawan transaksi. Cara tercepat mendapatkannya adalah mendorong harga sedikit melewati `2.660,00` untuk memicu semua order beli tersebut, mengisi order jual raksasa mereka, lalu membiarkan harga meluncur turun. Peristiwa "mencolek keluar lalu kembali masuk" inilah yang disebut **Liquidity Sweep** (Liquidity Sweep).'
          ]
        },
        {
          number: '9.2',
          heading: 'Aturan Emas ICT: Body Close (BOS Valid) vs Wick-Only (Liquidity Sweep)',
          paragraphs: [
            'Agar kamu tidak pernah lagi tertipu breakout palsu, ICT menetapkan satu garis pemisah yang **100% hitam-putih, mekanis, dan bisa diverifikasi dalam 1 detik**: lihat di mana **BODY candle ditutup (Close)**, bukan ke mana ujung sumbunya (*wick*) sempat berjalan!'
          ],
          table: {
            caption: 'Perbandingan Tegas: Break of Structure (BOS) vs Liquidity Sweep',
            headers: ['Aspek Penilaian', 'BOS Valid (Break Valid)', 'Liquidity Sweep (Breakout Palsu)'],
            rows: [
              ['Posisi Penutupan Candle (Close)', 'Body candle **ditutup penuh** melewati titik tertinggi/terendah swing lama', 'Hanya **wick** yang menembus; body candle **ditutup kembali di dalam** swing lama'],
              ['Makna di Balik Layar', 'Institusi menerima harga baru dan berniat **melanjutkan tren**', 'Institusi hanya mengambil "bahan bakar" Stop Loss dan berpotensi **berbalik arah**'],
              ['Kapan Dikonfirmasi?', 'Wajib menunggu candle selesai tutup (timer candle = `00:00`)', 'Wajib menunggu candle selesai tutup dan terlihat wick penolakan'],
              ['Respon Trader ICT', 'Ikuti arah tren baru; tunggu koreksi sehat untuk entry searah BOS', 'Dilarang mengejar breakout; justru bersiap mencari konfirmasi balik arah']
            ]
          }
        },
        {
          number: '9.3',
          heading: 'Cara Menangani 2 Kasus Abu-Abu yang Paling Sering Membuat Bingung',
          paragraphs: [
            'Di buku teori yang terlalu dangkal, contohnya selalu sempurna. Di chart Gold sungguhan, kamu pasti akan menemui dua situasi "abu-abu" berikut — ini cara membacanya dengan kepala dingin:',
            '**Kasus Abu-Abu 1: Candle ke-1 hanya sweep dengan wick, lalu candle ke-2 ternyata ditutup (body close) di atas level tersebut.** Bagaimana statusnya? Selama candle ke-2 berhasil **body close** melewati titik tertinggi candle ke-1 (atau tegas di atas swing lama), maka statusnya **berubah menjadi BOS Valid**. Sebaliknya, jika candle ke-2 malah berbalik turun menjauh, maka candle ke-1 terkonfirmasi murni sebagai **Liquidity Sweep**.',
            '**Kasus Abu-Abu 2: Body close melewati swing lama, tetapi cuma tipis `$0,15` (1,5 pips) dengan wick atas sangat panjang.** Pada Gold (`XAU/USD`), penutupan yang terlalu tipis (`< $0,30`) dengan wick penolakan raksasa di atasnya adalah tanda **tenaga break lemah** (*weak break*). Trader disiplin tidak terburu-buru menganggapnya BOS kuat — tunggu 1 candle berikutnya untuk memastikan harga benar-benar diterima di luar level tersebut.'
          ],
          callout: {
            tone: 'warn',
            title: 'Kesalahan Paling Mahal: Menganggap BOS Sebelum Candle Tutup!',
            body: 'Di timeframe M15, pada menit ke-10 sebuah candle bisa terlihat hijau penuh +$4 di atas Swing High. Namun pada 2 menit terakhir sebelum tutup, institusi menghantamnya turun sehingga saat menit ke-15 berakhir yang tersisa hanyalah wick panjang! **Aturan mutlak: tidak pernah ada BOS sebelum candle resmi ditutup.**'
          }
        },
        {
          number: '9.4',
          heading: 'Studi Kasus XAU/USD: Membandingkan Skenario BOS vs Sweep di Level yang Sama',
          paragraphs: [
            'Perhatikan bagaimana satu level Swing High yang sama (`2.660,00`) menghasilkan dua keputusan yang bertolak belakang total hanya dari cara penutupan candle M15:'
          ],
          exampleBox: {
            title: 'Dua Akhir Berbeda di Level Swing High 2.660,00 (M15 Gold)',
            rows: [
              {
                label: 'Skenario A — BOS Valid (Lanjut Naik)',
                detail: 'Candle M15 naik menembus `2.660,00` dengan dorongan tegas dan **ditutup (Close) di `2.663,80`** (body tebal di atas level). Artinya pembeli menerima harga baru. **Aksi:** Struktur Bullish lanjut; jangan kejar di puncak, tunggu koreksi sehat untuk BUY.'
              },
              {
                label: 'Skenario B — Liquidity Sweep (Jebakan)',
                detail: 'Candle M15 sempat melonjak ke High `2.662,90`, tetapi sebelum menit ke-15 habis tekanan jual menghantam hingga **ditutup (Close) di `2.658,40`** (di bawah `2.660,00`, menyisakan wick atas `$4,50`). **Aksi:** Dilarang keras BUY! Pasar baru saja sweep pembeli breakout; bersiap memantau tanda reversal turun.'
              }
            ]
          }
        }
      ],
      keyTakeaways: [
        '**BOS Valid** mensyaratkan **body candle ditutup penuh** melewati Swing High/Low sebelumnya — tanda kelanjutan arus.',
        '**Liquidity Sweep** terjadi saat hanya **wick** yang melewati swing, sementara body ditutup kembali di dalam — tanda pengambilan Liquidity & rawan balik arah.',
        '**Haram** menyatakan BOS atau Sweep sebelum candle selesai ditutup (`close`).',
        'Body close yang sangat tipis (`< $0,30` di Gold) disertai wick penolakan panjang patut dicurigai sebagai *weak break* — tunggu 1 candle penerimaan lagi.'
      ],
      bridgeNext: 'Kini kamu memiliki filter paling tajam untuk membedakan mana break asli (`BOS`) dan mana jebakan (`Sweep`). Pertanyaan lanjutan yang sangat wajar muncul sekarang adalah: *"Oke, begitu terjadi BOS Valid yang baru, area mana saja yang menjadi arena bermain harga selanjutnya? Dari titik mana sampai mana aku harus memantau koreksi?"* Jawabannya adalah konsep bingkai pasar yang sangat penting di **Bab 10: Dealing Range: Membaca Arena Eksternal (ERL) vs Internal (IRL)**.',
      conceptBlocks: [
        {
          heading: 'Body Close (BOS Valid) vs Wick-Only (Liquidity Sweep)',
          paragraphs: [
            'BOS Valid membutuhkan body candle ditutup penuh melewati Swing High atau Swing Low sebelumnya setelah candle selesai close.',
            'Liquidity Sweep hanya menembus level dengan wick lalu body ditutup kembali di dalam range, menandakan pengambilan Stop Loss ritel dan potensi reversal.'
          ]
        }
      ],
      mappingSteps: [
        'Tandai garis horizontal presisi pada titik Swing High atau Swing Low yang hendak diuji.',
        'Tunggu timer candle selesai (candle resmi close) sebelum memberi label apa pun.',
        'Periksa posisi Close: body di luar swing = BOS Valid; hanya wick di luar dan body kembali di dalam = Liquidity Sweep.'
      ],
      decisionTree: [
        {
          condition: 'Candle M15 menembus Swing High dengan wick panjang $3 lalu close kembali di bawah Swing High.',
          action: 'Tandai sebagai Liquidity Sweep (bukan BOS). Batalkan niat mengejar BUY breakout dan pantau konfirmasi reversal.'
        },
        {
          condition: 'Candle M15 menutup body penuh $3,50 di atas Swing High sebelumnya.',
          action: 'Tandai sebagai Bullish BOS Valid. Tandai Strong Low baru dan tunggu koreksi sehat searah tren.'
        }
      ],
      failedCase: {
        context: 'Trader langsung menekan tombol BUY pada menit ke-9 candle M15 karena melihat harga melewati Swing High 2.660.',
        whyFailed: 'Pada penutupan menit ke-15, candle kembali turun dan close di 2.658 (murni Liquidity Sweep); trader masuk tepat di puncak wick jebakan.'
      },
      validRules: [
        'Selalu tunggu candle selesai ditutup untuk membedakan BOS Valid dan Liquidity Sweep.',
        'Anggap BOS sah jika body close tegas di luar level swing lama.'
      ],
      invalidRules: [
        'Menyebut break wick-only sebagai Break of Structure.',
        'Mengejar breakout di tengah candle yang belum tutup.'
      ],
      xauScenario: {
        context: 'Swing High M15 Gold berada di 2.660,00.',
        steps: [
          'Jika candle close di 2.663,80 (body di atas 2.660) → BOS Valid Bullish.',
          'Jika candle sempat ke 2.662,90 lalu close di 2.658,40 → Liquidity Sweep, hindari BUY.'
        ]
      },
      goldenRules: [
        'Wick mengambil bahan bakar; body menceritakan ke mana pasar sebenarnya ingin pergi.'
      ],
      practiceCta: {
        label: 'Uji Mata: BOS Valid vs Sweep di Latihan Kasus',
        description: 'Latih ketepatan membedakan body close BOS dan wick sweep pada skenario chart Gold nyata.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Apa syarat mekanis paling utama agar sebuah break Swing High diakui sebagai **Break of Structure (BOS) Valid**?',
          options: [
            'Cukup ujung wick menyentuh $0,50 di atas Swing High',
            'Body candle harus selesai ditutup (Close) di atas Swing High sebelumnya',
            'Harga bergerak cepat di menit ke-3 meski belum close',
            'Indikator RSI melewati angka 70'
          ],
          answerIndex: 1,
          explanation: 'Dalam ICT, BOS hanya sah apabila body candle ditutup melewati titik swing lama setelah candle selesai close.'
        },
        {
          question: 'Swing High M15 XAU/USD berada di `2.660,00`. Candle M15 sempat melonjak ke `2.663,20`, namun saat menit ke-15 habis candle ditutup di `2.658,70`. Peristiwa apa ini?',
          options: [
            'Bullish BOS Valid yang sangat kuat',
            'Liquidity Sweep (Liquidity Sweep / breakout palsu) karena hanya wick yang melewati 2.660 sementara body close kembali di dalam',
            'Konsolidasi pasar tutup',
            'Tanda wajib langsung BUY tanpa Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Hanya wick yang menembus 2.660 sementara body tutup di 2.658,70 — ini adalah definisi baku Liquidity Sweep.'
        },
        {
          question: 'Mengapa kamu DILARANG menyatakan sebuah gerakan sebagai BOS pada menit ke-10 candle M15?',
          options: [
            'Karena MT5 melarang klik tombol di menit ke-10',
            'Karena sebelum candle resmi ditutup, dorongan harga masih bisa dibalikkan institusi menjadi wick Sweep di menit-menit terakhir',
            'Karena menit ke-10 selalu tidak ada spread',
            'Karena BOS hanya berlaku di hari Jumat'
          ],
          answerIndex: 1,
          explanation: 'Status BOS atau Sweep hanya bisa diketahui dari harga Close resmi; banyak candle bullish di menit ke-10 berubah menjadi wick sweep saat close.'
        },
        {
          question: 'Jika candle ke-1 hanya sweep Swing High dengan wick, lalu candle ke-2 justru dorong kuat dan **body close** tegas di atas puncak candle ke-1, bagaimana kita membacanya?',
          options: [
            'Tetap Sweep selamanya walaupun harga naik $30',
            'Pasar menerima harga di luar level — statusnya kini terkonfirmasi menjadi BOS Valid',
            'Chart sedang error dan harus di-restart',
            'Pasar langsung masuk mode sideways'
          ],
          answerIndex: 1,
          explanation: 'Jika candle berikutnya benar-benar menutup body secara tegas melampaui puncak sweep pertama, penerimaan harga terjadi dan struktur sah berlanjut (BOS).'
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
      subtitle: 'Cara membingkai satu "lapangan bermain" aktif di chart Gold sehingga kamu tahu persis ke mana pendulum pasar sedang berayun: dari batas luar (ERL) masuk ke dalam (IRL), lalu kembali ke luar.',
      readMinutes: 10,
      diagramId: 'dealing-range-ie',
      diagramAfterSection: 2,
      summary: 'Cara menarik Dealing Range aktif setelah BOS, membedakan External Range Liquidity (ERL) vs Internal Range Liquidity (IRL), hukum pendulum ERL ↔ IRL, dan kapan Dealing Range bergeser.',
      bookSections: [
        {
          number: '10.1',
          heading: 'Apa Itu Dealing Range? (Analogi Lapangan Bermain)',
          paragraphs: [
            'Setelah kamu memahami cara mengenali **BOS Valid** di Bab 09, mari kita rapikan seluruh isi chart-mu dengan satu konsep yang langsung membuat tampilan harga terasa teratur: **Dealing Range**.',
            'Bayangkan sebuah pertandingan sepak bola. Bola memang bergerak ke kiri, ke kanan, maju, dan mundur, tetapi seluruh permainan terjadi di dalam **satu lapangan bergaris jelas** dari gawang selatan ke gawang utara. Di pasar Gold, lapangan bermain tersebut disebut **Dealing Range**.',
            'Secara mekanis, Dealing Range aktif terbentuk tepat setelah sebuah gelombang dorongan berhasil mencetak **BOS Valid**. Titik paling bawah tempat dorongan itu bermula (**Strong Low**) menjadi **batas bawah lapangan**, dan titik tertinggi yang dicapai gelombang tersebut (**Weak High**) sebelum harga mulai mundur menjadi **batas atas lapangan**. (Untuk tren turun, batas atasnya adalah Strong High dan batas bawahnya adalah Weak Low.)'
          ]
        },
        {
          number: '10.2',
          heading: 'Membedakan External Range Liquidity (ERL) vs Internal Range Liquidity (IRL)',
          paragraphs: [
            'Begitu kotak Dealing Range tergambar di chart, seluruh isi pergerakan harga hanya terbagi menjadi **dua wilayah** yang sangat mudah dibedakan:'
          ],
          table: {
            caption: 'Dua Wilayah Utama di Dalam Setiap Dealing Range',
            headers: ['Istilah ICT', 'Lokasinya di Chart', 'Isi Wilayahnya', 'Fungsinya Bagi Algoritma'],
            rows: [
              ['ERL (External Range Liquidity)', 'Tepat di **batas paling luar** kotak Dealing Range (Swing High atas & Swing Low bawah)', 'Puncak utama (`Old High`) dan Lembah utama (`Old Low`) tempat kumpulan Stop Loss berada', 'Target ekspansi luar atau titik sweep besar sebelum harga berbalik masuk'],
              ['IRL (Internal Range Liquidity)', 'Di **bagian dalam** kotak Dealing Range (antara batas bawah dan batas atas)', 'celah Imbalance (*Fair Value Gap*), jejak pesanan (*Order Block*), dan swing koreksi kecil di dalam kotak', 'Tempat harga "mengisi ulang tenaga" (koreksi) sebelum kembali meluncur menuju batas luar (ERL)']
            ]
          },
          paragraphsAfter: [
            '*(Catatan: kamu tidak perlu pusing dulu dengan detail teknis Fair Value Gap atau Order Block — keduanya akan kita bedah satu per satu secara tuntas di Bagian IV nanti. Untuk saat ini, cukup pahami bahwa seluruh zona di dalam kotak Dealing Range disebut **IRL**, sedangkan batas ujung atas dan ujung bawah kotak disebut **ERL**.)*'
          ]
        },
        {
          number: '10.3',
          heading: 'Hukum Pendulum ICT: Harga Selalu Bergerak ERL → IRL → ERL',
          paragraphs: [
            'Inilah salah satu rahasia terbesar dalam seluruh pengajaran ICT — begitu kamu memahaminya, pergerakan Gold tidak akan lagi terasa seperti misteri acak. Algoritma harga bergerak layaknya **bandul jam (pendulum)** yang hanya melakukan dua perjalanan secara bergantian:',
            '1. **Setelah harga menyentuh atau menembus batas luar (`ERL`)**, bahan bakar luar baru saja diambil. Harga cenderung **masuk kembali ke dalam kotak menuju `IRL`** untuk menyeimbangkan Imbalance harga (fase koreksi/retrace).',
            '2. **Setelah harga selesai menyentuh area `IRL` di dalam kotak**, pesanan institusi terisi ulang. Harga cenderung **meluncur keluar kembali menuju batas luar (`ERL`)** di sisi seberangnya (fase ekspansi).',
            'Artinya, kamu bisa langsung tahu kapan sebuah pergerakan sedang **mendekati akhir** dan kapan sebuah pergerakan baru **akan dimulai**: kalau harga baru saja menembus `ERL` atas sejauh `$20`, itulah waktu TERBURUK untuk mengejar BUY, karena pendulum justru bersiap mengayun kembali ke dalam menuju `IRL`!'
          ]
        },
        {
          number: '10.4',
          heading: 'Contoh Kasus XAU/USD & Kapan Dealing Range Resmi Bergeser',
          paragraphs: [
            'Mari kita ikuti perjalanan nyata satu Dealing Range di chart M15 XAU/USD agar kamu melihat langsung bagaimana pendulum `ERL → IRL → ERL` bekerja — dan kapan kotak lama harus dihapus lalu diganti kotak baru:'
          ],
          exampleBox: {
            title: 'Siklus Lengkap Dealing Range M15 XAU/USD',
            rows: [
              {
                label: 'Langkah 1 — Kotak Lahir',
                detail: 'Gold melesat dari Strong Low `2.640,00` (batas bawah / **ERL Bawah**) dan menembus struktur hingga berhenti sementara di `2.664,00` (batas atas / **ERL Atas**). Terbentuklah Dealing Range selebar `$24` (`2.640 – 2.664`).'
              },
              {
                label: 'Langkah 2 — Pendulum ke Dalam (ERL → IRL)',
                detail: 'Karena baru saja mengambil ERL atas, harga mundur sehat masuk ke dalam kotak menuju area **IRL** di sekitar `2.649,00`. Trader sabar tidak mengejar di `2.664`, melainkan menunggu di dalam kotak.'
              },
              {
                label: 'Langkah 3 — Pendulum ke Luar (IRL → ERL)',
                detail: 'Dari `2.649,00` (IRL), pembeli masuk kembali mendorong Gold naik menembus dan **body close** di atas `2.664,00` (ERL Atas) hingga mencetak puncak baru `2.676,00`.'
              },
              {
                label: 'Langkah 4 — Kotak Resmi Bergeser!',
                detail: 'Begitu `2.664,00` ditembus dengan BOS Valid, **Dealing Range lama (`2.640–2.664`) resmi pensiun!** Lapangan kerja barumu sekarang adalah **`2.649,00` (Strong Low baru) hingga `2.676,00` (Weak High baru)**.'
              }
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Jebakan "Dealing Range Usang"',
            body: 'Banyak trader tetap menggambar kotak lama dari 3 hari lalu padahal harga Gold sudah melesat `$35` menembus batas atasnya. Ingat: setiap kali terjadi **BOS Valid** yang baru, Dealing Range WAJIB diperbarui mengikuti kaki dorongan terakhir agar kamu selalu membaca arena yang masih hidup hari ini.'
          }
        }
      ],
      keyTakeaways: [
        '**Dealing Range** adalah kotak lapangan bermain aktif dari **Strong Point** (asal dorongan) hingga **Weak Point** (ujung gelombang) setelah terjadi BOS Valid.',
        '**ERL** (External Range Liquidity) = batas luar atas & bawah kotak; **IRL** (Internal Range Liquidity) = area Imbalance & struktur di dalam kotak.',
        'Hukum pendulum ICT: harga selalu bergerak bolak-balik **`ERL → IRL → ERL`** — jangan mengejar harga yang baru saja menghantam ERL.',
        'Begitu terjadi **BOS Valid** baru yang menembus batas kotak, segera geser Dealing Range ke kaki dorongan terbaru agar petamu tidak usang.'
      ],
      bridgeNext: 'Kamu sekarang sudah bisa membingkai lapangan bermain (`Dealing Range`) dan tahu bahwa harga selalu mengayun antara batas dalam (`IRL`) dan batas luar (`ERL`). Nah, di luar kotak itu sebenarnya ada banyak sekali puncak dan lembah — tidak semuanya sama kuatnya! Level batas luar mana saja di pasar Gold yang menjadi "Liquidity Pool" terfavorit bank dan institusi? Mari kita petakan semuanya dengan presisi di **Bab 11: Peta Liquidity Gold: BSL/SSL, EQH/EQL, PDH/PDL, PWH/PWL & Asia Range**.',
      conceptBlocks: [
        {
          heading: 'Dealing Range Aktif & Siklus Pendulum ERL ↔ IRL',
          paragraphs: [
            'Dealing Range dibingkai dari titik asal dorongan (Strong Point) ke ujung gelombang (Weak Point) setelah BOS Valid terjadi.',
            'Algoritma harga bergerak seperti pendulum dari batas luar (ERL) masuk ke area internal (IRL), lalu kembali menargetkan batas luar (ERL) baru.'
          ]
        }
      ],
      mappingSteps: [
        'Identifikasi BOS Valid terakhir pada timeframe kerja (M15/H1).',
        'Tarik batas Dealing Range dari titik asal dorongan (Strong Point) hingga ujung gelombang sebelum koreksi (Weak Point).',
        'Amati posisi harga sekarang: jika baru menyentuh ERL, tunggu kembali ke IRL; jika baru bereaksi dari IRL, bidik ERL di seberangnya.'
      ],
      decisionTree: [
        {
          condition: 'Harga baru saja menghantam ERL atas setelah naik panjang $20 tanpa koreksi.',
          action: 'Tahan diri dari mengejar BUY di batas luar; tunggu pendulum berayun masuk menuju IRL di dalam kotak.'
        },
        {
          condition: 'Harga mencetak BOS Valid baru jauh melewati batas atas Dealing Range lama.',
          action: 'Hapus kotak lama dan perbarui Dealing Range mengikuti titik asal dorongan terbaru hingga puncak baru.'
        }
      ],
      failedCase: {
        context: 'Trader tetap memakai Dealing Range 2 hari lalu (2.610–2.630) padahal Gold sudah mencetak dua kali BOS baru hingga 2.668.',
        whyFailed: 'Dealing Range usang membuat trader terus menunggu harga kembali ke area 2.618 yang sudah tidak relevan, atau nekat melawan tren baru.'
      },
      validRules: [
        'Bingkai Dealing Range dari kaki dorongan yang menghasilkan BOS Valid terakhir.',
        'Gunakan siklus ERL → IRL → ERL untuk tahu fase koreksi vs fase ekspansi.'
      ],
      invalidRules: [
        'Mempertahankan kotak Dealing Range lama yang batasnya sudah ditembus BOS baru.',
        'Mengejar posisi searah tepat saat harga baru menyentuh batas luar ERL.'
      ],
      xauScenario: {
        context: 'Gold M15 membentuk Dealing Range 2.640 (ERL Bawah) sampai 2.664 (ERL Atas).',
        steps: [
          'Harga mundur dari ERL Atas 2.664 masuk ke IRL di 2.649.',
          'Dari IRL 2.649, harga memantul menembus ERL Atas 2.664 ke 2.676; Dealing Range baru resmi bergeser ke 2.649–2.676.'
        ]
      },
      goldenRules: [
        'Di pasar hanya ada dua perjalanan: dari batas luar (ERL) ke dalam (IRL), atau dari dalam (IRL) kembali ke batas luar (ERL).'
      ],
      practiceCta: {
        label: 'Lihat Dealing Range Live di Cockpit Mapping',
        description: 'Amati bagaimana Dealing Range aktif dan persentase posisi harga live ditampilkan di Chart Gold.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Bagaimana cara mekanis menentukan batas bawah dan batas atas sebuah **Dealing Range Bullish** yang aktif?',
          options: [
            'Mengambil harga pembukaan bulan lalu dan harga penutupan tahun lalu',
            'Dari Strong Low (titik asal dorongan yang menghasilkan BOS Valid) hingga Weak High (puncak gelombang sebelum harga mulai koreksi)',
            'Dari 2 candle M1 acak yang sedang berjalan',
            'Dari garis indikator Bollinger Bands'
          ],
          answerIndex: 1,
          explanation: 'Dealing Range aktif selalu membingkai kaki dorongan sah terakhir: dari Strong Point asal BOS hingga Weak Point ujung gelombang.'
        },
        {
          question: 'Dalam hukum pendulum ICT, jika harga XAU/USD baru saja bereaksi kuat dari area **IRL** (di dalam kotak Dealing Range Bullish), ke mana tujuan paling logis selanjutnya?',
          options: [
            'Berhenti bergerak selama seminggu',
            'Menuju batas luar atas (**ERL Atas** / Weak High) di seberang kotak',
            'Langsung menembus ke bawah nol',
            'Kembali ke harga pembukaan tahun lalu'
          ],
          answerIndex: 1,
          explanation: 'Setelah mengisi tenaga di IRL (dalam kotak), pendulum harga mengayun kembali menuju batas luar ERL di seberangnya.'
        },
        {
          question: 'Mengapa mengejar BUY tepat ketika harga baru saja menembus **ERL Atas** setelah lari panjang `$20` adalah kebiasaan berisiko tinggi?',
          options: [
            'Karena setelah mengambil ERL luar, pendulum harga cenderung berayun masuk dulu ke arah IRL (koreksi) sehingga pembeli di puncak mudah terseret minus',
            'Karena tombol BUY dinonaktifkan oleh broker di atas ERL',
            'Karena ERL selalu berarti pasar tutup',
            'Karena spread selalu berubah menjadi $100 di atas ERL'
          ],
          answerIndex: 0,
          explanation: 'Pasca menyentuh ERL, algoritma cenderung melakukan retrace ke IRL; masuk di puncak ERL menempatkanmu di posisi terburuk dengan SL sangat lebar.'
        },
        {
          question: 'Kapan sebuah kotak Dealing Range lama dinyatakan **usang** dan wajib digeser ke kotak baru?',
          options: [
            'Setiap 5 menit sekali walaupun harga tidak ke mana-mana',
            'Ketika harga mencetak BOS Valid baru yang menembus batas kotak lama dan membentuk kaki dorongan baru',
            'Hanya setiap tanggal 1 awal bulan',
            'Tidak pernah digeser selamanya'
          ],
          answerIndex: 1,
          explanation: 'Begitu BOS Valid baru lahir, arena permainan pasar telah berpindah ke kaki dorongan terakhir sehingga Dealing Range wajib diperbarui.'
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
      subtitle: 'Memahami dari nol kenapa kumpulan Stop Loss adalah "bahan bakar" pergerakan harga, sekaligus memetakan 5 Liquidity Pool paling keramat di XAU/USD lengkap dengan jam WITA.',
      readMinutes: 11,
      diagramId: 'bsl-ssl-pools',
      diagramAfterSection: 1,
      summary: 'Logika mekanis Liquidity pasar (Stop Loss = order lawan), perbedaan BSL vs SSL, fenomena EQH/EQL, hierarki 5 Liquidity Pool XAU/USD (PWH/PWL, PDH/PDL, Asia Range WITA, Session H/L), dan status Fresh vs Taken.',
      bookSections: [
        {
          number: '11.1',
          heading: 'Apa Itu Liquidity Sebenarnya? (Penjelasan Paling Membumi)',
          paragraphs: [
            'Kata **"Liquidity"** sering diucapkan trader dengan nada misterius seolah-olah itu sihir. Padahal arti aslinya sangat sederhana dan masuk akal: **Liquidity adalah ketersediaan lawan transaksi di suatu tingkat harga.**',
            'Ingat satu aturan hukum pasar dunia: di setiap transaksi, kalau kamu ingin **membeli 10.000 kontrak Gold**, harus ada pihak lain yang bersedia **menjual 10.000 kontrak Gold** di harga tersebut. Trader kecil dengan `0.02 lot` bisa masuk kapan saja tanpa kesulitan. Tetapi bank sentral dan dana lindung nilai (*hedge fund*) dengan ratusan juta dolar **tidak bisa** masuk sembarangan di ruang kosong — mereka membutuhkan lokasi yang padat oleh ribuan pesanan lawan.',
            'Di mana ribuan pesanan itu selalu berkumpul dengan sangat rapi setiap hari? **Di lokasi Stop Loss para trader ritel!** Perhatikan mekanikanya: seorang trader yang membuka posisi **SELL** menaruh Stop Loss di atas puncak lama. Secara teknis di mesin bursa, Stop Loss posisi SELL adalah sebuah perintah **BUY**! Sebaliknya, Stop Loss milik trader **BUY** yang ditaruh di bawah lembah lama adalah sebuah perintah **SELL**. Maka bagi institusi, kumpulan Stop Loss itu adalah "SPBU bahan bakar" siap pakai.'
          ]
        },
        {
          number: '11.2',
          heading: 'Buy-Side Liquidity (BSL), Sell-Side Liquidity (SSL) & Jebakan EQH/EQL',
          paragraphs: [
            'Berdasarkan letaknya di atas atau di bawah harga sekarang, Liquidity Pool dibagi menjadi dua sisi:'
          ],
          exampleBox: {
            title: 'Dua Sisi Liquidity Pool di Chart Gold',
            rows: [
              {
                label: 'BSL (Buy-Side Liquidity)',
                detail: 'Berada **DI ATAS** Swing High, Resistance, atau puncak sesi lama. Isinya: kumpulan **Stop Loss trader SELL** + **Buy Stop trader breakout**. Institusi mendorong harga naik ke BSL ketika mereka butuh banyak pembeli untuk mengisi order jual besar mereka (atau saat menargetkan TP Buy).'
              },
              {
                label: 'SSL (Sell-Side Liquidity)',
                detail: 'Berada **DI BAWAH** Swing Low, Support, atau dasar sesi lama. Isinya: kumpulan **Stop Loss trader BUY** + **Sell Stop trader breakout**. Institusi menekan harga turun ke SSL ketika mereka butuh banyak penjual untuk mengisi order beli besar mereka (atau saat menargetkan TP Sell).'
              },
              {
                label: 'EQH & EQL (Equal Highs / Equal Lows)',
                detail: 'Dua atau lebih puncak yang berhenti nyaris sejajar (**EQH** — yang biasa disebut "Double Top" di buku ritel) atau dua lembah yang berhenti nyaris sejajar (**EQL** — "Double Bottom"). Di mata institusi, EQH/EQL **bukanlah tembok baja** yang sulit ditembus, melainkan **papan reklame raksasa** yang menandakan tumpukan Stop Loss dua kali lebih tebal tepat di baliknya!'
              }
            ]
          }
        },
        {
          number: '11.3',
          heading: 'Lima Liquidity Pool Paling Keramat di XAU/USD (Hierarki Kekuatan)',
          paragraphs: [
            'Chart Gold memiliki puluhan puncak dan lembah kecil setiap hari. Jika kamu menggambar garis di semuanya, chart-mu akan penuh coretan seperti sarang laba-laba. Dalam praktik profesional (dan persis seperti yang dipetakan di Cockpit Mapping Amy FX Pro), cukup tandai **5 jenis Liquidity Pool berderajat tinggi** berikut dari yang terkuat ke yang paling intraday:'
          ],
          table: {
            caption: 'Hierarki 5 Liquidity Pool Utama di Pasar Gold (XAU/USD)',
            headers: ['Peringkat & Nama Level', 'Definisi Eksak', 'Jadwal / Patokan WITA', 'Peran di Chart Gold'],
            rows: [
              ['1. PWH / PWL', 'Previous Week High / Low (Puncak & Dasar Pekan Lalu)', 'Ditutup Jumat akhir pekan NY', 'Magnet makro terkuat — sering menjadi target swing besar atau titik reversal mingguan'],
              ['2. PDH / PDL', 'Previous Day High / Low (Puncak & Dasar Kemarin)', 'Reset harian 17:00 NY (05:00 WITA EDT / 06:00 WITA EST)', 'Magnet harian paling rutin diburu pada sesi London dan New York'],
              ['3. Asia High / Low', 'Batas atas & bawah kotak akumulasi sesi Asia (`20:00–00:00 NY`)', '**08:00–12:00 WITA** (EDT) / **09:00–13:00 WITA** (EST)', 'Hampir setiap hari satu sisinya di-sweep saat pembukaan London untuk mengambil bahan bakar'],
              ['4. Session High / Low', 'Puncak & dasar sesi London (`02:00–05:00 NY`) atau NY AM', 'London: 14:00–17:00 WITA (EDT) / 15:00–18:00 WITA (EST)', 'Target intraday utama saat transisi dari sesi London menuju sesi New York'],
              ['5. EQH / EQL', 'Dua puncak atau dua lembah yang nyaris sejajar pada M15/H1', 'Bisa muncul di sesi mana saja', 'Magnet sweep tercepat karena menumpuk Stop Loss ritel Double Top/Bottom']
            ]
          }
        },
        {
          number: '11.4',
          heading: 'Status "Segar" (Fresh) vs "Sudah Dimakan" (Taken/Swept)',
          paragraphs: [
            'Satu kesalahan sangat umum di lapangan adalah **terus mengincar level Liquidity yang sebenarnya sudah habis dimakan harga beberapa jam lalu**. Bayangkan kamu pergi ke sebuah toko roti pukul 10 malam setelah semua rotinya laku terjual sejak sore — tentu tidak ada lagi yang bisa diambil di sana!',
            'Aturan kerjanya sederhana: jika `PDH` kemarin berada di `2.670,00` dan pagi ini harga masih di `2.658,00`, maka `PDH 2.670,00` berstatus **FRESH (Utuh)** — ia masih menyimpan Liquidity Pool BSL dan sah dijadikan magnet target atas. Tetapi begitu jam 16:00 WITA Gold sudah sempat menyentuh `2.672,50`, maka `PDH 2.670,00` langsung berubah status menjadi **TAKEN / SWEPT (Sudah Terambil)**. Hapus target lama tersebut dari daftar magnet atasmu, lalu evaluasi: apakah setelah mengambil PDH harga akan berbalik turun atau lanjut menuju `PWH` di atasnya?'
          ],
          callout: {
            tone: 'info',
            title: 'Ritual 2 Menit Sebelum Sesi London',
            body: 'Setiap hari sekitar pukul 13:30–14:30 WITA sebelum London ramai, cukup tarik 3 pasang garis bersih di chart XAU/USD: **PWH/PWL**, **PDH/PDL**, dan kotak **Asia High/Low**. Coret otomatis level mana saja yang sudah kena sweep hari ini agar matamu hanya fokus pada Liquidity Pool yang masih fresh.'
          }
        }
      ],
      keyTakeaways: [
        '**Liquidity** = kumpulan pesanan lawan (terutama Stop Loss & breakout order ritel) yang dibutuhkan institusi untuk mengisi posisi raksasa.',
        '**BSL** terletak di atas puncak (SL trader Sell + Buy Stop); **SSL** terletak di bawah lembah (SL trader Buy + Sell Stop).',
        '**EQH/EQL** (Double Top/Bottom rapi) bukanlah tembok kuat — melainkan magnet Liquidity paling tebal untuk di-sweep.',
        'Cukup petakan 5 Liquidity Pool utama: **PWH/PWL**, **PDH/PDL**, **Asia High/Low** (`08:00–12:00 WITA` EDT / `09:00–13:00 WITA` EST), **Session H/L**, dan **EQH/EQL** — lalu tandai statusnya **Fresh** vs **Taken**.'
      ],
      bridgeNext: 'Kamu sekarang sudah punya peta lengkap seluruh "SPBU bahan bakar" di chart Gold (`BSL/SSL`, `EQH/EQL`, `PDH/PDL`, `PWH/PWL`, `Asia Range`). Tetapi sebelum kita menutup Bagian II, ada satu bentuk Liquidity paling licik yang menjadi penyebab nomor satu trader SMC/ICT pemula kena SL padahal arahnya sudah 100% benar! Itulah yang akan kita bongkar habis di bab penutup Bagian II: **Bab 12: Inducement (IDM): Mengenali Trap Ritel Sebelum Pergerakan Asli**.',
      conceptBlocks: [
        {
          heading: 'BSL/SSL, EQH/EQL & 5 Liquidity Pool Keramat XAU/USD',
          paragraphs: [
            'BSL menumpuk di atas puncak (SL trader SELL + Buy Stop) dan SSL menumpuk di bawah lembah (SL trader BUY + Sell Stop). EQH/EQL menjadi magnet sweep terkuat karena menumpuk Stop Loss ganda.',
            'Lima Liquidity Pool utama yang wajib dipetakan adalah PWH/PWL, PDH/PDL, Asia Range (20:00–00:00 NY), Session H/L, dan EQH/EQL dengan selalu memisahkan status Fresh vs Taken.'
          ]
        }
      ],
      mappingSteps: [
        'Tandai PWH/PWL dan PDH/PDL pada timeframe H1/Daily.',
        'Gambar kotak Asia High/Low (08:00–12:00 WITA EDT / 09:00–13:00 WITA EST) serta tandai EQH/EQL jelas di M15.',
        'Beri label [TAKEN] pada level yang sudah ditembus harga hari ini agar target tetap mengarah ke Liquidity Pool yang masih Fresh.'
      ],
      decisionTree: [
        {
          condition: 'Terdapat dua puncak nyaris sejajar (EQH) di M15 tepat di bawah PDH yang masih Fresh.',
          action: 'Perlakukan EQH tersebut sebagai magnet BSL tebal (hindari menaruh SL SELL rapat tepat di atasnya).'
        },
        {
          condition: 'Harga live sudah menembus melewati PDH hari ini.',
          action: 'Ubah status PDH menjadi TAKEN — jangan lagi menjadikannya target Buy baru; evaluasi potensi sweep-reversal atau lanjut ke PWH.'
        }
      ],
      failedCase: {
        context: 'Trader melihat "Double Top" (EQH) rapi di 2.665, langsung SELL tanpa konfirmasi dan memasang SL tipis di 2.666,50.',
        whyFailed: 'EQH adalah magnet BSL paling jelas; harga sweep 2.667 untuk memakan seluruh SL ritel sebelum akhirnya benar-benar turun.'
      },
      validRules: [
        'Selalu bedakan Liquidity Pool yang masih Fresh vs sudah Taken/Swept.',
        'Jadikan Liquidity Pool BSL/SSL yang masih utuh sebagai referensi target rasional.'
      ],
      invalidRules: [
        'Menganggap Double Top (EQH) atau Double Bottom (EQL) sebagai tembok anti-tembus untuk menaruh SL tipis.',
        'Tetap membidik PDH sebagai target atas padahal harga hari ini sudah menyapunya.'
      ],
      xauScenario: {
        context: 'Pukul 14:30 WITA (EDT), Gold di 2.651 dengan Asia High 2.654, Asia Low 2.646, dan PDH Fresh di 2.670.',
        steps: [
          'Tandai Asia High/Low sebagai Liquidity Pool intraday pertama dan PDH 2.670 sebagai Liquidity Pool harian utama.',
          'Jika pembukaan London sweep Asia Low 2.646 lalu berbalik naik, target alami mengarah ke Asia High (Fresh) lalu PDH 2.670.'
        ]
      },
      goldenRules: [
        'Pasar bergerak dari satu Liquidity Pool ke Liquidity Pool berikutnya — kenali lokasi Stop Loss sebelum memasang Stop Loss milikmu sendiri.'
      ],
      practiceCta: {
        label: 'Amati PDH/PDL & Asia High/Low di Chart Gold',
        description: 'Lihat langsung garis PWH/PWL, PDH/PDL, dan Asia Range yang terpetakan otomatis pada Cockpit Mapping.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Secara mekanis di mesin pasar, mengapa kumpulan Stop Loss milik para trader **BUY** di bawah sebuah Swing Low disebut **Sell-Side Liquidity (SSL)**?',
          options: [
            'Karena hanya boleh dipakai saat sesi Asia',
            'Karena ketika Stop Loss posisi BUY tersentuh, perintah yang tereksekusi adalah order **SELL** — menjadi sumber pasokan jual bagi institusi yang ingin membeli besar',
            'Karena semua trader BUY wajib menutup akunnya',
            'Karena SSL selalu berada di atas puncak tertinggi tahunan'
          ],
          answerIndex: 1,
          explanation: 'Menutup posisi BUY secara otomatis mengeksekusi order SELL. Kumpulan Stop Loss BUY di bawah lembah menciptakan Liquidity Pool pesanan jual (SSL).'
        },
        {
          question: 'Dalam kacamata ICT, bagaimana kita memperlakukan dua puncak yang berhenti nyaris sejajar (**Equal Highs / EQH**) di chart Gold?',
          options: [
            'Sebagai tembok baja yang mustahil ditembus sehingga aman memasang SL SELL tepat $0,50 di atasnya',
            'Sebagai papan magnet BSL bervolume tebal yang sangat rawan di-sweep untuk mengambil tumpukan Stop Loss ritel',
            'Sebagai tanda pasar akhir pekan',
            'Sebagai garis batas margin call'
          ],
          answerIndex: 1,
          explanation: 'EQH/EQL memancing ribuan trader ritel masuk Double Top/Bottom dengan SL rapat di baliknya, menjadikannya salah satu target sweep terfavorit algoritma.'
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
          explanation: 'Mengikuti patokan WITA (UTC+8): saat EDT (+12 jam) 20:00–00:00 NY = 08:00–12:00 WITA; saat EST (+13 jam) = 09:00–13:00 WITA.'
        },
        {
          question: 'PDH kemarin berada di `2.670,00`. Pada pukul 15:30 WITA hari ini, harga Gold sudah sempat naik ke `2.673,00` lalu turun ke `2.668,00`. Bagaimana status level `PDH 2.670,00` sekarang?',
          options: [
            'Masih Fresh dan menjadi magnet BUY paling segar',
            'Sudah **TAKEN / SWEPT** — Liquidity Pool di atas PDH sudah terambil sehingga tidak lagi diperlakukan sebagai target magnet segar',
            'Berubah menjadi PWL otomatis',
            'Tidak valid karena terjadi di hari kerja'
          ],
          answerIndex: 1,
          explanation: 'Begitu harga melampaui PDH, Liquidity di atasnya sudah terambil (TAKEN/SWEPT). Trader wajib mengevaluasi arah selanjutnya daripada tetap mengejar level yang sudah kosong.'
        }
      ]
    },

    // =========================================================================
    // BAB 12 — INDUCEMENT (IDM)
    // =========================================================================
    {
      id: 'inducement-idm-umpan-ritel',
      number: 12,
      levelId: 1,
      bookFormat: true,
      title: 'Inducement (IDM): Mengenali Trap Ritel Sebelum Pergerakan Asli',
      subtitle: 'Membongkar alasan nomor satu kenapa analisismu sudah 100% searah tren tetapi tetap kena Stop Loss dulu sebelum harga terbang: kamu masuk sebelum Inducement di-sweep.',
      readMinutes: 10,
      diagramId: 'inducement-trap',
      diagramAfterSection: 1,
      summary: 'Definisi mekanis Inducement (pullback internal pertama sebelum zona asli), anatomi 3 langkah jebakan trap ritel di XAU/USD, cara membedakan zona Pre-IDM vs Post-IDM, dan aturan "No IDM = You Are The Liquidity".',
      bookSections: [
        {
          number: '12.1',
          heading: 'Apa Itu Inducement (IDM)? (Analogi Umpan Pancing)',
          paragraphs: [
            'Pernahkah kamu mengalami kejadian paling bikin frustrasi di dunia trading ini: arah tren sudah benar, zona belimu terlihat sangat rapi di chart, kamu klik BUY, lalu harga turun **$3 lagi** pas menyentuh Stop Loss-mu — dan **detik itu juga** harga langsung terbang `+$25` persis ke arah Take Profit yang tadinya kamu rencanakan?!',
            'Jika itu sering terjadi padamu, hampir pasti pelakunya adalah satu konsep yang jarang dijelaskan dengan jernih di luar ICT/SMC: **Inducement (IDM)**.',
            'Secara bahasa, *induce* berarti **memancing** atau **menggoda**. Di chart Gold, **Inducement adalah swing koreksi kecil pertama (pullback internal pertama) yang terletak tepat di depan area beli/jual yang sebenarnya.** Tugasnya cuma satu: menggoda trader yang tidak sabar agar terburu-buru masuk duluan di area paling dekat dengan harga sekarang, sehingga Stop Loss mereka bisa di-sweep menjadi bahan bakar sebelum gerak asli dimulai!'
          ]
        },
        {
          number: '12.2',
          heading: 'Anatomi 3 Langkah Jebakan Inducement di XAU/USD',
          paragraphs: [
            'Supaya kamu bisa melihat pola ini dengan mata telanjang di chart M15 maupun M5 Gold, ikuti alur 3 langkah berikut dari awal sampai akhir:'
          ],
          exampleBox: {
            title: 'Kronologi Jebakan Inducement (Tren Naik XAU/USD)',
            rows: [
              {
                label: 'Langkah 1 — Terbentuk Pullback Kecil Pertama (IDM)',
                detail: 'Gold baru saja mencetak Bullish BOS dari `2.640` naik ke `2.665`. Di tengah perjalanan naik itu, sempat ada satu koreksi kecil di `2.656` (membentuk Swing Low internal kecil). Titik **`2.656` inilah Inducement (IDM)**.'
              },
              {
                label: 'Langkah 2 — Ritel Masuk di Zona "Terlalu Cepat" (Pre-IDM)',
                detail: 'Ketika harga mulai turun dari `2.665`, trader yang takut ketinggalan langsung memasang Buy Limit di area atas `2.658` (tepat di atas IDM `2.656`) dengan Stop Loss di `2.654`. Di mata mereka zona itu "cantik" — padahal **belum ada satu pun Liquidity yang di-sweep**!'
              },
              {
                label: 'Langkah 3 — Sweep IDM & Peluncuran dari Zona Asli (Post-IDM)',
                detail: 'Harga turun menembus `2.656` (IDM kena sweep!), menyikat seluruh Stop Loss di `2.654`, masuk ke zona beli yang lebih dalam & lebih murah di **`2.648`** (**zona Post-IDM**), lalu dari sana melesat kencang menuju `2.675`!'
              }
            ]
          }
        },
        {
          number: '12.3',
          heading: 'Membedakan Zona Umpan (Pre-IDM) vs Zona Asli (Post-IDM)',
          paragraphs: [
            'Kabar baiknya: begitu kamu mengenal ciri Inducement, kamu tidak lagi menjadi "korban pancingan" — justru kamu bisa ikut menunggu di balik umpan bersama uang besar. Gunakan tabel perbandingan cepat berikut sebelum menaruh Limit Order di zona mana pun:'
          ],
          table: {
            caption: 'Checklist Cepat: Zona Umpan (Pre-IDM) vs Zona Layak Tunggu (Post-IDM)',
            headers: ['Ciri di Chart', 'Zona Umpan (Pre-IDM / Rawan Jebol)', 'Zona Asli (Post-IDM / Probabilitas Tinggi)'],
            rows: [
              ['Posisi Terhadap IDM', 'Berada **di atas/depan** pullback kecil pertama (belum ada sweep)', 'Berada **tepat di belakang/bawah** IDM (menunggu IDM di-sweep dulu)'],
              ['Harga di Dalam Kotak', 'Biasanya masih di area mahal (dekat puncak gelombang)', 'Sudah masuk area lebih dalam dan lebih murah di dalam Dealing Range'],
              ['Bahan Bakar di Depannya', '**Kosong** — justru SL orang yang masuk di zona inilah bahan bakarnya', '**Tersedia** — tumpukan SL di balik IDM tepat di depannya siap di-sweep'],
              ['Tindakan Disiplin', 'Jadikan **tanda bahaya / area pantau sweep**, bukan tempat pasang limit buta', 'Siapkan rencana pantau reaksi & konfirmasi begitu IDM selesai di-sweep']
            ]
          }
        },
        {
          number: '12.4',
          heading: 'Aturan Emas "No Inducement = You Are The Liquidity" & Penutup Bagian II',
          paragraphs: [
            'Di kalangan trader institusional ada satu pepatah singkat yang sangat terkenal: **"If you don\'t see the liquidity, YOU are the liquidity."** (Kalau kamu tidak melihat siapa yang sedang dijadikan umpan di depan zonamu, berarti Stop Loss milikmu sendirilah yang akan dijadikan umpan!)',
            'Dengan menuntaskan Bab 12 ini, kamu baru saja menyelesaikan seluruh **Bagian II: Struktur Pasar & Peta Liquidity**. Coba mundur sejenak dan lihat betapa jauh kemajuanmu sejak Bab 01: sekarang kamu bisa membuka chart XAU/USD kosong, membaca tangga `HH–HL / LH–LL` secara mekanis (Bab 07), menyatukan `H1–M15–M5` (Bab 08), membedakan `BOS` vs `Sweep` (Bab 09), membingkai `Dealing Range` (Bab 10), memetakan 5 Liquidity Pool (Bab 11), dan tidak lagi tertipu umpan `Inducement` (Bab 12).'
          ],
          callout: {
            tone: 'info',
            title: 'Satu Kepingan Besar Lagi Sebelum Masuk Zona Entry!',
            body: 'Kamu sekarang sudah tahu **di mana** semua Liquidity Pool berada (`PWH/PWL, PDH/PDL, Asia Range, EQH/EQL, IDM`). Pertanyaan berikutnya yang paling sering bikin bingung trader adalah: *"Di atas ada BSL, di bawah ada SSL — lalu hari ini harga sebenarnya mau menuju ke atas atau ke bawah dulu, dan jam berapa pergerakan aslinya dimulai?"* Itulah fokus penuh **Bagian III**!'
          }
        }
      ],
      keyTakeaways: [
        '**Inducement (IDM)** adalah pullback internal kecil pertama di depan zona entry asli yang berfungsi memancing trader tak sabar masuk terlalu awal.',
        'Zona **Pre-IDM** (belum ada Liquidity di-sweep di depannya) sangat rentan ditembus SL; zona **Post-IDM** (di belakang IDM) memiliki bahan bakar Liquidity yang jelas.',
        'Aturan anti-SL konyol: **tunggu IDM kena sweep lebih dulu** sebelum mempertimbangkan entry — jika tidak melihat siapa umpannya, kamulah umpannya.',
        'Dengan berakhirnya Bagian II, seluruh fondasi baca struktur dan peta Liquidity di chart kosong sudah lengkap.'
      ],
      bridgeNext: 'Selamat telah menuntaskan **Bagian II (Bab 07–12)**! Peta struktur dan seluruh lokasi Liquidity Pool kini sudah ada di tanganmu. Di **Bagian III: Kompas Arah**, kita langsung menjawab pertanyaan terbesar yang paling banyak dicari trader ICT: dari sekian banyak Liquidity Pool di atas dan di bawah harga, **bagaimana cara memilih satu magnet tujuan utama hari ini langkah demi langkah?** Mari kita buka **Bab 13: Draw on Liquidity (DOL) Tuntas: Cara Menemukan Magnet Harga Langkah demi Langkah**.',
      conceptBlocks: [
        {
          heading: 'Anatomi Inducement (IDM): Zona Umpan Pre-IDM vs Zona Asli Post-IDM',
          paragraphs: [
            'Inducement adalah pullback internal pertama di depan zona entry sebenarnya yang memancing trader ritel masuk terlalu awal.',
            'Trader disiplin menunggu Inducement di-sweep terlebih dahulu (mengambil SL ritel sebagai bahan bakar) sebelum mencari reaksi di zona Post-IDM yang lebih dalam.'
          ]
        }
      ],
      mappingSteps: [
        'Setelah BOS Valid terjadi, tandai pullback internal kecil pertama di dalam Dealing Range sebagai kandidat IDM.',
        'Abaikan zona yang terletak di depan IDM (Pre-IDM) sebagai tempat pasang limit buta.',
        'Tunggu harga sweep titik IDM terlebih dahulu, lalu amati reaksi di zona Post-IDM yang berada di belakangnya.'
      ],
      decisionTree: [
        {
          condition: 'Ada zona entry pertama yang sangat dekat dengan puncak gelombang dan belum ada satu pun pullback kecil yang di-sweep di depannya.',
          action: 'Perlakukan zona tersebut sebagai potensi jebakan Pre-IDM; tunggu sweep IDM menuju zona lebih dalam.'
        },
        {
          condition: 'Harga baru saja sweep titik IDM dan langsung masuk ke zona Post-IDM searah tren HTF.',
          action: 'Bahan bakar Liquidity sudah terambil — pantau konfirmasi reaksi entry sesuai aturan.'
        }
      ],
      failedCase: {
        context: 'Di tren naik M15, trader langsung memasang Buy Limit di area paling atas (2.658) tepat di atas pullback kecil pertama (2.656).',
        whyFailed: '2.656 adalah Inducement; harga turun sweep 2.656 + SL trader tersebut hingga 2.648 (zona Post-IDM) sebelum akhirnya terbang ke 2.675.'
      },
      validRules: [
        'Identifikasi titik Inducement (pullback internal pertama) sebelum memilih zona tunggu.',
        'Utamakan zona yang memiliki Inducement jelas tepat di depannya.'
      ],
      invalidRules: [
        'Memasang Limit Order agresif pada zona pertama tanpa mengecek apakah sudah ada Liquidity Sweep.',
        'Menganggap setiap zona paling dekat harga saat ini sebagai zona terbaik.'
      ],
      xauScenario: {
        context: 'Gold M15 Bullish 2.640 → 2.665 dengan pullback internal pertama (IDM) di 2.656 dan zona dalam di 2.648.',
        steps: [
          'Tandai 2.656 sebagai IDM — hindari terburu-buru BUY di 2.658.',
          'Tunggu harga sweep 2.656 masuk ke 2.648 (Post-IDM), lalu cari konfirmasi BUY menuju 2.675.'
        ]
      },
      goldenRules: [
        'Tidak ada Inducement di depan zonamu = Stop Loss milikmu sendirilah yang menjadi Inducement pasar.'
      ],
      practiceCta: {
        label: 'Latih Deteksi Jebakan Inducement di 100 Kasus',
        description: 'Uji ketajamanmu membedakan zona umpan Pre-IDM dan zona layak entry Post-IDM pada kasus XAU/USD.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Apa definisi paling tepat dari **Inducement (IDM)** dalam struktur pasar ICT/SMC?',
          options: [
            'Indikator garis rata-rata 200 hari',
            'Pullback internal pertama di depan zona entry sebenarnya yang berfungsi memancing trader tak sabar masuk lebih awal agar SL mereka di-sweep sebagai bahan bakar',
            'Jam penutupan pasar di akhir pekan',
            'Batas minimal deposit pada Akun Cent'
          ],
          answerIndex: 1,
          explanation: 'Inducement adalah swing koreksi kecil pertama di depan area asli; sweep atas IDM memberi bahan bakar Liquidity sebelum gerak utama berlanjut.'
        },
        {
          question: 'Pada tren naik Gold (`2.640 → 2.665`), terdapat pullback kecil pertama (`IDM`) di `2.656` dan zona beli dalam di `2.648`. Di manakah posisi zona yang berisiko menjadi **jebakan Pre-IDM**?',
          options: [
            'Area beli di `2.658` (tepat di atas IDM `2.656` sebelum IDM kena sweep)',
            'Area beli di `2.648` setelah IDM `2.656` selesai di-sweep',
            'Target Take Profit di atas `2.665`',
            'Batas Strong Low di `2.640`'
          ],
          answerIndex: 0,
          explanation: 'Area 2.658 terletak di depan IDM 2.656 tanpa ada bahan bakar Liquidity di depannya — sangat rawan ditembus saat harga sweep 2.656.'
        },
        {
          question: 'Apa makna praktis dari pepatah trading: *"If you don\'t see the liquidity, YOU are the liquidity"*?',
          options: [
            'Trader harus selalu menaikkan lot menjadi 10 kali lipat',
            'Jika kamu masuk di sebuah zona tanpa ada umpan/Liquidity jelas yang di-sweep di depannya, maka Stop Loss milikmu sendirilah yang sangat berisiko di-sweep pasar',
            'Trader tidak perlu memasang Stop Loss sama sekali',
            'Hanya bank besar yang boleh membuka chart Gold'
          ],
          answerIndex: 1,
          explanation: 'Tanpa sweep Inducement/Liquidity sebelumnya, posisi awal ritel justru menjadi Liquidity Pool Stop Loss pertama yang diincar sebelum gerak asli terjadi.'
        },
        {
          question: 'Setelah melihat sebuah zona Post-IDM di `2.648` dengan IDM jelas di `2.656`, sikap paling disiplin bagi trader adalah:',
          options: [
            'Tetap klik BUY sekarang di `2.662` karena takut ketinggalan',
            'Sabar menunggu harga sweep `2.656` (IDM) terlebih dahulu baru memantau reaksi di zona `2.648`',
            'Memasang SELL tanpa Stop Loss di `2.648`',
            'Menghapus semua garis struktur dan menebak arah koin'
          ],
          answerIndex: 1,
          explanation: 'Kesabaran menunggu IDM kena sweep memastikan kamu masuk bersama arus institusi setelah trap ritel selesai dibersihkan.'
        }
      ]
    },

    // =========================================================================
    // BAB 13 (BAGIAN III) — DRAW ON LIQUIDITY (DOL) TUNTAS
    // =========================================================================
    {
      id: 'level-likuiditas-kunci-xauusd',
      number: 13,
      levelId: 2,
      bookFormat: true,
      title: 'Draw on Liquidity (DOL) Tuntas: Cara Menemukan Magnet Harga Langkah demi Langkah',
      subtitle: 'Menjawab kebingungan terbesar trader ICT: di atas ada Liquidity Pool BSL, di bawah ada Liquidity Pool SSL — lalu bagaimana cara memastikan SATU magnet tujuan utama (DOL) hari ini tanpa menebak?',
      readMinutes: 11,
      diagramId: 'key-liquidity-levels',
      diagramAfterSection: 1,
      summary: 'Bedah tuntas Draw on Liquidity (DOL): dua alasan tunggal harga bergerak (External Liquidity vs Internal Imbalance), protokol 4 langkah menentukan DOL di chart kosong Gold, cara menghadapi posisi tengah range, dan studi kasus konkret XAU/USD.',
      bookSections: [
        {
          number: '13.1',
          heading: 'Apa Itu Draw on Liquidity (DOL) Sebenarnya? (Analogi Magnet Besi)',
          paragraphs: [
            'Selamat datang di **Bagian III: Kompas Arah**. Di Bab 11 kamu sudah memetakan di mana saja Liquidity Pool berada (`PWH/PWL`, `PDH/PDL`, `Asia High/Low`, `EQH/EQL`). Sekarang muncul pertanyaan paling jujur sekaligus paling sering bikin trader ICT bingung: *"Oke, di atas harga ada PDH dan EQH. Di bawah harga ada PDL dan Asia Low. Dua-duanya kan Liquidity — lalu dari mana aku tahu hari ini harga mau ditarik ke ATAS dulu atau ke BAWAH dulu?!"*',
            'Jawabannya ada pada konsep terpenting di seluruh kurikulum ICT: **Draw on Liquidity (DOL)**. Kata *Draw* di sini bukan berarti "menggambar", melainkan **"tarikan / magnet"**. **Draw on Liquidity adalah satu tujuan spesifik yang sedang menarik harga Gold bergerak menuju ke sana.**',
            'Dalam prinsip ICT, harga di pasar tidak pernah berjalan tanpa tujuan. Pada setiap jam dan setiap hari, harga hanya melakukan **satu dari dua misi berikut**:',
            '1. **Misi Eksternal (Menuju Liquidity Pool Stop Loss):** Harga sedang ditarik menuju `Old High / EQH / PDH / PWH` (BSL) atau menuju `Old Low / EQL / PDL / PWL` (SSL) yang masih segar (*Fresh*).',
            '2. **Misi Internal (Menutup Imbalance):** Harga sedang ditarik masuk kembali ke dalam *Dealing Range* menuju area Imbalance (*Fair Value Gap* di H1/H4) untuk menyeimbangkan harga sebelum meluncur lagi ke misi eksternal.'
          ]
        },
        {
          number: '13.2',
          heading: 'Protokol 4 Langkah Menemukan DOL di Chart Kosong XAU/USD',
          paragraphs: [
            'Jangan pernah menebak DOL dengan perasaan *"kayaknya emas sudah ketinggian, pasti turun"*. Gunakan urutan mekanis **4 langkah berurutan** berikut — persis seperti cara kerja seorang analis institusional memetakan chart sebelum sesi London dan New York:'
          ],
          table: {
            caption: 'Mesin 4-Langkah Menemukan Draw on Liquidity (DOL) Tanpa Bingung',
            headers: ['Langkah', 'Pertanyaan Kunci di Chart', 'Cara Membaca Fakta Harga', 'Hasil Keputusan'],
            rows: [
              ['1. Cek Origin (Asal Tolakan)', 'Liquidity Pool atau zona mana yang **BARU SAJA** disentuh/di-sweep harga?', 'Jika harga baru sweep **SSL / PDL / Asia Low** lalu menolak tajam → bahan bakar bawah baru diambil', 'Magnet aktif (`DOL`) berpindah **ke sisi lawan (ATAS / BSL)**'],
              ['2. Cek Arus HTF (H4 & H1)', 'Apakah struktur H4/H1 mendukung arah tarikan tersebut?', 'H1 sedang `HH–HL` (Bullish) dan harga memantul di atas Strong Low', 'Tarikan ke atas (**BSL**) mendapat dukungan penuh arus besar'],
              ['3. Pilih Magnet Terdekat yang FRESH', 'Dari daftar Liquidity Pool fresh di arah tujuan, mana yang paling bersih & belum kena sweep?', 'Urutan prioritas wajar intraday: `Asia H/L` → `Session H/L` → `EQH/EQL` → `PDH/PDL` → `PWH/PWL`', 'Kunci 1 target terdekat (**DOL 1**) dan 1 target utama (**DOL 2**)'],
              ['4. Cek Penghalang & Batas Batal', 'Apakah ada tembok besar di tengah jalan atau level invalidasi?', 'Pastikan jarak ke DOL cukup luas (minimal R:R 1:2) dan tandai titik asal sweep sebagai batas batal', 'Jika harga justru **body close** menembus titik asal sweep → DOL lama **BATAL**!']
            ]
          },
          paragraphsAfter: [
            'Perhatikan betapa logisnya **Langkah 1 (Origin)**: pasar bekerja seperti permainan bola pantul. Kalau bola baru saja memantul keras dari dinding kiri (`SSL / Asia Low`), ke mana arah bola sekarang? Tentu menuju dinding kanan (`Asia High / PDH`)! Kamu tidak akan pernah bisa menentukan tujuan (`DOL`) jika kamu lupa melihat **dari mana harga baru saja melompat (`Origin`)**.'
          ]
        },
        {
          number: '13.3',
          heading: 'Kasus Abu-Abu DOL: Bagaimana Jika Harga Terjepit di Tengah Range?',
          paragraphs: [
            'Ada satu situasi nyata yang paling sering menjebak pemula: kamu membuka chart pukul 13:30 WITA, lalu melihat harga Gold berada **persis di tengah-tengah (50%)** antara `PDH` di atas (`+$16`) dan `PDL` di bawah (`-$16`), sementara Asia Low belum kena sweep dan Asia High juga belum kena sweep. Di posisi seperti ini, **ke mana DOL-nya?**',
            'Jawabannya tegas dan jujur: **di tengah kotak tanpa Origin, DOL belum terkonfirmasi!** Jangan memaksakan opini. Terapkan aturan **Wait for First Sweep (Tunggu Sweep Pertama)**: biarkan pembukaan sesi London atau New York memilih duluan dinding mana yang mau di-sweep.',
            'Begitu harga turun duluan sweep `Asia Low` (atau `PDL`) lalu memantul kuat dengan body close kembali ke dalam range, saat itulah misteri selesai 100%: **Origin = Sweep Bawah**, maka **DOL resmi terkunci ke ATAS (`Asia High` → `PDH`)**! Sebaliknya, jika `Asia High` yang di-sweep duluan lalu ditolak turun, maka **DOL resmi terkunci ke BAWAH (`Asia Low` → `PDL`)**.'
          ],
          callout: {
            tone: 'warn',
            title: 'Kesalahan Klasik: Memilih DOL yang Terlalu Jauh atau Sudah Basi',
            body: 'Jangan menargetkan PWH yang berjarak `$65` untuk entry scalping M5 ketika ada `EQH` dan `PDH` yang hanya berjarak `$14` di depan mata. Selain itu, selalu ingat aturan Bab 11: jika `PDH` sudah berstatus **TAKEN** pagi tadi, jangan memakainya lagi sebagai DOL atas — cari Liquidity Pool fresh berikutnya!'
          }
        },
        {
          number: '13.4',
          heading: 'Studi Kasus Lengkap XAU/USD: Menentukan DOL 2 Tahap dari Chart Kosong',
          paragraphs: [
            'Mari kita praktikkan langsung 4 langkah tadi pada skenario Gold pukul `14:45 WITA` (menjelang London Killzone) agar kamu merasakan sendiri alur berpikir seorang trader ICT mandiri:'
          ],
          exampleBox: {
            title: 'Bedah Kasus Nyata Menentukan DOL di XAU/USD',
            rows: [
              {
                label: 'Peta Awal (Pukul 14:45 WITA)',
                detail: '`H1` struktur Bullish (`HH–HL`, Strong Low di `2.636`). `PDH` (Fresh) di `2.672`. `PDL` (Fresh) di `2.638`. Kotak Asia Range berada di `2.646` (Asia Low) – `2.654` (Asia High). Harga live masih duduk di tengah kotak (`2.650`).'
              },
              {
                label: 'Reaksi Pukul 15:15 WITA (Lahirnya Origin)',
                detail: 'Sesi London dibuka; Gold turun cepat ke `2.643,50` **sweep Asia Low `2.646` dengan wick panjang**, lalu candle M15 ditutup kembali di atas `2.647,50` (Sweep valid!). Sekarang kita punya **Origin = Sweep Asia Low**.'
              },
              {
                label: 'Penguncian DOL 2 Tahap',
                detail: '**DOL 1 (Magnet Terdekat / TP1):** `Asia High 2.654,00` (segar, berjarak `+$6,50`). **DOL 2 (Magnet Utama / TP2):** `PDH 2.672,00` (segar, searah tren Bullish H1).'
              },
              {
                label: 'Garis Batal DOL',
                detail: 'Jika M15/H1 ternyata berbalik dan **body close di bawah `2.643,50`** (ujung sweep tadi), maka skenario DOL ke atas **batal** dan magnet langsung beralih mengincar `PDL 2.638` di bawah.'
              }
            ]
          }
        }
      ],
      keyTakeaways: [
        '**Draw on Liquidity (DOL)** adalah satu magnet tujuan spesifik yang menarik harga — hanya ada 2 misi: **menuju Liquidity Pool eksternal (BSL/SSL Fresh)** atau **menutup Imbalance internal (FVG H1/H4)**.',
        'Selalu gunakan **4 Langkah DOL**: (1) Cek **Origin** (dari mana harga baru saja sweep/memantul), (2) Cek keselarasan **HTF**, (3) Pilih **magnet terdekat yang masih Fresh** (DOL 1 & DOL 2), (4) Tetapkan **garis batal**.',
        'Jika harga terjepit di tengah range tanpa sweep Origin, **jangan menebak** — tunggu sisi pertama kena sweep (*Wait for First Sweep*), lalu sisi seberangnya otomatis menjadi DOL.',
        'Begitu magnet DOL utama sudah tercapai (`TAKEN`), hentikan kebiasaan mengejar tren yang baru selesai menuntaskan misinya.'
      ],
      bridgeNext: 'Luar biasa — sekarang **Draw on Liquidity (DOL)** tidak lagi terasa kabur atau abstrak! Kamu tahu cara membaca dari mana harga melompat (`Origin`) dan ke Liquidity Pool mana harga ditarik (`DOL`). Nah, bagaimana cara menggabungkan peta DOL ini dengan **bentuk candle harian (Daily) kemarin** agar setiap pagi dalam 2 menit kamu sudah tahu arah prioritas hari ini? Mari lanjut ke **Bab 14: Menentukan Daily Bias & Membaca Arah Candle Harian (Next-Day Expansion)**.',
      conceptBlocks: [
        {
          heading: 'Mesin 4 Langkah Menentukan Draw on Liquidity (DOL)',
          paragraphs: [
            'Draw on Liquidity adalah satu target magnet utama (External BSL/SSL Fresh atau Internal Imbalance HTF) yang sedang menarik pergerakan harga.',
            'Tentukan DOL melalui 4 langkah: cek Origin sweep/pantulan terbaru, cek arah HTF, kunci magnet terdekat yang masih Fresh (DOL 1 & DOL 2), dan pasang garis batal jika titik Origin ditembus body close.'
          ]
        }
      ],
      mappingSteps: [
        'Identifikasi Origin terbaru: Liquidity Pool atau zona HTF mana yang baru saja di-sweep atau menolak harga.',
        'Konfirmasi keselarasan arus struktur H4/H1 terhadap arah pantulan dari Origin tersebut.',
        'Kunci DOL 1 (magnet intraday terdekat yang Fresh seperti Asia H/L atau EQH/EQL) dan DOL 2 (magnet harian seperti PDH/PDL), beserta garis batalnya.'
      ],
      decisionTree: [
        {
          condition: 'Harga berada persis di tengah (50%) antara PDH dan PDL serta belum sweep Asia High maupun Asia Low.',
          action: 'Jangan menebak arah DOL. Terapkan Wait for First Sweep hingga salah satu ujung kotak Asia di-sweep lebih dulu.'
        },
        {
          condition: 'Harga baru saja sweep Asia Low dengan wick penolakan tegas sementara struktur H1 Bullish dan PDH masih Fresh.',
          action: 'Kunci DOL ke atas: Asia High sebagai DOL 1 (TP1) dan PDH sebagai DOL 2 (TP2), dengan titik batal di bawah ujung sweep.'
        }
      ],
      failedCase: {
        context: 'Trader memilih PDH sebagai DOL Buy padahal harga baru saja sweep PDH 30 menit sebelumnya dan ditutup balik di bawahnya dengan wick panjang.',
        whyFailed: 'Lupa bahwa PDH sudah berubah status menjadi TAKEN sekaligus menjadi Origin sweep atas — magnet DOL justru sudah berbalik mengarah ke bawah.'
      },
      validRules: [
        'Selalu hubungkan Origin (sisi yang baru di-sweep) dengan DOL (Liquidity Pool Fresh di sisi lawan).',
        'Bedakan DOL 1 (target terdekat/TP1) dan DOL 2 (target harian utama/TP2).'
      ],
      invalidRules: [
        'Menebak arah DOL saat harga masih di tengah range tanpa sweep Origin.',
        'Tetap membidik level Liquidity yang sudah TAKEN sebagai magnet baru.'
      ],
      xauScenario: {
        context: 'Pukul 15:15 WITA, H1 Bullish, Gold sweep Asia Low 2.646 sampai 2.643,50 lalu close kembali di atas 2.647,50.',
        steps: [
          'Origin terkonfirmasi = Sweep Asia Low.',
          'DOL 1 terkunci ke Asia High 2.654 dan DOL 2 ke PDH Fresh 2.672; batal jika close di bawah 2.643,50.'
        ]
      },
      goldenRules: [
        'Tanpa mengetahui dari mana harga baru memantul (Origin), kamu hanya sedang menebak ke mana harga akan pergi (DOL).'
      ],
      practiceCta: {
        label: 'Lihat Target DOL Live di Cockpit Mapping',
        description: 'Bandingkan langsung target DOL aktif, Liquidity Pool BSL/SSL Fresh, dan status Dealing Range Gold di Cockpit Mapping.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Dalam kerangka ICT, hanya ada **dua misi** yang menarik pergerakan harga (**Draw on Liquidity**). Apa saja keduanya?',
          options: [
            'Mengejar garis Moving Average 50 dan menunggu indikator RSI jenuh',
            'Menuju Liquidity Pool eksternal yang masih Fresh (Old High/Low, PDH/PDL, EQH/EQL) atau menuju area Imbalance internal (FVG/Imbalance HTF)',
            'Naik setiap hari Senin dan turun setiap hari Jumat',
            'Hanya bergerak saat spread melebar di jam rollover'
          ],
          answerIndex: 1,
          explanation: 'Algoritma pasar hanya menggerakkan harga menuju dua tujuan: Liquidity Pool eksternal (ERL) atau menyeimbangkan celah internal (IRL).'
        },
        {
          question: 'Struktur H1 Gold sedang Bullish, `PDH 2.672` masih Fresh, dan saat pembukaan London harga turun sweep **Asia Low `2.646`** dengan wick lalu close kembali di atasnya. Ke manakah **DOL 1 dan DOL 2** yang paling rasional?',
          options: [
            'Menuju bawah ke `2.600` karena tadi sempat muncul wick turun',
            'DOL 1 ke `Asia High` (Liquidity Pool Fresh terdekat di sisi lawan) dan DOL 2 ke `PDH 2.672`',
            'Tidak ada target sama sekali karena Asia Low sudah hilang',
            'Menuju PWL 3 bulan lalu dalam 15 menit'
          ],
          answerIndex: 1,
          explanation: 'Setelah Origin sweep bawah (Asia Low) terbentuk selaras tren H1 Bullish, magnet harga berpindah ke Liquidity Pool Fresh di atas: Asia High (DOL 1) lalu PDH (DOL 2).'
        },
        {
          question: 'Pukul 13:30 WITA, harga Gold duduk persis di tengah-tengah antara PDH dan PDL, serta belum sweep Asia High maupun Asia Low. Apa aturan paling disiplin untuk menentukan DOL?',
          options: [
            'Langsung buka BUY dan SELL bersamaan supaya pasti kena salah satu',
            'Menerapkan aturan **Wait for First Sweep** — tidak menebak arah sampai pasar sweep salah satu ujung kotak lebih dulu untuk memberi Origin jelas',
            'Menebak turun karena merasa harga sudah mahal',
            'Memperbesar lot 3 kali lipat di tengah kotak'
          ],
          answerIndex: 1,
          explanation: 'Di tengah range tanpa Origin, arah DOL belum terkunci. Menunggu sweep pertama memberi fakta objektif ke sisi mana magnet berpindah.'
        },
        {
          question: 'Kapan skenario DOL ke atas pasca sweep Asia Low `2.643,50` dinyatakan **resmi BATAL**?',
          options: [
            'Saat muncul 1 candle merah kecil di M1',
            'Saat candle timeframe kerja (M15/H1) berbalik dan **body close** menembus ke bawah titik asal sweep `2.643,50`',
            'Saat harga baru naik $2 menuju Asia High',
            'Saat spread berada di angka normal $0,25'
          ],
          answerIndex: 1,
          explanation: 'Jika titik asal sweep (Origin) justru ditembus oleh body close, artinya tolakan gagal dan magnet harga beralih ke Liquidity Pool bawah berikutnya.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
