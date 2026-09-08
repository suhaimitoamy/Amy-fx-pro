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

## Perubahan sumber 329

Candle Replay: gambar berulang tanpa batas jumlah objek dalam kode, seleksi langsung, delapan pegangan kotak, panah yang dapat diperpanjang ke ruang kosong, daftar objek, duplikasi, dan fullscreen. Future candle tetap dipotong oleh replay engine. News: gagal terjemah tidak lagi dianggap sebagai teks Indonesia; sinkronisasi mencoba lagi berita lama.

Sumber `2.0.0-pro.329` / `950329` disiapkan. Belum diterbitkan: koneksi GitHub perlu diaktifkan kembali. Tidak ada tes, backtest, atau verifikasi tambahan sesuai permintaan pengguna. Workflow329 melewati tahap tersebut dan hanya build/publish. Update manifest tetap menunjuk328 sampai APK329 benar-benar dipublikasikan.
