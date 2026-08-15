# Amy FX Pro

Amy FX Pro memakai **Amy FX Preview sebagai baseline utama**. Baseline awal Pro dipromosikan dari `suhaimitoamy/Amy-fx` branch `personal/amyfx-private`, snapshot **Amy FX Preview 2.0.0-preview.316** pada commit `1e167ff1486572085a81b0b6ad8bca1d96ebdc53`.

> **Baseline Pro:** `2.0.0-pro.316`  
> **Version code:** `950316`  
> **Tanggal penetapan:** 15 Agustus 2026

## Status Utama

`main` pada repository ini adalah jalur utama **Amy FX Pro**, dengan engine dan runtime dari Preview `.316` sebagai fondasi. Repo `suhaimitoamy/Amy-fx` tidak diubah oleh proses promosi ini.

Mapping yang dibawa dari Preview `.316` mempertahankan kontrak berikut:

- `AMY_SMC_D` sebagai directional Mapping authority;
- pemrosesan candle tertutup secara sequential tanpa future candle, interpolation, atau synthetic candle;
- HTF Swing, Swing Structure, Internal Structure, Liquidity, Dealing Range, Pattern, Final Bias, Event History, Next Move, Sweep Continuation, Valid Break, CHoCH, dan BOS dari replay canonical;
- M5/M15 memakai structural dealing-range source dengan pure-location `70/30` dan `60/40`;
- H1 memakai previous 240 closed H1 bars dengan pure-location `55/45`;
- Dealing Range tetap descriptive-only;
- live Twelve Data WebSocket tetap display-only dan tidak menghitung ulang Mapping;
- Rencana Eksekusi, Entry Watch, scanner, lifecycle, dan notifikasi tetap consumer/read-only terhadap canonical Mapping state.

## Identitas Amy FX Pro

| Properti | Nilai |
|---|---|
| Nama aplikasi | `Amy FX Pro` |
| Branch utama | `main` |
| Source baseline | Amy FX Preview `2.0.0-preview.316` |
| Source commit | `1e167ff1486572085a81b0b6ad8bca1d96ebdc53` |
| Version name | `2.0.0-pro.316` |
| Version code | `950316` |
| Update channel | `Amy-fx-pro/main/update.json` |
| Minimum Android | Android 8.0 / API 26 |
| Target SDK | Android SDK 35 |

### Package continuity

Application ID tetap `com.amyelitesuite.learningpreview` dan URI scheme tetap `amyfxpreview` **secara sengaja** pada baseline pertama Pro. Alasannya adalah menjaga kompatibilitas Firebase, data aplikasi, dan deep-link dari lineage Preview yang dipromosikan. Branding, version line, repository, dan update channel sudah berpindah ke Amy FX Pro.

Jika nanti Pro harus dapat terpasang berdampingan dengan Preview sebagai aplikasi yang benar-benar terpisah, package baru harus didaftarkan terlebih dahulu pada konfigurasi Firebase sebelum application ID diganti.

## Update dan Release

Runtime Pro membaca manifest:

`https://raw.githubusercontent.com/suhaimitoamy/Amy-fx-pro/main/update.json`

Workflow produksi lama Amy FX publik **tidak lagi berjalan otomatis pada push ke `main`**. `build-apk.yml` pada Pro dijadikan workflow validasi/build manual supaya promosi baseline tidak tanpa sengaja menerbitkan APK atau metadata Amy FX publik maupun Amy FX Preview.

File `preview-update.json` dan artefak historis lain yang terbawa dari snapshot Preview bukan update channel aktif Amy FX Pro.

## Backup Sebelum Promosi

Main Amy FX Pro sebelum perubahan ini disimpan pada branch:

`archive/pro-main-before-preview-20260815`

Dengan demikian baseline lama tetap dapat diaudit atau dipulihkan bila diperlukan.

## Disclaimer

Amy FX Pro adalah alat bantu analisis dan pembelajaran. Aplikasi tidak menjamin profit. Validasi statistik tetap harus memisahkan in-sample, out-of-sample, walk-forward, dan forward test.
