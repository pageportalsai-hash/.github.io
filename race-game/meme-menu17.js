/* Race 95 v17: easy menu selection for meme bonus cars. */
(()=>{
 'use strict';
 const area=document.querySelector('#garage .menuActions14')||document.querySelector('#garage .panel');
 if(!area)return;
 const group=document.createElement('div');group.id='memeMenu17';group.setAttribute('aria-label','Meme car choices');
 group.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;';
 const label=document.createElement('strong');label.textContent='😂 BONUS MEME CARS';label.style.cssText='width:100%;color:#ffe878;font-size:13px;letter-spacing:.07em';group.appendChild(label);
 const cars=[{index:101,name:'🚙 6 7 MEME CAR'},{index:102,name:'⚽ HAALAND NECK CAR'}];
 for(const car of cars){const b=document.createElement('button');b.type='button';b.textContent=car.name;b.className='alt';b.style.cssText='padding:10px 12px;border-radius:13px;margin:0;';
 b.onclick=()=>{
   const p2=document.getElementById('modeSelect')?.value==='2'&&document.getElementById('shopPlayer14')?.value==='P2';
   const select=document.getElementById(p2?'p2Car':'p1Car');
   if(!select)return;
   select.value=String(car.index);select.dispatchEvent(new Event('change',{bubbles:true}));
   select.scrollIntoView?.({block:'nearest',behavior:'smooth'});
 };
 group.appendChild(b);}
 area.appendChild(group);
})();