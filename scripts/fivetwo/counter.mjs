// Counters to the Toongcha boards: every analysed build of ours fought against the boards his
// comps actually reach at 5-2 (realized patterns, weighted by how often they happen).
import fs from 'node:fs';
import {startPool, scoreMany, seeds, traitLabel} from './combat.mjs';
import {realizedBoards, planOf} from './realized.mjs';
import {cost} from './search.mjs';
const W = 'work/fiveTwo36/';
const bro = JSON.parse(fs.readFileSync(W + 'brother/compare.json'));
const A = JSON.parse(fs.readFileSync(W + 'analysis.json'));
const C = JSON.parse(fs.readFileSync('compositions.html', 'utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const clean = t => t.map(({line, star, cell, items}) => ({line, star, cell, items: [...items]}));
startPool();
// His lobby: his eight best boards by expected 5-2, each as its realized 5-2 boards (top 4 patterns).
const top = [...bro.theirs].sort((a, b) => b.expected - a.expected).slice(0, 8);
const lobby = [];
for (const b of top) {
  const rollLevel = b.rollLevel ?? 6, plan = planOf(clean(b.team), {targets: b.targets, rollLevel});
  if (b.team.length === 6) plan.maxLevel = 6;
  const {patterns, n} = realizedBoards(clean(b.team), plan, {n: 200, salt: 'counter|' + b.id});
  const keep = patterns.slice(0, 4), tot = keep.reduce((s, p) => s + p.n, 0);
  for (const p of keep) lobby.push({name: b.name, w: (p.n / tot) / top.length, team: clean(p.team)});
}
// Our builds: every analysed variant (published or not), excluding boards copied from his list.
const tktSets = new Set(bro.theirs.map(b => b.team.map(u => u.line).sort().join()));
const ours = [];
for (const c of A.comps) for (const v of c.variants) { if (tktSets.has(v.team.map(u => u.line).sort().join())) continue; ours.push({carry: c.line, strat: c.strat, team: clean(v.team), expected: v.expected, full: v.final.score, traits: traitLabel(v.team)}); }
const sd = seeds(4, 'counter'), pairs = [];
for (const o of ours) for (const l of lobby) pairs.push({a: o.team, b: l.team, seeds: sd});
const res = await scoreMany(pairs);
let k = 0;
for (const o of ours) { let s = 0; o.per = {}; for (const l of lobby) { const v = res[k++]; s += v * l.w; o.per[l.name] = (o.per[l.name] ?? 0) + v * l.w * top.length; } o.vsTkt = s; }
ours.sort((a, b) => b.vsTkt - a.vsTkt);
fs.writeFileSync(W + 'brother/counters.json', JSON.stringify({lobby: lobby.map(l => ({name: l.name, w: l.w, team: l.team})), ours}, null, 1));
const pub = new Set(C.rows.map(r => r.team.map(u => u.line + u.star).sort().join()));
for (const o of ours.slice(0, 25)) console.log((o.vsTkt * 100).toFixed(1), 'exp', (o.expected * 100).toFixed(1), pub.has(o.team.map(u => u.line + u.star).sort().join()) ? 'PUB' : '   ', o.carry, o.strat, '|', o.traits, '|', o.team.map(u => u.line + u.star).join(' '));
console.log('per his board for top 5:'); for (const o of ours.slice(0, 5)) console.log(o.carry, Object.entries(o.per).map(([n, v]) => n.split(' ').slice(0, 2).join(' ') + ' ' + (v * 100).toFixed(0)).join(', '));
process.exit(0);
