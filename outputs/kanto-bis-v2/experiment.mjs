import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fight} from '../kanto-headless-v2/headless.mjs';

export const VERSION='bis-team-battles-v2';
const source=JSON.parse(readFileSync(new URL('../kanto-headless-v2/data.json',import.meta.url)));
export const roster=source.roster;
export const lines=Object.fromEntries(roster.map(r=>[r.id,r]));
export const items=source.items.filter(x=>x.kind==='full').sort((a,b)=>a.id.localeCompare(b.id));
export const itemNames=Object.fromEntries(source.items.map(x=>[x.id,x.name]));
export const builds=[];
for(let i=0;i<items.length;i++)for(let j=i;j<items.length;j++)for(let k=j;k<items.length;k++)builds.push([items[i].id,items[j].id,items[k].id]);
export const key=items=>items.length?items.join('|'):'empty';
export const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const states=roster.flatMap(r=>r.forms.filter(f=>!(r.branchOf&&f.star===1)&&!(r.id==='eevee'&&f.star>1)).map(f=>({line:r.id,star:f.star,name:f.name,role:r.role,traits:r.traits})));
export const excludedStates=roster.flatMap(r=>r.forms.filter(f=>(r.branchOf&&f.star===1)||(r.id==='eevee'&&f.star>1)).map(f=>({line:r.id,star:f.star,reason:'Eevee branches occur on native evolution at two stars, not as these synthetic states.'})));
export const config={
  version:VERSION,teamSize:6,weather:null,
  screen:{contexts:4,seeds:1,shortlist:20},
  refine:{contexts:6,seeds:8,shortlist:5},
  validation:{contexts:8,seeds:24},
  sides:2,
  objective:'Win + 0.5 draw; ties broken by normalized remaining team HP difference, then target damage, then canonical item key.',
  scope:'All 1771 unordered three-finished-item multisets, including repeated items. No component availability constraint. Canonical inventory order only.',
};
const training=[
  {id:'physical',enemy:['snorlax','machop','tauros','pidgey','cubone','squirtle'],ally:'mixed-a',layout:0},
  {id:'spellcasters',enemy:['slowpoke','geodude','abra','gastly','magnemite','jynx'],ally:'synergy',layout:1},
  {id:'healing',enemy:['paras','bulbasaur','oddish','jigglypuff','chansey','snorlax'],ally:'mixed-b',layout:2},
  {id:'assassins',enemy:['onix','rhyhorn','scyther','aerodactyl','zubat','pidgey'],ally:'synergy',layout:0},
  {id:'mixed',enemy:['poliwag','sandshrew','pikachu','vulpix','staryu','jigglypuff'],ally:'mixed-a',layout:1},
  {id:'ice-control',enemy:['seel','slowpoke','lapras','shellder','jynx','exeggcute'],ally:'mixed-b',layout:2},
];
const validation=[
  {id:'physical-holdout',enemy:['tauros','hitmonlee','hitmonchan','rattata','cubone','pikachu'],ally:'mixed-b',layout:1},
  {id:'fire-holdout',enemy:['growlithe','ponyta','charmander','vulpix','magmar','flareon'],ally:'synergy',layout:2},
  {id:'water-holdout',enemy:['slowpoke','seel','poliwag','squirtle','staryu','lapras'],ally:'mixed-a',layout:0},
  {id:'poison-holdout',enemy:['bulbasaur','weedle','nidoran','ekans','gastly','oddish'],ally:'mixed-b',layout:1},
  {id:'electric-holdout',enemy:['voltorb','electabuzz','pikachu','magnemite','jolteon','zapdos'],ally:'synergy',layout:2},
  {id:'psychic-holdout',enemy:['slowpoke','abra','exeggcute','staryu','jynx','mewtwo'],ally:'mixed-a',layout:0},
  {id:'mixed-high-cost-holdout',enemy:['rhyhorn','dratini','scyther','lapras','chansey','mew'],ally:'mixed-b',layout:1},
  {id:'ground-rock-holdout',enemy:['geodude','sandshrew','onix','rhyhorn','cubone','diglett'],ally:'synergy',layout:2},
];
export const archetypes={training,validation};
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
    pool.sort((a,b)=>{
      const score=r=>r.traits.filter(t=>own.traits.includes(t)).length*100-Math.abs(r.cost-own.cost)*3;
      return score(b)-score(a)||a.id.localeCompare(b.id);
    });
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
    // Eight finished items on each fully equipped side: 2 + 2 + 1 + 1 + 1 + 1.
    const ranked=team.map((u,i)=>({i,front:front(lines[u.line]),cost:lines[u.line].cost})).sort((a,b)=>b.cost-a.cost||a.i-b.i);
    const tank=ranked.find(x=>x.front)?.i??0;
    const carry=ranked.find(x=>!x.front)?.i??(tank===0?1:0);
    for(const i of [tank,carry])team[i].items=heuristic(team[i].line,star,2);
  }
  if(new Set(team.map(u=>u.line)).size!==6||new Set(team.map(u=>u.cell)).size!==6)throw Error('Invalid or overlapping fixture');
  return team;
}
export function fixturesFor(line,star,stage){
  const contexts=stage==='validation'?validation:training.slice(0,config[stage].contexts);
  return contexts.map(c=>({id:c.id,ally:c.ally,layout:c.layout,home:formation(alliedLines(line,c.ally,star),star,c.layout,line),away:formation(c.enemy.map(id=>canonicalLine(id,star)),star,c.layout,null,true).map(u=>({...u,cell:55-u.cell}))}));
}
export function setupFor(fixture,build,orientation){
  const home=fixture.home.map(u=>u.ownedId?{...u,items:build}:u);
  if(!orientation)return {home,away:fixture.away,weather:null};
  return {home:fixture.away.map(u=>({...u,cell:55-u.cell})),away:home.map(u=>({...u,cell:55-u.cell})),weather:null};
}
export function oneBattle(setup,seed,targetSide){
  const b=fight(setup,seed);
  const t=b.units.find(u=>u.ownedId==='bis-target');
  if(!t||t.team!==targetSide)throw Error('Target unit not tracked');
  const remaining=[0,0],maximum=[0,0];
  for(const u of b.units){remaining[u.team]+=Math.max(0,u.hp);maximum[u.team]+=u.maxHp;}
  return {outcome:b.winner===-1?1:b.winner===targetSide?2:0,timeout:+b.timedOut,time:b.time,margin:remaining[targetSide]/maximum[targetSide]-remaining[1-targetSide]/maximum[1-targetSide],damage:t.dealt,healing:t.healed,mitigation:t.mitigated,survived:+t.alive};
}
export function evaluateBuild(fixtures,build,stage){
  const result={key:key(build),items:build,n:0,wins:0,draws:0,losses:0,timeouts:0,sumTime:0,sumMargin:0,sumDamage:0,sumHealing:0,sumMitigation:0,survivals:0,contexts:[],outcomes:[]};
  for(const f of fixtures){
    const context={id:f.id,n:0,wins:0,draws:0,losses:0};
    const setups=[setupFor(f,build,0),setupFor(f,build,1)];
    for(let i=0;i<config[stage].seeds;i++)for(let side=0;side<2;side++){
      const x=oneBattle(setups[side],seedFor(stage,f.id,i),side);
      result.n++;context.n++;const outcome=['losses','draws','wins'][x.outcome];result[outcome]++;context[outcome]++;
      result.timeouts+=x.timeout;result.sumTime+=x.time;result.sumMargin+=x.margin;result.sumDamage+=x.damage;result.sumHealing+=x.healing;result.sumMitigation+=x.mitigation;result.survivals+=x.survived;
      if(stage==='validation')result.outcomes.push(x.outcome);
    }
    context.score=(context.wins+context.draws/2)/context.n;
    result.contexts.push(context);
  }
  result.score=(result.wins+result.draws/2)/result.n;
  result.margin=result.sumMargin/result.n;
  result.damage=result.sumDamage/result.n;
  return result;
}
export const rank=(a,b)=>b.score-a.score||b.margin-a.margin||b.damage-a.damage||a.key.localeCompare(b.key);
export function pairedComparison(a,b){
  if(a.outcomes.length!==b.outcomes.length)throw Error('Unpaired validation');
  const differences=[];
  for(let i=0;i<a.outcomes.length;i+=2)differences.push((a.outcomes[i]+a.outcomes[i+1]-b.outcomes[i]-b.outcomes[i+1])/4);
  const n=differences.length,mean=differences.reduce((a,b)=>a+b,0)/n;
  const se=Math.sqrt(differences.reduce((a,x)=>a+(x-mean)**2,0)/(n-1)/n);
  return {blocks:n,delta:mean,se,low:Math.max(-1,mean-1.96*se),high:Math.min(1,mean+1.96*se)};
}
function summary(r){
  const {outcomes,...s}=r;
  return s;
}
export function runState(state,onStage=()=>{}){
  const stageTimes={};let battles=0;
  const evaluate=(stage,candidates)=>{
    const start=performance.now(),fixtures=fixturesFor(state.line,state.star,stage);
    const results=candidates.map(build=>evaluateBuild(fixtures,build,stage)).sort(rank);
    const n=results.reduce((n,r)=>n+r.n,0);battles+=n;
    stageTimes[stage]={battles:n,elapsedMs:performance.now()-start};onStage(stage,n);
    return results;
  };
  const native=heuristic(state.line,state.star),nativeKey=key(native);
  const screen=evaluate('screen',builds);
  const unique=sets=>[...new Map(sets.map(b=>[key(b),b])).values()];
  const refined=evaluate('refine',unique([...screen.slice(0,config.screen.shortlist).map(r=>r.items),native,[]]));
  const finalists=refined.filter(r=>r.items.length).slice(0,config.refine.shortlist).map(r=>r.items);
  const selectedBeforeValidation=key(finalists[0]);
  const tested=evaluate('validation',unique([...finalists,native,[]]));
  const equipped=tested.filter(r=>r.items.length),best=equipped[0],runner=equipped[1],baseline=tested.find(r=>r.key==='empty'),nativeResult=tested.find(r=>r.key===nativeKey);
  const selected=tested.find(r=>r.key===selectedBeforeValidation);
  const comparison=pairedComparison(best,runner);
  const flags=[];
  if(comparison.low<=0)flags.push('Top builds not clearly separated on held-out seed blocks.');
  if(best.key!==selectedBeforeValidation)flags.push('Held-out leader differs from the build selected before validation.');
  if(best.score>=.95||best.score<=.05)flags.push('Saturated matchup set: weak evidence for distinguishing builds.');
  if(best.timeouts/best.n>.2)flags.push('More than 20% of the leading build\'s battles timed out.');
  return {...state,buildsScreened:builds.length,battles,stageTimes,nativeItems:native,selectedBeforeValidation,bestObserved:best.key,selectedValidationRank:equipped.findIndex(r=>r.key===selected.key)+1,comparison,versusNative:pairedComparison(best,nativeResult),versusEmpty:pairedComparison(best,baseline),flags,
    screening:screen.map(summary),refinement:refined.map(summary),validation:tested};
}
