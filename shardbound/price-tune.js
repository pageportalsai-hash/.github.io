// Premium rack price tuning + 670-specimen UI labels.
(function(){
  const tunedPrices={
    starter:120,
    quarantine:300,
    research:750,
    blacksite:5500,
    omega:13500,
    apex:30000
  };
  racks.forEach(r=>{if(tunedPrices[r.id]!=null)r.price=tunedPrices[r.id]});
  const nav=document.querySelector('[data-screen="collection"] small');if(nav)nav.textContent='670-vial master index';
  const side=document.querySelector('.sidecard p');if(side)side.innerHTML='The facility holds <b>670 unique specimens</b>. Every new discovery raises your Containment percentage.';
  renderAll();
})();