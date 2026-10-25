// Combat helpers on the repository's pinned Version 35 engine bundle (simulation/engine-v36.js).
import fs from 'node:fs';
import os from 'node:os';
import {Worker} from 'node:worker_threads';

export const data = JSON.parse(fs.readFileSync(new URL('../../simulation/data-v36.json', import.meta.url)));
export const roster = Object.fromEntries(data.roster.map(r => [r.id, r]));
export const items = Object.fromEntries(data.items.map(i => [i.id, i]));
export const traitRules = data.traits;
export const FULL = data.items.filter(i => i.kind === 'full').map(i => i.id);
export const copies = star => 3 ** (star - 1);
export const family = line => roster[line]?.branchOf ?? line;

export function traitCounts(team) {
  const seen = new Set(), c = {};
  for (const u of team) { if (seen.has(u.line)) continue; seen.add(u.line); for (const t of roster[u.line].traits) c[t] = (c[t] ?? 0) + 1; }
  return c;
}
export function activeTraits(team) {
  return Object.entries(traitCounts(team)).map(([t, n]) => ({t, n, tier: traitRules[t].thresholds.filter(x => n >= x).length})).filter(x => x.tier > 0);
}
export const traitLabel = team => activeTraits(team).sort((a, b) => b.tier - a.tier || b.n - a.n).map(x => `${x.t} ${x.n}`).join(', ');
export const boardValue = team => team.reduce((s, u) => s + roster[family(u.line)].cost * copies(u.star), 0);

// Placement: melee front, mid-range second row, ranged back row; carry kept central in the back.
const FRONT = [31, 30, 32, 29, 33, 28, 34], SECOND = [38, 37, 39, 36, 40, 35, 41], BACK = [52, 51, 53, 50, 54, 49, 55], THIRD = [45, 44, 46, 43, 47, 42, 48];
export function arrange(team, {carry = null, hint = {}} = {}) {
  const used = new Set(), out = team.map(u => ({...u, items: [...(u.items ?? [])]}));
  for (const u of out) { const h = hint[u.line]; if (h !== undefined && !used.has(h)) { u.cell = h; used.add(h); } else u.cell = undefined; }
  const zone = u => { const r = roster[u.line]; if (r.role === 'assassin') return [49, 55, 50, 54, ...BACK, ...THIRD]; if (r.range <= 1) return [...FRONT, ...SECOND]; if (r.range === 2) return [...SECOND, ...FRONT]; return [...BACK, ...THIRD]; };
  const order = [...out].sort((a, b) => (b.line === carry) - (a.line === carry) || (b.items.length - a.items.length));
  for (const u of order) if (u.cell === undefined) { u.cell = zone(u).find(c => !used.has(c)) ?? [...FRONT, ...SECOND, ...THIRD, ...BACK].find(c => !used.has(c)); used.add(u.cell); }
  return out;
}

export function seeds(n, salt) { return Array.from({length: n}, (_, i) => { let h = 2166136261; for (const ch of `${salt}/${i}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }); }
export const clean = team => team.map(u => ({line: u.line, star: u.star, cell: u.cell, items: [...(u.items ?? [])]}));

// Worker pool: each job = {a, b, seeds}; result = points in [0, 1] for team a over both sides.
let pool = null;
export function startPool(n = Math.max(1, Math.min(os.cpus().length, Number(process.env.KANTO_WORKERS ?? 2)))) {
  if (pool) return pool;
  const workers = Array.from({length: n}, () => new Worker(new URL('./combat-worker.mjs', import.meta.url)));
  const queue = [], busy = new Map();
  let id = 0;
  const pump = w => { const job = queue.shift(); if (!job) { busy.delete(w); return; } busy.set(w, job); w.postMessage({id: job.id, batch: job.batch}); };
  for (const w of workers) w.on('message', m => { const job = busy.get(w); job.resolve(m.results); pump(w); });
  pool = {
    run(batch) { return new Promise(resolve => { queue.push({id: id++, batch, resolve}); for (const w of workers) if (!busy.has(w)) { pump(w); break; } }); },
    close() { for (const w of workers) w.terminate(); pool = null; },
  };
  return pool;
}
// Score many (a, b) pairings; chunked so both workers stay busy.
export async function scoreMany(pairs, chunk = 6) {
  const p = startPool(), parts = [];
  for (let i = 0; i < pairs.length; i += chunk) parts.push(p.run(pairs.slice(i, i + chunk).map(x => ({a: clean(x.a), b: clean(x.b), seeds: x.seeds}))));
  return (await Promise.all(parts)).flat();
}
