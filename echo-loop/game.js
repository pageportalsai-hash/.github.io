import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const CONFIG = {
  loopDuration: 90,
  playerSpeed: 6.8,
  sprintSpeed: 10.8,
  crouchSpeed: 3.7,
  jumpVelocity: 7.1,
  gravity: 20,
  maxEchoes: 6,
  enemyCount: 9,
  mouseSensitivity: 1,
  fov: 78,
};

const canvas = document.querySelector('#game');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03060a);
scene.fog = new THREE.FogExp2(0x07111a, 0.028);

const camera = new THREE.PerspectiveCamera(CONFIG.fov, innerWidth/innerHeight, 0.06, 180);
camera.position.set(0,1.7,8);
scene.add(camera);
const controls = new PointerLockControls(camera, document.body);
controls.pointerSpeed = CONFIG.mouseSensitivity;

const hemi = new THREE.HemisphereLight(0x8bc8ff,0x07090d,0.7); scene.add(hemi);
const key = new THREE.DirectionalLight(0xa6d8ff,1.35); key.position.set(5,12,6); key.castShadow=true; key.shadow.mapSize.set(2048,2048); scene.add(key);
const emergency = [];

const hud = document.querySelector('#hud');
const timerEl = document.querySelector('#timer');
const loopEl = document.querySelector('#loopCount');
const echoEl = document.querySelector('#echoCount');
const healthEl = document.querySelector('#health');
const ammoEl = document.querySelector('#ammo');
const reserveEl = document.querySelector('#reserve');
const abilityEl = document.querySelector('#ability');
const messageEl = document.querySelector('#message');
const damageFlash = document.querySelector('#damageFlash');
const objectiveEl = document.querySelector('#objective');

let gameStarted=false, paused=false, dead=false;
let health=100, ammo=18, reserve=90;
let loopIndex=1, loopRemaining=CONFIG.loopDuration;
let velocityY=0, canJump=false, crouched=false;
let currentRecording=[], recordingAccumulator=0;
let echoes=[];
let enemies=[];
let projectiles=[];
let slowZones=[];
let corruptionUnlocked=false;
let firstEchoHint=false;
let lastTime=performance.now();
let objectiveStage=0;
let interactables=[];
let doorOpen=false;
const keys = Object.create(null);

const materials = {
  wall:new THREE.MeshStandardMaterial({color:0x1d2732,roughness:.86,metalness:.14}),
  dark:new THREE.MeshStandardMaterial({color:0x0b1016,roughness:.72,metalness:.34}),
  floor:new THREE.MeshStandardMaterial({color:0x121821,roughness:.68,metalness:.12}),
  glow:new THREE.MeshStandardMaterial({color:0x1c4f66,emissive:0x47d5ff,emissiveIntensity:2.5,roughness:.35,metalness:.25}),
  redGlow:new THREE.MeshStandardMaterial({color:0x45101c,emissive:0xff3157,emissiveIntensity:2.7}),
  enemy:new THREE.MeshStandardMaterial({color:0x2b1117,emissive:0x6a0817,emissiveIntensity:.9,roughness:.7}),
  echo:new THREE.MeshStandardMaterial({color:0x77dfff,emissive:0x1dbde8,emissiveIntensity:1.7,transparent:true,opacity:.42,roughness:.2,metalness:.15}),
  corrupted:new THREE.MeshStandardMaterial({color:0xff5b7c,emissive:0xff1746,emissiveIntensity:1.8,transparent:true,opacity:.62}),
};

function box(x,y,z,sx,sy,sz,mat=materials.wall,cast=true,receive=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=receive;scene.add(m);return m;
}
function cyl(x,y,z,r,h,mat=materials.dark){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,18),mat);m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m;}

function buildFacility(){
  box(0,-.25,0,44,.5,68,materials.floor,false,true);
  box(-22,3,0,.5,6,68); box(22,3,0,.5,6,68); box(0,3,-34,44,6,.5); box(0,3,34,44,6,.5);
  for(const z of [-24,-12,0,12,24]){
    box(-10,3,z,16,.35,.35,materials.dark); box(10,3,z,16,.35,.35,materials.dark);
  }
  box(-7,3,-17,.35,6,14); box(7,3,-17,.35,6,14);
  box(-7,3,17,.35,6,14); box(7,3,17,.35,6,14);
  for(const x of [-15,-5,5,15]) for(const z of [-28,-7,7,28]) cyl(x,1.4,z,.65,2.8);
  for(const z of [-26,-18,-10,-2,6,14,22,30]){
    const l=new THREE.PointLight(0xff355b,2.4,10,2);l.position.set((z%16===0?8:-8),4.5,z);l.castShadow=false;scene.add(l); emergency.push(l);
    box(l.position.x,4.45,z,.4,.18,.8,materials.redGlow,false,false);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.2,.35,12,64),materials.glow); ring.rotation.x=Math.PI/2; ring.position.set(0,3.1,-27); ring.castShadow=true; scene.add(ring);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4,2), new THREE.MeshStandardMaterial({color:0x2a7ea0,emissive:0x36cfff,emissiveIntensity:3,transparent:true,opacity:.85,roughness:.16})); core.position.set(0,2.5,-27);scene.add(core);
  core.userData.spin=true;
  const door=box(0,1.5,-8,5,3,.45,materials.dark);door.name='BlastDoor';
  const consoleM=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.1,.55),materials.glow);consoleM.position.set(4.8,.55,-4.6);consoleM.rotation.y=-.2;scene.add(consoleM);consoleM.userData.interact='door';interactables.push(consoleM);
  for(let i=0;i<28;i++){
    const x=(Math.random()-.5)*34, z=(Math.random()-.5)*56;
    if(Math.abs(x)<2 && Math.abs(z+8)<5) continue;
    const h=.35+Math.random()*1.1;box(x,h/2,z,.35+Math.random()*1.4,h,.35+Math.random()*1.4,Math.random()>.25?materials.dark:materials.wall);
  }
}

buildFacility();

function makeEnemy(x,z,type='null'){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1.05,6,10),materials.enemy);body.castShadow=true;body.position.y=1.15;g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),materials.enemy);head.position.y=2.05;head.castShadow=true;g.add(head);
  const eye=new THREE.PointLight(0xff3157,1.5,3);eye.position.set(0,2.05,.25);g.add(eye);
  g.position.set(x,0,z);g.userData={health:type==='hunter'?180:90,type,speed:type==='hunter'?3.1:2.15,cooldown:Math.random(),alive:true,lastSeen:new THREE.Vector3(),search:0};scene.add(g);enemies.push(g);return g;
}
[
[-14,-27],[-10,-18],[11,-21],[14,-6],[-13,4],[12,10],[-8,22],[8,26],[15,30]
].forEach((p,i)=>makeEnemy(p[0],p[1],i===8?'hunter':'null'));

const gun=new THREE.Group();
const gunBody=new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.75),new THREE.MeshStandardMaterial({color:0x191d22,metalness:.75,roughness:.32}));gunBody.position.set(.28,-.24,-.55);gun.add(gunBody);
const gunTop=new THREE.Mesh(new THREE.BoxGeometry(.14,.12,.34),materials.glow);gunTop.position.set(.28,-.08,-.48);gun.add(gunTop);
const muzzle=new THREE.Object3D();muzzle.position.set(.28,-.22,-.96);gun.add(muzzle);camera.add(gun);

const raycaster=new THREE.Raycaster();
function shoot(fromEcho=false, echoObj=null){
  if(!gameStarted||paused||dead) return;
  if(!fromEcho){ if(ammo<=0){msg('EMPTY — PRESS R'); return;} ammo--; ammoEl.textContent=ammo; recordEvent('shoot'); }
  const origin=new THREE.Vector3(), dir=new THREE.Vector3();
  if(fromEcho && echoObj){ origin.copy(echoObj.position).add(new THREE.Vector3(0,1.55,0)); dir.set(0,0,-1).applyEuler(echoObj.rotation); }
  else { camera.getWorldPosition(origin); camera.getWorldDirection(dir); gun.position.z=-.03; }
  raycaster.set(origin,dir); raycaster.far=55;
  const targets=enemies.filter(e=>e.userData.alive).flatMap(e=>e.children.filter(c=>c.isMesh));
  const hit=raycaster.intersectObjects(targets,false)[0];
  if(hit){ const enemy=hit.object.parent; damageEnemy(enemy, fromEcho?22:34); }
  const flash=new THREE.PointLight(0x9deaff,5,5,2);flash.position.copy(origin).add(dir.clone().multiplyScalar(.4));scene.add(flash);setTimeout(()=>scene.remove(flash),45);
}
function damageEnemy(enemy,dmg){if(!enemy?.userData?.alive)return;enemy.userData.health-=dmg;enemy.children[0].material.emissiveIntensity=2.5;setTimeout(()=>{if(enemy.children[0])enemy.children[0].material.emissiveIntensity=.9},70);if(enemy.userData.health<=0){enemy.userData.alive=false;scene.remove(enemy);msg('TEMPORAL HOSTILE NEUTRALISED');}}

function reload(){if(ammo>=18||reserve<=0)return;const need=18-ammo,t=Math.min(need,reserve);reserve-=t;ammo+=t;ammoEl.textContent=ammo;reserveEl.textContent=reserve;msg('RELOADED');recordEvent('reload');}

function msg(text,ms=1800){messageEl.textContent=text;clearTimeout(msg.t);msg.t=setTimeout(()=>messageEl.textContent='',ms)}
function damagePlayer(amount){if(dead)return;health=Math.max(0,health-amount);healthEl.textContent=Math.ceil(health);damageFlash.style.opacity='1';setTimeout(()=>damageFlash.style.opacity='0',100);if(health<=0){dead=true;controls.unlock();showScreen('gameover');hud.classList.add('hidden');}}

function createEcho(recording, corrupted=false){
  if(!recording.length)return;
  const group=new THREE.Group();
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.95,5,9),corrupted?materials.corrupted:materials.echo);torso.position.y=1.05;group.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.3,12,10),corrupted?materials.corrupted:materials.echo);head.position.y=1.92;group.add(head);
  group.userData={recording,time:0,index:0,corrupted,health:corrupted?120:999,shootCooldown:0};
  scene.add(group);echoes.push(group);while(echoes.length>CONFIG.maxEchoes){scene.remove(echoes.shift())} echoEl.textContent=echoes.length;
  if(corrupted) msg('WARNING: CORRUPTED ECHO DETECTED',3000); else msg('ECHO CREATED — YOUR PAST IS NOW PHYSICAL',3000);
}
function updateEchoes(dt){
  for(const e of echoes){
    const d=e.userData;d.time+=dt;d.shootCooldown-=dt;
    const rec=d.recording;
    if(!rec.length)continue;
    const t=d.time%CONFIG.loopDuration;
    while(d.index<rec.length-1 && rec[d.index+1].t<t)d.index++;
    if(t<rec[d.index].t)d.index=0;
    const a=rec[d.index], b=rec[Math.min(d.index+1,rec.length-1)];
    const span=Math.max(.001,b.t-a.t), alpha=Math.max(0,Math.min(1,(t-a.t)/span));
    e.position.lerpVectors(a.p,b.p,alpha);e.rotation.y=THREE.MathUtils.lerp(a.yaw,b.yaw,alpha);
    if(a.events && !a.fired){ for(const ev of a.events){if(ev==='shoot')shoot(true,e)} a.fired=true; }
    if(d.corrupted){
      const dist=e.position.distanceTo(camera.position); if(dist<14){
        e.lookAt(camera.position.x,e.position.y,camera.position.z);
        if(dist>3)e.position.add(new THREE.Vector3().subVectors(camera.position,e.position).setY(0).normalize().multiplyScalar(dt*2.6));
        if(d.shootCooldown<=0 && hasLineOfSight(e.position,camera.position)){d.shootCooldown=1.0+Math.random()*.8; if(Math.random()<.66)damagePlayer(8+Math.random()*6);}
      }
    }
  }
}
function hasLineOfSight(a,b){const dir=new THREE.Vector3().subVectors(b,a),dist=dir.length();dir.normalize();raycaster.set(a.clone().add(new THREE.Vector3(0,1.3,0)),dir);raycaster.far=dist;const blockers=scene.children.filter(o=>o.isMesh && !enemies.includes(o.parent) && !echoes.includes(o.parent));return raycaster.intersectObjects(blockers,false).length===0;}

function recordEvent(ev){const last=currentRecording[currentRecording.length-1];if(last){last.events=last.events||[];last.events.push(ev)}}
function sampleRecording(){currentRecording.push({t:CONFIG.loopDuration-loopRemaining,p:camera.position.clone().setY(0),yaw:camera.rotation.y,events:[]});}
function endLoop(){
  const frozen=currentRecording.map(s=>({t:s.t,p:s.p.clone(),yaw:s.yaw,events:[...(s.events||[])]}));
  createEcho(frozen, corruptionUnlocked && loopIndex%3===0);
  loopIndex++;loopEl.textContent=loopIndex;loopRemaining=CONFIG.loopDuration;currentRecording=[];recordingAccumulator=0;
  if(loopIndex>=3) corruptionUnlocked=true;
  firstEchoHint=true;
}

function throwTemporalGrenade(){if(abilityEl.textContent!=='READY')return;abilityEl.textContent='CHARGING';recordEvent('grenade');const dir=new THREE.Vector3();camera.getWorldDirection(dir);const zone=new THREE.Mesh(new THREE.SphereGeometry(3.5,24,16),new THREE.MeshStandardMaterial({color:0x5de7ff,emissive:0x1fb9da,emissiveIntensity:1,transparent:true,opacity:.13,wireframe:true}));zone.position.copy(camera.position).add(dir.multiplyScalar(8));zone.position.y=1.8;scene.add(zone);slowZones.push({mesh:zone,time:5});setTimeout(()=>abilityEl.textContent='READY',8000);}

function updateEnemies(dt){
  for(const e of enemies){if(!e.userData.alive)continue;const d=e.userData;d.cooldown-=dt;
    const toPlayer=new THREE.Vector3().subVectors(camera.position,e.position);const dist=toPlayer.length();
    let target=null;
    if(dist<22 && hasLineOfSight(e.position,camera.position)){target=camera.position;d.lastSeen.copy(camera.position);d.search=4;}
    else if(d.search>0){target=d.lastSeen;d.search-=dt;}
    if(target){const dir=new THREE.Vector3().subVectors(target,e.position).setY(0);const len=dir.length();if(len>2.2){dir.normalize();let slow=1;for(const z of slowZones)if(z.mesh.position.distanceTo(e.position)<3.5)slow=.25;e.position.add(dir.multiplyScalar(d.speed*slow*dt));e.lookAt(target.x,e.position.y,target.z);}else if(d.cooldown<=0){d.cooldown=.7+Math.random()*.8;if(Math.random()<.72)damagePlayer(d.type==='hunter'?14:9);}}
  }
}

function updateSlowZones(dt){for(let i=slowZones.length-1;i>=0;i--){const z=slowZones[i];z.time-=dt;z.mesh.rotation.y+=dt;z.mesh.scale.setScalar(1+Math.sin(performance.now()/200)*.05);if(z.time<=0){scene.remove(z.mesh);slowZones.splice(i,1)}}}

function tryInteract(){
  const origin=camera.position.clone(),dir=new THREE.Vector3();camera.getWorldDirection(dir);raycaster.set(origin,dir);raycaster.far=3;
  const hit=raycaster.intersectObjects(interactables,false)[0];
  if(hit && hit.object.userData.interact==='door' && !doorOpen){const door=scene.getObjectByName('BlastDoor');door.position.y=4.7;doorOpen=true;objectiveStage=1;objectiveEl.textContent='OBJECTIVE: Enter the reactor chamber';msg('BLAST DOOR RELEASED');recordEvent('interact');}
}

function updateObjective(){if(objectiveStage===1 && camera.position.z<-15){objectiveStage=2;objectiveEl.textContent='OBJECTIVE: Reach the temporal core';msg('REACTOR SIGNAL LOCATED',2500)}if(objectiveStage===2 && camera.position.z<-25 && Math.abs(camera.position.x)<6){objectiveStage=3;objectiveEl.textContent='OBJECTIVE: Survive the fracture';msg('THE FRACTURE IS WATCHING YOU',3200);corruptionUnlocked=true;for(let i=0;i<2;i++)makeEnemy((i?8:-8),-30,'hunter');}}

function collideMove(next){
  next.x=THREE.MathUtils.clamp(next.x,-20.6,20.6);next.z=THREE.MathUtils.clamp(next.z,-32.6,32.6);
  if(!doorOpen && next.z<-7.1 && next.z>-9 && Math.abs(next.x)<3.2) next.z=-7.1;
  return next;
}

function updatePlayer(dt){
  if(!controls.isLocked)return;
  const f=(keys['KeyW']?1:0)-(keys['KeyS']?1:0), s=(keys['KeyD']?1:0)-(keys['KeyA']?1:0);
  crouched=!!keys['KeyC'];const speed=crouched?CONFIG.crouchSpeed:(keys['ShiftLeft']||keys['ShiftRight']?CONFIG.sprintSpeed:CONFIG.playerSpeed);
  const move=new THREE.Vector3(); if(f||s){camera.getWorldDirection(move);move.y=0;move.normalize();const right=new THREE.Vector3().crossVectors(move,camera.up).normalize();move.multiplyScalar(f).add(right.multiplyScalar(s)).normalize().multiplyScalar(speed*dt);const next=camera.position.clone().add(move);collideMove(next);camera.position.x=next.x;camera.position.z=next.z;}
  velocityY-=CONFIG.gravity*dt;camera.position.y+=velocityY*dt;const targetY=crouched?1.25:1.7;if(camera.position.y<=targetY){camera.position.y=THREE.MathUtils.lerp(camera.position.y,targetY,.4);velocityY=0;canJump=true;}
  gun.position.x=.03+Math.sin(performance.now()/150)*.008*(f||s);gun.position.y=-.03+Math.abs(Math.sin(performance.now()/120))*.007*(f||s);gun.position.z=THREE.MathUtils.lerp(gun.position.z,0,.18);
}

function updateLoop(dt){loopRemaining-=dt;recordingAccumulator+=dt;if(recordingAccumulator>=.1){recordingAccumulator=0;sampleRecording()}if(loopRemaining<=0)endLoop();const m=Math.floor(loopRemaining/60),s=Math.max(0,Math.ceil(loopRemaining%60));timerEl.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;if(loopRemaining<6)timerEl.style.color='#ff738b';else timerEl.style.color='';}

function animate(now){requestAnimationFrame(animate);const dt=Math.min(.033,(now-lastTime)/1000);lastTime=now;
  scene.traverse(o=>{if(o.userData.spin)o.rotation.y+=dt*.55});
  for(let i=0;i<emergency.length;i++) emergency[i].intensity=1.8+Math.sin(now/230+i)*.7;
  if(gameStarted && !paused && !dead){updatePlayer(dt);updateLoop(dt);updateEchoes(dt);updateEnemies(dt);updateSlowZones(dt);updateObjective();}
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);

function resetGame(){
  health=100;ammo=18;reserve=90;loopIndex=1;loopRemaining=CONFIG.loopDuration;currentRecording=[];recordingAccumulator=0;dead=false;paused=false;corruptionUnlocked=false;objectiveStage=0;doorOpen=false;
  camera.position.set(0,1.7,8);camera.rotation.set(0,0,0);healthEl.textContent=health;ammoEl.textContent=ammo;reserveEl.textContent=reserve;loopEl.textContent=loopIndex;objectiveEl.textContent='OBJECTIVE: Reach the reactor control room';
  for(const e of echoes)scene.remove(e);echoes=[];echoEl.textContent='0';for(const e of enemies)scene.remove(e);enemies=[];[
  [-14,-27],[-10,-18],[11,-21],[14,-6],[-13,4],[12,10],[-8,22],[8,26],[15,30]
  ].forEach((p,i)=>makeEnemy(p[0],p[1],i===8?'hunter':'null'));
  const door=scene.getObjectByName('BlastDoor');if(door)door.position.set(0,1.5,-8);
}

function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));if(id)document.querySelector('#'+id)?.classList.add('active')}
function startGame(){resetGame();gameStarted=true;hud.classList.remove('hidden');showScreen(null);controls.lock();msg('WAKE UP. THE LOOP HAS ALREADY STARTED.',2600)}

document.querySelector('#playBtn').addEventListener('click',startGame);
document.querySelector('#resumeBtn').addEventListener('click',()=>{showScreen(null);paused=false;controls.lock()});
document.querySelector('#restartLoopBtn').addEventListener('click',()=>{currentRecording=[];loopRemaining=CONFIG.loopDuration;showScreen(null);paused=false;controls.lock();msg('CURRENT LOOP RESET')});
document.querySelector('#mainMenuBtn').addEventListener('click',()=>{gameStarted=false;paused=false;hud.classList.add('hidden');showScreen('menu')});
document.querySelector('#retryBtn').addEventListener('click',startGame);document.querySelector('#deadMenuBtn').addEventListener('click',()=>{gameStarted=false;hud.classList.add('hidden');showScreen('menu')});
document.querySelector('#howBtn').addEventListener('click',()=>showScreen('how'));document.querySelector('#settingsBtn').addEventListener('click',()=>showScreen('settings'));document.querySelector('#pauseSettingsBtn').addEventListener('click',()=>showScreen('settings'));document.querySelectorAll('.backBtn').forEach(b=>b.addEventListener('click',()=>showScreen(gameStarted?'pause':'menu')));
document.querySelector('#sens').addEventListener('input',e=>{CONFIG.mouseSensitivity=+e.target.value;controls.pointerSpeed=CONFIG.mouseSensitivity});document.querySelector('#fov').addEventListener('input',e=>{camera.fov=+e.target.value;camera.updateProjectionMatrix()});document.querySelector('#quality').addEventListener('change',e=>{const q=e.target.value;renderer.setPixelRatio(Math.min(devicePixelRatio,q==='high'?1.75:q==='medium'?1.25:1));renderer.shadowMap.enabled=q!=='low';});

controls.addEventListener('unlock',()=>{if(gameStarted&&!dead){paused=true;showScreen('pause')}});controls.addEventListener('lock',()=>{paused=false;showScreen(null)});
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Space'&&canJump&&controls.isLocked){velocityY=CONFIG.jumpVelocity;canJump=false;recordEvent('jump')}if(e.code==='KeyR')reload();if(e.code==='KeyE')tryInteract();if(e.code==='KeyF')throwTemporalGrenade();});
addEventListener('keyup',e=>keys[e.code]=false);addEventListener('mousedown',e=>{if(e.button===0&&controls.isLocked)shoot(false);});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

console.log('ECHO//LOOP loaded. Core config:',CONFIG);
