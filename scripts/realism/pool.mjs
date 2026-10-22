import {Worker} from 'node:worker_threads';
import fs from 'node:fs';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {identity} from './native.mjs';
const sourceHash=createHash('sha256');sourceHash.update(identity);
for(const f of ['native.mjs','policy.mjs','episode.mjs','shop.mjs','worker.mjs'])sourceHash.update(fs.readFileSync(new URL(f,import.meta.url)));
// The planner also reads editorial Seal preferences. Changing them must invalidate resumed trials.
sourceHash.update(fs.readFileSync(new URL('../../seals-data.js',import.meta.url)));
export const experimentIdentity=sourceHash.digest('hex');
export async function jobs(jobs,{directory='work/realism-v34',workers=Number(process.env.KANTO_WORKERS)||os.availableParallelism()}={}){
  fs.mkdirSync(directory,{recursive:true});const path=directory+'/checkpoint.json';
  let cache={};if(fs.existsSync(path)){const saved=JSON.parse(fs.readFileSync(path));if(saved.identity===experimentIdentity)cache=saved.results;}
  const key=j=>createHash('sha256').update(JSON.stringify(j)).digest('hex'),todo=jobs.filter(j=>!cache[key(j)]),start=performance.now();let next=0,done=0;
  const save=()=>{fs.writeFileSync(path+'.tmp',JSON.stringify({identity:experimentIdentity,results:cache}));fs.renameSync(path+'.tmp',path);};
  console.log(JSON.stringify({jobs:jobs.length,newJobs:todo.length,workers,identity:experimentIdentity}));
  const ws=[];try{await Promise.all(Array.from({length:Math.min(workers,todo.length)},()=>new Promise((resolve,reject)=>{
    const w=new Worker(new URL('./worker.mjs',import.meta.url));ws.push(w);
    const send=()=>{if(next>=todo.length){resolve();return;}w.postMessage(todo[next++]);};
    w.on('error',reject);w.on('message',m=>{if(m.error){reject(Error(m.key+': '+m.error));return;}const job=todo.find(j=>j.key===m.key);cache[key(job)]=m.results;done++;
      if(done%20===0||done===todo.length)console.log(`${done}/${todo.length} batches, ${Math.round((performance.now()-start)/1000)}s`);
      if(done%60===0)save();send();});send();
  })));}finally{await Promise.all(ws.map(w=>w.terminate()));save();}
  return jobs.map(j=>({job:j,results:cache[key(j)]}));
}
