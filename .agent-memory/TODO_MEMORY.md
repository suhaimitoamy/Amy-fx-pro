# TODO Memory

## Pending Tasks

- [ ] Validate the real Causal V3 lifecycle against a naturally occurring setup when one eventually passes every unchanged gate; do not manufacture a setup or tune thresholds for this task.
- [ ] Manually validate Mapping Accuracy V3 on current/forward closed candles for M1, M5, M15, M30, H1, H4, D1, and W1 using `docs/MAPPING_ACCURACY_V3_MANUAL_VALIDATION.md`.
- [ ] Record repeatable reference mismatches with timeframe, candle open time, expected event, actual event, and screenshot before changing any Mapping V3 threshold.
- [ ] Add real passcode gate for Academy admin (`auth.js` is still a stub).
- [ ] Replace hardcoded `API_BASE` with relative `/api` path if safe (needs WebView testing).
- [ ] Add TwelveData error handling — check `data.status === "error"` in `api/heatmap.js`, `api/liquidity.js`, `api/twelvedata.js`.
- [ ] Add clearer news scraping failure message if Telegram extraction returns empty (diagnostic info).
- [ ] Add defensive WebView fallback for Telegram regex changes (only if primary regex starts failing).
- [ ] [Mapping Pro] Gabungkan narasi teks berulang menjadi single card "Executive Market Summary".
- [ ] [Mapping Pro] Buat state Card Scalper Engine menjadi ringkas/compact saat status idle/menunggu setup.
- [ ] [Mapping Pro] Tambahkan Visual Price-to-Target Gauge (Level Ladder) memetakan harga live vs Entry, SL, dan TP.
- [ ] [Mapping Pro] Tambahkan Instant Position Sizing & Lot Size Calculator di Setup Aktif.
- [ ] [Mapping Pro] Tambahkan Session Live Countdown ke Kill Zone berikutnya.
- [ ] [Mapping Pro] Tambahkan Liquidity Radar (Asia High/Low, PDH/PDL, EQH/EQL sweep tracker).
- [ ] [Mapping Pro] Tambahkan One-Tap "Export Setup ke Jurnal Trading".

## Notes

- XAU/USD 2021–2022 M5/M15 replay still produces zero locked setups after causal-order and paired-leg fixes. The next cumulative blocker is the unchanged SESSION gate.
- Rolling 300 and 800 produce identical gate decisions, paired-anchor times/prices, and setup counts; only negligible EMA seed drift remains.
- Mapping V3 manual profiles (M1, M30, H4, D1, W1) have no win-probability claim and must not be tuned from isolated live outcomes.
- H1 bearish suppression is intentional reference parity, not a pending defect.
- Auth fix needs user decision: what passcode to use.
- API_BASE fix needs WebView testing — `file://` protocol doesn't support relative API paths.
- TwelveData error handling is the safest fix to implement first.
