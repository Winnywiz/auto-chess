// Apply v40 cache/version wiring while retaining v36-v39 compatibility.
// Run after the reviewed v40 engine/data and site metadata sync.
import fs from 'node:fs';

const changes=[
  ['simulation/battle-worker.js','[36,37,38,39].includes(version)','[36,37,38,39,40].includes(version)'],
  ['custom-battle.js','let rules=39;','let rules=40;'],
  ['custom-battle.js','[36,37,38,39].includes(version)','[36,37,38,39,40].includes(version)'],
  ['custom-battle.js','simulation/data-v${rules}.json?v=v39-1','simulation/data-v${rules}.json?v=v40-1'],
  ['custom-battle.js','battle-worker.js?v=v39-1','battle-worker.js?v=v40-1'],
  ['matchups.js','custom-battle.js?v=v39-anchor-1','custom-battle.js?v=v40-anchor-1'],
  ['battle.html','matchups.js?v=v39-anchor-1','matchups.js?v=v40-anchor-1'],
  ['matchups.html','matchups.js?v=v39-anchor-1','matchups.js?v=v40-anchor-1'],
  ['builder.html','team-code.js?v=kt1-v39-1','team-code.js?v=kt1-v40-1'],
  ['seals.html','?v=v39-runtime-1','?v=v40-runtime-1'],
  ['browser-extension/viewer.js','const SIM_RULES = 39;','const SIM_RULES = 40;'],
  ['browser-extension/README.md','Version 1.9.0 uses the v39 PvP simulator and keeps native ability choices in replay links. Adventure-only anchors remain replay metadata and are unavailable in PvP Re-fight.','Version 1.10.0 uses the v40 PvP simulator and keeps native ability choices in replay links. Adventure-only anchors remain replay metadata and are unavailable in PvP Re-fight.'],
  ['browser-extension/README.md','The website simulator runs the v39 PvP engine. Adventure-only anchors are recognized as replay metadata but cannot be sent to the PvP simulator.','The website simulator runs the v40 PvP engine. Adventure-only anchors are recognized as replay metadata but cannot be sent to the PvP simulator.'],
];

const manifestFile='browser-extension/manifest.json';
const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
if(!['1.9.0','1.10.0'].includes(manifest.version))throw Error(`Expected extension version 1.9.0 or 1.10.0; found ${manifest.version}`);
const staged=new Map();
for(const [file,from,to] of changes){
  const before=staged.get(file)??fs.readFileSync(file,'utf8');
  if(before.includes(to))staged.set(file,before);
  else if(before.includes(from))staged.set(file,before.replaceAll(from,to));
  else throw Error(`Expected v39 marker is missing in ${file}: ${from}`);
}
manifest.version='1.10.0';
staged.set(manifestFile,JSON.stringify(manifest,null,2)+'\n');
for(const [file,contents]of staged)fs.writeFileSync(file,contents);
console.log(JSON.stringify({rules:40,extension:manifest.version,legacyVersions:[36,37,38,39],files:[...staged.keys()]}));
