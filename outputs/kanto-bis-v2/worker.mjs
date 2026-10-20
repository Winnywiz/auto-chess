import {parentPort} from 'node:worker_threads';
import {runState} from './experiment.mjs';
parentPort.on('message',state=>{
  try{const result=runState(state,(stage,battles)=>parentPort.postMessage({type:'stage',stage,battles,line:state.line,star:state.star}));parentPort.postMessage({type:'result',result});}
  catch(error){parentPort.postMessage({type:'error',message:error.stack,line:state.line,star:state.star});}
});
