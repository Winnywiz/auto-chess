import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Battle,sim} from '../kanto-headless-v2/headless.mjs';

import * as roster from '../kanto-headless-v2/assets/roster-CpnLcVHu.js';
import {nativeItemFit} from './native-item-fit.mjs';
const data=JSON.parse(await readFile(new URL('./data.json',import.meta.url),'utf8'));
const context=vm.createContext({KANTO_DATA:data});
vm.runInContext(await readFile(new URL('./dist/logic.js',import.meta.url),'utf8'),context);
const L=context.TeamLogic;
// Includes repeated lines, all stars, and every Eevee branch. Deterministic fixtures.
for(let n=0;n<400;n++){
  const board={};
  for(let i=0;i<n%10;i++)board[i]={line:data.roster[(n*13+i*i*7)%data.roster.length].id,star:1+(i+n)%3};
  const native=sim.g(Object.values(board));
  for(const trait of L.traits(board)){
    assert.equal(trait.count,native.get(trait.name)??0,`count ${trait.name}, fixture ${n}`);
    assert.equal(trait.tier,sim.Z[trait.name].thresholds.filter(x=>x<=trait.count).length);
  }
}
const duplicate=L.traits({0:{line:'bulbasaur',star:1},1:{line:'bulbasaur',star:3}});
assert.equal(duplicate.find(x=>x.name==='Grass').count,1);
assert.equal(duplicate.find(x=>x.name==='Poison').count,1);
const valid={v:1,level:9,board:{2:{id:99,line:'pikachu',star:3}},bench:Array(9).fill(null),mode:'png'};
assert.equal(L.clean(valid).board[2].id,1);
for(const invalid of [
  {...valid,level:2.5}, {...valid,level:10},
  {...valid,board:{'02':{line:'pikachu',star:1}}},
  {...valid,board:{28:{line:'pikachu',star:1}}},
  {...valid,board:{2:{line:'toString',star:1}}},
  {...valid,board:{2:{line:'pikachu',star:7}}},
  {...valid,bench:Array(10).fill(null)},
])assert.throws(()=>L.clean(invalid));
assert.equal(L.catalogue.length,108);
assert.equal(new Set(L.catalogue.map(x=>x.role)).size,7);
let itemFitCases=0;
for(const line of data.roster)for(const form of line.forms){
 assert.equal(form.itemFit.length,21);
 for(const item of form.itemFit){assert.equal(item.score,nativeItemFit(item.id,{line:line.id,star:form.star}));itemFitCases++;}
 const suggested=L.suggestions({line:line.id,star:form.star,items:['leftovers']});
 assert.equal(suggested.length,3);
 assert(!suggested.some(x=>x.id==='leftovers'));
 assert(suggested.every((x,i,a)=>i===0||a[i-1].score>=x.score));
}
assert.equal(L.itemDetails('leftovers').stats[0],'+10% max HP ×2');
assert.equal(L.itemDetails('leftovers').sequential,true);
assert.equal(JSON.stringify(L.itemDetails('choice-band').stats),'["+45% Attack"]');
assert.equal(JSON.stringify(L.itemDetails('rocky-helmet').stats),'["+10% max HP","+12% Attack"]');
let equipCases=0,skillCases=0;
const holdings=[[],['hp-up'],['protein'],['calcium'],['carbos'],['iron'],['zinc'],['protector'],['eviolite'],['assault-vest'],['leftovers','choice-band'],['leftovers','choice-band','hp-up'],['leftovers','choice-band','choice-specs']];
for(const held of holdings)for(const item of data.items){
 const native=sim.gt(held,item.id);
 if(!native)assert.throws(()=>L.equip(held,item.id));
 else assert.equal(JSON.stringify(L.equip(held,item.id)),JSON.stringify(native));
 equipCases++;
}
for(const line of data.roster)for(const star of [1,2,3])for(const held of holdings){
 const unit=new Battle([{line:line.id,star,cell:28,items:held}],[],1).units[0];
 const local=L.skill({line:line.id,star,items:held});
 assert.equal(local.name,roster.x(unit.move.name,'en'));
 for(const key of ['power','mana','type','kind'])assert.equal(local[key],unit.move[key],`${line.id} star ${star}, ${key}`);
 skillCases++;
}
const itemPayload={...valid,board:{2:{line:'pikachu',star:2,items:['life-orb','hp-up']}}};
assert.equal(JSON.stringify(L.clean(itemPayload).board[2].items),'["life-orb","hp-up"]');
assert.throws(()=>L.clean({...valid,board:{2:{line:'pikachu',star:2,items:['protein','hp-up']}}}));
assert.throws(()=>L.clean({...valid,board:{2:{line:'pikachu',star:2,items:['unknown']}}}));
const manifest=JSON.parse(await readFile(new URL('./art-manifest.json',import.meta.url),'utf8'));
for(const asset of manifest){
  const b=await readFile(new URL('./dist/media/'+asset.path,import.meta.url));
  assert.equal(b.length,asset.bytes);
  assert.equal(createHash('sha256').update(b).digest('hex'),asset.sha256);
}
for(const file of ['dist/index.html','dist/app.js','dist/data.js'])assert(!/[—·]/.test(await readFile(new URL(file,import.meta.url),'utf8')),`${file} contains prohibited punctuation`);
console.log(JSON.stringify({nativeTraitFixtures:400,traitComparisons:6000,nativeEquipCases:equipCases,nativeSkillCases:skillCases,nativeItemFitCases:itemFitCases,roles:7,itemStats:'passed',duplicateRule:'passed',savedTeamValidation:'passed',catalogue:108,verifiedImages:manifest.length},null,2));
