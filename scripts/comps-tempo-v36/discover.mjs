import path from 'node:path';
process.env.KANTO_NATIVE_ROOT=path.resolve('work/native-v36');process.env.KANTO_COMPS_WORKDIR=path.resolve('work/comps-tempo-v36');process.env.KANTO_WORKERS??='8';
import {candidates,apiReferences} from './boards.mjs';
import {write,H,mean} from './native.mjs';
const {scorePairs}=await import('../comps/pool.mjs');
const rows=candidates(),refs=apiReferences();write('candidates.json',rows);write('api-references.json',refs);
console.log(JSON.stringify({candidates:rows.length,references:refs.length,families:[...new Set(refs.map(r=>r.family))]}));
const seeds=Array.from({length:6},(_,i)=>parseInt(H.hash(['tempo-discovery-v1',i]).slice(0,8),16));
const scores=await scorePairs(rows.flatMap(r=>refs.map(ref=>({a:r.team,b:ref.team}))),seeds,{label:'before 5-1 discovery'});
for(let i=0;i<rows.length;i++){
 const families={};refs.forEach((r,j)=>(families[r.family]??=[]).push(scores[i*refs.length+j]));
 rows[i].apiScore=mean(Object.values(families).map(mean));rows[i].apiFamilies=Object.fromEntries(Object.entries(families).map(([k,v])=>[k,mean(v)]));
}
rows.sort((a,b)=>b.apiScore-a.apiScore||a.id.localeCompare(b.id));write('discovery.json',{engine:H.identity,seeds,rows});
const selected=[];
for(const r of rows){
 const options=selected.filter(x=>x.carry===r.carry);
 // Keep different upgrade counts and finishing levels for the acquisition experiment.
 if(options.length>=5||options.some(x=>x.level===r.level&&x.extraTargets===r.extraTargets&&x.carryStar===r.carryStar))continue;
 selected.push(r);
}
write('shortlist.json',selected);
console.log(JSON.stringify({shortlisted:selected.length,leaders:rows.slice(0,12).map(r=>[r.name,r.level,r.upgrades.length,Math.round(r.apiScore*100)])}));
