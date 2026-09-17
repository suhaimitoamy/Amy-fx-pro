// Same-entry target sensitivity only, not a detector backtest or held-out validation.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {advanceSetupLifecycle} from '../supabase/functions/scalper-engine/discipline-lifecycle.mjs';
const [historyPath,candlesPath,outputPath]=process.argv.slice(2);
if(!outputPath)throw Error('Usage: node scripts/replay-discipline-target.mjs history.json candles.json output.json');
const history=JSON.parse(readFileSync(historyPath));
const raw=JSON.parse(readFileSync(candlesPath));
const candles=raw.map(c=>Object.fromEntries(Object.entries(c).map(([k,v])=>[k,k==='is_closed'?v:Number(v)])));
assert.equal(new Set(candles.map(c=>c.open_time)).size,candles.length);
assert.ok(candles.every(c=>c.is_closed===true&&[c.open_time,c.close_time,c.open,c.high,c.low,c.close].every(Number.isFinite)&&c.close_time===c.open_time+60&&c.high>=Math.max(c.open,c.close)&&c.low<=Math.min(c.open,c.close)));
const selected=[...new Map(history.history.map(r=>[r.id,r])).values()].filter(r=>r.driverId==='DISCIPLINE_SCALPER'&&r.timeframe==='M15'&&['TP_HIT','SL_HIT'].includes(r.status));
const results=selected.map(r=>{
 const sign=r.direction==='BUY'?1:-1,risk=(r.entry-r.initialStopLoss)*sign;
 assert.ok(risk>0);
 const bars=candles.filter(c=>c.open_time>r.entryTimestamp&&c.close_time<=r.exitTime);
 const required=(r.exitTime-r.entryTimestamp)/60-1;
 const missing=[];
 const times=new Set(bars.map(c=>c.open_time));
 for(let t=r.entryTimestamp+60;t<r.exitTime;t+=60)if(!times.has(t))missing.push(t);
 if(missing.length||bars.length!==required)return {id:r.id,coverage:false,missing,required,available:bars.length};
 const setup={driver_id:r.driverId,direction:r.direction,status:'ACTIVE',entry_price:r.entry,entry_candle_open_time:r.entryTimestamp,initial_stop_loss:r.initialStopLoss,stop_loss:r.initialStopLoss,target_price:r.target,risk,quality:{entry_locked:true,max_hold_seconds:r.maxHoldSeconds},last_evaluated_open_time:null};
 const baseline=advanceSetupLifecycle(setup,bars).setup;
 const variant=advanceSetupLifecycle({...setup,target_price:r.entry+sign*2*risk},bars).setup;
 return {id:r.id,coverage:true,originalStatus:r.status,baselineStatus:baseline.status,baselineExitTime:baseline.exit_time,originalExitTime:r.exitTime,baselineMatches:baseline.status===r.status&&baseline.exit_time===r.exitTime,baselineR:baseline.result_r,variantStatus:variant.status,variantR:variant.result_r,initialRR:(r.target-r.entry)*sign/risk};
});
assert.equal(results.length,selected.length);
const summary={scope:history.deviceScope,cohort:results.length,complete:results.filter(r=>r.coverage).length,matched:results.filter(r=>r.baselineMatches).length,results,note:'Gross same-entry sensitivity, excluding fill candle per existing lifecycle. Missing bars are not invented. Sample selected after known losses; no held-out validation, spread/slippage or detector changes.'};
writeFileSync(outputPath,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
