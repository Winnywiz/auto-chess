// Version 36 offline research entry point. Original asset files remain unchanged.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
const root=new URL('./',import.meta.url);
const port=JSON.parse(fs.readFileSync(new URL('offline-port.json',root)));
const sha=x=>createHash('sha256').update(x).digest('hex');
if(port.version!==36||!port.bootstrapDecoderParity)throw Error('Incomplete v36 port');
for(const [file,digest] of Object.entries(port.adapters))if(sha(fs.readFileSync(new URL(file,root)))!==digest)throw Error('Offline adapter changed: '+file);
for(const [file,digest] of Object.entries(port.files))if(sha(fs.readFileSync(new URL('assets/'+file,root)))!==digest)throw Error('Native snapshot changed: '+file);
const asset=role=>new URL('assets/'+port.names[role],root).href;
const bootstrap=new URL('offline-bootstrap.mjs',root).href;
const hook=registerHooks({load(url,context,nextLoad){
  if(url===asset('start'))return{format:'module',shortCircuit:true,source:`export {part as a,offlineBoot as i,init as n,init as o,init as r,init as t} from ${JSON.stringify(bootstrap)};`};
  if(url===asset('engine')){
    const source=fs.readFileSync(new URL(url),'utf8');
    return{format:'module',shortCircuit:true,source:source+'\nexport{'+Object.entries(port.symbols).map(([role,name])=>name+' as '+role).join(',')+'};\n'};
  }
  return nextLoad(url,context);
}});
export const networkAttempts=[];
globalThis.fetch=(url)=>{networkAttempts.push(String(url));throw Error('Network disabled in offline v36 research');};
globalThis.WebSocket=class{constructor(){networkAttempts.push('WebSocket');throw Error('WebSocket disabled in offline v36 research');}};
Object.defineProperty(globalThis,'navigator',{value:{language:'en',languages:['en']},configurable:true});
export const engine=await import(asset('engine'));
engine.a();
export const route=await import(asset('route'));
export const roster=await import(asset('roster'));
export const shop=await import(asset('shop'));
export const core=await import(asset('core'));
export const elite=await import(asset('elite'));
export const planner={decide:engine.decide,makeBot:engine.makeBot,feedback:engine.feedback,chooseOffer:engine.chooseOffer,carouselPick:engine.carouselPick};
export const shopContext=(g,id=g.st.me)=>shop[port.bindings.shopContext](g.st.m.t,id);
export const planningContext=g=>core[port.bindings.planningContext](g.st.m);
export const scout=(g,id=g.st.me)=>elite[port.bindings.scout](g.st.m.t,id);
export const LocalMatch=engine.r;
const battleCandidates=Object.values(route).filter(x=>typeof x==='function'&&x.prototype?.start&&x.prototype?.step);
if(battleCandidates.length!==1)throw Error('Cannot uniquely identify native Battle');
export const Battle=battleCandidates[0];
hook.deregister();
Math.random=()=>{throw Error('Unseeded Math.random disabled in offline v36 research');};
export const rules=36;
export const build=port.names.route+' / '+port.names.roster;
export const identity=port.engineFingerprint;
export const hash=x=>sha(JSON.stringify(x));
export function fight(home,away,seed=123,weather=null){const b=new Battle(home,away,seed,weather);b.pvpClock=true;b.start();let steps=0;while(!b.over){b.step();if(++steps>15000)throw Error('Battle exceeded guard');}return b;}
export function match(teamA,teamB,seeds){let points=0;for(const seed of seeds)for(let side=0;side<2;side++){const left=side?teamB:teamA,right=(side?teamA:teamB).map(u=>({...u,cell:55-u.cell}));const b=fight(left,right,seed);points+=b.winner<0?.5:(b.winner===side?1:0);}return points/(seeds.length*2);}
