// Fill missing roster images in the shared media folder from the official site.
// Run from any directory: node scripts/native/sync-media-v36.mjs
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

const root = new URL('../../', import.meta.url);
const source = 'https://einoow.com/playables/kanto-tactics/pk/';
const data = JSON.parse(await fs.readFile(new URL('work/native-v36/data.json', root), 'utf8'));
const nums = [...new Set(data.roster.flatMap(r => r.forms.map(f => f.num)))].sort((a, b) => a - b);
if (!nums.length || nums.some(n => !Number.isSafeInteger(n) || n < 0)) {
  throw new Error('Invalid sprite numbers in the pinned v36 roster');
}
const kinds = [
  {local: 'sprites', remote: 'sd', ext: 'gif', type: 'image/gif', signature: b => /^GIF8[79]a$/.test(b.subarray(0, 6).toString())},
  {local: 'icons', remote: 'icons', ext: 'png', type: 'image/png', signature: b => b.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))},
];
const manifestUrl = new URL('media/v36-sources.json', root);
let previous = {files: []};
try { previous = JSON.parse(await fs.readFile(manifestUrl, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const records = new Map(previous.files.map(f => [f.path, f]));
const tasks = nums.flatMap(num => kinds.map(kind => ({num, kind})));
const failures = [];
let downloaded = 0;
let existing = 0;

async function sync({num, kind}) {
  const relative = `media/${kind.local}/${num}.${kind.ext}`;
  const target = new URL(relative, root);
  try {
    const bytes = await fs.readFile(target);
    if (!kind.signature(bytes)) throw new Error(`Invalid existing image: ${relative}`);
    existing++;
    return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const url = `${source}${kind.remote}/${num}.${kind.ext}`;
  const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`${response.status} fetching ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.headers.get('content-type')?.split(';')[0] !== kind.type || !kind.signature(bytes)) {
    throw new Error(`Expected ${kind.type} from ${url}`);
  }
  await fs.mkdir(new URL(`media/${kind.local}/`, root), {recursive: true});
  await fs.writeFile(target, bytes, {flag: 'wx'});
  records.set(relative, {path: relative, url, bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'), fetched: new Date().toISOString()});
  downloaded++;
  console.log(`Added ${relative}`);
}

// Keep requests bounded and retain successful downloads if another asset fails.
await Promise.all(Array.from({length: 4}, async () => {
  while (tasks.length) {
    const task = tasks.shift();
    try { await sync(task); } catch (error) { failures.push(error.message); }
  }
}));
await fs.writeFile(manifestUrl, JSON.stringify({version: 36, engine: data.identity,
  source, files: [...records.values()].sort((a, b) => a.path.localeCompare(b.path))}, null, 2) + '\n');
console.log(`${downloaded} added, ${existing} already present, ${failures.length} failed; ${nums.length} roster forms checked.`);
if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exitCode = 1;
}
