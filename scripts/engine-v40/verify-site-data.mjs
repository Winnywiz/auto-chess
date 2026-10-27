// Verify the applied v40 builder and Seal metadata without a browser or study.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const RULES = 40;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const stable = value => Array.isArray(value) ? value.map(stable)
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
    : value;
const same = (left, right) => JSON.stringify(stable(left)) === JSON.stringify(stable(right));

function inlineObject(html, name) {
  const match = html.match(new RegExp(`window\\.${name}=(\\{[^\\n]*\\});`));
  assert(match, 'Missing window.' + name + ' in builder.html');
  return JSON.parse(match[1]);
}

function sealCore(seals) {
  const source = fs.readFileSync('seals.js','utf8');
  const end = source.indexOf('  const condition=');
  assert(end > 0, 'Could not find the pre-DOM Seal helpers.');
  const context = vm.createContext({window:{KANTO_SEALS:seals}});
  vm.runInContext(source.slice(0,end) + '})();',context,{filename:'seals.js pre-DOM helpers'});
  return context.window.KantoSeals;
}

function extractObject(source, key) {
  const markerAt = source.indexOf(key + ':');
  assert(markerAt >= 0, 'Native Seal UI bundle is missing ' + key + '.');
  const start = source.indexOf('{',markerAt + key.length + 1);
  assert(start >= 0, 'Native Seal UI bundle has an invalid ' + key + ' map.');
  let depth = 0, quoted = false, escaped = false;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === '{') depth++;
    else if (char === '}' && --depth === 0) return JSON.parse(source.slice(start,index+1));
  }
  throw new Error('Native Seal UI bundle has an unterminated ' + key + ' map.');
}

const html = fs.readFileSync('builder.html','utf8');
const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]);
for (const [index,source] of inlineScripts.entries()) new vm.Script(source,{filename:'builder inline script ' + (index+1)});
const builderData = inlineObject(html,'KANTO_DATA');
const bis = inlineObject(html,'KANTO_BIS');
const game = JSON.parse(fs.readFileSync('simulation/data-v40.json','utf8'));
const native = JSON.parse(fs.readFileSync('work/native-v40/data.json','utf8'));
const native39 = JSON.parse(fs.readFileSync('work/native-v39/data.json','utf8'));
const sealsContext = vm.createContext({window:{}});
vm.runInContext(fs.readFileSync('seals-data.js','utf8'),sealsContext,{filename:'seals-data.js'});
const seals = JSON.parse(JSON.stringify(sealsContext.window.KANTO_SEALS));

if (process.argv.includes('--self-test')) {
  const officialSealUi = fs.readFileSync('work/native-v40/assets/sealUi-Cf3orWxQ.js','utf8');
  const mock = {...seals,art:{...seals.art,index:extractObject(officialSealUi,'i32')}};
  const core = sealCore(mock);
  const karp = core.icon('hero-karp');
  const otherHero = core.icon('hero-late-bloomer');
  assert(karp.includes('--atlas-x:3;--atlas-y:6'),'Stubborn Fish must resolve to the canonical g:hero-karp cell 99.');
  assert(otherHero.includes('--atlas-x:4;--atlas-y:6'),'Existing hero Seal keys should remain supported.');
  console.log(JSON.stringify({passed:true,heroKarpFallback:true,canonicalKey:'g:hero-karp',index:99,otherHeroKeyRetained:true}));
  process.exit(0);
}

assert.equal(builderData.rules,RULES);
assert.equal(game.rules,RULES);
assert.equal(native.rules,RULES);
assert.equal(builderData.roster.length,game.roster.length);
assert.deepEqual(builderData.roster.map(line=>line.id),game.roster.map(line=>line.id));
assert.equal(builderData.roster.filter(line=>line.anchorK).length,58);
assert.equal(builderData.adventureAnchors.length,19);
assert.equal(game.adventureAnchors.length,19);
const adventureIds = new Set(game.adventureAnchors.map(line=>line.id));
assert(!builderData.roster.some(line=>adventureIds.has(line.id)),'Adventure-only anchor appears in builder choices.');
assert(!('economy' in builderData),'Private economy metadata must not be present in the builder payload.');

const nativeBaseById = new Map(native.roster.map(line=>[line.id,line]));
for (const gameLine of game.roster) {
  const siteLine = builderData.roster.find(line=>line.id===gameLine.id);
  assert(siteLine,gameLine.id + ' missing from builder.');
  assert.deepEqual(siteLine.forms.map(form=>form.skill),gameLine.forms.map(form=>form.skill),gameLine.id + ' native skill metadata');
  const nativeBase = nativeBaseById.get(gameLine.id);
  if (nativeBase) assert.deepEqual(siteLine.forms.map(form=>form.itemFit),nativeBase.forms.map(form=>form.itemFit),gameLine.id + ' native item-fit metadata');
}
assert.equal(builderData.roster.find(line=>line.id==='machop').forms[2].skill.power,396);
assert.equal(builderData.roster.find(line=>line.id==='paras').forms[2].skill.grow.atk,0.09);
assert.equal(builderData.roster.find(line=>line.id==='weedle-a1').forms[2].skill.spikes,20);
assert.equal(builderData.roster.find(line=>line.id==='oddish-a1').anchorK[2].dmg,0.95);
assert.deepEqual(builderData.traits.Poison.values,[50,120,170]);
assert.deepEqual(builderData.items.map(item=>item.id).sort(),native.items.map(item=>item.id).sort());

assert.equal(bis.rules,RULES);
assert.equal(bis.scoreRules,38,'Historical BIS score rules must retain their source version.');
assert.equal(bis.itemFitRules,RULES);
assert.notEqual(bis.scoreBuild,bis.itemFitBuild,'Old scores must remain distinguished from the v40 item-fit source.');

const oldSealsSource = fs.readFileSync('work/backups/pre-v39-2026-10-27/seals-data.js','utf8');
const oldSeals = JSON.parse(oldSealsSource.slice('window.KANTO_SEALS='.length).trim().replace(/;$/,''));
assert.equal(seals.version,RULES);
assert.equal(seals.seals.length,136);
assert.equal(seals.recommendationRules,37,'Seal recommendation study source must remain labeled with its original rules.');
assert.deepEqual(seals.seals.map(row=>row.id).sort(),Object.keys(native.seals).sort());
const rawKeys = ['id','code','rarity','cat','needs','effects','hero','picks','excl'];
for (const row of seals.seals) {
  const raw = Object.fromEntries(rawKeys.map(key=>[key,row[key] ?? null]));
  const nativeRaw = Object.fromEntries(rawKeys.map(key=>[key,native.seals[row.id][key] ?? null]));
  assert(same(raw,nativeRaw),row.id + ' native Seal fields');
}
assert.deepEqual(seals.seals.find(row=>row.id==='tailwind').details,[
  'Every 2 basic attacks from a Flying Pokémon, if its target has another enemy right behind it, it slams them into each other. Both take that basic attack’s damage again and spend 1s in the air.',
]);
assert(seals.seals.find(row=>row.id==='hero-karp').details[0].includes('Gyarados you already have'));
assert.deepEqual(seals.recommendations,oldSeals.recommendations);
assert.deepEqual(seals.art.index,extractObject(fs.readFileSync('work/native-v40/assets/sealUi-Cf3orWxQ.js','utf8'),'i32'));
assert.equal(seals.art.index['g:hero-karp'],99);
assert.equal(Object.hasOwn(seals.art.index,'hero:hero-karp'),false);
assert.equal(seals.art.index['hero:hero-late-bloomer'],100);
assert.equal(seals.art.file,'media/seals/atlas-v40-32.png');
const atlas = fs.readFileSync(seals.art.file);
assert(atlas.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')));
assert.equal(atlas.readUInt32BE(16),512);
assert.equal(atlas.readUInt32BE(20),352);
assert.equal(sha256(atlas),'99f58f267b6b4bfe726593c094423e8d6f12a0847a60b8240a5f395c9a8fe116');

const gameWindow = {};
gameWindow.window = gameWindow;
gameWindow.globalThis = gameWindow;
vm.createContext(gameWindow);
for (const prefix of ['window.KANTO_DATA=','window.KANTO_BIS=']) {
  const source = inlineScripts.find(script=>script.trim().startsWith(prefix));
  assert(source,'Missing builder data assignment ' + prefix);
  vm.runInContext(source,gameWindow);
}
vm.runInContext(inlineScripts.find(script=>script.includes('globalThis.TeamLogic =')),gameWindow);
assert.deepEqual(Array.from(gameWindow.TeamLogic.anchorOptions('caterpie',1)),['caterpie','caterpie-a0']);
assert.deepEqual(Array.from(gameWindow.TeamLogic.anchorOptions('caterpie',2)),['caterpie','caterpie-a0','caterpie-a1']);

const sealUi = sealCore(seals);
const karpIcon = sealUi.icon('hero-karp');
const otherHeroIcon = sealUi.icon('hero-late-bloomer');
assert(karpIcon.includes('--atlas-x:3;--atlas-y:6'),'Stubborn Fish should use the v40 g:hero-karp index 99.');
assert(otherHeroIcon.includes('--atlas-x:4;--atlas-y:6'),'Other hero Seal art should retain the official hero glyph map.');

console.log(JSON.stringify({passed:true,rules:RULES,builderRoster:builderData.roster.length,pvpAnchors:58,adventureAnchors:19,
  updatedSkills:['Machamp','Parasect','Kakuna anchor','Gloom anchor'],poisonValues:[50,120,170],items:43,
  seals:136,changedSealEffects:['Tailwind','Stubborn Fish'],heroKarpAtlasIndex:99,heroIconFallback:true,
  historicalBISRules:bis.scoreRules,historicalSealRecommendations:seals.recommendationRules,browserUsed:false,studyRun:false},null,2));
