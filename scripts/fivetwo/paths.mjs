import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
// Research output stays private, with separate directories for each algorithm.
export const OUT=pathToFileURL(path.resolve(process.env.STUDY_DIR??'work/fiveTwo37')+path.sep);
fs.mkdirSync(OUT,{recursive:true});
const common=pathToFileURL(path.resolve('work/fiveTwo37')+path.sep);
for(const file of ['meta.json','meta-provenance.json','budget.json']){
 const source=new URL(file,common),target=new URL(file,OUT);
 if(fs.existsSync(source)&&!fs.existsSync(target))fs.copyFileSync(source,target);
 if(file==='meta.json'&&fs.existsSync(source)&&fs.existsSync(target)&&!fs.readFileSync(source).equals(fs.readFileSync(target)))throw Error('Study meta snapshot differs from the frozen common lobby');
}
export const isMain=url=>!!process.argv[1]&&url===pathToFileURL(path.resolve(process.argv[1])).href;
