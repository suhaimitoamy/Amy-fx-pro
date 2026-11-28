# Amy FX Pro

Amy FX Pro adalah **hybrid trading workspace untuk XAU/USD (Gold)** yang menggabungkan Android WebView (Kotlin runtime), modul web lokal glassmorphism, market analysis berbasis *closed-candle evidence*, scanner, Market Intel, Central Pro Journal Analytics, Trading Academy, dan Candle Replay.

> **Prinsip Utama:** Amy FX Pro adalah market-analysis workspace dan decision-support tool. Mapping dibangun dari bukti candle tertutup (*closed-candle evidence*); live price tidak boleh menulis ulang historical Mapping secara sepihak.

---

## 📌 Current Status

| Properti | Nilai |
|---|---|
| **Source Branch** | `main` |
| **Active Version** | `2.0.0-pro.485` / `950485` |
| **Release Date** | 2026-11-28 |
| **Update Channel** | `main/update.json` |
| **Android Package** | `com.amyelitesuite.learningpreview` |
| **Published APK** | [GitHub Releases (amyfx-pro-2.0.0-pro.485)](https://github.com/suhaimitoamy/Amy-fx-pro/releases/tag/amyfx-pro-2.0.0-pro.485) |
| **Runtime** | Android WebView + HTML/CSS/JS + Vercel Serverless + Local Termux (Port 8080) |

> Paket Android `com.amyelitesuite.learningpreview` dipertahankan dari baseline `Amy FX Preview` pada `personal/amyfx-private` (`2.0.0-pro.316`) agar pembaruan tetap kompatibel. Kanal pembaruan sumber: `Amy-fx-pro/main/update.json`.

---

## 🏛️ Arsitektur Sistem

```text
Android Native (Kotlin)
  └─ WebView Runtime
      ├─ Local UI Modules (HTML/CSS/JS Glassmorphism)
      │   ├─ Beranda (Ringkasan Peta Harga 340px, 4 KPI Jurnal, Amy Live)
      │   ├─ Mapping Gold (Cockpit H1/M15/M5/M1, ICT NextGen Indicators)
      │   ├─ Central Pro Journal Analytics (Interactive SVG Equity Curve)
      │   ├─ Market Intel (News Sanitization, Liquidity Heatmap, BSL/SSL)
      │   ├─ Amy Trading Academy (581 Bab Terstruktur) & Trading Practice
      │   └─ Candle Replay Engine (Multi-TF, Time+Price Drawing, Replay Cursor)
      ├─ Backend Bridges & Engines
      │   ├─ TwelveData Multi-Key Pool (lib/twelvedata-key-pool.mjs)
      │   ├─ Amy Gemini Live Voice Bridge (Multimodal Numeric Strict Audio)
      │   └─ Local Preview Server (tools/serve-local.mjs :8080)
      └─ Vercel Serverless Endpoints (api/twelvedata, api/scalper-setups, api/news)
```

---

## 🔒 Invariant Inti Amy FX Pro

1. **Paritas Card Chart Gold & Peta Harga:**
   Card Chart Gold di Cockpit Mapping (`apps/mapping/index.html`) dan Card Peta Harga di Beranda (`index.html`) identik 100% dalam kontainer glassmorphism (`.gold-price-panel`), kontrol `[M15 | M5]`, live price, dan canvas 340px dengan vertical drag/pinch zoom pada skala harga kanan. Pembeda: Chart Gold di Mapping memiliki layer indikator ICT teknikal (`AMY_ICT_NextGen.pine`).
2. **Filter Pasar Libur (Weekend Anti-Spam):**
   Sesi Gold otomatis tutup Jumat 17:00 NY s.d. Minggu 17:00 NY (`isWeekendClosure`). Dilarang memunculkan atau spam candle flat saat weekend.
3. **Zero-Touch Supabase:**
   Proyek Supabase dalam status dibekukan (*frozen state*). Amy FX Pro 100% mandiri menggunakan Vercel serverless dan engine analitik lokal di perangkat.
4. **Format Angka Digit Mutlak pada Amy Live Voice:**
   Asisten suara Gemini Live wajib menyebutkan angka dan level teknikal dalam bentuk digit numerik riil ($3595.57, 50%, 100 pips), dilarang mengeja kata fonetik panjang.

---

## 🚀 Fitur & Modul Utama

### 1. Central Pro Journal Analytics
* **Single-Source Engine:** [`app/src/main/assets/apps/shared/journal-analytics-pro.js`](file:///root/Amy-fx-pro/app/src/main/assets/apps/shared/journal-analytics-pro.js).
* **Interaktif SVG Charts:** Equity Curve mulus dengan gradient glow, underwater drawdown, winrate, profit factor, streak, dan metrik R-Multiple.
* **Filter Waktu & Breakdown:** Filter 7 Hari, 30 Hari, 90 Hari, atau Semua Waktu; klasifikasi sesi trading WITA (Asia, London, New York), serta analisis kebocoran modal (*mistake leak costs*).
* **Integrasi Ganda:** Terpasang aktif di slot Beranda (`#home-journal-analytics-slot`) dan Modul Jurnal.

### 2. TwelveData Multi-Key Pool & 429 Failover
* **Engine:** [`lib/twelvedata-key-pool.mjs`](file:///root/Amy-fx-pro/lib/twelvedata-key-pool.mjs).
* Merotasi puluhan API key gratis secara otomatis, cerdas melakukan failover saat terkena limit HTTP 429, dan menghemat konsumsi kredit API hingga ~80%.

### 3. Mapping Gold ICT Engine
* Membaca H1 sebagai bias intraday, M15 sebagai area dan kontrol, serta M5/M1 sebagai konfirmasi eksekusi presisi (Target 100 Pips / $10).
* Dilengkapi visualisasi Dealing Range (Premium vs Discount), FVG + 50% CE, Order Block, Breaker Block, BSL/SSL Sweep, dan Invalidasi Tren.

### 4. Amy Trading Academy & Modul Tematik
* 581 Bab Pelajaran trading institusional ICT terbagi dalam 36 Bagian.
* Terintegrasi dengan jembatan sinkronisasi dua arah ke Google AI Studio ([`tools/sync-academy-modules.py`](file:///root/Amy-fx-pro/tools/sync-academy-modules.py)).

### 5. Candle Replay & Trading Practice
* Historical candle replay dengan kursor waktu independen, chart multi-timeframe, drawing berbasis waktu + harga, simulasi eksekusi BUY/SELL/WAIT, dan pencatatan riwayat latihan tanpa *future-candle leakage*.

---

## ⚡ Fast Dev Mode & Harness Engineering

Sistem mengadopsi kurikulum **Harness Engineering** untuk mencegah amnesia antar-sesi dan mempercepat verifikasi:

* **Inisialisasi & Verifikasi Kilat (0.4 Detik):**
  ```bash
  ./init.sh
  ```
  Menjalankan pemeriksaan sintaks cepat (`node --check`) dan targeted unit tests tanpa membuang waktu menjalankan 218 test suite lengkap.
* **Server Preview Lokal:**
  ```bash
  node tools/serve-local.mjs
  # Akses web: http://localhost:8080/
  ```
* **Berkas Primitif Harness:**
  * [`feature_list.json`](file:///root/Amy-fx-pro/feature_list.json) — Inventaris fitur aktif & status bukti verifikasi.
  * [`session-handoff.md`](file:///root/Amy-fx-pro/session-handoff.md) — Estafet status antar-sesi developer/AI.
  * [`clean-state-checklist.md`](file:///root/Amy-fx-pro/clean-state-checklist.md) — Checklist kebersihan kode sebelum commit.
  * [`BLUEPRINT_PAGI.md`](file:///root/Amy-fx-pro/BLUEPRINT_PAGI.md) — Blueprint arsitektur master sistem.

---

## 📦 Rilis & Pembaruan

Pembaruan didistribusikan melalui kanal `update.json` dan otomatis terdeteksi oleh modul pembaruan in-app di Android.
1. Commit kode di cabang `main`.
2. Pipeline GitHub Actions menjalankan `Lint / Static Check` dan build signed APK `Amy FX Pro Build and Release`.
3. Metadata versi diperbarui di `update.json` dan APK dipublikasikan ke GitHub Releases.

---

**Amy FX Pro** — *Deterministic Gold market context, closed-candle evidence, interactive replay, institutional ICT engine, and advanced journal analytics.*
