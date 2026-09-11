// VIALBREAK single 0-100 containment progression with 10,000 unique specimens.
(function(){
  const MAX_CONTAINMENT=100;
  const TOTAL_SPECIMENS=10000;
  const original=specimens.map(s=>({...s,containmentIndex:s.id}));

  rank.Apex=7; colors.Apex='#ffcf66';
  rank.Relic=8; colors.Relic='#65f5ff';
  rank.Singularity=9; colors.Singularity='#fff3a8';
  rank.Mythic=10; colors.Mythic='#ff7df6';
  rank.Paradox=11; colors.Paradox='#ff7658';
  rank.Origin=12; colors.Origin='#ffffff';

  // IMPORTANT: this is the exact original 670-specimen generator so existing saves keep their identities.
  const legacyPlan=[['Stable',180],['Oddity',145],['Mutant',120],['Hazard',95],['Black Label',65],['Impossible',45],['Apex',20]];
  const legacyPrefixes=['Glass','Velvet','Radio','Copper','Midnight','Static','Paper','Neon','Hollow','Lucky','Crimson','Silver','Ghost','Pocket','Signal','Orbit','Dream','Mirror','Clock','Cinder','Frost','Lunar','Echo','Zero','Violet','Amber','Chrome','Moss','Comet','Marble','Electric','Rust','Bubble','Quartz','Velcro','Solar','Dust','Candy','Ink','Pixel'];
  const suffix={
    Stable:['Culture','Spore','Mite','Fizz','Bloom','Bug','Drip','Mold'],
    Oddity:['Loop','Worm','Echo','Glitch','Hiccup','Jelly','Whisper','Knot'],
    Mutant:['Fever','Crawler','Rash','Swarm','Gremlin','Leech','Plague','Maw'],
    Hazard:['Phantom','Breach','Stalker','Parasite','Wraith','Devourer','Scream','Event'],
    'Black Label':['Protocol','Patient','Anomaly','Shadow','Redaction','Blacksite','Incident','Archive'],
    Impossible:['Paradox','NULL','Yesterday','Singularity','Endsignal','Unnameable','Zero','Omega'],
    Apex:['Crown','Prime','Godcode','Origin','Monarch','Genesis','Absolute','Ascendant'],
    Relic:['Relic','Artifact','Vault','Glyph','Shard','Engine','Cipher','Core','Beacon','Monolith'],
    Singularity:['Event Horizon','Godseed','Final Form','Worldline','Infinity','Prime Zero','Last Light','Absolute Null','Creation','Endstate'],
    Mythic:['Throne','Seraph','Crownfire','Eternity','Oracle','Titan','Heavenfall','Starheart'],
    Paradox:['Loopbreak','Contradiction','Elsewhen','Neverwas','Double Zero','Time Scar','False Origin','Broken Law'],
    Origin:['First Light','Prime Seed','Beginning','Source Code','Alpha Core','Creation Key','Genesis Root','Before Time']
  };
  const rarityBase={Stable:20,Oddity:65,Mutant:175,Hazard:650,'Black Label':2600,Impossible:18000,Apex:52000,Relic:110000,Singularity:240000,Mythic:520000,Paradox:1200000,Origin:3000000};
  const legacyPalettes=['#76e6c2','#7fb5ff','#f0c469','#d98cff','#ff8077','#8ee76f','#e8eef0','#68e3ff','#ff9bcb','#a995ff','#f8a35f','#69d6ff','#d6ff80','#ff758f'];
  const legacyDarks=['#17483b','#1d3851','#4a3518','#3c214d','#4d2024','#29441e','#394344','#16414a','#4b2239','#30254c','#4a2b18','#16384c','#31401c','#4c1a26'];
  const legacyGlyphs=['•','○','△','◇','✦','◉','⌁','Ⅱ','Ω','∅','R','X','▲','◫','∞','404','0²','☾','⚡','…','✚','◎','⌬','✧'];
  const originalsByRarity={};
  original.forEach(s=>(originalsByRarity[s.rarity]||(originalsByRarity[s.rarity]=[])).push(s));

  const catalog=new Map(),all=[],usedNames=new Set();
  let generatedId=1001,absoluteIndex=0;

  // Build the original 670 exactly as before.
  legacyPlan.forEach(([rarity,count],ri)=>{
    const originals=originalsByRarity[rarity]||[];
    for(let i=0;i<count;i++){
      absoluteIndex++;
      let s;
      if(i<originals.length){
        s={...originals[i],containmentIndex:absoluteIndex};
      }else{
        const generatedI=i-originals.length;
        const p=legacyPrefixes[generatedI%legacyPrefixes.length];
        const sf=suffix[rarity][Math.floor(generatedI/legacyPrefixes.length)%suffix[rarity].length];
        const series=Math.floor(generatedI/(legacyPrefixes.length*suffix[rarity].length))+1;
        let name=`${p} ${sf}`;
        if(series>1)name+=` Mk ${series}`;
        if(usedNames.has(name))name+=` ${String(absoluteIndex).padStart(3,'0')}`;
        const scale=1+(i/(Math.max(1,count-1)))*1.15;
        s={id:generatedId++,name,rarity,glyph:legacyGlyphs[(absoluteIndex+ri)%legacyGlyphs.length],base:Math.round(rarityBase[rarity]*scale),text:`A fictional ${rarity.toLowerCase()} culture recovered from the VIALBREAK facility. Lab notes report unusual behaviour after the seal is disturbed.`,liqA:legacyPalettes[absoluteIndex%legacyPalettes.length],liqB:legacyDarks[absoluteIndex%legacyDarks.length],containmentIndex:absoluteIndex};
      }
      if(catalog.has(s.id))s.id=generatedId++;
      if(usedNames.has(s.name))s.name+=` ${String(absoluteIndex).padStart(3,'0')}`;
      usedNames.add(s.name);all.push(s);catalog.set(s.id,s);
    }
  });

  // First 100 expansion specimens: 60 Relic + 40 Singularity.
  const expansionPrefixes=['Ion','Prism','Halo','Cipher','Titan','Nova','Aether','Obsidian','Aurora','Vector','Cobalt','Helix','Carbon','Spectral','Polar','Crown','Phase','Radiant','Deep','Prime'];
  const expansionPalettes=['#54f4ff','#fff0a4','#b7fff7','#ffd86e','#ff83ed','#7ee7ff','#c2ffef','#ffb46f','#8fffc9','#c4a4ff'];
  const expansionDarks=['#113a45','#4a3a10','#1a3f3b','#51450f','#4a1645','#12394a','#164138','#4d2d10','#16412f','#30234e'];
  const expansionGlyphs=['◈','✺','⊙','⌘','⟁','◬','✹','⊚','⌖','✵','⧫','⊕'];
  function addGenerated(rarity,count,seriesOffset=0){
    const startWithin=all.filter(s=>s.rarity===rarity).length;
    for(let n=0;n<count;n++){
      absoluteIndex++;
      const idx=startWithin+n+seriesOffset;
      const p=expansionPrefixes[(idx+rank[rarity])%expansionPrefixes.length];
      const sf=suffix[rarity][Math.floor(idx/expansionPrefixes.length)%suffix[rarity].length];
      const series=Math.floor(idx/(expansionPrefixes.length*suffix[rarity].length))+1;
      let name=`${p} ${sf}${series>1?` // ${series}`:''}`;
      if(usedNames.has(name))name+=` ${String(absoluteIndex).padStart(5,'0')}`;
      const withinRatio=(n+1)/(count+1);
      const scale=1+withinRatio*1.8;
      const s={id:generatedId++,name,rarity,glyph:expansionGlyphs[(absoluteIndex+rank[rarity])%expansionGlyphs.length],base:Math.round(rarityBase[rarity]*scale),text:`A fictional ${rarity.toLowerCase()} specimen catalogued by VIALBREAK research. Its containment record is classified pending further observation.`,liqA:expansionPalettes[absoluteIndex%expansionPalettes.length],liqB:expansionDarks[absoluteIndex%expansionDarks.length],containmentIndex:absoluteIndex};
      usedNames.add(name);all.push(s);catalog.set(s.id,s);
    }
  }
  addGenerated('Relic',60);
  addGenerated('Singularity',40);

  // 9,230 more specimens, balanced across all tiers so the huge index is still collectible.
  const megaPlan=[
    ['Stable',2200],['Oddity',1700],['Mutant',1400],['Hazard',1150],['Black Label',900],['Impossible',650],['Apex',450],['Relic',300],['Singularity',200],['Mythic',140],['Paradox',90],['Origin',50]
  ];
  megaPlan.forEach(([rarity,count],i)=>addGenerated(rarity,count,(i+1)*137));

  const validIds=new Set(all.map(s=>s.id));
  function normalizeLegacyId(id){
    id=Number(id);if(validIds.has(id))return id;
    if(id>=1&&id<=42&&catalog.has(id))return id;
    const idx=Math.abs(id||1)%all.length;return all[idx].id;
  }
  state.inventory.forEach(i=>i.specimenId=normalizeLegacyId(i.specimenId));
  state.returns.forEach(r=>r.item.specimenId=normalizeLegacyId(r.item.specimenId));
  state.discovered=[...new Set((state.discovered||[]).map(normalizeLegacyId).filter(id=>validIds.has(id)))];
  if(state.bestPull)state.bestPull=normalizeLegacyId(state.bestPull);

  specimens.splice(0,specimens.length,...all);
  const originalById=byId;
  byId=function(id){return catalog.get(Number(id))||originalById(id)};
  const containmentScore=()=>Math.min(100,Math.floor((state.discovered.length/TOTAL_SPECIMENS)*100));
  window.VIALBREAK_PROGRESSION={MAX_CONTAINMENT,TOTAL_SPECIMENS,containment:containmentScore,catalog};
  state.containmentLevel=1;state.gameComplete=false;

  const rackDefs=[
    {id:'starter',name:'BASIC SAMPLE RACK',sub:'LOW COST // STANDARD',price:120,god:.002,odds:'God Rack 1:500',a:'#2a6b50',b:'#102b22',glow:'#75ffad',weights:{Stable:60,Oddity:25,Mutant:10,Hazard:4,'Black Label':.8,Impossible:.18,Apex:.02,Relic:.004,Singularity:.001,Mythic:.0004,Paradox:.00015,Origin:.00005}},
    {id:'quarantine',name:'ENRICHED RACK',sub:'AFFORDABLE // BETTER',price:300,god:.003,odds:'God Rack 1:333',a:'#2c6573',b:'#142b38',glow:'#70ecff',weights:{Stable:46,Oddity:29,Mutant:16,Hazard:6.5,'Black Label':2,Impossible:.42,Apex:.08,Relic:.018,Singularity:.005,Mythic:.002,Paradox:.0007,Origin:.0003}},
    {id:'research',name:'RESEARCH CASE',sub:'MID RANGE // STRONG',price:750,god:.0045,odds:'God Rack 1:222',a:'#66562d',b:'#332a12',glow:'#ffe27a',weights:{Stable:34,Oddity:29,Mutant:20,Hazard:10,'Black Label':5.5,Impossible:1.3,Apex:.2,Relic:.06,Singularity:.018,Mythic:.008,Paradox:.003,Origin:.001}},
    {id:'blacksite',name:'BLACKSITE CRATE',sub:'EXPENSIVE // RARE HUNT',price:5500,god:.007,odds:'God Rack 1:143',a:'#662f3d',b:'#31151d',glow:'#ff718a',weights:{Stable:22,Oddity:27,Mutant:24,Hazard:15,'Black Label':8.5,Impossible:2.8,Apex:.7,Relic:.22,Singularity:.08,Mythic:.035,Paradox:.014,Origin:.006}},
    {id:'omega',name:'OMEGA VAULT',sub:'PREMIUM // VERY GOOD',price:13500,god:.01,odds:'God Rack 1:100',a:'#4b356d',b:'#24172f',glow:'#cf86ff',weights:{Stable:13,Oddity:22,Mutant:26,Hazard:20,'Black Label':12.5,Impossible:5.2,Apex:1.3,Relic:.55,Singularity:.22,Mythic:.1,Paradox:.045,Origin:.02}},
    {id:'apex',name:'APEX ARCHIVE',sub:'CHASE RACK // BEST ODDS',price:30000,god:.015,odds:'God Rack 1:67',a:'#74622b',b:'#2c2410',glow:'#ffe16c',weights:{Stable:7,Oddity:16,Mutant:23,Hazard:23,'Black Label':18,Impossible:10,Apex:3,Relic:1.2,Singularity:.55,Mythic:.28,Paradox:.13,Origin:.06}}
  ];
  racks.splice(0,racks.length,...rackDefs.map(r=>({...r,level:1})));

  boostedWeights=function(base){const w={...base};w.Stable*=.18;w.Oddity*=.55;w.Mutant*=1.25;w.Hazard*=1.8;w['Black Label']*=2.5;w.Impossible*=3.2;w.Apex*=3.8;w.Relic=(w.Relic||0)*4.5;w.Singularity=(w.Singularity||0)*5.2;w.Mythic=(w.Mythic||0)*5.8;w.Paradox=(w.Paradox||0)*6.5;w.Origin=(w.Origin||0)*7.2;return w};
  godWeights=function(){return{Stable:0,Oddity:0,Mutant:12,Hazard:27,'Black Label':25,Impossible:17,Apex:9,Relic:5.2,Singularity:2.7,Mythic:1.3,Paradox:.6,Origin:.2}};
  pull=function(rack,idx){
    const rarity=roll(isGod?godWeights():(idx===6?boostedWeights(rack.weights):rack.weights));
    const pool=specimens.filter(s=>s.rarity===rarity),s=pool[Math.floor(Math.random()*pool.length)];
    return{uid:state.nextUID++,specimenId:s.id,grade:null,pristine:Math.random()<(rank[rarity]>=4?.24:.08),serial:rank[rarity]>=5?Math.floor(1+Math.random()*99999):null};
  };

  // A 10,000-card DOM would be painfully slow. Render the index in fast pages of 84.
  let indexPage=1,indexSearch='';
  const PAGE_SIZE=84;
  function ensureIndexControls(){
    const grid=$('#collectionGrid');if(!grid||document.getElementById('indexControls'))return;
    const controls=document.createElement('div');controls.id='indexControls';controls.className='index-controls';
    controls.innerHTML=`<div class="index-search"><input id="indexSearch" type="search" placeholder="Search 10,000 specimens…" autocomplete="off"><span id="indexResultCount"></span></div><div class="index-pages"><button id="indexPrev">← PREV</button><b id="indexPageLabel">PAGE 1</b><button id="indexNext">NEXT →</button></div>`;
    grid.parentNode.insertBefore(controls,grid);
    $('#indexSearch').addEventListener('input',e=>{indexSearch=e.target.value.trim().toLowerCase();indexPage=1;renderCollection()});
    $('#indexPrev').onclick=()=>{if(indexPage>1){indexPage--;renderCollection();document.getElementById('screen-collection')?.scrollTo?.(0,0)}};
    $('#indexNext').onclick=()=>{indexPage++;renderCollection();document.getElementById('screen-collection')?.scrollTo?.(0,0)};
  }
  renderCollection=function(){
    ensureIndexControls();
    const discovered=new Set(state.discovered||[]),ownedMap=new Map();
    for(const item of state.inventory){if(!ownedMap.has(item.specimenId))ownedMap.set(item.specimenId,[]);ownedMap.get(item.specimenId).push(item)}
    let list=specimens.filter(s=>{
      const o=ownedMap.get(s.id)||[];
      if(filter==='owned'&&!o.length)return false;
      if(filter==='graded'&&!o.some(i=>i.grade))return false;
      if(filter==='Hazard'&&rank[s.rarity]<4)return false;
      if(indexSearch&&!(`${s.name} ${s.rarity} ${s.id}`.toLowerCase().includes(indexSearch)))return false;
      return true;
    });
    const pages=Math.max(1,Math.ceil(list.length/PAGE_SIZE));indexPage=Math.min(Math.max(1,indexPage),pages);
    const start=(indexPage-1)*PAGE_SIZE,page=list.slice(start,start+PAGE_SIZE);
    const rc=$('#indexResultCount');if(rc)rc.textContent=`${list.length.toLocaleString()} RESULTS`;
    const pl=$('#indexPageLabel');if(pl)pl.textContent=`PAGE ${indexPage.toLocaleString()} / ${pages.toLocaleString()}`;
    const prev=$('#indexPrev'),next=$('#indexNext');if(prev)prev.disabled=indexPage<=1;if(next)next.disabled=indexPage>=pages;
    $('#collectionGrid').innerHTML=page.map(s=>{const o=ownedMap.get(s.id)||[];if(!discovered.has(s.id))return `<div class="specimen-slot unknown"><div><b>?</b><div class="eyebrow">VB-${String(s.id).padStart(5,'0')} // UNKNOWN</div></div></div>`;const best=o.slice().sort((a,b)=>valueOf(b)-valueOf(a))[0];return `<div class="specimen-slot" data-inspect="${s.id}">${o.length?`<span class="owned-count">×${o.length}</span>`:''}${specimenCard(s,best||null)}</div>`}).join('');
    $$('[data-inspect]').forEach(e=>e.onclick=()=>inspect(Number(e.dataset.inspect)));
  };

  function syncContainmentUI(){
    const c=containmentScore(),found=state.discovered.length;
    const lv=$('#level');if(lv)lv.textContent=c;
    const xp=$('#xpLabel');if(xp)xp.textContent=`${found.toLocaleString()} / ${TOTAL_SPECIMENS.toLocaleString()} SPECIMENS`;
    const bar=$('#xpBar');if(bar)bar.style.width=`${c}%`;
    const heroEye=document.querySelector('#screen-shop .hero .eyebrow');if(heroEye)heroEye.textContent=`CONTAINMENT ${c}/100 // MASTER FACILITY`;
    const heroP=document.querySelector('#screen-shop .hero p');if(heroP)heroP.innerHTML=`One facility. <b>${TOTAL_SPECIMENS.toLocaleString()} unique specimens.</b> Every new discovery pushes your Containment score toward 100.`;
    const archiveEye=document.querySelector('#screen-collection .section-head .eyebrow');if(archiveEye)archiveEye.textContent=`MASTER SPECIMEN INDEX // ${found.toLocaleString()}/${TOTAL_SPECIMENS.toLocaleString()} FOUND`;
    const archiveP=document.querySelector('#screen-collection .section-head p');if(archiveP)archiveP.textContent='Containment is your percentage completion of the full 10,000-vial collection. Search and page through the archive without loading every card at once.';
    const toolEye=document.querySelector('#screen-tools .toolhero .eyebrow');if(toolEye)toolEye.textContent='CRACK BENCH // CONTAINMENT TOOL PATH';
    const note=document.querySelector('#screen-shop .section-head .note');if(note)note.textContent='6 rack classes • 7 sealed vials • Final Chamber boost • 12 rarity classes';
    const chase=[...specimens].filter(s=>s.rarity==='Origin').sort((a,b)=>b.base-a.base)[0];
    if(chase){const h=document.querySelector('.chase .panel-head h3');if(h)h.textContent=chase.name;const chip=document.querySelector('.chase .chip');if(chip){chip.textContent='ORIGIN';chip.style.color=colors.Origin}const body=document.querySelector('.chasebody');if(body)body.innerHTML=`<div class="hero-vial impossible-vial singularity-vial" style="--liqA:${chase.liqA};--liqB:${chase.liqB}"><div class="cap"></div><div class="glass"><div class="liquid"></div><div class="organism">${chase.glyph}</div></div><small>ORIGIN SAMPLE</small></div><div><p>${chase.text}</p><div class="kv"><span>RAW INDEX</span><b>₡ ${fmt(chase.base)}</b></div><div class="kv"><span>CGC 10 EST.</span><b class="gold">₡ ${fmt(chase.base*5.2)}</b></div></div>`;}
    document.querySelectorAll('.rack-card').forEach((card,i)=>{let badge=card.querySelector('.level-rack-badge');if(!badge){badge=document.createElement('div');badge.className='level-rack-badge';card.appendChild(badge)}badge.textContent=['BASIC','BETTER','STRONG','RARE','PREMIUM','BEST'][i]||'RACK'});
  }

  const baseRenderAll=renderAll;
  renderAll=function(){baseRenderAll();syncContainmentUI()};
  renderAll();save();
})();