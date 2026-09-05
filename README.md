# Amy FX Pro

Amy FX Pro adalah jalur utama aplikasi **Amy FX Pro** dengan engine dan runtime yang dikembangkan secara berkelanjutan.

## Current Version

> **Latest update:** `Amy FX Pro v327`  
> **Latest commit:** `2b5e231`  
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
| Current version | `v327` |
| Update channel | `Amy-fx-pro/main/update.json` |

## Update dan Release

Perubahan terbaru dicatat melalui commit repository. Release dan validasi mengikuti workflow yang tersedia pada repository ini.

## Disclaimer

Amy FX Pro adalah alat bantu analisis dan pembelajaran. Aplikasi tidak menjamin profit. Validasi statistik tetap harus memisahkan in-sample, out-of-sample, walk-forward, dan forward test.
