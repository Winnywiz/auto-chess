// Keep expected 5-2 scoring as the ranking objective. Duels are a separate comparison.
import fs from 'node:fs';
import {roster,family} from './combat.mjs';
const root='work/fiveTwo37/';
const original=JSON.parse(fs.readFileSync(root+'original/analysis.json'));
const beam=JSON.parse(fs.readFileSync(root+'beam/analysis.json'));
for(const a of [original,beam])if(a.comps.some(c=>c.variants.some(v=>!v.completeRealized)))throw Error('Complete-outcome evaluation required');
const target=root+'selected/';fs.mkdirSync(target,{recursive:true});
const by=new Map(original.comps.map(c=>[c.line+'|'+c.strat,{original:c}]));
for(const c of beam.comps){const key=c.line+'|'+c.strat;by.set(key,{...by.get(key),beam:c});}
const comps=[],decisions=[];
const maximum=c=>Math.max(...c.variants.map(v=>v.expected));
for(const [key,pair] of by){
 if(!pair.original&&pair.beam&&roster[pair.beam.line].anchorK){
  const baseline=original.comps.find(c=>c.line===family(pair.beam.line)&&c.strat===pair.beam.strat);
  if(baseline&&maximum(pair.beam)<=maximum(baseline)+.01){
   decisions.push({key,chosen:'original-family',originalLine:baseline.line,originalScore:maximum(baseline),beamScore:maximum(pair.beam)});continue;
  }
 }
 const winner=!pair.original?'beam':!pair.beam?'original':maximum(pair.beam)>maximum(pair.original)+.01?'beam':'original';
 const chosen=structuredClone(pair[winner]);
 for(const v of chosen.variants)v.algorithm=winner;
 comps.push(chosen);decisions.push({key,chosen:winner,originalScore:pair.original?maximum(pair.original):null,beamScore:pair.beam?maximum(pair.beam):null});
}
fs.writeFileSync(target+'analysis.json',JSON.stringify({...original,generated:new Date().toISOString(),comps,selection:'Choose beam only above original expected score by more than one point; new anchored carry/plan entries may be added. Head-to-head duel scores do not set tiers.'}));
const searches=['original','beam'].map(mode=>JSON.parse(fs.readFileSync(root+mode+'/search.json')));
fs.writeFileSync(target+'search.json',JSON.stringify({algorithm:'compared-original-and-beam',gauntlet:searches[0].gauntlet,results:searches.flatMap(s=>s.results)}));
fs.copyFileSync(root+'budget.json',target+'budget.json');fs.copyFileSync(root+'meta.json',target+'meta.json');
fs.writeFileSync(target+'selection.json',JSON.stringify({decisions},null,2));
console.log(JSON.stringify({selectedPlans:comps.length,original:decisions.filter(d=>d.chosen==='original').length,beam:decisions.filter(d=>d.chosen==='beam').length,newCarryPlans:decisions.filter(d=>d.originalScore===null).length}));
