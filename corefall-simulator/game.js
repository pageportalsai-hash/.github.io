import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const $ = (id) => document.getElementById(id);
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

const SAVE_KEY = "corefall-salvage-v1";
const DEFAULT = () => ({
  coins: 0, level: 1, xp: 0, inventory: 0, inventoryValue: 0, prestige: 0,
  upgrades: { power: 0, capacity: 0, speed: 0, shield: 0 },
  zones: { ember: false, glacier: false }
});
let state = loadSave();

const gameRoot = $("game");
const startScreen = $("startScreen");
const pauseScreen = $("pauseScreen");
const shopScreen = $("shopScreen");
const deathScreen = $("deathScreen");
const hud = $("hud");
const interaction = $("interaction");
const toastEl = $("toast");
const damageFlash = $("damageFlash");
const hitmarker = $("hitmarker");
const minimap = $("minimap");
const mini = minimap.getContext("2d");

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b1b23, 0.0045);

const camera = new THREE.PerspectiveCamera(73, innerWidth / innerHeight, 0.08, 1200);
camera.position.set(0, 1.7, 0);
const pitch = new THREE.Object3D();
const yaw = new THREE.Object3D();
pitch.add(camera);
yaw.add(pitch);
scene.add(yaw);
yaw.position.set(0, 0, 26);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;
gameRoot.appendChild(renderer.domElement);

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
raycaster.far = 85;
const centerNDC = new THREE.Vector2(0, 0);
const colliders = [];
const occluders = [];
const interactables = [];
const nodes = [];
const drones = [];
const fx = [];

let locked = false;
let modalOpen = false;
let started = false;
let dead = false;
let grounded = true;
let verticalVelocity = 0;
let health = maxHealth();
let energy = 100;
let lastFrame = performance.now();
let saveTimer = 0;
let toastTimer = 0;
let refineryNear = false;
let bobTime = 0;
let shotCooldown = 0;
let audioCtx = null;

const keys = new Set();

function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!raw) return DEFAULT();
    const d = DEFAULT();
    return {
      ...d, ...raw,
      upgrades: { ...d.upgrades, ...(raw.upgrades || {}) },
      zones: { ...d.zones, ...(raw.zones || {}) },
      inventory: 0,
      inventoryValue: 0
    };
  } catch {
    return DEFAULT();
  }
}
function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}
function resetSave() {
  localStorage.removeItem(SAVE_KEY);
  state = DEFAULT();
  location.reload();
}

function capacity() { return 20 + state.upgrades.capacity * 12; }
function miningPower() { return 1 + state.upgrades.power * 0.42; }
function moveSpeed() { return 7.6 + state.upgrades.speed * 0.7; }
function maxHealth() { return 100 + state.upgrades.shield * 18; }
function valueMultiplier() { return 1 + state.prestige * 0.25; }
function xpNeeded() { return Math.floor(100 * Math.pow(state.level, 1.22)); }
function upgradeCost(type) {
  const base = { power: 250, capacity: 300, speed: 350, shield: 400 }[type];
  return Math.floor(base * Math.pow(1.72, state.upgrades[type]));
}
function addXP(amount) {
  state.xp += Math.floor(amount);
  while (state.xp >= xpNeeded()) {
    state.xp -= xpNeeded();
    state.level++;
    state.coins += 120 * state.level;
    tone(660, 0.12, 0.04);
    setTimeout(() => tone(880, 0.13, 0.035), 80);
    toast(`LEVEL ${state.level} • bonus ₡${120 * state.level}`);
  }
}

function tone(freq = 440, duration = 0.06, volume = 0.03, type = "sine") {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(volume, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + duration);
  } catch {}
}

function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function makeMat(color, rough = 0.72, metal = 0.03, emissive = 0x000000, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive, emissiveIntensity });
}

function addMesh(geo, mat, pos, opts = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  if (opts.rot) m.rotation.set(...opts.rot);
  if (opts.scale) m.scale.set(...opts.scale);
  m.castShadow = opts.cast ?? true;
  m.receiveShadow = opts.receive ?? true;
  scene.add(m);
  return m;
}

function addBoxCollider(mesh, padding = 0) {
  mesh.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(mesh).expandByScalar(padding);
  colliders.push(box);
  occluders.push(mesh);
  return box;
}

function buildSky() {
  const skyGeo = new THREE.SphereGeometry(900, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      top: { value: new THREE.Color(0x091826) },
      horizon: { value: new THREE.Color(0x356268) },
      bottom: { value: new THREE.Color(0x081016) },
      offset: { value: 24.0 },
      exponent: { value: 0.58 }
    },
    vertexShader: `varying vec3 vWorldPosition;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWorldPosition=w.xyz;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom;
      varying vec3 vWorldPosition;
      void main(){ float h=normalize(vWorldPosition).y; vec3 c=mix(horizon,top,smoothstep(0.0,.72,h));
      c=mix(bottom,c,smoothstep(-.35,.1,h)); gl_FragColor=vec4(c,1.0); }`
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
}
buildSky();

scene.add(new THREE.HemisphereLight(0x9bdcff, 0x1b1811, 1.85));
const sun = new THREE.DirectionalLight(0xfff3dd, 4.1);
sun.position.set(-90, 150, 40);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -180; sun.shadow.camera.right = 180;
sun.shadow.camera.top = 180; sun.shadow.camera.bottom = -180;
sun.shadow.camera.far = 500;
sun.shadow.bias = -0.00025;
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const zoneDefs = [
  { id:"verdant", name:"VERDANT VERGE", x:0, color:0x254b3c, accent:0x6ff8df, node:0x71ffd9, nodeValue:36, hp:2.4, minX:-130, maxX:145 },
  { id:"ember", name:"EMBER RAVINE", x:300, color:0x522e25, accent:0xff9757, node:0xff9d57, nodeValue:92, hp:4.5, minX:155, maxX:445 },
  { id:"glacier", name:"NEON GLACIER", x:600, color:0x29495d, accent:0x86c8ff, node:0x8fd4ff, nodeValue:215, hp:7.3, minX:455, maxX:745 }
];

function seeded(i) {
  const x = Math.sin(i * 9283.133) * 43758.5453;
  return x - Math.floor(x);
}
function randRange(i, a, b) { return a + seeded(i) * (b - a); }

function buildGround(zone, idx) {
  const mat = makeMat(zone.color, 0.92, 0.0);
  const ground = addMesh(new THREE.PlaneGeometry(290, 250, 1, 1), mat, [zone.x, -0.02, 0], { rot:[-Math.PI/2,0,0], cast:false });
  ground.receiveShadow = true;

  for (let i=0;i<10;i++) {
    const z = -85 + i * 18.5;
    const plate = addMesh(new THREE.BoxGeometry(16, .12, 9), makeMat(idx===1?0x6a3d2f:idx===2?0x31576e:0x2f5c4a, .8, .05),
      [zone.x + Math.sin(i*1.7)*10, .02, z], { cast:false });
    plate.rotation.y = Math.sin(i) * .1;
  }

  const rockMat = makeMat(idx===1?0x4b2d28:idx===2?0x304958:0x263a34, .97, 0);
  for (let i=0;i<34;i++) {
    const seed = idx*100+i;
    let x = randRange(seed+2, zone.minX+10, zone.maxX-10);
    let z = randRange(seed+9, -108, 108);
    if (Math.abs(x-zone.x)<20 && Math.abs(z-26)<30) x += 30;
    const s = randRange(seed+19, .7, 3.8);
    const rock = addMesh(new THREE.DodecahedronGeometry(s, 0), rockMat, [x, s*.55-0.05, z], {
      rot:[randRange(seed+3,0,2),randRange(seed+4,0,3),randRange(seed+5,0,2)],
      scale:[1,randRange(seed+7,.55,1.4),randRange(seed+8,.7,1.4)]
    });
    if (s>2.2) addBoxCollider(rock, -.3);
  }

  for (let i=0;i<5;i++) {
    const x = zone.x - 85 + i*42;
    const z = idx===0 ? -82 : (idx===1 ? 75 : -78);
    const postMat = makeMat(idx===1?0x51352f:0x314853, .46, .5);
    const p1 = addMesh(new THREE.BoxGeometry(2.2, 12, 2.2), postMat,[x,6,z]);
    const p2 = addMesh(new THREE.BoxGeometry(2.2, 12, 2.2), postMat,[x+14,6,z]);
    const beam = addMesh(new THREE.BoxGeometry(16.2, 2, 2.2), postMat,[x+7,12,z]);
    addBoxCollider(p1); addBoxCollider(p2); addBoxCollider(beam);
  }

  if (idx===1) {
    for (let i=0;i<13;i++) {
      const strip = addMesh(new THREE.BoxGeometry(randRange(i+300,8,26),.025,.24),
        new THREE.MeshStandardMaterial({color:0xff622e,emissive:0xff3b10,emissiveIntensity:4,roughness:.4}),
        [zone.x+randRange(i+420,-120,120),.01,randRange(i+550,-100,100)], {rot:[0,randRange(i+620,-1.2,1.2),0],cast:false});
      strip.receiveShadow=false;
    }
    const emberLight = new THREE.PointLight(0xff5a2b, 16, 90, 2);
    emberLight.position.set(zone.x, 6, 0); scene.add(emberLight);
  }

  if (idx===2) {
    for (let i=0;i<17;i++) {
      const h=randRange(i+700,4,14);
      const shard=addMesh(new THREE.ConeGeometry(randRange(i+701,.8,2.4),h,5),
        new THREE.MeshPhysicalMaterial({color:0x8edbff,roughness:.22,metalness:.05,transmission:.08,transparent:true,opacity:.86,emissive:0x174a68,emissiveIntensity:1.1}),
        [zone.x+randRange(i+702,-120,120),h/2,randRange(i+703,-105,105)], {rot:[randRange(i+704,-.15,.15),0,randRange(i+705,-.14,.14)]});
      if(h>8)addBoxCollider(shard,-.2);
    }
  }
}

zoneDefs.forEach(buildGround);

const baseMat = makeMat(0x243844,.4,.55);
const refinery = new THREE.Group();
const basePad = new THREE.Mesh(new THREE.CylinderGeometry(14, 15, .8, 32), baseMat);
basePad.position.y=.4;basePad.receiveShadow=true;basePad.castShadow=true;refinery.add(basePad);
const tower = new THREE.Mesh(new THREE.CylinderGeometry(3.4,5.1,15,12),baseMat);
tower.position.y=7.9;tower.castShadow=true;tower.receiveShadow=true;refinery.add(tower);
const ringMat = new THREE.MeshStandardMaterial({color:0x7dfff1,emissive:0x42ffe5,emissiveIntensity:3,roughness:.2,metalness:.25});
for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(5.8-i*.7,.22,10,32),ringMat);ring.rotation.x=Math.PI/2;ring.position.y=3+i*4.2;refinery.add(ring);}
const beacon = new THREE.PointLight(0x66ffe7, 25, 45, 2);beacon.position.y=10;refinery.add(beacon);
refinery.position.set(0,0,26);scene.add(refinery);
refinery.traverse(o=>{if(o.isMesh)occluders.push(o)});

const terminal = addMesh(new THREE.BoxGeometry(2.6,4.5,1.7), makeMat(0x203747,.35,.62,0x153e4c,.7), [10,2.25,28]);
const termScreen = addMesh(new THREE.PlaneGeometry(1.8,1.15), new THREE.MeshBasicMaterial({color:0x71f9e3}), [9.11,2.8,28], {rot:[0,-Math.PI/2,0],cast:false,receive:false});
addBoxCollider(terminal);

function makeGate(x, label, accent) {
  const group = new THREE.Group();
  const postMat = makeMat(0x1e313a,.45,.55);
  for(const z of[-10,10]){
    const p=new THREE.Mesh(new THREE.BoxGeometry(3,15,3),postMat);p.position.set(0,7.5,z);p.castShadow=true;p.receiveShadow=true;group.add(p);
  }
  const beam=new THREE.Mesh(new THREE.BoxGeometry(3,2.4,23),postMat);beam.position.y=14;group.add(beam);
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(18,11),new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.08,side:THREE.DoubleSide,depthWrite:false}));
  plane.rotation.y=Math.PI/2;plane.position.y=6.5;group.add(plane);
  group.position.x=x;scene.add(group);
  return {group,plane,label};
}
const emberGate=makeGate(150,"EMBER",0xff7b45);
const glacierGate=makeGate(450,"GLACIER",0x79caff);

function zoneAllowedAtX(x) {
  if (x > 450 && !state.zones.glacier) return false;
  if (x > 150 && !state.zones.ember) return false;
  return x > -140 && x < 750;
}

function createCore(zone, i) {
  const group = new THREE.Group();
  const geo = new THREE.OctahedronGeometry(1.15, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: zone.node, emissive: zone.node, emissiveIntensity: 1.6,
    roughness:.28, metalness:.15
  });
  const crystal = new THREE.Mesh(geo, mat);
  crystal.castShadow=true;
  crystal.scale.set(.72,1.65,.72);
  group.add(crystal);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25,.055,8,24),new THREE.MeshBasicMaterial({color:zone.node,transparent:true,opacity:.6}));
  ring.rotation.x=Math.PI/2; ring.position.y=.1; group.add(ring);
  const seed = zone.x + i*13;
  group.position.set(
    randRange(seed+110, zone.minX+18, zone.maxX-18),
    1.5,
    randRange(seed+230, -96, 96)
  );
  if(Math.abs(group.position.x-zone.x)<22 && Math.abs(group.position.z-26)<28) group.position.z-=45;
  scene.add(group);
  const ent = {
    kind:"core", group, crystal, ring, zone, hp:zone.hp, maxHp:zone.hp, alive:true,
    phase:seeded(seed+77)*Math.PI*2, respawn:0
  };
  crystal.userData.entity=ent; ring.userData.entity=ent;
  interactables.push(crystal,ring); nodes.push(ent);
}
zoneDefs.forEach((z,zi)=>{for(let i=0;i<15;i++)createCore(z,i)});

function createDrone(zone, i) {
  const group = new THREE.Group();
  const bodyMat=makeMat(0x283943,.35,.75,zone.accent,.3);
  const body=new THREE.Mesh(new THREE.SphereGeometry(1.05,16,10),bodyMat);
  body.scale.set(1.35,.62,1); body.castShadow=true; group.add(body);
  const eye=new THREE.Mesh(new THREE.SphereGeometry(.23,10,8),new THREE.MeshBasicMaterial({color:zone.accent}));
  eye.position.set(0,0,.96);group.add(eye);
  const wingGeo=new THREE.BoxGeometry(1.7,.12,.55);
  for(const s of[-1,1]){const wing=new THREE.Mesh(wingGeo,bodyMat);wing.position.x=s*1.45;wing.castShadow=true;group.add(wing);}
  const seed=zone.x+i*31;
  group.position.set(randRange(seed+4,zone.minX+30,zone.maxX-20),4.5,randRange(seed+8,-82,82));
  scene.add(group);
  const ent={
    kind:"drone",group,body,zone,hp: 5+zone.hp*1.5,maxHp:5+zone.hp*1.5,alive:true,
    home:group.position.clone(),phase:seeded(seed+11)*6.28,lastAttack:0,respawn:0
  };
  group.traverse(o=>{if(o.isMesh){o.userData.entity=ent;interactables.push(o)}});
  drones.push(ent);
}
zoneDefs.forEach((z,zi)=>{for(let i=0;i<(zi===0?2:3);i++)createDrone(z,i)});

function currentZone() {
  const x=yaw.position.x;
  if(x>450)return zoneDefs[2];
  if(x>150)return zoneDefs[1];
  return zoneDefs[0];
}

function lineOfSight(from,to){
  const dir=to.clone().sub(from);const dist=dir.length();dir.normalize();
  raycaster.set(from,dir);raycaster.far=dist;
  const hits=raycaster.intersectObjects(occluders,false);
  return hits.length===0;
}

function spawnBurst(position,color,count=8,scale=.08) {
  for(let i=0;i<count;i++){
    const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(scale,0),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1}));
    mesh.position.copy(position);
    scene.add(mesh);
    const v=new THREE.Vector3((Math.random()-.5)*4,Math.random()*3+1,(Math.random()-.5)*4);
    fx.push({mesh,v,life:.55+Math.random()*.35,max:.9});
  }
}

function beam(from,to,color=0x7dfff1,life=.06){
  const d=to.clone().sub(from);const len=d.length();
  const geo=new THREE.CylinderGeometry(.025,.025,len,5);
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85});
  const m=new THREE.Mesh(geo,mat);
  m.position.copy(from).add(to).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
  scene.add(m);fx.push({mesh:m,v:null,life,max:life});
}

function hitEntity(ent, point) {
  if(!ent || !ent.alive)return;
  if(ent.kind==="core"){
    if(state.inventory>=capacity()){toast("BACKPACK FULL • return to refinery");tone(140,.08,.025,"square");return}
    ent.hp-=miningPower();
    ent.crystal.scale.multiplyScalar(.965);
    spawnBurst(point,ent.zone.node,5,.065);
    tone(240+Math.random()*90,.045,.022,"triangle");
    if(ent.hp<=0){
      ent.alive=false;ent.group.visible=false;ent.respawn=7+Math.random()*6;
      const amount=1;
      const value=Math.floor(ent.zone.nodeValue*valueMultiplier()*(.9+Math.random()*.25));
      state.inventory=Math.min(capacity(),state.inventory+amount);
      state.inventoryValue+=value;
      addXP(18+Math.floor(ent.zone.hp*4));
      toast(`CORE SECURED • +₡${value} cargo value`);
      spawnBurst(point,ent.zone.node,16,.09);
      tone(510,.07,.035,"triangle");setTimeout(()=>tone(760,.07,.025),55);
    }
  } else if(ent.kind==="drone"){
    ent.hp-=miningPower()*1.35;
    spawnBurst(point,0xb8ffff,7,.06);
    hitmarker.classList.remove("show");void hitmarker.offsetWidth;hitmarker.classList.add("show");
    tone(170,.035,.025,"square");
    if(ent.hp<=0){
      ent.alive=false;ent.group.visible=false;ent.respawn=12+Math.random()*8;
      const bounty=Math.floor((120+ent.zone.hp*55)*valueMultiplier());
      state.coins+=bounty;addXP(65+ent.zone.hp*12);
      toast(`DRONE DOWN • +₡${bounty}`);
      spawnBurst(point,ent.zone.accent,22,.1);
      tone(105,.18,.05,"sawtooth");
    }
  }
}

function fire() {
  if(!locked || modalOpen || dead || shotCooldown>0)return;
  shotCooldown=.16;
  energy-=3.2;
  if(energy<0){energy=0;toast("TOOL OVERHEATED");tone(110,.08,.03,"square");return}
  raycaster.setFromCamera(centerNDC,camera);
  raycaster.far=75;
  const hits=raycaster.intersectObjects(interactables,false);
  const origin=new THREE.Vector3();camera.getWorldPosition(origin);
  let target=origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(55));
  if(hits.length){
    const h=hits.find(x=>x.object.userData.entity?.alive);
    if(h){target.copy(h.point);hitEntity(h.object.userData.entity,h.point)}
  }
  beam(origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(.7)),target,0x7dfff1,.055);
}

function sellCargo(){
  if(state.inventory<=0){toast("NO CORES TO REFINE");return}
  const bonus=Math.floor(state.inventoryValue*(1+Math.min(state.level,30)*.012));
  state.coins+=bonus;
  addXP(state.inventory*8);
  const count=state.inventory;
  state.inventory=0;state.inventoryValue=0;
  tone(520,.08,.035);setTimeout(()=>tone(740,.1,.035),70);
  toast(`REFINED ${count} CORES • +₡${bonus}`);
  save();
}

function openShop(){
  if(dead)return;
  modalOpen=true;
  shopScreen.classList.add("active");
  document.exitPointerLock?.();
  refreshShop();
}
function closeShop(){
  shopScreen.classList.remove("active");modalOpen=false;
  renderer.domElement.requestPointerLock?.();
}
function refreshShop(){
  for(const type of["power","capacity","speed","shield"]){
    $(type+"Cost").textContent=`LV ${state.upgrades[type]} • ₡ ${upgradeCost(type).toLocaleString()}`;
  }
  $("unlockEmber").disabled=state.zones.ember;
  $("unlockEmber").textContent=state.zones.ember?"UNLOCKED":"UNLOCK ₡ 3,500";
  $("unlockGlacier").disabled=state.zones.glacier;
  $("unlockGlacier").textContent=state.zones.glacier?"UNLOCKED":"UNLOCK ₡ 12,000";
  $("prestigeBtn").disabled=!(state.level>=15&&state.coins>=25000);
}
function buyUpgrade(type){
  const cost=upgradeCost(type);
  if(state.coins<cost){toast("NOT ENOUGH COINS");tone(120,.08,.03,"square");return}
  state.coins-=cost;state.upgrades[type]++;
  if(type==="shield")health=maxHealth();
  tone(570,.08,.03);setTimeout(()=>tone(720,.08,.025),55);
  toast(`${type.toUpperCase()} UPGRADED • LV ${state.upgrades[type]}`);
  refreshShop();updateHUD();save();
}
function unlockZone(type,cost){
  if(state.zones[type])return;
  if(state.coins<cost){toast(`NEED ₡${cost.toLocaleString()}`);return}
  if(type==="glacier"&&!state.zones.ember){toast("UNLOCK EMBER RAVINE FIRST");return}
  state.coins-=cost;state.zones[type]=true;
  if(type==="ember")emberGate.plane.visible=false;
  if(type==="glacier")glacierGate.plane.visible=false;
  toast(`${type.toUpperCase()} ACCESS GRANTED`);
  tone(330,.08,.04);setTimeout(()=>tone(660,.2,.04),90);
  refreshShop();save();
}
function prestige(){
  if(state.level<15||state.coins<25000)return;
  state.prestige++;
  const keep=state.prestige;
  state=DEFAULT();state.prestige=keep;
  health=maxHealth();
  yaw.position.set(0,0,26);
  emberGate.plane.visible=true;glacierGate.plane.visible=true;
  toast(`OVERCHARGE ${state.prestige} • +25% PERMANENT VALUE`);
  save();refreshShop();updateHUD();
}

function takeDamage(amount,from){
  if(dead)return;
  health-=amount;
  damageFlash.style.opacity="1";
  setTimeout(()=>damageFlash.style.opacity="0",85);
  tone(80,.08,.045,"sawtooth");
  if(health<=0)die();
}
function die(){
  dead=true;health=0;state.inventory=0;state.inventoryValue=0;keys.clear();
  document.exitPointerLock?.();
  modalOpen=true;deathScreen.classList.add("active");
  save();
}
function respawn(){
  dead=false;modalOpen=false;deathScreen.classList.remove("active");
  health=maxHealth();energy=100;verticalVelocity=0;
  yaw.position.set(0,0,26);yaw.rotation.set(0,0,0);pitch.rotation.set(0,0,0);
  renderer.domElement.requestPointerLock?.();
}

function playerIntersects(pos){
  const r=.55; const minY=pos.y; const maxY=pos.y+1.75;
  for(const b of colliders){
    if(pos.x+r>b.min.x&&pos.x-r<b.max.x&&pos.z+r>b.min.z&&pos.z-r<b.max.z&&maxY>b.min.y&&minY<b.max.y)return true;
  }
  return false;
}

function updatePlayer(dt){
  if(!locked||modalOpen||dead)return;
  shotCooldown=Math.max(0,shotCooldown-dt);
  const sprint=keys.has("ShiftLeft")||keys.has("ShiftRight");
  const moving=keys.has("KeyW")||keys.has("KeyS")||keys.has("KeyA")||keys.has("KeyD");
  let speed=moveSpeed()*(sprint&&energy>2?1.65:1);
  if(sprint&&moving)energy=Math.max(0,energy-18*dt); else energy=Math.min(100,energy+23*dt);
  const input=new THREE.Vector3(
    (keys.has("KeyD")?1:0)-(keys.has("KeyA")?1:0),
    0,
    (keys.has("KeyS")?1:0)-(keys.has("KeyW")?1:0)
  );
  if(input.lengthSq()>0)input.normalize();
  input.applyAxisAngle(new THREE.Vector3(0,1,0),yaw.rotation.y);
  const next=yaw.position.clone().addScaledVector(input,speed*dt);
  if(zoneAllowedAtX(next.x)){
    const tryX=yaw.position.clone();tryX.x=next.x;
    if(!playerIntersects(tryX))yaw.position.x=next.x;
    const tryZ=yaw.position.clone();tryZ.z=next.z;
    if(!playerIntersects(tryZ))yaw.position.z=clamp(next.z,-117,117);
  } else if(next.x>yaw.position.x) {
    toast(next.x>450?"NEON GLACIER LOCKED • open upgrades":"EMBER RAVINE LOCKED • open upgrades");
  }
  yaw.position.x=clamp(yaw.position.x,-133,742);

  verticalVelocity-=24*dt;
  yaw.position.y+=verticalVelocity*dt;
  if(yaw.position.y<=0){yaw.position.y=0;verticalVelocity=0;grounded=true}else grounded=false;

  bobTime+=dt*(moving?speed*.55:2);
  camera.position.y=1.7+(moving&&grounded?Math.sin(bobTime*2.4)*.035:0);
  camera.position.x=moving&&grounded?Math.cos(bobTime*1.2)*.018:0;
}
function jump(){
  if(grounded&&locked&&!modalOpen&&!dead){verticalVelocity=8.2;grounded=false;tone(150,.04,.015,"triangle")}
}

function updateNodes(dt,t){
  for(const n of nodes){
    if(!n.alive){
      n.respawn-=dt;
      if(n.respawn<=0){n.alive=true;n.hp=n.maxHp;n.crystal.scale.set(.72,1.65,.72);n.group.visible=true}
      continue;
    }
    n.group.position.y=1.5+Math.sin(t*1.7+n.phase)*.18;
    n.crystal.rotation.y+=dt*.9;
    n.ring.rotation.z+=dt*.55;
  }
}
function updateDrones(dt,t){
  const playerPos=yaw.position.clone().add(new THREE.Vector3(0,1.5,0));
  for(const d of drones){
    if(!d.alive){
      d.respawn-=dt;
      if(d.respawn<=0){d.alive=true;d.hp=d.maxHp;d.group.visible=true;d.group.position.copy(d.home)}
      continue;
    }
    const dist=d.group.position.distanceTo(playerPos);
    let target=d.home.clone().add(new THREE.Vector3(Math.sin(t*.34+d.phase)*12,Math.sin(t*.8+d.phase)*1.2,Math.cos(t*.29+d.phase)*12));
    const zoneUnlocked=d.zone.id==="verdant" || (d.zone.id==="ember"&&state.zones.ember)||(d.zone.id==="glacier"&&state.zones.glacier);
    if(zoneUnlocked&&dist<47&&lineOfSight(d.group.position,playerPos))target=playerPos.clone().add(new THREE.Vector3(Math.sin(t+d.phase)*8,4.5,Math.cos(t*.8+d.phase)*8));
    const dir=target.sub(d.group.position);
    if(dir.lengthSq()>.1){dir.normalize();d.group.position.addScaledVector(dir,dt*(dist<47?4.2:2.2));d.group.lookAt(playerPos.x,d.group.position.y,playerPos.z)}
    d.group.position.y=Math.max(3.3,d.group.position.y);
    if(zoneUnlocked&&dist<35&&performance.now()-d.lastAttack>1450&&lineOfSight(d.group.position,playerPos)){
      d.lastAttack=performance.now();
      const missChance=.20;
      const end=playerPos.clone();
      if(Math.random()<missChance)end.add(new THREE.Vector3((Math.random()-.5)*5,(Math.random()-.5)*3,(Math.random()-.5)*5));
      beam(d.group.position.clone(),end,0xff5c72,.11);
      if(missChance===0 || end.distanceTo(playerPos)<1.8)takeDamage(7+d.zone.hp*1.8,d.group.position);
    }
  }
}

function updateFx(dt){
  for(let i=fx.length-1;i>=0;i--){
    const f=fx[i];f.life-=dt;
    if(f.v){f.v.y-=8*dt;f.mesh.position.addScaledVector(f.v,dt)}
    if(f.mesh.material?.transparent)f.mesh.material.opacity=clamp(f.life/f.max,0,1);
    if(f.life<=0){scene.remove(f.mesh);f.mesh.geometry?.dispose();f.mesh.material?.dispose();fx.splice(i,1)}
  }
  if(fx.length>160){
    const overflow=fx.splice(0,fx.length-160);
    overflow.forEach(f=>scene.remove(f.mesh));
  }
}

function updateProximity(){
  const p=yaw.position;
  const dist=Math.hypot(p.x-refinery.position.x,p.z-refinery.position.z);
  refineryNear=dist<16;
  const terminalDist=Math.hypot(p.x-terminal.position.x,p.z-terminal.position.z);
  if(refineryNear)interaction.textContent=state.inventory>0?`[ F ] REFINE ${state.inventory} CORES • EST ₡${state.inventoryValue}`:"REFINERY • backpack empty";
  else if(terminalDist<6)interaction.textContent="[ U ] OPEN UPGRADE TERMINAL";
  else interaction.textContent="";
}

function updateHUD(){
  $("coins").textContent=state.coins.toLocaleString();
  $("level").textContent=state.level;
  $("coreCount").textContent=`${state.inventory} / ${capacity()}`;
  $("prestigeCount").textContent=state.prestige;
  $("healthText").textContent=Math.max(0,Math.ceil(health));
  $("healthBar").style.width=`${clamp(health/maxHealth()*100,0,100)}%`;
  $("energyText").textContent=Math.ceil(energy);
  $("energyBar").style.width=`${energy}%`;
  const need=xpNeeded();
  $("xpBar").style.width=`${clamp(state.xp/need*100,0,100)}%`;
  $("xpText").textContent=`${state.xp.toLocaleString()} / ${need.toLocaleString()} XP`;
  const z=currentZone();
  $("objective").textContent=state.inventory>=capacity()
    ?"Backpack full — return to the refinery and press F."
    : `${z.name} • Harvest glowing cores${z.id!=="verdant"?" and hunt drones for bounties":""}.`;
}

function drawMinimap(){
  const w=minimap.width,h=minimap.height,cx=w/2,cy=h/2;
  mini.clearRect(0,0,w,h);
  mini.fillStyle="rgba(4,11,16,.8)";mini.beginPath();mini.arc(cx,cy,88,0,Math.PI*2);mini.fill();
  mini.save();mini.beginPath();mini.arc(cx,cy,84,0,Math.PI*2);mini.clip();
  const scale=.23;
  for(const [i,z] of zoneDefs.entries()){
    const x1=cx+(z.minX-yaw.position.x)*scale, x2=cx+(z.maxX-yaw.position.x)*scale;
    mini.fillStyle=i===0?"rgba(70,125,93,.35)":i===1?"rgba(151,73,49,.32)":"rgba(76,132,166,.32)";
    mini.fillRect(x1,0,x2-x1,h);
  }
  const plot=(x,z,color,r=2)=>{
    const px=cx+(x-yaw.position.x)*scale,py=cy+(z-yaw.position.z)*scale;
    if(px<0||px>w||py<0||py>h)return;mini.fillStyle=color;mini.beginPath();mini.arc(px,py,r,0,6.28);mini.fill();
  };
  for(const n of nodes)if(n.alive)plot(n.group.position.x,n.group.position.z,"rgba(116,255,226,.8)",1.5);
  for(const d of drones)if(d.alive)plot(d.group.position.x,d.group.position.z,"rgba(255,92,114,.9)",2.2);
  plot(refinery.position.x,refinery.position.z,"#ffffff",3);
  mini.restore();
  mini.strokeStyle="rgba(160,230,255,.18)";mini.lineWidth=2;mini.beginPath();mini.arc(cx,cy,84,0,6.28);mini.stroke();
  mini.save();mini.translate(cx,cy);mini.rotate(-yaw.rotation.y);mini.fillStyle="#f4ffff";mini.beginPath();mini.moveTo(0,-8);mini.lineTo(5,7);mini.lineTo(0,4);mini.lineTo(-5,7);mini.closePath();mini.fill();mini.restore();
}

function animate(){
  requestAnimationFrame(animate);
  const now=performance.now();
  const dt=Math.min((now-lastFrame)/1000,.04);lastFrame=now;
  const t=now/1000;
  updatePlayer(dt);updateNodes(dt,t);updateDrones(dt,t);updateFx(dt);updateProximity();updateHUD();drawMinimap();
  saveTimer+=dt;if(saveTimer>8){saveTimer=0;save()}
  renderer.render(scene,camera);
}
animate();

function requestPlay(){
  started=true;modalOpen=false;startScreen.classList.remove("active");pauseScreen.classList.remove("active");hud.classList.remove("hidden");
  renderer.domElement.requestPointerLock?.();
  tone(220,.06,.03);setTimeout(()=>tone(440,.1,.025),80);
}
$("playBtn").addEventListener("click",requestPlay);
$("resumeBtn").addEventListener("click",()=>{modalOpen=false;pauseScreen.classList.remove("active");renderer.domElement.requestPointerLock?.()});
$("resetBtn").addEventListener("click",resetSave);
$("closeShop").addEventListener("click",closeShop);
$("respawnBtn").addEventListener("click",respawn);
$("unlockEmber").addEventListener("click",()=>unlockZone("ember",3500));
$("unlockGlacier").addEventListener("click",()=>unlockZone("glacier",12000));
$("prestigeBtn").addEventListener("click",prestige);
document.querySelectorAll(".upgrade").forEach(b=>b.addEventListener("click",()=>buyUpgrade(b.dataset.upgrade)));

document.addEventListener("pointerlockchange",()=>{
  locked=document.pointerLockElement===renderer.domElement;
  if(!locked && started && !modalOpen && !dead){
    modalOpen=true;pauseScreen.classList.add("active");keys.clear();
  } else if(locked){
    modalOpen=false;pauseScreen.classList.remove("active");
  }
});
document.addEventListener("mousemove",e=>{
  if(!locked||modalOpen||dead)return;
  yaw.rotation.y-=e.movementX*.0019;
  pitch.rotation.x=clamp(pitch.rotation.x-e.movementY*.00175,-Math.PI*.48,Math.PI*.48);
});
document.addEventListener("mousedown",e=>{if(e.button===0)fire()});
document.addEventListener("keydown",e=>{
  keys.add(e.code);
  if(e.code==="Space"){e.preventDefault();jump()}
  if(e.code==="KeyF"&&refineryNear)sellCargo();
  if(e.code==="KeyU"&&!modalOpen)openShop();
});
document.addEventListener("keyup",e=>keys.delete(e.code));
window.addEventListener("blur",()=>keys.clear());
window.addEventListener("beforeunload",save);
window.addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
});

emberGate.plane.visible=!state.zones.ember;
glacierGate.plane.visible=!state.zones.glacier;
health=maxHealth();
refreshShop();
updateHUD();
