// Evaluate every observed legal realized outcome, preserving the original capped estimate.
import fs from 'node:fs';
import {OUT,isMain} from './paths.mjs';
import {family,startPool} from './combat.mjs';
import {score} from './search.mjs';
import {realizedScore} from './realized.mjs';
import {minimumFormStar} from './forms.mjs';
export async function calibrate(file,{affectedOnly=false}={}){
 const analysis=JSON.parse(fs.readFileSync(file));startPool();
 for(const c of analysis.comps)for(let i=0;i<c.variants.length;i++){
  const v=c.variants[i];if(v.completeRealized&&v.realizedVersion===2)continue;
  if(affectedOnly&&v.completeRealized&&v.team.every(u=>minimumFormStar(u.line)===1)){v.realizedVersion=2;continue;}
  if(!v.realizedPlan)throw Error('A recorded acquisition plan is required');
  const real=await realizedScore(v.team,v.realizedPlan,score,{n:200,max:200,cover:1,nSeeds:3,salt:'real-confirm-v37|'+family(c.line)+'|'+c.strat});
  if(Math.abs(real.covered-1)>1e-12)throw Error('Realized distribution remains incomplete');
  v.cappedRealized??=v.realized;v.realized=real;v.expected=real.expected;v.completeRealized=true;v.realizedVersion=2;
  fs.writeFileSync(file,JSON.stringify(analysis));console.log(new Date().toISOString(),c.line,c.strat,i,'complete legal-outcome combat score',real.expected.toFixed(4));
 }
 analysis.realizedMethod='All observed outcome patterns from 200 simulated games; native form unlocks respected; none dropped. Original capped estimates retained privately.';
 fs.writeFileSync(file,JSON.stringify(analysis));
}
if(isMain(import.meta.url)){await calibrate(new URL('analysis.json',OUT),{affectedOnly:process.argv.includes('--affected-only')});process.exit(0);}
