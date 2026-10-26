// Actual original-versus-beam fights. Raw realization frequencies remain private.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {roster,family,seeds,scoreMany,startPool} from './combat.mjs';
import {realizedBoards} from './realized.mjs';
import {hashSeed,rng} from './rules.mjs';
import {repairAlternatives} from './alternatives.mjs';
import {calibrate} from './calibrate-realized.mjs';

const root='work/fiveTwo37/',N=32;
const read=p=>JSON.parse(fs.readFileSync(p));
for(const mode of ['original','beam'])await calibrate(root+mode+'/analysis.json',{affectedOnly:true});
for(const mode of ['original','beam'])console.log(mode,'alternative sets repaired',await repairAlternatives(root+mode+'/analysis.json'));
const original=read(root+'original/analysis.json'),beam=read(root+'beam/analysis.json');
for(const a of [original,beam])if(a.comps.some(c=>c.variants.some(v=>!v.completeRealized)))throw Error('Calibrate complete realized outcomes before comparison');
const clean=t=>t.map(({line,star,cell,items})=>({line,star,cell,items:[...items]}));
function candidates(analysis){
 const all=[];
 for(const c of analysis.comps){
  const variants=[...c.variants].sort((a,b)=>b.expected-a.expected),seen=new Set();
  for(const v of variants){
   if(v.src?.startsWith('tkt:'))continue;
   const key=v.team.map(u=>u.line+u.star).sort().join();if(seen.has(key))continue;seen.add(key);
   all.push({id:c.line+'|'+c.strat+'|'+seen.size,line:c.line,strat:c.strat,family:family(c.line),name:roster[c.line].forms.at(-1).name,expected:v.expected,team:clean(v.team),variant:v});
   if(seen.size===3)break;
  }
 }
 // Equal maximum representation per carry, including strategies.
 const count=new Map();return all.sort((a,b)=>b.expected-a.expected).filter(c=>{const n=count.get(c.line)??0;count.set(c.line,n+1);return n<4;});
}
function outcomes(c){
 const plan=c.variant.realizedPlan;if(!plan)throw Error('Missing recorded realization plan: '+c.id);
 return realizedBoards(c.team,plan,{n:200,salt:'real-confirm-v37|'+c.family+'|'+c.strat}).patterns;
}
function draw(patterns,u){let n=u*200;for(const p of patterns){n-=p.n;if(n<0)return p.team;}return patterns.at(-1).team;}
const A=candidates(original),B=candidates(beam),AR=A.map(outcomes),BR=B.map(outcomes);
const seedList=seeds(N,'original-vs-beam-v37-independent-confirmation');
const checkpoint=root+'comparison-private.json';
const inputHash=createHash('sha256').update(JSON.stringify([original,beam])).digest('hex');
const report=process.env.RESUME&&fs.existsSync(checkpoint)?read(checkpoint):{generated:new Date().toISOString(),inputHash,seeds:seedList,original:A.map(({variant,...c})=>c),beam:B.map(({variant,...c})=>c),pairs:[]};
if(report.inputHash!==inputHash)throw Error('Comparison inputs changed; preserve the old comparison before starting another');
startPool();
for(let i=0;i<A.length;i++){
 const pending=B.map((b,j)=>({b,j})).filter(({b})=>!report.pairs.some(p=>p.original===A[i].id&&p.beam===b.id));
 if(!pending.length)continue;
 const pairs=[];
 for(const {j} of pending)for(let k=0;k<N;k++){
  pairs.push({a:A[i].team,b:B[j].team,seeds:[seedList[k]]});
  // Independent uniforms preserve the product distribution for an actual duel.
  // Reuse each pair of uniforms across candidates to reduce comparison noise.
  const random=rng(hashSeed('compare-realizations|'+k)),uA=random(),uB=random();
  pairs.push({a:draw(AR[i],uA),b:draw(BR[j],uB),seeds:[seedList[k]]});
 }
 const results=await scoreMany(pairs,32);let at=0;
 for(const {j} of pending){const full=[],realized=[];for(let k=0;k<N;k++){full.push(1-results[at++]);realized.push(1-results[at++]);}report.pairs.push({original:A[i].id,beam:B[j].id,full,realized});}
 fs.writeFileSync(checkpoint,JSON.stringify(report));console.log(new Date().toISOString(),'compared',i+1,'of',A.length,'original builds against',B.length,'beam builds');
}
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function summary(pairs){
 if(!pairs.length)return null;
 const perSeed=Array.from({length:N},(_,k)=>mean(pairs.map(p=>p.realized[k]))),fullPerSeed=Array.from({length:N},(_,k)=>mean(pairs.map(p=>p.full[k])));
 const random=rng(918273),boot=[];for(let t=0;t<2000;t++){let sum=0;for(let k=0;k<N;k++)sum+=perSeed[Math.floor(random()*N)];boot.push(sum/N);}boot.sort((a,b)=>a-b);
 return{pairs:pairs.length,beamFullBoardScore:mean(fullPerSeed),beamRealizedScore:mean(perSeed),seedClusterInterval:[boot[49],boot[1949]]};
}
const byStrategy={};for(const strategy of ['r1','r12','r12s','r2','r3','f8'])byStrategy[strategy]=summary(report.pairs.filter(p=>A.find(c=>c.id===p.original).strat===strategy&&B.find(c=>c.id===p.beam).strat===strategy));
const matched=report.pairs.filter(p=>{const a=A.find(c=>c.id===p.original),b=B.find(c=>c.id===p.beam);return a.family===b.family&&a.strat===b.strat;});
const publicReport={rules:37,generated:report.generated,engine:read('work/engine-v37/provenance.json').identity,metaSHA256:createHash('sha256').update(fs.readFileSync(root+'meta.json')).digest('hex'),method:'32 shared seeds, each played from both sides. Each original build fights every beam build. Realized fights sample the complete simulated board distributions. Scores are combat points for the beam search; draws count half. Intervals resample whole seed blocks and describe combat/realization sampling uncertainty, not search uncertainty. Portfolio composition can affect the all-build result.',originalBuilds:A.length,beamBuilds:B.length,builds:{original:A.map(({variant,...c})=>c),beam:B.map(({variant,...c})=>c)},allBuilds:summary(report.pairs),matchedCarryAndPlan:summary(matched),equalStrategyRealizedScore:mean(Object.values(byStrategy).filter(Boolean).map(s=>s.beamRealizedScore)),byStrategy,matchups:report.pairs.map(p=>({original:p.original,beam:p.beam,beamFullBoardScore:mean(p.full),beamRealizedScore:mean(p.realized)}))};
fs.writeFileSync(root+'comparison-public.json',JSON.stringify(publicReport));
console.log(JSON.stringify({comparison:publicReport.allBuilds,matched:publicReport.matchedCarryAndPlan,totalFights:report.pairs.length*N*4}));process.exit(0);
