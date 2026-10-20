import {createReadStream,createWriteStream} from 'node:fs';
import {stat,writeFile} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';
import {createGzip} from 'node:zlib';
import {createHash} from 'node:crypto';
const hash=async path=>{const h=createHash('sha256');for await(const chunk of createReadStream(path))h.update(chunk);return h.digest('hex');};
const entries=[];
for(const file of ['results.json','search-scores.csv']){
 const input=new URL(file,import.meta.url),output=new URL(file+'.gz',import.meta.url);
 await pipeline(createReadStream(input),createGzip({level:6}),createWriteStream(output));
 entries.push({file,gzip:file+'.gz',bytes:(await stat(input)).size,gzipBytes:(await stat(output)).size,sha256:await hash(input),gzipSha256:await hash(output)});
}
await writeFile(new URL('./compressed-raw.json',import.meta.url),JSON.stringify(entries,null,2));console.log(JSON.stringify(entries));
