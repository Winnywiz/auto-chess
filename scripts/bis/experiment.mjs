// Version 34 best-in-slot experiment: every three-item build per unit and star, scored by 6v6 team battles.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {engineIdentity} from '../native/identity.mjs';
const nativeRoot=new URL(process.env.KANTO_NATIVE_ROOT?`file://${process.env.KANTO_NATIVE_ROOT.replaceAll('\\','/').replace(/\/?$/,'/')}`:'../../work/native-v34/',import.meta.url);
const {fight,build:engineBuild}=await import(new URL('headless.mjs',nativeRoot));
export {engineBuild};
export const engineFingerprint=engineIdentity(nativeRoot);
export const VERSION='bis-team-battles-v4-rules34';
const source=JSON.parse(readFileSync(new URL('data.json',nativeRoot)));
export const roster=source.roster;
export const lines=Object.fromEntries(roster.map(r=>[r.id,r]));
export const items=source.items.filter(x=>x.kind==='full').sort((a,b)=>a.id.localeCompare(b.id));
export const builds=[];
for(let i=0;i<items.length;i++)for(let j=i;j<items.length;j++)for(let k=j;k<items.length;k++)builds.push([items[i].id,items[j].id,items[k].id]);
export const key=items=>items.length?items.join('|'):'empty';
export const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
// Branch lines only exist from two stars; Normal Eevee at 2/3 stars is legal through Keep Eevee.
export const states=roster.flatMap(r=>r.forms.filter(f=>!(r.branchOf&&f.star===1)).map(f=>({line:r.id,star:f.star,name:f.name,role:r.role,traits:r.traits})));
export const config={
  version:VERSION,teamSize:6,weather:null,
  screen:{contexts:4,seeds:1,shortlist:20},
  refine:{contexts:8,seeds:8,shortlist:5},
  validation:{contexts:8,seeds:24},
  confirmation:{contexts:8,seeds:32},
  sides:2,
  objective:'Win + 0.5 draw; ties broken by normalized remaining team HP difference, then target damage, then canonical item key.',
};
// Opponent lineups. "meta-" lineups are the six most used units of top Ranked compositions in the official meta API.
const training=[
  {id:'physical',enemy:['snorlax','machop','tauros','pidgey','cubone','squirtle'],ally:'mixed-a',layout:0},
  {id:'meta-psychic-water',enemy:['lapras','staryu','slowpoke','mewtwo','mew','shellder'],ally:'synergy',layout:1},
  {id:'spellcasters',enemy:['slowpoke','geodude','abra','gastly','magnemite','jynx'],ally:'mixed-b',layout:2},
  {id:'meta-birds',enemy:['moltres','aerodactyl','zapdos','articuno','rhyhorn','charmander'],ally:'synergy',layout:0},
  {id:'healing',enemy:['paras','bulbasaur','oddish','jigglypuff','chansey','snorlax'],ally:'mixed-a',layout:1},
  {id:'assassins',enemy:['onix','rhyhorn','scyther','aerodactyl','zubat','pidgey'],ally:'mixed-b',layout:2},
  {id:'mixed',enemy:['poliwag','sandshrew','pikachu','vulpix','staryu','jigglypuff'],ally:'synergy',layout:0},
  {id:'ice-control',enemy:['seel','slowpoke','lapras','shellder','jynx','exeggcute'],ally:'mixed-a',layout:1},
];
const validation=[
  {id:'meta-mewtwo-zapdos',enemy:['mewtwo','mew','staryu','zapdos','slowpoke','electabuzz'],ally:'mixed-b',layout:1},
  {id:'meta-water-ice',enemy:['lapras','staryu','shellder','jynx','slowpoke','seel'],ally:'synergy',layout:2},
  {id:'meta-dragon-rock',enemy:['aerodactyl','rhyhorn','dratini','geodude','onix','cubone'],ally:'mixed-a',layout:0},
  {id:'physical-holdout',enemy:['tauros','hitmonlee','hitmonchan','rattata','cubone','pikachu'],ally:'mixed-b',layout:1},
  {id:'fire-holdout',enemy:['growlithe','ponyta','charmander','vulpix','magmar','flareon'],ally:'synergy',layout:2},
  {id:'poison-holdout',enemy:['bulbasaur','weedle','nidoran','ekans','gastly','oddish'],ally:'mixed-a',layout:0},
  {id:'electric-holdout',enemy:['voltorb','electabuzz','pikachu','magnemite','jolteon','zapdos'],ally:'mixed-b',layout:1},
  {id:'ground-rock-holdout',enemy:['geodude','sandshrew','onix','rhyhorn','cubone','diglett'],ally:'synergy',layout:2},
];
const confirmation=[
  {id:'confirm-meta-dratini-lapras',enemy:['staryu','dratini','lapras','slowpoke','jynx','mew'],ally:'mixed-a',layout:0},
  {id:'confirm-meta-exeggcute',enemy:['slowpoke','staryu','exeggcute','jynx','rhyhorn','abra'],ally:'synergy',layout:1},
  {id:'confirm-meta-squirtle',enemy:['squirtle','magikarp','lapras','shellder','seel','slowpoke'],ally:'mixed-b',layout:2},
  {id:'confirm-04',enemy:['snorlax','paras','rattata','squirtle','vulpix','chansey'],ally:'mixed-a',layout:0},
  {id:'confirm-05',enemy:['geodude','nidoran','poliwag','magnemite','oddish','jigglypuff'],ally:'synergy',layout:1},
  {id:'confirm-06',enemy:['onix','growlithe','scyther','gastly','abra','staryu'],ally:'mixed-b',layout:2},
  {id:'confirm-07',enemy:['sandshrew','tauros','diglett','vulpix','electabuzz','articuno'],ally:'mixed-a',layout:0},
  {id:'confirm-08',enemy:['snorlax','hitmonlee','ponyta','squirtle','magmar','mewtwo'],ally:'synergy',layout:1},
];
export const archetypes={training,validation,confirmation};
export function seedFor(stage,context,i){
  const s=`${VERSION}/${stage}/${context}/${i}`;
  let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);
  return n>>>0;
}
const canonicalLine=(id,star)=>star===1&&lines[id].branchOf?'eevee':id;
const front=r=>r.range<=2;
export function heuristic(line,star,n=3){
  return [...lines[line].forms[star-1].itemFit].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,n).map(x=>x.id).sort();
}
function alliedLines(target,kind,star){
  let list=kind==='mixed-b'?['onix','poliwag','pikachu','vulpix','chansey','zubat']:['geodude','machop','squirtle','abra','jigglypuff','pidgey'];
  if(kind==='synergy'){
    const pool=roster.filter(r=>r.id!==target&&!(r.branchOf&&star===1)&&r.id!=='eevee');
    const own=lines[target];
    pool.sort((a,b)=>{const score=r=>r.traits.filter(t=>own.traits.includes(t)).length*100-Math.abs(r.cost-own.cost)*3;return score(b)-score(a)||a.id.localeCompare(b.id);});
    const selected=[target];
    for(const isFront of [true,true,false,false,false]){
      const pick=pool.find(r=>!selected.includes(r.id)&&front(r)===isFront)||pool.find(r=>!selected.includes(r.id));
      selected.push(pick.id);
    }
    return selected;
  }
  const existing=list.indexOf(target);
  if(existing>=0)list=list.filter(id=>id!==target);
  else{
    let slot=list.findIndex(id=>lines[id].role===lines[target].role);
    if(slot<0)slot=list.findIndex(id=>front(lines[id])===front(lines[target]));
    list=list.filter((_,i)=>i!==slot);
  }
  return [target,...list];
}
function formation(ids,star,layout,target=null,enemy=false){
  const cols=[[1,3,5,0,6,2,4],[2,3,4,0,6,1,5],[0,3,6,1,5,2,4]][layout];
  let f=0,b=0;
  const team=ids.map(id=>{
    const row=front(lines[id])?4:[6,7,5][layout];
    const col=front(lines[id])?cols[f++]:cols[b++];
    return {line:id,star,cell:row*7+col,items:id===target?[]:heuristic(id,star,1),...(id===target?{ownedId:'bis-target'}:{})};
  });
  if(enemy){
    const ranked=team.map((u,i)=>({i,front:front(lines[u.line]),cost:lines[u.line].cost})).sort((a,b)=>b.cost-a.cost||a.i-b.i);
    const tank=ranked.find(x=>x.front)?.i??0;
    const carry=ranked.find(x=>!x.front&&x.i!==tank)?.i??(tank===0?1:0);
    for(const i of [tank,carry])team[i].items=heuristic(team[i].line,star,2);
  }
  if(new Set(team.map(u=>u.line)).size!==6||new Set(team.map(u=>u.cell)).size!==6)throw Error('Invalid or overlapping fixture');
  return team;
}
export function fixturesFor(line,star,stage){
  const contexts=stage==='validation'?validation:stage==='confirmation'?confirmation:training.slice(0,config[stage].contexts);
  return contexts.map(c=>({id:c.id,home:formation(alliedLines(line,c.ally,star),star,c.layout,line),away:formation(c.enemy.map(id=>canonicalLine(id,star)),star,c.layout,null,true).map(u=>({...u,cell:55-u.cell}))}));
}
export function setupFor(fixture,build,orientation){
  const home=fixture.home.map(u=>u.ownedId?{...u,items:build}:u);
  if(!orientation)return {home,away:fixture.away};
  return {home:fixture.away.map(u=>({...u,cell:55-u.cell})),away:home.map(u=>({...u,cell:55-u.cell}))};
}
export function oneBattle(setup,seed,targetSide){
  const b=fight(setup.home,setup.away,seed);
  const t=b.units.find(u=>u.ownedId==='bis-target');
  if(!t||t.team!==targetSide)throw Error('Target unit not tracked');
  const remaining=[0,0],maximum=[0,0];
  for(const u of b.units){remaining[u.team]+=Math.max(0,u.hp);maximum[u.team]+=u.maxHp;}
  return {outcome:b.winner===-1?1:b.winner===targetSide?2:0,timeout:+b.timedOut,margin:remaining[targetSide]/maximum[targetSide]-remaining[1-targetSide]/maximum[1-targetSide],damage:t.dealt,healing:t.healed,shielded:t.shielded??0,mitigation:t.mitigated,survived:+t.alive};
}
export function evaluateBuild(fixtures,build,stage){
  const r={key:key(build),items:build,n:0,wins:0,draws:0,losses:0,timeouts:0,sumMargin:0,sumDamage:0,sumHealing:0,sumShield:0,sumMitigation:0,survivals:0,outcomes:[]};
  for(const f of fixtures){
    const setups=[setupFor(f,build,0),setupFor(f,build,1)];
    for(let i=0;i<config[stage].seeds;i++)for(let side=0;side<2;side++){
      const x=oneBattle(setups[side],seedFor(stage,f.id,i),side);
      r.n++;r[['losses','draws','wins'][x.outcome]]++;
      r.timeouts+=x.timeout;r.sumMargin+=x.margin;r.sumDamage+=x.damage;r.sumHealing+=x.healing;r.sumShield+=x.shielded;r.sumMitigation+=x.mitigation;r.survivals+=x.survived;
      if(stage==='validation'||stage==='confirmation')r.outcomes.push(x.outcome);
    }
  }
  r.score=(r.wins+r.draws/2)/r.n;r.margin=r.sumMargin/r.n;r.damage=r.sumDamage/r.n;
  return r;
}
export const rank=(a,b)=>b.score-a.score||b.margin-a.margin||b.damage-a.damage||a.key.localeCompare(b.key);
export function pairedComparison(a,b){
  const d=[];for(let i=0;i<a.outcomes.length;i+=2)d.push((a.outcomes[i]+a.outcomes[i+1]-b.outcomes[i]-b.outcomes[i+1])/4);
  const n=d.length,mean=d.reduce((x,y)=>x+y,0)/n,se=Math.sqrt(d.reduce((x,v)=>x+(v-mean)**2,0)/(n-1)/n);
  return {blocks:n,delta:mean,se,low:Math.max(-1,mean-1.96*se),high:Math.min(1,mean+1.96*se)};
}
const summary=({outcomes,...s})=>s;
export function runState(state,onStage=()=>{}){
  let battles=0;
  const evaluate=(stage,candidates)=>{const fixtures=fixturesFor(state.line,state.star,stage);const results=candidates.map(b=>evaluateBuild(fixtures,b,stage)).sort(rank);const n=results.reduce((x,r)=>x+r.n,0);battles+=n;onStage(stage,n);return results;};
  const unique=sets=>[...new Map(sets.map(b=>[key(b),b])).values()];
  const native=heuristic(state.line,state.star),nativeKey=key(native);
  const screen=evaluate('screen',builds);
  const refined=evaluate('refine',unique([...screen.slice(0,config.screen.shortlist).map(r=>r.items),native,[]]));
  const finalists=refined.filter(r=>r.items.length).slice(0,config.refine.shortlist).map(r=>r.items);
  const tested=evaluate('validation',unique([...finalists,native,[]]));
  const equipped=tested.filter(r=>r.items.length),best=equipped[0],runner=equipped[1];
  // Freeze leader and runner-up, then confirm on unseen lineups and seeds without reselection.
  const confirmed=evaluate('confirmation',unique([best.items,runner.items,native,[]]));
  const c=k=>confirmed.find(r=>r.key===k);
  return {...state,battles,nativeItems:native,selectedBeforeValidation:key(finalists[0]),frozenLeader:best.key,frozenRunner:runner.key,
    validation:{leader:summary(best),runner:summary(runner),comparison:pairedComparison(best,runner)},
    confirmation:{leader:summary(c(best.key)),runner:summary(c(runner.key)),native:summary(c(nativeKey)),empty:summary(c('empty')),
      comparison:pairedComparison(c(best.key),c(runner.key)),versusNative:pairedComparison(c(best.key),c(nativeKey)),versusEmpty:pairedComparison(c(best.key),c('empty'))},
    screeningTop:screen.slice(0,20).map(summary)};
}
