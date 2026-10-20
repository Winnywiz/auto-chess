import {createHash} from 'node:crypto';
globalThis.fetch=()=>{throw Error('Network disabled in headless harness');};
globalThis.WebSocket=class{constructor(){throw Error('WebSocket disabled');}};
Math.random=()=>{throw Error('Unseeded Math.random disabled');};
const native=await import('./assets/sim-DVnRY1Xk.js');native.E();
const locale=await import('./assets/i18n-CDsr9I4f.js');locale.b.setState({lang:'en'});
export const Battle=native.l;
export const sim={ct:native.Ct,pt:native.Ot,ft:native.Dt,dt:native.Et,lt:native.wt,Z:native._t,gt:native.Ft,i:native.i,g:native.v,d:native.d};
export const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function fight(setup,seed=123){const b=new Battle(setup.home,setup.away,seed,setup.weather??null);b.pvpClock=true;b.start();let steps=0;while(!b.over){b.step();if(++steps>15000)throw Error('Battle exceeded guard');}return b;}
export const battleDigest=b=>hash({winner:b.winner,time:b.time,rng:b.rngState,units:b.units,events:b.events});
