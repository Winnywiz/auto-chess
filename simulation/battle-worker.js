import * as engine from './engine-v36.js';
import {simulate} from './battle-core.js';
const data=fetch(new URL('data-v36.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Could not load combat data.');return r.json();});
self.onmessage=async({data:message})=>{
 try{const result=simulate(engine,await data,message.request,(done,total)=>self.postMessage({id:message.id,progress:{done,total}}));self.postMessage({id:message.id,result});}
 catch(error){self.postMessage({id:message.id,error:error.message||'Could not simulate this fight.'});}
};
