import fs from 'node:fs';
import os from 'node:os';
import {jobs,experimentIdentity} from './pool.mjs';
import {build,identity,shop,nativeRoster,hash} from './native.mjs';
const html=fs.readFileSync('compositions.html','utf8'),comps=JSON.parse(html.match(/window\.KANTO_COMPS=(\{[^\n]*\});/)[1]);
const trials=Number(process.argv.find(a=>a.startsWith('--trials='))?.split('=')[1]??64),list=[];
function add(row,mode,seals,itemCap,n){for(let i=0;i<n;i+=8)list.push({type:'episode',key:[row.id,mode,seals,itemCap,i].join('/'),row,options:{mode,seals,itemCap},seeds:Array.from({length:Math.min(8,n-i)},(_,j)=>`realism-v34/main/${i+j}`)});}
for(const row of comps.rows){add(row,'practical',false,6,trials);if(row.rollLevel)add(row,'cap-chase',false,6,trials);add(row,'practical',true,6,Math.max(16,trials/2));}
add(comps.rows[0],'control',false,6,trials);add(comps.rows[0],'control',true,6,trials);
for(const id of ['ground-diglett','path-8','v34-search-1','water-staryu','adapt-sheet-3'])for(const cap of [5,7])add(comps.rows.find(r=>r.id===id),'practical',false,cap,Math.max(16,trials/2));
const start=performance.now(),out=await jobs(list,{directory:'work/realism-v34/matches'}),results=out.flatMap(x=>x.results);
const sum=key=>results.reduce((s,r)=>s+r[key],0);
const metadata={generated:new Date().toISOString(),engine:build,engineIdentity:identity,experimentIdentity,sourceHash:hash(html),runtime:process.version,cpu:os.cpus()[0].model,workers:os.availableParallelism(),
  config:{trials,opponents:'Native elite local table: two as and five elite profiles, seeded native casts',items:'Only acquired items; six finished-item equivalents equipped across all owned units. Five/seven sensitivity arms.',
    baselineSeals:false,sealSensitivity:'Actual ranked-mode offers on both sides, editorial preferences when offered, native scoring otherwise.',
    policies:'Native elite buying, selling, formation and item planner; target carry purchases, stated level curves, upgrade limits, cap-chase versus practical exit at 4-4 when fewer than six carry copies.',
    carousel:'Native seeded fallback choices',noResourceInjection:true,odds:shop.s.odds,poolCopies:nativeRoster.o},
  games:results.length,fights:sum('fights'),elapsedSeconds:(performance.now()-start)/1000};
fs.writeFileSync('work/realism-v34/matches.json',JSON.stringify({metadata,results}));
console.log(JSON.stringify({...metadata,config:undefined,fullGamesPerSecond:results.length/metadata.elapsedSeconds}));
