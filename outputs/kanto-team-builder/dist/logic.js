(() => {
  const data = globalThis.KANTO_DATA,
    lines = Object.fromEntries(data.roster.map((r) => [r.id, r])),
    items = Object.fromEntries(data.items.map((r) => [r.id, r]));
  function equip(current, id) {
    if (!Object.hasOwn(items, id)) throw new Error("Unknown item.");
    const next = [...current];
    if (items[id].kind === "part") {
      const slot = next.findIndex((x) => items[x].kind === "part");
      if (slot >= 0) {
        const combined = data.recipes[next[slot]][id];
        next[slot] = combined;
        return { items: next, combined };
      }
    }
    if (next.length >= 3) throw new Error("All three item slots are full.");
    next.push(id);
    return { items: next, combined: null };
  }
  function skill(u) {
    const r = lines[u.line],
      star = u.star;
    if (r.flex?.stars.includes(star)) {
      const axes = r.flex.axes ?? ["atk", "spa"], counts = {};
      for (const id of u.items ?? []) {
        const item = items[id];
        for (const part of item?.kind === "part" ? [id] : item?.parts ?? []) {
          const axis = items[part]?.stat;
          counts[axis] = (counts[axis] ?? 0) + 1;
        }
      }
      const attack = counts[axes[0]] ?? 0, special = counts[axes[1]] ?? 0;
      const mode =
        attack > special ? "phys" : special > attack ? "spec" : r.flex.def;
      return r.flex[mode][star - 1];
    }
    return r.forms[star - 1].skill;
  }
  function suggestions(u) {
    return [...(lines[u.line].forms[u.star - 1].itemFit ?? [])]
      .filter((x) => !(u.items ?? []).includes(x.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }
  function bis(u) {
    return globalThis.KANTO_BIS?.states?.[u.line + ":" + u.star] ?? null;
  }
  function itemDetails(id) {
    const item = items[id];
    if (!item) throw new Error("Unknown item.");
    const replaces = ["choice-band", "choice-specs", "choice-scarf"].includes(
      id,
    );
    const parts = item.kind === "part" ? [id] : replaces ? [] : item.parts;
    const counts = {};
    for (const part of parts) counts[part] = (counts[part] ?? 0) + 1;
    const stats = replaces
      ? [item.short]
      : Object.entries(counts).map(
          ([part, count]) =>
            items[part].short + (count > 1 ? " ×" + count : ""),
        );
    return {
      ...item,
      stats,
      sequential: Object.values(counts).some((n) => n > 1),
      effect:
        item.kind === "part"
          ? "Combines with another component to create a finished item."
          : replaces
            ? "Replaces the two component bonuses with this finished item’s bonus."
            : item.short,
    };
  }
  function traits(board) {
    const counts = {};
    const seen = new Set();
    for (const u of Object.values(board)) {
      if (!u || !lines[u.line] || seen.has(u.line)) continue;
      seen.add(u.line);
      for (const t of lines[u.line].traits) counts[t] = (counts[t] ?? 0) + 1;
    }
    return Object.entries(data.traits).map(([name, r]) => {
      const count = counts[name] ?? 0,
        tier = r.thresholds.filter((x) => count >= x).length;
      return {
        name,
        count,
        tier,
        active: tier > 0,
        next: r.thresholds.find((x) => x > count) ?? null,
        value: tier ? r.values[tier - 1] : null,
        ...r,
      };
    });
  }
  function clean(payload) {
    if (
      !payload ||
      payload.v !== 1 ||
      !payload.board ||
      !Array.isArray(payload.bench)
    )
      throw new Error("Choose a Kanto Team Lab team file.");
    let id = 0;
    const unit = (u) => {
      if (!u || !Object.hasOwn(lines, u.line) || ![1, 2, 3].includes(u.star))
        throw new Error("This team contains an unknown Pokémon or star level.");
      const held = u.items ?? [];
      if (
        !Array.isArray(held) ||
        held.length > 3 ||
        held.some((id) => !Object.hasOwn(items, id))
      )
        throw new Error("This Pokémon has invalid equipment.");
      if (held.filter((id) => items[id].kind === "part").length > 1)
        throw new Error("Two components must combine into a finished item.");
      return { id: ++id, line: u.line, star: u.star, items: [...held] };
    };
    const board = {};
    for (const [key, u] of Object.entries(payload.board)) {
      const n = Number(key);
      if (!Number.isInteger(n) || String(n) !== key || n < 0 || n >= 28)
        throw new Error("This team has an invalid board position.");
      board[n] = unit(u);
    }
    const level = Number(payload.level);
    if (!Number.isInteger(level) || level < 2 || level > 9)
      throw new Error("Team size must be a whole number from two to nine.");
    if (Object.keys(board).length > level)
      throw new Error("This team has more deployed units than its team size.");
    if (payload.bench.length > 9)
      throw new Error("The bench has at most nine slots.");
    const bench = Array.from({ length: 9 }, (_, i) =>
      payload.bench[i] ? unit(payload.bench[i]) : null,
    );
    return {
      v: 1,
      level,
      board,
      bench,
      nextId: id + 1,
      mode: payload.mode === "png" ? "png" : "sprite",
    };
  }
  const catalogue = new Map();
  for (const r of data.roster)
    for (const f of r.forms) {
      if (f.shiny) continue;
      const old = catalogue.get(f.num);
      if (!old || (old.branchOf && !r.branchOf))
        catalogue.set(f.num, {
          line: r.id,
          star: f.star,
          num: f.num,
          name: f.name,
          cost: r.cost,
          traits: r.traits,
          role: r.role,
          branchOf: r.branchOf,
        });
    }
  globalThis.TeamLogic = {
    traits,
    clean,
    lines,
    items,
    equip,
    skill,
    suggestions,
    bis,
    itemDetails,
    catalogue: [...catalogue.values()].sort(
      (a, b) => a.cost - b.cost || a.num - b.num,
    ),
  };
})();
