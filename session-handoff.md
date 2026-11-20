# Amy FX Pro — Session Handoff

## 1. Verified Now (Status Terverifikasi Saat Ini)
- **Versi Rilis:** `2.0.0-pro.460` (code `950460`) — Perbaikan dynamic import aman pada modul Chart Gold & resilient vendor fallback.
- **Baseline Verification:** Script `./init.sh` lulus bersih (0 error, 34/34 targeted test pass).
- **Fitur Baru Terpasang dari AI Studio:**
  - **Mapping Reaction History Engine:** Tracking POI touch/outcome (auto-backfill 30j + live persistence 7 hari di localStorage, scorecard Respect%).
  - **Mapping Accuracy & SSOT M15:** 5 pilar resolusi arah tunggal, dual-layer scalper POI (M5/M15 continuation), dan perbaikan zero-height OB.
  - **Amy FX Academy Reborn:** 6 Level kurikulum (30 Pelajaran + 90 Kuis Diagnostik), Zero-Dependency SVG Diagram Engine (`diagram-engine.js`), dan sinkronisasi pengetahuan Amy Live.
  - **Kalibrasi Mobile 360x820px:** Fix overflow lot calculator, padding kalender bulanan, dan layout jurnal responsif.
  - **Jurnal Diet & Unified P/L:** Penghapusan bloat modul non-trading dengan 100% kompatibilitas data lama.

## 2. Changed This Session
- Migrasi borongan 40 berkas dari commit `77bf5f7` repo Google AI Studio (`Amy-fx-ai-studio`).
- Penambahan 3 test suite baru: `tests/mapping-accuracy.test.mjs`, `tests/mapping-history-engine.test.mjs`, `tests/academy-curriculum.test.mjs`.
- Bump versi ke `2.0.0-pro.459` / `950459`.

## 3. Broken Or Unverified Risks
- Tidak ada blocker kritis yang aktif.
- Semua 34 targeted baseline test lolos 100%.

## 4. Next Best Actions
- Pantau CI/CD GitHub Actions release pipeline untuk APK `2.0.0-pro.459`.
- Lanjutkan pengawalan chart live XAU/USD.

## 5. Standard Commands
- Inisialisasi & verifikasi cepat: `./init.sh`
- Jalankan server lokal: `node tools/serve-local.mjs` (Port 8080)
- Targeted test: `node --test tests/<nama-file>.test.mjs`
