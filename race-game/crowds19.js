/* Race 95 v19 — fans, photographers and famous-guest silhouettes beside all circuits */
(()=>{
'use strict';
const Art=window.R95Map12;if(!Art||typeof Art.paintRoad!=='function')return;
const old=Art.paintRoad,TAU=Math.PI*2;
function drawPerson(c,x,y,sz,shirt,hair){
 c.save();c.translate(x,y);c.shadowColor='#0006';c.shadowBlur=4;
 c.fillStyle='#0003';c.beginPath();c.ellipse(2,sz*.42,sz*.55,sz*.2,0,0,TAU);c.fill();c.shadowBlur=0;
 c.fillStyle=shirt;c.beginPath();c.roundRect(-sz*.4,-sz*.03,sz*.8,sz*.7,sz*.24);c.fill();
 c.strokeStyle='#d9ac8d';c.lineWidth=Math.max(1,sz*.12);c.lineCap='round';
 c.beginPath();c.moveTo(-sz*.31,sz*.24);c.lineTo(-sz*.62,-sz*.07);
 c.moveTo(sz*.31,sz*.24);c.lineTo(sz*.6,-sz*.21);c.stroke();
 c.fillStyle='#e9bb92';c.beginPath();c.arc(0,-sz*.35,sz*.32,0,TAU);c.fill();
 c.fillStyle=hair;c.beginPath();c.arc(0,-sz*.47,sz*.31,Math.PI,TAU);c.fill();
 c.fillStyle='#193146';for(const s of[-1,1]){c.beginPath();c.arc(s*sz*.11,-sz*.34,sz*.035,0,TAU);c.fill();}
 c.restore();
}
function paintFans(c,t,route,width){
 old(c,t,route,width);
 if(!route||!route.length)return;
 const themed=['#ec4e89','#f9d45b','#3bd7d0','#8e8efc','#ffffff','#70db76'],hair=['#45342e','#e9b750','#603c38','#1c2733'];
 c.save();
 let band=0;
 const offset=Math.ceil(route.length/11);
 for(let i=16;i<route.length;i+=offset){
  const p=route[i],side=band%2?1:-1,normal=Math.hypot(p.nx||0,p.ny||0)||1;
  const cx=p.x+(p.nx/normal)*(width*.78+20)*side,cy=p.y+(p.ny/normal)*(width*.78+20)*side;
  if(cx<22||cy<22||cx>1180||cy>700){band++;continue;}
  c.save();c.translate(cx,cy);c.rotate(Math.atan2(p.ty,p.tx));
  // Fan stands, camera flash and group barriers outside the race track.
  c.fillStyle='#081a2c6e';c.fillRect(-40,-25,80,50);
  c.strokeStyle='#f2f6ff';c.lineWidth=3;c.strokeRect(-40,-25,80,50);
  for(let j=0;j<5;j++)drawPerson(c,-28+j*14,(j%2)*16-6,13,themed[(band+j+t.id)%themed.length],hair[(band+j)%hair.length]);
  if(band%4===0){c.fillStyle='#ffffff';c.fillRect(17,-35,3,16);c.fillStyle=themed[band%themed.length];c.beginPath();c.moveTo(20,-35);c.lineTo(41,-28);c.lineTo(20,-21);c.fill();}
  if(band%5===0){c.fillStyle='#121826';c.fillRect(-38,-32,16,11);c.fillStyle='#5eefff';c.fillRect(-34,-29,7,5);}
  c.restore();band++;
 }
 c.restore();
}
Art.paintRoad=paintFans;
window.R95Spectators19={version:19,groups:band};
})();