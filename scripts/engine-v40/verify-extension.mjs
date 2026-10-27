// Verify the offline extension package metadata and v40 Seal atlas resolution.
// No browser is opened and no files are modified.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const root='browser-extension/';
const manifest=JSON.parse(fs.readFileSync(root+'manifest.json','utf8'));
assert.equal(manifest.version,'1.10.0');
for(const file of [manifest.background.service_worker,manifest.action.default_popup,...manifest.content_scripts.flatMap(script=>script.js)])assert(fs.existsSync(root+file),file);
const context=vm.createContext({});
for(const file of ['tooltip-data.js','viewer-data.js','replay-compat.js'])vm.runInContext(fs.readFileSync(root+file,'utf8'),context);
const tip=JSON.parse(JSON.stringify(context.KANTO_TIP_DATA));
const replay=JSON.parse(JSON.stringify(context.KANTO_REPLAY_DATA));
const game=JSON.parse(fs.readFileSync('simulation/data-v40.json','utf8'));
assert.equal(tip.version,40);assert.equal(tip.rules,40);
assert.equal(replay.version,40);assert.equal(replay.rules,40);
assert.equal(tip.sealArt.file,'media/seals/atlas-v40-32.png');
assert.equal(replay.sealArt.file,tip.sealArt.file);
const atlas=fs.readFileSync(root+tip.sealArt.file);
assert.equal(createHash('sha256').update(atlas).digest('hex'),createHash('sha256').update(fs.readFileSync(tip.sealArt.file)).digest('hex'));
assert.equal(tip.sealArt.index['g:hero-karp'],99);
assert.equal(tip.sealArt.index['hero:hero-karp'],undefined);
assert.equal(tip.sealArt.index['hero:hero-late-bloomer'],100);
const sealContext=vm.createContext({
  KANTO_TIP_DATA:tip,KANTO_REPLAY_DATA:replay,
  document:{createElement:()=>({style:{},classList:{add(){}},setAttribute(){},append(){}}),addEventListener(){}},
  window:{addEventListener(){}},
});
vm.runInContext(fs.readFileSync(root+'tooltips.js','utf8'),sealContext);
const stubborn=sealContext.KantoTips.sealIcon('hero-karp');
const late=sealContext.KantoTips.sealIcon('hero-late-bloomer');
assert(stubborn.style.backgroundImage.includes('atlas-v40-32.png'));
assert.equal(stubborn.style.backgroundPosition,'-84px -168px','Stubborn Fish must resolve the canonical v40 glyph at index 99');
assert.equal(late.style.backgroundPosition,`-${(100%tip.sealArt.columns)*28}px -${Math.floor(100/tip.sealArt.columns)*28}px`,'Existing hero keys must keep their own v40 artwork');
const viewer=fs.readFileSync(root+'viewer.js','utf8');
assert(viewer.includes('const SIM_RULES = 40;'));
assert(fs.readFileSync(root+'content.js','utf8').includes('unit.form'),'Recorder must keep manual native ability choices');
assert(fs.readFileSync(root+'bridge-main.js','utf8').includes('flexForm'),'Live replay bridge must keep manual native ability choices');
assert.equal(game.rules,40);
console.log(JSON.stringify({passed:true,extension:manifest.version,rules:40,sealAtlas:tip.sealArt.file,
  stubbornFishGlyph:tip.sealArt.index['g:hero-karp'],heroFallbackValidated:true,manualFormsPreserved:true,browserOpened:false}));
