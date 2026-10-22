import fs from 'node:fs';
import vm from 'node:vm';
import {act,roster,data,items,family,copies,snapshot,fullCount,planner,core,shop,elite,hash} from './native.mjs';
const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../../seals-data.js',import.meta.url),'utf8'),context);
const seals=context.window.KANTO_SEALS;
export function makePlan(row,mode='practical',itemCap=6){
  const final=row.boards.find(b=>b.level===9).team,traits={};for(const u of final)for(const t of roster[u.line].traits)traits[t]=(traits[t]??0)+1;
  const fav=Object.keys(traits).sort((a,b)=>traits[b]-traits[a]).slice(0,2);
  return {row,mode,itemCap,final,fav,upgrades:final.filter(u=>u.star===3).map(u=>u.line),actions:{},errors:{},filtered:{},rollsByLevel:{},xpGold:0,buyGold:0,rollGold:0,sellGold:0,sealPicks:[],bot:null};
}
function targetCopies(g,p,line){
  const f=p.final.find(u=>family(u.line)===family(line));if(!f||f.star<3)return 3;
  if(p.mode==='cap-chase'||family(line)===family(p.row.carry))return 9;
  const n=copies(g.me,line),window=roster[line].cost===1?5:roster[line].cost===2?6:7;
  return n>=6?9:g.me.level<=window&&n>=5?9:3;
}
function action(g,p,a){const before=g.me.gold,r=act(g,a);if(r.err){p.errors[r.err]=(p.errors[r.err]??0)+1;return r;}
  p.actions[a.t]=(p.actions[a.t]??0)+1;const spent=before-g.me.gold;
  if(a.t==='reroll'){p.rollGold+=spent;p.rollsByLevel[g.me.level]=(p.rollsByLevel[g.me.level]??0)+1;}
  if(a.t==='buyXp')p.xpGold+=spent;if(a.t==='buy')p.buyGold+=spent;if(a.t==='sell')p.sellGold-=spent;
  return r;
}
export function planning(g,p){
  if(!p.bot)p.bot=planner.makeBot({id:g.st.me,profile:'elite',seed:parseInt(hash([g.st.seed,'controller-v1']).slice(0,8),16),fav:p.mode==='control'?undefined:p.fav,
    over:p.mode==='control'?{}:{commit:false,favLines:p.final.map(u=>family(u.line)),favLineWeight:4,favWeight:2.5},
    sealFav:p.mode==='control'?undefined:(seals.recommendations[p.row.id]?.[9]?.picks??[]).map(x=>x.id)});
  const bot=p.bot,code=g.round.stage*10+g.round.r,roll=p.row.rollLevel;
  const done=p.mode==='cap-chase'?p.upgrades.every(l=>copies(g.me,l)>=9):copies(g.me,p.row.carry)>=(roll&&roster[p.row.carry].cost<=3?9:3);
  const bail=p.mode==='practical'&&roll&&code>=44&&copies(g.me,p.row.carry)<6;
  if(p.mode!=='control'){
    bot.cfg.levelCurve=[[13,3],[22,4],[28,5],[34,6],[38,7],[p.row.category==='legendary'?44:48,8],[99,p.row.category==='legendary'?9:8]];
    if(roll&&!done&&!bail)bot.cfg.levelCurve=bot.cfg.levelCurve.map(([r,l])=>[r,Math.min(l,roll)]);
    bot.cfg.rerollPlan=roll&&!done&&!bail?(roll===7?'hyper3':'hyper'):p.row.category==='legendary'?'late':'normal';
    bot.cfg.levelPlan=roll&&!done&&!bail?'reroll':p.row.category==='legendary'?'fastlate':'normal';
    bot.cfg.hold=[10,20,40,50];bot.cfg.holdHp=40;
  }
  if(g.st.m.boons[g.st.me])g.pickBoon(0);
  const offer=g.st.m.seals?.[g.st.me];if(offer){
    const ids=offer.ids??offer.cards??[],plan=seals.recommendations[p.row.id]?.[9],preferred=[...(plan?.picks??[]),...(plan?.alternatives?.flat()??[])].map(x=>x.id);
    let index=planner.chooseOffer(bot,g.me,ids);
    if(p.mode!=='control'){const ranked=ids.map((id,i)=>({i,rank:preferred.indexOf(id)})).filter(x=>x.rank>=0).sort((a,b)=>a.rank-b.rank);if(ranked.length)index=ranked[0].i;}
    if(g.pickSeal(index))p.sealPicks.push({round:g.round.stage+'-'+g.round.r,offer:[...ids],selected:index});
  }
  for(let guard=0;guard<180;guard++){
    // Buy visible copies of the chosen carry before allowing the native planner to pivot elsewhere.
    const slot=p.mode==='control'?-1:g.me.shop.findIndex(line=>line===p.row.carry&&copies(g.me,line)<targetCopies(g,p,line)&&roster[line].cost<=g.me.gold);
    const direct=slot>=0&&!bot.turn.ban.includes('priority-'+slot);
    const a=direct?{t:'buy',slot}:planner.decide(bot,g.me,shop.b(g.st.m.t,g.st.me),core.ct(g.st.m),()=>elite.t(g.st.m.t,g.st.me));if(!a)break;
    let reason=null;
    if(p.mode!=='control'&&a.t==='buy'){
      const line=g.me.shop[a.slot];if(line&&copies(g.me,line)>=targetCopies(g,p,line))reason='upgrade-limit';
    }
    if(p.mode!=='control'&&a.t==='buyXp'&&roll&&!done&&!bail&&g.me.level>=roll)reason='hold-reroll-level';
    if(a.t==='equip'){
      const item=g.me.items[a.inv],u=g.me.units[a.id];
      const mass=Object.values(g.me.units).flatMap(u=>u.items??[]).reduce((n,i)=>n+(items[i]?.kind==='full'?2:items[i]?.kind==='part'?1:0),0);
      const incoming=items[item]?.kind==='full'?2:items[item]?.kind==='part'?1:0;
      if(mass+incoming>p.itemCap*2)reason='item-budget';
    }
    if(reason){p.filtered[reason]=(p.filtered[reason]??0)+1;planner.feedback(bot,a,'policy-limit');continue;}
    const r=action(g,p,a);planner.feedback(bot,a,r.err);if(direct&&r.err)bot.turn.ban.push('priority-'+slot);
  }
}
