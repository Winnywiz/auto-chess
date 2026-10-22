// Runs the BIS experiment on all logical CPUs. Usage: node scripts/bis/run.mjs [--pilot] [--workers=N]
import {Worker} from 'node:worker_threads';
import os from 'node:os';
import {writeFile,readFile,rename,mkdir} from 'node:fs/promises';
import {config,states,items,archetypes,VERSION,digest,engineBuild} from './experiment.mjs';
const out=new URL('../../work/bis-v4/',import.meta.url);await mkdir(out,{recursive:true});
const pilot=process.argv.includes('--pilot');
const requested=Number(process.argv.find(x=>x.startsWith('--workers='))?.split('=')[1]??os.availableParallelism());
const selected=pilot?['pikachu','chansey','snorlax'].map(line=>states.find(s=>s.line===line&&s.star===2)):states;
const workerCount=Math.min(selected.length,Math.max(1,requested));
const resultsPath=new URL(pilot?'pilot.json':'results.json',out),partialPath=new URL(pilot?'pilot.partial.json':'results.partial.json',out);
let done=[];try{done=JSON.parse(await readFile(partialPath)).results??[];}catch{}
const doneKeys=new Set(done.map(r=>r.line+':'+r.star));
const queue=selected.filter(s=>!doneKeys.has(s.line+':'+s.star));
const meta={version:VERSION,engineBuild,workers:workerCount,hardware:{cpu:os.cpus()[0]?.model,logicalProcessors:os.availableParallelism(),platform:os.platform()},node:process.version,config,archetypes,items:items.map(i=>i.id)};
const results=[...done],start=performance.now();let battles=0;
console.log(JSON.stringify({event:'start',states:selected.length,resumed:done.length,workers:workerCount}));
const save=async path=>{const temp=new URL(path.href+'.tmp');await writeFile(temp,JSON.stringify({...meta,completed:results.length,total:selected.length,results}));await rename(temp,path);};
let chain=Promise.resolve(),next=0;
await new Promise((resolve,reject)=>{
  let active=0;if(!queue.length)return resolve();
  const workers=[];
  const assign=w=>{if(next<queue.length){active++;w.postMessage(queue[next++]);}else{w.terminate();if(!active)resolve();}};
  for(let i=0;i<workerCount;i++){
    const w=new Worker(new URL('./worker.mjs',import.meta.url));workers.push(w);w.on('error',reject);
    w.on('message',m=>{
      if(m.type==='error')return reject(Error(m.message));
      if(m.type==='stage'){battles+=m.battles;return;}
      active--;results.push(m.result);
      const sec=(performance.now()-start)/1000;
      console.log(`${results.length}/${selected.length} ${m.result.line} ${m.result.star}* -> ${m.result.frozenLeader}  (${Math.round(battles/sec)} battles/s, ${Math.round(sec)}s)`);
      chain=chain.then(()=>save(partialPath));assign(w);
    });
    assign(w);
  }
});
await chain;
results.sort((a,b)=>states.findIndex(s=>s.line===a.line&&s.star===a.star)-states.findIndex(s=>s.line===b.line&&s.star===b.star));
const elapsed=(performance.now()-start)/1000;
await writeFile(resultsPath,JSON.stringify({...meta,completed:results.length,total:selected.length,battlesThisRun:battles,elapsedSeconds:elapsed,battlesPerSecond:battles/elapsed,deterministicResultsSha256:digest(results),results}));
console.log(JSON.stringify({event:'finished',states:results.length,battles,elapsedSeconds:Math.round(elapsed),battlesPerSecond:Math.round(battles/elapsed)}));
