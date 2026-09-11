// VIALBREAK selection actions: select/confirm sell, select/submit CGC, claim all returns.
(function(){
  const GRADE_FEE=110;
  let sellSelected=new Set();
  let gradeSelected=new Set();

  function pruneSelections(){
    const inventoryIds=new Set(state.inventory.map(i=>i.uid));
    sellSelected=new Set([...sellSelected].filter(id=>inventoryIds.has(id)));
    gradeSelected=new Set([...gradeSelected].filter(id=>inventoryIds.has(id)&&!state.inventory.find(i=>i.uid===id)?.grade));
  }

  function ensureActionBars(){
    const gradingPanel=document.querySelector('#screen-grading .two-col .panel:first-child .panel-head');
    if(gradingPanel&&!document.querySelector('#gradeBulkBar')){
      const bar=document.createElement('div');bar.id='gradeBulkBar';bar.className='selection-bar';
      bar.innerHTML='<button id="gradeSelectAll" class="bulk-action-btn">SELECT ALL</button><button id="gradeConfirm" class="bulk-action-btn certify-all">SUBMIT SELECTED</button>';
      gradingPanel.appendChild(bar);
      $('#gradeSelectAll').onclick=toggleGradeAll;
      $('#gradeConfirm').onclick=submitSelectedToCGC;
    }
    const returnPanel=document.querySelector('#screen-grading .two-col .panel:last-child .panel-head');
    if(returnPanel&&!document.querySelector('#claimAllBtn')){
      const btn=document.createElement('button');btn.id='claimAllBtn';btn.className='bulk-action-btn claim-all';btn.onclick=claimAllReady;returnPanel.appendChild(btn);
    }
    const marketPanel=document.querySelector('#screen-market .two-col .panel:last-child .panel-head');
    if(marketPanel&&!document.querySelector('#sellBulkBar')){
      const bar=document.createElement('div');bar.id='sellBulkBar';bar.className='selection-bar';
      bar.innerHTML='<button id="sellSelectAll" class="bulk-action-btn">SELECT ALL</button><button id="sellConfirm" class="bulk-action-btn sell-all">CONFIRM SELL</button>';
      marketPanel.appendChild(bar);
      $('#sellSelectAll').onclick=toggleSellAll;
      $('#sellConfirm').onclick=sellSelectedInventory;
    }
  }

  function decorateRows(){
    document.querySelectorAll('#sellList .list-item').forEach(row=>{
      const btn=row.querySelector('[data-sell]');if(!btn)return;
      const uid=Number(btn.dataset.sell);row.dataset.selectSell=uid;
      if(!row.querySelector('.select-check')){
        const check=document.createElement('button');check.className='select-check';check.type='button';check.onclick=e=>{e.stopPropagation();toggleSell(uid)};row.prepend(check);
        row.onclick=e=>{if(e.target.closest('button:not(.select-check)'))return;toggleSell(uid)};
      }
      row.classList.toggle('selected',sellSelected.has(uid));
      row.querySelector('.select-check').textContent=sellSelected.has(uid)?'✓':'';
    });

    document.querySelectorAll('#gradableList .list-item').forEach(row=>{
      const btn=row.querySelector('[data-grade]');if(!btn)return;
      const uid=Number(btn.dataset.grade);row.dataset.selectGrade=uid;
      if(!row.querySelector('.select-check')){
        const check=document.createElement('button');check.className='select-check';check.type='button';check.onclick=e=>{e.stopPropagation();toggleGrade(uid)};row.prepend(check);
        row.onclick=e=>{if(e.target.closest('button:not(.select-check)'))return;toggleGrade(uid)};
      }
      row.classList.toggle('selected',gradeSelected.has(uid));
      row.querySelector('.select-check').textContent=gradeSelected.has(uid)?'✓':'';
    });
  }

  function toggleSell(uid){sellSelected.has(uid)?sellSelected.delete(uid):sellSelected.add(uid);decorateRows();syncButtons()}
  function toggleGrade(uid){gradeSelected.has(uid)?gradeSelected.delete(uid):gradeSelected.add(uid);decorateRows();syncButtons()}

  function toggleSellAll(){
    const eligible=state.inventory.map(i=>i.uid);
    const all=eligible.length&&eligible.every(id=>sellSelected.has(id));
    sellSelected=all?new Set():new Set(eligible);decorateRows();syncButtons();
  }
  function toggleGradeAll(){
    const eligible=state.inventory.filter(i=>!i.grade).map(i=>i.uid);
    const all=eligible.length&&eligible.every(id=>gradeSelected.has(id));
    gradeSelected=all?new Set():new Set(eligible);decorateRows();syncButtons();
  }

  function syncButtons(){
    pruneSelections();ensureActionBars();
    const allSell=state.inventory.length&&state.inventory.every(i=>sellSelected.has(i.uid));
    const sellAll=$('#sellSelectAll');if(sellAll)sellAll.textContent=allSell?'CLEAR ALL':'SELECT ALL';
    const sellBtn=$('#sellConfirm');if(sellBtn){
      const selected=state.inventory.filter(i=>sellSelected.has(i.uid));
      const total=selected.reduce((s,i)=>s+valueOf(i),0);
      sellBtn.disabled=!selected.length;
      sellBtn.innerHTML=selected.length?`CONFIRM SELL <small>${selected.length} selected • ₡${fmt(total)}</small>`:'CONFIRM SELL <small>NONE SELECTED</small>';
    }

    const gradeEligible=state.inventory.filter(i=>!i.grade);
    const allGrade=gradeEligible.length&&gradeEligible.every(i=>gradeSelected.has(i.uid));
    const gradeAll=$('#gradeSelectAll');if(gradeAll)gradeAll.textContent=allGrade?'CLEAR ALL':'SELECT ALL';
    const gradeBtn=$('#gradeConfirm');if(gradeBtn){
      const selected=gradeEligible.filter(i=>gradeSelected.has(i.uid));
      const cost=selected.length*GRADE_FEE;
      gradeBtn.disabled=!selected.length||state.credits<cost;
      gradeBtn.innerHTML=selected.length?`SUBMIT SELECTED <small>${selected.length} vials • ₡${fmt(cost)}</small>`:'SUBMIT SELECTED <small>NONE SELECTED</small>';
      gradeBtn.title=selected.length&&state.credits<cost?`Need ₡${fmt(cost)}.`:'';
    }

    const claim=$('#claimAllBtn');if(claim){
      const ready=state.returns.filter(r=>Date.now()>=r.ready).length;
      claim.disabled=!ready;claim.innerHTML=ready?`CLAIM ALL <small>${ready} ready</small>`:'CLAIM ALL <small>NONE READY</small>';
    }
  }

  function sellSelectedInventory(){
    const items=state.inventory.filter(i=>sellSelected.has(i.uid));if(!items.length)return;
    const total=items.reduce((s,i)=>s+valueOf(i),0),certified=items.filter(i=>i.grade).length,rare=items.filter(i=>rank[byId(i.specimenId).rarity]>=5).length;
    let msg=`Sell ${items.length} selected vial${items.length===1?'':'s'} for ₡${fmt(total)}?`;
    if(certified||rare)msg+=`\n\nWARNING: selection includes ${certified} certified and ${rare} Black Label/Impossible vial${rare===1?'':'s'}.`;
    if(!confirm(msg+'\n\nThis cannot be undone.'))return;
    const ids=new Set(items.map(i=>i.uid));state.inventory=state.inventory.filter(i=>!ids.has(i.uid));state.credits+=total;state.itemsSold+=items.length;state.xp+=Math.min(items.length*12,300);sellSelected.clear();save();renderAll();toast(`Sold ${items.length} selected vials for ₡${fmt(total)}.`);
  }

  function submitSelectedToCGC(){
    const items=state.inventory.filter(i=>!i.grade&&gradeSelected.has(i.uid));if(!items.length)return;
    const cost=items.length*GRADE_FEE;if(state.credits<cost){toast(`You need ₡${fmt(cost)}.`);return}
    if(!confirm(`Submit ${items.length} selected vial${items.length===1?'':'s'} to CGC for ₡${fmt(cost)}?`))return;
    const ids=new Set(items.map(i=>i.uid));state.inventory=state.inventory.filter(i=>!ids.has(i.uid));state.credits-=cost;const ready=Date.now()+4500;items.forEach(item=>state.returns.push({item,ready}));gradeSelected.clear();state.xp+=Math.min(items.length*8,240);save();renderAll();toast(`${items.length} vials sent to CGC.`);setTimeout(renderAll,4700);
  }

  function claimAllReady(){
    const now=Date.now(),ready=state.returns.filter(r=>now>=r.ready);if(!ready.length){toast('No CGC returns ready yet.');return}
    const readySet=new Set(ready);ready.forEach(r=>{r.item.grade=rollGrade(r.item);state.inventory.push(r.item)});state.returns=state.returns.filter(r=>!readySet.has(r));state.xp+=Math.min(ready.length*80,800);save();renderAll();toast(`Claimed ${ready.length} CGC returns.`);beep(900,.18,'sine',.05);
  }

  const baseRenderGradable=renderGradable;renderGradable=function(){baseRenderGradable();ensureActionBars();decorateRows();syncButtons()};
  const baseRenderMarket=renderMarket;renderMarket=function(){baseRenderMarket();ensureActionBars();decorateRows();syncButtons()};
  const baseRenderReturns=renderReturns;renderReturns=function(){baseRenderReturns();ensureActionBars();syncButtons()};
  ensureActionBars();decorateRows();syncButtons();
})();