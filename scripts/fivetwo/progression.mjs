// Level 5-8 transition boards, an optional max-cap board, and Seal suggestions for every
// published 5-2 composition. Early boards are scored against the stage-3 ranked lobby,
// level 8 and the cap against the stage-4 lobby. Seal economy effects are measured with the
// full-game shop simulation (kept private); combat Seals are ranked by board fit.
import fs from 'node:fs';
import {roster, family, arrange, activeTraits, traitCounts, scoreMany, seeds, startPool, traitRules} from './combat.mjs';
import {S3, S4, placeHint, isFront, isTank, cost, SHOP, heuristic, cooccur} from './search.mjs';
import {simulate, roundIndex as R} from './acquire.mjs';
import {hashSeed} from './rules.mjs';

const W = new URL('../../work/fiveTwo36/', import.meta.url);
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const html = fs.readFileSync('compositions.html', 'utf8');
const C = JSON.parse(html.match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const sealSrc = fs.readFileSync('seals-data.js', 'utf8');
const SEALS = JSON.parse(sealSrc.match(/window\.KANTO_SEALS=(\{.*\});?\s*$/s)[1]);
const NS = Number(process.env.NS ?? 160);

async function vs(boards, lobby, nSeeds, salt) {
  const sd = seeds(nSeeds, salt), pairs = [];
  for (const b of boards) for (const o of lobby) pairs.push({a: b, b: o.board.team, seeds: sd});
  const res = await scoreMany(pairs); let k = 0;
  return boards.map(() => { let s = 0, w = 0; for (const o of lobby) { s += res[k++] * o.w; w += o.w; } return s / w; });
}
const starAt = (u, L, r) => {
  const c = cost(u.line), target = r.targets.includes(u.line);
  if (target) return L >= r.rollLevel ? u.star : c >= 4 ? 1 : Math.min(u.star, 2);
  if (c <= 2) return Math.min(u.star, 2);
  if (c === 3) return L >= 6 ? Math.min(u.star, 2) : 1;
  if (c === 4) return L >= 8 && r.category === 'fast-8' ? u.star : 1;
  return 1;
};
function withItems(team, r) {
  const carry = r.team.find(u => u.assignment === 'Carry'), tank = r.team.find(u => u.assignment === 'Tank'), second = r.team.find(u => u.assignment === 'Secondary');
  const out = team.map(u => ({...u, items: []}));
  const put = (line, items) => { const u = out.find(x => x.line === line); if (u) { u.items = [...items]; return true; } return false; };
  put(carry.line, carry.items);
  if (!put(tank.line, tank.items)) { const f = out.filter(u => u.line !== carry.line && isFront(u.line)).sort((a, b) => isTank(b.line) - isTank(a.line) || cost(b.line) * b.star - cost(a.line) * a.star)[0]; if (f) f.items = [...tank.items]; }
  if (second && !put(second.line, second.items)) { const s = out.find(u => !u.items.length && u.line !== carry.line && !isTank(u.line)); if (s) s.items = [...second.items]; }
  return out.map(u => ({...u, assignment: u.line === carry.line ? 'Carry' : u.items.length === 3 ? 'Tank' : u.items.length === 1 ? 'Secondary' : r.targets.includes(u.line) ? 'Upgrade' : 'Support'}));
}
const hints = team => ({...placeHint, ...Object.fromEntries(team.map(u => [u.line, u.cell]))});
function subsets(arr, k) { const out = []; const rec = (i, cur) => { if (cur.length === k) { out.push([...cur]); return; } for (let j = i; j < arr.length; j++) { cur.push(arr[j]); rec(j + 1, cur); cur.pop(); } }; rec(0, []); return out; }

async function earlyBoard(r, L) {
  const carry = r.team.find(u => u.assignment === 'Carry');
  const rest = r.team.filter(u => u !== carry && !(cost(u.line) === 5 && L < 8) && !(cost(u.line) === 4 && L <= 5));
  let pool = rest.length >= L - 1 ? rest : r.team.filter(u => u !== carry);
  const co = cooccur(r.carry);
  const opts = subsets(pool, L - 1).map(s => { const team = [carry, ...s].map(u => ({line: u.line, star: starAt(u, L, r)})); const h = heuristic(team, co, r.carry) + (team.some(u => u.line === r.team.find(x => x.assignment === 'Tank').line) ? 1.5 : 0) + (team.filter(u => isFront(u.line)).length >= 2 ? 1 : -2); return {team, h}; }).sort((a, b) => b.h - a.h).slice(0, 4);
  const boards = opts.map(o => arrange(withItems(o.team, r), {carry: r.carry, hint: hints(r.team)}));
  const sc = await vs(boards, S3, 2, `prog|${r.id}|${L}`);
  const i = sc.indexOf(Math.max(...sc));
  return {level: L, team: boards[i], score: sc[i], lobby: 'stage 3'};
}
async function addUnit(r, base, L, opts) {
  // Add units one at a time until the board has L units.
  let cur = {team: base, score: null};
  do { cur = await addOne(r, cur.team, L, {...opts, upgradeFours: opts.upgradeFours && cur.team === base, salt: opts.salt + '|' + cur.team.length}); } while (cur.team.length < L);
  return cur;
}
async function addOne(r, base, L, {upgradeFours = false, lobby = S4, salt}) {
  const have = new Set(base.map(u => family(u.line)));
  let team0 = base.map(u => ({...u}));
  if (upgradeFours) team0 = team0.map(u => cost(u.line) === 4 ? {...u, star: 2} : u);
  const co = cooccur(r.carry);
  const cands = SHOP.filter(l => !have.has(family(l)) && cost(l) >= 3 && cost(l) <= 5).map(l => ({l, star: cost(l) === 3 ? 2 : cost(l) === 4 && upgradeFours ? 2 : 1})).map(c => ({...c, h: heuristic([...team0, {line: c.l, star: c.star}], co, r.carry)})).sort((a, b) => b.h - a.h).slice(0, 8);
  const boards = cands.map(c => arrange([...team0.map(u => ({...u, items: [...u.items]})), {line: c.l, star: c.star, items: [], assignment: 'Support'}], {carry: r.carry, hint: hints(base)}));
  const sc = await vs(boards, lobby, 2, salt);
  const i = sc.indexOf(Math.max(...sc));
  return {level: L, team: boards[i].map(u => ({...u, assignment: u.assignment ?? 'Support'})), score: sc[i], lobby: 'stage 4'};
}

// ---------- Seals ----------
const ECON_KINDS = new Set(['shop', 'xpBuy', 'xpRound', 'income', 'incomeRoll', 'interest', 'streakGold', 'gold', 'goldLater', 'pay', 'levelUp', 'noRollGold', 'level']);
const isEcon = s => s.effects.every(e => ECON_KINDS.has(e.k)) && !s.effects.some(e => e.k === 'shop' && (e.shinyK || e.traitFirst || e.slots || e.legendAt));
const ROUNDS = [R(2, 1), R(3, 2), R(4, 2)];
function planFor(r) {
  const curves = {'reroll-1': [[R(2, 1), 4], [R(2, 5), 5]], 'reroll-2': [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]], 'reroll-12': [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6]], 'reroll-3': [[R(2, 1), 4], [R(2, 5), 5], [R(3, 1), 6], [R(3, 5), 7]], 'fast-8': [[R(2, 1), 4], [R(2, 5), 5], [R(3, 2), 6], [R(3, 5), 7], [R(4, 2), 8]]};
  const levels = curves[r.category], at = levels.at(-1);
  return {levels, rollLevel: at[1], rollFrom: at[0], floor: 50, allInAt: R(4, 5), levelAfter: true, levelKeep: 20, maxLevel: r.level + 1,
    needs: r.team.map(u => ({line: family(u.line), copies: 3 ** (u.star - 1), priority: r.targets.includes(u.line) ? 0 : u.assignment === 'Tank' ? 1 : 2}))};
}
function hitRate(plan, seals, salt) { let h = 0; for (let i = 0; i < NS; i++) h += simulate(plan, {seed: hashSeed(`${salt}|${i}`), seals}).hit; return h / NS; }
function fit(s, r, k) {
  const team = r.team, roles = team.map(u => roster[u.line].role), carry = team.find(u => u.assignment === 'Carry'), cr = roster[carry.line].role;
  const active = activeTraits(team), traitsOf = l => roster[l].traits, counts = traitCounts(team);
  const has = t => active.some(a => a.t === t), carryHas = t => traitsOf(carry.line).includes(t);
  let v = 0; const why = [];
  for (const n of s.needs ?? []) {
    if (n.k === 'traitActive' && !has(n.type)) return {v: -1};
    if (n.k === 'roleAtLeast' && !team.some(u => n.role.includes(roster[u.line].role))) return {v: -1};
    if (n.k === 'heroReach') { if (!team.some(u => (s.heroLines ?? []).includes(family(u.line)))) return {v: -1}; v += 3; }
    if (n.k === 'levelBelow' && r.level >= n.v && k === 2) return {v: -1};
    if (n.k === 'typeLines' && !Object.values(counts).some(c => c >= 6)) return {v: -1};
  }
  for (const e of s.effects) {
    const f = e.f ?? {};
    if (f.role) { const m = team.filter(u => f.role.includes(roster[u.line].role)).length; v += m * 0.8 + (f.role.includes(cr) ? 3 : 0) + (f.role.includes('tank') && team.some(u => u.assignment === 'Tank' && f.role.includes(roster[u.line].role)) ? 1.5 : 0); }
    if (e.req && has(e.req)) v += 2 + (carryHas(e.req) ? 3 : 0) + (counts[e.req] ?? 0) * 0.3;
    if (f.type && f.type !== '$T' && has(f.type)) v += 1 + (carryHas(f.type) ? 2 : 0);
    if (f.traitsMin) v += team.filter(u => traitsOf(u.line).length >= f.traitsMin).length * 0.6;
    if (e.perTrait) v += active.length * 0.7;
    if (e.k === 'stat' && !f.role && !f.type && !f.row && !f.cell && !f.corner && !f.edge && !f.adjTo && !f.lineMin && !f.adjMax && !f.traitsMin && !f.shared && !e.perUnit && !f.tag) v += 2.5;
    if (e.k === 'fx' && !e.f && !e.req) v += 2;
    if (f.row === 'back') v += team.filter(u => u.cell >= 49 && u.items.length).length * 2;
    if (f.row === 'front') v += team.filter(u => u.cell <= 34).length * 0.7;
    if (f.adjTo === 38) v += team.filter(u => [30, 31, 37, 39, 44, 45].includes(u.cell)).length * 0.8;
    if (f.cell) v += 2.5;
    if (f.shared) v += Object.values(counts).some(c => c >= 6) ? 4 : 0;
    if (e.k === 'mana') v += 2;
    if (e.k === 'weather') v += e.w === 'rain' && has('Water') ? 3 : e.w === 'sun' && has('Grass') ? 2 : e.w === 'sand' && (has('Rock') || has('Ground')) ? 2 : e.w === 'hail' && has('Ice') ? 2 : 0;
  }
  if (s.cat === 'trait') { const main = [...active].sort((a, b) => b.tier - a.tier || b.n - a.n).find(a => (s.types ?? []).includes(a.t)); if (!main) return {v: -1}; const next = traitRules[main.t].thresholds.find(x => x > main.n); v += 2 + (carryHas(main.t) ? 1.5 : 0) + (s.id === 'trait-crown' && next === main.n + 1 ? 4 : 0) + (s.id === 'trait-heart' ? main.n * 0.5 : 0); }
  if (s.cat === 'item') v += k === 0 ? 2.5 : 1;
  return {v};
}
const econCache = new Map();
async function sealPlan(r, salt) {
  const plan = planFor(r), base = hitRate(plan, [], salt), picks = [], alternatives = [], measured = [];
  let chosen = [];
  for (let k = 0; k < 3; k++) {
    const offer = SEALS.seals.filter(s => s.rarity === k + 1 && (!s.picks || s.picks.includes(k)) && !chosen.some(c => c.excl && c.excl === s.excl));
    const scored = [];
    const ref = econCache.has(`${r.carry}|${k}|ref`) ? econCache.get(`${r.carry}|${k}|ref`) : hitRate(plan, chosen.map((c, i) => ({at: ROUNDS[i], effects: c.effects, k: i})), salt + '|' + k);
    econCache.set(`${r.carry}|${k}|ref`, ref);
    for (const s of offer) {
      if (isEcon(s)) {
        const key = `${r.carry}|${k}|${s.id}`;
        if (econCache.has(key)) { scored.push({s, kind: 'economy', v: econCache.get(key)}); continue; }
        const p = hitRate(plan, [...chosen.map((c, i) => ({at: ROUNDS[i], effects: c.effects, k: i})), {at: ROUNDS[k], effects: s.effects, k}], salt + '|' + k);
        measured.push({round: k, id: s.id, base: ref, with: p});
        const v = (p - ref) * (r.category === 'fast-8' ? 40 : 70); econCache.set(key, v);
        scored.push({s, kind: 'economy', v});
      } else { const f = fit(s, r, k); if (f.v >= 0) scored.push({s, kind: 'core', v: f.v}); }
    }
    scored.sort((a, b) => b.v - a.v);
    const top = scored[0];
    picks.push({id: top.s.id, kind: top.kind, round: SEALS.rounds[k]});
    alternatives.push(scored.slice(1, 4).map(x => ({id: x.s.id, kind: x.kind})));
    chosen.push(top.s);
  }
  return {plan: {picks, alternatives}, measured, base};
}

async function main() {
  startPool();
  const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
  const file = new URL('progression.json', W);
  const out = only && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {generated: new Date().toISOString(), rows: {}};
  for (const r of C.rows) {
    if (only && !only.has(r.carry)) continue;
    const stages = [];
    for (let L = 5; L < r.level; L++) stages.push(await earlyBoard(r, L));
    stages.push({level: r.level, team: r.team, score: r.score, lobby: 'stage 4', final: true});
    let last = r.team;
    if (r.level < 8) { const s8 = await addUnit(r, r.team, 8, {salt: `l8|${r.id}`}); stages.push(s8); last = s8.team; }
    const cap = await addUnit(r, last, 9, {upgradeFours: true, salt: `cap|${r.id}`});
    const seals = await sealPlan(r, `seal|${r.carry}`);
    out.rows[r.id] = {stages, cap: {...cap, optional: true}, seals: seals.plan, sealMeasured: seals.measured, sealBase: seals.base};
    log(r.id, stages.map(s => `L${s.level}:${(s.score * 100).toFixed(0)}`).join(' '), 'cap', (cap.score * 100).toFixed(0), 'seals', seals.plan.picks.map(p => p.id).join(','));
    fs.writeFileSync(file, JSON.stringify(out, null, 1));
  }
  process.exit(0);
}
main();
