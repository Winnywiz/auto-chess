import fs from 'node:fs';
import {OUT} from './paths.mjs';
import {roundIndex as R} from './acquire.mjs';
import {family} from './combat.mjs';
import {STRATEGIES,isFront,cost} from './search.mjs';
const budget=JSON.parse(fs.readFileSync(new URL('budget.json',OUT)));
const curves = {
  r1: [[R(2, 1), 4], [R(2, 5), 5]],
  r2: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]],
  r12: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]],
  r12s: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]],
  r3: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(4, 1), 7]],
  r3early: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 1), 6], [R(3, 5), 7]],
  f8: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(3, 5), 7], [R(4, 2), 8]],
};
const at = s => { const [a, b] = s.split('-').map(Number); return R(a, b); };
function bestPolicy(type, k, level) {
  const c = budget.configs.find(x => x.type.startsWith(type) && x.k === Math.min(k, type === '1-cost' ? 4 : type === '2-cost' ? 3 : 2) && x.level === level) ?? budget.configs.find(x => x.type.startsWith(type));
  return c.best;
}
export function planFor(strat, team, carry, extras, curveKey = strat) {
  const S = STRATEGIES[strat], lv = curves[curveKey].at(-1)[1];
  const type = strat === 'f8' ? '4-cost' : ['r12', 'r12s'].includes(strat) ? ([carry, ...extras].every(l => cost(l) === 1) ? '1-cost' : '2-cost') : `${S.carryCost}-cost`;
  const pol = bestPolicy(type, 1 + extras.length, strat === 'f8' ? 8 : lv);
  const reach = curves[curveKey].at(-1)[0], rollFrom = pol.from === 'early' ? reach : reach + 2;
  const needs = team.map(u => ({line: family(u.line), copies: 3 ** (u.star - 1), priority: u.line === carry || extras.includes(u.line) || (u.star === 1 && cost(u.line) >= 4) ? 0 : (isFront(u.line) && u.items.length) ? 1 : 2}));
  return {levels: curves[curveKey], rollLevel: lv, rollFrom, floor: pol.floor, allInAt: Math.max(at(pol.allIn), rollFrom), needs, levelAfter: true, levelKeep: 20, maxLevel: strat === 'r12s' ? 6 : S.finalLevel + 1, policy: pol};
}
