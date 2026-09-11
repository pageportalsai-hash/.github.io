// VIALBREAK Auto-Cracker automation.
// AUTO unlocks with the Level 15 Auto-Cracker X (₡1B) and stays on until switched off.
const AUTO_TOOL_INDEX=()=>Number.isInteger(state.autoToolIndex)?state.autoToolIndex:14;
if(typeof state.autoCrack!=='boolean') state.autoCrack=false;
if(state.tool<AUTO_TOOL_INDEX()) state.autoCrack=false;

let autoCrackTimer=null;
let autoAdvanceTimer=null;
let autoBulkTimer=null;

function autoRobotReady(){return state.tool>=AUTO_TOOL_INDEX()}
function autoEnabled(){return autoRobotReady()&&state.autoCrack===true}

function clearAutoTimers(){
  clearTimeout(autoCrackTimer);clearTimeout(autoAdvanceTimer);clearTimeout(autoBulkTimer);
  autoCrackTimer=autoAdvanceTimer=autoBulkTimer=null;
  const b=$('#crackBtn');if(b)b.classList.remove('loading');
  const t=$('#toolAnim');if(t)t.classList.remove('swing');
  const bb=$('#bulkCrackBtn');if(bb)bb.classList.remove('loading');
}

function setAutoCrack(on){
  if(on&&!autoRobotReady()){toast('AUTO CRACK requires the ₡1B Auto-Cracker X at Containment 15.');return}
  state.autoCrack=!!on;save();syncAutoControls();
  if(!state.autoCrack){clearAutoTimers();toast('🤖 AUTO CRACK OFF');return}
  toast('🤖 AUTO CRACK ON');kickAutoNow();
}

function autoButtonHTML(place){
  const locked=!autoRobotReady();
  return `<button class="auto-crack-toggle ${autoEnabled()?'on':''}" data-auto-crack="${place}" ${locked?'disabled':''}><span class="auto-dot"></span><b>${locked?'AUTO LOCKED':'AUTO CRACK'}</b><small>${locked?'Level 15 Auto-Cracker X • ₡1B':autoEnabled()?'ON • runs until switched off':'OFF • click to enable'}</small></button>`;
}

function mountOpeningAutoControl(){
  const station=$('#crackStation');if(!station||station.querySelector('[data-auto-crack="opening"]'))return;
  $('#crackBtn').insertAdjacentHTML('beforebegin',autoButtonHTML('opening'));bindAutoControls();
}
function mountBulkAutoControl(){
  const stage=$('#bulkOverlay .bulk-stage'),btn=$('#bulkCrackBtn');if(!stage||!btn||stage.querySelector('[data-auto-crack="bulk"]'))return;
  btn.insertAdjacentHTML('beforebegin',autoButtonHTML('bulk'));bindAutoControls();
}
function mountToolAutoControl(){
  const display=$('#currentToolDisplay');if(!display||display.querySelector('[data-auto-crack="tools"]'))return;
  display.insertAdjacentHTML('beforeend',autoButtonHTML('tools'));bindAutoControls();
}
function bindAutoControls(){
  $$('[data-auto-crack]').forEach(btn=>{if(btn.dataset.bound)return;btn.dataset.bound='1';btn.onclick=()=>setAutoCrack(!state.autoCrack)});syncAutoControls();
}
function syncAutoControls(){
  $$('[data-auto-crack]').forEach(btn=>{
    const locked=!autoRobotReady();btn.disabled=locked;btn.classList.toggle('on',autoEnabled());
    const b=btn.querySelector('b'),small=btn.querySelector('small');
    if(b)b.textContent=locked?'AUTO LOCKED':'AUTO CRACK';
    if(small)small.textContent=locked?'Level 15 Auto-Cracker X • ₡1B':autoEnabled()?'ON • runs until switched off':'OFF • click to enable';
  });
}

function runAutoCrack(){
  clearTimeout(autoCrackTimer);if(!autoEnabled())return;
  const overlay=$('#openingOverlay'),station=$('#crackStation'),btn=$('#crackBtn');
  if(!overlay?.classList.contains('active')||!station||station.classList.contains('hidden')||!btn||btn.classList.contains('hidden'))return;
  btn.classList.add('loading');$('#toolAnim')?.classList.add('swing');
  autoCrackTimer=setTimeout(()=>{
    if(!autoEnabled()){clearAutoTimers();return}
    btn.classList.add('hidden');btn.classList.remove('loading');$('#toolAnim')?.classList.remove('swing');beep(140,.07,'square',.04);
    setTimeout(()=>{if(autoEnabled())revealVial()},Math.max(45,Math.min(120,tool().time*.3)));
  },Math.max(55,tool().time));
}
function scheduleAutoCrack(delay=180){clearTimeout(autoCrackTimer);if(autoEnabled())autoCrackTimer=setTimeout(runAutoCrack,delay)}
function runAutoBulk(){
  clearTimeout(autoBulkTimer);if(!autoEnabled()||!bulkPending||bulkPending.committed)return;
  const btn=$('#bulkCrackBtn');if(!btn||btn.classList.contains('hidden'))return;btn.classList.add('loading');
  autoBulkTimer=setTimeout(()=>{if(!autoEnabled()||!bulkPending||bulkPending.committed){btn.classList.remove('loading');return}btn.classList.remove('loading');commitAndRevealBulk()},Math.max(120,tool().time*1.2));
}
function kickAutoNow(){if(!autoEnabled())return;if($('#bulkOverlay')?.classList.contains('active')&&bulkPending&&!bulkPending.committed){runAutoBulk();return}scheduleAutoCrack(100)}

const autoBasePrepareSlot=prepareSlot;
prepareSlot=function(){autoBasePrepareSlot();mountOpeningAutoControl();syncAutoControls();if(autoEnabled())scheduleAutoCrack(Math.max(90,tool().time*.45))};

const autoBaseRevealVial=revealVial;
revealVial=function(){
  autoBaseRevealVial();if(!autoEnabled())return;clearTimeout(autoAdvanceTimer);
  const revealDelay=Math.max(180,Math.min(850,tool().time*1.8));
  if(slot<6){
    autoAdvanceTimer=setTimeout(()=>{if(!autoEnabled())return;slot++;$('#nextVialBtn').classList.add('hidden');$('#revealArea').classList.remove('active');setTimeout(()=>{if(!autoEnabled())return;prepareSlot();$('#crackStation').classList.remove('hidden')},Math.max(50,tool().time*.25))},revealDelay);
  }else autoAdvanceTimer=setTimeout(()=>{if(autoEnabled())finishRack()},Math.max(220,revealDelay));
};

const autoBaseRenderTools=renderTools;
renderTools=function(){autoBaseRenderTools();mountToolAutoControl();syncAutoControls()};
const autoBaseBuyTool=buyTool;
buyTool=function(i){autoBaseBuyTool(i);if(autoRobotReady()){mountOpeningAutoControl();mountBulkAutoControl();mountToolAutoControl();syncAutoControls()}};
const autoBaseOpenBulkRackBatch=openBulkRackBatch;
openBulkRackBatch=function(r,q){autoBaseOpenBulkRackBatch(r,q);mountBulkAutoControl();syncAutoControls();if(autoEnabled())autoBulkTimer=setTimeout(runAutoBulk,Math.max(120,tool().time*.8))};
const autoBaseFinishRack=finishRack;
finishRack=function(){clearAutoTimers();autoBaseFinishRack();syncAutoControls()};

mountOpeningAutoControl();mountBulkAutoControl();renderAll();syncAutoControls();