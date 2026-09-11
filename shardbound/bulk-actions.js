// VIALBREAK bulk inventory actions: Sell All + Submit All to CGC.
(function(){
  const GRADE_FEE=110;

  function ensureBulkButtons(){
    const gradingPanel=document.querySelector('#screen-grading .two-col .panel:first-child .panel-head');
    if(gradingPanel && !document.querySelector('#submitAllBtn')){
      const btn=document.createElement('button');
      btn.id='submitAllBtn';
      btn.className='bulk-action-btn certify-all';
      btn.onclick=submitAllToCGC;
      gradingPanel.appendChild(btn);
    }

    const marketPanel=document.querySelector('#screen-market .two-col .panel:last-child .panel-head');
    if(marketPanel && !document.querySelector('#sellAllBtn')){
      const btn=document.createElement('button');
      btn.id='sellAllBtn';
      btn.className='bulk-action-btn sell-all';
      btn.onclick=sellAllInventory;
      marketPanel.appendChild(btn);
    }
    syncBulkButtons();
  }

  function syncBulkButtons(){
    const submitBtn=document.querySelector('#submitAllBtn');
    if(submitBtn){
      const eligible=state.inventory.filter(i=>!i.grade);
      const cost=eligible.length*GRADE_FEE;
      submitBtn.disabled=!eligible.length || state.credits<cost;
      submitBtn.innerHTML=eligible.length
        ? `SUBMIT ALL <small>${eligible.length} vial${eligible.length===1?'':'s'} • ₡${fmt(cost)}</small>`
        : 'SUBMIT ALL <small>NO UNCERTIFIED VIALS</small>';
      submitBtn.title=eligible.length && state.credits<cost ? `You need ₡${fmt(cost)} to certify all ${eligible.length} vials.` : '';
    }

    const sellBtn=document.querySelector('#sellAllBtn');
    if(sellBtn){
      const total=state.inventory.reduce((sum,item)=>sum+valueOf(item),0);
      sellBtn.disabled=!state.inventory.length;
      sellBtn.innerHTML=state.inventory.length
        ? `SELL ALL <small>${state.inventory.length} vial${state.inventory.length===1?'':'s'} • ₡${fmt(total)}</small>`
        : 'SELL ALL <small>FREEZER EMPTY</small>';
    }
  }

  function submitAllToCGC(){
    const eligible=state.inventory.filter(i=>!i.grade);
    if(!eligible.length){toast('No uncertified vials to submit.');return}
    const cost=eligible.length*GRADE_FEE;
    if(state.credits<cost){toast(`You need ₡${fmt(cost)} to certify all ${eligible.length} vials.`);return}

    const ok=confirm(`Submit ALL ${eligible.length} uncertified vials to CGC for ₡${fmt(cost)}?\n\nCertified vials already in your freezer will stay there.`);
    if(!ok)return;

    const eligibleIds=new Set(eligible.map(i=>i.uid));
    state.inventory=state.inventory.filter(i=>!eligibleIds.has(i.uid));
    state.credits-=cost;
    const ready=Date.now()+4500;
    eligible.forEach(item=>state.returns.push({item,ready}));
    state.xp+=Math.min(eligible.length*8,240);
    save();
    renderAll();
    toast(`${eligible.length} vials sent to CGC.`);
    setTimeout(renderAll,4700);
  }

  function sellAllInventory(){
    if(!state.inventory.length){toast('Your freezer is empty.');return}
    const items=[...state.inventory];
    const total=items.reduce((sum,item)=>sum+valueOf(item),0);
    const certified=items.filter(i=>i.grade).length;
    const rare=items.filter(i=>rank[byId(i.specimenId).rarity]>=5).length;
    let warning=`Sell ALL ${items.length} vials for ₡${fmt(total)}?`;
    if(certified||rare){
      warning+=`\n\nWARNING: this includes ${certified} certified vial${certified===1?'':'s'} and ${rare} Black Label/Impossible vial${rare===1?'':'s'}.`;
    }
    warning+='\n\nThis cannot be undone.';
    if(!confirm(warning))return;

    state.inventory=[];
    state.credits+=total;
    state.itemsSold+=items.length;
    state.xp+=Math.min(items.length*12,300);
    save();
    renderAll();
    toast(`Sold ${items.length} vials for ₡${fmt(total)}.`);
  }

  const baseRenderGradable=renderGradable;
  renderGradable=function(){baseRenderGradable();ensureBulkButtons();syncBulkButtons()};
  const baseRenderMarket=renderMarket;
  renderMarket=function(){baseRenderMarket();ensureBulkButtons();syncBulkButtons()};

  ensureBulkButtons();
  syncBulkButtons();
})();