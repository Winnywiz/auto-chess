import fs from 'node:fs';
import path from 'node:path';
import {Worker} from 'node:worker_threads';
import {H,data,roster,items,family,mean,quantile,hash} from '../comps-tempo-v36/native.mjs';
export {H,data,roster,items,family,mean,quantile,hash};
export {clean,arrange,equip,counts,active,price,fit,full,supportValue,coherent} from '../comps-tempo-v36/boards.mjs';
export const dir=path.resolve('work/comps-52-v36');fs.mkdirSync(dir,{recursive:true});
export const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
export const previous=name=>JSON.parse(fs.readFileSync(path.resolve('work/comps-tempo-v36',name),'utf8'));
export const write=(name,x)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(x,null,2)+'\n');
export const seeds=(n,salt)=>Array.from({length:n},(_,i)=>parseInt(hash([salt,i]).slice(0,8),16));
export async function scoreBoards(boards,refs,n,salt,label){
 process.env.KANTO_NATIVE_ROOT=path.resolve('work/native-v36');process.env.KANTO_COMPS_WORKDIR=dir;process.env.KANTO_WORKERS??='8';
 const {scorePairs}=await import('../comps/pool.mjs');const sd=seeds(n,salt);
 const scores=await scorePairs(boards.flatMap(b=>refs.map(r=>({a:b.team,b:r.team}))),sd,{label});
 return boards.map((b,i)=>{const f={},matchups=[];refs.forEach((r,j)=>{const score=scores[i*refs.length+j];(f[r.family]??=[]).push(score);matchups.push({id:r.id,score,battles:n*2});});return {referenceScore:mean(Object.values(f).map(mean)),families:Object.fromEntries(Object.entries(f).map(([k,v])=>[k,mean(v)])),matchups,n:refs.length*n*2,seeds:sd};});
}
export async function games(jobs,label){
 const results=[];let next=0;const start=performance.now();
 await Promise.all(Array.from({length:Math.min(8,jobs.length)},()=>new Promise((resolve,reject)=>{
  const w=new Worker(new URL('games.mjs',import.meta.url));const send=()=>{if(next<jobs.length)w.postMessage(jobs[next++]);else{w.terminate();resolve();}};
  w.on('message',m=>{if(m.error){w.terminate();reject(Error(m.error));return;}results.push(m.result);if(results.length%64===0)console.log(label+' '+results.length+'/'+jobs.length);send();});w.on('error',reject);send();
 })));
 console.log(JSON.stringify({label,games:results.length,seconds:Math.round((performance.now()-start)/1000)}));return results;
}
