// Premium rack prices + smoother VIALBREAK economy.
(function(){
  const tunedPrices={
    starter:120,
    quarantine:300,
    research:750,
    blacksite:5500,
    omega:13500,
    apex:30000
  };
  racks.forEach(r=>{if(tunedPrices[r.id]!=null)r.price=tunedPrices[r.id]});

  // Make ordinary pulls useful money instead of forcing players to wait for jackpots.
  const valueBoost={
    Stable:1.50,
    Oddity:1.45,
    Mutant:1.35,
    Hazard:1.25,
    'Black Label':1.15,
    Impossible:1.05,
    Apex:1.00
  };
  specimens.forEach(s=>{s.base=Math.round(s.base*(valueBoost[s.rarity]||1))});

  // First-time discoveries pay a research grant so keeping a new vial does not stop progression.
  const discoveryGrant={Stable:20,Oddity:45,Mutant:90,Hazard:220,'Black Label':650,Impossible:1800,Apex:4500};
  function payDiscoveryGrants(before){
    const fresh=(state.discovered||[]).filter(id=>!before.has(id));
    if(!fresh.length)return 0;
    const grant=fresh.reduce((sum,id)=>sum+(discoveryGrant[byId(id)?.rarity]||20),0);
    state.credits+=grant;
    if(!Array.isArray(state.economyMilestonesClaimed))state.economyMilestonesClaimed=[];
    const containment=Math.min(100,Math.floor((state.discovered.length/Math.max(1,specimens.length))*100));
    let milestoneBonus=0;
    for(let m=5;m<=containment;m+=5){
      if(!state.economyMilestonesClaimed.includes(m)){
        state.economyMilestonesClaimed.push(m);
        milestoneBonus+=m*100;
      }
    }
    state.credits+=milestoneBonus;
    save();renderStats();
    const total=grant+milestoneBonus;
    if(total>0)toast(`Research funding +₡${fmt(total)}${milestoneBonus?` • Containment bonus included`:''}`);
    return total;
  }

  if(typeof finishRack==='function'){
    const economyFinishRack=finishRack;
    finishRack=function(){
      const before=new Set(state.discovered||[]);
      economyFinishRack();
      payDiscoveryGrants(before);
    };
  }

  if(typeof commitAndRevealBulk==='function'){
    const economyBulk=commitAndRevealBulk;
    commitAndRevealBulk=function(){
      if(!bulkPending||bulkPending.committed)return economyBulk();
      const before=new Set(state.discovered||[]);
      economyBulk();
      payDiscoveryGrants(before);
    };
  }

  // Friendlier 60-second market: ordinary windows are -5% to +15%, with the same +67% hot spike ceiling.
  tickMarket=function(){
    const ids=new Set(specimens.map(s=>s.id));
    state.inventory.forEach(i=>ids.add(i.specimenId));
    state.returns.forEach(r=>ids.add(r.item.specimenId));
    const valid=[...ids].filter(id=>byId(id));
    valid.forEach(id=>state.market[id]=.95+Math.random()*.20);
    const owned=[...new Set(state.inventory.map(i=>i.specimenId))].filter(id=>byId(id));
    const pool=owned.length?owned:valid;
    if(pool.length){
      const hot=pool[Math.floor(Math.random()*pool.length)];
      const boost=1.25+Math.random()*.42;
      state.market[hot]=boost;
      state.marketHotId=hot;
      state.marketHotBoost=boost;
    }
    state.marketShiftAt=Date.now();ticker=60;save();renderMarket();
  };

  const nav=document.querySelector('[data-screen="collection"] small');if(nav)nav.textContent='670-vial master index';
  const side=document.querySelector('.sidecard p');if(side)side.innerHTML='The facility holds <b>670 unique specimens</b>. Every new discovery raises your Containment percentage and earns research funding.';
  renderAll();
})();