// Per-composition follow-up: acquisition by 5-2, low-roll item holders, frontline fallbacks,
// the alternative carry build, and the ranked-meta reference boards on the same gauntlet.
import fs from 'node:fs';
import {roster, family, arrange, traitLabel, boardValue, startPool} from './combat.mjs';
import {score, gear, placeHint, isFront, isTank, spa, cost, SHOP, S4, S3, G, STRATEGIES} from './search.mjs';
import {simulate, roundIndex as R} from './acquire.mjs';
import {hashSeed, label} from './rules.mjs';
import {realizedScore} from './realized.mjs';
import {availableForm} from './forms.mjs';

import {OUT as OUT} from './paths.mjs';
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const search = JSON.parse(fs.readFileSync(new URL(process.env.SEARCH_FILE ?? 'search.json', OUT)));
const budget = JSON.parse(fs.readFileSync(new URL('budget.json', OUT)));
const NE = Number(process.env.NE ?? 400);

import {planFor} from './plans.mjs';
function acquisition(strat, team, carry, extras, curveKey) {
  const plan = planFor(strat, team, carry, extras, curveKey);
  const run = (n, profile, contest, salt) => {
    let core = 0, tank = 0, full = 0, rolls = [], done = [], lv = 0, gold = 0, roll = 0, unit = 0, xp = 0;
    const contestComp = contest ? {id: 'same', n: 1, units: plan.needs.filter(x => x.priority === 0).map(x => ({line: x.line, star: 3, cost: cost(x.line)}))} : null;
    for (let i = 0; i < n; i++) {
      const x = simulate(plan, {seed: hashSeed(`${salt}|${i}`), profile, contest: contestComp});
      core += x.hit; tank += x.tank; full += x.others; lv += x.level; gold += x.gold; roll += x.spentRolls; unit += x.spentUnits; xp += x.spentXp;
      if (x.hit) { rolls.push(x.spentRolls); done.push(x.doneAt); }
    }
    rolls.sort((a, b) => a - b); done.sort((a, b) => a - b);
    return {n, core: core / n, tank: tank / n, full: full / n, level: lv / n, goldLeft: gold / n, rollGold: roll / n, unitGold: unit / n, xpGold: xp / n,
      rollGoldMedianOnHit: rolls[rolls.length >> 1] ?? null, rollsMedianOnHit: rolls.length ? rolls[rolls.length >> 1] / 2 : null, medianDone: done.length ? label(done[done.length >> 1]) : null};
  };
  return {policy: plan.policy, curve: curveKey, rollLevel: plan.rollLevel, open: run(NE, 'mixed', false, `acq|${carry}|open`), win: run(NE >> 1, 'win', false, `acq|${carry}|win`), lose: run(NE >> 1, 'lose', false, `acq|${carry}|lose`), contested: run(NE >> 1, 'mixed', true, `acq|${carry}|contest`)};
}

async function main() {
  startPool();
  const file=new URL(process.env.ANALYSIS_FILE??'analysis.json',OUT);
  const out=process.env.RESUME&&fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{generated:new Date().toISOString(),comps:[],reference:[]};
  // Ranked meta reference boards on the same gauntlet.
  const refBoards = G.map(x => x.s4.team);
  const refScores = await score(refBoards, {nSeeds: 4, salt: 'reference', s3: true});
  out.reference=[];
  G.forEach((x, i) => out.reference.push({id: x.comp.id, tier: x.comp.tier, n: x.comp.n, avg: x.comp.avg, top4: x.comp.top4, level: x.s4.level, team: x.s4.team, traits: traitLabel(x.s4.team), score: refScores[i].score, s4: refScores[i].s4, s3: refScores[i].s3}));
  log('reference boards scored');
  for (const r of search.results) {
    if(out.comps.some(c=>c.line===r.line&&c.strat===r.strat))continue;
    const S = STRATEGIES[r.strat];
    const variants = [], chosenItems = new Map();
    // Each board with extra 3★ targets also gets a steadier version with those units at 2★.
    const expanded = [...r.variants];
    for (const v of r.variants) if ((v.extras ?? []).length) {
      const keeps = v.extras.length >= 3 ? [0, Math.floor(v.extras.length / 2)] : [0];
      for (const k of keeps) {
        const kept = v.extras.slice(0, k), team = v.team.map(u => v.extras.includes(u.line) && !kept.includes(u.line) ? {...u, star: 2} : u);
        expanded.push({...v, team, extras: kept, src: v.src + (k ? '+partial' : '+steady'), steady: true, final: null});
      }
    }
    for (const v0 of expanded) {
      const v = {...v0, items: structuredClone(v0.items)};
      const carry = r.line, extras = v.extras ?? [];
      // Focus Sash does not stack: never publish more than one on a holder.
      const okSet = s => s.filter(i => i === 'focus-sash').length <= 1;
      if (!okSet(v.items.carry)) {
        const swap = v.items.rankedCarry.find(x => okSet(x.items));
        v.items.carry = swap.items;
        v.team = v.team.map(u => u.line === carry ? {...u, items: [...swap.items]} : u);
        v.final = (await score([v.team], {nSeeds: 8, salt: 'final|' + carry, s3: true}))[0];
      }
      if (v.items.alt && !okSet(v.items.alt)) v.items.alt = v.items.rankedCarry.find(x => okSet(x.items) && x.items.join() !== v.items.carry.join())?.items ?? null;
      v.items.rankedCarry = v.items.rankedCarry.filter(x => okSet(x.items));
      // Carry items: the top screened sets and the alternative are re-tested with 16 seeds on this exact board.
      const inherited = v0.steady ? chosenItems.get(v0.src.replace(/\+(steady|partial)$/, '')) : null;
      const sets = inherited ? [inherited] : [...new Map([v.items.carry, ...v.items.rankedCarry.slice(0, 3).map(x => x.items), ...(v.items.alt ? [v.items.alt] : [])].filter(okSet).map(s => [[...s].sort().join(), s])).values()];
      const setBoards = sets.map(s => v.team.map(u => u.line === carry ? {...u, items: [...s]} : u));
      const setScores = await score(setBoards, {nSeeds: 12, salt: 'items16|' + carry, s3: true});
      const order = sets.map((s, i) => ({items: s, res: setScores[i]})).sort((a, b) => b.res.score - a.res.score);
      v.items.carry = order[0].items; v.team = setBoards[sets.indexOf(order[0].items)]; v.final = order[0].res; v.finalSeeds = 12; v.finalSalt = 'items16|' + carry; if (!v0.steady) chosenItems.set(v0.src, order[0].items);
      if (!inherited) { v.items.alt = order[1]?.items ?? null; v.items.rankedCarry = order.map(o => ({items: o.items, score: o.res.score})); }
      const confirmSalt=`confirm-v37|${family(carry)}|${r.strat}`;
      v.final=(await score([v.team],{nSeeds:16,salt:confirmSalt,s3:true}))[0];v.finalSeeds=16;v.finalSalt=confirmSalt;
      const team = v.team;
      const tank = v.items.tank, second = v.items.second;
      // Low roll: carry stays 2★ (items kept), or items move to another holder.
      const missStar = S.carryStar - 1;
      const lowCarry=availableForm(carry,missStar);
      const miss=team.map(u=>{const star=u.line===carry?missStar:extras.includes(u.line)?2:u.star;return {...u,line:availableForm(u.line,star),star};});
      const holders = [];
      for (const u of miss) if (u.line !== lowCarry && u.line !== tank) holders.push(u.line);
      const alts = [];
      // Pivot candidates: an extra unit replacing the missed carry slot keeps the trait web.
      const pivotLines = SHOP.filter(l => cost(l) <= (S.finalLevel >= 8 ? 5 : 4) && !(cost(l) === 5 && S.finalLevel < 8) && !team.some(u => family(u.line) === family(l)) && !isTank(l) && roster[l].traits.some(t => roster[carry].traits.includes(t))).sort((a, b) => cost(b) - cost(a)).slice(0, 6);
      const lowBoards = [{kind: 'keep', holder: lowCarry, team: miss}];
      for (const h of holders) {
        const t = miss.map(u => ({...u, items: u.line === h ? [...v.items.carry] : u.line === lowCarry ? [] : u.line === second && h !== second ? [...u.items] : u.line === tank ? [...u.items] : (u.line === h ? u.items : u.items)}));
        // Holder takes the three carry items; the previous secondary item moves to the old carry.
        const fixed = t.map(u => u.line === h ? {...u, items: [...v.items.carry]} : u.line === lowCarry ? {...u, items: h === second ? (v.items.secondItem ? [v.items.secondItem] : []) : []} : u);
        lowBoards.push({kind: 'holder', holder: h, team: fixed});
      }
      for (const p of pivotLines) {
        const star = cost(p) <= 3 ? 2 : 1;
        const t = miss.filter(u => u.line !== lowCarry).map(u => ({...u})).concat([{line: p, star, items: [...v.items.carry]}]);
        lowBoards.push({kind: 'pivot', holder: p, star, team: arrange(t, {carry: p, hint: placeHint})});
      }
      const lowScores = await score(lowBoards.map(b => b.team), {nSeeds: 2, salt: 'low|' + carry});
      const low = lowBoards.map((b, i) => ({kind: b.kind, holder: b.holder, star: b.star ?? b.team.find(u => u.line === b.holder)?.star, score: lowScores[i].score, team: b.team})).sort((a, b) => b.score - a.score);
      // Frontline: 4-cost tank at 2★, and fallbacks when the planned tank is missing.
      const tankUnit = team.find(u => u.line === tank);
      const frontOptions = SHOP.filter(l => isTank(l) && !team.some(u => family(u.line) === family(l) && u.line !== tank) && cost(l) <= (S.finalLevel >= 8 ? 5 : 4)).sort((a, b) => cost(b) - cost(a)).slice(0, 7);
      const tankBoards = [];
      for (const l of frontOptions) for (const star of cost(l) === 5 ? [1] : cost(l) === 4 ? [1, 2] : cost(l) === 1 && ['r1', 'r12', 'r12s'].includes(S.key) ? [2, 3] : [2]) {
        if (l === tank && star === tankUnit.star) continue;
        const t = team.map(u => u.line === tank ? {...u, line: l, star} : u);
        tankBoards.push({line: l, star, team: arrange(t, {carry, hint: placeHint})});
      }
      const tankScores = await score(tankBoards.map(b => b.team), {nSeeds: 2, salt: 'tank|' + carry});
      const tanks = tankBoards.map((b, i) => ({line: b.line, star: b.star, score: tankScores[i].score})).sort((a, b) => b.score - a.score);
      // Alternative carry build on the final board.
      const altTeam = v.items.alt ? team.map(u => u.line === carry ? {...u, items: [...v.items.alt]} : u) : null;
      const altScore = altTeam ? (order[1]?.res ?? (await score([altTeam], {nSeeds: 12, salt: 'items16|' + carry, s3: true}))[0]) : null;
      // Acquisition by 5-2.
      const acq = acquisition(r.strat, team, carry, extras);
      const acqEarly = r.strat === 'r3' ? acquisition(r.strat, team, carry, extras, 'r3early') : null;
      const bestLow = low[0];
      const pHit = Math.max(acq.open.core, acqEarly?.open.core ?? 0);
      // Expected 5-2: the boards players actually have at 5-2 (copies found, level reached), fought and weighted.
      const plan = planFor(r.strat, team, carry, extras, r.strat === 'r3' && (acqEarly?.open.core ?? 0) > acq.open.core ? 'r3early' : r.strat);
      const real = await realizedScore(team, plan, score, {n: 200, max: 8, nSeeds: 3, salt:`real-confirm-v37|${family(carry)}|${r.strat}`});
      const expected = real.expected;
      variants.push({team,extras,src:v.src,steady: !!v.steady, traits: traitLabel(team), value: v.value, final: v.final, items: v.items, alt: altTeam ? {items: v.items.alt, score: altScore.score, s4: altScore.s4} : null,
        low: low.slice(0, 6).map(({team, ...x}) => x), lowBest: {...bestLow}, keepScore: low.find(x => x.kind === 'keep').score, tanks: tanks.slice(0, 8), acq, acqEarly, expected, pHit, realized:real,realizedPlan:plan,finalSeeds: v.finalSeeds, finalSalt: v.finalSalt});
      log(carry, r.strat, 'score', v.final.score.toFixed(3), 'pHit', pHit.toFixed(2), 'low', bestLow.kind, bestLow.holder, bestLow.score.toFixed(3), 'exp', expected.toFixed(3), 'real-cover', real.covered.toFixed(2), 'full', acq.open.full.toFixed(2));
    }
    out.comps.push({line: r.line, strat: r.strat, variants});
    fs.writeFileSync(new URL(process.env.ANALYSIS_FILE ?? 'analysis.json', OUT), JSON.stringify(out, null, 1));
  }
  process.exit(0);
}
main();
