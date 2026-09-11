// VIALBREAK 50-level containment progression.
// 49 specimens per level: 7 specimens in each of 7 rarity classes.
(function(){
  const MAX_LEVEL=50;
  const INDEX_SIZE=49;
  const originalLevelOne=specimens.map(s=>({...s,containmentLevel:1}));
  const catalog=new Map(originalLevelOne.map(s=>[s.id,s]));

  rank.Apex=7;
  colors.Apex='#ff9f43';

  const rarityOrder=['Stable','Oddity','Mutant','Hazard','Black Label','Impossible','Apex'];
  const suffixes={
    Stable:['Sniffle','Culture','Mite','Spore','Fizz','Mold','Bug'],
    Oddity:['Echo','Worm','Bloom','Loop','Drip','Hiccup','Glitch'],
    Mutant:['Plague','Crawler','Fever','Rash','Leech','Gremlin','Swarm'],
    Hazard:['Stalker','Maw','Phantom','Breach','Parasite','Wraith','Devourer'],
    'Black Label':['Blacksite','Redaction','Shadow','Event','Anomaly','Protocol','Patient'],
    Impossible:['Paradox','NULL','Omega','Singularity','Yesterday','Endsignal','Unnameable'],
    Apex:['Crown','Relic','Godstrain','Prime','Apex','Origin','ONE']
  };
  const glyphs={
    Stable:['•','○','·','✦','~','◌','+'],Oddity:['↺','≈','◇','?','⌁','∞','404'],Mutant:['☣','M','▲','⚡','G','≋','×'],Hazard:['!','◫','☾','⬡','◉','Ⅱ','◆'],'Black Label':['██','✹','▯','0²','…','◈','R'],Impossible:['Ω','∅','-1','☀','✶','!','ΩΩ'],Apex:['♛','✦','∞','A','▲','◎','1']
  };
  const baseValues={
    Stable:[24,28,32,36,40,44,50],
    Oddity:[85,95,110,125,140,160,185],
    Mutant:[260,300,350,410,480,560,650],
    Hazard:[1050,1200,1450,1700,2000,2400,2900],
    'Black Label':[5400,6500,7900,9600,11800,14500,18000],
    Impossible:[36000,44000,55000,69000,88000,112000,145000],
    Apex:[190000,240000,310000,400000,520000,680000,900000]
  };
  const effects={
    Stable:['barely reacts to room light','forms harmless colonies overnight','changes shape when the freezer opens','produces a faint hum near metal','leaves tiny marks on its label','moves only when nobody watches','makes sensors report impossible decimals'],
    Oddity:['repeats sounds several seconds late','appears twice in reflective surfaces','briefly changes the colour of nearby glass','causes clocks to skip one tick','makes written notes rearrange themselves','responds to questions with bubbles','creates readings the scanner cannot classify'],
    Mutant:['adapts to every test within minutes','copies patterns from nearby equipment','changes behaviour after each scan','produces a second unstable culture','interferes with cameras and microphones','rebuilds itself after agitation','causes containment alarms to disagree'],
    Hazard:['forces automatic shutters to close','creates movement outside its own vial','makes nearby samples become restless','triggers warning lights without a leak','causes brief power drops in the chamber','changes pressure inside sealed cabinets','makes the lab AI request evacuation'],
    'Black Label':['has sections missing from every report','was recorded before the lab was built','causes security footage to redact itself','appears under two specimen numbers at once','cannot be deleted from the inventory system','makes containment maps show an extra room','has an origin file nobody is cleared to open'],
    Impossible:['breaks one basic rule of measurement','exists differently depending on who scans it','returns timestamps from tomorrow','registers as both empty and full','causes reality checks to fail nearby','cannot be assigned a stable location','forces the lab to invent a new error code'],
    Apex:['forces every other vial to register as background noise','causes the containment computer to ask who built it','has a serial number that changes when remembered','creates a second laboratory on no known floor','is listed as the reason the facility exists','cannot be priced by the standard market model','is marked as a specimen that should never have been found']
  };

  const themeDefs=[
    ['BIO','BASEMENT CULTURES'],['CRYO','CRYOGENIC WING'],['ABYSS','DEEP SEA VAULT'],['ORBIT','ORBITAL LAB'],['DREAM','DREAM WARD'],
    ['MECH','CLOCKWORK ANNEX'],['ARC','BIOELECTRIC SECTOR'],['VOID','VOID OBSERVATORY'],['RIFT','REALITY FURNACE'],['OMEGA','OMEGA CONTAINMENT'],
    ['PLASMA','PLASMA CRYPT'],['GRAV','GRAVITY CHAMBER'],['SIGNAL','SIGNAL NECROPOLIS'],['NANO','NANITE FORGE'],['TIME','TEMPORAL VAULT'],
    ['EDEN','SYNTHETIC EDEN'],['DARK','DARK MATTER CELL'],['BREAK','FRACTURE ENGINE'],['NULL','NULL CATHEDRAL'],['PRIME','PRIME OMEGA'],
    ['QUANTUM','QUANTUM MENAGERIE'],['MIRROR','MIRROR PLANET'],['ANTI','ANTIMATTER DOCK'],['LUCID','DREAM BLACKSITE'],['NEURAL','NEURAL FOUNDRY'],
    ['STAR','STAR EATER NEST'],['ECHO','ECHO DIMENSION'],['OBSIDIAN','OBSIDIAN BIOSPHERE'],['PHOTON','PHOTON MAZE'],['DEADNET','DEAD INTERNET LAB'],
    ['CELESTIAL','CELESTIAL MORGUE'],['PARADOX','PARADOX FARM'],['GHOST','GHOST MACHINE HALL'],['INFINITE','INFINITE HOSPITAL'],['CODE','DEEP CODE BUNKER'],
    ['HORIZON','EVENT HORIZON CELL'],['GOD','GOD PARTICLE ROOM'],['MULTI','MULTIVERSE ARCHIVE'],['ZERO','ZERO POINT ENGINE'],['APOC','APOCALYPSE GREENHOUSE'],
    ['CAUSAL','CAUSALITY PRISON'],['BACKUP','UNIVERSE BACKUP'],['LASTSTAR','LAST STAR VAULT'],['SIM','SIMULATION CORE'],['BEFORE','BEFORE TIME CHAMBER'],
    ['AFTER','AFTER REALITY LAB'],['CREATOR','CREATOR PROTOCOL'],['ABSZERO','ABSOLUTE ZERO ROOM'],['END','END OF EVERYTHING VAULT'],['ORIGIN','ORIGIN BLACKSITE']
  ];

  function palette(level){
    const hue=(level*47+112)%360;
    return Array.from({length:7},(_,i)=>`hsl(${(hue+i*33)%360} 82% ${58+(i%3)*6}%)`);
  }
  function rootWords(root){
    const r=root.charAt(0)+root.slice(1).toLowerCase();
    return [r,`${r}glass`,`${r}born`,`${r}core`,`${r}shade`,`${r}pulse`,`${r}zero`];
  }
  const themes=themeDefs.map(([short,name],i)=>({
    level:i+1,
    code:`${short}-${String(i+1).padStart(2,'0')}`,
    name,short,
    words:rootWords(short),
    palette:palette(i+1),
    dark:`hsl(${((i+1)*47+112)%360} 34% 14%)`,
    priceScale:Math.pow(2.15,i),
    valueScale:Math.pow(2.03,i)
  }));

  function generatedText(theme,rarity,i,name){
    const ending=rank[rarity]>=6?'SEALED BY DIRECTOR ORDER':rank[rarity]>=5?'DO NOT RELOCATE':'continue observation';
    return `${name} ${effects[rarity][i]}. ${theme.name.toLowerCase()} staff marked the vial ${ending}.`;
  }

  function makeLevelOneApex(){
    const t=themes[0];
    const out=[];
    for(let i=0;i<7;i++){
      const id=43+i,name=`Basement ${suffixes.Apex[i]}`;
      out.push({id,name,rarity:'Apex',glyph:glyphs.Apex[i],base:baseValues.Apex[i],text:generatedText(t,'Apex',i,name),liqA:t.palette[i],liqB:t.dark,containmentLevel:1});
    }
    return out;
  }
  const levelOneApex=makeLevelOneApex();
  levelOneApex.forEach(s=>catalog.set(s.id,s));

  function buildLevel(levelNum){
    if(levelNum===1)return [...originalLevelOne.map(s=>({...s,containmentLevel:1})),...levelOneApex.map(s=>({...s}))];
    const t=themes[levelNum-1],out=[];let idx=0;
    rarityOrder.forEach(rarity=>{
      for(let i=0;i<7;i++){
        idx++;
        const id=levelNum*100+idx;
        const name=`${t.words[i]} ${suffixes[rarity][i]}`;
        const s={id,name,rarity,glyph:glyphs[rarity][i],base:Math.round(baseValues[rarity][i]*t.valueScale),text:generatedText(t,rarity,i,name),liqA:t.palette[i],liqB:t.dark,containmentLevel:levelNum};
        out.push(s);catalog.set(id,s);
      }
    });
    return out;
  }
  for(let l=2;l<=MAX_LEVEL;l++)buildLevel(l);

  const originalById=byId;
  byId=function(id){return catalog.get(Number(id))||originalById(id)};

  if(!state.containmentLevel)state.containmentLevel=1;
  if(!Array.isArray(state.completedContainmentLevels))state.completedContainmentLevels=[];
  if(state.containmentLevel<1||state.containmentLevel>MAX_LEVEL)state.containmentLevel=1;
  if(state.containmentLevel<MAX_LEVEL)state.gameComplete=false;
  if(!state.fullIndexIncidents)state.fullIndexIncidents=0;

  function currentTheme(){return themes[state.containmentLevel-1]}
  function loadCurrentIndex(){specimens.splice(0,specimens.length,...buildLevel(state.containmentLevel))}

  const rackProfiles=[
    {id:'starter',base:250,label:'BASIC SAMPLE RACK',sub:'CHEAP // BRUTAL ODDS',god:.0001,odds:'God Rack 1:10,000',weights:{Stable:74,Oddity:21,Mutant:4.5,Hazard:.45,'Black Label':.045,Impossible:.0045,Apex:.0005}},
    {id:'enriched',base:1500,label:'ENRICHED RACK',sub:'LOW-MID // SLIGHTLY BETTER',god:.0002,odds:'God Rack 1:5,000',weights:{Stable:66,Oddity:25,Mutant:8,Hazard:.9,'Black Label':.09,Impossible:.009,Apex:.001}},
    {id:'research',base:8000,label:'RESEARCH CASE',sub:'EXPENSIVE // SERIOUS HUNTING',god:.0004,odds:'God Rack 1:2,500',weights:{Stable:52,Oddity:30,Mutant:15,Hazard:2.7,'Black Label':.27,Impossible:.027,Apex:.003}},
    {id:'blacksite',base:40000,label:'BLACKSITE CRATE',sub:'VERY EXPENSIVE // RARE FOCUSED',god:.000833,odds:'God Rack 1:1,200',weights:{Stable:35,Oddity:32,Mutant:25,Hazard:7.2,'Black Label':.72,Impossible:.072,Apex:.008}},
    {id:'omega',base:250000,label:'OMEGA VAULT',sub:'EXTREME PRICE // ELITE ODDS',god:.00143,odds:'God Rack 1:700',weights:{Stable:18,Oddity:31,Mutant:33,Hazard:15.5,'Black Label':2.2,Impossible:.27,Apex:.03}},
    {id:'apex',base:2500000,label:'APEX ARCHIVE',sub:'ABSURD PRICE // 0.1% INDEX INCIDENT',god:.0025,odds:'God Rack 1:400',indexJackpot:.001,weights:{Stable:5,Oddity:20,Mutant:34,Hazard:29,'Black Label':10,Impossible:1.8,Apex:.2}}
  ];

  function makeRack(profile,i,t){
    return {id:profile.id,name:`${t.short} ${profile.label}`,sub:profile.sub,price:Math.round(profile.base*t.priceScale),level:1,a:t.palette[(i+1)%7],b:t.dark,glow:t.palette[(i*2+3)%7],odds:profile.odds,god:profile.god,indexJackpot:profile.indexJackpot||0,weights:{...profile.weights},symbol:i===5?'♛':i>=4?'Ω':i>=2?'⬡':'🧪'};
  }
  function configureRacks(){
    const t=currentTheme();
    racks.splice(0,racks.length,...rackProfiles.map((p,i)=>makeRack(p,i,t)));
  }

  boostedWeights=function(base){
    const w={...base};
    w.Stable*=.35;w.Oddity*=.72;w.Mutant*=1.25;w.Hazard*=1.8;w['Black Label']*=3.0;w.Impossible*=5.0;if('Apex'in w)w.Apex*=8.0;
    return w;
  };
  godWeights=function(){return{Stable:0,Oddity:0,Mutant:18,Hazard:47,'Black Label':27,Impossible:7,Apex:1}};

  function ensureLevelUI(){
    if(!$('#containmentPill')){
      const collectionStat=document.querySelector('.stats .stat:nth-child(2)');
      collectionStat?.insertAdjacentHTML('afterend',`<div id="containmentPill" class="stat containment-pill"><small>CONTAINMENT</small><b>1 / ${MAX_LEVEL}</b></div>`);
    }
    if(!$('#levelCompleteOverlay')){
      document.body.insertAdjacentHTML('beforeend',`<div id="levelCompleteOverlay" class="level-complete-overlay"><div class="level-complete-box"><div class="level-complete-mark">✓</div><div class="eyebrow" id="completeCode"></div><h2 id="completeTitle">INDEX COMPLETE</h2><p id="completeText"></p><div class="level-complete-stats"><div><small>LEVEL</small><b id="completeLevel"></b></div><div><small>INDEX</small><b>${INDEX_SIZE} / ${INDEX_SIZE}</b></div><div><small>CREDITS KEPT</small><b id="completeCredits"></b></div></div><button id="advanceLevelBtn" class="advance-level-btn">ENTER NEXT LEVEL</button></div></div>`);
      $('#advanceLevelBtn').onclick=advanceLevel;
    }
  }

  function syncProgressionUI(){
    ensureLevelUI();const t=currentTheme();
    $('#containmentPill').querySelector('b').textContent=`${state.containmentLevel} / ${MAX_LEVEL}`;
    const heroEye=document.querySelector('#screen-shop .hero .eyebrow');if(heroEye)heroEye.textContent=`${t.code} // ${t.name}`;
    const heroP=document.querySelector('#screen-shop .hero p');if(heroP)heroP.innerHTML=`Seven sealed vials per rack. <b>49 specimens</b> hide on this floor. Vial 7 gets a Final Chamber boost, but top-tier pulls are intentionally brutal.`;
    const archiveEye=document.querySelector('#screen-collection .section-head .eyebrow');if(archiveEye)archiveEye.textContent=`SPECIMEN INDEX ${String(state.containmentLevel).padStart(2,'0')} // ${t.name}`;
    const archiveP=document.querySelector('#screen-collection .section-head p');if(archiveP)archiveP.textContent=`Level ${state.containmentLevel} of ${MAX_LEVEL} • discover all ${INDEX_SIZE} to breach the next containment level.`;
    const chase=[...specimens].filter(s=>s.rarity==='Apex').sort((a,b)=>b.base-a.base)[0]||[...specimens].sort((a,b)=>b.base-a.base)[0];
    if(chase){
      const head=document.querySelector('.chase .panel-head h3');if(head)head.textContent=chase.name;
      const chip=document.querySelector('.chase .chip');if(chip){chip.textContent=chase.rarity.toUpperCase();chip.style.color=colors[chase.rarity];chip.style.borderColor=colors[chase.rarity]+'66'}
      const body=document.querySelector('.chasebody');if(body)body.innerHTML=`<div class="hero-vial impossible-vial" style="--liqA:${chase.liqA};--liqB:${chase.liqB}"><div class="cap"></div><div class="glass"><div class="liquid"></div><div class="organism">${chase.glyph}</div></div><small>${t.code}</small></div><div><p>${chase.text}</p><div class="kv"><span>RAW INDEX</span><b>₡ ${fmt(chase.base)}</b></div><div class="kv"><span>CGC 10 EST.</span><b class="gold">₡ ${fmt(chase.base*5.2)}</b></div></div>`;
    }
    document.querySelectorAll('.rack-card').forEach((card,i)=>{
      let badge=card.querySelector('.level-rack-badge');if(!badge){badge=document.createElement('div');badge.className='level-rack-badge';card.appendChild(badge)}
      badge.textContent=['BASIC','ENRICHED','RESEARCH','BLACKSITE','OMEGA','APEX'][i]||'RACK';
    });
  }

  function indexComplete(){return state.discovered.length>=INDEX_SIZE&&specimens.length===INDEX_SIZE}
  let completionShown=false;
  function maybeLevelComplete(){
    if(!indexComplete()||completionShown)return;
    ensureLevelUI();completionShown=true;const t=currentTheme(),final=state.containmentLevel===MAX_LEVEL;
    $('#completeCode').textContent=`${t.code} // ${INDEX_SIZE} OF ${INDEX_SIZE} CATALOGUED`;
    $('#completeTitle').textContent=final?'ALL 50 CONTAINMENT LEVELS COMPLETE':'CONTAINMENT LEVEL COMPLETE';
    $('#completeText').textContent=final?'You completed all 2,450 specimen entries. Level 50 stays open as the endgame market and grading floor.':'Your credits, cracking tools, graded vials and old specimens stay with you. The next floor starts a fresh 0/49 index and much more expensive racks.';
    $('#completeLevel').textContent=final?`${MAX_LEVEL} / ${MAX_LEVEL}`:`${state.containmentLevel} → ${state.containmentLevel+1}`;
    $('#completeCredits').textContent=`₡${fmt(state.credits)}`;
    $('#advanceLevelBtn').textContent=final?'RETURN TO LEVEL 50':`ENTER LEVEL ${state.containmentLevel+1}`;
    $('#levelCompleteOverlay').classList.add('active');
  }
  function advanceLevel(){
    if(state.containmentLevel>=MAX_LEVEL){state.gameComplete=true;save();$('#levelCompleteOverlay').classList.remove('active');completionShown=false;toast('🏆 VIALBREAK COMPLETE — Level 50 endgame unlocked.');return}
    if(!state.completedContainmentLevels.includes(state.containmentLevel))state.completedContainmentLevels.push(state.containmentLevel);
    state.containmentLevel++;state.discovered=[];state.bestPull=null;filter='all';completionShown=false;
    loadCurrentIndex();configureRacks();save();$('#levelCompleteOverlay').classList.remove('active');renderAll();
    toast(`CONTAINMENT ${state.containmentLevel}: ${currentTheme().name}`);beep(700,.18,'sine',.06);setTimeout(()=>beep(980,.22,'sine',.05),130);
  }

  let pendingIndexIncident=false;
  let pendingBulkIndexIncident=false;
  function awardFullIndexIncident(){
    const missing=specimens.filter(s=>!state.discovered.includes(s.id));
    if(!missing.length)return;
    missing.forEach(s=>{
      state.discovered.push(s.id);
      state.inventory.push({uid:state.nextUID++,specimenId:s.id,grade:null,pristine:Math.random()<.18,serial:rank[s.rarity]>=5?Math.floor(1+Math.random()*999):null});
    });
    state.fullIndexIncidents=(state.fullIndexIncidents||0)+1;
    save();renderAll();
    alert(`FULL INDEX INCIDENT!\n\n0.1% event triggered. The archive recovered every missing specimen on Containment Level ${state.containmentLevel}.`);
  }

  const progressionBaseOpenRack=openRack;
  openRack=function(r){pendingIndexIncident=!!(r.indexJackpot&&Math.random()<r.indexJackpot);progressionBaseOpenRack(r)};
  if(typeof openBulkRackBatch==='function'){
    const progressionBaseBulkOpen=openBulkRackBatch;
    openBulkRackBatch=function(r,q){
      pendingBulkIndexIncident=false;
      if(r.indexJackpot){for(let i=0;i<q;i++)if(Math.random()<r.indexJackpot)pendingBulkIndexIncident=true}
      progressionBaseBulkOpen(r,q);
    };
  }

  loadCurrentIndex();configureRacks();ensureLevelUI();
  const previousRenderAll=renderAll;
  renderAll=function(){configureRacks();previousRenderAll();syncProgressionUI();setTimeout(maybeLevelComplete,80)};

  const previousFinishRack=finishRack;
  finishRack=function(){
    previousFinishRack();
    if(pendingIndexIncident){pendingIndexIncident=false;awardFullIndexIncident()}
    setTimeout(maybeLevelComplete,180);
  };
  if(typeof commitAndRevealBulk==='function'){
    const previousCommitBulk=commitAndRevealBulk;
    commitAndRevealBulk=function(){
      previousCommitBulk();
      if(pendingBulkIndexIncident){pendingBulkIndexIncident=false;awardFullIndexIncident()}
      setTimeout(maybeLevelComplete,180);
    };
  }

  window.VIALBREAK_PROGRESSION={MAX_LEVEL,INDEX_SIZE,themes,currentTheme,configureRacks,catalog};
  renderAll();
})();