#!/usr/bin/env node
// Staged, reproducible trait-board search using the frozen Version 33 battle engine.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, 'work', 'composition-run');
const input = JSON.parse(fs.readFileSync(path.join(cache, 'input.json')));
const roster = new Map(input.roster.map(x => [x.id, x]));
const simUrl = pathToFileURL(path.join(cache, 'game-assets', 'sim-Bm2krZIn.js')).href;
const targets = [{ trait: 'Normal', count: 6 }, { trait: 'Water', count: 6 }, { trait: 'Ice', count: 4 }];
const screenSeeds = [211, 223];
const holdoutSeeds = [307, 331, 353, 379, 401, 433, 457, 479];
const confirmationSeeds = Array.from({ length: 32 }, (_, i) => 1009 + i * 37);
const maxGold = Number(process.env.SEARCH_MAX_GOLD || 135);
const rounds = Number(process.env.SEARCH_ROUNDS || 4);
const perRound = Number(process.env.SEARCH_PER_ROUND || 100);
const workers = Math.min(Number(process.env.COMPOSITION_WORKERS || 8), os.availableParallelism(), 8);
const starsCost = [0, 1, 3, 9];
const discoveredId = 'ice-dugtrio-search';

function random(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let x = state;
    x = Math.imul(x ^ x >>> 15, x | 1);
    x ^= x + Math.imul(x ^ x >>> 7, x | 61);
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}
const rng = random(20261021);
const pick = xs => xs[Math.floor(rng() * xs.length)];
const clone = team => team.map(u => ({ ...u, items: [...u.items] }));
const gold = team => team.reduce((sum, u) => sum + roster.get(u.line).cost * starsCost[u.star], 0);
const countTrait = (team, trait) => team.filter(u => roster.get(u.line).traits.includes(trait)).length;
const key = team => JSON.stringify([...team].sort((a, b) => a.cell - b.cell).map(u => [u.cell, u.line, u.star, [...u.items].sort()]));
const levelNine = candidate => candidate.boards.find(b => b.level === 9).team;
const poolByTrait = Object.fromEntries(targets.map(t => [t.trait, input.roster.filter(x => x.traits.includes(t.trait)).map(x => x.id)]));
const oldWinners = input.candidates.filter(c => c.origin === 'legacy' && c.previousStages.find(s => s.level === 9)?.tier === 'S');
const supportPool = [...new Set(oldWinners.flatMap(c => levelNine(c).map(u => u.line)))];

function valid(team, target) {
  return team.length === 9 && new Set(team.map(u => u.line)).size === 9
    && new Set(team.map(u => u.cell)).size === 9
    && team.every(u => u.star >= 1 && u.star <= 3 && u.items.length <= 3 && u.cell >= 28 && u.cell <= 55)
    && team.reduce((n, u) => n + u.items.length, 0) <= 6
    && countTrait(team, target.trait) >= target.count && gold(team) <= maxGold;
}

function graft(donor, target, base) {
  const team = clone(donor);
  const preferred = [...base].filter(u => roster.get(u.line).traits.includes(target.trait));
  const candidates = [...preferred.map(u => u.line), ...poolByTrait[target.trait]].filter((x, i, a) => a.indexOf(x) === i);
  while (countTrait(team, target.trait) < target.count) {
    const used = new Set(team.map(u => u.line));
    const next = candidates.find(line => !used.has(line));
    const replace = team.map((u, i) => ({ u, i }))
      .filter(x => !roster.get(x.u.line).traits.includes(target.trait))
      .sort((a, b) => a.u.items.length - b.u.items.length || roster.get(a.u.line).cost - roster.get(b.u.line).cost)[0];
    if (!next || !replace) return null;
    const old = replace.u;
    const prior = preferred.find(u => u.line === next);
    team[replace.i] = { line: next, star: prior?.star ?? 2, items: [], cell: old.cell };
  }
  return valid(team, target) ? team : null;
}

const specialSets = [
  ['quick-claw', 'quick-claw', 'quick-claw'],
  ['choice-specs', 'quick-claw', 'focus-sash'],
  ['choice-specs', 'choice-specs', 'focus-sash'],
  ['choice-specs', 'quick-claw', 'shell-bell'],
];
const physicalSets = [
  ['scope-lens', 'scope-lens', 'scope-lens'],
  ['choice-band', 'scope-lens', 'focus-sash'],
  ['scope-lens', 'scope-lens', 'mental-herb'],
];
const tankSets = [
  ['sitrus-berry', 'leftovers', 'leftovers'],
  ['leftovers', 'leftovers', 'leftovers'],
  ['leftovers', 'leftovers', 'protector'],
];

function regear(team) {
  const carrying = team.map((u, i) => ({ i, n: u.items.length })).sort((a, b) => b.n - a.n)[0]?.i ?? 0;
  const offensive = team.map((u, i) => ({ u, i })).filter(x => !['tank', 'support'].includes(roster.get(x.u.line).role));
  const carry = rng() < .65 && team[carrying].items.length ? carrying : pick(offensive).i;
  const tanks = team.map((u, i) => ({ u, i })).filter(x => x.i !== carry && ['tank', 'fighter'].includes(roster.get(x.u.line).role));
  const tank = tanks.length ? pick(tanks).i : (carry + 1) % team.length;
  const role = roster.get(team[carry].line).role;
  const sets = ['mage', 'special', 'support'].includes(role) ? specialSets : physicalSets;
  for (const u of team) u.items = [];
  team[carry].items = [...pick(sets)];
  team[tank].items = [...pick(tankSets)];
}

function mutate(source, target) {
  const team = clone(source);
  const op = Math.floor(rng() * 5);
  if (op === 0 || op === 1) {
    const index = Math.floor(rng() * team.length);
    const current = team[index];
    const needTrait = countTrait(team, target.trait) <= target.count && roster.get(current.line).traits.includes(target.trait);
    const pool = needTrait || rng() < .65 ? poolByTrait[target.trait] : supportPool;
    const choices = pool.filter(id => !team.some(u => u.line === id));
    if (!choices.length) return null;
    const line = pick(choices);
    team[index] = { line, star: 2, items: [...current.items], cell: current.cell };
    if (rng() < .7) regear(team);
  } else if (op === 2) {
    const index = Math.floor(rng() * team.length);
    const u = team[index], cost = roster.get(u.line).cost;
    u.star = u.star === 3 ? 2 : cost <= 3 && rng() < .65 ? 3 : 2;
  } else if (op === 3) {
    regear(team);
  } else {
    const a = Math.floor(rng() * team.length), b = Math.floor(rng() * team.length);
    [team[a].cell, team[b].cell] = [team[b].cell, team[a].cell];
  }
  return valid(team, target) ? team : null;
}

function candidatesFor(target) {
  const baseline = input.candidates.filter(c => c.origin === 'trait' && c.id !== discoveredId && countTrait(levelNine(c), target.trait) >= target.count);
  const boards = baseline.map(c => ({ family: target.trait, source: c.id, team: clone(levelNine(c)) }));
  for (const winner of oldWinners) {
    for (const base of baseline) {
      const team = graft(levelNine(winner), target, levelNine(base));
      if (team) boards.push({ family: target.trait, source: `graft:${winner.id}:${base.id}`, team });
    }
  }
  const seen = new Set(boards.map(x => key(x.team)));
  let attempts = 0;
  while (boards.length < 100 && attempts++ < 3000) {
    const source = pick(boards);
    let team = mutate(source.team, target);
    if (team && rng() < .5) team = mutate(team, target) ?? team;
    if (team && !seen.has(key(team))) {
      seen.add(key(team));
      boards.push({ family: target.trait, source: `seed:${source.source}`, team });
    }
  }
  return boards;
}

function screenRefs() {
  const refs = input.references.filter(r => r.level === 9);
  const sample = [];
  for (const group of ['api', 'workbook']) {
    const xs = refs.filter(r => r.group === group);
    for (const fraction of [0, .25, .5, .75, .95]) sample.push(xs[Math.floor(fraction * (xs.length - 1))]);
  }
  return sample;
}

async function evaluate(boards, refs, seeds) {
  if (!boards.length) return [];
  const batches = Array.from({ length: Math.min(workers, boards.length) }, () => []);
  boards.forEach((board, i) => batches[i % batches.length].push({ index: i, family: board.family, team: board.team }));
  const results = await Promise.all(batches.map(batch => new Promise((resolve, reject) => {
    const worker = new Worker(fileURLToPath(import.meta.url), { workerData: { batch, refs, seeds, simUrl } });
    let received = null;
    worker.on('message', msg => { received = msg; });
    worker.on('error', reject);
    worker.on('exit', code => code === 0 && received ? resolve(received) : reject(new Error(`Battle worker exited ${code}`)));
  })));
  const scored = Array(boards.length);
  for (const result of results.flat()) scored[result.index] = result;
  if (scored.some(x => !x)) throw new Error('Incomplete battle batch');
  return scored;
}

function bestUnique(boards, limit) {
  const sorted = [...boards].sort((a, b) => b.screen.score - a.screen.score || gold(a.team) - gold(b.team));
  const chosen = [], lineSets = new Map();
  for (const board of sorted) {
    const lines = board.team.map(u => u.line).sort().join(',');
    if ((lineSets.get(lines) ?? 0) >= 3) continue;
    chosen.push(board);
    lineSets.set(lines, (lineSets.get(lines) ?? 0) + 1);
    if (chosen.length === limit) break;
  }
  return chosen;
}

async function search() {
  if (input.gameVersion !== 33 || !fs.existsSync(fileURLToPath(simUrl))) throw new Error('Frozen Version 33 module or input is missing');
  const refs = screenRefs();
  const archive = new Map(), beams = new Map();
  let batch = targets.flatMap(candidatesFor);
  console.log(`Screening ${batch.length} initial boards against ${refs.length} API/workbook references using ${workers} CPU workers`);
  for (let round = 0; round <= rounds; round++) {
    const scores = await evaluate(batch, refs, screenSeeds);
    for (let i = 0; i < batch.length; i++) {
      const board = { ...batch[i], screen: scores[i] };
      archive.set(board.family + ':' + key(board.team), board);
    }
    for (const target of targets) {
      const family = [...archive.values()].filter(x => x.family === target.trait);
      const beam = bestUnique(family, 16);
      beams.set(target.trait, beam);
      console.log(`Round ${round}: ${target.trait} ${family.length} distinct; best screen ${(100 * beam[0].screen.score).toFixed(1)}%`);
    }
    if (round === rounds) break;
    batch = [];
    const seen = new Set(archive.keys());
    for (const target of targets) {
      let tries = 0, made = 0;
      while (made < perRound && tries++ < perRound * 50) {
        const parent = pick(beams.get(target.trait));
        let team = mutate(parent.team, target);
        if (team && rng() < .4) team = mutate(team, target) ?? team;
        if (!team || seen.has(target.trait + ':' + key(team))) continue;
        seen.add(target.trait + ':' + key(team));
        batch.push({ family: target.trait, source: `round${round + 1}:${parent.source}`, team });
        made++;
      }
    }
    if (!batch.length) break;
  }
  const finalists = targets.flatMap(t => bestUnique([...archive.values()].filter(x => x.family === t.trait), 10));
  const baselines = input.candidates.filter(c => c.origin === 'trait' && c.id !== discoveredId && targets.some(t => countTrait(levelNine(c), t.trait) >= t.count))
    .map(c => ({ family: targets.find(t => countTrait(levelNine(c), t.trait) >= t.count).trait, source: `original:${c.id}`, team: clone(levelNine(c)) }));
  const anchors = oldWinners.map(c => ({ family: 'Previous S', source: c.id, team: clone(levelNine(c)) }));
  const audit = [...finalists, ...baselines, ...anchors];
  const fullRefs = input.references.filter(r => r.level === 9);
  console.log(`Holdout: ${audit.length} boards against ${fullRefs.length} references with ${holdoutSeeds.length} fresh seeds`);
  const scores = await evaluate(audit, fullRefs, holdoutSeeds);
  const audited = audit.map((board, i) => ({ ...board, holdout: scores[i], gold: gold(board.team) }));
  const top = targets.flatMap(t => bestUnique(audited.filter(x => x.family === t.trait).map(x => ({ ...x, screen: x.holdout })), 3));
  const peerRefs = input.candidates.filter(c => c.id !== discoveredId)
    .map(c => ({ id: c.id, group: c.family, team: levelNine(c) }));
  console.log(`Cross-family check: ${top.length} finalists against ${peerRefs.length} existing candidates`);
  const peerScores = await evaluate(top, peerRefs, holdoutSeeds);
  const peerByKey = new Map(top.map((x, i) => [key(x.team), peerScores[i]]));
  const report = {
    gameVersion: 33, generated: new Date().toISOString(), maxGold, rounds, perRound, workers,
    screenSeeds, holdoutSeeds, screenReferences: refs.map(x => x.id + ':' + x.group),
    holdoutReferences: fullRefs.length, distinctBoards: archive.size,
    findings: audited.map(x => ({ family: x.family, source: x.source, screen: x.screen?.score ?? null,
      holdout: x.holdout, peer: peerByKey.get(key(x.team)) ?? null, gold: x.gold, team: x.team })),
  };
  fs.writeFileSync(path.join(cache, 'search-results.json'), JSON.stringify(report));
  for (const target of targets) {
    console.log(`\n${target.trait} ${target.count}:`);
    for (const x of audited.filter(x => x.family === target.trait).sort((a, b) => b.holdout.score - a.holdout.score).slice(0, 5)) {
      console.log(`${(100 * x.holdout.score).toFixed(1)}% combined, API ${(100 * x.holdout.api).toFixed(1)}%, workbook ${(100 * x.holdout.workbook).toFixed(1)}%, ${x.gold} gold: ${x.source}`);
    }
  }
  console.log(`Wrote ${path.join(cache, 'search-results.json')}`);
}

async function confirm() {
  const reportPath = path.join(cache, 'search-results.json');
  const report = JSON.parse(fs.readFileSync(reportPath));
  const chosen = targets.flatMap(target => report.findings.filter(x => x.family === target.trait)
    .sort((a, b) => b.holdout.score - a.holdout.score).slice(0, 3));
  chosen.push(...report.findings.filter(x => x.family === 'Previous S'));
  const refs = input.references.filter(r => r.level === 9);
  console.log(`Confirming ${chosen.length} finalists on ${confirmationSeeds.length} new seeds and ${refs.length} references`);
  const results = await evaluate(chosen, refs, confirmationSeeds);
  report.confirmationSeeds = confirmationSeeds;
  report.confirmations = chosen.map((x, i) => ({ family: x.family, source: x.source, team: x.team,
    gold: x.gold, score: results[i] }));
  fs.writeFileSync(reportPath, JSON.stringify(report));
  for (const target of targets) {
    console.log(`\n${target.trait} ${target.count} confirmation:`);
    for (const x of report.confirmations.filter(x => x.family === target.trait).sort((a, b) => b.score.score - a.score.score)) {
      console.log(`${(100 * x.score.score).toFixed(1)}% combined, API ${(100 * x.score.api).toFixed(1)}%, workbook ${(100 * x.score.workbook).toFixed(1)}%, ${x.gold} gold: ${x.source}`);
    }
  }
}

if (isMainThread) {
  if (process.argv.includes('--confirm')) await confirm();
  else await search();
} else {
  const sim = await import(workerData.simUrl);
  await sim.E();
  const Battle = sim.l;
  function match(a, b) {
    let score = 0;
    for (const seed of workerData.seeds) {
      for (let side = 0; side < 2; side++) {
        const left = side ? b : a;
        const right = (side ? a : b).map(u => ({ ...u, cell: 55 - u.cell }));
        const battle = new Battle(left, right, seed, null);
        battle.pvpClock = true;
        battle.start();
        for (let step = 0; !battle.over && step < 1700; step++) battle.step();
        if (!battle.over) throw new Error('Battle exceeded PvP clock');
        score += battle.winner < 0 ? .5 : battle.winner === side ? 1 : 0;
      }
    }
    return score / (workerData.seeds.length * 2);
  }
  const out = workerData.batch.map(({ index, family, team }) => {
    const byGroup = new Map();
    for (const ref of workerData.refs) {
      if (ref.group.toLowerCase() === family.toLowerCase()) continue;
      const score = match(team, ref.team);
      if (!byGroup.has(ref.group)) byGroup.set(ref.group, []);
      byGroup.get(ref.group).push(score);
    }
    const groupScores = Object.fromEntries([...byGroup].map(([group, scores]) => [group, scores.reduce((a, b) => a + b, 0) / scores.length]));
    const api = groupScores.api ?? null, workbook = groupScores.workbook ?? null;
    const values = Object.values(groupScores);
    return { index, score: api !== null && workbook !== null ? (api + workbook) / 2 : values.reduce((a, b) => a + b, 0) / values.length,
      api, workbook, groups: groupScores };
  });
  parentPort.postMessage(out);
}
