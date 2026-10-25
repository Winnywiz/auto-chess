// Conditional native shops. This is explicitly separate from observed whole-game completion.
import {read,write,previous,H,data,roster,family,mean,quantile} from './common.mjs';
const plans=read('variant-plans.json'),income=read('income.json'),last=income.byRound.find(r=>r.code===52),n=income.results.flatMap(g=>g.players).flatMap(p=>p.path).find(s=>s.code===52).n;
const probe=H.LocalMatch.create('v36-52-xp-probe',{level:'elite',seals:false});probe.closeRound();const openingRound=probe.round.n,openingXp=probe.me.xp,openingLevel=probe.me.level,oldGold=probe.me.gold;
const xpBefore=probe.me.xp,levelBefore=probe.me.level;const action=probe.act({t:'buyXp'});if(action.err)throw Error('Native XP probe failed');
const xpCost=oldGold-probe.me.gold,xpPack=probe.me.xp-xpBefore+Object.entries(data.economy.xpTable).filter(([l])=>Number(l)>=levelBefore&&Number(l)<probe.me.level).reduce((s,[,x])=>s+x,0);
if(xpCost<=0||xpPack<=0)throw Error('Invalid XP purchase facts');
// Recreate multi-seat checkpoint pools from native games.
const {campaign}=await import('../comps-tempo-v36/campaign.mjs');const actual=[],late=[];
for(let i=0;i<32&&(actual.length<12||late.length<12);i++){const g=campaign('v36-52-pool/'+i,{seat:i%8,trace:true,seals:false,cutoff:41}),path=g.players.find(p=>p.id===g.controlled)?.path??[];for(const [round,out]of [[32,actual],[41,late]]){const s=path.find(s=>s.code===round);if(s&&out.length<12)out.push(H.shopContext(new H.LocalMatch(s.state)).taken);}}
if(actual.length<8||late.length<8)throw Error('Not enough actual shared-pool checkpoints');
const trials=512,results=[];
for(const r of plans){
 const reroll=r.category.startsWith('reroll'),owned=r.team.flatMap(u=>Array.from({length:reroll?(u.line===r.carry?6:3):(u.line===r.carry||roster[u.line].cost===4?0:3)},()=>({line:u.line,star:1,items:[]})));
 const openingCost=owned.reduce((s,u)=>s+roster[u.line].cost,0);
 const milestones=reroll?[[r.rollLevel===5?27:r.rollLevel===7?35:31,r.rollLevel],[52,r.level]]:[[35,7],[r.level===8?41:52,r.level]];
 const paths=income.results.flatMap(g=>g.players).flatMap(p=>p.path);
 const required=milestones.map(([round,level])=>{const at=paths.find(s=>s.code===round);if(!at)throw Error('Missing XP timing checkpoint');const total=Object.entries(data.economy.xpTable).filter(([l])=>Number(l)>=openingLevel&&Number(l)<level).reduce((s,[,x])=>s+x,0);return total-openingXp-data.economy.xpPerRound*(at.n-openingRound);});
 const xp=Math.ceil(Math.max(0,...required)/xpPack)*xpCost;
 // Fast builds reserve gold for the two-star temporary carry/frontline that is shown in their low-roll board.
 const low=r.options.find(o=>o.key==='low-roll'),holderReserve=reroll?0:low.team.filter(u=>!owned.some(v=>v.line===u.line)).reduce((s,u)=>s+roster[u.line].cost*3,0);
 const budget=Math.max(0,Math.floor(last.earnedSurvivorMean-openingCost-xp-holderReserve)),goals=new Map(r.team.map(u=>[family(u.line),3**(u.star-1)])),runs=[];
 for(let trial=0;trial<trials;trial++){
  const units=structuredClone(owned),counts=new Map();for(const u of units)counts.set(family(u.line),(counts.get(family(u.line))??0)+1);
  const pools=r.category==='reroll-3'?late:actual,ctx={taken:pools[trial%pools.length],rng:key=>H.route.xa('v36-52-confirmed-budget/'+trial+'/'+key),odds:data.economy.odds};let state={round:10,attempts:0,rollN:0,shinySeen:0},gold=budget,roll=0,buy=0,complete=false;
  for(let k=0;k<160;k++){
   Object.assign(state,H.shop.n(state,ctx,r.category.startsWith('fast')?r.level:r.rollLevel,units));
   for(const id of state.shop){if(!id)continue;const f=family(id),goal=goals.get(f);if(!goal||(counts.get(f)??0)>=goal||roster[id].cost>gold)continue;gold-=roster[id].cost;buy+=roster[id].cost;counts.set(f,(counts.get(f)??0)+1);units.push({line:id,star:1,items:[]});}
   if([...goals].every(([id,n])=>(counts.get(id)??0)>=n)){complete=true;break;}
   if(gold<data.economy.rerollCost)break;gold-=data.economy.rerollCost;roll+=data.economy.rerollCost;
  }
  runs.push({complete,roll,buy,gold});
 }
 const successes=runs.filter(x=>x.complete);results.push({id:r.id,category:r.category,carry:r.carry,level:r.level,trials,rate:successes.length/trials,availableGold:last.earnedSurvivorMean,openingCost,xpReserved:xp,holderReserve,budget,opening:owned,minimumRoll:quantile(successes.map(x=>x.roll),0),medianRoll:quantile(successes.map(x=>x.roll),.5),p90Roll:quantile(successes.map(x=>x.roll),.9),runs});
}
write('conditional.json',{engine:H.identity,deadline:52,trials,pools:{early:actual.length,threeCost:late.length},method:'Conditional on reaching 5-2 with the measured survivor income envelope. Rerolls begin with six primary copies and three of each other final unit. Fast builds begin with three of each non-rare support, zero primary copies and zero four-cost copies; two-star low-roll holders are separately reserved. Native XP costs and natural XP determine minimum XP spend at each strategy checkpoint. One opening shop, paid rolls and unit purchases, actual shared native 3-2 pools or 4-1 for three-cost reroll; future opponent purchases frozen. No injected future income or extra free shops. Family counts do not guarantee Eevee evolution. This is not an unconditional whole-game finish rate.',results});console.log(JSON.stringify(results.map(r=>[r.carry,r.category,Math.round(r.rate*100),r.budget])));
