// Pure source/data integration checks. This does not launch or automate a browser.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const html=fs.readFileSync('compositions.html','utf8');
const elements=new Map();
const element=key=>{if(!elements.has(key))elements.set(key,{value:'',content:'',innerHTML:'',hidden:true,dataset:{},style:{},classList:{toggle(){}},getBoundingClientRect:()=>({left:10,bottom:20}),offsetWidth:350,offsetHeight:360});return elements.get(key);};
const context={console,document:{documentElement:{dataset:{theme:'viridian'}},querySelector:element,querySelectorAll:()=>[],addEventListener(){}},location:{hash:'#comp=v34-search-2'},URLSearchParams,requestAnimationFrame(){},localStorage:{setItem(){}},fetch:()=>new Promise(()=>{}),innerWidth:1440,innerHeight:900,btoa:s=>Buffer.from(s,'binary').toString('base64'),unescape,encodeURIComponent};
context.window=context;context.addEventListener=()=>{};
vm.createContext(context);
for(const s of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(s[2]&&!s[2].startsWith('try{'))vm.runInContext(s[2],context);
vm.runInContext(fs.readFileSync('composition-guidance.js','utf8'),context);
context.KantoSeals={sidebar:()=>'<aside class="comp-seals"></aside>'};
let source=fs.readFileSync('compositions.js','utf8');
source=source.replace("window.addEventListener('scroll',hide,{passive:true});", "window.addEventListener('scroll',hide,{passive:true});window.checkUI={overviewDetails,views,tooltip,progressionBoard,legendChoices,selectedVariants,summaryMarkup,syncSummary,board,stage,unitsPanel,traitsPanel,countersPanel};");
vm.runInContext(source,context);
const {KANTO_COMPS:comps,KANTO_GUIDES:guides,KANTO_GUIDANCE:guide,KANTO_DATA:data,checkUI:ui}=context;
assert.equal(ui.selectedVariants.get('exeggcute'),'v34-search-2');
assert(element('#comps-list').innerHTML.includes('class="comp-card tier-U" data-comp="exeggcute" open'));
const roster=Object.fromEntries(data.roster.map(r=>[r.id,r]));
assert.equal(guide.sourceHash,createHash('sha256').update(JSON.stringify([comps,guides.guides])).digest('hex'),'Guidance needs regeneration after changing source compositions');
assert.equal(Object.keys(guide.rows).length,comps.rows.length);
let boards=0,odds=0;
for(const r of comps.rows){
  const g=guide.rows[r.id];assert(g.plan&&g.stop);assert.equal(g.stages.length,r.id==='v34-search-2'?5:4);assert(g.odds.length);
  // Default view is the practical level-8 board, with no borrowed cap score.
  const defaultMarkup=ui.overviewDetails(r);assert(defaultMarkup.includes(r.id==='v34-search-2'?'Level 8 capped':'Level 8 progression'));assert(defaultMarkup.includes('Suggested / unscored'));
  for(const key of [...g.stages.map(s=>s.key),...(r.id==='v34-search-2'?[]:['cap-8','cap-9'])]){
    ui.views.set(r.id,key);const m=ui.overviewDetails(r),practical=key.startsWith('level-');
    const b=practical?g.stages.find(x=>x.key===key):r.boards.find(x=>'cap-'+x.level===key);
    assert.equal(new Set(b.team.map(u=>u.cell)).size,b.level);assert.equal(b.team.length,b.level);
    assert(b.team.every(u=>u.cell>=28&&u.cell<56&&roster[u.line].forms[u.star-1]));
    assert(b.team.reduce((n,u)=>n+u.items.length,0)<=6);
    const url=m.match(/href="(builder.html#team=[^"]+)"/)[1];
    const payload=JSON.parse(Buffer.from(url.split('#team=')[1],'base64').toString('utf8'));
    assert.equal(payload.level,b.level);assert.equal(Object.keys(payload.board).length,b.level);
    for(const u of b.team){const built=payload.board[u.cell-28];assert.equal(built.line,u.line);assert.equal(built.star,u.star);assert.deepEqual(built.items,Array.from(u.items));}
    if(practical){assert(m.includes('Suggested / unscored'));assert(!m.includes('cap combat</span>'));assert(!m.includes('matchups.html#'));assert(!('score' in b));
      for(const h of b.holders){const u=b.team.find(u=>u.line===h.holder);assert(u);assert.equal(h.holderStar,u.star);assert.deepEqual(Array.from(h.items),Array.from(u.items));}
    }else{assert(m.includes('conditional cap'));assert(m.includes((r.stages.find(s=>s.level===b.level).score*100).toFixed(1)+'% cap combat'));}
    boards++;
  }
  for(const o of g.odds){assert.equal(o.line,r.carry);assert.equal(o.goal,r.rollLevel?9:3);assert.equal(o.n,512);assert.equal(o.rate,o.hits/o.n);assert(o.interval[0]<=o.rate&&o.rate<=o.interval[1]);odds++;}
  const o=g.odds.find(x=>!x.taken),contested=g.odds.find(x=>x.level===o.level&&x.owned===o.owned&&x.taken===6);
  ui.tooltip({dataset:{hoverOdds:JSON.stringify({...o,contested})},getBoundingClientRect:()=>({left:20,bottom:50})});
  const tip=element('#skill-tooltip');assert(!tip.hidden);assert(tip.innerHTML.includes('512 trials'));assert(tip.innerHTML.includes('Six enemy-held copies'));assert(tip.innerHTML.includes('not a full-game success rate'));
}
const exegg=comps.rows.find(r=>r.id==='v34-search-2'),path=guide.rows[exegg.id];
for(const level of [8,9]){
  ui.views.set(exegg.id,'cap-'+level);
  const markup=ui.overviewDetails(exegg);
  assert(markup.includes('Level '+level+' capped'));
  assert(markup.includes('>8 capped</button>'));assert(markup.includes('>9 capped</button>'));
  assert(!markup.includes('data-guide-stage="cap-8"'));assert(!markup.includes('data-guide-stage="cap-9"'));
  assert(markup.includes('Suggested / unscored'));assert(!markup.includes('cap combat</span>'));
}
for(const level of [7,8,9]){
  const b=path.stages.find(s=>s.level===level);
  assert(b.team.some(u=>u.line==='slowpoke'&&u.star===2));
  assert(b.team.some(u=>u.line==='bulbasaur'&&u.star===2));
  assert.equal(b.team.some(u=>u.line==='chansey'),level>=8);
  assert.equal(b.team.some(u=>u.line==='ditto'),level===9);
  assert(!b.team.some(u=>u.line==='psyduck'));
}
let swapBoards=0;
for(const level of [8,9])for(const mew of [false,true])for(const mewtwo of [false,true]){
  ui.legendChoices.set(exegg.id,{mew,mewtwo});ui.views.set(exegg.id,'level-'+level);
  const b=ui.progressionBoard(exegg,path.stages.find(s=>s.level===level));
  for(const [found,from,to]of [[mew,'abra','mew'],[mewtwo,'jynx','mewtwo']]){
    assert(b.team.some(u=>u.line===(found?to:from)&&u.star===(found?1:2)));
    assert(!b.team.some(u=>u.line===(found?from:to)));
  }
  const traits=context.TeamLogic.traits(Object.fromEntries(b.team.map((u,i)=>[i,u])));
  for(const [name,count]of [['Psychic',5],['Grass',3],['Water',2],...(level===9?[['Normal',2]]:[])]){
    assert(traits.some(t=>t.name===name&&t.count===count&&t.active));
  }
  const markup=ui.overviewDetails(exegg);
  const payload=JSON.parse(Buffer.from(markup.match(/builder.html#team=([^\"]+)/)[1],'base64').toString('utf8'));
  for(const u of b.team)assert.equal(payload.board[u.cell-28].line,u.line);
  assert(markup.includes('Suggested / unscored'));assert(!markup.includes('cap combat</span>'));
  assert(markup.includes('data-legend-swap="mew"'));assert(markup.includes('data-legend-swap="mewtwo"'));
  const summary=ui.summaryMarkup(exegg),shown=ui.board(exegg);
  assert(summary.includes('Not scored'));assert(!summary.includes('98.8%'));assert(!summary.includes('99.0%'));
  assert(summary.includes('Chansey'));assert(summary.includes('Slowbro'));
  assert(!summary.includes('Golduck'));assert(!summary.includes('Alakazam'));assert(!summary.includes('Venusaur'));
  assert.equal(ui.stage(exegg).score,null);assert.equal(ui.stage(exegg).peerScore,null);assert.equal(ui.stage(exegg).tier,'U');
  const value=shown.team.reduce((n,u)=>n+roster[u.line].cost*3**(u.star-1),0);
  assert.equal(ui.stage(exegg).purchaseGold,value);assert(summary.includes('>'+value+'<small>Board Value'));
  const units=Array.from(summary.matchAll(/data-hover-unit='([^']+)'/g)).map(m=>JSON.parse(m[1].replaceAll('&quot;','"')));
  assert.deepEqual(units.map(u=>[u.line,u.star,u.items]),Array.from(shown.team,u=>[u.line,u.star,Array.from(u.items)]));
  assert(ui.countersPanel(exegg).includes('Matchups have not been scored for this lineup yet'));
  swapBoards++;
}
assert(!/[\u2014\u00b7]/.test(JSON.stringify(guide)), 'Avoid em dashes and middle dots in new guidance');
// Regression: changing a build previously refreshed its detail panel but left the old summary.
const cardNodes=new Map(),classes=new Set();
const card={open:true,classList:{remove(...names){names.forEach(n=>classes.delete(n));},add(n){classes.add(n);}},querySelector(selector){if(!cardNodes.has(selector))cardNodes.set(selector,{innerHTML:'',focus(){}});return cardNodes.get(selector);}};
context.document.getElementById=id=>id==='comp-exeggcute'?card:null;
for(const id of ['v34-search-1','v34-search-2']){
  const button={dataset:{selectVariant:id}};
  element('#comps-list').onclick({target:{closest:selector=>selector==='[data-select-variant]'?button:null}});
  const row=comps.rows.find(r=>r.id===id);
  assert.equal(card.querySelector('.comp-summary').innerHTML,ui.summaryMarkup(row));
  assert(card.querySelector('.comp-details').innerHTML.includes(row.name));
  assert(classes.has('tier-'+ui.stage(row).tier));
}
console.log(JSON.stringify({passed:true,compositions:comps.rows.length,renderedBoards:boards,swapBoards,carryOddsConditions:odds,defaultUnscored:true,builderExports:true,hoverAssumptions:true}));
