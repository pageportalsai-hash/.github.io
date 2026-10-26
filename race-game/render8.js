(()=>{
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath()}
function wheel(g,x,y,w=12,h=8){g.fillStyle='#0a0d12';rr(g,x-w/2,y-h/2,w,h,2);g.fill();g.fillStyle='#424a54';rr(g,x-w*.3,y-h*.22,w*.6,h*.44,2);g.fill()}
function glass(g,x,y,w,h,r=5){const q=g.createLinearGradient(x,y,x+w,y+h);q.addColorStop(0,'#9ee7ff');q.addColorStop(1,'#235a7c');g.fillStyle=q;rr(g,x,y,w,h,r);g.fill();g.strokeStyle='#0d2535';g.lineWidth=1.7;g.stroke()}
function lights(g,frontX,rearX,y=10){g.fillStyle='#fff0b0';rr(g,frontX,-y,7,5,2);g.fill();rr(g,frontX,y-5,7,5,2);g.fill();g.fillStyle='#ff4148';rr(g,rearX,-y,6,5,2);g.fill();rr(g,rearX,y-5,6,5,2);g.fill()}
function bodyFill(g,col){const z=g.createLinearGradient(-50,-25,45,25);z.addColorStop(0,'rgba(255,255,255,.5)');z.addColorStop(.12,col);z.addColorStop(.72,col);z.addColorStop(1,'rgba(0,0,0,.55)');return z}
function stripe(g,accent,x1=-28,x2=30){g.strokeStyle=accent;g.lineWidth=4;g.beginPath();g.moveTo(x1,0);g.lineTo(x2,0);g.stroke()}
function renderCar(g,X,Y,A,car,label=''){g.save();g.translate(X,Y);g.rotate(A);const col=car.paint||car.color||'#e53935',acc=car.accent||'#ffd54a',t=car.type||'Sedan';g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,18,38,14,0,0,7);g.fill();
if(t==='Formula'){wheel(g,-24,-27,15,8);wheel(g,18,-27,15,8);wheel(g,-24,27,15,8);wheel(g,18,27,15,8)}
else if(t==='Kart'){wheel(g,-22,-22,13,9);wheel(g,18,-22,13,9);wheel(g,-22,22,13,9);wheel(g,18,22,13,9)}
else {wheel(g,-25,-23);wheel(g,20,-23);wheel(g,-25,23);wheel(g,20,23)}
g.fillStyle=bodyFill(g,col);g.strokeStyle='#071018';g.lineWidth=3;
if(t==='Formula'){
rr(g,-42,-7,69,14,6);g.fill();g.stroke();rr(g,-10,-12,29,24,8);g.fill();g.stroke();g.fillStyle=col;g.fillRect(-55,-22,9,44);g.fillRect(27,-18,16,36);g.strokeRect(-55,-22,9,44);g.strokeRect(27,-18,16,36);glass(g,-7,-8,15,16,4);
}else if(t==='Kart'){
rr(g,-30,-13,53,26,10);g.fill();g.stroke();g.fillStyle='#333';rr(g,-8,-9,17,18,7);g.fill();g.fillStyle=col;g.fillRect(-38,-5,10,10);g.strokeRect(-38,-5,10,10);
}else if(t==='Pickup'){
rr(g,-45,-18,76,36,9);g.fill();g.stroke();g.fillStyle='#20262d';rr(g,-39,-13,26,26,3);g.fill();g.stroke();glass(g,-8,-14,27,28,6);g.fillStyle='rgba(255,255,255,.13)';g.fillRect(-34,-9,16,18);
}else if(t==='Van'){
rr(g,-43,-21,79,42,10);g.fill();g.stroke();glass(g,6,-17,22,34,5);g.fillStyle='rgba(255,255,255,.12)';rr(g,-24,-15,26,30,4);g.fill();g.strokeStyle='#0007';g.beginPath();g.moveTo(-8,-18);g.lineTo(-8,18);g.stroke();
}else if(t==='SUV'){
rr(g,-40,-22,76,44,13);g.fill();g.stroke();glass(g,-7,-17,28,34,7);g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=2;g.strokeRect(-30,-17,15,34);
}else if(t==='Muscle'){
rr(g,-45,-17,80,34,8);g.fill();g.stroke();glass(g,3,-13,22,26,5);g.fillStyle='rgba(0,0,0,.16)';rr(g,-33,-11,28,22,5);g.fill();g.strokeStyle=acc;g.lineWidth=3;g.beginPath();g.moveTo(-40,-11);g.lineTo(29,-11);g.stroke();
}else if(t==='Rally'){
rr(g,-38,-19,69,38,11);g.fill();g.stroke();glass(g,-4,-15,26,30,7);g.fillStyle='#fff6c9';for(const yy of [-10,-3,4,11]){g.beginPath();g.arc(29,yy,2.8,0,7);g.fill()}g.fillStyle=acc;g.fillRect(-39,-14,4,28);
}else if(t==='Hatchback'){
rr(g,-36,-18,65,36,13);g.fill();g.stroke();glass(g,-5,-14,25,28,8);g.strokeStyle='#0006';g.lineWidth=2;g.beginPath();g.moveTo(-18,-17);g.lineTo(-18,17);g.stroke();
}else if(t==='Wagon'){
rr(g,-42,-19,76,38,11);g.fill();g.stroke();glass(g,-7,-15,31,30,6);g.strokeStyle='#0006';g.beginPath();g.moveTo(-22,-18);g.lineTo(-22,18);g.stroke();
}else if(t==='Classic'){
g.beginPath();g.moveTo(36,0);g.quadraticCurveTo(29,-20,10,-20);g.quadraticCurveTo(-5,-27,-18,-20);g.quadraticCurveTo(-42,-18,-44,-7);g.lineTo(-44,7);g.quadraticCurveTo(-42,18,-18,20);g.quadraticCurveTo(-5,27,10,20);g.quadraticCurveTo(29,20,36,0);g.closePath();g.fill();g.stroke();glass(g,-5,-12,20,24,10);g.fillStyle='#d7d7d7';g.beginPath();g.arc(28,-13,3,0,7);g.fill();g.beginPath();g.arc(28,13,3,0,7);g.fill();
}else if(t==='Roadster'){
g.beginPath();g.moveTo(38,0);g.quadraticCurveTo(28,-19,8,-19);g.lineTo(-20,-17);g.quadraticCurveTo(-39,-12,-42,0);g.quadraticCurveTo(-39,12,-20,17);g.lineTo(8,19);g.quadraticCurveTo(28,19,38,0);g.closePath();g.fill();g.stroke();g.fillStyle='#141b22';rr(g,-4,-10,18,20,8);g.fill();
}else if(t==='Supercar'||t==='Hypercar'||t==='Coupe'){
g.beginPath();g.moveTo(42,0);g.quadraticCurveTo(31,-21,10,-23);g.lineTo(-18,-20);g.quadraticCurveTo(-36,-13,-43,-5);g.lineTo(-43,5);g.quadraticCurveTo(-36,13,-18,20);g.lineTo(10,23);g.quadraticCurveTo(31,21,42,0);g.closePath();g.fill();g.stroke();glass(g,-5,-14,27,28,9);if(t==='Hypercar'){g.fillStyle='#161d25';g.fillRect(-48,-19,6,38);g.strokeRect(-48,-19,6,38)}
}else{
rr(g,-40,-18,74,36,11);g.fill();g.stroke();glass(g,-3,-14,25,28,6);g.strokeStyle='#0006';g.beginPath();g.moveTo(-16,-17);g.lineTo(-16,17);g.stroke();
}
if(!['Formula','Kart'].includes(t)){stripe(g,acc);lights(g,26,-42)}
g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;g.beginPath();g.moveTo(-21,-14);g.lineTo(13,-17);g.stroke();
if(label){g.save();g.rotate(Math.PI/2);g.fillStyle='#fff';g.strokeStyle='#111';g.lineWidth=2;g.font='900 13px Arial';g.textAlign='center';g.textBaseline='middle';g.strokeText(label,0,2);g.fillText(label,0,2);g.restore()}
g.restore()}
window.R95Draw={renderCar};
})();