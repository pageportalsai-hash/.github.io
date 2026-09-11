// Premium rack prices + smoother VIALBREAK economy + Credit Ladder chase vials.
(function(){
  const tunedPrices={starter:120,quarantine:300,research:750,blacksite:5500,omega:13500,apex:30000};
  racks.forEach(r=>{if(tunedPrices[r.id]!=null)r.price=tunedPrices[r.id]});

  // Make ordinary pulls useful money instead of forcing players to wait for jackpots.
  const valueBoost={Stable:1.50,Oddity:1.45,Mutant:1.35,Hazard:1.25,'Black Label':1.15,Impossible:1.05,Apex:1,Relic:1,Singularity:1,Mythic:1,Paradox:1,Origin:1};
  specimens.forEach(s=>{s.base=Math.round(s.base*(valueBoost[s.rarity]||1))});

  // Eight exact-value specimens hidden inside the 10,000-vial index. We reuse late expansion IDs,
  // so the total stays exactly 10,000 and legacy 670-specimen saves are untouched.
  const ladder=[
    {rarity:'Stable',value:100,name:'Credit Culture // 100',glyph:'₡',a:'#88dfbd',b:'#245b48'},
    {rarity:'Oddity',value:1000,name:'Credit Echo // 1K',glyph:'1K',a:'#77efa7',b:'#22653d'},
    {rarity:'Mutant',value:10000,name:'Vault Strain // 10K',glyph:'10K',a:'#68dfff',b:'#22506e'},
    {rarity:'Hazard',value:100000,name:'Breach Reserve // 100K',glyph:'100K',a:'#ffe06d',b:'#725716'},
    {rarity:'Black Label',value:1000000,name:'Blackbox Million',glyph:'1M',a:'#ff7189',b:'#741d32'},
    {rarity:'Impossible',value:10000000,name:'Ten-Million Paradox',glyph:'10M',a:'#d97dff',b:'#5a2385'},
    {rarity:'Mythic',value:100000000,name:'Hundred-Million Crown',glyph:'100M',a:'#ff8af7',b:'#74266f'},
    {rarity:'Origin',value:1000000000,name:'Billion Credit Origin',glyph:'1B',a:'#fff2a9',b:'#7a6421'}
  ];
  const reserved=new Set();
  function lateSpecimen(rarity){
    for(let i=specimens.length-1;i>=0;i--){const s=specimens[i];if(!reserved.has(s.id)&&s.rarity===rarity&&Number(s.containmentIndex)>770){reserved.add(s.id);return s}}
    for(let i=specimens.length-1;i>=0;i--){const s=specimens[i];if(!reserved.has(s.id)&&s.rarity===rarity){reserved.add(s.id);return s}}
    return null;
  }
  ladder.forEach((d,i)=>{
    const s=lateSpecimen(d.rarity);if(!s)return;
    Object.assign(s,{name:d.name,base:d.value,glyph:d.glyph,liqA:d.a,liqB:d.b,valueLadder:true,valueTier:i+1,text:`CREDIT LADDER ${i+1}/8. A fictional sealed VIALBREAK reserve specimen with an exact raw index of ₡${fmt(d.value)}.`});
  });
  window.VIALBREAK_CREDIT_LADDER=ladder;

  // Visually flag ladder specimens anywhere specimenCard is used.
  const economySpecimenCard=specimenCard;
  specimenCard=function(s,item=null){
    let html=economySpecimenCard(s,item);
    if(s?.valueLadder){
      html=html.replace('class="specimen-card"','class="specimen-card value-ladder-card"');
      html=html.replace('>','><div class="credit-ladder-badge">CREDIT LADDER • '+String(s.valueTier).padStart(2,'0')+'/08 • RAW ₡'+fmt(s.base)+'</div>');
    }
    return html;
  };
  const st=document.createElement('style');st.textContent=`
    .value-ladder-card{border-color:#f5d96d!important;box-shadow:inset 0 1px #fff2,0 0 0 1px #f5d96d22,0 18px 38px #0008!important}
    .credit-ladder-badge{margin:7px 9px 0;padding:5px 7px;border:1px solid #f5d96d88;border-radius:6px;background:linear-gradient(90deg,#4f4219cc,#17150bcc);color:#ffe788;font-size:6px;font-weight:900;letter-spacing:.8px;text-align:center}
    .index-controls{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:14px 0 18px;padding:12px;border:1px solid #264a3e;border-radius:12px;background:#08130f}
    .index-search{display:flex;align-items:center;gap:10px;flex:1}.index-search input{width:min(460px,100%);padding:10px 12px;border:1px solid #31584a;border-radius:9px;background:#030806;color:#e7fff5;outline:none}.index-search input:focus{border-color:#75e9bc}.index-search span{font-size:7px;color:#78958a;letter-spacing:1px;white-space:nowrap}
    .index-pages{display:flex;align-items:center;gap:9px}.index-pages button{padding:8px 11px;border:1px solid #31584a;border-radius:8px;background:#0b1a15;color:#dff9ef;font-size:7px;font-weight:900;letter-spacing:.7px}.index-pages button:disabled{opacity:.3}.index-pages b{min-width:110px;text-align:center;font-size:8px;color:#a8c9bc}
    @media(max-width:720px){.index-controls{align-items:stretch;flex-direction:column}.index-search{flex-direction:column;align-items:stretch}.index-pages{justify-content:space-between}}
  `;document.head.appendChild(st);

  // First-time discoveries pay a research grant so keeping a new vial does not stop progression.
  const discoveryGrant={Stable:20,Oddity:45,Mutant:90,Hazard:220,'Black Label':650,Impossible:1800,Apex:4500,Relic:9000,Singularity:20000,Mythic:40000,Paradox:100000,Origin:250000};
  function payDiscoveryGrants(before){
    const fresh=(state.discovered||[]).filter(id=>!before.has(id));
    if(!fresh.length)return 0;
    const grant=fresh.reduce((sum,id)=>sum+(discoveryGrant[byId(id)?.rarity]||20),0);
    state.credits+=grant;
    if(!Array.isArray(state.economyMilestonesClaimed))state.economyMilestonesClaimed=[];
    const containment=window.VIALBREAK_PROGRESSION?.containment?.()??Math.min(100,Math.floor((state.discovered.length/Math.max(1,specimens.length))*100));
    let milestoneBonus=0;
    for(let m=5;m<=containment;m+=5){if(!state.economyMilestonesClaimed.includes(m)){state.economyMilestonesClaimed.push(m);milestoneBonus+=m*100}}
    state.credits+=milestoneBonus;save();renderStats();
    const total=grant+milestoneBonus;if(total>0)toast(`Research funding +₡${fmt(total)}${milestoneBonus?' • Containment bonus included':''}`);return total;
  }

  if(typeof finishRack==='function'){
    const economyFinishRack=finishRack;
    finishRack=function(){const before=new Set(state.discovered||[]);economyFinishRack();payDiscoveryGrants(before)};
  }
  if(typeof commitAndRevealBulk==='function'){
    const economyBulk=commitAndRevealBulk;
    commitAndRevealBulk=function(){if(!bulkPending||bulkPending.committed)return economyBulk();const before=new Set(state.discovered||[]);economyBulk();payDiscoveryGrants(before)};
  }

  // Friendlier 60-second market: ordinary windows are -5% to +15%, with the same +67% hot spike ceiling.
  tickMarket=function(){
    // Avoid writing 10,000 market records every minute. Only price owned / returned specimens,
    // plus a small rotating sample used by the market board.
    const ids=new Set();state.inventory.forEach(i=>ids.add(i.specimenId));state.returns.forEach(r=>ids.add(r.item.specimenId));
    for(let i=0;i<120;i++){const s=specimens[Math.floor(Math.random()*specimens.length)];if(s)ids.add(s.id)}
    const valid=[...ids].filter(id=>byId(id));valid.forEach(id=>state.market[id]=.95+Math.random()*.20);
    const owned=[...new Set(state.inventory.map(i=>i.specimenId))].filter(id=>byId(id));const pool=owned.length?owned:valid;
    if(pool.length){const hot=pool[Math.floor(Math.random()*pool.length)],boost=1.25+Math.random()*.42;state.market[hot]=boost;state.marketHotId=hot;state.marketHotBoost=boost}
    state.marketShiftAt=Date.now();ticker=60;save();renderMarket();
  };

  const nav=document.querySelector('[data-screen="collection"] small');if(nav)nav.textContent='10,000-vial master index';
  const side=document.querySelector('.sidecard p');if(side)side.innerHTML='The facility holds <b>10,000 unique specimens across 12 rarity classes</b>, including 8 Credit Ladder chase vials from ₡100 to ₡1,000,000,000.';
  renderAll();
})();