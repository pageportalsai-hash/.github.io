(()=>{
const D=window.R95V8;
if(!D||D.cars.some(c=>c.id===100))return;
D.cars.push({
 id:100,
 name:'Tesla Roadster Flying Edition',
 type:'Roadster',
 color:'#d71920',
 accent:'#111111',
 speed:10,
 grip:9,
 boost:10,
 max:5.9,
 acc:.105,
 turn:.067,
 drag:.9925,
 special:'flying-roadster',
 fly:true,
 rocket:true,
 description:'Car 101 — flying Roadster with deployable wings and mega rocket boosters.'
});
})();
