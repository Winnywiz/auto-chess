#!/usr/bin/env node
// Rescore legacy and breakpoint boards against the same frozen Version 33 client.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(root, 'work', 'composition-run');
const assets = path.join(cache, 'game-assets');
const assetBase = 'https://einoow.com/playables/kanto-tactics/assets/';
const simName = 'sim-Bm2krZIn.js'; // Frozen Version 33 battle implementation.
const seeds = [11, 23, 37, 53, 71, 97, 131, 173];

function ensureGameAssets() {
  fs.mkdirSync(assets, { recursive: true });
  fs.writeFileSync(path.join(assets, 'package.json'), '{"type":"module"}\n');
  const pending = [simName], seen = new Set();
  while (pending.length) {
    const name = pending.pop();
    if (seen.has(name)) continue;
    seen.add(name);
    const target = path.join(assets, name);
    if (!fs.existsSync(target)) {
      execFileSync('curl', ['-L', '--fail', '--silent', '--show-error', '--max-time', '45', assetBase + name, '-o', target]);
    }
    const source = fs.readFileSync(target, 'utf8');
    for (const match of source.matchAll(/(?:from\s*|import\s*\(|import\s*)["']\.\/([^"']+)["']/g)) {
      if (match[1].endsWith('.js')) pending.push(match[1]);
    }
  }
  return pathToFileURL(path.join(assets, simName)).href;
}

function tasksFor(input) {
  const tasks = [];
  for (const level of [8, 9]) {
    for (let i = 0; i < input.candidates.length; i++) {
      const candidate = input.candidates[i];
      const board = candidate.boards.find(x => x.level === level);
      for (const reference of input.references.filter(x => x.level === level)) {
        tasks.push({ kind: 'reference', level, a: i, b: reference.id, group: reference.group, teamA: board.team, teamB: reference.team });
      }
      for (let j = i + 1; j < input.candidates.length; j++) {
        const other = input.candidates[j];
        if (candidate.family === other.family) continue;
        tasks.push({ kind: 'peer', level, a: i, b: j, teamA: board.team, teamB: other.boards.find(x => x.level === level).team });
      }
    }
  }
  return tasks;
}

function average(values) { return values.reduce((a, b) => a + b, 0) / values.length; }
function tier(score, peer, api, workbook) {
  if (score >= .65 && peer >= .55 && api >= .5 && workbook >= .5) return 'S';
  return score >= .5 ? 'A' : 'B';
}

function writeResults(input, results) {
  const rows = input.candidates.map(candidate => ({
    id: candidate.id, name: candidate.name, family: candidate.family, origin: candidate.origin,
    source: candidate.source, carry: candidate.carry, category: candidate.category,
    strategy: candidate.strategy, rollLevel: candidate.rollLevel, locked: candidate.locked ?? [],
    boards: candidate.boards, stages: [],
  }));
  for (const level of [8, 9]) {
    for (let i = 0; i < rows.length; i++) {
      const own = results.filter(r => r.level === level && r.a === i && r.kind === 'reference');
      const apiScores = own.filter(r => r.group === 'api').map(r => r.score);
      const workbookScores = own.filter(r => r.group === 'workbook').map(r => r.score);
      const api = average(apiScores), workbook = average(workbookScores);
      const byFamily = new Map();
      let peerN = 0;
      for (const match of results) {
        if (match.level !== level || match.kind !== 'peer') continue;
        const isA = match.a === i, isB = match.b === i;
        if (!isA && !isB) continue;
        const opponent = rows[isA ? match.b : match.a];
        if (!byFamily.has(opponent.family)) byFamily.set(opponent.family, []);
        byFamily.get(opponent.family).push(isA ? match.score : 1 - match.score);
        peerN += seeds.length * 2;
      }
      const peerScore = average([...byFamily.values()].map(average));
      const historical = (api + workbook) / 2;
      const score = (historical + peerScore) / 2;
      const previous = input.candidates[i].previousStages.find(s => s.level === level);
      rows[i].stages.push({
        level, tier: tier(score, peerScore, api, workbook), score, peerScore,
        apiScore: api, workbookScore: workbook,
        n: own.length * seeds.length * 2, peerN,
        groups: [{ group: 'api', score: api }, { group: 'workbook', score: workbook }, { group: 'diverse', score: peerScore }],
        purchaseGold: previous.purchaseGold ?? input.candidates[i].previousPurchaseGold ?? 0,
        gearImpact: null, bisDependent: false,
      });
    }
  }
  const output = {
    version: 'legacy-plus-breakpoints-v1', generated: new Date().toISOString(),
    gameRules: input.gameVersion, gameModule: simName, apiGenerated: input.apiGenerated,
    workbookReferences: input.references.filter(r => r.level === 8 && r.group === 'workbook').length,
    apiReferences: input.references.filter(r => r.level === 9 && r.group === 'api').length,
    seeds, scoreMethod: 'Eight fixed seeds, both sides; 50% API/workbook opponents and 50% cross-family candidates',
    rows,
  };
  fs.writeFileSync(path.join(cache, 'scored.json'), JSON.stringify(output));
  for (const level of [8, 9]) {
    const ranked = rows.map(r => ({ id: r.id, origin: r.origin, family: r.family, ...r.stages.find(s => s.level === level) }))
      .sort((a, b) => b.score - a.score);
    const tiers = Object.fromEntries(['S', 'A', 'B'].map(tier => [tier, ranked.filter(row => row.tier === tier).length]));
    console.log(`Level ${level}: ${Object.entries(tiers).map(([key, count]) => `${key}=${count}`).join(' ')}`);
    console.log(ranked.slice(0, 8).map(r => `${r.tier} ${r.id} ${(100 * r.score).toFixed(1)}% (API ${(100 * r.apiScore).toFixed(1)}, workbook ${(100 * r.workbookScore).toFixed(1)}, cross ${(100 * r.peerScore).toFixed(1)})`).join('\n'));
  }
}

if (isMainThread) {
  const input = JSON.parse(fs.readFileSync(path.join(cache, 'input.json')));
  const moduleUrl = ensureGameAssets();
  const tasks = tasksFor(input);
  const concurrency = Math.min(Number(process.env.COMPOSITION_WORKERS || 4), os.availableParallelism(), 8);
  const batches = Array.from({ length: concurrency }, () => []);
  tasks.forEach((task, index) => batches[index % concurrency].push(task));
  console.log(`Scoring ${input.candidates.length} candidates with ${tasks.length} pairs, ${seeds.length} seeds and ${concurrency} workers`);
  const results = [];
  await Promise.all(batches.map(batch => new Promise((resolve, reject) => {
    const worker = new Worker(fileURLToPath(import.meta.url), { workerData: { batch, moduleUrl, seeds } });
    worker.on('message', message => { if (message.type === 'result') results.push(...message.results); });
    worker.on('error', reject);
    worker.on('exit', code => code === 0 ? resolve() : reject(new Error(`Worker exited ${code}`)));
  })));
  if (results.length !== tasks.length) throw new Error(`Only ${results.length}/${tasks.length} results received`);
  writeResults(input, results);
} else {
  const sim = await import(workerData.moduleUrl);
  await sim.E();
  const Battle = sim.l;
  function match(teamA, teamB) {
    let points = 0;
    for (const seed of workerData.seeds) {
      for (let side = 0; side < 2; side++) {
        const left = side ? teamB : teamA;
        const right = (side ? teamA : teamB).map(unit => ({ ...unit, cell: 55 - unit.cell }));
        const battle = new Battle(left, right, seed, null);
        battle.pvpClock = true;
        battle.start();
        for (let step = 0; !battle.over && step < 1700; step++) battle.step();
        if (!battle.over) throw new Error('Battle exceeded the PvP clock');
        points += battle.winner < 0 ? .5 : (battle.winner === side ? 1 : 0);
      }
    }
    return points / (workerData.seeds.length * 2);
  }
  const chunk = [];
  for (const task of workerData.batch) {
    chunk.push({ kind: task.kind, level: task.level, a: task.a, b: task.b, group: task.group, score: match(task.teamA, task.teamB) });
    if (chunk.length >= 100) parentPort.postMessage({ type: 'result', results: chunk.splice(0) });
  }
  if (chunk.length) parentPort.postMessage({ type: 'result', results: chunk });
}
