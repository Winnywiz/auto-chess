// A controlled form-only comparison supplements the joint board/item search.
import fs from 'node:fs';
import {roster,family,startPool,clean} from './combat.mjs';
import {STRATEGIES,buildCandidates,equip,carryList,score} from './search.mjs';
import {minimumFormStar} from './forms.mjs';
const anchors=Object.values(roster).filter(r=>r.anchorK),contexts=[],unavailable=[];
for(const anchor of anchors){
 const base=family(anchor.id),support=anchor.cost===4&&anchor.role==='support';
 if(support&&minimumFormStar(anchor.id)>1){unavailable.push({base,anchor:anchor.id,anchorName:anchor.forms.at(-1).name,available:false,reason:'This intermediate support form needs two stars. The finishing rules allow a four-cost support at one star.'});continue;}
 const strat=anchor.cost===1?'r1':anchor.cost===2?'r2':anchor.cost===3?'r3':'f8';
 const carry=support?carryList().find(c=>c.strat==='f8'&&family(c.line)!==base).line:base;
 const S=STRATEGIES[strat],candidates=buildCandidates(carry,S,S.finalLevel,10);
 let c=candidates.find(c=>c.team.some(u=>family(u.line)===base))??candidates[0];c=structuredClone(c);
 if(support&&!c.team.some(u=>family(u.line)===base)){
  const {tank}=equip(c,carry);const at=c.team.findLastIndex(u=>u.line!==carry&&u.line!==tank);c.team[at]={line:base,star:1};
 }
 const normal=equip(c,carry).team;
 const held=normal.find(u=>family(u.line)===base);if(!held)throw Error('Missing base family');
 const anchored=normal.map(u=>u===held?{...u,line:anchor.id}:u);
 contexts.push({base,anchor:anchor.id,strat,slot:support?'Support':'Carry',star:held.star,normal,anchored});
}
startPool();
const boards=contexts.flatMap(c=>[c.normal,c.anchored]);
const initial=await score(boards,{nSeeds:8,salt:'anchor-form-control-v37',s3:true});
const promising=contexts.map((c,i)=>({c,i})).filter(({i})=>Math.abs(initial[i*2+1].score-initial[i*2].score)>.01);
const confirm=promising.length?await score(promising.flatMap(({c})=>[c.normal,c.anchored]),{nSeeds:32,salt:'anchor-form-confirm-v37',s3:true}):[];
const results=contexts.map((c,i)=>{
 const at=promising.findIndex(p=>p.i===i),a=at>=0?confirm[at*2]:initial[i*2],b=at>=0?confirm[at*2+1]:initial[i*2+1];
 return{base:c.base,anchor:c.anchor,baseName:roster[c.base].forms[c.star-1].name,anchorName:roster[c.anchor].forms[c.star-1].name,slot:c.slot,star:c.star,seeds:at>=0?32:8,baseScore:a.score,anchorScore:b.score,gain:b.score-a.score,baseTeam:clean(c.normal),anchorTeam:clean(c.anchored)};
}).concat(unavailable).sort((a,b)=>(b.gain??-Infinity)-(a.gain??-Infinity));
fs.writeFileSync('work/fiveTwo37/anchor-audit-public.json',JSON.stringify({rules:37,method:'Native form substitutions at the same stars, items and positions, against the same ranked lobby. Both sides per seed. These controlled contexts are diagnostic; joint search and complete realized outcomes decide published plans.',results}));
console.log(JSON.stringify({forms:results.length,improvementsAboveOnePoint:results.filter(r=>r.gain>.01).length}));process.exit(0);
