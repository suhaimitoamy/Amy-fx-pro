import {deviceHeaders} from '../method-toggles.js';
import {ENDPOINT} from './scalper-model.js';
import {currentContext} from './context-model.js';

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=value=>Number.isFinite(Number(value))&&value!=null?Number(value).toFixed(2):'—';
const time=value=>value?new Date(Number(value)*1000).toLocaleString('id-ID',{timeZone:'Asia/Makassar',hour12:false})+' WITA':'—';
const id=value=>({BULLISH:'NAIK',BEARISH:'TURUN',NEUTRAL:'NETRAL',HEALTHY:'KUAT',WEAKENING:'MELEMAH',INVALIDATED:'BATAL',
  BUYER:'PEMBELI',SELLER:'PENJUAL',BALANCED:'SEIMBANG',WAITING:'MENUNGGU',CONFIRMING:'SEDANG DIKONFIRMASI',
  CONFIRMED:'TERKONFIRMASI',FAILED:'GAGAL','NOT READY':'BELUM SIAP','READY TO REVIEW':'SIAP DITINJAU',
  'WAITING CONFIRMATION':'MENUNGGU KONFIRMASI','NO VALID POI':'AREA BELUM VALID',FRESH:'SEGAR',TESTED:'SUDAH DIUJI',
  MITIGATED:'TERPAKAI',INVALID:'BATAL','HIGH VOLATILITY':'VOLATILITAS TINGGI',UNKNOWN:'BELUM DIKETAHUI'})[value]||value||'—';
let payload=null,failed=false,request=null,generation=0,timer=null;
const row=(label,value)=>`<div class="record"><strong>${esc(label)}</strong><p>${esc(value)}</p></div>`;
function scenario(s,alternative=false){
  if(!s)return '<p>Menunggu struktur dan zona M15 yang tervalidasi.</p>';
  const ceStr = s.area?.ce ? ` (50% CE: ${number(s.area.ce)})` : '';
  return `<h3 data-side="${esc(s.side)}">${esc(s.label)}</h3><p>${esc(s.reasons?.join(' · ')||'')}</p>`+
    `<dl><div><dt>Area M15</dt><dd>${s.area?`${number(s.area.low)}–${number(s.area.high)}${ceStr}`:'Belum ada POI'}</dd></div>`+
    `<div><dt>Invalidasi</dt><dd>${number(s.invalidation)}</dd></div><div><dt>Likuiditas berikutnya</dt><dd>${number(s.target)}</dd></div></dl>`+
    `<p>${esc(alternative?'Aktif setelah seluruh syarat alternatif terpenuhi.':s.waiting)}</p>`+
    (alternative&&s.activation?`<ul>${s.activation.map(rule=>`<li>${esc(rule)}</li>`).join('')}</ul>`:'');
}
const DEFAULT_TOURNAMENT_DRIVERS = [
  { id: 'HIGH_WINRATE_SNIPER_70', name: 'High-WR Sniper (Deep OTE)', rr: 0.8, score: 0, status: 'STANDBY', desc: 'Diskon 75%–78.6% OTE · Quick Scalp 0.8R · SL Ketat' },
  { id: 'AI_ADAPTIVE_SMART_DRIVER', name: 'Adaptive Smart Driver', rr: 1.6, score: 0, status: 'STANDBY', desc: 'Runner Trend 1.6R · Trailing Breakeven 0.8R' },
  { id: 'SWING_CHOCH_OTE', name: 'Swing CHoCH + OTE', rr: 0.8, score: 0, status: 'STANDBY', desc: 'Displacement 2x ATR · 75% Fib Entry Level' },
  { id: 'MULTI_DRIVER_ENSEMBLE', name: 'Multi-Driver Ensemble', rr: 0.8, score: 0, status: 'STANDBY', desc: 'Confluence Mesh 72.5% Fib · Min ATR 2.5' },
  { id: 'CONSERVATIVE_SHIELD', name: 'Conservative Shield', rr: 0.7, score: 0, status: 'STANDBY', desc: 'Ultra-Filtered Swing · Low Drawdown Shield' },
  { id: 'HUMAN_MTF_RAPID_SCALPER', name: 'Human MTF Rapid Scalper', rr: 1.3, score: 0, status: 'STANDBY', desc: 'Sesi London & NY · RR model 1.3R · Cut Loss model -0.35R' }
];
function getTournamentDrivers(history = []) {
  const seen = new Set();
  const rows = (Array.isArray(history) ? history : []).filter(s => s?.id && s.symbol === 'XAU/USD' &&
    !seen.has(s.id) && seen.add(s.id));
  return DEFAULT_TOURNAMENT_DRIVERS.map(driver => {
    const results = rows.filter(s => (s.driverId || s.model) === driver.id && ['TP_HIT','SL_HIT'].includes(s.status));
    const wins = results.filter(s => s.status === 'TP_HIT').length;
    return {...driver, score:wins*10-(results.length-wins)*15,
      archiveWR:results.length ? (wins/results.length*100).toFixed(1) : null, samples:results.length};
  });
}
function renderTournament(c) {
  const container = $('driver-tournament-list'), badge = $('tournament-leader-badge');
  if (!container) return;
  const status = !c ? 'WAIT · DATA BELUM SIAP' : c.news?.status === 'NEWS_LOCK'
    ? 'WAIT · NEWS LOCK' : 'BELUM DIEVALUASI';
  if (badge) {
    badge.textContent = !c ? 'MENUNGGU KONTEKS' : c.news?.status === 'NEWS_LOCK'
      ? 'NEWS LOCK AKTIF' : '6 MODEL · EVALUASI STRATEGI BELUM TERSEDIA';
    badge.style.color = 'var(--muted)';
  }
  container.innerHTML = getTournamentDrivers(payload?.history).map((d, idx) => `
    <div class="driver-item">
      <div class="driver-header"><span class="driver-rank">#${idx+1}</span>
        <strong class="driver-name">${esc(d.name)}</strong><span class="driver-badge">${esc(status)}</span></div>
      <div class="driver-meta"><span>WR live: <strong>belum tersedia</strong></span>
        <span>Arsip respons: <strong>${d.archiveWR == null ? '—' : d.archiveWR+'%'} (${d.samples} hasil TP/SL)</strong></span>
        <span>Skor arsip respons: <strong>${d.score} pts</strong></span></div>
      <p class="driver-desc">Model referensi: ${esc(d.desc)}. Syarat khusus model belum dievaluasi server.</p>
    </div>`).join('');
}
function empty(reason){
  $('connection').textContent='WAIT · data belum siap';$('context-state').textContent='Menunggu data server';
  $('market-state').textContent='KONTEKS BELUM TERSEDIA';$('market-story').textContent=reason;
  $('context-source').textContent='Candle lama tidak menjadi dasar keputusan baru.';
  for(const id of ['h1-bias','h1-health','m15-poi','m15-range','m15-control','m15-risk','m1-confirmation','m1-evidence','m5-confirmation','m5-evidence']){
    const el=$(id);if(el)el.textContent='—';
  }
  $('primary-status').textContent='MENUNGGU';$('primary-scenario').textContent='Tunggu candle H1, M15, dan M5 yang segar.';
  $('alternative-scenario').textContent='Belum ada skenario alternatif yang dapat ditinjau.';
  $('execution-status').textContent='BELUM SIAP';$('execution-reason').textContent=reason;
  $('execution-checklist').innerHTML='';$('evidence').innerHTML='';$('liquidity').innerHTML='<p>Level belum tersedia.</p>';
  $('gold-condition').textContent='Menunggu data volatilitas.';$('news-awareness').textContent='Periksa berita berdampak tinggi secara manual.';
  renderTournament(null);
  {
    try{localStorage.removeItem('amyfx.market-context.v1');}catch{}
    window.AmyMarketContext=null;window.dispatchEvent(new CustomEvent('amyfx:market-context',{detail:null}));
  }
}
function render(){
  const c=failed?null:currentContext(payload);
  if(!c){
    empty(failed?'Server belum berhasil dihubungi. Coba Perbarui saat koneksi pulih.':'Evaluasi server belum lengkap atau candle tertutup sudah terlambat.');
    return;
  }
  const tf=c.source?.M5?'M5':'M1';
  const confTime=c.source?.M5||c.source?.M1;
  const confObj=c.m5||c.m1;
  $('connection').textContent='Candle server terkini';$('context-state').textContent='KONTEKS · BUKAN SINYAL';
  $('market-state').textContent=c.marketState||'MENUNGGU';$('market-story').textContent=c.narrative||'Menunggu penjelasan server.';
  $('context-source').textContent=`H1 ${time(c.source.H1)} · M15 ${time(c.source.M15)} · ${tf} ${time(confTime)}`;
  const dr = c.m15?.dealingRange;
  const drLoc = dr?.location ? ` [${dr.location}]` : '';
  const confScore = c.confluence ? ` · Skor: ${c.confluence.score}/100 (${c.confluence.grade})${c.confluence.winDir?` · dominan ${c.confluence.winDir===1?'BUY':'SELL'}`:''}` : '';
  $('h1-bias').textContent=id(c.h1?.bias||'NEUTRAL');$('h1-health').textContent=`Kesehatan: ${id(c.h1?.health)}`;
  $('m15-poi').textContent=c.m15?.poi?`${c.m15.poi.label}${c.m15.poi.ce?` (CE: ${number(c.m15.poi.ce)})`:''} · ${id(c.m15.poi.lifecycle)}`:'Area belum valid';
  $('m15-range').textContent=c.m15?.poi?`${number(c.m15.poi.low)}–${number(c.m15.poi.high)}`:'Menunggu area M15';
  $('m15-control').textContent=id(c.m15?.control||'BALANCED');
  const aPlus = c.execution?.aPlusReady === true && c.execution?.status === 'READY TO REVIEW' && c.confluence?.score >= 75;
  $('m15-risk').textContent=aPlus?`🟢 Grade A+${drLoc}: Bukti lengkap${confScore}`:c.m15?.opposingControl?`H1 berlawanan · konteks tambahan${drLoc}${confScore}`:`BIAS M15${drLoc} · BELUM A+${confScore}`;
  const confStatus=id(confObj?.status||'WAITING');
  const confEvidence=confObj?.sweep?`Sweep ${number(confObj.sweep.level)} · MSS ${number(confObj.mss?.level)}`:'Menunggu sweep atau respons POI dan break/displacement M5.';
  if($('m5-confirmation'))$('m5-confirmation').textContent=confStatus;
  if($('m1-confirmation'))$('m1-confirmation').textContent=confStatus;
  if($('m5-evidence'))$('m5-evidence').textContent=confEvidence;
  if($('m1-evidence'))$('m1-evidence').textContent=confEvidence;
  $('primary-status').textContent=id(c.primary?.status||'WAITING');$('primary-scenario').innerHTML=scenario(c.primary);
  $('alternative-scenario').innerHTML=scenario(c.alternative,true);
  $('execution-status').textContent=id(c.execution?.status||'NOT READY');$('execution-reason').textContent=c.execution?.reason||'Menunggu bukti.';
  $('execution-checklist').innerHTML=(c.execution?.checklist||[]).map(item=>`<li>${item.ok?'✓':'○'} ${esc(item.label)}</li>`).join('');
  renderTournament(c);
  const newsEl=$('news-awareness');
  if(newsEl){
    newsEl.textContent=c.news?.note||'Status berita berdampak tinggi belum diverifikasi.';
    newsEl.className='muted '+(c.news?.status==='NEWS_LOCK'?'news-lock':c.news?.status==='UPCOMING'?'news-warning':c.news?.status==='SAFE'?'news-safe':'');
  }
  const drInfo = dr
    ? `${dr.location} (EQ: ${number(dr.eq)}, Range: ${number(dr.rangeLow)}–${number(dr.rangeHigh)})`
    : '—';
  const confScoreInfo = c.confluence
    ? `${c.confluence.score}/100 (${c.confluence.grade})`
    : '—';
  $('evidence').innerHTML=row('H1 · HH/HL/LH/LL',`${c.h1?.highPattern||'—'} / ${c.h1?.lowPattern||'—'} · ${c.h1?.lastBreak?.type||'belum ada break'} di ${number(c.h1?.lastBreak?.level)}`)+
    row('M15 · struktur',`${c.m15?.structure||'NEUTRAL'} · ${c.m15?.lastBreak?.type||'belum ada break'} di ${number(c.m15?.lastBreak?.level)}`)+
    row('Dealing Range (EQ)', drInfo)+
    row('Skor Konfluensi (0–100)', confScoreInfo)+
    row('POI · siklus',c.m15?.poi?`${c.m15.poi.label} ${number(c.m15.poi.low)}–${number(c.m15.poi.high)}${c.m15.poi.ce?` (50% CE: ${number(c.m15.poi.ce)})`:''} · ${c.m15.poi.lifecycle}`:'Tidak ada zona valid')+
    row(`${tf} · bukti`,`${confObj?.status||'WAITING'} · sweep ${number(confObj?.sweep?.level)} · MSS ${number(confObj?.mss?.level)} · micro FVG ${confObj?.microFvg?`${number(confObj.microFvg.low)}–${number(confObj.microFvg.high)}`:'—'}`);
  $('liquidity').innerHTML=(c.liquidity||[]).map(item=>row(`${item.label} · ${item.status}`,number(item.level))).join('')||'<p>Belum ada level eksternal/internal yang tervalidasi.</p>';
  $('gold-condition').innerHTML=row('Volatilitas',`${id(c.volatility?.condition||'UNKNOWN')} · ATR M15 ${number(c.volatility?.atr)}`)+row('Sesi',c.session||'Belum tersedia')+row('Berita berdampak tinggi',c.news?.note||'Belum diverifikasi');
  window.AmyMarketContext=Object.freeze(c);
  try{localStorage.setItem('amyfx.market-context.v1',JSON.stringify(c));}catch{}
  window.dispatchEvent(new CustomEvent('amyfx:market-context',{detail:c}));
}
function renderArchive(){
  $('history').innerHTML=(payload?.history||[]).filter(x=>x.symbol==='XAU/USD').slice(0,20).map(s=>row(`${s.direction} · ${s.status} · ${s.driverName||s.model}`,
    `Candle ${time(s.signalCandleCloseTime)} · entry historis ${number(s.entry)} · SL ${number(s.stopLoss)} · target ${number(s.target)}`)).join('')||'<p>Belum ada riwayat lama dalam respons 24 jam terakhir.</p>';
}
function schedule(){clearTimeout(timer);if(!document.hidden)timer=setTimeout(refresh,30000);}
async function refresh(){
  const id=++generation;request?.abort();request=new AbortController();const active=request,signal=active.signal;
  const timeout=setTimeout(()=>active.abort(),15000);
  try{
    const response=await fetch(`${ENDPOINT}?limit=1&history_limit=20`,{headers:{Accept:'application/json',...deviceHeaders()},signal,cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const next=await response.json();if(next?.ok!==true||next?.mode!=='market_context')throw new Error('Kontrak konteks server tidak valid');
    if(id!==generation)return;payload=next;failed=false;render();renderArchive();
  }catch{if(id===generation){failed=true;render();}}
  finally{clearTimeout(timeout);if(id===generation)schedule();}
}
window.addEventListener('amyfx:refresh-context',refresh);
window.addEventListener('online',refresh);
window.addEventListener('offline',()=>{generation++;request?.abort();clearTimeout(timer);failed=true;render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){generation++;request?.abort();clearTimeout(timer);}else {render();refresh();}});
window.addEventListener('pagehide',()=>{generation++;request?.abort();clearTimeout(timer);});
window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});

render();refresh();
