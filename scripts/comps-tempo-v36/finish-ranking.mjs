// Keep the deadline ranking sensitive to missed upgrades, rather than ranking perfect caps.
import {read,write,H} from './native.mjs';
const frozen=read('frozen.json'),confirmation=read('confirmation.json'),budgets=read('conditional-confirmation.json');
for(const r of frozen.selected){
 const c=confirmation.combat[r.id].finish,q=budgets.results.find(b=>b.id===r.id);
 if(!q)throw Error('Missing fresh conditional budget '+r.id);
 const fallback=r.options.filter(o=>['low-roll','item-pivot','frontline'].includes(o.key)).map(o=>({key:o.key,score:confirmation.combat[r.id][o.key].referenceScore})).sort((a,b)=>b.score-a.score)[0];
 if(!fallback)throw Error('Missing independently scored low-roll board');
 c.finishScore=q.rate*c.referenceScore+(1-q.rate)*fallback.score;c.fullCombatScore??=c.score;c.score=c.finishScore;
 c.tier=c.finishScore>=.65?'S':c.finishScore>=.5?'A':'B';
 c.finishFallback=fallback.key;
}
confirmation.method='Finish score combines the full-board and best same-item low-roll combat results, weighted by a separately simulated conditional upgrade budget. Commit only from the stated early copy lead and upgraded core. Full-board combat uses 32 fresh seeds, both sides, 18 family-balanced reconstructed API opponents, seven items and no Seals/weather. These are conditional forecasts, not ranked win rates or unconditional completion probabilities.';
write('confirmation.json',confirmation);
console.log(JSON.stringify(frozen.selected.map(r=>[r.name,confirmation.combat[r.id].finish.tier,Math.round(confirmation.combat[r.id].finish.finishScore*100)])));
