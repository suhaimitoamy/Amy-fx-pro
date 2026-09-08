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
