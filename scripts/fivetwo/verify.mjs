// Checks the published 5-2 composition data: board legality, the seven-item split,
// no private economy numbers on the website, and exact replay of sampled combat results.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as engine from '../../simulation/engine-v36.js';
import {seeds} from './combat.mjs';

const html = fs.readFileSync('compositions.html', 'utf8');
const C = JSON.parse(html.match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const data = JSON.parse(fs.readFileSync('simulation/data-v36.json', 'utf8'));
const record = JSON.parse(fs.readFileSync('data/compositions-52.json', 'utf8'));
const roster = Object.fromEntries(data.roster.map(r => [r.id, r])), items = Object.fromEntries(data.items.map(i => [i.id, i]));
const cost = l => roster[roster[l].branchOf ?? l].cost;
assert.equal(C.model, 'finish-by-5-2'); assert.equal(C.itemBudget, 7); assert.equal(C.engineIdentity, record.engine);
assert.equal(new Set(C.rows.map(r => r.id)).size, C.rows.length, 'duplicate ids');
const refIds = new Set(C.reference.map(r => r.id));
for (const r of C.rows) {
  assert.equal(r.team.length, r.level, r.id + ' team size');
  assert.ok(r.level >= 5 && r.level <= 8, r.id + ' level');
  const cells = new Set(r.team.map(u => u.cell)); assert.equal(cells.size, r.team.length, r.id + ' cells');
  for (const u of r.team) {
    assert.ok(roster[u.line] && u.cell >= 28 && u.cell <= 55 && [1, 2, 3].includes(u.star), r.id + ' unit ' + u.line);
    if (cost(u.line) === 5) assert.ok(r.level >= 8 && u.star === 1, r.id + ' five-cost before level 8');
    assert.ok(u.items.every(i => items[i]?.kind === 'full'), r.id + ' items');
    assert.ok(u.items.filter(i => i === 'focus-sash').length <= 1, r.id + ' stacked Focus Sash');
  }
  const by = a => r.team.filter(u => u.assignment === a);
  assert.equal(by('Carry').length, 1); assert.equal(by('Tank').length, 1);
  assert.equal(by('Carry')[0].items.length, 3, r.id + ' carry items'); assert.equal(by('Tank')[0].items.length, 3, r.id + ' tank items');
  assert.ok(by('Secondary').length <= 1 && (by('Secondary')[0]?.items.length ?? 1) === 1, r.id + ' secondary item');
  assert.ok(r.team.reduce((n, u) => n + u.items.length, 0) <= 7, r.id + ' item budget');
  assert.equal(by('Carry')[0].star, r.category === 'fast-8' ? 2 : 3, r.id + ' carry star');
  for (const t of r.targets.slice(1)) assert.equal(r.team.find(u => u.line === t)?.star, 3, r.id + ' extra target');
  for (const m of r.matchups.filter(m => m.stage === 4)) assert.ok(refIds.has(m.id), r.id + ' matchup ref');
  assert.ok(['S', 'A', 'B', 'C'].includes(r.tier) && Number.isFinite(r.expected) && Number.isFinite(r.score), r.id + ' scores');
}
// The website must not carry the private gold / roll / hit-rate simulation.
const banned = /"(gold|goldLeft|rollGold|rolls|unitGold|xpGold|core|pHit|hit|acq|acquisition|policy|medianDone)"\s*:/;
assert.ok(!banned.test(JSON.stringify(C)), 'private economy fields published in KANTO_COMPS');
assert.ok(!banned.test(JSON.stringify(record)), 'private economy fields published in the test record');
// Exact replay: the final score of three boards against one lobby board each.
const mirror = t => t.map(u => ({...u, cell: 55 - u.cell, items: [...u.items]}));
function one(a, b, s) { const x = new engine.Battle(a.map(u => ({...u, items: [...u.items]})), mirror(b), s, null); x.pvpClock = true; x.start(); for (let k = 0; !x.over && k < 1800; k++) x.step(); return x.over ? (x.winner < 0 ? .5 : x.winner === 0 ? 1 : 0) : .5; }
const clean = t => t.map(u => ({line: u.line, star: u.star, cell: u.cell, items: [...u.items]}));
let replayed = 0;
for (const r of [C.rows[0], C.rows[Math.floor(C.rows.length / 2)], C.rows.at(-1)]) {
  const m = r.matchups.find(m => m.stage === 4), ref = C.reference.find(x => x.id === m.id);
  const sd = seeds(r.finalSeeds ?? 8, r.finalSalt), F = sd.length * 2;
  let p = 0; for (const s of sd) { p += one(clean(r.team), clean(ref.team), s); p += 1 - one(clean(ref.team), clean(r.team), s); }
  assert.ok(Math.abs(p / F - m.score) < 1e-3, `${r.id} replay ${p / F} vs ${m.score}`); replayed++;
}
console.log(JSON.stringify({rows: C.rows.length, reference: C.reference.length, replayed, tiers: C.rows.reduce((m, r) => (m[r.tier] = (m[r.tier] ?? 0) + 1, m), {})}));
