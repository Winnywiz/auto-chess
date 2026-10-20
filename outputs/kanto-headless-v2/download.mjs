import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base='https://einoow.com/playables/kanto-tactics/';
const html=await (await fetch(base)).text();
await mkdir(new URL('./assets/',import.meta.url),{recursive:true});
await writeFile(new URL('./entry.html',import.meta.url),html);
const queue=[...html.matchAll(/(?:src|href)=["']\.\/assets\/([\w.-]+\.js)["']/g)].map(m=>m[1]);
const seen=new Set(),assets=[];
while(queue.length){
 const name=queue.shift();if(seen.has(name))continue;seen.add(name);
 if(!/^[\w.-]+\.js$/.test(name))throw Error('Invalid public asset name');
 const url=base+'assets/'+name,r=await fetch(url);if(!r.ok)throw Error(r.status+' '+url);
 const body=await r.text();await writeFile(new URL('./assets/'+name,import.meta.url),body);
 assets.push({name,url,bytes:Buffer.byteLength(body),sha256:createHash('sha256').update(body).digest('hex')});
 for(const m of body.matchAll(/["'`]\.\/([\w.-]+\.js)["'`]/g))if(!seen.has(m[1]))queue.push(m[1]);
}
const names=Object.fromEntries(['sim','roster','engine','pvpNet'].map(key=>[key,assets.filter(x=>x.name.startsWith(key+'-')).map(x=>x.name)]));
await writeFile(new URL('./manifest.json',import.meta.url),JSON.stringify({base,downloadedAt:new Date().toISOString(),names,assets},null,2));
console.log(JSON.stringify({files:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),names}));
