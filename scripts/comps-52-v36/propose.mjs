import {previous,write,roster,data,hash,clean,counts,equip,supportValue,coherent,scoreBoards} from './common.mjs';
const refs=previous('api-references.json'),old=previous('frozen.json').selected,plans=[],seen=new Set();
const add=r=>{const key=JSON.stringify(r.team.map(u=>[u.line,u.star,u.items,u.cell]));if(seen.has(key))return;seen.add(key);plans.push({...r,id:'v36-52-'+r.carry+'-'+hash([r.category,key]).slice(0,6)});};
for(const r of old)add({...r,options:[],conditional:null,priorId:r.id,category:'reroll-'+roster[r.carry].cost,strategy:'Reroll '+roster[r.carry].cost+'-cost'});
const three=[...previous('budget-candidates.json'),...previous('equipped-candidates.json')].filter(r=>roster[r.carry].cost===3&&r.level===7&&r.carryStar===3&&r.team.filter(u=>u.star===3).length===1&&r.team.filter(u=>roster[u.line].cost===3).length<=2).sort((a,b)=>(b.equipmentScreen?.carry??b.apiScore)-(a.equipmentScreen?.carry??a.apiScore));
const usedThree=new Set();for(const r of three){if(usedThree.has(r.carry))continue;usedThree.add(r.carry);add({...r,category:'reroll-3',strategy:'Reroll 3-cost',options:[],conditional:null,utilityStudy:{kind:'keep'}});if(usedThree.size===8)break;}
for(const carry of Object.values(roster).filter(r=>r.cost>=3&&r.cost<=4&&r.role!=='support'))for(const level of [7,8]){
 for(const target of carry.traits)for(const maximum of data.traits[target].thresholds.filter(n=>n<=level))for(const flavor of ['tempo','meta']){
  const team=[{line:carry.id,star:2,items:[]}];
  const pool=Object.values(roster).filter(r=>r.id!=='eevee'&&!r.branchOf&&r.id!==carry.id&&r.cost<=(level===7?3:4));
  while(team.length<level){const choices=pool.filter(p=>!team.some(u=>u.line===p.id)&&!(p.cost===4&&team.filter(u=>roster[u.line].cost===4).length>=2)&&!(p.cost===3&&team.filter(u=>roster[u.line].cost===3).length>=(level===7?3:4))).map(p=>({p,v:supportValue(team,p,target,maximum,flavor)-p.cost*.4})).sort((a,b)=>b.v-a.v);if(!choices.length)break;team.push({line:choices[0].p.id,star:2,items:[]});}
  if(team.length!==level||!coherent(team,carry.id))continue;
  const goal=data.traits[target].thresholds.filter(n=>n<=(counts(team)[target]??0)).at(-1)??0;
  const geared=equip(team,carry.id),physical=(carry.forms[1].skill.scale?.atk??0)>=(carry.forms[1].skill.scale?.spa??0),power=physical?'choice-band':'choice-specs';
  for(const gear of [null,[power,power,'focus-sash']])add({carry:carry.id,carryStar:2,target,goal,family:target.toLowerCase(),name:carry.forms[1].name+' / '+target+' '+goal,level,rollLevel:level,category:'fast-'+level,strategy:'Fast '+level,upgrades:[],team:gear?geared.map(u=>u.assignment==='Carry'?{...u,items:gear}:u):geared,flavor,utilityStudy:{kind:'keep'}});
 }
}
const scores=await scoreBoards(plans,refs,4,'v36-52-discovery','Fast 7 / Fast 8 and reroll screening');plans.forEach((r,i)=>r.screen=scores[i]);write('proposals.json',plans);write('references.json',refs);
const selected=plans.filter(r=>r.category.startsWith('reroll'));
for(const category of ['fast-7','fast-8']){const options=plans.filter(r=>r.category===category).sort((a,b)=>b.screen.referenceScore-a.screen.referenceScore);const carries=new Set();for(const r of options){if(carries.has(r.carry))continue;selected.push(r);carries.add(r.carry);if(carries.size===8)break;}for(const r of options.filter(r=>roster[r.carry].cost===3)){if(carries.has(r.carry))continue;selected.push(r);carries.add(r.carry);if([...carries].filter(id=>roster[id].cost===3).length>=4)break;}}
write('screen-plans.json',selected);console.log(JSON.stringify({proposals:plans.length,screen:selected.map(r=>[r.strategy,r.name,Math.round(r.screen.referenceScore*100)])}));
