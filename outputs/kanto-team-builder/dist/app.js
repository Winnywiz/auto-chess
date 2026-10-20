(() => {
  "use strict";
  const D = window.KANTO_DATA,
    L = window.TeamLogic,
    $ = (s) => document.querySelector(s),
    lineOf = (u) => L.lines[u.line],
    formOf = (u) => lineOf(u).forms[u.star - 1];
  const colors = {
    Normal: "#8b9571",
    Fire: "#c77742",
    Water: "#5287a9",
    Grass: "#6c9950",
    Electric: "#b29b3b",
    Ice: "#6aa2a5",
    Fighting: "#ad7057",
    Poison: "#946c9d",
    Ground: "#af9560",
    Flying: "#8497ac",
    Psychic: "#b27492",
    Bug: "#90a34e",
    Rock: "#a69b74",
    Ghost: "#89749e",
    Dragon: "#747eaa",
  };
  const media = (path) => window.KANTO_MEDIA?.[path] ?? "media/" + path;
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const example = () => ({
    v: 1,
    level: 9,
    nextId: 7,
    mode: "sprite",
    board: {
      2: { id: 1, line: "bulbasaur", star: 1 },
      4: { id: 2, line: "paras", star: 1 },
      8: { id: 3, line: "oddish", star: 1 },
      10: { id: 4, line: "weedle", star: 1 },
      22: { id: 5, line: "pikachu", star: 1 },
      24: { id: 6, line: "magnemite", star: 1 },
    },
    bench: Array(9).fill(null),
  });
  let state = example(),
    selected = 1,
    target = null,
    filter = { q: "", trait: "", cost: 0, role: "" },
    allTraits = false,
    past = [],
    future = [],
    toastTimer;
  const find = (id) => {
    for (const [key, u] of Object.entries(state.board))
      if (u.id === id) return { kind: "board", key: +key, u };
    for (let i = 0; i < 9; i++)
      if (state.bench[i]?.id === id)
        return { kind: "bench", key: i, u: state.bench[i] };
    return null;
  };
  const unitAt = (kind, key) =>
    kind === "board" ? state.board[key] : state.bench[key];
  const put = (kind, key, u) => {
    if (kind === "board") {
      if (u) state.board[key] = u;
      else delete state.board[key];
    } else state.bench[key] = u ?? null;
  };
  function toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2600);
  }
  function saveLocal() {
    try {
      localStorage.setItem("kanto-team-lab-v1", JSON.stringify(state));
    } catch {}
  }
  function commit(fn) {
    const before = JSON.stringify(state);
    try {
      if (fn() === false) {
        state = JSON.parse(before);
        return false;
      }
    } catch (e) {
      state = JSON.parse(before);
      render();
      toast(e.message);
      return false;
    }
    if (before !== JSON.stringify(state)) {
      past.push(before);
      if (past.length > 40) past.shift();
      future = [];
      saveLocal();
    }
    render();
    return true;
  }
  function undo() {
    if (!past.length) return;
    future.push(JSON.stringify(state));
    state = JSON.parse(past.pop());
    selected = null;
    target = null;
    saveLocal();
    render();
    toast("Last change undone.");
  }
  function redo() {
    if (!future.length) return;
    past.push(JSON.stringify(state));
    state = JSON.parse(future.pop());
    selected = null;
    saveLocal();
    render();
  }
  function art(u, mode = state.mode, size = 80) {
    const f = formOf(u),
      key = (f.shiny ? "shiny-" : "") + f.num,
      m = D.frames[key];
    if (mode === "png" && m) {
      const w = Math.min(size, (size * m.w) / m.h),
        h = Math.min(size, (size * m.h) / m.w);
      return `<span class="frame-art" role="img" aria-label="${esc(f.name)} PNG portrait" style="width:${w}px;height:${h}px;aspect-ratio:${m.w}/${m.h};background-image:url('${media("frames/" + key + ".png")}');background-size:${m.n * 100}% 100%"></span>`;
    }
    return `<img class="sprite-img" src="${media(mode === "png" ? "icons/" + f.num + ".png" : "sprites/" + key + ".gif")}" alt="${esc(f.name)}" draggable="false" ${size < 65 ? 'loading="lazy"' : ""}>`;
  }
  function itemIcon(id) {
    return `<img class="item-icon" src="${media("items/" + id + ".png")}" alt="${esc(L.items[id].name)}" draggable="false">`;
  }
  const roleName = (role) => role.charAt(0).toUpperCase() + role.slice(1);
  function recommendationHTML(u) {
    return `<section class="recommendations" aria-label="Suggested items"><div class="equipment-heading"><h3>Suggested items</h3></div><div class="suggested-items">${L.suggestions(
      u,
    )
      .map(
        ({ id }) =>
          `<button data-suggest-item="${id}" data-item="${id}" data-tooltip-item="${id}" draggable="true" aria-label="Equip suggested ${esc(L.items[id].name)}">${itemIcon(id)}<span>${esc(L.items[id].name)}</span></button>`,
      )
      .join(
        "",
      )}</div><p class="recommendation-source">Individual item fit from native bot logic.</p></section>`;
  }
  function itemTooltipHTML(id) {
    const item = L.itemDetails(id);
    const recipe = item.parts.length
      ? `<div class="item-tooltip-section"><div class="tooltip-label">Recipe</div><div class="tooltip-recipe">${item.parts.map((part) => `<span>${itemIcon(part)}${esc(L.items[part].name)}</span>`).join("<b>+</b>")}</div></div>`
      : "";
    return `<div class="tooltip-pokemon tooltip-item-heading"><img src="${media("items/" + id + ".png")}" alt=""><b>${esc(item.name)}</b><span class="item-kind">${item.kind === "part" ? "Component" : "Item"}</span></div><div class="item-tooltip-section"><div class="tooltip-label">Stats</div><ul class="item-stat-lines">${item.stats.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>${item.sequential ? "<small>Each component bonus applies separately.</small>" : ""}</div><div class="item-tooltip-section"><div class="tooltip-label">Effect</div><p>${esc(item.effect)}</p></div>${recipe}`;
  }

  function bisHTML(u) {
    const result = L.bis(u);
    if (!result)
      return `<section class="bis-panel" tabindex="-1" aria-label="BIS candidates"><div class="equipment-heading"><h3>BIS candidates</h3></div><p class="bis-note">This form and star level was not tested.</p>${recommendationHTML(u)}</section>`;
    const percent = (score) => (100 * score).toFixed(1) + "%";
    const cards = (items) => `<div class="suggested-items bis-items">${items.map((id) => `<button data-suggest-item="${id}" data-item="${id}" data-tooltip-item="${id}" draggable="true" aria-label="Equip BIS item ${esc(L.items[id].name)}">${itemIcon(id)}<span>${esc(L.items[id].name)}</span></button>`).join("")}</div>`;
    return `<section class="bis-panel" tabindex="-1" aria-label="BIS candidates"><div class="equipment-heading"><h3>${esc(formOf(u).name)} BIS</h3><span>${u.star} ${u.star === 1 ? "star" : "stars"}</span></div><div class="bis-build-heading"><span>Search pick</span><b>${percent(result.score)} 6v6 score</b></div><p class="bis-provenance">${result.battles} confirmation battles / 8 opponent lineups / 32 seeds / both sides. Wins + half draws.</p>${cards(result.items)}<button class="bis-equip" data-equip-bis="selected" title="Replaces all equipped items">Equip build</button><details class="bis-alternative"><summary>Alternative <b>${percent(result.alternative.score)}${result.confidence === "alternative" ? " / Higher score" : result.confidence === "close" ? " / Similar result" : ""}</b></summary>${cards(result.alternative.items)}<button class="bis-equip" data-equip-bis="alternative" title="Replaces all equipped items">Equip alternative</button></details><details class="bis-native"><summary>Native suggestions</summary>${recommendationHTML(u)}</details></section>`;
  }

  function skillDescription(m) {
    if (m.desc) return m.desc;
    const base = {
      nuke: "Hits the current target.",
      shield: "Grants a shield to the user.",
      line: "Hits enemies along a line.",
      proj: "Hits the current target.",
      target: "Hits the current target.",
      aoeTarget: "Hits enemies around the target.",
      aoeSelf: "Hits nearby enemies.",
      multi: "Strikes repeatedly.",
      buff: "Empowers the user.",
      heal: "Restores health.",
      drain: "Drains health from the target.",
      splash: "Splashes without dealing damage.",
      teleport: "Teleports to a new position.",
      transform: "Transforms into an enemy.",
      metronome: "Uses a randomly selected move.",
      rest: "Sleeps and restores health.",
      dash: "Dashes into the enemy.",
      beam: "Fires a beam.",
      self: "Applies an effect to the user.",
      execute: "Attempts to finish the target.",
    };
    let text =
      base[m.kind] ??
      "Move pattern: " + m.kind.replace(/([A-Z])/g, " $1").toLowerCase() + ".";
    if (m.hits) text += " " + m.hits + " hits.";
    if (m.radius) text += " Radius " + m.radius + " hexes.";
    if (m.stun)
      text += " " + (m.status ?? "Crowd control") + " for " + m.stun + "s.";
    if (m.burn) text += " Applies burn.";
    if (m.poison) text += " Applies poison.";
    if (m.slow) text += " Slows attack speed by " + m.slow + "%.";
    if (m.provoke) text += " Draws attacks for " + m.provoke + "s.";
    return text;
  }
  function skillMarkup(u) {
    const m = L.skill(u),
      f = formOf(u);
    const stats = [`${m.start ?? 0} / ${m.mana ?? 0} Energy`];
    if (m.power !== undefined) stats.push("Power " + m.power);
    if (m.canCrit) stats.push("Ability can crit");
    if (m.scale)
      stats.push(
        `${Math.round((m.scale.atk ?? 0) * 100)}% Attack + ${Math.round((m.scale.spa ?? 0) * 100)}% Sp. Atk`,
      );
    return `<div class="skill-heading"><b>${esc(m.name)}</b><span class="skill-type" style="--tc:${colors[m.type] ?? colors.Normal}">${esc(m.type)}</span></div><div class="skill-stats">${stats.map(esc).join(" / ")}</div><p>${esc(skillDescription(m))}</p>${lineOf(u).flex?.stars.includes(u.star) ? "<small>Skill follows the equipped component balance.</small>" : ""}`;
  }
  function inspectorExtras(u) {
    const r = lineOf(u),
      held = u.items ?? [];
    return `<div class="evolution-previews" aria-label="Evolutions">${r.forms.map((f) => `<button data-evolve="${f.star}" data-skill-unit="${u.id}" data-star="${f.star}" aria-label="${esc(f.name)}, ${f.star} star skill" class="${f.star === u.star ? "current" : ""}"><span class="evo-art">${art({ ...u, star: f.star }, "png", 42)}</span><span>${esc(f.name)}</span><small>${"★".repeat(f.star)}</small></button>`).join("")}</div><div class="inspector-skill">${skillMarkup(u)}</div><div class="equipment-heading"><h3>Equipment</h3><span>${held.length} / 3</span></div><div class="held-items">${Array.from(
      { length: 3 },
      (_, i) => {
        const id = held[i];
        return id
          ? `<button class="held-item" data-unequip="${i}" data-tooltip-item="${id}" aria-label="Remove ${esc(L.items[id].name)}">${itemIcon(id)}<span>${esc(L.items[id].name)}</span><b aria-hidden="true">×</b></button>`
          : `<button class="empty-item-slot" aria-label="Choose item for slot ${i + 1}">+ <span>Item slot</span></button>`;
      },
    ).join("")}</div>${bisHTML(u)}`;
  }
  function renderItems() {
    const unit = find(selected)?.u;
    $("#equip-target").textContent = unit
      ? `${formOf(unit).name} / ${(unit.items ?? []).length} of 3 slots`
      : "Select a Pokémon";
    if (!$("#component-table").children.length) {
      const part = (id) =>
        `<span>${itemIcon(id)}<span>${esc(L.items[id].name)}</span></span>`;
      $("#component-table").innerHTML =
        `<thead><tr><th scope="col">+</th>${D.components.map((id) => `<th scope="col"><button data-item="${id}" draggable="true" aria-label="Equip ${esc(L.items[id].name)}" data-tooltip-item="${id}">${part(id)}</button></th>`).join("")}</tr></thead><tbody>${D.components
          .map(
            (a) =>
              `<tr><th scope="row"><button data-item="${a}" draggable="true" aria-label="Equip ${esc(L.items[a].name)}" data-tooltip-item="${a}">${part(a)}</button></th>${D.components
                .map((b) => {
                  const id = D.recipes[a][b];
                  return `<td><button data-item="${id}" draggable="true" aria-label="Equip ${esc(L.items[id].name)} from ${esc(L.items[a].name)} plus ${esc(L.items[b].name)}" data-tooltip-item="${id}">${part(id)}</button></td>`;
                })
                .join("")}</tr>`,
          )
          .join("")}</tbody>`;
    }
  }
  function equipItem(id, unitId = selected) {
    const located = find(unitId);
    if (!located) return toast("Select a Pokémon first.");
    let combined = null;
    if (
      commit(() => {
        const result = L.equip(located.u.items ?? [], id);
        located.u.items = result.items;
        combined = result.combined;
        selected = unitId;
      })
    )
      toast(
        combined
          ? `${L.items[combined].name} combined.`
          : `${L.items[id].name} equipped.`,
      );
  }
  for (const section of [$("#component-table")])
    section.onclick = (e) => {
      const button = e.target.closest("[data-item]");
      if (button) equipItem(button.dataset.item);
    };
  let skillAnchor = null;
  function hideSkill() {
    $("#skill-tooltip").hidden = true;
    skillAnchor?.removeAttribute("aria-describedby");
    skillAnchor = null;
  }
  function showSkill(anchor) {
    if (!anchor) return;
    if (anchor.dataset.tooltipItem) {
      const tooltip = $("#skill-tooltip");
      skillAnchor?.removeAttribute("aria-describedby");
      skillAnchor = anchor;
      tooltip.innerHTML = itemTooltipHTML(anchor.dataset.tooltipItem);
      tooltip.hidden = false;
      anchor.setAttribute("aria-describedby", "skill-tooltip");
      positionSkill(anchor);
      return;
    }
    const unit = anchor.dataset.skillUnit
      ? find(+anchor.dataset.skillUnit)?.u
      : {
          line: anchor.dataset.skillLine,
          star: +anchor.dataset.star,
          items: [],
        };
    if (!unit) return;
    const u = { ...unit, star: +anchor.dataset.star || unit.star },
      f = formOf(u),
      tooltip = $("#skill-tooltip");
    skillAnchor?.removeAttribute("aria-describedby");
    skillAnchor = anchor;
    tooltip.innerHTML = `<div class="tooltip-pokemon"><img src="${media("icons/" + f.num + ".png")}" alt=""><b>${esc(f.name)}</b><span>${"★".repeat(u.star)}</span></div>${skillMarkup(u)}`;
    tooltip.hidden = false;
    anchor.setAttribute("aria-describedby", "skill-tooltip");
    positionSkill(anchor);
  }
  function positionSkill(anchor) {
    const tooltip = $("#skill-tooltip"),
      rect = anchor.getBoundingClientRect(),
      box = tooltip.getBoundingClientRect();
    const left = Math.min(
      innerWidth - box.width - 10,
      Math.max(10, rect.left + rect.width / 2 - box.width / 2),
    );
    let top = rect.top - box.height - 10;
    if (top < 10) top = rect.bottom + 10;
    tooltip.style.left = left + "px";
    tooltip.style.top =
      Math.max(10, Math.min(innerHeight - box.height - 10, top)) + "px";
  }
  const skillSelector =
    "[data-skill-unit],[data-skill-line],[data-tooltip-item]";
  document.addEventListener("pointerover", (e) => {
    const anchor = e.target.closest(skillSelector);
    if (anchor && anchor !== skillAnchor) showSkill(anchor);
  });
  document.addEventListener("pointerout", (e) => {
    if (skillAnchor && !skillAnchor.contains(e.relatedTarget)) hideSkill();
  });
  document.addEventListener("focusin", (e) => {
    const anchor = e.target.closest(skillSelector);
    if (anchor) showSkill(anchor);
    else hideSkill();
  });
  document.addEventListener("focusout", hideSkill);
  document.addEventListener(
    "scroll",
    () => {
      if (!skillAnchor) return;
      const rect = skillAnchor.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) hideSkill();
      else positionSkill(skillAnchor);
    },
    true,
  );
  window.addEventListener("resize", hideSkill);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideSkill();
  });

  function miniTraits(traits) {
    return traits
      .map(
        (t) =>
          `<span class="mini-trait" style="--tc:${colors[t]}"><img src="${media("types/" + t.toLowerCase() + ".png")}" alt="">${t}</span>`,
      )
      .join("");
  }
  function unitHTML(u) {
    const f = formOf(u);
    return `<span class="unit-stars" aria-hidden="true">${"★".repeat(u.star)}</span><span class="unit-figure">${art(u, state.mode, 82)}</span><span class="unit-name">${esc(f.name)}</span><span class="unit-items">${(u.items ?? []).map((id) => itemIcon(id)).join("")}</span>`;
  }
  function renderBoard() {
    $("#board").innerHTML = Array.from(
      { length: 4 },
      (_, r) =>
        `<div class="hex-row">${Array.from({ length: 7 }, (_, c) => {
          const key = r * 7 + c,
            u = state.board[key];
          return `<button class="hex ${u ? "occupied" : "empty"} ${u?.id === selected ? "selected" : ""} ${target === key ? "target" : ""}" data-place="board" data-key="${key}" ${u ? `draggable="true" data-unit="${u.id}" data-skill-unit="${u.id}"` : ""} aria-label="${u ? `${esc(formOf(u).name)}, ${u.star} star, ` : "Empty "}${String.fromCharCode(65 + c)}${r + 1}" aria-pressed="${u?.id === selected}">${u ? unitHTML(u) : '<span class="plus" aria-hidden="true">+</span>'}<span class="coordinate" aria-hidden="true">${String.fromCharCode(65 + c)}${r + 1}</span></button>`;
        }).join("")}</div>`,
    ).join("");
    $("#bench").innerHTML = state.bench
      .map(
        (u, key) =>
          `<button class="bench-slot ${u ? "occupied" : "empty"} ${u?.id === selected ? "selected" : ""}" data-place="bench" data-key="${key}" ${u ? `draggable="true" data-unit="${u.id}" data-skill-unit="${u.id}"` : ""} aria-label="Bench slot ${key + 1}${u ? ", " + esc(formOf(u).name) : ", empty"}" aria-pressed="${u?.id === selected}">${u ? unitHTML(u) : ""}</button>`,
      )
      .join("");
    const ts = L.traits(state.board),
      units = Object.values(state.board);
    $("#unit-count").textContent = units.length;
    $("#unit-cap").textContent = "/ " + state.level;
    $("#active-count").textContent = ts.filter((t) => t.active).length;
    $("#team-cost").textContent = units.reduce(
      (v, u) => v + lineOf(u).cost * 3 ** (u.star - 1),
      0,
    );
    $("#level").value = state.level;
    $("#undo").disabled = past.length === 0;
    $("#mode-sprite").setAttribute("aria-pressed", state.mode === "sprite");
    $("#mode-png").setAttribute("aria-pressed", state.mode === "png");
  }
  function renderTraits() {
    const ts = L.traits(state.board).sort(
      (a, b) =>
        Number(b.active) - Number(a.active) ||
        b.tier - a.tier ||
        b.count - a.count ||
        a.name.localeCompare(b.name),
    );
    $("#trait-total").textContent = ts.filter((t) => t.active).length;
    $("#traits-present").classList.toggle("active", !allTraits);
    $("#traits-all").classList.toggle("active", allTraits);
    const show = allTraits ? ts : ts.filter((t) => t.count);
    $("#traits").innerHTML = show.length
      ? show
          .map((t) => {
            const value = t.value ?? t.values[0],
              desc = t.desc.replaceAll("{v}", value),
              max = t.thresholds[t.thresholds.length - 1];
            return `<button class="trait-row ${t.active ? "active" : ""} ${filter.trait === t.name ? "is-filtered" : ""}" data-trait="${t.name}" style="--tc:${colors[t.name]}" aria-label="${t.name}, ${t.count} unique lines, ${t.active ? "tier " + t.tier + " active" : "inactive"}. Filter Pokémon." title="Find more ${t.name} Pokémon"><span class="trait-row-head"><span class="trait-icon"><img src="${media("types/" + t.name.toLowerCase() + ".png")}" alt=""></span><span><h3>${t.name}${t.active ? ' <span class="next-trait">ACTIVE</span>' : ""}</h3><span class="trait-breakpoints">${t.thresholds.map((n, i) => `<span class="breakpoint ${t.count >= n ? "reached" : ""} ${i === t.tier - 1 ? "current" : ""}">${n}</span>`).join("")}</span></span><span class="trait-fraction">${t.count}<small> / ${t.next ?? max}</small></span></span><span class="trait-effect">${!t.active ? "Unlock: " : ""}${esc(desc)}</span></button>`;
          })
          .join("")
      : '<div class="no-results">Your team’s traits will appear here.<br>Add a Pokémon to get started.</div>';
  }
  function renderCatalogue() {
    const q = filter.q.toLowerCase().trim(),
      cards = L.catalogue.filter(
        (x) =>
          (!filter.cost || x.cost === filter.cost) &&
          (!filter.role || x.role === filter.role) &&
          (!filter.trait || x.traits.includes(filter.trait)) &&
          (!q ||
            x.name.toLowerCase().includes(q) ||
            x.line.includes(q) ||
            String(x.num) === q),
      );
    $("#catalogue-count").textContent =
      cards.length +
      " Pokémon " +
      (filter.q || filter.trait || filter.cost || filter.role
        ? "match your filters"
        : "available");
    $("#catalogue").innerHTML = cards.length
      ? cards
          .map((x) => {
            const u = { line: x.line, star: x.star };
            return `<button class="pokemon-card" draggable="true" data-line="${x.line}" data-star="${x.star}" data-skill-line="${x.line}" aria-label="Add ${esc(x.name)}, ${x.star} star, cost ${x.cost}, ${x.traits.join(" and ")}" ><span class="card-number">#${String(x.num).padStart(3, "0")}</span><span class="card-cost">₽ ${x.cost}</span><span class="portrait">${art(u, "png", 46)}</span><span class="card-name">${esc(x.name)}</span><span class="card-traits">${miniTraits(x.traits)}</span><span class="card-role" data-role-name="${x.role}">${roleName(x.role)}</span><span class="card-stage" aria-hidden="true">${"★".repeat(x.star)}</span></button>`;
          })
          .join("")
      : '<div class="no-results">No Pokémon found.<br>Try another name, trait, or cost.</div>';
    $("#trait-filter").value = filter.trait;
    document.querySelectorAll("[data-role]").forEach((b) => {
      const on = b.dataset.role === filter.role;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on);
    });
    document.querySelectorAll("[data-cost]").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.cost) === filter.cost);
      b.setAttribute("aria-pressed", Number(b.dataset.cost) === filter.cost);
    });
    $("#reset-filters").hidden =
      !filter.q && !filter.trait && !filter.cost && !filter.role;
  }
  function renderInspector() {
    const found = find(selected),
      el = $("#inspector");
    if (!found) {
      el.innerHTML =
        '<div class="inspector-content"><div class="eyebrow">DETAILS</div><p class="empty-inspector">Select a Pokémon.</p></div>';
      return;
    }
    const u = found.u,
      r = lineOf(u),
      f = formOf(u),
      branches = r.id === "eevee" || r.branchOf === "eevee";
    el.innerHTML = `<div class="inspector-content"><div class="inspector-top"><span class="eyebrow">DETAILS</span><button class="bis-jump" data-show-bis>BIS items ↓</button><img width="28" height="20" style="object-fit:contain;image-rendering:pixelated" src="${media("icons/" + f.num + ".png")}" alt="${esc(f.name)} icon"></div><div class="selected-card"><div class="selected-art">${art(u, state.mode, 78)}</div><div><div class="selected-name">${esc(f.name)}</div><div class="selected-meta">${r.role} / ${r.cost} gold / ${found.kind === "board" ? "Deployed" : "Benched"}</div><div class="selected-traits">${miniTraits(r.traits)}</div></div></div><div class="star-controls" aria-label="Star level">${[1, 2, 3].map((n) => `<button data-upgrade="${n}" data-skill-unit="${u.id}" data-star="${n}" class="${u.star === n ? "active" : ""}" aria-pressed="${u.star === n}" aria-label="Set ${n} star">${"★".repeat(n)}</button>`).join("")}</div>${branches ? `<select class="branch-select" id="branch" aria-label="Eevee evolution branch">${["eevee", "vaporeon", "jolteon", "flareon"].map((id) => `<option value="${id}" ${u.line === id ? "selected" : ""}>${L.lines[id].forms[1].name} / ${L.lines[id].traits.join(" / ")}</option>`).join("")}</select>` : ""}${inspectorExtras(u)}</div><div class="inspector-bottom"><button class="text-button" id="move-unit">${found.kind === "board" ? "Move to bench ↓" : "Deploy to board ↑"}</button><button class="text-button remove-unit" id="remove-unit">Remove ×</button></div>`;
    el.querySelectorAll("[data-suggest-item]").forEach(
      (b) => (b.onclick = () => equipItem(b.dataset.suggestItem)),
    );
    el.querySelectorAll("[data-equip-bis]").forEach((button) => {
      button.onclick = () => {
        const unit = find(selected)?.u, result = unit && L.bis(unit);
        if (!result) return;
        const build = button.dataset.equipBis === "alternative" ? result.alternative.items : result.items;
        const scroll = el.querySelector(".inspector-content").scrollTop;
        const alternativeOpen = el.querySelector(".bis-alternative").open;
        if (commit(() => { unit.items = [...build]; })) {
          el.querySelector(".bis-alternative").open = alternativeOpen;
          el.querySelector(".inspector-content").scrollTop = scroll;
          toast("Build equipped. Undo restores previous items.");
        }
      };
    });
    el.querySelector("[data-show-bis]").onclick = () => {
      const panel = el.querySelector(".bis-panel");
      panel.scrollIntoView({ block: "start" });
      panel.focus({ preventScroll: true });
    };
    el.querySelectorAll("[data-unequip]").forEach(
      (b) =>
        (b.onclick = () =>
          commit(() => {
            find(selected).u.items.splice(+b.dataset.unequip, 1);
          })),
    );
    el.querySelectorAll(".empty-item-slot").forEach(
      (b) => (b.onclick = () => $("#component-table [data-item]").focus()),
    );
    el.querySelectorAll("[data-evolve]").forEach(
      (b) =>
        (b.onclick = () =>
          commit(() => {
            find(selected).u.star = +b.dataset.evolve;
          })),
    );
    el.querySelectorAll("[data-upgrade]").forEach(
      (b) =>
        (b.onclick = () =>
          commit(() => {
            find(selected).u.star = +b.dataset.upgrade;
          })),
    );
    el.querySelector("#remove-unit").onclick = removeSelected;
    el.querySelector("#move-unit").onclick = () => {
      if (found.kind === "board") {
        const key = state.bench.indexOf(null);
        if (key < 0)
          return toast("Your bench is full. Remove a benched Pokémon first.");
        moveUnit(u.id, "bench", key);
      } else {
        if (Object.keys(state.board).length >= state.level)
          return toast(
            "Your team is full. Move or remove a deployed Pokémon first.",
          );
        const key = Array.from({ length: 28 }, (_, i) => i).find(
          (i) => !state.board[i],
        );
        moveUnit(u.id, "board", key);
      }
    };
    if (branches)
      el.querySelector("#branch").onchange = (e) =>
        commit(() => {
          const unit = find(selected).u;
          unit.line = e.target.value;
          if (unit.line !== "eevee") unit.star = Math.max(2, unit.star);
        });
  }
  function render() {
    if (selected !== null && !find(selected)) selected = null;
    renderBoard();
    renderTraits();
    renderCatalogue();
    renderInspector();
    renderItems();
    hideSkill();
  }
  function add(line, star, kind = "board", key = null) {
    if (!L.lines[line]) return;
    commit(() => {
      if (
        kind === "board" &&
        Object.keys(state.board).length >= state.level &&
        !state.board[key]
      ) {
        kind = "bench";
        key = state.bench.indexOf(null);
        if (key < 0)
          throw new Error(
            "Your team and bench are full. Remove a Pokémon to make room.",
          );
        toast("Your board is full. Added to the bench.");
      }
      if (key === null)
        key =
          kind === "board"
            ? target !== null && !state.board[target]
              ? target
              : Array.from({ length: 28 }, (_, i) => i).find(
                  (i) => !state.board[i],
                )
            : state.bench.indexOf(null);
      if (key === undefined || key < 0)
        throw new Error("No free slot. Remove a Pokémon to make room.");
      const old = unitAt(kind, key);
      if (old) {
        const free = state.bench.indexOf(null);
        if (free < 0)
          throw new Error(
            "Your bench is full. Move the Pokémon before replacing it.",
          );
        state.bench[free] = old;
      }
      const u = { id: state.nextId++, line, star, items: [] };
      put(kind, key, u);
      selected = u.id;
      target = null;
    });
  }
  function moveUnit(id, kind, key) {
    commit(() => {
      const src = find(id);
      if (!src) return false;
      if (src.kind === kind && src.key === key) return false;
      const other = unitAt(kind, key);
      if (
        kind === "board" &&
        src.kind === "bench" &&
        !other &&
        Object.keys(state.board).length >= state.level
      )
        throw new Error(
          "Your team is full. Drop onto another Pokémon to swap.",
        );
      put(src.kind, src.key, other);
      put(kind, key, src.u);
      selected = id;
      target = null;
    });
  }
  function removeSelected() {
    const f = find(selected);
    if (!f) return;
    commit(() => {
      put(f.kind, f.key, null);
      selected = null;
    });
  }
  function onPlaceClick(e) {
    const el = e.target.closest("[data-place]");
    if (!el) return;
    const kind = el.dataset.place,
      key = +el.dataset.key,
      u = unitAt(kind, key);
    if (u) {
      selected = selected === u.id ? null : u.id;
      target = null;
      renderBoard();
      renderInspector();
      renderItems();
    } else if (selected !== null) {
      moveUnit(selected, kind, key);
    } else {
      target = kind === "board" ? key : null;
      renderBoard();
    }
  }
  $("#board").onclick = onPlaceClick;
  $("#bench").onclick = onPlaceClick;
  $("#catalogue").onclick = (e) => {
    const el = e.target.closest("[data-line]");
    if (el) add(el.dataset.line, +el.dataset.star);
  };
  document.addEventListener("dragstart", (e) => {
    hideSkill();
    const el = e.target.closest("[data-unit],[data-line],[data-item]");
    if (!el) return;
    const d = el.dataset.item
      ? { item: el.dataset.item }
      : el.dataset.unit
        ? { id: +el.dataset.unit }
        : { line: el.dataset.line, star: +el.dataset.star };
    e.dataTransfer.setData("text/plain", JSON.stringify(d));
    e.dataTransfer.effectAllowed = "copyMove";
    document.body.classList.add("dragging");
  });
  for (const root of [$("#board"), $("#bench")]) {
    root.addEventListener("dragover", (e) => {
      const el = e.target.closest("[data-place]");
      if (!el) return;
      e.preventDefault();
      el.classList.add("dragover");
      e.dataTransfer.dropEffect = "move";
    });
    root.addEventListener("dragleave", (e) => {
      const el = e.target.closest("[data-place]");
      if (el && !el.contains(e.relatedTarget)) el.classList.remove("dragover");
    });
    root.addEventListener("drop", (e) => {
      const el = e.target.closest("[data-place]");
      if (!el) return;
      e.preventDefault();
      document.body.classList.remove("dragging");
      try {
        const d = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (d.item) {
          const unit = unitAt(el.dataset.place, +el.dataset.key);
          if (unit) equipItem(d.item, unit.id);
          else toast("Drop the item onto a Pokémon.");
          return;
        }
        d.id
          ? moveUnit(+d.id, el.dataset.place, +el.dataset.key)
          : add(d.line, +d.star, el.dataset.place, +el.dataset.key);
      } catch {
        toast("Drag a Pokémon from the catalogue, board, or bench.");
      }
    });
  }
  document.addEventListener("dragend", () => {
    document.body.classList.remove("dragging");
    document
      .querySelectorAll(".dragover")
      .forEach((e) => e.classList.remove("dragover"));
  });
  $("#role-filters").innerHTML = ["", ...new Set(D.roster.map((r) => r.role))]
    .map(
      (role) =>
        '<button data-role="' +
        role +
        '" aria-pressed="' +
        !role +
        '">' +
        (role ? roleName(role) : "All roles") +
        "</button>",
    )
    .join("");
  $("#role-filters").onclick = (e) => {
    const b = e.target.closest("[data-role]");
    if (!b) return;
    filter.role = filter.role === b.dataset.role ? "" : b.dataset.role;
    renderCatalogue();
  };
  $("#search").oninput = (e) => {
    filter.q = e.target.value;
    renderCatalogue();
  };
  $("#trait-filter").onchange = (e) => {
    filter.trait = e.target.value;
    renderCatalogue();
    renderTraits();
  };
  document.querySelectorAll("[data-cost]").forEach(
    (b) =>
      (b.onclick = () => {
        filter.cost = +b.dataset.cost;
        renderCatalogue();
      }),
  );
  $("#reset-filters").onclick = () => {
    filter = { q: "", trait: "", cost: 0, role: "" };
    $("#search").value = "";
    renderCatalogue();
    renderTraits();
  };
  $("#traits").onclick = (e) => {
    const b = e.target.closest("[data-trait]");
    if (!b) return;
    filter.trait = filter.trait === b.dataset.trait ? "" : b.dataset.trait;
    renderCatalogue();
    renderTraits();
    $("#catalogue-title").scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };
  $("#traits-present").onclick = () => {
    allTraits = false;
    renderTraits();
  };
  $("#traits-all").onclick = () => {
    allTraits = true;
    renderTraits();
  };
  $("#level").innerHTML = Array.from(
    { length: 8 },
    (_, i) => `<option value="${i + 2}">${i + 2}</option>`,
  ).join("");
  $("#level").onchange = (e) => {
    const level = +e.target.value;
    commit(() => {
      const keys = Object.keys(state.board).sort((a, b) => a - b),
        extra = Math.max(0, keys.length - level);
      if (state.bench.filter((x) => !x).length < extra)
        throw new Error(
          "The bench needs more room before reducing your team size.",
        );
      for (const key of keys.slice(level)) {
        const slot = state.bench.indexOf(null);
        state.bench[slot] = state.board[key];
        delete state.board[key];
      }
      state.level = level;
    });
  };
  $("#mode-sprite").onclick = () =>
    commit(() => {
      state.mode = "sprite";
    });
  $("#mode-png").onclick = () =>
    commit(() => {
      state.mode = "png";
    });
  $("#undo").onclick = undo;
  $("#clear").onclick = () => {
    commit(() => {
      state.board = {};
      state.bench = Array(9).fill(null);
      selected = null;
      target = null;
    });
    toast("Team cleared. Undo brings it back.");
  };
  $("#example").onclick = () => {
    commit(() => {
      state = example();
      selected = 1;
      target = null;
    });
    toast("Example team loaded.");
  };
  $("#guide").onclick = () => $("#help-dialog").showModal();
  document
    .querySelectorAll(".dialog-close")
    .forEach((b) => (b.onclick = () => $("#help-dialog").close()));
  $("#help-dialog").onclick = (e) => {
    if (e.target === $("#help-dialog")) {
      const r = e.target.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        e.target.close();
    }
  };
  $("#save").onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "kanto-team.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Team saved as kanto-team.json.");
  };
  $("#copy-link").onclick = async () => {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(state)))),
      url = location.href.split("#")[0] + "#team=" + payload;
    try {
      await navigator.clipboard.writeText(url);
      toast("Team link copied.");
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.append(t);
      t.select();
      const ok = document.execCommand("copy");
      t.remove();
      toast(ok ? "Team link copied." : "Use Save team to keep this formation.");
    }
  };
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input,textarea,select") || $("#help-dialog").open)
      return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    } else if (["Delete", "Backspace"].includes(e.key) && selected !== null) {
      e.preventDefault();
      removeSelected();
    } else if (e.key === "Escape") {
      selected = null;
      target = null;
      renderBoard();
      renderInspector();
      renderItems();
    }
  });
  try {
    const encoded = location.hash.match(/^#team=(.+)$/)?.[1];
    if (encoded)
      state = L.clean(JSON.parse(decodeURIComponent(escape(atob(encoded)))));
    else {
      const saved = localStorage.getItem("kanto-team-lab-v1");
      if (saved) state = L.clean(JSON.parse(saved));
    }
  } catch {
    toast("That saved team could not be loaded. Starting with the example.");
    state = example();
  }
  selected = Object.values(state.board)[0]?.id ?? null;
  for (const t of Object.keys(D.traits))
    $("#trait-filter").insertAdjacentHTML(
      "beforeend",
      `<option value="${t}">${t}</option>`,
    );
  for (const u of [
    ...Object.values(state.board),
    ...state.bench.filter(Boolean),
  ])
    u.items ??= [];
  const compactViewport = matchMedia("(max-width: 1040px)");
  function setPanel(name = null) {
    document.body.classList.toggle("show-details", name === "details");
    document.body.classList.toggle("show-traits", name === "traits");
    $("#details-toggle").setAttribute("aria-expanded", name === "details");
    $("#traits-toggle").setAttribute("aria-expanded", name === "traits");
    $(".center-column").inert = !!name;
    hideSkill();
  }
  $("#details-toggle").onclick = () =>
    setPanel(
      document.body.classList.contains("show-details") ? null : "details",
    );
  $("#traits-toggle").onclick = () =>
    setPanel(document.body.classList.contains("show-traits") ? null : "traits");
  $("#panel-backdrop").onclick = () => setPanel();
  compactViewport.addEventListener("change", () => setPanel());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setPanel();
  });
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $("#theme-picker").value = theme;
    $("meta[name='theme-color']").content = theme === "pallet" ? "#171f30" : "#101914";
  }
  $("#theme-picker").onchange = (event) => {
    const theme = event.target.value;
    applyTheme(theme);
    hideSkill();
    try { localStorage.setItem("kanto-theme", theme); } catch {}
  };
  applyTheme(document.documentElement.dataset.theme);
  render();
})();
