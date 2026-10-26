// Refresh native game descriptions without changing page layout.
import fs from 'node:fs';
import '../../work/native-v37/headless.mjs';
const content=await import('../../work/native-v37/assets/content-OGdkQDMS.js');content.i();
const native=JSON.parse(fs.readFileSync('work/native-v37/data.json'));
const combat=JSON.parse(fs.readFileSync('simulation/data-v37.json'));
const clean=s=>String(s??'').replaceAll('—',', ').replaceAll('·','/');
const load=(file,prefix)=>JSON.parse(fs.readFileSync(file,'utf8').slice(prefix.length).trim().replace(/;$/,''));
const seals=load('seals-data.js','window.KANTO_SEALS=');
let changed=0;
seals.version=37;
seals.seals=seals.seals.map(old=>{
 const rule=native.seals[old.id];if(!rule)throw Error('Unknown Seal '+old.id);
 if(JSON.stringify(rule.effects)!==JSON.stringify(old.effects))changed++;
 const id=old.template?old.id+':'+old.types[0]:old.id;
 const text=content.c(id,'en',rule.rarity-1,'{T}'),detail=content.o(id,'en',rule.rarity-1,'{T}');
 if(!text||text.line.includes('?'))throw Error('Missing native Seal text '+old.id);
 return {...old,...rule,name:clean(text.name).replaceAll('{T}','Trait'),description:clean(text.line),details:detail?[clean(detail)]:[]};
});
fs.writeFileSync('seals-data.js','window.KANTO_SEALS='+JSON.stringify(seals)+';\n');
for(const [file,prefix] of [['browser-extension/tooltip-data.js','globalThis.KANTO_TIP_DATA = '],['browser-extension/viewer-data.js','globalThis.KANTO_REPLAY_DATA = ']]){
 const data=load(file,prefix);
 for(const s of seals.seals)data.seals[s.id]={...data.seals[s.id],name:s.name,desc:s.description,rarity:s.rarity,category:s.category,round:s.round};
 fs.writeFileSync(file,prefix+JSON.stringify(data)+';\n');
}
let html=fs.readFileSync('builder.html','utf8');
const old=JSON.parse(html.match(/window\.KANTO_DATA=(\{[^\n]*\});/)[1]);
const data={...old,...native,roster:combat.roster.map(r=>({...native.roster.find(n=>n.id===r.id),...r})),frames:old.frames};
// Private model outputs never enter builder data. Native game-rule metadata is separate.
delete data.economy;
html=html.replace(/window\.KANTO_DATA=\{[^\n]*\};/,'window.KANTO_DATA='+JSON.stringify(data)+';');
fs.writeFileSync('builder.html',html);
console.log(JSON.stringify({rules:37,seals:seals.seals.length,changedSealDefinitions:changed,builderLines:combat.roster.length}));
