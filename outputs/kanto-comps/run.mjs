import {Worker,isMainThread,parentPort} from 'node:worker_threads';
import {readFile,writeFile} from 'node:fs/promises';
import os from 'node:os';
import {VERSION,tasks,categories,settings,digest,bisDigest,searchTask,confirmCandidate} from './experiment.mjs';
if(!isMainThread){parentPort.on('message',job=>{try{parentPort.postMessage({result:job.confirm?confirmCandidate(job.candidate):searchTask(job)});}catch(e){parentPort.postMessage({error:e.stack});}});}
else{
 if(bisDigest==='smoke-only')throw Error('A real BIS confirmation is required for the published search');
 const startedAt=new Date().toISOString(),start=performance.now();
 const sourceHashes=Object.fromEntries(await Promise.all(['experiment.mjs','run.mjs'].map(async p=>[p,digest(await readFile(new URL(p,import.meta.url),'utf8'))])));
 async function pool(jobs,label){
  const workers=[],results=[];let next=0,active=0;
  try{await new Promise((resolve,reject)=>{
   const assign=w=>{if(next<jobs.length){active++;w.postMessage(jobs[next++]);}else if(!active)resolve();};
   for(let i=0;i<Math.min(5,jobs.length);i++){
    const w=new Worker(new URL(import.meta.url));workers.push(w);w.on('error',reject);w.on('message',m=>{if(m.error){reject(Error(m.error));return;}active--;results.push(m.result);console.log(JSON.stringify({phase:label,completed:results.length,total:jobs.length,category:m.result.category??m.result.candidate.category,carry:m.result.carry??m.result.candidate.carry,battles:m.result.battles??m.result.result.n*2}));assign(w);});assign(w);
   }
  });}finally{await Promise.all(workers.map(w=>w.terminate()));}return results;
 }
 const searched=(await pool(tasks,'search')).sort((a,b)=>tasks.findIndex(t=>t.category===a.category&&t.carry===a.carry)-tasks.findIndex(t=>t.category===b.category&&t.carry===b.carry));
 await writeFile(new URL('./search.json',import.meta.url),JSON.stringify({VERSION,startedAt,settings,categories,bisDigest,sourceHashes,searched}));
 const frozen=categories.flatMap(cat=>searched.filter(t=>t.category===cat.id).map(t=>t.validated[0]).sort((a,b)=>b.result.score-a.result.score||a.candidate.carry.localeCompare(b.candidate.carry)).slice(0,settings.publishedPerCategory).map(r=>r.candidate));
 await writeFile(new URL('./frozen.json',import.meta.url),JSON.stringify({VERSION,bisDigest,frozen},null,2));
 const confirmed=(await pool(frozen.map(candidate=>({confirm:true,candidate})),'confirmation')).sort((a,b)=>frozen.findIndex(c=>digest(c)===digest(a.candidate))-frozen.findIndex(c=>digest(c)===digest(b.candidate)));
 const battles=searched.reduce((n,t)=>n+t.battles,0)+confirmed.reduce((n,c)=>n+c.result.n+c.fallback.n,0),elapsedMs=performance.now()-start;
 const result={VERSION,startedAt,finishedAt:new Date().toISOString(),runtime:process.version,hardware:{cpu:os.cpus()[0].model,logical:os.cpus().length,ramBytes:os.totalmem(),platform:os.platform(),release:os.release()},workers:5,categories,settings,bisDigest,sourceHashes,searchTasks:tasks.length,searchedCandidates:searched.reduce((n,t)=>n+t.searched,0),battles,elapsedMs,battlesPerSecond:battles/(elapsedMs/1000),confirmed,digest:digest(confirmed)};
 await writeFile(new URL('./results.json',import.meta.url),JSON.stringify(result));console.log(JSON.stringify({phase:'complete',battles,elapsedMs,digest:result.digest}));
}
