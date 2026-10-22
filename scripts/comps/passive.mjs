// Passive traits and utility units: for each strong board, replace one flexible slot with a passive trait
// activator (Ghost: Mean Look, Dragon: Dragon Dance) or a utility unit (Chansey heals), and compare against
// the best higher-cost replacement for the same slot.
import {scorePairs} from './pool.mjs';
import {seedList,capItems,roster,front} from './common.mjs';
import {arrange} from './boards.mjs';
const SEEDS=seedList(4,'v34-passive');
export const UTILITY=[
  {line:'gastly',star:2,why:'Ghost 1: Mean Look, all enemies lose Defense and Sp. Def'},
  {line:'dratini',star:2,why:'Dragon 1: Dragon Dance, whole team gains Attack, Sp. Atk and Attack speed'},
  {line:'chansey',star:2,why:'Healing support'},
  {line:'ditto',star:2,why:'Copies an enemy'},
  {line:'jigglypuff',star:2,why:'Sleep control and healing'},
];
const flexSlots=team=>team.filter(u=>!(u.items?.length));
export async function passiveStudy(candidates,refs,{level=9,minGain=.025}={}){
  const pairs=[],index=[],trials=[];
  const rs=refs.filter(r=>r.level===level);
  for(const c of candidates){
    const board=c.boards.find(b=>b.level===level),team=board.team,hint=Object.fromEntries(team.map(u=>[u.line,u.cell]));
    const variants=[{kind:'published',team}];
    for(const slot of flexSlots(team)){
      for(const u of UTILITY){if(team.some(x=>x.line===u.line))continue;
        const t=team.map(x=>x===slot?{line:u.line,star:u.star,items:[],cell:slot.cell}:x);
        variants.push({kind:'utility',out:slot.line,in:u.line,why:u.why,team:t});}
      // Higher-cost alternatives for the same slot: 4 and 5 cost lines sharing a trait with the board.
      const traits=new Set(team.flatMap(x=>roster[x.line].traits));
      for(const r of Object.values(roster)){if(r.cost<4||r.branchOf||team.some(x=>x.line===r.id))continue;if(!r.traits.some(t=>traits.has(t)))continue;
        const t=team.map(x=>x===slot?{line:r.id,star:2,items:[],cell:slot.cell}:x);
        variants.push({kind:'cost',out:slot.line,in:r.id,team:arrange(t,{...hint,[r.id]:front(r.id)===front(slot.line)?slot.cell:undefined})});}
    }
    trials.push({id:c.id,variants});
    variants.forEach((v,k)=>{for(const r of rs){pairs.push({a:capItems(v.team),b:r.team});index.push([trials.length-1,k]);}});
  }
  const scores=await scorePairs(pairs,SEEDS,{label:`passive L${level}`});
  const sums={};scores.forEach((s,i)=>{const k=index[i].join('/');(sums[k]??=[]).push(s);});
  const avg=k=>sums[k].reduce((a,b)=>a+b,0)/sums[k].length;
  const results=trials.map((t,ti)=>{
    const vs=t.variants.map((v,k)=>({...v,score:avg(`${ti}/${k}`)}));const base=vs[0].score;
    const bySlot={};for(const v of vs.slice(1))(bySlot[v.out]??=[]).push(v);
    const slots=Object.entries(bySlot).map(([out,list])=>{const util=list.filter(v=>v.kind==='utility').sort((a,b)=>b.score-a.score)[0],cost=list.filter(v=>v.kind==='cost').sort((a,b)=>b.score-a.score)[0];
      return {out,bestUtility:util&&{in:util.in,why:util.why,gain:util.score-base},bestCost:cost&&{in:cost.in,gain:cost.score-base},utilityWins:!!util&&(!cost||util.score>=cost.score)};});
    const best=vs.slice(1).sort((a,b)=>b.score-a.score)[0];
    return {id:t.id,base,slots,adopt:best&&best.score-base>=minGain?{kind:best.kind,out:best.out,in:best.in,why:best.why,gain:best.score-base,team:best.team}:null};
  });
  return results;
}
