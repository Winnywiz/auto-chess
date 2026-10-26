// KT1 planner interchange, checked against Einoow's v38 teamCode module.
// Source: https://einoow.com/playables/kanto-tactics/assets/teamCode-Nj05RPSR.js
// Rules describe the source board, not the version of the receiving planner.
(() => {
  'use strict';
  const idPattern = /^[a-z0-9-]{1,24}$/;
  function encode(team, {rules = 36, mode = 'pvp', name = '', coordinates = 'native'} = {}) {
    if (!Array.isArray(team) || !team.length) throw new Error('Add a Pokémon to the board first.');
    if (team.length > 10) throw new Error('The game planner supports up to 10 Pokémon.');
    if (!Number.isInteger(rules) || rules < 1 || rules > 9999) throw new Error('Unknown source game version.');
    if (!['pvp', 'tower', 'adv'].includes(mode)) throw new Error('Unknown game mode.');
    if (!['native', 'planner'].includes(coordinates)) throw new Error('Unknown board coordinates.');
    const cells = new Set(), lines = new Set();
    const units = team.map(unit => {
      const cell = unit.cell - (coordinates === 'native' ? 28 : 0);
      if (!Number.isInteger(cell) || cell < 0 || cell >= 28 || cells.has(cell)) throw new Error('Each Pokémon needs its own hex on your side.');
      if (!idPattern.test(unit.line)) throw new Error('Unknown Pokémon ID.');
      if (lines.has(unit.line)) throw new Error('The game planner supports one of each Pokémon. Remove duplicate Pokémon before copying.');
      if (!Number.isInteger(unit.star) || unit.star < 1 || unit.star > 3) throw new Error('Choose one to three stars for every Pokémon.');
      const items = unit.items ?? [];
      if (!Array.isArray(items) || items.length > 3 || items.some(id => !idPattern.test(id))) throw new Error('Each Pokémon can hold up to three valid items.');
      cells.add(cell); lines.add(unit.line);
      return {line: unit.line, star: unit.star, shiny: !!unit.shiny, cell, items: [...items]};
    }).sort((a,b) => a.cell - b.cell);
    const title = String(name).slice(0,40).toWellFormed();
    return ['KT1', 'r' + rules, 'xm=' + mode, ...(title ? ['xn=' + encodeURIComponent(title)] : []),
      ...units.map(u => `${u.line}:${u.star}${u.shiny ? 's' : ''}:${u.cell}${u.items.length ? ':' + u.items.join('.') : ''}`)].join(';');
  }
  async function copy(text) {
    try { if (navigator.clipboard?.writeText) {await navigator.clipboard.writeText(text); return true;} } catch {}
    const focused = document.activeElement, field = document.createElement('textarea');
    field.value = text; field.readOnly = true;
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(field); field.select();
    let copied = false;
    try {copied = document.execCommand('copy');} catch {}
    field.remove(); focused?.focus({preventScroll: true});
    return copied;
  }
  function show(message, code = '') {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = 'font:inherit;color:var(--ink);background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:24px;width:min(520px,calc(100vw - 40px));box-sizing:border-box';
    const heading = document.createElement('h2'); heading.textContent = 'Copy team code'; heading.style.cssText='font-size:18px;margin:0 0 12px';
    const note = document.createElement('p'); note.textContent = message; note.style.cssText='font-size:14px;line-height:1.6';
    dialog.append(heading, note);
    let field;
    if (code) {
      field = document.createElement('textarea'); field.value = code; field.readOnly = true; field.setAttribute('aria-label','Team code');
      field.style.cssText='box-sizing:border-box;width:100%;height:130px;font:inherit;font-size:13px;padding:10px;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:6px'; dialog.append(field);
    }
    const close = document.createElement('button'); close.textContent='Close'; close.className='text-button';
    close.onclick=()=>dialog.close(); dialog.append(close); dialog.addEventListener('close',()=>dialog.remove());
    document.body.append(dialog); dialog.showModal(); if(field){field.focus();field.select();}
  }
  async function copyFrom(button, makeCode) {
    if (button.disabled) return;
    const label = button.textContent; button.disabled = true;
    try {
      const code = makeCode();
      if (await copy(code)) button.textContent='Copied';
      else show('Copy this code, then paste it into the game planner.', code);
    } catch(error) {show(error.message);}
    finally {button.disabled=false;setTimeout(()=>{if(button.isConnected)button.textContent=label;},1800);}
  }
  globalThis.KantoTeamCode = {encode, copy, copyFrom};
})();
