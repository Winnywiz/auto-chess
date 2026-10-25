import {read,write,roster} from './native.mjs';
const rows=read('discovery.json').rows,selected=[];
const carries=[...new Set(rows.map(r=>r.carry))];
for(const carry of carries){
 const options=rows.filter(r=>r.carry===carry),best=options[0];
 if(best.apiScore<.43)continue;
 const keep=r=>{if(r&&!selected.some(x=>x.id===r.id))selected.push(r);};
 // Different upgrade counts remain separate, even when raw capped combat prefers more stars.
 for(const r of read('shortlist.json').filter(r=>r.carry===carry).slice(0,4))keep(r);
 const nominal=roster[carry].cost<=3?roster[carry].cost+4:8;
 keep(options.find(r=>r.level===nominal&&r.extraTargets===0&&r.carryStar===(roster[carry].cost<=3?3:2)));
 if([2,3].includes(roster[carry].cost))keep(options.find(r=>r.carryStar===2&&r.extraTargets===0));
}
write('economic-candidates.json',selected);
console.log(JSON.stringify({plans:selected.length,carries:new Set(selected.map(r=>r.carry)).size}));
