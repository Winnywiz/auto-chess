// Fresh, trait-connected v35 compositions. No v34 ratings or BIS results are reused.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
process.env.KANTO_NATIVE_ROOT ??= path.resolve('work/native-v35');
process.env.KANTO_COMPS_WORKDIR ??= path.resolve('work/comps-v35');
process.env.KANTO_WORKERS ??= '8';
const {data,roster,activeTraits,traitCounts,boardValue,seedList,writeJSON}=await import('../comps/common.mjs');
const {scorePairs}=await import('../comps/pool.mjs');
const {arrange,fitScore}=await import('../comps/boards.mjs');
if(data.rules!==35)throw Error('This research requires the verified rules-35 snapshot');
const source=JSON.parse(fs.readFileSync('work/comps-refresh/meta.json','utf8'));
if(source.rules!==35)throw Error('Refresh the generation rules before using a newer meta snapshot');
const lines=Object.values(roster).filter(r=>r.id!=='eevee');
const full=data.items.filter(i=>i.kind==='full').map(i=>i.id);
const clean=t=>t.map(u=>({...u,items:[...(u.items??[])]}));
const mean=a=>a.reduce((n,x)=>n+x,0)/a.length;
const key=t=>JSON.stringify(t.map(({line,star,items,cell})=>({line,star,items,cell})));
const name=(line,star=2)=>roster[line].forms[star-1].name;
const star=(r,level,carry)=>r.id===carry&&r.cost<=3?3:r.cost===5?(level===9&&r.id===carry?2:1):2;
const front=r=>r.role==='tank'||r.role==='fighter'||r.role==='assassin';
const nativeItems=(line,s)=>[...full].sort((a,b)=>fitScore(line,s,b)-fitScore(line,s,a)||a.localeCompare(b)).slice(0,3);
function family(team,carry){
 const counts=traitCounts(team),tr=roster[carry].traits;
 return [...tr].sort((a,b)=>data.traits[b].thresholds.filter(n=>counts[b]>=n).length-data.traits[a].thresholds.filter(n=>counts[a]>=n).length||(counts[b]??0)-(counts[a]??0))[0].toLowerCase();
}
function equip(team,carry){
 const t=clean(team).map(u=>({...u,items:[],assignment:'Support'}));
 const c=t.find(u=>u.line===carry);c.assignment='Carry';c.items=nativeItems(c.line,c.star);
 const tanks=t.filter(u=>u!==c&&roster[u.line].role==='tank').sort((a,b)=>roster[b.line].cost-roster[a.line].cost);
 const tank=tanks[0]??t.find(u=>u!==c&&front(roster[u.line]));
 if(tank){tank.assignment='Tank';tank.items=nativeItems(tank.line,tank.star);}
 return arrange(t);
}
function supportScore(team,r,target,goal,carry){
 const counts=traitCounts(team),before=activeTraits(team),next=[...team,{line:r.id,star:2,items:[]}],after=activeTraits(next);
 const main=roster[carry].traits,connected=r.traits.some(t=>(counts[t]??0)>0);
 const frontline=team.filter(u=>roster[u.line].role==='tank'||roster[u.line].role==='fighter').length;
 const tanks=team.filter(u=>roster[u.line].role==='tank').length;
 let s=r.cost*.65+(connected?1:-4);
 if(r.traits.includes(target)&&(counts[target]??0)<goal)s+=7;
 for(const t of after){const prev=before.find(x=>x.t===t.t);if(t.tier>(prev?.tier??0))s+=main.includes(t.t)?5:2.4;}
 if(r.role==='tank')s+=tanks===0?10:frontline<3?4:0;
 if(r.role==='support')s+=team.some(u=>roster[u.line].role==='support')?-.5:1.6;
 if(r.id==='ditto'&&team.some(u=>roster[u.line].cost>=4))s+=.8;
 // Proposal only. Actual combat, not this heuristic, selects published boards.
 return s;
}
function generate(carry,target,goal,level){
 const c=roster[carry],team=[{line:carry,star:star(c,level,carry),items:[]}];
 const pool=lines.filter(r=>r.id!==carry&&(!r.branchOf||r.id===carry));
 while(team.length<level){
  const candidates=pool.filter(r=>!team.some(u=>u.line===r.id)&&!(r.cost===5&&team.filter(u=>roster[u.line].cost===5).length>=(level===8?2:3)))
   .map(r=>({r,s:supportScore(team,r,target,goal,carry)})).sort((a,b)=>b.s-a.s||a.r.id.localeCompare(b.r.id));
  const r=candidates[0]?.r;if(!r)throw Error('No support candidate');
  team.push({line:r.id,star:star(r,level,carry),items:[]});
 }
 return equip(team,carry);
}
function coherent(team,carry){
 const counts=traitCounts(team),connected=new Set([carry]);
 for(let i=0;i<team.length;i++)for(const u of team)if(!connected.has(u.line)&&roster[u.line].traits.some(t=>(counts[t]??0)>=data.traits[t].thresholds[0]&&team.some(v=>connected.has(v.line)&&roster[v.line].traits.includes(t))))connected.add(u.line);
 return team.every(u=>connected.has(u.line)||['tank','support'].includes(roster[u.line].role)
  ||roster[u.line].traits.some(t=>data.traits[t].thresholds[0]===1));
}
function row(carry,target,goal){
 const c=roster[carry],rollLevel=c.cost<=3?[null,5,6,7][c.cost]:null;
 const boards=[8,9].map(level=>({level,team:generate(carry,target,goal,level)}));
 return {id:'v35-'+carry+'-'+target.toLowerCase()+'-'+goal,carry,name:name(carry,c.cost<=3?3:2)+' / '+target+' '+goal,
  target,goal,family:family(boards[1].team,carry),category:rollLevel?'reroll-'+rollLevel:c.cost===5?'legendary':'fast-8',
  strategy:rollLevel?'Reroll '+rollLevel:c.cost===5?'Level 9':'Fast 8',rollLevel,locked:rollLevel?[carry]:[],
  origin:'v35-search',source:'Rules 35 trait-connected combat search',boards};
}
const candidates=[];const seen=new Set();
for(const c of lines.filter(r=>!['tank','support'].includes(r.role))){
 for(const target of c.traits.filter(t=>data.traits[t].thresholds[0]>1)){
  const attainable=lines.filter(r=>r.traits.includes(target)).length;
  const goals=data.traits[target].thresholds.filter(n=>n<=Math.min(6,attainable));
  for(const goal of [...new Set([goals[0],goals.at(-1)])]){
   const r=row(c.id,target,goal),team=r.boards[1].team,k=key(team);
   if(!seen.has(k)&&coherent(team,c.id)&&boardValue(team)<=115){seen.add(k);candidates.push(r);}
  }
 }
}
// Fresh API cores seed opponents only. Aggregated records span historical patches;
// their placement rates never determine these simulated tiers.
const references=[];
for(const comp of source.comps.filter(c=>c.n>=60).slice(0,28)){
 const c=comp.units.filter(u=>roster[u.line]&&Number.isFinite(u.share)).sort((a,b)=>b.share-a.share)[0];
 const carry=comp.units.filter(u=>roster[u.line]&&!['tank','support'].includes(roster[u.line].role)&&Number.isFinite(u.share))
  .sort((a,b)=>b.items.reduce((s,x)=>s+x.share,0)-a.items.reduce((s,x)=>s+x.share,0))[0]?.line??c?.line;
 if(!carry)continue;
 const target=roster[carry].traits.find(t=>data.traits[t].thresholds[0]>1);if(!target)continue;
 const r=row(carry,target,data.traits[target].thresholds[0]);
 for(const level of [8,9]){
  const team=comp.units.filter(u=>roster[u.line]&&u.share>=20&&u.line!==carry).sort((a,b)=>b.share-a.share).slice(0,level-1)
   .map(u=>({line:u.line,star:roster[u.line].cost===5?1:2,items:[]}));
  if(team.length!==level-1)continue;
  team.unshift({line:carry,star:star(roster[carry],level,carry),items:[]});
  if(!coherent(team,carry))continue;
  if(references.some(x=>x.level===level&&key(x.team)===key(equip(team,carry))))continue;
  references.push({id:'meta-'+references.length,group:'observed-core',level,team:equip(team,carry)});
 }
 if(references.filter(r=>r.level===9).length>=8)break;
}
// Diverse newly generated families make screening independent of old workbook boards.
const screen=[];
for(const c of candidates)if(!screen.some(x=>x.family===c.family))screen.push(c);
const opponents=screen.slice(0,14);
writeJSON('input.json',{rules:35,identity:data.identity,metaGenerated:source.generated,candidates,references});
console.log('Generated '+candidates.length+' coherent candidates; '+opponents.length+' families; '+references.length+' reconstructed reference boards.');
async function evaluate(rows,refs,seeds,label){
 const pairs=[];const indices=[];
 rows.forEach((r,i)=>{for(const b of r.boards)for(const o of refs.filter(o=>o.level===b.level)){pairs.push({a:b.team,b:o.team});indices.push([i,b.level,o.family??o.group]);}});
 const scores=await scorePairs(pairs,seeds,{label});
 const acc={};scores.forEach((s,i)=>{const [r,l,f]=indices[i];((acc[r]??={})[l]??=[]).push(s);});
 return rows.map((r,i)=>({...r,screen:mean(acc[i][9]),level8Screen:mean(acc[i][8])}));
}
const screenRefs=opponents.flatMap(c=>c.boards.map(b=>({...b,id:c.id,family:c.family})));
let ranked=await evaluate(candidates,screenRefs,seedList(2,'v35-discovery'), 'v35 discovery');
ranked.sort((a,b)=>b.screen-a.screen);
// Publish a usable range of carries and strategies, not many near-identical caps.
const selected=[];
for(const r of ranked){if(selected.some(x=>x.carry===r.carry))continue;selected.push(r);if(selected.length>=28)break;}
for(const id of ['koga','samurai','giovanni','kabutops','victreebel','primeape','venomoth','porygon3','omastar']){
 const r=ranked.find(r=>r.carry===id);if(r&&!selected.some(x=>x.carry===id))selected.push(r);
}
console.log('Selected '+selected.length+' carry families.');
// Tune only against discovery opponents. All final scores use new seeds later.
for(const level of [8,9]){
 const options=[],optionRows=[];
 for(const r of selected){const b=r.boards.find(b=>b.level===level),carry=b.team.find(u=>u.line===r.carry),tank=b.team.find(u=>u.assignment==='Tank');
  const best=nativeItems(carry.line,carry.star),sets=[best,[best[0],best[0],'focus-sash'],[best[0],'quick-claw','life-orb'],[best[0],'choice-scarf','scope-lens']];
  const tankSets=[tank?.items,['focus-sash','leftovers','rocky-helmet'],['leftovers','leftovers','protector']];
  sets.forEach((items,k)=>options.push({r,kind:'gear',team:clean(b.team).map(u=>u.line===carry.line?{...u,items}:u),tag:k}));
  if(tank)for(const items of tankSets.slice(1))options.push({r,kind:'gear',team:clean(b.team).map(u=>u.line===tank.line?{...u,items}:u)});
 }
 const pairs=[];for(const o of options)for(const ref of screenRefs.filter(x=>x.level===level).slice(0,8))pairs.push({a:o.team,b:ref.team});
 const scores=await scorePairs(pairs,seedList(2,'v35-items-'+level),{label:'v35 gear L'+level});
 const by=new Map();options.forEach((o,i)=>{const score=mean(scores.slice(i*8,(i+1)*8));if(!by.has(o.r.id)||score>by.get(o.r.id).score+.005)by.set(o.r.id,{...o,score});});
 for(const r of selected)r.boards.find(b=>b.level===level).team=by.get(r.id).team;
}
// Test coherent support replacements, including new tanks and utility lines.
for(const level of [8,9]){
 const options=[];
 for(const r of selected){const b=r.boards.find(b=>b.level===level);options.push({r,team:b.team});
  const pool=lines.filter(u=>!r.boards[1].team.some(x=>x.line===u.id)&&roster[u.id].cost>=3&&u.id!=='eevee');
  const slots=b.team.filter(u=>!u.items.length);
  for(const out of slots.slice(-3))for(const rr of pool.map(rr=>({rr,s:supportScore(b.team.filter(u=>u!==out),rr,r.target,r.goal,r.carry)})).sort((a,b)=>b.s-a.s).slice(0,3)){
   const t=b.team.map(u=>u===out?{line:rr.rr.id,star:rr.rr.cost===5?1:2,items:[],assignment:'Support'}:u);
   if(coherent(t,r.carry)&&(traitCounts(t)[r.target]??0)>=r.goal)options.push({r,team:arrange(t)});
  }
 }
 const refs=screenRefs.filter(x=>x.level===level).slice(0,6),pairs=options.flatMap(o=>refs.map(ref=>({a:o.team,b:ref.team})));
 const scores=await scorePairs(pairs,seedList(2,'v35-support-'+level),{label:'v35 support L'+level});
 const by=new Map();options.forEach((o,i)=>{const s=mean(scores.slice(i*refs.length,(i+1)*refs.length));if(!by.has(o.r.id)||s>by.get(o.r.id).score+.025)by.set(o.r.id,{...o,score:s});});
 for(const r of selected)r.boards.find(b=>b.level===level).team=by.get(r.id).team;
}
writeJSON('frozen.json',{generated:new Date().toISOString(),identity:data.identity,selected,references,discoveryCandidates:candidates.length});
const results={};const confirmation=seedList(24,'v35-published-confirmation');
for(const level of [8,9]){
 const boards=selected.map(r=>r.boards.find(b=>b.level===level).team),pairs=[],index=[];
 for(let i=0;i<boards.length;i++)for(let j=i+1;j<boards.length;j++){pairs.push({a:boards[i],b:boards[j]});index.push([i,j]);}
 const scores=await scorePairs(pairs,confirmation,{label:'v35 held-out peers L'+level});
 const refs=references.filter(r=>r.level===level);
 const refScores=await scorePairs(boards.flatMap(team=>refs.map(r=>({a:team,b:r.team}))),confirmation,{label:'v35 held-out references L'+level});
 for(let i=0;i<selected.length;i++){
  const families={},opponents=[];
  index.forEach(([a,b],k)=>{if(a!==i&&b!==i)return;const j=a===i?b:a,s=a===i?scores[k]:1-scores[k];(families[selected[j].family]??=[]).push(s);opponents.push({id:selected[j].id,score:s,battles:48});});
  const cross=Object.entries(families).filter(([f])=>f!==selected[i].family),peer=mean((cross.length?cross:Object.entries(families)).map(([,s])=>mean(s)));
  const reference=mean(refScores.slice(i*refs.length,(i+1)*refs.length)),score=peer*.75+reference*.25;
  (results[selected[i].id]??={})[level]={level,score,peerScore:peer,referenceScore:reference,tier:score>=.65&&peer>=.55?'S':score>=.5?'A':'B',
   purchaseGold:boardValue(boards[i]),n:(opponents.length+refs.length)*48,peerN:opponents.length*48,
   groups:[{group:'v35 cross-family',score:peer},{group:'reconstructed meta',score:reference}],families:Object.fromEntries(Object.entries(families).map(([f,s])=>[f,mean(s)])),opponents};
 }
}
// Practical progression: final units first, trait-sharing affordable holders otherwise.
const guides={};
for(const r of selected){
 const final=r.boards.find(b=>b.level===8).team,finalSet=new Set(final.map(u=>u.line));
 const plan=r.rollLevel?`Build ${name(r.carry,3)} at level ${r.rollLevel}. Prioritize the carry upgrade; keep support at 2★.`
  :roster[r.carry].cost===5?`Stabilize at 8 with an upgraded item holder. Add ${name(r.carry)} when found; reach 9 after the frontline is ready.`
  :`Level to 8 for ${name(r.carry)} 2★. Keep the upgraded holder until the carry and frontline are ready.`;
 const stop=r.rollLevel?`If the carry is contested or the upgrade is far away, keep 2★ and level. Do not force secondary 3★ upgrades.`:'Finish the carry and frontline before pushing level 9.';
 const stages=[];
 for(const level of [5,6,7,8]){
  if(level===8){stages.push({key:'level-8',level,team:clean(final),holders:final.filter(u=>u.items.length).map(u=>({holder:u.line,holderStar:u.star,target:u.line,targetStar:u.star,items:u.items,keep:true})),note:plan,suggested:true});continue;}
  let t=final.filter(u=>roster[u.line].cost<= (level===5?3:4)).map(u=>({...u,items:[],star:roster[u.line].cost<=2?2:roster[u.line].cost===3?(level>=6?2:1):1}));
  t.sort((a,b)=>(b.line===r.carry)-(a.line===r.carry)||(roster[b.line].role==='tank')-(roster[a.line].role==='tank')||roster[b.line].traits.filter(x=>roster[r.carry].traits.includes(x)).length-roster[a.line].traits.filter(x=>roster[r.carry].traits.includes(x)).length);
  t=t.slice(0,level);
  while(t.length<level){const rr=lines.filter(rr=>rr.cost<=3&&!rr.branchOf&&!t.some(u=>u.line===rr.id)&&rr.traits.some(x=>final.some(u=>roster[u.line].traits.includes(x))))
    .sort((a,b)=>supportScore(t,b,r.target,r.goal,r.carry)-supportScore(t,a,r.target,r.goal,r.carry))[0];if(!rr)throw Error('No connected progression holder');t.push({line:rr.id,star:rr.cost<=2?2:1,items:[]});}
  t=arrange(t);const holders=[];let budget=({5:3,6:4,7:5})[level];
  for(const target of final.filter(u=>u.items.length).sort((a,b)=>(b.line===r.carry)-(a.line===r.carry))){
   const items=target.items.slice(0,budget);if(!items.length)continue;
   const h=t.find(u=>u.line===target.line)??t.filter(u=>!u.items.length&&(target.assignment==='Tank'?front(roster[u.line]):true)).sort((a,b)=>items.reduce((s,it)=>s+fitScore(b.line,b.star,it)-fitScore(a.line,a.star,it),0))[0];
   if(!h)continue;h.items=items;h.assignment=target.assignment;budget-=items.length;
   holders.push({holder:h.line,holderStar:h.star,target:target.line,targetStar:target.star,items,keep:h.line===target.line});
  }
  stages.push({key:'level-'+level,level,team:t,holders,note:level<(r.rollLevel??8)?'Upgrade the frontline and keep the item holders shown. Buy carry copies while saving.':plan,suggested:true});
 }
 guides[r.id]={family:r.family,entry:plan,plan,stop,pivots:[],locked:r.locked,stages,alternatives:[],odds:[]};
}
const output={generated:new Date().toISOString(),rules:35,engine:data.identity,selected,results,guides,
 discoveryCandidates:candidates.length,confirmationSeeds:24,sourceMeta:{generated:source.generated,rules:source.rules,versions:source.versions},
 method:'Fresh rules-35 boards, six finished items, neutral weather, no Seals or economy. Trait-connected discovery, item/support screening, then 24 new seeds on both sides for every frozen pair. Scores are 75% cross-family (opposing trait families weighted equally) and 25% reconstructed official-meta reference boards. Historical aggregate meta rates are never used as scores. Progression is suggested and has no inherited combat score.'};
output.digest=createHash('sha256').update(JSON.stringify(output)).digest('hex');
writeJSON('final.json',output);
console.log('COMPLETE '+JSON.stringify({rows:selected.length,tiers:selected.map(r=>[r.name,results[r.id][9].tier,Math.round(results[r.id][9].score*100)])}));
