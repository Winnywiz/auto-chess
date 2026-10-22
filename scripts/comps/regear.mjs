// Re-gear every candidate board with Version 34 BIS items for its carry and tank; keep the best option by screening.
import {scorePairs} from './pool.mjs';
import {seedList,capItems,readJSON,writeJSON} from './common.mjs';
import fs from 'node:fs';
const SEEDS=seedList(4,'v34-regear');
export function loadBis(){
  const p=new URL('../../work/bis-v4/results.json',import.meta.url);
  if(!fs.existsSync(p))return null;
  const r=JSON.parse(fs.readFileSync(p));
  return Object.fromEntries(r.results.map(x=>[x.line+':'+x.star,{leader:x.frozenLeader.split('|'),runner:x.frozenRunner.split('|'),score:x.confirmation.leader.score}]));
}
const holders=team=>{const carry=team.find(u=>u.assignment==='Carry')??[...team].sort((a,b)=>(b.items?.length??0)-(a.items?.length??0))[0];const tank=team.find(u=>u!==carry&&(u.assignment==='Tank'||u.assignment==='Frontline'))??team.find(u=>u!==carry&&u.items?.length);return {carry,tank};};
export function options(team,bis){
  const {carry,tank}=holders(team),opts=[{label:'published',team}];
  if(!bis)return opts;
  const set=(t,map)=>t.map(u=>map.has(u)?{...u,items:map.get(u)}:u);
  const cb=bis[carry.line+':'+carry.star],tb=tank&&bis[tank.line+':'+tank.star];
  if(cb){opts.push({label:'bis-carry',team:set(team,new Map([[carry,cb.leader]]))});opts.push({label:'bis-carry-runner',team:set(team,new Map([[carry,cb.runner]]))});}
  if(tb){opts.push({label:'bis-tank',team:set(team,new Map([[tank,tb.leader]]))});}
  if(cb&&tb)opts.push({label:'bis-both',team:set(team,new Map([[carry,cb.leader],[tank,tb.leader]]))});
  return opts;
}
export async function regear(candidates,refs){
  const bis=loadBis();if(!bis){console.log('  regear: BIS results not found, keeping published items');return {candidates,report:[]};}
  const report=[],pairs=[],index=[];
  for(const c of candidates)for(const b of c.boards){
    const rs=refs.filter(r=>r.level===b.level);
    options(b.team,bis).forEach((o,k)=>{for(const r of rs){pairs.push({a:capItems(o.team),b:r.team});index.push([c.id,b.level,k]);}});
  }
  const scores=await scorePairs(pairs,SEEDS,{label:'regear'});
  const agg={};scores.forEach((s,i)=>{const key=index[i].join('/');(agg[key]??=[]).push(s);});
  const out=candidates.map(c=>({...c,boards:c.boards.map(b=>{
    const opts=options(b.team,bis).map((o,k)=>({...o,score:agg[[c.id,b.level,k].join('/')].reduce((x,y)=>x+y,0)/agg[[c.id,b.level,k].join('/')].length}));
    const best=opts.reduce((x,y)=>y.score>x.score+0.01?y:x,opts[0]);
    report.push({id:c.id,level:b.level,chosen:best.label,gain:best.score-opts[0].score,options:opts.map(o=>({label:o.label,score:o.score}))});
    return {...b,team:best.team,gear:best.label};
  })}));
  return {candidates:out,report};
}
