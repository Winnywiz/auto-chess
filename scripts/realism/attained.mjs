// Compare legal boards actually reached in the full-match experiment, including same-family mirrors.
import fs from 'node:fs';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {match} from '../../work/native-v34/headless.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const seeds=(context,a,b,i)=>Array.from({length:4},(_,j)=>parseInt(hash(['realism-attained-v1',context,a,b,i,j]).slice(0,8),16));
if(!isMainThread){parentPort.on('message',job=>{try{parentPort.postMessage({key:job.key,scores:job.pairs.map(p=>match(p.a,p.b,p.seeds))});}catch(e){parentPort.postMessage({error:e.stack});}});}
else{
  const input=JSON.parse(fs.readFileSync('work/realism-v34/matches.json')),html=fs.readFileSync('compositions.html','utf8'),rows=JSON.parse(html.match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).rows;
  const records=input.results.filter(r=>r.mode==='practical'&&!r.seals&&r.itemCap===6),contexts=['level8','round4-2'],all=[],availability={};
  for(const context of contexts){
    const pools=Object.fromEntries(rows.map(row=>[row.id,records.filter(r=>r.id===row.id).sort((a,b)=>Number(a.seed.split('/').at(-1))-Number(b.seed.split('/').at(-1))).map(r=>({seed:r.seed,board:context==='level8'?r.levels[8]:r.checkpoints['4-2']})).filter(x=>x.board).slice(0,8)]));
    availability[context]=Object.fromEntries(rows.map(r=>[r.id,{observed:records.filter(x=>x.id===r.id&&(context==='level8'?x.levels[8]:x.checkpoints['4-2'])).length,total:records.filter(x=>x.id===r.id).length,sampled:pools[r.id].length}]));
    for(let a=0;a<rows.length;a++)for(let b=a+1;b<rows.length;b++){
      const ra=rows[a],rb=rows[b],pa=pools[ra.id],pb=pools[rb.id],n=Math.min(pa.length,pb.length);if(!n)continue;
      const pairs=Array.from({length:n},(_,i)=>({a:pa[i].board.team,b:pb[i].board.team,seeds:seeds(context,ra.id,rb.id,i)}));
      all.push({key:[context,ra.id,rb.id].join('/'),context,a:ra.id,b:rb.id,categoryA:ra.category,categoryB:rb.category,pairs,
        sampleSeedsA:pa.slice(0,n).map(x=>x.seed),sampleSeedsB:pb.slice(0,n).map(x=>x.seed),levelsA:pa.slice(0,n).map(x=>x.board.level),levelsB:pb.slice(0,n).map(x=>x.board.level)});
    }
  }
  const results=[],workers=[],start=performance.now();let next=0;
  try{await Promise.all(Array.from({length:Math.min(os.availableParallelism(),12)},()=>new Promise((resolve,reject)=>{
    const w=new Worker(new URL(import.meta.url),{workerData:{}});workers.push(w);let active;
    const send=()=>{if(next>=all.length){resolve();return;}active=all[next++];w.postMessage(active);};
    w.on('error',reject);w.on('message',m=>{if(m.error){reject(Error(m.error));return;}const {pairs,...r}=active;results.push({...r,score:m.scores.reduce((s,x)=>s+x,0)/m.scores.length,snapshotScores:m.scores,battles:pairs.length*8});if(results.length%200===0)console.log(`${results.length}/${all.length} attained-board pairs`);send();});send();
  })));}finally{await Promise.all(workers.map(w=>w.terminate()));}
  results.sort((a,b)=>a.key.localeCompare(b.key));
  const report={generated:new Date().toISOString(),engineIdentity:input.metadata.engineIdentity,sourceExperiment:input.metadata.experimentIdentity,sourceDigest:hash(records),
    method:'First eight observed snapshots by predeclared seed index. Both sides, four new seeds per snapshot pair. Level 8 is conditional on reaching level 8; round 4-2 compares actual levels among survivors. Six-item acquisition cap, no Seals, neutral weather. Same- and different-family opponents included. These are snapshot fights, not full games or population-ranked win rates.',
    availability,results,battles:results.reduce((s,r)=>s+r.battles,0),seconds:(performance.now()-start)/1000};
  fs.writeFileSync('work/realism-v34/attained.json',JSON.stringify(report));console.log(JSON.stringify({pairs:results.length,battles:report.battles,seconds:report.seconds}));
}
