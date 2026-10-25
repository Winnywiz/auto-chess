// Full-game acquisition simulator from 1-1 to the 5-2 planning phase.
// Shared pool with seven opponents drawn from the official ranked meta, native shop odds,
// income, interest, streaks, XP and rerolls. No Seals, boons, carousel units or item drops.
import fs from 'node:fs';
import {RULES, round, roundIndex, FIVE_TWO, addXp, income, family, cost, rollShop, SHOP_LINES, rng} from './rules.mjs';

const meta = JSON.parse(fs.readFileSync(new URL('../../work/fiveTwo36/meta.json', import.meta.url)));
const metaComps = meta.comps.filter(c => c.n >= 10).map(c => ({
  id: c.id, n: c.n,
  units: c.units.filter(u => (u.share ?? 0) >= 35 && family(u.line) && cost(u.line)).map(u => ({line: family(u.line), star: u.star, cost: cost(u.line)})),
}));
const metaTotal = metaComps.reduce((s, c) => s + c.n, 0);
function pickComp(r) { let x = r() * metaTotal; for (const c of metaComps) { x -= c.n; if (x <= 0) return c; } return metaComps.at(-1); }
const copiesFor = star => 3 ** (star - 1);

// Copies an opponent holds at a given stage while building toward their ranked board.
function opponentHoldings(comp, stage, r, out) {
  if (stage <= 1) return;
  for (const u of comp.units) {
    let star = u.star;
    if (stage === 2) { if (u.cost > 2) continue; star = 1; }
    else if (stage === 3) { if (u.cost > 3) continue; star = Math.min(star, u.cost === 1 && u.star === 3 ? 3 : 2); if (r() < 0.35) star = Math.max(1, star - 1); }
    else if (stage === 4) { if (u.cost >= 5 && r() < 0.5) continue; star = Math.min(star, u.cost >= 4 ? (r() < 0.45 ? 2 : 1) : star); }
    else { star = Math.min(star, u.cost === 5 ? 1 : u.cost === 4 ? (r() < 0.6 ? 2 : 1) : star); }
    out[u.line] = (out[u.line] ?? 0) + copiesFor(star);
  }
}
const OPP_LEVEL = {1: 3, 2: 4, 3: 6, 4: 7, 5: 8};

export function units(copies) { return (copies % 3) + (Math.floor(copies / 3) % 3) + Math.floor(copies / 9); }
export const starOf = c => (c >= 9 ? 3 : c >= 3 ? 2 : c >= 1 ? 1 : 0);

const PROFILES = {
  win: {p: 0.72, stick: 0.15},
  mixed: {p: 0.5, stick: 0.2},
  lose: {p: 0.28, stick: 0.15},
};
export {PROFILES};

/**
 * plan = {
 *   levels: [[roundIndex, level]...]   buy XP to be at least this level from this round
 *   rollLevel, rollFrom, floor, allInAt, // slow-roll above `floor` from `rollFrom`; floor 0 from `allInAt`
 *   needs: [{line, copies, priority}]  // priority 0 targets, 1 tank, 2 others
 *   levelAfter: true                     // after all needs are met, spend excess on XP
 * }
 */
// Seal effects that change the economy or shop (a subset of the native Seal effect kinds).
export function sealState(picks, n, S = {ownedK: 1, freeRolls: 0, sale: false, rerollCost: RULES.rerollCost, xpCost: RULES.xpBuy.cost, xpAmount: RULES.xpBuy.amount, xpRound: 0, income: 0, grow: null, step: RULES.interestStep, max: RULES.interestMax, streakGold: 0, levelUpGold: 0, levelUpRolls: 0, noRollGold: 0, shift: 0, incomeRoll: null, gold: 0, later: []}) {
  for (const {at, effects, k = 0} of picks) if (at === n) for (const e of effects) {
    const v = x => Array.isArray(x) ? x[Math.min(k, x.length - 1)] : x;
    if (e.k === 'shop') { if (e.ownedK) S.ownedK *= e.ownedK; if (e.freeRolls) S.freeRolls += e.freeRolls; if (e.price?.from === 2) S.sale = true; if (e.rerollCost !== undefined) S.rerollCost = Math.min(S.rerollCost, e.rerollCost); if (e.odds) S.shift += e.odds.pts; }
    else if (e.k === 'xpBuy') { if (e.cost) S.xpCost = Math.min(S.xpCost, e.cost); if (e.amount) S.xpAmount = Math.max(S.xpAmount, e.amount); }
    else if (e.k === 'xpRound' && !e.cond && !e.every) S.xpRound += v(e.v);
    else if (e.k === 'income') { S.income += v(e.v); if (e.grow) S.grow = {...e.grow, from: n}; }
    else if (e.k === 'incomeRoll') S.incomeRoll = [e.min, e.max];
    else if (e.k === 'interest') { S.step = Math.min(S.step, e.step); S.max = Math.max(S.max, e.max); }
    else if (e.k === 'streakGold') S.streakGold += e.v;
    else if (e.k === 'gold') S.gold += v(e.v);
    else if (e.k === 'goldLater') S.later.push({at: n + e.rounds, gold: v(e.v)});
    else if (e.k === 'pay') S.gold -= e.v;
    else if (e.k === 'levelUp') { S.levelUpGold += e.gold; S.levelUpRolls += e.rolls; }
    else if (e.k === 'noRollGold') S.noRollGold += e.v;
    else if (e.k === 'level') S.levelNow = (S.levelNow ?? 0) + e.v;
  }
  return S;
}
export function simulate(plan, {seed = 1, profile = 'mixed', contest = null, until = FIVE_TWO, seals = []} = {}) {
  const r = rng(seed), prof = PROFILES[profile];
  let gold = RULES.startGold, level = RULES.startLevel, xp = 0, streak = 0, lastWin = r() < prof.p;
  const owned = {}, needMap = new Map(plan.needs.map(x => [x.line, x]));
  const opps = Array.from({length: RULES.players - 1}, (_, i) => contest && i === 0 ? contest : pickComp(r));
  let spentUnits = 0, spentRolls = 0, rolls = 0, spentXp = 0, doneAt = null, tankAt = null;
  const lowest = {}; // first round each need reached its copies
  const need = x => Math.max(0, x.copies - (owned[x.line] ?? 0));
  const allTargets = () => plan.needs.filter(x => x.priority === 0).every(x => need(x) === 0);
  const tankDone = () => plan.needs.filter(x => x.priority === 1).every(x => need(x) === 0);
  const capacity = () => RULES.bench + level;
  const held = () => Object.values(owned).reduce((s, c) => s + units(c), 0);
  function buyFrom(shop, onlyTargets = false) {
    const order = shop.map((l, i) => [l, i]).filter(([l]) => l && needMap.has(l)).sort((a, b) => needMap.get(a[0]).priority - needMap.get(b[0]).priority);
    for (const [l] of order) {
      const x = needMap.get(l); if (need(x) <= 0) continue; if (onlyTargets && x.priority > 0) continue;
      const c = S.sale && cost(l) === 2 ? 1 : cost(l); if (gold < c) continue;
      const before = owned[l] ?? 0; if (held() - units(before) + units(before + 1) > capacity()) continue;
      gold -= c; spentUnits += c; owned[l] = before + 1;
      if (need(x) === 0 && lowest[l] === undefined) lowest[l] = n;
    }
  }
  let n = 0, S = sealState([], -1), freeLeft = 0, rolledThisRound = false;
  for (n = 0; n <= until; n++) {
    const info = round(n);
    S = sealState(seals, n, S); if (S.gold) { gold += S.gold; S.gold = 0; } if (S.levelNow) { for (let i = 0; i < S.levelNow && level < 9; i++) level++; S.levelNow = 0; }
    for (const l of S.later.filter(x => x.at === n)) gold += l.gold;
    freeLeft = S.freeRolls; rolledThisRound = false;
    const shopOpt = () => ({ownedK: S.ownedK, owned, shift: S.shift});
    const lvUp = (before) => { if (level > before) { gold += S.levelUpGold * (level - before); freeLeft += S.levelUpRolls * (level - before); } };
    // Lobby state for this planning phase.
    const taken = {};
    for (const o of opps) opponentHoldings(o, info.stage, r, taken);
    const remaining = {};
    for (const l of SHOP_LINES) remaining[l.id] = Math.max(0, RULES.pool[l.cost] - (taken[l.id] ?? 0) - (owned[l.id] ?? 0));
    // Opponents' visible shops also hold copies.
    for (let i = 0; i < opps.length; i++) rollShop(Math.min(9, OPP_LEVEL[info.stage]), remaining, null, r);
    const shopRemain = () => ({...remaining, ...Object.fromEntries(Object.entries(owned).map(([l, c]) => [l, Math.max(0, RULES.pool[cost(l)] - (taken[l] ?? 0) - c)]))});
    const banned = new Set(Object.entries(owned).filter(([, c]) => c >= 9).map(([l]) => l));
    // 1. Level according to plan.
    const target = plan.levels.filter(([at]) => n >= at).reduce((m, [, lv]) => Math.max(m, lv), 0);
    while (level < Math.min(9, target) && gold >= S.xpCost) { const b = level; gold -= S.xpCost; spentXp += S.xpCost; ({level, xp} = addXp(level, xp, S.xpAmount)); lvUp(b); }
    // 2. Free shop.
    if (info.kind !== 'oak') buyFrom(rollShop(level, shopRemain(), banned, r, shopOpt()));
    // 3. Rolling.
    const rolling = level >= plan.rollLevel && n >= plan.rollFrom && !(allTargets() && tankDone());
    if (rolling) {
      const floor = n >= plan.allInAt ? (plan.allInFloor ?? 0) : plan.floor;
      let guard = 0;
      while ((freeLeft > 0 || gold - S.rerollCost >= floor) && guard++ < 80 && !(allTargets() && tankDone())) {
        if (freeLeft > 0) freeLeft--; else { gold -= S.rerollCost; spentRolls += S.rerollCost; rolledThisRound = true; }
        rolls++;
        buyFrom(rollShop(level, shopRemain(), new Set(Object.entries(owned).filter(([, c]) => c >= 9).map(([l]) => l)), r, shopOpt()));
      }
    }
    if (doneAt === null && allTargets()) doneAt = n;
    if (tankAt === null && tankDone()) tankAt = n;
    // 4. After the carry is done, convert spare gold into levels while keeping interest.
    if (plan.levelAfter && allTargets() && n >= (plan.levelFrom ?? 0)) {
      while (level < (plan.maxLevel ?? 9) && gold - S.xpCost >= (plan.levelKeep ?? 30)) { const b = level; gold -= S.xpCost; spentXp += S.xpCost; ({level, xp} = addXp(level, xp, S.xpAmount)); lvUp(b); }
    }
    if (n === until) break;
    // 5. Combat result and end-of-round economy.
    let pve = info.kind === 'pve' || info.kind === 'oak' || info.kind === 'safari';
    let won;
    if (info.kind === 'pvp') { won = r() < (r() < prof.stick ? (lastWin ? 1 : 0) : prof.p); lastWin = won; streak = won ? Math.max(1, streak + 1) : Math.min(-1, streak - 1); }
    else won = info.kind === 'pve' ? r() < (info.pve === 'route1' ? 0.97 : 0.6) : false;
    if (info.kind === 'pve') gold += RULES.pve[info.pve][won ? 0 : 1];
    if (info.kind !== 'oak' && info.kind !== 'safari') {
      const interest = Math.min(S.max, Math.floor(gold / S.step));
      let s = 0; for (const [k, v] of RULES.streakGold) if (Math.abs(streak) >= k) s = v;
      if (s > 0) s += S.streakGold;
      const grow = S.grow ? Math.floor((n - S.grow.from) / S.grow.every) * S.grow.by : 0;
      const roll = S.incomeRoll ? S.incomeRoll[0] + Math.floor(r() * (S.incomeRoll[1] - S.incomeRoll[0] + 1)) : 0;
      gold += RULES.baseIncome + interest + s + (info.kind === 'pvp' && won ? RULES.winGold : 0) + S.income + grow + roll + (!rolledThisRound ? S.noRollGold : 0);
    }
    if (info.kind !== 'safari') { const b = level; ({level, xp} = addXp(level, xp, RULES.xpPerRound + S.xpRound)); lvUp(b); }
  }
  const stars = Object.fromEntries(plan.needs.map(x => [x.line, starOf(owned[x.line] ?? 0)]));
  return {hit: allTargets(), tank: tankDone(), others: plan.needs.every(x => need(x) === 0), doneAt, tankAt, level, gold, spentUnits, spentRolls, spentXp, rolls, stars, owned};
}

// Pure-economy audit: no purchases; reports gold available when each level curve is followed.
export function goldAudit({seed = 1, profile = 'mixed', levels = [], until = FIVE_TWO}) {
  const r = rng(seed), prof = PROFILES[profile];
  let gold = RULES.startGold, level = RULES.startLevel, xp = 0, streak = 0, lastWin = r() < prof.p, xpGold = 0, earned = RULES.startGold, interestTotal = 0, streakTotal = 0, winTotal = 0, pveTotal = 0;
  const timeline = [];
  for (let n = 0; n <= until; n++) {
    const info = round(n);
    const target = levels.filter(([at]) => n >= at).reduce((m, [, lv]) => Math.max(m, lv), 0);
    while (level < target && gold >= RULES.xpBuy.cost) { gold -= RULES.xpBuy.cost; xpGold += RULES.xpBuy.cost; ({level, xp} = addXp(level, xp, RULES.xpBuy.amount)); }
    timeline.push({n, label: `${info.stage}-${info.r}`, gold, level});
    if (n === until) break;
    let won;
    if (info.kind === 'pvp') { won = r() < (r() < prof.stick ? (lastWin ? 1 : 0) : prof.p); lastWin = won; streak = won ? Math.max(1, streak + 1) : Math.min(-1, streak - 1); }
    else won = info.kind === 'pve' ? r() < (info.pve === 'route1' ? 0.97 : 0.6) : false;
    if (info.kind === 'pve') { const g = RULES.pve[info.pve][won ? 0 : 1]; gold += g; earned += g; pveTotal += g; }
    if (info.kind !== 'oak' && info.kind !== 'safari') {
      const interest = Math.min(RULES.interestMax, Math.floor(gold / RULES.interestStep));
      let s = 0; for (const [k, v] of RULES.streakGold) if (Math.abs(streak) >= k) s = v;
      const w = info.kind === 'pvp' && won ? 1 : 0, g = RULES.baseIncome + interest + s + w;
      gold += g; earned += g; interestTotal += interest; streakTotal += s; winTotal += w;
    }
    if (info.kind !== 'safari') ({level, xp} = addXp(level, xp, RULES.xpPerRound));
  }
  return {gold, level, xp, earned, xpGold, interestTotal, streakTotal, winTotal, pveTotal, timeline};
}
export {roundIndex, FIVE_TWO};
