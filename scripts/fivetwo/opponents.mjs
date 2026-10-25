// Reconstruct the ranked lobby around 5-2 from the official meta API stage snapshots.
import fs from 'node:fs';
import {roster, family, arrange, FULL} from './combat.mjs';

const meta = JSON.parse(fs.readFileSync(new URL('../../work/fiveTwo36/meta.json', import.meta.url)));
const validLine = l => !!roster[l];
const mode = levels => { const tot = levels.reduce((s, l) => s + l.share, 0); let best = levels[0]; for (const l of levels) if (l.share > best.share) best = l; return {level: best.level, dist: Object.fromEntries(levels.map(l => [l.level, l.share / tot]))}; };
const frontish = l => roster[l].range <= 1 && roster[l].role !== 'assassin';

function itemPlan(comp, team) {
  const itemsOf = line => (comp.units.find(u => u.line === line)?.items ?? []).filter(i => FULL.includes(i.id));
  const weight = line => itemsOf(line).slice(0, 3).reduce((s, i) => s + i.share, 0);
  const sorted = [...team].sort((a, b) => weight(b.line) - weight(a.line));
  const carry = sorted.find(u => !frontish(u.line) || roster[u.line].role !== 'tank') ?? sorted[0];
  const tank = sorted.find(u => u !== carry && frontish(u.line)) ?? team.find(u => u !== carry && frontish(u.line));
  const second = sorted.find(u => u !== carry && u !== tank && weight(u.line) > 0);
  const top = (line, n, fallback) => { const ids = itemsOf(line).map(i => i.id); const out = [...ids.slice(0, n)]; while (out.length < n) out.push(fallback[out.length % fallback.length]); return out; };
  const spa = l => (roster[l].forms.at(-1).skill.scale?.spa ?? 0) >= 0.5;
  const out = team.map(u => ({...u, items: []}));
  const set = (u, list) => { if (u) out.find(x => x.line === u.line).items = list; };
  set(carry, top(carry.line, 3, spa(carry.line) ? ['choice-specs', 'quick-claw', 'focus-sash'] : ['choice-band', 'scope-lens', 'focus-sash']));
  if (tank) set(tank, top(tank.line, 3, ['protector', 'assault-vest', 'leftovers']));
  if (second) set(second, top(second.line, 1, [spa(second.line) ? 'choice-specs' : 'choice-band']));
  return {team: out, carry: carry.line, tank: tank?.line ?? null};
}

export function snapshot(comp, stage, {maxLevel = 8} = {}) {
  const g = comp.guide?.stages?.find(s => s.stage === stage);
  if (!g) return null;
  const {level, dist} = mode(g.levels);
  const L = Math.min(maxLevel, level), seen = new Set(), team = [];
  for (const u of [...g.units].sort((a, b) => b.share - a.share)) {
    if (!validLine(u.line) || seen.has(u.line) || team.length >= L) continue;
    seen.add(u.line); team.push({line: u.line, star: Math.min(3, Math.max(1, u.star))});
  }
  // Short snapshots are filled to their level from the comp's own most-used final units.
  for (const u of [...comp.units].sort((a, b) => (b.share ?? 0) - (a.share ?? 0))) {
    if (team.length >= L) break;
    if (!validLine(u.line) || seen.has(u.line)) continue;
    const c = roster[family(u.line)].cost; if (c === 5 && L < 8) continue;
    seen.add(u.line); team.push({line: u.line, star: Math.max(1, Math.min(u.star, c >= 5 ? 1 : c === 4 ? 2 : 3)), filled: true});
  }
  if (team.length < Math.min(L, 4)) return null;
  const hint = {};
  for (const c of [...(comp.placement?.cells ?? [])].sort((a, b) => b.share - a.share)) if (hint[c.line] === undefined && !Object.values(hint).includes(c.cell + 28)) hint[c.line] = c.cell + 28;
  const plan = itemPlan(comp, team);
  return {id: `api:${comp.id}:s${stage}`, comp: comp.id, stage, level: L, levelDist: dist, n: g.n, tier: comp.tier, avg: comp.avg, top4: comp.top4, games: comp.n, trait: comp.name, team: arrange(plan.team, {carry: plan.carry, hint}), carry: plan.carry, tank: plan.tank};
}

export function gauntlet({count = 18, minGames = 150} = {}) {
  const chosen = [];
  for (const c of [...meta.comps].filter(c => c.guide && c.n >= minGames).sort((a, b) => b.n - a.n)) {
    const s4 = snapshot(c, 4); if (!s4) continue;
    const lines = new Set(s4.team.map(u => family(u.line)));
    if (chosen.some(o => o.s4.team.filter(u => lines.has(family(u.line))).length >= 6)) continue;
    const s3 = snapshot(c, 3);
    chosen.push({comp: c, s4, s3, weight: Math.sqrt(c.n)});
    if (chosen.length >= count) break;
  }
  const total = chosen.reduce((s, x) => s + x.weight, 0);
  for (const x of chosen) x.weight /= total;
  return chosen;
}
export {meta};
