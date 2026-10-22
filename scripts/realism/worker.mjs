import {parentPort} from 'node:worker_threads';
import {episode} from './episode.mjs';
import {shopTrial} from './shop.mjs';
parentPort.on('message',job=>{try{
  const results=job.seeds.map(seed=>job.type==='shop'?shopTrial(job.condition,seed):episode(job.row,seed,job.options));
  parentPort.postMessage({key:job.key,results});
}catch(e){parentPort.postMessage({error:e.stack,key:job.key});}});
