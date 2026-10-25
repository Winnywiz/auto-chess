import path from 'node:path';
process.env.KANTO_NATIVE_ROOT=path.resolve('work/native-v36');process.env.KANTO_COMPS_WORKDIR=path.resolve('work/comps-tempo-v36');process.env.KANTO_WORKERS??='8';
import {read,write,H,roster,mean} from './native.mjs';
import {arrange} from './boards.mjs';
const {scorePairs}=await import('../comps/pool.mjs');
const rows=read('utility-selected.json'),refs=read('api-references.json'),tests=[];
// These are diagnostics only. No rare utility is made mandatory in a reroll board.
const utilities=Object.values(roster).filter(p=>p.id!=='eevee'&&!p.branchOf&&(p.role==='support'||p.traits.includes('Ghost')||p.traits.includes('Dragon')));
for(const r of rows){
 tests.push({id:r.id,kind:'keep',team:r.team});
 const out=r.team.filter(u=>!u.items.length&&u.star===2).sort((a,b)=>roster[b.line].cost-roster[a.line].cost)[0];if(!out)continue;
 for(const p of utilities.filter(p=>p.cost<=4&&!r.team.some(u=>u.line===p.id))){
  tests.push({id:r.id,kind:roster[p.id].cost===4?'rare-utility':'affordable-utility',out:out.line,in:p.id,team:arrange(r.team.map(u=>u===out?{...u,line:p.id,star:2}:u))});
 }
}
const seeds=Array.from({length:12},(_,i)=>parseInt(H.hash(['v36-passive-diagnostic',i]).slice(0,8),16));
const scores=await scorePairs(tests.flatMap(c=>refs.map(ref=>({a:c.team,b:ref.team}))),seeds,{label:'Ghost Dragon and support diagnostics'});
tests.forEach((c,i)=>{const f={};refs.forEach((r,j)=>(f[r.family]??=[]).push(scores[i*refs.length+j]));c.score=mean(Object.values(f).map(mean));});
const result=tests.filter(c=>c.kind!=='keep').map(({team,...t})=>({...t,baseline:tests.find(c=>c.id===t.id&&c.kind==='keep').score}));
write('passive-diagnostics.json',{engine:H.identity,seeds,method:'One unitemized 2-star support slot substituted at equal level and seven items. Twelve seeds on both sides against all API references. Rare 4-cost upgrades are assumed already held in this diagnostic, not forced or made part of a main reroll board.',results:result});
console.log(JSON.stringify(result.map(r=>[r.id,r.in,Math.round((r.score-r.baseline)*100)])));
