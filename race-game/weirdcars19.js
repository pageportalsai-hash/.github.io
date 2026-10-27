/* Race 95 v19 — original outrageous racers and celebrity-themed fun cars */
(()=>{
'use strict';
const D=window.R95V8;
if(!D||!Array.isArray(D.cars))return;
const spec=[
['SIGMA SHADOW CAR','sigma','Supercar','#171e33','#e63cfa','The mysterious sigma supercar with sharp neon styling'],
['SUSPICIOUS SPY VAN','spy','Van','#1d2332','#65faff','A secret van with blacked-out windows and mystery gadgets'],
['UNDERCOVER PIZZA VAN','undercover','Van','#333849','#ff9e40','An innocent-looking pizza van. Definitely not suspicious.'],
['ALIEN UFO TAXI','ufo','Kart','#85eefa','#a968ff','A hovering UFO taxi with a glass bubble roof'],
['BANANA ROCKET RACER','banana','Roadster','#f9de31','#43cb78','The fastest banana in the universe'],
['TURBO TOILET CAR','toilet','Kart','#ecf3ff','#47dcf9','Porcelain-powered nonsense with a little rocket'],
['RUBBER DUCK RACER','duck','Roadster','#ffd837','#ff8e42','A cheerful yellow duck with racing wheels'],
['HOT DOG DRAGSTER','hotdog','Muscle','#db9a55','#f45648','A hot dog with a very serious engine'],
['PIZZA SLICE SPEEDSTER','pizza','Supercar','#f0bc62','#db4047','A cheesy triangle with pepperoni wheels'],
['GIANT SNEAKER MOBILE','shoe','Coupe','#65c8ff','#ffffff','A ridiculous high-top shoe that drives'],
['CHICKEN NUGGET KART','nugget','Kart','#e5b85a','#ffed92','Golden and crispy, but built for racing'],
['MEME PEOPLE PARTY BUS','bus','Van','#f158db','#85ffe9','A party bus with a cheering crowd inside'],
['INVISIBLE GHOST VAN','ghost','Van','#bed9fb','#7c8cd9','A spooky translucent van with friendly ghost passengers'],
['DISCO FRIDGE TRUCK','fridge','Pickup','#e3efff','#ff77d8','A refrigerator with headlights and a disco ball'],
['RAINBOW UNICORN RACER','unicorn','Roadster','#ffafe4','#b2fff3','A pastel unicorn car with a rainbow horn'],
['ASTRONAUT MOON BUGGY','buggy','Kart','#b4cadc','#ed9e36','A six-wheel moon rover with a tiny astronaut'],
['SUSPICIOUS QUESTION MARK CAR','sus','Sedan','#633387','#6ef2ae','Nobody knows what this mysterious purple car is up to'],
['CRISTIANO GOALMOBILE','ronaldo','Supercar','#e73148','#f6c852','Unofficial football-star-themed car with a number 7 shirt'],
['MESSI MAGIC MINI','messi','Hatchback','#80c9ff','#fafafa','Unofficial football-star-themed car with a number 10 shirt'],
['TAYLOR TOUR VAN','taylor','Van','#d898ef','#ffe0ac','Unofficial pop-superstar concert tour van with a microphone'],
['EINSTEIN BRAINWAGON','einstein','Classic','#cad5e7','#e4fcff','Unofficial science-genius car with wild hair and E=mc²'],
['LEBRON DUNKMOBILE','lebron','SUV','#fcaa3c','#6928aa','Unofficial basketball-star-inspired car with a hoop'],
['MRBEAST GOLD TRUCK','mrbeast','Pickup','#fbd441','#20ced7','Unofficial YouTube-creator-inspired golden truck'],
['THE ROCK BOULDER BUGGY','rock','SUV','#797c87','#d1d2d7','Unofficial movie-star-inspired rolling boulder']
];
const added=[];
for(let i=0;i<spec.length;i++){
 const [name,wacky,type,color,accent,description]=spec[i],id=101+i;
 if(D.cars.some(c=>c.id===id))continue;
 const car={id,name,type,color,accent,wacky,description,
 speed:5+i%4,grip:7+i%4,boost:5+(i*3)%4,max:4.2+(i%4)*.16,
 acc:.076+(i%3)*.006,turn:.054+(i%4)*.003,drag:.991};
 D.cars.push(car);added.push(car);
}
window.R95WeirdCars19={cars:added,all:spec.map((s,i)=>({id:101+i,name:s[0],wacky:s[1]}))};
})();