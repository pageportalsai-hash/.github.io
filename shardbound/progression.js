// VIALBREAK 20-level containment progression — harder pulls and steep economy scaling.
(function(){
  const MAX_LEVEL=20;
  const originalLevelOne=specimens.map(s=>({...s}));
  const catalog=new Map(originalLevelOne.map(s=>[s.id,s]));
  const rarityOrder=['Stable','Oddity','Mutant','Hazard','Black Label','Impossible'];
  const suffixes={
    Stable:['Sniffle','Culture','Mite','Spore','Fizz','Mold','Bug'],
    Oddity:['Echo','Worm','Bloom','Loop','Drip','Hiccup','Glitch'],
    Mutant:['Plague','Crawler','Fever','Rash','Leech','Gremlin','Swarm'],
    Hazard:['Stalker','Maw','Phantom','Breach','Parasite','Wraith','Devourer'],
    'Black Label':['Blacksite','Redaction','Shadow','Event','Anomaly','Protocol','Patient'],
    Impossible:['Paradox','NULL','Omega','Singularity','Yesterday','Endsignal','Unnameable']
  };
  const glyphs={
    Stable:['•','○','·','✦','~','◌','+'],Oddity:['↺','≈','◇','?','⌁','∞','404'],Mutant:['☣','M','▲','⚡','G','≋','×'],Hazard:['!','◫','☾','⬡','◉','Ⅱ','◆'],'Black Label':['██','✹','▯','0²','…','◈','R'],Impossible:['Ω','∅','-1','☀','✶','!','ΩΩ']
  };
  const baseValues={
    Stable:[18,20,22,24,26,28,30],Oddity:[55,62,68,72,76,81,88],Mutant:[145,155,165,175,188,205,218],Hazard:[470,525,590,620,680,735,790],'Black Label':[1550,1740,1980,2240,2650,3100,3600],Impossible:[12800,15400,17600,20100,21900,24800,26600]
  };
  const effects={
    Stable:['barely reacts to room light','forms harmless colonies overnight','changes shape when the freezer opens','produces a faint hum near metal','leaves tiny marks on its label','moves only when nobody watches','makes sensors report impossible decimals'],
    Oddity:['repeats sounds several seconds late','appears twice in reflective surfaces','briefly changes the colour of nearby glass','causes clocks to skip one tick','makes written notes rearrange themselves','responds to questions with bubbles','creates readings the scanner cannot classify'],
    Mutant:['adapts to every test within minutes','copies patterns from nearby equipment','changes behaviour after each scan','produces a second unstable culture','interferes with cameras and microphones','rebuilds itself after agitation','causes containment alarms to disagree'],
    Hazard:['forces automatic shutters to close','creates movement outside its own vial','makes nearby samples become restless','triggers warning lights without a leak','causes brief power drops in the chamber','changes pressure inside sealed cabinets','makes the lab AI request evacuation'],
    'Black Label':['has sections missing from every report','was recorded before the lab was built','causes security footage to redact itself','appears under two specimen numbers at once','cannot be deleted from the inventory system','makes containment maps show an extra room','has an origin file nobody is cleared to open'],
    Impossible:['breaks one basic rule of measurement','exists differently depending on who scans it','returns timestamps from tomorrow','registers as both empty and full','causes reality checks to fail nearby','cannot be assigned a stable location','forces the lab to invent a new error code']
  };

  // priceScale controls rack cost. valueScale controls what specimens are worth.
  // Both climb hard so keeping your money matters, while each new level still feels expensive.
  const themes=[
    {level:1,code:'BIO-01',name:'BASEMENT CULTURES',short:'BASEMENT',words:['Sock','Yogurt','Keyboard','Tuesday','Dust','Snack','Yawn'],palette:['#72d88d','#e9efb7','#7fc4ff','#f6c55d','#d7dad4','#e6a867','#84aaff'],dark:'#183a31',valueScale:1,priceScale:1},
    {level:2,code:'CRYO-02',name:'CRYOGENIC WING',short:'CRYO',words:['Frostbite','Glacial','Cryo','Snowblind','Permafrost','Whiteout','Icicle'],palette:['#b9f5ff','#74d9ff','#a8c4ff','#d6f7ff','#76aee8','#e8fbff','#8ce9f0'],dark:'#18364a',valueScale:4.5,priceScale:5},
    {level:3,code:'ABYSS-03',name:'DEEP SEA VAULT',short:'ABYSS',words:['Abyssal','Brine','Trench','Coral','Pressure','Lanternfish','Blackwater'],palette:['#5cf1da','#49b8dd','#395ea8','#ff8cb7','#6ee1ff','#d8ff69','#6170ff'],dark:'#102b43',valueScale:20,priceScale:22},
    {level:4,code:'ORBIT-04',name:'ORBITAL LAB',short:'ORBITAL',words:['Orbital','Lunar','Solar','Vacuum','Comet','Satellite','Starfall'],palette:['#d6dcff','#8fa8ff','#ffd45e','#c0b5ff','#8ff4ff','#c9cad8','#f4a7ff'],dark:'#252343',valueScale:70,priceScale:80},
    {level:5,code:'REM-05',name:'DREAM WARD',short:'DREAM',words:['Dreamstatic','Sleepwalk','Nightmare','Pillow','Lucid','REM','Moonbed'],palette:['#d988ff','#8d7dff','#ff769f','#b5a4ff','#79e2ff','#ffb0ee','#a783d8'],dark:'#3a1e4d',valueScale:220,priceScale:260},
    {level:6,code:'MECH-06',name:'CLOCKWORK ANNEX',short:'CLOCKWORK',words:['Clockwork','Brass','Pendulum','Gearbox','Ticktock','Springloaded','Hourglass'],palette:['#f2b96d','#d59045','#ffde85','#b98259','#e7cc9a','#ff9f66','#c7a36f'],dark:'#49301d',valueScale:650,priceScale:800},
    {level:7,code:'ARC-07',name:'BIOELECTRIC SECTOR',short:'ARC',words:['Voltage','Arcflash','Neon','Thunder','Capacitor','Static','Gridlock'],palette:['#72fff1','#ffe661','#65bfff','#bd7dff','#5bff9e','#f0f7ff','#69f5d1'],dark:'#173d3b',valueScale:1900,priceScale:2400},
    {level:8,code:'VOID-08',name:'VOID OBSERVATORY',short:'VOID',words:['Voidglass','Eventide','Darkstar','Nullspace','Gravity','Eclipse','Horizon'],palette:['#b58aff','#6f82ff','#d777ff','#8996c9','#b1c2ff','#624f9c','#e0dbff'],dark:'#1d1838',valueScale:5300,priceScale:7000},
    {level:9,code:'RIFT-09',name:'REALITY FURNACE',short:'RIFT',words:['Realityburn','Fracture','Paradox','Meltspace','Redshift','Impossible','Furnace'],palette:['#ff7569','#ffb05f','#f06eff','#ffdc6b','#ff627e','#c46cff','#ff914d'],dark:'#481c24',valueScale:14500,priceScale:20000},
    {level:10,code:'OMEGA-10',name:'OMEGA CONTAINMENT',short:'OMEGA',words:['Omega','Final','Crowned','Lastlight','Absolute','Endstate','Unwritten'],palette:['#ffffff','#ffd85e','#f379ff','#72f8ff','#ff7185','#c5a7ff','#fff2a6'],dark:'#342742',valueScale:39000,priceScale:55000},
    {level:11,code:'PLASMA-11',name:'PLASMA CRYPT',short:'PLASMA',words:['Plasma','Ion','Corona','Fusion','Helix','Radiant','Torchstar'],palette:['#71fff1','#65a7ff','#ff73cb','#fff06c','#75ff92','#ff8b62','#d899ff'],dark:'#183044',valueScale:104000,priceScale:150000},
    {level:12,code:'GRAV-12',name:'GRAVITY CHAMBER',short:'GRAVITY',words:['Gravity','Masslock','Falling','Orbitfall','Heavy','Anchor','Singularity'],palette:['#c1b1ff','#8290ff','#6de6ff','#e6d7ff','#8b70c9','#b4c9ff','#725ad6'],dark:'#24203f',valueScale:275000,priceScale:400000},
    {level:13,code:'SIGNAL-13',name:'SIGNAL NECROPOLIS',short:'SIGNAL',words:['Signal','Deadwave','Broadcast','Staticborn','Antenna','Ghostband','Lastcall'],palette:['#7effbc','#78e5ff','#e5ff70','#ff8edb','#99a9ff','#6ff4e5','#f8f8f8'],dark:'#16352f',valueScale:720000,priceScale:1000000},
    {level:14,code:'NANO-14',name:'NANITE FORGE',short:'NANITE',words:['Nanite','Chrome','Assembler','Microforge','Swarmcode','Greygoo','Machineblood'],palette:['#d9e7e7','#79f4d9','#7ea9ff','#f5d46b','#c0c7d8','#98ff8e','#ff8b93'],dark:'#273238',valueScale:1900000,priceScale:2500000},
    {level:15,code:'TIME-15',name:'TEMPORAL VAULT',short:'TEMPORAL',words:['Tomorrow','Yesterday','Chrono','Secondhand','Ageing','Timelock','Forever'],palette:['#ffd878','#95b7ff','#ee8dff','#79f8ea','#ff8c93','#b8a4ff','#fff1c0'],dark:'#3a2e3e',valueScale:5000000,priceScale:6000000},
    {level:16,code:'EDEN-16',name:'SYNTHETIC EDEN',short:'EDEN',words:['Eden','Petalcode','Glassvine','Fruitwire','Bloomcore','Garden','Seraph'],palette:['#8fff9a','#ffd976','#ff93c9','#8be9ff','#c5ff79','#ffffff','#d79aff'],dark:'#1e3e2b',valueScale:13000000,priceScale:14000000},
    {level:17,code:'DARK-17',name:'DARK MATTER CELL',short:'DARK',words:['Darkmatter','Antimass','Invisible','Blackstar','Weightless','Nocturne','Collapse'],palette:['#8375ff','#a47cff','#5f6b9d','#c6b8ff','#7798ff','#4c436f','#ece8ff'],dark:'#131226',valueScale:34000000,priceScale:32000000},
    {level:18,code:'BREAK-18',name:'FRACTURE ENGINE',short:'FRACTURE',words:['Fracture','Splinter','Crackspace','Shardtime','Broken','Faultline','Rupture'],palette:['#ff765f','#ffba62','#f97cff','#79dfff','#ff5e8a','#ffd76b','#b07bff'],dark:'#401b27',valueScale:88000000,priceScale:72000000},
    {level:19,code:'NULL-19',name:'NULL CATHEDRAL',short:'NULL',words:['Null','Silence','Blank','Absent','Nothing','Nameless','Erased'],palette:['#d7d7e5','#9ea0c2','#ffffff','#7f7f96','#c4b7e8','#99c9cf','#e9e2ff'],dark:'#1d1d27',valueScale:225000000,priceScale:160000000},
    {level:20,code:'PRIME-20',name:'PRIME OMEGA',short:'PRIME',words:['Prime','Origin','Creator','Firstlight','Godcode','Terminal','Beyond'],palette:['#ffffff','#ffe36b','#ff78ee','#74fff0','#ff7482','#bca4ff','#fff5c9'],dark:'#342642',valueScale:575000000,priceScale:350000000}
  ];

  function generatedText(theme,rarity,i,name){return `${name} ${effects[rarity][i]}. ${theme.name.toLowerCase()} staff marked the vial ${rank[rarity]>=5?'DO NOT RELOCATE':'for continued observation'}.`}
  function buildLevel(levelNum){
    if(levelNum===1)return originalLevelOne.map(s=>({...s,containmentLevel:1}));
    const t=themes[levelNum-1],out=[];let idx=0;
    rarityOrder.forEach(rarity=>{
      for(let i=0;i<7;i++){
        idx++;const id=levelNum*100+idx,name=`${t.words[i]} ${suffixes[rarity][i]}`;
        const s={id,name,rarity,glyph:glyphs[rarity][i],base:Math.round(baseValues[rarity][i]*t.valueScale),text:generatedText(t,rarity,i,name),liqA:t.palette[i],liqB:t.dark,containmentLevel:levelNum};
        out.push(s);catalog.set(id,s);
      }
    });return out;
  }
  for(let l=2;l<=MAX_LEVEL;l++)buildLevel(l);

  const originalById=byId;
  byId=function(id){return catalog.get(Number(id))||originalById(id)};

  if(!state.containmentLevel)state.containmentLevel=1;
  if(!Array.isArray(state.completedContainmentLevels))state.completedContainmentLevels=[];
  if(state.containmentLevel<1||state.containmentLevel>MAX_LEVEL)state.containmentLevel=1;
  if(state.containmentLevel<MAX_LEVEL)state.gameComplete=false;

  function currentTheme(){return themes[state.containmentLevel-1]}
  function loadCurrentIndex(){
    const next=buildLevel(state.containmentLevel);
    specimens.splice(0,specimens.length,...next);
  }

  // Harder rarity curves than the original game. The premium rack is still best,
  // but even it no longer showers the player with top-tier specimens.
  const rackProfiles=[
    {id:'starter',base:140,label:'BASIC SAMPLE RACK',sub:'CHEAP // TOUGH ODDS',god:.0005,odds:'God Rack 1:2,000',weights:{Stable:68,Oddity:23,Mutant:7.5,Hazard:1.3,'Black Label':.18,Impossible:.02}},
    {id:'quarantine',base:650,label:'ENRICHED RACK',sub:'MID PRICE // IMPROVED ODDS',god:.0015,odds:'God Rack 1:667',weights:{Stable:52,Oddity:28,Mutant:14,Hazard:5,'Black Label':.9,Impossible:.1}},
    {id:'blacksite',base:3200,label:'OMEGA CASE',sub:'VERY EXPENSIVE // BEST ODDS',god:.004,odds:'God Rack 1:250',weights:{Stable:27,Oddity:29,Mutant:25,Hazard:14.5,'Black Label':4.2,Impossible:.3}}
  ];

  function configureRacks(){
    const t=currentTheme();
    racks.forEach((r,i)=>{
      const p=rackProfiles[i];
      r.level=1;
      r.price=Math.round(p.base*t.priceScale);
      r.name=`${t.short} ${p.label}`;
      r.sub=p.sub;r.god=p.god;r.odds=p.odds;r.weights={...p.weights};
      r.a=t.palette[(i*2)%7];r.b=t.dark;r.glow=t.palette[(i*2+1)%7];r.symbol=i===0?'🧪':i===1?'⬡':'Ω';
    });
  }

  function ensureLevelUI(){
    if(!$('#containmentPill')){
      const collectionStat=document.querySelector('.stats .stat:nth-child(2)');
      collectionStat?.insertAdjacentHTML('afterend',`<div id="containmentPill" class="stat containment-pill"><small>CONTAINMENT</small><b>1 / ${MAX_LEVEL}</b></div>`);
    }
    if(!$('#levelCompleteOverlay')){
      document.body.insertAdjacentHTML('beforeend',`<div id="levelCompleteOverlay" class="level-complete-overlay"><div class="level-complete-box"><div class="level-complete-mark">✓</div><div class="eyebrow" id="completeCode"></div><h2 id="completeTitle">INDEX COMPLETE</h2><p id="completeText"></p><div class="level-complete-stats"><div><small>LEVEL</small><b id="completeLevel"></b></div><div><small>INDEX</small><b>42 / 42</b></div><div><small>CREDITS KEPT</small><b id="completeCredits"></b></div></div><button id="advanceLevelBtn" class="advance-level-btn">ENTER NEXT LEVEL</button></div></div>`);
      $('#advanceLevelBtn').onclick=advanceLevel;
    }
  }

  function syncProgressionUI(){
    ensureLevelUI();const t=currentTheme();
    $('#containmentPill').querySelector('b').textContent=`${state.containmentLevel} / ${MAX_LEVEL}`;
    const heroEye=document.querySelector('#screen-shop .hero .eyebrow');if(heroEye)heroEye.textContent=`${t.code} // ${t.name}`;
    const archiveEye=document.querySelector('#screen-collection .section-head .eyebrow');if(archiveEye)archiveEye.textContent=`SPECIMEN INDEX ${String(state.containmentLevel).padStart(2,'0')} // ${t.name}`;
    const archiveP=document.querySelector('#screen-collection .section-head p');if(archiveP)archiveP.textContent=`Level ${state.containmentLevel} of ${MAX_LEVEL} • discover all 42 to breach the next containment level.`;
    const chase=[...specimens].filter(s=>s.rarity==='Impossible').sort((a,b)=>b.base-a.base)[0];
    if(chase){
      const h=document.querySelector('.chase .panel-head h3');if(h)h.textContent=chase.name;
      const body=document.querySelector('.chasebody');if(body)body.innerHTML=`<div class="hero-vial impossible-vial" style="--liqA:${chase.liqA};--liqB:${chase.liqB}"><div class="cap"></div><div class="glass"><div class="liquid"></div><div class="organism">${chase.glyph}</div></div><small>${t.code}</small></div><div><p>${chase.text}</p><div class="kv"><span>RAW INDEX</span><b>₡ ${fmt(chase.base)}</b></div><div class="kv"><span>CGC 10 EST.</span><b class="gold">₡ ${fmt(chase.base*5.2)}</b></div></div>`;
    }
    document.querySelectorAll('.rack-card').forEach((card,i)=>{
      const badge=card.querySelector('.level-rack-badge')||document.createElement('div');
      if(!badge.classList.contains('level-rack-badge')){badge.className='level-rack-badge';card.appendChild(badge)}
      badge.textContent=i===0?'CHEAP • HARD ODDS':i===1?'MID • BETTER ODDS':'EXPENSIVE • BEST ODDS';
    });
  }

  function indexComplete(){return state.discovered.length>=specimens.length&&specimens.length===42}
  let completionShown=false;
  function maybeLevelComplete(){
    if(!indexComplete()||completionShown)return;
    ensureLevelUI();completionShown=true;const t=currentTheme(),final=state.containmentLevel===MAX_LEVEL;
    $('#completeCode').textContent=`${t.code} // 42 OF 42 CATALOGUED`;
    $('#completeTitle').textContent=final?'ALL 20 CONTAINMENT LEVELS COMPLETE':'CONTAINMENT LEVEL COMPLETE';
    $('#completeText').textContent=final?'You completed all 840 specimen entries in VIALBREAK. Level 20 remains open for endgame collecting, grading and market hunting.':'Your credits, tools and every vial you own stay with you. The next level begins at 0/42 with much higher rack prices and much more valuable specimens.';
    $('#completeLevel').textContent=final?`${MAX_LEVEL} / ${MAX_LEVEL}`:`${state.containmentLevel} → ${state.containmentLevel+1}`;
    $('#completeCredits').textContent=`₡${fmt(state.credits)}`;
    $('#advanceLevelBtn').textContent=final?'RETURN TO LEVEL 20':'ENTER LEVEL '+(state.containmentLevel+1);
    $('#levelCompleteOverlay').classList.add('active');
  }

  function advanceLevel(){
    if(state.containmentLevel>=MAX_LEVEL){
      state.gameComplete=true;save();$('#levelCompleteOverlay').classList.remove('active');completionShown=false;toast('🏆 VIALBREAK COMPLETE — Level 20 endgame unlocked.');return;
    }
    if(!state.completedContainmentLevels.includes(state.containmentLevel))state.completedContainmentLevels.push(state.containmentLevel);
    state.containmentLevel++;
    state.discovered=[];
    filter='all';completionShown=false;
    loadCurrentIndex();configureRacks();save();
    $('#levelCompleteOverlay').classList.remove('active');
    renderAll();
    toast(`CONTAINMENT LEVEL ${state.containmentLevel}: ${currentTheme().name}`);
    beep(700,.18,'sine',.06);setTimeout(()=>beep(980,.22,'sine',.05),130);
  }

  loadCurrentIndex();configureRacks();ensureLevelUI();
  const previousRenderAll=renderAll;
  renderAll=function(){configureRacks();previousRenderAll();syncProgressionUI();setTimeout(maybeLevelComplete,80)};
  const previousFinishRack=finishRack;
  finishRack=function(){previousFinishRack();setTimeout(maybeLevelComplete,180)};
  if(typeof commitAndRevealBulk==='function'){
    const previousCommitBulk=commitAndRevealBulk;
    commitAndRevealBulk=function(){previousCommitBulk();setTimeout(maybeLevelComplete,180)};
  }
  renderAll();
})();