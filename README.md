# Amy FX Pro

Amy FX Pro adalah jalur utama aplikasi **Amy FX Pro** dengan engine dan runtime yang dikembangkan secara berkelanjutan.

## Current Version

> **Latest update:** `Amy FX Pro v329 (source)`  
> **Update date:** 5 September 2026

## Status Utama

`main` adalah branch produksi utama Amy FX Pro.

Versi terbaru membawa update runtime dan validasi terbaru dari jalur Pro. Engine tetap mempertahankan prinsip:

- canonical Mapping sebagai sumber utama data struktur;
- pemrosesan candle tertutup secara sequential;
- tidak menggunakan future candle, interpolation, atau synthetic candle;
- consumer seperti scanner, Entry Watch, lifecycle, dan notifikasi membaca canonical state;
- live market feed bersifat display/update data dan tidak mengubah historical Mapping secara sepihak.

## Identitas Amy FX Pro

| Properti | Nilai |
|---|---|
| Nama aplikasi | `Amy FX Pro` |
| Branch utama | `main` |
| Current version | `v329` (source) |
| Update channel | `Amy-fx-pro/main/update.json` |

## Update dan Release

Perubahan terbaru dicatat melalui commit repository. Release dan validasi mengikuti workflow yang tersedia pada repository ini.

## Disclaimer

Amy FX Pro adalah alat bantu analisis dan pembelajaran. Aplikasi tidak menjamin profit. Validasi statistik tetap harus memisahkan in-sample, out-of-sample, walk-forward, dan forward test.

## Perubahan sumber 328 (rilis sebelumnya)

- Discipline Scalper: bias H4 EMA20, PDH/PDL dan Asia liquidity, sweep/break, retest entry, SL 0.18 ATR dan target liquidity.
- Toggle metode per perangkat, termasuk konfigurasi server, isolasi hasil dan notifikasi. Setting tidak mengubah perangkat lain; riwayat tetap tersedia.
- Trading Practice Jalur 03: workspace rencana analisis, style drawing per objek, dan 15 latihan dalam lima kategori. Import candle dan replay tetap memakai alur existing.
- Versi sumber: `2.0.0-pro.328` / `950328`. APK bertanda tangan telah diterbitkan dan `update.json` aktif menunjuk versi 328. Build, identitas aplikasi, signer, dan checksum unduhan telah lolos verifikasi.

## Kontinuitas aplikasi

Amy FX Pro mempertahankan garis pengembangan Amy FX Preview dari `personal/amyfx-private`, termasuk basis canonical Mapping pada `2.0.0-pro.316`. Package Android `com.amyelitesuite.learningpreview` dipertahankan agar data dan jalur upgrade kompatibel. Jalur rilis Pro saat ini adalah `main` dan `Amy-fx-pro/main/update.json`.

## Perubahan sumber 329

Candle Replay: gambar berulang tanpa batas jumlah objek dalam kode, seleksi langsung, delapan pegangan kotak, panah yang dapat diperpanjang ke ruang kosong, daftar objek, duplikasi, dan fullscreen. Future candle tetap dipotong oleh replay engine. News: gagal terjemah tidak lagi dianggap sebagai teks Indonesia; sinkronisasi mencoba lagi berita lama.

Sumber `2.0.0-pro.329` / `950329` disiapkan. Belum diterbitkan: koneksi GitHub perlu diaktifkan kembali. Tidak ada tes, backtest, atau verifikasi tambahan sesuai permintaan pengguna. Workflow329 melewati tahap tersebut dan hanya build/publish. Update manifest tetap menunjuk328 sampai APK329 benar-benar dipublikasikan.
