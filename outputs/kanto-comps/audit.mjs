import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {digest,lines,categories,tasks,teamFor,confirmCandidate,searchTask,settings,bisDigest,poolLegal} from './experiment.mjs';
const get=async p=>JSON.parse(await readFile(new URL(p,import.meta.url)));
const peers=await get('peer-results.json'),r=await get('results.json'),search=await get('search.json'),frozen=await get('frozen.json'),ui=await get('boards.json'),checks=[];
const check=(name,fn)=>{fn();checks.push(name);};
check('BIS and source digests agree',()=>{assert.equal(r.bisDigest,bisDigest);assert.equal(r.digest,digest(r.confirmed));assert.equal(ui.digest,peers.digest);});
check('Every carry has one frozen path and displayed result',()=>{
 assert.equal(r.confirmed.length,tasks.length);assert.equal(ui.rows.length,tasks.length);
 for(const cat of categories){const rows=r.confirmed.filter(c=>c.candidate.category===cat.id),count=tasks.filter(t=>t.category===cat.id).length;assert.equal(rows.length,count);assert.equal(new Set(rows.map(c=>c.candidate.carry)).size,count);}
 for(const c of r.confirmed)assert.ok(frozen.frozen.some(f=>digest(f)===digest(c.candidate)));
});
check('Published selections are validation leaders frozen before confirmation',()=>{
 for(const cat of categories){const top=search.searched.filter(s=>s.category===cat.id).map(s=>s.validated[0]).sort((a,b)=>b.result.score-a.result.score||a.candidate.carry.localeCompare(b.candidate.carry));assert.deepEqual(frozen.frozen.filter(c=>c.category===cat.id),top.map(t=>t.candidate));}
});
check('All paths preserve core, cells, carry investment and item budgets',()=>{
 for(const c of r.confirmed){const cat=categories.find(x=>x.id===c.candidate.category);let prior=[];
  for(const board of c.boards){const team=teamFor(c.candidate,board.level);assert.deepEqual(board.team,team);assert.ok(poolLegal(team));assert.equal(team.length,board.level);assert.equal(new Set(team.map(u=>u.cell)).size,team.length);assert.equal(team.reduce((n,u)=>n+u.items.length,0),team.length+3);assert.ok(prior.every(u=>team.some(v=>v.line===u.line&&v.star>=u.star)));assert.equal(team[0].star,cat.cost<=3?3:board.level>=cat.cost+4?2:1);prior=team;}
 }
});
check('Confirmation counts, score, tags and fixed tiers reproduce',()=>{
 for(const c of r.confirmed){const levels=c.boards.length;assert.equal(c.result.n,levels*512);assert.equal(c.fallback.n,c.result.n);
  for(const x of [c.result,c.fallback]){assert.equal(x.wins+x.draws+x.losses,x.n);assert.equal(x.score,(x.wins+x.draws/2)/x.n);assert.equal(x.blocks.length,x.n/2);for(const level of x.byLevel)assert.equal(level.n,512);}
  assert.ok(Math.abs(c.comparison.mean-(c.result.score-c.fallback.score))<1e-12);
  assert.equal(c.bisDependent,c.comparison.mean>=.05&&c.comparison.low>0);const weak=Math.min(...c.result.byLevel.map(l=>l.score));assert.equal(c.tier,c.result.score>=.65&&weak>=.5?'S':c.result.score>=.5?'A':'B');
 }
});
check('Battle totals match every searched and confirmed candidate',()=>assert.equal(r.battles,search.searched.reduce((n,s)=>n+s.battles,0)+r.confirmed.reduce((n,c)=>n+c.result.n+c.fallback.n,0)));
check('UI scores, stars, items, tags and component costs match raw results',()=>{
 for(const row of ui.rows){const c=r.confirmed.find(c=>c.candidate.category===row.category&&c.candidate.carry===row.carry);assert.deepEqual(row.boards,c.boards);const p=peers.rows.find(p=>p.category===row.category&&p.carry===row.carry);assert.equal(row.score,p.result.score);assert.equal(row.tier,p.tier);assert.equal(row.bisDependent,p.bisDependent);assert.equal(row.purchaseGold,row.boards.at(-1).team.reduce((n,u)=>n+lines[u.line].cost*3**(u.star-1),0));}
});
const verified=await get('verification.json'),pilot=search.searched.find(x=>x.category===verified.pilotTask.category&&x.carry===verified.pilotTask.carry);
check('Parallel search matches independently replayed pilot',()=>assert.equal(digest(pilot),verified.pilotDigest));
const actual=confirmCandidate(r.confirmed[0].candidate);
check('Frozen confirmation replays exactly with both gear setups',()=>assert.equal(digest(actual),digest(r.confirmed[0])));
for(const [file,hash] of Object.entries(r.sourceHashes)){const current=digest(await readFile(new URL(file,import.meta.url),'utf8'));check('Source unchanged: '+file,()=>{assert.equal(hash,search.sourceHashes[file]);assert.equal(hash,current);});}
const output={passed:checks.length,checks,battles:r.battles,digest:r.digest};await writeFile(new URL('./audit.json',import.meta.url),JSON.stringify(output,null,2));console.log(JSON.stringify(output));
