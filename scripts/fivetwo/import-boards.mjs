// Turn outside boards (Toongcha list) into search results so they go through the same analysis:
// exact units, stars, items and cells; only boards that follow the 3 tank / 3 carry / 1 secondary rule.
import fs from 'node:fs';
import {startPool, traitLabel, boardValue, roster, family} from './combat.mjs';
import {score, isFront} from './search.mjs';
const T = JSON.parse(fs.readFileSync('work/fiveTwo37/brother/tkt-data.json'));
const cost = l => roster[family(l)].cost;
const boards = [...T.comps, ...T.pool, ...T.neu];
startPool();
const results = [];
for (const [i, c] of boards.entries()) {
  const team = c.units.map(u => ({line: u.l, star: u.s, cell: u.c, items: [...(u.it ?? [])]}));
  const carry = c.units.find(u => u.r === 'c'), tank = c.units.find(u => u.r === 't'), second = c.units.find(u => u.r === 's');
  const ok = carry && tank && (carry.it ?? []).length === 3 && (tank.it ?? []).length === 3 && (!second || (second.it ?? []).length === 1) && team.reduce((n, u) => n + u.items.length, 0) <= 7 && team.filter(u => u.items.length).length <= 3 && carry.s === 3;
  if (!ok) { console.log('skip (item rule or carry star)', c.name); continue; }
  const extras = team.filter(u => u.line !== carry.l && u.star === 3 && cost(u.line) <= 2).map(u => u.line);
  const twoCost = [carry.l, ...extras].some(l => cost(l) === 2);
  const strat = team.length === 6 ? 'r12s' : twoCost || extras.length >= 3 ? 'r12' : 'r1';
  const final = (await score([team], {nSeeds: 8, salt: 'final|' + carry.l, s3: true}))[0];
  results.push({line: carry.l, strat, notes: ['imported from Toongcha: ' + c.name], variants: [{team, extras, src: 'tkt-import:' + c.name, items: {tank: tank.l, second: second?.l ?? null, carry: [...carry.it], tankItems: [...tank.it], secondItem: second?.it?.[0] ?? null, alt: null, rankedCarry: [{items: [...carry.it], score: final.score}], rankedTank: [], rankedSecond: []}, final, traits: traitLabel(team), value: boardValue(team)}]});
  console.log('import', c.name, strat, (final.score * 100).toFixed(1));
}
fs.writeFileSync('work/fiveTwo37/search-import.json', JSON.stringify({results}, null, 1));
process.exit(0);
