import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync('compositions.html','utf8'),elements=new Map();
const element=key=>{if(!elements.has(key))elements.set(key,{value:'',content:'',innerHTML:'',hidden:true,dataset:{},style:{},classList:{toggle(){}},getBoundingClientRect:()=>({left:10,bottom:20}),offsetWidth:350,offsetHeight:360});return elements.get(key);};
const context={console,document:{documentElement:{dataset:{theme:'viridian'}},querySelector:element,querySelectorAll:()=>[],addEventListener(){}},location:{hash:''},URLSearchParams,requestAnimationFrame(){},localStorage:{setItem(){}},fetch:()=>new Promise(()=>{}),innerWidth:1440,innerHeight:900,btoa:s=>Buffer.from(s,'binary').toString('base64'),unescape,encodeURIComponent};
context.window=context;context.addEventListener=()=>{};vm.createContext(context);
for(const s of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(s[2]&&!s[2].startsWith('try{'))vm.runInContext(s[2],context);
vm.runInContext(fs.readFileSync('composition-guidance.js','utf8'),context);context.KantoSeals={sidebar:()=>'<aside></aside>'};
const source=fs.readFileSync('compositions.js','utf8').replace("window.addEventListener('scroll',hide,{passive:true});","window.addEventListener('scroll',hide,{passive:true});window.testUI={overviewDetails,views,summaryMarkup,board,stage,unitsPanel,traitsPanel};");vm.runInContext(source,context);
const {KANTO_COMPS:C,KANTO_GUIDANCE:P,testUI:ui}=context;let boards=0;
for(const r of C.rows){
 assert(ui.summaryMarkup(r).includes('vs meta'));assert(!ui.summaryMarkup(r).includes('Board Value'));
 assert(ui.unitsPanel(r).includes('Level '+r.level+' finish'));assert(ui.traitsPanel(r).includes('Level '+r.level+' finish'));
 for(const k of ['finish',...P.rows[r.id].stages.map(s=>s.key)]){
  ui.views.set(r.id,k);const markup=ui.overviewDetails(r),b=k==='finish'?r.boards[0]:P.rows[r.id].stages.find(s=>s.key===k);
  assert(markup.includes('before 5-1'));assert(!/Level 48|cap combat|Board Value|rollMean|undefined/.test(markup));
  const target=JSON.parse(Buffer.from(markup.match(/href="builder.html#team=([^"]+)"/)[1],'base64').toString('utf8'));assert.equal(target.level,b.level);
  for(const u of b.team)assert.deepEqual(target.board[u.cell-28].items,Array.from(u.items));
  const battle=JSON.parse(Buffer.from(decodeURIComponent(markup.match(/href="battle.html#battle=([^"]+)"/)[1]),'base64').toString('utf8'));assert.equal(battle.rules,36);assert.equal(JSON.stringify(battle.a),JSON.stringify(b.team.map(({line,star,items,cell})=>({line,star,items,cell}))));boards++;
 }
}
console.log(JSON.stringify({passed:true,boards,builderLinks:true,simulationLinks:true,actualLevels:true}));
