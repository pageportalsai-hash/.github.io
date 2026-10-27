(()=>{
function seed(n){return()=>{n=(Math.imul(1664525,n)+1013904223)|0;return(n>>>0)/4294967296}}
function rect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
function ell(c,x,y,rx,ry,col){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill()}
function tree(c,x,y,s,kind){c.save();c.translate(x,y);ell(c,s*.23,s*.34,s*.9,s*.46,"#00000031");
 if(kind==="snow"||kind==="forest"){rect(c,-s*.08,-s*.1,s*.16,s*.65,"#5b4833");for(let i=2;i>=0;i--){c.beginPath();c.moveTo(0,-s*.85+i*s*.23);c.lineTo(-s*(.48-i*.07),s*.24+i*s*.1);c.lineTo(s*(.48-i*.07),s*.24+i*s*.1);c.closePath();c.fillStyle=kind==="snow"?(i%2?"#4f8f79":"#91d0bc"):(i%2?"#246d39":"#33894d");c.fill()}}
 else {rect(c,-s*.08,0,s*.17,s*.6,"#704726");for(const q of [[0,0,.58],[-.3,.12,.40],[.29,.1,.42]]){ell(c,q[0]*s,q[1]*s,q[2]*s,q[2]*s,"#205f31");ell(c,(q[0]-.06)*s,(q[1]-.08)*s,q[2]*s*.75,q[2]*s*.75,"#348e43")}}
 c.restore()}
function building(c,x,y,w,h,shade,night,rand){c.save();c.translate(x,y);rect(c,6,8,w,h,"#0000004a");rect(c,0,0,w,h,shade);rect(c,5,5,w-10,h-10,night?"#202c52":"#566c7a");rect(c,10,10,w-20,7,night?"#60d7ff":"#c7dfe8");rect(c,10,h-17,w-20,6,night?"#ef55ff":"#8295a4");if(rand()>.4){rect(c,w*.30,h*.35,w*.4,h*.3,"#172539");rect(c,w*.35,h*.4,w*.3,h*.2,night?"#ffcf4e":"#7b8794")}c.restore()}
function cactus(c,x,y,s){rect(c,x-3,y-s*.4,6,s*.8,"#27794d");rect(c,x-8,y-2,6,5,"#27794d");rect(c,x-9,y-s*.24,4,s*.25,"#27794d");rect(c,x+3,y-s*.13,8,5,"#27794d");rect(c,x+8,y-s*.35,4,s*.26,"#27794d")}
function rock(c,x,y,s,col){ell(c,x+3,y+4,s*.9,s*.55,"#0000003b");c.beginPath();c.moveTo(x-s,y+s*.2);c.lineTo(x-s*.58,y-s*.8);c.lineTo(x+s*.3,y-s*.9);c.lineTo(x+s,y-s*.15);c.lineTo(x+s*.65,y+s*.42);c.closePath();c.fillStyle=col;c.fill();c.strokeStyle="#ffffff29";c.lineWidth=2;c.stroke()}
function paintGround(c,t,W,H){
 const r=seed(251+t.id*65537),kind=t.theme,night=kind==="night"||t.name.includes("Night")||t.name.includes("Neon");
 c.save();
 if(kind==="coast"||kind==="harbor"||kind==="tropical"||t.name.includes("Lake")||t.name.includes("Beach")){
  const wave=c.createLinearGradient(0,H*.72,0,H);wave.addColorStop(0,"#3aaec1");wave.addColorStop(.95,"#124e89");c.fillStyle=wave;c.beginPath();c.moveTo(0,H*.85);for(let x=0;x<=W;x+=12)c.lineTo(x,H*.82+22*Math.sin(x*.006+t.id));c.lineTo(W,H);c.lineTo(0,H);c.closePath();c.fill();for(let i=0;i<75;i++){let x=r()*W,y=H*.84+r()*H*.16;rect(c,x,y,3+r()*22,1,"#e6ffff3d")}}
 if(kind==="city"||kind==="night"||kind==="airport"||kind==="harbor"){
  for(let i=0;i<22;i++){const x=10+(i%6)*210+(r()-.5)*25,y=15+Math.floor(i/6)*170+(r()-.5)*30,w=60+r()*100,h=45+r()*70;building(c,x,y,w,h,night?"#0d1b33":"#354350",night,r)}
  if(kind==="airport"){for(let i=0;i<9;i++){rect(c,10,40+i*75,W-20,17,"#e4e8ef14");for(let x=20;x<W;x+=120)rect(c,x,48+i*75,40,2,"#f5dc8a55")}}
 }else if(kind==="grass"||kind==="forest"||kind==="tropical"){
  for(let i=0;i<170;i++){const x=r()*W,y=r()*H,s=8+r()*29;tree(c,x,y,s,kind==="forest"?"forest":"grass")}
  for(let i=0;i<85;i++){let x=r()*W,y=r()*H;ell(c,x,y,3+r()*4,2+r()*3,r()>.5?"#f7e491":"#eee6ff")}
 }else if(kind==="snow"){
  for(let i=0;i<120;i++){let x=r()*W,y=r()*H,s=12+r()*23;tree(c,x,y,s,"snow");ell(c,x+7,y+15,s*.7,s*.24,"#ffffff61")}
  for(let i=0;i<50;i++)ell(c,r()*W,r()*H,5+r()*35,2+r()*14,"#ffffffa5");
 }else if(kind==="desert"||kind==="canyon"){
  for(let i=0;i<100;i++){let x=r()*W,y=r()*H,s=5+r()*14;if(r()>.42)cactus(c,x,y,s);else rock(c,x,y,s,kind==="canyon"?"#915231":"#c49554")}
  for(let i=0;i<16;i++)ell(c,r()*W,r()*H,30+r()*75,10+r()*22,"#e8bd7955");
 }else if(kind==="volcano"){
  for(let i=0;i<78;i++)rock(c,r()*W,r()*H,8+r()*20,"#442e31");
  c.strokeStyle="#ff5f22";c.lineWidth=4;c.shadowColor="#ff6d22";c.shadowBlur=12;for(let i=0;i<18;i++){let x=r()*W,y=r()*H;c.beginPath();c.moveTo(x,y);for(let j=0;j<5;j++)c.lineTo(x+(j+1)*8,y+Math.sin(j*2+i)*9);c.stroke()}c.shadowBlur=0;
 }
 if(t.name.includes("Castle")){for(let i=0;i<4;i++){let x=30+i*330,y=20+(i%2)*600;rect(c,x,y,78,76,"#aab0ba");for(let j=0;j<4;j++)rect(c,x+j*19,y-14,12,18,"#ccd4d9");rect(c,x+26,y+26,22,34,"#586270")}}
 if(t.name.includes("Factory")){for(let i=0;i<8;i++){let x=40+(i%4)*300,y=40+Math.floor(i/4)*570;building(c,x,y,95,62,"#59616b",false,r);for(let j=0;j<3;j++)rect(c,x+9+j*26,y-22,11,22,"#838b96")}}
 if(t.name.includes("Farmland")){for(let i=0;i<16;i++){let x=(i%4)*320,y=Math.floor(i/4)*190;rect(c,x+8,y+16,220,88,i%2?"#94a94585":"#d7b36c88");for(let j=0;j<6;j++)rect(c,x+8,y+16+j*14,220,4,"#435c2880")}}
 if(t.name.includes("Storm")){c.fillStyle="#31445246";c.fillRect(0,0,W,H);for(let i=0;i<35;i++){c.strokeStyle="#d9ebff43";c.lineWidth=1;c.beginPath();let x=r()*W,y=r()*H;c.moveTo(x,y);c.lineTo(x-9,y+23);c.stroke()}}
 c.restore();
}
function paintRoad(c,t,path,road){
 const night=t.theme==="night"||t.name.includes("Neon")||t.name.includes("Night");
 c.save();
 let start=path[0],a=Math.atan2(start.ty,start.tx);
 c.translate(start.x,start.y);c.rotate(a);
 for(let j=-road*.4,k=0;j<road*.4;j+=13,k++)for(let i=-14,q=0;i<14;i+=14,q++){rect(c,i,j,14,13,(k+q)%2?"#11151c":"#f4f4f4")}
 c.restore();
 for(let i=0;i<path.length;i+=17){
  const p=path[i],ang=Math.atan2(p.ty,p.tx);
  c.save();c.translate(p.x,p.y);c.rotate(ang);
  c.fillStyle=night?"#72f7ff":"#fff4ac";c.globalAlpha=night?.72:.35;
  rect(c,-7,-road*.39,14,3);rect(c,-7,road*.39-3,14,3);c.globalAlpha=1;c.restore();
 }
 for(let i=0;i<path.length;i+=27){
  const p=path[i];for(const side of[-1,1]){
   const px=p.x+p.nx*road*.76*side,py=p.y+p.ny*road*.76*side;
   c.save();c.translate(px,py);c.shadowColor=night?"#38e9ff":"#ffe4a5";c.shadowBlur=night?14:4;
   ell(c,0,0,5,5,night?"#8bfaff":"#fff6d6");c.shadowBlur=0;
   c.fillStyle="#29333f";c.fillRect(-1,-2,2,13);c.restore();
  }
 }
 if(t.id%5===0||t.name.includes("Champion")){
  for(let i=25;i<path.length;i+=105){const p=path[i];c.save();c.translate(p.x+p.nx*(road*.9),p.y+p.ny*(road*.9));c.rotate(Math.atan2(p.ty,p.tx));rect(c,-25,-9,50,18,"#101822cc");c.fillStyle="#fff";c.font="bold 9px Arial";c.textAlign="center";c.fillText("RACE 95",0,3);c.restore()}
 }
 c.restore();
}
window.R95Map12={paintGround,paintRoad};
})();