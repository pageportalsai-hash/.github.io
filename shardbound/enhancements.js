// VIALBREAK expansion: fully hidden pre-crack vials + high-roller bulk cracking.
const originalRenderRacks=renderRacks;
let rackBatchChoice={starter:1,quarantine:1,blacksite:1};
let bulkPending=null;

function sealedVialHTML(){
  return `<div class="sealed-shell"><div class="sealed-cap"></div><div class="sealed-body"></div></div>`;
}

// Never render the actual specimen, colour or glyph until AFTER the crack completes.
prepareSlot=function(){
  $('#slotNum').textContent=slot+1;
  $('#slotBonus').textContent=isGod?'GOD RACK':slot===6?'★ FINAL CHAMBER BOOST':'';
  $('#slotBonus').style.color=isGod?'#ff7486':'#ffe36e';
  $('#bigVial').innerHTML=sealedVialHTML();
  $('#bigVial').style.filter='none';
  $('#toolAnim').textContent=tool().emoji;
  $('#crackBtn').style.setProperty('--crackTime',tool().time+'ms');
  $('#crackBtn').classList.remove('hidden','loading');
  $('#revealArea').classList.remove('active');
  $('#revealArea').innerHTML='';
  $('#nextVialBtn').classList.add('hidden');
  $('#finishRackBtn').classList.add('hidden');
};

function addBatchControls(){
  racks.forEach(r=>{
    const buy=document.querySelector(`[data-rack="${r.id}"]`);
    if(!buy)return;
    const card=buy.closest('.rack-card');
    if(!card||card.querySelector('.batch-picker'))return;
    const picker=document.createElement('div');
    picker.className='batch-picker';
    [1,3,5,10].forEach(q=>{
      const b=document.createElement('button');
      b.className='batch-btn'+(rackBatchChoice[r.id]===q?' active':'');
      const total=r.price*q;
      b.innerHTML=`×${q}<small>${q*7} vials • ₡${fmt(total)}</small>`;
      b.disabled=level()<r.level || (q>1 && state.credits<total);
      b.onclick=()=>{
        rackBatchChoice[r.id]=q;
        picker.querySelectorAll('.batch-btn').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        updateBatchBuyButton(r,buy);
      };
      picker.appendChild(b);
    });
    buy.before(picker);
    updateBatchBuyButton(r,buy);
  });
}

function updateBatchBuyButton(r,buy){
  const q=rackBatchChoice[r.id]||1;
  if(level()<r.level){buy.disabled=true;buy.textContent=`UNLOCK AT LAB LV ${r.level}`;return}
  const total=r.price*q;
  buy.disabled=state.credits<total;
  buy.textContent=q===1?'BUY & CRACK 1 RACK':`BUY ${q} RACKS • ${q*7} VIALS — ₡ ${fmt(total)}`;
  buy.onclick=()=>q===1?openRack(r):openBulkRackBatch(r,q);
}

renderRacks=function(){originalRenderRacks();addBatchControls()};

function ensureBulkOverlay(){
  if($('#bulkOverlay'))return;
  document.body.insertAdjacentHTML('beforeend',`
    <div id="bulkOverlay" class="bulk-overlay">
      <button id="bulkClose" class="bulk-close">×</button>
      <div class="bulk-stage">
        <div class="bulk-title"><div class="eyebrow">HIGH-ROLLER CRACK BENCH</div><h2 id="bulkHeading">SEALED BATCH</h2><p id="bulkSub">Contents hidden until the crack completes.</p></div>
        <div id="bulkCrate" class="bulk-crate"></div>
        <button id="bulkCrackBtn" class="bulk-crack-btn">HOLD TO CRACK BATCH</button>
        <div id="bulkSummary" class="bulk-summary hidden"></div>
        <div id="bulkResults" class="bulk-results hidden"></div>
        <button id="bulkDone" class="bulk-done hidden">LOCK EVERYTHING INTO FREEZER</button>
      </div>
    </div>`);
  $('#bulkClose').onclick=()=>{
    if(bulkPending&&!bulkPending.committed){alert('This batch is already paid for. Crack it before leaving.');return}
    $('#bulkOverlay').classList.remove('active');
  };
  $('#bulkDone').onclick=()=>{$('#bulkOverlay').classList.remove('active');bulkPending=null;renderAll()};
  let timer;
  $('#bulkCrackBtn').addEventListener('pointerdown',()=>{
    if(!bulkPending)return;
    const b=$('#bulkCrackBtn');b.classList.add('loading');
    timer=setTimeout(()=>{b.classList.remove('loading');commitAndRevealBulk()},850);
  });
  ['pointerup','pointerleave'].forEach(ev=>$('#bulkCrackBtn').addEventListener(ev,()=>{clearTimeout(timer);$('#bulkCrackBtn').classList.remove('loading')}));
}

function openBulkRackBatch(r,q){
  const cost=r.price*q;
  if(state.credits<cost){toast(`You need ₡${fmt(cost)} for that batch.`);return}
  state.credits-=cost;
  state.racksOpened+=q;
  state.xp+=40*q;
  const all=[];
  let gods=0;
  for(let n=0;n<q;n++){
    const god=Math.random()<r.god;
    if(god)gods++;
    isGod=god;
    for(let i=0;i<7;i++)all.push(pull(r,i));
  }
  isGod=false;
  state.godRacks+=gods;
  bulkPending={rack:r,qty:q,items:all,gods,cost,committed:false};
  save();renderStats();
  ensureBulkOverlay();
  $('#bulkHeading').textContent=`${q}× ${r.name}`;
  $('#bulkSub').textContent=`${q*7} sealed vials. No contents are visible until you crack the batch.`;
  $('#bulkCrate').innerHTML=Array.from({length:Math.min(q*7,70)},()=>'<div class="bulk-sealed-vial"></div>').join('');
  $('#bulkCrackBtn').classList.remove('hidden');
  $('#bulkSummary').classList.add('hidden');
  $('#bulkResults').classList.add('hidden');
  $('#bulkDone').classList.add('hidden');
  $('#bulkOverlay').classList.add('active');
  beep(220,.08,'triangle');
}

function commitAndRevealBulk(){
  if(!bulkPending||bulkPending.committed)return;
  const {items,gods,qty}=bulkPending;
  let total=0,best=null;
  for(const item of items){
    state.inventory.push(item);
    if(!state.discovered.includes(item.specimenId))state.discovered.push(item.specimenId);
    const s=byId(item.specimenId);
    total+=valueOf(item);
    if(!best||rank[s.rarity]>rank[best.rarity]||(rank[s.rarity]===rank[best.rarity]&&s.base>best.base))best=s;
    if(!state.bestPull||rank[s.rarity]>rank[byId(state.bestPull).rarity]||(rank[s.rarity]===rank[byId(state.bestPull).rarity]&&s.base>byId(state.bestPull).base))state.bestPull=s.id;
  }
  state.xp+=items.reduce((a,i)=>a+rank[byId(i.specimenId).rarity]*8,0)+(gods*180);
  bulkPending.committed=true;
  save();
  $('#bulkCrackBtn').classList.add('hidden');
  $('#bulkCrate').innerHTML=gods?`<div class="bulk-title"><div class="eyebrow bulk-god">⚠ TOTAL BREACH DETECTED ⚠</div><h2>${gods} GOD RACK${gods===1?'':'S'} IN THIS BATCH</h2></div>`:`<div class="bulk-title"><div class="eyebrow">BATCH OPENED</div><h2>${items.length} SPECIMENS REVEALED</h2></div>`;
  $('#bulkSummary').innerHTML=`<div><small>RACKS OPENED</small><b>${qty}</b></div><div><small>VIALS REVEALED</small><b>${items.length}</b></div><div><small>GOD RACKS</small><b class="${gods?'bulk-god':''}">${gods}</b></div><div><small>BATCH INDEX</small><b>₡${fmt(total)}</b></div>`;
  $('#bulkSummary').classList.remove('hidden');
  $('#bulkResults').innerHTML=items.map(i=>{const s=byId(i.specimenId);return `<div class="bulk-result">${specimenCard(s,i)}</div>`}).join('');
  $('#bulkResults').classList.remove('hidden');
  $('#bulkDone').classList.remove('hidden');
  if(best&&rank[best.rarity]>=5){beep(950,.2,'sine',.07);setTimeout(()=>beep(1200,.2,'sine',.05),120)}else beep(650,.12,'sine',.05);
  renderStats();
}

ensureBulkOverlay();
renderAll();