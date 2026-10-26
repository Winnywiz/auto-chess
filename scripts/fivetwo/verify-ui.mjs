// Source/data checks only. No browser is opened.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
const html=fs.readFileSync(path.join(process.env.SITE_DIR??'.','compositions.html'),'utf8'),elements=new Map();
const element=key=>{if(!elements.has(key))elements.set(key,{value:'',content:'',innerHTML:'',hidden:true,dataset:{},style:{},classList:{toggle(){}},getBoundingClientRect:()=>({left:10,bottom:20}),offsetWidth:350,offsetHeight:360});return elements.get(key);};
const context={console,document:{documentElement:{dataset:{theme:'viridian'}},querySelector:element,querySelectorAll:()=>[],addEventListener(){}},location:{hash:''},URLSearchParams,requestAnimationFrame(){},localStorage:{setItem(){}},innerWidth:1440,innerHeight:900,btoa:s=>Buffer.from(s,'binary').toString('base64'),unescape,encodeURIComponent};
context.window=context;context.addEventListener=()=>{};vm.createContext(context);
for(const s of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(s[2]&&!s[2].startsWith('try{'))vm.runInContext(s[2],context);
context.KantoSeals={sidebar:()=>'<aside>Seals</aside>'};
const marker="window.addEventListener('scroll',hide,{passive:true});";
const source=fs.readFileSync('compositions.js','utf8');assert(source.includes(marker));
vm.runInContext(source.replace(marker,marker+'window.check52={overview,views,summary,details,displayedStages,battleLink,builderLink};'),context);
const C=context.KANTO_COMPS,ui=context.check52;let boards=0;
for(const r of C.rows){
 assert(ui.summary(r).includes('Full board'));assert(ui.summary(r).includes('Low roll'));
 assert(!/undefined|NaN/.test(ui.summary(r)));assert(!/undefined|NaN/.test(ui.details(r)));
 for(const s of ui.displayedStages(r)){
  ui.views.set(r.id,s.key);assert(!/undefined|NaN|Level 52/.test(ui.overview(r)));
  const q=JSON.parse(Buffer.from(ui.builderLink(s.level,s.team).split('#team=')[1],'base64').toString());
  assert.equal(q.level,s.level);assert.equal(Object.keys(q.board).length,s.team.length);
  const battle=JSON.parse(Buffer.from(new URLSearchParams(ui.battleLink(s.team).split('#')[1]).get('battle'),'base64').toString());
  assert.equal(battle.rules,C.gameRules);assert.equal(JSON.stringify(battle.a),JSON.stringify(s.team.map(({line,star,items,cell})=>({line,star,items,cell}))));boards++;
 }
}
console.log(JSON.stringify({passed:true,rows:C.rows.length,progressionAndCaps:boards,exactBuilderAndBattleLinks:true,browserUsed:false}));
