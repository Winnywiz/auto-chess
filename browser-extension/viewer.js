const $ = selector => document.querySelector(selector);
const demoMode = new URLSearchParams(location.search).has('demo');
const DEMO_ID = 'fabricated-demo';
const MAX_SAVED_REPLAYS = 100;
const REPLAY_STORAGE_BUDGET = 64 * 1024 * 1024;
let replays = [];
let current = null;
let roundIndex = 0;
let battleTimer = 0;
let battleRecord = null;
let battleNodes = {};
let battleTime = 0;
let battlePlaying = false;
let battleSpeed = 1;
let battleLast = 0;
let battleMetric = 'dealt';
let battleMetricAt = 0;
let highlightedBattleUid = null;

const pretty = value => String(value ?? '').replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
const formatNumber = value => value === null || value === undefined || value === ''
  ? '-' : (Number.isFinite(Number(value)) ? Number(value).toLocaleString(undefined, {maximumFractionDigits: 2}) : '-');
const REPLAY_LOOKUPS = globalThis.KANTO_REPLAY_DATA ?? {units: {}, items: {}, seals: {}};
function unitForm(line, star = 1) {
  const info = current?.rosterLookup?.[line] ?? REPLAY_LOOKUPS.units?.[line] ?? {};
  const index = Math.max(0, Math.min(2, Number(star) - 1 || 0));
  if (Array.isArray(info.forms)) return info.forms[index] ?? info.forms[0] ?? {name: info.name ?? pretty(line)};
  return {name: info.names?.[index] ?? info.name ?? pretty(line), num: info.nums?.[index] ?? info.nums?.[0],
    types: info.traits ?? [], skill: info.skills?.[index]};
}
function itemInfo(id) { return current?.itemLookup?.[id] ?? globalThis.KANTO_TIP_DATA?.items?.[id] ?? REPLAY_LOOKUPS.items?.[id] ?? {name: pretty(id)}; }
function sealLabel(id) { return current?.sealLookup?.[id]?.name ?? KantoTips.sealName(id); }
const hasFrames = battle => (Number(battle?.frameCount) || battle?.frames?.length || 0) > 0;
const battleCache = new Map();
async function loadBattle(battle) {
  if (!battle || battle.frames?.length || !battle.key) return battle;
  if (!battleCache.has(battle.key)) {
    const stored = globalThis.chrome?.storage?.local ? (await chrome.storage.local.get(battle.key))[battle.key] : null;
    if (stored?.frames?.length) battleCache.set(battle.key, stored);
    else return battle;
  }
  return battleCache.get(battle.key);
}
function tipUnit(node, line, star, items) {
  node.dataset.tip = 'unit';
  node.dataset.line = line ?? '';
  node.dataset.star = String(star ?? 1);
  if (items?.length) node.dataset.items = items.join(',');
}
const assetUrl = path => globalThis.chrome?.runtime?.getURL(path) ?? path;
const displayDate = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();
};

function makeSampleBattle(ownBoard, foeBoard, index) {
  const mine = ownBoard.slice(0, 4);
  const foes = foeBoard.slice(0, 4);
  const meta = [...mine.map((unit, i) => ({uid: i + 1, team: 0, line: unit.line, star: unit.star, name: pretty(unit.line),
    maxHp: 180 + i * 20, maxMana: 100, items: unit.items ?? [], ownedId: `mine-${i}`})),
  ...foes.map((unit, i) => ({uid: i + 5, team: 1, line: unit.line, star: unit.star, name: pretty(unit.line),
    maxHp: 170 + i * 18, maxMana: 100, items: unit.items ?? [], ownedId: `foe-${i}`}))];
  const starts = [...mine.map(unit => unit.cell), ...foes.map(unit => unit.cell)];
  const targets = starts.map((cell, i) => i < mine.length ? Math.max(0, cell - 14) : Math.min(55, cell + 14));
  const frames = [];
  const ownLoss = index === 0 ? 1 : (index === 1 ? 1.05 : 0.52);
  const foeLoss = index === 0 ? 0.48 : (index === 1 ? 1.05 : 1);
  for (let frame = 0; frame <= 12; frame++) {
    const time = frame * 0.4;
    const units = meta.map((unit, i) => {
      const team = unit.team;
      const progress = Math.min(1, Math.max(0, (time - 0.8) / 1.2));
      const from = progress < 1 ? starts[i] : targets[i];
      const cell = progress < 1 ? targets[i] : targets[i];
      const moveT = progress < 1 ? progress : 1;
      const pressure = Math.min(1, Math.max(0, (time - 1.1) / 3.7));
      const loses = pressure * (team === 1 ? foeLoss : ownLoss);
      const hp = Math.max(0, Math.round(unit.maxHp * (1 - loses)));
      const alive = hp > 0 ? 1 : 0;
      const dealt = Math.round(Math.max(0, time - 1) * (team === 0 ? 16 : 12));
      return [unit.uid, from, cell, moveT, hp, 0, Math.min(100, Math.round(time * 19)), alive, unit.maxHp,
        dealt, Math.round(dealt * 0.45), 0, Math.round(Math.max(0, unit.maxHp - hp)), 0, 0, 0];
    });
    frames.push([Number(time.toFixed(2)), units]);
  }
  const events = [
    {k: 'seal', t: 0.2, id: index > 1 ? 'battle-fury' : 'meowth-bank', team: 0},
    {k: 'cast', t: 1.2, src: 2, name: 'Razor Leaf', type: 'Grass'},
    {k: 'attack', t: 1.6, src: 1, dst: 5, ranged: false, type: 'Rock'},
    {k: 'dmg', t: 1.8, uid: 5, amount: 36, ability: true},
    {k: 'cast', t: 2.8, src: 8, name: 'Water Pulse', type: 'Water'},
    {k: 'dmg', t: 3.1, uid: 2, amount: 24, ability: true},
    {k: 'attack', t: 3.8, src: 3, dst: 8, ranged: true, type: 'Fire'},
    {k: 'dmg', t: 4.1, uid: index === 0 ? 2 : 8, amount: 42, crit: true},
    ...(index === 1 ? [{k: 'faint', t: 4.35, uid: 2}, {k: 'faint', t: 4.4, uid: 8}] :
      [{k: 'faint', t: 4.4, uid: index === 0 ? 2 : 8}]),
  ];
  return {id: `demo-battle-${index + 1}`, myTeam: 0, opponentKey: '', time: 4.8,
    winner: index === 0 ? 1 : (index === 1 ? -1 : 0), meta, frames, events, truncated: false, complete: true};
}

function makeDemoReplay() {
  const createdAt = new Date(Date.now() - 18 * 60_000).toISOString();
  const finishedAt = new Date(Date.now() - 6 * 60_000).toISOString();
  const unit = (cell, line, star = 1, items = [], shiny = false) => ({cell, line, star, items, shiny});
  const board = (...units) => units;
  const foe = (key, name, seat, hp, level, units) => ({key, name, seat, place: null, hp, level, board: units});
  const rounds = [
    {
      label: '1-2', mine: board(unit(31, 'geodude'), unit(32, 'bulbasaur'), unit(33, 'charmander'), unit(46, 'pikachu', 1, ['light-ball'])),
      foes: [foe('misty', 'Misty', 1, 85, 4, board(unit(1, 'squirtle'), unit(2, 'staryu'), unit(3, 'psyduck'), unit(8, 'magikarp'), unit(9, 'pidgey'))), foe('brock', 'Brock', 2, 91, 4, board(unit(0, 'geodude'), unit(1, 'onix'), unit(7, 'rattata'), unit(8, 'machop')))],
      seals: ['meowth-bank'], goldStart: 10, goldEarned: 5, interestEarned: 1, goldSpent: 5, goldFromSales: 0, goldEnd: 10, rolls: 0, averageGoldEarned: 5,
    },
    {
      label: '2-1', mine: board(unit(30, 'geodude'), unit(31, 'wartortle'), unit(32, 'ivysaur', 2), unit(36, 'machop'), unit(45, 'pikachu'), unit(46, 'abra')),
      foes: [foe('misty', 'Misty', 1, 76, 5, board(unit(0, 'wartortle'), unit(1, 'starmie'), unit(2, 'psyduck'), unit(7, 'poliwhirl'), unit(8, 'seel'))), foe('gary', 'Gary', 3, 90, 5, board(unit(0, 'pidgeotto'), unit(1, 'raticate'), unit(7, 'gloom'), unit(8, 'kadabra'), unit(9, 'growlithe')))],
      seals: ['meowth-bank'], goldStart: 10, goldEarned: 6, interestEarned: 1, goldSpent: 4, goldFromSales: 0, goldEnd: 12, rolls: 2, averageGoldEarned: 5.5,
    },
    {
      label: '2-2', mine: board(unit(30, 'graveler'), unit(31, 'venusaur', 2, ['leftovers']), unit(32, 'charmeleon', 2), unit(36, 'snorlax'), unit(37, 'raichu'), unit(43, 'alakazam'), unit(44, 'machoke')),
      foes: [foe('brock', 'Brock', 2, 52, 6, board(unit(0, 'golem'), unit(1, 'rhydon'), unit(2, 'onix', 2), unit(7, 'machamp'), unit(8, 'kabutops'), unit(9, 'graveler'))), foe('gary', 'Gary', 3, 64, 6, board(unit(0, 'arcanine'), unit(1, 'gyarados'), unit(7, 'alakazam'), unit(8, 'exeggutor'), unit(9, 'jolteon')))],
      seals: ['meowth-bank', 'battle-fury'], goldStart: 12, goldEarned: 7, interestEarned: 2, goldSpent: 8, goldFromSales: 2, goldEnd: 13, rolls: 4, averageGoldEarned: 6,
    },
    {
      label: '2-3', mine: board(unit(29, 'golem'), unit(30, 'venusaur', 2, ['leftovers']), unit(31, 'charizard', 2, ['life-orb']), unit(32, 'blastoise'), unit(36, 'snorlax'), unit(37, 'raichu'), unit(43, 'alakazam', 2), unit(44, 'dragonair')),
      foes: [foe('misty', 'Misty', 1, 28, 7, board(unit(0, 'blastoise', 2), unit(1, 'starmie', 2), unit(2, 'lapras'), unit(3, 'vaporeon'), unit(7, 'jynx'), unit(8, 'slowbro'), unit(9, 'poliwrath'))), foe('sabrina', 'Sabrina', 4, 41, 7, board(unit(0, 'alakazam', 2), unit(1, 'gengar'), unit(2, 'hypno'), unit(7, 'mr-mime'), unit(8, 'jolteon'), unit(9, 'kadabra')))],
      seals: ['meowth-bank', 'battle-fury'], goldStart: 13, goldEarned: 6, interestEarned: 2, goldSpent: 5, goldFromSales: 0, goldEnd: 14, rolls: 1, averageGoldEarned: 6,
    },
    {
      label: '2-4', mine: board(unit(28, 'golem', 2, ['rocky-helmet']), unit(29, 'venusaur', 2, ['leftovers']), unit(30, 'charizard', 2, ['life-orb']), unit(31, 'blastoise', 2, ['assault-vest']), unit(35, 'snorlax', 2, ['sitrus-berry']), unit(36, 'raichu', 2, ['choice-specs']), unit(42, 'alakazam', 2, ['twisted-spoon']), unit(43, 'dragonite')),
      foes: [foe('gary', 'Gary', 3, 18, 8, board(unit(0, 'arcanine', 2), unit(1, 'gyarados', 2), unit(2, 'exeggutor', 2), unit(7, 'alakazam', 2), unit(8, 'snorlax'), unit(9, 'jolteon', 2), unit(10, 'rhydon'))), foe('lance', 'Lance', 5, 23, 8, board(unit(0, 'dragonite', 2), unit(1, 'aerodactyl', 2), unit(2, 'dragonair', 2), unit(7, 'gyarados'), unit(8, 'charizard'), unit(9, 'lapras')))],
      seals: ['meowth-bank', 'battle-fury', 'big-board'], goldStart: 14, goldEarned: 7, interestEarned: 2, goldSpent: 3, goldFromSales: 2, goldEnd: 20, rolls: 0, averageGoldEarned: 6.2,
    },
  ];
  let cumulativeRolls = 0;
  const savedRounds = rounds.map((round, index) => {
    cumulativeRolls += round.rolls;
    const startedAt = new Date(Date.parse(createdAt) + index * 3 * 60_000).toISOString();
    const endedAt = index === rounds.length - 1 ? finishedAt : new Date(Date.parse(startedAt) + 2 * 60_000).toISOString();
    return {
      key: `demo-${index + 1}`, label: round.label, index, startedAt, endedAt, stage: 'combat',
      ownBoard: round.mine, opponents: round.foes, seals: round.seals, ownHp: [92, 78, 58, 38, 22][index],
      goldStart: round.goldStart, goldEnd: round.goldEnd, goldEarned: round.goldEarned,
      interestEarned: round.interestEarned, goldSpent: round.goldSpent, goldFromSales: round.goldFromSales,
      rolls: round.rolls, cumulativeRolls, averageGoldEarned: round.averageGoldEarned, boardLocked: true,
      battle: makeSampleBattle(round.mine, round.foes[0].board, index),
      actions: [
        ...Array.from({length: Math.max(0, round.goldSpent - round.rolls * 2)}, (_, n) => ({
          action: 'buy', detail: {line: round.mine[n % Math.max(1, round.mine.length)]?.line ?? 'unit'}, goldDelta: -1, rollDelta: 0,
        })),
        ...Array.from({length: round.rolls}, () => ({action: 'reroll', detail: {}, goldDelta: -2, rollDelta: 1})),
      ],
    };
  });
  return {
    schema: 'kanto-live-replay/2', id: DEMO_ID, title: 'Sample match', createdAt, updatedAt: finishedAt,
    finishedAt, complete: true, place: 1, meKey: 'demo-player', economyHook: true, rounds: savedRounds,
    totalGoldEarned: savedRounds.reduce((sum, round) => sum + round.goldEarned, 0),
    totalGoldSpent: savedRounds.reduce((sum, round) => sum + round.goldSpent, 0),
    totalInterestEarned: savedRounds.reduce((sum, round) => sum + round.interestEarned, 0), totalRolls: cumulativeRolls,
  };
}

function parseEmbeddedV35Replay(html) {
  const marker = 'const REPLAY=';
  const startAt = html.indexOf(marker);
  if (startAt < 0) throw new Error('That HTML does not contain a RUN-REPLAY-v35 replay.');
  let start = startAt + marker.length;
  while (/\s/.test(html[start] ?? '')) start++;
  if (html[start] !== '{') throw new Error('The embedded replay data is not valid JSON.');
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < html.length; index++) {
    const char = html[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{' || char === '[') depth++;
    else if (char === '}' || char === ']') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(html.slice(start, index + 1)); }
        catch { throw new Error('The embedded replay data could not be read.'); }
      }
    }
  }
  throw new Error('The embedded replay data is incomplete.');
}

function convertV35Replay(source, fileName) {
  if (!source || !Array.isArray(source.rounds) || !Array.isArray(source.seats) || !source.me) {
    throw new Error('This v35 replay is missing its match or round data.');
  }
  const seatById = new Map(source.seats.map((seat, index) => [String(seat.id), {...seat, seat: index}]));
  const me = String(source.me);
  let previousGold = null;
  let previousSeals = [];
  let allEarned = 0;
  let cumulativeRolls = 0;
  const rounds = source.rounds.map((entry, index) => {
    const players = entry.players ?? entry.before ?? [];
    const own = players.find(player => String(player.id) === me);
    if (!own) throw new Error(`Could not find your board in round ${entry.label || index + 1}.`);
    const after = (entry.after ?? []).find(player => String(player.id) === me);
    const goldStart = Number(entry.start?.gold ?? own.gold ?? 0);
    const goldEnd = Number(own.gold ?? goldStart);
    if (previousGold === null) previousGold = goldStart;
    const goldEarned = Math.max(0, goldStart - previousGold);
    const bank = previousSeals.includes('meowth-bank');
    const interestEarned = Math.min(goldEarned, Math.min(bank ? 7 : 5, Math.floor(Math.max(0, previousGold) / (bank ? 6 : 10))));
    const actions = (entry.actions ?? []).map(action => {
      const detail = Object.fromEntries(Object.entries(action).filter(([key, value]) =>
        !['t', 'gold', 'err'].includes(key) && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')));
      return {action: action.t || 'action', detail, goldDelta: Number(action.gold) || 0,
        rollDelta: action.t === 'reroll' ? 1 : 0, at: entry.label || ''};
    });
    const rolls = actions.reduce((sum, action) => sum + action.rollDelta, 0);
    const goldFromSales = actions.reduce((sum, action) => sum + (action.action === 'sell' ? Math.max(0, action.goldDelta) : 0), 0);
    const traceSpend = actions.reduce((sum, action) => sum + Math.max(0, -action.goldDelta), 0);
    const balanceSpend = Math.max(0, goldStart - goldEnd + goldFromSales);
    const ownBoard = (own.board ?? []).map(unit => ({cell: Number(unit.cell), line: unit.line, star: unit.star,
      items: unit.items ?? [], shiny: !!unit.shiny, num: unit.num}));
    const opponents = players.filter(player => String(player.id) !== me).map(player => {
      const result = (entry.after ?? []).find(afterPlayer => String(afterPlayer.id) === String(player.id));
      const seat = seatById.get(String(player.id));
      return {key: String(player.id), seat: seat?.seat ?? 0, name: player.name || seat?.name || `Opponent ${seat?.seat + 1 || ''}`,
        place: result?.place ?? player.place ?? null, hp: result?.hp ?? player.hp ?? null, level: player.level ?? null,
        board: (player.board ?? []).map(unit => ({cell: Number(unit.cell), line: unit.line, star: unit.star,
          items: unit.items ?? [], shiny: !!unit.shiny, num: unit.num}))};
    });
    const seals = Array.isArray(own.seals) ? own.seals.map(seal => typeof seal === 'string' ? seal : seal.id).filter(Boolean) : [];
    const battleOpponent = entry.battle?.opponent ? String(entry.battle.opponent) : '';
    allEarned += goldEarned;
    cumulativeRolls += rolls;
    const round = {
      key: `v35-${entry.code ?? index}`, label: entry.label || `Round ${index + 1}`, index,
      startedAt: source.made || new Date().toISOString(), endedAt: null, stage: entry.kind || 'combat',
      ownBoard, opponents, seals, ownHp: after?.hp ?? own.hp ?? null, ownLevel: own.level ?? null,
      goldStart, goldEnd, goldEarned, interestEarned, goldSpent: Math.max(traceSpend, balanceSpend), goldFromSales,
      rolls, cumulativeRolls, averageGoldEarned: allEarned / (index + 1), boardLocked: true, actions,
      battle: entry.battle ? {...entry.battle, opponentKey: battleOpponent, complete: true, truncated: false} : null,
    };
    previousGold = goldEnd;
    previousSeals = seals;
    return round;
  });
  const createdAt = Number.isNaN(new Date(source.made).getTime()) ? new Date().toISOString() : new Date(source.made).toISOString();
  const rosterLookup = Object.fromEntries(Object.entries(source.roster ?? {}).map(([id, info]) => [id, {
    name: info.name, traits: info.traits ?? [], names: info.names ?? [], nums: info.nums ?? [], skills: info.skills ?? [],
  }]));
  return {
    schema: 'kanto-live-replay/2', id: `v35-${String(source.seed ?? 'match')}-${crypto.randomUUID()}`,
    title: `v35 replay / ${fileName.replace(/\.html?$/i, '')}`, createdAt, updatedAt: createdAt,
    finishedAt: createdAt, complete: true, place: Number(source.place) || null, meKey: me,
    sourceType: 'v35', exact: !!source.exact, policyVersion: source.policyVersion || '', seed: source.seed,
    rounds, rosterLookup: source.roster ?? {}, itemLookup: source.items ?? {}, sealLookup: source.seals ?? {},
    totalGoldEarned: allEarned, totalGoldSpent: rounds.reduce((sum, round) => sum + round.goldSpent, 0),
    totalInterestEarned: rounds.reduce((sum, round) => sum + round.interestEarned, 0), totalRolls: cumulativeRolls,
  };
}

async function storeReplay(replay, {trim = true} = {}) {
  const size = JSON.stringify(replay).length * 2;
  if (size > REPLAY_STORAGE_BUDGET) throw new Error('This replay is too large to import.');
  await chrome.storage.local.set({[`replay:${replay.id}`]: replay});
  return trim ? trimReplays([replay.id]) : 0;
}

// Keep the newest replays; returns how many older ones were removed.
async function trimReplays(keep = []) {
  const {replays: saved} = await KantoUi.readReplays();
  const drop = saved.slice(MAX_SAVED_REPLAYS).filter(item => !keep.includes(item.id));
  if (drop.length) {
    const fights = drop.flatMap(item => item.rounds?.map(round => round.battle?.key).filter(Boolean) ?? []);
    await chrome.storage.local.remove([...drop.map(item => `replay:${item.id}`), ...fights]);
  }
  return drop.length;
}

// A replay with its fights written inline (an exported file) is stored the same way the
// recorder stores it: the replay entry plus one battle entry per fight.
async function saveImported(replay) {
  const copy = structuredClone(replay);
  const fights = {};
  for (const round of copy.rounds ?? []) {
    const battle = round.battle;
    if (!battle?.frames?.length) continue;
    const key = `battle:${copy.id}:${round.key ?? round.label}`;
    fights[key] = {...battle, key};
    battleCache.delete(key);
    round.battle = {id: battle.id, myTeam: battle.myTeam, opponentKey: battle.opponentKey, time: battle.time, winner: battle.winner,
      complete: battle.complete, truncated: battle.truncated, frameCount: battle.frames.length, eventCount: battle.events?.length ?? 0, stored: true, key};
  }
  if (Object.keys(fights).length) await chrome.storage.local.set(fights);
  await storeReplay(copy, {trim: false});
  return copy;
}

// An exported file holds one replay, a list of replays, or an Export All bundle.
function replaysFromJson(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.replays) ? data.replays : [data];
  const valid = list.filter(replay => replay && typeof replay.id === 'string' && Array.isArray(replay.rounds));
  if (!valid.length) throw new Error('No replays found');
  return valid;
}

function downloadJson(value, name) {
  const blob = new Blob([JSON.stringify(value)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// A replay with every fight read back from storage, ready to save as a file.
async function fullReplay(replay) {
  const full = structuredClone(replay);
  const keys = full.rounds.map(round => round.battle?.key && !round.battle.frames?.length ? round.battle.key : null).filter(Boolean);
  const stored = keys.length ? await chrome.storage.local.get(keys) : {};
  for (const round of full.rounds) {
    const fight = round.battle?.key ? stored[round.battle.key] : null;
    if (fight?.frames?.length) round.battle = fight;
  }
  return full;
}

function setMode(library) {
  $('#library-view').hidden = !library;
  $('#replay-view').hidden = library;
  $('#export').hidden = library;
  $('#delete').hidden = library || demoMode;
  $('#import').hidden = !library || demoMode;
  $('#export-all').hidden = !library || demoMode || !replays.length;
  $('#demo-banner').hidden = !demoMode || library;
  document.body.classList.toggle('replay-open', !library);
  if (!library) requestAnimationFrame(resizeBattleStage);
}

function stopNote(replay) {
  const state = KantoUi.replayState(replay);
  if (state === 'live') return 'Recording now';
  const round = KantoUi.stoppedRound(replay);
  return round ? `Left in round ${round}` : 'Left before the end';
}

function renderLibrary() {
  setMode(true);
  const list = $('#library-list');
  list.replaceChildren();
  $('#library-empty').hidden = replays.length > 0;
  $('.match-list-head').hidden = replays.length === 0;
  for (const replay of replays) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'match-row';
    const played = document.createElement('span');
    played.className = 'played';
    const when = document.createElement('strong');
    when.textContent = KantoUi.shortDate(replay.createdAt);
    const kind = document.createElement('span');
    kind.textContent = replay.sourceType === 'v35' ? 'Imported v35 replay'
      : KantoUi.replayState(replay) === 'left' ? stopNote(replay)
        : replay.playerName || (replay.title && replay.title !== 'Kanto Tactics match' ? replay.title : 'Online match');
    played.append(when, kind);
    const stat = (value, extra) => {
      const cell = document.createElement('span');
      cell.className = `stat ${extra}`;
      cell.textContent = formatNumber(value);
      return cell;
    };
    const comp = KantoComp.compPreview(replay);
    button.append(KantoUi.placeBadge(replay), played, comp.box,
      stat(comp.value, 'value'), stat(replay.totalGoldEarned, 'gold'), stat(replay.totalRolls, 'rolls'));
    button.setAttribute('aria-label', `${button.querySelector('.place').title}, ${when.textContent}, board value ${formatNumber(comp.value)}`);
    button.addEventListener('click', () => {
      location.hash = encodeURIComponent(replay.id);
      openReplay(replay.id);
    });
    list.append(button);
  }
}

function addBoard(container, board, side) {
  container.replaceChildren();
  const units = new Map((Array.isArray(board) ? board : []).map(unit => [Number(unit.cell), unit]));
  if (!units.size) {
    const empty = document.createElement('p');
    empty.className = 'board-empty';
    empty.textContent = side === 'mine' ? 'No units were on your board this round.' : 'No public board was recorded for this player.';
    container.append(empty);
    return;
  }
  // Show only the half of the 8x7 field that holds units (rows 0-3 or 4-7), or all 8 rows if both are used.
  const cells = [...units.keys()];
  const firstRow = cells.every(cell => cell >= 28) ? 4 : 0;
  const lastRow = cells.every(cell => cell < 28) ? 3 : 7;
  let row = null;
  for (let cell = firstRow * 7; cell < (lastRow + 1) * 7; cell++) {
    if (cell % 7 === 0) {
      row = document.createElement('div');
      row.className = `hex-row${Math.floor(cell / 7) % 2 ? ' offset' : ''}`;
      container.append(row);
    }
    const tile = document.createElement('div');
    const unit = units.get(cell);
    tile.className = `cell${unit ? ` occupied ${side}` : ''}`;
    const coordinate = document.createElement('span');
    coordinate.className = 'coord';
    coordinate.textContent = cell;
    tile.append(coordinate);
    if (unit) {
      const form = unitForm(unit.line, unit.star);
      const avatar = document.createElement('div');
      avatar.className = 'board-avatar';
      const imageNum = Number(unit.num ?? form.num);
      if (imageNum > 0) {
        const image = document.createElement('img');
        image.src = assetUrl(`media/sprites/${imageNum}.gif`);
        image.alt = '';
        image.onerror = () => { image.onerror = () => { image.remove(); avatar.textContent = (form.name || pretty(unit.line)).slice(0, 2).toUpperCase(); }; image.src = assetUrl(`media/icons/${imageNum}.png`); };
        avatar.append(image);
      } else avatar.textContent = (form.name || pretty(unit.line)).slice(0, 2).toUpperCase();
      const name = document.createElement('strong');
      name.textContent = form.name || pretty(unit.line);
      tipUnit(tile, unit.line, unit.star, unit.items);
      tile.tabIndex = 0;
      tile.setAttribute('aria-label', `${form.name || pretty(unit.line)}, ${unit.star || 1} star`);
      const stars = document.createElement('span');
      stars.className = 'stars';
      stars.textContent = '★'.repeat(Math.max(1, Math.min(3, Number(unit.star) || 1)));
      name.className = 'visually-hidden';
      tile.append(avatar, stars, name);
      if (unit.items?.length) {
        const items = document.createElement('span');
        items.className = 'items';
        for (const item of unit.items.slice(0, 3)) {
          const badge = document.createElement('span');
          badge.className = 'item';
          const image = document.createElement('img');
          image.src = assetUrl(`media/items/${item}.png`);
          image.alt = '';
          image.onerror = () => { image.remove(); badge.classList.add('text'); badge.textContent = (itemInfo(item).name || pretty(item)).split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase(); };
          badge.dataset.tip = 'item';
          badge.dataset.item = item;
          badge.append(image);
          items.append(badge);
        }
        tile.append(items);
      }
      if (unit.shiny) tile.classList.add('shiny');
    }
    row.append(tile);
  }
  // The same units as chips: sprite, name, stars and held items.
  const roster = document.createElement('ul');
  roster.className = 'roster';
  for (const unit of [...units.values()].sort((a, b) => a.cell - b.cell)) {
    const info = KantoComp.unitInfo(unit);
    const item = document.createElement('li');
    const who = document.createElement('span');
    who.className = 'roster-unit';
    tipUnit(who, unit.line, unit.star, unit.items);
    who.tabIndex = 0;
    const pic = document.createElement('span');
    pic.className = 'roster-pic';
    KantoComp.sprite(unit, info, pic);
    const name = document.createElement('strong');
    name.textContent = info.name;
    const stars = document.createElement('span');
    stars.className = 'stars';
    stars.textContent = '★'.repeat(Math.max(1, Math.min(3, Number(unit.star) || 1)));
    stars.setAttribute('aria-label', `${unit.star || 1} star`);
    who.append(pic, name, stars);
    item.append(who);
    for (const id of (unit.items ?? []).slice(0, 3)) item.append(KantoComp.itemIcon(id, 'roster-item'));
    roster.append(item);
  }
  container.append(roster);
}

const BATTLE_WIDTH = 540;
const BATTLE_HEIGHT = 520;
const BATTLE_W = 72;
const BATTLE_H = 62;
const BATTLE_PAD_X = 18;
const BATTLE_PAD_Y = 22;
const battleXY = (cell, flip) => {
  const value = Math.max(0, Math.min(55, Number(cell) || 0));
  const normalized = flip ? 55 - value : value;
  const row = Math.floor(normalized / 7);
  const col = normalized % 7;
  return [BATTLE_PAD_X + (col + (row % 2 ? 0.5 : 0)) * BATTLE_W + BATTLE_W / 2 - 6,
    BATTLE_PAD_Y + row * BATTLE_H + BATTLE_H / 2 - 8];
};

function initializeBattleStage() {
  const hexes = $('#battle-hexes');
  if (hexes.childElementCount) return;
  for (let cell = 0; cell < 56; cell++) {
    const tile = document.createElement('div');
    tile.className = `battle-hex${cell >= 28 ? ' mine' : ''}`;
    const [x, y] = battleXY(cell, false);
    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;
    hexes.append(tile);
  }
  const mid = document.createElement('div');
  mid.className = 'battle-midline';
  mid.style.top = `${BATTLE_PAD_Y + 4 * BATTLE_H - 8}px`;
  hexes.append(mid);
}

function resizeBattleStage() {
  const viewport = $('.battle-stage-viewport');
  const stage = $('#battle-stage');
  if (!viewport || !stage) return;
  const width = viewport.clientWidth || BATTLE_WIDTH;
  const fill = getComputedStyle(viewport).getPropertyValue('--fill-height').trim() === '1';
  const height = fill ? viewport.clientHeight : Infinity;
  const scale = Math.max(0.3, Math.min(1.25, width / BATTLE_WIDTH, height / BATTLE_HEIGHT));
  stage.style.transform = `scale(${scale})`;
  stage.style.marginLeft = `${Math.max(0, (width - BATTLE_WIDTH * scale) / 2)}px`;
  if (!fill) viewport.style.height = `${BATTLE_HEIGHT * scale}px`;
  else viewport.style.height = '';
}
if (globalThis.ResizeObserver) {
  const observer = new ResizeObserver(() => resizeBattleStage());
  addEventListener('DOMContentLoaded', () => { const viewport = $('.battle-stage-viewport'); if (viewport) observer.observe(viewport); });
  const viewport = document.querySelector('.battle-stage-viewport');
  if (viewport) observer.observe(viewport);
}

function clearBattleUnits() {
  $('#battle-units').replaceChildren();
  $('#battle-fx').replaceChildren();
  $('#battle-zones').replaceChildren();
  logRows = [];
  logActive = -1;
  battleNodes = {};
}

function makeBattleUnit(meta) {
  const unit = document.createElement('div');
  unit.className = `battle-unit${Number(meta.team) === Number(battleRecord?.myTeam) ? ' mine' : ' foe'}`;
  unit.dataset.uid = String(meta.uid);
  tipUnit(unit, meta.line, meta.star, meta.items);
  const bubble = document.createElement('div');
  bubble.className = 'battle-bubble';
  const stars = document.createElement('div');
  stars.className = 'unit-stars';
  stars.textContent = '★'.repeat(Math.max(1, Math.min(3, Number(meta.star) || 1)));
  const avatar = document.createElement('div');
  avatar.className = 'battle-avatar';
  const form = unitForm(meta.line, meta.star);
  const imageNum = Number(meta.num || form.num || KantoComp.unitInfo({line: meta.line, star: meta.star}).num);
  if (imageNum > 0) {
    const image = document.createElement('img');
    image.src = assetUrl(`media/sprites/${imageNum}.gif`);
    image.alt = '';
    image.onerror = () => { image.remove(); avatar.classList.add('fallback'); avatar.textContent = (meta.name || form.name || pretty(meta.line)).slice(0, 2).toUpperCase(); };
    avatar.append(image);
  } else {
    avatar.classList.add('fallback');
    avatar.textContent = (meta.name || form.name || pretty(meta.line)).slice(0, 2).toUpperCase();
  }
  const label = document.createElement('div');
  label.className = 'unit-name';
  label.textContent = pretty(meta.name || form.name || meta.line);
  const hp = document.createElement('div');
  hp.className = 'unit-bar hp';
  const hpFill = document.createElement('i');
  hp.append(hpFill);
  const shield = document.createElement('div');
  shield.className = 'unit-bar shield';
  const shieldFill = document.createElement('i');
  shield.append(shieldFill);
  const mana = document.createElement('div');
  mana.className = 'unit-bar mana';
  const manaFill = document.createElement('i');
  mana.append(manaFill);
  const items = document.createElement('div');
  items.className = 'battle-items';
  for (const item of (meta.items ?? []).slice(0, 3)) {
    const badge = document.createElement('span');
    const icon = document.createElement('img');
    icon.src = assetUrl(`media/items/${item}.png`);
    icon.alt = '';
    icon.onerror = () => { icon.remove(); badge.textContent = (itemInfo(item).name || pretty(item)).slice(0, 2); };
    badge.append(icon);
    items.append(badge);
  }
  unit.append(bubble, stars, avatar, label, hp, shield, mana, items);
  $('#battle-units').append(unit);
  battleNodes[String(meta.uid)] = {element: unit, hp: hpFill, shield: shieldFill, mana: manaFill, bubble, position: [0, 0], meta};
}

// The engine writes fight text in Spanish; show the game's own English wording.
function fightText(value) {
  const table = globalThis.KANTO_FIGHT_TEXT;
  const text = String(value ?? '');
  if (!table) return text;
  if (table.exact[text]) return table.exact[text];
  for (const [prefix, english] of table.prefixes) if (text.startsWith(prefix)) return english;
  return text;
}

// Skill names come from the game's English roster; the fight engine names them in Spanish.
function castName(event) {
  const meta = battleNodes[String(event.src ?? event.uid)]?.meta;
  const transforming = /^(mew|ditto)$/.test(String(meta?.line ?? ''));
  const chosen = meta?.form && KANTO_TIP_DATA.units[meta.line]?.flex?.[meta.form]?.[meta.star-1]?.name;
  const english = chosen || (!transforming && meta ? unitForm(meta.line, meta.star)?.skill?.name ?? KantoTips.findUnit(meta.line, meta.star)?.form?.skill?.name : null);
  return english || fightText(event.name) || 'Ability';
}
const CC_TEXT = {freeze: 'Frozen', airborne: 'Airborne', fear: 'Feared', recharge: 'Recharging', sleep: 'Asleep', stun: 'Stunned',
  paralyze: 'Paralyzed', confuse: 'Confused', flinch: 'Flinched', root: 'Rooted', taunt: 'Taunted', charm: 'Charmed'};
const LOG_KINDS = new Set(['cast', 'cc', 'faint', 'ko', 'transform', 'end', 'execute']);
let logRows = [];
let logActive = -1;

// One log line: what happened, in plain words, without the unit name.
function eventWhat(event) {
  if (event.k === 'cast') return castName(event);
  if (event.k === 'cc') return `${CC_TEXT[event.cc] ?? pretty(event.cc || 'Disabled')}${Number(event.dur) > 0 ? ` ${Number(event.dur).toFixed(1)}s` : ''}`;
  if (event.k === 'faint' || event.k === 'ko') return 'Fainted';
  if (event.k === 'transform') return 'Transformed';
  if (event.k === 'execute') return 'Execute';
  return pretty(event.k);
}

// HP of a unit at a moment of the fight, from the nearest saved frame.
function hpAt(uid, time) {
  const frames = battleRecord?.frames;
  if (!frames?.length) return null;
  let low = 0, high = frames.length - 1;
  while (low < high) { const middle = (low + high + 1) >> 1; if (Number(frames[middle][0]) <= time) low = middle; else high = middle - 1; }
  const unit = frames[low][1]?.find(item => String(item[0]) === String(uid));
  return unit ? {hp: Math.max(0, Number(unit[4]) || 0), max: Math.max(1, Number(unit[8]) || 1)} : null;
}

function renderBattleEvents(battle) {
  const list = $('#battle-event-list');
  list.replaceChildren();
  logRows = [];
  logActive = -1;
  const events = (battle?.events ?? []).filter(event => LOG_KINDS.has(event.k) && (event.k !== 'ko' || !battle.events.some(other => other.k === 'faint')));
  if (battle?.complete && events.length && !events.some(event => event.k === 'end')) events.push({k: 'end', t: Number(battle.time) || events.at(-1).t, winner: battle.winner});
  if (!events.length) {
    const empty = document.createElement('div');
    empty.className = 'battle-empty';
    empty.textContent = battle?.frames?.length ? 'No combat events were exposed by this game build.' : 'No fight playback was captured for this round.';
    list.append(empty);
    return;
  }
  for (const event of events) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'battle-event';
    const time = document.createElement('time');
    time.textContent = `${Number(event.t).toFixed(1)}s`;
    row.append(time);
    if (event.k === 'end') {
      const yours = Number(event.winner) === Number(battle.myTeam);
      row.classList.add('end');
      const text = document.createElement('span');
      text.className = 'ev-text';
      text.textContent = event.winner === -1 ? 'Draw' : yours ? 'Victory' : 'Defeat';
      row.append(document.createElement('span'), text);
    } else {
      const uid = event.k === 'cast' ? event.src : event.uid ?? event.src;
      const node = battleNodes[String(uid)];
      const meta = node?.meta;
      const mine = Number(meta?.team) === Number(battle.myTeam);
      const unit = document.createElement('span');
      unit.className = `ev-unit ${mine ? 'home' : 'away'}`;
      const form = meta ? unitForm(meta.line, meta.star) : {};
      const num = Number(meta?.num || form.num || (meta ? KantoComp.unitInfo({line: meta.line, star: meta.star}).num : 0));
      if (num > 0) KantoComp.sprite({line: meta?.line, star: meta?.star}, {name: pretty(meta?.name || form.name || meta?.line || ''), num}, unit);
      const health = hpAt(uid, Number(event.t));
      const bar = document.createElement('i');
      bar.style.setProperty('--hp', `${health ? Math.round(health.hp / health.max * 100) : 100}%`);
      unit.append(bar);
      const text = document.createElement('span');
      text.className = 'ev-text';
      const name = document.createElement('b');
      name.textContent = pretty(meta?.name || form.name || meta?.line || 'Unit');
      const what = document.createElement('span');
      what.className = `ev-what ${event.k}`;
      what.textContent = eventWhat(event);
      text.append(name, what);
      const hp = document.createElement('span');
      hp.className = 'ev-hp num';
      hp.textContent = health ? `${formatNumber(Math.round(health.hp))} HP` : '';
      row.title = `${mine ? 'Your' : 'Enemy'} ${name.textContent}`;
      row.append(unit, text, hp);
      if (meta) tipUnit(unit, meta.line, meta.star, meta.items);
    }
    row.addEventListener('click', () => {
      battleTime = Math.max(0, Number(event.t));
      renderBattleFrame();
    });
    list.append(row);
    logRows.push({t: Number(event.t), row});
  }
}

// Highlight the latest event at the current playback time and keep it in view inside the list.
function updateActiveEvent() {
  if (!logRows.length) return;
  let index = -1;
  for (let i = 0; i < logRows.length && logRows[i].t <= battleTime + 1e-6; i++) index = i;
  if (index === logActive) return;
  logRows[logActive]?.row.classList.remove('active');
  logActive = index;
  const row = logRows[index]?.row;
  if (!row) return;
  row.classList.add('active');
  const list = $('#battle-event-list');
  const top = row.offsetTop - list.offsetTop;
  if (top < list.scrollTop || top + row.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = Math.max(0, top - list.clientHeight / 3);
}

const BATTLE_METRICS = {
  dealt: {segments: [['Basic attacks', '#c9dfa0', unit => Math.max(0, Number(unit[9]) - Number(unit[10]))],
    ['Abilities', '#e7c184', unit => Number(unit[10]) || 0], ['Damage over time', '#c4adf0', unit => Number(unit[11]) || 0]]},
  taken: {segments: [['HP lost', '#e6aa96', unit => Number(unit[12]) || 0],
    ['Blocked', '#7d8f7a', unit => Number(unit[13]) || 0]]},
  heal: {segments: [['Healing done', '#9fd6a8', unit => Number(unit[14]) || 0]]},
  shield: {segments: [['Shields given', '#dfe7f0', unit => Number(unit[15]) || 0]]},
};

function renderBattleMeter(frame) {
  const config = BATTLE_METRICS[battleMetric];
  const legend = $('#metric-legend');
  const list = $('#metric-list');
  legend.replaceChildren();
  list.replaceChildren();
  for (const [name, color] of config.segments) {
    const item = document.createElement('span');
    item.style.setProperty('--metric-color', color);
    item.textContent = name;
    legend.append(item);
  }
  if (!frame?.[1]?.length) {
    const empty = document.createElement('div');
    empty.className = 'battle-empty';
    empty.textContent = 'No unit totals in this frame.';
    list.append(empty);
    return;
  }
  const units = frame[1].map(values => ({
    values,
    meta: battleNodes[String(values[0])]?.meta,
    parts: config.segments.map(([, , value]) => Math.max(0, value(values))),
  })).filter(unit => unit.meta);
  const maximum = Math.max(1, ...units.map(unit => unit.parts.reduce((sum, part) => sum + part, 0)));
  for (const [team, title] of [[battleRecord.myTeam, 'Your team'], [null, 'Opponent']]) {
    const rows = units.filter(unit => (Number(unit.meta.team) === Number(battleRecord.myTeam)) === (team !== null))
      .sort((a, b) => b.parts.reduce((sum, part) => sum + part, 0) - a.parts.reduce((sum, part) => sum + part, 0));
    if (!rows.length) continue;
    const total = rows.reduce((sum, row) => sum + row.parts.reduce((subtotal, part) => subtotal + part, 0), 0);
    const heading = document.createElement('div');
    heading.className = `metric-team ${team !== null ? 'mine' : 'foe'}`;
    const teamName = document.createElement('span');
    teamName.textContent = title;
    const teamTotal = document.createElement('strong');
    teamTotal.textContent = formatNumber(total);
    heading.append(teamName, teamTotal);
    const block = document.createElement('div');
    block.className = `metric-block ${team !== null ? 'mine' : 'foe'}`;
    block.style.setProperty('--rows', String(rows.length));
    block.append(heading);
    list.append(block);
    for (const rowData of rows) {
      const row = document.createElement('div');
      row.className = `metric-row${rowData.values[7] ? '' : ' fainted'}${String(rowData.meta.uid) === String(highlightedBattleUid) ? ' highlighted' : ''}`;
      row.dataset.uid = String(rowData.meta.uid);
      tipUnit(row, rowData.meta.line, rowData.meta.star, rowData.meta.items);
      const avatar = document.createElement('span');
      avatar.className = 'metric-avatar';
      const imageNum = Number(rowData.meta.num ?? unitForm(rowData.meta.line, rowData.meta.star).num);
      if (imageNum > 0) {
        const image = document.createElement('img');
        image.src = assetUrl(`media/sprites/${imageNum}.gif`);
        image.alt = '';
        image.onerror = () => { image.onerror = () => { image.remove(); avatar.textContent = pretty(rowData.meta.name || rowData.meta.line).slice(0, 2); }; image.src = assetUrl(`media/icons/${imageNum}.png`); };
        avatar.append(image);
      } else avatar.textContent = pretty(rowData.meta.name || rowData.meta.line).slice(0, 2);
      const name = document.createElement('span');
      name.className = 'metric-name';
      name.textContent = pretty(rowData.meta.name || rowData.meta.line);
      const stars = document.createElement('span');
      stars.className = 'metric-stars';
      stars.textContent = '★'.repeat(Math.max(1, Math.min(3, Number(rowData.meta.star) || 1)));
      name.append(' ', stars);
      if (!rowData.values[7]) {
        const fainted = document.createElement('small');
        fainted.textContent = ' fainted';
        name.append(fainted);
      }
      const bar = document.createElement('span');
      bar.className = 'metric-bar';
      rowData.parts.forEach((value, index) => {
        if (!value) return;
        const segment = document.createElement('i');
        segment.style.width = `${value / maximum * 100}%`;
        segment.style.background = config.segments[index][1];
        bar.append(segment);
      });
      const amount = document.createElement('strong');
      amount.className = 'metric-value';
      amount.textContent = formatNumber(rowData.parts.reduce((sum, part) => sum + part, 0));
      row.append(avatar, name, bar, amount);
      row.addEventListener('mouseenter', () => highlightBattleUnit(rowData.meta.uid));
      row.addEventListener('mouseleave', () => highlightBattleUnit(null));
      block.append(row);
    }
  }
}

function highlightBattleUnit(uid) {
  highlightedBattleUid = uid;
  for (const [key, node] of Object.entries(battleNodes)) node.element.classList.toggle('highlighted', String(uid) === key);
  $('#metric-list').querySelectorAll('.metric-row').forEach(row => row.classList.toggle('highlighted', String(uid) === row.dataset.uid));
}

function renderBattleSeals(battle) {
  const container = $('#battle-seals');
  container.replaceChildren();
  const seals = new Map();
  for (const event of battle?.events ?? []) {
    if (event.k !== 'seal' || !event.id) continue;
    seals.set(`${event.team}:${event.id}`, event);
  }
  if (!seals.size) return;
  for (const event of seals.values()) {
    const chip = document.createElement('span');
    const yours = Number(event.team) === Number(battle.myTeam);
    chip.className = `chip ${yours ? 'active' : 'foe'}`;
    chip.dataset.tip = 'seal';
    chip.dataset.seal = event.id;
    chip.dataset.owner = yours ? 'Your Seal' : "Opponent's Seal";
    chip.tabIndex = 0;
    chip.append(KantoTips.sealIcon(event.id, 18), sealLabel(event.id));
    container.append(chip);
  }
}

function frameIndexAt(time) {
  const frames = battleRecord?.frames ?? [];
  let low = 0;
  let high = Math.max(0, frames.length - 1);
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if (Number(frames[middle]?.[0]) <= time) low = middle;
    else high = middle - 1;
  }
  return low;
}

function framePosition(unit, flip) {
  const from = battleXY(unit[1], flip);
  const to = battleXY(unit[2], flip);
  const progress = Math.max(0, Math.min(1, Number(unit[3]) || 0));
  return [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress];
}

const SVG = 'http://www.w3.org/2000/svg';
// Pointy-top hex matching the stage tiles (68 x 79, centred 8px below the tile anchor).
function hexPolygon(cell, flip, scale = 0.92) {
  const [x, y] = battleXY(cell, flip);
  const cx = x, cy = y + 8, w = 34 * scale, h = 39.5 * scale;
  const shape = document.createElementNS(SVG, 'polygon');
  shape.setAttribute('points', [[0, -h], [w, -h / 2], [w, h / 2], [0, h], [-w, h / 2], [-w, -h / 2]].map(([dx, dy]) => `${cx + dx},${cy + dy}`).join(' '));
  return shape;
}

// Skill areas under the units: the hexes a skill hits, and lasting zones while they last.
function renderBattleZones() {
  const layer = $('#battle-zones');
  layer.replaceChildren();
  if (!battleRecord?.events?.length) return;
  const flip = Number(battleRecord.myTeam) === 1;
  for (const event of battleRecord.events) {
    const t = Number(event.t);
    if (t > battleTime) break;
    if (event.k === 'cast' && event.cells?.length && battleTime - t < 0.45) {
      const fade = 1 - (battleTime - t) / 0.45;
      for (const cell of event.cells) {
        const shape = hexPolygon(cell, flip);
        shape.setAttribute('fill', `rgba(248,205,114,${(0.26 * fade).toFixed(3)})`);
        shape.setAttribute('stroke', `rgba(248,205,114,${(0.55 * fade).toFixed(3)})`);
        shape.setAttribute('stroke-width', '1.5');
        layer.append(shape);
      }
    }
    if (event.k === 'zone' && event.cells?.length && battleTime - t < (Number(event.dur) || 0)) {
      const mine = Number(battleNodes[String(event.src)]?.meta?.team) === Number(battleRecord.myTeam);
      for (const cell of event.cells) {
        const shape = hexPolygon(cell, flip);
        shape.setAttribute('fill', mine ? 'rgba(201,223,160,.16)' : 'rgba(230,170,150,.16)');
        layer.append(shape);
      }
    }
  }
}

function renderBattleEffects() {
  renderBattleZones();
  const effects = $('#battle-fx');
  effects.replaceChildren();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(BATTLE_WIDTH));
  svg.setAttribute('height', String(BATTLE_HEIGHT));
  const events = (battleRecord?.events ?? []).filter(event => Number(event.t) >= battleTime - 0.85 && Number(event.t) <= battleTime);
  for (const event of events) {
    const age = battleTime - Number(event.t);
    const source = battleNodes[String(event.src)];
    const target = battleNodes[String(event.dst ?? event.uid)];
    const point = target?.position ?? source?.position;
    if (event.k === 'attack' && source && target && age < 0.28) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', event.ranged ? 'circle' : 'line');
      if (event.ranged) {
        line.setAttribute('cx', String(source.position[0] + (target.position[0] - source.position[0]) * Math.min(1, age / 0.24)));
        line.setAttribute('cy', String(source.position[1] + (target.position[1] - source.position[1]) * Math.min(1, age / 0.24) - 15));
        line.setAttribute('r', '4');
        line.setAttribute('fill', '#ffe8a6');
      } else {
        line.setAttribute('x1', String(source.position[0])); line.setAttribute('y1', String(source.position[1] - 18));
        line.setAttribute('x2', String(target.position[0])); line.setAttribute('y2', String(target.position[1] - 18));
        line.setAttribute('stroke', source.meta.team === battleRecord.myTeam ? '#9cc6ff' : '#ff9b9b');
        line.setAttribute('stroke-width', '2'); line.setAttribute('stroke-opacity', String(Math.max(0, 1 - age / 0.28)));
      }
      svg.append(line);
    }
    if ((event.k === 'cast' || event.k === 'charge') && source && age < 0.45) {
      const fade = String(Math.max(0, 1 - age / 0.45));
      if (target && target !== source) {
        const line = document.createElementNS(SVG, 'line');
        line.setAttribute('x1', String(source.position[0])); line.setAttribute('y1', String(source.position[1] - 10));
        line.setAttribute('x2', String(target.position[0])); line.setAttribute('y2', String(target.position[1] - 10));
        line.setAttribute('stroke', '#f8cd72'); line.setAttribute('stroke-width', '3'); line.setAttribute('stroke-opacity', fade);
        svg.append(line);
      }
      if (event.k === 'cast') {
        const ring = document.createElementNS(SVG, 'circle');
        ring.setAttribute('cx', String(source.position[0])); ring.setAttribute('cy', String(source.position[1] - 10));
        ring.setAttribute('r', String(26 + age * 40)); ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', '#f8cd72'); ring.setAttribute('stroke-width', '3'); ring.setAttribute('stroke-opacity', fade);
        svg.append(ring);
      }
    }
    if (!point || !['dmg', 'heal', 'cast', 'text', 'faint', 'ko', 'execute'].includes(event.k)) continue;
    const float = document.createElement('div');
    float.className = 'battle-float';
    float.style.left = `${point[0]}px`;
    float.style.top = `${point[1] - 34 - age * 22}px`;
    float.style.opacity = String(Math.max(0, 1 - age / 0.85));
    if (event.k === 'dmg') { float.textContent = `${formatNumber(event.amount)}${event.crit ? '!' : ''}`; float.style.color = event.dot ? '#c38df0' : '#fff'; }
    else if (event.k === 'heal') { float.textContent = `+${formatNumber(event.amount)}`; float.style.color = '#6ee39a'; }
    else if (event.k === 'cast') { float.textContent = castName(event); float.style.color = '#f8cd72'; }
    else if (event.k === 'faint' || event.k === 'ko') { float.textContent = '💥'; float.style.fontSize = '20px'; }
    else if (event.k === 'execute') { float.textContent = 'Execute'; float.style.color = '#ffb085'; }
    else { float.textContent = fightText(event.text); float.style.color = event.color || '#ddd'; }
    effects.append(float);
  }
  effects.prepend(svg);
}

function renderBattleFrame() {
  if (!battleRecord?.frames?.length) return;
  const frames = battleRecord.frames;
  const index = frameIndexAt(battleTime);
  const first = frames[index];
  const second = frames[Math.min(index + 1, frames.length - 1)];
  const interval = Number(second[0]) - Number(first[0]);
  const interpolation = interval > 0 ? Math.max(0, Math.min(1, (battleTime - Number(first[0])) / interval)) : 0;
  const next = new Map(second[1].map(unit => [String(unit[0]), unit]));
  const seen = new Set();
  const flip = Number(battleRecord.myTeam) === 1;
  for (const unit of first[1]) {
    const key = String(unit[0]);
    const node = battleNodes[key];
    if (!node) continue;
    seen.add(key);
    const following = next.get(key) ?? unit;
    const p0 = framePosition(unit, flip);
    const p1 = framePosition(following, flip);
    const position = [p0[0] + (p1[0] - p0[0]) * interpolation, p0[1] + (p1[1] - p0[1]) * interpolation];
    node.position = position;
    node.element.style.display = '';
    node.element.style.transform = `translate(${position[0]}px,${position[1]}px)`;
    node.element.classList.toggle('dead', !unit[7]);
    const maxHp = Math.max(1, Number(unit[8]) || Number(node.meta.maxHp) || 1);
    const hp = Number(unit[4]) + ((Number(following[4]) || 0) - Number(unit[4])) * interpolation;
    const shield = Number(unit[5]) || 0;
    node.hp.style.width = `${Math.max(0, Math.min(100, hp / maxHp * 100))}%`;
    node.shield.style.left = `${Math.min(100, hp / maxHp * 100)}%`;
    node.shield.style.width = `${Math.min(100 - Math.min(100, hp / maxHp * 100), shield / maxHp * 100)}%`;
    node.mana.style.width = `${Math.min(100, (Number(unit[6]) || 0) / Math.max(1, Number(node.meta.maxMana) || 100) * 100)}%`;
    node.bubble.style.opacity = shield > 0 && unit[7] ? Math.min(0.95, 0.35 + shield / maxHp * 2.2) : 0;
  }
  for (const [key, node] of Object.entries(battleNodes)) if (!seen.has(key)) node.element.style.display = 'none';
  $('#battle-time').textContent = `${battleTime.toFixed(1)} / ${(Number(battleRecord.time) || Number(frames.at(-1)?.[0]) || 0).toFixed(1)}s`;
  const duration = Number(battleRecord.time) || Number(frames.at(-1)?.[0]) || 0;
  $('#battle-scrub').value = duration ? String(Math.round(battleTime / duration * 1000)) : '0';
  $('#battle-banner').hidden = !battleRecord.complete || battleTime < duration - 0.001;
  $('#battle-banner').textContent = battleRecord.winner === -1 ? 'Draw'
    : Number(battleRecord.winner) === Number(battleRecord.myTeam) ? 'Victory' : 'Defeat';
  renderBattleEffects();
  updateActiveEvent();
  if (performance.now() - battleMetricAt >= 100) {
    battleMetricAt = performance.now();
    renderBattleMeter(first);
  }
}

function pauseBattle() {
  battlePlaying = false;
  if (battleTimer) cancelAnimationFrame(battleTimer);
  battleTimer = 0;
  $('#battle-play').textContent = 'Play';
}

function tickBattle(now) {
  if (!battlePlaying || !battleRecord) return;
  const duration = Number(battleRecord.time) || Number(battleRecord.frames.at(-1)?.[0]) || 0;
  battleTime = Math.min(duration, battleTime + Math.min(0.1, (now - battleLast) / 1000) * battleSpeed);
  battleLast = now;
  renderBattleFrame();
  if (battleTime >= duration) pauseBattle();
  else battleTimer = requestAnimationFrame(tickBattle);
}

function playBattle() {
  if (!battleRecord?.frames?.length || battlePlaying) return;
  const duration = Number(battleRecord.time) || Number(battleRecord.frames.at(-1)?.[0]) || 0;
  if (battleTime >= duration) battleTime = 0;
  battlePlaying = true;
  $('#battle-play').textContent = 'Pause';
  battleLast = performance.now();
  battleTimer = requestAnimationFrame(tickBattle);
}

let shownBattle = null;
let battleRequest = 0;

// Re-render the fight only when a different round or a newly finished fight is shown,
// so saving the live match in the background never restarts playback.
async function renderBattle(round, selected, {force = false, autoplay = true} = {}) {
  const identity = [current?.id, round.key ?? round.label, round.battle?.id, round.battle?.complete, round.battle?.frameCount ?? round.battle?.frames?.length ?? 0].join('|');
  if (!force && identity === shownBattle) {
    if (battleRecord) $('#battle-title').textContent = `You vs ${foughtOpponent(round, battleRecord).name}`;
    return;
  }
  shownBattle = identity;
  const request = ++battleRequest;
  pauseBattle();
  clearBattleUnits();
  highlightedBattleUid = null;
  battleMetricAt = 0;
  battleRecord = null;
  const title = $('#battle-title');
  const result = $('#battle-result');
  const note = $('#battle-note');
  const controls = ['#battle-play', '#battle-restart', '#battle-scrub', '#battle-speed'];
  $('#battle-subtitle').textContent = `Round ${round.label || roundIndex + 1}`;
  $('#battle-banner').hidden = true;
  note.textContent = '';
  const noFight = /carousel/i.test(`${round.stage ?? ''} ${round.label ?? ''}`);
  const showEmpty = text => {
    for (const selector of controls) $(selector).disabled = true;
    $('#battle-time').textContent = '-';
    $('#battle-event-list').replaceChildren();
    $('#metric-list').replaceChildren();
    $('#metric-legend').replaceChildren();
    renderBattleSeals(null);
    const empty = document.createElement('div');
    empty.className = 'battle-empty';
    empty.textContent = text;
    $('#battle-event-list').append(empty);
  };
  if (noFight) {
    $('#battle-card').hidden = false;
    title.textContent = 'Carousel';
    result.textContent = '';
    result.className = 'battle-result';
    showEmpty('No fight in a carousel round');
    return;
  }
  $('#battle-card').hidden = false;
  initializeBattleStage();
  resizeBattleStage();
  const loaded = hasFrames(round.battle) ? await loadBattle(round.battle) : null;
  if (request !== battleRequest) return;
  battleRecord = loaded?.frames?.length ? loaded : null;
  if (!battleRecord) {
    title.textContent = round.battle && !round.battle.complete ? 'Fight in progress' : 'No fight saved';
    result.textContent = '';
    result.className = 'battle-result';
    showEmpty(round.battle && !round.battle.complete ? 'The fight appears here when it ends.' : 'No fight log');
    return;
  }
  for (const selector of controls) $(selector).disabled = false;
  const fought = foughtOpponent(round, battleRecord);
  title.textContent = `You vs ${fought.name}`;
  // The pairing can become known only once the fight loads; pick that player then.
  const picker = $('#opponent-select');
  if (fought.player && picker.value === FIGHT_BOARD) {
    [...picker.options].find(option => option.value === FIGHT_BOARD)?.remove();
    picker.value = fought.key;
  }
  showOpponentBoard(round);
  updateRefight(round, battleRecord);
  const outcome = !battleRecord.complete ? 'progress'
    : battleRecord.winner === -1 ? 'draw'
      : Number(battleRecord.winner) === Number(battleRecord.myTeam) ? 'won' : 'lost';
  result.textContent = outcome === 'progress' ? 'Incomplete' : outcome === 'draw' ? 'Draw' : outcome === 'won' ? 'Victory' : 'Defeat';
  result.className = `battle-result ${outcome}`;
  if (battleRecord.truncated) note.textContent = 'This fight ran past the recording limit, so its end is missing.';
  else if (!battleRecord.complete) note.textContent = 'The page closed during this fight, so its end is missing.';
  battleRecord.meta?.forEach(makeBattleUnit);
  renderBattleEvents(battleRecord);
  renderBattleSeals(battleRecord);
  battleTime = 0;
  $('#battle-speed').value = String(battleSpeed);
  renderBattleFrame();
  if (autoplay) playBattle();
}

function renderActions(round) {
  const list = $('#action-list');
  list.replaceChildren();
  if (!round.actions?.length) {
    const empty = document.createElement('p');
    empty.className = 'note';
    empty.textContent = 'No buys, sells or rolls were captured for this round.';
    list.append(empty);
    return;
  }
  // Collapse runs of the same action ("Reroll" x4) into one line.
  const groups = [];
  for (const action of round.actions.slice(-200)) {
    const detail = Object.entries(action.detail ?? {})
      .filter(([key, value]) => value !== null && value !== '' && !/^(t|type|kind)$/i.test(key) && String(value) !== String(action.action))
      .map(([key, value]) => (/^(line|unit|id|name)$/i.test(key) ? pretty(value) : `${pretty(key)} ${pretty(value)}`)).join(', ');
    const label = `${pretty(action.action)}${detail ? ` ${detail}` : ''}`;
    const last = groups.at(-1);
    if (last && last.label === label) { last.count++; last.gold += Number(action.goldDelta) || 0; last.rolls += Number(action.rollDelta) || 0; }
    else groups.push({label, count: 1, gold: Number(action.goldDelta) || 0, rolls: Number(action.rollDelta) || 0});
  }
  for (const group of groups) {
    const row = document.createElement('div');
    row.className = 'round-action';
    const label = document.createElement('strong');
    label.textContent = group.label;
    row.append(label);
    if (group.count > 1) {
      const times = document.createElement('span');
      times.className = 'times';
      times.textContent = `×${group.count}`;
      row.append(times);
    }
    const delta = document.createElement('span');
    delta.className = `delta${group.gold < 0 ? ' negative' : ''}`;
    delta.textContent = group.gold ? `${group.gold > 0 ? '+' : '−'}${formatNumber(Math.abs(group.gold))} gold` : '';
    row.append(delta);
    list.append(row);
  }
}

function activeRound() {
  return current?.rounds?.[roundIndex] ?? null;
}

function selectedOpponent(round) {
  const key = $('#opponent-select').value;
  return round?.opponents?.find(player => player.key === key) ?? round?.opponents?.[0] ?? null;
}

// Shops seen this round (opening shop, then one per reroll) and everything they offered.
function renderShop(round) {
  const shops = Array.isArray(round.shops) ? round.shops : [];
  const list = $('#shop-list');
  const found = $('#shop-found');
  list.replaceChildren();
  found.replaceChildren();
  if (!shops.length) {
    $('#shop-summary').textContent = '';
    const empty = document.createElement('p');
    empty.className = 'note';
    empty.textContent = 'No shop recorded for this round.';
    list.append(empty);
    return;
  }
  const counts = new Map();
  let seen = 0;
  for (const shop of shops) for (const line of shop.units) if (line) { counts.set(line, (counts.get(line) ?? 0) + 1); seen++; }
  // Roll numbers come from the game's own counter, so a reroll the recorder missed still counts.
  const firstRoll = Number(shops[0].roll) || 0;
  const rolls = Math.max(shops.filter(shop => shop.kind === 'roll').length, (Number(shops.at(-1).roll) || 0) - firstRoll);
  $('#shop-summary').textContent = `${rolls} roll${rolls === 1 ? '' : 's'} / ${seen} Pokémon seen`;
  const costOf = line => KantoTips.findUnit(line, 1).unit?.cost ?? 0;
  for (const [line, count] of [...counts].sort((a, b) => b[1] - a[1] || costOf(b[0]) - costOf(a[0]) || a[0].localeCompare(b[0]))) {
    const chip = document.createElement('span');
    chip.className = `shop-count cost-${costOf(line)}`;
    tipUnit(chip, line, 1, []);
    const pic = document.createElement('span');
    pic.className = 'shop-pic';
    KantoComp.sprite({line, star: 1}, KantoComp.unitInfo({line, star: 1}), pic);
    const number = document.createElement('b');
    number.textContent = `×${count}`;
    chip.append(pic, number);
    found.append(chip);
  }
  let roll = 0;
  shops.forEach(shop => {
    if (shop.kind === 'roll') roll = Math.max(roll + 1, (Number(shop.roll) || 0) - firstRoll);
    const row = document.createElement('div');
    row.className = 'shop-row';
    const label = document.createElement('span');
    label.className = 'shop-label';
    label.textContent = shop.kind === 'start' ? 'Start' : shop.kind === 'roll' ? `Roll ${roll}` : 'New shop';
    row.append(label);
    shop.units.forEach((line, slot) => {
      const cell = document.createElement('span');
      cell.className = `shop-slot${line ? ` cost-${costOf(line)}` : ' empty'}${shop.bought?.includes(slot) ? ' bought' : ''}`;
      if (line) {
        tipUnit(cell, line, 1, []);
        KantoComp.sprite({line, star: 1}, KantoComp.unitInfo({line, star: 1}), cell);
        if (shop.bought?.includes(slot)) cell.title = 'Bought';
      }
      row.append(cell);
    });
    if (Number.isFinite(Number(shop.gold))) {
      const gold = document.createElement('span');
      gold.className = 'shop-gold';
      gold.textContent = `${formatNumber(shop.gold)}g`;
      row.append(gold);
    }
    list.append(row);
  });
}

// Re-fight: open a round in the website's custom battle simulator (same link format as its "Copy link").
const SIM_URL = 'https://winnywiz.github.io/auto-chess/battle.html';
const SIM_RULES = 38;
function simTeam(units) {
  const lines = globalThis.KANTO_TIP_DATA?.units ?? {};
  const items = globalThis.KANTO_TIP_DATA?.items ?? {};
  const cells = new Set();
  const team = [];
  for (const unit of units) {
    const cell = Number(unit.cell);
    if (!lines[unit.line] || !Number.isInteger(cell) || cell < 28 || cell > 55 || cells.has(cell)) continue;
    cells.add(cell);
    team.push({line: unit.line, star: Math.max(1, Math.min(3, Number(unit.star) || 1)),
      ...(['phys','spec'].includes(unit.form)?{form:unit.form}:{}),items: (unit.items ?? []).filter(item => items[item] && items[item].kind !== 'tool').slice(0, 3), cell});
    if (team.length === 9) break;
  }
  return team;
}
function refightRequest(round, battle) {
  let mine = [];
  let theirs = [];
  if (battle?.meta?.length) {
    // Fight cells cover both halves: team 0 stands on 28-55, team 1 is mirrored.
    const own = unit => ({...unit, cell: Number(unit.team) === 0 ? Number(unit.cell) : 55 - Number(unit.cell)});
    mine = battle.meta.filter(unit => Number(unit.team) === Number(battle.myTeam)).map(own);
    theirs = battle.meta.filter(unit => Number(unit.team) !== Number(battle.myTeam)).map(own);
  } else {
    mine = round.ownBoard ?? [];
    theirs = foughtOpponent(round, null).player?.board ?? [];
  }
  const a = simTeam(mine);
  const b = simTeam(theirs);
  if (!a.length || !b.length) return null;
  let seed = 0x811c9dc5;
  for (const char of `${current?.seed ?? current?.id}|${round.key ?? round.label}`) seed = Math.imul(seed ^ char.charCodeAt(0), 0x01000193) >>> 0;
  return {rules: SIM_RULES, a, b, seed, runs: 32};
}
function updateRefight(round, battle) {
  const link = $('#refight');
  const request = refightRequest(round, battle);
  link.hidden = !request || demoMode;
  if (!request) { link.removeAttribute('href'); return; }
  link.href = `${SIM_URL}#${new URLSearchParams({battle: btoa(JSON.stringify(request))})}`;
  link.title = `Open round ${round.label || ''} in the battle simulator: both boards, items and positions`;
}

// Planning: step through your board and bench after each buy, sell or move.
// The last step is the board you fought with.
const planUnits = (list, key) => (Array.isArray(list) ? list : []).map(([position, line, star, items]) => ({[key]: position, line, star, items: items ?? []}));
function renderBench(container, bench) {
  container.replaceChildren();
  const slots = new Map((Array.isArray(bench) ? bench : []).map(unit => [Number(unit.slot), unit]));
  container.hidden = !slots.size;
  if (!slots.size) return;
  for (let slot = 0; slot < 9; slot++) {
    const unit = slots.get(slot);
    const cell = document.createElement('span');
    cell.className = `bench-slot${unit ? ' occupied' : ''}`;
    if (unit) {
      tipUnit(cell, unit.line, unit.star, unit.items);
      cell.tabIndex = 0;
      const pic = document.createElement('span');
      pic.className = 'bench-pic';
      KantoComp.sprite({line: unit.line, star: unit.star}, KantoComp.unitInfo({line: unit.line, star: unit.star}), pic);
      const stars = document.createElement('span');
      stars.className = 'bench-stars';
      stars.textContent = '★'.repeat(Math.max(1, Math.min(3, Number(unit.star) || 1)));
      cell.append(stars, pic);
      if (unit.items?.length) {
        const items = document.createElement('span');
        items.className = 'bench-items';
        for (const item of unit.items.slice(0, 3)) items.append(KantoComp.itemIcon(item, 'bench-item'));
        cell.append(items);
      }
    }
    container.append(cell);
  }
}
function renderPlan(round) {
  const plan = Array.isArray(round.plan) ? round.plan : [];
  const range = $('#plan-step');
  const steps = plan.map(step => ({label: step.label, gold: step.gold, board: planUnits(step.board, 'cell'), bench: planUnits(step.bench, 'slot')}));
  steps.push({label: round.boardLocked ? 'Fight' : 'Latest', gold: null, board: round.ownBoard ?? [],
    bench: Array.isArray(round.bench) ? round.bench : steps.at(-1)?.bench ?? []});
  const key = String(round.key ?? roundIndex);
  const atEnd = range.dataset.round !== key || range.value === range.max;
  range.dataset.round = key;
  range.max = String(steps.length - 1);
  if (atEnd || Number(range.value) > steps.length - 1) range.value = range.max;
  $('#plan-bar').hidden = steps.length < 2;
  const show = () => {
    const index = Number(range.value);
    const step = steps[index];
    addBoard($('#my-board'), step.board, 'mine');
    renderBench($('#my-bench'), step.bench);
    $('#plan-label').textContent = index === steps.length - 1 ? step.label
      : `Step ${index + 1} of ${steps.length - 1}: ${step.label}${Number.isFinite(Number(step.gold)) && step.gold !== null ? `, ${formatNumber(step.gold)}g` : ''}`;
  };
  range.oninput = show;
  show();
}

const FIGHT_BOARD = '__fight';
// Rounds the game plays against wild Pokémon. New recordings carry the round kind; older ones use the known schedule.
const PVE_ROUNDS = new Set(['1-2', '1-3', '2-8', '3-8', '4-8']);
const isPve = round => round?.kind ? round.kind === 'pve' : (!!round?.fight?.pve || PVE_ROUNDS.has(String(round?.label)));

// The foe team of a fight, placed where it stood when the fight began.
function fightFoeBoard(battle) {
  if (!battle?.meta?.length) return null;
  const foes = battle.meta.filter(unit => Number(unit.team) !== Number(battle.myTeam) && Number.isFinite(Number(unit.cell)));
  if (!foes.length) return null;
  const flip = Number(battle.myTeam) === 1;
  return foes.map(unit => ({cell: flip ? 55 - Number(unit.cell) : Number(unit.cell), line: unit.line, star: unit.star, items: unit.items ?? [], ...(unit.form?{form:unit.form}:{}), num: unit.num || null}));
}

// Who you fought: the game's own pairing, else the recorder's match, else the board that matches the fight's foe team.
function foughtOpponent(round, battle = battleRecord && shownBattle?.includes(`|${round.key ?? round.label}|`) ? battleRecord : null) {
  const ghost = !!round.fight?.ghost;
  if (isPve(round)) return {key: '', name: 'PvE', label: 'PvE', pve: true, player: null};
  let key = round.fight?.opponentKey || round.battle?.opponentKey || '';
  if (!key && battle?.meta?.length) {
    const foes = battle.meta.filter(unit => Number(unit.team) !== Number(battle.myTeam)).map(unit => `${unit.line}|${unit.star}`);
    let best = 0;
    for (const player of round.opponents ?? []) {
      const pool = (player.board ?? []).map(unit => `${unit.line}|${unit.star}`);
      let hits = 0;
      for (const id of foes) { const at = pool.indexOf(id); if (at >= 0) { hits++; pool.splice(at, 1); } }
      const score = hits / Math.max(foes.length, player.board?.length ?? 0, 1);
      if (score > best && score >= 0.6) { best = score; key = player.key; }
    }
  }
  const player = (round.opponents ?? []).find(item => item.key === key) ?? null;
  const name = player ? `${player.name || `Opponent ${Number(player.seat) + 1}`}${ghost ? ' (ghost)' : ''}` : 'opponent';
  return {key, name, label: player ? name : 'Opponent', pve: false, player};
}

function showOpponentBoard(round) {
  const selector = $('#opponent-select');
  let board = [];
  let info = '';
  const fought = foughtOpponent(round);
  if (selector.value === FIGHT_BOARD || (fought.key && selector.value === fought.key)) {
    // The board you fought, placed as it stood when the fight began.
    const fromFight = fightFoeBoard(battleRecord && shownBattle?.includes(`|${round.key ?? round.label}|`) ? battleRecord : null);
    board = fromFight ?? fought.player?.board ?? [];
    if (fought.player) info = `${formatNumber(fought.player.hp)} HP, level ${formatNumber(fought.player.level)}`;
    const fightOption = [...selector.options].find(option => option.value === FIGHT_BOARD);
    if (fightOption) fightOption.textContent = fought.label;
  } else {
    const player = round.opponents?.find(item => item.key === selector.value) ?? null;
    board = player?.board ?? [];
    if (player) info = `${formatNumber(player.hp)} HP, level ${formatNumber(player.level)}`;
  }
  addBoard($('#opponent-board'), board, 'foe');
  $('#opponent-info').textContent = info;
}

// Keep the selected round visible in the strip by scrolling the strip only, never the page.
function revealTab(button) {
  const strip = $('#round-tabs');
  const left = button.offsetLeft - strip.offsetLeft;
  const right = left + button.offsetWidth;
  if (left < strip.scrollLeft) strip.scrollLeft = Math.max(0, left - 8);
  else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = right - strip.clientWidth + 8;
}

function renderRound(options = {}) {
  const round = activeRound();
  if (!round) return;
  $('#round-range').value = String(roundIndex);
  $('#round-label').textContent = round.label || `${roundIndex + 1}`;
  $('#round-tabs').querySelectorAll('.round-tab').forEach((button, index) => {
    button.classList.toggle('current', index === roundIndex);
    if (index === roundIndex) { button.setAttribute('aria-current', 'true'); revealTab(button); }
    else button.removeAttribute('aria-current');
  });
  $('#gold-start').textContent = formatNumber(round.goldStart);
  $('#gold-earned').textContent = formatNumber(round.goldEarned);
  $('#interest-earned').textContent = formatNumber(round.interestEarned);
  $('#average-earned').textContent = formatNumber(round.averageGoldEarned);
  $('#gold-spent').textContent = formatNumber(round.goldSpent);
  $('#rolls').textContent = formatNumber(round.rolls);
  $('#total-rolls').textContent = formatNumber(round.cumulativeRolls);
  $('#gold-end').textContent = formatNumber(round.goldEnd);
  $('#sales').textContent = formatNumber(round.goldFromSales);

  const seals = $('#seals');
  seals.replaceChildren();
  if (round.seals?.length) {
    for (const id of round.seals) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.dataset.tip = 'seal';
      chip.dataset.seal = id;
      chip.tabIndex = 0;
      chip.append(KantoTips.sealIcon(id, 18), sealLabel(id));
      seals.append(chip);
    }
  } else {
    const empty = document.createElement('span');
    empty.className = 'chip empty';
    empty.textContent = 'No Seals recorded';
    seals.append(empty);
  }

  const opponents = round.opponents ?? [];
  const selector = $('#opponent-select');
  const sameRound = selector.dataset.round === String(round.key ?? roundIndex);
  const oldValue = selector.value;
  const fought = foughtOpponent(round);
  selector.replaceChildren();
  // The player you fought is picked by default. PvE, or a fight with no known player, gets its own entry.
  if (!fought.player) {
    const fightOption = document.createElement('option');
    fightOption.value = FIGHT_BOARD;
    fightOption.textContent = fought.label;
    selector.append(fightOption);
  }
  for (const player of opponents) {
    const option = document.createElement('option');
    option.value = player.key;
    const label = `${player.name || `Opponent ${Number(player.seat) + 1}`}${player.bot ? ' (bot)' : ''}`;
    option.textContent = player.place ? `${label}, ${player.place}${KantoUi.ordinal(Number(player.place))}` : label;
    selector.append(option);
  }
  // A new round always opens on the board you actually fought.
  selector.value = sameRound && [...selector.options].some(option => option.value === oldValue) ? oldValue : (fought.player ? fought.key : FIGHT_BOARD);
  selector.dataset.round = String(round.key ?? roundIndex);
  selector.disabled = false;

  renderPlan(round);
  showOpponentBoard(round);
  updateRefight(round, battleRecord && shownBattle?.includes(`|${round.key ?? round.label}|`) ? battleRecord : null);
  $('#my-board-info').textContent = `${formatNumber(round.ownHp)} HP${round.ownLevel ? `, level ${formatNumber(round.ownLevel)}` : ''}`;
  renderShop(round);
  const fightOpponent = {name: fought.name};
  void renderBattle(round, fightOpponent, options);
  renderActions(round);
}

function openReplay(id) {
  const previousId = current?.id;
  const previousIndex = roundIndex;
  current = replays.find(replay => replay.id === id) ?? null;
  if (!current) {
    renderLibrary();
    return;
  }
  setMode(false);
  roundIndex = previousId === id ? Math.min(previousIndex, Math.max(0, current.rounds.length - 1)) : 0;
  if (previousId !== id) { shownBattle = null; window.scrollTo(0, 0); }
  buildReplayHeader();
  renderRound({force: previousId !== id});
}

function buildReplayHeader() {
  $('#replay-title').textContent = current.playerName || (demoMode ? 'Sample match' : current.sourceType === 'v35' ? 'Imported v35 replay' : 'Online match');
  $('#replay-place').replaceChildren(KantoUi.placeBadge(current));
  $('#replay-meta').textContent = KantoUi.shortDate(current.createdAt);
  const seed = $('#replay-seed');
  seed.hidden = !current.seed;
  if (current.seed) {
    seed.textContent = `Seed ${current.seed}`;
    seed.title = 'Copy seed';
  }
  $('#round-range').max = String(Math.max(0, current.rounds.length - 1));
  const tabs = $('#round-tabs');
  tabs.replaceChildren();
  // Rounds grouped by stage ("2-3" is stage 2, round 3), so a full match fits without scrolling.
  let group = null;
  let groupStage = null;
  current.rounds.forEach((round, index) => {
    const [stagePart, roundPart] = String(round.label ?? '').split('-');
    const stage = roundPart !== undefined ? stagePart : '';
    if (!group || stage !== groupStage) {
      group = document.createElement('div');
      group.className = 'stage-group';
      const name = document.createElement('span');
      name.className = 'stage-name';
      name.textContent = stage ? `Stage ${stage}` : '';
      const row = document.createElement('div');
      row.className = 'stage-rounds';
      group.append(name, row);
      tabs.append(group);
      groupStage = stage;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'round-tab';
    let outcome = 'none';
    let outcomeText = /carousel/i.test(`${round.stage ?? ''} ${round.label ?? ''}`) ? 'carousel' : 'no fight saved';
    if (round.battle && !round.battle.complete) { outcome = 'progress'; outcomeText = 'fight in progress'; }
    else if (hasFrames(round.battle)) {
      const draw = round.battle.winner === -1;
      const won = Number(round.battle.winner) === Number(round.battle.myTeam);
      outcome = draw ? 'draw' : won ? 'won' : 'lost';
      outcomeText = draw ? 'draw' : won ? 'won' : 'lost';
    }
    button.dataset.outcome = outcome;
    if (isPve(round)) { button.dataset.kind = 'pve'; outcomeText = `PvE, ${outcomeText}`; }
    const hpValue = Number(round.ownHp);
    const bar = document.createElement('span');
    bar.className = 'round-bar';
    const fill = document.createElement('i');
    fill.style.setProperty('--hp', `${Number.isFinite(hpValue) ? Math.max(4, Math.min(100, hpValue)) : 0}%`);
    bar.append(fill);
    const label = document.createElement('span');
    label.className = 'round-tab-label';
    label.textContent = roundPart ?? round.label ?? `${index + 1}`;
    const hidden = document.createElement('span');
    hidden.className = 'round-outcome';
    hidden.textContent = `Round ${round.label || index + 1}, ${outcomeText}, ${formatNumber(round.ownHp)} HP`;
    button.title = `Round ${round.label || index + 1}: ${outcomeText}, ${formatNumber(round.ownHp)} HP after`;
    button.append(bar, label, hidden);
    button.addEventListener('click', () => { roundIndex = index; renderRound({force: true}); });
    const row = group.querySelector('.stage-rounds');
    row.append(button);
    group.style.setProperty('--n', String(row.childElementCount));
  });
}

$('#replay-seed').addEventListener('click', async () => {
  if (!current?.seed) return;
  try { await navigator.clipboard.writeText(String(current.seed)); $('#replay-seed').textContent = 'Copied'; }
  catch { return; }
  setTimeout(() => { if (current?.seed) $('#replay-seed').textContent = `Seed ${current.seed}`; }, 1200);
});

$('#round-range').addEventListener('input', event => { roundIndex = Number(event.target.value); renderRound({force: true}); });
$('#previous').addEventListener('click', () => { roundIndex = Math.max(0, roundIndex - 1); renderRound({force: true}); });
$('#next').addEventListener('click', () => { roundIndex = Math.min((current?.rounds?.length ?? 1) - 1, roundIndex + 1); renderRound({force: true}); });
$('#opponent-select').addEventListener('change', () => { const round = activeRound(); if (round) showOpponentBoard(round); });
$('#battle-play').addEventListener('click', () => battlePlaying ? pauseBattle() : playBattle());
$('#battle-restart').addEventListener('click', () => { if (!battleRecord) return; pauseBattle(); battleTime = 0; renderBattleFrame(); playBattle(); });
$('#battle-speed').addEventListener('change', event => { battleSpeed = Number(event.target.value) || 1; });
$('#battle-scrub').addEventListener('input', event => {
  if (!battleRecord) return;
  pauseBattle();
  const duration = Number(battleRecord.time) || Number(battleRecord.frames.at(-1)?.[0]) || 0;
  battleTime = Number(event.target.value) / 1000 * duration;
  renderBattleFrame();
});
$('#metric-tabs').addEventListener('click', event => {
  const button = event.target.closest('button[data-metric]');
  if (!button) return;
  battleMetric = button.dataset.metric;
  $('#metric-tabs').querySelectorAll('button').forEach(tab => tab.classList.toggle('selected', tab === button));
  if (battleRecord?.frames?.length) renderBattleMeter(battleRecord.frames[frameIndexAt(battleTime)]);
});
window.addEventListener('resize', resizeBattleStage);
window.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target?.tagName)) return;
  if (event.key === 'ArrowLeft') { roundIndex = Math.max(0, roundIndex - 1); renderRound({force: true}); }
  else if (event.key === 'ArrowRight') { roundIndex = Math.min((current?.rounds?.length ?? 1) - 1, roundIndex + 1); renderRound({force: true}); }
  else if (event.code === 'Space' && current && !/^(BUTTON|A)$/.test(event.target?.tagName)) { event.preventDefault(); battlePlaying ? pauseBattle() : playBattle(); }
});
$('#import').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', async event => {
  const files = [...(event.target.files ?? [])];
  if (!files.length) return;
  const status = $('#import-status');
  status.hidden = false;
  status.textContent = files.length === 1 ? 'Importing…' : `Importing ${files.length} files…`;
  const imported = [];
  const failed = [];
  for (const file of files) {
    try {
      const body = await file.text();
      const list = /\.html?$/i.test(file.name) || /^\s*</.test(body)
        ? [convertV35Replay(parseEmbeddedV35Replay(body), file.name || 'custom-replay')]
        : replaysFromJson(JSON.parse(body));
      for (const replay of list) imported.push(await saveImported(replay));
    } catch {
      failed.push(file.name);
    }
  }
  const dropped = imported.length ? await trimReplays() : 0;
  ({replays} = await KantoUi.readReplays());
  event.target.value = '';
  const parts = [];
  if (imported.length) parts.push(`Imported ${imported.length} replay${imported.length === 1 ? '' : 's'}.`);
  if (dropped) parts.push(`Kept the newest ${MAX_SAVED_REPLAYS}, so ${dropped} older replay${dropped === 1 ? ' was' : 's were'} removed.`);
  if (failed.length) parts.push(`Could not read ${failed.join(', ')}.`);
  if (imported.length === 1 && !failed.length && !dropped) {
    status.hidden = true;
    history.replaceState(null, '', `#${encodeURIComponent(imported[0].id)}`);
    openReplay(imported[0].id);
    return;
  }
  renderLibrary();
  status.hidden = false;
  status.textContent = parts.join(' ');
});
$('#export').addEventListener('click', async () => {
  if (!current) return;
  downloadJson(await fullReplay(current), `kanto-replay-${new Date(current.createdAt).toISOString().replace(/[:.]/g, '-')}.json`);
});
$('#export-all').addEventListener('click', async () => {
  const button = $('#export-all');
  button.disabled = true;
  try {
    const {replays: saved} = await KantoUi.readReplays();
    const all = [];
    for (const replay of saved) all.push(await fullReplay(replay));
    downloadJson({schema: 'kanto-replay-bundle/1', exportedAt: new Date().toISOString(), count: all.length, replays: all},
      `kanto-replays-${new Date().toISOString().slice(0, 10)}.json`);
  } finally {
    button.disabled = false;
  }
});
$('#delete').addEventListener('click', async () => {
  if (!current || demoMode) return;
  const key = `replay:${current.id}`;
  replays = replays.filter(replay => replay.id !== current.id);
  const fights = current.rounds.map(round => round.battle?.key).filter(Boolean);
  await chrome.storage.local.remove([key, ...fights]);
  current = null;
  location.hash = '';
  renderLibrary();
});

async function load() {
  KantoUi.initTheme($('#theme'));
  if (demoMode) {
    replays = [makeDemoReplay()];
    openReplay(DEMO_ID);
    return;
  }
  ({replays} = await KantoUi.readReplays());
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) openReplay(id);
  else renderLibrary();
}

window.addEventListener('hashchange', () => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) openReplay(id);
  else if (demoMode) openReplay(DEMO_ID);
  else { current = null; renderLibrary(); }
});

// Background saves (a live match) update the page in place: no scroll jump, no fight restart.
if (!demoMode && globalThis.chrome?.storage?.onChanged) chrome.storage.onChanged.addListener((changes, area) => {
  if (area && area !== 'local') return;
  const keys = Object.keys(changes).filter(key => key.startsWith('replay:'));
  if (!keys.length) return;
  for (const key of keys) {
    const next = changes[key].newValue;
    const index = replays.findIndex(replay => `replay:${replay.id}` === key);
    if (!next) { if (index >= 0) replays.splice(index, 1); }
    else if (index >= 0) replays[index] = next;
    else replays.push(next);
  }
  replays.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  if (!current) { if (!$('#library-view').hidden) renderLibrary(); return; }
  const updated = replays.find(replay => replay.id === current.id);
  if (!updated) { current = null; location.hash = ''; renderLibrary(); return; }
  if (!changes[`replay:${current.id}`]) return;
  current = updated;
  roundIndex = Math.min(roundIndex, Math.max(0, current.rounds.length - 1));
  const strip = $('#round-tabs');
  const scroll = strip.scrollLeft;
  buildReplayHeader();
  strip.scrollLeft = scroll;
  renderRound({autoplay: false});
});
void load();
