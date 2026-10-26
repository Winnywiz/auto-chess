import {simulate} from './battle-core.js';
const runtimes=new Map();
function runtime(version){
 if(![36,37,38,39].includes(version))throw Error('Unsupported simulator version.');
 if(!runtimes.has(version))runtimes.set(version,Promise.all([
  import(`./engine-v${version}.js`),
  fetch(new URL(`data-v${version}.json`,import.meta.url)).then(r=>{if(!r.ok)throw Error('Could not load combat data.');return r.json();})
 ]).then(([engine,data])=>{if(engine.rules!==data.rules||engine.identity!==data.identity)throw Error('Combat engine and data versions differ.');return [engine,data];}));
 return runtimes.get(version);
}
self.onmessage=async({data:message})=>{
 try{const [engine,data]=await runtime(message.request.rules);const result=simulate(engine,data,message.request,(done,total)=>self.postMessage({id:message.id,progress:{done,total}}));self.postMessage({id:message.id,result});}
 catch(error){self.postMessage({id:message.id,error:error.message||'Could not simulate this fight.'});}
};
