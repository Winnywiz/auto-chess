// Final composition of a match, valued and grouped like the site's composition pages:
// board value = cost x copies (1, 3, 9 for 1-3 stars); traits count each line once.
(() => {
  const COPIES = {1: 1, 2: 3, 3: 9};
  const url = path => globalThis.chrome?.runtime?.getURL?.(path) ?? path;
  const pretty = value => String(value ?? '').replace(/[-_]/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  const starOf = unit => Math.max(1, Math.min(3, Number(unit?.star) || 1));
  const tips = () => globalThis.KantoTips;

  function unitInfo(unit) {
    const found = tips()?.findUnit(unit.line, starOf(unit)) ?? {};
    const legacy = globalThis.KANTO_REPLAY_DATA?.units?.[unit.line];
    const legacyForm = legacy?.forms?.[starOf(unit) - 1] ?? legacy?.forms?.[0];
    return {
      data: found.unit ?? null,
      name: found.form?.name ?? legacyForm?.name ?? legacy?.name ?? pretty(unit.line),
      num: Number(unit.num ?? legacyForm?.num ?? found.form?.num) || 0,
    };
  }

  function finalBoard(replay) {
    const rounds = replay?.rounds ?? [];
    for (let i = rounds.length - 1; i >= 0; i--) if (rounds[i]?.ownBoard?.length) return rounds[i].ownBoard;
    return [];
  }

  function summary(board) {
    let value = 0;
    const counts = new Map();
    const seen = new Set();
    for (const unit of board) {
      const {data} = unitInfo(unit);
      if (!data) continue;
      value += (Number(data.cost) || 0) * COPIES[starOf(unit)];
      if (seen.has(data)) continue;
      seen.add(data);
      for (const trait of data.traits ?? []) counts.set(trait, (counts.get(trait) ?? 0) + 1);
    }
    const rules = globalThis.KANTO_TIP_DATA?.traits ?? {};
    const traits = [...counts].map(([name, count]) => ({name, count, tier: (rules[name]?.thresholds ?? []).filter(x => count >= x).length}))
      .filter(trait => trait.tier > 0).sort((a, b) => b.tier - a.tier || b.count - a.count || a.name.localeCompare(b.name));
    const order = [...board].sort((a, b) => (unitInfo(b).data?.cost ?? 0) - (unitInfo(a).data?.cost ?? 0)
      || starOf(b) - starOf(a) || (b.items?.length ?? 0) - (a.items?.length ?? 0));
    return {value: board.length ? value : null, traits, order};
  }

  function sprite(unit, info, holder) {
    const label = info.name.slice(0, 2);
    if (!info.num) { holder.append(label); return; }
    const img = document.createElement('img');
    img.src = url(`media/sprites/${info.num}.gif`);
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => { img.onerror = () => { img.remove(); holder.append(label); }; img.src = url(`media/icons/${info.num}.png`); };
    holder.append(img);
  }

  function itemIcon(id, className = 'comp-item') {
    const item = document.createElement('span');
    item.className = className;
    item.dataset.tip = 'item';
    item.dataset.item = id;
    const icon = document.createElement('img');
    icon.src = url(`media/items/${id}.png`);
    icon.alt = tips()?.itemName(id) ?? pretty(id);
    icon.onerror = () => { icon.remove(); item.classList.add('text'); item.textContent = (tips()?.itemName(id) ?? pretty(id)).split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase(); };
    item.append(icon);
    return item;
  }

  function tipUnit(node, unit) {
    node.dataset.tip = 'unit';
    node.dataset.line = unit.line ?? '';
    node.dataset.star = String(starOf(unit));
    if (unit.items?.length) node.dataset.items = unit.items.join(',');
  }

  function compPreview(replay, {maxUnits = 12, items = true, maxTraits = Infinity} = {}) {
    const board = finalBoard(replay);
    const box = document.createElement('span');
    box.className = 'comp-preview';
    if (!board.length) {
      const none = document.createElement('span');
      none.className = 'comp-none';
      none.textContent = '-';
      box.append(none);
      return {box, value: null};
    }
    const {value, traits, order} = summary(board);
    if (traits.length) {
      const row = document.createElement('span');
      row.className = 'comp-traits';
      for (const trait of traits.slice(0, maxTraits)) {
        const chip = document.createElement('span');
        chip.className = `comp-trait tier-${trait.tier}`;
        chip.dataset.tip = 'trait';
        chip.dataset.trait = trait.name;
        chip.dataset.count = String(trait.count);
        if (tips()) chip.append(tips().typeIcon(trait.name));
        chip.append(String(trait.count));
        row.append(chip);
      }
      box.append(row);
    }
    const units = document.createElement('span');
    units.className = 'comp-units';
    for (const unit of order.slice(0, maxUnits)) {
      const info = unitInfo(unit);
      const column = document.createElement('span');
      column.className = 'comp-unit-col';
      const stars = document.createElement('i');
      stars.className = 'comp-stars';
      stars.textContent = '★'.repeat(starOf(unit));
      const slot = document.createElement('span');
      slot.className = 'comp-unit';
      tipUnit(slot, unit);
      sprite(unit, info, slot);
      column.append(stars, slot);
      if (items) {
        const held = document.createElement('span');
        held.className = 'comp-items';
        for (const id of (unit.items ?? []).slice(0, 3)) held.append(itemIcon(id));
        column.append(held);
      }
      units.append(column);
    }
    box.append(units);
    return {box, value};
  }

  globalThis.KantoComp = {finalBoard, summary, compPreview, unitInfo, itemIcon, tipUnit, sprite};
})();
