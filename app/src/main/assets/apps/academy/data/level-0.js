/* Amy FX Academy — Bagian I: Fondasi Pemula & Cara Kerja Pasar Gold (Bab 01–06)
 * Format Buku Trading Mengalir (Single-Flow Textbook Prose · Zero-Skip · Verified XAU/USD Math)
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
      code: 'Bagian I',
      title: 'Fondasi Pemula & Cara Kerja Pasar Gold',
      tagline: 'Mulai dari nol mutlak seperti membaca buku: apa itu trading Gold, pips, bid/ask, spread, rumus lot 1%, cara pakai MT5, candlestick, hingga ritme sesi pasar dunia.'
    }
  ];

  const LESSONS = [
    // ═══════════════════════════════════════════════════════════════════════
    // BAB 01 — APA ITU TRADING, BROKER & JENIS AKUN
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'kenal-trading-broker-akun',
      number: 1,
      code: '01',
      levelId: 0,
      bookFormat: true,
      title: 'Apa Itu Trading, Cara Kerja Broker & Memilih Jenis Akun (Demo, Cent, Standard)',
      subtitle: 'Dasar trading instrumen keuangan (XAU/USD), peran broker sebagai perantara pasar, dan urutan pemilihan akun dari Demo, Cent, hingga Standard.',
      readMinutes: 8,
      diagramId: 'zero-account-types',
      diagramAfterSection: 2,
      summary: 'Pahami definisi trading dan bedanya dengan investasi, mekanisme transaksi dua arah pada XAU/USD, cara kerja serta legalitas broker, dan panduan bertahap memilih Akun Demo, Cent, atau Standard.',
      bookSections: [
        {
          number: '1.1',
          heading: 'Apa Itu Trading dan Bedanya dengan Investasi?',
          paragraphs: [
            '**Trading** adalah aktivitas jual beli instrumen keuangan (seperti mata uang/forex, emas, saham, atau kripto) dalam jangka pendek untuk meraih keuntungan dari selisih perubahan harga. Untuk bertransaksi di pasar global, kamu membutuhkan **broker** sebagai perantara dan perlu memilih **jenis akun** yang sesuai dengan tingkat pengalaman serta modalmu.',
            'Di Academy ini, instrumen utama yang dipelajari adalah **Emas Dunia terhadap Dolar AS (`XAU/USD`)**. Kode **XAU** mewakili 1 troy ounce emas murni (~31,1 gram) dan **USD** adalah Dolar Amerika Serikat. Jika grafik menampilkan `2.650,00`, artinya harga 1 troy ounce emas dunia saat itu sebesar **$2.650**.',
            '1. **Fokus Utama:** Membaca pergerakan harga jangka pendek (analisis teknikal) dan dampak berita ekonomi harian. 2. **Jangka Waktu:** Hitungan menit, jam, hari, hingga minggu. 3. **Perbedaan dengan Investasi:** Investasi berfokus pada kepemilikan aset jangka panjang (tahunan) dengan harapan nilai aset atau perusahaan bertumbuh seiring waktu, sedangkan trading memanfaatkan fluktuasi harga harian secara aktif. 4. **Transaksi Dua Arah (Kontrak Derivatif):** Dalam trading online `XAU/USD`, kamu tidak menyimpan emas fisik melainkan memperdagangkan selisih harganya, sehingga profit bisa diperoleh saat harga naik maupun turun.'
          ],
          exampleBox: {
            title: 'Dua Arah Transaksi pada Gold (XAU/USD)',
            rows: [
              {
                label: 'Posisi BUY (Beli)',
                detail: 'Menghasilkan profit jika harga **naik**. Contoh: buka BUY di `2.650,00` lalu tutup di `2.660,00` → selisih kenaikan **+$10,00**.'
              },
              {
                label: 'Posisi SELL (Jual)',
                detail: 'Menghasilkan profit jika harga **turun**. Contoh: buka SELL di `2.660,00` lalu tutup di `2.650,00` → selisih penurunan **+$10,00**.'
              }
            ]
          }
        },
        {
          number: '1.2',
          heading: 'Cara Kerja Broker & Standar Keamanan Dana',
          paragraphs: [
            'Trader ritel (individu) tidak dapat masuk langsung ke pasar keuangan global karena syarat modal dan akses antarbank sangat besar. Broker berperan sebagai jembatan resmi antara kamu dan pasar melalui empat fungsi utama:',
            '1. **Menyediakan Platform:** Broker memberikan aplikasi (seperti **MetaTrader 5 / MT5**, MetaTrader 4, atau aplikasi resmi broker) untuk membaca grafik harga secara *real-time* serta mengeksekusi tombol Buy, Sell, Stop Loss, dan Take Profit. 2. **Meneruskan Pesanan:** Saat kamu membuka posisi, broker meneruskan pesanan ke penyedia likuiditas (bank besar atau bursa) atau mencocokkannya di sistem internal mereka. 3. **Sumber Keuntungan Broker:** Broker memperoleh pendapatan dari **Spread** (selisih harga jual dan harga beli saat transaksi dibuka), **Komisi** per transaksi, serta biaya inap (*Swap*) jika posisi ditahan melewati pergantian hari. 4. **Menyediakan Leverage (Daya Ungkit):** Fasilitas daya ungkit modal sementara dari broker sehingga dengan modal kecil (misalnya $100), kamu bisa menggerakkan nilai transaksi yang lebih besar. *Catatan: leverage memperbesar potensi keuntungan sekaligus risiko kerugian jika ukuran posisi tidak dibatasi.*'
          ],
          callout: {
            tone: 'warn',
            title: 'Standar Legalitas & Keamanan Akun',
            body: 'Untuk Indonesia, pastikan memilih broker berjangka yang terdaftar dan diawasi resmi oleh **Bappebti / OJK** sesuai regulasi terbaru, atau broker dengan regulasi kredibel yang memisahkan dana nasabah (*segregated account*). Setor dan tarik dana wajib menggunakan rekening atas namamu sendiri. Hindari skema titip dana atau pihak mana pun yang menjanjikan profit tetap harian — di pasar nyata, harga selalu berfluktuasi sehingga profit tetap tanpa risiko tidak pernah ada.'
          }
        },
        {
          number: '1.3',
          heading: 'Memilih Jenis Akun: Demo, Cent, atau Standard',
          paragraphs: [
            'Pemula sangat disarankan mengikuti tahapan jenis akun secara berurutan agar tidak kehilangan modal akibat kesalahan teknis maupun ukuran transaksi yang terlalu besar terhadap saldo:'
          ],
          table: {
            caption: 'Perbandingan Jenis Akun Trading: Demo, Cent, dan Standard',
            headers: ['Fitur / Aspek', 'Akun Demo', 'Akun Cent (USC)', 'Akun Standard'],
            rows: [
              ['Jenis Dana', 'Uang virtual (simulasi)', 'Uang asli (satuan sen / USC)', 'Uang asli (Dolar / Rupiah penuh)'],
              ['Risiko Keuangan', 'Nol (tidak bisa rugi maupun tarik profit)', 'Sangat rendah (melatih psikologi)', 'Normal hingga tinggi (sesuai modal)'],
              ['Contoh Deposit', 'Gratis (misal saldo virtual $10.000)', '$10 tampil menjadi 1.000 Cent', '$100 tampil tetap $100'],
              ['Tujuan Utama', 'Belajar tombol, fitur aplikasi & uji aturan', 'Menguji emosi uang asli bermodal kecil', 'Trading serius untuk target profit nyata']
            ]
          },
          paragraphsAfter: [
            '1. **Mulai dari Akun Demo:** Gunakan minimal beberapa minggu sampai kamu lancar membuka transaksi, memasang **Stop Loss**, memasang **Take Profit**, dan membaca grafik tanpa salah tekan. 2. **Lanjut ke Akun Cent:** Pindah ke akun Cent setelah konsisten mengikuti aturan di akun Demo. Karena saldonya uang asli meski bernilai kecil, kamu mulai merasakan tekanan psikologis (takut rugi atau terburu-buru) yang tidak muncul di akun Demo. Di Akun Standard `XAU/USD`, ukuran terkecil (`0.01 lot`) bernilai **$1 per gerak $1** sehingga modal $10–$50 terlalu rentan habis; di Akun Cent, `0.01 cent lot` hanya bernilai **$0,01 per gerak $1** sehingga modal kecil tetap aman untuk berlatih. 3. **Naik ke Akun Standard:** Gunakan hanya jika sistem tradingmu sudah teruji di akun Cent, disiplin memakai Stop Loss, dan memakai **uang dingin** (dana di luar kebutuhan pokok dan bukan pinjaman).'
          ]
        },
        {
          number: '1.4',
          heading: 'Prinsip Dasar: Probabilitas dan Risk to Reward (R:R)',
          paragraphs: [
            'Tidak ada strategi atau institusi yang bisa memprediksi arah pasar 100% benar di setiap transaksi. Kerugian kecil yang sudah dibatasi Stop Loss adalah bagian normal dari aktivitas trading.',
            'Profitabilitas jangka panjang ditentukan oleh kombinasi **tingkat keberhasilan (Winrate)** dan **perbandingan Risiko terhadap Imbalan (Risk to Reward / R:R)**. Selama potensi keuntungan saat benar lebih besar daripada batas rugi saat salah, akurasi 50% pun tetap menghasilkan pertumbuhan akun.'
          ],
          exampleBox: {
            title: 'Simulasi Matematis 10 Transaksi (R:R 1:2 · Winrate 50%)',
            rows: [
              {
                label: '5 Transaksi Rugi (50%)',
                detail: '5 × rugi `$10` = **-$50**'
              },
              {
                label: '5 Transaksi Profit (50%)',
                detail: '5 × untung `$20` = **+$100**'
              },
              {
                label: 'Hasil Bersih',
                detail: '`+$100 - $50` = **+$50 Profit Bersih**'
              }
            ]
          }
        }
      ],
      keyTakeaways: [
        'Trading XAU/USD memperdagangkan selisih harga emas secara dua arah (BUY saat naik, SELL saat turun) dalam jangka pendek.',
        'Broker menyediakan platform, meneruskan pesanan, menyediakan leverage, dan memperoleh pendapatan dari Spread/Komisi; pilih hanya broker teregulasi.',
        'Urutan aman untuk pemula adalah Akun Demo, lalu Akun Cent (USC), kemudian Akun Standard dengan uang dingin.'
      ],
      bridgeNext: 'Setelah memahami dasar trading, peran broker, dan urutan pemilihan akun, langkah berikutnya adalah membaca angka harga XAU/USD yang muncul di layar aplikasi. Di **Bab 02**, kita membahas **Pips, Point, Bid, Ask, Spread**, serta komponen biaya transaksi di pasar emas.',
      conceptBlocks: [
        {
          heading: 'Trading Gold (XAU/USD), Broker & Jenis Akun',
          paragraphs: [
            'Trading XAU/USD memperdagangkan selisih harga 1 troy ounce emas terhadap USD secara dua arah (BUY dan SELL) dalam jangka pendek berbasis probabilitas dan rasio Risk:Reward.',
            'Urutan akun pemula dimulai dari Akun Demo (uang virtual), berlanjut ke Akun Cent/USC (uang asli skala kecil), lalu Akun Standard setelah sistem teruji.'
          ]
        }
      ],
      mappingSteps: [
        'Buat Akun Demo di broker teregulasi tanpa deposit uang asli.',
        'Uji membuka dan menutup transaksi BUY serta SELL pada simbol XAUUSD di MT5.',
        'Pahami perbedaan skala saldo Demo, Cent (USC), dan Standard sebelum menggunakan dana asli.'
      ],
      decisionTree: [
        {
          condition: 'Modal latihan masih $10–$50 dan ingin mulai melatih psikologi dengan uang asli.',
          action: 'Pilih Akun Cent (USC) agar risiko per transaksi tetap kecil (≤ 1% modal).'
        },
        {
          condition: 'Ada tawaran titip dana trading dengan janji profit tetap harian tanpa risiko.',
          action: 'Tolak sepenuhnya — pasar keuangan nyata selalu bergerak probabilistik dan tidak menjamin profit tetap.'
        }
      ],
      validRules: [
        'Mulai dari Akun Demo hingga lancar mengoperasikan order, SL, dan TP.',
        'Gunakan Akun Cent (USC) saat pertama kali melatih psikologi dengan uang asli skala kecil.',
        'Kelola akun sendiri di broker teregulasi menggunakan uang dingin.'
      ],
      invalidRules: [
        'Menyetor modal kecil ($10–$50) langsung ke Akun Standard untuk transaksi XAU/USD.',
        'Menitipkan dana pada pihak lain yang menjanjikan profit tetap setiap hari.'
      ],
      xauScenario: {
        context: 'Skenario pemula dengan modal latihan $25 yang ingin memahami mekanisme XAU/USD secara bertahap.',
        steps: [
          'Tahap awal: gunakan Akun Demo untuk berlatih membuka posisi BUY/SELL serta mengisi Stop Loss dan Take Profit.',
          'Tahap transisi: gunakan Akun Cent agar $25 tampil menjadi 2.500 Cent (USC) sehingga risiko latihan tetap terjaga kecil.'
        ]
      },
      failedCase: {
        title: 'Modal Kecil Langsung ke Akun Standard',
        context: 'Pemula menyetor $25 ke Akun Standard lalu membuka 0.01 lot BUY XAU/USD tanpa memahami nilai kontrak.',
        whyFailed: 'Di Akun Standard Gold, 0.01 lot berarti setiap pergerakan $10 bernilai $10. Dua kali rugi $10 langsung menghabiskan 80% saldo.'
      },
      goldenRules: [
        'Demo untuk menguasai teknis, Cent untuk melatih psikologi, Standard untuk eksekusi sistem teruji.',
        'Kerugian kecil yang terukur adalah bagian normal dari trading berbasis probabilitas.'
      ],
      practiceCta: {
        label: 'Buka Lab Latihan Chart Pemula',
        description: 'Uji pemahaman dasar arah harga dan skenario chart tanpa risiko kehilangan uang asli di simulator latihan.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Saat harga Gold (XAU/USD) diprediksi akan turun dari 2.660,00 menuju 2.650,00, jenis posisi apa yang dibuka untuk meraih profit dari penurunan tersebut?',
          options: [
            'Posisi BUY, karena trading hanya dapat menghasilkan profit saat harga naik',
            'Posisi SELL, karena kontrak derivatif XAU/USD memungkinkan profit dari selisih penurunan harga',
            'Tidak dapat bertransaksi sebelum memiliki emas fisik',
            'Menunggu pasar tutup di akhir pekan terlebih dahulu'
          ],
          answerIndex: 1,
          explanation: 'Trading XAU/USD bersifat dua arah: BUY menghasilkan profit saat harga naik, sedangkan SELL menghasilkan profit saat harga turun.'
        },
        {
          question: 'Seorang trader melakukan 10 transaksi dengan Risk:Reward 1:2 (rugi $10 saat salah, untung $20 saat benar). Jika hasilnya 5 kali menang dan 5 kali kalah (winrate 50%), bagaimana hasil akhirnya?',
          options: [
            'Impas ($0) karena jumlah menang dan kalah sama',
            'Rugi bersih -$50 karena kalah 5 kali',
            'Profit bersih +$50 karena total menang (+$100) lebih besar daripada total kalah (-$50)',
            'Akun otomatis ditutup oleh broker'
          ],
          answerIndex: 2,
          explanation: '5 menang × $20 = +$100 dikurangi 5 kalah × $10 = -$50 menghasilkan profit bersih +$50.'
        },
        {
          question: 'Kamu memiliki modal latihan $25 dan ingin mulai melatih psikologi menggunakan uang asli tanpa risiko cepat habis. Jenis akun apa yang paling sesuai?',
          options: [
            'Akun Standard agar cepat mendapatkan profit besar',
            'Akun Cent (USC), karena $25 tampil menjadi 2.500 Cent sehingga risiko per transaksi sangat kecil',
            'Menitipkan $25 ke skema titip dana profit harian tetap',
            'Akun tanpa Stop Loss dengan dana pinjaman'
          ],
          answerIndex: 1,
          explanation: 'Akun Cent mengubah $25 menjadi 2.500 USC sehingga pemula dapat melatih emosi uang asli dengan risiko terkendali.'
        },
        {
          question: 'Manakah ciri utama yang menunjukkan praktik penipuan berkedok trading?',
          options: [
            'Menyediakan Akun Demo gratis untuk simulasi',
            'Meminta trader mengelola akun dan mengatur risiko sendiri',
            'Menjanjikan profit tetap harian secara pasti melalui sistem titip dana',
            'Mewajibkan penarikan dana ke rekening atas nama pemilik akun'
          ],
          answerIndex: 2,
          explanation: 'Harga pasar keuangan selalu berfluktuasi sehingga tidak ada pihak mana pun yang dapat menjamin profit tetap harian tanpa risiko.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BAB 02 — PIPS, POINT, BID, ASK, SPREAD & BIAYA TRANSAKSI GOLD
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'bid-ask-spread-pips-gold',
      number: 2,
      code: '02',
      levelId: 0,
      bookFormat: true,
      title: 'Pips, Point, Bid, Ask, dan Spread di Gold (XAU/USD)',
      subtitle: 'Satuan standar pengukur jarak harga Gold, mekanisme dua harga (Bid dan Ask), dampak Spread pada Stop Loss, serta biaya Swap, Komisi, dan Slippage.',
      readMinutes: 9,
      diagramId: 'zero-bid-ask-spread',
      diagramAfterSection: 2,
      summary: 'Pahami satuan Pips dan Point pada harga XAU/USD (2.650,00), cara menghitung jarak harga, aturan Bid vs Ask, dampak Spread pada posisi BUY/SELL, serta biaya Swap, Komisi Raw/ECN, dan Slippage.',
      bookSections: [
        {
          number: '2.1',
          heading: 'Pengertian Pips dan Point pada Gold (XAU/USD)',
          paragraphs: [
            'Dalam trading, perubahan harga diukur dengan satuan baku agar jarak risiko (Stop Loss) dan target (Take Profit) dapat dihitung secara presisi. Dua satuan utama tersebut adalah **Point** dan **Pip** (*Percentage in Point*).',
            'Harga **Gold (`XAU/USD`)** di sebagian besar broker ditampilkan dengan **dua angka di belakang koma**, misalnya `2.650,00`. Rincian nilai setiap digitnya dari kanan ke kiri adalah sebagai berikut:'
          ],
          table: {
            caption: 'Anatomi Digit Harga Gold (Contoh Acuan: 2.650,00)',
            headers: ['Perubahan Angka', 'Nama Satuan', 'Kesetaraan'],
            rows: [
              ['0,01 (digit paling kanan)', '1 Point', 'Satuan pergerakan terkecil pada chart Gold 2 desimal'],
              ['0,10 (digit kedua dari kanan)', '1 Pip', '1 Pip = 10 Point'],
              ['$1,00 (digit satuan dolar)', '10 Pips', '$1,00 = 10 Pips = 100 Point'],
              ['$10,00 (digit puluhan dolar)', '100 Pips', '$10,00 = 100 Pips = 1.000 Point']
            ]
          }
        },
        {
          number: '2.2',
          heading: 'Cara Menghitung Jarak Pips di Gold',
          paragraphs: [
            'Untuk menghitung jumlah Pips pada `XAU/USD`, cari selisih harga dalam dolar lalu **kalikan 10** (`Selisih Harga $ × 10 = Pips`).',
            'Rumus ini berlaku konsisten untuk mengukur jarak entry ke Stop Loss maupun jarak entry ke Take Profit:'
          ],
          exampleBox: {
            title: 'Contoh Perhitungan Jarak Pips pada XAU/USD',
            rows: [
              {
                label: 'Contoh 1',
                detail: 'Harga bergerak dari `2.650,00` ke `2.650,10` → selisih `$0,10` → `$0,10 × 10` = **1 Pip** (10 Point).'
              },
              {
                label: 'Contoh 2',
                detail: 'Harga bergerak dari `2.650,00` ke `2.651,00` → selisih `$1,00` → `$1,00 × 10` = **10 Pips** (100 Point).'
              },
              {
                label: 'Contoh 3',
                detail: 'Harga bergerak dari `2.650,00` ke `2.654,50` → selisih `$4,50` → `$4,50 × 10` = **45 Pips** (450 Point).'
              }
            ]
          }
        },
        {
          number: '2.3',
          heading: 'Pengertian Bid, Ask, dan Aturan Eksekusi Transaksi',
          paragraphs: [
            'Pada aplikasi trading seperti MetaTrader 5, setiap instrumen selalu menampilkan **dua harga sekaligus**: **Bid** dan **Ask**. Contohnya: **Bid = `2.650,00`** dan **Ask = `2.650,30`**.',
            '**Bid** adalah harga pasar untuk membuka transaksi **SELL** (dan menutup transaksi **BUY**). **Ask** adalah harga pasar untuk membuka transaksi **BUY** (dan menutup transaksi **SELL**). Harga Ask selalu sedikit lebih tinggi daripada harga Bid.'
          ],
          table: {
            caption: 'Aturan Baku Bid dan Ask Saat Membuka & Menutup Posisi',
            headers: ['Arah Transaksi', 'Harga Saat BUKA (Entry)', 'Harga Saat TUTUP (Close / SL / TP)'],
            rows: [
              ['BUY (Beli)', 'Harga ASK (lebih tinggi, mis. 2.650,30)', 'Harga BID (lebih rendah)'],
              ['SELL (Jual)', 'Harga BID (lebih rendah, mis. 2.650,00)', 'Harga ASK (lebih tinggi)']
            ]
          }
        },
        {
          number: '2.4',
          heading: 'Spread dan Dampaknya pada Posisi BUY maupun SELL',
          paragraphs: [
            'Selisih antara harga Ask (`2.650,30`) dan harga Bid (`2.650,00`) sebesar **`$0,30` (3 Pips / 30 Point)** disebut **Spread**. Spread merupakan biaya transaksi yang dibebankan saat kamu membuka posisi.',
            'Memahami mekanisme Spread langsung menjelaskan dua hal teknis yang sering disalahpahami pemula:'
          ],
          exampleBox: {
            title: 'Dua Efek Teknis Spread di Chart XAU/USD',
            rows: [
              {
                label: '1. Posisi baru dibuka langsung minus',
                detail: 'Saat klik BUY di Ask `2.650,30`, harga jual balik saat itu (Bid) berada di `2.650,00`. Jika langsung ditutup detik itu juga, selisihnya minus 3 pips (`-$0,30`). Harga harus bergerak searah melebihi jarak Spread dulu agar impas (*breakeven*), lalu baru mencatat profit.'
              },
              {
                label: '2. SL posisi SELL tersentuh sebelum candle menyentuh garis',
                detail: 'Secara standar, grafik candlestick hanya menggambar **harga Bid**, sedangkan posisi **SELL ditutup menggunakan harga Ask** (yang berada di atas Bid sebesar Spread). Jika SL Sell dipasang di `2.652,00` dengan spread `$0,30`, maka saat Bid (puncak wick) baru mencapai `2.651,70`, harga Ask sudah mencapai `2.652,00` (`2.651,70 + 0,30`) dan SL langsung aktif.'
              }
            ]
          },
          callout: {
            tone: 'tip',
            title: 'Standar Pengaturan Chart & SL Posisi SELL',
            body: 'Aktifkan fitur **Show Ask Line** di pengaturan chart MT5 agar posisi garis Bid dan Ask selalu terlihat bersamaan. Saat memasang Stop Loss untuk posisi **SELL**, tambahkan buffer spread (misalnya `+$0,40` hingga `+$0,50`) di atas level struktur agar tidak tereksekusi prematur akibat melebarnya spread.'
          }
        },
        {
          number: '2.5',
          heading: 'Biaya Transaksi Lain: Swap, Komisi Akun Raw/ECN & Slippage',
          paragraphs: [
            'Selain Spread, terdapat tiga komponen biaya atau geseran eksekusi lain di broker yang perlu dipahami sejak awal:',
            '1. **Swap (Biaya Inap Harian):** Jika posisi dibiarkan terbuka melewati pergantian hari pasar (**Rollover**, sekitar `05:00 WITA` EDT / `06:00 WITA` EST), broker mengenakan bunga/biaya inap yang disebut **Swap**. Khusus malam **Rabu ke Kamis**, berlaku **Triple Swap** (3× biaya harian sekaligus untuk menghitung akhir pekan). Trader harian (*intraday*) yang menutup posisi sebelum ganti hari tidak terkena Swap, atau dapat memilih akun *Swap-Free* jika tersedia. 2. **Komisi pada Akun Raw / ECN:** **Akun Standard** tidak mengenakan komisi terpisah karena seluruh biaya masuk ke dalam Spread (`±2,0–3,5 pips`). Sebaliknya, **Akun Raw / ECN** memberikan Spread sangat tipis (`±0,5–1,5 pips`) dengan tambahan **Komisi tetap** (umumnya `$6–$7` per `1.00 lot` pulang-pergi, atau sekitar `$0,06–$0,07` untuk `0.01 lot`). 3. **Slippage (Geseran Harga Eksekusi):** Pada saat rilis berita ekonomi besar (CPI, NFP, FOMC) atau pembukaan pasar Senin pagi, harga dapat melompat cepat sehingga eksekusi order atau Stop Loss terisi sedikit bergeser dari angka yang dipasang karena kekosongan likuiditas sesaat.'
          ],
          table: {
            caption: 'Perbandingan Struktur Biaya Akun Standard vs Raw / ECN pada XAU/USD',
            headers: ['Komponen Biaya', 'Akun Standard / Cent', 'Akun Raw / ECN', 'Catatan Teknis'],
            rows: [
              ['Spread Normal Gold', '± 2,0 – 3,5 pips', '± 0,5 – 1,5 pips', 'Total biaya efektif mirip; Raw lebih presisi untuk SL ketat'],
              ['Komisi per Lot', '$0 (masuk ke spread)', '±$6 – $7 per 1.00 lot (PP)', 'Untuk 0.01 lot setara ±$0,06 – $0,07 per transaksi'],
              ['Swap (Biaya Inap)', 'Berlaku lewat Rollover', 'Berlaku lewat Rollover', 'Triple Swap pada malam Rabu ke Kamis; 0 jika tutup harian'],
              ['Slippage', 'Tinggi saat News / Rollover', 'Tinggi saat News / Rollover', 'Hindari eksekusi tepat saat rilis berita besar & pergantian hari']
            ]
          }
        }
      ],
      keyTakeaways: [
        'Pada Gold (XAU/USD): 0,01 = 1 Point, 0,10 = 1 Pip (10 Point), dan $1,00 = 10 Pips.',
        'BUY dibuka di harga Ask dan ditutup di Bid; SELL dibuka di Bid dan ditutup di Ask.',
        'Selisih Ask - Bid adalah Spread; perhatikan pula biaya Swap (Triple Swap Rabu malam), Komisi Raw/ECN, dan risiko Slippage saat news.'
      ],
      bridgeNext: 'Setelah mampu menghitung jarak pergerakan harga dalam Pips dan memahami biaya transaksi, pertanyaan berikutnya adalah berapa nilai uang dari setiap pergerakan Pips tersebut. Di **Bab 03**, kita membahas **Lot, Leverage, Margin, Balance vs Equity**, serta rumus eksak menghitung ukuran Lot berdasarkan batas risiko 1%.',
      conceptBlocks: [
        {
          heading: 'Pips, Point, Bid, Ask & Spread XAU/USD',
          paragraphs: [
            'Pada Gold (XAU/USD): 0,01 = 1 Point, 0,10 = 1 Pip, dan $1,00 = 10 Pips. Selisih harga dolar dikali 10 menghasilkan jumlah pips.',
            'BUY dibuka di Ask dan ditutup di Bid; SELL dibuka di Bid dan ditutup di Ask. Selisih Ask - Bid adalah Spread.'
          ]
        }
      ],
      mappingSteps: [
        'Aktifkan fitur Show Ask Line pada pengaturan chart MT5.',
        'Ukur jarak dua level harga XAU/USD menggunakan Crosshair lalu konversikan selisih dolar × 10 menjadi Pips.',
        'Tambahkan buffer spread di atas level struktur setiap kali memasang Stop Loss posisi SELL.'
      ],
      decisionTree: [
        {
          condition: 'Memasang Stop Loss posisi SELL tepat menempel pada puncak candle sebelumnya.',
          action: 'Geser SL sedikit lebih tinggi (+$0,40 hingga +$0,50) agar garis Ask tidak memicu SL sebelum harga benar-benar menembus struktur.'
        },
        {
          condition: 'Spread Gold melebar jauh di atas normal (misalnya dari 3 pips menjadi 15 pips saat rollover atau rilis berita).',
          action: 'Tunda eksekusi hingga spread kembali normal agar biaya masuk tidak menggerus rasio R:R.'
        }
      ],
      validRules: [
        'Aktifkan garis Ask di chart agar jarak spread terlihat langsung.',
        'Tambahkan buffer spread pada Stop Loss posisi SELL.',
        'Hitung jarak SL dan TP dalam dolar dan pips sebelum menempatkan order.'
      ],
      invalidRules: [
        'Memasang SL SELL tanpa memperhitungkan harga Ask.',
        'Membuka posisi saat spread melebar ekstrem pada jam rollover atau rilis berita besar.'
      ],
      xauScenario: {
        context: 'Harga XAU/USD menunjukkan Bid 2.650,00 dan Ask 2.650,30 (spread $0,30 / 3 pips). Rencana posisi SELL memiliki batas invalidasi struktur di 2.652,00.',
        steps: [
          'Hitung jarak dari Bid 2.650,00 ke level 2.652,00 = $2,00 (20 pips).',
          'Karena SELL ditutup di garis Ask, tambahkan buffer spread +$0,50 sehingga SL ditempatkan di 2.652,50.',
          'Jika Bid hanya naik sampai 2.651,80, Ask berada di 2.652,10 sehingga posisi tetap terlindungi dari aktivasi SL prematur.'
        ]
      },
      failedCase: {
        title: 'SL Sell Tersentuh oleh Harga Ask',
        context: 'Trader menaruh SL Sell persis di 2.652,00 saat spread $0,30 (3 pips).',
        whyFailed: 'Saat garis Bid baru menyentuh 2.651,70, harga Ask sudah mencapai 2.652,00 (2.651,70 + 0,30) sehingga SL langsung tereksekusi.'
      },
      goldenRules: [
        'Pada Gold, selisih $1,00 = 10 Pips = 100 Point.',
        'BUY ditutup oleh Bid; SELL ditutup oleh Ask — selalu tambahkan buffer spread pada SL Sell.'
      ],
      practiceCta: {
        label: 'Amati Pergerakan Harga Live di Cockpit Mapping',
        description: 'Perhatikan perubahan angka harga Gold secara langsung sebelum melatih perhitungan Lot dan risiko di Bab 03.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Harga Gold (XAU/USD) bergerak naik dari 2.650,00 menuju 2.654,50. Berapa Pips jarak pergerakan harga tersebut?',
          options: [
            '4,5 Pips',
            '45 Pips',
            '450 Pips',
            '4.500 Pips'
          ],
          answerIndex: 1,
          explanation: 'Selisih harganya adalah $4,50. Karena setiap $1,00 pada Gold = 10 Pips, maka $4,50 × 10 = 45 Pips (450 Point).'
        },
        {
          question: 'Di layar broker tertera Bid = 2.650,00 dan Ask = 2.650,30. Jika kamu langsung klik BUY, pada harga berapa transaksi dibuka dan berapa besar spread-nya?',
          options: [
            'Dibuka di 2.650,00 dengan spread 30 Pips',
            'Dibuka di 2.650,30 (Ask) dengan spread $0,30 (3 Pips)',
            'Dibuka di 2.650,15 tanpa spread',
            'Dibuka di 2.650,00 dan langsung profit 3 Pips'
          ],
          answerIndex: 1,
          explanation: 'Posisi BUY dibuka pada harga Ask (2.650,30). Selisih Ask - Bid sebesar $0,30 sama dengan 3 Pips.'
        },
        {
          question: 'Kamu memiliki posisi SELL XAU/USD dengan Stop Loss di 2.652,00. Jika spread sedang $0,30 (3 pips), pada harga Bid berapa Stop Loss tersebut akan tereksekusi?',
          options: [
            'Saat Bid mencapai 2.652,30',
            'Saat Bid mencapai 2.652,00 persis',
            'Saat Bid mencapai 2.651,70 (karena Ask = 2.651,70 + 0,30 = 2.652,00)',
            'Stop Loss SELL tidak dipengaruhi spread'
          ],
          answerIndex: 2,
          explanation: 'Posisi SELL ditutup memakai harga Ask. Saat Bid menyentuh 2.651,70 dengan spread $0,30, harga Ask sudah mencapai 2.652,00.'
        },
        {
          question: 'Mengapa setiap posisi BUY atau SELL yang baru dibuka langsung menampilkan angka negatif (minus) pada detik pertama?',
          options: [
            'Karena gangguan koneksi internet',
            'Karena transaksi langsung menanggung biaya Spread (selisih antara harga buka dan harga tutup saat itu)',
            'Karena broker otomatis memotong 10% dari modal',
            'Karena transaksi emas hanya valid pada malam hari'
          ],
          answerIndex: 1,
          explanation: 'Nilai minus awal adalah biaya Spread (selisih Ask dan Bid). Posisi akan impas lalu profit setelah harga bergerak searah melebihi jarak Spread.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BAB 03 — LOT, LEVERAGE, MARGIN, BALANCE VS EQUITY & RUMUS RISIKO 1%
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'lot-leverage-margin-equity',
      number: 3,
      code: '03',
      levelId: 0,
      bookFormat: true,
      title: 'Lot, Leverage, Margin, Balance vs Equity & Rumus Risiko 1%',
      subtitle: 'Menentukan nilai uang per Pip melalui ukuran Lot, cara kerja Leverage dan Margin, membaca kesehatan akun di MT5, dan menghitung Lot secara eksak.',
      readMinutes: 11,
      diagramId: 'zero-lot-margin-meter',
      diagramAfterSection: 2,
      interactiveLabAfterSection: 3,
      summary: 'Kuasai satuan kontrak Lot pada XAU/USD, fungsi Leverage & Margin, perbedaan Balance, Equity, dan Free Margin, serta rumus baku menghitung Lot agar risiko selalu berada di batas 0,5%–1% modal.',
      bookSections: [
        {
          number: '3.1',
          heading: 'Pengertian Lot dan Nilai Uang per Pergerakan Harga Gold',
          paragraphs: [
            '**Lot** adalah satuan standar ukuran volume transaksi di pasar keuangan. Jika **Pips** mengukur seberapa jauh harga bergerak, maka **Lot** menentukan berapa nilai dolar dari setiap pergerakan Pips tersebut.',
            'Pada kontrak **Akun Standard Gold (`XAU/USD`)**, **1.00 Lot penuh sama dengan 100 troy ounce emas**. Artinya, setiap pergerakan harga emas sebesar **$1,00 (10 Pips)** pada 1.00 Lot bernilai **`100 × $1 = $100`**. Untuk menyesuaikan dengan modal, ukuran transaksi dapat dipecah hingga **0.01 Lot** (*Micro Lot*).'
          ],
          table: {
            caption: 'Nilai Uang per Pergerakan Harga Gold (Akun Standard vs Akun Cent)',
            headers: ['Ukuran Lot', 'Setara Emas', 'Gerak 1 Pip ($0,10)', 'Gerak $1,00 (10 Pips)', 'Gerak $5,00 (50 Pips)'],
            rows: [
              ['1.00 Lot (Standard)', '100 oz', '$10,00', '$100,00', '$500,00'],
              ['0.10 Lot (Standard)', '10 oz', '$1,00', '$10,00', '$50,00'],
              ['0.01 Lot (Standard)', '1 oz', '$0,10', '$1,00', '$5,00'],
              ['0.01 Lot (Cent / USC)', '0,01 oz', '0,1 USC ($0,001)', '1 USC ($0,01)', '5 USC ($0,05)']
            ]
          }
        },
        {
          number: '3.2',
          heading: 'Cara Kerja Leverage dan Margin',
          paragraphs: [
            'Pada harga emas `$2.650`, nilai kontrak `0.01 lot` Standard (1 troy ounce) adalah **$2.650**. Namun dengan modal `$100`, kamu tetap dapat membuka posisi tersebut berkat fasilitas **Leverage** (daya ungkit).',
            'Dengan Leverage, broker hanya menahan sebagian kecil dari nilai kontrak sebagai **uang jaminan sementara** yang disebut **Margin**. Rumusnya adalah: **`Margin = Nilai Kontrak ÷ Leverage`**.',
            'Sebagai contoh, dengan Leverage **1:500**, Margin yang ditahan untuk `0.01 lot` Gold pada harga `$2.650` hanyalah **`$2.650 ÷ 500 = $5,30`**. Setelah posisi ditutup, Margin `$5,30` tersebut otomatis kembali ke dana bebas akunmu.',
            'Hal penting yang wajib dipahami: **Leverage hanya memperkecil jaminan Margin, TIDAK memperkecil nilai untung atau rugi per Pip.** Baik memakai Leverage 1:100 maupun 1:2000, jika kamu membuka `0.01 lot` Standard dan harga bergerak berlawanan `$5,00`, kerugiannya tetap sama persis sebesar **$5,00**.'
          ]
        },
        {
          number: '3.3',
          heading: 'Balance, Floating P/L, Equity, Free Margin, Margin Call & Stop Out',
          paragraphs: [
            'Pada tab **Trade** di MetaTrader 5, terdapat empat metrik utama yang menunjukkan kondisi kesehatan akun secara *real-time*. Perhatikan simulasi akun bermodal `$1.000` yang sedang membuka posisi `0.02 lot` Gold dengan kerugian mengambang sebesar `-$30`:'
          ],
          exampleBox: {
            title: 'Simulasi Layar Tab Trade MT5 Saat Posisi Aktif',
            rows: [
              {
                label: 'Balance = $1.000,00',
                detail: 'Total saldo dari seluruh transaksi yang **sudah ditutup**. Angka ini tidak berubah selama posisi masih berjalan.'
              },
              {
                label: 'Floating P/L = -$30,00',
                detail: 'Keuntungan atau kerugian sementara dari posisi yang **masih terbuka** saat ini.'
              },
              {
                label: 'Equity = $970,00',
                detail: 'Nilai bersih akun yang sebenarnya saat ini (`Balance + Floating` = `$1.000 - $30`).'
              },
              {
                label: 'Free Margin = $959,40',
                detail: 'Sisa dana bebas setelah dikurangi Margin terpakai (misalnya `$10,60` untuk `0.02 lot`): `$970,00 - $10,60 = $959,40`.'
              }
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Mekanisme Margin Call dan Stop Out',
            body: 'Jika posisi dibuka dengan Lot terlalu besar tanpa Stop Loss hingga **Equity** terus menyusut mendekati batas Margin yang ditahan, broker akan mengeluarkan peringatan (**Margin Call**). Apabila penurunan berlanjut mencapai batas minimum broker (misalnya Margin Level 20%–50%), sistem akan menutup paksa seluruh posisi aktif dalam kondisi rugi (**Stop Out**) untuk mencegah saldo menjadi minus.'
          }
        },
        {
          number: '3.4',
          heading: 'Rumus Menghitung Lot Berdasarkan Batas Risiko 0,5% – 1%',
          paragraphs: [
            'Ukuran Lot tidak ditentukan secara acak. Langkah profesional adalah menetapkan terlebih dahulu **batas risiko maksimal per transaksi (0,5% hingga 1% dari modal)**, mengukur **jarak Stop Loss di chart**, lalu menghitung Lot dengan rumus baku:',
            '**Rumus Lot Akun Standard Gold:** `Lot = Risiko ($) ÷ (Jarak SL dalam $ × 100)`',
            'Berikut tiga contoh perhitungan nyata berdasarkan ukuran modal:'
          ],
          exampleBox: {
            title: '3 Contoh Perhitungan Lot Eksak pada Gold (XAU/USD)',
            rows: [
              {
                label: 'Modal $1.000 (Akun Standard)',
                detail: 'Risiko 1% = **$10**. Jarak SL = **$5,00** (50 pips). Hitungan: `$10 ÷ (5 × 100)` = **0.02 Lot**. Verifikasi: `0.02 × $5 × 100 = $10` (tepat 1%).'
              },
              {
                label: 'Modal $500 (Akun Standard)',
                detail: 'Risiko 1% = **$5**. Jarak SL = **$5,00** (50 pips). Hitungan: `$5 ÷ (5 × 100)` = **0.01 Lot**. Verifikasi: `0.01 × $5 × 100 = $5` (tepat 1%).'
              },
              {
                label: 'Modal $50 (Perbandingan Standard vs Cent)',
                detail: 'Risiko 1% = **$0,50**. Jika dipaksakan `0.01 lot` di Akun Standard dengan SL `$5`, risikonya mencapai **$5 (10% modal)** — sepuluh kali lipat di atas batas aman. Di **Akun Cent** (`$50 = 5.000 USC`, 1% = `50 USC`), kamu memakai **0.10 Cent Lot** → `0.10 × $5 × 100 = 50 USC ($0,50)`, tepat 1%.'
              }
            ]
          },
          paragraphsAfter: [
            'Uji langsung perubahan modal, persentase risiko, dan jarak Stop Loss pada **Simulasi Hitung Lot** di bawah ini untuk memastikan kamu menguasai cara perhitungannya:'
          ]
        }
      ],
      keyTakeaways: [
        'Pada Akun Standard Gold: 0.01 lot = $1 per gerak $1, 0.10 lot = $10 per gerak $1, dan 1.00 lot = $100 per gerak $1.',
        'Leverage hanya memperkecil jaminan Margin, bukan memperkecil nilai kerugian per Pip.',
        'Rumus baku Lot Standard Gold: Risiko ($) dibagi (Jarak SL dalam $ × 100) dengan disiplin risiko 0,5%–1% per transaksi.'
      ],
      bridgeNext: 'Setelah menguasai perhitungan Lot dan batas risiko, langkah berikutnya adalah menerapkannya langsung di aplikasi transaksi. Di **Bab 04**, kita membahas navigasi **MetaTrader 5 (MT5)**, setup chart awal, dan perbedaan **5 jenis order** (Market, Limit, dan Stop).',
      conceptBlocks: [
        {
          heading: 'Lot, Leverage, Margin & Rumus Risiko 1% XAU/USD',
          paragraphs: [
            'Pada Akun Standard XAU/USD, 1.00 lot = 100 oz ($100 per gerak $1), 0.10 lot = $10 per gerak $1, dan 0.01 lot = $1 per gerak $1.',
            'Rumus Lot eksak: Lot = Risiko ($) dibagi (Jarak SL dalam $ × 100). Jika hasil perhitungan di bawah 0.01 Standard, gunakan Akun Cent.'
          ]
        }
      ],
      mappingSteps: [
        'Tentukan batas risiko maksimal per transaksi (0,5%–1% dari Equity).',
        'Ukur jarak Stop Loss dalam dolar ($) dari titik entry ke level invalidasi di chart.',
        'Hitung Lot dengan rumus Risiko ($) ÷ (Jarak SL $ × 100); gunakan Akun Cent jika modal kecil menghasilkan angka di bawah 0.01 Standard.'
      ],
      decisionTree: [
        {
          condition: 'Hasil perhitungan rumus lot di Akun Standard adalah 0.004 lot (di bawah batas minimum 0.01 lot).',
          action: 'Jangan membulatkan naik ke 0.01 Standard karena risiko melonjak 2,5x lipat. Gunakan Akun Cent (USC) agar risiko tetap presisi ≤ 1%.'
        },
        {
          condition: 'Jarak SL pada satu setup melebar menjadi $10 (100 pips), dua kali lebih lebar dari biasanya ($5).',
          action: 'Turunkan ukuran Lot menjadi setengahnya agar total risiko dalam dolar tetap sama persis.'
        }
      ],
      validRules: [
        'Ukuran Lot selalu dihitung mundur dari batas risiko 0,5%–1% dan jarak Stop Loss.',
        'Sesuaikan Lot setiap kali jarak Stop Loss berubah.',
        'Pantau Equity secara aktif saat ada posisi terbuka.'
      ],
      invalidRules: [
        'Menggunakan ukuran Lot tetap yang sama untuk jarak SL yang berbeda jauh.',
        'Menganggap Leverage tinggi memperkecil risiko kerugian per Pip.'
      ],
      xauScenario: {
        context: 'Modal Akun Standard $1.000, batas risiko 1% ($10), dan jarak Stop Loss di chart XAU/USD sebesar $5,00 (50 pips).',
        steps: [
          'Hitung batas risiko dalam dolar: 1% × $1.000 = $10.',
          'Hitung ukuran Lot: $10 ÷ ($5,00 × 100) = $10 ÷ 500 = 0.02 Lot.',
          'Verifikasi risiko: 0.02 lot × $5 × 100 = tepat -$10 (sisa saldo $990).'
        ]
      },
      failedCase: {
        title: 'Memasang Lot Acak pada Modal Kecil',
        context: 'Trader bermodal $100 di Akun Standard membuka 0.05 lot dengan jarak SL $6,00.',
        whyFailed: '0.05 lot × $6 × 100 = $30 atau 30% modal hilang dalam satu transaksi.'
      },
      goldenRules: [
        'Lot selalu dihitung dari batas risiko dolar dan jarak SL, bukan ditebak.',
        'Batas risiko 0,5%–1% menjaga akun tetap aman dari Margin Call.'
      ],
      practiceCta: {
        label: 'Catat Aturan Risiko 1% di Jurnal Trading',
        description: 'Catat modal, ukuran lot, dan batas risiko harian sebelum mengeksekusi transaksi.',
        href: '../journal/index.html'
      },
      quiz: [
        {
          question: 'Pada Akun Standard Gold (XAU/USD), kamu membuka posisi 0.01 lot lalu harga bergerak searah sebesar $5,00 (50 pips). Berapa dolar keuntungannya?',
          options: [
            '$0,50',
            '$5,00',
            '$50,00',
            '$500,00'
          ],
          answerIndex: 1,
          explanation: 'Pada Akun Standard Gold, 0.01 lot bernilai $1 per pergerakan $1,00. Pergerakan $5,00 menghasilkan tepat $5,00.'
        },
        {
          question: 'Modal Akun Standard = $1.000, batas risiko = 1% ($10), dan jarak Stop Loss = $5,00 (50 pips). Berapa ukuran Lot yang tepat menurut rumus?',
          options: [
            '0.20 lot',
            '0.10 lot',
            '0.02 lot',
            '0.50 lot'
          ],
          answerIndex: 2,
          explanation: 'Lot = $10 ÷ (5 × 100) = $10 ÷ 500 = 0.02 lot. Verifikasi: 0.02 × $5 × 100 = tepat $10.'
        },
        {
          question: 'Balance akun tercatat $1.000, lalu ada satu posisi terbuka yang sedang floating rugi -$30. Berapakah Equity akun saat ini?',
          options: [
            '$1.030',
            '$1.000',
            '$970',
            '$30'
          ],
          answerIndex: 2,
          explanation: 'Equity = Balance + Floating P/L. Jadi $1.000 + (-$30) = $970.'
        },
        {
          question: 'Pernyataan manakah yang BENAR mengenai Leverage 1:500 dibanding 1:2000 saat membuka ukuran 0.01 lot Standard yang sama?',
          options: [
            'Leverage 1:2000 membuat kerugian per pip menjadi 4 kali lebih kecil',
            'Leverage 1:2000 memperkecil uang jaminan (Margin), tetapi nilai untung/rugi per pip tetap sama persis',
            'Leverage 1:2000 mencegah Margin Call meski tanpa Stop Loss',
            'Leverage 1:500 mengubah 0.01 lot menjadi 1.00 lot'
          ],
          answerIndex: 1,
          explanation: 'Leverage hanya memperkecil jaminan Margin yang ditahan broker; nilai per Pip ditentukan sepenuhnya oleh ukuran Lot.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BAB 04 — PANDUAN PRAKTIS MT5 & 5 JENIS ORDER
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'panduan-mt5-lima-jenis-order',
      number: 4,
      code: '04',
      levelId: 0,
      bookFormat: true,
      title: 'Panduan Praktis MetaTrader 5 (MT5) & 5 Jenis Order (Market, Limit, Stop)',
      subtitle: 'Fungsi empat menu utama MT5, perbedaan Market Execution vs Pending Order, pemasangan Stop Loss dan Take Profit, serta pengaturan chart awal.',
      readMinutes: 9,
      diagramId: 'zero-mt5-order-types',
      diagramAfterSection: 1,
      summary: 'Kuasai empat tab utama MetaTrader 5, aturan lima jenis order (Market Execution, Buy Limit, Sell Limit, Buy Stop, Sell Stop), pemasangan SL/TP wajib, serta setup awal XAUUSD dan 4 alat gambar inti.',
      bookSections: [
        {
          number: '4.1',
          heading: 'Empat Menu Utama pada MetaTrader 5 (MT5)',
          paragraphs: [
            '**MetaTrader 5 (MT5)** adalah platform standar yang digunakan untuk memantau grafik harga dan mengirim pesanan transaksi ke broker. Baik pada perangkat HP maupun desktop, operasional harian berpusat pada empat menu utama:',
            '1. **Quotes (Daftar Harga):** Menampilkan daftar instrumen seperti `XAUUSD` beserta harga **Bid** dan **Ask** secara *real-time*. 2. **Chart (Grafik):** Area untuk membaca candlestick, mengganti timeframe, dan menggambar level harga. 3. **Trade (Posisi Aktif):** Menampilkan Balance, Equity, Free Margin, posisi yang sedang berjalan, serta daftar *pending order*. 4. **History (Riwayat):** Catatan lengkap transaksi yang telah ditutup sebagai bahan evaluasi jurnal.'
          ]
        },
        {
          number: '4.2',
          heading: 'Lima Jenis Order di MT5: Market Execution vs Pending Order',
          paragraphs: [
            'Saat membuka jendela **New Order** di MT5, terdapat dua kategori pesanan: **Market Execution** (masuk seketika di harga saat ini) dan **Pending Order** (pesanan antre otomatis yang baru aktif jika harga menyentuh level tertentu).',
            'Posisi harga pesanan terhadap harga berjalan menentukan jenis Pending Order yang dipilih. Misalkan harga Gold saat ini berada di **`2.650,00`**:'
          ],
          table: {
            caption: 'Perbandingan 5 Jenis Order MT5 (Acuan Harga Saat Ini = 2.650,00)',
            headers: ['Jenis Order', 'Letak Harga Pesanan', 'Mekanisme Eksekusi'],
            rows: [
              ['Market Execution', 'Di harga berjalan (2.650,00)', 'Langsung membuka BUY (di Ask) atau SELL (di Bid) saat tombol ditekan.'],
              ['Buy Limit', 'Di BAWAH harga sekarang (mis. 2.642,00)', 'Menunggu harga turun ke level lebih rendah, lalu otomatis BUY mengharapkan harga berbalik naik.'],
              ['Sell Limit', 'Di ATAS harga sekarang (mis. 2.658,00)', 'Menunggu harga naik ke level lebih tinggi, lalu otomatis SELL mengharapkan harga berbalik turun.'],
              ['Buy Stop', 'Di ATAS harga sekarang (mis. 2.655,00)', 'Menunggu harga menembus naik ke level tersebut, lalu otomatis BUY mengikuti kelanjutan kenaikan.'],
              ['Sell Stop', 'Di BAWAH harga sekarang (mis. 2.645,00)', 'Menunggu harga menembus turun ke level tersebut, lalu otomatis SELL mengikuti kelanjutan penurunan.']
            ]
          },
          callout: {
            tone: 'tip',
            title: 'Perbedaan Prinsip LIMIT vs STOP',
            body: '**LIMIT** digunakan ketika kamu menunggu harga menjemput level yang lebih menguntungkan lalu berbalik arah (Buy Limit di bawah harga, Sell Limit di atas harga). **STOP** digunakan ketika kamu menunggu harga menembus level tertentu lalu melanjutkan arah tembusannya (Buy Stop di atas harga, Sell Stop di bawah harga). Pada strategi ICT di bab-bab berikutnya, mayoritas pending order menggunakan **Buy Limit** dan **Sell Limit**.'
          }
        },
        {
          number: '4.3',
          heading: 'Fungsi Stop Loss (SL) dan Take Profit (TP)',
          paragraphs: [
            'Di sebelah kolom volume Lot pada jendela order MT5 terdapat dua kolom pengaman transaksi: **Stop Loss (SL)** dan **Take Profit (TP)**.',
            '**Stop Loss (SL)** adalah batas harga keluar otomatis untuk menghentikan kerugian jika pergerakan harga berlawanan dengan analisis. SL tetap bekerja di server broker meskipun aplikasi ditutup atau koneksi internet terputus. **Take Profit (TP)** adalah batas harga keluar otomatis untuk mengunci keuntungan saat harga mencapai target.'
          ],
          exampleBox: {
            title: 'Contoh Pengisian Order Lengkap di MT5 (Buy Limit)',
            rows: [
              {
                label: 'Harga Saat Ini',
                detail: '`2.650,00` — rencana menunggu harga turun ke zona entry `2.642,00`.'
              },
              {
                label: 'Jenis Order & Volume',
                detail: 'Pilih **Buy Limit** pada harga `2.642,00` dengan volume **0.02 Lot** (risiko 1% dari modal $1.000).'
              },
              {
                label: 'Stop Loss (SL)',
                detail: 'Isi di **bawah** harga entry: `2.637,00` (jarak `$5,00` = 50 pips → batas rugi maksimal `$10`).'
              },
              {
                label: 'Take Profit (TP)',
                detail: 'Isi di **atas** harga entry: `2.652,00` (jarak `$10,00` = 100 pips → target profit `$20`, R:R **1:2**).'
              }
            ]
          }
        },
        {
          number: '4.4',
          heading: 'Prosedur Verifikasi Sebelum Menekan Tombol Eksekusi',
          paragraphs: [
            'Kesalahan teknis seperti salah mengetik koma Lot (`0.20` alih-alih `0.02`) atau terbalik mengisi SL dan TP dapat dihindari dengan empat pemeriksaan singkat sebelum menekan tombol konfirmasi:',
            '1. **Verifikasi Simbol:** Pastikan instrumen yang aktif benar-benar `XAUUSD`. 2. **Verifikasi Angka Lot:** Periksa ulang posisi desimal agar sesuai hasil rumus risiko. 3. **Verifikasi Arah SL & TP:** Pada posisi BUY, SL wajib di bawah entry dan TP di atas entry; pada posisi SELL, SL wajib di atas entry dan TP di bawah entry. 4. **Cek Status Tombol Place:** Jika tombol *Place* berwarna abu-abu (tidak aktif), penyebab utamanya adalah jenis Limit/Stop yang tertukar terhadap harga berjalan atau posisi SL/TP yang terbalik.'
          ]
        },
        {
          number: '4.5',
          heading: 'Pengaturan Awal MT5 & TradingView: Simbol XAUUSD & Alat Gambar Inti',
          paragraphs: [
            'Agar tampilan chart siap digunakan untuk analisis teknikal sejak hari pertama, selesaikan empat pengaturan dasar berikut:',
            '1. **Tambahkan Simbol Gold:** Di tab **Quotes** MT5, ketuk ikon **`+`** lalu cari `XAUUSD` atau `GOLD` (beberapa broker menambahkan akhiran seperti `XAUUSDm` atau `XAUUSDc` untuk akun Cent) kemudian masukkan ke daftar aktif. 2. **Aktifkan Garis Ask & Bersihkan Chart:** Buka *Chart Settings*, centang **Ask Price Line**, atur warna candle yang jelas (misalnya hijau naik dan merah turun), lalu hapus indikator bawaan yang tidak dipakai. 3. **Gunakan 3 Alat Gambar Utama:** Di menu *Objects* MT5 atau panel alat TradingView, analisis struktur cukup membutuhkan tiga alat inti: **Crosshair** (mengukur jarak pips SL dan TP), **Horizontal Line** (menandai level harga penting seperti PDH/PDL), dan **Rectangle** (menandai area zona FVG atau Order Block). 4. **Simpan ke Favorit:** Tambahkan ketiga alat tersebut beserta **Fibonacci Retracement** (pengaturan angkanya dibahas lengkap di Bab 24) ke daftar favorit agar akses cepat dalam satu klik.'
          ],
          callout: {
            tone: 'tip',
            title: 'Efisiensi Alat Chart',
            body: 'Kamu tidak perlu mengaktifkan puluhan indikator atau alat gambar. Empat alat standar (**Crosshair**, **Horizontal Line**, **Rectangle**, dan **Fibonacci Retracement**) sudah mencakup seluruh kebutuhan analisis ICT dari awal hingga mahir.'
          }
        }
      ],
      keyTakeaways: [
        'MT5 terdiri dari 4 menu utama: Quotes, Chart, Trade, dan History.',
        'Buy Limit di bawah harga & Sell Limit di atas harga (menunggu pantulan); Buy Stop di atas harga & Sell Stop di bawah harga (menunggu tembusan).',
        'Isi SL dan TP sebelum eksekusi, tampilkan XAUUSD + Ask Price Line, dan siapkan 4 alat gambar inti (Crosshair, Horizontal Line, Rectangle, Fibonacci).'
      ],
      bridgeNext: 'Setelah memahami cara mengoperasikan MT5 dan jenis-jenis order, langkah selanjutnya adalah membaca grafik harga itu sendiri. Di **Bab 05**, kita membedah **Anatomi Candlestick (OHLC, Body vs Wick)** serta hubungan matematis antar **Timeframe**.',
      conceptBlocks: [
        {
          heading: 'Navigasi MT5 & 5 Jenis Order',
          paragraphs: [
            'MT5 memiliki 4 layar utama (Quotes, Chart, Trade, History) dan 5 jenis order: Market Execution, Buy Limit, Sell Limit, Buy Stop, dan Sell Stop.',
            'Limit menunggu harga menjemput level lebih baik untuk berbalik arah, sedangkan Stop menunggu harga menembus level untuk melanjutkan arah.'
          ]
        }
      ],
      mappingSteps: [
        'Buka jendela New Order XAUUSD di Akun Demo MT5 dan periksa ulang desimal Lot.',
        'Latih memasang 1 Buy Limit di bawah harga sekarang dan 1 Sell Limit di atas harga sekarang lengkap dengan SL dan TP.',
        'Uji menghapus pending order melalui tab Trade agar terbiasa mengelola pesanan.'
      ],
      decisionTree: [
        {
          condition: 'Tombol Place di MT5 berwarna abu-abu dan tidak dapat diklik saat memasang Pending Order.',
          action: 'Periksa kembali posisi harga pesanan (Buy Limit wajib di bawah harga berjalan, Sell Limit di atas harga berjalan) dan pastikan SL/TP tidak terbalik.'
        },
        {
          condition: 'Ingin membeli di harga lebih rendah di bawah harga saat ini.',
          action: 'Pasang Buy Limit lengkap dengan SL dan TP daripada langsung menekan Market Buy.'
        }
      ],
      validRules: [
        'Periksa simbol XAUUSD, desimal Lot, serta posisi SL/TP sebelum eksekusi.',
        'Gunakan Buy Limit / Sell Limit untuk antre di zona harga yang direncanakan.'
      ],
      invalidRules: [
        'Membuka posisi tanpa mengisi Stop Loss sejak awal.',
        'Memilih Buy Stop padahal ingin menunggu harga turun terlebih dahulu.'
      ],
      xauScenario: {
        context: 'Harga XAU/USD berada di 2.650,00. Rencana menunggu harga turun ke 2.642,00 dengan SL $5 dan target $10.',
        steps: [
          'Pilih Buy Limit di harga 2.642,00 (di bawah harga berjalan).',
          'Masukkan volume 0.02 Lot, SL 2.637,00, dan TP 2.652,00 (R:R 1:2).',
          'Tekan Place agar pesanan tereksekusi otomatis saat harga menyentuh 2.642,00.'
        ]
      },
      failedCase: {
        title: 'Salah Ketik Desimal Lot & Tanpa SL',
        context: 'Trader mengetik 0.20 lot alih-alih 0.02 lot tanpa memasang Stop Loss.',
        whyFailed: 'Risiko meningkat 10 kali lipat dari rencana awal; pergerakan $5 langsung menyebabkan kerugian -$100.'
      },
      goldenRules: [
        'LIMIT untuk menunggu pantulan di harga lebih baik; STOP untuk mengikuti arah tembusan.',
        'Jangan pernah mengeksekusi order tanpa Stop Loss.'
      ],
      practiceCta: {
        label: 'Amati Level Harga di Cockpit Mapping',
        description: 'Perhatikan level harga aktif pada chart Gold untuk mempraktikkan penentuan titik Buy Limit dan Sell Limit.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Harga Gold (XAU/USD) saat ini berada di 2.650,00. Kamu ingin menunggu harga turun ke 2.642,00 baru otomatis membuka posisi BUY. Jenis order MT5 apa yang dipilih?',
          options: [
            'Buy Stop',
            'Buy Limit',
            'Sell Limit',
            'Sell Stop'
          ],
          answerIndex: 1,
          explanation: 'Buy Limit dipasang di bawah harga saat ini untuk menunggu harga turun ke level lebih rendah lalu otomatis membuka BUY.'
        },
        {
          question: 'Harga Gold saat ini 2.650,00. Kamu ingin menunggu harga naik ke 2.658,00 baru otomatis membuka posisi SELL. Jenis order apa yang tepat?',
          options: [
            'Sell Limit',
            'Sell Stop',
            'Buy Limit',
            'Market Execution'
          ],
          answerIndex: 0,
          explanation: 'Sell Limit dipasang di atas harga saat ini untuk menunggu harga naik ke level lebih tinggi lalu otomatis membuka SELL.'
        },
        {
          question: 'Kamu memasang Buy Limit di 2.642,00. Di mana letak Stop Loss (SL) dan Take Profit (TP) yang benar?',
          options: [
            'SL di 2.652,00 (di atas entry) dan TP di 2.637,00 (di bawah entry)',
            'SL di 2.637,00 (di bawah entry) dan TP di 2.652,00 (di atas entry)',
            'SL dan TP keduanya dipasang di 2.642,00',
            'SL tidak diperlukan selama TP sudah diisi'
          ],
          answerIndex: 1,
          explanation: 'Pada posisi BUY, target profit (TP) berada di atas harga entry dan batas rugi (SL) berada di bawah harga entry.'
        },
        {
          question: 'Saat memasang pending order di MT5, tombol "Place" berwarna abu-abu dan tidak bisa diklik. Apa penyebab paling umumnya?',
          options: [
            'Aplikasi MT5 mengalami kerusakan permanen',
            'Posisi harga order, SL, atau TP tidak sesuai aturan (misalnya memilih Buy Limit di atas harga saat ini)',
            'Akun Demo tidak mendukung pending order',
            'Target Take Profit terlalu tinggi'
          ],
          answerIndex: 1,
          explanation: 'MT5 menonaktifkan tombol Place jika letak harga tidak sesuai jenis Limit/Stop atau posisi SL/TP terbalik.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BAB 05 — MEMBACA CHART, ANATOMI CANDLESTICK & TIMEFRAME
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'membaca-chart-candlestick-nol',
      number: 5,
      code: '05',
      levelId: 0,
      bookFormat: true,
      title: 'Membaca Chart, Anatomi Candlestick (Body vs Wick) & Konsep Timeframe',
      subtitle: 'Empat komponen harga OHLC pada setiap candlestick, perbedaan makna Body dan Wick, pentingnya menunggu Candle Close, serta hubungan antar Timeframe.',
      readMinutes: 10,
      diagramId: 'candlestick-anatomy',
      diagramAfterSection: 1,
      summary: 'Pahami struktur OHLC pada candlestick, arti teknikal Body vs Wick, aturan wajib menunggu penutupan candle (Candle Close), dan struktur matematis hubungan antar Timeframe dari D1 hingga M5.',
      bookSections: [
        {
          number: '5.1',
          heading: 'Pengertian Candlestick dan Empat Komponen Harga (OHLC)',
          paragraphs: [
            '**Candlestick** adalah grafik batang yang merangkum pergerakan harga pasar dalam satu periode waktu tertentu. Setiap satu batang candlestick merekam **empat data harga (OHLC)**:',
            '1. **Open:** Harga saat periode waktu candle dimulai. 2. **High:** Harga tertinggi yang sempat tercapai selama periode tersebut. 3. **Low:** Harga terendah yang sempat tersentuh selama periode tersebut. 4. **Close:** Harga penutupan tepat saat periode waktu candle berakhir.',
            'Bagian persegi panjang tebal antara Open dan Close disebut **Body**, sedangkan garis tipis di atas atau di bawah body disebut **Wick** (atau *Shadow*). Jika harga ditutup lebih tinggi daripada pembukaan (`Close > Open`), candle bersifat **Bullish (Naik)**. Jika ditutup lebih rendah (`Close < Open`), candle bersifat **Bearish (Turun)**.'
          ],
          exampleBox: {
            title: 'Contoh Pembacaan 1 Batang Candle Bullish M15 (15 Menit)',
            rows: [
              {
                label: 'Open = 2.650,00',
                detail: 'Pukul 14:00 WITA, candle 15 menit dibuka pada harga `2.650,00`.'
              },
              {
                label: 'Low = 2.648,50',
                detail: 'Harga sempat turun `$1,50` ke `2.648,50` sebelum kembali naik → membentuk **Wick bawah sebesar `$1,50`**.'
              },
              {
                label: 'High = 2.655,00',
                detail: 'Harga sempat mencapai titik tertinggi sesi 15 menit tersebut di `2.655,00`.'
              },
              {
                label: 'Close = 2.654,20',
                detail: 'Pukul 14:15 WITA candle ditutup di `2.654,20` → terbentuk **Body Bullish sebesar `$4,20`** dengan **Wick atas `$0,80`**, menunjukkan dominasi pembeli selama periode tersebut.'
              }
            ]
          }
        },
        {
          number: '5.2',
          heading: 'Makna Body vs Wick dan Aturan Wajib Menunggu Candle Close',
          paragraphs: [
            'Dalam metodologi ICT yang akan dipelajari mulai Bab 07, kamu tidak perlu menghafal puluhan nama pola candlestick klasik. Pembacaan harga berfokus pada perbedaan objektif antara **Body** dan **Wick**:',
            '1. **Body menunjukkan kendali dan penerimaan harga yang sah:** Jika harga menembus suatu level dan **Body ditutup melewati level tersebut**, artinya pihak yang dominan mampu mempertahankan harga di area baru. 2. **Wick menunjukkan penolakan harga (Rejection) atau Sweep sementara:** Jika harga sempat melewati suatu level tetapi sebelum penutupan ditarik kembali sehingga hanya menyisakan **Wick panjang** sementara Body tutup di dalam, artinya area tersebut mengalami penolakan kuat.',
            'Konsekuensi langsung dari prinsip ini adalah aturan **wajib menunggu Candle Close**. Selama durasi waktu belum berakhir, bentuk candle masih dapat berubah drastis. Hanya harga penutupan resmi (**Candle Close**) yang dapat dijadikan dasar keputusan analisis.'
          ],
          callout: {
            tone: 'warn',
            title: 'Risiko Mengambil Keputusan Sebelum Candle Close',
            body: 'Pada menit ke-6 candle M15, harga dapat tampak menembus batas atas dengan body hijau penuh. Namun jika tekanan jual masuk sebelum menit ke-15, harga berbalik turun dan candle ditutup dengan wick atas panjang. Trader yang langsung BUY sebelum candle tutup terjebak pada titik puncak penolakan.'
          }
        },
        {
          number: '5.3',
          heading: 'Konsep Timeframe dan Hubungan Matematis Antar Timeframe',
          paragraphs: [
            'Pada bagian atas chart MT5 terdapat pilihan **M1, M5, M15, H1, H4, D1, W1**. Pilihan tersebut adalah **Timeframe**, yaitu durasi waktu yang dibutuhkan untuk membentuk **satu batang candlestick** (misalnya `M15` = 15 menit per candle, `H1` = 1 jam per candle, `D1` = 1 hari per candle).',
            'Seluruh timeframe menampilkan data pergerakan harga pasar yang sama, hanya dengan tingkat rincian berbeda. Secara matematis, **satu candle timeframe besar tersusun dari gabungan beberapa candle timeframe kecil di dalamnya** (`1 H1 = 4 M15 = 12 M5`).',
            'Dalam praktik analisis **Top-Down (dari besar ke kecil)**, timeframe besar digunakan untuk membaca arah utama dan level penting, sedangkan timeframe kecil digunakan untuk melihat detail reaksi dan waktu eksekusi:'
          ],
          table: {
            caption: 'Hubungan Matematis & Peran Setiap Timeframe dalam Analisis ICT',
            headers: ['Timeframe', 'Durasi 1 Candle', 'Susunan Candle di Dalamnya', 'Fungsi Utama dalam Analisis'],
            rows: [
              ['D1 (Daily)', '1 Hari Trading', '~23–24 candle H1', 'Menentukan arah harian (Daily Bias) & level PDH/PDL'],
              ['H4 (4 Jam)', '4 Jam', '4 candle H1 / 16 candle M15', 'Membaca struktur pasar utama & zona institusional besar'],
              ['H1 (1 Jam)', '1 Jam', '4 candle M15 / 12 candle M5', 'Menentukan Dealing Range & area tunggu utama'],
              ['M15 (15 Menit)', '15 Menit', '3 candle M5 / 15 candle M1', 'Menyaring zona entry & membaca sweep sesi intraday'],
              ['M5 (5 Menit)', '5 Menit', '5 candle M1', 'Konfirmasi presisi struktur kecil sebelum eksekusi order']
            ]
          }
        }
      ],
      keyTakeaways: [
        'Satu candlestick merekam empat titik harga: Open, High, Low, dan Close (OHLC) dalam satu periode timeframe.',
        'Body mencerminkan hasil kendali harga saat penutupan, sedangkan Wick panjang mencerminkan penolakan atau sweep sementara.',
        'Satu candle timeframe besar tersusun dari beberapa candle timeframe kecil (1 H1 = 4 M15 = 12 M5), dan keputusan sah selalu menunggu Candle Close.'
      ],
      bridgeNext: 'Setelah menguasai pembacaan candlestick dan hubungan antar timeframe, materi penutup Bagian I adalah memahami kapan waktu terbaik untuk menganalisis dan memperdagangkan emas. Di **Bab 06**, kita membahas **Karakter Volatilitas Gold (XAU/USD), Jadwal 3 Sesi Pasar Dunia (WITA), dan Aturan Akhir Pekan**.',
      conceptBlocks: [
        {
          heading: 'Anatomi Candlestick OHLC, Body vs Wick & Timeframe',
          paragraphs: [
            'Candlestick merekam Open, High, Low, dan Close. Body menunjukkan kendali harga saat penutupan, sedangkan Wick panjang menunjukkan penolakan atau sweep sementara.',
            'Satu candle timeframe besar tersusun dari beberapa candle timeframe kecil (1 H1 = 4 M15 = 12 M5). Keputusan valid selalu menunggu Candle Close.'
          ]
        }
      ],
      mappingSteps: [
        'Buka chart XAUUSD di H1 lalu identifikasi titik Open, High, Low, dan Close pada 1 candle terakhir.',
        'Beralih ke M15 dan cocokkan 4 batang candle yang menyusun 1 candle H1 tersebut.',
        'Bandingkan candle yang ditutup dengan Body penuh terhadap candle yang menyisakan Wick panjang.'
      ],
      decisionTree: [
        {
          condition: 'Harga menembus level atas pada candle M15, tetapi waktu candle masih tersisa 8 menit.',
          action: 'Tunggu hingga waktu berakhir dan candle benar-benar close sebelum mengambil keputusan.'
        },
        {
          condition: 'Harga sempat naik melewati batas atas, lalu tutup di bawah batas dengan Wick atas panjang.',
          action: 'Baca sebagai penolakan harga (rejection), bukan tembusan naik yang sah.'
        }
      ],
      validRules: [
        'Selalu tunggu Candle Close sebelum menyimpulkan sebuah level tertembus.',
        'Gunakan timeframe besar (D1/H4/H1) untuk arah dan timeframe kecil (M15/M5) untuk detail eksekusi.'
      ],
      invalidRules: [
        'Mengambil keputusan entry saat candle baru berjalan sebagian waktu.',
        'Hanya memantau M1 tanpa membaca konteks H1 dan M15.'
      ],
      xauScenario: {
        context: 'Candle M15 XAU/USD dibuka di 2.650,00, turun ke 2.648,50, naik ke 2.655,00, dan ditutup di 2.654,20.',
        steps: [
          'Wick bawah sebesar $1,50 menunjukkan penolakan harga di area 2.648,50.',
          'Body Bullish sebesar $4,20 menunjukkan pembeli mendominasi hingga penutupan candle.'
        ]
      },
      failedCase: {
        title: 'Masuk Posisi Sebelum Candle Close',
        context: 'Trader melihat candle M15 hijau panjang pada menit ke-5 lalu langsung BUY tanpa menunggu penutupan.',
        whyFailed: 'Pada 10 menit tersisa harga berbalik turun dan candle ditutup merah dengan wick atas panjang, membuat posisi BUY langsung merugi.'
      },
      goldenRules: [
        'Body mencerminkan hasil penutupan yang sah; Wick mencerminkan penolakan atau sweep sementara.',
        'Satu candle H1 terdiri dari 4 candle M15 dan 12 candle M5.'
      ],
      practiceCta: {
        label: 'Amati Candlestick Live M15 & M5 di Beranda',
        description: 'Bandingkan langsung bentuk Body dan Wick candle Gold pada tombol pergantian M15 dan M5.',
        href: '../../index.html'
      },
      quiz: [
        {
          question: 'Sebuah candle M15 XAU/USD memiliki Open 2.650,00, Low 2.648,50, High 2.655,00, dan Close 2.654,20. Berapakah panjang Body Bullish candle tersebut?',
          options: [
            '$1,50',
            '$4,20',
            '$6,50',
            '$0,80'
          ],
          answerIndex: 1,
          explanation: 'Body diukur dari jarak antara Open dan Close: 2.654,20 - 2.650,00 = $4,20.'
        },
        {
          question: 'Mengapa sebuah level harga belum boleh disimpulkan "tertembus sah" saat candle masih berjalan (belum close)?',
          options: [
            'Karena broker melarang transaksi sebelum menit ke-15',
            'Karena sebelum waktu candle berakhir, harga masih dapat berbalik tajam hingga saat close hanya tersisa Wick penolakan',
            'Karena candle berjalan tidak memiliki harga Bid',
            'Karena warna candle selalu berubah di detik terakhir'
          ],
          answerIndex: 1,
          explanation: 'Hanya penutupan resmi (Candle Close) yang sah dibaca sebagai fakta. Pergerakan di tengah durasi sering berbalik menjadi wick penolakan.'
        },
        {
          question: 'Secara matematis, satu batang candle H1 (1 Jam) tersusun dari berapa banyak candle M15 dan M5?',
          options: [
            '2 candle M15 atau 6 candle M5',
            '4 candle M15 atau 12 candle M5',
            '6 candle M15 atau 15 candle M5',
            '15 candle M15 atau 60 candle M5'
          ],
          answerIndex: 1,
          explanation: '60 menit ÷ 15 menit = 4 candle M15, dan 60 menit ÷ 5 menit = 12 candle M5.'
        },
        {
          question: 'Dalam pembacaan candlestick ICT, apa perbedaan utama antara Body dan Wick?',
          options: [
            'Body menunjukkan kendali dan penerimaan harga yang sah saat penutupan, sedangkan Wick panjang menunjukkan penolakan atau sweep sementara',
            'Wick lebih kuat dibandingkan Body untuk mengonfirmasi tembusan level',
            'Body hanya berlaku pada akun Demo',
            'Body dan Wick tidak memiliki perbedaan makna'
          ],
          answerIndex: 0,
          explanation: 'Body yang ditutup melewati level mencerminkan dominasi nyata, sedangkan Wick panjang menunjukkan harga sempat masuk lalu ditolak kembali.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BAB 06 — KARAKTER UNIK GOLD, SESI PASAR DUNIA & ATURAN AKHIR PEKAN
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'karakter-xauusd-spread-wita',
      number: 6,
      code: '06',
      levelId: 0,
      bookFormat: true,
      title: 'Karakter Unik Gold (XAU/USD), Sesi Pasar Dunia & Aturan Akhir Pekan',
      subtitle: 'Faktor penggerak volatilitas XAU/USD, jadwal tiga sesi pasar dunia dalam konversi waktu WITA (EDT dan EST), risiko jam Rollover, serta aturan tutup akhir pekan.',
      readMinutes: 9,
      diagramId: 'xau-volatility-sessions',
      diagramAfterSection: 1,
      summary: 'Pahami karakteristik volatilitas harian XAU/USD, jadwal tiga sesi perdagangan global (Asia, London, New York) dalam waktu WITA (EDT +12 / EST +13), risiko pelebaran Spread saat Rollover, dan jadwal tutup akhir pekan.',
      bookSections: [
        {
          number: '6.1',
          heading: 'Karakteristik Pergerakan dan Volatilitas Gold (XAU/USD)',
          paragraphs: [
            'Pergerakan **Gold (`XAU/USD`)** memiliki karakter volatilitas yang jauh lebih tinggi dibandingkan pasangan mata uang mayor seperti `EUR/USD` atau `GBP/USD`. Jika pasangan mata uang mayor rata-rata bergerak 50 hingga 80 pips per hari, Gold secara rutin bergerak **$20 hingga $40 (200 hingga 400 pips)** dalam satu hari perdagangan — dan dapat menempuh $15 hanya dalam 15 menit saat rilis data ekonomi utama Amerika Serikat.',
            'Tingginya volatilitas Gold dipengaruhi oleh empat faktor makro utama: 1. **Kekuatan Indeks Dolar AS (`DXY`):** Karena Gold dihargai dalam Dolar AS, penguatan Dolar cenderung menekan harga Gold, sedangkan pelemahan Dolar cenderung mendorong Gold naik. 2. **Kebijakan Suku Bunga The Fed:** Perubahan ekspektasi suku bunga dan imbal hasil obligasi AS (`US10Y`) berdampak langsung pada minat pasar terhadap emas. 3. **Data Inflasi & Ketenagakerjaan AS:** Rilis rutin seperti CPI, NFP, dan FOMC memicu lonjakan volume institusional. 4. **Status Aset Lindung Nilai (*Safe-Haven*):** Ketidakpastian ekonomi atau geopolitik global meningkatkan permintaan terhadap emas.',
            'Volatilitas tinggi memberikan peluang rasio Risk-to-Reward (`R:R`) yang besar setiap hari, tetapi sekaligus mempercepat risiko kerugian jika transaksi dilakukan tanpa Stop Loss, ukuran Lot terukur, dan pemilihan waktu pasar yang tepat.'
          ]
        },
        {
          number: '6.2',
          heading: 'Jadwal 3 Sesi Pasar Dunia dan Konversi Waktu WITA (EDT vs EST)',
          paragraphs: [
            'Pasar Gold global beroperasi hampir 24 jam sehari dari Senin hingga Jumat, tetapi likuiditas dan kualitas pergerakan harga tidak merata sepanjang hari. Aktivitas perdagangan terkonsentrasi pada tiga sesi pusat keuangan utama secara berurutan: **Sesi Asia**, **Sesi London**, dan **Sesi New York**.',
            'Dalam mengonversi waktu acuan New York ke **WITA (UTC+8)**, kamu wajib memperhatikan sistem **Daylight Saving Time** di Amerika Serikat yang bergeser 1 jam dua kali setahun: 1. **Musim Panas AS (`EDT`, UTC-4, Maret–November):** Waktu **WITA lebih cepat +12 jam** dari waktu New York. 2. **Musim Dingin AS (`EST`, UTC-5, November–Maret):** Waktu **WITA lebih cepat +13 jam** dari waktu New York.'
          ],
          table: {
            caption: 'Jadwal dan Karakter 3 Sesi Pasar Gold Dunia (Acuan New York → WITA)',
            headers: ['Sesi Pasar', 'Jam WITA (EDT · +12)', 'Jam WITA (EST · +13)', 'Karakteristik Pergerakan di XAU/USD'],
            rows: [
              ['Sesi Asia', '08:00 – 12:00 WITA', '09:00 – 13:00 WITA', 'Volume relatif rendah; harga cenderung bergerak dalam rentang sempit membentuk kotak akumulasi (**Asia Range**).'],
              ['Sesi London', '14:00 – 17:00 WITA', '15:00 – 18:00 WITA', 'Volume institusi Eropa masuk; sering diawali sweep terhadap batas Asia Range lalu diikuti pergerakan berarah.'],
              ['Sesi New York', '19:00 – 23:00 WITA', '20:00 – 00:00 WITA', 'Puncak volume dan volatilitas harian akibat pertemuan sesi London–New York serta jadwal rilis berita ekonomi AS.']
            ]
          },
          callout: {
            tone: 'tip',
            title: 'Disiplin Pemilihan Waktu Transaksi',
            body: 'Di luar jam aktif London dan New York, pergerakan Gold cenderung lambat dan sering bergerak bolak-balik tanpa arah jelas. Pembahasan jendela waktu presisi ICT (*Killzone*, *Silver Bullet*, dan *Macro 20 menit*) akan dibedah lengkap pada **Bab 16**.'
          }
        },
        {
          number: '6.3',
          heading: 'Dua Periode Waktu Berisiko Tinggi: Jam Rollover & Tutup Akhir Pekan',
          paragraphs: [
            'Selain mengetahui jam aktif pasar, terdapat dua periode waktu yang wajib dihindari untuk membuka posisi maupun menahan posisi scalping dengan Stop Loss ketat:',
            '1. **Jam Rollover Harian (`17:00–18:00 NY`):** Setara pukul **`05:00–06:00 WITA` (EDT)** atau **`06:00–07:00 WITA` (EST)**. Pada satu jam pergantian hari kliring antarbank ini, pasar tutup sementara dan likuiditas sangat menipis. Akibatnya, **Spread dapat melebar 5 hingga 10 kali lipat** dari kondisi normal dan mudah memicu Stop Loss ketat meskipun harga tengah hampir tidak bergeser. 2. **Tutup Akhir Pekan (*Weekend Closure*):** Pasar Gold dunia tutup penuh mulai **Jumat pukul 17:00 NY** (`Sabtu 05:00 WITA` EDT / `06:00 WITA` EST) hingga **Minggu pukul 17:00 NY** (`Senin 05:00 WITA` EDT / `06:00 WITA` EST). Menahan posisi jangka pendek melewati akhir pekan berisiko terkena lompatan harga pembukaan Senin pagi (**Weekend Gap**) yang dapat menembus Stop Loss di luar harga yang ditetapkan.'
          ],
          callout: {
            tone: 'warn',
            title: 'Status Chart pada Hari Sabtu dan Minggu',
            body: 'Selama pasar tutup di akhir pekan, tidak ada transaksi pasar global dan candle sah terakhir adalah penutupan Jumat 17:00 NY. Gunakan waktu akhir pekan untuk mengevaluasi jurnal transaksi, mempelajari materi, dan memetakan level penting pekan berikutnya.'
          }
        }
      ],
      keyTakeaways: [
        'Gold (`XAU/USD`) memiliki rentang gerak harian tinggi ($20–$40 / 200–400 pips) yang dipengaruhi DXY, suku bunga The Fed, data ekonomi AS, dan sentimen safe-haven.',
        'Konversi WITA (UTC+8) terhadap waktu New York adalah **+12 jam saat EDT** (Maret–Nov) dan **+13 jam saat EST** (Nov–Maret).',
        'Sesi Asia membentuk rentang awal (Asia Range), sedangkan ekspansi volume utama terjadi pada **Sesi London** dan **Sesi New York**.',
        'Hindari transaksi saat **Jam Rollover harian** (pelebaran Spread ekstrem) dan hindari menahan posisi scalping melewati **Tutup Akhir Pekan** (Jumat 17:00 NY – Minggu 17:00 NY).'
      ],
      bridgeNext: 'Dengan berakhirnya Bab 06, seluruh fondasi operasional **Bagian I** telah selesai. Mulai **Bab 07 (Bagian II)**, kita masuk ke analisis teknikal murni tanpa indikator: **Struktur Pasar Murni: Swing High/Low, Tren Naik, Tren Turun, dan Konsolidasi**.',
      conceptBlocks: [
        {
          heading: 'Karakter Gold, 3 Sesi Pasar WITA & Aturan Rollover/Weekend',
          paragraphs: [
            'XAU/USD bergerak agresif ($20–$40/hari) mengikuti ritme Asia (rentang awal), London (ekspansi/sweep), dan New York (puncak volume).',
            'Konversi WITA adalah NY +12 jam saat EDT dan NY +13 jam saat EST. Hindari jam rollover harian (spread melebar) dan tutup akhir pekan Jumat 17:00 NY s.d. Minggu 17:00 NY.'
          ]
        }
      ],
      mappingSteps: [
        'Periksa apakah waktu acuan Amerika saat ini berada pada musim panas (EDT, +12 WITA) atau musim dingin (EST, +13 WITA).',
        'Tandai rentang Sesi Asia setiap pagi sebelum memantau ekspansi pada Sesi London dan New York.',
        'Tutup posisi scalping sebelum jam rollover harian maupun penutupan pasar Jumat sore waktu New York.'
      ],
      decisionTree: [
        {
          condition: 'Waktu menunjukkan pukul 05:15 WITA (jam rollover harian) dan terlihat peluang di chart.',
          action: 'Hindari eksekusi. Spread pada jam rollover dapat melebar beberapa kali lipat dan memicu Stop Loss secara tidak normal.'
        },
        {
          condition: 'Hari Sabtu atau Minggu dan grafik harga berhenti bergerak.',
          action: 'Pasar sedang tutup resmi (Jumat 17:00 NY – Minggu 17:00 NY). Fokuskan waktu pada evaluasi jurnal dan latihan baca struktur historis.'
        }
      ],
      validRules: [
        'Fokuskan aktivitas analisis dan eksekusi pada jendela aktif Sesi London dan New York.',
        'Sesuaikan jadwal sesi WITA dengan pergantian musim EDT (+12 jam) dan EST (+13 jam).'
      ],
      invalidRules: [
        'Membuka transaksi pada jam rollover harian saat Spread melebar tajam.',
        'Menahan posisi scalping melewati penutupan akhir pekan dengan risiko Weekend Gap.'
      ],
      xauScenario: {
        context: 'Hari Selasa (musim EDT, +12 WITA). Sesi Asia 08:00–12:00 WITA bergerak dalam rentang sempit $6 antara 2.648,00–2.654,00.',
        steps: [
          'Tidak membuka posisi di tengah rentang sempit Sesi Asia.',
          'Menjelang Sesi London (14:00 WITA), memantau arah penembusan atau sweep terhadap batas Asia Range.'
        ]
      },
      failedCase: {
        title: 'Stop Loss Tersentuh Pelebaran Spread saat Rollover',
        context: 'Trader membiarkan posisi scalping terbuka dengan SL $2,00 melewati pukul 05:00 WITA (17:00 NY).',
        whyFailed: 'Spread melonjak mendadak dari $0,30 menjadi $2,50 pada jam pergantian hari kliring bank sehingga SL tersentuh meski harga tengah relatif stabil.'
      },
      goldenRules: [
        'Kualitas transaksi bergantung pada waktu pasar: fokus pada likuiditas sehat di Sesi London dan New York.',
        'Jumat 17:00 NY hingga Minggu 17:00 NY adalah jadwal tutup pasar resmi akhir pekan.'
      ],
      practiceCta: {
        label: 'Pantau Jam Sesi Aktif di Cockpit Mapping',
        description: 'Amati pembagian sesi Asia, London, dan New York secara langsung pada chart XAU/USD.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Saat Amerika Serikat berada pada musim panas (EDT, UTC-4), pukul 02:00 waktu New York setara dengan pukul berapa di WITA (UTC+8)?',
          options: [
            '12:00 WITA',
            '14:00 WITA (NY + 12 jam)',
            '15:00 WITA',
            '19:00 WITA'
          ],
          answerIndex: 1,
          explanation: 'Pada musim panas AS (EDT, UTC-4), waktu WITA (UTC+8) lebih cepat 12 jam. Jadi 02:00 NY + 12 jam = 14:00 WITA.'
        },
        {
          question: 'Ketika Amerika Serikat beralih ke musim dingin (EST, UTC-5), bagaimana pergeseran jadwal sesi di WITA dibandingkan saat EDT?',
          options: [
            'Bergeser 1 jam lebih awal di WITA (NY + 11 jam)',
            'Bergeser 1 jam lebih lambat di WITA (NY + 13 jam)',
            'Tidak pernah berubah sepanjang tahun',
            'Bergeser 5 jam lebih cepat'
          ],
          answerIndex: 1,
          explanation: 'Saat EST (UTC-5), selisih ke WITA (UTC+8) menjadi +13 jam sehingga seluruh jadwal sesi bergeser 1 jam lebih lambat.'
        },
        {
          question: 'Mengapa trader scalping Gold wajib menghindari eksekusi atau menahan SL ketat pada jam Rollover harian (sekitar 05:00–06:00 WITA saat EDT)?',
          options: [
            'Karena harga Gold selalu turun pada jam tersebut',
            'Karena likuiditas antarbank menipis saat pergantian hari kliring sehingga Spread dapat melebar 5–10 kali lipat dan memicu SL ketat',
            'Karena akun Demo dinonaktifkan setiap pagi',
            'Karena chart hanya menampilkan timeframe M1'
          ],
          answerIndex: 1,
          explanation: 'Saat jam rollover kliring harian (17:00 NY), spread melebar signifikan sehingga posisi dengan SL tipis sangat rawan tersentuh.'
        },
        {
          question: 'Kapankah jadwal tutup resmi akhir pekan (Weekend Closure) pasar Gold dunia?',
          options: [
            'Sabtu 12:00 NY sampai Minggu 12:00 NY',
            'Jumat 17:00 NY sampai Minggu 17:00 NY',
            'Jumat 08:00 WITA sampai Senin 14:00 WITA',
            'Pasar Gold tidak pernah tutup di akhir pekan'
          ],
          answerIndex: 1,
          explanation: 'Pasar Gold dunia tutup resmi mulai Jumat pukul 17:00 waktu New York hingga Minggu pukul 17:00 waktu New York.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
