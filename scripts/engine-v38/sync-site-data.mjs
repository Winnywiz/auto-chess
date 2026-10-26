// Sync v38 metadata only. Does not search compositions or calculate recommendations.
import fs from 'node:fs';
import '../../work/native-v38/headless.mjs';
const content=await import('../../work/native-v38/assets/content-CqMHqZFp.js');content.i();
const native=JSON.parse(fs.readFileSync('work/native-v38/data.json'));
const combat=JSON.parse(fs.readFileSync('simulation/data-v38.json'));
const clean=s=>String(s??'').replaceAll('—',', ').replaceAll('·','/');
const load=(file,prefix)=>JSON.parse(fs.readFileSync(file,'utf8').slice(prefix.length).trim().replace(/;$/,''));
const seals=load('seals-data.js','window.KANTO_SEALS=');const previous=new Map(seals.seals.map(s=>[s.id,s]));
seals.version=38;seals.recommendationRules=37;
seals.seals=Object.values(native.seals).map(rule=>{
 const old=previous.get(rule.id),types=rule.types??old?.types??[];
 const id=rule.template?rule.id+':'+types[0]:rule.id;
 const text=content.c(id,'en',rule.rarity-1,'{T}'),detail=content.o(id,'en',rule.rarity-1,'{T}');if(!text||text.line.includes('?'))throw Error('Missing native Seal text '+rule.id);
 return {...old,...rule,types,name:clean(text.name).replaceAll('{T}','Trait'),description:clean(text.line),details:detail?[clean(detail)]:[],category:old?.category??(rule.cat==='hero'?'Hero Seals':'Combat and abilities'),round:old?.round??['2-1','3-2','4-2'][rule.rarity-1],offered:old?.offered??[],heroLines:old?.heroLines??(rule.id==='hero-karp'?['magikarp-a0']:[]),heroNames:old?.heroNames??(rule.id==='hero-karp'?['Magikarp']:[])};
});
seals.art={...JSON.parse(fs.readFileSync('work/v38-update/seal-art.json')),legacy:seals.art.legacy??seals.art};
fs.writeFileSync('seals-data.js','window.KANTO_SEALS='+JSON.stringify(seals)+';\n');
for(const [file,prefix]of [['browser-extension/tooltip-data.js','globalThis.KANTO_TIP_DATA = '],['browser-extension/viewer-data.js','globalThis.KANTO_REPLAY_DATA = ']]){
 const d=load(file,prefix);d.sealArt=seals.art;
 for(const s of seals.seals)d.seals[s.id]={...d.seals[s.id],name:s.name,desc:s.description,rarity:s.rarity,category:s.category,round:s.round,hero:!!s.hero,template:!!s.template,types:s.types};
 fs.writeFileSync(file,prefix+JSON.stringify(d)+';\n');
}
let html=fs.readFileSync('builder.html','utf8');const old=JSON.parse(html.match(/window\.KANTO_DATA=(\{[^\n]*\});/)[1]);
const data={...old,...native,roster:combat.roster.map(r=>{const n=native.roster.find(n=>n.id===r.id);return{...n,...r,forms:r.forms.map((f,i)=>({...n?.forms[i],...f}))};}),frames:old.frames};delete data.economy;
html=html.replace(/window\.KANTO_DATA=\{[^\n]*\};/,'window.KANTO_DATA='+JSON.stringify(data)+';');
html=html.replace(/window\.KANTO_BIS=\{[^\n]*\};/,'window.KANTO_BIS='+JSON.stringify({build:native.build,rules:38,states:{},method:'Native v38 item fit. No composition search has been run.'})+';');fs.writeFileSync('builder.html',html);
console.log(JSON.stringify({rules:38,seals:seals.seals.length,newSeals:seals.seals.filter(s=>!previous.has(s.id)).map(s=>s.id),builderLines:combat.roster.length,recommendationsRecomputed:false}));
