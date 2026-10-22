// Turn work/bis-v4/results.json into window.KANTO_BIS for the builder and composition pages.
// The recommended build is the better of the frozen validation leader and runner-up over all of their
// held-out battles (validation plus confirmation, 896 each).
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
  const cmp=r.confirmation.comparison,gap=pick.score-alt.score,ci=leaderWins?[cmp.low,cmp.high]:[-cmp.high,-cmp.low];
  states[r.line+':'+r.star]={line:r.line,star:r.star,name:r.name,items:pickItems,score:pick.score,wins:pick.wins,draws:pick.draws,losses:pick.losses,battles:pick.n,
    alternative:{items:altItems,score:alt.score},confidence:ci[0]>0?'lead':'close',gap,interval:ci,
    native:{items:r.nativeItems,score:r.confirmation.native.score},noItems:r.confirmation.empty.score};
}
const result={build:input.engineBuild,rules:34,method:'Every three-item build screened in 6v6 battles; finalists checked on unseen lineups and seeds; recommendation is the better finalist over 896 held-out battles.',states,digest:createHash('sha256').update(JSON.stringify(states)).digest('hex')};
const blob='window.KANTO_BIS='+JSON.stringify(result)+';';
for(const name of ['builder.html','compositions.html']){
  const p=new URL(name,root);let html=fs.readFileSync(p,'utf8');
  const before=html.length;html=html.replace(/window\.KANTO_BIS=\{[^\n]*\};/,()=>blob);
  if(html.length===before&&!html.includes(blob))throw Error('KANTO_BIS not found in '+name);
  fs.writeFileSync(p,html);
}
console.log(JSON.stringify({states:Object.keys(states).length,runnerPromoted:flipped,lead:Object.values(states).filter(s=>s.confidence==='lead').length}));
