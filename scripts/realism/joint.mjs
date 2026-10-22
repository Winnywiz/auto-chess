// Joint completion probabilities share one real gold budget and native bench/merge/pool rules.
import fs from 'node:fs';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {create,shop,act,copies,roster,identity} from './native.mjs';
function trial(c,seed){
  const g=create(seed,false),me=g.st.m.t.players.find(p=>p.id===g.st.me),other=g.st.m.t.players.find(p=>p.id!==g.st.me);
  const mine={},enemy={};let next=1;
  for(const t of c.targets){for(const [bag,n,prefix]of [[mine,t.owned,'u'],[enemy,c.taken,'e']]){let left=n;for(const star of [2,1])while(left>=3**(star-1)){const id=prefix+(next++);bag[id]={id,line:t.line,star};left-=3**(star-1);}}}
  const ids=Object.keys(mine),board=Object.fromEntries(ids.slice(0,c.level).map((id,i)=>[28+i,id])),bench=ids.slice(c.level);
  me.s={...me.s,phase:'planning',round:9,level:c.level,xp:0,gold:c.gold,units:mine,board,bench:[...bench,...Array(9-bench.length).fill(null)],nextId:100};other.s={...other.s,units:enemy};g.st.stage='planning';g.st.m.t.n=9;
  Object.assign(me.s,shop.n(me.s,shop.b(g.st.m.t,g.st.me),c.level,Object.values(mine),9,0,0));
  let rolls=0;
  for(let guard=0;guard<150;guard++){
    for(let slot=0;slot<5;slot++){const t=c.targets.find(t=>t.line===g.me.shop[slot]);if(t&&copies(g.me,t.line)<t.goal){const r=act(g,{t:'buy',slot});if(r.err&&!['noGold','benchFull'].includes(r.err))throw Error(r.err);}}
    if(c.targets.every(t=>copies(g.me,t.line)>=t.goal))return {hit:true,spent:c.gold-g.me.gold,rolls};
    if(act(g,{t:'reroll'}).err)break;rolls++;
  }
  return {hit:false,spent:c.gold-g.me.gold,rolls};
}
if(!isMainThread){const out=[];for(const c of workerData.conditions){let hit=0,spent=0;for(let i=0;i<512;i++){const r=trial(c,'realism-joint-v1/'+i);hit+=r.hit;spent+=r.spent;}out.push({...c,n:512,hits:hit,rate:hit/512,meanSpend:spent/512});}parentPort.postMessage(out);}
else{
  const list=[];
  const groups=[['Ground trio',5,['diglett','geodude','nidoran'],[40,60,100]],['Gengar and Venusaur',6,['gastly','bulbasaur'],[40,60,100]],['Exeggutor and Jynx',7,['exeggcute','jynx'],[60,100]],['Exeggutor, Jynx and Venusaur',7,['exeggcute','jynx','bulbasaur'],[60,100]],['Four-upgrade Exeggutor',7,['exeggcute','abra','paras','bulbasaur'],[60,100]],['Rhydon and Starmie',8,['rhyhorn','staryu'],[40,60,100]],['Three legendary upgrades',9,['mewtwo','mew','zapdos'],[60,100,150]]];
  for(const [name,level,lines,budgets]of groups)for(const owned of roster[lines[0]].cost<=3?[3,6]:[1,2])for(const gold of budgets)for(const taken of [0,6])list.push({name,level,gold,taken,targets:lines.map(line=>({line,owned,goal:roster[line].cost<=3?9:3}))});
  const chunks=Array.from({length:12},()=>[]);list.forEach((c,i)=>chunks[i%12].push(c));const start=performance.now();
  const rows=(await Promise.all(chunks.filter(x=>x.length).map(conditions=>new Promise((resolve,reject)=>{const w=new Worker(new URL(import.meta.url),{workerData:{conditions}});w.on('error',reject);w.on('message',r=>{w.terminate();resolve(r);});})))).flat().sort((a,b)=>a.name.localeCompare(b.name)||a.gold-b.gold||a.targets[0].owned-b.targets[0].owned||a.taken-b.taken);
  const report={engineIdentity:identity,method:'Conditional joint upgrade tests. One shared gold budget includes all purchases and paid rerolls. Starting copies are already owned. Native shops, merging, field/bench room and finite contested pools. No XP, income, other units or Seals. Optimistic controlled acquisition bounds, not a complete match.',rows,seconds:(performance.now()-start)/1000};fs.writeFileSync('work/realism-v34/joint.json',JSON.stringify(report,null,2));console.log(JSON.stringify({conditions:rows.length,trials:rows.length*512,seconds:report.seconds}));
}
