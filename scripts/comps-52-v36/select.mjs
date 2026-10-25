import {read,write,scoreBoards,roster} from './common.mjs';
const plans=read('variant-plans.json'),budgets=read('conditional.json'),refs=read('references.json');
const cases=plans.flatMap(r=>[{id:r.id,key:'finish',team:r.team},...r.options.filter(o=>['low-roll','item-pivot','frontline'].includes(o.key)).map(o=>({...o,id:r.id}))]);
const scores=await scoreBoards(cases,refs,8,'v36-52-selection','5-2 strategy comparison');cases.forEach((r,i)=>r.score=scores[i].referenceScore);
for(const r of plans){const own=cases.filter(x=>x.id===r.id),full=own.find(x=>x.key==='finish'),low=own.filter(x=>x.key!=='finish').sort((a,b)=>b.score-a.score)[0],q=budgets.results.find(x=>x.id===r.id);r.selectionScore=q.rate*full.score+(1-q.rate)*low.score;}
const selected=plans.filter(r=>r.category.startsWith('reroll'));
for(const category of ['fast-7','fast-8']){const own=plans.filter(r=>r.category===category).sort((a,b)=>b.selectionScore-a.selectionScore);selected.push(...own.slice(0,category==='fast-7'?3:5));const affordable=own.find(r=>roster[r.carry].cost===3);if(affordable&&!selected.includes(affordable))selected.push(affordable);}
write('selected.json',selected);console.log(JSON.stringify(selected.map(r=>[r.name,r.strategy,Math.round(r.selectionScore*100)])));
