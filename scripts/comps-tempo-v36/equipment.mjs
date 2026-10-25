import path from 'node:path';
process.env.KANTO_NATIVE_ROOT=path.resolve('work/native-v36');process.env.KANTO_COMPS_WORKDIR=path.resolve('work/comps-tempo-v36');process.env.KANTO_WORKERS??='8';
import {read,write,H,mean,roster} from './native.mjs';
import {clean,full,fit} from './boards.mjs';
const {scorePairs}=await import('../comps/pool.mjs');
const rows=read('economic-candidates.json'),refs=read('api-references.json'),seeds=Array.from({length:6},(_,i)=>parseInt(H.hash(['tempo-equipment-v1',i]).slice(0,8),16));
const groupScore=s=>{const f={};refs.forEach((r,j)=>(f[r.family]??=[]).push(s[j]));return mean(Object.values(f).map(mean));};
const cases=[];
for(const r of rows){
 const carry=r.team.find(u=>u.assignment==='Carry'),tank=r.team.find(u=>u.assignment==='Tank');
 const physical=(roster[carry.line].forms[carry.star-1].skill.scale?.atk??0)>=(roster[carry.line].forms[carry.star-1].skill.scale?.spa??0);
 const top=physical?'choice-band':'choice-specs';
 const sets=[carry.items,[top,top,'focus-sash'],[top,'quick-claw','shell-bell'],[top,'choice-scarf','scope-lens'],[top,'expert-belt','focus-sash'],[top,'razor-fang','focus-sash']];
 const seen=new Set();for(const items of sets){const k=[...items].sort().join();if(seen.has(k))continue;seen.add(k);cases.push({id:r.id,kind:'carry',items,team:r.team.map(u=>u===carry?{...u,items:[...items]}:u)});}
 const tankSets=[['focus-sash','leftovers','eviolite'],['leftovers','protector','rocky-helmet'],['leftovers','leftovers','protector'],['flame-orb','rocky-helmet','eviolite']];
 for(const items of tankSets)cases.push({id:r.id,kind:'tank',items,team:r.team.map(u=>u===tank?{...u,items:[...items]}:u)});
}
console.log(JSON.stringify({boards:rows.length,equipmentCases:cases.length,opponents:refs.length}));
const scores=await scorePairs(cases.flatMap(c=>refs.map(ref=>({a:c.team,b:ref.team}))),seeds,{label:'before 5-1 equipment'});
cases.forEach((c,i)=>c.score=groupScore(scores.slice(i*refs.length,(i+1)*refs.length)));
for(const r of rows){
 const own=cases.filter(c=>c.id===r.id),carry=own.filter(c=>c.kind==='carry').sort((a,b)=>b.score-a.score),tank=own.filter(c=>c.kind==='tank').sort((a,b)=>b.score-a.score);
 const primary=carry[0],base=carry.find(c=>JSON.stringify(c.items)===JSON.stringify(r.team.find(u=>u.assignment==='Carry').items));
 const bestTank=tank[0]?.score>(base?.score??0)+.025?tank[0]:null;
 r.team=r.team.map(u=>u.assignment==='Carry'?{...u,items:primary.items}:u.assignment==='Tank'&&bestTank?{...u,items:bestTank.items}:u);
 r.alternativeCarryItems=carry.filter(c=>c!==primary).slice(0,2).map(c=>({items:c.items,screenScore:c.score}));
 r.equipmentScreen={carry:primary.score,tank:bestTank?.score??null};
}
write('equipped-candidates.json',rows);write('equipment-screen.json',{engine:H.identity,seeds,cases:cases.map(({team,...c})=>c)});
console.log('Equipment screening complete');
