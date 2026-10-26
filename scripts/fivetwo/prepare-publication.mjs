import fs from 'node:fs';
const root='work/fiveTwo37/';
if(!fs.existsSync(root+'ready-for-verification.json'))throw Error('Comparison pipeline has not finished');
if(!fs.existsSync(root+'anchor-audit-public.json'))throw Error('Anchored-form audit has not finished');
for(const [from,to] of [
 ['selected/site/compositions.html','compositions.html'],
 ['selected/site/data/compositions-52.json','data/compositions-52.json'],
 ['selected/site/seals-data.js','seals-data.js'],
 ['comparison-public.json','data/search-comparison-v37.json'],
 ['anchor-audit-public.json','data/anchoring-v37.json'],
])fs.copyFileSync(root+from,to);
for(const file of ['compositions.html','builder.html','seals.html','matchups.html','battle.html']){
 let text=fs.readFileSync(file,'utf8');
 text=text.replace(/(src="(?:compositions|seals-data|seals|matchups)\.js)(?:\?[^"\s]*)?"/g,'$1?v=v37-compared-1"');
 fs.writeFileSync(file,text);
}
console.log('Local publication files prepared. Verify and report changes before pushing.');
