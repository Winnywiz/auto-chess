// How many three-star targets fit in one 5-2 budget, per reroll cost, and how often a
// four-cost two-star tank appears on the way. Results stay local in work/fiveTwo37/.
import fs from 'node:fs';
import {simulate, goldAudit, roundIndex as R, FIVE_TWO} from './acquire.mjs';
import {BY_COST, hashSeed, label} from './rules.mjs';

const N = Number(process.env.N ?? 256), NB = Number(process.env.NB ?? 512);
const tanks4 = ['rhyhorn', 'snorlax', 'nidoqueen', 'tangela4'];
const curves = {
  5: [[R(2, 1), 4], [R(2, 5), 5]],
  6: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]],
  7: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(4, 1), 7]],
  8: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(3, 5), 7], [R(4, 2), 8]],
};
const configs = [];
for (const k of [1, 2, 3, 4]) configs.push({type: '1-cost reroll', unitCost: 1, k, level: 5});
for (const k of [1, 2, 3]) configs.push({type: '1-cost reroll', unitCost: 1, k, level: 6});
for (const k of [1, 2, 3]) configs.push({type: '2-cost reroll', unitCost: 2, k, level: 6});
for (const k of [1, 2]) configs.push({type: '2-cost reroll', unitCost: 2, k, level: 5});
for (const k of [1, 2]) configs.push({type: '3-cost reroll', unitCost: 3, k, level: 7});
configs.push({type: '3-cost reroll', unitCost: 3, k: 1, level: 6});
configs.push({type: '4-cost 2-star (fast 8)', unitCost: 4, k: 1, level: 8, twoStar: true});
configs.push({type: '4-cost 2-star (fast 8)', unitCost: 4, k: 2, level: 8, twoStar: true});

const policies = [];
for (const from of ['early', 'late']) for (const floor of [50, 30, 10]) for (const allIn of ['3-5', '4-1', '4-5']) policies.push({from, floor, allIn});
const at = s => { const [a, b] = s.split('-').map(Number); return R(a, b); };
function makePlan(cfg, pol, trial) {
  const pool = BY_COST[cfg.unitCost].filter(l => !(cfg.unitCost === 4 && tanks4.includes(l)));
  const order = [...pool].sort((a, b) => hashSeed(a + '|' + trial) - hashSeed(b + '|' + trial));
  const targets = order.slice(0, cfg.k);
  const tank = tanks4.filter(t => !targets.includes(t))[hashSeed('tank|' + trial) % 3];
  const reach = curves[cfg.level].at(-1)[0];
  const rollFrom = pol.from === 'early' ? reach : reach + 2;
  return {
    levels: curves[cfg.level], rollLevel: cfg.level, rollFrom, floor: pol.floor, allInAt: Math.max(at(pol.allIn), rollFrom),
    needs: [...targets.map(line => ({line, copies: cfg.twoStar ? 3 : 9, priority: 0})), {line: tank, copies: 3, priority: 1}],
    levelAfter: true, levelKeep: 20, maxLevel: 9,
  };
}
function run(cfg, pol, n, profile, contest, salt) {
  let hit = 0, tank = 0, both = 0, rollGold = 0, unitGold = 0, rolls = 0, level = 0, hitRoll = [], doneAt = [];
  for (let t = 0; t < n; t++) {
    const plan = makePlan(cfg, pol, t);
    const contestComp = contest ? {id: 'same', n: 1, units: plan.needs.filter(x => x.priority === 0).map(x => ({line: x.line, star: cfg.twoStar ? 2 : 3, cost: cfg.unitCost}))} : null;
    const x = simulate(plan, {seed: hashSeed(`${salt}|${t}`), profile, contest: contestComp});
    hit += x.hit; tank += x.tank; both += x.hit && x.tank; rollGold += x.spentRolls; unitGold += x.spentUnits; rolls += x.rolls; level += x.level;
    if (x.hit) { hitRoll.push(x.spentRolls); doneAt.push(x.doneAt); }
  }
  hitRoll.sort((a, b) => a - b); doneAt.sort((a, b) => a - b);
  const q = (a, p) => a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : null;
  return {n, hit: hit / n, tank4: tank / n, both: both / n, rollGold: rollGold / n, unitGold: unitGold / n, rolls: rolls / n, level: level / n,
    hitRollMedian: q(hitRoll, 0.5), hitRollP80: q(hitRoll, 0.8), medianDone: doneAt.length ? label(q(doneAt, 0.5)) : null};
}

const out = {generated: new Date().toISOString(), N, NB, audit: {}, configs: []};
// Gold audit: income to 5-2 under each level curve (no unit purchases), 128 games each profile.
for (const [lv, levels] of Object.entries({none: [], ...curves})) for (const profile of ['win', 'mixed', 'lose']) {
  let g = 0, e = 0, x = 0, l = 0, interest = 0, streak = 0; const G = 128;
  const at42 = [], at31 = [];
  for (let s = 0; s < G; s++) { const a = goldAudit({seed: hashSeed(`audit|${lv}|${profile}|${s}`), profile, levels}); g += a.gold; e += a.earned; x += a.xpGold; l += a.level; interest += a.interestTotal; streak += a.streakTotal; at31.push(a.timeline[R(3, 1)].gold); at42.push(a.timeline[R(4, 2)].gold); }
  out.audit[`${lv}|${profile}`] = {curve: lv, profile, games: G, goldAt52: g / G, earned: e / G, xpGold: x / G, level: l / G, interest: interest / G, streak: streak / G, goldAt31: at31.reduce((a, b) => a + b) / G, goldAt42: at42.reduce((a, b) => a + b) / G};
}
for (const cfg of configs) {
  const grid = policies.map(pol => ({pol, ...run(cfg, pol, N, 'mixed', false, `grid|${cfg.type}|${cfg.k}|${cfg.level}|${JSON.stringify(pol)}`)}));
  // Best: highest hit rate; ties within 2 points broken by less roll gold.
  grid.sort((a, b) => (b.hit - a.hit) || (a.rollGold - b.rollGold));
  const top = grid[0].hit, best = grid.filter(g => g.hit >= top - 0.02).sort((a, b) => a.rollGold - b.rollGold)[0];
  const confirm = {};
  for (const profile of ['win', 'mixed', 'lose']) for (const contest of [false, true]) confirm[`${profile}|${contest ? 'contested' : 'open'}`] = run(cfg, best.pol, NB, profile, contest, `confirm|${cfg.type}|${cfg.k}|${cfg.level}|${profile}|${contest}`);
  out.configs.push({...cfg, best: best.pol, grid: grid.map(g => ({...g.pol, hit: g.hit, tank4: g.tank4, rollGold: g.rollGold})), confirm});
  console.log(cfg.type, 'k=' + cfg.k, 'L' + cfg.level, JSON.stringify(best.pol), 'hit', confirm['mixed|open'].hit.toFixed(3), 'contested', confirm['mixed|contested'].hit.toFixed(3), 'tank4', confirm['mixed|open'].tank4.toFixed(3), 'rollGold', confirm['mixed|open'].rollGold.toFixed(0));
}
fs.writeFileSync(new URL('../../work/fiveTwo37/budget.json', import.meta.url), JSON.stringify(out, null, 1));
