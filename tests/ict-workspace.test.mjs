import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {MODEL,normalize,session,analyze,advance,structure} from '../app/src/main/assets/apps/mapping/js/ict-workspace/engine.js';
import {loadCandles} from '../app/src/main/assets/apps/mapping/js/ict-workspace/data.js';
const root='app/src/main/assets/apps/mapping/';
const bar=(time,open=100,high=102,low=98,close=101)=>({time,open,high,low,close});
const t=Date.parse('2026-09-08T12:00:00Z')/1000;
const plan={id:'fixture',status:'PENDING',direction:'BUY',entry:100,sl:95,tp:112,risk:5,rr:2.4,createdAt:t,createdIndex:0};

test('normalization excludes open, future, synthetic and malformed data; orders timestamps',()=>{
 const rows=[bar(t),bar(t-300),{...bar(t-600),isClosed:false},{...bar(t-900),synthetic:true},bar(t+300),bar(t-1200,100,90)];
 const result=normalize(rows,'M5',t+310);
 assert.deepEqual(result.candles.map(c=>c.time),[t-300,t]);assert.equal(result.rejected,4);
 assert.throws(()=>normalize([bar(t),bar(t,101)],'M5',t+310),/duplikat/);
 assert.deepEqual(normalize([{...bar(t),time:String(t*1000)}],'M5',t+310).candles,[bar(t)]);
});
test('New York sessions adjust for DST and reject weekends',()=>{
 assert.equal(session(Date.parse('2026-01-06T12:30:00Z')/1000),'NEW_YORK');
 assert.equal(session(Date.parse('2026-07-07T11:30:00Z')/1000),'NEW_YORK');
 assert.equal(session(Date.parse('2026-07-07T14:00:00Z')/1000),'OUTSIDE');
 assert.equal(session(Date.parse('2026-09-12T12:00:00Z')/1000),'CLOSED');
});
test('plan cannot fill its creation candle; fill must come later',()=>{
 assert.equal(advance(plan,bar(t,101,111,96),0,300).status,'PENDING');
 const filled=advance(plan,bar(t+300,102,105,99),1,300);
 assert.equal(filled.status,'ACTIVE');assert.equal(filled.filledAt,t+300);assert.equal(filled.entry,100);
 const target=advance(filled,bar(t+600,105,113,101),2,300);
 assert.equal(target.status,'TP');assert.equal(target.r,2.4);
 assert.deepEqual(advance(target,bar(t+900,95,100,90),3,300),target);
});
test('ambiguous and gap execution never fabricate wins',()=>{
 assert.equal(advance(plan,bar(t+300,102,113,99),1,300).status,'AMBIGUOUS');
 assert.equal(advance(plan,bar(t+300,102,113,94),1,300).status,'SL');
 assert.equal(advance(plan,bar(t+300,94,102,93),1,300).status,'INVALIDATED');
 const active={...plan,status:'ACTIVE',filledAt:t,fillIndex:0};
 const loss=advance(active,bar(t+300,90,94,89),1,300);assert.equal(loss.r,-2);
 const sell={...active,direction:'SELL',sl:105,tp:88};
 assert.equal(advance(sell,bar(t+300,101,106,87),1,300).status,'SL');
});
test('pending expiry, session end and time exit are explicit',()=>{
 assert.equal(advance(plan,bar(t+300),13,300).status,'EXPIRED');
 assert.equal(advance(plan,bar(Date.parse('2026-09-08T14:00:00Z')/1000),1,300).status,'EXPIRED');
 assert.equal(advance({...plan,status:'ACTIVE',filledAt:t,fillIndex:0},bar(t+300,101,103,99,102),48,300).status,'TIME_EXIT');
});
test('missing history returns WAIT without invented levels',()=>{
 const result=analyze({candles:[],context:[],now:t});
 assert.equal(result.signal,'WAIT');assert.equal(result.plan,null);assert.equal(result.fresh,false);
});
test('structure requires confirmed pivot and closing break, not price location',()=>{
 const cs=[bar(t,100,101,99,100),bar(t+3600,100,103,98,100),bar(t+7200,100,105,97,100),bar(t+10800,100,103,98,100),bar(t+14400,100,102,99,100)];
 assert.equal(structure(cs).direction,'WAIT');
 assert.equal(structure([...cs,bar(t+18000,101,107,100,106)]).direction,'BUY');
 assert.equal(structure([...cs,bar(t+18000,100,106,99,101)]).direction,'WAIT');
});
test('provider rejects errors and preserves staleness metadata',async()=>{
 const response=data=>async()=>({ok:true,json:async()=>data});
 await assert.rejects(loadCandles('M5',null,response({status:'error',message:'bad'})));
 await assert.rejects(loadCandles('M5',null,async()=>({ok:false,status:429})));
 const got=await loadCandles('M5',null,response({values:[bar(t)],source:'stale-cache'}));
 assert.equal(got.degraded,true);assert.deepEqual(got.candles,[bar(t)]);
});
test('production page has one engine authority, complete local assets and accessible navigation',()=>{
 const html=readFileSync(root+'index.html','utf8');
 const app=readFileSync(root+'js/ict-workspace/app.js','utf8');
 const scripts=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(scripts.filter(s=>s.includes('ict-workspace/app.js')).length,1);
 for(const old of ['js/main.js','mapping-v2.js','entry-watch-runtime','scalper-entry-watch','blueprint-v1.js','mapping-runtime-repair'])assert.ok(!scripts.some(s=>s.includes(old)));
 for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g))if(!/^https?:|#/.test(m[1]))assert.ok(existsSync(resolve(root,m[1])),m[1]);
 for(const tab of ['Dashboard','Analyze','History'])assert.ok(html.includes(`id="${tab}"`));
 assert.match(html,/aria-label="Kembali ke beranda"/);assert.match(html,/role="alert"/);
 assert.match(app,/id!==generation/);assert.match(app,/controller\?\.abort/);
 assert.match(app,/degraded:true/);assert.match(app,/visibilitychange/);
 assert.doesNotMatch(app,/setInterval|Math\.random|startBackgroundScanner/);
 assert.doesNotMatch(html,/Bukan transaksi akun/);assert.doesNotMatch(html,/spread, komisi/);
 assert.match(html,/class="model-context analysis-secondary"/);
 assert.match(html,/Struktur → sweep → MSS → FVG/);
 assert.match(app,/slice\(0,6\)/);
});
function scenario(){
 const start=t-38*300;
 const cs=Array.from({length:39},(_,i)=>bar(start+i*300,100,102,98,100));
 cs[10]=bar(start+10*300,100,130,98,100);
 cs[30]=bar(start+30*300,99,101,95,100);
 cs[33]=bar(start+33*300,100,105,98,101);
 cs[36]=bar(start+36*300,99,100,94,99);
 cs[37]=bar(start+37*300,99,112,98,111);
 cs[38]=bar(start+38*300,110,113,108,112);
 const hs=Array.from({length:50},(_,i)=>bar(t-45*3600+i*3600,120,122,118,120));
 hs[25]=bar(hs[25].time,120,150,118,120);
 hs[30]=bar(hs[30].time,120,122,80,120);
 hs[35]=bar(hs[35].time,120,152,119,151);
 for(let i=36;i<hs.length;i++)hs[i]=bar(hs[i].time,151,152,149,151);
 cs.unshift(...Array.from({length:10},(_,i)=>bar(start-(10-i)*300,100,102,98,100)));
 return {cs,hs};
}
test('complete causal sequence produces a limit plan with immutable evidence and later fill',()=>{
 const {cs,hs}=scenario(); const now=t+310;
 const result=analyze({candles:cs,context:hs,tf:'M5',now});
 assert.equal(result.context.direction,'BUY');
 assert.ok(result.plan,JSON.stringify({stage:result.stage,reason:result.reason,history:result.history}));
 assert.equal(result.plan.status,'PENDING');assert.equal(result.signal,'BUY');
 assert.ok(result.plan.sweep.time<result.plan.mss.time);
 assert.ok(result.plan.mss.time<result.plan.createdAt);
 assert.ok(result.plan.sl<result.plan.entry && result.plan.entry<result.plan.tp);
 assert.ok(result.plan.rr>=2);assert.equal(result.plan.tp,130);
 const next=bar(t+300,110,112,103,106);
 const filled=analyze({candles:[...cs,next],context:hs,tf:'M5',now:t+610});
 assert.equal(filled.plan.status,'ACTIVE');assert.equal(filled.signal,'WAIT');
 assert.equal(filled.plan.id,result.plan.id);assert.equal(filled.plan.entry,result.plan.entry);
 const stale=analyze({candles:cs,context:hs,tf:'M5',now:t+1000});
 assert.equal(stale.signal,'WAIT');assert.equal(stale.fresh,false);
 const degraded=analyze({candles:cs,context:hs,tf:'M5',now,degraded:true});assert.equal(degraded.signal,'WAIT');
});
test('future candles cannot change a historical decision; gap cancels pending plan',()=>{
 const {cs,hs}=scenario();const now=t+310;
 const original=analyze({candles:cs,context:hs,tf:'M5',now});
 const future=analyze({candles:[...cs,bar(t+300,100,200,50,150)],context:[...hs,bar(t+20*3600,120,300,50,200)],tf:'M5',now});
 assert.deepEqual(future.plan,original.plan);
 const gap=analyze({candles:[...cs,bar(t+600,110,112,103,106)],context:hs,tf:'M5',now:t+910});
 assert.equal(gap.plan,null);assert.equal(gap.history.at(-1).status,'DATA_GAP');
});
test('mirrored SELL setup follows the same rules; no one-sided suppression',()=>{
 const {cs,hs}=scenario();
 const mirror=c=>({...c,open:300-c.open,high:300-c.low,low:300-c.high,close:300-c.close});
 const result=analyze({candles:cs.map(mirror),context:hs.map(mirror),tf:'M5',now:t+310});
 assert.equal(result.signal,'SELL');assert.ok(result.plan.sl>result.plan.entry);
 assert.equal(result.plan.tp,170);assert.ok(result.plan.rr>=MODEL.minRR);
});
test('no FVG and insufficient nearest-target reward both stay WAIT',()=>{
 const {cs,hs}=scenario();
 const noGap=cs.map(c=>({...c}));noGap[noGap.length-1].low=99;
 assert.equal(analyze({candles:noGap,context:hs,tf:'M5',now:t+310}).plan,null);
 const closeTarget=cs.map(c=>({...c}));closeTarget[20].high=115;
 assert.equal(analyze({candles:closeTarget,context:hs,tf:'M5',now:t+310}).plan,null);
});
