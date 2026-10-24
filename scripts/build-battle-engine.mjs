// Package the pinned combat entry point only. No login, sockets or native planner.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=path.resolve('work/native-v35'),out=path.resolve('simulation');
const port=JSON.parse(fs.readFileSync(path.join(root,'offline-port.json')));
const hash=x=>createHash('sha256').update(x).digest('hex');
if(port.version!==35||!port.bootstrapSignatureVerified||!port.bootstrapDecoderParity)throw Error('Verified v35 snapshot required');
for(const [file,h]of Object.entries(port.files))if(hash(fs.readFileSync(path.join(root,'assets',file)))!==h)throw Error('Changed native module: '+file);
const raw=fs.readFileSync(path.join(root,'boot.txt'),'utf8');
if(hash(raw)!==port.bootstrapSHA256)throw Error('Changed archived data');
const body=raw.slice(raw.indexOf('\n',raw.indexOf('\n')+1)+1);
const adapter=fs.readFileSync(path.join(root,'offline-bootstrap.mjs'),'utf8');
const decoder=adapter.slice(adapter.indexOf('const references=[];'),adapter.indexOf('const parts=decode('));
const shim=decoder+`const parts=decode(${body}).parts;export const a=name=>{if(!Object.hasOwn(parts,name))throw Error('Unknown game data');return parts[name]};export const n=()=>{},o=n,i=n,r=n,t=n;`;
const {build,version}=await import('../work/battle-tools/node_modules/esbuild/lib/main.js');
fs.mkdirSync(out,{recursive:true});
const result=await build({stdin:{contents:`import{wi as init,ui as Battle,Ds as effectiveness}from './${port.names.route}';import{x as translate}from './${port.names.roster}';init();export{Battle,effectiveness,translate};export const rules=35,identity=${JSON.stringify(port.engineFingerprint)};`,resolveDir:path.join(root,'assets'),sourcefile:'combat-entry.js'},
 bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'inline',metafile:true,write:false,
 plugins:[{name:'combat-only',setup(b){
  b.onLoad({filter:/start-[^/\\]+\.js$/},()=>({contents:shim,loader:'js'}));
  // The combat roster imports this for lazy language screens, never combat.
  b.onLoad({filter:/core-[^/\\]+\.js$/},()=>({contents:'export const n=(f)=>f();export const r=()=>{};',loader:'js'}));
  b.onLoad({filter:/lang-[^/\\]+\.js$/},()=>({contents:"export const c=x=>x,i=()=>{},l=()=>{},r=()=>'en',t=['es','en'];export function u(f){return f?f({lang:'en'}):{lang:'en'}};u.getState=()=>({lang:'en'});u.subscribe=()=>()=>{};",loader:'js'}));
  // Optional translation packs are excluded; English is already in the roster.
  b.onResolve({filter:/^\.\/(pt|ja|fr|zh|ru|de|it|vi|id|th|tr|pl|ko|content|apply)-/},a=>({path:a.path,external:true}));
 }}]});
const bytes=result.outputFiles[0].contents;
fs.writeFileSync(path.join(out,'engine-v35.js'),bytes);
const original=JSON.parse(fs.readFileSync(path.join(root,'data.json')));
const data={rules:35,identity:port.engineFingerprint,roster:original.roster.map(({flex,...r})=>({...r,forms:r.forms.map(({itemFit,...f})=>f)})),items:original.items.filter(i=>i.kind!=='tool'),traits:original.traits};
const combat=await import(pathToFileURL(path.join(out,'engine-v35.js')));
data.typeChart=Object.fromEntries(Object.keys(data.traits).map(a=>[a,Object.fromEntries(Object.keys(data.traits).map(b=>[b,combat.effectiveness(a,[b])]))]));
fs.writeFileSync(path.join(out,'data-v35.json'),JSON.stringify(data));
const inputs=Object.keys(result.metafile.inputs).filter(x=>x!=='combat-entry.js').map(x=>path.basename(x));
fs.writeFileSync(path.join(out,'provenance.json'),JSON.stringify({rules:35,identity:port.engineFingerprint,source:'https://einoow.com/playables/kanto-tactics/',attribution:'Kanto Tactics combat engine © 2026 Einoow. Original copyright notices retained.',bundler:'esbuild '+version,engineSHA256:hash(bytes),inputs:Object.fromEntries(inputs.filter(x=>port.files[x]).map(x=>[x,port.files[x]])),adapters:['Archived verified game data, without session envelope','Core language preloader stub','English-only language state, without UI or translation downloads'],seals:false,weather:null},null,2)+'\n');
console.log(JSON.stringify({engineBytes:bytes.length,dataBytes:fs.statSync(path.join(out,'data-v35.json')).size,inputs:inputs.length,identity:port.engineFingerprint}));
