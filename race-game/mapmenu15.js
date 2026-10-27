/* v15 map browser. Additive: championship, cosmetics and physics stay untouched. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),Maps=window.R95Maps15,D=window.R95V8;
const card=document.createElement('section');card.id='routeCard15';card.setAttribute('aria-label','Selected circuit preview');
card.innerHTML='<div class="routeHead15"><span id="routeCount15"></span><span>30 DISTINCT LAYOUTS</span></div><canvas id="routePreview15" width="600" height="360" aria-label="Map preview"></canvas><h3 id="routeTitle15"></h3><p id="routeDescription15"></p><div class="routeButtons15"><button id="prevMap15" type="button" class="alt">← Previous map</button><button id="nextMap15" type="button">Next map →</button></div><small id="routeHint15">Preview the actual track before you race.</small>';
$('trackSelect').insertAdjacentElement('afterend',card);
const css=document.createElement('style');css.textContent='#routeCard15{margin-top:14px;padding:12px;background:#081620;border:1px solid #61d5cb44;border-radius:15px}#routePreview15{display:block;width:100%;height:auto;border-radius:10px;margin:9px 0}#routeCard15 h3{margin:9px 0 6px;font-size:19px;color:#effeff}#routeCard15 p{font-size:13px;line-height:1.5;color:#c4dbe2;margin:0 0 9px}.routeHead15{display:flex;justify-content:space-between;gap:8px;color:#8fdbd7;font-size:10px;letter-spacing:.08em;font-weight:800}.routeButtons15{display:flex;gap:8px;flex-wrap:wrap}.routeButtons15 button{font-size:12px;margin:0;padding:9px 12px}#routeHint15{display:block;margin-top:10px;line-height:1.5;color:#a4c2cc}';document.head.appendChild(css);
let cupIndex=0,shown=-1;const thumbnails=new Map();
function activeSelect(){return $('activity14').value==='cup'?$('cupTrack'+cupIndex):$('trackSelect');}
function refresh(force=false){
 const mode=$('activity14').value;card.classList.toggle('hidden',mode==='stunt');if(mode==='stunt')return;
 const select=activeSelect(),idx=Number(select.value)||0,t=D.tracks[idx];
 $('routeHint15').textContent=mode==='cup'?'Previewing championship race '+(cupIndex+1)+'. Change any of the five race choices to inspect its route.':'Preview the actual track before you race. The Start button applies your choice.';
 $('routeCount15').textContent='MAP '+String(idx+1).padStart(2,'0')+' / 30';$('routeTitle15').textContent=t.name+' • '+t.tag;$('routeDescription15').textContent=t.desc;
 if(shown!==idx||force){if(!thumbnails.has(idx))thumbnails.set(idx,Maps.preview(t));const p=$('routePreview15'),g=p.getContext('2d');g.clearRect(0,0,p.width,p.height);g.drawImage(thumbnails.get(idx),0,0,p.width,p.height);shown=idx;}
 if(mode==='quick'){$('mapTitle').textContent=t.name+' — '+t.tag;$('mapDesc').textContent=t.desc;}
}
for(const [id,step]of[['prevMap15',-1],['nextMap15',1]])$(id).onclick=()=>{const el=activeSelect();el.value=(Number(el.value)+step+D.tracks.length)%D.tracks.length;el.dispatchEvent(new Event('change',{bubbles:true}));refresh();};
$('garage').addEventListener('change',e=>{if(/^cupTrack[0-4]$/.test(e.target.id))cupIndex=Number(e.target.id.slice(-1));refresh();});
$('garage').addEventListener('click',e=>{if(e.target.closest('button'))requestAnimationFrame(()=>refresh());});
const observer=new MutationObserver(()=>{if(!$('garage').classList.contains('hidden'))refresh();});observer.observe($('garage'),{attributes:true,attributeFilter:['class']});
refresh();setTimeout(()=>refresh(),450);setTimeout(()=>refresh(),1300);
window.R95MapMenu15={refresh};
})();
