import {states} from './coverage.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {digest,pairedComparison} from './experiment.mjs';
const base=new URL('./',import.meta.url),get=async p=>JSON.parse(await readFile(new URL(p,base)));
const search=await get('results.json'),pilot=await get('pilot.json'),checks=[];
const check=(name,fn)=>{fn();checks.push(name);};
check('Every reachable state completed exactly once',()=>{
  assert.equal(search.results.length,states.length);assert.equal(search.completed,171);assert.equal(new Set(search.results.map(r=>r.line+':'+r.star)).size,171);
  for(const s of states)assert.ok(search.results.some(r=>r.line===s.line&&r.star===s.star));
});
check('Measured battle counts equal saved candidate counts',()=>{
  const actual=search.results.reduce((sum,r)=>sum+['screening','refinement','validation'].reduce((n,stage)=>n+r[stage].reduce((n,c)=>n+c.n,0),0),0);
  assert.equal(actual,search.battles);
  for(const r of search.results){assert.equal(r.screening.length,1771);for(const stage of ['screening','refinement','validation'])for(const c of r[stage]){
    assert.equal(c.wins+c.draws+c.losses,c.n);assert.equal(c.score,(c.wins+c.draws/2)/c.n);assert.ok(Number.isFinite(c.sumDamage));assert.ok(Number.isFinite(c.sumHealing));assert.ok(Number.isFinite(c.sumMargin));
    assert.equal(c.contexts.reduce((n,x)=>n+x.n,0),c.n);assert.equal(c.n,stage==='screening'?8:stage==='refinement'?96:384);
    if(stage==='validation'){assert.equal(c.outcomes.length,c.n);assert.equal(c.outcomes.reduce((n,x)=>n+x/2,0)/c.n,c.score);}
  }}
});
check('Stable search results digest matches recorded digest',()=>assert.equal(digest(search.results.map(({stageTimes,...r})=>r)),search.deterministicResultsSha256));
check('All three independent pilot states match the parallel full run',()=>{
  for(const p of pilot.results){const r=search.results.find(r=>r.line===p.line&&r.star===p.star),stable=({stageTimes,...r})=>r;assert.equal(digest(stable(p)),digest(stable(r)));}
});
for(const [file,expected] of Object.entries(search.sourceHashes)){
  const actual=createHash('sha256').update(await readFile(new URL(file,base))).digest('hex');
  check('Search source is unchanged: '+file,()=>assert.equal(actual,expected));
}
let confirmation=null;
try{confirmation=await get('confirmation.json');}catch(e){if(e.code!=='ENOENT')throw e;}
if(confirmation){
  check('Confirmation evaluates exactly the frozen search results',()=>{
    assert.equal(confirmation.sourceResultsSha256,search.deterministicResultsSha256);assert.equal(confirmation.results.length,171);
    for(const c of confirmation.results){
      const r=search.results.find(r=>r.line===c.line&&r.star===c.star);assert.equal(c.frozenLeader,r.bestObserved);assert.equal(c.selected.key,r.bestObserved);assert.equal(c.selected.n,512);
      const runner=c.evaluated.find(x=>x.key===c.frozenRunner);assert.deepEqual(pairedComparison(c.selected,runner),c.comparison);
      for(const v of c.evaluated){assert.equal(v.n,512);assert.equal(v.outcomes.length,512);assert.equal(v.wins+v.draws+v.losses,512);assert.equal(v.score,v.outcomes.reduce((n,x)=>n+x/2,0)/512);assert.ok(Number.isFinite(v.score));}
    }
  });
  check('Confirmation battle counts and digest match saved results',()=>{
    assert.equal(confirmation.results.reduce((n,r)=>n+r.battles,0),confirmation.battles);
    assert.equal(digest(confirmation.results.map(({elapsedMs,...r})=>r)),confirmation.deterministicResultsSha256);
  });
  for(const [file,expected] of Object.entries(confirmation.sourceHashes)){
    const actual=createHash('sha256').update(await readFile(new URL(file,base))).digest('hex');
    check('Confirmation source is unchanged: '+file,()=>assert.equal(actual,expected));
  }
  const verified=await get('confirmation-verification.json'),p=confirmation.results.find(r=>r.line==='pikachu'&&r.star===2),stable=({elapsedMs,...r})=>r;
  check('Final parallel confirmation matches the independent repeatability fixture',()=>assert.equal(digest(stable(p)),verified.pilotConfirmationDigest));
}
await writeFile(new URL('./audit.json',base),JSON.stringify({passed:checks.length,checks,searchBattles:search.battles,confirmationBattles:confirmation?.battles??0},null,2));
console.log(JSON.stringify({passed:checks.length,searchBattles:search.battles,confirmationBattles:confirmation?.battles??0}));
