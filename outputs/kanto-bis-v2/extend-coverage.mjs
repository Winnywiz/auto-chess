// Runs after the initial 169-state batch. Does not change or rerun those searches.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {runState,digest,fixturesFor} from './experiment.mjs';
import {additionalStates,states,excludedStates} from './coverage.mjs';
import * as p from '../kanto-headless-v2/assets/pvpNet-fyWy55om.js';
p._t();
const proof=[];
for(const star of [2,3]){
 const units=star===2?{a:{id:'a',line:'eevee',star:1},b:{id:'b',line:'eevee',star:1}}:{a:{id:'a',line:'eevee',star:2},b:{id:'b',line:'eevee',star:2},c:{id:'c',line:'eevee',star:1},d:{id:'d',line:'eevee',star:1}};
 let s={gold:100,board:{},floor:[],bench:[...Object.keys(units),...Array(9-Object.keys(units).length).fill(null)],units,shop:['eevee',null,null,null,null],shopShiny:Array(5).fill(false),items:[],itemQueue:[],nextId:10,shinyBought:0,phase:'planning',mode:'pvp',level:6,round:1,rerolls:0};
 s=p.ht(s,{t:'eeveeKeep',on:true}).s;const result=p.ht(s,{t:'buy',slot:0});
 assert.ok(!result.err);assert.equal(result.s.units.a.line,'eevee');assert.equal(result.s.units.a.star,star);proof.push({star,events:result.ev});
}
await writeFile(new URL('./eevee-reachability.json',import.meta.url),JSON.stringify({scope:'Synthetic native action fixtures establish legal Keep Eevee merges, not acquisition probability.',proof},null,2));
const path=new URL('./results.json',import.meta.url),result=JSON.parse(await readFile(path));
if(result.completed!==states.length){
 const start=performance.now();let addedBattles=0;
 for(const state of additionalStates){
  const row=runState(state);result.results.push(row);result.battles+=row.battles;addedBattles+=row.battles;console.log(JSON.stringify({event:'extended-state',line:state.line,star:state.star,battles:row.battles}));
 }
 result.extension={reason:'New Keep Eevee action makes unbranched stars 2 and 3 reachable.',additionalStates,addedBattles,elapsedMs:performance.now()-start};
 result.completed=states.length;result.total=states.length;result.excludedStates=excludedStates;result.elapsedMs+=result.extension.elapsedMs;result.battlesPerSecond=result.battles/(result.elapsedMs/1000);result.finishedAt=new Date().toISOString();
 result.deterministicResultsSha256=digest(result.results.map(({stageTimes,...r})=>r));
 for(const file of ['coverage.mjs','extend-coverage.mjs'])result.sourceHashes[file]=createHash('sha256').update(await readFile(new URL(file,import.meta.url))).digest('hex');
 await writeFile(path,JSON.stringify(result));
 const protocol=JSON.parse(await readFile(new URL('./protocol.json',import.meta.url)));protocol.states=states;protocol.excludedStates=excludedStates;protocol.sourceHashes=result.sourceHashes;protocol.coverageExtension=result.extension;
 protocol.fixtures.push(...additionalStates.map(s=>({...s,training:fixturesFor(s.line,s.star,'refine'),validation:fixturesFor(s.line,s.star,'validation')})));
 await writeFile(new URL('./protocol.json',import.meta.url),JSON.stringify(protocol,null,2));
}
await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['outputs/kanto-bis-v2/verify.mjs','--replay-pilot'],{stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Extended coverage verification failed')));});
