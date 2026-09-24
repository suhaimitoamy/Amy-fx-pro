import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildMarketContext,confirmation,liquidity,structure,zones} from '../supabase/functions/scalper-engine/market-context.mjs';
import {currentContext} from '../app/src/main/assets/apps/mapping/js/ict-workspace/context-model.js';

const now=Date.parse('2026-09-24T12:37:00Z')/1000;
function candles(seconds,count,base,drift,amplitude){
  return Array.from({length:count},(_,i)=>{
    const close=base+i*drift+Math.sin(i*Math.PI/4)*amplitude;
    const open=close-drift*0.3,open_time=Math.floor(now/seconds)*seconds-(count-i)*seconds;
    return {open_time,close_time:open_time+seconds,open,high:Math.max(open,close)+0.4,low:Math.min(open,close)-0.4,close,is_closed:true};
  });
}
const input=()=>({nowSeconds:now,h1:candles(3600,60,3300,.25,2),m15:candles(900,100,3345,-.18,1.8),
  m1:candles(60,80,3325,-.04,.7),d1:candles(86400,10,3290,1,2)});

test('M15 reversal raises an early warning while H1 remains bullish, never a buy order',()=>{
  const context=buildMarketContext(input());
  assert.equal(context.h1.bias,'BULLISH');
  assert.equal(context.m15.control,'SELLER');
  assert.equal(context.h1.health,'WEAKENING');
  assert.equal(context.m15.opposingControl,true);
  assert.equal(context.execution.status,'NOT READY');
  assert.equal(context.primary.side,'BUY');
  assert.equal(context.alternative.side,'SELL');
  assert.match(context.event.title,/M15 berlawanan H1/);
  assert.ok(context.alternative.activation.some(x=>x.includes(context.primary.invalidation.toFixed(2))));
  assert.equal(context.news.status,'UNVERIFIED');
});

test('historical structure break classification cannot read swings confirmed later',()=>{
  const base=now-6*3600;
  const closes=[100,100,106,103,103,103];
  const bars=closes.map((close,i)=>({open_time:base+i*3600,close_time:base+(i+1)*3600,
    open:close,high:close+1,low:close-1,close}));
  const highs=[{level:105,index:0,confirmedAt:bars[1].close_time},
    {level:104,index:3,confirmedAt:bars[4].close_time},
    {level:103,index:4,confirmedAt:bars[5].close_time}];
  const result=structure(bars,{highs,lows:[]});
  assert.equal(result.lastBreak?.time,bars[2].close_time);
  assert.equal(result.lastBreak?.type,'BOS');
});

test('stale and malformed candles cannot produce scenarios or notifications',()=>{
  const data=input();data.nowSeconds+=5*3600;
  const result=buildMarketContext(data);
  assert.equal(result.fresh,false);assert.equal(result.primary,null);assert.equal(result.event,null);
  assert.equal(result.execution.status,'NOT READY');
  const poisoned=input();poisoned.m1=poisoned.m1.map(x=>({...x,is_closed:false}));
  assert.equal(buildMarketContext(poisoned).fresh,false);
});

test('FVG lifecycle uses subsequent closed candles; broken zone is invalid',()=>{
  const base=now-8*900;
  const bar=(i,low,high,close)=>({open_time:base+i*900,close_time:base+(i+1)*900,open:close,low,high,close,is_closed:true});
  const rows=[bar(0,99,101,100),bar(1,100,102,101),bar(2,103,105,104)];
  assert.equal(zones(rows).find(z=>z.kind==='FVG')?.lifecycle,'FRESH');
  assert.equal(zones([...rows,bar(3,102.2,104,103.5)]).find(z=>z.kind==='FVG')?.lifecycle,'TESTED');
  assert.equal(zones([...rows,bar(3,99.5,104,100)]).find(z=>z.kind==='FVG')?.lifecycle,'INVALID');
});

test('M1 requires area contact, sweep, break and micro FVG for confirmation',()=>{
  const start=now-40*60;
  const base=Array.from({length:35},(_,i)=>({open_time:start+i*60,close_time:start+(i+1)*60,open:102,high:103,low:101,close:102,is_closed:true}));
  const bar=(i,open,high,low,close)=>({open_time:start+i*60,close_time:start+(i+1)*60,open,high,low,close,is_closed:true});
  const zone={formedAt:start,low:99,high:104};
  assert.equal(confirmation(base,null,'BUY').status,'WAITING');
  const sweep=bar(35,102,103,98,102);
  assert.equal(confirmation([...base,sweep],zone,'BUY').status,'CONFIRMING');
  const breakBar=bar(36,102,107,101,106),fvg=bar(37,106,110,104,109);
  const result=confirmation([...base,sweep,breakBar,fvg],zone,'BUY');
  assert.equal(result.status,'CONFIRMED');assert.equal(result.sweep.level,101);
  assert.ok(result.mss.level>=103);assert.ok(result.microFvg.low<result.microFvg.high);
  assert.equal(confirmation([...base,sweep,breakBar,fvg,bar(38,109,109,97,98)],zone,'BUY').status,'FAILED');
});

test('liquidity already raided remains taken after price pulls back',()=>{
  const base=now-4*900;
  const m15=[{open_time:base,close_time:base+900,open:100,high:105,low:99,close:104},
    {open_time:base+900,close_time:base+1800,open:104,high:107,low:101,close:102},
    {open_time:base+1800,close_time:base+2700,open:102,high:103,low:100,close:101}];
  const d1=[{open_time:base-86400,close_time:base,high:106,low:98}];
  assert.equal(liquidity(m15,d1,undefined,now).find(l=>l.label==='PDH').status,'TAKEN');
});

test('previous closed daily candle is PDH/PDL and context expires without server heartbeat',()=>{
  const data=input(),levels=liquidity(data.m15,data.d1,undefined,now);
  assert.equal(levels.find(l=>l.label==='PDH').level,Math.round(data.d1.at(-1).high*100)/100);
  const context=buildMarketContext(data),stamp=new Date(now*1000).toISOString();
  const payload={ok:true,mode:'market_context',context,engine:{status:'COMPLETED',completed_at:stamp,result:{engine:'amyfx-gold-context-v1'}}};
  assert.equal(currentContext(payload,now*1000),context);
  assert.equal(currentContext({...payload,engine:{...payload.engine,status:'FAILED'}},now*1000),null);
  assert.equal(currentContext(payload,now*1000+181000),null);
});

test('active path no longer inserts trade setups or sends legacy setup notifications',()=>{
  const engine=readFileSync('supabase/functions/scalper-engine/index.ts','utf8');
  const push=readFileSync('supabase/functions/scalper-system-push/index.ts','utf8');
  const mapping=readFileSync('app/src/main/assets/apps/mapping/index.html','utf8');
  assert.doesNotMatch(engine,/amyfx_preview_scalper_setups\?on_conflict|evaluateScalperCandidates/);
  assert.doesNotMatch(push,/amyfx_preview_scalper_events\?/);
  assert.match(push,/notification_type:'market_context'/);
  assert.match(push,/Number\(match\[1\]\)>=357/);
  assert.match(push,/Math\.abs\(Date\.now\(\)\/1000-sourceM1\)>180/);
  assert.doesNotMatch(mapping,/scalper-panel\.js|id="signal"|Rencana entry/);
  assert.match(mapping,/context-panel\.js/);
});
