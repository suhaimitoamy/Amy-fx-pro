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
    // LEVEL 3 — MESIN PENGIRIMAN HARGA ICT (PD ARRAY)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'displacement-jejak-institusi',
      number: 11,
      levelId: 3,
      title: 'Displacement & Jejak Energi Institusi',
      readMinutes: 4,
      diagramId: 'displacement-signature',
      summary: 'Tanpa Displacement, semua FVG, Order Block, dan MSS hanyalah kebetulan lemah. Displacement adalah tanda tangan bahwa modal besar benar-benar masuk pasar.',
      conceptBlocks: [
        {
          heading: 'Membedakan Gerakan Ritel vs Dorongan Institusi',
          paragraphs: [
            'Displacement adalah lonjakan harga yang cepat, agresif, dan tegas — terdiri dari satu atau dua candle berbadan besar yang bergerak satu arah dengan sangat sedikit sumbu lawan, biasanya menembus struktur terdekat dan meninggalkan Fair Value Gap (FVG).',
            'Gerakan merayap (candle kecil-kecil saling tumpang tindih dengan banyak wick) menunjukkan pasar ragu-ragu. Dalam ICT, kita TIDAK pernah mempertaruhkan modal pada gerakan yang ragu-ragu.'
          ]
        },
        {
          heading: 'Syarat 3 Pilar Displacement Berkualitas',
          paragraphs: [
            '1. Ukuran badan candle jelas lebih besar (minimal 1,5–2x) dibanding rata-rata candle konsolidasi sebelumnya.\n2. Meninggalkan celah ketidakseimbangan harga (Fair Value Gap) — tanda harga melaju terlalu cepat untuk diisi penuh oleh sisi lawan.\n3. Memecah level kunci (Swing High/Low atau candle lawan untuk CISD/MSS).'
          ]
        }
      ],
      validRules: [
        'Candle berbadan dominan (>65% total tinggi candle adalah body) yang meninggalkan FVG bersih.',
        'Muncul segera setelah harga menyapu likuiditas (BSL/SSL) atau menyentuh POI HTF.',
        'Memecahkan level struktur atau mengubah status pengiriman (CISD/MSS).'
      ],
      invalidRules: [
        'Penembusan struktur menggunakan 5–6 candle kecil yang saling bertumpuk tanpa FVG.',
        'Candle raksasa yang muncul tepat pada detik rilis berita merah CPI/NFP (itu whipsaw news, bukan displacement normal untuk langsung dikejar).',
        'Displacement yang terjadi di tengah ruang kosong tanpa latar belakang sweep atau POI.'
      ],
      xauScenario: {
        context: 'Setelah Asia Low tersapu di 2.642, kamu memantau M5 menunggu niat pembeli.',
        steps: [
          'Jika harga hanya naik pelan dengan 4 candle kecil ke 2.645 lalu turun lagi: SKIP, tidak ada Displacement.',
          'Jika muncul 1–2 candle bullish M5 tebal dari 2.642 ke 2.649 dalam 10 menit, menembus swing terakhir dan meninggalkan FVG $2,50: itulah Displacement valid — siapkan Buy Limit saat pullback ke FVG.'
        ]
      },
      goldenRules: [
        'Tidak ada Displacement = Tidak ada FVG berkualitas = Tidak ada Entry.',
        'Displacement memberi tahu arah; retracement memberi harga terbaik.'
      ],
      quiz: [
        {
          question: 'Apa tanda visual paling jelas bahwa sebuah pergerakan memiliki Displacement sejati?',
          options: [
            'Deretan 8 candle doji kecil berjejer rapi',
            'Candle berbadan besar yang agresif, menembus level kunci, dan meninggalkan Fair Value Gap (FVG)',
            'Candle dengan sumbu atas dan bawah sama panjang',
            'Harga bergerak datar sepanjang sesi Asia'
          ],
          answerIndex: 1,
          explanation: 'Displacement selalu ditandai badan candle tegas yang menciptakan ketidakseimbangan (FVG) dan memecah level.'
        },
        {
          question: 'Harga menembus Swing High dengan merayap pelan (candle kecil saling tumpang tindih, tanpa FVG). Apa keputusan scalper ICT?',
          options: [
            'Langsung Buy karena sudah tembus',
            'Lewati / tetap waspada karena kurangnya Displacement menandakan lemahnya komitmen institusi',
            'Pasang lot 3x lipat',
            'Ubah timeframe ke bulanan'
          ],
          answerIndex: 1,
          explanation: 'Tanpa Displacement, penembusan lambat sangat rentan berubah menjadi jebakan atau berbalik arah.'
        },
        {
          question: 'Mengapa kita tidak langsung mengejar (Market Order) di ujung atas candle Displacement yang sudah melesat jauh?',
          options: [
            'Karena jarak ke Stop Loss menjadi terlalu lebar sehingga R:R rusak; lebih baik tunggu retracement ke FVG/OB',
            'Karena broker melarang Market Order',
            'Karena harga tidak pernah retrace',
            'Karena Displacement selalu palsu'
          ],
          answerIndex: 0,
          explanation: 'Mengejar candle yang sudah extended memperbesar risiko dan membuatmu rentan terkena pullback normal.'
        }
      ]
    },
    {
      id: 'fvg-bisi-sibi-ce-50',
      number: 12,
      levelId: 3,
      title: 'Fair Value Gap (BISI/SIBI) & 50% Consequent Encroachment',
      readMinutes: 6,
      diagramId: 'fvg-ce-anatomy',
      summary: 'FVG bukan sekadar kotak kosong 3 candle. Pahami mekanisme BISI/SIBI dan garis 50% Consequent Encroachment (CE) untuk tahu kapan FVG masih valid dan kapan mulai bocor.',
      conceptBlocks: [
        {
          heading: 'Anatomi 3 Candle: BISI (Bullish) & SIBI (Bearish)',
          paragraphs: [
            'Fair Value Gap terbentuk dari pola 3 candle berurutan saat terjadi Displacement. Pada Bullish FVG — yang secara resmi disebut BISI (Buyside Imbalance Sellside Inefficiency) — terdapat celah kosong antara High candle ke-1 dan Low candle ke-3 karena candle ke-2 melesat terlalu cepat ke atas.',
            'Sebaliknya, pada Bearish FVG — SIBI (Sellside Imbalance Buyside Inefficiency) — celah kosong berada di antara Low candle ke-1 dan High candle ke-3. Karena pasar menyukai efisiensi, harga cenderung kembali (retrace) ke celah ini untuk mengisi ulang order institusi sebelum melanjutkan tren.'
          ]
        },
        {
          heading: 'Consequent Encroachment (CE): Titik Tengah 50% yang Menentukan',
          paragraphs: [
            'Tarik garis tepat di tengah 50% dari tinggi kotak FVG — itulah Consequent Encroachment (CE). Garis 50% ini adalah alat ukur kesehatan FVG paling presisi.',
            'Pada FVG yang kuat, sumbu boleh menusuk sampai garis CE 50%, tetapi Body candle TIDAK boleh ditutup (Close) menembus melewati CE. Jika Body candle ditutup jauh menembus 50% CE bahkan keluar sisi seberang FVG, tandanya FVG tersebut mulai gagal dan berpotensi berubah fungsi menjadi Inversion FVG (IFVG).'
          ]
        }
      ],
      validRules: [
        'FVG masih Fresh (belum pernah disentuh/diisi sebelumnya) dan berada di lokasi tepat (Discount untuk Buy, Premium untuk Sell).',
        'Tercipta langsung dari gerakan Displacement yang memecahkan struktur (MSS/BOS) atau pasca-sweep.',
        'Saat harga retrace, body candle menghormati batas atas atau titik 50% CE FVG.'
      ],
      invalidRules: [
        'FVG mikro di tengah pasar choppy / sideways tanpa Displacement.',
        'FVG yang sudah berkali-kali ditembus naik-turun (sudah tidak fresh).',
        'Entry Buy di Bullish FVG padahal posisi FVG ada di pucuk 90% Premium.'
      ],
      xauScenario: {
        context: 'Setelah MSS Bullish M5 XAU/USD, terbentuk BISI (Bullish FVG) antara 2.644,00 (bawah) hingga 2.648,00 (atas).',
        steps: [
          'Tandai garis CE 50% tepat di 2.646,00.',
          'Opsi konservatif: pasang Buy Limit di 2.646,50 (sedikit di atas CE) dengan SL di bawah swing/candle ke-1 di 2.642,50.',
          'Jika candle M5 masuk ke 2.646,00 hanya meninggalkan ekor bawah lalu ditutup bullish di atas 2.647,00, FVG terkonfirmasi kuat.'
        ]
      },
      goldenRules: [
        'Tidak semua celah 3-candle layak di-entry; hanya ambil FVG yang lahir dari Sweep + Displacement.',
        'Hormati garis 50% CE: ekor boleh menusuk, body harus menghormati.'
      ],
      quiz: [
        {
          question: 'Pada pola 3 candle Bullish FVG (BISI), di antara titik manakah celah kosong FVG diukur?',
          options: [
            'Antara Low candle 1 dan High candle 3',
            'Antara High candle 1 dan Low candle 3',
            'Antara Open candle 2 dan Close candle 2 saja',
            'Antara harga kemarin dan minggu depan'
          ],
          answerIndex: 1,
          explanation: 'Pada BISI (naik), celah inefisiensi berada di ruang kosong antara puncak (High) candle ke-1 dan dasar (Low) candle ke-3.'
        },
        {
          question: 'Apa yang dimaksud dengan Consequent Encroachment (CE) pada sebuah Fair Value Gap?',
          options: [
            'Titik tengah persis 50% dari rentang kotak FVG',
            'Batas Stop Loss paling luar',
            'Candle ke-5 setelah FVG',
            'Spread rata-rata broker'
          ],
          answerIndex: 0,
          explanation: 'CE adalah garis keseimbangan 50% dari kotak FVG yang menjadi titik uji validitas reaksi harga.'
        },
        {
          question: 'Harga turun masuk ke Bullish FVG, lalu candle M5 ditutup (Body Close) telak di bawah seluruh kotak FVG tersebut. Apa artinya?',
          options: [
            'Bullish FVG semakin kuat untuk di-Buy',
            'Bullish FVG tersebut gagal/bocor dan berpotensi berbalik menjadi Inversion FVG (resistance)',
            'Wajib menambah lot Buy (martingale)',
            'Tidak berpengaruh sama sekali'
          ],
          answerIndex: 1,
          explanation: 'Penutupan body menembus penuh melewati FVG membatalkan fungsi asalnya dan membuka skenario Inversion FVG.'
        }
      ]
    },
    {
      id: 'order-block-valid-mean-threshold',
      number: 13,
      levelId: 3,
      title: 'Order Block Valid vs Palsu & 50% Mean Threshold',
      readMinutes: 6,
      diagramId: 'order-block-mt',
      summary: 'Berhenti menandai setiap candle terakhir sebagai Order Block. OB sejati wajib menyapu likuiditas, memicu Displacement + FVG, dan tubuhnya dilindungi garis 50% Mean Threshold.',
      conceptBlocks: [
        {
          heading: 'Definisi Order Block (OB) ICT yang Benar',
          paragraphs: [
            'Order Block adalah deretan candle berlawanan terakhir tepat sebelum dorongan Displacement kuat. Untuk Bullish OB: candle turun (down-close) terakhir sebelum lonjakan naik eksplosif. Untuk Bearish OB: candle naik (up-close) terakhir sebelum bantingan turun agresif.',
            'Mengapa 80% Order Block pemula jebol? Karena mereka menandai candle lawan acak di tengah range! Order Block institusi yang berkualitas tinggi memiliki 3 syarat wajib: (1) Terbentuk setelah/sambil menyapu likuiditas (Sweep), (2) Langsung diikuti Displacement yang menciptakan FVG, dan (3) Berhasil mematahkan struktur (BOS/MSS).'
          ]
        },
        {
          heading: 'Mean Threshold (MT): Level 50% Badan Order Block',
          paragraphs: [
            'Sama seperti CE untuk FVG, Order Block punya garis uji validitas bernama Mean Threshold (MT) — yaitu titik tengah 50% dari BADAN (Open ke Close) candle Order Block.',
            'Jika harga kembali menguji Order Block, batas maksimal toleransi sehat adalah garis Mean Threshold. Jika body candle ditutup menembus melewati 50% badan OB, kekuatan OB tersebut melemah drastis dan rawan gagal menjadi Breaker Block.'
          ]
        }
      ],
      validRules: [
        'OB terbentuk di ujung Sweep likuiditas atau di dalam POI timeframe lebih besar.',
        'Diikuti langsung oleh Displacement kuat yang mencetak FVG dan MSS/BOS.',
        'Saat harga retrace, body candle menghormati batas Open OB atau garis 50% Mean Threshold.'
      ],
      invalidRules: [
        'Candle lawan yang tidak meninggalkan FVG setelahnya.',
        'Order Block yang sudah pernah dimitigasi (disentuh) sebelumnya.',
        'Candle OB dengan ukuran terlalu raksasa (lebih lebar dari setengah range harian) sehingga SL menjadi tidak masuk akal.'
      ],
      xauScenario: {
        context: 'Sesi London XAU/USD M15: candle bearish terakhir (Open 2.646, Close 2.642, Wick bawah 2.640) menyapu Asia Low lalu langsung diikuti lonjakan bullish mencetak FVG & MSS.',
        steps: [
          'Tandai badan OB (2.642–2.646) dan garis 50% Mean Threshold di 2.644,00.',
          'Pasang Buy Limit di Open OB (2.646) atau agresif di Mean Threshold (2.644) agar R:R lebih besar.',
          'Taruh SL struktural + napas spread di bawah wick sweep OB (2.639,20).'
        ]
      },
      goldenRules: [
        'Tanpa Sweep dan tanpa FVG setelahnya, sebuah candle bukanlah High-Probability Order Block.',
        'Bedakan dua titik 50%: CE untuk kotak FVG/Wick, Mean Threshold untuk badan Order Block.'
      ],
      quiz: [
        {
          question: 'Dari 4 syarat berikut, manakah kombinasi yang membuat sebuah Order Block memiliki probabilitas tertinggi?',
          options: [
            'Candle kecil di tengah sideways tanpa FVG',
            'Menyapu likuiditas + diikuti Displacement yang mencetak FVG + mematahkan struktur',
            'Sudah disentuh 4 kali di hari yang sama',
            'Berada di luar jam Killzone tanpa arah H1'
          ],
          answerIndex: 1,
          explanation: 'Kombinasi Sweep + Displacement/FVG + Structural Break menyaring 80% Order Block palsu.'
        },
        {
          question: 'Bagaimana cara mengukur Mean Threshold (MT) pada sebuah Order Block dalam metodologi ICT?',
          options: [
            'Titik tengah 50% dari badan (Open ke Close) candle Order Block',
            'Jarak dari High hari kemarin ke Low hari ini',
            'Ujung wick terpanjang dibagi 3',
            'Nilai spread dikali dua'
          ],
          answerIndex: 0,
          explanation: 'Mean Threshold diukur tepat di 50% body (Open–Close) candle Order Block untuk menguji apakah OB dihormati.'
        },
        {
          question: 'Apa yang terjadi jika harga menutup body candle menembus jauh melewati 50% Mean Threshold dan sisi belakang Bullish OB?',
          options: [
            'Bullish OB semakin bagus untuk di-Buy',
            'Bullish OB gagal (Failed OB) dan berpotensi berubah peran menjadi Bearish Breaker Block',
            'Otomatis memicu Take Profit',
            'Harga berhenti bergerak'
          ],
          answerIndex: 1,
          explanation: 'Order Block yang jebol penuh oleh Displacement berlawanan berubah fungsi menjadi Breaker Block.'
        }
      ]
    },
    {
      id: 'cisd-vs-mss-sinyal-awal',
      number: 14,
      levelId: 3,
      title: 'CISD vs MSS: Sinyal Balik Arah Paling Awal',
      readMinutes: 5,
      diagramId: 'cisd-vs-mss',
      summary: 'Pahami perbedaan dua pemicu pembalikan terpenting: CISD memberi sinyal perubahan kontrol lebih cepat (di candle), sedangkan MSS memberi konfirmasi struktur lebih kuat (di swing).',
      conceptBlocks: [
        {
          heading: 'Change in State of Delivery (CISD)',
          paragraphs: [
            'CISD terjadi ketika algoritma memindahkan kontrol dari program jual ke program beli (atau sebaliknya) sebelum Swing High/Low struktur sempat tertembus.',
            'Cara melihatnya sangat objektif: setelah harga menyapu likuiditas ke bawah (SSL), tandai harga Open dari rangkaian candle turun terakhir yang mendorong ke dasar. Begitu ada candle bullish yang berhasil MENUTUP BODY (Close) di atas harga Open tersebut, itulah Bullish CISD! Kontrol resmi berpindah ke buyer.'
          ]
        },
        {
          heading: 'Market Structure Shift (MSS) & Kapan Memakai Keduanya',
          paragraphs: [
            'Market Structure Shift (MSS) menuntut langkah lebih jauh: harga harus memecah Swing High/Low struktural dengan Displacement kuat dan meninggalkan FVG.',
            'Keunggulan CISD adalah masuk lebih awal (R:R lebih besar, cocok saat harga bergerak sangat cepat di XAU/USD). Keunggulan MSS adalah validasi lebih aman bagi pemula. Skenario terbaik (Grade A+) adalah ketika CISD terjadi lebih dulu lalu segera diikuti MSS + FVG searah.'
          ]
        }
      ],
      validRules: [
        'CISD maupun MSS WAJIB terjadi setelah Sweep likuiditas atau sentuhan POI HTF — bukan di ruang hampa.',
        'Keduanya mensyaratkan Body Close, bukan sekadar tusukan wick.',
        'Pemula disarankan memprioritaskan MSS + FVG; trader berpengalaman dapat menggunakan CISD setelah sweep level kunci (PDH/PDL/Asia).'
      ],
      invalidRules: [
        'Menganggap setiap candle hijau yang menelan 1 candle merah di tengah range sebagai CISD valid.',
        'Memakai CISD tanpa konteks HTF Bias atau tanpa Sweep sebelumnya.',
        'Masuk langsung sebelum candle CISD/MSS selesai menutup.'
      ],
      xauScenario: {
        context: 'Harga XAU/USD menyapu PDL di 2.638 lalu memantul cepat di M5.',
        steps: [
          'Rangkaian 2 candle merah terakhir menuju dasar 2.638 dimulai dari Open di 2.641,50. Swing High terdekat ada di 2.645,00.',
          'Candle hijau M5 menutup penuh di 2.642,80 → CISD Bullish terkonfirmasi lebih awal!',
          'Candle berikutnya melesat menutup di 2.646,50 meninggalkan FVG → MSS Bullish juga terkonfirmasi. Zona FVG/OB yang terbentuk menjadi titik Buy Limit berprobabilitas tinggi.'
        ]
      },
      goldenRules: [
        'CISD = lampu peringatan dini di level candle; MSS = lampu hijau penuh di level struktur.',
        'Tanpa konteks Sweep atau POI HTF, CISD dan MSS hanya noise.'
      ],
      quiz: [
        {
          question: 'Apa perbedaan kecepatan utama antara CISD dan MSS?',
          options: [
            'MSS selalu terjadi lebih dulu daripada CISD',
            'CISD terjadi lebih cepat karena mengukur penutupan body melewati Open rangkaian candle lawan terakhir, sebelum Swing struktur tertembus oleh MSS',
            'Keduanya selalu terjadi di candle yang sama persis',
            'CISD hanya ada di saham, bukan XAU/USD'
          ],
          answerIndex: 1,
          explanation: 'CISD mendeteksi perubahan kontrol delivery di tingkat candle lebih awal dibanding MSS yang menunggu penembusan Swing.'
        },
        {
          question: 'Agar Bearish CISD valid setelah harga menyapu Buy-Side Liquidity (BSL), apa yang harus terjadi?',
          options: [
            'Candle bearish menutup body (Close) di bawah harga Open rangkaian candle naik terakhir yang menyapu BSL',
            'Muncul sumbu tipis ke bawah 1 pip',
            'Harga naik mencetak High baru lebih tinggi',
            'Volume turun menjadi nol'
          ],
          answerIndex: 0,
          explanation: 'Body Close menembus Open rangkaian candle naik terakhir menandakan algoritma beralih dari buy program ke sell program.'
        },
        {
          question: 'Untuk trader yang masih membangun konsistensi di Level awal, konfirmasi mana yang paling aman dijadikan standar utama?',
          options: [
            'Entry tanpa konfirmasi apa pun',
            'MSS disertai Displacement dan FVG bersih setelah Sweep/POI HTF',
            'Menebak saat candle baru berjalan 30 detik',
            'Mengikuti sinyal grup acak'
          ],
          answerIndex: 1,
          explanation: 'MSS + Displacement + FVG memberikan bukti struktur paling jelas dan menekan risiko sinyal palsu.'
        }
      ]
    },
    {
      id: 'premium-discount-equilibrium',
      number: 15,
      levelId: 3,
      title: 'Premium, Discount & Optimal Trade Entry (OTE)',
      readMinutes: 5,
      diagramId: 'premium-discount-ote',
      summary: 'Filter lokasi paling sederhana yang menyelamatkan ratusan trader dari FOMO: hanya beli di zona Discount (bawah 50%) dan hanya jual di zona Premium (atas 50%).',
      conceptBlocks: [
        {
          heading: 'Disiplin Beli Murah, Jual Mahal Secara Matematis',
          paragraphs: [
            'Tarik Fibonacci Retracement dari Swing Low ke Swing High pada satu gelombang impulsif (Dealing Range) di H1 atau M15. Atur hanya 4 garis bersih: 0%, 50% (Equilibrium), 62%–79% (Zona OTE — Optimal Trade Entry), dan 100%.',
            'Aturannya keras tanpa kompromi: saat mencari BUY, fokuskan semua FVG dan Order Block yang berada di bawah 50% (Discount). Saat mencari SELL, fokuskan hanya FVG dan Order Block di atas 50% (Premium).'
          ]
        },
        {
          heading: 'Zona OTE (62% – 79%) Sebagai Titik Pertemuan Emas',
          paragraphs: [
            'Dalam ICT, rentang retracement 61,8% hingga 78,6% (dengan titik manis di 70,5%) disebut Optimal Trade Entry (OTE). Ketika sebuah FVG atau Order Block bersih berhimpitan tepat di dalam zona OTE, kamu mendapatkan pertemuan dua filter sekaligus: diskon harga maksimal + jejak institusi + R:R minimal 1:3 menuju puncak/dasar lama.'
          ]
        }
      ],
      validRules: [
        'Semua posisi Buy berada di zona Discount (<50% leg impulsif) — idealnya berhimpitan dengan FVG/OB di zona OTE (62%–79%).',
        'Semua posisi Sell berada di zona Premium (>50% leg impulsif).',
        'Jika terdapat 2 FVG, utamakan FVG yang lebih dalam di zona Discount/Premium.'
      ],
      invalidRules: [
        'Mengejar Buy di atas 60%–80% Premium karena takut tertinggal kereta.',
        'Menggunakan garis OTE sendirian tanpa struktur, Sweep, atau PD Array (FVG/OB).',
        'Menarik Fibonacci dari swing acak yang belum mencetak BOS/Displacement.'
      ],
      xauScenario: {
        context: 'XAU/USD M15 baru saja melakukan Displacement naik dari 2.640 ke 2.660 ($20 move).',
        steps: [
          'Equilibrium (50%) = 2.650. Zona OTE Buy (62%–79% retracement dari atas) = 2.647,60 hingga 2.644,20.',
          'Di 2.646,00 terdapat Bullish FVG M15 yang masih fresh — persis di tengah zona OTE!',
          'Entry di 2.646,00 dengan SL di 2.639,50 ($6,50) dan TP di High 2.660 ($14,00) langsung memberikan R:R > 1:2,1 tanpa perlu menebak harga menembus atap baru.'
        ]
      },
      goldenRules: [
        'Jika harga tidak mau memberi diskon di bawah 50%, biarkan ia pergi — selalu ada bus berikutnya.',
        'FVG/OB + Zona OTE (62%–79%) adalah kombinasi presisi tertinggi untuk scalper.'
      ],
      quiz: [
        {
          question: 'Di rentang persentase retracement berapakah zona Optimal Trade Entry (OTE) ICT berada?',
          options: [
            '10% – 25%',
            '61,8% – 78,6% (titik manis 70,5%)',
            '45% – 50% saja',
            '95% – 100%'
          ],
          answerIndex: 1,
          explanation: 'Zona OTE terletak dalam area diskon/premium mendalam di 61,8%–78,6% dengan titik tengah 70,5%.'
        },
        {
          question: 'Harga sedang Uptrend dan baru mencetak gelombang naik dari 2.600 ke 2.640. Di area harga berapakah kamu boleh mencari FVG untuk Buy?',
          options: [
            'Di atas 2.630 (Premium)',
            'Di bawah 2.620 (Discount < 50%)',
            'Tepat di 2.640 (puncak tertinggi)',
            'Di mana saja asal candle hijau'
          ],
          answerIndex: 1,
          explanation: 'Equilibrium berada di 2.620; seluruh harga di bawah 2.620 adalah zona Discount yang ideal untuk Buy.'
        },
        {
          question: 'Apakah menyentuh level 70,5% Fibonacci saja sudah cukup untuk langsung klik entry tanpa FVG, OB, atau konfirmasi?',
          options: [
            'Ya, 70,5% selalu memantul 100%',
            'Tidak — OTE adalah filter lokasi; tetap harus berhimpitan dengan PD Array (FVG/OB) dan struktur yang valid',
            'Ya, asalkan di sesi Asia',
            'Hanya jika lot di bawah 0,05'
          ],
          answerIndex: 1,
          explanation: 'Fibonacci OTE adalah pengukur diskon lokasi, bukan pemicu entry tunggal tanpa jejak PD Array.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════
    // LEVEL 4 — 4 MODEL ENTRY SCALPER A+
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'model-sweep-mss-fvg',
      number: 16,
      levelId: 4,
      title: 'Model 1: Sweep → MSS/CISD → FVG (Setup Utama)',
      readMinutes: 6,
      diagramId: 'model-sweep-fvg',
      summary: 'Inilah model entry paling klasik dan paling sering muncul di XAU/USD (Model 2022 ICT): tunggu likuiditas disapu, tunggu patah struktur tegas, lalu masuk saat retrace ke FVG.',
      conceptBlocks: [
        {
          heading: 'Rangkaian 4 Langkah Mekanis Tanpa Tebak-Tebakan',
          paragraphs: [
            'Model 1 adalah fondasi utama scalper ICT karena urutan logikanya sangat jernih dan bisa diaudit di jurnal:',
            '1. Liquidity Sweep: Harga menusuk melewati level penting (Asia High/Low, PDH/PDL, atau Swing M15) untuk mengumpulkan bahan bakar.\n2. Displacement + MSS/CISD: Harga berbalik cepat dengan candle tebal yang mematahkan struktur M5/M15 dan meninggalkan celah FVG bersih.\n3. Retracement ke FVG: Pasang Limit Order di tepi FVG atau 50% CE (pastikan di area Discount untuk Buy / Premium untuk Sell).\n4. Proteksi & Target: SL di luar ujung wick sweep (+ napas spread) dan TP di kolam likuiditas terdekat sisi seberang (min R:R 1:2).'
          ]
        },
        {
          heading: 'Mengapa Model Ini Cocok Sebagai "Satu Tendangan Utama"',
          paragraphs: [
            'Kamu tidak pernah menebak kapan pembalikan terjadi — kamu membiarkan institusi menunjukkan kartu mereka lebih dulu lewat Sweep dan Displacement. Jika salah satu dari 3 syarat (Sweep, MSS/CISD, FVG) tidak ada, kamu otomatis tidak entry.'
          ]
        }
      ],
      validRules: [
        'Wajib ada Sweep likuiditas nyata (Asia High/Low, PDH/PDL, atau EQH/EQL) sebelum MSS.',
        'MSS terjadi dengan candle Displacement tegas yang menciptakan FVG segar.',
        'Terjadi di dalam jendela waktu Killzone WITA (London 15:00–19:00 atau NY AM 20:00–24:00).'
      ],
      invalidRules: [
        'Ada FVG tetapi sebelumnya tidak ada Sweep likuiditas maupun sentuhan POI HTF.',
        'Harga sudah terbang terlalu jauh mencapai target TP sebelum sempat kembali ke FVG (setup hangus — cancel pending order!).',
        'R:R menuju kolam likuiditas terdekat kurang dari 1:1,8.'
      ],
      xauScenario: {
        context: 'Sesi NY AM (20:45 WITA), Bias H1 Bearish menuju PDL 2.632.',
        steps: [
          'Tahap 1 (Sweep): Harga naik menyapu London High di 2.652,50 hingga 2.654,00.',
          'Tahap 2 (MSS + FVG): M5 membanting turun menembus Swing Low 2.649,00 dengan body tebal, meninggalkan Bearish FVG di 2.650,00–2.652,00.',
          'Tahap 3 (Entry): Sell Limit di 2.650,50, SL di 2.654,80 ($4,30 risiko termasuk buffer spread).',
          'Tahap 4 (Target): TP1 partial di 2.641,50 (2R, +$9), TP2 runner di PDL 2.632,50 (4,1R).'
        ]
      },
      goldenRules: [
        'Jika harga sudah menyentuh target likuiditas SEBELUM menjemput limit order FVG kamu, segera batalkan order!',
        'Kuasai Model 1 ini minimal 30 trade sebelum sibuk mengeksplorasi model lain.'
      ],
      quiz: [
        {
          question: 'Apa urutan tepat 3 pemicu inti pada Model 1 (ICT 2022)?',
          options: [
            'FVG dulu → baru cari Sweep → baru MSS',
            'Liquidity Sweep → Displacement + MSS/CISD → Retracement ke FVG',
            'Entry dulu → baru pasang SL → baru cek tren',
            'Tunggu berita CPI → langsung Market Order'
          ],
          answerIndex: 1,
          explanation: 'Bahan bakar (Sweep) harus diambil dulu, lalu komitmen dibuktikan (MSS/CISD + FVG), baru entry saat diskon (Retracement).'
        },
        {
          question: 'Kamu sudah memasang Sell Limit di Bearish FVG, tetapi harga langsung terjun mencapai target TP1 (SSL) tanpa sempat naik menjemput ordermu. Apa yang wajib dilakukan?',
          options: [
            'Biarkan Sell Limit tetap aktif sampai besok',
            'Segera batalkan (Cancel) Sell Limit karena bahan bakar likuiditas target sudah habis terambil',
            'Langsung kejar Sell di harga paling bawah',
            'Ubah jadi Buy Limit tanpa analisis'
          ],
          answerIndex: 1,
          explanation: 'Begitu Draw on Liquidity (target) tercapai, tujuan perjalanan harga selesai dan order lama menjadi kadaluarsa.'
        },
        {
          question: 'Di mana penempatan Stop Loss struktural terbaik untuk Model 1?',
          options: [
            'Acak 10 pips dari titik entry',
            'Di luar ujung wick ekstrem dari candle yang melakukan Sweep (+ napas spread)',
            'Tepat di garis 50% FVG',
            'Tidak perlu SL karena sudah ada MSS'
          ],
          answerIndex: 1,
          explanation: 'Jika ujung wick Sweep ditembus kembali, seluruh premis manipulasi otomatis batal.'
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
      number: 18,
      levelId: 4,
      title: 'Model 3: Inversion FVG (IFVG) Saat FVG Gagal',
      readMinutes: 6,
      diagramId: 'model-ifvg-flip',
      summary: 'Di XAU/USD yang bergerak sangat agresif, harga sering tidak sempat memberi pullback rapi ke FVG baru. Inversion FVG (IFVG) menangkap momen tepat saat FVG lawan hancur dan berbalik fungsi.',
      conceptBlocks: [
        {
          heading: 'Mekanisme Inversion FVG (Perubahan Kutub)',
          paragraphs: [
            'Bayangkan harga turun menyapu Sell-Side Liquidity (SSL) sambil meninggalkan sebuah Bearish FVG (SIBI) di kaki penurunan terakhir. Normalnya, jika pasar benar-benar mau turun terus, Bearish FVG itu harus menahan harga dan memantulkannya ke bawah.',
            'Namun ketika institusi selesai menyapu SSL dan membalikkan arah, harga justru melesat naik dan MENUTUP BODY CANDLE menembus penuh ke atas Bearish FVG tadi. Pada detik itulah Bearish FVG yang gagal berubah kutub menjadi Bullish Inversion FVG (IFVG) — kini berfungsi sebagai lantai pijakan kuat untuk Buy!'
          ]
        },
        {
          heading: 'Keunggulan IFVG untuk Scalper Gold',
          paragraphs: [
            'IFVG adalah senjata andalan scalper modern (terutama di sesi NY AM / Silver Bullet) karena kamu bisa masuk lebih awal saat pergeseran order flow terjadi tanpa harus menunggu MSS jauh. Syarat mutlaknya: IFVG hanya valid jika terjadi TEPAT setelah Sweep likuiditas atau sentuhan POI HTF.'
          ]
        }
      ],
      validRules: [
        'Harga baru saja menyapu kolam likuiditas (BSL/SSL) atau menyentuh POI H1/M15.',
        'FVG lawan terakhir ditembus penuh oleh Body Close (bukan sekadar wick).',
        'Masuk saat penutupan candle penembus atau retest cepat ke sisi luar kotak IFVG, dengan SL di balik ujung sweep.'
      ],
      invalidRules: [
        'Mengambil setiap FVG yang tertembus di tengah konsolidasi tanpa Sweep/HTF POI.',
        'FVG hanya tertembus wick lalu body kembali masuk ke dalam kotak (belum menjadi IFVG).',
        'Target likuiditas sudah terlalu dekat sehingga R:R di bawah 1:1,8.'
      ],
      xauScenario: {
        context: 'Sesi NY AM (21:10 WITA): XAU/USD turun menyapu Asia Low 2.644 dan meninggalkan Bearish FVG M5 di 2.646,50–2.648,00.',
        steps: [
          'Harga tidak lanjut turun; justru muncul candle bullish M5 tegas yang menutup body di 2.649,20 — menghancurkan Bearish FVG 2.646,50–2.648,00.',
          'Bearish FVG tersebut resmi menjadi Bullish IFVG.',
          'Saat candle berikutnya retest singkat ke 2.648,00 (batas atas IFVG), eksekusi Buy dengan SL di bawah low sweep 2.643,40 dan target ke NY High 2.658,50 (R:R 1:2,3).'
        ]
      },
      goldenRules: [
        'FVG lawan yang hancur setelah Sweep adalah bukti paling nyata bahwa pihak lawan sudah menyerah.',
        'Body Close melewati seluruh kotak FVG lawan = sah menjadi IFVG.'
      ],
      quiz: [
        {
          question: 'Bagaimana syarat sah terbentuknya Bullish Inversion FVG (IFVG)?',
          options: [
            'Harga naik menyentuh Bearish FVG lalu jatuh lagi',
            'Setelah Sweep/POI, candle bullish menutup body (Close) menembus penuh melewati seluruh kotak Bearish FVG sebelumnya',
            'Terbentuk 3 candle merah berurutan di puncak',
            'Hanya ujung wick yang menyentuh garis tengah FVG'
          ],
          answerIndex: 1,
          explanation: 'Inversion FVG sah ketika Body Close benar-benar menembus penuh sisi seberang FVG lawan.'
        },
        {
          question: 'Mengapa IFVG sangat populer di kalangan scalper XAU/USD?',
          options: [
            'Karena bisa dipakai saat pasar tutup hari Minggu',
            'Karena memberi pemicu entry lebih dini saat momentum Gold bergerak cepat tanpa menunggu pullback dalam',
            'Karena tidak memerlukan konteks likuiditas',
            'Karena win rate-nya selalu 100%'
          ],
          answerIndex: 1,
          explanation: 'Pada pasar volatil seperti Gold, IFVG menangkap transisi order flow cepat pasca-sweep sebelum harga lari terlalu jauh.'
        },
        {
          question: 'Kapan sebuah FVG yang tertembus TIDAK boleh dijadikan sinyal entry IFVG?',
          options: [
            'Saat muncul tepat setelah sweep PDL di sesi London',
            'Saat muncul di tengah pasar sideways/choppy tanpa latar belakang Sweep atau POI HTF',
            'Saat searah dengan bias H1 dan target likuiditas masih luas',
            'Saat R:R minimal 1:2'
          ],
          answerIndex: 1,
          explanation: 'Di tengah range choppy, FVG sering ditembus bolak-balik tanpa niat institusi; selalu butuh Sweep atau HTF POI.'
        }
      ]
    },
    {
      id: 'model-turtle-soup-smr',
      number: 19,
      levelId: 4,
      title: 'Model 4: Turtle Soup & Smart Money Reversal',
      readMinutes: 6,
      diagramId: 'model-turtle-soup',
      summary: 'Teknik sniper pembalikan ekstrem: menangkap titik balik persis di dasar/puncak jebakan sweep sebelum publik menyadari tren telah berubah arah.',
      conceptBlocks: [
        {
          heading: 'Filosofi Turtle Soup (Memakan Jebakan Breakout)',
          paragraphs: [
            'Nama "Turtle Soup" diambil dari eksperimen trader breakout legendaris (Turtle Traders) yang membeli setiap kali harga menembus High 20 periode. Dalam ICT, Turtle Soup adalah kebalikannya: kita menunggu harga sengaja menembus High/Low penting (PDH/PDL, PWH/PWL, atau Asia High/Low) di dalam zona HTF POI, lalu memanfaatkan penolakan cepatnya untuk masuk berlawanan arah.',
            'Smart Money Reversal (SMR) adalah fondasi besarnya: harga menyapu likuiditas eksternal → terjadi exhaustion (ekor panjang / gagal tutup body di luar) → muncul CISD / penutupan masuk kembali ke dalam range → lalu meluncur menuju sisi likuiditas seberang.'
          ]
        },
        {
          heading: 'Disiplin Ketat: Turtle Soup Bukan "Menangkap Pisau Jatuh"',
          paragraphs: [
            'Kesalahan fatal pemula yang sok mencoba Turtle Soup adalah langsung klik Buy/Sell saat candle masih meledak menembus level! Itu bukan Turtle Soup — itu bunuh diri melawan kereta.',
            'Turtle Soup profesional WAJIB menunggu bukti penyerapan (Absorption Wick + gagal Body Close di luar level + CISD di M5) dan HANYA dieksekusi di level likuiditas besar yang selaras dengan POI H1/H4.'
          ]
        }
      ],
      validRules: [
        'Hanya dilakukan di level likuiditas ekstrem (PDH/PDL, PWH/PWL, Asia High/Low) yang berhimpitan dengan POI H1/H4.',
        'Wajib melihat bukti penolakan nyata: ekor panjang (Absorption Wick) + gagal close di luar + konfirmasi CISD M5.',
        'Targetkan minimal 50% range sebelumnya (TP1) hingga likuiditas ekstrem sisi seberang (TP2).'
      ],
      invalidRules: [
        'Langsung melawan candle marubozu raksasa yang menutup penuh jauh di luar PDH/PDL.',
        'Mencoba Turtle Soup tepat saat rilis berita merah CPI/FOMC.',
        'Mencoba berkali-kali (re-entry beruntun) setelah Turtle Soup pertama terkena SL.'
      ],
      xauScenario: {
        context: 'XAU/USD menyentuh lantai keramat PWL 2.618 saat pembukaan London (16:00 WITA), berhimpitan dengan H4 Bullish Order Block.',
        steps: [
          'Harga menusuk cepat ke 2.616,00 (menyapu PWL $2) lalu dalam 5 menit ditarik keras ke atas membentuk ekor bawah panjang dan ditutup di 2.619,80.',
          'Candle M5 berikutnya mengonfirmasi Bullish CISD (close di atas Open candle sweep).',
          'Eksekusi Buy di 2.619,50, SL ketat di 2.615,20 ($4,30 risiko). Target TP1 Asia High 2.630 (+$10,50 / 2,4R), TP2 PDH 2.642 (+5,2R).'
        ]
      },
      goldenRules: [
        'Turtle Soup = tunggu bukti gagal breakout + CISD, bukan menebak pucuk saat candle masih terbang.',
        'Maksimal 1 peluru per level ekstrem — jika ditembus, terima tren dan jangan melawan.'
      ],
      quiz: [
        {
          question: 'Apa perbedaan antara Turtle Soup yang benar dengan "menangkap pisau jatuh" yang berbahaya?',
          options: [
            'Turtle Soup menggunakan lot 10x lebih besar',
            'Turtle Soup hanya dilakukan di level likuiditas/POI HTF dengan bukti penolakan (wick absorption + gagal body close + CISD)',
            'Turtle Soup tidak memakai Stop Loss',
            'Turtle Soup dilakukan di tengah range sideways'
          ],
          answerIndex: 1,
          explanation: 'Konfirmasi penolakan dan lokasi POI HTF membedakan reversal institusional dari sekadar menebak pucuk.'
        },
        {
          question: 'Harga menembus PDH lalu menutup body candle M15 penuh dan tebal jauh di atas PDH tanpa ekor penolakan. Apakah ini sinyal Turtle Soup Sell?',
          options: [
            'Ya, langsung Sell sekarang juga',
            'Bukan — penutupan body kuat menandakan ekspansi lanjutan, skenario Turtle Soup batal',
            'Ya, cukup tambah buffer SL $20',
            'Pasang Buy dan Sell bersamaan'
          ],
          answerIndex: 1,
          explanation: 'Turtle Soup mensyaratkan kegagalan mempertahankan breakout; body close tegas di luar justru bukti kekuatan tren.'
        },
        {
          question: 'Di level mana Turtle Soup memiliki probabilitas tertinggi pada XAU/USD?',
          options: [
            'Swing mikro M1 di jam makan siang Asia',
            'Level ekstrem PWH/PWL, PDH/PDL, atau Asia High/Low yang berhimpitan dengan POI H1/H4',
            'Setiap angka ganjil di chart',
            'Tepat 1 menit sebelum rilis NFP'
          ],
          answerIndex: 1,
          explanation: 'Pertemuan likuiditas ekstrem + POI HTF menciptakan konsentrasi order pembalikan terkuat.'
        }
      ]
    },
    {
      id: 'memilih-1-model-dan-filter-gagal',
      number: 20,
      levelId: 4,
      title: 'Memilih 1 Model Utama & Filter Setup Gagal',
      readMinutes: 5,
      diagramId: 'model-selection-matrix',
      summary: 'Kamu sudah mengenal 4 model entry — tetapi rahasia profit konsisten adalah memilih 1 model utama (dan maksimal 1 cadangan) lalu menyaring 70% setup tanggung.',
      conceptBlocks: [
        {
          heading: 'Jebakan "Semua Model Dipakai Setiap Hari"',
          paragraphs: [
            'Memahami 4 model bukan berarti kamu harus memaksa mencari keempatnya setiap sesi. Trader yang mencoba berburu Sweep-FVG, OB, IFVG, dan Turtle Soup sekaligus sering berakhir overtrading karena selalu menemukan alasan untuk menekan tombol.',
            'Panduan memilih model sesuai kepribadianmu: jika kamu suka aturan paling jernih dan sabar → jadikan **Model 1 (Sweep → MSS → FVG)** sebagai senjata utama. Jika kamu suka R:R super tajam → padukan dengan **Model 2 (OB + MT)**. Jika kamu sering ketinggalan retracement di NY AM → pakai **Model 3 (IFVG)** sebagai cadangan. Gunakan **Model 4 (Turtle Soup)** hanya saat level keramat PWH/PDL berhimpitan POI H4.'
          ]
        },
        {
          heading: '5 Bendera Merah (Auto-Skip) yang Wajib Kamu Patuhi',
          paragraphs: [
            'Sebelum klik entry di model mana pun, cek 5 filter pembatal ini. Jika SATU saja terpenuhi, tutup jari dan lewati: (1) Harga di tengah range 40%–60% tanpa sweep, (2) Berhadapan langsung dengan POI H1/H4 berlawanan arah, (3) Dalam jendela ±15–30 menit berita merah USD, (4) R:R ke likuiditas terdekat < 1:1,8, atau (5) Kamu baru saja kena 2x SL hari ini.'
          ]
        }
      ],
      validRules: [
        'Tetapkan 1 Model Utama untuk 30 trade pertama agar data statistik di Jurnal murni dan bisa dievaluasi.',
        'Semua 4 pilar selaras: Waktu Killzone + Arah/POI H1 + Sweep/Konfirmasi M5 + R:R ≥ 1:2.',
        'Berani menulis "NO SETUP" di jurnal saat kondisi pasar tidak memenuhi kriteria.'
      ],
      invalidRules: [
        'Ganti-ganti model setiap kali mengalami 1–2 kali Stop Loss (System Hopping).',
        'Memaksakan validasi dengan mencocok-cocokkan istilah ICT agar tetap bisa entry.',
        'Masuk di setup Grade C hanya karena bosan menunggu di depan layar.'
      ],
      xauScenario: {
        context: 'Komparasi cepat memilih setup di sesi London vs NY AM.',
        steps: [
          'Kasus A: Ada Sweep Asia Low + MSS M5 + FVG bersih di Discount + H1 Bullish + tidak ada news → Grade A+ (Eksekusi Model 1).',
          'Kasus B: Ada FVG M5 rapi, tapi berada tepat di tengah range, tanpa sweep, dan 10 menit lagi rilis CPI → Grade D (AUTO SKIP!).'
        ]
      },
      goldenRules: [
        'Satu setup Grade A+ yang dikuasai luar dalam jauh lebih kaya daripada 10 setup setengah paham.',
        'Kualitas seorang scalper diukur dari setup jelek yang berhasil ia tolak.'
      ],
      quiz: [
        {
          question: 'Mengapa kamu disarankan menguji 1 model utama minimal 20–30 trade sebelum menilai atau menggantinya?',
          options: [
            'Karena aturan broker mewajibkan 30 trade',
            'Agar data statistik Win Rate dan Expectancy valid secara probabilitas, bukan sekadar reaksi emosi dari 2 loss',
            'Supaya bisa menghafal semua warna chart',
            'Karena model lain tidak berfungsi di hari Selasa'
          ],
          answerIndex: 1,
          explanation: 'Keunggulan probabilitas hanya terlihat pada sampel memadai; berpindah metode tiap 2 loss (system hopping) menghancurkan data.'
        },
        {
          question: 'Manakah dari kondisi berikut yang merupakan Bendera Merah (AUTO-SKIP) meski terlihat ada FVG di M5?',
          options: [
            'Terjadi di London Killzone setelah sweep Asia Low',
            'Terjadi 8 menit sebelum rilis CPI USD dan R:R ke target terdekat hanya 1:1,1',
            'Searah dengan bias H1 dan berada di zona OTE',
            'Memiliki Stop Loss struktural yang rapi'
          ],
          answerIndex: 1,
          explanation: 'Dekat berita High Impact USD dan R:R buruk (<1:1,8) adalah alasan mutlak untuk tidak masuk pasar.'
        },
        {
          question: 'Jika kamu sering tertinggal retracement FVG saat momentum sesi NY AM sangat kencang, model cadangan mana yang paling cocok dipelajari?',
          options: [
            'Model 3: Inversion FVG (IFVG) pasca-sweep',
            'Indikator Stochastic overbought',
            'Grid averaging tanpa SL',
            'Trading di jam rollover subuh'
          ],
          answerIndex: 0,
          explanation: 'IFVG menangkap transisi order flow cepat segera setelah FVG lawan ditembus oleh body close.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
