// Score candidate boards against reference groups and cross-tag peers at levels 8 and 9.
import {scorePairs} from './pool.mjs';
import {seedList,capItems} from './common.mjs';
export const SCORE_SEEDS=seedList(12,'v34-score');
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN;
export function tierOf(s){
  if(s.score>=.65&&s.peerScore>=.55&&Object.values(s.groups).every(g=>g>=.5))return 'S';
  return s.score>=.5?'A':'B';
}
// candidates: [{id,family,boards:[{level,team}]}]; refs: [{id,group,level,team}]
export async function scoreAll(candidates,refs,{seeds=SCORE_SEEDS,levels=[8,9],label='score'}={}){
  const out=Object.fromEntries(candidates.map(c=>[c.id,{}]));
  for(const level of levels){
    const cands=candidates.map(c=>({...c,team:capItems(c.boards.find(b=>b.level===level).team)}));
    const rs=refs.filter(r=>r.level===level);
    const refPairs=[];for(const c of cands)for(const r of rs)refPairs.push({c:c.id,r,a:c.team,b:r.team});
    const peerPairs=[];for(let i=0;i<cands.length;i++)for(let j=i+1;j<cands.length;j++)if(cands[i].family!==cands[j].family)peerPairs.push({i,j,a:cands[i].team,b:cands[j].team});
    const refScores=await scorePairs(refPairs,seeds,{label:`${label} L${level} references`});
    const peerScores=await scorePairs(peerPairs,seeds,{label:`${label} L${level} cross-tag`});
    for(const c of cands){
      const groups={};
      refPairs.forEach((p,k)=>{if(p.c===c.id)(groups[p.r.group]??=[]).push(refScores[k]);});
      const vsRef=Object.fromEntries(refPairs.map((p,k)=>[p,k]).filter(([p])=>p.c===c.id).map(([p,k])=>[p.r.id,refScores[k]]));
      const fam={};
      peerPairs.forEach((p,k)=>{const ci=cands[p.i].id===c.id,cj=cands[p.j].id===c.id;if(!ci&&!cj)return;const other=cands[ci?p.j:p.i];(fam[other.family]??=[]).push(ci?peerScores[k]:1-peerScores[k]);});
      const g=Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,mean(v)]));
      const reference=mean(Object.values(g)),peerScore=mean(Object.values(fam).map(mean));
      const s={level,score:(reference+peerScore)/2,referenceOnly:reference,peerScore,groups:g,families:Object.fromEntries(Object.entries(fam).map(([k,v])=>[k,mean(v)])),vsRef,n:refPairs.filter(p=>p.c===c.id).length*seeds.length*2,peerN:Object.values(fam).flat().length*seeds.length*2};
      s.tier=tierOf(s);out[c.id][level]=s;
    }
  }
  return out;
}
