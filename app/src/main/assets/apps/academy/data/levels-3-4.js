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
      summary: 'Pengertian Displacement sebagai syarat validasi FVG, Order Block, dan MSS, tabel 4 parameter objektif, 4 langkah evaluasi praktis, studi kasus perbandingan angka XAU/USD saat mengejar ujung candle vs menunggu retracement, serta 3 pengecualian candle besar.',
      bookSections: [
        {
          number: '18.1',
          heading: 'Pengertian Displacement dan Perannya dalam Zona Entry ICT',
          shortTitle: 'Pengertian Displacement',
          paragraphs: [
            'Pada Bagian II dan Bagian III, Anda telah mempelajari struktur pasar, pemetaan Liquidity, Draw on Liquidity (DOL), Daily Bias, siklus AMD, jadwal Killzone WITA, serta Protokol News Lock. Mulai Bagian IV ini, fokus kita beralih ke komponen penentu area entry dalam ICT (**PD Arrays**), diawali dari syarat terpentingnya: **Displacement**.',
            '**Displacement** adalah dorongan harga yang cepat, tegas, dan satu arah yang dibentuk oleh **1 hingga 3 candle berbadan dominan** (*strong body*) dengan sedikit perlawanan, yang **menembus level struktur penting** sekaligus **meninggalkan celah ketidakseimbangan harga (Fair Value Gap / FVG)**.',
            'Tanpa Displacement, penembusan level struktur atau pantulan harga cenderung lemah dan mudah gagal. Karena itu, dalam metodologi ICT, keberadaan Displacement menjadi saringan awal sebelum Anda menandai FVG, Inversion FVG, Order Block, Breaker Block, maupun Market Structure Shift (MSS).'
          ]
        },
        {
          number: '18.2',
          heading: 'Empat Parameter Objektif: Displacement Valid vs Pergerakan Lemah',
          shortTitle: 'Parameter Displacement Valid',
          paragraphs: [
            'Agar Anda tidak menandai sembarang candle panjang sebagai Displacement, gunakan **4 parameter objektif** berikut untuk membedakan dorongan institusi yang sah dari pergerakan merayap:'
          ],
          table: {
            caption: 'Perbandingan Objektif: Displacement Valid vs Pergerakan Lemah (Skip)',
            headers: ['Parameter Evaluasi', 'Displacement Valid', 'Pergerakan Lemah / Merayap (Skip)', 'Makna Teknis'],
            rows: [
              ['Proporsi Body Candle', 'Body dominan (`≥ 65%` dari tinggi candle) dan `1,5×–2×` lebih besar daripada rata-rata candle konsolidasi sebelumnya', 'Deretan 5–8 candle kecil saling bertumpuk dengan banyak wick atas dan bawah', 'Menunjukkan masuknya order institusi secara serentak, bukan pergerakan ragu-ragu'],
              ['Celah Harga (FVG)', 'Wajib meninggalkan celah kosong (**Fair Value Gap** — dibahas pada Bab 19) di belakang dorongan', 'Tidak meninggalkan celah; setiap candle langsung ditutup penuh oleh candle berikutnya', 'Perubahan harga berlangsung sangat cepat sehingga order lawan belum sempat terisi penuh'],
              ['Dampak Struktur', 'Langsung menembus Swing High/Low (`BOS` / `MSS`) atau harga Open rangkaian candle lawan (`CISD` — Bab 23)', 'Bergerak bolak-balik di dalam rentang lama tanpa mematahkan level struktur penting', 'Membuktikan komitmen nyata untuk menggeser harga menuju target DOL'],
              ['Konteks Lokasi & Waktu', 'Muncul setelah **Liquidity Sweep** atau sentuhan **POI HTF** di dalam jam **Killzone**', 'Muncul acak di tengah konsolidasi sepi sesi Asia tanpa pemicu Liquidity', 'Likuiditas lawan sudah terserap sebelum fase ekspansi dijalankan']
            ]
          }
        },
        {
          number: '18.3',
          heading: 'Empat Langkah Praktis Memverifikasi Displacement di Chart',
          shortTitle: '4 Langkah Verifikasi',
          paragraphs: [
            'Saat melihat lonjakan candle di XAU/USD pada timeframe M15 atau M5, jangan langsung bereaksi. Jalankan urutan pengecekan 4 langkah berikut secara disiplin:',
            '1. **Cek Pemicu & Jam Sesi:** Pastikan dorongan muncul setelah harga menyapu level Liquidity penting (Asia High/Low, PDH/PDL, atau swing terdekat) atau menyentuh POI HTF, serta berada di dalam jendela **Killzone** (bukan di luar jam aktif atau detik rilis berita).',
            '2. **Periksa Proporsi & Ukuran Candle:** Pastikan minimal ada 1–3 candle berbadan dominan (`≥ 65%` dari total tinggi candle) yang ukurannya `1,5×–2×` lebih besar dibandingkan candle konsolidasi sebelumnya.',
            '3. **Pastikan Ada Pematahan Struktur + FVG:** Konfirmasi bahwa dorongan tersebut benar-benar memecah Swing High/Low (`BOS`/`MSS`) atau batas `CISD` dan meninggalkan celah **Fair Value Gap (FVG)** yang jelas di belakangnya.',
            '4. **Tandai Zona Retracement, Bukan Ujung Candle:** Setelah ketiga syarat di atas terpenuhi, tandai area FVG atau Order Block yang lahir dari kaki Displacement tersebut untuk menunggu koreksi (*retracement*).'
          ]
        },
        {
          number: '18.4',
          heading: 'Alasan Teknis Tidak Mengejar Ujung Candle Displacement',
          shortTitle: 'Risiko Mengejar Ujung Candle',
          paragraphs: [
            'Kesalahan yang paling sering terjadi setelah trader mengenali Displacement adalah langsung menekan **Market Order** di ujung candle besar yang sudah berlari `$7–$10` karena khawatir tertinggal pergerakan.',
            'Prinsip baku ICT sangat jelas: **Displacement bertugas mengonfirmasi arah, sedangkan retracement (koreksi kembali ke FVG atau Order Block) memberikan harga masuk dan rasio Risk-to-Reward (`R:R`) yang sehat.** Perhatikan perbandingan angka nyata pada XAU/USD di bawah ini:'
          ],
          exampleBox: {
            title: 'Studi Kasus XAU/USD: Market Entry di Ujung Candle vs Buy Limit di FVG',
            rows: [
              {
                label: 'Kondisi Chart (M5 Sesi London · 15:20 WITA / 14:20 WIB)',
                detail: 'XAU/USD melakukan sweep Asia Low di `2.642,00`. Muncul 2 candle bullish M5 tebal yang naik cepat dari `2.642,00` ke `2.649,00` (`+$7,00` dalam 10 menit), memecah Swing High `2.646,50` dan meninggalkan Bullish FVG di `2.644,00 – 2.646,50`. Target DOL berada di Asia High `2.656,00`.'
              },
              {
                label: 'Trader A (Market Buy di Ujung Candle 2.649,00)',
                detail: 'Masuk di `2.649,00` dengan SL struktural di bawah titik sweep `2.641,50` → jarak risiko melebar menjadi **`$7,50`**. Jarak ke target `2.656,00` hanya tersisa **`$7,00`** → R:R turun menjadi **1 : 0,93** (risiko lebih besar daripada potensi profit) dan akun langsung terkena *floating* minus saat pullback wajar.'
              },
              {
                label: 'Trader B (Buy Limit di Area FVG 2.645,50)',
                detail: 'Menunggu koreksi dengan memasang Buy Limit di tengah FVG `2.645,50` dan SL struktural yang sama di `2.641,50` → jarak risiko hanya **`$4,00`**. Jarak ke target `2.656,00` menjadi **`+$10,50`** → R:R meningkat tajam menjadi **1 : 2,62**.'
              }
            ]
          }
        },
        {
          number: '18.5',
          heading: 'Tiga Pengecualian: Candle Besar yang Bukan Sinyal Entry Displacement',
          shortTitle: '3 Pengecualian Candle Besar',
          paragraphs: [
            'Tidak setiap candle berukuran besar di XAU/USD layak diperlakukan sebagai Displacement untuk membuka posisi. Saring terlebih dahulu **3 pengecualian** berikut:',
            '1. **Candle Detik Rilis Berita High Impact USD (CPI / NFP / FOMC):** Lonjakan `$15` dalam 1 menit saat rilis data ekonomi dipicu kekosongan likuiditas sesaat (*whipsaw* dan *spread spike*). Patuhi **Protokol News Lock** pada Bab 17: tunggu 15–30 menit hingga volatilitas dan spread kembali normal sebelum menilai struktur baru.',
            '2. **Candle Tunggal di Tengah Konsolidasi Asia Tanpa Sweep:** Satu candle agak panjang pada jam sepi (misalnya pukul `10:30 WITA` / `09:30 WIB`) tanpa didahului Liquidity Sweep dan tanpa konteks HTF umumnya cepat kehilangan momentum lalu kembali ke tengah rentang.',
            '3. **Exhaustion Move (Dorongan Akhir Tepat Menabrak Target DOL):** Jika harga sudah bergerak searah sejauh `$25` sepanjang sesi lalu mencetak satu candle besar yang langsung menyentuh target `PDH/PWH`, pergerakan tersebut cenderung menjadi fase akhir ekspansi (*exhaustion*) dan rawan diikuti pembalikan arah.'
          ],
          callout: {
            tone: 'warn',
            kicker: 'Aturan Inti Bagian IV',
            title: 'Tidak Ada Displacement = Tidak Ada Zona Entry Berkualitas',
            body: 'Jadikan Displacement sebagai saringan pertama di seluruh materi Bagian IV. Sebelum menandai FVG, Inversion FVG, Order Block, Breaker Block, atau MSS, pastikan selalu: **apakah zona tersebut benar-benar lahir dari Displacement yang bersih?**'
          }
        }
      ],
      keyTakeaways: [
        '**Displacement** adalah dorongan tegas 1–3 candle berbadan dominan (`≥ 65%` body, `1,5×–2×` candle konsolidasi) yang memecah struktur dan wajib meninggalkan **Fair Value Gap (FVG)**.',
        'Pergerakan merayap dengan banyak candle kecil bertumpuk tanpa FVG menandakan lemahnya komitmen institusi dan sebaiknya dilewati (*skip*).',
        '**Jangan mengejar ujung candle Displacement:** biarkan Displacement mengonfirmasi arah, lalu tunggu koreksi (*retracement*) ke area FVG/OB agar jarak SL ringkas dan R:R minimal `1:2`.',
        'Saring 3 pengecualian candle besar: lonjakan detik rilis berita High Impact USD (patuhi News Lock), candle acak di sesi Asia tanpa sweep, dan *exhaustion move* tepat di target DOL.'
      ],
      bridgeNext: 'Ciri paling khas dari Displacement yang sah adalah celah harga tiga candle yang tertinggal di belakangnya. Cara menggambar, mengukur, dan memilih celah tersebut dibahas tuntas pada **Bab 19: Fair Value Gap (BISI/SIBI), 50% Consequent Encroachment & Memilih Multi-FVG**.',
      practiceCta: {
        label: 'Amati Displacement Live di Chart Gold',
        description: 'Buka Chart Gold M5/M15 di Mapping Cockpit dan bedakan candle dorongan dominan yang mencetak FVG dari deretan candle merayap.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Displacement Sebagai Syarat Validasi Zona ICT',
          paragraphs: [
            'Displacement adalah dorongan 1–3 candle berbadan dominan (≥ 65% body) yang memecah struktur dan meninggalkan Fair Value Gap (FVG) pasca-sweep Liquidity atau sentuhan POI HTF.'
          ]
        }
      ],
      mappingSteps: [
        'Pastikan harga baru saja melakukan Liquidity Sweep (Asia/PDH/PDL) atau menyentuh POI HTF di dalam jam Killzone.',
        'Verifikasi 1–3 candle berbadan dominan (≥ 65% body, 1,5×–2× candle konsolidasi) yang menembus struktur terdekat dan mencetak celah FVG.',
        'Jangan kejar ujung candle; tandai FVG atau Order Block yang lahir di belakang Displacement untuk rencana entry pullback.'
      ],
      decisionTree: [
        {
          condition: 'Harga menembus Swing High dengan 6 candle kecil saling tumpang tindih tanpa FVG.',
          action: 'SKIP — tidak ada Displacement yang sah; penembusan merayap sangat rentan gagal.'
        },
        {
          condition: 'Muncul candle besar $15 tepat pada menit rilis US CPI pukul 20:30 WITA (19:30 WIB).',
          action: 'Patuhi Protokol News Lock (-15m s.d. +30m); jangan langsung menganggap lonjakan rilis berita sebagai sinyal Displacement untuk dikejar.'
        }
      ],
      validRules: [
        'Body candle dominan ≥ 65% dan berukuran 1,5×–2× lebih besar dari candle konsolidasi sebelumnya.',
        'Meninggalkan Fair Value Gap (FVG) yang bersih serta memecahkan level struktur (BOS/MSS/CISD) di dalam konteks Killzone.'
      ],
      invalidRules: [
        'Penembusan merayap tanpa FVG atau muncul acak di tengah konsolidasi Asia tanpa Liquidity Sweep.',
        'Mengejar Market Order di ujung candle Displacement yang sudah bergerak jauh sehingga memperlebar jarak SL.'
      ],
      xauScenario: {
        context: 'Sesi London (15:20 WITA / 14:20 WIB): Sweep Asia Low 2.642,00 diikuti 2 candle M5 bullish dominan ke 2.649,00 mencetak FVG 2.644,00–2.646,50.',
        steps: [
          'Konfirmasi 3 bukti Displacement terpenuhi (body ≥ 65%, pecah swing 2.646,50, terbentuk FVG bersih).',
          'Pasang Buy Limit di 2.645,50 dengan SL struktural 2.641,50 ($4,00) menuju target Asia High 2.656,00 (R:R 1 : 2,62).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Entry di Ujung Candle Displacement',
        context: 'Trader membuka Market Buy di 2.649,00 tepat di ujung candle Displacement tanpa menunggu pullback.',
        whyFailed: 'SL melebar menjadi $7,50 sementara sisa target hanya $7,00 (R:R 1 : 0,93) dan posisi langsung mengalami floating minus saat harga melakukan pullback normal ke FVG.'
      },
      goldenRules: [
        'Tidak ada Displacement = Tidak ada zona entry berkualitas = Tidak ada transaksi.',
        'Displacement mengonfirmasi arah; retracement memberikan harga masuk dan R:R yang terukur.'
      ],
      quiz: [
        {
          question: 'Manakah 3 bukti visual wajib yang menunjukkan sebuah pergerakan memiliki **Displacement** institusi yang sah?',
          options: [
            'Deretan 6 candle doji kecil + banyak wick + muncul di luar Killzone',
            'Candle berbadan dominan (`≥ 65%` body) + meninggalkan celah **Fair Value Gap (FVG)** + memecah level struktur (`BOS`/`MSS`/`CISD`)',
            'Satu candle hijau di sesi Asia meskipun tidak meninggalkan FVG',
            'Indikator osilator menyentuh area jenuh beli'
          ],
          answerIndex: 1,
          explanation: 'Displacement yang sah selalu meninggalkan tiga jejak serentak: body candle dominan (≥ 65%), celah Imbalance (FVG), dan pematahan level struktur.'
        },
        {
          question: 'Harga XAU/USD menembus Swing High M5 dengan 7 candle kecil merayap yang saling bertumpuk tanpa meninggalkan FVG. Apa keputusan trader ICT yang tepat?',
          options: [
            'Langsung membuka Market Buy karena level sudah tertembus',
            'Melewati setup (*Skip*) karena pergerakan merayap tanpa Displacement menunjukkan komitmen institusi yang lemah dan rawan gagal',
            'Menggandakan ukuran lot agar cepat mencapai target',
            'Menghapus Stop Loss agar tidak mudah tersentuh'
          ],
          answerIndex: 1,
          explanation: 'Tanpa Displacement dan FVG, penembusan yang merayap menandakan dorongan lemah yang sangat rentan berbalik arah.'
        },
        {
          question: 'Setelah sweep Asia Low `2.642,00`, XAU/USD naik dengan Displacement ke `2.649,00` (FVG di `2.644,00–2.646,50`, target Asia High `2.656,00`). Mengapa kita menunggu pullback ke FVG alih-alih mengejar Market Buy di `2.649,00`?',
          options: [
            'Karena MT5 tidak mendukung Market Buy saat sesi London',
            'Karena mengejar di ujung candle memperlebar SL menjadi `$7,50` dan merusak R:R (`1 : 0,93`), sedangkan menunggu pullback ke FVG menekan risiko menjadi `$4,00` dengan R:R `1 : 2,62`',
            'Karena harga tidak pernah melanjutkan tren setelah Displacement',
            'Karena FVG hanya berlaku menjelang penutupan hari Jumat'
          ],
          answerIndex: 1,
          explanation: 'Displacement mengonfirmasi arah, sementara retracement ke FVG/OB memberikan titik entry berisiko sempit dengan rasio R:R jauh lebih sehat.'
        },
        {
          question: 'Manakah candle besar berikut yang **TIDAK** boleh langsung diperlakukan sebagai sinyal entry Displacement normal?',
          options: [
            'Dorongan M5 dominan pasca-sweep Asia Low di sesi London yang mencetak MSS + FVG',
            'Lonjakan `$15` tepat pada menit rilis berita High Impact **US CPI / NFP** (*whipsaw* berita) atau dorongan akhir (*exhaustion move*) yang langsung menabrak target `PDH/PWH`',
            'Dorongan M15 bersih setelah harga menyentuh H1 Order Block di NY AM Killzone',
            'Dorongan 2 candle dominan pasca-sweep PDL pada jendela Silver Bullet'
          ],
          answerIndex: 1,
          explanation: 'Lonjakan detik rilis berita High Impact USD berada dalam jendela News Lock (rawan whipsaw/slippage), sedangkan dorongan di ujung target DOL sering berupa exhaustion move.'
        }
      ]
    },
    {
      id: 'fvg-bisi-sibi-ce-50',
      number: 19,
      levelId: 3,
      title: 'Fair Value Gap (BISI/SIBI), 50% Consequent Encroachment & Memilih Multi-FVG',
      readMinutes: 10,
      diagramId: 'fvg-ce-anatomy',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Anatomi 3 candle BISI & SIBI beserta batas ukuran realistis XAU/USD, pengukuran presisi 50% Consequent Encroachment (CE), klasifikasi 4 jenis FVG, 4 langkah praktis memilih Multi-FVG, serta studi kasus XAU/USD sesi London.',
      bookSections: [
        {
          number: '19.1',
          heading: 'Pengertian Fair Value Gap (FVG) dan Anatomi 3 Candle (BISI & SIBI)',
          shortTitle: 'Anatomi BISI & SIBI',
          paragraphs: [
            '**Fair Value Gap (FVG)** adalah celah ketidakseimbangan harga (*Imbalance*) yang terbentuk ketika dorongan **Displacement** (Bab 18) bergerak terlalu cepat ke satu arah, sehingga hanya satu sisi transaksi (beli saja atau jual saja) yang terisi pada rentang harga tersebut.',
            'Secara mekanis, setiap Fair Value Gap selalu diidentifikasi dari **3 batang candlestick berurutan** (`Candle 1`, `Candle 2` sebagai batang Displacement tengah, dan `Candle 3`):',
            '1. **Bullish FVG — BISI** (*Buyside Imbalance, Sellside Inefficiency*): Terbentuk saat dorongan naik tegas. Celah diukur dari **High (ujung wick atas) Candle 1** hingga **Low (ujung wick bawah) Candle 3**. Ketika harga terkoreksi turun kembali ke celah ini, BISI berpotensi menjadi area penopang untuk melanjutkan kenaikan.',
            '2. **Bearish FVG — SIBI** (*Sellside Imbalance, Buyside Inefficiency*): Terbentuk saat dorongan turun tegas. Celah diukur dari **Low (ujung wick bawah) Candle 1** hingga **High (ujung wick atas) Candle 3**. Ketika harga terkoreksi naik ke celah ini, SIBI berpotensi menjadi area penolakan untuk melanjutkan penurunan.',
            'Khusus pada XAU/USD timeframe M5–M15, pastikan lebar celah FVG bernilai realistis (minimal sekitar **`$0,80 – $1,00`**), bukan celah mikro tipis `$0,10` yang sekadar kebisingan grafik.'
          ]
        },
        {
          number: '19.2',
          heading: 'Garis 50% Consequent Encroachment (CE): Mengukur Validitas Reaksi FVG',
          shortTitle: 'Garis 50% CE FVG',
          paragraphs: [
            'Untuk menilai secara objektif apakah sebuah kotak FVG masih **dihormati** atau mulai **kehilangan fungsi**, metodologi ICT menggunakan garis titik tengah `50%` dari tinggi kotak FVG yang disebut **Consequent Encroachment (CE)**.',
            '**Rumus Eksak CE:** `CE = (Batas Atas FVG + Batas Bawah FVG) ÷ 2`. Sebagai contoh, jika sebuah Bullish FVG (BISI) memiliki batas bawah `2.644,00` (`High C1`) dan batas atas `2.648,00` (`Low C3`), maka garis **50% CE** berada tepat di **`2.646,00`**.',
            '**Cara Membaca Reaksi Harga terhadap 50% CE:**',
            '1. **Mantul di Tepi Depan:** Harga hanya menyentuh tepi awal FVG lalu segera melanjutkan tren — menandakan momentum arah masih sangat kuat.',
            '2. **Wick Menyentuh atau Sedikit Melewati CE, Body Close Tetap Menghormati:** Kondisi FVG masih **valid kuat**. Selama penutupan badan candle (*Body Close*) tetap bertahan di sisi sehat garis 50% CE, struktur FVG masih aktif.',
            '3. **Body Close Menembus Penuh Keluar Sisi Belakang Kotak:** Fungsi awal FVG dinyatakan **gagal** dan berpotensi berbalik peran menjadi **Inversion FVG (iFVG)** yang akan dibahas pada Bab 20.'
          ]
        },
        {
          number: '19.3',
          heading: 'Klasifikasi Peran FVG dan Aturan Memilih Saat Muncul Multi-FVG',
          shortTitle: 'Jenis FVG & Multi-FVG',
          paragraphs: [
            'Dalam satu kaki dorongan XAU/USD, sering terbentuk 2 hingga 3 kotak FVG sekaligus (bagian atas, tengah, dan bawah). Agar Anda tidak bingung memilih kotak mana yang layak dijadikan prioritas, pahami **4 klasifikasi FVG** beserta keputusan teknisnya pada tabel berikut:'
          ],
          table: {
            caption: 'Klasifikasi Peran FVG dan Prioritas Pemilihan Multi-FVG',
            headers: ['Jenis / Posisi FVG', 'Lokasi pada Kaki Dorongan', 'Karakter Reaksi di XAU/USD', 'Keputusan Teknis'],
            rows: [
              ['Breakaway Gap', 'FVG pertama yang keluar langsung dari area sweep atau konsolidasi awal', 'Sering **tidak diisi penuh**; harga kadang hanya menyentuh tepi depannya lalu melanjutkan ekspansi', 'Jika momentum sangat kuat, pantau reaksi pada tepi depan tanpa memaksakan pengisian 100%'],
              ['Measuring Gap (Mid-Leg)', 'FVG di sekitar **pertengahan (40%–60%)** jarak ekspansi menuju DOL', 'Sering berperan sebagai titik tengah proyeksi pergerakan dan dihormati pada tepi atau garis 50% CE', 'Valid dipertimbangkan bila tetap berada di sisi **Discount** (Buy) atau **Premium** (Sell)'],
              ['Discount / Origin FVG (Multi-FVG)', 'FVG terdalam di bawah 50% (**Discount** untuk Buy) atau di atas 50% (**Premium** untuk Sell) dekat OB/OTE', 'Memberikan harga masuk paling efisien dengan jarak SL lebih ringkas dan rasio R:R tertinggi', '**Prioritas #1** saat muncul 2–3 FVG. FVG dangkal di sisi yang salah (misalnya FVG Buy di 75% Premium) rawan ditembus saat harga koreksi ke Discount'],
              ['Exhaustion Gap', 'FVG yang baru terbentuk ketika harga hampir menyentuh target DOL akhir (`PDH/PDL`)', 'Sering langsung ditembus balik (*gagal*) karena ruang ekspansi menuju target hampir habis', '**Skip** — hindari entry pada FVG yang posisinya sudah terlalu dekat dengan target akhir']
            ]
          }
        },
        {
          number: '19.4',
          heading: 'Empat Langkah Praktis Menggambar dan Menyaring FVG di Chart Gold',
          shortTitle: '4 Langkah Praktis FVG',
          paragraphs: [
            'Agar pemetaan FVG di XAU/USD tetap rapi dan tidak memenuhi grafik dengan kotak yang lemah, terapkan urutan kerja 4 langkah berikut:',
            '1. **Pastikan Lahir dari Displacement Valid:** Hanya tandai FVG yang muncul dari dorongan Displacement pasca-sweep Liquidity atau sentuhan POI HTF di dalam jam Killzone (Bab 18).',
            '2. **Ukur Celah 3 Candle & Saring Lebarnya:** Tarik kotak dari `High C1 → Low C3` (BISI) atau `Low C1 → High C3` (SIBI). Pastikan lebar celah cukup jelas (`≥ $0,80 – $1,00` di M5/M15) dan abaikan celah mikro tipis.',
            '3. **Tandai Garis 50% CE & Cek Posisi Equilibrium:** Pasang garis tengah 50% CE pada kotak FVG, lalu bandingkan posisinya terhadap garis 50% Dealing Range — Buy hanya fokus di area **Discount**, Sell hanya di area **Premium**.',
            '4. **Saring Multi-FVG & Cek Status Fresh:** Jika terdapat 2–3 FVG, prioritaskan FVG **Fresh** (belum pernah diuji) di sisi Discount/Premium yang berkonfluensi dengan Order Block/OTE dan masih memiliki ruang luas menuju target DOL.'
          ]
        },
        {
          number: '19.5',
          heading: 'Studi Kasus XAU/USD: Memilih 1 dari 2 Bullish FVG Bertumpuk',
          shortTitle: 'Studi Kasus Multi-FVG',
          paragraphs: [
            'Berikut contoh penerapan saringan Multi-FVG pada satu kaki dorongan naik M5 XAU/USD di sesi London:'
          ],
          exampleBox: {
            title: 'Pemilihan FVG #1 (Premium) vs FVG #2 (Discount) pada XAU/USD M5',
            rows: [
              {
                label: 'Peta Dorongan (M5 Sesi London · 15:25 WITA / 14:25 WIB)',
                detail: 'Pasca-sweep Asia Low `2.640,00`, harga naik mencetak MSS ke `2.652,00` (rentang `$12,00`, titik 50% Equilibrium = `2.646,00`). Terbentuk **2 Bullish FVG**: **FVG #1 (Atas)** di `2.648,50 – 2.650,00` (area **Premium 75%**) dan **FVG #2 (Bawah)** di `2.643,00 – 2.645,00` (area **Discount 33%**, tepat di atas Order Block).'
              },
              {
                label: 'Alasan Melewati FVG #1 (Atas)',
                detail: 'Posisi FVG #1 masih berada di atas garis Equilibrium `2.646,00` (area mahal untuk Buy). Memasang Buy Limit di `2.649,00` berisiko tinggi terkena Stop Loss ketika harga melakukan koreksi wajar turun menuju area Discount.'
              },
              {
                label: 'Eksekusi pada FVG #2 (Discount)',
                detail: 'Prioritas ditetapkan pada **FVG #2 (`2.643,00 – 2.645,00`)** dengan garis **50% CE = `2.644,00`**. Buy Limit dipasang di `2.644,50`, SL struktural di bawah titik sweep `2.639,20` (risiko `$5,30`), target Asia High `2.656,00` (`+$11,50` → **R:R 1 : 2,17**).'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Aturan Sentuhan Pertama (Fresh FVG)',
            title: 'Utamakan FVG yang Masih Fresh (Belum Pernah Diuji)',
            body: 'Pada Chart Gold Mapping Cockpit Amy FX Pro, setiap kotak FVG menampilkan status `FRESH`, `1×`, hingga `2× CE`. Semakin sering sebuah FVG diuji ulang, sisa order institusi di dalamnya semakin berkurang. Probabilitas reaksi terbaik selalu berada pada **pengujian pertama (Fresh)**.'
          }
        }
      ],
      keyTakeaways: [
        '**BISI (Bullish FVG)** diukur dari `High Candle 1` ke `Low Candle 3`; **SIBI (Bearish FVG)** diukur dari `Low Candle 1` ke `High Candle 3`, dengan lebar realistis di XAU/USD minimal sekitar `$0,80 – $1,00`.',
        '**Consequent Encroachment (CE)** adalah titik tengah `50%` kotak FVG: wick boleh menyentuh CE, tetapi **Body Close** harus tetap menghormatinya dan tidak menembus keluar sisi belakang kotak.',
        'Saat muncul **Multi-FVG** dalam satu kaki dorongan, lewati FVG dangkal di zona mahal/murah yang salah dan prioritaskan FVG **Fresh** pada sisi **Discount (Buy)** atau **Premium (Sell)**.',
        'Hindari **Exhaustion Gap** yang baru terbentuk tepat di depan target DOL akhir karena ruang ekspansinya hampir habis.'
      ],
      bridgeNext: 'Jika pada bagian 19.2 sebuah FVG ternyata tidak dihormati melainkan ditembus penuh oleh Body Close candle lawan, kegagalan tersebut justru dapat menjadi sinyal baru. Dalam ICT, FVG yang gagal berpotensi berbalik peran menjadi area entry yang dibahas pada **Bab 20: Inversion Fair Value Gap (iFVG): Saat FVG Gagal Berubah Jadi Peluang**.',
      practiceCta: {
        label: 'Latih Deteksi FVG & 50% CE di Backtest',
        description: 'Uji ketepatan membedakan BISI/SIBI valid, 50% CE, dan saringan Multi-FVG di 100 Studi Kasus ICT.',
        href: 'trading-practice/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Anatomi BISI, SIBI & 50% Consequent Encroachment',
          paragraphs: [
            'Bullish FVG (BISI) diukur dari High C1 ke Low C3; Bearish FVG (SIBI) dari Low C1 ke High C3, dengan garis 50% CE sebagai batas objektif validitas reaksi Body Close candle.'
          ]
        }
      ],
      mappingSteps: [
        'Pastikan FVG lahir dari dorongan Displacement pasca-sweep Liquidity di dalam Killzone.',
        'Tandai celah 3 candle: High C1–Low C3 (BISI) atau Low C1–High C3 (SIBI) dengan lebar realistis (≥ $0,80 – $1,00 di XAU/USD).',
        'Tarik garis tengah 50% Consequent Encroachment (CE) tepat di tengah kotak FVG.',
        'Jika muncul Multi-FVG, pilih FVG Fresh yang berada di sisi Discount (Buy) atau Premium (Sell) dan jauh dari target DOL akhir.'
      ],
      decisionTree: [
        {
          condition: 'Ada 2 Bullish FVG dalam 1 kaki naik: FVG atas di 75% Premium, FVG bawah di 33% Discount.',
          action: 'Prioritaskan FVG bawah (Discount); FVG atas di area Premium rawan ditembus saat harga melakukan retracement ke Discount.'
        },
        {
          condition: 'Body candle M5 ditutup penuh menembus sisi belakang kotak FVG.',
          action: 'FVG asal dinyatakan gagal; jangan memaksakan entry searah FVG lama — pantau potensi berubah peran menjadi Inversion FVG (iFVG).'
        }
      ],
      validRules: [
        'FVG masih Fresh, lahir dari Displacement pasca-sweep, lebar realistis (≥ $0,80–$1,00), dan berada di sisi Discount/Premium yang tepat.',
        'Body Close candle menghormati batas kotak atau garis 50% CE saat retracement.'
      ],
      invalidRules: [
        'Celah mikro tipis di tengah sideways tanpa Displacement atau kotak FVG yang sudah berkali-kali ditembus.',
        'Exhaustion Gap yang muncul terlalu dekat dengan target akhir DOL.'
      ],
      xauScenario: {
        context: 'Sesi London (15:25 WITA / 14:25 WIB): Setelah MSS Bullish M5 dari 2.640 ke 2.652, terbentuk FVG #1 di 2.648,50–2.650,00 (Premium) dan FVG #2 di 2.643,00–2.645,00 (Discount).',
        steps: [
          'Lewati FVG #1 karena berada di area Premium 75%.',
          'Tandai 50% CE FVG #2 di 2.644,00 dan pasang Buy Limit di 2.644,50 dengan SL struktural 2.639,20 menuju Asia High 2.656,00 (R:R 1 : 2,17).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Entry di FVG Dangkal Area Premium',
        context: 'Trader memasang Buy Limit di FVG #1 (2.649,00) padahal di bawahnya tersedia FVG #2 di area Discount.',
        whyFailed: 'FVG #1 masih berada di sisi mahal (Premium 75%); harga menembus FVG #1 untuk mengisi FVG #2 di area Discount sebelum melanjutkan kenaikan.'
      },
      goldenRules: [
        'Hanya ambil FVG Fresh yang lahir dari Sweep + Displacement di lokasi Discount/Premium yang tepat.',
        'Hormati garis 50% CE: wick boleh menyentuh, tetapi Body Close harus tetap menghormatinya.'
      ],
      quiz: [
        {
          question: 'Pada pola 3 candle **Bullish FVG (BISI)**, celah ketidakseimbangan harga diukur dari titik mana ke titik mana?',
          options: [
            'Dari Low Candle 1 ke High Candle 3',
            'Dari **High (ujung wick atas) Candle 1** ke **Low (ujung wick bawah) Candle 3**',
            'Dari Open Candle 2 ke Close Candle 2 saja',
            'Dari High hari kemarin ke Low hari ini'
          ],
          answerIndex: 1,
          explanation: 'Pada BISI (dorongan naik), ruang Imbalance berada di antara puncak (High) Candle 1 dan dasar (Low) Candle 3.'
        },
        {
          question: 'Sebuah Bullish FVG XAU/USD memiliki batas bawah `2.644,00` dan batas atas `2.648,00`. Di harga berapa garis **50% Consequent Encroachment (CE)** berada, dan bagaimana syarat sehatnya?',
          options: [
            'Di `2.646,00` — wick boleh menyentuh CE, tetapi **Body Close** harus tetap menghormatinya dan tidak tutup menembus keluar sisi belakang kotak',
            'Di `2.642,00` — body wajib menutup di bawah `2.640,00`',
            'Di `2.648,00` — wick tidak boleh menyentuh kotak sama sekali',
            'Di `2.650,00` — semakin sering ditembus bolak-balik semakin bagus'
          ],
          answerIndex: 0,
          explanation: 'CE = `(2.644 + 2.648) ÷ 2 = 2.646,00`. FVG yang sehat mempertahankan penutupan body tetap menghormati garis 50% CE.'
        },
        {
          question: 'Dalam satu kaki dorongan naik XAU/USD dari `2.640` ke `2.652`, muncul 2 Bullish FVG: FVG #1 di `2.648,50–2.650,00` (Premium 75%) dan FVG #2 di `2.643,00–2.645,00` (Discount 33%). Mana prioritas utama trader ICT?',
          options: [
            'FVG #1 karena paling dekat dengan harga sekarang',
            'Membuka Buy di keduanya dengan lot penuh sekaligus',
            '**FVG #2 (Discount 33%)** — karena FVG #1 di area mahal (Premium) rawan ditembus saat harga retracement menuju FVG Discount',
            'Menunggu sampai kedua FVG ditembus turun lalu baru Buy'
          ],
          answerIndex: 2,
          explanation: 'Saat Multi-FVG muncul, prioritaskan FVG Fresh di area Discount (untuk Buy) atau Premium (untuk Sell) agar R:R lebih sehat dan tidak terjebak di area mahal.'
        },
        {
          question: 'Apa risiko terbesar dari **Exhaustion Gap** yang baru terbentuk ketika harga tinggal `$2` lagi menyentuh target akhir DOL (`PDH/PWH`)?',
          options: [
            'Spread otomatis berubah menjadi nol',
            'Ruang ekspansi menuju target hampir habis sehingga FVG tersebut sangat rawan langsung ditembus balik',
            'FVG tersebut akan bertahan selama 3 minggu',
            'Broker tidak mengizinkan pemasangan Take Profit'
          ],
          answerIndex: 1,
          explanation: 'Begitu harga mendekati atau menyentuh target DOL akhir, institusi cenderung merealisasikan profit dan membalik arah — bukan memulai ekspansi baru.'
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
      summary: 'Pengertian mekanis Order Block (single maupun consecutive candles), tabel 4 kriteria pembeda High-Probability OB vs Trap OB, rumus 50% Mean Threshold (body OB) vs 50% CE (FVG), 4 langkah praktis pemetaan, serta perbandingan angka entry Open OB vs 50% MT pada XAU/USD.',
      bookSections: [
        {
          number: '21.1',
          heading: 'Pengertian dan Anatomi Order Block (OB) dalam ICT',
          shortTitle: 'Pengertian Order Block',
          paragraphs: [
            '**Order Block (OB)** adalah salah satu konsep ICT yang paling sering disalahartikan. Banyak trader pemula menandai setiap candle bearish sebelum candle bullish sebagai Bullish Order Block, sehingga grafik dipenuhi kotak lemah yang mudah ditembus.',
            'Secara institusional, pelaku pasar bermodal besar tidak selalu dapat mengeksekusi seluruh volume kontrak pada satu titik harga tanpa menggeser pasar terlalu cepat. Karena itu, harga kerap didorong turun lebih dulu untuk menyerap Stop Loss dan order jual ritel, sebelum harga didorong naik dengan tegas. Jejak candle tempat akumulasi order tersebut berlangsung disebut **Order Block**:',
            '1. **Bullish Order Block (`+OB`):** Satu candle turun (*down-close*) atau **rangkaian 2–3 candle turun berurutan** tepat sebelum dorongan **Displacement naik** yang tegas.',
            '2. **Bearish Order Block (`-OB`):** Satu candle naik (*up-close*) atau **rangkaian 2–3 candle naik berurutan** tepat sebelum dorongan **Displacement turun** yang tegas.',
            '*Aturan Rangkaian Candle:* Apabila tepat sebelum Displacement naik terdapat 2 atau 3 candle turun berurutan tanpa diselingi candle naik, **seluruh rangkaian candle tersebut dihitung sebagai satu Order Block**, dengan batas atas diambil dari **Open candle turun pertama**.'
          ]
        },
        {
          number: '21.2',
          heading: 'Filter Ketat: High-Probability OB vs Trap OB (Low-Probability)',
          shortTitle: 'High-Prob OB vs Trap OB',
          paragraphs: [
            'Agar Anda dapat membedakan Order Block bermutu tinggi dari OB lemah (**Trap OB**), uji setiap calon Order Block menggunakan **4 kriteria wajib** pada tabel berikut:'
          ],
          table: {
            caption: 'Perbandingan Kriteria: High-Probability Order Block vs Trap OB',
            headers: ['Kriteria Uji', 'High-Probability OB (Valid)', 'Trap OB / Low-Probability (Skip)', 'Alasan Institusional'],
            rows: [
              ['1. Pemicu Liquidity', 'Candle OB **baru saja melakukan sweep Liquidity** (`Asia H/L`, `PDH/PDL`, `Swing`) atau terbentuk di dalam **POI HTF**', 'Terbentuk di ruang kosong tengah range tanpa sweep apa pun', 'Tanpa sweep atau POI HTF, tidak ada bukti penyerapan likuiditas lawan'],
              ['2. Displacement + FVG', 'Langsung diikuti **Displacement tegas yang mencetak FVG** keluar dari OB', 'Keluar perlahan tanpa FVG, atau candle saling bertumpuk merayap', 'FVG menjadi bukti objektif adanya injeksi volume institusi dari OB tersebut'],
              ['3. Dampak Struktur', 'Dorongan keluarnya **mematahkan struktur (`BOS` / `MSS`)** atau level penting', 'Gagal menembus swing penting mana pun', 'Membuktikan OB memiliki kekuatan nyata untuk menggeser kendali pasar'],
              ['4. Kesegaran & Ukuran', 'Masih **Fresh** (belum diuji ulang) dan lebarnya proporsional (`≤ $6–$8` pada M5/M15 Gold)', 'Sudah diuji berkali-kali atau terlalu besar (`> $12` di M5)', 'OB yang terlalu lebar memaksa jarak SL melebar sehingga merusak R:R']
            ]
          }
        },
        {
          number: '21.3',
          heading: 'Garis 50% Mean Threshold (MT) dan Perbedaannya dengan 50% CE FVG',
          shortTitle: '50% Mean Threshold vs CE',
          paragraphs: [
            'Dalam ICT terdapat dua garis tengah `50%` dengan objek pengukuran yang berbeda: pada Bab 19, **50% Consequent Encroachment (CE)** mengukur titik tengah **kotak FVG** (antar-wick). Khusus pada **Order Block**, garis tengah `50%` disebut **Mean Threshold (MT)**.',
            '**Cara Mengukur Mean Threshold (MT):** Ukur titik tengah **50% hanya dari BODY** (*Open ke Close*) candle Order Block — bukan dari ujung wick terjauh. **Rumusnya:** `MT = (Open OB + Close OB) ÷ 2`.',
            'Sebagai contoh, sebuah Bullish OB M15 memiliki `Open = 2.646,00`, `Close = 2.642,00`, dan `Low` (ujung wick) di `2.640,00`. Maka garis **50% Mean Threshold** berada tepat di **`(2.646,00 + 2.642,00) ÷ 2 = 2.644,00`**.',
            '**Aturan Validitas MT:** Saat harga kembali menguji Bullish OB, **wick boleh menyentuh Mean Threshold (`2.644,00`)**, tetapi **Body Close candle wajib tetap bertahan di atas Mean Threshold**. Jika Body Close menembus jauh di bawah 50% MT hingga keluar dari sisi bawah OB, Order Block dinyatakan gagal dan berpotensi berubah fungsi menjadi **Breaker Block** (Bab 22).'
          ]
        },
        {
          number: '21.4',
          heading: 'Empat Langkah Praktis Memetakan dan Menyaring Order Block',
          shortTitle: '4 Langkah Praktis OB',
          paragraphs: [
            'Terapkan 4 langkah berikut setiap kali Anda ingin menandai Order Block pada grafik XAU/USD:',
            '1. **Cek Pemicu & Jam Sesi:** Pastikan calon OB terbentuk tepat di ujung **Liquidity Sweep** (`Asia High/Low`, `PDH/PDL`, `Swing`) atau di dalam POI HTF saat jam **Killzone**.',
            '2. **Verifikasi Displacement + FVG + Break Struktur:** Pastikan dorongan keluar dari OB langsung meninggalkan celah **FVG** yang jelas dan memecah struktur (`BOS`/`MSS`). Tanpa FVG, lewati OB tersebut.',
            '3. **Tandai Rangkaian Candle & Tarik Open + 50% MT:** Jika ada 2–3 candle berlawanan berurutan sebelum Displacement, gabungkan sebagai satu blok (batas `Open` dari candle pertama rangkaian), lalu tarik garis **50% Mean Threshold** pada body-nya dan cek posisinya di sisi **Discount (Buy)** atau **Premium (Sell)**.',
            '4. **Sesuaikan Titik Entry dengan Lebar Body OB:** Gunakan **Open OB** bila body OB ringkas (`≤ $3,50`) agar peluang terjemput tinggi, atau **50% MT** bila body OB lebih lebar (`$4–$6`) agar jarak SL tetap ringkas dan R:R minimal `1 : 2`.'
          ]
        },
        {
          number: '21.5',
          heading: 'Studi Kasus XAU/USD: Perbandingan Entry Open OB vs 50% Mean Threshold',
          shortTitle: 'Open OB vs 50% MT Entry',
          paragraphs: [
            'Setelah sebuah High-Probability OB terverifikasi (Sweep + Displacement/FVG + MSS), berikut perbandingan angka antara masuk di **Open OB** dan di **50% Mean Threshold** pada XAU/USD:'
          ],
          exampleBox: {
            title: 'Perbandingan Entry XAU/USD M15 (Sesi London · 15:30 WITA / 14:30 WIB): Open 2.646,00 · Close 2.642,00 · Wick Low 2.640,00',
            rows: [
              {
                label: 'Opsi 1 — Entry di Open OB (`2.646,00` · Konservatif)',
                detail: 'Pasang Buy Limit pada batas atas body OB (`2.646,00`). SL struktural di bawah wick sweep (`2.639,20` → risiko **`$6,80`**). Target Asia High `2.660,00` (`+$14,00` → **R:R 1 : 2,06**). **Kelebihan:** Probabilitas order terjemput lebih tinggi.'
              },
              {
                label: 'Opsi 2 — Entry di 50% Mean Threshold (`2.644,00` · Presisi)',
                detail: 'Pasang Buy Limit lebih dalam pada garis MT (`2.644,00`). SL sama di `2.639,20` → risiko mengecil menjadi **`$4,80`**. Target sama di `2.660,00` (`+$16,00` → **R:R meningkat menjadi 1 : 3,33**). **Konsekuensi:** Order bisa terlewat bila harga langsung memantul dari Open OB.'
              },
              {
                label: 'Panduan Pemilihan Praktis',
                detail: 'Jika lebar body OB ringkas (`≤ $3,50`), utamakan **Open OB** karena harga pada tren kuat sering hanya menyentuh tepi Open. Jika body OB lebar (`$4–$6`), gunakan **50% Mean Threshold** agar jarak SL tetap terukur dan R:R minimal `1 : 2` terjaga.'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Pembeda Dua Garis 50% ICT',
            title: 'Jangan Tertukar: 50% CE untuk FVG, 50% MT untuk Body Order Block',
            body: 'Biasakan membedakan keduanya sejak awal: **Consequent Encroachment (CE)** adalah titik tengah `50%` dari **kotak FVG** (antar-wick), sedangkan **Mean Threshold (MT)** adalah titik tengah `50%` dari **body (Open–Close) Order Block**.'
          }
        }
      ],
      keyTakeaways: [
        '**Bullish OB** adalah 1 atau rangkaian candle turun terakhir sebelum Displacement naik; **Bearish OB** adalah 1 atau rangkaian candle naik terakhir sebelum Displacement turun.',
        'Order Block bermutu tinggi wajib memenuhi 3 bukti utama: **sweep Liquidity / POI HTF**, **melahirkan Displacement + FVG**, dan **mematahkan struktur (`BOS`/`MSS`)**.',
        '**50% Mean Threshold (MT)** diukur dari **body (Open–Close)** OB — berbeda dengan **50% CE** yang diukur dari kotak FVG.',
        'Gunakan **Open OB** saat body OB ringkas untuk tingkat keterjemputan lebih tinggi, atau **50% MT** saat body OB lebih lebar agar R:R minimal `1 : 2` tetap terjaga.'
      ],
      bridgeNext: 'Apabila sebuah Order Block yang terbentuk pasca-sweep justru ditembus penuh oleh Displacement berlawanan, zona tersebut dapat berbalik kutub menjadi area pantulan kuat. Mekanisme tersebut dibahas lengkap pada **Bab 22: Breaker Block (BB), Mitigation Block & ICT Unicorn Model**.',
      practiceCta: {
        label: 'Pantau OB & 50% MT di Chart Gold',
        description: 'Aktifkan layer Order Block di Chart Gold Mapping Cockpit untuk melihat zona OB aktif, garis 50% MT, dan jejak sentuhannya secara langsung.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'High-Probability OB & 50% Mean Threshold',
          paragraphs: [
            'Order Block valid adalah candle atau rangkaian candle berlawanan terakhir yang menyapu Liquidity dan langsung melahirkan Displacement + FVG, dengan 50% Mean Threshold pada badannya sebagai batas uji validitas.'
          ]
        }
      ],
      mappingSteps: [
        'Tandai candle atau rangkaian 2–3 candle berlawanan terakhir tepat di ujung Sweep Liquidity sebelum Displacement.',
        'Verifikasi ada celah FVG yang langsung lahir keluar dari OB dan mematahkan struktur (BOS/MSS).',
        'Tarik garis Open OB dan 50% Mean Threshold di tengah body (Open–Close) OB, lalu tempatkan SL struktural di luar ujung wick OB.'
      ],
      decisionTree: [
        {
          condition: 'Ada candle bearish sebelum candle bullish, tetapi tidak menyapu Liquidity dan tidak mencetak FVG.',
          action: 'SKIP — itu Low-Probability / Trap OB (tanpa Sweep dan tanpa FVG), bukan High-Probability Order Block.'
        },
        {
          condition: 'Body OB cukup lebar ($5–$6 di M5 Gold) sehingga entry di Open OB membuat R:R di bawah 1 : 2.',
          action: 'Gunakan titik 50% Mean Threshold (MT) sebagai batas entry atau tunggu konfirmasi M5 di dalam area OB.'
        }
      ],
      validRules: [
        'OB menyapu Liquidity atau berada di POI HTF, diikuti Displacement + FVG, dan mematahkan struktur.',
        'Body Close candle menghormati batas Open OB atau garis 50% Mean Threshold saat diuji ulang.'
      ],
      invalidRules: [
        'Menandai sembarang candle terakhir di tengah konsolidasi tanpa Sweep dan tanpa FVG.',
        'Memakai OB yang sudah diuji berulang kali atau memiliki lebar ekstrem (> $12 di M5).'
      ],
      xauScenario: {
        context: 'Sesi London (15:30 WITA / 14:30 WIB): Bullish OB M15 XAU/USD pasca-sweep Asia Low dengan Open 2.646,00, Close 2.642,00, Wick Low 2.640,00 diikuti Displacement + FVG.',
        steps: [
          'Hitung 50% Mean Threshold = (2.646,00 + 2.642,00) ÷ 2 = 2.644,00.',
          'Entry pada 2.644,00 dengan SL struktural di 2.639,20 ($4,80) menuju target Asia High 2.660,00 (+$16,00, R:R 1 : 3,33).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Entry di Trap OB Tanpa Sweep & FVG',
        context: 'Trader menandai candle bearish biasa di tengah tren tanpa sweep Liquidity dan tanpa FVG.',
        whyFailed: 'OB tersebut tidak lahir dari Sweep Liquidity dan tidak meninggalkan FVG; harga langsung menembusnya menuju Liquidity dan OB valid di bawahnya.'
      },
      goldenRules: [
        'Tanpa Sweep dan tanpa FVG setelahnya, sebuah candle bukanlah High-Probability Order Block.',
        'Bedakan dua titik 50%: CE untuk kotak FVG, Mean Threshold untuk body Order Block.'
      ],
      quiz: [
        {
          question: 'Kombinasi syarat manakah yang membedakan **High-Probability Order Block** dari **Trap OB**?',
          options: [
            'Candle kecil di tengah sesi Asia tanpa FVG dan tanpa pematahan struktur',
            '**Sweep Liquidity / menyentuh POI HTF** + langsung diikuti **Displacement yang mencetak FVG** + **mematahkan struktur (`BOS`/`MSS`)**',
            'Sudah diuji harga sebanyak 4 kali pada hari yang sama',
            'Memiliki tinggi body lebih dari $15 pada timeframe M5'
          ],
          answerIndex: 1,
          explanation: 'Tiga bukti institusional (Sweep + Displacement/FVG + Structural Break) menyaring sebagian besar Order Block lemah.'
        },
        {
          question: 'Sebuah candle Bullish Order Block M15 XAU/USD memiliki `Open = 2.650,00`, `Close = 2.646,00`, dan ujung wick bawah (`Low`) = `2.643,00`. Di harga berapakah garis **50% Mean Threshold (MT)** berada?',
          options: [
            '`2.646,50` (tengah dari Open ke Wick Low)',
            '**`2.648,00`** — yaitu titik tengah `50%` dari **body (Open ke Close)**: `(2.650 + 2.646) ÷ 2`',
            '`2.644,50` (tengah dari Close ke Wick Low)',
            '`2.652,00` (di atas Open)'
          ],
          answerIndex: 1,
          explanation: 'Mean Threshold diukur tepat di 50% body (Open ke Close) candle Order Block, bukan termasuk ujung wick.'
        },
        {
          question: 'Jika tepat sebelum Displacement naik terdapat **3 candle bearish berurutan** tanpa diselingi candle bullish, bagaimana cara menandai Bullish Order Block yang benar dalam ICT?',
          options: [
            'Hanya candle bearish paling kecil yang dipakai',
            'Dianggap tidak ada Order Block sama sekali',
            'Keseluruhan **rangkaian 3 candle bearish berurutan** itu dihitung sebagai **satu blok Order Block** dengan batas atas dari Open candle bearish pertama',
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
          explanation: 'Penutupan body yang menembus penuh OB menandakan arus order telah berbalik dan membuka skenario Breaker Block.'
        }
      ]
    },
    {
      id: 'cisd-vs-mss-sinyal-awal',
      number: 23,
      levelId: 3,
      title: 'CISD vs Market Structure Shift (MSS): Dua Tingkat Konfirmasi Pembalikan Arah',
      readMinutes: 10,
      diagramId: 'cisd-vs-mss',
      bookFormat: true,
      diagramAfterSection: 1,
      summary: 'Perbedaan mekanis antara Change in State of Delivery (CISD) pada level rangkaian candle dan Market Structure Shift (MSS) pada level struktur swing, syarat validasi Body Close, 3 panduan praktis memilih CISD vs MSS, serta studi kasus XAU/USD M5.',
      bookSections: [
        {
          number: '23.1',
          heading: 'Mengapa Menunggu Swing Struktur Jauh Sering Mengurangi Rasio Risk-to-Reward?',
          shortTitle: 'Fungsi CISD di XAU/USD',
          paragraphs: [
            'Pada grafik M5 XAU/USD, sering terjadi situasi ketika harga turun melakukan sweep `PDL`, sementara Swing High struktural terdekat berada cukup jauh (misalnya `$10–$12` di atas titik terendah). Jika Anda selalu menunggu Swing High sejauh itu ditembus untuk konfirmasi **MSS**, harga kadang sudah bergerak terlalu dekat ke target sebelum sempat memberi koreksi yang sehat.',
            'Untuk menjembatani jeda tersebut, metodologi ICT membedakan **dua tingkat konfirmasi pembalikan arah** yang saling melengkapi:',
            '1. **CISD (*Change in State of Delivery*):** Konfirmasi perubahan kendali pengiriman harga lebih awal pada level rangkaian candle.',
            '2. **MSS (*Market Structure Shift*):** Konfirmasi pembalikan arah yang lebih ketat pada level struktur swing disertai Displacement dan Fair Value Gap (FVG).'
          ]
        },
        {
          number: '23.2',
          heading: 'Aturan Mekanis Membaca Change in State of Delivery (CISD)',
          shortTitle: 'Aturan Mekanis CISD',
          paragraphs: [
            'Istilah *State of Delivery* merujuk pada arah pengiriman harga yang sedang dominan — rangkaian candle bearish (*down-close*) menandakan pengiriman ke bawah, sedangkan rangkaian candle bullish (*up-close*) menandakan pengiriman ke atas. **CISD** terjadi saat kendali pengiriman tersebut berpindah ke sisi lawan sebelum Swing struktural utama ditembus.',
            'Validasi CISD dilakukan melalui 3 langkah objektif berikut:',
            '1. **Syarat Konteks (Wajib):** Harga baru saja melakukan sweep Liquidity penting (`BSL/SSL`, `PDH/PDL`, `Asia High/Low`) atau menyentuh **POI HTF** (Order Block / FVG H1–H4) di dalam jam Killzone.',
            '2. **Tandai Harga Open Rangkaian Candle Terakhir:** Untuk **Bullish CISD**, identifikasi rangkaian candle bearish berurutan terakhir yang mengantar harga ke titik terendah sweep, lalu tarik garis horizontal tepat pada **Harga Open candle bearish pertama** pada rangkaian tersebut. Untuk **Bearish CISD**, tarik garis pada **Harga Open candle bullish pertama** dari rangkaian naik yang menyapu puncak.',
            '3. **Tunggu Body Close Melewati Garis Open:** CISD dinyatakan sah hanya jika candle lawan menutup **Body Close** penuh melewati garis Open tersebut. Penembusan yang hanya berupa wick belum mengonfirmasi CISD.'
          ]
        },
        {
          number: '23.3',
          heading: 'Perbandingan Langsung: CISD vs Market Structure Shift (MSS)',
          shortTitle: 'Perbandingan CISD vs MSS',
          paragraphs: [
            'Berbeda dengan CISD yang mengukur perubahan pada level rangkaian candle, **Market Structure Shift (MSS)** menuntut pematahan **Swing High atau Swing Low struktural** menggunakan **Displacement** (Body Close tegas disertai pembentukan FVG). Tabel berikut merangkum perbandingan keduanya:'
          ],
          table: {
            caption: 'Perbandingan Mekanis: CISD vs Market Structure Shift (MSS)',
            headers: ['Aspek', 'CISD (Level Rangkaian Candle)', 'MSS (Level Struktur Swing)', 'Kombinasi Keduanya'],
            rows: [
              ['Acuan yang Ditembus', '**Harga Open** candle pertama dari rangkaian searah terakhir yang melakukan sweep', '**Swing High / Swing Low** struktural yang jelas (pola 3 candle)', 'CISD muncul lebih awal lalu segera diperkuat oleh MSS + FVG searah'],
              ['Syarat Validasi', 'Wajib **Body Close** melewati garis Open pasca-Sweep atau POI HTF', 'Wajib **Body Close + Displacement (FVG)** pasca-Sweep atau POI HTF', 'Keduanya menolak penembusan yang hanya berupa wick'],
              ['Kecepatan & Jarak SL', '**Lebih awal** — titik masuk lebih dekat ke ekstrem sweep sehingga jarak SL lebih ringkas', 'Lebih lambat, tetapi struktur tren pada timeframe tersebut sudah sah patah', 'Memberikan efisiensi posisi awal sekaligus validasi struktur penuh'],
              ['Tingkat Keamanan', 'Sedang hingga Tinggi (rentan gagal bila dipakai di tengah range tanpa Sweep HTF)', '**Tinggi** — standar konfirmasi paling aman untuk pemula hingga menengah', 'Standar konfirmasi utama pada sesi London dan NY AM']
            ]
          }
        },
        {
          number: '23.4',
          heading: 'Kapan Memilih CISD Lebih Awal vs Menunggu MSS Penuh?',
          shortTitle: 'Panduan Memilih CISD vs MSS',
          paragraphs: [
            'Agar Anda tidak ragu saat menghadapi chart langsung, terapkan **3 panduan praktis** berikut:',
            '1. **Wajib Tunggu MSS + FVG pada 30–50 Transaksi Pertama atau Counter-Trend:** Jika Anda masih membangun konsistensi awal atau setup berlawanan arah dengan tren H1, jangan bergantung pada CISD saja — tunggu pematahan Swing penuh disertai Displacement dan FVG.',
            '2. **Gunakan CISD Lebih Awal Saat Konteks HTF Lengkap dan Swing Jauh:** Jika seluruh faktor HTF selaras (Sweep `PDH/PDL` atau sentuhan POI H1/H4 + jam Killzone + terbentuk FVG baru pasca-CISD) sementara Swing MSS masih jauh (`$6–$10`), CISD dapat digunakan untuk entry awal dengan rasio R:R lebih besar.',
            '3. **Lewati Keduanya di Tengah Konsolidasi Tanpa Sweep/POI:** Tanpa latar belakang Sweep Liquidity atau sentuhan POI HTF, penembusan Open candle maupun swing kecil di tengah pasar sideways bukan sinyal pembalikan institusi.'
          ]
        },
        {
          number: '23.5',
          heading: 'Studi Kasus XAU/USD M5: Urutan Bullish CISD Diikuti Bullish MSS',
          shortTitle: 'Studi Kasus CISD + MSS',
          paragraphs: [
            'Berikut urutan pembacaan CISD dan MSS secara berurutan pada grafik M5 XAU/USD setelah harga melakukan sweep `PDL`:'
          ],
          exampleBox: {
            title: 'Urutan Teknis XAU/USD M5 (Sesi London · 15:15 WITA / 14:15 WIB) Pasca-Sweep PDL 2.638,00',
            rows: [
              {
                label: 'Tahap 1 — Sweep & Titik Acuan',
                detail: 'XAU/USD turun menyapu `PDL 2.638,00` dengan rangkaian **2 candle bearish berurutan** yang dimulai dari **`Open = 2.641,50`**. Sementara itu, Swing High struktural M5 terdekat berada di **`2.645,00`**.'
              },
              {
                label: 'Tahap 2 — Konfirmasi Bullish CISD',
                detail: 'Candle bullish M5 menutup **Body Close** di **`2.642,80`** (di atas Open `2.641,50`). **Bullish CISD sah terkonfirmasi** — kendali pengiriman harga berpindah ke pembeli dan area `2.638,00–2.641,50` dapat ditandai sebagai kandidat Bullish Order Block.'
              },
              {
                label: 'Tahap 3 — Konfirmasi Bullish MSS + FVG',
                detail: 'Candle M5 berikutnya mendorong naik dan menutup **Body Close** di **`2.646,50`** (menembus Swing High `2.645,00` sambil membentuk Bullish FVG pada `2.642,00–2.644,50`). **Bullish MSS sah terkonfirmasi**, memberi acuan rencana Buy Limit dengan SL struktural di bawah `2.637,40`.'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Panduan Pengalaman Eksekusi',
            title: 'Prioritaskan MSS + FVG pada 30–50 Transaksi Pertama',
            body: 'Selama membangun konsistensi awal, jadikan **Sweep + MSS + Displacement + FVG** sebagai syarat wajib sebelum membuka posisi. Setelah terbiasa menilai kualitas Sweep dan POI HTF secara akurat, CISD dapat dimanfaatkan sebagai konfirmasi awal saat jarak Swing struktural terlalu jauh.'
          }
        }
      ],
      keyTakeaways: [
        '**CISD** (*Change in State of Delivery*) sah ketika **Body Close** menembus **Harga Open** candle pertama dari rangkaian searah terakhir yang menyapu Liquidity.',
        '**MSS** (*Market Structure Shift*) sah ketika **Body Close + Displacement (FVG)** menembus **Swing High/Low struktural**.',
        'Baik CISD maupun MSS **wajib didahului Sweep Liquidity atau sentuhan POI HTF**; di tengah konsolidasi tanpa konteks, keduanya bukan sinyal pembalikan yang valid.',
        'Urutan konfirmasi paling kuat adalah **CISD muncul lebih awal** lalu segera diperkuat oleh **MSS + FVG** searah.'
      ],
      bridgeNext: 'Seluruh komponen PD Array dan konfirmasi pembalikan arah telah dibahas: Displacement (Bab 18), FVG + 50% CE (Bab 19), iFVG (Bab 20), Order Block + 50% MT (Bab 21), Breaker/Mitigation/Unicorn (Bab 22), serta CISD vs MSS (Bab 23). Langkah penutup Bagian IV membahas filter lokasi harga dan urutan prioritas zona pada **Bab 24: Premium, Discount, Equilibrium (50%), OTE (62%–79%) & Hierarki PD Array**.',
      practiceCta: {
        label: 'Latih Bedakan CISD vs MSS di 100 Kasus',
        description: 'Buka Latihan 100 Kasus pilar Market Structure untuk melatih ketepatan membaca CISD dan MSS pada chart Gold.',
        href: 'trading-practice/index.html'
      },
      conceptBlocks: [
        {
          heading: 'CISD vs MSS',
          paragraphs: [
            'CISD membaca perubahan kendali pengiriman harga di level Open rangkaian candle lawan terakhir, sedangkan MSS menuntut penembusan Swing struktural dengan Body Close, Displacement, dan FVG.'
          ]
        }
      ],
      mappingSteps: [
        'Tunggu Sweep Liquidity (PDH/PDL/Asia) atau sentuhan POI HTF terlebih dahulu di dalam Killzone.',
        'Tandai garis Open rangkaian candle terakhir menuju ekstrem sweep (acuan CISD) dan Swing terdekat (acuan MSS).',
        'Tunggu Body Close penuh menembus acuan tersebut sebelum menyiapkan rencana retracement ke FVG atau Order Block.'
      ],
      decisionTree: [
        {
          condition: 'Ada candle bullish menutup di atas 1 candle bearish di tengah konsolidasi Asia tanpa Sweep atau POI HTF.',
          action: 'SKIP — bukan CISD valid karena tidak didahului Sweep Liquidity atau sentuhan POI HTF.'
        },
        {
          condition: 'Masih berada pada 30–50 transaksi pertama dan muncul CISD tipis tanpa MSS.',
          action: 'Tunggu konfirmasi penuh MSS + Displacement + FVG agar risiko sinyal palsu lebih terkendali.'
        }
      ],
      validRules: [
        'CISD dan MSS sama-sama mensyaratkan Body Close penuh, bukan sekadar penembusan wick.',
        'Wajib didahului Sweep Liquidity atau sentuhan POI timeframe besar (H1/H4) di dalam jam Killzone.'
      ],
      invalidRules: [
        'Menganggap setiap candle yang menembus Open candle sebelumnya di tengah range sebagai CISD.',
        'Masuk posisi sebelum candle pemicu CISD atau MSS selesai tutup (close).'
      ],
      xauScenario: {
        context: 'Sesi London (15:15 WITA / 14:15 WIB): Sweep PDL 2.638,00 dengan 2 candle bearish dimulai dari Open 2.641,50; Swing High M5 terdekat di 2.645,00.',
        steps: [
          'Body Close M5 di 2.642,80 mengonfirmasi Bullish CISD lebih awal.',
          'Body Close M5 berikutnya di 2.646,50 disertai FVG mengonfirmasi Bullish MSS penuh.'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: CISD Tanpa Konteks HTF',
        context: 'Trader mengeksekusi CISD M5 di tengah Dealing Range tanpa Sweep Liquidity dan melawan arah tren H1.',
        whyFailed: 'Tanpa Sweep Liquidity atau POI HTF, pantulan harga cepat melemah dan tren utama H1 berlanjut menyentuh SL.'
      },
      goldenRules: [
        'CISD mengonfirmasi perubahan kendali pada level rangkaian candle; MSS mengonfirmasi pematahan struktur pada level swing.',
        'Tanpa Sweep Liquidity atau sentuhan POI HTF, CISD maupun MSS tidak memiliki konteks probabilitas tinggi.'
      ],
      quiz: [
        {
          question: 'Secara mekanis, titik harga manakah yang harus ditembus oleh **Body Close** agar **Bullish CISD** sah terkonfirmasi setelah harga menyapu `PDL`?',
          options: [
            'Ujung wick bawah candle paling rendah',
            '**Harga Open** dari candle turun (*down-close*) pertama pada rangkaian candle bearish terakhir yang mendorong sweep `PDL`',
            'Harga penutupan pekan lalu',
            'Titik tertinggi sesi Asia 3 hari yang lalu'
          ],
          answerIndex: 1,
          explanation: 'Bullish CISD sah ketika Body Close candle bullish ditutup di atas harga Open candle pertama dari rangkaian candle bearish terakhir yang melakukan sweep.'
        },
        {
          question: 'Apa perbedaan kecepatan dan tingkat validasi utama antara **CISD** dan **MSS**?',
          options: [
            'MSS selalu muncul lebih dulu daripada CISD',
            '**CISD** muncul lebih awal karena mengukur penutupan melewati Open rangkaian candle, sedangkan **MSS** lebih lambat tetapi memberi validasi struktur lebih kuat karena mematahkan Swing dengan Displacement + FVG',
            'CISD cukup memakai wick sedangkan MSS tidak perlu candle close',
            'Keduanya hanya berlaku pada timeframe Bulanan'
          ],
          answerIndex: 1,
          explanation: 'CISD mendeteksi perubahan kendali pengiriman pada level candle lebih awal; MSS mengonfirmasi pematahan struktur pada level swing.'
        },
        {
          question: 'Harga menyapu `PDL 2.638,00` dengan 2 candle bearish (Open awal `2.641,50`), lalu candle bullish M5 sempat menyentuh `2.643,00` tetapi **ditutup (Close) di `2.640,80`**. Apakah Bullish CISD sudah valid?',
          options: [
            'Sudah valid karena wick-nya sempat naik ke `2.643,00`',
            '**Belum valid** — karena CISD mensyaratkan **Body Close** di atas `2.641,50`, bukan sekadar tusukan wick',
            'Sudah valid dan langsung pasang lot 2× lipat',
            'Otomatis berubah menjadi Bearish MSS'
          ],
          answerIndex: 1,
          explanation: 'Sama seperti BOS dan MSS, CISD mewajibkan Body Close melewati garis Open, bukan sekadar ekor candle.'
        },
        {
          question: 'Untuk trader yang sedang membangun konsistensi pada 30–50 transaksi pertamanya, standar konfirmasi pembalikan mana yang paling aman digunakan?',
          options: [
            'Masuk sebelum candle selesai tutup',
            'Menjadikan **Sweep + MSS + Displacement + FVG** sebagai standar wajib sebelum menggunakan CISD secara mandiri',
            'Menggunakan CISD di tengah konsolidasi Asia tanpa melihat HTF',
            'Mengabaikan struktur dan menebak puncak atau dasar'
          ],
          answerIndex: 1,
          explanation: 'MSS disertai Displacement dan FVG pasca-sweep memberikan validasi struktur paling jelas dan menekan risiko sinyal palsu.'
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
      summary: 'Filter lokasi harga matematis pada Dealing Range: pembagian zona Discount (<50%) dan Premium (>50%), pengaturan baku Fibonacci OTE (61,8%–78,6% dengan titik tengah 70,5%), urutan Hierarki PD Array, 4 langkah praktis penyaringan, serta studi kasus XAU/USD.',
      bookSections: [
        {
          number: '24.1',
          heading: 'Filter Lokasi Harga: Premium, Discount, dan Equilibrium (50%)',
          shortTitle: 'Premium vs Discount',
          paragraphs: [
            'Pada Bab 10 Anda telah mempelajari cara menandai **Dealing Range** dari Swing Low ke Swing High pada satu gelombang impulsif yang jelas. Langkah berikutnya adalah membagi rentang harga tersebut secara matematis agar posisi dibuka pada harga yang efisien — tidak membeli saat harga sudah terlalu tinggi dan tidak menjual saat harga sudah terlalu rendah.',
            'Tarik alat **Fibonacci Retracement** dari awal hingga ujung gelombang impulsif di H1 atau M15, lalu tampilkan hanya level utama berikut: **`0%`**, **`50%` (Equilibrium)**, **`61,8% / 70,5% / 78,6%` (Zona OTE)**, dan **`100%`**.',
            'Aturan pemilihan lokasi transaksi bersifat baku:',
            '1. **Skenario BUY:** Hanya pertimbangkan PD Array (FVG, Order Block, Breaker, atau iFVG) yang berada di bawah garis `50%` (**Zona Discount**).',
            '2. **Skenario SELL:** Hanya pertimbangkan PD Array yang berada di atas garis `50%` (**Zona Premium**).',
            '3. **Area Equilibrium (`45%–55%`):** Area tengah rentang umumnya memiliki rasio Risk-to-Reward sempit menuju ujung range; hindari entry di area ini kecuali terdapat konfluensi struktur HTF yang sangat jelas.'
          ]
        },
        {
          number: '24.2',
          heading: 'Zona Optimal Trade Entry (OTE): 61,8%–78,6% dan Pengaturan Baku MT5/TradingView',
          shortTitle: 'Zona OTE (62%–79%)',
          paragraphs: [
            'Di dalam zona Discount (untuk Buy) atau Premium (untuk Sell), metodologi ICT menetapkan rentang koreksi mendalam **`61,8%` hingga `78,6%`** sebagai **Optimal Trade Entry (OTE)**, dengan titik tengah tepat di **`70,5%`**.',
            'Pada kedalaman koreksi `61,8%–78,6%`, posisi Stop Loss di balik pangkal gelombang (`100%`) menjadi lebih ringkas sementara jarak menuju ujung gelombang lama (`0%`) cukup lebar untuk menghasilkan **R:R minimal `1 : 2` hingga `1 : 3`** tanpa perlu bergantung pada penembusan ekstrem baru.',
            'Penting diingat bahwa **OTE bukan pemicu entry tunggal**. Garis `70,5%` di ruang kosong tanpa FVG, Order Block, atau Breaker Block tidak layak dieksekusi. Probabilitas tinggi hanya muncul ketika sebuah **PD Array valid berhimpitan tepat di dalam zona OTE `61,8%–78,6%`**.',
            '**Pengaturan Baku Fibonacci OTE di MT5 & TradingView:** Hapus level bawaan yang tidak terpakai (`23,6%`, `38,2%`, `161,8%`, dan lainnya) agar grafik tetap bersih. Sisakan **6 level berikut** — untuk **BUY** tarik dari **Swing Low (`1`) ke Swing High (`0`)**, dan untuk **SELL** tarik dari **Swing High (`1`) ke Swing Low (`0`)**:'
          ],
          table: {
            caption: 'Setting Angka Baku Fibonacci OTE (MT5 & TradingView)',
            headers: ['Angka Level', 'Label Disarankan', 'Fungsi di Chart XAU/USD'],
            rows: [
              ['`0`', 'Target (0%)', 'Ujung gelombang impulsif (titik TP konservatif pertama)'],
              ['`0.5`', 'Equilibrium (50%)', 'Garis batas Discount (bawah) vs Premium (atas)'],
              ['`0.618`', 'OTE Atas (61,8%)', 'Batas awal zona retracement OTE'],
              ['`0.705`', 'Titik Tengah OTE (70,5%)', 'Titik tengah zona OTE — prioritas utama jika berhimpitan dengan FVG/OB'],
              ['`0.786`', 'OTE Dalam (78,6%)', 'Batas terdalam retracement sehat sebelum mendekati batas batal'],
              ['`1`', 'Invalidation (100%)', 'Pangkal gelombang — batas batal struktur (SL struktural ditempatkan di luar garis ini)']
            ]
          }
        },
        {
          number: '24.3',
          heading: 'Hierarki PD Array (PD Array Matrix): Urutan Prioritas Zona',
          shortTitle: 'Hierarki PD Array',
          paragraphs: [
            'Dalam praktik analisis XAU/USD, sering kali muncul lebih dari satu PD Array secara bersamaan di dalam zona Discount atau Premium — misalnya terdapat FVG, Order Block, dan Breaker Block pada satu kaki gelombang.',
            'Untuk menentukan zona yang paling diprioritaskan, gunakan **Hierarki PD Array** berikut (urutan prioritas yang sama dengan yang diterapkan pada **Mapping Cockpit Amy FX Pro**):'
          ],
          table: {
            caption: 'Urutan Prioritas PD Array (PD Array Matrix · Dari Terkuat ke Standar)',
            headers: ['Peringkat', 'Jenis PD Array', 'Dasar Kekuatan Teknis', 'Catatan Eksekusi XAU/USD'],
            rows: [
              ['#1 (S+)', '**ICT Unicorn (Breaker + FVG)**', 'Konfluensi dua zona sekaligus: mitigasi bekas OB gagal (Breaker) beririsan dengan celah Imbalance (FVG)', 'Prioritas tertinggi bila berada di Discount/Premium dan searah DOL'],
              ['#2 (A+)', '**Breaker Block (BB)**', 'Terbentuk dari Sweep Liquidity dan penembusan balik tegas; reaksi penolakan umumnya lebih cepat dari OB standar', 'Ditandai label `+BB` / `-BB` pada Chart Gold Mapping'],
              ['#3 (A+)', '**Inversion FVG (iFVG)**', 'Membuktikan kegagalan zona lawan pasca-Sweep atau sentuhan POI HTF', 'Efektif pada momentum cepat sesi NY AM ketika koreksi dangkal'],
              ['#4 (A)', '**Order Block Valid + FVG**', 'Jejak akumulasi order di pangkal dorongan yang langsung dikonfirmasi oleh celah FVG', 'Gunakan Open OB (body ringkas) atau 50% Mean Threshold (body lebar)'],
              ['#5 (A-)', '**Fair Value Gap (FVG) Fresh**', 'Celah 3 candle yang belum pernah diuji; paling sering muncul pada Model ICT 2022 & Silver Bullet', 'Wajib di zona Discount/Premium yang benar dan menghormati 50% CE'],
              ['#6 (B+)', '**Mitigation Block (MB)**', 'Terbentuk tanpa sweep pada swing sebelumnya sehingga likuiditas yang diserap lebih sedikit dibanding Breaker', 'Hanya digunakan jika beririsan dengan FVG dan searah penuh dengan Bias H1']
            ]
          }
        },
        {
          number: '24.4',
          heading: 'Empat Langkah Praktis Menyaring Lokasi dan Memilih PD Array Terbaik',
          shortTitle: '4 Langkah Praktis OTE',
          paragraphs: [
            'Agar proses pemilihan zona entry tidak membingungkan saat grafik menampilkan banyak kotak sekaligus, terapkan urutan kerja 4 langkah berikut:',
            '1. **Tarik Fibonacci OTE pada Gelombang Impulsif Aktif:** Untuk skenario **Buy**, tarik dari Swing Low (`1`) ke Swing High (`0`). Untuk skenario **Sell**, tarik dari Swing High (`1`) ke Swing Low (`0`).',
            '2. **Eliminasi Zona di Sisi Salah:** Abaikan seluruh PD Array Buy yang berada di atas garis `50%` (Premium) dan seluruh PD Array Sell yang berada di bawah garis `50%` (Discount).',
            '3. **Cari Konfluensi di Zona OTE (`61,8% – 78,6%`):** Periksa apakah terdapat PD Array **Fresh** yang berhimpitan dengan area OTE atau titik tengah `70,5%`. Jangan memasang Limit Order buta jika tidak ada PD Array di area tersebut.',
            '4. **Terapkan Hierarki PD Array:** Jika ada lebih dari satu zona valid, pilih satu zona dengan peringkat tertinggi (`Unicorn > Breaker > iFVG > OB+FVG > FVG Fresh > Mitigation`), lalu pastikan SL di luar garis `100%` menjaga rasio R:R minimal `1 : 2`.'
          ]
        },
        {
          number: '24.5',
          heading: 'Studi Kasus XAU/USD M15: Menggabungkan Dealing Range, OTE, dan FVG',
          shortTitle: 'Studi Kasus Lengkap OTE',
          paragraphs: [
            'Berikut contoh perhitungan matematis penggabungan Dealing Range, garis Equilibrium, zona OTE, dan Bullish FVG pada grafik M15 XAU/USD:'
          ],
          exampleBox: {
            title: 'Hitungan Presisi OTE + Bullish FVG di XAU/USD M15 (Sesi London · 15:40 WITA / 14:40 WIB · Gelombang $20)',
            rows: [
              {
                label: 'Gelombang Impulsif (Dealing Range)',
                detail: 'XAU/USD M15 mencetak Displacement naik dari Swing Low **`2.640,00`** (`1`) menuju Swing High **`2.660,00`** (`0`) dengan total rentang gelombang = **`$20,00`**.'
              },
              {
                label: 'Perhitungan Garis Equilibrium & OTE',
                detail: '1. **50% Equilibrium (`0.5`):** `2.660,00 - (50% × $20)` = **`2.650,00`** (batas atas area Buy).\n2. **61,8% (`0.618`, Batas Awal OTE):** `2.660,00 - $12,36` = **`2.647,64`**.\n3. **70,5% (`0.705`, Titik Tengah OTE):** `2.660,00 - $14,10` = **`2.645,90`**.\n4. **78,6% (`0.786`, Batas Dalam OTE):** `2.660,00 - $15,72` = **`2.644,28`**.'
              },
              {
                label: 'Konfluensi PD Array & Eksekusi',
                detail: 'Pada rentang `2.645,00 – 2.647,00` terdapat **Bullish FVG Fresh** yang berhimpitan tepat dengan titik `70,5%` OTE (`2.645,90`). Rencana posisi: Buy Limit di **`2.646,00`**, SL struktural di bawah Swing Low **`2.639,50`** (risiko **`$6,50`**), TP konservatif pada puncak lama **`2.660,00`** (`+$14,00` → **R:R 1 : 2,15**).'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Ringkasan Bagian IV',
            title: 'Seluruh Komponen PD Array (Bab 18–24) Telah Lengkap',
            body: 'Bagian IV mencakup seluruh alat zona entry ICT: **Displacement, FVG + 50% CE, iFVG, Order Block + 50% MT, Breaker/Mitigation/Unicorn, CISD vs MSS, serta OTE & Hierarki PD Array**. Pada Bagian V, seluruh komponen tersebut dirangkai menjadi prosedur eksekusi terpadu, filter pembatalan, dan manajemen risiko.'
          }
        }
      ],
      keyTakeaways: [
        '**Aturan Lokasi:** Cari **BUY** hanya di zona **Discount (`< 50%`)** dan cari **SELL** hanya di zona **Premium (`> 50%`)** pada Dealing Range impulsif.',
        '**Zona OTE** (*Optimal Trade Entry*) berada pada koreksi **`61,8% – 78,6%`** dengan titik tengah **`70,5%`**, dan wajib berhimpitan dengan PD Array valid.',
        '**Hierarki PD Array:** `ICT Unicorn (BB+FVG) > Breaker Block > iFVG > Order Block + FVG > FVG Fresh > Mitigation Block`.',
        'Apabila harga tidak terkoreksi masuk ke zona Discount/Premium yang sesuai, lewati peluang tersebut agar rasio Risk-to-Reward tetap sehat.'
      ],
      bridgeNext: 'Setelah menyelesaikan seluruh komponen zona entry pada Bagian IV (Bab 18–24), Bagian V menggabungkan analisis konteks HTF dan PD Array ke dalam prosedur eksekusi langkah demi langkah, dimulai dari **Bab 25: Model Entry Utama (ICT 2022): Merakit Sweep → MSS/CISD → FVG/OB dari Nol**.',
      practiceCta: {
        label: 'Cek Posisi Premium/Discount Live di Mapping',
        description: 'Lihat persentase Dealing Range live dan prioritas zona BB/iFVG/OB/FVG di Mapping Cockpit Amy FX Pro.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Premium, Discount, OTE & Hierarki PD Array',
          paragraphs: [
            'Buy hanya dilakukan di bawah 50% (Discount) dan Sell hanya di atas 50% (Premium), dengan fokus konfluensi PD Array di zona OTE (61,8%–78,6%, titik tengah 70,5%) mengikuti urutan prioritas Unicorn > BB > iFVG > OB+FVG > FVG > MB.'
          ]
        }
      ],
      mappingSteps: [
        'Tarik Fibonacci dari awal hingga ujung gelombang impulsif (Dealing Range) dengan level 0, 0.5, 0.618, 0.705, 0.786, dan 1.',
        'Saring hanya PD Array yang berada di zona Discount (< 50% untuk Buy) atau Premium (> 50% untuk Sell).',
        'Apabila muncul beberapa PD Array bersamaan, pilih berdasarkan Hierarki: Unicorn > Breaker > iFVG > OB+FVG > FVG Fresh > Mitigation.'
      ],
      decisionTree: [
        {
          condition: 'Muncul Bullish FVG rapi di 70% Premium saat tren naik.',
          action: 'SKIP — posisi terlalu tinggi (Premium); tunggu koreksi ke bawah 50% Discount atau lewati setup.'
        },
        {
          condition: 'Harga menyentuh garis 70,5% OTE, tetapi di titik tersebut tidak ada FVG, OB, maupun Breaker.',
          action: 'Jangan langsung entry — OTE adalah filter lokasi, tetap wajib ada PD Array dan konfirmasi struktur.'
        }
      ],
      validRules: [
        'Buy hanya di zona Discount (< 50%) dan Sell hanya di zona Premium (> 50%), idealnya berhimpitan dengan OTE 61,8%–78,6%.',
        'Mengutamakan PD Array dengan peringkat hierarki lebih tinggi (Unicorn, Breaker, iFVG, atau OB+FVG).'
      ],
      invalidRules: [
        'Membeli pada area > 50% (Premium) atau menjual pada area < 50% (Discount).',
        'Menggunakan garis Fibonacci 70,5% sebagai sinyal tunggal tanpa kehadiran PD Array.'
      ],
      xauScenario: {
        context: 'Sesi London (15:40 WITA / 14:40 WIB): Gelombang naik XAU/USD M15 dari 2.640,00 ke 2.660,00 ($20).',
        steps: [
          'Equilibrium 50% = 2.650,00; Zona OTE 61,8%–78,6% = 2.647,64 – 2.644,28 (titik tengah 70,5% = 2.645,90).',
          'Bullish FVG Fresh di 2.645–2.647 → Buy Limit 2.646,00, SL struktural 2.639,50 ($6,50), TP 2.660,00 (+$14,00, R:R 1 : 2,15).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Entry di Fibonacci Tanpa PD Array',
        context: 'Trader memasang Sell Limit tepat di garis 70,5% padahal tidak terdapat FVG/OB dan struktur M5 belum berbalik.',
        whyFailed: 'Tanpa PD Array dan konfirmasi struktur, harga menembus level 70,5% melanjutkan tren sebelumnya.'
      },
      goldenRules: [
        'Jika harga tidak memberi area Discount/Premium yang sah, lewati setup tersebut daripada memaksakan R:R sempit.',
        'Pertemuan PD Array bermutu tinggi di dalam zona OTE (61,8%–78,6%) memberikan efisiensi risiko-imbal hasil terbaik.'
      ],
      quiz: [
        {
          question: 'XAU/USD mencetak gelombang Displacement naik dari `2.600,00` ke `2.640,00`. Di area harga berapakah Anda boleh mencari PD Array (FVG/OB) untuk **BUY**?',
          options: [
            'Di atas `2.630,00` (Premium)',
            '**Di bawah `2.620,00` (Zona Discount `< 50%` Equilibrium)**',
            'Tepat di puncak `2.640,00`',
            'Di mana saja asalkan muncul candle bullish'
          ],
          answerIndex: 1,
          explanation: 'Titik 50% Equilibrium berada di `2.620,00`; seluruh area di bawah `2.620,00` adalah Discount yang sah untuk mencari Buy.'
        },
        {
          question: 'Berapakah rentang persentase resmi **Zona Optimal Trade Entry (OTE)** beserta titik tengahnya dalam metodologi ICT?',
          options: [
            '`10% – 25%` (titik tengah `15%`)',
            '**`61,8% – 78,6%`** dengan titik tengah **`70,5%`**',
            '`45% – 55%` saja',
            '`90% – 100%`'
          ],
          answerIndex: 1,
          explanation: 'Zona OTE terletak pada koreksi mendalam 61,8% hingga 78,6% dengan titik tengah 70,5%.'
        },
        {
          question: 'Menurut **Hierarki PD Array (PD Array Matrix)** yang juga digunakan di Mapping Cockpit Amy FX Pro, manakah urutan kekuatan yang benar dari terkuat ke standar?',
          options: [
            'Mitigation Block > FVG Tunggal > ICT Unicorn',
            '**ICT Unicorn (Breaker + FVG) > Breaker Block > iFVG > Order Block + FVG > FVG Fresh > Mitigation Block**',
            'Semua PD Array kekuatannya sama persis sehingga bisa dipilih acak',
            'Indikator osilator > Breaker Block > Order Block'
          ],
          answerIndex: 1,
          explanation: 'Konfluensi ganda Unicorn (BB+FVG) dan zona balik kutub (Breaker & iFVG) menempati hierarki teratas dibanding zona tunggal maupun Mitigation Block tanpa sweep.'
        },
        {
          question: 'Harga XAU/USD menyentuh tepat garis `70,5%` OTE, tetapi di sekitar titik tersebut **tidak ada FVG, Order Block, ataupun Breaker Block**. Apa tindakan yang benar?',
          options: [
            'Langsung Market Order karena `70,5%` pasti memantul 100%',
            '**Tidak langsung entry** — karena OTE hanyalah filter lokasi Discount/Premium; tetap wajib ada PD Array dan konfirmasi struktur yang valid',
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
      summary: 'Prosedur mekanis 4 tahap Model ICT 2022 (Sweep Liquidity → Displacement + MSS/CISD → Retracement Discount/Premium ke FVG/OB → SL struktural & target DOL), panduan praktis penempatan entry/SL/TP, aturan pembatalan pending order (Cancel Rule), serta studi kasus XAU/USD M5 sesi NY AM.',
      bookSections: [
        {
          number: '25.1',
          heading: 'Struktur Dasar dan Peran Model ICT 2022 pada XAU/USD',
          shortTitle: 'Dasar Model ICT 2022',
          paragraphs: [
            'Bagian V menyatukan seluruh fondasi yang telah Anda pelajari sebelumnya — struktur pasar (Bagian II), konteks arah, sesi Killzone, dan berita (Bagian III), serta susunan PD Arrays (Bagian IV) — ke dalam prosedur eksekusi yang rapi dan dapat diulang setiap hari.',
            '**Model ICT 2022** menjadi model entry utama karena urutan validasinya sepenuhnya objektif dan berbasis sebab-akibat. Anda tidak perlu menebak puncak atau dasar harga secara spekulatif. Sebaliknya, Anda menunggu bukti nyata berupa **Liquidity Sweep** di level kunci, diikuti dorongan **Displacement + MSS/CISD** yang meninggalkan **Fair Value Gap (FVG)** segar, lalu masuk secara terukur ketika harga terkoreksi ke zona Discount atau Premium.',
            'Keunggulan praktis dari kerangka ini terletak pada ketegasan penyaringannya: apabila **salah satu** dari keempat tahap wajibnya tidak muncul di grafik, keputusan yang benar adalah menahan diri dan menunggu sesi berikutnya.'
          ]
        },
        {
          number: '25.2',
          heading: 'Prosedur 4 Tahap Mekanis ICT 2022 (H1 → M15 → M5)',
          shortTitle: 'Prosedur 4 Tahap',
          paragraphs: [
            'Jalankan keempat tahap berikut secara berurutan dari atas ke bawah. Setiap tahap memvalidasi tahap berikutnya sehingga tidak boleh ada langkah yang dilewati:'
          ],
          table: {
            caption: 'Rantai Eksekusi Mekanis Model Utama ICT 2022 (XAU/USD · H1 → M15 → M5)',
            headers: ['Tahap', 'Timeframe & Fokus', 'Syarat Wajib Terpenuhi', 'Keputusan Jika Tidak Ada'],
            rows: [
              ['**1. Konteks & Liquidity Sweep**', 'H1 / M15 (Killzone WITA/WIB)', 'Daily Bias & DOL jelas, di luar News Lock, dan terjadi **Liquidity Sweep** nyata pada level kunci (`Asia H/L`, `London H/L`, `PDH/PDL`, `EQH/EQL`) atau sentuhan **POI HTF**', '**Tunggu.** Tanpa Sweep atau POI HTF, sinyal M5 belum memiliki dasar konteks yang kuat'],
              ['**2. Konfirmasi Balik Arah**', 'M5 (atau M15)', 'Muncul **Displacement** (`≥ 65%` body) yang menutup **Body Close** mematahkan Swing (**MSS**) atau Open rangkaian sweep (**CISD**) sambil mencetak **FVG segar**', '**Lewati.** Pergerakan lambat tanpa Displacement dan FVG tidak memenuhi syarat eksekusi'],
              ['**3. Zona Entry Discount/Premium**', 'M5 (Dealing Range Kaki MSS)', 'Tarik Fibonacci pada kaki dorongan → pastikan **FVG / OB** berada di sisi **Discount (`< 50%`)** untuk Buy atau **Premium (`> 50%`)** untuk Sell (ideal di OTE `61,8%–78,6%`)', 'Jika FVG hanya terbentuk di area mahal (`> 50%` untuk Buy), **lewati setup**'],
              ['**4. Proteksi & Target**', 'M5 → H1 DOL', 'Pasang SL di luar ujung wick ekstrem sweep (+ buffer spread `$0,50–$1,00`), TP1 di Liquidity Pool terdekat (`≥ 1 : 2`), dan TP2 di target DOL utama (`PDH/PDL` / Pool H1)', 'Jika R:R menuju target realistis `< 1 : 2`, **batalkan setup**']
            ]
          }
        },
        {
          number: '25.3',
          heading: 'Panduan Praktis Memilih Titik Entry, Stop Loss, dan Target Profit',
          shortTitle: 'Entry, SL & Target',
          paragraphs: [
            'Setelah keempat tahap di atas terkonfirmasi, tantangan praktis berikutnya adalah menentukan di harga mana `Limit Order` dipasang serta bagaimana menempatkan SL dan TP agar proporsional terhadap volatilitas XAU/USD:',
            '1. **Memilih Titik Entry (Tepi FVG vs `50% CE` vs `Open OB`):** Untuk pendekatan seimbang yang mengutamakan keterjemputan order, pasang `Limit Order` pada tepi pertama kotak FVG yang sudah masuk sisi Discount/Premium. Jika rentang FVG terlalu lebar (`> $4,00`) sehingga R:R menyempit, geser entry lebih dalam ke garis **`50% Consequent Encroachment (CE)`** atau **`Open Order Block`** tepat di belakangnya.',
            '2. **Menempatkan Stop Loss Struktural:** Letakkan Stop Loss tepat di luar ujung wick ekstrem sweep (titik invalidasi struktur) ditambah **buffer spread `$0,50–$1,00`** agar posisi — terutama Sell yang terpicu harga Ask — tidak tersentuh pelebaran spread sesaat.',
            '3. **Menyusun Target Profit Bertingkat:** Arahkan **`TP1`** ke Liquidity Pool internal terdekat yang sudah memberi rasio minimal **`1 : 2`** (tempat ideal menutup sebagian posisi atau mengamankan risiko), dan arahkan **`TP2`** ke target **Draw on Liquidity (DOL)** utama seperti `PDH/PDL` atau `Asia/London High-Low`.'
          ]
        },
        {
          number: '25.4',
          heading: 'Aturan Pembatalan Pending Order (Cancel Rule)',
          shortTitle: 'Aturan Batal Limit Order',
          paragraphs: [
            'Kesalahan yang kerap terjadi pada penerapan Model ICT 2022 adalah membiarkan `Limit Order` tetap terpasang meskipun harga sudah bergerak cepat menyentuh target Liquidity (`TP1` atau `DOL`) tanpa sempat menjemput order tersebut. Ketika harga kemudian berbalik arah dan menyentuh Limit Order kadaluarsa itu, posisi justru masuk pada awal fase pembalikan baru sehingga rentan menyentuh Stop Loss.',
            'Kondisi ini terjadi karena tujuan pergerakan harga (**Draw on Liquidity**) sudah selesai terpenuhi. Terapkan **3 Aturan Pembatalan Pending Order (Cancel Rule)** berikut secara disiplin:',
            '1. **Target Liquidity Tercapai Lebih Dulu:** Apabila harga sudah menempuh `80%–100%` jarak menuju `TP1` atau target DOL sebelum menjemput Limit Order → **segera batalkan (`Cancel`) pending order**.',
            '2. **Berakhirnya Killzone atau Memasuki News Lock:** Apabila Limit Order belum tereksekusi hingga jendela Killzone berakhir, atau tersisa 15–30 menit menuju rilis berita berdampak tinggi USD (CPI, NFP, FOMC) → **segera batalkan**.',
            '3. **Terbentuk Struktur Berlawanan:** Apabila sebelum menjemput order, harga membentuk MSS berlawanan arah yang menembus batas invalidasi → **segera batalkan**.'
          ]
        },
        {
          number: '25.5',
          heading: 'Studi Kasus Lengkap XAU/USD: Bearish ICT 2022 di NY AM Killzone',
          shortTitle: 'Studi Kasus ICT 2022 Gold',
          paragraphs: [
            'Berikut penerapan lengkap keempat tahap Model ICT 2022 beserta perhitungan risiko dan target pada grafik M5 XAU/USD saat sesi New York AM:'
          ],
          exampleBox: {
            title: 'Eksekusi Model ICT 2022 — Bearish Setup XAU/USD M5 (NY AM · 20:45 WITA / 19:45 WIB)',
            rows: [
              {
                label: 'Tahap 1 — Konteks & Sweep Liquidity',
                detail: 'Daily Bias dan struktur H1 **Bearish** mengarah ke target DOL **`PDL 2.632,00`**, tanpa jadwal rilis berita News Lock. Pukul `20:35 WITA / 19:35 WIB`, harga naik menyapu **London High `2.652,50`** hingga ujung wick **`2.654,00`** lalu berbalik turun.'
              },
              {
                label: 'Tahap 2 — Displacement + MSS + FVG',
                detail: 'Dua candle bearish M5 berbadan penuh (`> 70%` body) menutup **Body Close** di bawah Swing Low **`2.649,00`**, mengonfirmasi **Bearish MSS** sekaligus membentuk **Bearish FVG (`SIBI`)** segar di **`2.650,00 – 2.652,00`**. Pada rentang penurunan `2.654,00 → 2.646,00` (Equilibrium `50%` di `2.650,00`), kotak SIBI tersebut berada di sisi **Premium (`> 50%`)**.'
              },
              {
                label: 'Tahap 3 & 4 — Limit Order, SL Struktural & Target Bertingkat',
                detail: 'Pasang **Sell Limit** di **`2.650,50`** (tepi bawah SIBI di zona Premium). **SL** diletakkan di **`2.654,80`** (ujung wick sweep `2.654,00` + buffer spread `$0,80` → risiko **`$4,30`**). **TP1** diarahkan ke SSL internal **`2.641,50`** (`+$9,00` → **`2,09R`**), dan **TP2** ke **`PDL 2.632,50`** (`+$18,00` → **`4,19R`**).'
              }
            ]
          },
          callout: {
            tone: 'tip',
            kicker: 'Rekomendasi Praktik',
            title: 'Uji Model ICT 2022 Minimal 30 Transaksi Sebelum Menambah Model Lain',
            body: 'Model ICT 2022 telah merangkum seluruh prinsip inti ICT secara utuh. Fokuslah melatih, mengeksekusi, dan mencatat minimal 30 sampel transaksi menggunakan urutan **Sweep → MSS/CISD → FVG/OB** ini sebelum menambahkan variasi eksekusi alternatif.'
          }
        }
      ],
      keyTakeaways: [
        '**Model ICT 2022** berjalan melalui 4 tahap mekanis berurutan: **Konteks/Sweep di Killzone → Displacement + MSS/CISD + FVG → Retracement Discount/Premium ke FVG/OB → SL di luar Sweep + TP menuju DOL**.',
        'Apabila salah satu syarat wajib tidak muncul (tanpa Sweep, tanpa Displacement/FVG, atau posisi di luar Discount/Premium), keputusan yang tepat adalah **lewati (Skip)**.',
        'Tempatkan SL di luar ujung wick sweep ditambah **buffer spread (`$0,50–$1,00`)**, dan pastikan rasio Risk-to-Reward menuju Liquidity Pool terdekat minimal **`1 : 2`**.',
        '**Cancel Rule:** Segera batalkan Pending Limit Order jika target `TP1/DOL` sudah tercapai lebih dulu, menjelang News Lock, atau saat jendela Killzone berakhir.'
      ],
      bridgeNext: 'Model ICT 2022 mencakup sebagian besar kondisi pasar harian yang terstruktur. Namun pada kondisi momentum cepat di XAU/USD ketika harga tidak memberi koreksi dalam ke FVG baru, atau saat terjadi pembalikan tajam di level ekstrem mingguan, terdapat 3 variasi eksekusi pelengkap yang dibahas di **Bab 26: Model Entry Alternatif: iFVG Entry, Unicorn Setup & Turtle Soup (SMR)**.',
      practiceCta: {
        label: 'Latih Model ICT 2022 di Replay Lab',
        description: 'Praktikkan alur Sweep → MSS → FVG bar-by-bar di Backtest Replay Lab XAU/USD pada sesi London dan NY (WITA/WIB).',
        href: 'trading-practice/candle-replay.html'
      },
      conceptBlocks: [
        {
          heading: 'Prosedur 4 Tahap Mekanis Model ICT 2022',
          paragraphs: [
            'Model ICT 2022 menggabungkan Liquidity Sweep di Killzone → Displacement + MSS/CISD + FVG → Retracement Discount/Premium → SL di luar ujung Sweep (+ buffer spread) dan TP menuju DOL terdekat (minimal R:R 1:2), dilengkapi Cancel Rule bila target tercapai lebih dulu.'
          ]
        }
      ],
      mappingSteps: [
        'Tunggu Sweep Liquidity nyata (Asia/London/PDH/PDL) atau sentuhan POI HTF di dalam Killzone (WITA/WIB) dan di luar News Lock.',
        'Konfirmasi Displacement + Body Close MSS/CISD di M5 yang meninggalkan FVG segar.',
        'Pasang Limit Order pada tepi FVG, 50% CE, atau Open OB di zona Discount (Buy) / Premium (Sell) dengan SL di balik ujung Sweep (+ buffer spread) dan TP minimal 1:2.',
        'Segera batalkan (Cancel) Limit Order jika harga terlanjur menyentuh target TP1/DOL sebelum order terjemput.'
      ],
      decisionTree: [
        {
          condition: 'Sell Limit di Bearish FVG belum terjemput, tetapi harga sudah langsung turun menyentuh TP1/DOL.',
          action: '**Segera batalkan (`Cancel`) Sell Limit** — target Draw on Liquidity sudah tercapai sehingga order lama tidak lagi valid.'
        },
        {
          condition: 'Muncul FVG M5 rapi, tetapi sebelumnya tidak ada Sweep Liquidity maupun sentuhan POI HTF.',
          action: '**Lewati (`Skip`)** — syarat tahap 1 Model ICT 2022 tidak terpenuhi.'
        }
      ],
      validRules: [
        'Wajib ada Sweep Liquidity nyata (Asia High/Low, London High/Low, PDH/PDL, atau EQH/EQL) atau sentuhan POI HTF sebelum MSS.',
        'MSS atau CISD terjadi dengan candle Displacement tegas (≥ 65% body) yang mencetak FVG segar di dalam Killzone.'
      ],
      invalidRules: [
        'Membiarkan pending Limit Order tetap aktif setelah harga sudah mencapai target Liquidity (DOL).',
        'Masuk pada setup dengan R:R ke Liquidity Pool realistis kurang dari 1:2.'
      ],
      xauScenario: {
        context: 'Sesi NY AM (20:45 WITA / 19:45 WIB), Bias H1 Bearish menuju PDL 2.632,00.',
        steps: [
          'Sweep London High 2.652,50 hingga 2.654,00 → MSS M5 menembus 2.649,00 dan mencetak SIBI 2.650,00–2.652,00 di zona Premium.',
          'Sell Limit 2.650,50, SL 2.654,80 ($4,30), TP1 2.641,50 (+$9,00 / 2,09R), TP2 PDL 2.632,50 (+$18,00 / 4,19R).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: Tidak Membatalkan Limit Order Kadaluarsa',
        context: 'Trader membiarkan Sell Limit aktif padahal harga sudah lebih dulu menyapu PDL target dan mulai berbalik naik.',
        whyFailed: 'Order terjemput ketika fase pembalikan baru sedang berlangsung sehingga langsung mengenai Stop Loss.'
      },
      goldenRules: [
        'Apabila harga menyentuh target Liquidity sebelum menjemput Limit Order, segera batalkan order tersebut.',
        'Kuasai Model ICT 2022 minimal 30 transaksi sebelum menambahkan variasi model eksekusi lain.'
      ],
      quiz: [
        {
          question: 'Manakah urutan 4 tahap mekanis yang benar pada **Model Entry Utama (ICT 2022)**?',
          options: [
            'Pasang Limit dulu → baru tunggu Sweep → baru cek jadwal berita',
            '**Konteks/Sweep Liquidity di Killzone → Displacement + MSS/CISD + FVG → Retracement ke FVG/OB di Discount/Premium → SL di luar Sweep + TP di DOL**',
            'Cari 5 indikator oversold → langsung Market Order di sesi Asia',
            'Tunggu berita CPI → pasang Buy Stop dan Sell Stop bersamaan'
          ],
          answerIndex: 1,
          explanation: 'Model ICT 2022 menunggu Liquidity Sweep, bukti niat institusi (Displacement + MSS/CISD + FVG), lalu masuk pada zona Discount/Premium dengan SL struktural dan target DOL.'
        },
        {
          question: 'Anda sudah memasang `Sell Limit` di Bearish FVG `2.650,50`, tetapi harga langsung turun mencapai target `TP1 / PDL` tanpa sempat naik menjemput order Anda. Apa tindakan wajib sesuai **Cancel Rule**?',
          options: [
            'Biarkan `Sell Limit` tetap aktif sampai keesokan harinya',
            '**Segera hapus (`Cancel`) Sell Limit tersebut** karena target DOL sudah selesai tercapai',
            'Langsung klik Market Sell di dasar bawah agar tidak ketinggalan',
            'Memperlebar Stop Loss sambil menunggu pantulan'
          ],
          answerIndex: 1,
          explanation: 'Setelah target Draw on Liquidity tercapai sebelum pullback, setup lama tidak lagi valid dan berisiko terkena pembalikan arah.'
        },
        {
          question: 'Dalam studi kasus Bearish ICT 2022 (`Sell Limit 2.650,50`, ujung wick sweep `2.654,00`, SL `2.654,80` = risiko `$4,30`), mengapa SL diletakkan di `2.654,80` bukan tepat di `2.654,00`?',
          options: [
            'Supaya angka desimal belakangnya genap',
            'Untuk memberi **buffer spread** (`+$0,80`) di luar titik invalidasi struktural ujung wick sweep agar tidak mudah tersentuh pelebaran spread Ask',
            'Karena platform melarang angka bulat `.00`',
            'Supaya jarak SL mendekati $20'
          ],
          answerIndex: 1,
          explanation: 'Menambahkan buffer spread di luar ujung ekstrem sweep melindungi posisi Sell dari pelebaran spread Ask tanpa mengubah batas invalidasi struktur.'
        },
        {
          question: 'Terjadi Sweep Asia Low + MSS M5 + Bullish FVG, namun jarak dari titik entry ke Liquidity Pool lawan terdekat hanya menghasilkan **R:R `1 : 1,2`**. Apa keputusan mekanis yang benar?',
          options: [
            'Tetap masuk dengan lot 2× lebih besar',
            '**Batalkan / Lewati setup** karena R:R di bawah standar minimal `1 : 2` — ruang profit terlalu sempit dibanding risikonya',
            'Geser TP jauh melampaui ADR harian tanpa dasar Liquidity',
            'Geser SL masuk ke tengah kotak FVG agar R:R terlihat besar'
          ],
          answerIndex: 1,
          explanation: 'Jangan memanipulasi SL atau TP demi memaksakan R:R; jika ruang menuju Liquidity aktual di bawah 1:2, lewati setup tersebut.'
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
            'Sering kali pada XAU/USD, harga sweep Liquidity lalu melesat dengan FVG kecil yang berada di atas OB, atau harga melakukan koreksi sedikit lebih dalam menembus FVG untuk menjemput Order Block di pangkal dorongan.',
            'Model 2 membidik reaksi di Open Order Block atau tepat di garis 50% Mean Threshold (MT) dari body OB. Karena posisinya lebih dalam ke arah ekstrem, jarak Stop Loss jauh lebih ketat — menghasilkan R:R 1:3 hingga 1:5.'
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
        'OB adalah candle berlawanan terakhir yang langsung sweep Liquidity sebelum Displacement.',
        'Terdapat FVG yang terbentuk persis keluar dari OB tersebut.',
        'Entry di Open OB (konservatif) atau 50% Mean Threshold (sniper) dengan SL di luar wick OB.'
      ],
      invalidRules: [
        'Memakai OB di tengah-tengah jalan (continuation OB) yang sudah pernah disentuh.',
        'Memaksa entry di Mean Threshold jika harga sudah memantul kuat dari Open OB dan mencetak struktur baru.',
        'Ukuran candle OB terlalu raksasa (misal >$10 di M5) sehingga risiko terlalu besar.'
      ],
      xauScenario: {
        context: 'Sesi London (16:15 WITA), XAU/USD sweep PDL 2.635 dengan 1 candle bearish M5 (Open 2.638,50, Close 2.636,00, Wick Low 2.634,50) lalu meledak naik mencetak MSS + FVG.',
        steps: [
          'Tandai Bullish OB: Open 2.638,50, Mean Threshold (50% body) = 2.637,25.',
          'Saat harga turun mengisi FVG dan menusuk masuk ke 2.637,50 (dekat MT) dengan ekor penolakan, Buy Limit terjemput.',
          'SL di 2.633,80 ($3,70 risiko). Target Asia High 2.651,00 (+$13,50) menghasilkan R:R 1:3,6.'
        ]
      },
      goldenRules: [
        'OB terbaik selalu menjadi "pelaku" yang sweep Liquidity dan melahirkan FVG.',
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
            'OB tersebut sweep Liquidity dan langsung melahirkan Displacement + FVG',
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
      summary: 'Mekanisme balik kutub Inversion Fair Value Gap (+iFVG dan -iFVG) saat FVG lawan ditembus penuh oleh Body Close pasca-sweep Liquidity, tabel kriteria validasi, 4 langkah praktis eksekusi, waktu efektif NY AM WITA/WIB, serta studi kasus XAU/USD.',
      bookSections: [
        {
          number: '20.1',
          heading: 'Pengertian dan Mekanisme Balik Kutub Inversion Fair Value Gap (iFVG)',
          shortTitle: 'Mekanisme iFVG',
          paragraphs: [
            'Pada Bab 19 Anda telah mempelajari bahwa sebuah **Bearish FVG (`SIBI`)** berfungsi sebagai area penolakan turun. Namun, perhatikan situasi ketika XAU/USD baru saja melakukan sweep `Asia Low` atau `PDL` sambil meninggalkan sebuah Bearish FVG pada kaki penurunan terakhirnya.',
            'Jika dominasi penjual masih kuat, Bearish FVG tersebut seharusnya menahan pantulan harga. Sebaliknya, apabila muncul candle bullish yang menutup **Body Close menembus penuh di atas seluruh kotak Bearish FVG tersebut**, hal ini membuktikan bahwa pertahanan penjual telah gagal dan kendali arus order berpindah ke pihak pembeli.',
            'Pada saat itulah Bearish FVG yang gagal berbalik peran menjadi **Bullish Inversion Fair Value Gap (`+iFVG`)** — zona yang semula menolak harga turun kini berfungsi sebagai penopang untuk melanjutkan kenaikan. Sebaliknya, Bullish FVG (`BISI`) yang ditembus penuh ke bawah oleh Body Close berubah menjadi **Bearish Inversion Fair Value Gap (`-iFVG`)**. *(Pada Chart Gold Mapping Cockpit Amy FX Pro, zona ini ditampilkan sebagai `+iFVG` ungu untuk Buy dan `-iFVG` amber untuk Sell.)*'
          ]
        },
        {
          number: '20.2',
          heading: 'Syarat Mutlak iFVG Valid vs FVG Tertembus di Tengah Konsolidasi',
          shortTitle: 'Syarat Mutlak iFVG',
          paragraphs: [
            'Kesalahan yang paling sering terjadi saat mempelajari iFVG adalah menganggap **setiap** FVG yang tertembus di pasar mendatar (*sideways*) sebagai sinyal balik arah. Tanpa konteks Liquidity, FVG di tengah konsolidasi memang akan sering ditembus bolak-balik. Gunakan tabel kriteria berikut untuk menyaringnya:'
          ],
          table: {
            caption: 'Kriteria Validasi +iFVG (Bullish) dan -iFVG (Bearish)',
            headers: ['Jenis iFVG', 'Asal Zona', 'Syarat Sah Perubahan Kutub (Wajib)', 'Konteks Wajib di Latar Belakang'],
            rows: [
              ['**Bullish `+iFVG`**', 'Bekas **Bearish FVG (SIBI)** pada kaki turun terakhir', 'Candle bullish menutup **Body Close** penuh di atas batas atas SIBI (bukan sekadar wick)', 'Terbentuk sesudah **Sweep SSL** (`Asia Low`, `PDL`, `EQL`) atau sentuhan **POI Bullish HTF**'],
              ['**Bearish `-iFVG`**', 'Bekas **Bullish FVG (BISI)** pada kaki naik terakhir', 'Candle bearish menutup **Body Close** penuh di bawah batas bawah BISI (bukan sekadar wick)', 'Terbentuk sesudah **Sweep BSL** (`Asia High`, `PDH`, `EQH`) atau sentuhan **POI Bearish HTF**'],
              ['Bukan iFVG (Skip)', 'FVG yang hanya ditembus **wick** lalu body kembali tutup di dalam kotak', 'Belum terjadi perubahan kutub — FVG asal masih aktif', 'Tunggu penutupan candle selesai sebelum mengambil keputusan']
            ]
          }
        },
        {
          number: '20.3',
          heading: 'Empat Langkah Praktis Mengidentifikasi dan Mengeksekusi iFVG',
          shortTitle: '4 Langkah Praktis iFVG',
          paragraphs: [
            'Agar Anda tidak tergesa-gesa masuk sebelum kutub FVG benar-benar berbalik, ikuti urutan 4 langkah berikut di chart XAU/USD:',
            '1. **Pastikan Ada Pemicu HTF (Sweep atau POI):** Tunggu harga menyapu level Liquidity penting (`Asia High/Low`, `PDH/PDL`, `EQH/EQL`) atau menyentuh POI H1/H4 di dalam jam Killzone.',
            '2. **Tandai FVG Lawan Terakhir di Kaki Sweep:** Cari FVG terakhir yang mengantar harga menuju titik sweep tersebut (misalnya Bearish FVG terakhir saat harga turun menyapu `Asia Low`).',
            '3. **Tunggu Body Close Menembus Penuh:** Jangan masuk saat candle masih berjalan atau baru menyentuh dengan wick; pastikan 1 candle M5 menutup badannya penuh melewati sisi belakang kotak FVG lawan.',
            '4. **Masuk di Retest Kotak iFVG & Kunci SL di Balik Sweep:** Manfaatkan koreksi singkat ke sisi luar kotak iFVG (atau garis `50% CE`) dengan SL struktural di balik ujung ekstrem sweep. Jika terdapat 2 FVG lawan yang tertembus sekaligus, prioritaskan **iFVG pertama yang paling dekat dengan titik sweep** selama R:R menuju target DOL masih minimal `1 : 2`.'
          ]
        },
        {
          number: '20.4',
          heading: 'Kapan iFVG Efektif Digunakan pada XAU/USD?',
          shortTitle: 'Waktu Efektif iFVG',
          paragraphs: [
            'Pada **NY AM Killzone (`19:00–22:00 WITA` EDT / `20:00–23:00 WITA` EST; padanan `18:00–21:00 WIB` EDT / `19:00–22:00 WIB` EST)** dan **NY AM Silver Bullet**, momentum XAU/USD sering bergerak sangat cepat setelah sweep Liquidity sehingga harga tidak selalu melakukan koreksi dalam menuju Order Block di ujung bawah atau atas.',
            'Dalam kondisi momentum cepat tersebut, **iFVG** memberikan konfirmasi perubahan arus order (*order flow*) lebih awal dibandingkan menunggu pematahan Swing struktur yang jauh. Retest singkat pada sisi luar kotak iFVG atau garis `50% CE`-nya dapat dimanfaatkan sebagai titik masuk yang terukur tanpa harus mengejar harga.'
          ]
        },
        {
          number: '20.5',
          heading: 'Studi Kasus XAU/USD: Bullish +iFVG Pasca-Sweep Asia Low',
          shortTitle: 'Studi Kasus +iFVG Gold',
          paragraphs: [
            'Berikut urutan tahap dan perhitungan risiko pada skenario Bullish `+iFVG` di sesi New York:'
          ],
          exampleBox: {
            title: 'Eksekusi +iFVG M5 XAU/USD (NY AM · 21:10 WITA / 20:10 WIB EDT)',
            rows: [
              {
                label: 'Tahap 1 — Sweep & FVG Lawan',
                detail: 'Bias H1 Bullish menuju target NY High `2.658,50`. Harga turun melakukan sweep **Asia Low `2.644,00`** (wick mencapai `2.643,80`) sambil meninggalkan **Bearish FVG (`SIBI`)** pada **`2.646,50 – 2.648,00`**.'
              },
              {
                label: 'Tahap 2 — Penembusan SIBI oleh Body Close',
                detail: 'Harga menolak melanjutkan penurunan; muncul candle bullish M5 dominan yang menutup **Body Close** di **`2.649,20`**, menembus penuh seluruh kotak SIBI `2.646,50 – 2.648,00`. Zona tersebut resmi berubah kutub menjadi **Bullish `+iFVG`**.'
              },
              {
                label: 'Tahap 3 — Retest & Perhitungan Risiko',
                detail: 'Candle M5 berikutnya terkoreksi singkat menguji batas atas `+iFVG` di **`2.648,00`**. Eksekusi Buy di `2.648,00`, SL struktural di bawah ujung sweep **`2.643,40`** (risiko **`$4,60`**), target NY High **`2.658,50`** (`+$10,50` → **R:R 1 : 2,28**).'
              }
            ]
          },
          callout: {
            tone: 'warn',
            kicker: 'Filter Wajib iFVG',
            title: 'iFVG Tanpa Sweep Liquidity atau POI HTF Memiliki Probabilitas Rendah',
            body: 'Jangan mengeksekusi iFVG hanya karena melihat kotak FVG tertembus di tengah konsolidasi. Pastikan selalu ada **Sweep Liquidity (BSL/SSL)** atau sentuhan **POI H1/H4** sebagai pemicu utama perubahan arah.'
          }
        }
      ],
      keyTakeaways: [
        '**Inversion FVG (iFVG)** terjadi ketika sebuah FVG lawan gagal menahan harga dan ditembus penuh oleh **Body Close** (bukan sekadar wick).',
        'Bekas **Bearish FVG (SIBI)** yang ditembus Body Close ke atas berubah menjadi **Bullish `+iFVG`**; bekas **Bullish FVG (BISI)** yang ditembus Body Close ke bawah berubah menjadi **Bearish `-iFVG`**.',
        'Syarat mutlak iFVG berkualitas tinggi adalah **muncul tepat setelah Sweep Liquidity (BSL/SSL) atau sentuhan POI HTF**.',
        'iFVG efektif digunakan saat momentum XAU/USD pada sesi NY AM bergerak cepat dan tidak memberi retracement dalam ke zona awal.'
      ],
      bridgeNext: 'Setelah memahami FVG normal (Bab 19) dan FVG yang berbalik kutub menjadi iFVG (Bab 20), pembahasan berikutnya mundur satu langkah ke pangkal dorongan tempat akumulasi order institusi terjadi sebelum FVG terbentuk, yakni **Bab 21: Order Block (OB) Bermutu Tinggi vs Trap OB & 50% Mean Threshold**.',
      practiceCta: {
        label: 'Pantau Zona +iFVG / -iFVG di Chart Gold',
        description: 'Buka Chart Gold di Mapping Cockpit untuk melihat zona +iFVG (ungu) dan -iFVG (amber) beserta garis 50% CE secara otomatis.',
        href: '../mapping/index.html'
      },
      conceptBlocks: [
        {
          heading: 'Mekanisme Balik Kutub Inversion FVG (iFVG)',
          paragraphs: [
            'Saat FVG lawan ditembus penuh oleh Body Close pasca-sweep Liquidity atau sentuhan POI HTF, fungsinya berbalik kutub menjadi Inversion FVG (+iFVG atau -iFVG).'
          ]
        }
      ],
      mappingSteps: [
        'Pastikan harga baru saja menyapu level Liquidity (BSL/SSL) atau menyentuh POI HTF di dalam Killzone.',
        'Tandai FVG lawan terakhir pada kaki sweep, lalu tunggu candle menutup Body Close menembus penuh seluruh kotak FVG tersebut.',
        'Gunakan retest ke sisi luar kotak iFVG (atau garis 50% CE) sebagai titik entry dengan SL struktural di balik ujung sweep.'
      ],
      decisionTree: [
        {
          condition: 'Wick candle menembus Bearish FVG, tetapi Body Close kembali ditutup di dalam kotak.',
          action: 'Belum sah menjadi iFVG — jangan entry dulu; tunggu Body Close menembus penuh melewati seluruh kotak FVG.'
        },
        {
          condition: 'FVG tertembus penuh di tengah konsolidasi Asia tanpa Sweep Liquidity atau POI HTF.',
          action: 'SKIP — tanpa konteks Liquidity, iFVG di area konsolidasi sangat rawan whipsaw.'
        }
      ],
      validRules: [
        'Didahului Sweep Liquidity (BSL/SSL) atau sentuhan POI H1/M15 di dalam jam Killzone.',
        'FVG lawan ditembus penuh oleh Body Close (bukan sekadar wick).'
      ],
      invalidRules: [
        'Mengambil iFVG di tengah pasar sideways tanpa konteks Sweep atau POI HTF.',
        'Masuk sebelum candle penembus kotak FVG benar-benar selesai tutup (close).'
      ],
      xauScenario: {
        context: 'NY AM (21:10 WITA / 20:10 WIB EDT): Sweep Asia Low 2.644,00 meninggalkan Bearish FVG 2.646,50–2.648,00.',
        steps: [
          'Candle bullish M5 menutup Body Close di 2.649,20 menembus penuh Bearish FVG → sah menjadi Bullish +iFVG.',
          'Retest ke 2.648,00: Buy dengan SL struktural 2.643,40 ($4,60) dan target NY High 2.658,50 (+$10,50, R:R 1 : 2,28).'
        ]
      },
      failedCase: {
        title: 'Kasus Gagal: iFVG di Tengah Konsolidasi',
        context: 'Trader mengambil iFVG M5 pada jam sepi Asia tanpa sweep Liquidity dan tanpa arah H1.',
        whyFailed: 'Di pasar sideways, FVG sering ditembus bolak-balik tanpa komitmen arah institusi.'
      },
      goldenRules: [
        'FVG lawan yang ditembus penuh oleh Body Close pasca-sweep membuktikan perpindahan kontrol arus order.',
        'Wajib menunggu Body Close penuh keluar dari kotak FVG — bukan sekadar wick.'
      ],
      quiz: [
        {
          question: 'Bagaimana syarat mutlak agar sebuah **Bearish FVG (SIBI)** sah berubah kutub menjadi **Bullish Inversion FVG (`+iFVG`)**?',
          options: [
            'Harga naik menyentuh kotak SIBI lalu turun kembali',
            'Setelah **Sweep SSL atau sentuhan POI HTF**, candle bullish menutup **Body Close** menembus penuh di atas seluruh kotak SIBI',
            'Hanya ujung wick atas yang menyentuh garis 50% CE',
            'Terbentuk 3 candle bearish baru di bawahnya'
          ],
          answerIndex: 1,
          explanation: 'Perubahan kutub iFVG mewajibkan Body Close menembus penuh sisi belakang kotak FVG lawan setelah Sweep Liquidity atau sentuhan POI HTF.'
        },
        {
          question: 'Mengapa **iFVG** sering digunakan trader XAU/USD pada sesi NY AM / Silver Bullet?',
          options: [
            'Karena tidak membutuhkan Stop Loss',
            'Karena memberikan konfirmasi perubahan arus order lebih cepat saat emas bergerak kencang tanpa sempat retracement dalam ke Order Block awal',
            'Karena bisa dipakai saat pasar tutup akhir pekan',
            'Karena akurasinya selalu 100% tanpa pernah menyentuh SL'
          ],
          answerIndex: 1,
          explanation: 'Pada momentum cepat XAU/USD, iFVG menangkap perpindahan arus order pasca-sweep lebih awal dibanding menunggu MSS yang jauh.'
        },
        {
          question: 'Kapan sebuah FVG yang tertembus penuh **TIDAK BOLEH** dieksekusi sebagai sinyal iFVG?',
          options: [
            'Saat muncul tepat setelah sweep Asia Low di NY AM Killzone',
            'Saat muncul di tengah pasar sideways/konsolidasi tanpa latar belakang **Sweep Liquidity** maupun **POI HTF**',
            'Saat searah dengan Daily Bias dan R:R di atas 1:2',
            'Saat terjadi retest bersih di tepi luar kotak iFVG'
          ],
          answerIndex: 1,
          explanation: 'Tanpa Sweep Liquidity atau POI HTF, FVG di area konsolidasi sering ditembus bolak-balik tanpa arah institusional yang jelas.'
        },
        {
          question: 'Dalam studi kasus XAU/USD di atas (`+iFVG` di `2.646,50–2.648,00` pasca-sweep Asia Low `2.643,80`), di mana penempatan Stop Loss paling logis saat masuk Buy di retest `2.648,00`?',
          options: [
            'Di `2.647,90` (jarak `$0,10`)',
            '**Di bawah ujung ekstrem wick sweep** (misalnya `2.643,40`, memberi ruang buffer di bawah `2.643,80`)',
            'Di atas target NY High `2.658,50`',
            'Tidak perlu memasang Stop Loss'
          ],
          answerIndex: 1,
          explanation: 'Ujung ekstrem sweep adalah batas invalidasi struktural — jika harga kembali menembusnya, skenario pembalikan resmi batal.'
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
      subtitle: 'Tiga model eksekusi pelengkap ketika pasar bergerak terlalu cepat untuk retracement FVG biasa atau berbalik langsung dari level Liquidity ekstrem.',
      readMinutes: 10,
      diagramId: 'model-turtle-soup',
      diagramAfterSection: 1,
      summary: 'Kapan menggunakan 3 model pelengkap di luar ICT 2022 (iFVG Momentum, ICT Unicorn, dan Turtle Soup / Smart Money Reversal), tabel perbandingan kondisi ideal dan profil risiko, 3 syarat pengaman Turtle Soup, panduan praktis memilih model, serta studi kasus XAU/USD sesi London WITA/WIB.',
      bookSections: [
        {
          number: '26.1',
          heading: 'Peran 3 Model Entry Alternatif di Luar Model ICT 2022',
          shortTitle: '3 Model Alternatif',
          paragraphs: [
            'Model Utama ICT 2022 (`Sweep → MSS/CISD → Retracement FVG/OB` pada Bab 25) telah mencakup sebagian besar skenario harian. Namun pada XAU/USD, tidak jarang harga bergerak sangat cepat setelah Liquidity Sweep sehingga tidak sempat terkoreksi dalam ke FVG baru, atau justru membentuk pembalikan tajam langsung dari level ekstrem timeframe besar.',
            'Untuk menghadapi kondisi tersebut, Anda dapat memanfaatkan **3 Model Entry Alternatif** yang tetap berpijak pada konteks dasar yang sama (**Killzone + HTF Bias + Liquidity Sweep**), tetapi berbeda pada pemicu eksekusinya di timeframe M5:',
            '1. **iFVG Momentum Entry:** Memanfaatkan kegagalan FVG lawan yang ditembus penuh oleh *Body Close* (Bab 20) sebagai konfirmasi perubahan *order flow* yang lebih awal.',
            '2. **ICT Unicorn Setup:** Memanfaatkan irisan tumpang-tindih antara **Breaker Block** (Bab 22) dan **Fair Value Gap** (Bab 19) pada satu pita harga sempit.',
            '3. **Turtle Soup / Smart Money Reversal (SMR):** Memanfaatkan pembalikan tajam tepat setelah sweep level Liquidity besar (**PWH/PWL**, **PDH/PDL**, atau **Asia High/Low**) yang berhimpitan dengan POI H1/H4.'
          ]
        },
        {
          number: '26.2',
          heading: 'Perbandingan Mekanis: iFVG, ICT Unicorn, dan Turtle Soup (SMR)',
          shortTitle: 'Perbandingan 3 Model',
          paragraphs: [
            'Setiap model alternatif dirancang untuk menjawab kondisi pergerakan harga yang berbeda. Tabel berikut merangkum kondisi ideal, pemicu eksekusi, risiko utama, serta kisaran R:R dari ketiganya:'
          ],
          table: {
            caption: 'Perbandingan Teknis 3 Model Entry Alternatif ICT (XAU/USD)',
            headers: ['Model Alternatif', 'Kondisi Pasar Ideal', 'Pemicu Entry (Trigger M5)', 'Risiko Utama', 'Kisaran R:R'],
            rows: [
              [
                '**iFVG Momentum Entry**',
                'Momentum cepat pada NY AM / Silver Bullet ketika retracement sangat dangkal',
                'Sweep/POI HTF → FVG lawan ditembus penuh **Body Close** (menjadi `+iFVG`/`-iFVG`) → entry pada close atau retest tipis',
                'Rentan sinyal palsu jika diterapkan di tengah konsolidasi tanpa Sweep',
                '`1 : 2` s.d. `1 : 3`'
              ],
              [
                '**ICT Unicorn Setup**',
                'Retracement terstruktur pasca-Sweep & MSS pada London atau NY AM Killzone',
                '**Breaker Block** dan **FVG** saling beririsan pada satu pita harga → pasang Limit Order pada tepi zona irisan',
                'Frekuensi kemunculan lebih jarang; rawan memaksakan Breaker yang kurang valid',
                '`1 : 2,5` s.d. `1 : 4+`'
              ],
              [
                '**Turtle Soup (SMR)**',
                'Harga menyapu level ekstrem **PWH/PWL/PDH/PDL** yang berhimpitan langsung dengan POI H1/H4',
                'Sweep ekstrem → **Absorption Wick** + gagal Body Close di luar level → konfirmasi **CISD M5** masuk kembali ke range',
                'Kerugian beruntun jika melawan candle ekspansi besar tanpa menunggu penolakan',
                '`1 : 3` s.d. `1 : 5+`'
              ]
            ]
          }
        },
        {
          number: '26.3',
          heading: 'Aturan Disiplin Turtle Soup (SMR): 3 Syarat Pengaman Mutlak',
          shortTitle: '3 Syarat Turtle Soup',
          paragraphs: [
            'Istilah **Turtle Soup** merujuk pada pola pembalikan terhadap strategi breakout klasik (*Turtle Traders*). Dalam kerangka ICT, **Smart Money Reversal (SMR)** terjadi ketika harga menembus High atau Low signifikan untuk menyerap likuiditas order breakout (*buy-stop* atau *sell-stop*), lalu segera berbalik menuju sisi range seberangnya.',
            'Kesalahan yang paling sering terjadi adalah membuka posisi terlalu cepat melawan candle impulsif yang masih bergerak kuat menembus level. Agar eksekusi Turtle Soup tetap objektif dan terukur, penuhi **3 syarat pengaman berikut**:',
            '1. **Lokasi Level HTF Saja:** Hanya jalankan Turtle Soup pada level Liquidity utama (**PWH/PWL**, **PDH/PDL**, atau **Asia High/Low**) yang **berhimpitan langsung dengan POI H1/H4** (OB atau FVG HTF). Hindari pemakaian pada swing internal kecil di tengah range.',
            '2. **Bukti Penyerapan Nyata (Absorption + CISD):** Wajib menunggu penutupan candle yang menunjukkan ekor penolakan jelas (*Absorption Wick*), gagal menutup body di luar level ekstrem, serta diikuti konfirmasi **CISD M5** yang mengembalikan kendali ke dalam range.',
            '3. **Batas Maksimal 1 Percobaan (*One Attempt Rule*):** Untuk setiap level ekstrem, Anda hanya diperbolehkan melakukan **maksimal 1 kali eksekusi**. Apabila Stop Loss tersentuh karena harga melanjutkan ekspansi tren, hentikan percobaan pembalikan di level tersebut dan hindari re-entry berulang.'
          ]
        },
        {
          number: '26.4',
          heading: 'Panduan Praktis Memilih Model Alternatif yang Tepat',
          shortTitle: 'Panduan Pilih Model',
          paragraphs: [
            'Agar keempat model (ICT 2022 beserta ketiga pelengkapnya) tidak saling tumpang-tindih saat pasar berjalan cepat, gunakan 4 patokan keputusan praktis berikut:',
            '1. **Gunakan iFVG Momentum** hanya ketika setelah sweep di NY AM atau Silver Bullet, harga langsung menembus FVG lawan dengan Body Close tegas tanpa sempat memberi koreksi dalam ke FVG baru.',
            '2. **Gunakan ICT Unicorn** ketika pasca-sweep dan MSS terlihat jelas pita harga sempit tempat Breaker Block dan FVG bertumpuk langsung — fokuskan Limit Order di area irisan tersebut.',
            '3. **Gunakan Turtle Soup (SMR)** khusus pada level ekstrem mingguan/harian (`PWH/PWL`, `PDH/PDL`) yang berada tepat di dalam POI H1/H4 dan telah memperlihatkan *Absorption Wick* serta CISD M5.',
            '4. **Kuasai Secara Bertahap:** Jangan berganti-ganti keempat model secara acak dalam satu hari. Terapkan variasi pelengkap ini baru setelah Anda memiliki minimal 30 sampel jurnal yang konsisten pada Model Utama ICT 2022.'
          ]
        },
        {
          number: '26.5',
          heading: 'Studi Kasus XAU/USD: Turtle Soup (SMR) di PWL 2.618,00 + H4 Bullish OB',
          shortTitle: 'Studi Kasus Turtle Soup',
          paragraphs: [
            'Berikut rincian angka nyata penerapan Turtle Soup (SMR) pada XAU/USD saat pembukaan **London Silver Bullet (`15:00 WITA / 14:00 WIB` saat EDT, atau `16:00 WITA / 15:00 WIB` saat EST)** dalam konteks **H4 Bullish**:'
          ],
          exampleBox: {
            title: 'Eksekusi Turtle Soup (SMR) XAU/USD — London Silver Bullet (15:05 WITA / 14:05 WIB)',
            rows: [
              {
                label: '1. Validasi Lokasi (Syarat 1)',
                detail: 'PWL (*Previous Week Low*) berada di `2.618,00` dan berhimpitan tepat di dalam **H4 Bullish Order Block** (`2.614,50–2.618,50`). Tidak ada jadwal berita berdampak tinggi USD dalam 60 menit ke depan.'
              },
              {
                label: '2. Sweep & Penolakan (Syarat 2)',
                detail: 'Pukul `15:05 WITA / 14:05 WIB`, harga menembus ke `2.616,00` (`$2,00` di bawah PWL), menyerap likuiditas sell-stop, lalu berbalik naik meninggalkan ekor bawah panjang dan menutup body M5 di `2.619,80` (kembali di atas PWL).'
              },
              {
                label: '3. Konfirmasi CISD & Entry',
                detail: 'Candle M5 berikutnya mengonfirmasi **Bullish CISD** (Body Close di atas Open candle sweep). Posisi **Buy** dibuka di **`2.619,50`**.'
              },
              {
                label: '4. Stop Loss & Target Bertingkat',
                detail: 'SL struktural ditempatkan di `2.615,20` (buffer spread `$0,80` di bawah ujung wick `2.616,00`) → jarak risiko = **`$4,30`**. Target **TP1 Asia High `2.630,00`** = **`+$10,50` (`+2,44R`)**. Target **TP2 PDH `2.642,00`** = **`+$22,50` (`+5,23R`)**.'
              }
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Batas Pembatalan Skenario Turtle Soup',
            body: 'Model alternatif (**iFVG**, **Unicorn**, dan **Turtle Soup**) berperan sebagai pelengkap setelah Model ICT 2022 dikuasai. Apabila candle M15 menutup **Body Close penuh dan tebal** jauh di luar PDH/PDL tanpa ekor penolakan, hal itu menandakan ekspansi tren lanjutan — skenario Turtle Soup resmi batal.'
          }
        }
      ],
      keyTakeaways: [
        '**iFVG Momentum** dipakai saat dorongan cepat tanpa koreksi dalam; **ICT Unicorn** memanfaatkan irisan **Breaker Block + FVG**; **Turtle Soup (SMR)** menangkap pembalikan tajam di level Liquidity ekstrem HTF.',
        'Turtle Soup yang valid wajib memenuhi **3 syarat pengaman**: lokasi level besar + POI H1/H4, bukti penyerapan (*Absorption Wick* + gagal Body Close di luar + CISD M5), dan batas maksimal 1 percobaan per level.',
        'Penutupan body candle M15 yang penuh di luar level Liquidity menandakan kelanjutan tren sehingga skenario Turtle Soup harus dibatalkan.',
        'Kuasai Model ICT 2022 terlebih dahulu sebelum menambahkan ketiga model alternatif agar disiplin eksekusi tetap terjaga.'
      ],
      bridgeNext: 'Setelah memahami keempat model eksekusi (ICT 2022, iFVG, Unicorn, dan Turtle Soup), langkah paling menentukan untuk menjaga konsistensi statistik adalah memilih **1 Model Fokus** dan menerapkan filter penolakan ketat terhadap setup berkualitas rendah di **Bab 27: Filter Setup Gagal (5 Bendera Merah Auto-Skip) & Memilih 1 Model Fokus**.',
      conceptBlocks: [
        {
          heading: '3 Model Alternatif: iFVG, Unicorn & Turtle Soup (SMR)',
          paragraphs: [
            'Selain Model Utama ICT 2022, Anda dapat memakai iFVG saat momentum terlalu cepat untuk retracement dalam, ICT Unicorn saat Breaker Block dan FVG beririsan, atau Turtle Soup (SMR) di level Liquidity ekstrem (PWH/PWL/PDH/PDL + POI H1/H4).',
            'Turtle Soup wajib menunggu bukti penolakan nyata (Absorption Wick + gagal Body Close di luar + CISD M5) dan dibatasi maksimal 1 percobaan per level ekstrem.'
          ]
        }
      ],
      validRules: [
        'Hanya mengeksekusi Turtle Soup di level ekstrem (PWH/PWL, PDH/PDL, Asia High/Low) yang berhimpitan dengan POI H1/H4.',
        'Wajib melihat Absorption Wick + gagal Body Close di luar level + konfirmasi CISD M5 sebelum entry.',
        'Untuk ICT Unicorn, pastikan Breaker Block dan FVG benar-benar saling beririsan pada satu pita harga.'
      ],
      invalidRules: [
        'Langsung melawan candle impulsif penuh yang menutup body jauh di luar PDH/PDL.',
        'Menjalankan Turtle Soup tepat saat rilis berita berdampak tinggi CPI/NFP/FOMC.',
        'Melakukan re-entry berulang di level yang sama setelah percobaan pertama menyentuh SL.'
      ],
      xauScenario: {
        context: 'XAU/USD sweep PWL 2.618,00 yang berhimpitan dengan H4 Bullish OB pada London Silver Bullet (15:00 WITA / 14:00 WIB EDT).',
        steps: [
          'Harga menembus ke 2.616,00 lalu berbalik membentuk ekor bawah panjang dan menutup body M5 di 2.619,80.',
          'Candle M5 berikutnya mengonfirmasi Bullish CISD; Buy di 2.619,50, SL 2.615,20 ($4,30 risiko).',
          'TP1 Asia High 2.630,00 (+$10,50 / +2,44R) dan TP2 PDH 2.642,00 (+$22,50 / +5,23R).'
        ]
      },
      goldenRules: [
        'Turtle Soup mensyaratkan bukti kegagalan breakout dan CISD, bukan menebak pembalikan saat candle masih bergerak kuat.',
        'Batasi maksimal 1 percobaan per level ekstrem — jika ditembus, terima kelanjutan tren.'
      ],
      practiceCta: {
        label: 'Latih Pola iFVG, Unicorn & Turtle Soup di Practice Arena',
        description: 'Uji ketepatan membedakan pembalikan SMR valid melawan breakout kuat pada skenario XAU/USD interaktif.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Apa komposisi persis dari **ICT Unicorn Setup** yang membuatnya memiliki presisi retracement tinggi?',
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
          question: 'Apa perbedaan paling tegas antara **Turtle Soup (SMR)** yang terukur dengan entry spekulatif melawan tren kuat?',
          options: [
            'Turtle Soup memakai ukuran lot 10× lebih besar',
            'Turtle Soup hanya dilakukan di level Liquidity besar + POI H1/H4 dengan bukti penyerapan (**Absorption Wick** + gagal Body Close + **CISD M5**) dan maksimal 1 percobaan',
            'Turtle Soup tidak memerlukan Stop Loss',
            'Turtle Soup dilakukan di tengah range sideways setiap 10 menit'
          ],
          answerIndex: 1,
          explanation: 'Lokasi POI HTF, bukti penyerapan + CISD, serta batas 1 percobaan memisahkan pembalikan institusional dari sekadar menebak puncak atau dasar.'
        },
        {
          question: 'Harga XAU/USD menembus PDH lalu menutup **body candle M15 penuh dan tebal** jauh di atas PDH tanpa ekor penolakan. Apakah ini sinyal Turtle Soup Sell?',
          options: [
            'Ya, langsung Sell sekarang juga karena harga sudah tampak tinggi',
            'Bukan — penutupan body kuat menandakan ekspansi lanjutan, sehingga skenario Turtle Soup resmi **batal**',
            'Ya, cukup tambah buffer SL $25',
            'Pasang Buy dan Sell bersamaan agar aman'
          ],
          answerIndex: 1,
          explanation: 'Turtle Soup mensyaratkan kegagalan mempertahankan breakout; body close tegas di luar level justru membuktikan kelanjutan tren.'
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
          explanation: 'Jarak profit $10,50 dibagi jarak risiko $4,30 menghasilkan +2,44R — melampaui batas minimum 1 : 2.'
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
      subtitle: 'Menentukan 1 model utama untuk 30–50 transaksi pertama agar data statistik valid dan menyaring setup probabilitas rendah sebelum eksekusi.',
      readMinutes: 9,
      diagramId: 'model-selection-matrix',
      diagramAfterSection: 1,
      summary: 'Dampak System Hopping, prinsip fokus 1 Model Utama (30–50 transaksi), matriks pemilihan model sesuai jadwal WITA/WIB, 5 Bendera Merah Auto-Skip, protokol Checklist 30 Detik (5× Ya), serta studi kasus audit Grade A+ vs Grade D.',
      bookSections: [
        {
          number: '27.1',
          heading: 'Dampak System Hopping & Prinsip 1 Model Utama (30–50 Transaksi)',
          shortTitle: 'Prinsip 1 Model Utama',
          paragraphs: [
            'Setelah memahami keempat model eksekusi (ICT 2022, iFVG, Unicorn, dan Turtle Soup), kebiasaan yang paling sering menghambat konsistensi adalah **System Hopping** — berpindah-pindah model setiap kali mengalami 1 atau 2 kali Stop Loss.',
            'Dampak langsung dari System Hopping adalah rusaknya kejelasan data di jurnal transaksi. Ketika empat model dicampur tanpa sampel yang memadai, Anda tidak dapat mengetahui secara objektif apakah kerugian berasal dari aturan model, pemilihan sesi, atau sekadar variasi probabilitas yang wajar.',
            'Terapkan **Prinsip 1 Model Utama**: pilih **satu model saja** dan jalankan secara konsisten selama **30 hingga 50 transaksi pertama** (dimulai di akun Demo atau Cent). Setelah sampel tersebut terkumpul bersih, baru evaluasi *Win Rate* dan *Expectancy*, lalu putuskan apakah perlu menambahkan maksimal **1 model pelengkap**.'
          ]
        },
        {
          number: '27.2',
          heading: 'Matriks Pemilihan 1 Model Fokus Sesuai Jadwal & Karakter Trader',
          shortTitle: 'Matriks Pemilihan Model',
          paragraphs: [
            'Gunakan matriks berikut untuk memilih **1 Model Utama** yang paling selaras dengan ketersediaan waktu (WITA, dengan padanan WIB −1 jam) dan tingkat pengalaman Anda:'
          ],
          table: {
            caption: 'Matriks Pemilihan Model Fokus ICT (XAU/USD · Zona Waktu WITA; WIB −1 Jam)',
            headers: ['Model Eksekusi', 'Karakter Trader yang Cocok', 'Frekuensi Sinyal', 'Jendela Ideal (WITA)', 'Rekomendasi Peran'],
            rows: [
              [
                '**ICT 2022** (`Sweep → MSS → FVG`)',
                'Menyukai aturan paling terstruktur, visual jelas, dan mudah dievaluasi di jurnal',
                'Sedang (`3–5×` / minggu)',
                'London KZ (`14:00–17:00` EDT / `15:00–18:00` EST) & NY AM (`19:00–22:00` EDT / `20:00–23:00` EST)',
                '**Model Utama Terbaik** bagi sebagian besar pemula hingga menengah'
              ],
              [
                '**iFVG Momentum**',
                'Responsif pada pergerakan cepat sesi New York ketika koreksi sangat dangkal',
                'Sedang–Tinggi (`4–6×` / minggu)',
                'NY AM Silver Bullet (`22:00–23:00` EDT / `23:00–00:00` EST)',
                'Model pelengkap #1 bila sering tertinggal retracement FVG'
              ],
              [
                '**ICT Unicorn** (`Breaker + FVG`)',
                'Sangat selektif dan bersedia menunggu konfluensi ganda yang lebih jarang muncul',
                'Rendah (`1–3×` / minggu)',
                'London KZ & NY AM KZ',
                'Variasi presisi dari ICT 2022 saat Breaker dan FVG beririsan'
              ],
              [
                '**Turtle Soup (SMR)**',
                'Berpengalaman dan disiplin penuh pada batas 1 percobaan di level HTF ekstrem',
                'Rendah (`1–2×` / minggu)',
                'Pembukaan London & NY pada **PWH/PWL/PDH/PDL**',
                'Tahap lanjutan (setelah menyelesaikan minimal 50 transaksi Model Utama)'
              ]
            ]
          }
        },
        {
          number: '27.3',
          heading: '5 Bendera Merah (Auto-Skip) yang Membatalkan Setup Seketika',
          shortTitle: '5 Bendera Merah Auto-Skip',
          paragraphs: [
            'Kinerja jangka panjang sangat ditentukan oleh ketegasan Anda menolak setup probabilitas rendah. Sebelum membuka posisi pada model mana pun, periksa **5 Bendera Merah** berikut. Apabila **satu saja** kondisi di bawah aktif, batalkan rencana transaksi tanpa pengecualian:',
            '1. **Bendera Merah 1 — Harga di Tengah Range (`40%–60%` Equilibrium) Tanpa Sweep:** Tidak ada pengambilan Liquidity baru sebagai pemicu arah sehingga pergerakan di tengah range mudah berbalik dua arah.',
            '2. **Bendera Merah 2 — Arah Entry Berhadapan Langsung dengan POI H1/H4 Lawan:** Misalnya membuka posisi Buy M5 tepat di bawah H4 Bearish Order Block atau PDH. Ruang gerak searah menjadi sangat sempit.',
            '3. **Bendera Merah 3 — Di Dalam Jendela News Lock (`-15 menit` s.d. `+30 menit`):** Menjelang dan sesaat setelah rilis data ekonomi berdampak tinggi USD (CPI, NFP, FOMC — Bab 17), pelebaran spread dan slippage dapat melampaui batas risiko.',
            '4. **Bendera Merah 4 — R:R Menuju Target Liquidity Terdekat `< 1 : 1,8`:** Potensi imbal hasil tidak sebanding dengan risiko struktural yang ditanggung.',
            '5. **Bendera Merah 5 — Batas Rugi Harian (`2× SL` atau `-2%`) Sudah Tercapai:** Melanjutkan transaksi setelah batas harian tercapai berisiko memicu keputusan emosional (*revenge trading*). Hentikan aktivitas trading hingga hari perdagangan berikutnya.'
          ]
        },
        {
          number: '27.4',
          heading: 'Protokol Praktis: Checklist 30 Detik (5× Ya) Sebelum Eksekusi',
          shortTitle: 'Checklist 30 Detik',
          paragraphs: [
            'Biasakan meluangkan waktu 30 detik sebelum mengirim order untuk menjawab kelima pertanyaan berikut secara jujur. Gerbang ini bersifat mutlak — **satu jawaban "Tidak" berarti setup dibatalkan**:',
            '1. **Waktu & Berita:** Apakah posisi ini berada di dalam jendela Killzone dan bebas dari jendela News Lock?',
            '2. **Arah & Ruang Gerak:** Apakah arah entry selaras dengan Daily Bias / DOL HTF dan tidak langsung menabrak POI H1/H4 lawan?',
            '3. **Pemicu Likuiditas:** Apakah sudah terjadi Liquidity Sweep nyata (atau sentuhan POI HTF), bukan sinyal acak di tengah range?',
            '4. **Validitas Model & R:R:** Apakah pemicu 1 Model Utama Anda terpenuhi lengkap dengan rasio R:R minimal `1 : 2` menuju target Liquidity realistis?',
            '5. **Batas Risiko Harian:** Apakah kuota risiko harian masih aman (belum mencapai batas `2× SL` atau `-2%` hari ini)?'
          ]
        },
        {
          number: '27.5',
          heading: 'Studi Kasus Audit Setup: Grade A+ (Layak Eksekusi) vs Grade D (Auto-Skip)',
          shortTitle: 'Audit Grade A+ vs D',
          paragraphs: [
            'Perhatikan perbedaan nyata antara setup yang lolos seluruh syarat **Checklist 30 Detik** dengan setup yang wajib ditolak melalui **5 Bendera Merah**:'
          ],
          exampleBox: {
            title: 'Perbandingan Audit Setup XAU/USD: Grade A+ vs Grade D',
            rows: [
              {
                label: 'Kasus A — Grade A+ (Layak Eksekusi)',
                detail: 'Pukul `15:20 WITA / 14:20 WIB` (London KZ) · Bias H1 Bullish · Terjadi Sweep Asia Low + MSS M5 + Bullish FVG bersih di zona Discount · Bebas jendela News Lock · Ruang menuju PDH memberi R:R `1 : 2,6` · Belum ada kerugian hari itu → **5× Ya terpenuhi; eksekusi dengan risiko terukur `1%`**.'
              },
              {
                label: 'Kasus B — Grade D (Auto-Skip)',
                detail: 'Terdapat FVG M5 yang tampak rapi, tetapi lokasinya di tengah range (`52%`), tidak didahului Liquidity Sweep, 10 menit lagi rilis CPI USD, dan ruang menuju POI H1 lawan terdekat hanya memberi R:R `1 : 1,1` → **3 Bendera Merah aktif; catat "No Setup" di jurnal dan lewati**.'
              }
            ]
          },
          callout: {
            tone: 'tip',
            title: 'Mencatat "No Setup" Adalah Bagian dari Disiplin Eksekusi',
            body: 'Tidak membuka posisi pada hari tanpa setup valid bukanlah sebuah kegagalan. Ketegasan menyaring dan menolak setup Grade C/D justru menjaga modal serta ketenangan fokus Anda tetap utuh ketika setup Grade A+ hadir.'
          }
        }
      ],
      keyTakeaways: [
        'Hindari **System Hopping** — kunci **1 Model Utama** (disarankan **ICT 2022**) selama **30–50 transaksi** agar data *Win Rate* dan *Expectancy* di jurnal murni serta dapat dievaluasi objektif.',
        'Terapkan **5 Bendera Merah (Auto-Skip)**: tengah range tanpa sweep, berhadapan langsung dengan POI H1/H4 lawan, dalam jendela News Lock (`-15m/+30m`), R:R `< 1 : 1,8`, atau batas `2× SL` harian sudah tercapai.',
        'Jalankan **Checklist 30 Detik (`5× Ya`)** sebelum mengirim order — satu jawaban "Tidak" cukup untuk membatalkan setup.',
        'Mencatat **"No Setup"** di jurnal adalah wujud nyata disiplin menjaga kualitas ekuitas.'
      ],
      bridgeNext: 'Setelah menentukan 1 Model Fokus dan menyaring setup gagal melalui 5 Bendera Merah, langkah berikutnya adalah mengatur proteksi risiko dan target secara terukur pada **Bab 28: Stop Loss Struktural, Napas Spread & Target Liquidity Bertingkat (TP1/TP2)**.',
      conceptBlocks: [
        {
          heading: '1 Model Fokus & 5 Bendera Merah (Auto-Skip)',
          paragraphs: [
            'Tetapkan 1 Model Utama (disarankan ICT 2022) untuk 30–50 transaksi pertama agar statistik jurnal murni dan terhindar dari System Hopping.',
            'Batalkan setup seketika apabila muncul salah satu dari 5 Bendera Merah: tengah range tanpa sweep, berhadapan dengan POI H1/H4 lawan, dalam jendela News Lock, R:R < 1 : 1,8, atau batas 2× SL harian sudah tercapai.'
          ]
        }
      ],
      validRules: [
        'Tetapkan 1 Model Utama untuk 30–50 transaksi pertama agar data statistik di jurnal murni.',
        'Pastikan seluruh Checklist 30 Detik (5× Ya) terpenuhi sebelum membuka posisi.',
        'Catat "No Setup" di jurnal saat kondisi pasar tidak memenuhi kriteria.'
      ],
      invalidRules: [
        'Mengganti model setiap kali mengalami 1–2 kali Stop Loss (System Hopping).',
        'Memaksakan validasi dengan mencocok-cocokkan istilah ICT agar tetap bisa masuk posisi.',
        'Membuka posisi pada setup Grade C/D karena bosan menunggu.'
      ],
      xauScenario: {
        context: 'Perbandingan cepat audit setup Grade A+ vs Grade D pada XAU/USD (WITA/WIB).',
        steps: [
          'Kasus A (15:20 WITA / 14:20 WIB): Sweep Asia Low + MSS M5 + FVG bersih di Discount + H1 Bullish + bebas news + R:R 1:2,6 → Grade A+ (Layak Eksekusi).',
          'Kasus B: FVG M5 di tengah range 52%, tanpa sweep, 10 menit sebelum CPI, R:R 1:1,1 → Grade D (Auto-Skip).'
        ]
      },
      goldenRules: [
        'Satu model yang dikuasai dan terukur secara statistik jauh lebih efektif daripada banyak model tanpa sampel data yang jelas.',
        'Kualitas manajemen risiko tercermin dari seberapa disiplin Anda menolak setup berkualitas rendah.'
      ],
      practiceCta: {
        label: 'Uji Filter 5 Bendera Merah di Cockpit Mapping',
        description: 'Gunakan Cockpit Mapping untuk menyaring kondisi sesi, News Lock, dan POI HTF secara otomatis sebelum mengambil keputusan entry.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Mengapa Anda disarankan mengunci **1 Model Utama** minimal **30–50 transaksi** sebelum menilai atau menggantinya?',
          options: [
            'Karena aturan broker melarang mengganti strategi sebelum 30 hari',
            'Agar data statistik **Win Rate** dan **Expectancy** murni serta valid secara probabilitas, bebas dari bias *System Hopping* akibat 1–2 kali loss',
            'Supaya bisa menghafal semua warna candle di chart',
            'Karena model lain hanya bekerja di hari Jumat'
          ],
          answerIndex: 1,
          explanation: 'Keunggulan statistik baru terlihat pada ukuran sampel yang memadai; berpindah model setiap terkena 2 SL merusak objektivitas data.'
        },
        {
          question: 'Manakah kondisi berikut yang memicu **Bendera Merah (Auto-Skip)** meskipun ada kotak FVG M5 yang terlihat rapi?',
          options: [
            'Muncul di London Killzone setelah sweep Asia Low searah Bias H1',
            'Muncul **10 menit sebelum rilis CPI USD**, berada di tengah range tanpa sweep, dan R:R ke target terdekat hanya `1 : 1,1`',
            'Berada di zona Discount OTE dengan ruang R:R `1 : 2,5`',
            'Memiliki Stop Loss struktural yang rapi di bawah wick sweep'
          ],
          answerIndex: 1,
          explanation: 'Jendela News Lock, posisi tengah range tanpa sweep, dan R:R < 1 : 1,8 adalah bendera merah mutlak.'
        },
        {
          question: 'Jika Anda sering tertinggal retracement FVG saat momentum **NY AM Silver Bullet** bergerak cepat, model pelengkap mana yang paling tepat dipelajari setelah lulus Model Utama?',
          options: [
            '**iFVG Momentum Entry** pasca-sweep',
            'Averaging martingale tanpa Stop Loss',
            'Trading acak saat jam rollover subuh',
            'Menebak puncak melawan candle berita NFP'
          ],
          answerIndex: 0,
          explanation: 'iFVG Momentum dirancang untuk menangkap perubahan order flow pada momentum cepat tanpa menunggu koreksi dalam.'
        },
        {
          question: 'Saat menjalankan **Checklist 30 Detik (`5× Ya`)**, ternyata 4 poin menjawab Ya tetapi 1 poin menjawab **Tidak** (entry berhadapan langsung dengan H4 Bearish Order Block). Keputusan yang tepat adalah...',
          options: [
            'Tetap masuk dengan lot setengahnya karena sudah 4 dari 5 syarat terpenuhi',
            '**Lewati / Batal** — satu bendera merah atau satu jawaban "Tidak" cukup untuk membatalkan setup tanpa kompromi',
            'Tetap masuk lalu menghapus Stop Loss agar tidak tersentuh',
            'Membalikkan posisi menjadi Sell secara spontan tanpa analisis'
          ],
          answerIndex: 1,
          explanation: 'Checklist bersifat gerbang wajib (semua harus Ya); berhadapan langsung dengan POI HTF lawan merupakan setup probabilitas rendah.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
