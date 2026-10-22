// Build window.KANTO_DATA for the website from the Version 34 game modules.
import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import {route,roster as r,build,rules} from './headless.mjs';
const tidy=s=>String(s??'').replaceAll('—',' - ').replaceAll('–','-').replaceAll('·','/');
const en=s=>tidy(r.x(s,'en'));
const skill=m=>({...m,name:en(m.name),desc:en(m.desc),tag:en(m.tag),stars:undefined});
const engine=await readFile(new URL('./assets/engine-CzjBX4e_.js',import.meta.url),'utf8');
const begin=engine.indexOf('function D(e,t){return Ut('),end=engine.indexOf('}function ',engine.indexOf('default:return 1}',begin))+1;
if(begin<0||end<begin)throw Error('Native item fit functions not found');
const itemFit=vm.runInNewContext(`(()=>{${engine.slice(begin,end)};return D;})()`,{i:r.r,r:r.p,M:true,Ee:()=>null,xe:route.ii,me:route.bi,je:route.pi,f:route.Ko});
const D=route.Uo,parts=route.qo;
const constKey={'hp-up':'hpUp'};
const items=route.Vo.filter(x=>x.kind==='part'||x.kind==='full').map(x=>{
 const p=x.kind==='full'?parts[x.id]??[]:[],statsParts=['choice-band','choice-specs','choice-scarf'].includes(x.id)?[]:p,weights=[...statsParts,x.id];
 return {...x,name:en(x.name),short:en(x.short),tiny:en(x.tiny),parts:p,
 attackWeight:weights.reduce((n,k)=>n+(k==='protein'?D.protein:k==='choice-band'?D.bandBasic:0),0),
 specialWeight:weights.reduce((n,k)=>n+(k==='calcium'?D.calcium:k==='choice-specs'?D.specsAbility:0),0),
 axisWeights:Object.fromEntries(['atk','spa','def','spd','hp','as'].map(axis=>[axis,weights.reduce((n,k)=>n+(route.Vo.find(i=>i.id===k)?.stat===axis?(D[constKey[k]??k]??0):0),0)]))};
});
const lines=r.n.map(line=>({id:line.id,cost:line.cost,traits:line.traits,role:line.role,range:line.range,entry:line.entry,branchOf:line.branchOf??null,
 flex:line.flex?{stars:line.flex.stars,axes:line.flex.axes??['atk','spa'],def:line.flex.def,phys:[1,2,3].map(s=>skill(r.u(line.flex,'phys',s))),spec:[1,2,3].map(s=>skill(r.u(line.flex,'spec',s)))}:null,
 forms:[1,2,3].map(star=>{const f=r.g(line,star),d=route.Zr[f.num];return {star,num:f.num,name:d.name,shiny:f.shiny,types:d.types,stats:d.stats,skill:skill(r.p(line,star)),itemFit:items.filter(x=>x.kind==='full').map(item=>({id:item.id,score:itemFit(item.id,{line:line.id,star})}))};})}));
for(const line of lines)for(const f of line.forms)if(f.itemFit.some(x=>!Number.isFinite(x.score)))throw Error('Invalid native fit '+line.id);
const traits=Object.fromEntries(Object.entries(route.Io).map(([k,t])=>[k,{...t,desc:en(t.desc)}]));
const recipes=Object.fromEntries(Object.entries(route.Ko).map(([a,row])=>[a,{...row}]));
const old=JSON.parse(process.argv[2]?await readFile(process.argv[2],'utf8'):'{}');
const data={roster:lines,items,components:[...route.Go],recipes,traits,frames:old.frames??{},source:'https://einoow.com/kanto-tactics',build,rules:old.rules};
await writeFile(new URL('./data.json',import.meta.url),JSON.stringify(data));
console.log(JSON.stringify({lines:lines.length,items:items.length,finished:items.filter(x=>x.kind==='full').length,components:data.components.length}));
