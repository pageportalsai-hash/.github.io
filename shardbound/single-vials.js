// VIALBREAK single-vial ladder shop: 8 visible one-vial purchases from ₡100 to ₡1B.
(function(){
  const TIERS=[
    {name:'ENTRY VIAL',price:100,tag:'CHEAP // START HERE',accent:'#76e6c2',weights:{Stable:72,Oddity:20,Mutant:6,Hazard:1.7,'Black Label':.25,Impossible:.045,Apex:.004,Relic:.0006,Singularity:.0001,Mythic:.00003,Paradox:.00001,Origin:.000005}},
    {name:'ENRICHED VIAL',price:1000,tag:'BETTER ODDS',accent:'#69d6ff',weights:{Stable:50,Oddity:28,Mutant:15,Hazard:5,'Black Label':1.5,Impossible:.4,Apex:.08,Relic:.02,Singularity:.005,Mythic:.001,Paradox:.0003,Origin:.0001}},
    {name:'RESEARCH VIAL',price:10000,tag:'SERIOUS HUNT',accent:'#f0c469',weights:{Stable:25,Oddity:28,Mutant:24,Hazard:14,'Black Label':6,Impossible:2,Apex:.7,Relic:.2,Singularity:.07,Mythic:.02,Paradox:.007,Origin:.003}},
    {name:'BLACKSITE VIAL',price:100000,tag:'HIGH-END SAMPLE',accent:'#ff8077',weights:{Stable:10,Oddity:20,Mutant:25,Hazard:22,'Black Label':13,Impossible:6,Apex:2.5,Relic:.9,Singularity:.35,Mythic:.15,Paradox:.07,Origin:.03}},
    {name:'OMEGA VIAL',price:1000000,tag:'ELITE ODDS',accent:'#d98cff',weights:{Stable:4,Oddity:10,Mutant:18,Hazard:23,'Black Label':20,Impossible:12,Apex:6,Relic:3,Singularity:1.7,Mythic:.8,Paradox:.35,Origin:.15}},
    {name:'RELIC VIAL',price:10000000,tag:'ENDGAME SAMPLE',accent:'#65f5ff',weights:{Stable:1,Oddity:4,Mutant:10,Hazard:18,'Black Label':22,Impossible:18,Apex:12,Relic:7,Singularity:4,Mythic:2.3,Paradox:1,Origin:.5}},
    {name:'PARADOX VIAL',price:100000000,tag:'EXTREME ODDS',accent:'#ff7658',weights:{Stable:0,Oddity:1,Mutant:4,Hazard:10,'Black Label':18,Impossible:20,Apex:18,Relic:12,Singularity:8,Mythic:5,Paradox:2.5,Origin:1.5}},
    {name:'BILLION VIAL',price:1000000000,tag:'ULTIMATE CHASE',accent:'#fff3a8',weights:{Stable:0,Oddity:0,Mutant:1,Hazard:4,'Black Label':10,Impossible:15,Apex:18,Relic:16,Singularity:13,Mythic:10,Paradox:7,Origin:6}}
  ];
  const grants={Stable:20,Oddity:45,Mutant:90,Hazard:220,'Black Label':650,Impossible:1800,Apex:4500,Relic:9000,Singularity:20000,Mythic:45000,Paradox:100000,Origin:250000};

  function money(n){return '₡'+fmt(n)}
  function ensureShop(){
    const rackGrid=$('#rackGrid');if(!rackGrid)return null;
    let section=$('#singleVialShop');
    if(!section){
      section=document.createElement('section');section.id='singleVialShop';section.className='single-vial-shop';
      section.innerHTML=`<div class="single-vial-head"><div><div class="eyebrow">SINGLE VIAL LADDER // ONE SEALED VIAL</div><h2>Buy one vial. Climb the odds.</h2><p>Eight single-vial tiers from ₡100 to ₡1 billion. Higher price = dramatically stronger rarity odds.</p></div><div class="single-vial-scale">₡100 <span>→</span> ₡1B</div></div><div id="singleVialGrid" class="single-vial-grid"></div>`;
      rackGrid.insertAdjacentElement('afterend',section);
    }
    if(!$('#singleVialOverlay')){
      document.body.insertAdjacentHTML('beforeend',`<div id="singleVialOverlay" class="single-vial-overlay"><div class="single-vial-backdrop" data-single-close></div><div class="single-vial-reveal"><button class="single-vial-close" data-single-close>×</button><div class="eyebrow">SINGLE VIAL RECOVERY</div><div id="singleVialResult"></div><button class="next-btn" data-single-close>LOCK INTO FREEZER</button></div></div>`);
      $$('[data-single-close]').forEach(b=>b.onclick=()=>$('#singleVialOverlay')?.classList.remove('active'));
    }
    return section;
  }

  function renderSingleVials(){
    if(!ensureShop())return;
    const grid=$('#singleVialGrid');if(!grid)return;
    grid.innerHTML=TIERS.map((t,i)=>{
      const can=state.credits>=t.price;
      return `<article class="single-vial-card ${i===7?'ultimate':''}" style="--single:${t.accent}">
        <div class="single-vial-tag">${t.tag}</div>
        <div class="single-vial-price">${money(t.price)}</div>
        <div class="single-vial-art"><div class="single-vial-cap"></div><div class="single-vial-glass"><div class="single-vial-liquid"></div><div class="single-vial-label">VB<br><b>${String(i+1).padStart(2,'0')}</b></div></div></div>
        <h3>${t.name}</h3><small>1 SEALED VIAL • ${i<2?'ENTRY ODDS':i<4?'IMPROVED ODDS':i<6?'PREMIUM ODDS':'TOP-TIER ODDS'}</small>
        <button class="buy-btn" data-single-vial="${i}" ${can?'':'disabled'}>${can?'BUY & CRACK 1 VIAL':`NEED ${money(t.price)}`}</button>
      </article>`;
    }).join('');
    $$('[data-single-vial]').forEach(b=>b.onclick=()=>buySingleVial(Number(b.dataset.singleVial)));
  }

  function makeItem(tier){
    const rarity=roll(tier.weights);
    const pool=specimens.filter(s=>s.rarity===rarity);
    const s=pool[Math.floor(Math.random()*pool.length)];
    const item={uid:state.nextUID++,specimenId:s.id,grade:null,pristine:Math.random()<(rank[rarity]>=4?.24:.08),serial:rank[rarity]>=5?Math.floor(1+Math.random()*99999):null};
    return {s,item};
  }

  function buySingleVial(index){
    const tier=TIERS[index];if(!tier)return;
    if(state.credits<tier.price){toast(`You need ${money(tier.price)}.`);return}
    state.credits-=tier.price;
    const {s,item}=makeItem(tier);
    const fresh=!state.discovered.includes(s.id);
    state.inventory.push(item);
    if(fresh){state.discovered.push(s.id);state.credits+=(grants[s.rarity]||20)}
    if(!state.bestPull||rank[s.rarity]>rank[byId(state.bestPull).rarity]||(rank[s.rarity]===rank[byId(state.bestPull).rarity]&&s.base>byId(state.bestPull).base))state.bestPull=s.id;
    state.xp+=(rank[s.rarity]||1)*10;
    save();renderAll();
    const result=$('#singleVialResult');
    if(result)result.innerHTML=`<div class="single-hit" style="--single:${colors[s.rarity]||tier.accent}">${specimenCard(s,item)}<div class="single-hit-meta"><span>${tier.name}</span><h2>${s.name}</h2><b style="color:${colors[s.rarity]||'#fff'}">${s.rarity.toUpperCase()}${item.pristine?' • PRISTINE':''}</b><strong>INDEX VALUE ${money(valueOf(item))}</strong>${fresh?`<small>NEW SPECIMEN • RESEARCH FUNDING +${money(grants[s.rarity]||20)}</small>`:'<small>DUPLICATE • READY TO SELL OR CERTIFY</small>'}</div></div>`;
    $('#singleVialOverlay')?.classList.add('active');
    beep(rank[s.rarity]>=10?1200:rank[s.rarity]>=7?900:560,.16,'sine',.06);
  }

  const baseRenderAll=renderAll;
  renderAll=function(){baseRenderAll();renderSingleVials()};
  renderSingleVials();
})();