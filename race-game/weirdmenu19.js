/* Race 95 v19 — playable weird-car gallery, per-player picker, and random surprise */
(()=>{
'use strict';
const D=window.R95V8,Draw=window.R95Draw,garage=document.getElementById('garage');
if(!D||!Draw||!garage||document.getElementById('weirdGarage19'))return;
const bonus=D.cars.filter(c=>c.wacky);
if(!bonus.length)return;
const style=document.createElement('style');
style.textContent='#weirdGarage19{background:linear-gradient(125deg,#291b40,#113951);border:2px solid #ffe87e77;border-radius:17px;margin:12px 0 16px;padding:12px 15px;box-shadow:0 10px 25px #0004}#weirdGarage19 h3{color:#ffed8f;margin:0 0 7px;font-size:20px}#weirdGarage19 p{color:#d5edff;margin:3px 0 10px;font-size:13px}#weirdTools19{display:flex;flex-wrap:wrap;gap:8px;align-items:center}#weirdTools19 select{min-width:140px;flex:1;margin:0;padding:9px;border-radius:10px;background:#081727;color:white;border:1px solid #8fdfff55}#weirdTools19 button{margin:0;padding:10px 12px;font-size:12px;border-radius:10px}#weirdGarage19 details{margin-top:12px}#weirdGarage19 summary{color:#ffe79c;cursor:pointer;font-weight:800;margin:0 0 8px}#weirdGrid19{display:grid;grid-template-columns:repeat(auto-fill,minmax(136px,1fr));gap:8px;max-height:340px;overflow:auto;padding:4px}#weirdGrid19 button{margin:0;padding:7px;min-height:110px;border-radius:11px;background:#0b1932;color:#fff;border:1px solid #ffffff36;display:flex;flex-direction:column;gap:3px;align-items:center;text-align:center}#weirdGrid19 button:hover,#weirdGrid19 button:focus-visible{outline:2px solid #f9e56a}#weirdGrid19 canvas{width:116px;height:69px;border-radius:6px;background:#28475d}#weirdGrid19 strong{font-size:11px;line-height:1.2}#weirdNotice19{font-size:12px;color:#91fff1;padding-top:8px;min-height:20px}';
document.head.appendChild(style);
const section=document.createElement('section');section.id='weirdGarage19';
section.innerHTML='<h3>🤪 WEIRDEST CARS & CELEBRITY RIDES</h3><p>24 new silly vehicles! Spy vans, sigma, bananas, ducks, a UFO, pizza, football superstars and more. All are playable with your brother.</p><div id="weirdTools19"><select id="weirdPlayer19" aria-label="Which player gets the car?"><option value="p1">Player 1</option><option value="p2">Player 2</option></select><select id="weirdPick19" aria-label="Choose funny car"></select><button id="weirdUse19" type="button">USE THIS CAR</button><button id="weirdRandom19" type="button">🎲 SURPRISE ME</button></div><details><summary>👀 SEE ALL 24 CARS (click to open gallery)</summary><div id="weirdGrid19"></div></details><p id="weirdNotice19" aria-live="polite"></p>';
const actions=garage.querySelector('.menuActions14'),panel=garage.querySelector('.panel');
if(actions)actions.insertAdjacentElement('afterend',section);
else panel?.insertAdjacentElement('afterbegin',section);
const get=id=>document.getElementById(id),pick=get('weirdPick19'),grid=get('weirdGrid19');
for(const car of bonus)pick.add(new Option(car.name,car.id));
function selectCar(id){
 const target=get('weirdPlayer19').value==='p2'?'p2Car':'p1Car',selector=get(target),car=D.cars.find(c=>c.id===id);
 if(!selector||!car)return;
 selector.value=String(id);
 selector.dispatchEvent(new Event('change',{bubbles:true}));
 get('weirdNotice19').textContent='🏎️ '+car.name+' selected for '+(target==='p2Car'?'Player 2':'Player 1')+'!';
}
get('weirdUse19').onclick=()=>selectCar(Number(pick.value));
get('weirdRandom19').onclick=()=>{const car=bonus[Math.floor(Math.random()*bonus.length)];pick.value=car.id;selectCar(car.id);};
for(const car of bonus){
 const btn=document.createElement('button');btn.type='button';btn.title=car.description;
 const canvas=document.createElement('canvas');canvas.width=140;canvas.height=82;const ctx=canvas.getContext('2d');
 const bg=ctx.createLinearGradient(0,0,140,82);bg.addColorStop(0,'#1c3d51');bg.addColorStop(1,'#132237');ctx.fillStyle=bg;ctx.fillRect(0,0,140,82);
 ctx.save();ctx.translate(69,41);ctx.scale(.90,.90);Draw.renderCar(ctx,0,0,-.09,car,'');ctx.restore();
 const name=document.createElement('strong');name.textContent=(car.id+1)+'. '+car.name;
 btn.append(canvas,name);btn.onclick=()=>{pick.value=car.id;selectCar(car.id);};grid.appendChild(btn);
}
window.R95WeirdGarage19={count:bonus.length,choose:selectCar};
})();