// Level 5-8 transition boards, an optional max-cap board, and Seal suggestions for every
// published 5-2 composition. Early boards are scored against the stage-3 ranked lobby,
// level 8 and the cap against the stage-4 lobby. Seal economy effects are measured with the
// full-game shop simulation (kept private); combat Seals are ranked by board fit.
import fs from 'node:fs';
import path from 'node:path';
import {roster, family, arrange, activeTraits, traitCounts, scoreMany, seeds, startPool, traitRules} from './combat.mjs';
import {S3, S4, placeHint, isFront, isTank, cost, SHOP, heuristic, cooccur} from './search.mjs';
import {simulate, roundIndex as R} from './acquire.mjs';
import {hashSeed} from './rules.mjs';
import {availableForm} from './forms.mjs';
import {acquisitionPool} from './acquire-pool.mjs';

import {OUT as W} from './paths.mjs';
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const html = fs.readFileSync(path.join(process.env.SITE_DIR??'.','compositions.html'), 'utf8');
const C = JSON.parse(html.match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const sealSrc = fs.readFileSync(fs.existsSync(path.join(process.env.SITE_DIR??'.','seals-data.js'))?path.join(process.env.SITE_DIR??'.','seals-data.js'):'seals-data.js', 'utf8');
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
  const carryLine=r.transitionCarry??carry.line;
  put(carryLine, carry.items);
  if (!put(tank.line, tank.items)) { const f = out.filter(u => u.line !== carryLine && isFront(u.line)).sort((a, b) => isTank(b.line) - isTank(a.line) || cost(b.line) * b.star - cost(a.line) * a.star)[0]; if (f) f.items = [...tank.items]; }
  if (second && !put(second.line, second.items)) { const s = out.find(u => !u.items.length && u.line !== carry.line && !isTank(u.line)); if (s) s.items = [...second.items]; }
  return out.map(u => ({...u, assignment: u.line === carryLine ? 'Carry' : u.items.length === 3 ? 'Tank' : u.items.length === 1 ? 'Secondary' : r.targets.includes(u.line) ? 'Upgrade' : 'Support'}));
}
const hints = team => ({...placeHint, ...Object.fromEntries(team.map(u => [u.line, u.cell]))});
function subsets(arr, k) { const out = []; const rec = (i, cur) => { if (cur.length === k) { out.push([...cur]); return; } for (let j = i; j < arr.length; j++) { cur.push(arr[j]); rec(j + 1, cur); cur.pop(); } }; rec(0, []); return out; }

async function earlyBoard(r, L) {
  const plannedCarry = r.team.find(u => u.assignment === 'Carry');
  let carry=plannedCarry;
  const rest = r.team.filter(u => u !== plannedCarry && !(cost(u.line) === 5 && L < 8) && !(cost(u.line) === 4 && L <= 5));
  const co = cooccur(r.carry);
  if(L<=5&&cost(carry.line)>=4){
    const holders=SHOP.filter(l=>cost(l)<=3&&!rest.some(u=>family(u.line)===family(l))).sort((a,b)=>
      roster[b].traits.filter(t=>roster[plannedCarry.line].traits.includes(t)).length-roster[a].traits.filter(t=>roster[plannedCarry.line].traits.includes(t)).length||
      Number(roster[b].range>=3=== (roster[plannedCarry.line].range>=3))-Number(roster[a].range>=3=== (roster[plannedCarry.line].range>=3))||cost(b)-cost(a));
    carry={line:holders[0],star:2};
  }
  const pool=[...rest];
  while(pool.length<L-1){
    const used=new Set([family(carry.line),...pool.map(u=>family(u.line))]);
    const options=SHOP.filter(l=>cost(l)<=3&&!used.has(family(l))).sort((a,b)=>heuristic([carry,...pool,{line:b,star:2}],co,r.carry)-heuristic([carry,...pool,{line:a,star:2}],co,r.carry));
    pool.push({line:options[0],star:2});
  }
  if(!pool.some(u=>isFront(u.line))){const l=SHOP.filter(l=>cost(l)<=3&&isFront(l)&&family(l)!==family(carry.line)).sort((a,b)=>cost(b)-cost(a))[0];pool.push({line:l,star:2});}
  const actualCarry=availableForm(carry.line,starAt(carry,L,r));
  const opts = subsets(pool, L - 1).map(s => { const team = [carry, ...s].map(u => {const star=starAt(u,L,r);return {line:availableForm(u.line,star),star};}); const h = heuristic(team, co, r.carry) + (team.some(u => u.line === r.team.find(x => x.assignment === 'Tank').line) ? 1.5 : 0) + (team.filter(u => isFront(u.line)).length >= 2 ? 1 : -2); return {team, h}; }).filter(o=>o.team.some(u=>u.line!==actualCarry&&isFront(u.line))).sort((a, b) => b.h - a.h).slice(0, 4);
  const boards = opts.map(o => arrange(withItems(o.team, {...r,transitionCarry:actualCarry}), {carry: actualCarry, hint: hints(r.team)}));
  const sc = await vs(boards, S3, 2, `prog|${r.id}|${L}`);
  const i = sc.indexOf(Math.max(...sc));
  return {level:L,team:boards[i],score:null,illustrative:true,lobby:'unscored transition'};
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
function hitRate(plan,seals,salt){return acquisitionPool().run({plan,seals,salt,n:NS});}
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
async function sealPlan(r,salt){
 const plan=planFor(r),base=await hitRate(plan,[],salt),picks=[],alternatives=[],measured=[];
 let chosen=[];
 for(let k=0;k<3;k++){
  const offer=SEALS.seals.filter(s=>s.rarity===k+1&&(!s.picks||s.picks.includes(k))&&!chosen.some(c=>c.excl&&c.excl===s.excl));
  const prior=chosen.map((c,i)=>({at:ROUNDS[i],effects:c.effects,k:i}));
  const prefix=JSON.stringify([plan,prior,k,salt]);
  const cached=(key,seals)=>{const id=prefix+'|'+key;if(!econCache.has(id))econCache.set(id,hitRate(plan,seals,salt+'|'+k));return econCache.get(id);};
  const ref=await cached('ref',prior);
  const scored=(await Promise.all(offer.map(async s=>{
   if(isEcon(s)){
    const value=await cached(s.id,[...prior,{at:ROUNDS[k],effects:s.effects,k}]);
    measured.push({round:k,id:s.id,base:ref,with:value});
    return {s,kind:'economy',v:(value-ref)*(r.category==='fast-8'?40:70)};
   }
   const f=fit(s,r,k);return f.v>=0?{s,kind:'core',v:f.v}:null;
  }))).filter(Boolean).sort((a,b)=>b.v-a.v);
  const top=scored[0];picks.push({id:top.s.id,kind:top.kind,round:SEALS.rounds[k]});
  alternatives.push(scored.slice(1,4).map(x=>({id:x.s.id,kind:x.kind})));chosen.push(top.s);
 }
 return {plan:{picks,alternatives},measured,base};
}

async function main() {
  startPool();
  const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
  const file = new URL('progression.json', W);
  const out = (only || process.env.RESUME) && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {generated: new Date().toISOString(), rows: {}};
  for (const r of C.rows) {
    if (only && !only.has(r.carry)) continue;
    if(process.env.RESUME&&out.rows[r.id]?.sealVersion===2)continue;
    const previous=out.rows[r.id];
    let stages=previous?.stages,cap=previous?.cap;
    if(!stages||!cap){
      stages=[];
      for(let L=5;L<r.level;L++)stages.push(await earlyBoard(r,L));
      stages.push({level:r.level,team:r.team,score:r.score,lobby:'stage 4',final:true});
      let last=r.team;
      if(r.level<8){const s8=await addUnit(r,r.team,8,{salt:'l8|'+r.id});stages.push(s8);last=s8.team;}
      cap=await addUnit(r,last,9,{upgradeFours:true,salt:'cap|'+r.id});
    }
    const seals = await sealPlan(r, `seal|${r.carry}`);
    out.rows[r.id] = {sealVersion:2,stages, cap: {...cap, optional: true}, seals: seals.plan, sealMeasured: seals.measured, sealBase: seals.base};
    log(r.id, stages.map(s => `L${s.level}:${(Number.isFinite(s.score)?(s.score*100).toFixed(0):'unscored')}`).join(' '), 'cap', (cap.score * 100).toFixed(0), 'seals', seals.plan.picks.map(p => p.id).join(','));
    fs.writeFileSync(file, JSON.stringify(out, null, 1));
  }
  process.exit(0);
}
main();
