// VIALBREAK audit fixes — save compatibility, duplicate guards, and rack UI normalization.
(function(){
  'use strict';

  // --- SAVE COMPATIBILITY -------------------------------------------------
  // Recreate the exact 100 specimens from the former 770-specimen build.
  // Their IDs/containment positions stay unchanged; this only restores the
  // name, value, glyph, copy and colours that those positions originally had.
  const oldPrefixes=[
    'Glass','Velvet','Radio','Copper','Midnight','Static','Paper','Neon','Hollow','Lucky',
    'Crimson','Silver','Ghost','Pocket','Signal','Orbit','Dream','Mirror','Clock','Cinder',
    'Frost','Lunar','Echo','Zero','Violet','Amber','Chrome','Moss','Comet','Marble',
    'Electric','Rust','Bubble','Quartz','Velcro','Solar','Dust','Candy','Ink','Pixel',
    'Ion','Prism','Halo','Cipher','Titan','Nova','Aether','Obsidian','Aurora','Vector'
  ];
  const oldSuffix={
    Relic:['Relic','Artifact','Vault','Glyph','Shard','Engine','Cipher','Core','Beacon','Monolith'],
    Singularity:['Event Horizon','Godseed','Final Form','Worldline','Infinity','Prime Zero','Last Light','Absolute Null','Creation','Endstate']
  };
  const oldBase={Relic:110000,Singularity:240000};
  const oldPalettes=['#76e6c2','#7fb5ff','#f0c469','#d98cff','#ff8077','#8ee76f','#e8eef0','#68e3ff','#ff9bcb','#a995ff','#f8a35f','#69d6ff','#d6ff80','#ff758f','#54f4ff','#fff0a4','#b7fff7','#ffd86e'];
  const oldDarks=['#17483b','#1d3851','#4a3518','#3c214d','#4d2024','#29441e','#394344','#16414a','#4b2239','#30254c','#4a2b18','#16384c','#31401c','#4c1a26','#113a45','#4a3a10','#1a3f3b','#51450f'];
  const oldGlyphs=['•','○','△','◇','✦','◉','⌁','Ⅱ','Ω','∅','R','X','▲','◫','∞','404','0²','☾','⚡','…','✚','◎','⌬','✧','◈','✺','⊙','⌘','⟁','◬'];

  function restoreOldExpansion(rarity,count,rarityIndex,startContainment){
    for(let i=0;i<count;i++){
      const containmentIndex=startContainment+i;
      const s=specimens.find(x=>Number(x.containmentIndex)===containmentIndex);
      if(!s)continue;
      const p=oldPrefixes[i%oldPrefixes.length];
      const sf=oldSuffix[rarity][Math.floor(i/oldPrefixes.length)%oldSuffix[rarity].length];
      const series=Math.floor(i/(oldPrefixes.length*oldSuffix[rarity].length))+1;
      const name=`${p} ${sf}${series>1?` Mk ${series}`:''}`;
      const scale=1+(i/Math.max(1,count-1))*1.15;
      Object.assign(s,{
        name,
        rarity,
        glyph:oldGlyphs[(containmentIndex+rarityIndex)%oldGlyphs.length],
        base:Math.round(oldBase[rarity]*scale),
        text:`A fictional ${rarity.toLowerCase()} culture recovered from the VIALBREAK facility. Lab notes report unusual behaviour after the seal is disturbed.`,
        liqA:oldPalettes[containmentIndex%oldPalettes.length],
        liqB:oldDarks[containmentIndex%oldDarks.length]
      });
    }
  }
  restoreOldExpansion('Relic',60,7,671);
  restoreOldExpansion('Singularity',40,8,731);

  // --- STATE SAFETY -------------------------------------------------------
  // nextUID must always be above every existing inventory/CGC item so a
  // migrated save can never create two different vials with the same UID.
  let maxUid=0;
  for(const item of state.inventory||[])maxUid=Math.max(maxUid,Number(item.uid)||0);
  for(const ret of state.returns||[])maxUid=Math.max(maxUid,Number(ret?.item?.uid)||0);
  if(!Number.isFinite(state.nextUID)||state.nextUID<=maxUid)state.nextUID=maxUid+1;

  // New rack types were added after the original bulk selector object existed.
  // Normalize every rack to ×1 so all six cards show a selected option.
  try{
    for(const rack of racks){if(!rackBatchChoice[rack.id])rackBatchChoice[rack.id]=1;}
  }catch{}

  // --- OPENING SAFETY -----------------------------------------------------
  // The original LOCK INTO FREEZER button stored a reference to the very first
  // finishRack implementation. Rebind it to the current wrapped implementation
  // and reject stale auto timers after the overlay has already been closed.
  const auditedFinishRack=finishRack;
  let finishingRack=false;
  finishRack=function(){
    const overlay=document.querySelector('#openingOverlay');
    if(finishingRack||!overlay?.classList.contains('active'))return;
    finishingRack=true;
    try{return auditedFinishRack.apply(this,arguments)}
    finally{finishingRack=false;}
  };
  const finishButton=document.querySelector('#finishRackBtn');
  if(finishButton)finishButton.onclick=()=>finishRack();

  // Re-render rack controls once after normalizing their stored batch choices.
  try{renderRacks();}catch{}
  save();
  renderAll();
})();