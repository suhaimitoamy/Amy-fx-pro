# Amy FX Preview — Personal Build

Amy FX Preview adalah aplikasi Android hybrid untuk pemetaan market **XAU/USD**, Rencana Eksekusi, Entry Watch, jurnal trading, market intelligence, dan materi belajar. Source Preview berada pada branch khusus dan terpisah dari Amy FX publik.

> **Release aktif:** `2.0.0-preview.316`
> **Version code:** `940316`
> **Tanggal rilis:** 11 Agustus 2026

[Download Amy FX Preview 2.0.0-preview.316](https://github.com/suhaimitoamy/Amy-fx/releases/download/amyfx-blueprint-preview-2.0.0-preview.316/AmyFX-Preview-latest.apk)

## Status Release `.316`

Preview `.316` mengganti directional Mapping lama dengan satu engine canonical yang mengikuti semantik `Amy-SMC-D.pine` blob `d6e6d7c979dd5a852bddd9661bef0480caa2eb35`. Port berjalan native di arsitektur Amy FX dan memproses candle tertutup secara sequential.

Kontrak Mapping baru:

- HTF Swing, Swing Structure, Internal Structure, Liquidity, Dealing Range, Pattern, Final Bias, dan Event History berasal dari replay D;
- Next Move, Sweep Continuation, Raw/Qualified Valid Break, Qualified CHoCH, Qualified BOS, serta Raw/Qualified Pattern berasal dari replay D;
- M5/M15 tetap memakai structural dealing-range source dengan pure-location `70/30` dan `60/40`;
- hanya H1 memakai highest/lowest dari previous 240 closed H1 bars dengan pure-location `55/45`;
- Dealing Range bersifat descriptive-only dan tidak masuk Final Bias atau predictor lain;
- Qualified BOS M5/M15/H1 tidak dibuat synthetic ketika baseline riset mempunyai `N=0`;
- continuous context, fresh structural evidence, dan predictive/event signal ditampilkan sebagai kelas yang berbeda;
- tidak ada confidence percentage yang dipresentasikan sebagai probabilitas live.

## Kontrak Candle dan Determinisme

- Hanya candle dengan status closed dan geometri OHLC valid yang masuk replay.
- Candle diurutkan dan dideduplikasi berdasarkan timestamp; gap dibiarkan sebagai gap.
- Tidak ada future candle, interpolation, atau synthetic candle.
- Candle live/forming tidak dapat mengubah Mapping sampai resmi close.
- Bila REST belum menyediakan close baru, UI mempertahankan Mapping dari candle closed terakhir yang valid dan menunjukkan timestamp sumbernya.
- Freshness tetap menjadi proteksi kualitas data, bukan alasan untuk mengosongkan seluruh hasil yang masih valid.

## Otoritas dan Konsumen

`AMY_SMC_D` adalah satu-satunya directional Mapping authority. Dashboard menyajikan Final Bias, Next Move, dan Dealing Range; Analyze memisahkan context, fresh evidence, dan predictor.

Rencana Eksekusi, Entry Watch, scanner, lifecycle, dan notifikasi tetap memakai kontrak yang sudah ada sebagai consumer/read-only. Modul tersebut tidak boleh menghitung ulang, membalik, atau menimpa arah Mapping. Formula Entry, SL, TP, RR, expectancy, dan trade management tidak diubah oleh rombak Mapping ini.

Original Z Target V1 tidak digunakan sebagai scoring directional Mapping. M5 TGT2 segmented target/expiry dari B dan ATR trailing M15/H1 dari B-LAB tidak dibawa ke engine baru.

## Harga Live dan REST

Harga XAU/USD live tetap dimiliki satu koneksi native Twelve Data WebSocket. Tick hanya memperbarui elemen harga dan status koneksi. Tick tidak memanggil analisis Mapping, tidak meminta REST, dan tidak memublikasikan ulang directional state.

Candle Mapping tetap melalui pipeline REST yang sudah ada. Refresh bersifat event-driven/single-flight; tidak ada polling Mapping per tick atau timer render berulang yang ditambahkan.

## Identitas Amy FX Preview

| Properti | Nilai |
|---|---|
| Nama aplikasi | `Amy FX Preview` |
| Branch | `personal/amyfx-private` |
| Application ID | `com.amyelitesuite.learningpreview` |
| URI scheme | `amyfxpreview` |
| Version name | `2.0.0-preview.316` |
| Version code | `940316` |
| Minimum Android | Android 8.0 / API 26 |
| Target SDK | Android SDK 35 |
| Update channel | `personal/amyfx-private/preview-update.json` |
| Release tag | `amyfx-blueprint-preview-2.0.0-preview.316` |
| APK | `AmyFX-Preview-latest.apk` |

Package, URI, signing certificate, update channel, dan data pengguna Preview tetap terpisah dari Amy FX publik.

## Arsitektur Market Data

```text
Twelve Data WebSocket
        └── Harga live di layar

Candle REST yang sudah close
        ↓
Validasi OHLC + urut/deduplikasi tanpa gap fill
        ↓
Replay sequential Amy-SMC-D
        ↓
Descriptive context + fresh evidence + predictors
        ↓
Satu canonical Mapping state
        ↓
Execution consumer/read-only
        ↓
Execution Authority
        ├── Rencana Eksekusi
        ├── Entry Watch
        ├── Scanner
        └── Notifikasi
```

Harga live hanya memperbarui tampilan harga dan tidak boleh menghitung atau merender ulang Mapping.

## Validasi Release `.316`

Sebelum rilis:

- blob SHA Amy-SMC-D dan semantic contract dikunci oleh regression;
- fixture H1 membuktikan current candle tidak masuk previous-240 range;
- fixture M5/M15 membuktikan structural source dan boundary D tetap dipakai;
- fixture determinisme, gap, open/synthetic-tail rejection, DR dependency, dan qualified BOS N=0 lulus;
- test membuktikan perubahan harga live tidak mengubah output Mapping;
- seluruh regression JavaScript lulus;
- workflow private menjalankan Android unit test, lint, signed release build, serta package/version/signer verification.

Pipeline release resmi kemudian menjalankan ulang:

- Blueprint stabilization;
- seluruh regression JavaScript;
- Android release unit test;
- Android release lint;
- signed release build;
- verifikasi package, label, version code, version name, dan signer;
- publikasi APK serta checksum SHA-256;
- aktivasi `preview-update.json` setelah APK berhasil diverifikasi.

## Branch Boundary

```text
personal/amyfx-private  → Amy FX Preview
main                    → Amy FX publik
```

Release `.316` hanya dikerjakan pada `personal/amyfx-private`. Branch `main`, package produksi, URI produksi, signing produksi, update channel produksi, APK produksi, dan data pengguna produksi tidak disentuh.

## Disclaimer

Amy FX Preview adalah alat bantu analisis dan pembelajaran. Aplikasi tidak menjamin profit dan tidak membuktikan bahwa setiap konteks memiliki edge. Validasi statistik tetap harus dipisahkan antara in-sample, out-of-sample, dan forward test.
