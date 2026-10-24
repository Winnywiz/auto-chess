// Version 35 PvP economy and shop rules, transcribed from the public game build
// (shop/route modules, read as data, 2026-10-25). Seals and boons are not modelled.
import fs from 'node:fs';

export const RULES = {
  players: 8,
  startGold: 5,
  startLevel: 2,
  baseIncome: 5,
  winGold: 1,
  streakGold: [[2, 1], [3, 2], [5, 3]],
  interestStep: 10,
  interestMax: 5,
  rerollCost: 2,
  xpPerRound: 2,
  xpBuy: {cost: 4, amount: 4},
  // XP needed at level L to reach L+1 (PvP table).
  xpTable: {1: 2, 2: 4, 3: 8, 4: 12, 5: 16, 6: 24, 7: 40, 8: 66},
  // PvP shop odds by level, percent for cost 1..5.
  odds: {
    1: [100, 0, 0, 0, 0], 2: [100, 0, 0, 0, 0], 3: [75, 25, 0, 0, 0],
    4: [65, 30, 5, 0, 0], 5: [58, 32, 9, 1, 0], 6: [42, 40, 15, 3, 0],
    7: [22, 32, 34, 12, 0], 8: [14, 22, 32, 26, 6], 9: [5, 12, 26, 35, 22],
  },
  pool: {1: 29, 2: 22, 3: 18, 4: 10, 5: 9},
  slots: 5,
  bench: 9,
  // PvE rewards: gold on win / on loss.
  pve: {route1: [0, 0], rocket: [3, 2], snorlax: [0, 2], legend: [0, 2]},
};

const STAGE = ['pvp', 'pvp', 'pvp', 'safari', 'pvp', 'pvp', 'pvp', 'pve'];
const STAGE_PVE = {2: 'rocket', 3: 'snorlax', 4: 'legend'};

// Native round index n -> stage/round/kind (same mapping as the game's H()).
export function round(n) {
  if (n < 3) return n === 0 ? {n, stage: 1, r: 1, kind: 'oak'} : {n, stage: 1, r: n + 1, kind: 'pve', pve: 'route1'};
  const m = n - 3, stage = 2 + Math.floor(m / STAGE.length), r = (m % STAGE.length) + 1;
  if (stage >= 5) return {n, stage: 5, r: m - 3 * STAGE.length + 1, kind: 'pvp'};
  const kind = STAGE[r - 1];
  return kind === 'pve' ? {n, stage, r, kind, pve: STAGE_PVE[stage]} : {n, stage, r, kind};
}
export const label = n => { const x = round(n); return `${x.stage}-${x.r}`; };
export const roundIndex = (stage, r) => stage === 1 ? r - 1 : stage >= 5 ? 27 + (r - 1) : 3 + (stage - 2) * 8 + (r - 1);
export const FIVE_TWO = roundIndex(5, 2);

export function addXp(level, xp, add) {
  xp += add;
  while (level < 9 && xp >= RULES.xpTable[level]) { xp -= RULES.xpTable[level]; level++; }
  if (level >= 9) xp = 0;
  return {level, xp};
}
export function income(gold, streak, wonPvp) {
  const interest = Math.min(RULES.interestMax, Math.floor(gold / RULES.interestStep));
  let s = 0; for (const [k, v] of RULES.streakGold) if (Math.abs(streak) >= k) s = v;
  return RULES.baseIncome + interest + s + (wonPvp ? RULES.winGold : 0);
}

const data = JSON.parse(fs.readFileSync(new URL('../../simulation/data-v35.json', import.meta.url)));
export const ROSTER = Object.fromEntries(data.roster.map(r => [r.id, r]));
export const SHOP_LINES = data.roster.filter(r => !r.branchOf);
export const family = line => ROSTER[line]?.branchOf ?? line;
export const cost = line => ROSTER[family(line)].cost;
export const DATA = data;

export function rng(seed) {
  let a = 0x9e3779b9 ^ seed, b = 0x243f6a88 ^ (seed * 7919), c = 0xb7e15162, d = seed >>> 0;
  const next = () => { a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; let t = (a + b) | 0; a = b ^ b >>> 9; b = c + (c << 3) | 0; c = c << 21 | c >>> 11; d = d + 1 | 0; t = t + d | 0; c = c + t | 0; return (t >>> 0) / 4294967296; };
  for (let i = 0; i < 12; i++) next();
  return next;
}
export function hashSeed(text) { let h = 2166136261; for (const ch of String(text)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

// One shop of five slots, weighted by remaining copies (pool minus all held copies), as in the game.
export function rollShop(level, remaining, banned, r) {
  const odds = RULES.odds[level], out = [];
  for (let s = 0; s < RULES.slots; s++) {
    let x = r() * 100, tier = 1;
    for (let i = 0; i < 5; i++) { if (x < odds[i]) { tier = i + 1; break; } x -= odds[i]; }
    let lines = BY_COST[tier].filter(l => remaining[l] > 0 && !banned?.has(l));
    if (!lines.length) { for (const t of [1, 2, 3, 4, 5].filter(t => t !== tier)) { lines = BY_COST[t].filter(l => remaining[l] > 0 && !banned?.has(l)); if (lines.length && odds[t - 1] > 0) break; } }
    const total = lines.reduce((n, l) => n + remaining[l], 0);
    if (!total) { out.push(null); continue; }
    let y = r() * total, pick = lines[lines.length - 1];
    for (const l of lines) { y -= remaining[l]; if (y <= 0) { pick = l; break; } }
    remaining[pick]--; out.push(pick);
  }
  return out;
}
export const BY_COST = {1: [], 2: [], 3: [], 4: [], 5: []};
for (const r of SHOP_LINES) BY_COST[r.cost].push(r.id);
