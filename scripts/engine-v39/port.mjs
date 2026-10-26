// Archive the official, signature-verified v39 data for network-free runtime verification.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
const root=new URL('../../work/native-v39/',import.meta.url);
const sha=x=>createHash('sha256').update(x).digest('hex');
const manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',root)));
if(manifest.source!=='https://einoow.com/playables/kanto-tactics/')throw Error('Unexpected source');
const files=manifest.files;
for(const [name,h]of Object.entries(files))assert.equal(sha(fs.readFileSync(new URL('assets/'+name,root))),h,name);
const one=prefix=>{const a=Object.keys(files).filter(n=>n.startsWith(prefix+'-')&&n.endsWith('.js'));assert.equal(a.length,1,prefix);return a[0];};
const names=Object.fromEntries(['engine','route','roster','shop','elite','start','content','pvpMode','pvpSource'].map(n=>[n,one(n)]));
const engineText=fs.readFileSync(new URL('assets/'+names.engine,root),'utf8');
const core=[...engineText.matchAll(/from["']\.\/(pvpNet-[^"']+\.js)["']/g)].map(m=>m[1]);assert.equal(core.length,1);names.core=core[0];
// Combat-only port: planner bindings are not needed.
const bindings={};
let start=fs.readFileSync(new URL('assets/'+names.start,root),'utf8');
for(const [find,to]of [[/import\{n as (\w+)\}from'\.\/rolldown-runtime-[^']+';/,(m,q)=>'const '+q+'=(fn)=>{let done=false,value;return ()=>{if(!done){done=true;value=fn()}return value}};'],[/export\{[^}]+\};?\s*$/,''],[/function T\((\w+)\)\{\(\(async\(\)=>\{/,(m,a)=>'function T('+a+'){return ((async()=>{']]){const before=start;start=start.replace(find,to);assert.notEqual(start,before,'Verifier interface changed');}
let raw,bootURL;
const bootFile=new URL('boot.txt',root);
if(fs.existsSync(bootFile))raw=fs.readFileSync(bootFile,'utf8');
const signedTime=raw?JSON.parse(raw.split('\n')[1]).iat:null;
class ArchiveDate extends Date{static now(){return signedTime??Date.now();}}
const location=new URL(manifest.source);
const box={module:{exports:{}},URL,URLSearchParams,TextDecoder,TextEncoder,Uint8Array,atob,btoa,setTimeout,clearTimeout,performance,Date:ArchiveDate,location,window:{},document:{location},crypto:webcrypto,localStorage:{getItem:()=>null,setItem:()=>{}},fetch:async(url,options)=>{bootURL=String(url);console.log('Official bootstrap request',bootURL);if(raw)return{status:200,text:async()=>raw};const response=await fetch(url,{...options,headers:{...options?.headers,Origin:'https://einoow.com',Referer:manifest.source}});assert.equal(response.status,200,'Official bootstrap request');raw=await response.text();fs.writeFileSync(bootFile,raw);return{status:200,text:async()=>raw};}};
vm.runInNewContext(start+'\nmodule.exports={init:j,start:T,parts:()=>p};',box,{timeout:5000});
box.module.exports.init();await box.module.exports.start(async()=>{});
const parts=box.module.exports.parts();assert(parts?.tower&&parts?.advKanto,'Official verification failed');
const header=JSON.parse(raw.split('\n')[1]);assert.equal(header.o,'https://einoow.com');
const symbols={};
const copies=[['headless-template.mjs','headless.mjs'],['bootstrap-template.mjs','offline-bootstrap.mjs'],['extract-template.mjs','extract-data.mjs']];
const adapters=Object.fromEntries(copies.map(([source,target])=>[target,sha(fs.readFileSync(new URL(source,import.meta.url)))]));
const port={version:39,source:manifest.source,names,symbols,bindings,files,adapters,bootstrapURL:bootURL,bootstrapHeader:header,bootstrapSHA256:sha(raw),bootstrapSignatureVerified:true,preparedAt:new Date().toISOString()};
port.engineFingerprint=sha(JSON.stringify({files,bootstrapSHA256:port.bootstrapSHA256,symbols,bindings,adapters}));
fs.writeFileSync(new URL('offline-port.json',root),JSON.stringify(port,null,2));
for(const [source,target]of copies)fs.copyFileSync(new URL(source,import.meta.url),new URL(target,root));
const adapter=await import(new URL('offline-bootstrap.mjs',root));for(const key of Object.keys(parts))assert.deepStrictEqual(adapter.part(key),structuredClone(parts[key]),key);
port.bootstrapDecoderParity=true;fs.writeFileSync(new URL('offline-port.json',root),JSON.stringify(port,null,2));
console.log(JSON.stringify({version:39,modules:Object.keys(files).length,identity:port.engineFingerprint}));
