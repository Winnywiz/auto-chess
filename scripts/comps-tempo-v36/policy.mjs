// Acquisition controller for the study, not a promoted gameplay bot.
import {H,data,roster,family,copies,code} from './native.mjs';
const line=data.economy.interestMax*data.economy.interestStep;
const resume=bot=>{if(bot.turn){bot.turn.stage='loopPass';bot.turn.ban=[];bot.turn.acts=0;}};
export function planTurn({game,bot,plan,memory,act,nativeTurn}){
 const round=code(game),targetFamilies=new Map(plan.team.map(u=>[family(u.line),u]));
 const carryFamily=family(plan.carry),rollLevel=plan.rollLevel??8;
 const carryGoal=3**((plan.carryStar??plan.team.find(u=>u.line===plan.carry).star)-1);
 const held=(id)=>roster[id].branchOf?Object.values(game.me.units).filter(u=>u.line===id).reduce((n,u)=>n+3**(u.star-1),0):copies(game.me,id);
 const upgraded=()=>plan.upgrades.every(id=>held(id)>=9);
 const coreReady=()=>plan.team.every(u=>held(u.line)>=3**(u.star-1));
 if(plan.rollLevel&&round>=44&&copies(game.me,plan.carry)<6)memory.bailed=true;
 const mainReady=copies(game.me,plan.carry)>=carryGoal;
 let desired=round<=13?3:round<27?4:round<31?5:round<41?Math.min(rollLevel,6):rollLevel;
 if((plan.rollLevel===7||!plan.rollLevel)&&round>=34)desired=7;
 if(plan.rollLevel&&upgraded()&&mainReady&&round>=31)desired=Math.min(plan.level,Math.max(rollLevel,round>=41?plan.level:rollLevel));
 if(!plan.rollLevel&&round>=41)desired=8;
 if(memory.bailed)desired=Math.min(plan.level,Math.max(rollLevel,round>=44?plan.level:rollLevel));
 desired=Math.min(desired,plan.level);
 const reserve=round<23?10:round<31?20:round<41?line:round<51?20:0;
 memory.baseFav??=structuredClone(bot.fav);
 Object.assign(bot.cfg,{commit:false,favLines:[...targetFamilies.keys()],favLineWeight:round<31?2:5,favWeight:round<31?1:2.5,
  levelCurve:[[99,desired]],reservePlan:'interest',hold:[reserve,reserve,reserve,reserve],holdHp:35,strictHold:true,
  rerollPlan:'never',streakSpend:undefined,noise:0.1});
 bot.fav=round<31?memory.baseFav:[plan.target];
 if(roster[plan.carry].branchOf){bot.eeveeKeep=false;if(game.me.eeveeKeep)act({t:'eeveeKeep',on:false});}
 const limit=slot=>{
  const id=game.me.shop[slot];if(!id||!roster[id])return false;
  const target=targetFamilies.get(family(id));if(!target)return false;
  const goal=target.star===3?9:3**(target.star-1);
  return copies(game.me,id)<goal;
 };
 const allow=action=>{
  if(['buyXp','reroll'].includes(action.t))return false;
  if(action.t==='buy'){
   const id=game.me.shop[action.slot],target=id&&targetFamilies.get(family(id));
   if(target&&copies(game.me,id)>=3**(target.star-1))return false;
   if(!target&&round>=27&&Object.keys(game.me.board).length>=game.me.level&&copies(game.me,id)===0)return false;
  }
  if(action.t==='sell'){
   const u=game.me.units[action.id],target=u&&targetFamilies.get(family(u.line));
   if(target)return false;
  }
  return true;
 };
 function buyTargets(){
  let bought=false;
  const slots=game.me.shop.map((id,slot)=>({id,slot})).filter(({slot})=>limit(slot)).sort((a,b)=>{
   const rank=id=>(family(id)===carryFamily?20:0)+(targetFamilies.get(family(id))?.star===3?5:0)+copies(game.me,id)*.2;
   return rank(b.id)-rank(a.id)||a.slot-b.slot;
  });
  for(const {id,slot}of slots){if(!limit(slot)||game.me.gold<roster[id].cost)continue;
   if(!act({t:'buy',slot}).err)bought=true;
  }
  return bought;
 }
 buyTargets();nativeTurn(allow);
 const hp=game.me.hp,floor=round>=47?0:hp<=35&&round>=31?0:Math.max(10,reserve-30);
 // XP is bought only through the engine, with native costs and natural XP retained.
 for(let i=0;i<24&&game.me.level<desired&&game.me.gold>=floor+4;i++)if(act({t:'buyXp'}).err)break;
 resume(bot);buyTargets();nativeTurn(allow);
 const canRoll=round>=(rollLevel===5?27:31)&&game.me.level>=(memory.bailed?Math.min(plan.level,rollLevel):rollLevel);
 if(canRoll){
  const tank=plan.team.find(u=>u.assignment==='Tank'),stable=copies(game.me,plan.carry)>=3&&(!tank||copies(game.me,tank.line)>=3);
  const rollFloor=round>=47?0:hp<=35?0:round>=44?10:round>=41?20:stable?line:30;
  for(let i=0;i<70&&!coreReady()&&game.me.gold>=rollFloor+data.economy.rerollCost+1;i++){
   if(act({t:'reroll'}).err)break;buyTargets();resume(bot);nativeTurn(allow);
  }
 }
 // Field acquired targets without substituting an unupgraded rare support for an upgraded holder.
 const owned=Object.values(game.me.units),chosen=[];
 for(const target of [...plan.team].sort((a,b)=>(b.line===plan.carry)-(a.line===plan.carry)||(b.assignment==='Tank')-(a.assignment==='Tank')||b.star-a.star)){
  const u=owned.filter(u=>u.line===target.line).sort((a,b)=>b.star-a.star||(b.items?.length??0)-(a.items?.length??0))[0];
  if(u&&(u.star>=2||target.line===plan.carry||game.me.level>=8))chosen.push({u,target});
 }
 for(const {u,target}of chosen.slice(0,game.me.level)){
  const fielded=Object.values(game.me.board).includes(u.id),occupant=game.me.board[target.cell];
  if(!fielded&&occupant&&chosen.some(x=>x.u.id===occupant))continue;
  act({t:'toBoard',id:u.id,cell:target.cell});
 }
 memory.last={round,level:game.me.level,mainReady,upgraded:upgraded(),coreReady:coreReady(),bailed:!!memory.bailed};
}
