import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const D=JSON.parse(fs.readFileSync('analysis/matchups.json')),P=JSON.parse(fs.readFileSync('analysis/provenance.json'));
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
assert.equal(hash(D.builds),P.sourceBuilds);assert.equal(hash(D.pairs),P.pairResults);
const ctx=vm.createContext({window:{}}),html=fs.readFileSync('compositions.html','utf8');
for(const key of ['KANTO_DATA','KANTO_COMPS'])vm.runInContext([...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].trim().startsWith('window.'+key+'='))[1],ctx);
let expectedPairs=0,replays=0,frames=0,variableIntervals=0;
const seen=new Set();
for(const level of [8,9]){
 const eligible=ctx.window.KANTO_COMPS.rows.filter(r=>['S','A'].includes(r.stages.find(s=>s.level===level).tier));
 assert.deepEqual([...D.builds[level].map(r=>r.id)].sort(),[...eligible.map(r=>r.id)].sort());
 expectedPairs+=eligible.length*(eligible.length-1)/2;
 for(const r of D.builds[level]){const original=eligible.find(x=>x.id===r.id).boards.find(b=>b.level===level);assert(r.team.reduce((n,u)=>n+u.items.length,0)<=6,'Replay exceeds the scored six-item budget: '+r.id);assert.equal(JSON.stringify(r.team.map(({line,star,items,cell})=>({line,star,items,cell}))),JSON.stringify(original.team.map(({line,star,items,cell})=>({line,star,items,cell}))));}
}
assert.equal(D.pairs.length,expectedPairs);
for(const p of D.pairs){
 assert(!seen.has(p.key));seen.add(p.key);assert.notEqual(p.a,p.b);assert.equal(p.n,256);assert.equal(p.wins+p.draws+p.losses,p.n);assert.equal(p.score,(p.wins+.5*p.draws)/p.n);
 assert(p.interval[0]>=0&&p.interval[0]<=p.interval[1]&&p.interval[1]<=1);if(p.interval[1]-p.interval[0]>.001)variableIntervals++;
 for(const l of Object.values(p.layouts)){assert.equal(l.wins+l.draws+l.losses,l.n);assert.equal(l.score,(l.wins+.5*l.draws)/l.n);if(l.deltaInterval)assert(l.deltaInterval[0]<=l.deltaInterval[1]);}
 for(const m of p.metrics)for(const [k,v]of Object.entries(m))assert(v===null||Number.isFinite(v),k);
 const f=JSON.parse(fs.readFileSync('analysis/replays/'+p.key+'.json'));assert.equal(f.a,p.a);assert.equal(f.b,p.b);assert.equal(f.level,p.level);assert.equal(f.replays.length,p.replays.length);
 for(const r of f.replays){
  replays++;assert(p.replays.some(x=>x.seed===r.seed&&x.side===r.side&&x.value===r.value));assert.equal(r.value,r.winner===-1?.5:r.winner===r.side?1:0);
  let t=-1;for(const frame of r.frames){frames++;assert.equal(frame.length,1+r.units.length*8);assert(frame[0]>t);t=frame[0];assert(frame.every(Number.isFinite));}assert.equal(r.frames[0][0],0);assert.equal(r.frames.at(-1)[0],r.duration);
  assert.deepEqual(r.statFields,['dealt','taken','healed','shielded','mitigated']);assert.equal(r.stats.length,r.frames.length);
  for(let i=0;i<r.stats.length;i++){assert.equal(r.stats[i][0],r.frames[i][0]);assert.equal(r.stats[i].length,1+r.units.length*r.statFields.length);assert(r.stats[i].every(Number.isFinite));}
  assert(r.events.some(e=>e.k==='end'&&e.winner===r.winner));let previous=-1;for(const e of r.events){assert(e.t>=previous);previous=e.t;}
 }
}
// A broken bootstrap that repeatedly samples a full low-bit PRNG cycle produces collapsed intervals.
assert(variableIntervals>D.pairs.length/2,'Most nontrivial matchup intervals should retain seed variation');
// Verify native replay parity and deterministic repeats on a spread of levels, outcomes and sides.
const root=path.resolve(process.env.KANTO_NATIVE_ROOT||'work/native-v34'),harness=await import(pathToFileURL(path.join(root,'headless.mjs'))),{Battle}=harness,native={J:harness.route.ps};
const mirror=team=>team.map(u=>({...u,cell:55-u.cell}));let nativeCases=0;
for(let i=0;i<D.pairs.length;i+=29){const p=D.pairs[i],a=D.builds[p.level].find(r=>r.id===p.a),b=D.builds[p.level].find(r=>r.id===p.b),f=JSON.parse(fs.readFileSync('analysis/replays/'+p.key+'.json'));
 for(const r of f.replays){let digest;for(let repeat=0;repeat<2;repeat++){
  const battle=r.side?new Battle(b.team,mirror(a.team),r.seed,null):new Battle(a.team,mirror(b.team),r.seed,null);battle.pvpClock=true;battle.start();let statIndex=0;
  const checkStats=()=>{const sample=r.stats[statIndex];if(!sample||sample[0]!==Math.round(battle.time*1000)/1000)return;for(let j=0;j<battle.units.length;j++)for(let k=0;k<r.statFields.length;k++)assert.equal(sample[1+j*r.statFields.length+k],Math.round(battle.units[j][r.statFields[k]]*1000)/1000);statIndex++;};
  checkStats();while(!battle.over){battle.step();checkStats();}assert.equal(statIndex,r.stats.length);
  assert.equal(battle.winner,r.winner);assert.equal(Math.round(battle.time*1000)/1000,r.duration);
  const final=r.frames.at(-1);for(let j=0;j<battle.units.length;j++){const u=battle.units[j],o=1+j*8;assert.equal(Math.max(0,Math.round(u.hp)),final[o+3]);assert.equal(+u.alive,final[o+6]);}
  const next=hash({winner:battle.winner,time:battle.time,rng:battle.rngState,units:battle.units,events:battle.events});if(repeat)assert.equal(next,digest);digest=next;nativeCases++;
 }}
}
const nativeHash=createHash('sha256').update(fs.readFileSync(path.join(root,'assets/route-k2DWeEO1.js'))).digest('hex');assert.equal(nativeHash,D.source.nativeHash);assert.equal(nativeHash,P.nativeManifest.files['route-k2DWeEO1.js']);
for(const type of D.types)for(const def of D.types)assert.equal(D.typeChart[type][def],native.J(type,[def]));
for(const build of Object.values(D.builds).flat())for(const u of build.team)for(const type of D.types)assert.equal(u.types.reduce((m,t)=>m*D.typeChart[type][t],1),native.J(type,u.types));
const verification={passed:true,pairs:D.pairs.length,replays,frames,nativeCases,variableIntervals,battles:D.source.totalBattles,verifiedAt:new Date().toISOString()};
fs.writeFileSync('analysis/verification.json',JSON.stringify(verification,null,2));console.log(JSON.stringify(verification));
