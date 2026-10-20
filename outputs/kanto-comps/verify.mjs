import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {Battle,fight,battleDigest,sim} from '../kanto-headless-v2/headless.mjs';
import {categories,lines,settings,tasks,seedFor,digest,opponent,teamFor,searchTask,confirmCandidate,interval,bisDigest,poolLegal} from './experiment.mjs';
const checks=[];const check=(name,fn)=>{fn();checks.push(name);};
const setup={home:opponent('screen',0,6),away:opponent('screen',1,6).map(u=>({...u,cell:55-u.cell})),weather:null};
check('Fixed seeds replay complete native units and events; different seeds differ',()=>{
 assert.equal(battleDigest(fight(setup,123)),battleDigest(fight(setup,123)));
 assert.notEqual(battleDigest(fight(setup,123)),battleDigest(fight(setup,124)));
});
check('All opponent fixtures have legal unique positions, full item budgets and valid evolved forms',()=>{
 for(const stage of ['screen','validation','confirmation'])for(let i=0;i<settings[stage].contexts;i++)for(const level of [5,6,7,8,9]){
  const team=opponent(stage,i,level);assert.equal(team.length,level);assert.equal(new Set(team.map(u=>u.cell)).size,level);assert.equal(new Set(team.map(u=>u.line)).size,level);
  assert.equal(team.reduce((n,u)=>n+u.items.length,0),level+3);assert.ok(poolLegal(team));
  for(const u of team){assert.ok(u.cell>=28&&u.cell<56);assert.ok(!(lines[u.line].branchOf&&u.star===1));let held=[];for(const id of u.items){const e=sim.gt(held,id);assert.ok(e);held=e.items;}}
 }
});
check('Combat seeds are disjoint across all phases, levels and contexts',()=>{
 const seen=new Set();for(const stage of ['screen','validation','confirmation'])for(const level of [5,6,7,8,9])for(let c=0;c<settings[stage].contexts;c++)for(let i=0;i<settings[stage].seeds;i++){
  const seed=seedFor('combat',stage,level,c,i);assert.ok(!seen.has(seed));seen.add(seed);
 }
});
check('Enemy lineups are unique within a level and never reused in later phases',()=>{
 for(const level of [5,6,7,8,9]){const seen=new Set();for(const stage of ['screen','validation','confirmation'])for(let i=0;i<settings[stage].contexts;i++){
  const key=opponent(stage,i,level).map(u=>u.line).sort().join('|');assert.ok(!seen.has(key));seen.add(key);
 }}
});
check('Paired comparison uses side-paired blocks and preserves differences',()=>{const x=interval([.5,0,.5,0]);assert.equal(x.mean,.25);assert.equal(x.blocks,4);});
const pilotTask=tasks.find(t=>t.category==='reroll-5'&&t.carry==='charmander');
const pilot=searchTask(pilotTask),repeat=searchTask(pilotTask);
check('A complete composition search replays deterministically',()=>assert.equal(digest(pilot),digest(repeat)));
for(const v of pilot.validated)check('Core is preserved and equipment budget is fixed for '+digest(v.candidate).slice(0,8),()=>{
 const cat=categories.find(c=>c.id===v.candidate.category);let previous=[];
 for(const level of cat.levels){const team=teamFor(v.candidate,level);assert.equal(team.length,level);assert.equal(team.reduce((n,u)=>n+u.items.length,0),level+3);assert.ok(previous.every(id=>team.some(u=>u.line===id)));previous=team.map(u=>u.line);}
});
const output={passed:checks.length,checks,bisDigest,pilotDigest:digest(pilot),pilotTask};
await writeFile(new URL(process.env.KANTO_COMPS_SMOKE==='1'?'./smoke-verification.json':'./verification.json',import.meta.url),JSON.stringify(output,null,2));console.log(JSON.stringify(output));
