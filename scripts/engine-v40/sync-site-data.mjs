// Prepare Version 40 builder and Seal metadata from the pinned native capture.
// Defaults to a read-only preflight; pass --write after backup and review.
// Does not change BIS scores/recommendations or run a composition search.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const RULES = 40;
const root = process.cwd();
const write = process.argv.includes('--write');
const atlasRelative = 'media/seals/atlas-v40-32.png';
const atlasUrl = 'https://einoow.com/playables/kanto-tactics/pk/sellos/px32.png?v=a01e7859';
const atlasSha256 = '99f58f267b6b4bfe726593c094423e8d6f12a0847a60b8240a5f395c9a8fe116';

const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const stable = value => Array.isArray(value) ? value.map(stable)
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
    : value;
const same = (left, right) => JSON.stringify(stable(left)) === JSON.stringify(stable(right));
const setOf = rows => new Set(rows.map(row => row.id));

function parseInlineJson(html, name) {
  const match = html.match(new RegExp(`window\\.${name}=(\\{[^\\n]*\\});`));
  if (!match) throw new Error('Could not find window.' + name + ' in builder.html.');
  return JSON.parse(match[1]);
}

function replaceInlineJson(html, name, value) {
  const pattern = new RegExp(`window\\.${name}=\\{[^\\n]*\\};`);
  if (!pattern.test(html)) throw new Error('Could not find window.' + name + ' in builder.html.');
  const replacement = `window.${name}=${JSON.stringify(value)};`;
  return html.replace(pattern, replacement);
}

function rawSeal(row) {
  return Object.fromEntries(['id','code','rarity','cat','needs','effects','hero','picks','excl']
    .map(key => [key, row[key] ?? null]));
}

function extractObject(source, key) {
  const marker = key + ':';
  const markerAt = source.indexOf(marker);
  if (markerAt < 0) throw new Error('Native Seal UI bundle is missing ' + key + '.');
  const start = source.indexOf('{', markerAt + marker.length);
  if (start < 0) throw new Error('Native Seal UI bundle has an invalid ' + key + ' map.');
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
    else if (char === '}' && --depth === 0) return JSON.parse(source.slice(start, index + 1));
  }
  throw new Error('Native Seal UI bundle has an unterminated ' + key + ' map.');
}

function sealAtlas(nativeManifest) {
  const sealUiName = Object.keys(nativeManifest.files || {}).find(name => /^sealUi-.*\.js$/.test(name));
  if (!sealUiName) throw new Error('Native Version 40 capture is missing the Seal UI bundle.');
  const sealUi = read('work/native-v40/assets/' + sealUiName);
  if (sha256(Buffer.from(sealUi)) !== nativeManifest.files[sealUiName]) {
    throw new Error('Native Seal UI bundle does not match the captured manifest.');
  }
  const match = sealUi.match(/Q=\{v:`([^`]+)`,cols:(\d+),r32:(\d+),r16:(\d+),i32:/);
  if (!match) throw new Error('Could not read the native Version 40 Seal atlas manifest.');
  const [,version,columns,rows] = match;
  if (version !== 'a01e7859') throw new Error('Unexpected Version 40 Seal atlas version ' + version + '.');
  const index = extractObject(sealUi, 'i32');
  assert.equal(index['g:hero-karp'], 99);
  assert.equal(Object.hasOwn(index, 'hero:hero-karp'), false);
  assert.equal(index['hero:hero-late-bloomer'], 100);
  return {version,columns:Number(columns),rows:Number(rows),index};
}

function assertNativeDelta(native39, native40) {
  assert.equal(native39.rules, 39);
  assert.equal(native40.rules, RULES);
  assert.deepEqual([...setOf(native40.roster)].sort(), [...setOf(native39.roster)].sort(), 'Native base roster IDs changed; review the sync before continuing.');
  assert.deepEqual([...setOf(native40.anchors)].sort(), [...setOf(native39.anchors)].sort(), 'Native anchor IDs changed; review the sync before continuing.');
  assert.deepEqual([...setOf(native40.items)].sort(), [...setOf(native39.items)].sort(), 'Native item IDs changed; review the sync before continuing.');
  assert.deepEqual(Object.keys(native40.seals).sort(), Object.keys(native39.seals).sort(), 'Seal IDs changed; review the sync before continuing.');

  const changed = (left, right) => Object.keys(right).filter(id => !same(left[id], right[id])).sort();
  assert.deepEqual(changed(native39.traits, native40.traits), ['Poison']);
  assert.deepEqual(changed(Object.fromEntries(native39.items.map(row => [row.id,row])), Object.fromEntries(native40.items.map(row => [row.id,row]))), []);
  assert.deepEqual(changed(Object.fromEntries(native39.roster.map(row => [row.id,row])), Object.fromEntries(native40.roster.map(row => [row.id,row]))), ['machop','paras']);
  assert.deepEqual(changed(Object.fromEntries(native39.anchors.map(row => [row.id,row])), Object.fromEntries(native40.anchors.map(row => [row.id,row]))), ['oddish-a1','weedle-a1']);
  assert.deepEqual(changed(native39.seals, native40.seals), ['hero-karp','tailwind']);
}

function createBuilderPayload(old, native, combat) {
  const nativeBase = new Map(native.roster.map(line => [line.id,line]));
  const roster = combat.roster.map(line => {
    const base = nativeBase.get(line.id);
    return {...base,...line,forms:line.forms.map((form,index)=>({...base?.forms?.[index],...form}))};
  });
  const ids = roster.map(line => line.id);
  assert.equal(new Set(ids).size, ids.length, 'Builder roster contains duplicate line IDs.');
  const adventureIds = new Set((combat.adventureAnchors || []).map(line => line.id));
  assert(!roster.some(line => adventureIds.has(line.id)), 'Adventure-only anchor entered the PvP builder roster.');
  const payload = {...old,...native,roster,adventureAnchors:combat.adventureAnchors,frames:old.frames};
  delete payload.economy;
  delete payload.dex;
  delete payload.anchors;
  assert.equal(payload.rules, RULES);
  assert.equal(payload.roster.length, 127);
  assert.equal(payload.roster.filter(line => line.anchorK).length, 58);
  assert.equal(payload.adventureAnchors.length, 19);
  return payload;
}

function createSealPayload(oldSeals, native, artManifest, imageHash) {
  const nativeRows = native.seals;
  const oldRows = new Map(oldSeals.seals.map(row => [row.id,row]));
  assert.equal(oldRows.size, oldSeals.seals.length, 'Existing Seal catalogue contains duplicate IDs.');
  assert.deepEqual([...oldRows.keys()].sort(), Object.keys(nativeRows).sort(), 'Seal catalogue IDs differ from native Version 40.');
  const rows = oldSeals.seals.map(row => {
    const raw = nativeRows[row.id];
    if (!raw) throw new Error('Native Seal record is missing ' + row.id + '.');
    return {...row,...raw};
  });
  const tailwind = rows.find(row => row.id === 'tailwind');
  tailwind.description = 'Every 2 Flying basic attacks: if another enemy is behind the target, they collide and are airborne for 1s.';
  tailwind.details = [
    'Every 2 basic attacks from a Flying Pokémon, if its target has another enemy right behind it, it slams them into each other. Both take that basic attack’s damage again and spend 1s in the air.',
  ];
  const heroKarp = rows.find(row => row.id === 'hero-karp');
  heroKarp.description = 'Existing Gyarados return to anchored Magikarp; survival adds +12% HP and +25% damage.';
  heroKarp.details = [
    'When you pick it, Gyarados you already have turn back into anchored Magikarp. Each fight it survives, it gains +12% HP and +25% damage forever, as long as it stays a Magikarp.',
  ];

  const imageUrl = atlasUrl;
  const art = {
    ...oldSeals.art,
    source:imageUrl,
    file:atlasRelative,
    columns:artManifest.columns,
    rows:artManifest.rows,
    index:artManifest.index,
    sha256:imageHash,
  };
  return {...oldSeals,version:RULES,art,seals:rows};
}

const native39 = json('work/native-v39/data.json');
const native = json('work/native-v40/data.json');
const combat = json('simulation/data-v40.json');
const nativeManifest = json('work/native-v40/manifest.json');
const atlasManifest = sealAtlas(nativeManifest);
assert.equal(combat.rules, RULES);
assertNativeDelta(native39, native);
assert.equal(combat.roster.length, 127);
assert.equal(combat.roster.filter(line => line.anchorK).length, 58);
assert.equal(combat.adventureAnchors.length, 19);

const html = read('builder.html');
const oldBuilder = parseInlineJson(html,'KANTO_DATA');
const oldBis = parseInlineJson(html,'KANTO_BIS');
const oldSeals = JSON.parse(read('seals-data.js').slice('window.KANTO_SEALS='.length).trim().replace(/;$/,''));
assert([39,40].includes(oldBuilder.rules), 'Builder must be Version 39 or an idempotent Version 40 rerun.');
assert([39,40].includes(oldSeals.version), 'Seal metadata must be Version 39 or an idempotent Version 40 rerun.');
assert.equal(oldSeals.recommendationRules, 37, 'Seal recommendations are from a prior study and must keep their source rules label.');

const oldRawSeals = json('work/native-v39/data.json').seals;
if (oldSeals.version === 39) {
  for (const row of oldSeals.seals) assert(same(rawSeal(row),rawSeal(oldRawSeals[row.id])), 'Existing v39 Seal data drifted for ' + row.id + '.');
}
const imageResponse = await fetch(atlasUrl);
if (!imageResponse.ok) throw new Error('Native Version 40 Seal atlas download failed: HTTP ' + imageResponse.status);
const atlasBytes = Buffer.from(await imageResponse.arrayBuffer());
if (!atlasBytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')) || atlasBytes.readUInt32BE(16)!==512 || atlasBytes.readUInt32BE(20)!==352) {
  throw new Error('Native Version 40 Seal atlas failed PNG signature or dimension validation.');
}
const imageHash = sha256(atlasBytes);
assert.equal(imageHash, atlasSha256, 'Native Version 40 Seal atlas does not match its verified bytes.');

const builderData = createBuilderPayload(oldBuilder,native,combat);
const oldScoreRules = oldBis.scoreRules ?? oldBis.rules ?? null;
const oldScoreBuild = oldBis.scoreBuild ?? oldBis.build ?? null;
const bis = {
  ...oldBis,
  build:native.build,
  rules:RULES,
  scoreRules:oldScoreRules,
  scoreBuild:oldScoreBuild,
  itemFitRules:RULES,
  itemFitBuild:native.build,
  method:'Native Version 40 PvP catalogue and item-fit metadata; previous BIS state preserved; no composition search has been run.',
};
const nextHtml = replaceInlineJson(replaceInlineJson(html,'KANTO_DATA',builderData),'KANTO_BIS',bis);
const nextSeals = createSealPayload(oldSeals,native,atlasManifest,imageHash);

const atlasPath = path.join(root,atlasRelative);
if (fs.existsSync(atlasPath) && sha256(fs.readFileSync(atlasPath)) !== atlasSha256) {
  throw new Error(atlasRelative + ' already exists with different bytes; refusing to overwrite it.');
}
if (write) {
  if (!fs.existsSync(path.dirname(atlasPath))) throw new Error('Expected Seal asset directory is missing: ' + path.dirname(atlasPath));
  if (!fs.existsSync(atlasPath)) fs.writeFileSync(atlasPath,atlasBytes);
  fs.writeFileSync(path.join(root,'builder.html'),nextHtml);
  fs.writeFileSync(path.join(root,'seals-data.js'),'window.KANTO_SEALS='+JSON.stringify(nextSeals)+';\n');
}

console.log(JSON.stringify({
  mode:write?'write':'preflight',rules:RULES,build:native.build,
  builderRoster:builderData.roster.length,pvpAnchors:builderData.roster.filter(line=>line.anchorK).length,
  adventureAnchors:builderData.adventureAnchors.length,items:native.items.length,traits:Object.keys(native.traits).length,
  nativeSealCount:Object.keys(native.seals).length,changedSealIds:['tailwind','hero-karp'],
  tailwindArtIndex:nextSeals.art.index['doc:tailwind'],heroKarpArtKey:'g:hero-karp',heroKarpArtIndex:nextSeals.art.index['g:hero-karp'],
  atlas:{file:atlasRelative,sha256:imageHash,width:512,height:352},
  preservedScoreRules:oldScoreRules,preservedRecommendationRules:nextSeals.recommendationRules,
  searchStarted:false,published:false,
},null,2));
