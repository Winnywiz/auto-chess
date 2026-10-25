import {data,roster,meta,items,hash} from './native.mjs';
const FRONT=[31,30,32,29,33,28,34,38,37,39,36,40,35,41],BACK=[52,53,51,54,50,55,49,45,44,46,43,47,42,48];
export const clean=team=>team.map(u=>({...u,items:[...(u.items??[])]}));
export const fit=(u,id)=>roster[u.line].forms[u.star-1].itemFit.find(i=>i.id===id)?.score??0;
export const full=data.items.filter(i=>i.kind==='full').map(i=>i.id);
export const counts=team=>{const out={};for(const line of new Set(team.map(u=>u.line)))for(const t of roster[line].traits)out[t]=(out[t]??0)+1;return out;};
export const active=team=>Object.entries(counts(team)).flatMap(([t,n])=>{const tier=data.traits[t].thresholds.filter(v=>v<=n).length;return tier?[{t,n,tier,breakpoint:data.traits[t].thresholds[tier-1]}]:[];});
export const price=team=>team.reduce((n,u)=>n+roster[u.line].cost*3**(u.star-1),0);
export function arrange(team){
 const used=new Set();return clean(team).map(u=>{const candidates=roster[u.line].range<=2?FRONT:BACK;const cell=candidates.find(c=>!used.has(c));used.add(cell);return {...u,cell};});
}
const prior=new Map(meta.traits.filter(t=>t.onlyRules===35).map(t=>[t.type+'/'+t.level,Math.max(-1,Math.min(1,4.01-t.avg))]));
export const traitPrior=(t,n)=>prior.get(t.toLowerCase()+'/'+data.traits[t].thresholds.filter(x=>x<=n).length)??0;
const usage=new Map(meta.units.filter(u=>u.onlyRules===35).map(u=>[u.line,Math.max(-1,Math.min(1,4.01-u.avg))]));
export function supportValue(team,r,target,goal,flavor='balanced'){
 const before=counts(team),after={...before};for(const t of r.traits)after[t]=(after[t]??0)+1;
 const tanks=team.filter(u=>roster[u.line].role==='tank').length,front=team.filter(u=>roster[u.line].range<=2).length;
 let value=r.cost*.2+(usage.get(r.id)??0)*.5;
 if(r.traits.includes(target)&&(before[target]??0)<goal)value+=9;
 for(const t of r.traits){if((before[t]??0)>0)value+=.8;
  const a=data.traits[t].thresholds.filter(x=>x<=(before[t]??0)).length,b=data.traits[t].thresholds.filter(x=>x<=after[t]).length;
  if(b>a)value+=2.8+(flavor==='meta'?2.5:1)*traitPrior(t,after[t]);
 }
 if(r.role==='tank')value+=tanks===0?12:tanks<2?3:0;
 if(r.range<=2&&front<2)value+=2;
 if(r.role==='support')value+=team.some(u=>roster[u.line].role==='support')?-.5:1;
 if(flavor==='tempo')value+=(4-r.cost)*.45;
 return value;
}
export function equip(team,carry,{carryItems,tankItems,secondaryItem}={}){
 const out=clean(team).map(u=>({...u,items:[],assignment:'Support'})),c=out.find(u=>u.line===carry);if(!c)throw Error('Missing carry');
 const tank=out.filter(u=>u!==c&&['tank','fighter'].includes(roster[u.line].role)).sort((a,b)=>
  (roster[b.line].role==='tank')-(roster[a.line].role==='tank')||b.star-a.star||roster[b.line].cost-roster[a.line].cost)[0]??out.find(u=>u!==c);
 const secondary=out.filter(u=>u!==c&&u!==tank).sort((a,b)=>
  (['mage','marksman','assassin','fighter','special'].includes(roster[b.line].role))-(['mage','marksman','assassin','fighter','special'].includes(roster[a.line].role))||b.star-a.star||roster[b.line].cost-roster[a.line].cost)[0];
 const best=u=>[...full].sort((a,b)=>fit(u,b)-fit(u,a)||a.localeCompare(b));
 c.assignment='Carry';c.items=carryItems??best(c).slice(0,3);
 tank.assignment='Tank';tank.items=tankItems??best(tank).slice(0,3);
 secondary.assignment='Secondary';secondary.items=[secondaryItem??best(secondary)[0]];
 return arrange(out);
}
export function coherent(team,carry){
 const c=counts(team),connected=new Set([carry]);
 for(let pass=0;pass<team.length;pass++)for(const u of team)if(roster[u.line].traits.some(t=>c[t]>=data.traits[t].thresholds[0]&&team.some(v=>connected.has(v.line)&&roster[v.line].traits.includes(t))))connected.add(u.line);
 return team.every(u=>connected.has(u.line)||['tank','support'].includes(roster[u.line].role)||roster[u.line].traits.some(t=>data.traits[t].thresholds[0]===1));
}
export function candidates(){
 const out=[],seen=new Set(),lines=Object.values(roster),carries=lines.filter(r=>r.cost<=4&&r.role!=='support'&&r.id!=='eevee');
 for(const carry of carries){
  const levels=carry.cost===1?[5,6,7]:carry.cost===2?[6,7]:carry.cost===3?[7,8]:[8];
  for(const level of levels)for(const target of carry.traits.filter(t=>data.traits[t].thresholds[0]>1)){
   const pool=lines.filter(r=>r.id!==carry.id&&!r.branchOf&&r.id!=='eevee'&&r.cost<=(level<=7?3:4));
   const attainable=pool.filter(r=>r.traits.includes(target)).length+1;
   const goals=data.traits[target].thresholds.filter(n=>n<=Math.min(level,attainable));
   for(const goal of [...new Set([goals[0],goals.at(-1)])].filter(Boolean))for(const flavor of ['tempo','meta']){
    const team=[{line:carry.id,star:carry.cost<=3?3:2,items:[]}];
    while(team.length<level){
     const choices=pool.filter(r=>!team.some(u=>u.line===r.id)&&!(r.cost===4&&team.filter(u=>roster[u.line].cost===4).length>=(level===7?1:3)))
      .map(r=>({r,value:supportValue(team,r,target,goal,flavor)})).sort((a,b)=>b.value-a.value||a.r.id.localeCompare(b.r.id));
     const r=choices[0]?.r;if(!r)break;team.push({line:r.id,star:2,items:[]});
    }
    if(team.length!==level||(counts(team)[target]??0)<goal)continue;
    const extras=team.filter(u=>u.line!==carry.id&&roster[u.line].cost===carry.cost&&carry.cost<=3).sort((a,b)=>(roster[b.line].role==='tank')-(roster[a.line].role==='tank')||supportValue(team.filter(u=>u!==b),roster[b.line],target,goal,flavor)-supportValue(team.filter(u=>u!==a),roster[a.line],target,goal,flavor));
    const maxExtra=carry.cost===1?extras.length:carry.cost===2?Math.min(3,extras.length):carry.cost===3?Math.min(1,extras.length):0;
    const variants=[team];
    for(const template of variants)for(const carryStar of carry.cost===2||carry.cost===3?[2,3]:[carry.cost===1?3:2])for(let extra=0;extra<=(carryStar===2?0:maxExtra);extra++){
     const extraIds=new Set(extras.slice(0,extra).map(u=>u.line));
     const t=equip(template.map(u=>({...u,star:u.line===carry.id?carryStar:extraIds.has(u.line)?3:u.star})),carry.id);
     const key=JSON.stringify(t.map(u=>[u.line,u.star,u.items,u.cell]));if(seen.has(key)||!coherent(t,carry.id))continue;seen.add(key);
     const bp=data.traits[target].thresholds.filter(n=>n<=(counts(t)[target]??0)).at(-1);
     out.push({id:'v36-tempo-'+carry.id+'-'+hash(key).slice(0,6),carry:carry.id,target,goal:bp,level,
      name:carry.forms[carryStar-1].name+' / '+target+' '+bp,family:target.toLowerCase(),rollLevel:carry.cost<=3?carry.cost+4:null,carryStar,
      category:carry.cost<=3?'reroll-'+(carry.cost+4):'fast-8',strategy:carry.cost<=3?'Reroll '+(carry.cost+4):'Fast 8',flavor,extraTargets:extra,
      upgrades:t.filter(u=>u.star===3).map(u=>u.line),team:t});
    }
   }
  }
 }
 return out;
}
export function apiReferences(){
 const out=[],seen=new Set();
 const sources=meta.comps.filter(c=>c.n>=100&&c.units.filter(u=>Number.isFinite(u.share)&&roster[u.line]).length>=6).sort((a,b)=>b.n-a.n);
 for(const c of sources){
  const source=c.guide?.stages.find(s=>s.stage===4)?.units??c.units;
  const members=source.filter(u=>roster[u.line]&&Number.isFinite(u.share)).sort((a,b)=>b.share-a.share);
  const level=8,team=members.slice(0,level).map(u=>({line:u.line,star:roster[u.line].cost===5?1:Math.min(2,u.star??2),items:[]}));
  if(team.length<level)continue;
  const carry=c.units.filter(u=>team.some(v=>v.line===u.line)&&!['tank','support'].includes(roster[u.line].role)).sort((a,b)=>b.items.reduce((n,i)=>n+i.share,0)-a.items.reduce((n,i)=>n+i.share,0))[0]?.line;
  if(!carry)continue;
  const family=(c.name.trait??roster[carry].traits[0]).toLowerCase();
  if(out.filter(r=>r.family===family).length>=2)continue;
  const core=team.map(u=>u.line).sort().join(',');if(seen.has(core))continue;seen.add(core);
  let geared=equip(team,carry);
  for(const role of ['Carry','Tank','Secondary']){
   const u=geared.find(u=>u.assignment===role),observed=c.units.find(v=>v.line===u.line)?.items.filter(i=>items[i.id]?.kind==='full').sort((a,b)=>b.share-a.share)||[];
   if(observed.length){const count=role==='Secondary'?1:3;u.items=Array.from({length:count},(_,i)=>observed[Math.min(i,observed.length-1)].id);}
  }
  out.push({id:'api-52-'+out.length,source:c.id,samples:c.n,aggregateAverage:c.avg,family,carry,level,team:geared});
  if(out.length>=18)break;
 }
 return out;
}
