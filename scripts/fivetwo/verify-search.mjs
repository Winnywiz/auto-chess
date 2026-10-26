import assert from 'node:assert/strict';
import {engine,data} from './engine.mjs';
import {scoreMany,startPool,family,traitCounts} from './combat.mjs';
import {STRATEGIES,buildCandidates,equip,cost,legalFinish,combos,ATK_POOL} from './search.mjs';
import {SHOP_LINES} from './rules.mjs';
import {availableForm,legalForm} from './forms.mjs';
import {route as nativeRoute} from '../../work/native-v37/headless.mjs';
const u=(line,cell)=>({line,cell,star:2,items:[]});
const a=[u('caterpie-a1',31),u('pikachu',52)],b=[u('snorlax',31)];
const mirror=t=>t.map(u=>({...u,cell:55-u.cell}));
function direct(a,b,seed){let points=0;for(let side=0;side<2;side++){const battle=new engine.Battle(structuredClone(side?b:a),mirror(structuredClone(side?a:b)),seed,null);battle.pvpClock=true;battle.start();while(!battle.over)battle.step();points+=battle.winner<0?.5:battle.winner===side?1:0;}return points/2;}
const expected=[11,22,33].map(s=>direct(a,b,s));
assert.deepEqual(await scoreMany([{a,b,seeds:[11]}]),[expected[0]]);
assert.deepEqual(await scoreMany([{a,b,seeds:[11,22,33]},{a:b,b:a,seeds:[11,22,33]}]),[expected.reduce((s,x)=>s+x,0)/3,1-expected.reduce((s,x)=>s+x,0)/3]);
let boards=0;
for(const [carry,strat] of [['pikachu','r2'],['caterpie-a1','r1'],['growlithe','f8']]){
 for(const c of buildCandidates(carry,STRATEGIES[strat],STRATEGIES[strat].finalLevel,10)){
  const q=equip(c,carry);assert.equal(q.team.reduce((s,u)=>s+u.items.length,0),7);assert(q.team.every(u=>legalFinish(u.line)));
  assert.equal(new Set(q.team.map(u=>family(u.line))).size,q.team.length);
  for(const u of q.team)if(cost(u.line)===4)assert.equal(u.star,strat==='f8'&&(u.line===carry||u.line===q.tank)?2:1);boards++;
 }
}
assert.equal(combos(ATK_POOL,3).length,220);assert.equal(SHOP_LINES.length,66);
assert.equal(data.roster.filter(r=>r.anchorK).length,58);
for(const r of data.roster.filter(r=>r.anchorK))for(const star of [1,2,3]){
 const stage=Number(r.id.match(/-a(\d)$/)[1]),base=family(r.id);
 const result=nativeRoute.kn({one:{id:'one',line:base,star}},{[base]:stage}).one.line;
 assert.equal(availableForm(r.id,star),result,'Native anchor unlock '+r.id+' '+star);
}
for(const line of ['vaporeon','jolteon','flareon'])assert.equal(availableForm(line,1),'eevee');
assert(!legalForm('dratini-a1',1));assert(legalForm('dratini-a1',2));
assert.equal(traitCounts([u('caterpie',31),u('caterpie-a1',32)]).Bug,1);
console.log(JSON.stringify({passed:true,cachedCombatMatchesNative:true,generatedLegalBoards:boards,itemMultisets:220,anchors:58,shopFamilies:66}));
startPool().close();
