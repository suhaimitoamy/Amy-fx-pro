# Amy FX Project Guidelines

## UI Design Guidelines (Dark Premium Fintech)

When developing or modifying UI components for the **Amy FX** project, strictly adhere to the following invariant rules to maintain a professional, high-end "Dark Premium Fintech" aesthetic:

1. **Theme & Vibe:** 
   - **Dark Premium Fintech**: Use very dark/pure black backgrounds (e.g., `#0a0a0a`).
   - Implement subtle glowing effects (`box-shadow` with low opacity) instead of flat colors.
   - Maintain a "modern terminal" nuance.

2. **Color Palette:**
   - **Gold** (`var(--gold)`): Used for accents, current price highlights, active badges, and network connection lines.
   - **Neon Red** (`var(--red)` / `#ff4c4c`): Strictly for Resistance, Ask Liquidity, BSL, or Sell signals. Must include a soft red glow.
   - **Neon Green** (`var(--green)` / `#00d97e`): Strictly for Support, Bid Liquidity, SSL, or Buy signals. Must include a soft green glow.

3. **Typography:**
   - **Numbers & Prices**: Must always use a `monospace` font (e.g., `Courier New`) to look like a professional Bloomberg terminal. Make them bold/thick.
   - **Labels**: Clean, small, uppercase sans-serif text.

4. **Component Architecture:**
   - Avoid plain vertical lists for data. Use data-rich dashboard components (e.g., Node Cards, Segmented Bars, Network Trees).
   - Ensure clear visual hierarchy (Current Price is always the glowing center/focus).

## Chart Gold vs Peta Harga & Invariant Proteksi (Pro 403)

1. **Paritas Card (100% Mirip Peta Harga):**
   - Card **Chart Gold** di Cockpit Mapping (`apps/mapping/index.html`) dan Card **Peta Harga** di Beranda (`index.html`) identik 100% dalam struktur kontainer glassmorphism (`.gold-price-panel`), kontrol timeframe [M15 | M5], heading, live price di kanan, feed candle, dan canvas chart 340px.
2. **Pembeda Utama:**
   - Di Chart Gold terdapat layer visualisasi indikator ICT teknikal lanjutan yang bersumber dari skrip [`AMY_ICT_NextGen.pine`](apps/indikator/files/AMY_ICT_NextGen.pine) (BSL/SSL, PDH/PDL, PWH/PWL, Asia High/Low, FVG/OB, BOS/MSS, Trend Invalidation).
3. **Protokol Pemulihan Error (Golden Rule):**
   - Jika Chart Gold mengalami error atau glitch visual saat pengembangan indikator, **AI DILARANG mengutak-atik struktur sembarangan dan WAJIB MENUNGGU PERINTAH LANGSUNG dari user untuk disamakan kembali dengan Peta Harga.**

## Active Forming Candle Live (TradingView Parity) (Pro 419)

1. **Lilin Terakhir Bergerak Live (`candlestickSeries.update`):**
   - Di kedua chart (Chart Gold Mapping dan Peta Harga Beranda), lilin aktif periode berjalan (*forming candle*) kini diperbarui secara *real-time* mengikuti setiap *tick* harga live (`amyfx:twelvedata-price` / `amyfx:live-price-display`).
   - Body lilin, jarum atas (High), dan jarum bawah (Low) bergerak dinamis tanpa menunggu 15 menit selesai.
2. **Integritas Analisis ICT Tetap Terkunci (*Zero Repainting*):**
   - Seluruh logika keputusan (FVG, 50% CE, BOS, MSS, dealing range, skoring konfluensi, checklist pre-trade) tetap dihitung 100% dari closed candles terkonfirmasi.
   - Weekend Anti-Spam: Tidak ada sintesis lilin saat penutupan pasar akhir pekan.

## Fast Dev Mode & Larangan Full npm test Otomatis (Pro 404)

1. **Dilarang Menjalankan Full npm test (148 Suites) Secara Rutin:**
   - Menjalankan 148 suite tes penuh setiap kali edit kecil memakan waktu 45-60 detik dan membuang puluhan ribu token konteks.
   - **Full `npm test` HANYA dijalankan jika pengguna secara eksplisit meminta** (misal: *"jalankan test"* atau sebelum rilis APK).
2. **Standar Pengujian Cepat (Fast Dev Verification):**
   - **Syntax check instan (0.05s):** `node --check <file-yang-diedit>`
   - **Targeted test (0.2s):** Jalankan hanya 1 file tes yang relevan secara spesifik jika diperlukan (contoh: `node --test tests/mapping-chart-axis-pro379.test.mjs`), bukan 148 file.
   - **Visual verification:** Validasi langsung lewat server preview browser `http://localhost:8080/`.

## Cockpit Mapping UI & Presentation (Pro 405 / V4 Upgrade)

1. **Kartu 1 (Amy Live Assistant):** Menampilkan status navigasi objektif V4 (`SEARAH BULLISH/BEARISH`, `FASE PULLBACK`, `MANIPULASI BAWAH/ATAS`, `PASAR TUTUP`, atau `NEWS LOCK`), pesan primer narasi fase, sub-pesan panduan tindakan (misal: *"Harga di Demand/Discount — JANGAN SELL! Tunggu M5 CHoCH Bullish"*), serta status Anti-Chase.
2. **Kartu 2 (Chart Gold):** 100% paritas Peta Harga, visual garis model ICT & Entry Assistant V3.
3. **Kartu 3 (AMY ICT CONTEXT V4):** Tabel Kompas Navigasi Konteks Pasar Murni 11 Baris (Matriks 3-Timeframe H1/M15/M5, Fase Narasi Market, Dealing Range & Zona %, Magnet Atas BSL/PDH, Magnet Bawah SSL/PDL, Sesi & Asia Range, Inducement IDM status, Zona Supply M15, Zona Demand M15, Batas CHoCH H1, dan Panduan Konteks Aksi).
4. **Kartu 4 (AMY ENTRY ASSISTANT V3 PLAN):** Kartu aksi trading bersih dengan grid 4 kolom (ENTRY, SL, TP1, TP2), Anti-Chase pill, Pullback banner, alasan inti eksekusi, dan tombol "Tampilkan Level di Chart".
5. **Tab Analyze & Driver Tournament:** 6 Driver dan setups dipusatkan di accordion paling bawah Tab Analyze sebagai arsip/riset. Bebas ketergantungan library Supabase.

## Weekend Gap & Cold-Start Stitching (Pro 406)

1. **Weekend Gap Tolerant Bridging (`isWeekendGap` & `pair` & `contiguous`):**
   - Jeda penutupan akhir pekan (Jumat 17:00 NY s.d. Minggu 17:00 NY, selisih ~48 jam / 172800 detik) ditoleransi sebagai kontinuitas sah antara lilin penutupan Jumat dan pembukaan Minggu.
   - Lilin Jumat sore tetap dihitung sebagai riwayat struktur yang sah, memenuhi syarat $\ge 40$ bar M15 dan $\ge 30$ bar H1 sejak awal buka pasar hari Minggu.
2. **Fair Market Elapsed Time (`marketElapsedSeconds`):**
   - Usia data candle dihitung hanya selama jam pasar buka (waktu pasar tutup 48 jam akhir pekan tidak dihitung sebagai waktu kadaluarsa).
   - Menghilangkan status palsu `DATA TERLAMBAT` saat pembukaan pasar hari Minggu maupun selama libur akhir pekan.

## Penyelarasan Sesi Harian PDH/PDL New York 17:00 Close (Pro 407)

1. **Cutoff Sesi Harian Standar Gold (17:00 New York Close):**
   - Pengelompokan lilin intraday ke dalam hari perdagangan di `nextgen-indicators.js` diselaraskan dengan batas resmi pasar Gold / Forex internasional (17:00 NY Close / `America/New_York`), bukan 00:00 WITA.
   - Menghilangkan masalah di mana rekor tertinggi sesi New York (misal 4184) terdorong masuk ke keranjang hari ini di WITA dan menyebabkan PDH kemarin tertinggal di 4179.
2. **Preseden Level Otoritatif Server (D1):**
   - Nilai PDH/PDL harian otoritatif dari D1 yang disediakan server / konteks (`serverAmyLevels.pdh`, `liquidityLevels`, `context.pd`) diprioritaskan (`Math.max(serverPdh, localPdh)`), mencegah distorsi dari keterbatasan buffer 300 lilin intraday.

## M15 Otoritas Penuh & Konfirmasi Eksekusi Mandiri (Pro 408)

1. **M15 Direct Confirmation Authority:**
   - Candle M15 yang resmi close adalah otoritas konfirmasi penuh dan mandiri untuk memicu eksekusi tanpa terblokir menunggu M5 break struktur.
   - Kriteria konfirmasi mandiri M15:
     a) M15 Wick Rejection >= 1.2x body di POI atau likuiditas (SSL/BSL/Asia/PDH/PDL).
     b) M15 Displacement Break (BOS / MSS) searah bias dengan body tebal (`bullDisp` / `bearDisp`).
     c) M15 50% CE Bounce di Dealing Range yang sehat (Diskon untuk BUY, Premium untuk SELL).
2. **Aktivasi Otomatis & Trigger Pendukung M5:**
   - Saat M15 close memenuhi salah satu kriteria di atas:
     - Status konfirmasi menjadi `CONFIRMED`.
     - Status eksekusi menjadi `READY` atau `READY TO REVIEW` (Grade A+).
     - Pemicu Entry Assistant V3 Plan aktif dan menghasilkan rencana eksekusi (Entry, SL, TP1, TP2, RR).
     - Peluru Utama A+ aktif tanpa harus terblokir menunggu M5 break.
   - M5 tetap diizinkan sebagai trigger pendukung jika mendahului, namun M15 close memiliki otoritas penuh.

## Overhaul Pemicu Entry Limit Driver Mapping & Dekopling M15 (Pro 408)

1. **Jendela Waktu Realistis & Likuiditas Valid:**
   - `entry_deadline` diperpanjang dari 15 menit (900s) menjadi 60–90 menit (`Math.max(3600, driver.hold)`), memberi ruang nafas bagi pasar Gold untuk retrace ke area limit.
   - Seleksi target likuiditas memilih level yang memiliki ruang bagi target (`validLiquidity || nearestLiquidity`), menghilangkan masalah demosi ke `WAITING_TARGET` akibat pivot minor 2-bar.
2. **Dekopling Penuh dari Ketergantungan M5 (Otoritas M15 Murni):**
   - Di `driver-model.js`, verifikasi kesegaran driver diperluas untuk menerima timestamp M15 (`context.source?.M15`) maupun M5.
   - Di `six-drivers.mjs` (keduanya `lib` dan `supabase`), lilin eksekusi fallback otomatis ke M15 (`M`) saat M5 tidak tersedia. Jendela konfirmasi retest diperluas menjadi 3600s (1 jam) agar retest M15 memiliki waktu cukup dan tidak kedaluwarsa prematur.
   - Di `market-context.mjs`, kesegaran konteks (`fresh`) berpusat pada kelengkapan H1 dan M15 tanpa membatalkan konteks jika lilin M5 terlambat.
   - Di antarmuka Mapping (`index.html`, `ict-presentation.js`, `context-panel.js`), seluruh salinan teks M5 yang tertinggal dibersihkan menjadi M15, menyelaraskan tampilan UI 100% dengan strategi trading pengguna.
3. **Pemicu Sentuhan Harga Real-Time (Touch Trigger):**
   - Di `api/scalper-setups.js`, sentuhan harga live ke level limit langsung mengaktifkan status ke `ACTIVE` (*"Harga menyentuh level limit · Posisi berjalan"*).
4. **Sinkronisasi Client Lifecycle Tracker:**
   - `trade-lifecycle-tracker.js` dinormalisasi untuk mengenali properti model driver (`direction`, `stopLoss`, `target`), dipasangkan listener `amyfx:driver-setups`, dan diaktifkan via `trackAssistantPlan(s)` di `context-panel.js`.

## Live Intrabar Touch Alerts (0s Delay) & Background Worker Sync (Pro 409)

1. **Akar Masalah Keterlambatan Notifikasi (BSL Sweep, Break, POI Test):**
   - **Closed-Candle Philosophy Delay (13–15 menit):** Sebelumnya, deteksi likuiditas sweep (`detectLiquiditySweep`) dan engine pasar hanya memeriksa lilin yang sudah tertutup (`is_closed: true`). Jika sweep terjadi pada menit ke-2 candle M15, sistem terpaksa menunggu lilin M15 selesai pada menit ke-15:00 (latensi built-in 13–15 menit).
   - **Background Worker Abortion:** `DriverSetupSyncWorker.kt` mewajibkan timestamp `M5` (`sourceObj?.optLong("M5", 0L)`), menyebabkan worker background Android batal diam-diam saat payload pasar beroperasi murni dengan otoritas M15.

2. **Model Notifikasi 2-Tier Real-Time:**
   - **Tier 1 (Instant Intrabar Touch Alert · Latensi 0 Detik):**
     - Di `price-alert-manager.js`, diimplementasikan fungsi `checkIctIntrabarSweeps(current, prev)` yang berjalan di setiap tick harga real-time (`twelvedata-price`, `price-tick`, DOM MutationObserver, periodic safety interval).
     - Memantau level likuiditas dari konteks aktif (`window.AmyMarketContext` / `amyfx.market-context.v1`):
       - **BSL / PDH / Asia High / PWH / EQH**: Sentuhan/tembusan ke atas (`prev < level && current >= level`) -> `⚡ SWEEP INTRABAR: <LABEL> ($<LEVEL>)`.
       - **SSL / PDL / Asia Low / PWL / EQL**: Sentuhan/tembusan ke bawah (`prev > level && current <= level`) -> `⚡ SWEEP INTRABAR: <LABEL> ($<LEVEL>)`.
       - **Break Struktur / Invalidasi M15**: Tembusan level invalidasi (`prev > inv && current <= inv` untuk Bullish, atau sebaliknya untuk Bearish) -> `⚠️ BREAK STRUKTUR: XAU/USD Menembus $<LEVEL>`.
       - **Uji Zona POI**: Harga masuk ke rentang POI M15 (`low`–`high`) dari atas maupun bawah -> `🎯 UJI ZONA POI: XAU/USD Masuk ke <LABEL>`.
     - **Multi-Channel Dispatch:** Dikirim instan melalui jembatan native Android (`window.Android.showNotificationWithUrl`), Web Notification API, Web Audio API chime melodic, haptic vibration, dan top glassmorphism banner (`showIctBanner`).
     - **Anti-Jitter Cooldown:** Dilengkapi cooldown 5 menit (`ICT_COOLDOWN_MS = 300000`) per level key untuk mencegah getaran/notifikasi berulang akibat fluktuasi tick kecil di sekitar level.
     - **Weekend Anti-Spam:** Otomatis dibungkam saat pasar tutup (`isGoldMarketOpen() === false` atau `session === 'PASAR TUTUP'`).
   - **Tier 2 (Confirmed Closed Candle Reclaim):**
     - Analisis penutupan lilin M15 tetap berjalan normal setelah lilin resmi close untuk mengonfirmasi validitas displacement / MSS atau wick rejection.

3. **Perbaikan Background Worker (`DriverSetupSyncWorker.kt`):**
   - Timestamp pemeriksaan lilin kini membaca `M15` terlebih dahulu (`sourceObj?.optLong("M15", 0L)`), fallback ke `M5`.
   - Jendela kesegaran diperluas menjadi 3600 detik (1 jam) agar background worker tidak menghentikan notifikasi saat feed M5 tidak ada.

## Kebijakan Supabase Dikunci Total & Zero-Touch Invariant (Pro 410)

1. **Status Beku Supabase (Frozen State):**
   - Proyek Supabase (`amy-market-data` / `wliecyxzlwhmtftnfnps`) resmi dikunci dan dibiarkan dalam kondisi apa adanya (*frozen state*).
   - **DILARANG MENGHAPUS, MEROMBAK, MENAMBAH TABEL, ATAU MENDEPLOY ULANG APAPUN** ke Supabase.
2. **Kemandirian Penuh Amy FX Pro (Zero-Supabase Runtime):**
   - Aplikasi Amy FX Pro telah beroperasi 100% mandiri mengandalkan Vercel Serverless (`api/twelvedata`, `api/scalper-setups`, `api/news`, `api/calendar`), TwelveData WebSocket, dan mesin eksekusi offline lokal di HP tanpa library Supabase client.
   - Seluruh integrasi baru (termasuk library backtest candle) tidak boleh membebani Supabase.

## Cloud Library 8-Tahun (2019–2026) Multi-Timeframe (Pro 411)

1. **Penyimpanan Dataset Cloud di GitHub Releases:**
   - Seluruh dataset 8 tahun XAU/USD (2019–2026) multi-timeframe (M1, M5, M15, H1, H4, D1) di-host di GitHub Releases (`amyfx-market-dataset-8years`), memuat 8 arsip tahunan (~42 MB) dan 93 file bulanan (~400–600 KB per bulan).
2. **Streaming Proxy Vercel & Cache Lokal:**
   - Serverless endpoint `api/candles.js` melayani manifest katalog dan streaming arsip bulanan dengan header CORS `*` dan edge CDN cache.
   - Server Termux (`tools/serve-local.mjs`) menyediakan zero-latency local fallback langsung dari `/sdcard/Download/lab backtest/candles/monthly/`.
   - Modul `data-provider.js` dan UI `chart-analysis.html` mengizinkan unduh dan instalasi instan per tahun atau per bulan langsung ke IndexedDB tanpa perlu upload manual.

## Perpustakaan Cloud di Candle Replay & Perbaikan Chart Kosong (Pro 412)

1. **Integrasi Panel Perpustakaan Cloud di Candle Replay (`candle-replay.html`):**
   - Menambahkan section `.cloud-library-panel` (Pilih Tahun 2019–2026, Pilih Bulan, Tombol ⚡ Pasang dari Cloud) langsung ke dalam aside Candle Replay.
   - Fungsi `initCloudLibrary()` mengunduh pack dari Cloud (Vercel proxy/GitHub dataset), menyimpannya ke IndexedDB, me-refresh dropdown pack, dan langsung berpindah ke pack yang baru dipasang via `changeSource(firstId)`.
2. **Akar Masalah Chart Replay Kosong & Solusinya:**
   - **Stale Replay State Gotcha:** Sebelumnya `storage.loadReplayState()` mengutamakan `saved.sourceId` lama (sample Maret 2009) daripada pack aktif yang baru diunduh di `provider.selectedSourceId()`. Kini pack aktif global selalu diprioritaskan.
   - **Out-of-Range Cursor Bounds:** Timestamp cursor lama dari dataset lain (misal 2009 vs 2025) sebelumnya menyebabkan `lowerBound` memilih bar index 0 sehingga chart hanya memuat 1 candle (tampak kosong). Kini `ReplayController.prototype.start` memverifikasi rentang timeline: jika timestamp di luar batas dataset, otomatis me-reset ke `Math.min(80, timeline.length - 1)` sehingga 80 candle awal langsung tampil penuh.
   - **Resilience Sample Loader:** `loadSample()` di `data-provider.js` dibungkus multi-fallback dan `listSources()` dibungkus per-sumber try/catch sehingga kegagalan fetch sample lokal/offline tidak memblokir pembacaan pack IndexedDB.
   - **Responsive Auto-Fit:** `chart.setCandles` memanggil `fitContent()` pada render pertama, serta `chart.resize()` dan listener `window.addEventListener('resize')` dipasang agar kanvas chart selalu fit ke dimensi kontainer.

## Replay Multi-Timeframe Mulus (M1–D1) & Sinkronisasi Cursor Presisi (Pro 413)

1. **Akar Masalah Lilin Stuck / Seolah Otomatis M1:**
   - **Desinkronisasi Kursor Saat Pindah Timeframe:** Saat pengguna beralih dari M1 ke M15/M30/H1, kursor lama (misal bar 80 M1 = 80 menit) dipertahankan tanpa penyesuaian. Pada M15 hanya terbentuk 5–6 candle dan pada M30 hanya 2–3 candle, sehingga chart tampak hampir kosong. Ketika tombol `+1` atau `Putar` ditekan, langkah pertama hanya menyelesaikan pecahan lilin yang sama tanpa menambah jumlah lilin, menimbulkan kesan tombol macet atau hanya M1 yang jalan.
   - **Label Pack Mengunci Persepsi M1:** Dropdown data menampilkan label `31.000 M1` (karena format file fisik M1), membuat pengguna mengira pilihan timeframe diabaikan dan sistem "otomatis pakai M1".
   - **OHLC Strip Menampilkan Menit Ganjil M1:** Waktu candle di strip atas dan status bar mengambil `payload.cursor` (misal 02:14 WITA, 02:29 WITA), bukan waktu pembukaan bucket lilin (02:00 WITA, 02:15 WITA).
2. **Solusi Komprehensif Pro 413:**
   - **State `isDefaultInitial` di Replay Engine:** Saat pengguna berada di posisi awal default, pergantian timeframe ke M5, M15, M30, H1, H4, atau D1 langsung memuat 80 candle utuh dari timeframe tujuan, menjamin chart selalu penuh konteks. Jika pengguna telah bernavigasi/melangkah, kursor waktu dipertahankan secara presisi.
   - **Label Pack Multi-Timeframe Ramah:** Mengubah format label dropdown dari `31.000 M1` menjadi `31.000 bar (M1–D1)` di `candle-replay.js`, `chart-analysis.js`, dan `data-provider.js`.
   - **Penyelarasan Waktu OHLC & Badge TF:** Strip OHLC kini menggunakan `current.time` (waktu pembukaan bucket, misal 02:00 WITA, 02:15 WITA), status bar menampilkan format eksplisit `[M15] · Candle ...`, dan badge TF aktif disematkan di strip info.
   - **Fast-Path Agregasi Biner:** Optimasi `trustedSeries` pada `aggregateCandles` dan `visibleCandles` menggunakan pencarian biner pada slice data yang sudah terurut, memangkas waktu pemrosesan dari ~450ms menjadi ~5ms per langkah untuk playback ultra-responsif di perangkat mobile.

## Kurikulum Master ICT Terpadu (12 Modul Murni) & Purifikasi Retail SMC (Pro 414)

1. **Purifikasi Konsep Retail SMC (Zero-Tolerance False Concepts):**
   - **Eliminasi Mitos IDM Mekanis:** Menghapus aturan buatan retail *"pullback 1 wajib di-sweep sebelum BOS sah"*. Struktur ICT murni ditentukan oleh Swing Fractal 3/5 lilin dan Displacement.
   - **Eliminasi Istilah CHoCH:** Seluruh penyebutan istilah retail CHoCH dibersihkan dan distandarkan menjadi MSS (Market Structure Shift) institusional.
   - **Eliminasi Mitos Antropomorfis Bank:** Menghapus narasi fiktif *"Bank floating rugi di OB dan mau keluar di BE"*, digantikan dengan mekanisme sejati *Repricing Efficiency IPDA*.
   - **Standardisasi Terminologi:** Titik tengah 50% bodi Order Block adalah *Mean Threshold (MT)*, sedangkan 50% FVG/Wick adalah *Consequent Encroachment (CE)*.
   - **Standar Waktu New York & DST:** Seluruh jam Killzone dan Macro berpatokan resmi pada New York Time (EST/EDT) dengan penjelasan pergeseran musiman Daylight Saving Time (DST).
2. **Penyatuan Kurikulum (Merge 3 Semester -> 12 Modul Master Terpadu):**
   - 3 Semester dengan 36 bagian (492 bab repetitif/bloated) disatukan menjadi **12 Modul Master Terpadu** yang padat, terstruktur, dan 100% selaras dengan skrip `AMY_ICT_NextGen.pine` serta Cockpit Mapping Amy FX Pro.
   - Folder `bagian-13` s.d. `bagian-36` dialihkan secara transparan ke modul master yang relevan tanpa merusak URL lama atau pengujian otomatis.
   - Antarmuka Beranda (`index.html`) dan Silabus (`daftar-materi.html`) menampilkan navigasi 12 Modul Master Dark Premium Fintech dengan filter kategori dinamis.

## Virtual Office Live Market Telemetry & Protokol Anti-Halusinasi (Pro 418)

1. **Eliminasi Angka Statis & Hardcoded:**
   - Semua angka harga mock lama ($2,880 – $2,948) di kanvas 3D dan skrip War Room telah dibersihkan total.
   - Frontend 3D secara periodik melakukan polling ke endpoint internal `/api/market-data` (port 8090).
2. **Koneksi Engine Real-Time Vercel:**
   - `server.mjs` terhubung langsung ke `https://amy-fx.vercel.app/api/scalper-setups` dan `api/twelvedata`.
   - Setiap query analisa pasar, buy/sell, atau order limit secara otomatis menyuntikkan telemetri nyata (Harga XAU/USD, Dealing Range M15, EQ, Struktur, Confluence Score, 6 Drivers state) ke dalam prompt dewan robot agar bebas halusinasi.

## Virtual Office First-Person POV Exploration & Physics Normalization (Pro 422)

1. **Karakter Tersembunyi & Layar Plong 100%:**
   - Seluruh mesh karakter mecha (`avatarGroup.visible = false`) disembunyikan agar layar HP plong dan tidak terhalang.
   - Kamera diposisikan pada level mata operator (`eyeY = mesh.position.y + 6.2 + eyeBob`) untuk eksplorasi First-Person POV sejati.
2. **Kontrol Arah POV Intuitif:**
   - Vektor pergerakan dikunci ke arah pandang kamera (`fpYaw`): Joystick atas = MAJU lurus searah kamera, bawah = MUNDUR, kanan/kiri = STRAFE.
   - Swipe kanan layar memutar pandangan 360° secara luwes (Yaw & Pitch vertikal terbatasi).
3. **Fisika Snappy Realistis:**
   - Lompatan cepat dan manusiawi (`jumpVelocity: 1.4`, `gravity: -0.16`, `fallGravity: -0.26`, `maxFallSpeed: -2.2`) menghilangkan efek mengambang di bulan.
   - Trampolin Quantum Launch Pad melontarkan dengan ketinggian proporsional (`vy = 3.6`) dan mendarat mantap.

## Mentor Trading Privat 1-on-1, Twelve Data MCP & Pedagogical Guardrails (Pro 426)

1. **Skill Global `mentor-trading-privat`:**
   - Ditempatkan di `/root/.agents/skills/mentor-trading-privat/SKILL.md` (shared Akun 1 & Akun 2).
   - Menghubungkan kurikulum materi Obsidian (`Amy_Trading_Academy_Vault`) dengan engine pasar riil.
2. **Twelve Data MCP & Candle Builder Sync:**
   - Server MCP mandiri di `/root/.agents/mcp-servers/twelvedata-server.mjs`.
   - Konfigurasi di `/root/.gemini/config/mcp_config.json`.
   - Mengambil data live dan otomatis menyimpan ke SQLite `/root/amy-market-data/xauusd_bot.sqlite`.
   - Menyediakan tool analisis ICT lengkap: BSL, SSL, Sweeps, BOS, MSS/CHoCH, Active FVGs (CE 50%), dan Dealing Range.
3. **Pedagogical Guardrails & Anti-Distraksi:**
   - **Chunking Method:** Materi diajarkan per 2-3 segmen logis tanpa memangkas ilmu (Zero Information Loss).
   - **On-Context Discipline (Pro 421):** AI fokus 100% pada pertanyaan user tanpa melempar opsi atau saran cabang yang tidak diminta.
   - **True Level 0 Rule:** Dilarang menampilkan chart atau istilah teknikal jika mulai dari nol; wajib dari logika berdagang awam dan analogi fisik.
   - **Real-World Gold Rules:** Menolak SL mikro $1 di Gold; menerapkan SL struktural di balik sweep dan TP ke DOL nyata dengan RR >= 1:2.

## Academy Learning Reminder & Alarm Guardrails (Pro 427)

1. **Exact-Time Native Alarm (`AlarmManager`):**
   - Pengingat belajar harian di [`LearningReminderReceiver`](file:///root/Amy-fx/app/src/main/java/com/amyelitesuite/LearningReminderReceiver.kt) menggunakan `AlarmManager.setExactAndAllowWhileIdle` / `setAndAllowWhileIdle` pada timezone WITA (`Asia/Makassar`).
   - Mencegah pergeseran waktu akibat Doze mode Android atau optimasi baterai.
2. **Strict Time-Window Guard (±15 Menit):**
   - Baik di [`LearningReminderWorker`](file:///root/Amy-fx/app/src/main/java/com/amyelitesuite/LearningReminderWorker.kt) maupun [`LearningReminderReceiver`](file:///root/Amy-fx/app/src/main/java/com/amyelitesuite/LearningReminderReceiver.kt), notifikasi hanya diizinkan muncul jika waktu sekarang berada dalam rentang toleransi ±15 menit dari jam yang disetel pengguna (misal 20:00 WITA).
   - Menolak dan membuang (discard) eksekusi prematur (seperti 13:41 WITA saat WorkManager mengevaluasi periodic work saat app baru dibuka).
3. **Once-Per-Day Date Guard (`KEY_LAST_NOTIFIED_DATE`):**
   - Notifikasi hanya dapat dikirim maksimal 1 kali per hari kalender WITA (`YYYY-MM-DD`).
4. **Boot Resilience:**
   - [`BootReceiver`](file:///root/Amy-fx/app/src/main/java/com/amyelitesuite/BootReceiver.kt) secara otomatis mengaktifkan ulang alarm saat perangkat reboot (`ACTION_BOOT_COMPLETED`).

## Standar Baku Cron Pemantau Teknikal 15 Menitan XAU/USD (Pro 430)

1. **Jadwal & Trigger Waktu:**
   - Menit `:00, :15, :30, :45` jam dinding (`0,15,30,45 * * * *`, ExactTiming: true) pada timezone WITA (UTC+8).
2. **Karakter & Format Laporan:**
   - 100% murni teknikal ICT tanpa berita/fundamental makro.
   - 4 Pilar Wajib: (1) Live Price riil, (2) Bedah evolusi 3 candle M5 terakhir, (3) Peta Likuiditas ICT (BSL, SSL, EQ 50%, FVG M5, Invalidasi Tren), (4) Level Aksi & Kompas Sayang (Anti-Yes-Man, larangan entry di zona cincang, jemputan di lantai/plafon ekstrem target 100 pips).
3. **Kanal Pengiriman:**
   - Murni di chat Antigravity (dilarang kirim ke Telegram).
4. **Emergency Sentinel Alert:**
   - Siaga mendeteksi lonjakan ekstrem di menit 5/10 (jebol lantai kritis atau konfirmasi MSS kilat) tanpa harus menunggu 15 menit.
5. **Auto-Trigger di Sesi Baru:**
   - Kata kunci *"pantau market"*, *"nyalakan pemantau"*, *"aktifkan cron"*, *"lapor 15 menit"*, atau *"pos pantau"* otomatis mengaktifkan cron ini tanpa perlu re-konfigurasi manual.

## Pembersihan Modul Terisolasi & Penguatan Integritas Runtime (Pro 433)

1. **Purge Modul Fractal Advisor & Legacy Laya (Nomor 8):**
   - Modul `apps/fractal-advisor/` (1.210 baris) dihapus permanen bersama `api/fractal-audit.js` dan route backend di `tools/serve-local.mjs`.
2. **Pembersihan Modul Indikator / Ghost Tab Kode (Nomor 4):**
   - Menghapus tab filter Kode dan tombol mati `data-open="indikator"` di menu Media agar antarmuka Video fokus murni sebagai media replay.
3. **Pembersihan Tautan Rusak Academy (Nomor 5):**
   - 1.931 tautan 404/rusak di seluruh materi Academy dibersihkan menjadi teks murni, dan 33 tautan navigasi awalan angka dinormalisasi (0 broken links).
4. **Perbaikan Runtime & Fitur Profil (Nomor 1, 2, 3, 6, 7):**
   - Menghilangkan crash `NotFoundError` di 12 halaman utama Academy saat memasang theme toggle button.
   - Mengunci validasi kesegaran candle dengan pengecekan timeframe (`raw?.tf === next.tf`) di Home Chart & Cockpit Mapping.
   - Menyinkronkan cadangan ekspor profil dengan basis data riil Jurnal (IndexedDB `journals.v2`) dan menyediakan tombol Pulihkan / Impor Cadangan Data.
   - Memunculkan kembali kartu personalisasi Nama Trader di Profil.
   - Menghilangkan konflik guard pada `profile-system-settings-v1.js` agar kustomisasi warna kaca berjalan mulus.


## Keputusan Teknis: Harness² Engine (4 Nov 2026)
- **Diadopsi:** Framework Google Research "Harness²: Recursive Agent Harnessing for an Open World" (arXiv:2610.14224).
- **Mesin:** `/root/.harness2/harness2_engine.py` — Siklus otonom Propose–Probe–Compose untuk evolusi mandiri 8 komponen harness AI.
- **Skill:** `/root/.agents/skills/harness2-engine/SKILL.md`
- **Pasal GEMINI.md:** Pasal 25 mengatur kebijakan resmi, safety rails, dan trigger otomatis.
- **Pustaka Pengalaman:** `/root/.harness2/EXPERIENCE.md` (akumulasi lintas sesi).

## Keputusan Teknis: Sistem Simulasi Real-Time Edukatif & Lab Scalper (5 Nov 2026)
- **Diadopsi:** Permanen di Pasal 26 GEMINI.md atas persetujuan Sayang.
- **Tujuan:** Dual-engine untuk menghasilkan setup XAU/USD real-time berprobabilitas tinggi (Target 100-120 pips, SL 60 pips) sekaligus media transfer ilmu pedagogis teknikal (penjelasan alasan entry ICT/SMC murni).
- **Model Eksekusi:** Dua pilar lincah (Reversal Likuiditas dengan napas toleransi zona + Continuation FVG Tap) untuk mencegah hilangnya peluang momentum.
- **Integritas:** Zero-manipulation Twelve Data feed + auto-learning Harness² saat terkena Stop Loss.

## Keputusan Teknis: Protokol Active Scalper Pro & Format Baku (5 Nov 2026)
- **Diadopsi:** Permanen di Pasal 27 GEMINI.md dan `/root/.harness2/active_scalper_config.json` atas perintah Sayang.
- **Pencapaian Benchmark:** Hat-Trick Kemenangan Bersih (+145 pips, +150 pips, +140 pips) dengan total profit **+335.0 Pips**.
- **Mentalitas Operasi:** Berani eksekusi setup M5 di ujung ekstrem Dealing Range tanpa ragu (*Zero-Hesitation*), anti-Yes-Man, larangan klik di zona cincang tengah (No-Trade Zone).
- **Format Tampilan Baku (Opsi B):** Wajib Pinned Target Entry Radar Box di baris pertama setiap respons cron/chat.
- **SOP Proteksi Bertingkat:** BEP Cepat (+50–70 pips) dan Trailing Lock (+100 pips) untuk menggaransi hasil trading uang riil bebas risiko.



## Kalibrasi Mapping vs Twelve Data (5 Nov 2026)
- Audit `apps/mapping/js/ict-workspace/dashboard-v2.js`: ditemukan level hardcode era $3,9xx (Demand $3,927–3,931, PDH $3,969, SSL $3,926, dll) yang tampil sebagai POI walau harga ~$4,105, plus SOP SELL terbalik (entry di bawah harga, TP di atas entry).
- Fix: semua level POI/SOP/skenario wajib dari engine riil (ctx.m15.poi, amy.dashboard, amy.levels, amy.visuals). Supply/BSL hanya di atas harga, Demand/SSL hanya di bawah harga; level tertembus diberi label "tertembus" (flip S/R). TP Sell = SSL riil terdekat di bawah zona. DILARANG fallback angka hardcode.

## Perbaikan Setup & Latensi Notifikasi HP (5 Nov 2026)
- **Problem Setup Usang**: Sinyal entry asisten memunculkan entry usang ($4,125) padahal harga live sudah lari jauh ($4,105 lalu $4,085). Disebabkan oleh `lastSignalLevel` M5 yang tidak pernah dibersihkan setelah kadaluarsa dan `m15DirectConfirmed` yang membypass pengecekan anti-chase (`isChased`).
- **Fix Setup**: Di `amy-ict.mjs`, pasang `lastSignalAge` dengan batas `validBars` (12 bar / 60m). Jika harga sudah melarikan diri melebihi `chaseTol` (0.75 ATR), sinyal wajib berstatus `MISSED (Anti chase)` dan dilarang berstatus `READY`.
- **Problem Latensi Notifikasi 1-2 Candle M15 (30-60 Menit)**:
  1. `DriverSetupSyncWorker` di Android mengandalkan `PeriodicWorkRequest(15, TimeUnit.MINUTES)` yang oleh Android Doze Mode sering ditunda hingga 30-45 menit.
  2. Pengecekan `nowSec - candleTime > 900L` terlalu ketat; saat worker bangun telat 1 detik saja, candle dianggap stale dan di-suppress, memaksa menunggu siklus berikutnya.
  3. `sweepAge <= 900L` menyebabkan sweep yang terjadi di candle lalu dibatalkan.
  4. `importance == 4` tidak menangkap konfirmasi M15 yang ber-`importance == 5`.
- **Fix Notifikasi Android**:
  1. Pasang rantai `scheduleNextCandleSync()` via `OneTimeWorkRequestBuilder` dengan delay terhitung persis 15 detik pasca penutupan candle M15 terdekat (:00:15, :15:15, :30:15, :45:15).
  2. Longgarkan stale threshold dan sweep age dari 900s menjadi 2700s (45 menit / 3 candle M15) agar tidak di-drop saat Doze mode.
  3. Tambahkan penanganan `importance == 5` untuk M15 Displacement Break.
  4. Pasang guard `priceDrift > 6.0` ($6 / 60 pips) agar tidak ada notifikasi eksekusi instan jika harga sudah lari jauh.

### [2026-11-06] Sandi Otonom: "aktifkan simulasi" & Integrasi Harness² + Pasal 28
- Sandi resmi: "aktifkan simulasi"
- Otomatis mengeksekusi /root/.harness2/activate_simulation.py
- Memeriksa Circuit Breaker Pasal 28 (Mode Cooling-Off jika ada 1x SL hari ini atau kuota 2 setup tercapai).
- Cron pemantau 15 menitan (0,15,30,45 * * * *), dilarang keras 5 menitan.
- Format Baku Opsi B Ultra-Compact + Pinned Radar.
- Disiplin maksimal 1-2 setup A+ MTF (M15/H1) per hari.

### [2026-11-06] Kloning DNA Sesi Master & Pasal 29 GEMINI.md
- **Mandat Global:** Seluruh sesi baru Akun 1 & Akun 2 wajib mengkloning 100% DNA Sesi Master (+335 Pips, anti-overtrading, pemahaman visual garis MT5 $4,138/$4,131).
- **Anti-Amnesia Hook:** Sesi baru wajib otomatis membaca state `/root/.harness2/active_scalper_config.json` dan `/root/.harness2/live_simulation.json`.
- **Sandi Re-Sinkronisasi:** "lanjut sesi master", "ingat sesi pro", "samakan dengan sesi kemarin".

### [2026-11-07] Standar Arsitektur Gemini JARVIS Live Voice Agent v2.5.0 (Pasal 30)
- **Status Lab:** Milestone Stabil Terverifikasi di `/root/gemini-live-lab` (Port 8088).
- **Model:** Google Gemini 3.8 Live (`models/gemini-3.8-live`) via WebSocket streaming + suara Aoede.
- **Pilar Utama:**
  1. *Dual Chat Persistence:* `localStorage` + `chat_history.json` + `last_topic.json` (anti-amnesia saat layar dibersihkan).
  2. *Edukasi Obsidian:* `obsidian_helper.py` membedah 36 Bagian Vault kurikulum trading 4 pilar lengkap + sinkronisasi progres belajar.
  3. *Kalender & Berita:* `get_economic_calendar` (jam WITA + High Impact minggu depan CPI/PPI) & `search_internet_news` (Google News RSS bebas captcha).
  4. *Analisa Gold & Candle Riil:* `gold_market_helper.py` (baca candle OHLC riil SQLite M15/H1 pergerakan masif Jumat ~955 pips) + `AMY CONTEXT V4.3.2` Peta Taktis 2-Sisi target 100 pips Sayang & peringatan No-Trade Zone.
- **Roadmap:** Pengembangan kemampuan coding dan otonomi bertahap mirip Antigravity tanpa merusak stabilitas live voice v2.5.0.
- **Sandi Aktivasi Instan:** "aktifkan jarvis", "nyalakan jarvis", "start jarvis", "gemini live" -> Otomatis jalankan `/root/gemini-live-lab/start.sh` (Port 8088).

### [2026-11-07] Fix Riwayat Terakhir Dibaca Academy Ngestuck (Integrasi Micro-Learning Level 0–6)
- **Problem:** Card "Terakhir Dibuka" di Beranda Academy (`index.html`) ngestuck terus di "Risk Reward Ratio", padahal Sayang sudah berpindah membaca kurikulum baru (Level 0 s.d. Level 6 di `apps/academy/belajar/`).
- **Akar Masalah:**
  1. Halaman pelajaran micro-learning di `belajar/level-X/` hanya memuat `micro-learning.js` dan tidak memuat `reading-history-v2.js` / `main.js`.
  2. `micro-learning.js` sebelumnya hanya mencatat kuis (`amyfx.academy.micro_progress`) dan tidak mengupdate `amy_last_opened_title`, `amy_last_opened_url`, `amy_academy_last_read_v2`, maupun bridge Android.
  3. Di `reading-history-v2.js`, fungsi `isLessonPage()` memakai regex lama `(?:bagian-\d+|modul-\d+)` yang mengabaikan path baru `belajar/level-\d+`.
- **Solusi:**
  1. Ditambahkan `recordReadingHistory()` di `micro-learning.js` yang otomatis menyimpan judul, path, section, fallback keys `amy_last_opened_*`, `amy_academy_last_read_v2`, serta sinkron ke Android bridge.
  2. Diperluas regex `isLessonPage()` dan `sectionLabel()` di `reading-history-v2.js` untuk mengenali `belajar/level-\d+` dengan namespace `micro-learning`.

### [2026-11-08] Upgrade Kecerdasan Artemis & Modul Analisa TradingView Cerdas (artemis-tv)
- **Problem:** Artemis terasa "bodoh" dan lambat di MT5/TradingView karena sebelumnya dijalankan di profile `flash` reaktif yang tidak punya pemahaman domain grafis, sering meleset koordinat di kanvas OpenGL, dan tidak tahu SOP trading Sayang.
- **Solusi:**
  1. Default model di `/root/artemis/config/artemis.jsonc` di-upgrade ke `gemini-3.8-flash` dengan thinking capability.
  2. Dibuatkan dokumen playbook anatomi TradingView Android & SOP ICT di `/root/artemis/config/tradingview_ict_playbook.md`.
  3. Dibuatkan engine runner cerdas `/root/artemis/scripts/artemis_tradingview_analyst.py` dan shortcut terminal `/usr/local/bin/artemis-tv`.
  4. Eksekusi kini resmi menggunakan `--profile pro` (Closed-Loop Planner + Operator + Validator) dan `--explorer-version ultra` (8-turn reasoning loop dengan OCR teks & Zoom) serta mengunci aplikasi ke `com.tradingview.tradingviewapp`.
  5. Mendukung SOP Top-Down otomatis (H1 -> M15 -> M5) untuk membedah arah tren, Dealing Range, FVG, dan lilin konfirmasi untuk target 100 pips Sayang.

### [2026-11-08] Audit Paritas Tampilan & Backend: Amy Web (Termux) vs Amy FX Pro (APK Android) — SOP Perbaikan Mandiri dengan Model Argon

- **Status:** TERTUNDA ATAS PERINTAH SAYANG (HOLD FOR ARGON / CLAUDE SONNET).
- **Target Eksekusi:** Dijadwalkan ~1 minggu lagi saat limit model Argon (Claude Sonnet) telah pulih. DILARANG dieksekusi terburu-buru dengan Gemini 3.8 Flash untuk mencegah kesalahan koding dan halusinasi.
- **Gejala Masalah (Dua Screenshot 8 Nov 2026):**
  1. *Amy Web Browser (`http://localhost:8080/apps/mapping/index.html`):* Tampilan sangat mewah dan interaktif dengan Gelembung Orb Emas 3D bersinar (`✦ AMY`), tombol suara live mic (Aoede), snapshot chart kanvas, dan penjelasan materi Academy secara luwes.
  2. *Amy FX Pro APK Android (Versi 2.0.0-pro.437 / `950437`):* Saat tombol `AMY` disentuh, yang muncul masih panel kotak lama ("Amy · Asisten aplikasi | Lokal · tanpa API AI / LLM").
- **Akar Masalah (Root Causes Terverifikasi):**
  1. *Frontend Script Injection Belum Ada di Amy-fx-pro:*
     - Di `/root/Amy-fx/app/src/main/assets/apps/shared/amy-local-assistant.js` baris 217 sudah ada loader:
       `const g=document.createElement('script');g.src=new URL('amy-gemini-live-bridge.js',script).href;g.async=true;document.head.appendChild(g);`
     - Di repositori `/root/Amy-fx-pro/app/src/main/assets/apps/shared/amy-local-assistant.js`, baris loader ini belum ada sehingga file `amy-gemini-live-bridge.js` tidak pernah dimuat di APK Android.
  2. *Backend Cloud Vercel vs Server Termux:*
     - Di Termux Web Preview (`localhost:8080`), server lokal `tools/serve-local.mjs` (baris 1082–1160) menangani endpoint `/api/gemini-config` (baca `/root/.gemini_keys`) dan `/api/gemini-chat` (sambungan ke Gemini AI).
     - Di APK Android, WebView berjalan pada origin `https://appassets.androidplatform.net/assets/`.
     - Request relative `/api/...` di APK otomatis diarahkan ke domain publik Vercel (`https://amy-fx.vercel.app/api/...`).
     - Namun di Vercel (`api/`), endpoint `gemini-config.js` dan `gemini-chat.js` **belum dibuat dan belum dideploy**.
- **Action Plan Presisi untuk Sesi Argon (1 Minggu Lagi):**
  1. *Deploy Vercel Serverless Function:*
     - Buat `api/gemini-config.js` dan `api/gemini-chat.js` di kedua repositori (`Amy-fx-pro` & `Amy-fx`) yang membaca secret `GEMINI_API_KEY` dari environment Vercel.
  2. *Frontend URL Resolver di `amy-gemini-live-bridge.js`:*
     - Sesuaikan pemanggilan endpoint agar dinamis: jika berjalan di APK (`https://appassets.androidplatform.net/`), gunakan prefix `https://amy-fx.vercel.app/api/...`.
  3. *Aktifkan Injeksi di `Amy-fx-pro`:*
     - Tambahkan pemanggilan `amy-gemini-live-bridge.js` di `app/src/main/assets/apps/shared/amy-local-assistant.js`.
  4. *Verifikasi CI & Build Release:*
     - Jalankan `node --test tests/local-assistant.test.mjs` untuk memastikan tidak ada pelanggaran test.
     - Bump versi ke versi baru (misal `2.0.0-pro.438`), commit, push, dan kawal workflow GitHub Actions hingga APK terbit.
  5. *Sandi Aktivasi Instan:*
     - Cukup ketik: `"eksekusi amy live"` atau `"pasang amy live"` -> AI otomatis langsung mengeksekusi seluruh 5 langkah di atas tanpa perlu penjelasan ulang.

## Golden Recovery Baseline (Video Work)
- **Safe Revert Commit:** `6cda575c8434045c14cf57153e79a3d0f7b3b915` (`6cda575c`)
- **App Version:** `v2.0.0-pro.446` (versionCode `950446`)
- **Status:** Baseline stabil sebelum pengerjaan modul Video. Jika terjadi kendala/error saat pengerjaan Video, rollback instan via `git reset --hard 6cda575c && git clean -fd`.

## Audit & Perbaikan Notifikasi Sinyal Entry Dinamis (Pro 449 / 13 Nov 2026)
- **Konteks:** Screenshot layar kunci Sayang (13 Nov 2026 20:36 WITA) menunjukkan notifikasi sinyal `PULLBACK BUY (Pullback di Dasar Diskon)` dengan teks `TP1: $3899.55 (+100 Pips)` padahal jarak Entry $3893.17 ke TP1 $3899.55 adalah $6.38 (63.8 Pips).
- **Akar Masalah:** String `(+100 Pips)` di-hardcode di `DriverSetupSyncWorker.kt` baris 230 tanpa memperhitungkan selisih numerik riil antara Entry dan TP1/TP2.
- **Solusi:**
  1. Menghitung jarak pips secara dinamis: `val tp1Pips = Math.abs(tp1Price - entryPrice) * 10.0`.
  2. Mendukung pembacaan `tp2Price` jika tersedia: format `TP1: $%.2f (+%.0f Pips) | TP2: $%.2f (+%.0f Pips)`.
  3. Mempertahankan catatan spread SELL `(TP Ask +5 Pips)` sesuai SOP Napas Spread Sayang.
  4. Unit test `tests/sweep-notification-precision.test.mjs` diperbarui untuk mengunci agar string hardcode tidak pernah kembali.

## Rilis Pro 451: Fix Jembatan Eksekusi Market Intel & Eliminasi Hardcode 4185 (17 Nov 2026)
- **Konteks:** Bagian "Jembatan Eksekusi ke Chart Mapping" di Market Intel menampilkan data usang (harga $4,185.66, Range $4,196 / $4,134, EQ $4,165, BSL $4,195, SSL $4,177) akibat fallback data dummy lawas ketika `localStorage` kosong atau belum tersinkronisasi.
- **Solusi & Implementasi:**
  1. Mengintegrasikan fetch otomatis ke `/api/scalper-setups` jika cache kosong atau usang (> 15 menit).
  2. Mengekstrak level secara dinamis: Harga live, Dealing Range (High/Low/EQ), BSL, dan SSL langsung dari array `liquidity` dan `m15.dealingRange`.
  3. Membuang total seluruh angka hardcode 4185 dari `apps/market-intel/app.js`.
  4. Versi aplikasi di-bump ke `v2.0.0-pro.451` (code `950451`).

## Rilis Pro 450: Integrasi POI Anatomi Lengkap ICT (OB, FVG & Liquidity) & Fix Kompas Fundamental (17 Nov 2026)
- **Konteks:**
  1. Kompas Fundamental (Market Intel) mengalami bias silang arah di pagi hari akibat timezone filter kalender bocor dari event malam US kemarin.
  2. Cockpit Mapping di kartu BUY SETUP & SELL SETUP hanya menampilkan BSL dan SSL karena parser Order Block (OB) belum di-loop ke tabel, dan FVG terdekat tertembus harga.
- **Solusi & Implementasi:**
  1. *Kompas Fundamental:* Mengubah filtering kalender di `apps/market-intel/app.js` menggunakan timezone `America/New_York` dan memperluas cakupan event ekonomi makro Tier 1/2.
  2. *Mapping Card Unified POI:* Di `dashboard-v2.js`, mengintegrasikan pembacaan Order Block (OB) dari `poi.ob`, `visuals.ob`, dan Twelve Data `Supply [RBD/DBD]` / `Demand [DBR/RBR]`.
  3. *Anatomi Lengkap ICT:* Kartu SELL SETUP dan BUY SETUP kini menampilkan hierarki utuh:
     - 🎯 Entry Utama: Order Block (OB) + 50% Mean Threshold (MT).
     - 🎯 Entry Cadangan: Fair Value Gap (FVG) + 50% Consequent Encroachment (CE).
     - Status jika belum terbentuk zona: Peringatan tegas dilarang entry.
     - 🏁 Target Likuiditas (TP): SSL untuk Sell, BSL untuk Buy.
     - 🛑 Batas Risiko (SL / Invalidasi): Protected High/Low + napas spread XAUUSDc.
  4. *Versi:* Bump ke `2.0.0-pro.450` (code `950450`).

## Rilis Pro 452: SOP SL Aman Anti-Jebol & Status TP Hit Dinamis (18 Nov 2026)
- **Konteks:** Evaluasi monitoring semalaman mendapati batas Stop Loss di SOP Sell sempat lebih rendah daripada Protected High BSL, dan target TP tetap menampilkan jarak negatif meskipun sudah dilewati harga.
- **Solusi & Implementasi:**
  1. *SOP SL Aman:* Mengadopsi rumus `Math.max(entryHi, invalidasiHi) + 0.40` untuk Sell dan `Math.min(entryLo, invalidasiLo) - 0.40` untuk Buy. SL selalu berada di atas puncak Order Block dan Protected High.
  2. *Status TP Hit:* Target likuiditas yang sudah tersentuh otomatis dilabeli `✅ TP Hit: [name] (Sudah Tercapai di $...)`.
  3. *Versi:* Bump ke `2.0.0-pro.452` (code `950452`).

## Rilis Pro 453: Fix Anti-Menguap POI Setup Buy & Sell — Lifecycle 3-Fase (18 Nov 2026)
- **Konteks:** Setup Buy dan Sell di Cockpit Mapping mendadak "menguap dan menghilang" begitu harga menyentuh zona entry, akibat filter `isActiveZone` yang membuang zona berstatus `MITIGATED` secara instan, dan canvas chart yang menghapus kotak FVG/OB saat diuji.
- **Solusi & Implementasi:**
  1. *Lifecycle 3-Fase POI:*
     - Fase 1 (`WAITING_TRIGGER`): Menunggu harga menyentuh area entry.
     - Fase 2 (`IN PLAY / POSISI BERJALAN`): Saat harga menyentuh area jemputan, setup TETAP TERKUNCI di layar. Status badge berubah menjadi `⚡ POSISI BERJALAN (Terjemput di $...)` dengan panduan live di SOP Box untuk memantau Rejection M5 dan mengawal posisi menuju TP.
     - Fase 3 (`TERMINAL`): Setup HANYA diarsipkan jika TP tercapai (`✅ TP Hit`) atau SL ditembus (`🛑 SL Hit / Invalidasi`).
  2. *Active Setup Session Memory:* Mencegah setup terhapus jika TwelveData atau candle aktif menandai zona sebagai `MITIGATED`.
  3. *Chart Tested POI Preservation:* Kotak FVG dan Order Block yang sedang diuji harga tetap digambar di canvas dengan garis putus-putus (`tested: true`).
  4. *Versi:* Bump ke `2.0.0-pro.453` (code `950453`).

## Rilis Pro 454: Adopsi Cockpit V3 Glassmorphism dari Lab Google AI Studio (19 Nov 2026)
- **Konteks:** Hasil riset & desain UI/UX di laboratorium Google AI Studio (`suhaimitoamy/Amy-fx-ai-studio`) diadopsi secara presisi ke `Amy-fx-pro` tanpa merusak logika pasar.
- **Solusi & Implementasi:**
  1. *Tab Switcher POI BUY / SELL:* Memudahkan Sayang berganti melihat rencana eksekusi BUY atau SELL via tab interaktif tanpa harus scroll panjang.
  2. *Penanda Waktu WITA & Deteksi DOL:* Skala dan crosshair chart resmi mengadopsi format WITA (`Asia/Makassar`), dengan deteksi terarah DOL (Draw on Liquidity) ke unconsumed pool terdekat.
  3. *Custom Price Alert Manager V3:* Modal alarm dilengkapi tab "Pasang Baru" & "Daftar Alarm", sinkronisasi badge counter aktif di Beranda & Mapping, serta Web Audio 2-tone chime.
  4. *Profil Trader Dinamis:* Menampilkan nama trader kustom, avatar inisial, dan kalkulator nominal risiko USD.
  5. *Integritas Baku Terjaga:* Zero-touch Supabase, paritas Card Chart Gold (#1 di atas), dan formula SL Aman (+0.40 spread buffer) tetap patuh 100%.
  6. *Versi:* Bump ke `2.0.0-pro.454` (code `950454`).

## Protokol Integrasi Google AI Studio & Precision Cherry-Pick (19 Nov 2026)
- **Konteks:** Sayang menggunakan Google AI Studio App Builder sebagai laboratorium eksperimen UI/UX & fitur baru tanpa risiko merusak aplikasi utama di HP.
- **Sandbox Repo:** `suhaimitoamy/Amy-fx-ai-studio` (versi murni web ~460 file, bebas limit 1.000 file, `index.html` di root, dev server standalone `server.js`).
- **Aturan Baku Ingest / Merge ke `Amy-fx-pro` (Wajib Dipatuhi Kedua Akun):**
  1. *Dilarang Timpa Buta (No Blind Overwrite):* Dilarang keras menimpa seluruh folder. Hanya file yang spesifik diubah yang boleh diadopsi (*targeted cherry-pick*).
  2. *Path Mapping Bridge:* File web dari root AI Studio dipetakan kembali dengan presisi ke jalur native Android `app/src/main/assets/`.
  3. *Isolasi Modul Terproteksi:* Modul Academy (`apps/academy`), sistem build Android (`gradle/`, `build.gradle.kts`, `MainActivity.kt`), dan test suite lokal tidak boleh diotak-atik atau tertimpa.
  4. *Audit 3 Lapis Sebelum Implementasi:* Validasi sintaks `node --check <file>`, targeted test suite relevan, dan verifikasi visual lokal.

## Rilis Pro 455: Scalper Pro Verdict & 5-Point Confluence Gate (19 Nov 2026)
- **Konteks:** Adopsi fitur evaluasi kesiapan eksekusi Scalper Pro dari commit `29a88e3` Google AI Studio ke `Amy-fx-pro`.
- **Solusi & Implementasi:**
  1. *Kartu Evaluasi Scalper Pro (`poi-verdict-card`):* Hadir di tab BUY & SELL Cockpit Mapping, menampilkan Grade kelayakan (`GRADE A / SIAP EKSEKUSI`, `GRADE B / PROBABILITY SEDANG`, `WAIT / TUNGGU KONFIRMASI`), Skor 0-5, Session Guard, dan 5 checkmark konfluensi murni:
     - Dealing Range / OTE Alignment (Discount untuk BUY, Premium untuk SELL).
     - Structural Shift / MSS / BOS searah bias.
     - Liquidity Sweep / Exhaustion Wick.
     - Fresh Unmitigated POI (FVG / OB).
     - Session Timing Guard (London / NY Killzone aktif, News Lock aman).
  2. *Validasi Broken Sweep & Deteksi OTE 61.8% – 78.6%:* Menggugurkan sweep lama jika sudah ditembus BOS berlawanan (>0.15 break), serta menghitung level OTE Deep Discount/Premium pada leg BOS aktif secara presisi.
  3. *TP1 Cepat (BEP) + Runner:* Panduan SOP eksekusi untuk mengamankan 60% posisi di TP1 dan segera menggeser SL ke BEP (+spread) demi proteksi modal nyata Sayang.
  4. *Integritas & Versi:* Seluruh 58 targeted test suite lolos 100%. Versi dinaikkan ke `2.0.0-pro.455` (code `950455`).

## Rilis Pro 456: Amy Live 2.0 & Smart Context Router dari AI Studio (20 Nov 2026)
- **Konteks:** Adopsi fitur Amy Live 2.0 dari commit `ddd382a` dan `b1d2703` Google AI Studio (`suhaimitoamy/Amy-fx-ai-studio`) ke `Amy-fx-pro`.
- **Solusi & Implementasi:**
  1. *Arsitektur Client-Bridge & WebSocket Live Voice Dipertahankan 100%:* Sesuai instruksi Sayang, mekanisme direct WebSocket browser ke Google (`models/gemini-3.8-live`, suara Aoede) dan endpoint `/api/gemini-config` tetap aktif dan tidak dirusak agar fitur suara real-time Amy Live Voice tetap berfungsi normal di HP Sayang.
  2. *Smart Context Router:* Hanya memuat modul konteks aplikasi yang relevan dengan pertanyaan Sayang (Chart Mapping -> snapshot M15 & live price; News -> sanitasi telegram feed; Jurnal -> riwayat & habits; Risk -> kalkulator lot instan), menurunkan beban token dan membuat respons instan tanpa lag.
  3. *Validasi Kunci & Anti-Hallucination:* Menambahkan `lib/amy-assistant-engine.mjs` dengan fungsi `isValidGeminiApiKey` untuk menolak placeholder key, serta rantai model free-tier (`gemini-3.1-flash-lite`, `gemini-4-hydrogen`).
  4. *Memory Bersih & UI/UX Polish:* Pesan error tidak disimpan ke riwayat chat `localStorage` agar tidak meracuni obrolan berikutnya. Memperbaiki kontras judul AMY di Light/Dark Mode, Fullscreen Bubble Orb full-bleed, dan bar input mobile yang lega.
  5. *Integritas & Versi:* Seluruh 80 targeted test suite lolos 100%. Versi dinaikkan ke `2.0.0-pro.456` (code `950456`).

## Rilis Pro 457: Integrasi Komprehensif Seluruh Fitur AI Studio (20 Nov 2026)
- **Konteks:** Menuntaskan seluruh migrasi fitur dari Google AI Studio (`suhaimitoamy/Amy-fx-ai-studio`) ke `Amy-fx-pro` secara komprehensif tanpa merusak test suites atau melanggar invariant proteksi.
- **Solusi & Implementasi:**
  1. *Market Intel V2:*
     - Header topbar modern `.intel-topbar` dengan kicker `AMY FX PRO · XAU/USD` dan judul rapi.
     - Filter chip tiga mode pada Berita: `Fokus Gold (XAU)`, `High Impact`, dan `Semua Berita`.
     - Tombol manual refresh (`#btn-refresh-sentiment`, `#btn-refresh-news`, `#btn-refresh-calendar`) dengan feedback visual "Memuat…".
     - Badge kategori berita institusional (`The Fed & Yield`, `Data Makro AS`, `Geopolitik`, `Energi`, `Gold & USD`, `Pasar Global`) dan filter noise saham (`isStockNoise`).
     - Pemetaan bridge Dealing Range & POI presisi (`computeMappingBridgeState`).
  2. *Natural UI & Personalisation Polish:*
     - Mengadopsi Section 11 CSS Natural UI Pro355 (+1,025 baris) untuk tema tampilan Light/Dark Mode, kontrol saturasi, dan obsidian glassmorphism.
     - Memperbarui styling Market Intel V2 (+502 baris) untuk topbar, badge berita, dan tata letak status feed.
  3. *Local Assistant Supercharged:*
     - Menambahkan fungsi kalkulator lot & risiko instan (`riskCalc`), tracking habits & streak disiplin harian (`habits`), kalender ekonomi USD (`calendar`), dan evaluasi performa latihan (`practice`).
     - Tetap mempertahankan 100% kontrak pengujian offline tanpa panggilan remote API eksternal.
  4. *Integritas & Versi:* Seluruh 126 targeted test suite lolos 100%. Versi dinaikkan ke `2.0.0-pro.457` (code `950457`).

## Rilis Pro 458: Pro Journal Analytics, SVG Equity Curve & TwelveData Multi-Key Pool (20 Nov 2026)
- **Konteks:** Migrasi borongan fitur dari commit `f85e67d` Google AI Studio (`suhaimitoamy/Amy-fx-ai-studio`) ke `Amy-fx-pro`.
- **Solusi & Implementasi:**
  1. *Central Journal Analytics Pro (`apps/shared/journal-analytics-pro.js` & `.css`):*
     - Engine analitik tunggal zero-dependency (100% offline-first IndexedDB + localStorage) menghitung Equity Curve net $/R, underwater drawdown, win rate, profit factor, expectancy, streaks, performa per sesi WITA, performa per setup ICT, dan leak cost kesalahan trading.
     - Visualisasi SVG responsif dengan pointer/touch scrubber native yang mendukung tema Dark & Light mode.
  2. *Integrasi Dashboard Beranda & Modul Jurnal:*
     - Kartu ringkas Performa Jurnal di Beranda (`index.html`, `app.js`, `amyfx-home-data-integration-v1.js`) di bawah Peta Harga dengan 4 KPI tabular dan deep-link cepat.
     - Modul Jurnal (`apps/journal/app.js`, `index.html`, `journal-analytics.js`) mengadopsi host container Pro mount dengan filter 7H/30H/90H/Semua dan toggle R-Multiple.
  3. *TwelveData Multi-Key Pool (`lib/twelvedata-key-pool.mjs`):*
     - Rotasi seimbang multi-key gratis (via `TWELVEDATA_API_KEYS`, `TWELVEDATA_API_KEY_1..10`, `/root/.twelvedata_keys`).
     - Failover otomatis saat status 429 rate limit (cooldown 65s/daily limit).
     - Optimasi kredit API: cache TTL 180s pada `scalper-setups.js`, sintesis candle D1 dari H1 (menghapus panggilan D1 berulang), dan cache sharing lintas outputsize.
  4. *Integritas & Versi:* Targeted test suites (`journal-analytics-pro.test.mjs`, `twelvedata-key-pool.test.mjs`, `profile-version-update-regression.test.mjs`) lolos 100%. Versi dinaikkan ke `2.0.0-pro.458` (code `950458`).

## 15. GitHub Private Cloud Sync (Data Pribadi Sayang)
- **Repository:** `suhaimitoamy/amyfx-private-sync` (Private)
- **Token Config:** `/root/.amyfx_cloud_sync_config.json` (Fine-Grained PAT, Scope `Contents: Read and write` terkunci hanya untuk `amyfx-private-sync`).
- **Target File:** `amyfx-cloud-sync.json` (Jurnal, Catatan Pribadi, Profil, Daily Loss Guard, Bookmark Academy).













## 16. Rencana Arsitektur Live-Price Hub Persisten (Pasca-Push `Amy-fx-ai-studio`)
- **Status:** DIJADWALKAN (Menunggu Sayang selesai tes Preview & push `Amy-fx-ai-studio`).
- **Konteks:** Paket Twelve Data Basic 8 membatasi maksimal `1 WS connection`, sedangkan serverless Vercel (`/api/live-price`) memiliki batas eksekusi (~50–60 detik) dan berpotensi membuka koneksi per instance.
- **Keputusan (Opsi 2):** Setelah `Amy-fx-ai-studio` di-push:
  1. Audit & porting perubahan Hub 1-koneksi dari `Amy-fx-ai-studio` ke `Amy-fx-pro` (termasuk `tools/serve-local.mjs`, `api/live-price.js`, dan aset Beranda/Mapping).
  2. Siapkan **1 server Node.js persisten (always-on)** di luar Vercel (Railway/Fly.io/VPS) sebagai Hub WebSocket Twelve Data tunggal 24 jam agar web Vercel maupun APK Android menembak ke 1 Hub permanen tanpa putus dan tanpa bentrok limit `1 WS connection`.
- **Acuan Rollback Sebelum Rombak:** Tag `rollback-pro-477` (`2.0.0-pro.477` / `3b924b7e`) di `Amy-fx-pro` dan `rollback-studio-pro-477` (`83da747`) di `Amy-fx-ai-studio`.
