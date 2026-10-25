import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const html=fs.readFileSync('compositions.html','utf8'),builder=fs.readFileSync('builder.html','utf8');
const read=(text,key)=>JSON.parse(text.match(new RegExp('window\\.'+key+'=(\\{[^\\n]*\\});'))[1]);
const C=read(html,'KANTO_COMPS'),D=read(html,'KANTO_DATA'),G=read(html,'KANTO_GUIDES'),P=JSON.parse(fs.readFileSync('composition-guidance.js','utf8').match(/window\.KANTO_GUIDANCE=(\{[^\n]*\});/)[1]);
assert.equal(C.gameRules,36);assert.equal(C.targetRound,'before 5-1');assert.equal(C.cutoff,48);assert.equal(C.itemBudget,7);assert(C.rows.length>=8);
assert.deepEqual(D,read(builder,'KANTO_DATA'));assert.equal(D.rules,36);assert.equal(D.identity,C.engineIdentity);
assert.equal(P.sourceHash,createHash('sha256').update(JSON.stringify([C,G.guides])).digest('hex'));
const lines=new Map(D.roster.map(r=>[r.id,r])),items=new Set(D.items.filter(i=>i.kind==='full').map(i=>i.id));let boards=0;
const key=team=>JSON.stringify(team.map(({line,star,items,cell})=>({line,star,items,cell})));
function check(b,r,combat){
 assert.equal(b.team.length,b.level);assert.equal(new Set(b.team.map(u=>u.line)).size,b.level);assert.equal(new Set(b.team.map(u=>u.cell)).size,b.level);
 assert.equal(b.team.reduce((n,u)=>n+u.items.length,0),7);assert.deepEqual(b.team.filter(u=>u.items.length).map(u=>u.items.length).sort(),[1,3,3]);
 for(const role of ['Carry','Tank','Secondary']){const found=b.team.filter(u=>u.assignment===role);assert.equal(found.length,1);assert.equal(found[0].items.length,role==='Secondary'?1:3);}
 for(const u of b.team){assert(lines.has(u.line));assert(u.star===2||u.star===3,'No one-star placeholders');assert(u.cell>=28&&u.cell<56);assert(u.items.every(i=>items.has(i)));assert(u.items.length<=3);assert(lines.get(u.line).cost<5,'No legendary dependency');if(b.level<=7)assert(lines.get(u.line).cost<=3,'No rare support while rerolling');}
 assert.equal(combat.rules,36);assert.equal(combat.boardKey,key(b.team));assert(Number.isFinite(combat.referenceScore));assert.equal(combat.n,18*64);boards++;
}
for(const r of C.rows){
 assert.equal(r.boards.length,1);assert.equal(r.stages.length,1);assert.equal(r.level,r.boards[0].level);check(r.boards[0],r,r.stages[0]);
 assert.equal(r.stages[0].score,r.stages[0].finishScore);assert.equal(r.stages[0].tier,r.stages[0].finishScore>=.65?'S':r.stages[0].finishScore>=.5?'A':'B');
 const g=P.rows[r.id];assert(g.plan.includes('before 5-1')||g.plan.includes('2★'));assert(g.stages.some(s=>s.key==='item-pivot'));assert(g.stages.some(s=>s.key==='items-2'));
 const carryItems=r.boards[0].team.find(u=>u.assignment==='Carry').items;
 for(const b of g.stages){check(b,r,b.combat);if(['low-roll','item-pivot','frontline'].includes(b.key))assert.deepEqual(b.team.find(u=>u.assignment==='Carry').items,carryItems,'Same-item alternative changed carry build');}
 assert(!/earnedMean|rollMean|purchaseGold|minimumRoll|screenEconomy|selectionUtility/.test(JSON.stringify([r,g])),'Private research leaked');
}
for(const r of D.roster)for(const f of r.forms)for(const p of ['media/sprites/'+f.num+'.gif','media/icons/'+f.num+'.png'])assert(fs.existsSync(p),p);
assert(!/[\u2014\u00b7]/.test(JSON.stringify([C,G,P])),'Authored composition wording');
console.log(JSON.stringify({passed:true,rules:36,rows:C.rows.length,boards,itemBudget:7,noOneStarPlaceholders:true,privateEconomics:true}));
