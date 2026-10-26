// Verify v39 extension metadata and Adventure replay recognition without a browser.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';

const directory='browser-extension/';
const manifest=JSON.parse(fs.readFileSync(directory+'manifest.json','utf8'));
assert.equal(manifest.version,'1.9.0');
for(const file of [manifest.background.service_worker,manifest.action.default_popup,...manifest.content_scripts.flatMap(script=>script.js)]){
  assert(fs.existsSync(directory+file),file);
}
const context=vm.createContext({});
for(const file of ['tooltip-data.js','viewer-data.js','replay-compat.js'])vm.runInContext(fs.readFileSync(directory+file,'utf8'),context);
const tip=JSON.parse(JSON.stringify(context.KANTO_TIP_DATA));
const viewer=JSON.parse(JSON.stringify(context.KANTO_REPLAY_DATA));
const game=JSON.parse(fs.readFileSync('simulation/data-v39.json','utf8'));
const port=JSON.parse(fs.readFileSync('work/native-v39/offline-port.json','utf8'));
const pvpModeSource=fs.readFileSync(path.join('work/native-v39/assets',port.names.pvpMode),'utf8');
const exportStart=pvpModeSource.lastIndexOf('export{'),exportEnd=pvpModeSource.lastIndexOf('}');
assert(exportStart>=0&&exportEnd>exportStart,'Native PvP mode export list');
assert(pvpModeSource.slice(exportStart+7,exportEnd).split(',').some(part=>part.trim().split(' as ').at(-1)==='s'),'Native live-match hook export s must remain available');
assert.equal(tip.version,39);
const adventureIds=new Set(game.adventureAnchors.map(line=>line.id));
assert.equal(adventureIds.size,19);
const checkImage=(file,type)=>{
  const bytes=fs.readFileSync(file);
  if(type==='gif')assert(bytes.length>=14&&/^GIF8[79]a$/.test(bytes.subarray(0,6).toString())&&bytes.readUInt16LE(6)>0&&bytes.readUInt16LE(8)>0&&bytes.at(-1)===0x3b,file);
  else assert(type==='png'&&bytes.length>=33&&bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))&&bytes.subarray(12,16).toString()==='IHDR'&&bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0,file);
  return bytes;
};
for(const line of game.roster){
  assert.deepEqual(tip.units[line.id].forms,line.forms,line.id+' tooltip forms');
  assert.deepEqual(viewer.units[line.id].forms,line.forms.map(form=>({skill:form.skill.name,num:form.num,types:form.types,name:form.name})),line.id+' viewer forms');
  for(const form of line.forms)for(const file of ['media/sprites/'+form.num+'.gif','media/icons/'+form.num+'.png']){
    assert(fs.existsSync(path.join(directory,file)),file);
  }
}
for(const line of game.adventureAnchors){
  const meta=tip.units[line.id],replay=viewer.units[line.id];
  assert(meta,line.id+' tooltip record');assert(replay,line.id+' replay record');
  assert.equal(meta.mode,'adventure');assert.equal(meta.pvpEligible,false);
  assert.equal(replay.mode,'adventure');assert.equal(replay.pvpEligible,false);
  assert.deepEqual(meta.forms,line.forms,line.id+' Adventure tooltip forms');
  assert.deepEqual(replay.forms,line.forms.map(form=>({skill:form.skill.name,num:form.num,types:form.types,name:form.name})),line.id+' Adventure replay forms');
  for(const form of line.forms){
    const sprite='media/sprites/'+form.num+'.gif',icon='media/icons/'+form.num+'.png';
    const rootSprite=checkImage(sprite,'gif'),extensionSprite=checkImage(path.join(directory,sprite),'gif');
    const rootIcon=checkImage(icon,'png'),extensionIcon=checkImage(path.join(directory,icon),'png');
    assert(rootSprite.equals(extensionSprite),line.id+' sprite differs between site and extension');
    assert(rootIcon.equals(extensionIcon),line.id+' icon differs between site and extension');
  }
}
for(const item of game.items)assert.equal(viewer.items[item.id].short,item.short,item.id);
assert.deepEqual(tip.traits,game.traits);
const compat=context.KantoReplayCompat;
assert.equal(compat.hasUnsupportedUnits([{line:game.roster[0].id}],tip.units),false);
for(const id of adventureIds)assert.equal(compat.hasUnsupportedUnits([{line:id}],tip.units),true,id+' must remain unsupported by PvP Re-fight');
const source=fs.readFileSync(directory+'viewer.js','utf8');
assert(source.includes("const SIM_RULES = 39;"));
assert(source.includes("link.textContent = 'PvP only'"));
assert(source.includes('Adventure-only units cannot be re-fought in the PvP simulator.'));
assert(source.includes('if (refightUnavailable(round, battle, boards)) return null;'));
assert(fs.readFileSync(directory+'content.js','utf8').includes('unit.form'),'Recorder must keep the selected ability form');
const bridge=fs.readFileSync(directory+'bridge-main.js','utf8');
assert(bridge.includes('flexForm'),'Live replay bridge must capture the native ability form');
assert(bridge.includes("typeof value.prototype?.start === 'function' && typeof value.prototype?.step === 'function'"),'Battle hook should discover the class by its stable methods');
assert(bridge.includes("typeof onlineMode.s === 'function'"),'Live mode hook should continue using the s export');
assert(source.includes('unit.form'),'Replay viewer must restore the recorded ability form');
console.log(JSON.stringify({passed:true,extension:manifest.version,rules:39,pvpRoster:game.roster.length,
  adventureAnchors:adventureIds.size,adventureMetadataRecognized:true,adventureArtValidated:true,manualFormsPreserved:true,replayHookBrowserTested:false}));
