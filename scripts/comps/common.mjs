// Shared composition helpers: roster data, traits, board value, references.
import fs from 'node:fs';
import {nativeRoot,workDir} from './pool.mjs';
export const data=JSON.parse(fs.readFileSync(new URL('data.json',nativeRoot)));
export const roster=Object.fromEntries(data.roster.map(r=>[r.id,r]));
export const traitRules=data.traits;
export const copies=star=>star===3?9:star===2?3:1;
export const boardValue=team=>team.reduce((s,u)=>s+roster[u.line].cost*copies(u.star),0);
export function traitCounts(team){const seen=new Set(),c={};for(const u of team){if(seen.has(u.line))continue;seen.add(u.line);for(const t of roster[u.line].traits)c[t]=(c[t]??0)+1;}return c;}
export function activeTraits(team){const c=traitCounts(team);return Object.entries(c).map(([t,n])=>({t,n,tier:traitRules[t].thresholds.filter(x=>n>=x).length})).filter(x=>x.tier>0);}
export const front=line=>roster[line].range<=2;
export function readPage(){
  const html=fs.readFileSync(new URL('../../compositions.html',import.meta.url),'utf8');
  const get=k=>JSON.parse(html.match(new RegExp(`window\\.${k}=(\\{[^\\n]*\\});`))[1]);
  return {html,comps:get('KANTO_COMPS'),guides:get('KANTO_GUIDES'),bis:get('KANTO_BIS')};
}
export const itemCount=team=>team.reduce((s,u)=>s+(u.items?.length??0),0);
export function capItems(team,cap=6){
  // Keep items on the strongest holders first (most items, then highest cost).
  const order=team.map((u,i)=>({i,n:u.items?.length??0,cost:roster[u.line].cost})).sort((a,b)=>b.n-a.n||b.cost-a.cost||a.i-b.i);
  let left=cap;const out=team.map(u=>({...u,items:[...(u.items??[])]}));
  for(const o of order){const u=out[o.i];u.items=u.items.slice(0,Math.max(0,left));left-=u.items.length;}
  return out;
}
export const seedList=(n,salt)=>Array.from({length:n},(_,i)=>{let h=2166136261;for(const ch of `${salt}/${i}`)h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;});
export function writeJSON(name,value){fs.mkdirSync(workDir,{recursive:true});fs.writeFileSync(new URL(name,workDir),JSON.stringify(value,null,1));}
export function readJSON(name){return JSON.parse(fs.readFileSync(new URL(name,workDir)));}
