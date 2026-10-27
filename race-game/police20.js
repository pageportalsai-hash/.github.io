/* Race 95 v20: wanted stars, police helicopter searchlights, roadblocks */
(()=>{'use strict';
const E=window.R95Expansion16;if(!E)return;
const origDraw=E.draw,origMove=E.move,origUpdate=E.update,origStatus=E.status;
const blocks=[{x:515,y:290,a:.1},{x:830,y:530,a:-.3},{x:340,y:470,a:1.3}];
let heat=1,elapsed=0;
const police=()=>E.snapshot?.()?.mode==='police';
function update(track,cars,dt,session){const result=origUpdate(track,cars,dt,session);if(police()){elapsed+=dt;const p=cars.find(o=>o.kind==='p1');heat=Math.min(5,Math.max(1,Math.floor(elapsed/23)+1+(p&&p.v>5?1:0)));}else{heat=1;elapsed=0;}return result}
function move(o,dt,track){const oldX=o.x,oldY=o.y;origMove(o,dt,track);if(police()&&o.kind!=='ai'){for(const b of blocks){const dx=o.x-b.x,dy=o.y-b.y;if(Math.hypot(dx,dy)<36){const a=Math.atan2(dy,dx);o.x=b.x+Math.cos(a)*39;o.y=b.y+Math.sin(a)*39;o.v*=.85;break}}}}
function helicopter(g,x,y,time){g.save();g.translate(x,y);const a=time*.55;g.rotate(a);g.shadowColor='#8acfff';g.shadowBlur=15;g.fillStyle='#202d44';g.beginPath();g.ellipse(0,0,22,13,0,0,Math.PI*2);g.fill();g.shadowBlur=0;
 g.fillStyle='#fff5cf';g.beginPath();g.moveTo(3,8);g.lineTo(78,77);g.lineTo(-37,93);g.closePath();g.fill();g.strokeStyle='#e6efff';g.lineWidth=5;g.beginPath();g.moveTo(-32,0);g.lineTo(32,0);g.moveTo(0,-27);g.lineTo(0,27);g.stroke();g.fillStyle='#f55';g.beginPath();g.arc(18,-8,4,0,Math.PI*2);g.fill();g.restore();}
function draw(g,track,cars){origDraw(g,track,cars);if(!police())return;const t=performance.now()/1000;
for(let j=0;j<Math.min(heat,blocks.length);j++){const b=blocks[j];g.save();g.translate(b.x,b.y);g.rotate(b.a);g.fillStyle='#222831';g.fillRect(-28,-9,56,18);g.fillStyle='#eec951';for(let k=0;k<5;k++)g.fillRect(-26+k*11,-8,6,16);g.strokeStyle='#f86b75';g.lineWidth=3;g.strokeRect(-28,-9,56,18);g.restore();}
 const p=cars.find(x=>x.kind==='p1');if(p){const hx=p.x+Math.cos(t*.7)*110,hy=p.y-100+Math.sin(t*.6)*70;helicopter(g,hx,hy,t);if(heat>=4)helicopter(g,p.x-120,p.y+90,t+1.9)}
 g.save();g.font='900 19px Arial';g.fillStyle='#ffe387';g.fillText('WANTED: '+'★'.repeat(heat)+'☆'.repeat(5-heat),30,100);g.restore();
}
function status(track,cars){return origStatus(track,cars)+(police()?'\nWANTED LEVEL '+heat+'/5 • Helicopter patrols & roadblocks':'')}
E.draw=draw;E.move=move;E.update=update;E.status=status;
window.R95Police20={get wanted(){return heat},blocks};
})();