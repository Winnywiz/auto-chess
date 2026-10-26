// Runs in the game's page world so it can read the same public live-game
// snapshot interface used by the site's own client.
(() => {
  'use strict';
  if (window.__kantoReplayBridgeV1 || !location.pathname.includes('/playables/kanto-tactics')) return;
  window.__kantoReplayBridgeV1 = true;

  const CHANNEL = 'kanto-tactics-replay-recorder-v1';
  const post = (type, payload = {}) => window.postMessage({channel: CHANNEL, type, payload}, location.origin);
  const moduleByPrefix = prefix => [...document.querySelectorAll('link[rel="modulepreload"]')]
    .map(link => link.href)
    .find(url => new URL(url).pathname.split('/').at(-1).startsWith(prefix + '-'));

  let onlineMode = null;
  let modeURL = null;
  let modeError = '';
  let source = null;
  let runId = null;
  let signature = '';
  let lastStatus = '';
  let lastStatusAt = 0;
  let finished = false;
  let hookReady = false;
  let battleHookReady = false;
  let battleHookError = '';
  const wrapped = new WeakMap();
  const battleRecords = new WeakMap();

  // The engine steps 30 times per fight second and PvP fights end by 54 s.
  // One frame per 0.2 fight seconds covers a full fight; the viewer interpolates between frames.
  const BATTLE_FRAME_INTERVAL = 0.2;
  const BATTLE_FRAME_LIMIT = 400;
  const BATTLE_EVENT_LIMIT = 6000;
  const BATTLE_CHUNK_SIZE = 12;

  const numberOrNull = value => value === null || value === undefined || value === ''
    ? null : (Number.isFinite(Number(value)) ? Number(value) : null);

  function emitStatus(state, message) {
    const next = state + ':' + message;
    if (next === lastStatus && Date.now() - lastStatusAt < 5000) return;
    lastStatus = next;
    lastStatusAt = Date.now();
    post('status', {state, message, runId, actionHook: hookReady, battleHook: battleHookReady,
      battleHookError, at: new Date(lastStatusAt).toISOString()});
  }

  const round2 = value => Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) / 100 : 0;
  const roundInt = value => Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0;

  function battleUnitMeta(unit) {
    return {
      uid: unit.uid, team: Number(unit.team) || 0,
      line: String(unit.line ?? unit.id ?? unit.name ?? 'Unknown').slice(0, 80),
      star: Math.max(1, Math.min(3, roundInt(unit.star || 1))),
      ...(['phys','spec'].includes(unit.flexForm??unit.form)?{form:unit.flexForm??unit.form}:{}),
      num: roundInt(unit.num), name: String(unit.name ?? unit.line ?? 'Unknown').slice(0, 80),
      maxHp: roundInt(unit.maxHp), maxMana: roundInt(unit.maxMana), cell: roundInt(unit.from ?? unit.cell),
      items: Array.isArray(unit.items) ? unit.items.slice(0, 3).map(item => String(typeof item === 'string' ? item : item?.id ?? '')).filter(Boolean) : [],
      ownedId: unit.ownedId ?? null,
    };
  }

  function battleFrame(battle, record = null) {
    const units = [];
    for (const unit of battle.units ?? []) {
      if (record && !record.meta[unit.uid]) record.meta[unit.uid] = battleUnitMeta(unit);
      units.push([
        unit.uid, unit.from ?? unit.cell, unit.cell, round2(unit.moving ? (unit.moveT ?? 1) : 1),
        Math.max(0, roundInt(unit.hp)), roundInt(unit.shield), roundInt(unit.mana), unit.alive ? 1 : 0,
        roundInt(unit.maxHp), roundInt(unit.dealt), roundInt(unit.dealtAbility), roundInt(unit.dotDealt),
        roundInt((unit.taken ?? 0) + (unit.dotTaken ?? 0)), roundInt(unit.mitigated),
        roundInt(unit.healed), roundInt(unit.shielded),
      ]);
    }
    return [round2(battle.time), units];
  }

  function liveBattleContext(battle) {
    if (!source || !runId || typeof source.snap !== 'function') return null;
    try {
      const snap = source.snap();
      if (!Array.isArray(snap?.players)) return null;
      const meIndex = snap.players.findIndex(player => String(player.id) === String(snap.me));
      if (meIndex < 0) return null;
      const ownPlayer = snap.players[meIndex];
      const ownState = ownPlayer.s ?? ownPlayer;
      const ownIds = new Set(Object.values(ownState.board ?? {}).map(value =>
        value && typeof value === 'object' ? value.id ?? value.uid : value).filter(value => value !== null && value !== undefined).map(String));
      const ownRows = boardFor(ownPlayer);
      const units = Array.isArray(battle.units) ? battle.units : [];
      const idMatches = units.filter(unit => unit.ownedId !== null && unit.ownedId !== undefined && ownIds.has(String(unit.ownedId)));
      let ownUnits = idMatches;
      if (!ownUnits.length && ownRows.length) {
        ownUnits = units.filter(unit => ownRows.some(row => row.cell === Number(unit.from ?? unit.cell)
          && row.line === String(unit.line ?? unit.id ?? unit.name ?? 'Unknown')
          && row.star === Math.max(1, Math.min(3, Number(unit.star) || 1))));
      }
      const teamCounts = new Map();
      for (const unit of ownUnits) teamCounts.set(Number(unit.team) || 0, (teamCounts.get(Number(unit.team) || 0) ?? 0) + 1);
      const rankedTeams = [...teamCounts].sort((a, b) => b[1] - a[1]);
      if (!rankedTeams.length || (rankedTeams.length > 1 && rankedTeams[0][1] === rankedTeams[1][1])) return null;
      const myTeam = rankedTeams[0][0];
      let opponentKey = '';
      let opponentMatches = 0;
      snap.players.forEach((player, index) => {
        if (index === meIndex) return;
        const state = player.s ?? player;
        const ids = new Set(Object.values(state.board ?? {}).map(value =>
          value && typeof value === 'object' ? value.id ?? value.uid : value).filter(value => value !== null && value !== undefined).map(String));
        const count = units.filter(unit => Number(unit.team) !== myTeam && unit.ownedId !== null && unit.ownedId !== undefined
          && ids.has(String(unit.ownedId))).length;
        if (count > opponentMatches) { opponentMatches = count; opponentKey = `seat-${index}`; }
      });
      return {runId, roundKey: String(snap.n ?? snap.round?.n ?? 'unknown'), myTeam, opponentKey};
    } catch { return null; }
  }

  function cleanBattleEvents(events) {
    const allowed = new Set(['attack', 'charge', 'dmg', 'heal', 'faint', 'cast', 'cc', 'transform', 'end', 'zone', 'ko', 'text', 'seal', 'shield', 'shieldAlly', 'execute']);
    const fields = ['k', 't', 'src', 'dst', 'uid', 'team', 'id', 'amount', 'crit', 'type', 'ranged', 'ability', 'dot', 'cells', 'name', 'text', 'color', 'cc', 'dur', 'winner', 'num', 'cell'];
    return (Array.isArray(events) ? events : []).filter(event => allowed.has(event.k)).slice(0, BATTLE_EVENT_LIMIT).map(event => {
      const safe = {};
      for (const field of fields) {
        const value = event[field];
        if (value === undefined || value === null) continue;
        if (field === 'cells' && Array.isArray(value)) safe.cells = value.slice(0, 56).map(Number).filter(Number.isFinite);
        else if (typeof value === 'string') safe[field] = value.slice(0, 100);
        else if (typeof value === 'number' || typeof value === 'boolean') safe[field] = value;
      }
      if (Number.isFinite(Number(safe.t))) safe.t = round2(safe.t);
      if (Number.isFinite(Number(safe.amount))) safe.amount = roundInt(safe.amount);
      return safe;
    });
  }

  function beginBattleRecording(battle) {
    const context = liveBattleContext(battle);
    if (!context) return null;
    const record = {
      ...context, id: crypto.randomUUID(), myTeam: context.myTeam, meta: {}, frames: [], sentFrames: 0,
      steps: 0, nextFrameAt: Number(battle.time || 0) + BATTLE_FRAME_INTERVAL, truncated: false, done: false,
    };
    for (const unit of battle.units ?? []) record.meta[unit.uid] = battleUnitMeta(unit);
    record.frames.push(battleFrame(battle, record));
    post('battle-start', {runId: record.runId, roundKey: record.roundKey, battleId: record.id,
      myTeam: record.myTeam, opponentKey: record.opponentKey, meta: Object.values(record.meta)});
    return record;
  }

  function sendBattleFrames(record, force = false) {
    const pending = record.frames.length - record.sentFrames;
    if (!pending || (!force && pending < BATTLE_CHUNK_SIZE)) return;
    const frames = record.frames.slice(record.sentFrames);
    record.sentFrames = record.frames.length;
    post('battle-frames', {runId: record.runId, roundKey: record.roundKey, battleId: record.id, frames});
  }

  function finishBattleRecording(battle, record) {
    if (record.done) return;
    record.done = true;
    for (const unit of battle.units ?? []) if (record.meta[unit.uid]) {
      record.meta[unit.uid].bd = Object.fromEntries(Object.entries(unit.bd ?? {}).map(([key, value]) => [String(key).slice(0, 24), roundInt(value)]));
      record.meta[unit.uid].kos = roundInt(unit.kos);
    }
    sendBattleFrames(record, true);
    post('battle-end', {runId: record.runId, roundKey: record.roundKey, battleId: record.id,
      time: round2(battle.time), winner: battle.winner, meta: Object.values(record.meta),
      events: cleanBattleEvents(battle.events), truncated: record.truncated});
  }

  async function locateBattleHook() {
    if (battleHookReady) return true;
    const url = moduleByPrefix('route');
    if (!url) { battleHookError = 'The battle engine module is not available'; return false; }
    try {
      const route = await import(url);
      const candidates = Object.values(route).filter(value => typeof value === 'function'
        && typeof value.prototype?.start === 'function' && typeof value.prototype?.step === 'function');
      if (candidates.length !== 1) {
        battleHookError = candidates.length ? 'The battle engine export is ambiguous' : 'The battle animation interface was not found';
        return false;
      }
      const prototype = candidates[0].prototype;
      if (prototype.__kantoReplayStep) { battleHookReady = true; return true; }
      const original = prototype.step;
      const replacement = function (...args) {
        let record = battleRecords.get(this);
        if (!record && !battleRecords.has(this)) {
          record = beginBattleRecording(this);
          if (record) battleRecords.set(this, record);
        }
        const result = original.apply(this, args);
        if (record && !record.done) {
          record.steps++;
          if (Number(this.time) >= record.nextFrameAt - 1e-6 || this.over) {
            record.nextFrameAt = Number(this.time) + BATTLE_FRAME_INTERVAL;
            if (record.frames.length < BATTLE_FRAME_LIMIT) record.frames.push(battleFrame(this, record));
            else record.truncated = true;
          }
          sendBattleFrames(record);
          if (this.over) finishBattleRecording(this, record);
        }
        return result;
      };
      Object.defineProperty(prototype, 'step', {configurable: true, writable: true, value: replacement});
      Object.defineProperty(prototype, '__kantoReplayStep', {configurable: true, value: true});
      battleHookReady = prototype.step === replacement;
      battleHookError = battleHookReady ? '' : 'Could not attach the battle recorder';
      return battleHookReady;
    } catch {
      battleHookError = 'Could not load the battle animation module';
      return false;
    }
  }

  function boardFor(player) {
    const state = player?.s ?? player ?? {};
    const units = state.units ?? {};
    return Object.entries(state.board ?? {}).map(([cell, unitId]) => {
      const unit = unitId && typeof unitId === 'object' ? unitId : units[unitId];
      if (!unit) return null;
      const number = Number(cell);
      if (!Number.isInteger(number)) return null;
      return {
        cell: number,
        line: String(unit.line ?? unit.id ?? unit.name ?? 'Unknown'),
        star: Number(unit.star ?? 1), ...(['phys','spec'].includes(unit.form)?{form:unit.form}:{}),
        num: numberOrNull(unit.num),
        items: Array.isArray(unit.items) ? unit.items.map(item => typeof item === 'string' ? item : item?.id).filter(Boolean).map(String) : [],
        shiny: !!unit.shiny,
      };
    }).filter(Boolean).sort((a, b) => a.cell - b.cell);
  }

  // Bench: nine slots of unit ids (or null) next to the board.
  function benchFor(state) {
    const units = state?.units ?? {};
    const bench = Array.isArray(state?.bench) ? state.bench.slice(0, 9) : [];
    return bench.map((unitId, slot) => {
      const unit = unitId && typeof unitId === 'object' ? unitId : units[unitId];
      if (!unit) return null;
      return {slot, line: String(unit.line ?? unit.id ?? 'Unknown'), star: Number(unit.star ?? 1), ...(['phys','spec'].includes(unit.form)?{form:unit.form}:{}), num: numberOrNull(unit.num),
        items: Array.isArray(unit.items) ? unit.items.map(item => typeof item === 'string' ? item : item?.id).filter(Boolean).map(String) : []};
    }).filter(Boolean);
  }

  function sealsFor(state) {
    const held = state?.seals?.have ?? state?.seals?.items ?? [];
    return Array.isArray(held) ? held.map(seal => typeof seal === 'string' ? seal : seal?.id).filter(Boolean).map(String) : [];
  }

  // Same rule the game uses for name plates: bots show their trainer name,
  // people show their nickname without the #tag.
  function seatName(player, state) {
    const seat = player?.seat ?? state?.seat ?? null;
    if (seat && typeof seat === 'object') {
      if (seat.cls && seat.name) return String(seat.name);
      if (typeof seat.nick === 'string' && seat.nick) return seat.nick.split('#')[0];
    }
    return String(state?.name ?? player?.name ?? player?.nickname ?? player?.nick ?? '');
  }

  function makeSnapshot(current) {
    const snap = current.snap();
    if (!snap || !Array.isArray(snap.players)) return null;
    const meIndex = snap.players.findIndex(player => String(player.id) === String(snap.me));
    if (meIndex < 0) return null;
    const ownPlayer = snap.players[meIndex];
    const ownState = ownPlayer.s ?? ownPlayer;
    const round = snap.round ?? {};
    const stageName = round.stage ?? round.stageName;
    const roundNumber = round.r ?? round.n ?? snap.n;
    const label = stageName !== undefined && roundNumber !== undefined
      ? `${stageName}-${roundNumber}` : `Round ${snap.n ?? '?'}`;
    const roundKey = String(snap.n ?? label);
    const players = snap.players.slice(0, 8).map((player, index) => {
      const state = player.s ?? player;
      const place = player.place ?? null;
      return {
        key: `seat-${index}`,
        seat: index,
        name: seatName(player, state).slice(0, 36),
        bot: !!(player.seat?.bot ?? state.seat?.bot),
        place: numberOrNull(place),
        hp: numberOrNull(state.hp),
        level: numberOrNull(state.level),
        board: boardFor(player),
      };
    });
    const rawSeed = snap.seed ?? current.seed;
    const shopSlots = Array.isArray(ownState.shop) ? ownState.shop.slice(0, 8).map(slot =>
      slot === null || slot === undefined ? null : String(typeof slot === 'object' ? slot.line ?? slot.id ?? '' : slot).slice(0, 40) || null) : null;
    // Who we fight this round: a player, a ghost copy of a player, or PvE.
    const fight = snap.fight && typeof snap.fight === 'object' ? snap.fight : null;
    let fightInfo = null;
    if (fight) {
      const pve = !!fight.pve || fight.opponent === 'pve';
      const index = pve ? -1 : snap.players.findIndex(player => String(player.id) === String(fight.opponent));
      fightInfo = {pve, ghost: !!fight.ghost, opponentKey: index >= 0 ? `seat-${index}` : '', team: Number(fight.team) || 0};
    }
    return {
      runId,
      seed: rawSeed === undefined || rawSeed === null || rawSeed === '' ? null : String(rawSeed).slice(0, 80),
      timestamp: new Date().toISOString(),
      roundKey,
      roundLabel: label,
      roundIndex: Number.isFinite(Number(snap.n)) ? Number(snap.n) : null,
      stage: String(snap.stage ?? ownState.phase ?? 'unknown'),
      roundKind: String(round.kind ?? '').slice(0, 20),
      fight: fightInfo,
      meKey: `seat-${meIndex}`,
      meAlive: snap.meAlive !== false,
      place: numberOrNull(snap.place),
      own: {
        gold: numberOrNull(ownState.gold),
        hp: numberOrNull(ownState.hp),
        level: numberOrNull(ownState.level),
        rollN: Number.isFinite(Number(ownState.rollN)) ? Number(ownState.rollN) : 0,
        board: boardFor(ownPlayer),
        bench: benchFor(ownState),
        seals: sealsFor(ownState),
        shop: shopSlots,
      },
      players,
    };
  }

  function rawGold(current) {
    try {
      const snap = current.snap();
      const player = snap?.players?.find(item => String(item.id) === String(snap.me));
      const state = player?.s ?? player;
      const roundKey = snap?.n ?? (snap?.round ? `${snap.round.stage ?? ''}-${snap.round.r ?? ''}` : '');
      return {
        roundKey: String(roundKey),
        gold: numberOrNull(state?.gold),
        rollN: numberOrNull(state?.rollN),
      };
    } catch {
      return null;
    }
  }

  function emitSnapshot(current) {
    const snapshot = makeSnapshot(current);
    if (!snapshot) return null;
    const sig = JSON.stringify([snapshot.roundKey, snapshot.stage, snapshot.meAlive, snapshot.place, snapshot.fight,
      snapshot.own, snapshot.players]);
    if (sig !== signature) {
      signature = sig;
      post('snapshot', snapshot);
    }
    return snapshot;
  }

  // The match object notifies the game's UI of every state change (a server-confirmed reroll,
  // a buy, a move). Listening there catches shops that change faster than the 0.6s poll.
  let watched = null;
  let unwatch = null;
  let emitTimer = 0;
  let lastStage = '';
  let stateHook = false;
  function scheduleEmit(current) {
    if (emitTimer) return;
    // Planning changes go out at once; during a fight the poll rate is plenty.
    emitTimer = setTimeout(() => {
      emitTimer = 0;
      if (source !== current) return;
      try { lastStage = emitSnapshot(current)?.stage ?? lastStage; } catch {}
    }, lastStage === 'combat' ? 500 : 0);
  }
  function watch(current) {
    if (watched === current) return;
    try { unwatch?.(); } catch {}
    unwatch = null;
    watched = current;
    stateHook = false;
    if (!current || typeof current.subscribe !== 'function') return;
    try {
      const off = current.subscribe(() => scheduleEmit(current));
      unwatch = typeof off === 'function' ? off : null;
      stateHook = true;
    } catch {}
  }

  function instrument(current) {
    if (!current || wrapped.has(current)) return;
    const methods = ['act', 'pickSeal', 'pickBoon', 'pickCarousel'];
    let installed = 0;
    for (const method of methods) {
      const original = current[method];
      if (typeof original !== 'function') continue;
      const replacement = function (...args) {
        try { emitSnapshot(current); } catch {}
        const before = rawGold(current);
        let result;
        try {
          result = original.apply(this, args);
          return result;
        } finally {
          const after = rawGold(current);
          if (before && after && before.gold !== null && after.gold !== null) {
            const action = method === 'act' ? String(args[0]?.t ?? 'action') : method;
            const rawDetail = method === 'act' && args[0] && typeof args[0] === 'object'
              ? args[0] : {slot: args[0]};
            const detail = Object.fromEntries(Object.entries(rawDetail).filter(([, value]) =>
              typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean').slice(0, 12));
            post('action', {
              runId,
              roundKey: before.roundKey,
              action,
              detail,
              goldBefore: before.gold,
              goldAfter: after.gold,
              rollBefore: before.rollN,
              rollAfter: after.rollN,
              at: new Date().toISOString(),
            });
          }
          try { emitSnapshot(current); } catch {}
        }
      };
      try {
        Object.defineProperty(current, method, {configurable: true, writable: true, value: replacement});
        if (current[method] === replacement) installed++;
      } catch {
        // Snapshot recording still works if a future game build freezes this adapter.
      }
    }
    wrapped.set(current, installed);
    hookReady = installed > 0;
  }

  // The current match lives in the lazily loaded pvpMode-*.js chunk (export s),
  // not in PvpOnline-*.js. Prefer the modulepreload link the game adds when it
  // loads that chunk; otherwise read the chunk name from PvpOnline's own source.
  async function findModeURL() {
    if (modeURL) return modeURL;
    const direct = moduleByPrefix('pvpMode');
    if (direct) return (modeURL = direct);
    const online = moduleByPrefix('PvpOnline');
    if (!online) return null;
    try {
      const source = await (await fetch(online, {cache: 'force-cache', credentials: 'same-origin'})).text();
      const names = [...new Set([...source.matchAll(/["'`]\.\/(pvpMode-[^"'`]+\.js)["'`]/g)].map(match => match[1]))];
      if (names.length !== 1) { modeError = 'The live match module was not found'; return null; }
      return (modeURL = new URL(names[0], online).href);
    } catch {
      modeError = 'Could not read the game module list';
      return null;
    }
  }

  // Never call the chunk's init export (n) ourselves: the game's lazy-init
  // wrapper caches a failed first init forever, so an early call before boot
  // data arrives would break PvP until reload. Importing only evaluates
  // declarations; `s` becomes a function once the game has initialized it.
  async function locateMode() {
    if (onlineMode && typeof onlineMode.s === 'function') return true;
    const url = await findModeURL();
    if (!url) return false;
    try {
      onlineMode = onlineMode ?? await import(url);
    } catch {
      modeError = 'Could not load the live match module';
      return false;
    }
    if (typeof onlineMode.s !== 'function') {
      modeError = '';
      return false;
    }
    modeError = '';
    return true;
  }

  // A rejoined match gets a new match object, so identify the match itself:
  // the game's seed when it has one, otherwise the lobby's player ids, plus our seat.
  function hashText(text) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193) >>> 0;
    return hash.toString(36);
  }
  function matchRunId(current) {
    try {
      const snap = current.snap();
      const me = String(snap?.me ?? '');
      const seed = current.seed;
      if ((typeof seed === 'number' && Number.isFinite(seed)) || (typeof seed === 'string' && seed)) {
        return `match-s${hashText(String(seed))}-${hashText(me)}`;
      }
      const ids = Array.isArray(snap?.players) ? snap.players.map(player => String(player?.id ?? '')).filter(Boolean) : [];
      if (ids.length >= 2 && me) return `match-p${hashText(ids.join('|'))}-${hashText(me)}`;
    } catch {}
    return crypto.randomUUID();
  }

  function endRun(reason) {
    if (!runId) return;
    post(finished ? 'closed' : 'left', {runId, reason, at: new Date().toISOString()});
  }

  async function tick() {
    if (!await locateMode()) {
      emitStatus('waiting', modeError ? `Waiting for the live game (${modeError.toLowerCase()})` : 'Waiting for the live game');
      return;
    }
    await locateBattleHook();
    let current;
    try { current = onlineMode.s(); } catch { current = null; }
    if (!current || typeof current.snap !== 'function') {
      if (source) {
        watch(null);
        endRun('Left the match');
        source = null;
        runId = null;
        signature = '';
      }
      emitStatus('waiting', 'Choose an online match to start recording');
      return;
    }
    if (source !== current) {
      endRun('Game session changed');
      source = current;
      runId = matchRunId(current);
      signature = '';
      finished = false;
      hookReady = false;
    }
    instrument(current);
    watch(current);
    try {
      const snapshot = makeSnapshot(current);
      if (snapshot) lastStage = snapshot.stage;
      if (!snapshot) {
        emitStatus('waiting', 'Waiting for match data');
        return;
      }
      const sig = JSON.stringify([snapshot.roundKey, snapshot.stage, snapshot.meAlive, snapshot.place, snapshot.fight,
        snapshot.own, snapshot.players]);
      if (sig !== signature) {
        signature = sig;
        post('snapshot', snapshot);
      }
      if (!snapshot.meAlive || snapshot.place !== null) {
        if (!finished) {
          finished = true;
          post('finished', {runId, place: snapshot.place, at: new Date().toISOString()});
        }
        emitStatus('finished', 'Match saved');
      } else {
        const details = [
          battleHookReady ? 'fight playback ready' : 'fight playback unavailable',
          hookReady ? 'economy actions captured' : 'economy may be estimated',
          stateHook ? 'every shop captured' : 'shops checked every 0.6s',
        ].join(', ');
        emitStatus('recording', `Recording this match, ${details}`);
      }
    } catch {
      emitStatus('waiting', 'Waiting for match data');
    }
  }

  const timer = setInterval(() => { void tick(); }, 600);
  void tick();
  window.addEventListener('pagehide', () => {
    watch(null);
    endRun('Page closed');
    clearInterval(timer);
  }, {once: true});
})();
