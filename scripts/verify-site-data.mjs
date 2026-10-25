if(JSON.parse(fs.readFileSync('compositions.html','utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).model==='finish-5-2-v36'){await import('./comps-52-v36/verify.mjs');process.exit(0);}
if(JSON.parse(fs.readFileSync('compositions.html','utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).gameRules===36){await import('./comps-tempo-v36/verify.mjs');process.exit(0);}
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
if(JSON.parse(fs.readFileSync('compositions.html','utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).model==='finish-by-5-2'){await import('./fivetwo/verify.mjs');process.exit(0);}
if(JSON.parse(fs.readFileSync('compositions.html','utf8').match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]).gameRules===35){await import('./comps-v35/verify.mjs');process.exit(0);}
const read=name=>{const html=fs.readFileSync(name,'utf8');return Object.fromEntries(['KANTO_DATA','KANTO_BIS',...(name==='compositions.html'?['KANTO_COMPS','KANTO_GUIDES']:[])].map(k=>[k,JSON.parse(html.match(new RegExp(`window\\.${k}=(\\{[^\\n]*\\});`))[1])]));};
const site=read('compositions.html'),builder=read('builder.html');
assert.deepEqual(site.KANTO_DATA,builder.KANTO_DATA);
assert.deepEqual(site.KANTO_BIS,builder.KANTO_BIS);
assert.equal(site.KANTO_COMPS.gameRules,34);assert.equal(site.KANTO_BIS.rules,34);
const roster=Object.fromEntries(site.KANTO_DATA.roster.map(r=>[r.id,r]));
const items=new Set(site.KANTO_DATA.items.map(i=>i.id));
const combat=team=>team.map(({line,star,items,cell})=>({line,star,items,cell}));
function check(team,size,budget){
  assert.equal(team.length,size);assert.equal(new Set(team.map(u=>u.cell)).size,size);
  assert.equal(new Set(team.map(u=>u.line)).size,size);
  assert(team.reduce((n,u)=>n+u.items.length,0)<=budget);
  for(const u of team){assert(roster[u.line]?.forms[u.star-1]);assert(Number.isInteger(u.cell)&&u.cell>=0&&u.cell<56);assert(u.items.length<=3);assert(u.items.every(i=>items.has(i)));}
}
let caps=0,transitions=0;
assert.equal(new Set(site.KANTO_COMPS.rows.map(r=>r.id)).size,site.KANTO_COMPS.rows.length,'Duplicate composition IDs');
for(const row of site.KANTO_COMPS.rows){
  for(const board of row.boards){check(board.team,board.level,6);const carry=board.team.filter(u=>u.assignment==='Carry');assert.equal(carry.length,1);assert.equal(carry[0].line,row.carry,'Carry label differs from board role: '+row.id);caps++;}
  for(const board of site.KANTO_GUIDES.guides[row.id].stages){check(board.team,board.level,({5:3,6:4,7:5,8:6})[board.level]);transitions++;}
  const count={};for(const u of row.boards.find(b=>b.level===9).team)for(const t of roster[u.line].traits)count[t]=(count[t]??0)+1;
  for(const m of row.name.matchAll(/(Psychic|Ice|Ground|Water|Fighting|Flying|Fire|Normal|Grass|Poison|Electric|Rock)\s+(\d+)/g))assert(count[m[1]]>=Number(m[2]),'Incorrect trait label: '+row.id);
}
for(const s of Object.values(site.KANTO_BIS.states)){
  assert.equal(s.wins+s.draws+s.losses,s.battles);assert.equal((s.wins+s.draws/2)/s.battles,s.score);
  assert.equal(s.battles,s.validationBattles+s.confirmationBattles);
  assert(Math.abs(s.gap-(s.confirmationScore-s.alternative.confirmationScore))<1e-12);
  assert(Math.abs(s.pooledGap-(s.score-s.alternative.score))<1e-12);
  assert(s.interval[0]<=s.gap&&s.gap<=s.interval[1]);
  assert.equal(s.confirmationBattles,s.native.battles);assert.equal(s.confirmationBattles,s.noItemsBattles);
}
const sealContext={window:{}};vm.runInNewContext(fs.readFileSync('seals-data.js','utf8'),sealContext);
const seals=sealContext.window.KANTO_SEALS,bySeal=Object.fromEntries(seals.seals.map(s=>[s.id,s]));
assert.equal(seals.version,34);
const sealFor=id=>{const [key,type]=id.split(':'),s=bySeal[key];assert(s,'Unknown Seal: '+id);if(type)assert(s.template&&s.types.includes(type),'Invalid typed Seal: '+id);return s;};
for(const row of site.KANTO_COMPS.rows)for(const level of [8,9]){
  const plan=seals.recommendations[row.id][level];
  plan.picks.forEach((p,i)=>{assert.equal(sealFor(p.id).rarity,i+1);assert.equal(p.round,seals.rounds[i]);});
  plan.alternatives.forEach((list,i)=>list.forEach(p=>assert.equal(sealFor(p.id).rarity,i+1)));
}
// With the original research output present, verify published gear equals exactly what scoreAll used.
if(fs.existsSync('work/comps-v34/final.json')){
  const final=JSON.parse(fs.readFileSync('work/comps-v34/final.json'));
  for(const c of final.candidates)for(const b of c.boards){
    const expected=b.team.map(u=>({...u,items:[...u.items]}));let left=6;
    const order=expected.map((u,i)=>i).sort((a,b)=>expected[b].items.length-expected[a].items.length||roster[expected[b].line].cost-roster[expected[a].line].cost||a-b);
    for(const i of order){expected[i].items=expected[i].items.slice(0,Math.max(0,left));left-=expected[i].items.length;}
    assert.deepEqual(combat(site.KANTO_COMPS.rows.find(r=>r.id===c.id).boards.find(x=>x.level===b.level).team),combat(expected));
  }
}
console.log(JSON.stringify({passed:true,caps,transitions,bisStates:Object.keys(site.KANTO_BIS.states).length,seals:seals.seals.length,scoreEquipmentParity:true}));
