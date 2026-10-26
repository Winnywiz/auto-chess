// Local adapter for the signed, archived official bootstrap. No network or DOM.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('./',import.meta.url);
const port=JSON.parse(fs.readFileSync(new URL('offline-port.json',root)));
const raw=fs.readFileSync(new URL('boot.txt',root),'utf8');
if(createHash('sha256').update(raw).digest('hex')!==port.bootstrapSHA256||!port.bootstrapSignatureVerified)throw Error('Archived bootstrap is not verified');
const first=raw.indexOf('\n'),second=raw.indexOf('\n',first+1);
if(first<0||second<0)throw Error('Invalid archived bootstrap');
const references=[];
function decode(value){
  if(value===null||typeof value!=='object')return value;
  if(Array.isArray(value)){const out=[];for(const item of value){if(item&&typeof item==='object'&&!Array.isArray(item)&&item['\x01']==='h')out.length++;else out.push(decode(item));}return out;}
  const tag=value['\x01'];
  if(tag===undefined){const out={};for(const key of Object.keys(value))out[key]=decode(value[key]);return out;}
  if(tag==='u')return undefined;
  if(tag[0]==='r'){if(!(tag[1] in references))throw Error('Invalid bootstrap reference');return references[tag[1]];}
  if(tag[0]==='n')return tag[1]==='-0'?-0:Number(tag[1]);
  if(tag[0]==='d'){
    const body=tag[2],out=Array.isArray(body)?[]:{};references[tag[1]]=out;
    if(Array.isArray(body)){for(const item of body){if(item&&typeof item==='object'&&!Array.isArray(item)&&item['\x01']==='h')out.length++;else out.push(decode(item));}}
    else for(const key of Object.keys(body))out[key]=decode(body[key]);
    return out;
  }
  throw Error('Unknown bootstrap graph tag');
}
const parts=decode(JSON.parse(raw.slice(second+1))).parts;
export const init=()=>{};
export function part(name){if(!Object.hasOwn(parts,name))throw Error('Missing archived game part: '+name);return parts[name];}
export const offlineBoot=()=>{throw Error('Use headless.mjs for offline research; browser startup is not provided');};
