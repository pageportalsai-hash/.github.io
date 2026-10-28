/* Race 95 v14 — championship, sound, stunt lab and cosmetic rewards. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id), C=$('game'),g=C.getContext('2d'),W=C.width,H=C.height;
  const D=window.R95V8, Draw=window.R95Draw, Rail=window.R95Rails13, MapArt=window.R95Map12, X=window.R95Extras14;
  const ui={garage:$('garage'),mode:$('modeSelect'),p1car:$('p1Car'),p2car:$('p2Car'),p1color:$('p1Color'),p2color:$('p2Color'),track:$('trackSelect'),start:$('startBtn'),random:$('randomBtn'),preview:$('preview'),carTitle:$('carTitle'),carDesc:$('carDesc'),mapTitle:$('mapTitle'),mapDesc:$('mapDesc'),lap:$('lap'),pos:$('pos'),timer:$('timer'),best:$('best'),speed:$('speed'),carName:$('carName'),trackName:$('trackName'),message:$('message'),p2Panel:$('p2Panel')};
  const E=window.R95Expansion16, Mega=window.R95Mega20;
  const P=ui.preview.getContext('2d'), keys=Object.create(null), clamp=Rail.clamp;
  const read=(k,f)=>{try{return localStorage.getItem(k)??f;}catch{return f;}};
  const write=(k,v)=>{try{localStorage.setItem(k,String(v));}catch{}};
  const pick=(k,n,f)=>{const v=Number(read(k,f));return Number.isInteger(v)&&v>=0&&v<n?v:f;};
  const colour=(v,f)=>/^#[0-9a-f]{6}$/i.test(v)?v:f;
  let sel1=pick('r95p1',D.cars.length,0),sel2=pick('r95p2',D.cars.length,7),selT=pick('r95track',D.tracks.length,0);
  let paint1=colour(read('r95c1',D.cars[sel1].color),D.cars[sel1].color),paint2=colour(read('r95c2','#2f9cff'),'#2f9cff');
  let track,cars=[],state={started:false,mode:'garage',clock:0,paused:false,two:false,bannerUntil:0,best:null,finish:0},last=performance.now();
  const fmt=ms=>{ms=Math.floor(Math.max(0,ms));return Math.floor(ms/60000)+':'+String(Math.floor(ms%60000/1000)).padStart(2,'0')+'.'+String(ms%1000).padStart(3,'0');};
  function recordKey(car){return 'r95v13.best.'+track.def.id+'.'+car.def.id;}
  function bestFor(car){const v=Number(read(recordKey(car),'0'));return Number.isFinite(v)&&v>0?v:null;}
  function save(){write('r95p1',sel1);write('r95p2',sel2);write('r95track',selT);write('r95c1',paint1);write('r95c2',paint2);}
  const two=()=>ui.mode.value==='2';
  let session=null,attempt=0;
  const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
  const results=$('results14');
  const activity=$('activity14');
  function release(){for(const k of Object.keys(keys))delete keys[k];for(const s of Object.values(window.R95Car101||{}))s.boost=false;}

  const tools=document.createElement('div');tools.id='raceTools13';
  tools.innerHTML='<button id="pause13" type="button">Pause [P]</button><button id="rematch13" type="button">Restart [R]</button><button id="garage13" type="button">Garage [M]</button><button id="mute14" type="button">Sound ON [V]</button>';
  $('app').appendChild(tools);
  const note=document.createElement('div');note.id='railNote13';note.textContent='v14 • Smooth rails • No edge speed penalty';$('app').appendChild(note);
  const mission=document.createElement('div');mission.id='mission14';mission.className='hidden';$('app').appendChild(mission);
  const resume=document.createElement('button');resume.id='resume13';resume.type='button';resume.textContent='RESUME RACE';resume.className='hidden';ui.start.parentElement.appendChild(resume);
  function isGarage(){return !ui.garage.classList.contains('hidden');}
  const isResults=()=>!results.classList.contains('hidden');
  function canResume(){return state.started&&(state.mode==='run'||state.mode==='count');}
  function buttonState(){const ok=canResume();$('pause13').disabled=!ok||isGarage();$('pause13').textContent=state.paused?'Resume [P]':'Pause [P]';$('rematch13').disabled=!state.started;resume.classList.toggle('hidden',!ok);}
  function show(text,ms=0){ui.message.textContent=text;ui.message.classList.add('show');state.bannerUntil=ms?state.clock+ms:Infinity;}
  function resumeRace(){if(!canResume())return;X.audioStart();ui.garage.classList.add('hidden');state.paused=false;release();last=performance.now();ui.message.classList.remove('show');state.bannerUntil=0;buttonState();}
  function pauseRace(){if(!canResume()||isGarage()||isResults())return;state.paused=!state.paused;release();last=performance.now();if(state.paused)show('PAUSED\nP to resume');else{state.bannerUntil=0;ui.message.classList.remove('show');}buttonState();}
  function garage(){results.classList.add('hidden');if(isGarage()&&canResume()){resumeRace();return;}state.paused=canResume();release();ui.garage.classList.remove('hidden');updGarage();shop();buttonState();}
  $('pause13').onclick=pauseRace;$('garage13').onclick=garage;$('rematch13').onclick=()=>startRace();resume.onclick=resumeRace;
  addEventListener('keydown',e=>{
    const editing=/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName||'');
    if(e.code==='Escape'&&!e.repeat){e.preventDefault();if(isGarage())resumeRace();else pauseRace();return;}
    if(editing&&isGarage())return;
    if(e.code==='KeyV'&&!e.repeat){toggleSound();return;}
    if(isResults()){if(e.code==='KeyR'&&!e.repeat)rematch();return;}
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    if(e.code==='KeyP'&&!e.repeat){pauseRace();return;}
    if(e.code==='KeyM'&&!e.repeat){garage();return;}
    if(e.code==='KeyR'&&!e.repeat&&state.started){startRace();return;}
    if(!isGarage()&&!state.paused){keys[e.code]=true;if(!e.repeat&&['KeyF','Enter'].includes(e.code)){const who=e.code==='KeyF'?'p1':'p2',o=cars.find(v=>v.kind===who);if(o&&o.def.id===100&&state.mode==='run'){o.def.flying=!o.def.flying;o.jump=null;o.def.jumpHeight=0;}}}
  },{passive:false});
  addEventListener('keyup',e=>{delete keys[e.code];});
  addEventListener('blur',()=>{release();if(canResume()&&!state.paused&&!isGarage())pauseRace();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release();if(canResume()&&!state.paused&&!isGarage())pauseRace();}});
  D.cars.forEach((car,i)=>{const text=`${i+1}. ${car.name} — ${car.type}`;ui.p1car.add(new Option(text,i));ui.p2car.add(new Option(text,i));});
  D.tracks.forEach((t,i)=>ui.track.add(new Option(`${i+1}. ${t.name}`,i)));
  ui.p1car.value=sel1;ui.p2car.value=sel2;ui.track.value=selT;ui.p1color.value=paint1;ui.p2color.value=paint2;
  function updGarage(){
    const a={...D.cars[sel1],paint:paint1,cosmetic:X.profile.equipment.P1},b={...D.cars[sel2],paint:paint2,cosmetic:X.profile.equipment.P2},t=D.tracks[selT];
    ui.p2Panel.style.display=two()?'block':'none';ui.carTitle.textContent=`${a.name} — ${a.type}`;
    ui.carDesc.textContent=`Player 1 • Speed ${a.speed} • Grip ${a.grip}/10 • Smooth-edge driving`;
    ui.mapTitle.textContent=`${t.name} — difficulty ${t.difficulty}/5`;
    ui.mapDesc.textContent=`${t.theme} scenery • ${two()?'2-player':'solo + AI'} • barriers keep your speed`;
    P.clearRect(0,0,520,260);const q=P.createLinearGradient(0,0,0,260);q.addColorStop(0,t.top);q.addColorStop(1,t.bottom);P.fillStyle=q;P.fillRect(0,0,520,260);
    P.fillStyle='#343d48';P.fillRect(0,92,520,124);P.strokeStyle='#ffffff55';P.lineWidth=3;P.setLineDash([22,15]);P.beginPath();P.moveTo(0,154);P.lineTo(520,154);P.stroke();P.setLineDash([]);
    P.save();P.translate(two()?145:260,151);P.scale(1.55,1.55);Draw.renderCar(P,0,0,-.12,a,'P1');P.restore();
    if(two()){P.save();P.translate(375,154);P.scale(1.55,1.55);Draw.renderCar(P,0,0,.12,b,'P2');P.restore();}save();updateMenu();
  }
  ui.p1car.onchange=()=>{sel1=+ui.p1car.value;paint1=D.cars[sel1].color;ui.p1color.value=paint1;updGarage();};
  ui.p2car.onchange=()=>{sel2=+ui.p2car.value;paint2=D.cars[sel2].color;ui.p2color.value=paint2;updGarage();};
  ui.track.onchange=()=>{selT=+ui.track.value;updGarage();};
  ui.p1color.oninput=()=>{paint1=ui.p1color.value;updGarage();};ui.p2color.oninput=()=>{paint2=ui.p2color.value;updGarage();};ui.mode.onchange=updGarage;
  ui.random.onclick=()=>{sel1=Math.floor(Math.random()*D.cars.length);sel2=Math.floor(Math.random()*D.cars.length);selT=Math.floor(Math.random()*D.tracks.length);ui.p1car.value=sel1;ui.p2car.value=sel2;ui.track.value=selT;paint1=D.palette[Math.floor(Math.random()*D.palette.length)];paint2=D.palette[Math.floor(Math.random()*D.palette.length)];ui.p1color.value=paint1;ui.p2color.value=paint2;updGarage();};

  function updateMenu(){
    $('cupSetup14').classList.toggle('hidden',activity.value!=='cup');
    ui.track.disabled=activity.value!=='quick';
    ui.start.textContent=activity.value==='cup'?'START CHAMPIONSHIP':activity.value==='stunt'?'ENTER STUNT LAB':'START RACE';
    if(activity.value==='stunt'){ui.mapTitle.textContent='Stunt Lab • Free-drive practice';ui.mapDesc.textContent='3 ramps • 3 landing targets • 2 tunnels • no time limit';}
    if(activity.value==='cup'){ui.mapTitle.textContent='Brother Battle Championship';ui.mapDesc.textContent='Five chosen tracks • 3 laps each • highest points wins';}
    E.menu();Mega.menu(activity,ui);
  }
  for(let i=0;i<5;i++){const group=document.createElement('div'),lab=document.createElement('label'),select=document.createElement('select');lab.htmlFor='cupTrack'+i;lab.textContent='Race '+(i+1);select.id=lab.htmlFor;D.tracks.forEach((t,j)=>select.add(new Option((j+1)+'. '+t.name,j)));select.value=i;group.append(lab,select);$('cupTracks14').appendChild(group);}
  activity.onchange=()=>{if(activity.value==='cup')ui.mode.value='2';updGarage();};
  function audioUI(){for(const id of ['mute14','garageMute14']){$(id).textContent=X.sound.muted?'Sound OFF [V]':'Sound ON [V]';$(id).setAttribute('aria-pressed',String(!X.sound.muted));}if(!X.sound.available)$('audioNote14').textContent='Audio is unavailable in this browser; the game still works.';}
  function toggleSound(){X.audioStart();X.setMute(!X.sound.muted);audioUI();}
  $('mute14').onclick=toggleSound;$('garageMute14').onclick=toggleSound;$('volume14').value=Math.round(X.sound.volume*100);$('volume14').oninput=e=>X.setVolume(Number(e.target.value)/100);audioUI();
  function shop(){
    const who=$('shopPlayer14').value,gear=X.profile.equipment[who];$('wallet14').textContent=X.profile.coins+' coins';$('saveNote14').textContent=X.persisted?'Unlocks and outfits are saved in this browser.':'Browser storage is blocked. Progress is available for this visit only.';
    const grid=$('shopItems14');grid.replaceChildren();
    for(const item of X.catalogue){const owned=X.profile.unlocked.includes(item.id),equipped=gear[item.cat]===item.value,card=document.createElement('div');card.className='item14'+(equipped?' equipped':'');
      const swatch=document.createElement('div');swatch.className='swatch14';swatch.style.background=item.colour;const name=document.createElement('b');name.textContent=item.name;const small=document.createElement('small');small.textContent=item.cat==='flame'?'For Car 101 rocket boosters':'Visual only — same handling';const button=document.createElement('button');button.type='button';button.textContent=equipped?'Equipped for '+who:owned?'Equip for '+who:'Unlock • '+item.cost+' coins';button.disabled=equipped||(!owned&&X.profile.coins<item.cost);button.onclick=()=>{if(X.equip(item.id,who)){shop();updGarage();X.tone(880,.13);}};card.append(swatch,name,small,button);grid.appendChild(card);
    }
  }
  $('shopPlayer14').onchange=shop;$('stock14').onclick=()=>{X.reset($('shopPlayer14').value);shop();updGarage();};
  window.addEventListener('r95-rewards',()=>{if(isGarage())shop();});

  function curve(nodes,n=420){
    const pts=nodes.map(a=>({x:a[0],y:a[1]})),o=[];
    for(let i=0;i<n;i++){const u=i/n*pts.length,j=Math.floor(u),t=u-j,A=pts[(j-1+pts.length)%pts.length],B=pts[j%pts.length],Q=pts[(j+1)%pts.length],E=pts[(j+2)%pts.length],t2=t*t,t3=t2*t;o.push({x:.5*(2*B.x+(-A.x+Q.x)*t+(2*A.x-5*B.x+4*Q.x-E.x)*t2+(-A.x+3*B.x-3*Q.x+E.x)*t3),y:.5*(2*B.y+(-A.y+Q.y)*t+(2*A.y-5*B.y+4*Q.y-E.y)*t2+(-A.y+3*B.y-3*Q.y+E.y)*t3)});}
    // Keep every circuit and its barriers fully inside the shared-screen view.
    const xs=o.map(p=>p.x),ys=o.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const scale=Math.min(1,(W-220)/(maxX-minX),(H-220)/(maxY-minY));
    for(const p of o){p.x=W/2+(p.x-(minX+maxX)/2)*scale;p.y=H/2+(p.y-(minY+maxY)/2)*scale;}
    for(let i=0;i<o.length;i++){const a=o[(i-1+o.length)%o.length],b=o[(i+1)%o.length],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;Object.assign(o[i],{tx:dx/l,ty:dy/l,nx:-dy/l,ny:dx/l,p:i/o.length});}return o;
  }
  function makeTrack(def){
    const path=curve(def.nodes),road=145,bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');
    const roadPath=()=>{b.beginPath();b.moveTo(path[0].x,path[0].y);for(let i=1;i<path.length;i++)b.lineTo(path[i].x,path[i].y);b.closePath();};
    const z=b.createLinearGradient(0,0,0,H);z.addColorStop(0,def.top);z.addColorStop(1,def.bottom);b.fillStyle=z;b.fillRect(0,0,W,H);MapArt.paintGround(b,def,W,H);
    b.lineCap=b.lineJoin='round';roadPath();b.strokeStyle='#00000044';b.lineWidth=road+26;b.stroke();roadPath();b.strokeStyle='#e4ebef';b.lineWidth=road+16;b.stroke();roadPath();b.strokeStyle='#3b4047';b.lineWidth=road;b.stroke();
    b.save();b.setLineDash([30,30]);roadPath();b.strokeStyle='#ffffff25';b.lineWidth=4;b.stroke();b.restore();
    for(let i=0;i<path.length;i+=6){const p=path[i],a=Math.atan2(p.ty,p.tx);for(const side of [-1,1]){b.save();b.translate(p.x+p.nx*road*.55*side,p.y+p.ny*road*.55*side);b.rotate(a);b.fillStyle=((i/6|0)&1)?'#ff4b61':'#fff';b.fillRect(-12,-7,24,14);b.restore();}}
    MapArt.paintRoad(b,def,path,road);
    const rail=Rail.compile(path),start=Rail.pointAt(rail,0);b.save();b.translate(start.x,start.y);b.rotate(Math.atan2(start.ty,start.tx));
    for(let r=0;r<10;r++)for(let k=0;k<2;k++){b.fillStyle=(r+k)%2?'#141921':'#fff';b.fillRect(k*11-11,-road/2+r*road/10,11,road/10);}b.restore();
    return{path,bg,def,road,rail};
  }
  function mk(def,idx,kind,paint,label,side){const p=track.path[idx],pos=Rail.nearest(track.rail,p.x,p.y);return{x:p.x+p.nx*side,y:p.y+p.ny*side,a:Math.atan2(p.ty,p.tx),v:0,i:idx,lap:1,gate:0,prog:pos.s/track.rail.total,last:pos.s/track.rail.total,def:{...def,paint},kind,label,lapStart:0,fin:false,finishTime:Infinity,edge:false,bestLap:null,lapTimes:[],fuel:100,steer:0,stunt:{jumps:0,targets:0,tunnels:0}};}

  function choices(){return{sel1,sel2,paint1,paint2,two:two(),activity:activity.value,maps:activity.value==='cup'?Array.from({length:5},(_,i)=>Number($('cupTrack'+i).value)):[selT],environment:E.environment(),gear:JSON.parse(JSON.stringify(X.profile.equipment))};}
  function startEvent(config=choices()){
    X.audioStart();audioUI();session={id:uid(),config:JSON.parse(JSON.stringify(config)),round:0,points:{},history:[],fastest:{},stuntSeq:0,missions:{ramps:new Set(),targets:new Set(),tunnels:new Set()},earned:0,missionDone:new Set()};attempt=0;state.mode='garage';startRace();
  }
  function rematch(){if(session)startEvent(session.config);else startEvent();}
  function startRace(){
    if(!session){startEvent();return;}if(state.mode==='fin'){rematch();return;}
    release();results.classList.add('hidden');const q=session.config,city=E.isCity(q.activity),megaArena=Mega.isArenaMode(q.activity),stunt=q.activity==='stunt'||city||megaArena;attempt++;
    const selected=D.tracks[q.maps[session.round]]||D.tracks[0];
    const raceDef=q.activity==='reverse'?{...selected,nodes:[...selected.nodes].reverse(),name:selected.name+' REVERSE'}:selected;
    track=city?E.city(W,H,q.activity):megaArena?Mega.arena(W,H,q.activity):q.activity==='stunt'?X.arena(W,H):makeTrack(raceDef);
    const a=q.activity==='formula'?(D.cars.find(c=>c.type==='Formula')||D.cars[q.sel1]):D.cars[q.sel1],b=q.activity==='formula'?(D.cars.find(c=>c.type==='Formula')||D.cars[q.sel2]):D.cars[q.sel2],n=stunt?0:track.path.length;
    if(stunt){
      const create=(def,kind,paint,label,y)=>({x:145,y,a:0,v:0,i:0,lap:1,gate:0,prog:0,last:0,def:{...def,paint},kind,label,lapStart:0,fin:false,finishTime:Infinity,edge:false,bestLap:null,lapTimes:[],fuel:100,steer:0,stunt:{jumps:0,targets:0,tunnels:0}});
      cars=[create(a,'p1',q.paint1,'P1',265)];if(q.two)cars.push(create(b,'p2',q.paint2,'P2',350));
    }else{
      cars=[mk(a,n-7,'p1',q.paint1,'P1',-20)];
      if(q.two)cars.push(mk(b,n-7,'p2',q.paint2,'P2',20));else cars.push(mk({...D.cars[(q.sel1+7)%D.cars.length],max:4.2,acc:.06},n-7,'ai','#39a8ff','AI1',20));
      cars.push(mk({...D.cars[(q.sel1+13)%D.cars.length],max:4.15,acc:.058},n-20,'ai','#ffaf3b','AI2',-20));cars.push(mk({...D.cars[(q.sel1+19)%D.cars.length],max:4.1,acc:.056},n-20,'ai','#6ce879','AI3',20));
    }
    cars.forEach(o=>{o.def.cosmetic=q.gear[o.label]||X.stock();o.def.flying=false;o.def.boosting=false;o.def.jumpHeight=0;});
    if(city)E.begin(track,cars,session);
    Mega.begin(q.activity,track,cars,session);
    state={started:true,mode:stunt?'run':'count',clock:stunt?0:-3200,paused:false,two:q.two,bannerUntil:0,best:stunt?null:bestFor(cars[0]),finish:0,beep:0,awarded:false};
    ui.garage.classList.add('hidden');ui.trackName.textContent=track.def.name;ui.carName.textContent=state.two?'P1 + P2':a.name;last=performance.now();mission.classList.toggle('hidden',!stunt||megaArena);show(megaArena?'MEGA ARCADE!':city?(q.two?'CITY CO-OP':'CITY DRIVE'):stunt?'STUNT LAB\nFollow the ramp arrows':'3',stunt?1700:0);buttonState();hud();
  }
  ui.start.onclick=()=>startEvent();$('playTop14').onclick=()=>startEvent();$('rewardsTop14').onclick=()=>$('shop14').scrollIntoView({behavior:'smooth',block:'start'});
  $('next14').onclick=()=>{if(!session||session.config.activity!=='cup'||session.round>=4||state.mode!=='fin')return;session.round++;state.mode='garage';startRace();};
  $('rematch14').onclick=rematch;$('resultGarage14').onclick=garage;

  function control(o){const pad=Mega.gamepad(o.kind);if(pad)return pad;if(o.kind==='p1')return{f:keys.KeyW,b:keys.KeyS,l:keys.KeyA,r:keys.KeyD};if(o.kind==='p2')return{f:keys.ArrowUp,b:keys.ArrowDown,l:keys.ArrowLeft,r:keys.ArrowRight};return null;}

  function updateCar(o,dt){
    if(o.fin)return;const ctl=control(o),city=E.isCity(session.config.activity),megaArena=Mega.isArenaMode(session.config.activity),stunt=session.config.activity==='stunt'||city||megaArena;o.last=o.prog;
    let max=o.def.max,acc=o.def.acc,turn=o.def.turn;o.def.boosting=false;
    if(o.def.id===100&&ctl){const boost=keys[o.kind==='p1'?'ShiftLeft':'ShiftRight']&&o.fuel>1;o.def.boosting=!!boost;
      if(boost){o.fuel=Math.max(0,o.fuel-.75*dt);max=11.5;acc=.34;turn=.06;}else{o.fuel=Math.min(100,o.fuel+.16*dt);if(o.def.flying){max=8.2;acc=.13;turn=.063;}}
    }
    if(!ctl){const q=Rail.nearest(track.rail,o.x,o.y),t=Rail.pointAt(track.rail,q.s+65),want=Math.atan2(t.y-o.y,t.x-o.x);o.a+=clamp(Rail.angle(o.a,want),-.055,.055)*dt*.85;o.v=Math.min(max,o.v+acc*.55*dt);o.steer=0;}
    else{if(ctl.f)o.v+=acc*dt;if(ctl.b)o.v-=.12*dt;o.v=clamp(o.v,-1.4,max);const st=(ctl.l?-1:0)+(ctl.r?1:0);o.steer=st;
      if(st&&Math.abs(o.v)>.04)o.a+=st*turn*dt*Math.min(.92,.5+Math.abs(o.v)/4)*(o.v<0?-1:1)*(o.jump?.25:1);
      if(!st&&o.v>.35&&!stunt){const p=track.path[o.i],d=Rail.angle(o.a,Math.atan2(p.ty,p.tx));if(Math.abs(d)<1.35)o.a+=d*.018*dt;}
    }
    // Equal rolling drag everywhere; rails never subtract speed.
    o.v*=Math.pow(.994,dt);
    if(city){E.move(o,dt,track);return;}
    if(megaArena){Mega.move(o,dt,track,state.clock);return;}
    if(stunt){X.updateStunt(o,dt,track,state.clock,stuntEvent);return;}
    Rail.move(o,track.rail,track.road,dt);
    let delta=o.prog-o.last;if(delta<-.5)delta+=1;if(delta>.5)delta-=1;
    const gates=[.25,.50,.75];if(delta>0&&o.gate<3&&o.last<gates[o.gate]&&o.prog>=gates[o.gate])o.gate++;
    if(delta>0&&o.last>.90&&o.prog<.10&&o.gate===3){
      const lapTime=state.clock-o.lapStart;o.lapStart=state.clock;o.gate=0;o.lapTimes.push(lapTime);o.bestLap=o.bestLap===null?lapTime:Math.min(o.bestLap,lapTime);
      if(o.kind!=='ai'){const old=bestFor(o);if(!old||lapTime<old)write(recordKey(o),lapTime);if(o.kind==='p1')state.best=bestFor(o);}
      if(o.lap>=3){o.fin=true;o.finishTime=state.clock;o.v=0;o.def.boosting=false;X.tone(880,.18);if(state.two&&o.kind!=='ai')show(`${o.label} FINISHED\nOther player: keep racing!`,1600);}
      else{o.lap++;if(o.kind!=='ai')show(`${o.label} • LAP ${o.lap}`,700);}
    }
  }
  function stuntEvent(o,type,id,coins){
    if(type==='takeoff'){X.tone(280,.11);return;}
    const field=type==='jump'?'jumps':type==='target'?'targets':'tunnels';o.stunt[field]++;
    session.earned+=X.award(session.id+':stunt:'+session.stuntSeq++,coins);
    if(type==='jump')session.missions.ramps.add(id);else session.missions[field].add(id);
    let bonus=0;
    for(const [key,goal]of [['ramps',3],['targets',2],['tunnels',2]])if(session.missions[key].size>=goal&&!session.missionDone.has(key)){session.missionDone.add(key);bonus+=X.award(session.id+':challenge:'+key,60);}
    session.earned+=bonus;X.tone(type==='target'?1047:type==='tunnel'?740:523,.15);
    show(`${o.label} ${type==='target'?'TARGET LANDING':type==='tunnel'?'TUNNEL RUN':'JUMP LANDED'}\n+${coins+bonus} coins`,900);
  }

  function ranked(){return [...cars].sort((a,b)=>a.fin&&b.fin?a.finishTime-b.finishTime:a.fin?-1:b.fin?1:(b.lap+b.prog)-(a.lap+a.prog));}

  function finishIfNeeded(){
    if(E.isCity(session.config.activity)||session.config.activity==='stunt'||Mega.isArenaMode(session.config.activity)||state.awarded||!cars.filter(o=>o.kind!=='ai').every(o=>o.fin))return;
    state.mode='fin';state.finish=state.clock;state.awarded=true;release();cars.forEach(o=>{o.v=0;o.def.boosting=false;});
    const order=ranked(),points=[10,7,5,3];let reward=0;
    order.forEach((o,i)=>{session.points[o.label]=(session.points[o.label]||0)+points[i];if(o.kind!=='ai'){reward+=([100,80,65,50][i]||40)+o.lapTimes.length*10;session.fastest[o.label]=Math.min(session.fastest[o.label]||Infinity,o.bestLap||Infinity);}});
    Mega.raceFinish(cars,track);
    const entry={track:track.def.name,rows:order.map((o,i)=>({label:o.label,human:o.kind!=='ai',place:i+1,points:points[i],time:o.fin?o.finishTime:null,best:o.bestLap,car:o.def.name}))};session.history.push(entry);
    const cup=session.config.activity==='cup',final=cup&&session.round===4,standings=Object.entries(session.points).sort((a,b)=>b[1]-a[1]),leaders=standings.filter(x=>x[1]===standings[0][1]).map(x=>x[0]);
    if(final)reward+=leaders.some(v=>v==='P1'||v==='P2')?150:80;
    const earned=X.award(session.id+':round:'+session.round,reward);session.earned+=earned;
    results.classList.remove('hidden');ui.message.classList.remove('show');
    $('resultKicker14').textContent=cup?`BROTHER BATTLE • RACE ${session.round+1} OF 5`:'QUICK RACE • RESULTS';
    $('resultTitle14').textContent=final?(leaders.length>1?'Joint champions: ':'Champion: ')+leaders.join(' + '):entry.rows[0].label+' wins '+track.def.name+'!';
    $('resultInfo14').textContent=final?'Five races complete. Both players’ fastest laps and the overall standings are below.':cup?'Points added. Both players have finished. Ready for the next track?':'Race finished. Keep racing to earn more cosmetic rewards.';
    const table=document.createElement('table'),head=table.createTHead().insertRow();for(const h of ['Place','Driver','Race time','Fastest lap',cup?'Points':'Car']){const th=document.createElement('th');th.textContent=h;head.appendChild(th);}
    const body=table.createTBody();for(const row of entry.rows){const tr=body.insertRow();if(row.human)tr.className='human14';for(const text of [row.place,row.label,row.time===null?'DNF':fmt(row.time),row.best?fmt(row.best):'—',cup?'+'+row.points:row.car])tr.insertCell().textContent=text;}
    $('resultTable14').replaceChildren(table);$('cupSummary14').replaceChildren();
    if(cup){const h=document.createElement('h3');h.textContent='Championship standings';const t=document.createElement('table');for(const [label,total]of standings){const r=t.insertRow();r.insertCell().textContent=label;r.insertCell().textContent=total+' points';r.insertCell().textContent=session.fastest[label]?'Best lap '+fmt(session.fastest[label]):'';}$('cupSummary14').append(h,t);const history=document.createElement('p');history.textContent=session.history.map((x,i)=>(i+1)+'. '+x.track+' — '+x.rows[0].label).join(' | ');$('cupSummary14').appendChild(history);}
    $('resultRewards14').textContent=`+${earned} coins for this result • Shared wallet: ${X.profile.coins} coins • Cosmetics only`;
    $('next14').classList.toggle('hidden',!cup||final);$('rematch14').classList.toggle('hidden',cup&&!final);$('rematch14').textContent=cup?'REMATCH CHAMPIONSHIP':'REMATCH';
    X.cheer();buttonState();shop();(cup&&!final?$('next14'):$('rematch14')).focus();
  }
  function hud(){
    if(!cars.length)return;const p1=cars[0],p2=cars.find(o=>o.kind==='p2'),stunt=session.config.activity==='stunt',cup=session.config.activity==='cup';
    if(stunt){ui.lap.textContent='STUNT LAB';ui.pos.textContent=state.two?`P1 jumps ${p1.stunt.jumps} • P2 ${p2.stunt.jumps}`:`Jumps ${p1.stunt.jumps} • Targets ${p1.stunt.targets}`;ui.best.textContent='Session rewards: '+session.earned+' coins';
      mission.innerHTML='<strong>STUNT CHALLENGES • +60 each</strong><br>Jump from all 3 ramps: '+session.missions.ramps.size+'/3<br>Land in 2 different targets: '+session.missions.targets.size+'/2<br>Pass through both tunnels: '+session.missions.tunnels.size+'/2';
    }else{const order=ranked();ui.lap.textContent=state.two?`P1 ${p1.lap}/3 • P2 ${p2.lap}/3`:`Lap ${p1.lap}/3`;ui.pos.textContent=state.two?`P1 #${order.indexOf(p1)+1} • P2 #${order.indexOf(p2)+1}`:`Position ${order.indexOf(p1)+1}/${cars.length}`;ui.best.textContent='Saved best '+(state.best==null?'--':fmt(state.best));}
    if(Mega.isArenaMode(session.config.activity)){ui.lap.textContent='MEGA ARCADE';ui.pos.textContent=Mega.state?.message||'Challenge active';ui.best.textContent='Rewards: '+session.earned+' coins';}
    if(E.isCity(session.config.activity)){ui.lap.textContent=session.config.activity==='police'?'POLICE CHASE':'OPEN CITY';ui.pos.textContent=state.two?'P1 + P2 • COOPERATIVE':'Free drive';ui.best.textContent='Session rewards: '+session.earned+' coins';mission.textContent=E.status(track,cars);}
    ui.timer.textContent=fmt(state.mode==='fin'?state.finish:state.clock);ui.speed.textContent=Math.round(Math.abs(p1.v)*18);
    note.textContent=stunt?'STUNT LAB • '+X.profile.coins+' coins • M for garage':(cup?`CUP ${session.round+1}/5 • P1 ${session.points.P1||0} pts${state.two?' • P2 '+(session.points.P2||0)+' pts':''}`:'v14 • Smooth rails • No edge penalty');
    if(E.isCity(session.config.activity))note.textContent='v16 • City & Chase • '+X.profile.coins+' coins • M for garage';
    if(p1.def.id===100)note.textContent+=' • Rocket fuel '+Math.round(p1.fuel)+'%';
  }
  function draw(){
    g.clearRect(0,0,W,H);g.drawImage(track.bg,0,0);const stunt=session?.config.activity==='stunt';
    if(stunt){cars.filter(o=>!o.jump&&!o.def.flying).forEach(o=>Draw.renderCar(g,o.x,o.y,o.a,o.def,o.label));X.tunnelRoofs(g,track,cars);cars.filter(o=>o.jump||o.def.flying).forEach(o=>Draw.renderCar(g,o.x,o.y,o.a,o.def,o.label));}
    else for(const o of cars)Draw.renderCar(g,o.x,o.y,o.a,o.def,o.label);
    if(session){if(E.isCity(session.config.activity))E.draw(g,track,cars);E.weather(g,cars,session.config.environment,W,H,state.clock);Mega.draw(g,track,cars,state.clock);}
  }

  function frame(now){
    const elapsed=Math.min(33.333,Math.max(0,now-last));last=now;
    if(!state.paused&&!isGarage()&&!isResults()){
      if(state.mode==='count'||state.mode==='run')state.clock+=elapsed;
      if(state.mode==='count'){const beat=Math.max(0,Math.min(3,Math.ceil(-state.clock/1000)));if(state.beep!==beat){X.tone(beat===0?880:440,.13);state.beep=beat;}show(state.clock>0?'GO!':String(Math.min(3,Math.ceil(-state.clock/1000))));if(state.clock>=0){state.mode='run';show('GO!',650);}}
      else if(state.mode==='run'){cars.forEach(o=>updateCar(o,elapsed/16.6667));if(E.isCity(session.config.activity))E.update(track,cars,elapsed/1000,session);if(Mega.isArenaMode(session.config.activity)&&Mega.update(track,cars,elapsed/1000,state.clock)){state.mode='fin';state.finish=state.clock;cars.forEach(o=>o.v=0);}finishIfNeeded();Mega.afterFrame(cars);}
      if(state.mode==='run'&&state.clock>=state.bannerUntil)ui.message.classList.remove('show');
      if(cars.length)hud();draw();
    }
    X.updateSound(cars,state.mode==='run'&&!state.paused&&!isGarage()&&!isResults());
    requestAnimationFrame(frame);
  }
  track=makeTrack(D.tracks[selT]);updGarage();shop();draw();buttonState();
  // Refresh the preview when embedded car images finish decoding.
  setTimeout(()=>{if(isGarage())updGarage();},400);setTimeout(()=>{if(isGarage())updGarage();},1200);

  window.R95Game14={version:'20',snapshot:()=>({mode:state.mode,paused:state.paused,clock:state.clock,carCount:D.cars.length,mapCount:D.tracks.length,expansion:E.snapshot(),activity:session?.config.activity||'garage',round:session?session.round+1:0,points:session?.points||{},history:session?.history||[],track:track.def.name,coins:X.profile.coins,equipment:JSON.parse(JSON.stringify(X.profile.equipment)),audio:{available:X.sound.available,state:X.sound.ctx?.state,muted:X.sound.muted,active:X.sound.active,voices:X.sound.voices.length},cars:cars.map(o=>({id:o.def.id,kind:o.kind,x:o.x,y:o.y,a:o.a,speed:o.v,edge:o.edge,lap:o.lap,progress:o.prog,finished:o.fin,flight:o.def.flying,fuel:o.fuel,jump:o.jump,stunt:o.stunt,cosmetic:o.def.cosmetic,distanceFromTrack:track.rail?Rail.nearest(track.rail,o.x,o.y).d:0}))})};

  requestAnimationFrame(frame);
})();
