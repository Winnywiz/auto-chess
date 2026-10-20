import { n as e } from "./rolldown-runtime-8BhlS34s.js";
import {
  $ as t,
  Cr as n,
  E as r,
  G as i,
  H as a,
  I as o,
  J as s,
  L as c,
  M as l,
  Nn as u,
  P as d,
  Qn as f,
  S as p,
  U as m,
  Y as h,
  Z as g,
  _,
  _r as v,
  b as y,
  d as b,
  dr as x,
  et as ee,
  f as S,
  fr as te,
  i as ne,
  j as re,
  l as C,
  li as w,
  lr as ie,
  m as ae,
  n as oe,
  p as se,
  pr as ce,
  q as T,
  r as le,
  s as ue,
  t as de,
  tt as fe,
  u as pe,
  y as E,
  z as me,
  zn as he,
} from "./shop-B3uxLyVd.js";
import { d as ge, n as _e, r as D, s as ve } from "./roster-CpnLcVHu.js";
import {
  E as ye,
  Ft as be,
  Ht as xe,
  It as Se,
  Nt as Ce,
  Rt as we,
  Tt as Te,
  Wt as Ee,
  ct as De,
  kt as Oe,
  l as ke,
  lt as Ae,
} from "./sim-DVnRY1Xk.js";
import { n as je, t as Me } from "./defineProperty-CWxpEQeK.js";
var Ne, Pe, Fe;
function Ie() {
  return (Ie = e(() => {
    (ye(),
      (Ne = (e) =>
        !e || e.over || e.time < 24
          ? 1
          : e.time >= 120
            ? 10
            : e.time >= 54
              ? 3
              : 2),
      (Pe = (e, t) => {
        let n = Math.max(0, e) * t;
        return n <= 24 ? n : 24 + (n - 24) * 2;
      }),
      (Fe = (e, t) => (Math.min(e, 24) + Math.max(0, e - 24) / 2) / t));
  }))();
}
function Le(e, t, n) {
  return Re(e, t, n);
}
function Re(e, r, i) {
  switch (r.t) {
    case `buy`: {
      if (
        !O(r.slot) ||
        r.slot < 0 ||
        r.slot >= 5 ||
        (r.cell !== void 0 && !O(r.cell))
      )
        return k(e, `invalid`);
      let n = t(e),
        o = n.shop[r.slot];
      if (r.line !== void 0 && r.line !== o) return k(n, `stale`);
      if (!o) return k(n, `empty`);
      if (!Ve(n.phase)) return k(n, `phase`);
      let s = D[o];
      if (n.gold < s.cost) return k(n, `noGold`);
      let c = r.cell;
      if (c !== void 0) {
        if (n.phase !== `planning`) return k(n, `phase`);
        if (!Ae(c)) return k(n, `invalid`);
        if (n.board[c]) return k(n, `cellTaken`);
        if (a(n) >= n.level) return k(n, `fieldMax`);
      }
      let l = n.bench.indexOf(null),
        u = c === void 0 && l < 0 ? ne(n, r.slot) : null;
      if (c === void 0 && l < 0 && !u) return k(n, `benchFull`);
      if (u && n.gold < u.cost) return k(n, `noGold`);
      let d = u ? u.slots : [r.slot],
        f = { ...n.units },
        p = [...n.bench],
        m = { ...n.board },
        h = [...n.shop],
        g = [...n.shopShiny],
        _ = [],
        v = n.nextId,
        y = n.gold,
        b = n.shinyBought;
      for (let e of d) {
        let t = h[e],
          n = `u${v++}`,
          r = !!g[e];
        ((f[n] = { id: n, line: t, star: 1, ...(r ? { shiny: r } : {}) }),
          c === void 0 ? (l >= 0 ? (p[l] = n) : p.push(n)) : (m[c] = n),
          (h[e] = null),
          (g[e] = !1),
          (y -= D[t].cost),
          r && b++,
          _.push({ k: `bought`, id: n, line: t, shiny: r }));
      }
      let x = {
        ...n,
        nextId: v,
        gold: y,
        shop: h,
        shopShiny: g,
        ...(b === n.shinyBought ? {} : { shinyBought: b }),
      };
      return A(
        ee(
          x,
          { units: f, bench: p, board: m, items: n.items, floor: n.floor },
          i,
          _,
        ),
        _,
      );
    }
    case `sell`: {
      var o;
      let t = e,
        i = t.units[r.id];
      if (!i) return k(t, `notOwned`);
      if (t.phase !== `planning` && Object.values(t.board).includes(r.id))
        return k(t, `phase`);
      let a = n(D[i.line].cost, i.star),
        s = { ...t.units };
      delete s[r.id];
      let c = { ...t.board };
      for (let [e, t] of Object.entries(c)) t === r.id && delete c[+e];
      let l = [],
        u = ze(
          (o = i.items) != null && o.length
            ? [...t.items, ...i.items]
            : t.items,
          t.itemQueue,
          l,
        ),
        d = t.floor.includes(r.id)
          ? t.floor.filter((e) => e !== r.id)
          : t.floor;
      return (
        l.push({ k: `sold`, id: r.id, value: a }),
        A(
          {
            ...t,
            units: s,
            board: c,
            bench: t.bench.map((e) => (e === r.id ? null : e)),
            floor: d,
            gold: t.gold + a,
            ...u,
          },
          l,
        )
      );
    }
    case `undoSell`: {
      let t = e,
        { unit: n, value: i } = r.snap ?? {};
      if (!n || typeof n.id != `string` || !D[n.line] || !O(i))
        return k(t, `invalid`);
      if (t.gold < i) return k(t, `noGold`);
      let a = t.bench.indexOf(null);
      if (ie([...Object.values(t.units), n])) return k(t, `merge`);
      let o = [...t.bench],
        s = a >= 0 ? t.floor : [...t.floor, n.id];
      a >= 0 && (o[a] = n.id);
      let c = [...t.items],
        l = [...t.itemQueue],
        u = [];
      for (let e of n.items ?? []) {
        let t = l.lastIndexOf(e);
        if (t >= 0) {
          (l.splice(t, 1), u.push(e));
          continue;
        }
        let n = c.lastIndexOf(e);
        n >= 0 && (c.splice(n, 1), u.push(e));
      }
      let d = {
        id: n.id,
        line: n.line,
        star: n.star,
        ...(u.length ? { items: u } : {}),
        ...(n.shiny ? { shiny: !0 } : {}),
      };
      return A(
        {
          ...t,
          units: { ...t.units, [n.id]: d },
          bench: o,
          floor: s,
          gold: t.gold - i,
          items: c,
          itemQueue: l,
        },
        [{ k: `unsold`, id: n.id }],
      );
    }
    case `reroll`: {
      let t = e,
        n = r.free === !0,
        a = le(t);
      return !n && t.gold < a
        ? k(t, `noGold`)
        : A(
            {
              ...t,
              ...oe(t, i, t.level, Object.values(t.units)),
              gold: n ? t.gold : t.gold - a,
            },
            [{ k: `rerolled`, free: n }],
          );
    }
    case `buyXp`: {
      let t = e;
      if (t.level >= 9) return k(t, `maxLevel`);
      if (t.gold < 4) return k(t, `noGold`);
      let { level: n, xp: r } = he(t.level, t.xp, 4, t.round, Be(t));
      return A({ ...t, gold: t.gold - 4, level: n, xp: r }, [
        { k: `xp`, levelUp: n !== t.level },
      ]);
    }
    case `lock`: {
      let t = typeof r.on == `boolean` ? r.on : !e.locked;
      return A(t === e.locked ? e : { ...e, locked: t }, [
        { k: `locked`, on: t },
      ]);
    }
    case `eeveeKeep`: {
      if (typeof r.on != `boolean`) return k(e, `invalid`);
      let t = !!e.eeveeKeep;
      return r.on === t
        ? A(e, [{ k: `eeveeKeep`, on: r.on }])
        : A({ ...e, eeveeKeep: r.on }, [{ k: `eeveeKeep`, on: r.on }]);
    }
    case `toBench`: {
      var s;
      if (typeof r.id != `string` || !O(r.slot) || r.slot < 0 || r.slot >= 9)
        return k(e, `invalid`);
      let n = t(e),
        i = r.id,
        a = r.slot;
      if (n.phase !== `planning` && Object.values(n.board).includes(i))
        return k(n, `phase`);
      let o = [...n.bench],
        c = { ...n.board },
        l = o.indexOf(i),
        u =
          (s = Object.entries(c).find(([, e]) => e === i)) == null
            ? void 0
            : s[0],
        d = n.floor.indexOf(i),
        f = o[a],
        p = n.floor,
        m;
      if (l >= 0) ((o[l] = f), (o[a] = i), (m = `bench`));
      else if (u !== void 0)
        (delete c[+u], f && (c[+u] = f), (o[a] = i), (m = `board`));
      else if (d >= 0) {
        if (f) return k(n, `benchFullMakeRoom`);
        ((p = n.floor.filter((e) => e !== i)), (o[a] = i), (m = `floor`));
      } else m = `none`;
      return A({ ...n, bench: o, board: c, floor: p }, [
        { k: `moved`, id: i, from: m, to: `bench` },
      ]);
    }
    case `releaseFloor`: {
      if (typeof r.id != `string`) return k(e, `invalid`);
      if (!e.floor.includes(r.id)) return k(e, `notOwned`);
      let t = e.bench.indexOf(null);
      return t < 0
        ? k(e, `benchFull`)
        : Re(e, { t: `toBench`, id: r.id, slot: t }, i);
    }
    case `toBoard`: {
      var c;
      if (typeof r.id != `string` || !O(r.cell)) return k(e, `invalid`);
      if (e.phase !== `planning`) return k(e, `phase`);
      if (!Ae(r.cell)) return k(e, `invalid`);
      let n = t(e),
        i = r.id,
        o = r.cell,
        s = [...n.bench],
        l = { ...n.board },
        u = s.indexOf(i),
        d =
          (c = Object.entries(l).find(([, e]) => e === i)) == null
            ? void 0
            : c[0],
        f = n.floor.indexOf(i),
        p = l[o],
        m = n.floor,
        h;
      if (d !== void 0) (delete l[+d], p && (l[+d] = p), (h = `board`));
      else if (u >= 0) {
        if (!p && a(n) >= n.level) return k(n, `fieldMax`);
        ((s[u] = p ?? null), (h = `bench`));
      } else if (f >= 0) {
        if (!p && a(n) >= n.level) return k(n, `fieldMax`);
        if (p && !s.includes(null)) return k(n, `benchFullMakeRoom`);
        ((m = [...n.floor]),
          m.splice(f, 1),
          p && (s[s.indexOf(null)] = p),
          (h = `floor`));
      } else return k(n, `notOwned`);
      return (
        (l[o] = i),
        A({ ...n, bench: s, board: l, floor: m }, [
          { k: `moved`, id: i, from: h, to: `board` },
        ])
      );
    }
    case `autoPlace`: {
      if (e.phase !== `planning`) return k(e, `phase`);
      let n = t(e),
        r = g(n);
      if (!r.length) return A(n);
      let i = [...n.bench],
        a = { ...n.board },
        o = n.floor;
      for (let e of r)
        (e.slot >= 0 ? (i[e.slot] = null) : (o = o.filter((t) => t !== e.id)),
          (a[e.cell] = e.id));
      return A({ ...n, bench: i, board: a, floor: o }, [
        { k: `autoPlaced`, plan: r },
      ]);
    }
    case `pickItem`: {
      let t = e;
      if (!t.itemReward) return k(t, `empty`);
      if (!O(r.i)) return k(t, `invalid`);
      let n = t.itemReward[r.i];
      if (!n)
        return A({ ...t, itemReward: null, itemPrice: null }, [
          { k: `itemPicked`, item: null, queued: !1 },
        ]);
      let i = t.itemPrice ?? 0;
      if (i > t.gold) return k(t, `noGold`);
      let a = { ...t, gold: t.gold - i, itemReward: null, itemPrice: null };
      return Oe(t.items, n)
        ? A({ ...a, items: [...t.items, n] }, [
            { k: `itemPicked`, item: n, queued: !1 },
          ])
        : A({ ...a, itemQueue: [...t.itemQueue, n] }, [
            { k: `itemPicked`, item: n, queued: !0 },
          ]);
    }
    case `equip`: {
      let t = e;
      if (!O(r.inv)) return k(t, `invalid`);
      let n = t.items[r.inv],
        i = t.units[r.id];
      if (r.item !== void 0 && r.item !== n) return k(t, `stale`);
      if (!n || !i || xe(n)) return k(t, `invalid`);
      if (!j(t, r.id)) return k(t, `notInCombat`);
      let a = i.items ?? [],
        o = be(a, n);
      if (!o) return k(t, `maxItems`);
      let s = t.items.filter((e, t) => t !== r.inv),
        c = o.combined
          ? {
              full: o.combined,
              a: a.find((e) => Ce(e, n) === o.combined) ?? n,
              b: n,
            }
          : null;
      return A(
        {
          ...t,
          items: s,
          units: { ...t.units, [r.id]: { ...i, items: o.items } },
        },
        [{ k: `equipped`, id: r.id, item: n, combined: c }],
      );
    }
    case `combineItems`: {
      let t = e;
      if (!O(r.from) || !O(r.to)) return k(t, `invalid`);
      let n = t.items[r.from],
        i = t.items[r.to];
      if (r.items !== void 0 && (r.items[0] !== n || r.items[1] !== i))
        return k(t, `stale`);
      let a = r.from !== r.to && n && i ? Ce(n, i) : null;
      if (!a) return k(t, `invalid`);
      let o = t.items
        .map((e, t) => (t === r.to ? a : e))
        .filter((e, t) => t !== r.from);
      return A({ ...t, items: o }, [
        {
          k: `itemsCombined`,
          full: a,
          a: n,
          b: i,
          bag: r.to - +(r.from < r.to),
        },
      ]);
    }
    case `magnet`: {
      let t = e;
      if (!O(r.inv) || typeof r.id != `string`) return k(t, `invalid`);
      let n = t.units[r.id];
      if (r.item !== void 0 && r.item !== t.items[r.inv]) return k(t, `stale`);
      if (!n || !xe(t.items[r.inv])) return k(t, `invalid`);
      if (!j(t, r.id)) return k(t, `notInCombat`);
      let i = n.items ?? [];
      if (!i.length) return k(t, `empty`);
      let { items: a, ...o } = n,
        s = t.items.filter((e, t) => t !== r.inv),
        c = [{ k: `magnet`, id: r.id, items: [...i], bag: s.length }],
        l = ze([...s, ...i], t.itemQueue, c);
      return A({ ...t, ...l, units: { ...t.units, [r.id]: o } }, c);
    }
    case `sellQueued`: {
      let t = e,
        n = O(r.k) ? t.itemQueue[r.k] : void 0;
      if (!n) return k(t, `invalid`);
      let i = ce(n);
      return A(
        {
          ...t,
          itemQueue: t.itemQueue.filter((e, t) => t !== r.k),
          gold: t.gold + i,
        },
        [{ k: `queuedSold`, item: n, gold: i }],
      );
    }
    case `collectCoins`: {
      let t = e,
        n = t.coins;
      if (!n || n.left <= 0) return k(t, `empty`);
      if (r.k !== void 0 && typeof r.k != `number`) return k(t, `invalid`);
      let i = Math.max(0, Math.min(n.left, r.k ?? n.left));
      return i
        ? A({ ...t, gold: t.gold + i, coins: { ...n, left: n.left - i } }, [
            { k: `coins`, n: i },
          ])
        : A(t, [{ k: `coins`, n: 0 }]);
    }
    default:
      return k(e, `invalid`);
  }
}
function ze(e, t, n) {
  let r = m(e, t, n);
  return r.itemQueue === t ? { items: r.items } : r;
}
var O, k, A, Be, Ve, j;
function He() {
  return (He = e(() => {
    (ge(),
      we(),
      f(),
      De(),
      h(),
      de(),
      S(),
      (O = (e) => typeof e == `number` && Number.isInteger(e)),
      (k = (e, t, n = []) => ({ s: e, ev: n, err: t })),
      (A = (e, t = []) => ({ s: i(e), ev: t })),
      (Be = (e) => (e.mode === `pvp` ? ue.xpTable : void 0)),
      (Ve = (e) => e === `planning` || e === `combat`),
      (j = (e, t) =>
        e.units[t]
          ? e.phase === `planning` ||
            ((e.phase === `combat` ||
              e.phase === `intro` ||
              e.phase === `result`) &&
              e.bench.includes(t))
          : !1));
  }))();
}
function Ue(e, t) {
  let n = (n) => n[Math.floor(w(`${e}|pve|${t.n}`)() * n.length)];
  switch (t.pve) {
    case `route1`:
      return n(N.route1[Math.min(N.route1.length - 1, Math.max(0, t.r - 2))]);
    case `rocket`:
      return n(N.rocket);
    case `snorlax`:
      return n(N.snorlax);
    default:
      return N.legend[qe(e)];
  }
}
function We(e) {
  let t = w(`${e}|pve|shiny`);
  return t() >= 0.5
    ? null
    : { n: [1, 2, 7][Math.floor(t() * 3)], idx: Math.floor(t() * 1e6) };
}
function Ge(e, t) {
  let n = Ue(e, t),
    r = We(e),
    i = r && r.n === t.n ? r.idx % n.team.length : -1;
  return {
    specs: x(n.team, i),
    name: n.name,
    coins: i < 0 ? 0 : t.pve === `legend` ? 10 : 4,
  };
}
var M, N, P, Ke, qe;
function Je() {
  return (Je = e(() => {
    (f(),
      (M = (e, t = 1, n) => ({ line: e, star: t, ...(n ? { items: n } : {}) })),
      (N = {
        route1: [
          [
            { name: `Ruta 1 · Pokémon salvajes`, team: [M(`pidgey`)] },
            { name: `Ruta 1 · Pokémon salvajes`, team: [M(`rattata`)] },
          ],
          [
            {
              name: `Ruta 1 · Pokémon salvajes`,
              team: [M(`rattata`), M(`pidgey`)],
            },
            {
              name: `Ruta 1 · Pokémon salvajes`,
              team: [M(`pidgey`), M(`caterpie`)],
            },
          ],
        ],
        rocket: [
          {
            name: `Puente Pepita · Team Rocket`,
            trainer: `rocketgrunt`,
            team: [
              M(`zubat`, 2),
              M(`ekans`, 2),
              M(`rattata`, 2),
              M(`rattata`),
              M(`magikarp`),
              M(`caterpie`),
            ],
          },
          {
            name: `Monte Moon · Team Rocket`,
            trainer: `rocketgruntf`,
            team: [
              M(`zubat`, 2),
              M(`sandshrew`, 2),
              M(`rattata`, 2),
              M(`rattata`),
              M(`magikarp`),
              M(`caterpie`),
            ],
          },
        ],
        snorlax: [
          {
            name: `Ruta 12 · Snorlax`,
            team: [
              M(`snorlax`, 2, [`leftovers`]),
              M(`tauros`, 2),
              M(`jigglypuff`),
              M(`rattata`),
            ],
          },
        ],
        legend: {
          articuno: {
            name: `Islas Espuma · Articuno`,
            team: [
              M(`articuno`, 2, [`choice-specs`]),
              M(`seel`, 2),
              M(`shellder`, 2),
              M(`jynx`, 2),
              M(`lapras`, 2),
            ],
          },
          zapdos: {
            name: `Central Energía · Zapdos`,
            team: [
              M(`zapdos`, 2, [`choice-specs`]),
              M(`magnemite`, 2),
              M(`voltorb`, 2),
              M(`electabuzz`, 2),
              M(`jolteon`, 2),
            ],
          },
          moltres: {
            name: `Calle Victoria · Moltres`,
            team: [
              M(`moltres`, 2, [`choice-specs`]),
              M(`growlithe`, 2),
              M(`ponyta`, 2),
              M(`magmar`, 2),
              M(`flareon`, 2),
            ],
          },
        },
      }),
      (P = {
        route1: { n: 1, kind: `part`, extraParts: 0, gold: 0 },
        rocket: {
          n: 3,
          kind: `part`,
          extraParts: 1,
          gold: 3,
          lossParts: 1,
          lossGold: 2,
        },
        snorlax: {
          n: 3,
          kind: `part`,
          extraParts: 1,
          gold: 0,
          magnetAll: 1,
          lossParts: 1,
          lossGold: 2,
        },
        legend: {
          n: 3,
          kind: `full`,
          extraParts: 1,
          gold: 0,
          lossParts: 1,
          lossGold: 2,
        },
      }),
      (Ke = (e, t) => (t ? P[e].gold : (P[e].lossGold ?? 0))),
      (qe = (e) =>
        [`articuno`, `zapdos`, `moltres`][
          Math.floor(w(`${e}|pve|legend`)() * 3)
        ]));
  }))();
}
function Ye(e, t) {
  return null;
}
function Xe(e, t) {
  let n = w(`${e.seed}|carousel|${e.n}`),
    i = te([], r(e, ``)),
    a = F.safari[Math.min(4, Math.max(2, t.stage))],
    o = C(e).length + 1,
    s = [];
  for (let e = 0; e < o; e++) {
    let e = a.costs[Math.floor(n() * a.costs.length)],
      t = ve.filter((t) => t.cost === e && (i[t.id] ?? 0) > 0);
    if (
      (t.length ||
        (t = ve.filter((t) => t.cost <= e && t.cost < 5 && (i[t.id] ?? 0) > 0)),
      !t.length)
    )
      break;
    let r = (e) => (u.includes(e) ? F.safariLineWeight : 1),
      o = n() * t.reduce((e, t) => e + r(t.id), 0),
      c = t[t.length - 1].id;
    for (let e of t)
      if (((o -= r(e.id)), o < 0)) {
        c = e.id;
        break;
      }
    i[c]--;
    let l = a.item === `full` ? Se() : Ee(),
      d = l[Math.floor(n() * l.length)];
    s.push({ line: c, item: d, by: null });
  }
  return s;
}
function Ze(e) {
  let t = p(e.t.n),
    n = null,
    r = {};
  if (t.kind === `safari`) {
    let r = Xe(e.t, t),
      i = null;
    if (t.kind === `safari`) {
      let t = w(`${e.t.seed}|carousel-order|${e.t.n}`);
      i = C(e.t)
        .map((e) => ({ id: e.id, hp: e.s.hp, k: t() }))
        .sort((e, t) => e.hp - t.hp || e.k - t.k)
        .map((e) => e.id);
    }
    n = { n: e.t.n, balls: r, order: i };
  }
  if (t.boon)
    for (let t of C(e.t)) r[t.id] = me(e.t.seed, t.id, e.t.n, t.s.tower.boons);
  let i = F.itemShop;
  if (re.itemShop && t.kind === `pvp` && i.rounds.includes(t.stage * 10 + t.r))
    for (let t of C(e.t)) {
      if (t.s.itemReward) continue;
      let n = v(i.n, w(`${e.t.seed}|item-shop|${e.t.n}|${t.id}`), [], `part`);
      e = I(e, t.id, { ...t.s, itemReward: n, itemPrice: i.price });
    }
  return { ...e, carousel: n, boons: r, gifts: null };
}
function Qe(e, t, n) {
  let r = ae(e, t, n);
  return (
    (r.players = r.players.map((e) => ({
      ...e,
      s: { ...e.s, phase: `event` },
    }))),
    Ze({ t: r, carousel: null, boons: {} })
  );
}
function $e(e) {
  if (p(e.t.n).kind !== `oak` || e.gifts) return e;
  let t = e,
    n = w(`${t.t.seed}|oak-gift|${t.t.n}`),
    i = C(t.t)
      .map((e) => ({ id: e.id, k: n() }))
      .sort((e, t) => e.k - t.k)
      .map((e) => e.id),
    a = {},
    o = new Set();
  for (let e of i) {
    let i = te([], r(t.t, ``)),
      c = ve.filter((e) => e.cost === 1 && (i[e.id] ?? 0) > 0 && !o.has(e.id));
    c.length || (c = ve.filter((e) => e.cost === 1 && (i[e.id] ?? 0) > 0));
    let l = Ee(!0),
      u = l[Math.floor(n() * l.length)],
      d = c.length ? c[Math.floor(n() * c.length)].id : null,
      f = L(t, e).s;
    (d && (o.add(d), (f = s(f, d, 1, E(t.t, e)).s)),
      (f = T(f, u).s),
      (t = I(t, e, f)),
      (a[e] = { line: d ?? ``, item: u }));
  }
  return { ...t, gifts: a };
}
function et(e, t, n) {
  let r = L(e, t);
  if (!r || r.place !== null)
    return { m: e, r: { s: r == null ? void 0 : r.s, ev: [], err: `invalid` } };
  let i = Le(r.s, n, E(e.t, t));
  return { m: i.s === r.s ? e : I(e, t, i.s), r: i };
}
function tt(e, t, n, r) {
  let i = [];
  for (let a = 0; a < e.length; a += n) {
    let o = t + (a / n) * r;
    i.push({ ids: e.slice(a, a + n), from: o, until: o + r });
  }
  return i;
}
function nt(e, t) {
  let n = e.carousel;
  if (
    !n ||
    !L(e, t) ||
    L(e, t).place !== null ||
    n.balls.some((e) => e.by === t)
  )
    return !1;
  if (!n.order) return !0;
  let r = n.order.indexOf(t);
  if (r < 0) return !1;
  let i = Math.max(1, Math.floor(F.safariBatch));
  return n.order
    .slice(0, r - (r % i))
    .every((e) => n.balls.some((t) => t.by === e));
}
function rt(e, t, n) {
  let r = e.carousel;
  if (!r) return { m: e, err: `phase`, ev: [] };
  let i = r.balls[n];
  if (!i || i.by || !nt(e, t)) return { m: e, err: `invalid`, ev: [] };
  let a = L(e, t),
    o = E(e.t, t),
    c = s(a.s, i.line, 1, o),
    l = T(c.s, i.item),
    u = r.balls.map((e, r) => (r === n ? { ...e, by: t } : e));
  return {
    m: { ...I(e, t, l.s), carousel: { ...r, balls: u } },
    ev: [...c.ev, ...l.ev],
  };
}
function it(e, t, n) {
  let r = e.boons[t],
    i = L(e, t);
  if (!r || !i || i.place !== null || !r.ids[n])
    return { m: e, err: `invalid`, ev: [] };
  let a = o(i.s, r, n, E(e.t, t)),
    s = { ...e.boons };
  return (delete s[t], { m: { ...I(e, t, a.s), boons: s }, ev: a.ev });
}
function at(e) {
  let t = new ke(e.home, e.away, e.seed, e.weather);
  if (((t.pvpClock = !0), t.start(), e.flute[0] || e.flute[1]))
    for (let n of t.units)
      e.flute[n.team] &&
        (n.mana = Math.max(n.mana, Math.round(n.maxMana * d.flute)));
  return t;
}
function ot(e, t, n, r, i = [!1, !1]) {
  let a = at({ home: e, away: t, seed: n, weather: r, flute: i });
  for (; !a.over;) a.step();
  return a;
}
function st(e, t = {}) {
  let n = $e(e),
    r = n.t,
    i = p(r.n),
    a = Ye(r.seed, i.stage),
    o = [],
    s = [],
    c = {},
    l = t.home,
    u = (e) => (typeof l == `string` ? l === e : !!(l != null && l.has(e)));
  for (let e of Object.keys(n.boons)) n = it(n, e, 0).m;
  if (n.carousel) {
    let e = w(`${r.seed}|carousel-auto|${r.n}`),
      t = n.carousel.order ?? C(n.t).map((e) => e.id);
    for (let r of t) {
      var d;
      if (
        !n.carousel ||
        n.carousel.balls.some((e) => e.by === r) ||
        ((d = L(n, r)) == null ? void 0 : d.place) !== null
      )
        continue;
      let t = n.carousel.balls.flatMap((e, t) => (e.by ? [] : [t]));
      if (!t.length) break;
      n = rt(n, r, t[Math.floor(e() * t.length)]).m;
    }
  } else {
    for (let e of C(n.t))
      e.s.phase === `planning` && (n = et(n, e.id, { t: `autoPlace` }).m);
    let e = n.t,
      r = (t) => e.players.find((e) => e.id === t).s;
    if (i.kind === `pvp`) {
      let t = _(e),
        n = (t, n, i) => {
          let l = ft(e.secret ?? e.seed, `${e.n}|${t}|${n}`),
            d = w(`${e.seed}|home|${e.n}|${t}`)() < 0.5;
          u(t) && (i || !u(n)) ? (d = !1) : u(n) && !u(t) && !i && (d = !0);
          let f = pe(r(t)),
            p = pe(r(n)),
            m = [dt(r(t)), dt(r(n))],
            h = d
              ? {
                  home: p,
                  away: se(f),
                  seed: l,
                  weather: a,
                  flute: [m[1], m[0]],
                }
              : { home: f, away: se(p), seed: l, weather: a, flute: m },
            g = ot(h.home, h.away, h.seed, h.weather, h.flute),
            _ = +!!d,
            v = +!d,
            b = g.winner,
            x = b === -1 ? 0 : b === _ ? 1 : -1,
            ee = R(g, _),
            S = R(g, v),
            te = {
              a: t,
              b: n,
              ...(i ? { ghost: i } : {}),
              res: x,
              simTime: g.time,
              aLeft: ee,
              bLeft: S,
              dmgA: x === 1 ? 0 : y(e.n, S),
              dmgB: x === -1 ? 0 : y(e.n, ee),
              seed: l,
            };
          (o.push(te),
            s.push({
              id: t,
              opponent: n,
              won: x === 1,
              draw: x === 0,
              survivors: S,
            }),
            (c[t] = {
              setup: h,
              team: _,
              opponent: n,
              ...(i ? { ghost: i } : {}),
            }),
            i ||
              (s.push({
                id: n,
                opponent: t,
                won: x === -1,
                draw: x === 0,
                survivors: ee,
              }),
              (c[n] = { setup: h, team: v, opponent: t })));
        };
      for (let [e, r] of t.pairs) n(e, r, !1);
      t.ghost && n(t.ghost.player, t.ghost.copyOf, !0);
    } else if (i.kind === `pve`) {
      let t = Ge(e.seed, i);
      for (let n of C(e)) {
        let r = ft(e.secret ?? e.seed, `${e.n}|${n.id}|pve`),
          l = {
            home: pe(n.s),
            away: t.specs,
            seed: r,
            weather: a,
            flute: [dt(n.s), !1],
          },
          u = ot(l.home, l.away, l.seed, l.weather, l.flute),
          d = u.winner === 0,
          f = R(u, 1),
          p =
            t.coins > 0 &&
            u.units.some((e) => e.team === 1 && e.shiny && !e.alive);
        (o.push({
          a: n.id,
          b: `pve`,
          pve: !0,
          res: d ? 1 : u.winner === -1 ? 0 : -1,
          simTime: u.time,
          aLeft: R(u, 0),
          bLeft: f,
          dmgA: d ? 0 : y(e.n, f, !0),
          dmgB: 0,
          seed: r,
        }),
          s.push({
            id: n.id,
            opponent: `pve`,
            won: d,
            draw: u.winner === -1,
            survivors: f,
            pve: !0,
            gold: (p ? t.coins : 0) + Ke(i.pve, d),
          }),
          (c[n.id] = { setup: l, team: 0, opponent: `pve`, pve: !0 }));
      }
    }
    if (t.live)
      for (let e of C(n.t))
        e.s.phase === `planning` &&
          (n = I(n, e.id, { ...e.s, phase: `combat` }));
  }
  return {
    m: n,
    st: { n: r.n, R: i, weather: a, fights: o, results: s, byPlayer: c },
  };
}
function ct(e, t) {
  let n = e,
    { R: r } = t;
  for (let e of C(n.t))
    e.s.phase === `combat` && (n = I(n, e.id, { ...e.s, phase: `planning` }));
  for (let e of C(n.t))
    e.s.itemPrice &&
      (n = I(n, e.id, { ...e.s, itemReward: null, itemPrice: null }));
  for (let e of C(n.t)) {
    let t = fe(e.s, E(n.t, e.id), []);
    t !== e.s && (n = I(n, e.id, t));
  }
  if (r.kind === `pve`) {
    let e = n.t,
      i = Ge(e.seed, r),
      a = P[r.pve],
      o = new Set(t.results.filter((e) => e.won).map((e) => e.id));
    if (a.magnetAll)
      for (let t of C(e)) {
        let e = L(n, t.id).s;
        for (let t = 0; t < a.magnetAll; t++) e = T(e, Te).s;
        n = I(n, t.id, e);
      }
    let c = r.pve === `route1`;
    for (let t of C(e)) {
      if (!o.has(t.id)) {
        if (a.lossParts) {
          let r = L(n, t.id).s,
            i = E(n.t, t.id).rng(`pve-loss|${e.n}`),
            o = Ee(c);
          for (let e = 0; e < a.lossParts; e++)
            r = T(r, o[Math.floor(i() * o.length)]).s;
          n = I(n, t.id, r);
        }
        continue;
      }
      let l = L(n, t.id).s,
        u = E(n.t, t.id),
        f = u.rng(`pve-loot|${e.n}`);
      l.itemReward && (l = Le(l, { t: `pickItem`, i: 0 }, u).s);
      let p = v(a.n, f, [], a.kind, c);
      l = a.n > 1 ? { ...l, itemReward: p } : T(l, p[0]).s;
      let m = Ee(c);
      for (let e = 0; e < a.extraParts; e++)
        l = T(l, m[Math.floor(f() * m.length)]).s;
      if (
        l.tower.master &&
        (r.pve === `snorlax` || (r.pve === `legend` && d.masterLegend))
      ) {
        let e = i.specs.reduce((e, t) => {
          var n, r;
          return (((n = D[t.line]) == null ? void 0 : n.cost) ?? 0) >
            (((r = D[e.line]) == null ? void 0 : r.cost) ?? 0)
            ? t
            : e;
        });
        l = s(
          { ...l, tower: { ...l.tower, master: !1 } },
          e.line,
          Math.min(
            e.star,
            r.pve === `legend` ? d.masterStarLegend : d.masterStar,
          ),
          u,
        ).s;
      }
      n = I(n, t.id, l);
    }
  }
  let i = new Set(C(n.t).map((e) => e.id)),
    a = b(n.t, t.results),
    o = a.players
      .filter((e) => i.has(e.id) && e.place !== null)
      .map((e) => [e.id, e.place]),
    c = t.fights.reduce((e, t) => Math.max(e, t.simTime), 0);
  return (
    (n = Ze({ ...n, t: a, carousel: null, boons: {} })),
    {
      m: n,
      log: {
        n: t.n,
        R: r,
        weather: t.weather,
        fights: t.fights,
        simTime: c,
        places: o,
      },
    }
  );
}
var F, lt, I, L, ut, R, dt, ft;
function pt() {
  return (pt = e(() => {
    (we(),
      ge(),
      f(),
      l(),
      ye(),
      He(),
      S(),
      c(),
      Je(),
      h(),
      (F = {
        safari: {
          2: { costs: [2, 3], item: `part` },
          3: { costs: [3, 4], item: `full` },
          4: { costs: [3, 4], item: `full` },
        },
        itemShop: { rounds: [35, 45], n: 2, price: 5 },
        safariLineWeight: 3,
        safariBatch: 2,
      }),
      (lt = (e) => Ye(e.t.seed, p(e.t.n).stage)),
      (I = (e, t, n) => ({
        ...e,
        t: {
          ...e.t,
          players: e.t.players.map((e) => (e.id === t ? { ...e, s: n } : e)),
        },
      })),
      (L = (e, t) => e.t.players.find((e) => e.id === t)),
      (ut = (e) => C(e.t).length <= 1),
      (R = (e, t) =>
        e.units
          .filter((e) => e.alive && e.team === t)
          .map((e) => ({ line: e.line, star: e.star }))),
      (dt = (e) => e.tower.boons.includes(`flute`)),
      (ft = (e, t) => Math.floor(w(`${e}|fight|${t}`)() * 2 ** 31)));
  }))();
}
function mt(e) {
  return Object.entries(gt)
    .filter(([, t]) => {
      var n;
      return (n = ht[t]) == null ? void 0 : n.call(ht, e);
    })
    .map(([e]) => e);
}
var z, B, ht, gt;
function _t() {
  return (_t = e(() => {
    ((z = (e, t) => Math.ceil((t * e) / 100)),
      (B = (e) => Object.values(e.caught).filter(Boolean).length),
      (ht = {
        start: () => !0,
        badge1: (e) => e.badges >= 1,
        badge2: (e) => e.badges >= 2,
        badge3: (e) => e.badges >= 3,
        badge4: (e) => e.badges >= 4,
        badge5: (e) => e.badges >= 5,
        badge6: (e) => e.badges >= 6,
        badge7: (e) => e.badges >= 7,
        badge8: (e) => e.badges >= 8,
        league: (e) => e.league || e.mewtwo,
        mewtwo: (e) => e.mewtwo,
        rematch: (e) => e.trainerWins >= 1,
        rematch3: (e) => e.trainerWins >= 2,
        rematch4: (e) => e.trainerWins >= 3,
        rematch5: (e) => e.trainerWins >= 4,
        tower5: (e) => e.towerCleared >= 5,
        tower10: (e) => e.towerCleared >= 10,
        tower15: (e) => e.towerCleared >= 15,
        tower20: (e) => e.towerCleared >= 20,
        tower25: (e) => e.towerCleared >= 25,
        tower30: (e) => e.towerCleared >= 30,
        tower40: (e) => e.towerCleared >= 40,
        pvpTop4: (e) => e.pvpTop4 > 0 || e.pvpWins > 0,
        pvpWin: (e) => e.pvpWins > 0,
        pvpTop4x5: (e) => e.pvpTop4 >= 5,
        pvpWin3: (e) => e.pvpWins >= 3,
        dex25: (e) => B(e) >= z(25, e.dexTotal),
        dex50: (e) => B(e) >= z(50, e.dexTotal),
        dex75: (e) => B(e) >= z(75, e.dexTotal),
        dex100: (e) => B(e) >= e.dexTotal,
        x: (e) => e.x,
        discord: (e) => e.discord,
      }),
      (gt = {
        "trainer:bugcatcher-gen1": `badge1`,
        "trainer:jrtrainerf-gen1": `badge4`,
        "trainer:acetrainer-gen1": `badge8`,
        "trainer:blue-gen1champion": `league`,
        "trainer:giovanni-gen1rb": `rematch`,
        "trainer:blackbelt-gen1": `tower10`,
        "trainer:scientist-gen1": `tower20`,
        "trainer:tamer-gen1": `pvpTop4`,
        "trainer:blue-gen1": `pvpWin`,
        "trainer:pokemaniac-gen1": `dex25`,
        "trainer:gentleman-gen1": `dex50`,
        "trainer:oak-gen1": `dex75`,
        "frame:badge:1": `badge1`,
        "frame:badge:4": `badge4`,
        "frame:badge:8": `badge8`,
        "frame:crown": `league`,
        "frame:tower:bronze": `tower10`,
        "frame:tower:silver": `tower20`,
        "frame:tower:gold": `tower30`,
        "frame:trophy": `pvpWin`,
        "frame:dex:silver": `dex50`,
        "frame:dex:gold": `dex100`,
        "frame:mono": `x`,
        "title:legend": `mewtwo`,
        "title:towerAce": `tower30`,
        "title:rival": `pvpTop4`,
        "title:collector": `dex25`,
        "title:master": `dex100`,
        "title:club": `discord`,
        "arena:brock": `badge2`,
        "arena:misty": `badge2`,
        "arena:surge": `badge3`,
        "arena:erika": `badge5`,
        "arena:koga": `badge5`,
        "arena:sabrina": `badge6`,
        "arena:blaine": `badge7`,
        "arena:giovanni": `rematch`,
        "arena:plateau": `rematch3`,
        "arena:champion": `rematch3`,
        "arena:lorelei": `rematch4`,
        "arena:bruno": `rematch4`,
        "arena:agatha": `rematch5`,
        "arena:lance": `rematch5`,
        "arena:tower": `tower5`,
        "arena:victory": `tower15`,
        "arena:mewtwo": `tower40`,
        "arena:rocket": `pvpTop4x5`,
        "arena:deepsea": `dex75`,
        "emote:sweat": `badge3`,
        "emote:zzz": `badge6`,
        "emote:anger": `pvpTop4x5`,
        "emote:heart": `x`,
        "emote:happy": `discord`,
        "boom:stars": `pvpWin3`,
        "boom:blast": `tower25`,
        "boom:meteor": `tower40`,
        "partner:150": `mewtwo`,
      }));
  }))();
}
function vt(e, t) {
  let n =
      e.fact === `dexPct`
        ? e.gte >= 100
          ? t.dexTotal
          : Nt(e.gte, t.dexTotal)
        : e.gte,
    r = 0;
  switch (e.fact) {
    case `none`:
      r = 0;
      break;
    case `badges`:
      r = t.badges;
      break;
    case `kanto`:
      r = +!!t.mewtwo;
      break;
    case `kantoT`:
      r = t.trainerWins;
      break;
    case `flawless`:
      r = t.flawless;
      break;
    case `flawlessT`:
      r = t.flawlessT;
      break;
    case `typeT`:
      r = t.typeT[e.key] ?? 0;
      break;
    case `advW`:
      r = W(t, `w`, e.key);
      break;
    case `advT`:
      r = W(t, `wt`, e.key);
      break;
    case `advF`:
      r = W(t, `ft`, e.key);
      break;
    case `advH`:
      r = It(t, e.key);
      break;
    case `towerCleared`:
      r = t.towerCleared;
      break;
    case `dexPct`:
      r = Pt(t);
      break;
    case `pvpTop4`:
      r = Math.max(t.pvpTop4, t.pvpWins);
      break;
    case `pvpWins`:
      r = t.pvpWins;
      break;
    case `pvpLeague`:
      r = t.pvpLeague;
      break;
    case `pvpLadder`:
      r = t.pvpLadder;
      break;
    case `legends`:
      r = t.legends;
      break;
    case `daily`:
      r = t.daily;
      break;
    case `weekTier`:
      r = t.weekTier;
      break;
    case `x`:
      r = +!!t.x;
      break;
    case `discord`:
      r = +!!t.discord;
  }
  return { have: Math.max(0, r), need: n };
}
function yt(e, t) {
  if (e.fact === `none`) return !0;
  let n = vt(e, t);
  return n.have >= n.need;
}
function bt(e) {
  return [
    ...G.filter((t) => t.at === e).map((e) => ({ kind: `trainer`, id: e.id })),
    ...K.filter((t) => t.at === e).map((e) => ({ kind: `frame`, id: e.id })),
    ...q.filter((t) => t.at === e).map((e) => ({ kind: `title`, id: e.id })),
    ...Z.filter((t) => t.at === e).map((e) => ({
      kind: `partner`,
      id: String(e.num),
    })),
    ...J.filter((t) => t.at === e).map((e) => ({ kind: `arena`, id: e.id })),
    ...Y.filter((t) => t.at === e).map((e) => ({ kind: `emote`, id: e.id })),
    ...X.filter((t) => t.at === e).map((e) => ({ kind: `boom`, id: e.id })),
  ];
}
function xt(e) {
  let t = e.indexOf(`:`);
  if (t < 0) return !1;
  let n = e.slice(0, t),
    r = e.slice(t + 1);
  return n === `partner`
    ? Z.some((e) => String(e.num) === r)
    : Yt.some(([e, t]) => e === n && t.some((e) => e.id === r));
}
function St(e, t, n) {
  let r = new Set([...t].filter(xt)),
    i = (t, n) =>
      new Set(
        n.filter((n) => e.has(n.at) || r.has(`${t}:${n.id}`)).map((e) => e.id),
      ),
    a = new Map();
  if (n === `all`) for (let e of Jt) a.set(e, !0);
  else
    for (let [e, t] of Object.entries(n)) {
      let n = Number(e);
      t && Number.isInteger(n) && Jt.includes(n) && a.set(n, !!t.shiny);
    }
  for (let t of Z)
    (e.has(t.at) || r.has(`partner:${t.num}`)) &&
      !a.has(t.num) &&
      a.set(t.num, !1);
  let o = {
    milestones: e,
    trainers: i(`trainer`, G),
    frames: i(`frame`, K),
    titles: i(`title`, q),
    arenas: i(`arena`, J),
    emotes: i(`emote`, Y),
    booms: i(`boom`, X),
    partners: a,
    kept: new Set(),
  };
  for (let t of r) {
    let n = t.indexOf(`:`),
      r = Tt(t.slice(0, n), t.slice(n + 1));
    (!r || !e.has(r)) && o.kept.add(t);
  }
  return o;
}
function Ct(e, t = []) {
  return St(new Set(Lt.filter((t) => t.ok(e)).map((e) => e.id)), t, e.caught);
}
function wt() {
  return St(new Set(Lt.map((e) => e.id)), [], `all`);
}
function Tt(e, t) {
  var n;
  return (
    ((n = (
      e === `trainer`
        ? G
        : e === `frame`
          ? K
          : e === `title`
            ? q
            : e === `arena`
              ? J
              : e === `emote`
                ? Y
                : e === `boom`
                  ? X
                  : Z.map((e) => ({ id: String(e.num), at: e.at }))
    ).find((e) => e.id === t)) == null
      ? void 0
      : n.at) ?? null
  );
}
function Et(e, t) {
  let n = e && typeof e == `object` && !Array.isArray(e) ? e : {},
    r = (e) => (typeof e == `string` && e.length <= 40 ? e : void 0),
    i = r(n.trainer),
    a = r(n.frame),
    o = r(n.title),
    s = {
      trainer: i && t.trainers.has(i) ? i : V,
      frame: a && t.frames.has(a) ? a : Ot,
    };
  o && t.titles.has(o) && (s.title = o);
  let c = r(n.arena);
  if ((c && t.arenas.has(c) && (s.arena = c), Array.isArray(n.emotes))) {
    let e = Wt(t),
      r = [
        ...new Set(n.emotes.filter((t) => typeof t == `string` && e.has(t))),
      ].slice(0, 4);
    r.length && r.join() !== zt.join() && (s.emotes = r);
  }
  let l = r(n.boom);
  l && l !== `type` && Gt(t).has(l) && (s.boom = l);
  let u =
      n.partner && typeof n.partner == `object` && !Array.isArray(n.partner)
        ? n.partner
        : null,
    d = u && typeof u.num == `number` && Number.isInteger(u.num) ? u.num : null;
  return (
    d !== null &&
      t.partners.has(d) &&
      (s.partner =
        u.shiny === !0 && t.partners.get(d)
          ? { num: d, shiny: !0 }
          : { num: d }),
    s
  );
}
function Dt(e, t, n) {
  let r = { trainer: t, frame: n ? `type:${n}` : Ot };
  if (!n) return r;
  let i = en(n);
  if (!i.length) return r;
  let a = w(`${e}|look`);
  return ((r.partner = { num: i[Math.floor(a() * i.length)].stages[0] }), r);
}
var V,
  Ot,
  kt,
  At,
  H,
  U,
  jt,
  Mt,
  Nt,
  Pt,
  W,
  Ft,
  It,
  Lt,
  G,
  K,
  q,
  J,
  Rt,
  Y,
  zt,
  Bt,
  Vt,
  X,
  Ht,
  Ut,
  Wt,
  Gt,
  Z,
  Kt,
  qt,
  Jt,
  Yt,
  Xt,
  Zt,
  Qt,
  $t,
  en;
function tn() {
  return (tn = e(() => {
    (ge(),
      _t(),
      (V = `red-gen1`),
      (Ot = `ball`),
      (kt = () => ({ trainer: V, frame: Ot })),
      (At = (e = qt) => ({
        badges: 0,
        league: !1,
        mewtwo: !1,
        trainerWins: 0,
        towerCleared: 0,
        caught: {},
        dexTotal: e,
        pvpTop4: 0,
        pvpWins: 0,
        x: !1,
        discord: !1,
        flawless: 0,
        flawlessT: 0,
        typeT: {},
        adv: {},
        legends: 0,
        daily: 0,
        weekTier: 0,
        pvpLeague: -1,
        pvpLadder: 0,
      })),
      (H = (e, t, n, r, i = {}) => ({ id: e, tier: t, fact: n, gte: r, ...i })),
      (U = (e) => H(`type${e}`, `prism`, `typeT`, 1, { key: e })),
      (jt = [
        H(`start`, `start`, `none`, 0),
        H(`badge1`, `bronze`, `badges`, 1),
        H(`badge4`, `bronze`, `badges`, 4),
        H(`dex25`, `bronze`, `dexPct`, 25),
        H(`pvpTop4`, `bronze`, `pvpTop4`, 1, { server: !0 }),
        H(`daily1`, `bronze`, `daily`, 1),
        H(`x`, `bronze`, `x`, 1, { social: !0 }),
        H(`discord`, `bronze`, `discord`, 1, { social: !0 }),
        H(`kanto`, `silver`, `kanto`, 1),
        H(`tower20`, `silver`, `towerCleared`, 20),
        H(`dex50`, `silver`, `dexPct`, 50),
        H(`pvpWin`, `silver`, `pvpWins`, 1, { server: !0 }),
        H(`birds3`, `silver`, `legends`, 3),
        H(`adv1`, `silver`, `advW`, 1, { key: `any` }),
        H(`wkBronze`, `silver`, `weekTier`, 1),
        H(`kantoT`, `gold`, `kantoT`, 1),
        H(`flawless`, `gold`, `flawless`, 1),
        H(`tower40`, `gold`, `towerCleared`, 40),
        H(`tower50`, `gold`, `towerCleared`, 50),
        H(`dex75`, `gold`, `dexPct`, 75),
        H(`pvpWin3`, `gold`, `pvpWins`, 3, { server: !0 }),
        H(`pvpTop4x5`, `gold`, `pvpTop4`, 5, { server: !0 }),
        H(`advSafariT`, `gold`, `advW`, 1, { key: `safari` }),
        H(`advLavandaT`, `gold`, `advW`, 1, { key: `lavanda` }),
        H(`advRocketT`, `gold`, `advW`, 1, { key: `rocket` }),
        H(`wkSilver`, `gold`, `weekTier`, 2),
        U(`Rock`),
        U(`Water`),
        U(`Electric`),
        U(`Grass`),
        U(`Poison`),
        U(`Psychic`),
        U(`Fire`),
        U(`Ground`),
        U(`Ice`),
        U(`Fighting`),
        H(`advLavandaF`, `prism`, `advF`, 1, { key: `lavanda` }),
        H(`advRocketF`, `prism`, `advF`, 1, { key: `rocket` }),
        H(`pvpLance`, `prism`, `pvpLeague`, 11, { server: !0 }),
        H(`pvpLadder1500`, `prism`, `pvpLadder`, 1500, { server: !0 }),
        H(`flawlessT`, `prism`, `flawlessT`, 1),
        H(`tower60`, `prism`, `towerCleared`, 60),
        H(`tower80`, `prism`, `towerCleared`, 80),
        H(`tower100`, `prism`, `towerCleared`, 100),
        H(`wkGold`, `prism`, `weekTier`, 3),
        H(`wkPrism`, `prism`, `weekTier`, 4),
        H(`dex100`, `prism`, `dexPct`, 100),
      ]),
      (Mt = Object.fromEntries(jt.map((e) => [e.id, e]))),
      (Nt = (e, t) => Math.ceil((t * e) / 100)),
      (Pt = (e) => Object.values(e.caught).filter(Boolean).length),
      (W = (e, t, n) => {
        var r;
        return n && n !== `any`
          ? (((r = e.adv[n]) == null ? void 0 : r[t]) ?? 0)
          : Object.values(e.adv).reduce(
              (e, n) => e + ((n == null ? void 0 : n[t]) ?? 0),
              0,
            );
      }),
      (Ft = (e) => {
        let t = 0;
        for (let n = (e ?? 0) & 255; n; n &= n - 1) t++;
        return t;
      }),
      (It = (e, t) => {
        var n;
        return t && t !== `any`
          ? Ft((n = e.adv[t]) == null ? void 0 : n.h)
          : Math.max(
              0,
              ...Object.values(e.adv).map((e) => Ft(e == null ? void 0 : e.h)),
            );
      }),
      (Lt = jt.map((e) => ({ ...e, ok: (t) => yt(e, t) }))),
      (G = [
        { id: `red-gen1`, at: `start` },
        { id: `leaf-gen3`, at: `start` },
        { id: `bugcatcher-gen1`, at: `badge1` },
        { id: `jrtrainerf-gen1`, at: `badge4` },
        { id: `pokemaniac-gen1`, at: `dex25` },
        { id: `tamer-gen1`, at: `pvpTop4` },
        { id: `lass-gen1`, at: `daily1` },
        { id: `acetrainer-gen1`, at: `kanto` },
        { id: `blackbelt-gen1`, at: `tower20` },
        { id: `gentleman-gen1`, at: `dex50` },
        { id: `blue-gen1`, at: `pvpWin` },
        { id: `birdkeeper-gen1`, at: `birds3` },
        { id: `hiker-gen1`, at: `adv1` },
        { id: `sailor-gen1`, at: `wkBronze` },
        { id: `blue-gen1champion`, at: `kantoT` },
        { id: `scientist-gen1`, at: `tower40` },
        { id: `oak-gen1`, at: `dex75` },
        { id: `fisherman-gen1`, at: `advSafariT` },
        { id: `channeler-gen1`, at: `advLavandaT` },
        { id: `giovanni-gen1rb`, at: `advRocketT` },
        { id: `juggler-gen1`, at: `wkSilver` },
        { id: `brock-gen1`, at: `typeRock` },
        { id: `misty-gen1`, at: `typeWater` },
        { id: `ltsurge-gen1`, at: `typeElectric` },
        { id: `erika-gen1`, at: `typeGrass` },
        { id: `koga-gen1`, at: `typePoison` },
        { id: `sabrina-gen1`, at: `typePsychic` },
        { id: `blaine-gen1`, at: `typeFire` },
        { id: `giovanni-gen1`, at: `typeGround` },
        { id: `lorelei-gen1`, at: `typeIce` },
        { id: `bruno-gen1`, at: `typeFighting` },
        { id: `agatha-gen1`, at: `advLavandaF` },
        { id: `lance-gen1`, at: `pvpLance` },
        { id: `rocketgrunt`, at: `advRocketF` },
      ]),
      (K = [
        { id: `ball`, at: `start` },
        { id: `badge:1`, at: `badge1` },
        { id: `badge:4`, at: `daily1` },
        { id: `mono`, at: `x` },
        { id: `badge:8`, at: `kanto` },
        { id: `tower:bronze`, at: `tower20` },
        { id: `dex:silver`, at: `dex50` },
        { id: `trophy`, at: `pvpWin` },
        { id: `crown`, at: `kantoT` },
        { id: `tower:silver`, at: `tower40` },
        { id: `tower:gold`, at: `wkGold` },
        { id: `dex:gold`, at: `dex100` },
      ]),
      (q = [
        { id: `novice`, at: `start` },
        { id: `collector`, at: `dex25` },
        { id: `rival`, at: `pvpTop4` },
        { id: `club`, at: `discord` },
        { id: `flawless`, at: `flawless` },
        { id: `towerAce`, at: `tower50` },
        { id: `legend`, at: `pvpLadder1500` },
        { id: `towerLegend`, at: `wkPrism` },
        { id: `master`, at: `dex100` },
      ]),
      (J = [
        { id: `meadow`, at: `start` },
        { id: `forest`, at: `start` },
        { id: `brock`, at: `typeRock` },
        { id: `misty`, at: `typeWater` },
        { id: `surge`, at: `typeElectric` },
        { id: `erika`, at: `typeGrass` },
        { id: `koga`, at: `typePoison` },
        { id: `sabrina`, at: `typePsychic` },
        { id: `blaine`, at: `typeFire` },
        { id: `giovanni`, at: `typeGround` },
        { id: `lorelei`, at: `typeIce` },
        { id: `bruno`, at: `typeFighting` },
        { id: `agatha`, at: `advLavandaF` },
        { id: `lance`, at: `pvpLance` },
        { id: `champion`, at: `pvpLadder1500` },
        { id: `plateau`, at: `flawlessT` },
        { id: `tower`, at: `tower60` },
        { id: `victory`, at: `tower80` },
        { id: `mewtwo`, at: `tower100` },
        { id: `rocket`, at: `advRocketF` },
        { id: `deepsea`, at: `dex100` },
      ]),
      (Rt = (e) =>
        e && typeof e.arena == `string` && J.some((t) => t.id === e.arena)
          ? e.arena
          : null),
      (Y = [
        { id: `exclaim`, at: `start` },
        { id: `question`, at: `start` },
        { id: `note`, at: `start` },
        { id: `dots`, at: `start` },
        { id: `sweat`, at: `badge4` },
        { id: `zzz`, at: `birds3` },
        { id: `anger`, at: `pvpTop4x5` },
        { id: `heart`, at: `x` },
        { id: `happy`, at: `discord` },
      ]),
      (zt = Y.filter((e) => e.at === `start`).map((e) => e.id)),
      (Bt = (e) => typeof e == `string` && Y.some((t) => t.id === e)),
      (Vt = (e) => {
        var t;
        return e != null && (t = e.emotes) != null && t.length ? e.emotes : zt;
      }),
      (X = [
        { id: `type`, at: `start` },
        { id: `stars`, at: `pvpWin3` },
        { id: `blast`, at: `tower50` },
        { id: `meteor`, at: `tower100` },
      ]),
      (Ht = `type`),
      (Ut = (e) =>
        e && typeof e.boom == `string` && X.some((t) => t.id === e.boom)
          ? e.boom
          : Ht),
      (Wt = (e) => e.emotes),
      (Gt = (e) => e.booms),
      (Z = [{ num: 150, at: `flawlessT` }]),
      (Kt = [...new Set(_e.flatMap((e) => e.stages))].sort((e, t) => e - t)),
      (qt = Kt.length),
      (Jt = [...new Set([...Kt, ...Z.map((e) => e.num)])]),
      (Yt = [
        [`trainer`, G],
        [`frame`, K],
        [`title`, q],
        [`arena`, J],
        [`emote`, Y],
        [`boom`, X],
      ]),
      (Xt = (e, t) => {
        var n;
        return (
          ((n = Mt[Tt(e, t) ?? `start`]) == null ? void 0 : n.tier) ?? `start`
        );
      }),
      (Zt = jt.filter((e) => e.server).map((e) => e.id)),
      new Set(Object.values(gt).concat(`start`)),
      (Qt = (e) => [
        ...[...e.milestones].filter((e) => !Zt.includes(e)),
        ...[...e.kept].map((e) => `k:` + e),
      ]),
      ($t = (e) => [
        ...[...e.trainers].map((e) => `trainer:${e}`),
        ...[...e.frames].map((e) => `frame:${e}`),
        ...[...e.titles].map((e) => `title:${e}`),
        ...[...e.arenas].map((e) => `arena:${e}`),
        ...[...e.emotes].map((e) => `emote:${e}`),
        ...[...e.booms].map((e) => `boom:${e}`),
      ]),
      (en = (e) =>
        _e.filter((t) => !t.branchOf && t.traits[0] === e && t.cost <= 3)));
  }))();
}
function nn(e) {
  if (!e || typeof e != `object`) return null;
  let t = e;
  switch (t.t) {
    case `buy`:
      return Q(t.slot, 0, 20) &&
        (t.cell === void 0 || Q(t.cell, 0, 200)) &&
        (t.line === void 0 || $(t.line))
        ? {
            t: `buy`,
            slot: t.slot,
            ...(t.cell === void 0 ? {} : { cell: t.cell }),
            ...(t.line === void 0 ? {} : { line: t.line }),
          }
        : null;
    case `sell`:
      return $(t.id) ? { t: `sell`, id: t.id } : null;
    case `reroll`:
      return t.free ? null : { t: `reroll` };
    case `buyXp`:
      return { t: `buyXp` };
    case `lock`:
      return t.on === void 0
        ? { t: `lock` }
        : typeof t.on == `boolean`
          ? { t: `lock`, on: t.on }
          : null;
    case `toBench`:
      return $(t.id) && Q(t.slot, 0, 20)
        ? { t: `toBench`, id: t.id, slot: t.slot }
        : null;
    case `toBoard`:
      return $(t.id) && Q(t.cell, 0, 200)
        ? { t: `toBoard`, id: t.id, cell: t.cell }
        : null;
    case `releaseFloor`:
      return $(t.id) ? { t: `releaseFloor`, id: t.id } : null;
    case `autoPlace`:
      return { t: `autoPlace` };
    case `equip`:
      return Q(t.inv, 0, 50) && $(t.id) && (t.item === void 0 || $(t.item))
        ? {
            t: `equip`,
            inv: t.inv,
            id: t.id,
            ...(t.item === void 0 ? {} : { item: t.item }),
          }
        : null;
    case `combineItems`:
      return Q(t.from, 0, 50) &&
        Q(t.to, 0, 50) &&
        (t.items === void 0 || vn(t.items))
        ? {
            t: `combineItems`,
            from: t.from,
            to: t.to,
            ...(t.items === void 0 ? {} : { items: [...t.items] }),
          }
        : null;
    case `sellQueued`:
      return Q(t.k, 0, 50) ? { t: `sellQueued`, k: t.k } : null;
    case `pickItem`:
      return Q(t.i, -1, 10) ? { t: `pickItem`, i: t.i } : null;
    case `collectCoins`:
      return t.k === void 0 || Q(t.k, 0, 50)
        ? { t: `collectCoins`, ...(t.k === void 0 ? {} : { k: t.k }) }
        : null;
    case `magnet`:
      return Q(t.inv, 0, 50) && $(t.id) && (t.item === void 0 || $(t.item))
        ? {
            t: `magnet`,
            inv: t.inv,
            id: t.id,
            ...(t.item === void 0 ? {} : { item: t.item }),
          }
        : null;
    case `eeveeKeep`:
      return typeof t.on == `boolean` ? { t: `eeveeKeep`, on: t.on } : null;
    default:
      return null;
  }
}
function rn(e, t) {
  let n = { ...e, ...(t.v ?? {}) };
  if (t.p) {
    let r = { ...e.players };
    for (let [e, n] of Object.entries(t.p)) {
      let t = r[e],
        { s: i, ...a } = n;
      r[e] = t
        ? { ...t, ...a, ...(i ? { s: { ...t.s, ...i } } : {}) }
        : { ...a, s: i };
    }
    n.players = r;
  }
  return n;
}
function an(e) {
  let t = new Sn();
  (t.num(e.winner ?? -1), t.num(e.time), t.num(e.events.length));
  for (let n of e.units)
    (t.num(n.uid),
      t.num(n.team),
      t.num(+!!n.alive),
      t.num(n.cell),
      t.num(n.hp),
      t.num(n.mana),
      t.num(n.shield));
  return t.hex();
}
function on(e) {
  let t = at(e),
    n = 0;
  for (; !t.over && n++ < 4e5;) t.step();
  return { fp: an(t), sim: t };
}
function sn(e, t) {
  return e.stage !== `carousel` || !e.carousel || t < e.startsAt
    ? !1
    : nt(
        {
          t: {
            seed: e.seed,
            n: e.n,
            players: e.order.map((t) => {
              var n, r;
              return {
                id: t,
                place: ((n = e.players[t]) == null ? void 0 : n.place) ?? null,
                s: (r = e.players[t]) == null ? void 0 : r.s,
                recent: [],
              };
            }),
          },
          carousel: e.carousel,
          boons: {},
        },
        e.me,
      );
}
var cn, ln, un, dn, fn, pn, mn, hn, gn, _n, Q, $, vn, yn, bn, xn, Sn;
function Cn() {
  return (Cn = e(() => {
    (pt(),
      tn(),
      Ie(),
      je(),
      l(),
      (cn = { lobby: `kt_lobby`, table: `kt_table` }),
      (ln = 4307),
      (un = {
        reload: 4426,
        auth: 4401,
        seat: 4403,
        code: 4404,
        full: 4409,
        quit: 4410,
        nick: 4422,
        gone: 4412,
      }),
      (dn = (e) => Object.keys(un).find((t) => un[t] === e) ?? null),
      (fn = {
        vsMs: 1700,
        holdMs: 300,
        playRate: 0.87,
        playMargin: 0.06,
        slowK: 1.75,
        postMs: 3500,
        slackMs: 2500,
        abandonMs: 18e4,
        warnLeftMs: [6e4, 3e4],
        returnMs: 3e5,
        beatMs: 5e3,
        beatStaleMs: 15e3,
        idlePlans: 2,
        flushMs: 100,
        oakMaxMs: 12e3,
        oakShowMs: 4e3,
      }),
      (pn = { windowMs: 864e5, banMin: [5, 15, 60] }),
      (mn = (e) =>
        e <= 0 ? 0 : pn.banMin[Math.min(e, pn.banMin.length) - 1] * 6e4),
      (hn = /^[A-Za-z0-9_]{3,16}$/),
      (gn = { local: `/pvp/local`, status: `/pvp/status` }),
      (_n = new Set([
        `bad`,
        `auth`,
        `nick`,
        `live`,
        `season`,
        `time`,
        `gap`,
        `rate`,
      ])),
      (Q = (e, t = -1e9, n = 1e9) =>
        typeof e == `number` && Number.isInteger(e) && e >= t && e <= n),
      ($ = (e) =>
        typeof e == `string` &&
        e.length > 0 &&
        e.length <= 16 &&
        /^[A-Za-z0-9_-]+$/.test(e)),
      (vn = (e) => Array.isArray(e) && e.length === 2 && $(e[0]) && $(e[1])),
      (yn = (e, t) => e !== null && e !== t),
      (bn = new Float64Array(1)),
      (xn = new Uint32Array(bn.buffer)),
      (Sn = class {
        constructor() {
          (Me(this, `a`, 2166136261), Me(this, `b`, -1623754710));
        }
        word(e) {
          for (let t = 0; t < 4; t++) {
            let n = (e >>> (t * 8)) & 255;
            ((this.a = Math.imul(this.a ^ n, 16777619)),
              (this.b = Math.imul(this.b ^ n, 16777619) ^ (this.b >>> 13)));
          }
        }
        num(e) {
          ((bn[0] = e), this.word(xn[0]), this.word(xn[1]));
        }
        hex() {
          return (
            (this.a >>> 0).toString(16).padStart(8, `0`) +
            (this.b >>> 0).toString(16).padStart(8, `0`)
          );
        }
      }));
  }))();
}
export {
  $e as $,
  Dt as A,
  Xt as B,
  Jt as C,
  wt as D,
  G as E,
  Bt as F,
  Et as G,
  Gt as H,
  Tt as I,
  F as J,
  _t as K,
  At as L,
  kt as M,
  Vt as N,
  Rt as O,
  tn as P,
  ct as Q,
  vt as R,
  K as S,
  q as T,
  Wt as U,
  $t as V,
  Ct as W,
  nt as X,
  et as Y,
  at as Z,
  X as _,
  He as _t,
  fn as a,
  lt as at,
  qt as b,
  Pe as bt,
  rn as c,
  st as ct,
  sn as d,
  qe as dt,
  pt as et,
  mn as f,
  Ue as ft,
  J as g,
  j as gt,
  yn as h,
  Le as ht,
  cn as i,
  rt as it,
  Qt as j,
  Ut as k,
  on as l,
  P as lt,
  nn as m,
  Ge as mt,
  gn as n,
  Qe as nt,
  hn as o,
  tt as ot,
  dn as p,
  Ke as pt,
  mt as q,
  ln as r,
  it as rt,
  pn as s,
  Ye as st,
  _n as t,
  ut as tt,
  Cn as u,
  Je as ut,
  V as v,
  Ie as vt,
  Mt as w,
  Y as x,
  Fe as xt,
  Kt as y,
  Ne as yt,
  bt as z,
};
