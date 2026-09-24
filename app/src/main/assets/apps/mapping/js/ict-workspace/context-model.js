export function currentContext(payload,now=Date.now()) {
  const run=payload?.engine,context=payload?.context;
  if(payload?.ok!==true||payload?.mode!=='market_context'||run?.status!=='COMPLETED'||
      run?.result?.engine!=='amyfx-gold-context-v1'||context?.version!=='amyfx-gold-context-v1'||context?.fresh!==true)return null;
  const completed=Date.parse(run.completed_at),m1=Number(context.source?.M1),m15=Number(context.source?.M15),h1=Number(context.source?.H1);
  if(!Number.isFinite(completed)||now-completed< -30000||now-completed>150000)return null;
  if(![m1,m15,h1].every(Number.isFinite)||!m1||!m15||!h1)return null;
  if(now/1000-m1<0||now/1000-m1>180||now/1000-m15>2100||now/1000-h1>10800)return null;
  return context;
}
