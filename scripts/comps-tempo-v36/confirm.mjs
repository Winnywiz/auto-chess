import path from 'node:path';
process.env.KANTO_NATIVE_ROOT=path.resolve('work/native-v36');process.env.KANTO_COMPS_WORKDIR=path.resolve('work/comps-tempo-v36');process.env.KANTO_WORKERS??='8';
import {read,write,H,mean} from './native.mjs';
const {scorePairs}=await import('../comps/pool.mjs');
const frozen=read('frozen.json'),rows=frozen.selected,refs=frozen.references,seeds=Array.from({length:32},(_,i)=>parseInt(H.hash(['v36-before-5-1-confirmation',i]).slice(0,8),16));
const variants=rows.flatMap(r=>[{id:r.id,key:'finish',team:r.team},...r.options.map(o=>({...o,id:r.id}))]),pairs=variants.flatMap(v=>refs.map(r=>({a:v.team,b:r.team})));
const scores=await scorePairs(pairs,seeds,{label:'fresh v36 meta confirmation'});
const combat={};
variants.forEach((v,i)=>{const f={};refs.forEach((r,j)=>(f[r.family]??=[]).push(scores[i*refs.length+j]));(combat[v.id]??={})[v.key]={rules:36,boardKey:JSON.stringify(v.team.map(({line,star,items,cell})=>({line,star,items,cell}))),referenceScore:mean(Object.values(f).map(mean)),families:Object.fromEntries(Object.entries(f).map(([k,v])=>[k,mean(v)])),n:refs.length*seeds.length*2};});
const pp=[],index=[];for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){pp.push({a:rows[i].team,b:rows[j].team});index.push([i,j]);}
const peer=await scorePairs(pp,seeds,{label:'fresh v36 cross-trait confirmation'});
for(let i=0;i<rows.length;i++){
 const r=rows[i],families={},opponents=[];
 index.forEach(([a,b],k)=>{if(a!==i&&b!==i)return;const j=a===i?b:a,value=a===i?peer[k]:1-peer[k];(families[rows[j].family]??=[]).push(value);opponents.push({id:rows[j].id,score:value,battles:64});});
 const cross=Object.entries(families).filter(([f])=>f!==r.family),p=mean((cross.length?cross:Object.entries(families)).map(([,a])=>mean(a))),c=combat[r.id].finish,score=.7*c.referenceScore+.3*p;
 Object.assign(c,{level:r.level,peerScore:p,score,tier:score>=.65&&c.referenceScore>=.6&&p>=.5?'S':score>=.5&&c.referenceScore>=.45?'A':'B',opponents,peerN:opponents.length*64,gearImpact:null,bisDependent:false});
}
write('confirmation.json',{engine:H.identity,generated:new Date().toISOString(),seeds,combat,method:'32 fresh seeds, both sides, seven items, neutral weather, no Seals. 70% family-balanced reconstructed API opponents and 30% cross-trait proposed boards. Combat scores require exact displayed boards and are not ranked placements.'});
console.log(JSON.stringify(rows.map(r=>[r.name,r.level,combat[r.id].finish.tier,Math.round(combat[r.id].finish.referenceScore*100),Math.round(combat[r.id].finish.peerScore*100)])));
