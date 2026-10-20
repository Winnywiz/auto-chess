import {Worker,isMainThread,parentPort} from 'node:worker_threads';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {teamFor,outcome,digest,seedFor,settings,interval,categories,bisDigest} from './experiment.mjs';
export const config={seeds:32,sides:2,gearVariants:3,scope:'Closed round robin within each strategy. Frozen paths, unchanged tier thresholds. Each pair tests both BIS boards and each carry fallback separately.'};
export function play(job){
 const levels=[];
 for(const fixture of job.levels){
  const a=teamFor(job.a,fixture.level),b=teamFor(job.b,fixture.level),fa=teamFor(job.a,fixture.level,true),fb=teamFor(job.b,fixture.level,true);
  const row={level:fixture.level,a:[],fa:[],fb:[],timeouts:[0,0,0]};
  for(const seed of fixture.seeds)for(let side=0;side<2;side++){
   const x=outcome(a,b,seed,side),y=outcome(fa,b,seed,side),z=outcome(a,fb,seed,side);
   row.a.push(x.value);row.fa.push(y.value);row.fb.push(1-z.value);row.timeouts[0]+=x.timeout;row.timeouts[1]+=y.timeout;row.timeouts[2]+=z.timeout;
  }levels.push(row);
 }
 return {index:job.index,category:job.category,a:job.a.carry,b:job.b.carry,levels};
}
if(!isMainThread){parentPort.on('message',job=>{try{parentPort.postMessage({result:play(job)});}catch(e){parentPort.postMessage({error:e.stack});}});}
else if(process.argv[1]?.endsWith('peers.mjs')){
 const start=performance.now(),startedAt=new Date().toISOString(),input=JSON.parse(await readFile(new URL('./results.json',import.meta.url)));
 const sourceSha256=createHash('sha256').update(await readFile(new URL('./peers.mjs',import.meta.url))).digest('hex');
 const used=new Set();for(const stage of ['screen','validation','confirmation'])for(const level of [5,6,7,8,9])for(let context=0;context<settings[stage].contexts;context++)for(let i=0;i<settings[stage].seeds;i++)used.add(seedFor('combat',stage,level,context,i));
 const jobs=[];
 for(const cat of categories){const paths=input.confirmed.filter(c=>c.candidate.category===cat.id).map(c=>c.candidate).sort((a,b)=>a.carry.localeCompare(b.carry));
  for(let a=0;a<paths.length;a++)for(let b=a+1;b<paths.length;b++){
   const levels=cat.levels.map(level=>({level,seeds:Array.from({length:config.seeds},(_,i)=>{let salt=0,seed;do{seed=seedFor('peer-confirmation',input.digest,cat.id,paths[a].carry,paths[b].carry,level,i,salt++);}while(used.has(seed));used.add(seed);return seed;})}));
   jobs.push({index:jobs.length,category:cat.id,a:paths[a],b:paths[b],levels});
  }
 }
 await writeFile(new URL('./peer-protocol.json',import.meta.url),JSON.stringify({config,sourceSearchDigest:input.digest,bisDigest,sourceSha256,jobs},null,2));
 const workers=[],results=[];let next=0,active=0;
 await new Promise((resolve,reject)=>{
  const assign=w=>{if(next<jobs.length){active++;w.postMessage(jobs[next++]);}else if(!active)resolve();};
  for(let i=0;i<5;i++){const w=new Worker(new URL('./peers.mjs',import.meta.url));workers.push(w);w.on('error',reject);w.on('message',m=>{if(m.error){reject(Error(m.error));return;}active--;results.push(m.result);if(results.length%50===0)console.log(JSON.stringify({phase:'peer-tournament',completed:results.length,total:jobs.length}));assign(w);});assign(w);}
 }).finally(async()=>{await Promise.all(workers.map(w=>w.terminate()));});
 results.sort((a,b)=>a.index-b.index);
 const blank=()=>({n:0,wins:0,draws:0,losses:0,timeouts:0,byLevel:[],blocks:[]});
 const rows=input.confirmed.map(c=>({category:c.candidate.category,carry:c.candidate.carry,result:blank(),fallback:blank()}));
 const add=(target,level,values,timeouts)=>{let stage=target.byLevel.find(s=>s.level===level);if(!stage){stage={level,n:0,wins:0,draws:0,losses:0};target.byLevel.push(stage);}for(const x of values){target.n++;stage.n++;const field=x===1?'wins':x===.5?'draws':'losses';target[field]++;stage[field]++;}target.timeouts+=timeouts;for(let i=0;i<values.length;i+=2)target.blocks.push((values[i]+values[i+1])/2);};
 let battles=0;
 for(const pair of results){const a=rows.find(r=>r.category===pair.category&&r.carry===pair.a),b=rows.find(r=>r.category===pair.category&&r.carry===pair.b);
  for(const stage of pair.levels){add(a.result,stage.level,stage.a,stage.timeouts[0]);add(a.fallback,stage.level,stage.fa,stage.timeouts[1]);add(b.result,stage.level,stage.a.map(x=>1-x),stage.timeouts[0]);add(b.fallback,stage.level,stage.fb,stage.timeouts[2]);battles+=stage.a.length*3;}
 }
 for(const row of rows){for(const result of [row.result,row.fallback]){result.score=(result.wins+.5*result.draws)/result.n;result.byLevel.sort((a,b)=>a.level-b.level);for(const s of result.byLevel)s.score=(s.wins+.5*s.draws)/s.n;}
  row.comparison=interval(row.result.blocks.map((x,i)=>x-row.fallback.blocks[i]));row.tier=row.result.score>=.65&&Math.min(...row.result.byLevel.map(r=>r.score))>=.5?'S':row.result.score>=.5?'A':'B';row.bisDependent=row.comparison.mean>=.05&&row.comparison.low>0;row.peers=rows.filter(r=>r.category===row.category).length-1;
 }
 const elapsedMs=performance.now()-start,result={startedAt,finishedAt:new Date().toISOString(),config,sourceSearchDigest:input.digest,bisDigest,sourceSha256,battles,elapsedMs,battlesPerSecond:battles/(elapsedMs/1000),rows,pairs:results,digest:digest({rows,pairs:results})};
 await writeFile(new URL('./peer-results.json',import.meta.url),JSON.stringify(result));console.log(JSON.stringify({phase:'peer-complete',pairs:jobs.length,battles,elapsedMs,tiers:Object.fromEntries(['S','A','B'].map(t=>[t,rows.filter(r=>r.tier===t).length])),digest:result.digest}));
}
