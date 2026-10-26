import {parentPort} from 'node:worker_threads';
import {engine} from './engine.mjs';
const mirror = t => t.map(u => ({...u, cell: 55 - u.cell, items: [...u.items]}));
function one(a, b, seed) {
  const battle = new engine.Battle(a.map(u => ({...u, items: [...u.items]})), mirror(b), seed, null);
  battle.pvpClock = true; battle.start();
  for (let s = 0; !battle.over && s < 1800; s++) battle.step();
  return battle.over ? (battle.winner < 0 ? 0.5 : battle.winner === 0 ? 1 : 0) : 0.5;
}
parentPort.on('message', ({id, batch}) => {
  const results = batch.map(({a, b, seeds}) => {
    let p = 0;
    for (const s of seeds) { p += one(a, b, s); p += 1 - one(b, a, s); }
    return p / (seeds.length * 2);
  });
  parentPort.postMessage({id, results});
});
