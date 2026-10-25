import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {read,H,data,roster,meta} from './native.mjs';
import {counts} from './boards.mjs';
const final=read('frozen.json'),confirmation=read('confirmation.json');
if(final.engine!==H.identity||confirmation.engine!==H.identity)throw Error('Wrong engine');
const replace=(html,name,value)=>{const re=new RegExp('window\\.'+name+'=\\{[^\\n]*\\};');if(!re.test(html))throw Error('Missing '+name);return html.replace(re,()=> 'window.'+name+'='+JSON.stringify(value)+';');};
const sourceMeta={url:'https://einoow.com/api/meta/kanto/meta.json',generated:meta.generated,rules:meta.rules,versions:meta.versions};
const rows=final.selected.map(r=>({id:r.id,name:r.name,carry:r.carry,target:r.target,goal:r.goal,family:r.family,level:r.level,rollLevel:r.rollLevel,
 category:r.category,strategy:r.carryStar===2&&r.rollLevel?'Stabilize '+r.rollLevel:r.strategy,
 boards:[{level:r.level,team:r.team}],stages:[confirmation.combat[r.id].finish]}));
const guides={};
for(const r of final.selected){
 const carry=roster[r.carry].forms[r.carryStar-1].name,upgrades=r.team.filter(u=>u.star===3).map(u=>roster[u.line].forms[2].name+' 3★');
 const base=roster[r.carry].branchOf?roster[roster[r.carry].branchOf]:roster[r.carry];
 const condition=r.conditional?'Commit with six '+base.forms[0].name+' copies and an upgraded frontline by 3-2. ':'';
 const plan=upgrades.length?condition+'Roll at '+r.rollLevel+' for '+upgrades.join(' + ')+'. Finish at level '+r.level+' before 5-1.':'Build a 2★ frontline and '+carry+' 2★ at level '+r.level+'. Keep upgraded holders until the replacements are ready.';
 const utility=r.utilityStudy.kind==='keep'?null:(Array.isArray(r.utilityStudy.in)?r.utilityStudy.in:[r.utilityStudy.in]).map(id=>{const s=roster[id].forms[1].skill,effects=[];if(s.heal)effects.push('healing');if(s.shieldAlly)effects.push('shields');if(s.confuse)effects.push('confusion');if(s.kind==='aoeSelf'||s.kind==='aoeTarget')effects.push('area damage');if(s.stun||s.grow?.sleep||s.status==='sleep')effects.push('control');if(s.zone?.status==='paralyze')effects.push('paralysis');if(s.empower?.seq?.some(e=>e.stun))effects.push('control');return roster[id].forms[1].name+(effects.length?' adds '+[...new Set(effects)].join(' and '):' fills the tested support slot');}).join('. ')+'.';
 guides[r.id]={plan,utility,stop:'Use the low-roll option if upgrades miss.',odds:[],alternatives:[],stages:r.options.map(o=>({key:o.key,label:o.label,level:o.level,team:o.team,note:o.note,combat:confirmation.combat[r.id][o.key]}))};
}
const comps={version:'v36-tempo-1',generated:confirmation.generated,gameRules:36,engineIdentity:H.identity,targetRound:'before 5-1',cutoff:48,itemBudget:7,seals:false,seeds:32,scoreMethod:confirmation.method,sourceMeta,rows};
const guidance={version:comps.version,note:'Finish boards and alternatives use their own v36 combat results.',guides};
for(const file of ['compositions.html','builder.html']){
 let html=fs.readFileSync(file,'utf8'),old=JSON.parse(html.match(/window\.KANTO_DATA=(\{[^\n]*\});/)[1]);
 html=replace(html,'KANTO_DATA',{...data,frames:old.frames});html=replace(html,'KANTO_BIS',{build:data.build,rules:36,states:{},method:'Native item fit when no composition-specific test is selected.'});
 if(file==='compositions.html'){
  html=replace(html,'KANTO_COMPS',comps);html=replace(html,'KANTO_GUIDES',guidance);
  const start=html.indexOf('    <p class="patch-note">'),end=html.indexOf('    <div class="comps-filters">',start);if(start<0||end<0)throw Error('Missing page header');
  html=html.slice(0,start)+`    <p class="patch-note">Version 36 / before 5-1 / 7 items</p>
    <details class="score-guide" id="score-method"><summary>Test details</summary><div><p>32 fresh seeds on both sides. Seven items: three tank, three carry, one secondary. No Seals or weather. Tiers combine 70% reconstructed official-meta opponents and 30% cross-trait boards. Combat results require the stars, items and positions shown.</p><p><a href="https://einoow.com/api/meta/kanto/meta.json" target="_blank" rel="noreferrer">Official meta</a> / <a href="data/compositions-v36-research.json" target="_blank" rel="noreferrer">Combat tests</a>. The API snapshot is v35; all battles here use v36.</p></div></details>
`+html.slice(end);
  html=html.replace(/<button data-strategy="legendary"[^>]*>Level 9<\/button>/,'');
  html=html.replace(/<button data-strategy="([^"]+)"[^>]*>[^<]+<\/button>/g,(button,category)=>rows.some(r=>r.category===category)?button:'');
  html=html.replace(/<div class="comp-list-header"[^>]*>[^\n]*<\/div>/,'<div class="comp-list-header" aria-hidden="true"><span>Composition</span><span>Team</span><span>vs meta</span><span>Cross-trait</span></div>');
 }
 html=html.replaceAll('v35-comps-1','v36-tempo-1').replaceAll('custom-battle-1','v36-tempo-1');fs.writeFileSync(file,html);
}
const sourceHash=createHash('sha256').update(JSON.stringify([comps,guides])).digest('hex');fs.writeFileSync('composition-guidance.js','window.KANTO_GUIDANCE='+JSON.stringify({version:comps.version,sourceHash,rows:guides})+';\n');
const research={version:36,engine:H.identity,generated:confirmation.generated,targetRound:comps.targetRound,itemBudget:7,method:confirmation.method,seedValues:confirmation.seeds,sourceMeta,
 referenceBoards:final.references.map(({id,family,carry,level,team})=>({id,family,carry,level,team})),rows:rows.map(r=>({id:r.id,name:r.name,carry:r.carry,level:r.level,boards:r.boards,stages:r.stages})),limitations:['Reconstructed API lineups are reference opponents, not live human opponents.','Combat percentages are not ranked placement or completion probabilities.','Item recipes are standardized for combat; seven chosen finished recipes are not guaranteed drops.']};
fs.writeFileSync('data/compositions-v36-research.json',JSON.stringify(research));
fs.writeFileSync('data/meta-usage.json',JSON.stringify({source:sourceMeta.url,generated:meta.generated,rules:meta.rules,from:meta.from,to:meta.to,seats:meta.seats,versions:meta.versions,units:meta.units,traits:meta.traits}));
// Keep current Seal descriptions, and compute fit for the newly published boards.
const old=JSON.parse(fs.readFileSync('seals-data.js','utf8').match(/window\.KANTO_SEALS=(\{[^\n]*\});/)[1]),recommendations={};
const find=(label,predicate)=>{const found=Object.values(H.route).filter(predicate);if(found.length!==1)throw Error('Ambiguous '+label);return found[0];};
const resolve=find('Seal resolver',v=>typeof v==='function'&&String(v).includes('r.template?n&&'));
const boardFit=find('Seal fit',v=>typeof v==='function'&&String(v).includes('case`traitPlus`')&&String(v).includes('e.def.effects')&&String(v).includes('.65*s'));
for(const r of rows){const b=r.boards[0],g=H.LocalMatch.create('v36-seal-fit/'+r.id,{level:'elite',seals:'ranked'});g.closeRound();Object.assign(g.me,{level:b.level,gold:30,hp:60,units:Object.fromEntries(b.team.map((u,i)=>['u'+i,{...u}])),board:Object.fromEntries(b.team.map((u,i)=>[u.cell,'u'+i])),bench:Array(9).fill(null),floor:[],items:[]});
 const options=[];for(const s of Object.values(data.seals)){
  const oldDef=old.seals.find(v=>v.id===s.id);if(!oldDef)throw Error('Missing current Seal metadata');
  if(oldDef.hero&&!(oldDef.heroLines??[]).some(id=>b.team.some(u=>u.line===id)))continue;
  const types=s.template?s.types.filter(t=>(counts(b.team)[t]??0)>=data.traits[t].thresholds[0]):[null];
  for(const type of types){const id=s.id+(type?':'+type:''),resolved=resolve(id);if(resolved){const score=boardFit(resolved,g.me,s.rarity-1);if(Number.isFinite(score))options.push({id,score,rarity:s.rarity,kind:['eco','xp','shop'].includes(s.cat)?'economy':s.cat==='pos'?'situational':'core'});}}
 }
 const picks=[],alternatives=[];for(const rarity of [1,2,3]){const group=options.filter(o=>o.rarity===rarity).sort((a,b)=>b.score-a.score);if(!group.length)throw Error('No Seal options');picks.push({id:group[0].id,kind:group[0].kind,round:old.rounds[rarity-1]});alternatives.push(group.slice(1,4).map(({id,kind})=>({id,kind})));}
 recommendations[r.id]={[b.level]:{picks,alternatives}};
}
fs.writeFileSync('seals-data.js','window.KANTO_SEALS='+JSON.stringify({...old,version:36,recommendations})+';\n');
console.log(JSON.stringify({rows:rows.length,options:Object.values(guides).reduce((n,g)=>n+g.stages.length,0),rules:36,sourceHash}));
