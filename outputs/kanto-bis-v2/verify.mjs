import {states,excludedStates} from './coverage.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {Worker} from 'node:worker_threads';
import {fight,battleDigest} from '../kanto-headless-v2/headless.mjs';
import {sim} from '../kanto-headless-v2/headless.mjs';
import {builds,config,fixturesFor,setupFor,oneBattle,seedFor,heuristic,digest,evaluateBuild,pairedComparison} from './experiment.mjs';
const checks=[],details={};
const check=(name,fn)=>{fn();checks.push(name);};
check('171 reachable line/star states; three synthetic branch states excluded',()=>{assert.equal(states.length,171);assert.equal(excludedStates.length,3);});
check('1771 distinct legal three-finished-item multisets including triple duplicates',()=>{
  assert.equal(builds.length,1771);assert.equal(new Set(builds.map(b=>b.join('|'))).size,1771);
  for(const b of builds){let held=[];for(const id of b){const result=sim.gt(held,id);assert.ok(result);held=result.items;}assert.deepEqual(held,b);}
});
check('All training and validation fixtures have six unique units, legal disjoint cells, and equal eight-item budgets with a full target',()=>{
  for(const s of states)for(const stage of ['screen','refine','validation'])for(const f of fixturesFor(s.line,s.star,stage)){
    const setup=setupFor(f,heuristic(s.line,s.star),0);
    for(const [side,team] of [setup.home,setup.away].entries()){
      assert.equal(team.length,6);assert.equal(new Set(team.map(u=>u.cell)).size,6);assert.equal(new Set(team.map(u=>u.line)).size,6);
      assert.equal(team.reduce((n,u)=>n+u.items.length,0),8);
      for(const u of team){assert.equal(u.star,s.star);assert.ok(Number.isInteger(u.cell));assert.ok(side===0?u.cell>=28&&u.cell<56:u.cell>=0&&u.cell<28);}
    }
    const reverse=setupFor(f,heuristic(s.line,s.star),1);
    assert.deepEqual(reverse.home.map(u=>u.cell),setup.away.map(u=>55-u.cell));
    assert.deepEqual(reverse.away.map(u=>u.cell),setup.home.map(u=>55-u.cell));
    assert.equal(reverse.away.filter(u=>u.ownedId==='bis-target').length,1);
  }
});
check('All stage/context seeds are distinct across search and held-out evaluation',()=>{
  const seen=new Set();
  for(const stage of ['screen','refine','validation'])for(const f of fixturesFor('pikachu',2,stage))for(let i=0;i<config[stage].seeds;i++){
    const seed=seedFor(stage,f.id,i);assert.ok(!seen.has(seed));seen.add(seed);
  }
  details.distinctSeeds=seen.size;
});
const state=states.find(s=>s.line==='pikachu'&&s.star===2),fixtures=fixturesFor(state.line,state.star,'validation');
const setup=setupFor(fixtures[0],['choice-band','choice-scarf','shell-bell'],0),before=digest(setup),seed=seedFor('validation',fixtures[0].id,0);
const a=fight(setup,seed),b=fight(setup,seed),c=fight(setup,seed+1);
check('Same seed reproduces complete unit state and native event trace',()=>assert.equal(battleDigest(a),battleDigest(b)));
check('A different seed changes native battle trace',()=>assert.notEqual(battleDigest(a),battleDigest(c)));
check('Simulation leaves input fixtures unchanged',()=>assert.equal(digest(setup),before));
details.replay={seed,digest:battleDigest(a),differentSeedDigest:battleDigest(c),events:a.events.length};
check('Outcome wrapper agrees with native winner, timeout and target side',()=>{
  const x=oneBattle(setup,seed,0);assert.equal(x.outcome,a.winner===-1?1:a.winner===0?2:0);assert.equal(x.timeout,+a.timedOut);
  const u=a.units.find(u=>u.ownedId==='bis-target');assert.equal(x.damage,u.dealt);assert.equal(x.healing,u.healed);
  const reverse=setupFor(fixtures[0],['choice-band','choice-scarf','shell-bell'],1),y=oneBattle(reverse,seed,1),r=fight(reverse,seed);
  assert.equal(y.outcome,r.winner===-1?1:r.winner===1?2:0);
});
check('Native duplicate item bonuses stack rather than being silently removed',()=>{
  const one=setupFor(fixtures[0],['choice-scarf'],0),three=setupFor(fixtures[0],Array(3).fill('choice-scarf'),0);
  const x=fight(one,seed).units.find(u=>u.ownedId==='bis-target'),y=fight(three,seed).units.find(u=>u.ownedId==='bis-target');
  assert.equal(y.items.length,3);assert.ok(Math.abs(y.as/x.as-1.35**2)<1e-10);
});
check('Paired comparisons use both orientations as one block and reproduce score differences',()=>{
  const x=evaluateBuild(fixtures,['choice-band','choice-scarf','shell-bell'],'validation'),y=evaluateBuild(fixtures,[],'validation'),p=pairedComparison(x,y);
  assert.equal(x.n,384);assert.equal(p.blocks,192);assert.ok(Math.abs(p.delta-(x.score-y.score))<1e-12);
  const same=pairedComparison(x,x);assert.equal(same.delta,0);assert.equal(same.se,0);
});
const permutations=arr=>arr.length?arr.flatMap((v,i)=>permutations(arr.filter((_,j)=>j!==i)).map(t=>[v,...t])):[[]];
const orderCases=[['choice-band','choice-scarf','shell-bell'],['focus-sash','leftovers','quick-claw'],['life-orb','scope-lens','shell-bell']];
const strip=(key,value)=>key==='items'?undefined:typeof value==='number'?Math.round(value*1e9)/1e9:value;
const orderMismatches=[];let orderTrials=0;
for(const line of ['pikachu','abra','snorlax'])for(const orderCase of orderCases){
  const f=fixturesFor(line,2,'validation')[0];let reference;
  for(const build of permutations(orderCase)){
    const battle=fight(setupFor(f,build,0),seed),value=JSON.stringify({winner:battle.winner,units:battle.units,events:battle.events},strip);
    if(reference===undefined)reference=value;else if(value!==reference)orderMismatches.push({line,build});
    orderTrials++;
  }
}
details.itemOrder={trials:orderTrials,mismatches:orderMismatches.length,examples:orderMismatches.slice(0,3),scope:'Sampled permutations only; search always uses canonical item order.'};
check('Sampled item-order permutations preserve outcomes and rounded native traces',()=>assert.equal(orderMismatches.length,0));
if(process.argv.includes('--replay-pilot')){
  const pilot=JSON.parse(await readFile(new URL('./pilot.json',import.meta.url)));
  const run=()=>new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('./worker.mjs',import.meta.url));
    worker.on('error',reject);worker.on('message',async m=>{if(m.type==='result'){await worker.terminate();resolve(m.result);}else if(m.type==='error'){await worker.terminate();reject(Error(m.message));}});worker.postMessage(state);
  });
  const actual=await run(),expected=pilot.results.find(s=>s.line===state.line&&s.star===state.star);
  const stable=({stageTimes,...r})=>r;
  check('Complete three-stage Pikachu case replays identically in a fresh worker',()=>assert.equal(digest(stable(actual)),digest(stable(expected))));
  details.freshWorkerDigest=digest(stable(actual));
}
check('No browser globals or network access in the evaluator',()=>{
  assert.equal(typeof globalThis.window,'undefined');assert.equal(typeof globalThis.document,'undefined');
  assert.throws(()=>globalThis.fetch('https://example.com'),/Network disabled/);assert.throws(()=>Math.random(),/Unseeded/);
});
await writeFile(new URL('./verification.json',import.meta.url),JSON.stringify({passed:checks.length,checks,details},null,2));
console.log(JSON.stringify({passed:checks.length,details},null,2));
