import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('./dist/media/',import.meta.url),data=JSON.parse(await readFile(new URL('./data.json',import.meta.url),'utf8'));
const base='https://einoow.com/playables/kanto-tactics/pk/';
const tasks=new Map();
for(const line of data.roster)for(const form of line.forms){
  tasks.set(`icons/${form.num}.png`,base+`icons/${form.num}.png`);
  tasks.set(`sprites/${form.shiny?'shiny-':''}${form.num}.gif`,base+`sd/${form.shiny?'shiny/':''}${form.num}.gif`);
  if(data.frames[`${form.shiny?'shiny-':''}${form.num}`])tasks.set(`frames/${form.shiny?'shiny-':''}${form.num}.png`,base+`anim/front${form.shiny?'-shiny':''}/${form.num}.png`);
}
for(const trait of Object.keys(data.traits))tasks.set(`types/${trait.toLowerCase()}.png`,base+`types/${trait.toLowerCase()}-g.png`);
for(const item of data.items)tasks.set(`items/${item.id}.png`,base+`items/${item.id}.png`);
const queue=[...tasks],manifest=[];let done=0;
async function worker(){while(queue.length){const [path,url]=queue.shift();const dest=new URL(path,root);await mkdir(new URL('./',dest),{recursive:true});let bytes;
  try{bytes=await readFile(dest);}catch{const res=await fetch(url);if(!res.ok)throw new Error(res.status+' '+url);if((res.headers.get('content-type')??'').includes('text/html'))throw new Error('HTML instead of image '+url);bytes=Buffer.from(await res.arrayBuffer());await writeFile(dest,bytes);}
  manifest.push({path,url,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});done++;if(done%50===0)console.log(`Images ${done}/${tasks.size}`);
  await new Promise(r=>setTimeout(r,70));
}}
await Promise.all([worker(),worker(),worker()]);
await writeFile(new URL('./art-manifest.json',import.meta.url),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({files:manifest.length,bytes:manifest.reduce((n,x)=>n+x.bytes,0)}));
