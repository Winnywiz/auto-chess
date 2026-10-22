// Level 5 to 8 transition boards, built downward from the final board.
// Only final-board units are used first; when a slot cannot be filled yet, the filler must share an active
// trait with the final board or be a utility unit. Each option is battle-tested against typical boards at that level.
import {scorePairs} from './pool.mjs';
import {seedList,roster,front,activeTraits,capItems} from './common.mjs';
import {availableAt,starAt,arrange,holderFor} from './boards.mjs';
const SEEDS=seedList(4,'v34-transition');
export const ITEMS_AT={5:3,6:4,7:5,8:6};
const UTILITY=['gastly','dratini','chansey'];
const lines=Object.values(roster).filter(r=>!r.branchOf&&r.id!=='eevee');
// Typical opponents at a level: reference boards reduced to units available at that level.
export function levelOpponents(refs,level,count=16){
  const src=refs.filter(r=>r.level===8||r.level===9);
  const out=[];
  for(const r of src){
    const team=r.team.filter(u=>availableAt(u.line,level)).map(u=>({...u,star:Math.min(u.star,starAt(u.line,level,{finalStar:u.star,rollLevel:u.star===3?5:null}))}));
    if(team.length<level)continue;
    const ranked=[...team].sort((a,b)=>(b.items?.length??0)-(a.items?.length??0)||roster[b.line].cost-roster[a.line].cost).slice(0,level);
    out.push({id:r.id+'@'+level,team:capItems(arrange(ranked,Object.fromEntries(ranked.map(u=>[u.line,u.cell]))),ITEMS_AT[level])});
  }
  // Spread across sources deterministically.
  const step=Math.max(1,Math.floor(out.length/count));return out.filter((_,i)=>i%step===0).slice(0,count);
}
function gear(team,final,level){
  const carry=final.find(u=>u.assignment==='Carry')??final.reduce((a,b)=>(b.items?.length??0)>(a.items?.length??0)?b:a);
  const tank=final.find(u=>u!==carry&&(u.items?.length));
  const out=team.map(u=>({...u,items:[]}));let budget=ITEMS_AT[level];const holders=[];
  const place=(target,role)=>{if(!target||budget<=0)return;const items=target.items.slice(0,budget);
    let h=out.find(u=>u.line===target.line);
    if(!h)h=holderFor(out.filter(u=>!u.items.length&&(role==='Tank'?front(u.line):true)),items)??holderFor(out.filter(u=>!u.items.length),items);
    if(!h)return;h.items=items;h.assignment=role;budget-=items.length;
    holders.push({holder:h.line,holderStar:h.star,target:target.line,targetStar:target.star,items,keep:h.line===target.line});};
  place(carry,'Carry');place(tank,'Tank');
  return {team:out,holders};
}
export function optionsFor(final,level,prevTeam,{locked=[],rollLevel=null}={}){
  const hint=Object.fromEntries(final.map(u=>[u.line,u.cell]));
  const finalLines=new Set(final.map(u=>u.line));
  const active=new Set(activeTraits(final).map(x=>x.t));
  const carry=final.find(u=>u.assignment==='Carry')??final.reduce((a,b)=>(b.items?.length??0)>(a.items?.length??0)?b:a);
  const prio=u=>(u.line===carry.line?100:0)+(u.items?.length?50:0)+(locked.includes(u.line)?40:0)+roster[u.line].traits.filter(t=>active.has(t)).length*10+roster[u.line].cost;
  const core=prevTeam.filter(u=>availableAt(u.line,level)).map(u=>({line:u.line,star:starAt(u.line,level,{finalStar:(final.find(f=>f.line===u.line)?.star)??u.star,locked,rollLevel}),items:[]})).sort((a,b)=>prio(b)-prio(a));
  // Legendaries are rare before level 9: at most one 1-star five-cost unit at level 8 (the highest priority).
  {let fives=0;const kept=[];for(const u of core){if(roster[u.line].cost===5){if(level<8||fives>=1)continue;fives++;}kept.push(u);}core.splice(0,core.length,...kept);}
  const fillers=lines.filter(r=>!finalLines.has(r.id)&&!core.some(u=>u.line===r.id)&&availableAt(r.id,level)&&(r.traits.some(t=>active.has(t))||UTILITY.includes(r.id)))
    .map(r=>({line:r.id,star:starAt(r.id,level),items:[],shared:r.traits.filter(t=>active.has(t)).length}))
    .sort((a,b)=>b.shared-a.shared||roster[b.line].cost-roster[a.line].cost).slice(0,7);
  // Fallback when too few trait-sharing units exist at this level: the strongest other available units.
  if(core.length+fillers.length<level+2)for(const r of [...lines].sort((a,b)=>b.cost-a.cost||a.id.localeCompare(b.id))){
    if(core.length+fillers.length>=level+2)break;
    if(finalLines.has(r.id)||core.some(u=>u.line===r.id)||fillers.some(u=>u.line===r.id)||!availableAt(r.id,level)||r.cost===5)continue;
    fillers.push({line:r.id,star:starAt(r.id,level),items:[],shared:0});
  }
  const boards=[];
  if(core.length>=level){
    const base=core.slice(0,level);boards.push(base);
    for(let i=level-1;i>=Math.max(0,level-3);i--)for(const alt of core.slice(level,level+3))boards.push(base.map((u,k)=>k===i?alt:u));
  }else{
    const need=level-core.length,base=[...core,...fillers.slice(0,need)];boards.push(base);
    for(let i=core.length;i<base.length;i++)for(const alt of fillers.slice(need,need+4))boards.push(base.map((u,k)=>k===i?alt:u));
  }
  return boards.filter(b=>b.length===level).map(b=>{const placed=arrange(b,hint);const g=gear(placed,final,level);return {...g,fromFinal:b.filter(u=>finalLines.has(u.line)).length};});
}
export async function buildTransitions(candidates,refs){
  const opp=Object.fromEntries([5,6,7,8].map(l=>[l,levelOpponents(refs,l)]));
  const result={};
  for(const level of [8,7,6,5]){
    const pairs=[],index=[];const opts={};
    for(const c of candidates){
      const final=c.boards.find(b=>b.level===9).team;
      const prev=level===8?final:result[c.id][level+1].team;
      opts[c.id]=optionsFor(final,level,prev,c);
      opts[c.id].forEach((o,k)=>{for(const r of opp[level]){pairs.push({a:o.team,b:r.team});index.push(c.id+'/'+k);}});
      result[c.id]??={};
    }
    const scores=await scorePairs(pairs,SEEDS,{label:`transitions L${level}`});
    const agg={};scores.forEach((s,i)=>(agg[index[i]]??=[]).push(s));
    for(const c of candidates){
      const scored=opts[c.id].map((o,k)=>({...o,score:agg[c.id+'/'+k].reduce((a,b)=>a+b,0)/agg[c.id+'/'+k].length}));
      if(!scored.length)throw Error(`No transition option for ${c.id} at level ${level}`);
      const best=scored.reduce((a,b)=>b.score>a.score+0.01||(Math.abs(b.score-a.score)<=0.01&&b.fromFinal>a.fromFinal)?b:a,scored[0]);
      result[c.id][level]={...best,options:scored.length};
    }
  }
  return result;
}
