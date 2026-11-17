export type RadarBar = { symbol:string; date:string; open:number; high:number; low:number; close:number; volume:number; news_score?:number; news_published_at?:string };
type Signal = { symbol:string; signalDate:string; entryDate:string; score:number; entryPrice:number; targetPrice:number; stopPrice:number; outcome:"TARGET"|"STOP"|"TIMEOUT"; returnPct:number; reasons:string[]; components:{flow:number;volume:number;momentum:number;news:number;trend:number} };
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const mean=(a:number[])=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
function ema(a:number[],p:number){const out:number[]=[];const k=2/(p+1);a.forEach((v,i)=>out.push(i===0?v:v*k+out[i-1]*(1-k)));return out;}
function rsi(a:number[],i:number,p=14){if(i<p)return 50;let g=0,l=0;for(let j=i-p+1;j<=i;j++){const d=a[j]-a[j-1];if(d>0)g+=d;else l-=d;}if(l===0)return 100;const rs=(g/p)/(l/p);return 100-100/(1+rs);}
function evaluate(bars:RadarBar[]):Signal[]{
 const rows=[...bars].sort((a,b)=>a.date.localeCompare(b.date));if(rows.length<28)return [];
 const c=rows.map(x=>x.close),v=rows.map(x=>x.volume),f=ema(c,12),s=ema(c,26),m=c.map((_,i)=>f[i]-s[i]),ms=ema(m,9),obv=[0];
 for(let i=1;i<rows.length;i++)obv.push(obv[i-1]+(c[i]>c[i-1]?v[i]:c[i]<c[i-1]?-v[i]:0));
 const out:Signal[]=[];
 // Signal features use only bars up to i. Future bars are read only for outcome evaluation.
 for(let i=26;i<rows.length-2;i++){
  const b=rows[i],avg=mean(v.slice(i-20,i)),rvol=avg?v[i]/avg:0,sma=mean(c.slice(i-19,i+1)),priorHigh=Math.max(...rows.slice(i-20,i).map(x=>x.high)),r=rsi(c,i),hist=m[i]-ms[i],prevHist=m[i-1]-ms[i-1];
  const flow=(obv[i]>obv[i-5]&&c[i]>c[i-5]?15:0)+(c[i]>c[i-1]&&v[i]>=mean(v.slice(i-4,i+1))?10:0);
  const vol=rvol>=2?20:rvol>=1.5?15:rvol>=1.2?10:rvol>=.8?5:0;
  const mom=(r>=52&&r<=68?12:r>50&&r<75?8:0)+(hist>prevHist&&hist>0?8:hist>prevHist?4:0);
  const validNews=Number.isFinite(b.news_score)&&!!b.news_published_at&&String(b.news_published_at).slice(0,10)<=b.date;
  const news=validNews?clamp(Number(b.news_score),0,20):0;
  const trend=(b.close>sma?7:0)+(b.close>priorHigh?8:0),score=flow+vol+mom+news+trend;
  if(score<65)continue;
  const entry=rows[i+1],price=entry.open;if(!(price>0))continue;
  const target=price*1.03,stop=price*.98;let outcome:Signal["outcome"]="TIMEOUT",ret=(rows[i+2].close/price-1)*100;
  for(const future of [rows[i+1],rows[i+2]]){const stopHit=future.low<=stop,targetHit=future.high>=target;if(stopHit){outcome="STOP";ret=-2;break;}if(targetHit){outcome="TARGET";ret=3;break;}}
  const reasons:string[]=[];if(flow>=15)reasons.push("تحسن تدفق الحجم");if(rvol>=1.5)reasons.push("حجم التداول "+rvol.toFixed(1)+"× المتوسط");if(mom>=12)reasons.push("زخم إيجابي");if(news>0)reasons.push("خبر مؤرخ قبل الإشارة");if(trend>=7)reasons.push("السعر أعلى من متوسط 20 جلسة");if(!validNews)reasons.push("لا توجد درجة أخبار مؤرخة");
  out.push({symbol:b.symbol,signalDate:b.date,entryDate:entry.date,score,entryPrice:price,targetPrice:target,stopPrice:stop,outcome,returnPct:ret,reasons,components:{flow,volume:vol,momentum:mom,news,trend}});
 }
 return out;
}
export function runRadarBacktest(input:RadarBar[]){
 const groups=new Map<string,RadarBar[]>();
 for(const row of input){const symbol=String(row.symbol||"").trim().toUpperCase();if(!symbol||!/^\d{4}-\d{2}-\d{2}$/.test(row.date))continue;if(![row.open,row.high,row.low,row.close,row.volume].every(Number.isFinite)||row.open<=0||row.low<=0||row.close<=0||row.high<row.low||row.volume<0)continue;const list=groups.get(symbol)||[];list.push({...row,symbol});groups.set(symbol,list);}
 const signals=[...groups.values()].flatMap(evaluate).sort((a,b)=>b.signalDate.localeCompare(a.signalDate)||b.score-a.score);
 const wins=signals.filter(x=>x.outcome==="TARGET").length,stops=signals.filter(x=>x.outcome==="STOP").length,timeouts=signals.length-wins-stops;
 const avg=signals.length?mean(signals.map(x=>x.returnPct)):0;
 return {settings:{universe:"all",horizonSessions:2,risk:"balanced",threshold:65,targetPct:3,stopPct:2},coverage:{symbols:groups.size,inputRows:input.length,usableRows:[...groups.values()].reduce((n,x)=>n+x.length,0)},metrics:{signals:signals.length,wins,stops,timeouts,winRatePct:signals.length?wins/signals.length*100:0,averageReturnPct:avg,averageScore:signals.length?mean(signals.map(x=>x.score)):0},signals:signals.slice(0,300),methodology:{signalAt:"after close; features use data through signal date only",entryAt:"next session open",outcomeWindow:"next two trading sessions",sameCandleRule:"stop-first if target and stop touched in same candle",newsRule:"news used only if publication date is on/before signal date"}};
}
