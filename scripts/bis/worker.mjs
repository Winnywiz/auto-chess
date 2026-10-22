import {parentPort} from 'node:worker_threads';
import {runState} from './experiment.mjs';
parentPort.on('message',state=>{try{parentPort.postMessage({type:'result',result:runState(state,(stage,battles)=>parentPort.postMessage({type:'stage',battles}))});}catch(error){parentPort.postMessage({type:'error',message:error.stack});}});
