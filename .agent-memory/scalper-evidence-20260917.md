# Scalper evidence audit — 17 September 2026 UTC

## Scope
User authorized scalper repair. Baseline da6719de (Pro345), isolated worktree /root/Amy-fx-pro-scalper; old experiment preserved in /root/.hermes/backups/scalper-20260918-012228. Global simulation history, NOT broker fills or device-specific history. Snapshot /root/.hermes/backups/scalper-audit/history-20260917T172349Z.json contains170 distinct records below endpoint2000 cap; whole-database/device completeness is not claimed.

58TP,77SL,6BE,10TIME_EXIT,16CANCELLED,3INVALIDATED. TP/(TP+SL)=42.96296%; excludes BE/time exits/unentered outcomes. All32 driver/TF/version groups aggregated and totals reconciled in /root/.hermes/backups/scalper-audit/group-report.json.12 groups have TP/SL WR<50%, including legacy versions and tiny samples.

## Confirmed and deployed defect
SMR sweepAt used nullable `low && ...` and `high && ...`; existing unswept LOW returns false while absent HIGH returns null. false !== null bypasses no-sweep branch and reads high.price. Engine public evaluator propagates exception, blocking later lifecycle updates that run after candidate evaluation.

Downloaded deployed v11 source backup: /root/.hermes/backups/scalper-deployed-v11/. All source files matched repo baseline. Regression on that copy:2 fail/2 pass with exact null.price error. Fixed boolean anchor guards:4/4 pass; full133 files781 cases pass. Commit0effac55. Deployed scalper-engine using existing project/JWT settings; naturally scheduled runs17:39 and17:45 UTC confirmed COMPLETED/ok=true/error=null. No historical outcomes changed. Crash's contribution to historical WR is not established.

## Target sensitivity: fixed Discipline M15 cohort
Eight terminal M15 Discipline entries, all SELL/SL in snapshot. Original entry+initialSL+entry timestamp fixed. Read-only database query retrieved4983 original M1 candles for span1788829980–1789129860. Each trade's post-fill-to-recorded-exit window complete; baseline lifecycle matched all8 statuses AND exit timestamps.

Script scripts/replay-discipline-target.mjs; source/outputs stored in /root/.hermes/backups/scalper-audit/{m1-discipline-cohort,target-sensitivity}.json.
- Original liquidity targets:0TP/8SL,-8R.
- Fixed2R hypothetical target:3TP/5SL,+1R gross.
- Three improve by3R; five unchanged. Median original RR12.1176.
- Naive paired sign test on3 non-tied outcomes gives two-sided p=.25, not evidence of significance; trades correlated and selected after outcomes.
- Same-entry exit sensitivity only: no detector re-run, no held-out period, no transaction costs. Uses existing skip-fill-candle semantics; OHLC cannot resolve ambiguous intrabar ordering. Not a complete strategy backtest.

Decision: do NOT deploy target changes based on these eight correlated known losers. Existing liquidity target remains production policy. Old2R experiment remains separate/unpushed, not promoted.

## Boundary candidate (delegated finding, tested and rejected)
Delegated lifecycle audit flagged discipline-lifecycle.mjs:41 fill-candle exclusion (`open_time > entryTime`) as a real behavioral difference from the generic lifecycle, with OHLC intrabar ambiguity noted. Pre-specified single-mutation test: include the fill candle (`>=`). Same locked8-entry replay: reproduced8/8 unchanged, slToTp0, tpToSl0, meetsAdoptionCriteria false. Reverted to baseline; recorded in /root/.hermes/backups/scalper-audit/boundary-variant.json. Exit evaluation boundary is not the historical loss driver for this cohort. Delegated SMR trace (signals.mjs→sweepAt:83→catch index.ts:209) and 7/7 combined focused tests match the deployed hotfix.

## Academy reference
app/src/main/assets/apps/academy/bagian-29-backtest-advanced/target-dan-partial-take-profit-mengelola-hasil-secara-objektif.html lines45–115,134–159: targets tied to structure/liquidity; internal objectives for TP1, external for later objectives; partial/full exits have tradeoffs. Current Discipline detector only targets PDH/PDL/Asia extrema, not internal swing objectives. This supports further study, not proof2R is best.

## Remaining
Broad causal audit of every low-WR model is incomplete. Legacy and current versions must remain separate. Detector confirmation, repeated-event exposure, delay/stale M1 data and intrabar fill handling require matching OHLC/warmup/version evidence. Current engine can report COMPLETED with market_refresh M1 source supabase-stale; completion is not guarantee of fresh ticks or profitability. Next evaluation should use prespecified unselected/held-out cohorts, costs and correlated-event accounting before strategy deployment. No APK bump needed for server-only hotfix.
