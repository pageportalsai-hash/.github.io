(()=>{
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function shade(hex,amt){let c=hex.replace('#',''),n=parseInt(c,16),r=(n>>16)+amt,g=((n>>8)&255)+amt,b=(n&255)+amt;return `rgb(${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)})`}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath()}
R95.drawCar=function(c,x,y,a,car,color,number='95',scale=1){
 c.save();c.translate(x,y);c.rotate(a);c.scale(scale,scale);
 const col=color||car.defaultColor,acc=car.accent,variant=car.variant||0,shape=car.shape;
 c.fillStyle='rgba(0,0,0,.34)';c.beginPath();c.ellipse(0,19,38,15,0,0,Math.PI*2);c.fill();
 const wheel=(wx,wy,w=13,h=9)=>{c.fillStyle='#0b1017';rr(c,wx-w/2,wy-h/2,w,h,3);c.fill();c.fillStyle='#303844';rr(c,wx-w/2+2,wy-h/2+2,w-4,h-4,2);c.fill()};
 let wheelX=31,wheelY=21;if(['suv','pickup','offroad','van','dune'].includes(shape)){wheelX=34;wheelY=23}if(shape==='formula'){wheelX=32;wheelY=25}if(shape==='kart'){wheelX=27;wheelY=20}
 wheel(-wheelX,-wheelY);wheel(wheelX,-wheelY);wheel(-wheelX,wheelY);wheel(wheelX,wheelY);
 const body=c.createLinearGradient(-50,-25,50,25);body.addColorStop(0,'rgba(255,255,255,.55)');body.addColorStop(.08,shade(col,18));body.addColorStop(.48,col);body.addColorStop(.82,shade(col,-20));body.addColorStop(1,shade(col,-45));c.fillStyle=body;c.strokeStyle='#051019';c.lineWidth=3.5;
 if(shape==='formula'){rr(c,-43,-8,72,16,7);c.fill();c.stroke();rr(c,-8,-15,28,30,8);c.fill();c.stroke();c.fillStyle=shade(col,-22);c.fillRect(-57,-23,8,46);c.fillRect(31,-20,13,8);c.fillRect(31,12,13,8)}
 else if(shape==='kart'){rr(c,-31,-15,55,30,11);c.fill();c.stroke();c.fillStyle=shade(col,-18);rr(c,-43,-7,12,14,3);c.fill()}
 else if(shape==='van'){rr(c,-43,-22,79,44,10);c.fill();c.stroke();c.fillStyle=shade(col,-12);rr(c,-8,-20,31,40,8);c.fill();c.stroke()}
 else if(shape==='pickup'){rr(c,-44,-19,76,38,11);c.fill();c.stroke();c.fillStyle='#18222d';rr(c,-34,-13,25,26,4);c.fill();c.fillStyle=body;rr(c,-5,-17,32,34,8);c.fill();c.stroke()}
 else if(shape==='suv'||shape==='offroad'){rr(c,-41,-23,78,46,14);c.fill();c.stroke();if(shape==='offroad'){c.fillStyle=shade(col,-28);c.fillRect(-48,-24,8,48);c.fillRect(36,-24,8,48)}}
 else if(shape==='hatch'||shape==='compact'){rr(c,-36,-19,65,38,14);c.fill();c.stroke()}
 else if(shape==='muscle'||shape==='stock'){rr(c,-44,-18,80,36,9);c.fill();c.stroke();c.fillStyle=shade(col,-20);rr(c,4,-15,25,30,6);c.fill();c.stroke()}
 else if(shape==='classic'||shape==='retro'){c.beginPath();c.moveTo(37,0);c.lineTo(25,-17);c.quadraticCurveTo(2,-25,-23,-19);c.lineTo(-41,-10);c.lineTo(-41,10);c.lineTo(-23,19);c.quadraticCurveTo(2,25,25,17);c.closePath();c.fill();c.stroke()}
 else if(shape==='dragster'){rr(c,-47,-7,76,14,6);c.fill();c.stroke();rr(c,10,-13,23,26,8);c.fill();c.stroke();c.fillStyle=shade(col,-25);c.fillRect(-58,-20,7,40)}
 else if(shape==='dune'){c.strokeStyle=col;c.lineWidth=6;c.beginPath();c.moveTo(-34,-17);c.lineTo(15,-17);c.lineTo(34,0);c.lineTo(15,17);c.lineTo(-34,17);c.closePath();c.stroke();c.fillStyle=shade(col,-15);rr(c,-20,-13,29,26,8);c.fill()}
 else if(shape==='roadster'){c.beginPath();c.moveTo(40,0);c.quadraticCurveTo(27,-21,5,-22);c.lineTo(-23,-19);c.quadraticCurveTo(-37,-13,-43,-5);c.lineTo(-43,5);c.quadraticCurveTo(-37,13,-23,19);c.lineTo(5,22);c.quadraticCurveTo(27,21,40,0);c.fill();c.stroke()}
 else if(shape==='hypercar'||shape==='supercar'||shape==='prototype'){c.beginPath();c.moveTo(44,0);c.quadraticCurveTo(30,-23,8,-25);c.lineTo(-18,-22);c.quadraticCurveTo(-35,-16,-45,-7);c.lineTo(-45,7);c.quadraticCurveTo(-35,16,-18,22);c.lineTo(8,25);c.quadraticCurveTo(30,23,44,0);c.fill();c.stroke();if(shape==='prototype'){c.fillStyle=shade(col,-25);c.fillRect(-51,-21,8,42)}}
 else if(shape==='gt'||shape==='coupe'||shape==='tuner'){c.beginPath();c.moveTo(41,0);c.lineTo(29,-18);c.quadraticCurveTo(4,-28,-25,-20);c.lineTo(-42,-9);c.lineTo(-42,9);c.lineTo(-25,20);c.quadraticCurveTo(4,28,29,18);c.closePath();c.fill();c.stroke()}
 else if(shape==='luxury'||shape==='sedan'||shape==='electric'||shape==='touring'){rr(c,-41,-20,76,40,11);c.fill();c.stroke();c.fillStyle=shade(col,-12);rr(c,-4,-17,27,34,7);c.fill();c.stroke()}
 else if(shape==='rally'){rr(c,-38,-19,70,38,12);c.fill();c.stroke()}
 else{rr(c,-40,-20,74,40,12);c.fill();c.stroke()}
 c.fillStyle='#31baf4';c.strokeStyle='#07131d';c.lineWidth=2.5;if(shape==='formula'||shape==='kart'||shape==='dune'){rr(c,-4,-10,18,20,6);c.fill();c.stroke()}else{c.beginPath();c.moveTo(13,0);c.lineTo(4,-12);c.lineTo(-15,-10);c.lineTo(-21,0);c.lineTo(-15,10);c.lineTo(4,12);c.closePath();c.fill();c.stroke()}
 c.strokeStyle=acc;c.lineWidth=4;if(variant===0){c.beginPath();c.moveTo(-28,-9);c.lineTo(29,-5);c.stroke()}else if(variant===1){c.beginPath();c.moveTo(-30,0);c.lineTo(31,0);c.stroke();c.beginPath();c.moveTo(-14,-13);c.lineTo(-14,13);c.stroke()}else if(variant===2){c.beginPath();c.moveTo(-28,-12);c.lineTo(28,8);c.stroke();c.beginPath();c.moveTo(-28,12);c.lineTo(15,-6);c.stroke()}else{c.setLineDash([9,6]);c.beginPath();c.moveTo(-30,-8);c.lineTo(31,-8);c.stroke();c.beginPath();c.moveTo(-30,8);c.lineTo(31,8);c.stroke();c.setLineDash([])}
 c.strokeStyle='rgba(255,255,255,.72)';c.lineWidth=2;c.beginPath();c.moveTo(-22,-15);c.lineTo(15,-19);c.stroke();c.fillStyle='#fff3b0';rr(c,24,-11,8,4,2);c.fill();rr(c,24,7,8,4,2);c.fill();c.fillStyle='#ff4055';rr(c,-41,-9,6,4,2);c.fill();rr(c,-41,5,6,4,2);c.fill();
 if(['supercar','hypercar','prototype','rally','stock','touring','tuner'].includes(shape)||variant===3){c.fillStyle='#151b23';rr(c,-51,-20,7,40,2);c.fill()}if(shape==='rally'){c.fillStyle='#fff7b0';for(const yy of [-9,-3,3,9]){c.beginPath();c.arc(32,yy,3,0,Math.PI*2);c.fill()}}
 c.save();c.rotate(Math.PI/2);c.fillStyle='#fff';c.strokeStyle='#111';c.lineWidth=2.2;c.font='900 14px Arial';c.textAlign='center';c.textBaseline='middle';c.strokeText(number,0,2);c.fillText(number,0,2);c.restore();c.restore();
};
R95.clamp=clamp;
})();