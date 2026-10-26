// Apply v39 cache/version wiring to the existing PvP runtime; preserve v36-v38 support.
// No composition search or ranking work is performed.
import fs from 'node:fs';
const ext=JSON.parse(fs.readFileSync('browser-extension/manifest.json','utf8'));
const customBattle=fs.readFileSync('custom-battle.js','utf8');
if(customBattle.includes('let rules=39;')&&customBattle.includes('battle-worker.js?v=v39-1')&&ext.version==='1.9.0'){
  console.log('v39 runtime wiring is already applied.');
  process.exit(0);
}
const edit=(file,from,to)=>{
  const before=fs.readFileSync(file,'utf8');
  if(!before.includes(from)){
    if(before.includes(to))return;
    throw Error(`Expected v38 marker is missing in ${file}: ${from}`);
  }
  fs.writeFileSync(file,before.replace(from,to));
};
edit('simulation/battle-worker.js','[36,37,38].includes(version)','[36,37,38,39].includes(version)');
edit('custom-battle.js','let rules=38;','let rules=39;');
edit('custom-battle.js','[36,37,38].includes(version)','[36,37,38,39].includes(version)');
edit('custom-battle.js','simulation/data-v${rules}.json?v=v38-1','simulation/data-v${rules}.json?v=v39-1');
edit('custom-battle.js','battle-worker.js?v=v38-1','battle-worker.js?v=v39-1');
edit('matchups.js','custom-battle.js?v=v38-anchor-1','custom-battle.js?v=v39-anchor-1');
edit('battle.html','matchups.js?v=v38-anchor-1','matchups.js?v=v39-anchor-1');
edit('matchups.html','matchups.js?v=v38-anchor-1','matchups.js?v=v39-anchor-1');
edit('builder.html','team-code.js?v=kt1-v38-1','team-code.js?v=kt1-v39-1');
edit('seals.html','?v=v38-runtime-1','?v=v39-runtime-1');
edit('browser-extension/viewer.js','const SIM_RULES = 38;','const SIM_RULES = 39;');
edit('browser-extension/README.md','Version 1.8.0 records v38 manual ability choices and preserves them in Re-fight links. Existing recordings remain available.','Version 1.9.0 uses the v39 PvP simulator and keeps native ability choices in replay links. Adventure-only anchors remain replay metadata and are unavailable in PvP Re-fight.');
edit('browser-extension/README.md','The website simulator runs the v38 engine.','The website simulator runs the v39 PvP engine. Adventure-only anchors are recognized as replay metadata but cannot be sent to the PvP simulator.');
ext.version='1.9.0';
fs.writeFileSync('browser-extension/manifest.json',JSON.stringify(ext,null,2)+'\n');
console.log('Version 39 runtime and extension wiring updated; version 36, 37 and 38 links remain supported.');
