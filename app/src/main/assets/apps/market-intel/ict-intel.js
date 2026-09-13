import {analyze} from '../mapping/js/ict-workspace/engine.js';
import {loadCandles} from '../mapping/js/ict-workspace/data.js';
import {SNAPSHOT_KEY,makeSnapshot,validSnapshot,isFresh,liquidityBands,nearestLevels} from '../mapping/js/ict-workspace/snapshot.js';
const $=id=>document.getElementById(id);
const price=n=>Number.isFinite(n)?n.toFixed(2):'—';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=t=>t?new Date(t*1000).toLocaleString('id-ID',{timeZone:'Asia/Makassar',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false})+' WITA':'—';
let snapshot=null,request=null,controller=null,timer=null,failed=false,filter='all';
try { const cached=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'null');if(validSnapshot(cached))snapshot=cached; } catch {}
function paint() {
  const valid=validSnapshot(snapshot),fresh=isFresh(snapshot)&&!failed;
  const levels=nearestLevels(snapshot),bands=liquidityBands(snapshot),close=snapshot?.close;
  const status=valid?(fresh?'Candle terkini':'Referensi lama'):'Menunggu Mapping';
  $('market-command-strip').innerHTML=`<div class="amy-command-main"><span>XAU/USD · MAPPING ${escape(snapshot?.tf||'M15')}</span><strong>${price(close)}</strong><small>Penutupan candle · bukan tick live</small></div><div class="amy-command-metric"><small>BSL TERDEKAT</small><b class="red">${price(levels.bsl)}</b></div><div class="amy-command-metric"><small>SSL TERDEKAT</small><b class="green">${price(levels.ssl)}</b></div><div class="ict-source"><span>${status} · ${time(snapshot?.sourceTime)}</span><button type="button" data-ict-refresh ${request?'disabled':''}>${request?'Memperbarui…':'Perbarui'}</button></div>`;
  $('intel-briefing').innerHTML=`<div class="amy-briefing-title">Peta likuiditas Mapping</div><p>${valid?'Level swing terkonfirmasi yang belum tersentuh. BSL berada di atas referensi harga; SSL di bawahnya.':'Belum ada data Mapping yang dapat ditampilkan.'}</p><small>${failed?'Pembaruan gagal. Data terakhir tetap ditandai sebagai referensi lama.':'Harga, BSL dan SSL berasal dari candle dan model yang sama dengan Mapping.'}</small> <a href="../mapping/index.html#Analyze">Lihat bukti Mapping →</a>`;
  $('heatmap-price').textContent=`XAU/USD ${price(close)} · ${status}`;
  const count=bands.reduce((n,b)=>n+b.levels.length,0);
  for(const id of ['heatmap-status','liquidity-status'])$(id).textContent=`${status} · ${count} level · ${bands.length} zona · ${time(snapshot?.sourceTime)}`;
  const strongest=bands.slice().sort((a,b)=>b.levels.length-a.levels.length)[0];
  const max=Math.max(1,...bands.map(b=>b.levels.length));
  const range=b=>b.low===b.high?price(b.low):`${price(b.low)}–${price(b.high)}`;
  const row=b=>`<details class="ict-band ${b.type.toLowerCase()}"><summary><span class="ict-band-price"><strong>${range(b)}</strong><small>${b.type} · ${b.type==='BSL'?'+':''}${price((b.type==='BSL'?b.low:b.high)-close)} USD</small></span><span class="ict-band-density"><span class="ict-band-track"><i style="width:${b.levels.length/max*100}%"></i></span><small>${b.levels.length} level swing${b.levels.length===max&&max>1?' · Terpadat':''}</small></span></summary><div class="ict-band-detail">${b.levels.map(l=>`<p>${price(l.level)} · Konfirmasi ${time(l.confirmed)}</p>`).join('')}</div></details>`;
  const visible=bands.filter(b=>filter==='all'||b.type===filter);
  const above=visible.filter(b=>b.type==='BSL'),below=visible.filter(b=>b.type==='SSL');
  $('heatmap-canvas').innerHTML=`<div class="ict-heat-intro"><h2>Di mana level berkumpul?</h2><p>${strongest?(max>1?`Zona terpadat: ${strongest.type} ${range(strongest)} · ${max} level.`:'Setiap zona berisi satu level; belum ada konsentrasi yang dominan.'):'Belum ada level aktif yang dapat dipetakan.'}</p><small>Lebar batang membandingkan jumlah level. Pengelompokan maksimal $1 per zona; bukan volume order atau probabilitas.</small></div><div class="ict-heat-filters" role="group" aria-label="Filter sisi likuiditas">${[['all','Semua'],['BSL','Di atas · BSL'],['SSL','Di bawah · SSL']].map(([key,label])=>`<button type="button" data-ict-filter="${key}" aria-pressed="${filter===key}">${label}</button>`).join('')}</div>${above.map(row).join('')}<div class="ict-price-divider"><span>Referensi harga ${escape(snapshot?.tf||'')}</span><strong>${price(close)}</strong></div>${below.map(row).join('')}${!visible.length?'<p class="ict-empty">Tidak ada level untuk sisi ini dalam snapshot Mapping.</p>':''}`;
  $('liquidity-list').innerHTML=bands.length?bands.map(row).join(''):'<p class="ict-empty">Belum ada level belum tersentuh. Perbarui data atau buka Mapping.</p>';
}
async function refresh() {
  if(request)return request;
  controller=new AbortController();const activeController=controller;
  const timeout=setTimeout(()=>activeController.abort(),20000);
  const tf=snapshot?.tf||'M15';
  request=(async()=>{
    try {
      const [entry,context]=await Promise.all([loadCandles(tf,activeController.signal),loadCandles('H1',activeController.signal)]);
      if(activeController.signal.aborted)return;
      const next=makeSnapshot(analyze({candles:entry.candles,context:context.candles,tf,degraded:entry.degraded||context.degraded,now:Date.now()/1000}));
      if(!validSnapshot(next))throw new Error('Data Mapping belum cukup');
      if(snapshot?.tf===next.tf && snapshot.sourceTime>next.sourceTime)throw new Error('Respons lebih lama dari snapshot');
      snapshot=next;failed=false;
      try { localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(next)); } catch {}
      window.dispatchEvent(new CustomEvent('amyfx:ict-mapping-updated',{detail:next}));
    } catch { if(!document.hidden)failed=true; }
    finally { clearTimeout(timeout);request=null;paint(); }
  })();
  paint();return request;
}
window.AmyICTIntel=Object.freeze({refresh});
document.addEventListener('click',event=>{
  if(event.target.closest('[data-ict-refresh]'))refresh();
  const button=event.target.closest('[data-ict-filter]');if(button){filter=button.dataset.ictFilter;paint();}
});
window.addEventListener('storage',event=>{
  if(event.key!==SNAPSHOT_KEY)return;
  try { const next=JSON.parse(event.newValue);if(validSnapshot(next)){controller?.abort();snapshot=next;failed=false;paint();} } catch {}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)controller?.abort();else refresh();});
window.addEventListener('online',refresh);
window.addEventListener('pagehide',()=>{controller?.abort();clearInterval(timer);});
window.addEventListener('pageshow',event=>{if(event.persisted){startTimer();refresh();}});
function startTimer(){clearInterval(timer);timer=setInterval(()=>{if(!document.hidden)refresh();},60000);}
paint();startTimer();
