// Real native shops, opponents, income, rewards, XP and elimination up to before 5-1.
import {H,data,roster,items,code,army,mass,copies,hash} from './native.mjs';
const metric=()=>({buy:0,sell:0,roll:0,xp:0,otherSpend:0,otherEarned:0,earned:data.economy.startGold,rolls:0,errors:{}});
export function campaign(seed,{plan=null,seat=0,turn=null,trace=false,seals=false}={}){
 const game=H.LocalMatch.create(seed,{level:'elite',seals:seals?'ranked':false}),ids=game.st.seats.map(s=>s.id),controlled=ids[seat%ids.length];
 const bots=Object.fromEntries(ids.map(id=>[id,H.planner.makeBot({id,profile:'elite',seed:parseInt(hash(['tempo-native-v1',seed,id]).slice(0,8),16)})]));
 game.st.bots={};game.st.next={};
 const ledgers=Object.fromEntries(ids.map(id=>[id,metric()])),paths=Object.fromEntries(ids.map(id=>[id,[]])),memory={};let rounds=0;
 const nativeAct=(id,action)=>{
  if(action.free!==undefined)throw Error('Free-roll injection forbidden');
  const old=game.me.gold,r=game.act(action),ledger=ledgers[id];
  if(r.err){ledger.errors[r.err]=(ledger.errors[r.err]??0)+1;return r;}
  const spent=old-game.me.gold;
  if(action.t==='buy')ledger.buy+=spent;
  else if(action.t==='sell')ledger.sell-=spent;
  else if(action.t==='buyXp')ledger.xp+=spent;
  else if(action.t==='reroll'){ledger.roll+=spent;ledger.rolls++;}
  else if(spent>0)ledger.otherSpend+=spent;else ledger.otherEarned-=spent;
  return r;
 };
 const nativeTurn=(bot,act,allow=()=>true)=>{
  const boon=game.st.m.boons?.[game.st.me];if(boon){const old=game.me.gold;if(!game.pickBoon(H.planner.chooseOffer(bot,game.me,boon.ids)))throw Error('Boon selection failed');ledgers[game.st.me].otherEarned+=game.me.gold-old;}
  for(let step=0;step<220;step++){
   const action=H.planner.decide(bot,game.me,H.shopContext(game),H.planningContext(game),()=>H.scout(game));if(!action)return;
   const incoming=action.t==='equip'?items[game.me.items[action.inv]]:null;
   const blocked=incoming&&mass(game.me)+(incoming.kind==='full'?2:incoming.kind==='part'?1:0)>14||!allow(action);
   const r=blocked?{err:'research-budget'}:act(action);H.planner.feedback(bot,action,r.err);
  }
  throw Error('Planner exceeded its action guard');
 };
 const finishTransition=fn=>{
  const before=Object.fromEntries(game.st.m.t.players.map(p=>[p.id,p.s.gold]));fn();
  for(const p of game.st.m.t.players){const delta=p.s.gold-before[p.id];ledgers[p.id].earned+=delta;}
 };
 const close=()=>{if(seals)game.st.bots=bots;game.closeRound();game.st.bots={};game.st.next={};};
 while(!game.over&&code(game)<=48){
  if(++rounds>60)throw Error('Round guard');
  if(game.st.stage==='carousel'){finishTransition(close);continue;}
  if(game.st.stage!=='planning')throw Error('Unexpected phase');
  const offset=(game.round.n+seat)%ids.length,order=[...ids.slice(offset),...ids.slice(0,offset)];
  for(const id of order){
   game.st.me=id;if(!game.meAlive)continue;
   const bot=bots[id],act=a=>nativeAct(id,a);
   if(id===controlled&&plan&&turn)turn({game,bot,plan,memory,act,nativeTurn:(allow)=>nativeTurn(bot,act,allow)});
   else nativeTurn(bot,act);
   const ledger=ledgers[id],balance=data.economy.startGold+(ledger.earned-data.economy.startGold)+ledger.otherEarned+ledger.sell-ledger.buy-ledger.xp-ledger.roll-ledger.otherSpend;
   if(Math.abs(balance-game.me.gold)>1e-8)throw Error('Gold ledger does not reconcile');
   const snapshot={round:game.round.stage+'-'+game.round.r,code:code(game),n:game.round.n,gold:game.me.gold,hp:game.me.hp,level:game.me.level,xp:game.me.xp,
    ...structuredClone(ledger),team:army(game.me),owned:Object.values(game.me.units).map(u=>({line:u.line,star:u.star,items:[...(u.items??[])]})),itemMass:mass(game.me),
    ...(trace&&id===controlled?{state:structuredClone(game.st),bot:structuredClone(bot)}:{})};
   paths[id].push(snapshot);
  }
  game.st.me=controlled;if(code(game)===48)break;
  finishTransition(()=>{game.startCombat();if(game.st.stage==='combat')close();});
 }
 const players=game.st.m.t.players.map(p=>({id:p.id,place:p.place,alive:p.place===null,ledger:ledgers[p.id],path:paths[p.id]}));
 if(H.networkAttempts.length)throw Error('Unexpected network');
 return {seed,seat:seat%8,seals,controlled,plan:plan?.id??null,players,policyMemory:memory};
}
