// Beam search, successive halving and realized-board selection. No prescribed item sets.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {OUT} from './paths.mjs';
import {roster,family,arrange,traitLabel,boardValue,startPool} from './combat.mjs';
import {STRATEGIES,carryList,buildCandidates,equip,score,roles,gear,placeHint,isFront,cost,SHOP,cooccur,heuristic,starFor,maxCost,combos,ATK_POOL,SPA_POOL,FLEX,spa,canCrit,TANK_SETS,defaultSecond,G,legalFinish,normalizeStars} from './search.mjs';
import {planFor} from './plans.mjs';
import {realizedScore} from './realized.mjs';
import {legalForm} from './forms.mjs';

const log=(...x)=>console.log(new Date().toISOString(),...x);
const signature=c=>c.team.map(u=>u.line+':'+u.star+':'+(u.cell??'')+':'+[...(u.items??[])].sort().join('+')).sort().join('|');
const unique=cs=>[...new Map(cs.map(c=>[signature(c),c])).values()];
const fronts=(team,line)=>team.some(u=>u.line!==line&&isFront(u.line));
const anchors=Object.values(roster).filter(r=>r.anchorK);
const budget=JSON.parse(fs.readFileSync(new URL('budget.json',OUT)));
const keepPer={r1:8,r12:8,r12s:12,r2:9,r3:6,f8:8};
const audit={algorithm:'beam-successive-halving-realized',beam:4,rounds:2,anchorForms:anchors.map(r=>r.id),halving:[],changes:[]};

// Every surviving candidate is re-evaluated with the same complete seed prefix.
async function halve(cs,line,salt,{keep=4,stages=[1,2,4],equipped=false}={}){
 let pool=unique(cs).filter(c=>(equipped?c.team:equip(c,line).team).every(u=>legalForm(u.line,u.star)));
 for(let round=0;round<stages.length;round++){
  const results=await score(pool.map(c=>equipped?c.team:equip(c,line).team),{nSeeds:stages[round],salt,s3:true});
  pool=pool.map((c,i)=>({...c,...results[i]})).sort((a,b)=>b.score-a.score);
  const n=round===stages.length-1?keep:Math.max(keep,Math.ceil(pool.length/2));
  audit.halving.push({salt,seeds:stages[round],tested:pool.length,kept:Math.min(n,pool.length)});
  pool=pool.slice(0,n);
 }
 return pool;
}
function neighbours(c,line,S){
 const co=cooccur(family(line)),eligible=SHOP.filter(l=>legalFinish(l)&&cost(l)<=maxCost(S,S.finalLevel)&&family(l)!==family(line));
 const remap=(team,src)=>({...c,team,extras:c.extras.map(x=>{const old=c.team.findIndex(u=>u.line===x);return team[old]?.line;}).filter(Boolean),src:c.src+'+'+src});
 const ordinary=[],forms=[],pairs=[];
 for(let i=0;i<c.team.length;i++){
  const old=c.team[i];if(old.line===line)continue;
  // All native anchored alternatives in this slot are fought, not heuristic-pruned.
  const options=Object.values(roster).filter(r=>(r.anchorK||!r.branchOf)&&family(r.id)===family(old.line)&&r.id!==old.line);
  for(const r of options){const team=c.team.map((u,k)=>k===i?{...u,line:r.id}:u);if(fronts(team,line))forms.push(remap(team,'form'));}
  if(c.extras.includes(old.line))continue;
  for(const l of eligible){
   if(c.team.some((u,k)=>k!==i&&family(u.line)===family(l)))continue;
   const team=c.team.map((u,k)=>k===i?{line:l,star:starFor(l,S,{carry:line,extras:c.extras})}:u);
   if(fronts(team,line))ordinary.push(remap(team,'swap'));
  }
 }
 ordinary.sort((a,b)=>heuristic(b.team,co,line)-heuristic(a.team,co,line));
 // Two-unit changes can cross a trait breakpoint that single changes cannot reach.
 const slots=c.team.map((u,i)=>i).filter(i=>c.team[i].line!==line&&!c.extras.includes(c.team[i].line));
 for(let a=0;a<slots.length;a++)for(let b=a+1;b<slots.length;b++){
  const i=slots[a],j=slots[b],remaining=c.team.filter((_,k)=>k!==i&&k!==j);
  const choices=eligible.filter(l=>!remaining.some(u=>family(u.line)===family(l))).map(l=>({l,h:heuristic([...remaining,{line:l,star:2}],co,line)})).sort((x,y)=>y.h-x.h).slice(0,8);
  for(let x=0;x<choices.length;x++)for(let y=x+1;y<choices.length;y++){
   const ls=[choices[x].l,choices[y].l];
   const team=c.team.map((u,k)=>k===i||k===j?{line:ls[k===i?0:1],star:starFor(ls[k===i?0:1],S,{carry:line,extras:c.extras})}:u);
   if(fronts(team,line))pairs.push(remap(team,'pair'));
  }
 }
 pairs.sort((a,b)=>heuristic(b.team,co,line)-heuristic(a.team,co,line));
 return [...forms,...ordinary.slice(0,24),...pairs.slice(0,12)];
}
async function realizedRank(cs,line,strat,salt,{keep=4,nSeeds=2}={}){
 const out=[];
 for(const c of cs){
  const team=c.team[0]?.items?c.team:equip(c,line).team;
  const real=await realizedScore(team,planFor(strat,team,line,c.extras),score,{n:200,max:8,nSeeds,salt});
  out.push({...c,team,selectionExpected:real.expected,selectionRealized:real});
 }
 return out.sort((a,b)=>b.selectionExpected-a.selectionExpected).slice(0,keep);
}
async function items(c,line,strat,known){
 c={...c,team:normalizeStars(c.team,line,roles(c.team,line).tank)};
 const base=equip(c,line),pool=[...new Set((FLEX.has(family(line))?[ATK_POOL,SPA_POOL]:[spa(line)?SPA_POOL:ATK_POOL]).flat())].filter(i=>i!=='scope-lens'||canCrit(line)||!spa(line));
 const sets=known?[...new Map([known.items.carry,...known.items.rankedCarry.map(x=>x.items),...(known.items.alt?[known.items.alt]:[])].map(s=>[[...s].sort().join(),s])).values()]:combos(pool,3).filter(s=>s.filter(i=>i==='focus-sash').length<=1);
 const withGear=(carry,tank,second)=>arrange(gear(c.team,line,base.tank,base.second,carry,tank,second),{carry:line,hint:placeHint});
 let ranked=await halve(sets.map(set=>({...c,team:withGear(set,TANK_SETS[0],defaultSecond(base.second)),set})),line,'beam-items|'+line+'|'+strat,{keep:6,stages:[1,2,4],equipped:true});
 const tankCandidates=ranked.slice(0,2).flatMap(r=>TANK_SETS.map(set=>({...r,tankSet:set,team:withGear(r.set,set,defaultSecond(base.second))})));
 const tanks=await halve(tankCandidates,line,'beam-tanks|'+line+'|'+strat,{keep:3,stages:[2,4],equipped:true});
 const secondary=[...new Set([defaultSecond(base.second),'quick-claw','scope-lens','life-orb','shell-bell','choice-scarf','twisted-spoon','expert-belt'])];
 const finals=await halve(tanks.flatMap(t=>secondary.map(second=>({...t,secondItem:second,team:withGear(t.set,t.tankSet,second)}))),line,'beam-secondary|'+line+'|'+strat,{keep:3,stages:[2,4],equipped:true});
 const realistic=await realizedRank(finals,line,strat,'beam-item-real|'+family(line)+'|'+strat,{keep:1,nSeeds:3});
 const best=realistic[0],differs=(a,b)=>{const copy=[...a];let common=0;for(const i of b){const at=copy.indexOf(i);if(at>=0){common++;copy.splice(at,1);}}return 3-common;};
 const alternate=ranked.find(x=>differs(x.set,best.set)>=2);
 return {...best,items:{tank:base.tank,second:base.second,carry:best.set,tankItems:best.tankSet,secondItem:best.secondItem,alt:alternate?.set??null,rankedCarry:[{items:best.set,score:best.score},...ranked.filter(r=>r.set.join()!==best.set.join()).map(r=>({items:r.set,score:r.score}))],rankedTank:tanks.map(t=>({items:t.tankSet,score:t.score})),rankedSecond:finals.map(t=>({item:t.secondItem,score:t.score}))}};
}
async function positioning(c,line,strat){
 const candidates=[c];
 for(const holder of [line,c.items.tank]){
  const unit=c.team.find(u=>u.line===holder),cells=roster[holder].range<=1?[29,30,31,32,33,36,37,38,39]:[43,44,45,46,47,50,51,52,53,54];
  for(const cell of cells){if(cell===unit.cell)continue;const other=c.team.find(u=>u.cell===cell);const team=c.team.map(u=>u.line===holder?{...u,cell}:u===other?{...u,cell:unit.cell}:u);candidates.push({...c,team});}
 }
 const res=await score(candidates.map(x=>x.team),{nSeeds:4,salt:'beam-position|'+family(line)+'|'+strat,s3:true});
 const base=res[0].score;const choices=candidates.map((x,i)=>({...x,positionScore:res[i].score})).filter((x,i)=>i===0||x.positionScore>base+.01).sort((a,b)=>b.positionScore-a.positionScore).slice(0,3);
 const ranked=await realizedRank(choices,line,strat,'beam-position-real|'+family(line)+'|'+strat,{keep:3,nSeeds:3});
 const incumbent=ranked.find(x=>signature(x)===signature(c))??(await realizedRank([c],line,strat,'beam-position-real|'+family(line)+'|'+strat,{nSeeds:3}))[0];
 return ranked[0].selectionExpected>incumbent.selectionExpected+.01?ranked[0]:incumbent;
}
async function main(){
 startPool();
 const file=new URL('search.json',OUT),screenFile=new URL('screen.json',OUT);
 const output=process.env.RESUME&&fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{algorithm:audit.algorithm,gauntlet:G.map(x=>({id:x.comp.id,tier:x.comp.tier,n:x.comp.n,avg:x.comp.avg,weight:x.weight,s4:x.s4,s3:x.s3})),results:[]};
 const screened=process.env.RESUME&&fs.existsSync(screenFile)?JSON.parse(fs.readFileSync(screenFile)):[];
 const carries=[...carryList()];
 for(const r of anchors){const keys=r.cost===1?['r1','r12','r12s']:r.cost===2?['r2','r12','r12s']:r.cost===3?['r3']:r.cost===4&&r.role!=='support'?['f8']:[];for(const strat of keys)carries.push({line:r.id,strat});}
 const only=process.env.ONLY?.split(','),strats=process.env.STRATS?.split(',');
 for(const {line,strat} of carries.filter(c=>(!only||only.includes(c.line))&&(!strats||strats.includes(c.strat)))){
  if(screened.some(r=>r.line===line&&r.strat===strat))continue;
  const S=STRATEGIES[strat],cs=buildCandidates(line,S,S.finalLevel,10);
  if(!cs.length)continue;
  const top=await halve(cs,line,'beam-screen|'+family(line)+'|'+strat,{keep:1,stages:[1]});
  screened.push({line,strat,best:top[0].score,candidate:top[0]});
  fs.writeFileSync(screenFile,JSON.stringify(screened));log('screen',line,strat,top[0].score.toFixed(3));
 }
 // Full-board screen only narrows the field. Realized scoring decides the deep-search shortlist.
 const shortlistFile=new URL('shortlist.json',OUT);
 let keep=process.env.RESUME&&fs.existsSync(shortlistFile)?JSON.parse(fs.readFileSync(shortlistFile)):[];
 if(!keep.length){
  for(const strat of Object.keys(STRATEGIES)){
   const top=screened.filter(r=>r.strat===strat).sort((a,b)=>b.best-a.best).slice(0,keepPer[strat]*2),rank=[];
   for(const entry of top){const real=(await realizedRank([entry.candidate],entry.line,strat,'beam-screen-real|'+strat,{keep:1,nSeeds:2}))[0];rank.push({...entry,expected:real.selectionExpected});}
   keep.push(...rank.sort((a,b)=>b.expected-a.expected).slice(0,keepPer[strat]));
  }
  fs.writeFileSync(shortlistFile,JSON.stringify(keep));
 }
 // Previously completed full-board fights remain useful after realization corrections.
 const keepKeys=new Set(keep.map(c=>c.line+'|'+c.strat));
 output.results=output.results.filter(c=>keepKeys.has(c.line+'|'+c.strat));
 fs.writeFileSync(file,JSON.stringify(output));
 for(const {line,strat} of keep){
  const previous=output.results.find(r=>r.line===line&&r.strat===strat);
  if(previous?.realizationVersion===2)continue;
  log('deep-start',line,strat);
  const S=STRATEGIES[strat],cs=buildCandidates(line,S,S.finalLevel,40),notes=[];
  let beam=await halve(cs,line,'beam-start|'+family(line)+'|'+strat,{keep:4,stages:[1,2,4]});
  for(let round=0;round<2;round++){
   const choices=unique([...beam,...beam.flatMap(c=>neighbours(c,line,S))]);
   const salt='beam-round|'+family(line)+'|'+strat+'|'+round;
   const selected=await halve(choices,line,salt,{keep:8,stages:[1,2,4]});
   // Re-score incumbents on the same basis before replacing any board.
   const base=await score(beam.map(c=>equip(c,line).team),{nSeeds:4,salt,s3:true});
   const best=base.reduce((m,x)=>Math.max(m,x.score),-1);
   const improved=selected.filter(c=>c.score>best+.01);
   const incumbent=beam.map((c,i)=>({...c,...base[i]}));
   beam=unique([...improved,...incumbent]).sort((a,b)=>b.score-a.score).slice(0,4);
   log('beam-round',line,strat,round+1,choices.length,'candidates');
   notes.push(`beam round ${round+1}: ${choices.length} legal candidates, ${improved.length} improvements above one point`);
  }
  const realistic=await realizedRank(beam,line,strat,'beam-board-real|'+family(line)+'|'+strat,{keep:4,nSeeds:3});
  let second=realistic.find((c,i)=>i>0&&c.team.filter(u=>!realistic[0].team.some(v=>v.line===u.line)).length>=2);
  const selected=[realistic[0],second].filter(Boolean),variants=[];
  for(const c of selected){const key=t=>t.map(u=>u.line+u.star).join();const known=previous?.variants.find(v=>key(v.team)===key(c.team)&&v.team.every(u=>legalForm(u.line,u.star)));log('items',line,strat,known?'reuse verified full-item screen':'full item screen');const it=await items(c,line,strat,known);log('positions',line,strat);const position=await positioning(it,line,strat);variants.push(position);}
  const salt='confirm-v37|'+family(line)+'|'+strat;
  const final=await score(variants.map(x=>x.team),{nSeeds:16,salt,s3:true});
  if(previous)output.results.splice(output.results.indexOf(previous),1);
  output.results.push({line,strat,realizationVersion:2,notes,variants:variants.map((v,i)=>({team:v.team,extras:v.extras,src:v.src,items:v.items,final:final[i],finalSalt:salt,finalSeeds:16,traits:traitLabel(v.team),value:boardValue(v.team)}))});
  fs.writeFileSync(file,JSON.stringify(output));fs.writeFileSync(new URL('algorithm-audit.json',OUT),JSON.stringify(audit));
  log('final',line,strat,final.map(x=>x.score.toFixed(3)).join('/'));
 }
 fs.writeFileSync(new URL('run-identity.json',OUT),JSON.stringify({algorithm:audit.algorithm,engine:JSON.parse(fs.readFileSync('work/engine-v37/provenance.json')),metaSHA256:createHash('sha256').update(fs.readFileSync('work/fiveTwo37/meta.json')).digest('hex'),anchorsScreened:screened.filter(x=>roster[x.line].anchorK).length,results:output.results.length}));
 process.exit(0);
}
main().catch(e=>{console.error(e);process.exit(1);});
