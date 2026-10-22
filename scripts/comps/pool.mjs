// Parallel pair scoring on every logical CPU, with a disk cache keyed by both boards and the seed list.
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import os from 'node:os';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const nativeRoot=new URL(process.env.KANTO_NATIVE_ROOT?`file:///${process.env.KANTO_NATIVE_ROOT.replaceAll('\\','/').replace(/^\//,'').replace(/\/?$/,'/')}`:'../../work/native-v34/',import.meta.url);
export const workDir=new URL('../../work/comps-v34/',import.meta.url);
const cachePath=new URL('pair-cache.json',workDir);
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0,32);
const clean=team=>team.map(u=>({line:u.line,star:u.star,items:[...(u.items??[])],cell:u.cell}));
let cache=null;
function loadCache(){if(cache)return cache;fs.mkdirSync(workDir,{recursive:true});try{cache=JSON.parse(fs.readFileSync(cachePath));}catch{cache={};}return cache;}
export function saveCache(){if(cache)fs.writeFileSync(cachePath,JSON.stringify(cache));}
export const pairKey=(a,b,seeds)=>hash([clean(a),clean(b),seeds]);
// pairs: [{a:team,b:team}] -> scores for team a (wins + half draws), both sides per seed.
export async function scorePairs(pairs,seeds,{workers=Number(process.env.KANTO_WORKERS)||os.availableParallelism(),label='pairs'}={}){
  const c=loadCache(),keys=pairs.map(p=>pairKey(p.a,p.b,seeds)),todo=new Map();
  pairs.forEach((p,i)=>{if(c[keys[i]]===undefined&&!todo.has(keys[i]))todo.set(keys[i],{key:keys[i],a:clean(p.a),b:clean(p.b)});});
  const jobs=[...todo.values()],n=Math.min(workers,jobs.length);
  if(jobs.length){
    const start=performance.now();let done=0,lastLog=0;
    const chunks=[];for(let i=0;i<jobs.length;i+=40)chunks.push(jobs.slice(i,i+40));
    let next=0;
    await Promise.all(Array.from({length:n},()=>new Promise((resolve,reject)=>{
      const w=new Worker(fileURLToPath(import.meta.url),{workerData:{root:nativeRoot.href,seeds}});
      const send=()=>{if(next<chunks.length)w.postMessage(chunks[next++]);else{w.terminate();resolve();}};
      w.on('message',m=>{if(m.error)return reject(Error(m.error));for(const r of m.results)c[r.key]=r.score;done+=m.results.length;
        const t=performance.now();if(t-lastLog>15000){lastLog=t;console.log(`  ${label}: ${done}/${jobs.length} pairs, ${Math.round(done*seeds.length*2/((t-start)/1000))} battles/s`);}send();});
      w.on('error',reject);send();
    })));
    saveCache();
    console.log(`  ${label}: ${jobs.length} new pairs (${jobs.length*seeds.length*2} battles) in ${Math.round((performance.now()-start)/1000)}s, ${pairs.length-jobs.length} cached`);
  }
  return keys.map(k=>c[k]);
}
if(!isMainThread){
  const {match}=await import(new URL('headless.mjs',workerData.root));
  parentPort.on('message',chunk=>{try{parentPort.postMessage({results:chunk.map(j=>({key:j.key,score:match(j.a,j.b,workerData.seeds)}))});}catch(e){parentPort.postMessage({error:e.stack});}});
}
