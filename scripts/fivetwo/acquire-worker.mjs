import {parentPort} from 'node:worker_threads';
import {simulate} from './acquire.mjs';
import {hashSeed} from './rules.mjs';
parentPort.on('message',({plan,seals,n,salt})=>{
 try{let hits=0;for(let i=0;i<n;i++)hits+=simulate(plan,{seed:hashSeed(`${salt}|${i}`),seals}).hit;parentPort.postMessage({value:hits/n});}
 catch(error){parentPort.postMessage({error:error.stack});}
});
