import {read,write,roster,data,clean,arrange,counts,supportValue,fit} from './common.mjs';
const plans=read('selected.json');
const add=(team,r,size)=>{const out=clean(team);while(out.length<size){const picks=Object.values(roster).filter(p=>p.id!=='eevee'&&!p.branchOf&&p.cost<=3&&!out.some(u=>u.line===p.id)).map(p=>({p,s:supportValue(out,p,r.target,r.goal,'meta')})).sort((a,b)=>b.s-a.s);out.push({line:picks[0].p.id,star:2,items:[],assignment:'Support'});}return arrange(out);};
for(const r of plans){
 r.progression=[];const low=r.options.find(x=>x.key==='low-roll').team;
 for(let level=5;level<=8;level++){
  if(level===r.level){r.progression.push({key:'final',level,team:clean(r.team),final:true});continue;}
  if(level>r.level){r.progression.push({key:'L'+level,level,team:add(r.team,r,level),final:false,afterDeadline:true});continue;}
  const maxCost=level===5?2:3,chosen=[],pool=Object.values(roster).filter(p=>p.id!=='eevee'&&!p.branchOf&&p.cost<=maxCost);
  for(const role of ['Carry','Tank','Secondary']){
   const original=low.find(u=>u.assignment===role),eligible=pool.filter(p=>!chosen.some(u=>u.line===p.id)&&(role==='Tank'?['tank','fighter'].includes(p.role):!['tank','support'].includes(p.role)));
   const pick=roster[original.line].cost<=maxCost&&!chosen.some(u=>u.line===original.line)?roster[original.line]:eligible.map(p=>({p,s:3*original.items.reduce((v,id)=>v+fit({line:p.id,star:2},id),0)+(low.some(u=>u.line===p.id)?4:0)+(role==='Tank'&&p.role==='tank'?8:0)+supportValue(chosen,p,r.target,r.goal,'tempo')})).sort((a,b)=>b.s-a.s)[0].p;
   chosen.push({line:pick.id,star:2,items:[...original.items],assignment:role});
  }
  while(chosen.length<level){const pick=pool.filter(p=>!chosen.some(u=>u.line===p.id)).map(p=>({p,s:supportValue(chosen,p,r.target,r.goal,'meta')+(low.some(u=>u.line===p.id)?3:0)})).sort((a,b)=>b.s-a.s)[0].p;chosen.push({line:pick.id,star:2,items:[],assignment:'Support'});}
  r.progression.push({key:'L'+level,level,team:arrange(chosen),final:false,illustrative:true});
 }
 r.cap={key:'cap',level:9,team:add(r.team,r,9),afterDeadline:true};
}
write('progression-plans.json',plans);console.log(JSON.stringify({plans:plans.length,progression:plans.reduce((n,r)=>n+r.progression.length,0)}));
