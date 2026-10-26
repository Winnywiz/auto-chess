// Prepare a local version update only. Does not run a search or publish.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.resolve('work/backups/pre-v37-' + stamp);
fs.mkdirSync(backup, {recursive:true});
const files = [...fs.readdirSync('.').filter(f => fs.statSync(f).isFile() && /\.(html|js|css)$/.test(f)), 'simulation', 'data', 'analysis', 'browser-extension'];
for (const f of files) fs.cpSync(f, path.join(backup, f), {recursive:true,errorOnExist:true,force:false});
fs.writeFileSync(path.join(backup,'backup.json'),JSON.stringify({created:new Date().toISOString(),files},null,2));
fs.mkdirSync('docs',{recursive:true});
const specification=process.env.KANTO_SPEC??process.argv[2];
if(specification)fs.copyFileSync(specification,'docs/composition-search-configuration-and-rules.md');
fs.mkdirSync('work/fiveTwo37',{recursive:true});
const response = await fetch('https://einoow.com/api/meta/kanto/meta.json');
if (!response.ok) throw Error('Meta API failed: '+response.status);
const bytes = Buffer.from(await response.arrayBuffer()), meta=JSON.parse(bytes);
if (!Array.isArray(meta.comps) || !meta.comps.length) throw Error('Empty ranked meta response');
fs.writeFileSync('work/fiveTwo37/meta.json',bytes);
fs.writeFileSync('work/fiveTwo37/meta-provenance.json',JSON.stringify({url:response.url,fetched:new Date().toISOString(),generated:meta.generated,rules:meta.rules,sha256:createHash('sha256').update(bytes).digest('hex')},null,2));
const edit=(file,fn)=>{const old=fs.readFileSync(file,'utf8'),next=fn(old);if(old!==next)fs.writeFileSync(file,next);};
for(const file of fs.readdirSync('scripts/fivetwo').filter(f=>/\.(mjs|py)$/.test(f))) edit('scripts/fivetwo/'+file,s=>s.replaceAll('fiveTwo36','fiveTwo37'));
edit('scripts/fivetwo/combat.mjs',s=>s.replace(s.split('\n')[0],'// Combat helpers on the hash-verified native Version 37 engine.').replace("export const data = JSON.parse(fs.readFileSync(new URL('../../simulation/data-v36.json', import.meta.url)));","export {data} from './engine.mjs';\nimport {data} from './engine.mjs';"));
edit('scripts/fivetwo/combat-worker.mjs',s=>s.replace("import * as engine from '../../simulation/engine-v36.js';","import {engine} from './engine.mjs';"));
edit('scripts/fivetwo/rules.mjs',s=>s.replace('Version 36 PvP','Version 37 PvP').replace("const data = JSON.parse(fs.readFileSync(new URL('../../simulation/data-v36.json', import.meta.url)));","import {data} from './engine.mjs';"));
edit('scripts/fivetwo/export-site.mjs',s=>s.replace("../../simulation/provenance.json","../../work/engine-v37/provenance.json").replaceAll('../../simulation/data-v36.json','../../work/engine-v37/data-v37.json').replaceAll('v36-52-2','v37-52-1').replaceAll('gameRules: 36','gameRules: 37').replaceAll('Version 36.','Version 37.').replaceAll('version 36 engine','version 37 engine'));
edit('scripts/fivetwo/private-table.py',s=>s.replace("'simulation' / 'data-v36.json'","'work' / 'engine-v37' / 'data-v37.json'"));
// The current page still has v36 scores, so verify it on its recorded engine until the approved rerun.
edit('scripts/fivetwo/verify.mjs',s=>s.replace("import * as engine from '../../simulation/engine-v36.js';",'').replace("const data = JSON.parse(fs.readFileSync('simulation/data-v36.json', 'utf8'));","const version = C.gameRules;\nassert.ok([36,37].includes(version), 'Unsupported game rules');\nconst engine = version === 37 ? (await import('./engine.mjs')).engine : await import('../../simulation/engine-v36.js');\nconst data = JSON.parse(fs.readFileSync(`simulation/data-v${version}.json`, 'utf8'));\nassert.equal(C.engineIdentity, engine.identity, 'Page and engine identity differ');"));
for(const f of ['simulation/battle-worker.js','custom-battle.js']) edit(f,s=>s.replaceAll('v36','v37').replaceAll('rules:36','rules:37'));
edit('browser-extension/viewer.js',s=>s.replace('const SIM_RULES = 36;','const SIM_RULES = 37;'));
edit('browser-extension/manifest.json',s=>s.replace('"version": "1.6.0"','"version": "1.7.0"'));
edit('browser-extension/README.md',s=>s.replace('runs the v36 engine','runs the v37 engine after the local website update is published'));
edit('scripts/verify-custom-battle.mjs',s=>s.replaceAll('v36','v37').replaceAll('rules:36','rules:37'));
edit('scripts/generate-matchups.mjs',s=>s.replace("pageRules===36?'Es'","pageRules===37?'__effectiveness':pageRules===36?'Es'"));
// v37's native route does not export effectiveness. Use the verified bundle's helper.
edit('scripts/generate-matchups.mjs',s=>s.replace("rosterNative=harness.roster,typeEffect=harness.route[", "rosterNative=harness.roster,typeEffect=pageRules===37?(await import('../simulation/engine-v37.js')).effectiveness:harness.route["));
console.log(JSON.stringify({backup,metaGenerated:meta.generated,prepared:true,studyRun:false,published:false}));
