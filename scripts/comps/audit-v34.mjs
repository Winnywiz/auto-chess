// Targeted upgrade sensitivity audit, not a new search or a ranked-game simulation.
import assert from 'node:assert/strict';
import os from 'node:os';
import {readPage,readJSON,capItems,seedList,writeJSON,traitCounts} from './common.mjs';
import {scorePairs,nativeRoot} from './pool.mjs';
import {engineIdentity} from '../native/identity.mjs';
const {fight}=await import(new URL('headless.mjs',nativeRoot));
const {comps}=readPage(),refs=readJSON('references.json').references;
const seeds=seedList(32,'v34-review-upgrades-2026-10-22'),pairs=[],index=[];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
for(const id of ['v34-search-1','v34-search-2'])for(const level of [8,9]){
  const row=comps.rows.find(r=>r.id===id),base=capItems(row.boards.find(b=>b.level===level).team);
  // One strongest published opponent per opposing trait family, plus both reference groups.
  const families=new Map();
  for(const r of [...comps.rows].sort((a,b)=>b.stages.find(s=>s.level===level).score-a.stages.find(s=>s.level===level).score)){
    if(r.family!==row.family&&!families.has(r.family))families.set(r.family,r);
  }
  const opponents=[...refs.filter(r=>r.level===level),...[...families.values()].map(r=>({id:r.id,group:'peer',team:capItems(r.boards.find(b=>b.level===level).team)}))];
  const variants={cap:base,venusaur2:base.map(u=>u.line==='bulbasaur'?{...u,star:2}:u),supportUpgrades2:base.map(u=>u.star===3&&u.line!==row.carry?{...u,star:2}:u)};
  for(const [variant,a] of Object.entries(variants))for(const b of opponents){pairs.push({a,b:b.team});index.push({id,level,variant,group:b.group,opponent:b.id});}
}
const start=performance.now(),scores=await scorePairs(pairs,seeds,{label:'fresh-seed upgrade audit'}),rows=[];
for(const id of ['v34-search-1','v34-search-2'])for(const level of [8,9])for(const variant of ['cap','venusaur2','supportUpgrades2']){
  const selected=index.map((x,i)=>({...x,score:scores[i]})).filter(x=>x.id===id&&x.level===level&&x.variant===variant);
  rows.push({id,level,variant,groups:Object.fromEntries(['workbook','api','peer'].map(g=>[g,mean(selected.filter(x=>x.group===g).map(x=>x.score))])),pairs:selected.length,battles:selected.length*seeds.length*2});
}
const a=pairs[0].a,b=pairs[0].b.map(u=>({...u,cell:55-u.cell}));
assert.deepEqual(fight(a,b,seeds[0]),fight(a,b,seeds[0]),'Fixed-seed native fight changed');
const ice=comps.rows.find(r=>r.id==='ice-dugtrio-search');
const report={engineIdentity:engineIdentity(nativeRoot),runtime:process.version,cpu:os.cpus()[0].model,workers:os.availableParallelism(),seeds,seedsPerPair:32,sides:2,
  method:'Exact-board sensitivity: lower Venusaur alone, then all secondary 3-star units. No shop/economy or Seals; no re-ranking. Peers are strongest per opposing trait family, not the full original cross-tag set.',
  rows,elapsedSeconds:(performance.now()-start)/1000,deterministicRepeat:true,iceCounts:ice.boards.map(b=>({level:b.level,traits:traitCounts(b.team)}))};
writeJSON('review-upgrades.json',report);
console.log(JSON.stringify(report,null,2));
