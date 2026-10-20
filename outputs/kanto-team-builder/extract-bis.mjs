import {readFile,writeFile} from 'node:fs/promises';
const base=new URL('./',import.meta.url);
const input=JSON.parse(await readFile(new URL('../kanto-bis-v2/confirmation.json',base)));
const states=Object.fromEntries(input.results.map(r=>{
  const selected=r.selected,alternative=r.evaluated.find(c=>c.key===r.frozenRunner);
  return [r.line+':'+r.star,{line:r.line,star:r.star,name:r.name,items:selected.items,score:selected.score,wins:selected.wins,draws:selected.draws,losses:selected.losses,battles:selected.n,alternative:{items:alternative.items,score:alternative.score},confidence:r.comparison.high<0?'alternative':r.comparison.low>0?'lead':'close',gap:r.comparison.delta,interval:[r.comparison.low,r.comparison.high]}];
}));
const result={build:'sim-DVnRY1Xk / roster-CpnLcVHu',states,confirmationDigest:input.deterministicResultsSha256,sourceResultsDigest:input.sourceResultsSha256};
await writeFile(new URL('dist/bis.js',base),'window.KANTO_BIS='+JSON.stringify(result)+';\n');
console.log(JSON.stringify({states:Object.keys(states).length,confirmationDigest:result.confirmationDigest}));
