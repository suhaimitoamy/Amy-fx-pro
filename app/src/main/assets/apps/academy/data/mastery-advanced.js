/* Amy FX Academy — Mastery ICT Lanjutan & Mapping Mandiri (Modul 37–43)
 * 100% Materi ICT Baru (0% Duplikasi dari Modul 01–36):
 * 37. Breaker Block, Mitigation Block & ICT Unicorn Model
 * 38. Balanced Price Range (BPR), Volume Imbalance (VI) & NWOG/NDOG
 * 39. SMT Divergence (XAU/USD vs XAG/USD Silver & DXY)
 * 40. Market Maker Buy & Sell Model (MMXM)
 * 41. ICT Macros (xx:50–xx:10), Weekly Profile (TGIF) & IPDA Lookback (20/40/60 Hari)
 * 42. Standard Deviation Projections (-1/-2/-2.5/-4) & Candle Range Theory (CRT / OHLC)
 * 43. Capstone: Protokol Mapping Mandiri dari Chart Kosong (Zero-Indicator)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AmyAcademyPart4 = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const LEVELS = [
    {
      id: 7,
      code: 'Fase 07',
      title: 'ICT Institusional Lanjutan & Mapping Mandiri',
      tagline: 'Tujuh senjata ICT tingkat lanjut tanpa mengulang teori dasar, ditutup dengan protokol mapping mandiri dari layar chart kosong.'
    }
  ];

  const LESSONS = [
    {
      id: 'breaker-mitigation-unicorn',
      levelId: 7,
      number: 31,
      title: 'Breaker Block, Mitigation Block & ICT Unicorn Model',
      readMinutes: 8,
      diagramId: 'breaker-mitigation-unicorn',
      summary: 'Saat struktur gagal tidak berarti peluang habis. Pelajari bagaimana Order Block yang ditembus keras berubah menjadi Breaker Block, bedanya dengan Mitigation Block, dan cara mengeksekusi model konfluensi paling tajam di Gold: ICT Unicorn.',
      conceptBlocks: [
        {
          heading: 'Kenapa Struktur Gagal Justru Melahirkan Benteng Terkuat (Breaker Block)',
          paragraphs: [
            'Ketika pasar membentuk swing terakhir lalu menyapu likuiditas di ujungnya (misalnya membuat Higher High tipis menyapu BSL) dan kemudian langsung dibanting menembus swing bawahnya secara impulsif, candle/blok terakhir sebelum sweep itu menjadi jebakan bagi trader yang masuk terlalu cepat. Blok yang "jebol" itulah Breaker Block (BB).',
            'Secara psikologis & institusional, smart money membangun posisi lawan di titik sweep tersebut. Ketika harga kembali (retrace) menyentuh area Breaker Block dari sisi sebaliknya, institusi melepas sisa posisi rugi (mitigasi BEP) sekaligus menambah dorongan searah tren baru — membuat pantulan di Breaker sering jauh lebih keras dan bersih dibanding Order Block biasa.'
          ]
        },
        {
          heading: 'Beda Tajam Breaker Block vs Mitigation Block',
          paragraphs: [
            'Banyak trader mencampuradukkan keduanya padahal syarat strukturnya berbeda jelas:\n• **Breaker Block (BB):** WAJIB didahului oleh **Liquidity Sweep** (membuat Higher High tipis untuk Bearish Breaker, atau Lower Low tipis untuk Bullish Breaker) sebelum ditembus balik secara agresif. Kekuatan: **Sangat Tinggi (A+)**.\n• **Mitigation Block (MB):** **TIDAK ada Liquidity Sweep** di puncaknya — harga gagal menembus High lama (membuat Lower High untuk Bearish Mitigation, atau Higher Low untuk Bullish Mitigation) lalu langsung jebol menembus swing tengah. Kekuatan: **Menengah–Tinggi (A)**, butuh konfluensi tambahan.'
          ]
        },
        {
          heading: 'ICT Unicorn Model: Irisan Presisi Breaker Block + FVG',
          paragraphs: [
            'ICT Unicorn bukanlah pola rumit baru, melainkan **irisan tumpang tindih (overlap)** antara **Breaker Block** dengan **Fair Value Gap (FVG)** yang tercipta tepat saat dorongan Displacement menjebol struktur. Di XAU/USD, saat zona Breaker Block dan kotak FVG berada pada rentang harga yang sama, algoritma memiliki dua alasan sekaligus untuk bereaksi di titik itu — menghasilkan rasio win-rate dan kecepatan reaksi tertinggi di sesi London & New York.'
          ]
        }
      ],
      mappingSteps: [
        'Tandai swing terakhir yang baru saja menyapu likuiditas (misal High baru yang mengambil BSL / PDH) — catat juga Swing Low tepat di sebelah kirinya.',
        'Tunggu satu dorongan Displacement kuat yang menutup body candle menembus Swing Low tersebut (terjadi MSS).',
        'Tarik kotak horizontal dari Low sampai High candle bullish terakhir (atau rangkaian candle naik terakhir) tepat sebelum harga membuat puncak sweep tadi — itulah kotak **Bearish Breaker Block**.',
        'Periksa apakah dorongan jebol tadi juga meninggalkan celah FVG yang memotong atau bertumpuk dengan kotak Breaker. Area irisan keduanya adalah **Zona Unicorn**.',
        'Pasang rencana entry saat harga retrace menyentuh batas bawah Bearish Breaker / irisan Unicorn dengan SL di atas puncak sweep atau di atas batas atas Breaker + napas spread.'
      ],
      decisionTree: [
        {
          condition: 'Harga menjebol struktur dengan Displacement, tetapi puncak sebelumnya TIDAK menyapu High lama (malah membentuk Lower High). Apakah ini Breaker?',
          action: 'Bukan Breaker — itu **Mitigation Block**. Tetap boleh dipakai, tetapi wajib ada FVG yang menumpuk di atasnya dan bias H1 searah. Jika tidak ada FVG, lebih baik skip.'
        },
        {
          condition: 'Kotak Breaker Block terlalu lebar ($6–$9 di XAU/USD) dan FVG ada di bagian tengahnya. Entry di tepi atau di tengah?',
          action: 'Gunakan **area irisan Unicorn (overlap Breaker + FVG)** sebagai titik entry utama agar Stop Loss tetap ringkas ($2.5–$4) dan R:R minimal 1:2 tetap terjaga.'
        },
        {
          condition: 'Harga kembali ke Bearish Breaker tetapi menutup body M5 secara solid menembus batas atas Breaker.',
          action: 'Setup **BATAL TOTAL**. Jangan menahan harapan atau averaging — Breaker yang ditutup body keluar berarti arus order institusi sudah berubah arah.'
        }
      ],
      validRules: [
        'Bearish Breaker wajib punya urutan: Swing Low → Sweep High baru (ambil BSL) → Displacement jebol Swing Low dengan body close.',
        'Bullish Breaker wajib punya urutan: Swing High → Sweep Low baru (ambil SSL) → Displacement jebol Swing High dengan body close.',
        'Untuk Unicorn Model, kotak FVG hasil Displacement harus tumpang tindih langsung dengan rentang harga Breaker Block.',
        'Lokasi ideal berada di ujung Premium (untuk Bearish) atau Discount (untuk Bullish) dari Dealing Range H1/M15.'
      ],
      invalidRules: [
        'Menyebut setiap support/resistance jebol sebagai Breaker padahal tidak ada Displacement maupun sweep likuiditas.',
        'Memakai Breaker Block yang sudah disentuh berulang kali (tidak fresh) di tengah konsolidasi Asia yang sempit.',
        'Entry Unicorn melawan Draw on Liquidity (DOL) H1 hanya karena melihat bentuknya rapi di M1.'
      ],
      xauScenario: {
        context: 'Sesi NY Open (20:35 WITA), Bias H1 Bearish menuju PDL 2.632. XAU/USD melonjak menyapu London High di 2.654,50 lalu langsung dibanting menembus Swing Low 2.648,00.',
        steps: [
          'Identifikasi rangkaian candle bullish terakhir di 2.650,00 – 2.652,40 (tepat sebelum puncak sweep 2.654,50) sebagai Bearish Breaker Block.',
          'Saat harga jatuh menembus 2.648,00, tercipta SIBI (Bearish FVG) di 2.649,20 – 2.651,80 yang bertumpuk langsung dengan Breaker → **Zona Unicorn di 2.650,00 – 2.651,80**.',
          'Retrace M5 naik menyentuh 2.650,80 lalu meninggalkan sumbu atas panjang → eksekusi Sell di 2.650,50, SL di 2.655,00 (di atas sweep), TP1 di 2.641,50 (1:2) dan TP2 di PDL 2.632,00.'
        ]
      },
      failedCase: {
        title: 'Contoh Kasus Gagal (Kenapa Kena SL?)',
        context: 'Sesi Asia (10:15 WITA), harga naik tipis 20 pips lalu turun menembus micro-low di M5 tanpa menyapu High sesi mana pun dan tanpa candle Displacement besar.',
        whyFailed: 'Trader mengira itu Bearish Breaker dan langsung Sell saat retrace. Saat London Open tiba, harga menyapu seluruh rentang Asia ke atas dan menghantam SL — karena tidak ada sweep likuiditas nyata, tidak ada FVG (bukan Unicorn), dan terjadi di luar Killzone.'
      },
      goldenRules: [
        'Breaker Block = Sweep + Jebol Balik Agresif. Tanpa sweep di ujungnya, itu Mitigation Block, bukan Breaker.',
        'ICT Unicorn (irisan Breaker + FVG) adalah filter kualitas tertinggi: dua alasan institusi bertemu di satu koordinat harga.'
      ],
      quiz: [
        {
          question: 'Apa syarat struktur yang membedakan Bearish Breaker Block dari Bearish Mitigation Block?',
          options: [
            'Breaker Block wajib didahului Sweep membuat High baru (ambil BSL) sebelum jebol menembus Swing Low, sedangkan Mitigation Block gagal membuat High baru (Lower High)',
            'Breaker Block hanya muncul di timeframe Daily, sedangkan Mitigation Block hanya di M1',
            'Mitigation Block tidak memerlukan Displacement, sedangkan Breaker tidak perlu break struktur',
            'Keduanya sama persis, hanya berbeda warna candle'
          ],
          answerIndex: 0,
          explanation: 'Inti perbedaan struktural ICT: Breaker selalu memiliki sweep likuiditas (HH tipis atau LL tipis) sebelum berbalik menjebol swing lawan, sedangkan Mitigation gagal mencapai swing ekstrem sebelumnya.'
        },
        {
          question: 'Dalam ICT Unicorn Model, dua elemen apa yang wajib tumpang tindih (overlap) di rentang harga yang sama?',
          options: [
            'RSI Oversold dan Moving Average 200',
            'Breaker Block dan Fair Value Gap (FVG) hasil dorongan Displacement',
            'Asia High dan Weekly Open saja',
            'Dua candlestick Doji yang bersebelahan'
          ],
          answerIndex: 1,
          explanation: 'Unicorn Model adalah pertemuan presisi antara kotak Breaker Block dengan kotak FVG yang lahir saat harga menjebol struktur, memberikan konfluensi ganda pada satu koordinat.'
        },
        {
          question: 'Harga membentuk Bullish Breaker di 2.640–2.642 (setelah menyapu SSL 2.637 dan menjebol Swing High 2.645). Saat retrace, candle M5 menutup body penuh di 2.638,50. Apa keputusan mekanis yang benar?',
          options: [
            'Langsung Buy dua kali lipat karena harga makin murah',
            'Tunggu 5 candle lagi sambil menghapus Stop Loss',
            'Setup Bullish Breaker batal total karena body sudah menembus keluar batas bawah Breaker — jangan entry Buy',
            'Ubah timeframe ke M1 untuk mencari alasan tetap Buy'
          ],
          answerIndex: 2,
          explanation: 'Body close menembus keluar seluruh rentang Breaker Block menandakan institusi tidak mempertahankan zona tersebut. Disiplin ICT mewajibkan batal entry.'
        },
        {
          question: 'Kamu menemukan Bearish Mitigation Block (tanpa sweep di puncak) pada M5, namun tidak ada FVG yang menumpuk dan Bias H1 sedang Bullish kuat. Tindakan terbaik?',
          options: [
            'Tetap Sell karena Mitigation Block selalu akurat 90%',
            'Skip setup — Mitigation Block tanpa sweep, tanpa FVG, dan melawan bias H1 memiliki probabilitas rendah',
            'Entry Sell dengan lot 2x lebih besar untuk menutup jarak target pendek',
            'Geser garis supaya terlihat seperti Breaker Block'
          ],
          answerIndex: 1,
          explanation: 'Mitigation Block memiliki daya tolak lebih rendah dari Breaker dan tidak boleh dipakai melawan arus HTF tanpa konfluensi kuat.'
        },
        {
          question: 'Di mana penempatan Stop Loss paling logis saat mengeksekusi Bearish Unicorn (Breaker 2.650–2.652 + FVG 2.649,50–2.651,50, puncak sweep di 2.654,20)?',
          options: [
            'Tepat di 2.651,60 supaya SL sangat tipis 0.5 poin',
            'Di atas puncak sweep (misal 2.654,80–2.655,20) atau minimal di atas batas atas Breaker + napas spread jika puncak terlalu jauh',
            'Tanpa SL karena Unicorn tidak mungkin gagal',
            'Di bawah harga entry saat ini'
          ],
          answerIndex: 1,
          explanation: 'Puncak sweep adalah titik invalidasi struktural sejati. Meletakkan SL tepat di atas puncak sweep + napas spread melindungi posisi dari retest sumbu agresif khas XAU/USD.'
        }
      ]
    },
    {
      id: 'bpr-nwog-ndog-imbalance',
      levelId: 7,
      number: 32,
      title: 'Balanced Price Range (BPR), Volume Imbalance & NWOG/NDOG',
      readMinutes: 8,
      diagramId: 'bpr-nwog-ndog',
      summary: 'Selain celah 3-candle biasa, algoritma Gold sangat menghormati tiga jejak ketimpangan tersembunyi: Balanced Price Range (irisan dua FVG berlawanan), Volume Imbalance antar-body, dan Gap Pembukaan Minggu/Hari (NWOG/NDOG).',
      conceptBlocks: [
        {
          heading: 'Balanced Price Range (BPR): Ketika Dua FVG Berlawanan Saling Mengunci',
          paragraphs: [
            'Bayangkan harga melesat naik cepat meninggalkan Bullish FVG (BISI), lalu tidak lama kemudian harga langsung dibanting turun secara agresif menembus area yang sama dan meninggalkan Bearish FVG (SIBI). Area **irisan tumpang tindih** antara FVG naik dan FVG turun itulah **Balanced Price Range (BPR)**.',
            'Kenapa BPR sangat kuat? Karena area tersebut baru saja melalui "penawaran beli" sekaligus "penawaran jual" secara ekstrem — kini pasar sudah menyeimbangkan harga di sana dan menyisakan dominasi arus terakhir (pada contoh di atas: Bearish). Ketika harga kembali menyentuh kotak BPR, ia bekerja seperti dinding kaca yang sangat sulit ditembus balik.'
          ]
        },
        {
          heading: 'Volume Imbalance (VI): Celah Kecil Antar-Body yang Diabaikan Ritel',
          paragraphs: [
            'Pada XAU/USD saat volatilitas tinggi, sering muncul celah tipis antara harga **Close candle pertama** dan harga **Open candle kedua**, meskipun sumbu (wick) keduanya masih saling bersentuhan. Celah antar-body inilah **Volume Imbalance (VI)**.',
            'Trader ritel tidak melihatnya karena tidak ada "gap kosong penuh", padahal bagi algoritma harga, celah antar-body itu adalah titik ketidakseimbangan eksekusi. Harga sangat sering memantul presisi tepat di tepi atas/bawah atau titik tengah 50% Volume Imbalance.'
          ]
        },
        {
          heading: 'NWOG & NDOG: Jangkar Algoritma Pembukaan Minggu & Hari',
          paragraphs: [
            '• **NWOG (New Week Opening Gap):** Celah antara harga **Close hari Jumat** (17:00 NY / Sabtu 05:00 WITA) dan harga **Open hari Minggu malam** (18:00 NY / Senin 06:00 WITA). NWOG tetap relevan sepanjang minggu berjalan — bahkan hingga 3–4 minggu ke depan!\n• **NDOG (New Day Opening Gap):** Celah antara harga **Close harian** (17:00 NY) dan **Open harian baru** (18:00 NY — jeda 1 jam rollover Gold). Di XAU/USD, harga sering tertarik kembali mengisi NDOG sebelum memulai ekspansi sesi London atau New York.'
          ]
        }
      ],
      mappingSteps: [
        'Setiap Senin pagi (07:00 WITA), buka M15/M5 dan tarik kotak tipis antara **Close Jumat** dan **Open Senin** → beri label **NWOG** beserta garis tengah 50% CE-nya. Biarkan garis ini aktif sepanjang minggu.',
        'Setiap pagi Selasa–Jumat (07:00 WITA), tandai **NDOG** (celah antara Close 05:00 WITA dan Open 06:00 WITA) untuk mengetahui magnet pembukaan hari ini.',
        'Saat melihat pembalikan tajam berbentuk "V" (naik cepat lalu langsung dibanting turun cepat, atau sebaliknya), periksa apakah FVG pertama dan FVG kedua saling berpotongan. Kotak irisan keduanya tandai sebagai **BPR**.',
        'Jika harga melesat tanpa FVG klasik tetapi ada loncatan Open–Close antar-body, tandai celah body itu sebagai **Volume Imbalance (VI)** sebagai titik retest presisi.'
      ],
      decisionTree: [
        {
          condition: 'Di hari Senin/Selasa, harga XAU/USD dibuka gap naik $12 di atas Close Jumat (NWOG besar). Apakah langsung Sell untuk "tutup gap"?',
          action: 'JANGAN langsung Sell buta! Tunggu sesi London/NY — jika harga naik menyapu High Asia dulu lalu MSS Bearish di M5, barulah NWOG (dan garis 50%-nya) menjadi **target Draw on Liquidity (DOL)** utama.'
        },
        {
          condition: 'Ada kotak BPR dan ada kotak Order Block biasa yang jaraknya berdekatan. Mana yang lebih sensitif terhadap pantulan?',
          action: 'Biasanya **BPR bereaksi lebih dulu dan lebih tajam**, terutama jika berada di atas/bawah 50% Dealing Range. Amati reaksi penolakan sumbu di tepi BPR sebelum harga sempat menyentuh OB di belakangnya.'
        },
        {
          condition: 'Jarak NWOG sangat tipis (hanya $0.30 di Gold). Apakah tetap dipakai?',
          action: 'Tetap tandai sebagai 1 garis referensi ("Weekly Open Anchor"), bukan kotak entry tersendiri. NWOG paling efektif sebagai zona reaksi jika lebarnya ≥ $1.50 – $2.00 di XAU/USD.'
        }
      ],
      validRules: [
        'BPR wajib terbentuk dari dua dorongan impulsif berlawanan arah (keduanya meninggalkan FVG) yang rentang harganya saling tumpang tindih.',
        'NWOG diukur ketat dari Close Jumat 17:00 NY ke Open Minggu 18:00 NY beserta garis tengah 50%-nya.',
        'Volume Imbalance hanya bernilai tinggi jika muncul di dalam leg Displacement searah bias HTF, bukan di pasar mati sesi Asia.'
      ],
      invalidRules: [
        'Menganggap setiap gap broker yang muncul karena koneksi putus/data error sebagai Volume Imbalance.',
        'Menghapus garis NWOG hanya karena sudah tersentuh sekali di hari Senin — NWOG sering dipakai ulang sampai hari Kamis/Jumat.',
        'Mengejar entry di BPR yang terbentuk di tengah range sideways tanpa perubahan struktur.'
      ],
      xauScenario: {
        context: 'Senin 15:20 WITA (London Killzone). NWOG Senin berada di 2.660,00 (Close Jumat) – 2.664,00 (Open Senin), titik 50% di 2.662,00.',
        steps: [
          'Harga sesi Asia sempat naik ke 2.671 lalu membentuk pola "V" tajam: naik meninggalkan BISI 2.666–2.669, lalu dibanting turun meninggalkan SIBI 2.665–2.668.',
          'Irisan keduanya (2.666–2.668) membentuk **Bearish BPR** yang searah dengan magnet NWOG di bawah.',
          'Harga retrace ke 2.666,50 (tepi bawah BPR), menolak keras dengan sumbu atas → Sell di 2.666,20, SL 2.670,00, TP1 tepat di tepi atas NWOG 2.664,00 dan TP2 di 50% NWOG 2.662,00 hingga Close Jumat 2.660,00.'
        ]
      },
      failedCase: {
        title: 'Contoh Kasus Gagal (Kenapa Kena SL?)',
        context: 'Senin 06:05 WITA (5 menit setelah pasar buka), muncul NWOG $15 ke atas. Trader langsung klik Sell besar-besaran dengan asumsi "gap pasti langsung tutup pagi ini".',
        whyFailed: 'Spread pembukaan Senin di XAU/USD melebar 5–10x normal dan tren fundamental sedang menguat. Harga justru melesat naik $25 lagi tanpa menoleh sebelum baru kembali ke NWOG pada hari Rabu. Kesalahan: menganggap NWOG sebagai sinyal entry instan tanpa menunggu struktur reversal di Killzone.'
      },
      goldenRules: [
        'BPR adalah "jejak dua kali seimbang" yang menyisakan dominasi arah terakhir — reaksi pantulannya sangat presisi.',
        'Tandai NWOG setiap Senin pagi dan jangan hapus sampai Jumat; ia bekerja sekaligus sebagai magnet target (DOL) dan dinding pantulan.'
      ],
      quiz: [
        {
          question: 'Bagaimana syarat terbentuknya Balanced Price Range (BPR) yang valid?',
          options: [
            'Satu candle bullish besar diikuti 5 candle sideways kecil',
            'Irisan tumpang tindih antara Bullish FVG dan Bearish FVG yang lahir dari dua gerakan impulsif berlawanan arah',
            'Jarak antara High sesi Asia dan Low sesi Asia',
            'Selisih antara harga Bid dan Ask saat berita CPI'
          ],
          answerIndex: 1,
          explanation: 'BPR adalah zona tumpang tindih (overlap) antara BISI dan SIBI berlawanan arah, menandakan area harga sudah diseimbangkan dua arah dan kini didominasi impuls terakhir.'
        },
        {
          question: 'Apa perbedaan utama antara Volume Imbalance (VI) dan Fair Value Gap (FVG)?',
          options: [
            'Volume Imbalance adalah celah antar-body (Close candle 1 ke Open candle 2) walau sumbu masih bersentuhan, sedangkan FVG adalah celah 3-candle tanpa tersentuh sumbu candle 1 dan 3',
            'Volume Imbalance hanya muncul di saham, tidak pernah di XAU/USD',
            'Volume Imbalance membutuhkan minimal 5 candle',
            'Tidak ada perbedaan sama sekali'
          ],
          answerIndex: 0,
          explanation: 'Volume Imbalance melihat celah murni antara Close dan Open dua candle berurutan meskipun wick saling tumpang tindih.'
        },
        {
          question: 'Dari titik harga mana ke mana NWOG (New Week Opening Gap) diukur secara resmi dalam ICT?',
          options: [
            'Dari High hari Senin ke Low hari Jumat',
            'Dari harga Close penutupan Jumat (17:00 NY) ke harga Open pembukaan Minggu malam (18:00 NY)',
            'Dari pembukaan sesi London ke pembukaan sesi New York',
            'Dari harga penutupan candle H1 jam 00:00 WITA'
          ],
          answerIndex: 1,
          explanation: 'NWOG selalu diukur dari penutupan resmi pasar Jumat (17:00 NY) ke pembukaan resmi minggu baru (18:00 NY Minggu / 06:00 WITA Senin).'
        },
        {
          question: 'Senin pagi pukul 06:10 WITA, Gold dibuka gap naik $10 di atas Close Jumat (NWOG). Apa penggunaan NWOG yang paling disiplin?',
          options: [
            'Langsung Sell tanpa menunggu konfirmasi karena gap pasti langsung ditutup detik itu juga',
            'Tandai rentang NWOG + garis 50%-nya sebagai jangkar/magnet (DOL) lalu tunggu konfirmasi struktur di Killzone London atau NY',
            'Hapus NWOG setelah jam 08:00 WITA karena sudah kadaluarsa',
            'Abaikan NWOG jika bias harian sedang Bullish'
          ],
          answerIndex: 1,
          explanation: 'NWOG adalah level referensi & magnet institusi sepanjang minggu — bukan tombol entry buta saat spread Senin pagi sedang melebar.'
        },
        {
          question: 'Harga turun cepat meninggalkan SIBI (2.650–2.654), lalu tiba-tiba ditembak naik agresif menembus area yang sama meninggalkan BISI (2.651–2.655). Di rentang mana Bullish BPR berada?',
          options: [
            '2.650 – 2.655 seluruhnya',
            '2.651 – 2.654 (area irisan tumpang tindih antara kedua FVG)',
            'Di bawah 2.650 saja',
            'Di atas 2.655 saja'
          ],
          answerIndex: 1,
          explanation: 'BPR adalah irisan (intersection) antara dua FVG berlawanan: max(2.650, 2.651) = 2.651 hingga min(2.654, 2.655) = 2.654.'
        }
      ]
    },
    {
      id: 'smt-divergence-gold',
      levelId: 7,
      number: 33,
      title: 'SMT Divergence (XAU/USD vs XAG/USD Silver & DXY)',
      readMinutes: 8,
      diagramId: 'smt-divergence-gold',
      summary: 'Senjata rahasia konfirmasi reversal institusional: saat Gold dan Silver (atau DXY) tidak lagi bergerak serempak di titik likuiditas kunci, itulah sidik jari manipulasi Smart Money yang paling sulit dipalsukan.',
      conceptBlocks: [
        {
          heading: 'Apa Itu SMT Divergence (Smart Money Technique)?',
          paragraphs: [
            'Pasangan aset yang berkorelasi erat seharusnya membuat Swing High dan Swing Low secara bersamaan. **SMT Divergence** terjadi ketika di sebuah titik waktu & level likuiditas kunci (misalnya PDH/PDL atau London High/Low), **satu aset berhasil menyapu likuiditas (membuat High/Low baru), sementara aset pasangannya GAGAL menembus level yang sama**.',
            'Retakan korelasi inilah bukti paling nyata bahwa pergerakan menyapu level di salah satu aset tersebut adalah **stop hunt (manipulasi)**, bukan dorongan fundamental sejati untuk melanjutkan tren.'
          ]
        },
        {
          heading: 'Dua Pasangan Korelasi Wajib untuk Trader XAU/USD',
          paragraphs: [
            '1. **Korelasi Searah — XAU/USD (Gold) vs XAG/USD (Silver):**\n• **Bullish SMT:** XAU/USD membuat **Lower Low** (menyapu SSL), sementara di jam/candle yang sama XAG/USD gagal turun lebih rendah (**Higher Low**) — atau sebaliknya. Artinya tekanan jual sedang dimanipulasi dan siap berbalik NAIK.\n• **Bearish SMT:** XAU/USD membuat **Higher High** (menyapu BSL), sementara XAG/USD membuat **Lower High** — sinyal kuat distribusi turun.\n\n2. **Korelasi Terbalik — XAU/USD (Gold) vs DXY (US Dollar Index):**\n• Karena Gold dan Dolar bergerak berlawanan, kondisi normalnya: saat Gold membuat Low baru, DXY harus membuat High baru.\n• **Bullish SMT pada Gold:** Gold turun membuat **Lower Low**, tetapi DXY **GAGAL** membuat Higher High (DXY malah Lower High) → Dolar kehabisan tenaga, Gold siap melesat naik!\n• **Bearish SMT pada Gold:** Gold naik membuat **Higher High**, tetapi DXY **GAGAL** membuat Lower Low (DXY malah Higher Low) → Dolar mulai menguat diam-diam, Gold rawan banting turun!'
          ]
        }
      ],
      mappingSteps: [
        'Siapkan 2 chart pembanding di sebelah XAU/USD: **XAG/USD** (pasangan logam searah) dan **DXY** (pasangan dolar terbalik) pada timeframe yang sama (H1 atau M15).',
        'Tunggu XAU/USD menyentuh atau menyapu level likuiditas penting (PDH/PDL, Asia High/Low, atau London High/Low) di dalam jam Killzone.',
        'Bandingkan **dua titik puncak (atau dua titik dasar) pada jam yang sama persis** antara XAU/USD dan XAG/USD (atau DXY).',
        'Jika salah satu menyapu swing lama dan yang lain gagal menembus swing-nya → **SMT Divergence Terkonfirmasi!**',
        'JANGAN langsung klik entry hanya karena SMT: turun ke M5 dan tunggu **MSS/CISD + PD Array (FVG/OB/Unicorn)** di XAU/USD sebagai pemicu eksekusi.'
      ],
      decisionTree: [
        {
          condition: 'SMT muncul di tengah-tengah chart (tidak di PDH/PDL, tidak di Asia/London High-Low, dan tidak di HTF PD Array). Apakah valid?',
          action: '**TIDAK VALID (Noise).** SMT hanya bermakna jika terjadi tepat di **Time (Killzone)** dan **Key Level (Liquidity Pool atau HTF POI)**.'
        },
        {
          condition: 'Antara XAU/USD dan XAG/USD terjadi Bullish SMT: XAU membuat Lower Low, XAG membuat Higher Low. Jika sama-sama ingin Buy, mana yang lebih kuat?',
          action: 'Aset yang **lebih kuat relatif (membuat Higher Low / menolak turun)** biasanya melesat lebih kencang saat ekspansi, sedangkan aset yang menyapu Lower Low punya ruang likuiditas bersih. Karena fokus utama kita di XAU/USD, SMT dari Silver sudah cukup menjadi **konfirmasi lampu hijau** untuk eksekusi Buy di XAU/USD pasca-CISD.'
        },
        {
          condition: 'XAU vs XAG tidak ada SMT (keduanya sama-sama cetak Higher High), tapi XAU vs DXY ada Bearish SMT (DXY gagal buat Lower Low). Apakah tetap valid?',
          action: '**Ya, valid!** DXY adalah penggerak makro langsung untuk XAU/USD. Cukup salah satu konfirmasi (XAG atau DXY) di level kunci + Killzone untuk menaikkan probabilitas reversal.'
        }
      ],
      validRules: [
        'Titik pembanding antar-aset WAJIB berada pada **waktu (timestamp) dan timeframe yang sama persis**.',
        'SMT terjadi tepat pada level likuiditas signifikan (PDH/PDL, PWH/PWL, Session High/Low) atau HTF PD Array.',
        'Selalu digabungkan dengan konfirmasi struktur lokal (MSS/CISD) sebelum eksekusi.'
      ],
      invalidRules: [
        'Membandingkan puncak hari Selasa di Gold dengan puncak hari Kamis di Silver (waktu tidak sinkron).',
        'Langsung melawan tren besar hanya karena melihat SMT mikro di M1 di luar jam Killzone.',
        'Menganggap SMT sebagai tombol entry instan tanpa menunggu penutupan candle perubahan arah (CISD/MSS).'
      ],
      xauScenario: {
        context: 'NY AM Killzone (20:45 WITA). XAU/USD turun menembus London Low di 2.638,00 (cetak Lower Low 2.636,50).',
        steps: [
          'Cek XAG/USD pada jam 20:45 WITA yang sama: Silver tertahan di atas London Low-nya (cetak Higher Low) → **Bullish SMT XAU vs XAG aktif**.',
          'Cek DXY: pada jam yang sama DXY gagal menembus London High-nya (cetak Lower High) → **Konfluensi Ganda Bullish SMT**.',
          'Di M5 XAU/USD muncul candle bullish menutup body di atas candle turun terakhir (CISD) + BISI di 2.638,20–2.640,00 → Entry Buy di 2.639,00, SL 2.635,80, target NY/London High 2.652,00.'
        ]
      },
      failedCase: {
        title: 'Contoh Kasus Gagal (Kenapa Kena SL?)',
        context: 'Pukul 11:30 WITA (sepi menjelang London), di tengah range acak M5, Gold cetak titik sedikit lebih tinggi dibanding 20 menit lalu sementara Silver sedikit lebih rendah. Trader langsung Sell.',
        whyFailed: 'Terjadi di luar Killzone dan tidak berada di level likuiditas kunci mana pun (bukan PDH, bukan Asia High). Begitu sesi London dibuka jam 14:00 WITA, kedua aset serentak meledak naik menembus SL.'
      },
      goldenRules: [
        'SMT Divergence = Sidik jari manipulasi Smart Money. Tanpa Key Level dan tanpa Killzone, SMT hanyalah kebisingan.',
        'Ingat polaritasnya: XAU vs XAG itu **searah**, sedangkan XAU vs DXY itu **terbalik**.'
      ],
      quiz: [
        {
          question: 'Kondisi mana yang menunjukkan **Bullish SMT Divergence** antara XAU/USD (Gold) dan DXY (US Dollar Index)?',
          options: [
            'XAU/USD mencetak Lower Low (menyapu SSL), sementara pada waktu yang sama DXY GAGAL mencetak Higher High (malah Lower High)',
            'XAU/USD mencetak Lower Low dan DXY serempak mencetak Higher High yang sangat kuat',
            'XAU/USD mencetak Higher High dan DXY juga mencetak Higher High secara acak di sesi Asia',
            'XAU/USD diam sideways sementara DXY tutup pasar'
          ],
          answerIndex: 0,
          explanation: 'Karena korelasi XAU/USD dan DXY berlawanan, kegagalan DXY menembus High saat Gold mencetak Low baru menandakan kekuatan Dolar palsu dan Gold siap berbalik naik.'
        },
        {
          question: 'Kondisi mana yang menunjukkan **Bearish SMT Divergence** antara XAU/USD dan XAG/USD (Silver)?',
          options: [
            'XAU/USD mencetak Higher High menyapu PDH, sementara di jam yang sama XAG/USD gagal menembus PDH-nya (Lower High)',
            'Keduanya sama-sama menembus PDH dengan Displacement tebal',
            'XAU/USD mencetak Lower Low sementara XAG/USD mencetak Higher Low',
            'XAU/USD naik di hari Senin dan XAG/USD turun di hari Jumat'
          ],
          answerIndex: 0,
          explanation: 'Gold dan Silver berkorelasi searah. Ketika satu menyapu puncak (HH) dan pasangannya gagal (LH) di waktu yang sama, terjadi retakan korelasi Bearish SMT.'
        },
        {
          question: 'Syarat wajib agar SMT Divergence tidak menjadi sinyal palsu (noise) adalah...',
          options: [
            'Cukup melihat grafik M1 kapan saja',
            'Terjadi pada timestamp yang sama persis, di level likuiditas kunci / HTF PD Array, dan idealnya di dalam jam Killzone',
            'Wajib ditambah indikator MACD dan Stochastic',
            'Hanya boleh dipakai pada hari Jumat malam'
          ],
          answerIndex: 1,
          explanation: 'SMT bekerja karena konteks Time & Price: waktu identik, lokasi likuiditas kunci, dan sesi institusional (Killzone).'
        },
        {
          question: 'Setelah melihat Bullish SMT valid antara Gold dan Silver tepat di PDL pada jam 20:30 WITA, apa langkah eksekusi yang paling aman?',
          options: [
            'Langsung tekan Buy Market detik itu juga tanpa menunggu candle tutup',
            'Turun ke M5 dan tunggu konfirmasi perubahan arah (MSS/CISD + FVG/OB) di XAU/USD sebelum entry',
            'Tunggu sampai harga kembali menembus PDH dulu baru Buy',
            'Langsung Sell karena Gold sedang membuat Lower Low'
          ],
          answerIndex: 1,
          explanation: 'SMT adalah konfirmasi konteks (lampu kuning → hijau), bukan pemicu entry buta. Tetap wajib menunggu CISD/MSS di LTF untuk timing dan penempatan SL yang presisi.'
        },
        {
          question: 'Mengapa membandingkan Swing High Gold pukul 15:00 WITA dengan Swing High Silver pukul 18:00 WITA dianggap salah total?',
          options: [
            'Karena SMT wajib membandingkan titik ayunan yang terbentuk pada jendela waktu (timestamp) yang sama persis',
            'Karena pukul 18:00 WITA pasar Silver libur',
            'Karena Gold dan Silver tidak boleh dibandingkan di M15',
            'Karena hanya perbandingan 1 minggu penuh yang valid'
          ],
          answerIndex: 0,
          explanation: 'SMT membaca perbedaan pengiriman algoritma pada momen yang sama. Membandingkan dua waktu berbeda merusak validitas korelasinya.'
        }
      ]
    },
    {
      id: 'mmxm-market-maker-model',
      levelId: 7,
      number: 34,
      title: 'Market Maker Buy & Sell Model (MMXM)',
      readMinutes: 9,
      diagramId: 'mmxm-market-maker-model',
      summary: 'Peta besar yang menyatukan seluruh puzzle ICT menjadi satu cerita utuh. Pahami bagaimana harga bergerak dalam kurva simetris dari Original Consolidation → Smart Money Reversal → Low Resistance Liquidity Run.',
      conceptBlocks: [
        {
          heading: 'Kenapa Banyak Trader Paham FVG/OB Tapi Masih Bingung Arah Besar?',
          paragraphs: [
            'Karena mereka melihat FVG dan Order Block sebagai kotak terpisah, bukan sebagai **bagian dari satu kurva siklus penuh**. Dalam ICT, hampir setiap pergerakan tren harian maupun mingguan di XAU/USD mengikuti cetak biru bernama **Market Maker Buy Model (MMBM)** untuk siklus naik, atau **Market Maker Sell Model (MMSM)** untuk siklus turun — gabungan keduanya disebut **MMXM**.',
            'Bayangkan huruf **"V" besar (untuk MMBM)** atau **"Λ" terbalik (untuk MMSM)**: sisi kiri kurva adalah fase membangun bahan bakar likuiditas, ujung lancipnya adalah titik pembalikan institusi, dan sisi kanan kurva adalah fase panen cepat menuju titik awal.'
          ]
        },
        {
          heading: '4 Babak Resmi Market Maker Buy Model (MMBM)',
          paragraphs: [
            '1. **Original Consolidation (OC):** Area konsolidasi awal tempat harga berkumpul tenang (misal range sesi Asia atau konsolidasi H1). Puncak atas konsolidasi ini kelak menjadi **Target Akhir (Terminus)**!\n2. **Sell-Side of the Curve (Engineering Liquidity):** Harga turun bertahap keluar dari konsolidasi sambil mencetak beberapa Swing High rapi di sepanjang jalur turunnya. Bagi trader ritel, ini terlihat seperti downtrend — padahal institusi sedang "menanam" deretan Buy-Side Liquidity (BSL) sebagai tangga bahan bakar!\n3. **Smart Money Reversal (SMR):** Harga akhirnya mencapai **HTF PD Array** (misal H1/H4 Bullish FVG, OB, atau PDL). Di dasar kurva inilah terjadi Sweep + SMT + MSS Bullish — seluruh cerita berbalik arah.\n4. **Buy-Side of the Curve (Re-Accumulation → LRLR):** Harga berbalik naik dengan cepat melalui 1–2 jeda konsolidasi kecil (**Re-Accumulation**) dan menyapu seluruh Swing High bekas sisi kiri tanpa hambatan berarti (**Low Resistance Liquidity Run / LRLR**) hingga menembus puncak **Original Consolidation**!'
          ]
        },
        {
          heading: 'Prinsip Emas "Sisi Kurva" (Side of the Curve)',
          paragraphs: [
            'Begitu kamu tahu sedang berada di sisi mana dari kurva MMXM, kebingunganmu soal "kenapa FVG ini ditembus sedangkan FVG itu dihormati?" langsung lenyap:\n• Di **Buy-Side of the Curve (Sisi Kanan MMBM)**, semua Bullish PD Array akan **DIHORMATI** untuk mendorong naik, dan semua Bearish PD Array di sisi kiri akan **DITEMBUS MUDAH**.\n• Di **Sell-Side of the Curve (Sisi Kanan MMSM)**, semua Bearish PD Array akan **DIHORMATI**, dan semua Bullish PD Array di sisi kiri akan **DITEMBUS MUDAH**.'
          ]
        }
      ],
      mappingSteps: [
        'Buka H1 atau M15 dan tandai kotak **Original Consolidation (OC)** terakhir sebelum harga bergerak menjauh.',
        'Amati jalur pergerakan keluar dari OC menuju sebuah **HTF Key Level / PD Array** (misal H1 FVG atau PDL). Tandai setiap swing internal yang tercipta sepanjang jalur ini — itu adalah deretan target tangga likuiditas.',
        'Tunggu tanda **Smart Money Reversal (SMR)** tepat di HTF Key Level (Sweep + Displacement balik + MSS).',
        'Setelah SMR terkonfirmasi, kamu resmi berpindah ke **Sisi Kanan Kurva**: cari entry searah hanya di tahap 1 (pasca-SMR) atau tahap 2 (**Re-Accumulation** / **Redistribution**).',
        'Pasang target bertahap pada swing tangga sisi kiri (TP1 = Re-Accumulation swing pertama) dan target puncak di **Original Consolidation (Terminus)**.'
      ],
      decisionTree: [
        {
          condition: 'Saya ketinggalan entry tepat di dasar Smart Money Reversal (SMR). Apakah boleh mengejar harga?',
          action: 'JANGAN kejar di pucuk candle! Di MMXM hampir selalu muncul **Tahap 2: Re-Accumulation (untuk MMBM) atau Redistribution (untuk MMSM)** — yaitu jeda retrace pertama ke FVG/OB di sisi kanan kurva. Tunggu tahap ke-2 itulah entry paling aman kedua.'
        },
        {
          condition: 'Harga sudah naik menyentuh dan menyapu penuh Original Consolidation (Terminus). Masih boleh cari Buy di FVG baru?',
          action: '**STOP / HATI-HATI!** Begitu Terminus (Original Consolidation) sudah tercapai, siklus MMBM tersebut **RESMI SELESAI**. Entry searah setelah Terminus sangat rawan menjadi korban awal siklus balik arah (MMSM baru).'
        },
        {
          condition: 'Bagaimana membedakan kurva MMXM yang sehat (LRLR) vs pasar macet (HRLR)?',
          action: 'Lihat sisi kiri kurvanya: jika sisi kiri turun mulus menciptakan puncak-puncak bersih (tidak acak-acakan penuh sumbu dua arah), maka sisi kanannya akan melesat cepat (**Low Resistance Liquidity Run**). Jika sisi kiri penuh choppy, targetkan TP1 konservatif saja.'
        }
      ],
      validRules: [
        'SMR wajib bertumpu pada HTF PD Array nyata (Daily/H4/H1 FVG, OB, atau Pool PDH/PDL), bukan berbalik di ruang hampa.',
        'Target utama (Terminus) adalah sisi seberang dari Original Consolidation yang memulai kurva.',
        'Entry terbaik hanya pada **Tahap 1 (SMR)** atau **Tahap 2 (Re-Accumulation / Redistribution)** — hindari masuk terlambat dekat Terminus.'
      ],
      invalidRules: [
        'Mencoba Counter-Trend Sell di sisi kanan MMBM hanya karena melihat Bearish FVG bekas sisi kiri (itu justru akan ditembus sebagai LRLR!).',
        'Memaksakan pola MMXM tanpa adanya HTF PD Array di ujung kurva.',
        'Terus mengejar posisi baru setelah Original Consolidation sudah tuntas disapu.'
      ],
      xauScenario: {
        context: 'Chart M15 XAU/USD (Selasa). Konsolidasi Asia (OC) berada di 2.658 – 2.662. Di bawah ada H1 Bullish OB + PDL di 2.642.',
        steps: [
          'Pukul 14:15 WITA (London), Gold turun bertahap dari 2.658 → 2.651 → 2.654 (Swing High 1) → 2.646 → 2.649 (Swing High 2) → menusuk PDL 2.642 (H1 OB).',
          'Di 2.641,50 terjadi **Smart Money Reversal (SMR)**: sweep PDL + Displacement naik menembus 2.649 (MSS Bullish) meninggalkan BISI M5 di 2.645–2.647.',
          'Masuk **Buy-Side of the Curve**: Buy di 2.646,00 (atau pada Re-Accumulation di 2.650), SL 2.641,00. Harga melesat melewati Swing High 2.654 tanpa perlawanan (LRLR) hingga menembus puncak Original Consolidation 2.662,00 (+160 pips).'
        ]
      },
      failedCase: {
        title: 'Contoh Kasus Gagal (Kenapa Kena SL?)',
        context: 'Harga sudah menyelesaikan MMBM dari 2.642 dan baru saja menembus puncak Original Consolidation di 2.663 (PDH). Melihat candle hijau besar, trader tetap Buy di FVG 2.661.',
        whyFailed: 'Siklus MMBM sudah selesai di Terminus (2.662–2.663). Smart Money justru mengambil likuiditas di atas Original Consolidation untuk mendistribusikan posisi — harga langsung berbalik jatuh menembus SL.'
      },
      goldenRules: [
        'Tentukan dulu kamu ada di **Sisi Mana dari Kurva (Buy-Side atau Sell-Side)** sebelum memilih FVG/OB — itu memotong 80% kebingungan arah.',
        'Peluang paling emas di MMXM adalah **Tahap 1 (SMR)** dan **Tahap 2 (Re-Accumulation/Redistribution)**. Begitu Terminus tercapai, kunci profitmu.'
      ],
      quiz: [
        {
          question: 'Dalam Market Maker Buy Model (MMBM), apa tujuan utama dari area **Original Consolidation (OC)** pada akhir siklus?',
          options: [
            'Sebagai area Stop Loss wajib',
            'Sebagai Target Akhir (Terminus) tempat kurva Buy-Side menyelesaikan pengirimannya',
            'Sebagai area yang tidak boleh disentuh selamanya',
            'Hanya hiasan visual tanpa fungsi likuiditas'
          ],
          answerIndex: 1,
          explanation: 'Dalam MMXM, harga berawal dari Original Consolidation, turun ke HTF PD Array untuk SMR, lalu kembali menyapu sisi seberang Original Consolidation sebagai Terminus.'
        },
        {
          question: 'Saat harga sudah resmi masuk ke **Buy-Side of the Curve** (setelah SMR Bullish terkonfirmasi), apa yang biasanya terjadi pada Bearish FVG bekas sisi kiri kurva?',
          options: [
            'Bearish FVG sisi kiri akan menahan harga turun selama berhari-hari',
            'Bearish FVG sisi kiri cenderung ditembus dengan mudah karena arus institusi sedang melaju cepat (Low Resistance Liquidity Run) menuju Terminus',
            'Bearish FVG sisi kiri wajib dipakai untuk entry Sell besar',
            'Harga berhenti bergerak setiap menyentuh Bearish FVG sisi kiri'
          ],
          answerIndex: 1,
          explanation: 'Prinsip Side of the Curve: di sisi Buy-Side, PD Array Bullish dihormati sedangkan PD Array Bearish di sisi kiri kurva akan ditembus dengan resistensi rendah.'
        },
        {
          question: 'Jika kamu ketinggalan entry di dasar Smart Money Reversal (SMR) pada MMBM, di mana titik entry kedua yang paling sehat dan terstruktur?',
          options: [
            'Mengejar Buy tepat di atas puncak Original Consolidation (Terminus)',
            'Menunggu fase **Re-Accumulation** (konsolidasi / retrace pertama di sisi kanan kurva yang menyentuh Bullish FVG/OB baru)',
            'Langsung Sell melawan arah SMR',
            'Menunggu 1 bulan penuh'
          ],
          answerIndex: 1,
          explanation: 'Tahap 2 (Re-Accumulation pada MMBM / Redistribution pada MMSM) adalah titik masuk lanjutan terbaik sebelum harga mencapai Terminus.'
        },
        {
          question: 'Di mana Smart Money Reversal (SMR) yang valid seharusnya terjadi?',
          options: [
            'Di ruang kosong tanpa level referensi apa pun',
            'Tepat di sebuah HTF PD Array atau Pool Likuiditas kunci (seperti H1/H4 FVG, OB, atau PDH/PDL)',
            'Tepat di menit pertama pasar buka hari Senin',
            'Hanya saat indikator RSI menyentuh angka 50'
          ],
          answerIndex: 1,
          explanation: 'Tanpa pijakan HTF Key Level/PD Array, pembalikan LTF hanyalah pullback sementara, bukan Smart Money Reversal sejati.'
        },
        {
          question: 'Apa tanda bahwa siklus Market Maker Sell Model (MMSM) sudah SELESAI dan kamu tidak boleh lagi mengejar Sell baru?',
          options: [
            'Saat candle pertama merah muncul',
            'Saat harga sudah jatuh menembus dan menyapu batas bawah Original Consolidation (Terminus)',
            'Saat terjadi Redistribution tahap pertama',
            'Saat sesi London baru saja dimulai'
          ],
          answerIndex: 1,
          explanation: 'Begitu batas bawah Original Consolidation tersapu, tujuan pengiriman likuiditas MMSM sudah tuntas — mengejar Sell di sana rawan terkena pembalikan balik.'
        }
      ]
    },
    {
      id: 'ict-macros-weekly-ipda',
      levelId: 7,
      number: 35,
      title: 'ICT Macros (xx:50–xx:10), Weekly Profile (TGIF) & IPDA 20/40/60',
      readMinutes: 8,
      diagramId: 'ict-macros-weekly-ipda',
      summary: 'Naik satu tingkat di atas jadwal Killzone biasa: pelajari jendela algoritma 20 menit (ICT Macro), 4 cetak biru pergerakan mingguan (termasuk TGIF hari Jumat), dan jangkauan memori likuiditas IPDA 20/40/60 hari.',
      conceptBlocks: [
        {
          heading: 'ICT Macros: Jendela Algoritma 20 Menit (xx:50 – xx:10)',
          paragraphs: [
            'Jika Killzone adalah "jam aktif 2–3 jam", maka **ICT Macro** adalah **"detik eksekusi algoritma"** berdurasi tepat 20 menit di setiap pergantian jam tertentu (dimulai menit `:50` sampai `:10` jam berikutnya). Pada jendela 20 menit inilah algoritma pengiriman harga melakukan dua tugas utama: **menyapu likuiditas jangka pendek** atau **mendorong harga masuk ke PD Array lalu melesat menuju target**.',
            'Empat ICT Macro paling tajam di XAU/USD (konversi WITA / UTC+8, standar NY EDT):\n• **London Macro 1:** 14:33 – 15:00 WITA (02:33 – 03:00 NY)\n• **London Macro 2:** 16:03 – 16:30 WITA (04:03 – 04:30 NY)\n• **NY Open Macro (Paling Eksplosif di Gold):** 20:50 – 21:10 WITA (08:50 – 09:10 NY) & **21:50 – 22:10 WITA** (09:50 – 10:10 NY)\n• **NY Pre-Lunch Macro:** 22:50 – 23:10 WITA (10:50 – 11:10 NY)'
          ]
        },
        {
          heading: 'Weekly Profile: Membaca Peta Senin sampai Jumat (Termasuk TGIF)',
          paragraphs: [
            'Harga Gold tidak bergerak acak sepanjang minggu. Biasanya 1 minggu perdagangan mengikuti salah satu dari **3 Profil Mingguan Utama**:\n1. **Classic Expansion (Selasa/Rabu Low or High of the Week):** Senin akumulasi/konsolidasi → Selasa (atau Rabu sesi London) membuat **manipulasi berlawanan arah (membentuk Low/High mingguan)** → Rabu–Kamis ekspansi penuh searah bias mingguan.\n2. **Midweek Reversal:** Senin–Selasa harga terus naik/turun menguras likuiditas HTF → Rabu (sering dipicu berita CPI/FOMC) terjadi pembalikan besar → Kamis–Jumat meluncur arah baru.\n3. **Friday TGIF (Thank God It’s Friday):** Jika Senin–Kamis tren sudah melaju sangat jauh searah, pada hari Jumat sesi NY sering terjadi **retrace balik 20%–30%** dari seluruh rentang mingguan karena institusi menutup sebagian profit akhir pekan!'
          ]
        },
        {
          heading: 'IPDA Data Range Lookback: 20, 40, dan 60 Hari Perdagangan',
          paragraphs: [
            'Dari sekian banyak Swing High dan Swing Low lama di chart Daily, mana yang masih diingat oleh algoritma pasar? ICT menggunakan patokan **IPDA Lookback**: hitung mundur **20 hari trading (1 bulan)**, **40 hari (2 bulan)**, dan **60 hari (1 kuartal / 3 bulan)** dari hari ini di chart Daily.',
            'High tertinggi dan Low terendah di dalam jendela 20, 40, dan 60 hari itulah kolam likuiditas makro utama. Kamu tidak perlu menggambar garis dari 2 tahun lalu yang sudah usang — fokus pada level segar di dalam 20/40/60 hari terakhir.'
          ]
        }
      ],
      mappingSteps: [
        'Buka chart Daily XAU/USD setiap Minggu malam: tandai High & Low tertinggi dari **20 hari trading terakhir** (prioritas 1), lalu 40 dan 60 hari jika harga sedang mendekati batas 20 hari.',
        'Setiap pagi Selasa–Jumat, identifikasi posisi hari ini dalam **Weekly Profile**: apakah Low/High mingguan sudah terbentuk di Selasa/Rabu, atau pasar masih menunggu berita besar hari Rabu?',
        'Pada saat jam kerja NY (20:30 – 22:30 WITA), beri penanda vertikal di chart M5 pada jendela **20:50–21:10 WITA** dan **21:50–22:10 WITA** (ICT Macro).',
        'Amati perilaku harga 10 menit sebelum Macro: sering kali harga bergerak perlahan ke arah likuiditas, lalu tepat masuk jendela `:50–:10` terjadi sapuan tajam & ekspansi searah DOL.'
      ],
      decisionTree: [
        {
          condition: 'Hari Senin pagi hingga siang chart terlihat sangat pelan dan bolak-balik. Apakah strategiku rusak?',
          action: 'Bukan strategimu yang rusak! Dalam Weekly Profile, **Senin memang sering menjadi hari Akumulasi / Opening Range**. Kecilkan ekspektasi target di Senin dan simpan amunisi penuh untuk Selasa–Kamis.'
        },
        {
          condition: 'Hari Jumat pukul 21:00 WITA, Gold sudah reli naik +$85 sejak Senin. Apakah aman masih agresif Buy mengejar breakout Jumat malam?',
          action: '**SANGAT BERISIKO.** Ini wilayah klasik **TGIF (Profit Taking Akhir Pekan)** — Gold rawan mengalami pullback tajam 20%–30% dari rentang minggu ini. Lebih baik amankan profit atau ambil skenario TGIF konservatif menuju 20–30% weekly retracement jika ada MSS Bearish.'
        },
        {
          condition: 'Jendela Macro 21:50–22:10 WITA dimulai, tapi harga sudah bergerak jauh dan tidak ada PD Array atau likuiditas dekat. Apakah wajib entry karena jam Macro?',
          action: '**TIDAK.** Macro adalah **akselerator waktu**, bukan syarat entry tunggal. Tanpa struktur (Sweep + PD Array) dan tanpa ruang menuju DOL, tetap diam di pinggir.'
        }
      ],
      validRules: [
        'Jendela ICT Macro (:50–:10) dipakai untuk mempertajam presisi timing saat harga sudah berada dekat likuiditas atau PD Array.',
        'Weekly Profile membantu mencegah overtrading di hari Senin (akumulasi) dan mencegah FOMO di ujung tren hari Jumat (TGIF).',
        'Gunakan IPDA Lookback 20/40/60 hari perdagangan di Daily agar peta HTF tetap bersih dan relevan.'
      ],
      invalidRules: [
        'Asal klik Buy/Sell setiap menit ke-50 tanpa melihat struktur dan arah DOL.',
        'Memakai hari Jumat malam (setelah tren mingguan sudah ekstrem) untuk memulai target swing jauh.',
        'Menggambar puluhan garis support-resistance dari 3 tahun lalu yang tidak lagi relevan dengan IPDA 20/40/60 hari.'
      ],
      xauScenario: {
        context: 'Rabu 21:45 WITA. Profil Mingguan: Classic Bullish Expansion (Selasa London sudah membentuk Low of the Week di PDL). Harga retrace ke M15 Bullish FVG di 2.655.',
        steps: [
          'Pukul 21:50 WITA (awal NY Macro `09:50–10:10 NY`), XAU/USD menyapu micro-low 2.654,20 di dalam FVG M15.',
          'Pukul 21:55 WITA muncul Displacement Bullish + CISD M5 tepat di dalam jendela Macro.',
          'Entry Buy 2.656,00, SL 2.653,20, harga melesat cepat menembus High harian 2.668,00 hanya dalam 25 menit.'
        ]
      },
      failedCase: {
        title: 'Contoh Kasus Gagal (Kenapa Kena SL?)',
        context: 'Jumat 22:00 WITA setelah Gold naik 4 hari berturut-turut (+$95 minggu ini). Trader melihat Macro 21:50–22:10 lalu langsung Buy breakout di pucuk minggu ini.',
        whyFailed: 'Lupa pada konteks **Weekly Profile TGIF**. Jendela Macro Jumat malam itu justru digunakan institusi untuk menutup posisi Buy (profit taking) — harga berbalik turun -$22 mengisi 25% rentang mingguan dan menyapu SL.'
      },
      goldenRules: [
        'Killzone memberi tahu "jam berapa duduk di depan chart", ICT Macro (`:50–:10`) memberi tahu "menit berapa algoritma menyalakan mesin".',
        'Selalu cek hari apa hari ini (Weekly Profile): Senin sabar, Selasa–Kamis panen utama, Jumat waspada TGIF.'
      ],
      quiz: [
        {
          question: 'Apa yang dimaksud dengan **ICT Macro** dalam eksekusi waktu XAU/USD?',
          options: [
            'Berita ekonomi bulanan dari Bank Sentral',
            'Jendela waktu algoritma spesifik berdurasi ~20 menit (umumnya menit :50 sampai :10) di mana harga sering menyapu likuiditas atau melesat keluar dari PD Array',
            'Indikator moving average periode 200',
            'Seluruh durasi perdagangan 24 jam penuh'
          ],
          answerIndex: 1,
          explanation: 'ICT Macro adalah sub-jendela 20 menit di dalam sesi utama tempat algoritma secara mekanis mengeksekusi sapuan likuiditas dan ekspansi menuju DOL.'
        },
        {
          question: 'Dalam **Classic Bullish Expansion Weekly Profile**, pada hari apa biasanya **Low of the Week** (titik manipulasi ke bawah sebelum ekspansi naik) paling sering terbentuk?',
          options: [
            'Jumat sore menjelang pasar tutup',
            'Selasa (atau paling lambat Rabu sesi London)',
            'Sabtu pagi',
            'Selalu tepat di menit pertama hari Senin'
          ],
          answerIndex: 1,
          explanation: 'Pola klasik mingguan ICT: Senin konsolidasi/akumulasi, Selasa atau Rabu pagi membentuk manipulasi Low of the Week, lalu Rabu–Kamis ekspansi penuh.'
        },
        {
          question: 'Apa fenomena **TGIF (Thank God It’s Friday)** dalam Weekly Profile ICT?',
          options: [
            'Harga pasti selalu cetak rekor baru di Jumat malam',
            'Retrace balik 20%–30% dari rentang mingguan pada hari Jumat setelah tren Senin–Kamis melaju jauh, akibat aksi ambil untung institusi sebelum akhir pekan',
            'Aturan wajib buka lot 3x lebih besar di hari Jumat',
            'Larangan melihat chart hari Selasa'
          ],
          answerIndex: 1,
          explanation: 'TGIF adalah pullback profit-taking institusi di hari Jumat menuju 20%–30% rentang mingguan setelah ekspansi satu arah yang panjang.'
        },
        {
          question: 'Berapa jendela hari perdagangan yang digunakan **IPDA Data Range Lookback** di chart Daily untuk memetakan likuiditas makro yang masih relevan?',
          options: [
            '3, 5, dan 7 hari',
            '20, 40, dan 60 hari perdagangan terakhir',
            '100, 200, dan 500 hari',
            'Hanya 1 hari kemarin saja'
          ],
          answerIndex: 1,
          explanation: 'IPDA Lookback meninjau High/Low signifikan dalam 20 hari (1 bulan), 40 hari (2 bulan), dan 60 hari (1 kuartal) perdagangan terakhir.'
        },
        {
          question: 'Pukul 21:50 WITA (NY Macro) tiba, tetapi harga XAU/USD berada di tengah-tengah konsolidasi tanpa sweep dan tanpa PD Array jelas. Apa sikap yang benar?',
          options: [
            'Tetap wajib entry karena Macro tidak boleh dilewatkan',
            'Tidak entry — Macro hanya mempercepat pergerakan ketika syarat lokasi (Likuiditas/PD Array) dan arah (DOL) sudah selaras',
            'Buka Buy dan Sell bersamaan (hedging)',
            'Turun ke grafik 5 detik sampai menemukan sinyal'
          ],
          answerIndex: 1,
          explanation: 'Waktu tanpa konteks harga (Time without Price) bukan setup. Macro berfungsi mempertajam timing pada setup yang sudah valid secara lokasi.'
        }
      ]
    },
    {
      id: 'stdev-crt-profiling',
      levelId: 7,
      number: 36,
      title: 'Standard Deviation Projections (-1/-2/-2.5/-4) & CRT Candle Profiling',
      readMinutes: 9,
      diagramId: 'stdev-crt-profiling',
      summary: 'Bagaimana menentukan target TP presisi saat XAU/USD cetak All-Time High dan tidak ada Swing High di sebelah kiri? Jawabannya: proyeksi Fibonacci Standard Deviation dari Leg Manipulasi + membaca anatomi OHLC/OLHC candle H4 & Daily (CRT).',
      conceptBlocks: [
        {
          heading: 'Standard Deviation Projections: Menentukan TP Saat "Tidak Ada Target di Kiri"',
          paragraphs: [
            'Gold terkenal sering mencetak rekor harga baru (**All-Time High**). Di momen seperti itu, tidak ada PDH, tidak ada PWH, dan tidak ada Swing High lama di sebelah kiri sebagai target TP. Trader biasa akhirnya menebak-nebak TP atau keluar terlalu cepat.',
            'Dalam ICT, target matematis dihitung dari **Manipulation Leg (kaki sapuan terakhir sebelum pembalikan)** menggunakan Fibonacci Retracement dengan setelan negatif (**Standard Deviation**):\n• **-1.0 Std Dev:** Area reaksi pertama / TP konservatif (sering jadi tempat jeda Re-Accumulation).\n• **-2.0 hingga -2.5 Std Dev:** **Zona Terminus / Target Utama Paling Sering Tercapai (Sweet Spot)** — 70%+ ekspansi harian berhenti atau mulai berbalik di zona ini!\n• **-4.0 Std Dev:** Batas ekspansi ekstrem (biasanya tercapai saat hari berita besar CPI/NFP atau tren parabolik).'
          ]
        },
        {
          heading: 'Cara Menarik Fibonacci Standard Deviation dengan Benar',
          paragraphs: [
            'Kesalahan paling umum pemula adalah menarik Fibonacci dari leg yang salah. Aturan mekanisnya sangat tegas:\n• **Untuk Target Naik (Bullish):** Tarik Fib dari **titik terbawah sapuan (Low Manipulasi = 1)** ke **Swing High terakhir sebelum turun menyapu (Origin Manipulasi = 0)** — atau sebaliknya pastikan angka `-1`, `-2`, `-2.5`, `-4` memproyeksi ke **ATAS** searah target.\n• **Untuk Target Turun (Bearish):** Tarik Fib dari **titik puncak sapuan (High Manipulasi = 1)** ke **Swing Low sebelum naik menyapu (Origin = 0)** sehingga angka `-1`, `-2`, `-2.5`, `-4` memproyeksi ke **BAWAH** searah target.\n• Gunakan **Body-to-Body (Open/Close)** jika sumbu terlalu ekstrem karena berita, atau **Wick-to-Wick** pada kondisi normal — dan cek pertemuan angka `-2.0/-2.5` dengan level psikologis angka bulat Gold (misal `2.700`, `2.720`, `2.750`).'
          ]
        },
        {
          heading: 'Candle Range Theory (CRT) & Profil OHLC / OLHC pada H4 & Daily',
          paragraphs: [
            'Setiap candle H4 atau Daily bukan sekadar balok warna — ia adalah miniatur siklus AMD:\n• **Candle Bullish Sehat = O – L – H – C** (*Open → turun dulu membuat sumbu bawah / Low [Manipulasi] → ekspansi naik mencetak High → Close dekat puncak*).\n• **Candle Bearish Sehat = O – H – L – C** (*Open → naik dulu membuat sumbu atas / High [Manipulasi] → ekspansi turun mencetak Low → Close dekat dasar*).\n• **Pola CRT 3-Candle di H4/Daily:** Candle 1 membentuk rentang (Range) → Candle 2 menyapu High/Low Candle 1 lalu **menutup body kembali di dalam rentang Candle 1** (Purge/Turtle Soup) → Candle 3 meluncur menyapu ujung seberang Candle 1! Memahami CRT membuat kamu tahu persis kapan sebuah candle H4 sedang "membuat sumbu manipulasi" dan kapan ia siap masuk fase ekspansi.'
          ]
        }
      ],
      mappingSteps: [
        'Tentukan **Manipulation Leg**: yaitu kaki pergerakan terakhir yang menyapu likuiditas tepat sebelum terjadi MSS/CISD balik arah.',
        'Atur tool Fibonacci Retracement dengan level: `0`, `1`, `-1`, `-1.5`, `-2`, `-2.5`, `-4`.',
        'Tarik Fib pada Manipulation Leg sehingga angka negatif (`-1`, `-2`, `-2.5`) memanjang **ke arah target (DOL)**.',
        'Tandai zona antara **-2.0 hingga -2.5 Std Dev** sebagai **Zona TP Utama (Terminus)** — cocokkan apakah berdekatan dengan angka bulat XAU/USD (`.00`, `.50`) atau level likuiditas HTF.',
        'Di chart H4, perhatikan pembukaan candle baru (06:00, 10:00, 14:00, 18:00, 22:00 WITA): jika bias Bullish, tunggu harga turun dulu di bawah **H4 Open** (membentuk kaki "L" pada OLHC) menyapu low kecil sebelum mencari Buy di M5!'
      ],
      decisionTree: [
        {
          condition: 'Di -2.0 Std Dev ada reaksi penolakan keras, padahal aku menaruh TP di -4.0 Std Dev. Harus tahan atau amankan?',
          action: '**Amankan mayoritas profit (70%–80%) di zona -2.0 s.d. -2.5 Std Dev!** Level `-4.0` hanya bonus untuk hari ekspansi besar; `-2.0/-2.5` adalah titik di mana pembalikan balik paling sering dimulai.'
        },
        {
          condition: 'Candle H4 baru buka jam 14:00 WITA (London), bias hari ini Bullish, tapi harga langsung melesat naik tinggi di atas harga Open H4 tanpa pernah turun membuat sumbu bawah. Boleh kejar Buy?',
          action: '**Hati-hati / JANGAN kejar!** Mengacu pada profil **OLHC**, entry Buy paling aman adalah di **bawah atau dekat harga Open H4** (di sumbu bawah manipulasi). Jika sudah melesat jauh di atas Open, tunggu retrace ke FVG M5 atau tunggu candle H4 berikutnya.'
        },
        {
          condition: 'Candle 2 H4 menyapu Low Candle 1, tetapi body Candle 2 justru ditutup jauh di BAWAH Low Candle 1 (tidak kembali masuk ke dalam range). Apakah tetap CRT Bullish?',
          action: '**BUKAN CRT Bullish!** Syarat mutlak CRT adalah penutupan body kembali di dalam rentang Candle 1 (penolakan/sweep). Jika body close tembus keluar kuat, itu adalah kelanjutan penurunan (Expansion), bukan manipulasi.'
        }
      ],
      validRules: [
        'Standard Deviation WAJIB ditarik dari **Manipulation Leg** (leg sapuan sebelum MSS), bukan dari sembarang ayunan acak.',
        'Zona **-2.0 hingga -2.5 Std Dev** adalah prioritas utama untuk take profit & waspada pembalikan.',
        'CRT valid jika Candle 2 menyapu ujung Candle 1 dengan sumbu lalu menutup body kembali di dalam rentang Candle 1.'
      ],
      invalidRules: [
        'Menarik proyeksi Std Dev pada leg konsolidasi kecil tanpa sweep dan tanpa Displacement.',
        'Mengharuskan setiap trade mencapai -4.0 Std Dev sehingga profit besar di -2.5 berbalik jadi BEP/rugi.',
        'Membeli di pucuk sumbu atas candle H4 Bullish (jauh di atas Open) hanya karena takut ketinggalan.'
      ],
      xauScenario: {
        context: 'XAU/USD baru saja menembus All-Time High di atas 2.710 (chart sebelah kiri kosong). Sebelum naik, terjadi Manipulation Leg turun dari 2.708,00 (Origin) menyapu SSL ke 2.700,00 (Low Manipulasi — rentang $8).',
        steps: [
          'Tarik Fibonacci Standard Deviation dari leg $8 tersebut (2.700 → 2.708) memproyeksi ke atas.',
          'Proyeksi keluar otomatis: `-1.0 Std Dev = 2.716,00`, **`-2.0 Std Dev = 2.724,00`**, **`-2.5 Std Dev = 2.728,00`**, `-4.0 Std Dev = 2.740,00`.',
          'Pasca-MSS & entry Buy di FVG 2.706,50 (SL 2.699,50): ambil Partial 50% + BEP di `-1.0` (2.716), tutup mayoritas di zona `-2.0/-2.5` (2.724–2.728) — harga benar-benar mencetak puncak harian di 2.727,60 sebelum koreksi!'
        ]
      },
      failedCase: {
        title: 'Contoh Kasus Gagal (Kenapa Kena SL / Profit Hilang?)',
        context: 'Trader sudah profit +$20 di XAU/USD All-Time High tepat saat harga menyentuh `-2.5 Std Dev` (2.728), tetapi tidak menarik Std Dev dan berharap harga naik terus tanpa batas ke 2.760.',
        whyFailed: 'Tanpa proyeksi Standard Deviation, trader buta bahwa algoritma sudah menyelesaikan distribusi di `-2.5 Std Dev`. Harga berbalik tajam dalam 15 menit menghapus seluruh floating profit.'
      },
      goldenRules: [
        'Saat Gold di All-Time High tanpa swing di kiri, **-2.0 hingga -2.5 Standard Deviation** dari Manipulation Leg adalah kompas target paling presisi.',
        'Ingat hukum candle sehat: Bullish = **O-L-H-C** (beli di bawah Open saat buat sumbu bawah), Bearish = **O-H-L-C** (jual di atas Open saat buat sumbu atas).'
      ],
      quiz: [
        {
          question: 'Dari bagian grafik mana proyeksi **Fibonacci Standard Deviation** ICT wajib ditarik untuk menghitung target TP?',
          options: [
            'Dari candle tertinggi tahun lalu ke candle terendah bulan ini',
            'Dari **Manipulation Leg** (kaki pergerakan sapuan likuiditas terakhir tepat sebelum terjadi MSS/pembalikan)',
            'Dari lebar kotak sesi Asia dikali 10',
            'Dari sembarang 2 candle berwarna sama di M1'
          ],
          answerIndex: 1,
          explanation: 'Algoritma menggunakan ukuran leg manipulasi (stop hunt leg) sebagai satuan skala untuk memproyeksikan jarak ekspansi berikutnya.'
        },
        {
          question: 'Rentang Standard Deviation manakah yang menjadi **Sweet Spot / Target Utama (Terminus)** paling sering menghentikan ekspansi harian XAU/USD?',
          options: [
            '-0.25 hingga -0.5',
            '-2.0 hingga -2.5 Standard Deviation',
            '-10.0 hingga -12.0',
            '+0.5 saja'
          ],
          answerIndex: 1,
          explanation: 'Zona -2.0 hingga -2.5 Std Dev adalah zona distribusi utama tempat mayoritas ekspansi harian selesai atau mulai berbalik arah.'
        },
        {
          question: 'Dalam profil candle **OLHC** (Candle H4/Daily Bullish yang sehat), di area mana entry Buy memiliki probabilitas dan R:R terbaik?',
          options: [
            'Jauh di atas harga Open setelah candle sudah naik panjang',
            'Di bawah atau dekat harga Open (saat candle sedang membentuk sumbu bawah / Low manipulasi)',
            'Tepat 1 menit sebelum candle ditutup di puncak',
            'Harga Open tidak berpengaruh sama sekali pada entry'
          ],
          answerIndex: 1,
          explanation: 'Pada candle Bullish (O-L-H-C), fase turun di bawah Open membentuk sumbu bawah adalah manipulasi beli murah sebelum ekspansi naik menuju High.'
        },
        {
          question: 'Apa syarat utama agar pola 3-candle **CRT (Candle Range Theory)** pada H4 valid sebagai sinyal pembalikan Bullish?',
          options: [
            'Candle 2 menyapu Low Candle 1 dengan sumbu lalu **menutup body kembali di dalam rentang Candle 1**',
            'Candle 2 menutup body merah panjang jauh di bawah Low Candle 1',
            'Candle 1 dan Candle 2 sama-sama Doji tanpa menyentuh ujung mana pun',
            'Candle 2 menembus High Candle 1 lalu langsung turun'
          ],
          answerIndex: 0,
          explanation: 'Purge/Sweep diikuti penutupan body kembali ke dalam rentang Candle 1 membuktikan penolakan likuiditas bawah, memicu Candle 3 membidik High Candle 1.'
        },
        {
          question: 'XAU/USD mencetak All-Time High (tidak ada Swing High di kiri). Manipulation Leg turun berukuran $6 (dari 2.720 ke 2.714) lalu berbalik MSS Bullish. Di mana proyeksi **-2.0 Std Dev** berada?',
          options: [
            '2.726,00',
            '2.732,00 (2.720 + 2 × $6)',
            '2.714,00',
            '2.702,00'
          ],
          answerIndex: 1,
          explanation: 'Ukuran leg = $6. Dari titik 0 (2.720) memproyeksi ke atas sejauh 2 kali leg: 2.720 + (2 × 6) = 2.732,00 (-2.5 Std Dev = 2.735,00).'
        }
      ]
    },
    {
      id: 'capstone-mapping-mandiri',
      levelId: 7,
      number: 37,
      title: 'Capstone: Protokol Mapping Mandiri dari Chart Kosong (Zero-Indicator)',
      readMinutes: 10,
      diagramId: 'capstone-blank-chart-mapping',
      summary: 'Ujian puncak yang merangkai seluruh 42 modul sebelumnya ke dalam 1 protokol kerja 10 menit dari layar chart kosong total — tanpa bergantung indikator apa pun — sampai keluar 1 Bias, 1 DOL, 1 POI, 1 Invalidasi, dan 1 Target.',
      conceptBlocks: [
        {
          heading: 'Kenapa Banyak Trader Gagal Saat Indikator Dimatikan?',
          paragraphs: [
            'Saat semua kotak FVG, label BOS, dan garis PDH otomatis dihilangkan dari layar, banyak trader mendadak beku ("Blank Chart Freeze") karena tidak punya **urutan kerja (workflow)** yang baku. Mereka langsung loncat ke M5, menarik 15 kotak sekaligus, lalu bingung sendiri mau Buy atau Sell.',
            'Modul puncak ini **tidak menambah teori baru** — ia menyatukan seluruh ilmu dari Modul 01 sampai 42 menjadi **6 Langkah Mekanis Berurutan (Top-Down 10 Menit)** yang bisa kamu lakukan sendiri setiap pagi pada chart XAU/USD yang benar-benar polos.'
          ]
        },
        {
          heading: 'Protokol 6 Langkah Mapping Mandiri (Weekly → Daily → H1 → M15 → M5)',
          paragraphs: [
            '**Langkah 1 — Kalender & Profil Mingguan (1 Menit):** Cek jadwal berita merah hari ini (CPI/NFP/FOMC → tandai News Lock) dan catat posisi hari dalam Weekly Profile (Senin akumulasi, Selasa–Kamis ekspansi, Jumat waspada TGIF).\n**Langkah 2 — Peta Daily & IPDA (2 Menit):** Tandai **PDH, PDL, PWH, PWL**, dan **NWOG/NDOG**. Jawab 1 pertanyaan saja: *kemarin candle Daily baru saja menyapu/memantul dari mana (Origin), dan magnet terdekat mana yang masih utuh (DOL)?* Tulis 1 kalimat Bias + 1 garis Invalidasi Daily/H1.\n**Langkah 3 — Peta H1: Dealing Range & Sisi Kurva MMXM (2 Menit):** Tarik Dealing Range H1 (garis 50% Equilibrium). Pastikan kamu tahu sedang berada di **Buy-Side** atau **Sell-Side of the Curve**, lalu tandai maksimal **1–2 HTF POI terkuat** (H1 FVG / OB / Breaker / BPR) yang berada di Discount (untuk Buy) atau Premium (untuk Sell).'
          ]
        },
        {
          heading: 'Dari Peta Besar Menjadi Eksekusi Presisi (Langkah 4 – 6)',
          paragraphs: [
            '**Langkah 4 — Peta M15: Kolam Bahan Bakar & Inducement (2 Menit):** Tandai **Asia High/Low**, **EQH/EQL**, dan **Inducement (IDM)** tepat di depan HTF POI pilihanmu. Ingat: jangan sentuh POI sebelum Inducement atau likuiditas sesi disapu.\n**Langkah 5 — Peta M5: Trigger di Jam Killzone / Macro (2 Menit):** Hanya tunggu di London (14:00–17:00 WITA) atau NY AM (19:30–23:00 WITA), idealnya dekat jendela Macro (`:50–:10`). Saat harga masuk POI pilihanmu: cek konfirmasi **Sweep + (opsional SMT XAU vs XAG/DXY) + CISD/MSS + 1 Model Entry pilihanmu** (2022 FVG / OB+MT / IFVG / Unicorn).\n**Langkah 6 — Kalkulasi Risiko & Target (1 Menit):** Hitung lot wajib ≤ 0.5%–1% risiko, SL struktural + napas spread, TP1 di likuiditas internal (1:1.5–1:2 → Partial & BEP), dan TP2 di DOL utama (atau `-2.0/-2.5 Std Dev` jika di All-Time High).'
          ]
        }
      ],
      mappingSteps: [
        'Bersihkan seluruh indikator dari chart XAU/USD (sisakan candle polos saja) lalu mulai dari **Daily**: gambar 4 garis utama (PDH, PDL, PWH, PWL) + NWOG Senin.',
        'Tentukan **1 kalimat Narasi Pagi**: *"Asal [Origin] → Menuju [DOL]. Bias [BULLISH/BEARISH/NETRAL]. Batal jika H1 close melewati [Level X]."*',
        'Pindah ke **H1**: tarik Dealing Range (0%–50%–100%), tandai **maksimal 1–2 POI utama** di zona murah (Discount) atau mahal (Premium) searah Bias.',
        'Pindah ke **M15**: tandai Asia Range + Inducement (IDM) yang harus disapu dulu sebelum harga menyentuh POI H1.',
        'Pindah ke **M5** saat masuk Killzone: tunggu **Sweep → MSS/CISD → Entry** hanya di 1 model andalanmu, kunci SL struktural, lalu tutup layar dan biarkan market bekerja (atau catat langsung ke Jurnal).'
      ],
      decisionTree: [
        {
          condition: 'Di Langkah 2 (Daily & H1), arah masih sangat membingungkan: candle kemarin inside bar, PDH dan PDL sama-sama jauh, tidak ada sweep jelas. Apa yang harus ditulis?',
          action: 'Tulis dengan bangga: **"Bias NETRAL — Menunggu Sesi London Membuka Kartu."** Trader profesional tidak memaksa bias di pagi buta; mereka membiarkan London menyapu Asia High atau Asia Low dulu untuk menunjukkan arah hari itu.'
        },
        {
          condition: 'Di Langkah 3 & 4, aku menemukan 4 kotak FVG/OB yang kelihatan bagus. Bagaimana cara memotongnya jadi 1 POI saja?',
          action: 'Gunakan **4 Saringan Kilat**: (1) Wajib searah Bias & berada di Discount/Premium, (2) Wajib masih Fresh, (3) Wajib punya **Inducement / Likuiditas tepat di depannya**, (4) Pilih yang punya konfluensi ganda (misal overlap Breaker = Unicorn, atau overlap OTE 62%–79%). Sisa 3 kotak lain hapus dari chart!'
        },
        {
          condition: 'Semua 5 langkah awal sudah 100% cocok, tapi tinggal 10 menit lagi ada rilis CPI / NFP. Tetap entry?',
          action: '**TIDAK! Protokol News Lock menang di atas semua teknikal.** Tahan tangan, tunggu rilis selesai + spread normal (+30 menit), lalu baca ulang apakah DOL baru saja tersapu atau justru terbuka jalan bersih.'
        }
      ],
      validRules: [
        'Chart mapping harian yang sehat hanya memiliki maksimal **4–6 garis/kotak penting** (PDH/PDL, Asia Range, 1–2 POI utama, 1 Invalidasi, 1 DOL) — bukan 30 coretan penuh layar.',
        'Selalu bergerak **Top-Down (Daily → H1 → M15 → M5)**, tidak pernah mulai dari M5 lalu mencari pembenaran di H1.',
        'Setiap peta wajib punya **1 Titik Batal (Invalidasi)** tertulis sebelum tombol entry disentuh.'
      ],
      invalidRules: [
        'Langsung buka M5 di jam sepi lalu menggambar 10 kotak FVG dua arah sekaligus (pasti berujung bingung).',
        'Memaksa 1 bias seharian meski garis Invalidasi H1 sudah ditembus body candle.',
        'Mengubah-ubah model entry di tengah sesi karena takut ketinggalan gerak candle.'
      ],
      xauScenario: {
        context: 'Simulasi Mapping Mandiri 10 Menit — Rabu 13:40 WITA (20 menit sebelum London Open) pada chart XAU/USD polos tanpa indikator.',
        steps: [
          'Langkah 1–2 (Daily): Tidak ada CPI/NFP hari ini. Kemarin Daily tutup bullish setelah menyapu PDL (Origin = Sweep PDL), PDH 2.674,00 masih segar berjarak +$14 → **Bias BULLISH menuju DOL PDH 2.674,00**. Batal jika H1 close di bawah 2.650,00.',
          'Langkah 3–4 (H1 & M15): Dealing Range H1 2.648–2.668 (EQ = 2.658). Di Discount ada H1/M15 Bullish FVG + OTE di 2.654–2.656,50, dan tepat di atasnya ada Asia Low (Inducement) di 2.657,00.',
          'Langkah 5–6 (M5 London 14:35 WITA / Macro): Harga turun menyapu Asia Low 2.657 → masuk ke POI 2.655,20 (XAG buat Higher Low = Bullish SMT) → M5 cetak CISD + BISI 2.656–2.657,50 → Buy 2.656,50, SL 2.653,00 (risiko 0.75%), TP1 2.664,00 (Partial + BEP), TP2 PDH 2.674,00 (+175 pips, R:R 1:5).'
        ]
      },
      failedCase: {
        title: 'Contoh Kasus Gagal (Bottom-Up Mapping)',
        context: 'Trader langsung membuka M5 pukul 13:50 WITA tanpa melihat Daily/H1, melihat 2 candle merah kecil menembus micro-low, lalu langsung Sell mengejar breakout tepat ke arah Asia Low 2.657.',
        whyFailed: 'Ia menjual tepat di titik **Inducement / Discount H1** yang menjadi area beli institusi! Karena tidak melakukan Top-Down Mapping dari Daily & H1, ia tidak sadar sedang melawan arus besar menuju PDH 2.674.'
      },
      goldenRules: [
        'Chart yang bersih melahirkan pikiran yang jernih: 1 Bias, 1 DOL, 1–2 POI, 1 Invalidasi, 1 Model Entry.',
        'Kamu resmi lulus menjadi trader ICT mandiri ketika indikator dimatikan dan kamu tetap tahu persis **ke mana harga menuju, di mana menunggu, dan kapan harus berhenti**.'
      ],
      practiceCta: {
        label: 'Uji Mapping Mandiri di Cockpit & Latihan 100 Kasus',
        description: 'Bandingkan hasil peta mandiri dari chart kosongmu dengan Cockpit Mapping Amy FX Pro atau langsung latih insting di 100 Kasus ICT.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Urutan kerja **Top-Down Mapping Mandiri** yang benar dari layar chart kosong adalah...',
          options: [
            'M1 → M5 → M15 → baru cek Daily jika sudah kena SL',
            'Cek Berita/Weekly Profile → Daily (PDH/PDL, Origin & DOL) → H1 (Dealing Range & HTF POI) → M15 (Asia Range & Inducement) → M5 (Sweep + CISD/MSS di Killzone)',
            'Pasang 6 indikator oscillator dulu lalu baru gambar FVG',
            'Langsung tarik 15 kotak FVG di M5 lalu pilih yang paling dekat harga sekarang'
          ],
          answerIndex: 1,
          explanation: 'Top-Down Mapping selalu dimulai dari konteks makro & likuiditas besar (Berita/Daily/H1) sebelum turun mencari presisi pemicu di M15 dan M5.'
        },
        {
          question: 'Pada pukul 08:30 WITA saat melakukan mapping Daily & H1, chart sedang inside bar di tengah range tanpa arah dominan dan tanpa sweep jelas. Keputusan paling profesional adalah...',
          options: [
            'Menebak salah satu arah secara acak agar tetap punya trade pagi ini',
            'Menetapkan **Bias NETRAL** dan menunggu sesi London menyapu Asia High/Low terlebih dahulu untuk membuka arah hari ini',
            'Memperbesar lot supaya profit cepat meski arah tidak jelas',
            'Membuka Buy dan Sell bersamaan di M5'
          ],
          answerIndex: 1,
          explanation: 'Bias Netral adalah bagian sah dari SOP profesional. Memaksa bias saat struktur belum jelas adalah sumber terbesar overtrading.'
        },
        {
          question: 'Kamu menemukan 3 Bullish FVG berbeda di chart H1/M15 dalam satu kenaikan. Saringan mana yang paling tepat untuk memilih **1 POI Utama**?',
          options: [
            'Pilih FVG yang berada paling tinggi di zona 90% Premium',
            'Pilih FVG yang masih Fresh, berada di zona Discount (<50%), memiliki Inducement/Asia Low tepat di depannya, dan memiliki konfluensi (seperti OTE atau Breaker/Unicorn)',
            'Pilih semua 3 FVG dan pasang Buy Limit serentak di ketiganya',
            'Pilih FVG yang sudah disentuh 4 kali sebelumnya'
          ],
          answerIndex: 1,
          explanation: 'POI probabilitas tertinggi selalu berada di lokasi harga murah (Discount untuk Buy), masih segar, dilindungi Inducement di depannya, dan punya konfluensi kuat.'
        },
        {
          question: 'Mengapa setiap peta mapping pagi WAJIB menyertakan **1 Garis Invalidasi Bias** secara tertulis?',
          options: [
            'Agar chart terlihat ramai dan profesional',
            'Untuk mencegah Narrative Bias (keras kepala melawan fakta pasar) — begitu H1 menutup body menembus garis tersebut, skenario lama langsung dibatalkan',
            'Sebagai tempat menggandakan lot (martingale) jika harga menyentuhnya',
            'Tidak wajib, hanya opsional untuk pemula'
          ],
          answerIndex: 1,
          explanation: 'Garis Invalidasi membuat analisismu 100% objektif. Kamu tahu persis kapan asumsimu salah sebelum emosi mengambil alih.'
        },
        {
          question: 'Seluruh 5 langkah mapping (Bias, DOL, POI Discount, Inducement, Killzone) sudah sempurna, namun 8 menit lagi ada rilis data US CPI (High Impact). Apa langkah final yang benar?',
          options: [
            'Segera entry sebelum berita agar mendapat harga awal',
            'Tahan entry sesuai **Protokol News Lock** (-15 menit s.d. +30 menit), lalu evaluasi ulang setelah volatilitas dan spread kembali normal',
            'Lepas Stop Loss agar tidak kena spike berita lalu pasang lagi setelahnya',
            'Pindah ke M1 untuk scalping detik rilis CPI'
          ],
          answerIndex: 1,
          explanation: 'Tidak ada setup teknikal yang kebal terhadap lonjakan spread dan slippage detik rilis CPI/NFP/FOMC. Disiplin News Lock selalu menjadi prioritas tertinggi.'
        }
      ]
    }
  ];

  return Object.freeze({ LEVELS, LESSONS });
});
