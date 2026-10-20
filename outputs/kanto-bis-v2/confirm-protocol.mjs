import {config,lines,fixturesFor,heuristic,oneBattle,setupFor,pairedComparison,key,seedFor} from './experiment.mjs';
export const confirmationConfig={contexts:8,seeds:32,sides:2,selection:'Freeze the held-out shortlist leader and runner-up from results.json. Evaluate them, the native heuristic and no-item baseline. Do not reselect using confirmation scores.'};
config.confirmation=confirmationConfig;
export const opponents=[
  ['snorlax','paras','rattata','squirtle','vulpix','chansey'],
  ['geodude','nidoran','poliwag','magnemite','oddish','jigglypuff'],
  ['slowpoke','machop','pidgey','psyduck','cubone','exeggcute'],
  ['onix','growlithe','scyther','gastly','abra','staryu'],
  ['rhyhorn','hitmonchan','aerodactyl','lapras','jynx','chansey'],
  ['seel','dratini','zubat','pikachu','shellder','mew'],
  ['sandshrew','tauros','diglett','vulpix','electabuzz','articuno'],
  ['snorlax','hitmonlee','ponyta','squirtle','magmar','mewtwo'],
];
export function confirmationFixtures(line,star){
  const inherited=fixturesFor(line,star,'validation');
  return opponents.map((ids,i)=>{
    const layout=i%3,cols=[[1,3,5,0,6,2,4],[2,3,4,0,6,1,5],[0,3,6,1,5,2,4]][layout];let f=0,b=0;
    const away=ids.map(id=>{
      const front=lines[id].range<=2,row=front?4:[6,7,5][layout],col=front?cols[f++]:cols[b++];
      return {line:id,star,cell:55-(row*7+col),items:heuristic(id,star,1)};
    });
    const ranked=away.map((u,j)=>({j,front:lines[u.line].range<=2,cost:lines[u.line].cost})).sort((a,b)=>b.cost-a.cost||a.j-b.j);
    const tank=ranked.find(x=>x.front).j,carry=ranked.find(x=>!x.front).j;
    for(const j of [tank,carry])away[j].items=heuristic(away[j].line,star,2);
    if(new Set(away.map(u=>u.cell)).size!==6)throw Error('Overlapping confirmation fixture');
    return {...inherited[i],id:'confirm-'+String(i+1).padStart(2,'0'),away};
  });
}
export function confirmState(r){
  const eligible=r.validation.filter(v=>v.items.length);
  const best=eligible.find(v=>v.key===r.bestObserved),runner=eligible.find(v=>v.key!==r.bestObserved),native=key(r.nativeItems);
  const candidates=[...new Map([best.items,runner.items,r.nativeItems,[]].map(b=>[key(b),b])).values()];
  const fixtures=confirmationFixtures(r.line,r.star),start=performance.now();
  const evaluated=candidates.map(b=>evaluateConfirmed(fixtures,b));
  const selected=evaluated.find(c=>c.key===best.key),other=evaluated.find(c=>c.key===runner.key),bot=evaluated.find(c=>c.key===native),empty=evaluated.find(c=>c.key==='empty');
  return {line:r.line,star:r.star,name:r.name,frozenLeader:best.key,frozenRunner:runner.key,battles:evaluated.reduce((n,c)=>n+c.n,0),elapsedMs:performance.now()-start,comparison:pairedComparison(selected,other),versusNative:pairedComparison(selected,bot),versusEmpty:pairedComparison(selected,empty),selected,evaluated,opponentsUsed:opponents};
}
export function evaluateConfirmed(fixtures,build){
  const result={key:key(build),items:build,n:0,wins:0,draws:0,losses:0,timeouts:0,sumTime:0,sumMargin:0,sumDamage:0,sumHealing:0,sumMitigation:0,survivals:0,contexts:[],outcomes:[]};
  for(const f of fixtures){
    const context={id:f.id,n:0,wins:0,draws:0,losses:0},setups=[setupFor(f,build,0),setupFor(f,build,1)];
    for(let i=0;i<confirmationConfig.seeds;i++)for(let side=0;side<2;side++){
      const x=oneBattle(setups[side],seedFor('confirmation',f.id,i),side);
      result.n++;context.n++;const outcome=['losses','draws','wins'][x.outcome];result[outcome]++;context[outcome]++;
      result.timeouts+=x.timeout;result.sumTime+=x.time;result.sumMargin+=x.margin;result.sumDamage+=x.damage;result.sumHealing+=x.healing;result.sumMitigation+=x.mitigation;result.survivals+=x.survived;result.outcomes.push(x.outcome);
    }
    context.score=(context.wins+context.draws/2)/context.n;result.contexts.push(context);
  }
  result.score=(result.wins+result.draws/2)/result.n;result.margin=result.sumMargin/result.n;result.damage=result.sumDamage/result.n;
  return result;
}
