/* Race 95 v20: watch a saved driving-path replay after a finished race */
(()=>{'use strict';
const $=id=>document.getElementById(id),panel=$('megaPanel20');if(!panel)return;
const btn=document.createElement('button');btn.id='replay20';btn.type='button';btn.textContent='🎥 REPLAY LAST RACE';btn.style.margin='6px';panel.querySelector('#megaPhotos20')?.insertAdjacentElement('afterend',btn);
const dialog=document.createElement('div');dialog.id='replayDialog20';dialog.className='hidden';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
dialog.style.cssText='position:fixed;inset:0;background:#06101cee;z-index:80;display:grid;place-items:center;padding:10px';
dialog.innerHTML='<div style="width:min(740px,96vw);background:#10243a;border:2px solid #7bdfff;border-radius:18px;padding:16px;color:#fff"><h2 id="replayTitle20">Race Replay Path</h2><canvas id="replayCanvas20" width="640" height="390" style="width:100%;background:#061420;border-radius:12px"></canvas><p>Watch the path you drove in the last recorded race. This is a top-down trajectory replay, not a video recording.</p><button id="replayPlay20" type="button">▶ Play again</button><button id="replayClose20" type="button">CLOSE</button></div>';document.body.appendChild(dialog);
const cv=$('replayCanvas20'),g=cv.getContext('2d');let frames=[],pos=0,active=false,bounds=[0,0,1,1];
function load(){try{frames=JSON.parse(localStorage.getItem('r95.mega20.lastReplay')||'[]')}catch{frames=[]}if(!frames.length)return false;const xs=frames.map(p=>p.x),ys=frames.map(p=>p.y);bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];pos=0;return true}
function render(){g.fillStyle='#081a2b';g.fillRect(0,0,640,390);if(!frames.length)return;let [minX,minY,maxX,maxY]=bounds;const scale=Math.min(530/Math.max(120,maxX-minX),310/Math.max(120,maxY-minY));const X=p=>320+(p.x-(minX+maxX)/2)*scale,Y=p=>195+(p.y-(minY+maxY)/2)*scale;
g.strokeStyle='#90eafa66';g.lineWidth=2;g.beginPath();frames.forEach((p,i)=>i?g.lineTo(X(p),Y(p)):g.moveTo(X(p),Y(p)));g.stroke();
g.strokeStyle='#ffe376';g.lineWidth=4;g.beginPath();frames.slice(0,pos+1).forEach((p,i)=>i?g.lineTo(X(p),Y(p)):g.moveTo(X(p),Y(p)));g.stroke();
const v=frames[Math.min(pos,frames.length-1)];g.save();g.translate(X(v),Y(v));g.rotate(v.a);g.fillStyle='#f84e61';g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(15,0);g.lineTo(-11,-8);g.lineTo(-11,8);g.closePath();g.fill();g.stroke();g.restore();
g.font='bold 14px Arial';g.fillStyle='#d2faff';g.fillText('Position '+(pos+1)+' / '+frames.length,18,25);}
function play(){pos=0;active=true;}
btn.onclick=()=>{if(!load()){btn.textContent='🎥 Finish a race first!';return}dialog.classList.remove('hidden');$('replayTitle20').textContent='🎥 '+(localStorage.getItem('r95.mega20.lastReplayName')||'Race')+' — replay path';play();render()};
$('replayClose20').onclick=()=>{active=false;dialog.classList.add('hidden')};$('replayPlay20').onclick=play;
function frame(){if(active&&!dialog.classList.contains('hidden')){pos=Math.min(frames.length-1,pos+3);if(pos===frames.length-1)active=false;render()}requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.R95Replay20={open:()=>btn.click()};
})();