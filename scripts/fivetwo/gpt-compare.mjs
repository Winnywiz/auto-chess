// Score the backup (GPT) v36 boards exactly as published on the same lobby and seeds as ours.
import fs from 'node:fs';
import {startPool} from './combat.mjs';
import {score} from './search.mjs';
const rows = JSON.parse(fs.readFileSync('compositions-gpt.html', 'utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).rows;
startPool();
const out = [];
for (const r of rows) {
  const team = r.team.map(({line, star, cell, items}) => ({line, star, cell, items: [...items]}));
  const s = (await score([team], {nSeeds: 8, salt: 'gpt|' + r.id, s3: true}))[0];
  out.push({id: r.id, name: r.name, carry: r.carry, strategy: r.strategy, tier: r.tier, theirExpected: r.expected, theirScore: r.score, ourLobbyScore: s.score, s4: s.s4, s3: s.s3, team});
  console.log(r.tier, r.name, r.strategy, 'their', (r.score * 100).toFixed(1), 'our lobby', (s.score * 100).toFixed(1));
}
fs.writeFileSync('work/fiveTwo37/gpt-compare.json', JSON.stringify(out, null, 1));
process.exit(0);
