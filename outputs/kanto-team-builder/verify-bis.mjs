import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {sim} from '../kanto-headless-v2/headless.mjs';

const base=new URL('./',import.meta.url);
const data=JSON.parse(await readFile(new URL('data.json',base)));
const confirmation=JSON.parse(await readFile(new URL('../kanto-bis-v2/confirmation.json',base)));
const context=vm.createContext({KANTO_DATA:data});context.window=context;
vm.runInContext(await readFile(new URL('dist/bis.js',base),'utf8'),context);
vm.runInContext(await readFile(new URL('dist/logic.js',base),'utf8'),context);
const L=context.TeamLogic;
assert.equal(Object.keys(context.KANTO_BIS.states).length,171);
assert.equal(context.KANTO_BIS.confirmationDigest,confirmation.deterministicResultsSha256);
let builds=0;
for(const r of confirmation.results){
  const row=L.bis(r),runner=r.evaluated.find(c=>c.key===r.frozenRunner);
  assert.equal(row.name,r.name);assert.equal(row.star,r.star);assert.equal(row.line,r.line);
  assert.equal(JSON.stringify(row.items),JSON.stringify(r.selected.items));
  assert.equal(JSON.stringify(row.alternative.items),JSON.stringify(runner.items));
  assert.equal(row.score,r.selected.outcomes.reduce((n,x)=>n+x/2,0)/r.selected.n);
  assert.equal(row.alternative.score,runner.score);assert.equal(row.battles,512);
  assert.equal(row.confidence,r.comparison.high<0?'alternative':r.comparison.low>0?'lead':'close');
  assert.equal(JSON.stringify(row.interval),JSON.stringify([r.comparison.low,r.comparison.high]));
  for(const items of [row.items,row.alternative.items]){
    let held=[];for(const id of items){const equipped=sim.gt(held,id);assert.ok(equipped);held=equipped.items;}assert.equal(held.length,3);assert.equal(JSON.stringify(held),JSON.stringify(items));builds++;
  }
}
for(const u of ['vaporeon','jolteon','flareon'].map(line=>({line,star:1})))assert.equal(L.bis(u),null);


console.log(JSON.stringify({verifiedStates:171,legalThreeItemBuilds:builds,unreachableStatesWithoutFabricatedResults:3,confirmationDigest:context.KANTO_BIS.confirmationDigest}));
