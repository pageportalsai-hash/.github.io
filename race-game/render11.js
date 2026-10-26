(()=>{
const base=window.R95Draw&&window.R95Draw.renderCar;if(!base)return;
const special={P1:{flying:false,boost:false,fuel:100},P2:{flying:false,boost:false,fuel:100}};
addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat)special.P1.flying=!special.P1.flying;if(e.code==='Enter'&&!e.repeat)special.P2.flying=!special.P2.flying;if(e.code==='ShiftLeft')special.P1.boost=true;if(e.code==='ShiftRight')special.P2.boost=true});
addEventListener('keyup',e=>{if(e.code==='ShiftLeft')special.P1.boost=false;if(e.code==='ShiftRight')special.P2.boost=false});
function drawFX(g,X,Y,A,car,label,st){
 const lift=st.flying?12:0;
 g.save();g.translate(X,Y-lift);g.rotate(A);
 if(st.flying){g.shadowColor='#4bd8ff';g.shadowBlur=18;g.fillStyle='rgba(30,170,255,.48)';g.beginPath();g.moveTo(-7,-18);g.lineTo(-44,-36);g.lineTo(-30,-8);g.closePath();g.fill();g.beginPath();g.moveTo(-7,18);g.lineTo(-44,36);g.lineTo(-30,8);g.closePath();g.fill();g.shadowBlur=0;g.fillStyle='#1d232c';for(const yy of[-14,14]){g.beginPath();g.arc(-36,yy,8,0,Math.PI*2);g.fill();g.fillStyle='#64eaff';g.beginPath();g.arc(-36,yy,4,0,Math.PI*2);g.fill();g.fillStyle='#1d232c'}}
 if(st.boost&&st.fuel>0){const len=72+Math.random()*24,gr=g.createLinearGradient(-38,0,-38-len,0);gr.addColorStop(0,'#fff');gr.addColorStop(.15,'#68eaff');gr.addColorStop(.48,'#6f5cff');gr.addColorStop(1,'rgba(255,70,20,0)');g.fillStyle=gr;for(const yy of[-13,13]){g.beginPath();g.moveTo(-38,yy-6);g.lineTo(-38-len,yy);g.lineTo(-38,yy+6);g.closePath();g.fill()}}
 g.restore();
}
function specialCar(g,X,Y,A,car,label){const key=label==='P2'?'P2':'P1',st=special[key];car._baseMax??=car.max;car._baseAcc??=car.acc;car._baseTurn??=car.turn;if(st.boost&&st.fuel>0){st.fuel=Math.max(0,st.fuel-.75);car.max=11.5;car.acc=.34;car.turn=.060}else{st.fuel=Math.min(100,st.fuel+.16);car.max=st.flying?8.2:car._baseMax;car.acc=st.flying?.13:car._baseAcc;car.turn=st.flying?.063:car._baseTurn}const lift=st.flying?12:0;base(g,X,Y-lift,A,car,label);drawFX(g,X,Y,A,car,label,st)}
window.R95Draw={renderCar(g,X,Y,A,car,label=''){if(car&&car.id===100)return specialCar(g,X,Y,A,car,label);return base(g,X,Y,A,car,label)}};
window.R95Car101=special;
})();
