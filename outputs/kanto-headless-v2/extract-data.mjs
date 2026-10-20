import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import {sim,Battle} from './headless.mjs';
import * as r from './assets/roster-CpnLcVHu.js';
const tidy=s=>String(s??'').replaceAll('—',' - ').replaceAll('·','/');
const skill=m=>({...m,name:tidy(r.x(m.name,'en')),desc:tidy(r.x(m.desc,'en')),tag:tidy(r.x(m.tag,'en')),stars:undefined});
const engine=await readFile(new URL('./inspection/engine-hdo_L_e1.js',import.meta.url),'utf8');
const begin=engine.indexOf('function N(e, t) {'),end=engine.indexOf('\nfunction P(',begin);
if(begin<0||end<begin)throw Error('Native item fit functions not found');
const native=await import('./assets/sim-DVnRY1Xk.js');
const itemFit=vm.runInNewContext(`(()=>{${engine.slice(begin,end)};return N;})()`,{b:r.r,oe:r.p,he:native.d,se:native.A,ce:native.C,S:native.Dt,V:true});
const items=Object.values(sim.ct).filter(x=>x.kind!=='tool').map(x=>{
 const parts=x.kind==='full'?sim.pt[x.id]??[]:[],statsParts=['choice-band','choice-specs','choice-scarf'].includes(x.id)?[]:parts,weights=[...statsParts,x.id];
 return {...x,name:tidy(x.name),short:tidy(x.short),tiny:tidy(x.tiny),parts,
 attackWeight:weights.reduce((n,k)=>n+(k==='protein'?sim.lt.protein:k==='choice-band'?sim.lt.bandBasic:0),0),
 specialWeight:weights.reduce((n,k)=>n+(k==='calcium'?sim.lt.calcium:k==='choice-specs'?sim.lt.specsAbility:0),0),
 axisWeights:Object.fromEntries(['atk','spa','def','spd','hp','as'].map(axis=>[axis,weights.reduce((n,k)=>n+(sim.ct[k]?.stat===axis?(sim.lt[k==='hp-up'?'hpUp':k]??0):0),0)]))};
});
const lines=r.n.map(line=>({id:line.id,cost:line.cost,traits:line.traits,role:line.role,range:line.range,entry:line.entry,branchOf:line.branchOf??null,
 flex:line.flex?{stars:line.flex.stars,axes:line.flex.axes??['atk','spa'],def:line.flex.def,phys:[1,2,3].map(s=>skill(r.u(line.flex,'phys',s))),spec:[1,2,3].map(s=>skill(r.u(line.flex,'spec',s)))}:null,
 forms:[1,2,3].map(star=>{const f=r.g(line,star),d=sim.i[f.num];return {star,num:f.num,name:d.name,shiny:f.shiny,types:d.types,stats:d.stats,skill:skill(r.p(line,star)),itemFit:items.filter(x=>x.kind==='full').map(item=>({id:item.id,score:itemFit(item.id,{line:line.id,star})}))};})}));
for(const line of lines)for(const f of line.forms)if(f.itemFit.some(x=>!Number.isFinite(x.score)))throw Error('Invalid native fit');
const old=JSON.parse(await readFile(new URL('../kanto-team-builder/data.json',import.meta.url)));
const data={roster:lines,items,components:sim.dt,recipes:sim.ft,traits:sim.Z,frames:old.frames,source:'https://einoow.com/kanto-tactics',build:'sim-DVnRY1Xk / roster-CpnLcVHu',rules:old.rules};
await writeFile(new URL('./data.json',import.meta.url),JSON.stringify(data,null,2));
console.log(JSON.stringify({lines:lines.length,items:items.length,finished:items.filter(x=>x.kind==='full').length,components:sim.dt.length,sample:lines[0].forms[0]}));
