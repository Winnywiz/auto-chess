// Fair check for the best counters: our realized 5-2 boards vs his realized 5-2 boards.
import fs from 'node:fs';
import {startPool, scoreMany, seeds, roster, family} from './combat.mjs';
import {realizedBoards, planOf} from './realized.mjs';
const W = 'work/fiveTwo36/';
const {lobby, ours} = JSON.parse(fs.readFileSync(W + 'brother/counters.json'));
const C = JSON.parse(fs.readFileSync('compositions.html', 'utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const cost = l => roster[family(l)].cost;
const rollOf = {r1: 5, r12: 6, r12s: 6, r2: 6, r3: 7, f8: 8};
const pick = [...ours.slice(0, 12)];
for (const want of ['aerodactyl', 'staryu', 'vaporeon']) { const o = ours.find(x => x.carry === want); if (o && !pick.includes(o)) pick.push(o); }
startPool();
const sd = seeds(4, 'counter-real'), out = [];
for (const o of pick) {
  const targets = o.team.filter(u => (u.star === 3 && cost(u.line) <= 3) || (o.strat === 'f8' && u.line === o.carry)).map(u => u.line);
  const plan = planOf(o.team, {targets, rollLevel: rollOf[o.strat]}); if (o.strat === 'r12s') plan.maxLevel = 6;
  const {patterns, n} = realizedBoards(o.team, plan, {n: 200, salt: 'cr|' + o.carry + o.strat});
  const mine = patterns.slice(0, 5), tot = mine.reduce((s, p) => s + p.n, 0), pairs = [];
  for (const p of mine) for (const l of lobby) pairs.push({a: p.team, b: l.team, seeds: sd});
  const res = await scoreMany(pairs); let k = 0, s = 0;
  for (const p of mine) for (const l of lobby) s += res[k++] * (p.n / tot) * l.w;
  out.push({...o, realVsTkt: s});
  console.log((s * 100).toFixed(1), 'full-vs-real', (o.vsTkt * 100).toFixed(1), 'exp', (o.expected * 100).toFixed(1), o.carry, o.strat, '|', o.traits, '|', o.team.map(u => u.line + u.star).join(' '));
}
fs.writeFileSync(W + 'brother/counters-real.json', JSON.stringify(out, null, 1));
process.exit(0);
