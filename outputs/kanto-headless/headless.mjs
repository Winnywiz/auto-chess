// Adapter for the exact public build recorded in manifest.json. No browser shims.
import {createHash} from 'node:crypto';
// Fail closed if a future build tries to use networking or ambient randomness.
globalThis.fetch=()=>{throw new Error('Network disabled in headless harness');};
globalThis.WebSocket=class{constructor(){throw new Error('WebSocket disabled');}};
Math.random=()=>{throw new Error('Unseeded Math.random disabled');};
const sim=await import('./assets/sim-Bvc9Kbpb.js');
const local=await import('./assets/engine-ABFYxYqB.js');
sim.b(); // lazy initializer: creates exported battle class sim.c
local.a(); // local-match initializer; avoids UI/store initializer local.t()
export const Battle=sim.c;
export const LocalMatch=local.r;
export const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const fixtures={
  duel:{home:[{line:'bulbasaur',star:1,cell:31}],away:[{line:'charmander',star:1,cell:24}]},
  six:{home:['bulbasaur','squirtle','pikachu','abra','geodude','pidgey'].map((line,i)=>({line,star:2,cell:28+i,items:i===0?['leftovers']:[]})),away:['charmander','oddish','gastly','machop','onix','staryu'].map((line,i)=>({line,star:2,cell:21-i,items:i===0?['choice-band']:[]}))},
  nine:{home:['bulbasaur','squirtle','pikachu','abra','geodude','pidgey','dratini','lapras','gastly'].map((line,i)=>({line,star:3,cell:28+i,items:i<3?['leftovers','choice-specs']:[]})),away:['charmander','oddish','gastly','machop','onix','staryu','rhyhorn','jynx','magikarp'].map((line,i)=>({line,star:3,cell:27-i,items:i<3?['choice-band','shell-bell']:[]}))}
};
export function fight(setup=fixtures.duel,seed=123){
  const b=new Battle(setup.home,setup.away,seed,setup.weather??null);
  b.start();let steps=0;
  while(!b.over){b.step();if(++steps>10000)throw new Error('Battle exceeded step guard');}
  return b;
}
export function battleDigest(b){return hash({winner:b.winner,time:b.time,rng:b.rngState,units:b.units,events:b.events});}
export function create(seed='example'){return LocalMatch.create(seed,{level:'entrenador'});}

// Deliberately simple deterministic human-seat policy. Seven native bots retain
// their native profiles. No gold, HP, units, odds, RNG, or rules are injected.
export function greedy(g,counts={}){
  if(!g.meAlive)return;
  const act=a=>{const r=g.act(a);const k=a.t+(r.err?':'+r.err:'');counts[k]=(counts[k]??0)+1;return r;};
  if(g.st.m.boons[g.st.me])g.pickBoon(0);
  if(g.me.coins?.left>0)act({t:'collectCoins'});
  if(g.me.itemReward)act({t:'pickItem',i:0});
  const buy=()=>{for(let n=0;n<12;n++){
    if(!g.me.bench.includes(null))break;
    let ok=false;
    for(let slot=0;slot<5;slot++)if(g.me.shop[slot]&&!act({t:'buy',slot}).err){ok=true;break;}
    if(!ok)break;
  }};
  buy();
  if(g.me.gold>=14&&g.me.level<9)act({t:'buyXp'});
  if(g.me.gold>=22){act({t:'reroll'});buy();}
  act({t:'autoPlace'});
  for(let n=0;n<8&&g.me.items.length;n++){
    const ids=Object.values(g.me.board);let ok=false;
    for(let inv=0;inv<g.me.items.length&&!ok;inv++)
      for(const id of ids)if(!act({t:'equip',inv,id}).err){ok=true;break;}
    if(!ok)break;
  }
}
export function runGame(seed='example',{trace=false}={}){
  const g=create(seed),logs=[],actions={};let rounds=0,fights=0,combatRounds=0;
  while(!g.over){
    if(rounds++>=200)throw new Error('Match exceeded round guard');
    const n=g.st.m.t.n,kind=g.round.kind;
    if(g.st.stage==='planning'){
      greedy(g,actions);g.startCombat();combatRounds++;
      const fs=g.st.staged?.fights??[];fights+=fs.length;
      if(trace)logs.push({n,kind,fights:structuredClone(fs)});
      if(g.st.stage==='combat')g.closeRound();
    }else if(g.st.stage==='carousel'){
      // Native closeRound -> stageRound supplies seeded default gifts/picks.
      g.closeRound();if(trace)logs.push({n,kind});
    }else throw new Error('Unexpected stage '+g.st.stage);
  }
  const players=g.st.m.t.players.map(p=>({id:p.id,hp:p.s.hp,place:p.place,level:p.s.level,gold:p.s.gold,units:p.s.units}));
  return {seed,rounds,combatRounds,fights,actions,players,terminal:g.over,digest:hash(g.st),...(trace?{logs}:{})};
}
