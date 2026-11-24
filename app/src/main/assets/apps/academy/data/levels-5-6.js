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
    // =========================================================================
    // BAB 15 (BAGIAN III) — SIKLUS HARIAN ICT: POWER OF THREE (AMD) & JUDAS SWING
    // =========================================================================
    {
      id: 'siklus-amd-judas-swing',
      number: 15,
      levelId: 2,
      bookFormat: true,
      title: 'Siklus Harian ICT: Power of Three (AMD), NY Midnight Open & Judas Swing',
      subtitle: 'Membelah isi satu candle harian (Daily) menjadi 3 babak teater yang berulang nyaris setiap hari di pasar Gold — agar kamu tidak lagi menjadi korban gerakan tipuan pembukaan sesi.',
      readMinutes: 10,
      diagramId: 'amd-power-of-three',
      diagramAfterSection: 1,
      summary: 'Anatomi Power of Three (Accumulation, Manipulation/Judas Swing, Distribution), peran garis keramat NY Midnight Open (00:00 NY = 12:00 WITA EDT / 13:00 WITA EST), kronologi jam per jam XAU/USD, dan pengecualian hari ekstrem.',
      bookSections: [
        {
          number: '15.1',
          heading: 'Membelah Satu Candle Harian: Apa Itu Power of Three (AMD)?',
          paragraphs: [
            'Di Bab 14 kamu sudah belajar menentukan apakah candle harian hari ini lebih condong ditutup hijau (**Bullish Bias**) atau merah (**Bearish Bias**). Sekarang mari kita ambil kaca pembesar dan **membelah satu batang candle Daily tersebut** untuk melihat proses pembuatannya dari jam ke jam!',
            'Perhatikan sebuah candle Daily Bullish (hijau): ia memiliki harga pembukaan (*Open*), sumbu bawah (*Low*), badan naik panjang, dan harga penutupan (*Close*) dekat puncak (*High*). Pertanyaannya: **kapan sumbu bawah itu dicetak, dan kapan badan naiknya dicetak?**',
            'Dalam ajaran ICT, proses pembentukan satu candle harian itu berjalan dalam 3 babak teratur yang disebut **Power of Three (AMD)**:',
            '1. **Accumulation (Akumulasi):** Setelah hari baru dibuka, harga bergerak datar dan sempit di sekitar harga pembukaan (umumnya sepanjang sesi Asia). Di sinilah pesanan ritel menumpuk di atas dan di bawah kotak.',
            '2. **Manipulation (Manipulasi / Judas Swing):** Begitu likuiditas London atau awal New York masuk, harga sengaja didorong cepat **ke arah yang SALAH terlebih dahulu** (pada hari Bullish, harga dibanting turun dulu membentuk sumbu bawah candle Daily!). Gerakan tipuan inilah yang dinamakan **Judas Swing**.',
            '3. **Distribution (Distribusi):** Setelah Stop Loss di arah salah habis disapu dan pesanan institusi terisi penuh di harga murah, harga berbalik arah dan meluncur kencang menuju magnet DOL sepanjang hari — membentuk badan utama candle Daily.'
          ]
        },
        {
          number: '15.2',
          heading: 'Garis Keramat NY Midnight Open (00:00 NY) & Hukum Beli/Jual Harian',
          paragraphs: [
            'Untuk mengetahui apakah harga saat ini sedang berada di "zona tipuan murah" atau "zona mahal", trader ICT menggunakan satu garis horizontal paling sakral setiap hari: **New York Midnight Open (`00:00 NY`)**.',
            'Dalam waktu lokal **WITA (UTC+8)**, garis `NY Midnight Open` dicetak tepat pada pukul **`12:00 WITA` saat Musim Panas AS (EDT, Mar–Nov)** dan pukul **`13:00 WITA` saat Musim Dingin AS (EST, Nov–Mar)**. Tarik garis lurus dari harga pembukaan candle tersebut memanjang ke kanan sepanjang hari!'
          ],
          table: {
            caption: 'Aturan Emas NY Midnight Open (00:00 NY) Berdasarkan Daily Bias',
            headers: ['Daily Bias Hari Ini', 'Lokasi Ideal Fase Manipulasi (Judas)', 'Aturan Eksekusi Disiplin', 'Kesalahan Pemula yang Harus Dihindari'],
            rows: [
              ['BULLISH (Target ke Atas)', 'Harga turun **DI BAWAH** garis `NY Midnight Open` (membentuk sumbu bawah Daily)', 'Cari peluang **BUY di bawah / dekat NY Midnight Open** setelah sapuan Asia Low/SSL', 'Mengejar BUY jauh di atas Midnight Open setelah harga sudah lari +$18'],
              ['BEARISH (Target ke Bawah)', 'Harga naik **DI ATAS** garis `NY Midnight Open` (membentuk sumbu atas Daily)', 'Cari peluang **SELL di atas / dekat NY Midnight Open** setelah sapuan Asia High/BSL', 'Mengejar SELL jauh di bawah Midnight Open setelah harga sudah jatuh -$18']
            ]
          }
        },
        {
          number: '15.3',
          heading: 'Kronologi Jam per Jam Judas Swing di XAU/USD (Skenario Hari Bullish)',
          paragraphs: [
            'Perhatikan bagaimana teater 3 babak AMD ini dimainkan secara nyata di chart Gold (contoh waktu **WITA Musim Panas / EDT**):'
          ],
          exampleBox: {
            title: 'Satu Hari Bullish XAU/USD dari Pagi Sampai Malam (WITA EDT)',
            rows: [
              {
                label: '08:00 – 12:00 WITA (Babak 1 · Akumulasi Asia)',
                detail: 'Gold bergerak tenang di dalam kotak sempit `2.646,00` (Asia Low) hingga `2.652,00` (Asia High). Di pukul `12:00 WITA`, garis **NY Midnight Open** tercetak di `2.649,00`.'
              },
              {
                label: '14:15 – 15:15 WITA (Babak 2 · Manipulasi / Judas Swing London)',
                detail: 'Sesi London dibuka! Tiba-tiba 2 candle M15 merah menjatuhkan Gold menembus `2.649` (di bawah Midnight Open) hingga menyapu **Asia Low `2.646`** sampai ke `2.642,80`. Trader breakout beramai-ramai klik SELL — tepat masuk perangkap!'
              },
              {
                label: '15:30 – 22:30 WITA (Babak 3 · Distribusi ke DOL)',
                detail: 'Begitu bahan bakar bawah terambil di `2.642,80`, pembeli institusi mendorong harga balik menembus ke atas. Harga melaju menembus `NY Midnight Open 2.649`, menyapu `Asia High 2.652`, lalu menuntaskan misi hingga `PDH 2.670`!'
              }
            ]
          }
        },
        {
          number: '15.4',
          heading: 'Kejujuran Lapangan: Kapan Pola AMD TIDAK Berjalan Rapi?',
          paragraphs: [
            'Buku trading yang jujur wajib memberitahumu pengecualian di dunia nyata agar kamu tidak kaku seperti robot. Pola `Akumulasi → Judas Swing → Distribusi` memang muncul pada mayoritas hari normal, **tetapi tidak 100% setiap hari!**',
            'Ada dua kondisi di mana Judas Swing bisa sangat pendek atau bahkan nyaris tidak terlihat: pertama, pada **hari ekspansi tren ekstrem** ketika sentimen makro sangat kuat sehingga Gold sudah terbang satu arah sejak Sesi Asia; kedua, pada **hari menjelang berita besar seperti FOMC / NFP** ketika harga sengaja macet di dalam kotak sampai jam rilis berita malam (manipulasi baru terjadi tepat saat berita rilis!). Di hari seperti itu, jangan memaksakan teori — ikuti fakta struktur dan jam aktif di **Bab 16**.'
          ],
          callout: {
            tone: 'info',
            title: 'Cek Mandiri di Chart Historis',
            body: 'Tarik garis vertikal tepat di `00:00 NY` (`12:00 WITA` EDT / `13:00 WITA` EST) pada 10 hari terakhir chart M15 XAU/USD. Kamu akan melihat sendiri betapa seringnya titik terendah hari Bullish (atau tertinggi hari Bearish) terbentuk tepat pada sesi London/awal NY di sisi seberang garis Midnight Open!'
          }
        }
      ],
      keyTakeaways: [
        'Setiap candle harian normal tersusun dari 3 babak **Power of Three (AMD)**: **Accumulation** (Asia) → **Manipulation / Judas Swing** (gerak tipuan awal sesi) → **Distribution** (ekspansi arah asli).',
        '**NY Midnight Open (`00:00 NY`)** = **`12:00 WITA` (EDT)** atau **`13:00 WITA` (EST)** adalah kompas harga murah/mahal harian.',
        'Aturan emas: pada hari **Bullish**, cari BUY **di bawah** NY Midnight Open; pada hari **Bearish**, cari SELL **di atas** NY Midnight Open.',
        'Jangan kaku saat hari tren nonstop atau pra-FOMC/NFP — jika Judas Swing belum muncul di London, sering kali ia menunggu sesi NY.'
      ],
      bridgeNext: 'Sekarang kamu tahu *bagaimana* skenario harian AMD dimainkan di sekitar garis NY Midnight Open. Pertanyaan taktis berikutnya yang sangat menentukan ketepatan jam dudukmu di depan layar adalah: **tepat pada jam dan menit WITA berapa saja institusi menekan tombol eksekusi terbesarnya?** Mari kita buka jadwal lengkapnya di **Bab 16: Waktu Institusional: Killzone, Silver Bullet & Macro 20 Menit (Panduan WITA)**.',
      conceptBlocks: [
        {
          heading: 'Power of Three (AMD), NY Midnight Open & Judas Swing',
          paragraphs: [
            'Satu candle harian umumnya melewati tiga fase: Akumulasi (Asia), Manipulasi/Judas Swing (gerakan tipuan awal London/NY), dan Distribusi (ekspansi arah asli).',
            'NY Midnight Open (00:00 NY = 12:00 WITA EDT / 13:00 WITA EST) memisahkan zona murah dan mahal harian: Buy di bawah Midnight Open pada hari Bullish, Sell di atas Midnight Open pada hari Bearish.'
          ]
        }
      ],
      mappingSteps: [
        'Tarik garis horizontal NY Midnight Open tepat pukul 00:00 NY (12:00 WITA EDT / 13:00 WITA EST).',
        'Amati kotak Akumulasi Asia (08:00–12:00 WITA EDT / 09:00–13:00 WITA EST) dan arah Daily Bias hari itu.',
        'Tunggu fase Manipulasi (Judas Swing) membawa harga melewati Midnight Open & menyapu ujung Asia ke arah berlawanan bias sebelum mencari tanda Distribusi.'
      ],
      decisionTree: [
        {
          condition: 'Daily Bias Bullish dan harga baru saja turun menembus NY Midnight Open serta menyapu Asia Low di awal London.',
          action: 'Fase Manipulasi (Judas Swing) kemungkinan sedang selesai — siapkan diri memantau tanda balik arah untuk menumpang Distribusi ke atas.'
        },
        {
          condition: 'Daily Bias Bullish, tetapi harga sudah terbang +$22 di atas NY Midnight Open sejak awal sesi tanpa koreksi.',
          action: 'Hindari mengejar di puncak (Premium harian); tunggu retracement sehat atau sesi NY berikutnya.'
        }
      ],
      failedCase: {
        context: 'Pada hari Bullish, trader langsung klik SELL saat melihat 2 candle merah pembukaan London menembus ke bawah Asia Low.',
        whyFailed: 'Dorongan turun awal sesi itu adalah Judas Swing (babak Manipulasi) untuk mengumpulkan likuiditas di bawah NY Midnight Open sebelum Distribusi naik dimulai.'
      },
      validRules: [
        'Gunakan NY Midnight Open sebagai patokan utama: Buy di bawah Midnight Open pada hari Bullish, Sell di atas Midnight Open pada hari Bearish.',
        'Waspadai gerakan tajam pertama saat pembukaan London sebagai potensi Judas Swing.'
      ],
      invalidRules: [
        'Mengejar breakout awal pembukaan sesi ke arah berlawanan Daily Bias.',
        'Memaksakan pola AMD di hari pra-FOMC yang memang bergerak datar sampai malam.'
      ],
      xauScenario: {
        context: 'Hari Bullish Gold (EDT): NY Midnight Open 2.649, Asia Range 2.646–2.652.',
        steps: [
          'Pukul 14:30 WITA Judas Swing turun ke 2.642,80 (di bawah Midnight Open & menyapu Asia Low).',
          'Setelah konfirmasi balik arah, Distribusi membawa harga menembus 2.649 → 2.652 → PDH 2.670.'
        ]
      },
      goldenRules: [
        'Gerakan pertama pembukaan sesi sering kali adalah panggung tipuan (Judas Swing); uang besar baru meluncur setelah umpan ritel selesai disapu.'
      ],
      practiceCta: {
        label: 'Latih Deteksi Judas Swing di 100 Kasus ICT',
        description: 'Uji matamu membedakan gerakan tipuan Judas Swing dari kelanjutan tren pada skenario chart Gold.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Apa urutan 3 babak yang membentuk satu candle harian normal dalam konsep **ICT Power of Three (AMD)**?',
          options: [
            'Distribution → Manipulation → Accumulation',
            'Accumulation (Asia) → Manipulation / Judas Swing (awal sesi) → Distribution (ekspansi arah asli)',
            'Breakout → Averaging → Cut Loss',
            'Sideways → Rollover → Akhir Pekan'
          ],
          answerIndex: 1,
          explanation: 'Power of Three berjalan berurutan: pasar mengakumulasi order, memanipulasi ke arah salah (Judas Swing), lalu mendistribusikan harga ke target DOL.'
        },
        {
          question: 'Pukul berapakah garis **NY Midnight Open (`00:00 NY`)** terbentuk dalam standar waktu **WITA (UTC+8)**?',
          options: [
            '00:00 WITA sepanjang tahun',
            '**12:00 WITA** saat Musim Panas AS (EDT, +12 jam) dan **13:00 WITA** saat Musim Dingin AS (EST, +13 jam)',
            '06:00 WITA saat EDT dan 07:00 WITA saat EST',
            '20:00 WITA setiap hari'
          ],
          answerIndex: 1,
          explanation: '00:00 NY ditambah 12 jam (EDT) = 12:00 WITA; ditambah 13 jam (EST) = 13:00 WITA.'
        },
        {
          question: 'Daily Bias XAU/USD hari ini adalah **BEARISH**. Menurut hukum NY Midnight Open, di area manakah lokasi paling ideal untuk mencari peluang **SELL**?',
          options: [
            'Jauh di bawah NY Midnight Open setelah harga sudah anjlok -$25',
            'Di **atas** garis NY Midnight Open setelah terjadi manipulasi naik (Judas Swing) menyapu likuiditas atas',
            'Tepat di dasar terendah pekan lalu',
            'Di jam rollover ketika spread melebar'
          ],
          answerIndex: 1,
          explanation: 'Pada hari Bearish, menjual di atas NY Midnight Open menempatkanmu di zona mahal harian tepat di ujung sumbu atas (Judas Swing).'
        },
        {
          question: 'Pada hari menjelang rilis suku bunga besar seperti **FOMC** atau **NFP**, mengapa kita tidak boleh memaksakan pola AMD pasti selesai di pagi/siang hari?',
          options: [
            'Karena pasar tutup total di hari berita besar',
            'Karena institusi sering menahan harga datar di dalam kotak sampai jam rilis berita malam, sehingga fase manipulasi & distribusi baru meledak saat sesi NY',
            'Karena NY Midnight Open tidak berlaku di bulan genap',
            'Karena Gold berhenti mengikuti USD saat berita besar'
          ],
          answerIndex: 1,
          explanation: 'Pada hari katalis makro besar, pasar kerap tertahan dalam konsolidasi panjang hingga rilis berita memicu repricing dan distribusi.'
        }
      ]
    },

    // =========================================================================
    // BAB 16 (BAGIAN III) — WAKTU INSTITUSIONAL: KILLZONE, SILVER BULLET & MACRO WITA
    // =========================================================================
    {
      id: 'jadwal-killzone-wita-silver-bullet',
      number: 16,
      levelId: 2,
      bookFormat: true,
      title: 'Waktu Institusional: Killzone, Silver Bullet & Macro 20 Menit (Panduan WITA)',
      subtitle: 'Memahami prinsip "Time > Price" dalam ICT: jadwal presisi Killzone, jendela 1 jam Silver Bullet, dan jendela algoritma 20 menit (ICT Macros) dalam konversi eksak WITA EDT & EST.',
      readMinutes: 11,
      diagramId: 'killzones-wita-timeline',
      diagramAfterSection: 1,
      summary: 'Prinsip Time > Price, jadwal lengkap Killzone ICT, Silver Bullet 60 menit (London, NY AM, NY PM), dan ICT Macros 20 menit dalam konversi eksak WITA EDT (+12 jam) & EST (+13 jam), serta cara memilih 1 sesi fokus.',
      bookSections: [
        {
          number: '16.1',
          heading: 'Mengapa ICT Mengajarkan "Time > Price" (Waktu Lebih Penting dari Harga)?',
          paragraphs: [
            'Di Bab 06 kita sudah mengenal tiga sesi besar dunia (Asia, London, New York) secara umum. Sekarang kita masuk jauh lebih tajam ke **jam kerja spesifik algoritma institusional** yang membedakan trader ICT dari trader chart biasa.',
            'Salah satu prinsip paling terkenal dari Michael Huddleston (ICT) berbunyi: **"Time first, then Price"** — *cek WAKTU-nya dulu, baru lihat bentuk chart-nya*. Mengapa demikian? Coba bayangkan sebuah pola entry sempurna yang muncul pukul `11:30 WITA` (jam makan siang sepi) atau `18:45 WITA` (jeda sebelum New York). Meski bentuknya cantik, harga sering mondar-mandir tidak jelas selama 2 jam lalu perlahan memakan Stop Loss-mu.',
            'Bandingkan ketika pola yang sama persis muncul di dalam **Killzone** atau **Silver Bullet**: karena ribuan order bank dan dana institusi aktif mengeksekusi pada jam tersebut, harga langsung melesat menuju DOL dalam 15–45 menit! Artinya, **menunggu jam yang tepat secara otomatis menyaring separuh lebih setup palsu tanpa tambahan satu pun indikator.**'
          ]
        },
        {
          number: '16.2',
          heading: 'Tabel Induk Waktu ICT Lengkap: Killzone & Silver Bullet (NY → WITA)',
          paragraphs: [
            'Simpan tabel resmi berikut sebagai patokan harianmu. Seluruh jam telah dikonversi eksak dari waktu **New York** ke **WITA (UTC+8)** baik untuk **Musim Panas AS (`EDT`, Mar–Nov, +12 jam)** maupun **Musim Dingin AS (`EST`, Nov–Mar, +13 jam)**:'
          ],
          table: {
            caption: 'Jadwal Lengkap Killzone & Silver Bullet ICT untuk XAU/USD (NY ↔ WITA)',
            headers: ['Jendela Waktu ICT', 'Waktu New York', 'WITA Musim Panas (EDT · Mar–Nov)', 'WITA Musim Dingin (EST · Nov–Mar)', 'Karakter & Fungsi Utama'],
            rows: [
              ['Asia Range', '`20:00 – 00:00 NY`', '`08:00 – 12:00 WITA`', '`09:00 – 13:00 WITA`', 'Fase Akumulasi; tandai Asia High/Low, hindari overtrade di tengah kotak'],
              ['London Killzone', '`02:00 – 05:00 NY`', '`14:00 – 17:00 WITA`', '`15:00 – 18:00 WITA`', 'Jendela utama Judas Swing & pembentukan High/Low harian Gold'],
              ['London Silver Bullet', '`03:00 – 04:00 NY`', '`15:00 – 16:00 WITA`', '`16:00 – 17:00 WITA`', 'Jendela fokus 60 menit mencari 1 dorongan bersih pasca pembukaan London'],
              ['NY AM Killzone', '`07:00 – 10:00 NY` (ext `11:00`)', '`19:00 – 22:00` (ext `23:00`) WITA', '`20:00 – 23:00` (ext `00:00`) WITA', 'Volume puncak harian, rilis berita USD (`08:30 NY`), & ekspansi terbesar'],
              ['NY AM Silver Bullet', '`10:00 – 11:00 NY`', '`22:00 – 23:00 WITA`', '`23:00 – 00:00 WITA`', 'Favorit scalper! Terjadi setelah debu berita `08:30` & buka saham `09:30 NY` mereda'],
              ['London Close', '`10:00 – 12:00 NY`', '`22:00 – 00:00 WITA`', '`23:00 – 01:00 WITA`', 'Bank Eropa menutup buku harian; sering terjadi *profit-taking* atau koreksi balik'],
              ['NY PM Silver Bullet', '`14:00 – 15:00 NY`', '`02:00 – 03:00 WITA` (dini hari)', '`03:00 – 04:00 WITA` (dini hari)', 'Sesi sore NY; kurang ideal untuk trader WITA kecuali berjaga malam']
            ]
          }
        },
        {
          number: '16.3',
          heading: 'Mengenal ICT Macros: Jendela Algoritma 20 Menit (xx:50 – xx:10)',
          paragraphs: [
            'Di dalam Killzone yang berdurasi 3 jam, algoritma penentuan harga tidak selalu meledak terus-menerus setiap menit. ICT menemukan bahwa lonjakan repricing dan sapuan likuiditas paling tajam sangat sering terjadi pada **jendela sempit 20 menit** — terutama mulai **10 menit sebelum pergantian jam hingga 10 menit sesudahnya (`xx:50 – xx:10 NY`)** serta momen pembukaan berita/bursa saham AS:',
            '• **Macro London Utama:** `02:33–03:00 NY` (`14:33–15:00 WITA` EDT) dan `04:03–04:23 NY` (`16:03–16:23 WITA` EDT).',
            '• **Macro NY AM Paling Tajam:** `08:50–09:10 NY` (`20:50–21:10 WITA` EDT — pasca berita 08:30 NY), **`09:50–10:10 NY` (`21:50–22:10 WITA` EDT — pemicu utama NY AM Silver Bullet!)**, dan `10:50–11:10 NY` (`22:50–23:10 WITA` EDT).',
            'Bagaimana cara memakai Macro tanpa pusing? **Jangan memaksa entry hanya karena jam menunjukkan `xx:50`!** Gunakan Macro sebagai **alarm kewaspadaan**: jika harga sedang mendekati area tunggu penting tepat saat Macro `21:50–22:10 WITA` dimulai, itulah momen paling sering sapuan cepat terjadi dan langsung diikuti peluncuran bersih menuju DOL.'
          ]
        },
        {
          number: '16.4',
          heading: 'Strategi Pilih 1 Sesi Fokus untuk Trader Indonesia (WITA)',
          paragraphs: [
            'Banyak pemula hancur bukan karena tidak tahu ilmunya, melainkan karena **kelelahan mental (*decision fatigue*)**: memelototi chart dari jam 08:00 pagi sampai jam 01:00 malam! Otak yang lelah pasti berakhir FOMO dan melanggar aturan.',
            'Pilih **SATU jendela utama** (maksimal dua) yang paling cocok dengan jadwal kerja atau kuliahmu di WITA:'
          ],
          exampleBox: {
            title: '2 Jadwal Profesional Paling Sehat untuk Trader WITA',
            rows: [
              {
                label: 'Opsi A — Fokus London Killzone (14:00–17:00 WITA EDT / 15:00–18:00 EST)',
                detail: 'Cocok jika kamu luang di sore hari. Pantau sapuan Asia High/Low dan ambil 1 setup bersih sebelum makan malam. Setelah jam 17:00/18:00 WITA, tutup chart dan nikmati malammu.'
              },
              {
                label: 'Opsi B — Fokus NY AM & Silver Bullet (20:30–23:00 WITA EDT / 21:30–00:00 EST)',
                detail: 'Paling ideal bagi pekerja kantoran/mahasiswa! Biarkan berita `20:30` (EDT) mereda dulu, cek arah sesi London, lalu fokus penuh hanya di jendela **21:30–23:00 WITA** (termasuk Macro `21:50–22:10` & Silver Bullet `22:00–23:00`).'
              }
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Jam Terlarang ("Dead Zone") yang Wajib Kamu Hindari',
            body: 'Hindari membuka posisi baru di **jeda London Lunch (`17:30–19:00 WITA` EDT)** karena volume menyusut menjadi gerakan bolak-balik acak, dan **wajib tutup layar saat Rollover Harian (`04:00–07:00 WITA`)** ketika spread Gold melebar tidak wajar.'
          }
        }
      ],
      keyTakeaways: [
        'Prinsip **Time > Price**: setup terbaik hanya dicari di dalam jendela likuiditas puncak (**Killzone**, **Silver Bullet**, dan **Macro 20 menit**).',
        'Dua jendela paling tajam & sehat untuk trader WITA: **London Killzone** (`14:00–17:00 WITA` EDT / `15:00–18:00` EST) dan **NY AM Silver Bullet** (`22:00–23:00 WITA` EDT / `23:00–00:00` EST).',
        '**ICT Macro 20 menit (`xx:50 – xx:10`)** — terutama `09:50–10:10 NY` (`21:50–22:10 WITA` EDT) — berfungsi sebagai alarm momen sapuan & peluncuran algoritma.',
        'Cukup pilih **1 sesi fokus** per hari (2–3 jam maksimal) daripada memelototi chart 14 jam hingga kelelahan dan overtrading.'
      ],
      bridgeNext: 'Kamu sekarang sudah memegang peta waktu institusional paling presisi hingga hitungan menit (`Killzone`, `Silver Bullet`, dan `Macro`). Namun ada satu faktor eksternal di dalam sesi NY AM yang bisa mengacaukan semua setup teknikal dalam 3 detik jika kamu tidak memasang perisai pelindung: **rilis berita ekonomi raksasa AS!** Mari kita tuntaskan Bagian III di **Bab 17: Berita Ekonomi USD (CPI, NFP, FOMC) & Protokol News Lock**.',
      conceptBlocks: [
        {
          heading: 'Killzone, Silver Bullet & ICT Macros 20 Menit (Standar WITA)',
          paragraphs: [
            'Time > Price: eksekusi paling cepat dan bersih terjadi di dalam London Killzone (02:00–05:00 NY), NY AM Killzone (07:00–10:00 NY), dan jendela 60 menit Silver Bullet (03:00–04:00 NY & 10:00–11:00 NY).',
            'ICT Macros 20 menit (seperti 09:50–10:10 NY) menandai jendela sempit saat algoritma sering melakukan sapuan likuiditas dan ekspansi menuju DOL.'
          ]
        }
      ],
      mappingSteps: [
        'Pastikan apakah Amerika Serikat sedang di Musim Panas (EDT, NY +12 jam) atau Musim Dingin (EST, NY +13 jam).',
        'Tentukan 1 sesi fokus harian (London Killzone atau NY AM + Silver Bullet) dan tutup chart di luar jam tersebut.',
        'Perhatikan jendela Macro 20 menit (mis. 09:50–10:10 NY) sebagai momen kewaspadaan ketika harga sudah tiba di area pantau.'
      ],
      decisionTree: [
        {
          condition: 'Muncul pola menarik pukul 18:15 WITA (EDT) pada jam sepi jeda London Lunch sebelum NY buka.',
          action: 'Abaikan / Skip — tunggu sesi NY AM Killzone & berita 20:30 selesai agar tidak terjebak chop.'
        },
        {
          condition: 'Pukul 22:05 WITA (EDT · NY AM Silver Bullet) harga menyapu low M5 pasca berita 20:30 sudah tenang dan searah DOL.',
          action: 'Kondisi waktu A+ terpenuhi — pantau konfirmasi entry sesuai rencana risiko.'
        }
      ],
      failedCase: {
        context: 'Trader memaksakan 4 transaksi di siang bolong (11:30–13:30 WITA) karena bosan menunggu sesi London.',
        whyFailed: 'Di luar Killzone, volatilitas sempit dan acak membuat SL tersentuh berulang kali sebelum pergerakan asli sesi London dimulai.'
      },
      validRules: [
        'Fokus pada 1 jendela Killzone atau Silver Bullet yang tetap setiap hari.',
        'Selalu sesuaikan jadwal WITA dengan pergeseran DST Amerika Serikat (+12 jam EDT vs +13 jam EST).'
      ],
      invalidRules: [
        'Memelototi chart 14 jam sehari dan memaksa entry di jam mati (Dead Zone).',
        'Masuk entry semata-mata karena jam menunjukkan Macro tanpa struktur atau DOL yang jelas.'
      ],
      xauScenario: {
        context: 'Jadwal fokus NY AM Silver Bullet (EDT): berita 20:30 WITA selesai, bursa saham AS buka 21:30 WITA.',
        steps: [
          'Pukul 21:50–22:10 WITA (Macro 09:50–10:10 NY): harga melakukan pullback menyapu swing low M5.',
          'Pukul 22:15 WITA (di dalam Silver Bullet 22:00–23:00 WITA): konfirmasi arah muncul menuju DOL harian.'
        ]
      },
      goldenRules: [
        'Dua jam penuh fokus di dalam Killzone selalu mengalahkan dua belas jam kelelahan di depan layar.'
      ],
      practiceCta: {
        label: 'Pantau Status Killzone Live di Cockpit Mapping',
        description: 'Cek otomatis apakah jam sekarang sedang berada di Asia, London KZ, NY AM KZ, atau Dead Zone langsung di header Mapping.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Jam berapakah jendela **NY AM Silver Bullet (`10:00–11:00 NY`)** jika dikonversi secara eksak ke waktu **WITA (UTC+8)**?',
          options: [
            '10:00–11:00 WITA sepanjang tahun',
            '**22:00–23:00 WITA** saat Musim Panas (EDT, +12 jam) dan **23:00–00:00 WITA** saat Musim Dingin (EST, +13 jam)',
            '14:00–15:00 WITA saat EDT',
            '08:00–09:00 WITA setiap pagi'
          ],
          answerIndex: 1,
          explanation: '10:00–11:00 NY + 12 jam (EDT) = 22:00–23:00 WITA; + 13 jam (EST) = 23:00–00:00 WITA.'
        },
        {
          question: 'Mengapa jendela **NY AM Silver Bullet (`10:00–11:00 NY`)** menjadi salah satu waktu favorit scalper XAU/USD?',
          options: [
            'Karena spread selalu 0,00 di seluruh dunia',
            'Karena terjadi tepat setelah volatilitas liar berita `08:30 NY` dan pembukaan bursa saham AS `09:30 NY` mereda, sehingga arah ekspansi jauh lebih bersih',
            'Karena pasar berhenti bergerak sehingga bebas risiko',
            'Karena broker melarang kerugian pada jam tersebut'
          ],
          answerIndex: 1,
          explanation: 'Setelah guncangan awal berita 08:30 NY dan pembukaan NYSE 09:30 NY selesai, arah dominan institusi biasanya sudah jelas di jam 10:00–11:00 NY.'
        },
        {
          question: 'Bagaimana cara paling bijak menggunakan **ICT Macro 20 Menit** (seperti `09:50–10:10 NY` / `21:50–22:10 WITA` EDT)?',
          options: [
            'Asal klik BUY atau SELL setiap kali jam menunjukkan menit `:50` tanpa melihat struktur',
            'Sebagai alarm kewaspadaan waktu saat harga sedang mendekati area pantau dan searah DOL, karena algoritma sering memicu sapuan/peluncuran di jendela 20 menit tersebut',
            'Untuk menggandakan ukuran lot menjadi 5% risiko',
            'Sebagai pengingat untuk trading di akhir pekan'
          ],
          answerIndex: 1,
          explanation: 'Macro adalah jendela penguat waktu (timing catalyst) yang digabungkan dengan DOL dan struktur — bukan sinyal tekan tombol buta.'
        },
        {
          question: 'Mengapa prinsip ICT menempatkan **"Time > Price"** dan menyarankan cukup fokus pada 1 sesi utama per hari?',
          options: [
            'Agar trader tidak kelelahan (*decision fatigue*) dan terhindar dari setup palsu yang macet di luar jam likuiditas puncak (Dead Zone)',
            'Karena chart harga tidak ada gunanya sama sekali',
            'Karena akun MT5 otomatis logout setelah 3 jam',
            'Karena emas hanya diperdagangkan 1 jam per minggu'
          ],
          answerIndex: 0,
          explanation: 'Fokus 2–3 jam pada jendela Killzone/Silver Bullet menjaga kualitas keputusan dan menyaring mayoritas sinyal palsu di jam sepi.'
        }
      ]
    },

    // =========================================================================
    // BAB 17 (BAGIAN III) — BERITA EKONOMI USD & PROTOKOL NEWS LOCK
    // =========================================================================
    {
      id: 'protokol-news-lock-usd',
      number: 17,
      levelId: 2,
      bookFormat: true,
      title: 'Berita Ekonomi USD (CPI, NFP, FOMC) & Protokol News Lock',
      subtitle: 'Memahami mengapa 1 menit rilis data ekonomi AS bisa melompati Stop Loss dan menyapu dua arah sekaligus, serta cara profesional melindungi modal sekaligus memanen tren bersih sesudahnya.',
      readMinutes: 9,
      diagramId: 'news-lock-shield',
      diagramAfterSection: 2,
      summary: 'Pengaruh data ekonomi AS terhadap XAU/USD, jadwal baku 4 berita Red Folder USD (CPI, NFP, FOMC, Core PCE/Jobless Claims) dalam WITA EDT/EST, bahaya spread spike/slippage/whipsaw, dan Protokol News Lock -15m s.d. +30m.',
      bookSections: [
        {
          number: '17.1',
          heading: 'Mengapa Berita Ekonomi AS Membuat Gold Melonjak $15–$40 dalam Hitungan Detik?',
          paragraphs: [
            'Ingat lagi pelajaran pertama kita di Bab 01: kode **XAU/USD** adalah perbandingan harga emas terhadap **Dolar Amerika Serikat (`USD`)**. Artinya, setiap kali pemerintah AS atau bank sentral AS (**The Federal Reserve / The Fed**) merilis data ekonomi besar yang mengubah ekspektasi suku bunga Dolar, nilai USD langsung dihitung ulang oleh ribuan komputer bank di seluruh dunia dalam waktu kurang dari 1 detik!',
            'Secara sederhana: data ekonomi AS yang **terlalu panas / inflasi tinggi** cenderung membuat The Fed menahan suku bunga tinggi → **USD menguat** → **XAU/USD sering tertekan turun**. Sebaliknya, data ekonomi AS yang **melemah / suku bunga dipangkas** cenderung membuat **USD melemah** → **XAU/USD sering melesat naik**. Namun, **jangan pernah menebak arah dari angka beritanya saja!** Sering kali data terlihat "buruk untuk emas", eh harga Gold malah dibanting turun `$10` selama 30 detik lalu terbang naik `+$25` karena pasar sudah memperhitungkannya sebelumnya.'
          ]
        },
        {
          number: '17.2',
          heading: 'Empat Berita "Folder Merah" (High Impact USD) Paling Berbahaya di Gold',
          paragraphs: [
            'Kamu tidak perlu menghafal 50 berita ekonomi dari seluruh dunia. Untuk XAU/USD, cukup catat **4 katalis Folder Merah USD** berikut di kalender setiap awal pekan:'
          ],
          table: {
            caption: '4 Katalis Berita Merah USD Paling Berpengaruh pada XAU/USD (WITA)',
            headers: ['Nama Berita', 'Apa yang Diukur?', 'Jam Rilis Baku NY', 'Jam WITA (EDT / EST)', 'Karakter Gerak di Gold'],
            rows: [
              ['US CPI (Inflasi)', 'Kenaikan harga barang & jasa konsumen AS', '`08:30 NY` (pertengahan bulan)', '`20:30` (EDT) / `21:30` (EST)', 'Sangat eksplosif; sering menyapu dua arah `$15–$30` dalam 5 menit pertama'],
              ['US NFP (Tenaga Kerja)', 'Jumlah lapangan kerja baru & tingkat pengangguran AS', '`08:30 NY` (Jumat pekan ke-1)', '`20:30` (EDT) / `21:30` (EST)', 'Raja volatilitas bulanan; whipsaw ganas & spread spike ekstrem'],
              ['FOMC & Konferensi Pers', 'Keputusan suku bunga The Fed & pidato Ketua Fed', '`14:00 & 14:30 NY`', '`02:00 & 02:30` (EDT) / `03:00 & 03:30` (EST)', 'Gelombang ganda: lonjakan 1 saat rilis angka (`14:00`), pembalikan 2 saat pidato (`14:30`)'],
              ['Core PCE / Jobless Claims / ISM', 'Indikator inflasi favorit Fed, klaim pengangguran, & aktivitas bisnis', '`08:30` atau `10:00 NY`', '`20:30/22:00` (EDT) / `21:30/23:00` (EST)', 'Katalis mingguan/bulanan yang kerap memicu Judas Swing di awal sesi NY']
            ]
          }
        },
        {
          number: '17.3',
          heading: 'Tiga Monster di Detik Rilis Berita: Spread Spike, Slippage & Whipsaw',
          paragraphs: [
            'Banyak pemula berpikir: *"Ah, kan aku sudah pasang Stop Loss $4, jadi aman saja tetap buka posisi sebelum NFP!"* **Itu adalah salah satu mitos paling mematikan di trading.** Saat detik rilis berita besar, penyedia likuiditas bank sementara menarik pesanan mereka sehingga terjadi tiga hal sekaligus:',
            '1. **Spread Spike:** Spread Gold yang biasanya `$0,25` (2,5 pips) bisa tiba-tiba melompat menjadi **`$2,00 – $5,00` (20–50 pips)** sehingga posisimu bisa terkena SL meski harga chart belum menyentuhnya.',
            '2. **Slippage (Lompatan Harga Eksekusi):** Kamu memasang SL di `2.650,00` dengan risiko rencana `$10`. Tetapi karena harga langsung melompat dari `2.654` ke `2.642` tanpa antrean di tengah, broker terpaksa menutup posisimu di `2.642,00` — **kerugianmu membengkak lebih dari 2–3 kali lipat** dari rencana awal!',
            '3. **Whipsaw Dua Arah:** Strategi pemula memasang perangkap `Buy Stop` di atas dan `Sell Stop` di bawah sebelum berita nyaris selalu berakhir tragis: harga menyambar ke atas mengaktifkan Buy Stop, lalu 5 detik kemudian terjun mengaktifkan Sell Stop sambil memakan SL Buy — dua-duanya rugi sekaligus!'
          ]
        },
        {
          number: '17.4',
          heading: 'Protokol Keras News Lock (-15m s.d. +30m) & Cara Panen Pasca-Berita',
          paragraphs: [
            'Di seluruh ekosistem Amy FX Pro (baik di Cockpit Mapping maupun Market Intel), kita menerapkan satu aturan perlindungan besi: **Protokol News Lock**.'
          ],
          exampleBox: {
            title: 'SOP 3 Fase Menghadapi Berita Merah USD (Contoh CPI 20:30 WITA EDT)',
            rows: [
              {
                label: 'Fase 1 — 15 Menit Sebelum Rilis (20:15 WITA · NEWS LOCK AKTIF)',
                detail: '**Dilarang keras membuka posisi baru.** Jika kamu sudah memiliki posisi aktif yang sedang profit dari sesi London, amankan sebagian besar profit (`Partial 70%–100%`) atau tutup penuh — jangan mempertaruhkan profit pasti ke lemparan koin berita.'
              },
              {
                label: 'Fase 2 — Detik Rilis s.d. +30 Menit (20:30 – 21:00 WITA · TONTON SAJA)',
                detail: 'Biarkan para penjudi berita saling membantai di tengah whipsaw dan spread spike. Tugas kita hanya mengamati: **kolam likuiditas mana (`London High/Low`, `PDH/PDL`) yang baru saja disapu oleh berita?**'
              },
              {
                label: 'Fase 3 — Sesudah +30 Menit (21:00+ WITA · PANEN TREN BERSIH)',
                detail: 'Spread kembali normal (`$0,20–$0,35`), debu whipsaw sudah hilang, dan berita baru saja menciptakan jejak dorongan institusi yang sangat jernih! Di sinilah (termasuk menuju NY AM Silver Bullet `22:00 WITA`) trader ICT memanen pergerakan paling bersih hari itu.'
              }
            ]
          },
          callout: {
            tone: 'info',
            title: 'Selamat — Kamu Baru Saja Menuntaskan Bagian III (Kompas Arah)!',
            body: 'Lihat apa yang sudah kamu kuasai sampai Bab 17: kamu bukan cuma bisa membaca struktur & likuiditas (Bagian II), sekarang kamu juga tahu **ke mana magnet DOL menarik harga (Bab 13)**, **Daily Bias + garis batalnya (Bab 14)**, **siklus AMD & NY Midnight Open (Bab 15)**, **jam emas Killzone/Silver Bullet/Macro WITA (Bab 16)**, dan **perisai News Lock (Bab 17)**. Artinya, kompas arah dan waktumu sudah 100% lengkap — sekarang saatnya membangun **Mesin Zona Entry ICT** di Bagian IV!'
          }
        }
      ],
      keyTakeaways: [
        'Empat berita merah USD wajib dicek di Kalender Ekonomi setiap pagi: **US CPI**, **US NFP**, **FOMC**, dan **Core PCE / Jobless Claims / ISM**.',
        'Jangan menebak angka rilis atau memasang jebakan `Buy Stop + Sell Stop`: detik rilis rawan **Spread Spike**, **Slippage** (rugi melampaui SL rencana), dan **Whipsaw** dua arah.',
        'Patuhi **Protokol News Lock**: **0 entry baru mulai -15 menit sebelum hingga +30 menit sesudah** rilis berita High Impact USD (khusus FOMC tunggu sampai konferensi pers usai).',
        'Berita bukan musuh — berita adalah mesin pembuat likuiditas. Tunggu 15–30 menit sampai debu mereda dan spread normal, lalu ikuti arah bersih pasca-berita.'
      ],
      bridgeNext: 'Selamat menyelesaikan seluruh **Bagian III: Kompas Arah (Bab 13–17)**! Sekarang kamu sudah tahu *ke mana* harga mau pergi (`DOL & Daily Bias`) dan *kapan* saat terbaik duduk di depan layar (`AMD, Killzone, Silver Bullet, News Lock`). Pertanyaan pamungkas yang tinggal dijawab adalah: **di titik harga mana tepatnya kita meletakkan Entry agar risikonya sekecil mungkin dan presisinya setajam sniper?** Mari kita masuki jantung teknikal ICT di **Bagian IV**, dimulai dari **Bab 18: Displacement: Mengenali Jejak Dorongan Institusi yang Sah**.',
      conceptBlocks: [
        {
          heading: 'Protokol News Lock (-15m s.d. +30m) & Katalis Merah USD',
          paragraphs: [
            'Berita High Impact USD (CPI, NFP, FOMC, Core PCE) memicu spread spike, slippage, dan whipsaw dua arah yang bisa menembus Stop Loss jauh melampaui rencana risiko.',
            'Terapkan News Lock (-15 menit hingga +30 menit rilis berita), amankan posisi profit pra-berita, dan manfaatkan tren bersih yang terbentuk setelah debu berita mereda.'
          ]
        }
      ],
      mappingSteps: [
        'Cek tab Kalender Ekonomi di modul Market Intel setiap pagi sebelum menyusun rencana sesi.',
        'Tandai jam rilis berita High Impact USD (CPI, NFP, FOMC, Core PCE) dalam waktu WITA dan aktifkan aturan News Lock -15m s.d. +30m.',
        'Setelah +30 menit pasca rilis dan spread kembali normal, amati kolam likuiditas yang tersapu berita untuk menyusun rencana entry.'
      ],
      decisionTree: [
        {
          condition: 'Tersisa 12 menit menuju rilis US CPI (20:30 WITA EDT) dan kamu melihat setup M5 yang tampak bagus.',
          action: 'STOP — News Lock aktif (-15m). Dilarang keras membuka posisi baru; tunggu hingga 21:00 WITA.'
        },
        {
          condition: 'Kamu sudah punya posisi BUY profit +$12 dari sesi London, dan 20 menit lagi NFP akan rilis.',
          action: 'Amankan minimal 70%–100% profit atau tutup penuh sebelum NFP agar profit pasti tidak habis oleh whipsaw & slippage.'
        }
      ],
      failedCase: {
        context: 'Trader memasang Buy Stop +$3 dan Sell Stop -$3 satu menit sebelum rilis NFP dengan SL ketat $3.',
        whyFailed: 'Whipsaw 15 detik pertama menyambar naik lalu banting turun disertai spread spike $3 — kedua order terpicu dan keduanya langsung terkena SL dengan slippage.'
      },
      validRules: [
        'Cek Kalender Ekonomi Market Intel setiap pagi sebelum membuka chart.',
        'Patuhi News Lock -15 menit sebelum hingga +30 menit sesudah rilis Red Folder USD.'
      ],
      invalidRules: [
        'Menahan posisi scalping dengan SL ketat melewati detik rilis CPI, NFP, atau FOMC.',
        'Memasang jebakan Buy Stop & Sell Stop bersamaan tepat sebelum rilis berita.'
      ],
      xauScenario: {
        context: 'Rabu malam EDT: rilis US CPI pukul 20:30 WITA.',
        steps: [
          '20:15–21:00 WITA: News Lock aktif — tangan jauh dari tombol entry saat whipsaw terjadi.',
          '21:00+ WITA: Spread kembali normal dan arah dorongan pasca-CPI jernih menuju DOL untuk dipantau di sesi NY.'
        ]
      },
      goldenRules: [
        'Berita ekonomi adalah bahan bakar pembuat likuiditas — biarkan ia selesai menyapu dulu, baru kita panen dengan risiko tenang.'
      ],
      practiceCta: {
        label: 'Buka Kalender Ekonomi & News Lock',
        description: 'Cek jadwal berita merah USD hari ini dan status News Lock otomatis pada modul Market Intel.',
        href: '../market-intel/index.html'
      },
      quiz: [
        {
          question: 'Berapa rentang waktu baku **Protokol News Lock** di Amy FX Pro untuk berita ekonomi High Impact (Red Folder) USD?',
          options: [
            '1 menit sebelum sampai 1 menit sesudah rilis',
            '**15 menit sebelum hingga 30 menit sesudah** rilis berita (khusus FOMC tunggu sampai konferensi pers usai)',
            'Hanya 5 detik tepat saat angka keluar',
            'Tidak perlu menunggu berita selama sudah memakai Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Rentang -15 menit hingga +30 menit melindungi modal dari pelebaran spread pra-rilis, slippage, dan whipsaw pasca-rilis.'
        },
        {
          question: 'Mengapa memasang Stop Loss `$4` **tidak menjamin** kerugianmu terbatas di `$4` jika kamu nekat menahan posisi melewati detik rilis NFP atau CPI?',
          options: [
            'Karena broker menghapus tombol SL saat NFP',
            'Karena **Slippage** & **Spread Spike**: harga bisa melompat langsung melewati harga SL-mu tanpa antrean likuiditas, membuat rugi nyata jauh lebih besar dari rencana',
            'Karena NFP hanya memengaruhi mata uang Yen Jepang',
            'Karena SL otomatis berubah menjadi Take Profit'
          ],
          answerIndex: 1,
          explanation: 'Saat likuiditas tipis di detik rilis berita besar, order SL tereksekusi di harga pasar tersedia berikutnya (slippage), sehingga kerugian bisa berlipat.'
        },
        {
          question: 'Jika kamu sudah memegang posisi BUY dari sesi London yang sedang profit `+$12`, lalu 20 menit lagi berita besar **US CPI (`20:30 WITA` EDT)** akan rilis, apa tindakan paling profesional?',
          options: [
            'Menambah lot 2 kali lipat supaya cepat kaya saat CPI',
            'Mengamankan sebagian besar profit (`Partial 70%–100%`) atau menutup posisi penuh sebelum News Lock agar profit pasti tidak dikorbankan ke lemparan koin berita',
            'Menghapus Stop Loss agar tidak tersentuh whipsaw',
            'Memasang Sell Stop berjarak $1 dari harga sekarang'
          ],
          answerIndex: 1,
          explanation: 'Trader profesional melindungi keuntungan yang sudah di tangan daripada mempertaruhkannya pada volatilitas acak detik rilis CPI.'
        },
        {
          question: 'Kapan saat terbaik bagi trader ICT untuk memanfaatkan hari yang memiliki berita merah USD seperti CPI atau NFP?',
          options: [
            'Menebak arah 30 detik sebelum berita keluar',
            'Menunggu 15–30 menit setelah rilis sampai whipsaw selesai dan spread kembali normal, lalu mengikuti jejak arah bersih pasca-berita menuju DOL',
            'Menutup akun sepanjang bulan tersebut',
            'Masuk posisi tanpa Stop Loss tepat pada menit rilis'
          ],
          answerIndex: 1,
          explanation: 'Setelah guncangan awal mereda dan likuiditas tersapu, dorongan pasca-berita sering menghasilkan tren intraday paling bersih hari itu.'
        }
      ]
    },

    // =========================================================================
    // BAB 14 (BAGIAN III) — MENENTUKAN DAILY BIAS & NEXT-DAY EXPANSION
    // =========================================================================
    {
      id: 'daily-bias-draw-on-liquidity',
      number: 14,
      levelId: 2,
      bookFormat: true,
      title: 'Menentukan Daily Bias & Membaca Arah Candle Harian (Next-Day Expansion)',
      subtitle: 'Cara menyusun arah prioritas harian dalam 2 menit setiap pagi menggunakan pola penutupan candle Daily kemarin, konfirmasi terbalik DXY, dan 1 garis batal anti-keras kepala.',
      readMinutes: 10,
      diagramId: 'daily-bias-dol',
      diagramAfterSection: 1,
      summary: 'Cara membaca 4 pola penutupan candle Daily kemarin (Next-Day Expansion ICT) untuk menetapkan Daily Bias Bullish, Bearish, atau Netral, menyaring dengan DXY, serta memasang 1 garis Invalidasi Bias.',
      bookSections: [
        {
          number: '14.1',
          heading: 'Apa Itu Daily Bias? (Bukan Ramalan Dukun, Melainkan Arah Angin)',
          paragraphs: [
            'Setelah kamu mahir menemukan magnet tujuan (**DOL**) di Bab 13, sekarang kita satukan kompas tersebut ke dalam kerangka satu hari penuh: **Daily Bias**.',
            'Banyak pemula salah kaprah mengira Daily Bias berarti meramal dengan 100% pasti: *"Hari ini Gold PASTI tutup hijau!"* Lalu ketika pasar ternyata berbalik turun, mereka keras kepala menahan posisi BUY sampai akun hancur. Itu bukan Daily Bias — itu namanya **ego**.',
            'Arti sebenarnya dari **Daily Bias** sangat sederhana: seperti seorang pelaut yang mengecek **ke mana arah angin hari ini bertiup** sebelum membentangkan layar. Jika arah angin hari ini mengarah ke utara (**Bullish Bias**), kamu fokus memprioritaskan setup BUY menuju magnet atas (DOL). Jika angin mendadak berbalik dan mematahkan batas amanmu, kamu cukup menurunkan layar atau berganti haluan — bukan berkelahi melawan badai!'
          ]
        },
        {
          number: '14.2',
          heading: '4 Pola Candle Daily Kemarin (Model Next-Day Expansion ICT)',
          paragraphs: [
            'Bagaimana cara tercepat dan paling objektif menentukan Daily Bias setiap pagi dalam waktu kurang dari 2 menit? Buka chart **Daily (`D1`)** XAU/USD, lalu lihat **bagaimana candle kemarin ditutup terhadap titik High (`PDH`) dan Low (`PDL`) dari candle 2 hari lalu**:'
          ],
          table: {
            caption: '4 Pola Objektif Membaca Arah Candle Harian Berikutnya (Next-Day Expansion)',
            headers: ['Pola Penutupan Candle Daily Kemarin', 'Makna Psikologis Institusi', 'Daily Bias Hari Ini', 'Target DOL Awal Hari Ini'],
            rows: [
              ['1. Body Close di Atas High 2 Hari Lalu', 'Pembeli kuat menerima harga lebih tinggi dan melanjutkan ekspansi', '**BULLISH** (lanjut naik)', 'Menembus **PDH kemarin** menuju BSL / Swing High atas berikutnya'],
              ['2. Hanya Wick Menyapu High 2 Hari Lalu, lalu Close Kembali di Bawahnya', 'Penolakan atas! Likuiditas atas baru saja disapu (Origin atas) → pembeli kelelahan', '**BEARISH** (potensi balik turun)', 'Menuju **PDL kemarin** atau area ketidakseimbangan (FVG) di bawah'],
              ['3. Hanya Wick Menyapu Low 2 Hari Lalu, lalu Close Kembali di Atasnya', 'Penolakan bawah! Likuiditas bawah baru saja disapu (Origin bawah) → penjual kelelahan', '**BULLISH** (potensi balik naik)', 'Menuju **PDH kemarin** atau area ketidakseimbangan (FVG) di atas'],
              ['4. Inside Bar (High & Low Kemarin Terjepit di Dalam Candle Sebelumnya)', 'Pasar sedang mengerucut/ragu menunggu katalis berita atau sesi besar', '**NETRAL (WAIT)**', 'Jangan menebak! Tunggu sesi London/NY menembus salah satu sisi kotak dulu']
            ]
          },
          paragraphsAfter: [
            'Perhatikan betapa serasinya tabel ini dengan **Bab 09 (BOS vs Sweep)** dan **Bab 13 (Origin → DOL)**! Seluruh ilmu di buku ini saling mengunci seperti roda gigi: pada skala Daily pun, **Body Close** berarti kelanjutan arah, sedangkan **Wick Sweep** berarti pengambilan bahan bakar dan sinyal pembalikan arah!'
          ]
        },
        {
          number: '14.3',
          heading: 'Filter Penguat: Mengecek Korelasi Terbalik Dolar AS (DXY)',
          paragraphs: [
            'Karena XAU/USD dipasangkan melawan Dolar AS, kamu punya satu "kaca spion" gratis yang selalu dicek trader emas profesional setiap pagi: grafik **DXY (US Dollar Index)** pada timeframe `Daily` dan `H1`.',
            'Secara historis, DXY dan XAU/USD bergerak **berlawanan arah (korelasi negatif)**: ketika DXY menunjukkan penolakan dari atas dan mengarah turun menuju kolam `SSL`-nya, itu menjadi angin belakang yang sangat sehat bagi bias **Bullish** di XAU/USD. Sebaliknya, jika DXY melesat kuat menuju `BSL` atasnya, berhati-hatilah sebelum memaksakan BUY di Gold.',
            '*(Penting: gunakan DXY sebagai **konfirmasi pendukung**, bukan satu-satunya alasan menekan tombol — pada momen geopolitik/perang, Gold dan DXY sesekali bisa naik bersamaan karena keduanya diburu sebagai aset aman. Selalu utamakan fakta struktur pada chart XAU/USD sendiri!)*'
          ]
        },
        {
          number: '14.4',
          heading: 'Vaksin Anti-"Narrative Bias": Aturan Wajib 1 Garis Batal',
          paragraphs: [
            'Penyakit psikologis paling berbahaya dari Daily Bias disebut **Narrative Bias** — yaitu kondisi saat kamu terlalu cinta pada skenario pagi harimu sampai menutup mata terhadap fakta bahwa pasar sudah berbalik arah. Obatnya cuma satu dan sangat mekanis: **tulis Daily Bias-mu setiap pagi dalam format 1 kalimat wajib yang selalu menyertakan 1 Garis Batal (Invalidation Line)**.'
          ],
          exampleBox: {
            title: 'Contoh Template Catatan Daily Bias Pagi (Wajib 1 Garis Batal)',
            rows: [
              {
                label: 'Fakta Daily & H1 (08:30 WITA)',
                detail: 'Kemarin candle Daily menyapu Low 2 hari lalu dengan sumbu panjang lalu ditutup hijau tegas. Struktur `H1` mencetak `HH–HL` dengan Strong Low di `2.640,00`. `PDH` masih Fresh di `2.672,00`. DXY sedang melemah menuju SSL.'
              },
              {
                label: 'Kalimat Bias Resmi Hari Ini',
                detail: '**"Bias hari ini BULLISH menuju DOL PDH `2.672,00`. Skenario ini OTOMATIS BATAL jika candle H1 menutup body di bawah `2.640,00`."**'
              },
              {
                label: 'Dampak Psikologisnya',
                detail: 'Jika nanti sore H1 ternyata jebol tutup di `2.637,00`, kamu tidak perlu panik atau berdebat dengan pasar. Garis batalmu sudah ditembus → terima kenyataan, berhenti mencari BUY, dan evaluasi arah baru dengan kepala dingin.'
              }
            ]
          },
          callout: {
            tone: 'tip',
            title: 'Boleh Punya Bias NETRAL!',
            body: 'Salah satu ciri trader profesional adalah berani berkata **"Hari ini peta pagi tidak jelas (Inside Bar / menjelang FOMC), jadi Bias saya NETRAL."** Tidak ada aturan yang memaksamu punya opini setiap hari — saat netral, cukup tunggu sesi London atau NY membuka kartunya lebih dulu.'
          }
        }
      ],
      keyTakeaways: [
        '**Daily Bias** adalah arah prioritas kerja harian (bukan ramalan 100%) yang dibangun dari pola candle Daily kemarin + peta **DOL**.',
        'Aturan **Next-Day Expansion**: Body Close melewati High/Low lama = condong **lanjut arah**; Wick-Only Sweep + close balik = condong **berbalik ke sisi lawan**; Inside Bar = **Netral / Wait**.',
        'Gunakan grafik **DXY** sebagai filter penguat (umumnya berkorelasi terbalik dengan XAU/USD), namun tetap utamakan struktur XAU/USD sendiri.',
        'Wajib tulis **1 Garis Batal (`Invalidation Line`)** pada setiap kalimat Daily Bias agar kamu kebal dari jebakan *Narrative Bias*.'
      ],
      bridgeNext: 'Sekarang setiap pagi dalam 2 menit kamu sudah bisa menuliskan kalimat Daily Bias lengkap dengan target DOL dan garis batalnya. Pertanyaan berikutnya: **di dalam satu hari yang kamu tetapkan Bullish (atau Bearish) itu, apakah harga langsung melesat searah sejak pagi, atau justru sengaja menipu ke arah lawan dulu?** Mari kita bedah drama 3 babak harian pasar Gold di **Bab 15: Siklus Harian ICT: Power of Three (AMD), NY Midnight Open & Judas Swing**.',
      conceptBlocks: [
        {
          heading: 'Model Next-Day Expansion, DXY Filter & Garis Batal Daily Bias',
          paragraphs: [
            'Daily Bias dibaca objektif dari penutupan candle Daily kemarin: Body Close melewati High/Low lama mendukung kelanjutan, Wick Sweep mendukung pembalikan ke sisi lawan, dan Inside Bar menandakan Bias Netral.',
            'Lengkapi Daily Bias dengan filter korelasi terbalik DXY serta satu garis Invalidasi H1 yang tegas untuk mencegah Narrative Bias.'
          ]
        }
      ],
      mappingSteps: [
        'Buka chart Daily (D1) XAU/USD tiap pagi dan klasifikasikan candle kemarin: Continuation Close, Wick Sweep, atau Inside Bar.',
        'Cocokkan dengan peta DOL terdekat yang masih Fresh dan cek apakah DXY mendukung arah tersebut.',
        'Tuliskan 1 kalimat Daily Bias lengkap beserta 1 harga Invalidasi H1 (garis batal) sebelum sesi London dibuka.'
      ],
      decisionTree: [
        {
          condition: 'Candle Daily kemarin berupa Inside Bar (terjepit penuh di dalam High–Low candle sebelumnya).',
          action: 'Tetapkan Bias NETRAL (WAIT) — jangan memaksakan posisi sampai sesi London/NY menembus arah secara jelas.'
        },
        {
          condition: 'Daily Bias pagi hari Bullish dengan garis batal H1 di 2.640, lalu pukul 16:00 WITA H1 menutup body di 2.637.',
          action: 'Batalkan bias Bullish seketika. Berhenti mencari setup BUY dan evaluasi ulang struktur secara netral/Bearish.'
        }
      ],
      failedCase: {
        context: 'Trader menetapkan Bias Bullish di pagi hari tanpa menulis garis batal, lalu terus mencoba menangkap pisau jatuh BUY sebanyak 3 kali meski H1 sudah mencetak Bearish BOS.',
        whyFailed: 'Terjebak Narrative Bias karena tidak memasang titik invalidasi objektif; ego prediksi mengalahkan fakta struktur pasar live.'
      },
      validRules: [
        'Tentukan Daily Bias objektif dari penutupan candle Daily + peta DOL terdekat.',
        'Selalu tulis 1 level Invalidasi H1 pada setiap rencana bias harian.'
      ],
      invalidRules: [
        'Memaksakan opini arah pada hari Inside Bar yang tidak jelas.',
        'Terus melawan fakta pasar setelah garis invalidasi H1 ditembus oleh body close.'
      ],
      xauScenario: {
        context: 'Pagi 08:30 WITA: candle Daily kemarin menyapu Low 2 hari lalu lalu close hijau kuat; PDH Fresh di 2.672 dan Strong Low H1 di 2.640.',
        steps: [
          'Klasifikasi Daily = Sweep bawah + close kuat → Bias BULLISH.',
          'Rumusan 1 kalimat: "Bias Bullish menuju DOL PDH 2.672; batal jika H1 body close di bawah 2.640."'
        ]
      },
      goldenRules: [
        'Daily Bias tanpa garis batal hanyalah ego yang menunggu dihukum pasar.'
      ],
      practiceCta: {
        label: 'Cek Bias H1 & Peta Harian di Cockpit Mapping',
        description: 'Cocokkan bacaan Daily Bias pagimu dengan panel arah H1/M15 dan level PDH/PDL live di Cockpit Mapping.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Pada chart Daily (`D1`) XAU/USD, candle kemarin sempat menembus puncak 2 hari lalu hanya dengan **sumbu panjang (wick)** lalu ditutup (**body close**) kembali di bawahnya. Menurut model *Next-Day Expansion*, ke arah mana Daily Bias hari ini lebih condong?',
          options: [
            'Bullish sangat kuat karena sempat menyentuh harga tinggi',
            '**Bearish** (potensi berbalik turun menuju PDL / area bawah), karena likuiditas atas baru saja disapu dan pembeli menunjukkan penolakan',
            'Pasti sideways selama 1 bulan penuh',
            'Tidak bisa dibaca di chart Daily'
          ],
          answerIndex: 1,
          explanation: 'Wick Sweep pada puncak harian sebelumnya menandakan pengambilan likuiditas atas (Origin atas) dan memberi condong Bearish menuju kolam bawah.'
        },
        {
          question: 'Jika candle Daily kemarin membentuk **Inside Bar** (titik High dan Low-nya terjepit penuh di dalam rentang candle 2 hari lalu), sikap Daily Bias paling bijak adalah:',
          options: [
            'Memaksa mencari posisi BUY dengan lot 2 kali lebih besar',
            'Menetapkan **Bias NETRAL (WAIT)** dan membiarkan sesi London/NY membuka arah terlebih dahulu',
            'Langsung membuka posisi SELL di pembukaan sesi Asia',
            'Menghapus seluruh level PDH dan PDL'
          ],
          answerIndex: 1,
          explanation: 'Inside Bar mencerminkan konsolidasi/keraguan harian; menetapkan Bias Netral melindungimu dari whipsaw di tengah kotak.'
        },
        {
          question: 'Bagaimana hubungan korelasi umum antara indeks Dolar AS (**DXY**) dengan **XAU/USD**, serta apa catatan pentingnya?',
          options: [
            'Selalu bergerak searah 100% setiap detik tanpa pengecualian',
            'Umumnya **berkorelasi terbalik** (pelemahan DXY mendukung kenaikan XAU/USD), namun tetap dipakai sebagai konfirmasi pendukung — struktur chart XAU/USD tetap nomor satu',
            'Tidak pernah berhubungan sama sekali',
            'Hanya berlaku pada hari Minggu'
          ],
          answerIndex: 1,
          explanation: 'Karena emas dihargai dalam USD, pelemahan DXY umumnya mendukung Bullish Gold; namun pada kondisi krisis geopolitik keduanya bisa bergerak searah sehingga struktur XAU tetap diutamakan.'
        },
        {
          question: 'Apa fungsi utama menuliskan **1 Garis Batal (`Invalidation Line`)** pada setiap kalimat Daily Bias pagimu?',
          options: [
            'Untuk hiasan catatan jurnal agar terlihat panjang',
            'Sebagai vaksin anti-*Narrative Bias*: memaksamu berhenti keras kepala dan tunduk pada fakta pasar jika H1 ternyata close melewati batas tersebut',
            'Untuk menggantikan Stop Loss di MT5',
            'Agar bisa membuka posisi tanpa batas setiap hari'
          ],
          answerIndex: 1,
          explanation: 'Garis invalidasi objektif memutus keterikatan emosional pada skenario pagi begitu fakta struktur H1 membuktikan arah berbalik.'
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
    // =========================================================================
    // BAGIAN V — BAB 28: STOP LOSS STRUKTURAL, NAPAS SPREAD & TARGET LIKUIDITAS
    // =========================================================================
    {
      id: 'sl-struktural-napas-spread-tp',
      number: 28,
      levelId: 4,
      title: 'Stop Loss Struktural, Napas Spread & Target Likuiditas Bertingkat (TP1/TP2)',
      readMinutes: 10,
      diagramId: 'sl-tp-engineering',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Stop Loss bukan musuh — ia adalah sabuk pengaman matematis. Pelajari penempatan SL di titik invalidasi struktural + buffer wick/spread Gold (termasuk jebakan Bid/Ask pada SELL) dan pemetaan objektif TP1/TP2 berbasis kolam likuiditas.',
      bookSections: [
        {
          number: '28.1',
          heading: 'Mengapa Stop Loss "Angka Cantik" ($2 atau 20 Pips) Selalu Jadi Makanan Wick Gold?',
          shortTitle: 'Bahaya SL Angka Cantik',
          paragraphs: [
            'Di Bab 03 kamu sudah menguasai rumus ukuran Lot (`Lot = Risiko $ ÷ [Jarak SL $ × 100]`) agar setiap kerugian selalu terkunci di `0,5%–1%` modal. Sekarang kita jawab pertanyaan lanjutannya: **dari mana angka Jarak SL itu berasal?**',
            'Kesalahan paling mahal trader ritel adalah **mematok jarak SL dari keinginan hati** — misalnya selalu memasang SL `$2,00` (20 pips) di semua situasi supaya lot-nya bisa besar. Hasilnya? Kamu pasti pernah mengalami momen menyebalkan ini: **SL-mu tersentuh tipis oleh ujung wick Gold, lalu 3 menit kemudian harga meluncur tepat ke arah TP-mu!**',
            'Ingat hukum emas manajemen posisi: **Chart yang menentukan jarak SL (berdasarkan struktur), sedangkan rumus Lot yang menyesuaikan ukuran posisimu agar risikonya tetap 1%!** Stop Loss harus selalu diletakkan di **Titik Invalidasi Struktural** — yaitu titik di mana jika harga sampai menyentuhnya, alasan entry-mu memang resmi salah.'
          ]
        },
        {
          number: '28.2',
          heading: 'Rumus SL Struktural + Napas Spread & Jebakan Bid/Ask pada Posisi SELL',
          shortTitle: 'SL Struktural & Efek Bid/Ask',
          paragraphs: [
            'Menaruh Stop Loss **menempel persis** di ujung wick sweep (`$0,00` ruang napas) sama bahayanya dengan SL sembarangan, karena XAU/USD memiliki spread hidup (`$0,20–$0,45` normal, bisa melebar `$0,80+` di pergantian sesi) serta sifat wick tajam. Di **Mesin Mapping Cockpit Amy FX Pro**, setiap rencana SL selalu menambahkan **buffer napas spread & wick** di luar jangkar struktur (`$0,60–$1,20` di luar swing/sweep ekstrem, atau `$1,40–$3,00` jika jangkar hanya tepi kotak POI).',
            'Khusus untuk posisi **SELL**, ingat kembali mekanisme **Bid vs Ask (Bab 02)** yang sering dilupakan orang — grafik standar MT5 hanya menggambar garis **Bid**, padahal SL dan TP posisi SELL dieksekusi di harga **Ask (`Bid + Spread`)**!'
          ],
          table: {
            caption: 'Panduan Presisi Penempatan SL & TP pada Posisi BUY vs SELL di XAU/USD',
            headers: ['Arah Posisi', 'Jangkar SL Struktural', 'Penyesuaian Napas Spread (WAJIB)', 'Penyesuaian Garis TP'],
            rows: [
              ['**BUY**', 'Di bawah ujung wick terendah Sweep / Swing Low / OB', 'Kurangi **`$0,60 – $1,00`** di bawah ujung wick (SL Buy tereksekusi di garis Bid)', 'Tepat di bawah kolam BSL / PDH (kurangi `$0,30–$0,50` agar tidak kurang 1 tick)'],
              ['**SELL**', 'Di atas ujung wick tertinggi Sweep / Swing High / OB', 'Tambahkan **`$0,80 – $1,20`** di atas ujung wick — **wajib menampung garis Ask!**', 'Naikkan **`+$0,40 – $0,60`** di atas dasar SSL / PDL agar garis Ask benar-benar menyentuh TP!']
            ]
          }
        },
        {
          number: '28.3',
          heading: 'Memetakan Target Likuiditas Bertingkat: TP1 (Amankan Kantong) vs TP2 (Magnet DOL)',
          shortTitle: 'Arsitektur TP1 & TP2',
          paragraphs: [
            'Sama seperti SL, **Take Profit tidak boleh dikarang dari angka kebutuhan pribadi** (*"pokoknya mau profit $50 hari ini"*). Pasar tidak peduli cicilanmu — pasar hanya bergerak dari satu kolam likuiditas ke kolam likuiditas berikutnya!',
            'Gunakan arsitektur **Target 2 Tingkat** yang juga diterapkan di Kartu Rencana Eksekusi Mapping Cockpit:',
            '• **TP1 (Target Utama / Amankan Kantong · minimal `1,5R – 2R`):** Ditempatkan tepat di depan **kolam likuiditas terdekat / internal** (misalnya Swing High/Low M15 pertama, Asia High/Low, atau tepi HTF FVG). Di titik ini kamu mengunci mayoritas profit lewat *Partial Close* (Bab 29).',
            '• **TP2 (Target Runner / Magnet Utama DOL · `3R – 5R+`):** Ditempatkan tepat di depan **Draw on Liquidity eksternal H1** (`PDH/PDL`, `PWH/PWL`, atau `EQH/EQL` besar) — selama jaraknya masih masuk akal terhadap rentang gerak harian Gold (`ADR 5 Hari`, umumnya `$25–$55`).'
          ]
        },
        {
          number: '28.4',
          heading: 'Studi Kasus Lengkap Engineering SL & TP XAU/USD (Dengan Hitungan R:R Eksak)',
          shortTitle: 'Studi Kasus SL & TP Gold',
          paragraphs: [
            'Perhatikan bagaimana sebuah rencana BUY XAU/USD M5 dirancang secara mekanis dengan jangkar struktur, napas spread, dan dua tingkat likuiditas:'
          ],
          exampleBox: {
            title: 'Engineering SL & TP1/TP2 — Bullish Setup XAU/USD M5 (Sesi London)',
            rows: [
              {
                label: 'Titik Entry & Jangkar Invalidasi',
                detail: 'Pasca-sweep Asia Low di ujung wick **`2.642,00`** + Bullish MSS + FVG di Discount. **Buy Limit** terjemput di **`2.645,50`**.'
              },
              {
                label: 'Penempatan SL Struktural + Napas Spread',
                detail: 'Ujung wick sweep `2.642,00` dikurangi buffer wick & spread **`$1,00`** → **SL di `2.641,00`**. Total jarak risiko = `2.645,50 - 2.641,00` = **`$4,50` (`1R`)**. (Jika modal `$1.000` risiko `1% = $10`, maka lot = `$10 ÷ $450` = **`0,02 lot`**).'
              },
              {
                label: 'Pemetaan TP1 & TP2 Berbasis Likuiditas',
                detail: '• **TP1 (Tepat di bawah Asia High `2.655,00`):** Pasang di **`2.654,50`** (`+$9,00` = tepat **`2,00R`**) → amankan kantong!\n• **TP2 (Tepat di bawah DOL PDH `2.664,00`):** Pasang di **`2.663,50`** (`+$18,00` = tepat **`4,00R`**) → biarkan runner mengalir!'
              }
            ]
          },
          callout: {
            tone: 'warn',
            kicker: 'Dosa Terbesar Manajemen Risiko',
            title: 'HARAM Menggeser Stop Loss Menjauh Saat Harga Mendekat!',
            body: 'SL yang tersentuh di titik invalidasi adalah **SL yang sehat** — ia sedang bekerja melindungi akunmu dari kerugian yang jauh lebih besar. Menggeser SL menjauh sambil berharap harga berbalik mengubah kerugian kecil `-1R` yang terukur menjadi kerusakan akun `-5R` hingga Margin Call!'
          }
        }
      ],
      keyTakeaways: [
        '**Chart menentukan lebar SL (di luar titik invalidasi struktur), rumus Lot yang menyesuaikan ukuran posisi** agar risiko tetap `0,5%–1%` modal.',
        'Selalu tambahkan **Napas Spread & Buffer Wick** (`$0,60–$1,20` di luar ujung sweep/swing ekstrem); khusus **SELL**, tambahkan ruang ekstra untuk garis **Ask** pada SL maupun TP!',
        'Petakan target secara objektif: **TP1** di kolam likuiditas terdekat (`≥ 1,5R–2R`) dan **TP2** di magnet DOL H1 (`PDH/PDL`) yang masih realistis dalam rentang ADR harian.',
        'Dilarang keras menggeser SL menjauh ketika harga mendekati titik invalidasi.'
      ],
      bridgeNext: 'Rencana Entry, SL struktural, dan TP1/TP2 kamu sekarang sudah terkunci rapi di atas kertas. Namun begitu ordermu **aktif berjalan** di pasar live XAU/USD, ujian berikutnya langsung dimulai: *kapan tepatnya kamu boleh mengambil Partial Close, kapan boleh menggeser SL ke Breakeven tanpa tertendang pullback normal, dan kapan harus menutup laptop?* Mari kita bahas di **Bab 29: Manajemen Posisi Aktif: Partial Close, Breakeven (BEP) & Batas Berhenti Harian**.',
      practiceCta: {
        label: 'Lihat Rencana SL/TP1/TP2 Live di Mapping',
        description: 'Amati perhitungan otomatis SL struktural + napas spread Gold, TP1, dan TP2 DOL pada Kartu Rencana Eksekusi Mapping Cockpit.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Stop Loss Struktural, Napas Spread & TP1/TP2 Berbasis Likuiditas',
          paragraphs: [
            'SL diletakkan di luar titik invalidasi struktural ditambah buffer napas spread/wick (memperhitungkan garis Ask pada SELL), sementara TP1 dan TP2 menempel pada kolam likuiditas nyata (internal ≥1,5R–2R dan DOL H1).'
          ]
        }
      ],
      mappingSteps: [
        'Tentukan titik invalidasi struktural (ujung wick Sweep / Swing ekstrem) dan tambahkan buffer napas spread ($0,60–$1,20).',
        'Hitung ulang ukuran lot dari jarak SL aktual tersebut agar risiko tetap 0,5%–1% modal.',
        'Pasang TP1 tepat di depan kolam likuiditas terdekat (min 1,5R–2R) dan TP2 di depan DOL H1 (PDH/PDL), dengan penyesuaian spread Ask untuk posisi SELL.'
      ],
      decisionTree: [
        {
          condition: 'Jarak SL struktural pada setup M15 adalah $6,00, lebih lebar dari biasanya ($3,00).',
          action: 'Kecilkan ukuran lot menjadi setengahnya sesuai rumus Lot agar nominal risiko uang tetap 1% — JANGAN memotong SL masuk ke dalam noise.'
        },
        {
          condition: 'Harga hampir menyentuh garis SL struktural dan kamu tergoda menggeser SL $5 lebih jauh.',
          action: 'JANGAN GESER — biarkan SL bekerja sesuai rencana awal, terima -1R dengan tenang.'
        }
      ],
      validRules: [
        'SL diletakkan di luar ujung wick sweep/swing invalidasi + buffer napas spread.',
        'TP1 diarahkan ke kolam likuiditas terdekat (min 1,5R–2R); TP2 ke magnet H1 (PDH/PDL).'
      ],
      invalidRules: [
        'Memasang SL tepat menempel persis di ujung wick tanpa buffer spread.',
        'Menggeser SL makin menjauh saat posisi mendekati titik invalidasi.'
      ],
      xauScenario: {
        context: 'Setup Buy XAU/USD M5 setelah sweep Asia Low 2.642,00; Entry FVG di 2.645,50.',
        steps: [
          'SL Struktural + Napas Spread: 2.642,00 - $1,00 = 2.641,00 (risiko $4,50 = 1R).',
          'TP1 di 2.654,50 (+$9,00 / 2,00R) dan TP2 di 2.663,50 (+$18,00 / 4,00R).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: SL Angka Cantik $2 Tanpa Struktur',
        context: 'Trader memaksa SL $2,00 di tengah kotak FVG agar bisa memakai lot lebih besar.',
        whyFailed: 'Wick pullback normal Gold menyentuh SL sebelum harga berbalik naik +$15 ke target awal.'
      },
      goldenRules: [
        'SL yang tersentuh di titik invalidasi adalah SL yang baik — ia menyelamatkanmu dari kerugian lebih besar.',
        'Chart menentukan jarak SL; rumus risiko 1% yang menentukan ukuran Lot.'
      ],
      quiz: [
        {
          question: 'Pada setup **BUY** pasca-sweep Asia Low dengan ujung wick terendah di `2.642,00`, di mana penempatan Stop Loss paling tepat?',
          options: [
            'Selalu berjarak tepat `$1,50` dari titik entry tanpa melihat wick',
            '**Di bawah ujung wick terendah `2.642,00` ditambah buffer napas spread** (misalnya `2.641,00`)',
            'Tepat di garis 50% FVG agar lot bisa 3× lebih besar',
            'Di bawah harga terendah 6 bulan lalu'
          ],
          answerIndex: 1,
          explanation: 'Ujung wick sweep adalah titik invalidasi struktural; menambah napas spread/wick melindungi posisi dari sentuhan spread biasa.'
        },
        {
          question: 'Mengapa pada posisi **SELL** di XAU/USD kamu wajib menaikkan garis TP sedikit di atas dasar kolam likuiditas (`+$0,40 – $0,60`) dan menambah ruang lebih pada SL?',
          options: [
            'Karena broker hanya membuka pasar untuk posisi BUY',
            'Karena chart standar hanya menampilkan garis **Bid**, padahal SL dan TP posisi **SELL** tereksekusi saat harga **Ask (`Bid + Spread`)** menyentuhnya',
            'Supaya grafik terlihat lebih simetris',
            'Karena spread tidak berlaku pada posisi SELL'
          ],
          answerIndex: 1,
          explanation: 'Posisi Sell ditutup dengan membeli balik pada harga Ask; tanpa penyesuaian spread Ask, TP Sell sering gagal tereksekusi meski garis Bid sudah menyentuhnya.'
        },
        {
          question: 'Bagaimana prinsip benar menentukan jarak **TP1** dan **TP2** secara objektif di XAU/USD?',
          options: [
            'Sesuai nominal uang yang sedang dibutuhkan hari ini',
            '**TP1** di depan kolam likuiditas terdekat (`≥ 1,5R–2R`) untuk mengamankan profit, dan **TP2** di depan magnet **DOL H1** (`PDH/PDL`) yang masih realistis dalam rentang ADR',
            'Selalu pasang TP 500 pips di semua kondisi pasar',
            'Tutup acak begitu melihat angka hijau +$1'
          ],
          answerIndex: 1,
          explanation: 'Menempelkan TP1/TP2 pada kolam likuiditas nyata menyelaraskan titik keluar kita dengan area ambil profit institusi.'
        },
        {
          question: 'Harga sedang bergerak mendekati garis Stop Loss strukturalmu. Apa tindakan yang **DILARANG KERAS** dilakukan?',
          options: [
            'Membiarkan SL bekerja sesuai rencana awal dan menerima risiko `-1R` dengan tenang',
            '**Menggeser Stop Loss menjauh** sambil berharap harga akan berbalik',
            'Mencatat hasil trade di Jurnal setelah posisi tertutup',
            'Beristirahat sejenak untuk menjaga ketenangan emosi'
          ],
          answerIndex: 1,
          explanation: 'Menggeser SL menjauh merusak seluruh matematika manajemen risiko dan mengubah rugi kecil terukur menjadi drawdown berat.'
        }
      ]
    },
    // =========================================================================
    // BAGIAN V — BAB 29: MANAJEMEN POSISI AKTIF (PARTIAL, BEP & BATAS HARIAN)
    // =========================================================================
    {
      id: 'manajemen-trade-partial-bep-notrade',
      number: 29,
      levelId: 4,
      title: 'Manajemen Posisi Aktif: Partial Close, Breakeven (BEP) & Batas Berhenti Harian',
      readMinutes: 10,
      diagramId: 'trade-management-scale',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Banyak trader hebat dalam entry tetapi hancur saat mengelola posisi aktif: profit +2R berbalik jadi rugi karena serakah, atau BEP terlalu dini tersapu napas Gold. Kuasai aturan Partial Close, syarat sah BEP, Daily Loss Guard, dan No-Trade Days.',
      bookSections: [
        {
          number: '29.1',
          heading: 'Dua Jebakan Paling Menyakitkan Saat Posisi Sudah Berjalan di Gold',
          shortTitle: '2 Jebakan Trade Aktif',
          paragraphs: [
            'Ada dua tragedi klasik yang hampir pasti pernah dialami setiap trader XAU/USD saat posisi sedang terbuka (*running*):',
            '• **Tragedi #1 — Profit `+2R` Berbalik Jadi Rugi `-1R`:** Posisi sudah terbang manis melewati kolam likuiditas pertama, tetapi karena serakah mengejar `+5R` tanpa mengamankan sepeser pun, harga berbalik cepat dan menghantam SL awal. Rasanya jauh lebih menyakitkan daripada langsung kena SL!',
            '• **Tragedi #2 — Terlalu Cepat Geser BEP (`+0,5R`):** Baru floating profit tipis `$2`, tangan sudah gatal menggeser SL ke harga entry (*Break Even*) karena takut rugi. Akibatnya, pullback napas normal Gold langsung menyentuh BEP (`$0`) lalu 10 menit kemudian harga terbang meluncur sendirian ke TP2!'
          ]
        },
        {
          number: '29.2',
          heading: 'Protokol Partial Close (60%–75%) & Syarat Sah Geser Stop Loss ke BEP+',
          shortTitle: 'Protokol Partial & BEP',
          paragraphs: [
            'Obat untuk kedua tragedi di atas adalah **aturan manajemen posisi berbasis struktur yang 100% mekanis**:',
            '1. **Jangan Sentuh SL Sebelum Bukti Struktur Baru:** Selama harga baru berjalan `+0,3R` sampai `+1,0R` di dalam ayunan yang sama, **biarkan posisi bernapas!** Jangan menggeser SL ke BEP dan **hindari Trailing Stop otomatis sempit (`10–15 pips`)**, karena wick alami XAU/USD hampir pasti langsung menyapu trailing sempit tersebut.',
            '2. **Amankan Kantong di TP1 (`≥ 1,5R – 2R`):** Begitu harga menyentuh **TP1** (kolam likuiditas terdekat) atau memecah struktur internal baru searah tren, lakukan **Partial Close `60%–75%` volume lot** untuk langsung memindahkan profit tunai ke saldo akun!',
            '3. **Geser Sisa Runner (`25%–40%`) ke `BEP+`:** Setelah Partial Close dikunci, pindahkan SL sisa lot ke **harga entry + buffer spread kecil (`BEP+`)**. Sejak detik itu, trade tersebut resmi **bebas risiko (*risk-free*)** — kamu tinggal duduk tenang membiarkan runner mengejar TP2 DOL!'
          ]
        },
        {
          number: '29.3',
          heading: 'Daily Loss Guard & 3 Kondisi "No-Trade Days" (Kapan Wajib Tutup Laptop)',
          shortTitle: 'Daily Guard & No-Trade Days',
          paragraphs: [
            'Manajemen posisi aktif juga mencakup tahu kapan harus **berhenti menekan tombol** untuk hari itu. Di modul **Jurnal Trading & Profil Amy FX Pro**, terdapat fitur **Daily Loss Guard** yang selaras dengan batas disiplin institusional berikut:'
          ],
          table: {
            caption: 'Batas Pengaman Harian (Daily Loss Guard) & 3 Kondisi Wajib No-Trade Days',
            headers: ['Pengaman / Kondisi Pasar', 'Ciri Objektif di Layar', 'Aturan Tindakan Wajib', 'Alasan Perlindungan Modal'],
            rows: [
              ['**Daily Loss Guard**', 'Tercapai **Maks 2× SL** atau rugi harian mencapai **`-2% s.d. -3%`**', '**STOP TOTAL** untuk hari itu (kunci platform, isi Jurnal)', 'Memutus rantai *revenge trading* sebelum 1 hari buruk menghapus profit 2 minggu'],
              ['**US Bank Holiday**', 'Hari libur bank AS (mis. *Memorial Day, Independence Day, Thanksgiving*)', '**NO-TRADE** di sesi NY (atau cukup pantau tanpa ekspektasi)', 'Likuiditas bank AS tutup → pergerakan datar, tipis, dan rawan jebakan'],
              ['**Pagi–Sore Pra-FOMC**', 'Hari pengumuman suku bunga **FOMC** (dini hari WITA)', '**NO-TRADE / Kurangi 50%** sampai konferensi pers usai', 'Pasar sering terjepit konsolidasi menyapu atas-bawah menunggu The Fed'],
              ['**Profil Seek & Destroy**', 'Setelah hari kemarin bergerak ekstrem (`> $60`), hari ini harga menyapu High lalu langsung menyapu Low berulang tanpa arah', '**SEGERA KELUAR & DIAM!** Jangan berdebat dengan pasar', 'Algoritma sedang menguras trader tren maupun reversal di kedua sisi']
            ]
          }
        },
        {
          number: '29.4',
          heading: 'Simulasi Angka Lengkap: Mengelola Posisi 0,04 Lot XAU/USD Tanpa Stres',
          shortTitle: 'Simulasi Partial & BEP',
          paragraphs: [
            'Lihat bagaimana protokol Partial + BEP membuatmu **tetap pulang membawa uang** bahkan dalam skenario terburuk setelah TP1 tercapai:'
          ],
          exampleBox: {
            title: 'Simulasi Trade Aktif — BUY 0,04 Lot XAU/USD (Risiko 1R = $16,00)',
            rows: [
              {
                label: 'Posisi Awal (Entry `2.645,00` · SL `2.641,00` · Risiko `$4,00 = $16,00`)',
                detail: 'Target direncanakan: **TP1 `2.653,00`** (`+$8,00` = **`+2,0R`**) dan **TP2 `2.661,00`** (`+$16,00` = **`+4,0R`**).'
              },
              {
                label: 'Fase 1 — Harga di `2.648,00` (`+0,75R`)',
                detail: '**TIDAK SENTUH SL!** Biarkan posisi bernapas menghadapi fluktuasi normal Gold tanpa tergesa-gesa geser BEP.'
              },
              {
                label: 'Fase 2 — Harga Menyentuh TP1 `2.653,00` (`+2,0R`)',
                detail: 'Tutup **Partial `0,03 lot` (`75%`)** → profit tunai **`+$24,00`** (`0,03 × $8,00 × 100`) langsung masuk saldo! Pindahkan SL sisa **`0,01 lot`** ke **`2.645,50` (`BEP+`)**.'
              },
              {
                label: 'Fase 3 — Dua Akhir Skenario Bebas Stres',
                detail: '• **Skenario Terbaik (Kena TP2 `2.661,00`):** Sisa `0,01 lot` menambah **`+$16,00`** → total profit **`+$40,00` (`+2,50R` bersih)**!\n• **Skenario Berbalik (Kena `BEP+ 2.645,50`):** Sisa `0,01 lot` menambah `+$0,50` → kamu tetap pulang membawa **`+$24,50` (`+1,53R` bersih)**!'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Catatan Modal Kecil (0,01 Lot)',
            title: 'Bagaimana Jika Posisimu Hanya 0,01 Lot (Tidak Bisa Di-Partial)?',
            body: 'Jika akunmu hanya memungkinkan `0,01 Standard Lot` sehingga tidak bisa dipecah, ada 2 solusi profesional: **(1)** Ambil profit penuh `100%` di **TP1 (`2R`)** secara disiplin tanpa serakah, atau **(2)** Gunakan **Akun Cent** (misalnya `0,10 Cent Lot`) agar kamu tetap bisa melatih teknik Partial Close `70%/30%` dengan risiko uang tetap `1%`!'
          }
        }
      ],
      keyTakeaways: [
        '**Jangan geser SL ke BEP terlalu dini (`+0,5R`)** dan hindari Trailing Stop ketat `10–15 pips` — beri ruang napas sampai **TP1 (`≥ 1,5R–2R`)** atau struktur baru terbentuk.',
        'Saat TP1 tercapai, lakukan **Partial Close `60%–75%`** untuk mengunci profit tunai ke saldo, lalu pindahkan SL sisa runner ke **`BEP+`**.',
        'Patuhi **Daily Loss Guard (`Maks 2× SL` atau `-2% s.d. -3%/hari`)** agar satu hari buruk tidak merusak hasil kerja berminggu-minggu.',
        'Kenali dan hindari **3 No-Trade Days**: **US Bank Holiday**, **Pagi–Sore Pra-FOMC**, dan pasar bolak-balik **Seek & Destroy**.'
      ],
      bridgeNext: 'Secara teknis, kamu sekarang sudah 100% lengkap dari membuka chart sampai menutup posisi. Namun ada satu musuh terakhir yang paling sering menghancurkan trader yang sebenarnya sudah hafal semua teori ICT: **dirimu sendiri di depan layar!** Mari kita lengkapi Bagian V dengan perisai mental dan pembuktian data objektif di **Bab 30: Psikologi Eksekusi (Anti-FOMO/Revenge) & Protokol Jurnal 100 Sample**.',
      practiceCta: {
        label: 'Atur Daily Loss Guard di Jurnal & Profil',
        description: 'Aktifkan batas Maks SL & Maks Rugi Harian otomatis di Jurnal Trading dan praktikkan tombol Partial 50% + Set BE di Replay Lab.',
        href: '../journal/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Partial Close, Syarat Sah BEP, Daily Loss Guard & No-Trade Days',
          paragraphs: [
            'Lakukan Partial Close 60%–75% di TP1 (≥1,5R–2R) sebelum menggeser sisa runner ke BEP+, patuhi Daily Loss Guard (maks 2× SL/hari), dan hindari hari US Bank Holiday, Pra-FOMC, serta Seek & Destroy.'
          ]
        }
      ],
      mappingSteps: [
        'Tahan tangan untuk tidak menggeser BEP sebelum TP1 (≥1,5R–2R) atau struktur searah baru terkonfirmasi.',
        'Saat TP1 tersentuh, tutup Partial 60%–75% lot dan pindahkan SL sisa runner ke BEP+.',
        'Cek status Daily Loss Guard dan kondisi No-Trade Days (Bank Holiday / Pra-FOMC / Seek & Destroy) sebelum mencari peluang baru.'
      ],
      decisionTree: [
        {
          condition: 'Posisi Buy baru floating profit +0,6R dan belum menembus struktur baru maupun TP1.',
          action: 'Biarkan posisi bernapas — JANGAN geser BEP terlalu dini agar tidak tertendang pullback normal Gold.'
        },
        {
          condition: 'Pasar pagi–sore menjelang FOMC terus menyapu High lalu langsung menyapu Low bergantian.',
          action: 'Kondisi Seek & Destroy — tutup platform dan tetapkan No-Trade Day.'
        }
      ],
      validRules: [
        'Tutup 60%–75% posisi (Partial) di TP1 (≥1,5R–2R), lalu geser SL sisanya ke BEP+.',
        'Berhenti total untuk hari itu jika batas Daily Loss Guard (2× SL) tercapai.'
      ],
      invalidRules: [
        'Menggeser SL ke BEP saat baru floating profit tipis (+0,5R) atau memasang trailing stop 10 pips.',
        'Membiarkan floating profit +2,5R berbalik penuh menjadi -1R tanpa pengamanan.'
      ],
      xauScenario: {
        context: 'Buy 0,04 lot XAU/USD di 2.645,00, SL 2.641,00 (-$16 / 1R), TP1 2.653,00 (+2R), TP2 2.661,00 (+4R).',
        steps: [
          'Saat +0,75R (2.648,00): tidak menyentuh SL.',
          'Saat TP1 (2.653,00): Partial 0,03 lot (+$24 tunai), geser SL sisa 0,01 lot ke BEP+ 2.645,50 (skenario TP2 total +$40; skenario BEP+ tetap +$24,50).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: BEP Terlalu Dini di +0,4R',
        context: 'Trader panik menggeser SL ke entry begitu profit +$1,80.',
        whyFailed: 'Pullback wajar M5 menyentuh BEP tepat di titik entry lalu meluncur +$16 ke TP2 tanpa membawa posisi trader.'
      },
      goldenRules: [
        'Jangan biarkan trade yang sudah mencapai +2R berubah menjadi kerugian.',
        'Jangan geser BEP sebelum struktur baru terbentuk atau TP1 tercapai.'
      ],
      quiz: [
        {
          question: 'Kapan waktu paling tepat memindahkan Stop Loss ke titik impas (**BEP+**) pada scalping XAU/USD?',
          options: [
            'Segera setelah floating profit `+$1,00` (`+0,3R`)',
            '**Setelah harga menyentuh TP1 (`≥ 1,5R–2R`) atau mencetak penembusan struktur searah baru**, idealnya disertai Partial Close `60%–75%`',
            'Sebelum harga menyentuh titik entry',
            'Tidak pernah mengamankan posisi meski sudah `+4R`'
          ],
          answerIndex: 1,
          explanation: 'Menunggu TP1 atau struktur baru memberi ruang napas bagi retracement normal Gold agar posisi tidak tertendang terlalu dini.'
        },
        {
          question: 'Mengapa fitur **Trailing Stop otomatis ketat (`10–15 pips` / `$1,00–$1,50`)** kurang cocok untuk XAU/USD?',
          options: [
            'Karena MT5 tidak memiliki fitur Trailing Stop',
            'Karena volatilitas dan **wick pullback alami XAU/USD** jauh lebih lebar dari `$1,50` sehingga trailing ketat hampir selalu langsung tersenggol sebelum tren berlanjut',
            'Karena trailing otomatis menggandakan ukuran lot',
            'Karena `$1,50` terlalu lebar untuk Gold'
          ],
          answerIndex: 1,
          explanation: 'Gunakan manajemen berbasis struktur (Partial Close di TP1 + BEP+), bukan trailing mekanis super sempit di Gold.'
        },
        {
          question: 'Dalam simulasi **Buy `0,04 lot` di `2.645,00`** (`SL 2.641,00`, `TP1 2.653,00`), kamu menutup **Partial `0,03 lot`** di TP1 (`+$24,00`) lalu menggeser sisa `0,01 lot` ke `BEP+ 2.645,50`. Jika harga ternyata berbalik menyentuh `BEP+`, berapa hasil bersih trade tersebut?',
          options: [
            'Rugi `-$16,00`',
            'Impas `$0,00`',
            '**Tetap profit bersih `+$24,50`** (`+$24,00` dari Partial TP1 + `+$0,50` dari sisa lot di BEP+)',
            'Rugi `-$8,00`'
          ],
          answerIndex: 2,
          explanation: 'Partial Close di TP1 langsung mengamankan profit tunai ke saldo akun sehingga pembalikan harga ke BEP+ tidak pernah menghapus keuntunganmu.'
        },
        {
          question: 'Apa yang dimaksud kondisi pasar **"Seek & Destroy"** yang termasuk daftar wajib **No-Trade Days**?',
          options: [
            'Tren searah yang sangat rapi di sesi London',
            'Pasar yang **menyapu High lalu langsung menyapu Low berulang kali tanpa arah** (sering muncul pra-FOMC atau sesudah hari lonjakan ekstrem `> $60`)',
            'Jendela Silver Bullet NY AM',
            'Hari ketika Daily Loss Guard aktif'
          ],
          answerIndex: 1,
          explanation: 'Profil Seek & Destroy menyapu Stop Loss trader tren maupun reversal di kedua sisi; sikap profesional adalah diam dan melindungi modal.'
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
    // =========================================================================
    // BAGIAN V — BAB 30: PSIKOLOGI EKSEKUSI & PROTOKOL JURNAL 100 SAMPLE
    // =========================================================================
    {
      id: 'protokol-100-sample-mandiri',
      number: 30,
      levelId: 4,
      title: 'Psikologi Eksekusi (Anti-FOMO/Revenge) & Protokol Jurnal 100 Sample',
      readMinutes: 11,
      diagramId: 'graduation-100-samples',
      bookFormat: true,
      diagramAfterSection: 2,
      summary: '80% kebocoran profit bukan berasal dari salah teori, melainkan 4 virus emosi (FOMO, Revenge, Analysis Freeze, Euphoria). Kuasai penawar mekanisnya dan jalankan Protokol 100 Sample (50 Backtest + 30 Forward + 20 Live) terukur di Analitik Jurnal Pro.',
      bookSections: [
        {
          number: '30.1',
          heading: 'Mengapa 80% Kebocoran Profit Bukan Salah Teknik, Melainkan 4 Virus Emosi?',
          shortTitle: '4 Virus Emosi Scalper',
          paragraphs: [
            'Jika kamu membuka tab **Performa → Kebocoran** pada modul **Jurnal Trading Amy FX Pro** setelah mencatat 30 trade, hampir pasti kamu akan menemukan satu fakta mengejutkan: **strategimu sebenarnya sudah untung — yang membuat saldomu minus justru 4 atau 5 trade impulsif di luar rencana!**',
            'Otak manusia secara biologis tidak dirancang untuk menghadapi ketidakpastian uang secara *real-time*. Begitu uang sungguhan dipertaruhkan di XAU/USD yang bergerak cepat, muncul **4 Virus Emosi** yang membajak logikamu. Kabar baiknya: kamu tidak perlu menjadi robot tanpa perasaan — kamu cukup memasang **penawar mekanis (aturan luar)** yang memblokir virus tersebut sebelum jarimu menyentuh tombol order.'
          ]
        },
        {
          number: '30.2',
          heading: 'Peta 4 Virus Emosi Scalper & Penawar Mekanisnya',
          shortTitle: 'Penawar 4 Virus Emosi',
          paragraphs: [
            'Kenali gejala dini keempat virus emosi ini dan pasang aturan penawarnya di meja tradingmu:'
          ],
          table: {
            caption: '4 Virus Emosi Terbesar di XAU/USD & Protokol Penawar Mekanis',
            headers: ['Virus Emosi', 'Pemicu & Gejala Khas', 'Dampak ke Akun', 'Penawar Mekanis (Wajib Dijalankan)'],
            rows: [
              ['**1. FOMO** (*Takut Ketinggalan*)', 'Melihat candle besar melesat tanpa kamu → panik klik Market Order di ujung candle', 'SL melebar, R:R rusak (`< 1:1`), langsung terseret pullback normal', '**Hukum Bus:** Ada ratusan sesi London/NY tiap tahun; ketinggalan 1 trade saldo tetap `100%` utuh'],
              ['**2. Revenge Trading** (*Balas Dendam*)', 'Muncul 5 menit setelah kena SL → ego terluka ingin "balik modal sekarang juga" dengan lot 2×', '1 SL kecil berubah jadi `-6%` sampai `-15%` dalam satu sore', '**Jeda Paksa 30 Menit** pasca-SL + **Daily Loss Guard Maks 2× SL/hari**'],
              ['**3. Analysis Freeze** (*Kebanyakan Mikir*)', 'Setup Grade A+ sudah jelas, tapi ragu klik karena mencari "1 konfirmasi tambahan lagi" hingga harga keburu pergi', 'Hanya menonton setup menang, lalu akhirnya FOMO di setup jelek', 'Kunci **Checklist 5× YA** + kecilkan risiko ke **`0,5%`** agar beban mental hilang'],
              ['**4. Euphoria Win Streak** (*Terlalu PD*)', 'Baru mencatat `4× Win` beruntun → merasa kebal lalu menaikkan lot ke `3%–5%` di luar Killzone', '1 kali loss over-leverage menghapus seluruh profit 4 trade sebelumnya', '**Kunci Risiko Tetap `0,5%–1%`** di semua kondisi — menang ataupun kalah!']
            ]
          }
        },
        {
          number: '30.3',
          heading: 'Protokol 100 Sample: Jembatan Nyata Dari "Paham Teori" ke "Profit Konsisten"',
          shortTitle: 'Protokol 100 Sample',
          paragraphs: [
            'Jangan pernah langsung memasukkan tabungan besar ke akun real hanya karena baru selesai membaca buku ini! Trader institusional membangun keyakinan bukan dari "perasaan yakin", melainkan dari **data 100 sample nyata** yang terbagi ke dalam **3 tahap bertingkat**:',
            '• **Tahap 1 — 50 Sample Backtest Replay (Backtest Lab):** Kunci **1 Model Utama** (Bab 27). Jalankan **Candle Replay bar-by-bar** di XAU/USD sesi London & NY WITA tanpa mengintip candle masa depan (mencegah *Hindsight Bias*). Wajib catat **SEMUA** trade (yang TP maupun yang SL) tanpa curang menghapus loss!',
            '• **Tahap 2 — 30 Sample Forward Test (Akun Demo / Cent):** Eksekusi model yang sama persis di pasar live menggunakan uang virtual atau Akun Cent dengan risiko **`0,5%–1%`**. Rekam seluruh trade beserta **Tag Disiplin** (`Sesuai Plan`, `FOMO`, `Revenge`, dll.) ke **Jurnal Trading** (bisa cepat lewat fitur **Scan SS MT5**).',
            '• **Tahap 3 — 20 Sample Live Terukur & Scaling Bertahap:** Kamu baru sah naik ke akun real/prop firm jika rapor 30 trade Tahap 2 lolos **4 metrik objektif** di bawah ini!'
          ]
        },
        {
          number: '30.4',
          heading: '4 Metrik Kelulusan Objektif di Analitik Jurnal Pro (Rapor Siap Scaling)',
          shortTitle: '4 Metrik Kelulusan Jurnal',
          paragraphs: [
            'Berhenti mengukur kualitas tradingmu dari "hari ini untung berapa dolar". Evaluasi rapormu setiap akhir pekan (Sabtu/Minggu saat pasar Gold tutup) berdasarkan **4 metrik profesional** di tab **Performa** Jurnal Trading:'
          ],
          exampleBox: {
            title: 'Contoh Rapor 30 Trade Forward Test yang SAH LULUS Menuju Live Scaling',
            rows: [
              {
                label: 'Ringkasan 30 Sample (Model ICT 2022 · Risiko Tetap 1% = 1R)',
                detail: '**15 Win** (rata-rata `+2,1R` = **`+31,5R`**) · **12 Loss** (`-1,0R` = **`-12,0R`**) · **3 BE** (`0R`). Win Rate cukup **`50%`**, tetapi Net Profit mencapai **`+19,5R`**!'
              },
              {
                label: '4 Metrik Kelulusan Wajib di Analitik Jurnal Pro',
                detail: '1. **Profit Factor `≥ 1,40`:** Pada contoh ini `31,5R ÷ 12,0R` = **`2,62`** (LULUS!).\n2. **Expectancy Positif (`> +0,25R/trade`):** Pada contoh ini `+19,5R ÷ 30` = **`+0,65R` per trade** (LULUS!).\n3. **Max Drawdown Terkendali (`< 8%`):** Tidak ada 1 pun trade yang melampaui batas risiko `1%`.\n4. **Pelanggaran SOP / Kebocoran Emosi `< 10%`:** Maksimal 2–3 kesalahan manusia dari 30 trade — bukan 10 kali FOMO!'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Pencapaian Besar · Bagian V Tuntas!',
            title: 'Kamu Sekarang Sudah Punya Sistem Trading Lengkap Siap Pakai!',
            body: 'Sampai Bab 30 ini, kamu sebenarnya sudah memiliki **seluruh sistem trading XAU/USD yang utuh** untuk menghasilkan profit konsisten: Fondasi (Bagian I) + Struktur & Likuiditas (Bagian II) + Kompas Arah & Waktu (Bagian III) + Zona PD Array (Bagian IV) + Playbook Eksekusi, Manajemen SL/TP/Partial & Protokol 100 Sample (Bagian V). Di **Bagian VI** nanti, kita naik ke tingkat **ICT Institusional Lanjutan** dan ditutup dengan **Capstone Mapping Mandiri dari Chart Kosong**!'
          }
        }
      ],
      keyTakeaways: [
        'Tutup kebocoran profit dengan penawar mekanis 4 Virus Emosi: **Hukum Bus (FOMO)**, **Jeda 30 Menit + Maks 2 SL (Revenge)**, **Checklist 5× YA + Risiko `0,5%` (Analysis Freeze)**, dan **Kunci Risiko Tetap (Euphoria)**.',
        'Jalankan **Protokol 100 Sample** secara jujur: **50 Backtest Replay** (tanpa *Hindsight Bias*) → **30 Forward Test (Demo/Cent)** → **20 Live Terukur**.',
        'Syarat objektif naik ke akun real/scaling pada **Analitik Jurnal Pro**: **Profit Factor `≥ 1,40`**, **Expectancy positif**, **Max Drawdown `< 8%`**, dan **pelanggaran SOP `< 10%`**.',
        'Jadikan review mingguan setiap Sabtu/Minggu saat pasar tutup sebagai kebiasaan wajib untuk membedah tag kebocoran emosi.'
      ],
      bridgeNext: 'Selamat menuntaskan seluruh **Bagian V: Model Eksekusi, Filter Gagal & Manajemen Trade (Bab 25–30)**! Kini kamu siap memasuki babak pamungkas buku ini: **Bagian VI — ICT Institusional Lanjutan & Mapping Mandiri (Bab 31–36)** — 100% senjata tingkat lanjut tanpa mengulang dasar, dimulai dari **Bab 31: Balanced Price Range (BPR), Volume Imbalance & Gap Pembukaan (NWOG / NDOG)**.',
      practiceCta: {
        label: 'Mulai 50 Sample Backtest & Audit Jurnal Pro',
        description: 'Buka Backtest Replay Lab untuk mengumpulkan 50 sample bar-by-bar, lalu evaluasi Profit Factor & Kebocoran Emosi di Jurnal Trading.',
        href: 'trading-practice/candle-replay.html'
      },
      conceptBlocks: [
        {
          heading: '4 Virus Emosi Scalper & Protokol 100 Sample Terukur',
          paragraphs: [
            'Pasang penawar mekanis terhadap FOMO, Revenge Trading, Analysis Freeze, dan Euphoria, lalu buktikan sistem lewat Protokol 100 Sample (50 Backtest Replay → 30 Forward Test → 20 Live) dengan standar Profit Factor ≥ 1,40 dan Max Drawdown < 8%.'
          ]
        }
      ],
      mappingSteps: [
        'Selesaikan 50 sample Backtest Replay bar-by-bar pada 1 Model Utama tanpa melihat masa depan dan catat seluruh Win/Loss.',
        'Lanjutkan 30 sample Forward Test (Demo/Cent) dengan risiko tetap 0,5%–1% dan tag disiplin jujur di Jurnal Trading.',
        'Audit 4 metrik di Analitik Jurnal Pro (Profit Factor ≥ 1,40, Expectancy positif, Max DD < 8%, pelanggaran SOP < 10%) sebelum scaling modal.'
      ],
      decisionTree: [
        {
          condition: 'Baru saja mengalami 4 kali Win beruntun dan muncul dorongan menaikkan risiko menjadi 4% per trade.',
          action: 'Waspadai Virus Euphoria — pertahankan risiko tetap 0,5%–1% dan standar Checklist 5× YA yang sama persis.'
        },
        {
          condition: 'Dari 30 trade Forward Test, Profit Factor masih 0,95 dan terdapat 9 trade berlabel FOMO/Revenge.',
          action: 'Tunda naik ke akun real — perbaiki disiplin eksekusi di Demo/Cent selama 30 sample lagi hingga Profit Factor ≥ 1,40.'
        }
      ],
      validRules: [
        'Selesaikan minimal 50 sample Backtest + 30 sample Forward Test dengan 1 model utama sebelum scaling modal.',
        'Evaluasi performa dari 4 metrik objektif di Analitik Jurnal Pro: Profit Factor, Expectancy, Max Drawdown, dan Kebocoran Emosi.'
      ],
      invalidRules: [
        'Langsung deposit besar di akun real tanpa pernah punya data 30 trade di Jurnal.',
        'Memanipulasi hasil backtest dengan hanya mencatat setup yang kena TP dan melupakan yang kena SL.'
      ],
      xauScenario: {
        context: 'Rapor 30 trade Forward Test Model ICT 2022: 15 Win (+2,1R), 12 Loss (-1R), 3 BE.',
        steps: [
          'Profit Factor = 31,5R ÷ 12,0R = 2,62 (≥ 1,40); Expectancy = +19,5R ÷ 30 = +0,65R/trade.',
          'Max Drawdown < 8% dan kebocoran emosi < 10% → resmi sah naik ke tahap 20 Sample Live Terukur.'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Backtest Curang (Hindsight Bias)',
        context: 'Trader melihat chart yang sudah jadi dari kiri ke kanan lalu hanya mencatat setup yang kena TP ke Excel.',
        whyFailed: 'Saat masuk pasar live, data palsu itu tidak membantu mental menghadapi ketidakpastian dan langsung memicu panic loss.'
      },
      goldenRules: [
        'Data 100 sample mengubah harapan menjadi keyakinan matematis.',
        'Profit konsisten adalah efek samping alami dari eksekusi SOP yang bersih dan berulang.'
      ],
      quiz: [
        {
          question: 'Bagaimana urutan resmi **Protokol 100 Sample** sebelum melakukan scaling modal besar di akun real?',
          options: [
            'Langsung 100 trade di akun real pada minggu pertama',
            '**50 Sample Backtest Replay → 30 Sample Forward Test (Demo/Cent) → 20 Sample Live Terukur**',
            '100 kali mengganti strategi setiap kali kena 2 SL',
            '5 trade menang lalu langsung memakai leverage penuh'
          ],
          answerIndex: 1,
          explanation: 'Tahapan 50–30–20 membuktikan keunggulan matematis strategi pada data historis sekaligus menguji mental eksekusi live berisiko rendah.'
        },
        {
          question: 'Kamu baru saja mengalami 1 kali SL, lalu 5 menit kemudian ego terasa panas dan muncul dorongan langsung masuk trade baru dengan **lot 2× lipat** agar cepat balik modal. Virus emosi apa ini dan apa penawarnya?',
          options: [
            'Analysis Freeze — penawarnya tambah 5 indikator',
            '**Revenge Trading** — penawarnya **Jeda Paksa 30 Menit pasca-SL** dan kepatuhan **Daily Loss Guard Maks 2× SL/hari**',
            'Disiplin SOP — penawarnya teruskan klik',
            'Hindsight Bias — penawarnya ganti broker'
          ],
          answerIndex: 1,
          explanation: 'Dorongan impulsif membalikkan kerugian dalam sesi yang sama dengan lot lebih besar adalah gejala klasik Revenge Trading.'
        },
        {
          question: 'Apa sikap paling profesional setelah kamu mencatat **4 kali Win beruntun** dengan mulus?',
          options: [
            'Langsung menaikkan risiko menjadi `5%` per trade karena sedang hoki',
            '**Mempertahankan persentase risiko tetap (`0,5%–1%`)** dan standar Checklist 5× YA yang sama persis — waspadai virus **Euphoria / Overconfidence**',
            'Mulai entry di luar jam Killzone untuk mengejar target lebih cepat',
            'Berhenti mencatat trade ke Jurnal'
          ],
          answerIndex: 1,
          explanation: 'Euphoria pasca win streak sering memicu over-leverage yang menghapus seluruh profit beruntun hanya dalam satu trade ceroboh.'
        },
        {
          question: 'Manakah standar rapor **30 trade Forward Test** di Analitik Jurnal Pro yang menandakan kamu **sah lulus** menuju tahap akun real terukur?',
          options: [
            'Pernah hoki 1 kali profit `+$500` dengan risiko `15%` tanpa Jurnal',
            '**Profit Factor `≥ 1,40`**, **Expectancy positif**, **Max Drawdown `< 8%`**, dan **tingkat pelanggaran SOP / kebocoran emosi `< 10%`**',
            'Melakukan lebih dari 150 trade per minggu tanpa jeda',
            'Tidak pernah sekalipun mengalami Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Konsistensi profesional diukur dari Profit Factor, Expectancy, kontrol drawdown, dan disiplin SOP — bukan satu kali keberuntungan besar.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
