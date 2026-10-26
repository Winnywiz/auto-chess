import fs from 'node:fs';
import {startPool, traitLabel, arrange} from './combat.mjs';
import {score, placeHint} from './search.mjs';
const old = JSON.parse(fs.readFileSync('work/fiveTwo37/search-backup.json')).results;
const C = JSON.parse(fs.readFileSync('compositions.html', 'utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const clean = t => t.map(({line, star, cell, items}) => ({line, star, cell, items: [...items]}));
startPool();
const boards = [];
for (const v of old.find(r => r.line === 'oddish').variants) if (v.team.some(u => u.line === 'eevee')) boards.push({label: 'Vileplume, Eevee 2★ (first run)', team: clean(v.team)});
for (const carry of ['oddish', 'tauros']) {
  const r = C.rows.find(x => x.carry === carry), team = clean(r.team);
  boards.push({label: `${r.name} published`, team});
  // Eevee 2★ in each support slot (no items moved).
  for (const u of r.team.filter(u => u.assignment === 'Support')) boards.push({label: `${r.name}: Eevee 2★ for ${u.line}`, team: team.map(x => x.line === u.line ? {...x, line: 'eevee', star: 2} : x)});
}
for (const b of [...boards]) if (b.team.some(u => u.line === 'eevee')) boards.push({label: b.label.replace('Eevee 2★', 'Eevee 3★'), team: b.team.map(u => u.line === 'eevee' ? {...u, star: 3} : u)});
const res = await score(boards.map(b => b.team), {nSeeds: 8, salt: 'eevee-check', s3: true});
boards.forEach((b, i) => console.log(b.label.padEnd(44), (res[i].score * 100).toFixed(1), 's4', (res[i].s4 * 100).toFixed(1), '|', traitLabel(b.team), '|', b.team.map(u => u.line + u.star + (u.items.length ? '[' + u.items.join(',') + ']' : '')).join(' ')));
process.exit(0);
