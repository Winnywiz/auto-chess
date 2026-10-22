// Version 34 baseline: rescore the published boards unchanged (Eviolite now behaves as Metal Powder).
import {readPage,readJSON,writeJSON} from './common.mjs';
import {scoreAll} from './score.mjs';
const {comps}=readPage(),refs=readJSON('references.json').references;
const cands=comps.rows.map(r=>({id:r.id,family:r.family,boards:r.boards}));
const res=await scoreAll(cands,refs,{label:'baseline'});
writeJSON('baseline.json',res);
const rows=comps.rows.map(r=>({id:r.id,old:r.stages.find(s=>s.level===9),now:res[r.id][9]})).sort((a,b)=>b.now.score-a.now.score);
for(const r of rows)console.log(`${r.now.tier} (was ${r.old.tier}) ${r.id.padEnd(26)} ref ${(100*r.now.score).toFixed(1)} (was ${(100*r.old.score).toFixed(1)})  cross ${(100*r.now.peerScore).toFixed(1)}  api ${(100*r.now.groups.api).toFixed(0)} wb ${(100*r.now.groups.workbook).toFixed(0)}`);
