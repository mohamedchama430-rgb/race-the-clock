/* Shared, resolution-independent mechanical art. Cosmetic geometry never changes hitboxes. */
(function(){
'use strict';
const TAU=Math.PI*2;
function poly(c,points,fill,stroke='#665d55',width=.02){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function circle(c,x,y,r,fill,stroke,width=.02){c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function metal(c,a,b){const g=c.createLinearGradient(-.6,-.8,.6,.8);g.addColorStop(0,a);g.addColorStop(.42,b);g.addColorStop(.5,a);g.addColorStop(1,'#192028');return g;}
function skin(c,id,x,y,r,time=0,detail=true){
 c.save();c.translate(x,y);c.scale(r,r);
 const frost=id==='frost',ember=id==='ember',phantom=id==='phantom';
 const accent=frost?'#77e5ff':ember?'#ff9d23':phantom?'#6df5df':id==='mint'?'#6bf5ba':id==='violet'?'#bd91ff':id==='aurora'?'#7bc8ff':'#ffd78a';
 const alloy=metal(c,frost?'#d6f5ff':ember?'#f8bc83':phantom?'#f3e8d7':'#efe4ce',ember?'#8b4029':'#536471');
 circle(c,0,.07,.79,'#040a12');
 c.save();c.rotate(phantom?-.2:0);
 const n=frost?5:phantom?3:6;
 for(let i=0;i<n;i++){
  c.save();c.rotate(i*TAU/n);
  if(frost){poly(c,[[.43,-.22],[.78,-.3],[.98,-.04],[.65,.25],[.49,.14]],'#237aab','#a6eaff');poly(c,[[.78,-.3],[.98,-.04],[.62,.02]],'#9feaff',null);poly(c,[[.62,.02],[.98,-.04],[.65,.25]],'#36b8e8',null);if(detail)poly(c,[[.43,-.22],[.78,-.3],[.62,.02],[.49,.14]],'#73c7e6','#d7faff',.013);}
  else if(phantom){poly(c,[[.42,-.33],[.97,-.4],[.76,.09],[.48,.38],[.38,.09]],alloy,'#b4bcbb');poly(c,[[.97,-.4],[.76,.09],[.48,.38],[.62,-.05]],'#fff1d9',null);poly(c,[[.42,-.33],[.68,-.2],[.62,-.05],[.38,.09]],'#2a4149',null);}
  else if(ember){poly(c,[[.42,-.3],[.8,-.32],[.98,-.07],[.87,.32],[.69,.09],[.45,.14]],alloy,'#dc8454');poly(c,[[.8,-.32],[.98,-.07],[.87,.32],[.8,.01]],'#ffb251',null);poly(c,[[.42,-.3],[.66,-.17],[.45,.14]],'#763323',null);}
  else{poly(c,[[.51,-.17],[.82,-.21],[.92,0],[.77,.2],[.51,.15]],alloy,'#a69c8c');}
  c.restore();
 }
 c.restore();
 circle(c,0,0,.61,'#101923','#0a0d11',.07);
 if(detail){for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.arc(0,0,.54,a+.05,a+.67);c.strokeStyle=i%2?alloy:'#b9bdb5';c.lineWidth=.1;c.stroke();}}
 else circle(c,0,0,.53,null,'#9faaa6',.08);
 circle(c,0,0,.435,'#091a21',accent,.025);
 if(detail){c.save();c.globalAlpha=.45;circle(c,0,0,.4,null,accent,.025);c.restore();}
 // A clock hand remains legible at the actual 9-unit collision core.
 c.save();c.rotate(-.8+Math.sin(time*.8)*.14);c.strokeStyle=accent;c.lineWidth=.045;c.lineCap='round';c.beginPath();c.moveTo(-.08,.1);c.lineTo(0,0);c.lineTo(.23,-.23);c.stroke();c.restore();
 circle(c,0,0,.067,accent);circle(c,-.018,-.018,.025,'#fff9e9');
 if(detail)for(let i=0;i<4;i++){const a=i*TAU/4+.3;circle(c,Math.cos(a)*.59,Math.sin(a)*.59,.026,'#10151c','#d0c5ab',.012);}
 c.restore();
}
function weaver(c,x,y,r,time=0,phase=0){
 c.save();c.translate(x,y);c.scale(r,r);c.rotate(-Math.PI/2);
 const alloy=metal(c,'#d1c4b4','#48454a'),energy=phase>0?'#fff0ae':'#ffab42';
 for(let i=0;i<3;i++){
  c.save();c.rotate(i*TAU/3+Math.sin(time*1.3+i)*.035);
  poly(c,[[.24,-.2],[.67,-.28],[1.02,.04],[.72,.13],[.43,.03]],'#29262a','#917969');
  poly(c,[[.43,-.17],[.68,-.22],[.9,.02],[.65,.01]],alloy,'#e2c3a2');
  poly(c,[[.72,.05],[1.02,.04],[.87,.48],[.68,.66],[.73,.25]],alloy,'#b6926c');
  poly(c,[[1.02,.04],[.87,.48],[.68,.66],[.84,.2]],'#c19c72',null);
  circle(c,.59,-.08,.085,'#11161d','#9a8065',.035);circle(c,.59,-.08,.037,energy);
  c.strokeStyle=energy;c.lineWidth=.018;c.beginPath();c.moveTo(.26,.05);c.lineTo(.62,.05);c.lineTo(.74,.22);c.stroke();c.restore();
 }
 poly(c,[[-.31,-.23],[.13,-.32],[.38,0],[.12,.32],[-.31,.22]],alloy,'#d4b799');
 poly(c,[[-.24,-.13],[.1,-.2],[.26,0],[.1,.2],[-.24,.13]],'#191e28','#625e59');
 poly(c,[[-.12,-.09],[.15,0],[-.12,.09]],energy,null);
 c.restore();
}
function collector(c,x,y,r,time=0,phase=0){
 c.save();c.translate(x,y);c.scale(r,r);
 const alloy=metal(c,'#c6b0a0','#68564e'),edge='#c19270',energy=phase>=2?'#ffdc80':'#ff8938';
 // Tucked pincers remain inside the body's established danger outline.
 for(const side of [-1,1]){
  c.save();c.scale(side,1);
  poly(c,[[.44,-.32],[.75,-.22],[.96,.05],[.87,.37],[.66,.15],[.48,.12]],alloy,edge);
  poly(c,[[.87,.25],[.96,.48],[.82,.81],[.62,.91],[.68,.63],[.58,.47]],alloy,edge);
  poly(c,[[.82,.81],[.62,.91],[.68,.63],[.76,.56]],'#e9c8a2',null);
  poly(c,[[.58,.47],[.52,.7],[.65,.8],[.59,.57]],'#a98975','#e5ba87');
  circle(c,.67,.06,.12,'#191c24',edge,.04);circle(c,.67,.06,.055,energy);
  c.restore();
 }
 for(let i=-1;i<=1;i++){
  c.save();c.translate(i*.43,-.63);c.rotate(i*.28);
  poly(c,[[-.18,-.12],[-.09,-.31],[.12,-.31],[.2,-.1],[.16,.17],[-.17,.17]],'#3b3333','#9d8170');
  for(let j=0;j<3;j++){c.fillStyle=j===1?energy:'#b79b7e';c.fillRect(-.15,-.09+j*.08,.3,.035);}
  circle(c,0,-.22,.1,'#171b21','#b18f73',.025);circle(c,0,-.22,.035,energy);c.restore();
 }
 poly(c,[[-.55,-.45],[0,-.62],[.55,-.45],[.53,.13],[0,.53],[-.53,.13]],'#29252a','#d4a77c',.025);
 poly(c,[[-.51,-.42],[-.09,-.54],[-.04,.14],[-.28,.3],[-.49,.07]],alloy,edge);
 poly(c,[[.51,-.42],[.09,-.54],[.04,.14],[.28,.3],[.49,.07]],alloy,edge);
 poly(c,[[-.32,-.38],[-.12,-.48],[-.13,.1],[-.35,-.02]],'#b29883',null);
 poly(c,[[.32,-.38],[.12,-.48],[.13,.1],[.35,-.02]],'#e0b795',null);
 poly(c,[[-.4,.12],[0,.3],[.4,.12],[0,.49]],energy,null);
 poly(c,[[-.29,.15],[0,.27],[.29,.15],[0,.36]],'#ffdf8b',null);
 c.strokeStyle=energy;c.lineWidth=.024;c.beginPath();c.moveTo(0,-.5);c.lineTo(0,.15);c.stroke();
 c.restore();
}
let floorCache=null,floorKey='';
function arena(c,w,h,u,detail){
 const key=[w,h,u,detail].join(':');
 if(key!==floorKey){
  floorKey=key;floorCache=document.createElement('canvas');floorCache.width=Math.ceil(w);floorCache.height=Math.ceil(h);const g=floorCache.getContext('2d');
  g.fillStyle='#0b141c';g.fillRect(0,0,w,h);
  const tile=96*u;
  for(let row=0;row<h/tile+1;row++)for(let col=-1;col<w/tile+1;col++){
   const x=col*tile+(row%2)*tile/2,y=row*tile,shade=(row*13+col*7+100)%4;
   g.fillStyle=['#16212b','#19232c','#151f28','#1c252d'][shade];g.fillRect(x+2,y+2,tile-4,tile-4);
   g.strokeStyle='#36404a';g.lineWidth=1;g.beginPath();g.moveTo(x+2,y+tile-3);g.lineTo(x+2,y+2);g.lineTo(x+tile-3,y+2);g.stroke();
   if(detail&&(row+col)%3===0){g.strokeStyle='#0a111a';g.beginPath();g.moveTo(x+tile*.35,y+2);g.lineTo(x+tile*.47,y+tile*.24);g.lineTo(x+tile*.42,y+tile*.42);g.stroke();}
  }
  g.strokeStyle='#655444';g.lineWidth=3*u;g.strokeRect(14*u,14*u,w-28*u,h-28*u);
  const shade=g.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*.6);shade.addColorStop(0,'#36505b20');shade.addColorStop(1,'#020609cc');g.fillStyle=shade;g.fillRect(0,0,w,h);
 }
 c.drawImage(floorCache,0,0,w,h);
}
window.RTC_ART=Object.freeze({skin,weaver,collector,arena});
})();
