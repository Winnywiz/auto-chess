import {readFile,writeFile} from 'node:fs/promises';
const base=new URL('./',import.meta.url), get=p=>readFile(new URL(p,base),'utf8');
const manifest=JSON.parse(await get('art-manifest.json')), media={};
for(const asset of manifest){
  const bytes=await readFile(new URL('dist/media/'+asset.path,base));
  media[asset.path]=`data:image/${asset.path.endsWith('.gif')?'gif':'png'};base64,${bytes.toString('base64')}`;
}
const fontLicense=await get('dist/media/fonts/OFL.txt');
for(const [entry,output] of [['index.html','kanto-team-builder.html'],['compositions.html','compositions.html']]){
 let html=await get('dist/'+entry);
 html=html.replace('<head>',()=>'<head>\n<!-- DM Sans from Google Fonts.\n'+fontLicense.replaceAll('--','- -')+'\n-->');
 for(const file of ['style.css','compositions.css']){
  if(!html.includes('href="'+file))continue;
  let css=await get('dist/'+file);
  for(const match of [...css.matchAll(/url\((media\/fonts\/[^)]+\.ttf)\)/g)]){
   const bytes=await readFile(new URL('dist/'+match[1],base));
   css=css.replace(match[0],()=> 'url(data:font/ttf;base64,'+bytes.toString('base64')+')');
  }
  html=html.replace(new RegExp('<link rel="stylesheet" href="'+file.replace('.','\\.')+'(?:\\?[^\"]*)?"\\s*\\/?>'),()=>'<style>'+css+'</style>');
 }
 const embedded=entry==='index.html'?media:Object.fromEntries(Object.entries(media).filter(([path])=>/^(icons|items|types)\//.test(path)));
 for(const file of ['data.js','bis.js','logic.js','app.js','comps-data.js','compositions.js']){
  if(!html.includes('src="'+file))continue;
  let script=await get('dist/'+file);
  if(file==='data.js')script+='\nwindow.KANTO_MEDIA='+JSON.stringify(embedded)+';';
  script=script.replaceAll('</script','<\\/script');
  html=html.replace(new RegExp('<script src="'+file.replace('.','\\.')+'(?:\\?[^\"]*)?"></script>'),()=>'<script>'+script+'</script>');
 }
 await writeFile(new URL('../'+output,base),html);
 if(entry==='index.html')await writeFile(new URL('../index.html',base),html);
 console.log(JSON.stringify({output,embeddedImages:Object.keys(embedded).length,bytes:Buffer.byteLength(html)}));
}
