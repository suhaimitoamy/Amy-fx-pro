# Amy FX Pro

## Identitas dan kontinuitas

Amy FX Pro merupakan jalur utama pengembangan aplikasi trading **Amy FX Pro** dengan engine dan runtime yang dikembangkan secara berkelanjutan.

Baseline awal Pro berasal dari `Amy FX Preview` pada branch `personal/amyfx-private` dengan versi `2.0.0-pro.316`. Identitas aplikasi, package `com.amyelitesuite.learningpreview`, dan signer dipertahankan untuk mendukung pembaruan tanpa uninstall.

Kanal pembaruan:

```
Amy-fx-pro/main/update.json
```

## Current Version

> **Latest source:** `Amy FX Pro v331`
> **Source update:** 5 September 2026
> **Branch:** `main`

## Production Status

Branch `main` merupakan jalur produksi utama Amy FX Pro.

Versi terbaru mempertahankan arsitektur inti:

- Canonical Mapping sebagai sumber utama struktur market.
- Pemrosesan candle tertutup secara sequential.
- Tidak menggunakan future candle, interpolation, atau synthetic candle.
- Scanner, Entry Watch, lifecycle, dan notifikasi membaca canonical state.
- Live market feed hanya melakukan update tampilan/data realtime dan tidak mengubah historical Mapping secara sepihak.

## Feature Update v331

### Candle Replay

- Unlimited drawing object.
- Seleksi objek langsung.
- Delapan pegangan resize untuk objek box.
- Arrow dapat diperpanjang ke area kosong.
- Object list dan duplikasi objek.
- Fullscreen replay mode.
- Future candle tetap dibatasi oleh replay engine.

### News Engine

- Perbaikan validasi bahasa hasil terjemahan.
- Teks gagal diterjemahkan tidak lagi dipaksa dianggap sebagai Bahasa Indonesia.
- Sinkronisasi ulang berita lama tersedia untuk menjaga konsistensi data.

## Technical Identity

| Properti | Nilai |
|---|---|
| Nama aplikasi | Amy FX Pro |
| Branch utama | main |
| Current version | v331 |
| Update channel | Amy-fx-pro/main/update.json |
| Package continuity | com.amyelitesuite.learningpreview |

## Build Status

Source `2.0.0-pro.331` / `950331` merupakan source release terbaru.

Manifest update tetap mengarah ke versi yang benar-benar terbit sampai APK signed berhasil dipublikasikan melalui CI.

## Development Principle

Amy FX Pro dikembangkan dengan prinsip:

- Data market harus deterministic.
- Historical structure tidak boleh berubah karena data masa depan.
- Semua engine consumer harus membaca sumber canonical yang sama.
- Setiap fitur baru wajib menjaga kompatibilitas runtime dan kontinuitas aplikasi.
