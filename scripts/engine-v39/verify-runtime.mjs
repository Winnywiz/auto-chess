// Verify v39 PvP UI/runtime wiring, legacy compatibility and the Adventure boundary.
// This does not open a browser, search compositions or change rankings.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {simulate} from '../../simulation/battle-core.js';
import {anchorLegalAt,availableStars,distinctTraitCounts,initialStar,normalizeAnchoredUnit} from '../../custom-battle.js';
import * as native from '../../work/native-v39/headless.mjs';

const html=fs.readFileSync('builder.html','utf8');
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
for(const [index,script] of scripts.entries())new vm.Script(script,{filename:`builder inline script ${index+1}`});
assert(fs.readFileSync('matchups.js','utf8').includes("custom-battle.js?v=v39-anchor-1"));
for(const file of ['battle.html','matchups.html'])assert(fs.readFileSync(file,'utf8').includes('matchups.js?v=v39-anchor-1'));

const box={};box.window=box;box.globalThis=box;vm.createContext(box);
for(const prefix of ['window.KANTO_DATA=','window.KANTO_BIS='])vm.runInContext(scripts.find(script=>script.trim().startsWith(prefix)),box);
vm.runInContext(scripts.find(script=>script.includes('globalThis.TeamLogic =')),box);
assert.equal(box.KANTO_DATA.rules,39);assert.equal(box.KANTO_BIS.rules,39);
assert(!('economy' in box.KANTO_DATA),'Private research economy metadata must stay unpublished');
const game=JSON.parse(fs.readFileSync('simulation/data-v39.json','utf8'));
const nativeSource=JSON.parse(fs.readFileSync('work/native-v39/data.json','utf8'));
assert.equal(game.rules,39);
const builderBis=box.KANTO_BIS;
assert.equal(builderBis.rules,39);assert.equal(builderBis.scoreRules,38);assert.equal(builderBis.scoreBuild,'route-CQifoag8.js / roster-sccKldBx.js');
assert.equal(builderBis.itemFitRules,39);assert.equal(builderBis.itemFitBuild,nativeSource.build);
assert.equal(Object.keys(builderBis.states).length,0,'Pre-update BIS state was expected to be empty');
for(const nativeLine of nativeSource.roster){
  const builderLine=box.KANTO_DATA.roster.find(line=>line.id===nativeLine.id);
  assert(builderLine,nativeLine.id+' missing from the builder');
  assert.equal(JSON.stringify(builderLine.forms.map(form=>form.itemFit)),JSON.stringify(nativeLine.forms.map(form=>form.itemFit)),nativeLine.id+' native v39 item-fit metadata');
}

const payload={v:1,level:7,mode:'png',board:{0:{line:'pikachu',star:3,items:['choice-band'],form:'spec'}},bench:Array(9).fill(null)};
const clean=box.TeamLogic.clean(payload);
assert.equal(clean.board[0].form,'spec');
assert.equal(box.TeamLogic.skill(clean.board[0]).name,box.TeamLogic.lines.pikachu.flex.spec[2].name);
assert.throws(()=>box.TeamLogic.clean({...payload,board:{0:{...payload.board[0],form:'bad'}}}));
assert.deepEqual(Array.from(box.TeamLogic.anchorOptions('caterpie',1)),['caterpie','caterpie-a0']);
assert.deepEqual(Array.from(box.TeamLogic.anchorOptions('caterpie',2)),['caterpie','caterpie-a0','caterpie-a1']);
assert.deepEqual(Array.from(box.TeamLogic.anchorOptions('caterpie-a1',2)),['caterpie','caterpie-a0','caterpie-a1']);
assert.deepEqual(Array.from(box.TeamLogic.anchorOptions('vaporeon',2)),['vaporeon']);
assert.throws(()=>box.TeamLogic.setAnchor({line:'caterpie',star:1,items:[]},'caterpie-a1'));
const selectedAnchor={line:'poliwag',star:2,items:['choice-specs'],form:'spec'};
assert.equal(box.TeamLogic.setAnchor(selectedAnchor,'poliwag-a1'),selectedAnchor);
assert.equal(selectedAnchor.line,'poliwag-a1');assert.equal(selectedAnchor.form,'spec');
assert.deepEqual(selectedAnchor.items,['choice-specs']);
box.TeamLogic.setStar(selectedAnchor,1);assert.equal(selectedAnchor.line,'poliwag-a0');assert.equal(selectedAnchor.form,'spec');
box.TeamLogic.setStar(selectedAnchor,2);assert.equal(selectedAnchor.line,'poliwag-a0');
box.TeamLogic.setStar(selectedAnchor,3);assert.equal(selectedAnchor.line,'poliwag-a0');
const onlyA0={line:'diglett-a0',star:1,items:['choice-band']};
box.TeamLogic.setStar(onlyA0,2);assert.equal(onlyA0.line,'diglett-a0');
box.TeamLogic.setStar(onlyA0,3);assert.equal(onlyA0.line,'diglett-a0');
assert.deepEqual(onlyA0.items,['choice-band']);
const anchoredClean=box.TeamLogic.clean({...payload,board:{0:{line:'poliwag-a1',star:2,items:['choice-specs'],form:'spec'}}});
assert.equal(anchoredClean.board[0].line,'poliwag-a1');assert.equal(anchoredClean.board[0].form,'spec');
assert.deepEqual(Array.from(anchoredClean.board[0].items),['choice-specs']);
assert.throws(()=>box.TeamLogic.clean({...payload,board:{0:{line:'poliwag-a1',star:1,items:[]}}}));

const builderTraits=box.TeamLogic.traits({0:{line:'bulbasaur',star:3},1:{line:'bulbasaur-a1',star:2}});
assert.equal(builderTraits.find(trait=>trait.name==='Grass').count,1);
assert.equal(builderTraits.find(trait=>trait.name==='Poison').count,1);
assert.equal(box.TeamLogic.familyOf(box.TeamLogic.lines.vaporeon),'eevee');
const eeveeTraits=box.TeamLogic.traits({0:{line:'vaporeon',star:2},1:{line:'jolteon',star:2}});
assert.equal(eeveeTraits.find(trait=>trait.name==='Water').count,1);
assert.equal(eeveeTraits.find(trait=>trait.name==='Electric').count,0);

const pvpLines=new Map(game.roster.map(line=>[line.id,line]));
const adventureIds=new Set(game.adventureAnchors.map(line=>line.id));
assert.equal(adventureIds.size,19,'Expected the 19 native Adventure-only anchor forms');
assert.equal(new Set(game.adventureAnchors.map(line=>line.branchOf)).size,17,'Expected 17 Adventure-only families');
assert.equal(game.roster.length,box.KANTO_DATA.roster.length);
assert.equal(JSON.stringify(game.roster.map(line=>line.id)),JSON.stringify(box.KANTO_DATA.roster.map(line=>line.id)));
for(const line of game.roster)assert(!adventureIds.has(line.id),'Adventure-only ID in PvP roster: '+line.id);
for(const id of adventureIds){
  assert(!pvpLines.has(id),'Adventure-only ID in simulation roster: '+id);
  assert(!box.TeamLogic.lines[id],'Adventure-only ID in builder choices: '+id);
  assert(box.KANTO_DATA.adventureAnchors.some(line=>line.id===id),'Adventure metadata missing from builder data: '+id);
}

const anchors=game.roster.filter(line=>line.anchorK);
const kakuna=game.roster.find(line=>line.id==='weedle-a1');
assert(kakuna);assert.equal(kakuna.anchorK[2].hp,1.35);assert.equal(kakuna.forms[2].skill.spikes,28);
const parasect=game.roster.find(line=>line.id==='paras');
assert.equal(parasect.forms[2].skill.grow.atk,0.11);assert.equal(parasect.forms[2].skill.grow.sleep,1.5);
const metapod=game.roster.find(line=>line.id==='caterpie-a1');
assert.equal(metapod.forms[2].skill.mana,50);
for(const line of anchors){
  assert.deepEqual(line.forms.map(form=>form.star),[1,2,3],line.id);
  assert.deepEqual([1,2,3].map(star=>anchorLegalAt(line,star)),line.id.endsWith('-a0')?[true,true,true]:[false,true,true],line.id);
}
for(const line of anchors){
  assert.deepEqual(availableStars(line),line.id.endsWith('-a0')?[1,2,3]:[2,3],line.id);
}
const pvpAnchor=anchors.find(line=>line.id.endsWith('-a1')&&line.flex);
assert(pvpAnchor);assert.equal(initialStar(pvpAnchor),2);
const restored=normalizeAnchoredUnit({line:pvpAnchor.id,star:1,items:['choice-specs'],form:'spec'},pvpLines);
assert.equal(restored.line,pvpAnchor.id.replace(/-a1$/,'-a0'));
assert.equal(restored.form,'spec');assert.deepEqual(restored.items,['choice-specs']);
const preserved=normalizeAnchoredUnit({line:pvpAnchor.id,star:2,items:['choice-specs'],form:'spec'},pvpLines);
assert.equal(preserved.line,pvpAnchor.id);assert.equal(preserved.form,'spec');
const traitDedup=distinctTraitCounts([{line:'bulbasaur',star:3},{line:'bulbasaur-a1',star:2}],pvpLines);
assert.equal(traitDedup.Grass,1);assert.equal(traitDedup.Poison,1);

const manifest=JSON.parse(fs.readFileSync('browser-extension/manifest.json','utf8'));
assert.equal(manifest.version,'1.9.0');
const extensionContext=vm.createContext({});
for(const file of ['tooltip-data.js','viewer-data.js','replay-compat.js'])vm.runInContext(fs.readFileSync('browser-extension/'+file,'utf8'),extensionContext);
const tip=JSON.parse(JSON.stringify(extensionContext.KANTO_TIP_DATA));
const viewer=JSON.parse(JSON.stringify(extensionContext.KANTO_REPLAY_DATA));
assert.equal(tip.version,39);
for(const line of game.roster){
  assert.deepEqual(tip.units[line.id].forms,line.forms,line.id+' tooltip forms');
  assert.deepEqual(viewer.units[line.id].forms,line.forms.map(form=>({skill:form.skill.name,num:form.num,types:form.types,name:form.name})),line.id+' viewer forms');
}
for(const id of adventureIds){
  assert.equal(tip.units[id]?.pvpEligible,false,id+' tooltip eligibility');
  assert.equal(tip.units[id]?.mode,'adventure',id+' tooltip mode');
  assert.equal(viewer.units[id]?.pvpEligible,false,id+' replay eligibility');
  assert.equal(viewer.units[id]?.mode,'adventure',id+' replay mode');
}
const compat=extensionContext.KantoReplayCompat;
assert.equal(compat.hasUnsupportedUnits([{line:pvpAnchor.id}],tip.units),false);
const adventureId=adventureIds.values().next().value;
assert.equal(compat.hasUnsupportedUnits([{line:adventureId}],tip.units),true);
const viewerSource=fs.readFileSync('browser-extension/viewer.js','utf8');
assert(viewerSource.includes("link.textContent = 'PvP only'"));
assert(viewerSource.includes('Adventure-only units cannot be re-fought in the PvP simulator.'));
const refightSource=viewerSource.slice(viewerSource.indexOf('function refightBoards'),viewerSource.indexOf('function updateRefight'));
const refightContext=vm.createContext({
  KANTO_TIP_DATA:tip,KantoReplayCompat:compat,SIM_RULES:39,current:{id:'runtime-check'},
  URLSearchParams, btoa:value=>Buffer.from(value,'binary').toString('base64'),
});
vm.runInContext('var simCalls=0; function simTeam(units){simCalls++;return units;}',refightContext);
vm.runInContext(refightSource,refightContext);
const adventureBattle={myTeam:0,meta:[
  {line:adventureId,team:0,cell:30,star:2,items:[]},
  {line:game.roster[0].id,team:1,cell:25,star:2,items:[]},
]};
assert.match(refightContext.refightUnavailable({key:'adv'},adventureBattle),/Adventure-only/);
assert.equal(refightContext.refightRequest({key:'adv'},adventureBattle),null,'Adventure board must not create a partial PvP request');
assert.equal(refightContext.simCalls,0,'Unsupported board was partially simulated');

const effectivenessEngine=await import('../../simulation/engine-v39.js');
for(const name of ['Battle','translate','effectiveness','rules','identity'])assert(name in effectivenessEngine,'Missing engine export '+name);
assert.equal(effectivenessEngine.rules,39);assert.equal(effectivenessEngine.identity,game.identity);
for(const attack of Object.keys(game.typeChart))for(const defense of Object.keys(game.typeChart)){
  assert.equal(effectivenessEngine.effectiveness(attack,[defense]),game.typeChart[attack][defense],`${attack} → ${defense}`);
}
assert.equal(effectivenessEngine.effectiveness('Fire',['Grass','Water']),game.typeChart.Fire.Grass*game.typeChart.Fire.Water);
const result=simulate(effectivenessEngine,game,{rules:39,seed:1729,runs:1,
  a:[{line:game.roster[0].id,star:2,cell:52,items:[]}],
  b:[{line:'snorlax',star:2,cell:31,items:[]}]});
assert.equal(result.rules,39);
const familyBoard=[{line:'gastly',star:3,cell:31,items:[]},{line:'gastly-a1',star:2,cell:32,items:[]}];
const familyFoe=[{line:'snorlax',star:2,cell:45,items:[]}];
for(const [name,engine] of [['bundle',effectivenessEngine],['native',native]]){
  const battle=new engine.Battle(familyBoard,familyFoe,139,null);
  battle.start();
  assert.equal(battle.traits[0].get('Ghost'),1,name+' native family trait count');
  assert.equal(battle.traits[0].get('Poison'),1,name+' native family trait count');
  assert.equal(battle.traits[0].size,2,name+' unexpected duplicate family trait');
}
const readSeals=file=>{const context=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(file,'utf8'),context);return JSON.parse(JSON.stringify(context.window.KANTO_SEALS));};
const oldSeals=readSeals('work/backups/pre-v39-2026-10-27/seals-data.js');
const newSeals=readSeals('seals-data.js');
assert.equal(newSeals.version,39);assert.equal(oldSeals.version,38);
const {version:oldVersion,...oldSealData}=oldSeals;const {version:newVersion,...newSealData}=newSeals;
assert.equal(JSON.stringify(newSealData),JSON.stringify(oldSealData),'Seal definitions/recommendations unexpectedly changed');

const worker=fs.readFileSync('simulation/battle-worker.js','utf8');
const custom=fs.readFileSync('custom-battle.js','utf8');
assert(worker.includes('[36,37,38,39].includes(version)'));
assert(custom.includes('[36,37,38,39].includes(version)'));
assert(custom.includes('let rules=39;'));
assert(custom.includes('battle-worker.js?v=v39-1'),'Worker cache token must match v39');
const hash=value=>createHash('sha256').update(value).digest('hex');
for(const file of ['compositions.html','data/compositions-52.json']){
  assert.equal(hash(fs.readFileSync(file)),hash(await import('node:child_process').then(({execFileSync})=>execFileSync('git',['show','HEAD:'+file],{maxBuffer:16*1024*1024}))),file+' unexpectedly changed');
}

const verification={passed:true,rules:39,publicExports:['Battle','translate','effectiveness','rules','identity'],typePairs:Object.keys(game.typeChart).length**2,
  pvpAnchors:anchors.length,adventureOnlyAnchors:adventureIds.size,adventureFamilies:17,adventureReFightRejected:true,
  legacyVersions:[36,37,38],manualFormsPreserved:true,sealDefinitionsChanged:false,compositionFilesUnchanged:true,browserUsed:false,compositionSearchRun:false};
fs.writeFileSync('work/engine-v39/runtime-verification.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify(verification));
