// Native/bundled v40 parity and patch-delta checks. No composition study is run.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as native from '../../work/native-v40/headless.mjs';
import * as bundled from '../../simulation/engine-v40.js';
import {simulate} from '../../simulation/battle-core.js';

const game=JSON.parse(fs.readFileSync('simulation/data-v40.json','utf8'));
const nativeData=JSON.parse(fs.readFileSync('work/native-v40/data.json','utf8'));
const provenance=JSON.parse(fs.readFileSync('work/engine-v40/provenance.json','utf8'));
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(game.rules,40);assert.equal(nativeData.rules,40);
assert.equal(game.identity,nativeData.identity);assert.equal(game.identity,provenance.identity);
assert.equal(bundled.rules,40);assert.equal(bundled.identity,game.identity);
assert.equal(provenance.engineSHA256,sha('work/engine-v40/engine-v40.js'));
assert.equal(provenance.dataSHA256,sha('work/engine-v40/data-v40.json'));
assert.equal(sha('work/engine-v40/data-v40.json'),sha('simulation/data-v40.json'));
assert.equal(sha('simulation/provenance-v39.json'),'998732e2ae64d840276af64a7e7ef925417343ba8aeb6915b8dcdcfbca352cd8');
assert.equal(JSON.parse(fs.readFileSync('simulation/provenance-v39.json','utf8')).rules,39);
const worker=fs.readFileSync('simulation/battle-worker.js','utf8');
const custom=fs.readFileSync('custom-battle.js','utf8');
assert(worker.includes('[36,37,38,39,40].includes(version)'));
assert(custom.includes('let rules=40;'));
assert(custom.includes('[36,37,38,39,40].includes(version)'));
assert(custom.includes('simulation/data-v${rules}.json?v=v40-1'));
assert(custom.includes('battle-worker.js?v=v40-1'));
assert(fs.readFileSync('matchups.js','utf8').includes('custom-battle.js?v=v40-anchor-1'));
for(const file of ['battle.html','matchups.html'])assert(fs.readFileSync(file,'utf8').includes('matchups.js?v=v40-anchor-1'));
assert(fs.readFileSync('builder.html','utf8').includes('team-code.js?v=kt1-v40-1'));
assert(fs.readFileSync('seals.html','utf8').includes('?v=v40-runtime-1'));
assert.equal(game.roster.length,127);
assert.equal(game.roster.filter(line=>line.anchorK).length,58);
assert.equal(game.adventureAnchors.length,19);
assert.equal(new Set(game.adventureAnchors.map(line=>line.branchOf)).size,17);
const line=id=>{const value=game.roster.find(entry=>entry.id===id);assert(value,'Missing v40 PvP line '+id);return value;};

// Official v40 combat-data deltas.
assert.deepEqual(game.traits.Poison.thresholds,[2,4,6]);
assert.deepEqual(game.traits.Poison.values,[50,120,170]);
assert.equal(line('machop').forms[2].skill.power,396);
assert.equal(line('paras').forms[2].skill.grow.atk,.09);
assert.equal(line('weedle-a1').forms[2].skill.spikes,20);
assert.equal(line('oddish-a1').anchorK[2].dmg,.95);
assert.deepEqual(nativeData.seals.tailwind.effects,[{k:'fx',req:'Flying',f:{type:'Flying'},fx:{k:'gust',n:2,air:1,v:1}}]);
assert.equal(nativeData.seals['hero-karp'].effects[0].back,true);

// Poison thresholds are represented by the same native team-trait counts at each boundary.
const poisonFamilies=[];
for(const candidate of game.roster.filter(entry=>entry.traits.includes('Poison')&&!entry.anchorK&&entry.branchOf==null)){
  if(!poisonFamilies.some(entry=>entry.id===candidate.id))poisonFamilies.push(candidate);
}
assert(poisonFamilies.length>=6,'Need six distinct native Poison lines for threshold checks');
for(const [name,engine]of [['native',native],['bundled',bundled]]){
  for(const count of [2,4,6]){
    const team=poisonFamilies.slice(0,count).map((entry,index)=>({line:entry.id,star:1,cell:28+index,items:[]}));
    const battle=new engine.Battle(team,[{line:'snorlax',star:1,cell:54,items:[]}],0x40,null);
    battle.start();
    assert.equal(battle.traits[0].get('Poison'),count,`${name} Poison ${count}-unit boundary`);
  }
}

// Exercise the production battle-core request path once to verify v40 manual forms survive
// validation, native execution and replay serialization. This is a maintenance fixture, not a study.
const coreResult=simulate(bundled,game,{rules:40,seed:0x40,runs:1,
  a:[{line:'charmander',star:1,cell:30,items:[],form:'phys'}],
  b:[{line:'snorlax',star:1,cell:54,items:[]}]});
assert.equal(coreResult.rules,40);
assert.equal(coreResult.identity,game.identity);
assert.equal(coreResult.replays.length,1);
assert.equal(coreResult.replays[0].units.find(unit=>unit.line==='charmander').form,'phys');

function inspectMew(engine,{ally,star=1,allyStar=1,form,allyCell=31,expectedKind,expectedPower,expectedMana,expectedMoveProperty}){
  const team=[{line:'mew',star,cell:30,items:[]},{line:ally,star:allyStar,cell:allyCell,items:[],...(form?{form}:{})}];
  const battle=new engine.Battle(team,[{line:'snorlax',star:1,cell:54,items:[]}],0x40,null);
  battle.start();
  const mew=battle.units.find(unit=>unit.line==='mew'),friend=battle.units.find(unit=>unit.line===ally),foe=battle.units.find(unit=>unit.team===1);
  assert(mew.metroCopy,`${engine===native?'native':'bundled'} Mew did not copy ${ally}`);
  assert.equal(mew.metroCopy.kind,expectedKind,'Mew copied move kind');
  if(expectedMana!==undefined)assert.equal(mew.maxMana,expectedMana,'Mew copied move mana');
  if(form)assert.equal(friend.flexForm,form,'The selected native flex form must reach combat');
  if(expectedMoveProperty)assert.equal(mew.metroCopy[expectedMoveProperty],true,'Mew must retain board-wide move behavior');
  const resolved=[];
  const originalResolve=battle.resolveMove.bind(battle);
  battle.resolveMove=(unit,move)=>{if(unit===mew)resolved.push(move);return originalResolve(unit,move);};
  mew.mana=mew.maxMana;
  battle.cast(mew,foe);
  assert(resolved.length,'Mew cast must resolve its copied move');
  assert(Math.abs(resolved[0].power-expectedPower)<1e-9,`Mew copied power ${resolved[0].power}, expected ${expectedPower}`);
  if(expectedMoveProperty)assert.equal(resolved[0][expectedMoveProperty],true,'Mew cast must preserve the copied global effect');
  return {kind:mew.metroCopy.kind,power:resolved[0].power,manualForm:friend.flexForm??null,global:!!resolved[0][expectedMoveProperty]};
}

// Mew now carries the adjacent Voltorb Charge at 85%, including its stored-charge behavior.
const chargeChecks=[];
for(const [name,engine]of [['native',native],['bundled',bundled]]){
  chargeChecks.push([name,inspectMew(engine,{ally:'voltorb',expectedKind:'nuke',expectedPower:153,expectedMana:50})]);
  inspectMew(engine,{ally:'zapdos',star:3,allyStar:3,expectedKind:'aoeTarget',expectedPower:93.5,expectedMoveProperty:'boltsAll'});
  inspectMew(engine,{ally:'charmander',form:'phys',expectedKind:'dash',expectedPower:102,expectedMana:35});
  inspectMew(engine,{ally:'charmander',form:'spec',expectedKind:'nuke',expectedPower:148.75,expectedMana:35});
}

const verification={passed:true,rules:40,identity:game.identity,pvpRoster:game.roster.length,pvpAnchors:58,
  adventureAnchors:game.adventureAnchors.length,changedData:{machamp396:true,parasectGrowth09:true,kakunaSpikes20:true,gloomMultiplier095:true,
    poisonBoundaries:[50,120,170],tailwindGust:true,stubbornFishBackAnchor:true},poisonCombatThresholds:[2,4,6],
  mewCharge85:chargeChecks,boardWideMewCopy:true,manualForms:['phys','spec'],battleCoreManualForm:true,
  runtimeWiring:true,legacy39ProvenancePreserved:true,browserUsed:false,studyRun:false,published:false};
fs.writeFileSync('work/engine-v40/runtime-verification.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify(verification));
