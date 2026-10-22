// Version 34 headless harness (copied to work/native-v34 by scripts/native/download.py).
import {createHash} from 'node:crypto';
globalThis.fetch=()=>{throw Error('Network disabled in headless harness');};
globalThis.WebSocket=class{constructor(){throw Error('WebSocket disabled');}};
const realRandom=Math.random;
export const route=await import('./assets/route-k2DWeEO1.js');route.hi();
export const roster=await import('./assets/roster-BrG7EKy8.js');
Math.random=()=>{throw Error('Unseeded Math.random disabled');};
export const Battle=route.ni;
export const build='route-k2DWeEO1 / roster-BrG7EKy8';
export const rules=34;
export const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function fight(home,away,seed=123,weather=null){const b=new Battle(home,away,seed,weather);b.pvpClock=true;b.start();let steps=0;while(!b.over){b.step();if(++steps>15000)throw Error('Battle exceeded guard');}return b;}
// Score team A vs team B over seeds and both sides (team B mirrored onto the far half).
export function match(teamA,teamB,seeds){let points=0;for(const seed of seeds)for(let side=0;side<2;side++){const left=side?teamB:teamA,right=(side?teamA:teamB).map(u=>({...u,cell:55-u.cell}));const b=new Battle(left,right,seed,null);b.pvpClock=true;b.start();for(let s=0;!b.over&&s<1700;s++)b.step();if(!b.over)throw Error('Battle exceeded the PvP clock');points+=b.winner<0?.5:(b.winner===side?1:0);}return points/(seeds.length*2);}
