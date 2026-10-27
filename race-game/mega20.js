/* Race 95 v20: arena modes, photo, gamepad, vehicle gadgets, achievements and garage tools */
(()=>{'use strict';
const $=id=>document.getElementById(id),D=window.R95V8,X=window.R95Extras14;
if(!D||!X)return;
const arenaModes=[
 ['football','⚽ Car Football','Score three goals by bumping a giant football'],
 ['bowling','🎳 Car Bowling','Knock over ten bowling pins with your car'],
 ['flag','🚩 Capture the Flag','Bring the other team’s flag back to your base'],
 ['hide','🙈 Car Hide-and-Seek','One player hides; the other must catch them'],
 ['lava','🔥 Lava Escape','Drive to the exit before the lava catches you'],
 ['tornado','🌪️ Tornado Escape','Reach the safe zone despite the moving tornado'],
 ['ice','🧊 Ice Challenge','Keep control and reach the icy finish line'],
 ['water','🌊 Floating Platforms','Cross a flooded track without falling'],
 ['drag','🏁 Drag Racing','Race down a straight to the finish line'],
 ['parking','🅿️ Parking Challenge','Park precisely inside the target box'],
 ['delivery','📦 Delivery Missions','Collect three parcels and deliver them'],
 ['taxi','🚖 Taxi Missions','Collect three passengers around the city'],
 ['stadium','🏟️ Stadium Sprint','Race through stadium gates']
];
const raceModes=[['time','⏱️ Time Trial','Beat your own best laps'],['ghost','👻 Ghost Racing','Race a replay of your fastest recorded drive'],['reverse','🔄 Reverse Race','Race a course in the other direction'],['formula','🏎️ Formula Cup','Race in Formula-style cars']];
const A=new Map(arenaModes.map(x=>[x[0],x])),R=new Map(raceModes.map(x=>[x[0],x]));
const list=[...arenaModes,...raceModes], choose=$('activity14');
for(const [id,name]of list)if(!Array.from(choose.options).some(o=>o.value===id))choose.add(new Option(name,id));
const isArenaMode=id=>A.has(id),isRaceMode=id=>R.has(id),isMode=id=>isArenaMode(id)||isRaceMode(id);
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const read=(key,def='')=>{try{return localStorage.getItem(key)??def}catch{return def}};
const write=(key,value)=>{try{localStorage.setItem(key,String(value))}catch{}};
const best={};const achievements=new Set(JSON.parse(read('r95.mega20.awards','[]')));
const frames=[],maxFrames=720;
let current=null,plate=read('r95.mega20.plate','RACE95').slice(0,9),horn=0,signals=0,lights=true,nitroDown=false;
const controls=$('app'),style=document.createElement('style');
style.textContent='#megaPanel20{margin:16px 0;padding:16px;border:2px solid #70eaff66;border-radius:18px;background:linear-gradient(140deg,#142a42,#2b203c);color:#ecf7ff}#megaPanel20 h2{color:#ffe78d;margin:0 0 8px}#megaPanel20 p{color:#c9dff4;font-size:13px}#megaPanel20 input{background:#081727;color:white;border:1px solid #5abbe7;border-radius:8px;padding:8px}#megaPanel20 button{margin:5px;font-size:12px}#megaModes20{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:10px 0}#megaModes20 button{background:#10263a;color:#e8f5ff;border:1px solid #63e6ff5c;border-radius:12px;padding:10px;margin:0;min-height:58px;text-align:left}#megaModes20 button:focus-visible,#megaModes20 button:hover{outline:2px solid #ffe89a}#megaStatus20{position:absolute;right:13px;top:110px;z-index:3;background:#061521e4;color:#d5faff;max-width:310px;padding:10px 12px;border-radius:12px;font-weight:bold;font-size:13px;pointer-events:none;white-space:pre-line;border:1px solid #6aebff77}#megaPause20{position:absolute;right:12px;bottom:44px;display:flex;gap:7px;z-index:3}#megaPause20 button{margin:0;padding:9px 12px;font-size:12px}#megaAchievements20{font-size:12px;color:#ecf9c2;max-height:70px;overflow:auto}#megaHelp20{font-size:12px;color:#def4ff}';
document.head.appendChild(style);
const panel=document.createElement('section');panel.id='megaPanel20';panel.innerHTML='<h2>⭐ MEGA ARCADE — v20</h2><p>Play new challenges and use extra car gadgets. Your original 101 cars, 30 maps, brother battles and rewards remain available.</p><div id="megaModes20"></div><div><label for="megaPlate20">Custom number plate</label> <input id="megaPlate20" maxlength="9" value="RACE95" aria-label="Number plate"/> <button type="button" id="megaPlateSave20">SAVE PLATE</button> <button type="button" id="megaPhotos20">PHOTO MODE</button></div><p id="megaHelp20">H = horn • Q/E = indicators • L = headlights • N = nitro • O = replay trail • Gamepad supported. In an active race, P pauses.</p><p>True online multiplayer needs a multiplayer server and is not included in this static website edition.</p><div id="megaAchievements20">Achievements: none yet</div>';
$('shop14')?.insertAdjacentElement('beforebegin',panel);
const buttons=$('megaModes20');for(const [id,name]of list){const b=document.createElement('button');b.type='button';b.textContent=name;b.title=(A.get(id)||R.get(id))[2];b.onclick=()=>{choose.value=id;choose.dispatchEvent(new Event('change',{bubbles:true}));$('megaPanel20').scrollIntoView({block:'nearest'});};buttons.appendChild(b)}
$('megaPlate20').value=plate;
$('megaPlateSave20').onclick=()=>{plate=($('megaPlate20').value||'RACE95').toUpperCase().replace(/[^A-Z0-9 -]/g,'').slice(0,9);$('megaPlate20').value=plate;write('r95.mega20.plate',plate)};
$('megaPhotos20').onclick=()=>photo();
const status=document.createElement('div');status.id='megaStatus20';status.className='hidden';controls.appendChild(status);
const quick=document.createElement('div');quick.id='megaPause20';quick.innerHTML='<button id="photo20">📸 Photo [C]</button><button id="horn20">📣 Horn [H]</button>';controls.appendChild(quick);
$('photo20').onclick=()=>photo();$('horn20').onclick=()=>soundHorn();
function photo(){const canvas=$('game');if(!canvas)return;try{const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='race95-photo-'+Date.now()+'.png';a.click();achieve('Photographer')}catch{status.textContent='Photo saving is unavailable in this browser.';status.classList.remove('hidden')}}
function soundHorn(){const t=performance.now();if(t-horn<350)return;horn=t;X.audioStart();X.tone(370,.2);achieve('First Horn')}
function achieve(label){if(achievements.has(label))return;achievements.add(label);write('r95.mega20.awards',JSON.stringify([...achievements]));$('megaAchievements20').textContent='🏅 ACHIEVEMENTS: '+[...achievements].join(' • ');}
if(achievements.size)$('megaAchievements20').textContent='🏅 ACHIEVEMENTS: '+[...achievements].join(' • ');
addEventListener('keydown',e=>{if(e.repeat||/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName||''))return;
 if(e.code==='KeyH')soundHorn();
 if(e.code==='KeyQ')signals=signals===-1?0:-1;
 if(e.code==='KeyE')signals=signals===1?0:1;
 if(e.code==='KeyL')lights=!lights;
 if(e.code==='KeyN')nitroDown=true;
 if(e.code==='KeyC'){if($('garage').classList.contains('hidden'))photo();}
 if(e.code==='KeyO')ghostTrail=!ghostTrail;
});
addEventListener('keyup',e=>{if(e.code==='KeyN')nitroDown=false});
let ghostTrail=false;
function gamepad(kind){const gp=navigator.getGamepads?.()[kind==='p1'?0:1];if(!gp||!gp.connected)return null;const stick=gp.axes?.[0]||0,gas=(gp.buttons[7]?.value||0)>.15||gp.buttons[0]?.pressed,brake=(gp.buttons[6]?.value||0)>.15||gp.buttons[1]?.pressed;return{f:gas,b:brake,l:stick<-.24||gp.buttons[14]?.pressed,r:stick>.24||gp.buttons[15]?.pressed}}
function menu(activity,ui){if(isMode(activity.value)){
 ui.start.textContent=isArenaMode(activity.value)?'START '+A.get(activity.value)[1]:'START '+R.get(activity.value)[1];
 ui.track.disabled=isArenaMode(activity.value);ui.mapTitle.textContent=(A.get(activity.value)||R.get(activity.value))[1];
 ui.mapDesc.textContent=(A.get(activity.value)||R.get(activity.value))[2]+' • Keep your car, colours and rewards';
}}
function arena(W,H,mode){
 const t=X.arena(W,H);t.def.name=(A.get(mode)||['','Arcade Challenge'])[0]||'MEGA ARCADE';
 const c=t.bg.getContext('2d');c.clearRect(0,0,W,H);
 const z=c.createLinearGradient(0,0,W,H);z.addColorStop(0,['lava','tornado'].includes(mode)?'#532334':'#10304a');z.addColorStop(1,mode==='ice'?'#bde6ff':'#112037');c.fillStyle=z;c.fillRect(0,0,W,H);
 c.strokeStyle='#76dcec';c.lineWidth=7;c.strokeRect(50,100,W-100,H-175);
 c.lineWidth=1;c.strokeStyle='#7fe9ff20';for(let x=90;x<W-80;x+=50){c.beginPath();c.moveTo(x,104);c.lineTo(x,H-77);c.stroke()}for(let y=125;y<H-65;y+=50){c.beginPath();c.moveTo(53,y);c.lineTo(W-52,y);c.stroke()}
 c.fillStyle='#eaffff';c.textAlign='center';c.font='900 24px system-ui';c.fillText(A.get(mode)?.[1]||'MEGA ARCADE',W/2,75);
 if(mode==='football'){c.fillStyle='#1b794e';c.fillRect(75,145,W-150,H-270);c.strokeStyle='#fff9';c.lineWidth=4;c.strokeRect(75,145,W-150,H-270);c.beginPath();c.moveTo(W/2,145);c.lineTo(W/2,H-125);c.stroke();c.beginPath();c.arc(W/2,H/2,105,0,Math.PI*2);c.stroke();for(const x of[60,W-80]){c.fillStyle='#fff3';c.fillRect(x,270,20,190)}}
 if(mode==='drag'){for(const y of[235,455]){c.fillStyle='#3f4754';c.fillRect(90,y,1100,125);c.strokeStyle='#f4dc60';c.setLineDash([22,12]);c.beginPath();c.moveTo(100,y+62);c.lineTo(1190,y+62);c.stroke();c.setLineDash([]);}c.fillStyle='#fff';c.fillRect(1080,205,9,410);}
 return t;
}
function begin(mode,track,cars,session){
 current={mode,track,cars,session,elapsed:0,finished:false,score:{p1:0,p2:0},ball:{x:600,y:360,vx:0,vy:0},pins:Array.from({length:10},(_,i)=>({x:835+(i%4)*31,y:280+Math.floor(i/4)*47,down:false})),collect:0,flag:{x:1060,y:360,heldBy:null},seekerReleased:false,spot:{x:1020,y:190},tornado:{x:640,y:370},visited:new Set(),daily:Math.abs(Math.floor(Date.now()/86400000))%arenaModes.length};
 frames.length=0;if(isArenaMode(mode)){cars.forEach((car,i)=>{car.x=mode==='football'?(i?995:205):i?180:160;car.y=mode==='football'?360:i?440:350;car.a=0;car.v=0;car.nitro=100;});}
 status.classList.toggle('hidden',!isMode(mode));updateStatus();
}
function updateStatus(){if(!current||!isMode(current.mode))return;const s=current,m=s.mode;let lines=[(A.get(m)||R.get(m))[1]];
 if(m==='football')lines.push('GOALS: P1 '+s.score.p1+' • P2 '+s.score.p2+'  |  First to 3');
 else if(m==='bowling')lines.push('PINS: '+s.pins.filter(x=>x.down).length+'/10');
 else if(m==='flag')lines.push('FLAGS: P1 '+s.score.p1+' • P2 '+s.score.p2);
 else if(m==='hide')lines.push(s.elapsed<12?'HIDING TIME: '+Math.ceil(12-s.elapsed)+'s':'SEEKER RELEASED • Catch the hider');
 else if(m==='lava')lines.push('LAVA RISING • Reach the safe zone');
 else if(m==='drag')lines.push('Finish line at the right-hand side');
 else if(['delivery','taxi'].includes(m))lines.push('COMPLETED: '+s.collect+'/3');
 else if(m==='parking')lines.push('Stop your car inside the parking zone');
 else if(m==='stadium')lines.push('CHECKPOINTS: '+s.collect+'/4');
 else if(m==='time'||m==='ghost')lines.push('Beat your best lap time');
 else if(m==='reverse')lines.push('Reverse course • same driving controls');
 else lines.push('Reach the target at the far side');
 status.textContent=lines.join('\n');
}
function move(car,dt,track,clock){
 const seconds=dt/60;if(car.nitro==null)car.nitro=100;
 if(nitroDown&&car.kind==='p1'&&car.nitro>0){car.v=Math.min(9,car.v+.07*dt);car.nitro-=.9*dt;car.def.boosting=true;achieve('First Nitro');}
 else car.nitro=Math.min(100,car.nitro+.2*dt);
 if(current?.mode==='ice'){car.a+=(car.steer||0)*.004*dt;}
 car.x+=Math.cos(car.a)*car.v*4.25*dt;car.y+=Math.sin(car.a)*car.v*4.25*dt;
 if(car.x<95||car.x>1100){car.x=clamp(car.x,95,1100);car.a=Math.PI-car.a}if(car.y<145||car.y>615){car.y=clamp(car.y,145,615);car.a=-car.a}
 if(current?.mode==='tornado'){const q=current.tornado,d=distance(car,q);if(d<180){const a=Math.atan2(car.y-q.y,car.x-q.x)+Math.PI/2;car.x+=Math.cos(a)*dt*5;car.y+=Math.sin(a)*dt*5;}}
}
function complete(winner,msg){const s=current;if(!s||s.finished)return;s.finished=true;s.winner=winner;s.message=msg;achieve('Arcade Winner');status.textContent='🏆 '+msg+' • Press R to retry or M for garage';if(s.session){const award=X.award(s.session.id+':mega:'+s.mode,95);s.session.earned+=award;}}
function update(track,cars,elapsed,clock){
 const s=current;if(!s||s.finished)return s?.finished||false;s.elapsed+=elapsed;
 const m=s.mode,human=cars.filter(o=>o.kind!=='ai'),p1=human[0],p2=human[1];if(!p1)return false;
 if(m==='football'){const b=s.ball;b.x+=b.vx*elapsed*60;b.y+=b.vy*elapsed*60;b.vx*=Math.pow(.978,elapsed*60);b.vy*=Math.pow(.978,elapsed*60);
 if(b.y<170||b.y>550){b.y=clamp(b.y,170,550);b.vy*=-.8;}
 for(const o of human){const d=distance(o,b);if(d<58){const a=Math.atan2(b.y-o.y,b.x-o.x);b.vx=Math.cos(a)*(Math.abs(o.v)*.7+3);b.vy=Math.sin(a)*(Math.abs(o.v)*.7+3);b.x=o.x+Math.cos(a)*61;b.y=o.y+Math.sin(a)*61;}}
 if(b.x>1102||b.x<98){const who=b.x>1102?'p1':'p2';s.score[who]++;achieve('First Football Goal');b.x=600;b.y=360;b.vx=b.vy=0;if(s.score[who]>=3)complete(who,(who==='p1'?'P1':'P2')+' wins Car Football!');}
 }
 if(m==='bowling'){for(const pin of s.pins)if(!pin.down&&distance(p1,pin)<51){pin.down=true;X.tone(640,.1);}if(s.pins.every(x=>x.down))complete('p1','All ten pins knocked down!')}
 if(m==='flag'){for(const o of human){let f=s.flag,base=o.kind==='p1'?170:1020,foreign=o.kind==='p1'?1020:170;if(!o.flag&&Math.hypot(o.x-foreign,o.y-360)<60){o.flag=true;achieve('Flag Captured');}
 if(o.flag&&Math.hypot(o.x-base,o.y-360)<80){o.flag=false;s.score[o.kind]++;if(s.score[o.kind]>=2)complete(o.kind,o.label+' wins Capture the Flag!')}}}
 if(m==='hide'){if(p2&&s.elapsed>=12&&distance(p1,p2)<70)complete('p2','P2 found the hidden car!');else if(s.elapsed>=45)complete('p1','P1 stayed hidden!');}
 if(m==='lava'&&p1.x>990&&p1.y<260)complete('p1','You escaped the lava!');else if(m==='lava'&&s.elapsed>80)complete('lava','The lava won this round!');
 if(m==='tornado'||m==='ice'||m==='water'){if(p1.x>1020&&p1.y<500)complete('p1','You made it across '+m+'!');}
 if(m==='drag'&&p1.x>1078)complete('p1','Drag race finish!'+(p2?' P1 wins!':''));else if(m==='drag'&&p2?.x>1078)complete('p2','P2 wins the drag race!');
 if(m==='parking'&&Math.abs(p1.x-950)<60&&Math.abs(p1.y-380)<65&&Math.abs(p1.v)<1.25)complete('p1','Perfect parking!');
 if(m==='delivery'||m==='taxi'){const goals=[[370,200],[650,520],[985,260]];const q=goals[s.collect];if(q&&Math.hypot(p1.x-q[0],p1.y-q[1])<70){s.collect++;if(s.collect>=3)complete('p1',m==='taxi'?'All passengers delivered!':'All packages delivered!')}}
 if(m==='stadium'){const goals=[[330,210],[970,210],[970,555],[330,555]];const q=goals[s.collect];if(q&&Math.hypot(p1.x-q[0],p1.y-q[1])<80){s.collect++;if(s.collect>=4)complete('p1','Stadium champion!')}}
 updateStatus();return !!s.finished;
}
function draw(g,track,cars,clock){
 if(!current)return;const s=current,m=s.mode,t=clock/1000;
 if(isArenaMode(m)){
  g.save();if(m==='football'){g.fillStyle='#f8faff';g.beginPath();g.arc(s.ball.x,s.ball.y,24,0,Math.PI*2);g.fill();g.fillStyle='#13203a';for(let i=0;i<5;i++){let a=i*2*Math.PI/5;g.beginPath();g.arc(s.ball.x+Math.cos(a)*12,s.ball.y+Math.sin(a)*12,6,0,Math.PI*2);g.fill();}}
  if(m==='bowling')for(const pin of s.pins)if(!pin.down){g.fillStyle='#ffffff';g.beginPath();g.ellipse(pin.x,pin.y,11,17,0,0,Math.PI*2);g.fill();g.fillStyle='#e3484b';g.fillRect(pin.x-11,pin.y-3,22,5)}
  if(m==='flag'){for(const [x,col]of[[170,'#61c9ff'],[1020,'#ff8b68']]){g.fillStyle=col;g.fillRect(x-18,342,36,36);g.fillRect(x,322,3,38);g.beginPath();g.moveTo(x+3,322);g.lineTo(x+29,331);g.lineTo(x+3,341);g.fill()}}
  if(m==='hide'){if(s.elapsed<12){g.fillStyle='#ffe88e';g.font='bold 27px Arial';g.fillText('HIDE!',525,140)}else{g.fillStyle='#fff';g.font='bold 26px Arial';g.fillText('FIND!',525,140)}}
  if(m==='lava'){let rise=Math.max(0,(s.elapsed-5)*3);g.fillStyle='#ff481eaa';g.shadowColor='#fc6719';g.shadowBlur=16;g.fillRect(53,600-rise,1094,720);g.shadowBlur=0;}
  if(m==='tornado'){s.tornado.x=620+Math.sin(t*.55)*230;s.tornado.y=360+Math.cos(t*.76)*155;g.save();g.translate(s.tornado.x,s.tornado.y);g.rotate(t*1.5);for(let i=0;i<5;i++){g.strokeStyle=i%2?'#e3f4ffbb':'#65cbe8bb';g.lineWidth=10-i;g.beginPath();g.ellipse(0,0,21+i*20,12+i*16,i*.35,0,Math.PI*2);g.stroke()}g.restore();}
  if(m==='water'){g.fillStyle='#1565a0b0';for(let x=310;x<=850;x+=240)g.fillRect(x,150,62,470);}
  if(m==='parking'){g.strokeStyle='#c2f8ff';g.lineWidth=8;g.strokeRect(890,315,120,125);g.font='bold 22px Arial';g.fillStyle='#f3ffff';g.fillText('P',943,385);}
  if(m==='delivery'||m==='taxi'||m==='stadium'){const goals=(m==='stadium'?[[330,210],[970,210],[970,555],[330,555]]:[[370,200],[650,520],[985,260]]);goals.forEach(([x,y],i)=>{if(i<s.collect)return;g.strokeStyle=i===s.collect?'#d5ff6c':'#ffffff33';g.lineWidth=5;g.beginPath();g.arc(x,y,31,0,Math.PI*2);g.stroke();g.font='20px Arial';g.fillText(m==='taxi'?'🚖':m==='delivery'?'📦':'🏁',x-13,y+6);});}
  if(['tornado','ice','water','lava'].includes(m)){g.fillStyle='#89fff5';g.fillRect(1030,150,83,92);g.font='bold 17px Arial';g.fillStyle='#102438';g.fillText('EXIT',1040,195);}
  g.restore();
 }else if(m==='ghost'&&ghostTrail&&frames.length){g.save();g.setLineDash([4,12]);g.lineWidth=4;g.strokeStyle='#9de8ff99';g.beginPath();frames.forEach((v,i)=>i?g.lineTo(v.x,v.y):g.moveTo(v.x,v.y));g.stroke();g.restore();}
 // Headlights, turn signals, nitro and number plate on live cars.
 for(const o of cars){if(o.kind==='ai')continue;g.save();g.translate(o.x,o.y);g.rotate(o.a);
 if(lights){g.fillStyle='#f5fcff19';g.beginPath();g.moveTo(33,-18);g.lineTo(85,-37);g.lineTo(85,37);g.lineTo(33,18);g.fill();}
 if(signals&&(Math.floor(performance.now()/300)%2)){g.fillStyle='#ffa600';g.beginPath();g.arc(signals>0?33:-30,signals>0?20:-20,6,0,Math.PI*2);g.fill();}
 if(o.def.boosting||nitroDown&&o.kind==='p1'){g.fillStyle='#39dfff';g.beginPath();g.moveTo(-42,0);g.lineTo(-72+Math.sin(t*12)*15,-16);g.lineTo(-54,0);g.lineTo(-72+Math.sin(t*12)*15,16);g.fill();}
 g.save();g.rotate(Math.PI/2);g.fillStyle='#ffffff';g.strokeStyle='#071829';g.lineWidth=2;g.font='bold 8px Arial';g.strokeText(plate,0,14);g.fillText(plate,0,14);g.restore();g.restore();}
}
function afterFrame(cars){if(!cars.length||!current)return;const p1=cars.find(c=>c.kind==='p1');if(p1){frames.push({x:p1.x,y:p1.y,a:p1.a});if(frames.length>maxFrames)frames.shift();if(p1.v>8)achieve('Speed Demon')}}
function raceFinish(cars,track){const p1=cars.find(c=>c.kind==='p1');if(!p1)return;const key='r95.mega20.ghost.'+track.def.id;if(current?.mode==='ghost'||current?.mode==='time'){try{write(key,JSON.stringify(frames.slice(-maxFrames)));}catch{}}achieve('Race Finisher')}
window.R95Mega20={arenaModes,raceModes,isArenaMode,isRaceMode,isMode,menu,arena,begin,move,update,draw,afterFrame,raceFinish,gamepad,achieve,get state(){return current},get plate(){return plate},get signals(){return signals},get lights(){return lights}};
})();