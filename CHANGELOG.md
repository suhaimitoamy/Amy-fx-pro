## 2.0.0-pro.476

- feat(market-intel): Rombak total Kompas Makro Institusional Real-Time (`api/macro-snapshot.js`, `kompas-engine.js`) berbasis kuotasi live DXY, US10Y, VIX, SMT XAU/XAG, SVG Gauge, dan guard aktual kalender USD.
- feat(replay): Hadirkan Candle Replay Pro Studio (`replay-indicators.js`, `chart-engine.js`, `practice-ui.js`) dengan Potong Bar, scrubber, 5 tipe chart, indikator zero-future-leak, magnet OHLC, dan 1-klik order.
- feat(ecosystem): Upgrade 5 Pilar — Command Strip Beranda (`#home-cmd-strip`), Synced Lot Calculator + Breakdown Performa POI, AMY Briefing 30 detik, Jurnal Playbook Scorecard + Leak Detector, serta rotasi multi-key + stale cache backend.
- fix(mapping-poi): Kalibrasi jarak SL Gold 60–100 pips (`BACKFILL_ENGINE_VERSION = 5`), realisasi PnL bertanda minus/plus jujur, serta sinkronisasi Saldo Aktif Profil.

## 2.0.0-pro.475

- feat(navigation): Navigasi Kembali 1-Langkah Global deterministik di seluruh sub-halaman aplikasi.
- feat(practice): Wadah terpadu kontrol TradingView Replay dock (`#tvDrawingDock`, `.cr-top-actions`).
- feat(academy): Buku Interaktif Trading 36 Bab komprehensif dalam 6 Bagian Utama dengan 151 soal Uji Paham.
- feat(mapping): Deteksi visual institusional Inverse FVG (`+iFVG` / `-iFVG`) dan Breaker Block (`+BB` / `-BB`).
- fix(mapping-engine): Audit forensik 7 akar penyebab SL, buffer SL wick XAU/USD realistis, evaluasi SL-first, Dealing Range dinamis.

## 2.0.0-pro.474

- feat(academy): Overhaul kurikulum Amy FX Academy ke Jalur Penguasaan 43 Modul (8 Babak Linier):
  * Kunci Pemahaman Ala Duolingo (`getModuleLockState`, `canOpenLesson`): Menetapkan passing grade >= 80% untuk membuka modul berikutnya secara berurutan.
  * Placement Exam 100% (`evaluatePlacementAttempt`): Tes penempatan 4 soal (harus benar 4/4) untuk membuka modul inti ICT langsung.
  * Guided Reader 5-Tab: Tab navigasi terpandu per modul (`Pahami`, `Pohon Keputusan`, `Kasus Gagal`, `Uji Paham`, `Semua`) dengan format teks aman `fmtRich`.
  * Deep Anti-Confusion Enrichment: Suntikan `extraConceptBlocks`, `mappingSteps`, `decisionTree`, dan `failedCase` pada setiap modul (01-43) via `mastery-deep-enrichment.js` dan `mastery-advanced.js`.
  * Preservasi Pro & Identitas Gradle: Sinkronisasi identitas versi Gradle 950474 & build workflow CI/CD.

## 2.0.0-pro.473

- feat(ai-studio): Sinkronisasi tuntas seluruh fitur & upgrade dari Google AI Studio:
  * AMY Live Assistant Bridge (`amy-local-assistant.js`, `amy-gemini-live-bridge.js`, `dashboard-v2.js`): Ekposur kanonis `getLivePrice`, `buildMappingSnapshot`, `readJournals`, `calculateLot`, `isWeekendClosure`, dan snapshot read-only pasif Mapping Cockpit tanpa menyentuh engine.
  * TwelveData Provider Error Guard (`lib/provider-error-guard.mjs`, `api/twelvedata.js`, `api/heatmap.js`, `api/liquidity.js`): Deteksi otomatis status error & HTTP 429 rate limit dengan fallback payload aman.
  * Amy FX Academy Level 0 (`level-0.js`, `curriculum.js`, `diagram-engine.js`): 6 Bab Fondasi Pemula Nol (Bab 0.1-0.6) dengan 6 diagram SVG interaktif multi-tahap, pemilih jalur (Level 0 vs Level 1 ICT), dan jembatan praktik langsung (mematuhi GEMINI.md Bagian 9).
  * UI Modern Paritas Peta Harga Beranda & Cockpit Mapping (`app.js`, `home-price-chart.js`, `styles.css`): Kontrol segmen timeframe [M15 | M5], tombol Alarm SVG modern, refresh, dan fullscreen.
  * Retensi 180 Hari POI History (`mapping-history-engine.js`): Penyimpanan 6 bulan dengan arsip harian permanen & union-merge GitHub Cloud Sync.
  * Pure Helper Modules (`cockpit-bridge-helpers.js`, `tests/pro-95-upgrades.test.mjs`): Jembatan POI Mapping ke Jurnal (`buildMappingJournalPrefill`), evaluasi lock berita (`evaluateMappingNewsLock`), evaluasi kesiapan pemula (`evaluateLevel0Readiness`), dan ringkasan 7 hari jurnal.

## 2.0.0-pro.472

- feat(notification): Penggantian menyeluruh notifikasi HP Android & foreground Web Amy FX Pro ke sistem POI Mapping Cockpit (M5 & M15 FVG & OB).
- feat(notification): Format notifikasi presisi terstandarisasi:
  * Disentuh / Sentuh 50% CE: `[🔴/🟢] [BUY/SELL] [FVG/OB] [M5/M15] · [Disentuh / Sentuh 50% CE] ($low–$high)` dengan detail `CE | SL | TP1 | TP2`.
  * Update hasil siklus penuh: `🎯 TP1 BEP ✓`, `👑 TP2 DOL ★` (+100 Pips), dan `🛡️ Jebol SL ✕` lengkap dengan rentang zona & maks gerak.
- fix(notification): Menonaktifkan total sinyal engine lama (`PULLBACK SELL/BUY CISD` dan `amy_entry_v3`) agar tidak bentrok.
- feat(anti-spam): Deduplikasi ketat per `zoneId + eventType` (1 zona POI hanya kirim 1x saat disentuh/sentuh CE, dan 1x saat outcome resolusi). Tetap mematuhi filter pasar tutup akhir pekan (`isWeekendClosure`) dan perlindungan `🛡️ NEWS LOCK`.

## 2.0.0-pro.471

- fix(notification): Filter anti-spam background Android & web menonaktifkan alert counter-trend pullback (PULLBACK SELL/BUY CISD) agar notifikasi hanya murni berfokus pada sinyal Trend Utama, Peluru Utama Grade A+, dan siklus POI FVG/OB M5 (CE, TP1 BEP, TP2 DOL, SL).

## 2.0.0-pro.470

- feat(notification): Integrasi notifikasi Android real-time untuk siklus penuh POI Mapping (Opsi A & B): sentuh CE dengan denting bel emas kristal, pengawalan TP1 BEP, panen TP2 DOL 100 pips, dan batas disiplin SL dengan anti-spam deduplication serta normalisasi risiko aman.

## 2.0.0-pro.469

- fix(android-filechooser): Penyempurnaan `onShowFileChooser` di `MainActivity.kt` dengan wrapper `Intent.createChooser`, toleransi ekstraksi URI `clipData` & `data.data`, perbaikan CSS overlay `font-size: 100px` (mencegah shadow DOM button 0x0 di WebView), dan pemisahan role button `mt5DropLabel` untuk responsivitas sentuh instan di Android.

## 2.0.0-pro.468

- fix(journal-ocr): Adopsi pemilih file touch overlay dari AI Studio (`.jl-mt5-file-overlay` mengisi penuh label dengan `inset: 0`) & toleransi MIME type gambar Android MediaStore/DocumentsContract (`application/octet-stream` atau MIME kosong).
- feat(journal-ocr): Direct Client-Side Gemini Vision Engine dengan rotasi multi-key Base64 terlindungi (`gemini-2.5-flash`, `gemini-flash-latest`) untuk memproses OCR MT5 langsung dari HP tanpa terhambat Vercel 404.

## 2.0.0-pro.467

- fix(journal-ocr): Perbaikan aktivasi file picker screenshot MT5 pada Android WebView dengan menambahkan click listener langsung pada `mt5DropLabel` dan clipboard paste handler.
- feat(journal-ocr): Direct Client-Side Gemini Vision Engine dengan rotasi multi-key (`gemini-2.5-flash`, `gemini-flash-latest`) untuk memproses OCR MT5 langsung dari HP tanpa dependensi Vercel proxy.
- fix(api): Perbaikan model name pada `/api/mt5-scan` ke model resmi Gemini 2.5 Flash serta sinkronisasi endpoint ke repo Vercel `Amy-fx`.

## 2.0.0-pro.466

- feat(journal): MT5 Screenshot OCR Auto-Import (`api/mt5-scan.js`, `apps/journal/mt5-scan-ui.js`, `apps/shared/mt5-ocr-parser.js`) melalui Gemini Vision API dengan konversi pips XAU/USD, Cent USC handling, shift jam broker ke WITA, dan deduplikasi cerdas.
- feat(scroll): Global Android Pull-to-Refresh Scroll Guard (`apps/shared/amyfx-scroll-guard.js`) dimuat otomatis via theme controller untuk mengamankan dialog, overlay, dan chart tanpa mengganggu Chart Gold di Mapping.
- feat(practice): Guided Practice 100 Kasus (`guided-exercises.json`, `guided-practice.js`, `guided-session.js`) lengkap dengan kalkulasi penguasaan pilar ICT dan validasi bebas bocoran masa depan.

## 2.0.0-pro.465

- feat(sync): Cloud Sync via GitHub Private Repo (`apps/shared/github-cloud-sync.js`) untuk backup & restore Jurnal, Catatan Pribadi, Profil Simulasi, Daily Loss Guard, progres Academy, & Bookmark Replay.
- feat(security): Eksklusi ketat token PAT & media blob biner dari payload snapshot JSON, validasi format repo/branch, dan penanganan token lokal terisolasi.
- feat(sync): Conflict Guard anti-timpa data lintas perangkat dengan pengecekan `updatedAt` & `deviceId`, serta auto-sync latar belakang dengan debounce 5 detik.
- feat(ui): Grup pengaturan vertikal baru "Cloud Sync (GitHub)" di halaman Pengaturan selaras Dark & Light mode.
- test(sync): Unit test lengkap 6/6 suite di `tests/github-cloud-sync.test.mjs`.

## 2.0.0-pro.373

- feat(mapping): Implementasi logika displacement FVG murni TradingView ICT Concepts [amygmgo] dengan filter ketebalan minimum (celah mikro < 0.8 point otomatis ditolak) dan kalkulasi 50% Consequent Encroachment (CE).
- feat(chart): Visualisasi garis putus-putus 50% CE emas pada area POI chart candlestick tanpa mengubah integritas kanvas harga.
- feat(mapping): Penambahan modul Dealing Range (Equilibrium, Discount, Premium) dan penentuan status lokasi harga (sehat vs di pucuk ekstrim).
- feat(mapping): Penilaian konfluensi multi-layer 8 lapis (Skor 0–100) dengan invalidation guard hard-cap saat struktur H1 batal.
- feat(notification): Kebijakan notifikasi sniper ketat — penghapusan total notifikasi konflik dan pendekatan area premature; notifikasi hanya dikirim saat News Lock atau Peluru Utama A+ terkonfirmasi searah trend.
- fix(narration): Penyempurnaan narasi kontekstual edukatif bahasa Indonesia yang jelas membedakan fase pullback korektif dari setup konfirmasi.

## 2.0.0-pro.372

- fix(mapping): Memperbaiki bug fatal crash kalkulasi targetLevel pada market-context engine Supabase.
- fix(tournament): Otomasi kalkulasi skor Turnamen Driver (+10 saat TP, -15 saat SL) dari data riwayat setup tertutup.
- fix(mapping): Memperbaiki deteksi MSS Driver #3 dengan validasi kesegaran break (8 jam) dan proximity filter POI Driver #1.
- fix(offline): Mencegah penghapusan cache lokal saat terjadi gangguan jaringan sesaat pada panel Konteks.
- fix(route): Mendukung rute deep link notifikasi `#context` dan `#scalper` pada sinkronisasi navigasi.

## 2.0.0-pro.371

- feat(notification): Sinkronisasi penuh narasi notifikasi "Scalp Kilat" pada fase perlawanan arah (M15 vs H1) dan deployment runtime engine backend Supabase.
- fix(sync): Sinkronisasi regex versi Pro pada pengiriman push notifikasi backend FCM.

## 2.0.0-pro.370

- feat(mapping): Menambahkan Driver #6 "Human MTF Rapid Scalper" (Sesi London & NY, frekuensi tinggi 3–5 setup/hari, RR 1:1.3R, cut loss dini -0.35R, dengan catatan WR wajar ~54% murni).
- feat(tournament): Reset seluruh skor poin 6 Driver Turnamen menjadi 0 pts agar kompetisi klasemen dimulai dari garis start yang sama.
- fix(tournament): Validasi evaluasi paralel seluruh 6 driver — tidak ada driver yang terkunci di status Standby secara sepihak saat pasar aktif.

## 2.0.0-pro.369

- fix(mapping): Memperbaiki bug isolasi Standby pada Turnamen Driver Top 1–5; kini seluruh driver mengevaluasi kondisi pasar dan dapat menyala secara simultan (High-WR Sniper, Adaptive Smart Runner, Swing CHoCH OTE, Multi-Driver Ensemble, dan Conservative Shield).
- feat(tournament): Indikator status dinamis turnamen di header Klasemen Turnamen Driver dengan deteksi aktivasi paralel dan sinyal scalp kontra-tren.
- feat(backtest): Validasi resmi strategi Deep OTE menggunakan framework Backtrader berhasil diverifikasi dengan Pure Win Rate 68%–77% pada data candle historis M15.

## 2.0.0-pro.368

- feat(mapping): Integrasi Turnamen Driver Top 1–5 hasil riset lab 8 tahun ke Peta Konteks Gold.
- feat(notifications): Narasi notifikasi seluler yang lebih cerdas dan ringkas (Grade A+, Scalp Kilat, dan Tahan Dulu saat News Lock).

## 2.0.0-pro.365

- feat(intel): Tab Kompas Fundamental XAU/USD dengan Briefing Harian Terstruktur 5 Poin (USD & The Fed, Safe Haven, Sentimen Pasar Scorecard, News Kalender Terhubung, dan Kesimpulan Fundamental).
- feat(calendar): Integrasi dinamis angka kalender ekonomi USD hari ini (Forecast & Previous riil) langsung ke skenario reaksi pasar dan bias arah emas.
- feat(ui): Tata letak kartu briefing modern berstandar institusi, responsif untuk layar HP, dan render instan tanpa loading screen.

## 2.0.0-pro.364

- feat(intel): Transformasi Tab ke-3 Market Intel menjadi Kompas Fundamental Harian XAU/USD terintegrasi Rantai Efek Domino Makro (CPI ➔ NFP ➔ The Fed ➔ DXY ➔ Gold) dan Skenario Playbook berita.
- feat(calendar): Default kalender ekonomi otomatis fokus ke Gold Macro Drivers (USD High & Medium Impact), serta penataan cerdas lencana agenda pidato / non-data konsensus.
- perf(intel): Hapus blocking loading screen pada Market Intel dan implementasikan Instant Cache Render (Stale-While-Revalidate) untuk perpindahan tab secepat kilat.
- feat(academy): Perbarui dataset candlestick Candle Replay & 60 bank soal Guided Practice menggunakan data real XAU/USD modern 2025/2026 ($2.600+).

## 2.0.0-pro.363

- feat(intel): Tambahkan Tab ke-3 Market Intel — Sentimen The Fed (Barometer Hawkish vs Dovish CME FedWatch, probabilitas suku bunga, target proyeksi FOMC, serta analisis dampak makro ke XAU/USD).
- feat(ui): Terapkan stylesheet Natural UI ke seluruh modul internal (Mapping, Journal, Academy, dan Market Intel) untuk pengalaman visual yang selaras dan terpadu.
- fix(nav): Hapus injeksi tombol melayang "← Amy FX" (`injectHomeButtonForLocalModule`) yang menutupi kontrol chart dan action button.
- fix(gesture): Kunci `ReplayRefreshPolicy` pada seluruh workspace chart (Replay, Chart Analysis, Guided Practice, dan Mapping) agar tarikan gestur vertikal chart tidak memicu reload halaman secara tidak sengaja.
- fix(service): Netralkan kompatibilitas `ScannerService` dengan beralih ke `startService` biasa guna mencegah crash `ForegroundServiceDidNotStartInTimeException` pada Android 8–14+.
- perf(assets): Diet aset aplikasi — bersihkan 23 MB direktori duplikat lama dan pisahkan skrip development python dari bundel APK.
- perf(api): Optimasi masa daur ulang SSE pada `api/live-price.js` menjadi 25 detik untuk efisiensi kuota serverless.

## 2.0.0-pro.356

- fix(palette): Perbaiki bug pop up color picker di palet warna utama (Latar, Kaca, Teks, Aksen) yang menutup otomatis setelah 1 detik. Panel customisasi warna kini dipertahankan stabil tanpa me-remove DOM elemen yang sedang aktif, dan struktur cell diperbarui tanpa wrapping label ganda.
- fix(profile): Hapus baris teks profil yang tidak diperlukan: AMY Global AI Settings, Status Koneksi, dan Scanner Mapping.
- feat(theme): Sinkronisasi tema secara in-place tanpa mereset struktur input dan tambahkan indikator kode warna HEX secara real-time.

## 2.0.0-pro.355

- feat(ui): Natural UI Overhaul — tampilan lebih bersih dan natural, tidak lagi terasa "AI-generated".
- fix(nav): Bottom navigasi diubah ke full-width flat — hapus floating pill border-radius 24px.
- fix(card): Semua card dan panel kini memakai solid surface — glass morphism dikurangi drastis, hanya header & nav.
- fix(bg): Background disederhanakan menjadi 1 gradient — hapus 5–6 lapis radial + repeating gradient "AI wallpaper".
- fix(radius): Border radius dinormalisasi ke 8–14px (sebelumnya 20–24px seragam).
- fix(typography): Font weight dinormalisasi max 700; letter-spacing dikurangi; hapus text-transform uppercase pada label.
- fix(color): Palette warna lebih natural — accent biru lebih redup, buy/sell tidak neon, glow effect dihapus.
- fix(hero): Hapus ghost text "AMY" dan circle glow dekoratif di hero card beranda.
- fix(logo): App logo lebih clean tanpa box-shadow berlebihan.

## 2.0.0-pro.354

- fix(profile): perbaiki bug panel customisasi warna & kaca tidak muncul di halaman Profil.
- Akar masalah Pro353: `selector.replaceWith(section)` menghapus `.theme-selector` dari DOM sehingga panel tidak dapat di-inject ulang.
- Semua fitur glassmorphism Pro353 dipertahankan: preset kaca berwarna (Obsidian, Kristal Es, Safir, dll.), slider transparansi, dan preview efek kaca real-time.

## 2.0.0-pro.353

- Personalisasi Kaca & Tampilan: Menggabungkan pengaturan tampilan dan personalisasi warna menjadi satu panel glassmorphism terpadu.
- Kontrol Transparansi Kaca: Menambahkan slider transparansi kaca akrilik, pilihan latar belakang transparan, dan preview efek kaca secara real-time.
- Preset Kaca Berwarna: Menyediakan koleksi preset kaca estetik (Obsidian, Kristal Es, Safir Cobalt, Zamrud Hutan, Royal Amethyst, Amber Gold).

## 2.0.0-pro.352

- Membersihkan teks disclaimer dan keterangan yang tidak diperlukan pada Menu Utama, Mapping, Berita, dan Academy.
- Menjaga tampilan workspace tetap fokus dan rapi tanpa clutter visual.

## 2.0.0-pro.351

- Riwayat Candle Replay memperbaiki bukti TP/SL lama dan menyediakan hapus per keputusan.
- Kartu terakhir dibaca hanya tampil di halaman Belajar Trading, bukan Trading Practice.
- Analisis Mapping memprioritaskan bukti inti dan menyimpan detail sekunder dalam panel ringkas.

## 2.0.0-pro.350

- Keep entry history inside Candle Replay; show saved decisions immediately and after reload.
- Show waiting/active/TP/SL states with preserved candle evidence across timeframe changes.
- Preserve newer fallback outcomes, pin saves to the clicked cursor and exclude pre-fill candles from later outcome checks.

## 2.0.0-pro.349

- Memperbaiki pembacaan catatan Candle Replay ketika penyimpanan jatuh ke fallback lokal setelah transaksi IndexedDB gagal.
- Menambahkan bukti hasil SL/TP di Riwayat: level, waktu candle, rentang low/high, dan penanda candle ambigu.
- Mempertahankan aturan konservatif: jika SL dan TP tersentuh pada candle yang sama, hasil dicatat sebagai SL.

## 2.0.0-pro.348

- Menyatukan tipografi, jarak, radius kartu, header, navigasi, dan state kosong pada lima halaman utama.
- Menghubungkan halaman Mapping ke sistem desain bersama tanpa mengubah engine, kalkulasi, atau alur data trading.
- Meningkatkan keterbacaan mode terang serta menyusun ulang kartu Berita, Jurnal, dan Academy untuk layar ponsel.

## 2.0.0-pro.347

- Menghapus tautan, label, dan branding sumber Telegram dari tampilan serta notifikasi berita; feed tetap dipakai secara internal.
- Menambahkan sanitasi defensif agar URL Telegram dan nama SM News 24 Jam tidak ikut tampil di isi berita.
- Menambahkan personalisasi warna latar, kartu, teks, dan aksen di menu Profil dengan penyimpanan lintas modul dan tombol reset.
- Menyelaraskan Market Intel dengan token tema bersama untuk memperbaiki keterbacaan mode terang.

## 2.0.0-pro.341

- Fix blank home on first open and invalid saved root tabs.
- Use the same ICT candle provider/model for News hero, BSL/SSL and liquidity heatmap.
- Add readable liquidity bands, side filters, level counts, distances and source freshness.
- Brighten frosted surfaces across all principal modules and synchronize Mapping chart theme.

# Changelog

## 2026-08-17 — Zoom Grafik Gaya TradingView & Sinkronisasi Gambar

- Mengaktifkan zoom jepit eksplisit dan penskalaan sumbu waktu sehingga lebar lilin dapat diperbesar atau diperkecil secara horizontal.
- Menjaga ruang grafik kosong tetap interaktif dalam mode Pilih/Edit sementara gambar yang dilukis dan pegangan tetap dapat diedit langsung di mobile.
- Menggambar ulang overlay gambar dari jangkar TIME + PRICE yang tidak dapat diubah pada transformasi logical-range, pane-size, wheel, pointer, touch, dan price-scale.
- Menambahkan jangkauan regresi yang membuktikan koordinat panah mengikuti perubahan skala horizontal dan vertikal tanpa mengubah koordinat pasar yang tersimpan.

## 2026-08-17 — Perbaikan Gambar Latihan Perdagangan Mobile

- Secara otomatis memilih setiap gambar yang selesai sehingga dapat langsung dipindahkan, diubah ukurannya, atau dihapus.
- Menambahkan goresan hit tidak terlihat 28px untuk garis tipis dan jalur plus target sentuh 36px di sekitar pegangan titik.
- Memilih objek dari target SVG yang sebenarnya dirender sebelum kembali ke pengujian hit geometris.
- Memindahkan entri Text, Note, dan Price Note ke dialog tetap yang aman untuk mobile di luar shell grafik yang terpotong.
- Menambahkan cakupan Pointer Events fungsional untuk persistensi drag dan cakupan render/pilih untuk setiap jenis gambar yang didukung.

## 2026-07-11 — Pengerasan Konteks Pasar & Perutean Notifikasi

- Mengganti validasi FVG rezim terbaru dengan ATR point-in-time.
- Membuat toleransi equal-high/equal-low, external-level, sweep, dan deduplikasi sadar volatilitas.
- Memerlukan Order Blocks berasal dari break struktur yang terungkap secara valid dan mencetak asal imbalance mereka.
- Menambatkan HTF dealing ranges ke swing struktural yang dikonfirmasi alih-alih level terdekat di sekitar harga saat ini.
- Menurunkan standalone BOS/CHOCH dan candle displacement ke context-only; mereka tidak dapat lagi memicu eksekusi.
- Menulis ulang penjelasan Pemetaan menjadi Bahasa Indonesia sederhana: arah, konfirmasi, target, tindakan, dan risiko.
- Mengurutkan berita Telegram berdasarkan ID pos numerik sebelum memfilter dan mengurangi kedaluwarsa cache tepi.
- Menambahkan deep link per berita, scrolling item fokus, retry sinkronisasi terbatas, dan rute native generik untuk notifikasi News, Journal, dan Academy.
- Menambahkan lima pemeriksaan regresi; 14 tes JavaScript sekarang lulus.
- Divalidasi ulang candle Januari–Juni: tingkat hit TP1 70,09% di 117 perdagangan, +14,76R, faktor keuntungan 1,34, dan drawdown maksimal 6,34R setelah asumsi biaya $0,30.

## 2026-07-11 — Mode Presisi M15

- Membatasi setup Pemetaan yang dapat ditindaklanjuti dan target pemindai native ke M15.
- Menambahkan TP1 pada 1R, amankan 90% keuntungan, break-even runner, dan siklus hidup TP2 ≥2R.
- Menambahkan status TP1 Secured, Runner to TP2, TP1 + BE, dan TP2 Hit live.
- Digantikan oleh validasi ulang Konteks Pasar yang lebih ketat di atas.

## 2026-07-11 — Pengerasan Produksi Logika Pemetaan

- Mencegah likuiditas yang tersapu menjadi aktif lagi setelah pembalikan harga.
- Mengganti validasi historis ATR terbaru dengan ATR point-in-time.
- Memerlukan candle sweep untuk menutup kembali di dalam level likuiditas.
- Menaikkan RR setup minimum ke 1:2 dan membuat pelanggaran fatal.
- Menggabungkan struktur HTF dengan lokasi Premium/Discount.
- Memperbaiki preseden Silver Bullet di dalam sesi New York.
- Menambahkan tujuh tes mesin produksi regresi.

## 2026-07-11 — UI Intelijen Institusional

- Menambahkan Pita Perintah Pasar XAU/USD bersama ke Market Intel dan Pemetaan.
- Menambahkan Briefing Pasar berbasis aturan yang menggabungkan likuiditas, Pemetaan, sesi, dan risiko berita.
- Meningkatkan Peta Node Likuiditas dengan kekuatan kedekatan/kesegaran dan penekanan Nearest Draw.
- Menambahkan Setup Lifecycle Rail untuk Sweep → MSS → FVG/OB → Entry → Target.
- Menambahkan pembatalan permintaan, refresh sadar visibilitas, penanganan reduced-motion, dan update live-price Pemetaan yang ditargetkan.

## 2026-07-10 — Stability Pass

## 2026-07-11 — Mockup UI Pass

- Mengerjakan ulang shell utama menuju mockup Amy FX hitam-dan-emas: Beranda, Proyek, Koleksi, dan Profil.
- Menambahkan dashboard rumah kompak, akses modul cepat, riwayat koleksi lokal, dan status profil perangkat.
- Menyederhanakan Mapping Dashboard menjadi kartu price, bias, timeframe, setup focus, dan active-session.
- Menjaga diagnostik Pemetaan terperinci tersedia di bawah Analyze alih-alih menampilkan setiap blok sekaligus.

- Menonaktifkan notifikasi setup Pemetaan otomatis untuk mencegah konflik dengan peringatan pemindai native.
- Memperbaiki retensi cache candle menggunakan detik alih-alih milidetik.
- Mengecualikan candle REST yang masih terbentuk terbaru dari analisis Pemetaan.
- Menyelaraskan expiry target Pemetaan dan pemindai native ke 24 jam.
- Memperbaiki penanganan konflik setup dalam keyakinan Keputusan.
- Meningkatkan propagasi error penyedia TwelveData.
- Mengecualikan diagnostik Pemetaan sekunder di belakang bagian yang dapat dikembangkan di mobile.
- Mengganti stub auth Academy dengan kode akses lokal perangkat.
- Menyinkronkan aset Market Intel Liquidity ke sumber APK Android.
- Mengembalikan sumber MappingLogicCore Kotlin yang hilang digunakan oleh tes unit.

## 1.2.0 - 2026-06-25

### Android / Build

- Target SDK dinaikkan ke 35.
- Version name disiapkan ke 1.2.0.
- Release build mengaktifkan R8 minify dan resource shrink.
- Debug build dipisahkan dengan suffix `.debug`.

### Security

- Menambahkan `SecurePrefs.kt` untuk penyimpanan API key dengan encrypted preferences.
- Menambahkan ProGuard rules agar WebView bridge tetap aman saat R8 aktif.

### Scanner

- Menambahkan cooldown notifikasi 30 menit per level BSL/SSL.
- Menambahkan expiry target Mapping setelah 24 jam.
- Menambahkan reconnect bertahap.
- Memisahkan channel notifikasi foreground scanner, target alert, dan info.
- Tap notifikasi target membuka Mapping.

### Data

- Menambahkan index SQLite tambahan.
- Menambahkan cleanup candle cache berdasarkan umur data.
- Menambahkan fungsi clear cache dan cek ukuran storage.

### Mapping

- Menambahkan `MappingLogicCore.kt` untuk logic dasar swing, BOS/CHOCH, FVG, OB, dan setup score breakdown.
- Menambahkan unit test awal untuk score, FVG, dan swing detection.

### Docs

- Menambahkan dokumentasi arsitektur.
- Menambahkan dokumentasi setup API.
