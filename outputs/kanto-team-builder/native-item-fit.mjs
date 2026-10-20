import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import '../kanto-headless-v2/headless.mjs';
import * as r from '../kanto-headless-v2/assets/roster-CpnLcVHu.js';
import * as s from '../kanto-headless-v2/assets/sim-DVnRY1Xk.js';
const source=await readFile(new URL('../kanto-headless-v2/inspection/engine-hdo_L_e1.js',import.meta.url),'utf8');
const begin=source.indexOf('function N(e, t) {'),end=source.indexOf('\nfunction P(',begin);
if(begin<0||end<begin)throw Error('Pinned native item fit not found');
export const nativeItemFit=vm.runInNewContext('(()=>{'+source.slice(begin,end)+';return N;})()',{b:r.r,oe:r.p,he:s.d,se:s.A,ce:s.C,S:s.Dt,V:true});
