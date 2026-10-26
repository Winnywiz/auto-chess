// One verified v37 source for research. Original downloaded modules stay untouched.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export const root = new URL('../../work/engine-v37/', import.meta.url);
export const provenance = JSON.parse(fs.readFileSync(new URL('provenance.json', root)));
const digest = file => createHash('sha256').update(fs.readFileSync(new URL(file, root))).digest('hex');
if (provenance.rules !== 37 || digest('engine-v37.js') !== provenance.engineSHA256 ||
    !provenance.dataSHA256 || digest('data-v37.json') !== provenance.dataSHA256) {
  throw Error('Version 37 engine or data does not match its pinned provenance');
}
export const data = JSON.parse(fs.readFileSync(new URL('data-v37.json', root)));
if (data.rules !== 37 || data.identity !== provenance.identity) throw Error('Version 37 data identity mismatch');
export const engine = await import(new URL('engine-v37.js', root));
if (engine.rules !== 37 || engine.identity !== provenance.identity) throw Error('Version 37 engine identity mismatch');
