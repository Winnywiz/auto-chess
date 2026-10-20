import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fight,sim} from '../kanto-headless-v2/headless.mjs';
export const VERSION='composition-paths-v2-1';
export const data=JSON.parse(readFileSync(new URL('../kanto-headless-v2/data.json',import.meta.url)));
export const lines=Object.fromEntries(data.roster.map(r=>[r.id,r]));
const pool=JSON.parse(readFileSync(new URL('../kanto-headless-v2/pool.json',import.meta.url)));
const bis=process.env.KANTO_COMPS_SMOKE==='1'?{deterministicResultsSha256:'smoke-only',results:[]}:JSON.parse(readFileSync(new URL('../kanto-bis-v2/confirmation.json',import.meta.url)));
export const bisDigest=bis.deterministicResultsSha256;
const equipped=Object.fromEntries(bis.results.map(r=>[r.line+':'+r.star,r.selected.items]));
export const categories=[
 {id:'reroll-5',name:'Reroll 5',levels:[5,6,7,8],cost:1},
 {id:'reroll-6',name:'Reroll 6',levels:[6,7,8],cost:2},
 {id:'reroll-7',name:'Reroll 7',levels:[7,8],cost:3},
 {id:'fast-8',name:'Fast 8',levels:[7,8],cost:4},
 {id:'legendary',name:'Legendary board',levels:[8,9],cost:5},
];
export const settings={initial:12,generations:3,mutationsPerGeneration:18,beam:5,
 screen:{contexts:4,seeds:1},validation:{contexts:8,seeds:8},confirmation:{contexts:8,seeds:32},
 finalistsPerCarry:2,publishedPerCategory:58,
 tiers:'S: confirmation score >=65% and every checkpoint >=50%. A: overall >=50%. B: otherwise. Provisional combat tiers, not full-match placement tiers.',
 dependency:'BIS dependent if replacing only the carry gear with three distinct native item-fit picks lowers paired confirmation score by >=5 percentage points and its descriptive paired 95% interval excludes zero.',
};
export const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const seedFor=(...parts)=>{const b=createHash('sha256').update([VERSION,...parts].join('/')).digest();return b.readUInt32LE(0);};
export function rng(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export const heuristic=(id,star,n=3)=>[...lines[id].forms[star-1].itemFit].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,n).map(x=>x.id).sort();
export const bisItems=(id,star)=>equipped[id+':'+star]??heuristic(id,star);
export const tasks=categories.flatMap(cat=>data.roster.filter(r=>r.cost===cat.cost).map(r=>({category:cat.id,carry:r.id})));
const category=id=>categories.find(c=>c.id===id);
const isFront=id=>lines[id].range<=2;
const capAt=level=>level<=5?2:level===6?3:level===7?4:5;
function available(id,index,cat){
 const level=Math.max(cat.levels[0],index+1),r=lines[id];
 if(r.cost>capAt(level))return false;
 if(cat.id==='legendary')return true;
 return r.cost<5||index===7;
}
function valid(c,cat){
 if(new Set(c.ids).size!==c.ids.length||c.ids[0]!==c.carry)return false;
 if(c.ids.some((id,i)=>i>0&&!available(id,i,cat)))return false;
 for(const level of cat.levels)if(c.ids.slice(0,level).filter(isFront).length<2)return false;
 if(cat.id==='legendary'&&(c.ids.filter(id=>lines[id].cost===5).length<3||c.ids.filter(id=>lines[id].cost===5).length>4))return false;
 if(cat.levels.some(level=>!poolLegal(teamFor(c,level))))return false;
 return true;
}
export function poolLegal(team){const counts={};for(const u of team){const base=lines[u.line].branchOf??u.line;counts[base]=(counts[base]??0)+3**(u.star-1);if(counts[base]>pool[lines[base].cost])return false;}return true;}
function weightedPick(pool,chosen,carry,random){
 const traits=new Set(chosen.flatMap(id=>lines[id].traits));
 const weights=pool.map(id=>1+lines[id].traits.filter(t=>traits.has(t)).length*2+(id==='gastly'||id==='dratini'?1:0));
 let x=random()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){x-=weights[i];if(x<=0)return pool[i];}return pool.at(-1);
}
function initial(task,random){
 const cat=category(task.category),count=cat.levels.at(-1),ids=[task.carry];
 while(ids.length<count){
  const i=ids.length;let pool=data.roster.map(r=>r.id).filter(id=>!ids.includes(id)&&available(id,i,cat));
  if(i<3&&ids.filter(isFront).length<2)pool=pool.filter(isFront);
  if(cat.id==='legendary'&&i>=count-3&&ids.filter(id=>lines[id].cost===5).length<3)pool=pool.filter(id=>lines[id].cost===5);
  if(cat.id==='legendary'&&ids.filter(id=>lines[id].cost===5).length>=4)pool=pool.filter(id=>lines[id].cost<5);
  if(!pool.length)return initial(task,random);
  ids.push(weightedPick(pool,ids,task.carry,random));
 }
 const c={category:task.category,carry:task.carry,ids,layout:Math.floor(random()*3)};
 return valid(c,cat)?c:initial(task,random);
}
function mutate(parent,random){
 const c={...parent,ids:[...parent.ids]},cat=category(c.category);
 if(random()<.25)c.layout=Math.floor(random()*3);
 else if(random()<.25){const a=1+Math.floor(random()*(c.ids.length-1)),b=1+Math.floor(random()*(c.ids.length-1));[c.ids[a],c.ids[b]]=[c.ids[b],c.ids[a]];}
 else{const i=1+Math.floor(random()*(c.ids.length-1)),pool=data.roster.map(r=>r.id).filter(id=>!c.ids.includes(id)&&available(id,i,cat));if(pool.length)c.ids[i]=weightedPick(pool,c.ids,c.carry,random);}
 return valid(c,cat)?c:mutate(parent,random);
}
export function formation(units,layout=0){
 const columns=[[3,2,4,1,5,0,6],[0,2,4,6,1,3,5],[6,4,2,0,5,3,1]][layout],used=new Set();
 return units.map(u=>{const front=isFront(u.line),rows=front?[4,5,6,7]:[7,6,5,4];let cell;
  for(const row of rows){cell=columns.map(col=>row*7+col).find(c=>!used.has(c));if(cell!==undefined)break;}
  used.add(cell);return {...u,cell};});
}
export function teamFor(candidate,level,fallback=false){
 const cat=category(candidate.category);
 const team=candidate.ids.slice(0,level).map((id,i)=>{
  let star=lines[id].cost===5?1:2;
  if(i===0)star=cat.cost<=3?3:level>=cat.cost+4?2:1;
  return {line:id,star,items:heuristic(id,star,1)};
 });
 team[0].items=fallback?heuristic(team[0].line,team[0].star):bisItems(team[0].line,team[0].star);
 const tank=team.findIndex((u,i)=>i>0&&i<cat.levels[0]&&lines[u.line].role==='tank');
 const frontline=tank>=0?tank:team.findIndex((u,i)=>i>0&&i<cat.levels[0]&&isFront(u.line));
 if(cat.cost<=3&&lines[team[frontline].line].cost<=cat.cost)team[frontline].star=3;
 team[frontline].items=bisItems(team[frontline].line,team[frontline].star).slice(0,2);
 return formation(team,candidate.layout);
}
const themed=[['Water','Ice'],['Normal','Fighting'],['Poison','Grass'],['Electric','Flying'],['Psychic','Ghost'],['Ground','Rock'],['Fire','Flying'],['Bug','Grass']];
const referenceCache=new Map();
export function opponent(stage,context,level,attempt=0){
 const fixtureKey=[stage,context,level].join('/');if(referenceCache.has(fixtureKey))return referenceCache.get(fixtureKey);
 const random=rng(seedFor('opponent',stage,context,level,attempt)),wanted=themed[context%themed.length],max=capAt(level);
 const preferred=level<=5?1:level===6?2:level===7?3:level===8?4:5;
 const carries=data.roster.filter(r=>r.cost===preferred);
 const weights=carries.map(r=>1+r.traits.filter(t=>wanted.includes(t)).length*3);
 let roll=random()*weights.reduce((a,b)=>a+b,0),carry=carries.at(-1).id;
 for(let i=0;i<carries.length;i++){roll-=weights[i];if(roll<=0){carry=carries[i].id;break;}}
 const ids=[carry];
 while(ids.length<level){
  const i=ids.length,frontNeeded=i<3&&ids.filter(isFront).length<2;let pool=data.roster.filter(r=>!ids.includes(r.id)&&r.cost<=max&&(!r.branchOf||level>=5)&&(r.cost<5||ids.filter(id=>lines[id].cost===5).length<(level>=9?4:1)));
  if(frontNeeded)pool=pool.filter(r=>isFront(r.id));
  const weights=pool.map(r=>1+r.traits.filter(t=>wanted.includes(t)).length*6+(level>=8?r.cost:0));
  let x=random()*weights.reduce((a,b)=>a+b,0),pick=pool.at(-1);for(let j=0;j<pool.length;j++){x-=weights[j];if(x<=0){pick=pool[j];break;}}
  ids.push(pick.id);
 }
 const team=ids.map(id=>({line:id,star:lines[id].cost===5?1:2,items:heuristic(id,lines[id].cost===5?1:2,1)}));
 const u=team.find(u=>u.line===carry);u.star=level<=7&&lines[carry].cost===preferred?3:level>=9&&lines[carry].cost===5?2:u.star;u.items=bisItems(carry,u.star);
 const tank=team.find(v=>v!==u&&lines[v.line].role==='tank')??team.find(v=>v!==u&&isFront(v.line));tank.items=bisItems(tank.line,tank.star).slice(0,2);
 if(tank!==u&&level<=7&&lines[tank.line].cost<=preferred){tank.star=3;tank.items=bisItems(tank.line,tank.star).slice(0,2);}
 if(!poolLegal(team))return opponent(stage,context,level,attempt+1);
 const canonical=t=>t.map(u=>u.line).sort().join('|'),signature=canonical(team),phases=['screen','validation','confirmation'];
 for(const previous of phases.slice(0,phases.indexOf(stage)))for(let i=0;i<settings[previous].contexts;i++)if(canonical(opponent(previous,i,level))===signature)return opponent(stage,context,level,attempt+1);
 for(let i=0;i<context;i++)if(canonical(opponent(stage,i,level))===signature)return opponent(stage,context,level,attempt+1);
 const result=formation(team,context%3);referenceCache.set(fixtureKey,result);return result;
}
export function outcome(home,away,seed,side){
 const rotate=team=>team.map(u=>({...u,cell:55-u.cell}));
 const setup=side?{home:away,away:rotate(home),weather:null}:{home,away:rotate(away),weather:null};
 const b=fight(setup,seed);return {value:b.winner===-1?.5:b.winner===side?1:0,draw:+(b.winner===-1),timeout:+b.timedOut};
}
const opponentCache=new Map();
export function evaluate(candidate,stage,fallback=false){
 const cat=category(candidate.category),cfg=settings[stage],byLevel=[],blocks=[];let wins=0,draws=0,timeouts=0,n=0;
 for(const level of cat.levels){
  const team=teamFor(candidate,level,fallback),row={level,wins:0,draws:0,n:0,matchups:[]};
  for(let context=0;context<cfg.contexts;context++){
   const key=[stage,context,level].join('/');if(!opponentCache.has(key))opponentCache.set(key,opponent(stage,context,level));
   const enemy=opponentCache.get(key),matchup={context,wins:0,draws:0,n:0};
   for(let i=0;i<cfg.seeds;i++){
    let pair=0;for(let side=0;side<2;side++){
     const x=outcome(team,enemy,seedFor('combat',stage,level,context,i),side);pair+=x.value;wins+=x.value===1;draws+=x.draw;timeouts+=x.timeout;n++;row.n++;row.wins+=x.value===1;row.draws+=x.draw;matchup.n++;matchup.wins+=x.value===1;matchup.draws+=x.draw;
    }blocks.push(pair/2);
   }matchup.score=(matchup.wins+.5*matchup.draws)/matchup.n;row.matchups.push(matchup);
  }row.score=(row.wins+.5*row.draws)/row.n;byLevel.push(row);
 }
 return {n,wins,draws,losses:n-wins-draws,timeouts,score:(wins+.5*draws)/n,byLevel,blocks};
}
const key=c=>c.ids.join('|')+'/'+c.layout;
const rank=(a,b)=>b.result.score-a.result.score||Math.min(...b.result.byLevel.map(r=>r.score))-Math.min(...a.result.byLevel.map(r=>r.score))||key(a.candidate).localeCompare(key(b.candidate));
export function searchTask(task){
 const random=rng(seedFor('search',task.category,task.carry)),cache=new Map();let battles=0;
 const score=c=>{const k=key(c);if(!cache.has(k)){const result=evaluate(c,'screen');battles+=result.n;cache.set(k,{candidate:c,result});}return cache.get(k);};
 let beam=Array.from({length:settings.initial},()=>score(initial(task,random))).sort(rank).slice(0,settings.beam);
 for(let gen=0;gen<settings.generations;gen++){
  for(let i=0;i<settings.mutationsPerGeneration;i++)score(mutate(beam[i%beam.length].candidate,random));
  beam=[...cache.values()].sort(rank).slice(0,settings.beam);
 }
 const validated=beam.slice(0,settings.finalistsPerCarry).map(({candidate})=>{const result=evaluate(candidate,'validation');battles+=result.n;return {candidate,result};}).sort(rank);
 return {...task,searched:cache.size,battles,screening:beam,validated};
}
export function interval(blocks){const mean=blocks.reduce((a,b)=>a+b,0)/blocks.length,se=Math.sqrt(blocks.reduce((a,x)=>a+(x-mean)**2,0)/(blocks.length-1)/blocks.length);return {mean,se,low:mean-1.96*se,high:mean+1.96*se,blocks:blocks.length};}
export function confirmCandidate(candidate){
 const result=evaluate(candidate,'confirmation'),fallback=evaluate(candidate,'confirmation',true),comparison=interval(result.blocks.map((x,i)=>x-fallback.blocks[i]));
 const weakest=Math.min(...result.byLevel.map(r=>r.score)),tier=result.score>=.65&&weakest>=.5?'S':result.score>=.5?'A':'B';
 return {candidate,result,fallback,comparison,tier,bisDependent:comparison.mean>=.05&&comparison.low>0,
  boards:category(candidate.category).levels.map(level=>({level,team:teamFor(candidate,level)}))};
}
