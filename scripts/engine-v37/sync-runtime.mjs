// Extend the extracted catalogue with native anchored lines, then update local runtimes.
// No composition search or site publishing.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {route,roster} from '../../work/native-v37/headless.mjs';
const directory='work/engine-v37/';
const data=JSON.parse(fs.readFileSync(directory+'data-v37.json'));
const species=new Map(data.roster.flatMap(r=>r.forms.map(f=>[f.num,f])));
if(route.Ps?.length!==58)throw Error('Native anchor catalogue changed; review required');
const en=s=>String(roster.x(s??'','en')??'').replaceAll('—',', ').replaceAll('·','/');
data.roster=data.roster.filter(r=>!r.anchorK);
for(const line of route.Ps){
  const forms=[1,2,3].map(star=>{
    const form=roster.g(line,star),dex=species.get(form.num),skill=roster.p(line,star);
    if(!dex)throw Error('Missing anchored species '+form.num);
    return{star,num:form.num,name:dex.name,shiny:form.shiny,types:dex.types,stats:dex.stats,
      skill:{...skill,name:en(skill.name),desc:en(skill.desc),tag:en(skill.tag)}};
  });
  if(data.roster.some(r=>r.id===line.id))throw Error('Duplicate anchored line '+line.id);
  data.roster.push({id:line.id,cost:line.cost,traits:line.traits,role:line.role,range:line.range,
    branchOf:line.branchOf,anchorK:line.anchorK,forms});
}
fs.writeFileSync(directory+'data-v37.json',JSON.stringify(data));
const provenance=JSON.parse(fs.readFileSync(directory+'provenance.json'));
provenance.dataSHA256=createHash('sha256').update(fs.readFileSync(directory+'data-v37.json')).digest('hex');
provenance.anchoredForms=route.Ps.length;
fs.writeFileSync(directory+'provenance.json',JSON.stringify(provenance,null,2)+'\n');
for(const f of ['engine-v37.js','data-v37.json','provenance.json'])fs.copyFileSync(directory+f,'simulation/'+f);
const load=file=>{const text=fs.readFileSync(file,'utf8');return JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));};
const tip=load('browser-extension/tooltip-data.js'),viewer=load('browser-extension/viewer-data.js');
tip.version=37;tip.source='Verified official Version 37 catalogue, including anchored forms';
for(const item of data.items){
  tip.items[item.id]={...tip.items[item.id],...item};
  viewer.items[item.id]={name:item.name,color:item.color,short:item.short,tag:item.tag};
}
tip.traits=data.traits;
for(const line of data.roster){
  tip.units[line.id]={cost:line.cost,role:line.role,range:line.range,traits:line.traits,branchOf:line.branchOf,anchorK:line.anchorK,forms:line.forms};
  viewer.units[line.id]={name:line.forms[0].name,traits:line.traits,forms:line.forms.map(f=>({skill:f.skill.name,num:f.num,types:f.types,name:f.name}))};
}
fs.writeFileSync('browser-extension/tooltip-data.js','globalThis.KANTO_TIP_DATA = '+JSON.stringify(tip)+';\n');
fs.writeFileSync('browser-extension/viewer-data.js','globalThis.KANTO_REPLAY_DATA = '+JSON.stringify(viewer)+';\n');
console.log(JSON.stringify({rules:37,roster:data.roster.length,anchoredForms:route.Ps.length,extension:'1.7.0',published:false}));
