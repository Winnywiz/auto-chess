import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync('compositions.html','utf8');
const elements=new Map();
const element=key=>{if(!elements.has(key))elements.set(key,{value:'',content:'',innerHTML:'',hidden:true,dataset:{},style:{},classList:{toggle(){}},getBoundingClientRect:()=>({left:10,bottom:20}),offsetWidth:350,offsetHeight:360});return elements.get(key);};
const context={console,document:{documentElement:{dataset:{theme:'viridian'}},querySelector:element,querySelectorAll:()=>[],addEventListener(){}},location:{hash:''},URLSearchParams,requestAnimationFrame(){},localStorage:{setItem(){}},fetch:()=>new Promise(()=>{}),innerWidth:1440,innerHeight:900,btoa:s=>Buffer.from(s,'binary').toString('base64'),unescape,encodeURIComponent};
context.window=context;context.addEventListener=()=>{};vm.createContext(context);
for(const s of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(s[2]&&!s[2].startsWith('try{'))vm.runInContext(s[2],context);
vm.runInContext(fs.readFileSync('composition-guidance.js','utf8'),context);
context.KantoSeals={sidebar:()=>'<aside class="comp-seals"></aside>'};
const source=fs.readFileSync('compositions.js','utf8').replace("window.addEventListener('scroll',hide,{passive:true});", "window.addEventListener('scroll',hide,{passive:true});window.testUI={overviewDetails,views,summaryMarkup,board,stage};");
vm.runInContext(source,context);
const {KANTO_COMPS:C,KANTO_GUIDANCE:P,KANTO_DATA:D,testUI:ui}=context;
let count=0;
for(const row of C.rows){
 assert(ui.summaryMarkup(row).includes(row.name));
 for(const key of [...P.rows[row.id].stages.map(s=>s.key),'cap-8','cap-9']){
  ui.views.set(row.id,key);const markup=ui.overviewDetails(row);
  const practical=key.startsWith('level-'),board=practical?P.rows[row.id].stages.find(s=>s.key===key):row.boards.find(b=>'cap-'+b.level===key);
  assert(markup.includes(practical?'Suggested / unscored':'% cap combat'));
  if(practical)assert(!markup.includes('% cap combat'));
  const encoded=markup.match(/href="builder.html#team=([^"]+)"/)[1];const team=JSON.parse(Buffer.from(encoded,'base64').toString('utf8'));
  assert.equal(team.level,board.level);assert.equal(Object.keys(team.board).length,board.level);
  for(const u of board.team){const v=team.board[u.cell-28];assert.equal(v.line,u.line);assert.equal(v.star,u.star);assert.deepEqual(v.items,Array.from(u.items));}
  count++;
 }
}
assert(!/[\u2014\u00b7]/.test(JSON.stringify(P)));
console.log(JSON.stringify({passed:true,rows:C.rows.length,renderedBoards:count,builderExports:true,unscoredProgression:true,roster:D.roster.length}));
