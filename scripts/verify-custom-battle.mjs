import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as browser from '../simulation/engine-v37.js';
import {simulate,validateRequest} from '../simulation/battle-core.js';
import * as native from '../work/native-v37/headless.mjs';
const game=JSON.parse(fs.readFileSync('simulation/data-v37.json'));
const reference={Battle:native.Battle,translate:native.roster.x,rules:native.rules,identity:native.identity};
const provenance=JSON.parse(fs.readFileSync('simulation/provenance-v37.json'));
assert.equal(provenance.engineSHA256,createHash('sha256').update(fs.readFileSync('simulation/engine-v37.js')).digest('hex'));
assert.equal(game.identity,native.identity);assert.equal(browser.identity,native.identity);
const unit=(line,star,cell,items=[])=>({line,star,cell,items});
let cases=0;
for(const r of game.roster)for(const star of [1,2,3]){
 const f=r.forms[star-1];for(const file of ['media/sprites/'+f.num+'.gif','media/icons/'+f.num+'.png'])assert(fs.existsSync(file),'Missing Pokémon art: '+file);
 const q={rules:37,seed:19283+cases,runs:1,a:[unit(r.id,star,r.range<=2?31:52,['shell-bell','focus-sash','scope-lens'])],b:[unit('snorlax',2,31,['leftovers']),unit('pikachu',2,52,['choice-specs'])]};
 const input=JSON.stringify(q),got=simulate(browser,game,q),expected=simulate(reference,game,q);
 assert.deepEqual(got,expected,'Native parity: '+r.id+' '+star);assert.equal(JSON.stringify(q),input,'Input mutated');cases++;
}
// Published recordings provide an independent golden trace from the earlier generator.
const catalogue=JSON.parse(fs.readFileSync('analysis/matchups.json'));let golden=0;
const spread=[...catalogue.pairs.filter((_,i)=>i%7===0),...catalogue.pairs.filter((_,i)=>i%7!==0)];
for(const p of process.argv.includes('--engine-only')?[]:spread){
 if(golden===8)break;
 const file=JSON.parse(fs.readFileSync('analysis/replays/'+p.key+'.json')),r=file.replays.find(r=>r.side===0)??file.replays[0];if(!r)continue;
 const a=catalogue.builds[p.level].find(x=>x.id===p.a),b=catalogue.builds[p.level].find(x=>x.id===p.b);
 const q={rules:37,a:r.side===0?a.team:b.team,b:r.side===0?b.team:a.team,seed:r.seed,runs:1};
 const got=simulate(browser,game,q).replays[0];
 for(const k of ['winner','duration','frames','stats','statFields','changes','events'])assert.deepEqual(got[k],r[k],'Golden replay '+p.key+' / '+k);golden++;
}
if(!process.argv.includes('--engine-only'))assert.equal(golden,8);
const q={rules:37,a:[unit('ditto',2,31,['focus-sash'])],b:[unit('mew',2,31,['choice-specs'])],seed:7,runs:32};
const batch=simulate(browser,game,q);assert.deepEqual(batch,simulate(reference,game,q));assert.deepEqual(batch,simulate(browser,game,q));
assert.equal(batch.wins+batch.losses+batch.draws,32);assert(batch.replays.length>0);assert(batch.replays.length<=3);
const invalid=[{...q,seed:NaN},{...q,seed:-1},{...q,seed:1.5},{...q,seed:4294967296},{...q,runs:100000},{...q,a:[]},{...q,a:Array(10).fill(q.a[0])},{...q,a:[unit('missing',1,31)]},{...q,a:[unit('pikachu',4,31)]},{...q,a:[unit('pikachu',1,27)]},{...q,a:[unit('pikachu',1,31,['unknown'])]},{...q,a:[unit('pikachu',1,31,['leftovers','leftovers','leftovers','leftovers'])]},{...q,a:[unit('pikachu',1,31),unit('snorlax',1,31)]}];
for(const input of invalid)assert.throws(()=>validateRequest(input,game));
assert.deepEqual(validateRequest({...q,a:[]},game,{allowEmpty:true}).a,[],'Incomplete editor setups can be restored');
for(const item of game.items){
 const file=item.id.startsWith('emblem-')?'media/types/'+item.id.slice(7)+'.png':'media/items/'+item.id+'.png';assert(fs.existsSync(file),'Missing item art: '+file);
 const setup={rules:37,seed:123,runs:1,a:[unit('snorlax',2,31,[item.id]),unit('vaporeon',2,52)],b:[unit('gastly',2,31),unit('pikachu',2,52)]};
 assert.deepEqual(simulate(browser,game,setup),simulate(reference,game,setup),'Held item parity: '+item.id);cases++;
}
for(const [stat,index] of [['healed',2],['shielded',3],['mitigated',4]]){
 const setup={rules:37,seed:123,runs:1,a:[unit('chansey',1,31,['leftovers','focus-sash','light-clay'])],b:[unit('mewtwo',3,31,['choice-specs','choice-scarf','scope-lens'])]};
 const r=simulate(browser,game,setup).replays[0],totals=r.units.map((_,i)=>r.stats.at(-1)[1+i*5+index]);
 assert(totals.some(n=>n>0),'Expected native '+stat+' counters');
}
console.log(JSON.stringify({passed:true,nativeCases:cases,goldenReplays:golden,batchFights:32,invalidInputs:invalid.length,heldItems:game.items.length,healingShieldsMitigation:true}));
