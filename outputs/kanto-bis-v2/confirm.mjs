import {isMainThread,parentPort,Worker} from 'node:worker_threads';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {confirmState,confirmationConfig,confirmationFixtures,opponents} from './confirm-protocol.mjs';
import {digest} from './experiment.mjs';
if(!isMainThread){
  parentPort.on('message',r=>{try{parentPort.postMessage({result:confirmState(r)});}catch(error){parentPort.postMessage({error:error.stack});}});
}else{
  const input=JSON.parse(await readFile(new URL('./results.json',import.meta.url)));
  const all=input.results,results=[],workers=[],start=performance.now(),startedAt=new Date().toISOString();let next=0,active=0,battles=0;
  const workerCount=Math.min(5,all.length);
  const sourceHashes=Object.fromEntries(await Promise.all(['confirm.mjs','confirm-protocol.mjs'].map(async p=>[p,createHash('sha256').update(await readFile(new URL(p,import.meta.url))).digest('hex')])));
  await writeFile(new URL('./confirmation-protocol.json',import.meta.url),JSON.stringify({startedAt,sourceResultsSha256:input.deterministicResultsSha256,config:confirmationConfig,sourceHashes,opponents,fixtures:all.map(r=>({line:r.line,star:r.star,fixtures:confirmationFixtures(r.line,r.star)}))},null,2));
  console.log(JSON.stringify({event:'confirmation-start',states:all.length,workers:workerCount,config:confirmationConfig}));
  await new Promise((resolve,reject)=>{
    function assign(w){if(next<all.length){active++;w.postMessage(all[next++]);}else if(!active)resolve();}
    for(let i=0;i<workerCount;i++){
      const w=new Worker(new URL(import.meta.url));workers.push(w);w.on('error',reject);
      w.on('message',m=>{if(m.error){reject(Error(m.error));return;}active--;results.push(m.result);battles+=m.result.battles;console.log(JSON.stringify({event:'confirmation-completed',line:m.result.line,star:m.result.star,completed:results.length,total:all.length,battles,elapsedSeconds:Math.round((performance.now()-start)/1000)}));assign(w);});assign(w);
    }
  }).finally(async()=>{await Promise.all(workers.map(w=>w.terminate()));});
  results.sort((a,b)=>all.findIndex(r=>r.line===a.line&&r.star===a.star)-all.findIndex(r=>r.line===b.line&&r.star===b.star));
  const elapsedMs=performance.now()-start,stable=results.map(({elapsedMs,...r})=>r);
  const output={startedAt,finishedAt:new Date().toISOString(),workers:workerCount,config:confirmationConfig,sourceResultsSha256:input.deterministicResultsSha256,sourceHashes,battles,elapsedMs,battlesPerSecond:battles/(elapsedMs/1000),deterministicResultsSha256:digest(stable),results};
  await writeFile(new URL('./confirmation.json',import.meta.url),JSON.stringify(output));
  console.log(JSON.stringify({event:'confirmation-finished',states:all.length,battles,elapsedSeconds:elapsedMs/1000,battlesPerSecond:output.battlesPerSecond,digest:output.deterministicResultsSha256}));
}
