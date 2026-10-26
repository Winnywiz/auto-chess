const statusTitle = document.querySelector('#status-title');
const statusCopy = document.querySelector('#status-copy');
const dot = document.querySelector('#status-dot');
const recent = document.querySelector('#recent');
const {placeBadge, shortDate} = globalThis.KantoUi;
globalThis.KantoUi.initTheme(null);

function openViewer(id = '') {
  const suffix = id ? `#${encodeURIComponent(id)}` : '';
  chrome.tabs.create({url: chrome.runtime.getURL(`viewer.html${suffix}`)});
  window.close();
}

function drawStatus(value) {
  const fresh = value && Date.now() - new Date(value.at || value.updatedAt || 0).getTime() < 10000;
  let title = 'Ready';
  let copy = 'Start an online match.';
  let state = '';
  if (value?.state === 'recording' && fresh) {
    title = 'Recording';
    const missing = [];
    if (!value.actionHook) missing.push('Gold totals estimated');
    if (!value.battleHook) missing.push('Fight playback off');
    copy = missing.join(' / ');
    state = 'live';
  } else if (value?.state === 'saved' && /stopped before/i.test(value.message || '')) {
    title = 'Saved up to where you left';
    copy = 'Rejoin the match to keep recording.';
    state = 'done';
  } else if (value?.state === 'finished' || value?.state === 'saved') {
    title = 'Match saved';
    copy = shortDate(value.updatedAt || value.at);
    state = 'done';
  } else if (value?.state === 'waiting' && value.message && /\(/.test(value.message)) {
    title = 'Not recording';
    copy = value.message.replace(/^Waiting for the live game \((.*)\)$/, '$1').replace(/^./, char => char.toUpperCase());
  } else if (value?.state === 'recording') {
    title = 'Paused';
    copy = 'Return to the game tab.';
  }
  statusTitle.textContent = title;
  statusCopy.textContent = copy;
  dot.className = `dot ${state}`.trim();
}

function drawReplays(replays) {
  recent.replaceChildren();
  const list = Array.isArray(replays) ? replays : [];
  document.querySelector('#count').textContent = `${list.length} saved`;
  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No replays yet.';
    recent.append(empty);
    return;
  }
  for (const replay of list.slice(0, 8)) {
    const button = document.createElement('button');
    button.className = 'replay';
    button.type = 'button';
    const head = document.createElement('span');
    head.className = 'replay-head';
    const when = document.createElement('span');
    when.className = 'when';
    when.textContent = shortDate(replay.createdAt);
    const who = document.createElement('span');
    who.className = 'who';
    const state = globalThis.KantoUi.replayState(replay);
    const stopped = state === 'left' && globalThis.KantoUi.stoppedRound(replay);
    who.textContent = stopped ? `Left in round ${stopped}` : (replay.playerName || '');
    head.append(when, who);
    const comp = globalThis.KantoComp.compPreview(replay, {maxUnits: 9, items: false, maxTraits: 4});
    if (comp.value !== null) {
      const value = document.createElement('span');
      value.className = 'value';
      value.textContent = String(comp.value);
      value.title = 'Board value';
      head.append(value);
    }
    button.append(placeBadge(replay), head, comp.box);
    button.setAttribute('aria-label', `${button.querySelector('.place').title}, ${when.textContent}${comp.value !== null ? `, board value ${comp.value}` : ''}`);
    button.addEventListener('click', () => openViewer(replay.id));
    recent.append(button);
  }
}

async function refresh() {
  const {replays, activeStatus} = await globalThis.KantoUi.readReplays();
  drawStatus(activeStatus);
  drawReplays(replays);
}

document.querySelector('#open-library').addEventListener('click', () => openViewer());
chrome.storage.onChanged.addListener(() => { void refresh(); });
void refresh();
