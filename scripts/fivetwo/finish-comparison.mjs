import fs from 'node:fs';
import {spawn} from 'node:child_process';
const root='work/fiveTwo37/';
while(!['original','beam'].every(mode=>fs.existsSync(root+mode+'/evaluation-complete.json')))await new Promise(r=>setTimeout(r,5000));
async function run(script,environment={}){
 const output=fs.openSync(root+'comparison-pipeline.log','a');
 const child=spawn(process.execPath,['scripts/fivetwo/'+script],{env:{...process.env,...environment},stdio:['ignore',output,output],windowsHide:true});
 const code=await new Promise((resolve,reject)=>{child.on('exit',resolve);child.on('error',reject);});fs.closeSync(output);
 if(code!==0)throw Error(script+' failed '+code);
}
await run('compare-searches.mjs',{RESUME:'1'});
await run('select-results.mjs');
const env={STUDY_DIR:root+'selected',SITE_DIR:root+'selected/site',SITE_VERSION:'v37-52-compared',RESUME:'1'};
await run('export-site.mjs',env);await run('progression.mjs',env);await run('export-site.mjs',env);
fs.writeFileSync(root+'ready-for-verification.json',JSON.stringify({completed:new Date().toISOString(),published:false}));
console.log('Comparison, selection, isolated export and progression complete. Publication still requires verification and a change report.');
