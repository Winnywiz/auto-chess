import path from 'node:path';
process.env.KANTO_NATIVE_ROOT=path.resolve('work/native-v36');process.env.KANTO_COMPS_WORKDIR=path.resolve('work/comps-tempo-v36');process.env.KANTO_WORKERS??='8';
import {read,write,H,roster,mean} from './native.mjs';
import {clean,arrange,fit,counts} from './boards.mjs';
const {scorePairs}=await import('../comps/pool.mjs');
const rows=read('utility-selected.json'),refs=read('api-references.json'),seeds=Array.from({length:6},(_,i)=>parseInt(H.hash(['v36-fallback-search',i]).slice(0,8),16));
const cases=[];
for(const r of rows){
 const base=clean(r.team),carry=base.find(u=>u.assignment==='Carry'),secondary=base.find(u=>u.assignment==='Secondary');
 const low=base.map(u=>({...u,star:Math.min(2,u.star)}));
 cases.push({id:r.id,kind:'low',carry:r.carry,team:low});
 for(const option of r.alternativeCarryItems??[])cases.push({id:r.id,kind:'items',carry:r.carry,items:option.items,team:base.map(u=>u.assignment==='Carry'?{...u,items:option.items}:u)});
 const pool=Object.values(roster).filter(p=>p.id!=='eevee'&&!p.branchOf&&p.id!==r.carry&&p.role!=='support'&&p.cost<=3&&!base.some(u=>u.line===p.id&&u.assignment==='Tank'))
  .map(p=>({p,fit:carry.items.reduce((s,id)=>s+fit({line:p.id,star:2},id),0),shared:p.traits.filter(t=>(counts(low)[t]??0)>0).length}));
 for(const {p}of pool){
  const existing=low.some(u=>u.line===p.id);
  const team=existing?low.map(u=>u.line===p.id?{...u,assignment:'Carry',items:[...carry.items]}:u.assignment==='Carry'?{...u,assignment:'Secondary',items:[...secondary.items]}:u.assignment==='Secondary'?{...u,assignment:'Support',items:[]}:u):low.map(u=>u.assignment==='Carry'?{...u,line:p.id,items:[...carry.items]}:u);
  cases.push({id:r.id,kind:'pivot',carry:p.id,team:arrange(team)});
 }
 // A missed expensive tank keeps the carry and all seven items on a cheaper 2-star tank.
 const tank=low.find(u=>u.assignment==='Tank');
 if(roster[tank.line].cost>=3)for(const p of Object.values(roster).filter(p=>p.role==='tank'&&p.cost<=2&&!low.some(u=>u.line===p.id)).sort((a,b)=>b.traits.filter(t=>(counts(low)[t]??0)>0).length-a.traits.filter(t=>(counts(low)[t]??0)>0).length).slice(0,3)){
  cases.push({id:r.id,kind:'frontline',carry:r.carry,team:arrange(low.map(u=>u===tank?{...u,line:p.id}:u))});
 }
}
const scores=await scorePairs(cases.flatMap(c=>refs.map(r=>({a:c.team,b:r.team}))),seeds,{label:'same-item holders and alternative builds'});
cases.forEach((c,i)=>{const f={};refs.forEach((r,j)=>(f[r.family]??=[]).push(scores[i*refs.length+j]));c.screenScore=mean(Object.values(f).map(mean));});
for(const r of rows){
 const own=cases.filter(c=>c.id===r.id),low=own.find(c=>c.kind==='low'),pivots=own.filter(c=>c.kind==='pivot').sort((a,b)=>b.screenScore-a.screenScore),gear=own.filter(c=>c.kind==='items').sort((a,b)=>b.screenScore-a.screenScore),front=own.filter(c=>c.kind==='frontline').sort((a,b)=>b.screenScore-a.screenScore);
 r.options=[];
 const add=(c,key,label,note)=>{if(c)r.options.push({...c,key,label,note,level:r.level});};
 if(r.team.some(u=>u.star===3))add(low,'low-roll','Low roll','Keep the upgraded frontline. Stop chasing missed 3★ units and play the 2★ board.');
 add(pivots[0],'item-pivot','Item pivot','Temporary holder: '+roster[pivots[0].carry].forms[1].name+' 2★ uses the same three carry items. '+(pivots[0].screenScore>low.screenScore+.025?'Use this board if the reroll misses.':'Keep the original 2★ carry if that board is stronger.'));
 add(front[0],'frontline','Tank fallback','Keep '+roster[front[0]?.team.find(u=>u.assignment==='Tank').line??r.carry].forms[1].name+' 2★ until the tank upgrade is ready.');
 add(gear[0],'items-2','Build 2','Alternative carry items. Keep the same frontline and secondary item.');
 if(gear[1]&&gear[1].screenScore>=gear[0].screenScore-.1)add(gear[1],'items-3','Build 3','Another tested carry build for different components.');
}
write('frozen.json',{engine:H.identity,generated:new Date().toISOString(),selected:rows,references:refs});write('fallback-screen.json',{engine:H.identity,seeds,cases});
console.log(JSON.stringify({boards:rows.length,screened:cases.length,publishedOptions:rows.reduce((n,r)=>n+r.options.length,0)}));
