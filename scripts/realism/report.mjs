import fs from 'node:fs';
const root='work/realism-v34/',out='../../outputs/realism-v34/';fs.mkdirSync(out,{recursive:true});
const read=f=>JSON.parse(fs.readFileSync(root+f));
const input=read('matches.json'),summary=read('summary.json'),shops=read('shops.json'),joint=read('joint.json'),attained=read('attained.json'),verification=read('verification.json');
const near=read('shops-near.json'),conditionalTrials=(shops.rows.length+near.rows.length+joint.rows.length)*512;
const rows=JSON.parse(fs.readFileSync('compositions.html','utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).rows,byId=Object.fromEntries(rows.map(r=>[r.id,r]));
const pct=x=>(100*x).toFixed(1)+'%',mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const baseline=summary.summaries.filter(r=>r.mode==='practical'&&!r.seals&&r.itemCap===6);
const attainedSummary=[];
for(const context of ['level8','round4-2'])for(const row of rows){
  const pairs=attained.results.filter(p=>p.context===context&&(p.a===row.id||p.b===row.id)),groups={};
  for(const p of pairs){const own=p.a===row.id,other=own?p.b:p.a;(groups[byId[other].category]??=[]).push(own?p.score:1-p.score);}
  attainedSummary.push({context,id:row.id,name:row.name,score:pairs.length?mean(Object.values(groups).map(mean)):null,groups:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,mean(v)])),...attained.availability[context][row.id]});
}
const contrasts=[];
for(const arm of summary.summaries.filter(r=>r.mode==='practical'&&(r.itemCap!==6||r.seals))){
  const a=input.results.filter(r=>r.id===arm.id&&r.mode===arm.mode&&r.itemCap===arm.itemCap&&r.seals===arm.seals),b=new Map(input.results.filter(r=>r.id===arm.id&&r.mode==='practical'&&r.itemCap===6&&!r.seals).map(r=>[r.seed,r]));
  const deltas=a.filter(r=>b.has(r.seed)).map(r=>Number(r.place<=4)-Number(b.get(r.seed).place<=4));if(!deltas.length)continue;
  const delta=mean(deltas),se=Math.sqrt(deltas.reduce((s,x)=>s+(x-delta)**2,0)/(deltas.length-1)/deltas.length);
  contrasts.push({id:arm.id,seals:arm.seals,itemCap:arm.itemCap,n:deltas.length,top4Delta:delta,pairedApproxInterval:[Math.max(-1,delta-1.96*se),Math.min(1,delta+1.96*se)]});
}
const csv=x=>'"'+String(x??'').replaceAll('"','""')+'"';
fs.writeFileSync(out+'attained-scores.json',JSON.stringify({method:attained.method,rows:attainedSummary}));fs.writeFileSync(out+'paired-sensitivity.json',JSON.stringify(contrasts));
for(const file of ['joint.json','shops-near.json','verification.json','live-check.json','study-inputs.json'])fs.copyFileSync(root+file,out+file);
const shopColumns=['line','cost','level','gold','owned','taken','goal','n','rate','meanSpend','meanRolls','meanBought'];
fs.writeFileSync(out+'shop-probabilities.csv',[shopColumns.join(','),...[...shops.rows,...near.rows].map(r=>shopColumns.map(k=>csv(r[k])).join(','))].join('\n'));
const acols=['context','id','name','score','observed','total','sampled'];fs.writeFileSync(out+'attained-scores.csv',[acols.join(','),...attainedSummary.map(r=>acols.map(k=>csv(r[k])).join(','))].join('\n'));
const jcols=['name','level','gold','taken','n','hits','rate','meanSpend'];fs.writeFileSync(out+'joint-upgrades.csv',[['targets','owned',...jcols].join(','),...joint.rows.map(r=>[csv(r.targets.map(t=>t.line).join('+')),csv(r.targets.map(t=>t.owned).join('+')),...jcols.map(k=>csv(r[k]))].join(','))].join('\n'));
const table=baseline.map(r=>`| ${r.id} | ${r.strategy} | ${pct(r.top4)} | ${r.meanPlacement.toFixed(2)} | ${r.carryTargetStar}★: ${pct(r.carryHit)} | ${pct(r.levelRates[8])} | ${pct(r.meanFinalLineFraction)} |`);
const representative=['adapt-sheet-8','path-8','v34-search-1','v34-search-2','water-staryu','adapt-sheet-3'].map(id=>baseline.find(r=>r.id===id));
const examples=representative.map(r=>`| ${r.name} (${r.id}) | ${pct(r.top4)} | ${r.carryTargetStar}★: ${pct(r.carryHit)} | ${pct(r.carryOnLastBoard)} | ${pct(r.levelRates[8])} | ${pct(r.exactCapUnits)} |`);
const singleTable=[['bulbasaur',5,6],['bulbasaur',7,6],['abra',6,6],['exeggcute',7,6],['aerodactyl',8,1],['mewtwo',8,1],['mewtwo',9,1]].map(([line,level,owned])=>{const a=shops.rows.find(r=>r.line===line&&r.level===level&&r.owned===owned&&r.gold===40&&r.taken===0),b=shops.rows.find(r=>r.line===line&&r.level===level&&r.owned===owned&&r.gold===40&&r.taken===6);return `| ${line} | ${level} | ${owned} | ${a.goal} | ${pct(a.rate)} | ${pct(b.rate)} |`;});
const jointTable=joint.rows.filter(r=>r.taken===0&&r.targets[0].owned===(r.level<=7?6:1)&&(r.gold===60||r.gold===100)).map(r=>`| ${r.name} | ${r.level} | ${r.targets[0].owned} each | ${r.gold} | ${pct(r.rate)} |`);
const cross=representative.map(r=>{const l=attainedSummary.find(x=>x.id===r.id&&x.context==='level8'),t=attainedSummary.find(x=>x.id===r.id&&x.context==='round4-2');return `| ${r.id} | ${pct(l.score??0)} | ${l.observed}/${l.total} | ${pct(t.score??0)} | ${t.observed}/${t.total} |`;});
const control=summary.summaries.filter(r=>r.mode==='control').map(r=>`- Native elite control, Seals ${r.seals?'on':'off'}: ${r.meanPlacement.toFixed(2)} average placement, ${pct(r.top4)} top four over ${r.n} complete local matches.`).join('\n');
const top23=input.results.filter(r=>r.mode==='practical'&&!r.seals&&r.itemCap===6&&[2,3].includes(r.place));
const text=`# v34 realism and reroll study, 22 October 2026

The fixed capped boards are much easier to win with than to acquire. The strongest practical revision is to separate a stable two-star board from an optional three-star cap, and to make reroll decisions depend on copies, gold, health and competition.

## Completed work

- ${input.metadata.games.toLocaleString('en-US')} complete eight-player native local matches across all 48 published composition variants, including practical/cap-chase comparisons, actual-offer Seals and five/seven-item sensitivity arms.
- ${input.metadata.fights.toLocaleString('en-US')} native fights inside those complete matches.
- ${conditionalTrials.toLocaleString('en-US')} conditional native shop trials: 540 base single-target conditions, 108 near-completion conditions and 72 joint-upgrade conditions, 512 fixed-seed trials per condition.
- ${attained.battles.toLocaleString('en-US')} additional fights between boards actually reached, across ${attained.results.length.toLocaleString('en-US')} matchup pairs. These include both same-family mirrors and other strategy tags.
- Six full-match deterministic reproductions, native-planner parity, acquisition constraints and ${verification.snapshots.toLocaleString('en-US')} recorded snapshot checks passed. No equipped-item budget overrun occurred.

## What the results support

1. **Reroll 5 is a plausible route for one-cost carries.** Keep upgraded core units as the board levels. A multi-one-cost reroll can be sensible when already close on several targets. The Ground trio joint test supports this conditionally; it does not justify beginning three independent chases from zero.
2. **Reroll 6 needs a stronger entry condition.** A two-star carry plus a spare pair is different from six copies. Even with six copies already owned, 40 gold is far from a guaranteed two-cost three-star upgrade. Prioritize the carry and frontline rather than demanding all supports at three stars.
3. **Reroll 7 should be conditional for three-cost three-stars.** The two new Exeggutor variants usually played with one- or two-star Exeggutor. The first reached three-star Exeggutor in 0/64 practical baseline matches, the second in 1/64. Their level-7 multi-upgrade caps should not be the default game plan. A two-star Exeggutor board into level 8 is the better baseline to investigate; chase three stars when already close and the pool/economy permit it. With eight copies already owned, 40 gold at level 7 completed Exeggutor in 75.2% of uncontested trials, versus 12.9% from six copies. Six enemy-held copies reduce the eight-copy case to 46.5%.
4. **Fast 8 is the natural shop window for four-cost upgrades.** It improves the odds, but it still does not promise an entire board of two-star four-cost units. Stabilize with the upgraded units actually found and treat the final carry as a transition.
5. **Legendary boards are high-end transitions.** Level 9 substantially improves legendary acquisition. The cost of reaching 9, surviving and then rolling cannot be omitted. None of the 3,072 practical no-Seal, six-item-arm runs simultaneously fielded every exact unit and star of its published level-9 cap. This is an observation about these policies and lobbies, not proof that those caps are impossible.

## Single-target completion odds

40 spendable gold includes purchases and paid rerolls. The starting copies in the table are already owned. One opening shop is free. The goal is nine copies for costs 1-3, three copies for costs 4-5. No income, XP spending or other purchases occur inside this isolated roll-down.

| Target line | Level | Already owned | Goal copies | No enemy-held copies | Six enemy-held copies |
| --- | ---: | ---: | ---: | ---: | ---: |
${singleTable.join('\n')}

Each cell uses 512 trials. Full Wilson confidence intervals are in shop-probabilities.json; a probability near 50% has roughly a four-percentage-point 95% half-width. Opponents also holding other units and bench-space competition are not modeled in the single-target sweep. These are conditional bounds, not a guarantee that the stated starting inventory and gold were earned in time.

Native pools contain 29/22/18/10/9 copies per line at costs 1/2/3/4/5. This is why adding another contested three-star support can be expensive even when its trait is attractive.

The separate near-completion sweep covers eight owned copies. With 40 gold, the uncontested completion probabilities were 96.7% for Bulbasaur at level 5, 86.3% for Abra at level 6 and 75.2% for Exeggutor at level 7. Being one copy away is materially different from merely having two two-star units. Full near-completion results are in shops-near.json and the combined shop-probabilities.csv.

## Multiple upgrades share one budget

Every listed target must finish. Starting inventories are already owned, no opponents hold the targets, and field/bench placement frees room using native rules. These conditions are optimistic. Earlier purchase costs, reaching the level, other units and the cost of surviving are additional.

| Goal | Level | Already owned | Shared gold budget | All targets completed |
| --- | ---: | --- | ---: | ---: |
${jointTable.join('\n')}

This is the strongest direct warning against advertising Exeggutor, Jynx, Venusaur and other mixed-cost three-stars as a routine level-7 roll-down. In contrast, a low-cost reroll that is already close on several same-cost units can be reasonable.

## Native full-match observations

Every main composition gets 64 practical no-Seal cases. The reroll variants also get 64 cap-chase cases; all 48 variants get 32 actual-offer Seal cases. The native seven opponents use the local elite table, with two as profiles and five elite profiles. No gold, XP, health, units or items are injected into these complete matches. Native weather, income, pools, merging, item rewards and combat apply.

| Plan | Local bot-lobby top four | Advertised carry upgrade ever hit | Carry on last board | Reached level 8 | Exact simultaneous cap |
| --- | ---: | ---: | ---: | ---: | ---: |
${examples.join('\n')}

Top-four rates belong to this controller against native bots. They are not ranked player statistics. A flexible board can finish well without the advertised carry or exact composition. Carry presence and final-line overlap therefore matter as much as the placement column. Several variants have closely related or identical acquisition plans; they are not independent discoveries.

${control}

In the baseline runs finishing second or third, the final board held ${mean(top23.map(r=>r.last.items)).toFixed(2)} finished items on average under a six-item ceiling (${top23.length} runs). The five/seven-item arms use only actually acquired loot too. Paired comparisons use the same first 32 seeds, not the 64-case baseline average. Their small samples do not establish a universal benefit or penalty for a particular extra item.

The practical policy intentionally buys most secondary units only to two stars unless another source makes an upgrade close. Cap-chase pursues every listed three-star target. These bracket two policies; neither establishes an optimal hybrid reroll policy. A multi-one-cost core may deserve a middle policy that collects same-window secondary copies without chasing unrelated costs. The native planner may also pivot or sell a planned unit; it is not a hard-locked reconstruction of every composition card.

## Battles using actually attained boards

Four fresh combat seeds and both sides are tested per snapshot pair. Scores give each opposing strategy group equal weight, including the plan's own strategy group. Same-family mirrors are included. Neutral weather is used here to isolate board comparison; complete matches retain native weather.

| Plan ID | Conditional level-8 combat score | Reached 8 | Round 4-2 combat score | Alive at 4-2 |
| --- | ---: | --- | ---: | --- |
${cross.join('\n')}

The first eight observed seed indices are used, or all available cases if fewer than eight. Level-8 scores are conditional on reaching 8. For example, Dugtrio's attained level-8 boards can be strong while its probability of getting there is much lower. Round 4-2 compares actual levels among survivors. Neither conditional score should replace a full-game acquisition measure. The complete matrix and availability denominators are in attained-scores.json/csv.

## Limits that matter

- The native planner is a reproducible controller, not an optimal human or trained agent. It chooses items by native fit and actual offers, so these runs do not prove a new universal BIS. Published ideal items are not injected.
- Human planning completes before the native engine flushes other bots' actions. Pools are finite and contested, but this does not reproduce online concurrent buying or latency. The contested-copy sweeps expose additional draw-order risk.
- Carousel choices use the native seeded fallback. Item and Seal play can be improved. In particular, this controller does not deliberately optimize every Spare Change bench cycle or every Hero Seal line.
- Both sides receive Seals in the Seal sensitivity arm. Changes in placement do not isolate one Seal's causal strength. Only offered cards can be chosen, and follow-up choices use native logic.
- Some purchases were refused by native rules: 1,886 bench-full attempts and one no-gold attempt. They changed no resources. There were no other native action failures in the study.
- Existing S/A/B website tiers remain scores of the displayed capped combat boards. This study does not relabel local-bot placements as ranked win rates or silently replace those scores.

## Reproduction and throughput

Runtime: ${input.metadata.runtime}, Windows, ${input.metadata.cpu.trim()}, 12 logical workers. The main full-match batch took ${input.metadata.elapsedSeconds.toFixed(2)} seconds: ${(input.metadata.games/input.metadata.elapsedSeconds).toFixed(2)} complete eight-seat games per second, including all bot planning, fights, full-match state digests and checkpoint writes. This metric counts complete matches. The additional attained-board batch took ${attained.seconds.toFixed(2)} seconds and is labelled in fights.

The official engine, shop and PvP-core modules matched the public v34 files byte for byte. Their hashes are in live-check.json. The original modules remain unchanged. An adapter copy only rebases static imports and exposes four existing planner functions; native botStep parity was checked. The frozen input digests are in study-inputs.json. Cache identity was subsequently strengthened to include Seal recommendations; old checkpoints are conservatively invalidated on a future run.

Run from C:/Users/usEr/Desktop/kanto-tactics/work/auto-chess:

\`\`\`sh
node scripts/realism/run-shops.mjs
node scripts/realism/run-shops.mjs --near-only
node scripts/realism/joint.mjs
node scripts/realism/run.mjs
node scripts/realism/attained.mjs
node scripts/realism/summarize.mjs
node scripts/realism/verify.mjs
node scripts/realism/report.mjs
\`\`\`

Large raw outputs remain under work/realism-v34 inside the repository and are ignored by Git. Compact CSV/JSON outputs and this report are in the Desktop project's outputs/realism-v34 folder. The live game was only read to verify its public assets; all simulations ran locally.

## All practical baseline variants

| ID | Strategy | Local top four | Average place | Advertised carry goal reached | Reached 8 | Last-board final-line overlap |
| --- | --- | ---: | ---: | --- | ---: | ---: |
${table.join('\n')}
`;
fs.writeFileSync(out+'report.md',text.replaceAll('\\`','`'));
console.log(JSON.stringify({report:out+'report.md',compositions:baseline.length,conditionalTrials}));
