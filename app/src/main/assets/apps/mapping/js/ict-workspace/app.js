import {loadCandles} from './data.js';
import {normalize} from './engine.js';
import {createPriceChart} from './chart-view.js';
const $=id=>document.getElementById(id);
let chart=null,controller=null,generation=0,timer=null,overlay=null,raw=null;
try{chart=createPriceChart($('chart'));}catch{$('chart').textContent='Peta harga belum tersedia. Bukti struktur tetap dapat dibaca.';}
// A cached trade plan from the previous application version must not be served as current context.
try{localStorage.removeItem('amyfx.ict.mapping.v1');}catch{}
function draw(){
  const tf=$('timeframe').value,candles=raw?.tf===tf?normalize(raw.values,tf,Date.now()/1000).candles:[];
  chart?.draw({tf,candles,plan:null},overlay);
  const last=candles.at(-1),duration=tf==='M1'?60:900;
  $('source').textContent=last?`Candle ${tf} terakhir ditutup ${new Date((last.time+duration)*1000).toLocaleString('id-ID',{timeZone:'Asia/Makassar',hour12:false})} WITA`:'Menunggu candle tertutup.';
  $('chart-caption').textContent=last?'Candle tertutup · referensi':'Belum ada candle valid';
}
window.addEventListener('amyfx:market-context',event=>{const scenario=event.detail?.primary;
  overlay=scenario?.area?{area:scenario.area,invalidation:scenario.invalidation,target:scenario.target}:null;draw();});
function schedule(){clearTimeout(timer);if(!document.hidden)timer=setTimeout(refresh,60000);}
async function refresh(){
  const id=++generation;controller?.abort();controller=new AbortController();const request=controller;
  const timeout=setTimeout(()=>request.abort(),20000),tf=$('timeframe').value;
  $('refresh').disabled=true;
  try{
    const response=await loadCandles(tf,request.signal);
    if(id!==generation)return;
    raw={tf,values:response.candles};draw();$('error').hidden=true;
    if(response.degraded){$('error').hidden=false;$('error').textContent='Sumber chart menggunakan cache lama; tinjau waktu candle sebelum membaca area.';}
  }catch{
    if(id!==generation)return;
    $('error').hidden=false;$('error').textContent='Peta harga belum berhasil diperbarui. Konteks server ditampilkan terpisah.';
    if(raw?.tf===tf)draw();
  }finally{clearTimeout(timeout);if(id===generation){$('refresh').disabled=false;schedule();}}
}
window.setTab=name=>{
  const tab=['Dashboard','Analyze','History'].includes(name)?name:'Dashboard';
  document.querySelectorAll('.panel').forEach(el=>el.hidden=el.id!==tab);
  document.querySelectorAll('[data-tab]').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.tab===tab)));
  if(tab==='Dashboard')chart?.resize();
};
document.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>window.setTab(el.dataset.tab)));
$('refresh').addEventListener('click',()=>{refresh();window.dispatchEvent(new CustomEvent('amyfx:refresh-context'));});
$('timeframe').addEventListener('change',()=>{raw=null;chart?.reset();draw();refresh();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){generation++;controller?.abort();clearTimeout(timer);}else refresh();});
window.addEventListener('pagehide',()=>{generation++;controller?.abort();clearTimeout(timer);});
window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});
window.addEventListener('online',refresh);
window.setTab(new URLSearchParams(location.search).get('route')||location.hash.slice(1)||'Dashboard');
draw();refresh();
