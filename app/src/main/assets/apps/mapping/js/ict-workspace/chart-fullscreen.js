// Move the existing chart, preserving its candles, viewport and touch listeners.
export function mountChartFullscreen(view,drawingTool=null){
  const workspace=document.getElementById('gold-chart-workspace');
  const button=document.getElementById('chart-fullscreen');
  if(!workspace||!button)return null;
  const placeholder=document.createComment('Gold chart position');
  const token='gold-'+Date.now();
  let active=false,scrollY=0,baseState=null,pendingBack=false,nativeActive=false;
  const ownsHistory=()=>history.state?.amyfxGoldFullscreen===token;
  const resize=()=>requestAnimationFrame(()=>{view?.resize();drawingTool?.repaint?.();});
  function layout(enabled,restore=true){
    if(active===enabled)return;
    active=enabled;
    if(enabled){
      scrollY=window.scrollY;
      workspace.parentNode.insertBefore(placeholder,workspace);
      document.body.appendChild(workspace);
      workspace.setAttribute('role','dialog');workspace.setAttribute('aria-modal','true');
    }else{
      if(placeholder.parentNode)placeholder.parentNode.replaceChild(workspace,placeholder);
      workspace.removeAttribute('role');workspace.removeAttribute('aria-modal');
    }
    document.body.classList.toggle('mapping-chart-fullscreen',enabled);
    workspace.classList.toggle('is-fullscreen',enabled);
    button.classList.toggle('is-exit',enabled);
    button.innerHTML=enabled
      ?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg><span>Keluar</span>'
      :'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
    button.setAttribute('title',enabled?'Keluar fullscreen Chart Gold':'Fullscreen Chart Gold');
    button.setAttribute('aria-label',enabled?'Keluar fullscreen Chart Gold':'Buka fullscreen Chart Gold');
    button.setAttribute('aria-pressed',String(enabled));
    view?.setFullscreen(enabled);
    drawingTool?.setFullscreen?.(enabled);
    const drawBtn=document.getElementById('btn-chart-draw');
    if(drawBtn&&typeof drawingTool?.isToolbarVisible==='function'){
      const vis=drawingTool.isToolbarVisible();
      drawBtn.classList.toggle('is-active',vis);
      drawBtn.setAttribute('aria-pressed',String(vis));
    }
    requestAnimationFrame(()=>{
      view?.resize();
      drawingTool?.repaint?.();
      if(restore&&!enabled)window.scrollTo(0,scrollY);
      if(restore)button.focus({preventScroll:true});
    });
  }
  function exitNative(){
    nativeActive=false;
    if(document.fullscreenElement===workspace&&document.exitFullscreen){
      try{Promise.resolve(document.exitFullscreen()).catch(()=>{});}catch{}
    }
  }
  function close(){
    if(!active)return;
    exitNative();layout(false);
    if(ownsHistory()){pendingBack=true;history.back();}
  }
  button.addEventListener('click',()=>{
    if(pendingBack)return;
    if(active){close();return;}
    baseState=history.state;
    // A same-document history entry lets Android's existing Back handler exit first.
    try{history.pushState({...baseState,amyfxGoldFullscreen:token},'',location.href);}catch{}
    layout(true);
    // Android WebView uses the viewport portal, just like Candle Replay.
    if(!window.Android&&workspace.requestFullscreen){
      try{Promise.resolve(workspace.requestFullscreen()).then(()=>{
        if(!active)exitNative();
      }).catch(()=>{});}catch{}
    }
  });
  window.addEventListener('popstate',()=>{pendingBack=false;if(active){exitNative();layout(false);}});
  document.addEventListener('fullscreenchange',()=>{
    if(document.fullscreenElement===workspace)nativeActive=true;
    else if(nativeActive)close();
  });
  document.addEventListener('keydown',event=>{if(active&&event.key==='Escape'){event.preventDefault();close();}});
  window.addEventListener('resize',resize);
  window.visualViewport?.addEventListener('resize',resize);
  window.addEventListener('pagehide',()=>{
    exitNative();layout(false,false);
    if(ownsHistory())try{history.replaceState(baseState,'',location.href);}catch{}
    pendingBack=false;
  });
  return {close};
}
