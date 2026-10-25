import path from 'node:path';
process.env.KANTO_NATIVE_ROOT=path.resolve('work/native-v36');process.env.KANTO_COMPS_WORKDIR=path.resolve('work/comps-tempo-v36');process.env.KANTO_WORKERS??='8';
import {read,write,H,roster,mean,data} from './native.mjs';
import {clean,arrange,price,counts,supportValue} from './boards.mjs';
const {scorePairs}=await import('../comps/pool.mjs');
const rows=read(process.argv[2]??'selected.json'),refs=read('api-references.json'),seeds=Array.from({length:4},(_,i)=>parseInt(H.hash(['v36-utility-screen',i]).slice(0,8),16));
const score=a=>{const f={};refs.forEach((r,i)=>(f[r.family]??=[]).push(a[i]));return mean(Object.values(f).map(mean));};
const utilityLines=Object.values(roster).filter(r=>r.id!=='eevee'&&!r.branchOf&&r.cost<=4&&(r.role==='support'||r.role==='tank'||r.traits.some(t=>['Electric','Ghost','Dragon'].includes(t))||/stun|sleep|heal|shield|taunt|defen|sunder|freeze|slow/i.test(JSON.stringify(r.forms[1].skill))));
const experiments=[];
for(const r of rows){
 experiments.push({id:r.id,kind:'keep',team:clean(r.team)});
 const slots=r.team.filter(u=>u.assignment!=='Carry'&&u.star!==3).sort((a,b)=>roster[b.line].cost-roster[a.line].cost||a.items.length-b.items.length).slice(0,4);
 for(const out of slots){
  const pool=utilityLines.filter(p=>!r.team.some(u=>u.line===p.id)&&p.cost<=(r.level<=7?3:4)).sort((a,b)=>supportValue(r.team.filter(u=>u!==out),b,r.target,r.goal,'meta')-supportValue(r.team.filter(u=>u!==out),a,r.target,r.goal,'meta'));
  const special=pool.filter(p=>p.role==='support'||p.traits.some(t=>['Electric','Ghost','Dragon'].includes(t)));
  const picks=[...new Map([...special,...pool.slice(0,7)].map(p=>[p.id,p])).values()];
  for(const line of picks){
   const t=arrange(r.team.map(u=>u===out?{...u,line:line.id,star:2}:u));
   if(price(t)>price(r.team)+3||t.filter(u=>roster[u.line].role==='tank').length<1)continue;
   experiments.push({id:r.id,kind:'swap',out:out.line,in:line.id,team:t});
  }
 }
 // Test a two-slot Electric splash even when the original board has none.
 const empty=slots.filter(u=>!u.items.length).slice(-2);
 if(empty.length===2)for(const lines of [['voltorb','magnemite'],['pikachu','voltorb']]){
  if(lines.some(id=>r.team.some(u=>u.line===id)))continue;
  const t=arrange(r.team.map(u=>empty.includes(u)?{...u,line:lines[empty.indexOf(u)],star:2}:u));
  if(price(t)<=price(r.team)+3)experiments.push({id:r.id,kind:'electric-pair',out:empty.map(u=>u.line),in:lines,team:t});
 }
}
console.log(JSON.stringify({boards:rows.length,utilityOptions:experiments.length}));
const scores=await scorePairs(experiments.flatMap(c=>refs.map(r=>({a:c.team,b:r.team}))),seeds,{label:'utility and affordable replacements'});
experiments.forEach((c,i)=>c.score=score(scores.slice(i*refs.length,(i+1)*refs.length)));
for(const r of rows){
 const own=experiments.filter(c=>c.id===r.id),keep=own.find(c=>c.kind==='keep'),best=[...own].sort((a,b)=>b.score-a.score||price(a.team)-price(b.team))[0];
 const pick=best.score>=keep.score+.025?best:keep;
 r.utilityStudy={kind:pick.kind,out:pick.out??null,in:pick.in??null,screenBefore:keep.score,screenAfter:pick.score};
 r.team=pick.team;r.upgrades=r.team.filter(u=>u.star===3).map(u=>u.line);
 const c=counts(r.team),bp=data.traits[r.target].thresholds.filter(n=>n<=(c[r.target]??0)).at(-1);
 r.goal=bp??0;r.name=roster[r.carry].forms[r.carryStar-1].name+' / '+(bp?r.target+' '+bp:'Flex');
}
write(process.argv[3]??'utility-selected.json',rows);write(process.argv[3]?'stabilize-utility-screen.json':'utility-screen.json',{engine:H.identity,seeds,experiments});
console.log(JSON.stringify(rows.map(r=>[r.carry,r.utilityStudy.kind,r.utilityStudy.in,r.utilityStudy.screenBefore,r.utilityStudy.screenAfter])));
