/* Race 95 v14: local cosmetic rewards, synthesised vehicle audio and stunt arena. */
(() => {
  'use strict';
  const read=(k,f)=>{try{return localStorage.getItem(k)??f;}catch{return f;}};
  const write=(k,v)=>{try{localStorage.setItem(k,v);return true;}catch{return false;}};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const stock=()=>({wheels:'stock',stripe:'none',glow:'none',flame:'classic'});
  const catalogue=[
    {id:'wheel-gold',cat:'wheels',value:'gold',name:'Gold alloy wheels',cost:60,colour:'#ffd76a'},
    {id:'wheel-cyan',cat:'wheels',value:'cyan',name:'Ice-blue race wheels',cost:60,colour:'#59e8ff'},
    {id:'stripe-double',cat:'stripe',value:'double',name:'Twin racing stripes',cost:40,colour:'#f4f7ff'},
    {id:'stripe-chevron',cat:'stripe',value:'chevron',name:'Chevron racing stripes',cost:50,colour:'#ffcd54'},
    {id:'glow-blue',cat:'glow',value:'blue',name:'Blue underglow',cost:80,colour:'#30cfff'},
    {id:'glow-purple',cat:'glow',value:'purple',name:'Purple underglow',cost:80,colour:'#bf68ff'},
    {id:'glow-lime',cat:'glow',value:'lime',name:'Lime underglow',cost:80,colour:'#a9ff52'},
    {id:'flame-blue',cat:'flame',value:'blue',name:'Ice rocket flames',cost:60,colour:'#77eeff'},
    {id:'flame-purple',cat:'flame',value:'purple',name:'Violet rocket flames',cost:60,colour:'#d28aff'},
    {id:'flame-rainbow',cat:'flame',value:'rainbow',name:'Rainbow rocket flames',cost:120,colour:'#ff84c6'}
  ];
  let saved={};try{saved=JSON.parse(read('r95.v14.rewards','{}'))||{};}catch{}
  const profile={coins:Math.max(0,Math.floor(Number(saved.coins)||0)),unlocked:Array.isArray(saved.unlocked)?saved.unlocked.filter(id=>catalogue.some(x=>x.id===id)):[],equipment:{P1:stock(),P2:stock()},awards:Array.isArray(saved.awards)?saved.awards.slice(-120):[]};
  for(const who of ['P1','P2'])for(const item of catalogue)if(profile.unlocked.includes(item.id)&&saved.equipment?.[who]?.[item.cat]===item.value)profile.equipment[who][item.cat]=item.value;
  let persisted=true;
  function persist(){persisted=write('r95.v14.rewards',JSON.stringify(profile));window.dispatchEvent(new Event('r95-rewards'));}
  function award(token,amount){if(profile.awards.includes(token))return 0;const n=Math.max(0,Math.floor(amount));profile.coins+=n;profile.awards.push(token);profile.awards=profile.awards.slice(-120);persist();return n;}
  function equip(id,who){const item=catalogue.find(x=>x.id===id);if(!item||!['P1','P2'].includes(who))return false;if(!profile.unlocked.includes(id)){if(profile.coins<item.cost)return false;profile.coins-=item.cost;profile.unlocked.push(id);}profile.equipment[who][item.cat]=item.value;persist();return true;}
  function reset(who){if(profile.equipment[who]){profile.equipment[who]=stock();persist();}}
  // Web Audio starts only from a player gesture; no external media or permissions.
  const sound={ctx:null,master:null,voices:[],muted:read('r95.v14.mute','0')==='1',volume:clamp(Number(read('r95.v14.volume','.35'))||0,0,1),available:true,active:false};
  function tone(f=660,d=.15,delay=0){if(!sound.ctx||sound.muted)return;const c=sound.ctx,o=c.createOscillator(),a=c.createGain(),t=c.currentTime+delay;o.type='sine';o.frequency.value=f;a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.1,t+.012);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(sound.master);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();a.disconnect();};}
  function audioStart(){
    try{
      if(!sound.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)throw Error('Audio unsupported');const c=sound.ctx=new A();sound.master=c.createGain();sound.master.gain.value=sound.muted?0:sound.volume*.5;sound.master.connect(c.destination);
        const noise=c.createBuffer(1,c.sampleRate,c.sampleRate),data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.6;
        for(let i=0;i<2;i++){
          const v={osc:c.createOscillator(),sub:c.createOscillator(),gain:c.createGain(),filter:c.createBiquadFilter(),squeal:c.createOscillator(),sg:c.createGain(),jet:c.createBufferSource(),jg:c.createGain(),jf:c.createBiquadFilter()};
          v.osc.type='sawtooth';v.sub.type='triangle';v.filter.type='lowpass';v.filter.frequency.value=650;v.gain.gain.value=0;v.osc.connect(v.filter);v.sub.connect(v.filter);v.filter.connect(v.gain);v.gain.connect(sound.master);
          v.squeal.type='sine';v.squeal.frequency.value=1200;v.sg.gain.value=0;v.squeal.connect(v.sg);v.sg.connect(sound.master);
          v.jet.buffer=noise;v.jet.loop=true;v.jf.type='lowpass';v.jf.frequency.value=650;v.jg.gain.value=0;v.jet.connect(v.jf);v.jf.connect(v.jg);v.jg.connect(sound.master);
          v.osc.start();v.sub.start();v.squeal.start();v.jet.start();sound.voices.push(v);
        }
      }
      if(sound.ctx.state==='suspended')sound.ctx.resume().catch(()=>{});sound.available=true;
    }catch{sound.available=false;}
  }
  function setMute(v){sound.muted=!!v;write('r95.v14.mute',v?'1':'0');if(sound.ctx)sound.master.gain.setTargetAtTime(v?0:sound.volume*.5,sound.ctx.currentTime,.03);}
  function setVolume(v){sound.volume=clamp(Number(v),0,1);write('r95.v14.volume',String(sound.volume));if(sound.ctx&&!sound.muted)sound.master.gain.setTargetAtTime(sound.volume*.5,sound.ctx.currentTime,.03);}
  function updateSound(cars,active){
    sound.active=!!active;if(!sound.ctx)return;const t=sound.ctx.currentTime,humans=cars.filter(o=>o.kind!=='ai');
    for(let i=0;i<sound.voices.length;i++){const v=sound.voices[i],o=humans[i];let level=0,skid=0,jet=0;
      if(active&&o&&!o.fin){const type=o.def.type||'',electric=o.def.id===100,truck=['SUV','Pickup','Van','Wagon'].includes(type),muscle=['Muscle','Classic'].includes(type),formula=type==='Formula',speed=Math.abs(o.v),load=clamp(speed/Math.max(1,o.def.max),0,1.6),rpm=(load*3)%1;
        const base=electric?180:formula?130:truck?42:muscle?50:85,f=base+(electric?210:80)*load+rpm*(formula?90:25);
        v.osc.type=electric?'sine':truck?'square':'sawtooth';v.osc.frequency.setTargetAtTime(f,t,.09);v.sub.frequency.setTargetAtTime(f*.5,t,.09);v.filter.frequency.setTargetAtTime(electric?1800:truck?350:formula?1600:700+load*400,t,.09);
        level=(electric?.024:.036)+Math.min(1,load)*.04;skid=(!o.def.flying&&!o.jump&&speed>1.8&&Math.abs(o.steer||0)>.1)?.022:0;jet=o.def.boosting?.28:o.jump?.035:0;
        v.squeal.frequency.setTargetAtTime(980+speed*95,t,.04);v.jf.frequency.setTargetAtTime(o.def.boosting?1000:360,t,.06);
      }
      v.gain.gain.setTargetAtTime(level,t,.04);v.sg.gain.setTargetAtTime(skid,t,.04);v.jg.gain.setTargetAtTime(jet,t,.04);
    }
  }
  function cheer(){[523,659,784,1047].forEach((f,i)=>tone(f,.23,i*.11));}
  // A separate practice arena: no lap requirement, no race scoring.
  function arena(W,H){
    const ramps=[{id:0,x:240,y:265,a:0},{id:1,x:745,y:525,a:Math.PI},{id:2,x:960,y:230,a:Math.PI/2}];
    const targets=ramps.map(r=>({id:r.id,x:r.x+240*Math.cos(r.a),y:r.y+240*Math.sin(r.a)}));
    const tunnels=[{id:0,x:580,y:160,w:190,h:85},{id:1,x:220,y:530,w:160,h:85}];
    const bg=document.createElement('canvas');bg.width=W;bg.height=H;const c=bg.getContext('2d');
    const grad=c.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#192f49');grad.addColorStop(1,'#111827');c.fillStyle=grad;c.fillRect(0,0,W,H);
    c.strokeStyle='#33516b';c.lineWidth=1;for(let i=60;i<W;i+=40){c.beginPath();c.moveTo(i,88);c.lineTo(i,H-70);c.stroke();}for(let i=90;i<H-50;i+=40){c.beginPath();c.moveTo(55,i);c.lineTo(W-55,i);c.stroke();}
    c.strokeStyle='#73e6e4';c.lineWidth=8;c.strokeRect(55,90,W-110,H-160);c.lineWidth=2;c.strokeStyle='#a9f6ff55';c.strokeRect(66,101,W-132,H-182);
    c.fillStyle='#d8f1ff';c.font='900 24px Arial';c.textAlign='center';c.fillText('STUNT LAB  /  FREE DRIVE',W/2,235);
    c.font='13px Arial';c.fillStyle='#8bb0cf';c.fillText('Line up with the arrows. Land inside a target. Explore the tunnels.',W/2,258);
    for(const t of targets){for(const [radius,col]of [[55,'#0b819777'],[38,'#36d9e555'],[18,'#ffd65fbb']]){c.fillStyle=col;c.beginPath();c.arc(t.x,t.y,radius,0,Math.PI*2);c.fill();}c.strokeStyle='#bcfbff';c.lineWidth=2;c.beginPath();c.arc(t.x,t.y,55,0,Math.PI*2);c.stroke();c.font='bold 12px Arial';c.fillStyle='#f1fbff';c.fillText('LAND '+(t.id+1),t.x,t.y+74);}
    for(const t of tunnels){c.fillStyle='#030914';c.fillRect(t.x-t.w/2,t.y-t.h/2,t.w,t.h);c.strokeStyle='#ffbc66';c.lineWidth=3;c.strokeRect(t.x-t.w/2,t.y-t.h/2,t.w,t.h);c.font='bold 11px Arial';c.fillStyle='#ffd89b';c.fillText('TUNNEL '+(t.id+1),t.x,t.y+t.h/2+20);}
    for(const r of ramps){c.save();c.translate(r.x,r.y);c.rotate(r.a);const q=c.createLinearGradient(-38,0,38,0);q.addColorStop(0,'#663e33');q.addColorStop(1,'#ffa757');c.fillStyle=q;c.fillRect(-38,-42,76,84);c.strokeStyle='#ffddb0';c.lineWidth=4;c.strokeRect(-38,-42,76,84);for(let x=-24;x<30;x+=14){c.strokeStyle='#ffd07a';c.beginPath();c.moveTo(x-5,-20);c.lineTo(x+8,0);c.lineTo(x-5,20);c.stroke();}c.restore();}
    return{bg,ramps,targets,tunnels,def:{id:'stunt',name:'Stunt Lab',theme:'stunt'},road:0};
  }
  function updateStunt(o,dt,world,clock,onEvent){
    const seconds=dt/60;o.jumpCool=Math.max(0,(o.jumpCool||0)-seconds);const oldX=o.x,oldY=o.y;if(o.jump)o.v=o.jump.speed;
    o.x+=Math.cos(o.a)*o.v*2.2*dt;o.y+=Math.sin(o.a)*o.v*2.2*dt;
    const loX=90,hiX=1110,loY=125,hiY=615;
    if(o.x<loX||o.x>hiX){o.x=clamp(o.x,loX,hiX);o.a=Math.sin(o.a)>=0?Math.PI/2:-Math.PI/2;}
    if(o.y<loY||o.y>hiY){o.y=clamp(o.y,loY,hiY);o.a=Math.cos(o.a)>=0?0:Math.PI;}
    if(o.jump){o.jump.time+=seconds;o.def.jumpHeight=Math.sin(Math.PI*Math.min(1,o.jump.time/o.jump.duration))*70;
      if(o.jump.time>=o.jump.duration){const r=o.jump.ramp;o.jump=null;o.def.jumpHeight=0;o.jumpCool=.8;onEvent(o,'jump',r,10);const target=world.targets[r],d=Math.hypot(o.x-target.x,o.y-target.y);if(d<55)onEvent(o,'target',r,d<20?40:25);}
    }else if(!o.def.flying&&o.jumpCool===0&&o.v>.8){for(const r of world.ramps){const dx=o.x-r.x,dy=o.y-r.y,lx=dx*Math.cos(r.a)+dy*Math.sin(r.a),ly=-dx*Math.sin(r.a)+dy*Math.cos(r.a);if(Math.abs(lx)<35&&Math.abs(ly)<38&&Math.cos(o.a-r.a)>.8){o.v=Math.max(1.8,o.v);o.x=r.x-Math.sin(r.a)*ly;o.y=r.y+Math.cos(r.a)*ly;o.jump={time:0,duration:clamp(240/(o.v*132),.3,1.6),ramp:r.id,speed:o.v};o.jumpCool=2;o.a=r.a;onEvent(o,'takeoff',r.id,0);break;}}}
    o.tunnelGate??={};
    if(!o.jump&&!o.def.flying)for(const t of world.tunnels){const inY=Math.abs(o.y-t.y)<t.h/2-12,left=t.x-t.w/2,right=t.x+t.w/2;
      if(inY&&oldX<left&&o.x>=left)o.tunnelGate[t.id]=1;
      if(inY&&oldX>right&&o.x<=right)o.tunnelGate[t.id]=-1;
      if(inY&&((o.tunnelGate[t.id]===1&&oldX<right&&o.x>=right)||(o.tunnelGate[t.id]===-1&&oldX>left&&o.x<=left))){onEvent(o,'tunnel',t.id,15);o.tunnelGate[t.id]=0;}
      if(!inY)o.tunnelGate[t.id]=0;
    }
  }
  function tunnelRoofs(g,world,cars){for(const t of world.tunnels){g.save();g.fillStyle='#324f6bdd';g.fillRect(t.x-t.w/2+13,t.y-t.h/2+8,t.w-26,t.h-16);g.strokeStyle='#72c9ec';g.lineWidth=3;for(let k=-t.w/2+25;k<t.w/2;k+=22){g.beginPath();g.moveTo(t.x+k,t.y-t.h/2+8);g.lineTo(t.x+k,t.y+t.h/2-8);g.stroke();}g.fillStyle='#c6edff';g.font='bold 10px Arial';g.textAlign='center';g.fillText('UNDERPASS',t.x,t.y+4);g.restore();}}
  // Keep the image sprites and existing body kits; cosmetics never touch physics.
  const base=window.R95Draw.renderCar;
  const glowColours={blue:'#32d9ff',purple:'#c571ff',lime:'#aeff56'};
  function renderCar(g,X,Y,A,car,label=''){
    const gear=car.cosmetic||stock(),lift=(car.flying?12:0)+(car.jumpHeight||0)*.32,scale=1+(car.jumpHeight||0)*.0015;
    if(gear.glow!=='none'||lift){g.save();g.translate(X,Y+8);g.rotate(A);g.fillStyle=gear.glow!=='none'?glowColours[gear.glow]:'#00000055';g.shadowColor=g.fillStyle;g.shadowBlur=gear.glow!=='none'?20:8;g.globalAlpha=.55;g.beginPath();g.ellipse(0,0,50,25,0,0,Math.PI*2);g.fill();g.restore();}
    g.save();g.translate(X,Y-lift);g.scale(scale,scale);base(g,0,0,A,car,label);g.rotate(A);
    if(gear.wheels!=='stock'){g.strokeStyle=gear.wheels==='gold'?'#ffe08a':'#77ecff';g.lineWidth=3;for(const x of [-26,23])for(const y of [-23,23]){g.beginPath();g.moveTo(x-6,y);g.lineTo(x+6,y);g.stroke();}}
    if(gear.stripe!=='none'){g.strokeStyle=gear.stripe==='double'?'#f4f7ff':'#ffce5f';g.lineWidth=2.6;for(const y of [-6,6]){g.beginPath();g.moveTo(18,y);g.lineTo(35,gear.stripe==='double'?y:0);g.moveTo(-38,y);g.lineTo(-27,y);g.stroke();}}
    if(car.id===100&&car.flying){g.fillStyle='#366684';g.strokeStyle='#8ce9ff';g.lineWidth=2;for(const side of [-1,1]){g.beginPath();g.moveTo(-4,side*15);g.lineTo(-34,side*43);g.lineTo(-39,side*18);g.closePath();g.fill();g.stroke();}}
    if(car.boosting){let col=gear.flame==='rainbow'?`hsl(${(performance.now()/6)%360} 95% 65%)`:gear.flame==='purple'?'#d385ff':gear.flame==='blue'?'#6aeaff':'#ff9b38';const len=64+12*Math.sin(performance.now()*.04);g.shadowColor=col;g.shadowBlur=14;for(const y of [-13,13]){const q=g.createLinearGradient(-38,0,-38-len,0);q.addColorStop(0,'#fff');q.addColorStop(.25,col);q.addColorStop(1,'#ffffff00');g.fillStyle=q;g.beginPath();g.moveTo(-38,y-6);g.lineTo(-38-len,y);g.lineTo(-38,y+6);g.closePath();g.fill();}}
    g.restore();
  }
  window.R95Draw={renderCar};
  window.R95Extras14={catalogue,profile,award,equip,reset,stock,get persisted(){return persisted;},sound,audioStart,setMute,setVolume,updateSound,tone,cheer,arena,updateStunt,tunnelRoofs};
})();
