// Research controller: actual native actions only, with different XP/roll schedules for tempo and reroll.
import {H,data,roster,family,copies,code} from '../comps-tempo-v36/native.mjs';
import {planTurn as rerollTurn} from '../comps-tempo-v36/policy.mjs';
const interest=data.economy.interestMax*data.economy.interestStep;
const resume=bot=>{if(bot.turn){bot.turn.stage='loopPass';bot.turn.ban=[];bot.turn.acts=0;}};
export function planTurn(ctx){
 const {game,bot,plan,memory,act,nativeTurn}=ctx;
 if(plan.category.startsWith('reroll'))return rerollTurn(ctx);
 const r=code(game),targets=new Map(plan.team.map(u=>[family(u.line),u]));
 const goal=u=>3**(u.star-1),held=line=>copies(game.me,line);
 const carry=plan.team.find(u=>u.assignment==='Carry'),tank=plan.team.find(u=>u.assignment==='Tank');
 let desired=r<21?3:r<27?4:r<31?5:r<34?6:r<41?7:plan.level;
 desired=Math.min(desired,plan.level);
 const hp=game.me.hp,emergency=hp<=35&&r>=31,reserve=r<27?10:r<34?20:r<41?interest:r<47?20:0;
 Object.assign(bot.cfg,{commit:false,favLines:[...targets.keys()],favLineWeight:r<31?2:5,favWeight:2,levelCurve:[[99,desired]],reservePlan:'interest',hold:[reserve,reserve,reserve,reserve],holdHp:35,strictHold:true,rerollPlan:'never',noise:0.1});
 const allow=a=>{
  if(['buyXp','reroll'].includes(a.t))return false;
  if(a.t==='buy'){const id=game.me.shop[a.slot],t=id&&targets.get(family(id));if(t&&held(id)>=goal(t))return false;if(!t&&game.me.level>=plan.level&&Object.keys(game.me.board).length>=game.me.level&&held(id)===0)return false;}
  if(a.t==='sell'){const u=game.me.units[a.id];if(u&&targets.has(family(u.line)))return false;}
  return true;
 };
 const buy=()=>{const slots=game.me.shop.map((id,slot)=>({id,slot,t:id&&targets.get(family(id))})).filter(x=>x.t&&held(x.id)<goal(x.t)).sort((a,b)=>(b.t.assignment==='Carry')-(a.t.assignment==='Carry')||(b.t.assignment==='Tank')-(a.t.assignment==='Tank')||held(b.id)-held(a.id));for(const s of slots)if(game.me.gold>=roster[s.id].cost)act({t:'buy',slot:s.slot});};
 buy();nativeTurn(allow);
 const floor=r>=41||emergency?0:Math.max(10,reserve-10);
 for(let i=0;i<40&&game.me.level<desired&&game.me.gold>=floor+4;i++)if(act({t:'buyXp'}).err)break;
 resume(bot);buy();nativeTurn(allow);
 const core=()=>held(carry.line)>=3&&held(tank.line)>=3;
 const rollNow=game.me.level>=plan.level||r>=34&&emergency;
 if(rollNow){const rollFloor=r>=47||emergency?0:game.me.level<plan.level?20:core()?interest:20;
  for(let i=0;i<100&&game.me.gold>=rollFloor+data.economy.rerollCost+1;i++){
   if(plan.team.every(u=>held(u.line)>=goal(u)))break;
   if(act({t:'reroll'}).err)break;buy();resume(bot);nativeTurn(allow);
  }
 }
 // Upgraded holders stay fielded until the desired two-star replacement exists.
 const owned=Object.values(game.me.units),chosen=plan.team.map(target=>({target,u:owned.filter(u=>u.line===target.line&&u.star>=2).sort((a,b)=>b.star-a.star)[0]})).filter(x=>x.u);
 for(const {u,target}of chosen.slice(0,game.me.level))act({t:'toBoard',id:u.id,cell:target.cell});
 memory.last={round:r,level:game.me.level,core:core(),complete:plan.team.every(u=>held(u.line)>=goal(u))};
}
