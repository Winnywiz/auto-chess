import fs from 'node:fs';
import {startPool, traitLabel} from './combat.mjs';
import {score} from './search.mjs';
import {simulate, roundIndex as R} from './acquire.mjs';
import {hashSeed} from './rules.mjs';
const old = JSON.parse(fs.readFileSync('work/fiveTwo36/search-backup.json')).results;
const base = old.find(r => r.line === 'oddish').variants.find(v => v.team.some(u => u.line === 'eevee')).team.map(({line, star, cell, items}) => ({line, star, cell, items: [...items]}));
startPool();
const boards = [{label: 'Eevee 2★ board as found', team: base}];
for (const l of ['magnemite', 'voltorb', 'jigglypuff', 'bulbasaur', 'weedle', 'abra', 'psyduck', 'pikachu', 'electabuzz', 'zubat']) if (!base.some(u => u.line === l)) boards.push({label: `${l} 2★ instead of Eevee`, team: base.map(u => u.line === 'eevee' ? {...u, line: l, star: 2} : u)});
boards.push({label: 'Eevee board, Parasect at 2★ (steady)', team: base.map(u => u.line === 'paras' ? {...u, star: 2} : u)});
boards.push({label: 'Steady, Magneton instead of Eevee', team: base.map(u => u.line === 'paras' ? {...u, star: 2} : u.line === 'eevee' ? {...u, line: 'magnemite', star: 2} : u)});
const res = await score(boards.map(b => b.team), {nSeeds: 8, salt: 'eevee-iso', s3: true});
boards.forEach((b, i) => console.log(b.label.padEnd(38), (res[i].score * 100).toFixed(1), '|', traitLabel(b.team)));
// Chance to finish by 5-2 (2-cost reroll plan, same as the site).
const plan = (team, extras) => ({levels: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]], rollLevel: 6, rollFrom: R(3, 2), floor: 50, allInAt: R(4, 5), levelAfter: true, levelKeep: 20, maxLevel: 8,
  needs: team.map(u => ({line: u.line, copies: 3 ** (u.star - 1), priority: u.line === 'oddish' || extras.includes(u.line) ? 0 : u.items.length === 3 ? 1 : 2}))});
for (const [label, team, extras] of [['Eevee board (Vileplume + Parasect 3★)', base, ['paras']], ['Eevee board, steady (Vileplume 3★ only)', boards.at(-2).team, []]]) {
  let hit = 0, full = 0, ee = 0; const N = 300;
  for (let i = 0; i < N; i++) { const x = simulate(plan(team, extras), {seed: hashSeed(label + i)}); hit += x.hit; full += x.others; ee += (x.owned.eevee ?? 0) >= 3; }
  console.log(label, 'core hit', (hit / N * 100).toFixed(0) + '%', 'Eevee 2★', (ee / N * 100).toFixed(0) + '%', 'full board', (full / N * 100).toFixed(0) + '%');
}
process.exit(0);
