// Small display helpers shared by the popup and the replay viewer.
(() => {
  const ordinal = n => {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return 'th';
    return ({1: 'st', 2: 'nd', 3: 'rd'})[n % 10] ?? 'th';
  };

  // Final placement as a large number; colour encodes the result band.
  function placeBadge(replay) {
    const badge = document.createElement('span');
    const place = Number(replay?.place);
    if (Number.isInteger(place) && place > 0) {
      badge.className = `place ${place === 1 ? 'first' : place <= 4 ? 'top' : 'bottom'}`;
      badge.append(String(place));
      const suffix = document.createElement('sup');
      suffix.textContent = ordinal(place);
      badge.append(suffix);
      badge.title = `Finished ${place}${ordinal(place)}`;
    } else {
      const state = replayState(replay);
      badge.className = `place ${state === 'live' ? 'live' : 'left'}`;
      badge.textContent = state === 'live' ? 'Live' : state === 'left' ? 'Left' : 'Done';
      badge.title = state === 'live' ? 'Still recording' : state === 'left'
        ? `Recording stopped${stoppedRound(replay) ? ` in round ${stoppedRound(replay)}` : ''} before the match ended` : 'Finished';
    }
    return badge;
  }

  // finished: the match ended while recording; live: updated in the last two minutes;
  // left: stopped before the end (you left, closed the tab, or the game lost connection).
  function replayState(replay) {
    if (replay?.complete) return 'finished';
    if (!replay?.stoppedAt && Date.now() - Date.parse(replay?.updatedAt || 0) < 120000) return 'live';
    return 'left';
  }

  function stoppedRound(replay) {
    return replay?.stoppedRound ?? replay?.rounds?.at?.(-1)?.label ?? null;
  }

  // HP across the rounds of a match, 0-100 scale.
  function hpSpark(rounds, width = 72, height = 22) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'spark');
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('aria-hidden', 'true');
    const values = (Array.isArray(rounds) ? rounds : []).map(round => Number(round?.ownHp)).filter(Number.isFinite);
    const base = document.createElementNS(ns, 'line');
    base.setAttribute('x1', '0'); base.setAttribute('x2', String(width));
    base.setAttribute('y1', String(height - 0.5)); base.setAttribute('y2', String(height - 0.5));
    svg.append(base);
    if (values.length > 1) {
      const top = Math.max(100, ...values);
      const points = values.map((value, index) => {
        const x = index / (values.length - 1) * width;
        const y = height - 1 - Math.max(0, value) / top * (height - 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      const line = document.createElementNS(ns, 'polyline');
      line.setAttribute('points', points.join(' '));
      svg.append(line);
    }
    return svg;
  }

  // "Today 23:42", "Yesterday 21:10", "24 Oct 22:05"
  function shortDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    const time = date.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});
    const today = new Date();
    const startOf = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const days = Math.round((startOf(today) - startOf(date)) / 86400000);
    if (days === 0) return `Today ${time}`;
    if (days === 1) return `Yesterday ${time}`;
    return `${date.toLocaleDateString(undefined, {day: 'numeric', month: 'short'})} ${time}`;
  }

  // Theme follows the site's choice of names: Viridian Forest (default) or Pallet Town.
  const THEME_KEY = 'kanto-theme';
  function applyTheme(value) {
    const theme = value === 'pallet' ? 'pallet' : 'viridian';
    if (theme === 'pallet') document.documentElement.dataset.theme = 'pallet';
    else delete document.documentElement.dataset.theme;
    return theme;
  }
  function initTheme(select) {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch {}
    const theme = applyTheme(saved);
    if (select) {
      select.value = theme;
      select.addEventListener('change', () => {
        const next = applyTheme(select.value);
        try { localStorage.setItem(THEME_KEY, next); } catch {}
      });
    }
  }
  window.addEventListener('storage', event => { if (event.key === THEME_KEY) applyTheme(event.newValue); });

  // Replays without their fight frames (fights live under battle:<id>:<round> keys).
  async function readReplays() {
    const local = chrome.storage.local;
    let data;
    if (typeof local.getKeys === 'function') {
      const keys = (await local.getKeys()).filter(key => key.startsWith('replay:') || key === 'activeStatus');
      data = keys.length ? await local.get(keys) : {};
    } else data = await local.get(null);
    const replays = Object.entries(data).filter(([key]) => key.startsWith('replay:')).map(([, value]) => value)
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return {replays, activeStatus: data.activeStatus ?? null};
  }

  // House style: no middle dots or em dashes in displayed text.
  const cleanText = value => String(value ?? '').replace(/\s*[\u00b7\u2014]\s*/g, ', ').replace(/\s+,/g, ',').trim();

  try { applyTheme(localStorage.getItem(THEME_KEY)); } catch {}

  globalThis.KantoUi = {placeBadge, hpSpark, shortDate, ordinal, replayState, stoppedRound, initTheme, readReplays, cleanText};
})();
