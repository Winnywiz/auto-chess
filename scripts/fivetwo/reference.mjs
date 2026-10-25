// Put the ranked-meta reference boards on the same footing as our boards: how often their
// 3★ targets and level are reached by 5-2, and how they fight when the targets stay one star lower.
import fs from 'node:fs';
import {family, startPool} from './combat.mjs';
import {score, cost, isFront} from './search.mjs';
import {simulate, roundIndex as R} from './acquire.mjs';
import {hashSeed} from './rules.mjs';

const W = new URL('../../work/fiveTwo36/', import.meta.url);
const A = JSON.parse(fs.readFileSync(new URL('analysis.json', W)));
const curves = {
  1: [[R(2, 1), 4], [R(2, 5), 5]], 2: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]], 3: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(4, 1), 7]],
  4: [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(3, 5), 7], [R(4, 2), 8]],
};
startPool();
for (const r of A.reference) {
  const threes = r.team.filter(u => u.star === 3 && cost(u.line) <= 3);
  const key = threes.length ? Math.max(...threes.map(u => cost(u.line))) : 4;
  const targets = threes.length ? threes.map(u => u.line) : r.team.filter(u => cost(u.line) === 4 && u.star === 2).map(u => u.line);
  const levels = curves[key], rollLevel = levels.at(-1)[1];
  const needs = r.team.map(u => ({line: family(u.line), copies: 3 ** (u.star - 1), priority: targets.includes(u.line) ? 0 : isFront(u.line) && u.items.length ? 1 : 2}));
  const plan = {levels, rollLevel, rollFrom: levels.at(-1)[0], floor: 50, allInAt: R(4, 5), needs, levelAfter: true, levelKeep: 20, maxLevel: Math.max(r.level, rollLevel)};
  let ok = 0, core = 0; const N = 300;
  for (let i = 0; i < N; i++) { const x = simulate(plan, {seed: hashSeed(`ref|${r.id}|${i}`)}); core += x.hit; ok += x.hit && x.level >= r.level; }
  const low = r.team.map(u => targets.includes(u.line) ? {...u, star: u.star - 1} : u);
  const lowScore = (await score([low], {nSeeds: 2, salt: 'reflow|' + r.id, s3: true}))[0].score;
  const p = ok / N;
  Object.assign(r, {targets, pTargets: core / N, pReach: p, lowScore, expected: p * r.score + (1 - p) * lowScore});
  console.log(r.id, r.traits, 'score', r.score.toFixed(3), 'reach', p.toFixed(2), 'low', lowScore.toFixed(3), 'exp', r.expected.toFixed(3));
}
fs.writeFileSync(new URL('analysis.json', W), JSON.stringify(A, null, 1));
process.exit(0);
