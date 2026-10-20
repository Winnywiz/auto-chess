import {Worker} from 'node:worker_threads';
import os from 'node:os';
import {writeFile,readFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {config,states,excludedStates,roster,items,itemNames,archetypes,fixturesFor,VERSION,digest} from './experiment.mjs';
const base=new URL('./',import.meta.url);
const pilot=process.argv.includes('--pilot');
const requested=Number(process.argv.find(x=>x.startsWith('--workers='))?.split('=')[1]??5);
const selected=pilot?['pikachu','abra','snorlax'].map(line=>states.find(s=>s.line===line&&s.star===2)):states;
const workerCount=Math.min(selected.length,Math.max(1,Math.min(requested,os.availableParallelism()-1)));
const startedAt=new Date().toISOString(),start=performance.now();
const results=[],active=new Map(),workers=[];let next=0,battles=0,fatal=null;
const sourceFiles=['experiment.mjs','worker.mjs','run.mjs'];
const sourceHashes=Object.fromEntries(await Promise.all(sourceFiles.map(async p=>[p,createHash('sha256').update(await readFile(new URL(p,base))).digest('hex')])));
const metadata={version:VERSION,startedAt,pilot,workers:workerCount,hardware:{cpu:os.cpus()[0].model,logicalProcessors:os.cpus().length,ramBytes:os.totalmem(),platform:os.platform(),release:os.release(),arch:os.arch()},runtime:{node:process.version,v8:process.versions.v8},config,excludedStates,sourceHashes,engineBuild:'sim-DVnRY1Xk / roster-CpnLcVHu',archetypes,items,notes:['All calculations are native, synchronous, rendering-free 6v6 battles. No full games or RL training are measured.','All combatants use the target star level; no weather, boons, boss bonuses, or additional shiny boost.','The target gets the searched three items, its five allies one heuristic item each, and opponents eight items across six units.','Mirrored side assignments share each numeric combat seed. Units retain native traits, item effects, AI targeting and combat RNG.','Candidate order can cause diverging RNG consumption; pairing shares starting seeds, not identical random events.','Refinement sees additional training compositions and disjoint seeds. Validation has eight unseen enemy lineups and disjoint seeds.','Best observed is selected among five refinement finalists plus the native heuristic baseline, not among all 1771 on validation.','The build selected before validation is also recorded to expose selection changes. Intervals are descriptive, unadjusted paired normal intervals over context/seed blocks with both side assignments grouped.','Results are conditional on these synthetic lineups, gearing and placements. They do not establish global BIS or optimize component allocation/economy.']};
await writeFile(new URL(pilot?'pilot-protocol.json':'protocol.json',base),JSON.stringify({...metadata,states:selected,fixtures:selected.map(s=>({...s,training:fixturesFor(s.line,s.star,'refine'),validation:fixturesFor(s.line,s.star,'validation')}))},null,2));
console.log(JSON.stringify({event:'start',states:selected.length,workers:workerCount,screenedBuildsPerState:1771,config}));
const checkpoint=async()=>{
  const ordered=[...results].sort((a,b)=>states.findIndex(s=>s.line===a.line&&s.star===a.star)-states.findIndex(s=>s.line===b.line&&s.star===b.star));
  const data={...metadata,completed:ordered.length,total:selected.length,battles,elapsedMs:performance.now()-start,results:ordered};
  const path=new URL(pilot?'pilot.partial.json':'results.partial.json',base),temp=new URL(path.href+'.tmp');
  await writeFile(temp,JSON.stringify(data));await rename(temp,path);
};
let checkpointChain=Promise.resolve();
await new Promise((resolve,reject)=>{
  function assign(w){if(next<selected.length){const s=selected[next++];active.set(w,s);w.postMessage(s);}else{active.delete(w);if(!active.size)resolve();}}
  for(let i=0;i<workerCount;i++){
    const w=new Worker(new URL('./worker.mjs',import.meta.url));workers.push(w);
    w.on('error',reject);
    w.on('message',message=>{
      if(message.type==='error'){fatal=message;reject(Error(message.message));return;}
      if(message.type==='stage'){battles+=message.battles;return;}
      results.push(message.result);
      console.log(JSON.stringify({event:'completed',line:message.result.line,star:message.result.star,completed:results.length,total:selected.length,battles,elapsedSeconds:Math.round((performance.now()-start)/1000),top:message.result.validation.find(r=>r.key===message.result.bestObserved).items}));
      if(results.length%10===0)checkpointChain=checkpointChain.then(checkpoint);
      assign(w);
    });
    assign(w);
  }
  const timer=setInterval(()=>console.log(JSON.stringify({event:'progress',completed:results.length,total:selected.length,battles,elapsedSeconds:Math.round((performance.now()-start)/1000),active:[...active.values()].map(s=>`${s.line}:${s.star}`)})),15000);
  timer.unref();
  const stop=()=>clearInterval(timer);for(const w of workers)w.on('exit',stop);
}).catch(error=>{fatal=error.stack;throw error;}).finally(async()=>{await Promise.all(workers.map(w=>w.terminate()));await checkpointChain;});
await checkpoint();
results.sort((a,b)=>states.findIndex(s=>s.line===a.line&&s.star===a.star)-states.findIndex(s=>s.line===b.line&&s.star===b.star));
const elapsedMs=performance.now()-start;
const stable=results.map(({stageTimes,...r})=>r);
const output={...metadata,finishedAt:new Date().toISOString(),completed:results.length,total:selected.length,battles,elapsedMs,battlesPerSecond:battles/(elapsedMs/1000),deterministicResultsSha256:digest(stable),fatal,results};
await writeFile(new URL(pilot?'pilot.json':'results.json',base),JSON.stringify(output));
console.log(JSON.stringify({event:'finished',states:results.length,battles,elapsedSeconds:elapsedMs/1000,battlesPerSecond:output.battlesPerSecond,digest:output.deterministicResultsSha256}));
