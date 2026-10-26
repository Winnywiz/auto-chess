// Shared pure simulation/recording code for the browser worker and parity tests.
const round=n=>Math.round(n*1000)/1000;
export const mirror=team=>team.map(u=>({...u,cell:55-u.cell,items:[...u.items]}));
export function validateRequest(input,data,{allowEmpty=false}={}){
 if(!input||input.rules!==data.rules)throw Error('This simulator uses version '+data.rules+'.');
 const lines=new Map(data.roster.map(r=>[r.id,r])),items=new Set(data.items.map(i=>i.id));
 const teams=['a','b'].map(side=>{
  const team=input[side];if(!Array.isArray(team)||team.length<(allowEmpty?0:1)||team.length>9)throw Error('Each team needs 1 to 9 Pokémon.');
  const cells=new Set();
  return team.map(u=>{
   if(!u||!lines.has(u.line)||!Number.isInteger(u.star)||u.star<1||u.star>3)throw Error('Choose a valid Pokémon and star level.');
   if(!Number.isInteger(u.cell)||u.cell<28||u.cell>55||cells.has(u.cell))throw Error('Each Pokémon needs its own hex.');cells.add(u.cell);
   if(!Array.isArray(u.items)||u.items.length>3||[...u.items].some(i=>!items.has(i)))throw Error('Choose up to 3 held items per Pokémon.');
   const form=u.form;
   if(form!=null&&form!==''){if(data.rules<38||!['phys','spec'].includes(form)||!lines.get(u.line).flex?.stars.includes(u.star))throw Error('Choose a valid ability for this Pokemon.');}
   return {line:u.line,star:u.star,cell:u.cell,items:[...u.items],...(form?{form}:{})};
  });
 });
 if(!Number.isInteger(input.seed)||input.seed<0||input.seed>4294967295)throw Error('Seed must be a whole number from 0 to 4294967295.');
 if(![1,32,128].includes(input.runs))throw Error('Choose 1, 32 or 128 fights.');
 return {rules:data.rules,a:teams[0],b:teams[1],seed:input.seed,runs:input.runs};
}
function fight(engine,request,seed,side,record,data){
 const home=side?request.b:request.a,away=mirror(side?request.a:request.b);
 const battle=new engine.Battle(home.map(u=>({...u,items:[...u.items]})),away,seed,null);
 battle.pvpClock=true;battle.start();
 const frames=[],stats=[],changes=[],previous=new Map();
 const sample=()=>{
  for(const u of battle.units){const signature=[u.num,u.maxHp,u.maxMana].join('/');if(previous.has(u.uid)&&previous.get(u.uid)!==signature)changes.push({t:round(battle.time),uid:u.uid,num:u.num,name:engine.translate(u.name,'en'),maxHp:u.maxHp,maxMana:u.maxMana});previous.set(u.uid,signature);}
  frames.push([round(battle.time),...battle.units.flatMap(u=>[u.cell,u.from,Math.round(u.moveT*100),Math.max(0,Math.round(u.hp)),Math.round(u.mana),Math.round(u.shield),u.alive?1:0,['stun','freezeT','fearT','airborneT','parT','poisonT','burnT','untargetT','rootT'].reduce((s,k,i)=>s+(u[k]>0?2**i:0),0)])]);
  stats.push([round(battle.time),...battle.units.flatMap(u=>[round(u.dealt),round(u.taken),round(u.healed),round(u.shielded),round(u.mitigated)])]);
 };
 const roster=new Map(data.roster.map(r=>[r.id,r]));
 const units=record?battle.units.map(u=>({uid:u.uid,team:u.team,line:u.line,star:u.star,...(data.rules>=38&&u.flexForm?{form:u.flexForm}:{}),num:u.num,name:roster.get(u.line).forms[u.star-1].name,types:u.types,traits:u.traits,maxHp:u.maxHp,maxMana:u.maxMana,items:u.items,carry:false})):[];
 if(record)sample();let steps=0;
 while(!battle.over){battle.step();if(record&&++steps%6===0)sample();else if(!record)steps++;if(steps>15000)throw Error('The fight exceeded its time limit.');}
 const value=battle.winner===-1?.5:battle.winner===side?1:0;
 const summary={seed,side,value,winner:battle.winner,duration:round(battle.time)};
 if(!record)return summary;
 if(frames.at(-1)[0]!==round(battle.time))sample();
 const events=battle.events.filter(e=>['attack','charge','cast','dmg','heal','cc','faint','end','shove','burrow','zone','zoneEnd','transform'].includes(e.k)).map(e=>{const o={...e,t:round(e.t)};if(o.amount!==undefined)o.amount=round(o.amount);if(o.name)o.name=engine.translate(o.name,'en');return o;});
 return {...summary,units,frames,stats,statFields:['dealt','taken','healed','shielded','mitigated'],changes,events};
}
export function simulate(engine,data,input,progress=()=>{}){
 if(engine.rules!==data.rules||engine.identity!==data.identity)throw Error('Combat files are from different versions. Reload the page.');
 const request=validateRequest(input,data),trials=[];
 for(let i=0;i<request.runs;i++){
  const side=request.runs===1?0:i%2,seed=request.runs===1?request.seed:(request.seed+Math.imul(Math.floor(i/2),2654435761))>>>0;
  trials.push(fight(engine,request,seed,side,request.runs===1,data));
  if((i+1)%4===0||i+1===request.runs)progress(i+1,request.runs);
 }
 const replays=[];
 for(const value of [1,0,.5]){
  const group=trials.filter(t=>t.value===value).sort((x,y)=>x.duration-y.duration||x.seed-y.seed||x.side-y.side);
  if(!group.length)continue;const chosen=group[Math.floor(group.length/2)];
  const replay=request.runs===1?chosen:fight(engine,request,chosen.seed,chosen.side,true,data);
  if(replay.value!==chosen.value||replay.duration!==chosen.duration)throw Error('Replay does not match its scored fight.');
  replays.push(replay);
 }
 return {rules:data.rules,identity:engine.identity,request,wins:trials.filter(t=>t.value===1).length,losses:trials.filter(t=>t.value===0).length,draws:trials.filter(t=>t.value===.5).length,n:trials.length,score:trials.reduce((s,t)=>s+t.value,0)/trials.length,replays};
}
