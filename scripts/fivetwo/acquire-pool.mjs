import {Worker} from 'node:worker_threads';
import os from 'node:os';
let pool;
export function acquisitionPool(){
 if(pool)return pool;
 const workers=Array.from({length:Math.max(1,Math.min(os.availableParallelism(),Number(process.env.KANTO_WORKERS??2)))},()=>new Worker(new URL('./acquire-worker.mjs',import.meta.url)));
 const queue=[],busy=new Map();
 const pump=w=>{const next=queue.shift();if(!next){busy.delete(w);return;}busy.set(w,next);w.postMessage(next.job);};
 for(const w of workers){w.on('message',message=>{const task=busy.get(w);if(message.error)task.reject(Error(message.error));else task.resolve(message.value);pump(w);});w.on('error',error=>{busy.get(w)?.reject(error);for(const task of queue.splice(0))task.reject(error);});}
 pool={run(job){return new Promise((resolve,reject)=>{queue.push({job,resolve,reject});for(const w of workers)if(!busy.has(w)){pump(w);break;}});},close(){for(const w of workers)w.terminate();pool=null;}};
 return pool;
}
