# Amy FX Pro — Session Handoff

## 1. Verified Now (Status Terverifikasi Saat Ini)
- **Versi Rilis:** `2.0.0-pro.458` (code `950458`) — Sukses terbit di GitHub Release.
- **CI/CD Workflow:** `Lint / Static Check` & `Amy FX Pro Build and Release` **100% SUCCESS** (Semua 218 regression test lolos).
- **Baseline Verification:** Script `./init.sh` lulus bersih (0 error, 12/12 baseline test pass).
- **Fitur Baru Terpasang:**
  - Central Pro Journal Analytics & interactive SVG Equity Curve (`apps/shared/journal-analytics-pro.js` & `.css`).
  - Integrasi dashboard analitik jurnal di Beranda & Jurnal.
  - TwelveData Multi-Key Pool (`lib/twelvedata-key-pool.mjs`) & optimasi kredit ~80%.
  - Format angka digit mutlak pada Amy Live Voice (`amy-gemini-live-bridge.js`).

## 2. Changed This Session
- Migrasi borongan 19 berkas dari Google AI Studio.
- Perbaikan regresi UI label profile & fetch D1 pada `app.js` dan `api/scalper-setups.js`.
- Penambahan 4 file harness primitif: `init.sh`, `feature_list.json`, `session-handoff.md`, `clean-state-checklist.md`.

## 3. Broken Or Unverified Risks
- Tidak ada blocker kritis yang aktif.
- Kuota Opus sedang dalam masa tunggu reset (otomatis memakai Gemini Flash / Sonnet sesuai kebutuhan).

## 4. Next Best Actions
- Lanjutkan pemantauan chart live XAU/USD sesi trading harian Sayang.
- Eksperimen riset lab jika Sayang ingin menguji strategi baru.

## 5. Standard Commands
- Inisialisasi & verifikasi cepat: `./init.sh`
- Jalankan server lokal: `node tools/serve-local.mjs` (Port 8080)
- Targeted test: `node --test tests/<nama-file>.test.mjs`
