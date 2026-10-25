import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const context={};
vm.runInNewContext(fs.readFileSync('team-code.js','utf8'),context);
const encode=context.KantoTeamCode.encode;
const plain=x=>JSON.parse(JSON.stringify(x));
const html=fs.readFileSync('compositions.html','utf8');
const C=JSON.parse(html.match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const code=encode([{line:'abra',star:3,cell:55,items:['choice-specs','choice-specs','focus-sash']},{line:'slowpoke',star:2,cell:28,items:[]}],{rules:36,name:'Test / 7'});
assert.equal(code,'KT1;r36;xm=pvp;xn=Test%20%2F%207;slowpoke:2:0;abra:3:27:choice-specs.choice-specs.focus-sash');
assert.equal(encode([{line:'eevee',star:1,cell:0,items:[]}],{coordinates:'planner'}),'KT1;r36;xm=pvp;eevee:1:0');
assert.equal(encode([{line:'pikachu',star:2,cell:28,shiny:true,items:[]}]),'KT1;r36;xm=pvp;pikachu:2s:0');
for(const units of [[],[{line:'abra',star:1,cell:0}], [{line:'abra',star:4,cell:28}],
 [{line:'abra',star:1,cell:28},{line:'abra',star:2,cell:29}],
 [{line:'abra',star:1,cell:28},{line:'pikachu',star:2,cell:28}],
 [{line:'abra;xn=injected',star:1,cell:28}],
 [{line:'abra',star:1,cell:28,items:['choice-specs:bad']}],
 [{line:'abra',star:1,cell:28,items:Array(4).fill('choice-specs')}]])assert.throws(()=>encode(units));

let official=null,sourceHash=null;
const officialPath=process.argv.find(x=>x.startsWith('--official='))?.slice(11);
if(officialPath){
 const source=fs.readFileSync(officialPath,'utf8');
 sourceHash=createHash('sha256').update(source).digest('hex');
 const isolated=source.replace(/import\{[^}]*\}from"[^"]+";/g,'').replace(/export\{[^}]*\};?\s*$/,'');
 const box={};
 // The actual official encoder/parser run unchanged. Only lazy-init helpers and
 // row/column dependencies are supplied; no game, store or network is loaded.
 vm.runInNewContext('const e=fn=>{let initialized=false;return()=>{if(!initialized){initialized=true;fn();}}};const f=()=>{};const a=cell=>cell%7;const s=cell=>Math.floor(cell/7);'+isolated+';I();globalThis.official={encode:w,decode:T};',box);
 official=box.official;
}
let boards=0;
for(const row of C.rows)for(const stage of [{team:row.team},...(row.stages??[]),...(row.cap?[row.cap]:[])]){
 const before=JSON.stringify(stage.team),name=row.name+' / L'+(stage.level??row.level),rules=C.gameRules??36;
 const code=encode(stage.team,{name,rules});
 assert.equal(JSON.stringify(stage.team),before,'Input changed');
 if(official){
  const relative=stage.team.map(u=>({...u,cell:u.cell-28}));
  assert.equal(code,official.encode(relative,rules,'pvp',name),'Official encoder mismatch: '+row.id);
  const result=plain(official.decode(code));
  const expected=relative.map(({line,star,items,cell,shiny})=>({line,star,...shiny?{shiny:true}:{},cell,items:items??[]})).sort((a,b)=>a.cell-b.cell);
  assert.deepEqual(result.units,expected,'Official parser lost a field: '+row.id);
  assert.equal(result.rules,rules);assert.equal(result.mode,'pvp');assert.equal(result.name,name.slice(0,40));
 }
 boards++;
}
// Permission denial must use a real fallback, and failed copying must not claim success.
let removed=false,focused=false;
context.navigator={clipboard:{writeText:async()=>{throw Error('denied');}}};
context.document={activeElement:{focus:()=>{focused=true;}},createElement:()=>({style:{},select(){},remove(){removed=true;}}),body:{append(){}},execCommand:()=>true};
assert.equal(await context.KantoTeamCode.copy('KT1;r36;abra:1:0'),true);assert(removed&&focused);
context.document.execCommand=()=>false;
assert.equal(await context.KantoTeamCode.copy('KT1;r36;abra:1:0'),false);
assert(html.includes('src="team-code.js?v=kt1-1"'));
assert(fs.readFileSync('builder.html','utf8').includes('id="copy-team-code"'));
console.log(JSON.stringify({passed:true,compositions:C.rows.length,boards,officialParity:!!official,officialSourceSHA256:sourceHash,clipboardFallback:true,invalidInputs:8}));
