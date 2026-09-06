# TODO Memory

## Pending Tasks

- [ ] Complete real-device WebView visual/gesture smoke tests after the signed `.326` release; CI owns Android unit, lint, build, identity, signer, and endpoint verification.

- [ ] Add automatic next/previous monthly-pack handoff in Candle Replay if seamless multi-month playback is later required; current design intentionally keeps one explicit local pack active at a time to bound memory.
- [ ] Add SMT guided-chart exercises only after a synchronized, provenance-preserving DXY dataset is available beside XAUUSD.
- [ ] Smoke-test the native live chart on a real Android device with a configured Twelve Data key; CI already validates source, Android unit/lint/build, APK identity, signer, release asset, and endpoint.

- [ ] Validate the real Causal V3 lifecycle against a naturally occurring setup when one eventually passes every unchanged gate; do not manufacture a setup or tune thresholds for this task.
- [ ] Manually validate Mapping Accuracy V3 on current/forward closed candles for M1, M5, M15, M30, H1, H4, D1, and W1 using `docs/MAPPING_ACCURACY_V3_MANUAL_VALIDATION.md`.
- [ ] Record repeatable reference mismatches with timeframe, candle open time, expected event, actual event, and screenshot before changing any Mapping V3 threshold.
- [ ] Add real passcode gate for Academy admin (`auth.js` is still a stub).
- [ ] Replace hardcoded `API_BASE` with relative `/api` path if safe (needs WebView testing).
- [ ] Add TwelveData error handling — check `data.status === "error"` in `api/heatmap.js`, `api/liquidity.js`, `api/twelvedata.js`.
- [ ] Add clearer news scraping failure message if Telegram extraction returns empty (diagnostic info).
- [ ] Add defensive WebView fallback for Telegram regex changes (only if primary regex starts failing).

## Notes

- Academy Trading Practice now supports local repaired-audited ZIP packs recursively, including nested annual/group archives, without bundling the historical library into the APK.
- Replay keeps one explicit pack active at a time and filters source candles at the real timestamp cursor before timeframe aggregation.
- Live Chart can preload closed candle context from native CandleStore and then continue with AmyLivePrice/Twelve Data WebSocket without Twelve Data REST/polling; it intentionally starts from WebSocket ticks if CandleStore is empty.
- Guided Practice is pinned to the packaged March 2009 sample so fixed exercise answers cannot drift when a user selects another historical pack.
- XAU/USD 2021–2022 M5/M15 replay still produces zero locked setups after causal-order and paired-leg fixes. The next cumulative blocker is the unchanged SESSION gate.
- Rolling 300 and 800 produce identical gate decisions, paired-anchor times/prices, and setup counts; only negligible EMA seed drift remains.
- Mapping V3 manual profiles (M1, M30, H4, D1, W1) have no win-probability claim and must not be tuned from isolated live outcomes.
- H1 bearish suppression is intentional reference parity, not a pending defect.
- Auth fix needs user decision: what passcode to use.
- API_BASE fix needs WebView testing — `file://` protocol doesn't support relative API paths.
- TwelveData error handling is the safest fix to implement first.


## 2026-09-05 — Pro328

Pro328 release: signed build and automatic update.json activation completed (run 33976208755). Remaining: verify drawing gestures and per-device controls on a real Android device. Local browser could not access the preview, so real-device visual validation remains pending.


## 2026-09-06 — Pro329

Pro329 pending: reconnect GitHub, apply the prepared changes to current main without overwriting any later work, publish commit with [release329-no-tests] marker, build/publish329. No tests/backtests/verification requested. Backend news-sync v11 already deployed. New news-feed translation-at-read design was rejected by automatic approval review and abandoned; existing news-feed is unchanged. Safer repair translates only freshly fetched public Telegram content and was accepted. No approval blocker remains on deployed news-sync.
