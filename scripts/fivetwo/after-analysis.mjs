import fs from 'node:fs';
import {spawn} from 'node:child_process';
const mode=process.argv[2];if(!['original','beam'].includes(mode))throw Error('Unknown algorithm');
const dir='work/fiveTwo37/'+mode;
while(!fs.existsSync(dir+'/pipeline-complete.json'))await new Promise(r=>setTimeout(r,5000));
const env={...process.env,STUDY_DIR:dir,SITE_DIR:dir+'/site',SITE_VERSION:'v37-52-'+mode,RESUME:'1'};
for(const script of ['calibrate-realized.mjs','export-site.mjs']){
 const output=fs.openSync(dir+'/complete-outcomes.log','a');
 const child=spawn(process.execPath,['scripts/fivetwo/'+script],{env,stdio:['ignore',output,output],windowsHide:true});
 const code=await new Promise((resolve,reject)=>{child.on('exit',resolve);child.on('error',reject);});fs.closeSync(output);
 if(code!==0)throw Error(script+' failed '+code);
}
fs.writeFileSync(dir+'/evaluation-complete.json',JSON.stringify({mode,completed:new Date().toISOString()}));
console.log(mode,'complete-outcome evaluation finished');
