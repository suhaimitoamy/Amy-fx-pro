/* Amy Pro local assistant. No provider, LLM, remote request or trading execution. */
(function(root) {
  'use strict';
  if(root.AmyLocalAssistant)return;
  const script = root.document?.currentScript?.src || (function() {
    const scripts = root.document?.getElementsByTagName('script') || [];
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('amy-local-assistant.js')) return scripts[i].src;
    }
    return '';
  })();
  const base=script?new URL('../../',script).href:'';
  const routes={
    mapping:['Mapping','apps/mapping/index.html'],
    news:['Berita','apps/market-intel/index.html'],
    calendar:['Kalender Ekonomi','apps/market-intel/index.html'],
    journal:['Jurnal Trading','apps/journal/index.html'],
    habits:['Disiplin & Habits','apps/journal/index.html'],
    academy:['Tutorial Trading','apps/academy/index.html'],
    kalkulator:['Kalkulator Risiko','apps/academy/tools/kalkulator-resiko.html'],
    glosarium:['Glosarium ICT','apps/academy/glosarium/index.html'],
    practice:['Trading Practice','apps/academy/trading-practice/index.html'],
    home:['Beranda','index.html']
  };
  const LEVEL0_IDS=[
    'kenal-trading-broker-akun',
    'bid-ask-spread-pips-gold',
    'lot-leverage-margin-equity',
    'panduan-mt5-lima-jenis-order',
    'membaca-chart-candlestick-nol',
    'dasar-tren-sr-rencana-14-hari'
  ];
  const TOTAL_ACADEMY_LESSONS=36;
  const TOTAL_PRACTICE_CASES=100;
  const norm=s=>String(s??'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9/\s]/g,' ').replace(/\s+/g,' ').trim();
  const list=v=>Array.isArray(v)?v:[];
  const read=(key,fallback=null)=>{try{return JSON.parse(root.localStorage.getItem(key))??fallback;}catch{return fallback;}};
  const raw=key=>{try{return root.localStorage.getItem(key)||'';}catch{return '';}};
  const stamp=t=>t&&Number.isFinite(new Date(t).getTime())?new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Makassar',hour12:false})+' WITA':'waktu tidak tersedia';
  const number=v=>v!==null&&v!==''&&Number.isFinite(Number(v))?Number(v).toLocaleString('id-ID',{maximumFractionDigits:2}):'belum tersedia';
  let lastIntent='',lastQuery='',knowledgeReady=Promise.resolve();
  // Query only the journal metadata record, never credentials or binary attachments.
  function journals() {
    return new Promise(resolve=>{
      let done=false,db;const finish=v=>{if(done)return;done=true;clearTimeout(timer);db?.close();resolve(v);};
      const fallback=()=>finish({rows:list(read('tradingLibraryManager.journals.v1',read('tradingLibraryManager.items.v1',[]))),fallback:true});
      const timer=setTimeout(fallback,1800);
      try{
        const req=root.indexedDB.open('tradingLibraryManager.files');
        req.onupgradeneeded=()=>{req.transaction.abort();};
        req.onerror=fallback;req.onblocked=fallback;
        req.onsuccess=()=>{
          db=req.result;if(done){db.close();return;}
          if(!db.objectStoreNames.contains('metadata')){fallback();return;}
          const store=db.transaction('metadata','readonly').objectStore('metadata');
          const checkItems=()=>{
            const rItems=store.get('items.v2');
            rItems.onsuccess=()=>{
              const iRows=rItems.result?.value;
              if(Array.isArray(iRows)&&iRows.length)finish({rows:iRows,fallback:false});
              else fallback();
            };
            rItems.onerror=fallback;
          };
          const rJournals=store.get('journals.v2');
          rJournals.onsuccess=()=>{
            const jRows=rJournals.result?.value;
            if(Array.isArray(jRows)&&jRows.length)finish({rows:jRows,fallback:false});
            else checkItems();
          };
          rJournals.onerror=checkItems;
        };
      }catch{fallback();}
    });
  }
  function isWeekendClosureWita(nowDate){
    try{
      const d=nowDate instanceof Date?nowDate:new Date(nowDate||Date.now());
      const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'2-digit',hour12:false}).formatToParts(d);
      const wd=parts.find(p=>p.type==='weekday')?.value||'';
      const hr=Number(parts.find(p=>p.type==='hour')?.value||0);
      if(wd==='Sat')return true;
      if(wd==='Fri'&&hr>=17)return true;
      if(wd==='Sun'&&hr<17)return true;
      return false;
    }catch{return false;}
  }
  function getLivePrice(){
    const g=Number(root.amyfxCurrentPrice);
    if(Number.isFinite(g)&&g>=500&&g<=25000)return g;
    if(root.document){
      const sels=['#hero-price','#live-price','#home-gold-price','#chart-price','[data-live-price]'];
      for(const sel of sels){
        const el=root.document.querySelector(sel);
        if(!el)continue;
        const txt=String(el.getAttribute('data-live-price')||el.textContent||'').replace(/[^0-9.,]/g,'').replace(/,(?=\d{3}\b)/g,'').replace(',','.');
        const n=Number(txt);
        if(Number.isFinite(n)&&n>=500&&n<=25000)return n;
      }
    }
    const cockpit=root.AmyMappingLiveCockpit||read('amyfx.mapping.cockpit_snapshot.v1');
    if(cockpit&&Number.isFinite(Number(cockpit.livePrice))&&Number(cockpit.livePrice)>=500){
      const ageMs=Date.now()-Number(cockpit.updatedAt||0);
      if(ageMs<6*3600*1000||isWeekendClosureWita())return Number(cockpit.livePrice);
    }
    const ctx=root.AmyMarketContext||read('amyfx.market-context.v1');
    const cp=Number(ctx?.price||ctx?.livePrice||ctx?.close||0);
    if(Number.isFinite(cp)&&cp>=500&&cp<=25000)return cp;
    return null;
  }
  function getReactionHistoryTodaySummary(){
    const hist=read('amyfx.mapping.reaction_history.v1');
    if(!hist||typeof hist!=='object')return null;
    const todayWita=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Makassar'});
    const arch=hist.dailyArchive&&hist.dailyArchive[todayWita];
    const pois=list(hist.pois).filter(p=>p&&(!p.dayWita||p.dayWita===todayWita));
    const respected=arch?.respected!=null?Number(arch.respected):pois.filter(p=>p.outcome==='RESPECTED'||p.status==='RESPECTED').length;
    const broken=arch?.broken!=null?Number(arch.broken):pois.filter(p=>p.outcome==='BROKEN'||p.status==='BROKEN').length;
    const tested=respected+broken;
    const total=arch?.total!=null?Number(arch.total):pois.length;
    const respectRate=tested>0?Math.round((respected/tested)*100):null;
    if(!total&&!tested)return null;
    return {dayWita:todayWita,total,tested,respected,broken,respectRate};
  }
  function buildMappingSnapshot(ctx,domPrice=null){
    if(!ctx||typeof ctx!=='object')return null;
    const livePrice=Number(domPrice)>0?Number(domPrice):(getLivePrice()||Number(ctx.price||ctx.livePrice||ctx.close||0)||null);
    const cockpitRaw=root.AmyMappingLiveCockpit||read('amyfx.mapping.cockpit_snapshot.v1');
    const cockpit=(cockpitRaw&&((Date.now()-Number(cockpitRaw.updatedAt||0))<6*3600*1000||isWeekendClosureWita()))?cockpitRaw:null;
    const dr=ctx.m15?.dealingRange||cockpit?.dealingRange||null;
    const rHigh=Number(dr?.rangeHigh||dr?.high||0);
    const rLow=Number(dr?.rangeLow||dr?.low||0);
    const eq=Number(dr?.eq||(rHigh&&rLow?(rHigh+rLow)/2:0));
    let pct=50,zoneLabel='EQUILIBRIUM · 50%',isBreakdown=false,isBreakout=false,isNoTradeEq=false;
    if(livePrice&&rHigh>rLow){
      const rawPct=((livePrice-rLow)/(rHigh-rLow))*100;
      pct=Math.max(0,Math.min(100,Math.round(rawPct)));
      if(livePrice<rLow){isBreakdown=true;zoneLabel='BREAKDOWN · 0%';}
      else if(livePrice>rHigh){isBreakout=true;zoneLabel='BREAKOUT · 100%';}
      else if(pct>=45&&pct<=55){isNoTradeEq=true;zoneLabel=`NO-TRADE EQ · ${pct}%`;}
      else if(pct>55){zoneLabel=`PREMIUM · ${pct}%`;}
      else{zoneLabel=`DISKON · ${pct}%`;}
    }
    const liqList=list(ctx.liquidity);
    let bslAbove=null,sslBelow=null;
    if(livePrice){
      const above=liqList.filter(l=>Number(l.level)>livePrice&&/bsl|pdh|pwh|asia high|high/i.test(`${l.label} ${l.kind||''}`)).sort((a,b)=>Number(a.level)-Number(b.level));
      const below=liqList.filter(l=>Number(l.level)<livePrice&&/ssl|pdl|pwl|asia low|low/i.test(`${l.label} ${l.kind||''}`)).sort((a,b)=>Number(b.level)-Number(a.level));
      bslAbove=above[0]||(rHigh>livePrice?{label:'Range High',level:rHigh}:null);
      sslBelow=below[0]||(rLow<livePrice?{label:'Range Low',level:rLow}:null);
    }
    return {
      livePrice,
      rangeHigh:rHigh||null,
      rangeLow:rLow||null,
      eq:eq||null,
      pct,
      zoneLabel,
      isBreakdown,
      isBreakout,
      isNoTradeEq,
      bslAbove:bslAbove?{label:bslAbove.label,level:Number(bslAbove.level)}:null,
      sslBelow:sslBelow?{label:sslBelow.label,level:Number(sslBelow.level)}:null,
      h1Bias:ctx.h1?.bias||cockpit?.bias?.h1||'NEUTRAL',
      h1Health:ctx.h1?.health||'',
      m15Control:ctx.m15?.control||'BALANCED',
      m15Structure:ctx.m15?.structure||cockpit?.bias?.m15||'',
      m5Status:ctx.m5?.status||cockpit?.bias?.m5||'WAITING',
      poi:ctx.m15?.poi||null,
      cockpit,
      reactionToday:getReactionHistoryTodaySummary(),
      weekendClosed:Boolean(ctx.marketClosed||ctx.weekendClosed||cockpit?.weekendClosed||isWeekendClosureWita()),
      primaryLabel:ctx.primary?.label||null,
      primaryArea:ctx.primary?.area||null,
      primaryInvalidation:ctx.primary?.invalidation||null,
      executionStatus:ctx.execution?.status||null,
      executionReason:ctx.execution?.reason||'',
      newsStatus:ctx.news?.status||cockpit?.newsStatus||'SAFE',
      newsNote:ctx.news?.note||''
    };
  }
  function formatCockpitPoiLine(side,plan){
    if(!plan||!plan.zone)return '';
    const z=plan.zone;
    const v=plan.verdict?`${plan.verdict.grade} (${plan.verdict.score}/5)`:'WAIT';
    const touch=z.touchCount>0?`Sentuh ${z.touchCount}x${z.ceTouched?' (CE)':''}`:(z.fresh?'Fresh':'');
    const parts=[
      `${side} [${z.kind} ${z.tf}]: $${z.low.toFixed(2)}–$${z.high.toFixed(2)} (CE $${z.ce.toFixed(2)})`,
      `Verdict ${v} · Status ${plan.state||'STANDBY'}${touch?' · '+touch:''}`,
      plan.sl?`SL $${plan.sl.toFixed(2)}`:'',
      plan.tp1?`TP1 $${plan.tp1.toFixed(2)}${plan.rr1?' (1:'+plan.rr1.toFixed(1)+'R)':''}`:'',
      plan.tp2?`TP2 $${plan.tp2.toFixed(2)}`:''
    ].filter(Boolean);
    return `• Rencana ${parts.join(' | ')}`;
  }
  function intent(q){
    const found=[];
    if(/\b(harga|price|mapping|market|xau|gold|emas|sinyal|signal|bias|arah|entry|setup|stop loss|target|sl|tp|respect|riwayat poi|riwayat reaksi|weekend|akhir pekan|pasar tutup)\b/.test(q))found.push('mapping');
    if(/\b(news|berita|kabar|headline|ekonomi)\b/.test(q))found.push('news');
    if(/\b(kalender|jadwal rilis|rilis news|agenda ekonomi)\b/.test(q))found.push('calendar');
    if(/\b(jurnal|journal|transaksi|profit|rugi|winrate|win rate|performa|evaluasi|kesalahan|emosi|disiplin|psikologi|fomo|overtrade|revenge|daily loss|loss guard|mingguan|akun real|akun sim)\b/.test(q))found.push('journal');
    if(/\b(habit|kebiasaan|streak|rutinitas|disiplin harian)\b/.test(q))found.push('habits');
    if(/\b(kalkulator|hitung lot|lot|resiko|risk calculator|hitung risiko)\b/.test(q))found.push('kalkulator');
    if(/\b(glosarium|kamus|istilah|singkatan)\b/.test(q))found.push('glosarium');
    if(/\b(practice|simulasi|replay|100 kasus|8 pilar|mastery)\b/.test(q))found.push('practice');
    if(/\b(latihan)\b/.test(q)&&!/progres|progress|belajar/.test(q))found.push('practice');
    if(/\b(belajar|baca|bacaan|membaca|pelajari|academy|akademi|tutorial|progres|progress|soal|skor|nilai|materi|pelajaran|level 0|pemula|kurikulum)\b/.test(q))found.push('academy');
    // Personal trade questions use Journal, unless Mapping is explicitly named.
    if(found.includes('journal')&&!/mapping|harga|market|xau|gold|emas|sinyal|signal|bias|arah|poi|respect|riwayat poi|riwayat reaksi|weekend|akhir pekan|pasar tutup/.test(q))return found.filter(id=>id!=='mapping');
    return found;
  }
  function mapping(q,m,now){
    const context=root.AmyMarketContext||read('amyfx.market-context.v1');
    const cockpit=root.AmyMappingLiveCockpit||read('amyfx.mapping.cockpit_snapshot.v1');
    const weekend=isWeekendClosureWita(new Date(now||Date.now()));
    const reaction=getReactionHistoryTodaySummary();
    if(context?.version==='amyfx-gold-context-v1'){
      const isM5=Boolean(context.source?.M5);
      const confSource=Number(context.source?.M5||context.source?.M1);
      const maxAge=isM5?900:180;
      const age=now/1000-confSource;
      const tfName=isM5?'M5':'M1';
      const fresh=context.fresh===true&&age>=0&&age<=maxAge;
      const snap=buildMappingSnapshot(context,getLivePrice());
      const lines=[];
      if(weekend||snap?.weekendClosed){
        lines.push('• Status Pasar: Pasar Tutup (Akhir Pekan) · Harga menampilkan penutupan Jumat terakhir (Jumat 17:00 NY s.d. Minggu 17:00 NY). Jangan eksekusi live saat pasar tutup.');
      }
      if(!fresh&&!weekend){
        lines.push(`• Catatan Kesegaran: Konteks Mapping terakhir melewati batas usia ${tfName}. Buka Mapping untuk refresh candle terbaru.`);
      }
      if(snap?.livePrice)lines.push(`• Harga XAU/USD: $${snap.livePrice.toFixed(2)}`);
      if(snap?.rangeHigh&&snap?.rangeLow){
        lines.push(`• Dealing Range M15: ${snap.zoneLabel} | Low $${snap.rangeLow.toFixed(2)} — High $${snap.rangeHigh.toFixed(2)} | EQ 50% $${Number(snap.eq||0).toFixed(2)}`);
      }
      const liqParts=[];
      if(snap?.bslAbove)liqParts.push(`BSL Atas: ${snap.bslAbove.label} $${snap.bslAbove.level.toFixed(2)}`);
      if(snap?.sslBelow)liqParts.push(`SSL Bawah: ${snap.sslBelow.label} $${snap.sslBelow.level.toFixed(2)}`);
      if(liqParts.length)lines.push(`• Likuiditas Valid: ${liqParts.join(' | ')}`);
      const p=context.primary;
      const area=p?.area?`$${number(p.area.low)}–$${number(p.area.high)}`:'belum ada area valid';
      const conf=context.m5||context.m1;
      lines.push(`• Bias Multi-TF: H1 ${{BULLISH:'naik',BEARISH:'turun'}[context.h1?.bias]||'netral'} (${{HEALTHY:'kuat',WEAKENING:'melemah',INVALIDATED:'batal'}[context.h1?.health]||'belum jelas'}); M15 ${{BUYER:'pembeli',SELLER:'penjual'}[context.m15?.control]||'seimbang'}; ${tfName} ${{CONFIRMED:'terkonfirmasi',CONFIRMING:'sedang dikonfirmasi',FAILED:'gagal'}[conf?.status]||'menunggu'}.`);
      lines.push(`• Skenario Utama: ${p?.label||'belum tersedia'}, area ${area}, invalidasi ${number(p?.invalidation)}. Eksekusi: ${context.execution?.status==='READY TO REVIEW'?'siap ditinjau':'belum siap'}. ${context.execution?.reason||''} ${context.news?.note||''}`.trim());
      if(snap?.cockpit){
        lines.push(`• Prioritas Cockpit: ${snap.cockpit.prioritySide||'NETRAL'}${snap.cockpit.sessionGuard?.label?' · '+snap.cockpit.sessionGuard.label:''}`);
        const sellLine=formatCockpitPoiLine('SELL',snap.cockpit.sell);
        const buyLine=formatCockpitPoiLine('BUY',snap.cockpit.buy);
        if(sellLine)lines.push(sellLine);
        if(buyLine)lines.push(buyLine);
      }
      if(reaction){
        lines.push(`• Riwayat Reaksi POI Hari Ini (${reaction.dayWita}): ${reaction.respected} Respected, ${reaction.broken} Broken${reaction.respectRate!=null?` (Respect Rate ${reaction.respectRate}%)`:''} dari ${reaction.total} POI tercatat.`);
      }
      return lines.join('\n');
    }
    if(cockpit&&cockpit.livePrice){
      const lines=[];
      if(weekend||cockpit.weekendClosed)lines.push('• Status Pasar: Pasar Tutup (Akhir Pekan) · Data dari penutupan Jumat terakhir.');
      lines.push(`• Harga XAU/USD Cockpit: $${Number(cockpit.livePrice).toFixed(2)} | Prioritas: ${cockpit.prioritySide||'NETRAL'}`);
      if(cockpit.dealingRange)lines.push(`• Dealing Range M15: ${cockpit.dealingRange.pct}% (Low $${cockpit.dealingRange.low.toFixed(2)} — High $${cockpit.dealingRange.high.toFixed(2)} | EQ $${cockpit.dealingRange.eq.toFixed(2)})`);
      if(cockpit.bias)lines.push(`• Bias Cockpit: H1 ${cockpit.bias.h1} | M15 ${cockpit.bias.m15} | M5 ${cockpit.bias.m5}`);
      const sellLine=formatCockpitPoiLine('SELL',cockpit.sell);
      const buyLine=formatCockpitPoiLine('BUY',cockpit.buy);
      if(sellLine)lines.push(sellLine);
      if(buyLine)lines.push(buyLine);
      if(reaction)lines.push(`• Riwayat Reaksi POI Hari Ini: ${reaction.respected} Respected, ${reaction.broken} Broken${reaction.respectRate!=null?` (Respect Rate ${reaction.respectRate}%)`:''}.`);
      return lines.join('\n');
    }
    // Old cached entry plans from Pro356 are retired after the context migration.
    if(m?.model==='ICT-SWEEP-MSS-FVG-1')return 'Rencana entry versi lama sudah tidak berlaku. Buka Mapping untuk konteks Gold terbaru.';
    if(!m)return 'Belum ada snapshot Mapping baru. Buka Mapping dan tunggu analisis selesai, lalu tanya lagi.';
    const seconds={M5:300,M15:900}[m.tf]||900;
    const end=Number(m.sourceTime)*1000+seconds*1000;
    const fresh=m.fresh===true&&Number.isFinite(end)&&now>=end&&now-end<=seconds*2000;
    const lines=[`Mapping ${m.tf||''} · ${fresh?'candle masih dalam batas waktu':'DATA LAMA / BELUM SIAP'} · candle dibuka ${stamp(Number(m.sourceTime)*1000)}.`,
      `Harga penutupan candle: ${number(m.close)}. Ini harga candle Mapping, bukan tick live atau harga broker saat ini.`];
    if(!/^(berapa )?(harga|price)/.test(q)||/mapping|arah|bias|entry|setup|sinyal|signal|sl|tp|target/.test(q)){
      lines.push(`Keputusan ${fresh?m.signal:'WAIT'}. ${m.reason||''}`);
      if(m.context)lines.push(`Struktur H1: ${m.context.direction||'WAIT'}; tahap ${m.stage||'belum tersedia'}; sesi ${m.session||'belum tersedia'}.`);
      if(fresh&&m.plan){const p=m.plan;lines.push(`Rencana ${p.direction} · ${p.status}. Entry ${number(p.entry)}, SL ${number(p.sl)}, target ${number(p.tp)}, RR ${number(p.rr)}R. ${p.status==='PENDING'?'Belum fill.':'Fill adalah hasil simulasi model, bukan transaksi akun.'}`);}
      if(!fresh)lines.push('Perbarui Mapping sebelum memakai rencana entry. Level lama tidak dipakai sebagai sinyal.');
    }
    return lines.join('\n');
  }
  function news(q,n){
    const items=list(n?.items);if(!items.length)return 'Belum ada berita tersimpan. Buka Berita untuk memuat feed aplikasi.';
    const terms=q.split(' ').filter(t=>t.length>2&&!['berita','news','terbaru','apa','yang','ada','tentang','kabar','tolong','ringkas','ringkasan','sekarang','dong','nih','nggak','enggak','gak','kah','saya','aku','tampilkan','lihat','kasih','berikan'].includes(t));
    const selected=terms.length?items.filter(r=>terms.some(t=>norm(r.text+' '+r.textOriginal).includes(t))):items;
    return `Berita yang tersimpan · feed ${stamp(n.updated||n.capturedAt)}. Ini salinan feed terakhir, bukan jaminan berita paling baru.\n`+(selected.length?selected.slice(0,5).map((r,i)=>`${i+1}. ${String(r.text||r.textOriginal||r.title||'').slice(0,1400)}\nSumber: ${r.source||'SM_News_24h'} · ${stamp(r.time)}`).join('\n\n'):'Tidak ada berita tersimpan yang cocok. Buka Berita untuk memperbarui feed.');
  }
  function isSimJournalEntry(r){
    const mode=String(r?.accountMode||'').toUpperCase();
    if(mode==='SIM'||mode==='BACKTEST'||mode==='DEMO')return true;
    if(mode==='REAL')return false;
    return /backtest|sim/i.test(String(r?.source||''));
  }
  function evaluateDailyLossGuardSummary(realRows){
    const cfg=read('amy_daily_loss_guard_v1',{enabled:true,maxDailySl:2,maxDailyLossPct:3});
    if(!cfg||cfg.enabled===false)return '• Daily Loss Guard: Nonaktif.';
    if(root.AmyTraderInsights?.evaluateDailyLossGuard){
      try{
        const balance=Number(raw('amy_default_balance')||1000);
        const res=root.AmyTraderInsights.evaluateDailyLossGuard(realRows,{...cfg,balance});
        if(res)return `• Daily Loss Guard: ${res.status||res.level||'AMAN'} (Loss hari ini: ${res.todayLosses||0}/${cfg.maxDailySl||2} SL · PnL hari ini: ${res.todayNetUsd!=null?'$'+Number(res.todayNetUsd).toFixed(2):'$0.00'})`;
      }catch{}
    }
    const todayWita=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Makassar'});
    const todayRows=realRows.filter(r=>{
      const t=r.actualEntryTime||r.date||r.createdAt||'';
      if(!t)return false;
      if(String(t).slice(0,10)===todayWita)return true;
      const d=new Date(t);
      return !isNaN(d.getTime())&&d.toLocaleDateString('en-CA',{timeZone:'Asia/Makassar'})===todayWita;
    });
    const todaySl=todayRows.filter(r=>norm(r.result)==='loss').length;
    const todayNet=todayRows.reduce((s,r)=>{
      if(r.pnlMoney!=null&&Number.isFinite(Number(r.pnlMoney)))return s+Number(r.pnlMoney);
      return s+(Number(r.profit)||0)-(Number(r.loss)||0);
    },0);
    const maxSl=Number(cfg.maxDailySl||2);
    const balance=Number(raw('amy_default_balance')||1000);
    const lossPct=todayNet<0&&balance>0?(Math.abs(todayNet)/balance)*100:0;
    const maxPct=Number(cfg.maxDailyLossPct||3);
    const locked=todaySl>=maxSl||lossPct>=maxPct;
    return `• Daily Loss Guard: ${locked?'LOCKED / STOP TRADING HARI INI':'AMAN'} (${todaySl}/${maxSl} SL hari ini · Loss ${lossPct.toFixed(1)}%/${maxPct}% · Net hari ini $${todayNet.toFixed(2)})`;
  }
  function journal(q,data){
    const allRows=list(data?.rows);
    if(!allRows.length)return `Belum ada jurnal yang dapat dibaca.${data?.fallback?' Penyimpanan utama kosong/tidak tersedia; cache lokal juga kosong.':''}`;
    const realRows=allRows.filter(r=>!isSimJournalEntry(r));
    const simRows=allRows.filter(isSimJournalEntry);
    const asksSim=/\b(sim|simulasi|backtest|demo)\b/i.test(q);
    const activeLabel=asksSim&&simRows.length?'SIM/Backtest':(realRows.length?'REAL':'Semua');
    const rows=asksSim&&simRows.length?simRows:(realRows.length?realRows:allRows);

    const win=rows.filter(r=>norm(r.result)==='win').length,loss=rows.filter(r=>norm(r.result)==='loss').length,be=rows.filter(r=>['be','break even','breakeven'].includes(norm(r.result))).length;
    const profit=rows.reduce((s,r)=>s+(Number(r.profit)||(Number(r.pnlMoney)>0?Number(r.pnlMoney):0)||0),0);
    const lossAmount=rows.reduce((s,r)=>s+(Number(r.loss)||(Number(r.pnlMoney)<0?Math.abs(Number(r.pnlMoney)):0)||0),0);
    const netPips=rows.reduce((s,r)=>s+(Number(r.pnlPips||r.pips)||0),0);
    const completed=win+loss+be;
    const profitFactor=lossAmount>0?number(profit/lossAmount):(profit>0?'Infinity (tanpa loss)':'1.00');
    const avgWin=win>0?profit/win:0;
    const avgLoss=loss>0?lossAmount/loss:0;
    const winLossRatio=avgLoss>0?number(avgWin/avgLoss):'-';

    const hourProfits={};
    rows.forEach(r=>{
      const t = r.actualEntryTime || r.analysisTime || r.date || r.createdAt;
      if(t){
        const d = new Date(t);
        if(!isNaN(d.getTime())){
          const h = (d.getUTCHours() + 8) % 24; // WITA
          const p = Number(r.profit)||(Number(r.pnlMoney)>0?Number(r.pnlMoney):0)||0;
          hourProfits[h] = (hourProfits[h] || 0) + p;
        }
      }
    });
    let bestHour = null, maxHProfit = -Infinity;
    for(const [h, p] of Object.entries(hourProfits)){
      if(p > maxHProfit && p > 0){
        maxHProfit = p;
        bestHour = h;
      }
    }
    const bestHourStr = bestHour !== null ? `${String(bestHour).padStart(2,'0')}:00 WITA` : 'belum ada data jam';

    let text=`Jurnal (${activeLabel}: ${rows.length} trade | Total semua: ${allRows.length} = ${realRows.length} REAL, ${simRows.length} SIM/Backtest):\n`+
      `• Hasil ${activeLabel}: ${win} win, ${loss} loss, ${be} BE, ${rows.length-completed} belum selesai. Win rate ${completed?number(win/completed*100)+'%':'belum tersedia'}.\n`+
      `• Total profit ${number(profit)}, loss ${number(lossAmount)}, selisih bersih ${number(profit-lossAmount)} | Profit Factor: ${profitFactor} | Net Pips: ${number(netPips)}\n`+
      `• Rata-rata Win vs Loss: ${number(avgWin)} / ${number(avgLoss)} (Rasio: ${winLossRatio}) | Jam Terbaik: ${bestHourStr}`;

    if(root.AmyJournalAnalyticsPro?.formatForAssistant){
      try{
        const proText=root.AmyJournalAnalyticsPro.formatForAssistant(rows);
        if(proText)text+=`\n\nAnalitik Jurnal Pro (${activeLabel}):\n${proText}`;
      }catch{}
    }
    if(root.AmyJournalAnalyticsPro?.computeWeeklySnapshot){
      try{
        const wk=root.AmyJournalAnalyticsPro.computeWeeklySnapshot(rows);
        if(wk&&wk.total>0){
          text+=`\n• Evaluasi Mingguan (7H terakhir): ${wk.total} trade (${wk.wins}W/${wk.losses}L · WR ${wk.winRate}% · Net $${Number(wk.netUsd||0).toFixed(2)})${wk.topMistake?` · Kesalahan tersering: ${wk.topMistake}`:''}`;
        }
      }catch{}
    }

    const isEmotionQuery = /emosi|psikologi|mental|fomo|overtrade|revenge|disiplin/.test(q);
    const emotionTags = [];
    rows.forEach(r=>{
      const rawText = [r.emotion, r.mistake, r.mistakes, r.notes, r.evaluation].filter(Boolean).join(' ').toLowerCase();
      if(/fomo/.test(rawText)) emotionTags.push('FOMO');
      if(/overtrade|over trading/.test(rawText)) emotionTags.push('Overtrade');
      if(/revenge/.test(rawText)) emotionTags.push('Revenge Trading');
      if(/takut|fear/.test(rawText)) emotionTags.push('Fear of Loss');
      if(/serakah|greed/.test(rawText)) emotionTags.push('Greed');
      if(/geser sl|lebar sl|tanpa sl/.test(rawText)) emotionTags.push('Pelanggaran SL');
    });

    if(isEmotionQuery || emotionTags.length > 0){
      const counts = {};
      emotionTags.forEach(t => counts[t] = (counts[t] || 0) + 1);
      const tagSummary = Object.entries(counts).map(([k,v])=>`${k} (${v}x)`).join(', ') || 'tidak ada catatan emosi negatif terdeteksi';
      text += `\n• Pola Emosi & Disiplin: ${tagSummary}.`;
    }

    text += `\n${evaluateDailyLossGuardSummary(realRows)}`;
    const habitLine = habits();
    if(habitLine && !habitLine.startsWith('Belum ada data habits')) text += `\n${habitLine}`;

    if(data?.fallback)text+='\n• Sumber: cache lokal; penyimpanan utama IndexedDB tidak tersedia.';
    let sorted=rows.slice().sort((a,b)=>String(b.date||b.createdAt||'').localeCompare(String(a.date||a.createdAt||'')));
    const date=q.match(/\b20\d{2} \d{2} \d{2}\b/);if(date)sorted=sorted.filter(r=>r.date===date[0].replaceAll(' ','-'));
    if(/loss|rugi|kalah/.test(q))sorted=sorted.filter(r=>norm(r.result)==='loss');
    if(/win|menang/.test(q)&&!/rate|rasio/.test(q))sorted=sorted.filter(r=>norm(r.result)==='win');
    const fields=/evaluasi|kesalahan|emosi|disiplin|review|pelajaran/.test(q)?['evaluation','mistakes','lessons','emotion']:['setup'];
    text+='\n'+sorted.slice(0,5).map(r=>`${r.date||''} · [${isSimJournalEntry(r)?'SIM':'REAL'}] ${r.title||r.pair||'Jurnal'} · ${r.market||r.timeframe||''} · ${r.result||''}\n`+fields.map(f=>r[f]?`${({evaluation:'Evaluasi',mistakes:'Kesalahan',lessons:'Pelajaran',emotion:'Emosi',setup:'Setup'})[f]}: ${String(r[f]).slice(0,800)}`:'').filter(Boolean).join('\n')).join('\n');
    return text;
  }
  function academy(){
    const progV2=read('amy_academy_progress_v2',{})||{};
    const completedIds=list(progV2.completedIds);
    const quizScores=progV2.quizScores&&typeof progV2.quizScores==='object'?progV2.quizScores:{};
    const track=raw('amy_academy_track_v1')||'ict';
    const bookmarks=list(read('amy_academy_bookmarks_v1',[]));
    const readTopics=list(read('amy_read_topics',[]));
    const last=read('amy_academy_last_read_v2',{})||{};

    const doneSet=new Set(completedIds);
    const level0Done=LEVEL0_IDS.filter(id=>doneSet.has(id)).length;
    const completedCount=doneSet.size||new Set(readTopics).size;
    const pct=Math.min(100,Math.round((completedCount/TOTAL_ACADEMY_LESSONS)*100));

    const quizVals=Object.values(quizScores);
    const quizPassed=quizVals.filter(q=>q&&q.passed).length;
    const quizCorrect=quizVals.reduce((s,q)=>s+Number(q?.correct||0),0);
    const quizTotal=quizVals.reduce((s,q)=>s+Number(q?.total||0),0);

    const lines=[
      `Progres Amy FX Academy (7 Level / ${TOTAL_ACADEMY_LESSONS} Bab):`,
      `• Selesai: ${completedCount}/${TOTAL_ACADEMY_LESSONS} bab (${pct}%) | Jalur Aktif: ${track==='beginner'?'Pemula Level 0':'ICT Scalper'} | Bookmark: ${bookmarks.length}`,
      `• Kesiapan Level 0 (Pra-Trading & Dasar MT5): ${level0Done}/${LEVEL0_IDS.length} bab (${level0Done===LEVEL0_IDS.length?'SIAP NAIK KE LEVEL 01 ICT':'Masih proses fondasi pemula'})`,
      `• Terakhir dibaca: ${last.title||raw('amy_last_opened_title')||'belum tercatat'}${last.headingText?` — ${last.headingText} (${number(last.progress)}%)`:''}`
    ];
    if(quizVals.length){
      const acc=quizTotal>0?Math.round((quizCorrect/quizTotal)*100):0;
      lines.push(`• Kuis Bab: ${quizPassed}/${quizVals.length} lulus · Akurasi ${quizCorrect}/${quizTotal} (${acc}%)`);
    }
    const pracLine=practice();
    if(pracLine)lines.push(pracLine);
    return lines.join('\n');
  }
  function habits() {
    const habitList = list(read('amy_habits_v2', []));
    const completedDates = read('amy_completed_dates_v2', {}) || {};
    const defaultBal = Number(raw('amy_default_balance') || 0);
    const defaultRisk = Number(raw('amy_default_risk') || 0);

    const todayWita = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Makassar' });
    const todayDone = list(completedDates[todayWita]);
    const activeDates = Object.keys(completedDates)
      .filter(d => Array.isArray(completedDates[d]) && completedDates[d].length > 0)
      .sort()
      .reverse();

    let streak = 0;
    if (activeDates.length) {
      let cursor = new Date(todayWita + 'T00:00:00Z');
      for (let i = 0; i < 60; i++) {
        const iso = cursor.toISOString().slice(0, 10);
        if (Array.isArray(completedDates[iso]) && completedDates[iso].length > 0) {
          streak++;
        } else if (i > 0) {
          break;
        }
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
    }

    if (!habitList.length && !defaultBal) {
      return 'Belum ada data habits tersimpan. Buka menu Jurnal & Habits untuk mencatat target disiplin harian.';
    }

    return (
      (habitList.length > 0
        ? `• Disiplin & Habits: ${todayDone.length}/${habitList.length} habit selesai hari ini · Streak disiplin: ${streak} hari` +
          (defaultBal > 0 ? ` · Profil Risiko Tersimpan: Modal $${defaultBal.toFixed(0)}, Risiko ${defaultRisk || 1}%` : '')
        : defaultBal > 0
        ? `• Profil Risiko Tersimpan: Modal $${defaultBal.toFixed(0)}, Risiko ${defaultRisk || 1}%`
        : '')
    );
  }
  function calculateLot(rawQuery) {
    const text = String(rawQuery || '').replace(/,/g, '.');
    const lower = text.toLowerCase();
    const savedBal = Number(raw('amy_default_balance') || 0);
    const savedRisk = Number(raw('amy_default_risk') || 0);

    const balMatch =
      lower.match(/(?:modal|saldo|balance|ekuitas|equity|akun)\s*(?:rp|usd|\$)?\s*(\d+(?:\.\d+)?)/i) ||
      lower.match(/\$\s*(\d+(?:\.\d+)?)\b/);
    const riskPctMatch =
      lower.match(/(?:risiko|risk|resiko)\s*(\d+(?:\.\d+)?)\s*%/i) ||
      lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:risiko|risk|resiko)?/i);
    const riskUsdMatch = lower.match(/(?:risiko|risk|resiko)\s*\$\s*(\d+(?:\.\d+)?)/i);
    const entryMatch = lower.match(/(?:entry|masuk|buy|sell|harga)\s*(?:di|at|@)?\s*\$?\s*(\d{3,4}(?:\.\d+)?)/i);
    const slPriceMatch = lower.match(/(?:sl|stop\s*loss)\s*(?:di|at|@)?\s*\$?\s*(\d{3,4}(?:\.\d+)?)/i);
    const slPipsMatch = lower.match(/(?:sl|stop\s*loss|jarak)\s*(\d+(?:\.\d+)?)\s*(?:pips?|pip)/i);
    const slPtsMatch = lower.match(/(?:sl|stop\s*loss|jarak)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:poin|pts?|point|dollar|dolar)/i);

    const balance = balMatch ? Number(balMatch[1]) : savedBal > 0 ? savedBal : 1000;
    const riskPct = riskPctMatch ? Number(riskPctMatch[1]) : savedRisk > 0 ? savedRisk : 1.0;
    const liveFallback = getLivePrice();
    const entry = entryMatch ? Number(entryMatch[1]) : (slPriceMatch && liveFallback ? liveFallback : null);
    const slPrice = slPriceMatch ? Number(slPriceMatch[1]) : null;

    let slPoints = null;
    if (entry && slPrice && Math.abs(entry - slPrice) > 0.05) {
      slPoints = Math.abs(entry - slPrice);
    } else if (slPipsMatch) {
      slPoints = Number(slPipsMatch[1]) / 10;
    } else if (slPtsMatch) {
      slPoints = Number(slPtsMatch[1]);
    }

    if (!Number.isFinite(balance) || balance <= 0 || !Number.isFinite(slPoints) || slPoints <= 0) {
      const msg =
        `**Kalkulator Lot XAU/USD**\n` +
        `Sebutkan jarak SL (atau harga Entry & SL) agar saya bisa hitung lot presisinya, Sayang.\n` +
        `• Akun saat ini: Modal **$${balance.toFixed(0)}** · Risiko **${riskPct.toFixed(1)}%**\n` +
        `• Contoh: "Modal $1000 risiko 1% entry 3650 SL 3645" atau "Saldo $500 risk 1% SL 50 pips".`;
      return { ok: false, needsInput: true, balance, riskPct, text: msg, message: msg };
    }

    const riskUsd = riskUsdMatch ? Number(riskUsdMatch[1]) : balance * (riskPct / 100);
    const slPips = Math.round(slPoints * 10);
    const rawLot = riskUsd / (slPoints * 100);
    const safeLot = Math.max(0.01, Math.floor(rawLot * 100) / 100);
    const actualRiskUsd = safeLot * slPoints * 100;
    const actualRiskPct = (actualRiskUsd / balance) * 100;

    let direction = null;
    let tp1 = null;
    let tp2 = null;
    if (entry && slPrice) {
      direction = entry > slPrice ? 'BUY' : 'SELL';
      tp1 = direction === 'BUY' ? entry + slPoints * 1.5 : entry - slPoints * 1.5;
      tp2 = direction === 'BUY' ? entry + slPoints * 3.0 : entry - slPoints * 3.0;
    }

    const warnOverMin = rawLot < 0.01;
    const lines = [
      `**Kalkulator Lot & Risiko XAU/USD**`,
      `• Modal Akun: **$${balance.toFixed(2)}** | Target Risiko: **${riskPct.toFixed(1)}% ($${riskUsd.toFixed(2)})**`,
      entry && slPrice
        ? `• Setup **${direction}**: Entry **$${entry.toFixed(2)}** | SL **$${slPrice.toFixed(2)}** (Jarak **$${slPoints.toFixed(2)} / ${slPips} pips**)`
        : `• Jarak Stop Loss: **$${slPoints.toFixed(2)} (${slPips} pips)**`,
      `• Ukuran Lot Rekomendasi: **${safeLot.toFixed(2)} LOT** (Risiko aktual: **-$${actualRiskUsd.toFixed(2)}** / ${actualRiskPct.toFixed(2)}%)`
    ];

    if (tp1 && tp2) {
      lines.push(
        `• Proyeksi TP1 (1:1.5R): **$${tp1.toFixed(2)}** (+$${(actualRiskUsd * 1.5).toFixed(2)}) | TP2 Runner (1:3R): **$${tp2.toFixed(2)}** (+$${(actualRiskUsd * 3).toFixed(2)})`
      );
    }
    if (warnOverMin) {
      lines.push(
        `• Peringatan: Lot ideal (${rawLot.toFixed(3)}) di bawah minimum 0.01 lot standar. Pertimbangkan akun Cent (XAUUSDc) atau perketat jarak SL di struktur M5.`
      );
    }
    const outText = lines.join('\n');
    return {
      ok: true,
      needsInput: false,
      balance,
      riskPct,
      riskUsd: Number(riskUsd.toFixed(2)),
      slPoints: Number(slPoints.toFixed(2)),
      slPips,
      lot: Number(safeLot.toFixed(2)),
      actualRiskUsd: Number(actualRiskUsd.toFixed(2)),
      actualRiskPct: Number(actualRiskPct.toFixed(2)),
      direction,
      entry,
      slPrice,
      tp1: tp1 ? Number(tp1.toFixed(2)) : null,
      tp2: tp2 ? Number(tp2.toFixed(2)) : null,
      warnOverMin,
      text: outText
    };
  }
  function riskCalc(rawQuery) {
    return calculateLot(rawQuery).text;
  }
  function resolveCalendarEventTs(ev){
    if(ev&&Number.isFinite(Number(ev.timestampMs))&&Number(ev.timestampMs)>0)return Number(ev.timestampMs);
    if(ev&&ev.dateIso){const t=Date.parse(ev.dateIso);if(Number.isFinite(t))return t;}
    if(ev&&ev.date){const t=Date.parse(ev.date);if(Number.isFinite(t))return t;}
    return NaN;
  }
  function calendar(calData) {
    const data = calData || read('amyfx.market.calendar.v1') || read('amy_economic_calendar_v1') || read('amyfx.market.intel.v1', {})?.calendar;
    const events = list(data?.events || data?.items || data);
    if (!events.length) {
      return '• Kalender Ekonomi: Belum ada cache jadwal kalender tersimpan. Buka menu Berita & Kalender untuk sinkronisasi jadwal USD High-Impact.';
    }
    const nowMs = Date.now();
    const normalized = events.map(e => ({ ...e, _ts: resolveCalendarEventTs(e) }));
    const upcoming = normalized
      .filter(e => Number.isFinite(e._ts) && e._ts > nowMs)
      .sort((a, b) => a._ts - b._ts);
    const released = normalized
      .filter(e => e.actual && String(e.actual).trim() !== '' && String(e.actual).trim() !== '—')
      .slice(-3)
      .reverse();

    const lines = ['Kalender Ekonomi USD (Fokus XAU/USD)'];
    if (upcoming.length) {
      upcoming.slice(0, 3).forEach(ev => {
        const diffMin = Math.max(0, Math.round((ev._ts - nowMs) / 60000));
        const hours = Math.floor(diffMin / 60);
        const mins = diffMin % 60;
        const cd = hours > 24 ? `${Math.floor(hours / 24)}h ${hours % 24}j lagi` : hours > 0 ? `${hours}j ${mins}m lagi` : `${mins}m lagi`;
        lines.push(
          `• ${ev.title || ev.event} (${ev.impact || 'HIGH'}) — ${ev.timeWita || stamp(ev._ts)} (${cd}) | Forecast: ${ev.forecast || '—'} · Prev: ${ev.previous || '—'}`
        );
      });
    } else {
      lines.push('• Tidak ada jadwal USD High-Impact tersisa dalam waktu dekat.');
    }

    if (released.length) {
      lines.push('• Rilis Terakhir (Aktual vs Forecast):');
      released.forEach(ev => {
        const bias = ev.goldBias ? ` → ${ev.goldBias}` : '';
        lines.push(`  - ${ev.title || ev.event}: Aktual ${ev.actual} vs Forecast ${ev.forecast || '—'}${bias}`);
      });
    }
    return lines.join('\n');
  }
  function practice() {
    const masteryMap = read('amy-guided-v3-mastery', {}) || {};
    const entries = Object.entries(masteryMap).filter(([, v]) => v && Number(v.attempts) > 0);
    const report = read('amy-guided-v2-summary', {}) || {};
    const results = list(report.results);
    const review = list(report.review);

    if (!entries.length && !results.length) {
      return `Trading Practice (${TOTAL_PRACTICE_CASES} Kasus ICT · 8 Pilar): Belum ada riwayat latihan tersimpan. Mulai latihan analisa struktur & eksekusi di menu Trading Practice.`;
    }
    const lines = [`Ringkasan Trading Practice (${TOTAL_PRACTICE_CASES} Kasus ICT · 8 Pilar)`];
    if (entries.length) {
      const mastered = entries.filter(([, v]) => v.lastCorrect === true).length;
      const mistakes = entries.filter(([, v]) => v.lastCorrect === false);
      const masteryPct = Math.round((mastered / TOTAL_PRACTICE_CASES) * 100);
      lines.push(`• Progres Mastery 100 Kasus: ${mastered}/${TOTAL_PRACTICE_CASES} dikuasai (${masteryPct}%) · ${entries.length} kasus pernah dikerjakan · ${mistakes.length} kasus masih perlu diulang`);
      const weakTopics = [...new Set(mistakes.map(([, v]) => v.topic || v.category).filter(Boolean))];
      if (weakTopics.length) {
        lines.push(`• Pilar/Topik Lemah (Perlu Ulang Salah): ${weakTopics.slice(0, 5).join(', ')}`);
      }
    }
    if (results.length) {
      const correct = results.filter(r => r.correct === true).length;
      const pct = number((correct / results.length) * 100);
      lines.push(`• Skor Sesi Terakhir: ${correct}/${results.length} benar (${pct}%)`);
      if (review.length) {
        lines.push(`• Topik Perlu Diulang: ${review.map(t => t.title || t).slice(0, 5).join(', ')}`);
      } else if (correct < results.length) {
        lines.push(`• Ada ${results.length - correct} soal perlu dievaluasi ulang pada sesi terakhir.`);
      } else {
        lines.push(`• Semua soal pada sesi terakhir dijawab benar. Mantap, Sayang!`);
      }
    }
    return lines.join('\n');
  }
  const stop=new Set('apa itu adalah jelaskan jelasin tolong saya aku dong nih yang dengan dan di ke dari tentang bagaimana kenapa mengapa cara materi belajar tutorial arti maksud pengertian contoh nya'.split(' '));
  function knowledge(q){
    const tokens=q.split(' ').filter(t=>t.length>1&&!stop.has(t));if(!tokens.length)return null;
    const ranked=list(root.AmyLocalKnowledge).map(row=>{const title=norm(row.title),body=norm(row.text);return {row,score:tokens.reduce((s,t)=>s+(title.includes(t)?5:body.includes(t)?1:0),0),hits:tokens.filter(t=>title.includes(t)||body.includes(t)).length};}).filter(r=>r.hits===tokens.length).sort((a,b)=>b.score-a.score);
    const match=ranked[0];if(!match)return null;
    return {text:`Dari materi Academy: ${match.row.title}\n${match.row.text}`,links:[{label:'Buka materi lengkap',path:match.row.path}]};
  }
  async function ask(question){
    let q=norm(question).slice(0,2000);const links=[];let text='';
    let intents=intent(q);
    const follow=/^(lalu|terus|kenapa|mengapa|jelaskan|detail|lanjut|yang terakhir|berapa|bagaimana)( itu| lagi| dong| nya)?$/.test(q);
    if(follow&&lastIntent){intents=lastIntent.split(',');q=lastQuery+' '+q;}
    const definition=/\b(apa itu|pengertian|definisi|arti|contoh|jelaskan konsep|cara kerja|perbedaan|bedanya)\b/.test(q);
    if(definition){await knowledgeReady;const k=knowledge(q);if(k){text=k.text;links.push(...k.links);intents=[];}else if(!/saya|aku|sekarang|terakhir/.test(q)){text='Belum menemukan penjelasan yang cocok di indeks materi. Coba nama konsep yang lebih spesifik, misalnya FVG, liquidity sweep, atau order block.';links.push({label:'Buka Tutorial Trading',path:routes.academy[1]});}}
    if(!text&&/^(hai|halo|hi|pagi|siang|malam|terima kasih|makasih)$/.test(q))text='Halo, saya Amy, asisten lokal aplikasi. Saya bisa membaca Mapping, berita tersimpan, jurnal, progres belajar, dan mencari penjelasan dari materi Academy. Apa yang ingin kamu cek?';
    if(!text&&/\b(versi|version|update|pembaruan)\b/.test(q)){text=`Versi aplikasi ${root.AmyFXAppVersion?.name||'lihat Profil → Versi Aplikasi'}. Untuk pembaruan, buka Profil → Versi Aplikasi. Notifikasi mengikuti manifest rilis yang sudah diterbitkan.`;links.push({label:'Buka Beranda / Profil',path:'index.html'});}
    if(/semua menu|semua modul|ringkasan aplikasi/.test(q))intents=['mapping','news','journal','academy'];
    if(!text&&intents.length){
      const parts=[];
      for(const id of intents){
        if(id==='mapping')parts.push(mapping(q,root.AmyICTMapping||read('amyfx.ict.mapping.v1'),Date.now()));
        if(id==='news')parts.push(news(q,read('amyfx.assistant.news.v1')||read('amyfx.market.intel.v1',{})?.news));
        if(id==='calendar')parts.push(calendar());
        if(id==='journal')parts.push(journal(q,await journals()));
        if(id==='habits')parts.push(habits());
        if(id==='kalkulator')parts.push(riskCalc(question));
        if(id==='practice')parts.push(practice());
        if(id==='academy')parts.push(academy());
        if(routes[id])links.push({label:'Buka '+routes[id][0],path:routes[id][1]});
      }
      text=parts.filter(Boolean).join('\n\n');lastIntent=intents.join(',');lastQuery=q;
    }
    if(!text){await knowledgeReady;const k=knowledge(q);if(k){text=k.text;links.push(...k.links);}}
    if(!text)text='Saya belum bisa menentukan maksud pertanyaan ini. Sebutkan data atau topiknya, misalnya “harga di Mapping”, “berita terbaru”, “evaluasi jurnal saya”, “progres belajar”, atau “apa itu FVG”. Jawaban saya berasal dari data dan materi aplikasi; pertanyaan bebas di luar cakupan itu belum didukung.';
    return {text,links,provider:'amy-local',model:'local-app-rules-v1',source:'Data lokal Amy FX Pro'};
  }
  function mount(){
    if(!root.document?.body||document.getElementById('amy-local-root'))return;
    const hasBottomNav=Boolean(document.querySelector('nav.bottom-nav, .home-bottom-nav, #homeBottomNav'));
    const style=document.createElement('style');style.textContent=`#amy-local-root{font:14px/1.6 system-ui;color:#e4edf8;position:relative;z-index:2147483640;pointer-events:auto}#amy-local-root [hidden]{display:none!important}#amy-local-root button,#amy-local-root input,#amy-local-root a{font:inherit}@keyframes aiSparkBreathe{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.12);opacity:0.82}}#amy-local-fab{position:fixed;right:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:10000;display:inline-flex;align-items:center;gap:6px;background:rgba(15,23,40,0.92);backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%);border:1px solid rgba(245,196,81,0.42);border-radius:9999px;color:#f8fafc;font-size:11px;font-weight:750;letter-spacing:0.04em;padding:7px 13px;box-shadow:0 8px 22px rgba(0,0,0,0.42);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}#amy-local-fab.has-bottom-nav{bottom:calc(82px + env(safe-area-inset-bottom,0px))}#amy-local-fab:hover{transform:translateY(-1px);border-color:rgba(245,196,81,0.78);box-shadow:0 12px 28px rgba(0,0,0,0.52)}#amy-local-fab:active{transform:scale(0.97)}#amy-local-fab .ai-spark{color:#f5c451;font-size:12.5px;line-height:1;display:inline-block;animation:aiSparkBreathe 2.8s infinite ease-in-out}html[data-amyfx-theme="light"] #amy-local-fab,html[data-theme="light"] #amy-local-fab{background:rgba(255,255,255,0.95);color:#0f172a;border-color:rgba(180,118,8,0.34);box-shadow:0 8px 22px rgba(15,23,42,0.14)}html[data-amyfx-theme="light"] #amy-local-fab .ai-spark,html[data-theme="light"] #amy-local-fab .ai-spark{color:#b45309}#amy-local-panel{position:fixed;right:14px;bottom:calc(74px + env(safe-area-inset-bottom,0px));width:min(430px,calc(100vw - 24px));height:min(600px,75dvh);max-height:75vh;z-index:10001;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(16,24,45,0.96) 0%,rgba(8,12,22,0.98) 100%);backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);border:1px solid rgba(245,196,81,0.3);border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,0.75);overflow:hidden;pointer-events:auto}#amy-local-panel header,#amy-local-panel form{display:flex;gap:8px;padding:12px;background:rgba(20,29,51,0.9)}#amy-local-panel header strong{flex:1;color:#f8fafc;font-weight:800}#amy-local-panel button{background:rgba(245,196,81,0.15);color:#f5c451;border:1px solid rgba(245,196,81,0.35);border-radius:10px;padding:8px 12px;cursor:pointer;font-weight:700}#amy-local-panel button:hover{background:rgba(245,196,81,0.25)}#amy-local-panel input{min-width:0;flex:1;background:rgba(7,11,20,0.8);color:white;border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:8px 12px}#amy-local-messages{overflow:auto;flex:1;padding:12px;overscroll-behavior:contain}#amy-local-messages p{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 14px;padding:12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)}#amy-local-messages a{color:#60a5fa;display:block}#amy-local-panel small{padding:4px 12px 0;color:#94a3b8;font-size:11px}#amy-local-panel .prompts{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px}#amy-local-panel .prompts button{background:rgba(255,255,255,0.06);color:#cbd5e1;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:5px 10px;font-size:11px}#amy-local-panel .prompts button:hover{border-color:rgba(245,196,81,0.5);color:#fff}`;document.head.appendChild(style);
    const host=document.createElement('div');host.id='amy-local-root';host.innerHTML=`<button id="amy-local-fab" class="${hasBottomNav?'has-bottom-nav':''}" type="button" aria-label="Buka Asisten Amy"><span class="ai-spark">✦</span><span>AMY</span></button><section id="amy-local-panel" hidden aria-label="Asisten Amy"><header><strong>Amy · Asisten aplikasi</strong><button type="button" id="amy-local-close" aria-label="Tutup asisten">Tutup</button></header><small>Lokal · tanpa API AI / LLM · membaca data aplikasi</small><div class="prompts"></div><div id="amy-local-messages" aria-live="polite"></div><form><input aria-label="Pertanyaan untuk Amy" placeholder="Tanya data atau materi aplikasi…" maxlength="2000"><button type="submit">Kirim</button></form></section>`;document.body.appendChild(host);
    const panel=host.querySelector('section'),input=host.querySelector('input'),messages=host.querySelector('#amy-local-messages'),fab=host.querySelector('#amy-local-fab');
    const open=()=>{try{if(typeof window.AmyFXCloseVideoReel==='function')window.AmyFXCloseVideoReel();}catch(_){}document.querySelectorAll('dialog[open]').forEach(d=>{if(!d.closest('#amy-local-root')){try{d.close();}catch(_){}d.removeAttribute('open');if(d.classList.contains('amy-reel-dialog'))d.style.display='none';}});panel.hidden=false;fab.hidden=true;input.focus();};const close=()=>{panel.hidden=true;fab.hidden=false;fab.focus();};fab.onclick=open;host.querySelector('#amy-local-close').onclick=close;panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();});root.addEventListener('amyfx:open-mentor',open);
    function append(text,links=[]){const p=document.createElement('p');p.textContent=text;messages.appendChild(p);links.forEach(l=>{try{const url=new URL(l.path,base);if(!url.href.startsWith(base))return;const a=document.createElement('a');a.href=url.href;a.textContent=l.label;p.appendChild(a);}catch{}});while(messages.children.length>40)messages.firstChild.remove();messages.scrollTop=messages.scrollHeight;}
    let busy=false;async function send(q){if(busy||!q.trim())return;busy=true;input.value='';append('Anda: '+q);const button=host.querySelector('form button');button.disabled=true;try{const r=await ask(q);append(r.text,r.links);}catch{append('Data belum dapat dibaca. Buka menu terkait lalu coba lagi.');}finally{busy=false;button.disabled=false;input.focus();}}
    host.querySelector('form').onsubmit=e=>{e.preventDefault();send(input.value);};['Harga Mapping','Berita terbaru','Evaluasi jurnal saya','Progres belajar'].forEach(q=>{const b=document.createElement('button');b.type='button';b.textContent=q;b.onclick=()=>send(q);host.querySelector('.prompts').appendChild(b);});
    append('Saya membaca data aplikasi yang tersimpan dan materi Academy. Pilih pertanyaan di atas atau tulis pertanyaanmu.');
    // Knowledge is packaged JavaScript, loaded locally; no network AI call.
    if(script){knowledgeReady=new Promise(resolve=>{const s=document.createElement('script');const timer=setTimeout(resolve,5000);const done=()=>{clearTimeout(timer);resolve();};s.onload=done;s.onerror=done;s.src=new URL('amy-local-knowledge.js',script).href;document.head.appendChild(s);});const g=document.createElement('script');g.src=new URL('amy-gemini-live-bridge.js',script).href;g.async=true;document.head.appendChild(g);}
  }
  function openWithPrompt(promptText) {
    if (!root.document) return false;
    root.dispatchEvent(new CustomEvent('amyfx:open-mentor'));
    const q = String(promptText || '').trim();
    if (!q) return true;
    setTimeout(() => {
      const panel = document.getElementById('amy-local-panel');
      const form = panel?.querySelector('form');
      const input = form?.querySelector('input');
      if (input && form) {
        input.value = q;
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 120);
    return true;
  }
  root.AmyLocalAssistant=Object.freeze({ask,intent,mapping,news,journal,academy,knowledge,habits,riskCalc,calculateLot,calendar,practice,openWithPrompt,getLivePrice,buildMappingSnapshot,readJournals:journals,isWeekendClosure:isWeekendClosureWita,getReactionHistoryToday:getReactionHistoryTodaySummary});
  if(root.document){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();}
})(typeof window==='undefined'?globalThis:window);
