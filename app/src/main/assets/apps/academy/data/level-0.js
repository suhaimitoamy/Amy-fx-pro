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
      title: 'Apa Itu Trading, Cara Kerja Broker & Memilih Akun (Demo, Cent, Standard)',
      subtitle: 'Memahami dari nol bagaimana uang bisa dihasilkan dari naik maupun turunnya harga emas dunia, peran broker, dan jenis akun paling aman untuk belajar.',
      readMinutes: 8,
      diagramId: 'zero-account-types',
      diagramAfterSection: 2,
      summary: 'Pahami apa sebenarnya trading XAU/USD (Gold), logika dua arah (Buy & Sell) berbasis probabilitas, peran broker, serta kenapa pemula wajib melewati Akun Demo dan Akun Cent sebelum Akun Standard.',
      bookSections: [
        {
          number: '1.1',
          heading: 'Apa Itu Trading Gold (XAU/USD) Sebenarnya?',
          paragraphs: [
            'Banyak orang mengira trading emas berarti kamu harus pergi ke toko emas, membeli emas batangan fisik, menyimpannya di lemari, lalu menunggu bertahun-tahun sampai harganya naik baru dijual kembali. Di dunia trading online, cara kerjanya berbeda.',
            'Saat kamu membuka grafik **XAU/USD** di aplikasi trading, kode **XAU** adalah simbol internasional untuk 1 troy ounce emas murni (~31,1 gram), sedangkan **USD** adalah Dolar Amerika Serikat. Jadi, angka `2.650,00` di layar berarti **harga 1 troy ounce emas dunia saat ini setara $2.650**.',
            'Dalam trading online, kamu tidak menyimpan emas fisik di rumah. Kamu memperdagangkan **selisih perubahan harganya**. Yang paling menarik sekaligus membedakannya dari menabung emas biasa adalah: di pasar ini kamu bisa mencari keuntungan dari **dua arah** — baik saat harga sedang naik maupun saat harga sedang turun.'
          ],
          exampleBox: {
            title: 'Dua Arah Transaksi di Pasar Gold',
            rows: [
              {
                label: 'Posisi BUY (Beli)',
                detail: 'Kamu memprediksi harga emas akan **naik**. Misalnya kamu buka BUY di `2.650,00` lalu menutupnya saat harga naik ke `2.660,00`. Selisih kenaikan **+$10,00** menjadi keuntunganmu.'
              },
              {
                label: 'Posisi SELL (Jual)',
                detail: 'Kamu memprediksi harga emas akan **turun**. Misalnya kamu buka SELL di `2.660,00` lalu menutupnya saat harga turun ke `2.650,00`. Selisih penurunan **$10,00** juga menjadi keuntunganmu.'
              }
            ]
          }
        },
        {
          number: '1.2',
          heading: 'Trading Itu Permainan Probabilitas, Bukan Tebak-Tebakan Pasti Benar',
          paragraphs: [
            'Sebelum melangkah lebih jauh, ada satu pola pikir yang harus ditanamkan sejak halaman pertama buku ini: **tidak ada satu pun trader, bank, atau strategi di dunia yang bisa menebak arah pasar 100% benar setiap saat.**',
            'Trader pemula biasanya mencari "ilmu sakti" yang tidak pernah kalah. Begitu rugi dua kali berturut-turut, mereka panik, mengira strateginya rusak, lalu mengganti teknik atau membalas dendam dengan ukuran transaksi lebih besar. Padahal, kerugian kecil adalah **biaya operasional normal** dalam trading — persis seperti toko kopi yang harus membayar listrik dan bahan baku sebelum mencetak laba bersih.',
            'Kunci profit jangka panjang terletak pada kombinasi **tingkat keberhasilan (Winrate)** dan **perbandingan Risiko terhadap Imbalan (Risk to Reward / R:R)**. Kalau setiap kali salah kamu hanya rugi **$10**, tetapi setiap kali benar kamu untung **$20** (rasio **1:2**), maka kamu bahkan tidak perlu benar lebih dari separuh waktu untuk tetap menghasilkan uang.'
          ],
          exampleBox: {
            title: 'Bukti Matematika Sederhana (10 Transaksi · R:R 1:2)',
            rows: [
              {
                label: '5 Kali Kalah (50%)',
                detail: '5 transaksi × rugi `$10` = **-$50**'
              },
              {
                label: '5 Kali Menang (50%)',
                detail: '5 transaksi × untung `$20` = **+$100**'
              },
              {
                label: 'Hasil Bersih',
                detail: '`+$100 - $50` = **+$50 Profit Bersih** — padahal separuh analisismu meleset!'
              }
            ]
          }
        },
        {
          number: '1.3',
          heading: 'Apa Peran Broker, dan Bagaimana Cara Memilih Jenis Akun?',
          paragraphs: [
            'Sebagai trader individu, kamu tidak bisa langsung menelpon bank besar di London atau New York untuk membeli 1 kontrak emas. Di sinilah **Broker** berperan sebagai jembatan resmi. Broker menyediakan sambungan harga langsung dari pasar dunia, aplikasi transaksi seperti **MetaTrader 5 (MT5)**, serta tempat menyimpan saldo akunmu.',
            'Di dalam sebuah broker, kamu biasanya akan dihadapkan pada **tiga jenis akun utama**. Memilih akun yang salah di minggu pertama adalah penyebab paling umum pemula kehilangan modal sebelum sempat belajar apa-apa:'
          ],
          table: {
            caption: 'Perbandingan 3 Jenis Akun Trading di Broker',
            headers: ['Jenis Akun', 'Sumber Dana', 'Cara Tampil Saldo', 'Cocok Untuk Siapa?'],
            rows: [
              ['Akun Demo', 'Uang virtual gratis', 'Misal $1.000 virtual', 'Pemula nol: latihan tombol MT5, pasang SL/TP & uji aturan tanpa risiko rugi.'],
              ['Akun Cent (USC)', 'Uang asli kecil', '$20 tampil jadi 2.000 USC', 'Tahap transisi: melatih emosi uang asli dengan risiko per transaksi hanya beberapa sen.'],
              ['Akun Standard', 'Uang asli penuh', '$1.000 tampil $1.000 USD', 'Trader yang sudah konsisten & punya modal cukup agar risiko tetap ≤ 1% per trade.']
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Cerita Nyata Jebakan Pemula: Salah Pilih Akun di Minggu Pertama',
            body: 'Bayangkan kamu baru belajar 3 hari lalu langsung menyetor $25 ke Akun Standard. Di Akun Standard Gold, ukuran terkecil (0.01 lot) membuat setiap gerak $10 bernilai $10. Artinya, baru 2 kali salah arah sedikit saja, hampir seluruh uangmu habis! Bandingkan jika $25 itu dimasukkan ke Akun Cent (2.500 USC): 1 kali rugi $10 pergerakan harga hanya memotong 10 sen ($0,10). Kamu punya ratusan kali kesempatan belajar tanpa panik.'
          }
        },
        {
          number: '1.4',
          heading: 'Cara Mengenali Broker Sehat vs Penipuan Berkedok Trading',
          paragraphs: [
            'Sebelum membuka akun di mana pun, terapkan tiga saringan keamanan sederhana: pertama, **kamu memegang kendali penuh atas akunmu sendiri** — tidak pernah menitipkan uang kepada seseorang yang menjanjikan "profit tetap 1% setiap hari". Di pasar nyata, harga selalu berfluktuasi sehingga janji profit tetap hampir pasti adalah skema penipuan.',
            'Kedua, pastikan broker memiliki **regulasi resmi yang bisa dicek** dan proses setor maupun tarik dana (*deposit/withdraw*) jelas ke rekening atas namamu sendiri. Ketiga, jangan pernah memakai uang kebutuhan pokok, uang kuliah, atau dana pinjaman — gunakan selalu **uang dingin** setelah kamu benar-benar lulus fase latihan di Akun Demo.'
          ]
        }
      ],
      keyTakeaways: [
        'Trading XAU/USD memperdagangkan selisih harga 1 troy oz emas terhadap USD secara dua arah: BUY saat mengharapkan naik, SELL saat mengharapkan turun.',
        'Trading adalah permainan probabilitas: kerugian kecil adalah biaya wajar selama rasio imbalan lebih besar daripada risiko (misalnya R:R 1:2).',
        'Urutan aman belajar: kuasai tombol & aturan di **Akun Demo** → latih psikologi uang asli di **Akun Cent (USC)** → baru naik ke **Akun Standard** saat sudah konsisten.'
      ],
      bridgeNext: 'Sekarang kamu sudah paham apa itu trading XAU/USD, fungsi broker, dan urutan akun yang aman. Begitu nanti kamu membuka layar aplikasi broker, hal pertama yang langsung muncul di depan matamu adalah angka harga emas seperti `2.650,00` yang berkedip naik turun — dan anehnya bukan cuma satu angka, melainkan dua angka sekaligus. Bagaimana cara membaca satuan geraknya dan kenapa ada dua harga? Mari kita bedah pelan-pelan di **Bab 02: Pips, Point, Bid, Ask, dan Spread di Gold (XAU/USD)**.',
      conceptBlocks: [
        {
          heading: 'Trading Gold (XAU/USD), Probabilitas & Jenis Akun',
          paragraphs: [
            'Trading XAU/USD memperdagangkan selisih harga emas dunia per troy oz secara dua arah (BUY saat naik, SELL saat turun) berbasis probabilitas dan rasio Risk:Reward.',
            'Urutan akun aman bagi pemula adalah Akun Demo (uang virtual), lalu Akun Cent/USC ($25 menjadi 2.500 USC), baru Akun Standard setelah konsisten.'
          ]
        }
      ],
      mappingSteps: [
        'Buat Akun Demo terlebih dahulu di broker teregulasi tanpa deposit uang asli.',
        'Uji membuka dan menutup transaksi BUY serta SELL pada simbol XAUUSD di MT5.',
        'Catat perbedaan saldo virtual (Demo), saldo sen (Cent/USC), dan saldo penuh (Standard) sebelum memakai dana nyata.'
      ],
      decisionTree: [
        {
          condition: 'Modal belajarmu baru $20–$50 dan ingin merasakan psikologi uang asli.',
          action: 'Pilih Akun Cent (USC) agar saldo berubah menjadi 2.000–5.000 USC dan risiko tetap kecil (≤ 1%).'
        },
        {
          condition: 'Ada tawaran titip dana trading dengan janji profit tetap harian tanpa risiko.',
          action: 'Tolak seketika — pasar nyata selalu bergerak probabilistik dan tidak pernah menjamin profit tetap.'
        }
      ],
      validRules: [
        'Mulai dari Akun Demo hingga lancar membuka transaksi, memasang SL, dan memasang TP.',
        'Gunakan Akun Cent (USC) saat pertama kali melatih emosi dengan uang asli skala kecil.',
        'Kelola akun sendiri di broker teregulasi menggunakan uang dingin.'
      ],
      invalidRules: [
        'Langsung menyetor modal kecil ($20–$50) ke Akun Standard lalu transaksi tanpa batas risiko.',
        'Menitipkan dana pada pihak lain yang menjanjikan profit pasti setiap hari.'
      ],
      xauScenario: {
        context: 'Skenario pemula dengan modal latihan $25 yang ingin mulai memahami mekanisme pasar XAU/USD secara aman.',
        steps: [
          'Minggu pertama: gunakan Akun Demo untuk membiasakan membaca harga XAU/USD dan membedakan tombol BUY serta SELL.',
          'Setelah paham risiko: gunakan Akun Cent agar $25 tampil sebagai 2.500 USC sehingga setiap latihan transaksi hanya mempertaruhkan beberapa sen.'
        ]
      },
      failedCase: {
        title: 'Kesalahan Klasik: Modal $25 Langsung ke Akun Standard',
        context: 'Pemula langsung menyetor $25 ke Akun Standard lalu membuka 0.01 lot BUY XAU/USD tanpa memahami nilai pergerakan harga.',
        whyFailed: 'Di Akun Standard Gold, 0.01 lot berarti setiap gerak $10 bernilai $10. Baru 2 kali salah analisis kecil, 80% modal langsung hilang dan mental langsung trauma.'
      },
      goldenRules: [
        'Demo untuk melatih keterampilan teknis, Cent untuk melatih emosi uang asli, Standard untuk menuai konsistensi.',
        'Kalah dengan risiko terukur adalah bagian normal dari bisnis probabilitas.'
      ],
      practiceCta: {
        label: 'Buka Lab Latihan Chart Pemula',
        description: 'Uji pemahaman dasar arah harga dan skenario chart tanpa risiko kehilangan uang sungguhan di simulator latihan.',
        href: 'trading-practice/index.html'
      },
      quiz: [
        {
          question: 'Saat harga Gold (XAU/USD) kamu perkirakan akan turun dari 2.660,00 menuju 2.650,00, jenis posisi apa yang dibuka agar mendapat profit dari penurunan tersebut?',
          options: [
            'Posisi BUY, karena semua transaksi di trading hanya bisa untung saat harga naik',
            'Posisi SELL, karena di trading dua arah kamu bisa mendapat keuntungan dari selisih penurunan harga',
            'Tidak bisa transaksi sama sekali sebelum membeli emas batangan fisik',
            'Menunggu sampai akhir pekan agar pasar tutup terlebih dahulu'
          ],
          answerIndex: 1,
          explanation: 'Trading XAU/USD bersifat dua arah: BUY mengambil keuntungan dari kenaikan harga, sedangkan SELL mengambil keuntungan dari penurunan harga.'
        },
        {
          question: 'Seorang trader melakukan 10 transaksi dengan rasio Risk:Reward 1:2 (kalah rugi $10, menang untung $20). Jika ia hanya menang 5 kali dan kalah 5 kali (winrate 50%), bagaimana hasil akhirnya?',
          options: [
            'Impas ($0) karena jumlah menang dan kalah sama banyak',
            'Rugi bersih -$50 karena 5 kali kalah sudah terlalu banyak',
            'Profit bersih +$50 karena total menang (+$100) lebih besar daripada total kalah (-$50)',
            'Akun otomatis ditutup oleh broker'
          ],
          answerIndex: 2,
          explanation: '5 menang × $20 = +$100, dikurangi 5 kalah × $10 = -$50, menghasilkan profit bersih +$50. Inilah bukti kekuatan probabilitas dan R:R.'
        },
        {
          question: 'Kamu punya modal latihan $25 dan ingin mulai merasakan psikologi uang asli tanpa cepat habis saat salah analisis. Jenis akun mana yang paling tepat dipilih?',
          options: [
            'Akun Standard agar langsung cepat kaya',
            'Akun Cent (USC), sehingga $25 tampil sebagai 2.500 USC dan risiko per transaksi tetap sangat kecil',
            'Menitipkan $25 ke grup titip dana yang menjanjikan profit pasti harian',
            'Akun tanpa Stop Loss dengan modal pinjaman'
          ],
          answerIndex: 1,
          explanation: 'Akun Cent mengubah $25 menjadi 2.500 USC sehingga pemula bisa belajar menjaga risiko kecil dengan aman sebelum siap ke Akun Standard.'
        },
        {
          question: 'Manakah ciri yang paling akurat untuk mengenali penipuan berkedok trading?',
          options: [
            'Menyediakan Akun Demo gratis untuk latihan',
            'Meminta kamu belajar membaca chart dan mengatur risiko sendiri',
            'Menjanjikan profit tetap harian secara pasti melalui sistem titip dana',
            'Memiliki proses tarik dana ke rekening atas nama pemilik akun sendiri'
          ],
          answerIndex: 2,
          explanation: 'Di pasar keuangan nyata, tidak ada pihak mana pun yang bisa menjamin profit tetap harian tanpa risiko. Janji profit pasti titip dana adalah ciri utama penipuan.'
        }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BAB 02 — PIPS, POINT, BID, ASK, DAN SPREAD DI GOLD
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'bid-ask-spread-pips-gold',
      number: 2,
      code: '02',
      levelId: 0,
      bookFormat: true,
      title: 'Pips, Point, Bid, Ask, dan Spread di Gold (XAU/USD)',
      subtitle: 'Memahami satuan pengukur jarak harga Gold dari nol, kenapa ada dua harga di broker, dan kenapa transaksi baru klik langsung terlihat minus.',
      readMinutes: 9,
      diagramId: 'zero-bid-ask-spread',
      diagramAfterSection: 2,
      summary: 'Pelajari apa itu Pips dan Point pada angka harga Gold (2.650,00), cara menghitung jarak pergerakan harga langkah demi langkah, peran Bid vs Ask, serta jebakan Spread pada Stop Loss posisi SELL.',
      bookSections: [
        {
          number: '2.1',
          heading: 'Apa Itu Pips? (Mulai dari Nol)',
          paragraphs: [
            'Kalau di kehidupan sehari-hari kita mengukur panjang meja memakai **sentimeter** dan jarak antarkota memakai **kilometer**, di dunia trading kita juga membutuhkan satuan baku untuk mengukur seberapa jauh harga bergerak naik atau turun. Satuan standar itulah yang disebut **Pips** (*Percentage in Point*).',
            'Kenapa trader tidak cukup bilang *"hari ini Gold naik sedikit"* atau *"turun banyak"*? Karena kata "sedikit" dan "banyak" sifatnya subjektif. Dengan satuan Pips, semua trader di seluruh dunia berbicara dalam bahasa ukuran yang sama persis. Ketika seseorang berkata *"jarak Stop Loss saya 30 pips"*, semua orang langsung tahu persis seberapa lebar ruang risikonya.',
            'Sekarang mari kita lihat langsung bentuk angka harga **Gold (XAU/USD)** di chart. Umumnya harga Gold ditulis dengan **dua angka di belakang koma**, contohnya: `2.650,00`. Supaya kamu tidak pernah bingung lagi, mari kita bedah arti setiap digitnya dari kanan ke kiri:'
          ],
          table: {
            caption: 'Anatomi Digit Harga Gold (Contoh: 2.650,00)',
            headers: ['Perubahan Angka', 'Nama Satuan', 'Kesetaraan'],
            rows: [
              ['0,01 (digit paling kanan)', '1 Point', 'Satuan gerak terkecil di chart Gold 2 desimal'],
              ['0,10 (digit kedua dari kanan)', '1 Pip', '1 Pip = 10 Point'],
              ['$1,00 (digit satuan dolar)', '10 Pips', '$1,00 = 10 Pips = 100 Point'],
              ['$10,00 (digit puluhan dolar)', '100 Pips', '$10,00 = 100 Pips = 1.000 Point']
            ]
          }
        },
        {
          number: '2.2',
          heading: 'Cara Menghitung Pips di Gold (Langkah demi Langkah)',
          paragraphs: [
            'Jangan sekadar dihafal — mari kita praktikkan langsung dengan tiga contoh angka nyata agar langsung menempel di kepala:',
            '**Trik cepat khusus Gold (XAU/USD):** Cari dulu selisih harga dalam dolar, lalu **kalikan 10** (cukup geser tanda koma satu langkah ke kanan). Selisih `$2,30` artinya **23 Pips**. Selisih `$12,50` artinya **125 Pips**. Sesederhana itu!'
          ],
          exampleBox: {
            title: 'Latihan Pelan: Menghitung Jarak Pergerakan Harga Gold',
            rows: [
              {
                label: 'Contoh 1',
                detail: 'Harga naik dari `2.650,00` ke `2.650,10` → selisih `$0,10` → `$0,10 × 10` = **1 Pip** (10 Point).'
              },
              {
                label: 'Contoh 2',
                detail: 'Harga naik dari `2.650,00` ke `2.651,00` → selisih `$1,00` → `$1,00 × 10` = **10 Pips** (100 Point).'
              },
              {
                label: 'Contoh 3',
                detail: 'Target profitmu dari `2.650,00` ke `2.654,50` → selisih `$4,50` → `$4,50 × 10` = **45 Pips** (450 Point).'
              }
            ]
          }
        },
        {
          number: '2.3',
          heading: 'Kenapa di Broker Selalu Ada Dua Harga? (Bid & Ask)',
          paragraphs: [
            'Sekarang kamu sudah bisa membaca jarak gerak harga Gold. Tetapi begitu kamu membuka aplikasi MetaTrader 5, kamu akan menemui hal yang sering membuat pemula mengernyitkan dahi: **kenapa harga Gold bukan cuma satu angka, melainkan dua angka sekaligus?**',
            'Misalnya di layar tertulis: **Bid = `2.650,00`** dan **Ask = `2.650,30`**. Untuk memahaminya dalam 10 detik, bayangkan kamu pergi ke **toko emas** atau *money changer*. Di papan toko emas selalu terpampang dua harga: harga kalau toko **menjual** emas kepadamu (lebih mahal), dan harga kalau toko **membeli balik** emas darimu (lebih murah).',
            'Di broker trading, mekanismenya persis sama — hanya memakai istilah bahasa Inggris:'
          ],
          table: {
            caption: 'Aturan Baku Bid & Ask Saat Membuka dan Menutup Transaksi',
            headers: ['Arah Transaksi', 'Harga Saat BUKA (Masuk)', 'Harga Saat TUTUP (Keluar / SL / TP)'],
            rows: [
              ['BUY (Beli)', 'Harga ASK (lebih tinggi, mis. 2.650,30)', 'Harga BID (lebih rendah)'],
              ['SELL (Jual)', 'Harga BID (lebih rendah, mis. 2.650,00)', 'Harga ASK (lebih tinggi)']
            ]
          }
        },
        {
          number: '2.4',
          heading: 'Apa Itu Spread, dan Dua Misteri Klasik Pemula',
          paragraphs: [
            'Lihat selisih antara Ask (`2.650,30`) dan Bid (`2.650,00`) tadi. Selisihnya adalah **`$0,30`** atau **3 Pips** (30 Point). Selisih inilah yang disebut **Spread** — yaitu biaya layanan broker setiap kali kamu membuka transaksi.',
            'Dari konsep Spread ini, dua kejadian yang paling sering membuat trader pemula merasa "dicurangi broker" langsung terjawab tuntas secara logis:'
          ],
          exampleBox: {
            title: 'Jawaban Logis 2 Misteri Klasik di Chart Gold',
            rows: [
              {
                label: '1. Kenapa baru klik langsung minus?',
                detail: 'Karena kamu baru membayar "tiket masuk" sebesar Spread. Saat kamu klik BUY di Ask `2.650,30`, padahal harga jual balik saat itu (Bid) baru `2.650,00`, maka jika ditutup di detik itu juga posisimu rugi 3 pips (`$0,30`). Harga harus naik minimal 3 pips dulu agar posisimu impas (*breakeven*), lalu selebihnya baru mulai biru (profit).'
              },
              {
                label: '2. Kenapa posisi SELL kena SL padahal candle belum menyentuh garis?',
                detail: 'Secara bawaan, batang candle di chart hanya menggambar **garis Bid**. Padahal posisi **SELL ditutup memakai garis Ask** yang selalu melayang di atas Bid sebesar Spread! Misal SL Sell-mu di `2.652,00` dan spread `$0,30`: ketika garis Bid (ekor candle) baru naik ke `2.651,70`, garis Ask sebenarnya sudah menyentuh `2.651,70 + 0,30 = 2.652,00` — dan SL-mu pun langsung tereksekusi!'
              }
            ]
          },
          callout: {
            tone: 'tip',
            title: 'Kebiasaan Praktis Trader Gold',
            body: 'Nyalakan fitur **"Show Ask Line"** di pengaturan chart MT5-mu agar kedua garis (Bid dan Ask) selalu terlihat jelas. Selain itu, setiap kali memasang Stop Loss untuk posisi **SELL**, selalu beri napas tambahan sedikit di atas titik struktur (misal +$0,40 sampai +$0,50) agar tidak tersentuh hanya gara-gara spread.'
          }
        }
      ],
      keyTakeaways: [
        'Di Gold (XAU/USD): `0,01` = 1 Point, `0,10` = 1 Pip (10 Point), dan `$1,00` = 10 Pips (100 Point).',
        'Cara cepat menghitung pips Gold: cari selisih harga dalam dolar lalu kalikan 10.',
        'BUY dibuka di **Ask** dan ditutup di **Bid**; SELL dibuka di **Bid** dan ditutup di **Ask**.',
        'Selisih `Ask - Bid` adalah **Spread** — itulah alasan posisi baru dibuka langsung minus dan Stop Loss SELL wajib diberi napas spread.'
      ],
      bridgeNext: 'Sekarang kamu sudah mahir mengukur jarak gerak harga Gold dengan Pips, dan sudah paham kenapa ada Bid, Ask, serta Spread. Namun, pasti muncul satu pertanyaan paling penting berikutnya: *"Kalau aku tahu jarak Stop Loss-ku 50 Pips ($5,00), berapa dolar sebenarnya uang yang berkurang jika SL itu tersentuh — $5, $50, atau $500?"* Jawabannya ditentukan oleh ukuran transaksi yang kamu pilih. Mari kita kuasai hitungannya secara tuntas di **Bab 03: Lot, Leverage, Margin, Balance vs Equity & Rumus Risiko 1%**.',
      conceptBlocks: [
        {
          heading: 'Pips, Point, Bid, Ask & Spread XAU/USD',
          paragraphs: [
            'Pada Gold (XAU/USD): 0,01 = 1 Point, 0,10 = 1 Pip, dan $1,00 = 10 Pips. Selisih harga dolar dikali 10 langsung menghasilkan jumlah pips.',
            'BUY dibuka di Ask dan ditutup di Bid; SELL dibuka di Bid dan ditutup di Ask. Selisih Ask - Bid adalah Spread.'
          ]
        }
      ],
      mappingSteps: [
        'Aktifkan garis Bid dan Ask (Show Ask Line) di pengaturan chart MT5.',
        'Latih mengukur jarak dua harga Gold menggunakan penggaris chart (Crosshair) dan konversikan selisih dolar × 10 menjadi Pips.',
        'Selalu tambahkan napas spread di atas struktur saat menaruh Stop Loss untuk posisi SELL.'
      ],
      decisionTree: [
        {
          condition: 'Kamu memasang posisi SELL dengan SL tepat nempel di puncak candle sebelumnya.',
          action: 'Geser SL sedikit lebih tinggi (+$0,40 hingga +$0,50) agar garis Ask tidak menyentuh SL sebelum harga benar-benar menembus struktur.'
        },
        {
          condition: 'Spread Gold tiba-tiba melebar jauh di atas normal (misal dari 3 pips melonjak jadi 15 pips saat pergantian hari atau berita).',
          action: 'Tunda dulu klik entry sampai spread kembali normal agar biaya masuk tidak memakan potensi profit.'
        }
      ],
      validRules: [
        'Aktifkan garis Ask di chart agar melihat jarak spread secara nyata.',
        'Selalu tambahkan ruang napas spread pada Stop Loss posisi SELL.',
        'Hitung jarak SL dan TP dalam dolar & pips sebelum menekan tombol order.'
      ],
      invalidRules: [
        'Menganggap broker curang ketika posisi SELL kena SL oleh garis Ask yang disembunyikan.',
        'Membuka transaksi saat spread sedang melebar ekstrem pada jam rollover atau berita besar.'
      ],
      xauScenario: {
        context: 'Harga XAU/USD menunjukkan Bid 2.650,00 dan Ask 2.650,30 (spread $0,30 / 3 pips). Kamu ingin memasang posisi SELL dengan area batal di 2.652,00.',
        steps: [
          'Hitung jarak dari Bid 2.650,00 ke level 2.652,00 = $2,00 (20 pips).',
          'Karena SELL ditutup di garis Ask, beri napas spread +$0,50 sehingga SL ditaruh di 2.652,50.',
          'Jika harga Bid naik hanya sampai 2.651,80, garis Ask berada di 2.652,10 dan posisimu tetap aman dari kena sweep prematur.'
        ]
      },
      failedCase: {
        title: 'SL Sell Tersentuh Padahal Ekor Candle Belum Sampai',
        context: 'Trader menaruh SL Sell persis di angka 2.652,00 saat spread sedang $0,30 (3 pips).',
        whyFailed: 'Ketika candle (garis Bid) baru menyentuh 2.651,70, garis Ask sudah mencapai 2.652,00 (2.651,70 + 0,30) sehingga SL langsung tereksekusi meski di layar tampak belum tersentuh.'
      },
      goldenRules: [
        'Di Gold, selisih $1,00 = 10 Pips = 100 Point.',
        'BUY ditutup oleh Bid; SELL ditutup oleh Ask — selalu beri napas spread di SL Sell.'
      ],
      practiceCta: {
        label: 'Lihat Live Bid/Ask di Cockpit Mapping',
        description: 'Amati bagaimana angka harga Gold bergerak real-time sebelum mulai berlatih menghitung risiko di Bab 03.',
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
          explanation: 'Selisih harganya adalah $4,50. Karena setiap $1,00 di Gold = 10 Pips, maka $4,50 × 10 = 45 Pips (atau 450 Point).'
        },
        {
          question: 'Saat kamu membuka aplikasi broker, tertulis Bid = 2.650,00 dan Ask = 2.650,30. Jika kamu langsung klik BUY, di harga mana transaksi dibuka dan berapa spread-nya?',
          options: [
            'Dibuka di 2.650,00 dengan spread 30 Pips',
            'Dibuka di 2.650,30 (Ask) dengan spread $0,30 (3 Pips)',
            'Dibuka di tengah-tengah 2.650,15 tanpa spread',
            'Dibuka di 2.650,00 dan langsung biru profit 3 Pips'
          ],
          answerIndex: 1,
          explanation: 'Posisi BUY selalu dibuka di harga Ask (2.650,30). Selisih Ask - Bid = $0,30 atau 3 Pips.'
        },
        {
          question: 'Kamu punya posisi SELL XAU/USD dengan Stop Loss di 2.652,00. Saat spread sedang $0,30 (3 pips), pada harga Bid berapa Stop Loss-mu sebenarnya akan tersentuh?',
          options: [
            'Saat Bid mencapai 2.652,30',
            'Saat Bid mencapai 2.652,00 persis',
            'Saat Bid mencapai 2.651,70 (karena Ask = 2.651,70 + 0,30 = 2.652,00)',
            'Stop Loss SELL tidak dipengaruhi spread'
          ],
          answerIndex: 2,
          explanation: 'Posisi SELL ditutup memakai harga Ask. Begitu Bid mencapai 2.651,70 dengan spread $0,30, harga Ask sudah tepat 2.652,00 sehingga SL langsung aktif.'
        },
        {
          question: 'Mengapa setiap kali kamu menekan tombol BUY atau SELL, angka profit/rugi di detik pertama selalu terlihat merah (minus)?',
          options: [
            'Karena koneksi internet lambat',
            'Karena kamu langsung membayar biaya Spread (selisih harga buka dan harga tutup saat itu)',
            'Karena broker selalu memotong 10% saldo di awal',
            'Karena harga Gold hanya boleh dibeli saat malam hari'
          ],
          answerIndex: 1,
          explanation: 'Minus awal tersebut adalah Spread (selisih Ask dan Bid). Begitu harga bergerak searah melebihi jarak Spread, posisi akan berubah menjadi impas lalu biru (profit).'
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
      subtitle: 'Tuntas sekali jalan: mengubah jarak Pips menjadi nilai dolar, memahami cara kerja daya ungkit (Leverage), dan rumus anti Margin Call.',
      readMinutes: 11,
      diagramId: 'zero-lot-margin-meter',
      diagramAfterSection: 2,
      interactiveLabAfterSection: 3,
      summary: 'Pahami ukuran transaksi (Lot) di Gold, cara kerja Leverage & Margin, perbedaan Balance vs Equity vs Free Margin, serta rumus baku menghitung Lot agar risiko selalu terjaga di 0,5%–1% modal.',
      bookSections: [
        {
          number: '3.1',
          heading: 'Apa Itu Lot? (Penentu Nilai Uang per Pip)',
          paragraphs: [
            'Di Bab 02 kita sudah sepakat bahwa jarak gerak harga diukur dengan **Pips** — ibarat jarak kilometer di jalan raya. Sekarang bayangkan kamu mengisi bensin: jarak 50 km di sepeda motor menghabiskan biaya jauh lebih sedikit dibandingkan 50 km di truk kontainer. Di dunia trading, ukuran "kendaraan" yang menentukan seberapa besar nilai uang per pip itu disebut **Lot**.',
            'Pada kontrak **Akun Standard Gold (XAU/USD)**, **1.00 Lot penuh sama dengan 100 troy ounce emas**. Artinya, setiap kali harga emas bergerak naik atau turun sebesar **$1,00 (10 Pips)**, nilai transaksi 1.00 lot berubah sebesar **`100 × $1 = $100`**.',
            'Tentu trader ritel tidak wajib memakai 1.00 lot penuh — kamu bisa memecahnya menjadi ukuran kecil hingga **0.01 lot** (Micro Lot). Simpan baik-baik tabel nilai uang berikut karena akan kamu pakai seumur hidup saat trading Gold:'
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
          heading: 'Bagaimana Modal Kecil Bisa Beli Emas $2.650? (Leverage & Margin)',
          paragraphs: [
            'Mungkin kamu sempat heran melihat tabel di atas: *"Tunggu dulu, kalau 0.01 lot Standard setara 1 oz emas yang harganya $2.650, kok aku yang cuma punya modal $100 bisa membuka posisi 0.01 lot?"*',
            'Jawabannya ada pada **Leverage** (daya ungkit). Leverage adalah fasilitas dari broker agar kamu cukup menyetor **uang jaminan sementara** yang disebut **Margin**, bukan membayar penuh nilai kontrak emasnya.',
            'Contoh hitungannya sangat sederhana: nilai kontrak 0.01 lot Gold di harga `$2.650` adalah **$2.650**. Jika akunmu memakai Leverage **1:500**, maka Margin yang ditahan sementara oleh broker hanyalah **`$2.650 ÷ 500 = $5,30`**. Begitu transaksimu ditutup, uang jaminan `$5,30` itu langsung dilepaskan kembali ke saldomu.',
            'Namun ingat jebakan terbesarnya: **Leverage memperkecil uang jaminan (Margin), BUKAN memperkecil kerugian!** Pakai Leverage 1:100 maupun 1:2000, kalau kamu membuka 0.01 lot Standard dan harga bergerak berlawanan `$5,00`, kerugianmu tetap sama persis yaitu **$5,00**. Leverage besar hanya berbahaya jika membuatmu tergoda membuka lot kegedean.'
          ]
        },
        {
          number: '3.3',
          heading: 'Membedakan Balance, Equity, Free Margin & Bahaya Margin Call',
          paragraphs: [
            'Di bagian atas tab **Trade** aplikasi MT5, kamu akan selalu melihat tiga angka penting yang terus bergerak setiap detik saat ada posisi terbuka: **Balance**, **Equity**, dan **Free Margin**. Banyak pemula terjebak hanya melihat Balance yang terlihat besar dan merasa akunnya aman, padahal posisi yang sedang terbuka mengalami rugi mengambang (floating loss) sangat dalam.',
            'Agar tidak pernah salah membaca kesehatan akunmu sendiri, perhatikan simulasi angka nyata layar MT5 berikut ketika seorang trader memiliki modal $1.000 lalu sedang membuka posisi 0.02 lot Gold yang berlawanan arah sebesar $15:'
          ],
          exampleBox: {
            title: 'Simulasi Layar MT5 Saat Posisi Sedang Berjalan',
            rows: [
              {
                label: 'Balance = $1.000,00',
                detail: 'Uang tunai di akunmu dari seluruh transaksi yang **sudah ditutup**. Angka ini tidak berubah selama posisi masih berjalan.'
              },
              {
                label: 'Floating = -$30,00',
                detail: 'Untung atau rugi sementara dari posisi yang **masih terbuka** saat ini.'
              },
              {
                label: 'Equity = $970,00',
                detail: 'Nilai bersih akunmu detik ini (`Balance + Floating` = `$1.000 - $30`). **Inilah nyawa asli akunmu.**'
              },
              {
                label: 'Free Margin = $959,40',
                detail: 'Sisa dana bebas setelah dikurangi Margin terpakai (misal `$10,60` untuk 0.02 lot): `$970,00 - $10,60 = $959,40`.'
              }
            ]
          },
          callout: {
            tone: 'warn',
            title: 'Apa Itu Margin Call & Stop Out?',
            body: 'Jika kamu membuka lot terlalu besar tanpa Stop Loss lalu Equity terus menyusut hingga mendekati batas Margin yang ditahan, broker akan memberi peringatan (Margin Call) dan akhirnya menutup paksa seluruh posisimu dalam keadaan rugi besar (Stop Out) agar saldomu tidak minus. Satu-satunya obat anti Margin Call adalah rumus risiko di sub-bab berikutnya.'
          }
        },
        {
          number: '3.4',
          heading: 'Rumus Baku Hitung Lot: Aturan Risiko 0,5% – 1% per Transaksi',
          paragraphs: [
            'Trader amatir selalu bertanya: *"Enaknya aku pasang berapa lot ya?"* lalu menebak asal `0.05` atau `0.10`. Trader profesional tidak pernah menebak lot. Mereka **menentukan dulu batas rugi maksimal dalam dolar (0,5% hingga 1% dari modal)**, mengukur **jarak Stop Loss di chart**, lalu memasukkan keduanya ke satu rumus eksak:',
            '**Rumus Lot Akun Standard Gold:** `Lot = Risiko ($) ÷ (Jarak SL dalam $ × 100)`',
            'Mari kita uji rumus ini pada tiga skenario modal yang berbeda supaya kamu benar-benar melihat betapa presisinya:'
          ],
          exampleBox: {
            title: '3 Latihan Hitung Lot Eksak di Gold (XAU/USD)',
            rows: [
              {
                label: 'Skenario A (Modal $1.000 · Standard)',
                detail: 'Batas risiko 1% = **$10**. Jarak SL di chart = **$5,00** (50 pips). Hitungan: `$10 ÷ (5 × 100) = $10 ÷ 500` = **0.02 Lot**. Cek balik: `0.02 × $5 × 100 = $10` (tepat 1%!).'
              },
              {
                label: 'Skenario B (Modal $500 · Standard)',
                detail: 'Batas risiko 1% = **$5**. Jarak SL di chart = **$5,00** (50 pips). Hitungan: `$5 ÷ (5 × 100) = $5 ÷ 500` = **0.01 Lot**. Cek balik: `0.01 × $5 × 100 = $5` (tepat 1%!).'
              },
              {
                label: 'Skenario C (Modal $50 · Kenapa Wajib Cent?)',
                detail: 'Batas risiko 1% = **$0,50**. Jika dipaksa di Akun Standard dengan lot terkecil `0.01 lot` dan SL `$5`, risikomu sudah **$5 = 10% modal** (10 kali lipat terlalu besar!). Tetapi di **Akun Cent** (`$50 = 5.000 USC`, 1% = `50 USC`), kamu bisa memakai **0.10 Cent Lot** → `0.10 × $5 × 100 = 50 USC ($0,50)` — persis 1%!'
              }
            ]
          },
          paragraphsAfter: [
            'Coba langsung ubah-ubah angka modal, persentase risiko, dan jarak SL pada **Lab Praktik Langsung** tepat di bawah ini sampai kamu merasakan sendiri bagaimana rumus lot bekerja otomatis:'
          ]
        }
      ],
      keyTakeaways: [
        'Di Akun Standard Gold: `0.01 lot` = **$1 per gerak $1** ($0,10/pip); `0.10 lot` = **$10 per gerak $1**; `1.00 lot` = **$100 per gerak $1**.',
        'Leverage hanya memperkecil jaminan Margin — **tidak pernah** memperkecil kerugian jika lot kegedean.',
        '**Equity** (`Balance + Floating`) adalah nilai nyata akunmu detik ini.',
        'Jangan menebak lot! Selalu gunakan rumus: `Lot Standard = Risiko ($) ÷ (Jarak SL dalam $ × 100)` dengan batas disiplin **0,5%–1% per transaksi**.'
      ],
      bridgeNext: 'Luar biasa — sekarang kamu sudah memegang rumus terpenting untuk melindungi modalmu di pasar Gold. Ilmu ini akan menjadi pondasi setiap eksekusi sampai Bab 36 nanti, sehingga kita tidak perlu lagi mengulang rumus lot di bab belakang. Selanjutnya, bagaimana cara memasukkan angka Lot, Entry, Stop Loss, dan Take Profit tersebut ke aplikasi **MetaTrader 5** tanpa salah tekan tombol? Mari kita buka **Bab 04: Panduan Praktis MetaTrader 5 (MT5) & 5 Jenis Order**.',
      conceptBlocks: [
        {
          heading: 'Lot, Leverage, Margin & Rumus Risiko 1% XAU/USD',
          paragraphs: [
            'Pada Akun Standard XAU/USD, 1.00 lot = 100 oz ($100 per gerak $1), 0.10 lot = $10 per gerak $1, dan 0.01 lot = $1 per gerak $1.',
            'Rumus Lot eksak: Lot = Risiko ($) dibagi (Jarak SL dalam $ × 100). Jika modal di bawah $500 dan hasil lot di bawah 0.01 Standard, wajib memakai Akun Cent.'
          ]
        }
      ],
      mappingSteps: [
        'Tentukan batas risiko maksimal per transaksi terlebih dahulu (0,5% hingga 1% dari Equity).',
        'Ukur jarak Stop Loss dalam dolar ($) dari titik entry ke titik batal di chart.',
        'Hitung Lot dengan rumus Risiko ($) ÷ (Jarak SL $ × 100) — jika hasilnya < 0.01 pada Akun Standard, pindahkan latihan ke Akun Cent.'
      ],
      decisionTree: [
        {
          condition: 'Hasil perhitungan rumus lot untuk modalmu di Akun Standard adalah 0.004 lot (di bawah minimal 0.01 lot).',
          action: 'Jangan membulatkan naik ke 0.01 Standard (risiko bisa melonjak 2,5x lipat). Gunakan Akun Cent (USC) agar risiko tetap presisi ≤ 1%.'
        },
        {
          condition: 'Jarak SL di sebuah setup melebar menjadi $10 (100 pips), padahal biasanya hanya $5 (50 pips).',
          action: 'Kecilkan ukuran lot menjadi setengahnya agar total kerugian dalam dolar tetap sama persis (misal tetap $10).'
        }
      ],
      validRules: [
        'Risiko per transaksi selalu dihitung mundur dari batas 0,5%–1% modal.',
        'Selalu sesuaikan Lot ketika jarak SL berubah lebar atau sempit.',
        'Pantau Equity, bukan hanya Balance, saat ada transaksi berjalan.'
      ],
      invalidRules: [
        'Memakai lot tetap yang sama (misal selalu 0.10 lot) untuk SL $2 maupun SL $15.',
        'Mengira Leverage tinggi (1:2000) membuat kerugian menjadi lebih kecil.'
      ],
      xauScenario: {
        context: 'Modal Akun Standard $1.000, disiplin risiko 1% ($10), dan jarak Stop Loss struktural di chart XAU/USD sebesar $5,00 (50 pips).',
        steps: [
          'Hitung batas risiko uang: 1% × $1.000 = $10.',
          'Masukkan ke rumus: $10 ÷ ($5,00 × 100) = $10 ÷ 500 = 0.02 Lot.',
          'Verifikasi balik: jika SL tersentuh, 0.02 lot × $5 × 100 = tepat -$10 (akun masih tersisa $990 dan mental tetap tenang).'
        ]
      },
      failedCase: {
        title: 'Kesalahan Lot Tetap di Modal Kecil',
        context: 'Trader bermodal $100 di Akun Standard menebak asal 0.05 lot dengan jarak SL $6,00.',
        whyFailed: '0.05 lot × $6 × 100 = $30 atau 30% modal melayang hanya dari 1 kali kalah. Tiga kali kalah beruntun langsung menghancurkan akun.'
      },
      goldenRules: [
        'Lot bukan ditebak, melainkan dihitung dari batas risiko dolar dan jarak SL.',
        'Risiko 1% membuatmu sanggup melewati rentetan kalah tanpa pernah menyentuh Margin Call.'
      ],
      practiceCta: {
        label: 'Catat Aturan Risiko 1% di Jurnal Trading',
        description: 'Biasakan mencatat modal, ukuran lot, dan batas risiko harian sebelum mengeksekusi transaksi pertama.',
        href: '../journal/index.html'
      },
      quiz: [
        {
          question: 'Pada Akun Standard Gold (XAU/USD), kamu membuka transaksi 0.01 lot lalu harga bergerak searah sebesar $5,00 (50 pips). Berapa dolar keuntunganmu?',
          options: [
            '$0,50',
            '$5,00',
            '$50,00',
            '$500,00'
          ],
          answerIndex: 1,
          explanation: 'Di Akun Standard Gold, 0.01 lot bernilai $1 per setiap pergerakan $1,00. Jadi gerak $5,00 menghasilkan tepat $5,00.'
        },
        {
          question: 'Modal Akun Standard = $1.000, batas risiko disiplin = 1% ($10), dan jarak Stop Loss di chart = $5,00 (50 pips). Berapa ukuran Lot yang tepat menurut rumus?',
          options: [
            '0.20 lot',
            '0.10 lot',
            '0.02 lot',
            '0.50 lot'
          ],
          answerIndex: 2,
          explanation: 'Lot = $10 ÷ (5 × 100) = $10 ÷ 500 = 0.02 lot. Cek balik: 0.02 × $5 × 100 = tepat $10.'
        },
        {
          question: 'Balance akunmu tercatat $1.000, lalu kamu punya satu transaksi terbuka yang sedang floating rugi -$30. Berapakah Equity akunmu saat ini?',
          options: [
            '$1.030',
            '$1.000',
            '$970',
            '$30'
          ],
          answerIndex: 2,
          explanation: 'Equity = Balance + Floating. Jadi $1.000 + (-$30) = $970. Equity adalah nilai bersih nyawa akunmu saat itu.'
        },
        {
          question: 'Pernyataan manakah yang BENAR tentang Leverage 1:500 vs 1:2000 saat membuka ukuran 0.01 lot Standard yang sama?',
          options: [
            'Leverage 1:2000 membuat kerugian per pip menjadi 4 kali lebih kecil',
            'Leverage 1:2000 memperkecil uang jaminan (Margin), tetapi besar untung/rugi per pip tetap sama persis',
            'Leverage 1:2000 otomatis mencegah terjadinya Margin Call tanpa perlu Stop Loss',
            'Leverage 1:500 membuat 0.01 lot menjadi 1.00 lot'
          ],
          answerIndex: 1,
          explanation: 'Leverage hanya memperkecil Margin yang ditahan broker; nilai untung/rugi per pip tetap ditentukan sepenuhnya oleh ukuran Lot.'
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
      subtitle: 'Mengenal layar kerja MT5 dan memilih jenis order yang tepat agar tidak pernah salah pencet antara Market, Limit, dan Stop.',
      readMinutes: 9,
      diagramId: 'zero-mt5-order-types',
      diagramAfterSection: 1,
      summary: 'Kuasai empat menu utama MetaTrader 5, perbedaan Market Execution vs 4 Pending Order (Buy Limit, Sell Limit, Buy Stop, Sell Stop), serta prosedur wajib mengisi Stop Loss dan Take Profit sebelum klik.',
      bookSections: [
        {
          number: '4.1',
          heading: 'Mengenal 4 Tab Utama MetaTrader 5 (MT5)',
          paragraphs: [
            'MetaTrader 5 (MT5) adalah "kokpit" standar yang dipakai jutaan trader di seluruh dunia untuk melihat grafik dan mengeksekusi transaksi. Di layar HP maupun laptop, sebenarnya kamu hanya perlu mengenal **empat bagian inti**:',
            '1. **Quotes (Daftar Harga):** Daftar instrumen seperti `XAUUSD` beserta harga **Bid** dan **Ask** yang bergerak langsung. 2. **Chart (Grafik):** Tempat kamu membaca bentuk candle, menggambar garis, dan menentukan titik entry. 3. **Trade (Posisi Aktif):** Menampilkan Balance, Equity, Free Margin, serta transaksi yang sedang berjalan atau menunggu (*pending*). 4. **History (Riwayat):** Catatan seluruh transaksi yang sudah selesai untuk bahan evaluasi jurnalmu.'
          ]
        },
        {
          number: '4.2',
          heading: '5 Jenis Order di MT5: Jangan Sampai Tertukar Limit dan Stop!',
          paragraphs: [
            'Salah satu kebingungan paling sering dialami pemula saat membuka jendela *New Order* di MT5 adalah munculnya lima pilihan jenis order. Padahal, jika dipahami dari **posisi harga saat ini**, logikanya sangat sederhana.',
            'Bayangkan harga Gold saat ini sedang berada di **`2.650,00`**. Hanya ada dua cara masuk pasar: **masuk sekarang juga** (*Market Execution*), atau **pasang jebakan otomatis di harga tertentu** (*Pending Order*) supaya kamu tidak perlu memelototi layar seharian.'
          ],
          table: {
            caption: 'Panduan 5 Jenis Order MT5 (Misal Harga Gold Saat Ini = 2.650,00)',
            headers: ['Jenis Order', 'Letak Harga Pesanan', 'Cara Kerjanya'],
            rows: [
              ['Market Execution', 'Di harga detik ini (2.650,00)', 'Langsung membuka BUY (di Ask) atau SELL (di Bid) seketika tombol ditekan.'],
              ['Buy Limit', 'Di BAWAH harga sekarang (mis. 2.642,00)', 'Menunggu harga turun dulu ke area murah (Discount), lalu otomatis BUY berharap memantul naik.'],
              ['Sell Limit', 'Di ATAS harga sekarang (mis. 2.658,00)', 'Menunggu harga naik dulu ke area mahal (premium), lalu otomatis SELL berharap memantul turun.'],
              ['Buy Stop', 'Di ATAS harga sekarang (mis. 2.655,00)', 'Menunggu harga menembus naik dulu, lalu otomatis ikut BUY searah dorongan ke atas.'],
              ['Sell Stop', 'Di BAWAH harga sekarang (mis. 2.645,00)', 'Menunggu harga menembus turun dulu, lalu otomatis ikut SELL searah dorongan ke bawah.']
            ]
          },
          callout: {
            tone: 'tip',
            title: 'Rumus Ingatan 3 Detik (Anti Tertukar)',
            body: 'Kata **LIMIT** selalu berarti **"tunggu harga balik dulu ke tempat yang lebih bagus, lalu tangkap pantulannya"** (seperti nawar barang lebih murah saat mau beli). Kata **STOP** selalu berarti **"tunggu harga tembus dulu, lalu ikut lari searah tembusannya"**. Di strategi ICT yang akan kita pelajari nanti, **90% pending order kita adalah Buy Limit dan Sell Limit**.'
          }
        },
        {
          number: '4.3',
          heading: 'Stop Loss (SL) & Take Profit (TP): Sabuk Pengaman Wajib',
          paragraphs: [
            'Di jendela order MT5, tepat di sebelah kotak Lot ada dua kolom terpenting untuk keselamatan akunmu: **Stop Loss (SL)** dan **Take Profit (TP)**.',
            '**Stop Loss (SL)** adalah batas harga keluar otomatis saat analisismu salah — ibarat sabuk pengaman dan rem darurat mobil. Tanpa SL, jika tiba-tiba muncul berita besar saat HP-mu mati atau sinyal putus, kerugianmu bisa terus membengkak sampai menghancurkan akun.',
            '**Take Profit (TP)** adalah batas harga keluar otomatis untuk mengunci keuntungan saat harga menyentuh targetmu. Dengan memasang SL dan TP sejak awal, kamu tidak perlu panik menatap layar setiap detik.'
          ],
          exampleBox: {
            title: 'Contoh Isian Order Lengkap di MT5 (Setup Buy Limit)',
            rows: [
              {
                label: 'Harga Sekarang',
                detail: '`2.650,00` — kamu ingin menunggu harga turun ke zona Discount `2.642,00`.'
              },
              {
                label: 'Jenis Order & Price',
                detail: 'Pilih **Buy Limit** di harga `2.642,00` dengan ukuran **0.02 Lot** (risiko 1% dari modal $1.000).'
              },
              {
                label: 'Stop Loss (SL)',
                detail: 'Pasang di **bawah** harga entry: `2.637,00` (jarak `$5,00` = 50 pips → risiko maksimal `$10`).'
              },
              {
                label: 'Take Profit (TP)',
                detail: 'Pasang di **atas** harga entry: `2.652,00` (jarak `$10,00` = 100 pips → target profit `$20`, R:R **1:2**).'
              }
            ]
          }
        },
        {
          number: '4.4',
          heading: 'Checklist 5 Detik Sebelum Menekan Tombol Place / Execute',
          paragraphs: [
            'Kesalahan konyol seperti salah ketik lot `0.10` menjadi `1.00` atau salah pilih Buy padahal niatnya Sell sering terjadi karena terburu-buru. Biasakan selalu melakukan **4 cek kilat** sebelum jari menekan tombol konfirmasi:',
            '1. **Cek Instrumen:** Pastikan judul atas benar `XAUUSD` (bukan pair lain). 2. **Cek Angka Lot:** Baca dua kali digit komanya (`0.02`, bukan `0.20`). 3. **Cek SL & TP:** Untuk BUY, SL wajib di bawah entry & TP di atas entry; untuk SELL, SL wajib di atas entry & TP di bawah entry. 4. **Pastikan Tidak Salah Jenis Order:** Jika tombol *Place* berwarna abu-abu (tidak bisa diklik), hampir pasti kamu salah memilih antara Limit dan Stop terhadap posisi harga sekarang.'
          ]
        }
      ],
      keyTakeaways: [
        'MT5 punya 4 layar inti: **Quotes** (harga Bid/Ask), **Chart** (grafik), **Trade** (posisi aktif & Equity), dan **History** (riwayat evaluasi).',
        '**Buy Limit** dipasang di bawah harga sekarang; **Sell Limit** dipasang di atas harga sekarang (keduanya menunggu pantulan di harga lebih bagus).',
        '**Buy Stop** dipasang di atas harga sekarang; **Sell Stop** dipasang di bawah harga sekarang (keduanya menunggu tembusan).',
        'Jangan pernah membuka transaksi tanpa **Stop Loss** — SL adalah rem darurat yang melindungi akun dari berita mendadak atau putus sinyal.'
      ],
      bridgeNext: 'Sekarang kamu sudah tahu cara mengoperasikan tombol-tombol MT5 dengan benar. Namun, tombol sebagus apa pun tidak ada gunanya kalau kamu belum bisa **membaca gambar batang-batang hijau dan merah** yang bergerak di layar Chart. Apa sebenarnya yang terjadi di dalam satu batang candle, dan kenapa chart punya pilihan M5, M15, H1, hingga Daily? Mari kita bedah dari nol di **Bab 05: Membaca Chart, Anatomi Candlestick (Body vs Wick) & Konsep Timeframe**.',
      conceptBlocks: [
        {
          heading: 'Navigasi MT5 & 5 Jenis Order',
          paragraphs: [
            'MT5 memiliki 4 layar utama (Quotes, Chart, Trade, History) dan 5 jenis order: Market Execution, Buy Limit, Sell Limit, Buy Stop, dan Sell Stop.',
            'Limit menunggu harga menjemput level lebih baik untuk pantulan, sedangkan Stop menunggu harga menembus level untuk melanjutkan arah. SL dan TP wajib diisi sebelum eksekusi.'
          ]
        }
      ],
      mappingSteps: [
        'Buka layar New Order XAUUSD di Akun Demo MT5 dan cek ulang angka Lot sebelum memilih tipe order.',
        'Latih memasang 1 Buy Limit di bawah harga sekarang dan 1 Sell Limit di atas harga sekarang lengkap dengan SL dan TP.',
        'Uji membatalkan pending order lewat tab Trade agar tangan terbiasa mengendalikan pesanan tanpa panik.'
      ],
      decisionTree: [
        {
          condition: 'Tombol Place di MT5 berwarna abu-abu dan tidak bisa diklik saat memasang Pending Order.',
          action: 'Periksa kembali letak harga pesananmu: Buy Limit wajib di bawah harga saat ini, Sell Limit wajib di atas harga saat ini, dan cek apakah SL/TP tidak terbalik.'
        },
        {
          condition: 'Kamu ingin masuk di area harga lebih murah di bawah harga sekarang, tetapi harga belum turun ke sana.',
          action: 'Pasang Buy Limit lengkap dengan SL & TP — jangan terburu-buru menekan Market Buy di pucuk.'
        }
      ],
      validRules: [
        'Selalu periksa ulang simbol XAUUSD, angka koma Lot, serta posisi SL/TP sebelum klik.',
        'Gunakan Buy Limit / Sell Limit untuk antre sabar di zona Discount atau premium.'
      ],
      invalidRules: [
        'Membuka transaksi dulu baru "nanti saja" memasang Stop Loss.',
        'Salah memilih Buy Stop padahal ingin menunggu harga turun dulu ke area Discount.'
      ],
      xauScenario: {
        context: 'Harga XAU/USD saat ini 2.650,00. Kamu ingin menunggu harga turun ke zona beli 2.642,00 dengan SL $5 dan target $10.',
        steps: [
          'Pilih tipe order Buy Limit di 2.642,00 (di bawah harga sekarang).',
          'Isi Lot 0.02, SL di 2.637,00, dan TP di 2.652,00 (R:R 1:2).',
          'Tekan Place dan biarkan MT5 mengeksekusi otomatis jika harga turun menjemput.'
        ]
      },
      failedCase: {
        title: 'Salah Ketik Koma Lot & Lupa SL',
        context: 'Pemula terburu-buru ingin mengejar candle naik lalu mengetik 0.20 lot alih-alih 0.02 lot tanpa mengisi SL.',
        whyFailed: 'Risiko melonjak 10 kali lipat dari rencana awal; baru turun $5 saja akun langsung terpotong -$100.'
      },
      goldenRules: [
        'LIMIT = tunggu jemput di harga lebih bagus; STOP = ikut setelah harga tembus.',
        'Tidak ada SL = tidak boleh klik tombol eksekusi.'
      ],
      practiceCta: {
        label: 'Latih Pemahaman Dasar di Cockpit Mapping',
        description: 'Amati level harga kunci di chart Gold untuk membayangkan di mana Buy Limit dan Sell Limit diletakkan.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Harga Gold (XAU/USD) saat ini berada di 2.650,00. Kamu ingin menunggu harga turun dulu ke 2.642,00 baru otomatis membuka posisi BUY. Jenis order MT5 apa yang harus dipilih?',
          options: [
            'Buy Stop',
            'Buy Limit',
            'Sell Limit',
            'Sell Stop'
          ],
          answerIndex: 1,
          explanation: 'Buy Limit selalu dipasang di bawah harga saat ini untuk menunggu harga turun ke area lebih murah lalu menangkap pantulan naik.'
        },
        {
          question: 'Harga Gold saat ini 2.650,00. Kamu ingin menunggu harga naik dulu menyentuh area mahal 2.658,00 baru otomatis membuka posisi SELL. Jenis order apa yang tepat?',
          options: [
            'Sell Limit',
            'Sell Stop',
            'Buy Limit',
            'Market Execution'
          ],
          answerIndex: 0,
          explanation: 'Sell Limit dipasang di atas harga saat ini untuk menunggu harga naik ke area premium lalu menangkap pantulan turun.'
        },
        {
          question: 'Kamu memasang Buy Limit di 2.642,00. Di mana letak Stop Loss (SL) dan Take Profit (TP) yang benar?',
          options: [
            'SL di 2.652,00 (di atas entry) dan TP di 2.637,00 (di bawah entry)',
            'SL di 2.637,00 (di bawah entry) dan TP di 2.652,00 (di atas entry)',
            'SL dan TP keduanya ditaruh di 2.642,00',
            'Tidak perlu mengisi SL asalkan sudah mengisi TP'
          ],
          answerIndex: 1,
          explanation: 'Pada posisi BUY, kamu untung jika harga naik (TP di atas entry) dan membatasi rugi jika harga turun (SL di bawah entry).'
        },
        {
          question: 'Saat ingin memasang pending order di MT5, tombol "Place" tiba-tiba berwarna abu-abu dan tidak bisa ditekan. Apa penyebab paling umumnya?',
          options: [
            'Aplikasi MT5 rusak permanen',
            'Letak harga order, SL, atau TP terbalik (misalnya memilih Buy Limit tetapi memasukkan harga di atas harga sekarang)',
            'Karena kamu memakai Akun Demo',
            'Karena kamu mengetikkan Take Profit terlalu bagus'
          ],
          answerIndex: 1,
          explanation: 'MT5 otomatis mengunci tombol Place jika posisi harga pesanan tidak sesuai aturan Limit/Stop atau posisi SL/TP terbalik.'
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
      subtitle: 'Membaca cerita pertarungan pembeli dan penjual di balik setiap batang candle, kenapa penutupan candle paling jujur, dan cara kerja timeframe.',
      readMinutes: 10,
      diagramId: 'candlestick-anatomy',
      diagramAfterSection: 1,
      summary: 'Pahami 4 titik harga OHLC di balik setiap candlestick, makna psikologis Body tebal vs Wick panjang, kenapa wajib menunggu candle close, serta bagaimana candle besar membungkus candle kecil lintas timeframe.',
      bookSections: [
        {
          number: '5.1',
          heading: 'Apa Itu Candlestick? (Cerita 4 Titik Harga: OHLC)',
          paragraphs: [
            'Saat pertama kali membuka chart, deretan batang berwarna hijau (atau biru) dan merah mungkin terlihat seperti grafik rumit. Padahal, **setiap satu batang Candlestick hanyalah ringkasan cerita pertarungan antara Pembeli dan Penjual selama satu rentang waktu tertentu**.',
            'Sebatang candlestick selalu merekam **empat titik harga (OHLC)**: **Open** (harga pembukaan saat waktu dimulai), **High** (titik tertinggi yang sempat dicapai), **Low** (titik terendah yang sempat disentuh), dan **Close** (harga penutupan saat waktu habis).',
            'Bagian kotak tebal di tengah antara Open dan Close disebut **Body (kotak inti candle)**, sedangkan garis tipis yang mencuat di atas atau di bawah body disebut **Wick / Shadow (garis ekor atas-bawah candle)**. Jika harga ditutup **lebih tinggi** daripada pembukaan (`Close > Open`), candle disebut **Bullish (Naik)**. Jika ditutup **lebih rendah** (`Close < Open`), candle disebut **Bearish (Turun)**.'
          ],
          exampleBox: {
            title: 'Membedah Satu Batang Candle Bullish M15 (15 Menit)',
            rows: [
              {
                label: 'Open = 2.650,00',
                detail: 'Pukul 14:00 WITA, candle 15 menit baru mulai terbentuk di `2.650,00`.'
              },
              {
                label: 'Low = 2.648,50',
                detail: 'Di menit ke-3, penjual sempat menekan turun `$1,50`, tetapi langsung dilawan balik oleh pembeli → meninggalkan **ekor bawah `$1,50`**.'
              },
              {
                label: 'High = 2.655,00',
                detail: 'Di menit ke-12, pembeli mendorong harga melonjak hingga `2.655,00`.'
              },
              {
                label: 'Close = 2.654,20',
                detail: 'Tepat pukul 14:15 WITA waktu habis dan candle ditutup di `2.654,20` → terbentuk **Body Bullish tebal `$4,20`** dengan ekor atas tipis `$0,80`. Pesannya jelas: pembeli menang telak di 15 menit ini!'
              }
            ]
          }
        },
        {
          number: '5.2',
          heading: 'Membaca Bahasa Tubuh Candle: Body vs Wick',
          paragraphs: [
            'Di metodologi ICT yang akan kita pelajari mulai Bab 07, kamu tidak perlu menghafal 50 nama pola candlestick Jepang yang rumit. Kamu cukup menguasai **satu prinsip bacaan yang sangat jujur**: **Body menunjukkan niat dan kekuatan nyata, sedangkan Wick menunjukkan penolakan atau sweep sementara.**',
            'Perhatikan bedanya: ketika sebuah candle mendorong menembus sebuah batas harga dan **Body-nya benar-benar ditutup di seberang batas itu**, artinya pihak pemenang punya tenaga besar untuk mempertahankan harga di sana. Sebaliknya, jika harga sempat melonjak lewat batas lalu di menit-menit terakhir ditarik pulang sampai hanya menyisakan **ekor panjang (Wick)** sementara Body tetap tutup di dalam — itu tanda **penolakan kuat (rejection)** atau jebakan!',
            'Dari sini lahir satu hukum disiplin penting: **jangan pernah mengambil keputusan dari candle yang waktunya belum habis!** Selama waktu masih berjalan, batang yang tadinya terlihat hijau penuh bisa tiba-tiba berubah merah dalam 10 detik terakhir. Di pasar, hanya **Candle Close (penutupan resmi)** yang sah dibaca sebagai fakta.'
          ],
          callout: {
            tone: 'story',
            title: 'Kenapa Pemula Sering Tertipu "Candle Berjalan"?',
            body: 'Di menit ke-6 sebuah candle M15, harga melonjak tajam menembus puncak lama. Pemula panik takut ketinggalan lalu langsung klik BUY. Ternyata di menit ke-14 harga dibanting turun jauh — saat candle ditutup di menit ke-15, yang tersisa hanyalah ekor panjang di atas! Andai saja ia sabar menunggu 9 menit hingga candle tutup, ia akan langsung tahu bahwa itu jebakan, bukan dorongan naik asli.'
          }
        },
        {
          number: '5.3',
          heading: 'Apa Itu Timeframe? (Analogi Zoom Kamera & Kotak Boneka)',
          paragraphs: [
            'Di bagian atas chart MT5, kamu akan melihat tombol **M1, M5, M15, H1, H4, D1, W1**. Itulah **Timeframe** — durasi waktu untuk membentuk **satu batang candlestick**.',
            'Anggaplah Timeframe seperti **lensa zoom kamera** pada peta kota. Melihat **D1 (Daily)** atau **H4/H1** ibarat melihat peta dari pesawat: kamu langsung tahu arah jalan raya besar dan tujuan akhirnya. Sementara melihat **M15** dan **M5** ibarat turun ke permukaan jalan: kamu bisa melihat tikungan dan detail presisi tempat masuknya.',
            'Hal paling ajaib yang harus kamu sadari adalah bahwa **semua timeframe menampilkan harga yang sama — satu candle besar sebenarnya hanyalah bungkusan dari beberapa candle kecil di dalamnya**:'
          ],
          table: {
            caption: 'Hubungan Matematis Antar Timeframe (Isi di Dalam 1 Candle)',
            headers: ['Timeframe Besar', 'Durasi 1 Candle', 'Isi Candle Kecil di Dalamnya', 'Peran Utamanya Nanti di ICT'],
            rows: [
              ['D1 (Daily)', '1 Hari Trading', '~23–24 candle H1', 'Menentukan arah besar harian (Daily Bias) & level PDH/PDL'],
              ['H4 (4 Jam)', '4 Jam', '4 candle H1 / 16 candle M15', 'Membaca struktur utama & zona institusi besar'],
              ['H1 (1 Jam)', '1 Jam', '4 candle M15 / 12 candle M5', 'Peta arena bermain (Dealing Range) & zona tunggu utama'],
              ['M15 (15 Menit)', '15 Menit', '3 candle M5 / 15 candle M1', 'Menyaring zona entry & membaca sweep sesi'],
              ['M5 (5 Menit)', '5 Menit', '5 candle M1', 'Konfirmasi presisi waktu menekan tombol entry']
            ]
          }
        }
      ],
      keyTakeaways: [
        'Satu batang candlestick merekam 4 fakta harga: **Open, High, Low, Close (OHLC)** selama satu rentang timeframe.',
        '**Body** menunjukkan tenaga dan kesepakatan akhir yang sah; **Wick** menunjukkan penolakan atau jejak sweep sementara.',
        'Selalu tunggu **Candle Close** sebelum menyimpulkan sebuah level benar-benar tertembus.',
        'Timeframe besar membungkus timeframe kecil (`1 H1 = 4 M15 = 12 M5`) — nanti kita akan selalu membaca dari besar ke kecil (*Top-Down*).'
      ],
      bridgeNext: 'Sekarang kamu sudah bisa membaca cerita di balik setiap batang candlestick dan memahami hubungan antar timeframe. Tinggal satu potongan terakhir di Bagian I sebelum kita resmi masuk ke dunia struktur dan ICT: **kapan jam paling sehat untuk membaca dan memperdagangkan Gold di waktu Indonesia (WITA), dan kenapa Gold tidak boleh diperlakukan sama seperti pasangan mata uang biasa?** Mari kita tuntaskan di **Bab 06: Karakter Unik Gold (XAU/USD), Sesi Pasar Dunia & Aturan Akhir Pekan**.',
      conceptBlocks: [
        {
          heading: 'Anatomi Candlestick OHLC, Body vs Wick & Timeframe',
          paragraphs: [
            'Candlestick merekam Open, High, Low, dan Close. Body tebal mencerminkan dominasi tenaga nyata, sedangkan Wick panjang mencerminkan penolakan atau sweep sementara.',
            'Satu candle timeframe besar membungkus beberapa candle timeframe kecil (1 H1 = 4 M15 = 12 M5). Selalu tunggu Candle Close untuk konfirmasi sah.'
          ]
        }
      ],
      mappingSteps: [
        'Buka chart XAUUSD di H1 lalu amati 1 candle terakhir: tandai titik Open, High, Low, dan Close-nya.',
        'Pindahkan ke M15 dan hitung tepat 4 batang candle yang membentuk 1 batang H1 tadi.',
        'Bandingkan candle yang tutup dengan Body tebal vs candle yang hanya menyisakan Wick panjang.'
      ],
      decisionTree: [
        {
          condition: 'Harga sedang menembus puncak lama, tetapi waktu candle M15 masih tersisa 8 menit lagi.',
          action: 'Tunggu sampai waktu habis dan candle benar-benar close; jangan entry di tengah candle yang masih bergerak.'
        },
        {
          condition: 'Candle mencoba naik melewati batas atas, lalu tutup di bawah batas dengan ekor atas sangat panjang.',
          action: 'Baca itu sebagai penolakan (rejection) penjual, bukan tembusan naik yang sah.'
        }
      ],
      validRules: [
        'Tunggu Candle Close sebelum menyatakan sebuah batas harga benar-benar ditembus.',
        'Gunakan timeframe besar (D1/H4/H1) untuk arah dan timeframe kecil (M15/M5) untuk detail.'
      ],
      invalidRules: [
        'Mengambil keputusan entry saat candle baru berjalan separuh waktu.',
        'Hanya menatap M1 terus-menerus tanpa melihat konteks H1 dan M15.'
      ],
      xauScenario: {
        context: 'Candle M15 XAU/USD dibuka di 2.650,00, sempat turun ke 2.648,50, lalu melonjak ke 2.655,00 dan ditutup di 2.654,20.',
        steps: [
          'Identifikasi ekor bawah $1,50 sebagai tanda pembeli menolak harga murah di 2.648,50.',
          'Identifikasi Body Bullish tebal $4,20 yang membuktikan dominasi pembeli saat penutupan.'
        ]
      },
      failedCase: {
        title: 'Terjebak FOMO Sebelum Candle Close',
        context: 'Pemula melihat candle M15 hijau panjang di menit ke-5 lalu langsung BUY tanpa menunggu penutupan.',
        whyFailed: 'Di 10 menit tersisa harga berbalik turun drastis dan candle ditutup merah dengan ekor atas panjang, membuat posisi BUY langsung terjebak di pucuk.'
      },
      goldenRules: [
        'Body menceritakan fakta akhir; Wick menceritakan penolakan atau jebakan.',
        'Satu candle H1 selalu terdiri dari 4 candle M15 dan 12 candle M5.'
      ],
      practiceCta: {
        label: 'Amati Candlestick Live M15 & M5 di Beranda',
        description: 'Bandingkan langsung bentuk body dan wick candle Gold pada tombol pergantian M15 dan M5.',
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
          question: 'Mengapa kamu dilarang menyimpulkan sebuah level harga sudah "tembus sah" ketika candle masih berjalan (belum close)?',
          options: [
            'Karena broker tidak memperbolehkan transaksi sebelum menit ke-15',
            'Karena sebelum waktu habis, harga bisa berbalik tajam hingga yang tersisa saat close hanyalah ekor panjang (penolakan/jebakan)',
            'Karena candle yang masih berjalan tidak memiliki harga Bid',
            'Karena semua candle pasti berubah warna di detik terakhir'
          ],
          answerIndex: 1,
          explanation: 'Hanya penutupan candle (Candle Close) yang sah sebagai fakta. Batang yang tampak menembus di tengah waktu sering kali ditarik pulang menjadi wick penolakan.'
        },
        {
          question: 'Secara matematis, satu batang candle H1 (1 Jam) dibentuk oleh berapa banyak batang candle M15 dan M5?',
          options: [
            '2 candle M15 atau 6 candle M5',
            '4 candle M15 atau 12 candle M5',
            '6 candle M15 atau 15 candle M5',
            '15 candle M15 atau 60 candle M5'
          ],
          answerIndex: 1,
          explanation: '60 menit ÷ 15 menit = 4 candle M15; dan 60 menit ÷ 5 menit = 12 candle M5.'
        },
        {
          question: 'Dalam pembacaan bahasa tubuh candlestick, apa perbedaan utama antara Body tebal dan Wick panjang?',
          options: [
            'Body menunjukkan niat & kekuatan pemenang yang sah saat penutupan, sedangkan Wick panjang menunjukkan penolakan atau sweep sementara',
            'Wick lebih kuat daripada Body untuk menembus tren',
            'Body hanya penting di akun Demo',
            'Keduanya tidak memiliki arti apa pun di pasar Gold'
          ],
          answerIndex: 0,
          explanation: 'Body tebal yang ditutup melewati suatu batas menunjukkan tenaga nyata, sedangkan Wick panjang menunjukkan harga sempat masuk lalu ditolak kembali.'
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
      subtitle: 'Mengapa Gold bergerak jauh lebih kencang daripada mata uang biasa, jadwal 3 sesi pasar dunia di waktu WITA (EDT & EST), dan jam larangan trading.',
      readMinutes: 9,
      diagramId: 'xau-volatility-sessions',
      diagramAfterSection: 1,
      summary: 'Kenali karakter volatilitas tinggi XAU/USD, ritme tiga sesi pasar global (Asia, London, New York) dalam konversi eksak WITA (EDT +12 / EST +13), bahaya jam rollover, serta aturan tutup akhir pekan.',
      bookSections: [
        {
          number: '6.1',
          heading: 'Mengapa Gold (XAU/USD) Berbeda dari Pasangan Forex Biasa?',
          paragraphs: [
            'Banyak trader yang datang dari pasangan mata uang seperti `EUR/USD` terkejut saat pertama kali membuka chart **Gold (`XAU/USD`)**. Jika pasangan mata uang mayor biasanya bergerak 50 hingga 80 pips dalam sehari, Gold dengan santainya bisa melaju **$20 hingga $40 (200 sampai 400 pips)** hanya dalam satu hari perdagangan — bahkan bisa menempuh $15 hanya dalam 15 menit saat berita Amerika keluar.',
            'Kenapa Gold begitu hidup dan agresif? Karena emas bukan sekadar mata uang satu negara, melainkan **aset lindung nilai global (*safe-haven*)** yang sensitif terhadap kekuatan Dolar AS (DXY), suku bunga bank sentral AS (The Fed), inflasi, hingga ketegangan geopolitik dunia.',
            'Karakter cepat ini ibarat pisau bermata dua: bagi trader yang punya peta jelas dan disiplin risiko 1%, Gold menawarkan peluang R:R tinggi setiap hari. Namun bagi trader yang asal klik tanpa tahu jam pasar, Gold juga tempat tercepat menghabiskan akun.'
          ]
        },
        {
          number: '6.2',
          heading: 'Ritme 3 Sesi Pasar Dunia (Konversi Eksak New York → WITA)',
          paragraphs: [
            'Pasar emas dunia buka hampir 24 jam sehari dari Senin hingga Jumat, tetapi **tidak setiap jam layak diperdagangkan**. Pasar bergerak mengikuti jam kerja pusat keuangan terbesar dunia: **Asia (Tokyo/Sydney) → London (Eropa) → New York (Amerika Serikat)**.',
            'Satu hal penting yang sering membuat buku trading lain meleset 1 jam: Amerika Serikat menerapkan **Daylight Saving Time**. Pada musim panas AS (**EDT**, Maret–November, UTC-4), waktu **WITA (UTC+8) lebih cepat +12 jam** dari New York. Sedangkan pada musim dingin AS (**EST**, November–Maret, UTC-5), **WITA lebih cepat +13 jam** dari New York.'
          ],
          table: {
            caption: 'Peta Karakter 3 Sesi Pasar Gold Dunia (Patokan NY → WITA)',
            headers: ['Sesi Pasar', 'Jam WITA (EDT · +12)', 'Jam WITA (EST · +13)', 'Karakter Khas di Chart Gold'],
            rows: [
              ['Sesi Asia', '08:00 – 12:00 WITA', '09:00 – 13:00 WITA', 'Cenderung tenang dan bergerak sempit membentuk kotak rentang (Asia Range).'],
              ['Sesi London', '14:00 – 17:00 WITA', '15:00 – 18:00 WITA', 'Volume bank Eropa masuk; mulai muncul gerak tegas & sweep awal terhadap Asia Range.'],
              ['Sesi New York', '19:00 – 23:00 WITA', '20:00 – 00:00 WITA', 'Puncak volatilitas harian (pertemuan London–NY + jadwal berita ekonomi AS).']
            ]
          },
          callout: {
            tone: 'tip',
            title: 'Jangan Terjebak "Over-Trading" di Jam Sepi',
            body: 'Di luar jam London dan New York (terutama siang bolong menjelang London buka atau tengah malam setelah NY tutup), pergerakan Gold sering bolak-balik tanpa arah yang jelas. Nanti di Bagian III kita akan membedah jendela waktu super presisi ICT (Killzone, Silver Bullet, dan Macro 20 menit) agar kamu cukup duduk 2–3 jam sehari pada waktu paling berkualitas.'
          }
        },
        {
          number: '6.3',
          heading: 'Dua Zona Merah Waktu: Jam Rollover & Tutup Akhir Pekan',
          paragraphs: [
            'Selain mengenal jam aktif, kamu wajib menghafal **dua waktu terlarang** saat pasar Gold sangat tidak sehat untuk disentuh:',
            '**1. Jam Rollover Harian (Pergantian Hari Pasar NY 17:00–18:00 NY):** Sekitar pukul **`05:00–06:00 WITA` (EDT)** atau **`06:00–07:00 WITA` (EST)** setiap pagi, pasar tutup sejenak 1 jam untuk pergantian hari kliring bank. Menjelang dan tepat saat pasar buka kembali di jam ini, Liquidity sangat tipis sehingga **Spread bisa melonjak 5 hingga 10 kali lipat**! Posisi dengan SL ketat sangat rawan tersentuh hanya oleh lonjakan spread.',
            '**2. Tutup Akhir Pekan (Weekend Closure):** Pasar Gold dunia resmi tutup mulai **Jumat pukul 17:00 NY** (`Sabtu 05:00 WITA` EDT / `06:00 WITA` EST) hingga **Minggu pukul 17:00 NY** (`Senin 05:00 WITA` EDT / `06:00 WITA` EST). Selama akhir pekan, harga berhenti total. Hindari menahan posisi scalping melewati akhir pekan karena pada Senin pagi harga bisa langsung melompat (*weekend gap*) melewati Stop Loss-mu.'
          ],
          callout: {
            tone: 'warn',
            title: 'Kenapa Chart Akhir Pekan Berhenti di Candle Jumat?',
            body: 'Jika kamu membuka chart Gold pada hari Sabtu atau Minggu, candle terakhir yang sah adalah penutupan Jumat sore waktu New York (Sabtu subuh WITA). Tidak ada transaksi pasar global di akhir pekan — gunakan hari Sabtu dan Minggu murni untuk belajar buku ini, me-review jurnal, dan memetakan rencana pekan depan tanpa tekanan candle bergerak.'
          }
        }
      ],
      keyTakeaways: [
        'Gold (`XAU/USD`) bervolatilitas tinggi ($20–$40 per hari) karena dipengaruhi Dolar AS, suku bunga The Fed, dan sentimen aset aman dunia.',
        'WITA (UTC+8) = **NY + 12 jam saat EDT** (Maret–Nov) dan **NY + 13 jam saat EST** (Nov–Maret).',
        'Sesi Asia cenderung membangun rentang sempit; puncak gerak utama terjadi di **Sesi London** dan **Sesi New York**.',
        'Hindari entry di jam **Rollover harian** (spread melebar ekstrem) dan jangan menahan posisi scalping melewati **tutup akhir pekan** (Jumat 17:00 NY – Minggu 17:00 NY).'
      ],
      bridgeNext: 'Selamat — kamu baru saja menuntaskan seluruh **Bagian I (Fondasi Pemula & Cara Kerja Pasar Gold)**! Mulai sekarang, kamu sudah punya bekal lengkap: paham broker & akun, mahir hitung Pips & Spread, pegang rumus Lot 1%, lancar pakai MT5, bisa membaca bahasa Candlestick & Timeframe, dan mengerti jam bernapasnya pasar Gold. Di **Bagian II (Bab 07)**, kita resmi membuka pintu pertama menuju pembacaan pasar profesional: **Bab 07 — Struktur Pasar Murni: Swing High/Low, Tren Naik, Tren Turun & Konsolidasi**.',
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
        'Cek apakah kalender Amerika saat ini sedang musim panas (EDT, +12 WITA) atau musim dingin (EST, +13 WITA).',
        'Tandai rentang Sesi Asia setiap pagi sebelum menunggu ekspansi di Sesi London dan New York.',
        'Tutup seluruh posisi scalping sebelum jam rollover pagi maupun penutupan Jumat sore NY.'
      ],
      decisionTree: [
        {
          condition: 'Sekarang pukul 05:15 WITA (jam rollover) dan kamu melihat setup bagus di chart.',
          action: 'Abaikan! Spread saat rollover bisa melebar berkali lipat dan sweep SL secara tidak wajar.'
        },
        {
          condition: 'Sekarang hari Sabtu/Minggu dan chart tidak bergerak.',
          action: 'Pasar tutup resmi (Jumat 17:00 NY – Minggu 17:00 NY); gunakan waktu ini untuk evaluasi jurnal dan latihan baca struktur historis.'
        }
      ],
      validRules: [
        'Fokuskan energi membaca chart pada jendela aktif Sesi London dan New York.',
        'Selalu perhatikan pergeseran 1 jam antara EDT (+12) dan EST (+13) ke WITA.'
      ],
      invalidRules: [
        'Memaksakan transaksi saat jam rollover harian ketika spread membengkak.',
        'Menahan posisi scalping melewati akhir pekan tanpa sadar risiko gap pembukaan Senin.'
      ],
      xauScenario: {
        context: 'Hari Selasa (musim EDT, +12 WITA). Sesi Asia 08:00–12:00 WITA bergerak sempit hanya $6 di antara 2.648–2.654.',
        steps: [
          'Trader tidak memaksakan entry di tengah kotak sempit Asia.',
          'Menjelang Sesi London (14:00 WITA), trader bersiap mengamati ke arah mana harga mulai keluar dan sweep batas Asia.'
        ]
      },
      failedCase: {
        title: 'SL Kena Sweep Saat Jam Rollover Subuh',
        context: 'Trader membiarkan posisi scalping terbuka dengan SL $2 melewati pukul 05:00 WITA (rollover NY 17:00).',
        whyFailed: 'Spread melonjak mendadak dari $0,30 menjadi $2,50 saat pergantian hari pasar sehingga SL langsung kena sweep meski harga tengah hampir tidak bergerak.'
      },
      goldenRules: [
        'Waktu sama pentingnya dengan harga: trade hanya saat Liquidity sehat di London dan New York.',
        'Jumat 17:00 NY s.d. Minggu 17:00 NY adalah tutup pasar resmi akhir pekan.'
      ],
      practiceCta: {
        label: 'Pantau Jam Sesi Aktif di Cockpit Mapping',
        description: 'Lihat langsung bagaimana sesi Asia, London, dan New York terpetakan pada chart XAU/USD.',
        href: '../mapping/index.html'
      },
      quiz: [
        {
          question: 'Saat Amerika Serikat berada pada musim panas (EDT, UTC-4), pukul 02:00 New York (pembukaan London Killzone) setara dengan jam berapa di WITA (UTC+8)?',
          options: [
            '12:00 WITA',
            '14:00 WITA (NY + 12 jam)',
            '15:00 WITA',
            '19:00 WITA'
          ],
          answerIndex: 1,
          explanation: 'Saat EDT (UTC-4), WITA (UTC+8) lebih cepat 12 jam. Jadi 02:00 NY + 12 jam = 14:00 WITA.'
        },
        {
          question: 'Ketika Amerika beralih ke musim dingin (EST, UTC-5), bagaimana pergeseran jam sesi di WITA dibandingkan saat EDT?',
          options: [
            'Bergeser 1 jam lebih awal di WITA (NY + 11 jam)',
            'Bergeser 1 jam lebih lambat di WITA (NY + 13 jam)',
            'Tidak pernah berubah sepanjang tahun',
            'Bergeser 5 jam lebih cepat'
          ],
          answerIndex: 1,
          explanation: 'Saat EST (UTC-5), selisih ke WITA (UTC+8) menjadi +13 jam — sehingga seluruh sesi bergeser 1 jam lebih malam/siang di WITA.'
        },
        {
          question: 'Mengapa trader scalping Gold sangat dilarang membuka posisi atau membiarkan SL ketat terbuka tepat pada jam Rollover harian (sekitar 05:00–06:00 WITA saat EDT)?',
          options: [
            'Karena harga Gold selalu pasti turun di jam tersebut',
            'Karena Liquidity menipis saat pergantian hari bank sehingga Spread bisa melebar 5–10 kali lipat dan sweep SL secara tidak wajar',
            'Karena akun Demo dimatikan permanen di pagi hari',
            'Karena chart hanya menampilkan M1'
          ],
          answerIndex: 1,
          explanation: 'Pada jam rollover pergantian hari kliring bank (17:00 NY), spread melebar tajam sehingga rawan menyentuh SL ketat.'
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
          explanation: 'Pasar Gold dunia resmi tutup mulai Jumat pukul 17:00 waktu New York hingga Minggu pukul 17:00 waktu New York.'
        }
      ]
    }
  ];

  return { LEVELS, LESSONS };
});
