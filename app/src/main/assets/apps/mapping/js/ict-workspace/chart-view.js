// Shared presentation only; candle/model ownership remains with each caller.
export function createPriceChart(element) {
  const chart=window.LightweightCharts.createChart(element,{autoSize:true,
    timeScale:{timeVisible:true},rightPriceScale:{minimumWidth:65},
    handleScale:{pinch:true,axisPressedMouseMove:true},handleScroll:{vertTouchDrag:false}});
  const series=chart.addCandlestickSeries({upColor:'#65d5b1',downColor:'#ff8f9b',borderVisible:false,wickUpColor:'#65d5b1',wickDownColor:'#ff8f9b'});
  let key='',lines=[];
  function theme(){
    const light=document.documentElement.dataset.amyfxTheme==='light';
    chart.applyOptions({layout:{background:{color:light?'#edf1fc':'#293b60'},textColor:light?'#475977':'#ced9ed'},
      grid:{vertLines:{color:light?'#dce3f2':'#3c5176'},horzLines:{color:light?'#dce3f2':'#3c5176'}}});
  }
  theme();window.addEventListener('amyfx:theme-change',theme);
  return {
    draw(result,plan=result.plan){
      const next=result.tf+JSON.stringify(result.candles);
      if(next!==key){const initial=!key;series.setData(result.candles);key=result.candles.length?next:'';if(initial&&result.candles.length)chart.timeScale().fitContent();}
      lines.forEach(line=>series.removePriceLine(line));lines=[];
      if(plan)for(const [field,title,color] of [['entry','ENTRY','#8bb9ff'],['sl','SL','#ff8f9b'],['tp1','TP1','#65d5b1'],['tp','TARGET','#65d5b1']]){
        if(Number.isFinite(plan[field]))lines.push(series.createPriceLine({price:plan[field],title,color,lineWidth:1,axisLabelVisible:true}));
      }
    },
    reset(){key='';},
    resize(){chart.applyOptions({autoSize:true});},
    destroy(){window.removeEventListener('amyfx:theme-change',theme);chart.remove();}
  };
}
