// Premium rack price tuning: keep first three affordable, make the chase racks meaningfully expensive.
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
  renderAll();
})();