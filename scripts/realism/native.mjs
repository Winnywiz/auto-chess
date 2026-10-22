// Pinned, unmodified v34 local PvP engine. No browser, network or ambient randomness.
import fs from 'node:fs';
import {route,roster as nativeRoster,hash,build} from '../../work/native-v34/headless.mjs';
import {engineIdentity} from '../native/identity.mjs';
const engine=await import('../../work/native-v34/assets/engine-CzjBX4e_.js');engine.a();
export const shop=await import('../../work/native-v34/assets/shop-B-3dv66I.js');
export const core=await import('../../work/native-v34/assets/pvpNet-CQtu34XP.js');
export const elite=await import('../../work/native-v34/assets/elite-B0DcKkJd.js');
// Adapter-only exports expose the native planner without changing its logic or the game snapshot.
const enginePath=new URL('../../work/native-v34/assets/engine-CzjBX4e_.js',import.meta.url);
const plannerSource=fs.readFileSync(enginePath,'utf8').replace(/from"(\.\/[^\"]+)"/g,(_,p)=>'from'+JSON.stringify(new URL(p,enginePath).href))+'\nexport{tn as decide,Ht as makeBot,rn as feedback,on as chooseOffer};\n';
const plannerPath=new URL('../../work/realism-v34/planner-adapter.mjs',import.meta.url);fs.mkdirSync(new URL('./',plannerPath),{recursive:true});
if(!fs.existsSync(plannerPath)||fs.readFileSync(plannerPath,'utf8')!==plannerSource)fs.writeFileSync(plannerPath,plannerSource);
export const planner=await import(plannerPath);planner.a();
export const LocalMatch=engine.r;
export {route,hash,build,nativeRoster};
export const identity=engineIdentity(new URL('../../work/native-v34/',import.meta.url));
export const data=JSON.parse(fs.readFileSync(new URL('../../work/native-v34/data.json',import.meta.url)));
export const roster=Object.fromEntries(data.roster.map(r=>[r.id,r]));
export const items=Object.fromEntries(data.items.map(i=>[i.id,i]));
export const family=line=>nativeRoster.l(line);
export const copies=(s,line)=>Object.values(s.units).filter(u=>family(u.line)===family(line)).reduce((n,u)=>n+3**(u.star-1),0);
export const seed=(salt,i)=>`${salt}/${i}`;
export const create=(seed,seals=false)=>LocalMatch.create(seed,{level:'elite',seals:seals?'ranked':false});
export function act(g,a){
  if(a.free!==undefined)throw Error('Policy may not request free rerolls');
  return g.act(a);
}
export const snapshot=s=>shop.u(s).map(u=>({line:u.line,star:u.star,items:[...(u.items??[])],cell:u.cell,...u.shiny?{shiny:true}:{}}));
export const fullCount=team=>team.reduce((n,u)=>n+u.items.filter(i=>items[i]?.kind==='full').length,0);
