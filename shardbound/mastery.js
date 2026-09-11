// VIALBREAK containment-based tools + one-minute market.
(function(){
  const AUTO_INDEX=8;
  state.autoToolIndex=AUTO_INDEX;
  const toolDefs=[
    ['Rubber Mallet','🔨',0,0,1200],
    ['Steel Tap Hammer','🔨',5,800,1000],
    ['Bench Cracker','🗜️',12,2800,820],
    ['Precision Vise','🗜️',20,9000,650],
    ['Rotary Score Cutter','⚙️',30,25000,500],
    ['Ultrasonic Cracker','🔊',40,60000,380],
    ['Laser Seal Cutter','⚡',50,140000,280],
    ['Cryo Splitter','❄️',60,300000,200],
    ['Auto-Cracker X','🤖',70,750000,140],
    ['Twin Servo Cracker','🤖',80,1500000,100],
    ['Lab Robot Mk II','🤖',90,3000000,70],
    ['Instant Breach Array','✦',97,6000000,50],
    ['Plasma Micro-Lance','🔥',98,8500000,42],
    ['Vacuum Seal Splitter','◉',98,12000000,35],
    ['Magnetic Collar Extractor','🧲',99,18000000,28],
    ['Nano Fracture Rig','✧',99,26000000,20],
    ['Singularity Bench','◈',100,40000000,12],
    ['Zero-Time Cracker','∞',100,65000000,6]
  ];
  tools.splice(0,tools.length,...toolDefs.map((x,i)=>({id:i,name:x[0],emoji:x[1],unlock:x[2],price:x[3],time:x[4],desc:i>=AUTO_INDEX?'Autonomous precision cracking, sorting and containment.':'Manual precision cracking tool.'})));
  if(state.toolSystemVersion!==4){state.tool=Math.min(Math.max(Number(state.tool)||0,0),4);state.autoCrack=false;state.toolSystemVersion=4;save()}
  if(state.tool>=tools.length)state.tool=tools.length-1;
  tool=function(){return tools[state.tool]||tools[0]};
  const containment=()=>window.VIALBREAK_PROGRESSION?.containment?.()??Math.min(100,Math.floor((state.discovered.length/770)*100));

  renderTools=function(){
    const current=tool(),c=containment(),autoReady=state.tool>=AUTO_INDEX;
    $('#currentToolDisplay').innerHTML=`<div class="emoji">${current.emoji}</div><b>${current.name}</b><small>Containment ${c}/100 • ${(current.time/1000).toFixed(3)} sec/vial</small><div class="tool-status ${autoReady?'auto-ready':''}">${autoReady?'AUTO CRACK INSTALLED':'AUTO CRACK UNLOCKS AT CONTAINMENT 70'}</div>`;
    $('#toolGrid').innerHTML=tools.map((x,i)=>{const locked=c<x.unlock,currentTool=i===state.tool,passed=i<state.tool,next=i===state.tool+1,canBuy=next&&!locked&&state.credits>=x.price;const label=currentTool?'EQUIPPED':passed?'OWNED':locked?`CONTAINMENT ${x.unlock}`:next?`BUY • ₡ ${fmt(x.price)}`:'BUY PREVIOUS TOOL';return `<div class="tool-card ${currentTool?'current':''} ${locked?'tool-locked':''} ${i>=AUTO_INDEX?'auto-tier':''} ${i>=12?'endgame-tool':''}"><div class="tool-level">CONTAINMENT ${x.unlock}</div><div class="emoji">${x.emoji}</div><h3>${x.name}</h3><p>${x.desc}</p><div class="speed">CRACK TIME ${(x.time/1000).toFixed(3)}s</div>${i===AUTO_INDEX?'<div class="billion-badge">AUTO CRACK • ₡750,000</div>':''}${i>=12?'<div class="billion-badge">ENDGAME LAB TECH</div>':''}<button class="upgrade-btn" data-tool="${i}" ${!canBuy?'disabled':''}>${label}</button></div>`}).join('');
    $$('[data-tool]').forEach(b=>b.onclick=()=>buyTool(Number(b.dataset.tool)));
  };
  buyTool=function(i){const x=tools[i],c=containment();if(!x)return;if(i!==state.tool+1){toast('Buy the next tool in the chain first.');return}if(c<x.unlock){toast(`Reach Containment ${x.unlock}/100 first.`);return}if(state.credits<x.price){toast(`You need ₡${fmt(x.price)}.`);return}state.credits-=x.price;state.tool=i;state.xp+=150;if(i<AUTO_INDEX)state.autoCrack=false;save();renderAll();toast(`${x.name} installed.`);beep(620,.1,'triangle',.045)};

  function marketIds(){const ids=new Set(specimens.map(s=>s.id));state.inventory.forEach(i=>ids.add(i.specimenId));state.returns.forEach(r=>ids.add(r.item.specimenId));return[...ids].filter(id=>byId(id))}
  tickMarket=function(){const ids=marketIds();ids.forEach(id=>state.market[id]=.95+Math.random()*.20);const owned=[...new Set(state.inventory.map(i=>i.specimenId))];const pool=owned.length?owned:ids;if(pool.length){const hot=pool[Math.floor(Math.random()*pool.length)],boost=1.25+Math.random()*.42;state.market[hot]=boost;state.marketHotId=hot;state.marketHotBoost=boost}state.marketShiftAt=Date.now();ticker=60;save();renderMarket()};
  const movePct=id=>(mult(id)-1)*100;
  const marketLabel=p=>p>=55?'RARE SPIKE':p>=20?'HOT':p>3?'ABOVE MARKET':p<-3?'BELOW MARKET':'NEAR BASE';
  renderMarket=function(){const header=$('#screen-market .section-head'),eye=header?.querySelector('.eyebrow'),para=header?.querySelector('p');if(eye)eye.textContent='GREY MARKET // 60-SECOND PRICE WINDOWS';if(para)para.textContent='Most prices move roughly -5% to +15%. One hot specimen can jump as high as +67%. Waiting for a green window can pay.';const tl=$('#screen-market .ticker span');if(tl)tl.textContent='NEXT SHIFT';const hot=byId(state.marketHotId),hotPct=hot?movePct(hot.id):0,board=$('#screen-market .market-row.header');if(board)board.innerHTML='<span>SPECIMEN</span><span>STATUS</span><span>BASE</span><span>MOVE</span>';const candidates=[...new Set(state.inventory.map(i=>i.specimenId))].map(byId).filter(Boolean).sort((a,b)=>movePct(b.id)-movePct(a.id));$('#marketRows').innerHTML=`<div class="market-pulse ${hotPct>=55?'rare-spike':''}"><div><small>HOT SPECIMEN THIS MINUTE</small><b>${hot?hot.name:'WAITING FOR DATA'}</b></div><strong>${hot?`+${hotPct.toFixed(1)}%`:'—'}</strong><span>${hot?'SELL NOW OR WAIT FOR THE NEXT 60-SECOND WINDOW':'OPEN VIALS TO START TRADING'}</span></div>${candidates.slice(0,14).map(s=>{const p=movePct(s.id);return `<div class="market-row market-window-row ${s.id===state.marketHotId?'hot-row':''}"><b>${s.name}</b><span class="${p>=0?'up':'down'}">${marketLabel(p)}</span><span>₡${fmt(s.base)}</span><strong class="${p>=0?'up':'down'}">${p>=0?'+':''}${p.toFixed(1)}%</strong></div>`}).join('')}`;const inv=state.inventory.slice().sort((a,b)=>valueOf(b)-valueOf(a));$('#sellList').innerHTML=inv.length?inv.map(i=>{const s=byId(i.specimenId),p=movePct(s.id);return `<div class="list-item"><div class="thumb" style="--liq:${s.liqA}"></div><div><b>${s.name}${i.grade?` • CGC ${i.grade}`:''}</b><small>${s.rarity}${i.pristine?' • pristine':''} • <span class="${p>=0?'up':'down'}">${p>=0?'+':''}${p.toFixed(1)}% market</span></small></div><button data-sell="${i.uid}">SELL ₡${fmt(valueOf(i))}</button></div>`}).join(''):'<div class="return-box"><small>Your freezer is empty.</small></div>'};
  ticker=60;tickMarket();renderAll();
})();