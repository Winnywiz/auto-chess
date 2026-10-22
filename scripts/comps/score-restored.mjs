// Score the exact restored boards without changing units, stars, gear, positions or opponents.
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import assert from 'node:assert/strict';
import {readPage,readJSON,capItems,seedList,boardValue,traitCounts} from './common.mjs';
import {SCORE_SEEDS,tierOf} from './score.mjs';
import {scorePairs,nativeRoot} from './pool.mjs';
import {engineIdentity} from '../native/identity.mjs';
const {comps}=readPage(),context={window:{}};
vm.runInNewContext(fs.readFileSync('composition-guidance.js','utf8'),context);
const guide=context.window.KANTO_GUIDANCE,target='v34-search-2',row=comps.rows.find(r=>r.id===target);
const reference=readJSON('references.json');
const clean=team=>Array.from(team,u=>({line:u.line,star:u.star,items:Array.from(u.items),cell:u.cell}));
const boardKey=team=>JSON.stringify(clean(team));
const mean=a=>a.reduce((n,x)=>n+x,0)/a.length;
const pairs=[],index=[],boards={};
for(const level of [8,9]){
  const team=clean(guide.rows[target].stages.find(s=>s.level===level).team);
  assert.equal(team.length,level);assert.equal(team.reduce((n,u)=>n+u.items.length,0),6);
  assert(team.some(u=>u.line==='chansey'));assert(!team.some(u=>u.line==='onix'||u.line==='psyduck'));
  boards[level]=team;
  const peers=comps.rows.filter(r=>r.id!==target).map(r=>({id:r.id,group:r.family===row.family?'same-family':'cross-tag',family:r.family,team:capItems(r.boards.find(b=>b.level===level).team)}));
  const opponents=[...reference.references.filter(r=>r.level===level),...peers];
  for(const variant of ['chansey','golduck']){
    const a=team.map(u=>({...u,line:variant==='golduck'&&u.line==='chansey'?'psyduck':u.line}));
    for(const opponent of opponents){
      assert(opponent.team.reduce((n,u)=>n+u.items.length,0)<=6);
      pairs.push({a,b:opponent.team});index.push({level,variant,id:opponent.id,group:opponent.group,family:opponent.family});
    }
  }
}
const start=performance.now(),phases={};
for(const [phase,seeds]of [['comparison',SCORE_SEEDS],['confirmation',seedList(64,'restored-exeggutor-confirm-v1')]]){
  const scores=await scorePairs(pairs,seeds,{label:'restored '+phase}),rows=[];
  for(const level of [8,9])for(const variant of ['chansey','golduck']){
    const results=index.map((p,i)=>({...p,score:scores[i]})).filter(p=>p.level===level&&p.variant===variant);
    const groups=Object.fromEntries(['workbook','api'].map(g=>[g,mean(results.filter(p=>p.group===g).map(p=>p.score))]));
    const families={};for(const p of results.filter(p=>p.group==='cross-tag'))(families[p.family]??=[]).push(p.score);
    const familyScores=Object.fromEntries(Object.entries(families).map(([f,a])=>[f,mean(a)])),peerScore=mean(Object.values(familyScores));
    const n=results.filter(p=>['workbook','api'].includes(p.group)).length*seeds.length*2;
    const peerN=results.filter(p=>p.group==='cross-tag').length*seeds.length*2;
    const measured={level,variant,score:.25*groups.workbook+.25*groups.api+.5*peerScore,peerScore,referenceOnly:mean(Object.values(groups)),groups,families:familyScores,n,peerN,
      sameFamilyScore:mean(results.filter(p=>p.group==='same-family').map(p=>p.score)),sameFamilyN:results.filter(p=>p.group==='same-family').length*seeds.length*2,
      purchaseGold:boardValue(boards[level]),boardKey:boardKey(boards[level]),seeds:seeds.length,sides:2,
      opponents:results.filter(p=>['same-family','cross-tag'].includes(p.group)).map(p=>({id:p.id,family:p.family,score:p.score,battles:seeds.length*2})),results};
    measured.tier=tierOf(measured);rows.push(measured);
  }
  phases[phase]={seeds,rows,battles:pairs.length*seeds.length*2};
}
const {match,fight}=await import(new URL('headless.mjs',nativeRoot));
let repeats=0;
for(const level of [8,9])for(const group of ['workbook','cross-tag','same-family']){
  const i=index.findIndex(p=>p.level===level&&p.variant==='chansey'&&p.group===group),p=pairs[i],seeds=phases.confirmation.seeds;
  assert.equal(match(p.a,p.b,seeds),phases.confirmation.rows.find(r=>r.level===level&&r.variant==='chansey').results.find(r=>r.id===index[i].id&&r.group===group).score);repeats+=seeds.length*2;
  const summary=b=>({winner:b.winner,time:b.time,units:b.units.map(u=>({line:u.line,hp:u.hp,alive:u.alive,dealt:u.dealt,healed:u.healed}))});
  const away=p.b.map(u=>({...u,cell:55-u.cell}));assert.deepEqual(summary(fight(p.a,away,seeds[0])),summary(fight(p.a,away,seeds[0])));repeats+=2;
}
const result={id:target,generated:new Date().toISOString(),rules:34,engineIdentity:engineIdentity(nativeRoot),guidanceSourceHash:guide.sourceHash,
  runtime:process.version,cpu:os.cpus()[0].model,workers:Number(process.env.KANTO_WORKERS)||os.availableParallelism(),
  method:'Exact restored formations, six finished items, neutral weather, no Seals or economy. 25% workbook v34, 25% frozen official API rules 33, 50% cross-tag with 12 opposing families weighted equally. Other Psychic boards tested separately and excluded from the composite. Twelve original comparison seeds followed by 64 fresh confirmation seeds, both sides. Published scores use confirmation only. Golduck control changes only the healer slot.',
  apiRules:reference.apiRules,apiGenerated:reference.apiGenerated,boards,traits:Object.fromEntries(Object.entries(boards).map(([l,t])=>[l,traitCounts(t)])),phases,
  battles:Object.values(phases).reduce((n,p)=>n+p.battles,0),deterministicRepeatBattles:repeats,deterministic:true,seconds:(performance.now()-start)/1000};
fs.writeFileSync('work/comps-v34/restored-score.json',JSON.stringify(result,null,2));
const out='../../outputs/restored-exeggutor-score';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/results.json',JSON.stringify(result,null,2));
const pct=x=>(x*100).toFixed(1)+'%';
const table=phases.confirmation.rows.map(r=>`| ${r.level} | ${r.variant} | ${r.tier} | ${pct(r.score)} | ${pct(r.peerScore)} | ${pct(r.groups.workbook)} | ${pct(r.groups.api)} | ${pct(r.sameFamilyScore)} |`);
const report=['# Restored Exeggutor board scores','',result.method,'','| Level | Healer | Tier | Combat | Cross-tag | Workbook | API | Other Psychic |','|---|---|---|---|---|---|---|---|',...table,'',
  `Scored battles: ${result.battles.toLocaleString('en-US')}. Additional verification battles: ${repeats}. Runtime: ${result.runtime}. CPU: ${result.cpu}. Workers: ${result.workers}. Elapsed: ${result.seconds.toFixed(2)} seconds.`,
  '','Level 8 is the linked board at its exact stars, including Exeggutor 2★ and Mewtwo 1★. Level 9 is the restored original cap at its displayed stars, including the listed three-star upgrades. These are combat scores for different exact boards, not ranked win rates or acquisition odds.',
  '','Reproduce: `node scripts/comps/score-restored.mjs`. Fixed seeds, opponent results, exact boards and engine fingerprint are stored in results.json. The historical API set is rules 33; all battles execute the pinned v34 engine. No board or equipment search was performed.'].join('\n');
fs.writeFileSync(out+'/report.md',report+'\n');
console.log(JSON.stringify({battles:result.battles,deterministicRepeatBattles:repeats,seconds:result.seconds,confirmation:phases.confirmation.rows.map(({level,variant,tier,score,peerScore,groups,sameFamilyScore,n,peerN})=>({level,variant,tier,score,peerScore,groups,sameFamilyScore,n,peerN}))},null,2));
