// Presentation settings never change server-owned bias/scoring.
export const DISPLAY_DEFAULTS=Object.freeze({mode:'Present',structure:true,mss:true,bos:true,displacement:false,ob:true,breaker:true,polarity:false,liquidity:true,fvg:true,gapType:'FVG',bpr:false,vi:true,nwog:true,ndog:false,pivots:true,pivotTf:'D',pivotMode:'Clean',nearAtr:2,keyLevels:true,mo:true,pdh:true,pdl:true,bsl:false,ssl:false,asia:true,killzones:false,ny:true,londonOpen:true,londonClose:true,asian:true,fib:'NONE',fibExtend:false,labels:true,signals:true,narration:true,dashboard:true,panel:false,visible:2,bullOb:1,bearOb:1,nwogCount:3,ndogCount:1,backBars:80,rightBars:40,lineWidth:1});
export function loadDisplay(storage=globalThis.localStorage){try{return {...DISPLAY_DEFAULTS,...JSON.parse(storage.getItem('amyfx.ict.display.v2')||'{}')};}catch{return {...DISPLAY_DEFAULTS};}}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=x=>Number.isFinite(x)?x.toFixed(2):'—';
const range=z=>z?`${n(z.high)} – ${n(z.low)}`:'—';
const directions=x=>x===1?'BUY CTX · NAIK':x===-1?'SELL CTX · TURUN':'NO CLEAR BIAS';
export function dashboardRows(amy){
  const d=amy?.dashboard;if(!d)return [];
  const state=['None','Fresh','Old','Invalid'][d.sweepStatus],invalid=['Valid','Near Invalid','Invalid','No Bias'][d.invalidStatus];
  const poi=d.poi,poiName=poi?`${poi.side==='BUY'?'Bull':'Bear'} ${poi.kind}`:'None';
  const zone=x=>x===1?'Premium':x===-1?'Discount':'EQ Zone';
  return [['BIAS',directions(d.biasDir)],['STRUKTUR',d.mssDir===1?'M15 Bullish':d.mssDir===-1?'M15 Bearish':'M15 Neutral'],
    ['PROTECTED',`H ${n(d.protectedHigh)} | L ${n(d.protectedLow)}`],['LIQUIDITY',`BSL ${n(d.bsl)} | SSL ${n(d.ssl)}`],
    ['SWEEP',`${d.sweepDir===1?'SSL Swept':d.sweepDir===-1?'BSL Swept':'None'} | ${state}`],
    ['SWEEP PRICE',`Swept ${n(d.sweep?.price)} | Extreme ${n(d.sweep?.extreme)}`],
    ['DOL',`${d.dolDir===1?'Draw to BSL':d.dolDir===-1?'Draw to SSL':'Neutral'} @ ${n(d.dolTarget)} | ${['Neutral','Active','Reached'][d.dolStatus]}`],
    ['DOL DETAIL',`Dist ${n(d.dolDistance)} | ${d.dolAlign===1?'With Bias':d.dolAlign===-1?'Against Bias':'Neutral'}`],
    ['POI',`${poiName} | ${poi?.lifecycle||'None'} | ${d.poiPriority===2?'Main':d.poiPriority===1?'Secondary':'Ignore'}`],
    ['POI PRICE',`${range(poi)} | CE ${n(poi?.ce)}`],['POI DETAIL',`Dist ${n(d.poiDistance)} | ${zone(d.poiLocation)}`],
    ['POSISI',`${zone(d.priceZone)} | ${d.locationStatus===1?'Healthy':d.locationStatus===-1?'Bad Location':'Neutral'}`],
    ['RANGE',`H ${n(d.rangeHigh)} | L ${n(d.rangeLow)} | EQ ${n(d.eqLow)} – ${n(d.eqHigh)}`],
    ['INVALID',`${invalid} | Level ${n(d.invalidLevel)} | Dist ${d.invalidLevel!=null?n(Math.abs(d.candle.close-d.invalidLevel)):'—'}`],
    ['ALASAN INTI',`${d.mssDir===1?'M15 Bullish':d.mssDir===-1?'M15 Bearish':'M15 Neutral'} | ${d.sweepStatus===1?'Fresh Sweep':'Tunggu Sweep'} | ${poiName}`]];
}
// Compact copy reads server flags only; full narration stays in Detail.
export function mappingWarnings(amy,news=null){
  if(!amy)return [];
  const d=amy.dashboard,e=amy.entry,warnings=[];
  if(news?.status==='NEWS_LOCK')warnings.push('NEWS LOCK · Tunda eksekusi.');
  if(e?.m5Invalid)warnings.push('Close M5 melewati invalidasi · tunggu close M15.');
  else if(d?.invalidStatus===2)warnings.push('Setup batal · tunggu struktur baru.');
  else if(d?.invalidStatus===1)warnings.push(`Dekat invalidasi ${n(d.invalidLevel)}.`);
  if(e?.winDir&&d?.biasDir&&e.winDir!==d.biasDir)warnings.push(`Skor ${e.winDir===1?'BUY':'SELL'} berlawanan bias M15 · tunggu struktur baru.`);
  return warnings;
}
export function compactChartNarration(amy,news=null){
  const warnings=mappingWarnings(amy,news);
  if(warnings.length)return warnings.slice(0,2);
  return (amy?.entry?.text||'Menunggu candle tertutup.').split('\n').filter(Boolean).slice(0,2);
}
const rowNames={'PROTECTED':'Protected swing','LIQUIDITY':'Likuiditas','SWEEP PRICE':'Harga sweep','DOL':'Target DOL','DOL DETAIL':'Jarak DOL','POI PRICE':'Area & CE','POI DETAIL':'Lokasi POI','RANGE':'Dealing Range','INVALID':'Invalidasi','ALASAN INTI':'Ringkasan'};
const layerNames={bias:'Bias M15',sweep:'Liquidity sweep',poi:'Area POI',poiBonus:'Reaksi POI',dol:'Target DOL',location:'Premium / Discount',displacement:'Displacement M5',structure:'Break struktur M5',asia:'Level Asia'};
const readable=text=>String(text).replaceAll('NO CLEAR BIAS','Bias belum jelas').replaceAll('EQ Zone','Zona EQ').replaceAll('Near Invalid','Dekat invalidasi').replaceAll('No Bias','Tanpa bias').replaceAll('Against Bias','Lawan bias').replaceAll('With Bias','Searah bias').replaceAll('Bad Location','Lokasi kurang ideal').replaceAll('Healthy','Lokasi sesuai').replaceAll('Reached','Tercapai').replaceAll('Active','Aktif').replaceAll('Secondary','Tambahan').replaceAll('Ignore','Abaikan').replaceAll('Main','Utama').replaceAll('None','Belum ada').replaceAll('Fresh','Baru').replaceAll('Old','Lama').replaceAll('Dist ','Jarak ').replaceAll('Extreme ','Ekstrem ').replaceAll('Draw to ','Menuju ');
export function renderAmy(amy,settings,news=null){
  const dash=document.getElementById('amy-dashboard'),assistant=document.getElementById('amy-assistant'),score=document.getElementById('amy-score-panel');
  const alert=document.getElementById('mapping-alert');if(alert){const warnings=mappingWarnings(amy,news);alert.hidden=!warnings.length;alert.textContent=warnings.join(' ');}
  if(dash){dash.hidden=!settings.dashboard;dash.innerHTML=amy?`<div class="section-heading"><h2>Rincian bias M15</h2><span>Candle tertutup</span></div><dl class="amy-dashboard">${dashboardRows(amy).map(([a,b])=>`<div><dt>${esc(rowNames[a]||a)}</dt><dd>${esc(readable(b))}</dd></div>`).join('')}</dl>`:'<p>Menunggu konteks server yang segar.</p>';}
  if(assistant){assistant.hidden=false;assistant.innerHTML=amy?`<h2>Entry Assistant · M5</h2><p class="amy-narration">${esc(news?.status==='NEWS_LOCK'?news.note:amy.entry.text)}</p><small>Skor confluence adalah poin model, bukan peluang menang.</small>`:'<p>Menunggu candle tertutup.</p>';}
  if(score){score.hidden=!settings.panel;const e=amy?.entry;score.innerHTML=e?`<h2>${esc(e.grade)} · ${e.score}/100 poin</h2><p>BUY ${e.buy} | SELL ${e.sell} · ${directions(e.winDir)}</p><table class="amy-score-table"><thead><tr><th>Lapisan</th><th>BUY</th><th>SELL</th></tr></thead><tbody>${Object.keys(e.breakdown.buy||{}).map(k=>`<tr><td>${esc(layerNames[k]||k)}</td><td>${e.breakdown.buy[k]}</td><td>${e.breakdown.sell[k]}</td></tr>`).join('')}</tbody></table><small>Skor mentah dibatasi 100; dekat invalidasi: skor × 0.7.</small>`:'<p>Skor belum tersedia.</p>';}
}
export function mountDisplay(onChange){
  const container=document.getElementById('ict-controls');let settings=loadDisplay();
  const check=(key,label)=>`<label><input type="checkbox" data-ict="${key}" ${settings[key]?'checked':''}> ${label}</label>`;
  const choices={Present:'Terbaru',Historical:'Riwayat',All:'Semua',Clean:'Ringkas','Major Only':'Level utama',NONE:'Nonaktif',D:'Harian',W:'Mingguan',M:'Bulanan'};
  const select=(key,label,values)=>`<label>${label}<select data-ict="${key}">${values.map(v=>`<option value="${v}" ${settings[key]===v?'selected':''}>${choices[v]||v}</option>`).join('')}</select></label>`;
  const number=(key,label,min,max)=>`<label>${label}<input type="number" data-ict="${key}" value="${settings[key]}" min="${min}" max="${max}"></label>`;
  container.innerHTML=`<details class="settings-group"><summary>Struktur &amp; zona ICT</summary><fieldset><legend>Referensi visual</legend>${select('mode','Mode',['Present','Historical'])}${check('structure','Market Structure')}${check('mss','MSS')}${check('bos','BOS')}${check('displacement','Displacement')}${check('ob','Order Blocks')}${check('breaker','Breaker Blocks')}${check('polarity','Label perubahan OB')}${check('liquidity','Zona likuiditas')}${check('fvg','Fair Value Gaps')}${select('gapType','Jenis gap',['FVG','IFVG'])}${check('bpr','Balance Price Range')}${check('vi','Volume Imbalance')}${check('nwog','NWOG')}${check('ndog','NDOG')}${number('visible','Zona per arah',1,20)}${number('bullOb','Bull OB',0,20)}${number('bearOb','Bear OB',0,20)}${number('nwogCount','Jumlah NWOG',0,50)}${number('ndogCount','Jumlah NDOG',0,50)}</fieldset></details>
    <details class="settings-group"><summary>Pivot &amp; Key Levels</summary><fieldset><legend>Level harga</legend>${check('pivots','Pivot Levels')}${select('pivotTf','Sumber Pivot',['D','W','M'])}${select('pivotMode','Mode Pivot',['All','Clean','Major Only'])}${number('nearAtr','Jarak ATR',.5,20)}${check('keyLevels','Key Levels')}${check('mo','Midnight Open NY')}${check('pdh','PDH')}${check('pdl','PDL')}${check('bsl','BSL')}${check('ssl','SSL')}${check('asia','Asia High/Low (NY 20–00)')}</fieldset></details>
    <details class="settings-group"><summary>Fibonacci &amp; Killzones</summary><fieldset><legend>Sesi &amp; Fibonacci</legend>${select('fib','Fibonacci dari',['NONE','FVG','BPR','OB','Liq','VI','NWOG'])}${check('fibExtend','Perpanjang Fibonacci')}${check('killzones','Warna sesi Killzones')}${check('ny','New York')}${check('londonOpen','London Open')}${check('londonClose','London Close')}${check('asian','Asian')}</fieldset></details>
    <details class="settings-group"><summary>Label &amp; panel</summary><fieldset><legend>Informasi chart</legend>${check('dashboard','Rincian bias M15')}${check('panel','Rincian skor')}${check('narration','Ringkasan di chart')}${check('signals','Marker Strong / Ready')}${check('labels','Label harga')}${number('backBars','Candle ke kiri',10,500)}${number('rightBars','Candle ke kanan',5,300)}${number('lineWidth','Tebal garis',1,4)}</fieldset></details><button type="button" id="ict-reset">Reset tampilan</button>`;
  container.addEventListener('change',event=>{const el=event.target,key=el.dataset.ict;if(!key)return;
    if(el.type==='checkbox')settings[key]=el.checked;else if(el.type==='number')settings[key]=Math.min(+el.max,Math.max(+el.min,+el.value||+el.min));else settings[key]=el.value;
    try{localStorage.setItem('amyfx.ict.display.v2',JSON.stringify(settings));}catch{}onChange({...settings});});
  container.querySelector('#ict-reset').addEventListener('click',()=>{try{localStorage.removeItem('amyfx.ict.display.v2');}catch{}location.reload();});
  return settings;
}
