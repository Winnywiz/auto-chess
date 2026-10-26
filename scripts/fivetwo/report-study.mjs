import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p));
const root='work/fiveTwo37/';
const current=read(root+'selected/public-compositions.json');
const comparison=read(root+'comparison-public.json'),anchors=read(root+'anchor-audit-public.json');
const old=JSON.parse(fs.readFileSync('work/backups/pre-v37-2026-10-26T08-52-54-381Z/compositions.html','utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const selection=read(root+'selected/selection.json');
const pct=x=>(100*x).toFixed(1)+'%',points=x=>(x>=0?'+':'')+(100*x).toFixed(1);
const tiers=c=>['S','A','B','C'].map(t=>t+': '+c.rows.filter(r=>r.tier===t).length).join(', ');
const key=r=>r.carry+'|'+r.category+'|'+r.level;
const best=c=>{const map=new Map();for(const r of c.rows)if(!map.has(key(r))||r.expected>map.get(key(r)).expected)map.set(key(r),r);return map;};
const before=best(old),after=best(current),changes=[];
for(const [k,r] of after){const p=before.get(k);if(p)changes.push({name:r.name,strategy:r.strategy,oldTier:p.tier,newTier:r.tier,oldExpected:p.expected,newExpected:r.expected,change:r.expected-p.expected});}
changes.sort((a,b)=>Math.abs(b.change)-Math.abs(a.change));
const oldCarries=new Set(old.rows.map(r=>r.carry)),newCarries=new Set(current.rows.map(r=>r.carry));
const carryName=(c,list)=>list.rows.find(r=>r.carry===c).name.split(' / ')[0]+(/-a\d$/.test(c)?' (anchored)':'');
const added=[...newCarries].filter(c=>!oldCarries.has(c)).map(c=>carryName(c,current));
const removed=[...oldCarries].filter(c=>!newCarries.has(c)).map(c=>carryName(c,old));
const lines=[
 '# Version 37 search comparison',
 '',
 'Both searches use the same verified v37 combat engine and frozen [official ranked lobby](https://einoow.com/api/meta/kanto/meta.json). Seals are off and weather is neutral. The new search uses a beam, successive halving, complete item-set screens, native anchored forms and small position changes. Candidate coverage and compute budgets differ between the pipelines. No Pokémon-specific item set was prescribed.',
 '',
 '## Direct fights',
 '',
 `The comparison contains ${comparison.originalBuilds} original builds and ${comparison.beamBuilds} beam builds. Every original build fights every beam build with 32 shared seeds, each played from both sides. Draws count half.`,
 '',
 '| Comparison | Original | Beam |',
 '| --- | ---: | ---: |',
 `| Full boards, all pairs | ${pct(1-comparison.allBuilds.beamFullBoardScore)} | ${pct(comparison.allBuilds.beamFullBoardScore)} |`,
 `| Realized boards, all pairs | ${pct(1-comparison.allBuilds.beamRealizedScore)} | ${pct(comparison.allBuilds.beamRealizedScore)} |`,
 ...(comparison.matchedCarryAndPlan?[`| Realized boards, matching carry family and plan | ${pct(1-comparison.matchedCarryAndPlan.beamRealizedScore)} | ${pct(comparison.matchedCarryAndPlan.beamRealizedScore)} |`]:[]),
 `| Realized boards, equal strategy weights | ${pct(1-comparison.equalStrategyRealizedScore)} | ${pct(comparison.equalStrategyRealizedScore)} |`,
 '',
 `The beam all-pairs realized score has a seed-block interval of ${comparison.allBuilds.seedClusterInterval.map(pct).join(' to ')}. This interval conditions on the reconstructed lobby and simulated outcome distributions. It does not measure search uncertainty. Different portfolios can change the all-pairs result.`,
 `For matching carry families and plans, the beam interval is ${comparison.matchedCarryAndPlan.seedClusterInterval.map(pct).join(' to ')}. It crosses 50%, so that comparison does not establish a clear advantage.`,
 '',
 'The full per-pair record, tested boards and method are in [the comparison data](../data/search-comparison-v37.json). Direct duel results supplement the official-lobby scores. They do not set tiers.',
 '',
 '## Selected list',
 '',
 `Previous list: ${old.rows.length} builds (${tiers(old)}). Updated list: ${current.rows.length} builds (${tiers(current)}).`,
 '',
 `Selection kept ${selection.decisions.filter(d=>d.chosen==='original').length} original carry/plan groups and ${selection.decisions.filter(d=>d.chosen==='beam').length} beam groups. A comparable beam replacement must improve expected score by more than one point. Anchored carry replacements use the same rule.`,
 '',
 'Added carry forms: '+(added.length?added.join(', '):'none')+'.',
 '',
 'Removed carry forms: '+(removed.length?removed.join(', '):'none')+'.',
 '',
 'The following changes compare the old published list with the selected update. They combine patch, lobby, search and scoring changes, so they are not a pure patch comparison.',
 '',
 '| Carry / plan | Old tier | New tier | Old expected | New expected | Change, points |',
 '| --- | --- | --- | ---: | ---: | ---: |',
 ...changes.slice(0,15).map(c=>`| ${c.name} / ${c.strategy} | ${c.oldTier} | ${c.newTier} | ${pct(c.oldExpected)} | ${pct(c.newExpected)} | ${points(c.change)} |`),
 '',
 '## Anchored forms',
 '',
 'Controlled form-only tests keep stars, items and positions fixed. Promising differences were confirmed with fresh paired seeds. Joint search and complete realized outcomes decide which plans are published.',
 '',
 '| Anchored form | Evolving form | Stars | Anchor score | Evolving score | Gain, points |',
 '| --- | --- | ---: | ---: | ---: | ---: |',
 ...anchors.results.filter(r=>r.gain>.01).slice(0,10).map(r=>`| ${r.anchorName} | ${r.baseName} | ${r.star} | ${pct(r.anchorScore)} | ${pct(r.baseScore)} | ${points(r.gain)} |`),
 '',
 ...anchors.results.filter(r=>r.available===false).map(r=>r.anchorName+': '+r.reason),
 '',
 'All form checks are recorded in [the anchoring data](../data/anchoring-v37.json). Intermediate forms appear only after their native unlock star. Earlier partial hits use the earlier legal form.',
 '',
 '## Scoring and backup',
 '',
 'The old eight-pattern estimator could omit many realized outcomes and normalize over the retained subset. Original estimates are retained privately. Final scores for both methods fight every observed realized outcome. The bad-game score is the twentieth percentile of that complete distribution. Economy outputs remain private.',
 '',
 'The previous list remains available as [the Version 36 backup](../compositions-v36.html). A complete local runtime snapshot was also preserved before changes. The current page keeps the existing layout. The engine, builder data, Seal descriptions and extension data use v37. The extension folder is version 1.7.0.',
 '',
 'No browser was used. Native replay parity, source/data UI checks and the other final checks are recorded in [the verification report](v37-verification.md).',
 ''
];
fs.writeFileSync('docs/v37-search-comparison.md',lines.join('\n'));
fs.writeFileSync(root+'list-changes-public.json',JSON.stringify({oldBuilds:old.rows.length,newBuilds:current.rows.length,oldTiers:tiers(old),newTiers:tiers(current),addedCarries:added,removedCarries:removed,changes}));
console.log(JSON.stringify({oldBuilds:old.rows.length,newBuilds:current.rows.length,originalRealized:1-comparison.allBuilds.beamRealizedScore,beamRealized:comparison.allBuilds.beamRealizedScore,addedCarries:added,removedCarries:removed}));
