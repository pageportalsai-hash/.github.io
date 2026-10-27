(()=>{
const oldDraw=window.R95Draw&&window.R95Draw.renderCar;
if(!oldDraw)return;
const TAU=Math.PI*2;
function poly(c,pts,fill,stroke,width=2){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function rr(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke()}}
function kit(c,t,k,accent){
 const dark="#101821",metal="#677587";
 c.save();c.lineWidth=2;
 if(t==="Formula"){rr(c,-48,-23,7,46,2,dark,"#a3b4c5");rr(c,35,-20,7,40,2,dark,"#a3b4c5");for(const y of [-27,27]){rr(c,-29,y-7,16,13,3,"#111820",metal);rr(c,18,y-7,16,13,3,"#111820")}}
 else if(t==="Kart"){rr(c,-43,-10,13,20,5,dark,metal);rr(c,32,-17,8,34,4,accent,dark)}
 else if(t==="Pickup"){rr(c,-43,-19,26,38,3,"#131a2299","#d9edff88");for(let i=0;i<3;i++){c.strokeStyle="#bec6cf80";c.beginPath();c.moveTo(-41+i*7,-16);c.lineTo(-41+i*7,16);c.stroke()}}
 else if(t==="Van"){rr(c,-40,-18,32,36,5,"#ffffff15","#d2ecff45");rr(c,-2,-16,24,32,6,"#111d2c7d","#b8e5ff65")}
 else if(t==="SUV"){rr(c,-30,-21,6,42,2,dark,"#cad7e5");rr(c,17,-21,6,42,2,dark,"#cad7e5")}
 else if(t==="Rally"){for(let y of[-15,-5,5,15]){c.fillStyle="#fff6be";c.beginPath();c.arc(35,y,3,0,TAU);c.fill()}rr(c,-10,-19,13,6,2,"#1b2938","#ffffffa0")}
 else if(t==="Muscle"){rr(c,13,-10,17,20,4,"#11192299","#ffffff42");rr(c,18,-7,9,14,3,dark)}
 else if(t==="Classic"){for(let y of[-14,14]){c.beginPath();c.arc(31,y,6,0,TAU);c.fillStyle="#ffe4a6";c.fill();c.strokeStyle="#d6e1ed";c.lineWidth=2;c.stroke()}}
 else if(t==="Hypercar"||t==="Supercar"||t==="Coupe"){poly(c,[[20,-21],[35,-15],[43,-8],[28,-13]],dark,accent);poly(c,[[20,21],[35,15],[43,8],[28,13]],dark,accent)}
 else if(t==="Hatchback"||t==="Wagon"){rr(c,-40,-17,7,34,3,accent,dark)}
 else if(t==="Roadster"){rr(c,-8,-17,27,34,11,"#07101add","#88d2ef70")}
 if(k===0||k===5){rr(c,-47,-22,6,44,2,dark,accent)}
 if(k===1||k===6){rr(c,-43,-26,8,52,2,dark,metal)}
 if(k===2||k===7){poly(c,[[31,-19],[47,-13],[47,13],[31,19]],"#111a287f",accent)}
 if(k===3||k===8){rr(c,-18,-24,5,48,2,accent,dark);rr(c,18,-24,5,48,2,accent,dark)}
 if(k===4||k===9){rr(c,-48,-17,5,34,2,dark,"#ffffff7b");poly(c,[[34,-13],[44,-9],[44,9],[34,13]],"#1a2530",accent)}
 c.restore();
}
function livery(c,id,accent,paint){
 const pattern=id%10,shade="#0a1422";c.save();c.lineCap="round";c.lineJoin="round";
 switch(pattern){
 case 0: c.strokeStyle=accent;c.lineWidth=3;c.beginPath();c.moveTo(-27,-7);c.lineTo(31,-7);c.moveTo(-27,7);c.lineTo(31,7);c.stroke();break;
 case 1: poly(c,[[-28,-5],[25,-15],[31,-10],[-24,2]],accent);break;
 case 2: poly(c,[[-29,6],[30,-11],[34,-4],[-27,13]],accent);break;
 case 3: for(let x=-30;x<26;x+=15){poly(c,[[x,-15],[x+8,-15],[x+25,15],[x+17,15]],accent)}break;
 case 4: c.strokeStyle=accent;c.lineWidth=4;c.beginPath();c.moveTo(-37,-10);c.lineTo(27,0);c.lineTo(-37,10);c.stroke();break;
 case 5: rr(c,-30,-8,57,16,6,shade+"99");c.strokeStyle=accent;c.lineWidth=2;c.strokeRect(-27,-6,52,12);break;
 case 6: c.strokeStyle=accent;c.lineWidth=4;c.beginPath();c.moveTo(-33,-12);c.lineTo(30,-12);c.moveTo(-33,12);c.lineTo(30,12);c.stroke();break;
 case 7: poly(c,[[-36,-18],[-10,-18],[27,17],[11,17]],accent);break;
 case 8: for(const y of [-13,13]){poly(c,[[-29,y-3],[4,y-3],[28,y+1],[4,y+5]],accent)}break;
 case 9: poly(c,[[5,-17],[24,-17],[33,0],[24,17],[5,17],[16,0]],accent);break;
 }
 const edition=Math.floor(id/10);
 if(edition%2===0){rr(c,5,-6,14,12,3,"#08131a97","#def3ff7a")}
 if(edition%3===0){rr(c,20,-15,8,5,2,shade,"#eff8ff65");rr(c,20,10,8,5,2,shade,"#eff8ff65")}
 if(edition%3===1){c.strokeStyle="#d7ecff9c";c.lineWidth=1.6;c.beginPath();c.moveTo(-19,-18);c.lineTo(15,-22);c.moveTo(-19,18);c.lineTo(15,22);c.stroke()}
 if(edition%3===2){rr(c,-9,-19,18,6,2,shade);rr(c,-9,13,18,6,2,shade)}
 c.restore();
}
function renderCar(g,X,Y,A,car,label=""){
 oldDraw(g,X,Y,A,car,label);
 if(!car)return;
 const id=car.id==null?0:car.id;
 const type=car.type||"Sedan";
 const accent=car.accent||"#ffde54";
 g.save();g.translate(X,Y);g.rotate(A);
 if(id===100){
  g.shadowColor="#64dfff";g.shadowBlur=14;
  poly(g,[[-18,-17],[-52,-31],[-35,-7]],"#334f6fc9","#75e1ff");
  poly(g,[[-18,17],[-52,31],[-35,7]],"#334f6fc9","#75e1ff");
  g.shadowBlur=0;
  for(const y of[-16,16]){rr(g,-44,y-7,15,14,4,"#18232d","#9aa9bb");rr(g,-47,y-4,7,8,2,"#55deff")}
 }else{
  kit(g,type,Math.floor(id/10),accent);
  g.globalAlpha=.70;livery(g,id,accent,car.paint||car.color);g.globalAlpha=1;
  const edition=Math.floor(id/10);
  if(edition%4===0){rr(g,-34,-4,14,8,3,"#06111dd0","#d9f0ff5a")}
  if(edition%4===1){rr(g,-28,-21,7,9,2,"#fff4ad");rr(g,-28,12,7,9,2,"#fff4ad")}
  if(edition%4===2){rr(g,-42,-4,5,8,2,accent)}
  if(edition%4===3){rr(g,32,-5,10,10,2,"#152330",accent)}
 }
 g.font="bold 8px Arial";g.textAlign="center";g.textBaseline="middle";g.lineWidth=2;g.strokeStyle="#111722";g.fillStyle="#fff";
 g.save();g.rotate(Math.PI/2);const n=id===100?"101":String(id+1);g.strokeText(n,0,0);g.fillText(n,0,0);g.restore();
 g.restore();
}
window.R95Draw={renderCar};
})();