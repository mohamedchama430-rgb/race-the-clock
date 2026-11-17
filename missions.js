/* Installation-local cosmetic economy. Not a server-authoritative anti-cheat.
   Clock high-water marks prevent ordinary backward-clock reclaims; clearing or
   editing browser storage can reset this data. No existing game save is changed. */
(function(){
'use strict';
const BASE_KEY='rtc_missions_v1',DAY=86400000,MAX_COINS=1000000000;
let KEY=BASE_KEY+':guest',account='';
const TASKS={daily:[
 {id:'time',event:'seconds',title:{en:'Survive for 3 minutes',ar:'اصمد لمدة 3 دقائق'},target:180,reward:30},
 {id:'pickups',event:'pickups',title:{en:'Collect 6 pickups',ar:'اجمع 6 تعزيزات'},target:6,reward:30},
 {id:'stages',event:'stages',title:{en:'Clear 3 stages',ar:'أكمل 3 مراحل'},target:3,reward:40}
],weekly:[
 {id:'time',event:'seconds',title:{en:'Survive for 30 minutes',ar:'اصمد لمدة 30 دقيقة'},target:1800,reward:120},
 {id:'pickups',event:'pickups',title:{en:'Collect 40 pickups',ar:'اجمع 40 تعزيزًا'},target:40,reward:120},
 {id:'bosses',event:'bosses',title:{en:'Defeat 5 bosses',ar:'اهزم 5 زعماء'},target:5,reward:160}
]};
const SKINS=[
 {id:'classic',name:{en:'Classic',ar:'كلاسيكي'},cost:0,color:'#fff2bd',accent:'#f2c14e',style:'classic'},
 {id:'mint',name:{en:'Mint pulse',ar:'نبض النعناع'},cost:100,color:'#b9ffe4',accent:'#46d6ae',style:'ring'},
 {id:'violet',name:{en:'Violet orbit',ar:'مدار بنفسجي'},cost:250,color:'#e5d3ff',accent:'#a583ff',style:'orbit'},
 {id:'ember',name:{en:'Ember',ar:'جمرة'},cost:0,color:'#ffe3c0',accent:'#ff9564',style:'diamond',achievement:{event:'bosses',target:10,description:{en:'Defeat 10 bosses across your runs',ar:'اهزم 10 زعماء عبر جولاتك'}}},
 {id:'aurora',name:{en:'Aurora',ar:'الشفق'},cost:700,color:'#c8f6ff',accent:'#79caff',style:'star'},
 {id:'frost',name:{en:'Frost',ar:'صقيع'},cost:300,color:'#e2fbff',accent:'#70d7ff',style:'frost'},
 {id:'phantom',name:{en:'Phantom',ar:'الشبح'},cost:0,color:'#e6ddff',accent:'#aa8ce8',style:'phantom',achievement:{event:'flawlessBoss',target:1,description:{en:'Defeat a boss without being hit, including shield hits',ar:'اهزم زعيمًا دون أي إصابة، حتى مع الدرع'}}}
];
const listeners=new Set();let available=true,queue=Promise.resolve(),state;
const clone=x=>JSON.parse(JSON.stringify(x));
const int=(x,max=MAX_COINS)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
function current(){const day=Math.floor(Date.now()/DAY);return {day,week:day-((day+3)%7+7)%7};}
function fresh(){const p=current();return {version:1,day:p.day,week:p.week,balance:0,owned:['classic'],selected:'classic',daily:{},weekly:{},lifetime:{bosses:0,flawlessBoss:0}};}
function normalize(raw){
 const s=fresh();if(!raw||raw.version!==1)return s;
 if(int(raw.day,10000000))s.day=raw.day;if(int(raw.week,10000000))s.week=raw.week;
 if(int(raw.balance))s.balance=raw.balance;
 // Additive v1 migration: pre-achievement wallets retain purchases, selection,
 // balances and mission claims. Historical boss totals were never recorded.
 for(const event of ['bosses','flawlessBoss'])if(int(raw.lifetime?.[event]))s.lifetime[event]=raw.lifetime[event];
 s.owned=SKINS.filter(k=>k.id==='classic'||Array.isArray(raw.owned)&&raw.owned.includes(k.id)).map(k=>k.id);
 if(s.owned.includes(raw.selected))s.selected=raw.selected;
 for(const period of ['daily','weekly'])for(const task of TASKS[period]){
  const row=raw[period]?.[task.id];if(!row||!Number.isFinite(row.progress)||row.progress<0)continue;
  s[period][task.id]={progress:Math.min(task.target,row.progress),claimed:row.claimed===true};
 }
 return s;
}
function read(){try{const raw=localStorage.getItem(KEY);return normalize(raw?JSON.parse(raw):null);}catch(e){if(e instanceof SyntaxError)return fresh();available=false;return null;}}
function roll(s){const p=current();const day=Math.max(s.day,p.day,state?.day||0),week=Math.max(s.week,p.week,state?.week||0);if(day!==s.day){s.day=day;s.daily={};}if(week!==s.week){s.week=week;s.weekly={};}return s;}
state=read()||fresh();
function selectAccount(){
 let name='' ;try{const p=JSON.parse(localStorage.getItem('rc_player')||'null');if(typeof p?.name==='string')name=p.name.normalize('NFKC').trim().toLowerCase();}catch(e){}
 const next=BASE_KEY+':'+(name?encodeURIComponent(name):'guest');if(next!==KEY){KEY=next;account=name;state=read()||fresh();}
}
function snapshot(){
 selectAccount();
 const latest=read();if(latest)state=roll(latest);else state=roll(state);
 const iso=n=>new Date(n*DAY).toISOString().slice(0,10);
 const out={balance:state.balance,selectedSkin:state.selected,storageAvailable:available,localOnly:true,account:account||null,lifetime:clone(state.lifetime),
 periods:{daily:iso(state.day),weekly:iso(state.week),dailyReset:new Date((state.day+1)*DAY).toISOString(),weeklyReset:new Date((state.week+7)*DAY).toISOString()},
 skins:SKINS.map(k=>{
  const owned=state.owned.includes(k.id),a=k.achievement;
  const unlock=a?{type:'achievement',event:a.event,target:a.target,progress:Math.min(a.target,state.lifetime[a.event]),description:clone(a.description)}:
   {type:k.cost?'coins':'free',description:k.cost?{en:'Buy with '+k.cost+' mission coins',ar:'اشترِ مقابل '+k.cost+' قطعة من المهام'}:{en:'Included',ar:'متاح مجانًا'}};
  return {...clone(k),owned,equipped:state.selected===k.id,purchasable:!owned&&unlock.type==='coins',unlock};
 })};
 for(const period of ['daily','weekly'])out[period]=TASKS[period].map(t=>{const row=state[period][t.id]||{};return {...clone(t),progress:row.progress||0,claimed:row.claimed===true,complete:(row.progress||0)>=t.target};});
 return out;
}
function notify(){const s=snapshot();for(const fn of listeners){try{fn(s);}catch(e){console.error('Mission subscriber failed',e);}}window.dispatchEvent(new CustomEvent('rtc-missions-change',{detail:s}));}
function transaction(change){
 selectAccount();const transactionKey=KEY;
 const execute=()=>{
  selectAccount();if(KEY!==transactionKey)return {ok:false,reason:'account',snapshot:snapshot()};
  const loaded=read();if(!loaded)return {ok:false,reason:'storage',snapshot:snapshot()};
  const next=roll(loaded),reason=change(next);
  if(reason)return {ok:false,reason,snapshot:snapshot()};
  try{localStorage.setItem(KEY,JSON.stringify(next));available=true;state=next;}
  catch(e){available=false;return {ok:false,reason:'storage',snapshot:{...snapshot(),storageAvailable:false}};}
  notify();return {ok:true,snapshot:snapshot()};
 };
 const run=()=>navigator.locks?.request?navigator.locks.request(transactionKey+':transaction',execute):execute();
 const pending=queue.then(run,run);queue=pending.catch(()=>{});return pending;
}
const API={snapshot,
 record(event,amount=1){
  if(!['seconds','stages','bosses','flawlessBoss','pickups','near','clean'].includes(event)||!Number.isFinite(amount)||amount<=0||amount>(event==='seconds'?3600:100)||event!=='seconds'&&!Number.isInteger(amount))return Promise.resolve({ok:false,reason:'invalid',snapshot:snapshot()});
  return transaction(s=>{
   for(const period of ['daily','weekly'])for(const t of TASKS[period])if(t.event===event){const r=s[period][t.id]||(s[period][t.id]={progress:0,claimed:false});r.progress=Math.min(t.target,r.progress+amount);}
   if(event==='bosses'||event==='flawlessBoss'){
    s.lifetime[event]=Math.min(MAX_COINS,s.lifetime[event]+amount);
    for(const skin of SKINS)if(skin.achievement&&s.lifetime[skin.achievement.event]>=skin.achievement.target&&!s.owned.includes(skin.id))s.owned.push(skin.id);
   }
  });
 },
 claim(period,id){return transaction(s=>{const t=(period==='daily'||period==='weekly')?TASKS[period].find(t=>t.id===id):null;if(!t)return 'invalid';const r=s[period][id];if(!r||r.progress<t.target)return 'incomplete';if(r.claimed)return 'claimed';if(s.balance>MAX_COINS-t.reward)return 'limit';r.claimed=true;s.balance+=t.reward;});},
 purchase(id){return transaction(s=>{const k=SKINS.find(k=>k.id===id);if(!k)return 'invalid';if(s.owned.includes(id))return 'owned';if(k.achievement)return 'achievement';if(s.balance<k.cost)return 'funds';s.balance-=k.cost;s.owned.push(id);});},
 equip(id){return transaction(s=>{if(!s.owned.includes(id))return 'unowned';s.selected=id;});},
 subscribe(fn){if(typeof fn!=='function')return ()=>{};listeners.add(fn);return ()=>listeners.delete(fn);}
};
window.addEventListener('storage',e=>{if(e.key===KEY||e.key==='rc_player'||e.key===null)notify();});
window.RTC_MISSIONS=Object.freeze(API);
})();


