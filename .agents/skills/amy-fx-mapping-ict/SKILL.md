---
name: amy-fx-mapping-ict
description: Arsitektur inti Peta Konteks Gold Amy FX Pro, aturan ICT Concepts [amygmgo] murni, Dealing Range, Confluence Scoring 8 lapis, kebijakan notifikasi sniper server diam, dan audit integritas Pro374. Mempertahankan kesinambungan konteks antar-sesi dan SOP auto-update sesi.
---

# Amy FX Pro — Gold Mapping & Market Context Architecture (ICT Pure Engine)

Gunakan skill ini sebagai **fondasi utama** setiap kali menganalisis, memodifikasi, mengaudit, atau memperbarui modul **Gold Mapping / Market Context Cockpit** pada Amy FX Pro.

---

## 1. Konteks Sesi & Kronologi Perubahan Penting

### A. Latar Belakang Masalah (Audit Awal Sesi Pro 372)
1. **Sinyal Palsu & Scalp Trap Kontra-Tren:** Sistem lama memicu notifikasi `"⚡ Scalp Kilat"` saat M15 berlawanan arah dengan H1 (fase pullback korektif). Hal ini menjebak trader mengambil posisi sell di pasar bullish atau sebaliknya.
2. **POI Terlalu Tipis (0.1–0.3 pips):** FVG dan Order Block dideteksi tanpa filter ketebalan, sehingga celah mikro (contoh: 80.4 ke 80.7) dianggap sebagai zona valid, menghasilkan noise ekstrem.
3. **Ketiadaan Filter Lokasi Dealing Range:** Posisi buy sering direkomendasikan saat harga sudah berada di pucuk Premium, dan sell di dasar Diskon.
4. **Verifikasi Ground Truth Data:** Dikonfirmasi bahwa WebSocket dan feed data Twelve Data live real-time di Supabase identik dengan MT5 (sama-sama di harga 4194) dan tidak mengalami delay 15 menit.

### B. Adopsi Logika TradingView `ICT Concepts [amygmgo]` (Rilis Pro 373)
- Menyelaraskan seluruh kalkulasi zona dan struktur dengan skrip TradingView Pine Script preferensi user:
  - Displacement body candle (`perc_Body = 0.36`, `body > meanBody(5)`).
  - Filter celah minimum: Celah FVG mikro $< 0.8–1.0$ point ($8–$10 pips emas) **wajib ditolak**.
  - Garis tengah 50% Consequent Encroachment (CE) pada setiap zona FVG dan Order Block.
  - Dealing Range (EQ 50%, Diskon $< 48\%$, Premium $> 52\%$).
  - Skor Konfluensi Multi-Layer 8 Lapis (0–100) dengan *Invalidation Guard*.
  - Visualisasi garis putus-putus (*dashed line*) warna emas untuk 50% CE di chart tanpa merusak kanvas harga.

### C. Audit Integritas & Pengetatan Pro 374
- **Otoritas Offline/Cache:** Status `READY TO REVIEW` langsung dicabut dan direset ke `BELUM SIAP` jika offline atau server heartbeat kedaluwarsa.
- **Kejujuran 6 Driver Turnamen:** Kartu driver ditampilkan sebagai model referensi riset (`BELUM DIEVALUASI`, `WR live: belum tersedia`) tanpa rekayasa Win Rate.
- **Kualifikasi Ketat Peluru Utama A+ (`aPlusEligible`):** Wajib memenuhi seluruh syarat (ready, skor $\ge 75$, lokasi sehat, target likuiditas terarah aktif, berita terverifikasi aman).
- **Kontiguitas Candle:** Mencegah loncatan candle yang hilang memalsukan FVG atau konfirmasi.
- **Prioritas News Lock:** Status pasar langsung beralih ke `NEWS LOCK · TUNDA EKSEKUSI` saat ada rilis berita USD berdampak tinggi.

---

## 2. Aturan Teknis & Formula Baku

### A. Filter Ketebalan POI & 50% CE
- **Formula:**
  ```javascript
  const curAtr = atr(candles, i) || 1.0;
  const minThickness = Math.max(0.8, curAtr * 0.15);
  ```
  Celah $< 0.8$ poin ($8 pips emas) otomatis ditolak.
- **Consequent Encroachment (CE):**
  `ce = (low + high) / 2`
  Ditampilkan pada chart candlestick sebagai garis putus-putus (*dashed line*) warna emas tanpa merusak kanvas harga.

### B. Dealing Range & Location Status
- `rangeHigh`: Swing High / Protected High M15
- `rangeLow`: Swing Low / Protected Low M15
- `span = rangeHigh - rangeLow`
- `eq = (rangeHigh + rangeLow) * 0.50`
- `eqLow = rangeLow + span * 0.48`
- `eqHigh = rangeLow + span * 0.52`
- `priceZone`: Close $> eqHigh$ (+1 / Premium), Close $< eqLow$ (-1 / Discount), lainnya (0 / Equilibrium).
- `locationStatus`:
  - **BUY**: Diskon = `+1 (Healthy)`, Premium = `-1 (Bad Location / Jangan Beli di Pucuk!)`.
  - **SELL**: Premium = `+1 (Healthy)`, Diskon = `-1 (Bad Location / Jangan Jual di Dasar!)`.

### C. Skor Konfluensi 8 Lapis (0–100)
1. **Layer 1 (20 pts):** Bias M15 Aligned H1 (+20 jika searah, +8 jika H1 netral/melemah, 0 jika perlawanan).
2. **Layer 2 (20 pts):** Liquidity Sweep (+20 jika sweep terjadi di dekat POI, +12 jika sweep umum).
3. **Layer 3 (20 pts):** POI Alignment & Rejection (+15 jika harga dekat POI, +5 bonus rejection/confirmed).
4. **Layer 4 (10 pts):** Draw on Liquidity (DOL) Aktif (+10 jika ada target likuiditas aktif searah).
5. **Layer 5 (10 pts):** Dealing Range Location (+10 jika di lokasi sehat Diskon/Premium, +4 di Equilibrium, 0 di lokasi buruk).
6. **Layer 6 (15 pts):** LTF Displacement (+15 jika ada micro FVG, +10 jika status confirmed).
7. **Layer 7 (10 pts):** LTF MSS (+10 jika ada struktur break MSS searah).
8. **Layer 8 (5 pts):** Sesi Pasar (+5 jika Sesi London/New York, +2 jika di luar jam inti).
- **Invalidation Guard:** Jika `h1.health === 'INVALIDATED'`, total skor **wajib di-hard-cap ke 0** (Grade: `NO_SETUP`).

### D. Kualifikasi Ketat Peluru Utama A+ (`aPlusEligible`)
Setup hanya berhak menyandang status dan notifikasi `Peluru Utama A+` jika lolos fungsi gerbang:
```javascript
export function aPlusEligible({ready, confluence, dr, target, side, price, news}) {
  if (!ready || (confluence?.score ?? 0) < 75 || dr?.locationStatus !== 1) return false;
  if (!target || target.status !== 'ACTIVE' || target.side !== side) return false;
  if (!Number.isFinite(price) || !Number.isFinite(target.level)) return false;
  if (side === 'BUY' && target.level <= price) return false;
  if (side === 'SELL' && target.level >= price) return false;
  if (!news || news.status === 'UNVERIFIED' || news.status === 'NEWS_LOCK') return false;
  return true;
}
```

### E. Kebijakan Notifikasi Sniper Server Diam
- **Notifikasi Prematur Dihapus Total:** Sinyal konflik `"⚡ Scalp Kilat"` dan pendekatan area `"🔔 Intip Area"` telah ditiadakan dari backend dan mobile push.
- **Server Wajib Diam:** Server **wajib diam (`event = null`)** saat pasar sedang berkonsolidasi, pullback korektif, atau belum terkonfirmasi lengkap.
- **Event Hanya Terbit Saat:**
  1. `NEWS_LOCK`: `"🛡️ Tahan Dulu: Pasar Lagi Liar"`
  2. `A_PLUS_READY` (`aPlusEligible === true`): `"🟢 Peluru Utama: BUY/SELL XAUUSD"`

---

## 3. SOP Kesinambungan Antar-Sesi & Auto-Update

### A. Prosedur Pembukaan Sesi Baru
1. **Wajib Baca Skill Ini Terlebih Dahulu:** Agen AI yang memulai sesi baru WAJIB membaca file ini untuk memahami context, arsitektur, dan batasan invariant proyek.
2. **Periksa Versi & Git Status:** Cek `app/build.gradle.kts` dan jalankan `git log -n 3 --oneline` untuk memverifikasi posisi branch `main`.
3. **Patuhi Invariant:**
   - Kanvas peta harga (candlestick, zoom, pan) tidak boleh diganggu.
   - Jangan pernah menambahkan kembali notifikasi bising/prematur.
   - Selalu jalankan `npm test` untuk memastikan 139+ suite pengujian tetap lulus 100%.

### B. Prosedur Auto-Update di Akhir Sesi
Setiap kali sesi kerja selesai atau pengguna meminta penutupan/pembaharuan skill:
1. Agen secara otomatis mencatat ringkasan ke dalam tabel **Riwayat Pembaruan Sesi** di bagian bawah dokumen ini.
2. Catat nomor build versi baru, file yang diubah, dan keputusan teknis yang disepakati.

---

## 4. Riwayat Pembaruan Sesi (Changelog Skill)

| Tanggal | Versi / Build | Topik / Perubahan Kunci |
| :--- | :--- | :--- |
| **2026-09-30** | `2.0.0-pro.373` (`950373`) | Porting penuh TradingView `ICT Concepts [amygmgo]`: filter FVG $\ge 0.8$ poin, titik 50% CE garis putus-putus emas, Dealing Range (Diskon vs Premium), Confluence Scoring 8 lapis, eliminasi notifikasi Scalp Kilat. |
| **2026-09-30** | `2.0.0-pro.374` (`950374`) | Audit integritas Mapping: reset status `BELUM SIAP` saat offline/cache, kejujuran model 6 driver (`BELUM DIEVALUASI`), pengetatan fungsi `aPlusEligible` (target terarah + berita valid), kontiguitas candle FVG/konfirmasi, dan isolasi invalidasi terarah. |
| **2026-09-30** | Pembuatan Skill | Inisialisasi skill `amy-fx-mapping-ict` sebagai memori hidup berkelanjutan dan SOP auto-update sesi. |
