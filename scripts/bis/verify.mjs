// Reproduce stored confirmation results for a spread of three unit/star states.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fixturesFor,evaluateBuild,engineBuild} from './experiment.mjs';
const stored=JSON.parse(fs.readFileSync(new URL('../../work/bis-v4/results.json',import.meta.url)));
assert.equal(stored.engineBuild,engineBuild);
let battles=0;
for(const [line,star] of [['aerodactyl',2],['mewtwo',2],['exeggcute',3]]){
  const r=stored.results.find(r=>r.line===line&&r.star===star),fixtures=fixturesFor(line,star,'confirmation');
  for(const [label,key] of [['leader',r.frozenLeader],['runner',r.frozenRunner]]){
    const actual=evaluateBuild(fixtures,key.split('|'),'confirmation'),expected=r.confirmation[label];
    for(const field of ['n','wins','draws','losses','score','sumDamage','sumHealing','sumShield','sumMitigation','survivals'])assert.equal(actual[field],expected[field],`${line}:${star} ${label} ${field}`);
    battles+=actual.n;
  }
}
console.log(JSON.stringify({passed:true,engineBuild,states:3,builds:6,battles}));
