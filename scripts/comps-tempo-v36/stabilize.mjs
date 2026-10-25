import path from 'node:path';
process.env.KANTO_NATIVE_ROOT=path.resolve('work/native-v36');process.env.KANTO_COMPS_WORKDIR=path.resolve('work/comps-tempo-v36');process.env.KANTO_WORKERS??='8';
import {read,write,H,roster,mean} from './native.mjs';
const {scorePairs}=await import('../comps/pool.mjs');
const out=[];
for(const r of read('budget-candidates.json')){
 if(roster[r.carry].cost!==3||r.level!==7||r.upgrades.length!==1||out.some(o=>o.carry===r.carry))continue;
 out.push({...r,id:r.id+'-stable',team:r.team.map(u=>({...u,star:2})),carryStar:2,upgrades:[],category:'reroll-7',strategy:'Stabilize 7',conditional:null});
}
const refs=read('api-references.json'),seeds=Array.from({length:6},(_,i)=>parseInt(H.hash(['v36-stabilize',i]).slice(0,8),16));
const scores=await scorePairs(out.flatMap(r=>refs.map(ref=>({a:r.team,b:ref.team}))),seeds,{label:'3-cost two-star stabilization'});
out.forEach((r,i)=>{const f={};refs.forEach((ref,j)=>(f[ref.family]??=[]).push(scores[i*refs.length+j]));r.apiScore=mean(Object.values(f).map(mean));r.equipmentScreen={carry:r.apiScore};r.name=roster[r.carry].forms[1].name+' / '+r.target+' '+r.goal;});
write('stabilize-candidates.json',out);console.log(JSON.stringify(out.map(r=>[r.carry,r.apiScore])));
