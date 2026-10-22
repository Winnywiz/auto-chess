// Evolutionary search for a new level 9 board that competes with the S tier.
import {scorePairs} from './pool.mjs';
import {seedList,capItems,roster,front,boardValue,traitCounts,traitRules} from './common.mjs';
import {arrange,isNovel} from './boards.mjs';
const SCREEN=seedList(2,'v34-search-screen'),HOLDOUT=seedList(16,'v34-search-holdout');
const MAX_VALUE=135;
let rngState=12345;const rand=()=>{rngState=(Math.imul(rngState,1664525)+1013904223)>>>0;return rngState/4294967296;};
const pick=a=>a[Math.floor(rand()*a.length)];
const lines=Object.values(roster).filter(r=>!r.branchOf&&r.id!=='eevee').map(r=>r.id);
const UTILITY=['gastly','dratini','chansey','ditto','jigglypuff','snorlax'];
const keyOf=t=>t.map(u=>`${u.line}${u.star}:${u.cell}:${(u.items??[]).join('+')}`).sort().join(',');
function legal(t){
  if(t.length!==9||new Set(t.map(u=>u.line)).size!==9||new Set(t.map(u=>u.cell)).size!==9)return false;
  if(t.some(u=>roster[u.line].cost>=4&&u.star>2))return false;
  if(t.reduce((s,u)=>s+(u.items?.length??0),0)>6)return false;
  return boardValue(t)<=MAX_VALUE;
}
function mutate(team,bis){
  let t=team.map(u=>({...u,items:[...(u.items??[])]}));
  const carry=t.reduce((a,b)=>(b.items.length>a.items.length?b:a),t[0]);
  const op=rand();
  if(op<.45){ // replace a non-item unit
    const slots=t.filter(u=>!u.items.length);if(!slots.length)return t;
    const out=pick(slots),traits=Object.entries(traitCounts(t)).filter(([k,n])=>traitRules[k].thresholds[0]<=n+1).map(([k])=>k);
    const pool=rand()<.3?UTILITY:lines.filter(l=>roster[l].traits.some(x=>traits.includes(x)));
    const inn=pick(pool.filter(l=>!t.some(u=>u.line===l))??lines);if(!inn)return t;
    const star=roster[inn].cost<=2&&rand()<.25?3:2;
    t=t.map(u=>u===out?{line:inn,star,items:[],cell:front(inn)===front(out.line)?out.cell:undefined}:u);
    t=arrange(t,Object.fromEntries(t.filter(u=>u.cell!==undefined).map(u=>[u.line,u.cell])));
  }else if(op<.6){ // star change on a cheap unit
    const cheap=t.filter(u=>roster[u.line].cost<=3);if(cheap.length){const u=pick(cheap);u.star=u.star===3?2:3;}
  }else if(op<.75&&bis){ // BIS items for a holder
    const holders=t.filter(u=>u.items.length);const u=pick(holders);const b=bis[u.line+':'+u.star];if(b)u.items=rand()<.7?[...b.leader]:[...b.runner];
  }else if(op<.85&&bis){ // move the carry role to another strong unit
    const target=pick(t.filter(u=>u!==carry&&roster[u.line].cost>=3));const b=target&&bis[target.line+':'+target.star];
    if(b){target.items=[...b.leader];carry.items=[];}
  }else{ // swap two cells
    const a=pick(t),b=pick(t);[a.cell,b.cell]=[b.cell,a.cell];
  }
  return t;
}
export async function search(seedBoards,gauntlet,existing,{bis=null,generations=24,population=36,children=108,label='search'}={}){
  let pop=seedBoards.filter(legal).map(t=>({team:t}));
  const seen=new Map();
  const evaluate=async boards=>{
    const fresh=boards.filter(b=>!seen.has(keyOf(b.team)));
    const pairs=[];fresh.forEach(b=>{for(const g of gauntlet)pairs.push({a:capItems(b.team),b:g.team});});
    const scores=await scorePairs(pairs,SCREEN,{label});
    fresh.forEach((b,i)=>{const s=scores.slice(i*gauntlet.length,(i+1)*gauntlet.length);seen.set(keyOf(b.team),s.reduce((x,y)=>x+y,0)/s.length);});
    return boards.map(b=>({...b,screen:seen.get(keyOf(b.team))}));
  };
  pop=await evaluate(pop);
  for(let g=0;g<generations;g++){
    const kids=[];let tries=0;
    while(kids.length<children&&tries<children*20){tries++;const parent=pop[Math.floor(Math.pow(rand(),2)*pop.length)]??pick(pop);let t=mutate(parent.team,bis);if(rand()<.4)t=mutate(t,bis);if(legal(t)&&!seen.has(keyOf(t)))kids.push({team:t});}
    const scored=await evaluate(kids);
    // Keep diversity: at most 4 boards per carry line.
    const all=[...pop,...scored].sort((a,b)=>b.screen-a.screen),perCarry={};pop=[];
    for(const b of all){const c=b.team.reduce((a,x)=>(x.items?.length??0)>(a.items?.length??0)?x:a,b.team[0]).line;if((perCarry[c]=(perCarry[c]??0)+1)<=4)pop.push(b);if(pop.length>=population)break;}
    console.log(`  ${label} generation ${g+1}/${generations}: best ${(100*pop[0].screen).toFixed(1)}%, ${seen.size} boards tried`);
  }
  // Holdout: new seeds against the full gauntlet, only for boards that differ from every published board.
  const finalists=pop.filter(b=>isNovel(b.team,existing)).slice(0,12);
  const pairs=[];finalists.forEach(b=>{for(const g of gauntlet)pairs.push({a:capItems(b.team),b:g.team});});
  const scores=await scorePairs(pairs,HOLDOUT,{label:label+' holdout'});
  finalists.forEach((b,i)=>{const s=scores.slice(i*gauntlet.length,(i+1)*gauntlet.length);b.holdout=s.reduce((x,y)=>x+y,0)/s.length;});
  return {finalists:finalists.sort((a,b)=>b.holdout-a.holdout),tried:seen.size};
}
