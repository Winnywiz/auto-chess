import fs from 'node:fs';
import assert from 'node:assert/strict';
import {H,data,roster,counts,hash} from './common.mjs';
const html=fs.readFileSync('compositions.html','utf8'),get=(s,k)=>JSON.parse(s.match(new RegExp('window\\.'+k+'=(\\{[^\\n]*\\});'))[1]);
const C=get(html,'KANTO_COMPS'),D=get(html,'KANTO_DATA'),P=get(fs.readFileSync('composition-guidance.js','utf8'),'KANTO_GUIDANCE'),G={guides:P.rows};
assert.equal(C.gameRules,36);assert.equal(C.targetRound,'5-2');assert.equal(C.cutoff,52);assert.equal(C.itemBudget,7);assert.equal(C.engineIdentity,H.identity);
assert.deepEqual(D,get(fs.readFileSync('builder.html','utf8'),'KANTO_DATA'));assert.equal(P.sourceHash,hash([C,G.guides]));
assert(C.rows.some(r=>r.category==='fast-7'));assert(C.rows.some(r=>r.category==='fast-8'));
let boards=0,breakpoints=0;
const key=team=>JSON.stringify(team.map(({line,star,items,cell})=>({line,star,items,cell})));
function check(b,r,combat){
 assert.equal(b.team.length,b.level);assert.equal(new Set(b.team.map(u=>u.line)).size,b.level);assert.equal(new Set(b.team.map(u=>u.cell)).size,b.level);
 assert.equal(b.team.reduce((n,u)=>n+u.items.length,0),7);assert.deepEqual(b.team.filter(u=>u.items.length).map(u=>u.items.length).sort(),[1,3,3]);
 for(const [role,n]of [['Carry',3],['Tank',3],['Secondary',1]]){const u=b.team.filter(u=>u.assignment===role);assert.equal(u.length,1);assert.equal(u[0].items.length,n);}
 for(const u of b.team){assert(u.star>=2&&u.star<=3);assert(roster[u.line].cost<5);assert(u.cell>=28&&u.cell<56);assert(u.items.every(id=>data.items.some(i=>i.id===id&&i.kind==='full')));if(b.level<=6||r.category.startsWith('reroll')&&b.level<8)assert(roster[u.line].cost<=3);}
 if(combat){assert.equal(combat.rules,36);assert.equal(combat.boardKey,key(b.team));assert.equal(combat.n,18*64);assert(Number.isFinite(combat.referenceScore));}
 const native=new H.Battle(b.team,b.team.map(u=>({...u,cell:55-u.cell})),771,null);native.start();const actual=Object.fromEntries(native.traits[0]);assert.deepEqual(actual,counts(b.team));
 for(const [t,n]of Object.entries(actual)){const tier=H.route.Zo(t,n);assert.equal(tier,data.traits[t].thresholds.filter(x=>n>=x).length);breakpoints++;}
 boards++;
}
for(const r of C.rows){
 const finish=r.stages[0];assert.equal(r.score,finish.referenceScore);assert.equal(r.expected,finish.finishScore);assert.equal(r.tier,r.expected>=.65?'S':r.expected>=.5?'A':r.expected>=.35?'B':'C');assert.equal(r.goal,data.traits[r.target].thresholds.filter(n=>n<=(counts(r.team)[r.target]??0)).at(-1)??0);
 check(r.boards[0],r,finish);
 const main=r.team.find(u=>u.assignment==='Carry').items;
 for(const o of r.options){check(o,r,o.combat);if(['low-roll','item-pivot','frontline'].includes(o.key))assert.deepEqual(o.team.find(u=>u.assignment==='Carry').items,main);}
 for(const s of r.progression){check(s,r,s.combat);if(s.illustrative){assert.equal(s.score,null);assert.equal(s.combat,null);}if(s.level===5)assert(s.team.every(u=>roster[u.line].cost<=2));}
 check(r.cap,r,r.cap.combat);assert(r.cap.afterDeadline);assert(r.progression.find(s=>s.final).level===r.level);
 for(const t of r.breakpoints){assert.equal(t.count,counts(r.team)[t.name]);assert.equal(t.tier,H.route.Zo(t.name,t.count));assert.equal(t.breakpoint,data.traits[t.name].thresholds[t.tier-1]??0);}
 assert(!/earnedMean|rollMean|minimumRoll|xpReserved|openingCost|holderReserve|screenEconomy/.test(JSON.stringify(r)));
}
for(const r of D.roster)for(const f of r.forms)for(const file of ['media/sprites/'+f.num+'.gif','media/icons/'+f.num+'.png'])assert(fs.existsSync(file),file);
assert(!/[\u2014\u00b7]/.test(JSON.stringify([C,G,P])));
console.log(JSON.stringify({passed:true,rules:36,rows:C.rows.length,boards,nativeBreakpointChecks:breakpoints,noOneStarPlaceholders:true,sevenItems:true,privateEconomics:true}));
