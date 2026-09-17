import {analyze,MODEL} from './engine.js';
import {loadCandles} from './data.js';
import {makeSnapshot} from './snapshot.js';
import {createPriceChart} from './chart-view.js';
const $=id=>document.getElementById(id);
const price=v=>Number.isFinite(v)?v.toFixed(2):'—';
const date=t=>t?new Date(t*1000).toLocaleString('id-ID',{timeZone:'Asia/Singapore',hour12:false})+' WITA':'—';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null, raw=null, controller=null, generation=0, timer=null;
let chart=null, scalperPlan=null;
try { chart=createPriceChart($('chart')); }
catch { $('chart').textContent='Chart tidak berhasil dimuat. Periksa bukti candle di tab analisis.'; }
function record(title,body){return `<div class="record"><strong>${escape(title)}</strong><p>${escape(body)}</p></div>`;}
function draw(result) {
  $('chart-caption').textContent=scalperPlan?`Scalper · ${scalperPlan.label}`:'Candle tertutup · model ICT';
  chart?.draw(result,scalperPlan||result.plan);
}
window.addEventListener('amyfx:scalper-chart-plan',event=>{scalperPlan=event.detail;if(current)draw(current);});
function render(result) {
  current=result;
  $('connection').textContent=result.fresh?'Candle terkini':'Data belum siap';
  $('signal').textContent=result.signal==='WAIT'?'WAIT':`${result.signal} LIMIT`;
  $('signal').dataset.side=result.signal;
  $('reason').textContent=result.reason;
  $('source').textContent=`Candle terakhir: ${date(result.sourceTime)} · ${result.tf} · ${result.candles.length} candle`;
  $('bias').textContent={BUY:'Bullish',SELL:'Bearish',WAIT:'Belum jelas'}[result.context.direction];
  $('session').textContent={LONDON:'London',NEW_YORK:'New York',OUTSIDE:'Di luar sesi',CLOSED:'Akhir pekan'}[result.session];
  $('stage').textContent={DATA:'Data',SWEEP:'Cari sweep',MSS:'Tunggu MSS',FVG:'Tunggu FVG',PENDING:'Tunggu retest',ACTIVE:'Sudah retest'}[result.stage]||result.stage;
  const p=result.plan;
  $('plan-state').textContent=p?`${p.direction} · ${p.status==='PENDING'?'Rencana limit, belum fill':'Fill simulasi teramati'}${result.fresh?'':' · Data terlambat'}`:'Belum ada rencana yang memenuhi seluruh aturan.';
  $('plan-levels').innerHTML=p?[['Entry',price(p.entry)],['Stop loss',price(p.sl)],['Target',price(p.tp)],['Reward/risk',p.rr.toFixed(2)+'R']].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join(''):'';
  $('plan-note').textContent=p?`Terbentuk ${date(p.createdAt)}. Level terkunci; tidak berubah mengikuti tick. ${p.filledAt?'Fill simulasi '+date(p.filledAt)+'.':''} Periksa spread dan berita sebelum memasang order.`:'WAIT adalah keputusan yang valid. Tidak ada level entry buatan.';
  $('checklist').innerHTML=[`${result.context.direction==='WAIT'?'○':'✓'} Struktur H1: ${$('bias').textContent}`,
    `${p?'✓':'○'} Sweep dan reclaim likuiditas`,`${p?'✓':'○'} Displacement + MSS terkonfirmasi`,
    `${p?'✓':'○'} FVG sesuai dealing range dan target ≥ 2R`,`${p?.filledAt?'✓':'○'} Retest setelah pembentukan FVG`].map(x=>`<li>${escape(x)}</li>`).join('');
  $('evidence').innerHTML=record('Struktur H1',`Break terakhir ${date(result.context.lastBreak?.brokenAt)} · level ${price(result.context.lastBreak?.level)}`)+
    record('Dealing range H1',`Low ${price(result.context.low)} · midpoint ${price(result.context.midpoint)} · high ${price(result.context.high)}`)+
    (p?record('Sweep',`${date(p.sweep.time)} · level ${price(p.sweep.level)} · wick ${price(p.sweep.extreme)}`)+
    record('MSS',`${date(p.mss.time)} · close melewati ${price(p.mss.level)}`)+record('FVG',`${price(p.fvg.low)}–${price(p.fvg.high)} · terbentuk ${date(p.createdAt)}`):record('Setup',result.reason));
  $('liquidity').innerHTML=result.levels.map(l=>record(l.kind==='high'?'Buy-side liquidity':'Sell-side liquidity',`${price(l.level)} · pivot ${date(l.time)} · konfirmasi ${date(l.confirmed)}`)).join('')||'<p>Belum ada level terkonfirmasi yang belum tersentuh.</p>';
  $('history').innerHTML=result.history.slice().reverse().slice(0,30).map(h=>record(`${h.direction} · ${h.status}`,`${date(h.createdAt)} · entry ${price(h.entry)} · SL ${price(h.sl)} · TP ${price(h.tp)}${Number.isFinite(h.r)?' · '+h.r.toFixed(2)+'R bruto':''}${h.ambiguous?' · urutan intrabar ambigu':''}`)).join('')||'<p>Belum ada setup selesai dalam jendela candle ini.</p>';
  draw(result);
  // New versioned snapshot: no legacy direction, forecast, or execution writers.
  window.AmyICTMapping=Object.freeze(makeSnapshot(result));
  try { localStorage.setItem('amyfx.ict.mapping.v1',JSON.stringify(window.AmyICTMapping)); } catch {}
  window.dispatchEvent(new CustomEvent('amyfx:ict-mapping-updated',{detail:window.AmyICTMapping}));
}
function schedule(){clearTimeout(timer);if(!document.hidden)timer=setTimeout(refresh,60000);}
async function refresh(){
  const id=++generation;controller?.abort();controller=new AbortController();
  const requestController=controller;
  const timeout=setTimeout(()=>requestController.abort(),20000), tf=$('timeframe').value;
  $('refresh').disabled=true; $('connection').textContent='Memperbarui';
  if(raw && raw.tf===tf)render(analyze({...raw,now:Date.now()/1000}));
  try{
    const [entry,context]=await Promise.all([loadCandles(tf,controller.signal),loadCandles('H1',controller.signal)]);
    if(id!==generation)return;
    raw={candles:entry.candles,context:context.candles,tf,degraded:entry.degraded||context.degraded};
    render(analyze({...raw,now:Date.now()/1000}));$('error').hidden=true;
  }catch(error){
    if(id!==generation)return;
    $('error').hidden=false;$('error').textContent='Candle belum berhasil diperbarui. Periksa koneksi lalu tekan Perbarui.';
    if(raw && raw.tf===tf){raw={...raw,degraded:true};render(analyze({...raw,now:Date.now()/1000}));}
    else render(analyze({candles:[],context:[],tf,now:Date.now()/1000}));
  }finally{clearTimeout(timeout);if(id===generation){$('refresh').disabled=false;schedule();}}
}
window.setTab=name=>{
  const tab=['Dashboard','Analyze','History'].includes(name)?name:'Analyze';
  document.querySelectorAll('.panel').forEach(el=>el.hidden=el.id!==tab);
  document.querySelectorAll('[data-tab]').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.tab===tab)));
  if(tab==='Dashboard')chart?.resize();
};
document.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>window.setTab(el.dataset.tab)));
$('refresh').addEventListener('click',refresh);
$('timeframe').addEventListener('change',()=>{raw=null;chart?.reset();$('tf-label').textContent=$('timeframe').value;
  render(analyze({candles:[],context:[],tf:$('timeframe').value,now:Date.now()/1000}));refresh();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){generation++;controller?.abort();clearTimeout(timer);}else refresh();});
window.addEventListener('pagehide',()=>{generation++;controller?.abort();clearTimeout(timer);});
window.addEventListener('pageshow',e=>{if(e.persisted)refresh();});
window.addEventListener('online',refresh);
window.setTab(new URLSearchParams(location.search).get('route')||location.hash.slice(1)||'Dashboard');
refresh();
