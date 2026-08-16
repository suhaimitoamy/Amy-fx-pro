# Feature History

## Academy Trading Practice + ICT Berbasis Backtest
- **Date:** 2026-08-16
- **Status:** ✅ Implemented, signed, released, and activated as Amy FX Pro `2.0.0-pro.322` / `950322`.
- **Trading Practice:** Real locally bundled candlestick chart, M1–D1 aggregation, zoom/pan/crosshair, persistent drawing tools, manual BUY/SELL/WAIT records, local outcome history, three guided chart exercises, and a local Historical Pack Library.
- **Historical packs:** Added CSV/JSON plus recursive repaired-audited ZIP import. Nested group/year/month archives are scanned to M1 source packs, stored compressed in IndexedDB, selected explicitly per pack/month, and aggregated to higher timeframes only when used so historical data does not inflate the APK.
- **Replay:** Timestamp-owned candle replay with previous/advance/play/speed/source controls. Source candles are filtered at the real cursor before aggregation; the no-future-data invariant remains enforced across timeframe and source changes.
- **Live Chart:** Seeds the chart from native closed CandleStore context when available, then continues with the existing AmyLivePrice/Twelve Data WebSocket contract. No Twelve Data REST/polling path was added; if CandleStore is empty, live starts from subsequent WebSocket ticks.
- **Guided Practice:** Deliberately pinned to the packaged March 2009 repaired-audited sample so exercise answers stay deterministic regardless of the user's selected historical pack.
- **Learning:** Separate nine-document `ICT Berbasis Backtest` path from the requested Google Drive source, with source provenance, catalog progress, reading resume/history reuse, completion state, and supported Practice CTAs.
- **Academy integration:** Three track selectors and global Academy navigation preserve all existing Bagian 1–36 content, quiz behavior, history, and market-learning bridge.
- **Validation/release:** Real archive structure checks covered direct 2026 monthly ZIP, 2009 annual→monthly ZIP, and nested 2004–2008 package. JavaScript regressions, Android unit tests/lint/build, APK identity, signer continuity, release publication, published endpoint checksum, and signed artifact upload all passed. Pro 322 uses the same Pro signer certificate as Pro 321. Real-device visual/WebSocket smoke testing remains a separate manual validation item.

## Amy-SMC-D Canonical Mapping Engine
- **Date:** 2026-08-11
- **Status:** ✅ Implemented and 112-file JavaScript regression validated; private signed release workflow verification required
- **Description:** Replaced the Preview directional Mapping path with a native deterministic replay of Amy-SMC-D baseline blob `d6e6d7c979dd5a852bddd9661bef0480caa2eb35`, covering descriptive/context fields, fresh structure evidence, and all named predictive event fields.
- **Dealing Range:** M5/M15 preserve structural ranges with pure-location 70/30 and 60/40 boundaries. H1 uses previous 240 closed H1 bars with 55/45 boundaries. All are descriptive-only and cannot alter predictors or Final Bias.
- **Data flow:** REST closed candles are validated, ordered, deduplicated, and replayed sequentially without future data, interpolation, or synthetic gap candles. The last valid closed result survives provider staleness. Native Twelve Data WebSocket ticks remain display-only.
- **UI/Consumers:** Dashboard is reduced to Final Bias, Next Move, and Dealing Range; Analyze separates context, fresh evidence, and predictive events. Rencana Eksekusi, Entry Watch, Scalper, scanner, lifecycle, and notifications consume the canonical snapshot without directional authority.
- **Validation:** Added deterministic fixtures for required SHA/contract, rejected forming/synthetic candles, unfilled gaps, live-price independence, H1 previous-240 exclusion, M5/M15 structural sources, DR dependency isolation, and qualified BOS `N=0`. Full suite passes 112/112 files.
- **Release:** Candidate `2.0.0-preview.316` / `940316`; private manifest activation remains post-signed-APK verification.

## Professional Glassmorphism Full UI Redesign
- **Date:** 2026-08-02
- **Status:** ✅ Implemented and regression/viewport validated; signed release activation pending
- **Description:** Reworked Beranda, Mapping, Berita, Jurnal Trading, Tutorial Trading, nested Academy pages, loading, update dialog, and Amy Mentor surfaces around a shared navy/graphite glass system with ice-blue accents and responsive vector UI.
- **Themes:** Added persistent System, Terang, and Gelap modes plus native Android status/navigation bar synchronization.
- **Truthful UI:** Beranda now exposes exactly five existing modules, Koleksi only renders actual stored items, and Profil removes fabricated VIP/profile claims while showing actual local counts, connectivity, scanner, data source, notification, and version/update state.
- **Compatibility:** Legacy Blueprint runtime contracts remain installed; Mapping engine, scanner, lifecycle, notifications, formulas, market sources, and user data were not refactored.
- **Validation:** Full 95-file JavaScript regression suite, syntax checks, and Chromium mobile viewport checks for dark/light themes, all principal modules, truthful empty states, overflow, and error fallbacks. No backtest was run.
- **Release:** Candidate `2.0.0-preview.299` / `940299`; manifest activation occurs only after the signed APK workflow succeeds.

## Scalper Pattern v3 — BT6/BT6.1 + AMD
- **Date:** 2026-08-01
- **Status:** ✅ Implemented; release/deployment verification required
- **Description:** Added closed-candle Pattern BT6 gates to nine existing Scalper drivers, BT6.1 repair overlays to the four Blueprint drivers, and an independent AMD M30/H1 driver with shortest-window accumulation selection, manipulation invalidation, distribution FVG confirmation, and midpoint-limit entry.
