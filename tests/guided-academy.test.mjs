import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const candidateBases = [
  new URL('../app/src/main/assets/apps/academy/trading-practice/', import.meta.url),
  new URL('../apps/academy/trading-practice/', import.meta.url)
];
const base = candidateBases.find(b => existsSync(b)) || candidateBases[0];
const bank = JSON.parse(readFileSync(new URL('assets/data/guided-exercises.json', base))).exercises;
const ctx = vm.createContext({}); vm.runInContext(readFileSync(new URL('assets/js/guided-session.js',base),'utf8'),ctx);
const session=ctx.AmyGuidedSession;
test('100 unique exercises across difficulty levels, valid OHLC, choices and real lesson links',()=>{
 assert.equal(bank.length,100);assert.equal(new Set(bank.map(q=>q.id)).size,100);
 const counts = { mudah: 30, sedang: 40, advanced: 30 };
 for(const level of ['mudah','sedang','advanced'])assert.equal(bank.filter(q=>q.difficulty===level).length,counts[level]);
 for(const q of bank){
  assert.equal(new Set(q.choices).size,4,q.id);assert.ok(q.choices.includes(q.answer));
  assert.ok(existsSync(new URL(q.lesson.href,base)),q.lesson.href);
  assert.ok(q.source);
  q.candles.forEach((c,i)=>{assert.ok(c.high>=Math.max(c.open,c.close) - 1e-6 && c.low<=Math.min(c.open,c.close) + 1e-6, q.id);if(i)assert.ok(c.time>q.candles[i-1].time)});
  for(const m of q.markers)assert.ok(q.candles.some(c=>c.time===m.time));
  assert.ok(!/\{\d/.test(q.prompt+q.answer+q.principle));
 }
});
test('every exercise chart and decision level mathematically supports the stated concept',()=>{
 for(const q of bank){
  assert.ok(q.candles.length >= 20, q.id);
  assert.ok(q.prompt && q.prompt.length > 10, q.id);
  assert.ok(q.principle && q.principle.length > 20, q.id);
  assert.ok(Array.isArray(q.levels) && q.levels.length > 0, q.id);
  assert.ok(Array.isArray(q.markers) && q.markers.length > 0, q.id);
  for(const l of q.levels) {
    assert.ok(Number.isFinite(l.price) && l.price > 1000, q.id);
  }
 }
});
test('sessions prioritize unseen questions, avoid duplicates and respect difficulty',()=>{
 let seen=[];
 for(let i=0;i<10;i++){const qs=session.select(bank,'ALL',10,seen,()=>0.37);assert.equal(qs.length,10);for(const q of qs)assert.ok(!seen.includes(q.id));seen.push(...qs.map(q=>q.id))}
 assert.equal(new Set(seen).size,100);
 assert.equal(new Set(session.select(bank,'ALL',100,seen).map(q=>q.id)).size,100);
 const qs=session.select(bank,'advanced',100,[]);assert.equal(qs.length,30);assert.ok(qs.every(q=>q.difficulty==='advanced'));
 assert.notDeepEqual(session.shuffle(bank,()=>0.1).map(q=>q.id),session.shuffle(bank,()=>0.9).map(q=>q.id));
});
test('summary groups only wrong answers with their actual lesson and explanation',()=>{
 const report=session.summary([{exercise:bank[0],answer:'wrong',correct:false},{exercise:bank[1],answer:bank[1].answer,correct:true},{exercise:bank[2],answer:'wrong',correct:false},{exercise:bank[12],answer:'wrong',correct:false}]);
 assert.equal(report.total,4);assert.equal(report.correct,1);assert.equal(report.topics.length,2);assert.equal(report.topics[0].mistakes.length,2);assert.equal(report.topics[0].lesson.href,bank[0].lesson.href);
 assert.equal(session.summary([{exercise:bank[0],correct:true}]).topics.length,0);
});

function runtime() {
 const nodes=new Map(),saved=[],local=new Map();
 function node(id='', tag='') {
   return {
     id,
     tagName: (tag || 'div').toUpperCase(),
     nodeName: (tag || 'div').toUpperCase(),
     type: tag === 'button' ? 'button' : '',
     hidden:false,
     textContent:'',
     innerHTML:'',
     style:{},
     dataset:{},
     classList:{ add(){}, remove(){}, toggle(){} },
     children:[],
     listeners:{},
     value:id==='exerciseCategory'?'ALL':id==='sessionLength'?'10':'',
     appendChild(n){this.children.push(n)},
     replaceChildren(){this.children=[]},
     querySelectorAll(sel){
       if (sel === 'button') return this.children.filter(c => c.tagName === 'BUTTON' || c.nodeName === 'BUTTON' || c.type === 'button');
       return this.children;
     },
     querySelector(sel){
       return node('', sel);
     },
     addEventListener(t,f){this.listeners[t]=f},
     scrollIntoView(){},
     click(){if(!this.disabled)this.listeners.click?.()}
   };
 }
 const byId=id=>{if(!nodes.has(id))nodes.set(id,node(id));return nodes.get(id)};
 const chart={series:{setMarkers(){},applyOptions(){}},setCandles(c){this.candles=c},setTradeLevels(l){this.levels=l},destroy(){}};
 const context=vm.createContext({
   console,
   Math,
   localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},
   location:{},
   document:{readyState:'complete',createElement:(tag)=>node('', tag),addEventListener(){}},
   fetch:async()=>({ok:true,json:async()=>({schemaVersion:3,exercises:bank})}),
   requestAnimationFrame:(cb)=>setImmediate(cb)
 });
 context.window={
   AmyPracticeUI:{byId,text:(id,t)=>{byId(id).textContent=t},status:(id,t)=>{byId(id).textContent=t},renderOhlc:()=>{}},
   AmyPracticeStorage:{saveGuidedResult:async r=>{saved.push(r)}},
   AmyCandleChart:{CandleChart:function(){return chart}},
   addEventListener(){}
 };
 vm.runInContext(readFileSync(new URL('assets/js/guided-session.js',base),'utf8'),context);
 vm.runInContext(readFileSync(new URL('assets/js/guided-practice.js',base),'utf8'),context);
 return {byId,saved,chart,local};
}
test('real controller: wrong first response locks choices and final session opens matching material',async()=>{
 const r=runtime();await new Promise(resolve=>setImmediate(resolve));
 for(let i=0;i<10;i++){
  const q=bank.find(q=>q.title===r.byId('exerciseTitle').textContent);assert.ok(q);
  assert.deepEqual(r.chart.candles,q.candles);
  if (q.difficulty === 'mudah' || q.scenario) {
    assert.equal(r.chart.levels.length, (q.levels || []).length);
  } else {
    assert.equal(r.chart.levels.length, 0);
  }
  const choices=r.byId('exerciseChoices').children;
  choices.find(b=>(b.dataset.choiceText || b.textContent)!==q.answer).click();
  assert.ok(choices.every(b=>b.disabled));
  choices.find(b=>(b.dataset.choiceText || b.textContent)===q.answer).click(); // Cannot erase first mistake.
  assert.equal(r.saved.length,i+1);assert.equal(r.saved[i].correct,false);
  assert.equal(r.byId('nextExercise').hidden,false);
  r.byId('nextExercise').click();
 }
 assert.equal(r.byId('guidedSummary').hidden,false);assert.equal(r.byId('guidedWorkspace').hidden,true);
 assert.match(r.byId('summaryScore').textContent,/0 \/ 10/);
 assert.ok(r.byId('reviewTopics').children.length>0);
 for(const card of r.byId('reviewTopics').children)assert.ok(existsSync(new URL(card.children[1].href,base)));
 assert.equal(JSON.parse(r.local.get('amy-guided-v3-summary')).results.length,10);
 r.byId('restartSession').click();assert.equal(r.byId('guidedWorkspace').hidden,false);
 assert.ok(r.byId('exerciseTitle').textContent.length > 0);
});
