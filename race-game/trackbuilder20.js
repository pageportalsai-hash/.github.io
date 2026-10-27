/* Race 95 v20 — draw and save a custom race circuit, locally */
(()=>{'use strict';
const D=window.R95V8;if(!D)return;
const key='r95.customTrack20';const saved=()=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
function add(t){if(!t||!Array.isArray(t.nodes)||t.nodes.length<6)return false;const idx=D.tracks.findIndex(x=>x.id===900020);const def={id:900020,name:(t.name||'My Custom Circuit').slice(0,28),theme:t.theme||'grass',top:'#4ab565',bottom:'#267a3c',difficulty:3,nodes:t.nodes,boosts:[],version:15};if(idx>=0)D.tracks[idx]=def;else D.tracks.push(def);return true}
add(saved());
const garage=document.querySelector('#garage .panel');if(!garage)return;
const div=document.createElement('section');div.id='trackMaker20';div.style.cssText='margin:14px 0;padding:15px;background:#101d34;border:1px solid #8deaff6b;border-radius:16px';
div.innerHTML='<details><summary style="cursor:pointer;font-weight:900;color:#90ebff">🛣️ CREATE YOUR OWN TRACK — Click to build a circuit</summary><p style="font-size:13px;color:#c8e3ff">Click 6–15 points on the map. Points are connected to make a closed loop. Save your circuit to add it to the Map list. This is saved in this browser.</p><canvas id="trackCanvas20" width="600" height="350" style="width:100%;max-width:600px;border-radius:12px;background:#2b8743;border:1px solid #a0e3ce;cursor:crosshair;touch-action:none"></canvas><label for="trackName20">Track name</label><input id="trackName20" maxlength="28" value="My Custom Circuit" style="padding:9px;border-radius:8px;background:#071827;color:white;border:1px solid #5fd8fd"><div style="display:flex;flex-wrap:wrap;gap:7px"><button id="trackUndo20" type="button">UNDO POINT</button><button id="trackClear20" type="button">CLEAR</button><button id="trackPreset20" type="button">EXAMPLE TRACK</button><button id="trackSave20" type="button">SAVE CUSTOM TRACK</button></div><p id="trackMsg20" aria-live="polite" style="font-size:13px;color:#a5fff5"></p></details>';
garage.querySelector('.menuActions14')?.insertAdjacentElement('afterend',div);
const $=id=>document.getElementById(id),cv=$('trackCanvas20'),g=cv.getContext('2d'),W=600,H=350;
const old=saved();let points=old?.nodes?.map(([x,y])=>[x/2, (y-100)*.5])||[];
function example(){points=[[100,265],[64,188],[107,79],[235,51],[425,80],[522,167],[488,273],[353,303],[267,213],[190,180]].map(([x,y])=>[x,y]);draw()}
function draw(){g.fillStyle='#328149';g.fillRect(0,0,W,H);g.strokeStyle='#ffffff16';g.lineWidth=1;for(let i=0;i<W;i+=30){g.beginPath();g.moveTo(i,0);g.lineTo(i,H);g.stroke()}for(let j=0;j<H;j+=30){g.beginPath();g.moveTo(0,j);g.lineTo(W,j);g.stroke()}
 if(points.length){g.lineCap=g.lineJoin='round';g.beginPath();g.moveTo(...points[0]);points.slice(1).forEach(p=>g.lineTo(...p));if(points.length>=3)g.closePath();g.lineWidth=45;g.strokeStyle='#e9ecef';g.stroke();g.lineWidth=37;g.strokeStyle='#394550';g.stroke();g.lineWidth=2;g.setLineDash([10,10]);g.strokeStyle='#ccecff88';g.stroke();g.setLineDash([]);points.forEach((p,i)=>{g.fillStyle='#ffe780';g.beginPath();g.arc(p[0],p[1],7,0,Math.PI*2);g.fill();g.font='bold 11px Arial';g.fillStyle='#17283e';g.fillText(String(i+1),p[0]-3,p[1]+3)});}
 $('trackMsg20').textContent=points.length+' points • '+(points.length>=6?'Ready to save':'Add at least 6 points');}
cv.addEventListener('pointerdown',e=>{if(points.length>=15)return;const box=cv.getBoundingClientRect(),x=(e.clientX-box.left)*W/box.width,y=(e.clientY-box.top)*H/box.height;points.push([Math.min(560,Math.max(40,x)),Math.min(320,Math.max(30,y))]);draw()});
$('trackUndo20').onclick=()=>{points.pop();draw()};$('trackClear20').onclick=()=>{points=[];draw()};$('trackPreset20').onclick=example;
$('trackSave20').onclick=()=>{
 if(points.length<6){$('trackMsg20').textContent='Choose at least six points first.';return}
 const name=$('trackName20').value.trim()||'My Custom Circuit';
 const nodes=points.map(([x,y])=>[Math.round(x*2),Math.round(y*2+100)]);
 const result={name,nodes,theme:'grass'};
 try{localStorage.setItem(key,JSON.stringify(result));add(result);$('trackMsg20').textContent='✅ Saved! Reloading garage so the new map appears in every race mode.';setTimeout(()=>location.reload(),500)}catch{$('trackMsg20').textContent='Your browser blocked saving.'}
};
if(!points.length)example();else draw();
window.R95TrackBuilder20={count:()=>points.length,saveKey:key};
})();