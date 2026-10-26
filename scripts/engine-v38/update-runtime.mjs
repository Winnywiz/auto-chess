// Apply v38 runtime compatibility. No composition study is run.
import fs from 'node:fs';
if(fs.readFileSync('custom-battle.js','utf8').includes('let rules=38;')&&fs.readFileSync('builder.html','utf8').includes('data-skill-form')&&JSON.parse(fs.readFileSync('browser-extension/manifest.json')).version==='1.8.0'){console.log('v38 runtime compatibility is already applied.');process.exit(0);}
const edit=(file,fn)=>{const before=fs.readFileSync(file,'utf8'),after=fn(before);if(after!==before)fs.writeFileSync(file,after);};
edit('simulation/battle-worker.js',s=>s.replace('[36,37]','[36,37,38]'));
edit('simulation/battle-core.js',s=>s.replace('return {line:u.line,star:u.star,cell:u.cell,items:[...u.items]};',`const form=u.form;
   if(form!=null&&form!==''){if(data.rules<38||!['phys','spec'].includes(form)||!lines.get(u.line).flex?.stars.includes(u.star))throw Error('Choose a valid ability for this Pokemon.');}
   return {line:u.line,star:u.star,cell:u.cell,items:[...u.items],...(form?{form}:{})};`).replace('line:u.line,star:u.star,num:u.num,name:',"line:u.line,star:u.star,...(u.flexForm?{form:u.flexForm}:{}),num:u.num,name:"));
edit('custom-battle.js',s=>s.replace('let rules=37;','let rules=38;').replace('[36,37]','[36,37,38]').replaceAll('?v=v37-1','?v=v38-1').replaceAll('?v=v37-tempo-1','?v=v38-1')
 .replace('${[0,1,2].map(slot=>',`\${rules>=38&&lines.get(current.line).flex?.stars.includes(current.star)?\`<label>Ability<select data-form="\${side}" aria-label="Team \${letter} selected ability"><option value="">Automatic from items</option>\${['phys','spec'].map(mode=>\`<option value="\${mode}" \${current.form===mode?'selected':''}>\${esc(lines.get(current.line).flex[mode][current.star-1].name)}</option>\`).join('')}</select></label>\`:''}\${[0,1,2].map(slot=>`)
 .replace('if(e.target.dataset.star)u.star=Number(e.target.value);',"if(e.target.dataset.form){if(e.target.value)u.form=e.target.value;else delete u.form;}\n   else if(e.target.dataset.star)u.star=Number(e.target.value);")
 .replace('items:u.items??[],cell:Number(cell)+28','items:u.items??[],...(u.form?{form:u.form}:{}),cell:Number(cell)+28'));
edit('browser-extension/manifest.json',s=>s.replace('"version": "1.7.0"','"version": "1.8.0"'));
edit('browser-extension/viewer.js',s=>s.replace('const SIM_RULES = 37;','const SIM_RULES = 38;')
 .replace('items: (unit.items ?? []).filter',"...(['phys','spec'].includes(unit.form)?{form:unit.form}:{}),items: (unit.items ?? []).filter")
 .replace("items: unit.items ?? [], num: unit.num || null","items: unit.items ?? [], ...(unit.form?{form:unit.form}:{}), num: unit.num || null")
 .replace("const english = !transforming && meta ?", "const chosen = meta?.form && KANTO_TIP_DATA.units[meta.line]?.flex?.[meta.form]?.[meta.star-1]?.name;\n  const english = chosen || (!transforming && meta ?")
 .replace("KantoTips.findUnit(meta.line, meta.star)?.form?.skill?.name : null;","KantoTips.findUnit(meta.line, meta.star)?.form?.skill?.name : null);"));
edit('browser-extension/bridge-main.js',s=>s.replace('star: Math.max(1, Math.min(3, roundInt(unit.star || 1))),',"star: Math.max(1, Math.min(3, roundInt(unit.star || 1))),\n      ...(['phys','spec'].includes(unit.flexForm??unit.form)?{form:unit.flexForm??unit.form}:{}),")
 .replaceAll('star: Number(unit.star ?? 1),',"star: Number(unit.star ?? 1), ...(['phys','spec'].includes(unit.form)?{form:unit.form}:{}),"));
edit('browser-extension/README.md',s=>s.replace('runs the v37 engine after the local website update is published','runs the v38 engine').replace('## Planning, bench and Re-fight','## Planning, bench and Re-fight\n\nVersion 1.8.0 records v38 manual ability choices and preserves them in Re-fight links. Existing recordings remain available.'));
edit('builder.html',s=>s.replace('attack > special ? "phys" : special > attack ? "spec" : r.flex.def;','["phys", "spec"].includes(u.form) ? u.form : attack > special ? "phys" : special > attack ? "spec" : r.flex.def;')
 .replace('return { id: ++id, line: u.line, star: u.star, items: [...held] };','if(u.form!=null&&!(["phys","spec"].includes(u.form)&&lines[u.line].flex?.stars.includes(u.star)))throw new Error("This Pokemon has an invalid ability choice.");\n      return { id: ++id, line: u.line, star: u.star, items: [...held], ...(u.form?{form:u.form}:{}) };')
 .replace('${inspectorExtras(u)}</div>',`\${r.flex?.stars.includes(u.star)?\`<label>Ability<select class="branch-select" data-skill-form aria-label="Selected ability"><option value="">Automatic from items</option>\${['phys','spec'].map(mode=>\`<option value="\${mode}" \${u.form===mode?'selected':''}>\${esc(r.flex[mode][u.star-1].name)}</option>\`).join('')}</select></label>\`:''}\${inspectorExtras(u)}</div>`)
 .replace('el.querySelector("#remove-unit").onclick = removeSelected;',`el.querySelector('[data-skill-form]')?.addEventListener('change',e=>commit(()=>{const unit=find(selected).u;if(e.target.value)unit.form=e.target.value;else delete unit.form;}));\n    el.querySelector("#remove-unit").onclick = removeSelected;`));
edit('matchups.js',s=>s.replace("import('./custom-battle.js?v=v37-1')","import('./custom-battle.js?v=v38-1')"));
edit('battle.html',s=>s.replace('matchups.js?v=v37-compared-1','matchups.js?v=v38-runtime-1'));
edit('builder.html',s=>s.replace('team-code.js?v=kt1-1','team-code.js?v=kt1-v38-1'));
edit('seals.html',s=>s.replaceAll('?v=v37-compared-1','?v=v38-runtime-1'));
edit('seals.js',s=>s.replace("const index=D.art.index[key];if(index===undefined)return '';", "const art=D.art.index[key]!==undefined?D.art:D.art.legacy;const index=art?.index[key];if(index===undefined)return '';")
 .replace('index%D.art.columns','index%art.columns').replace('index/D.art.columns','index/art.columns')
 .replace('style="--atlas-x:', 'style="background-image:url(\'${art.file}\');--atlas-x:')
 .replace("if(D.art.index[key]===undefined)throw", "if(D.art.index[key]===undefined&&D.art.legacy?.index[key]===undefined)throw"));
edit('browser-extension/tooltips.js',s=>s.replace('const art = DATA.sealArt;',`let art = DATA.sealArt;\n    const parameter=String(id??'').split(':')[1],key=info?.hero?'hero:'+base:info?.template?(parameter?'type:'+parameter:'tier:'+base.split('-')[1]):art?.index?.['doc:'+base]!==undefined?'doc:'+base:'g:'+base;\n    if(art?.index&&art.index[key]===undefined)art=art.legacy;\n    const iconIndex=art?.index?art.index[key]:info?.icon;`)
 .replace('Number.isInteger(info.icon)','Number.isInteger(iconIndex)').replace('size / art.size','size / (art.size??32)').replaceAll('info.icon %','iconIndex %').replaceAll('info.icon /','iconIndex /').replaceAll('art.size *','(art.size??32) *'));
console.log('Version 38 runtime and ability-choice support updated. No composition search.');
