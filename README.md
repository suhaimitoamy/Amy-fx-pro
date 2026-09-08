# Amy FX Pro

## Identitas dan kontinuitas

Amy FX Pro berasal dari Amy FX Preview di branch `personal/amyfx-private`; baseline Pro awal `2.0.0-pro.316`. Package `com.amyelitesuite.learningpreview` dan signer dipertahankan untuk pembaruan tanpa uninstall. Kanal aktif tetap `Amy-fx-pro/main/update.json`. Kandidat Pro331 memperbaiki build resource Indonesia dan menyinkronkan identitas updater. Aktivasi manifest menunggu APK signed lolos CI.


Amy FX Pro adalah jalur utama aplikasi **Amy FX Pro** dengan engine dan runtime yang dikembangkan secara berkelanjutan.

## Current Version

> **Latest update:** `Amy FX Pro v331 (source)`
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
| Current version | `v331` (source) |
| Update channel | `Amy-fx-pro/main/update.json` |

## Perubahan sumber 331

Candle Replay: gambar berulang tanpa batas jumlah objek dalam kode, seleksi langsung, delapan pegangan kotak, panah yang dapat diperpanjang ke ruang kosong, daftar objek, duplikasi, dan fullscreen. Future candle tetap dipotong oleh replay engine. News: gagal terjemah tidak lagi dianggap sebagai teks Indonesia; sinkronisasi mencoba lagi berita lama.

Sumber `2.0.0-pro.331` / `950331` menunggu build signed CI. Update manifest tetap menunjuk versi terakhir yang benar-benar terbit sampai APK331 berhasil dipublikasikan.
