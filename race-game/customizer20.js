/* Race 95 v20 — deeper cosmetic tuning: spoiler, roof, grille, body kit, exhaust and rims */
(()=>{'use strict';
const Draw=window.R95Draw;if(!Draw||!Draw.renderCar)return;
const before=Draw.renderCar,$=id=>document.getElementById(id),garage=$('garage');
const fields={spoiler:['Stock','Small','Race Wing','Formula Wing'],wheels:['Stock','Chrome','Black','Gold','Neon'],roof:['Closed','Convertible','Sunroof'],body:['Stock','Widebody','Armoured','Sport'],exhaust:['Stock','Dual','Quad','Rocket'],lights:['White','Blue','Purple','Golden'],doors:['Closed','Show Open']};
function load(p){let v={};try{v=JSON.parse(localStorage.getItem('r95.custom20.'+p)||'{}')}catch{}return Object.fromEntries(Object.entries(fields).map(([k,arr])=>[k,arr.includes(v[k])?v[k]:arr[0]]))}
const selected={P1:load('P1'),P2:load('P2')};
function save(who){try{localStorage.setItem('r95.custom20.'+who,JSON.stringify(selected[who]))}catch{}}
const div=document.createElement('section');div.id='custom20';div.style.cssText='padding:15px;margin:10px 0;border:1px solid #c094ff99;background:#182239;border-radius:16px;color:#f7f3ff';
div.innerHTML='<details><summary style="color:#ffc8ff;cursor:pointer;font-weight:900">🔧 SUPER CAR CUSTOMISATION — SPOILERS, RIMS, ROOFS & MORE</summary><p>Choose the player, then customise every part. These cosmetic parts don’t affect your speed, so racing stays fair.</p><label for="customPlayer20">Car to customise</label><select id="customPlayer20"><option value="P1">Player 1</option><option value="P2">Player 2</option></select><div id="customFields20" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:8px"></div><button type="button" id="customReset20">RESET COSMETICS</button><p id="customStatus20" style="font-size:12px;color:#aafaff">Saved in this browser.</p></details>';
(garage.querySelector('.menuActions14')||garage.querySelector('.panel'))?.insertAdjacentElement('afterend',div);
const holder=$('customFields20'),inputs={};
for(const [id,values] of Object.entries(fields)){const group=document.createElement('div'),label=document.createElement('label'),sel=document.createElement('select');label.textContent=id[0].toUpperCase()+id.slice(1);label.htmlFor='customOption'+id;sel.id=label.htmlFor;for(const val of values)sel.add(new Option(val,val));sel.onchange=()=>{const p=$('customPlayer20').value;selected[p][id]=sel.value;save(p);$('customStatus20').textContent='✅ Saved '+p+' '+id+': '+sel.value;const picker=$(p==='P1'?'p1Color':'p2Color');picker?.dispatchEvent(new Event('input',{bubbles:true}));};group.append(label,sel);holder.appendChild(group);inputs[id]=sel;}
function sync(){const v=selected[$('customPlayer20').value];for(const k of Object.keys(fields))inputs[k].value=v[k]}
$('customPlayer20').onchange=sync;$('customReset20').onclick=()=>{const who=$('customPlayer20').value;selected[who]=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v[0]]));save(who);sync();$('customStatus20').textContent='Reset '+who+' to stock.';};sync();
function round(c,x,y,w,h,r,fill,outline){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(outline){c.strokeStyle=outline;c.lineWidth=2;c.stroke()}}
function renderCar(c,X,Y,A,car,label=''){
 before(c,X,Y,A,car,label);
 const gear=selected[label];if(!gear)return;
 c.save();c.translate(X,Y);c.rotate(A);
 const color=(car.paint||car.color||'#e43939');
 if(gear.body==='Widebody'){c.strokeStyle=color;c.lineWidth=6;c.beginPath();c.moveTo(-30,-26);c.lineTo(22,-27);c.moveTo(-30,26);c.lineTo(22,27);c.stroke()}
 if(gear.body==='Armoured'){round(c,-23,-21,34,9,3,'#222b37bb','#9ea8b8');round(c,-23,12,34,9,3,'#222b37bb','#9ea8b8')}
 if(gear.body==='Sport'){c.strokeStyle='#fffa';c.lineWidth=3;c.beginPath();c.moveTo(-40,-14);c.lineTo(38,-16);c.moveTo(-40,14);c.lineTo(38,16);c.stroke()}
 const metallic={Chrome:'#e0edf6',Black:'#18202a',Gold:'#ffd55d',Neon:'#65e9ff'}[gear.wheels];
 if(metallic)for(const x of[-26,24])for(const y of[-24,24]){c.fillStyle=metallic;c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fill()}
 if(gear.roof==='Convertible'){round(c,-11,-17,22,34,9,'#0a1826','#9fdbed')}
 if(gear.roof==='Sunroof'){round(c,-19,-9,25,18,4,'#1d3346cc','#e5f7ff')}
 const sp=gear.spoiler;if(sp!=='Stock'){const w=sp==='Small'?35:sp==='Race Wing'?55:65;round(c,-51,-w/2,7,w,2,sp==='Formula Wing'?'#101722':'#252c39','#d1e6ee');}
 const exhaust=gear.exhaust;if(exhaust!=='Stock'){const ys=exhaust==='Dual'?[-12,12]:[-17,-5,5,17];for(const y of ys){round(c,-48,y-3,8,6,3,'#777f8e','#101f31');if(exhaust==='Rocket'){c.fillStyle='#5ce8ff';c.beginPath();c.moveTo(-48,y);c.lineTo(-65,y-5);c.lineTo(-65,y+5);c.fill()}}}
 const light={White:'#fff6c8',Blue:'#6bdcff',Purple:'#d98dff',Golden:'#ffc342'}[gear.lights];
 if(light){round(c,33,-14,9,5,2,light);round(c,33,9,9,5,2,light)}
 if(gear.doors==='Show Open'){c.fillStyle=color;c.strokeStyle='#111';c.lineWidth=2;c.beginPath();c.moveTo(-10,-21);c.lineTo(-30,-44);c.lineTo(11,-40);c.lineTo(10,-21);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-10,21);c.lineTo(-30,44);c.lineTo(11,40);c.lineTo(10,21);c.closePath();c.fill();c.stroke();}
 c.restore();
}
window.R95Draw={renderCar};
window.R95Custom20={equipment:selected,fields};
})();