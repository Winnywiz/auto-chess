// 5-2 composition search: realistic stars at the finishing level, seven items
// (three tank, three carry, one secondary carry), scored against reconstructed ranked lobbies.
import fs from 'node:fs';
import {roster, family, FULL, traitCounts, activeTraits, traitLabel, arrange, seeds, scoreMany, startPool, boardValue, traitRules} from './combat.mjs';
import {gauntlet, meta} from './opponents.mjs';

const OUT = new URL('../../work/fiveTwo36/', import.meta.url);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const FLEX = new Set(['charmander', 'nidoran', 'pikachu', 'poliwag', 'sandshrew', 'ponyta', 'growlithe', 'slowpoke', 'scyther', 'cubone', 'snorlax', 'staryu', 'articuno', 'zapdos', 'moltres', 'venomoth', 'victreebel', 'nidoqueen']);
const cost = l => roster[family(l)].cost;
const range = l => roster[l].range, role = l => roster[l].role;
const isFront = l => range(l) <= 1 && role(l) !== 'assassin';
const isTank = l => role(l) === 'tank' || (isFront(l) && ['snorlax', 'slowpoke', 'seel', 'onix', 'sandshrew', 'geodude', 'bulbasaur', 'caterpie', 'rhyhorn', 'nidoqueen', 'tangela4', 'machop', 'poliwag'].includes(l));
const spa = l => (roster[l].forms.at(-1).skill.scale?.spa ?? 0) >= 0.5;
const canCrit = l => roster[l].forms.some(f => f.skill.canCrit);
const SHOP = Object.values(roster).filter(r => !r.branchOf).map(r => r.id); // Eevee is allowed: the game's "Keep Eevee" toggle stops it evolving (2★ Bite, 3★ Last Resort)
const EEVEE = ['vaporeon', 'jolteon', 'flareon'];

// ---------- Meta context ----------
const comps = meta.comps.filter(c => c.n >= 10);
const tierW = {S: 1, A: 0.8, B: 0.6, C: 0.4};
const traitW = {};
for (const t of meta.traits) traitW[`${t.type}|${t.level}`] = tierW[t.tier] ?? 0.4;
const placeHint = {};
{
  const acc = {};
  for (const c of comps) for (const p of c.placement?.cells ?? []) { acc[p.line] ??= {}; acc[p.line][p.cell + 28] = (acc[p.line][p.cell + 28] ?? 0) + c.n * p.share; }
  for (const [l, m] of Object.entries(acc)) placeHint[l] = +Object.entries(m).sort((a, b) => b[1] - a[1])[0][0];
}
function cooccur(carry) {
  const f = family(carry), acc = {};
  let total = 0;
  for (const c of comps) {
    const u = c.units.find(u => u.line === carry || (carry === 'eevee' ? EEVEE.includes(u.line) : false));
    if (!u || (u.share ?? 0) < 40) continue;
    const w = c.n * Math.max(0.2, 5 - c.avg); total += w;
    for (const v of c.units) if ((v.share ?? 0) >= 30 && v.line !== carry && roster[v.line]) acc[v.line] = (acc[v.line] ?? 0) + w * v.share / 100;
  }
  for (const k in acc) acc[k] /= total || 1;
  return acc;
}

const GPT = (() => { try { return JSON.parse(fs.readFileSync(new URL('../../compositions-gpt.html', import.meta.url), 'utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).rows; } catch { return []; } })();
// ---------- Strategy definitions ----------
export const STRATEGIES = {
  r1: {key: 'r1', label: 'Reroll 1-cost', rollLevel: 5, finalLevel: 7, carryCost: 1, carryStar: 3, extra: [0, 1, 2], extraCost: 1},
  r2: {key: 'r2', label: 'Reroll 2-cost', rollLevel: 6, finalLevel: 7, carryCost: 2, carryStar: 3, extra: [0, 1], extraCost: 2},
  r3: {key: 'r3', label: 'Reroll 3-cost', rollLevel: 7, finalLevel: 7, carryCost: 3, carryStar: 3, extra: [0], extraCost: 3},
  f8: {key: 'f8', label: 'Fast 8', rollLevel: 8, finalLevel: 8, carryCost: 4, carryStar: 2, extra: [0], extraCost: 4},
};
function starFor(line, strat, {carry, extras, tank2}) {
  if (line === carry) return strat.carryStar;
  if (extras.includes(line)) return 3;
  const c = cost(line);
  if (c <= 3) return 2;
  if (c === 4) return tank2 === line || (strat.key === 'f8' && tank2 === undefined && isTank(line)) ? 2 : 1;
  return 1;
}
const maxCost = (strat, level) => level >= 8 ? 5 : 4;

// ---------- Items ----------
const ATK_POOL = ['choice-band', 'scope-lens', 'choice-scarf', 'razor-fang', 'life-orb', 'expert-belt', 'shell-bell', 'quick-claw', 'poison-barb', 'focus-sash'];
const SPA_POOL = ['choice-specs', 'quick-claw', 'life-orb', 'twisted-spoon', 'shell-bell', 'expert-belt', 'focus-sash', 'scope-lens', 'light-clay', 'choice-scarf'];
const TANK_SETS = [
  ['leftovers', 'rocky-helmet', 'sitrus-berry'], ['protector', 'assault-vest', 'leftovers'], ['eviolite', 'leftovers', 'sitrus-berry'],
  ['protector', 'rocky-helmet', 'focus-sash'], ['leftovers', 'flame-orb', 'assault-vest'], ['sitrus-berry', 'protector', 'eviolite'],
  ['leftovers', 'rocky-helmet', 'focus-sash'], ['assault-vest', 'eviolite', 'sitrus-berry'], ['leftovers', 'leftovers', 'rocky-helmet'],
];
const defaultCarry = l => spa(l) ? ['choice-specs', 'quick-claw', 'life-orb'] : ['choice-band', 'scope-lens', 'choice-scarf'];
const defaultSecond = l => spa(l) ? 'choice-specs' : 'choice-band';
function gear(team, carry, tank, second, carryItems, tankItems, secondItem) {
  return team.map(u => ({...u, items: u.line === carry ? [...carryItems] : u.line === tank ? [...tankItems] : u.line === second ? [secondItem] : []}));
}

// ---------- Candidate generation ----------
function heuristic(team, co, carry) {
  let h = 0;
  for (const t of activeTraits(team)) for (let k = 1; k <= t.tier; k++) h += (traitW[`${t.t.toLowerCase()}|${k}`] ?? 0.5) * (1 + 0.35 * k);
  for (const u of team) { h += 0.18 * cost(u.line) * u.star; h += 2.2 * (co[u.line] ?? 0); }
  const fronts = team.filter(u => isFront(u.line)).length;
  if (fronts < 2) h -= 2; if (fronts > Math.ceil(team.length / 2) + 1) h -= 1;
  return h;
}
function rnd(seed) { let s = seed >>> 0; return () => { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; }; }
function buildCandidates(carryLine, strat, level, count) {
  const shopCarry = family(carryLine), co = cooccur(carryLine === 'vaporeon' ? 'vaporeon' : carryLine);
  const eligible = SHOP.filter(l => l !== shopCarry && cost(l) <= maxCost(strat, level) && !(cost(l) === 5 && level < 8));
  const extraPool = eligible.filter(l => cost(l) === strat.extraCost);
  const out = new Map();
  const add = (lines, extras, tank2, src) => {
    const team0 = [carryLine, ...lines].map(line => ({line}));
    if (team0.length !== level || new Set(team0.map(u => family(u.line))).size !== level) return;
    const team = team0.map(u => ({line: u.line, star: starFor(u.line, strat, {carry: carryLine, extras, tank2})}));
    const key = team.map(u => u.line + u.star).sort().join(',');
    if (!out.has(key)) out.set(key, {team, extras, tank2, src, h: heuristic(team, co, carryLine)});
  };
  // 1. Ranked meta boards that contain the carry, adapted to the level.
  for (const c of comps) {
    const u = c.units.find(u => u.line === carryLine); if (!u || (u.share ?? 0) < 40) continue;
    const lines = c.units.filter(v => v.line !== carryLine && roster[v.line] && !roster[v.line].branchOf && eligible.includes(v.line)).sort((a, b) => (b.share ?? 0) - (a.share ?? 0)).map(v => v.line);
    const picked = [...new Set(lines)].slice(0, level - 1);
    if (picked.length < level - 1) continue;
    const ex = strat.extra.at(-1) ? picked.filter(l => cost(l) === strat.extraCost && c.units.find(v => v.line === l)?.star === 3).slice(0, strat.extra.at(-1)) : [];
    add(picked, ex, undefined, 'meta:' + c.id);
  }
  // 1b. The GPT v36 boards (backup page) for the same carry, adapted to this level and star rules.
  for (const g of GPT.filter(g => g.carry === carryLine)) {
    const others = g.team.filter(u => u.line !== carryLine && eligible.includes(u.line)).sort((a, b) => cost(b.line) * b.star - cost(a.line) * a.star).map(u => u.line);
    if (others.length < level - 1) continue;
    const picked = others.slice(0, level - 1);
    add(picked, picked.filter(l => cost(l) === strat.extraCost && g.team.find(u => u.line === l)?.star === 3).slice(0, strat.extra.at(-1)), undefined, 'gpt:' + g.id);
  }
  // 2. Randomized trait-greedy boards.
  const r = rnd(hashStr(carryLine + strat.key + level));
  for (let i = 0; i < count * 6 && out.size < count * 3; i++) {
    const nExtra = strat.extra[Math.floor(r() * strat.extra.length)];
    let team = [{line: carryLine, star: strat.carryStar}];
    const frontPool = eligible.filter(isTank);
    const t0 = frontPool[Math.floor(r() * frontPool.length)];
    team.push({line: t0, star: 1});
    while (team.length < level) {
      const options = eligible.filter(l => !team.some(u => family(u.line) === family(l)));
      const scored = options.map(l => { const t = [...team, {line: l, star: cost(l) <= 3 ? 2 : 1}]; return [l, heuristic(t, co, carryLine) + r() * 1.6]; }).sort((a, b) => b[1] - a[1]);
      const pick = scored[Math.min(scored.length - 1, Math.floor(r() * r() * 4))][0];
      team.push({line: pick, star: 1});
    }
    const lines = team.slice(1).map(u => u.line);
    const ex = lines.filter(l => extraPool.includes(l)).sort(() => r() - 0.5).slice(0, nExtra);
    add(lines, ex, undefined, 'greedy');
  }
  return [...out.values()].sort((a, b) => b.h - a.h).slice(0, count);
}
function hashStr(s) { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }

// Choose tank (frontline with three items) and secondary carry for a board.
function roles(team, carry) {
  const fronts = team.filter(u => u.line !== carry && isFront(u.line));
  const tank = [...fronts].sort((a, b) => (isTank(b.line) - isTank(a.line)) || (cost(b.line) * b.star - cost(a.line) * a.star) || (roster[b.line].forms[b.star - 1].stats.hp - roster[a.line].forms[a.star - 1].stats.hp))[0] ?? team.find(u => u.line !== carry);
  const second = [...team].filter(u => u.line !== carry && u.line !== tank.line && !isTank(u.line)).sort((a, b) => (cost(b.line) * b.star) - (cost(a.line) * a.star) || (range(b.line) - range(a.line)))[0] ?? team.find(u => u.line !== carry && u.line !== tank.line);
  return {tank: tank.line, second: second?.line};
}

// ---------- Scoring ----------
const G = gauntlet();
const S4 = G.map(x => ({board: x.s4, w: x.weight})), S3 = G.filter(x => x.s3).map(x => ({board: x.s3, w: x.weight}));
async function score(boards, {nSeeds = 1, salt = 's', s3 = false} = {}) {
  const sd = seeds(nSeeds, salt), pairs = [];
  for (const b of boards) { for (const o of S4) pairs.push({a: b, b: o.board.team, seeds: sd}); if (s3) for (const o of S3) pairs.push({a: b, b: o.board.team, seeds: sd}); }
  const res = await scoreMany(pairs);
  let k = 0;
  return boards.map(() => {
    let s4 = 0, w4 = 0, s3v = 0, w3 = 0; const per = [];
    for (const o of S4) { const v = res[k++]; s4 += v * o.w; w4 += o.w; per.push({id: o.board.id, stage: 4, score: v}); }
    if (s3) for (const o of S3) { const v = res[k++]; s3v += v * o.w; w3 += o.w; per.push({id: o.board.id, stage: 3, score: v}); }
    const a = s4 / w4, b = s3 ? s3v / w3 : null;
    return {score: s3 ? 0.8 * a + 0.2 * b : a, s4: a, s3: b, per, battles: per.length * nSeeds * 2};
  });
}

function equip(c, carryLine, items) {
  const {tank, second} = roles(c.team, carryLine);
  return {tank, second, team: arrange(gear(c.team, carryLine, tank, second, items?.carry ?? defaultCarry(carryLine), items?.tank ?? TANK_SETS[0], items?.second ?? defaultSecond(second ?? carryLine)), {carry: carryLine, hint: placeHint})};
}
function combos(pool, k) { const out = []; const rec = (start, cur) => { if (cur.length === k) { out.push([...cur]); return; } for (let i = start; i < pool.length; i++) { cur.push(pool[i]); rec(i, cur); cur.pop(); } }; rec(0, []); return out; }

async function optimizeItems(c, carryLine) {
  const base = equip(c, carryLine);
  const pools = FLEX.has(carryLine) ? [ATK_POOL, SPA_POOL] : [spa(carryLine) ? SPA_POOL : ATK_POOL];
  const singles = [...new Set(pools.flat())].filter(i => i !== 'scope-lens' || canCrit(carryLine) || !spa(carryLine));
  // Rank single items with two defaults removed.
  const singleBoards = singles.map(i => arrange(gear(c.team, carryLine, base.tank, base.second, [i, i, i].slice(0, 1).concat(defaultCarry(carryLine).filter(x => x !== i).slice(0, 2)), TANK_SETS[0], defaultSecond(base.second ?? carryLine)), {carry: carryLine, hint: placeHint}));
  const sScore = await score(singleBoards, {salt: 'single|' + carryLine});
  const topSingles = singles.map((i, k) => [i, sScore[k].score]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
  const carrySets = combos(topSingles, 3).filter(s => s.filter(i => i === 'focus-sash').length <= 1);
  const cBoards = carrySets.map(set => arrange(gear(c.team, carryLine, base.tank, base.second, set, TANK_SETS[0], defaultSecond(base.second ?? carryLine)), {carry: carryLine, hint: placeHint}));
  const cScore = await score(cBoards, {nSeeds: 2, salt: 'carry|' + carryLine});
  const rankedCarry = carrySets.map((s, k) => ({items: s, score: cScore[k].score})).sort((a, b) => b.score - a.score);
  const bestCarry = rankedCarry[0].items;
  const tBoards = TANK_SETS.map(set => arrange(gear(c.team, carryLine, base.tank, base.second, bestCarry, set, defaultSecond(base.second ?? carryLine)), {carry: carryLine, hint: placeHint}));
  const tScore = await score(tBoards, {nSeeds: 2, salt: 'tank|' + carryLine});
  const rankedTank = TANK_SETS.map((s, k) => ({items: s, score: tScore[k].score})).sort((a, b) => b.score - a.score);
  const secondPool = base.second ? [...new Set([defaultSecond(base.second), 'quick-claw', 'scope-lens', 'life-orb', 'shell-bell', 'choice-scarf', 'twisted-spoon', 'expert-belt'])] : [];
  const sBoards = secondPool.map(i => arrange(gear(c.team, carryLine, base.tank, base.second, bestCarry, rankedTank[0].items, i), {carry: carryLine, hint: placeHint}));
  const sec = sBoards.length ? await score(sBoards, {nSeeds: 2, salt: 'second|' + carryLine}) : [];
  const rankedSecond = secondPool.map((i, k) => ({item: i, score: sec[k].score})).sort((a, b) => b.score - a.score);
  // Alternative carry build: best set that differs in at least two items.
  const differs = (a, b) => { const x = [...a]; let same = 0; for (const i of b) { const j = x.indexOf(i); if (j >= 0) { same++; x.splice(j, 1); } } return 3 - same; };
  const alt = rankedCarry.find(s => differs(s.items, bestCarry) >= 2) ?? rankedCarry[1];
  return {tank: base.tank, second: base.second, carry: bestCarry, tankItems: rankedTank[0].items, secondItem: rankedSecond[0]?.item ?? null, alt: alt?.items ?? null, rankedCarry: rankedCarry.slice(0, 6), rankedTank: rankedTank.slice(0, 4), rankedSecond: rankedSecond.slice(0, 3)};
}

// ---------- Board clean-up passes ----------
// Utility and support units, and one-unit passive trait activators, tested in every support slot.
const UTILITY = ['chansey', 'jigglypuff', 'psyduck', 'porygon3', 'ditto', 'gastly', 'dratini', 'pikachu', 'voltorb', 'magnemite', 'electabuzz', 'abra', 'slowpoke', 'seel', 'omastar', 'exeggcute'];
const label = t => t.map(u => u.line + u.star).join(' ');
async function refine(top, line, S, notes) {
  const eligibleAll = SHOP.filter(l => cost(l) <= maxCost(S, S.finalLevel) && !(cost(l) === 5 && S.finalLevel < 8) && l !== family(line));
  const mk = (team, src) => ({...top, team, extras: top.extras.filter(x => team.some(u => u.line === x)), src: top.src + '+' + src});
  const slots = () => top.team.map((u, i) => i).filter(i => top.team[i].line !== line && !top.extras.includes(top.team[i].line));
  const tankLine = () => roles(top.team, line).tank;
  const tryBoards = async (cands, tag, accept) => {
    if (!cands.length) return false;
    const uniq = [...new Map(cands.map(c => [label(c.team), c])).values()].slice(0, 30);
    const res = await score(uniq.map(c => equip(c, line).team), {nSeeds: 2, salt: tag + '|' + line});
    const best = uniq.map((c, i) => ({...c, ...res[i]})).sort((a, b) => b.score - a.score)[0];
    if (best && accept(best)) { notes.push(`${tag}: ${label(best.team)} ${(top.score * 100).toFixed(1)} -> ${(best.score * 100).toFixed(1)}`); top = best; return true; }
    return false;
  };
  // Re-score the start on the same 2-seed basis so comparisons are fair.
  top = {...top, ...(await score([equip(top, line).team], {nSeeds: 2, salt: 'base|' + line}))[0]};
  for (let pass = 0; pass < 2; pass++) {
    // (a) Breakpoints: a trait one short of its next breakpoint gets a unit that completes it.
    const counts = traitCounts(top.team), cands = [];
    for (const [t, n] of Object.entries(counts)) {
      const next = traitRules[t].thresholds.find(x => x > n); if (next !== n + 1) continue;
      for (const i of slots()) for (const l of eligibleAll.filter(l => roster[l].traits.includes(t) && !top.team.some(u => family(u.line) === family(l)))) {
        const team = top.team.map((u, k) => k === i ? {line: l, star: starFor(l, S, {carry: line, extras: top.extras})} : u);
        if (traitCounts(team)[t] >= next && team.some(u => isFront(u.line) && u.line !== line)) cands.push(mk(team, 'breakpoint ' + t + ' ' + next));
      }
    }
    const co = cooccur(line);
    await tryBoards(cands.sort((a, b) => heuristic(b.team, co, line) - heuristic(a.team, co, line)), 'breakpoint', b => b.score > top.score + 0.01);
    // (b) Utility units and passive traits.
    const util = [];
    for (const i of slots()) { if (top.team[i].line === tankLine()) continue; for (const l of UTILITY.filter(l => !top.team.some(u => family(u.line) === family(l)) && eligibleAll.includes(l))) util.push(mk(top.team.map((u, k) => k === i ? {line: l, star: starFor(l, S, {carry: line, extras: top.extras})} : u), 'utility ' + l)); }
    await tryBoards(util.sort((a, b) => heuristic(b.team, co, line) - heuristic(a.team, co, line)), 'utility', b => b.score > top.score + 0.01);
    // (c) One-star units: prefer a two-star alternative unless the one-star unit is clearly better.
    for (const i of slots()) {
      const u = top.team[i]; if (u.star !== 1) continue;
      const alts = eligibleAll.filter(l => cost(l) <= 3 && !top.team.some(v => family(v.line) === family(l))).map(l => mk(top.team.map((v, k) => k === i ? {line: l, star: 2} : v), 'two-star for ' + u.line)).filter(c => c.team.some(v => isFront(v.line) && v.line !== line));
      const ok = await tryBoards(alts.sort((a, b) => heuristic(b.team, co, line) - heuristic(a.team, co, line)), 'two-star', b => b.score >= top.score - 0.015);
      if (!ok) notes.push(`kept ${u.line} 1-star: no two-star alternative within 1.5 pts`);
    }
  }
  return top;
}

// ---------- Carries ----------
function carryList() {
  const list = [];
  for (const r of Object.values(roster)) {
    const c = r.cost;
    if (r.id === 'eevee') continue;
    if (r.branchOf && r.branchOf === 'eevee') { list.push({line: r.id, strat: 'r2'}); continue; }
    if (isTank(r.id) && !['slowpoke', 'seel', 'geodude', 'bulbasaur', 'machop', 'poliwag', 'snorlax'].includes(r.id)) continue;
    if (c === 1) list.push({line: r.id, strat: 'r1'});
    else if (c === 2) list.push({line: r.id, strat: 'r2'});
    else if (c === 3) list.push({line: r.id, strat: 'r3'});
    else if (c === 4 && role(r.id) !== 'support') list.push({line: r.id, strat: 'f8'});
  }
  return list;
}

async function main() {
  startPool();
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const carries = carryList().filter(c => !only || only.includes(c.line));
  log('gauntlet', S4.length, 'stage-4 boards,', S3.length, 'stage-3 boards; carries', carries.length);
  // Stage A: screen every carry with its top heuristic candidates.
  // Resume: reuse the saved screen and finished carries from an interrupted run.
  const resume = process.env.RESUME && fs.existsSync(new URL('screen.json', OUT));
  const screened = resume ? JSON.parse(fs.readFileSync(new URL('screen.json', OUT))) : [];
  for (const {line, strat} of resume ? [] : carries) {
    const S = STRATEGIES[strat], cands = buildCandidates(line, S, S.finalLevel, 10);
    if (!cands.length) continue;
    const res = await score(cands.map(c => equip(c, line).team), {salt: 'screen|' + line});
    const best = cands.map((c, i) => ({...c, ...res[i]})).sort((a, b) => b.score - a.score)[0];
    screened.push({line, strat, best: best.score, team: best.team});
    log('screen', line, strat, best.score.toFixed(3), traitLabel(best.team));
  }
  fs.writeFileSync(new URL('screen.json', OUT), JSON.stringify(screened, null, 1));
  // Keep the strongest carries per strategy.
  const keepPer = {r1: 8, r2: 9, r3: 6, f8: 8};
  const keep = Object.keys(STRATEGIES).flatMap(k => screened.filter(s => s.strat === k).sort((a, b) => b.best - a.best).slice(0, only ? 99 : keepPer[k]));
  // Stage B: deeper board search, items and variants.
  const results = resume && fs.existsSync(new URL('search.json', OUT)) ? JSON.parse(fs.readFileSync(new URL('search.json', OUT))).results : [];
  for (const {line, strat} of keep) {
    if (results.some(r => r.line === line)) continue;
    const S = STRATEGIES[strat], cands = buildCandidates(line, S, S.finalLevel, 30);
    const res = await score(cands.map(c => equip(c, line).team), {salt: 'search|' + line});
    const ranked = cands.map((c, i) => ({...c, ...res[i]})).sort((a, b) => b.score - a.score);
    // Local improvement: try swapping each non-carry unit for the best alternatives on the top board.
    let top = ranked[0];
    for (let round = 0; round < 2; round++) {
      const swaps = [];
      const eligible = SHOP.filter(l => cost(l) <= maxCost(S, S.finalLevel) && !(cost(l) === 5 && S.finalLevel < 8) && !top.team.some(u => family(u.line) === family(l)) && l !== family(line));
      for (let i = 1; i < top.team.length; i++) for (const l of eligible) {
        const team = top.team.map((u, k) => k === i ? {line: l, star: starFor(l, S, {carry: line, extras: top.extras, tank2: top.tank2})} : u);
        if (!team.some(u => isFront(u.line) && u.line !== line)) continue;
        swaps.push({...top, team, extras: top.extras.filter(x => team.some(u => u.line === x)), src: top.src + '+swap'});
      }
      const co = cooccur(line);
      const shortlist = swaps.map(s => ({...s, h: heuristic(s.team, co, line)})).sort((a, b) => b.h - a.h).slice(0, 24);
      const sres = await score(shortlist.map(c => equip(c, line).team), {salt: 'swap' + round + '|' + line});
      const better = shortlist.map((c, i) => ({...c, ...sres[i]})).sort((a, b) => b.score - a.score)[0];
      if (better && better.score > top.score + 0.01) top = better; else break;
    }
    const notes = [];
    top = await refine(top, line, S, notes);
    let second = ranked.find(r => r !== top && r.team.filter(u => !top.team.some(v => v.line === u.line)).length >= 2);
    if (second) { second = await refine(second, line, S, notes); if (second.team.filter(u => !top.team.some(v => v.line === u.line)).length < 2) second = null; }
    const variants = [top, second].filter(Boolean);
    const out = [];
    for (const v of variants) {
      const it = await optimizeItems(v, line);
      const team = arrange(gear(v.team, line, it.tank, it.second, it.carry, it.tankItems, it.secondItem), {carry: line, hint: placeHint});
      out.push({team, extras: v.extras, src: v.src, items: it});
    }
    const finals = await score(out.map(o => o.team), {nSeeds: 8, salt: 'final|' + line, s3: true});
    results.push({line, strat, notes, variants: out.map((o, i) => ({...o, final: finals[i], traits: traitLabel(o.team), value: boardValue(o.team)}))});
    log('final', line, strat, finals.map(f => f.score.toFixed(3)).join(' / '), traitLabel(out[0].team));
    fs.writeFileSync(new URL('search.json', OUT), JSON.stringify({gauntlet: G.map(x => ({id: x.comp.id, tier: x.comp.tier, n: x.comp.n, avg: x.comp.avg, weight: x.weight, s4: x.s4, s3: x.s3})), results}, null, 1));
  }
  process.exit(0);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
export {buildCandidates, roles, equip, score, optimizeItems, gear, placeHint, S4, S3, G, isFront, isTank, spa, defaultCarry, defaultSecond, TANK_SETS, starFor, cost, SHOP, cooccur, heuristic, maxCost};
