/* Race 95 v20 — daily missions and trophy showcase */
(()=>{'use strict';
const $=id=>document.getElementById(id),Mega=window.R95Mega20,X=window.R95Extras14;if(!Mega||!X)return;
const panel=$('megaPanel20');if(!panel)return;
const d=new Date();const today=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const modes=Mega.arenaModes,seed=d.getFullYear()*372+d.getMonth()*31+d.getDate(),challenge=modes[seed % modes.length];
let completed=localStorage.getItem('r95.daily20.done')===today;
const el=document.createElement('div');el.id='daily20';el.style.cssText='padding:13px;margin-top:12px;border-radius:12px;background:#20324e;border:1px solid #f8d56b99';
el.innerHTML='<h3 style="color:#ffe58e;margin:0">📅 DAILY CHALLENGE & TROPHY ROOM</h3><p id="dailyInfo20" style="font-size:13px"></p><button type="button" id="dailyPlay20" style="margin:0;padding:9px 13px">PLAY TODAY’S CHALLENGE</button><button type="button" id="trophyToggle20" style="margin:6px 0;padding:9px 13px">🏆 TROPHY ROOM</button><div id="trophyList20" class="hidden" style="font-size:13px;margin-top:8px;color:#cfffe7"></div>';
panel.appendChild(el);
const info=$('dailyInfo20');function update(){info.textContent=completed?'✅ Today’s challenge complete! Come back tomorrow.':challenge[1]+' — '+challenge[2]+' • Bonus 125 coins for your first win today.'}
update();
$('dailyPlay20').onclick=()=>{const activity=$('activity14');activity.value=challenge[0];activity.dispatchEvent(new Event('change',{bubbles:true}));$('startBtn').scrollIntoView({block:'nearest',behavior:'smooth'});};
$('trophyToggle20').onclick=()=>{const list=$('trophyList20');list.classList.toggle('hidden');let trophies=[];try{trophies=JSON.parse(localStorage.getItem('r95.mega20.awards')||'[]')}catch{};list.textContent=trophies.length?'🏅 '+trophies.join(' • '):'Win races and arcade challenges to earn your first trophies.';};
let last=null;function frame(){const s=Mega.state;if(!completed&&s&&s.finished&&s.mode===challenge[0]&&s.winner&&s.winner!=='lava'){
 const key='r95.daily20.reward.'+today;const coins=X.award(key,125);if(coins>0){completed=true;try{localStorage.setItem('r95.daily20.done',today)}catch{};update();Mega.achieve('Daily Challenge '+today);}
}requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.R95Daily20={today,challenge:challenge[0],done:()=>completed};
})();