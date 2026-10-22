// Version 34 composition rerun. Usage: node scripts/comps/pipeline.mjs [--quick]
import {readPage,readJSON,writeJSON,roster,boardValue,activeTraits,capItems,traitRules} from './common.mjs';
import {saveCache,scorePairs} from './pool.mjs';
import {regear,loadBis} from './regear.mjs';
import {passiveStudy} from './passive.mjs';
import {search} from './search.mjs';
import {scoreAll} from './score.mjs';
import {buildTransitions} from './transitions.mjs';
import {seedList} from './common.mjs';
const quick=process.argv.includes('--quick');
const t0=performance.now(),log=m=>console.log(`[${Math.round((performance.now()-t0)/1000)}s] ${m}`);
const {comps}=readPage(),refs=readJSON('references.json').references;
let candidates=comps.rows.map(r=>({id:r.id,name:r.name,family:r.family,origin:r.origin,source:r.source,carry:r.carry,category:r.category,strategy:r.strategy,rollLevel:r.rollLevel,locked:r.locked??[],boards:r.boards.map(b=>({level:b.level,team:b.team.map(u=>({...u,items:[...(u.items??[])]}))}))}));
if(quick)candidates=candidates.slice(22,30);
const bis=loadBis();
log(`${candidates.length} candidates, ${refs.length} reference boards, BIS ${bis?'loaded':'missing'}`);

// 1. Items
const g=await regear(candidates,refs);candidates=g.candidates;writeJSON('step1-regear.json',g.report);
log('Re-gear: '+g.report.filter(r=>r.chosen!=='published').length+' boards changed items');

// 2. Passive traits and utility units on the strongest boards
const pre=await scoreAll(candidates,refs,{levels:[9],seeds:seedList(4,'v34-prescreen'),label:'prescreen'});
const strong=candidates.filter(c=>pre[c.id][9].score>=.5).sort((a,b)=>pre[b.id][9].score-pre[a.id][9].score).slice(0,quick?3:16);
const passive=await passiveStudy(strong,refs);
// Confirm each proposed swap on twelve new seeds before adopting it.
{const confirmSeeds=seedList(12,'v34-passive-confirm'),l9refs=refs.filter(r=>r.level===9),pairs=[],idx=[];
  for(const p of passive)if(p.adopt){const c=candidates.find(x=>x.id===p.id),base=c.boards.find(b=>b.level===9).team;
    for(const r of l9refs){pairs.push({a:capItems(base),b:r.team});idx.push([p.id,0]);pairs.push({a:capItems(p.adopt.team),b:r.team});idx.push([p.id,1]);}}
  const sc=await scorePairs(pairs,confirmSeeds,{label:'passive confirm'}),acc={};
  sc.forEach((s,i)=>{const [id,k]=idx[i];(acc[id]??=[[],[]])[k].push(s);});
  for(const p of passive)if(p.adopt){const [b,a]=acc[p.id].map(v=>v.reduce((x,y)=>x+y,0)/v.length);p.adopt.confirmedGain=a-b;
    if(a-b<.02){log(`Swap rejected on confirmation for ${p.id}: ${p.adopt.out} -> ${p.adopt.in} (${(100*(a-b)).toFixed(1)} points)`);p.rejected={...p.adopt,team:undefined};p.adopt=null;}}}writeJSON('step2-passive.json',passive.map(({adopt,...p})=>({...p,adopt:adopt&&{...adopt,team:undefined}})));
for(const p of passive)if(p.adopt){
  const c=candidates.find(x=>x.id===p.id);
  c.boards=c.boards.map(b=>{
    if(b.level===9)return {...b,team:p.adopt.team,swap:{out:p.adopt.out,in:p.adopt.in,gain:p.adopt.gain}};
    const slot=b.team.find(u=>u.line===p.adopt.out&&!u.items?.length);
    return slot&&!b.team.some(u=>u.line===p.adopt.in)?{...b,team:b.team.map(u=>u===slot?{line:p.adopt.in,star:2,items:[],cell:u.cell}:u),swap:{out:p.adopt.out,in:p.adopt.in}}:b;
  });
  log(`Swap adopted for ${p.id}: ${p.adopt.out} -> ${p.adopt.in} (+${(100*p.adopt.confirmedGain).toFixed(1)} points confirmed)`);
}

// 3. Search for a new board against the S tier
const l9=refs.filter(r=>r.level===9);
const ranked=[...candidates].sort((a,b)=>pre[b.id][9].score-pre[a.id][9].score);
const gauntlet=[...ranked.slice(0,10).map(c=>({id:c.id,team:capItems(c.boards.find(b=>b.level===9).team)})),...l9.filter(r=>r.group==='workbook').slice(0,10),...l9.filter(r=>r.group==='api').slice(0,5)];
const seedsBoards=[...ranked.slice(0,14).map(c=>c.boards.find(b=>b.level===9).team),...l9.filter(r=>r.group==='workbook').slice(0,10).map(r=>r.team)].map(t=>capItems(t.map(u=>({...u,items:[...(u.items??[])]}))));
const existing=[...candidates.map(c=>c.boards.find(b=>b.level===9).team),...l9.map(r=>r.team)];
const found=await search(seedsBoards,gauntlet,existing,{bis,generations:quick?2:24,children:quick?24:108});
writeJSON('step3-search.json',{tried:found.tried,gauntlet:gauntlet.map(x=>x.id),finalists:found.finalists.map(f=>({holdout:f.holdout,screen:f.screen,team:f.team}))});
log(`Search tried ${found.tried} boards; best novel holdout ${found.finalists[0]?(100*found.finalists[0].holdout).toFixed(1)+'%':'none'}`);
const familyOf=team=>{const a=activeTraits(team).sort((x,y)=>y.tier-x.tier||y.n-x.n)[0];if(!a)return 'mixed';const t=a.t.toLowerCase();if(t==='flying')return a.n>=6?'flying-six':'flying-four';if(t==='water'&&a.n<6)return 'water-utility';return t;};
const strategyOf=team=>{const three=team.filter(u=>u.star===3).map(u=>roster[u.line].cost);if(three.length){const c=Math.max(...three);return c<=1?['reroll-5','Reroll 5',5]:c===2?['reroll-6','Reroll 6',6]:['reroll-7','Reroll 7',7];}const carry=team.reduce((a,b)=>(b.items?.length??0)>(a.items?.length??0)?b:a);return roster[carry.line].cost>=5?['legendary','Legendary',null]:['fast-8','Fast 8',null];};
let added=0;
for(const f of found.finalists){
  if(added>=2||f.holdout<.5)break;
  const team=f.team.map(u=>({...u}));const carry=team.reduce((a,b)=>(b.items?.length??0)>(a.items?.length??0)?b:a);carry.assignment='Carry';
  const tank=team.find(u=>u!==carry&&u.items?.length);if(tank)tank.assignment='Tank';
  // Level 8 board: drop the item-less unit whose removal hurts least against level 8 references.
  const l8refs=refs.filter(r=>r.level===8),drops=team.filter(u=>!u.items?.length);
  const pairs=[];drops.forEach(d=>{for(const r of l8refs)pairs.push({a:capItems(team.filter(u=>u!==d)),b:r.team});});
  const sc=await scorePairs(pairs,seedList(4,'v34-l8-drop'),{label:'new board level 8'});
  const best=drops.map((d,i)=>({d,s:sc.slice(i*l8refs.length,(i+1)*l8refs.length).reduce((a,b)=>a+b,0)/l8refs.length})).sort((a,b)=>b.s-a.s)[0];
  const [category,strategy,rollLevel]=strategyOf(team);
  const name=`${roster[carry.line].forms[carry.star-1].name} / ${activeTraits(team).sort((a,b)=>b.tier-a.tier||b.n-a.n).slice(0,2).map(t=>t.t+' '+t.n).join(', ')}`;
  candidates.push({id:`v34-search-${++added}`,name,family:familyOf(team),origin:'search',source:'Version 34 search',carry:carry.line,category,strategy,rollLevel,locked:team.filter(u=>u.star===3).map(u=>u.line),
    boards:[{level:8,team:team.filter(u=>u!==best.d)},{level:9,team}],searchHoldout:f.holdout});
  log(`Added new board v34-search-${added}: ${name} (holdout ${(100*f.holdout).toFixed(1)}%)`);
}

// 4. Final scores
const scores=await scoreAll(candidates,refs,{label:'final'});
log('Final scores done');
// 5. Transition boards
const trans=await buildTransitions(candidates,refs);
log('Transitions done');
writeJSON('final.json',{generated:new Date().toISOString(),quick,candidates,scores,transitions:trans,regear:g.report,passive:passive.map(({adopt,...p})=>({...p,adopt:adopt&&{...adopt,team:undefined}})),search:{tried:found.tried,finalists:found.finalists.slice(0,5).map(f=>({holdout:f.holdout,team:f.team}))}});
saveCache();
for(const c of [...candidates].sort((a,b)=>scores[b.id][9].score-scores[a.id][9].score))console.log(`${scores[c.id][9].tier} ${c.id.padEnd(24)} ${(100*scores[c.id][9].score).toFixed(1)} cross ${(100*scores[c.id][9].peerScore).toFixed(1)}`);
log('Pipeline finished');
