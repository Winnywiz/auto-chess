import fs from 'node:fs';
import {score} from './search.mjs';
export function itemDifference(a,b){const copy=[...a];let same=0;for(const id of b){const i=copy.indexOf(id);if(i>=0){same++;copy.splice(i,1);}}return 3-same;}
export async function repairAlternatives(file){
 const data=JSON.parse(fs.readFileSync(file));let repaired=0;
 for(const c of data.comps)for(const v of c.variants){
  if(!v.alt||itemDifference(v.items.carry,v.alt.items)>=2)continue;
  const alternative=v.items.rankedCarry.find(x=>itemDifference(v.items.carry,x.items)>=2&&x.items.filter(i=>i==='focus-sash').length<=1)?.items;
  if(alternative){
   const team=v.team.map(u=>u.line===c.line?{...u,items:alternative}:u);
   const result=(await score([team],{nSeeds:12,salt:'items16|'+c.line,s3:true}))[0];
   v.alt={items:alternative,score:result.score,s4:result.s4};v.items.alt=alternative;
  }else{v.alt=null;v.items.alt=null;}
  repaired++;
 }
 if(repaired)fs.writeFileSync(file,JSON.stringify(data));
 return repaired;
}
