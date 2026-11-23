/* Amy FX Academy — Level 0: Pra-Trading & Fondasi Pemula Nol (Bab 0.1–0.6)
 * Bahasa awam tanpa jargon ICT rumit — jembatan aman sebelum masuk Level 01 ICT XAU/USD.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AmyAcademyPart0 = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const LEVELS = [
    {
      id: 0,
      code: 'Level 00',
      title: 'Pra-Trading & Dasar MT5 (Pemula Nol)',
      tagline: 'Mulai dari nol mutlak dengan bahasa awam: kenal broker & akun Demo/Cent, hitung pips & lot Gold, pahami Bid/Ask, kuasai 5 jenis order MT5, hingga rencana latihan aman 14 hari.'
    }
  ];

  const LESSONS = [
    // ═══════════════════════════════════════════════════════════════
    // LEVEL 0 — PRA-TRADING & DASAR MT5 (PEMULA NOL)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'kenal-trading-broker-akun',
      number: 0.1,
      code: '0.1',
      levelId: 0,
      title: 'Kenal Dunia Trading, Broker & Jenis Akun (Demo, Cent, Standard)',
      readMinutes: 4,
      diagramId: 'zero-account-types',
      summary: 'Pahami apa sebenarnya trading XAU/USD (Gold), fungsi broker sebagai perantara resmi, dan kenapa pemula nol wajib mulai dari Akun Demo lalu Akun Cent (USC) sebelum Akun Standard.',
      conceptBlocks: [
        {
          heading: 'Apa Itu Trading XAU/USD (Gold) Sebenarnya?',
          paragraphs: [
            'Saat kamu trading XAU/USD di aplikasi seperti MetaTrader 5 (MT5), kamu tidak membeli emas batangan fisik ke toko emas. Kamu memperdagangkan selisih harga emas dunia (XAU) terhadap dolar Amerika (USD) secara online.',
            'Contohnya sederhana: jika kamu memperkirakan harga emas naik dari $2.650 ke $2.660 lalu membuka transaksi Beli (Buy), kamu mendapat keuntungan dari selisih kenaikan $10 tersebut. Sebaliknya, jika memperkirakan harga turun, kamu bisa membuka transaksi Jual (Sell).'
          ]
        },
        {
          heading: 'Peran Broker & 3 Jenis Akun yang Wajib Kamu Tahu',
          paragraphs: [
            'Kita sebagai trader individu tidak bisa langsung masuk ke pasar emas antar-bank dunia, sehingga butuh perantara bernama Broker. Broker menyediakan akses grafik harga live, aplikasi transaksi (MT5), serta tempat menyimpan saldo trading.',
            'Di dalam broker ada 3 jenis akun penting: (1) Akun Demo — memakai uang virtual gratis untuk latihan menekan tombol dan uji strategi tanpa risiko rugi sungguhan; (2) Akun Cent (USC) — memakai uang asli kecil, misalnya deposit $10 otomatis tampil sebagai 1.000 USC (sen), sehingga 1 kali rugi kecil hanya terasa beberapa sen; (3) Akun Standard (USD) — akun penuh untuk trader yang sudah konsisten di Demo/Cent.'
          ]
        }
      ],
      validRules: [
        'Wajib mulai dari Akun Demo atau Akun Simulasi sampai benar-benar lancar memasang order, SL, dan TP tanpa salah pencet.',
        'Saat pertama kali ingin merasakan psikologi uang asli, gunakan Akun Cent (USC) dengan uang dingin yang siap direlakan untuk belajar.',
        'Pastikan broker yang dipakai teregulasi jelas, punya proses deposit/withdraw transparan, dan bukan investasi titip dana.'
      ],
      invalidRules: [
        'Langsung deposit uang tabungan atau uang kebutuhan bulanan ke Akun Standard di minggu pertama belajar.',
        'Tergiur janji "profit tetap harian / titip dana pasti untung" — di trading nyata tidak ada hasil pasti tanpa risiko.',
        'Menganggap Akun Demo tidak berguna lalu langsung nekat menebak arah dengan uang asli.'
      ],
      xauScenario: {
        context: 'Perbandingan rasa risiko ketika pemula bermodal $20 belajar transaksi XAU/USD dengan ukuran terkecil (0.01 lot) dan harga bergerak berlawanan $5.',
        steps: [
          'Di Akun Demo: Rugi -$5 virtual. Saldo uang asli di rekeningmu tetap utuh 100%, tapi kamu mendapat pelajaran cara membaca grafik dan pasang SL.',
          'Di Akun Cent (USC): Deposit $20 tampil sebagai 2.000 USC. Gerak -$5 dengan 0.01 lot Cent hanya rugi -5 USC (setara $0,05 atau ~Rp800). Mental tetap tenang untuk ratusan kali latihan nyata!',
          'Di Akun Standard: Modal $20 lalu kena rugi -$5 langsung memangkas 25% modal dalam 1 transaksi — terlalu berat untuk pemula yang masih sering salah.'
        ]
      },
      goldenRules: [
        'Akun Demo melatih tangan dan mata; Akun Cent melatih mental dengan biaya paling murah; Akun Standard hanya untuk yang sudah punya catatan jurnal stabil.',
        'Jangan pernah memakai uang pinjaman, dana darurat, atau uang kebutuhan hidup untuk trading.'
      ],
      practiceCta: {
        label: 'Buka Jurnal & Mode Simulasi',
        description: 'Kenali sekat Akun Real vs Simulasi dan fitur Akun Cent (USC) di modul Jurnal Trading.',
        href: '../journal/index.html'
      },
      quiz: [
        {
          question: 'Jika kamu masih pemula nol dan baru ingin pertama kali belajar memakai uang asli dalam jumlah kecil agar mental terlatih tanpa cepat habis modal, akun apa yang paling tepat?',
          options: [
            'Akun Standard dengan seluruh uang tabungan',
            'Akun Cent (USC) setelah lancar berlatih di Akun Demo',
            'Akun titip dana dengan janji profit tetap 20% per minggu',
            'Langsung memakai akun pinjaman online agar lot besar'
          ],
          answerIndex: 1,
          explanation: 'Akun Cent (USC) mengecilkan nilai transaksi menjadi 1/100 dari Akun Standard sehingga pemula bisa melatih psikologi uang asli dengan risiko sangat ringan.'
        },
        {
          question: 'Kamu deposit $15 ke Akun Cent (USC). Angka saldo berapa yang akan muncul di layar MetaTrader 5?',
          options: [
            '15 USC',
            '150 USC',
            '1.500 USC',
            '15.000 USC'
          ],
          answerIndex: 2,
          explanation: '1 Dolar Amerika (USD) = 100 Sen (USC), maka deposit $15 tampil sebagai 1.500 USC di layar MT5.'
        },
        {
          question: 'Apa fungsi utama Broker dalam aktivitas trading XAU/USD?',
          options: [
            'Menjamin setiap transaksi trader pasti selalu untung',
            'Menjadi perantara resmi yang menghubungkan order trader ke harga pasar global melalui aplikasi seperti MT5',
            'Mengirimkan emas batangan fisik ke rumah setiap kali klik Buy',
            'Mengatur jadwal libur pasar emas dunia secara sepihak'
          ],
          answerIndex: 1,
          explanation: 'Broker adalah perantara akses pasar dan penyedia platform transaksi, bukan pemberi jaminan profit.'
        }
      ]
    },

    {
      id: 'bid-ask-spread-pips-gold',
      number: 0.2,
      code: '0.2',
      levelId: 0,
      title: 'Bid, Ask, Spread & Cara Hitung Pips/Point di Gold',
      readMinutes: 5,
      diagramId: 'zero-bid-ask-spread',
      summary: 'Pahami kenapa transaksi yang baru saja dibuka langsung terlihat merah (minus), beda garis Bid vs Ask, dan cara membaca satuan Pips serta Point di XAU/USD tanpa bingung.',
      conceptBlocks: [
        {
          heading: 'Bid, Ask & Spread: Kenapa Baru Klik Langsung Minus?',
          paragraphs: [
            'Di pasar trading selalu ada dua harga sekaligus, persis seperti di tempat penukaran uang (money changer): harga Jual (Bid) yang lebih rendah, dan harga Beli (Ask) yang sedikit lebih tinggi. Selisih antara harga Ask dan Bid disebut Spread — itulah biaya transaksi dasar yang diambil broker.',
            'Aturan main yang wajib diingat seumur hidup: transaksi BUY dibuka di harga Ask (atas) dan ditutup di harga Bid (bawah). Sebaliknya, transaksi SELL dibuka di harga Bid (bawah) dan ditutup di harga Ask (atas). Karena ada selisih Spread, setiap transaksi baru pasti mulai dari angka minus tipis dulu sebelum harga bergerak searah prediksimu.'
          ]
        },
        {
          heading: 'Cara Membaca Angka Harga, Pips & Point di XAU/USD',
          paragraphs: [
            'Harga Gold (XAU/USD) biasanya ditampilkan dengan 2 angka di belakang koma, misalnya 2.650,00. Angka paling belakang (0,01) disebut 1 Point, sedangkan perubahan 0,10 disebut 1 Pip, dan perubahan $1,00 utuh (misal dari 2.650,00 ke 2.651,00) sama dengan 10 Pips atau 100 Points.',
            'Contoh mudah: jika kamu Buy Gold di 2.650,00 lalu harga naik ke 2.655,00, artinya harga naik $5,00 atau 50 Pips (500 Points). Kalau kamu mendengar trader lain berkata "SL saya 30 pips di Gold", artinya jarak Stop Loss-nya adalah $3,00 dari titik masuk.'
          ]
        }
      ],
      validRules: [
        'Aktifkan tampilan "Ask Price Line" di pengaturan chart MT5 agar kedua garis Bid dan Ask selalu terlihat jelas.',
        'Ingat selalu bahwa saat posisi Sell, garis Ask-lah yang menentukan kapan SL atau TP kamu tersentuh — bukan hanya ujung candle (Bid).',
        'Biasakan mengonversi jarak SL/TP ke satuan dolar ($1 = 10 pips) supaya gampang menghitung risiko.'
      ],
      invalidRules: [
        'Panik atau mengira broker curang hanya karena transaksi baru dibuka 1 detik sudah menunjukkan angka minus kecil akibat spread.',
        'Memasang SL terlalu mepet dengan ujung harga tanpa memperhitungkan lebar spread Gold ($0,20–$0,40 di jam normal, bisa melebar saat berita atau subuh).',
        'Tertukar antara Point dan Pips sehingga salah menghitung jarak Stop Loss 10 kali lebih kecil atau lebih besar.'
      ],
      xauScenario: {
        context: 'Menjawab misteri klasik pemula: "Kenapa posisi Sell saya kena SL padahal candle chart belum menyentuh garis SL?"',
        steps: [
          'Kamu membuka posisi Sell XAU/USD di harga 2.650,00 dan memasang Stop Loss di 2.652,00 (jarak $2,00 / 20 pips).',
          'Chart MT5 standar hanya menggambar garis harga Bid. Saat harga naik ke puncak 2.651,75 (Bid), spread sedang $0,30.',
          'Artinya harga Ask yang sebenarnya saat itu adalah 2.651,75 + 0,30 = 2.652,05 — sudah melewati garis SL 2.652,00!',
          'Karena posisi Sell ditutup oleh harga Ask, SL otomatis tereksekusi walaupun gambar candle (Bid) masih berjarak $0,25 di bawah garis.'
        ]
      },
      goldenRules: [
        'Buy dibuka di Ask, ditutup di Bid. Sell dibuka di Bid, ditutup di Ask.',
        'Di Gold (XAU/USD), selalu hafal patokan mudah: gerak $1,00 = 10 pips = 100 points.'
      ],
      practiceCta: {
        label: 'Pantau Harga Live XAU/USD di Mapping',
        description: 'Lihat pergerakan angka harga Gold 2 desimal secara langsung di layar Cockpit Mapping.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Harga XAU/USD bergerak naik dari 2.640,00 menjadi 2.644,50. Berapa jarak pergerakan tersebut dalam satuan Pips?',
          options: [
            '4,5 pips',
            '45 pips',
            '450 pips',
            '0,45 pips'
          ],
          answerIndex: 1,
          explanation: 'Di XAU/USD, setiap $1,00 = 10 pips. Maka kenaikan $4,50 setara dengan 4,5 × 10 = 45 pips (450 points).'
        },
        {
          question: 'Mengapa ketika kamu baru saja menekan tombol Buy di MT5, kolom profit langsung menampilkan angka minus tipis (misal -$0,25)?',
          options: [
            'Karena aplikasi MT5 sedang error dan harus di-install ulang',
            'Karena adanya Spread — posisi Buy dibuka di harga Ask yang sedikit lebih tinggi, lalu nilai tutupnya dihitung dari harga Bid',
            'Karena harga emas langsung jatuh dalam 1 milidetik',
            'Karena akun belum di-upgrade ke akun VIP'
          ],
          answerIndex: 1,
          explanation: 'Selisih antara harga Ask (tempat Buy dibuka) dan Bid (tempat Buy ditutup) disebut Spread, sehingga posisi baru selalu mulai dari minus sebesar spread.'
        },
        {
          question: 'Kamu sedang membuka posisi SELL Gold dengan Stop Loss di 2.660,00. Spread saat itu $0,30. Pada harga Bid berapa posisi Sell-mu akan mulai tersentuh SL?',
          options: [
            'Saat Bid mencapai 2.660,30',
            'Saat Bid mencapai 2.659,70 (karena Ask = 2.659,70 + 0,30 = 2.660,00)',
            'Saat Bid mencapai 2.655,00',
            'Spread tidak berpengaruh pada posisi Sell'
          ],
          answerIndex: 1,
          explanation: 'Posisi Sell ditutup menggunakan harga Ask. Ketika Bid 2.659,70 dan spread $0,30, harga Ask sudah menyentuh tepat 2.660,00 sehingga SL aktif.'
        }
      ]
    },

    {
      id: 'lot-leverage-margin-equity',
      number: 0.3,
      code: '0.3',
      levelId: 0,
      title: 'Lot, Leverage, Margin & Balance vs Equity (Anti Margin Call)',
      readMinutes: 5,
      diagramId: 'zero-lot-margin-meter',
      summary: 'Pelajari cara menghitung nilai dolar dari ukuran Lot di Gold, arti Leverage & Margin, serta bedanya Balance vs Equity supaya akunmu tidak pernah hancur karena salah pasang lot.',
      conceptBlocks: [
        {
          heading: 'Lot di XAU/USD: Berapa Nilai Uang Setiap Harga Bergerak?',
          paragraphs: [
            'Lot adalah ukuran besar-kecilnya transaksi yang kamu buka. Di XAU/USD (Akun Standard), 1,00 lot penuh mewakili 100 troy ounce emas — artinya tiap harga Gold bergerak $1,00, untung atau rugimu berubah $100!',
            'Karena 1,00 lot terlalu besar untuk modal kecil, broker menyediakan ukuran terkecil bernama Micro Lot (0,01 lot). Patokan wajib hafal untuk Akun Standard XAU/USD: memakai 0,01 lot berarti setiap harga bergerak $1,00 (10 pips), untung/rugimu = $1,00. Jika pakai 0,02 lot, gerak $1 = $2. Sedangkan di Akun Cent (USC), 0,01 lot gerak $1 hanya = 1 USC ($0,01).'
          ]
        },
        {
          heading: 'Leverage, Margin, Balance, Equity & Bahaya Margin Call',
          paragraphs: [
            'Leverage (daya ungkit, misal 1:500) adalah fasilitas pinjaman sementara dari broker agar modal kecil bisa membuka transaksi 0,01 lot Gold dengan uang jaminan kecil bernama Margin. Hati-hati: leverage besar memperkecil syarat jaminan, TAPI tidak mengecilkan kerugian jika kamu serakah memasang lot kebesaran.',
            'Di tab Trade MT5 selalu ada 3 angka vital: Balance (saldo hasil transaksi yang sudah ditutup), Equity (saldo nyata saat ini = Balance ditambah atau dikurangi posisi yang masih berjalan), dan Free Margin (sisa napas modal). Jika floating minus menggerus Equity sampai batas Stop Out broker (biasanya Margin Level 20%–50%), broker akan menutup paksa posisimu dalam keadaan rugi besar — itulah yang disebut Margin Call / MC.'
          ]
        }
      ],
      validRules: [
        'Hitung ukuran lot terlebih dahulu sebelum entry menggunakan rumus sederhana: Risiko ($) ÷ Jarak SL dalam dolar = Lot yang aman (dibagi 100).',
        'Untuk pemula nol, batasi risiko per transaksi maksimal 1%–2% dari total modal agar sanggup bertahan walau salah berkali-kali.',
        'Selalu cek angka Equity, bukan hanya Balance — karena Equity adalah uang sungguhan yang tersisa jika semua posisi ditutup sekarang.'
      ],
      invalidRules: [
        'Memasang 0,10 lot di Akun Standard bermodal $100 — cukup harga Gold bergerak berlawanan $8 saja, hampir seluruh saldo langsung habis.',
        'Membuka 5 sampai 10 posisi bertumpuk sekaligus (layering tanpa hitung) hingga Free Margin menipis dan memicu Stop Out.',
        'Mengira Leverage 1:1000 atau 1:2000 artinya modal aman padahal justru memancing pemula memasang lot terlalu besar.'
      ],
      xauScenario: {
        context: 'Simulasi nyata modal $100 di Akun Standard XAU/USD dengan batas risiko aman $2 per transaksi (2%) dan jarak Stop Loss $4 (40 pips).',
        steps: [
          'Hitung berapa kerugian 0,01 lot jika kena SL $4: 0,01 lot × $4 gerak = -$4 (4% modal — sedikit di atas batas 2%, masih bisa ditoleransi saat belajar, atau perketat SL ke $2 = -$2).',
          'Bandingkan jika nekat pasang 0,10 lot (10x lebih besar): gerak $4 saja langsung rugi -$40 (40% modal hilang dalam 1 kali klik!).',
          'Jika modalmu masih di bawah $100 dan ingin risiko benar-benar 1%–2% dengan SL leluasa $3–$5 di Gold, pindah dulu ke Akun Cent (USC) — modal $50 jadi 5.000 USC, pasang 0,02 lot dengan SL $5 hanya rugi -10 USC ($0,10)!'
        ]
      },
      goldenRules: [
        'Di Akun Standard Gold: 0,01 lot × gerak $1 = $1. Jangan pernah klik Buy/Sell sebelum tahu berapa dolar yang hilang kalau kena SL.',
        'Lot yang tepat membuatmu bisa tidur nyenyak; lot kebesaran membuat jantung berdebar setiap 1 candle berjalan.'
      ],
      practiceCta: {
        label: 'Praktik di Kalkulator Lot XAU/USD',
        description: 'Coba masukkan saldo $100 dan jarak SL 30 pips di Kalkulator Lot untuk melihat ukuran lot aman otomatis.',
        href: '../journal/index.html'
      },
      quiz: [
        {
          question: 'Di Akun Standard XAU/USD, kamu membuka Buy 0,02 lot di harga 2.650,00 lalu terkena Stop Loss di harga 2.645,00 (turun $5,00). Berapa kerugianmu?',
          options: [
            '-$2,00',
            '-$5,00',
            '-$10,00',
            '-$50,00'
          ],
          answerIndex: 2,
          explanation: 'Dengan 0,01 lot, gerak $1 = $1. Maka 0,02 lot bernilai $2 per $1 gerak. Turun $5 × $2 = kerugian -$10,00.'
        },
        {
          question: 'Saldo Balance di akunmu $200, dan kamu punya 1 posisi Buy yang sedang berjalan minus -$35. Berapa nilai Equity akunmu saat ini?',
          options: [
            '$235',
            '$200',
            '$165',
            '$35'
          ],
          answerIndex: 2,
          explanation: 'Equity = Balance + Floating Profit/Loss. Jadi $200 + (-$35) = $165.'
        },
        {
          question: 'Apa penyebab paling umum seorang pemula terkena Margin Call / Stop Out di minggu pertama?',
          options: [
            'Menggunakan ukuran lot terlalu besar dibandingkan modal (over-lot) dan tidak memasang Stop Loss',
            'Memasang Stop Loss terlalu rapi sesuai kalkulator lot',
            'Menggunakan Akun Demo untuk berlatih terlebih dahulu',
            'Mencatat setiap transaksi ke dalam Jurnal Trading'
          ],
          answerIndex: 0,
          explanation: 'Over-lot tanpa Stop Loss menggerus Equity dengan cepat sampai menyentuh batas Stop Out broker.'
        }
      ]
    },

    {
      id: 'panduan-mt5-lima-jenis-order',
      number: 0.4,
      code: '0.4',
      levelId: 0,
      title: 'Panduan Praktis MetaTrader 5 (MT5) & 5 Jenis Order',
      readMinutes: 5,
      diagramId: 'zero-mt5-order-types',
      summary: 'Kuasai cara kerja tombol di MetaTrader 5: bedanya Market Execution (klik langsung) vs 4 Pending Order (Buy Limit, Sell Limit, Buy Stop, Sell Stop), serta cara pasang SL dan TP.',
      conceptBlocks: [
        {
          heading: 'Market Execution vs Pending Order di MT5',
          paragraphs: [
            'Saat menekan tombol transaksi baru di MT5, pilihan pertama yang muncul adalah Market Execution — artinya order Buy atau Sell langsung aktif seketika pada harga pasar detik itu juga. Cara ini dipakai jika harga sudah berada tepat di area yang kamu inginkan.',
            'Namun trader tidak harus memelototi layar terus-menerus. MT5 menyediakan Pending Order (pesanan otomatis): kamu cukup menuliskan di harga berapa ingin masuk, plus Stop Loss (SL) dan Take Profit (TP), lalu order aktif sendiri saat harga menyentuh angka tersebut.'
          ]
        },
        {
          heading: 'Cara Mudah Menghafal 4 Jenis Pending Order (Limit vs Stop)',
          paragraphs: [
            'Kunci menghafal cepat tanpa tertukar: kata "LIMIT" artinya menunggu harga PANTULAN (dapat harga lebih murah untuk Buy, lebih mahal untuk Sell), sedangkan kata "STOP" artinya mengikuti TEMBUSAN (breakout searah laju harga).',
            '• Buy Limit: Pasang DI BAWAH harga sekarang — berharap harga turun dulu menjemput order, lalu memantul NAIK.\n• Sell Limit: Pasang DI ATAS harga sekarang — berharap harga naik dulu menjemput order, lalu memantul TURUN.\n• Buy Stop: Pasang DI ATAS harga sekarang — jika harga berhasil menembus naik, otomatis ikut Buy.\n• Sell Stop: Pasang DI BAWAH harga sekarang — jika harga menembus turun, otomatis ikut Sell.'
          ]
        }
      ],
      validRules: [
        'Selalu isi kolom SL (Stop Loss) dan TP (Take Profit) di layar order MT5 atau segera pasang maksimal 10 detik setelah eksekusi.',
        'Periksa ulang 3 hal sebelum menekan tombol eksekusi di MT5: Pair benar (XAUUSD), Lot benar (misal 0.01), dan Arah/Jenis Order benar.',
        'Gunakan tab History di MT5 setiap selesai sesi untuk mengevaluasi transaksi dan memasukkannya ke Jurnal Trading.'
      ],
      invalidRules: [
        'Salah ketik angka lot (misal niat 0.01 malah terketik 0.10 atau 1.00) karena terburu-buru tidak mengecek kolom volume.',
        'Salah memilih Buy Stop saat sebenarnya ingin menunggu harga turun dulu (seharusnya Buy Limit).',
        'Membiarkan posisi terbuka tanpa SL dengan alasan "nanti saya pantau terus di HP" — padahal sinyal internet bisa putus atau harga melesat cepat.'
      ],
      xauScenario: {
        context: 'Harga XAU/USD saat ini berada di 2.660,00. Kamu ingin membeli (Buy) jika harga turun dulu ke area murah 2.652,00, dengan SL 2.648,00 dan TP 2.664,00.',
        steps: [
          'Buka menu New Order di MT5 pada chart XAUUSD, pastikan ukuran lot sudah aman (misal 0,01 lot).',
          'Ubah tipe dari "Market Execution" menjadi "Buy Limit" (karena ingin Buy DI BAWAH harga sekarang).',
          'Isi Price: 2652.00 · Stop Loss: 2648.00 · Take Profit: 2664.00, lalu tekan Place.',
          'Sekarang pesanan menunggu otomatis di garis 2.652,00. Kamu tidak perlu begadang atau panik mengejar harga!'
        ]
      },
      goldenRules: [
        'LIMIT = tunggu harga menjemput lebih bagus lalu memantul. STOP = ikut searah saat harga menembus.',
        'Tiga detik mengecek ulang angka Lot dan SL sebelum klik bisa menyelamatkan modal sebulan.'
      ],
      practiceCta: {
        label: 'Latihan Klik Order di Candle Replay',
        description: 'Latih pemasangan Buy/Sell, SL, dan TP di grafik gerak XAU/USD tanpa risiko kehilangan uang asli.',
        href: 'trading-practice/candle-replay.html'
      },
      quiz: [
        {
          question: 'Harga XAU/USD sekarang 2.650,00. Kamu ingin membuka posisi SELL, tetapi menunggu harga naik dulu ke 2.658,00 baru terjual otomatis. Jenis Pending Order apa yang dipakai?',
          options: [
            'Buy Limit',
            'Sell Limit',
            'Sell Stop',
            'Buy Stop'
          ],
          answerIndex: 1,
          explanation: 'Sell Limit dipasang DI ATAS harga sekarang untuk menunggu harga naik dulu lalu memantul turun.'
        },
        {
          question: 'Harga Gold sekarang 2.665,00. Kamu memasang pesanan Buy otomatis di harga 2.655,00 (di bawah harga sekarang). Jenis order apa itu?',
          options: [
            'Buy Limit',
            'Buy Stop',
            'Sell Limit',
            'Market Execution'
          ],
          answerIndex: 0,
          explanation: 'Buy Limit dipasang DI BAWAH harga saat ini agar mendapat harga beli lebih murah sebelum naik kembali.'
        },
        {
          question: 'Apa fungsi utama Stop Loss (SL) pada sebuah posisi di MT5?',
          options: [
            'Menutup posisi secara otomatis saat harga bergerak sesuai target keuntungan',
            'Membatasi kerugian maksimal secara otomatis di level harga tertentu jika analisis salah',
            'Menggandakan ukuran lot saat harga berbalik arah',
            'Menghapus biaya spread dari broker'
          ],
          answerIndex: 1,
          explanation: 'Stop Loss (SL) adalah sabuk pengaman otomatis yang membatasi kerugian maksimal sesuai rencana sebelum modal terkuras.'
        }
      ]
    },

    {
      id: 'membaca-chart-candlestick-nol',
      number: 0.5,
      code: '0.5',
      levelId: 0,
      title: 'Membaca Chart, Candlestick & Timeframe dari Nol (Versi Awam)',
      readMinutes: 4,
      diagramId: 'zero-ohlc-timeframe',
      summary: 'Belajar membaca layar grafik harga dari paling dasar: arti sumbu kanan dan bawah, 4 titik harga satu batang lilin (OHLC), warna hijau vs merah, dan hubungan antar Timeframe.',
      conceptBlocks: [
        {
          heading: 'Cara Membaca Layar Grafik & 4 Titik Harga Candlestick',
          paragraphs: [
            'Grafik (chart) hanya punya dua sumbu sederhana: sumbu kanan menunjukkan angka HARGA (semakin ke atas semakin mahal), sedangkan sumbu bawah menunjukkan WAKTU (dari kiri masa lalu ke kanan waktu sekarang).',
            'Setiap batang lilin (candlestick) meringkas 4 informasi dalam satu periode waktu: Open (harga saat periode dimulai), Close (harga saat periode berakhir), High (titik tertinggi yang sempat disentuh), dan Low (titik terendah). Jika Close lebih tinggi dari Open, lilin berwarna HIJAU (Bullish / harga naik). Jika Close lebih rendah dari Open, lilin berwarna MERAH (Bearish / harga turun).'
          ]
        },
        {
          heading: 'Memahami Timeframe (M5, M15, H1, D1) Tanpa Bingung',
          paragraphs: [
            'Timeframe adalah durasi waktu untuk membentuk SATU batang lilin. Di timeframe M5, satu batang lilin mewakili pergerakan harga selama 5 menit. Di M15 berarti 15 menit, di H1 berarti 1 jam, dan di D1 berarti 1 hari penuh.',
            'Anggap Timeframe seperti kaca pembesar: grafik H1 menunjukkan "peta jalan besar" agar kamu tahu arah perjalanan utama, sedangkan M15 dan M5 adalah "zoom detail" untuk melihat kapan waktu terbaik masuk. Ingat pecahan sederhana ini: 1 batang lilin H1 isinya sama dengan 4 batang lilin M15, atau 12 batang lilin M5!'
          ]
        }
      ],
      validRules: [
        'Biasakan melihat grafik dari Timeframe lebih besar (H1/M15) dulu untuk tahu arah besar, baru zoom ke M5 saat mencari detail.',
        'Tunggu hitungan mundur waktu lilin selesai (Close) sebelum menyimpulkan bentuk lilin tersebut hijau penuh atau merah penuh.',
        'Gunakan zoom yang nyaman di layar HP/laptop — jangan terlalu rapat hingga lilin tak terbaca, dan jangan terlalu dekat hingga lupa konteks.'
      ],
      invalidRules: [
        'Hanya melihat timeframe M1 (1 menit) sepanjang waktu sehingga panik melihat setiap goyangan harga kecil.',
        'Langsung menyimpulkan arah pasar dari satu lilin yang masih berjalan dan belum selesai ditutup.',
        'Memenuhi layar chart dengan 6–8 indikator warna-warni sampai batang lilin harganya sendiri tidak terlihat.'
      ],
      xauScenario: {
        context: 'Membaca satu batang lilin H1 XAU/USD antara pukul 15:00 sampai 16:00 WITA.',
        steps: [
          'Pukul 15:00 WITA (Open): Harga dibuka di 2.650,00.',
          'Pukul 15:15 WITA (Low): Harga sempat turun ke 2.648,50 — ini meninggalkan garis ekor (sumbu) tipis di bawah.',
          'Pukul 15:50 WITA (High): Pembeli mendorong harga naik hingga puncak 2.656,00.',
          'Pukul 16:00 WITA (Close): Harga tutup di 2.655,00. Karena Close (2.655) > Open (2.650), terbentuk 1 lilin HIJAU tebal — dan jika kamu pindah ke M15, 1 lilin H1 tadi terpecah menjadi 4 lilin kecil berurutan.'
        ]
      },
      goldenRules: [
        'Candlestick hijau = harga tutup lebih tinggi dari buka (pembeli menang); merah = tutup lebih rendah dari buka (penjual menang).',
        'Timeframe besar menunjukkan arah jalan; timeframe kecil menunjukkan titik beloknya.'
      ],
      practiceCta: {
        label: 'Latihan Baca Chart (100 Soal)',
        description: 'Asah mata membaca candlestick dan struktur XAU/USD lewat latihan interaktif mulai level Mudah.',
        href: 'trading-practice/guided-practice.html'
      },
      quiz: [
        {
          question: 'Sebuah lilin M15 dibuka (Open) di 2.654,00 dan ditutup (Close) di 2.650,00. Apa warna dan sifat lilin tersebut?',
          options: [
            'Lilin Hijau (Bullish) karena harga naik',
            'Lilin Merah (Bearish) karena harga tutup lebih rendah daripada harga buka',
            'Lilin abu-abu karena pasar sedang libur',
            'Tidak bisa ditentukan tanpa indikator MACD'
          ],
          answerIndex: 1,
          explanation: 'Karena Close (2.650,00) lebih rendah daripada Open (2.654,00), penjual dominan dan lilin berwarna Merah (Bearish).'
        },
        {
          question: 'Di dalam SATU batang lilin timeframe H1 (1 jam), terdapat berapa banyak batang lilin timeframe M15 (15 menit)?',
          options: [
            '2 batang lilin M15',
            '4 batang lilin M15',
            '12 batang lilin M15',
            '60 batang lilin M15'
          ],
          answerIndex: 1,
          explanation: '1 jam = 60 menit. Dibagi 15 menit per lilin = tepat 4 batang lilin M15 (dan 12 batang lilin M5).'
        },
        {
          question: 'Apa arti garis tipis vertikal (ekor/sumbu) yang menjulur di atas badan lilin?',
          options: [
            'Harga tertinggi yang sempat disentuh dalam periode lilin itu sebelum akhirnya turun lagi saat tutup',
            'Jumlah total uang yang dimiliki broker',
            'Tanda bahwa jaringan internet sedang lambat',
            'Harga penutupan akhir pekan'
          ],
          answerIndex: 0,
          explanation: 'Ujung garis tipis atas menunjukkan titik High (harga tertinggi sementara) sebelum lilin ditutup di posisi lebih rendah.'
        }
      ]
    },

    {
      id: 'dasar-tren-sr-rencana-14-hari',
      number: 0.6,
      code: '0.6',
      levelId: 0,
      title: 'Dasar Tren, Support–Resistance & Peta Latihan Aman 14 Hari',
      readMinutes: 5,
      diagramId: 'zero-trend-sr-roadmap',
      summary: 'Kenali 3 kondisi pasar (naik, turun, datar), konsep dasar Lantai (Support) & Atap (Resistance), waspada berita merah USD, dan ikuti peta latihan 14 hari sebelum lanjut ke Level 01 ICT.',
      conceptBlocks: [
        {
          heading: '3 Kondisi Pasar & Konsep Lantai (Support) – Atap (Resistance)',
          paragraphs: [
            'Secara sederhana, grafik harga hanya bergerak dalam 3 kondisi: Tren Naik (Uptrend — puncak dan lembah makin tinggi seperti menaiki tangga), Tren Turun (Downtrend — puncak dan lembah makin rendah seperti menuruni tangga), dan Datar (Sideways — harga bolak-balik di kotak sempit).',
            'Area bawah tempat harga sering berhenti turun lalu memantul naik disebut Support (ibarat lantai). Area atas tempat harga sering mentok lalu berbalik turun disebut Resistance (ibarat atap). Di Level 01–02 nanti, kamu akan melihat bagaimana institusi besar memanfaatkan area lantai & atap ini dengan teknik ICT!'
          ]
        },
        {
          heading: 'Waspada Berita Merah USD & Peta Latihan 14 Hari Pemula',
          paragraphs: [
            'Harga Gold (XAU/USD) sangat peka terhadap berita ekonomi Amerika Serikat berdampak tinggi (berwarna merah di kalender, seperti CPI Inflasi, NFP Tenaga Kerja, dan suku bunga FOMC). Saat berita merah dirilis, harga bisa meloncat liar $15–$40 dalam hitungan detik dan spread melebar drastis — pemula wajib MENONTON SAJA dulu saat jam berita merah.',
            'Ikuti peta aman 14 hari sebelum menyentuh uang asli besar: Hari 1–4 selesaikan Level 0 & Level 1 Academy sambil cek kalender Market Intel; Hari 5–10 latih baca chart di Backtest / Candle Replay dan selalu hitung ukuran lot dengan Kalkulator Lot; Hari 11–14 catat minimal 15 transaksi Demo/Simulasi ke Jurnal Trading. Kalau sudah rapi, kamu resmi siap naik kelas ke Level 01 ICT!'
          ]
        }
      ],
      validRules: [
        'Biasakan mengikuti arah tren utama (cari Buy saat tangga naik, cari Sell saat tangga turun) dibanding nekat melawan arus.',
        'Cek kalender berita USD di menu Market Intel setiap pagi sebelum membuka chart agar tidak terjebak lonjakan berita merah.',
        'Catat setiap hasil latihan (baik menang maupun kalah) di Jurnal Trading untuk membangun kebiasaan profesional sejak hari pertama.'
      ],
      invalidRules: [
        'Bertransaksi tepat 1–2 menit sebelum rilis berita merah CPI/NFP/FOMC hanya untuk "adu untung".',
        'Terus-menerus mencari posisi Buy di tengah tren turun tajam tanpa tanda pembalikan karena merasa "harganya sudah terlalu murah".',
        'Melompat langsung deposit besar tanpa pernah menyelesaikan latihan Demo/Simulasi dan mencatat jurnal.'
      ],
      xauScenario: {
        context: 'Rutinitas harian sehat seorang pemula XAU/USD di zona waktu WITA dalam aplikasi Amy FX Pro.',
        steps: [
          'Langkah 1 (Cek Cuaca Pasar): Buka Market Intel untuk melihat jam rilis berita merah USD malam ini (biasanya pukul 20:30 atau 22:00 WITA).',
          'Langkah 2 (Baca Peta Harga): Buka Cockpit Mapping, lihat apakah grafik H1 sedang tangga naik (Uptrend), tangga turun (Downtrend), atau datar, lalu tandai lantai Support dan atap Resistance.',
          'Langkah 3 (Hitung Risiko Dulu): Sebelum klik apa pun di Akun Demo/Simulasi, masukkan jarak SL ke Kalkulator Lot agar risiko tidak pernah melewati 1%–2%.',
          'Langkah 4 (Evaluasi): Setelah posisi selesai, catat hasilnya di Jurnal Trading — cukup 1 sampai 2 transaksi berkualitas per hari.'
        ]
      },
      goldenRules: [
        'Support adalah lantai, Resistance adalah atap — dan keduanya bisa ditembus kapan saja, itulah kenapa Stop Loss selalu wajib ada.',
        'Tidak klik transaksi saat berita merah atau pasar tidak jelas adalah bukti kamu mulai berpikir seperti trader profesional.'
      ],
      practiceCta: {
        label: 'Cek Jadwal Berita USD di Market Intel',
        description: 'Biasakan mengecek jadwal berita berdampak tinggi (merah) sebelum mulai latihan trading harian.',
        href: '../market-intel/index.html'
      },
      quiz: [
        {
          question: 'Area harga di bagian bawah tempat penurunan harga sering tertahan dan memantul naik disebut apa?',
          options: [
            'Resistance (Atap)',
            'Support (Lantai)',
            'Spread',
            'Margin Call'
          ],
          answerIndex: 1,
          explanation: 'Support adalah area lantai bawah tempat pembeli sering masuk sehingga harga tertahan atau memantul naik.'
        },
        {
          question: 'Di kalender Market Intel tertulis ada rilis berita merah USD (CPI / NFP) pukul 20:30 WITA. Apa tindakan paling aman bagi pemula?',
          options: [
            'Memasang lot 5x lebih besar tepat pukul 20:29 WITA agar cepat kaya',
            'Menahan diri tidak membuka posisi baru di sekitar jam rilis berita, cukup mengamati pergerakan harga & spread',
            'Menghapus semua Stop Loss agar tidak tersentuh',
            'Membuka Buy dan Sell bersamaan dengan lot maksimal'
          ],
          answerIndex: 1,
          explanation: 'Saat berita berdampak tinggi USD dirilis, volatilitas dan spread XAU/USD melonjak ekstrem; pemula wajib mengamati dulu hingga pasar stabil.'
        },
        {
          question: 'Apa urutan latihan paling aman bagi pemula nol sebelum memakai uang asli di Akun Standard?',
          options: [
            'Langsung deposit besar di Akun Standard lalu belajar sambil jalan',
            'Pahami dasar (Level 0) → Latihan di Demo/Replay + Kalkulator Lot → Catat di Jurnal → Lanjut bertahap lewat Akun Cent/Simulasi',
            'Meniru sinyal acak dari media sosial tanpa tahu letak SL',
            'Hanya menghafal teori tanpa pernah membuka grafik latihan'
          ],
          answerIndex: 1,
          explanation: 'Urutan bertahap dari pemahaman dasar, latihan Demo/Replay, disiplin lot, dan pencatatan jurnal melindungi modal dari kesalahan awal.'
        }
      ]
    }
  ];

  return Object.freeze({ LEVELS, LESSONS });
});
