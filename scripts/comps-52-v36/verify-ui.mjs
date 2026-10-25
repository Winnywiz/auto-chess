import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync('compositions.html','utf8'),elements=new Map();
const element=key=>{if(!elements.has(key))elements.set(key,{value:'',content:'',innerHTML:'',hidden:true,dataset:{},style:{},classList:{toggle(){}},getBoundingClientRect:()=>({left:10,bottom:20}),offsetWidth:350,offsetHeight:360});return elements.get(key);};
const context={console,document:{documentElement:{dataset:{theme:'viridian'}},querySelector:element,querySelectorAll:()=>[],addEventListener(){}},location:{hash:''},URLSearchParams,requestAnimationFrame(){},localStorage:{setItem(){}},innerWidth:1440,innerHeight:900,btoa:s=>Buffer.from(s,'binary').toString('base64'),unescape,encodeURIComponent};context.window=context;context.addEventListener=()=>{};vm.createContext(context);
for(const s of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(s[2]&&!s[2].startsWith('try{'))vm.runInContext(s[2],context);
context.KantoSeals={sidebar:()=>'<aside class="comp-seals">Seals</aside>'};
const source=fs.readFileSync('compositions.js','utf8').replace("window.addEventListener('scroll',hide,{passive:true});","window.addEventListener('scroll',hide,{passive:true});window.check52={overview,views,summary,pivots,details,breakpoints,teamTraits,battleLink};");vm.runInContext(source,context);
const C=context.KANTO_COMPS,ui=context.check52;let checked=0;
for(const r of C.rows){
 assert(ui.summary(r).includes('Full board'));assert(ui.summary(r).includes('Low roll'));assert(ui.details(r).includes('Items &amp; pivots')||ui.details(r).includes('Items & pivots'));
 for(const s of [...r.progression,r.cap]){
  ui.views.set(r.id,s.key);const m=ui.overview(r);assert(m.includes('Progression'));assert(!/undefined|NaN|Level 52/.test(m));
  const encoded=m.match(/href="builder.html#team=([^"]+)"/)[1],q=JSON.parse(Buffer.from(encoded,'base64').toString());assert.equal(q.level,s.level);assert.equal(Object.keys(q.board).length,s.level);
  const battle=JSON.parse(Buffer.from(decodeURIComponent(m.match(/href="battle.html#battle=([^"]+)"/)[1]),'base64').toString());assert.equal(JSON.stringify(battle.a),JSON.stringify(s.team.map(({line,star,items,cell})=>({line,star,items,cell}))));assert.equal(battle.rules,36);
  if(s.illustrative)assert(m.includes('Transition / unscored'));checked++;
 }
 for(const t of r.breakpoints.filter(t=>t.tier)){const markup=ui.breakpoints(t.name,t.count);assert(markup.includes('Active'));const actual=ui.teamTraits(r.team).find(x=>x.name===t.name);assert.equal(actual.count,t.count);assert.equal(actual.tier,t.tier);}
 assert(ui.pivots(r).includes('same three tank items'));
}
console.log(JSON.stringify({passed:true,progressionAndCaps:checked,exactBuilderAndBattleLinks:true,breakpointTooltips:true,restoredUi:true}));
