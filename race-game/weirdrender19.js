/* Race 95 v19 — custom original top-down art for every weird vehicle */
(()=>{
'use strict';
const previous=window.R95Draw?.renderCar;
if(!previous)return;
const TAU=Math.PI*2;
function rr(c,x,y,w,h,r,col,stroke){c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}}
function el(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()}
function path(c,points,col,stroke){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.closePath();c.fillStyle=col;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}}
function label(c,s,x,y,size,col){c.fillStyle=col;c.font='900 '+size+'px Arial,system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(s,x,y)}
function wheel(c,x,y){rr(c,x-8,y-5,16,10,3,'#121822','#4b5967');rr(c,x-3,y-3,6,6,2,'#808c98')}
function face(c,x,y,s,hair='#6e4e34',skin='#f1c7a7'){
 el(c,x,y,s,s,skin);c.fillStyle=hair;c.beginPath();c.arc(x,y-s*.38,s,Math.PI,TAU);c.fill();
 el(c,x-s*.35,y,1.1,1.3,'#162839');el(c,x+s*.35,y,1.1,1.3,'#162839');
 c.strokeStyle='#a45054';c.lineWidth=1.1;c.beginPath();c.arc(x,y+s*.22,s*.35,.15,Math.PI-.15);c.stroke();
}
function own(c,X,Y,A,car,labelText){
 const k=car.wacky,col=car.paint||car.color||'#f4c744',acc=car.accent||'#49faff';
 c.save();c.translate(X,Y);c.rotate(A);
 c.shadowColor='#0009';c.shadowBlur=11;c.shadowOffsetY=8;el(c,0,8,51,29,'#09111985');c.shadowBlur=0;c.shadowOffsetY=0;
 if(k!=='ufo')for(let xx of[-29,27])for(let yy of[-23,23])wheel(c,xx,yy);
 const grad=c.createLinearGradient(-45,-22,42,22);grad.addColorStop(0,'#ffffffa0');grad.addColorStop(.14,col);grad.addColorStop(.72,col);grad.addColorStop(1,'#00000080');
 if(['spy','undercover','ghost','taylor','bus'].includes(k)){
   rr(c,-47,-23,90,46,9,k==='ghost'?'#c5e5fb99':grad,'#132235');rr(c,7,-19,27,38,6,'#16344fa8','#6de8fa8a');
   if(k==='spy'){rr(c,-36,-17,39,34,5,'#0b1017','#76899b');label(c,'?',-17,0,25,'#b5f8f0');rr(c,-47,-24,12,8,3,'#181d28');}
   if(k==='undercover'){rr(c,-40,-18,34,36,5,'#1e2c32');label(c,'🍕',-22,0,25,'#fff');}
   if(k==='ghost'){c.globalAlpha=.7;for(let j=0;j<3;j++){el(c,-27+j*17,0,10,11,'#ffffff');el(c,-30+j*17,-2,2,2,'#435eae');el(c,-24+j*17,-2,2,2,'#435eae');}c.globalAlpha=1;}
   if(k==='taylor'){label(c,'★',-22,0,27,'#ffed86');label(c,'♫',18,0,18,'#ffffff');}
   if(k==='bus'){for(let j=0;j<4;j++){rr(c,-37+j*16,-15,13,29,5,j%2?'#fa5aaf':'#77f5f0');face(c,-30+j*16,0,6,j%2?'#442e2d':'#f4c05a');}}
 }else if(k==='sigma'||k==='sus'){
   path(c,[[42,0],[22,-24],[-16,-21],[-43,-8],[-43,8],[-16,21],[22,24]],grad,'#0f2336');
   rr(c,-19,-15,39,30,8,'#142840','#8aebff');label(c,k==='sigma'?'Σ':'?',2,0,30,k==='sigma'?'#f4adff':'#a5ff78');
 }else if(k==='ufo'){
   c.shadowColor='#7eeaff';c.shadowBlur=21;el(c,0,0,49,27,'#52c6d9');el(c,0,-4,31,17,'#93f0ff');el(c,2,-8,19,13,'#18325e');c.shadowBlur=0;
   for(let xx of[-30,-15,0,15,30])el(c,xx,12,4,4,xx%3?'#e869ff':'#fffaaa');
 }else if(k==='banana'){
   c.beginPath();c.moveTo(-44,-8);c.bezierCurveTo(-10,-36,23,-30,48,9);c.bezierCurveTo(17,-7,-13,-3,-34,15);c.quadraticCurveTo(-44,17,-44,-8);c.fillStyle=grad;c.fill();c.strokeStyle='#76551b';c.lineWidth=3;c.stroke();
   rr(c,-43,-9,10,13,4,'#7c6a18');rr(c,36,4,13,9,4,'#639b2a');
   el(c,7,-9,13,8,'#83eff5');label(c,'🚀',-23,3,17,'#fff');
 }else if(k==='toilet'){
   rr(c,-39,-20,19,40,5,'#f5f8ff','#698aa5');el(c,7,0,34,23,'#edf5ff');el(c,9,0,24,17,'#638da9');el(c,9,0,17,11,'#c4f5ff');rr(c,34,-16,8,32,3,'#d4e6f3');label(c,'GO!',-29,0,10,'#243d65');
 }else if(k==='duck'){
   el(c,-6,0,41,23,grad);el(c,17,-7,19,18,'#ffe249');path(c,[[29,-12],[49,-5],[29,2]],'#ff9c35');el(c,21,-12,3,3,'#15223b');el(c,-20,-15,13,7,'#f6e266');
 }else if(k==='hotdog'){
   el(c,0,0,45,23,'#edb66c');el(c,0,0,39,15,'#e34e4e');c.strokeStyle='#f9e343';c.lineWidth=5;c.beginPath();for(let xx=-35;xx<36;xx+=5){const yy=Math.sin(xx*.25)*6;if(xx===-35)c.moveTo(xx,yy);else c.lineTo(xx,yy);}c.stroke();
 }else if(k==='pizza'){
   path(c,[[-44,-22],[-44,22],[43,0]],'#ffe2a0','#aa6845');path(c,[[-35,-15],[-35,15],[29,0]],'#f7bc5c');
   for(const [xx,yy] of [[-20,-10],[-18,12],[4,-2],[5,9]])el(c,xx,yy,6,6,'#bf403b');
   rr(c,-47,-24,10,48,5,'#d69e60');
 }else if(k==='shoe'){
   path(c,[[-43,13],[-41,-12],[-16,-22],[12,-22],[23,-8],[43,-5],[46,20],[-45,20]],grad,'#23354e');rr(c,-42,11,89,12,4,'#f3f8ff','#1d324e');
   for(let xx=-20;xx<19;xx+=10){c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(xx,-15);c.lineTo(xx+10,1);c.stroke();}
 }else if(k==='nugget'){
   path(c,[[-43,-7],[-28,-25],[-6,-23],[12,-28],[38,-10],[39,16],[12,24],[-15,18],[-36,22]],'#d4a34c','#86582b');
   for(let j=0;j<12;j++)el(c,-28+(j*17)%61,-13+(j*11)%27,2,2,'#ffecb1');
 }else if(k==='fridge'){
   rr(c,-39,-26,75,52,6,'#f1f8ff','#8295b4');rr(c,-32,-20,63,21,3,'#d9e5f0');rr(c,-32,4,63,16,3,'#e5f2fa');
   rr(c,21,-15,4,12,2,'#93a7bd');rr(c,21,8,4,8,2,'#93a7bd');label(c,'❄',-7,-10,19,'#48b5ef');label(c,'♪',-5,12,16,'#d054c7');
 }else if(k==='unicorn'){
   el(c,-5,1,42,20,'#ffc2e9');el(c,15,-4,20,18,'#fff7fb');path(c,[[24,-19],[39,-38],[32,-12]],'#ffdb65');el(c,21,-9,2,2,'#243049');
   const rainbow=['#ff686a','#ffc94c','#60d991','#68bbfa','#a970eb'];for(let i=0;i<5;i++)rr(c,-41+i*5,-18+i*5,24,5,2,rainbow[i]);
 }else if(k==='buggy'){
   for(const xx of[-35,0,32])for(const y of[-27,27])wheel(c,xx,y);
   rr(c,-45,-14,89,28,8,'#687e91','#dce9f6');el(c,4,0,21,15,'#c4faff');face(c,3,0,8,'#ffffff');rr(c,-39,-9,19,18,4,'#cba263');
 }else if(k==='rock'){
   path(c,[[-43,-17],[-22,-26],[10,-27],[41,-10],[44,13],[13,27],[-17,22],[-44,11]],'#777e84','#cbd5de');
   path(c,[[-16,-24],[10,-27],[29,-11],[9,0],[-22,-2]],'#a8acb2');path(c,[[9,0],[29,-11],[43,14],[13,27]],'#535c66');
   label(c,'💪',-20,8,22,'#fff');
 }else{
   // Celebrity-themed cars use symbols rather than photos or official branding.
   rr(c,-44,-22,87,44,13,grad,'#122638');rr(c,-12,-17,38,34,8,'#17374a','#b7e8ff');
   if(k==='ronaldo'||k==='messi'){const number=k==='ronaldo'?'7':'10';
     el(c,-20,0,16,16,k==='ronaldo'?'#df334b':'#82c9ff');label(c,number,-20,0,17,'#ffffff');
     el(c,32,0,10,10,'#fff');for(let i=0;i<5;i++)el(c,32+Math.sin(i*T/5)*5,Math.cos(i*T/5)*5,2,2,'#192939');
   }
   if(k==='einstein'){face(c,-20,-2,16,'#e7e9ed');label(c,'E=mc²',18,0,12,'#f7faff');}
   if(k==='lebron'){el(c,-20,0,18,18,'#ea8c33');c.strokeStyle='#633617';c.lineWidth=2;c.beginPath();c.moveTo(-35,0);c.lineTo(-5,0);c.moveTo(-20,-16);c.lineTo(-20,16);c.stroke();label(c,'23',22,0,20,'#ffe4c1');}
   if(k==='mrbeast'){label(c,'$',-20,0,31,'#fff');label(c,'GOLD',22,0,10,'#283440');}
 }
 // headlights and shine
 if(k!=='ufo'){rr(c,31,-18,9,6,2,'#fff7c1');rr(c,31,12,9,6,2,'#fff7c1');c.strokeStyle='#ffffffa0';c.lineWidth=1.8;c.beginPath();c.moveTo(-25,-17);c.lineTo(11,-20);c.stroke();}
 c.restore();
}
function renderCar(c,X,Y,A,car,tag=''){
 if(car?.wacky)return own(c,X,Y,A,car,tag);
 return previous(c,X,Y,A,car,tag);
}
window.R95Draw={renderCar};
})();