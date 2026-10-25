// Conditional shop budgets complement, rather than replace, the full-game acquisition study.
import {campaign} from './campaign.mjs';
import {read,write,H,roster,family,mean,quantile,data} from './native.mjs';
const plans=process.argv[2]?read(process.argv[2]):[...read('equipped-candidates.json'),...read('budget-candidates.json')];
const output=process.argv[3]??'conditional-budgets.json';
const pools=[];
for(let i=0;i<12;i++){const g=campaign('v36-conditional-pool/'+i,{seat:i%8,trace:true,seals:false}),p=g.players.find(p=>p.id===g.controlled),snapshot=p.path.find(s=>s.code===32);if(snapshot){const game=new H.LocalMatch(snapshot.state);pools.push(H.shopContext(game).taken);}}
if(pools.length<8)throw Error('Not enough native checkpoint pools');
const available=read('income-ranked.json').byRound.find(r=>r.code===48).earnedSurvivorMean;
const spending=process.argv[2]?read('economy-confirmation.json').plans:[...read('economy-screen-v1.json').plans,...read('economy-budget-v1.json').plans];
const levels=data.economy.xp,steps=read('income-ranked.json').byRound.find(r=>r.code===48);
const trials=Number(process.argv[4]??64),results=[];
for(const plan of plans){
 if(plan.carryStar!==3)continue;
 const owned=plan.team.flatMap(u=>Array.from({length:u.line===plan.carry?6:3},()=>({line:u.line,star:1,items:[]}))),goals=new Map(plan.team.map(u=>[family(u.line),3**(u.star-1)]));
 const openingCost=owned.reduce((n,u)=>n+roster[u.line].cost,0),xp=spending.find(e=>e.id===plan.id).xpMean,budget=Math.max(0,Math.floor(available-openingCost-xp));
 const runs=[];
 for(let trial=0;trial<trials;trial++){
  const units=structuredClone(owned),counts=new Map();for(const u of units)counts.set(family(u.line),(counts.get(family(u.line))??0)+1);
  const prefix=output==='conditional-budgets.json'?'v36-conditional':'v36-'+output;
  const ctx={taken:pools[trial%pools.length],rng:key=>H.route.xa(prefix+'/'+trial+'/'+key),odds:data.economy.odds};
  let state={round:10,attempts:0,rollN:0,shinySeen:0},gold=budget,roll=0,buy=0,complete=false;
  for(let k=0;k<160;k++){
   Object.assign(state,H.shop.n(state,ctx,plan.rollLevel,units));
   for(const id of state.shop){if(!id)continue;const fam=family(id),goal=goals.get(fam);if(!goal||(counts.get(fam)??0)>=goal||roster[id].cost>gold)continue;gold-=roster[id].cost;buy+=roster[id].cost;counts.set(fam,(counts.get(fam)??0)+1);units.push({line:id,star:1,items:[]});}
   if([...goals].every(([id,n])=>(counts.get(id)??0)>=n)){complete=true;break;}
   if(gold<data.economy.rerollCost)break;gold-=data.economy.rerollCost;roll+=data.economy.rerollCost;
  }
  runs.push({complete,roll,buy,gold});
 }
 const success=runs.filter(r=>r.complete);
 results.push({id:plan.id,carry:plan.carry,level:plan.level,upgrades:plan.upgrades,trials,budget,openingCost,xpReserved:xp,availableGold:available,rate:success.length/trials,minimumRoll:success.length?Math.min(...success.map(r=>r.roll)):null,medianRoll:quantile(success.map(r=>r.roll),.5),p90Roll:quantile(success.map(r=>r.roll),.9),rollMean:mean(runs.map(r=>r.roll)),runs});
 if(results.length%25===0)console.log('Conditional budgets '+results.length);
}
write(output,{engine:H.identity,trials,pools:pools.length,method:'Conditional native shop-family upgrade study. Primary starts at six copies; every other shown unit at three. Remaining budget is measured survivor income through planning 4-8 minus all opening-copy costs and the matching controller mean XP spend. Only one free opening shop; no further income, free rounds, Seals, sales or items inside this conditional roll session. Native odds, finite pools and twelve real native 3-2 opponent holdings; future opponent purchases frozen. Eevee family copies are counted, not evolution outcomes. This is conditional on the opening board already being held, not a full-game completion rate.',results});
console.log(JSON.stringify({results:results.length,vaporeon:results.filter(r=>r.carry==='vaporeon').map(({runs,...r})=>r)}));
