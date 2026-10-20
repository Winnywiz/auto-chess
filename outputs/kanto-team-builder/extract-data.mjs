import '../kanto-headless-v2/extract-data.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('../kanto-headless-v2/data.json',import.meta.url)));
await writeFile(new URL('./data.json',import.meta.url),JSON.stringify(data,null,2));
await writeFile(new URL('./dist/data.js',import.meta.url),'window.KANTO_DATA='+JSON.stringify(data)+';');
console.log('Builder data updated to '+data.build);
