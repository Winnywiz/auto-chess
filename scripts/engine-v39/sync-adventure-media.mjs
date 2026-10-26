// Fill only missing sprite/icon files used by the native v39 Adventure-only replay metadata.
// Files are fetched from the official game assets and copied to the site and extension media trees.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

const root=new URL('../../',import.meta.url);
const source='https://einoow.com/playables/kanto-tactics/pk/';
const data=JSON.parse(await fs.readFile(new URL('simulation/data-v39.json',root),'utf8'));
const nums=[...new Set(data.adventureAnchors.flatMap(line=>line.forms.map(form=>form.num)))].sort((a,b)=>a-b);
if(data.rules!==39||nums.length===0||nums.some(num=>!Number.isSafeInteger(num)||num<1)){
  throw Error('Invalid v39 Adventure media roster');
}
const kinds=[
  {local:'sprites',remote:'sd',ext:'gif',type:'image/gif',valid:bytes=>
    bytes.length>=14&&/^GIF8[79]a$/.test(bytes.subarray(0,6).toString())&&
    bytes.readUInt16LE(6)>0&&bytes.readUInt16LE(8)>0&&bytes.at(-1)===0x3b},
  {local:'icons',remote:'icons',ext:'png',type:'image/png',valid:bytes=>
    bytes.length>=33&&bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))&&
    bytes.subarray(12,16).toString()==='IHDR'&&bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0},
];
const added=[];
let fetched=0,copied=0,alreadyPresent=0;
async function readExisting(url){
  try{return await fs.readFile(url);}
  catch(error){if(error.code==='ENOENT')return null;throw error;}
}
async function writeIfMissing(url,bytes){
  await fs.mkdir(new URL('.',url),{recursive:true});
  try{await fs.writeFile(url,bytes,{flag:'wx'});return true;}
  catch(error){if(error.code==='EEXIST')return false;throw error;}
}
async function sync(num,kind){
  const file=num+'.'+kind.ext;
  const rootUrl=new URL('media/'+kind.local+'/'+file,root);
  const extensionUrl=new URL('browser-extension/media/'+kind.local+'/'+file,root);
  let rootBytes=await readExisting(rootUrl),extensionBytes=await readExisting(extensionUrl);
  if(rootBytes&&!kind.valid(rootBytes))throw Error('Invalid existing image: media/'+kind.local+'/'+file);
  if(extensionBytes&&!kind.valid(extensionBytes))throw Error('Invalid existing image: browser-extension/media/'+kind.local+'/'+file);
  if(rootBytes&&extensionBytes&&!rootBytes.equals(extensionBytes))throw Error('Root/extension image differs: '+file);
  if(rootBytes&&extensionBytes){alreadyPresent++;return;}
  let bytes=rootBytes??extensionBytes;
  if(!bytes){
    const url=source+kind.remote+'/'+file;
    const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw Error(response.status+' fetching '+url);
    bytes=Buffer.from(await response.arrayBuffer());
    if(response.headers.get('content-type')?.split(';')[0].toLowerCase()!==kind.type||!kind.valid(bytes)){
      throw Error('Official image validation failed for '+url);
    }
    fetched++;
    added.push({path:'media/'+kind.local+'/'+file,url,bytes:bytes.length,
      sha256:createHash('sha256').update(bytes).digest('hex')});
  }
  if(!rootBytes&&await writeIfMissing(rootUrl,bytes))copied++;
  if(!extensionBytes&&await writeIfMissing(extensionUrl,bytes))copied++;
}
const tasks=nums.flatMap(num=>kinds.map(kind=>({num,kind})));
const failures=[];
await Promise.all(Array.from({length:4},async()=>{
  while(tasks.length){
    const task=tasks.shift();
    try{await sync(task.num,task.kind);}catch(error){failures.push(error.message);}
  }
}));
console.log(JSON.stringify({version:39,adventureForms:data.adventureAnchors.reduce((sum,line)=>sum+line.forms.length,0),
  uniqueNumbers:nums.length,fetched,copied,alreadyPresent,added,failures}));
if(failures.length)process.exitCode=1;
