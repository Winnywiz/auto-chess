// Turn work/bis-v4/results.json into window.KANTO_BIS for the builder and composition pages.
// The recommended build is the better of the frozen validation leader and runner-up over all of their
// combined validation and confirmation battles (896 each). Validation selected the finalists,
// so the pooled score is not an independent held-out estimate.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url);
const input=JSON.parse(fs.readFileSync(new URL('work/bis-v4/results.json',root)));
const pooled=(v,c)=>({wins:v.wins+c.wins,draws:v.draws+c.draws,losses:v.losses+c.losses,n:v.n+c.n,get score(){return (this.wins+this.draws/2)/this.n;}});
const states={};let flipped=0;
for(const r of input.results){
  const L=pooled(r.validation.leader,r.confirmation.leader),R=pooled(r.validation.runner,r.confirmation.runner);
  const leaderWins=L.score>=R.score,pick=leaderWins?L:R,alt=leaderWins?R:L;
  const pickItems=(leaderWins?r.frozenLeader:r.frozenRunner).split('|'),altItems=(leaderWins?r.frozenRunner:r.frozenLeader).split('|');
  if(!leaderWins)flipped++;
  const cmp=r.confirmation.comparison,pc=leaderWins?r.confirmation.leader:r.confirmation.runner,ac=leaderWins?r.confirmation.runner:r.confirmation.leader;
  const gap=pc.score-ac.score,ci=leaderWins?[cmp.low,cmp.high]:[-cmp.high,-cmp.low];
  states[r.line+':'+r.star]={line:r.line,star:r.star,name:r.name,items:pickItems,score:pick.score,wins:pick.wins,draws:pick.draws,losses:pick.losses,battles:pick.n,
    validationScore:(leaderWins?r.validation.leader:r.validation.runner).score,validationBattles:r.validation.leader.n,
    confirmationScore:pc.score,confirmationBattles:pc.n,
    alternative:{items:altItems,score:alt.score,confirmationScore:ac.score,confirmationBattles:ac.n},
    confidence:ci[0]>0?'lead':ci[1]<0?'alternative':'close',gap,pooledGap:pick.score-alt.score,interval:ci,intervalSource:'confirmation-only; paired seed blocks',
    native:{items:r.nativeItems,score:r.confirmation.native.score,battles:r.confirmation.native.n},noItems:r.confirmation.empty.score,noItemsBattles:r.confirmation.empty.n};
}
const result={build:input.engineBuild,rules:34,method:'Every three-item build screened in 6v6 battles. Recommendations use pooled validation (384 battles, used for selection) and confirmation (512 battles) scores. Gaps and intervals use confirmation only. Pooled scores are selection-dependent, not independent held-out estimates.',states,digest:createHash('sha256').update(JSON.stringify(states)).digest('hex')};
const blob='window.KANTO_BIS='+JSON.stringify(result)+';';
for(const name of ['builder.html','compositions.html']){
  const p=new URL(name,root);let html=fs.readFileSync(p,'utf8');
  const before=html.length;html=html.replace(/window\.KANTO_BIS=\{[^\n]*\};/,()=>blob);
  if(html.length===before&&!html.includes(blob))throw Error('KANTO_BIS not found in '+name);
  fs.writeFileSync(p,html);
}
console.log(JSON.stringify({states:Object.keys(states).length,runnerPromoted:flipped,lead:Object.values(states).filter(s=>s.confidence==='lead').length}));
