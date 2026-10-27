/* Race 95 v13 — speed-preserving rails, pause/resume and saved lap records. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id), C=$('game'),g=C.getContext('2d'),W=C.width,H=C.height;
  const D=window.R95V8, Draw=window.R95Draw, Rail=window.R95Rails13, MapArt=window.R95Map12;
  const ui={garage:$('garage'),mode:$('modeSelect'),p1car:$('p1Car'),p2car:$('p2Car'),p1color:$('p1Color'),p2color:$('p2Color'),track:$('trackSelect'),start:$('startBtn'),random:$('randomBtn'),preview:$('preview'),carTitle:$('carTitle'),carDesc:$('carDesc'),mapTitle:$('mapTitle'),mapDesc:$('mapDesc'),lap:$('lap'),pos:$('pos'),timer:$('timer'),best:$('best'),speed:$('speed'),carName:$('carName'),trackName:$('trackName'),message:$('message'),p2Panel:$('p2Panel')};
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
  function release(){for(const k of Object.keys(keys))delete keys[k];for(const s of Object.values(window.R95Car101||{}))s.boost=false;}
  const css=document.createElement('style');
  css.textContent=`#raceTools13{position:absolute;left:12px;bottom:42px;display:flex;gap:7px;z-index:3}#raceTools13 button{margin:0;padding:9px 12px;font-size:12px;box-shadow:0 4px 12px #0006}#raceTools13 button:disabled{opacity:.4;cursor:default}#railNote13{position:absolute;right:12px;bottom:43px;background:#082431df;color:#9cffee;border:1px solid #55dccb66;border-radius:12px;padding:9px 12px;font-size:12px;pointer-events:none}#game{object-fit:contain}#resume13{margin-top:8px;background:#b2f4c6}#garage{z-index:5}#message{white-space:pre-line;text-align:center;font-size:clamp(38px,8vw,100px)}@media(max-width:700px){#raceTools13{bottom:10px}#railNote13{bottom:55px;font-size:10px}#help{display:none}}`;
  document.head.appendChild(css);
  const tools=document.createElement('div');tools.id='raceTools13';
  tools.innerHTML='<button id="pause13" type="button">Pause [P]</button><button id="rematch13" type="button">Restart [R]</button><button id="garage13" type="button">Garage [M]</button>';
  $('app').appendChild(tools);
  const note=document.createElement('div');note.id='railNote13';note.textContent='v13 • Smooth rails • No edge speed penalty';$('app').appendChild(note);
  const resume=document.createElement('button');resume.id='resume13';resume.type='button';resume.textContent='RESUME RACE';resume.className='hidden';ui.start.parentElement.appendChild(resume);
  function isGarage(){return !ui.garage.classList.contains('hidden');}
  function canResume(){return state.started&&(state.mode==='run'||state.mode==='count');}
  function buttonState(){const ok=canResume();$('pause13').disabled=!ok||isGarage();$('pause13').textContent=state.paused?'Resume [P]':'Pause [P]';$('rematch13').disabled=!state.started;resume.classList.toggle('hidden',!ok);}
  function show(text,ms=0){ui.message.textContent=text;ui.message.classList.add('show');state.bannerUntil=ms?state.clock+ms:Infinity;}
  function resumeRace(){if(!canResume())return;ui.garage.classList.add('hidden');state.paused=false;release();last=performance.now();ui.message.classList.remove('show');state.bannerUntil=0;buttonState();}
  function pauseRace(){if(!canResume()||isGarage())return;state.paused=!state.paused;release();last=performance.now();if(state.paused)show('PAUSED\nP to resume');else{state.bannerUntil=0;ui.message.classList.remove('show');}buttonState();}
  function garage(){if(isGarage()&&canResume()){resumeRace();return;}state.paused=canResume();release();ui.garage.classList.remove('hidden');updGarage();buttonState();}
  $('pause13').onclick=pauseRace;$('garage13').onclick=garage;$('rematch13').onclick=()=>startRace();resume.onclick=resumeRace;
  addEventListener('keydown',e=>{
    const editing=/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName||'');
    if(e.code==='Escape'&&!e.repeat){e.preventDefault();if(isGarage())resumeRace();else pauseRace();return;}
    if(editing&&isGarage())return;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
    if(e.code==='KeyP'&&!e.repeat){pauseRace();return;}
    if(e.code==='KeyM'&&!e.repeat){garage();return;}
    if(e.code==='KeyR'&&!e.repeat&&state.started){startRace();return;}
    if(!isGarage()&&!state.paused)keys[e.code]=true;
  },{passive:false});
  addEventListener('keyup',e=>{delete keys[e.code];});
  addEventListener('blur',()=>{release();if(canResume()&&!state.paused&&!isGarage())pauseRace();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release();if(canResume()&&!state.paused&&!isGarage())pauseRace();}});
  D.cars.forEach((car,i)=>{const text=`${i+1}. ${car.name} — ${car.type}`;ui.p1car.add(new Option(text,i));ui.p2car.add(new Option(text,i));});
  D.tracks.forEach((t,i)=>ui.track.add(new Option(`${i+1}. ${t.name}`,i)));
  ui.p1car.value=sel1;ui.p2car.value=sel2;ui.track.value=selT;ui.p1color.value=paint1;ui.p2color.value=paint2;
  function updGarage(){
    const a={...D.cars[sel1],paint:paint1},b={...D.cars[sel2],paint:paint2},t=D.tracks[selT];
    ui.p2Panel.style.display=two()?'block':'none';ui.carTitle.textContent=`${a.name} — ${a.type}`;
    ui.carDesc.textContent=`Player 1 • Speed ${a.speed} • Grip ${a.grip}/10 • Smooth-edge driving`;
    ui.mapTitle.textContent=`${t.name} — difficulty ${t.difficulty}/5`;
    ui.mapDesc.textContent=`${t.theme} scenery • ${two()?'2-player':'solo + AI'} • barriers keep your speed`;
    P.clearRect(0,0,520,260);const q=P.createLinearGradient(0,0,0,260);q.addColorStop(0,t.top);q.addColorStop(1,t.bottom);P.fillStyle=q;P.fillRect(0,0,520,260);
    P.fillStyle='#343d48';P.fillRect(0,92,520,124);P.strokeStyle='#ffffff55';P.lineWidth=3;P.setLineDash([22,15]);P.beginPath();P.moveTo(0,154);P.lineTo(520,154);P.stroke();P.setLineDash([]);
    P.save();P.translate(two()?145:260,151);P.scale(1.55,1.55);Draw.renderCar(P,0,0,-.12,a,'P1');P.restore();
    if(two()){P.save();P.translate(375,154);P.scale(1.55,1.55);Draw.renderCar(P,0,0,.12,b,'P2');P.restore();}save();
  }
  ui.p1car.onchange=()=>{sel1=+ui.p1car.value;paint1=D.cars[sel1].color;ui.p1color.value=paint1;updGarage();};
  ui.p2car.onchange=()=>{sel2=+ui.p2car.value;paint2=D.cars[sel2].color;ui.p2color.value=paint2;updGarage();};
  ui.track.onchange=()=>{selT=+ui.track.value;updGarage();};
  ui.p1color.oninput=()=>{paint1=ui.p1color.value;updGarage();};ui.p2color.oninput=()=>{paint2=ui.p2color.value;updGarage();};ui.mode.onchange=updGarage;
  ui.random.onclick=()=>{sel1=Math.floor(Math.random()*D.cars.length);sel2=Math.floor(Math.random()*D.cars.length);selT=Math.floor(Math.random()*D.tracks.length);ui.p1car.value=sel1;ui.p2car.value=sel2;ui.track.value=selT;paint1=D.palette[Math.floor(Math.random()*D.palette.length)];paint2=D.palette[Math.floor(Math.random()*D.palette.length)];ui.p1color.value=paint1;ui.p2color.value=paint2;updGarage();};
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
  function mk(def,idx,kind,paint,label,side){const p=track.path[idx],pos=Rail.nearest(track.rail,p.x,p.y);return{x:p.x+p.nx*side,y:p.y+p.ny*side,a:Math.atan2(p.ty,p.tx),v:0,i:idx,lap:1,gate:0,prog:pos.s/track.rail.total,last:pos.s/track.rail.total,def:{...def,paint},kind,label,lapStart:0,fin:false,finishTime:Infinity,edge:false};}
  function startRace(){
    release();track=makeTrack(D.tracks[selT]);const a=D.cars[sel1],b=D.cars[sel2],n=track.path.length;
    cars=[mk(a,n-7,'p1',paint1,'P1',-20)];
    if(two())cars.push(mk(b,n-7,'p2',paint2,'P2',20));else cars.push(mk({...D.cars[(sel1+7)%D.cars.length],max:4.2,acc:.06},n-7,'ai','#39a8ff','AI1',20));
    cars.push(mk({...D.cars[(sel1+13)%D.cars.length],max:4.15,acc:.058},n-20,'ai','#ffaf3b','AI2',-20));cars.push(mk({...D.cars[(sel1+19)%D.cars.length],max:4.1,acc:.056},n-20,'ai','#6ce879','AI3',20));
    state={started:true,mode:'count',clock:-3200,paused:false,two:two(),bannerUntil:0,best:bestFor(cars[0]),finish:0};
    for(const s of Object.values(window.R95Car101||{})){s.fuel=100;s.boost=false;s.flying=false;}
    ui.garage.classList.add('hidden');ui.trackName.textContent=track.def.name;ui.carName.textContent=state.two?'P1 + P2':a.name;last=performance.now();show('3');buttonState();hud();
  }
  ui.start.onclick=startRace;
  function control(o){if(o.kind==='p1')return{f:keys.KeyW,b:keys.KeyS,l:keys.KeyA,r:keys.KeyD};if(o.kind==='p2')return{f:keys.ArrowUp,b:keys.ArrowDown,l:keys.ArrowLeft,r:keys.ArrowRight};return null;}
  function updateCar(o,dt){
    if(o.fin)return;const ctl=control(o);o.last=o.prog;
    if(!ctl){const q=Rail.nearest(track.rail,o.x,o.y),t=Rail.pointAt(track.rail,q.s+65),want=Math.atan2(t.y-o.y,t.x-o.x);o.a+=clamp(Rail.angle(o.a,want),-.055,.055)*dt*.85;o.v=Math.min(o.def.max,o.v+o.def.acc*.55*dt);}
    else{if(ctl.f)o.v+=o.def.acc*dt;if(ctl.b)o.v-=.12*dt;o.v=clamp(o.v,-1.4,o.def.max);const st=(ctl.l?-1:0)+(ctl.r?1:0);if(st&&Math.abs(o.v)>.04)o.a+=st*o.def.turn*dt*Math.min(.92,.5+Math.abs(o.v)/4)*(o.v<0?-1:1);
      if(!st&&o.v>.35){const p=track.path[o.i],d=Rail.angle(o.a,Math.atan2(p.ty,p.tx));if(Math.abs(d)<1.35)o.a+=d*.018*dt;}}
    // The same rolling drag everywhere: there is NO grass or barrier speed penalty.
    o.v*=Math.pow(.994,dt);Rail.move(o,track.rail,track.road,dt);
    let delta=o.prog-o.last;if(delta<-.5)delta+=1;if(delta>.5)delta-=1;
    const gates=[.25,.50,.75];if(delta>0&&o.gate<3&&o.last<gates[o.gate]&&o.prog>=gates[o.gate])o.gate++;
    if(delta>0&&o.last>.90&&o.prog<.10&&o.gate===3){
      const lapTime=state.clock-o.lapStart;o.lapStart=state.clock;o.gate=0;
      if(o.kind==='p1'){const old=bestFor(o);if(!old||lapTime<old)write(recordKey(o),lapTime);state.best=bestFor(o);}
      if(o.lap>=3){o.fin=true;o.finishTime=state.clock;o.v=0;}else{o.lap++;if(o.kind!=='ai')show(`${o.label} • LAP ${o.lap}`,700);}
    }
  }
  function ranked(){return [...cars].sort((a,b)=>a.fin&&b.fin?a.finishTime-b.finishTime:a.fin?-1:b.fin?1:(b.lap+b.prog)-(a.lap+a.prog));}
  function finishIfNeeded(){const human=cars.filter(o=>o.kind!=='ai'&&o.fin).sort((a,b)=>a.finishTime-b.finishTime)[0];if(!human)return;state.mode='fin';state.finish=state.clock;release();cars.forEach(o=>o.v=0);show(state.two?`${human.label} WINS THE DUEL!\nR to race again`:`FINISH • ${ranked().indexOf(human)+1}/${cars.length}\nR to race again`);buttonState();}
  function hud(){if(!cars.length)return;const p1=cars[0],p2=cars.find(o=>o.kind==='p2'),order=ranked();ui.lap.textContent=state.two?`P1 ${p1.lap}/3 • P2 ${p2.lap}/3`:`Lap ${p1.lap}/3`;ui.pos.textContent=state.two?`P1 #${order.indexOf(p1)+1} • P2 #${order.indexOf(p2)+1}`:`Position ${order.indexOf(p1)+1}/${cars.length}`;ui.timer.textContent=fmt(state.mode==='fin'?state.finish:state.clock);ui.best.textContent='Saved best '+(state.best==null?'--':fmt(state.best));ui.speed.textContent=Math.round(Math.abs(p1.v)*18);note.textContent=p1.edge?'EDGE SLIDE • Speed kept • Barriers ON':'v13 • Smooth rails • P to pause';}
  function draw(){g.clearRect(0,0,W,H);g.drawImage(track.bg,0,0);for(const o of cars)Draw.renderCar(g,o.x,o.y,o.a,o.def,o.label);}
  function frame(now){
    const elapsed=Math.min(33.333,Math.max(0,now-last));last=now;
    if(!state.paused&&!isGarage()){
      if(state.mode==='count'||state.mode==='run')state.clock+=elapsed;
      if(state.mode==='count'){show(state.clock>0?'GO!':String(Math.min(3,Math.ceil(-state.clock/1000))));if(state.clock>=0){state.mode='run';show('GO!',650);}}
      else if(state.mode==='run'){cars.forEach(o=>updateCar(o,elapsed/16.6667));finishIfNeeded();}
      if(state.mode==='run'&&state.clock>=state.bannerUntil)ui.message.classList.remove('show');
      if(cars.length)hud();draw();
    }
    requestAnimationFrame(frame);
  }
  track=makeTrack(D.tracks[selT]);updGarage();draw();buttonState();
  // Refresh the preview when embedded car images finish decoding.
  setTimeout(()=>{if(isGarage())updGarage();},400);setTimeout(()=>{if(isGarage())updGarage();},1200);
  window.R95Game13={version:'13',snapshot:()=>({mode:state.mode,paused:state.paused,clock:state.clock,carCount:D.cars.length,mapCount:D.tracks.length,track:track.def.name,cars:cars.map(o=>({id:o.def.id,kind:o.kind,x:o.x,y:o.y,speed:o.v,edge:o.edge,lap:o.lap,progress:o.prog,distanceFromTrack:Rail.nearest(track.rail,o.x,o.y).d}))})};
  requestAnimationFrame(frame);
})();
