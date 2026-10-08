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

## Fast Dev Mode & Larangan Full npm test Otomatis (Pro 404)

1. **Dilarang Menjalankan Full npm test (148 Suites) Secara Rutin:**
   - Menjalankan 148 suite tes penuh setiap kali edit kecil memakan waktu 45-60 detik dan membuang puluhan ribu token konteks.
   - **Full `npm test` HANYA dijalankan jika pengguna secara eksplisit meminta** (misal: *"jalankan test"* atau sebelum rilis APK).
2. **Standar Pengujian Cepat (Fast Dev Verification):**
   - **Syntax check instan (0.05s):** `node --check <file-yang-diedit>`
   - **Targeted test (0.2s):** Jalankan hanya 1 file tes yang relevan secara spesifik jika diperlukan (contoh: `node --test tests/mapping-chart-axis-pro379.test.mjs`), bukan 148 file.
   - **Visual verification:** Validasi langsung lewat server preview browser `http://localhost:8080/`.

## Cockpit Mapping UI & Presentation (Pro 405)

1. **Kartu 1 (Amy Live Assistant):** Menampilkan sinyal Entry Assistant V3 (`BUY ENTRY`, `SELL ENTRY`, `PULLBACK SELL`, `PULLBACK BUY`, atau `STANDBY`), status Anti-Chase (`READY DI ZONA` vs `MISSED - JANGAN KEJAR`), dan Math Zone yang aktif.
2. **Kartu 2 (Chart Gold):** 100% paritas Peta Harga, visual garis Entry Assistant V3 (Entry cyan, SL merah, TP1 kuning, TP2 hijau).
3. **Kartu 3 (AMY BIAS DASHBOARD V2):** Tabel Matriks 16 Baris (1 header + 15 data baris) persis tabel Pine Script.
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


