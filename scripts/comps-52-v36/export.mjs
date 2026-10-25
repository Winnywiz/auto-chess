import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {read,previous,H,data,roster,counts,hash} from './common.mjs';
const F=read('frozen.json'),Q=read('confirmation.json'),meta=previous('meta.json');
if(F.engine!==H.identity||Q.engine!==H.identity)throw Error('Mismatched native engine');
const nativeName=u=>roster[u.line].forms[u.star-1].name;
const sourceMeta={url:'https://einoow.com/api/meta/kanto/meta.json',generated:meta.generated,rules:meta.rules,versions:meta.versions};
const published=F.selected.filter(r=>r.category!=='reroll-3'||['S','A','B'].includes(Q.combat[r.id].finish.tier));
const rows=published.map(r=>{
 const c=Q.combat[r.id],carry=r.team.find(u=>u.assignment==='Carry'),low=r.options.find(o=>o.key===c.finish.finishFallback),lowCarry=low.team.find(u=>u.assignment==='Carry');
 const base=roster[r.carry].branchOf?roster[roster[r.carry].branchOf]:roster[r.carry];
 const condition=r.category.startsWith('reroll')?'Commit from six '+base.forms[0].name+' copies and the upgraded support core by '+(r.category==='reroll-3'?'4-1':'3-2')+'. ':r.level===8?'Start from an upgraded level-7 core. ':'Start from an upgraded level-6 core. ';
 const plan=condition+(r.category.startsWith('reroll')?'Roll at level '+r.rollLevel+' for '+r.upgrades.map(id=>nativeName({line:id,star:3})+' 3★').join(' and ')+', then level to '+r.level+'.':'Level to '+r.level+' and use the strongest upgraded holder until '+nativeName(carry)+' 2★ is ready.')+' Finish by 5-2.';
 const options=r.options.map(o=>({key:o.key,label:o.label,note:o.note,level:o.level,team:o.team,combat:c[o.key]}));
 const lowText=nativeName(lowCarry)+' 2★ uses the same three carry items if the planned upgrades miss. Keep the upgraded frontline.';
 const progression=r.progression.map(s=>({...s,score:s.final?c.finish.referenceScore:c[s.key]?.referenceScore??null,lobby:'reference',combat:s.final?c.finish:c[s.key]??null}));
 const bps=Object.entries(counts(r.team)).map(([name,count])=>{const t=data.traits[name],tier=t.thresholds.filter(n=>n<=count).length;return {name,count,tier,breakpoint:t.thresholds[tier-1]??0,value:t.values[tier-1]??0};});
 return {id:r.id,name:r.name,carry:r.carry,level:r.level,rollLevel:r.rollLevel,category:r.category,strategy:r.strategy,target:r.target,goal:r.goal,family:r.family,team:r.team,
 boards:[{level:r.level,team:r.team}],stages:[c.finish],targets:r.upgrades,traits:bps.filter(t=>t.tier).map(t=>t.name).join(' '),breakpoints:bps,score:c.finish.referenceScore,expected:c.finish.finishScore,tier:c.finish.tier,lowScore:c[low.key].referenceScore,plan,
 tempo:[r.category.startsWith('fast')?'Keep 2★ holders until replacements are upgraded.':'Keep the 2★ frontline while rolling. Do not wait for a four-cost tank.',r.utilityStudy.in?(roster[r.utilityStudy.in]?.forms[1].name??'Utility')+' is included for its tested board fit.':'Keep the core breakpoints before adding utility.'],
 lowRoll:{text:lowText,holder:lowCarry.line,star:2,score:c[low.key].referenceScore},
 lowOptions:options.filter(o=>['low-roll','item-pivot'].includes(o.key)).map(o=>{const holder=o.team.find(u=>u.assignment==='Carry').line;return {kind:holder===carry.line?'keep':o.team.some(u=>u.line===carry.line)&&r.team.some(u=>u.line===holder)?'holder':'pivot',holder,star:2,score:o.combat.referenceScore,team:o.team};}),
 carryOptions:[{items:carry.items,score:c.finish.referenceScore,team:r.team},...options.filter(o=>o.key.startsWith('items-')).map(o=>({items:o.team.find(u=>u.assignment==='Carry').items,score:o.combat.referenceScore,team:o.team}))],
 altBuild:options.find(o=>o.key.startsWith('items-'))?{items:options.find(o=>o.key.startsWith('items-')).team.find(u=>u.assignment==='Carry').items,score:options.find(o=>o.key.startsWith('items-')).combat.referenceScore}:null,
 tanks:options.filter(o=>o.key==='frontline').map(o=>({...o.team.find(u=>u.assignment==='Tank'),score:o.combat.referenceScore,team:o.team})),
 progression,cap:{...r.cap,score:c.cap.referenceScore,combat:c.cap},options,matchups:c.finish.matchups.map(m=>({...m,stage:4}))};
});
rows.sort((a,b)=>b.expected-a.expected);
const reference=F.references.map(r=>({id:r.id,carry:r.carry,name:r.name??nativeName(r.team.find(u=>u.assignment==='Carry')??r.team[0])+' / '+r.family,level:r.level,family:r.family,team:r.team}));
const C={model:'finish-5-2-v36',version:'v36-52-1',gameRules:36,engineIdentity:H.identity,generated:Q.generated,targetRound:'5-2',cutoff:52,itemBudget:7,seals:false,seeds:32,scoreMethod:Q.method,sourceMeta,rows,reference};
const guides=Object.fromEntries(rows.map(r=>[r.id,{plan:r.plan,stop:r.lowRoll.text,stages:r.options}]));
const replace=(html,key,value)=>{const re=new RegExp('window\\.'+key+'=\\{[^\\n]*\\};');if(!re.test(html))return html;return html.replace(re,()=> 'window.'+key+'='+JSON.stringify(value)+';');};
let html=fs.readFileSync('compositions.html','utf8'),builder=fs.readFileSync('builder.html','utf8'),frame=JSON.parse(builder.match(/window\.KANTO_DATA=(\{[^\n]*\});/)[1]).frames;
html=replace(html,'KANTO_DATA',{...data,frames:frame});html=replace(html,'KANTO_BIS',{build:data.build,rules:36,states:{},method:'Native item fit.'});html=replace(html,'KANTO_COMPS',C);html=replace(html,'KANTO_GUIDES',{guides});
const first=html.indexOf('    <p class="patch-note">'),last=html.indexOf('    <div class="comps-filters">',first);if(first<0||last<0)throw Error('Original header missing');
html=html.slice(0,first)+`    <p class="patch-note">Version 36 / finish by 5-2 / seven items</p>
    <details class="score-guide" id="score-method"><summary>Test details</summary><div><p>Full board and low roll: 32 fresh seeds on both sides against 18 reference boards, using v36, seven items and no Seals or weather.</p><p>The 5-2 forecast includes missed upgrades, conditional on the early core in each plan. It is not a ranked win rate. S starts at 65%, A at 50%. Early progression is illustrative; optional caps are scored separately.</p><p>Trait badges count Pokémon; the tooltip shows the active breakpoint. References come from the <a href="https://einoow.com/api/meta/kanto/meta.json" target="_blank" rel="noreferrer">official v35 meta snapshot</a>. <a href="data/compositions-v36-research.json" target="_blank" rel="noreferrer">Combat tests ↗</a></p></div></details>
`+html.slice(last);
html=html.replace(/<button data-strategy="fast-8"/, '<button data-strategy="fast-7" aria-pressed="false">Fast 7</button><button data-strategy="fast-8"');
html=html.replace('Ranked meta boards at the same point','Meta reference boards');
html=html.replaceAll('v35-52-2','v36-52-1').replaceAll('v35-52-1','v36-52-1');
fs.writeFileSync('compositions.html',html);
fs.writeFileSync('composition-guidance.js','window.KANTO_GUIDANCE='+JSON.stringify({version:C.version,sourceHash:hash([C,guides]),rows:guides})+';\n');
fs.writeFileSync('data/compositions-v36-research.json',JSON.stringify({version:36,engine:H.identity,generated:Q.generated,targetRound:'5-2',itemBudget:7,method:Q.method,seedValues:Q.seeds,sourceMeta,referenceBoards:reference,rows:rows.map(r=>({id:r.id,name:r.name,carry:r.carry,level:r.level,boards:r.boards,stages:r.stages,breakpoints:r.breakpoints,alternatives:r.options})),limitations:['References are reconstructed from API v35 records, not live human opponents.','Conditional forecasts are not unconditional finish rates. Whole-game acquisition results are kept in the private report.','Seven specific item recipes are standardized for combat and are not guaranteed rewards.','The conditional shop study freezes opponent future purchases; it does not model future contesting.']}));
// Current native Seal board fit, not a claim of measured Seal win rates.
const old=JSON.parse(fs.readFileSync('seals-data.js','utf8').match(/window\.KANTO_SEALS=(\{[^\n]*\});/)[1]);
const one=(label,p)=>{const v=Object.values(H.route).filter(p);if(v.length!==1)throw Error('Ambiguous '+label);return v[0];};
const resolve=one('Seal resolver',v=>typeof v==='function'&&String(v).includes('r.template?n&&')),boardFit=one('Seal fit',v=>typeof v==='function'&&String(v).includes('case`traitPlus`')&&String(v).includes('e.def.effects')&&String(v).includes('.65*s'));
const recommendations={};
for(const r of rows){const g=H.LocalMatch.create('v36-52-seal-fit/'+r.id,{level:'elite',seals:'ranked'});g.closeRound();Object.assign(g.me,{level:r.level,gold:30,hp:60,units:Object.fromEntries(r.team.map((u,i)=>['u'+i,{...u}])),board:Object.fromEntries(r.team.map((u,i)=>[u.cell,'u'+i])),bench:Array(9).fill(null),floor:[],items:[]});const choices=[];
 for(const s of Object.values(data.seals)){const def=old.seals.find(x=>x.id===s.id);if(def.hero&&!def.heroLines.some(id=>r.team.some(u=>u.line===id)))continue;for(const type of s.template?s.types.filter(t=>(counts(r.team)[t]??0)>=data.traits[t].thresholds[0]):[null]){const id=s.id+(type?':'+type:''),v=resolve(id);if(v){const score=boardFit(v,g.me,s.rarity-1);if(Number.isFinite(score))choices.push({id,score,rarity:s.rarity,kind:['eco','xp','shop'].includes(s.cat)?'economy':s.cat==='pos'?'situational':'core'});}}}
 const picks=[],alternatives=[];for(const rarity of [1,2,3]){const group=choices.filter(x=>x.rarity===rarity).sort((a,b)=>b.score-a.score);picks.push({id:group[0].id,kind:group[0].kind,round:old.rounds[rarity-1]});alternatives.push(group.slice(1,4).map(({id,kind})=>({id,kind})));}recommendations[r.id]={[r.level]:{picks,alternatives}};
}
fs.writeFileSync('seals-data.js','window.KANTO_SEALS='+JSON.stringify({...old,version:36,recommendations})+';\n');
console.log(JSON.stringify({rows:rows.length,strategies:[...new Set(rows.map(r=>r.category))],breakpointsChecked:rows.reduce((n,r)=>n+r.breakpoints.length,0)}));
