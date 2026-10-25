// Run from the repository. KANTO_NATIVE_ROOT defaults to work/native-v34 (the Version 34 headless harness).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import os from 'node:os';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {execFileSync} from 'node:child_process';

const pageRules=JSON.parse(fs.readFileSync('compositions.html','utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).gameRules;
const root=path.resolve(process.env.KANTO_NATIVE_ROOT||'work/native-v'+pageRules);
const harness=await import(pathToFileURL(path.join(root,'headless.mjs')));
if(harness.rules!==pageRules)throw Error('Page and replay engine versions differ');
const routeFile=fs.readdirSync(path.join(root,'assets')).find(f=>/^route-.*\.js$/.test(f));
const {Battle}=harness,rosterNative=harness.roster,typeEffect=harness.route[pageRules===36?'Es':pageRules===35?'Ds':'ps'];
if(typeof typeEffect!=='function'||typeEffect('Fire',['Grass'])!==2||typeEffect('Normal',['Ghost'])!==0)throw Error('Native type-effectiveness interface changed');
const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const seedFor=(level,a,b,i)=>parseInt(hash(['sa-matchups-v1',level,a,b,i]).slice(0,8),16);
const flip=team=>team.map(u=>({...u,cell:Math.floor(u.cell/7)*7+6-u.cell%7}));
const mirror=team=>team.map(u=>({...u,cell:55-u.cell}));
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const round=x=>Math.round(x*1000)/1000;
function interval(values){
 let state=712367;const samples=[];
 for(let k=0;k<1200;k++){let sum=0;for(let i=0;i<values.length;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;sum+=values[Math.floor(state/4294967296*values.length)];}samples.push(sum/values.length);}
 samples.sort((a,b)=>a-b);return [round(samples[30]),round(samples[1169])];
}
const cc=u=>['stun','freezeT','fearT','rechargeT','airborneT','confuseT'].some(k=>u[k]>0);
class MeasuredBattle extends Battle{
 emit(e){
  if(!this.observed)return;
  if(e.k==='cast'&&this.firstCast[e.src]===undefined)this.firstCast[e.src]=e.t;
  if(e.k==='dmg'&&e.src>0){const u=this.units.find(u=>u.uid===e.src);if(u){const m=this.observed[u.team];m.damage+=e.amount;if(e.eff>1)m.superDamage+=e.amount;if(e.eff>0&&e.eff<1)m.resistedDamage+=e.amount;}}
 }
}
function setup(a,b,layout,side){
 const at=layout==='own-flip'?flip(a.team):a.team,bt=layout==='enemy-flip'?flip(b.team):b.team;
 return side?{home:bt,away:mirror(at)}:{home:at,away:mirror(bt)};
}
function run(a,b,layout,side,seed){
 const s=setup(a,b,layout,side),fight=new MeasuredBattle(s.home,s.away,seed,null);
 fight.pvpClock=true;fight.firstCast={};fight.observed=[0,1].map(()=>({damage:0,superDamage:0,resistedDamage:0}));fight.start();
 const carries=[a,b].map((r,i)=>fight.units.find(u=>u.team===(i===0?side:1-side)&&u.line===r.carry));
 const frontlines=[a,b].map((r,i)=>{const row=Math.min(...r.team.map(u=>Math.floor(u.cell/7))),lines=r.team.filter(u=>Math.floor(u.cell/7)===row).map(u=>u.line);return fight.units.filter(u=>u.team===(i===0?side:1-side)&&lines.includes(u.line));});
 const control=[0,0];let steps=0;
 while(!fight.over){for(let i=0;i<2;i++)if(carries[i].alive&&cc(carries[i]))control[i]+=1/30;fight.step();if(++steps>15000)throw Error('Battle step guard exceeded');}
 const result={seed,side,layout,value:fight.winner===-1?.5:fight.winner===side?1:0,time:round(fight.time),winner:fight.winner,metrics:[a,b].map((r,i)=>{
  const team=i===0?side:1-side,u=carries[i],units=fight.units.filter(x=>x.team===team),first=fight.firstCast[u.uid];
  return {...fight.observed[team],life:u.alive?fight.time:Math.max(0,u.tFaint),firstCast:first??null,noCast:first===undefined?1:0,casts:u.uses,control:control[i],frontlineLife:mean(frontlines[i].map(u=>u.alive?fight.time:Math.max(0,u.tFaint))),frontlineGoneBeforeCast:first!==undefined&&frontlines[i].every(u=>!u.alive&&u.tFaint<first)?1:0,healing:units.reduce((s,u)=>s+u.healed,0),abilityDamage:units.reduce((s,u)=>s+u.dealtAbility,0),totalDamage:units.reduce((s,u)=>s+u.dealt,0)};
 })};
 return result;
}
function aggregate(trials,index){
 const metrics=trials.map(t=>t.metrics[index]);return Object.fromEntries(['life','noCast','casts','control','frontlineLife','frontlineGoneBeforeCast','healing','abilityDamage','totalDamage','damage','superDamage','resistedDamage'].map(k=>[k,round(mean(metrics.map(m=>m[k])))]).concat([['firstCast',metrics.some(m=>m.firstCast!==null)?round(mean(metrics.filter(m=>m.firstCast!==null).map(m=>m.firstCast))):null]]));
}
export function record(a,b,trial,data){
 const s=setup(a,b,trial.layout,trial.side),fight=new Battle(s.home,s.away,trial.seed,null);fight.pvpClock=true;fight.start();
 const frames=[],stats=[],changes=[],previousForms=new Map(),statuses=u=>['stun','freezeT','fearT','airborneT','parT','poisonT','burnT','untargetT','rootT'].reduce((s,k,i)=>s+(u[k]>0?2**i:0),0);
 const frame=()=>{
  for(const u of fight.units){const signature=[u.num,u.maxHp,u.maxMana].join('/');if(previousForms.has(u.uid)&&previousForms.get(u.uid)!==signature)changes.push({t:round(fight.time),uid:u.uid,num:u.num,name:rosterNative.x(u.name,'en'),maxHp:u.maxHp,maxMana:u.maxMana});previousForms.set(u.uid,signature);}
  frames.push([round(fight.time),...fight.units.flatMap(u=>[u.cell,u.from,Math.round(u.moveT*100),Math.max(0,Math.round(u.hp)),Math.round(u.mana),Math.round(u.shield),u.alive?1:0,statuses(u)])]);
  stats.push([round(fight.time),...fight.units.flatMap(u=>[round(u.dealt),round(u.taken),round(u.healed),round(u.shielded),round(u.mitigated)])]);
 };
 const units=fight.units.map(u=>({uid:u.uid,team:u.team,line:u.line,star:u.star,num:u.num,name:data.roster.find(r=>r.id===u.line).forms[u.star-1].name,types:u.types,traits:u.traits,maxHp:u.maxHp,maxMana:u.maxMana,items:u.items,carry:u.line===(u.team===trial.side?a.carry:b.carry)}));
 frame();let step=0;while(!fight.over){fight.step();if(++step%6===0)frame();if(step>15000)throw Error('Replay guard');}if(frames.at(-1)[0]!==round(fight.time))frame();
 const value=fight.winner===-1?.5:fight.winner===trial.side?1:0;if(value!==trial.value||round(fight.time)!==trial.time)throw Error('Score/replay parity failed');
 const events=fight.events.filter(e=>['attack','charge','cast','dmg','heal','cc','faint','end','shove','burrow','zone','zoneEnd','transform'].includes(e.k)).map(e=>{const o={...e,t:round(e.t)};if(o.amount!==undefined)o.amount=round(o.amount);if(o.name)o.name=rosterNative.x(o.name,'en');return o;});
 return {seed:trial.seed,side:trial.side,value,winner:fight.winner,duration:round(fight.time),units,frames,stats,statFields:['dealt','taken','healed','shielded','mitigated'],changes,events};
}
function execute(job,data,out){
 const {a,b,level}=job,base=[],layouts={};
 for(const layout of ['published','own-flip','enemy-flip']){
  const trials=[];for(let i=0;i<(layout==='published'?128:64);i++)for(const side of [0,1])trials.push(run(a,b,layout,side,seedFor(level,a.id,b.id,i)));
  if(layout==='published')base.push(...trials);
  layouts[layout]={score:mean(trials.map(t=>t.value)),wins:trials.filter(t=>t.value===1).length,draws:trials.filter(t=>t.value===.5).length,losses:trials.filter(t=>t.value===0).length,n:trials.length};
  if(layout!=='published'){const paired=[];for(let i=0;i<64;i++)paired.push(mean(trials.slice(i*2,i*2+2).map(t=>t.value))-mean(base.slice(i*2,i*2+2).map(t=>t.value)));layouts[layout].delta=round(mean(paired));layouts[layout].deltaInterval=interval(paired);}
 }
 const clustered=Array.from({length:128},(_,i)=>mean(base.slice(i*2,i*2+2).map(t=>t.value)));
 const replay=[];for(const outcome of [1,0,.5]){const group=base.filter(t=>t.value===outcome).sort((x,y)=>x.time-y.time||x.seed-y.seed||x.side-y.side);if(group.length)replay.push(record(a,b,group[Math.floor(group.length/2)],data));}
 const key=`${level}--${a.id}--${b.id}`;fs.writeFileSync(path.join(out,'replays',key+'.json'),JSON.stringify({a:a.id,b:b.id,level,selection:'Median-duration example within each observed outcome, published formation only.',replays:replay}));
 return {key,a:a.id,b:b.id,level,...layouts.published,interval:interval(clustered),layouts,metrics:[aggregate(base,0),aggregate(base,1)],replays:replay.map(r=>({seed:r.seed,side:r.side,value:r.value,duration:r.duration}))};
}
if(!isMainThread){parentPort.on('message',job=>{try{parentPort.postMessage({result:execute(job,workerData.data,workerData.out)});}catch(e){parentPort.postMessage({error:e.stack});}});}
else if(path.resolve(process.argv[1]??'')===fileURLToPath(import.meta.url)){
 const html=fs.readFileSync('compositions.html','utf8'),ctx=vm.createContext({window:{}});
 for(const key of ['KANTO_DATA','KANTO_COMPS']){const s=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].trim().startsWith('window.'+key+'='));if(!s)throw Error('Missing '+key);vm.runInContext(s[1],ctx);}
 const {KANTO_DATA:data,KANTO_COMPS:C}=ctx.window,sets={},jobs=[];
 for(const r of C.rows)for(const b of r.boards)if(b.team.reduce((n,u)=>n+u.items.length,0)>(C.itemBudget??6))throw Error('Board exceeds scored item budget: '+r.id+' L'+b.level);
 for(const level of C.targetRound?[48]:[8,9]){sets[level]=C.rows.filter(r=>['S','A'].includes((C.targetRound?r.stages[0]:r.stages.find(s=>s.level===level))?.tier)).map(r=>{const score=C.targetRound?r.stages[0]:r.stages.find(s=>s.level===level);return {...r,...(C.targetRound?r.boards[0]:r.boards.find(b=>b.level===level)),tier:score.tier};});for(let i=0;i<sets[level].length;i++)for(let j=i+1;j<sets[level].length;j++)jobs.push({level,a:sets[level][i],b:sets[level][j]});}
 const out=path.resolve('analysis');fs.mkdirSync(path.join(out,'replays'),{recursive:true});
 const start=performance.now(),results=[];let next=0;const workers=Array.from({length:Math.min(os.availableParallelism(),Number(process.env.KANTO_WORKERS)||64)},()=>new Worker(new URL(import.meta.url),{workerData:{data,out}}));
 console.log(JSON.stringify({pairs:jobs.length,builds:Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,v.length])),battles:jobs.length*512}));
 try{await Promise.all(workers.map(w=>new Promise((resolve,reject)=>{const send=()=>{if(next===jobs.length){resolve();return;}w.postMessage(jobs[next++]);};w.on('message',m=>{if(m.error)return reject(Error(m.error));results.push(m.result);if(results.length%25===0)console.log(`Completed ${results.length}/${jobs.length} matchups`);send();});w.on('error',reject);send();})));}finally{await Promise.all(workers.map(w=>w.terminate()));}
 results.sort((a,b)=>a.key.localeCompare(b.key));
 const types=Object.keys(data.traits),typeChart=Object.fromEntries(types.map(type=>[type,Object.fromEntries(types.map(def=>[def,typeEffect(type,[def])]))]));
 const manifest={build:harness.build,rules:harness.rules,files:Object.fromEntries(fs.readdirSync(path.join(root,'assets')).filter(f=>f.endsWith('.js')).sort().map(f=>[f,hash(fs.readFileSync(path.join(root,'assets',f),'utf8'))])),downloadedAt:JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).saved.slice(0,10)},sourceHash=hash(html),source={generated:C.generated,version:C.version,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHash,simulation:`Version ${harness.rules} / ${routeFile}`,nativeHash:hash(fs.readFileSync(path.join(root,'assets',routeFile),'utf8')),nativeCaptured:manifest.downloadedAt,engineIdentity:harness.identity??null,generatedAt:new Date().toISOString(),seeds:128,sides:2,battlesPerPair:256,formationChecks:'64 paired seeds × both sides per column flip',totalBattles:jobs.length*512,seconds:round((performance.now()-start)/1000)};
 Object.assign(source,{targetRound:C.targetRound??null,itemBudget:C.itemBudget??6});
 const catalogue=Object.fromEntries(Object.entries(sets).map(([level,rows])=>[level,rows.map(r=>({id:r.id,name:r.name,carry:r.carry,tier:r.tier,strategy:r.strategy,level:r.level,team:r.team.map(u=>{const line=data.roster.find(r=>r.id===u.line),f=line.forms[u.star-1];return {...u,name:f.name,num:f.num,types:f.types,traits:line.traits,skill:f.skill};})}))]));
 fs.writeFileSync(path.join(out,'matchups.json'),JSON.stringify({source,builds:catalogue,itemNames:Object.fromEntries(data.items.map(i=>[i.id,i.name])),types,typeChart,pairs:results}));
 fs.writeFileSync(path.join(out,'provenance.json'),JSON.stringify({source,nativeManifest:manifest,sourceBuilds:hash(catalogue),pairResults:hash(results)},null,2));
 console.log(JSON.stringify(source));
}
