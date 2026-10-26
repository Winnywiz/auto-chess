// Verify v38 UI/data wiring without opening a browser or running a composition study.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {simulate} from '../../simulation/battle-core.js';
const html=fs.readFileSync('builder.html','utf8'),scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const box={};box.window=box;box.globalThis=box;vm.createContext(box);
for(const prefix of ['window.KANTO_DATA=','window.KANTO_BIS='])vm.runInContext(scripts.find(s=>s.trim().startsWith(prefix)),box);
vm.runInContext(scripts.find(s=>s.includes('globalThis.TeamLogic =')),box);
assert.equal(box.KANTO_DATA.rules,38);assert.equal(box.KANTO_BIS.rules,38);
const payload={v:1,level:7,mode:'png',board:{0:{line:'pikachu',star:3,items:['choice-band'],form:'spec'}},bench:Array(9).fill(null)};
const clean=box.TeamLogic.clean(payload);assert.equal(clean.board[0].form,'spec');assert.equal(box.TeamLogic.skill(clean.board[0]).name,box.TeamLogic.lines.pikachu.flex.spec[2].name);
assert.throws(()=>box.TeamLogic.clean({...payload,board:{0:{...payload.board[0],form:'bad'}}}));
const document={createElement:()=>({style:{},classList:{add(){}},setAttribute(){},append(){},addEventListener(){}}),body:{append(){}},addEventListener(){},getElementById:()=>null};
const sealBox={document};sealBox.window=sealBox;sealBox.addEventListener=()=>{};vm.createContext(sealBox);vm.runInContext(fs.readFileSync('seals-data.js','utf8'),sealBox);vm.runInContext(fs.readFileSync('seals.js','utf8'),sealBox);
let sealIcons=0;for(const s of sealBox.KANTO_SEALS.seals){const ids=s.template?s.types.map(t=>s.id+':'+t):[s.id];for(const id of ids){assert(sealBox.KantoSeals.resolve(id));assert(sealBox.KantoSeals.icon(id).includes('seal-pixel'));sealIcons++;}}
assert(sealBox.KantoSeals.icon('roots').includes('atlas-v38-32.png'));assert(sealBox.KantoSeals.icon('hero-karp').includes('atlas-v38-32.png'));
for(const file of ['builder.html','custom-battle.js','browser-extension/viewer.js','browser-extension/content.js','browser-extension/bridge-main.js']){const s=fs.readFileSync(file,'utf8');if(file==='builder.html')assert(s.includes('data-skill-form'));else if(file==='custom-battle.js')assert(s.includes('data-form='));else assert(s.includes('unit.form')||s.includes('meta?.form'));}
for(const version of [36,37,38]){const engine=await import('../../simulation/engine-v'+version+'.js'),data=JSON.parse(fs.readFileSync('simulation/data-v'+version+'.json'));const q={rules:version,seed:1729,runs:1,a:[{line:'pikachu',star:3,cell:52,items:['choice-specs'],...(version===38?{form:'spec'}:{})}],b:[{line:'snorlax',star:2,cell:31,items:['leftovers']}]};assert.equal(simulate(engine,data,q).rules,version);}
const hash=s=>createHash('sha256').update(s).digest('hex');
for(const file of ['compositions.html','data/compositions-52.json'])assert.equal(hash(fs.readFileSync(file)),hash(execFileSync('git',['show','HEAD:'+file],{maxBuffer:16*1024*1024})),file+' unexpectedly changed');
const result={passed:true,builderSkillRoundTrip:true,sealIcons,legacyVersions:[36,37,38],compositionFilesUnchanged:true,browserUsed:false,compositionSearchRun:false};
fs.writeFileSync('work/v38-update/runtime-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
