import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {play} from './peers.mjs';
import {digest,categories,seedFor,settings,bisDigest} from './experiment.mjs';
const get=async name=>JSON.parse(await readFile(new URL(name,import.meta.url)));
const result=await get('peer-results.json'),protocol=await get('peer-protocol.json'),search=await get('results.json'),ui=await get('boards.json'),checks=[];
const awaitableSource=await readFile(new URL('./peers.mjs',import.meta.url));
const check=(name,fn)=>{fn();checks.push(name);};
check('Peer cohort and source hashes match frozen search and BIS',()=>{
 assert.equal(result.sourceSearchDigest,search.digest);assert.equal(result.bisDigest,bisDigest);assert.equal(protocol.sourceSearchDigest,search.digest);assert.equal(result.sourceSha256,createHash('sha256').update(awaitableSource).digest('hex'));
});
check('Complete unordered within-strategy round robin, no self matches or repeats',()=>{
 const seen=new Set();let expected=0;for(const cat of categories){const n=search.confirmed.filter(c=>c.candidate.category===cat.id).length;expected+=n*(n-1)/2;}
 assert.equal(protocol.jobs.length,expected);assert.equal(result.pairs.length,expected);
 for(const job of protocol.jobs){assert.notEqual(job.a.carry,job.b.carry);const key=job.category+'/'+[job.a.carry,job.b.carry].sort().join('/');assert.ok(!seen.has(key));seen.add(key);for(const candidate of [job.a,job.b])assert.ok(search.confirmed.some(c=>digest(c.candidate)===digest(candidate)));}
});
check('Fresh collision-free peer seeds, paired across gear and side assignments',()=>{
 const used=new Set();for(const stage of ['screen','validation','confirmation'])for(const level of [5,6,7,8,9])for(let c=0;c<settings[stage].contexts;c++)for(let i=0;i<settings[stage].seeds;i++)used.add(seedFor('combat',stage,level,c,i));
 for(const job of protocol.jobs)for(const l of job.levels){assert.equal(l.seeds.length,32);for(const seed of l.seeds){assert.ok(!used.has(seed));used.add(seed);}}
});
check('All peer scores and counts match raw pair outcomes',()=>{
 let battles=0;
 for(const row of result.rows){const levels=categories.find(c=>c.id===row.category).levels,peers=result.rows.filter(p=>p.category===row.category).length-1;assert.equal(row.peers,peers);assert.equal(row.result.n,levels.length*peers*64);assert.equal(row.fallback.n,row.result.n);
  let base=0,fallback=0,n=0;for(const pair of result.pairs)if(pair.category===row.category&&(pair.a===row.carry||pair.b===row.carry))for(const l of pair.levels){const a=pair.a===row.carry;assert.equal(l.a.length,64);assert.equal(l.fa.length,64);assert.equal(l.fb.length,64);base+=l.a.reduce((s,x)=>s+(a?x:1-x),0);fallback+=(a?l.fa:l.fb).reduce((s,x)=>s+x,0);n+=64;}
  assert.equal(row.result.score,base/n);assert.equal(row.fallback.score,fallback/n);assert.ok(Math.abs(row.comparison.mean-(base-fallback)/n)<1e-12);assert.equal(row.bisDependent,row.comparison.mean>=.05&&row.comparison.low>0);
  const tier=row.result.score>=.65&&Math.min(...row.result.byLevel.map(l=>l.score))>=.5?'S':row.result.score>=.5?'A':'B';assert.equal(row.tier,tier);
 }
 for(const pair of result.pairs)for(const l of pair.levels)battles+=l.a.length*3;assert.equal(battles,result.battles);
});
check('Primary scores average 50 percent within every strategy',()=>{for(const cat of categories){const rows=result.rows.filter(r=>r.category===cat.id);assert.ok(Math.abs(rows.reduce((n,r)=>n+r.result.score,0)/rows.length-.5)<1e-12);}});
check('A complete peer pair replays exactly in this fresh process',()=>assert.equal(digest(play(protocol.jobs[0])),digest(result.pairs[0])));
check('UI uses peer scores, tiers, counts and sensitivity without changing boards',()=>{
 assert.equal(ui.digest,result.digest);assert.equal(ui.battles,search.battles+result.battles);
 for(const row of ui.rows){const p=result.rows.find(p=>p.category===row.category&&p.carry===row.carry),c=search.confirmed.find(c=>c.candidate.category===row.category&&c.candidate.carry===row.carry);assert.equal(row.score,p.result.score);assert.equal(row.tier,p.tier);assert.equal(row.battles,p.result.n);assert.deepEqual(row.boards,c.boards);assert.deepEqual(row.impact,p.comparison);}
});
check('Peer result digest reproduces',()=>assert.equal(result.digest,digest({rows:result.rows,pairs:result.pairs})));
await writeFile(new URL('./peer-verification.json',import.meta.url),JSON.stringify({passed:checks.length,checks,battles:result.battles,digest:result.digest},null,2));console.log(JSON.stringify({passed:checks.length,battles:result.battles,digest:result.digest}));
