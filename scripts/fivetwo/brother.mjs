// Compare the Toongcha Kanto Tactics (tkt) v36 boards with ours: same lobby, same 5-2 reach model,
// and a direct round robin between their boards and our tier-list leads.
import fs from 'node:fs';
import {roster, family, startPool, traitLabel, scoreMany, seeds, arrange} from './combat.mjs';
import {score, cost, isFront, placeHint} from './search.mjs';
import {simulate, roundIndex as R} from './acquire.mjs';
import {hashSeed} from './rules.mjs';
import {planOf, realizedScore} from './realized.mjs';
const W = 'work/fiveTwo37/brother/';
const T = JSON.parse(fs.readFileSync(W + 'tkt-data.json'));
const C = JSON.parse(fs.readFileSync('compositions.html', 'utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const theirs = [...T.comps.map(c => ({...c, set: 'comps'})), ...T.pool.map(c => ({...c, set: 'pool'})), ...T.neu.map(c => ({...c, set: 'neu'}))].map((c, i) => ({
  id: 'tkt-' + i, name: c.name, set: c.set, tier: c.tier ?? null, theirWr: c.px ?? c.wr ?? null, lastLv: c.lastLv, type: c.type,
  team: c.units.map(u => ({line: u.l, star: u.s, cell: u.c, items: [...(u.it ?? [])], role: u.r}))}));
const clean = t => t.map(({line, star, cell, items}) => ({line, star, cell, items: [...items]}));
startPool();
// 1. Same lobby (16 seeds) and 5-2 reach.
const sc = await score(theirs.map(b => clean(b.team)), {nSeeds: 16, salt: 'tkt', s3: true});
const curves = {1: [[R(2, 1), 4], [R(2, 5), 5]], 2: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]], 3: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(4, 1), 7]], 4: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(3, 5), 7], [R(4, 2), 8]]};
for (const [i, b] of theirs.entries()) {
  Object.assign(b, {score: sc[i].score, s4: sc[i].s4, s3: sc[i].s3, traits: traitLabel(b.team)});
  const threes = b.team.filter(u => u.star === 3 && cost(u.line) <= 3);
  const key = threes.length ? Math.max(...threes.map(u => cost(u.line))) : 4;
  const targets = threes.length ? threes.map(u => u.line) : b.team.filter(u => cost(u.line) === 4 && u.star === 2).map(u => u.line);
  const lv = curves[key], level = b.team.length;
  const plan = {levels: lv, rollLevel: lv.at(-1)[1], rollFrom: lv.at(-1)[0], floor: 50, allInAt: R(4, 5), levelAfter: true, levelKeep: 20, maxLevel: Math.max(level, lv.at(-1)[1]),
    needs: b.team.map(u => ({line: family(u.line), copies: 3 ** (u.star - 1), priority: targets.includes(u.line) || (u.star === 1 && cost(u.line) >= 4) || (cost(u.line) === 5) ? 0 : u.items.length >= 2 && isFront(u.line) ? 1 : 2}))};
  let ok = 0; const N = 300;
  for (let k = 0; k < N; k++) { const x = simulate(plan, {seed: hashSeed(`tkt|${b.id}|${k}`)}); ok += x.hit && x.level >= level; }
  b.targets = targets; b.reach = ok / N;
  b.low = clean(b.team).map(u => targets.includes(u.line) ? {...u, star: u.star - 1} : u);
}
const lows = await score(theirs.map(b => b.low), {nSeeds: 8, salt: 'tkt-low', s3: true});
for (const [i, b] of theirs.entries()) {
  b.lowScore = lows[i].score; delete b.low;
  // Same realized 5-2 model as our list: roll level from the dearest 3★ target, boards actually reached.
  const rollLevel = Math.max(...b.targets.map(cost)) >= 4 ? 8 : Math.max(...b.targets.map(cost)) === 3 ? 7 : Math.max(...b.targets.map(cost)) === 2 || b.targets.length >= 4 ? 6 : 5;
  const real = await realizedScore(clean(b.team), planOf(clean(b.team), {targets: b.targets, rollLevel}), score, {n: 200, max: 8, nSeeds: 3, salt: 'tkt-real|' + b.id});
  b.expected = real.expected; b.realized = real; b.rollLevel = rollLevel;
}
// 2. Round robin: their boards vs our lead build per carry (S, A, B tiers).
const ours = []; const seen = new Set();
for (const r of C.rows) { if (seen.has(r.carry) || r.tier === 'C') continue; seen.add(r.carry); ours.push(r); }
const sd = seeds(8, 'tkt-rr'), pairs = [];
for (const o of ours) for (const b of theirs) pairs.push({a: clean(o.team), b: clean(b.team), seeds: sd});
const rr = await scoreMany(pairs);
let k = 0; const matrix = ours.map(o => ({id: o.id, name: o.name, tier: o.tier, expected: o.expected, vs: theirs.map(b => ({id: b.id, score: rr[k++]}))}));
fs.writeFileSync(W + 'compare.json', JSON.stringify({theirs, matrix}, null, 1));
console.log('THEIR BOARDS (our lobby, 16 seeds)');
for (const b of [...theirs].sort((a, c) => c.expected - a.expected)) console.log(`${b.set.padEnd(5)} ${b.name.padEnd(28)} their ${String(b.theirWr).padEnd(5)} full ${(b.score * 100).toFixed(1)} reach ${(b.reach * 100).toFixed(0)}% low ${(b.lowScore * 100).toFixed(1)} exp ${(b.expected * 100).toFixed(1)} | ${b.traits}`);
console.log('\nOURS vs THEIRS (average over their 16 boards, worst)');
for (const m of matrix) { const avg = m.vs.reduce((s, x) => s + x.score, 0) / m.vs.length, worst = [...m.vs].sort((a, b) => a.score - b.score)[0]; console.log(`${m.tier} ${m.name.padEnd(26)} avg ${(avg * 100).toFixed(1)} worst ${(worst.score * 100).toFixed(0)} vs ${theirs.find(t => t.id === worst.id).name}`); }
console.log('\nTHEIR BOARDS vs OUR LEADS (their average)');
for (const [j, b] of theirs.entries()) { const avg = matrix.reduce((s, m) => s + (1 - m.vs[j].score), 0) / matrix.length; console.log(`${b.name.padEnd(28)} avg ${(avg * 100).toFixed(1)}`); }
process.exit(0);
