// Hover and focus tooltips for Pokémon, items and Seals.
// Mark an element with data-tip="unit" (data-line, data-star, data-items),
// data-tip="item" (data-item) or data-tip="seal" (data-seal).
(() => {
  const DATA = globalThis.KANTO_TIP_DATA ?? {units: {}, items: {}, seals: {}, traits: {}};
  const FALLBACK = globalThis.KANTO_REPLAY_DATA ?? {units: {}, items: {}, seals: {}};
  const clean = value => globalThis.KantoUi?.cleanText(value) ?? String(value ?? '');
  const pretty = value => String(value ?? '').replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  const url = path => globalThis.chrome?.runtime?.getURL?.(path) ?? path;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  // A recorded line can be the base line ("geodude") or, in older data, an evolved name ("graveler").
  function findUnit(line, star) {
    const key = String(line ?? '').toLowerCase();
    let unit = DATA.units[key];
    let form = null;
    if (unit) form = unit.forms.find(item => item.star === Number(star)) ?? unit.forms[0];
    else {
      for (const candidate of Object.values(DATA.units)) {
        const match = candidate.forms.find(item => item.name.toLowerCase().replace(/[^a-z0-9]/g, '') === key.replace(/[^a-z0-9]/g, ''));
        if (match) { unit = candidate; form = match; break; }
      }
    }
    return {unit, form};
  }

  function typeIcon(type) {
    const img = el('img', 'tip-type');
    img.src = url(`media/types/${String(type).toLowerCase()}.png`);
    img.alt = '';
    img.onerror = () => img.remove();
    return img;
  }

  function sealIcon(id, size = 28) {
    const base = String(id ?? '').split(':')[0];
    const info = DATA.seals?.[base];
    const art = DATA.sealArt;
    const icon = el('span', 'seal-icon');
    icon.style.width = icon.style.height = `${size}px`;
    if (info && Number.isInteger(info.icon) && art) {
      const scale = size / art.size;
      const col = info.icon % art.columns;
      const row = Math.floor(info.icon / art.columns);
      icon.style.backgroundImage = `url("${url(art.file)}")`;
      icon.style.backgroundSize = `${art.columns * art.size * scale}px ${art.rows * art.size * scale}px`;
      icon.style.backgroundPosition = `-${col * size}px -${row * size}px`;
    } else {
      const type = String(id ?? '').split(':')[1];
      if (type) icon.append(typeIcon(type));
      else icon.classList.add('blank');
    }
    icon.setAttribute('aria-hidden', 'true');
    return icon;
  }

  function sealName(id) {
    const [base, param] = String(id ?? '').split(':');
    const name = DATA.seals?.[base]?.name ?? FALLBACK.seals?.[base]?.name ?? pretty(base);
    return param ? `${name} (${pretty(param)})` : name;
  }

  function itemName(id) {
    return DATA.items?.[id]?.name ?? FALLBACK.items?.[id]?.name ?? pretty(id);
  }

  function unitTip(target) {
    const star = Math.max(1, Math.min(3, Number(target.dataset.star) || 1));
    const {unit, form} = findUnit(target.dataset.line, star);
    const box = el('div', 'tip-body');
    const head = el('div', 'tip-head');
    const name = el('strong', 'tip-title', form?.name ?? pretty(target.dataset.line));
    const stars = el('span', 'tip-stars', '★'.repeat(star));
    if (form?.num) {
      const pic = el('img', 'tip-sprite');
      pic.src = url(`media/sprites/${form.num}.gif`);
      pic.alt = '';
      pic.onerror = () => pic.remove();
      head.append(pic);
    }
    head.append(name, stars);
    if (unit?.cost) head.append(el('span', 'tip-cost', `${unit.cost} gold`));
    box.append(head);
    const types = form?.types ?? unit?.traits ?? [];
    if (types.length || unit?.role) {
      const row = el('div', 'tip-row');
      for (const type of types) { const chip = el('span', 'tip-chip'); chip.append(typeIcon(type), type); row.append(chip); }
      if (unit?.role) row.append(el('span', 'tip-muted', `${pretty(unit.role)}, range ${unit.range ?? 1}`));
      box.append(row);
    }
    const skill = form?.skill;
    if (skill?.name) {
      const block = el('div', 'tip-skill');
      const title = el('div', 'tip-skill-head');
      title.append(el('b', '', skill.name), el('span', 'tip-muted', [skill.type, skill.mana ? `${skill.mana} mana` : null].filter(Boolean).join(', ')));
      block.append(title);
      const text = clean(skill.desc || skill.tag);
      if (text) block.append(el('p', 'tip-text', text));
      box.append(block);
    }
    const items = (target.dataset.items || '').split(',').filter(Boolean);
    if (items.length) {
      const list = el('div', 'tip-items');
      for (const id of items) {
        const row = el('div', 'tip-item');
        const img = el('img');
        img.src = url(`media/items/${id}.png`);
        img.alt = '';
        img.onerror = () => img.remove();
        const short = clean(DATA.items?.[id]?.short ?? FALLBACK.items?.[id]?.short ?? '');
        row.append(img, el('b', '', itemName(id)), short ? el('span', 'tip-muted', short) : '');
        list.append(row);
      }
      box.append(list);
    }
    return box;
  }

  function itemTip(target) {
    const id = target.dataset.item;
    const info = DATA.items?.[id] ?? FALLBACK.items?.[id] ?? {};
    const box = el('div', 'tip-body');
    const head = el('div', 'tip-head');
    const img = el('img', 'tip-item-icon');
    img.src = url(`media/items/${id}.png`);
    img.alt = '';
    img.onerror = () => img.remove();
    head.append(img, el('strong', 'tip-title', itemName(id)));
    box.append(head);
    if (info.short) box.append(el('p', 'tip-text', clean(info.short)));
    if (info.parts?.length) box.append(el('p', 'tip-muted', `Made from ${info.parts.map(itemName).join(' and ')}`));
    return box;
  }

  function sealTip(target) {
    const id = target.dataset.seal;
    const base = String(id ?? '').split(':')[0];
    const info = DATA.seals?.[base] ?? {};
    const box = el('div', 'tip-body');
    const head = el('div', 'tip-head');
    head.append(sealIcon(id, 32), el('strong', 'tip-title', sealName(id)));
    box.append(head);
    const rarity = DATA.rarities?.[Number(info.rarity) - 1];
    const meta = [rarity, info.category, info.round ? `offered at ${info.round}` : null].filter(Boolean).join(', ');
    if (meta) box.append(el('p', `tip-muted rarity-${info.rarity ?? 0}`, meta));
    if (info.desc) box.append(el('p', 'tip-text', clean(info.desc.replaceAll('{T}',String(id??'').split(':')[1]??'the chosen type'))));
    else box.append(el('p', 'tip-muted', 'No description for this Seal in the site data.'));
    if (target.dataset.owner) box.append(el('p', 'tip-muted', target.dataset.owner));
    return box;
  }

  function traitTip(target) {
    const name = target.dataset.trait;
    const count = Number(target.dataset.count) || 0;
    const rule = DATA.traits?.[name] ?? {};
    const thresholds = rule.thresholds ?? [];
    const tier = thresholds.filter(value => count >= value).length;
    const box = el('div', 'tip-body');
    const head = el('div', 'tip-head');
    head.append(typeIcon(name), el('strong', 'tip-title', name), el('span', 'tip-muted', `${count} Pokémon`));
    box.append(head);
    if (thresholds.length) {
      const steps = el('div', 'tip-row');
      thresholds.forEach((value, index) => steps.append(el('span', `tip-step${index < tier ? ' on' : ''}`, String(value))));
      box.append(steps);
    }
    if (rule.desc) {
      const value = rule.values?.[Math.max(0, tier - 1)] ?? rule.values?.[0];
      box.append(el('p', 'tip-text', clean(rule.desc.replace('{v}', value ?? ''))));
    }
    return box;
  }

  const builders = {unit: unitTip, item: itemTip, seal: sealTip, trait: traitTip};
  let tip = null;
  let current = null;

  function ensureTip() {
    if (tip) return tip;
    tip = el('div', 'kt-tip');
    tip.id = 'kt-tip';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    document.body.append(tip);
    return tip;
  }

  function place(target) {
    const box = target.getBoundingClientRect();
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const gap = 10;
    let top = box.top - height - gap;
    if (top < 8) top = box.bottom + gap;
    if (top + height > innerHeight - 8) top = Math.max(8, innerHeight - height - 8);
    let left = box.left + box.width / 2 - width / 2;
    left = Math.max(8, Math.min(innerWidth - width - 8, left));
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  }

  function show(target) {
    const build = builders[target.dataset.tip];
    if (!build) return;
    ensureTip();
    current = target;
    tip.replaceChildren(build(target));
    tip.hidden = false;
    target.setAttribute('aria-describedby', 'kt-tip');
    place(target);
  }

  function hide(target) {
    if (target && target !== current) return;
    if (current) current.removeAttribute('aria-describedby');
    current = null;
    if (tip) tip.hidden = true;
  }

  document.addEventListener('pointerover', event => {
    const target = event.target.closest?.('[data-tip]');
    if (target && target !== current) show(target);
    else if (!target && current) hide();
  });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); });
  document.addEventListener('focusin', event => { const target = event.target.closest?.('[data-tip]'); if (target) show(target); });
  document.addEventListener('focusout', event => { if (event.target.closest?.('[data-tip]')) hide(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  window.addEventListener('scroll', () => { if (current?.isConnected && tip && !tip.hidden) place(current); else hide(); }, {passive: true});

  globalThis.KantoTips = {sealIcon, sealName, itemName, findUnit, typeIcon, hide};
})();
