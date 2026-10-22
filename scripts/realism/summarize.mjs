import fs from 'node:fs';
import {roster,data} from './native.mjs';
const input=JSON.parse(fs.readFileSync('work/realism-v34/matches.json'));
const html=fs.readFileSync('compositions.html','utf8'),comps=JSON.parse(html.match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const byId=Object.fromEntries(comps.rows.map(r=>[r.id,r])),groups={};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const fraction=(a,f)=>a.filter(f).length/a.length;
const counts=team=>{const out={},seen=new Set();for(const u of team){if(seen.has(u.line))continue;seen.add(u.line);for(const t of roster[u.line].traits)out[t]=(out[t]??0)+1;}return out;};
const wilson=(p,n)=>{const z=1.96,d=1+z*z/n,m=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [m-h,m+h];};
for(const r of input.results)(groups[[r.id,r.mode,r.seals,r.itemCap].join('/') ]??=[]).push(r);
const summaries=Object.entries(groups).map(([key,a])=>{
  const r=a[0],row=byId[r.id],final=row.boards.find(b=>b.level===9).team,traitCounts=counts(final),goals=Object.fromEntries(Object.entries(traitCounts).map(([t,n])=>[t,data.traits[t].thresholds.filter(x=>x<=n).at(-1)]).filter(([,n])=>n));
  const top4=fraction(a,x=>x.place<=4),carry=fraction(a,x=>x.carryHit);
  return {key,id:r.id,name:row.name,strategy:row.strategy,mode:r.mode,seals:r.seals,itemCap:r.itemCap,n:a.length,
    capCombatScore:row.stages.find(s=>s.level===9).score,carryTargetStar:a[0].primaryGoal,meanPlacement:mean(a.map(x=>x.place)),top4,top4Interval:wilson(top4,a.length),wins:fraction(a,x=>x.place===1),carryHit:carry,carryInterval:wilson(carry,a.length),
    carryHitAtRollLevel:row.rollLevel?fraction(a,x=>x.hits[row.carry]?.level<=row.rollLevel):null,
    allUpgradeHit:final.some(u=>u.star===3)?fraction(a,x=>x.allUpgradeHit):null,exactCapUnits:fraction(a,x=>x.exactCapHit),allTargetsEverHit:fraction(a,x=>x.allTargetsEverHit),
    levelRates:Object.fromEntries([5,6,7,8,9].map(l=>[l,fraction(a,x=>!!x.levels[l])])),
    aliveAt:Object.fromEntries(['3-2','4-2','5-2'].map(s=>[s,fraction(a,x=>!!x.checkpoints[s])])),
    carryOnLastBoard:fraction(a,x=>x.last?.team.some(u=>u.line===row.carry)),
    carryAtGoalOnLastBoard:fraction(a,x=>x.last?.team.some(u=>u.line===row.carry&&u.star>=x.primaryGoal)),
    meanFinalLineFraction:mean(a.filter(x=>x.last).map(x=>x.last.team.filter(u=>final.some(f=>f.line===u.line)).length/x.last.team.length)),
    meanLastItems:mean(a.filter(x=>x.last).map(x=>x.last.items)),meanTop4LastItems:mean(a.filter(x=>x.place<=4&&x.last).map(x=>x.last.items)),
    meanXpGold:mean(a.map(x=>x.xpGold)),meanRollGold:mean(a.map(x=>x.rollGold)),meanPurchaseGold:mean(a.map(x=>x.buyGold)),
    breakpointRates:Object.fromEntries(Object.entries(goals).map(([t,n])=>[`${t} ${n}`,fraction(a,x=>x.last&&(counts(x.last.team)[t]??0)>=n)])),
    refusedActions:a.reduce((s,x)=>{for(const [k,n]of Object.entries(x.errors))s[k]=(s[k]??0)+n;return s;},{}),
    lastItemOverBudget:a.filter(x=>Object.values(x.levels).some(s=>s.items>x.itemCap)).length,
    sealFrequency:a.reduce((s,x)=>{for(const p of x.sealPicks){const id=p.offer[p.selected];s[id]=(s[id]??0)+1;}return s;},{})};
});
const report={metadata:input.metadata,summaries};fs.writeFileSync('work/realism-v34/summary.json',JSON.stringify(report,null,2));
fs.mkdirSync('../../outputs',{recursive:true});const out='../../outputs/realism-v34';fs.mkdirSync(out,{recursive:true});
const csvValue=x=>'"'+String(x??'').replaceAll('"','""')+'"';
const columns=['id','name','strategy','mode','seals','itemCap','n','capCombatScore','carryTargetStar','meanPlacement','top4','wins','carryHit','carryHitAtRollLevel','allUpgradeHit','exactCapUnits','carryOnLastBoard','meanFinalLineFraction','meanLastItems','meanTop4LastItems','meanRollGold','meanXpGold'];
fs.writeFileSync(out+'/compositions.csv',[columns.join(','),...summaries.map(r=>columns.map(k=>csvValue(r[k])).join(','))].join('\n'));
const shops=JSON.parse(fs.readFileSync('work/realism-v34/shops.json')),shopCols=['line','cost','level','gold','owned','taken','goal','n','rate','meanSpend','meanRolls','meanBought'];
fs.writeFileSync(out+'/shop-probabilities.csv',[shopCols.join(','),...shops.rows.map(r=>shopCols.map(k=>csvValue(r[k])).join(','))].join('\n'));
fs.writeFileSync(out+'/summary.json',JSON.stringify(report));fs.writeFileSync(out+'/shop-probabilities.json',JSON.stringify(shops));
for(const category of ['Reroll 5','Reroll 6','Reroll 7','Fast 8','Legendary']){
  const group=summaries.filter(r=>r.strategy===category&&r.mode==='practical'&&!r.seals&&r.itemCap===6).sort((a,b)=>b.top4-a.top4||b.carryHit-a.carryHit);
  console.log(category,JSON.stringify(group.slice(0,3).map(r=>({id:r.id,top4:r.top4,carry:r.carryHit,level8:r.levelRates[8],fit:r.meanFinalLineFraction}))));
}
console.log(JSON.stringify({games:input.results.length,summaries:summaries.length,output:out}));
