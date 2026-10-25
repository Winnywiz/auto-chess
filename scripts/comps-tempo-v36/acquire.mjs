import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {campaign} from './campaign.mjs';
import {planTurn} from './policy.mjs';
import {read,write,H,roster,family,mean,quantile} from './native.mjs';
if(!isMainThread){parentPort.on('message',job=>{try{const result=campaign(job.seed,{plan:job.plan,seat:job.seat,turn:planTurn,seals:workerData.seals});result.players=result.players.filter(p=>p.id===result.controlled);parentPort.postMessage({result});}catch(e){parentPort.postMessage({error:e.stack,job:job.plan.id});}});}
else{
 const source=process.argv[2]??'shortlist.json',games=Number(process.argv[3]??12),name=process.argv[4]??'acquisition-screen',seals=process.argv[5]==='ranked',plans=read(source),jobs=[];
 for(const plan of plans)for(let i=0;i<games;i++)jobs.push({plan,seed:name+'/'+i,seat:i%8});
 const results=[];let next=0;const start=performance.now();
 await Promise.all(Array.from({length:Math.min(8,jobs.length)},()=>new Promise((resolve,reject)=>{
  const w=new Worker(fileURLToPath(import.meta.url),{workerData:{seals}});const send=()=>{if(next<jobs.length)w.postMessage(jobs[next++]);else{w.terminate();resolve();}};
  w.on('message',m=>{if(m.error){w.terminate();reject(Error(m.job+': '+m.error));return;}results.push(m.result);if(results.length%32===0)console.log(name+' '+results.length+'/'+jobs.length);send();});w.on('error',reject);send();
 })));
 const summarize=(plan,games)=>{
  const rows=games.map(g=>{const p=g.players.find(p=>p.id===g.controlled),last=p.path.at(-1),reached=p.path.find(s=>s.code===48),complete=p.path.find(s=>s.level>=plan.level&&plan.team.every(u=>s.owned.filter(v=>roster[u.line].branchOf?v.line===u.line:family(v.line)===family(u.line)).reduce((n,v)=>n+3**(v.star-1),0)>=3**(u.star-1)));
   const carry=p.path.find(s=>s.owned.some(u=>u.line===plan.carry&&u.star>=(plan.carryStar??plan.team.find(u=>u.line===plan.carry).star)));
   return {seed:g.seed,seat:g.seat,alive:p.alive,place:p.place,reached:!!reached,complete:!!complete,completeRound:complete?.round??null,completionLedger:complete?{roll:complete.roll,buy:complete.buy,sell:complete.sell,xp:complete.xp,earned:complete.earned+complete.otherEarned}:null,carryHit:!!carry,carryRound:carry?.round??null,
    finish:reached??last,spend:p.ledger.buy+p.ledger.roll+p.ledger.xp-p.ledger.sell,buy:p.ledger.buy,roll:p.ledger.roll,xp:p.ledger.xp,sell:p.ledger.sell,earned:p.ledger.earned+p.ledger.otherEarned,
    rounds:p.path.filter(s=>[21,32,41,44,48].includes(s.code)),errorCount:Object.values(p.ledger.errors).reduce((a,b)=>a+b,0)};});
  return {id:plan.id,games:rows.length,level:plan.level,carry:plan.carry,upgrades:plan.upgrades,apiScore:plan.apiScore,
   reachRate:mean(rows.map(r=>+r.reached)),aliveOrWon:mean(rows.map(r=>+(r.alive||r.place===1))),completeRate:mean(rows.map(r=>+r.complete)),carryRate:mean(rows.map(r=>+r.carryHit)),
   meanHpAtLast:mean(rows.map(r=>r.finish?.hp??0)),earnedMean:mean(rows.map(r=>r.earned)),rollMean:mean(rows.map(r=>r.roll)),rollP10:quantile(rows.map(r=>r.roll),.1),rollMedian:quantile(rows.map(r=>r.roll),.5),rollP90:quantile(rows.map(r=>r.roll),.9),
   minimumRollAmongCompletions:rows.some(r=>r.complete)?Math.min(...rows.filter(r=>r.complete).map(r=>r.completionLedger.roll)):null,
   buyMean:mean(rows.map(r=>r.buy)),xpMean:mean(rows.map(r=>r.xp)),sellMean:mean(rows.map(r=>r.sell)),spendMean:mean(rows.map(r=>r.spend)),rows};
 };
 const summary=plans.map(p=>summarize(p,results.filter(r=>r.plan===p.id)));write(name+'.json',{engine:H.identity,seals,generated:new Date().toISOString(),gamesPerPlan:games,seedPrefix:name,policyFingerprint:H.hash(['campaign.mjs','policy.mjs','native.mjs'].map(f=>[f,fs.readFileSync(new URL(f,import.meta.url),'utf8')])),plans:summary,seconds:(performance.now()-start)/1000});
 // Full paths and ledgers are private, never exported into the website.
 write(name+'-raw.json',results);
 console.log(JSON.stringify({plans:plans.length,games:jobs.length,seconds:(performance.now()-start)/1000,best:summary.sort((a,b)=>b.completeRate-a.completeRate).slice(0,8).map(s=>[s.carry,s.level,s.upgrades.length,s.completeRate,s.carryRate,s.rollMean])}));
}
