// Combat helpers on the hash-verified native Version 37 engine.
import fs from 'node:fs';
import os from 'node:os';
import {Worker} from 'node:worker_threads';

export {data} from './engine.mjs';
import {data} from './engine.mjs';
export const roster = Object.fromEntries(data.roster.map(r => [r.id, r]));
export const items = Object.fromEntries(data.items.map(i => [i.id, i]));
export const traitRules = data.traits;
export const FULL = data.items.filter(i => i.kind === 'full').map(i => i.id);
export const copies = star => 3 ** (star - 1);
export const family = line => roster[line]?.branchOf ?? line;

export function traitCounts(team) {
  const seen = new Set(), c = {};
  for (const u of team) { const f = family(u.line); if (seen.has(f)) continue; seen.add(f); for (const t of roster[u.line].traits) c[t] = (c[t] ?? 0) + 1; }
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
  for (const w of workers) {
    w.on('message', m => { const job = busy.get(w); if(m.error)job.reject(Error(m.error));else job.resolve(m.results); pump(w); });
    w.on('error',error=>{busy.get(w)?.reject(error);for(const job of queue.splice(0))job.reject(error);});
  }
  pool = {
    run(batch) { return new Promise((resolve,reject) => { queue.push({id: id++, batch, resolve,reject}); for (const w of workers) if (!busy.has(w)) { pump(w); break; } }); },
    close() { for (const w of workers) w.terminate(); pool = null; },
  };
  return pool;
}
// Score many (a, b) pairings; chunked so both workers stay busy.
const combatCache=new Map();
export async function scoreMany(pairs, chunk = 32) {
  const p=startPool(),pending=new Map(),requests=[];
  for(const pair of pairs){
    const a=clean(pair.a),b=clean(pair.b),sa=JSON.stringify(a),sb=JSON.stringify(b),flip=sa>sb;
    const prefix=flip?sb+'|'+sa:sa+'|'+sb;
    const keys=pair.seeds.map(seed=>{
      const key=prefix+'|'+seed;
      if(!combatCache.has(key)&&!pending.has(key))pending.set(key,{a:flip?b:a,b:flip?a:b,seeds:[seed]});
      return key;
    });requests.push({keys,flip});
  }
  const entries=[...pending],parts=[];
  for(let i=0;i<entries.length;i+=chunk)parts.push(p.run(entries.slice(i,i+chunk).map(([,job])=>job)));
  const results=(await Promise.all(parts)).flat();entries.forEach(([key],i)=>combatCache.set(key,results[i]));
  const values=requests.map(({keys,flip})=>{const value=keys.reduce((sum,key)=>sum+combatCache.get(key),0)/keys.length;return flip?1-value:value;});
  if(combatCache.size>150000){const keys=combatCache.keys();let remove=combatCache.size-100000;while(remove-->0)combatCache.delete(keys.next().value);}
  return values;
}
