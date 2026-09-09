# Amy FX Pro

## Identitas dan kontinuitas

Amy FX Pro merupakan aplikasi trading workspace dengan engine market analysis, Mapping, replay, scanner, dan runtime yang dikembangkan secara berkelanjutan.

Baseline awal Pro berasal dari `Amy FX Preview` pada branch `personal/amyfx-private` dengan versi `2.0.0-pro.316`. Identitas aplikasi, package `com.amyelitesuite.learningpreview`, dan signer dipertahankan untuk mendukung pembaruan tanpa uninstall.

Kanal pembaruan:

```
Amy-fx-pro/main/update.json
```

## Current Version

> **Latest application build:** `Amy FX Pro v2.0.0 build 332`
> **Source branch:** `main`
> **Status:** Production development build

## Production Status

Branch `main` merupakan jalur utama pengembangan Amy FX Pro.

Arsitektur inti:

- Canonical Mapping sebagai sumber utama struktur market.
- Pemrosesan candle tertutup secara sequential.
- Tidak menggunakan future candle, interpolation, atau synthetic candle.
- Scanner, Entry Watch, lifecycle, dan notifikasi membaca canonical state.
- Live market feed hanya memperbarui data realtime tanpa mengubah historical Mapping secara sepihak.

## Feature Status Build 332

### Market Workspace

- Workspace utama Amy FX Pro.
- Sistem profil dan pengaturan aplikasi.
- Status koneksi perangkat.
- Scanner Mapping berjalan sebagai service background.

### Data Market API

- Pengelolaan data market melalui backend.
- Integrasi backend menggunakan Vercel dan Supabase.
- API key tidak perlu disimpan manual pada perangkat pengguna.

### Candle Replay Engine

- Drawing object tanpa batas.
- Seleksi objek langsung.
- Resize handle pada objek chart.
- Arrow dan objek chart dapat diperpanjang.
- Object management dan fullscreen replay.
- Future candle tetap dibatasi oleh replay engine.

### News Engine

- Validasi bahasa hasil terjemahan.
- Penanganan fallback ketika terjemahan gagal.
- Sinkronisasi data berita lama.

## Technical Identity

| Properti | Nilai |
|---|---|
| Nama aplikasi | Amy FX Pro |
| Version | v2.0.0 build 332 |
| Branch utama | main |
| Update channel | Amy-fx-pro/main/update.json |
| Package continuity | com.amyelitesuite.learningpreview |

## Build Status

Build 332 merupakan versi aplikasi terbaru pada perangkat.

Source, manifest update, dan dokumentasi wajib mengikuti build yang telah dipublikasikan agar tidak terjadi perbedaan antara source repository dan aplikasi pengguna.

## Development Principle

Amy FX Pro dikembangkan dengan prinsip:

- Data market deterministic.
- Historical structure tidak berubah karena data masa depan.
- Semua engine consumer membaca canonical source yang sama.
- Setiap fitur baru menjaga kompatibilitas runtime dan kontinuitas aplikasi.
