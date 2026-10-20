import {createReadStream,createWriteStream} from 'node:fs';
import {readFile,access} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';
import {createGunzip} from 'node:zlib';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await readFile(new URL('./compressed-raw.json',import.meta.url)));
for(const row of manifest){
 const output=new URL(row.file,import.meta.url);let exists=false;try{await access(output);exists=true;}catch{}
 if(!exists)await pipeline(createReadStream(new URL(row.gzip,import.meta.url)),createGunzip(),createWriteStream(output));
 const h=createHash('sha256');for await(const chunk of createReadStream(output))h.update(chunk);
 if(h.digest('hex')!==row.sha256)throw Error('Raw file hash mismatch: '+row.file);
 console.log('Verified '+row.file);
}
