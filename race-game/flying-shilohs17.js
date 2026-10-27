/* Race 95 v17: original cartoon "Flying Shilohs" meme animation */
(()=>{
'use strict';
const root=document.getElementById('app'),base=document.getElementById('game');
if(!root||!base||document.getElementById('flyingShilohs17'))return;
const W=base.width,H=base.height,canvas=document.createElement('canvas');
canvas.width=W;canvas.height=H;canvas.id='flyingShilohs17';
Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'contain',zIndex:'2',pointerEvents:'none'});
root.appendChild(canvas);
const g=canvas.getContext('2d'),T=Math.PI*2;
const colors=[['#20cee9','#ffe56b','#8c572a'],['#f37dc8','#a5f5ff','#633c25'],['#aa8bfa','#6ff3ac','#9c5c35'],['#5df1a7','#ffdc72','#5c3c23'],['#fbb256','#8edfff','#b4793b'],['#80adfb','#ffc05a','#503a2e']];
const bubbles=['SHILOH!','WHEEEE!','ZOOM!','FLYING!','YEET!','GOOO!'];
const flyers=Array.from({length:6},(_,i)=>({start:i*189,speed:60+i*19,level:130+(i*83)%390,bob:i*1.6,scale:.85+(i%3)*.15}));
let enabled=true;try{enabled=localStorage.getItem('r95.flyingshilohs')!=='off'}catch{}
const style=document.createElement('style');style.textContent='#shilohButton17{position:absolute;right:12px;bottom:90px;z-index:4;margin:0;padding:10px 13px;border:2px solid #fff6;box-shadow:0 4px 18px #0009;background:linear-gradient(135deg,#fff39a,#ff9bd5);color:#162238;border-radius:13px;font-weight:900;font-size:12px;cursor:pointer}#shilohGarage17{background:linear-gradient(135deg,#fff39a,#ff9bd5);color:#162238;margin:6px 8px 6px 0;border-radius:12px;padding:11px 15px;font-weight:900}@media(max-width:700px){#shilohButton17{right:7px;bottom:76px;padding:7px 9px;font-size:10px}}';
document.head.appendChild(style);
const button=document.createElement('button');button.type='button';button.id='shilohButton17';root.appendChild(button);
const garageButton=document.createElement('button');garageButton.type='button';garageButton.id='shilohGarage17';(document.querySelector('.menuActions14')||document.querySelector('#garage .panel'))?.appendChild(garageButton);
function labels(){button.textContent=enabled?'🚀 Shilohs ON [H]':'🚀 Shilohs OFF [H]';garageButton.textContent=enabled?'🚀 FLYING SHILOHS: ON':'🚀 FLYING SHILOHS: OFF';button.setAttribute('aria-pressed',String(enabled));garageButton.setAttribute('aria-pressed',String(enabled))}
function toggle(){enabled=!enabled;try{localStorage.setItem('r95.flyingshilohs',enabled?'on':'off')}catch{}labels();if(!enabled)g.clearRect(0,0,W,H)}
button.onclick=toggle;garageButton.onclick=toggle;labels();
addEventListener('keydown',e=>{if(e.code==='KeyH'&&!e.repeat&&!/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName||'')){toggle();e.preventDefault()}},{passive:false});
const help=document.getElementById('help');if(help)help.textContent+=' · H flying Shilohs';
function oval(x,y,rx,ry,fill){g.fillStyle=fill;g.beginPath();g.ellipse(x,y,rx,ry,0,0,T);g.fill()}
function rect(x,y,w,h,r,fill){g.fillStyle=fill;g.beginPath();g.roundRect(x,y,w,h,r);g.fill()}
function draw(x,y,rot,s,i,time){
const [shirt,rainbow,hair]=colors[i%colors.length];g.save();g.translate(x,y);g.rotate(rot);g.scale(s,s);
g.shadowColor=rainbow;g.shadowBlur=13;
for(let j=0;j<6;j++){g.globalAlpha=.65-j*.055;oval(-43-j*14-(time*30%18),8+Math.sin(time*7+i+j)*8,14-j,4.5,j%2?rainbow:'#83f7ff')}g.globalAlpha=1;g.shadowBlur=0;
g.fillStyle=rainbow;g.beginPath();g.moveTo(-9,1);g.lineTo(-54,-20);g.lineTo(-37,6);g.lineTo(-57,31);g.lineTo(-7,21);g.fill();
g.strokeStyle='#23314a';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(-9,12);g.lineTo(-31,29);g.moveTo(0,14);g.lineTo(-20,39);g.stroke();
rect(-39,25,22,10,4,'#1d304a');rect(-25,34,20,10,4,'#1d304a');
rect(-26,-16,17,33,5,'#5a7189');rect(-22,-19,9,7,2,'#b0faff');
g.fillStyle='#ffb947';g.beginPath();g.moveTo(-25,13);g.lineTo(-16,43+Math.sin(time*10+i)*6);g.lineTo(-9,13);g.fill();
g.fillStyle='#87f2ff';g.beginPath();g.moveTo(-21,12);g.lineTo(-16,29);g.lineTo(-13,12);g.fill();
rect(-17,-6,40,28,9,shirt);g.fillStyle='#ffffff8c';g.fillRect(-4,5,16,3);
g.strokeStyle='#f5bf9c';g.lineWidth=9;g.beginPath();g.moveTo(9,2);g.lineTo(32,11);g.stroke();
oval(26,-19,19,19,'#f5c7a4');
g.fillStyle=hair;g.beginPath();g.arc(26,-29,18,Math.PI,6.16);g.lineTo(8,-20);g.closePath();g.fill();
oval(23,-20,2,2,'#18283b');oval(33,-20,2,2,'#18283b');
g.strokeStyle='#9c4e53';g.lineWidth=1.7;g.beginPath();g.arc(27,-12,6,.15,Math.PI-.15);g.stroke();
g.shadowColor='#0008';g.shadowBlur=4;rect(-25,-73,122,31,14,'#ffffffeb');g.shadowBlur=0;
g.textAlign='center';g.textBaseline='middle';g.fillStyle='#182740';g.font='900 13px Arial,sans-serif';g.fillText(bubbles[i%bubbles.length],36,-57);
g.restore();
}
let elapsed=0,previous=performance.now();
function tick(now){const dt=Math.min(.05,Math.max(0,(now-previous)/1000));previous=now;
const pause=document.getElementById('pause13')?.textContent?.startsWith('Resume');
if(!pause)elapsed+=dt;
g.clearRect(0,0,W,H);
const garage=document.getElementById('garage'),results=document.getElementById('results14');
if(enabled&&garage?.classList.contains('hidden')&&(results?results.classList.contains('hidden'):true)){
for(let i=0;i<flyers.length;i++){const f=flyers[i],xx=((elapsed*f.speed+f.start+150)%(W+340))-150,yy=f.level+Math.sin(elapsed*1.5+f.bob)*30;
draw(xx,yy,Math.sin(elapsed*2+f.bob)*.12,f.scale,i,elapsed)}
}
requestAnimationFrame(tick)}
requestAnimationFrame(tick);
window.R95FlyingShilohs17={toggle,setEnabled:value=>{if(enabled!==!!value)toggle()},isEnabled:()=>enabled,count:flyers.length};
})();