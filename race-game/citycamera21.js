/* Race 95 v21 — an immersive perspective view of the existing city.
   Cockpit / third-person / overhead via B or on-screen Camera button.
   The existing game still handles steering, collisions and missions. */
(()=>{
'use strict';
const root=document.getElementById('app'),base=document.getElementById('game');
if(!root||!base||document.getElementById('cityCamera21'))return;
const W=base.width,H=base.height,TAU=Math.PI*2;
const cv=document.createElement('canvas');cv.id='cityCamera21';cv.width=W;cv.height=H;
Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'contain',pointerEvents:'none',zIndex:'2',display:'none'});root.appendChild(cv);
const g=cv.getContext('2d'),style=document.createElement('style');
style.textContent='#hud{z-index:4}#message{z-index:5}#mission14{z-index:5}#railNote13{z-index:5}#raceTools13{z-index:5}#cityCameraButton21{position:absolute;z-index:6;left:14px;top:162px;margin:0;padding:10px 13px;background:linear-gradient(150deg,#183a58,#0a1b32);border:1px solid #adf2ff99;border-radius:13px;color:#f4fdff;font:900 13px Arial;display:none;box-shadow:0 7px 22px #0009;cursor:pointer}#cityCameraHint21{position:absolute;z-index:4;left:14px;bottom:91px;transform:none;background:#091629d4;color:#e3f9ff;border:1px solid #9addff55;border-radius:12px;padding:7px 12px;font:800 12px Arial;pointer-events:none;display:none}@media(max-width:700px){#cityCameraButton21{left:8px;top:163px;padding:7px;font-size:11px}#cityCameraHint21{bottom:83px;padding:5px;font-size:10px}}';
document.head.appendChild(style);
const button=document.createElement('button');button.id='cityCameraButton21';button.type='button';root.appendChild(button);
const hint=document.createElement('div');hint.id='cityCameraHint21';root.appendChild(hint);
const modes=['cockpit','third','map'];let mode='cockpit';
try{const saved=localStorage.getItem('r95.cityCamera21');if(modes.includes(saved))mode=saved;}catch{}
function labels(){button.textContent='📷 '+(mode==='cockpit'?'INSIDE CAR':mode==='third'?'3RD PERSON':'OVERHEAD')+' [B]';hint.textContent='B = Camera • '+(mode==='cockpit'?'Inside the car':mode==='third'?'Behind the car':'Overhead map');}
function next(){mode=modes[(modes.indexOf(mode)+1)%3];try{localStorage.setItem('r95.cityCamera21',mode)}catch{}labels();}
button.onclick=next;labels();
addEventListener('keydown',e=>{if(e.code==='KeyB'&&!e.repeat&&!/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName||'')){next();e.preventDefault();}},{passive:false});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),roadsX=[145,370,600,830,1055],roadsY=[160,350,550];
const names=['COFFEE','HOTEL','GARAGE','MARKET','OFFICES','RESTAURANT','SHOP','ARCADE','BANK','TOWER'];
const buildings=[],trees=[],lights=[],rng=i=>()=>{i=(Math.imul(i,1664525)+1013904223)|0;return(i>>>0)/4294967296};
for(let i=-1;i<roadsX.length;i++)for(let j=-1;j<roadsY.length;j++){
 const l=roadsX[i]??-230,r=roadsX[i+1]??1470,t=roadsY[j]??-310,b=roadsY[j+1]??1080;
 if(r-l<130||b-t<135)continue;
 const rand=rng((i+5)*12319+(j+5)*9827),x=l+60,y=t+60,w=r-l-120,h=b-t-120;
 buildings.push({x,y,w,h,z:60+rand()*104,color:['#9caab8','#7b899b','#b5ac9d','#6b8491','#bbc1bd'][Math.floor(rand()*5)],name:names[(i*11+j*7+210)%names.length],id:buildings.length});
 if(r-l>230&&b-t>230){trees.push({x:x-21,y:y+25,z:20+rand()*14});trees.push({x:x+w+19,y:y+h-20,z:22+rand()*14});}
}
for(const x of roadsX)for(let y=110;y<620;y+=125)for(const q of[-1,1])lights.push({x:x+q*51,y,z:33});
for(const y of roadsY)for(let x=115;x<1110;x+=140)for(const q of[-1,1])lights.push({x,y:y+q*51,z:33});
const missionSites=[[1055,550,'HARBOUR'],[370,160,'DOWNTOWN'],[830,350,'GARAGE'],[145,550,'PARK'],[1055,160,'AIRPORT']];
const color=(hex,a)=>{const n=parseInt(hex.slice(1),16);return'rgb('+clamp((n>>16)+a,0,255)+','+clamp(((n>>8)&255)+a,0,255)+','+clamp((n&255)+a,0,255)+')'};
function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(x,y,w,h)}
function rounded(x,y,w,h,r,col,edge){g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=col;g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=1;g.stroke();}}
function poly(points,fill,edge){if(points.length<3||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return;g.beginPath();g.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))g.lineTo(p.x,p.y);g.closePath();g.fillStyle=fill;g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=1;g.stroke();}}
function camera(car,kind,w,h){
 const back=kind==='third'?112:0,pitch=kind==='third'?.30:.075,z=kind==='third'?76:38;
 return {x:car.x-Math.cos(car.a)*back,y:car.y-Math.sin(car.a)*back,z,ca:Math.cos(car.a),sa:Math.sin(car.a),cp:Math.cos(pitch),sp:Math.sin(pitch),cx:w*.5,cy:h*.53,focal:Math.min(w*.93,h*1.1),w,h};
}
function transform(c,p){const dx=p[0]-c.x,dy=p[1]-c.y,f=dx*c.ca+dy*c.sa,side=-dx*c.sa+dy*c.ca,v=p[2]-c.z;return {d:f*c.cp-v*c.sp,r:side,u:f*c.sp+v*c.cp}}
function nearClip(points){
 const out=[],near=9;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],inside=a.d>=near,other=b.d>=near;
  if(inside)out.push(a);if(inside!==other){const t=(near-a.d)/(b.d-a.d);out.push({d:near,r:a.r+(b.r-a.r)*t,u:a.u+(b.u-a.u)*t});}}
 return out;
}
function project(c,coords){return nearClip(coords.map(p=>transform(c,p))).map(v=>({x:c.cx+c.focal*v.r/v.d,y:c.cy-c.focal*v.u/v.d}))}
function surface(c,points,fill,edge){poly(project(c,points),fill,edge)}
function point(c,x,y,z){const v=transform(c,[x,y,z]);return v.d>9?{x:c.cx+c.focal*v.r/v.d,y:c.cy-c.focal*v.u/v.d,d:v.d}:null}
function stroke3(c,a,b,fill,w){
 let p=transform(c,a),q=transform(c,b);if(p.d<9&&q.d<9)return;
 if(p.d<9){const t=(9-p.d)/(q.d-p.d);p={d:9,r:p.r+t*(q.r-p.r),u:p.u+t*(q.u-p.u)}}if(q.d<9){const t=(9-q.d)/(p.d-q.d);q={d:9,r:q.r+t*(p.r-q.r),u:q.u+t*(p.u-q.u)}}
 g.strokeStyle=fill;g.lineWidth=w;g.beginPath();g.moveTo(c.cx+c.focal*p.r/p.d,c.cy-c.focal*p.u/p.d);g.lineTo(c.cx+c.focal*q.r/q.d,c.cy-c.focal*q.u/q.d);g.stroke();
}
function timeOfDay(){return document.getElementById('time16')?.value||'Day'}
function sky(c){
 const tod=timeOfDay(),night=tod==='Night';const grad=g.createLinearGradient(0,0,0,c.h);
 grad.addColorStop(0,night?'#07142a':tod==='Sunset'?'#515e9d':'#61b1f1');
 grad.addColorStop(.50,night?'#1b3b64':tod==='Sunset'?'#ffc190':'#cdefff');
 grad.addColorStop(.65,night?'#415466':tod==='Sunset'?'#ffe8ba':'#f1ffff');
 grad.addColorStop(.66,night?'#2b3e42':'#4b795f');grad.addColorStop(1,night?'#2b3e42':'#4b795f');
 rect(0,0,c.w,c.h,grad);
 const sx=c.w*.78,sy=c.h*.18;g.save();g.shadowColor=night?'#c6eaff':'#ffe6a1';g.shadowBlur=29;g.fillStyle=night?'#f4f8ff':'#ffefad';g.beginPath();g.arc(sx,sy,night?16:24,0,TAU);g.fill();g.restore();
 // Distant skyline moves when the car turns.
 g.fillStyle=night?'#0e23435c':'#56748f65';
 for(let i=0;i<35;i++){let x=((i*91+c.sa*870)%(c.w+100)+c.w+100)%(c.w+100)-50,h=28+i*29%73;rect(x,c.h*.53-h,36+i*11%29,h,g.fillStyle)}
}
function streets(c){
 surface(c,[[-1500,-1500,0],[2600,-1500,0],[2600,1700,0],[-1500,1700,0]],timeOfDay()==='Night'?'#31454a':'#547961');
 const n=timeOfDay()==='Night';
 for(const x of roadsX){
  surface(c,[[x-57,-1500,.1],[x+57,-1500,.1],[x+57,1700,.1],[x-57,1700,.1]],n?'#8b95a0':'#bdc6c7');
  surface(c,[[x-48,-1500,.3],[x+48,-1500,.3],[x+48,1700,.3],[x-48,1700,.3]],n?'#252b39':'#3c414a');
  for(let y=-1400;y<1700;y+=88)surface(c,[[x-1.4,y,.6],[x+1.4,y,.6],[x+1.4,y+36,.6],[x-1.4,y+36,.6]],n?'#f6cf7a':'#f1ebd1');
 }
 for(const y of roadsY){
  surface(c,[[-1500,y-57,.1],[2600,y-57,.1],[2600,y+57,.1],[-1500,y+57,.1]],n?'#8b95a0':'#bdc6c7');
  surface(c,[[-1500,y-48,.3],[2600,y-48,.3],[2600,y+48,.3],[-1500,y+48,.3]],n?'#252b39':'#3c414a');
  for(let x=-1400;x<2300;x+=88)surface(c,[[x,y-1.4,.6],[x+36,y-1.4,.6],[x+36,y+1.4,.6],[x,y+1.4,.6]],n?'#f6cf7a':'#f1ebd1');
 }
 for(const x of roadsX)for(const y of roadsY)if(Math.hypot(c.x-x,c.y-y)<730)
  for(let k=-39;k<=39;k+=14)surface(c,[[x+k-3,y-42,1],[x+k+4,y-42,1],[x+k+4,y-31,1],[x+k-3,y-31,1]],'#eff5f5ab');
}
function building(c,b){
 const x=b.x,y=b.y,w=b.w,h=b.h,z=b.z,delta=Math.hypot(c.x-x-w/2,c.y-y-h/2);
 if(delta>730)return;
 surface(c,[[x-6,y-6,0],[x+w+6,y-6,0],[x+w+6,y+h+6,0],[x-6,y+h+6,0]],'#a5acaf');
 const walls=[
  {a:[x,y],d:[w,0],shade:-15},
  {a:[x+w,y],d:[0,h],shade:-32},
  {a:[x+w,y+h],d:[-w,0],shade:-4},
  {a:[x,y+h],d:[0,-h],shade:-30}
 ];
 for(const wall of walls){
  const [dx,dy]=wall.d,[ax,ay]=wall.a,front=(c.x-ax-dx*.5)*dy+(c.y-ay-dy*.5)*(-dx);
  if(front<0)continue;
  surface(c,[[ax,ay,0],[ax+dx,ay+dy,0],[ax+dx,ay+dy,z],[ax,ay,z]],color(b.color,wall.shade),'#15263b77');
  const count=Math.hypot(dx,dy)>110?5:3,levels=z>135?6:4;
  for(let floor=0;floor<levels;floor++)for(let j=0;j<count;j++){
    const u=(j+.5)/count,half=.28/count,z0=9+floor*(z-17)/levels,z1=z0+(z-20)/levels*.55;
    const p1=[ax+dx*(u-half),ay+dy*(u-half),z0],p2=[ax+dx*(u+half),ay+dy*(u+half),z0];
    const lit=timeOfDay()!=='Night'||(b.id+floor+j)%4!==0;
    surface(c,[p1,p2,[p2[0],p2[1],z1],[p1[0],p1[1],z1]],lit?(timeOfDay()==='Night'?'#ffe5a8':'#ade4fc'):'#223b58','#1e2b3a52');
  }
 }
 surface(c,[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],color(b.color,28),'#36485977');
 const p=point(c,x+w*.5,y+h*.5,z+5);
 if(p&&p.d<550&&p.x>0&&p.x<c.w&&p.y>0&&p.y<c.h){
  const f=clamp(1400/(p.d+80),9,16);rounded(p.x-45,p.y-f,90,f+8,4,'#10253ad6','#adf0ff6d');
  g.textAlign='center';g.fillStyle='#f4ffff';g.font='900 '+f+'px Arial';g.fillText(b.name,p.x,p.y+3);
 }
}
function tree(c,p){let top=point(c,p.x,p.y,p.z),bottom=point(c,p.x,p.y,0);if(!top||!bottom||top.d>450)return;
 stroke3(c,[p.x,p.y,0],[p.x,p.y,p.z],'#795334',clamp(190/top.d,1.5,7));
 const r=clamp(c.focal*p.z*.4/top.d,4,70);g.fillStyle=timeOfDay()==='Night'?'#205d50':'#318d55';g.beginPath();g.arc(top.x,top.y,r,0,TAU);g.fill();
 g.fillStyle=timeOfDay()==='Night'?'#307967':'#44ae66';g.beginPath();g.arc(top.x-r*.3,top.y-r*.25,r*.66,0,TAU);g.fill();
}
function lamp(c,p){const top=point(c,p.x,p.y,p.z);if(!top||top.d>420)return;
 stroke3(c,[p.x,p.y,0],[p.x,p.y,p.z],'#405465',clamp(220/top.d,1.5,5));
 g.shadowColor='#ffdc94';g.shadowBlur=timeOfDay()==='Night'?17:4;g.fillStyle=timeOfDay()==='Night'?'#fff3ba':'#e5f3fc';g.beginPath();g.arc(top.x,top.y,clamp(170/top.d,2,8),0,TAU);g.fill();g.shadowBlur=0;
}
const spots=[[1055,550,'HARBOUR'],[370,160,'DOWNTOWN'],[830,350,'GARAGE'],[145,550,'PARK'],[1055,160,'AIRPORT']];
function mission(c,snap){if(snap.activity!=='city')return;const b=spots[(snap.expansion?.missions||0)%spots.length];if(!b)return;stroke3(c,[b[0],b[1],0],[b[0],b[1],70],'#4ffff0',5);
 const p=point(c,b[0],b[1],70);if(!p||p.x<0||p.x>c.w||p.y<0||p.y>c.h)return;
 g.shadowColor='#9affec';g.shadowBlur=14;g.fillStyle='#71ffe8';g.beginPath();g.arc(p.x,p.y,clamp(260/p.d,4,12),0,TAU);g.fill();g.shadowBlur=0;
 g.fillStyle='#fff';g.font='900 13px Arial';g.textAlign='center';g.fillText('NEXT: '+b[2],p.x,p.y-19);
}

function policeVehicles(c,snap){
 if(snap.activity!=='police')return;
 const state=window.R95Expansion16?.getCityState?.();if(!state)return;
 const blink=Math.sin(performance.now()*.014)>0;
 for(const block of state.blocks||[]){
  if(Math.hypot(c.x-block.x,c.y-block.y)>450)continue;
  surface(c,[[block.x-35,block.y-11,.5],[block.x+35,block.y-11,.5],[block.x+35,block.y+11,.5],[block.x-35,block.y+11,.5]],'#f5b24c','#fff');
  for(let k=-2;k<=2;k++)surface(c,[[block.x+k*11-3,block.y-11,.7],[block.x+k*11+3,block.y-11,.7],[block.x+k*11+3,block.y+11,.7],[block.x+k*11-3,block.y+11,.7]],'#fa5147');
 }
 for(const p of state.patrols||[]){
  if(Math.hypot(p.x-c.x,p.y-c.y)>540)continue;
  const ca=Math.cos(p.a||0),sa=Math.sin(p.a||0),at=(r,f,z)=>[p.x-sa*r+ca*f,p.y+ca*r+sa*f,z];
  if(Math.hypot(c.x-p.x,c.y-p.y)<7)continue;
  surface(c,[at(-19,-29,5),at(19,-29,5),at(19,28,5),at(-19,28,5)],'#0d1625');
  surface(c,[at(-18,-25,11),at(18,-25,11),at(18,27,11),at(-18,27,11)],'#f0f5fd','#252e3c');
  surface(c,[at(-16,-13,20),at(16,-13,20),at(14,14,24),at(-14,14,24)],'#233a58','#a9c8e0');
  surface(c,[at(-16,-25,11),at(16,-25,11),at(14,-13,20),at(-14,-13,20)],'#e4f2ff');
  const color=blink?'#ff3c60':'#59a2ff';
  surface(c,[at(-7,-4,25),at(7,-4,25),at(7,5,25),at(-7,5,25)],color);
  const siren=point(c,p.x,p.y,28);
  if(siren){g.save();g.shadowColor=color;g.shadowBlur=15;g.fillStyle=color;g.beginPath();g.arc(siren.x,siren.y,clamp(260/siren.d,2,10),0,TAU);g.fill();g.restore();}
 }
}

function car3D(c,car){
 const forward=[Math.cos(car.a),Math.sin(car.a)],right=[-forward[1],forward[0]],paint=document.getElementById(car.kind==='p2'?'p2Color':'p1Color')?.value||'#ee454b';
 const at=(s,f,z)=>[car.x+right[0]*s+forward[0]*f,car.y+right[1]*s+forward[1]*f,z];
 const faces=[
  {p:[at(-23,-35,8),at(23,-35,8),at(21,33,8),at(-21,33,8)],fill:'#0e151f'},
  {p:[at(-20,-35,13),at(20,-35,13),at(18,30,13),at(-18,30,13)],fill:paint},
  {p:[at(-17,-20,26),at(17,-20,26),at(16,10,29),at(-16,10,29)],fill:color(paint,30)},
  {p:[at(-20,-35,13),at(20,-35,13),at(17,-20,26),at(-17,-20,26)],fill:color(paint,-30)},
  {p:[at(-16,10,29),at(16,10,29),at(19,31,14),at(-19,31,14)],fill:'#315971'},
  {p:[at(-20,-35,13),at(-17,-20,26),at(-16,10,29),at(-20,32,13)],fill:color(paint,-35)},
  {p:[at(20,-35,13),at(17,-20,26),at(16,10,29),at(20,32,13)],fill:color(paint,-20)}
 ];
 faces.sort((a,b)=>b.p.reduce((s,p)=>s+transform(c,p).d,0)-a.p.reduce((s,p)=>s+transform(c,p).d,0));
 for(const f of faces)surface(c,f.p,f.fill,'#08131fa0');
 surface(c,[at(-11,-12,29),at(11,-12,29),at(11,6,30),at(-11,6,30)],'#16334aa9','#a6c8e0a0');
 for(const fwd of[-22,23])for(const side of[-23,23])surface(c,[at(side-3,fwd-7,4),at(side+3,fwd-7,4),at(side+3,fwd+7,15),at(side-3,fwd+7,15)],'#0b121c','#556271');
 for(const s of[-1,1]){const p=point(c,...at(s*17,-36,17));if(p)rounded(p.x-8,p.y-4,16,8,2,'#ff4159');}
 const plate=point(c,...at(0,-36,16));if(plate){rounded(plate.x-17,plate.y+1,34,9,3,'#172237');g.fillStyle='#fff';g.font='bold 9px Arial';g.textAlign='center';g.fillText('R95',plate.x,plate.y+9)}
}
function cockpit(car,w,h){
 const y=h*.75,grad=g.createLinearGradient(0,y,0,h);grad.addColorStop(0,'#202f43e3');grad.addColorStop(1,'#050a11');g.fillStyle=grad;
 g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(w*.5,h*.62,w,y);g.lineTo(w,h);g.lineTo(0,h);g.fill();
 g.fillStyle='#0b111c';g.beginPath();g.moveTo(0,0);g.lineTo(w*.06,0);g.lineTo(w*.14,h*.74);g.lineTo(0,h*.81);g.fill();
 g.beginPath();g.moveTo(w,0);g.lineTo(w*.94,0);g.lineTo(w*.86,h*.74);g.lineTo(w,h*.81);g.fill();
 rounded(w*.43,0,w*.14,h*.09,8,'#111a27','#7f9eb0');rounded(w*.445,h*.01,w*.11,h*.05,4,'#4d8099');
 for(const x of[w*.18,w*.82]){rounded(x-w*.065,h*.8,w*.13,h*.07,6,'#192839','#617789');for(let j=0;j<3;j++)rect(x-w*.05,h*.81+j*8,w*.1,3,'#09121f')}
 rounded(w*.36,h*.765,w*.28,h*.18,13,'#0c1624','#526d81');g.textAlign='center';
 g.fillStyle='#6ffceb';g.font='900 '+clamp(w*.052,24,45)+'px Arial';g.fillText(Math.round(Math.abs(car.speed||0)*18),w*.5,h*.854);
 g.fillStyle='#e2f6ff';g.font='bold '+clamp(w*.018,11,17)+'px Arial';g.fillText('KM/H · '+(car.kind==='p2'?'PLAYER 2':'PLAYER 1'),w*.5,h*.90);
 const radius=clamp(w*.135,68,141),cx=w*.5,cy=h*.97;g.strokeStyle='#080e1b';g.lineWidth=clamp(w*.028,16,34);
 g.beginPath();g.arc(cx,cy,radius,0,TAU);g.stroke();g.strokeStyle='#445a72';g.lineWidth=3;g.beginPath();g.arc(cx,cy,radius-8,0,TAU);g.stroke();
 g.strokeStyle='#344c68';g.lineWidth=15;g.beginPath();g.moveTo(cx-radius*.72,cy-radius*.25);g.lineTo(cx,cy+radius*.3);g.lineTo(cx+radius*.72,cy-radius*.25);g.stroke();
 rounded(cx-24,cy-18,48,38,9,'#1a2e44','#aac3d4');g.fillStyle='#f0ffff';g.font='bold 11px Arial';g.fillText('R95',cx,cy+6);
}
function atmosphere(w,h){
 const rain=document.getElementById('weather16')?.value||'Clear';if(rain==='Clear')return;
 const t=performance.now()/1000;
 if(rain==='Snow'){g.fillStyle='#f9fdffbd';for(let i=0;i<75;i++){const x=(i*107+t*13)%w,y=(i*63+t*47)%h;g.beginPath();g.arc(x,y,1+i%3,0,TAU);g.fill();}}
 else{g.strokeStyle='#d4ecff9b';g.lineWidth=1;for(let i=0;i<80;i++){const x=(i*113+t*171)%w,y=(i*73+t*510)%h;g.beginPath();g.moveTo(x,y);g.lineTo(x-10,y+22);g.stroke();}
  if(rain==='Thunderstorm'&&Math.sin(t*1.9)>.996)rect(0,0,w,h,'#e8f4ff3b');
 }
}
function scene(player,snap,w,h){
 const c=camera(player,mode,w,h);g.save();g.beginPath();g.rect(0,0,w,h);g.clip();sky(c);streets(c);
 const objects=buildings.map(b=>({b,d:Math.hypot(c.x-b.x-b.w/2,c.y-b.y-b.h/2)})).filter(p=>p.d<700).sort((a,b)=>b.d-a.d);
 for(const o of objects)building(c,o.b);
 for(const t of trees)if(Math.hypot(c.x-t.x,c.y-t.y)<420)tree(c,t);
 for(const l of lights)if(Math.hypot(c.x-l.x,c.y-l.y)<420)lamp(c,l);
 mission(c,snap);
 policeVehicles(c,snap);
 if(mode==='third')car3D(c,player);
 atmosphere(w,h);if(mode==='cockpit')cockpit(player,w,h);
 rounded(13,87,clamp(w*.36,155,220),30,9,'#0b192edc','#c9f4ff55');
 g.fillStyle='#fff';g.font='900 14px Arial';g.textAlign='left';g.fillText((player.kind==='p2'?'P2':'P1')+' • '+(mode==='third'?'3RD PERSON':'COCKPIT'),23,108);
 g.restore();
}
let last=performance.now(),warning=false;
function render(){
 const snap=window.R95Game14?.snapshot?.();
 const active=['city','police'].includes(snap?.activity)&&['run','count','fin'].includes(snap?.mode)&&!!snap?.cars?.length;
 const garageOpen=!document.getElementById('garage')?.classList.contains('hidden');
 button.style.display=active&&!garageOpen?'block':'none';
 const show=active&&!garageOpen&&mode!=='map';cv.style.display=show?'block':'none';hint.style.display=show?'block':'none';if(!show)return;
 g.clearRect(0,0,W,H);const players=snap.cars.filter(c=>c.kind==='p1'||c.kind==='p2');
 if(players.length>1){
  g.save();g.beginPath();g.rect(0,0,W/2,H);g.clip();scene(players[0],snap,W/2,H);g.restore();
  g.save();g.translate(W/2,0);g.beginPath();g.rect(0,0,W/2,H);g.clip();scene(players[1],snap,W/2,H);g.restore();
  rect(W/2-3,0,6,H,'#070d18');rect(W/2-1,0,2,H,'#80f3ff');
 }else if(players.length)scene(players[0],snap,W,H);
}
function frame(now){last=now;try{render()}catch(error){cv.style.display='none';if(!warning){console.warn('Camera fallback to top-down:',error);warning=true;}}requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.R95CityCamera21={version:21,getMode:()=>mode,setMode:v=>{if(modes.includes(v)){mode=v;labels();}},render};
})();