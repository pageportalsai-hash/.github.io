// VIALBREAK Auto-Cracker X automation.
// Requires the final tool (tool index 4). AUTO persists until the player turns it off.

if(typeof state.autoCrack!=='boolean') state.autoCrack=false;
if(state.tool<4) state.autoCrack=false;

let autoCrackTimer=null;
let autoAdvanceTimer=null;
let autoBulkTimer=null;

function autoRobotReady(){return state.tool>=4}
function autoEnabled(){return autoRobotReady()&&state.autoCrack===true}

function clearAutoTimers(){
  clearTimeout(autoCrackTimer);clearTimeout(autoAdvanceTimer);clearTimeout(autoBulkTimer);
  autoCrackTimer=autoAdvanceTimer=autoBulkTimer=null;
  const b=$('#crackBtn');if(b)b.classList.remove('loading');
  const t=$('#toolAnim');if(t)t.classList.remove('swing');
  const bb=$('#bulkCrackBtn');if(bb)bb.classList.remove('loading');
}

function setAutoCrack(on){
  if(on&&!autoRobotReady()){toast('AUTO CRACK unlocks with Auto-Cracker X.');return}
  state.autoCrack=!!on;
  save();
  syncAutoControls();
  if(!state.autoCrack){clearAutoTimers();toast('🤖 AUTO CRACK OFF');return}
  toast('🤖 AUTO CRACK ON');
  kickAutoNow();
}

function autoButtonHTML(place){
  const locked=!autoRobotReady();
  return `<button class="auto-crack-toggle ${autoEnabled()?'on':''}" data-auto-crack="${place}" ${locked?'disabled':''}><span class="auto-dot"></span><b>${locked?'AUTO LOCKED':'AUTO CRACK'}</b><small>${locked?'Requires Auto-Cracker X':autoEnabled()?'ON • runs until switched off':'OFF • click to enable'}</small></button>`;
}

function mountOpeningAutoControl(){
  const station=$('#crackStation');
  if(!station||station.querySelector('[data-auto-crack="opening"]'))return;
  $('#crackBtn').insertAdjacentHTML('beforebegin',autoButtonHTML('opening'));
  bindAutoControls();
}

function mountBulkAutoControl(){
  const stage=$('#bulkOverlay .bulk-stage'),btn=$('#bulkCrackBtn');
  if(!stage||!btn||stage.querySelector('[data-auto-crack="bulk"]'))return;
  btn.insertAdjacentHTML('beforebegin',autoButtonHTML('bulk'));
  bindAutoControls();
}

function mountToolAutoControl(){
  const display=$('#currentToolDisplay');
  if(!display||display.querySelector('[data-auto-crack="tools"]'))return;
  display.insertAdjacentHTML('beforeend',autoButtonHTML('tools'));
  bindAutoControls();
}

function bindAutoControls(){
  $$('[data-auto-crack]').forEach(btn=>{
    if(btn.dataset.bound)return;
    btn.dataset.bound='1';
    btn.onclick=()=>setAutoCrack(!state.autoCrack);
  });
  syncAutoControls();
}

function syncAutoControls(){
  $$('[data-auto-crack]').forEach(btn=>{
    const locked=!autoRobotReady();
    btn.disabled=locked;
    btn.classList.toggle('on',autoEnabled());
    const b=btn.querySelector('b'),small=btn.querySelector('small');
    if(b)b.textContent=locked?'AUTO LOCKED':'AUTO CRACK';
    if(small)small.textContent=locked?'Requires Auto-Cracker X':autoEnabled()?'ON • runs until switched off':'OFF • click to enable';
  });
}

function runAutoCrack(){
  clearTimeout(autoCrackTimer);
  if(!autoEnabled())return;
  const overlay=$('#openingOverlay'),station=$('#crackStation'),btn=$('#crackBtn');
  if(!overlay?.classList.contains('active')||!station||station.classList.contains('hidden')||!btn||btn.classList.contains('hidden'))return;
  btn.classList.add('loading');
  $('#toolAnim')?.classList.add('swing');
  autoCrackTimer=setTimeout(()=>{
    if(!autoEnabled()){clearAutoTimers();return}
    btn.classList.add('hidden');
    btn.classList.remove('loading');
    $('#toolAnim')?.classList.remove('swing');
    beep(140,.09,'square',.055);
    setTimeout(()=>{if(autoEnabled())revealVial()},120);
  },Math.max(180,tool().time));
}

function scheduleAutoCrack(delay=300){
  clearTimeout(autoCrackTimer);
  if(!autoEnabled())return;
  autoCrackTimer=setTimeout(runAutoCrack,delay);
}

function runAutoBulk(){
  clearTimeout(autoBulkTimer);
  if(!autoEnabled()||!bulkPending||bulkPending.committed)return;
  const btn=$('#bulkCrackBtn');
  if(!btn||btn.classList.contains('hidden'))return;
  btn.classList.add('loading');
  autoBulkTimer=setTimeout(()=>{
    if(!autoEnabled()||!bulkPending||bulkPending.committed){btn.classList.remove('loading');return}
    btn.classList.remove('loading');
    commitAndRevealBulk();
  },500);
}

function kickAutoNow(){
  if(!autoEnabled())return;
  if($('#bulkOverlay')?.classList.contains('active')&&bulkPending&&!bulkPending.committed){runAutoBulk();return}
  scheduleAutoCrack(120);
}

// Wrap the hidden-vial prepare stage so the robot begins automatically when AUTO is on.
const autoBasePrepareSlot=prepareSlot;
prepareSlot=function(){
  autoBasePrepareSlot();
  mountOpeningAutoControl();
  syncAutoControls();
  if(autoEnabled())scheduleAutoCrack(300);
};

// After each reveal, automatically move to the next vial. The reveal stays visible briefly.
const autoBaseRevealVial=revealVial;
revealVial=function(){
  autoBaseRevealVial();
  if(!autoEnabled())return;
  clearTimeout(autoAdvanceTimer);
  if(slot<6){
    autoAdvanceTimer=setTimeout(()=>{
      if(!autoEnabled())return;
      slot++;
      $('#nextVialBtn').classList.add('hidden');
      $('#revealArea').classList.remove('active');
      setTimeout(()=>{
        if(!autoEnabled())return;
        prepareSlot();
        $('#crackStation').classList.remove('hidden');
      },120);
    },850);
  }else{
    autoAdvanceTimer=setTimeout(()=>{
      if(autoEnabled())finishRack();
    },1050);
  }
};

// Add AUTO controls to the tool page whenever it re-renders.
const autoBaseRenderTools=renderTools;
renderTools=function(){
  autoBaseRenderTools();
  mountToolAutoControl();
  syncAutoControls();
};

// If Auto-Cracker X is purchased, expose the switch immediately.
const autoBaseBuyTool=buyTool;
buyTool=function(i){
  autoBaseBuyTool(i);
  if(state.tool>=4){mountOpeningAutoControl();mountBulkAutoControl();mountToolAutoControl();syncAutoControls()}
};

// Bulk batches also auto crack while AUTO is enabled.
const autoBaseOpenBulkRackBatch=openBulkRackBatch;
openBulkRackBatch=function(r,q){
  autoBaseOpenBulkRackBatch(r,q);
  mountBulkAutoControl();
  syncAutoControls();
  if(autoEnabled())autoBulkTimer=setTimeout(runAutoBulk,400);
};

// Keep the mode on after finishing a rack. It waits for the next purchased rack.
const autoBaseFinishRack=finishRack;
finishRack=function(){
  clearAutoTimers();
  autoBaseFinishRack();
  syncAutoControls();
};

mountOpeningAutoControl();
mountBulkAutoControl();
renderAll();
syncAutoControls();