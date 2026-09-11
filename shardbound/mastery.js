// VIALBREAK master tool ladder + one-minute market windows.
(function(){
  const MAX_LEVEL=window.VIALBREAK_PROGRESSION?.MAX_LEVEL||50;
  const AUTO_INDEX=14;
  state.autoToolIndex=AUTO_INDEX;

  const toolNames=[
    'Rubber Mallet','Steel Tap Hammer','Bench Cracker','Precision Clamp','Carbide Nibbler',
    'Seal Splitter','Rotary Glass Saw','Pneumatic Snapper','Ultrasonic Fracturer','Laser Score Rig',
    'Cryo Crack Wand','Plasma Seal Cutter','Molecular Tapper','Quantum Splitter','Auto-Cracker X',
    'Auto-Cracker X2','Servo Breach Arm','Dual-Laser Fracturer','Vacuum Snap Array','Nanite Edge Tool',
    'Spectral Crack Beam','Magnetic Seal Peeler','Hyperfine Glass Lance','Phase Tapper','Gravity Crack Press',
    'Chrono Splitter','Photon Fracture Array','Ionic Breach Rail','Zero-Contact Cutter','Quantum Crack Cell',
    'Autonomous Lab Arm','Multi-Vial Robot','Seven-Head Cracker','Neural Crack Bench','Direct-Sort Cracker',
    'Plasma Robot Mk II','Rift Edge Processor','Voidglass Breaker','Reality Shear Tool','Omega Auto Bench',
    'Singularity Crack Arm','Matter-Slip Cutter','Instant Seal Dissolver','Phase-Zero Breacher','Prime Lab Automaton',
    'Apex Fracture Core','Omniseal Breaker','Infinite Crack Array','Reality-Safe Opener','GODFRAME X'
  ];
  const toolEmoji=['🔨','🔨','🗜️','🗜️','⚙️','⚙️','🪚','💨','🔊','⚡','❄️','🔥','🔬','◇','🤖'];
  function toolCost(level){
    if(level===1)return 0;
    const early=[0,2000,8000,25000,75000,220000,650000,1800000,5000000,14000000,40000000,110000000,300000000,650000000,1000000000];
    if(level<=15)return early[level-1];
    return Math.round(1000000000*Math.pow(2.35,level-15));
  }
  const newTools=Array.from({length:MAX_LEVEL},(_,i)=>{
    const level=i+1,auto=level>=15;
    return {id:i,level,name:toolNames[i]||`Containment Tool ${level}`,emoji:toolEmoji[i]||(auto?'🤖':'⚙️'),price:toolCost(level),time:Math.max(55,Math.round(1200*Math.pow(.925,i))),desc:auto?`Level ${level} autonomous crack system. AUTO compatible.`:`Level ${level} manual crack technology.`};
  });
  tools.splice(0,tools.length,...newTools);

  if(state.toolSystemVersion!==3){
    state.tool=Math.min(Math.max(Number(state.tool)||0,0),4);
    state.autoCrack=false;
    state.toolSystemVersion=3;
    save();
  }
  if(state.tool>=tools.length)state.tool=tools.length-1;

  function masteryTool(){return tools[state.tool]||tools[0]}
  tool=masteryTool;

  renderTools=function(){
    const current=tool(),autoReady=state.tool>=AUTO_INDEX;
    $('#currentToolDisplay').innerHTML=`<div class="emoji">${current.emoji}</div><b>${current.name}</b><small>Containment L${current.level} • ${(current.time/1000).toFixed(2)} sec/vial</small><div class="tool-status ${autoReady?'auto-ready':''}">${autoReady?'AUTOMATION CORE INSTALLED':'AUTO-CRACK UNLOCKS AT TOOL 15 • ₡1,000,000,000'}</div>`;
    $('#toolGrid').innerHTML=tools.map((x,i)=>{
      const locked=state.containmentLevel<x.level,currentTool=i===state.tool,passed=i<state.tool,canBuy=!locked&&!currentTool&&!passed&&state.credits>=x.price,auto=x.level>=15;
      const label=currentTool?'EQUIPPED':passed?'REPLACED':locked?`REACH CONTAINMENT ${x.level}`:`BUY • ₡ ${fmt(x.price)}`;
      return `<div class="tool-card ${currentTool?'current':''} ${locked?'tool-locked':''} ${auto?'auto-tier':''}"><div class="tool-level">TOOL ${String(x.level).padStart(2,'0')}</div><div class="emoji">${x.emoji}</div><h3>${x.name}</h3><p>${x.desc}</p><div class="speed">CRACK TIME ${(x.time/1000).toFixed(2)}s</div>${x.level===15?'<div class="billion-badge">AUTO CRACK • ₡1 BILLION</div>':''}<button class="upgrade-btn" data-tool="${i}" ${currentTool||passed||locked||!canBuy?'disabled':''}>${label}</button></div>`;
    }).join('');
    $$('[data-tool]').forEach(b=>b.onclick=()=>buyTool(Number(b.dataset.tool)));
  };

  buyTool=function(i){
    const x=tools[i];if(!x)return;
    if(state.containmentLevel<x.level){toast(`Tool unlocks on Containment Level ${x.level}.`);return}
    if(i<=state.tool){toast('You already passed this tool.');return}
    if(state.credits<x.price){toast(`You need ₡${fmt(x.price)}.`);return}
    state.credits-=x.price;state.tool=i;state.xp+=150+x.level*15;
    if(i<AUTO_INDEX)state.autoCrack=false;
    save();renderAll();toast(`${x.name} installed.`);beep(620,.1,'triangle',.045);
  };

  function marketIds(){
    const ids=new Set(specimens.map(s=>s.id));
    state.inventory.forEach(i=>ids.add(i.specimenId));
    state.returns.forEach(r=>ids.add(r.item.specimenId));
    return [...ids].filter(id=>byId(id));
  }
  tickMarket=function(){
    const ids=marketIds();
    ids.forEach(id=>state.market[id]=.90+Math.random()*.20);
    const ownedIds=[...new Set(state.inventory.map(i=>i.specimenId))];
    const pool=ownedIds.length?ownedIds:ids;
    if(pool.length){
      const hot=pool[Math.floor(Math.random()*pool.length)];
      const perfectSpike=Math.random()<.035;
      const boost=perfectSpike?1.67:1.25+Math.random()*.42;
      state.market[hot]=boost;state.marketHotId=hot;state.marketHotBoost=boost;
    }
    state.marketShiftAt=Date.now();ticker=60;save();renderMarket();
  };

  function movePct(id){return((mult(id)-1)*100)}
  function marketLabel(p){return p>=45?'RARE SPIKE':p>=25?'HOT':p>3?'ABOVE MARKET':p<-3?'BELOW MARKET':'NEAR BASE'}
  renderMarket=function(){
    const header=$('#screen-market .section-head');
    const eye=header?.querySelector('.eyebrow');if(eye)eye.textContent='GREY MARKET // 60-SECOND PRICE WINDOWS';
    const para=header?.querySelector('p');if(para)para.textContent='Prices re-roll once per minute. Most move ±10%; one hot specimen can spike as high as +67%. Wait for green before you sell.';
    const tickerLabel=$('#screen-market .ticker span');if(tickerLabel)tickerLabel.textContent='NEXT SHIFT';
    const hot=byId(state.marketHotId),hotPct=hot?movePct(hot.id):0;
    const boardHeader=$('#screen-market .market-row.header');if(boardHeader)boardHeader.innerHTML='<span>MARKET WINDOW</span><span>STATUS</span><span>BASE</span><span>MOVE</span>';
    const candidates=[...new Set(state.inventory.map(i=>i.specimenId))].map(byId).filter(Boolean).sort((a,b)=>movePct(b.id)-movePct(a.id));
    const rows=candidates.slice(0,14);
    $('#marketRows').innerHTML=`<div class="market-pulse ${hotPct>=45?'rare-spike':''}"><div><small>CURRENT HOT SPECIMEN</small><b>${hot?hot.name:'WAITING FOR MARKET DATA'}</b></div><strong>${hot?`+${hotPct.toFixed(1)}%`:'—'}</strong><span>${hotPct>=66.9?'MAXIMUM 67% SPIKE':hot?'HOLDINGS CAN SELL AT THIS PREMIUM':'MARKET REPRICES EVERY 60 SECONDS'}</span></div>${rows.length?rows.map(s=>{const p=movePct(s.id);return `<div class="market-row market-window-row ${s.id===state.marketHotId?'hot-row':''}"><b>${s.name}</b><span class="${p>=0?'up':'down'}">${marketLabel(p)}</span><span>₡${fmt(s.base)}</span><strong class="${p>=0?'up':'down'}">${p>=0?'+':''}${p.toFixed(1)}%</strong></div>`}).join(''):'<div class="market-empty">Open some vials. The market only highlights specimens you actually own.</div>'}`;
    const inv=state.inventory.slice().sort((a,b)=>valueOf(b)-valueOf(a));
    $('#sellList').innerHTML=inv.length?inv.map(i=>{const s=byId(i.specimenId),p=movePct(s.id);return `<div class="list-item"><div class="thumb" style="--liq:${s.liqA}"></div><div><b>${s.name}${i.grade?` • CGC ${i.grade}`:''}</b><small>${s.rarity}${i.pristine?' • pristine':''} • <span class="${p>=0?'up':'down'}">${p>=0?'+':''}${p.toFixed(1)}% market</span></small></div><button data-sell="${i.uid}">SELL ₡${fmt(valueOf(i))}</button></div>`}).join(''):'<div class="return-box"><small>Your freezer is empty.</small></div>';
  };

  ticker=60;tickMarket();renderAll();
})();