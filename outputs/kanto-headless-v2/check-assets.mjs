import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const m=JSON.parse(await readFile(new URL('./manifest.json',import.meta.url),'utf8'));
for(const a of m.assets){
  const b=await readFile(new URL('./assets/'+a.name,import.meta.url));
  assert.equal(b.length,a.bytes,a.name+' size');
  assert.equal(createHash('sha256').update(b).digest('hex'),a.sha256,a.name+' SHA-256');
}
console.log(`${m.assets.length} public assets match the saved SHA-256 manifest.`);
