import {read,write,roster,data,clean,equip,arrange,counts,fit,price,scoreBoards,supportValue} from './common.mjs';
const plans=read('screen-plans.json'),refs=read('references.json'),experiments=[];
// Search support value and breakpoint changes through combat, preserving the three item holders.
for(const r of plans){
 experiments.push({id:r.id,kind:'keep',team:clean(r.team)});
 for(const out of r.team.filter(u=>u.assignment==='Support').slice(-3)){
  const pool=Object.values(roster).filter(p=>p.id!=='eevee'&&!p.branchOf&&p.cost<=(r.level===8?4:3)&&!r.team.some(u=>u.line===p.id))
   .map(p=>({p,s:supportValue(r.team.filter(u=>u!==out),p,r.target,r.goal,'meta')})).sort((a,b)=>b.s-a.s);
  const passive=pool.filter(({p})=>p.role==='support'||p.traits.some(t=>['Electric','Ghost','Dragon'].includes(t)));
  for(const {p}of [...new Map([...pool.slice(0,4),...passive.slice(0,5)].map(x=>[x.p.id,x])).values()]){
   const team=arrange(r.team.map(u=>u===out?{...u,line:p.id,star:2}:u));if(price(team)>price(r.team)+3)continue;
   experiments.push({id:r.id,kind:'utility',in:p.id,out:out.line,team});
  }
 }
}
const utilityScores=await scoreBoards(experiments,refs,4,'v36-52-utility','Breakpoint and utility tests');experiments.forEach((r,i)=>r.score=utilityScores[i].referenceScore);
for(const r of plans){const opts=experiments.filter(x=>x.id===r.id).sort((a,b)=>b.score-a.score),keep=opts.find(x=>x.kind==='keep'),best=opts[0].score>keep.score+.03?opts[0]:keep;r.team=best.team;r.upgrades=r.team.filter(u=>u.star===3).map(u=>u.line);r.utilityStudy={kind:best.kind,in:best.in??null,out:best.out??null};r.screen={referenceScore:best.score};const c=counts(r.team);r.goal=data.traits[r.target].thresholds.filter(n=>n<=(c[r.target]??0)).at(-1)??0;r.name=roster[r.carry].forms[r.carryStar-1].name+' / '+(r.goal?r.target+' '+r.goal:'Flex');}
write('utility-screen.json',{experiments});write('utility-plans.json',plans);
const cases=[];
for(const r of plans){
 const carry=r.team.find(u=>u.assignment==='Carry'),tank=r.team.find(u=>u.assignment==='Tank'),secondary=r.team.find(u=>u.assignment==='Secondary');
 let low=clean(r.team).map(u=>({...u,star:2}));
 // A fast board that misses rare upgrades uses upgraded affordable replacements, never one-star rares.
 if(r.category.startsWith('fast'))for(const u of [...low].filter(u=>roster[u.line].cost===4)){
  const options=Object.values(roster).filter(p=>p.id!=='eevee'&&!p.branchOf&&p.cost<=3&&!low.some(x=>x.line===p.id)&&!(u.assignment==='Tank'&&!['tank','fighter'].includes(p.role))).map(p=>({p,s:u.items.reduce((s,id)=>s+fit({line:p.id,star:2},id),0)+supportValue(low.filter(x=>x!==u),p,r.target,r.goal,'tempo')})).sort((a,b)=>b.s-a.s);
  if(options[0])low=low.map(x=>x.line===u.line?{...x,line:options[0].p.id}:x);
 }
 low=arrange(low);cases.push({id:r.id,key:'low-roll',kind:'keep',label:'Low roll',team:low,level:r.level,note:'Keep upgraded holders when the planned upgrades miss. Same seven items.'});
 const lowCarry=low.find(u=>u.assignment==='Carry'),lowSecondary=low.find(u=>u.assignment==='Secondary');
 const pool=Object.values(roster).filter(p=>p.id!=='eevee'&&!p.branchOf&&p.cost<=3&&p.role!=='support'&&p.id!==lowCarry.line&&!low.some(u=>u.line===p.id&&u.assignment==='Tank'));
 for(const p of pool){const existing=low.some(u=>u.line===p.id);const team=existing?low.map(u=>u.line===p.id?{...u,assignment:'Carry',items:[...carry.items]}:u.assignment==='Carry'?{...u,assignment:'Secondary',items:[...secondary.items]}:u.assignment==='Secondary'?{...u,assignment:'Support',items:[]}:u):low.map(u=>u.assignment==='Carry'?{...u,line:p.id}:u);cases.push({id:r.id,kind:'holder',holder:p.id,team:arrange(team),level:r.level});}
 const physical=(roster[carry.line].forms[carry.star-1].skill.scale?.atk??0)>=(roster[carry.line].forms[carry.star-1].skill.scale?.spa??0),power=physical?'choice-band':'choice-specs';
 const gear=[carry.items,[power,power,'focus-sash'],[power,'quick-claw','shell-bell'],[power,'choice-scarf','scope-lens'],[power,'expert-belt','focus-sash']];
 for(const items of [...new Map(gear.map(x=>[[...x].sort().join(),x])).values()])cases.push({id:r.id,kind:'items',items,team:r.team.map(u=>u.assignment==='Carry'?{...u,items:[...items]}:u),level:r.level});
 for(const p of Object.values(roster).filter(p=>p.cost<=3&&['tank','fighter'].includes(p.role)&&!low.some(u=>u.line===p.id)).map(p=>({p,s:supportValue(low.filter(u=>u.assignment!=='Tank'),p,r.target,r.goal,'tempo')})).sort((a,b)=>b.s-a.s).slice(0,4).map(x=>x.p))cases.push({id:r.id,kind:'tank',holder:p.id,team:arrange(low.map(u=>u.assignment==='Tank'?{...u,line:p.id}:u)),level:r.level});
}
const scores=await scoreBoards(cases,refs,4,'v36-52-option-screen','Seven-item builds and low-roll replacements');cases.forEach((r,i)=>r.score=scores[i].referenceScore);
for(const r of plans){const own=cases.filter(x=>x.id===r.id),best=(kind,n)=>own.filter(x=>x.kind===kind).sort((a,b)=>b.score-a.score).slice(0,n);const low=own.find(x=>x.key==='low-roll'),holder=best('holder',1)[0],tank=best('tank',1)[0],gear=best('items',3);
 const chosen=gear[0];r.team=chosen.team;r.alternativeCarryItems=gear.slice(1).map(x=>({items:x.items,screenScore:x.score}));
 // Rebuild low-roll candidates with the chosen main carry set, so a pivot never changes its recipe.
 const oldItems=low.team.find(u=>u.assignment==='Carry').items;
 if(JSON.stringify(chosen.items)!==JSON.stringify(oldItems)){
  for(const x of [low,holder,tank].filter(Boolean))x.team=x.team.map(u=>u.assignment==='Carry'?{...u,items:[...chosen.items]}:u);
 }
 r.options=[low,holder&&{...holder,key:'item-pivot',label:'Item pivot',note:roster[holder.holder].forms[1].name+' 2★ holds the same three carry items.'},tank&&{...tank,key:'frontline',label:'Tank fallback',note:roster[tank.holder].forms[1].name+' 2★ holds the same tank items.'},...gear.slice(1).map((x,i)=>({...x,key:'items-'+(i+2),label:'Build '+(i+2),note:'Alternative carry build. Same frontline and secondary item.'}))].filter(Boolean);
 const c=counts(r.team);r.goal=data.traits[r.target].thresholds.filter(n=>n<=(c[r.target]??0)).at(-1)??0;r.name=roster[r.carry].forms[r.carryStar-1].name+' / '+(r.goal?r.target+' '+r.goal:'Flex');
}
write('variant-screen.json',{cases});write('variant-plans.json',plans);console.log(JSON.stringify({plans:plans.length,utility:experiments.length,options:cases.length}));
