import fs from 'node:fs';
import os from 'node:os';
import {jobs} from './pool.mjs';
import {identity,build,shop,nativeRoster} from './native.mjs';
const trials=Number(process.argv.find(a=>a.startsWith('--trials='))?.split('=')[1]??512),list=[];
const near=process.argv.includes('--near-only');
for(const [line,cost] of [['bulbasaur',1],['abra',2],['exeggcute',3],['aerodactyl',4],['mewtwo',5]].filter(([,c])=>!near||c<=3))for(const level of [4,5,6,7,8,9])for(const gold of [20,40,60])for(const owned of near?[8]:cost<=3?[0,3,6]:[0,1,2])for(const taken of [0,6]){
  const condition={line,cost,level,gold,owned,taken,goal:cost<=3?9:3};list.push({type:'shop',key:JSON.stringify(condition),condition,seeds:Array.from({length:trials},(_,i)=>`realism-shop-v1/${i}`)});
}
const start=performance.now(),out=await jobs(list,{directory:near?'work/realism-v34/shops-near':'work/realism-v34/shops'});
const wilson=(n,total)=>{const z=1.96,p=n/total,d=1+z*z/total,m=(p+z*z/(2*total))/d,h=z*Math.sqrt(p*(1-p)/total+z*z/(4*total*total))/d;return [m-h,m+h];};
const rows=out.map(({job,results})=>{const hit=results.filter(r=>r.hit),mean=k=>results.reduce((n,r)=>n+r[k],0)/results.length;return {...job.condition,n:results.length,hits:hit.length,rate:hit.length/results.length,interval:wilson(hit.length,results.length),meanSpend:mean('spent'),meanRolls:mean('rolls'),meanBought:mean('bought')};});
const report={build,identity,generated:new Date().toISOString(),runtime:process.version,cpu:os.cpus()[0].model,workers:os.availableParallelism(),trials,odds:shop.s.odds,poolCopies:nativeRoster.o,
  method:'Conditional single-target shop tests: one fresh opening shop, then native purchases and paid rerolls. Gold budgets include purchases. Stated starting copies are already owned; enemy-held copies are unavailable. No income, XP, other purchases or Seals. Representative lines share their cost-class pool rules; actual per-composition paths are tested separately.',rows,elapsedSeconds:(performance.now()-start)/1000};
fs.writeFileSync(near?'work/realism-v34/shops-near.json':'work/realism-v34/shops.json',JSON.stringify(report,null,2));console.log(JSON.stringify({scenarios:rows.length,trials:rows.length*trials,seconds:report.elapsedSeconds}));
