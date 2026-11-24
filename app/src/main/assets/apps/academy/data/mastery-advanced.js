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
      levelId: 3,
      number: 22,
      title: 'Breaker Block (BB), Mitigation Block & ICT Unicorn Model',
      readMinutes: 11,
      diagramId: 'breaker-mitigation-unicorn',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Saat sebuah Order Block jebol tidak berarti peluang habis — justru sering melahirkan benteng pembalikan paling keras (Breaker Block). Pelajari beda tegas Breaker vs Mitigation Block dan konfluensi terkuat di Gold: ICT Unicorn Model.',
      bookSections: [
        {
          number: '22.1',
          heading: 'Kenapa Order Block yang Gagal Justru Melahirkan Benteng Terkuat (Breaker Block)?',
          shortTitle: 'Psikologi Breaker Block',
          paragraphs: [
            'Di Bab 21 kamu melihat bagaimana Order Block yang sehat menahan harga. Sekarang tanyakan pertanyaan sebaliknya: **apa yang terjadi di balik layar ketika sebuah Order Block gagal menahan harga dan malah dijebol keras oleh Displacement?**',
            'Bayangkan institusi besar melihat tumpukan Stop Loss (BSL) di atas sebuah puncak lama. Mereka mendorong harga naik sedikit dengan candle hijau terakhir untuk **menyapu BSL** tersebut — memancing ribuan trader ritel ikut FOMO Buy di pucuk. Sesaat setelah likuiditas BSL terambil, bank langsung membanting harga turun keras hingga **menembus Swing Low sebelumnya**!',
            'Rangkaian candle hijau terakhir yang tadinya tampak seperti "Bullish Order Block" di kaki naik sebelum sweep itu kini resmi **jebol dan berubah kutub** menjadi **Bearish Breaker Block (`-BB`)**. Ketika harga nanti naik kembali (*retrace*) menyentuh kotak Breaker tersebut, bank menutup sisa order beli umpan mereka di titik impas (*breakeven*) sambil menambahkan order jual baru secara masif — itulah sebabnya pantulan dari Breaker Block sering **jauh lebih keras, cepat, dan bersih** dibanding Order Block biasa! (Di Chart Gold Mapping Cockpit Amy FX Pro, zona ini otomatis tampil sebagai **`+BB` cyan** untuk Buy dan **`-BB` oranye** untuk Sell).'
          ]
        },
        {
          number: '22.2',
          heading: 'Beda Tegas: Breaker Block (BB) vs Mitigation Block (MB)',
          shortTitle: 'Breaker vs Mitigation',
          paragraphs: [
            'Banyak trader mencampuradukkan **Breaker Block** dan **Mitigation Block** karena bentuk kotaknya sekilas mirip. Padahal keduanya memiliki **satu perbedaan struktural mutlak** yang sangat memengaruhi tingkat keberhasilannya di XAU/USD:'
          ],
          table: {
            caption: 'Perbandingan Struktural: Breaker Block (BB) vs Mitigation Block (MB)',
            headers: ['Pembeda Kunci', 'Breaker Block (BB)', 'Mitigation Block (MB)', 'Implikasi Trading'],
            rows: [
              ['Ada Sweep Likuiditas?', '**WAJIB ADA SWEEP!** Harga mencetak High baru tipis (ambil BSL) untuk `-BB`, atau Low baru tipis (ambil SSL) untuk `+BB`', '**TIDAK ADA SWEEP!** Harga gagal mencapai ekstrem lama (mencetak *Lower High* untuk `-MB`, atau *Higher Low* untuk `+MB`)', 'Breaker punya bahan bakar likuiditas penuh; Mitigation tidak'],
              ['Penembusan Balik', 'Ditembus balik dengan **Displacement (Body Close)** menembus Swing tengah', 'Ditembus balik dengan **Displacement (Body Close)** menembus Swing tengah', 'Keduanya tetap wajib mematahkan Swing dengan body close'],
              ['Tingkat Kekuatan', '**Sangat Tinggi (Grade A+)** — menempati peringkat atas Hierarki PD Array', '**Menengah–Tinggi (Grade B+/A-)** — daya tolak lebih lunak', 'Breaker bisa berdiri kuat; Mitigation WAJIB dibantu FVG & searah Bias H1'],
              ['Contoh Urutan Bearish', 'Swing Low → **Sweep HH** → Jebol Swing Low', 'Swing Low → **Gagal HH (LH)** → Jebol Swing Low', 'Cek 1 detik: apakah ujungnya menyapu High/Low lama?']
            ]
          }
        },
        {
          number: '22.3',
          heading: 'ICT Unicorn Model: Irisan Presisi Breaker Block + Fair Value Gap',
          shortTitle: 'ICT Unicorn Model',
          paragraphs: [
            'Sekarang tibalah kita pada salah satu setup paling terkenal di seluruh komunitas ICT modern: **ICT Unicorn Model**. Jangan tertipu namanya yang terdengar mistis — definisinya justru luar biasa sederhana dan 100% mekanis!',
            '**ICT Unicorn** adalah **irisan tumpang tindih** (*overlap*) antara kotak **Breaker Block (BB)** dan kotak **Fair Value Gap (FVG)** yang tercipta dari dorongan Displacement yang sama saat harga menjebol struktur.',
            'Kenapa Unicorn begitu mematikan di XAU/USD? Pertama, kamu mendapatkan **konfluensi dua PD Array sekaligus di satu koordinat harga** (alasan mitigasi posisi bank di Breaker + alasan penyeimbangan inefisiensi di FVG). Kedua, kalau kotak Breaker lebar (misalnya `$5–$7`), irisan FVG di dalamnya langsung **mempersempit titik entry presisi** sehingga jarak Stop Loss menjadi lebih ringkas dan R:R minimal `1:2` hingga `1:4` jauh lebih mudah tercapai!'
          ]
        },
        {
          number: '22.4',
          heading: 'Studi Kasus Lengkap XAU/USD: Bearish Unicorn di Sesi NY AM',
          shortTitle: 'Studi Kasus Unicorn Gold',
          paragraphs: [
            'Mari kita bedah langkah demi langkah cara menggambar dan mengeksekusi **Bearish Unicorn** di chart M5 XAU/USD tanpa satu pun tebakan:'
          ],
          exampleBox: {
            title: 'Eksekusi Bearish Unicorn M5 XAU/USD (NY Open · 20:35 WITA EDT)',
            rows: [
              {
                label: 'Tahap 1 — Sweep & Jebol Balik (MSS)',
                detail: 'Bias H1 sedang Bearish menuju `PDL 2.632,00`. XAU/USD melonjak menyapu **London High `2.654,50`** (syarat Sweep terpenuhi!), lalu langsung dibanting keras menutup body menembus **Swing Low `2.648,00`**.'
              },
              {
                label: 'Tahap 2 — Menandai Breaker & FVG (Irisan Unicorn)',
                detail: '• **Bearish Breaker Block (`-BB`):** Rangkaian candle hijau terakhir sebelum puncak sweep di **`2.650,00 – 2.652,40`**.\n• **Bearish FVG (SIBI):** Celah dari dorongan jebol di **`2.649,20 – 2.651,80`**.\n• **Zona ICT Unicorn (Irisan):** Rentang tumpang tindih keduanya di **`2.650,00 – 2.651,80`**!'
              },
              {
                label: 'Tahap 3 — Eksekusi & Manajemen Risiko',
                detail: 'Harga retrace naik masuk ke `2.650,80` (tepat di jantung Unicorn) dan ditolak cepat. Eksekusi Sell di **`2.650,50`**, SL di atas puncak sweep **`2.655,00`** (risiko **`$4,50`** termasuk napas spread). **TP1** di `2.641,50` (`+$9,00`, **R:R 1:2**) dan **TP2** runner di `PDL 2.632,50` (`+$18,00`, **R:R 1:4**).'
              }
            ]
          },
          callout: {
            tone: 'warn',
            kicker: 'Aturan Batal Mutlak',
            title: 'Body Close Menembus Keluar Kotak Breaker = Setup Hangus!',
            body: 'Jika harga kembali ke Bearish Breaker lalu candle M5 **menutup badannya (Body Close) solid di atas batas atas kotak Breaker**, setup resmi batal total. Jangan menggeser SL atau averaging — keluar dan hormati struktur baru.'
          }
        }
      ],
      keyTakeaways: [
        '**Breaker Block (BB)** adalah Order Block yang jebol balik secara agresif **setelah menyapu likuiditas** (`HH` tipis untuk Bearish BB, `LL` tipis untuk Bullish BB).',
        '**Mitigation Block (MB)** terlihat mirip, tetapi **tidak memiliki Sweep** di ujungnya (gagal mencetak High/Low baru) sehingga kekuatannya lebih rendah dan butuh konfluensi FVG + Bias HTF.',
        '**ICT Unicorn Model** adalah irisan tumpang tindih (*overlap*) antara **Breaker Block** dan **Fair Value Gap (FVG)** dari dorongan Displacement yang sama.',
        'SL paling logis untuk Breaker/Unicorn diletakkan di luar ujung puncak/dasar sweep (+ napas spread); jika Body Close menembus keluar seluruh kotak Breaker, setup batal total.'
      ],
      bridgeNext: 'Sekarang kamu sudah menguasai empat zona entry utama ICT: FVG, iFVG, Order Block, dan Breaker/Unicorn. Tetapi bagaimana cara tahu secara paling awal dan paling objektif bahwa harga benar-benar sudah **berbalik arah** setelah menyapu likuiditas — sebelum kamu memutuskan zona mana yang aktif? Mari kita bedah dua pemicu pembalikan paling presisi di **Bab 23: CISD vs Market Structure Shift (MSS): Sinyal Balik Arah Paling Presisi**.',
      practiceCta: {
        label: 'Pantau Zona +BB / -BB Live di Chart Gold',
        description: 'Buka Chart Gold di Mapping Cockpit untuk melihat deteksi otomatis Breaker Block (+BB cyan / -BB oranye) beserta prioritasnya.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Breaker Block, Mitigation Block & ICT Unicorn Model',
          paragraphs: [
            'Breaker Block wajib didahului Liquidity Sweep sebelum jebol balik dengan Displacement; Mitigation Block tidak memiliki sweep; dan ICT Unicorn adalah irisan tumpang tindih Breaker Block + Fair Value Gap.'
          ]
        }
      ],
      mappingSteps: [
        'Tandai swing terakhir yang baru saja menyapu likuiditas (ambil BSL/SSL) beserta Swing Lawan tepat di sebelahnya.',
        'Tunggu dorongan Displacement kuat yang menutup body menembus Swing Lawan tersebut (MSS).',
        'Tarik kotak pada rangkaian candle lawan terakhir sebelum puncak/dasar sweep sebagai Breaker Block, lalu cek apakah ada FVG yang bertumpuk membentuk Zona Unicorn.',
        'Eksekusi saat retrace ke tepi Breaker / irisan Unicorn dengan SL di luar puncak/dasar sweep (+ napas spread).'
      ],
      decisionTree: [
        {
          condition: 'Harga menjebol Swing dengan Displacement, tetapi puncak sebelumnya TIDAK menyapu High lama (malah Lower High).',
          action: 'Itu Mitigation Block, bukan Breaker Block. Wajib ada FVG menumpuk dan searah Bias H1 — jika tidak, skip.'
        },
        {
          condition: 'Kotak Breaker lebar ($6–$8) dan ada FVG di tengahnya.',
          action: 'Fokuskan entry pada area irisan Unicorn (overlap Breaker + FVG) agar SL ringkas dan R:R ≥ 1:2.'
        },
        {
          condition: 'Candle M5 menutup body penuh menembus keluar sisi belakang kotak Breaker.',
          action: 'Setup BATAL TOTAL — jangan menahan posisi atau averaging.'
        }
      ],
      validRules: [
        'Bearish Breaker wajib punya urutan: Swing Low → Sweep High baru (BSL) → Displacement jebol Swing Low dengan body close.',
        'Bullish Breaker wajib punya urutan: Swing High → Sweep Low baru (SSL) → Displacement jebol Swing High dengan body close.',
        'ICT Unicorn wajib memiliki overlap nyata antara kotak Breaker Block dan kotak FVG hasil Displacement.'
      ],
      invalidRules: [
        'Menyebut sembarang support/resistance jebol sebagai Breaker tanpa Sweep dan tanpa Displacement.',
        'Memakai Mitigation Block tanpa FVG untuk melawan Bias H1.',
        'Menahan posisi ketika Body Close sudah menembus keluar kotak Breaker.'
      ],
      xauScenario: {
        context: 'NY Open 20:35 WITA, Bias H1 Bearish menuju PDL 2.632: XAU/USD menyapu London High 2.654,50 lalu jebol Swing Low 2.648,00.',
        steps: [
          'Bearish Breaker Block di 2.650,00–2.652,40 beririsan dengan Bearish FVG 2.649,20–2.651,80 → Zona Unicorn 2.650,00–2.651,80.',
          'Sell di 2.650,50, SL di 2.655,00 ($4,50), TP1 2.641,50 (1:2) dan TP2 PDL 2.632,50 (1:4).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Breaker Palsu di Tengah Asia Chop',
        context: 'Sesi Asia 10:15 WITA, harga menembus micro-low M5 tanpa menyapu High sesi mana pun dan tanpa Displacement/FVG.',
        whyFailed: 'Tanpa sweep nyata, tanpa FVG (bukan Unicorn), dan di luar Killzone, sesi London langsung menyapu seluruh kotak Asia dan mengenai SL.'
      },
      goldenRules: [
        'Breaker Block = Sweep + Jebol Balik Agresif. Tanpa sweep di ujungnya, itu Mitigation Block.',
        'ICT Unicorn (irisan Breaker + FVG) adalah filter konfluensi tertinggi di XAU/USD.'
      ],
      quiz: [
        {
          question: 'Apa syarat struktur mutlak yang membedakan **Bearish Breaker Block** dari **Bearish Mitigation Block**?',
          options: [
            '**Breaker Block** wajib didahului **Sweep membuat High baru (ambil BSL)** sebelum jebol menembus Swing Low, sedangkan **Mitigation Block** gagal membuat High baru (*Lower High*)',
            'Breaker Block hanya muncul di Daily, sedangkan Mitigation Block hanya di M1',
            'Mitigation Block tidak memerlukan Displacement, sedangkan Breaker tidak perlu break struktur',
            'Keduanya sama persis, hanya berbeda warna kotak'
          ],
          answerIndex: 0,
          explanation: 'Perbedaan inti ICT: Breaker selalu diawali Liquidity Sweep (HH tipis atau LL tipis) sebelum dijebol balik, sedangkan Mitigation gagal mencapai swing ekstrem sebelumnya.'
        },
        {
          question: 'Dalam **ICT Unicorn Model**, dua elemen apa yang wajib tumpang tindih (*overlap*) pada rentang harga yang sama?',
          options: [
            'RSI Oversold dan Moving Average 200',
            '**Breaker Block** dan **Fair Value Gap (FVG)** hasil dorongan Displacement',
            'Asia High dan Weekly Open saja',
            'Dua candlestick Doji yang bersebelahan'
          ],
          answerIndex: 1,
          explanation: 'ICT Unicorn adalah irisan tumpang tindih antara kotak Breaker Block dengan kotak FVG dari dorongan Displacement yang menjebol struktur.'
        },
        {
          question: 'Harga membentuk Bullish Breaker di `2.640–2.642` (setelah menyapu SSL `2.637` dan menjebol Swing High `2.645`). Saat retrace, candle M5 menutup **Body Close penuh di `2.638,50`**. Apa keputusan mekanis yang benar?',
          options: [
            'Langsung Buy dua kali lipat karena harga makin murah',
            'Menunggu 5 candle lagi sambil menghapus Stop Loss',
            '**Setup Bullish Breaker batal total** karena Body Close sudah menembus keluar batas bawah Breaker — jangan entry Buy',
            'Pindah ke M1 untuk mencari alasan tetap Buy'
          ],
          answerIndex: 2,
          explanation: 'Body Close yang menembus keluar seluruh rentang Breaker Block menandakan institusi tidak lagi mempertahankan zona tersebut.'
        },
        {
          question: 'Kamu menemukan Bearish **Mitigation Block** (tanpa sweep di puncak) pada M5, namun tidak ada FVG yang menumpuk dan Bias H1 sedang Bullish kuat. Tindakan terbaik?',
          options: [
            'Tetap Sell karena Mitigation Block selalu akurat 90%',
            '**Skip setup** — Mitigation Block tanpa sweep, tanpa FVG, dan melawan Bias H1 memiliki probabilitas rendah',
            'Entry Sell dengan lot 2× lebih besar',
            'Menggeser garis supaya terlihat seperti Breaker Block'
          ],
          answerIndex: 1,
          explanation: 'Mitigation Block memiliki daya tolak lebih rendah dari Breaker dan wajib didukung FVG + searah HTF.'
        },
        {
          question: 'Di mana penempatan Stop Loss paling logis saat mengeksekusi **Bearish Unicorn** (Breaker `2.650–2.652,40` + FVG `2.649,20–2.651,80`, puncak sweep di `2.654,50`)?',
          options: [
            'Tepat di `2.651,90` supaya SL super tipis `$0,50`',
            '**Di atas puncak sweep** (misal `2.655,00` termasuk napas spread) atau minimal di atas batas atas Breaker jika puncak terlalu jauh',
            'Tanpa SL karena Unicorn tidak mungkin gagal',
            'Di bawah harga entry saat ini'
          ],
          answerIndex: 1,
          explanation: 'Puncak sweep adalah titik invalidasi struktural sejati. Menaruh SL di atas puncak sweep + napas spread melindungi posisi dari retest wick agresif Gold.'
        }
      ]
    },
    // =========================================================================
    // BAGIAN VI — BAB 31: BALANCED PRICE RANGE (BPR), VOLUME IMBALANCE & NWOG/NDOG
    // =========================================================================
    {
      id: 'bpr-nwog-ndog-imbalance',
      levelId: 5,
      number: 31,
      bookFormat: true,
      title: 'Balanced Price Range (BPR), Volume Imbalance & Gap Pembukaan (NWOG / NDOG)',
      subtitle: 'Tiga jejak ketimpangan tersembunyi di atas FVG biasa yang sering menjadi dinding pantulan presisi sekaligus magnet target institusional XAU/USD sepanjang minggu.',
      readMinutes: 10,
      diagramId: 'bpr-nwog-ndog',
      diagramAfterSection: 1,
      summary: 'Cara menghitung irisan Balanced Price Range (BPR), membedakan Volume Imbalance (VI) antar-body dari FVG klasik, menandai jangkar mingguan/harian NWOG & NDOG (standar NY → WITA), serta studi kasus XAU/USD tanpa terjebak tutup gap buta.',
      bookSections: [
        {
          number: '31.1',
          heading: 'Balanced Price Range (BPR): Ketika Dua FVG Berlawanan Saling Mengunci',
          shortTitle: 'Balanced Price Range (BPR)',
          paragraphs: [
            'Selamat datang di **Bagian VI** — babak pamungkas buku ini yang 100% berisi senjata ICT tingkat lanjut tanpa mengulang teori dasar. Di Bab 19 kamu sudah menguasai FVG satu arah (`BISI`/`SIBI`). Sekarang naik satu tingkat: **apa yang terjadi ketika harga melesat naik cepat meninggalkan Bullish FVG (`BISI`), lalu langsung dibanting turun secara agresif menembus area yang sama dan meninggalkan Bearish FVG (`SIBI`)?**',
            'Area **irisan tumpang tindih (*overlap*)** antara FVG naik dan FVG turun itulah **Balanced Price Range (BPR)**. Secara matematis, jika `SIBI` berada di `2.650,00–2.654,00` lalu ditembak naik meninggalkan `BISI` di `2.651,00–2.655,00`, maka **Bullish BPR** berada tepat di rentang irisan **`2.651,00 – 2.654,00`** (`max` batas bawah sampai `min` batas atas).',
            'Kenapa BPR bekerja seperti dinding kaca yang sangat keras? Karena area tersebut baru saja melalui penawaran beli sekaligus penawaran jual secara ekstrem — pasar sudah **seimbang dua arah** di sana dan menyisakan dominasi impuls terakhir. Saat harga retrace kembali ke tepi BPR, pantulannya sering jauh lebih tajam dan lebih cepat dibanding FVG tunggal biasa.'
          ]
        },
        {
          number: '31.2',
          heading: 'Volume Imbalance (VI) & Gap Pembukaan Institusi (NWOG / NDOG)',
          shortTitle: 'VI, NWOG & NDOG',
          paragraphs: [
            'Selain BPR, algoritma pengiriman harga XAU/USD sangat menghormati dua celah tersembunyi lain yang hampir selalu luput dari mata trader ritel: **Volume Imbalance (VI)** dan **Gap Pembukaan (NWOG / NDOG)**. Pahami perbedaan mekanis ketiganya pada tabel berikut:'
          ],
          table: {
            caption: 'Perbandingan 4 Jejak Ketimpangan Lanjutan pada XAU/USD',
            headers: ['Konsep Lanjutan', 'Definisi Mekanis di Chart', 'Patokan Waktu / Syarat', 'Fungsi Utama'],
            rows: [
              [
                '**BPR** (*Balanced Price Range*)',
                'Irisan tumpang tindih antara **BISI** dan **SIBI** dari dua dorongan impulsif berlawanan arah',
                'Terbentuk pada pola balik tajam berbentuk `"V"` atau `"Λ"` searah Bias HTF',
                'Dinding pantulan retest super presisi (sering bereaksi sebelum OB di belakangnya)'
              ],
              [
                '**VI** (*Volume Imbalance*)',
                'Celah tipis antara **Close candle 1** dan **Open candle 2**, walau sumbu (*wick*) masih bersentuhan',
                'Muncul di dalam kaki Displacement sesi aktif (bukan error feed broker)',
                'Titik retest mikro yang sangat dihormati di tepi body atau garis `50%`'
              ],
              [
                '**NWOG** (*New Week Opening Gap*)',
                'Celah antara **Close Jumat `17:00 NY`** (`Sabtu 05:00/06:00 WITA`) dan **Open Minggu `18:00 NY`** (`Senin 06:00/07:00 WITA`)',
                'Tarik kotak + garis `50% CE` setiap Senin pagi; aktif sepanjang minggu (hingga 3–4 minggu)',
                'Jangkar algoritma mingguan: magnet DOL sekaligus dinding support/resistance besar'
              ],
              [
                '**NDOG** (*New Day Opening Gap*)',
                'Celah antara **Close harian `17:00 NY`** dan **Open harian baru `18:00 NY`** (jeda 1 jam rollover Gold)',
                'Tandai setiap pagi Selasa–Jumat pukul `07:00 WITA`',
                'Magnet pembukaan intraday sebelum ekspansi sesi London atau NY AM'
              ]
            ]
          }
        },
        {
          number: '31.3',
          heading: 'Aturan Pakai NWOG & BPR Tanpa Terjebak "Tutup Gap Buta"',
          shortTitle: 'Disiplin NWOG & BPR',
          paragraphs: [
            'Kesalahan terbesar trader yang baru mengenal NWOG adalah langsung menekan tombol counter-trend pada **Senin pagi pukul `06:05 WITA`** saat melihat gap `$12` dengan asumsi *"gap pasti langsung tutup pagi ini"*. Padahal di jam pembukaan Senin, spread XAU/USD melebar `5–10×` normal dan tren fundamental bisa melesat `$25` lagi sebelum kembali ke NWOG pada hari Rabu!',
            'Gunakan 3 aturan profesional berikut agar BPR dan NWOG menjadi keunggulan nyata:',
            '• **1. NWOG = Magnet & Jangkar, Bukan Tombol Entry Buta:** Tunggu sesi London/NY membuka kartu. Baru jadikan NWOG (dan garis `50% CE`-nya) sebagai target **Draw on Liquidity (DOL)** setelah struktur LTF (Sweep + MSS/CISD) benar-benar berbalik mengarah ke sana.',
            '• **2. Lebar Minimum NWOG di Gold:** Jika selisih Close Jumat dan Open Senin hanya `$0,30`, cukup tandai sebagai 1 garis referensi (*Weekly Open Anchor*). NWOG bekerja optimal sebagai kotak reaksi jika lebarnya **`≥ $1,50 – $2,00`**.',
            '• **3. Jangan Hapus NWOG Terlalu Cepat:** Meski sudah tersentuh sekali di hari Senin, biarkan garis NWOG aktif sampai Jumat karena institusi sering menggunakannya ulang sebagai pijakan pantulan.'
          ]
        },
        {
          number: '31.4',
          heading: 'Studi Kasus Lengkap XAU/USD: Bearish BPR Menuju Magnet NWOG (London Killzone)',
          shortTitle: 'Studi Kasus BPR + NWOG',
          paragraphs: [
            'Perhatikan bagaimana konfluensi **Bearish BPR** (pemicu entry) dan **NWOG** (magnet target DOL) berpadu rapi pada Senin sesi London:'
          ],
          exampleBox: {
            title: 'Eksekusi Bearish BPR → Target NWOG (Senin · 15:20 WITA EDT)',
            rows: [
              {
                label: '1. Peta Jangkar NWOG Senin Pagi',
                detail: 'Close Jumat di `2.656,00` dan Open Senin di `2.660,00` → kotak **NWOG `2.656,00–2.660,00`** dengan garis tengah **`50% CE = 2.658,00`**.'
              },
              {
                label: '2. Pembentukan Bearish BPR di London KZ',
                detail: 'Harga sempat naik kencang meninggalkan `BISI 2.666,00–2.669,00`, lalu langsung dibanting turun menyapu struktur dan meninggalkan `SIBI 2.665,00–2.668,00`. Irisan keduanya (**`2.666,00–2.668,00`**) resmi menjadi **Bearish BPR**.'
              },
              {
                label: '3. Entry, SL Struktural & Target NWOG (Dengan Napas Ask)',
                detail: 'Harga retrace ke `2.666,50` dan ditolak sumbu atas → **Sell `2.666,50`**, SL di atas puncak BPR **`2.670,00`** (risiko **`$3,50`**). **TP1** di `50% NWOG` (+`$0,50` napas Ask) = **`2.658,50`** (**`+$8,00` / `2,29R`**). **TP2** di batas bawah NWOG (+`$0,50` napas Ask) = **`2.656,50`** (**`+$10,00` / `2,86R`**).'
              }
            ]
          },
          callout: {
            tone: 'warn',
            kicker: 'Peringatan Pembukaan Pekan',
            title: 'Jangan Pernah "Menutup Gap" di 15 Menit Pertama Senin Pagi!',
            body: 'Spread pembukaan Senin pagi (`05:00–07:00 WITA`) sangat tipis likuiditas dan mudah melonjak. Selalu tunggu struktur valid di **London atau NY AM Killzone** sebelum menargetkan kotak NWOG sebagai magnet DOL.'
          }
        }
      ],
      keyTakeaways: [
        '**Balanced Price Range (BPR)** adalah irisan tumpang tindih antara **BISI** dan **SIBI** dari dua gerakan impulsif berlawanan arah — bekerja sebagai dinding kaca pantulan super tajam.',
        '**Volume Imbalance (VI)** adalah celah murni antara *Close candle 1* dan *Open candle 2* walau sumbu saling bersentuhan.',
        '**NWOG** (`Close Jumat 17:00 NY → Open Minggu 18:00 NY`) dan **NDOG** (`Close 17:00 → Open 18:00 NY` harian) beserta garis `50% CE`-nya adalah jangkar magnet DOL sepanjang minggu — bukan sinyal entry buta saat spread Senin pagi melebar.'
      ],
      bridgeNext: 'Kamu sekarang sudah bisa membaca jejak ketimpangan tersembunyi di satu chart XAU/USD (BPR, VI, NWOG/NDOG). Sekarang mari kita tambah "mata kedua" yang dipakai desk institusi untuk membongkar manipulasi secara *real-time* sebelum publik menyadarinya: **Bab 32 — SMT Divergence: Membaca Jejak Manipulasi Gold vs Silver (XAG) & DXY**.',
      practiceCta: {
        label: 'Amati BPR & Level Pembukaan di Chart Gold Mapping',
        description: 'Buka Chart Gold di Cockpit Mapping untuk menandai kotak NWOG/NDOG pembukaan dan memantau reaksi BPR saat Killzone aktif.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'BPR, Volume Imbalance & NWOG/NDOG',
          paragraphs: [
            'BPR adalah irisan dua FVG berlawanan (BISI + SIBI), Volume Imbalance adalah celah antar-body Close–Open, dan NWOG/NDOG adalah celah pembukaan minggu/hari (17:00 NY → 18:00 NY) yang bekerja sebagai jangkar magnet DOL sepanjang minggu.'
          ]
        }
      ],
      mappingSteps: [
        'Setiap Senin pagi (07:00 WITA), tandai NWOG (Close Jumat 17:00 NY → Open Minggu 18:00 NY) beserta garis 50% CE dan biarkan aktif sepanjang minggu.',
        'Setiap pagi Selasa–Jumat, tandai NDOG (Close 17:00 NY → Open 18:00 NY) sebagai magnet intraday.',
        'Saat terjadi pembalikan tajam berbentuk "V", tandai irisan tumpang tindih BISI dan SIBI sebagai Balanced Price Range (BPR).',
        'Catat Volume Imbalance (celah Close–Open antar-body) di dalam leg Displacement sebagai titik retest presisi.'
      ],
      decisionTree: [
        {
          condition: 'Senin 06:10 WITA muncul NWOG naik $12. Apakah langsung Sell tutup gap?',
          action: 'TIDAK — tunggu Killzone London/NY membentuk Sweep + MSS Bearish baru jadikan NWOG sebagai target DOL.'
        },
        {
          condition: 'Ada BPR dan Order Block biasa berdekatan di zona Premium/Discount.',
          action: 'Amati reaksi tepi BPR lebih dulu karena BPR sering memantulkan harga lebih cepat sebelum sempat menyentuh OB.'
        }
      ],
      validRules: [
        'BPR wajib terbentuk dari dua dorongan impulsif berlawanan arah (BISI & SIBI) yang rentangnya saling beririsan.',
        'NWOG diukur ketat dari Close Jumat 17:00 NY ke Open Minggu 18:00 NY beserta 50% CE.'
      ],
      invalidRules: [
        'Entry counter-trend buta saat pembukaan Senin pagi ketika spread melebar.',
        'Menghapus garis NWOG hanya karena sudah tersentuh sekali di hari Senin.'
      ],
      xauScenario: {
        context: 'Senin London KZ: NWOG 2.656,00–2.660,00 (50% = 2.658,00), terbentuk Bearish BPR di 2.666,00–2.668,00.',
        steps: [
          'Retest Bearish BPR → Sell 2.666,50, SL 2.670,00 (risiko $3,50).',
          'TP1 di 2.658,50 (+$8,00 / 2,29R) dan TP2 di 2.656,50 (+$10,00 / 2,86R).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Sell Buta Menutup Gap Senin Subuh',
        context: 'Senin 06:05 WITA muncul NWOG $15 ke atas; trader langsung Sell tanpa menunggu struktur London.',
        whyFailed: 'Spread pembukaan melebar 5–10× dan harga terus melesat naik $25 lagi sebelum baru kembali ke NWOG pada hari Rabu.'
      },
      goldenRules: [
        'BPR adalah jejak dua kali seimbang yang menyisakan dominasi impuls terakhir.',
        'Tandai NWOG setiap Senin pagi dan pertahankan hingga Jumat sebagai magnet sekaligus dinding reaksi.'
      ],
      quiz: [
        {
          question: 'Bagaimana syarat mekanis terbentuknya **Balanced Price Range (BPR)** yang valid?',
          options: [
            'Satu candle bullish besar diikuti 5 candle sideways',
            '**Irisan tumpang tindih antara Bullish FVG (`BISI`) dan Bearish FVG (`SIBI`)** dari dua gerakan impulsif berlawanan arah',
            'Jarak antara Asia High dan Asia Low',
            'Selisih Bid dan Ask saat rilis CPI'
          ],
          answerIndex: 1,
          explanation: 'BPR adalah zona overlap antara BISI dan SIBI berlawanan arah yang menunjukkan area sudah diseimbangkan dua arah dan dikuasai impuls terakhir.'
        },
        {
          question: 'Apa perbedaan utama antara **Volume Imbalance (VI)** dan **Fair Value Gap (FVG)**?',
          options: [
            '**Volume Imbalance** adalah celah murni antar-body (*Close candle 1* ke *Open candle 2*) walau sumbu masih bersentuhan, sedangkan **FVG** adalah celah 3-candle tanpa tersentuh sumbu candle 1 dan 3',
            'Volume Imbalance hanya muncul di saham, tidak pernah di XAU/USD',
            'Volume Imbalance membutuhkan minimal 5 candle',
            'Tidak ada perbedaan sama sekali'
          ],
          answerIndex: 0,
          explanation: 'Volume Imbalance membaca celah antar-body Close–Open dua candle berurutan meskipun wick saling tumpang tindih.'
        },
        {
          question: 'Dari titik harga mana ke mana **NWOG (New Week Opening Gap)** diukur secara resmi?',
          options: [
            'Dari High hari Senin ke Low hari Jumat',
            'Dari **Close penutupan Jumat (`17:00 NY`)** ke **Open pembukaan Minggu malam (`18:00 NY`)**',
            'Dari pembukaan London ke pembukaan New York',
            'Dari penutupan H1 jam 00:00 WITA'
          ],
          answerIndex: 1,
          explanation: 'NWOG selalu diukur dari penutupan resmi pasar Jumat (17:00 NY) ke pembukaan resmi minggu baru (18:00 NY Minggu).'
        },
        {
          question: 'Senin pagi pukul `06:10 WITA`, Gold dibuka gap naik `$10` di atas Close Jumat (`NWOG`). Apa sikap paling disiplin?',
          options: [
            'Langsung Sell tanpa menunggu konfirmasi karena gap pasti tutup detik itu juga',
            'Tandai rentang **NWOG + garis `50% CE`** sebagai jangkar/magnet DOL lalu tunggu konfirmasi struktur di Killzone London atau NY',
            'Hapus NWOG setelah jam `08:00 WITA`',
            'Abaikan NWOG selamanya'
          ],
          answerIndex: 1,
          explanation: 'NWOG adalah jangkar referensi & magnet institusi sepanjang minggu — bukan tombol entry buta saat spread pembukaan Senin melebar.'
        },
        {
          question: 'Harga turun cepat meninggalkan `SIBI` (`2.650–2.654`), lalu ditembak naik agresif meninggalkan `BISI` (`2.651–2.655`). Di rentang mana **Bullish BPR** berada?',
          options: [
            '`2.650 – 2.655` seluruhnya',
            '**`2.651 – 2.654`** (area irisan tumpang tindih antara kedua FVG)',
            'Di bawah `2.650` saja',
            'Di atas `2.655` saja'
          ],
          answerIndex: 1,
          explanation: 'BPR adalah irisan (intersection) kedua FVG: max(2.650, 2.651) = 2.651 hingga min(2.654, 2.655) = 2.654.'
        }
      ]
    },

    // =========================================================================
    // BAGIAN VI — BAB 32: SMT DIVERGENCE (XAU/USD VS SILVER XAG & DXY)
    // =========================================================================
    {
      id: 'smt-divergence-gold',
      levelId: 5,
      number: 32,
      bookFormat: true,
      title: 'SMT Divergence: Membaca Jejak Manipulasi Gold vs Silver (XAG) & DXY',
      subtitle: 'Sidik jari manipulasi Smart Money yang paling sulit dipalsukan: ketika Gold dan aset pasangannya retak korelasi tepat di jam Killzone dan level likuiditas kunci.',
      readMinutes: 10,
      diagramId: 'smt-divergence-gold',
      diagramAfterSection: 1,
      summary: 'Mekanisme Smart Money Technique (SMT Divergence), matriks polaritas XAU vs XAG (searah) dan XAU vs DXY (terbalik), 3 syarat mutlak anti-noise, serta studi kasus konfluensi ganda XAU/USD di NY AM Killzone.',
      bookSections: [
        {
          number: '32.1',
          heading: 'Apa Itu SMT Divergence (Smart Money Technique) & Kenapa Sulit Dipalsukan?',
          shortTitle: 'Logika SMT Divergence',
          paragraphs: [
            'Di pasar global, aset yang memiliki ikatan fundamental erat seharusnya mencetak *Swing High* dan *Swing Low* secara serempak. **SMT Divergence (*Smart Money Technique*)** terjadi ketika pada **menit/jam yang sama persis** di sebuah level likuiditas kunci (`PDH/PDL`, `London High/Low`, atau `HTF POI`), **satu aset berhasil menembus mencetak ekstrem baru (menyapu likuiditas), sedangkan aset pasangannya GAGAL menembus level yang sama**.',
            'Kenapa retakan korelasi ini begitu berharga? Karena ia membongkar niat asli di balik candle: jika sebuah breakout benar-benar didorong arus fundamental serentak, **Gold dan Silver sama-sama menembus puncak** (dan DXY serentak menembus dasar). Ketika salah satu aset "mogok" tidak mau ikut menembus, itulah sidik jari paling jujur bahwa sapuan di aset satunya hanyalah **stop hunt manipulasi** sebelum harga berbalik arah!'
          ]
        },
        {
          number: '32.2',
          heading: 'Matriks Polaritas Wajib Trader XAU/USD: Gold vs Silver (Searah) & Gold vs DXY (Terbalik)',
          shortTitle: 'Polaritas XAG & DXY',
          paragraphs: [
            'Sebagai trader Gold (`XAU/USD`), kamu hanya membutuhkan dua chart pembanding: **Silver (`XAG/USD`)** yang berkorelasi **searah**, dan **Indeks Dolar AS (`DXY`)** yang berkorelasi **terbalik**. Jangan pernah tertukar polaritasnya — simpan matriks ini:'
          ],
          table: {
            caption: 'Matriks Pembacaan SMT Divergence Khusus Trader XAU/USD',
            headers: ['Sinyal SMT untuk Gold', 'Pasangan Pembanding', 'Pergerakan XAU/USD', 'Pergerakan Aset Pembanding (Jam Sama)', 'Arti Institusional'],
            rows: [
              [
                '**Bullish SMT** (Siap Naik)',
                '**XAG/USD** (*Searah*)',
                'Mencetak **Lower Low** (menyapu SSL/PDL)',
                'XAG **gagal turun** — mencetak **Higher Low**',
                'Tekanan jual Gold hanyalah *stop hunt* beli'
              ],
              [
                '**Bearish SMT** (Siap Turun)',
                '**XAG/USD** (*Searah*)',
                'Mencetak **Higher High** (menyapu BSL/PDH)',
                'XAG **gagal naik** — mencetak **Lower High**',
                'Dorongan naik Gold adalah distribusi jual'
              ],
              [
                '**Bullish SMT** (Siap Naik)',
                '**DXY** (*Terbalik*)',
                'Mencetak **Lower Low** (menyapu SSL/PDL)',
                'DXY **gagal cetak HH** — malah **Lower High**',
                'Dolar kehabisan tenaga → Gold siap melesat naik'
              ],
              [
                '**Bearish SMT** (Siap Turun)',
                '**DXY** (*Terbalik*)',
                'Mencetak **Higher High** (menyapu BSL/PDH)',
                'DXY **gagal cetak LL** — malah **Higher Low**',
                'Dolar mulai menguat diam-diam → Gold rawan jatuh'
              ]
            ]
          }
        },
        {
          number: '32.3',
          heading: '3 Syarat Mutlak Validasi SMT (Agar Tidak Tertipu Sinyal Palsu)',
          shortTitle: '3 Syarat Anti-Noise SMT',
          paragraphs: [
            'Banyak pemula melihat sedikit perbedaan tinggi candle di M1 jam `11:30 WITA` (jam mati Asia) lalu berteriak *"Ada SMT!"* dan langsung menekan order melawan tren. Itu bukan SMT — itu **noise**. Pastikan 3 syarat mutlak ini terpenuhi:',
            '• **Syarat 1 — Timestamp & Timeframe Identik:** Kedua ayunan yang dibandingkan wajib terbentuk pada **jam/candle yang sama persis** di timeframe yang sama (`H1` atau `M15`). Haram membandingkan puncak Gold hari Selasa dengan puncak Silver hari Kamis.',
            '• **Syarat 2 — Lokasi & Waktu Keramat (`Time & Price`):** SMT hanya bernilai tinggi jika terjadi tepat di **level likuiditas penting** (`PDH/PDL`, `PWH/PWL`, `Asia/London High-Low`, atau `HTF PD Array`) dan di dalam **Killzone London / NY AM**.',
            '• **Syarat 3 — SMT = Lampu Hijau Konteks, Bukan Tombol Entry Buta:** Setelah SMT terlihat, **jangan langsung klik Market Order!** Turun ke `M5` dan tunggu pemicu eksekusi resmi: **CISD/MSS + PD Array (`FVG`/`OB`/`Unicorn`)**.'
          ]
        },
        {
          number: '32.4',
          heading: 'Studi Kasus Lengkap XAU/USD: Konfluensi Ganda Bullish SMT (XAG + DXY) di NY AM',
          shortTitle: 'Studi Kasus SMT Gold',
          paragraphs: [
            'Lihat bagaimana pengecekan 10 detik ke chart `XAG/USD` dan `DXY` mengubah sebuah sapuan biasa menjadi setup Grade A++ berprobabilitas luar biasa tinggi:'
          ],
          exampleBox: {
            title: 'Eksekusi Bullish SMT Ganda — NY AM Killzone (20:45 WITA EDT)',
            rows: [
              {
                label: '1. Sapuan di Level Kunci',
                detail: 'Pukul `20:45 WITA`, XAU/USD turun menembus **London Low `2.638,00`** dan menyapu tipis ke **`2.636,50`** (Lower Low).'
              },
              {
                label: '2. Cek 10 Detik: XAG/USD & DXY (Timestamp Sama)',
                detail: '• Di **`XAG/USD`** jam `20:45 WITA`: Silver tertahan di atas London Low-nya (cetak **Higher Low**) → **Bullish SMT #1 aktif**.\n• Di **`DXY`** jam `20:45 WITA`: Indeks Dolar gagal menembus London High-nya (cetak **Lower High**) → **Bullish SMT #2 aktif!**'
              },
              {
                label: '3. Konfirmasi M5 & Eksekusi Terukur',
                detail: 'M5 XAU/USD cetak **Bullish CISD** + `BISI` di `2.638,20–2.640,00`. Entry **Buy `2.639,00`**, SL di **`2.635,50`** (buffer `$1,00` di bawah wick `2.636,50` → risiko **`$3,50`**). **TP1** internal high **`2.646,00`** (**`+$7,00` / `2,00R`**), **TP2** London High **`2.653,00`** (**`+$14,00` / `4,00R`**).'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Tips Praktis Layar Harian',
            title: 'Cukup Salah Satu Konfirmasi (XAG atau DXY) Sudah Valid!',
            body: 'Jika XAU vs XAG tidak membentuk SMT (sama-sama mencetak HH), namun **XAU vs DXY** membentuk Bearish SMT (DXY gagal membuat LL) tepat di PDH saat NY AM Killzone, sinyal SMT tetap valid karena **DXY adalah penggerak makro langsung XAU/USD**.'
          }
        }
      ],
      keyTakeaways: [
        '**SMT Divergence** adalah retakan korelasi pada timestamp identik di level likuiditas kunci — membongkar bahwa sapuan di satu aset hanyalah *stop hunt* manipulasi.',
        'Hafalkan polaritasnya: **XAU vs XAG bersifat searah**, sedangkan **XAU vs DXY bersifat terbalik**.',
        'SMT tanpa **Key Level** dan di luar **Killzone** hanyalah noise; eksekusi tetap wajib menunggu **CISD/MSS + PD Array** di LTF M5.'
      ],
      bridgeNext: 'Sekarang kamu sudah bisa mengonfirmasi titik pembalikan institusi hingga ke sidik jari antar-asetnya (`SMT Divergence`). Tetapi setelah pembalikan terjadi, bagaimana kamu melihat **keseluruhan peta perjalanan harga dari awal sampai selesai** — kapan FVG lawan akan ditembus mudah dan kapan tren resmi habis? Mari masuk ke **Bab 33: Market Maker Buy & Sell Model (MMXM): Peta Besar Perjalanan Harga**.',
      practiceCta: {
        label: 'Pantau Arah DXY & Kompas Fundamental Gold',
        description: 'Cek kekuatan Indeks Dolar AS (DXY) dan sentimen makro Gold di modul Market Intelligence sebagai pendamping konfirmasi SMT.',
        href: '../market-intel/index.html'
      },
      conceptBlocks: [
        {
          heading: 'SMT Divergence: XAU vs XAG & DXY',
          paragraphs: [
            'SMT terjadi saat satu aset menyapu level likuiditas kunci sementara pasangan korelasinya gagal menembus pada timestamp sama. XAU–XAG searah; XAU–DXY terbalik. Wajib di Key Level + Killzone dan tetap dikonfirmasi CISD/MSS.'
          ]
        }
      ],
      mappingSteps: [
        'Buka chart pembanding XAG/USD (searah) dan DXY (terbalik) pada timeframe yang sama (H1/M15).',
        'Tunggu XAU/USD menyapu level likuiditas penting (PDH/PDL, Asia/London H-L) di jam Killzone.',
        'Bandingkan titik puncak/dasar pada timestamp identik: jika satu menyapu dan pasangannya gagal → SMT aktif.',
        'Turun ke M5 dan tunggu CISD/MSS + PD Array di XAU/USD sebelum menekan entry.'
      ],
      decisionTree: [
        {
          condition: 'SMT terlihat di tengah range jam 11:30 WITA tanpa menyentuh level likuiditas penting.',
          action: 'ABAIKAN (Noise) — SMT hanya valid di Key Level/HTF POI dalam jam Killzone.'
        },
        {
          condition: 'XAU vs XAG sama-sama HH, tetapi DXY gagal LL (cetak HL) tepat di PDH jam NY AM.',
          action: 'Valid sebagai Bearish SMT karena DXY penggerak makro langsung Gold — pantau CISD Bearish M5.'
        }
      ],
      validRules: [
        'Titik pembanding antar-aset WAJIB berada pada timestamp dan timeframe identik.',
        'SMT terjadi di level likuiditas kunci / HTF PD Array dalam jendela Killzone dan diikuti konfirmasi CISD/MSS.'
      ],
      invalidRules: [
        'Membandingkan swing dari dua waktu berbeda antar aset.',
        'Entry instan hanya karena SMT tanpa menunggu penutupan candle CISD/MSS.'
      ],
      xauScenario: {
        context: 'NY AM Killzone 20:45 WITA: XAU sapu London Low 2.638,00 ke 2.636,50, sementara XAG cetak HL dan DXY cetak LH.',
        steps: [
          'Konfluensi ganda Bullish SMT + M5 CISD + BISI 2.638,20–2.640,00.',
          'Buy 2.639,00, SL 2.635,50 ($3,50), TP1 2.646,00 (2,00R), TP2 London High 2.653,00 (4,00R).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: SMT Mikro di Jam Mati Asia',
        context: 'Pukul 11:30 WITA di tengah range M5, Gold cetak titik sedikit lebih tinggi dari Silver; trader langsung Sell.',
        whyFailed: 'Di luar Killzone dan bukan di level likuiditas kunci — sesi London langsung mendorong keduanya naik menembus SL.'
      },
      goldenRules: [
        'SMT Divergence = Sidik jari manipulasi Smart Money. Tanpa Key Level dan Killzone, SMT hanyalah noise.',
        'Polaritas baku: XAU vs XAG searah; XAU vs DXY terbalik.'
      ],
      quiz: [
        {
          question: 'Kondisi mana yang menunjukkan **Bullish SMT Divergence** antara `XAU/USD` (Gold) dan `DXY` (Indeks Dolar AS)?',
          options: [
            '**`XAU/USD` mencetak Lower Low (menyapu SSL), sementara pada waktu sama `DXY` GAGAL mencetak Higher High (malah Lower High)**',
            '`XAU/USD` mencetak Lower Low dan `DXY` serempak mencetak Higher High sangat kuat',
            '`XAU/USD` mencetak Higher High dan `DXY` juga mencetak Higher High secara acak di sesi Asia',
            '`XAU/USD` diam sideways saat `DXY` tutup'
          ],
          answerIndex: 0,
          explanation: 'Karena korelasi Gold dan DXY terbalik, kegagalan DXY mencetak HH saat Gold mencetak LL membuktikan kekuatan Dolar palsu dan Gold siap berbalik naik.'
        },
        {
          question: 'Kondisi mana yang menunjukkan **Bearish SMT Divergence** antara `XAU/USD` dan `XAG/USD` (Silver)?',
          options: [
            '**`XAU/USD` mencetak Higher High menyapu PDH, sementara di jam yang sama `XAG/USD` gagal menembus PDH-nya (`Lower High`)**',
            'Keduanya sama-sama menembus PDH dengan Displacement tebal',
            '`XAU/USD` mencetak Lower Low sementara `XAG/USD` mencetak Higher Low',
            '`XAU/USD` naik hari Senin dan `XAG/USD` turun hari Jumat'
          ],
          answerIndex: 0,
          explanation: 'Gold dan Silver berkorelasi searah; saat Gold menyapu puncak (HH) namun Silver gagal (LH) di jam yang sama, muncul sinyal Bearish SMT.'
        },
        {
          question: 'Syarat wajib agar **SMT Divergence** tidak menjadi jebakan noise adalah...',
          options: [
            'Cukup melihat chart M1 kapan saja',
            'Terjadi pada **timestamp yang sama persis**, tepat di **level likuiditas kunci / HTF PD Array**, dan di dalam **jam Killzone**',
            'Wajib ditambah indikator MACD dan Stochastic',
            'Hanya boleh dipakai pada hari Jumat malam'
          ],
          answerIndex: 1,
          explanation: 'SMT bekerja karena konteks Time & Price: waktu identik, lokasi likuiditas kunci, dan sesi institusional.'
        },
        {
          question: 'Setelah melihat **Bullish SMT** valid antara Gold dan Silver tepat di PDL pukul `20:45 WITA`, langkah eksekusi paling aman adalah...',
          options: [
            'Langsung tekan Buy Market detik itu juga tanpa menunggu candle tutup',
            'Turun ke `M5` dan tunggu konfirmasi perubahan arah (**`CISD`/`MSS` + `PD Array`**) di `XAU/USD` sebelum entry',
            'Tunggu sampai harga menembus PDH dulu baru Buy',
            'Langsung Sell karena Gold baru saja mencetak Lower Low'
          ],
          answerIndex: 1,
          explanation: 'SMT adalah konfirmasi konteks (lampu hijau), bukan pemicu entry buta — tetap wajib menunggu CISD/MSS di LTF untuk timing dan SL presisi.'
        },
        {
          question: 'Mengapa membandingkan Swing High Gold pukul `15:00 WITA` dengan Swing High Silver pukul `18:00 WITA` dianggap salah total?',
          options: [
            'Karena SMT wajib membandingkan titik ayunan pada **jendela waktu (timestamp) yang sama persis**',
            'Karena pukul `18:00 WITA` pasar Silver libur',
            'Karena Gold dan Silver tidak boleh dilihat di M15',
            'Karena hanya perbandingan 1 minggu penuh yang valid'
          ],
          answerIndex: 0,
          explanation: 'SMT mengukur perbedaan pengiriman algoritma pada momen yang sama; membandingkan dua waktu berbeda menghancurkan validitas korelasinya.'
        }
      ]
    },

    // =========================================================================
    // BAGIAN VI — BAB 33: MARKET MAKER BUY & SELL MODEL (MMXM)
    // =========================================================================
    {
      id: 'mmxm-market-maker-model',
      levelId: 5,
      number: 33,
      bookFormat: true,
      title: 'Market Maker Buy & Sell Model (MMXM): Peta Besar Perjalanan Harga',
      subtitle: 'Cetak biru yang menyatukan seluruh puzzle ICT ke dalam satu kurva simetris: dari Original Consolidation → Smart Money Reversal → Low Resistance Liquidity Run menuju Terminus.',
      readMinutes: 10,
      diagramId: 'mmxm-market-maker-model',
      diagramAfterSection: 1,
      summary: 'Anatomi 4 babak Market Maker Buy/Sell Model (MMBM/MMSM), prinsip Side of the Curve (kenapa PD Array sisi kiri ditembus mudah sebagai LRLR), titik entry emas Tahap 1 & Tahap 2, serta studi kasus utuh XAU/USD.',
      bookSections: [
        {
          number: '33.1',
          heading: 'Menyatukan Semua Potongan Puzzle ICT: Mengapa Harga Membentuk Kurva "V" / "Λ"?',
          shortTitle: 'Peta Besar Kurva MMXM',
          paragraphs: [
            'Pernahkah kamu bertanya: *"Kenapa tadi Bearish FVG yang sangat rapi itu malah ditembus naik tanpa ampun, padahal kemarin bentuk yang persis sama menahan harga dengan indah?"* Jawabannya sederhana: karena kamu melihat FVG sebagai kotak terpisah, bukan sebagai bagian dari **satu kurva siklus utuh**.',
            'Dalam ICT, hampir setiap pergerakan tren intraday maupun swing XAU/USD mengikuti cetak biru **Market Maker Buy Model (`MMBM`)** untuk siklus beli berbentuk huruf **"V"**, atau **Market Maker Sell Model (`MMSM`)** untuk siklus jual berbentuk **"Λ"** terbalik — gabungan keduanya disebut **MMXM**.',
            'Sisi kiri kurva adalah fase membangun deretan tangga likuiditas; ujung lancip di HTF PD Array adalah titik balik institusi (**Smart Money Reversal**); dan sisi kanan kurva adalah fase panen cepat kembali menuju titik awal (**Terminus**).'
          ]
        },
        {
          number: '33.2',
          heading: 'Anatomi 4 Babak Resmi Market Maker Buy Model (MMBM) & Sell Model (MMSM)',
          shortTitle: '4 Babak Resmi MMXM',
          paragraphs: [
            'Pelajari empat babak kronologis siklus **MMBM** (dan cerminan terbaliknya pada **MMSM**) agar kamu selalu tahu sedang berada di babak ke berapa saat membuka chart:'
          ],
          table: {
            caption: '4 Babak Kronologis Market Maker Model (MMBM & MMSM)',
            headers: ['Babak Siklus', 'Pada MMBM (Kurva Beli "V")', 'Pada MMSM (Kurva Jual "Λ")', 'Peran bagi Trader'],
            rows: [
              [
                '**1. Original Consolidation (OC)**',
                'Kotak konsolidasi awal (misal Asia Range / H1) sebelum harga turun keluar',
                'Kotak konsolidasi awal sebelum harga naik keluar',
                'Sisi seberangnya adalah **Target Akhir (Terminus)**!'
              ],
              [
                '**2. Sisi Kiri Kurva** (*Engineering*)',
                'Harga turun bertahap menuju HTF POI sambil menanam deretan **Swing High (BSL)** rapi',
                'Harga naik bertahap menuju HTF POI sambil menanam deretan **Swing Low (SSL)** rapi',
                'Tandai setiap swing sisi kiri sebagai **tangga target** nanti'
              ],
              [
                '**3. Smart Money Reversal (SMR)**',
                'Menyentuh **HTF PD Array** (PDL / H1-H4 OB/FVG) → Sweep + SMT + MSS Bullish',
                'Menyentuh **HTF PD Array** (PDH / H1-H4 OB/FVG) → Sweep + SMT + MSS Bearish',
                '**Peluang Entry Emas Tahap 1** (R:R terbesar)'
              ],
              [
                '**4. Sisi Kanan Kurva** (*LRLR → Terminus*)',
                'Naik cepat lewat `1–2×` jeda **Re-Accumulation** menyapu seluruh tangga BSL hingga tembus atas OC',
                'Jatuh cepat lewat `1–2×` jeda **Redistribution** menyapu seluruh tangga SSL hingga tembus bawah OC',
                '**Entry Tahap 2** (Re-Acc/Redist); **STOP entry** begitu OC tersapu!'
              ]
            ]
          }
        },
        {
          number: '33.3',
          heading: 'Hukum "Sisi Kurva" (Side of the Curve) & LRLR vs HRLR',
          shortTitle: 'Side of the Curve & LRLR',
          paragraphs: [
            'Begitu kamu tahu sedang berada di sisi mana dari kurva MMXM, 80% kebingungan memilih PD Array langsung sirna:',
            '• **Di Buy-Side of the Curve (Sisi Kanan MMBM):** Semua **Bullish PD Array** (BISI/Bullish OB/Breaker) akan **DIHORMATI** sebagai batu loncatan naik, sementara semua **Bearish PD Array bekas sisi kiri** akan **DITEMBUS MUDAH**! Fenomena meluncur cepat menembus tangga sisi kiri tanpa perlawanan inilah **Low Resistance Liquidity Run (`LRLR`)**.',
            '• **Di Sell-Side of the Curve (Sisi Kanan MMSM):** Kebalikannya berlaku penuh — semua Bearish PD Array dihormati, sementara Bullish PD Array bekas sisi kiri ditembus cepat menuju batas bawah Original Consolidation.',
            '• **Kapan Siklus Resmi Selesai?** Begitu harga menyapu puncak/dasar **Original Consolidation (Terminus)**, misi MMXM **RESMI TUNTAS!** Jangan serakah membuka entry searah baru di atas/bawah Terminus karena institusi justru sering memulai distribusi balik arah di sana.'
          ]
        },
        {
          number: '33.4',
          heading: 'Studi Kasus Lengkap XAU/USD: Siklus MMBM Utuh dari Asia OC → PDL → Terminus',
          shortTitle: 'Studi Kasus MMBM Gold',
          paragraphs: [
            'Amati bagaimana satu hari penuh pergerakan XAU/USD di chart M15 merangkai seluruh empat babak **MMBM** dengan sangat presisi:'
          ],
          exampleBox: {
            title: 'Peta Kurva MMBM M15 XAU/USD — Selasa Sesi London ke NY AM',
            rows: [
              {
                label: 'Babak 1–2 — Original Consolidation & Sisi Kiri',
                detail: 'Konsolidasi Asia (**OC**) berada di `2.658,00–2.662,00`. Pukul `14:15 WITA`, Gold turun bertahap menuju **PDL + H1 Bullish OB di `2.642,00`** sambil meninggalkan dua tangga Swing High bersih di `2.657,00` dan `2.651,00`.'
              },
              {
                label: 'Babak 3 — Smart Money Reversal (SMR)',
                detail: 'Di `2.641,50`, Gold menyapu PDL `$0,50` lalu meledak naik mematahkan struktur (MSS Bullish) dan meninggalkan `BISI` M5 di `2.645,00–2.647,00`. Harga resmi masuk **Buy-Side of the Curve**.'
              },
              {
                label: 'Babak 4 — Eksekusi, Re-Accumulation & Terminus LRLR',
                detail: 'Entry **Buy `2.646,00`** (Tahap 1; atau di jeda Re-Accumulation `2.650,00` Tahap 2), **SL `2.640,50`** (buffer `$1,00` di bawah `2.641,50` → risiko **`$5,50`**). Harga melesat menembus Bearish FVG sisi kiri (`LRLR`) mencapai **TP1 tangga BSL `2.657,00`** (**`+$11,00` / `2,00R`**) dan **TP2 Terminus puncak OC `2.662,50`** (**`+$16,50` / `3,00R`**)!'
              }
            ]
          },
          callout: {
            tone: 'warn',
            kicker: 'Kesalahan Paling Umum di MMXM',
            title: 'Jangan Counter-Trend di Sisi Kanan, dan Jangan Kejar Setelah Terminus!',
            body: 'Dua kesalahan fatal di MMXM: (1) nekat Sell pada Bearish FVG bekas sisi kiri saat kurva sudah masuk **Buy-Side** (`LRLR`), dan (2) tetap mengejar Buy setelah puncak **Original Consolidation (Terminus)** sudah tersapu penuh.'
          }
        }
      ],
      keyTakeaways: [
        '**MMXM (`MMBM`/`MMSM`)** memetakan siklus lengkap 4 babak: **Original Consolidation (OC)** → **Engineering Sisi Kiri** → **Smart Money Reversal (SMR di HTF POI)** → **Re-Accumulation/Redistribution & LRLR menuju Terminus**.',
        'Hukum **Side of the Curve**: di sisi kanan MMBM, Bullish PD Array dihormati sedangkan Bearish PD Array sisi kiri ditembus cepat (**LRLR**).',
        'Entry terbaik hanya pada **Tahap 1 (SMR)** atau **Tahap 2 (Re-Accumulation/Redistribution)** — begitu **Original Consolidation (Terminus)** tersapu, siklus selesai!'
      ],
      bridgeNext: 'Kamu sekarang sudah bisa membaca kurva lengkap MMXM dalam satu hari maupun beberapa hari. Sekarang mari kita naikkan lensa waktu ke skala **mingguan dan kuartalan**: kapan hari terbaik dalam seminggu untuk memanen ekspansi, kapan hari Jumat berbalik arah (*TGIF*), dan sejauh mana memori likuiditas bank di chart Daily? Mari buka **Bab 34: Weekly Profile (Classic Expansion, Midweek Reversal, TGIF) & IPDA 20/40/60**.',
      practiceCta: {
        label: 'Lacak Kurva MMBM/MMSM Bar-by-Bar di Candle Replay',
        description: 'Gunakan Candle Replay M15/H1 XAU/USD untuk melatih mata mengenali Original Consolidation, SMR, Re-Accumulation, dan Terminus secara langsung.',
        href: 'trading-practice/candle-replay.html'
      },
      conceptBlocks: [
        {
          heading: 'Market Maker Buy & Sell Model (MMXM)',
          paragraphs: [
            'MMXM merangkai 4 babak: Original Consolidation (Terminus) → Engineering sisi kiri → Smart Money Reversal di HTF POI → Re-Accumulation/Redistribution & LRLR menyapu Terminus.'
          ]
        }
      ],
      mappingSteps: [
        'Tandai Original Consolidation (OC) terakhir pada H1/M15.',
        'Amati sisi kiri kurva yang menanam tangga Swing menuju HTF PD Array (PDH/PDL/H1 OB).',
        'Tunggu Smart Money Reversal (Sweep + Displacement + MSS) di HTF PD Array.',
        'Cari entry hanya di Tahap 1 (SMR) atau Tahap 2 (Re-Accumulation/Redistribution) dengan target akhir OC (Terminus).'
      ],
      decisionTree: [
        {
          condition: 'Ketinggalan entry di dasar SMR pada MMBM.',
          action: 'Tunggu jeda Tahap 2 (Re-Accumulation di FVG/OB sisi kanan) — jangan mengejar pucuk candle.'
        },
        {
          condition: 'Harga sudah menyapu penuh batas atas Original Consolidation (Terminus).',
          action: 'Siklus MMBM resmi selesai — kunci profit dan berhenti mengejar Buy baru.'
        }
      ],
      validRules: [
        'SMR wajib bertumpu pada HTF PD Array nyata (PDH/PDL, H1/H4 OB/FVG).',
        'Target Terminus adalah sisi seberang Original Consolidation.'
      ],
      invalidRules: [
        'Melawan arus dengan memakai FVG bekas sisi kiri kurva saat sudah masuk LRLR.',
        'Terus masuk searah setelah Original Consolidation sudah tersapu penuh.'
      ],
      xauScenario: {
        context: 'MMBM M15 XAU/USD: Asia OC 2.658–2.662, turun ke PDL + H1 OB 2.642, SMR di 2.641,50.',
        steps: [
          'Buy di BISI pasca-SMR 2.646,00, SL 2.640,50 ($5,50).',
          'LRLR menembus sisi kiri ke TP1 2.657,00 (2,00R) dan TP2 Terminus OC 2.662,50 (3,00R).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Buy Terlambat di Atas Terminus',
        context: 'Setelah MMBM selesai menyapu puncak OC 2.662–2.663, trader tetap Buy di FVG baru 2.661.',
        whyFailed: 'Misi pengiriman MMBM sudah tuntas di Terminus; institusi langsung mendistribusi jual membalikkan harga ke SL.'
      },
      goldenRules: [
        'Tentukan Sisi Kurva (Buy-Side vs Sell-Side) sebelum memilih FVG/OB.',
        'Masuk di Tahap 1 (SMR) atau Tahap 2 (Re-Acc/Redist) dan kunci profit saat Terminus tersapu.'
      ],
      quiz: [
        {
          question: 'Dalam **Market Maker Buy Model (MMBM)**, apa peran utama dari area **Original Consolidation (OC)** pada akhir siklus?',
          options: [
            'Sebagai area Stop Loss wajib',
            'Sebagai **Target Akhir (Terminus)** tempat kurva Buy-Side menyelesaikan pengirimannya',
            'Sebagai area yang tidak boleh disentuh selamanya',
            'Hanya hiasan visual tanpa fungsi likuiditas'
          ],
          answerIndex: 1,
          explanation: 'Dalam MMXM, harga berawal dari Original Consolidation, menuju HTF PD Array untuk SMR, lalu menyapu sisi seberang OC sebagai Terminus.'
        },
        {
          question: 'Saat harga sudah resmi masuk ke **Buy-Side of the Curve** (pasca-SMR Bullish), apa yang biasanya terjadi pada Bearish FVG bekas sisi kiri kurva?',
          options: [
            'Bearish FVG sisi kiri akan menahan harga turun selama berhari-hari',
            'Bearish FVG sisi kiri cenderung **ditembus dengan mudah** karena arus melaju cepat (**Low Resistance Liquidity Run / LRLR**) menuju Terminus',
            'Bearish FVG sisi kiri wajib dipakai untuk entry Sell besar',
            'Harga berhenti bergerak setiap menyentuhnya'
          ],
          answerIndex: 1,
          explanation: 'Prinsip Side of the Curve: di Buy-Side, Bullish PD Array dihormati sedangkan Bearish PD Array sisi kiri ditembus cepat.'
        },
        {
          question: 'Jika kamu ketinggalan entry di dasar **Smart Money Reversal (SMR)** pada MMBM, di mana titik entry kedua yang paling terstruktur?',
          options: [
            'Mengejar Buy tepat di atas puncak Original Consolidation (Terminus)',
            'Menunggu fase **Re-Accumulation** (jeda retrace pertama di sisi kanan kurva ke Bullish FVG/OB baru)',
            'Langsung Sell melawan arah SMR',
            'Menunggu 1 bulan penuh'
          ],
          answerIndex: 1,
          explanation: 'Tahap 2 (Re-Accumulation pada MMBM / Redistribution pada MMSM) adalah titik entry lanjutan terbaik sebelum Terminus.'
        },
        {
          question: 'Di mana **Smart Money Reversal (SMR)** yang valid seharusnya terbentuk?',
          options: [
            'Di ruang kosong tanpa level referensi apa pun',
            'Tepat di sebuah **HTF PD Array atau Pool Likuiditas kunci** (H1/H4 FVG, OB, atau PDH/PDL)',
            'Tepat di menit pertama pasar buka hari Senin',
            'Hanya saat indikator RSI menyentuh 50'
          ],
          answerIndex: 1,
          explanation: 'Tanpa pijakan HTF Key Level/PD Array, pembalikan LTF hanyalah pullback sementara, bukan SMR sejati.'
        },
        {
          question: 'Apa tanda bahwa siklus **Market Maker Sell Model (MMSM)** sudah **SELESAI** sehingga kamu dilarang mengejar Sell baru?',
          options: [
            'Saat candle pertama merah muncul',
            'Saat harga sudah jatuh **menembus dan menyapu batas bawah Original Consolidation (Terminus)**',
            'Saat terjadi Redistribution tahap pertama',
            'Saat sesi London baru saja dimulai'
          ],
          answerIndex: 1,
          explanation: 'Begitu batas bawah Original Consolidation tersapu, misi likuiditas MMSM sudah tuntas dan rawan pembalikan arah.'
        }
      ]
    },

    // =========================================================================
    // BAGIAN VI — BAB 34: WEEKLY PROFILE (CLASSIC, MIDWEEK, TGIF) & IPDA 20/40/60
    // =========================================================================
    {
      id: 'ict-macros-weekly-ipda',
      levelId: 5,
      number: 34,
      bookFormat: true,
      title: 'Weekly Profile (Classic Expansion, Midweek Reversal, TGIF) & IPDA 20/40/60',
      subtitle: 'Zoom out dari jadwal harian ke peta waktu institusional Senin–Jumat dan memori likuiditas 20, 40, dan 60 hari perdagangan agar kamu tahu kapan hari panen utama dan kapan Jumat berbalik arah.',
      readMinutes: 9,
      diagramId: 'ict-macros-weekly-ipda',
      diagramAfterSection: 0,
      summary: 'Tiga template mingguan utama XAU/USD (Classic Expansion, Midweek Reversal, Friday TGIF retracement 20%–30%), cara memetakan IPDA Data Range Lookback 20/40/60 hari perdagangan di Daily, serta sinergi Weekly Profile dengan jendela Macro 20 menit (Bab 16).',
      bookSections: [
        {
          number: '34.1',
          heading: 'Zoom Out dari Harian ke Mingguan: Mengapa Hari Senin, Rabu & Jumat Berbeda Karakter?',
          shortTitle: 'Peta Waktu Mingguan',
          paragraphs: [
            'Di **Bab 16** kamu sudah menguasai mesin waktu harian: **Killzone**, **Silver Bullet**, dan **ICT Macro 20 menit (`xx:50–xx:10 NY`)**. Namun trader institusional tidak hanya bertanya *"jam berapa sekarang?"* — mereka selalu lebih dulu bertanya: **"Hari apa hari ini di dalam kalender mingguan, dan seberapa jauh tren minggu ini sudah melaju?"**',
            'Sama seperti satu hari punya siklus AMD (Akumulasi Asia → Manipulasi London → Ekspansi NY), **satu minggu perdagangan (Senin–Jumat) adalah satu candle Weekly yang juga menjalankan siklus AMD!** Mengerti peta mingguan (*Weekly Profile*) seketika mencegah dua kesalahan mahal: frustrasi overtrading di hari Senin yang lambat, dan FOMO membeli pucuk pada Jumat malam tepat saat institusi mengambil untung.'
          ]
        },
        {
          number: '34.2',
          heading: '3 Profil Mingguan Utama XAU/USD (Classic Expansion, Midweek Reversal & Friday TGIF)',
          shortTitle: '3 Template Weekly Profile',
          paragraphs: [
            'Hampir seluruh pekan perdagangan XAU/USD sepanjang tahun jatuh ke dalam salah satu dari **3 template mingguan** berikut:'
          ],
          table: {
            caption: '3 Template Weekly Profile Utama pada XAU/USD (Senin–Jumat)',
            headers: ['Weekly Profile', 'Pola Senin – Selasa', 'Pola Rabu – Kamis', 'Pola Jumat & Strategi Terbaik'],
            rows: [
              [
                '**1. Classic Expansion** (*Paling Sering*)',
                '**Senin** akumulasi tenang; **Selasa** (atau Rabu London) membentuk **Low/High of the Week** (*manipulasi Judas mingguan*)',
                'Ekspansi penuh searah bias mingguan menuju DOL HTF (hari panen terbesar!)',
                'Puncak tren atau konsolidasi; fokus panen utama di **Selasa–Kamis**'
              ],
              [
                '**2. Midweek Reversal** (*Pekan Berita CPI/FOMC*)',
                'Senin–Selasa terus menguras likuiditas ke 1 sisi menuju HTF PD Array besar',
                '**Rabu** (sering dipicu berita merah AS) terjadi **pembalikan arah besar**',
                'Kamis–Jumat meluncur deras searah tren baru; hindari nekat lawan arah pasca-Rabu'
              ],
              [
                '**3. Friday TGIF** (*Thank God It’s Friday*)',
                'Senin–Kamis tren sudah melaju sangat jauh satu arah (misal `+$80` s.d. `+$120` di Gold)',
                'Ekspansi ekstrem selesai mencapai target mingguan di Kamis / Jumat pagi',
                'Jumat NY sering **retrace balik `20%–30%`** rentang mingguan karena bank *profit-taking*! **STOP kejar breakout!**'
              ]
            ]
          }
        },
        {
          number: '34.3',
          heading: 'IPDA Data Range Lookback (20 / 40 / 60 Hari): Memori Likuiditas Institusi',
          shortTitle: 'IPDA Lookback 20/40/60',
          paragraphs: [
            'Saat membuka chart Daily XAU/USD, ada ratusan puncak dan lembah dari tahun-tahun sebelumnya. Mana yang benar-benar masih dibaca oleh algoritma pengiriman harga (*Interbank Price Delivery Algorithm / IPDA*)?',
            'ICT menetapkan patokan **IPDA Data Range Lookback**: hitung mundur secara mekanis di chart Daily berdasarkan **hari perdagangan** (*trading days*, bukan hari kalender):',
            '• **20 Hari Perdagangan Terakhir (≈ 1 Bulan) — Prioritas #1:** High tertinggi dan Low terendah di dalam 20 candle Daily terakhir adalah kolam likuiditas makro paling aktif dan paling sering menjadi magnet pertama.',
            '• **40 Hari Perdagangan Terakhir (≈ 2 Bulan) — Prioritas #2:** Aktif sebagai target berikutnya begitu batas 20 hari sudah ditembus atau disapu.',
            '• **60 Hari Perdagangan Terakhir (≈ 1 Kuartal / 3 Bulan) — Prioritas #3:** Jangkar struktural kuartalan bagi dana lindung nilai (*hedge fund*).',
            'Manfaat praktisnya luar biasa: kamu **tidak perlu lagi menggambar 25 garis support-resistance dari 3 tahun lalu** yang sudah usang! Cukup tandai High/Low segar dalam jendela `20/40/60` hari setiap Minggu malam.'
          ]
        },
        {
          number: '34.4',
          heading: 'Studi Kasus XAU/USD: Sinergi Classic Expansion + NY Macro vs Jebakan Jumat TGIF',
          shortTitle: 'Studi Kasus Weekly + Macro',
          paragraphs: [
            'Perhatikan perbedaan dramatis antara mengeksekusi **NY Macro (`21:50–22:10 WITA` EDT — merujuk Bab 16)** pada hari Rabu *Classic Expansion* dibandingkan hari Jumat *TGIF*:'
          ],
          exampleBox: {
            title: 'Kontras Nyata: Hari Panen Rabu vs Jebakan Profit-Taking Jumat (TGIF)',
            rows: [
              {
                label: 'Kasus A — Rabu 21:50 WITA (Classic Bullish Expansion · PANEN!)',
                detail: 'Selasa London sudah membentuk *Low of the Week* di PDL (menyentuh IPDA 20-day Low). Rabu `21:50 WITA` (NY Macro), harga di M15 Bullish FVG `2.655,00` menyapu micro-low `2.654,20` lalu CISD M5 → **Buy `2.656,00`**, **SL `2.653,00`** (`$3,00`). **TP1 `2.662,00`** (**`+$6,00` / `2,00R`**) dan **TP2 High harian `2.668,00`** (**`+$12,00` / `4,00R`**) tercapai dalam 25 menit!'
              },
              {
                label: 'Kasus B — Jumat 21:50 WITA (Setelah Reli +$90 Minggu Ini · TGIF!)',
                detail: 'Gold sudah melaju `+$90` sejak Senin hingga Kamis. Trader yang lupa Weekly Profile tetap nekat Buy breakout di Macro Jumat malam — padahal institusi justru menutup profit sehingga Gold retrace `-25%` rentang mingguan (**`-$22,50`**) menyapu SL!'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Kompas Mingguan Trader Pro',
            title: 'Senin Sabar · Selasa–Kamis Panen Utama · Jumat Waspada TGIF',
            body: 'Jika hari Senin pagi–siang chart Gold terasa lambat dan bolak-balik, **strategimu tidak rusak** — pasar memang sedang membentuk *Opening Range* mingguan. Simpan peluru terbaikmu untuk ekspansi bersih **Selasa sampai Kamis**, dan kecilkan ambisi atau amankan profit lebih cepat pada hari **Jumat**.'
          }
        }
      ],
      keyTakeaways: [
        '**Weekly Profile** memetakan ritme 5 hari Gold: **Classic Expansion** (Selasa/Rabu bentuk Low/High mingguan → Rabu–Kamis ekspansi), **Midweek Reversal** (balik arah di Rabu CPI/FOMC), dan **Friday TGIF** (retrace `20%–30%` rentang mingguan di hari Jumat).',
        '**IPDA Lookback (`20 / 40 / 60` hari perdagangan Daily)** menyaring ratusan garis lama menjadi hanya High/Low makro aktif dalam 1 bulan, 2 bulan, dan 1 kuartal terakhir.',
        'Jendela **ICT Macro 20 menit** (Bab 16) bekerja paling tajam saat dipadukan dengan hari ekspansi (Selasa–Kamis), bukan untuk mengejar pucuk ekstrem di Jumat malam TGIF.'
      ],
      bridgeNext: 'Bagaimana jika pada pekan ekspansi kuat itu Gold tiba-tiba menembus rekor tertinggi sepanjang masa (**All-Time High**), sehingga di jendela IPDA 20/40/60 hari sekali pun **tidak ada lagi Swing High di sebelah kiri** untuk dijadikan target TP? Di **Bab 35**, kita akan membuka rumus proyeksi target matematis paling presisi: **Standard Deviation Projections (`-1 / -2 / -2,5 / -4`) & Candle Range Theory (CRT)**.',
      practiceCta: {
        label: 'Cek Jadwal Berita Mingguan untuk Deteksi Midweek Reversal',
        description: 'Buka Kalender Ekonomi di Market Intelligence setiap Minggu malam untuk menandai hari rilis CPI/FOMC pemicu Midweek Reversal.',
        href: '../market-intel/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Weekly Profile & IPDA 20/40/60 Hari',
          paragraphs: [
            'Tiga profil mingguan utama Gold adalah Classic Expansion (Selasa/Rabu bentuk ekstrem mingguan), Midweek Reversal (balik arah di Rabu), dan Friday TGIF (retrace profit-taking 20–30%). IPDA Lookback memetakan High/Low makro aktif pada 20, 40, dan 60 hari perdagangan terakhir.'
          ]
        }
      ],
      mappingSteps: [
        'Setiap Minggu malam di Daily, tandai High & Low dari 20 hari perdagangan terakhir (IPDA #1), lalu 40 dan 60 hari jika harga mendekati batas 20 hari.',
        'Cek kalender berita besar hari Rabu/Kamis untuk mengantisipasi Classic Expansion vs Midweek Reversal.',
        'Fokuskan amunisi utama di Selasa–Kamis; pada hari Jumat setelah reli jauh, waspadai pullback TGIF 20%–30%.'
      ],
      decisionTree: [
        {
          condition: 'Hari Senin pagi chart lambat dan bolak-balik.',
          action: 'Normal (akumulasi Opening Range) — kecilkan target atau tunggu Selasa–Kamis.'
        },
        {
          condition: 'Jumat malam setelah Gold reli +$90 minggu ini, tergoda Buy breakout di pucuk.',
          action: 'STOP — wilayah rawan Friday TGIF retracement 20%–30% dari rentang mingguan.'
        }
      ],
      validRules: [
        'Gunakan IPDA Lookback 20/40/60 hari perdagangan di chart Daily agar peta makro tetap bersih.',
        'Selalu sesuaikan ekspektasi target dengan posisi hari pada Weekly Profile.'
      ],
      invalidRules: [
        'Mengejar breakout swing jauh di Jumat malam setelah tren 4 hari sudah ekstrem.',
        'Menggambar puluhan garis usang dari 3 tahun lalu di luar IPDA 20/40/60 hari.'
      ],
      xauScenario: {
        context: 'Rabu 21:50 WITA (Classic Bullish Expansion pasca Low of the Week Selasa) di M15 FVG 2.655,00.',
        steps: [
          'NY Macro menyapu micro-low 2.654,20 → CISD M5 → Buy 2.656,00, SL 2.653,00 ($3,00).',
          'TP1 2.662,00 (2,00R) dan TP2 High harian 2.668,00 (4,00R).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Buy Breakout di Pucuk Jumat TGIF',
        context: 'Jumat 22:00 WITA setelah Gold reli +$90 sepanjang Senin–Kamis; trader Buy breakout di puncak.',
        whyFailed: 'Institusi mengambil untung akhir pekan (TGIF) menarik harga retrace 25% (-$22,50) menyapu SL.'
      },
      goldenRules: [
        'Senin sabar, Selasa–Kamis panen utama, Jumat waspada TGIF.',
        'IPDA 20/40/60 hari perdagangan menjaga peta Daily tetap bersih dan relevan.'
      ],
      quiz: [
        {
          question: 'Dalam **Classic Bullish Expansion Weekly Profile**, pada hari apa biasanya **Low of the Week** (titik manipulasi ke bawah sebelum ekspansi naik) paling sering terbentuk?',
          options: [
            'Jumat sore menjelang pasar tutup',
            '**Selasa** (atau paling lambat **Rabu sesi London**)',
            'Sabtu pagi',
            'Selalu tepat di menit pertama hari Senin'
          ],
          answerIndex: 1,
          explanation: 'Pola klasik mingguan ICT: Senin konsolidasi, Selasa atau Rabu pagi membentuk manipulasi Low of the Week, lalu Rabu–Kamis ekspansi penuh.'
        },
        {
          question: 'Apa fenomena **TGIF (*Thank God It’s Friday*)** dalam Weekly Profile ICT?',
          options: [
            'Harga pasti selalu mencetak rekor baru tanpa koreksi di Jumat malam',
            '**Retrace balik `20%–30%` dari rentang mingguan** pada hari Jumat setelah tren Senin–Kamis melaju jauh, akibat aksi *profit-taking* institusi sebelum akhir pekan',
            'Aturan wajib membuka lot 3× lebih besar di hari Jumat',
            'Larangan melihat chart pada hari Selasa'
          ],
          answerIndex: 1,
          explanation: 'TGIF adalah pullback profit-taking institusi di hari Jumat menuju 20%–30% rentang mingguan setelah ekspansi satu arah panjang.'
        },
        {
          question: 'Berapa jendela **hari perdagangan** yang digunakan **IPDA Data Range Lookback** di chart Daily untuk memetakan likuiditas makro paling relevan?',
          options: [
            '`3`, `5`, dan `7` hari',
            '**`20`, `40`, dan `60` hari perdagangan terakhir** (≈ 1 bulan, 2 bulan, dan 1 kuartal)',
            '`100`, `200`, dan `500` hari',
            'Hanya `1` hari kemarin saja'
          ],
          answerIndex: 1,
          explanation: 'IPDA Lookback meninjau High/Low signifikan dalam 20, 40, dan 60 hari perdagangan terakhir di chart Daily.'
        },
        {
          question: 'Pada pekan yang memiliki jadwal rilis berita besar AS di hari Rabu (seperti **CPI** atau **FOMC**), template Weekly Profile mana yang paling sering terjadi jika Senin–Selasa harga terus naik menuju HTF PD Array?',
          options: [
            '**Midweek Reversal** — Senin–Selasa menguras likuiditas ke atas, lalu Rabu terjadi pembalikan arah besar menuju Kamis–Jumat',
            'Pasar otomatis libur sampai minggu depan',
            'Tidak mungkin ada perubahan arah sepanjang minggu',
            'Friday TGIF terjadi pada hari Senin pagi'
          ],
          answerIndex: 0,
          explanation: 'Berita besar pertengahan minggu (Rabu CPI/FOMC) sering menjadi katalis Midweek Reversal setelah likuiditas awal minggu disapu.'
        },
        {
          question: 'Jumat pukul `21:50 WITA` (NY Macro), Gold sudah reli naik **`+$90`** sejak Senin. Trader tergoda Buy breakout di pucuk minggu ini hanya karena sedang jam Macro. Keputusan paling bijak?',
          options: [
            'Tetap wajib Buy karena jam Macro tidak boleh dilewatkan',
            '**Tahan / Skip Buy breakout** — wilayah ekstrem hari Jumat rawan pullback **TGIF (`20%–30%` ≈ `$18–$27`)** akibat aksi ambil untung akhir pekan',
            'Naikkan lot menjadi 5% risiko agar cepat untung',
            'Hapus Stop Loss lalu biarkan sampai Senin depan'
          ],
          answerIndex: 1,
          explanation: 'Konteks Weekly Profile selalu mengalahkan sinyal timing sesaat; mengejar pucuk di hari Jumat TGIF adalah jebakan profit-taking klasik.'
        }
      ]
    },

    // =========================================================================
    // BAGIAN VI — BAB 35: STANDARD DEVIATION PROJECTIONS & CANDLE RANGE THEORY (CRT)
    // =========================================================================
    {
      id: 'stdev-crt-profiling',
      levelId: 5,
      number: 35,
      bookFormat: true,
      title: 'Standard Deviation Projections (-1 / -2 / -2,5 / -4) & Candle Range Theory (CRT)',
      subtitle: 'Cara menghitung target TP matematis paling presisi saat XAU/USD mencetak All-Time High tanpa swing di sebelah kiri, sekaligus membaca anatomi manipulasi candle H4 & Daily (OLHC/OHLC).',
      readMinutes: 10,
      diagramId: 'stdev-crt-profiling',
      diagramAfterSection: 1,
      summary: 'Rumus dan cara tarik Fibonacci Standard Deviation (-1, -2, -2,5, -4) dari Manipulation Leg saat Gold mencetak All-Time High, anatomi candle sehat OLHC/OHLC, pola 3-candle CRT H4/Daily, serta studi kasus terhitung di atas 2.710,00.',
      bookSections: [
        {
          number: '35.1',
          heading: 'Masalah All-Time High Gold: Cara Menentukan TP Saat Chart Sebelah Kiri Kosong Total',
          shortTitle: 'Target di All-Time High',
          paragraphs: [
            'XAU/USD terkenal sering mencetak rekor harga tertinggi baru (**All-Time High / ATH**). Di momen seperti itu, seluruh area di sebelah kiri chart benar-benar kosong: tidak ada PDH lama, tidak ada PWH, dan tidak ada IPDA 60-day High di atas harga! Akibatnya, trader biasa menjadi buta target — entah keluar terlalu cepat di `+$3` karena takut, atau menahan tanpa batas sampai seluruh profit `+$20` habis dimakan pembalikan.',
            'Dalam ICT, algoritma tidak pernah bergerak tanpa skala. Ia menggunakan **ukuran kaki manipulasi terakhir (*Manipulation Leg*)** sebagai "penggaris" untuk memproyeksikan jarak ekspansi berikutnya melalui **Fibonacci Standard Deviation**!'
          ]
        },
        {
          number: '35.2',
          heading: 'Peta Level Fibonacci Standard Deviation (-1 / -2 / -2,5 / -4) & Cara Tarik Mekanis',
          shortTitle: 'Level Std Dev & Cara Tarik',
          paragraphs: [
            'Atur tool *Fibonacci Retracement* di chart-mu pada angka: **`0`**, **`1`**, **`-1`**, **`-1,5`**, **`-2`**, **`-2,5`**, dan **`-4`**. Tarik Fib tepat pada **Manipulation Leg** (kaki sapuan terakhir sebelum terjadi MSS/CISD) sehingga angka negatif memanjang **ke arah target**:',
            '• **Untuk Target Naik (Bullish):** Letakkan `1,0` di **Low terendah sapuan** dan `0,0` di **Origin Swing High** sebelum turun menyapu → angka `-1`, `-2`, `-2,5`, `-4` otomatis memproyeksi ke **ATAS**.',
            '• **Untuk Target Turun (Bearish):** Letakkan `1,0` di **High tertinggi sapuan** dan `0,0` di **Origin Swing Low** sebelum naik menyapu → angka negatif otomatis memproyeksi ke **BAWAH**.'
          ],
          table: {
            caption: 'Makna Institusional Setiap Level Standard Deviation pada XAU/USD',
            headers: ['Level Std Dev', 'Rumus Jarak dari Origin (0,0)', 'Perilaku Umum XAU/USD', 'Tindakan Manajemen Trade'],
            rows: [
              ['**`-1,0` Std Dev**', '`Origin ± (1 × Leg)`', 'Area reaksi pertama; sering menjadi jeda **Re-Accumulation / Redistribution**', 'Ambil **Partial awal** atau evaluasi geser BEP (jika R:R sudah `≥ 1,5R`)'],
              ['**`-2,0` s.d. `-2,5` Std Dev**', '`Origin ± (2 s.d. 2,5 × Leg)`', '**SWEET SPOT / TERMINUS UTAMA!** `70%+` ekspansi harian berhenti atau mulai berbalik di sini', '**Tutup mayoritas posisi (`70%–100%`)** — padukan dengan angka bulat `.00`/`.50` Gold'],
              ['**`-4,0` Std Dev**', '`Origin ± (4 × Leg)`', 'Batas ekspansi ekstrem — hanya tercapai saat hari berita besar CPI/NFP atau tren parabolik', 'Target bonus khusus sisa runner kecil (`10%–20%`)']
            ]
          }
        },
        {
          number: '35.3',
          heading: 'Candle Range Theory (CRT) & Profil Candle H4/Daily (OLHC vs OHLC)',
          shortTitle: 'CRT & Profil OLHC/OHLC',
          paragraphs: [
            'Setiap satu batang candle **H4** atau **Daily** bukanlah balok warna yang bergerak lurus — ia adalah miniatur siklus AMD yang selalu membentuk urutan anatomi baku:',
            '• **Candle Bullish Sehat = `O – L – H – C`:** Buka di *Open* → turun dulu di bawah Open membentuk sumbu bawah (*Low* = manipulasi murah!) → melesat naik mencetak *High* → tutup (*Close*) dekat puncak. Artinya, saat bias Bullish, **entry Buy terbaik ada di bawah atau dekat harga Open H4/Daily**, bukan mengejar pucuk di atas Open!',
            '• **Candle Bearish Sehat = `O – H – L – C`:** Buka di *Open* → naik dulu di atas Open membentuk sumbu atas (*High* = manipulasi mahal!) → jatuh mencetak *Low* → tutup dekat dasar.',
            '• **Pola 3-Candle CRT (*Candle Range Theory*) di H4/Daily:** **Candle 1** membentuk kotak rentang (*Range*) → **Candle 2** menyapu High atau Low Candle 1 dengan sumbu lalu **WAJIB menutup body kembali di dalam rentang Candle 1** (*Purge / Turtle Soup*) → **Candle 3** meluncur cepat menyapu ujung seberang Candle 1! Jika body Candle 2 malah tutup jauh di luar rentang Candle 1, itu ekspansi lanjutan — **bukan CRT**.'
          ]
        },
        {
          number: '35.4',
          heading: 'Studi Kasus Lengkap XAU/USD All-Time High: Proyeksi Std Dev di Atas 2.710,00',
          shortTitle: 'Studi Kasus Std Dev ATH',
          paragraphs: [
            'Lihat betapa presisinya perhitungan **Standard Deviation** ketika XAU/USD menembus All-Time High tanpa satu pun level likuiditas di sebelah kiri:'
          ],
          exampleBox: {
            title: 'Proyeksi Target All-Time High XAU/USD (Manipulation Leg = $8,00)',
            rows: [
              {
                label: '1. Mengukur Manipulation Leg',
                detail: 'Sebelum MSS Bullish, Gold turun dari **Origin `2.708,00` (`0,0`)** menyapu SSL ke **Low Manipulasi `2.700,00` (`1,0`)** → ukuran leg = **`$8,00`**.'
              },
              {
                label: '2. Proyeksi Otomatis Standard Deviation ke Atas',
                detail: '• **`-1,0` Std Dev:** `2.708,00 + (1 × $8,00)` = **`2.716,00`**\n• **`-2,0` Std Dev:** `2.708,00 + (2 × $8,00)` = **`2.724,00`**\n• **`-2,5` Std Dev:** `2.708,00 + (2,5 × $8,00)` = **`2.728,00`** (*Sweet Spot Terminus!*)\n• **`-4,0` Std Dev:** `2.708,00 + (4 × $8,00)` = **`2.740,00`**'
              },
              {
                label: '3. Eksekusi & Panen Tepat di Puncak Harian',
                detail: 'Entry **Buy** di FVG **`2.706,50`**, **SL `2.699,00`** (buffer `$1,00` di bawah `2.700,00` → risiko **`$7,50`**). Partial awal di `-1,0` (`2.716,00` = `+$9,50` / `1,27R`), lalu tutup mayoritas di zona **`-2,0` (`2.724,00` = `+$17,50` / `2,33R`)** hingga **`-2,5` (`2.728,00` = `+$21,50` / `2,87R`)** — harga benar-benar mencetak puncak harian di `2.727,60` sebelum berbalik koreksi!'
              }
            ]
          },
          callout: {
            tone: 'warn',
            kicker: 'Aturan Disiplin Target',
            title: 'Jangan Memaksa Setiap Trade Harus Menyentuh -4,0 Std Dev!',
            body: 'Level **`-2,0` hingga `-2,5` Std Dev** adalah titik distribusi paling realistis di XAU/USD. Memaksa menahan 100% posisi ke `-4,0` sering membuat profit besar di `-2,5` lenyap saat algoritma berbalik arah.'
          }
        }
      ],
      keyTakeaways: [
        'Saat XAU/USD mencetak **All-Time High** tanpa swing di sebelah kiri, tarik **Fibonacci Standard Deviation** dari **Manipulation Leg** (`1,0` di ujung sweep, `0,0` di Origin) memproyeksi ke arah target.',
        'Zona **`-2,0` s.d. `-2,5` Std Dev** adalah **Sweet Spot Terminus** utama (`70%+` ekspansi harian selesai di sini); `-1,0` untuk evaluasi Partial/BEP; `-4,0` khusus bonus ekspansi ekstrem.',
        'Hukum anatomi candle H4/Daily: Bullish = **`O–L–H–C`** (beli di bawah/dekat Open saat sumbu manipulasi), Bearish = **`O–H–L–C`** (jual di atas/dekat Open); pola **CRT** wajib ditutup kembali di dalam rentang Candle 1.'
      ],
      bridgeNext: 'Seluruh **35 bab ilmu trading** dari nol mutlak hingga senjata ICT institusional lanjutan kini sudah berada penuh di kepalamu! Tinggal satu tantangan pamungkas untuk membuktikan bahwa kamu bukan lagi "pengikut indikator", melainkan **trader mandiri sejati**: mari tutup buku ini di **Bab 36 — Ujian Praktik Akhir (Capstone): Protokol Mapping Mandiri dari Chart Kosong**.',
      practiceCta: {
        label: 'Uji Proyeksi Std Dev & CRT di Candle Replay',
        description: 'Latih penarikan Standard Deviation (-1/-2/-2,5) pada hari ekspansi Gold dan amati anatomi OLHC/OHLC candle H4 di Replay Lab.',
        href: 'trading-practice/candle-replay.html'
      },
      conceptBlocks: [
        {
          heading: 'Standard Deviation Projections & CRT / OLHC',
          paragraphs: [
            'Tarik Fib Standard Deviation dari Manipulation Leg ke arah target: -1,0 (Partial/BEP), -2,0 s.d. -2,5 (Sweet Spot TP Utama), -4,0 (ekstrem). Candle Bullish sehat mengikuti OLHC (beli di bawah Open), Bearish OHLC, dan CRT valid jika Candle 2 menyapu ujung Candle 1 lalu menutup body kembali di dalam range.'
          ]
        }
      ],
      mappingSteps: [
        'Tentukan Manipulation Leg (kaki sapuan terakhir sebelum MSS/CISD).',
        'Tarik Fib (0, 1, -1, -2, -2.5, -4) sehingga angka negatif memanjang ke arah target.',
        'Tandai zona -2,0 s.d. -2,5 Std Dev sebagai TP Utama dan cek pertemuan angka bulat Gold.',
        'Di H4/Daily, tunggu harga membuat sumbu manipulasi di bawah Open (Bullish OLHC) atau atas Open (Bearish OHLC) sebelum turun ke M5.'
      ],
      decisionTree: [
        {
          condition: 'Harga bereaksi keras di -2,0/-2,5 Std Dev padahal TP dipasang di -4,0.',
          action: 'Amankan mayoritas profit (70%–80%) di zona -2,0 s.d. -2,5 Std Dev.'
        },
        {
          condition: 'Candle 2 H4 menyapu Low Candle 1 tetapi body ditutup jauh di BAWAH Low Candle 1.',
          action: 'BUKAN CRT Bullish — penutupan body di luar menandakan ekspansi turun lanjutan.'
        }
      ],
      validRules: [
        'Standard Deviation WAJIB ditarik dari Manipulation Leg sebelum MSS.',
        'CRT valid jika Candle 2 menyapu ujung Candle 1 lalu menutup body kembali di dalam rentang Candle 1.'
      ],
      invalidRules: [
        'Memaksa 100% posisi menunggu -4,0 Std Dev tanpa mengamankan profit di -2,0/-2,5.',
        'Mengejar Buy jauh di pucuk atas Open candle H4 Bullish.'
      ],
      xauScenario: {
        context: 'XAU/USD All-Time High di atas 2.710: Manipulation Leg $8 (Origin 2.708 → Low 2.700).',
        steps: [
          'Proyeksi: -1,0 = 2.716, -2,0 = 2.724, -2,5 = 2.728, -4,0 = 2.740.',
          'Buy FVG 2.706,50, SL 2.699,00 ($7,50); Partial di 2.716, tutup mayoritas di 2.724–2.728 (2,33R–2,87R).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Buta Target di All-Time High',
        context: 'Sudah profit +$20 tepat di -2,5 Std Dev (2.728), namun tidak menarik Std Dev dan berharap naik terus ke 2.760.',
        whyFailed: 'Algoritma menyelesaikan distribusi di -2,5 Std Dev lalu berbalik tajam menghapus seluruh profit.'
      },
      goldenRules: [
        'Saat Gold di All-Time High, -2,0 hingga -2,5 Std Dev dari Manipulation Leg adalah kompas target paling presisi.',
        'Bullish = O-L-H-C (beli di bawah Open); Bearish = O-H-L-C (jual di atas Open).'
      ],
      quiz: [
        {
          question: 'Dari bagian grafik mana proyeksi **Fibonacci Standard Deviation** ICT wajib ditarik untuk menghitung target TP?',
          options: [
            'Dari candle tertinggi tahun lalu ke terendah bulan ini',
            'Dari **Manipulation Leg** (kaki sapuan likuiditas terakhir tepat sebelum terjadi MSS/CISD balik arah)',
            'Dari lebar kotak Asia dikali 10',
            'Dari sembarang 2 candle berwarna sama di M1'
          ],
          answerIndex: 1,
          explanation: 'Algoritma memakai ukuran Manipulation Leg (stop hunt leg) sebagai skala proyeksi jarak ekspansi berikutnya.'
        },
        {
          question: 'Rentang Standard Deviation manakah yang menjadi **Sweet Spot / Terminus Utama** tempat `70%+` ekspansi harian XAU/USD berhenti atau berbalik?',
          options: [
            '`-0,25` hingga `-0,5`',
            '**`-2,0` hingga `-2,5` Standard Deviation**',
            '`-10,0` hingga `-12,0`',
            '`+0,5` saja'
          ],
          answerIndex: 1,
          explanation: 'Zona -2,0 hingga -2,5 Std Dev adalah zona distribusi utama tempat mayoritas ekspansi harian tuntas.'
        },
        {
          question: 'Dalam profil candle **`OLHC`** (Candle H4/Daily Bullish yang sehat), di area mana entry Buy memiliki probabilitas dan R:R terbaik?',
          options: [
            'Jauh di atas harga Open setelah candle sudah naik panjang',
            '**Di bawah atau dekat harga Open** (saat candle sedang membentuk sumbu bawah / Low manipulasi)',
            'Tepat 1 menit sebelum candle tutup di puncak',
            'Harga Open tidak berpengaruh sama sekali'
          ],
          answerIndex: 1,
          explanation: 'Pada candle Bullish (O-L-H-C), fase turun di bawah Open membentuk sumbu bawah adalah manipulasi beli murah sebelum ekspansi naik.'
        },
        {
          question: 'Apa syarat utama agar pola 3-candle **CRT (*Candle Range Theory*)** pada H4 valid sebagai sinyal pembalikan Bullish?',
          options: [
            '**Candle 2 menyapu Low Candle 1 dengan sumbu lalu menutup body kembali di dalam rentang Candle 1**',
            'Candle 2 menutup body merah panjang jauh di bawah Low Candle 1',
            'Candle 1 dan Candle 2 sama-sama Doji tanpa menyentuh ujung mana pun',
            'Candle 2 menembus High Candle 1 lalu langsung turun'
          ],
          answerIndex: 0,
          explanation: 'Purge/Sweep diikuti penutupan body kembali di dalam rentang Candle 1 membuktikan penolakan likuiditas bawah, memicu Candle 3 membidik High Candle 1.'
        },
        {
          question: 'XAU/USD mencetak All-Time High (tidak ada Swing High di kiri). Manipulation Leg turun berukuran **`$6,00`** (dari Origin `2.720,00` ke Low `2.714,00`) lalu berbalik MSS Bullish. Di mana proyeksi **`-2,0` Std Dev** berada?',
          options: [
            '`2.726,00`',
            '**`2.732,00`** (`2.720,00 + 2 × $6,00`)',
            '`2.714,00`',
            '`2.702,00`'
          ],
          answerIndex: 1,
          explanation: 'Ukuran leg = $6,00. Dari Origin 2.720,00 memproyeksi 2× ke atas: 2.720,00 + $12,00 = 2.732,00 (-2,5 Std Dev = 2.735,00).'
        }
      ]
    },

    // =========================================================================
    // BAGIAN VI — BAB 36 (CAPSTONE): PROTOKOL MAPPING MANDIRI DARI CHART KOSONG
    // =========================================================================
    {
      id: 'capstone-mapping-mandiri',
      levelId: 5,
      number: 36,
      bookFormat: true,
      title: 'Ujian Praktik Akhir (Capstone): Protokol Mapping Mandiri dari Chart Kosong',
      subtitle: 'Merangkai seluruh Bab 01 hingga Bab 35 ke dalam 1 rutinitas kerja Top-Down 10 menit di atas chart polos tanpa indikator — menghasilkan 1 Bias, 1 DOL, 1 POI, 1 Invalidasi, dan 1 Rencana Eksekusi.',
      readMinutes: 11,
      diagramId: 'capstone-blank-chart-mapping',
      diagramAfterSection: 1,
      summary: 'Mengatasi Blank Chart Freeze, protokol kerja baku 6 langkah Top-Down 10 menit dari layar chart kosong (Weekly → Daily → H1 → M15 → M5 → Lot ≤1%), aturan Chart Bersih maks 5 elemen + 4 saringan memilih 1 POI, serta simulasi lengkap XAU/USD Rabu London.',
      bookSections: [
        {
          number: '36.1',
          heading: 'Mengatasi "Blank Chart Freeze": Mengapa Urutan Kerja Mengalahkan Indikator?',
          shortTitle: 'Atasi Blank Chart Freeze',
          paragraphs: [
            'Saat semua kotak FVG, garis PDH, dan label BOS otomatis dimatikan dari layar, banyak trader mendadak membeku (**"Blank Chart Freeze"**). Mereka langsung melompat ke M5, menggambar 15 kotak sekaligus dari dua arah, lalu bingung sendiri apakah hari ini harus Buy atau Sell.',
            'Bab penutup ini **tidak menambah teori baru** — ia menyatukan seluruh ilmu dari **Bab 01 sampai Bab 35** ke dalam **1 Protokol Kerja 6 Langkah (10 Menit)** yang bisa kamu jalankan secara mandiri setiap pagi pada chart XAU/USD yang benar-benar polos. Kamu resmi lulus menjadi trader mandiri ketika indikator dimatikan dan kamu tetap tahu persis **ke mana harga menuju, di mana menunggu, dan kapan berhenti**!'
          ]
        },
        {
          number: '36.2',
          heading: 'Protokol Baku 6 Langkah Mapping Mandiri (10 Menit · Top-Down Total)',
          shortTitle: '6 Langkah Mapping 10 Menit',
          paragraphs: [
            'Jalankan enam langkah ini secara **berurutan dari atas ke bawah** setiap pagi sebelum sesi London (`±13:30 WITA`) atau sebelum NY AM (`±19:00 WITA`) — jangan pernah membalik urutannya dari M5 ke Daily!'
          ],
          table: {
            caption: 'Rutinitas Kerja 10 Menit Mapping Mandiri dari Chart Kosong (Zero-Indicator)',
            headers: ['Langkah & Durasi', 'Timeframe / Modul', 'Tugas Mekanis Wajib', 'Output Konkret (Tertulis)'],
            rows: [
              [
                '**1. Berita & Weekly** (`1 menit`)',
                'Kalender Ekonomi & Weekly',
                'Cek berita Red Folder AS (CPI/NFP/FOMC → tandai **News Lock** Bab 17) & cek posisi hari pada **Weekly Profile** (Bab 34)',
                'Jam larangan News Lock + konteks Senin / Selasa–Kamis / Jumat TGIF'
              ],
              [
                '**2. Peta Daily & IPDA** (`2 menit`)',
                'Daily (`D1`)',
                'Tandai **PDH/PDL**, **PWH/PWL**, **NWOG/NDOG**, & **IPDA 20 Hari**. Tentukan Origin kemarin → magnet **DOL** segar hari ini',
                '**1 Kalimat Bias** + **1 Target DOL** + **1 Garis Invalidasi**'
              ],
              [
                '**3. Peta H1 & MMXM** (`2 menit`)',
                'H1',
                'Tarik **Dealing Range H1** (`0%–50%–100%`), pastikan **Sisi Kurva MMXM**, lalu tandai maks **1–2 POI terkuat** di Discount/Premium',
                'Zona kerja sah (`<50%` untuk Buy, `>50%` untuk Sell)'
              ],
              [
                '**4. Peta M15 & Umpan** (`2 menit`)',
                'M15',
                'Tandai **Asia High/Low**, `EQH/EQL`, dan **Inducement (IDM)** tepat di depan HTF POI pilihanmu (Bab 12)',
                'Peta kolam umpan yang **WAJIB disapu dulu** sebelum entry'
              ],
              [
                '**5. Trigger M5 di KZ** (`2 menit`)',
                'M5 (Killzone / Macro)',
                'Hanya tunggu di **London KZ / NY AM / Silver Bullet**. Tunggu **Sweep + (opsional SMT XAG/DXY) + CISD/MSS + 1 Model Utama** (Bab 25–27)',
                'Lampu hijau **5× YA** (atau tulis **"NO SETUP"**)'
              ],
              [
                '**6. Risiko & Target** (`1 menit`)',
                'Kalkulator Lot & Jurnal',
                'Hitung lot **≤ `0,5%–1%` risiko**, SL struktural + napas spread, TP1 internal (`≥1,5R–2R` Partial/BEP), TP2 DOL (atau `-2,0/-2,5` Std Dev di ATH)',
                'Order terpasang rapi + dicatat di **Jurnal Trading**'
              ]
            ]
          }
        },
        {
          number: '36.3',
          heading: 'Aturan "Chart Bersih" (Maks 5 Elemen) & 4 Saringan Memilih 1 POI Terbaik',
          shortTitle: 'Chart Bersih & 4 Saringan POI',
          paragraphs: [
            'Chart yang penuh 30 garis hanya melahirkan pikiran yang kacau. Setelah 10 menit mapping selesai, di layarmu maksimal hanya boleh ada **5 elemen bersih**: (1) `PDH/PDL` & `DOL`, (2) `Asia Range / IDM`, (3) `1–2 POI Utama`, (4) `1 Garis Invalidasi Bias`, dan (5) area pemicu `M5`.',
            '• **Bagaimana Jika Ada 3–4 FVG/OB Sekaligus?** Pangkas menjadi **1 POI Terbaik** lewat **4 Saringan Kilat**: (1) searah Bias & berada di Discount/Premium, (2) masih *Fresh*, (3) punya **Inducement / Asia Low-High tepat di depannya**, dan (4) punya konfluensi ganda (`OTE 62%–79%`, `Unicorn`, atau `BPR`). Hapus kotak sisanya!',
            '• **Bagaimana Jika Pagi Itu Chart Membingungkan (Inside Bar)?** Tulis dengan bangga: **"Bias NETRAL — Menunggu London Membuka Kartu."** Biarkan London menyapu Asia High/Low lebih dulu daripada menebak buta.',
            '• **Hukum Tertinggi:** Jika semua 5 langkah teknikal sudah sempurna tetapi **8 menit lagi rilis CPI/NFP**, **Protokol News Lock (`-15m/+30m`) selalu menang di atas segalanya!**'
          ]
        },
        {
          number: '36.4',
          heading: 'Simulasi Lengkap 10 Menit dari Chart Polos XAU/USD (Rabu 13:40 WITA)',
          shortTitle: 'Simulasi Capstone 10 Menit',
          paragraphs: [
            'Ikuti simulasi nyata dari chart polos tanpa satu pun indikator berikut ini — seluruh angka sudah dihitung eksak:'
          ],
          exampleBox: {
            title: 'Simulasi Mapping Mandiri 10 Menit — Rabu 13:40 WITA (EDT · Pra-London)',
            rows: [
              {
                label: 'Langkah 1–2 — Kalender & Daily (3 Menit)',
                detail: 'Tidak ada berita Red Folder AS hari ini; posisi hari = **Rabu Classic Bullish Expansion**. Kemarin Daily tutup bullish pasca-sweep PDL (`Origin = Sweep PDL`), sementara **PDH `2.674,00`** masih segar. **Narasi:** *"Bias BULLISH menuju DOL PDH `2.674,00`. Batal total jika H1 body close di bawah `2.650,00`."*'
              },
              {
                label: 'Langkah 3–4 — H1 Dealing Range & M15 Inducement (4 Menit)',
                detail: 'Dealing Range H1 di `2.648,00–2.668,00` (`50% EQ = 2.658,00`). Di zona **Discount** ada 1 POI terkuat (H1/M15 Bullish FVG + OTE) di **`2.654,00–2.656,50`**, dan tepat di atasnya ada **Asia Low (Inducement)** di **`2.657,00`**.'
              },
              {
                label: 'Langkah 5–6 — Trigger London Macro `14:35 WITA` & Risiko Eksak (3 Menit)',
                detail: 'Pukul `14:35 WITA` (London Macro `02:33–03:00 NY`), harga turun menyapu Asia Low `2.657,00` → masuk POI `2.655,20` (plus **Bullish SMT** di XAG/USD) → M5 cetak **CISD + BISI `2.656,00–2.657,50`**. Eksekusi **Buy `2.656,50`**, **SL `2.653,00`** (risiko **`$3,50`** = `0,75%` modal). **TP1** internal high **`2.663,50`** (**`+$7,00` / `2,00R`** → Partial + BEP) dan **TP2 DOL PDH `2.674,00`** (**`+$17,50` / `5,00R`**)!'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Selamat Lulus · 36 dari 36 Bab Tuntas!',
            title: 'Kamu Resmi Menuntaskan Seluruh Buku Panduan ICT XAU/USD Amy FX Academy!',
            body: 'Dari mengenal arti 1 pip di **Bab 01–06**, memetakan struktur & likuiditas (**Bab 07–12**), kompas arah & waktu WITA (**Bab 13–17**), zona PD Array (**Bab 18–24**), model eksekusi & manajemen trade (**Bab 25–30**), hingga senjata institusional lanjutan & mapping mandiri (**Bab 31–36**) — sekarang tugasmu hanya satu: **jalankan Protokol 100 Sample dengan 1 Model Utama secara disiplin di Cockpit Mapping, Replay Lab, dan Jurnal Trading!**'
          }
        }
      ],
      keyTakeaways: [
        'Urutan mutlak **Top-Down 10 Menit** dari chart kosong: **Berita/Weekly → Daily (`PDH/PDL`, `Origin → DOL`, `Invalidasi`) → H1 (`Dealing Range` & `1–2 POI`) → M15 (`Asia Range & IDM`) → M5 (`Sweep + CISD/MSS` di Killzone) → Risiko `≤ 1%`**.',
        'Chart profesional cukup memuat **maksimal 5 elemen bersih** — 1 Bias, 1 DOL, 1–2 POI terkuat hasil 4 saringan, 1 Garis Invalidasi tertulis, dan 1 Model Entry.',
        '**Bias NETRAL** dan **Protokol News Lock (`-15m/+30m`)** adalah bagian sah dan wajib dari disiplin trader mandiri.'
      ],
      bridgeNext: 'Selamat menuntaskan seluruh **36 Bab Buku Panduan Trading Interaktif Amy FX Academy**! Langkah terbaik setelah lulus Uji Paham Bab 36: buka **Cockpit Mapping** untuk membandingkan peta mandirimu dengan mesin live, tuntaskan **Latihan 100 Kasus ICT**, kumpulkan **50 Sample di Candle Replay**, dan audit statistikmu di **Jurnal Trading**.',
      practiceCta: {
        label: 'Bandingkan Mapping Mandirimu di Cockpit Mapping',
        description: 'Uji hasil peta mandiri dari chart kosongmu melawan pembacaan struktur, POI, dan verifikasi live di Cockpit Mapping Amy FX Pro.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Protokol 6 Langkah Mapping Mandiri (Zero-Indicator)',
          paragraphs: [
            'Rangkuman seluruh Bab 01–35 dalam 6 langkah Top-Down 10 menit dari chart kosong: Berita/Weekly → Daily (Origin/DOL/Invalidasi) → H1 (Dealing Range & 1–2 POI) → M15 (Asia Range & IDM) → M5 (Sweep + CISD/MSS di Killzone) → Lot ≤1% & TP1/TP2.'
          ]
        }
      ],
      mappingSteps: [
        'Bersihkan chart XAU/USD dari semua indikator lalu cek Berita & Weekly Profile.',
        'Di Daily, tandai PDH/PDL, PWH/PWL, NWOG & tulis 1 Narasi Bias + DOL + 1 Garis Invalidasi.',
        'Di H1, tarik Dealing Range dan pangkas POI menjadi maksimal 1–2 zona terbaik di Discount/Premium.',
        'Di M15, tandai Asia Range & Inducement di depan POI pilihan.',
        'Di M5 saat Killzone, tunggu Sweep + CISD/MSS sesuai 1 Model Utama lalu kunci risiko ≤1%.'
      ],
      decisionTree: [
        {
          condition: 'Daily & H1 sedang inside bar di tengah range tanpa arah jelas.',
          action: 'Tulis Bias NETRAL — tunggu sesi London menyapu Asia High/Low untuk membuka arah.'
        },
        {
          condition: 'Semua 5 langkah cocok tetapi 8 menit lagi rilis CPI/NFP.',
          action: 'Protokol News Lock (-15m/+30m) selalu menang di atas semua teknikal — tahan entry.'
        }
      ],
      validRules: [
        'Chart mapping harian maksimal memuat 5 elemen bersih (DOL, Asia/IDM, 1–2 POI, Invalidasi, Trigger M5).',
        'Selalu bergerak Top-Down (Daily → H1 → M15 → M5) dengan 1 Garis Invalidasi tertulis.'
      ],
      invalidRules: [
        'Bottom-Up mapping (langsung buka M5 di jam sepi tanpa cek Daily/H1).',
        'Memaksa 1 bias seharian meski garis Invalidasi H1 sudah ditembus body candle.'
      ],
      xauScenario: {
        context: 'Rabu 13:40 WITA (Chart Polos): Daily Origin Sweep PDL → DOL PDH 2.674,00; H1 Discount POI 2.654–2.656,50 + Asia Low IDM 2.657,00.',
        steps: [
          'London Macro 14:35 WITA: sweep Asia Low 2.657 → POI 2.655,20 (+ SMT XAG) → M5 CISD + BISI.',
          'Buy 2.656,50, SL 2.653,00 ($3,50), TP1 2.663,50 (+$7,00 / 2,00R), TP2 PDH 2.674,00 (+$17,50 / 5,00R).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Bottom-Up Mapping dari M5',
        context: 'Trader langsung membuka M5 pukul 13:50 WITA tanpa melihat Daily/H1 lalu Sell mengejar micro-break tepat ke arah Asia Low 2.657.',
        whyFailed: 'Menjual tepat di titik Inducement / Discount H1 yang menjadi area beli institusi menuju PDH 2.674.'
      },
      goldenRules: [
        'Chart bersih melahirkan pikiran jernih: 1 Bias, 1 DOL, 1–2 POI, 1 Invalidasi, 1 Model Entry.',
        'Lulus mandiri berarti indikator boleh mati, namun petamu tetap 100% objektif.'
      ],
      quiz: [
        {
          question: 'Urutan kerja **Top-Down Mapping Mandiri** yang benar dari layar chart kosong adalah...',
          options: [
            '`M1 → M5 → M15` → baru cek Daily setelah terkena SL',
            '**Berita/Weekly Profile → Daily (`PDH/PDL`, `Origin → DOL`, `Invalidasi`) → H1 (`Dealing Range` & `POI`) → M15 (`Asia Range & IDM`) → M5 (`Sweep + CISD/MSS` di Killzone)**',
            'Pasang 6 indikator oscillator dulu lalu baru gambar FVG',
            'Langsung tarik 15 kotak FVG di M5 lalu pilih yang paling dekat harga sekarang'
          ],
          answerIndex: 1,
          explanation: 'Top-Down Mapping selalu dimulai dari konteks makro & likuiditas besar sebelum turun mencari presisi pemicu di M15 dan M5.'
        },
        {
          question: 'Pukul `08:30 WITA` saat melakukan mapping Daily & H1, chart sedang *inside bar* di tengah range tanpa arah dominan. Keputusan paling profesional adalah...',
          options: [
            'Menebak salah satu arah secara acak agar tetap punya trade pagi ini',
            'Menetapkan **Bias NETRAL** dan menunggu sesi London menyapu Asia High/Low terlebih dahulu untuk membuka arah hari ini',
            'Memperbesar lot supaya profit cepat meski arah tidak jelas',
            'Membuka Buy dan Sell bersamaan di M5'
          ],
          answerIndex: 1,
          explanation: 'Bias Netral adalah bagian sah dari SOP profesional — mencegah overtrading saat struktur belum membuka arah.'
        },
        {
          question: 'Kamu menemukan 3 Bullish FVG berbeda di H1/M15 dalam satu kenaikan. Saringan mana yang paling tepat untuk memilih **1 POI Utama**?',
          options: [
            'Pilih FVG yang paling tinggi di zona `90%` Premium',
            'Pilih FVG yang **masih Fresh, di zona Discount (`<50%`), punya Inducement/Asia Low tepat di depannya, dan memiliki konfluensi** (`OTE` / `Unicorn` / `BPR`)',
            'Pasang Buy Limit serentak di ketiga FVG sekaligus',
            'Pilih FVG yang sudah disentuh 4 kali sebelumnya'
          ],
          answerIndex: 1,
          explanation: 'POI probabilitas tertinggi berada di lokasi murah (Discount untuk Buy), segar, dilindungi Inducement di depannya, dan punya konfluensi kuat.'
        },
        {
          question: 'Mengapa setiap peta mapping pagi WAJIB menyertakan **1 Garis Invalidasi Bias** secara tertulis?',
          options: [
            'Agar chart terlihat ramai dan penuh warna',
            'Untuk mencegah *Narrative Bias* (keras kepala melawan pasar) — begitu H1 menutup body menembus garis tersebut, skenario lama langsung dibatalkan',
            'Sebagai tempat menggandakan lot (*martingale*) jika tersentuh',
            'Tidak wajib, hanya opsional untuk pemula'
          ],
          answerIndex: 1,
          explanation: 'Garis Invalidasi membuat analisismu 100% objektif — kamu tahu persis kapan asumsimu salah sebelum emosi mengambil alih.'
        },
        {
          question: 'Seluruh 5 langkah mapping (Bias, DOL, POI Discount, Inducement, Killzone) sudah sempurna, namun **8 menit lagi rilis data US CPI (High Impact)**. Langkah final yang benar adalah...',
          options: [
            'Segera entry sebelum berita agar mendapat harga awal',
            'Tahan entry sesuai **Protokol News Lock (`-15 menit` s.d. `+30 menit`)**, lalu evaluasi ulang setelah volatilitas dan spread kembali normal',
            'Lepas Stop Loss sementara lalu pasang lagi setelah rilis',
            'Pindah ke M1 untuk scalping detik rilis CPI'
          ],
          answerIndex: 1,
          explanation: 'Tidak ada setup teknikal yang kebal terhadap lonjakan spread & slippage detik rilis CPI/NFP/FOMC; disiplin News Lock selalu prioritas tertinggi.'
        }
      ]
    }
  ];

  return Object.freeze({ LEVELS, LESSONS });
});
