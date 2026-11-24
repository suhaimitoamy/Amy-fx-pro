/* Amy FX Academy — Level 3 & Level 4 (Pelajaran 11–20)
 * Kurikulum Zero to Scalper ICT XAU/USD (Standar Waktu WITA)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AmyAcademyPart2 = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const LEVELS = [
    {
      id: 3,
      code: 'Level 03',
      title: 'Mesin Pengiriman Harga ICT (PD Array)',
      tagline: 'Kuasai jejak algoritma sejati: Displacement, FVG + 50% CE, Order Block + Mean Threshold, CISD vs MSS, dan Premium/Discount.'
    },
    {
      id: 4,
      code: 'Level 04',
      title: '4 Model Entry Scalper A+',
      tagline: 'Ubah teori jadi eksekusi presisi dengan 4 playbook utama: Sweep-FVG, Order Block Sniper, Inversion FVG, dan Turtle Soup.'
    }
  ];

  const LESSONS = [
    // ═══════════════════════════════════════════════════════════════
    // BAGIAN IV — MESIN ZONA ENTRY ICT (PD ARRAYS): BAB 18, 19, 21, 23, 24
    // (Bab 20 berada di bawah dalam file ini; Bab 22 ada di mastery-advanced.js)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'displacement-jejak-institusi',
      number: 18,
      levelId: 3,
      title: 'Displacement: Mengenali Jejak Dorongan Institusi yang Sah',
      readMinutes: 9,
      diagramId: 'displacement-signature',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Tanpa Displacement, semua FVG, Order Block, dan MSS hanyalah garis lemah yang mudah jebol. Pelajari tanda tangan dorongan modal besar dan bedanya dengan gerakan merayap ritel.',
      bookSections: [
        {
          number: '18.1',
          heading: 'Mengapa Tanpa Displacement Semua Zona ICT Mudah Jebol?',
          shortTitle: 'Kenapa Displacement Wajib',
          paragraphs: [
            'Selamat datang di **Bagian IV: Mesin Zona Entry ICT (PD Arrays)**. Di Bagian II dan III kamu sudah menguasai struktur, peta likuiditas, target DOL, Daily Bias, siklus AMD, hingga jam emas Killzone WITA. Sekarang kita masuk ke mesin utamanya: **titik harga persis di mana bank dan institusi menaruh pesanan mereka**.',
            'Bayangkan kamu berjalan di pantai yang pasirnya basah. Kalau seekor kucing lewat, jejaknya tipis dan langsung hilang tersapu ombak kecil. Tetapi kalau seekor **gajah** berlari lewat sana, jejak kakinya dalam, tegas, dan jelas terlihat arah larinya. Di chart XAU/USD, jejak kaki gajah itulah yang disebut **Displacement**.',
            '**Displacement** adalah lonjakan harga yang **cepat, agresif, dan tegas ke satu arah**, dibentuk oleh satu hingga tiga batang candlestick berbadan tebal dengan sedikit perlawanan, yang **memecahkan level kunci** dan **meninggalkan celah ketidakseimbangan (Fair Value Gap)**. Tanpa Displacement, sebuah penembusan atau pantulan hanyalah gerakan ragu-ragu yang sangat rawan berbalik menghantam Stop Loss-mu.'
          ]
        },
        {
          number: '18.2',
          heading: 'Tiga Pilar Visual Displacement Asli vs Gerakan Merayap Ritel',
          shortTitle: '3 Pilar Displacement Asli',
          paragraphs: [
            'Banyak trader pemula menandai setiap candle hijau yang agak panjang sebagai Displacement. Supaya tidak ada lagi tebak-tebakan, gunakan **3 syarat visual objektif** berikut untuk membedakan dorongan institusi dari gerakan merayap ritel:'
          ],
          table: {
            caption: 'Perbandingan Visual: Displacement Sah vs Gerakan Merayap Ritel',
            headers: ['Pilar Evaluasi', 'Displacement Institusi (VALID)', 'Gerakan Merayap Ritel (SKIP)', 'Makna di Balik Layar'],
            rows: [
              ['Ukuran & Proporsi Body', 'Body tebal dominan (`≥ 65%` total tinggi candle), `1,5×–2×` lebih besar dari candle konsolidasi sebelumnya', 'Deretan 5–8 candle kecil saling bertumpuk dengan banyak sumbu (wick) atas-bawah', 'Institusi menyuntikkan volume besar sekali hentak, bukan mencicil ragu-ragu'],
              ['Celah Harga (FVG)', 'WAJIB meninggalkan celah kosong (**Fair Value Gap**) di belakangnya', 'Tidak meninggalkan celah; setiap candle langsung ditutup rapat oleh candle sebelah', 'Harga melesat terlalu cepat sehingga pihak lawan tidak sempat mengisi pesanan'],
              ['Dampak Struktural', 'Langsung memecah Swing High/Low (BOS/MSS) atau Open rangkaian candle lawan (CISD)', 'Hanya bergerak bolak-balik di dalam rentang lama tanpa memecah apa pun', 'Menunjukkan niat nyata memindahkan harga menuju DOL'],
              ['Konteks Pemicu', 'Muncul tepat setelah **Sweep likuiditas** atau menyentuh **POI HTF** di jam Killzone', 'Muncul acak di tengah sesi sepi (Asia chop) tanpa alasan likuiditas', 'Bahan bakar sudah terambil sebelum mesin dinyalakan']
            ]
          }
        },
        {
          number: '18.3',
          heading: 'Kenapa Jangan Pernah Mengejar Ujung Candle Displacement?',
          shortTitle: 'Bahaya Kejar Ujung Candle',
          paragraphs: [
            'Kesalahan klasik paling mahal ketika trader baru paham Displacement adalah **panik mengejar (FOMO Market Order)** persis di ujung candle besar yang baru saja terbang `$7–$10`. Mereka berpikir: *"Wah, ini Displacement kuat! Kalau tidak klik sekarang nanti ketinggalan!"*',
            'Ingat hukum besi ICT: **Displacement memberi tahu ARAH dan NIAT, sedangkan Retracement (koreksi pulang ke FVG/OB) memberi HARGA TERBAIK.** Lihat sendiri perbedaan matematisnya di XAU/USD:'
          ],
          exampleBox: {
            title: 'Studi Kasus Angka XAU/USD: FOMO Kejar Pucuk vs Sabar Tunggu Pullback',
            rows: [
              {
                label: 'Situasi Chart (M5 Sesi London · 15:20 WITA)',
                detail: 'XAU/USD baru saja menyapu Asia Low di `2.642,00`. Muncul 2 candle bullish M5 tebal melesat dari `2.642,00` ke `2.649,00` (`+$7,00` dalam 10 menit), memecah Swing High `2.646,50` dan meninggalkan Bullish FVG di `2.644,00 – 2.646,50`. Target DOL di Asia High `2.656,00`.'
              },
              {
                label: 'Trader A (FOMO Kejar di Pucuk 2.649,00)',
                detail: 'Langsung Market Buy di `2.649,00`. SL struktural di bawah sweep `2.641,50` → jarak risiko **`$7,50`**. Jarak ke target `2.656,00` tinggal **`$7,00`** → R:R hancur menjadi **1 : 0,93** (rugi lebih besar dari potensi untung!).'
              },
              {
                label: 'Trader B (Sabar Buy Limit di FVG 2.645,50)',
                detail: 'Memasang Buy Limit di tengah FVG `2.645,50` dengan SL yang sama di `2.641,50` → jarak risiko hanya **`$4,00`**. Jarak ke target `2.656,00` menjadi **`+$10,50`** → R:R melonjak menjadi **1 : 2,62**!'
              }
            ]
          }
        },
        {
          number: '18.4',
          heading: 'Tiga Pengecualian: Kapan Candle Raksasa BUKAN Displacement untuk Dientry?',
          shortTitle: '3 Jebakan Candle Besar',
          paragraphs: [
            'Tidak semua candle raksasa di layar layak dianggap sinyal hijau. Ada **tiga pengecualian kritis** di XAU/USD yang wajib langsung kamu saring:',
            '1. **Candle Detik Rilis Berita Merah (CPI / NFP / FOMC):** Lonjakan `$15` dalam 1 menit saat berita bukan Displacement normal — itu kekosongan buku order (whipsaw). Patuhi **Protokol News Lock** dari Bab 17: tunggu minimal 15–30 menit hingga debu mereda.',
            '2. **Candle Tunggal di Tengah Konsolidasi Asia Tanpa Sweep:** Sesekali muncul satu candle agak besar di jam `10:30 WITA` yang tidak menyapu likuiditas mana pun lalu langsung mati langkah. Tanpa konteks sweep/POI dan Killzone, lewati saja.',
            '3. **Exhaustion Move (Candle Besar Tepat Menabrak Target DOL):** Jika harga sudah naik `$25` seharian lalu mencetak satu candle besar terakhir yang tepat menabrak atap `PDH/PWH` — itu bukan awal tren baru, melainkan **pengurasan bahan bakar terakhir** sebelum berbalik arah!'
          ],
          callout: {
            tone: 'warn',
            kicker: 'Hukum Besi Bagian IV',
            title: 'Tidak Ada Displacement = Tidak Ada FVG/OB Berkualitas = Tidak Ada Entry',
            body: 'Jadikan Displacement sebagai "gerbang masuk" seluruh Bagian IV. Mulai Bab 19 sampai Bab 24 nanti, setiap kali kamu menandai FVG, iFVG, Order Block, Breaker, atau MSS, tanyakan satu hal dulu: **apakah ia lahir dari Displacement yang bersih?**'
          }
        }
      ],
      keyTakeaways: [
        '**Displacement** adalah dorongan agresif 1–3 candle berbadan tebal (`≥ 65%` body) yang memecah level struktur dan wajib meninggalkan **Fair Value Gap (FVG)**.',
        'Gerakan merayap (banyak candle kecil bertumpuk tanpa FVG) menandakan pasar ragu-ragu — jangan dipakai sebagai dasar entry.',
        '**Jangan mengejar ujung candle Displacement:** tunggu koreksi pulang (*retracement*) ke FVG/OB agar jarak SL ringkas dan R:R tetap sehat (`≥ 1:2`).',
        'Bedakan Displacement asli dari lonjakan whipsaw berita merah USD dan dorongan kelelahan (*exhaustion*) di ujung target DOL.'
      ],
      bridgeNext: 'Sekarang kamu tahu bahwa syarat paling mencolok dari sebuah Displacement yang sah adalah celah kosong yang ditinggalkannya di belakang. Celah kosong tiga candle itulah senjata paling populer di seluruh dunia ICT. Mari kita bedah sampai ke akar-akarnya di **Bab 19: Fair Value Gap (BISI/SIBI), 50% Consequent Encroachment & Memilih Multi-FVG**.',
      practiceCta: {
        label: 'Amati Displacement Live di Chart Gold',
        description: 'Buka Chart Gold M5/M15 di Mapping Cockpit dan bedakan candle dorongan tebal yang mencetak FVG dari deretan candle merayap.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Displacement Sebagai Tanda Tangan Institusi',
          paragraphs: [
            'Displacement adalah lonjakan 1–3 candle berbadan dominan yang memecah struktur dan meninggalkan Fair Value Gap (FVG) pasca-sweep likuiditas.'
          ]
        }
      ],
      mappingSteps: [
        'Pastikan harga baru saja menyapu likuiditas (Asia/PDH/PDL) atau menyentuh POI HTF di dalam Killzone.',
        'Cari 1–3 candle berbadan dominan (≥65% body) yang menembus struktur terdekat dan mencetak celah FVG.',
        'Jangan kejar ujung candle; tandai FVG/OB yang lahir di belakang Displacement untuk rencana pullback.'
      ],
      decisionTree: [
        {
          condition: 'Harga menembus Swing High dengan 6 candle kecil saling tumpang tindih tanpa FVG.',
          action: 'SKIP — tidak ada Displacement sejati; penembusan merayap sangat rentan gagal.'
        },
        {
          condition: 'Muncul candle besar $15 tepat pada menit rilis US CPI 20:30 WITA.',
          action: 'Patuhi News Lock (-15m s.d. +30m); jangan langsung menganggap spike berita sebagai Displacement untuk dikejar.'
        }
      ],
      validRules: [
        'Body dominan ≥65% dan 1,5×–2× lebih besar dari candle konsolidasi sebelumnya.',
        'Meninggalkan Fair Value Gap (FVG) bersih dan memecahkan struktur (BOS/MSS/CISD).'
      ],
      invalidRules: [
        'Penembusan merayap tanpa FVG atau di tengah konsolidasi Asia tanpa sweep.',
        'Mengejar Market Order di ujung candle Displacement yang sudah melesat jauh.'
      ],
      xauScenario: {
        context: 'Sweep Asia Low 2.642,00 diikuti 2 candle M5 bullish tebal ke 2.649,00 mencetak FVG 2.644,00–2.646,50.',
        steps: [
          'Konfirmasi 3 pilar Displacement terpenuhi (body tebal, pecah swing 2.646,50, lahir FVG).',
          'Pasang Buy Limit di 2.645,50 dengan SL 2.641,50 ($4,00) menuju target 2.656,00 (R:R 1:2,62).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Kejar Pucuk Displacement',
        context: 'Trader FOMO Buy di 2.649,00 tepat di pucuk candle Displacement.',
        whyFailed: 'SL melebar menjadi $7,50 sementara target tinggal $7,00 (R:R < 1:1) dan langsung terseret floating minus saat harga melakukan pullback normal ke FVG.'
      },
      goldenRules: [
        'Tidak ada Displacement = Tidak ada FVG berkualitas = Tidak ada Entry.',
        'Displacement memberi arah; retracement memberi harga terbaik.'
      ],
      quiz: [
        {
          question: 'Manakah 3 pilar visual wajib yang membuktikan sebuah pergerakan memiliki **Displacement** institusi yang sah?',
          options: [
            'Deretan 6 candle doji kecil + banyak wick + di luar Killzone',
            'Candle berbadan dominan (`≥ 65%` body) + meninggalkan celah **Fair Value Gap (FVG)** + memecah level struktur (BOS/MSS/CISD)',
            'Satu candle warna hijau di sesi Asia meskipun tidak ada FVG',
            'Indikator RSI menyentuh angka 70'
          ],
          answerIndex: 1,
          explanation: 'Displacement asli selalu meninggalkan tiga jejak serentak: badan candle dominan, celah ketidakseimbangan (FVG), dan pematahan struktur.'
        },
        {
          question: 'Harga XAU/USD menembus Swing High M5 dengan 7 candle kecil merayap yang saling bertumpuk tanpa meninggalkan FVG. Apa keputusan scalper ICT?',
          options: [
            'Langsung Market Buy karena sudah tembus',
            'Melewati setup (*Skip*) karena gerakan merayap tanpa Displacement menunjukkan lemahnya komitmen institusi dan rawan berbalik',
            'Menambah ukuran lot 2 kali lipat',
            'Menghapus Stop Loss agar tidak tersentuh'
          ],
          answerIndex: 1,
          explanation: 'Tanpa Displacement dan FVG, penembusan merayap adalah ciri dorongan ritel lemah yang mudah gagal.'
        },
        {
          question: 'Setelah menyapu Asia Low `2.642,00`, XAU/USD melesat dengan Displacement ke `2.649,00` (FVG di `2.644,00–2.646,50`, target Asia High `2.656,00`). Mengapa kita menunggu pullback ke FVG alih-alih mengejar Market Buy di `2.649,00`?',
          options: [
            'Karena MT5 melarang tombol Market Buy di sesi London',
            'Karena mengejar di pucuk memperlebar jarak SL menjadi `$7,50` dan merusak R:R (< 1:1), sedangkan menunggu pullback ke FVG menekan risiko menjadi `$4,00` dengan R:R > 1:2,5',
            'Karena harga tidak pernah bergerak naik lagi setelah Displacement',
            'Karena FVG hanya berlaku di hari Jumat'
          ],
          answerIndex: 1,
          explanation: 'Displacement memberi tahu arah niat institusi, sementara retracement ke FVG/OB memberikan titik entry berisiko sempit dengan R:R jauh lebih sehat.'
        },
        {
          question: 'Manakah candle besar berikut yang **TIDAK** boleh langsung diperlakukan sebagai sinyal Displacement entry normal?',
          options: [
            'Dorongan M5 tebal pasca-sweep Asia Low di sesi London yang mencetak MSS + FVG',
            'Lonjakan `$15` yang muncul tepat pada menit rilis berita merah **US CPI / NFP** (whipsaw berita) atau dorongan akhir yang tepat menabrak target `PDH/PWH`',
            'Dorongan M15 bersih setelah harga menyentuh H1 Order Block di NY AM Killzone',
            'Dorongan 2 candle tebal pasca-sweep PDL pada jendela Silver Bullet'
          ],
          answerIndex: 1,
          explanation: 'Lonjakan detik rilis berita merah USD berada dalam zona News Lock (rawan whipsaw/slippage), dan dorongan di ujung target DOL sering berupa exhaustion move.'
        }
      ]
    },
    {
      id: 'fvg-bisi-sibi-ce-50',
      number: 19,
      levelId: 3,
      title: 'Fair Value Gap (BISI/SIBI), 50% Consequent Encroachment & Memilih Multi-FVG',
      readMinutes: 11,
      diagramId: 'fvg-ce-anatomy',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Bedah tuntas anatomi 3-candle BISI & SIBI, alat ukur presisi 50% Consequent Encroachment (CE), beda Breakaway vs Measuring Gap, serta aturan memilih 1 FVG terbaik saat muncul 2–3 FVG sekaligus.',
      bookSections: [
        {
          number: '19.1',
          heading: 'Apa Itu Fair Value Gap (FVG)? Anatomi 3 Candle BISI & SIBI',
          shortTitle: 'Anatomi BISI & SIBI',
          paragraphs: [
            'Bayangkan sebuah kereta ekspres melaju terlalu kencang sehingga melewati sebuah stasiun tanpa sempat berhenti menaikkan penumpang yang sudah mengantre. Biasanya, jika masih banyak pesanan tertinggal di stasiun itu, kereta akan mundur sejenak untuk menjemput mereka sebelum melesat lagi. Di chart Gold, "stasiun yang terlewat karena kecepatan Displacement" itulah **Fair Value Gap (FVG)**.',
            'Secara mekanis, Fair Value Gap selalu diukur dari **3 batang candlestick berurutan** (`Candle 1`, `Candle 2` sebagai candle Displacement tengah, dan `Candle 3`):',
            '• **Bullish FVG — resmi disebut BISI** (*Buyside Imbalance, Sellside Inefficiency*): Terbentuk saat dorongan naik kencang. Celah kosong diukur dari **High (ujung ekor atas) Candle 1** hingga **Low (ujung ekor bawah) Candle 3**. Karena hanya ada pesanan beli agresif tanpa penyeimbang jual, area ini menjadi magnet pantulan naik saat harga koreksi turun.',
            '• **Bearish FVG — resmi disebut SIBI** (*Sellside Imbalance, Buyside Inefficiency*): Terbentuk saat bantingan turun kencang. Celah kosong diukur dari **Low (ujung ekor bawah) Candle 1** hingga **High (ujung ekor atas) Candle 3**. Area ini menjadi atap pantulan turun saat harga koreksi naik.'
          ]
        },
        {
          number: '19.2',
          heading: 'Garis Keramat 50% Consequent Encroachment (CE): Mengukur Sehat vs Bocor',
          shortTitle: 'Garis 50% CE FVG',
          paragraphs: [
            'Tidak semua sentuhan ke kotak FVG berakhir dengan pantulan. Bagaimana cara tahu secara objektif apakah FVG sedang **dihormati** institusi atau justru mulai **bocor**? ICT menggunakan satu garis penggaris mutlak: **Consequent Encroachment (CE)** — yaitu **titik tengah persis 50%** dari tinggi kotak FVG.',
            '**Rumus Eksak CE:** `CE = (Batas Atas FVG + Batas Bawah FVG) ÷ 2`. Misalnya sebuah Bullish FVG (BISI) memiliki batas bawah `2.644,00` (High C1) dan batas atas `2.648,00` (Low C3), maka garis **50% CE berada tepat di `2.646,00`**.',
            '**Aturan Membaca Reaksi CE:** Pada FVG yang sehat dan berprobabilitas tinggi, **ekor (wick)** candle boleh menusuk masuk hingga menyentuh atau sedikit melewati garis 50% CE, tetapi **Body Close candle tidak boleh ditutup tembus jauh melewati CE** (apalagi ditutup tembus keluar sisi belakang kotak FVG). Jika Body Close sudah jebol penuh keluar kotak FVG, fungsi FVG asalnya resmi **gagal** — dan siap berubah peran menjadi *Inversion FVG* yang akan kita pelajari di Bab 20!'
          ]
        },
        {
          number: '19.3',
          heading: '3 Karakter Gap & Aturan Memilih Saat Muncul Multi-FVG dalam 1 Kaki Dorongan',
          shortTitle: 'Breakaway vs Multi-FVG',
          paragraphs: [
            'Kebingungan terbesar kedua trader ICT saat mempraktikkan FVG di XAU/USD adalah: *"Lho, dalam satu gerakan naik tajam barusan, ternyata terbentuk TIGA kotak FVG bertumpuk (atas, tengah, bawah)! Aku harus pasang Buy Limit di yang mana?!"*',
            'Untuk menjawabnya tanpa menebak, pahami dulu **3 jenis peran FVG** sepanjang sebuah perjalanan harga, lalu pakai aturan penyaringan Multi-FVG berikut:'
          ],
          table: {
            caption: '3 Jenis Peran FVG & Prioritas Memilih Saat Muncul Multi-FVG',
            headers: ['Jenis / Posisi FVG', 'Lokasi di Kaki Dorongan', 'Perilaku Harga di XAU/USD', 'Cara Menyikapi (Aksi)'],
            rows: [
              ['Breakaway Gap', 'FVG pertama yang langsung melompat keluar dari area konsolidasi/sweep awal', 'Sering **tidak diisi penuh** (hanya disentuh tepi atasnya atau ditinggal langsung terbang)', 'Jangan memaksa menunggu pengisian 100% di bawah jika momentum sangat kencang; pantau reaksi di tepi depan'],
              ['Measuring Gap (Mid-Leg)', 'FVG yang berada tepat di sekitar **pertengahan (40%–60%)** perjalanan menuju DOL', 'Bekerja sebagai titik tengah proyeksi jarak; sering dihormati rapi di tepi atau 50% CE', 'Pilihan kuat jika masih berada di sisi **Discount** (Buy) / **Premium** (Sell) yang benar'],
              ['Discount / Origin FVG (Multi-FVG)', 'FVG paling dalam yang berada di bawah 50% (**Discount** untuk Buy) atau atas 50% (**Premium** untuk Sell) dekat OB/OTE', 'Memberikan harga paling murah/mahal dengan jarak SL terpendek dan R:R tertinggi', '**Prioritas #1** saat ada 2–3 FVG! FVG paling dangkal di area salah (mis. FVG Buy di 75% Premium) sering jadi umpan **Inducement**'],
              ['Exhaustion Gap', 'FVG yang baru muncul di menit terakhir saat harga hampir menyentuh target DOL (`PDH/PDL`)', 'Sangat sering langsung ditembus balik (*gagal*) karena bahan bakar tren sudah habis', '**AUTO-SKIP!** Jangan pernah beli/jual di FVG yang sudah mepet target akhir']
            ]
          }
        },
        {
          number: '19.4',
          heading: 'Studi Kasus Nyata XAU/USD: Memilih 1 dari 2 Bullish FVG Bertumpuk',
          shortTitle: 'Studi Kasus Multi-FVG',
          paragraphs: [
            'Mari kita lihat bagaimana aturan Multi-FVG menyelamatkanmu dari Stop Loss konyol pada satu kaki dorongan naik XAU/USD di sesi London:'
          ],
          exampleBox: {
            title: 'Memilih FVG #1 (Dangkal) vs FVG #2 (Discount) di XAU/USD M5',
            rows: [
              {
                label: 'Peta Dorongan',
                detail: 'Pasca-sweep Asia Low `2.640,00`, harga melonjak mencetak MSS ke `2.652,00` (rentang `$12,00`, titik 50% Equilibrium = `2.646,00`). Terbentuk **2 Bullish FVG**: **FVG #1 (Atas)** di `2.648,50 – 2.650,00` (berada di area **Premium 75%**!) dan **FVG #2 (Bawah)** di `2.643,00 – 2.645,00` (berada di area **Discount 33%**, tepat di atas OB!).'
              },
              {
                label: 'Kenapa FVG #1 (Atas) Berbahaya?',
                detail: 'Karena posisinya masih terlalu mahal (di atas Equilibrium `2.646,00`). Pemula yang tidak sabar memasang Buy Limit di `2.649,00` justru menjadi **Inducement** — harga langsung menembus FVG #1 untuk menjemput FVG #2 yang lebih murah.'
              },
              {
                label: 'Eksekusi Presisi di FVG #2 (Discount)',
                detail: 'Kita memilih **FVG #2 (`2.643,00 – 2.645,00`)** dengan garis **50% CE = `2.644,00`**. Pasang Buy Limit di `2.644,50` (sedikit di atas CE), SL di bawah sweep `2.639,20` (risiko `$5,30`), target Asia High `2.656,00` (`+$11,50` → **R:R 1 : 2,17**).'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Aturan 1 Sentuhan (Fresh FVG)',
            title: 'Utamakan FVG yang Masih Fresh (Belum Pernah Disentuh)',
            body: 'Di Chart Gold Mapping Cockpit Amy FX Pro, kamu akan melihat label `FRESH`, `1×`, hingga `2× CE` pada kotak FVG. Setiap kali FVG diuji ulang, stok order institusi di dalamnya semakin menipis. Probabilitas tertinggi selalu ada pada **sentuhan pertama (Fresh)**.'
          }
        }
      ],
      keyTakeaways: [
        '**BISI (Bullish FVG)** = celah antara `High Candle 1` dan `Low Candle 3`; **SIBI (Bearish FVG)** = celah antara `Low Candle 1` dan `High Candle 3`.',
        '**Consequent Encroachment (CE)** adalah titik tengah `50%` kotak FVG: sumbu (*wick*) boleh menusuk CE, tetapi **Body Close** harus tetap menghormatinya.',
        'Saat muncul **Multi-FVG** dalam satu kaki dorongan, abaikan FVG dangkal di zona mahal (sering jadi Inducement) dan utamakan FVG **Fresh** yang berada di sisi **Discount (Buy) / Premium (Sell)**.',
        'Hindari **Exhaustion Gap** yang terbentuk tepat di depan target DOL akhir — ruang profitnya sudah habis.'
      ],
      bridgeNext: 'Tadi di Bagian 19.2 kita sempat menyinggung satu kejadian penting: *bagaimana jika sebuah FVG ternyata tidak dihormati, malah dihancurkan penuh oleh Body Close candle lawan?* Bagi trader awam, itu sinyal kekacauan. Bagi scalper Gold modern, itu justru salah satu senjata entry tercepat di dunia ICT. Mari kita pelajari di **Bab 20: Inversion Fair Value Gap (iFVG): Saat FVG Gagal Berubah Jadi Peluang**.',
      practiceCta: {
        label: 'Latih Deteksi FVG & 50% CE di Backtest',
        description: 'Uji matamu membedakan BISI/SIBI valid, 50% CE, dan jebakan FVG mahal di 100 Studi Kasus ICT.',
        href: 'trading-practice/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Anatomi BISI, SIBI & 50% Consequent Encroachment',
          paragraphs: [
            'Bullish FVG (BISI) diukur dari High C1 ke Low C3; Bearish FVG (SIBI) dari Low C1 ke High C3, dengan garis 50% CE sebagai batas validitas reaksi body candle.'
          ]
        }
      ],
      mappingSteps: [
        'Tandai celah 3-candle hasil Displacement: High C1–Low C3 (BISI) atau Low C1–High C3 (SIBI).',
        'Tarik garis tengah 50% Consequent Encroachment (CE) tepat di tengah kotak FVG.',
        'Jika muncul Multi-FVG, pilih FVG Fresh yang berada di sisi Discount (Buy) atau Premium (Sell) dan jauh dari target DOL akhir.'
      ],
      decisionTree: [
        {
          condition: 'Ada 2 Bullish FVG dalam 1 kaki naik: FVG atas di 75% Premium, FVG bawah di 33% Discount.',
          action: 'Prioritaskan FVG bawah (Discount); FVG atas di area Premium sering menjadi Inducement.'
        },
        {
          condition: 'Body candle M5 ditutup penuh menembus sisi belakang kotak FVG.',
          action: 'FVG asal resmi gagal/bocor; jangan memaksakan entry searah FVG lama — pantau potensi flip menjadi iFVG.'
        }
      ],
      validRules: [
        'FVG masih Fresh, lahir dari Displacement pasca-sweep, dan berada di sisi Discount/Premium yang benar.',
        'Body candle menghormati batas kotak atau garis 50% CE saat pullback.'
      ],
      invalidRules: [
        'FVG mikro di tengah sideways tanpa Displacement atau sudah berkali-kali ditembus.',
        'Exhaustion FVG yang muncul terlalu dekat dengan target akhir DOL.'
      ],
      xauScenario: {
        context: 'Setelah MSS Bullish M5 dari 2.640 ke 2.652, terbentuk FVG #1 di 2.648,50–2.650,00 (Premium) dan FVG #2 di 2.643,00–2.645,00 (Discount).',
        steps: [
          'Abaikan FVG #1 yang terlalu mahal di area Premium.',
          'Tandai 50% CE FVG #2 di 2.644,00 dan pasang Buy Limit di 2.644,50 dengan SL 2.639,20 menuju 2.656,00 (R:R 1:2,17).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Entry di FVG Dangkal Area Premium',
        context: 'Trader memasang Buy Limit di FVG #1 (2.649,00) padahal di bawahnya ada FVG #2 di Discount.',
        whyFailed: 'FVG #1 bertindak sebagai Inducement; harga turun menjebol FVG #1 untuk menjemput likuiditas dan FVG #2 sebelum benar-benar naik.'
      },
      goldenRules: [
        'Hanya ambil FVG yang lahir dari Sweep + Displacement di lokasi Discount/Premium yang tepat.',
        'Hormati garis 50% CE: ekor boleh menusuk, body harus menghormati.'
      ],
      quiz: [
        {
          question: 'Pada pola 3 candle **Bullish FVG (BISI)**, celah kosong diukur dari titik mana ke titik mana?',
          options: [
            'Dari Low Candle 1 ke High Candle 3',
            'Dari **High (ujung ekor atas) Candle 1** ke **Low (ujung ekor bawah) Candle 3**',
            'Dari Open Candle 2 ke Close Candle 2 saja',
            'Dari High hari kemarin ke Low hari ini'
          ],
          answerIndex: 1,
          explanation: 'Pada BISI (dorongan naik), ruang ketidakseimbangan berada di antara puncak (High) Candle 1 dan dasar (Low) Candle 3.'
        },
        {
          question: 'Sebuah Bullish FVG XAU/USD memiliki batas bawah `2.644,00` dan batas atas `2.648,00`. Di harga berapa garis **50% Consequent Encroachment (CE)** berada, dan bagaimana syarat sehatnya?',
          options: [
            'Di `2.646,00` — ekor (wick) boleh menusuk CE, tetapi **Body Close** harus tetap menghormatinya dan tidak tutup jebol keluar kotak',
            'Di `2.642,00` — body wajib menutup di bawah `2.640,00`',
            'Di `2.648,00` — ekor tidak boleh menyentuh kotak sama sekali',
            'Di `2.650,00` — semakin sering ditembus bolak-balik semakin bagus'
          ],
          answerIndex: 0,
          explanation: 'CE = `(2.644 + 2.648) ÷ 2 = 2.646,00`. FVG yang kuat mempertahankan penutupan body tetap menghormati garis 50% CE.'
        },
        {
          question: 'Dalam satu kaki dorongan naik XAU/USD dari `2.640` ke `2.652`, muncul 2 Bullish FVG: FVG #1 di `2.648,50–2.650,00` (Premium 75%) dan FVG #2 di `2.643,00–2.645,00` (Discount 33%). Mana prioritas utama trader ICT?',
          options: [
            'FVG #1 karena paling dekat dengan harga sekarang',
            'Membuka Buy di keduanya dengan lot penuh sekaligus',
            '**FVG #2 (Discount 33%)** — karena FVG #1 di area mahal sering berfungsi sebagai Inducement sebelum harga turun menjemput FVG Discount',
            'Menunggu sampai kedua FVG ditembus turun lalu baru Buy'
          ],
          answerIndex: 2,
          explanation: 'Saat Multi-FVG muncul, prioritaskan FVG Fresh di area Discount (untuk Buy) atau Premium (untuk Sell) agar R:R tajam dan terhindar dari jebakan Inducement.'
        },
        {
          question: 'Apa bahaya terbesar dari **Exhaustion Gap (FVG Kelelahan)** yang baru terbentuk ketika harga tinggal `$2` lagi menyentuh target akhir DOL (`PDH/PWH`)?',
          options: [
            'Spread otomatis berubah menjadi nol',
            'Bahan bakar tren sudah hampir habis di depan target akhir sehingga FVG tersebut sangat rawan langsung ditembus balik',
            'FVG tersebut akan bertahan selama 3 minggu',
            'Broker tidak mengizinkan pemasangan Take Profit'
          ],
          answerIndex: 1,
          explanation: 'Begitu harga mendekati atau menyentuh target DOL akhir, institusi mulai merealisasikan profit dan membalik arah — bukan melanjutkan tren baru.'
        }
      ]
    },
    {
      id: 'order-block-valid-mean-threshold',
      number: 21,
      levelId: 3,
      title: 'Order Block (OB) Bermutu Tinggi vs Trap OB & 50% Mean Threshold',
      readMinutes: 10,
      diagramId: 'order-block-mt',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Berhenti menandai setiap candle terakhir sebagai Order Block. Pelajari definisi rangkaian candle OB yang sah, 4 syarat High-Probability OB vs Trap OB, serta beda 50% Mean Threshold (OB) vs 50% CE (FVG).',
      bookSections: [
        {
          number: '21.1',
          heading: 'Apa Itu Order Block (OB) Sebenarnya? (Bukan Sembarang Candle Terakhir)',
          shortTitle: 'Definisi Asli Order Block',
          paragraphs: [
            'Istilah **Order Block (OB)** mungkin adalah istilah paling populer — sekaligus **paling sering disalahpahami** — di seluruh komunitas trading. Banyak pemula berpikir bahwa setiap candle merah sebelum candle hijau adalah Bullish Order Block. Hasilnya? Chart penuh puluhan kotak warna-warni dan 8 dari 10 kotak itu jebol begitu saja!',
            'Mari kita luruskan dari akarnya. Institusi bermodal raksasa tidak bisa langsung membeli jutaan dolar emas dalam 1 klik karena tidak ada cukup penjual di satu harga. Caranya? Mereka **mendorong harga turun sebentar** untuk memicu kepanikan jual ritel (dan menyapu Stop Loss), lalu **membeli seluruh barang yang dijual ritel tersebut** sebelum menerbangkan harga ke atas!',
            'Jejak candle tempat institusi "menampung barang" itulah **Order Block**:',
            '• **Bullish Order Block (+OB):** **Satu candle turun** (*down-close*) atau **rangkaian 2–3 candle turun berurutan** tepat sebelum dorongan **Displacement naik** yang agresif.',
            '• **Bearish Order Block (-OB):** **Satu candle naik** (*up-close*) atau **rangkaian 2–3 candle naik berurutan** tepat sebelum dorongan **Displacement turun** yang agresif.',
            '*Catatan Penting:* Jika sebelum dorongan naik ada 2 atau 3 candle merah berurutan tanpa diselingi candle hijau, **keseluruhan rangkaian candle merah itu dihitung sebagai SATU blok Order Block yang sama**, dengan batas atas diambil dari **Open candle merah pertama**.'
          ]
        },
        {
          number: '21.2',
          heading: 'Membedakan High-Probability OB vs Trap OB (Umpan Ritel)',
          shortTitle: 'High-Prob OB vs Trap OB',
          paragraphs: [
            'Supaya kamu tidak lagi menandai puluhan OB palsu, saring setiap calon Order Block memakai **4 syarat wajib High-Probability OB** berikut. Jika syarat ini absen, hampir pasti itu hanyalah **Trap OB (Inducement)** yang sengaja dibuat untuk ditembus!'
          ],
          table: {
            caption: 'Filter Ketat: High-Probability Order Block vs Trap OB (Umpan)',
            headers: ['Kriteria Uji', 'High-Probability OB (LAYAK)', 'Trap OB / Inducement (SKIP)', 'Alasan Institusional'],
            rows: [
              ['1. Pemicu Likuiditas', 'Candle OB tersebut **baru saja menyapu likuiditas** (Asia/PDL/Swing) atau terbentuk di dalam **POI HTF**', 'Terbentuk di ruang kosong tengah range tanpa menyapu apa pun', 'Tanpa sweep, bank belum mengumpulkan bahan bakar order lawan'],
              ['2. Jejak Kecepatan', 'Langsung diikuti **Displacement tegas yang mencetak FVG** tepat keluar dari OB', 'Keluar pelan tanpa FVG, atau candle langsung bertumpuk merayap', 'FVG adalah bukti sah adanya suntikan modal besar di OB itu'],
              ['3. Dampak Struktur', 'Dorongannya **mematahkan struktur (BOS / MSS)** atau menembus level kunci', 'Gagal mematahkan swing mana pun', 'Membuktikan OB itu punya tenaga mengubah arah pasar'],
              ['4. Kesegaran & Ukuran', 'Masih **Fresh** (belum disentuh) dan lebarnya wajar (`≤ $6–$8` di M5/M15 Gold)', 'Sudah disentuh berkali-kali atau terlalu raksasa (`> $12` di M5)', 'OB raksasa memaksa SL terlalu lebar dan merusak R:R']
            ]
          }
        },
        {
          number: '21.3',
          heading: 'Garis 50% Mean Threshold (MT) & Bedanya dengan 50% CE FVG',
          shortTitle: '50% Mean Threshold vs CE',
          paragraphs: [
            'Jangan pernah tertukar antara dua istilah "titik 50%" paling penting di buku ICT: di Bab 19 kita belajar **50% Consequent Encroachment (CE)** yang diukur dari **kotak FVG** (antar-wick). Khusus untuk **Order Block**, titik tengah 50% memiliki nama dan cara ukur berbeda: **Mean Threshold (MT)**.',
            '**Cara Mengukur Mean Threshold (MT):** Ukur titik tengah **50% HANYA dari BADAN** (*Open ke Close*) candle Order Block (bukan dari ujung wick terjauh!). **Rumus:** `MT = (Open OB + Close OB) ÷ 2`.',
            'Contoh angka nyata: sebuah candle Bullish OB M15 memiliki `Open = 2.646,00`, `Close = 2.642,00`, dan ekor bawah (`Low`) di `2.640,00`. Maka garis **50% Mean Threshold** berada tepat di **`(2.646,00 + 2.642,00) ÷ 2 = 2.644,00`**.',
            '**Aturan Validitas MT:** Saat harga kembali menguji Bullish OB, **sumbu boleh menyentuh Mean Threshold (`2.644,00`)**, bahkan masuk tipis di bawahnya, tetapi **Body Close candle wajib bertahan di atas Mean Threshold**. Jika Body Close jebol menembus jauh di bawah 50% MT hingga keluar bawah OB, OB tersebut resmi gagal — dan siap berubah peran menjadi **Breaker Block** di Bab 22!'
          ]
        },
        {
          number: '21.4',
          heading: 'Dua Gaya Entry di Order Block: Open OB (Konservatif) vs 50% MT (Sniper)',
          shortTitle: 'Open OB vs 50% MT Entry',
          paragraphs: [
            'Ketika sebuah High-Probability OB sudah terverifikasi (Sweep + Displacement/FVG + MSS), kamu memiliki **dua pilihan titik antre Limit Order** yang masing-masing punya kelebihan terukur:'
          ],
          exampleBox: {
            title: 'Perbandingan Entry XAU/USD: Bullish OB (Open 2.646,00 · Close 2.642,00 · Wick Low 2.640,00)',
            rows: [
              {
                label: 'Opsi 1 — Entry di Open OB (`2.646,00` · Gaya Konservatif)',
                detail: 'Pasang Buy Limit tepat di batas atas badan OB (`2.646,00`). SL struktural di bawah wick sweep (`2.639,20` → risiko **`$6,80`**). Target Asia High `2.660,00` (`+$14,00` → **R:R 1 : 2,06**). **Kelebihan:** Peluang terjemput sangat tinggi (jarang ketinggalan bus).'
              },
              {
                label: 'Opsi 2 — Entry di 50% Mean Threshold (`2.644,00` · Gaya Sniper)',
                detail: 'Pasang Buy Limit lebih dalam di garis MT (`2.644,00`). SL sama di `2.639,20` → risiko mengecil jadi **`$4,80`**. Target sama di `2.660,00` (`+$16,00` → **R:R melonjak ke 1 : 3,33**!). **Kompromi:** Kadang harga langsung terbang dari Open OB sehingga order tidak terjemput.'
              },
              {
                label: 'Rekomendasi Praktis',
                detail: 'Jika lebar badan OB masih ringkas (`≤ $3,50`), pilih **Open OB** agar tidak sering ketinggalan. Jika badan OB agak lebar (`$4–$6`), pilih **50% Mean Threshold** agar SL tetap ramping dan R:R minimal `1:2` terjaga.'
              }
            ]
          }
        }
      ],
      keyTakeaways: [
        '**Bullish OB** adalah 1 atau rangkaian candle turun terakhir sebelum Displacement naik; **Bearish OB** adalah 1 atau rangkaian candle naik terakhir sebelum Displacement turun.',
        'Order Block bermutu tinggi WAJIB memenuhi 3 bukti: **menyapu likuiditas / POI HTF**, **melahirkan Displacement + FVG**, dan **mematahkan struktur (BOS/MSS)**.',
        '**50% Mean Threshold (MT)** diukur dari **badan (Open–Close)** OB — berbeda dengan **50% CE** yang diukur dari kotak FVG.',
        'Gunakan **Open OB** untuk peluang terjemput lebih tinggi saat OB ringkas, atau **50% MT** untuk R:R lebih tajam saat OB agak lebar.'
      ],
      bridgeNext: 'Kita baru saja melihat bahwa sebuah Order Block yang jebol penuh oleh Displacement berlawanan artinya pihak institusi sebelumnya telah kalah atau mengubah posisi. Sama seperti FVG gagal yang berubah menjadi iFVG, **Order Block yang jebol pasca-sweep** pun berubah menjadi salah satu zona terkuat di seluruh ICT — dan saat bertumpuk dengan FVG melahirkan model legendaris. Mari kita bedah di **Bab 22: Breaker Block (BB), Mitigation Block & ICT Unicorn Model**.',
      practiceCta: {
        label: 'Pantau OB & 50% MT di Chart Gold',
        description: 'Nyalakan layer Order Block di Chart Gold Mapping Cockpit untuk melihat zona OB aktif, garis 50%, dan jejak sentuhannya secara langsung.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'High-Probability OB & 50% Mean Threshold',
          paragraphs: [
            'Order Block valid adalah candle/rangkaian candle berlawanan terakhir yang menyapu likuiditas dan langsung melahirkan Displacement + FVG, dengan 50% Mean Threshold pada badannya sebagai batas uji validitas.'
          ]
        }
      ],
      mappingSteps: [
        'Tandai candle atau rangkaian 2–3 candle berlawanan terakhir tepat di ujung Sweep likuiditas sebelum Displacement.',
        'Verifikasi ada celah FVG yang langsung lahir keluar dari OB dan memecah struktur.',
        'Tarik garis 50% Mean Threshold di tengah badan (Open–Close) OB dan tempatkan SL di luar ujung wick OB.'
      ],
      decisionTree: [
        {
          condition: 'Ada candle merah sebelum candle hijau, tetapi tidak menyapu likuiditas dan tidak mencetak FVG.',
          action: 'SKIP — itu Trap OB (rawan menjadi Inducement), bukan High-Probability Order Block.'
        },
        {
          condition: 'Badan OB terlalu lebar ($5–$6 di M5 Gold) sehingga entry di Open OB membuat R:R di bawah 1:2.',
          action: 'Gunakan titik 50% Mean Threshold (MT) sebagai batas entry atau tunggu konfirmasi M5 di dalam OB.'
        }
      ],
      validRules: [
        'OB menyapu likuiditas atau berada di POI HTF, diikuti Displacement + FVG, dan memecah struktur.',
        'Body candle menghormati batas Open OB atau garis 50% Mean Threshold saat diuji ulang.'
      ],
      invalidRules: [
        'Menandai sembarang candle terakhir di tengah konsolidasi tanpa Sweep dan tanpa FVG.',
        'Memakai OB yang sudah disentuh berulang kali atau lebarnya terlalu ekstrem.'
      ],
      xauScenario: {
        context: 'Bullish OB M15 XAU/USD pasca-sweep Asia Low: Open 2.646,00, Close 2.642,00, Wick Low 2.640,00 diikuti Displacement + FVG.',
        steps: [
          'Hitung 50% Mean Threshold = (2.646 + 2.642) ÷ 2 = 2.644,00.',
          'Entry Sniper di 2.644,00 dengan SL di 2.639,20 ($4,80) menuju target 2.660,00 (+$16,00, R:R 1:3,33).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Entry di Trap OB Tanpa Sweep & FVG',
        context: 'Trader menandai candle merah biasa di tengah tren tanpa sweep dan tanpa FVG.',
        whyFailed: 'OB tersebut berfungsi sebagai umpan Inducement bagi ritel; harga langsung menembusnya untuk menjemput likuiditas dan OB asli di bawahnya.'
      },
      goldenRules: [
        'Tanpa Sweep dan tanpa FVG setelahnya, sebuah candle bukanlah High-Probability Order Block.',
        'Bedakan dua titik 50%: CE untuk kotak FVG, Mean Threshold untuk badan Order Block.'
      ],
      quiz: [
        {
          question: 'Kombinasi syarat manakah yang membedakan **High-Probability Order Block** dari **Trap OB (umpan ritel)**?',
          options: [
            'Candle kecil di tengah sesi Asia tanpa FVG dan tanpa break struktur',
            '**Menyapu likuiditas / menyentuh POI HTF** + langsung diikuti **Displacement yang mencetak FVG** + **mematahkan struktur (BOS/MSS)**',
            'Sudah diuji harga sebanyak 4 kali di hari yang sama',
            'Memiliki tinggi badan lebih dari $15 di M5'
          ],
          answerIndex: 1,
          explanation: 'Tiga bukti institusional (Sweep + Displacement/FVG + Structural Break) menyaring sebagian besar Order Block palsu.'
        },
        {
          question: 'Sebuah candle Bullish Order Block M15 XAU/USD memiliki `Open = 2.650,00`, `Close = 2.646,00`, dan ujung ekor bawah (`Low`) = `2.643,00`. Di harga berapakah garis **50% Mean Threshold (MT)** berada?',
          options: [
            '`2.646,50` (tengah dari Open ke Wick Low)',
            '**`2.648,00`** — yaitu titik tengah `50%` dari **badan (Open ke Close)**: `(2.650 + 2.646) ÷ 2`',
            '`2.644,50` (tengah dari Close ke Wick Low)',
            '`2.652,00` (di atas Open)'
          ],
          answerIndex: 1,
          explanation: 'Mean Threshold diukur tepat di 50% badan (Open ke Close) candle Order Block, bukan termasuk ujung wick.'
        },
        {
          question: 'Jika tepat sebelum Displacement naik terdapat **3 candle merah berurutan** tanpa diselingi candle hijau, bagaimana cara menandai Bullish Order Block yang benar dalam ICT?',
          options: [
            'Hanya candle merah paling kecil yang dipakai',
            'Dianggap tidak ada Order Block sama sekali',
            'Keseluruhan **rangkaian 3 candle merah berurutan** itu dihitung sebagai **satu blok Order Block** dengan batas atas dari Open candle merah pertama',
            'Dibagi menjadi 3 transaksi terpisah secara acak'
          ],
          answerIndex: 2,
          explanation: 'Dalam ICT, rangkaian candle berlawanan berurutan sebelum Displacement diperlakukan sebagai satu kesatuan blok akumulasi institusi.'
        },
        {
          question: 'Apa konsekuensi paling langsung jika sebuah Bullish Order Block ditembus penuh oleh **Body Close** candle bearish jauh melewati 50% Mean Threshold dan sisi bawahnya?',
          options: [
            'Bullish OB menjadi dua kali lebih kuat untuk Buy',
            'Bullish OB tersebut **resmi gagal (Failed OB)** dan berpotensi berubah fungsi menjadi **Bearish Breaker Block**',
            'Otomatis mengaktifkan Take Profit',
            'Menandakan pasar libur akhir pekan'
          ],
          answerIndex: 1,
          explanation: 'Penutupan body yang menghancurkan OB menandakan arus order telah berbalik dan membuka skenario Breaker Block.'
        }
      ]
    },
    {
      id: 'cisd-vs-mss-sinyal-awal',
      number: 23,
      levelId: 3,
      title: 'CISD vs Market Structure Shift (MSS): Sinyal Balik Arah Paling Presisi',
      readMinutes: 10,
      diagramId: 'cisd-vs-mss',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Pahami dua pemicu pembalikan paling vital di ICT: CISD memberi sinyal dini perpindahan kontrol di level candle, sedangkan MSS memberi konfirmasi struktur penuh di level swing.',
      bookSections: [
        {
          number: '23.1',
          heading: 'Kenapa Menunggu Swing Struktur Jauh Sering Membuatmu Terlambat di Gold?',
          shortTitle: 'Kenapa Butuh CISD',
          paragraphs: [
            'Pernahkah kamu mengalami situasi menyebalkan ini di XAU/USD: harga turun tajam menyapu `PDL`, lalu kamu dengan sabar menunggu Swing High terakhir ditembus untuk konfirmasi **MSS**. Masalahnya, Swing High terakhir jaraknya **`$12` di atas dasar**! Begitu candle akhirnya menembus Swing High itu, harga sudah terbang jauh dan langsung menabrak target sebelum sempat pullback?',
            'Itulah alasan ICT memperkenalkan dua tingkatan sinyal balik arah yang saling melengkapi: **CISD** (*Change in State of Delivery*) sebagai **lampu peringatan dini di level candle**, dan **MSS** (*Market Structure Shift*) sebagai **lampu hijau penuh di level struktur swing**.'
          ]
        },
        {
          number: '23.2',
          heading: 'Change in State of Delivery (CISD): Cara Membaca Pembalikan di Level Candle',
          shortTitle: 'Cara Membaca CISD',
          paragraphs: [
            'Istilah *State of Delivery* artinya "mode pengiriman harga" yang sedang aktif — apakah algoritma sedang dalam mode **kirim turun** (deretan candle merah) atau mode **kirim naik** (deretan candle hijau). **CISD** terjadi tepat pada detik algoritma memindahkan sakelar kontrol dari satu sisi ke sisi lawannya, **bahkan sebelum Swing struktur utama tertembus**.',
            '**Aturan Mekanis 3 Langkah Membaca CISD (100% Objektif):**',
            '1. **Wajib Ada Pemicu Dulu:** Harga baru saja menyapu likuiditas penting (`BSL/SSL`, `PDH/PDL`, `Asia High/Low`) atau menyentuh **POI HTF**.',
            '2. **Tandai Garis Open Rangkaian Candle Lawan:** Untuk **Bullish CISD**, lihat rangkaian candle turun (*down-close*) terakhir yang mendorong harga ke dasar sweep → tarik garis horizontal tepat di **Harga Open candle merah pertama** pada rangkaian itu. (Untuk **Bearish CISD**, tarik garis di **Harga Open candle hijau pertama** dari rangkaian naik yang menyapu puncak).',
            '3. **Tunggu Body Close Melewati Garis Open:** Begitu satu candle lawan berhasil **menutup badannya (Body Close)** melewati garis Open tersebut — **CISD sah terkonfirmasi!** Kontrol pengiriman harga resmi berpindah.'
          ]
        },
        {
          number: '23.3',
          heading: 'Market Structure Shift (MSS) & Perbandingan Head-to-Head CISD vs MSS',
          shortTitle: 'CISD vs MSS',
          paragraphs: [
            'Sementara CISD membaca perpindahan kontrol di tingkat **rangkaian candle**, **Market Structure Shift (MSS)** menuntut bukti lebih berat di tingkat **struktur pasar**: harga harus menembus **Swing High/Low struktural** dengan **Displacement (body close tegas + FVG)** sehingga arah tren timeframe tersebut resmi berbalik.',
            'Agar tidak pernah bingung harus memakai yang mana, simpan tabel perbandingan berikut:'
          ],
          table: {
            caption: 'Perbandingan Langsung: CISD vs Market Structure Shift (MSS)',
            headers: ['Aspek', 'CISD (Level Candle)', 'MSS (Level Struktur Swing)', 'Kombinasi Grade A+'],
            rows: [
              ['Acuan yang Ditembus', '**Harga Open** rangkaian candle searah terakhir yang menyapu likuiditas', '**Swing High / Swing Low** struktural yang jelas (aturan 3-candle)', 'CISD terjadi dulu → segera diikuti MSS + FVG searah'],
              ['Syarat Konfirmasi', 'WAJIB **Body Close** (bukan wick) pasca-Sweep / POI HTF', 'WAJIB **Body Close + Displacement (FVG)** pasca-Sweep / POI HTF', 'Keduanya menolak tembusan wick-only'],
              ['Kecepatan & R:R', '**Lebih cepat** (masuk lebih dini dekat dasar/puncak → R:R lebih lebar)', 'Sedikit lebih lambat, tetapi struktur pasar sudah benar-benar patah', 'Menangkap kecepatan CISD dengan keamanan MSS'],
              ['Tingkat Keamanan', 'Sedang–Tinggi (rawan gagal jika dipakai di tengah range tanpa Sweep HTF)', '**Sangat Tinggi** — standar paling aman bagi pemula hingga menengah', 'Standar utama scalper Gold profesional']
            ]
          }
        },
        {
          number: '23.4',
          heading: 'Studi Kasus Berurutan XAU/USD M5: CISD Dini → Diikuti MSS Penuh',
          shortTitle: 'Studi Kasus CISD + MSS',
          paragraphs: [
            'Perhatikan bagaimana CISD dan MSS bekerja seperti dua tahap roket di chart M5 XAU/USD setelah harga menyapu `PDL`:'
          ],
          exampleBox: {
            title: 'Urutan Real-Time XAU/USD M5 Pasca-Sweep PDL 2.638,00',
            rows: [
              {
                label: 'Tahap 1 — Sweep & Titik Acuan',
                detail: 'XAU/USD turun menyapu `PDL 2.638,00` dengan rangkaian **2 candle merah berurutan** yang dimulai dari **`Open = 2.641,50`**. Sementara itu, Swing High struktural M5 terdekat berada lebih tinggi di **`2.645,00`**.'
              },
              {
                label: 'Tahap 2 — Bullish CISD Terkonfirmasi Dini',
                detail: 'Candle hijau M5 melesat dan menutup body penuh di **`2.642,80`** (menembus Open `2.641,50`). **Bullish CISD sah!** Trader berpengalaman sudah tahu sakelar kontrol berpindah ke pembeli dan mulai menandai Order Block di dasar `2.638–2.641,50`.'
              },
              {
                label: 'Tahap 3 — Bullish MSS + FVG Mengunci Konfirmasi',
                detail: 'Candle M5 berikutnya mendorong kuat dan menutup body di **`2.646,50`** (menembus Swing High `2.645,00` sambil meninggalkan FVG bersih di `2.642,00–2.644,50`). **MSS sah!** Baik pemula maupun pro kini punya peta Buy Limit super jelas dengan SL di bawah `2.637,40`.'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Panduan Level Jam Terbang',
            title: 'Masih Baru di ICT? Wajibkan MSS + FVG Dulu!',
            body: 'Jangan terburu-buru memakai CISD sendirian di setiap candle kecil. Selama 30–50 trade pertamamu, jadikan **Sweep + MSS + FVG** sebagai standar wajib. Setelah matamu terlatih membaca POI HTF, baru pakai CISD untuk masuk lebih cepat saat Swing terlalu jauh.'
          }
        }
      ],
      keyTakeaways: [
        '**CISD** (*Change in State of Delivery*) terjadi saat **Body Close** menembus **Harga Open** rangkaian candle searah terakhir yang menyapu likuiditas — memberi sinyal balik arah lebih dini.',
        '**MSS** (*Market Structure Shift*) terjadi saat **Body Close + Displacement (FVG)** mematahkan **Swing High/Low struktural** — memberi konfirmasi pembalikan paling kuat.',
        'Baik CISD maupun MSS **WAJIB terjadi setelah Sweep likuiditas atau sentuhan POI HTF**; di tengah konsolidasi tanpa konteks, keduanya hanyalah jebakan noise.',
        'Kombinasi terkuat (Grade A+) adalah **CISD muncul lebih dulu**, lalu segera dikonfirmasi oleh **MSS + FVG** searah.'
      ],
      bridgeNext: 'Kamu sekarang sudah memegang seluruh "bata bangunan" PD Array ICT: Displacement (Bab 18), FVG/CE (Bab 19), iFVG (Bab 20), Order Block/MT (Bab 21), Breaker/Mitigation/Unicorn (Bab 22), serta pemicu CISD/MSS (Bab 23). Tinggal satu pertanyaan penutup Bagian IV: **di area harga mana zona-zona ini boleh dieksekusi, dan jika muncul bersamaan di chart, mana yang harus diprioritaskan?** Semua terjawab di **Bab 24: Premium, Discount, Equilibrium (50%), OTE (62%–79%) & Hierarki PD Array**.',
      practiceCta: {
        label: 'Latih Bedakan CISD vs MSS di 100 Kasus',
        description: 'Buka Latihan 100 Kasus pilar Market Structure untuk melatih ketajaman membaca CISD dan MSS pada chart Gold.',
        href: 'trading-practice/index.html'
      },
      conceptBlocks: [
        {
          heading: 'CISD vs MSS',
          paragraphs: [
            'CISD membaca perpindahan kontrol di level Open rangkaian candle lawan terakhir, sedangkan MSS menuntut penembusan Swing struktural dengan Displacement + FVG.'
          ]
        }
      ],
      mappingSteps: [
        'Tunggu Sweep likuiditas (PDH/PDL/Asia) atau sentuhan POI HTF terlebih dahulu.',
        'Tandai garis Open rangkaian candle terakhir menuju ekstrem sweep (acuan CISD) dan Swing terdekat (acuan MSS).',
        'Tunggu Body Close sah menembus acuan tersebut sebelum menyiapkan rencana pullback ke FVG/OB.'
      ],
      decisionTree: [
        {
          condition: 'Ada candle hijau menelan 1 candle merah di tengah konsolidasi Asia tanpa Sweep atau POI HTF.',
          action: 'SKIP — bukan CISD valid; CISD wajib lahir dari Sweep likuiditas atau POI HTF.'
        },
        {
          condition: 'Masih membangun konsistensi 30 trade pertama dan melihat CISD tipis tanpa MSS.',
          action: 'Tunggu konfirmasi penuh MSS + Displacement + FVG agar risiko sinyal palsu jauh lebih rendah.'
        }
      ],
      validRules: [
        'CISD dan MSS keduanya mensyaratkan Body Close, bukan sekadar tusukan wick.',
        'Wajib didahului Sweep likuiditas atau sentuhan POI timeframe besar.'
      ],
      invalidRules: [
        'Menganggap setiap engulfing kecil di tengah range sebagai CISD.',
        'Masuk entry sebelum candle CISD/MSS selesai tutup (close).'
      ],
      xauScenario: {
        context: 'Sweep PDL 2.638,00 dengan 2 candle merah dimulai Open 2.641,50; Swing High di 2.645,00.',
        steps: [
          'Close M5 di 2.642,80 mengonfirmasi Bullish CISD lebih dini.',
          'Close M5 berikutnya di 2.646,50 + FVG mengonfirmasi Bullish MSS penuh.'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: CISD di Ruang Hampa',
        context: 'Trader memakai CISD M5 di tengah Dealing Range tanpa sweep dan melawan bias H1.',
        whyFailed: 'Tanpa bahan bakar likuiditas, pantulan kecil langsung habis dan tren H1 menelan SL.'
      },
      goldenRules: [
        'CISD = lampu peringatan dini di level candle; MSS = lampu hijau penuh di level struktur.',
        'Tanpa konteks Sweep atau POI HTF, CISD dan MSS hanyalah noise.'
      ],
      quiz: [
        {
          question: 'Secara mekanis, titik harga manakah yang harus ditembus oleh **Body Close** agar **Bullish CISD** sah terkonfirmasi setelah harga menyapu `PDL`?',
          options: [
            'Ujung ekor bawah candle paling rendah',
            '**Harga Open** dari candle turun (*down-close*) pertama pada rangkaian candle merah terakhir yang mendorong menyapu `PDL`',
            'Harga penutupan pekan lalu',
            'Titik tertinggi sesi Asia 3 hari yang lalu'
          ],
          answerIndex: 1,
          explanation: 'Bullish CISD sah ketika Body Close candle bullish berhasil ditutup di atas harga Open rangkaian candle bearish terakhir yang melakukan sweep.'
        },
        {
          question: 'Apa perbedaan kecepatan dan validasi utama antara **CISD** dan **MSS**?',
          options: [
            'MSS selalu muncul lebih dulu daripada CISD',
            '**CISD** muncul lebih cepat karena mengukur penutupan melewati Open rangkaian candle, sedangkan **MSS** lebih lambat tetapi memberi validasi struktur lebih kuat karena mematahkan Swing dengan Displacement + FVG',
            'CISD cukup pakai wick sedangkan MSS tidak perlu candle close',
            'Keduanya hanya berlaku di timeframe Bulanan'
          ],
          answerIndex: 1,
          explanation: 'CISD mendeteksi perubahan kontrol delivery di level candle lebih dini; MSS mengonfirmasi patah struktur di level swing.'
        },
        {
          question: 'Harga menyapu `PDL 2.638,00` dengan 2 candle merah (Open awal `2.641,50`), lalu candle hijau M5 sempat menyentuh `2.643,00` tetapi **ditutup (Close) di `2.640,80`**. Apakah Bullish CISD sudah valid?',
          options: [
            'Sudah valid karena wick-nya sempat naik ke `2.643,00`',
            '**Belum valid** — karena CISD mensyaratkan **Body Close** di atas `2.641,50`, bukan sekadar tusukan wick',
            'Sudah valid dan langsung pasang lot 2× lipat',
            'Otomatis berubah menjadi Bearish MSS'
          ],
          answerIndex: 1,
          explanation: 'Sama seperti BOS dan MSS, CISD mewajibkan penutupan badan (Body Close) melewati garis Open, bukan sekadar ekor.'
        },
        {
          question: 'Untuk trader yang sedang membangun konsistensi di 30–50 trade pertamanya, standar pemicu pembalikan mana yang paling aman digunakan?',
          options: [
            'Masuk sebelum candle selesai tutup',
            'Menjadikan **Sweep + MSS + Displacement + FVG** sebagai standar wajib sebelum menggunakan CISD agresif sendirian',
            'Menggunakan CISD di tengah konsolidasi Asia tanpa melihat HTF',
            'Mengabaikan struktur dan menebak puncak/dasar'
          ],
          answerIndex: 1,
          explanation: 'MSS disertai Displacement dan FVG pasca-sweep memberikan bukti visual paling jelas dan meminimalkan sinyal palsu.'
        }
      ]
    },
    {
      id: 'premium-discount-equilibrium',
      number: 24,
      levelId: 3,
      title: 'Premium, Discount, Equilibrium (50%), OTE (62%–79%) & Hierarki PD Array',
      readMinutes: 10,
      diagramId: 'premium-discount-ote',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Filter lokasi matematis yang menghentikan kebiasaan FOMO beli di pucuk: disiplin Discount (<50%) vs Premium (>50%), hitung presisi zona OTE (61,8%–78,6% · 70,5%), serta urutan Hierarki PD Array saat beberapa zona muncul bersamaan.',
      bookSections: [
        {
          number: '24.1',
          heading: 'Hukum Beli Murah & Jual Mahal: Premium, Discount & Equilibrium (50%)',
          shortTitle: 'Premium vs Discount',
          paragraphs: [
            'Di Bab 10 kamu sudah belajar menggambar kotak **Dealing Range** dari Swing Low ke Swing High pada satu gelombang impulsif yang jelas. Sekarang kita tambahkan **penggaris harga** di dalam Dealing Range tersebut agar kamu tidak pernah lagi melakukan dosa terbesar trader ritel: **membeli saat harga sudah terlanjur mahal, atau menjual saat harga sudah terlalu murah**.',
            'Tarik alat **Fibonacci Retracement** dari awal hingga ujung gelombang impulsif di H1 atau M15, lalu **hapus semua garis tidak penting** — sisakan hanya 4 angka bersih: **`0%`**, **`50%` (Equilibrium)**, **`61,8% / 70,5% / 78,6%` (Zona OTE)**, dan **`100%`**.',
            'Aturan lokasinya keras tanpa pengecualian:',
            '• **Mencari BUY?** Fokus HANYA pada PD Array (FVG, OB, Breaker, iFVG) yang berada di bawah garis 50% (**Zona Discount / Murah**).',
            '• **Mencari SELL?** Fokus HANYA pada PD Array yang berada di atas garis 50% (**Zona Premium / Mahal**).',
            '• **Di sekitar 50% Equilibrium (45%–55%)?** Harga berada di tengah-tengah (*No-Man\'s Land*) — R:R sempit, hindari entry sembarangan kecuali ada konfluensi HTF luar biasa.'
          ]
        },
        {
          number: '24.2',
          heading: 'Zona Optimal Trade Entry (OTE): 61,8% – 78,6% dengan Titik Manis 70,5%',
          shortTitle: 'Zona Emas OTE (62%–79%)',
          paragraphs: [
            'Di dalam zona Discount (atau Premium), terdapat satu "kantong emas" favorit algoritma ICT yang disebut **Optimal Trade Entry (OTE)** — yaitu rentang retracement mendalam antara **`61,8%` hingga `78,6%`**, dengan titik tengah manis tepat di **`70,5%`**.',
            'Mengapa OTE begitu efektif di XAU/USD? Karena pada saat harga sudah terkoreksi sedalam `62%–79%`, seluruh trader FOMO yang masuk di pucuk sudah terkena Stop Loss dan menyerah, sementara jarak ke puncak/dasar lama memberikan **R:R minimal `1:2` hingga `1:3`** tanpa perlu menebak harga harus menembus rekor baru!',
            '*Ingat aturan emasnya:* **OTE BUKAN tombol klik otomatis!** Menyentuh angka `70,5%` di ruang kosong tanpa ada FVG, Order Block, atau Breaker Block tidak berarti apa-apa. Kekuatan sejati lahir ketika **PD Array (FVG/OB/Unicorn) berhimpitan tepat di dalam kantong OTE `61,8%–78,6%`**.'
          ]
        },
        {
          number: '24.3',
          heading: 'Hierarki PD Array (PD Array Matrix): Mana yang Diprioritaskan Jika Muncul Bersamaan?',
          shortTitle: 'Hierarki PD Array',
          paragraphs: [
            'Sekarang kamu sudah mengenal seluruh PD Array di Bagian IV. Pertanyaan paling praktis saat menatap chart live XAU/USD adalah: *"Di dalam zona Discount ini ada Breaker Block, ada OB, dan ada FVG — mana yang paling kuat untuk dipilih?"*',
            'Gunakan **Hierarki PD Array** berikut — yang juga merupakan urutan prioritas persis yang bekerja di balik layar **Mesin Mapping Cockpit Amy FX Pro**:'
          ],
          table: {
            caption: 'Urutan Kekuatan PD Array (PD Array Matrix · Dari Terkuat ke Standar)',
            headers: ['Peringkat', 'Jenis PD Array', 'Alasan Kekuatan', 'Catatan Eksekusi XAU/USD'],
            rows: [
              ['#1 (S+)', '**ICT Unicorn (Breaker + FVG)**', 'Pertemuan ganda: bekas benteng gagal (mitigasi BEP) + celah ketidakseimbangan di 1 koordinat', 'Prioritas mutlak saat ada di Discount/Premium & searah DOL'],
              ['#2 (A+)', '**Breaker Block (BB)**', 'Terbentuk dari Sweep + jebol balik keras; pantulan jauh lebih agresif dari OB biasa', 'Perhatikan label `+BB` / `-BB` pada Chart Gold Mapping'],
              ['#3 (A+)', '**Inversion FVG (iFVG)**', 'Bukti langsung pihak lawan baru saja dihancurkan pasca-Sweep/POI HTF', 'Sangat presisi saat sesi NY AM bergerak cepat tanpa pullback dalam'],
              ['#4 (A)', '**High-Prob Order Block + FVG**', 'Jejak akumulasi institusi di pangkal dorongan + validasi kecepatan FVG', 'Gunakan Open OB (ringkas) atau 50% Mean Threshold (OB lebar)'],
              ['#5 (A-)', '**Fair Value Gap (FVG) Fresh**', 'Celah murni 3-candle; sangat sering muncul di Silver Bullet & Model 2022', 'Wajib di zona Discount/Premium yang benar + hormati 50% CE'],
              ['#6 (B+)', '**Mitigation Block (MB)**', 'Tanpa sweep di puncak sebelumnya; daya tolak lebih rendah dari Breaker', 'Hanya dipakai jika ada FVG menumpuk & searah penuh dengan Bias H1']
            ]
          }
        },
        {
          number: '24.4',
          heading: 'Studi Kasus Penutup Bagian IV: Menggabungkan Dealing Range + OTE + PD Array',
          shortTitle: 'Studi Kasus Lengkap OTE',
          paragraphs: [
            'Lihat bagaimana semua kepingan Bagian IV menyatu menjadi satu rencana eksekusi XAU/USD yang 100% terukur angkanya:'
          ],
          exampleBox: {
            title: 'Hitungan Presisi OTE + Bullish FVG di XAU/USD M15 (Gelombang $20)',
            rows: [
              {
                label: 'Gelombang Impulsif (Dealing Range)',
                detail: 'XAU/USD M15 melakukan Displacement naik dari Swing Low **`2.640,00`** ke Swing High **`2.660,00`** (total jarak = **`$20,00`**).'
              },
              {
                label: 'Hitungan Matematis Garis Equilibrium & OTE',
                detail: '• **50% Equilibrium:** `2.660,00 - (50% × $20)` = **`2.650,00`** (batas atas area Buy).\n• **61,8% (Atap OTE):** `2.660,00 - $12,36` = **`2.647,64`**.\n• **70,5% (Titik Manis OTE):** `2.660,00 - $14,10` = **`2.645,90`**.\n• **78,6% (Lantai OTE):** `2.660,00 - $15,72` = **`2.644,28`**.'
              },
              {
                label: 'Konfluensi PD Array & Eksekusi',
                detail: 'Tepat di `2.645,00 – 2.647,00` terdapat **Bullish FVG Fresh** yang berhimpitan persis dengan titik manis OTE `2.645,90`! Buy Limit di **`2.646,00`**, SL di bawah Swing Low **`2.639,50`** (risiko **`$6,50`**), TP konservatif cukup ke puncak lama **`2.660,00`** (`+$14,00` → **R:R 1 : 2,15**).'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Pencapaian Besar · Bagian IV Tuntas!',
            title: 'Seluruh Mesin Zona Entry ICT (Bab 18–24) Sudah di Tanganmu',
            body: 'Kamu sekarang sudah menguasai 100% komponen PD Array tanpa satu pun yang terlewat: **Displacement, FVG + 50% CE, iFVG, Order Block + 50% MT, Breaker/Mitigation/Unicorn, CISD vs MSS, hingga OTE & Hierarki PD Array**. Di Bagian V nanti, kita merakit semua komponen ini menjadi **Playbook Entry, Manajemen SL/TP & Psikologi Eksekusi**!'
          }
        }
      ],
      keyTakeaways: [
        '**Hukum Lokasi:** Cari **BUY** hanya di zona **Discount (`< 50%`)** dan cari **SELL** hanya di zona **Premium (`> 50%`)** dari Dealing Range impulsif.',
        '**Zona OTE** (*Optimal Trade Entry*) terletak di retracement **`61,8% – 78,6%`** dengan titik manis **`70,5%`** — namun WAJIB berhimpitan dengan PD Array (bukan klik buta di garis Fibonacci).',
        '**Hierarki PD Array:** `Unicorn (BB+FVG) > Breaker Block > iFVG > Order Block + FVG > FVG Fresh > Mitigation Block`.',
        'Jika harga tidak mau memberikan diskon di bawah 50%, biarkan ia pergi — disiplin menolak entry mahal adalah pelindung terbesar modalmu.'
      ],
      bridgeNext: 'Selamat menuntaskan **Bagian IV: Mesin Zona Entry ICT (Bab 18–24)**! Kamu sudah tahu *ke mana* harga mau pergi (Bagian III) dan *di titik mana* institusi menaruh pesanan mereka (Bagian IV). Sekarang saatnya merakit seluruh mesin itu ke dalam **SOP Eksekusi Langkah demi Langkah** di **Bagian V**, dimulai dari model paling terkenal di seluruh dunia ICT: **Bab 25: Model Entry Utama (ICT 2022): Merakit Sweep → MSS/CISD → FVG/OB dari Nol**.',
      practiceCta: {
        label: 'Cek Posisi Premium/Discount Live di Mapping',
        description: 'Lihat persentase Dealing Range live dan prioritas zona BB/iFVG/OB/FVG di Mapping Cockpit Amy FX Pro.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Premium, Discount, OTE & Hierarki PD Array',
          paragraphs: [
            'Buy hanya di bawah 50% (Discount) dan Sell hanya di atas 50% (Premium), dengan pertemuan PD Array di zona OTE (61,8%–78,6%, sweet spot 70,5%) dan urutan prioritas Unicorn > BB > iFVG > OB > FVG > MB.'
          ]
        }
      ],
      mappingSteps: [
        'Tarik Fibonacci dari awal hingga ujung gelombang impulsif (Dealing Range) dengan 4 level: 0%, 50%, 61,8%–78,6% (70,5%), dan 100%.',
        'Saring hanya PD Array yang berada di Discount (<50% untuk Buy) atau Premium (>50% untuk Sell).',
        'Jika ada beberapa PD Array, pilih sesuai Hierarki: Unicorn > Breaker > iFVG > OB+FVG > FVG > Mitigation.'
      ],
      decisionTree: [
        {
          condition: 'Muncul Bullish FVG rapi di 70% Premium saat tren naik.',
          action: 'SKIP — posisi terlalu mahal; tunggu diskon di bawah 50% atau biarkan harga pergi.'
        },
        {
          condition: 'Harga menyentuh garis 70,5% OTE, tetapi di situ tidak ada FVG, OB, maupun Breaker.',
          action: 'Jangan klik entry buta — OTE hanyalah filter lokasi, wajib ada PD Array dan konfirmasi.'
        }
      ],
      validRules: [
        'Buy hanya di zona Discount (<50%) dan Sell hanya di zona Premium (>50%), idealnya berhimpitan dengan OTE 61,8%–78,6%.',
        'Mengutamakan PD Array dengan peringkat hierarki lebih tinggi (Unicorn/BB/iFVG/OB+FVG).'
      ],
      invalidRules: [
        'Mengejar Buy di atas 60%–80% Premium karena FOMO.',
        'Menjadikan garis Fibonacci 70,5% sebagai sinyal tunggal tanpa PD Array atau struktur.'
      ],
      xauScenario: {
        context: 'Gelombang naik XAU/USD M15 dari 2.640,00 ke 2.660,00 ($20).',
        steps: [
          'Equilibrium 50% = 2.650,00; Zona OTE 61,8%–78,6% = 2.647,64 – 2.644,28 (sweet spot 70,5% = 2.645,90).',
          'Bullish FVG Fresh tepat di 2.645–2.647 → Buy Limit 2.646,00, SL 2.639,50 ($6,50), TP 2.660,00 (+$14,00, R:R 1:2,15).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Entry di Fibonacci Tanpa PD Array',
        context: 'Trader menaruh Sell Limit tepat di 70,5% padahal tidak ada FVG/OB dan struktur M5 belum berbalik.',
        whyFailed: 'Tanpa PD Array dan konfirmasi, harga langsung menembus 70,5% menuju High baru.'
      },
      goldenRules: [
        'Jika harga tidak mau memberi diskon di bawah 50%, biarkan ia pergi — selalu ada peluang berikutnya.',
        'PD Array bermutu tinggi + Zona OTE (61,8%–78,6%) adalah kombinasi presisi tertinggi scalper.'
      ],
      quiz: [
        {
          question: 'XAU/USD baru mencetak gelombang Displacement naik dari `2.600,00` ke `2.640,00`. Di area harga berapakah kamu boleh mencari PD Array (FVG/OB) untuk **BUY**?',
          options: [
            'Di atas `2.630,00` (Premium)',
            '**Di bawah `2.620,00` (Zona Discount `< 50%` Equilibrium)**',
            'Tepat di puncak `2.640,00`',
            'Di mana saja asalkan muncul candle hijau'
          ],
          answerIndex: 1,
          explanation: 'Titik 50% Equilibrium berada di `2.620,00`; seluruh area di bawah `2.620,00` adalah Discount yang sah untuk mencari Buy.'
        },
        {
          question: 'Berapakah rentang persentase resmi **Zona Optimal Trade Entry (OTE)** beserta titik manis (*sweet spot*)-nya dalam metodologi ICT?',
          options: [
            '`10% – 25%` (titik manis `15%`)',
            '**`61,8% – 78,6%`** dengan titik manis **`70,5%`**',
            '`45% – 55%` saja',
            '`90% – 100%`'
          ],
          answerIndex: 1,
          explanation: 'Zona OTE terletak pada koreksi mendalam 61,8% hingga 78,6% dengan titik tengah manis 70,5%.'
        },
        {
          question: 'Menurut **Hierarki PD Array (PD Array Matrix)** yang juga digunakan di Mapping Cockpit Amy FX Pro, manakah urutan kekuatan yang benar dari terkuat ke standar?',
          options: [
            'Mitigation Block > FVG Tunggal > ICT Unicorn',
            '**ICT Unicorn (Breaker + FVG) > Breaker Block > iFVG > Order Block + FVG > FVG Fresh > Mitigation Block**',
            'Semua PD Array kekuatannya sama persis sehingga tinggal pilih acak',
            'Indikator RSI > Breaker Block > Order Block'
          ],
          answerIndex: 1,
          explanation: 'Konfluensi ganda Unicorn (BB+FVG) dan zona flip (Breaker & iFVG) menempati hierarki teratas dibanding zona tunggal maupun Mitigation Block tanpa sweep.'
        },
        {
          question: 'Harga XAU/USD baru saja menyentuh tepat garis `70,5%` OTE, tetapi di sekitar titik tersebut **tidak ada FVG, Order Block, ataupun Breaker Block**. Apa tindakan yang benar?',
          options: [
            'Langsung Market Order karena `70,5%` pasti memantul 100%',
            '**Tidak langsung entry** — karena OTE hanyalah filter lokasi diskon/premium; tetap wajib ada PD Array dan konfirmasi struktur yang valid',
            'Menggandakan ukuran lot agar cepat balik modal',
            'Memindahkan Fibonacci ke candle acak agar cocok'
          ],
          answerIndex: 1,
          explanation: 'Fibonacci OTE adalah alat ukur lokasi, bukan pemicu entry tunggal tanpa kehadiran PD Array institusional.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════
    // BAGIAN V — MODEL EKSEKUSI, FILTER GAGAL & MANAJEMEN TRADE: BAB 25, 26, 27
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'model-sweep-mss-fvg',
      number: 25,
      levelId: 4,
      title: 'Model Entry Utama (ICT 2022): Merakit Sweep → MSS/CISD → FVG/OB dari Nol',
      readMinutes: 10,
      diagramId: 'model-sweep-fvg',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Saatnya merakit seluruh komponen Bagian II–IV menjadi satu mesin eksekusi paling populer di dunia ICT: Model 2022 (Sweep → Displacement + MSS/CISD → Retracement ke FVG/OB di Discount/Premium) lengkap dengan aturan batal pending order.',
      bookSections: [
        {
          number: '25.1',
          heading: 'Mengapa Model ICT 2022 Menjadi Senjata Utama #1 Scalper XAU/USD?',
          shortTitle: 'Kenapa Model ICT 2022 #1',
          paragraphs: [
            'Selamat datang di **Bagian V: Model Eksekusi, Filter Gagal & Manajemen Trade**. Di Bagian II–IV kamu sudah membangun seluruh suku cadangnya: struktur & likuiditas, kompas DOL/Bias/Killzone, serta seluruh PD Array (Displacement, FVG, iFVG, OB, Breaker, CISD/MSS, OTE). Sekarang kita merakit suku cadang itu menjadi **kendaraan siap jalan**!',
            '**Model ICT 2022** adalah playbook paling terkenal dan paling banyak diaudit di seluruh dunia ICT karena satu alasan sederhana: **urutan sebab-akibatnya 100% mekanis dan tanpa ruang menebak.** Kamu tidak pernah menerka kapan harga akan berbalik — kamu justru **membiarkan institusi menunjukkan kartunya lebih dulu** lewat sapuan likuiditas (*Sweep*) dan dorongan patah struktur (*Displacement + MSS*), baru masuk dengan tenang saat harga pulang menjemput diskon di FVG atau Order Block.',
            'Keuntungan psikologisnya luar biasa: jika **salah satu** dari rantai wajibnya belum muncul di chart, tanganmu otomatis tetap tenang di samping keyboard — tidak ada lagi keraguan *"masuk nggak ya?"*.'
          ]
        },
        {
          number: '25.2',
          heading: 'Blueprint 4 Langkah Mekanis ICT 2022 (Dari Peta H1 Sampai Limit Order M5)',
          shortTitle: 'Blueprint 4 Langkah',
          paragraphs: [
            'Ikuti persis urutan 4 tahap berikut dari atas ke bawah. **Jangan pernah melompati satu tahap pun**, karena setiap tahap adalah syarat hidup bagi tahap berikutnya:'
          ],
          table: {
            caption: 'Rantai Eksekusi Mekanis Model Utama ICT 2022 (XAU/USD · H1 → M15 → M5)',
            headers: ['Tahap', 'Timeframe & Fokus', 'Syarat Wajib Terpenuhi (Bukan Perkiraan)', 'Jika Tidak Ada?'],
            rows: [
              ['**1. Konteks & Bahan Bakar**', 'H1 / M15 (Killzone WITA)', 'Daily Bias & DOL jelas + **Liquidity Sweep** nyata pada kolam kunci (`Asia H/L`, `London H/L`, `PDH/PDL`, `EQH/EQL`) atau sentuhan **POI HTF**', '**TUNGGU!** Tanpa Sweep/POI HTF, semua sinyal M5 hanyalah noise'],
              ['**2. Bukti Balik Arah**', 'M5 (atau M15)', 'Muncul **Displacement tegas** (`≥ 65%` body) yang menutup **Body Close** mematahkan Swing (**MSS**) atau Open rangkaian sweep (**CISD**) dan **mencetak FVG segar**', '**SKIP!** Gerakan merayap tanpa Displacement + FVG = dilarang entry'],
              ['**3. Titik Antre Diskon**', 'M5 (Dealing Range Kaki MSS)', 'Tarik Fib kaki dorongan → pastikan **FVG / OB** berada di sisi **Discount (`< 50%`)** untuk Buy atau **Premium (`> 50%`)** untuk Sell (ideal di OTE `61,8%–78,6%`). Pasang Limit Order di tepi FVG atau `50% CE`', 'Jika FVG hanya ada di area mahal (`> 50%` untuk Buy), **biarkan pergi**'],
              ['**4. Proteksi & Target**', 'M5 → H1 DOL', 'SL di luar ujung wick ekstrem sweep (+ napas spread) · TP1 di kolam likuiditas terdekat (`≥ 1,5R–2R`) · TP2 di magnet DOL utama (`PDH/PDL` / H1 Pool)', 'Jika R:R ke target realistis `< 1:2`, **batalkan setup!**']
            ]
          }
        },
        {
          number: '25.3',
          heading: 'Aturan Pembatalan Pending Order (Cancel Rule): Kapan Limit Wajib Dihapus?',
          shortTitle: 'Aturan Batal Limit Order',
          paragraphs: [
            'Ada satu jebakan halus yang sering memakan korban di Model ICT 2022: trader sudah memasang `Sell Limit` rapi di Bearish FVG, lalu harga ternyata langsung terjun kencang **menyentuh target DOL (SSL/PDL)** tanpa sempat naik menjemput ordernya. Lima belas menit kemudian harga baru memantul naik menyentuh `Sell Limit` lama itu — dan langsung bablas menembus Stop Loss!',
            'Kenapa bisa begitu? Karena **tujuan perjalanan harga (DOL) sudah selesai tercapai!** Begitu kolam likuiditas target sudah disapu, bahan bakar dorongan tadi sudah habis dan algoritma siap berbalik arah. Maka hafalkan **3 Aturan Wajib Cancel Pending Order** berikut:',
            '1. **Target Terlebih Dahulu Tercapai:** Jika harga menyentuh minimal `80%–100%` jarak ke TP1/DOL sebelum menjemput Limit Order-mu → **segera Cancel!**',
            '2. **Melewati Jam Killzone / Masuk News Lock:** Jika Limit Order belum terjemput hingga jendela Killzone berakhir atau tinggal 15 menit menjelang berita merah USD (CPI/NFP/FOMC) → **segera Cancel!**',
            '3. **Struktur Baru Berlawanan Muncul:** Jika sebelum menyentuh ordermu, harga malah membentuk MSS berlawanan arah yang mematahkan titik invalidasi → **segera Cancel!**'
          ]
        },
        {
          number: '25.4',
          heading: 'Studi Kasus Lengkap ICT 2022: Sell XAU/USD di NY AM Killzone',
          shortTitle: 'Studi Kasus ICT 2022 Gold',
          paragraphs: [
            'Perhatikan bagaimana keempat langkah Model ICT 2022 dirangkai secara presisi dengan hitungan angka nyata pada chart M5 XAU/USD:'
          ],
          exampleBox: {
            title: 'Eksekusi Model ICT 2022 — Bearish Setup XAU/USD M5 (NY AM · 20:45 WITA EDT)',
            rows: [
              {
                label: 'Tahap 1 — Konteks & Sweep (Bahan Bakar)',
                detail: 'Daily Bias & H1 **Bearish** menuju DOL **`PDL 2.632,00`**. Bebas News Lock. Pukul `20:35 WITA`, harga melonjak tajam menyapu **London High `2.652,50`** hingga ujung wick **`2.654,00`** lalu langsung ditolak.'
              },
              {
                label: 'Tahap 2 — Displacement + MSS + FVG',
                detail: 'Dua candle bearish M5 berbadan tebal membanting harga menembus **Body Close** di bawah Swing Low **`2.649,00`**, mencetak **Bearish MSS** sekaligus meninggalkan **Bearish FVG (SIBI)** segar di **`2.650,00 – 2.652,00`** (berada di area **Premium `> 50%`** dari kaki bantingan `2.654,00 → 2.646,00`, EQ = `2.650,00`).'
              },
              {
                label: 'Tahap 3 & 4 — Limit Order, SL Struktural & Target Bertingkat',
                detail: 'Pasang **Sell Limit** di **`2.650,50`** (tepi dalam SIBI di zona Premium). **SL** di atas ujung wick sweep **`2.654,80`** (jarak risiko **`$4,30`** termasuk napas spread `$0,80`). **TP1** di kolam SSL internal **`2.641,50`** (`+$9,00` → **2,09R**), **TP2** runner di **`PDL 2.632,50`** (`+$18,00` → **4,19R**).'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Aturan Emas Pemula Menuju Pro',
            title: 'Kuasai Model ICT 2022 Minimal 30 Trade Sebelum Lirik Model Lain',
            body: 'Model ICT 2022 saja sudah cukup untuk membawa seorang scalper XAU/USD dari pemula menuju profit konsisten. Jangan terburu-buru mencampur 4 model dalam satu minggu — jadikan **Sweep → MSS → FVG** ini sebagai refleks otot utamamu terlebih dahulu.'
          }
        }
      ],
      keyTakeaways: [
        '**Model ICT 2022** berjalan dalam 4 tahap berurutan tanpa lompat: **Konteks/Sweep (Killzone) → Displacement + MSS/CISD → Retracement Discount/Premium ke FVG/OB → SL di luar Sweep + TP di DOL**.',
        'Jika salah satu rantai wajib tidak ada (misalnya tidak ada Sweep atau tidak ada Displacement/FVG), keputusan mekanisnya otomatis **SKIP**.',
        '**Cancel Rule Wajib:** Segera hapus Pending Limit Order jika target likuiditas (TP1/DOL) terlanjur tersentuh sebelum ordermu terjemput, atau saat mendekati News Lock / akhir Killzone.',
        'Pastikan R:R ke target likuiditas realistis minimal **`1:2`** sebelum tombol order dipasang.'
      ],
      bridgeNext: 'Model ICT 2022 adalah tulang punggung yang luar biasa rapi. Namun di XAU/USD yang terkenal eksplosif, ada kalanya harga melesat terlalu kencang sehingga tidak memberi pullback dalam ke FVG baru, atau justru membentuk irisan Unicorn / pembalikan ekstrem di PWL/PWH. Kapan kita memakai tiga playbook pelengkap tersebut? Mari kita bedah di **Bab 26: Model Entry Alternatif: iFVG Entry, Unicorn Setup & Turtle Soup (SMR)**.',
      practiceCta: {
        label: 'Latih Model ICT 2022 di Replay Lab',
        description: 'Praktikkan alur Sweep → MSS → FVG bar-by-bar di Backtest Replay Lab XAU/USD pada sesi London & NY WITA.',
        href: 'trading-practice/candle-replay.html'
      },
      conceptBlocks: [
        {
          heading: 'Rangkaian 4 Langkah Mekanis Model ICT 2022',
          paragraphs: [
            'Model ICT 2022 merakit Liquidity Sweep di Killzone → Displacement + MSS/CISD + FVG → Retracement Discount/Premium → SL di luar ujung Sweep dan TP ke DOL terdekat (min R:R 1:2), dilengkapi Cancel Rule saat target tercapai lebih dulu.'
          ]
        }
      ],
      mappingSteps: [
        'Tunggu Sweep likuiditas nyata (Asia/London/PDH/PDL) atau sentuhan POI HTF di dalam Killzone WITA.',
        'Konfirmasi Displacement + Body Close MSS/CISD di M5 yang meninggalkan FVG segar.',
        'Pasang Limit Order pada FVG/OB di zona Discount (Buy) atau Premium (Sell) dengan SL di balik ujung Sweep (+ napas spread) dan TP minimal 1:2.',
        'Segera Cancel Limit Order jika harga terlanjur menyentuh target TP1/DOL sebelum order terjemput.'
      ],
      decisionTree: [
        {
          condition: 'Sell Limit di Bearish FVG belum terjemput, tetapi harga sudah langsung terjun menyentuh TP1/DOL.',
          action: 'Segera CANCEL Sell Limit — bahan bakar target sudah habis dan rawan berbalik menembus SL.'
        },
        {
          condition: 'Muncul FVG M5 rapi, tetapi sebelumnya tidak ada Sweep likuiditas maupun sentuhan POI HTF.',
          action: 'SKIP — rantai tahap 1 Model 2022 tidak terpenuhi.'
        }
      ],
      validRules: [
        'Wajib ada Sweep likuiditas nyata (Asia High/Low, PDH/PDL, atau EQH/EQL) sebelum MSS.',
        'MSS terjadi dengan candle Displacement tegas yang menciptakan FVG segar di dalam Killzone WITA.'
      ],
      invalidRules: [
        'Membiarkan pending Limit Order aktif setelah harga sudah mencapai target likuiditas (DOL).',
        'Masuk di setup dengan R:R ke kolam likuiditas terdekat kurang dari 1:2.'
      ],
      xauScenario: {
        context: 'Sesi NY AM (20:45 WITA EDT), Bias H1 Bearish menuju PDL 2.632.',
        steps: [
          'Sweep London High 2.652,50 hingga 2.654,00 → MSS M5 jebol 2.649,00 mencetak SIBI 2.650,00–2.652,00.',
          'Sell Limit 2.650,50, SL 2.654,80 ($4,30), TP1 2.641,50 (+$9,00 / 2,09R), TP2 PDL 2.632,50 (+$18,00 / 4,19R).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Lupa Membatalkan Limit Order Kadaluarsa',
        context: 'Trader membiarkan Sell Limit aktif padahal harga sudah terlebih dahulu menyapu PDL target dan mulai memantul naik.',
        whyFailed: 'Order terjemput saat fase pembalikan baru sehingga langsung terseret menembus SL.'
      },
      goldenRules: [
        'Jika harga sudah menyentuh target likuiditas SEBELUM menjemput limit order FVG kamu, segera batalkan order!',
        'Kuasai Model ICT 2022 ini minimal 30 trade sebelum sibuk mengeksplorasi model lain.'
      ],
      quiz: [
        {
          question: 'Manakah urutan 4 tahap mekanis yang benar pada **Model Entry Utama (ICT 2022)**?',
          options: [
            'Pasang Limit dulu → baru tunggu Sweep → baru cek News',
            '**Konteks/Sweep Likuiditas di Killzone → Displacement + MSS/CISD + FVG → Retracement ke FVG/OB di Discount/Premium → SL di luar Sweep + TP di DOL**',
            'Cari 5 indikator oversold → langsung Market Order di sesi Asia',
            'Tunggu berita CPI → pasang Buy Stop dan Sell Stop bersamaan'
          ],
          answerIndex: 1,
          explanation: 'Model ICT 2022 menunggu bahan bakar (Sweep), bukti niat institusi (Displacement + MSS + FVG), baru masuk saat diskon dengan SL struktural dan target DOL.'
        },
        {
          question: 'Kamu sudah memasang `Sell Limit` di Bearish FVG `2.650,50`, tetapi harga langsung terjun mencapai target `TP1 / PDL` tanpa sempat naik menjemput ordermu. Apa tindakan wajib sesuai **Cancel Rule**?',
          options: [
            'Biarkan `Sell Limit` tetap aktif sampai besok malam',
            '**Segera hapus (`Cancel`) Sell Limit tersebut** karena bahan bakar target DOL sudah selesai terambil',
            'Langsung klik Market Sell di dasar bawah',
            'Mengganti SL menjadi lebih lebar'
          ],
          answerIndex: 1,
          explanation: 'Begitu target Draw on Liquidity tercapai sebelum pullback, setup lama kadaluarsa dan rawan menjadi bahan bakar pembalikan jika dibiarkan aktif.'
        },
        {
          question: 'Dalam studi kasus Bearish ICT 2022 (`Sell Limit 2.650,50`, ujung wick sweep `2.654,00`, SL `2.654,80` = risiko `$4,30`), mengapa SL diletakkan di `2.654,80` bukan tepat di `2.654,00`?',
          options: [
            'Supaya angka belakangnya genap',
            'Untuk memberi **ruang napas spread** (`+$0,80`) di luar titik invalidasi struktural ujung wick sweep agar tidak mudah tersenggol pelebaran spread',
            'Karena broker melarang angka bulat `.00`',
            'Supaya jarak SL menjadi $20'
          ],
          answerIndex: 1,
          explanation: 'Menambahkan buffer napas spread di luar ujung ekstrem sweep melindungi posisi dari sentuhan spread Ask tanpa mengubah logika invalidasi struktur.'
        },
        {
          question: 'Terjadi Sweep Asia Low + MSS M5 + Bullish FVG, namun jarak dari titik entry ke kolam likuiditas lawan terdekat hanya menghasilkan **R:R `1 : 1,2`**. Apa keputusan mekanis yang benar?',
          options: [
            'Tetap masuk dengan lot 2× lebih besar',
            '**Batalkan / Skip setup** karena R:R di bawah standar minimal `1:2` — ruang profitnya terlalu sempit dibanding risikonya',
            'Geser TP jauh melampaui ADR harian tanpa dasar likuiditas',
            'Geser SL masuk ke tengah kotak FVG agar R:R terlihat besar'
          ],
          answerIndex: 1,
          explanation: 'Jangan pernah memanipulasi SL/TP demi memaksakan R:R; jika ruang likuiditas aktual di bawah 1:2, lewati saja.'
        }
      ]
    },
    {
      id: 'model-order-block-sniper',
      number: 17,
      levelId: 4,
      title: 'Model 2: Order Block + Mean Threshold Sniper',
      readMinutes: 5,
      diagramId: 'model-ob-sniper',
      summary: 'Saat Displacement begitu cepat sehingga FVG sangat tipis atau harga menembus FVG lebih dalam, Order Block + 50% Mean Threshold adalah benteng masuk presisi tinggi.',
      conceptBlocks: [
        {
          heading: 'Kapan Memakai Model Order Block Dibanding FVG?',
          paragraphs: [
            'Sering kali pada XAU/USD, harga menyapu likuiditas lalu melesat dengan FVG kecil yang berada di atas OB, atau harga melakukan koreksi sedikit lebih dalam menembus FVG untuk menjemput Order Block di pangkal dorongan.',
            'Model 2 membidik reaksi di Open Order Block atau tepat di garis 50% Mean Threshold (MT) dari badan OB. Karena posisinya lebih dalam ke arah ekstrem, jarak Stop Loss jauh lebih ketat — menghasilkan R:R 1:3 hingga 1:5.'
          ]
        },
        {
          heading: 'Filter Wajib: OB Harus Punya FVG & Sweep',
          paragraphs: [
            'Order Block yang berdiri sendirian tanpa FVG tepat di atas/bawahnya adalah OB lemah. Pada Model 2, kita mencari keselarasan "OB + FVG berdempetan": FVG membuktikan kecepatan, sedangkan OB di pangkalnya menjadi lantai pijakan terakhir institusi.'
          ]
        }
      ],
      validRules: [
        'OB adalah candle berlawanan terakhir yang langsung menyapu likuiditas sebelum Displacement.',
        'Terdapat FVG yang terbentuk persis keluar dari OB tersebut.',
        'Entry di Open OB (konservatif) atau 50% Mean Threshold (sniper) dengan SL di luar wick OB.'
      ],
      invalidRules: [
        'Memakai OB di tengah-tengah jalan (continuation OB) yang sudah pernah disentuh.',
        'Memaksa entry di Mean Threshold jika harga sudah memantul kuat dari Open OB dan mencetak struktur baru.',
        'Ukuran candle OB terlalu raksasa (misal >$10 di M5) sehingga risiko terlalu besar.'
      ],
      xauScenario: {
        context: 'Sesi London (16:15 WITA), XAU/USD menyapu PDL 2.635 dengan 1 candle bearish M5 (Open 2.638,50, Close 2.636,00, Wick Low 2.634,50) lalu meledak naik mencetak MSS + FVG.',
        steps: [
          'Tandai Bullish OB: Open 2.638,50, Mean Threshold (50% body) = 2.637,25.',
          'Saat harga turun mengisi FVG dan menusuk masuk ke 2.637,50 (dekat MT) dengan ekor penolakan, Buy Limit terjemput.',
          'SL di 2.633,80 ($3,70 risiko). Target Asia High 2.651,00 (+$13,50) menghasilkan R:R 1:3,6.'
        ]
      },
      goldenRules: [
        'OB terbaik selalu menjadi "pelaku" yang menyapu likuiditas dan melahirkan FVG.',
        'Gunakan Open OB jika ingin peluang terjemput lebih tinggi; gunakan 50% MT jika ingin R:R lebih tajam.'
      ],
      quiz: [
        {
          question: 'Apa keuntungan utama menaruh entry di 50% Mean Threshold dibanding Open Order Block?',
          options: [
            'Pasti terjemput 100% di setiap trade',
            'Jarak ke Stop Loss lebih sempit sehingga rasio Risk:Reward (R:R) jauh lebih besar',
            'Tidak perlu memasang Stop Loss',
            'Bisa melawan tren H1 dengan aman'
          ],
          answerIndex: 1,
          explanation: 'Masuk lebih dalam di 50% MT memperkecil jarak SL dan memperlebar jarak TP, dengan kompromi sesekali tertinggal jika harga hanya menyentuh Open OB.'
        },
        {
          question: 'Ciri apa yang wajib menyertai sebuah Order Block pada Model 2 agar tidak terjebak OB palsu?',
          options: [
            'OB tersebut menyapu likuiditas dan langsung melahirkan Displacement + FVG',
            'OB berada di atas 80% Premium untuk posisi Buy',
            'OB sudah pernah diuji 3 kali sebelumnya',
            'OB terbentuk saat spread rollover subuh'
          ],
          answerIndex: 0,
          explanation: 'Sweep + FVG membuktikan adanya injeksi order institusional nyata di candle OB tersebut.'
        },
        {
          question: 'Jika candle M5 pada Bullish OB memiliki Open 2.650 dan Close 2.646, di harga berapa garis 50% Mean Threshold-nya?',
          options: [
            '2.649',
            '2.648',
            '2.644',
            '2.652'
          ],
          answerIndex: 1,
          explanation: 'Titik tengah antara Open 2.650 dan Close 2.646 adalah (2.650 + 2.646) / 2 = 2.648.'
        }
      ]
    },
    {
      id: 'model-ifvg-inversion',
      number: 20,
      levelId: 3,
      title: 'Inversion Fair Value Gap (iFVG): Saat FVG Gagal Berubah Jadi Peluang',
      readMinutes: 9,
      diagramId: 'model-ifvg-flip',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Di XAU/USD yang bergerak cepat, harga sering tidak sempat memberi pullback dalam ke FVG baru. Pelajari bagaimana FVG lawan yang dihancurkan oleh Body Close berbalik kutub menjadi lantai atau atap presisi (iFVG).',
      bookSections: [
        {
          number: '20.1',
          heading: 'Logika Balik Kutub: Kenapa FVG Lawan yang Hancur Justru Sinyal Sangat Kuat?',
          shortTitle: 'Logika Balik Kutub iFVG',
          paragraphs: [
            'Di Bab 19 kamu belajar bahwa sebuah **Bearish FVG (SIBI)** seharusnya berfungsi sebagai **atap pertahanan penjual** yang menolak harga kembali ke bawah. Sekarang bayangkan sebuah skenario nyata: XAU/USD baru saja turun menyapu `Asia Low` atau `PDL` sambil meninggalkan sebuah Bearish FVG kecil di kaki penurunan terakhirnya.',
            'Secara logika, kalau penjual memang masih berkuasa, Bearish FVG itu **wajib** menahan harga. Tetapi tiba-tiba muncul candle hijau tebal yang **menghancurkan dan menutup badannya (Body Close) telak di atas seluruh kotak Bearish FVG tersebut**! Pesannya sejelas siang bolong: **pertahanan penjual baru saja jebol dan pihak pembeli mengambil alih panggung.**',
            'Pada detik itulah Bearish FVG yang gagal berubah kutub menjadi **Bullish Inversion Fair Value Gap (`+iFVG`)** — atap yang gagal kini berubah menjadi **lantai pijakan baru** untuk meluncur ke atas! (Di Chart Gold Mapping Cockpit Amy FX Pro, zona ini otomatis digambar sebagai **`+iFVG` ungu** untuk Buy dan **`-iFVG` amber** untuk Sell).'
          ]
        },
        {
          number: '20.2',
          heading: 'Syarat Mutlak iFVG Valid vs FVG Bocor Biasa di Tengah Sideways',
          shortTitle: 'Syarat Mutlak iFVG',
          paragraphs: [
            'Kesalahan terbesar trader yang baru mengenal iFVG adalah menandai **setiap** FVG yang tertembus di tengah pasar sideways sebagai iFVG. Ingat: tanpa konteks likuiditas, FVG di tengah pasar datar memang akan ditembus naik-turun sepanjang hari. Gunakan tabel penyaring mutlak berikut:'
          ],
          table: {
            caption: 'Aturan Sah Pembentukan +iFVG (Bullish) dan -iFVG (Bearish)',
            headers: ['Jenis iFVG', 'Asal Kotak', 'Syarat Sah Flip (WAJIB)', 'Konteks yang Wajib Ada'],
            rows: [
              ['**Bullish `+iFVG`**', 'Bekas **Bearish FVG (SIBI)** di kaki turun terakhir', 'Candle bullish menutup **Body Close** penuh di atas batas atas SIBI (bukan sekadar wick)', 'Tepat sesudah **Sweep SSL** (`Asia Low`, `PDL`, `EQL`) atau menyentuh **POI Bullish HTF**'],
              ['**Bearish `-iFVG`**', 'Bekas **Bullish FVG (BISI)** di kaki naik terakhir', 'Candle bearish menutup **Body Close** penuh di bawah batas bawah BISI (bukan sekadar wick)', 'Tepat sesudah **Sweep BSL** (`Asia High`, `PDH`, `EQH`) atau menyentuh **POI Bearish HTF**'],
              ['Bukan iFVG (SKIP)', 'FVG yang hanya ditusuk **wick** lalu body kembali tutup di dalam kotak', 'Belum terjadi flip — FVG lama justru masih bertahan', 'Jangan mendahului penutupan candle (tunggu candle close selesai!)']
            ]
          }
        },
        {
          number: '20.3',
          heading: 'Kapan iFVG Menjadi Senjata Favorit Scalper Gold?',
          shortTitle: 'Kapan Memakai iFVG',
          paragraphs: [
            'XAU/USD pada **NY AM Killzone (`19:00–22:00 WITA` EDT / `20:00–23:00 WITA` EST)** dan **NY AM Silver Bullet** terkenal sangat agresif. Sering kali setelah menyapu likuiditas, harga langsung melesat kencang tanpa pernah kembali menjemput FVG atau Order Block jauh di bawah.',
            'Di sinilah **iFVG** bersinar: begitu candle penembus FVG lawan resmi *close*, kamu sudah mendapatkan sinyal perpindahan arus order (*order flow shift*) yang lebih dini dibanding menunggu MSS jauh — sehingga kamu bisa ikut naik kereta di retest singkat tepi luar kotak iFVG (atau garis 50% CE-nya) tanpa harus FOMO mengejar di udara.'
          ]
        },
        {
          number: '20.4',
          heading: 'Studi Kasus Langkah demi Langkah XAU/USD: +iFVG Pasca-Sweep Asia Low',
          shortTitle: 'Studi Kasus +iFVG Gold',
          paragraphs: [
            'Perhatikan presisi angka dan urutan waktu pada satu setup Bullish `+iFVG` klasik di sesi New York:'
          ],
          exampleBox: {
            title: 'Eksekusi +iFVG M5 XAU/USD (NY AM · 21:10 WITA EDT)',
            rows: [
              {
                label: 'Tahap 1 — Sweep & FVG Lawan',
                detail: 'Bias H1 sedang Bullish menuju NY High `2.658,50`. Harga turun cepat menyapu **Asia Low `2.644,00`** (ekor menyentuh `2.643,80`) sambil meninggalkan **Bearish FVG (SIBI)** di **`2.646,50 – 2.648,00`**.'
              },
              {
                label: 'Tahap 2 — Penghancuran SIBI (Body Close)',
                detail: 'Harga menolak lanjut turun; muncul candle bullish M5 tebal yang menutup badannya (**Close**) di **`2.649,20`** — menembus tuntas seluruh kotak SIBI `2.646,50 – 2.648,00`. Kotak itu resmi berubah kutub menjadi **Bullish `+iFVG`**.'
              },
              {
                label: 'Tahap 3 — Retest & Hitungan Risiko',
                detail: 'Candle M5 berikutnya turun sejenak menguji batas atas `+iFVG` di **`2.648,00`**. Eksekusi Buy di `2.648,00`, SL struktural di bawah ujung sweep **`2.643,40`** (risiko **`$4,60`**), target NY High **`2.658,50`** (`+$10,50` → **R:R 1 : 2,28**).'
              }
            ]
          },
          callout: {
            tone: 'warn',
            kicker: 'Peringatan Anti-Jebakan',
            title: 'iFVG Tanpa Sweep / HTF POI = Rasio Gagal Tinggi',
            body: 'Jangan pernah mengklik iFVG hanya karena melihat sebuah kotak FVG tertembus di tengah konsolidasi tanpa alasan. **Sweep likuiditas atau sentuhan POI H1/H4** adalah bahan bakar wajib yang membuat perubahan kutub iFVG benar-benar meledak ke target.'
          }
        }
      ],
      keyTakeaways: [
        '**Inversion FVG (iFVG)** terjadi saat sebuah FVG lawan gagal menahan harga dan ditembus penuh oleh **Body Close** (bukan sekadar wick).',
        'Bekas **Bearish FVG (SIBI)** yang ditembus Body Close ke atas berubah menjadi **Bullish `+iFVG`** (lantai Buy); bekas **Bullish FVG (BISI)** yang ditembus Body Close ke bawah berubah menjadi **Bearish `-iFVG`** (atap Sell).',
        'Syarat mutlak iFVG berkualitas tinggi: **terjadi tepat setelah Sweep likuiditas (BSL/SSL) atau sentuhan POI HTF**.',
        'iFVG adalah pemicu dini favorit scalper Gold di sesi NY AM saat momentum terlalu cepat untuk menunggu pullback dalam.'
      ],
      bridgeNext: 'Kamu sudah menguasai dua wajah celah harga: FVG normal (Bab 19) dan FVG yang berbalik kutub menjadi iFVG (Bab 20). Sekarang kita mundur satu langkah ke **pangkal dorongan** tempat institusi pertama kali menanamkan pesanan raksasa sebelum celah FVG itu tercipta. Mari kita bedah secara tuntas di **Bab 21: Order Block (OB) Bermutu Tinggi vs Trap OB & 50% Mean Threshold**.',
      practiceCta: {
        label: 'Pantau Zona +iFVG / -iFVG di Chart Gold',
        description: 'Buka Chart Gold di Mapping Cockpit untuk melihat zona +iFVG (ungu) dan -iFVG (amber) beserta garis 50% CE secara otomatis.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Mekanisme Balik Kutub Inversion FVG (iFVG)',
          paragraphs: [
            'Saat FVG lawan ditembus penuh oleh Body Close pasca-sweep likuiditas atau sentuhan POI HTF, fungsinya berbalik kutub menjadi Inversion FVG (+iFVG atau -iFVG).'
          ]
        }
      ],
      mappingSteps: [
        'Pastikan harga baru saja menyapu kolam likuiditas (BSL/SSL) atau menyentuh POI HTF.',
        'Tandai FVG lawan terakhir di kaki sweep, lalu tunggu candle menutup Body Close menembus penuh seluruh kotak FVG itu.',
        'Gunakan retest ke sisi luar kotak iFVG (atau 50% CE) sebagai titik entry dengan SL di balik ujung sweep.'
      ],
      decisionTree: [
        {
          condition: 'Ekor candle (wick) menembus Bearish FVG, tetapi Body Close kembali di dalam kotak.',
          action: 'Belum menjadi iFVG — jangan entry dulu; tunggu Body Close menembus penuh.'
        },
        {
          condition: 'FVG tertembus penuh di tengah konsolidasi Asia tanpa ada Sweep atau POI HTF.',
          action: 'SKIP — tanpa bahan bakar likuiditas, iFVG di tengah choppy sangat rawan whipsaw.'
        }
      ],
      validRules: [
        'Didahului Sweep likuiditas atau sentuhan POI H1/M15.',
        'FVG lawan ditembus penuh oleh Body Close (bukan sekadar wick).'
      ],
      invalidRules: [
        'Mengambil iFVG di tengah pasar choppy tanpa konteks Sweep/POI HTF.',
        'Masuk sebelum candle penembus FVG selesai tutup (close).'
      ],
      xauScenario: {
        context: 'NY AM 21:10 WITA: Sweep Asia Low 2.644,00 meninggalkan Bearish FVG 2.646,50–2.648,00.',
        steps: [
          'Candle bullish M5 menutup body di 2.649,20 menghancurkan Bearish FVG → sah menjadi Bullish +iFVG.',
          'Retest ke 2.648,00: Buy dengan SL 2.643,40 ($4,60) dan target NY High 2.658,50 (+$10,50, R:R 1:2,28).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: iFVG di Tengah Konsolidasi',
        context: 'Trader mengambil iFVG M5 di jam sepi Asia tanpa sweep dan tanpa arah H1.',
        whyFailed: 'Di pasar sideways, FVG sering ditembus bolak-balik tanpa komitmen institusi.'
      },
      goldenRules: [
        'FVG lawan yang dihancurkan Body Close pasca-sweep = bukti nyata pihak lawan telah menyerah.',
        'Wajib Body Close penuh keluar kotak FVG — bukan sekadar wick.'
      ],
      quiz: [
        {
          question: 'Bagaimana syarat mutlak agar sebuah **Bearish FVG (SIBI)** sah berubah kutub menjadi **Bullish Inversion FVG (`+iFVG`)**?',
          options: [
            'Harga naik menyentuh kotak SIBI lalu jatuh lagi',
            'Setelah **Sweep SSL / sentuhan POI HTF**, candle bullish menutup **Body Close** menembus penuh di atas seluruh kotak SIBI',
            'Hanya ujung wick atas yang menyentuh garis 50% CE',
            'Terbentuk 3 candle merah baru di bawahnya'
          ],
          answerIndex: 1,
          explanation: 'Perubahan kutub iFVG mewajibkan penutupan badan (Body Close) menembus penuh sisi seberang kotak FVG lawan pasca-Sweep/POI.'
        },
        {
          question: 'Mengapa **iFVG** menjadi senjata favorit scalper XAU/USD saat sesi NY AM / Silver Bullet?',
          options: [
            'Karena tidak membutuhkan Stop Loss',
            'Karena memberi pemicu perpindahan order flow yang lebih cepat saat Gold melaju kencang tanpa sempat pullback dalam ke FVG baru',
            'Karena bisa dipakai saat pasar tutup akhir pekan',
            'Karena akurasinya selalu 100% tanpa pernah kena SL'
          ],
          answerIndex: 1,
          explanation: 'Pada momentum cepat XAU/USD, iFVG menangkap pergeseran order flow pasca-sweep lebih awal dibanding menunggu MSS jauh.'
        },
        {
          question: 'Kapan sebuah FVG yang tertembus penuh **TIDAK BOLEH** dieksekusi sebagai sinyal iFVG?',
          options: [
            'Saat muncul tepat setelah sweep Asia Low di NY AM Killzone',
            'Saat muncul di tengah pasar sideways/choppy tanpa latar belakang **Sweep likuiditas** maupun **POI HTF**',
            'Saat searah dengan Daily Bias dan R:R di atas 1:2',
            'Saat terjadi retest bersih di tepi luar kotak iFVG'
          ],
          answerIndex: 1,
          explanation: 'Tanpa Sweep likuiditas atau POI HTF, FVG di area choppy memang sering ditembus bolak-balik tanpa arah institusional.'
        },
        {
          question: 'Dalam studi kasus XAU/USD di atas (`+iFVG` di `2.646,50–2.648,00` pasca-sweep Asia Low `2.643,80`), di mana penempatan Stop Loss paling logis saat masuk Buy di retest `2.648,00`?',
          options: [
            'Di `2.647,90` (jarak `$0,10`)',
            '**Di bawah ujung ekstrem wick sweep** (misal `2.643,40`, memberi ruang napas di bawah `2.643,80`)',
            'Di atas target NY High `2.658,50`',
            'Tidak perlu memasang Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Ujung ekstrem sweep adalah batas invalidasi struktural sejati — jika harga kembali menembusnya, skenario pembalikan resmi batal.'
        }
      ]
    },
    // =========================================================================
    // BAB 26 (BAGIAN V) — MODEL ENTRY ALTERNATIF: iFVG, UNICORN & TURTLE SOUP
    // =========================================================================
    {
      id: 'model-turtle-soup-smr',
      number: 26,
      levelId: 4,
      bookFormat: true,
      title: 'Model Entry Alternatif: iFVG Entry, Unicorn Setup & Turtle Soup (SMR)',
      subtitle: 'Tiga playbook cadangan saat pasar bergerak terlalu kencang untuk pullback FVG biasa atau berbalik tajam langsung dari puncak/dasar likuiditas ekstrem.',
      readMinutes: 10,
      diagramId: 'model-turtle-soup',
      diagramAfterSection: 1,
      summary: 'Kapan memakai model alternatif di luar ICT 2022, perbandingan lengkap iFVG Momentum, ICT Unicorn (Breaker + FVG), dan Turtle Soup (Smart Money Reversal), 3 benteng anti-"tangkap pisau jatuh", serta studi kasus XAU/USD presisi.',
      bookSections: [
        {
          number: '26.1',
          heading: 'Kapan Model Utama (ICT 2022) Tidak Terjemput? Peran 3 Playbook Alternatif',
          paragraphs: [
            'Di Bab 25 kamu sudah menguasai **Model Utama ICT 2022 (`Sweep → MSS/CISD → Retest FVG/OB`)**. Model ini adalah tulang punggung paling jernih bagi 80% hari trading normal. Namun, pasar XAU/USD punya karakter momentum yang kadang sangat agresif: harga menyapu likuiditas, lalu langsung melesat kencang menuju target tanpa pernah mundur cukup dalam untuk menjemput limit order FVG klasik.',
            'Di sinilah kamu mengenal **3 Model Entry Alternatif** yang semuanya tetap dibangun dari fondasi yang sama — **Killzone + HTF Bias + Sweep Likuiditas** — hanya berbeda pada **pemicu eksekusi (*trigger*)** di LTF M5/M1:',
            '• **1. iFVG Momentum Entry:** Memanfaatkan kegagalan FVG lawan yang ditembus penuh oleh *Body Close* (merujuk **Bab 24**) sebagai sinyal perpindahan order flow paling dini.',
            '• **2. ICT Unicorn Setup:** Memanfaatkan pertemuan tumpang-tindih antara **Breaker Block** (Bab 23) dan **Fair Value Gap** (Bab 21) pada satu pita harga sempit untuk akurasi retracement tingkat tinggi.',
            '• **3. Turtle Soup / Smart Money Reversal (SMR):** Menangkap pembalikan ekstrem tepat di luar level likuiditas besar (**PWH/PWL, PDH/PDL, Asia High/Low**) yang berhimpitan dengan POI H1/H4.'
          ]
        },
        {
          number: '26.2',
          heading: 'Peta Perbandingan 3 Model Alternatif: iFVG, Unicorn & Turtle Soup (SMR)',
          paragraphs: [
            'Jangan mencampuradukkan ketiga playbook ini secara serampangan. Setiap model lahir untuk satu kondisi spesifik di chart XAU/USD. Pelajari perbedaan mekanisme, syarat validasi, dan profil risikonya pada tabel di bawah:'
          ],
          table: {
            headers: ['Model Alternatif', 'Kondisi Pasar Ideal', 'Pemicu Entry (Trigger LTF)', 'Risiko Terbesar', 'Tipikal R:R'],
            rows: [
              [
                '**iFVG Momentum Entry**',
                'Momentum NY AM / Silver Bullet kencang; harga tak sempat pullback dalam ke FVG baru',
                'Sweep/POI HTF → FVG lawan ditembus penuh **Body Close** (jadi `+iFVG`/`-iFVG`) → entry di close/retest tipis',
                'Tertipu di pasar *choppy* tengah range tanpa didahului Sweep',
                '`1:2` s.d. `1:3`'
              ],
              [
                '**ICT Unicorn Setup**',
                'Retracement bersih pasca-Sweep & MSS di London atau NY AM Killzone',
                '**Breaker Block** dan **FVG** berada di satu pita harga tumpang-tindih → pasang limit di tepi zona irisan',
                'Setup lebih jarang muncul; trader sering memaksakan garis Breaker palsu',
                '`1:2,5` s.d. `1:4+`'
              ],
              [
                '**Turtle Soup (SMR)**',
                'Harga menusuk level ekstrem **PWH/PWL/PDH/PDL** yang berhimpitan langsung dengan POI H1/H4',
                'Sweep ekstrem → **Absorption Wick** + gagal Body Close di luar → konfirmasi **CISD M5** masuk kembali ke range',
                'Fatal jika nekat entry melawan candle Marubozu raksasa (*menangkap pisau jatuh*)',
                '`1:3` s.d. `1:5+`'
              ]
            ]
          }
        },
        {
          number: '26.3',
          heading: 'Disiplin Ketat Turtle Soup (SMR): Beda Sniper Reversal vs "Menangkap Pisau Jatuh"',
          paragraphs: [
            'Nama **"Turtle Soup"** berasal dari strategi legendaris *Turtle Traders* yang selalu membeli saat harga menembus High 20 periode. Dalam kacamata institusional ICT, **Smart Money Reversal (SMR)** adalah kebalikannya: institusi sengaja mendorong harga menembus High/Low besar untuk memicu *buy-stop/sell-stop* trader breakout, menyerap seluruh likuiditasnya, lalu membalikkan harga tajam menuju sisi range seberang.',
            'Kesalahan paling mematikan pemula yang tergiur R:R `1:5` dari Turtle Soup adalah **langsung menekan Buy/Sell saat candle masih meledak kencang menembus level!** Itu bukan Turtle Soup — itu bunuh diri melawan kereta ekspres. Agar Turtle Soup tetap aman dan terukur, kamu wajib melewati **3 Benteng Keamanan Mutlak**:',
            '• **Benteng 1 — Lokasi Keramat Saja:** Hanya eksekusi di level likuiditas besar (**PWH/PWL**, **PDH/PDL**, atau **Asia High/Low**) yang **berhimpitan langsung dengan POI H1/H4** (OB/FVG HTF). Haram memakai Turtle Soup pada swing kecil acak di tengah range.',
            '• **Benteng 2 — Bukti Penyerapan Nyata (Absorption + CISD):** Wajib melihat ekor penolakan panjang (*Absorption Wick*) yang gagal menutup body di luar level ekstrem, lalu diikuti penutupan candle M5 yang merebut kembali kendali (**CISD M5**).',
            '• **Benteng 3 — Hukum 1 Peluru (*One Bullet Rule*):** Kamu hanya berhak menembak **maksimal 1 kali** di sebuah level ekstrem. Jika Stop Loss tersentuh karena institusi benar-benar mendorong ekspansi lanjutan, terima kenyataan — **dilarang keras** re-entry berkali-kali melawan tren!'
          ]
        },
        {
          number: '26.4',
          heading: 'Studi Kasus Lengkap XAU/USD: Turtle Soup (SMR) di PWL 2.618,00 + H4 Bullish OB',
          paragraphs: [
            'Mari kita bedah angka nyata eksekusi Turtle Soup (SMR) pada XAU/USD di pembukaan **London Silver Bullet (`15:00 WITA` EDT / `03:00 NY`)** dengan konteks **H4 Bullish** yang menyentuh lantai likuiditas mingguan:'
          ],
          exampleBox: {
            title: 'Anatomi Eksekusi Turtle Soup (SMR) XAU/USD — Risiko 1% Terukur',
            rows: [
              {
                label: '1. Peta Lokasi (Benteng 1)',
                detail: 'PWL (Previous Week Low) berada di `2.618,00` dan berhimpitan tepat di dalam **H4 Bullish Order Block** (`2.614,50–2.618,50`). Tidak ada berita Red Folder dalam 60 menit ke depan.'
              },
              {
                label: '2. Sweep & Penyerapan (Benteng 2)',
                detail: 'Pukul `15:05 WITA`, harga menusuk cepat ke `2.616,00` (`$2,00` di bawah PWL), memicu sell-stop breakout, lalu dalam 5 menit ditarik keras ke atas meninggalkan ekor bawah panjang dan menutup body M5 di `2.619,80` (masuk kembali ke atas PWL).'
              },
              {
                label: '3. Konfirmasi CISD & Entry',
                detail: 'Candle M5 berikutnya mengonfirmasi **Bullish CISD** (close di atas Open candle sweep). Trader mengeksekusi **Buy di `2.619,50`**.'
              },
              {
                label: '4. Stop Loss & Target Bertingkat',
                detail: 'SL struktural dipasang di `2.615,20` (buffer `$0,80` di bawah ujung wick `2.616,00`) → risiko = **`$4,30`**. Target **TP1 Asia High `2.630,00`** = **`+$10,50` (`+2,44R`)**. Target **TP2 PDH `2.642,00`** = **`+$22,50` (`+5,23R`)**.'
              }
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Peringatan Emas: Jangan Memakai Unicorn atau Turtle Soup Sebelum Menguasai Model Utama',
            body: 'Model alternatif seperti **iFVG**, **Unicorn**, dan **Turtle Soup (SMR)** adalah penguat presisi — bukan alasan untuk menembak setiap 15 menit. Jika sebuah candle M15 menutup body tebal jauh di luar PDH/PDL tanpa ekor penolakan, itu sinyal ekspansi tren: **batalkan Turtle Soup seketika!**'
          }
        }
      ],
      keyTakeaways: [
        '**iFVG Momentum** dipakai saat harga melesat kencang di NY AM/Silver Bullet tanpa pullback dalam; **ICT Unicorn** adalah pertemuan irisan **Breaker Block + FVG**; **Turtle Soup (SMR)** menangkap pembalikan tepat di ujung likuiditas ekstrem HTF.',
        'Turtle Soup profesional **bukan menangkap pisau jatuh** — wajib memenuhi **3 Benteng**: lokasi keramat (PWH/PWL/PDH/PDL + POI H1/H4), bukti penyerapan (*Absorption Wick* + gagal Body Close + CISD M5), dan **One Bullet Rule**.',
        'Jika candle M15 menutup body penuh dan tebal jauh di luar level likuiditas, itu pertanda breakout kuat — skenario Turtle Soup resmi **BATAL**.'
      ],
      bridgeNext: 'Sekarang di kepalamu sudah ada 4 senjata eksekusi (ICT 2022, iFVG, Unicorn, dan Turtle Soup). Ironisnya, di fase inilah banyak trader justru mulai rugi karena **serakah mencoba memakai keempatnya setiap hari!** Di **Bab 27**, kita akan mengunci **1 Model Fokus** terbaik untukmu dan memasang **5 Bendera Merah (Auto-Skip)** untuk membuang 70% setup jebakan.',
      conceptBlocks: [
        {
          heading: '3 Model Alternatif: iFVG, Unicorn & Turtle Soup (SMR)',
          paragraphs: [
            'Selain Model Utama ICT 2022, trader dapat memakai iFVG saat momentum terlalu cepat untuk retracement, ICT Unicorn saat Breaker Block dan FVG berhimpitan, atau Turtle Soup (SMR) di level likuiditas ekstrem (PWH/PWL/PDH/PDL + POI H1/H4).',
            'Turtle Soup wajib menunggu bukti penolakan nyata (Absorption Wick + gagal Body Close di luar + CISD M5) dan dibatasi 1 peluru per level ekstrem.'
          ]
        }
      ],
      validRules: [
        'Hanya mengeksekusi Turtle Soup di level ekstrem (PWH/PWL, PDH/PDL, Asia High/Low) yang berhimpitan dengan POI H1/H4.',
        'Wajib melihat Absorption Wick + gagal Body Close di luar level + konfirmasi CISD M5 sebelum entry.',
        'Untuk ICT Unicorn, pastikan Breaker Block dan FVG benar-benar saling beririsan pada satu pita harga.'
      ],
      invalidRules: [
        'Langsung melawan candle Marubozu raksasa yang menutup body penuh jauh di luar PDH/PDL.',
        'Mencoba Turtle Soup tepat saat rilis berita merah CPI/NFP/FOMC.',
        'Melakukan re-entry berkali-kali di level yang sama setelah peluru pertama terkena SL.'
      ],
      xauScenario: {
        context: 'XAU/USD menyapu PWL 2.618,00 yang berhimpitan dengan H4 Bullish OB pada London Silver Bullet (15:00 WITA EDT).',
        steps: [
          'Harga menusuk ke 2.616,00 lalu ditarik keras membentuk ekor bawah panjang dan menutup body M5 di 2.619,80.',
          'Candle M5 berikutnya membentuk Bullish CISD; Buy di 2.619,50, SL 2.615,20 ($4,30 risiko).',
          'TP1 Asia High 2.630,00 (+$10,50 / +2,44R) dan TP2 PDH 2.642,00 (+$22,50 / +5,23R).'
        ]
      },
      goldenRules: [
        'Turtle Soup = tunggu bukti gagal breakout + CISD, bukan menebak pucuk saat candle masih terbang.',
        'Maksimal 1 peluru per level ekstrem — jika ditembus, terima tren dan jangan melawan.'
      ],
      practiceCta: {
        label: 'Latih Pola iFVG, Unicorn & Turtle Soup di Practice Arena',
        description: 'Uji ketajaman matamu membedakan pembalikan SMR asli melawan breakout palsu pada skenario XAU/USD interaktif.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Apa komposisi persis dari **ICT Unicorn Setup** yang membuatnya memiliki akurasi retracement sangat tinggi?',
          options: [
            'Persilangan dua garis Moving Average di timeframe M1',
            'Pertemuan tumpang-tindih antara **Breaker Block** dan **Fair Value Gap (FVG)** pada satu pita harga yang sama pasca-Sweep & MSS',
            'Tiga candle Doji berturut-turut di sesi Asia siang',
            'Entry acak 5 menit sebelum berita FOMC'
          ],
          answerIndex: 1,
          explanation: 'Unicorn Setup memadukan dua PD Array kuat — Breaker Block dan FVG — yang saling beririsan pada satu pita harga.'
        },
        {
          question: 'Apa perbedaan paling tegas antara **Turtle Soup (SMR)** profesional dengan tindakan berbahaya "menangkap pisau jatuh"?',
          options: [
            'Turtle Soup memakai ukuran lot 10× lebih besar',
            'Turtle Soup hanya dilakukan di level likuiditas besar + POI H1/H4 dengan bukti penyerapan (**Absorption Wick** + gagal Body Close + **CISD M5**) dan maksimal 1 peluru',
            'Turtle Soup tidak memerlukan Stop Loss',
            'Turtle Soup dilakukan di tengah range sideways setiap 10 menit'
          ],
          answerIndex: 1,
          explanation: 'Lokasi POI HTF, bukti penyerapan + CISD, serta One Bullet Rule memisahkan reversal institusional dari sekadar menebak pucuk.'
        },
        {
          question: 'Harga XAU/USD menembus PDH lalu menutup **body candle M15 penuh dan tebal** jauh di atas PDH tanpa ekor penolakan. Apakah ini sinyal Turtle Soup Sell?',
          options: [
            'Ya, langsung Sell sekarang juga karena sudah terlalu mahal',
            'Bukan — penutupan body kuat menandakan ekspansi lanjutan, sehingga skenario Turtle Soup resmi **BATAL**',
            'Ya, cukup tambah buffer SL $25',
            'Pasang Buy dan Sell bersamaan agar aman'
          ],
          answerIndex: 1,
          explanation: 'Turtle Soup mensyaratkan kegagalan mempertahankan breakout; body close tegas di luar justru bukti kekuatan tren.'
        },
        {
          question: 'Dalam studi kasus Turtle Soup di PWL `2.618,00` (Buy `2.619,50`, SL `2.615,20` = risiko `$4,30`), berapakah rasio **R:R** ketika harga mencapai **TP1 Asia High `2.630,00`** (`+$10,50`)?',
          options: [
            '`+1,00R`',
            '`+2,44R` (`$10,50 ÷ $4,30`)',
            '`+0,50R`',
            '`+8,00R`'
          ],
          answerIndex: 1,
          explanation: 'Jarak profit $10,50 dibagi jarak risiko $4,30 menghasilkan +2,44R — jauh di atas batas minimum 1:2.'
        }
      ]
    },

    // =========================================================================
    // BAB 27 (BAGIAN V) — FILTER SETUP GAGAL & MEMILIH 1 MODEL FOKUS
    // =========================================================================
    {
      id: 'memilih-1-model-dan-filter-gagal',
      number: 27,
      levelId: 4,
      bookFormat: true,
      title: 'Filter Setup Gagal (5 Bendera Merah Auto-Skip) & Memilih 1 Model Fokus',
      subtitle: 'Rahasia konsistensi bukan menghafal 10 strategi, melainkan mengunci 1 model utama untuk 30–50 trade dan membuang 70% setup jebakan sebelum jari menyentuh mouse.',
      readMinutes: 9,
      diagramId: 'model-selection-matrix',
      diagramAfterSection: 1,
      summary: 'Bahaya System Hopping, hukum fokus 1 Model Utama (30–50 trade), matriks pemilihan model sesuai gaya & jam WITA, 5 Bendera Merah (Auto-Skip), audit Grade A+ vs Grade D, dan Checklist 30 Detik (5× YA).',
      bookSections: [
        {
          number: '27.1',
          heading: 'Penyakit "Kolektor Strategi" (System Hopping) & Hukum 1 Model Utama',
          paragraphs: [
            'Kamu baru saja mempelajari empat model eksekusi institusional (ICT 2022, iFVG, Unicorn, dan Turtle Soup). Di titik ini muncul jebakan psikologis paling umum: **penyakit "Kolektor Strategi" (*System Hopping*)**. Setiap kali Model 1 kena Stop Loss dua kali, trader langsung lari ke Model 3; kena SL sekali lagi, pindah ke Turtle Soup; besoknya kembali ke Model 1.',
            'Akibatnya? Data statistik di jurnal menjadi **sampah campur-aduk**. Kamu tidak pernah tahu apakah kerugianmu disebabkan modelnya yang salah, jam tradingnya yang keliru, atau sekadar varians normal 2 loss beruntun.',
            'Terapkan **Hukum 1 Model Utama**: pilih **SATU model saja** dan jalankan secara eksklusif untuk **30 hingga 50 trade pertama** (minimal 20–30 trade di demo/micro). Baru setelah 30–50 data terkumpul bersih, kamu boleh mengevaluasi *Win Rate* & *Expectancy*-nya atau menambahkan maksimal **1 model cadangan**.'
          ]
        },
        {
          number: '27.2',
          heading: 'Matriks Memilih 1 Model Fokus Sesuai Gaya & Jam Tradingmu',
          paragraphs: [
            'Gunakan matriks perbandingan di bawah ini untuk memilih **1 Model Utama** yang paling cocok dengan kepribadian, tingkat kesabaran, dan jadwal luangmu (WITA):'
          ],
          table: {
            headers: ['Model Eksekusi', 'Cocok untuk Gaya Trader', 'Frekuensi Sinyal', 'Jendela Ideal (WITA)', 'Rekomendasi Peran'],
            rows: [
              [
                '**ICT 2022** (`Sweep → MSS → FVG`)',
                'Sabar, suka aturan paling terstruktur, visual bersih & mudah diaudit',
                'Sedang (`3–5×` / minggu)',
                'London KZ (`14:00–17:00` EDT) & NY AM (`19:00–23:00` EDT)',
                '**MODEL UTAMA TERBAIK** untuk 90% trader pemula–menengah'
              ],
              [
                '**iFVG Momentum**',
                'Cepat tanggap, fokus di NY AM Silver Bullet saat Gold meluncur kencang',
                'Sedang–Tinggi (`4–6×` / minggu)',
                'NY AM Silver Bullet (`22:00–23:00` EDT)',
                'Cadangan #1 jika sering ketinggalan retracement FVG'
              ],
              [
                '**ICT Unicorn** (`Breaker + FVG`)',
                'Sangat sabar, mengutamakan kualitas sniper jarang tapi tajam',
                'Rendah (`1–3×` / minggu)',
                'London KZ & NY AM KZ',
                'Upgrade presisi dari ICT 2022 saat zona beririsan'
              ],
              [
                '**Turtle Soup (SMR)**',
                'Berpengalaman, disiplin besi, tahan tekanan saat menyentuh level ekstrem',
                'Rendah (`1–2×` / minggu)',
                'Pembukaan London & NY di **PWH/PWL/PDH/PDL**',
                'Khusus tingkat lanjut (setelah lulus 50 trade Model Utama)'
              ]
            ]
          }
        },
        {
          number: '27.3',
          heading: '5 Bendera Merah (Auto-Skip) yang Membatalkan Setup Seketika',
          paragraphs: [
            'Mengetahui *kapan harus masuk* baru separuh permainan. Separuh sisanya yang menyelamatkan akun dari kehancuran adalah mengetahui **kapan WAJIB MENOLAK**. Sebelum mengklik Buy/Sell pada model mana pun, cek **5 Bendera Merah** ini. Jika **SATU SAJA** menyala merah, tutup jari dan lewati tanpa kompromi:',
            '• **Bendera Merah 1 — Harga di Tengah Range (`40%–60%` Equilibrium) Tanpa Sweep:** Tidak ada likuiditas segar yang baru disapu; peluang terjebak gergaji dua arah sangat tinggi.',
            '• **Bendera Merah 2 — Entry Menabrak POI H1/H4 Lawan:** Misalnya kamu mau Buy M5 padahal harga baru saja menyentuh H4 Bearish Order Block atau PDH. Jangan menabrak tembok beton HTF!',
            '• **Bendera Merah 3 — Di Dalam Jendela News Lock (`-15 menit` s.d. `+30 menit`):** Menjelang/tepat saat rilis berita merah USD (CPI, NFP, FOMC — merujuk **Bab 17**), spread melebar dan slippage bisa melompati Stop Loss.',
            '• **Bendera Merah 4 — R:R ke Target Likuiditas Terdekat `< 1:1,8`:** Risiko terlalu besar dibanding ruang gerak yang tersisa ke tembok likuiditas terdekat (merujuk **Bab 04**).',
            '• **Bendera Merah 5 — Batas Loss Harian (`2× SL` / `-2%`) Sudah Tercapai:** Emosi mulai bergeser ke mode balas dendam (*revenge trading*). Pasar tetap buka besok — akhiri sesi sekarang!'
          ]
        },
        {
          number: '27.4',
          heading: 'Audit Nyata Grade A+ vs Grade D + Checklist 30 Detik (Wajib 5× YA)',
          paragraphs: [
            'Bandingkan dua skenario nyata XAU/USD berikut agar insting penyaringanmu tajam seketika, lalu tempelkan **Checklist 30 Detik** di samping layar sebelum setiap klik:'
          ],
          exampleBox: {
            title: 'Perbandingan Audit Setup: Grade A+ (Eksekusi) vs Grade D (Auto-Skip)',
            rows: [
              {
                label: 'Kasus A — Grade A+ (EKSEKUSI)',
                detail: 'Pukul `15:20 WITA` (London KZ) · Bias H1 Bullish · Ada Sweep Asia Low + MSS M5 + Bullish FVG bersih di zona Discount · Tidak ada berita merah · Target ke PDH memberi R:R `1:2,6` → **5× YA, Eksekusi sesuai lot 1%!**'
              },
              {
                label: 'Kasus B — Grade D (AUTO-SKIP!)',
                detail: 'Ada FVG M5 yang terlihat rapi, TETAPI berada tepat di tengah range (`52%`), tanpa didahului Sweep, 10 menit lagi rilis CPI USD, dan ruang ke resistance terdekat hanya R:R `1:1,1` → **3 Bendera Merah menyala! Tulis "NO SETUP" dan lewati.**'
              },
              {
                label: 'Checklist 30 Detik (Wajib 5× YA)',
                detail: '(1) Sedang di dalam Killzone & bebas News Lock? (2) Searah Bias/DOL HTF & tidak menabrak POI lawan? (3) Sudah ada Sweep nyata (bukan tengah range)? (4) Trigger model utamaku valid & R:R ≥ `1:2`? (5) Belum kena batas `2× SL` hari ini? → **Ada 1 "TIDAK" = BATAL.**'
              }
            ]
          },
          callout: {
            tone: 'tip',
            title: 'Standar Trader Profesional: Menulis "NO SETUP" Adalah Kemenangan',
            body: 'Banyak pemula merasa hari itu "gagal" jika tidak menekan tombol entry. Padahal, kualitas seorang trader institusional justru diukur dari **berapa banyak setup Grade C/D yang berhasil ia tolak**. Melindungi modal di hari buruk adalah syarat mutlak agar kamu masih punya peluru di hari Grade A+.'
          }
        }
      ],
      keyTakeaways: [
        'Hindari **System Hopping** — kunci **1 Model Utama** (rekomendasi terbaik: **ICT 2022**) selama **30–50 trade** agar data Win Rate & Expectancy di jurnal murni dan bisa diaudit.',
        'Patuhi **5 Bendera Merah (Auto-Skip)**: tengah range tanpa sweep, menabrak POI H1/H4 lawan, jendela News Lock (`-15m/+30m`), R:R `< 1:1,8`, atau sudah terkena `2× SL` hari ini.',
        'Jalankan **Checklist 30 Detik (`5× YA`)** sebelum menekan tombol — jika ada satu saja jawaban "TIDAK", lewati setup tanpa penyesalan.'
      ],
      bridgeNext: 'Kamu sekarang sudah tahu **model mana** yang kamu pilih dan **setup buruk mana** yang wajib kamu tolak. Kini tiba fase paling krusial saat pelatuk siap ditarik: **di mana persisnya meletakkan Stop Loss agar tidak tersapu napas spread, dan di mana menaruh TP1/TP2 secara struktural?** Mari masuk ke **Bab 28: Stop Loss Struktural, Napas Spread & Target Likuiditas Bertingkat (TP1/TP2)**.',
      conceptBlocks: [
        {
          heading: '1 Model Fokus & 5 Bendera Merah (Auto-Skip)',
          paragraphs: [
            'Tetapkan 1 Model Utama (disarankan ICT 2022) untuk 30–50 trade pertama agar statistik jurnal murni dan terhindar dari System Hopping.',
            'Skip seketika jika muncul salah satu dari 5 Bendera Merah: tengah range tanpa sweep, menabrak POI H1/H4 lawan, dalam jendela News Lock, R:R < 1:1,8, atau sudah kena 2× SL hari ini.'
          ]
        }
      ],
      validRules: [
        'Tetapkan 1 Model Utama untuk 30–50 trade pertama agar data statistik di Jurnal murni.',
        'Pastikan seluruh Checklist 30 Detik (5× YA) terpenuhi sebelum menekan tombol entry.',
        'Berani menulis "NO SETUP" di jurnal saat kondisi pasar tidak memenuhi kriteria.'
      ],
      invalidRules: [
        'Ganti-ganti model setiap kali mengalami 1–2 kali Stop Loss (System Hopping).',
        'Memaksakan validasi dengan mencocok-cocokkan istilah ICT agar tetap bisa entry.',
        'Masuk di setup Grade C/D hanya karena bosan menunggu di depan layar.'
      ],
      xauScenario: {
        context: 'Komparasi cepat audit setup Grade A+ vs Grade D pada XAU/USD.',
        steps: [
          'Kasus A: Sweep Asia Low + MSS M5 + FVG bersih di Discount + H1 Bullish + bebas news + R:R 1:2,6 → Grade A+ (Eksekusi).',
          'Kasus B: FVG M5 di tengah range 52%, tanpa sweep, 10 menit sebelum CPI, R:R 1:1,1 → Grade D (AUTO-SKIP).'
        ]
      },
      goldenRules: [
        'Satu setup Grade A+ yang dikuasai luar dalam jauh lebih kaya daripada 10 setup setengah paham.',
        'Kualitas seorang scalper diukur dari setup jelek yang berhasil ia tolak.'
      ],
      practiceCta: {
        label: 'Uji Filter 5 Bendera Merah di Cockpit Mapping',
        description: 'Gunakan Cockpit Mapping untuk menyaring kondisi sesi, News Lock, dan POI HTF secara otomatis sebelum mengambil keputusan entry.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Mengapa kamu diwajibkan mengunci **1 Model Utama** minimal **30–50 trade** sebelum menilai atau menggantinya?',
          options: [
            'Karena aturan broker melarang mengganti indikator sebelum 30 hari',
            'Agar data statistik **Win Rate** dan **Expectancy** murni serta valid secara probabilitas, bebas dari bias emosi (*System Hopping*) akibat 1–2 kali loss',
            'Supaya bisa menghafal semua warna lilin di chart',
            'Karena model lain hanya bekerja di hari Jumat'
          ],
          answerIndex: 1,
          explanation: 'Keunggulan statistik baru terlihat pada sampel memadai; berpindah model setiap kena 2 SL menghancurkan konsistensi data.'
        },
        {
          question: 'Manakah kondisi berikut yang memicu **Bendera Merah (AUTO-SKIP)** meskipun ada kotak FVG M5 yang terlihat rapi?',
          options: [
            'Muncul di London Killzone setelah sweep Asia Low searah Bias H1',
            'Muncul **10 menit sebelum rilis CPI USD**, berada di tengah range tanpa sweep, dan R:R ke target terdekat hanya `1:1,1`',
            'Berada di zona Discount OTE dengan ruang R:R `1:2,5`',
            'Memiliki Stop Loss struktural yang rapi di bawah wick sweep'
          ],
          answerIndex: 1,
          explanation: 'Jendela News Lock, posisi tengah range tanpa sweep, dan R:R < 1:1,8 adalah bendera merah mutlak.'
        },
        {
          question: 'Jika kamu sering tertinggal retracement FVG saat momentum **NY AM Silver Bullet** meluncur kencang, model cadangan mana yang paling tepat dipelajari setelah lulus Model Utama?',
          options: [
            '**iFVG Momentum Entry** pasca-sweep',
            'Averaging martiangle tanpa Stop Loss',
            'Trading acak saat jam rollover subuh',
            'Menebak pucuk melawan candle berita NFP'
          ],
          answerIndex: 0,
          explanation: 'iFVG Momentum dirancang khusus menangkap pergeseran order flow cepat tanpa menunggu pullback dalam.'
        },
        {
          question: 'Saat menjalankan **Checklist 30 Detik (`5× YA`)**, ternyata 4 poin menjawab YA tetapi 1 poin menjawab **TIDAK** (entry tepat menabrak H4 Bearish Order Block). Keputusan profesionalnya adalah...',
          options: [
            'Tetap masuk dengan lot setengahnya karena sudah 4 dari 5 syarat terpenuhi',
            '**SKIP / BATAL** — satu bendera merah atau satu jawaban "TIDAK" cukup untuk membatalkan setup tanpa kompromi',
            'Tetap masuk lalu menghapus Stop Loss agar tidak tersentuh',
            'Membalikkan posisi menjadi Sell secara spontan tanpa analisis'
          ],
          answerIndex: 1,
          explanation: 'Checklist bersifat gerbang AND (wajib semua terpenuhi); menabrak POI HTF lawan adalah jebakan probabilitas rendah.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
