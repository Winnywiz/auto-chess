import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as native from '../../work/native-v35/headless.mjs';
const final=JSON.parse(fs.readFileSync('work/comps-v35/final.json','utf8'));
const fresh=JSON.parse(fs.readFileSync('work/native-v35/data.json','utf8'));
if(final.engine!==native.identity||fresh.identity!==native.identity)throw Error('Wrong v35 dataset identity');
const read=(html,name)=>JSON.parse(html.match(new RegExp('window\\.'+name+'=(\\{[^\\n]*\\});'))[1]);
const replace=(html,name,value)=>{
 const re=new RegExp('window\\.'+name+'=\\{[^\\n]*\\};');if(!re.test(html))throw Error('Missing '+name);
 return html.replace(re,()=> 'window.'+name+'='+JSON.stringify(value)+';');
};
const clean=s=>String(s??'').replaceAll('—',', ').replaceAll('–','-').replaceAll('·','/');
const roster=Object.fromEntries(fresh.roster.map(r=>[r.id,r]));
const rows=final.selected.map(r=>({...r,stages:[8,9].map(level=>({...final.results[r.id][level],gearImpact:null,bisDependent:false}))}));
const comps={version:'v35-comps-1',generated:final.generated,gameRules:35,gameModule:'route-DCzOBUMZ.js',engineIdentity:native.identity,
 seeds:24,itemBudget:6,seals:false,economySimulated:false,apiGenerated:final.sourceMeta.generated,apiRules:35,
 scoreMethod:final.method,discoveryCandidates:final.discoveryCandidates,rows};
const guides={version:comps.version,note:'Suggested connected progression. Cap scores apply only to exact displayed capped boards.',guides:final.guides};
const bis={build:fresh.build,rules:35,states:{},method:'No global v35 best-in-slot study is published. Composition equipment was screened on its actual board; the builder falls back to current native item fit.'};
for(const file of ['builder.html','compositions.html']){
 let html=fs.readFileSync(file,'utf8');const old=read(html,'KANTO_DATA');
 const data={...fresh,frames:old.frames};
 html=replace(html,'KANTO_DATA',data);html=replace(html,'KANTO_BIS',bis);
 if(file==='compositions.html'){
  html=replace(html,'KANTO_COMPS',comps);html=replace(html,'KANTO_GUIDES',guides);
  html=html.replace(/    <p class="patch-note">[^\n]*<\/p>\n/g,'');
  const start=html.indexOf('    <details class="score-guide"');const end=html.indexOf('    <div class="comps-filters">',start);
  if(start<0||end<0)throw Error('Missing composition method section');
  html=html.slice(0,start)+`    <p class="patch-note">Version 35 / ${rows.length} carry builds / refreshed 25 Oct 2026</p>
    <details class="score-guide" id="score-method"><summary>Scores &amp; strategies</summary><div>
      <p>Fresh v35 combat tests: 24 new seeds on both sides, six finished items, neutral weather and no Seals. Combat score is 75% cross-family and 25% reconstructed official-meta boards. Cross-tag weights opposing trait families equally. S: at least 65% combat and 55% cross-tag. A: at least 50% combat. B: below 50%.</p>
      <p>Scores require the exact stars, items and positions shown. They are combat estimates, not ranked win rates or the chance of completing a build. Board Value is the purchase cost of all copies. Earlier progression is suggested and unscored. Seal options describe board fit, not measured win-rate gains.</p>
      <p><a href="https://einoow.com/kanto-tactics/changelog" target="_blank" rel="noreferrer">Patch notes</a> / <a href="https://einoow.com/api/meta/kanto/meta.json" target="_blank" rel="noreferrer">Official meta</a> / <a href="data/compositions-v35-research.json" target="_blank" rel="noreferrer">Test record</a>. Official aggregate compositions can include older patches; their placement rates do not set these tiers.</p>
    </div></details>
`+html.slice(end);
  html=html.replace('>Legendary</button>','>Level 9</button>');
 }
 html=html.replaceAll('?v=restored-scores-6','?v=v35-comps-1').replaceAll('seals-data.js?v=v34-1','seals-data.js?v=v35-comps-1').replaceAll('seals.js?v=seal-db-3','seals.js?v=v35-comps-1');
 fs.writeFileSync(file,html);
}
const sourceHash=createHash('sha256').update(JSON.stringify([comps,guides.guides])).digest('hex');
fs.writeFileSync('composition-guidance.js','window.KANTO_GUIDANCE='+JSON.stringify({version:comps.version,sourceHash,rows:final.guides})+';\n');
const oldSeals=JSON.parse(fs.readFileSync('seals-data.js','utf8').match(/window\.KANTO_SEALS=(\{[^\n]*\});/)[1]);
const oldBy=Object.fromEntries(oldSeals.seals.map(s=>[s.id,s]));
const seals=Object.values(fresh.seals).map(def=>{
 const old=oldBy[def.id];if(!old)throw Error('Missing Seal artwork metadata '+def.id);
 const localized=native.route.Eo[def.id]?.[1];
 const params=native.route.uo({id:def.id,def},def.rarity-1);
 const description=clean((localized?.[1]??old.description).replace(/\{(\d+)\}/g,(_,n)=>params[Number(n)]??'{'+n+'}'));
 return {...old,...def,name:clean(localized?.[0]??old.name).replaceAll('{T}','Trait'),description,details:[],types:def.types??[],
  round:oldSeals.rounds[def.rarity-1],offered:true,heroNames:(old.heroLines??[]).filter(id=>roster[id]).map(id=>roster[id].forms[2].name)};
});
const recommendations={};
for(const r of rows){recommendations[r.id]={};for(const board of r.boards){
 const g=native.LocalMatch.create('v35-seal-guide/'+r.id,{level:'elite',seals:'ranked'});g.closeRound();
 Object.assign(g.me,{level:board.level,gold:30,hp:60,units:Object.fromEntries(board.team.map((u,i)=>['u'+i,{line:u.line,star:u.star,items:u.items}])),
  board:Object.fromEntries(board.team.map((u,i)=>[u.cell,'u'+i])),bench:Array(9).fill(null),floor:[],items:[]});
 const options=[];
 for(const s of seals){
  if(s.hero&&!(s.heroLines??[]).some(id=>board.team.some(u=>u.line===id)))continue;
  const types=s.template?s.types.filter(t=>board.team.filter(u=>roster[u.line].traits.includes(t)).length>=fresh.traits[t].thresholds[0]):[null];
  for(const type of types){const id=s.id+(type?':'+type:''),resolved=native.route.Wo(id);if(!resolved)continue;
   let score=native.route.en(resolved,g.me,s.rarity-1);
   if(!Number.isFinite(score))continue;
   options.push({id,rarity:s.rarity,score,kind:['eco','xp','shop'].includes(s.cat)?'economy':s.cat==='pos'?'situational':'core'});
  }
 }
 const picks=[],alternatives=[];
 for(const rarity of [1,2,3]){const sorted=options.filter(o=>o.rarity===rarity).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  if(!sorted.length)throw Error('No current Seal suggestions');
  const convert=({id,kind})=>({id,kind});picks.push({...convert(sorted[0]),round:oldSeals.rounds[rarity-1]});alternatives.push(sorted.slice(1,4).map(convert));
 }
 recommendations[r.id][board.level]={picks,alternatives};
}}
fs.writeFileSync('seals-data.js','window.KANTO_SEALS='+JSON.stringify({...oldSeals,version:35,source:'https://einoow.com/kanto-tactics/changelog',
 method:'Current engine effects and native board-fit suggestions. No measured Seal win-rate or economic benefit is claimed.',seals,recommendations})+';\n');
const meta=JSON.parse(fs.readFileSync('work/comps-refresh/meta.json','utf8'));
fs.writeFileSync('data/meta-usage.json',JSON.stringify({source:'https://einoow.com/api/meta/kanto/meta.json',generated:meta.generated,rules:meta.rules,
 from:meta.from,to:meta.to,mode:meta.mode,seats:meta.seats,versions:meta.versions,units:meta.units,traits:meta.traits}));
const record={version:35,generated:final.generated,engine:native.identity,method:final.method,discoveryCandidates:final.discoveryCandidates,
 confirmationSeeds:24,sides:2,itemBudget:6,rows:rows.map(r=>({id:r.id,name:r.name,carry:r.carry,boards:r.boards,stages:r.stages})),
 sourceMeta:final.sourceMeta,limitations:['Combat-only tiers, not ranked placements.','Progression boards are suggested, not independently scored.',
 'Items screened per composition; global v34 BIS removed rather than reused.','Seal suggestions use native mechanical board fit, not measured strategy outcomes.'],digest:final.digest};
record.referenceBoards=JSON.parse(fs.readFileSync('work/comps-v35/frozen.json','utf8')).references;
record.seedValues=Array.from({length:24},(_,i)=>{let h=2166136261;for(const ch of 'v35-published-confirmation/'+i)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;});
fs.writeFileSync('data/compositions-v35-research.json',JSON.stringify(record));
console.log(JSON.stringify({rows:rows.length,seals:seals.length,rules:35,sourceHash}));
