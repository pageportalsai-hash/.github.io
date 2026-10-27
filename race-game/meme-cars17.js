/* Race 95 v17: bonus original meme-inspired car choices */
(()=>{
  const d=window.R95V8;if(!d||!Array.isArray(d.cars))return;
  const additions=[
    {id:101,name:'6 7 MEME MACHINE',type:'Supercar',color:'#fef53d',accent:'#ff36ce',speed:7,grip:9,boost:7,max:5.12,acc:.096,turn:.071,drag:.990,special:'six-seven-meme',description:'Car 102 — bright yellow 6 7 Meme Machine with neon numerals and confetti'},
    {id:102,name:'HAALAND NECK MOBILE',type:'Muscle',color:'#5ee9fa',accent:'#f7d449',speed:7,grip:9,boost:7,max:5.12,acc:.096,turn:.071,drag:.990,special:'neck-meme',description:'Car 103 — football-themed cartoon car with a funny extra-long neck and blond hair'}
  ];
  for(const car of additions){if(!d.cars.some(c=>c.id===car.id))d.cars.push(car)}
  window.R95MemeCars17=additions;
})();