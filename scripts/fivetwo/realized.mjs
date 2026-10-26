// Score a plan on the boards players actually have at 5-2: every simulated game records which
// copies were found and the level reached; those realized boards are fought, weighted by frequency.
import {roster, family, arrange} from './combat.mjs';
import {simulate, roundIndex as R} from './acquire.mjs';
import {hashSeed} from './rules.mjs';
import {availableForm} from './forms.mjs';

const cost = l => roster[family(l)].cost;
const isFront = l => roster[l].range <= 1 && roster[l].role !== 'assassin';
const starOf = c => (c >= 9 ? 3 : c >= 3 ? 2 : c >= 1 ? 1 : 0);

export const CURVES = {
  5: [[R(2, 1), 4], [R(2, 5), 5]],
  6: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]],
  7: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(4, 1), 7]],
  8: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(3, 5), 7], [R(4, 2), 8]],
};
// Generic plan: roll at `rollLevel` for the 3★ (or Fast 8 2★) targets, buy the rest as seen, level after the hit.
export function planOf(team, {targets, rollLevel, policy = {floor: 50, allIn: R(4, 5), from: 'early'}}) {
  const levels = CURVES[rollLevel], reach = levels.at(-1)[0];
  return {levels, rollLevel, rollFrom: policy.from === 'late' ? reach + 2 : reach, floor: policy.floor, allInAt: Math.max(policy.allIn, reach), levelAfter: true, levelKeep: 20, maxLevel: Math.max(team.length, rollLevel),
    needs: team.map(u => ({line: family(u.line), copies: 3 ** (u.star - 1), priority: targets.includes(u.line) ? 0 : u.items.length === 3 && isFront(u.line) ? 1 : 2}))};
}

export function realizedBoards(team, plan, {n = 200, salt = 'realize', contest = null} = {}) {
  const carry = team.find(u => u.items.length === 3 && !isFront(u.line)) ?? team.find(u => u.items.length === 3);
  const prio = u => (u === carry ? 0 : u.items.length === 3 ? 1 : plan.needs.find(x => x.line === family(u.line))?.priority === 0 ? 2 : 3 + (10 - cost(u.line) * u.star) / 100);
  const patterns = new Map();
  let hitAll = 0;
  for (let i = 0; i < n; i++) {
    const x = simulate(plan, {seed: hashSeed(`${salt}|${i}`), contest});
    hitAll += x.hit;
    let units = team.map(u => {const star=Math.min(u.star,starOf(x.owned[family(u.line)]??0));return {...u,targetLine:u.line,line:availableForm(u.line,star),items:[...u.items],star};}).filter(u => u.star > 0);
    units.sort((a, b) => prio(team.find(t => t.line === a.targetLine)) - prio(team.find(t => t.line === b.targetLine)));
    units = units.slice(0, Math.max(1, Math.min(x.level, team.length)));
    // Items of a missing holder move to the closest replacement on the board.
    const present = new Set(units.map(u => family(u.line)));
    for (const h of team.filter(u => u.items.length && !present.has(family(u.line)))) {
      const front = isFront(h.line), to = units.filter(u => !u.items.length).sort((a, b) => (isFront(b.line) === front) - (isFront(a.line) === front) || cost(b.line) * b.star - cost(a.line) * a.star)[0];
      if (to) to.items = [...h.items];
    }
    const key = units.map(u => u.line + u.star).sort().join(',');
    if (!patterns.has(key)) patterns.set(key, {key, n: 0, team: arrange(units, {carry: units.find(u=>u.targetLine===carry?.line)?.line, hint: Object.fromEntries(units.map(u => [u.line, u.cell]))})});
    patterns.get(key).n++;
  }
  return {patterns: [...patterns.values()].sort((a, b) => b.n - a.n), hitAll: hitAll / n, n};
}

// Expected 5-2 score: fight the most common realized boards (covering `cover` of games, at most `max`).
export async function realizedScore(team, plan, score, {n = 200, salt = 'realize', max = 8, cover = 0.9, nSeeds = 3, contest = null} = {}) {
  const {patterns, hitAll} = realizedBoards(team, plan, {n, salt, contest});
  const chosen = []; let covered = 0;
  for (const p of patterns) { if (chosen.length >= max || covered >= cover * n) break; chosen.push(p); covered += p.n; }
  const res = await score(chosen.map(p => p.team), {nSeeds, salt: 'real|' + salt, s3: true});
  let s = 0;
  chosen.forEach((p, i) => { p.score = res[i].score; s += p.score * p.n; });
  return {expected: s / covered, covered: covered / n, hitAll, patterns: chosen.map(p => ({share: p.n / n, score: p.score, team: p.team.map(u => ({line: u.line, star: u.star}))}))};
}
