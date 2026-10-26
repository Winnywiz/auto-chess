import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {scoreMany,startPool} from './combat.mjs';
import {legalForm} from './forms.mjs';
const root='work/fiveTwo37/';
const report=JSON.parse(fs.readFileSync(root+'comparison-public.json'));
const raw=JSON.parse(fs.readFileSync(root+'comparison-private.json'));
assert.equal(report.rules,37);assert.equal(raw.seeds.length,32);
assert.equal(report.matchups.length,report.originalBuilds*report.beamBuilds);
assert.equal(report.metaSHA256,createHash('sha256').update(fs.readFileSync(root+'meta.json')).digest('hex'));
const forbidden=/"(gold|goldLeft|rollGold|rolls|unitGold|xpGold|spentUnits|spentRolls|spentXp|core|pHit|hit|acq|acquisition|policy|medianDone|hitAll|covered|strongShare|value)"\s*:/;
assert(!forbidden.test(JSON.stringify(report)),'Private economy fields in comparison');
for(const builds of Object.values(report.builds))for(const c of builds){assert.equal(c.team.reduce((n,u)=>n+u.items.length,0),7);assert(c.team.every(u=>legalForm(u.line,u.star)));}
const mean=values=>values.reduce((a,b)=>a+b,0)/values.length;
for(let i=0;i<report.matchups.length;i++){
 const pair=report.matchups[i],source=raw.pairs[i];
 assert.equal(pair.original,source.original);assert.equal(pair.beam,source.beam);
 assert.equal(pair.beamFullBoardScore,mean(source.full));assert.equal(pair.beamRealizedScore,mean(source.realized));
 assert.equal(source.full.length,32);assert.equal(source.realized.length,32);
 assert([...source.full,...source.realized].every(x=>[0,.25,.5,.75,1].includes(x)));
}
let replayed=0;
for(const i of [0,Math.floor(report.matchups.length/2),report.matchups.length-1]){
 const pair=report.matchups[i],a=report.builds.original.find(b=>b.id===pair.original),b=report.builds.beam.find(b=>b.id===pair.beam);
 const result=(await scoreMany([{a:a.team,b:b.team,seeds:raw.seeds}]))[0];assert.equal(1-result,pair.beamFullBoardScore);replayed++;
}
console.log(JSON.stringify({passed:true,pairs:report.matchups.length,exactFullBoardReplays:replayed,privateFieldsAbsent:true}));startPool().close();
