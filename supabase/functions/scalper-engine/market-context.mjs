// Closed-candle XAU/USD context. Every threshold below is a configurable model
// heuristic, not an ICT rule, a prediction, or an order recommendation.
export const CONTEXT_VERSION = 'amyfx-gold-context-v1';
const PIVOT = 2;
const round = value => Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
const latest = rows => rows.at(-1);

export function closedCandles(rows, nowSeconds) {
  const byTime = new Map();
  for (const raw of rows || []) {
    const c = {open_time:Number(raw.open_time),close_time:Number(raw.close_time),open:Number(raw.open),high:Number(raw.high),low:Number(raw.low),close:Number(raw.close)};
    if (raw.is_closed === false || !Object.values(c).every(Number.isFinite) || c.open_time <= 0 ||
        c.close_time <= c.open_time || c.close_time > nowSeconds || c.low <= 0 ||
        c.low > Math.min(c.open,c.close) || c.high < Math.max(c.open,c.close)) continue;
    byTime.set(c.open_time,c);
  }
  return [...byTime.values()].sort((a,b)=>a.open_time-b.open_time);
}

export function atr(candles, end=candles.length, period=14) {
  if (end < period+1) return null;
  let total=0;
  for(let i=end-period;i<end;i++) {
    const c=candles[i], previous=candles[i-1];
    total+=Math.max(c.high-c.low,Math.abs(c.high-previous.close),Math.abs(c.low-previous.close));
  }
  return total/period;
}

export function swings(candles, width=PIVOT) {
  const highs=[],lows=[];
  for(let i=width;i<candles.length-width;i++) {
    const c=candles[i], window=candles.slice(i-width,i+width+1);
    if(window.every((x,j)=>j===width||c.high>x.high)) highs.push({level:c.high,time:c.open_time,confirmedAt:candles[i+width].close_time,index:i});
    if(window.every((x,j)=>j===width||c.low<x.low)) lows.push({level:c.low,time:c.open_time,confirmedAt:candles[i+width].close_time,index:i});
  }
  return {highs,lows};
}

export function structure(candles, points=swings(candles)) {
  const highs=points.highs,lows=points.lows;
  let lastBreak=null;
  for(let i=1;i<candles.length;i++) {
    const c=candles[i],prev=candles[i-1];
    const confirmedHighs=highs.filter(p=>p.confirmedAt<=c.open_time&&p.index<i);
    const confirmedLows=lows.filter(p=>p.confirmedAt<=c.open_time&&p.index<i);
    const high=confirmedHighs.at(-1),low=confirmedLows.at(-1);
    if(high && prev.close<=high.level && c.close>high.level) lastBreak={side:'BULLISH',type:(lastBreak?.side==='BEARISH'||!lastBreak&&confirmedHighs.at(-1)?.level<confirmedHighs.at(-2)?.level)?'MSS':'BOS',level:high.level,time:c.close_time};
    if(low && prev.close>=low.level && c.close<low.level) lastBreak={side:'BEARISH',type:(lastBreak?.side==='BULLISH'||!lastBreak&&confirmedLows.at(-1)?.level>confirmedLows.at(-2)?.level)?'MSS':'BOS',level:low.level,time:c.close_time};
  }
  const h=highs.at(-1),h0=highs.at(-2),l=lows.at(-1),l0=lows.at(-2);
  const sequence=h&&h0&&l&&l0?(h.level>h0.level&&l.level>l0.level?'BULLISH':h.level<h0.level&&l.level<l0.level?'BEARISH':'NEUTRAL'):'NEUTRAL';
  const recentBreak=lastBreak && latest(candles).close_time-lastBreak.time<=24*3600;
  const bias=recentBreak?lastBreak.side:sequence;
  let health=bias==='NEUTRAL'?'WEAKENING':'HEALTHY';
  if(bias!=='NEUTRAL' && sequence!=='NEUTRAL' && sequence!==bias) health='WEAKENING';
  if(bias==='BULLISH'&&h&&h0&&h.level<h0.level||bias==='BEARISH'&&l&&l0&&l.level>l0.level)health='WEAKENING';
  const protectedLevel=bias==='BULLISH'?l?.level:bias==='BEARISH'?h?.level:null;
  if(bias==='BULLISH' && protectedLevel!=null && latest(candles).close<protectedLevel ||
     bias==='BEARISH' && protectedLevel!=null && latest(candles).close>protectedLevel) health='INVALIDATED';
  return {bias,health,sequence,lastBreak,protectedLevel:round(protectedLevel),swingHigh:round(h?.level),swingLow:round(l?.level),
    highPattern:h&&h0?(h.level>h0.level?'HH':'LH'):null,lowPattern:l&&l0?(l.level>l0.level?'HL':'LL'):null};
}

export function zones(candles, points=swings(candles)) {
  const output=[];const start=Math.max(2,candles.length-120);
  for(let i=start;i<candles.length;i++) {
    const a=candles[i-2],b=candles[i-1],c=candles[i];
    const gap=c.low>a.high?{side:'BUY',low:a.high,high:c.low}:c.high<a.low?{side:'SELL',low:c.high,high:a.low}:null;
    if(gap) output.push({id:`FVG:${gap.side}:${c.open_time}`,kind:'FVG',...gap,formedAt:c.close_time,formedIndex:i});
    const range=atr(candles,i), body=Math.abs(c.close-c.open);
    const priorHigh=points.highs.filter(p=>p.confirmedAt<=c.open_time).at(-1);
    const priorLow=points.lows.filter(p=>p.confirmedAt<=c.open_time).at(-1);
    const buy=range && body>1.1*range && c.close>c.open && priorHigh && c.close>priorHigh.level;
    const sell=range && body>1.1*range && c.close<c.open && priorLow && c.close<priorLow.level;
    if(buy||sell) {
      const opposite=candles.slice(Math.max(0,i-3),i).reverse().find(x=>buy?x.close<x.open:x.close>x.open);
      if(opposite) output.push({id:`OB:${buy?'BUY':'SELL'}:${opposite.open_time}`,kind:'OB',side:buy?'BUY':'SELL',low:opposite.low,high:opposite.high,formedAt:c.close_time,formedIndex:i});
    }
  }
  return output.map(z=>{
    let touches=0,mitigated=false,invalid=false,lastTouch=null;
    for(let i=z.formedIndex+1;i<candles.length;i++) {
      const c=candles[i],touch=c.low<=z.high&&c.high>=z.low;
      if(touch){touches++;lastTouch=c.close_time;if(z.side==='BUY'?c.low<=(z.low+z.high)/2:c.high>=(z.low+z.high)/2)mitigated=true;}
      if(z.side==='BUY'?c.close<z.low:c.close>z.high){invalid=true;break;}
    }
    const lifecycle=invalid?'INVALID':mitigated?'MITIGATED':touches>=2?'WEAKENING':touches?'TESTED':'FRESH';
    return {...z,label:`Zona ${z.side==='BUY'?'permintaan':'penawaran'} ${z.kind}`,low:round(z.low),high:round(z.high),touches,lastTouch,lifecycle};
  });
}

export function liquidity(m15,d1,points=swings(m15),nowSeconds=Math.floor(Date.now()/1000)) {
  const targets=[];
  if(d1.length>=1) {
    const previous=d1.at(-1);
    targets.push({label:'PDH',level:round(previous.high),side:'BUY',sourceTime:previous.close_time},
      {label:'PDL',level:round(previous.low),side:'SELL',sourceTime:previous.close_time});
  }
  if(d1.length) {
    const week=time=>Math.floor((time+3*86400)/(7*86400));
    const previousWeek=d1.filter(x=>week(x.open_time)===week(nowSeconds)-1);
    if(previousWeek.length>=3) targets.push({label:'PWH',level:round(Math.max(...previousWeek.map(x=>x.high))),side:'BUY',sourceTime:latest(previousWeek).close_time},
      {label:'PWL',level:round(Math.min(...previousWeek.map(x=>x.low))),side:'SELL',sourceTime:latest(previousWeek).close_time});
  }
  const tolerance=(atr(m15)||1)*0.1;
  for(const [key,label,side] of [['highs','EQH','BUY'],['lows','EQL','SELL']]) {
    const recent=points[key].slice(-24);
    for(let i=recent.length-1;i>0;i--) {
      const same=recent.slice(0,i).reverse().find(p=>Math.abs(p.level-recent[i].level)<=tolerance);
      if(same){targets.push({label,level:round((same.level+recent[i].level)/2),side,sourceTime:recent[i].confirmedAt});break;}
    }
  }
  const price=latest(m15)?.close;
  return targets.map(t=>{
    const swept=m15.some(c=>c.close_time>t.sourceTime && (t.side==='BUY'?c.high>=t.level:c.low<=t.level));
    const behindPrice=t.side==='BUY'?price>=t.level:price<=t.level;
    return {...t,status:swept||behindPrice?'TAKEN':'ACTIVE'};
  });
}

export function confirmation(candles,zone,side) {
  if(!zone||!side||candles.length<18) return {status:'WAITING',sweep:null,mss:null,microFvg:null};
  const recent=candles.slice(-45).filter(c=>c.close_time>=zone.formedAt);
  let touch=-1,sweep=null,mss=null,microFvg=null;
  for(let i=6;i<recent.length;i++) {
    const c=recent[i],prior=recent.slice(i-6,i);
    if(c.low<=zone.high&&c.high>=zone.low)touch=i;
    if(touch<0)continue;
    const level=side==='BUY'?Math.min(...prior.map(x=>x.low)):Math.max(...prior.map(x=>x.high));
    if(!sweep && (side==='BUY'?c.low<level&&c.close>level:c.high>level&&c.close<level)) sweep={time:c.close_time,level:round(level),extreme:round(side==='BUY'?c.low:c.high),index:i};
    if(sweep && i>sweep.index && i-sweep.index<=12) {
      const breakLevel=side==='BUY'?Math.max(...prior.map(x=>x.high)):Math.min(...prior.map(x=>x.low));
      const displacement=Math.abs(c.close-c.open)>=(atr(recent,i)||Infinity)*0.7;
      if(!mss && displacement && (side==='BUY'?c.close>breakLevel:c.close<breakLevel))mss={time:c.close_time,level:round(breakLevel)};
      if(mss && i>=2) {
        const first=recent[i-2];
        if(side==='BUY'&&first.high<c.low) microFvg={low:round(first.high),high:round(c.low),time:c.close_time};
        if(side==='SELL'&&first.low>c.high) microFvg={low:round(c.high),high:round(first.low),time:c.close_time};
      }
    }
  }
  const lastTime=latest(recent)?.close_time;
  const interval=recent.length>=2?Math.round(recent[1].open_time-recent[0].open_time):60;
  const sweepWindow=Math.max(15*60,interval*12);
  const valid=sweep && lastTime-sweep.time<=sweepWindow;
  const failed=sweep && recent.slice(sweep.index+1).some(c=>side==='BUY'?c.close<zone.low||c.close<sweep.extreme:c.close>zone.high||c.close>sweep.extreme);
  if(failed)return {status:'FAILED',sweep:{time:sweep.time,level:sweep.level,extreme:sweep.extreme},mss:null,microFvg:null};
  return {status:valid&&mss&&microFvg?'CONFIRMED':valid?'CONFIRMING':'WAITING',sweep:valid?{time:sweep.time,level:sweep.level,extreme:sweep.extreme}:null,
    mss:valid?mss:null,microFvg:valid?microFvg:null};
}

function goldSession(nowSeconds){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hourCycle:'h23',hour:'2-digit',minute:'2-digit',weekday:'short'})
    .formatToParts(new Date(nowSeconds*1000));
  const values=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  if(['Sat','Sun'].includes(values.weekday))return 'PASAR TUTUP';
  const hour=Number(values.hour)+Number(values.minute)/60;
  return hour>=2&&hour<5?'LONDON':hour>=7&&hour<11?'NEW YORK':'DI LUAR JAM INTI';
}

export function evaluateEconomicCalendar(calendar, nowSeconds) {
  if (!Array.isArray(calendar) || calendar.length === 0) {
    return {
      status: 'UNVERIFIED',
      impact: 'UNKNOWN',
      event: null,
      diffMinutes: null,
      note: 'Kalender berita berdampak tinggi belum terhubung; periksa berita sebelum eksekusi.'
    };
  }

  const usdEvents = [];
  for (const item of calendar) {
    if (String(item.country).toUpperCase() !== 'USD') continue;
    const impact = String(item.impact || '').toLowerCase();
    if (impact !== 'high' && impact !== 'medium') continue;

    const eventTime = Math.floor(new Date(item.date).getTime() / 1000);
    if (!Number.isFinite(eventTime)) continue;

    const diffMinutes = Math.round((eventTime - nowSeconds) / 60);
    usdEvents.push({
      title: item.title,
      country: 'USD',
      impact: item.impact,
      eventTime,
      diffMinutes,
      forecast: item.forecast || '',
      previous: item.previous || ''
    });
  }

  if (usdEvents.length === 0) {
    return {
      status: 'SAFE',
      impact: 'LOW',
      event: null,
      diffMinutes: null,
      note: '🟢 SAFE / CLEAR: Tidak ada berita USD berdampak tinggi dalam waktu dekat. Kondisi scalping aman.'
    };
  }

  // Sort by closest in time to now (absolute difference)
  usdEvents.sort((a, b) => Math.abs(a.diffMinutes) - Math.abs(b.diffMinutes));

  // Critical safety buffer: -15 min (recent release) to +30 min (upcoming release) for High Impact
  const highCritical = usdEvents.find(e => String(e.impact).toLowerCase() === 'high' && e.diffMinutes >= -15 && e.diffMinutes <= 30);
  if (highCritical) {
    const isPast = highCritical.diffMinutes < 0;
    const isNow = highCritical.diffMinutes === 0;
    const timing = isNow ? 'sedang rilis saat ini' : (isPast ? `${Math.abs(highCritical.diffMinutes)}m yang lalu` : `dalam ${highCritical.diffMinutes} menit`);
    return {
      status: 'NEWS_LOCK',
      impact: 'HIGH',
      event: highCritical.title,
      diffMinutes: highCritical.diffMinutes,
      forecast: highCritical.forecast,
      previous: highCritical.previous,
      note: `⛔ NEWS LOCK AKTIF: Rilis ${highCritical.title} (${timing}). Hindari entry scalping akibat risiko slippage & lonjakan spread.`
    };
  }

  // Upcoming High Impact within 30 to 120 minutes
  const highUpcoming = usdEvents.find(e => String(e.impact).toLowerCase() === 'high' && e.diffMinutes > 30 && e.diffMinutes <= 120);
  if (highUpcoming) {
    return {
      status: 'UPCOMING',
      impact: 'HIGH',
      event: highUpcoming.title,
      diffMinutes: highUpcoming.diffMinutes,
      forecast: highUpcoming.forecast,
      previous: highUpcoming.previous,
      note: `⚠️ WASPADA BERITA: ${highUpcoming.title} rilis dalam ${highUpcoming.diffMinutes} menit${highUpcoming.forecast ? ` (Forecast: ${highUpcoming.forecast})` : ''}. Siapkan trailing/TP sebelum rilis.`
    };
  }

  // Critical safety buffer for Medium Impact: -10 min to +15 min
  const medCritical = usdEvents.find(e => String(e.impact).toLowerCase() === 'medium' && e.diffMinutes >= -10 && e.diffMinutes <= 15);
  if (medCritical) {
    const isPast = medCritical.diffMinutes < 0;
    const isNow = medCritical.diffMinutes === 0;
    const timing = isNow ? 'sedang rilis saat ini' : (isPast ? `${Math.abs(medCritical.diffMinutes)}m yang lalu` : `dalam ${medCritical.diffMinutes} menit`);
    return {
      status: 'MEDIUM_ALERT',
      impact: 'MEDIUM',
      event: medCritical.title,
      diffMinutes: medCritical.diffMinutes,
      forecast: medCritical.forecast,
      previous: medCritical.previous,
      note: `⚡ INFO BERITA: ${medCritical.title} (${timing}). Waspadai fluktuasi jangka pendek.`
    };
  }

  return {
    status: 'SAFE',
    impact: 'LOW',
    event: null,
    diffMinutes: null,
    note: '🟢 SAFE / CLEAR: Tidak ada berita USD berdampak tinggi dalam waktu dekat. Kondisi scalping aman.'
  };
}

export function buildMarketContext({h1=[],m15=[],m5=[],m1=[],d1=[],nowSeconds=Math.floor(Date.now()/1000),calendar=[]}={}) {
  const isM5=Array.isArray(m5)&&m5.length>0;
  const confCandles=isM5?m5:m1;
  const tfName=isM5?'M5':'M1';
  const H=closedCandles(h1,nowSeconds),M=closedCandles(m15,nowSeconds),C=closedCandles(confCandles,nowSeconds),D=closedCandles(d1,nowSeconds);
  const closedM1=isM5&&m1&&m1.length?closedCandles(m1,nowSeconds):null;
  const source={H1:latest(H)?.close_time||null,M15:latest(M)?.close_time||null,
    M5:isM5?(latest(C)?.close_time||null):null,
    M1:!isM5?(latest(C)?.close_time||null):(latest(closedM1||[])?.close_time||latest(C)?.close_time||null),
    D1:latest(D)?.close_time||null};
  if(isM5&&!source.M5&&source.M1)source.M5=source.M1;
  if(!source.M1&&source.M5)source.M1=source.M5;
  const confTime=isM5?source.M5:source.M1;
  const maxConfAge=isM5?900:180;
  const fresh=H.length>=30&&M.length>=40&&C.length>=40&&source.H1&&source.M15&&confTime&&
    nowSeconds-source.H1>=0&&nowSeconds-source.H1<=3*3600&&nowSeconds-source.M15>=0&&nowSeconds-source.M15<=35*60&&
    nowSeconds-confTime>=0&&nowSeconds-confTime<=maxConfAge;
  const newsContext=evaluateEconomicCalendar(calendar,nowSeconds);
  const base={version:CONTEXT_VERSION,symbol:'XAU/USD',generatedAt:new Date(nowSeconds*1000).toISOString(),source,fresh:Boolean(fresh),
    session:goldSession(nowSeconds),
    news:newsContext};
  if(!fresh) return {...base,h1:{bias:'NEUTRAL',health:'WEAKENING'},m15:{control:'BALANCED',poi:null},
    m5:{status:'WAITING'},m1:{status:'WAITING'},liquidity:[],volatility:{condition:'UNKNOWN',atr:null},marketState:'DATA TERLAMBAT',
    primary:null,alternative:null,execution:{status:'NOT READY',checklist:[],reason:`Candle H1, M15, atau ${tfName} belum lengkap atau terlambat.`},
    narrative:'Data candle tertutup belum cukup segar untuk membentuk konteks pasar.',event:null};
  const h=structure(H),m=structure(M),mp=swings(M),allZones=zones(M,mp),levels=liquidity(M,D,mp,nowSeconds);
  const side=h.bias==='BULLISH'?'BUY':h.bias==='BEARISH'?'SELL':m.bias==='BULLISH'?'BUY':m.bias==='BEARISH'?'SELL':null;
  const opposite=side==='BUY'?'SELL':side==='SELL'?'BUY':null,control=m.bias==='BULLISH'?'BUYER':m.bias==='BEARISH'?'SELLER':'BALANCED';
  const close=latest(M).close,vol=atr(M),oldVols=[];
  for(let i=Math.max(15,M.length-100);i<M.length;i++){const x=atr(M,i);if(x)oldVols.push(x);}
  oldVols.sort((a,b)=>a-b);const median=oldVols[Math.floor(oldVols.length/2)]||vol;
  const highVolatility=vol>median*1.5||latest(M).high-latest(M).low>vol*1.8;
  const choose=s=>allZones.filter(z=>z.side===s&&!['INVALID','MITIGATED'].includes(z.lifecycle)&&
    (s==='BUY'?z.low<=close+vol*2:z.high>=close-vol*2))
    .sort((a,b)=>Math.max(0,close-a.high,a.low-close)-Math.max(0,close-b.high,b.low-close)||b.formedAt-a.formedAt)[0]||null;
  const poi=side?choose(side):null,alternatePoi=side?choose(opposite):null;
  const near=poi&&Math.max(0,poi.low-close,close-poi.high)<=vol;
  const confirming=confirmation(C,poi,side);
  if(poi&&((side==='BUY'&&latest(M).close<poi.low)||(side==='SELL'&&latest(M).close>poi.high)))confirming.status='FAILED';
  const aligned=side&&h.bias!=='NEUTRAL'&&(side==='BUY'?control==='BUYER':control==='SELLER');
  if(h.bias!=='NEUTRAL'&&!aligned)h.health=h.health==='INVALIDATED'?'INVALIDATED':'WEAKENING';
  const target=levels.filter(l=>l.status==='ACTIVE'&&l.side===side).sort((a,b)=>Math.abs(a.level-close)-Math.abs(b.level-close))[0]||null;
  const altTarget=levels.filter(l=>l.status==='ACTIVE'&&l.side===opposite).sort((a,b)=>Math.abs(a.level-close)-Math.abs(b.level-close))[0]||null;
  const scenario=(s,z,t,isAlternative=false)=>s?{side:s,label:s==='BUY'?'BELI GOLD':'JUAL GOLD',area:z?{low:z.low,high:z.high}:null,
    poiType:z?.kind||null,poiStatus:z?.lifecycle||null,target:t?.level||null,invalidation:z?(s==='BUY'?z.low:z.high):null,
    reasons:[isAlternative?'Dapat dipertimbangkan hanya setelah skenario utama batal':`Bias H1 ${h.bias==='BULLISH'?'naik':h.bias==='BEARISH'?'turun':'netral'}`,
      isAlternative?`M15 harus beralih ke ${s==='BUY'?'pembeli':'penjual'}`:`Kontrol M15 ${control==='BUYER'?'pembeli':control==='SELLER'?'penjual':'seimbang'}`,
      z?`${z.label} M15 ${z.low.toFixed(2)}–${z.high.toFixed(2)} (${z.lifecycle})`:'Belum ada area M15 valid'],
    waiting:z?`Tunggu harga merespons area M15 dan sweep + MSS + displacement/FVG ${tfName}.`:'Tunggu POI M15 yang valid.',
    status:z?'WAITING CONFIRMATION':'NO VALID POI'}:null;
  const checklist=[{label:'H1 searah dengan M15',ok:Boolean(aligned)},
    {label:'POI M15 valid dan dekat harga',ok:Boolean(poi&&near)},
    {label:`Likuiditas ${tfName} disapu dan direbut kembali`,ok:Boolean(confirming.sweep)},
    {label:`${tfName} MSS, displacement, dan micro FVG`,ok:confirming.status==='CONFIRMED'},
    {label:'Batas invalidasi tersedia',ok:Boolean(poi)}];
  const ready=checklist.every(x=>x.ok);
  const isNewsLock=newsContext.status==='NEWS_LOCK';
  const direction=h.bias==='BULLISH'?'Naik':h.bias==='BEARISH'?'Turun':'Netral';
  const controlling=control==='BUYER'?'pembeli':control==='SELLER'?'penjual':'seimbang';
  const state=h.bias!=='NEUTRAL'&&!aligned?`H1 ${direction.toLowerCase()} · tekanan ${controlling} di M15`:poi&&near?`H1 ${direction.toLowerCase()} · dekat area M15`:`H1 ${direction.toLowerCase()} · menunggu area`;
  const status=isNewsLock?'NOT READY':(ready?'READY TO REVIEW':'NOT READY');
  const reason=isNewsLock?`⛔ News Lock Aktif: Rilis ${newsContext.event} ${newsContext.diffMinutes<=0?'sedang rilis / baru saja rilis':`dalam ${newsContext.diffMinutes} menit`}. Hindari entry untuk mencegah slippage & spread melebar.`:
    (ready?'Semua bukti candle terpenuhi. Tinjau spread dan kalender berita secara manual.':
    h.bias!=='NEUTRAL'&&!aligned?`H1 ${direction.toLowerCase()}, tetapi M15 dikuasai ${controlling}. Risiko perubahan arah perlu dipantau.`:
    `Menunggu: ${checklist.find(x=>!x.ok)?.label||'bukti tambahan'}.`);
  const narrative=`Gold H1 ${direction.toLowerCase()} (${h.health==='HEALTHY'?'kuat':h.health==='INVALIDATED'?'batal':'melemah'}). M15 dikuasai ${controlling}. `+
    (poi?`Area ${poi.label} ${poi.low.toFixed(2)}–${poi.high.toFixed(2)} berstatus ${poi.lifecycle.toLowerCase()}. `:'Belum ada area M15 valid. ')+
    `Konfirmasi ${tfName} ${confirming.status==='CONFIRMED'?'terpenuhi':confirming.status==='FAILED'?'gagal':'masih ditunggu'}. ${isNewsLock?'⛔ News Lock aktif; tunda eksekusi hingga pasar stabil.':ready?'Skenario layak ditinjau manual.':'Tunggu perubahan struktur dan konfirmasi sebelum meninjau eksekusi.'}`;
  const signal=near||!aligned&&h.bias!=='NEUTRAL'||ready||isNewsLock;
  const phase=isNewsLock?'NEWS_LOCK':ready?'READY':!aligned&&h.bias!=='NEUTRAL'?'CONFLICT':near?'APPROACH':'NONE';
  const eventTitle=phase==='NEWS_LOCK'?'⛔ News Lock Aktif: Hindari Entry Scalping!':
    phase==='CONFLICT'?'⚠️ Hati-hati! M15 Mulai Melawan Arah H1':
    phase==='READY'?`⚡ Konfirmasi ${tfName} Muncul! Siap Ditinjau`:
    `🔔 Gold Mendekati Zona ${side==='BUY'?'Beli':'Jual'}!`;
  const eventBody=phase==='NEWS_LOCK'?
    `Rilis ${newsContext.event} ${newsContext.diffMinutes<=0?'sedang berlangsung':'sebentar lagi'}. Seluruh eksekusi ditahan otomatis demi melindungi akun dari spread melebar & slippage.`:
    phase==='CONFLICT'?
    `${control==='BUYER'?'Buyer':'Seller'} mulai masuk di M15 padahal tren besar H1 masih ${direction.toLowerCase()}. Jangan buru-buru open posisi, rawan jebakan.`:
    phase==='READY'?
    `Ada sapuan likuiditas & pantulan di ${confirming.sweep?confirming.sweep.level.toFixed(2):'area M15'}. Skenario ${side||'GOLD'} layak kamu cek di MT4/MT5. Batas invalidasi di ${poi?(side==='BUY'?poi.low.toFixed(2):poi.high.toFixed(2)):'—'}.`:
    `Harga lagi masuk area ${poi?`${poi.low.toFixed(2)}–${poi.high.toFixed(2)}`:'M15'}. Tren H1 masih ${direction.toLowerCase()} (${h.health==='HEALTHY'?'kuat':'melemah'}). Standby dulu, kita tunggu reaksi candle ${tfName} ya.`;
  const event=signal&&phase!=='NONE'?{key:[CONTEXT_VERSION,phase,phase==='NEWS_LOCK'?newsContext.event:h.bias,h.health,m.bias,m.lastBreak?.time||0,poi?.id||'none',poi?.lifecycle||'none'].join(':'),
    title:eventTitle,
    body:eventBody}:null;
  const alternative=scenario(opposite,alternatePoi,altTarget,true);
  if(alternative)alternative.activation=[
    poi?`Close M15 ${side==='BUY'?'di bawah':'di atas'} ${Number(side==='BUY'?poi.low:poi.high).toFixed(2)} membatalkan area utama.`:'Area utama belum terbentuk; tunggu level invalidasi.',
    `M15 membentuk kontrol ${opposite==='BUY'?'buyer':'seller'} dan mempertahankannya.`,
    `${tfName} menunjukkan sweep, MSS, displacement, serta micro FVG ${opposite==='BUY'?'bullish':'bearish'}.`
  ];
  return {...base,price:round(close),h1:h,m15:{control,structure:m.bias,lastBreak:m.lastBreak,poi,
      opposingControl:Boolean(h.bias!=='NEUTRAL'&&!aligned)},m5:confirming,m1:confirming,liquidity:levels,
    volatility:{condition:highVolatility?'HIGH VOLATILITY':'NORMAL',atr:round(vol)},marketState:state,
    primary:scenario(side,poi,target),alternative,
    execution:{status,checklist,reason},narrative,event};
}
