# TODO Memory

## 2026-09-20 — Pro351

After the signed release activates, verify on the reporting Android device: an older terminal Replay record gains TP/SL evidence after its matching pack reaches the candle, deletion survives restart, Trading Practice has no Academy “Terakhir Dibaca” card, and Mapping Analyze remains readable in portrait. Native update notification receipt still requires device observation.

## 2026-09-20 — Pro350 Replay history

Verify Pro350 on the reporting Android device: save entry, open inline Riwayat, advance to SL/TP, switch timeframe, restart the app and inspect retained history. Native update notification receipt and device storage behavior require device observation. Release verification completed: source commit 9f43bdaea406f07c7673759dab1f3a08ff15cab1; signed workflow 35483550772 and lint workflow 35483550693 succeeded. All 136 JavaScript regression files pass. APK identity/signer and published endpoint gates passed. Active update.json is enabled at 2.0.0-pro.350 / 950350; release asset digest matches manifest SHA-256 26408fa3682197cc995c863d11e2ba35cbcd827b4576fea7e4b63e2cb391a513. Real Android rendering and receipt of native update notification remain unobserved.

## 2026-09-20 — Pro349

Verify on the reporting Android device that a replay decision survives app/page restart and that advancing into TP, SL, and same-candle SL+TP cases updates Riwayat with the expected timestamp and low/high evidence. CI can validate persistence contracts and rendering source but cannot prove device storage behavior or native update-notification receipt.

## 2026-09-19 — Pro348

Verify the five principal pages on the reporting Android device in portrait mode, especially sticky Mapping/News headers, custom-color contrast, long news text, and Journal/Academy one-column cards. Static regression tests cannot establish final Android WebView rendering or native update-notification receipt.

## 2026-09-19 — Pro347

Verify news branding removal, app-focused notification deep links, custom colors, reset, and light-theme contrast on the reporting Android device after the signed Pro347 release activates. Source tests cannot establish final WebView color rendering or native notification receipt.

## 2026-09-17 — Pro345 preparation
Pro345: verify home dark→light→dark on reporting device and direct chart delete in portrait/fullscreen. Home fix remains visually unverified; static CSS assertions cannot establish cascade/computed contrast. Branch push authorized; release/main merge not performed. Existing dirty preview-regression-failure.txt excluded.

## Drawing fixes — branch publication authorized
Amy authorized pushing Long/Short validation/labels and Object-menu close, without version bump. Publish on fix/replay-gesture-menu only; do not merge main or replace released Pro344 APK. This supersedes earlier no-push notes for these two fixes. Android visual verification remains pending.


## Long/Short drawing local fix
Local unpushed Long/Short fix: signed risk/reward validation; invalid creation and drag rejected; legacy invalid drawings retained with neutral fill and INVALID label; labels spaced.29 focused tests and all131 JS files pass. Still three-point entry/TP/SL interaction, not TradingView parity; device visual validation pending. No bump/commit/push authorized for this batch.


## 2026-09-17 — Pro344 replay fix
Pro344 awaits separate push/release permission, signed Android build and on-device timeframe/menu/fullscreen verification. Local branch fix/replay-gesture-menu in /root/Amy-fx-pro-home-chart. update.json remains published Pro343.


## 2026-09-17 — Pro343 home chart

Pro343: confirm CI signed release/manifest after push and visually smoke-test Android home chart, pinch, scroll, tab return, offline and theme. Browser access to local preview was blocked by private-address policy; no visual validation claim.


## Pending Tasks

- [ ] Verify Market Intel auto-translation on real Android device after Pro339 release activation.

- [ ] Confirm Pro333 Candle Replay fullscreen chart height and object-menu containment on the reporting Android device after the signed release is activated.

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


## 2026-09-09 — Pro332

Pro332: signed APK build and automatic manifest activation pending at source commit. Real-device Android fullscreen/rotation/drawing and light/dark visual smoke checks remain necessary; no local browser executable was available.


Pro332 release completed: GitHub Actions run 34301702033 succeeded, including JavaScript regression, Android unit/lint/build, signing identity and published endpoint verification. Active public update.json is 2.0.0-pro.332 / 950332, enabled=true. Published APK SHA-256 62bd08b231bef85e768af95b50540ecfe3e0d6b3e71a77dbc670da18f4e297f1 matches the release asset digest. Earlier build/activation pending status is resolved. Actual device notification and WebView visual checks remain unobserved.


## 2026-09-09 — Pro334 server-owned live price

Pro334 source 2.0.0-pro.334 / 950334: push triggers existing signed APK workflow; keep update.json on published333 until CI activation. Confirm Vercel deployment has TWELVEDATA_API_KEY with XAU/USD WebSocket entitlement and observe stream on device; no credential value is copied into source.



## 2026-09-09 — Pro335 replay navigation

After Pro335 release, verify one/two-finger gestures, drawing-edge resizing, free pan over rectangles, portrait/landscape fullscreen and update notification on the reporting Android device. Browser access to local preview was blocked in this session. Full TradingView feature parity (including its proprietary indicators/layouts and complete drawing settings) remains outside this implemented release.


## 2026-09-09 — Pro336

Confirm on the reporting Android device that downward swipes in replay (normal/fullscreen, chart/object, after background/resume) never show native refresh; navigating home must restore normal pull-to-refresh. Pro335's native refresh issue is addressed by Pro336 source, with signed release verification pending.

## 2026-09-12 — Pro337

- Verify new Mapping UI/chart/gestures on Android, including M5/M15 switch, timeout,
  background/resume, dark/light theme and receipt of the native update notification.
- Validate model on held-out broker-quality data including spread, commission, slippage
  and scheduled news; forward paper-test before drawing profitability conclusions.
- Pro337 signed release/manifest verification pending at source preparation.


## 2026-09-13 — Pro338 Academy

Verify Pro338 chart labels, gestures, narrow-screen layout, lesson return and native update notification on the reporting Android device. Cloud browser local preview was blocked (ERR_BLOCKED_BY_CLIENT); visual verification unobserved. Signed release and manifest activation pending at source preparation. The old note pinning Guided Practice to March2009 is superseded by Pro338 illustrative scenarios; Replay/Chart Analysis still use their existing sources.


## 2026-09-13 — Pro340 local application assistant

Verify Pro340 on real Android: open each main module then ask from another module; confirm IndexedDB journal reads, news refresh, reading/quiz progress, keyboard/scroll/close and update notification. Local browser preview blocked by ERR_BLOCKED_BY_CLIENT. Signed build and manifest activation pending at source preparation; do not claim device notification observed. Future broader language understanding requires additional rules/search or a separately approved model.


Pro340 release completed: source commit efa8c80406d57cc8c40b08ed6755d9ce3dac589e; signed workflow 34750969449 and lint workflow 34750969447 succeeded. All 127 JavaScript regression files and 14 dedicated assistant cases pass. Android unit tests, lint, APK identity/signer and published endpoint gates passed. Active update.json is enabled at 2.0.0-pro.340 / 950340. APK asset digest matches manifest SHA-256 3af71bbe25893f15411d380cc77938b5fd33f0f477f0a32a4df536d173f3f0b8. Earlier signed-release/manifest pending notes for Pro340 are resolved. Actual Android layout and receipt of native update notification remain unobserved; browser preview was blocked.


## 2026-09-13 — Pro341

- Verify cold-start menu, glass readability in both themes, BSL/SSL alignment with the selected Mapping timeframe, heatmap filters, background/resume and native update receipt on Android.
- Confirm the signed Pro341 workflow and active manifest after publishing source; local full JS regression passed.


Pro341 release verified: PR #3 merged as 89f147daa947632da15a21da5bd5b7ee5e8a297f. Signed release workflow34788293012 and main lint34788292968 succeeded. All128 JS files, Android tests/lint/build, existing signer continuity and published endpoint gates passed. Active update.json is enabled at 2.0.0-pro.341 /950341; APK digest matches manifest SHA-256 8f59f72ecb22ed384c5c390ea20e9a1927cd3e17ad9910b9ee6b4fde80d7943c. Earlier Pro341 publication-pending notes are resolved. Browser/device appearance and native notification receipt remain unobserved. Internal validation was aligned from Node20 to the repository-required Node22 after its old runtime failed to import stripTypeScriptTypes. Legacy Learning Preview and1.5.8 PR checks lacked their old signing cache; Pro release used its existing signer and passed verification.


## 2026-09-14 — Pro342 Mapping restoration

Pro342: confirm signed release/manifest activation and native update receipt. Verify Android Mapping selection, filters, timeframe and resume. Investigate existing Supabase Scalper504 failures; restored UI cannot supply new signals while engine remains failed. No database or backend function changes made.


## 2026-09-19 — Pro346
Observe new STRUCTURAL-2026-09-V1 results separately from old history; run held-out replay with broker costs before performance claims. Verify native update receipt on device after signed Pro346 release activation. Archived IFVG_LEGACY and FVG_BUY_HIGH_QUALITY remain retired.
