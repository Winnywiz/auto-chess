import fs from 'node:fs';
import {spawn} from 'node:child_process';
const mode=process.argv[2];if(!['original','beam'].includes(mode))throw Error('Choose original or beam');
const dir='work/fiveTwo37/'+mode;
const env={...process.env,STUDY_DIR:dir,SITE_DIR:dir+'/site',SITE_VERSION:'v37-52-'+mode,RESUME:'1'};
const read=p=>{try{return JSON.parse(fs.readFileSync(p));}catch{return null;}};
const limits={r1:8,r12:8,r12s:12,r2:9,r3:6,f8:8};
let required;
while(true){
 const screen=read(dir+'/screen.json'),shortlist=mode==='beam'?read(dir+'/shortlist.json'):screen;
 required=mode==='beam'?shortlist?.length:shortlist?Object.entries(limits).reduce((n,[k,v])=>n+Math.min(v,shortlist.filter(c=>c.strat===k).length),0):null;
 const search=read(dir+'/search.json');
 if(required&&search?.results.length===required&&(mode!=='beam'||search.results.every(r=>r.realizationVersion===2)))break;
 await new Promise(r=>setTimeout(r,5000));
}
async function run(script,log){
 const output=fs.openSync(dir+'/'+log,'a');
 const child=spawn(process.execPath,['scripts/fivetwo/'+script],{env,stdio:['ignore',output,output],windowsHide:true});
 const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});fs.closeSync(output);
 if(code!==0)throw Error(mode+' '+script+' failed: '+code);
}
console.log(mode,'search complete:',required,'plans');
await run('analyze.mjs','analysis.log');
await run('export-site.mjs','export.log');
fs.writeFileSync(dir+'/pipeline-complete.json',JSON.stringify({mode,plans:required,completed:new Date().toISOString()}));
console.log(mode,'analysis and isolated export complete');
