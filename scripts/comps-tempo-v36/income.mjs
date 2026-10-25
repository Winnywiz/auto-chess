import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {fileURLToPath} from 'node:url';
import {campaign} from './campaign.mjs';
import {H,data,mean,quantile,write} from './native.mjs';
if(!isMainThread){
 parentPort.on('message',job=>{try{parentPort.postMessage({result:campaign('tempo-income-v1/'+job,{seat:job%8,seals:workerData.seals})});}catch(e){parentPort.postMessage({error:e.stack});}});
}else{
 const count=Number(process.argv[2]??64),seals=process.argv[3]==='ranked',workers=Math.min(8,count),results=[];let next=0;const start=performance.now();
 await Promise.all(Array.from({length:workers},()=>new Promise((resolve,reject)=>{
  const w=new Worker(fileURLToPath(import.meta.url),{workerData:{seals}});const send=()=>{if(next<count)w.postMessage(next++);else{w.terminate();resolve();}};
  w.on('message',m=>{if(m.error){w.terminate();reject(Error(m.error));return;}results.push(m.result);if(results.length%8===0)console.log('Income games '+results.length+'/'+count);send();});w.on('error',reject);send();
 })));
 results.sort((a,b)=>a.seed.localeCompare(b.seed));
 const paths=results.flatMap(g=>g.players.map(p=>p.path)),codes=[...new Set(paths.flatMap(p=>p.map(s=>s.code)))].sort((a,b)=>a-b);
 const byRound=codes.map(code=>{const current=paths.map(p=>p.find(s=>s.code===code)).filter(Boolean),earned=current.map(s=>s.earned+s.otherEarned),all=paths.map(p=>p.filter(s=>s.code<=code).at(-1)).filter(Boolean);
  return {code,round:current[0].round,entrants:paths.length,alive:current.length,reachRate:current.length/paths.length,
   earnedSurvivorMean:mean(earned),earnedSurvivorP10:quantile(earned,.1),earnedSurvivorMedian:quantile(earned,.5),earnedSurvivorP90:quantile(earned,.9),
   earnedAllEntrantsMean:mean(all.map(s=>s.earned+s.otherEarned)),goldMean:mean(current.map(s=>s.gold)),buyMean:mean(current.map(s=>s.buy)),sellMean:mean(current.map(s=>s.sell)),rollMean:mean(current.map(s=>s.roll)),xpMean:mean(current.map(s=>s.xp)),levelMean:mean(current.map(s=>s.level)),hpMean:mean(current.map(s=>s.hp))};});
 write(seals?'income-ranked.json':'income.json',{engine:H.identity,generated:new Date().toISOString(),games:count,players:paths.length,seals,itemCap:7,
  method:'Eight equal native elite planners, rotating planning order. Real transitions, shops, shared pools, rewards, income, streaks and XP. Opening gold included; sales excluded. Ranked arm uses native automatic Seal decisions including native rerolls; income is net of those automatic fees. Deaths remain in all-entrant averages; survivor-only quantiles are separately labelled. No injected units, XP, gold or items. Cutoff before combat at before 5-1.',economy:data.economy,byRound,seconds:(performance.now()-start)/1000,results});
 console.log(JSON.stringify({games:count,seconds:(performance.now()-start)/1000,last:byRound.at(-1)}));
}
