// Exact carry-line trials for the public guidance. Keep conditional assumptions in the export.
import fs from 'node:fs';
import {jobs} from './pool.mjs';
import {roster,identity} from './native.mjs';
const html=fs.readFileSync('compositions.html','utf8');
const comps=JSON.parse(html.match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const conditions=new Map();
for(const r of comps.rows){
  const cost=roster[r.carry].cost;
  const goal=r.rollLevel?9:3;
  for(const level of r.rollLevel?[r.rollLevel]:[8,9])for(const owned of goal===9?[6,8]:[1,2])for(const taken of [0,6]){
    const c={line:r.carry,cost,level,gold:40,owned,taken,goal};
    conditions.set(JSON.stringify(c),c);
  }
}
const out=await jobs([...conditions].map(([key,condition])=>({type:'shop',key,condition,seeds:Array.from({length:512},(_,i)=>`realism-shop-v1/${i}`)})),{directory:'work/realism-v34/site-odds'});
const rows=out.map(({job,results})=>{const hits=results.filter(x=>x.hit).length,n=results.length,p=hits/n,z=1.96,d=1+z*z/n,m=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return {...job.condition,n,hits,rate:p,interval:[m-h,m+h]};});
fs.writeFileSync('work/realism-v34/site-odds.json',JSON.stringify({identity,rows}));
console.log(JSON.stringify({conditions:rows.length,trials:rows.length*512}));
