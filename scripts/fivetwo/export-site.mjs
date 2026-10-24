// Publish the 5-2 composition list. Gold, roll and hit-rate simulation results are NOT written
// to the website; they go to the private workbook only (scripts/fivetwo/private-table.py).
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {roster, family, traitLabel, activeTraits, boardValue} from './combat.mjs';
import {STRATEGIES} from './search.mjs';

const W = new URL('../../work/fiveTwo/', import.meta.url);
const A = JSON.parse(fs.readFileSync(new URL('analysis.json', W)));
const S = JSON.parse(fs.readFileSync(new URL('search.json', W)));
const prov = JSON.parse(fs.readFileSync(new URL('../../simulation/provenance.json', import.meta.url)));
const meta = JSON.parse(fs.readFileSync(new URL('meta.json', W)));
const name = (line, star) => roster[line].forms[Math.min(star, roster[line].forms.length) - 1].name;
const pct = x => Math.round(x * 100);
const tierOf = e => e >= 0.70 ? 'S' : e >= 0.58 ? 'A' : e >= 0.45 ? 'B' : 'C';
const category = {r1: 'reroll-1', r2: 'reroll-2', r3: 'reroll-3', f8: 'fast-8'};
const items = Object.fromEntries(JSON.parse(fs.readFileSync(new URL('../../simulation/data-v35.json', import.meta.url))).items.map(i => [i.id, i]));
const itemName = id => items[id]?.name ?? id;
const list = ids => { const c = {}; for (const i of ids) c[i] = (c[i] ?? 0) + 1; return Object.entries(c).map(([i, n]) => itemName(i) + (n > 1 ? ' ×' + n : '')).join(', '); };
const refName = r => { const t = activeTraits(r.team).sort((a, b) => b.tier - a.tier || b.n - a.n)[0]; const carry = r.team.find(u => u.items.length === 3 && roster[u.line].role !== 'tank') ?? r.team.find(u => u.items.length === 3); return `${name(carry.line, carry.star)} / ${t.t} ${t.n}`; };

function assign(team, v) {
  return team.map(u => ({line: u.line, star: u.star, cell: u.cell, items: [...u.items], assignment: u.line === v.carryLine ? 'Carry' : u.line === v.items.tank ? 'Tank' : u.line === v.items.second ? 'Secondary' : (v.extras ?? []).includes(u.line) ? 'Upgrade' : 'Support'}));
}
function plan(strat, v, carry) {
  const S2 = STRATEGIES[strat], targets = [carry, ...(v.extras ?? [])].map(l => name(l, 3)).join(' and ');
  const hold = carry === 'vaporeon' ? ' Buy Eevee copies; when they combine, hold a Special Attack item (Calcium or Choice Specs) on Eevee and keep Water active so it evolves into Vaporeon.' : '';
  if (strat === 'r1') return `Level 5 by 2-5 and slow-roll for ${targets} 3★. After the upgrade, level toward 7 for 5-2.${hold}`;
  if (strat === 'r2') return `Level 6 by 3-2 and slow-roll for ${targets} 3★. Stop at 4-5 at the latest, then level to 7.${hold}`;
  if (strat === 'r3') return `Play strongest board to 4-1, level 7 and roll for ${targets} 3★. One three-cost 3★ is the realistic limit by 5-2.`;
  return `Level 8 at 4-2 and roll for ${name(carry, 2)} 2★ and a 2★ four-cost frontline.`;
}
function tempoNote(strat, v) {
  const t = v.team.find(u => u.line === v.items.tank), tankName = name(t.line, t.star), four = v.tanks.filter(x => roster[x.line].cost === 4 && x.star === 2);
  const notes = [];
  if (roster[family(t.line)].cost === 4 && t.star === 1 && strat !== 'f8') notes.push(`${tankName} stays 1★: a 2★ four-cost tank is rarely found at level ${STRATEGIES[strat].rollLevel}.`);
  if (four.length && strat !== 'f8') { const f = four[0], gain = f.score - v.final.score; if (gain > 0.02) notes.push(`If a ${name(f.line, 2)} 2★ appears, it replaces ${tankName} (+${pct(gain)} pts) — don't roll for it.`); }
  const fallback = v.tanks.filter(x => !(x.line === t.line && x.star === t.star) && !(roster[x.line].cost === 4 && x.star === 2))[0];
  if (fallback) notes.push(`No ${tankName}? Use ${name(fallback.line, fallback.star)} ${fallback.star}★ with the same tank items.`);
  return notes;
}
function lowNote(v, carry) {
  const lb = v.lowBest, star = STRATEGIES[v.strat].carryStar - 1, miss = `${name(carry, star)} ${star}★`;
  if (lb.kind === 'keep') return {text: `If you are still on ${miss} at 4-5, keep the carry items on it and level; nothing on the board holds them better (${pct(lb.score)}% vs this lobby).`, holder: carry, star, score: lb.score};
  if (lb.kind === 'holder') return {text: `If ${miss} misses, move ${list(v.items.carry)} to ${name(lb.holder, lb.star)} (same board).`, holder: lb.holder, star: lb.star, score: lb.score, keep: v.keepScore};
  return {text: `If ${miss} misses, replace it with ${name(lb.holder, lb.star)} ${lb.star}★ holding ${list(v.items.carry)}.`, holder: lb.holder, star: lb.star, score: lb.score, keep: v.keepScore};
}

const rows = [];
for (const c of A.comps) {
  const seen = new Set();
  const vs = c.variants.map(v => ({...v, strat: c.strat, carryLine: c.line})).sort((a, b) => b.expected - a.expected)
    .filter(v => { const k = v.team.map(u => u.line + u.star).sort().join(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
  vs.forEach((v, k) => {
    const team = assign(v.team, v), carry = team.find(u => u.assignment === 'Carry');
    const top = activeTraits(team).sort((a, b) => b.tier - a.tier || b.n - a.n)[0];
    const id = `52-${c.line}-${top.t.toLowerCase()}-${top.n}${k ? '-' + 'abc'[k] : ''}`;
    const per = v.final.per.map(p => ({id: p.id, stage: p.stage, score: Math.round(p.score * 1000) / 1000}));
    rows.push({
      id, carry: c.line, variant: k, name: `${name(c.line, carry.star)} / ${top.t} ${top.n}`, category: category[c.strat], strategy: STRATEGIES[c.strat].label,
      rollLevel: STRATEGIES[c.strat].rollLevel, level: team.length, targets: [c.line, ...(v.extras ?? [])],
      tier: tierOf(v.expected), expected: v.expected, score: v.final.score, s4: v.final.s4, s3: v.final.s3, lowScore: v.lowBest.score,
      value: boardValue(team), traits: traitLabel(team), team,
      items: {carry: v.items.carry, tank: v.items.tankItems, tankUnit: v.items.tank, second: v.items.second, secondItem: v.items.secondItem},
      altBuild: v.alt ? {items: v.alt.items, score: v.alt.score} : null,
      carryOptions: v.items.rankedCarry.slice(0, 4).map(x => ({items: x.items, score: x.score})),
      plan: plan(c.strat, v, c.line), tempo: tempoNote(c.strat, v), lowRoll: lowNote(v, c.line),
      lowOptions: v.low.slice(0, 4).map(x => ({kind: x.kind, holder: x.holder, star: x.star, score: x.score})),
      tanks: v.tanks.slice(0, 5).map(x => ({line: x.line, star: x.star, score: x.score})),
      matchups: per, finalSalt: 'final|' + c.line,
    });
  });
}
rows.sort((a, b) => b.expected - a.expected);
// Transition boards, optional max cap and Seal suggestions (scripts/fivetwo/progression.mjs).
const progFile = new URL('progression.json', W);
const PROG = fs.existsSync(progFile) ? JSON.parse(fs.readFileSync(progFile)).rows : {};
const sealRecs = {};
for (const r of rows) {
  const p = PROG[r.id]; if (!p) continue;
  const slim = s => ({level: s.level, team: s.team.map(({line, star, cell, items, assignment}) => ({line, star, cell, items, assignment: assignment ?? 'Support'})), score: s.score, lobby: s.lobby, ...(s.final ? {final: true} : {})});
  r.stages = p.stages.map(slim); r.cap = {...slim(p.cap), optional: true};
  sealRecs[r.id] = {[r.level]: p.seals};
}
const reference = A.reference.map(r => ({id: `api:${r.id}:s4`, comp: r.id, name: refName(r), tier: r.tier, games: r.n, avg: r.avg, top4: r.top4, level: r.level, team: r.team, traits: r.traits, score: r.score, s4: r.s4, s3: r.s3, expected: r.expected, lowScore: r.lowScore})).sort((a, b) => b.expected - a.expected);
const C = {
  version: 'v35-52-1', generated: A.generated, gameRules: 35, engineIdentity: prov.identity, model: 'finish-by-5-2', itemBudget: 7, itemSplit: {tank: 3, carry: 3, secondary: 1},
  apiGenerated: meta.generated, apiRules: meta.rules, lobbyBoards: reference.length,
  method: 'Boards are the realistic 5-2 board for each plan: reroll targets at 3★, other three-cost or cheaper units at 2★, four-costs at 1★ unless the plan is Fast 8, five-costs only at level 8. Seven finished items: three on the tank, three on the carry and one on a secondary carry. Combat score: 4 fresh seeds on both sides against ranked-meta boards rebuilt from the official API stage snapshots (80% stage-4 lobby, 20% stage-3 lobby), weighted by popularity. Tier uses the expected 5-2 score, which blends the full board with the best low-roll fallback by how often the upgrade is found in a full-game shop simulation.',
  rows, reference,
};
const html = fs.readFileSync('compositions.html', 'utf8');
const json = JSON.stringify(C);
let out = html.replace(/<script>window\.KANTO_COMPS=\{[^\n]*\};\s*<\/script>/, `<script>window.KANTO_COMPS=${json};</script>`);
out = out.replace(/\s*<script>window\.KANTO_GUIDES=\{[^\n]*\};?\s*<\/script>/, '');
if (out === html) throw Error('No composition data replaced');
fs.writeFileSync('compositions.html', out);
if (Object.keys(sealRecs).length) {
  const src = fs.readFileSync('seals-data.js', 'utf8'), SD = JSON.parse(src.match(/window\.KANTO_SEALS=(\{.*\});?\s*$/s)[1]);
  SD.recommendations = sealRecs;
  SD.method = 'Seal picks for the 5-2 compositions. Economy and shop Seals are ranked by how much they speed up finishing the board by 5-2 in the full-game shop simulation; combat Seals by native board fit (roles, active traits, carry traits, positions). Combat Seal effects are not fought in the simulator.';
  fs.writeFileSync('seals-data.js', 'window.KANTO_SEALS=' + JSON.stringify(SD) + ';\n');
}
// Public test record: boards, items and combat results only.
const record = {version: C.version, engine: prov.identity, generated: C.generated, method: C.method, gauntlet: S.gauntlet.map(g => ({id: g.id, tier: g.tier, games: g.n, weight: g.weight, stage4: g.s4.team, stage3: g.s3?.team ?? null})),
  rows: rows.map(r => ({id: r.id, name: r.name, strategy: r.strategy, boards: [{level: r.level, team: r.team}, ...(r.stages ?? []).filter(s => !s.final).map(s => ({level: s.level, team: s.team})), ...(r.cap ? [{level: 9, team: r.cap.team, cap: true}] : [])], score: r.score, expected: r.expected, tier: r.tier, matchups: r.matchups, altBuild: r.altBuild, lowOptions: r.lowOptions, tanks: r.tanks})),
  reference: reference.map(r => ({id: r.id, name: r.name, boards: [{level: r.level, team: r.team}], score: r.score, expected: r.expected}))};
fs.writeFileSync('data/compositions-52.json', JSON.stringify(record));
console.log(rows.length, 'rows', Object.entries(rows.reduce((m, r) => (m[r.tier] = (m[r.tier] ?? 0) + 1, m), {})), 'sha', createHash('sha256').update(json).digest('hex').slice(0, 12));
