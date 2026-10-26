import fs from 'node:fs';
import assert from 'node:assert/strict';
import {acquisitionPool} from './acquire-pool.mjs';
import {simulate,roundIndex} from './acquire.mjs';
import {hashSeed} from './rules.mjs';
const data=JSON.parse(fs.readFileSync('work/fiveTwo37/original/analysis.json'));
const definitions=JSON.parse(fs.readFileSync('work/native-v37/data.json')).seals;
const rule=Object.values(definitions).find(s=>s.effects.some(e=>e.k==='gold'));
const jobs=[];
for(const strat of ['r1','r3','f8'])for(const enabled of [false,true]){
 const plan=data.comps.find(c=>c.strat===strat).variants[0].realizedPlan;
 const seals=enabled?[{at:roundIndex(2,1),effects:rule.effects,k:0}]:[];
 jobs.push({plan,seals,n:24,salt:'worker-parity|'+strat+'|'+enabled});
}
const results=await Promise.all(jobs.map(j=>acquisitionPool().run(j)));
for(let k=0;k<jobs.length;k++){const j=jobs[k];let expected=0;for(let i=0;i<j.n;i++)expected+=simulate(j.plan,{seed:hashSeed(`${j.salt}|${i}`),seals:j.seals}).hit;assert.equal(results[k],expected/j.n);}
console.log(JSON.stringify({passed:true,parallelMatchesSequential:true,plansAndSealCases:jobs.length}));acquisitionPool().close();
