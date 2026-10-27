/* Race 95 v13: continuous track rails. Contact changes direction, never speed. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const angle = (a, b) => Math.atan2(Math.sin(b-a), Math.cos(b-a));
  function compile(path) {
    let total = 0;
    const segments = path.map((p, i) => {
      const q = path[(i+1)%path.length], dx=q.x-p.x, dy=q.y-p.y;
      const len=Math.hypot(dx,dy)||0.0001;
      const seg={x:p.x,y:p.y,dx,dy,len,tx:dx/len,ty:dy/len,s:total,i};
      total+=len; return seg;
    });
    return {segments,total};
  }
  function nearest(rail, x, y) {
    let best=null, bestD=Infinity;
    for (const p of rail.segments) {
      const t=clamp(((x-p.x)*p.dx+(y-p.y)*p.dy)/(p.len*p.len),0,1);
      const px=p.x+t*p.dx, py=p.y+t*p.dy, dx=x-px, dy=y-py, d2=dx*dx+dy*dy;
      if(d2<bestD){bestD=d2;best={x:px,y:py,tx:p.tx,ty:p.ty,nx:-p.ty,ny:p.tx,i:p.i,t,s:p.s+t*p.len,d:Math.sqrt(d2)};}
    }
    return best;
  }
  function pointAt(rail, s) {
    s=((s%rail.total)+rail.total)%rail.total;
    let lo=0,hi=rail.segments.length-1;
    while(lo<hi){const m=Math.ceil((lo+hi)/2);if(rail.segments[m].s<=s)lo=m;else hi=m-1;}
    const p=rail.segments[lo], t=clamp((s-p.s)/p.len,0,1);
    return{x:p.x+p.dx*t,y:p.y+p.dy*t,tx:p.tx,ty:p.ty,nx:-p.ty,ny:p.tx,i:p.i,s};
  }
  function move(car, rail, roadWidth, dt) {
    const travel=car.v*5.05*dt, count=Math.max(1,Math.ceil(Math.abs(travel)/2.5));
    const stride=travel/count, limit=Math.max(8,roadWidth/2-35);
    let contact=false, q=nearest(rail,car.x,car.y);
    for(let step=0;step<count;step++){
      const nx=car.x+Math.cos(car.a)*stride,ny=car.y+Math.sin(car.a)*stride;
      let next=nearest(rail,nx,ny);
      if(next.d>limit){
        // Turn outward movement into forward motion along the rail, not a bounce.
        const along=Math.cos(car.a)*q.tx+Math.sin(car.a)*q.ty;
        const headingSign=Math.abs(along)<0.15?(car.railHeading||1):Math.sign(along);
        car.railHeading=headingSign;
        const side=((nx-next.x)*next.nx+(ny-next.y)*next.ny)>=0?1:-1;
        const target=pointAt(rail,q.s+stride*headingSign);
        car.x=target.x+target.nx*side*(limit-0.5);
        car.y=target.y+target.ny*side*(limit-0.5);
        car.a=Math.atan2(target.ty,target.tx)+(headingSign<0?Math.PI:0);
        contact=true;
        next=nearest(rail,car.x,car.y);
      }else{car.x=nx;car.y=ny;}
      // Final continuous-segment clamp also protects sharp corners and rocket boosts.
      if(next.d>limit){const f=limit/next.d;car.x=next.x+(car.x-next.x)*f;car.y=next.y+(car.y-next.y)*f;}
      q=nearest(rail,car.x,car.y);
    }
    car.a=((car.a+Math.PI)%TAU+TAU)%TAU-Math.PI;
    car.i=q.i; car.prog=q.s/rail.total; car.edge=contact;
    return q;
  }
  const api={compile,nearest,pointAt,move,angle,clamp};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.R95Rails13=api;
})();
