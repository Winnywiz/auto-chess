// Add native v39 PvP anchors while keeping Adventure-only anchor metadata separate.
// No composition search or site publishing.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {roster} from '../../work/native-v39/headless.mjs';
const directory='work/engine-v39/';
const data=JSON.parse(fs.readFileSync(directory+'data-v39.json','utf8'));
const native=JSON.parse(fs.readFileSync('work/native-v39/data.json','utf8'));
const pvpLineIds=new Set(native.roster.map(line=>line.id));
if(native.anchors.some(line=>line.pvpEligible!==pvpLineIds.has(line.branchOf)))throw Error('Native roster eligibility metadata is inconsistent');
const en=s=>String(roster.x(s??'','en')??'').replaceAll('—',', ').replaceAll('·','/');
const skill=m=>({...m,name:en(m.name),desc:en(m.desc),tag:en(m.tag)});
const formData=(line,star)=>{
  const form=roster.g(line,star),dex=native.dex[form.num],move=roster.p(line,star);
  if(!dex?.stats||!Array.isArray(dex.types))throw Error('Missing native species '+form.num+' for '+line.id);
  return{star,num:form.num,name:dex.name,shiny:form.shiny,types:dex.types,stats:dex.stats,skill:skill(move)};
};
const flexData=line=>line.flex?{stars:line.flex.stars,axes:line.flex.axes??['atk','spa'],def:line.flex.def,
  phys:[1,2,3].map(star=>skill(roster.u(line.flex,'phys',star))),
  spec:[1,2,3].map(star=>skill(roster.u(line.flex,'spec',star)))}:null;
const anchorData=line=>({id:line.id,cost:line.cost,traits:line.traits,role:line.role,range:line.range,
  ...(line.entry?{entry:line.entry}:{}),branchOf:line.branchOf,anchorK:line.anchorK,
  mode:line.pvpEligible?'pvp':'adventure',pvpEligible:line.pvpEligible,flex:flexData(line),
  forms:[1,2,3].map(star=>formData(line,star))});
const anchored=native.anchors.map(anchorData);
const pvpAnchors=anchored.filter(line=>line.pvpEligible);
data.roster=data.roster.filter(line=>!line.anchorK);
for(const line of pvpAnchors){
  if(data.roster.some(existing=>existing.id===line.id))throw Error('Duplicate PvP anchor '+line.id);
  data.roster.push(line);
}
data.adventureAnchors=anchored.filter(line=>!line.pvpEligible);
if(data.roster.some(line=>line.pvpEligible===false||line.mode==='adventure'))throw Error('Adventure-only anchor entered PvP roster');
fs.writeFileSync(directory+'data-v39.json',JSON.stringify(data));
const provenance=JSON.parse(fs.readFileSync(directory+'provenance.json','utf8'));
provenance.dataSHA256=createHash('sha256').update(fs.readFileSync(directory+'data-v39.json')).digest('hex');
provenance.pvpRosterLines=data.roster.length;
provenance.pvpAnchors=pvpAnchors.length;
provenance.adventureAnchors=data.adventureAnchors.length;
provenance.adventureFamilies=new Set(data.adventureAnchors.map(line=>line.branchOf)).size;
fs.writeFileSync(directory+'provenance.json',JSON.stringify(provenance,null,2)+'\n');
for(const file of ['engine-v39.js','data-v39.json','provenance.json'])fs.copyFileSync(directory+file,'simulation/'+file);
const load=(file,prefix)=>JSON.parse(fs.readFileSync(file,'utf8').slice(prefix.length).trim().replace(/;$/,''));
const tip=load('browser-extension/tooltip-data.js','globalThis.KANTO_TIP_DATA = ');
const viewer=load('browser-extension/viewer-data.js','globalThis.KANTO_REPLAY_DATA = ');
tip.version=39;tip.source='Verified official Version 39 catalogue; Adventure-only anchors are metadata only';
for(const item of data.items){
  tip.items[item.id]={...tip.items[item.id],...item};
  viewer.items[item.id]={name:item.name,color:item.color,short:item.short,tag:item.tag};
}
tip.traits=data.traits;
for(const line of [...data.roster,...data.adventureAnchors]){
  const meta={cost:line.cost,role:line.role,range:line.range,traits:line.traits,branchOf:line.branchOf,
    anchorK:line.anchorK,flex:line.flex,mode:line.mode??'pvp',pvpEligible:line.pvpEligible!==false,forms:line.forms};
  tip.units[line.id]=meta;
  viewer.units[line.id]={name:line.forms[0].name,traits:line.traits,flex:line.flex,mode:meta.mode,
    pvpEligible:meta.pvpEligible,forms:line.forms.map(form=>({skill:form.skill.name,num:form.num,types:form.types,name:form.name}))};
}
fs.writeFileSync('browser-extension/tooltip-data.js','globalThis.KANTO_TIP_DATA = '+JSON.stringify(tip)+';\n');
fs.writeFileSync('browser-extension/viewer-data.js','globalThis.KANTO_REPLAY_DATA = '+JSON.stringify(viewer)+';\n');
console.log(JSON.stringify({rules:39,pvpRoster:data.roster.length,pvpAnchors:pvpAnchors.length,adventureAnchors:data.adventureAnchors.length,adventureFamilies:provenance.adventureFamilies,extensionTooltipUnits:Object.keys(tip.units).length,published:false}));
