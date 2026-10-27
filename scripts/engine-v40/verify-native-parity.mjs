// Compare native and standalone bundle traces for every legal PvP line/star/ability form.
// This is an engine maintenance matrix against one fixed opponent and seed, not a study.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as native from '../../work/native-v40/headless.mjs';
import * as bundled from '../../simulation/engine-v40.js';
import {simulate} from '../../simulation/battle-core.js';

const data=JSON.parse(fs.readFileSync('simulation/data-v40.json','utf8'));
const nativeEngine={
  Battle:native.Battle,
  translate:(value,language)=>native.roster.x(value,language)??value,
  rules:40,
  identity:data.identity,
};
const variants=[];
for(const line of data.roster){
  if(line.pvpEligible===false||line.mode==='adventure')continue;
  const minStar=line.id.endsWith('-a1')||line.branchOf==='eevee'?2:1;
  for(let star=minStar;star<=3;star++){
    variants.push({line:line.id,star,form:null});
    if(line.flex?.stars?.includes(star))for(const form of ['phys','spec'])variants.push({line:line.id,star,form});
  }
}
assert(variants.length>=350,'Expected a broad native PvP line/star/form matrix.');

const opponent=[
  {line:'snorlax',star:2,cell:45,items:[]},
  {line:'pikachu',star:2,cell:48,items:[]},
];
const requestFor=variant=>({rules:40,seed:0x40,runs:1,
  a:[{line:variant.line,star:variant.star,cell:30,items:[],...(variant.form?{form:variant.form}:{})}],
  b:opponent,
});
const trace=(engine,variant)=>{
  const result=simulate(engine,data,requestFor(variant),()=>{});
  return {rules:result.rules,identity:result.identity,wins:result.wins,losses:result.losses,draws:result.draws,
    score:result.score,replays:result.replays};
};

for(const [index,variant]of variants.entries()){
  const nativeTrace=trace(nativeEngine,variant);
  const bundleTrace=trace(bundled,variant);
  assert.equal(JSON.stringify(bundleTrace),JSON.stringify(nativeTrace),
    `Native/bundle parity failed for ${variant.line} ${variant.star}★ ${variant.form??'auto'}`);
  if((index+1)%100===0)console.log(`Verified ${index+1}/${variants.length} legal PvP line/star/form cases`);
}

const verification={passed:true,rules:40,identity:data.identity,variants:variants.length,
  referenceBoard:opponent.map(({line,star,cell})=>({line,star,cell})),seed:0x40,
  includesEveryPvpRosterLine:true,includesEveryLegalAnchorStar:true,includesAutomaticAndManualFlexForms:true,
  traceParity:'exact battle-core replay trace',browserOpened:false,studyRun:false,published:false};
fs.writeFileSync('work/engine-v40/native-parity-verification.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify(verification));
