/* Amy FX Academy — Deep Mastery Enrichment Layer (Modul 01–36)
 * Memperdalam seluruh 36 modul inti agar bebas kebingungan saat mapping nyata:
 * - extraConceptBlocks: bedah logika mendalam pada topik paling membingungkan (DOL, FVG, OB, Dealing Range, Sweep vs Liquidity Run, CISD, MTF, AMD, dll.)
 * - mappingSteps: panduan mekanis langkah demi langkah menggambar langsung di chart kosong
 * - decisionTree: pohon keputusan IF -> THEN untuk kasus abu-abu di chart nyata
 * - failedCase: bedah kasus gagal (kenapa setup yang terlihat mirip malah kena SL)
 * - extraQuiz: tambahan soal skenario nyata untuk gerbang Uji Paham (Locking >= 80%)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AmyAcademyEnrichment = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const ENRICHMENTS = {
    'kenal-trading-broker-akun': {
      mappingSteps: [
        'Buka aplikasi broker teregulasi dan buat **Akun Demo** dengan modal realistis ($100 atau $500 — jangan $100.000 agar mental tidak rusak).',
        'Catat nama simbol Gold di broker (biasanya `XAUUSD`, `XAUUSDm`, atau `XAUUSDc` untuk Cent) lalu masukkan ke daftar favorit Market Watch.',
        'Cek ukuran 1 lot kontrak Gold di menu *Specification* MT5 (Standard = 100 oz; Cent = 1/100 nilai dolar).'
      ],
      decisionTree: [
        {
          condition: 'Saya cuma punya modal latihan $15–$50 tapi ingin merasakan emosi uang asli. Pilih Standard atau Cent?',
          action: 'Wajib **Akun Cent (USC)**! Modal $20 menjadi 2.000 USC sehingga risiko 1% per trade tetap masuk akal tanpa langsung margin call.'
        },
        {
          condition: 'Sudah 2 minggu profit di Demo, apakah boleh langsung deposit besar di akun Standard?',
          action: 'Belum. Tuntaskan minimal 30–50 transaksi terukur di Jurnal dengan disiplin SL, baru pindah bertahap ke Cent lalu Standard.'
        }
      ],
      failedCase: {
        title: 'Kesalahan Klasik Pemula',
        context: 'Deposit $30 langsung ke Akun Standard lalu buka 0.03 lot XAU/USD karena tergiur cepat balik modal.',
        whyFailed: 'Gold bergerak mundur hanya $10 (100 pips — gerak normal harian) dan saldo $30 langsung ludes terkena Stop Out dalam 15 menit.'
      }
    },

    'bid-ask-spread-pips-gold': {
      mappingSteps: [
        'Buka MT5 → Settings/Properties Chart → aktifkan centang **Show Ask Price Line** agar garis Bid dan Ask terlihat bersamaan.',
        'Ukur jarak selisih garis Ask dan Bid saat sesi London/NY (normal $0.15–$0.35) lalu bandingkan saat rollover jam 05:00 WITA (bisa melebar >$1.50).',
        'Latih konversi cepat: setiap harga Gold naik/turun `$1.00` = `10 pips` = `100 points`.'
      ],
      decisionTree: [
        {
          condition: 'Saya pasang posisi SELL dengan SL di 2.655,00. Harga di chart baru menyentuh 2.654,60 tapi posisi sudah kena SL. Apakah broker curang?',
          action: 'Bukan curang — chart default hanya menampilkan garis **BID**, sedangkan posisi **SELL ditutup oleh garis ASK**! Jika spread sedang $0.40, garis Ask sudah menyentuh 2.655,00.'
        },
        {
          condition: 'Spread Gold tiba-tiba melebar di atas $0.80 (8 pips) menjelang berita atau pergantian hari.',
          action: 'Tutup tangan (NO ENTRY). Spread lebar memakan R:R dan membuat SL sangat mudah tersambar tanpa menyentuh harga sebenarnya.'
        }
      ],
      failedCase: {
        title: 'Terjebak SL Tipis Tanpa Napas Spread',
        context: 'Pasang Sell Limit di 2.650,00 dengan SL pas di puncak wick 2.651,00 (hanya $1) saat spread $0.40.',
        whyFailed: 'Harga hanya naik ke 2.650,65 (belum menembus wick), tapi garis Ask menyentuh 2.651,05 → SL tersambar duluan sebelum harga jatuh -100 pips.'
      }
    },

    'lot-leverage-margin-equity': {
      mappingSteps: [
        'Tentukan dulu 3 angka sebelum klik order: **Modal ($)**, **Batas Risiko (%) maksimal 1%**, dan **Jarak SL dalam dolar ($)**.',
        'Hitung memakai rumus wajib: `Lot Standard = Risiko ($) ÷ (Jarak SL $ × 100)`. Jika hasilnya < 0.01 lot, berarti modalmu wajib memakai Akun Cent.',
        'Cek angka **Margin Level** di tab Trade MT5 — jaga selalu jauh di atas 500% dengan tidak membuka posisi berlapis (over-layer).'
      ],
      decisionTree: [
        {
          condition: 'Hasil hitung rumus lot adalah 0.004 lot di Akun Standard, tapi minimal broker adalah 0.01 lot. Boleh dibulatkan naik ke 0.01?',
          action: 'Hati-hati! Membulatkan 0.004 → 0.01 artinya kamu menaikkan risiko 2.5x lipat dari rencana. Solusi sehat: pindah ke **Akun Cent** atau cari setup dengan jarak SL lebih ringkas.'
        },
        {
          condition: 'Balance tertulis $500 tapi Equity tinggal $410. Mana angka sejati uangku sekarang?',
          action: '**Equity ($410)**! Balance belum menghitung posisi rugi yang masih terbuka (floating loss).'
        }
      ],
      failedCase: {
        title: 'Jebakan Leverage Tinggi 1:1000',
        context: 'Modal $100 dengan leverage 1:1000 membuat trader bisa membuka 0.20 lot XAU/USD (margin terpakai kecil).',
        whyFailed: 'Leverage besar hanya mengecilkan margin, BUKAN mengecilkan risiko per pips! Gerak -$5 di 0.20 lot = rugi -$100 (habis total dalam 1 candle M5).'
      }
    },

    'panduan-mt5-lima-jenis-order': {
      mappingSteps: [
        'Saat harga masih di atas area Discount pilihanmu (misal harga 2.655, kamu mau beli murah di 2.648), pilih **Buy Limit**.',
        'Saat harga masih di bawah area premium pilihanmu (misal harga 2.645, kamu mau jual mahal di 2.652), pilih **Sell Limit**.',
        'Selalu isi kolom **Stop Loss** dan **Take Profit** SEBELUM menekan tombol Place/Order — jangan pernah menunda pasang SL.'
      ],
      decisionTree: [
        {
          condition: 'Bingung membedakan Buy Limit vs Buy Stop saat pasang order di MT5?',
          action: 'Ingat kalimat sederhana: **LIMIT = Nunggu harga Discount/mahal lalu memantul balik** (Buy Limit di bawah harga sekarang, Sell Limit di atas). **STOP = Ikut tembusan/breakout** (Buy Stop di atas harga sekarang).'
        },
        {
          condition: 'Order Buy Limit gagal dipasang dengan pesan "Invalid S/L or T/P" di MT5.',
          action: 'Cek dua hal: (1) harga entry Buy Limit harus lebih rendah dari Ask sekarang, dan (2) SL harus lebih rendah dari entry, TP lebih tinggi dari entry, minimal di luar jarak *Stops Level* broker.'
        }
      ],
      failedCase: {
        title: 'Salah Pilih Buy Stop Jadi Beli di Pucuk',
        context: 'Ingin beli murah di FVG bawah tapi salah pilih Market Execution / Buy Stop di atas puncak.',
        whyFailed: 'Posisi langsung terbuka di harga paling mahal tepat sebelum harga retrace turun menuju SL.'
      }
    },

    'membaca-chart-candlestick-nol': {
      mappingSteps: [
        'Buka chart polos tanpa indikator, fokus membaca 4 titik setiap candle: **Open, High, Low, Close (OHLC)**.',
        'Bandingkan ukuran **Body** (jarak Open–Close = tenaga real) vs **Wick/Wick** (jarak ekstrem = penolakan harga).',
        'Latih berpindah TF dari **H1 → M15 → M5**: ingat 1 candle H1 berisi 4 candle M15 dan 12 candle M5.'
      ],
      decisionTree: [
        {
          condition: 'Candle M5 sedang membentuk batang hijau raksasa padahal baru berjalan 1 menit (sisa 4 menit). Boleh langsung anggap breakout valid?',
          action: '**JANGAN!** Candle belum sah sebelum **Close (menit ke-5 selesai)**. Sangat sering di XAU/USD candle hijau raksasa berubah jadi wick panjang merah dalam 30 detik terakhir.'
        },
        {
          condition: 'Candle H1 menunjukkan hijau kuat tapi saat dibuka di M5 tampak ada 3 candle merah turun. Mana yang benar?',
          action: 'Keduanya benar — 3 candle merah M5 hanyalah gerak naik-turun di dalam **15 menit pertama** pembentuk wick bawah candle H1. Selalu baca M5 dalam konteks H1.'
        }
      ],
      failedCase: {
        title: 'Terjebak Candle Belum Close',
        context: 'Melihat candle M15 menjebol resistance di menit ke-4 lalu buru-buru Buy.',
        whyFailed: 'Saat candle M15 benar-benar tutup di menit ke-15, harga sudah ditarik turun membentuk pin bar penolakan — breakout tadi hanyalah wick sweep.'
      }
    },

    'dasar-tren-sr-rencana-14-hari': {
      mappingSteps: [
        'Tandai titik puncak dan lembah paling mencolok di H1: naik berurutan (**HH–HL**) = Uptrend, turun berurutan (**LH–LL**) = Downtrend.',
        'Gambar area Support/Resistance horizontal yang pernah disentuh minimal 2 kali — tapi mulai latih mata bahwa area S/R "terlalu rapi" kelak adalah tempat tumpukan stop loss (Liquidity) di ICT!',
        'Jalankan disiplin 14 hari: 7 hari pertama fokus tandai chart & latihan eksekusi Demo, 7 hari berikutnya catat minimal 10 trade dengan SL/TP baku ke Jurnal.'
      ],
      decisionTree: [
        {
          condition: 'Harga bolak-balik di kotak sempit tanpa membuat puncak baru maupun lembah baru.',
          action: 'Itu pasar **Sideways / Konsolidasi**. Jangan menebak tren di tengah kotak — tunggu harga keluar sweep salah satu ujungnya dulu.'
        },
        {
          condition: 'Baru hari ke-5 latihan Demo tapi sudah ingin langsung deposit akun Real karena merasa sudah paham.',
          action: '**Tahan dulu!** Selesaikan minimal 14 hari + 15 transaksi tercatat di Jurnal agar refleks pasang SL/Lot sudah otomatis tanpa salah tombol.'
        }
      ],
      failedCase: {
        title: 'Melompat ke Uang Besar Sebelum Lulus 14 Hari',
        context: 'Baru baca 1 bab langsung masuk akun Real tanpa tahu cara pasang SL/Limit order dengan cepat.',
        whyFailed: 'Panik saat floating minus sedikit, salah tekan tombol close, dan trauma sebelum benar-benar memahami struktur ICT.'
      }
    },

    'logika-trading-probabilitas': {
      mappingSteps: [
        'Ubah cara menilai hasil dari **1 transaksi** menjadi **blok 20 transaksi** dengan 1 aturan yang sama persis.',
        'Sebelum masuk pasar, tetapkan rasio minimal **1:2 R:R** — artinya 1 kali TP menutup 2 kali SL, sehingga win-rate 45% saja sudah sangat profitabel.',
        'Tulis probabilitas di catatan Jurnal: *"Setup ini tetap bisa kena SL meski 100% sesuai SOP — dan itu biaya operasional normal."*'
      ],
      decisionTree: [
        {
          condition: 'Saya baru saja kena 2 kali SL beruntun padahal sudah sesuai aturan ICT. Apakah strateginya gagal dan harus ganti strategi?',
          action: '**TIDAK.** Dengan win-rate 55%, peluang kena 2–3 SL beruntun adalah wajar secara matematika. Ganti-ganti strategi setiap 2 kali SL justru menjamin gagal jangka panjang.'
        },
        {
          condition: 'Trade barusan menang besar padahal aku melanggar SOP (tanpa SL & entry FOMO). Apakah itu trade yang bagus?',
          action: '**BUKAN!** Itu *Bad Win* — racun paling berbahaya karena memberi hadiah pada kebiasaan buruk yang kelak menghancurkan akun dalam 1 kali salah.'
        }
      ],
      failedCase: {
        title: 'Mencari Win-Rate 95% dengan R:R Terbalik',
        context: 'Mengambil profit cepat $1 (TP 10 pips) tapi membiarkan rugi mengambang -$15 tanpa SL agar "jarang rugi".',
        whyFailed: '9 kali menang (+$9) langsung hancur lebur hanya oleh 1 kali kalah (-$15). Ini jebakan win-rate tinggi tapi ekspektansi negatif.'
      }
    },

    'membaca-candlestick-body-wick': {
      mappingSteps: [
        'Pegang hukum emas ICT: **Body tells the story (cerita arah sejati), Wick does the damage (tugas wick hanya sweep SL)**.',
        'Untuk setiap break level penting (BOS, MSS, atau level PDH/PDL), periksa **di mana BODY ditutup**, bukan seberapa panjang wick yang menusuk.',
        'Gunakan **Consequent Encroachment (titik tengah 50%) dari wick panjang** di H1/Daily sebagai batas reaksi: jika candle berikut menghormati 50% wick, arah penolakan sangat kuat.'
      ],
      decisionTree: [
        {
          condition: 'Sebuah wick panjang menusuk jauh di atas PDH lalu body ditutup kembali di bawah PDH. Apakah tren berubah Bullish?',
          action: '**TIDAK!** Justru sebaliknya: itu tanda **penolakan / Liquidity Sweep** (damage done by wick), bukan konfirmasi breakout naik.'
        },
        {
          condition: 'Body candle tebal ditutup penuh di luar level Swing High, bukan sekadar wick.',
          action: 'Baru sah disebut **energi break nyata (BOS/Displacement)** searah body close tersebut.'
        }
      ],
      failedCase: {
        title: 'Menganggap Wick Panjang Sebagai Break of Structure',
        context: 'Wick M15 menusuk 8 pips di atas High lama lalu ditutup merah panjang di bawah High.',
        whyFailed: 'Trader mengira sudah BOS Bullish dan mencari Buy saat retrace — padahal wick tersebut adalah jebakan sweep BSL sebelum harga terjun.'
      }
    },

    'karakter-xauusd-spread-wita': {
      mappingSteps: [
        'Tandai pembagian jam emas di chart XAU/USD (WITA / UTC+8): **Asia (06:00–14:00)** untuk membentuk range, **London (14:00–17:00)** & **NY AM (19:30–23:00)** untuk eksekusi utama.',
        'Pasang alarm pengingat **Dead Zone Rollover (04:45–06:15 WITA)** agar tidak membuka posisi baru saat spread melebar ekstrem.',
        'Ukur rata-rata gerak harian XAU/USD (ADR ~ $25–$50/hari) agar ekspektasi SL ($2.5–$5) dan TP ($6–$15) realistis terhadap karakter Gold.'
      ],
      decisionTree: [
        {
          condition: 'Jam 10:30 WITA (tengah sesi Asia), Gold bergerak lambat naik turun $3. Apakah layak scalping besar?',
          action: '**SKIP.** Sesi Asia di XAU/USD lebih sering menjadi zona akumulasi/jebakan. Tugasmu di sesi Asia hanya menandai **Asia High** dan **Asia Low** sebagai bahan bakar untuk sesi London/NY.'
        },
        {
          condition: 'Pukul 05:15 WITA aku melihat posisi yang terlihat cantik di M5 tetapi spread tiba-tiba melebar jadi $1.80.',
          action: '**DILARANG ENTRY!** Itu jam Rollover antar-bank harian; spread lebar akan langsung menggerus R:R dan rawan menyambar SL secara artifisial.'
        }
      ],
      failedCase: {
        title: 'Trading Agresif Jam 11 Siang WITA (Sesi Mati)',
        context: 'Masuk 4 kali entry di M5 pada pukul 10:00–12:30 WITA karena bosan menunggu London.',
        whyFailed: 'Kena kocok SL bolak-balik di range sempit sehingga saat sesi London benar-benar memberi setup A+ pukul 14:30 WITA, modal dan mental sudah habis.'
      }
    },

    'struktur-pasar-dasar': {
      mappingSteps: [
        'Buka **H1** terlebih dahulu (jangan M5!). Cari swing yang paling terlihat jelas dari kejauhan (**Major Swing High & Major Swing Low**) — tandai hanya titik yang benar-benar mengubah arah gerak minimal 5–10 candle.',
        'Hubungkan puncak ke puncak dan lembah ke lembah: selama **Higher Low (HL) mayor** belum ditembus oleh **Body Close**, struktur tetap Bullish (begitu pula **Lower High (LH) mayor** untuk Bearish).',
        'Abaikan riak-riak 1–2 candle kecil di dalam satu gelombang besar — itu hanya **sub-struktur internal**, bukan pergantian tren!'
      ],
      decisionTree: [
        {
          condition: 'Di H1 ada banyak puncak dan lembah kecil. Bagaimana tahu mana Swing Mayor (External) dan mana riak kecil (Internal)?',
          action: 'Gunakan **Aturan 3-Candle + Reaksi Nyata**: Swing High valid adalah candle yang diapit minimal 1 candle lebih rendah di kiri dan kanan **DAN** diikuti dorongan turun nyata (atau sweep Liquidity / retrace minimal 30%–50% dari leg sebelumnya).'
        },
        {
          condition: 'Di M5 harga sudah bikin LH-LL turun, tapi di H1 harga baru saja menyentuh HL mayor Bullish. Tren sebenarnya naik atau turun?',
          action: '**Tren sejati tetap NAIK (H1 menang)!** Turunnya M5 hanyalah fase koreksi internal (pullback) menuju zona Discount H1.'
        }
      ],
      failedCase: {
        title: 'Salah Menandai Micro-Pullback Sebagai Perubahan Tren',
        context: 'Di tengah uptrend kuat H1, harga turun 2 candle M5 lalu menembus micro-low kecil; trader mengira tren berbalik Bearish dan pasang Sell.',
        whyFailed: 'Struktur mayor H1 sama sekali belum berubah — HL mayor tetap utuh dan harga langsung meledak naik melanjutkan HH baru.'
      }
    },

    'multi-timeframe-h1-m15-m5': {
      mappingSteps: [
        'Bagi peran 3 timeframe secara kaku (jangan ditukar!): **H1 = Peta Arah & Zona Besar (Bias + HTF POI)**, **M15 = Peta Liquidity & Persiapan (Asia Range, EQH/EQL, M15 POI)**, **M5 = Pelatuk Eksekusi (Sweep + CISD/MSS + Entry)**.',
        'Aturan **Top-Down 100%**: selalu mulai menggambar dari H1 → turun ke M15 → terakhir baru buka M5 saat harga SUDAH tiba di POI H1/M15.',
        'Jika harga belum menyentuh zona pilihan di H1/M15, **dilarang menatap M5** agar tidak tergoda entry acak di tengah jalan.'
      ],
      decisionTree: [
        {
          condition: 'H1 sedang Bullish, tapi M15 sedang Bearish turun menuju Discount H1. Saya harus ikut H1 (Buy) atau ikut M15 (Sell)?',
          action: '**Prioritas utama tetap ikuti H1 (Buy)** dengan menunggu M15 sampai di zona Discount/POI H1 lalu berbalik MSS Bullish (M15 kembali selaras dengan H1 = *MTF Alignment*!). Counter-trend Sell mengikuti M15 hanya opsional untuk trader sangat berpengalaman dengan target pendek di POI H1.'
        },
        {
          condition: 'H1 Bullish, M15 Bullish, M5 baru saja selesai sweep SSL lalu MSS Bullish.',
          action: 'Ini kondisi **Tri-Timeframe Alignment (A+)**. Probabilitas tertinggi untuk eksekusi searah tren!'
        }
      ],
      failedCase: {
        title: 'Sindrom "Terjebak di M1/M5"',
        context: 'Membuka chart langsung di M5, melihat struktur turun rapi, lalu Sell tanpa tahu 2 dolar di bawahnya ada H1 Bullish Order Block raksasa.',
        whyFailed: 'Begitu menyentuh H1 OB, arus institusi H1 langsung sweep habis seluruh struktur Bearish M5 dalam 1 candle hijau besar.'
      }
    },

    'bos-valid-vs-sweep-palsu': {
      mappingSteps: [
        'Tarik garis horizontal tepat di ujung **Swing High** atau **Swing Low** signifikan yang sedang diuji.',
        'Tunggu candle benar-benar **CLOSE**. Periksa apakah yang melewati garis adalah **Body penuh** (kandidat BOS) atau hanya **Wick** (Liquidity Sweep).',
        'Untuk BOS valid: pastikan candle penembus memiliki body tegas (**Displacement**), meninggalkan FVG bila memungkinkan, dan candle berikutnya tidak langsung berbalik masuk kembali ke area lama.'
      ],
      decisionTree: [
        {
          condition: 'Body candle M5 ditutup hanya $0,20 (2 pips) tipis sekali di atas Swing High, lalu candle berikutnya langsung turun besar kembali ke bawah garis.',
          action: 'Itu **Weak Break / Liquidity Sweep**, bukan BOS berkualitas. BOS yang kuat selalu disertai momentum (**Displacement / FVG**) dan bertahan di luar level.'
        },
        {
          condition: 'Wick menembus $4 di atas PDH lalu body ditutup kembali di bawah PDH.',
          action: 'Itu **Liquidity Sweep (breakout palsu)** — hindari BUY breakout dan pantau konfirmasi pembalikan arah turun (**CISD/MSS Bearish**) jika selaras konteks HTF.'
        }
      ],
      failedCase: {
        title: 'Buy Breakout Tepat di Ujung Sweep',
        context: 'Melihat harga menembus High kemarin dengan lonjakan cepat, trader langsung klik Buy tanpa menunggu candle ditutup.',
        whyFailed: 'Candle tutup membentuk sumbu atas panjang di bawah High (sweep BSL). Posisi Buy terbuka tepat di puncak saat harga langsung berbalik turun.'
      }
    },

    'internal-external-dealing-range': {
      extraConceptBlocks: [
        {
          heading: 'Mengapa Memahami Dealing Range Membantu Memperjelas Mapping?',
          paragraphs: [
            'Banyak trader bingung karena memperlakukan seluruh area di chart dengan bobot yang sama. **Dealing Range** memfokuskan analisis hanya antara **1 Swing Low Valid (0%)** dan **1 Swing High Valid (100%)** yang membentuk dorongan BOS terakhir.',
            'Siklus pergerakan ICT berputar di dua fase utama:\n• **ERL → IRL:** Setelah harga menyapu atau menembus batas luar (**External Range Liquidity**), harga cenderung terkoreksi masuk ke dalam range untuk mengisi **Internal Range Liquidity (IRL)** seperti FVG atau Order Block.\n• **IRL → ERL:** Setelah harga bereaksi dari area FVG/OB di dalam range (**IRL**), target tujuan berikutnya (**Draw on Liquidity**) adalah batas luar **ERL** di sisi berlawanan.'
          ]
        }
      ],
      mappingSteps: [
        'Pada H4 atau H1, identifikasi dorongan terakhir yang menghasilkan **BOS valid** (body close menembus swing lama).',
        'Tarik tool Fibonacci (0% – 50% – 100%) dari **Swing Low** sampai **Swing High** terbaru — rentang 0%–100% tersebut adalah **Dealing Range Aktif**.',
        'Tandai garis **50% (Equilibrium)**: di bawah 50% adalah **Discount** (area prioritas BUY), dan di atas 50% adalah **Premium** (area prioritas SELL).',
        'Catat batasnya: **IRL** adalah FVG/OB segar di dalam range untuk area entry; **ERL** adalah batas 100% (Swing High) dan 0% (Swing Low) untuk target Take Profit.'
      ],
      decisionTree: [
        {
          condition: 'Kapan Dealing Range resmi bergeser (harus ditarik ulang)?',
          action: 'Dealing Range bergeser ketika salah satu batas luar (ERL 0% atau 100%) **ditembus oleh Body Close valid (BOS/MSS baru)** dan terbentuk swing baru.'
        },
        {
          condition: 'Harga baru saja memantul dari H1 Bullish FVG (IRL) di zona Discount. Ke mana target logis berikutnya?',
          action: 'Ikuti siklus **IRL → ERL**: tempatkan target pada **Swing High batas atas Dealing Range (ERL 100%)**.'
        },
        {
          condition: 'Harga baru saja menyapu Swing High 100% (ERL) dengan wick lalu mulai turun. Ke mana tujuan koreksinya?',
          action: 'Ikuti siklus **ERL → IRL**: harga berpotensi masuk kembali menuju **FVG/OB segar (IRL)** di zona Discount sebelum memutuskan lanjut naik atau berbalik arah.'
        }
      ],
      failedCase: {
        title: 'Membuka Entry Buy di Zona Premium (72%) Tanpa Mengukur Dealing Range',
        context: 'Tanpa menarik garis 0%–50%–100%, trader membuka Buy di FVG kecil yang berada di posisi 72% (Zona Premium).',
        whyFailed: 'Harga masih berada di area mahal dan terus terkoreksi menuju FVG utama di 30% Discount, sehingga posisi Buy di 72% terkena Stop Loss sebelum harga kembali naik.'
      },
      extraQuiz: [
        {
          question: 'Menurut siklus **IRL ↔ ERL** dalam Dealing Range Bullish, setelah harga memantul dari Bullish FVG H1 di zona Discount (IRL), ke mana target Draw on Liquidity berikutnya?',
          options: [
            'Ke tengah 50% saja lalu berhenti',
            'Menuju ujung atas Dealing Range / Swing High lama (ERL)',
            'Turun terus menembus Swing Low 0%',
            'Tidak bisa diprediksi sama sekali'
          ],
          answerIndex: 1,
          explanation: 'Pasar ICT bergerak dalam siklus IRL ↔ ERL. Setelah mendapatkan pijakan di area IRL (FVG/OB Discount), target berikutnya adalah batas luar ERL (Swing High).'
        },
        {
          question: 'Kapan garis Dealing Range yang digambar di H1 harus ditarik ulang?',
          options: [
            'Setiap 5 menit sekali',
            'Ketika batas luar (ERL) ditembus valid oleh Body Close (BOS/MSS baru) dan terbentuk swing baru',
            'Setiap kali muncul 1 candle Doji di tengah range',
            'Tidak perlu ditarik ulang sepanjang tahun'
          ],
          answerIndex: 1,
          explanation: 'Dealing Range tetap berlaku selama harga masih berada di dalamnya; batasnya baru bergeser setelah terjadi break struktur (BOS/MSS) yang valid.'
        }
      ]
    },

    'bsl-dan-ssl-liquidity': {
      mappingSteps: [
        'Tandai level mingguan dan harian (**PWH/PWL** serta **PDH/PDL**) di `H4`/`H1` untuk melihat area **BSL** (di atas puncak) dan **SSL** (di bawah lembah) utama.',
        'Cari pola sejajar (**EQH** / **EQL**) di dekat level harian, lalu tandai **Asia High** dan **Asia Low** di `M15` menjelang pembukaan Sesi London.',
        'Pisahkan status **FRESH** vs **TAKEN**, tunggu sweep terjadi terlebih dahulu, lalu tunggu konfirmasi **MSS / CISD** sebelum membuka posisi menuju Liquidity Pool Fresh di sisi seberang.'
      ],
      decisionTree: [
        {
          condition: 'Ada dua Liquidity Pool BSL di atas harga: satu adalah puncak kecil M5 dan satu lagi adalah PDH atau EQH di H1. Mana yang lebih dominan?',
          action: '**PDH dan EQH di H1 jauh lebih dominan.** Semakin tinggi timeframe sebuah level likuiditas dan semakin sejajar bentuknya, semakin besar akumulasi Stop Loss yang terkumpul di sana.'
        },
        {
          condition: 'Harga baru saja menyapu SSL di bawah EQL atau Asia Low saat pembukaan Sesi London, lalu memicu MSS/CISD bullish. Apakah SSL itu masih layak dijadikan target SELL?',
          action: '**Tidak.** Status area SSL tersebut sudah berubah menjadi **TAKEN / SWEPT** karena likuiditasnya sudah terambil — alihkan target ke Liquidity Pool **FRESH** di sisi atas (Asia High atau PDH).'
        }
      ],
      failedCase: {
        title: 'Menaruh Stop Loss Rapat Tepat di Bawah EQL (Double Bottom)',
        context: 'Buyer ritel melihat pola Double Bottom sejajar di 2.646,00, langsung entry BUY tanpa menunggu sweep, dan menaruh Stop Loss tipis di 2.644,50.',
        whyFailed: 'EQL menyimpan akumulasi SSL besar. Saat pembukaan Sesi London, harga turun menyapu area Stop Loss tersebut hingga 2.642,80 (Judas Swing) sebelum berbalik naik menuju Asia High dan PDH.'
      }
    },

    'level-likuiditas-kunci-xauusd': {
      mappingSteps: [
        'Cek **Origin** terbaru terlebih dahulu: apakah harga baru saja menyapu `Asia High/Low`, `PDH/PDL`, atau memantul dari `FVG`/`OB` di `H1`/`H4`?',
        'Cocokkan arah pantulan Origin tersebut dengan tren `H4`/`H1`, lalu pisahkan target yang masih **Fresh** menjadi **DOL 1 (`TP1`)** dan **DOL 2 (`TP2`)**.',
        'Jika harga masih berada di tengah range tanpa sweep Origin, terapkan **Wait for First Sweep** dan pasang batas invalidasi pada `body close` melewati ujung Origin.'
      ],
      decisionTree: [
        {
          condition: 'Antara Asia High (Fresh) dan PDH (Fresh) pada hari Bullish setelah Asia Low disapu, mana yang ditetapkan sebagai DOL 1 dan DOL 2?',
          action: '**Asia High ditetapkan sebagai DOL 1 (`TP1`)** karena merupakan Liquidity Pool Fresh terdekat, lalu **PDH menjadi DOL 2 (`TP2`)** sebagai target harian utama.'
        },
        {
          condition: 'PDH sudah disapu pagi tadi di Sesi London dengan wick panjang. Apakah PDH masih layak dijadikan target DOL Buy di Sesi New York?',
          action: '**Tidak.** Status PDH sudah berubah menjadi **TAKEN / SWEPT** sekaligus berpotensi menjadi Origin sweep atas—alihkan fokus ke Liquidity Pool **Fresh** berikutnya (misalnya `PWH` jika tren lanjut, atau `London Low`/`PDL` jika muncul pembalikan).'
        }
      ],
      failedCase: {
        title: 'Menargetkan Level yang Sudah Berstatus TAKEN sebagai DOL Baru',
        context: 'PDH sudah disapu pukul 15:00 WITA lalu harga ditutup kembali di bawahnya, tetapi pukul 20:00 WITA trader tetap membuka BUY dengan target ke PDH yang sama.',
        whyFailed: 'Likuiditas di atas PDH sudah terambil (TAKEN) pada Sesi London—Sesi New York justru berbalik membidik SSL/London Low yang masih Fresh di sisi bawah.'
      }
    },

    'inducement-idm-umpan-ritel': {
      extraConceptBlocks: [
        {
          heading: 'Cara Praktis Membaca Reaksi 1–3 Candle Setelah Level Likuiditas Ditembus',
          paragraphs: [
            'Kebingungan terbesar saat `PDH/PDL` atau `Asia High/Low` ditembus adalah memutuskan apakah itu **Liquidity Sweep (*Purge & Revert*)** atau **Liquidity Run (*Expansion*)**. Aturan dasarnya sederhana: jangan pernah mengambil keputusan di detik candle masih menembus garis.',
            'Tunggu penutupan candle `M15`/`H1` lalu amati 1–3 candle `M5` berikutnya. Jika harga kembali masuk range disertai **Displacement berlawanan + `FVG` + `MSS` / `CISD`** (terutama saat melawan HTF Bias di awal Sesi London/NY), maka itu **Liquidity Sweep** yang valid. Jika candle menutup *body* solid di luar level dan terus melaju menuju target `DOL` lebih jauh, itu **Liquidity Run**—jangan dilawan.'
          ]
        }
      ],
      mappingSteps: [
        'Tentukan peran setiap level sebelum tersentuh: sisi melawan HTF Bias = kandidat **Liquidity Sweep**; sisi searah menuju `DOL` lebih jauh = kandidat **Liquidity Run**.',
        'Saat harga menembus level, baca penutupan candle `M15`/`H1` (*wick rejection* kembali ke dalam range vs *body close* penuh di luar level).',
        'Konfirmasi lewat reaksi 1–3 candle berikutnya di `M5`: pastikan muncul **Displacement balik + `MSS` / `CISD`** sebelum membuka posisi pembalikan arah.'
      ],
      decisionTree: [
        {
          condition: 'Harga menyapu Asia Low saat Daily/H1 Bullish dan menyentuh H1 Discount FVG, lalu M5 mencetak Displacement naik + MSS/CISD.',
          action: '**Liquidity Sweep (*Purge & Revert*) terkonfirmasi.** Valid menyusun peluang BUY menuju Asia High dan PDH.'
        },
        {
          condition: 'Daily/H1 Bullish menuju PDH yang masih $15 di atas; harga baru saja menembus Asia High dengan Body Close penuh tanpa penolakan sumbu.',
          action: '**Liquidity Run (*Expansion*).** Hindari SELL melawan arah hanya karena Asia High disentuh—jadikan Asia High sebagai TP1 atau tunggu pullback searah tren.'
        }
      ],
      failedCase: {
        title: 'Melawan Liquidity Run Karena Mengira Setiap BSL Pasti Berbalik',
        context: 'Pada hari Bullish menuju PDH 2.670 (setelah Asia Low sudah disapu), trader langsung SELL saat Asia High 2.654 ditembus body penuh M15 tanpa ada MSS/CISD turun.',
        whyFailed: 'Penembusan searah HTF Bias menuju target PDH yang lebih jauh adalah Liquidity Run, bukan Sweep—posisi SELL melawan arah langsung tersapu menuju PDH.'
      },
      extraQuiz: [
        {
          question: 'Pada hari Daily & H1 Bullish dengan target di `PDH 2.670`, pembukaan London menyapu `Asia Low 2.646` lalu M5 mencetak Displacement naik + CISD. Satu jam kemudian `Asia High 2.654` ditembus oleh Body Close M15 penuh. Apa perbedaan kedua kejadian tersebut?',
          options: [
            'Keduanya sama-sama sinyal wajib SELL',
            'Penembusan `Asia Low 2.646` adalah **Liquidity Sweep (*Purge & Revert*)**, sedangkan penembusan `Asia High 2.654` searah menuju PDH adalah **Liquidity Run (*Expansion*)**',
            'Penembusan `Asia Low` adalah tren turun permanen, sedangkan `Asia High` adalah konsolidasi Asia',
            'Keduanya harus diabaikan karena terjadi di dalam Sesi London'
          ],
          answerIndex: 1,
          explanation: 'Menyapu sisi berlawanan Bias di awal sesi (Asia Low) = Liquidity Sweep; menembus sisi searah Bias menuju target lebih tinggi (Asia High → PDH) = Liquidity Run.'
        }
      ]
    },

    'displacement-jejak-institusi': {
      mappingSteps: [
        'Periksa 3 bukti visual pada dorongan harga: (1) **Body candle dominan** (`≥ 65%` dari total tinggi candle dengan wick kecil), (2) **Meninggalkan celah FVG yang jelas**, (3) **Memecahkan level struktur (`BOS`/`MSS`/`CISD`) dengan tegas**.',
        'Bandingkan ukuran candle Displacement dengan rata-rata 5 candle konsolidasi sebelumnya: Displacement yang sah minimal **1,5× hingga 2× lebih besar**.',
        'Tandai FVG atau Order Block yang lahir dari dorongan Displacement tersebut sebagai zona tunggu (**POI**), dan lewati pergerakan merayap yang tidak meninggalkan FVG.'
      ],
      decisionTree: [
        {
          condition: 'Harga menembus Swing High melalui 6 candle kecil yang merayap tanpa meninggalkan FVG. Apakah itu Displacement?',
          action: '**Bukan.** Pergerakan merayap (*grinding*) menunjukkan lemahnya partisipasi institusi. FVG atau Order Block yang ditarik dari dorongan seperti ini sangat mudah ditembus — sebaiknya dilewati (*skip*).'
        },
        {
          condition: 'Muncul 1 candle lonjakan +$18 tepat pada detik rilis berita High Impact US CPI. Apakah boleh langsung diperlakukan sebagai Displacement normal?',
          action: '**Tunggu terlebih dahulu.** Lonjakan detik rilis berita sangat rawan *whipsaw* dan *spread spike*. Patuhi Protokol News Lock (+30 menit pasca-berita) hingga spread normal dan struktur M5 kembali rapi sebelum menilai FVG baru.'
        }
      ],
      failedCase: {
        title: 'Menganggap Pergerakan Merayap Sebagai Displacement',
        context: 'Harga naik perlahan dengan 5 candle kecil menembus micro-high tanpa FVG, lalu trader menandai Order Block di bawahnya untuk Buy.',
        whyFailed: 'Tidak ada bukti Displacement institusi — saat tekanan jual kembali masuk, zona tersebut ditembus tanpa reaksi pantulan yang berarti.'
      }
    },

    'fvg-bisi-sibi-ce-50': {
      extraConceptBlocks: [
        {
          heading: 'Cara Memilih Jika Muncul 2–3 FVG Bertumpuk dalam Satu Dorongan',
          paragraphs: [
            'Di XAU/USD, satu kaki Displacement sering meninggalkan **2 sampai 3 kotak FVG sekaligus** (atas, tengah, dan bawah). Gunakan **3 saringan jenis Gap ICT** berikut agar pemilihan tetap objektif:\n1. **Breakaway Gap (FVG paling awal dekat asal breakout):** Sering **tidak terisi penuh** karena momentum sangat kuat — jangan memaksakan koreksi terlalu dalam bila struktur sudah bergerak menjauh.\n2. **Measuring / Runaway Gap (FVG di tengah dorongan, dekat batas 50%–62%):** Area ideal untuk *retracement entry* selama berada di sisi Discount (Buy) atau Premium (Sell).\n3. **Exhaustion Gap (FVG paling ujung yang terlalu dekat dengan target DOL):** **Lewati (*skip*)** — ruang ekspansi hampir habis dan celah ini rawan ditembus balik.\n\nJika terdapat 2 FVG di dalam zona Discount (untuk Buy), prioritaskan **FVG yang memiliki konfluensi (tumpang tindih dengan Order Block / OTE 62%–79% / berada dekat SSL segar)** atau amati reaksi penolakan M5 saat harga menguji kotak pertama.'
          ]
        }
      ],
      mappingSteps: [
        'Temukan 3 candle berurutan dalam dorongan Displacement: **Candle 1, Candle 2 (batang dominan), dan Candle 3**.',
        'Untuk **Bullish FVG (BISI)**: tarik kotak dari **High wick Candle 1** sampai **Low wick Candle 3**. Untuk **Bearish FVG (SIBI)**: dari **Low wick Candle 1** sampai **High wick Candle 3**.',
        'Tarik garis tengah tepat pada **50% Consequent Encroachment (CE)**.',
        'Pastikan lebar celah FVG di XAU/USD minimal **$0,80 – $1,00** (abaikan celah mikro tipis $0,10 yang sekadar kebisingan).'
      ],
      decisionTree: [
        {
          condition: 'Ada 3 Bullish FVG bertumpuk dari bawah (2.640) sampai atas (2.656), garis 50% Dealing Range ada di 2.648. Mana yang dipilih?',
          action: 'Lewati FVG di atas 2.648 karena berada di zona mahal (Premium). Fokus hanya pada FVG di **bawah 2.648 (Discount)** — jika ada dua kotak di Discount, pilih yang berkonfluensi dengan **OTE (62%–79%)** atau Order Block.'
        },
        {
          condition: 'Wick candle M5 menembus sedikit di bawah garis 50% CE hingga mendekati dasar FVG, tetapi **Body Close kembali di atas 50% CE**. Valid atau gagal?',
          action: '**Masih valid kuat.** Aturan 50% CE ICT menilai penutupan badan candle: *wick boleh menyentuh atau sedikit melewati CE, sedangkan pembatalan hanya terjadi jika Body Close menembus penuh melewati garis CE atau keluar sisi belakang kotak*.'
        }
      ],
      failedCase: {
        title: 'Entry di Exhaustion FVG (Area 90% Premium)',
        context: 'XAU/USD sudah naik +$18 mendekati PDH lalu mencetak 1 FVG baru tepat $2 di bawah PDH; trader memasang Buy Limit di FVG tersebut.',
        whyFailed: 'Celah tersebut adalah **Exhaustion Gap** di ujung Premium, bukan area akumulasi Buy baru. Harga menyapu PDH lalu langsung menembus balik FVG tersebut dalam 2 candle.'
      },
      extraQuiz: [
        {
          question: 'Dalam satu kaki kenaikan XAU/USD terdapat 3 Bullish FVG: FVG A di 85% Premium, FVG B di 58% Premium, dan FVG C di 32% Discount (bertepatan dengan zona OTE). Mana FVG prioritas utama untuk Buy?',
          options: [
            'FVG A di 85% karena paling dekat dengan harga sekarang',
            'FVG C di 32% Discount karena berada di area beli murah dengan konfluensi OTE',
            'Pasang Buy serentak di ketiga FVG dengan lot penuh',
            'Semua FVG tidak boleh dipakai'
          ],
          answerIndex: 1,
          explanation: 'Prinsip Premium/Discount menyaring FVG di zona mahal (Premium) dan memfokuskan Buy pada FVG segar di zona Discount yang berkonfluensi dengan OTE.'
        },
        {
          question: 'Saat harga retracement masuk ke Bullish FVG (2.644–2.648, CE 50% di 2.646), wick bawah menyentuh 2.644,80 tetapi Body Close candle M5 ditutup kuat di 2.647,20. Bagaimana status FVG tersebut?',
          options: [
            'Batal total karena wick menyentuh di bawah 2.646',
            'Tetap **valid kuat** karena aturan Consequent Encroachment menilai **Body Close** yang menghormati garis 50% CE',
            'Langsung berubah menjadi Bearish Inversion FVG (iFVG)',
            'Harus langsung entry Sell'
          ],
          answerIndex: 1,
          explanation: 'Dalam aturan 50% CE ICT, wick diperbolehkan menyentuh bagian dalam kotak selama Body Close tetap menghormati garis 50% CE.'
        }
      ]
    },

    'order-block-valid-mean-threshold': {
      extraConceptBlocks: [
        {
          heading: 'Cara Membedakan High-Probability OB vs Trap OB',
          paragraphs: [
            'Alasan paling umum trader kecewa dengan Order Block adalah menandai **setiap** candle bearish terakhir sebelum kenaikan sebagai Order Block. Dalam ICT, hanya **High-Probability Order Block (HP-OB)** yang layak digunakan — wajib memenuhi 3 syarat sekaligus:\n1. **Lahir tepat setelah Liquidity Sweep** (candle OB itu sendiri atau rangkaiannya menyapu SSL/BSL lama) atau di dalam POI HTF.\n2. **Langsung diikuti Displacement yang meninggalkan FVG** serta mematahkan struktur (`BOS`/`MSS`).\n3. **Berada di lokasi yang tepat** (Discount untuk Bullish OB, Premium untuk Bearish OB).\n\nTanpa syarat pertama dan kedua, zona tersebut hanyalah **Trap OB** yang mudah ditembus.'
          ]
        }
      ],
      mappingSteps: [
        'Cari titik pembalikan yang baru saja melakukan **Liquidity Sweep** lalu langsung diikuti **Displacement + FVG**.',
        'Untuk **Bullish OB**: tandai **seluruh rangkaian candle bearish berurutan terakhir** (dari Open candle pertama rangkaian hingga Low) tepat sebelum dorongan naik dimulai — bukan hanya 1 candle jika ada 2–3 candle turun beruntun membentuk 1 blok.',
        'Tarik 2 garis penting pada OB: garis **Open (tepi masuk utama)** dan garis **50% Mean Threshold (titik tengah body OB)**.',
        'Aturan validitas OB: **Body Close candle tidak boleh ditutup menembus melewati 50% Mean Threshold**.'
      ],
      decisionTree: [
        {
          condition: 'Ada 3 candle bearish berurutan sebelum harga naik tajam dengan Displacement. Apakah OB hanya candle bearish paling terakhir atau ketiganya?',
          action: 'Dalam ICT, **rangkaian candle berlawanan yang berurutan (*consecutive down-close candles*)** dihitung sebagai **satu kesatuan Order Block** (batas Open diambil dari candle bearish pertama rangkaian itu, Low di titik terbawah). Jika body-nya lebar, gunakan garis 50% Mean Threshold untuk memperketat SL.'
        },
        {
          condition: 'Harga menyentuh tepi Open OB lalu langsung memantul naik tanpa pernah mencapai 50% Mean Threshold. Apakah itu wajar?',
          action: '**Sangat wajar.** Pada tren kuat XAU/USD, harga sering hanya menyentuh tepi Open OB lalu segera melanjutkan ekspansi. Karena itu, saat body OB ringkas entry utama ditempatkan di **Open OB**, sementara 50% MT berfungsi sebagai batas ukur validitas.'
        }
      ],
      failedCase: {
        title: 'Menggunakan Trap OB di Tengah Tren Tanpa Sweep & Tanpa FVG',
        context: 'Trader menggambar kotak pada 1 candle bearish acak di tengah konsolidasi tanpa adanya FVG maupun sweep Liquidity.',
        whyFailed: 'Tidak ada bukti akumulasi institusi pada candle tersebut — ketika harga turun, kotak tersebut ditembus mulus tanpa penolakan.'
      },
      extraQuiz: [
        {
          question: 'Tiga syarat mutlak yang membedakan **High-Probability Order Block** dari **Trap OB** adalah...',
          options: [
            'Candle paling kecil, di sesi Asia, tanpa FVG',
            'Didahului Liquidity Sweep, diikuti Displacement yang meninggalkan FVG + pematahan struktur, dan berada di lokasi Discount/Premium',
            'Berwarna sama dengan 10 candle sebelumnya',
            'Muncul tepat di tengah garis 50% Equilibrium tanpa sweep'
          ],
          answerIndex: 1,
          explanation: 'High-Probability OB selalu memiliki bukti institusional lengkap: Sweep Liquidity, Displacement + FVG, pematahan struktur, dan lokasi Discount/Premium.'
        }
      ]
    },

    'cisd-vs-mss-sinyal-awal': {
      mappingSteps: [
        'Tunggu harga masuk ke **POI HTF** atau menyelesaikan **Liquidity Sweep** terlebih dahulu — jangan mencari CISD di ruang kosong.',
        'Untuk **Bullish CISD**: tandai **Harga Open candle bearish pertama** pada rangkaian candle turun terakhir yang menyapu Liquidity. Saat 1 candle bullish menutup **Body Close di atas garis Open tersebut**, Bullish CISD sah aktif.',
        'Untuk **MSS**: tandai **Swing High internal** sebelumnya; begitu candle menutup Body Close di atas Swing High dengan Displacement dan FVG, Bullish MSS terkonfirmasi penuh (validasi struktur lebih kuat daripada CISD).'
      ],
      decisionTree: [
        {
          condition: 'CISD sudah muncul lebih cepat, tetapi Swing High untuk MSS masih jauh $6 di atas. Masuk setelah CISD atau tunggu MSS?',
          action: 'Jika **seluruh konteks HTF mendukung** (Sweep `PDH/PDL` atau POI HTF + dalam Killzone + terbentuk FVG baru pasca-CISD), **CISD sudah memadai untuk entry awal dengan R:R besar**. Jika konteks kurang meyakinkan atau *counter-trend*, wajib tunggu **MSS penuh**.'
        },
        {
          condition: 'Candle hanya menembus garis Open candle bearish pertama dengan wick lalu ditutup kembali di bawahnya. Apakah CISD sudah sah?',
          action: '**Belum sah.** CISD wajib dikonfirmasi oleh **Body Close penuh** melewati garis Open rangkaian candle lawan tersebut.'
        }
      ],
      failedCase: {
        title: 'Mencari CISD di Ruang Kosong Tanpa Sweep atau POI',
        context: 'Setiap kali 1 candle bullish menutup di atas 1 candle bearish pada M5, trader menyebutnya CISD lalu langsung membuka Buy.',
        whyFailed: 'CISD hanya valid bila terjadi **setelah harga menyentuh PD Array HTF atau menyapu level Liquidity**. Di ruang kosong tanpa konteks, penutupan tersebut hanyalah fluktuasi candle biasa.'
      }
    },

    'premium-discount-equilibrium': {
      mappingSteps: [
        'Tarik Fibonacci pada gelombang Dealing Range impulsif terakhir: untuk **BUY** tarik dari Swing Low (`1`) ke Swing High (`0`), untuk **SELL** tarik dari Swing High (`1`) ke Swing Low (`0`).',
        'Aktifkan 6 level utama saja agar grafik tetap bersih: `0`, `0.5` (Equilibrium), `0.618`, `0.705` (Titik Tengah OTE), `0.786`, dan `1` (Invalidation).',
        'Jaga disiplin lokasi: **hanya cari Buy di zona Discount (`< 50%`, terbaik pada OTE `61,8%–78,6%`)**, dan **hanya cari Sell di zona Premium (`> 50%`, terbaik pada OTE `61,8%–78,6%`)**.'
      ],
      decisionTree: [
        {
          condition: 'Ada setup Sweep + MSS + FVG yang rapi, tetapi posisinya tepat di garis 50% Equilibrium (belum masuk di bawah 50% Discount). Apakah layak Buy?',
          action: 'Tunggu minimal harga masuk sedikit ke bawah **50% Discount** atau periksa apakah terdapat FVG lain di zona OTE `61,8%–78,6%`. Hindari membuka Buy pada harga mahal di atas `55%–60%`.'
        },
        {
          condition: 'Harga sudah masuk ke zona OTE 70,5% Discount, tetapi tidak ada FVG maupun Order Block sama sekali di sana. Apakah boleh pasang Buy Limit?',
          action: '**Tidak disarankan.** OTE (`61,8%–78,6%`) adalah filter lokasi, bukan pemicu entry tunggal. Wajib ada **PD Array valid (FVG/OB/Breaker)** atau konfirmasi MSS M5 di dalam zona OTE tersebut.'
        }
      ],
      failedCase: {
        title: 'Membeli di Area 80% Premium Karena FOMO',
        context: 'Melihat tren naik cepat, trader membuka Buy tepat di area 82% Premium karena khawatir tertinggal pergerakan.',
        whyFailed: 'Koreksi wajar pasar menuju zona OTE 70,5% langsung menyentuh Stop Loss-nya sebelum harga melanjutkan tren naik.'
      }
    },

    'model-sweep-mss-fvg': {
      mappingSteps: [
        'Tandai level Liquidity kunci (Asia High/Low, London High/Low, PDH/PDL, atau Swing H1) di dalam Killzone (WITA/WIB) dan pastikan di luar jadwal News Lock.',
        'Tunggu harga melakukan **Liquidity Sweep** nyata pada level tersebut atau menyentuh POI HTF.',
        'Tunggu **Displacement + MSS/CISD** berlawanan arah di M5 yang meninggalkan **FVG segar**.',
        'Pasang **Limit Order** pada tepi FVG, `50% CE`, atau `Open OB` di sisi Discount/Premium, SL di balik ujung sweep (+ buffer spread), TP1 minimal `1 : 2`, dan TP2 di target DOL utama.'
      ],
      decisionTree: [
        {
          condition: 'Sweep dan MSS sudah terjadi, tetapi dorongannya tidak meninggalkan FVG sama sekali. Apakah tetap masuk?',
          action: '**Lewati.** Tanpa FVG (Imbalance), belum ada bukti Displacement yang cukup kuat. Tunggu terbentuknya FVG segar atau cari peluang di sesi berikutnya.'
        },
        {
          condition: 'FVG sudah terbentuk rapi pasca-MSS, tetapi harga langsung bergerak menyentuh target TP1/DOL tanpa pernah terkoreksi menjemput Limit Order Anda.',
          action: '**Segera batalkan (`Cancel`) Limit Order.** Jangan mengejar harga yang sudah mendekati target — membatalkan order saat DOL sudah tercapai adalah disiplin wajib Model ICT 2022.'
        }
      ],
      failedCase: {
        title: 'Mengabaikan Tahap 1 (Mencari FVG Tanpa Sweep Liquidity)',
        context: 'Melihat MSS dan FVG kecil di tengah range tanpa ada Liquidity Pool atau POI HTF yang disentuh sebelumnya.',
        whyFailed: 'Tanpa Liquidity Sweep di tahap pertama, tidak ada pengambilan likuiditas yang memadai untuk mendorong ekspansi lanjutan — FVG mudah ditembus begitu sesi utama berjalan.'
      }
    },

    'model-order-block-sniper': {
      mappingSteps: [
        'Konfirmasi dulu **Bias H1** dan lokasi **Discount/Premium**.',
        'Pastikan **High-Probability OB** sweep Liquidity + melahirkan FVG + memecahkan struktur.',
        'Pasang rencana entry di **Open OB** (konservatif) atau **50% Mean Threshold** (sniper R:R tinggi), SL tepat di balik ujung wick OB + napas spread $0.40–$0.60.'
      ],
      decisionTree: [
        {
          condition: 'Antara FVG dan OB yang berada di satu leg, mana yang di-entry duluan?',
          action: 'Jika FVG berada tepat di depan OB, harga sering bereaksi dulu di FVG lalu baru menusuk Open OB. Cara paling aman: **split risiko** atau tunggu konfirmasi candle penolakan M5 di area pertemuan FVG + Open OB.'
        },
        {
          condition: 'Order Block H1/M15 yang kucari ternyata sudah pernah disentuh 2 kali sebelumnya. Masih sekuat OB fresh?',
          action: '**Sudah melemah!** Setiap sentuhan menyerap order institusi di dalam OB. Prioritaskan **OB Fresh (sentuhan pertama)**; jika sudah disentuh berkali-kali, waspada justru menjadi bahan bakar untuk dijebol.'
        }
      ],
      failedCase: {
        title: 'Terlalu Serakah Menunggu 50% Mean Threshold Padahal Open OB Sudah Menolak Keras',
        context: 'Memasang Limit tepat di 50% MT padahal harga sudah menyentuh Open OB dan membentuk engulfing bullish, lalu mengejar entry terlambat $8 di atas.',
        whyFailed: 'Akibat FOMO mengejar setelah ketinggalan, SL menjadi super lebar dan harga retrace kecil langsung sweep SL.'
      }
    },

    'model-ifvg-inversion': {
      mappingSteps: [
        'Tunggu harga menyelesaikan **HTF Liquidity Sweep** (misalnya sweep `PDH/PDL` atau `Asia High/Low`) atau menyentuh POI HTF di dalam Killzone.',
        'Tandai FVG lawan terakhir yang mengantar harga menuju titik sweep tersebut (misalnya Bullish FVG terakhir saat harga naik menyapu PDH).',
        'Begitu 1 candle M5 menutup **Body Close penuh menembus keluar sisi belakang kotak FVG tersebut**, zona itu resmi berubah kutub menjadi **Inversion FVG (`iFVG`)**.',
        'Cari entry saat retest singkat ke sisi luar kotak iFVG (atau garis `50% CE`) dengan SL struktural di balik ujung ekstrem sweep.'
      ],
      decisionTree: [
        {
          condition: 'FVG lawan baru ditembus oleh wick panjang saja, sementara Body Close masih ditutup di dalam kotak FVG. Apakah sudah sah menjadi iFVG?',
          action: '**Belum sah.** Syarat mutlak perubahan kutub iFVG adalah **Body Close penuh melewati seluruh kotak FVG** — bukan sekadar tusukan wick.'
        },
        {
          condition: 'Ada 2 FVG lawan yang tertembus sekaligus pasca-sweep PDH. iFVG mana yang sebaiknya diprioritaskan?',
          action: 'Gunakan **iFVG pertama yang paling dekat dengan titik sweep** (selama R:R menuju target DOL masih ≥ `1 : 2`), karena pada momentum balik cepat harga sering hanya melakukan retest tipis ke tepi iFVG terdekat sebelum melanjutkan penurunan.'
        }
      ],
      failedCase: {
        title: 'Menggunakan iFVG di Tengah Range Tanpa Sweep Liquidity',
        context: 'Di pasar sideways sesi Asia, FVG kecil ditembus bolak-balik lalu trader menyebutnya iFVG dan langsung membuka posisi.',
        whyFailed: 'iFVG adalah sinyal perpindahan arus order yang wajib didahului Liquidity Sweep signifikan atau sentuhan POI HTF. Di tengah pasar sideways, kotak FVG sering ditembus bolak-balik tanpa komitmen arah.'
      }
    },

    'model-turtle-soup-smr': {
      mappingSteps: [
        'Tandai level ekstrem utama yang menjadi target: **PDH/PDL, PWH/PWL, atau London/Asia High-Low** yang berhimpitan dengan POI H1/H4 di jam Killzone (WITA/WIB).',
        'Tunggu harga menembus level tersebut lalu **segera ditolak kembali** membentuk *Absorption Wick* dan menutup body di dalam range lama.',
        'Konfirmasi dengan **CISD M5** (atau irisan **iFVG/Unicorn** bila struktur mendukung) sebelum membuka posisi — hindari masuk melawan candle impulsif yang masih bergerak kuat.',
        'Terapkan batas maksimal **1 percobaan (*One Attempt Rule*)** per level ekstrem.'
      ],
      decisionTree: [
        {
          condition: 'Harga menembus PDL lalu 3 candle M5 berturut-turut menutup body bearish tebal di bawah PDL. Apakah masih valid untuk Turtle Soup Buy?',
          action: '**Batal.** Penutupan body tegas di luar level menandakan ekspansi lanjutan, bukan Turtle Soup. Turtle Soup mensyaratkan penolakan cepat kembali masuk ke dalam range.'
        },
        {
          condition: 'Turtle Soup sudah menunjukkan sweep dan tutup kembali ke dalam range, tetapi berlawanan dengan tren utama H1.',
          action: 'Perkecil target profit (**ambil TP1 konservatif di IRL atau Equilibrium 50%**) atau pastikan ada konfluensi **SMT Divergence** agar tidak terseret kelanjutan tren H1.'
        }
      ],
      failedCase: {
        title: 'Melawan Candle Ekspansi Saat Rilis Berita Besar',
        context: 'Saat rilis NFP, harga turun menembus PDL -$15 dalam 2 menit lalu trader langsung membuka Buy dengan asumsi Turtle Soup.',
        whyFailed: 'Tanpa penutupan balik ke dalam range dan dilakukan di tengah rilis berita berdampak tinggi, harga melanjutkan penurunan -$25 menembus Stop Loss.'
      }
    },

    'memilih-1-model-dan-filter-gagal': {
      mappingSteps: [
        'Tetapkan **1 Model Utama** (rekomendasi terbaik untuk sebagian besar trader: **Model ICT 2022: Sweep → MSS → FVG**) untuk 30–50 transaksi pertama.',
        'Periksa **5 Bendera Merah Auto-Skip**: (1) tengah range `40%–60%` tanpa sweep, (2) berhadapan langsung dengan POI H1/H4 lawan, (3) dalam jendela News Lock, (4) R:R `< 1 : 1,8`, (5) batas rugi harian `2× SL` sudah tercapai.',
        'Jalankan **Checklist 30 Detik (`5× Ya`)** sebelum mengirim order; apabila **satu saja** bendera merah aktif, batalkan setup dan catat "No Setup" di jurnal.'
      ],
      decisionTree: [
        {
          condition: 'Model utama tidak muncul seharian, tetapi variasi model lain terlihat di M5. Sebaiknya diambil atau dilewatkan?',
          action: '**Lewatkan.** Disiplin menjalankan 1 model selama 30–50 transaksi menjaga kemurnian data *Win Rate* dan *Expectancy* pada jurnal evaluasi.'
        },
        {
          condition: 'Dari 5 poin Checklist 30 Detik, 4 poin terpenuhi tetapi 1 poin gagal (berita CPI 10 menit lagi). Apakah boleh masuk dengan lot kecil?',
          action: '**Tidak boleh.** Aturan filter gagal bersifat mutlak — satu syarat yang gagal cukup untuk membatalkan setup sepenuhnya.'
        }
      ],
      failedCase: {
        title: 'System Hopping (Berpindah Model Setiap Sesi)',
        context: 'Pagi memakai Turtle Soup, siang memakai Order Block, malam beralih ke iFVG setelah mengalami 2 kali Stop Loss.',
        whyFailed: 'Tidak ada satu pun model yang memiliki sampel statistik memadai sehingga hasil evaluasi di jurnal tidak terukur.'
      }
    },

    'siklus-amd-judas-swing': {
      mappingSteps: [
        'Tandai garis horizontal **NY Midnight Open (`00:00 NY` = `12:00 WITA` / `11:00 WIB` EDT atau `13:00 WITA` / `12:00 WIB` EST)** sebagai patokan harian Power of Three.',
        'Amati **Fase A (*Accumulation*)** di Sesi Asia (`Asia High` & `Asia Low`) yang bergerak menyamping dalam rentang sempit.',
        'Waspadai **Fase M (*Manipulation / Judas Swing*)** di pembukaan Sesi London (`14:00–15:30 WITA`) atau awal NY (`19:30–20:30 WITA`) yang bergerak berlawanan arah Bias untuk menyapu satu sisi Asia Range.',
        'Eksekusi pada transisi **Fase M → Fase D (*Distribution*)** setelah sweep selesai dan terkonfirmasi **`MSS` / `CISD`** searah Daily Bias.'
      ],
      decisionTree: [
        {
          condition: 'Daily Bias Bullish, lalu pukul 14:15 WITA (13:15 WIB) saat pembukaan London harga turun ke bawah Midnight Open menyapu Asia Low. Haruskah langsung berubah jadi Bearish?',
          action: '**Tidak — justru inilah fase Judas Swing yang ditunggu.** Selama Garis Invalidasi `H1` tidak ditembus *body close*, penurunan di bawah Midnight Open dan `Asia Low` adalah area pengamatan untuk mencari konfirmasi `MSS`/`CISD` naik.'
        },
        {
          condition: 'Sesi Asia sudah bergerak lebar +$20 satu arah tanpa konsolidasi. Apakah pola AMD klasik tetap dipaksakan di Sesi London?',
          action: '**Waspada.** Jika Sesi Asia sudah berekspansi terlalu lebar, Sesi London sering berubah menjadi konsolidasi atau koreksi dalam. Tunggu Sesi New York atau konfirmasi struktur yang lebih jelas.'
        }
      ],
      failedCase: {
        title: 'Mengejar Gerakan Pertama Pembukaan London (Korban Judas Swing)',
        context: 'Pada hari Bullish pukul 14:10 WITA, harga turun menembus Asia Low lalu trader langsung membuka SELL mengejar momentum.',
        whyFailed: 'Pukul 14:40 WITA harga langsung berbalik naik melewati Midnight Open menuju PDH — penurunan pukul 14:10 tersebut adalah Judas Swing klasik untuk mengambil SSL.'
      }
    },

    'jadwal-killzone-wita-silver-bullet': {
      mappingSteps: [
        'Tandai jendela waktu vertikal permanen di grafik: **London Killzone (`14:00–17:00 WITA` / `13:00–16:00 WIB` EDT)** dan **NY AM Killzone (`19:00–22:00` ext `23:00 WITA` EDT)**; geser `+1 jam` saat Musim Dingin (`EST`).',
        'Tandai jendela fokus **NY AM Silver Bullet (`22:00–23:00 WITA` / `21:00–22:00 WIB` EDT)** bersama Macro `21:50–22:10 WITA` untuk mencari 1 dorongan bersih pasca sweep likuiditas.',
        'Di luar jam Killzone pilihan Anda, tutup grafik eksekusi dan gunakan waktu hanya untuk jurnal atau evaluasi.'
      ],
      decisionTree: [
        {
          condition: 'Pada jendela Silver Bullet (`22:00–23:00 WITA` EDT), harga sudah bergerak lebar sejak pukul `20:00 WITA` dan telah mencapai target PDH. Tetap cari entry Silver Bullet?',
          action: '**Skip.** Silver Bullet membutuhkan ruang gerak tersisa (minimal `$10–$15` menuju target DOL yang masih Fresh). Jika target harian sudah tercapai lebih awal, pasar jam 22:00 cenderung melambat atau berkonsolidasi.'
        },
        {
          condition: 'Pukul `18:15 WITA` (`17:15 WIB` EDT, jeda London Lunch) muncul pola FVG yang tampak rapi. Masuk sekarang atau tunggu Sesi NY AM?',
          action: '**Tunggu Sesi NY AM (`19:00+ WITA`).** Pola yang terbentuk pada jam sepi (*Dead Zone*) sangat sering disapu lebih dulu begitu likuiditas New York masuk.'
        }
      ],
      failedCase: {
        title: 'Trading di Jeda NY Lunch (00:00–01:30 WITA / 23:00–00:30 WIB EDT)',
        context: 'Mencari entry baru pada jam makan siang New York (`12:00–13:30 NY`) saat volume institusi menipis.',
        whyFailed: 'Harga bergerak bolak-balik menyapu High dan Low kecil tanpa arah jelas hingga menguras profit yang sudah diperoleh di Sesi NY AM.'
      }
    },

    'protokol-news-lock-usd': {
      mappingSteps: [
        'Setiap pagi cek modul **Market Intel / Kalender Ekonomi** Amy FX Pro khusus berita **USD High Impact (Merah)**: `CPI`, `NFP`, `FOMC`, `Core PCE`, `Jobless Claims`, dan `ISM`.',
        'Tandai jendela **News Lock (`-15 menit` sebelum s.d. `+30 menit` sesudah rilis)** dengan garis vertikal pada grafik sesuai waktu WITA/WIB.',
        'Jika sudah memiliki posisi berjalan sebelum berita: amankan minimal `70%–100%` profit (atau *Partial + SL ke BEP*) maupun tutup penuh agar terhindar dari *slippage*.'
      ],
      decisionTree: [
        {
          condition: 'Berita CPI sudah lewat 30 menit, spread kembali normal (`$0,25`), dan sumbu CPI baru saja menyapu `PDL` lalu terbentuk `MSS`/`CISD` bullish yang jelas. Bolehkah mencari entry?',
          action: '**Boleh.** Setelah `+30 menit` pasca-berita saat volatilitas awal mereda dan spread normal, pergerakan pasca-sweep berita sering menjadi tren intraday yang sangat bersih.'
        },
        {
          condition: 'Hari ini ada keputusan suku bunga `FOMC` pukul `02:00 WITA` (`01:00 WIB` EDT). Apakah Sesi London siang aman untuk trading dengan risiko normal?',
          action: 'Waspadai **Seek & Destroy** (*chop* dua arah) saat pasar menunggu keputusan The Fed — turunkan risiko menjadi **`0,5%`** atau pilih **No-Trade Day**.'
        }
      ],
      failedCase: {
        title: 'Menahan Stop Loss Ketat 5 Menit Sebelum Rilis NFP',
        context: 'Posisi sudah profit tipis lalu dibiarkan terbuka melewati rilis NFP dengan anggapan Stop Loss pasti menahan kerugian.',
        whyFailed: 'Slippage saat NFP melompati harga SL sejauh `-$8` tambahan — kerugian nyata membengkak 3× lebih besar dari rencana risiko awal.'
      }
    },

    'daily-bias-draw-on-liquidity': {
      extraConceptBlocks: [
        {
          heading: '4 Hierarki Objektif Memilih Arah Daily Bias & Target DOL',
          paragraphs: [
            'Saat di atas harga ada `PDH` dan di bawah harga ada `PDL`, urutkan pemeriksaan dari 1 sampai 4 berikut agar keputusan tidak berdasar tebakan:\n1. **Origin Terbaru:** Jika harga baru saja menyapu `PDL` atau memantul kuat dari `FVG`/`Order Block` `Daily`/`H1`, maka **DOL** berpindah ke atas (`PDH` / `BSL` terdekat). Sebaliknya, jika baru menyapu `PDH`, **DOL** berpindah ke bawah (`PDL` / `SSL` terdekat).\n2. **Penutupan Candle Daily Kemarin (*Next-Day Expansion*):** *Body close* kuat melewati High 2 hari lalu mendukung kelanjutan naik (tunggu *pullback* ke *Discount* dulu), sedangkan *wick sweep* panjang lalu *body* ditutup kembali di bawah High mendukung pembalikan turun menuju `PDL`.\n3. **Siklus `IRL ↔ ERL`:** Saat harga berada di dalam `IRL` (`FVG`/`OB` `H1`), targetnya adalah `ERL` (`Swing High`/`Low` luar). Saat harga baru mengambil `ERL` (`PDH`/`PDL`), target jangka pendeknya adalah `IRL` di dalam range.\n4. **Ruang Gerak & Konfirmasi `DXY`:** Jika kedua sisi tampak seimbang, pilih Liquidity Pool Fresh terdekat yang memiliki ruang gerak bersih serta didukung arah berlawanan dari `DXY`.'
          ]
        },
        {
          heading: 'Format 3 Bagian Catatan Daily Bias Pagi',
          paragraphs: [
            'Biasakan menulis Daily Bias setiap pagi dalam **3 bagian ringkas**:\n• **Origin (Titik Asal):** *"Harga baru menyapu atau memantul dari [Level A]."* \n• **DOL (Target Utama):** *"Target Liquidity Pool Fresh berikutnya adalah [Level B]."* \n• **Garis Invalidasi:** *"Bias ini BATAL jika candle H1 menutup body melewati [Level C]."* \n\nJika Origin dan DOL belum terlihat jelas (misalnya candle kemarin berupa *Inside Bar*), tetapkan **Bias NETRAL (WAIT)** dan biarkan Sesi London menyapu `Asia High` atau `Asia Low` lebih dulu untuk membentuk Origin harian.'
          ]
        }
      ],
      mappingSteps: [
        'Buka grafik **Daily (`D1`)** `XAU/USD`: tandai **PDH**, **PDL**, **PWH**, dan **PWL**.',
        'Periksa pola penutupan candle Daily kemarin: *Continuation Close* (lanjut searah), *Wick Sweep* (siap balik arah), atau *Inside Bar* (**Bias Netral**).',
        'Turun ke `H1` untuk memeriksa apakah harga baru bereaksi di `ERL` (`PDH`/`PDL`) atau `IRL` (`FVG`/`OB` `H1`), lalu cek cepat arah `DXY` sebagai konfirmasi terbalik.',
        'Tulis 1 kalimat final sebelum Sesi London: *"Bias [BULLISH/BEARISH/NETRAL] · Origin [X] → DOL [Y] · Batal jika H1 body close melewati [Z]."*'
      ],
      decisionTree: [
        {
          condition: 'Candle Daily kemarin menutup hijau solid menembus High 2 hari lalu, tetapi pagi ini harga belum koreksi sama sekali. Bagaimana menyikapinya?',
          action: '**Daily Bias = BULLISH (DOL di atas `PDH`)**, namun jangan mengejar BUY di pucuk. Tunggu harga koreksi dulu mengisi `IRL` (`FVG` `H1`/`M15` atau sweep `Asia Low`) saat Sesi London sebelum mencari peluang BUY menuju `PDH`.'
        },
        {
          condition: 'Candle Daily kemarin menusuk di atas High 2 hari lalu dengan wick panjang lalu menutup body merah kembali di bawahnya. Apa Bias & DOL hari ini?',
          action: '**Bias BEARISH** dengan **Origin = Sweep High kemarin** dan **DOL Utama = `PDL` kemarin** (atau `FVG` `H1` terdekat di bawahnya sebagai `TP1`).'
        },
        {
          condition: 'Candle Daily kemarin adalah Inside Bar (terjepit penuh di dalam rentang candle 2 hari lalu). Bagaimana menentukan Bias?',
          action: 'Tetapkan **Bias NETRAL (WAIT)**. Jangan menebak di pagi hari; tunggu Sesi London menyapu `Asia High` atau `Asia Low` lebih dulu untuk membentuk Origin dan arah DOL.'
        },
        {
          condition: 'Pagi hari Daily Bias ditetapkan Bullish menuju PDH, tetapi pukul 15:00 WITA (14:00 WIB) candle H1 menutup body solid di bawah Garis Invalidasi.',
          action: 'Ikuti fakta struktur: **Bias Bullish resmi BATAL.** Hentikan rencana BUY, ambil jeda sejenak, lalu evaluasi ulang apakah target DOL kini beralih menuju `PDL`.'
        }
      ],
      failedCase: {
        title: 'Terjebak Narrative Bias (Mengabaikan Wick Sweep Daily & Garis Invalidasi)',
        context: 'Karena 3 hari sebelumnya Gold terus naik, trader yakin hari ke-4 pasti naik lagi meski candle kemarin sudah menyapu PWH dengan wick panjang dan H1 telah menutup body di bawah garis invalidasi.',
        whyFailed: 'Trader mengabaikan fakta bahwa **Origin** sudah berubah menjadi Sweep PWH sehingga **DOL** beralih turun ke PDL. Memaksakan BUY di tengah perubahan struktur berujung kerugian beruntun.'
      },
      extraQuiz: [
        {
          question: 'Candle Daily kemarin menyapu High 2 hari lalu hanya dengan **wick panjang**, lalu menutup body merah kembali di dalam range lama, sementara di bawah ada `PDL` yang masih Fresh. Apa Daily Bias dan target DOL hari ini?',
          options: [
            'Bias Bullish kuat karena wick sempat menyentuh harga tinggi',
            'Bias **Bearish** dengan Origin = Sweep High kemarin dan **DOL = `PDL`** (atau `FVG` `H1` terdekat di bawah)',
            'Wajib langsung BUY di pembukaan Sesi Asia',
            'Tidak ada hubungan antara penutupan candle Daily dengan DOL'
          ],
          answerIndex: 1,
          explanation: 'Sweep dengan wick panjang lalu body tutup kembali di dalam menandakan penolakan BSL, sehingga arah prioritas berbalik menuju likuiditas sisi bawah (PDL).'
        },
        {
          question: 'Di pagi hari, candle Daily kemarin adalah **Inside Bar** (terjepit penuh di dalam candle sebelumnya) tanpa menyapu PDH maupun PDL. Keputusan Daily Bias paling disiplin adalah...',
          options: [
            'Memaksa Bias Bullish karena Gold biasanya naik',
            'Memilih **Bias NETRAL (WAIT)** dan menunggu Sesi London menyapu `Asia High`/`Asia Low` lebih dulu untuk membentuk Origin dan DOL hari ini',
            'Memasang BUY dan SELL bersamaan di pembukaan pagi',
            'Menebak arah tanpa melihat struktur H1'
          ],
          answerIndex: 1,
          explanation: 'Hari Inside Bar belum menunjukkan komitmen arah; menunggu sweep Sesi London memberi fakta objektif mengenai Origin dan tujuan DOL.'
        }
      ]
    },

    'sop-playbook-harian-xauusd': {
      mappingSteps: [
        '**Fase 1 — Persiapan Pagi (08:00 WITA / 5 Menit):** Cek News Lock di Market Intel, gambar PDH/PDL & Bias+DOL+Invalidasi.',
        '**Fase 2 — Peta Pra-Sesi (13:45 WITA):** Tandai Asia High/Low + maksimal 1–2 POI di Discount/Premium + alarm harga.',
        '**Fase 3 — Eksekusi Terbatas (London 14:00–17:00 atau NY 19:30–23:00 WITA):** Maksimal 1–2 setup A+ per hari sesuai 1 model andalan.',
        '**Fase 4 — Penutupan & Jurnal (23:15 WITA):** Screenshot hasil (win/loss/skip), catat ke Jurnal, dan tutup MT5!'
      ],
      decisionTree: [
        {
          condition: 'Sudah profit 1 kali R:R 1:3 di sesi London (target harian tercapai). Apakah wajib lanjut trade lagi di sesi NY malam?',
          action: '**TIDAK WAJIB — bahkan sangat disarankan STOP!** Menjaga profit harian dari godaan overtrading malam hari adalah ciri scalper profesional.'
        },
        {
          condition: 'Sampai pukul 22:30 WITA tidak ada satu pun setup yang memenuhi seluruh checklist SOP. Apakah aku gagal hari ini?',
          action: '**SELAMAT — kamu menang 100% disiplin!** Melindungi modal di hari tanpa setup A+ adalah keunggulan profesional yang tidak dimiliki 90% trader ritel.'
        }
      ],
      failedCase: {
        title: 'Memantau Chart 14 Jam Nonstop Tanpa Playbook',
        context: 'Duduk menatap M5 dari jam 09:00 pagi sampai 01:00 malam WITA.',
        whyFailed: 'Kelelahan mental (*decision fatigue*) membuat trader mengambil setup berkualitas C di malam hari yang menghapus semua profit bersih sesi London.'
      }
    },

    'sizing-lot-xauusd-risiko': {
      mappingSteps: [
        'Kunci aturan risiko tetap per transaksi: **0.5% (defensif / sedang drawdown)** atau **1.0% (standar optimal)** — DILARANG di atas 2%.',
        'Ukur jarak Entry ke SL struktural (dalam dolar, misal `$3.50`), lalu masukkan ke Kalkulator Lot Amy FX Pro (atau rumus `Risiko $ ÷ (Jarak SL $ × 100)`).',
        'Jika SL melebar (misal $6), **lot WAJIB mengecil otomatis** — bukan memperkecil SL secara paksa!'
      ],
      decisionTree: [
        {
          condition: 'Aku sangat yakin 99% dengan setup Unicorn ini. Boleh naikkan risiko dari 1% jadi 5% khusus kali ini?',
          action: '**DILARANG!** Tidak ada setup 100% di pasar. Begitu 1 trade "sangat yakin" itu kena SL -5%, kamu butuh mental ekstra keras untuk memulihkannya dan merusak kurva ekuitas.'
        },
        {
          condition: 'Akun sedang mengalami drawdown -4% minggu ini. Tetap pakai risiko 1% atau diturunkan?',
          action: '**Turunkan separuh ke 0.5% per trade!** Mode defensif melindungi psikologi dan modal sampai akun pulih minimal separuh drawdown, baru kembali ke 1%.'
        }
      ],
      failedCase: {
        title: 'Memakai "Lot Tetap" 0.05 Lot di Semua Jarak SL',
        context: 'Trade pertama SL $2 (risiko $10), trade kedua SL $8 tetap pakai 0.05 lot (risiko melonjak jadi $40!).',
        whyFailed: 'Satu kali kalah di SL lebar langsung menghapus 4 kali kemenangan di SL pendek. Lot wajib dinamis mengikuti jarak SL.'
      }
    },

    'sl-struktural-napas-spread-tp': {
      mappingSteps: [
        'Tentukan **Titik Invalidasi Struktural** (di balik ujung wick sweep / Swing ekstrem — bukan jarak tetap arbitrer).',
        'Tambahkan **Buffer Spread & Wick Gold** (`$0,60–$1,20`) — khususnya pada posisi SELL karena dieksekusi oleh garis Ask.',
        'Hitung ukuran Lot dari jarak SL aktual agar risiko terkunci pada `0,5%–1%` modal.',
        'Petakan target 2 tingkat: **TP1 (Liquidity Pool terdekat / minimal `1,5R–2R`)** untuk pengamanan profit, dan **TP2 (DOL H1 / PDH–PDL)** untuk sisa posisi.'
      ],
      decisionTree: [
        {
          condition: 'SL struktural berjarak $6,00, sementara target terdekat (DOL) hanya berjarak $7,00 (R:R 1 : 1,17). Apakah layak diambil?',
          action: '**Lewati.** Setup dengan R:R di bawah **`1 : 1,8`–`1 : 2`** tidak sepadan secara matematis. Tunggu retracement lebih dalam atau lewatkan setup tersebut.'
        },
        {
          condition: 'Apakah TP2 sebaiknya ditempatkan tepat pada garis PDH/PDL atau sedikit di depannya?',
          action: 'Tempatkan **TP sedikit di depan (`$0,30–$0,60` sebelum ujung PDH/PDL)** dan perhitungkan garis Ask pada posisi SELL agar eksekusi target tidak terlewat.'
        }
      ],
      failedCase: {
        title: 'Mempersempit SL ke Tengah FVG Demi Memperbesar Lot',
        context: 'Agar dapat membuka 0,10 lot, trader mempersempit SL menjadi $1,20 di dalam area retracement normal Gold.',
        whyFailed: 'Retracement normal ke 50% CE menyentuh SL terlebih dahulu sebelum harga bergerak +120 pips sesuai arah analisis.'
      }
    },

    'manajemen-trade-partial-bep-notrade': {
      mappingSteps: [
        'Biarkan SL tetap pada titik invalidasi awal selama posisi baru bergerak `+0,3R` hingga `+1,0R` tanpa konfirmasi struktur baru.',
        'Saat menyentuh **TP1 (`≥ 1,5R–2R`)**, tutup **Partial `60%–75%` lot** lalu pindahkan SL sisa lot ke **`BEP+` (`+$0,30–$0,50`)**.',
        'Setelah posisi menjadi **bebas risiko (`BEP+`)**, biarkan sisa volume menuju TP2 (DOL) tanpa memantau setiap detik candle M1.',
        'Patuhi **Daily Loss Guard (`Maks 2× SL/hari`)** dan hindari **No-Trade Days** (US Bank Holiday, Pra-FOMC, dan Seek & Destroy).'
      ],
      decisionTree: [
        {
          condition: 'Posisi baru floating profit +0,5R dan muncul dorongan segera memindahkan SL ke BEP.',
          action: '**Jangan geser BEP terlalu dini.** Retracement normal XAU/USD sering menyentuh BEP yang terlalu cepat — tunggu minimal TP1 (`≥ 1,5R–2R`) atau terbentuk struktur baru searah posisi.'
        },
        {
          condition: 'Harga sudah menyentuh TP1 (`2R`) lalu mulai menunjukkan penolakan keras di POI HTF lawan.',
          action: 'Amankan **Partial Close `60%–75%`** dan pindahkan SL sisa lot ke **`BEP+`** agar keuntungan tidak berbalik menjadi kerugian.'
        }
      ],
      failedCase: {
        title: 'Menggeser Stop Loss Menjauh Saat Harga Mendekati SL',
        context: 'Trader menggeser SL menjauh dua kali ketika harga bergerak berlawanan karena enggan menerima rugi -1%.',
        whyFailed: 'Satu pelanggaran tersebut mengubah kerugian terukur -1% menjadi drawdown berat -12%.'
      }
    },

    'psikologi-scalper-anti-fomo': {
      mappingSteps: [
        'Aktifkan **Daily Loss Guard** di Jurnal Amy FX Pro (batas maksimal **-2% atau 2× SL per hari**).',
        'Setiap kali terkena SL, terapkan **Jeda Wajib 30 Menit**: tutup chart dan catat di Jurnal apakah SL tersebut sesuai SOP atau melanggar aturan.',
        'Atasi **FOMO** dengan mengingat probabilitas sesi: terdapat ratusan sesi London dan NY per tahun sehingga melewatkan satu peluang menjaga modal tetap utuh.'
      ],
      decisionTree: [
        {
          condition: 'Baru terkena SL, lalu 3 menit kemudian muncul dorongan membuka posisi baru agar segera balik modal.',
          action: '**STOP — itu merupakan Revenge Trading.** Patuhi jeda wajib 30 menit sebelum mengevaluasi pasar kembali.'
        },
        {
          condition: 'Kondisi fisik kurang tidur atau sedang lelah saat sesi London dibuka.',
          action: '**Tetapkan sebagai No-Trade Day.** Kondisi mental yang tidak optimal meningkatkan risiko kesalahan eksekusi.'
        }
      ],
      failedCase: {
        title: 'Revenge Trading Setelah 1 Kali SL',
        context: 'Setelah terkena SL disiplin -1%, trader langsung masuk 3 kali berturut-turut dengan lot 2× lebih besar di luar Killzone.',
        whyFailed: 'Kerugian normal -1% berkembang menjadi -9% dalam 45 menit akibat keputusan emosional.'
      }
    },

    'protokol-100-sample-mandiri': {
      mappingSteps: [
        'Kumpulkan **100 Sample Terukur** (`50 Backtest Replay` → `30 Forward Test Demo/Cent` → `20 Live Terukur`) memakai **1 Model Utama** pada sesi London & NY (WITA/WIB).',
        'Lakukan audit mingguan di Jurnal Trading setiap akhir pekan untuk memisahkan hasil `Sesuai Plan` dari kebocoran disiplin (`FOMO`, `Revenge`).',
        'Evaluasi data setiap **20–30 transaksi**: periksa Profit Factor, Expectancy, Max Drawdown, sesi terbaik, dan tingkat pelanggaran SOP.',
        'Lakukan scaling modal secara bertahap hanya setelah rapor memenuhi **Profit Factor `≥ 1,40`**, **Max Drawdown `< 8%`**, dan **pelanggaran SOP `< 10%`**.'
      ],
      decisionTree: [
        {
          condition: 'Dari 20 transaksi di Jurnal, 70% kerugian berasal dari sesi Asia dan transaksi ke-3 di hari yang sama.',
          action: 'Hapus kedua sumber kebocoran tersebut (fokus hanya Killzone London/NY dan batasi maksimal 2 transaksi/hari) tanpa perlu mengganti strategi.'
        },
        {
          condition: 'Setelah 100 sample Demo/Cent konsisten, bagaimana cara menaikkan modal yang aman?',
          action: 'Naikkan ukuran akun secara bertahap dan awali di akun Standard dengan risiko **`0,5%`** selama 30 transaksi pertama.'
        }
      ],
      failedCase: {
        title: 'Menilai Strategi Hanya Dari 3 Transaksi',
        context: 'Setelah 3 transaksi dengan 2 kali SL, trader langsung menyimpulkan strategi tidak bekerja dan berpindah metode.',
        whyFailed: 'Sampel 3 transaksi tidak memiliki signifikansi statistik; keunggulan probabilitas baru terlihat pada 30–100 transaksi disiplin.'
      }
    }
  };

  return Object.freeze(ENRICHMENTS);
});
