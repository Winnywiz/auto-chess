import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
const directory='browser-extension/';
const manifest=JSON.parse(fs.readFileSync(directory+'manifest.json','utf8'));
assert.equal(manifest.version,'1.8.0');
for(const file of [manifest.background.service_worker,manifest.action.default_popup,...manifest.content_scripts.flatMap(s=>s.js)])assert(fs.existsSync(directory+file),file);
const context=vm.createContext({});
for(const file of ['tooltip-data.js','viewer-data.js'])vm.runInContext(fs.readFileSync(directory+file,'utf8'),context);
const tip=JSON.parse(JSON.stringify(context.KANTO_TIP_DATA)),viewer=JSON.parse(JSON.stringify(context.KANTO_REPLAY_DATA));
const game=JSON.parse(fs.readFileSync('simulation/data-v38.json','utf8'));
assert.equal(tip.version,38);
for(const line of game.roster){
 assert.deepEqual(tip.units[line.id].forms,line.forms,line.id+' tooltips');
 assert.deepEqual(viewer.units[line.id].forms,line.forms.map(f=>({skill:f.skill.name,num:f.num,types:f.types,name:f.name})),line.id+' viewer');
 for(const form of line.forms)for(const file of ['media/sprites/'+form.num+'.gif','media/icons/'+form.num+'.png'])assert(fs.existsSync(path.join(directory,file)),file);
}
for(const item of game.items)assert.equal(viewer.items[item.id].short,item.short,item.id);
assert.deepEqual(tip.traits,game.traits);
assert.match(fs.readFileSync(directory+'viewer.js','utf8'),/const SIM_RULES = 38;/);
console.log(JSON.stringify({passed:true,extension:manifest.version,rules:38,roster:game.roster.length,anchors:game.roster.filter(r=>r.anchorK).length,browserUsed:false}));
