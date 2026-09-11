// VIALBREAK single 0-100 containment progression with 670 unique specimens.
(function(){
  const MAX_CONTAINMENT=100;
  const TOTAL_SPECIMENS=670;
  const original=specimens.map(s=>({...s,containmentIndex:s.id}));
  rank.Apex=7; colors.Apex='#ffcf66';

  // 670 total. Common classes are broad; chase classes stay smaller but achievable.
  const rarityPlan=[
    ['Stable',180],['Oddity',145],['Mutant',120],['Hazard',95],['Black Label',65],['Impossible',45],['Apex',20]
  ];
  const prefixes=[
    'Glass','Velvet','Radio','Copper','Midnight','Static','Paper','Neon','Hollow','Lucky','Crimson','Silver','Ghost','Pocket','Signal','Orbit','Dream','Mirror','Clock','Cinder','Frost','Lunar','Echo','Zero','Violet','Amber','Chrome','Moss','Comet','Marble','Electric','Rust','Bubble','Quartz','Velcro','Solar','Dust','Candy','Ink','Pixel'
  ];
  const suffix={
    Stable:['Culture','Spore','Mite','Fizz','Bloom','Bug','Drip','Mold'],
    Oddity:['Loop','Worm','Echo','Glitch','Hiccup','Jelly','Whisper','Knot'],
    Mutant:['Fever','Crawler','Rash','Swarm','Gremlin','Leech','Plague','Maw'],
    Hazard:['Phantom','Breach','Stalker','Parasite','Wraith','Devourer','Scream','Event'],
    'Black Label':['Protocol','Patient','Anomaly','Shadow','Redaction','Blacksite','Incident','Archive'],
    Impossible:['Paradox','NULL','Yesterday','Singularity','Endsignal','Unnameable','Zero','Omega'],
    Apex:['Crown','Prime','Godcode','Origin','Monarch','Genesis','Absolute','Ascendant']
  };
  const rarityBase={Stable:20,Oddity:65,Mutant:175,Hazard:650,'Black Label':2600,Impossible:18000,Apex:52000};
  const palettes=['#76e6c2','#7fb5ff','#f0c469','#d98cff','#ff8077','#8ee76f','#e8eef0','#68e3ff','#ff9bcb','#a995ff','#f8a35f','#69d6ff','#d6ff80','#ff758f'];
  const darks=['#17483b','#1d3851','#4a3518','#3c214d','#4d2024','#29441e','#394344','#16414a','#4b2239','#30254c','#4a2b18','#16384c','#31401c','#4c1a26'];
  const glyphs=['•','○','△','◇','✦','◉','⌁','Ⅱ','Ω','∅','R','X','▲','◫','∞','404','0²','☾','⚡','…','✚','◎','⌬','✧'];
  const originalsByRarity={};
  original.forEach(s=>(originalsByRarity[s.rarity]||(originalsByRarity[s.rarity]=[])).push(s));

  const catalog=new Map(),all=[],usedNames=new Set();
  let generatedId=1001,absoluteIndex=0;
  rarityPlan.forEach(([rarity,count],ri)=>{
    const originals=originalsByRarity[rarity]||[];
    for(let i=0;i<count;i++){
      absoluteIndex++;
      let s;
      if(i<originals.length){
        s={...originals[i],containmentIndex:absoluteIndex};
      }else{
        const generatedI=i-originals.length;
        const p=prefixes[generatedI%prefixes.length];
        const sf=suffix[rarity][Math.floor(generatedI/prefixes.length)%suffix[rarity].length];
        const series=Math.floor(generatedI/(prefixes.length*suffix[rarity].length))+1;
        let name=`${p} ${sf}`;
        if(series>1)name+=` Mk ${series}`;
        if(usedNames.has(name))name+=` ${String(absoluteIndex).padStart(3,'0')}`;
        const scale=1+(i/(Math.max(1,count-1)))*1.15;
        s={
          id:generatedId++,name,rarity,glyph:glyphs[(absoluteIndex+ri)%glyphs.length],
          base:Math.round(rarityBase[rarity]*scale),
          text:`A fictional ${rarity.toLowerCase()} culture recovered from the VIALBREAK facility. Lab notes report unusual behaviour after the seal is disturbed.`,
          liqA:palettes[absoluteIndex%palettes.length],liqB:darks[absoluteIndex%darks.length],containmentIndex:absoluteIndex
        };
      }
      if(catalog.has(s.id))s.id=generatedId++;
      if(usedNames.has(s.name))s.name+=` ${String(absoluteIndex).padStart(3,'0')}`;
      usedNames.add(s.name);all.push(s);catalog.set(s.id,s);
    }
  });

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
    {id:'starter',name:'BASIC SAMPLE RACK',sub:'LOW COST // STANDARD',price:120,god:.002,odds:'God Rack 1:500',a:'#2a6b50',b:'#102b22',glow:'#75ffad',weights:{Stable:60,Oddity:25,Mutant:10,Hazard:4,'Black Label':.8,Impossible:.18,Apex:.02}},
    {id:'quarantine',name:'ENRICHED RACK',sub:'AFFORDABLE // BETTER',price:300,god:.003,odds:'God Rack 1:333',a:'#2c6573',b:'#142b38',glow:'#70ecff',weights:{Stable:46,Oddity:29,Mutant:16,Hazard:6.5,'Black Label':2,Impossible:.42,Apex:.08}},
    {id:'research',name:'RESEARCH CASE',sub:'MID RANGE // STRONG',price:750,god:.0045,odds:'God Rack 1:222',a:'#66562d',b:'#332a12',glow:'#ffe27a',weights:{Stable:34,Oddity:29,Mutant:20,Hazard:10,'Black Label':5.5,Impossible:1.3,Apex:.2}},
    {id:'blacksite',name:'BLACKSITE CRATE',sub:'EXPENSIVE // RARE HUNT',price:5500,god:.007,odds:'God Rack 1:143',a:'#662f3d',b:'#31151d',glow:'#ff718a',weights:{Stable:22,Oddity:27,Mutant:24,Hazard:15,'Black Label':8.5,Impossible:2.8,Apex:.7}},
    {id:'omega',name:'OMEGA VAULT',sub:'PREMIUM // VERY GOOD',price:13500,god:.01,odds:'God Rack 1:100',a:'#4b356d',b:'#24172f',glow:'#cf86ff',weights:{Stable:13,Oddity:22,Mutant:26,Hazard:20,'Black Label':12.5,Impossible:5.2,Apex:1.3}},
    {id:'apex',name:'APEX ARCHIVE',sub:'CHASE RACK // BEST ODDS',price:30000,god:.015,odds:'God Rack 1:67',a:'#74622b',b:'#2c2410',glow:'#ffe16c',weights:{Stable:7,Oddity:16,Mutant:23,Hazard:23,'Black Label':18,Impossible:10,Apex:3}}
  ];
  racks.splice(0,racks.length,...rackDefs.map(r=>({...r,level:1})));

  boostedWeights=function(base){const w={...base};w.Stable*=.18;w.Oddity*=.55;w.Mutant*=1.25;w.Hazard*=1.8;w['Black Label']*=2.5;w.Impossible*=3.2;w.Apex*=3.8;return w};
  godWeights=function(){return{Stable:0,Oddity:0,Mutant:16,Hazard:34,'Black Label':29,Impossible:16,Apex:5}};
  pull=function(rack,idx){
    const rarity=roll(isGod?godWeights():(idx===6?boostedWeights(rack.weights):rack.weights));
    const pool=specimens.filter(s=>s.rarity===rarity),s=pool[Math.floor(Math.random()*pool.length)];
    return{uid:state.nextUID++,specimenId:s.id,grade:null,pristine:Math.random()<(rank[rarity]>=4?.24:.08),serial:rank[rarity]>=5?Math.floor(1+Math.random()*9999):null};
  };

  function syncContainmentUI(){
    const c=containmentScore(),found=state.discovered.length;
    const lv=$('#level');if(lv)lv.textContent=c;
    const xp=$('#xpLabel');if(xp)xp.textContent=`${found} / ${TOTAL_SPECIMENS} SPECIMENS`;
    const bar=$('#xpBar');if(bar)bar.style.width=`${c}%`;
    const heroEye=document.querySelector('#screen-shop .hero .eyebrow');if(heroEye)heroEye.textContent=`CONTAINMENT ${c}/100 // MASTER FACILITY`;
    const heroP=document.querySelector('#screen-shop .hero p');if(heroP)heroP.innerHTML=`One facility. <b>${TOTAL_SPECIMENS} unique specimens.</b> Every new discovery pushes your Containment score toward 100.`;
    const archiveEye=document.querySelector('#screen-collection .section-head .eyebrow');if(archiveEye)archiveEye.textContent=`MASTER SPECIMEN INDEX // ${found}/${TOTAL_SPECIMENS} FOUND`;
    const archiveP=document.querySelector('#screen-collection .section-head p');if(archiveP)archiveP.textContent='Containment is your percentage completion of the full 670-vial collection. No resets. No floors. No levels.';
    const toolEye=document.querySelector('#screen-tools .toolhero .eyebrow');if(toolEye)toolEye.textContent='CRACK BENCH // CONTAINMENT TOOL PATH';
    const note=document.querySelector('#screen-shop .section-head .note');if(note)note.textContent='6 rack classes • 7 sealed vials • Final Chamber boost';
    const chase=[...specimens].filter(s=>s.rarity==='Apex').sort((a,b)=>b.base-a.base)[0];
    if(chase){const h=document.querySelector('.chase .panel-head h3');if(h)h.textContent=chase.name;const chip=document.querySelector('.chase .chip');if(chip){chip.textContent='APEX';chip.style.color=colors.Apex}const body=document.querySelector('.chasebody');if(body)body.innerHTML=`<div class="hero-vial impossible-vial" style="--liqA:${chase.liqA};--liqB:${chase.liqB}"><div class="cap"></div><div class="glass"><div class="liquid"></div><div class="organism">${chase.glyph}</div></div><small>APEX SAMPLE</small></div><div><p>${chase.text}</p><div class="kv"><span>RAW INDEX</span><b>₡ ${fmt(chase.base)}</b></div><div class="kv"><span>CGC 10 EST.</span><b class="gold">₡ ${fmt(chase.base*5.2)}</b></div></div>`;}
    document.querySelectorAll('.rack-card').forEach((card,i)=>{let badge=card.querySelector('.level-rack-badge');if(!badge){badge=document.createElement('div');badge.className='level-rack-badge';card.appendChild(badge)}badge.textContent=['BASIC','BETTER','STRONG','RARE','PREMIUM','BEST'][i]||'RACK'});
  }

  const baseRenderAll=renderAll;
  renderAll=function(){baseRenderAll();syncContainmentUI()};
  renderAll();save();
})();