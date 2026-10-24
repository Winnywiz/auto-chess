import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const html=fs.readFileSync('compositions.html','utf8'),builder=fs.readFileSync('builder.html','utf8');
const read=(s,k)=>JSON.parse(s.match(new RegExp('window\\.'+k+'=(\\{[^\\n]*\\});'))[1]);
const D=read(html,'KANTO_DATA'),C=read(html,'KANTO_COMPS'),G=read(html,'KANTO_GUIDES');
assert.equal(C.gameRules,35);assert.equal(D.rules,35);assert.equal(D.roster.length,69);
assert.deepEqual(D,read(builder,'KANTO_DATA'));assert.deepEqual(read(html,'KANTO_BIS'),read(builder,'KANTO_BIS'));
assert.equal(read(html,'KANTO_BIS').rules,35);assert.equal(Object.keys(read(html,'KANTO_BIS').states).length,0);
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('composition-guidance.js','utf8'),ctx);
const P=ctx.window.KANTO_GUIDANCE;
assert.equal(P.sourceHash,createHash('sha256').update(JSON.stringify([C,G.guides])).digest('hex'));
const R=Object.fromEntries(D.roster.map(r=>[r.id,r])),items=new Set(D.items.map(i=>i.id));
const counts=team=>{const out={};for(const u of team)for(const t of R[u.line].traits)out[t]=(out[t]??0)+1;return out;};
let boards=0,progressions=0;
function check(team,level,budget){
 assert.equal(team.length,level);assert.equal(new Set(team.map(u=>u.line)).size,level);assert.equal(new Set(team.map(u=>u.cell)).size,level);
 assert(team.reduce((s,u)=>s+u.items.length,0)<=budget);
 for(const u of team){assert(R[u.line]?.forms[u.star-1]);assert(u.cell>=28&&u.cell<56);assert(u.items.length<=3);assert(u.items.every(id=>items.has(id)));
  const form=R[u.line].forms[u.star-1];assert(fs.existsSync('media/sprites/'+form.num+'.gif'),'Missing sprite '+form.num);assert(fs.existsSync('media/icons/'+form.num+'.png'),'Missing icon '+form.num);}
}
assert.equal(C.rows.length,32);assert.equal(new Set(C.rows.map(r=>r.id)).size,32);
for(const r of C.rows){
 assert(r.id.startsWith('v35-'));assert(P.rows[r.id]);assert(G.guides[r.id]);
 for(const b of r.boards){check(b.team,b.level,6);const carries=b.team.filter(u=>u.assignment==='Carry');assert.equal(carries.length,1);assert.equal(carries[0].line,r.carry);
  assert((counts(b.team)[r.target]??0)>=r.goal,'Advertised trait missing: '+r.id);
  const score=r.stages.find(s=>s.level===b.level);assert(Number.isFinite(score.score));assert(score.score>=0&&score.score<=1);assert.equal(score.opponents.length,C.rows.length-1);
  assert.equal(score.tier,score.score>=.65&&score.peerScore>=.55?'S':score.score>=.5?'A':'B');
  assert.equal(score.purchaseGold,b.team.reduce((n,u)=>n+R[u.line].cost*3**(u.star-1),0));boards++;
 }
 for(const b of P.rows[r.id].stages){check(b.team,b.level,({5:3,6:4,7:5,8:6})[b.level]);assert(!b.combat);assert(!('score' in b));
  for(const h of b.holders){const u=b.team.find(u=>u.line===h.holder);assert(u);assert.equal(h.holderStar,u.star);assert.deepEqual(h.items,u.items);}progressions++;
 }
}
const seal=JSON.parse(fs.readFileSync('seals-data.js','utf8').match(/window\.KANTO_SEALS=(\{[^\n]*\});/)[1]);
assert.equal(seal.version,35);assert.equal(seal.seals.length,134);assert(!seal.seals.some(s=>['spare-change','losing-streak'].includes(s.id)));
const S=new Map(seal.seals.map(s=>[s.id,s]));
for(const s of seal.seals){assert(!/\{\d+\}/.test(s.description),s.id);if(s.template){assert(!s.types.includes('Water'));assert(!s.types.includes('Psychic'));}}
for(const r of C.rows)for(const level of [8,9]){
 const p=seal.recommendations[r.id][level];assert.equal(p.picks.length,3);
 [...p.picks.map((p,k)=>[p,k]),...p.alternatives.flatMap((ps,k)=>ps.map(p=>[p,k]))].forEach(([p,k])=>{const [id,type]=p.id.split(':'),s=S.get(id);assert(s);assert.equal(s.rarity,k+1);if(type)assert(s.types.includes(type));});
}
const newIds=['koga','venomoth','porygon3','omastar','victreebel','tangela4','primeape','nidoqueen','kabutops','samurai','giovanni'];
assert(newIds.every(id=>C.rows.some(r=>r.boards.some(b=>b.team.some(u=>u.line===id)))));
const record=JSON.parse(fs.readFileSync('data/compositions-v35-research.json','utf8'));assert.equal(record.engine,C.engineIdentity);assert.equal(record.rows.length,32);
console.log(JSON.stringify({passed:true,rules:35,compositions:C.rows.length,caps:boards,progressions,seals:seal.seals.length,newUnits:newIds.length}));
