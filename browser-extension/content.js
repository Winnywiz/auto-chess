(() => {
  'use strict';
  const CHANNEL = 'kanto-tactics-replay-recorder-v1';
  // Fights are stored under their own keys (battle:<replay id>:<round key>) and written once,
  // so the match record stays small while it is saved every few hundred milliseconds.
  const MAX_REPLAYS = 100;
  const liveBattles = new Map();
  const battleKey = (replayId, roundKey) => `battle:${replayId}:${roundKey}`;
  let record = null;
  let lastGold = null;
  let lastRoundKey = null;
  let lastSeals = [];
  let debounce = 0;
  let writeQueue = Promise.resolve();
  let latestStatus = {};
  let adopting = null;
  let endedStatus = null;
  const waiting = [];
  const RESUME_WINDOW_MS = 3 * 60 * 60 * 1000;
  const runOf = value => value?.runId ?? value?.id;

  const text = value => typeof value === 'string' ? value.slice(0, 120) : '';
  const actionDetail = value => value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).slice(0, 12).map(([key, item]) => [text(key),
      typeof item === 'string' ? item.slice(0, 80) : (typeof item === 'number' || typeof item === 'boolean' ? item : null)])) : {};
  const cloneBoard = value => Array.isArray(value) ? value.slice(0, 12).map(unit => ({
    cell: Number(unit.cell), line: text(unit.line) || 'Unknown', star: Math.max(1, Math.min(3, Number(unit.star) || 1)),
    num: Number.isFinite(Number(unit.num)) && Number(unit.num) > 0 ? Number(unit.num) : null,
    items: Array.isArray(unit.items) ? unit.items.slice(0, 3).map(text) : [], shiny: !!unit.shiny,
  })).filter(unit => Number.isInteger(unit.cell) && unit.cell >= 0 && unit.cell < 56) : [];
  const sealIds = value => Array.isArray(value) ? value.slice(0, 20).map(text).filter(Boolean) : [];

  function newRecord(snapshot, id = snapshot.runId) {
    return {
      schema: 'kanto-live-replay/2',
      id,
      runId: snapshot.runId,
      title: 'Kanto Tactics match',
      createdAt: snapshot.timestamp,
      updatedAt: snapshot.timestamp,
      finishedAt: null,
      complete: false,
      place: null,
      meKey: snapshot.meKey,
      stoppedAt: null,
      stoppedRound: null,
      resumes: 0,
      economyHook: false,
      rounds: [],
    };
  }

  function roundFor(snapshot) {
    let round = record.rounds.find(item => item.key === snapshot.roundKey);
    if (!round) {
      round = {
        key: snapshot.roundKey,
        label: snapshot.roundLabel,
        index: snapshot.roundIndex,
        startedAt: snapshot.timestamp,
        endedAt: null,
        stage: snapshot.stage,
        ownBoard: [],
        opponents: [],
        seals: [],
        goldStart: snapshot.own.gold,
        goldEnd: snapshot.own.gold,
        goldEarned: 0,
        interestEarned: 0,
        goldSpent: 0,
        goldFromSales: 0,
        rolls: 0,
        cumulativeRolls: 0,
        averageGoldEarned: 0,
        ownHp: null,
        ownLevel: null,
        boardLocked: false,
        actions: [],
        battle: null,
      };
      record.rounds.push(round);
      if (record.rounds.length > 80) record.rounds.shift();
    }
    return round;
  }

  function interestFor(gold, seals) {
    if (!Number.isFinite(Number(gold))) return 0;
    const bank = seals.includes('meowth-bank');
    const step = bank ? 6 : 10;
    const cap = bank ? 7 : 5;
    return Math.min(cap, Math.floor(Math.max(0, Number(gold)) / step));
  }

  function updateTotals() {
    const allEarned = record.rounds.reduce((sum, round) => sum + (Number(round.goldEarned) || 0), 0);
    let rolls = 0;
    for (const round of record.rounds) {
      rolls += Number(round.rolls) || 0;
      round.cumulativeRolls = rolls;
      round.averageGoldEarned = record.rounds.length ? Math.round(allEarned / record.rounds.length * 100) / 100 : 0;
    }
    record.totalGoldEarned = allEarned;
    record.totalGoldSpent = record.rounds.reduce((sum, round) => sum + (Number(round.goldSpent) || 0), 0);
    record.totalInterestEarned = record.rounds.reduce((sum, round) => sum + (Number(round.interestEarned) || 0), 0);
    record.totalRolls = rolls;
  }

  function addGoldDelta(round, delta, action = '') {
    if (!Number.isFinite(delta) || delta === 0) return;
    if (delta < 0) round.goldSpent += Math.abs(delta);
    else if (action === 'sell') round.goldFromSales += delta;
    else round.goldEarned += delta;
  }

  function getPlayers(snapshot) {
    return Array.isArray(snapshot.players) ? snapshot.players.slice(0, 8).map(player => ({
      key: text(player.key), seat: Number(player.seat) || 0, name: text(player.name), bot: !!player.bot,
      place: player.place === null ? null : Number(player.place),
      hp: player.hp === null ? null : Number(player.hp),
      level: player.level === null ? null : Number(player.level),
      board: cloneBoard(player.board),
    })) : [];
  }

  function isCombat(stage) {
    return /combat|battle|fight/i.test(String(stage));
  }

  // Continue the stored replay when you rejoin the same unfinished match;
  // otherwise start a new one (never overwrite a different or finished replay).
  async function adopt(snapshot) {
    const key = `replay:${snapshot.runId}`;
    let stored = null;
    try { stored = (await chrome.storage.local.get(key))[key] ?? null; } catch {}
    const lastIndex = stored ? Math.max(-1, ...stored.rounds.map(round => Number(round.index)).filter(Number.isFinite)) : -1;
    const recent = stored && Date.now() - Date.parse(stored.updatedAt || 0) < RESUME_WINDOW_MS;
    const ordered = snapshot.roundIndex === null || lastIndex <= snapshot.roundIndex;
    if (stored && !stored.complete && recent && ordered) {
      record = stored;
      record.runId = snapshot.runId;
      if (record.stoppedAt) record.resumes = (Number(record.resumes) || 0) + 1;
      record.stoppedAt = null;
      record.stoppedRound = null;
    } else {
      record = newRecord(snapshot, stored ? `${snapshot.runId}-${Date.now().toString(36)}` : snapshot.runId);
    }
    if (!record.rounds.length) void trimStorage(record.id);
    lastGold = null;
    lastRoundKey = null;
    lastSeals = [];
  }

  function markStopped(payload) {
    if (!record || runOf(record) !== payload.runId || record.complete) return;
    record.stoppedAt = payload.at || new Date().toISOString();
    record.stoppedRound = record.rounds.at(-1)?.label ?? null;
    const latest = record.rounds.at(-1);
    if (latest && !latest.endedAt) latest.endedAt = record.stoppedAt;
    updateTotals();
  }

  // Every shop seen in a round: the opening shop, then one per reroll. Bought slots are marked.
  // Planning steps: the board and bench after each change, labelled by what changed.
  const compact = (units, key) => (Array.isArray(units) ? units : []).slice(0, 12).map(unit =>
    [Number(unit[key]) || 0, text(unit.line), Number(unit.star) || 1, (Array.isArray(unit.items) ? unit.items : []).slice(0, 3).map(text)]);
  const unitName = line => text(line).replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  function stepLabel(before, after, goldBefore, goldAfter) {
    const pool = list => { const map = new Map(); for (const [, line, star] of list) map.set(`${line}|${star}`, (map.get(`${line}|${star}`) ?? 0) + 1); return map; };
    const a = pool([...before.board, ...before.bench]), b = pool([...after.board, ...after.bench]);
    const added = [...b].filter(([key, n]) => n > (a.get(key) ?? 0)).map(([key]) => key.split('|'));
    const removed = [...a].filter(([key, n]) => n > (b.get(key) ?? 0)).map(([key]) => key.split('|'));
    const items = list => list.reduce((sum, unit) => sum + unit[3].length, 0);
    const upgraded = added.find(([line, star]) => Number(star) > 1 && removed.some(([other]) => other === line));
    if (upgraded) return `${unitName(upgraded[0])} ${'★'.repeat(Number(upgraded[1]))}`;
    if (added.length && goldAfter !== null && goldBefore !== null && goldAfter < goldBefore) return `Bought ${unitName(added[0][0])}`;
    if (removed.length && !added.length) return goldAfter !== null && goldBefore !== null && goldAfter > goldBefore ? `Sold ${unitName(removed[0][0])}` : `Removed ${unitName(removed[0][0])}`;
    if (added.length) return `Got ${unitName(added[0][0])}`;
    if (items([...after.board, ...after.bench]) > items([...before.board, ...before.bench])) return 'Item equipped';
    const onBoard = list => list.map(unit => `${unit[1]}|${unit[2]}`).sort().join();
    if (onBoard(after.board) !== onBoard(before.board)) return after.board.length > before.board.length ? 'Fielded a unit' : after.board.length < before.board.length ? 'Benched a unit' : 'Swapped units';
    return 'Moved';
  }
  function recordPlan(round, snapshot, gold) {
    if (round.boardLocked || isCombat(snapshot.stage)) return;
    const step = {board: compact(snapshot.own.board, 'cell'), bench: compact(snapshot.own.bench, 'slot')};
    round.bench = Array.isArray(snapshot.own.bench) ? snapshot.own.bench.slice(0, 9).map(unit => ({slot: Number(unit.slot) || 0,
      line: text(unit.line), star: Number(unit.star) || 1, num: unit.num ?? null, items: (unit.items ?? []).slice(0, 3).map(text)})) : round.bench ?? [];
    round.plan = Array.isArray(round.plan) ? round.plan : [];
    const last = round.plan.at(-1);
    if (last && JSON.stringify([last.board, last.bench]) === JSON.stringify([step.board, step.bench])) return;
    const label = last ? stepLabel(last, step, last.gold, gold) : 'Start';
    round.plan.push({at: snapshot.timestamp, gold, label, ...step});
    if (round.plan.length > 150) round.plan.splice(1, 1);
  }

  function recordShop(round, shop, rolls, gold, at) {
    if (!Array.isArray(shop)) return;
    round.shops = Array.isArray(round.shops) ? round.shops : [];
    const last = round.shops.at(-1);
    // The opening shop can show up empty for a moment before the game fills it.
    if (last && last.units.every(slot => !slot) && rolls === last.roll) { last.units = shop.slice(0, 8); last.gold = gold; return; }
    const changed = last && shop.some((slot, i) => slot && last.units[i] && slot !== last.units[i]);
    if (!last || rolls !== last.roll || changed || shop.length !== last.units.length) {
      if (last && rolls === last.roll && !changed && shop.every(slot => !slot)) return;
      round.shops.push({roll: rolls, at, gold, units: shop.slice(0, 8), bought: [], kind: !last ? 'start' : rolls !== last.roll ? 'roll' : 'refresh'});
      if (round.shops.length > 80) round.shops.shift();
      return;
    }
    shop.forEach((slot, i) => { if (!slot && last.units[i] && !last.bought.includes(i)) last.bought.push(i); });
  }

  function updateFromSnapshot(snapshot) {
    if (!snapshot || typeof snapshot.runId !== 'string' || !snapshot.own) return;

    const beforeGold = lastGold;
    const roundChanged = lastRoundKey !== null && lastRoundKey !== snapshot.roundKey;
    const round = roundFor(snapshot);
    const currentGold = snapshot.own.gold === null || snapshot.own.gold === undefined
      ? null : (Number.isFinite(Number(snapshot.own.gold)) ? Number(snapshot.own.gold) : null);

    if (beforeGold !== null && currentGold !== null && beforeGold !== currentGold) {
      addGoldDelta(round, currentGold - beforeGold);
    }
    if (roundChanged && beforeGold !== null) {
      const expectedInterest = interestFor(beforeGold, lastSeals);
      round.interestEarned = Math.min(expectedInterest, Math.max(0, currentGold === null ? 0 : currentGold - beforeGold));
      const previous = record.rounds.find(item => item.key === lastRoundKey);
      if (previous && !previous.endedAt) previous.endedAt = snapshot.timestamp;
    }

    const board = cloneBoard(snapshot.own.board);
    const opponents = getPlayers(snapshot).filter(player => player.key && player.key !== snapshot.meKey);
    round.stage = text(snapshot.stage) || round.stage;
    if (snapshot.roundKind) round.kind = text(snapshot.roundKind);
    if (snapshot.fight && typeof snapshot.fight === 'object') round.fight = {pve: !!snapshot.fight.pve, ghost: !!snapshot.fight.ghost,
      opponentKey: text(snapshot.fight.opponentKey), team: Number(snapshot.fight.team) || 0};
    recordPlan(round, snapshot, currentGold);
    if (Array.isArray(snapshot.own.shop)) recordShop(round, snapshot.own.shop.map(slot => slot ? text(slot) : null),
      Number(snapshot.own.rollN) || 0, currentGold, snapshot.timestamp);
    round.goldEnd = currentGold;
    round.ownHp = snapshot.own.hp === null ? round.ownHp : Number(snapshot.own.hp);
    round.ownLevel = snapshot.own.level === null ? round.ownLevel : Number(snapshot.own.level);
    round.seals = sealIds(snapshot.own.seals);
    round.rolls = Math.max(round.rolls, Number(snapshot.own.rollN) || 0);
    if (!round.boardLocked) {
      round.ownBoard = board;
      round.opponents = opponents;
      if (isCombat(snapshot.stage)) round.boardLocked = true;
    }
    if (round.goldStart === null && currentGold !== null) round.goldStart = currentGold;
    if (currentGold !== null) lastGold = currentGold;
    lastRoundKey = snapshot.roundKey;
    lastSeals = round.seals;
    record.meKey = text(snapshot.meKey);
    if (snapshot.seed) record.seed = text(snapshot.seed);
    const me = Array.isArray(snapshot.players) ? snapshot.players.find(player => player.key === snapshot.meKey) : null;
    if (me?.name) record.playerName = text(me.name).slice(0, 36);
    record.updatedAt = snapshot.timestamp;
    record.place = snapshot.place === null ? record.place : Number(snapshot.place);
    record.title = 'Kanto Tactics match';
    updateTotals();
    saveSoon({state: 'recording', message: 'Recording this match', updatedAt: record.updatedAt});
  }

  function updateFromAction(event) {
    if (!record || event.runId !== runOf(record)) return;
    const round = record.rounds.find(item => item.key === event.roundKey) ?? record.rounds.at(-1);
    if (!round) return;
    const before = Number(event.goldBefore);
    const after = Number(event.goldAfter);
    if (Number.isFinite(before) && Number.isFinite(after)) addGoldDelta(round, after - before, text(event.action));
    const roll = Number(event.rollAfter);
    if (Number.isFinite(roll)) round.rolls = Math.max(round.rolls, roll);
    record.economyHook = true;
    round.actions.push({action: text(event.action), detail: actionDetail(event.detail), goldDelta: Number.isFinite(after - before) ? after - before : 0,
      rollDelta: Number.isFinite(Number(event.rollAfter)) && Number.isFinite(Number(event.rollBefore))
        ? Number(event.rollAfter) - Number(event.rollBefore) : 0, at: event.at || new Date().toISOString()});
    if (round.actions.length > 400) round.actions.shift();
    record.updatedAt = event.at || new Date().toISOString();
    if (lastRoundKey === event.roundKey && Number.isFinite(after)) lastGold = after;
    updateTotals();
    saveSoon({state: 'recording', message: 'Recording this match', updatedAt: record.updatedAt});
  }

  function roundForBattle(event) {
    return record.rounds.find(item => item.key === String(event.roundKey)) ?? record.rounds.at(-1) ?? null;
  }

  function battleSummary(battle) {
    return {id: battle.id, myTeam: battle.myTeam, opponentKey: battle.opponentKey, time: battle.time, winner: battle.winner,
      complete: battle.complete, truncated: battle.truncated, frameCount: battle.frames.length, eventCount: battle.events.length,
      stored: true, key: battle.key};
  }

  function storeBattle(battle) {
    return chrome.storage.local.set({[battle.key]: battle}).catch(() => {});
  }

  function startBattle(event) {
    if (!record || event.runId !== runOf(record)) return;
    const round = roundForBattle(event);
    if (!round) return;
    const battle = {
      id: text(event.battleId), myTeam: Number(event.myTeam) || 0, opponentKey: text(event.opponentKey),
      time: null, winner: null, meta: Array.isArray(event.meta) ? event.meta.slice(0, 40) : [],
      frames: [], events: [], truncated: false, complete: false, key: battleKey(record.id, round.key), roundKey: round.key,
    };
    liveBattles.set(battle.id, battle);
    round.battle = {...battleSummary(battle), stored: false};
    record.updatedAt = new Date().toISOString();
    saveSoon({state: 'recording', message: 'Recording the live battle', updatedAt: record.updatedAt});
  }

  function appendBattleFrames(event) {
    if (!record || event.runId !== runOf(record)) return;
    const battle = liveBattles.get(event.battleId);
    if (!battle || !Array.isArray(event.frames)) return;
    const room = Math.max(0, 400 - battle.frames.length);
    if (room) battle.frames.push(...event.frames.slice(0, room));
    if (event.frames.length > room) battle.truncated = true;
  }

  function finishBattle(event) {
    if (!record || event.runId !== runOf(record)) return;
    const battle = liveBattles.get(event.battleId);
    if (!battle) return;
    liveBattles.delete(battle.id);
    battle.time = Number.isFinite(Number(event.time)) ? Number(event.time) : null;
    battle.winner = event.winner === null || event.winner === undefined ? null : Number(event.winner);
    if (Array.isArray(event.meta)) battle.meta = event.meta.slice(0, 40);
    if (Array.isArray(event.events)) battle.events = event.events.slice(0, 6000);
    battle.truncated = battle.truncated || !!event.truncated;
    battle.complete = true;
    void storeBattle(battle);
    const round = record.rounds.find(item => item.key === battle.roundKey);
    if (round) round.battle = battleSummary(battle);
    record.updatedAt = new Date().toISOString();
    saveSoon({state: 'recording', message: 'Battle replay saved', updatedAt: record.updatedAt});
  }

  // Keep the newest replays; remove older ones together with their fights.
  async function trimStorage(keepId) {
    try {
      const keys = typeof chrome.storage.local.getKeys === 'function'
        ? await chrome.storage.local.getKeys() : Object.keys(await chrome.storage.local.get(null));
      const replayKeys = keys.filter(key => key.startsWith('replay:'));
      if (replayKeys.length <= MAX_REPLAYS) return;
      const saved = await chrome.storage.local.get(replayKeys);
      const ordered = Object.entries(saved).filter(([key, value]) => key.startsWith('replay:') && value?.id).sort(([aKey, a], [bKey, b]) => aKey === `replay:${keepId}` ? -1 : bKey === `replay:${keepId}` ? 1
        : String(b.updatedAt).localeCompare(String(a.updatedAt)));
      const dropIds = ordered.slice(MAX_REPLAYS).map(([, value]) => value.id);
      const drop = new Set(dropIds.map(id => `replay:${id}`));
      for (const key of keys) if (dropIds.some(id => key.startsWith(`battle:${id}:`))) drop.add(key);
      if (drop.size) await chrome.storage.local.remove([...drop]);
    } catch {}
  }

  function saveSoon(status) {
    clearTimeout(debounce);
    debounce = setTimeout(() => persist(status), 250);
  }

  function persist(status = null) {
    if (!record) return Promise.resolve();
    const savedRecord = structuredClone(record);
    const activeStatus = status ? {...latestStatus, ...status, runId: runOf(record), replayId: record.id} : undefined;
    writeQueue = writeQueue.then(() => chrome.storage.local.set({[`replay:${savedRecord.id}`]: savedRecord, ...(activeStatus ? {activeStatus} : {})}))
      .catch(() => {});
    return writeQueue;
  }

  function handle(type, payload) {
    if (type === 'snapshot') updateFromSnapshot(payload);
    else if (type === 'action') updateFromAction(payload);
    else if (type === 'battle-start') startBattle(payload);
    else if (type === 'battle-frames') appendBattleFrames(payload);
    else if (type === 'battle-end') finishBattle(payload);
    else if (type === 'finished' && runOf(record) === payload.runId && record) {
      record.complete = true;
      record.stoppedAt = null;
      record.stoppedRound = null;
      record.finishedAt = payload.at || new Date().toISOString();
      if (payload.place !== undefined && payload.place !== null) record.place = Number(payload.place);
      const latest = record.rounds.at(-1);
      if (latest && !latest.endedAt) latest.endedAt = record.finishedAt;
      updateTotals();
      endedStatus = {state: 'finished', message: 'Match saved', updatedAt: record.updatedAt};
      saveSoon(endedStatus);
    } else if ((type === 'left' || type === 'closed') && record && runOf(record) === payload.runId) {
      markStopped(payload);
      endedStatus = {state: 'saved', message: record.complete ? 'Last match saved' : 'Recording stopped before the match ended', updatedAt: record.updatedAt};
      saveSoon(endedStatus);
    } else if (type === 'status') {
      latestStatus = payload;
      if (record && runOf(record) === payload.runId && payload.actionHook && !record.economyHook) {
        record.economyHook = true;
        updateTotals();
        saveSoon({state: payload.state, message: payload.message, at: payload.at, updatedAt: record.updatedAt});
      }
      if (payload.state === 'recording') endedStatus = null;
      // Keep "match saved" / "saved up to where you left" visible while the game sits in the lobby,
      // unless the bridge is reporting a problem (its message then carries a reason in brackets).
      const shown = endedStatus && payload.state === 'waiting' && !/\(/.test(payload.message || '')
        ? {...payload, ...endedStatus, runId: runOf(record), replayId: record?.id} : payload;
      chrome.storage.local.set({activeStatus: shown}).catch(() => {});
    }
  }

  function flushWaiting() {
    while (waiting.length && !adopting) {
      const [type, payload] = waiting.shift();
      route(type, payload);
    }
  }

  function route(type, payload) {
    if (adopting) { waiting.push([type, payload]); return; }
    if (type === 'snapshot' && payload && typeof payload.runId === 'string' && payload.own && runOf(record) !== payload.runId) {
      adopting = adopt(payload).catch(() => { record = newRecord(payload, `${payload.runId}-${Date.now().toString(36)}`); })
        .finally(() => { adopting = null; handle(type, payload); flushWaiting(); });
      return;
    }
    handle(type, payload);
  }

  window.addEventListener('message', event => {
    if (event.source !== window || event.origin !== location.origin || event.data?.channel !== CHANNEL) return;
    const {type, payload = {}} = event.data;
    if (waiting.length > 2000) waiting.shift();
    route(type, payload);
  });

  window.addEventListener('pagehide', () => {
    clearTimeout(debounce);
    if (record) markStopped({runId: runOf(record), at: new Date().toISOString()});
    for (const battle of liveBattles.values()) void storeBattle(battle);
    void persist({state: 'saved', message: 'Last match saved', updatedAt: new Date().toISOString()});
  }, {once: true});
})();
