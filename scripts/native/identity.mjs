import fs from 'node:fs';
import {createHash} from 'node:crypto';

// Hash the files actually executed, not only the live build's module names.
export function engineIdentity(root){
  const modules=fs.readdirSync(new URL('assets/',root)).filter(n=>n.endsWith('.js')).sort();
  const files=['headless.mjs','data.json',...modules.map(n=>'assets/'+n)];
  const hash=createHash('sha256');
  for(const name of files){hash.update(name+'\0');hash.update(fs.readFileSync(new URL(name,root)));hash.update('\0');}
  return hash.digest('hex');
}
