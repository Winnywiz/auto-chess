import fs from 'node:fs';
import {route,roster as r,engine,shop,build,rules,identity} from './headless.mjs';
const values=Object.entries(route);
function unique(label,test){const found=values.filter(([,v])=>test(v));if(found.length!==1)throw Error(`Ambiguous ${label}: ${found.map(([k])=>k)}`);return found[0][1];}
const dex=unique('species table',v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).length>=151&&Object.values(v).every(x=>x&&x.stats&&Array.isArray(x.types)));
const traits=unique('traits',v=>v&&typeof v==='object'&&!Array.isArray(v)&&v.Fire?.thresholds&&v.Ground?.thresholds&&v.Flying?.thresholds);
const nativeItems=unique('items',v=>Array.isArray(v)&&v.length>10&&v.every(x=>x&&typeof x.id==='string'&&typeof x.kind==='string')&&v.some(x=>x.id==='focus-sash'));
const components=unique('components',v=>Array.isArray(v)&&v.includes('protein')&&v.includes('hp-up')&&v.every(x=>typeof x==='string'));
const recipes=unique('recipes',v=>v&&typeof v==='object'&&!Array.isArray(v)&&v.protein?.protein==='choice-band');
const constants=unique('item constants',v=>v&&typeof v==='object'&&!Array.isArray(v)&&typeof v.hpUp==='number'&&typeof v.sashShield==='number');
const seals=unique('Seal definitions',v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.values(v).length>100&&Object.values(v).every(x=>x&&typeof x.id==='string'&&Array.isArray(x.effects)&&Number.isInteger(x.rarity)));
const typeChart=unique('native type chart',v=>v&&typeof v==='object'&&!Array.isArray(v)&&v.Fire?.Grass===2&&v.Ghost?.Normal===0&&v.Dragon?.Dragon===2&&Object.keys(v).length===15);
const anchorLines=unique('native anchored lines',v=>Array.isArray(v)&&v.length>0&&v.every(x=>x&&typeof x.id==='string'&&typeof x.branchOf==='string'&&Array.isArray(x.anchorK)&&x.anchorK.length===3));
const pvpLineIds=new Set(r.n.map(line=>line.id));
const anchors=anchorLines.map(line=>({...line,mode:pvpLineIds.has(line.branchOf)?'pvp':'adventure',pvpEligible:pvpLineIds.has(line.branchOf)}));
const en=s=>String(r.x(s,'en')??'').replaceAll('—',' - ').replaceAll('–','-').replaceAll('·','/');
const skill=m=>({...m,name:en(m.name),desc:en(m.desc),tag:en(m.tag),stars:undefined});
const parts=Object.fromEntries(Object.entries(recipes).flatMap(([a,row])=>Object.entries(row).map(([b,id])=>[id,[a,b]])));
const items=nativeItems.map(x=>({...x,name:en(x.name),short:en(x.short),tiny:en(x.tiny),parts:x.kind==='full'?parts[x.id]??[]:[]}));
const lines=r.n.map(line=>({id:line.id,cost:line.cost,traits:line.traits,role:line.role,range:line.range,entry:line.entry,branchOf:line.branchOf??null,mode:'pvp',pvpEligible:true,...line.owner?{owner:line.owner}:{},
  flex:line.flex?{stars:line.flex.stars,axes:line.flex.axes??['atk','spa'],def:line.flex.def,phys:[1,2,3].map(s=>skill(r.u(line.flex,'phys',s))),spec:[1,2,3].map(s=>skill(r.u(line.flex,'spec',s)))}:null,
  forms:[1,2,3].map(star=>{const f=r.g(line,star),d=dex[f.num];return{star,num:f.num,name:d.name,shiny:f.shiny,types:d.types,stats:d.stats,skill:skill(r.p(line,star)),itemFit:items.filter(x=>x.kind==='full').map(item=>({id:item.id,score:engine.v(item.id,{line:line.id,star})}))};})}));
for(const line of lines)for(const form of line.forms)for(const fit of form.itemFit)if(!Number.isFinite(fit.score))throw Error('Invalid native item fit: '+line.id+'/'+fit.id);
const data={roster:lines,anchors,dex,typeChart,items,components,recipes,itemConstants:constants,seals,traits:Object.fromEntries(Object.entries(traits).map(([k,v])=>[k,{...v,desc:en(v.desc)}])),economy:shop.s,source:'https://einoow.com/kanto-tactics',build,rules,identity};
fs.writeFileSync(new URL('./data.json',import.meta.url),JSON.stringify(data));
console.log(JSON.stringify({lines:lines.length,baseLines:lines.filter(x=>!x.branchOf).length,anchors:anchors.length,pvpAnchors:anchors.filter(x=>x.pvpEligible).length,adventureAnchors:anchors.filter(x=>!x.pvpEligible).length,adventureFamilies:new Set(anchors.filter(x=>!x.pvpEligible).map(x=>x.branchOf)).size,items:items.length,traits:Object.keys(traits).length,rules,identity},null,2));
