import {readFile,writeFile} from 'node:fs/promises';
import {digest,lines,categories,bisDigest,settings,teamFor,opponent} from './experiment.mjs';
const r=JSON.parse(await readFile(new URL('./results.json',import.meta.url)));
const peers=JSON.parse(await readFile(new URL('./peer-results.json',import.meta.url)));
const data=JSON.parse(await readFile(new URL('../kanto-headless-v2/data.json',import.meta.url)));
const manifest=JSON.parse(await readFile(new URL('../kanto-headless-v2/manifest.json',import.meta.url)));
const economy=JSON.parse(await readFile(new URL('../kanto-headless-v2/economy.json',import.meta.url)));
if(r.bisDigest!==bisDigest||r.digest!==digest(r.confirmed))throw Error('Composition source digest mismatch');
if(peers.sourceSearchDigest!==r.digest||peers.bisDigest!==bisDigest)throw Error('Peer tournament source mismatch');
const rows=r.confirmed.map((c,i)=>{
 const last=c.boards.at(-1),carry=last.team[0],cat=categories.find(cat=>cat.id===c.candidate.category);
 const leadTraits=lines[carry.line].traits.join(' / ');
 const p=peers.rows.find(p=>p.category===cat.id&&p.carry===c.candidate.carry);
 return {id:'comp-'+(i+1),name:lines[carry.line].forms[carry.star-1].name+' '+leadTraits,
 category:cat.id,strategy:cat.name,tier:p.tier,carry:c.candidate.carry,bisDependent:p.bisDependent,score:p.result.score,battles:p.result.n,peers:p.peers,
 stages:p.result.byLevel,impact:p.comparison,boards:c.boards,fallbackScore:p.fallback.score,referenceScore:c.result.score,referenceTier:c.tier,
 purchaseGold:last.team.reduce((n,u)=>n+lines[u.line].cost*3**(u.star-1),0)};
}).sort((a,b)=>['S','A','B'].indexOf(a.tier)-['S','A','B'].indexOf(b.tier)||b.score-a.score||a.id.localeCompare(b.id));
const totalBattles=r.battles+peers.battles,totalMs=r.elapsedMs+peers.elapsedMs;
const ui={version:r.VERSION,build:data.build,capturedDate:'2026-10-21',scoreSource:'within-strategy peers',battles:totalBattles,digest:peers.digest,sourceSearchDigest:r.digest,bisDigest:r.bisDigest,shopOdds:economy.odds,rows};
await writeFile(new URL('./boards.json',import.meta.url),JSON.stringify(ui,null,2));
await writeFile(new URL('../kanto-team-builder/dist/comps-data.js',import.meta.url),'window.KANTO_COMPS='+JSON.stringify(ui)+';\n');
const csv=records=>records.map(row=>row.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
await writeFile(new URL('./rankings.csv',import.meta.url),csv([['name','strategy','tier','BIS_dependent','confirmation_score','battles','BIS_impact_pp','impact_low_pp','impact_high_pp','unit_copy_gold','final_board'],...rows.map(c=>[c.name,c.strategy,c.tier,c.bisDependent,c.score,c.battles,c.impact.mean*100,c.impact.low*100,c.impact.high*100,c.purchaseGold,c.boards.at(-1).team.map(u=>`${lines[u.line].forms[u.star-1].name} ${u.star}*`).join(' / ')])]));
const fixtureProtocol={categories,settings,bisDigest,engine:data.build,opponents:Object.fromEntries(['screen','validation','confirmation'].map(stage=>[stage,[5,6,7,8,9].map(level=>({level,contexts:Array.from({length:settings[stage].contexts},(_,i)=>opponent(stage,i,level))}))]))};
await writeFile(new URL('./protocol.json',import.meta.url),JSON.stringify(fixtureProtocol,null,2));
const table=rows.map(c=>`| ${c.tier} | ${c.name} | ${c.strategy} | ${(c.score*100).toFixed(1)}% | ${c.battles} | ${c.bisDependent?'Yes':'No'} |`).join('\n');
const localTime=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',dateStyle:'long',timeStyle:'short'}).format(new Date(peers.finishedAt))+' (Asia/Bangkok)';
const report=`# Kanto Tactics composition search

Completed ${localTime}. Native build: ${data.build}, captured 21 October 2026. These are provisional combat tiers, not measured full-match economy or placement rankings.

## Measured search

- ${r.searchTasks} carry/strategy searches across Reroll 5, Reroll 6, Reroll 7, Fast 8 and legendary boards.
- ${r.searchedCandidates} distinct ordered composition/formation candidates screened within their carry tasks. This is a bounded heuristic search, not exhaustive enumeration of every team.
- ${totalBattles.toLocaleString('en-US')} completed native battles: ${r.battles.toLocaleString('en-US')} in the initial search/reference confirmation and ${peers.battles.toLocaleString('en-US')} in the follow-up peer tournament. ${(totalBattles/(totalMs/1000)).toFixed(1)} battles/second over ${(totalMs/60000).toFixed(2)} summed measured phase minutes using five workers. Battles are not full games.
- ${r.hardware.cpu.trim()}, ${r.hardware.logical} logical processors, ${(r.hardware.ramBytes/2**30).toFixed(2)} GiB RAM, ${r.hardware.platform} ${r.hardware.release}, Node ${r.runtime}. Host not isolated. BIS had finished before this run began.
- Simulator uses its native PvP clock, including overtime and the 54-second PvP limit; no rendering, browser globals, networking or unseeded randomness. Weather explicitly disabled; no boons or boss rules.

## Published candidates

| Tier | Composition | Strategy | Confirmation score | Battles per gear setup | BIS dependent |
|---|---|---|---:|---:|---|
${table}

S requires overall peer score >=65% and every checkpoint >=50%. A requires overall >=50%. Remaining candidates are B. These thresholds were fixed before search. Tiers are relative to other boards in the same strategy, not across economy plans. The displayed paths include one validation winner for every eligible carry in every category, frozen before confirmation; neither reference confirmation nor the peer tournament changes these paths. Equal numbers of fights are used per checkpoint, so the aggregate weights checkpoints equally.

The initial generated reference benchmark rated 51 of 58 candidates S and was too easy to separate the optimized paths. We therefore added a follow-up closed round robin of the frozen candidates, retaining the same thresholds. This was an exploratory follow-up, not the original preregistered evaluation. No candidates were dropped using the peer results. The initial scores and ratings remain in results.json and as referenceScore/referenceTier in boards.json.

Every pair within a strategy fights at all its checkpoints using 32 fresh seeds and both sides. Each pair runs three conditions: both carries on BIS, A with native-fit fallback against B on BIS, and B with fallback against A on BIS. This measures item sensitivity against the same frozen peer pool. Primary battles are shared by the two participants, and are counted once in measured throughput. Each candidate's displayed battle count is its participation count. Seeds are unique within this tournament and disjoint from the earlier composition phases; peer-protocol.json records them all. This is a closed cohort, not a sampled live meta or an independent external opponent population.

## Protocol

Each task starts with 12 trait-biased random ordered paths, retains a five-member beam, and performs three generations of 18 mutation attempts. Duplicate candidates within a task are cached. Mutations replace a support, reorder supports/additions, or choose one of three role-based formation patterns. Candidates are ranked by real native battle score, with weakest checkpoint as a tie break. Formation search covers those patterns, not every hex placement. The whole smallest board stays locked; flexible pivots and support replacements are outside this first search.

Screening: four generated opponent archetypes and one seed each, both sides, at every checkpoint. Two shortlisted paths per carry receive eight unused generated opponent lineups and eight fresh seeds, both sides. For each carry, its validation winner is frozen. Final confirmation uses eight further unused generated lineups and 32 new seeds, both sides, at every checkpoint. That is 512 battles per checkpoint per gear setup. Source code, exact opponent boards and result sequences are saved. Opponents are fixed sampled trait-biased teams, not a learned player population; their strength can differ substantially.

Each path is an ordered list with unique Pokémon lines. The smallest board remains a subset of every later board, with no replacement of its invested core. Reroll 5 uses a one-cost carry at three stars and checkpoints 5/6/7/8; Reroll 6 a two-cost carry at three stars and 6/7/8; Reroll 7 a three-cost carry at three stars and 7/8. The designated secondary frontline is also three stars if its cost is no higher than the reroll carry cost. Other supports are two stars, five-cost additions one star. Fast 8 uses a four-cost carry, one star at 7 and two stars at 8. Legendary boards use a five-cost carry, one star at 8 and two stars at 9, with three or four five-cost lines total. Normal Eevee at stars 2/3 is allowed through the verified Keep Eevee action; the planner states that requirement. Every candidate and reference board respects per-line native pool copy limits, including the shared Eevee pool. Pool contention between opposing players is not modeled. All evolved forms are native reachable line/star forms, but acquisition sequences are not established.

The carry receives its frozen selected build from the new BIS confirmation, not whichever alternative happened to win confirmation. A separate frontline unit receives the first two items of its BIS build; other units receive one native item-fit pick. This is a fixed gearing policy, not a joint team item optimization. Every candidate and reference opponent has board-size + 3 finished items. Inventories are not constrained to a common component multiset. Final component requirements and the gold represented by unit copies are displayed, excluding XP, rolls and removed equipment. Native item rules and skill switching run normally.

BIS dependence compares the exact same path to three distinct native item-fit items on its carry; allies and formations stay fixed. A tag requires >=5 percentage points of improvement and a positive descriptive paired 95% interval. Side assignments are averaged into blocks before calculating intervals. These normal intervals do not correct for multiple comparisons, matchup selection or search uncertainty. Absence of the tag does not prove item independence; the label refers only to this tested replacement.

## Limitations

Reroll and Fast 8 labels describe proposed investment plans based on native unit costs and shop odds. We did not simulate rolling to hit, shared shop-pool contention, economic transitions, HP loss while saving, XP timing, item acquisition, Magnet constraints, or Eevee branch acquisition. S tier does not mean a proven top-four or first-place rate. Full local matches with these policies remain the next validation step. Early-board completion is assumed, so survival before hitting a reroll carry is unmeasured.

The reference opponent generator uses the same item count but does not equalize total unit-copy gold with every candidate. A stronger finished board can be more expensive. No live player pick rate, win share or average placement is inferred. All results refer to the captured build, not future item updates.

## Reproduction

From the original workspace root, with sibling kanto-headless-v2, kanto-bis-v2 and kanto-team-builder directories:

\`\`\`powershell
node outputs/kanto-comps/verify.mjs
node outputs/kanto-comps/run.mjs
node outputs/kanto-comps/peers.mjs
node outputs/kanto-comps/report.mjs
node outputs/kanto-comps/audit.mjs
node outputs/kanto-comps/verify-peer-tournament.mjs
\`\`\`

run.mjs overwrites results for this experiment. No npm packages are needed. The engine assets remain unmodified. Search digest: ${r.digest}. Peer tournament digest: ${peers.digest}. BIS confirmation digest: ${r.bisDigest}.
`;
await writeFile(new URL('./REPORT.md',import.meta.url),report);
console.log(JSON.stringify({rows:rows.length,tiers:Object.fromEntries(['S','A','B'].map(t=>[t,rows.filter(r=>r.tier===t).length])),battles:totalBattles,digest:peers.digest}));
