import path from 'node:path';
process.env.KANTO_NATIVE_ROOT=path.resolve('work/native-v36');process.env.KANTO_COMPS_WORKDIR=path.resolve('work/comps-tempo-v36');process.env.KANTO_WORKERS??='8';
import {read,write,H,roster,mean,data} from './native.mjs';
import {clean,counts,equip,supportValue} from './boards.mjs';
const {scorePairs}=await import('../comps/pool.mjs');
const rows=read('equipped-candidates.json'),refs=read('api-references.json'),out=[];
for(const r of rows){
 let team=clean(r.team);
 const expensive=r.level<=6?3:r.level===7?3:4,limit=r.level===5?0:r.level===6?1:2;
 let slots=team.filter(u=>u.line!==r.carry&&roster[u.line].cost>=expensive&&u.star!==3).sort((a,b)=>(b.assignment==='Tank')-(a.assignment==='Tank')||roster[a.line].cost-roster[b.line].cost);
 const primaryUses=roster[r.carry].cost>=expensive?1:0;
 for(const replace of slots.slice(Math.max(0,limit-primaryUses))){
  const core=team.filter(u=>u.line!==replace.line),before=counts(team),pool=Object.values(roster).filter(p=>p.id!=='eevee'&&!p.branchOf&&p.cost<expensive&&!core.some(u=>u.line===p.id)&&!(replace.assignment==='Tank'&&!['tank','fighter'].includes(p.role)));
  const ranked=pool.map(p=>{const after=counts([...core,{line:p.id}]);const lost=Object.keys(before).reduce((n,t)=>n+Math.max(0,data.traits[t].thresholds.filter(x=>x<=before[t]).length-data.traits[t].thresholds.filter(x=>x<=(after[t]??0)).length),0);return{p,s:supportValue(core,p,r.target,r.goal,'tempo')-lost*6-p.cost*.7};}).sort((a,b)=>b.s-a.s);
  if(ranked[0])team=team.map(u=>u.line===replace.line?{...u,line:ranked[0].p.id,star:2}:u);
 }
 const c=counts(team),bp=data.traits[r.target].thresholds.filter(n=>n<=(c[r.target]??0)).at(-1)??0;
 const geared=equip(team,r.carry,{carryItems:r.team.find(u=>u.assignment==='Carry').items});
 const changed=JSON.stringify(geared.map(u=>[u.line,u.star]))!==JSON.stringify(r.team.map(u=>[u.line,u.star]));
 if(!changed)continue;
 out.push({...r,id:r.id+'-budget',goal:bp,name:roster[r.carry].forms[r.carryStar-1].name+' / '+(bp?r.target+' '+bp:'Flex'),team:geared,budgetVariant:true,baseId:r.id});
}
const seeds=Array.from({length:6},(_,i)=>parseInt(H.hash(['v36-budget-screen',i]).slice(0,8),16));
const scores=await scorePairs(out.flatMap(r=>refs.map(ref=>({a:r.team,b:ref.team}))),seeds,{label:'affordable supports'});
out.forEach((r,i)=>{const f={};refs.forEach((ref,j)=>(f[ref.family]??=[]).push(scores[i*refs.length+j]));r.apiScore=mean(Object.values(f).map(mean));r.equipmentScreen={carry:r.apiScore,tank:null};});
write('budget-candidates.json',out);console.log(JSON.stringify({boards:out.length}));
