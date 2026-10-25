// Head-to-head carry builds on the published Vaporeon board, 16 seeds on both sides.
import fs from 'node:fs';
import {startPool} from './combat.mjs';
import {score} from './search.mjs';
const C = JSON.parse(fs.readFileSync('compositions.html', 'utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const r = C.rows.find(x => x.id === '52-vaporeon-water-3');
const team = r.team.map(({line, star, cell, items}) => ({line, star, cell, items: [...items]}));
const sets = [['light-clay', 'light-clay', 'choice-specs'], ['choice-specs', 'choice-specs', 'choice-specs'], ['choice-specs', 'choice-specs', 'light-clay'], ['light-clay', 'light-clay', 'light-clay'],
  ['choice-specs', 'choice-specs', 'quick-claw'], ['choice-specs', 'choice-specs', 'shell-bell'], ['light-clay', 'choice-specs', 'quick-claw'], ['choice-specs', 'choice-specs', 'focus-sash'], ['choice-specs', 'twisted-spoon', 'light-clay']];
startPool();
for (const star of [3, 2]) {
  const boards = sets.map(s => team.map(u => u.line === 'vaporeon' ? {...u, star, items: [...s]} : u));
  const res = await score(boards, {nSeeds: 16, salt: 'vapo-items', s3: true});
  console.log(`Vaporeon ${star}★`);
  sets.map((s, i) => [s, res[i]]).sort((a, b) => b[1].score - a[1].score).forEach(([s, x]) => console.log('  ', s.join(' + ').padEnd(44), (x.score * 100).toFixed(1), 'stage4', (x.s4 * 100).toFixed(1), 'stage3', (x.s3 * 100).toFixed(1)));
}
process.exit(0);
