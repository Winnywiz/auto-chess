import fs from 'node:fs';
import assert from 'node:assert/strict';
import {identity,hash,create,LocalMatch,planner,items} from './native.mjs';
import {episode} from './episode.mjs';
import {planning,makePlan} from './policy.mjs';
import {shopTrial} from './shop.mjs';
import {match} from '../../work/native-v34/headless.mjs';
const input=JSON.parse(fs.readFileSync('work/realism-v34/matches.json')),shops=JSON.parse(fs.readFileSync('work/realism-v34/shops.json'));
const near=JSON.parse(fs.readFileSync('work/realism-v34/shops-near.json')),joint=JSON.parse(fs.readFileSync('work/realism-v34/joint.json'));
assert.equal(input.metadata.engineIdentity,identity);assert.equal(input.metadata.games,input.results.length);
const rows=JSON.parse(fs.readFileSync('compositions.html','utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).rows;
const keys=new Set();let fights=0,snapshots=0,overBudget=0;
for(const r of input.results){
  const key=[r.id,r.mode,r.seals,r.itemCap,r.seed].join('/');assert(!keys.has(key));keys.add(key);
  assert(Number.isInteger(r.place)&&r.place>=1&&r.place<=8);assert(r.rounds>0&&r.rounds<=150);assert(r.last);fights+=r.fights;
  for(const [error,n]of Object.entries(r.errors)){assert(['benchFull','noGold','maxItems'].includes(error),error);assert(n>=0);}
  for(const s of [...Object.values(r.levels),...Object.values(r.checkpoints)]){
    snapshots++;assert(new Set(s.team.map(u=>u.cell)).size===s.team.length);assert(s.gold>=0);assert(s.hp>0);
    assert(s.team.every(u=>u.star>=1&&u.star<=3&&u.items.length<=3));
    const full=s.team.reduce((n,u)=>n+u.items.filter(i=>items[i]?.kind==='full').length,0);assert.equal(full,s.items);
    if(full>r.itemCap)overBudget++;
    assert(s.team.length<=(r.seals?s.level+1:s.level));
  }
  for(const pick of r.sealPicks)assert(pick.offer[pick.selected],'Picked an unoffered Seal');
}
assert.equal(fights,input.metadata.fights);assert.equal(overBudget,0);
assert.equal(shops.rows.length,540);assert(shops.rows.every(r=>r.n===shops.trials&&r.meanSpend<=r.gold&&r.hits>=0&&r.hits<=r.n));
assert.equal(near.rows.length,108);assert(near.rows.every(r=>r.owned===8&&r.n===512&&r.meanSpend<=r.gold));
assert.equal(joint.rows.length,72);assert(joint.rows.every(r=>r.n===512&&r.rate===r.hits/r.n&&r.meanSpend<=r.gold));
const c={line:'exeggcute',level:7,gold:40,owned:6,taken:6,goal:9};assert.deepEqual(shopTrial(c,'shop-repeat'),shopTrial(c,'shop-repeat'));
for(const id of ['water-squirtle','v34-search-1','adapt-sheet-3'])for(const seals of [false,true]){
  const recorded=input.results.find(r=>r.id===id&&r.mode==='practical'&&r.seals===seals&&r.itemCap===6);
  const actual=episode(rows.find(r=>r.id===id),recorded.seed,{mode:'practical',seals,itemCap:6});assert.equal(actual.digest,recorded.digest,id+' deterministic full-match repeat');
}
// Direct semantic parity of the adapter planner against the original native class method.
const g=create('planner-parity/0');while(g.st.stage==='carousel')g.closeRound();
const state=structuredClone(g.st),a=LocalMatch.restore(structuredClone(state)),b=LocalMatch.restore(structuredClone(state)),p=makePlan(rows[0],'control',99);
planning(a,p);const bot=planner.makeBot({id:b.st.me,profile:'elite',seed:parseInt(hash([b.st.seed,'controller-v1']).slice(0,8),16)});b.st.bots[b.st.me]=bot;
for(let i=0;i<180;i++){b.botStep(b.st.me);if(bot.turn.stage==='done')break;}assert.deepEqual(a.me,b.me);
let attainedPairs=0,attainedBattles=0;
if(fs.existsSync('work/realism-v34/attained.json')){
  const attained=JSON.parse(fs.readFileSync('work/realism-v34/attained.json'));assert.equal(attained.engineIdentity,identity);
  for(const r of attained.results){assert(r.score>=0&&r.score<=1);assert.equal(r.battles,r.snapshotScores.length*8);assert.equal(r.sampleSeedsA.length,r.snapshotScores.length);assert.equal(r.sampleSeedsB.length,r.snapshotScores.length);attainedBattles+=r.battles;}
  assert.equal(attainedBattles,attained.battles);attainedPairs=attained.results.length;
  for(let i=0;i<attained.results.length;i+=227){
    const p=attained.results[i],record=id=>input.results.find(r=>r.id===id&&r.mode==='practical'&&!r.seals&&r.itemCap===6&&r.seed===(id===p.a?p.sampleSeedsA[0]:p.sampleSeedsB[0]));
    const team=id=>p.context==='level8'?record(id).levels[8].team:record(id).checkpoints['4-2'].team;
    const seeds=Array.from({length:4},(_,j)=>parseInt(hash(['realism-attained-v1',p.context,p.a,p.b,0,j]).slice(0,8),16));
    assert.equal(match(team(p.a),team(p.b),seeds),p.snapshotScores[0],'Attained-board score reproduction');
  }
}
const result={passed:true,games:input.results.length,fights,snapshots,shopScenarios:shops.rows.length+near.rows.length,shopTrials:shops.rows.length*shops.trials+near.rows.length*512,jointScenarios:joint.rows.length,jointTrials:joint.rows.length*512,totalConditionalTrials:(shops.rows.length+near.rows.length+joint.rows.length)*512,fullMatchRepeats:6,plannerParity:true,overBudget,attainedPairs,attainedBattles,verified:new Date().toISOString()};
fs.writeFileSync('work/realism-v34/verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
