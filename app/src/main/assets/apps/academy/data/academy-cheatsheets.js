/* Amy FX Academy — Kartu Contekan 1 Layar (Bagian I–VI) & Gerbang Jeda Praktik Anti-Overload
 * Pure UMD module (Browser window.AmyAcademyCheatSheets + Node module.exports)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AmyAcademyCheatSheets = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
  'use strict';

  const CHEAT_SHEETS = Object.freeze([
    {
      stageId: 0,
      code: 'Bagian I',
      rangeLabel: 'Bab 01–06',
      title: 'Fondasi Gold, Lot, MT5 & Biaya Broker',
      subtitle: 'Contekan cepat saat baru membuka Akun Demo/Cent dan memasang order di MT5.',
      goldenLine: 'Jangan pernah masuk Akun Standard dengan modal kecil; selalu hitung Lot dari risiko 1% dulu sebelum klik.',
      blocks: [
        {
          title: 'Patokan Angka XAU/USD (Wajib Hafal)',
          items: [
            '**1 Point** = `$0,01` · **1 Pip** = `$0,10` (10 Point) · **$1,00** = **10 Pips** (100 Point).',
            '**BUY** dibuka di harga **Ask** & ditutup di **Bid** · **SELL** dibuka di **Bid** & ditutup di **Ask**.',
            '**SL posisi SELL** wajib ditambah napas Spread (`+$0,40` s.d. `+$0,50`) agar tidak kena garis Ask.'
          ]
        },
        {
          title: 'Rumus Cepat Lot Aman (Risiko 1%)',
          items: [
            '**Akun Standard:** `0.01 lot` = `$1` per gerak `$1,00` (10 pips). Rumus: `Lot = Risiko($) ÷ (SL($) × 100)`.',
            '**Akun Cent (USC):** `$25` tampil jadi `2.500 USC` → aman untuk latihan uang asli pertama.',
            '**Biaya Broker Nyata:** Cek **Spread**, **Komisi** (pada Akun Raw/ECN), **Swap** (biaya inap lewat `05:00/06:00 WITA`, **3× lipat hari Rabu**), & **Slippage** saat berita.'
          ]
        },
        {
          title: '5 Order MT5 & 3 Alat Gambar Wajib',
          items: [
            '**LIMIT** = tunggu harga balik dulu ke tempat murah/mahal (**Buy Limit** di bawah, **Sell Limit** di atas).',
            '**STOP** = tunggu harga tembus dulu baru ikut searah (**Buy Stop** di atas, **Sell Stop** di bawah).',
            '**Alat Wajib:** Aktifkan *Show Ask Line*, pakai **Crosshair** (ukur pips SL), **Horizontal Line** (PDH/PDL), & **Rectangle** (kotak FVG/OB).'
          ]
        }
      ]
    },
    {
      stageId: 1,
      code: 'Bagian II',
      rangeLabel: 'Bab 07–12',
      title: 'Struktur Pasar, BOS vs Sweep & Peta Liquidity',
      subtitle: 'Peta baca arah murni tanpa indikator di H4/H1 → M15 → M5.',
      goldenLine: 'BOS wajib Body Close di luar swing; kalau hanya Wick yang tembus lalu tutup balik di dalam, itu Liquidity Sweep.',
      blocks: [
        {
          title: 'Aturan Baca Struktur & Top-Down',
          items: [
            '**Tren Naik (Bullish):** Higher High (HH) + Higher Low (HL) · **Tren Turun (Bearish):** Lower High (LH) + Lower Low (LL).',
            '**Peran Timeframe:** H4/H1 = Kompas Peta Besar · M15 = Arena Struktur & POI · M5 = Konfirmasi Entry.',
            '**Dealing Range:** Diukur dari titik asal dorongan (*Strong Point*) ke ujung gelombang (*Weak Point*). Harga selalu berayun **ERL ↔ IRL**.'
          ]
        },
        {
          title: '5 Kolam Liquidity Kunci Gold (BSL & SSL)',
          items: [
            '**BSL (Atas):** Kumpulan SL Seller di atas **PDH**, **PWH**, **Asia High**, & **EQH** (Double Top rapi).',
            '**SSL (Bawah):** Kumpulan SL Buyer di bawah **PDL**, **PWL**, **Asia Low**, & **EQL** (Double Bottom rapi).',
            '**Status Level:** Hanya buru level yang masih **Fresh** (belum tersentuh); level yang sudah kena sweep berpindah ke sisi seberang.'
          ]
        },
        {
          title: 'Liquidity Sweep (Purge & Revert) vs Liquidity Run',
          items: [
            '**Liquidity Sweep (Purge & Revert):** Tembusan melawan HTF Bias di awal sesi (Wick Rejection + **Displacement balik + CISD/MSS**) → valid cari pembalikan arah.',
            '**Liquidity Run (Expansion):** Tembusan searah HTF Bias dengan **Body Close penuh** menuju DOL lebih jauh → jangan lawan arus; jadikan target TP atau area lanjutan.'
          ]
        }
      ]
    },
    {
      stageId: 2,
      code: 'Bagian III',
      rangeLabel: 'Bab 13–17',
      title: 'DOL, Daily Bias, AMD & Jadwal Killzone WITA',
      subtitle: 'Tentukan arah tujuan harga dan jam aktif institusi sebelum menyentuh chart M5.',
      goldenLine: 'Jangan pernah trading di jam sepi atau menabrak News Lock — waktu yang tepat mengalahkan 10 indikator.',
      blocks: [
        {
          title: 'Kompas Arah (DOL & AMD Harian)',
          items: [
            '**DOL (Draw on Liquidity):** Magnet tujuan utama hari ini (Liquidity Pool Fresh terdekat atau HTF FVG/OB).',
            '**NY Midnight Open (`00:00 NY`):** **`12:00 WITA` (EDT Mar–Nov)** / **`13:00 WITA` (EST Nov–Mar)**. Hari Bullish = cari BUY di bawah garis ini; Hari Bearish = cari SELL di atas garis ini.',
            '**Siklus AMD:** Asia = *Accumulation* (range sempit) → London/NY awal = *Manipulation* (Judas Swing palsu) → *Distribution* (gerak asli).'
          ]
        },
        {
          title: 'Jadwal Emas WITA (Wajib Cek Musim EDT / EST)',
          items: [
            '**London Killzone:** `14:00–17:00 WITA` (EDT) · `15:00–18:00 WITA` (EST).',
            '**NY AM Killzone (Terbaik Gold):** `19:00–22:00 WITA` (EDT) · `20:00–23:00 WITA` (EST).',
            '**Silver Bullet NY AM:** `22:00–23:00 WITA` (EDT) · `23:00–00:00 WITA` (EST) · **Macro:** menit `xx:50–xx:10`.'
          ]
        },
        {
          title: 'Protokol News Lock & Akhir Pekan',
          items: [
            '**Berita Merah USD (CPI, NFP, FOMC):** Dilarang buka posisi baru **`-15 menit` sebelum s.d. `+30 menit` sesudah** rilis.',
            '**Rollover Harian (`04:00–07:00 WITA`):** Spread melebar drastis — hindari entry.',
            '**Pasar Tutup:** Jumat `17:00 NY` s.d. Minggu `17:00 NY` (tidak ada transaksi akhir pekan).'
          ]
        }
      ]
    },
    {
      stageId: 3,
      code: 'Bagian IV',
      rangeLabel: 'Bab 18–24',
      title: 'Mesin PD Arrays, Setting Fibo OTE & Hierarki Zona',
      subtitle: 'Daftar saringan zona entry institusional dari yang terkuat sampai standar.',
      goldenLine: 'Tidak ada Displacement = tidak ada zona berkualitas. BUY wajib di Discount (<50%), SELL wajib di Premium (>50%).',
      blocks: [
        {
          title: 'Hierarki Kekuatan PD Array (Terkuat → Standar)',
          items: [
            '**#1 ICT Unicorn (Breaker + FVG)** → **#2 Breaker Block (BB)** → **#3 Inversion FVG (iFVG)**.',
            '**#4 High-Prob OB + FVG** → **#5 Fresh FVG (BISI/SIBI)** → **#6 Mitigation Block (MB)**.',
            '**Titik Presisi:** FVG pakai **50% CE** (tengah celah wick); Order Block lebar pakai **50% Mean Threshold** (tengah Body Open–Close).'
          ]
        },
        {
          title: 'Setting Angka Baku Fibonacci OTE (MT5 & TradingView)',
          items: [
            'Hapus level default yang ramai, sisakan hanya **6 angka ini**: `0` (Target), **`0.5`** (Equilibrium), **`0.618`** (Atap OTE), **`0.705`** (Titik Manis OTE), **`0.786`** (Lantai OTE), `1` (Invalidation/SL).',
            '**Cara Tarik Bullish:** Tarik dari **Swing Low (1)** ke **Swing High (0)** → zona `0.618–0.786` jatuh di bawah (Discount).',
            '**Cara Tarik Bearish:** Tarik dari **Swing High (1)** ke **Swing Low (0)** → zona `0.618–0.786` jatuh di atas (Premium).'
          ]
        },
        {
          title: 'CISD vs MSS (Sinyal Balik Arah)',
          items: [
            '**CISD (Lebih Cepat):** Body Close menembus harga **Open** rangkaian candle terakhir yang melakukan Sweep.',
            '**MSS (Lebih Konservatif):** Body Close + Displacement menembus **Swing High/Low** struktural lawan.'
          ]
        }
      ]
    },
    {
      stageId: 4,
      code: 'Bagian V',
      rangeLabel: 'Bab 25–30',
      title: 'Playbook Eksekusi ICT 2022, Filter Gagal & Manajemen Trade',
      subtitle: 'SOP wajib dibaca 30 detik sebelum jari menekan tombol BUY/SELL.',
      goldenLine: 'Fokus kuasai 1 model dulu (ICT 2022) selama 30–50 transaksi — disiplin skip setup jelek adalah mesin profit terbesarmu.',
      blocks: [
        {
          title: '4 Langkah Mekanis Model ICT 2022',
          items: [
            '**1. Sweep HTF:** Harga melakukan Sweep ke level kunci (PDH/PDL, Asia H/L, EQH/EQL) di jam Killzone.',
            '**2. Displacement + MSS/CISD:** Muncul dorongan body tebal mematahkan struktur lawan dan mencetak FVG.',
            '**3. Pullback ke Discount/Premium:** Antre Limit di **FVG / OB / OTE (`62%–79%`)** — jangan kejar pucuk.',
            '**4. SL Struktural + Target DOL:** SL di luar ujung Sweep (+ napas spread), TP1 `1:1,5–1:2` & TP2 di Liquidity Pool seberang.'
          ]
        },
        {
          title: '5 Bendera Merah Auto-Skip (Ada 1 Saja = NO TRADE)',
          items: [
            '1. Masuk jendela **News Lock** (`-15m s.d. +30m` berita merah USD) atau jam **Rollover**.',
            '2. **Tidak ada Displacement** / tidak ada FVG (harga cuma merayap penuh wick).',
            '3. Harga **sudah menabrak target DOL** sehingga sisa ruang R:R di bawah `1:1,5`.',
            '4. Entry di **Premium untuk BUY** atau di **Discount untuk SELL** (melawan Hukum Lokasi).',
            '5. **Daily Loss Limit tercapai** (`-2R` atau 2× SL beruntun dalam sehari) → wajib tutup aplikasi!'
          ]
        },
        {
          title: 'Manajemen Posisi & Jurnal 100 Sample',
          items: [
            '**BEP & Partial:** Geser SL ke BEP hanya setelah harga mencetak BOS baru / minimal `1:1,5` (jangan terlalu cepat di `+0,5R`).',
            '**Tangga 100 Sample:** `50 Backtest (Candle Replay)` → `30 Forward Test (Demo/Cent)` → `20 Live Kecil`.'
          ]
        }
      ]
    },
    {
      stageId: 5,
      code: 'Bagian VI',
      rangeLabel: 'Bab 31–36',
      title: 'Protokol 6 Langkah Mapping Mandiri & ICT Lanjutan',
      subtitle: 'Jalur lanjutan opsional setelah lancar Model ICT 2022 — plus SOP 10 menit dari chart kosong.',
      goldenLine: 'Chart bersih maksimal 5 elemen jauh lebih tajam daripada layar penuh 20 kotak dari semua arah.',
      blocks: [
        {
          title: 'SOP Baku 6 Langkah Mapping Mandiri (10 Menit · Chart Kosong)',
          items: [
            '**1. Cek Kalender & Jam (1 mnt):** Cek berita merah USD (News Lock) & posisi jam Killzone WITA.',
            '**2. Kompas Daily/H4 (2 mnt):** Tandai PDH/PDL, PWH/PWL, dan tentukan Daily Bias + DOL utama.',
            '**3. Peta H1 (2 mnt):** Tandai Dealing Range aktif, NY Midnight Open, serta 1–2 POI HTF (FVG/OB/BPR) di Discount/Premium.',
            '**4. Saringan M15 (2 mnt):** Tandai Asia High/Low & cek apakah sudah terjadi Sweep atau masih menunggu.',
            '**5. Eksekusi M5 (2 mnt):** Tunggu konfirmasi Sweep → Displacement + MSS/CISD → pasang Limit + SL/TP (`R:R ≥ 1:2`).',
            '**6. Audit 5 Bendera Merah (1 mnt):** Lolos semua → antre tenang; gagal 1 → skip hari ini.'
          ]
        },
        {
          title: 'Alat Konfirmasi Lanjutan (Dipakai Selektif)',
          items: [
            '**BPR & NWOG/NDOG:** Irisan Bullish+Bearish FVG (BPR) dan celah ganti minggu/hari sebagai magnet HTF.',
            '**SMT Divergence:** Gold cetak LL tapi Silver gagal LL (atau DXY gagal HH) di jam yang sama = bukti kuat manipulasi.',
            '**Std Dev & CRT:** Proyeksi `-1 / -2 / -2,5 / -4` dari Manipulation Leg untuk target area rekor baru (ATH); CRT 3-candle (Range → Sweep → Ekspansi).'
          ]
        }
      ]
    }
  ]);

  const PRACTICE_CHECKPOINTS = Object.freeze({
    'karakter-xauusd-spread-wita': {
      kicker: 'Jeda Praktik Wajib · Selesai Bagian I (Bab 01–06)',
      title: 'Berhenti Baca Sejenak — Praktik 10 Menit di Demo Dulu!',
      body: 'Fondasi dasarmu sudah beres. Sebelum masuk ke ilmu struktur ICT di Bab 07, praktikkan dulu di Akun Demo MT5: munculkan simbol XAUUSD, nyalakan Show Ask Line, coba hitung 1 setup risiko 1%, dan pasang 1 Buy Limit lengkap dengan SL/TP agar tanganmu terbiasa.',
      primaryLabel: 'Latihan Hitung Lot & Chart Pemula →',
      primaryHref: 'trading-practice/index.html',
      secondaryLabel: 'Buka Kartu Contekan Bagian I',
      stageId: 0
    },
    'model-sweep-mss-fvg': {
      kicker: 'Tonggak Utama · Bekal Trading Inti Sudah Cukup!',
      title: 'Stop Overload: Kamu Sudah Punya 1 Model Lengkap (ICT 2022)',
      body: 'Jangan terburu-buru menghafal semua materi lanjutan sekaligus. Dengan bekal Bab 01–25 saja, kamu sudah bisa melatih mata di 30–50 kasus nyata menggunakan 1 model fokus (Sweep → MSS/CISD → FVG/OB). Selesaikan Bab 26–30 untuk manajemen risiko, lalu praktik dulu sebelum masuk Bagian VI.',
      primaryLabel: 'Langsung Praktik di Candle Replay →',
      primaryHref: 'trading-practice/candle-replay.html',
      secondaryLabel: 'Latihan Kasus ICT 2022 (12 Soal)',
      secondaryHref: 'trading-practice/guided-practice.html?topic=entry-playbook&fromLesson=model-sweep-mss-fvg',
      stageId: 4
    },
    'protokol-100-sample-mandiri': {
      kicker: 'Jeda Praktik · Sebelum Masuk Jalur Lanjutan (Bagian VI)',
      title: 'Lulus Jalur Inti (Bab 01–30)! Praktikkan Dulu Sebelum Lanjut',
      body: 'Seluruh ilmu wajib untuk trading mandiri XAU/USD sudah tuntas di Bab 30. Bagian VI (Bab 31–36) adalah materi lanjutan (BPR, SMT, MMXM, IPDA, CRT) yang jauh lebih mudah dicerna setelah kamu mencoba minimal 20–30 transaksi latihan di Candle Replay atau Akun Demo.',
      primaryLabel: 'Mulai 50 Sample di Candle Replay →',
      primaryHref: 'trading-practice/candle-replay.html',
      secondaryLabel: 'Buka Kartu Contekan Bagian V',
      stageId: 4
    }
  });

  const STAGE_PATH_META = Object.freeze({
    0: { trackLabel: 'Jalur Inti · Pemula Nol', isAdvanced: false },
    1: { trackLabel: 'Jalur Inti · Fondasi ICT', isAdvanced: false },
    2: { trackLabel: 'Jalur Inti · Arah & Waktu', isAdvanced: false },
    3: { trackLabel: 'Jalur Inti · Zona Entry', isAdvanced: false },
    4: { trackLabel: 'Jalur Inti · Siap Eksekusi', isAdvanced: false },
    5: {
      trackLabel: 'Jalur Lanjutan · Opsional Setelah Lancar ICT 2022',
      isAdvanced: true,
      bannerNote: 'Saran anti-overload: pastikan kamu sudah nyaman praktik Model ICT 2022 (Bab 25–30) di Demo/Candle Replay sebelum menambah senjata lanjutan di Bagian VI agar tidak kebanyakan indikator di kepala.'
    }
  });

  const sheetByStage = new Map(CHEAT_SHEETS.map((s) => [s.stageId, s]));

  function getCheatSheetByStage(stageId) {
    const num = Number(stageId);
    return sheetByStage.get(num) || CHEAT_SHEETS[0] || null;
  }

  function getPracticeCheckpointForLesson(lessonId) {
    return PRACTICE_CHECKPOINTS[String(lessonId || '')] || null;
  }

  function getStagePathMeta(stageId) {
    return STAGE_PATH_META[Number(stageId)] || null;
  }

  return Object.freeze({
    CHEAT_SHEETS,
    PRACTICE_CHECKPOINTS,
    STAGE_PATH_META,
    getCheatSheetByStage,
    getPracticeCheckpointForLesson,
    getStagePathMeta
  });
});
