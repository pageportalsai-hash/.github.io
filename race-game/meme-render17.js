/* Race 95 v17: goofy extra visual designs for the 6 7 and Haaland Neck cars. */
(()=>{
 'use strict';
 const original=window.R95Draw?.renderCar;if(!original)return;
 const TAU=Math.PI*2;
 function rounded(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
 function glow(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
 function renderCar(c,X,Y,A,car,label=''){
   original(c,X,Y,A,car,label);
   if(!car||car.id!==101&&car.id!==102)return;
   c.save();c.translate(X,Y);c.rotate(A);
   if(car.id===101){
     // Car 102: impossible-to-miss "6 7" theme and arcade sparkles
     c.save();c.shadowColor='#fbff3b';c.shadowBlur=15;
     c.strokeStyle='#faff30';c.lineWidth=5;c.beginPath();c.moveTo(-32,-23);c.lineTo(26,-23);c.moveTo(-32,23);c.lineTo(26,23);c.stroke();c.restore();
     rounded(c,-40,-6,73,12,6,'#291b40b5');
     c.save();c.rotate(Math.PI/2);
     c.font='1000 27px system-ui,Arial';c.textAlign='center';c.textBaseline='middle';c.lineWidth=7;
     c.strokeStyle='#401550';c.strokeText('67',0,-2);c.fillStyle='#faff50';c.fillText('67',0,-2);c.restore();
     for(let j=0;j<4;j++){const a=j*TAU/4;c.save();c.translate(-15+Math.cos(a)*37,Math.sin(a)*30);
       c.rotate(a);rounded(c,-3,-3,9,6,2,j%2?'#fe53b4':'#76faff');c.restore();}
   }else{
     // Car 103: exaggerated flying footballer's long neck; stylized parody, no real photo.
     c.save();c.shadowColor='#40dbff';c.shadowBlur=11;
     c.strokeStyle='#ffe75a';c.lineWidth=6;c.beginPath();c.moveTo(-36,-22);c.lineTo(24,-22);c.moveTo(-36,22);c.lineTo(24,22);c.stroke();c.restore();
     // long cartoon spring-neck rising from the car's roof
     rounded(c,-17,-57,15,53,7,'#f8c4a0');
     c.strokeStyle='#c48a69';c.lineWidth=1.5;for(let k=0;k<5;k++){c.beginPath();c.moveTo(-15,-12-k*8);c.lineTo(-7,-16-k*8);c.stroke();}
     // head, blond ponytail and comedic eyes
     glow(c,-10,-68,18,'#f6c99e');
     c.fillStyle='#f1c53c';c.beginPath();c.arc(-10,-74,18,Math.PI,TAU);c.lineTo(-27,-66);c.fill();
     c.beginPath();c.ellipse(-25,-76,8,12,-.4,0,TAU);c.fill();
     glow(c,-16,-67,2,'#102536');glow(c,-5,-67,2,'#102536');
     c.lineWidth=2;c.strokeStyle='#824f4b';c.beginPath();c.arc(-10,-60,5,.15,Math.PI-.15);c.stroke();
     rounded(c,-25,-17,30,16,5,'#7beaff');
     c.save();c.rotate(Math.PI/2);c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.font='1000 9px Arial';c.strokeStyle='#16344b';c.fillStyle='#fffbe5';c.strokeText('GOAL!',0,3);c.fillText('GOAL!',0,3);c.restore();
   }
   c.restore();
 }
 window.R95Draw={renderCar};
})();