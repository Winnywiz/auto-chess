import {read,write,roster} from './native.mjs';
const economy={plans:[...read('economy-screen-v1.json').plans,...read('economy-budget-v1.json').plans]},rows=[...read('equipped-candidates.json'),...read('budget-candidates.json')];
const conditional=read('conditional-budgets.json').results;
const selected=[],comparisons=[];
for(const carry of new Set(rows.map(r=>r.carry))){
 const options=rows.filter(r=>r.carry===carry).map(r=>{
  const e=economy.plans.find(e=>e.id===r.id);
  // Screening criterion only. The independent combat and acquisition runs follow.
  const q=conditional.find(q=>q.id===r.id),success=q?.rate??e.completeRate;
  const utility=r.equipmentScreen.carry*(.5+.5*success)-.025*Math.max(0,r.upgrades.length-1);
  return {...r,screenEconomy:{...e,rows:undefined},conditional:q?{...q,runs:undefined}:null,selectionUtility:utility};
 }).sort((a,b)=>b.selectionUtility-a.selectionUtility||b.screenEconomy.completeRate-a.screenEconomy.completeRate);
 comparisons.push(...options.map(r=>({id:r.id,carry,level:r.level,upgrades:r.upgrades,score:r.equipmentScreen.carry,selectionUtility:r.selectionUtility,complete:r.screenEconomy.completeRate,carryRate:r.screenEconomy.carryRate})));
 const feasible=options.filter(r=>r.screenEconomy.completeRate>=.25&&r.screenEconomy.carryRate>=.5||r.conditional?.rate>=.55);
 const best=feasible[0];
 if(best&&best.equipmentScreen.carry>=.45)selected.push(best);
}
selected.sort((a,b)=>b.selectionUtility-a.selectionUtility);
write('selected.json',selected.slice(0,28));write('selection-comparisons.json',comparisons);
console.log(JSON.stringify({selected:selected.length,rows:selected.slice(0,28).map(r=>[r.carry,r.level,r.upgrades.length,r.screenEconomy.completeRate,r.screenEconomy.carryRate,Math.round(r.equipmentScreen.carry*100)])}));
