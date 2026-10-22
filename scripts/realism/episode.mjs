import {create,hash,copies,snapshot,fullCount,roster,family} from './native.mjs';
import {makePlan,planning} from './policy.mjs';
export function episode(row,seed,{mode='practical',seals=false,itemCap=6,trace=false}={}){
  const g=create(seed,seals),p=makePlan(row,mode,itemCap),levels={},checkpoints={},hits={},logs=[];
  let rounds=0,fights=0,aliveRounds=0,last=null,exactCapHit=false;
  while(!g.over){
    if(++rounds>150)throw Error('Native full match exceeded round guard');
    if(g.st.stage==='carousel'){g.closeRound();continue;}
    if(g.st.stage!=='planning')throw Error('Unexpected phase '+g.st.stage);
    if(g.meAlive){
      planning(g,p);aliveRounds++;
      const army=snapshot(g.me),at={round:g.round.stage+'-'+g.round.r,n:g.round.n,level:g.me.level,hp:g.me.hp,gold:g.me.gold,items:fullCount(army),team:army,
        copies:Object.fromEntries(p.final.map(u=>[u.line,copies(g.me,u.line)]))};
      levels[g.me.level]=at;last=at;
      if([21,32,42,52].includes(g.round.stage*10+g.round.r))checkpoints[at.round]=at;
      for(const u of p.final)if(!hits[u.line]&&Object.values(g.me.units).some(v=>v.line===u.line&&v.star>=u.star))hits[u.line]={round:at.round,level:g.me.level};
      if(p.final.every(u=>army.some(v=>v.line===u.line&&v.star>=u.star)))exactCapHit=true;
      if(trace)logs.push({...at,shop:[...g.me.shop],bench:g.me.bench.map(id=>id?g.me.units[id]:null),inventory:[...g.me.items],sealState:g.me.seals??null});
    }
    g.startCombat();fights+=g.st.staged?.fights.length??0;
    if(g.st.stage==='combat')g.closeRound();
  }
  const primaryGoal=p.final.find(u=>u.line===row.carry)?.star??2;
  return {id:row.id,seed,mode,seals,itemCap,place:g.meP.place,rounds,fights,aliveRounds,last,levels,checkpoints,hits,
    carryHit:!!hits[row.carry],allUpgradeHit:p.upgrades.every(l=>!!hits[l]),exactCapHit,allTargetsEverHit:p.final.every(u=>!!hits[u.line]),primaryGoal,
    actions:p.actions,errors:p.errors,filtered:p.filtered,rollsByLevel:p.rollsByLevel,xpGold:p.xpGold,buyGold:p.buyGold,rollGold:p.rollGold,sellGold:p.sellGold,sealPicks:p.sealPicks,digest:hash(g.st),...(trace?{logs}:{})};
}
