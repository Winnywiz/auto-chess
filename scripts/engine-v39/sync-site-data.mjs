// Update v39 game metadata while keeping the PvP builder roster mode-safe.
// Rankings and item scores are retained. No composition search is run.
import fs from 'node:fs';
const native=JSON.parse(fs.readFileSync('work/native-v39/data.json','utf8'));
const combat=JSON.parse(fs.readFileSync('simulation/data-v39.json','utf8'));
const load=(file,prefix)=>JSON.parse(fs.readFileSync(file,'utf8').slice(prefix.length).trim().replace(/;$/,''));
const seals=load('seals-data.js','window.KANTO_SEALS=');
seals.version=39;
fs.writeFileSync('seals-data.js','window.KANTO_SEALS='+JSON.stringify(seals)+';\n');
for(const [file,prefix]of [['browser-extension/tooltip-data.js','globalThis.KANTO_TIP_DATA = '],['browser-extension/viewer-data.js','globalThis.KANTO_REPLAY_DATA = ']]){
  const data=load(file,prefix);
  data.sealArt=seals.art;
  fs.writeFileSync(file,prefix+JSON.stringify(data)+';\n');
}
let html=fs.readFileSync('builder.html','utf8');
const old=JSON.parse(html.match(/window\.KANTO_DATA=(\{[^\n]*\});/)[1]);
const data={...old,...native,roster:combat.roster.map(line=>{
  const base=native.roster.find(candidate=>candidate.id===line.id);
  return{...base,...line,forms:line.forms.map((form,index)=>({...base?.forms[index],...form}))};
}),adventureAnchors:combat.adventureAnchors,frames:old.frames};
delete data.economy;
delete data.dex;
delete data.anchors;
html=html.replace(/window\.KANTO_DATA=\{[^\n]*\};/,'window.KANTO_DATA='+JSON.stringify(data)+';');
const priorBuilder=fs.existsSync('work/backups/pre-v39-2026-10-27/builder.html')
  ?fs.readFileSync('work/backups/pre-v39-2026-10-27/builder.html','utf8'):html;
const oldBis=JSON.parse(priorBuilder.match(/window\.KANTO_BIS=(\{[^\n]*\});/)[1]);
const bis={...oldBis,build:native.build,rules:39,
  scoreRules:oldBis.scoreRules??oldBis.rules??null,scoreBuild:oldBis.scoreBuild??oldBis.build??null,
  itemFitRules:39,itemFitBuild:native.build,
  method:'Native v39 PvP catalogue and item-fit metadata; pre-update BIS state preserved, no composition search has been run.'};
html=html.replace(/window\.KANTO_BIS=\{[^\n]*\};/,'window.KANTO_BIS='+JSON.stringify(bis)+';');
fs.writeFileSync('builder.html',html);
const adventureIds=new Set(combat.adventureAnchors.map(line=>line.id));
if(combat.roster.some(line=>adventureIds.has(line.id)))throw Error('Adventure-only anchor entered the PvP builder roster');
console.log(JSON.stringify({rules:39,seals:seals.seals.length,sealDefinitionsChanged:false,builderPvPRoster:combat.roster.length,adventureMetadata:adventureIds.size,recommendationsRecomputed:false}));
