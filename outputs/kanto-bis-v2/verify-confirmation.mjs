import './extend-coverage.mjs';
import {states} from './coverage.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {heuristic,setupFor,fixturesFor,config,seedFor,digest} from './experiment.mjs';
import {confirmationFixtures,confirmState,confirmationConfig} from './confirm-protocol.mjs';
const checks=[];
const check=(name,fn)=>{fn();checks.push(name);};
check('All confirmation fixtures have legal 6v6 boards and equal eight-item budgets',()=>{
  for(const s of states)for(const f of confirmationFixtures(s.line,s.star)){
    for(const [side,team] of [setupFor(f,heuristic(s.line,s.star),0).home,f.away].entries()){
      assert.equal(team.length,6);assert.equal(new Set(team.map(u=>u.line)).size,6);assert.equal(new Set(team.map(u=>u.cell)).size,6);assert.equal(team.reduce((n,u)=>n+u.items.length,0),8);
      assert.ok(team.every(u=>u.star===s.star&&u.cell>=(side===0?28:0)&&u.cell<(side===0?56:28)));
    }
  }
});
check('Confirmation opponent lineups were unused in search or shortlist validation',()=>{
  for(const star of [1,2,3]){
    const seen=new Set([...fixturesFor('pikachu',star,'refine'),...fixturesFor('pikachu',star,'validation')].map(f=>f.away.map(u=>u.line).sort().join('|')));
    for(const f of confirmationFixtures('pikachu',star)){const value=f.away.map(u=>u.line).sort().join('|');assert.ok(!seen.has(value));seen.add(value);}
  }
});
check('Confirmation seeds are disjoint from all search stages',()=>{
  const seen=new Set();
  for(const stage of ['screen','refine','validation'])for(const f of fixturesFor('pikachu',2,stage))for(let i=0;i<config[stage].seeds;i++)seen.add(seedFor(stage,f.id,i));
  for(const f of confirmationFixtures('pikachu',2))for(let i=0;i<confirmationConfig.seeds;i++){const seed=seedFor('confirmation',f.id,i);assert.ok(!seen.has(seed));seen.add(seed);}
});
const pilot=JSON.parse(await readFile(new URL('./pilot.json',import.meta.url))),state=pilot.results.find(r=>r.line==='pikachu');
const a=confirmState(state),b=confirmState(state),stable=({elapsedMs,...r})=>r;
check('Frozen candidate is retained without reselection and has 512 confirmation battles',()=>{
  assert.equal(a.selected.key,state.bestObserved);assert.equal(a.selected.n,512);assert.equal(a.comparison.blocks,256);assert.equal(a.evaluated.filter(c=>c.key===state.nativeItems.join('|')).length,1);
});
check('Complete confirmation case repeats identically',()=>assert.equal(digest(stable(a)),digest(stable(b))));
await writeFile(new URL('./confirmation-verification.json',import.meta.url),JSON.stringify({passed:checks.length,checks,pilotConfirmationDigest:digest(stable(a)),selectedScore:a.selected.score,pairedGap:a.comparison},null,2));
console.log(JSON.stringify({passed:checks.length,selectedScore:a.selected.score,pairedGap:a.comparison},null,2));
