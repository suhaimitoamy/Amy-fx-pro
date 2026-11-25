# Feature History

## 2026-11-25 — Upgrade Aditif 5 Pilar Amy FX Pro (Command Strip Beranda, Lot Sync & POI Breakdown, AMY Briefing 30 Detik, Jurnal Playbook & Leak Detector, Backend Multi-Key + Backup Lengkap)
- **Mapping Cockpit (`mapping-history-engine.js`, `lot-calculator.js`, `dashboard-v2.js`, `ict-dashboard-v2.css`):** Kalkulator Lot kini otomatis membaca Saldo Aktif Profil + realized Riwayat POI + `% Risiko` Profil lengkap dengan tombol `Sync Profil` & preset `1.5%`, sementara panel Riwayat Reaksi & POI menampilkan tabel ringkas **Performa Jenis Zona (`OB/FVG/iFVG/BB`)** & **Performa Sesi (WITA)**.
- **Beranda Command Center Strip (`app.js`, `styles.css`):** Strip 3 sel cepat tepat di bawah Peta Harga (`Saldo Aktif`, `Sesi & News`, `Kompas XAU` live dari `/api/macro-snapshot`) yang dapat diklik langsung ke Profil, Mapping, atau Market Intel tanpa menyentuh Peta Harga.
- **Upgrade Otak AMY Assistant (`amy-local-assistant.js`, `amy-gemini-live-bridge.js`):** Chip cepat `Layak Entry?` dan briefing 30 detik yang menggabungkan live Kompas Makro (DXY/US10Y/VIX/XAU-XAG), struktur Mapping, Saldo Aktif & performa POI, serta Daily Loss Guard.
- **Jurnal Trading Pro (`journal-analytics-pro.js`, `journal-pro-ledger.css`):** Menambahkan **Playbook Scorecard (Setup ICT)** dengan Grade `A–D` + **Performa per Hari (WITA)** pada sub-tab `Sesi & Setup`, serta **Detektor Kebocoran Otomatis** (Revenge Re-entry `≤25m`, Overtrade Harian, Sesi Rawan, Pola Berulang) pada sub-tab `Kebocoran`.
- **Reliabilitas API & Cadangan JSON Lengkap (`api/heatmap.js`, `api/liquidity.js`, `app.js`):** Dukungan rotasi multi-key `TWELVEDATA_API_KEYS` + fallback stale cache 30 menit di endpoint heatmap & liquidity, serta penyertaan Riwayat POI, Alarm Harga, dan Penguasaan Latihan 100 Kasus dalam Ekspor/Pulihkan Cadangan JSON Profil. Terverifikasi 36/36 unit tests dan Playwright Chromium Desktop/Mobile Dark & Light Mode (0 console errors).

## 2026-11-25 — Mapping Riwayat POI: SL 60–100 Pips, PnL Minus/Plus Jujur & Sinkronisasi Saldo Profil
- **SL Gold 60–100 Pips (`$6.00–$10.00`) pada Riwayat & Setup Live (`mapping-history-engine.js`, `mapping-accuracy.js`, `dashboard-v2.js`):** Mengkalibrasi jarak SL dari CE menjadi 60–80 pips (M5) dan 70–100 pips (M15) lengkap dengan label jarak pips (`(70p)`) di kartu Riwayat POI, target TP1 (`1.5R`) & TP2 (`2.5R`) proporsional, serta auto-refresh riwayat backfill via `BACKFILL_ENGINE_VERSION = 5`.
- **Tampilan Profit & Rugi Bertanda (`-` pada SL, `+` pada TP) (`dashboard-v2.js`, `ict-dashboard-v2.css`):** Mengganti label `Maks +$...` yang keliru pada status `Jebol SL ✕` menjadi realisasi rugi bertanda minus warna merah (`-68.5p · -$71.68`), profit bertanda plus warna hijau pada `TP1/TP2` (`+175p · +$176.50`), status aktif netral, serta chip ringkasan `Net` dan `Saldo` pada scorecard Riwayat POI.
- **Sinkronisasi Otomatis Modal/Saldo Profil (`account-sim-engine.js`, `home-account-cockpit.js`, `app.js`):** Saldo `BALANCE AKUN PRO`, header Identitas Trader, dan ringkasan risiko di Profil kini bertambah/berkurang otomatis mengikuti hasil Riwayat POI (komponding sesuai `% Risiko` Profil, baik dalam `USD` maupun `IDR`) tanpa mengubah nilai editable `Modal Awal`, serta langsung kembali bersih saat `Reset Riwayat` dijalankan. Terverifikasi 35/35 targeted unit tests dan Playwright Chromium (0 console errors).

## 2026-11-25 — Rombak Total Market Intel · Navigasi Kompas Makro Real-Time (Zero Data Palsu · Desain Institutional Gold-Desk)
- **Data Makro Real-Time & Engine Anti-Halusinasi (`api/macro-snapshot.js`, `tools/serve-local.mjs`, `apps/market-intel/kompas-engine.js`, `apps/market-intel/app.js`):** Mengganti logika template lama yang mengarang arah USD/Yield dari proyeksi belum rilis menjadi mesin makro berbasis kuotasi live nyata (**DXY**, **US 10Y Yield (bps)**, **VIX**, dan **SMT XAU/XAG**) plus skor kalender USD khusus angka **Actual yang benar-benar sudah rilis** (dilengkapi guard anti-polusi berita pra-rilis dan deteksi jujur bentrok Makro vs M15 / News Lock).
- **UI Kompas Institusional Ringkas (`apps/market-intel/app.js`, `apps/market-intel/styles.css`, `apps/market-intel/index.html`):** Menghadirkan Hero Verdict dengan **SVG Macro Compass Gauge (`-100..+100`)**, strip telemetri 4 kolom dengan **sparkline 10 hari real-time**, panel split **Agenda USD + Pemicu Reaksi** berdampingan dengan **Jembatan Mapping XAU/USD (Dealing Range Bar + BSL/SSL)**, serta 2 headline **Berita Penggerak Utama** yang langsung melompat ke tab Berita. Tab **Berita** dan **Kalender** dipertahankan utuh tanpa perubahan. Terverifikasi 21/21 targeted unit tests (`tests/kompas-engine.test.mjs`, `tests/trader-insights-engine.test.mjs`, `tests/universal-nav.test.mjs`) dan audit Playwright Chromium Desktop Dark/Light `1440×900` + Mobile `390×844` (0 console errors, 0 overflow).

## 2026-11-25 — Candle Replay Pro Studio (Paritas Fungsional Bar Replay Ala TradingView · 100% Orisinal Amy FX)
- **Bar Replay Interaktif & Navigasi Waktu (`replay-engine.js`, `chart-engine.js`, `candle-replay.js`, `candle-replay.html`):** Menambahkan mode **Potong Bar** (klik langsung titik mulai replay di chart dengan tirai penggelap masa depan & `Esc` batal), **Scrubber Progress Timeline (`Bar X / Y`)**, tombol **Reset Awal (`⏮`)**, **Lompat Acak (`Acak`)** untuk latihan *blind backtest*, kecepatan lengkap **`0.3x`–`10x`**, serta pintasan keyboard ala terminal (`Space`, `Shift+→/←`, `Alt+H/T/V/F/R/M`, `M`, `Ctrl+D`, `Esc`, `?`).
- **Tipe Grafik, Skala Harga & Indikator Zero Future Leak (`replay-indicators.js`, `chart-engine.js`):** Menambahkan 5 tipe chart (**Candle**, **Hollow**, **Bar OHLC**, **Garis**, **Area**), kontrol skala harga (**`%`**, **`Log`**, **`Auto`**), serta menu **Indikator** anti-bocor masa depan (**EMA 20 / 50 / 200**, **VWAP Intraday**, **Bollinger Bands 20,2**, **Arsir Sesi Asia/London/NY**, dan **Level ICT PDH/PDL/Asia**).
- **Studio Alat Gambar Lengkap, 1-Klik Order & Snapshot (`practice-ui.js`, `drawing-core.js`, `candle-replay.js`, `practice.css`):** Menambahkan **Pengukur Pips/%/Bar (`M`)**, **Magnet OHLC (`Mati → Lemah → Kuat`)**, **Kunci Semua Objek**, **Sembunyikan/Tampilkan Objek**, **Tetap Gambar**, **Undo/Redo**, **Garis Vertikal**, **Rentang Tanggal & Harga**, **Kuas/Path**, **Lingkaran**, **Catatan**, **Label Harga**, **Floating Toolbar Objek Terpilih** (warna, ketebalan, `Solid/Putus/Titik`, Duplikat, tombol **`Kirim ke Order`** dari proyeksi Long/Short R:R), **Daftar Objek (Object Tree)**, panel mengambang **1-Klik Instant BUY/SELL**, **Watermark `XAU/USD · TF`**, serta **Simpan Screenshot Chart (PNG)**. Terverifikasi 9/9 unit tests (`tests/replay-pro-features.test.mjs`, `tests/universal-nav.test.mjs`) dan Playwright Chromium Desktop Dark/Light + Mobile Normal/Fullscreen (0 console errors, 0 overflow).

## 2026-11-24 — Perbaikan Navigasi Kembali (`←`) 1-Langkah Global & Perapian Wadah Alat TradingView Candle Replay
- **Navigasi Kembali (`←`) 1-Langkah Lintas Modul (`amyfx-universal-nav.js`, `app.js`, `apps/academy/*`, `apps/academy/trading-practice/*`, `apps/journal/app.js`):** Memperbaiki bug global di mana klik `←` langsung melempar ke Beranda. Kini membaca bab di **Academy** lalu klik `←` kembali ke **Daftar Bab Academy** (label otomatis berubah `Daftar Bab` ↔ `Beranda`), klik `←` di **Candle Replay / Performa / Latihan** kembali 1 langkah ke halaman sebelumnya atau tab **Backtest** (`#backtest`, bukan Beranda), klik `←` saat **Fullscreen / Modal / Drawer** aktif menutup overlay lebih dulu, dan di **Jurnal** kembali dari sub-tab ke tab sebelumnya sebelum keluar ke Beranda.
- **Wadah Alat TradingView Tunggal & Fullscreen Rapi di Candle Replay (`candle-replay.html`, `practice-ui.js`, `practice.css`):** Mengganti tombol alat gambar yang terpencar dan terpotong dengan satu wadah `#tvDrawingDock` bergaya TradingView (rel kiri vertikal `46px` di Desktop & Fullscreen Landscape; bar 8 ikon sejajar tanpa scroll di Mobile), memaku tombol `ICT`, `Cursor`, dan `Penuh`/`Keluar` di baris atas agar selalu terlihat, merapikan bar Killzone & Bookmark menjadi 1 baris (`Asia | London | NY | Tgl | ★ | BM (0)`), serta memaksimalkan area chart saat Fullscreen di Dark & Light Mode. Terverifikasi `tests/universal-nav.test.mjs` (4/4 lulus) dan Playwright Chromium Mobile `390×844` + Desktop `1440×900` (0 console errors, 0 overflow).

## 2026-11-24 — Amy FX Academy: Buku Panduan Trading Interaktif 36 Bab Tuntas 100% (Tahap 0–6: Bab 01–36)
- **Single-Flow Interactive Book Reader & Peta 36 Bab Nol Duplikasi (`curriculum.js`, `academy-app.js`, `academy.css`, `apps/academy/index.html`, `diagram-engine.js`):** Mengganti format kartu/5-tab yang terasa terpotong menjadi **Buku Trading Interaktif satu alur mengalir** dengan 6 Bagian (`Bagian I–VI`) dan 36 Bab berurutan tanpa istilah "Level" dan tanpa duplikasi materi, sambil mempertahankan kunci pemahaman ala Duolingo (Uji Paham ≥80%), Tes Loncat Bagian I (wajib 4/4 untuk langsung buka Bab 07), dan kompatibilitas 100% deep-link lama via `LEGACY_ID_ALIASES`.
- **Tahap 1 — Bagian I: Fondasi Pemula & Cara Kerja Pasar Gold (`apps/academy/data/level-0.js`, Bab 01–06):** Ditulis ulang tuntas bergaya buku trading nyata dari nol mutlak (Broker/Demo-Cent-Standard, Pips/Bid/Ask/Spread, Lot/Leverage/Margin/Equity + Lab Interaktif, Panduan MT5 & 5 Jenis Order, Anatomi Candlestick & Timeframe, Karakter XAU/USD + Tabel WITA EDT/EST + Aturan Akhir Pekan) dengan 24 soal Uji Paham selaras teks.
- **Tahap 2 — Bagian II: Struktur Pasar & Peta Likuiditas (`apps/academy/data/levels-1-2.js`, Bab 07–12):** Ditulis ulang tuntas bergaya buku teks nol-skip tanpa duplikasi: Bab 07 (Swing 3-Candle Fraktal, HH–HL/LH–LL/Sideways, Strong vs Weak Point), Bab 08 (Top-Down H4/H1 → M15 → M5 & Sifat Fraktal Koreksi), Bab 09 (BOS Body Close vs Liquidity Sweep Wick-Only + 2 Kasus Abu-Abu), Bab 10 (Dealing Range Aktif & Hukum Pendulum ERL ↔ IRL), Bab 11 (Logika Likuiditas, BSL/SSL, EQH/EQL, 5 Kolam Utama + WITA EDT/EST, Status Fresh vs Taken), dan Bab 12 (Inducement Pre-IDM vs Post-IDM) lengkap dengan 24 soal skenario dan tipografi tabel sans-serif `tabular-nums`.
- **Tahap 3 — Bagian III: Kompas Arah (`apps/academy/data/levels-1-2.js` Bab 13 + `apps/academy/data/levels-5-6.js` Bab 14–17):** Ditulis ulang tuntas bergaya buku teks nol-skip dengan 20 soal skenario baru: Bab 13 (Draw on Liquidity / DOL Tuntas 4 Langkah & Aturan Tunggu Sapuan Pertama di Tengah Range), Bab 14 (Daily Bias, Next-Day Expansion, & Garis Batal Bias), Bab 15 (Siklus Harian Power of Three AMD, NY Midnight Open `12:00/13:00 WITA` & Judas Swing), Bab 16 (Waktu Institusional: Killzone, Silver Bullet & Macro 20 Menit `xx:50–xx:10` dalam tabel eksak NY → WITA EDT +12 / EST +13), serta Bab 17 (Berita Ekonomi USD CPI/NFP/FOMC & Protokol News Lock `-15m s.d. +30m`).
- **Tahap 4 — Bagian IV: Mesin Zona Entry ICT / PD Arrays (`apps/academy/data/levels-3-4.js` Bab 18–21, 23–24 + `apps/academy/data/mastery-advanced.js` Bab 22):** Ditulis ulang tuntas bergaya buku teks nol-skip dengan 29 soal Uji Paham baru (termasuk 5 soal pada Bab 22): Bab 18 (Displacement 3 Pilar vs Gerakan Merayap & Bahaya Kejar Pucuk), Bab 19 (FVG BISI/SIBI, 50% CE, Breakaway/Measuring/Exhaustion Gap & Memilih Multi-FVG), Bab 20 (Inversion FVG `+iFVG`/`-iFVG` & Syarat Body Close Pasca-Sweep), Bab 21 (Order Block Bermutu Tinggi vs Trap OB, Rangkaian Candle & 50% Mean Threshold vs CE), Bab 22 (Breaker Block `+BB`/`-BB` vs Mitigation Block & ICT Unicorn Model), Bab 23 (CISD Level Candle vs MSS Level Swing), dan Bab 24 (Premium/Discount/50% Equilibrium, OTE `61,8%–78,6%` titik manis `70,5%`, & Hierarki PD Array selaras Mapping Cockpit).
- **Tahap 5 — Bagian V: Model Eksekusi, Filter Gagal & Manajemen Trade (`apps/academy/data/levels-3-4.js` Bab 25–27 + `apps/academy/data/levels-5-6.js` Bab 28–30 + `diagram-engine.js`):** Ditulis ulang tuntas bergaya buku teks nol-skip dengan 24 soal Uji Paham baru dan matematika 100% terverifikasi: Bab 25 (Model Entry Utama ICT 2022 4 langkah + Cancel Rule + studi kasus NY AM), Bab 26 (Model Entry Alternatif: iFVG Momentum, ICT Unicorn & Turtle Soup/SMR + 3 Benteng Anti-Pisau Jatuh + studi kasus PWL), Bab 27 (Hukum 1 Model Utama 30–50 trade anti-*System Hopping*, 5 Bendera Merah Auto-Skip & Checklist 30 Detik `5× YA`), Bab 28 (Stop Loss Struktural + Napas Spread & Jebakan Bid/Ask SELL + Target Likuiditas TP1/TP2), Bab 29 (Partial Close, Syarat Sah Breakeven, Daily Loss Guard & No-Trade Days), serta Bab 30 (4 Virus Emosi Scalper + Penawar Mekanis & Protokol 100 Sample `50 Backtest → 30 Forward → 20 Live` dengan 4 metrik kelulusan Analitik Jurnal Pro).
- **Tahap 6 (Final) — Bagian VI: ICT Institusional Lanjutan & Mapping Mandiri (`apps/academy/data/mastery-advanced.js` Bab 31–36 + `diagram-engine.js` + `amy-local-knowledge.js`):** Ditulis ulang tuntas 6 bab pamungkas (30 soal Uji Paham, total **151 soal** se-buku) dengan aritmetika 100% terverifikasi dan nol duplikasi: Bab 31 (BPR irisan BISI+SIBI, Volume Imbalance vs FVG, NWOG/NDOG `17:00→18:00 NY` + studi kasus Bearish BPR dengan napas Ask), Bab 32 (SMT Divergence Gold vs Silver searah & DXY terbalik + 3 aturan anti-noise + dual SMT NY AM), Bab 33 (MMBM/MMSM 4 tahap, Side of the Curve & LRLR vs HRLR), Bab 34 (3 Weekly Profile: Classic Expansion, Midweek Reversal, Friday TGIF `20%–30%` & IPDA `20/40/60` hari perdagangan merujuk Bab 16 tanpa pengulangan), Bab 35 (Standard Deviation `-1/-2/-2,5/-4` dari Manipulation Leg untuk All-Time High & CRT 3-Candle OLHC/OHLC), dan Bab 36 (Capstone: Protokol Baku 6 Langkah 10 Menit Top-Down dari Chart Kosong, aturan maks 5 elemen bersih, 4 saringan POI, Bias Netral & prioritas News Lock). Seluruh 36/36 bab teraudit `0` isu `fmtRich`, `amy-local-knowledge.js` tersinkron bersih (36 entri tanpa `(undefined)`), **13/13 unit tests** lulus, serta verifikasi live Chromium Desktop `1440×900` & Mobile `390×844` (0 console errors, 0 overflow).

## 2026-11-24 — Zona Inverse FVG (iFVG), Breaker Block (BB) & Upgrade Profitabilitas Mesin Mapping v4
- **Deteksi & Visualisasi Chart Gold iFVG + Breaker Block (`nextgen-indicators.js`, `ict-canvas.js`, `mapping-accuracy.js`, `dashboard-v2.js`):** Menambahkan pelacakan otomatis **Inverse FVG (`+iFVG` ungu / `-iFVG` amber)** saat FVG valid ditembus close dan **Breaker Block (`+BB` cyan / `-BB` oranye)** saat OB valid ditembus close, lengkap dengan garis 50% CE, penanda sentuhan (`T1` / `CE`), integrasi prioritas Dual-Layer POI live (`BB > iFVG > OB > FVG`), serta dukungan statistik `iFVG` dan `BB` di Riwayat Reaksi & Kalender POI.
- **Upgrade Profitabilitas & Disiplin Kausal Pra-Entry (`mapping-history-engine.js`, `dashboard-v2.js`, `amy-ict.mjs`/`amy-ict.js`):** Memperbaiki seluruh 7 kelemahan forensik SL (penolakan sentuhan salah sisi, buffer SL wick XAU/USD proporsional `$1.40–$3.00`, eliminasi phantom `maxFavorable`, filter kausal Rollover/Asia M5/counter-trend M5/anti-overlap/zona raksasa, retensi backfill 48 jam simetris, serta sinkronisasi dinamis Dealing Range live). Terverifikasi 34/34 unit tests dan live Chromium audit (0 console errors).

## 2026-11-23 — Rombak Total Amy FX Academy: Jalur Penguasaan ICT 43 Modul (Tanpa Level · Sistem Kunci Ala Duolingo 80% · 100% ICT Nol Duplikasi)
- **Jalur Penguasaan 43 Modul Linear & 7 Materi ICT Institusional Baru (`mastery-advanced.js`, `mastery-deep-enrichment.js`, `diagram-engine.js`, `curriculum.js`):** Menghapus seluruh label birokrasi "Level 0 / Level 1 / Lv 2" dari UI pengguna menjadi jalur berurutan **Modul 01–43** dalam 8 *Babak Perjalanan* tanpa duplikasi materi antar bab. Menambahkan **7 modul lanjutan non-tumpang-tindih** (`Modul 37–43`: Breaker/Mitigation & ICT Unicorn, BPR/Volume Imbalance & NWOG/NDOG, SMT Divergence XAU vs Silver/DXY, MMXM, ICT Macros `xx:50–xx:10` / Weekly Profile TGIF / IPDA 20-40-60, Standard Deviation `-1/-2/-2.5/-4` & CRT Candle Profiling, serta Capstone Protokol Mapping Mandiri Chart Kosong) lengkap dengan **7 diagram SVG interaktif baru** (total 43 blueprint). Memperdalam seluruh 36 modul lama (termasuk bedah tuntas **Draw on Liquidity / DOL**, seleksi Multi-FVG & Breakaway/Measuring Gap, High-Prob OB vs Trap OB, Dealing Range IRL↔ERL, dan Inducement) dengan langkah mapping mekanis (`mappingSteps`), pohon keputusan kasus abu-abu (`decisionTree` IF→THEN), perbandingan kasus gagal (`failedCase`), dan soal skenario tambahan (total 150+ soal).
- **Sistem Kunci Pemahaman Ketat Ala Duolingo & Tes Loncat Dasar MT5 (`curriculum.js`, `academy-app.js`, `academy.css`, `apps/academy/index.html`):** Mengunci ketat seluruh modul berikutnya hingga modul aktif lulus **Uji Paham minimal 80%** tanpa tombol bypass manual "Tandai Selesai". Menambahkan Modal Info Kunci saat pengguna mengetuk modul terkunci maupun mencoba bypass langsung lewat URL `?lesson=...`, **Tes Loncat Dasar MT5** (wajib **4/4 = 100%** untuk langsung membuka Modul 07), sistem XP, serta **Guided Reader 5-Tab Anti-Bingung** (`1. Pahami & Gambar`, `2. Kasus Abu-Abu`, `3. Bedah Kasus`, `4. Uji Paham 🔓`, `Semua`) lengkap dengan perender markdown aman (`**bold**`, `*italic*`, `` `code` ``).
- **Sinkronisasi Ekosistem AMY Live & Verifikasi:** Meregenerasi `apps/shared/amy-local-knowledge.js` (43 entri), menyinkronkan `amy-local-assistant.js`, `amy-gemini-live-bridge.js`, dan `api/gemini-chat.js`, serta memverifikasi 21/21 targeted unit tests (`academy-curriculum`, `amy-assistant-engine`, `pro-95-upgrades`) dan seluruh alur kunci di Chromium headless (Desktop `1440×900` & Mobile `390×844`, 0 console errors, 0 overflow).

## 2026-11-23 — Perbaikan Akurasi AMY Live Chat & Live Voice (4 Kontrak Bridge + Sinkronisasi Cockpit, Jurnal REAL/SIM, Academy 36 Bab, Practice 100 Kasus & Kalender)
- **Perbaikan 4 Kontrak Bridge yang Sebelumnya Putus Diam-Diam (`apps/shared/amy-local-assistant.js`, `apps/shared/amy-gemini-live-bridge.js`):** Mengekspor `getLivePrice()`, `buildMappingSnapshot(ctx, livePrice)` (Dealing Range `%` + `BREAKDOWN/DISKON/NO-TRADE EQ/PREMIUM/BREAKOUT` + BSL/SSL valid), `readJournals()`, serta `calculateLot(query)` terstruktur (`{ ok, lot, riskUsd, slPoints, slPips, tp1, tp2, text }` dengan `riskCalc()` tetap kompatibel string) sehingga shortcut Kalkulator Lot instan, injeksi konteks `appContext`, dan tool Live Voice `calculate_gold_lot` + `get_journal_summary` kini bekerja 100% deterministik.
- **Sinkronisasi Penuh Data Modul Terbaru (`dashboard-v2.js`, `amy-local-assistant.js`, `amy-gemini-live-bridge.js`, `api/gemini-chat.js`, `lib/amy-assistant-engine.mjs`):** Mempublikasikan snapshot read-only `window.AmyMappingLiveCockpit` + `amyfx.mapping.cockpit_snapshot.v1` (Dual-Layer POI BUY/SELL, 5-Point Verdict Grade/Score, Priority Side, Session Guard, Weekend Closure, serta Respect Rate% hari ini dari `amyfx.mapping.reaction_history.v1`); memisahkan statistik Jurnal `REAL` vs `SIM/Backtest` + Analitik Pro + Evaluasi Mingguan 7H + Habits + status **Daily Loss Guard**; menyinkronkan progres Academy 7 Level / 36 Bab + kesiapan Level 0 (`0–6`) + pencocokan `Pelajaran 0.x`/`Bab XX`/`Level 0..6`; membaca mastery Practice 100 Kasus (`amy-guided-v3-mastery`) + memperbaiki seluruh tautan mati 404 `apps/practice/index.html` → `apps/academy/trading-practice/index.html`; mendukung cache kalender `amy_economic_calendar_v1` (`dateIso`); serta memperbaiki false-match intent `pips`/`stop loss` pada modul Jurnal.

## 2026-11-23 — Perbaikan Akurasi AMY Live Chat & Live Voice (4 Kontrak Bridge + Sinkronisasi Cockpit, Jurnal REAL/SIM, Academy 36 Bab, Practice 100 Kasus & Kalender)
- **Perbaikan 4 Kontrak Bridge yang Sebelumnya Putus Diam-Diam (`apps/shared/amy-local-assistant.js`, `apps/shared/amy-gemini-live-bridge.js`):** Mengekspor `getLivePrice()`, `buildMappingSnapshot(ctx, livePrice)` (Dealing Range `%` + `BREAKDOWN/DISKON/NO-TRADE EQ/PREMIUM/BREAKOUT` + BSL/SSL valid), `readJournals()`, serta `calculateLot(query)` terstruktur (`{ ok, lot, riskUsd, slPoints, slPips, tp1, tp2, text }` dengan `riskCalc()` tetap kompatibel string) sehingga shortcut Kalkulator Lot instan, injeksi konteks `appContext`, dan tool Live Voice `calculate_gold_lot` + `get_journal_summary` kini bekerja 100% deterministik.
- **Sinkronisasi Penuh Data Modul Terbaru (`dashboard-v2.js`, `amy-local-assistant.js`, `amy-gemini-live-bridge.js`, `api/gemini-chat.js`, `lib/amy-assistant-engine.mjs`):** Mempublikasikan snapshot read-only `window.AmyMappingLiveCockpit` + `amyfx.mapping.cockpit_snapshot.v1` (Dual-Layer POI BUY/SELL, 5-Point Verdict Grade/Score, Priority Side, Session Guard, Weekend Closure, serta Respect Rate% hari ini dari `amyfx.mapping.reaction_history.v1`); memisahkan statistik Jurnal `REAL` vs `SIM/Backtest` + Analitik Pro + Evaluasi Mingguan 7H + Habits + status **Daily Loss Guard**; menyinkronkan progres Academy 7 Level / 36 Bab + kesiapan Level 0 (`0–6`) + pencocokan `Pelajaran 0.x`/`Bab XX`/`Level 0..6`; membaca mastery Practice 100 Kasus (`amy-guided-v3-mastery`) + memperbaiki seluruh tautan mati 404 `apps/practice/index.html` → `apps/academy/trading-practice/index.html`; mendukung cache kalender `amy_economic_calendar_v1` (`dateIso`); serta memperbaiki false-match intent `pips`/`stop loss` pada modul Jurnal.

## 2026-11-23 — Upgrade 5 Pilar Kualitas Produk (Jembatan 1-Ketuk Mapping → Jurnal, News Lock Banner, Academy Level 0 Interaktif, Zero-CORS & Provider Guard, CSS Hygiene & FAB/Weekly Polish)
- **Jembatan 1-Ketuk Mapping → Jurnal & Banner News Lock (`cockpit-bridge-helpers.js`, `apps/mapping/index.html`, `dashboard-v2.js`, `apps/journal/app.js`):** Menambahkan tombol `Catat` (`#btn-journal-buy` / `#btn-journal-sell`) pada kartu Rencana Eksekusi POI yang langsung mengisi otomatis form Jurnal Trading (`XAU/USD`, arah `Buy`/`Sell`, sesi WITA, setup + grade, R:R, dan rincian Entry CE/SL/TP1/TP2) via `window.AmyJournalBridge.prefillJournalForm` dan membersihkan query `?prefill=mapping`. Menambahkan banner `#poi-news-lock-banner` tersinkron dengan kalender USD High-Impact (`LOCK` -15m/+30m, `WARN` +30m/+90m).
- **Upgrade Interaktif Academy Level 0 (`curriculum.js`, `academy-app.js`, `academy.css`):** Menambahkan kartu **Checklist Kesiapan ICT** (`#acdReadinessCard`) di Overview Academy (progres 0–6 fondasi pemula, akurasi kuis, dan lompatan 1-ketuk ke bab berikutnya atau Level 01 ICT) serta **Simulasi Hitung Lot & Risiko Aman** interaktif (`#acdMiniRiskLab`, sakelar `Akun Cent | Standard`, 3 preset risiko 1 baris, kalkulasi lot/risiko USD & IDR real-time) langsung di dalam Bab `0.3` (`lot-leverage-margin-equity`).
- **Zero Console Error CORS & Normalisasi Error Provider (`method-toggles.js`, `lib/provider-error-guard.mjs`, `api/twelvedata.js`, `api/heatmap.js`, `api/liquidity.js`):** Menjaga sinkronisasi `scalper-preferences` agar tidak memicu error CORS preflight di preview/localhost saat token perangkat Android tidak tersedia, serta menormalisasi payload `status: 'error'` / HTTP `429` dari TwelveData di seluruh endpoint terkait.
- **Kebersihan Arsitektur CSS & Micro-Polish UX (`apps/market-intel/index.html`, `amyfx-ui-tokens.css`, `amyfx-obsidian-glass.css`, `amy-local-assistant.js`, `journal-analytics-pro.js` + `.css`):** Menghapus referensi mati `heatmap-v2.css`, menata ulang urutan `styles.css` sesudah `amyfx-obsidian-glass.css`, menambahkan token segmen/hairline/FAB-clearance kanonis, memposisikan tombol melayang `✦ AMY` adaptif (`bottom: 16px` tanpa bottom nav, `82px` saat ada bottom nav + paritas Light Mode), serta mengangkat kartu **Evaluasi Mingguan (7H)** (`computeWeeklySnapshot`) ke bagian atas tab Performa Jurnal.

## 2026-11-23 — Perapian UI Menyeluruh 5 Modul (Mapping, Jurnal, Berita, Academy & Profil — Paritas Beranda)
- **Mapping Cockpit (`apps/mapping/index.html`, `app.js`, `chart-fullscreen.js`, `price-alert-manager.js`, `ict-dashboard-v2.css`):** Menyamakan 100% tampilan **Chart Gold** dengan Peta Harga Beranda (`XAU/USD · Chart Gold`, harga live `20px` tabular kanan, metadata unboxed `BREAKOUT · 100% · Candle terkini` dengan proteksi penuh status akhir pekan Invariant #3, toolbar 1 baris `[H1 | M15 | M5]` tersinkron dua arah ke `<select id="timeframe">` + ikon SVG `Alarm`, `Perbarui`, dan `Fullscreen`/`× Keluar`), utility strip 1 baris (`Layer (6) | Gambar | Reset` + countdown ringkas `M15 · mm:ss`), dok bawah Fullscreen non-tumpang tindih, header bebas eyebrow & status sesi unboxed, serta perataan kotak ganda di kartu Bias Live & Dealing Range menjadi garis tipis hairline.
- **Jurnal Trading (`apps/journal/index.html`, `app.js`, `journal-pro-ledger.css`):** Menghilangkan aura ungu neon tombol `+` header menjadi gaya kaca monokrom selaras, menukar teks prosa (`0 trade`, sub-bar Daily Loss Guard) dari monospace ke sans bersih (`Maks 2 SL · -3%/hari`), menghapus titik dekoratif, serta menyelaraskan kontrol segmen (`Real | Simulasi | Semua` & `Semua | Win | Loss | BE | Open`) dengan gaya netral Beranda (Dark & Light Mode).
- **Berita / Market Intelligence (`apps/market-intel/index.html`, `app.js`, `styles.css`):** Menyembunyikan eyebrow header redundan, menyingkat tab `Kompas Fundamental` → `Kompas` agar `Kompas | Berita | Kalender` pas 1 baris, mengganti kotak status terpotong dengan teks unboxed + tombol ikon SVG refresh (animasi putar tanpa menimpa SVG), melepas kapsul pill statis (`Kalender Live`, `Horizon`) & garis kiri tebal, serta menyusun 4 indikator makro (`USD/DXY`, `Yield US Treasury`, `Risk Sentiment`, `Bias Fundamental Gold`) dalam grid hairline 2×2 padat.
- **Amy FX Academy (`apps/academy/js/academy-app.js`, `apps/academy/css/academy.css`):** Menyederhanakan kicker hero menjadi metadata sans 1 baris, memadatkan **Titik Mulai** (`Pemula Nol` vs `Langsung ICT`) menjadi 2 kolom ringkas sejajar di mobile, serta mengubah chip filter level (`Semua | Tersimpan | Lv 0..6`) menjadi strip 1 baris scrollable horizontal yang bebas tabrakan dengan tombol `✦ AMY`.
- **Profil (`apps/shared/home-account-cockpit.js`, `home-account-cockpit.css`, `amyfx-natural-ui-pro355.css`):** Menghapus duplikasi tombol `Buka Order` pada status kosong (mempertahankan 1 CTA utama `+ Order`), mengganti font label prosa dari monospace ke sans bersih, meratakan strip `Batas Harian Aman` menjadi baris hairline terpadu di dalam kartu Akun Pro Simulasi, dan menyelaraskan sakelar `Rp | $` serta tab Profil dengan gaya Beranda.

## 2026-11-23 — Perapian UI Beranda: Peta Harga XAU/USD, Toolbar 1-Baris, Fullscreen & Menu Utama 2×2
- **Hierarki Tipografi & Status Ringkas (`app.js`, `home-price-chart.js`, `apps/shared/amyfx-natural-ui-pro355.css`):** Menyelaraskan judul `XAU/USD` + sublabel `Peta Harga`, angka harga live tabular monospace (`20px`), metadata unboxed tanpa kapsul (`EQUILIBRIUM · 50% · Candle terkini`), serta meringkas teks status normal menjadi **`Candle terkini`** (sambil tetap mempertahankan status akhir pekan `Pasar Tutup (Akhir Pekan) · Candle Terakhir ... WITA` sesuai Invariant #3).
- **Toolbar 1 Baris & Ikon SVG Seragam (`app.js`, `apps/mapping/js/ict-workspace/price-alert-manager.js`, `home-price-chart.js`):** Mengganti dropdown `Timeframe` + tombol 2 baris (`Perbarui`, `🔔 Pasang Alarm`, `⛶ Fullscreen`) menjadi 1 baris rapi: segmen **`M15 | M5`** tersinkron dua arah dengan `#home-chart-tf` + tombol **`Alarm`** (ikon SVG + badge jumlah aktif), tombol ikon **`Perbarui`** (animasi putar saat memuat), dan tombol ikon **`Layar Penuh`** (berubah menjadi **`× Keluar`** saat aktif).
- **Mode Fullscreen & Grid Menu Utama Mobile (`apps/shared/amyfx-natural-ui-pro355.css`):** Menyediakan ruang dok bawah khusus (`margin-bottom: 52px`) agar toolbar gambar manual Fullscreen tidak menutupi sumbu waktu chart (`14:00 | 17:00`), serta merapikan **Menu Utama** menjadi grid 2×2 yang pas dan sejajar di layar mobile `390px` (Dark & Light Mode parity, 0 console errors, 0 overflow).

## 2026-11-23 — Kalender Reaksi & POI di Mapping Cockpit (Retensi 180 Hari Detail + Arsip Harian Permanen + Cloud Sync & Backup)
- **Tab ke-3 `Kalender` di `#mapping-history-card` (`apps/mapping/index.html`, `apps/mapping/js/ict-workspace/dashboard-v2.js`, `apps/mapping/css/ict-dashboard-v2.css`):** Menambahkan tab **Kalender** sejajar `Hasil POI | Timeline | Kalender` dengan tata letak kalender bulanan 8 kolom (`MIN–SAB + MGG` rollup mingguan) bergaya Kalender Performa Jurnal, ringkasan bulanan (`Respect%`, `TP`, `SL`, `Aktif`, komposisi `M15`/`M5` & `FVG`/`OB`), navigasi `‹ Bulan Tahun ›` + tombol lompat bulan aktif saat kosong, drill-down harian dengan filter cepat (`Semua | M15 | M5 | TP | SL`), kartu arsip permanen untuk tanggal `> 180 hari`, serta pengaman **2-ketuk inline** pada `Reset Riwayat` (`Ketuk lagi untuk hapus`, tanpa `window.confirm`).
- **Retensi 180 Hari Detail + Arsip Harian Permanen (`apps/mapping/js/ict-workspace/mapping-history-engine.js`):** Menaikkan penyimpanan riwayat POI dari 7 hari / 80 POI menjadi **180 hari (6 bulan)** penuh hingga `3.000` POI (`version: 2`, tetap kompatibel 100% dengan data `v1` lama pada `amyfx.mapping.reaction_history.v1`), mempertahankan filter ketat `SEVEN_DAYS_MS` untuk tab `7 Hari`, melunakkan kuota penyimpanan secara aman (*quota-safe fallback*), dan mengarsipkan otomatis POI `> 180 hari` ke `dailyArchive` permanen agar statistik kalender bulanan/tahunan tidak pernah hilang.
- **Integrasi GitHub Cloud Sync & Backup ZIP (`apps/shared/github-cloud-sync.js`, `apps/journal/app.js`, `apps/mapping/index.html`):** Menyertakan `mappingReactionHistory` ke dalam snapshot GitHub Cloud Sync dan `data.json` Backup/Restore ZIP dengan algoritma **union-merge** lintas perangkat (mempertahankan sumber `LIVE`, peringkat status tertinggi, serta `dailyArchive` terkaya), auto-sync ter-debounce 15 detik dari Mapping Cockpit, dan pembaruan live via event `amyfx:cloud-sync-pulled`.

## 2026-11-23 — Amy FX Academy Level 0: Pra-Trading & Dasar MT5 untuk Pemula Nol (7 Level · 36 Pelajaran · 108 Soal)
- **Kurikulum Level 0 Bahasa Awam (`apps/academy/data/level-0.js`, `apps/academy/data/curriculum.js`):** Menambahkan 6 bab fondasi pemula nol (`Bab 0.1`–`0.6`: Kenal Trading/Broker/Akun Demo-Cent-Standard, Bid/Ask/Spread & Pips Gold, Lot/Leverage/Margin/Equity Anti-MC, Panduan Praktis MT5 & 5 Jenis Order, Membaca Chart/Candlestick/Timeframe versi awam, serta Dasar Tren/Support–Resistance & Peta Latihan Aman 14 Hari) tanpa mengubah 30 bab ICT Level 1–6 (kompatibel 100% dengan progres `localStorage` lama).
- **6 Diagram SVG Interaktif Multi-Tahap, Pemilih Jalur & Tombol Praktik Langsung (`apps/academy/js/diagram-engine.js`, `apps/academy/js/academy-app.js`, `apps/academy/css/academy.css`, `apps/academy/index.html`):** Menambahkan 6 diagram interaktif dual-theme (`zero-account-types`, `zero-bid-ask-spread`, `zero-lot-margin-meter`, `zero-mt5-order-types`, `zero-ohlc-timeframe`, `zero-trend-sr-roadmap`), pemilih jalur di Overview (**Pemula Nol — Mulai Level 0** vs **Sudah Paham Dasar MT5 — Langsung Level 1 ICT** dengan strip lipat Level 0 opsional), kartu **Praktik Langsung** di tiap bab Level 0 menuju Jurnal/Kalkulator Lot, Cockpit Mapping, Candle Replay, Latihan 100 Soal, dan Market Intel, jembatan kelulusan Level 0 → Level 01 di Bab 0.6, serta perbaikan visibilitas tombol `Silabus` pada mobile Overview.
- **Sinkronisasi Amy Live & Verifikasi:** `apps/shared/amy-local-knowledge.js` disinkronkan ke 36 pelajaran (`Level 0–6`), 4/4 targeted unit tests lulus (`tests/academy-curriculum.test.mjs`), dan pengujian browser Playwright Chromium Desktop `1440×900` + Mobile `390×844` Dark & Light Mode bersih (0 console errors, 0 overflow, 0 tabrakan label diagram).

## 2026-11-20 — Visual Jejak Sentuhan Zona POI & Audit Akurasi ICT Mapping Cockpit
- **Penanda Sentuhan Langsung di Chart Gold (`ict-canvas.js` + `chart-view.js` + `apps/mapping/index.html`):** Setiap kotak FVG dan Order Block kini menampilkan status siklus hidup langsung pada label (`FRESH`, `1×`, `2× CE`, atau `✕ JEBOL`), garis 50% CE yang dipertegas saat tersentuh, kotak hantu (*ghost box*) untuk maks 2 zona yang baru jebol (berakhir tepat di candle break), serta penanda presisi pada candle sentuhan (`T1` dot tepi zona, `◆ T2·CE` berlian emas untuk sentuhan 50% CE, dan `✕` merah untuk invalidasi/jebol), dapat diatur melalui toggle layer baru **Jejak Sentuhan POI** (`Layer (6)`).
- **Sinkronisasi Jejak Sentuhan ke Kartu POI & Riwayat Reaksi (`dashboard-v2.js` + `mapping-accuracy.js` + `mapping-history-engine.js`):** Tile Entry BUY/SELL, 5-Poin Confluence Gate (`OB M15 · 2× CE`), tabel rincian level (lengkap dengan jam WITA sentuhan terakhir), dan kartu `Riwayat Reaksi & POI` (`2× · CE` badge) kini seluruhnya menampilkan jumlah episode sentuhan serta status sentuhan 50% CE secara konsisten pada Dark & Light Mode.
- **Audit Akurasi End-to-End OB, FVG, BOS/MSS, Sweep & DOL:** Menyatukan `lib/scalper-engine/amy-ict.mjs` ↔ `apps/mapping/js/ict-workspace/amy-ict.js` 100% byte-identical, memfilter key-level tersapu (`TAKEN`/`Consumed`) dari target DOL, menyaring noise sweep `< $0.25`, memindai multi-pool BSL/SSL, dan memverifikasi lewat 26/26 targeted unit tests (`mapping-accuracy`, `mapping-history-engine`, `mapping-poi-audit`).

## 2026-11-20 — Rombak Total Jurnal, Disiplin & Performa (Pro Ledger Editorial UI)
- **Jurnal Trade Ledger + Bottom-Sheet Modal:** Daftar trade dikelompokkan rapi per tanggal dengan total P/L harian tabular, baris ledger padat tanpa kotak bertumpuk (titik status semantik, metadata inline dipisahkan `·`, P/L rata kanan), laci detail inline dengan tombol aksi bersih + konfirmasi hapus 2-ketuk, serta form input/edit trade dalam `<dialog>` bottom-sheet lengkap dengan pemilih segmen cepat `BUY/SELL` & `Win/Loss/BE/Open/Skip`.
- **Performa Overhaul (Hero Equity + 4 KPI + 3 Sub-Tab):** Kanvas Hero Equity Curve dengan scrubber interaktif & strip *Underwater Drawdown*, strip 4 KPI tabular (`Net P/L`, `Win Rate`, `Profit Factor`, `Max Drawdown`), dan 3 sub-tab terintegrasi (**Kalender** P/L bulanan dengan nominal harian & klik-lompat ke Jurnal, **Sesi & Setup** ICT/WITA, serta **Kebocoran** psikologi & Execution Brief).
- **Disiplin (Progress Ring + Strip 7 Hari + Checklist Bergaris Tipis):** Hero SVG Progress Ring harian dengan stepper tanggal & metrik inline (`Streak`, `35H`, `Penalti`), strip kepatuhan 7 hari interaktif, checklist rutinitas bergaris tipis tanpa kotak individual, serta laci lipat untuk **Riwayat 35 Hari** dan **Kalkulator Lot XAU/USD**. Terverifikasi 7/7 unit & contract tests (`tests/journal-analytics-pro.test.mjs` + `tests/journal-pro-ledger.test.mjs`).

## 2026-11-20 — Riwayat Reaksi & Hasil POI di Mapping Cockpit (Auto-Backfill + Live Tracker)
- **Tab `Hasil POI` & Scorecard Respect:** Melacak setiap zona POI (FVG/OB `M5` & `M15`) yang disentuh harga dari awal hingga hasil akhir (`Disentuh` → `Memantul +$X` → `TP1 BEP ✓` → `TP2 DOL ★` atau `Jebol SL ✕`), lengkap dengan ringkasan persentase Respect (`TP1/TP2`, `Jebol SL`, `Aktif`) pada rentang **Hari Ini (WITA)** dan **7 Hari**.
- **Tab `Timeline Market` Kronologis (WITA):** Mencatat otomatis jejak sentuhan & hasil POI, Liquidity Sweep (`BSL`/`SSL`), Structure Break (`BOS`/`MSS`), dan sentuhan Key Level (`PDH`, `PDL`, `Asia High/Low`, `NY Midnight Open`) secara berurutan dari candle terbaru tanpa panggilan API tambahan.
- **Persistensi 7 Hari & Mobile 1080×2460 (`360×820`):** Disimpan lokal di `localStorage` (`amyfx.mapping.reaction_history.v1`) dengan penggabungan aman `LIVE` + `BACKFILL`, default ringkas 5 baris + tombol `Tampilkan semua` & `Reset Riwayat`, kontras Dark/Light Mode terjaga, serta bebas tombol `+ Jurnal` sesuai arahan user. Terverifikasi 18/18 unit tests (`tests/mapping-history-engine.test.mjs` + `tests/mapping-accuracy.test.mjs`) dan pengujian Chromium Desktop `1440×900` + Mobile `360×820` (0 console errors, 0 overflow).

## 2026-11-20 — Upgrade Akurasi Mapping Cockpit (SSOT M15, M5/M15 Key Levels, 5-Day ADR, Live Sync & Honest Verdict Gate)
- **SSOT M15 & Pure Accuracy Module (`apps/mapping/js/ict-workspace/mapping-accuracy.js`):** Menyatukan arah M15 antara Hero 3-TF, Break Terakhir, Liquidity Sweep, Target DOL, Dealing Range, dan Tab Prioritas POI; memisahkan `GRADE A+ · SIAP EKSEKUSI SCALPER` (`<= $4` dari zona) dari `GRADE A+ · TUNGGU PULLBACK` (`$4–$18`), `PANTAU JAUH` (`> $18`), guard SL ideal `<= $7.5`, serta pelabelan jujur TP1 `Proyeksi R:R (Non-Struktural)` vs `DOL Struktural`.
- **NY Midnight Open, Asia High/Low & ADR 5 Hari Tanpa Extra Kredit:** Fallback `M1 → M5 → M15` pada `keyLevels()` dan perluasan `outputsize` H1 (168 bar) / M15 (160) / M5 (160) + eksposur `chartCandles.H1` membuat seluruh level kunci intraday dan ADR 5 hari aktif live dengan tetap 3 panggilan API TwelveData.
- **Live Tick Sync & Single Session Pill:** Broadcast SSE real-time dari `app.js` ke seluruh panel Mapping (Chart Gold, Hero Price, Dealing Range %, Breakout delta identik setiap tick), perbaikan urutan `PDL–PDH` (`Low – High`), serta penyatuan kamus sesi Gold backend ↔ frontend (termasuk weekend & rollover harian 17:00–18:00 NY) dengan 14/14 unit tests (`tests/mapping-accuracy.test.mjs`) dan verifikasi browser Desktop `1440×900` + Mobile `360×820`.
- **Dual-Layer Scalper POI (M5 Refinement + M15 Terbaru):** Memilih POI scalping terdekat yang realistis (`<= $12`, label eksplisit `M5`/`M15`) sambil menampilkan **Zona Cadangan** di tabel rincian & banner, menyelaraskan `activeLeg` hanya ke arah SSOT M15, serta memperbaiki bug OB *zero-height* pada candle *marubozu*.

## 2026-11-20 — Kalibrasi Layar HP 1080×2460 (`360×820` CSS @ DPR 3) Lintas 4 Modul Inti + Beranda & Amy Panel
- **Mapping Cockpit & Kalkulator Lot:** Memperbaiki overflow horizontal `+81px` pada input Kalkulator Lot (`repeat(2, minmax(0, 1fr))` + `width: 100%; min-width: 0; box-sizing: border-box`), menaikkan `z-index` modal Kalkulator Lot (`2147483645`) agar bersih di atas tombol melayang `✦ AMY`, merapikan pill status sesi header (`#cockpit-session-pill`), menaikkan tinggi target sentuh `.chart-util-btn` ke `40px` di mobile, serta menambah jarak aman bawah `92px` sambil menjaga 100% paritas Chart Gold (`340px`, `[M15|M5]`).
- **Jurnal Trading (Kalender P/L & Form Catat Trade):** Menghapus `min-width: 54px` pada `.cal-cell` dan memadatkan label (`MGG`, `—`, `trd`) agar 8 kolom **Kalender P/L Bulanan** pas 100% di lebar `360px` tanpa terpotong di tepi kanan; menambahkan `scroll-margin-top: 86px` pada `#journalForm` dan `.journal-date-group` sehingga klik `+ Catat Trade` tidak pernah tertutup sticky header; menaikkan `z-index` `.sheet-dialog[open]` ke `10020`.
- **Amy Assistant Panel, Beranda, Berita (Market Intel) & Academy:** Mengkalibrasi panel `✦ AMY` untuk `<= 440px` (chip prompt wrap 2 baris rapi tanpa terpotong, input bar lega dengan tombol kompak `32px`), memperkecil padding FAB `✦ AMY` di layar sempit, menghapus `user-scalable=no` pada viewport Market Intel, serta menambah ruang aman bawah di Beranda (`136px`), Market Intel (`96px`), dan Academy (`96px`) agar kartu terbawah tidak tertutup navigasi maupun tombol `✦ AMY`.

## 2026-11-20 — Rombak Total Amy FX Academy: Kurikulum Zero to Scalper ICT XAU/USD (6 Level · 30 Pelajaran)
- **Kurikulum Bersih 6 Level / 30 Pelajaran Inti (WITA):** Menggantikan total 36 file Markdown arsip lama (`apps/academy/modul/`) dengan kurikulum terstruktur nol duplikasi dari Level 01 (Fondasi Nol & Anatomi XAU/USD) hingga Level 06 (Risiko, Psikologi & Protokol 100 Sample), mencakup 4 Model Entry Scalper A+ (Sweep-FVG, Order Block + 50% MT, Inversion FVG, Turtle Soup & SMR), Killzone WITA/Silver Bullet, dan News Lock (-15m/+30m).
- **Mesin Diagram Chart SVG Interaktif & Kuis 90 Soal:** Setiap pelajaran memuat diagram candlestick/ICT SVG interaktif multi-tahap (zero dependensi eksternal, adaptif Dark & Light Mode) serta kuis diagnostik 3 soal dengan penjelasan instan dan penyimpanan progres otomatis (`amy_academy_progress_v2`) + deep-link `?lesson=<id>`.
- **Workspace Belajar Dua Zona & Sinkronisasi Amy Live:** Tata letak Two-Zone (sidebar silabus sticky + panggung baca 780px) dengan drawer mobile, filter level + pencarian live, tombol kontekstual **✦ Tanya Amy Tentang Bab Ini**, serta pembaruan penuh `apps/shared/amy-local-knowledge.js` (30 entri terindeks ke deep-link pelajaran baru).

## 2026-11-20 — Modul Jurnal Diet & Fokus Penuh (Opsi 1)
- **Landing Default & Navigasi 3 Tab:** Modul Jurnal kini langsung membuka **Jurnal Trading** (bukan Library), dengan bottom navigation terfokus 3 kolom penuh (`Jurnal | Performa | Disiplin`) dan drawer ramping (4 tautan + 1 blok `Data & Keamanan` untuk Backup ZIP, Restore, PIN, dan Sinkron Obsidian).
- **Form Catat Trade XAU/USD Cepat & Filter Instan:** Menambahkan bar filter cepat (`Semua | Win | Loss | BE | Terbuka` + pencarian live), input `Arah` (Buy/Sell), `Sesi WITA`, 1 kolom `Nominal P/L ($)` otomatis sinkron `profit`/`loss`, `R:R`, judul otomatis opsional, auto-expand grup tanggal terbaru, serta tombol **Tanya Amy** yang langsung membuka Amy Live.
- **Tab Performa 100% Trading Murni:** Menghapus kartu Library (`Total Materi`, `Progress Belajar`, video/PDF/gambar, duplikat donut, animasi count-up 1,2 detik) serta overlay `background-video.js` & patch `amy-journal-final-fix`; tab `Performa` kini murni menyajikan **Analitik Jurnal Pro & Equity Curve** + **Kalender P/L Bulanan**. Kompatibilitas 100% dengan data IndexedDB/localStorage lama tetap terjaga.

## 2026-11-19 — Analitik Jurnal Pro & Equity Curve Interaktif (Beranda + Jurnal + Amy Live)
- **Single-Source-of-Truth Engine (`apps/shared/journal-analytics-pro.js`):** Kalkulasi Equity Curve & Underwater Drawdown, Profit Factor, Expectancy per Trade, Max Drawdown & Drawdown Aktif, Streak Win/Loss, Performa per Sesi WITA (Asia/London/NY AM/NY PM), Performa per Setup ICT, serta Detektor Kebocoran Profit & Psikologi (Leak Cost).
- **Integrasi Beranda & Modul Jurnal:** Kartu ringkas **Performa Jurnal** (mini Equity Curve, 4 KPI tabular, sorotan eksekusi, deep-link `?view=statistics` & `?action=new`) di bawah Peta Harga Beranda, dan dashboard interaktif penuh dengan filter `7H | 30H | 90H | Semua`, toggle `Nominal $ | R-Multiple`, serta pointer/touch scrubber di Modul Jurnal.
- **Koneksi Penuh Amy Live 2.0:** Tombol **Evaluasi bareng Amy** (`openWithPrompt`), perluasan intent (`equity`, `drawdown`, `profit factor`, `expectancy`, `kebocoran`, `sesi terbaik`), serta sinkronisasi output `get_journal_summary` untuk Chat dan Live Voice.

## 2026-11-19 — Amy Live 2.0 (All-App Trading Brain, Client-Bridge Live Voice & Dark/Light UX)
- **Client-Bridge & Live Voice Dipertahankan:** Tetap menggunakan `/api/gemini-config` + WebSocket langsung browser ke `models/gemini-3.8-live` (Aoede), dilengkapi 10 tool terintegrasi (`get_mapping_structure_details`, `get_market_news_summary`, `get_journal_summary` IndexedDB+Habits, `calculate_gold_lot`, `get_practice_summary`, `switch_chart_timeframe`, dll).
- **100% Fokus Trading XAU/USD & Smart Context Router:** Sinkronisasi Dealing Range (`BREAKDOWN · 0%`, Diskon, EQ, Premium, Breakout) & likuiditas BSL/SSL valid, kalkulator lot XAU/USD instan berbasis `amy_default_balance` & `amy_default_risk`, filter screenshot chart ketat, dan deduplikasi tombol aksi (maks 2 link relevan).
- **UI/UX Dark + Light Mode:** Perbaikan judul `✦ AMY` di Light Mode, header full-bleed + kolom tengah pada Fullscreen Bubble Orb, indikator mengetik animasi, Markdown aman (`**tebal**`, poin, kode) + tombol Salin, serta bar input lega di mobile 390px.

## 2026-09-30 — Pro381 Market Intel Kompas Fundamental Architecture

- **Kompas Fundamental Hub (Primary Priority & Default Tab):**
  - Repositioned Kompas Fundamental (`data-tab="sentiment"`, `panel-sentiment`) as the central hub of Market Intel.
  - Berita and Kalender remain operational as supporting evidence and catalyst schedules.
  - Answers all 8 core institutional questions: Gold bias, horizon, 3 ranked dominant factors with clear reasoning, supporting vs opposing evidence columns, structured scenarios (main, reinforcing, invalidation), catalyst countdown, and mapping technical bridge.
- **Supporting Evidence Drilldown:**
  - One-click evidence links (`openEvidenceNews(id)` and `openEvidenceCalendar()`) connect directly from Kompas claims to timestamped news cards and calendar items.
  - Reading position and expanded card states are preserved across news refreshes.
- **Truthful Multi-State Indicators:**
  - Synchronized state reports `🟢 Live Engine`, `🟡 Cache Lokal`, or `🟠 Cache Usang (>24 Jam)`. Missing data displays `🔴 Kalender Belum Terhubung`.
- **Hardened Client Translation & Security:**
  - Sentence chunking (≤450 chars) for MyMemory API with strict no-truncation caching policy.
  - Strict HTML escaping across all dynamic macro variables.

- **Update 1: Automated Economic Calendar & News Lock Safety Gate:**
  - Integrated Forex Factory / Fair Economy Media free JSON feed (`https://nfs.faireconomy.media/ff_calendar_thisweek.json`).
  - Added `evaluateEconomicCalendar(calendar, nowSeconds)` in `supabase/functions/scalper-engine/market-context.mjs`.
  - Replaced static `UNVERIFIED` news status with dynamic real-time states: `SAFE`, `UPCOMING`, `MEDIUM_ALERT`, and `NEWS_LOCK`.
  - Built-in News Lock gate: If a High-Impact USD news event is within -15m to +30m, `execution.status` is automatically locked to `NOT READY` to protect traders from wide spreads, slippage, and whipsaws.
  - Added warning indicators and badges (`.news-lock`, `.news-warning`, `.news-safe`) in the Gold Mapping Cockpit (`context-panel.js` and `ict-workspace.css`).
  - Edge function `scalper-engine` fetches calendar in parallel with candle loads without adding latency.

- **Update 2: Market Intel Redesign (Option A Execution):**
  - Fully removed redundant legacy Heatmap and Liquidity panels from Market Intel.
  - Focused Market Intel 100% on **Berita (News)** and **Kalender Ekonomi (Economic Calendar)**.
  - Added interactive filtering (`[Semua]`, `[High Impact 🔴]`, `[Medium 🟠]`, `[USD Only 🇺🇸]`).
  - Grouped releases by local day (`📅 Kamis, 24 Sep`) with local clock times (`Asia/Makassar` / WITA).
  - Dynamic countdown badges: `🔴 Sedang Rilis / Volatilitas Tinggi` (imminent pulse), `⏳ Rilis 35m lagi`, `✓ Selesai`.
  - Offline cache fallback (`amy_economic_calendar_v1`) in `localStorage` for zero-latency instant opening.

## 2026-09-24 — Pro360 Trading Buddy notification copy overhaul

- Push notification messages for Gold market context transformed from stiff server-log jargon into lively, trader-friendly copy (Gaya Trading Buddy).
- 3 Distinct Event Alert Categories:
  1. 🔔 *Gold Mendekati Zona [Beli/Jual]!* (Harga masuk radius 1x ATR area M15).
  2. ⚡ *Konfirmasi M5 Muncul! Siap Ditinjau* (Sweep + MSS terpenuhi di M5, mencantumkan level sweep dan invalidasi).
  3. ⚠️ *Hati-hati! M15 Mulai Melawan Arah H1* (Peringatan dini saat M15 berbalik arah melawan H1).
- Updated in `supabase/functions/scalper-engine/market-context.mjs` and Android `AmyFirebaseMessagingService.kt` fallback text.

## 2026-09-24 — Pro359 Gold market context M5 transition and resilient freshness

- Transitioned lower timeframe confirmation from M1 to M5 with 900s (15-minute) freshness TTL in `market-context.mjs`, `context-model.js`, and `scalper-system-push`.
- Resolved persistent empty dashboard issue (`WAIT · data belum siap / KONTEKS BELUM TERSEDIA`) caused by third-party feed 3–5 minute batching delays.
- Maintained backward compatibility by exposing both `.m5` and `.m1` in the context payload.
- Updated Mapping UI cards to `M5 · KONFIRMASI` and structural evidence flow `H1 → M15 → M5`.
- Updated Tanya Amy local assistant to read M5 confirmation.

## 2026-09-20 — Pro351 Replay history controls and focused Mapping

Candle Replay now offers a per-record Hapus action, repairs missing historical TP/SL evidence when its matching pack reaches the outcome candle, and reliably removes mirrored local-storage records. Mapping Analyze presents a compact evidence-first view with secondary details collapsed for mobile.

## 2026-09-20 — Pro350 Replay history

Replay now shows all locally saved replay decisions across packs/timeframes directly below its workspace, with WAIT, waiting-fill, active, TP and SL labels, notes, levels and timestamp/low/high evidence. Chart Analysis records are excluded; original decision identities remain readable.

## 2026-09-20 — Pro349 replay persistence and evidence

Pro349 adds resilient IndexedDB/localStorage trade reconciliation plus auditable SL/TP evidence in local replay history. The evidence records the touched level, closing candle timestamp and low/high range, including an explicit ambiguous-candle marker. No strategy, candle source, or decision geometry changes.

## 2026-09-19 — Pro348 unified application UI

Home, Mapping, Market Intel, Journal, and Academy now share a clearer typographic hierarchy, consistent touch targets/cards, restrained sticky navigation, readable news expansion cues, and single-column small-screen layouts. The polish uses existing semantic theme tokens so System, Light, Dark, and custom colors remain compatible.

## 2026-09-19 — Pro347 custom colors

Profile now provides persisted background, card, text, and accent color controls plus reset. Overrides are applied by the shared theme controller across Home and modules without replacing the existing System, Light, and Dark modes.

## 2026-09-17 — Pro345 preparation
Pro345 branch adds a native HTML × Hapus button inside the selected-drawing chart, touch target >=44px, accessible label and focus return. Shared Replay/Chart Analysis implementation; no menu required.

## 2026-09-17 — Pro344 replay fix
Pro344 /950344 prepared locally: sticky × Tutup button in drawing tools, focus returns to summary; Gesture Chart closes panel. Existing tool selection still auto-closes. Saved drawings preserved by tests.


## 2026-09-17 — Pro343 home chart

Pro343 home price chart: M5/M15, manual/60s visible refresh, local ICT plan levels, source timestamp/WITA, stale/error states and light/dark theme. All four module shortcuts remain. Focused18 tests passed; all130 JavaScript regression files passed (exit0). Visual Android validation remains unobserved.


## Market Intel Client-Side Auto-Translation and Offline Cache
- **Date:** 2026-09-13
- **Status:** ✅ Implemented and tested; bump Pro339
- **Description:** Real-time client-side translation directly in Android WebView/browser, bypassing server IP blocks with local cache persistence.
- **Release:** `2.0.0-pro.339` / `950339`.

## TradingView-style Horizontal Zoom and Drawing Synchronization
- **Date:** 2026-08-17
- **Status:** ✅ Released; eight focused chart tests and all 119 regression files pass; signed `.326` Android CI and endpoint verification pass
- **Description:** Candle spacing supports explicit horizontal pinch/time-axis scaling, blank Select/Edit space preserves chart gestures, and every drawing is reprojected from TIME + PRICE anchors across logical/time/price/size transformations.
- **Release:** Active `2.0.0-pro.326` / `950326` with verified identity, signer continuity, release asset, checksum, and download endpoint.

## Trading Practice Mobile Drawing Interaction Repair
- **Date:** 2026-08-17
- **Status:** ✅ Released; seven focused chart tests and all 119 regression files pass; signed `.325` Android CI and endpoint verification pass
- **Description:** Finished drawings automatically enter Select/Edit, rendered objects and handles expose mobile-sized hit targets, drag changes persist in TIME + PRICE, and annotation entry uses a fixed dialog that cannot be clipped by the chart.
- **Release:** First shipped in `.325`; current active `.326` preserves the mobile drawing repair.

## Trading Practice Advanced Drawings and Continuous Live Chart
- **Date:** 2026-08-17
- **Status:** ✅ Released; 17 focused tests and all 119 regression files pass; signed `.324` Android CI gates and endpoint verification pass
- **Description:** Added selectable/movable chart drawings, active-pack historical→Live continuity, and persistent replay-decision feedback/history retrieval.
- **Release:** Originally released in `.324`; current active `.326` includes both mobile drawing-interaction and scale-synchronization repairs while preserving this continuity contract.

## Academy Trading Practice + ICT Berbasis Backtest
- **Date:** 2026-08-16
- **Status:** ✅ Source implemented and targeted regression-validated; no APK/release/backtest run by request
- **Trading Practice:** Added a real locally bundled candlestick chart, M1–D1 aggregation, zoom/pan/crosshair, persistent drawing tools, CSV/JSON OHLC import, native Twelve Data WebSocket tick aggregation, manual BUY/SELL/WAIT records, local outcome history, and three guided chart exercises.
- **Replay:** Added timestamp-owned candle replay with previous/advance/play/speed controls and pre-aggregation future filtering across timeframe switches.
- **Learning:** Added the separate nine-document `ICT Berbasis Backtest` path from the requested Google Drive source, complete with source provenance, catalog progress, reading resume/history reuse, completion state, and supported Practice CTAs.
- **Academy integration:** Added three track selectors and global Academy navigation while preserving all existing Bagian 1–36 content, quiz behavior, history, and the market-learning bridge.
- **Validation:** JavaScript syntax, diff whitespace, static asset references, and four focused replay/core/trade regressions. No Android build, visual QA campaign, strategy validation, release, or metadata/version change.

## Amy-SMC-D Canonical Mapping Engine
- **Date:** 2026-08-11
- **Status:** ✅ Implemented and 112-file JavaScript regression validated; private signed release workflow verification required
- **Description:** Replaced the Preview directional Mapping path with a native deterministic replay of Amy-SMC-D baseline blob `d6e6d7c979dd5a852bddd9661bef0480caa2eb35`, covering descriptive/context fields, fresh structure evidence, and all named predictive event fields.
- **Dealing Range:** M5/M15 preserve structural ranges with pure-location 70/30 and 60/40 boundaries. H1 uses previous 240 closed H1 bars with 55/45 boundaries. All are descriptive-only and cannot alter predictors or Final Bias.
- **Data flow:** REST closed candles are validated, ordered, deduplicated, and replayed sequentially without future data, interpolation, or synthetic gap candles. The last valid closed result survives provider staleness. Native Twelve Data WebSocket ticks remain display-only.
- **UI/Consumers:** Dashboard is reduced to Final Bias, Next Move, and Dealing Range; Analyze separates context, fresh evidence, and predictive events. Rencana Eksekusi, Entry Watch, Scalper, scanner, lifecycle, and notifications consume the canonical snapshot without directional authority.
- **Validation:** Added deterministic fixtures for required SHA/contract, rejected forming/synthetic candles, unfilled gaps, live-price independence, H1 previous-240 exclusion, M5/M15 structural sources, DR dependency isolation, and qualified BOS `N=0`. Full suite passes 112/112 files.
- **Release:** Candidate `2.0.0-preview.316` / `940316`; private manifest activation remains post-signed-APK verification.

## Professional Glassmorphism Full UI Redesign
- **Date:** 2026-08-02
- **Status:** ✅ Implemented and regression/viewport validated; signed release activation pending
- **Description:** Reworked Beranda, Mapping, Berita, Jurnal Trading, Tutorial Trading, nested Academy pages, loading, update dialog, and Amy Mentor surfaces around a shared navy/graphite glass system with ice-blue accents and responsive vector UI.
- **Themes:** Added persistent System, Terang, and Gelap modes plus native Android status/navigation bar synchronization.
- **Truthful UI:** Beranda now exposes exactly five existing modules, Koleksi only renders actual stored items, and Profil removes fabricated VIP/profile claims while showing actual local counts, connectivity, scanner, data source, notification, and version/update state.
- **Compatibility:** Legacy Blueprint runtime contracts remain installed; Mapping engine, scanner, lifecycle, notifications, formulas, market sources, and user data were not refactored.
- **Validation:** Full 95-file JavaScript regression suite, syntax checks, and Chromium mobile viewport checks for dark/light themes, all principal modules, truthful empty states, overflow, and error fallbacks. No backtest was run.
- **Release:** Candidate `2.0.0-preview.299` / `940299`; manifest activation occurs only after the signed APK workflow succeeds.

## Scalper Pattern v3 — BT6/BT6.1 + AMD
- **Date:** 2026-08-01
- **Status:** ✅ Implemented; release/deployment verification required
- **Description:** Added closed-candle Pattern BT6 gates to nine existing Scalper drivers, BT6.1 repair overlays to the four Blueprint drivers, and an independent AMD M30/H1 driver with shortest-window accumulation selection, manipulation invalidation, distribution FVG confirmation, and midpoint-limit entry.
- **Lifecycle:** New schema-v3 setups use volatility-aware 0.18/0.20 ATR buffers, fixed TP1 +10 and TP2 +20 points, no breakeven move, 50-point structural-risk cap, 24-hour timeout, and chronological M1 SL-first evaluation.
- **Operations:** Added immutable config records, per-candidate telemetry, environment kill switches, Preview UI metadata, and deterministic unit/regression coverage.
- **Backtest:** Not rerun. The user-provided Blueprint results were accepted and the Master Backtest workbook was inspected read-only.

## Preview Canonical News Delivery and Native Update Alert
- **Date:** 2026-08-01
- **Status:** ✅ Implemented; release/deployment verification required
- **Description:** Added one Preview-only FCM notification route with canonical event keys, atomic per-device claims, retry/failure states, and a scheduler lease. Legacy server delivery and local fallback no longer target Preview devices.
- **Update UX:** A newer Preview manifest raises the native `Update Amy FX Preview Tersedia` notification and opens the existing signed-APK update dialog.

## Rencana Eksekusi
- **Date:** 2026-07-29
- **Status:** ✅ Implemented and regression/viewport validated
- **Description:** Added a compact Dashboard card and full Analyze card that translate the authoritative Mapping result into BUY/SELL/WAIT, focus, watch/entry area, next gates, locked entry/SL/TP/RR, structural target, invalidation, freshness, and lifecycle status without creating a second decision engine.
- **Authority:** `setupExecution` first, `entryMap.setup` second, then existing authoritative runtime contracts. Causal Entry Watch remains the only lifecycle owner.
- **Amy Bot:** Contextual buttons send the exact card decision and official levels through a secret-free `execution_plan` Context Envelope; Amy uses a deterministic explanation path and cannot change the decision.
- **Validation:** Feature regression matrix, full 87-file JavaScript suite, Mapping Accuracy V3 suite, and Android-size Chromium verification for duplicate cards, order, overflow, errors, navigation, accordion, and scroll stability.

## Causal Entry Watch 2021–2022 Correctness Hardening
- **Date:** 2026-07-29
- **Status:** ✅ Implemented and regression-validated
- **Description:** Preserved terminal lifecycle state across Mapping consumers, made replay session time injectable, separated structural-target diagnostics, enforced forecast-before-sweep-before-MSS ordering, and replaced unpaired Dealing Location anchors with a causal paired structural leg.
- **Validation:** XAU/USD 2021–2022 M5/M15 closed-candle replay, rolling 300 and 800 parity, priority-window audit, and full regression suite.
- **Result:** Dealing Location passes 2/2 M5 and 33/38 M15 displaced-MSS candidates. Final setup remains zero because SESSION is the next cumulative blocker; no threshold was changed.
- **Reference:** `docs/backtests/AMYFX_CAUSAL_ENTRY_WATCH_2021_2022_FINAL_VALIDATION.md`

## Mapping Accuracy V3 — All-Timeframe Causal Entry
- **Date:** 2026-07-28
- **Status:** ✅ Implemented; manual chart validation pending
- **Description:** Rebuilt Mapping around one closed-candle authority, strict structure/liquidity/zone lifecycle, point-in-time HTF and EMA entry gates, a causal entry sequence, and timeframe profiles for M1 through W1. Scanner and Entry Watch consume the same setup contract. H1 bearish remains suppressed; extrapolated profiles are labeled rule-based without probability claims.
- **Reference:** `docs/MAPPING_ACCURACY_V3_MANUAL_VALIDATION.md`
- **Backtest:** Not run by user request.

## Context-Aware Mapping & Deep-Link News
- **Date:** 2026-07-11
- **Status:** ✅ Implemented
- **Description:** Added point-in-time FVG ATR, volatility-scaled liquidity tolerance, displaced-origin OB validation, structurally anchored HTF ranges, context-only standalone structure events, plain-language Mapping explanation, newest-first News ordering, and exact notification-to-news deep links.
- **Backtest:** 117 filled M15 trades, 70.09% TP1 hit rate, +14.76R after $0.30 assumed cost, profit factor 1.34, maximum drawdown 6.34R.

## M15 Precision Mode
- **Date:** 2026-07-11
- **Status:** ✅ Implemented
- **Description:** Restricted actionable setups to M15, added 1R TP1 protection with 90% secure and 10% break-even runner toward TP2 ≥2R, synchronized live lifecycle states, and blocked raw non-M15 scanner targets.
- **Backtest:** Superseded by the stricter Context-Aware Mapping revalidation above.

## Mapping Logic Production Hardening
- **Date:** 2026-07-11
- **Status:** ✅ Implemented
- **Description:** Added historical liquidity sweep tracking, point-in-time ATR, strict sweep reclaim validation, minimum 1:2 RR rejection, structure-aware HTF narrative, active Silver Bullet routing, and seven JavaScript regression tests against the production engine.

## Institutional Market Intelligence Upgrade
- **Date:** 2026-07-11
- **Status:** ✅ Implemented
- **Description:** Added a shared Market Command Strip, deterministic Intel Briefing, distance-weighted Liquidity Magnetic Spine, Mapping Setup Lifecycle Rail, background-aware Market Intel refresh, request cancellation, and targeted live-price rendering for Android WebView performance.
- **Scope:** Additive UI/shared modules only. Heatmap computation, liquidity endpoint logic, ICT rules engine, and native scanner ownership remain unchanged.

## Admin Academy Link Fix
- **Date:** 2026-07-10
- **Status:** ✅ Implemented
- **Files:**
  - `app/src/main/assets/apps/academy/index.html`
- **Description:** Fixed WebView navigation to admin panel by using explicit `admin/index.html` path.

## News Translation to Indonesian
- **Date:** 2026-07-10
- **Status:** ✅ Implemented
- **Files:**
  - `api/news.js` — added `translateToId()` function
- **Description:** News from Telegram automatically translated to Bahasa Indonesia using Google Translate free API. Original text preserved in `textOriginal` field. Falls back to original text if translation fails.

## News Expand In-App (No Telegram Redirect)
- **Date:** 2026-07-10
- **Status:** ✅ Implemented
- **Files:**
  - `apps/market-intel/app.js` — changed `onclick` from `openLink()` to `classList.toggle('expanded')`
  - `apps/market-intel/styles.css` — added expand/collapse CSS
- **Description:** News items now expand/collapse text in-app instead of redirecting to Telegram. Source shown as label `Sumber: SM_News_24h`.

## Liquidity Tracker Tab
- **Date:** 2026-07-10
- **Status:** ✅ Implemented
- **Files:**
  - `api/liquidity.js` — new serverless endpoint (independent from heatmap)
  - `apps/market-intel/index.html` — added Liquidity tab button and panel
  - `apps/market-intel/app.js` — added `loadLiquidity()`, `renderLiquidity()`, tab handler, auto-refresh
  - `apps/market-intel/styles.css` — added `.liquidity-list`, `.liq-card`, `.liq-badge`, `.liq-price`, `.liq-meta`
- **Description:** New tab in Market Intel showing BSL/SSL swing levels that haven't been swept, sorted by distance from current price. Limited to 15 nearest levels.

## Liquidity API Endpoint
- **Date:** 2026-07-10
- **Status:** ✅ Implemented
- **Files:**
  - `api/liquidity.js`
- **Description:** Independent Vercel serverless function. Copies `fetchCandles()` and swing detection from heatmap.js. Detects BSL (swing highs) and SSL (swing lows), tracks sweep status, returns 15 nearest unswept levels.


## 2026-09-05 — Pro328

Pro328 source: Discipline Scalper (13 total registered methods including existing ERR/SMR); persisted method switches in Mapping history/performance; scoped backend preferences, setups and push; Academy track03 manual plan workspace, drawing style/drag improvements and 15 guided exercises. Upload/parser, replay candle progression and tracks01/02 preserved. Files span scalper engine/APIs, additive device identity, Mapping views, Academy trading-practice, migration and build version/workflow.

Pro328 released: signed APK and update manifest 950328 verified, GitHub Actions run 33976208755 passed the full JavaScript suite, Android tests/lint/build, signature continuity and downloaded checksum. Supabase migration 20260905154829 applied; preferences v1, device-register v4, setups v8, scoped push v6 and engine v11 deployed. Engine health returned HTTP200 with 13 drivers; preferences without a device capability returned HTTP401. APK SHA-256: ceed5e4408e5aabfd0387f2d1d977dcee6aa983bd5915bca24956f7458bbfd08.


## 2026-09-06 — Pro329

Pro329 source prepared: replay repeat mode, two-tap/drag drawing, direct object selection, eight rectangle resize handles, projections, object list, duplicate/delete/color controls, fullscreen including Android WebView CSS fallback. Source version 2.0.0-pro.329 / 950329. Supabase news-sync v11 deployed from public Telegram text; no manual invocation/post-deployment verification. GitHub connection is unavailable in this session, so commit publishing and APK329 release remain pending. Existing update.json remains328.


## 2026-09-09 — Pro332

Pro332 source: compact Replay heading, persistent fullscreen exit, object popover, data/help disclosures, concise copy, shared flat surfaces/spacing/typography for Home, Mapping, Market Intel, Journal and Academy, and collapsible Academy course summaries. Trading calculations, candle sources, history and notification ownership are unchanged.


Pro332 release completed: GitHub Actions run 34301702033 succeeded, including JavaScript regression, Android unit/lint/build, signing identity and published endpoint verification. Active public update.json is 2.0.0-pro.332 / 950332, enabled=true. Published APK SHA-256 62bd08b231bef85e768af95b50540ecfe3e0d6b3e71a77dbc670da18f4e297f1 matches the release asset digest. Earlier build/activation pending status is resolved. Actual device notification and WebView visual checks remain unobserved.



## 2026-09-09 — Pro335 replay navigation

Pro335 adds explicit Geser, return-to-cursor/follow, auto/manual price scale, redo (Ctrl/Cmd+Shift+Z), and Ctrl/Cmd+Z undo. Replay defaults to one-shot drawings with repeat still available. Existing drawing tools and fullscreen remain. This improves TradingView-style interactions; full TradingView feature parity is not claimed.


Pro335 release completed: commit 9d57a417d15b7774d04b26ec680a164240f35494, signed release workflow 34371918736 and lint workflow 34371918728 both succeeded. Active update.json is enabled at 2.0.0-pro.335 / 950335. APK asset digest matches manifest SHA-256 6c5815bf444b08e826032e8acdd3c8bbcf548098d06e069262627192caa4f49c. Release notes now describe replay navigation changes. No trading backtest was run. Actual Android gestures and receipt of the native update notification remain unobserved.

## 2026-09-12 — Pro337 ICT workspace

New Mapping engine, provider adapter and responsive chart workspace: H1 structure,
M5/M15 entry, evidence timestamps, pending/active distinction, locked entry/SL/target,
WAIT diagnostics and explicitly gross windowed simulation history. 125 JavaScript
regression files pass; source version337 prepared for existing signed release pipeline.
Profitability remains unverified; no backtest result is claimed.


## 2026-09-13 — Pro338 Academy

Pro338: 60 guided exercises across mudah/sedang/advanced, random choices and unseen-first sessions of 10/20/all, matching illustrative candle charts, session score and grouped mistakes with exact Jalur 01 lesson links; persisted last summary. Jalur 02 removed from panel/navigation. Existing Replay and Chart Analysis data providers preserved.


## 2026-09-13 — Pro340 local application assistant

Pro340 adds four-menu navigation and a local, deterministic application assistant: multi-module questions, short topic follow-ups, cached news search, journal totals/outcomes/recent evaluations, reading and guided progress, source-linked Academy passage lookup. It does not implement unrestricted natural-language understanding, live tick fetching, external AI, or order execution. All 127 JS regression files passed at source preparation; 13 dedicated assistant cases cover empty/stale data, analytics, retrieval and integration. Browser preview was blocked by ERR_BLOCKED_BY_CLIENT; real Android UI unobserved. Signed release pending at source preparation.


Pro340 release completed: source commit efa8c80406d57cc8c40b08ed6755d9ce3dac589e; signed workflow 34750969449 and lint workflow 34750969447 succeeded. All 127 JavaScript regression files and 14 dedicated assistant cases pass. Android unit tests, lint, APK identity/signer and published endpoint gates passed. Active update.json is enabled at 2.0.0-pro.340 / 950340. APK asset digest matches manifest SHA-256 3af71bbe25893f15411d380cc77938b5fd33f0f477f0a32a4df536d173f3f0b8. Earlier signed-release/manifest pending notes for Pro340 are resolved. Actual Android layout and receipt of native update notification remain unobserved; browser preview was blocked.


## 2026-09-13 — Pro341

- Brighter blue/violet frosted panels across Home, Mapping, News, Journal and Academy, preserving theme choice and data.
- ICT liquidity ladder with exact zone ranges, BSL/SSL side filters, source timeframe/time, distance from the Mapping candle close, relative swing counts, and expandable confirmation times. Hero, ladder and liquidity list refresh together; failures retain explicitly stale references.
- Source341 prepared for the existing signed APK pipeline. Signed release and on-device appearance not yet verified at this checkpoint.


Pro341 release verified: PR #3 merged as 89f147daa947632da15a21da5bd5b7ee5e8a297f. Signed release workflow34788293012 and main lint34788292968 succeeded. All128 JS files, Android tests/lint/build, existing signer continuity and published endpoint gates passed. Active update.json is enabled at 2.0.0-pro.341 /950341; APK digest matches manifest SHA-256 8f59f72ecb22ed384c5c390ea20e9a1927cd3e17ad9910b9ee6b4fde80d7943c. Earlier Pro341 publication-pending notes are resolved. Browser/device appearance and native notification receipt remain unobserved. Internal validation was aligned from Node20 to the repository-required Node22 after its old runtime failed to import stripTypeScriptTypes. Legacy Learning Preview and1.5.8 PR checks lacked their old signing cache; Pro release used its existing signer and passed verification.


## 2026-09-14 — Pro342 Mapping restoration

Pro342 Mapping: BUY/SELL filter, entry/SL/TP1/TP2 and zones from Supabase, explicit lifecycle and source age, selected setup chart overlay, 24-hour server history and existing full archive/method controls. All129 JavaScript regression files passed; five dedicated restore tests cover geometry, stale/terminal state, authoritative removal, device headers and provider failure. Browser preview blocked by ERR_BLOCKED_BY_CLIENT. Signed release pending.

## 2026-09-24 — Pro357 prepared on review branch

The Gold context workspace presents H1 bias and health, M15 control and POI lifecycle, M1 evidence, primary/alternative manual scenarios with numeric invalidation, liquidity levels, session/ATR context, narrative, and execution readiness. Supabase source functions generate context snapshots and context-only FCM events; archived setups remain accessible without issuing new active setups. Assistant and Market Intel no longer build a live plan from the retired local signal generator. Production deployment and signed APK release are pending approval; local JavaScript regression suite passed 137/137.


## 2026-09-30 — Pro375 AMY ICT complete Mapping

Implemented shared closed-candle Dashboard V2 (bias, locked invalidation, range/EQ, liquidity sweep, DOL, POI lifecycle), dual entry scores/near-invalid penalty, 16-row including header bias dashboard, score panel, narration and Strong/Ready markers. Added ICT reference MSS/BOS, displacement, OB/breakers/polarity, FVG/Implied FVG/BPR/VI, liquidity boxes, NWOG/NDOG, eight-level Fibonacci, D/W/M pivots, exact NY midnight and Asia range plus DST-aware killzones. Forty-six persisted display controls; chart candles now come from the same backend analysis snapshot. Local 140-file regression and 29 dedicated cases pass; Chromium mobile dark/light/all-controls/offline checks pass without page errors or overflow. See docs/mapping/AMY_ICT_PRO375.md for causal corrections and provider-period semantics.

## 2026-09-30 — Pro376 final integration guard

Completes the Pro375 integration with explicit opposing-score narration and current closed-M5 execution geometry. Source376 is a new APK identity because signed375 had already activated; do not replace a published APK at the same versionCode.


Pro376 final verification completed: signed Actions36696811345 and lint36696811141 succeeded. Active public update.json is enabled at2.0.0-pro.376/950376. Downloaded32,666,230-byte APK SHA-256 matches f1b861ca698ccd608b8fb88510e57adecc1acdc233a672459d5062ffd1580712, packaged app-version is376 and packaged amy-ict.js is byte-identical to the backend module. Final local140-file regression (30 dedicated AMY cases) and Chromium mobile dark/light/all-controls/offline checks pass, including a real server snapshot. scalper-engine v24 runs on scheduled cron, fresh COMPLETED snapshots expose amy-ict-complete-pro376; primary targets reject opposing/reached/wrong-side DOL. The last fix changes only backend serialization/tests/docs, not APK assets; [skip ci] prevents rebuilding/replacing the already verified APK at the same code. Real-device notification receipt and broker-matched TradingView comparison remain unobserved. Earlier Pro375/376 deployment/build-pending entries are resolved.


## 2026-09-30 — Pro377 Mapping ringkas

User authorized a presentation-only simplification and version bump. Main Mapping shows market state, manual readiness/news, primary POI/CE/invalidation/target and chart. Full bias, narration, evidence, liquidity, conditions, alternatives and six reference models stay accessible in closed Detail accordions; opened driver/scenario details survive refresh. All46 display controls remain in four groups, stored preferences are preserved. Chart narration prioritizes risk warnings in two lines; repeated structural labels and overlapping text are suppressed without removing drawings or numerical logic. Canonical engine, backend, scoring, risk gates and notification policies are unchanged. Source2.0.0-pro.377/950377; signed CI owns manifest activation after publication. Local141 regression files and Chromium360/390 dark/light/menu/offline smoke passed; release verification pending.


Pro377 release verification completed: source dc1ff82e9f6bd0571bac754484654141212ebafc; signed Actions36701710390 and lint36701710388 succeeded. Public update.json is enabled at2.0.0-pro.377/950377. Downloaded32,667,949-byte APK SHA-2561998d6efe381114b230d393db90f0a675dc2b7b6263f10f12775941796e7ed76 matches manifest/checksum; all changed Mapping assets match APK and shared trading engine remains byte-identical to backend. Final141 regression files and Chromium360/390 dark/light/settings/driver-refresh/news-lock/offline smoke passed. Earlier Pro377 publication-pending note is resolved. Real Android update-notification receipt remains unobserved.


## 2026-09-30 — Pro378 Chart Gold fullscreen

Chart Gold gains Fullscreen/Keluar, adaptive portrait/landscape layout, 16px price-axis and14px ICT/narration text. Close button, Back and Escape restore Mapping. Underlying menus/assistant are hidden while fullscreen, and46 display preferences remain unchanged.

Local verification: all141 regression files passed; Chromium360/390 portrait and844×390 landscape verified viewport fill,16px axis/14px overlay, one-finger pan, two-finger pinch, wheel zoom, preserved zoom/scroll, Back/Escape/native-request rejection, refresh/theme and offline clearing without errors or overflow. These are browser checks; actual Android device behavior remains unobserved.


Pro378 release verification completed: source7d9b2d608e4fe6dbb6addb7063dd039401282beb, signed Actions36704449764 and lint36704449726 succeeded. Public update.json enabled at2.0.0-pro.378/950378. Downloaded32,670,025-byte APK SHA-256516d95d6fd9bcfec15985dc6b8cc354e51480265d8ab0689936dce1947ce91bf matches manifest/checksum; all fullscreen assets match source and canonical trading engine remains byte-identical to backend. Final141 regression files and Chromium portrait/landscape360/390/844px, pinch/pan/zoom/scroll/Back/Escape/fallback/theme/refresh/offline checks passed. Earlier Pro378 release-pending note resolved. Actual Android device behavior and update notification receipt remain unobserved.


## 2026-09-30 — Pro379 TradingView axis gestures

Chart Gold supports drag right price axis for vertical scale, drag bottom time axis for candle width, native double-tap reset and Auto harga button. Gesture-driven canvas reprojection keeps ICT/AMY geometry aligned and dynamic axis widths protect plot bounds. Display preferences and fullscreen are preserved.

Local Pro379 verification: all142 regression files passed. Chromium touch price/time-axis scaling, overlay alignment, double-tap/Auto harga reset and refresh-preserved manual viewport passed; existing fullscreen, theme, Back/Escape, pinch/pan and offline checks passed without errors or overflow. Official Lightweight Charts v4.2.3 references and root cause are recorded in docs/mapping/CHART_GESTURES_PRO379.md.


Pro379 release verification completed: source6b6d447ead4e60b1f12957e42f0c20f543241af7, signed Actions36707758513 and lint36707758575 succeeded. Public update.json enabled at2.0.0-pro.379/950379. Downloaded32,670,665-byte APK SHA-256ff37cbe0180131239ae56fa46bb9b1b07c28a62f323e79d295922b91d80136ae matches public manifest/checksum; eight affected/fullscreen assets match source and canonical trading engine remains byte-identical to backend. All142 regression files and Chromium touch price/time-axis scaling, double-tap/Auto harga reset, overlay alignment, refresh-preserved viewport and existing fullscreen/pinch/pan/Back/Escape/theme/offline checks passed. Earlier Pro379 release-pending notes resolved. Actual Android device gestures and update notification receipt remain unobserved.
 
 
## 2026-09-30 — Pro380 Academy Curriculum Restructure
 
Restructured Amy FX Academy from 665 fragmented HTML files down to 56 files (91% reduction in fragmentation). Implemented university-style 3 Semester structure with 36 Pertemuan (~1 Jam / SKS per Pertemuan). 569 sub-chapters consolidated into 36 master modules with chapter badges, desktop sticky sidebar TOC with scroll-spy highlight, mobile expandable drawer TOC, quiz container, and smooth next/prev navigation. Cleaned duplicates and stubs, synchronized 36-entry registry, and audited 1,360 links with zero broken links.


## 2026-09-30 — Pro382 six-driver evaluation

Pro382 / 950382: six-drivers.mjs, six-driver-lifecycle.mjs; backend persistence + telemetry; enam toggle; setup/level chart/riwayat; BE Adaptive, conditional early cut Rapid, risk policy Shield. Tambah migration constraint enam model dan regression/replay tools. Validasi dan publikasi dicatat setelah selesai.


Pro382 release verification completed: source 11239e1de1b42d6677cbd074619c636507d762ab; signed Actions36792997261 and lint36792997230 succeeded. Public update.json enabled at2.0.0-pro.382/950382. Downloaded31,534,089-byte APK SHA25634f42b0f0e34995e7df9ff0a425e3e68b74ec59acfa531f08f0ea007d4b32b3f matches manifest/checksum; all11 changed assets match source.146 regression files pass. Production engine25/setup-reader11/preferences2 active; five engine files byte-identical to source and successful live run returns all6 driver evaluations. Browser360/390 light/dark, toggles, detail refresh, selected chart, offline and overflow checks pass. Replay240 M5 with synthetic calendar produced one Rapid candidate; not a profitability backtest. Earlier build/deployment-pending notes are resolved. Actual Android update receipt remains unobserved.
