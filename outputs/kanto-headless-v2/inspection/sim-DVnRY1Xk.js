import { n as e } from "./rolldown-runtime-8BhlS34s.js";
import { C as t, S as n, i as r, n as i, r as a } from "./i18n-CDsr9I4f.js";
import { r as o, t as s } from "./reach-DxJaD9s1.js";
import {
  D as c,
  E as l,
  O as u,
  S as d,
  a as f,
  c as p,
  d as m,
  g as h,
  i as g,
  p as _,
  r as v,
  t as y,
  u as ee,
  v as te,
  x as ne,
} from "./roster-CpnLcVHu.js";
import { n as re, t as b } from "./defineProperty-CWxpEQeK.js";
function ie(e, [t, n, r]) {
  return Array.from({ length: t }, (t, i) => ({
    line: e[i % e.length],
    star: i < r ? 3 : i < r + n ? 2 : 1,
  }));
}
function x(e) {
  let t = ae[e],
    [n, ...r] = t.flavors,
    i = {
      id: e,
      route: t.kind,
      ...(t.quick ? { quick: !0 } : {}),
      tier: t.tier,
      name: n.name,
      trainer: n.trainer,
      intro: n.intro,
      bg: n.bg,
      music: n.music,
      team: t.rival
        ? ie(t.rival(`squirtle`), t.tier)
        : ie(n.lines, n.tier ?? t.tier),
      vid: `a`,
    };
  if (t.rival) {
    let e = t.rival;
    i.rivalTeam = (n) => ie(e(n), t.tier);
  }
  return (
    r.length &&
      (i.variants = r.map((e, n) => ({
        vid: String.fromCharCode(98 + n),
        name: e.name,
        trainer: e.trainer,
        intro: e.intro,
        bg: e.bg,
        music: e.music,
        team: ie(e.lines, e.tier ?? t.tier),
      }))),
    i
  );
}
var ae;
function oe() {
  return (oe = e(() => {
    ae = {
      ruta6: {
        kind: `wild`,
        tier: [6, 5, 0],
        flavors: [
          {
            name: `Ruta 6 · Pokémon salvajes`,
            intro: `¡Pokémon salvajes!`,
            lines: [`oddish`, `pidgey`, `psyduck`],
            bg: `bg-meadow`,
            music: `mus_rg_route24`,
            tier: [6, 2, 0],
          },
          {
            name: `Ruta 5 · Pokémon salvajes`,
            intro: `¡Pokémon salvajes!`,
            lines: [`pidgey`, `oddish`, `jigglypuff`],
            bg: `bg-route`,
            music: `mus_rg_route24`,
            tier: [6, 1, 0],
          },
        ],
      },
      ssanne: {
        kind: `trainer`,
        tier: [6, 1, 0],
        flavors: [
          {
            name: `S.S. Anne · Marinero`,
            trainer: `sailor-gen1`,
            intro: `¡Un Marinero quiere luchar!`,
            lines: [`machop`, `shellder`, `poliwag`, `machop`, `magikarp`],
            bg: `bg-deepsea`,
            music: `mus_rg_route24`,
          },
          {
            name: `S.S. Anne · Marinero`,
            trainer: `sailor-gen1`,
            intro: `¡Un Marinero quiere luchar!`,
            lines: [
              `staryu`,
              `poliwag`,
              `shellder`,
              `machop`,
              `poliwag`,
              `magikarp`,
            ],
            bg: `bg-deepsea`,
            music: `mus_rg_route24`,
            tier: [6, 0, 0],
          },
          {
            name: `S.S. Anne · Caballero`,
            trainer: `gentleman-gen1`,
            intro: `¡Un Caballero quiere luchar!`,
            lines: [`growlithe`, `pikachu`, `nidoran`, `growlithe`, `rattata`],
            bg: `bg-city`,
            music: `mus_rg_route24`,
            tier: [6, 1, 0],
          },
          {
            name: `S.S. Anne · Pescador`,
            trainer: `fisherman-gen1`,
            intro: `¡Un Pescador quiere luchar!`,
            lines: [
              `staryu`,
              `psyduck`,
              `shellder`,
              `magikarp`,
              `psyduck`,
              `magikarp`,
            ],
            bg: `bg-deepsea`,
            music: `mus_rg_route24`,
            tier: [6, 0, 0],
          },
        ],
      },
      tunel: {
        kind: `trainer`,
        tier: [6, 2, 0],
        flavors: [
          {
            name: `Túnel Roca · Montañero`,
            trainer: `hiker-gen1`,
            intro: `¡Un Montañero quiere luchar!`,
            lines: [`onix`, `geodude`, `machop`, `geodude`, `onix`],
            bg: `bg-earthycave`,
            music: `mus_rg_mt_moon`,
            tier: [7, 3, 0],
          },
          {
            name: `Túnel Roca · Pokémaníaco`,
            trainer: `pokemaniac-gen1`,
            intro: `¡Un Pokémaníaco quiere luchar!`,
            lines: [`cubone`, `slowpoke`, `slowpoke`, `cubone`, `slowpoke`],
            bg: `bg-earthycave`,
            music: `mus_rg_mt_moon`,
          },
          {
            name: `Ruta 9 · Entrenadora`,
            trainer: `jrtrainerf-gen1`,
            intro: `¡Una Entrenadora quiere luchar!`,
            lines: [`oddish`, `jigglypuff`, `pidgey`, `bulbasaur`, `oddish`],
            bg: `bg-route`,
            music: `mus_rg_route24`,
            tier: [7, 3, 0],
          },
        ],
      },
      escondite: {
        kind: `trainer`,
        tier: [7, 3, 0],
        flavors: [
          {
            name: `Escondite Rocket · Recluta`,
            trainer: `rocketgrunt`,
            intro: `¡Un recluta del Team Rocket quiere luchar!`,
            lines: [`ekans`, `sandshrew`, `zubat`, `rattata`, `ekans`],
            bg: `bg-dampcave`,
            music: `mus_rg_game_corner`,
            tier: [7, 4, 0],
          },
          {
            name: `Escondite Rocket · Recluta`,
            trainer: `rocketgruntf`,
            intro: `¡Una recluta del Team Rocket quiere luchar!`,
            lines: [`rattata`, `zubat`, `machop`, `rattata`, `zubat`],
            bg: `bg-dampcave`,
            music: `mus_rg_game_corner`,
            tier: [8, 7, 0],
          },
          {
            name: `Escondite Rocket · Recluta`,
            trainer: `rocketgrunt`,
            intro: `¡Un recluta del Team Rocket quiere luchar!`,
            lines: [`machop`, `abra`, `ekans`, `sandshrew`, `zubat`],
            bg: `bg-dampcave`,
            music: `mus_rg_game_corner`,
          },
        ],
      },
      ruta12: {
        kind: `trainer`,
        tier: [7, 4, 1],
        flavors: [
          {
            name: `Ruta 12 · Pescador`,
            trainer: `fisherman-gen1`,
            intro: `¡Un Pescador quiere luchar!`,
            lines: [
              `poliwag`,
              `shellder`,
              `psyduck`,
              `magikarp`,
              `poliwag`,
              `magikarp`,
            ],
            bg: `bg-river`,
            music: `mus_rg_fuchsia`,
            tier: [8, 1, 0],
          },
          {
            name: `Ruta 14 · Ornitólogo`,
            trainer: `birdkeeper-gen1`,
            intro: `¡Un Ornitólogo quiere luchar!`,
            lines: [`pidgey`, `pidgey`, `pidgey`, `tauros`, `pidgey`, `pidgey`],
            bg: `bg-route`,
            music: `mus_rg_fuchsia`,
            tier: [8, 3, 1],
          },
          {
            name: `Calle Bici · Calvo`,
            trainer: `cueball-gen1`,
            intro: `¡Un Calvo quiere luchar!`,
            lines: [
              `machop`,
              `machop`,
              `hitmonlee`,
              `machop`,
              `machop`,
              `hitmonchan`,
            ],
            bg: `bg-city`,
            music: `mus_rg_fuchsia`,
            tier: [7, 4, 0],
          },
          {
            name: `Ruta 15 · Entrenadora`,
            trainer: `jrtrainerf-gen1`,
            intro: `¡Una Entrenadora quiere luchar!`,
            lines: [
              `oddish`,
              `pikachu`,
              `oddish`,
              `jigglypuff`,
              `oddish`,
              `pikachu`,
            ],
            bg: `bg-meadow`,
            music: `mus_rg_fuchsia`,
            tier: [8, 6, 1],
          },
        ],
      },
      silph: {
        kind: `trainer`,
        tier: [8, 5, 1],
        flavors: [
          {
            name: `Silph S.A. · Recluta`,
            trainer: `rocketgrunt`,
            intro: `¡Un recluta del Team Rocket quiere luchar!`,
            lines: [`cubone`, `zubat`, `ekans`, `machop`, `rattata`, `zubat`],
            bg: `bg-city`,
            music: `mus_rg_game_corner`,
            tier: [9, 5, 1],
          },
          {
            name: `Silph S.A. · Científico`,
            trainer: `scientist-gen1`,
            intro: `¡Un Científico quiere luchar!`,
            lines: [
              `magnemite`,
              `voltorb`,
              `magnemite`,
              `voltorb`,
              `magnemite`,
              `voltorb`,
            ],
            bg: `bg-city`,
            music: `mus_rg_game_corner`,
            tier: [8, 3, 1],
          },
          {
            name: `Silph S.A. · Malabarista`,
            trainer: `juggler-gen1`,
            intro: `¡Un Malabarista quiere luchar!`,
            lines: [`abra`, `jynx`, `abra`, `slowpoke`, `abra`, `jynx`],
            bg: `bg-space`,
            music: `mus_rg_game_corner`,
            tier: [8, 6, 1],
          },
        ],
      },
      mansion: {
        kind: `trainer`,
        tier: [8, 6, 1],
        flavors: [
          {
            name: `Mansión Pokémon · Ladrón`,
            trainer: `burglar-gen1`,
            intro: `¡Un Ladrón quiere luchar!`,
            lines: [
              `vulpix`,
              `growlithe`,
              `ponyta`,
              `charmander`,
              `vulpix`,
              `growlithe`,
            ],
            bg: `bg-volcanocave`,
            music: `mus_rg_mt_moon`,
          },
          {
            name: `Mansión Pokémon · Científico`,
            trainer: `scientist-gen1`,
            intro: `¡Un Científico quiere luchar!`,
            lines: [
              `voltorb`,
              `magnemite`,
              `magnemite`,
              `voltorb`,
              `ditto`,
              `magnemite`,
            ],
            bg: `bg-volcanocave`,
            music: `mus_rg_mt_moon`,
            tier: [8, 3, 1],
          },
        ],
      },
      ruta21: {
        kind: `trainer`,
        tier: [8, 6, 1],
        flavors: [
          {
            name: `Ruta 21 · Pescador`,
            trainer: `fisherman-gen1`,
            intro: `¡Un Pescador quiere luchar!`,
            lines: [
              `shellder`,
              `magikarp`,
              `magikarp`,
              `seel`,
              `magikarp`,
              `magikarp`,
              `magikarp`,
            ],
            bg: `bg-deepsea`,
            music: `mus_rg_route1`,
          },
          {
            name: `Ruta 21 · Nadador`,
            trainer: `swimmer-gen1`,
            intro: `¡Un Nadador quiere luchar!`,
            lines: [
              `shellder`,
              `staryu`,
              `poliwag`,
              `poliwag`,
              `psyduck`,
              `shellder`,
              `poliwag`,
            ],
            bg: `bg-deepsea`,
            music: `mus_rg_route1`,
            tier: [8, 7, 0],
          },
          {
            name: `Ruta 21 · Calvo`,
            trainer: `cueball-gen1`,
            intro: `¡Un Calvo quiere luchar!`,
            lines: [
              `machop`,
              `shellder`,
              `machop`,
              `psyduck`,
              `machop`,
              `poliwag`,
              `machop`,
            ],
            bg: `bg-river`,
            music: `mus_rg_route1`,
            tier: [8, 5, 1],
          },
        ],
      },
      ruta22: {
        kind: `rival`,
        tier: [9, 8, 1],
        flavors: [
          {
            name: `Ruta 22 · Rival Azul`,
            trainer: `blue-gen1`,
            intro: `¡Tu rival Azul quiere luchar!`,
            lines: [],
            bg: `bg-route`,
            music: `mus_rg_encounter_rival`,
          },
        ],
        rival: (e) => [
          e,
          `pidgey`,
          `abra`,
          `rhyhorn`,
          e === `charmander` ? `magikarp` : `growlithe`,
          `exeggcute`,
          `abra`,
        ],
      },
      victoria: {
        kind: `trainer`,
        tier: [9, 5, 1],
        flavors: [
          {
            name: `Calle Victoria · Karateka`,
            trainer: `blackbelt-gen1`,
            intro: `¡Un Karateka quiere luchar!`,
            lines: [
              `machop`,
              `hitmonlee`,
              `machop`,
              `hitmonchan`,
              `machop`,
              `onix`,
              `machop`,
              `hitmonlee`,
            ],
            bg: `bg-mountain`,
            music: `mus_rg_victory_road`,
          },
          {
            name: `Calle Victoria · Domador`,
            trainer: `tamer-gen1`,
            intro: `¡Un Domador quiere luchar!`,
            lines: [
              `tauros`,
              `ekans`,
              `sandshrew`,
              `rhyhorn`,
              `ekans`,
              `tauros`,
              `sandshrew`,
              `psyduck`,
            ],
            bg: `bg-mountain`,
            music: `mus_rg_victory_road`,
          },
          {
            name: `Calle Victoria · Malabarista`,
            trainer: `juggler-gen1`,
            intro: `¡Un Malabarista quiere luchar!`,
            lines: [
              `abra`,
              `abra`,
              `jynx`,
              `abra`,
              `slowpoke`,
              `jynx`,
              `abra`,
              `slowpoke`,
            ],
            bg: `bg-mountain`,
            music: `mus_rg_victory_road`,
            tier: [9, 5, 2],
          },
          {
            name: `Calle Victoria · Entrenador Guay`,
            trainer: `acetrainer-gen1`,
            intro: `¡Un Entrenador Guay quiere luchar!`,
            lines: [
              `lapras`,
              `charmander`,
              `growlithe`,
              `exeggcute`,
              `pikachu`,
              `growlithe`,
              `lapras`,
              `staryu`,
            ],
            bg: `bg-mountain`,
            music: `mus_rg_victory_road`,
          },
        ],
      },
      monteMoon: {
        kind: `wild`,
        tier: [4, 1, 0],
        flavors: [
          {
            name: `Monte Moon · Pokémon salvajes`,
            intro: `¡Pokémon salvajes!`,
            lines: [`zubat`, `geodude`, `paras`, `zubat`, `jigglypuff`],
            bg: `bg-earthycave`,
            music: `mus_rg_mt_moon`,
          },
          {
            name: `Monte Moon · Pokémon salvajes`,
            intro: `¡Pokémon salvajes!`,
            lines: [`geodude`, `zubat`, `jigglypuff`, `paras`, `geodude`],
            bg: `bg-earthycave`,
            music: `mus_rg_mt_moon`,
          },
        ],
      },
      torre: {
        kind: `trainer`,
        tier: [8, 6, 0],
        flavors: [
          {
            name: `Torre Pokémon · Médium`,
            trainer: `channeler-gen1`,
            intro: `¡Una Médium quiere luchar!`,
            lines: [`gastly`, `gastly`, `cubone`, `gastly`, `zubat`],
            bg: `bg-gen4-cave`,
            music: `mus_rg_mt_moon`,
          },
          {
            name: `Torre Pokémon · Recluta`,
            trainer: `rocketgrunt`,
            intro: `¡Un recluta del Team Rocket quiere luchar!`,
            lines: [`zubat`, `ekans`, `rattata`, `machop`, `zubat`],
            bg: `bg-gen4-cave`,
            music: `mus_rg_game_corner`,
          },
        ],
      },
      ruta19: {
        kind: `trainer`,
        tier: [8, 3, 1],
        flavors: [
          {
            name: `Ruta 19 · Nadador`,
            trainer: `swimmer-gen1`,
            intro: `¡Un Nadador quiere luchar!`,
            lines: [
              `staryu`,
              `poliwag`,
              `shellder`,
              `psyduck`,
              `poliwag`,
              `magikarp`,
              `magikarp`,
              `poliwag`,
            ],
            bg: `bg-deepsea`,
            music: `mus_rg_fuchsia`,
            tier: [8, 4, 0],
          },
          {
            name: `Ruta 20 · Ornitólogo`,
            trainer: `birdkeeper-gen1`,
            intro: `¡Un Ornitólogo quiere luchar!`,
            lines: [`pidgey`, `zubat`, `pidgey`, `tauros`, `pidgey`, `zubat`],
            bg: `bg-route`,
            music: `mus_rg_fuchsia`,
          },
        ],
      },
      ruta23: {
        kind: `trainer`,
        tier: [9, 4, 1],
        flavors: [
          {
            name: `Ruta 23 · Entrenador Guay`,
            trainer: `acetrainer-gen1`,
            intro: `¡Un Entrenador Guay quiere luchar!`,
            lines: [
              `growlithe`,
              `exeggcute`,
              `staryu`,
              `pikachu`,
              `lapras`,
              `growlithe`,
            ],
            bg: `bg-route`,
            music: `mus_rg_victory_road`,
            tier: [8, 4, 1],
          },
          {
            name: `Ruta 23 · Ornitólogo`,
            trainer: `birdkeeper-gen1`,
            intro: `¡Un Ornitólogo quiere luchar!`,
            lines: [
              `pidgey`,
              `tauros`,
              `pidgey`,
              `zubat`,
              `pidgey`,
              `aerodactyl`,
            ],
            bg: `bg-route`,
            music: `mus_rg_victory_road`,
            tier: [9, 3, 2],
          },
        ],
      },
    };
  }))();
}
function se(e) {
  if (!ye) {
    ye = new Map();
    let e = ye;
    ct.forEach((t, n) => {
      if (t.weather)
        for (let r of [
          t.team,
          ...(t.trainerTeam ? [t.trainerTeam] : []),
          ...(t.variants ?? []).flatMap((e) => [
            e.team ?? t.team,
            ...(e.trainerTeam ? [e.trainerTeam] : []),
          ]),
        ])
          (e.set(ve(r), t.weather), e.set(ve(le(r, n)), t.weather));
    });
  }
  return e.length ? (ye.get(ve(e)) ?? null) : null;
}
function ce(e, t = !1) {
  let n = (n) => (t && xe.includes(e[n].line) ? 0 : 1);
  return e.map((e, t) => t).sort((e, t) => n(e) - n(t) || e - t);
}
function le(e, t, n = !1) {
  let r = e.map((e) => ({ ...e })),
    i = be[Se(t)];
  if (!i) return r;
  let a = ce(r, n),
    o = 0,
    s = 0;
  for (let e of a) r[e].star === 3 && ++o > i[0] && (r[e].star = 2);
  for (let e of a) r[e].star === 2 && ++s > i[1] && (r[e].star = 1);
  return r;
}
function ue(e) {
  return e.introStyle
    ? e.introStyle
    : e.boss
      ? `boss`
      : e.trainer
        ? e.badge || e.league
          ? `gym`
          : `trainer`
        : `wild`;
}
function de(e) {
  ut.push(e);
}
function fe(e, t) {
  if (e !== ct || t !== lt) {
    ((ct = e), (lt = t), (ye = null));
    for (let e of ut) e();
  }
}
var pe,
  me,
  he,
  ge,
  _e,
  ve,
  ye,
  be,
  xe,
  Se,
  Ce,
  we,
  Te,
  Ee,
  De,
  Oe,
  ke,
  Ae,
  je,
  Me,
  S,
  Ne,
  Pe,
  Fe,
  Ie,
  Le,
  Re,
  ze,
  Be,
  Ve,
  He,
  Ue,
  We,
  Ge,
  Ke,
  qe,
  Je,
  Ye,
  Xe,
  Ze,
  Qe,
  $e,
  et,
  tt,
  nt,
  rt,
  it,
  at,
  ot,
  st,
  ct,
  lt,
  ut,
  dt;
function ft() {
  return (ft = e(() => {
    (oe(),
      i(),
      d(),
      u(),
      (pe = 0.5),
      (me = 0.5),
      (he = 1.5),
      (ge = 0.0125),
      (_e = {
        rain: {
          name: `Lluvia`,
          icon: `☔`,
          up: `Water`,
          down: `Fire`,
          start: `¡Empezó a llover!`,
          color: `#74c0fc`,
        },
        sun: {
          name: `Sol`,
          icon: `☀️`,
          up: `Fire`,
          down: `Water`,
          start: `¡El sol pega fuerte!`,
          color: `#ffd43b`,
        },
        sand: {
          name: `Arena`,
          icon: `🌪️`,
          hurt: [`Rock`, `Ground`],
          start: `¡Se levantó una tormenta de arena!`,
          color: `#e8b46a`,
        },
        hail: {
          name: `Granizo`,
          icon: `🌨️`,
          hurt: [`Ice`],
          start: `¡Empezó a granizar!`,
          color: `#d0ebff`,
        },
      }),
      (ve = (e) =>
        e
          .map((e) => `${e.line}:${e.star}`)
          .sort()
          .join(`,`)),
      (ye = null),
      (be = {
        puente: [0, 1],
        azul: [0, 1],
        surge: [0, 2],
        gym4: [1, 4],
        gym5: [1, 6],
        gym6: [1, 7],
        giovanni: [1, 7],
        agatha: [5, 6],
        campeon: [4, 9],
      }),
      (xe = [`charmander`, `squirtle`, `bulbasaur`]),
      (Se = (e) => {
        var t;
        return typeof e == `string`
          ? e
          : (((t = ct[e]) == null ? void 0 : t.id) ?? ``);
      }),
      (Ce = {
        brock: [0, 0],
        puente: [0, 0],
        azul: [0, 0],
        misty: [0, 0],
        surge: [0, 0],
        gym4: [0, 0],
        gym5: [1, 1],
        gym6: [1, 1],
        mansion: [0, 1],
        blaine: [2, 1],
        giovanni: [4, 2],
        ruta22: [2, 1],
        ruta23: [2, 1],
        victoria: [1, 1],
        lorelei: [1, 0],
        bruno: [2, 2],
        agatha: [4, 2],
        lance: [1, 1],
        campeon: [6, 2],
        mewtwo: [0, 0],
      }),
      (we = (e) => Ce[Se(e)] ?? [0, 0]),
      (Te = {
        "brock-gen1": [
          [`onix`, `leftovers`],
          [`geodude`, `rocky-helmet`],
        ],
        rocketgrunt: [
          [`ekans`, `scope-lens`],
          [`zubat`, `shell-bell`],
        ],
        rocketgruntf: [
          [`zubat`, `shell-bell`],
          [`sandshrew`, `rocky-helmet`],
        ],
        "hiker-gen1": [
          [`geodude`, `rocky-helmet`],
          [`machop`, `choice-band`],
        ],
        "bugcatcher-gen1": [
          [`weedle`, `choice-band`],
          [`caterpie`, `leftovers`],
        ],
        "blue-gen1": [
          [`charmander`, `choice-band`],
          [`squirtle`, `choice-scarf`],
          [`bulbasaur`, `leftovers`],
          [`pidgey`, `scope-lens`],
          [`abra`, `quick-claw`],
        ],
        "misty-gen1": [
          [`staryu`, `choice-band`],
          [`psyduck`, `quick-claw`],
          [`poliwag`, `leftovers`],
        ],
        "ltsurge-gen1": [
          [`pikachu`, `quick-claw`],
          [`electabuzz`, `choice-band`],
          [`magnemite`, `choice-specs`],
          [`voltorb`, `rocky-helmet`],
        ],
        "erika-gen1": [
          [`oddish`, `choice-specs`],
          [`paras`, `leftovers`],
          [`exeggcute`, `quick-claw`],
        ],
        "koga-gen1": [
          [`weedle`, `scope-lens`],
          [`zubat`, `shell-bell`],
          [`ekans`, `quick-claw`],
          [`nidoran`, `choice-band`],
        ],
        "sabrina-gen1": [
          [`abra`, `choice-specs`],
          [`jynx`, `choice-specs`],
          [`slowpoke`, `leftovers`],
          [`jynx`, `quick-claw`],
          [`abra`, `quick-claw`],
        ],
        "blaine-gen1": [
          [`growlithe`, `choice-band`],
          [`vulpix`, `choice-specs`],
          [`magmar`, `choice-specs`],
          [`ponyta`, `choice-scarf`],
          [`flareon`, `choice-band`],
        ],
        "giovanni-gen1rb": [
          [`diglett`, `scope-lens`],
          [`rhyhorn`, `rocky-helmet`],
          [`nidoran`, `life-orb`],
          [`cubone`, `choice-band`],
          [`tauros`, `choice-band`],
        ],
        "lorelei-gen1": [
          [`jynx`, `choice-specs`],
          [`lapras`, `scope-lens`],
          [`seel`, `rocky-helmet`],
          [`shellder`, `choice-band`],
          [`lapras`, `leftovers`],
        ],
        "bruno-gen1": [
          [`machop`, `choice-band`],
          [`onix`, `rocky-helmet`],
          [`hitmonlee`, `scope-lens`],
          [`hitmonchan`, `shell-bell`],
          [`onix`, `leftovers`],
        ],
        "agatha-gen1": [
          [`gastly`, `choice-specs`],
          [`zubat`, `shell-bell`],
          [`gastly`, `quick-claw`],
          [`ekans`, `scope-lens`],
        ],
        "lance-gen1": [
          [`dratini`, `leftovers`],
          [`aerodactyl`, `scope-lens`],
          [`magikarp`, `life-orb`],
          [`dratini`, `choice-band`],
        ],
        "blue-gen1champion": [
          [`squirtle`, `choice-specs`],
          [`charmander`, `choice-band`],
          [`bulbasaur`, `leftovers`],
          [`abra`, `quick-claw`],
          [`rhyhorn`, `rocky-helmet`],
          [`growlithe`, `choice-band`],
          [`exeggcute`, `choice-specs`],
          [`magikarp`, `life-orb`],
        ],
        none: [
          [`abra`, `choice-specs`],
          [`chansey`, `leftovers`],
          [`ditto`, `leftovers`],
        ],
        "burglar-gen1": [
          [`growlithe`, `choice-band`],
          [`vulpix`, `choice-specs`],
        ],
        "scientist-gen1": [
          [`magnemite`, `choice-specs`],
          [`voltorb`, `life-orb`],
        ],
        "blackbelt-gen1": [
          [`hitmonlee`, `scope-lens`],
          [`machop`, `choice-band`],
        ],
        "tamer-gen1": [
          [`tauros`, `choice-band`],
          [`rhyhorn`, `leftovers`],
        ],
        "juggler-gen1": [
          [`abra`, `choice-specs`],
          [`jynx`, `choice-specs`],
        ],
        "acetrainer-gen1": [
          [`lapras`, `scope-lens`],
          [`exeggcute`, `choice-specs`],
          [`growlithe`, `choice-band`],
        ],
        "birdkeeper-gen1": [
          [`aerodactyl`, `scope-lens`],
          [`tauros`, `choice-band`],
        ],
      }),
      (Ee = {
        tank: `leftovers`,
        fighter: `choice-band`,
        assassin: `scope-lens`,
        marksman: `choice-scarf`,
        mage: `choice-specs`,
        support: `quick-claw`,
        special: `life-orb`,
      }),
      (De = {
        tank: `hp-up`,
        fighter: `protein`,
        assassin: `protein`,
        marksman: `carbos`,
        mage: `calcium`,
        support: `hp-up`,
        special: `calcium`,
      }),
      (Oe = {
        safari: {
          title: `Zona Safari`,
          tagline: `¡Una Safari Ball!`,
          icon: `🌿`,
          color: `#69db7c`,
        },
        center: {
          title: `Centro Pokémon`,
          tagline: `¡Recupera PS!`,
          trainer: `nurse`,
          icon: `❤️`,
          color: `#ff8fab`,
        },
        shop: {
          title: `Casino Rocket`,
          tagline: `¿Te la juegas?`,
          trainer: `gambler-gen1`,
          icon: `🎰`,
          color: `#ffd43b`,
        },
        mall: {
          title: `Centro Comercial`,
          tagline: `¡De compras!`,
          trainer: `clerk`,
          icon: `🛍️`,
          color: `#4dabf7`,
        },
        oak: {
          title: `Profesor Oak`,
          tagline: ``,
          trainer: `oak-gen1`,
          icon: `🎓`,
          color: `#74c0fc`,
        },
        legend: {
          title: `¡Aves legendarias!`,
          tagline: `Elige una. Solo una vez.`,
          icon: `🪶`,
          color: `#ffd43b`,
        },
        choice: {
          title: `Decisión`,
          tagline: ``,
          icon: `❔`,
          color: `#b197fc`,
        },
      }),
      (ke = {
        oak: { bg: `bg-route`, music: `mus_rg_oak` },
        center: { bg: `bg-city`, music: `mus_rg_poke_center` },
        shop: { bg: `bg-city`, music: `mus_rg_game_corner` },
        mall: { bg: `bg-city`, music: `mus_rg_celadon` },
        safari: { bg: `bg-meadow`, music: `mus_rg_fuchsia` },
        legend: { bg: `bg-icecave`, music: `mus_rg_mt_moon` },
        choice: { bg: `bg-city`, music: `mus_rg_lavender` },
      }),
      (Ae = {
        oak: 2,
        center: 1,
        shop: 1,
        mall: 1,
        safari: 1,
        legend: 1,
        choice: 99,
      }),
      (je = {
        bulbasaur: `charmander`,
        charmander: `squirtle`,
        squirtle: `bulbasaur`,
      }),
      (Me = `squirtle`),
      (S = (e, t = 1) => ({ line: e, star: t })),
      (Ne = (e) => [
        S(`pidgey`, 2),
        S(`rattata`, 2),
        S(`abra`, 2),
        S(e, 2),
        S(e),
      ]),
      (Pe = {
        charmander: [`magikarp`, `exeggcute`],
        squirtle: [`exeggcute`, `growlithe`],
        bulbasaur: [`magikarp`, `growlithe`],
      }),
      (Fe = (e) => {
        let [t, n] = Pe[e];
        return [
          S(`pidgey`, 3),
          S(`abra`, 3),
          S(`rhyhorn`, 3),
          S(t, 3),
          S(t, 2),
          S(n, 3),
          S(n),
          S(e, 3),
          S(`rhyhorn`),
          S(`abra`),
        ];
      }),
      (Ie = {
        charmander: [`shellder`, `magnemite`],
        squirtle: [`magnemite`, `vulpix`],
        bulbasaur: [`shellder`, `vulpix`],
      }),
      (Le = (e) => {
        let [t, n] = Ie[e];
        return [
          S(`pidgey`, 3),
          S(`abra`, 3),
          S(`sandshrew`, 3),
          S(t, 3),
          S(t, 2),
          S(n, 3),
          S(n, 2),
          S(e, 3),
          S(`sandshrew`, 2),
          S(`abra`, 2),
        ];
      }),
      (Re = {
        bulbasaur: [S(`diglett`)],
        charmander: [S(`weedle`)],
        squirtle: [S(`geodude`)],
        pikachu: [S(`pidgey`)],
      }),
      (ze = [
        {
          vid: `b`,
          name: `Bosque Verde · Pikachu salvaje`,
          intro: `¡Un Pikachu salvaje!`,
          team: [S(`pikachu`)],
        },
        { vid: `c`, team: [S(`weedle`), S(`pidgey`)] },
      ]),
      (Be = [
        {
          vid: `b`,
          name: `Monte Moon · Team Rocket`,
          intro: `¡Una recluta del Team Rocket quiere luchar!`,
          trainer: `rocketgruntf`,
          team: [S(`zubat`, 2), S(`rattata`, 2), S(`sandshrew`, 2), S(`ekans`)],
          bg: `bg-earthycave`,
          music: `mus_rg_mt_moon`,
        },
        {
          vid: `c`,
          name: `Monte Moon · Montañero`,
          intro: `¡Un Montañero quiere luchar!`,
          trainer: `hiker-gen1`,
          team: [
            S(`geodude`, 2),
            S(`machop`, 2),
            S(`onix`),
            S(`geodude`),
            S(`machop`),
          ],
          bg: `bg-mountain`,
          music: `mus_rg_mt_moon`,
        },
        {
          vid: `d`,
          name: `Ruta 3 · Cazabichos`,
          intro: `¡Un Cazabichos quiere luchar!`,
          trainer: `bugcatcher-gen1`,
          team: [S(`caterpie`, 2), S(`weedle`), S(`paras`), S(`weedle`)],
          bg: `bg-forest`,
          music: `mus_rg_route1`,
        },
      ]),
      (Ve = [
        { vid: `b`, team: [S(`onix`, 2), S(`geodude`)] },
        {
          vid: `c`,
          team: [S(`onix`, 2), S(`diglett`, 2)],
          trainerTeam: [S(`onix`, 2), S(`rhyhorn`)],
        },
      ]),
      (He = [
        { vid: `b`, team: [S(`staryu`, 2), S(`poliwag`)] },
        {
          vid: `c`,
          team: [S(`staryu`), S(`seel`), S(`poliwag`), S(`magikarp`)],
        },
      ]),
      (Ue = [
        {
          vid: `b`,
          team: [
            S(`pikachu`, 2),
            S(`magnemite`, 2),
            S(`voltorb`, 2),
            S(`voltorb`),
            S(`voltorb`),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`pikachu`, 2),
            S(`electabuzz`),
            S(`voltorb`),
            S(`magnemite`),
          ],
        },
      ]),
      (We = [
        {
          vid: `b`,
          team: [
            S(`oddish`, 3),
            S(`paras`, 2),
            S(`exeggcute`, 2),
            S(`oddish`, 2),
            S(`paras`),
            S(`exeggcute`),
          ],
          tiers: {
            5: [
              S(`oddish`, 3),
              S(`paras`, 2),
              S(`exeggcute`, 2),
              S(`oddish`, 2),
              S(`paras`),
              S(`oddish`),
            ],
            6: [
              S(`oddish`, 3),
              S(`paras`, 2),
              S(`exeggcute`, 2),
              S(`oddish`, 2),
              S(`paras`),
              S(`oddish`),
              S(`exeggcute`),
            ],
          },
        },
        {
          vid: `c`,
          team: [
            S(`oddish`, 3),
            S(`exeggcute`, 2),
            S(`bulbasaur`),
            S(`paras`, 2),
            S(`oddish`, 2),
            S(`paras`),
          ],
        },
      ]),
      (Ge = [
        {
          vid: `b`,
          team: [
            S(`nidoran`, 3),
            S(`zubat`, 3),
            S(`ekans`, 3),
            S(`weedle`, 2),
            S(`nidoran`, 2),
            S(`zubat`, 2),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`weedle`, 3),
            S(`weedle`, 2),
            S(`zubat`, 3),
            S(`ekans`, 3),
            S(`ekans`, 2),
            S(`oddish`, 2),
            S(`zubat`),
          ],
        },
      ]),
      (Ke = [
        {
          vid: `b`,
          team: [
            S(`abra`, 3),
            S(`exeggcute`, 3),
            S(`abra`, 2),
            S(`slowpoke`, 2),
            S(`slowpoke`),
            S(`jynx`, 2),
            S(`abra`),
            S(`abra`),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`abra`, 3),
            S(`staryu`),
            S(`jynx`, 3),
            S(`slowpoke`, 2),
            S(`abra`, 2),
            S(`abra`, 2),
            S(`abra`, 2),
            S(`abra`),
          ],
        },
      ]),
      (qe = {
        5: [
          S(`oddish`, 3),
          S(`exeggcute`, 2),
          S(`paras`, 2),
          S(`paras`, 2),
          S(`oddish`, 2),
          S(`bulbasaur`, 2),
        ],
        6: [
          S(`oddish`, 3),
          S(`exeggcute`, 2),
          S(`paras`, 2),
          S(`paras`, 2),
          S(`oddish`, 2),
          S(`bulbasaur`),
          S(`oddish`),
        ],
      }),
      (Je = {
        4: [
          S(`weedle`, 3),
          S(`zubat`, 3),
          S(`ekans`, 3),
          S(`oddish`, 2),
          S(`ekans`, 2),
          S(`weedle`),
        ],
        6: [
          S(`weedle`, 3),
          S(`zubat`, 3),
          S(`ekans`, 3),
          S(`zubat`, 2),
          S(`ekans`, 2),
          S(`ekans`, 2),
          S(`nidoran`, 2),
          S(`oddish`, 2),
        ],
      }),
      (Ye = {
        4: [
          S(`abra`, 3),
          S(`abra`, 2),
          S(`abra`, 2),
          S(`jynx`, 3),
          S(`slowpoke`, 2),
        ],
        5: [
          S(`abra`, 3),
          S(`abra`, 2),
          S(`abra`),
          S(`jynx`, 3),
          S(`slowpoke`, 2),
          S(`slowpoke`),
        ],
      }),
      (Xe = [
        {
          vid: `b`,
          team: [
            S(`growlithe`, 3),
            S(`magmar`, 2),
            S(`ponyta`, 2),
            S(`vulpix`, 2),
            S(`ponyta`),
            S(`vulpix`),
            S(`growlithe`),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`growlithe`, 3),
            S(`vulpix`, 2),
            S(`ponyta`),
            S(`flareon`, 2),
            S(`growlithe`),
            S(`vulpix`),
            S(`ponyta`),
          ],
        },
      ]),
      (Ze = [
        {
          vid: `b`,
          team: [
            S(`rhyhorn`, 2),
            S(`rhyhorn`),
            S(`nidoran`, 3),
            S(`diglett`, 3),
            S(`sandshrew`),
            S(`nidoran`),
            S(`cubone`, 2),
          ],
          trainerTeam: [
            S(`rhyhorn`, 2),
            S(`rhyhorn`),
            S(`nidoran`, 3),
            S(`diglett`, 3),
            S(`sandshrew`),
            S(`nidoran`, 2),
            S(`cubone`, 2),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`rhyhorn`, 2),
            S(`nidoran`, 3),
            S(`nidoran`),
            S(`diglett`, 3),
            S(`diglett`),
            S(`geodude`),
            S(`cubone`, 2),
          ],
          trainerTeam: [
            S(`rhyhorn`, 2),
            S(`nidoran`, 3),
            S(`nidoran`, 2),
            S(`diglett`, 3),
            S(`diglett`, 2),
            S(`geodude`),
            S(`cubone`, 2),
          ],
        },
      ]),
      (Qe = [
        {
          vid: `b`,
          team: [
            S(`lapras`, 2),
            S(`lapras`, 2),
            S(`seel`, 2),
            S(`seel`, 2),
            S(`jynx`, 2),
            S(`jynx`),
            S(`seel`),
            S(`shellder`),
            S(`jynx`),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`jynx`, 2),
            S(`lapras`, 2),
            S(`lapras`, 2),
            S(`seel`, 2),
            S(`shellder`),
            S(`shellder`),
            S(`seel`),
            S(`jynx`),
            S(`shellder`),
          ],
        },
      ]),
      ($e = [
        {
          vid: `b`,
          team: [
            S(`poliwag`, 2),
            S(`hitmonchan`, 3),
            S(`onix`, 3),
            S(`machop`, 2),
            S(`onix`, 2),
            S(`machop`, 2),
            S(`hitmonlee`, 2),
            S(`machop`, 2),
            S(`machop`),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`machop`, 2),
            S(`machop`, 2),
            S(`onix`, 2),
            S(`onix`, 2),
            S(`hitmonchan`, 3),
            S(`hitmonlee`, 3),
            S(`machop`, 2),
            S(`machop`, 2),
            S(`onix`, 2),
          ],
        },
      ]),
      (et = [
        {
          vid: `b`,
          team: [
            S(`gastly`, 3),
            S(`gastly`, 3),
            S(`gastly`, 3),
            S(`gastly`, 2),
            S(`zubat`, 3),
            S(`zubat`, 3),
            S(`ekans`, 3),
            S(`ekans`, 2),
            S(`gastly`, 2),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`gastly`, 3),
            S(`ekans`, 3),
            S(`ekans`, 3),
            S(`zubat`, 3),
            S(`zubat`, 3),
            S(`nidoran`, 3),
            S(`gastly`, 2),
            S(`gastly`, 2),
            S(`ekans`, 2),
          ],
        },
      ]),
      (tt = [
        {
          vid: `b`,
          team: [
            S(`dratini`, 3),
            S(`charmander`, 2),
            S(`dratini`, 2),
            S(`dratini`),
            S(`aerodactyl`, 2),
            S(`magikarp`, 2),
            S(`magikarp`),
            S(`aerodactyl`),
            S(`dratini`),
          ],
          trainerTeam: [
            S(`dratini`, 3),
            S(`charmander`, 3),
            S(`dratini`, 2),
            S(`dratini`),
            S(`aerodactyl`, 2),
            S(`magikarp`, 2),
            S(`magikarp`),
            S(`aerodactyl`),
            S(`dratini`),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`dratini`, 3),
            S(`magikarp`, 2),
            S(`aerodactyl`, 2),
            S(`dratini`, 2),
            S(`dratini`),
            S(`dratini`),
            S(`magikarp`),
            S(`aerodactyl`),
            S(`dratini`),
          ],
        },
      ]),
      (nt = [
        {
          vid: `b`,
          team: [
            S(`mewtwo`, 2),
            S(`ditto`, 2),
            S(`ditto`, 2),
            S(`ditto`),
            S(`chansey`, 2),
            S(`cubone`, 3),
            S(`paras`, 3),
            S(`zubat`, 3),
            S(`abra`, 3),
          ],
          trainerTeam: [
            S(`mewtwo`, 2),
            S(`ditto`, 2),
            S(`ditto`, 2),
            S(`ditto`),
            S(`chansey`, 2),
            S(`cubone`, 3),
            S(`paras`, 3),
            S(`zubat`, 2),
            S(`abra`, 3),
          ],
        },
        {
          vid: `c`,
          team: [
            S(`mewtwo`, 2),
            S(`ditto`, 2),
            S(`ditto`, 2),
            S(`chansey`),
            S(`rhyhorn`, 2),
            S(`abra`, 3),
            S(`magnemite`, 3),
            S(`voltorb`, 2),
            S(`jigglypuff`, 2),
          ],
          trainerTeam: [
            S(`mewtwo`, 2),
            S(`ditto`, 2),
            S(`ditto`, 2),
            S(`chansey`, 2),
            S(`rhyhorn`, 2),
            S(`abra`, 3),
            S(`magnemite`, 3),
            S(`voltorb`, 2),
            S(`jigglypuff`, 2),
          ],
        },
      ]),
      (rt = [
        {
          id: `ruta2`,
          name: `Ruta 2 · Pokémon salvajes`,
          intro: `¡Pokémon salvajes!`,
          team: [S(`diglett`)],
          starterTeam: Re,
          bg: `bg-route`,
          music: `mus_rg_route1`,
        },
        {
          id: `bosque`,
          name: `Bosque Verde`,
          variants: ze,
          intro: `¡Pokémon salvajes del Bosque Verde!`,
          team: [S(`caterpie`), S(`pidgey`)],
          bg: `bg-forest`,
          music: `mus_rg_viridian_forest`,
        },
        {
          id: `oak`,
          name: `Ciudad Plateada · Profesor Oak`,
          event: [`oak`],
          team: [],
          bg: `bg-route`,
          music: `mus_rg_oak`,
        },
        {
          id: `brock`,
          name: `Gimnasio Plateada · Brock`,
          variants: Ve,
          intro: `¡El Líder Brock te desafía!`,
          trainer: `brock-gen1`,
          team: [S(`onix`, 2), S(`geodude`)],
          bg: `bg-mountain`,
          badge: 1,
          music: `mus_rg_gym`,
        },
        x(`monteMoon`),
        {
          id: `puente`,
          name: `Puente Pepita · Team Rocket`,
          variants: Be,
          intro: `¡Un recluta del Team Rocket quiere luchar!`,
          trainer: `rocketgrunt`,
          team: [S(`zubat`, 2), S(`ekans`, 2), S(`rattata`, 2), S(`sandshrew`)],
          bg: `bg-meadow`,
          music: `mus_rg_route24`,
        },
        {
          id: `azul`,
          name: `Ciudad Celeste · Rival Azul`,
          intro: `¡Tu rival Azul quiere luchar!`,
          trainer: `blue-gen1`,
          team: Ne(Me),
          rivalTeam: Ne,
          bg: `bg-city`,
          music: `mus_rg_encounter_rival`,
        },
        {
          id: `misty`,
          name: `Gimnasio Celeste · Misty`,
          variants: He,
          weather: `rain`,
          intro: `¡La Líder Misty te desafía!`,
          trainer: `misty-gen1`,
          team: [S(`staryu`, 2), S(`psyduck`), S(`magikarp`)],
          bg: `bg-river`,
          badge: 2,
          music: `mus_rg_gym`,
        },
        x(`ruta6`),
        {
          id: `carmin`,
          name: `Ciudad Carmín · Centro Pokémon`,
          event: [`center`, `oak`],
          team: [],
          bg: `bg-city`,
          music: `mus_rg_poke_center`,
        },
        x(`ssanne`),
        {
          id: `surge`,
          name: `Gimnasio Carmín · Teniente Surge`,
          variants: Ue,
          intro: `¡El Líder Teniente Surge te desafía!`,
          trainer: `ltsurge-gen1`,
          team: [
            S(`voltorb`),
            S(`pikachu`, 2),
            S(`magnemite`),
            S(`electabuzz`),
          ],
          bg: `bg-thunderplains`,
          badge: 3,
          music: `mus_rg_gym`,
        },
        x(`tunel`),
        {
          id: `azulona`,
          name: `Ciudad Azulona · Casino Rocket`,
          event: [`shop`, `mall`, `center`],
          eventMust: [`center`],
          team: [],
          bg: `bg-city`,
          music: `mus_rg_game_corner`,
        },
        x(`escondite`),
        {
          id: `gym4`,
          name: `Gimnasio Azulona · Erika`,
          variants: We,
          tiers: qe,
          intro: `¡La Líder Erika te desafía!`,
          trainer: `erika-gen1`,
          team: [
            S(`oddish`, 3),
            S(`exeggcute`, 2),
            S(`paras`, 2),
            S(`paras`),
            S(`oddish`),
            S(`bulbasaur`),
          ],
          bg: `bg-forest`,
          badge: 4,
          music: `mus_rg_gym`,
        },
        x(`torre`),
        x(`ruta12`),
        {
          id: `fucsia`,
          name: `Ciudad Fucsia · Zona Safari`,
          event: [`safari`, `shop`, `mall`],
          eventWeight: { safari: 2 },
          eventPlace: { shop: `Ciudad Azulona`, mall: `Ciudad Azulona` },
          team: [],
          bg: `bg-meadow`,
          music: `mus_rg_fuchsia`,
        },
        {
          id: `gym5`,
          name: `Gimnasio Fucsia · Koga`,
          variants: Ge,
          tiers: Je,
          intro: `¡El Líder Koga te desafía!`,
          trainer: `koga-gen1`,
          team: [
            S(`weedle`, 3),
            S(`zubat`, 3),
            S(`ekans`, 3),
            S(`zubat`, 2),
            S(`ekans`, 2),
            S(`ekans`, 2),
            S(`nidoran`, 2),
          ],
          bg: `bg-dampcave`,
          badge: 5,
          music: `mus_rg_gym`,
        },
        x(`ruta19`),
        {
          id: `espuma`,
          name: `Islas Espuma · Aves legendarias`,
          event: [`legend`],
          team: [],
          bg: `bg-icecave`,
          music: `mus_rg_mt_moon`,
        },
        x(`silph`),
        {
          id: `gym6`,
          name: `Gimnasio Azafrán · Sabrina`,
          variants: Ke,
          tiers: Ye,
          intro: `¡La Líder Sabrina te desafía!`,
          trainer: `sabrina-gen1`,
          team: [
            S(`abra`, 3),
            S(`abra`, 2),
            S(`abra`, 2),
            S(`abra`),
            S(`jynx`, 3),
            S(`slowpoke`, 2),
            S(`jynx`),
            S(`slowpoke`, 2),
          ],
          bg: `bg-space`,
          badge: 6,
          music: `mus_rg_gym`,
        },
        x(`mansion`),
        {
          id: `blaine`,
          name: `Gimnasio Canela · Blaine`,
          variants: Xe,
          weather: `sun`,
          intro: `¡El Líder Blaine te desafía!`,
          trainer: `blaine-gen1`,
          team: [
            S(`growlithe`, 3),
            S(`ponyta`),
            S(`vulpix`, 2),
            S(`ponyta`),
            S(`growlithe`, 2),
            S(`growlithe`),
            S(`vulpix`, 2),
          ],
          bg: `bg-volcanocave`,
          badge: 7,
          music: `mus_rg_gym`,
        },
        x(`ruta21`),
        {
          id: `giovanni`,
          name: `Gimnasio Verde · Giovanni`,
          variants: Ze,
          weather: `sand`,
          intro: `¡El Líder Giovanni te desafía!`,
          trainer: `giovanni-gen1rb`,
          team: [
            S(`rhyhorn`, 2),
            S(`nidoran`, 3),
            S(`diglett`, 3),
            S(`diglett`, 2),
            S(`cubone`, 3),
            S(`nidoran`, 2),
            S(`tauros`, 2),
          ],
          bg: `bg-desert`,
          badge: 8,
          music: `mus_rg_gym`,
        },
        x(`ruta22`),
        x(`ruta23`),
        x(`victoria`),
        {
          id: `meseta`,
          prep: !0,
          name: `Meseta Añil · Tienda Pokémon`,
          eventTitle: `Tienda Pokémon`,
          event: [`mall`],
          team: [],
          bg: `bg-city`,
          music: `mus_rg_poke_center`,
        },
        {
          id: `lorelei`,
          league: `elite`,
          name: `Alto Mando · Lorelei`,
          variants: Qe,
          weather: `hail`,
          intro: `¡Lorelei del Alto Mando quiere luchar!`,
          trainer: `lorelei-gen1`,
          team: [
            S(`seel`, 2),
            S(`shellder`, 2),
            S(`jynx`, 2),
            S(`lapras`, 2),
            S(`jynx`, 2),
            S(`seel`),
            S(`lapras`),
            S(`jynx`),
            S(`shellder`),
          ],
          bg: `bg-icecave`,
          music: `mus_rg_victory_road`,
        },
        {
          id: `bruno`,
          league: `elite`,
          name: `Alto Mando · Bruno`,
          variants: $e,
          intro: `¡Bruno del Alto Mando quiere luchar!`,
          trainer: `bruno-gen1`,
          team: [
            S(`onix`, 2),
            S(`hitmonlee`, 2),
            S(`hitmonchan`, 3),
            S(`machop`, 3),
            S(`onix`, 2),
            S(`machop`, 2),
            S(`machop`, 2),
            S(`hitmonlee`, 2),
            S(`machop`),
          ],
          trainerTeam: [
            S(`onix`, 2),
            S(`hitmonlee`, 2),
            S(`hitmonchan`, 3),
            S(`machop`, 3),
            S(`onix`, 2),
            S(`machop`, 2),
            S(`machop`, 2),
            S(`hitmonlee`, 3),
            S(`machop`),
          ],
          bg: `bg-mountain`,
          music: `mus_rg_victory_road`,
        },
        {
          id: `agatha`,
          league: `elite`,
          name: `Alto Mando · Agatha`,
          variants: et,
          intro: `¡Agatha del Alto Mando quiere luchar!`,
          trainer: `agatha-gen1`,
          team: [
            S(`gastly`, 3),
            S(`gastly`, 3),
            S(`zubat`, 3),
            S(`ekans`, 3),
            S(`gastly`, 2),
            S(`zubat`, 3),
            S(`ekans`, 3),
            S(`gastly`, 3),
            S(`gastly`, 2),
          ],
          bg: `bg-gen4-cave`,
          music: `mus_rg_victory_road`,
        },
        {
          id: `lance`,
          league: `elite`,
          name: `Alto Mando · Lance`,
          variants: tt,
          intro: `¡Lance del Alto Mando quiere luchar!`,
          trainer: `lance-gen1`,
          team: [
            S(`dratini`, 3),
            S(`dratini`, 2),
            S(`magikarp`, 2),
            S(`dratini`),
            S(`aerodactyl`),
            S(`dratini`),
            S(`aerodactyl`),
            S(`magikarp`),
            S(`dratini`),
          ],
          bg: `bg-deepsea`,
          music: `mus_rg_victory_road`,
        },
        {
          id: `campeon`,
          league: `champion`,
          name: `Campeón · Azul`,
          variants: [{ vid: `b`, team: Le(Me), rivalTeam: Le }],
          intro: `¡El Campeón Azul te reta! «¡Soy el más fuerte del mundo!»`,
          trainer: `blue-gen1champion`,
          team: Fe(Me),
          rivalTeam: Fe,
          bg: `bg-city`,
          music: `mus_rg_encounter_rival`,
        },
        {
          id: `mewtwo`,
          name: `Cueva Celeste · Mewtwo`,
          lair: !0,
          variants: nt,
          intro: `¡Un Mewtwo salvaje apareció!`,
          team: [
            S(`mewtwo`, 2),
            S(`ditto`, 2),
            S(`ditto`),
            S(`chansey`),
            S(`rhyhorn`, 2),
            S(`abra`, 3),
            S(`magnemite`, 3),
            S(`ditto`),
            S(`pikachu`, 2),
          ],
          trainerTeam: [
            S(`mewtwo`, 2),
            S(`ditto`, 2),
            S(`ditto`),
            S(`chansey`),
            S(`rhyhorn`, 2),
            S(`abra`, 3),
            S(`magnemite`, 2),
            S(`ditto`),
            S(`pikachu`, 2),
          ],
          bg: `bg-space`,
          music: `mus_rg_mt_moon`,
          boss: !0,
        },
      ]),
      (it = (e) => e.surprise ?? !!e.event),
      (at = { gym: 0, trainer: 0, wild: 0, boss: 0 }),
      (ot = { gym: 2800, trainer: 2400, wild: 0, boss: 3e3 }),
      (st = [
        { name: `Plateada`, full: `Ruta 2 → Plateada`, from: 0, to: 3 },
        { name: `Celeste`, full: `Celeste y Carmín`, from: 4, to: 11 },
        { name: `Azulona`, full: `Azulona y Fucsia`, from: 12, to: 19 },
        {
          name: `Azafrán`,
          full: `Espuma, Azafrán, Canela y Verde`,
          from: 20,
          to: 27,
        },
        { name: `Liga`, full: `Liga Pokémon`, from: 28, to: 36 },
        {
          name: `Cueva Celeste`,
          full: `Cueva Celeste`,
          from: 37,
          to: 37,
          secret: !0,
        },
      ]),
      (ct = rt),
      (lt = st),
      (ut = []),
      (dt = (e) =>
        Math.max(
          0,
          lt.findIndex((t) => e >= t.from && e <= t.to),
        )));
    for (let e of Object.keys(_e)) {
      let t = c[e];
      te([
        [_e[e].name, t.name],
        [_e[e].start, t.start],
      ]);
    }
    r(_e, (e, t) => t, c);
    for (let e of Object.keys(Oe)) {
      let t = l[e];
      te([
        [Oe[e].title, t.title],
        [Oe[e].tagline, t.tagline],
      ]);
    }
    r(Oe, (e, t) => t, l);
    for (let e of st) a(e, { name: ne(e.name, `en`), full: ne(e.full, `en`) });
  }))();
}
function pt(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++)
    (!Ft(e[n]) || e.indexOf(e[n]) === n) && t++;
  return t;
}
function mt(e, t) {
  return pt(e) < 8 || (Ft(t) && e.includes(t));
}
function ht(e) {
  let t = [],
    n = [];
  for (let r of e) (mt(t, r) ? t : n).push(r);
  return { keep: t, over: n };
}
function gt(e) {
  let t = [];
  return (
    e.forEach((e, n) => {
      let r = Ft(e) ? t.find((t) => t.id === e) : void 0;
      r ? ((r.inv = n), r.n++) : t.push({ id: e, inv: n, n: 1, first: n });
    }),
    t
  );
}
function _t(e, t) {
  return t >= e.length ? pt(e) : pt(e.slice(0, Ft(e[t]) ? e.indexOf(e[t]) : t));
}
function vt(e, t) {
  return k(e) && k(t) ? It[e][t] : null;
}
function yt(e) {
  return O(e) && D[e].kind === `full` && !zt.includes(e) ? Lt[e] : [];
}
function bt(e) {
  let t = [];
  for (let n of yt(e)) {
    let e = t.find((e) => e.part === n);
    e ? e.n++ : t.push({ part: n, n: 1 });
  }
  return t;
}
function xt(e) {
  if (!O(e)) return ``;
  let t = bt(e)
    .map((e) => D[e.part].tiny + (e.n > 1 ? ` ×${e.n}` : ``))
    .join(` · `);
  return t ? `${t} · ${D[e].short}` : D[e].short;
}
function St(e, t) {
  if (Nt(t)) return null;
  if (k(t)) {
    let n = e.findIndex(k);
    if (n >= 0) {
      let r = vt(e[n], t);
      return { items: e.map((e, t) => (t === n ? r : e)), combined: r };
    }
  }
  return e.length >= 3 ? null : { items: [...e, t], combined: null };
}
function Ct(e) {
  let t = [];
  for (let n of e) {
    let e = St(t, n);
    t = e ? e.items : [...t, n];
  }
  return t;
}
var C,
  w,
  wt,
  Tt,
  T,
  E,
  Et,
  D,
  O,
  Dt,
  Ot,
  kt,
  At,
  jt,
  Mt,
  k,
  Nt,
  Pt,
  Ft,
  It,
  Lt,
  Rt,
  zt,
  Bt,
  A,
  Vt;
function Ht() {
  return (Ht = e(() => {
    (i(),
      d(),
      t(),
      (C = {
        hpUp: 10,
        protein: 12,
        calcium: 12,
        carbos: 8,
        iron: 20,
        zinc: 20,
        leftoversRegen: 1,
        bandBasic: 45,
        specsAbility: 45,
        scarfAs: 35,
        scopeCrit: 0.25,
        scopeCritDmg: 0.4,
        clawMana: 0.2,
        clawRefund: 0.08,
        bellSteal: 0.15,
        sashShield: 0.1,
        sashGuard: 1,
        helmetReflect: 0.18,
        orbDmg: 24,
        orbRecoil: 0.02,
        woundPct: 0.3,
        sunderPct: 0.18,
        vestAbility: 0.12,
        orbBurn: 0.003,
        orbWoundT: 3,
        fangSunderT: 4,
        spoonSunderT: 4,
        barbWoundT: 4,
        barbShield: 0.5,
        protectorBasic: 0.12,
        evioliteDef: 35,
        sitrusAt: 0.5,
        sitrusHeal: 0.25,
        expertBelt: 45,
        lightClay: 30,
      }),
      (w = (e) => `${Math.round(e * 100)} %`),
      (wt = n.es),
      (Tt = n.en),
      (T = C),
      (E = (e) => String(e).replace(`.`, `,`)),
      (Et = [
        {
          id: `hp-up`,
          stat: `hp`,
          name: `Más PS`,
          kind: `part`,
          short: `+${T.hpUp} % de PS máximos`,
          tiny: `+${T.hpUp} % PS`,
          tag: `❤️`,
          color: `#ff5959`,
        },
        {
          id: `protein`,
          stat: `atk`,
          name: `Proteína`,
          kind: `part`,
          short: `+${T.protein} % de Ataque`,
          tiny: `+${T.protein} % Ataque`,
          tag: `👊`,
          color: `#f5862f`,
        },
        {
          id: `calcium`,
          stat: `spa`,
          name: `Calcio`,
          kind: `part`,
          short: `+${T.calcium} % de Ataque Especial`,
          tiny: `+${T.calcium} % At. Esp.`,
          tag: `✨`,
          color: `#5f86ef`,
        },
        {
          id: `carbos`,
          stat: `as`,
          name: `Carburante`,
          kind: `part`,
          short: `+${T.carbos} % de Velocidad de ataque`,
          tiny: `+${T.carbos} % Vel. de ataque`,
          tag: `💨`,
          color: `#f0628f`,
        },
        {
          id: `iron`,
          stat: `def`,
          name: `Hierro`,
          kind: `part`,
          short: `+${T.iron} % de Defensa`,
          tiny: `+${T.iron} % Defensa`,
          tag: `🛡️`,
          color: `#e8b923`,
        },
        {
          id: `zinc`,
          stat: `spd`,
          name: `Zinc`,
          kind: `part`,
          short: `+${T.zinc} % de Def. Esp.`,
          tiny: `+${T.zinc} % Def. Esp.`,
          tag: `🔰`,
          color: `#4fb35a`,
        },
        {
          id: `leftovers`,
          stat: `hp`,
          name: `Restos`,
          kind: `full`,
          short: `Recupera un ${E(T.leftoversRegen)} % de sus PS por segundo`,
          tiny: `+${E(T.leftoversRegen)} % PS/s`,
          tag: `💚`,
          color: `#51cf66`,
        },
        {
          id: `choice-band`,
          stat: `atk`,
          name: `Cinta Elegida`,
          kind: `full`,
          short: `+${T.bandBasic} % de Ataque`,
          tiny: `+${T.bandBasic} % Ataque`,
          tag: `⚔️`,
          color: `#ff6b6b`,
        },
        {
          id: `choice-specs`,
          stat: `spa`,
          name: `Gafas Elegidas`,
          kind: `full`,
          short: `+${T.specsAbility} % de Ataque Especial`,
          tiny: `+${T.specsAbility} % At. Esp.`,
          tag: `✨`,
          color: `#4dabf7`,
        },
        {
          id: `choice-scarf`,
          stat: `as`,
          name: `Pañuelo Elegido`,
          kind: `full`,
          short: `+${T.scarfAs} % de Velocidad de ataque`,
          tiny: `+${T.scarfAs} % Vel. de ataque`,
          tag: `💨`,
          color: `#fcc419`,
        },
        {
          id: `scope-lens`,
          stat: `crit`,
          name: `Periscopio`,
          kind: `full`,
          short: `+${w(T.scopeCrit)} de Prob. de crítico en ataques básicos; sus críticos hacen ×${E(1.5 + T.scopeCritDmg)}`,
          tiny: `+${w(T.scopeCrit)} Crít. ×${E(1.5 + T.scopeCritDmg)}`,
          tag: `🎯`,
          color: `#f783ac`,
        },
        {
          id: `life-orb`,
          stat: `atk`,
          name: `Vidasfera`,
          kind: `full`,
          short: `+${T.orbDmg} % al daño de sus ataques básicos y de su habilidad. Cada ataque básico le cuesta un ${w(T.orbRecoil)} de sus PS máx.`,
          tiny: `+${T.orbDmg} % daño (básicos y habilidad), −${w(T.orbRecoil)} PS/básico`,
          tag: `🔮`,
          color: `#b197fc`,
        },
        {
          id: `quick-claw`,
          stat: `mana`,
          name: `Garra Rápida`,
          kind: `full`,
          short: `Empieza el combate con un ${w(T.clawMana)} de ${wt} y recupera un ${w(T.clawRefund)} cada vez que usa su habilidad`,
          tiny: `${wt} inicial ${w(T.clawMana)}, +${w(T.clawRefund)} al lanzar`,
          tag: `⚡`,
          color: `#74c0fc`,
        },
        {
          id: `shell-bell`,
          stat: `vamp`,
          name: `Campana Concha`,
          kind: `full`,
          short: `Drenaje: se cura un ${w(T.bellSteal)} del daño que hace`,
          tiny: `Drenaje ${w(T.bellSteal)}`,
          tag: `🔔`,
          color: `#e599f7`,
        },
        {
          id: `focus-sash`,
          stat: `shield`,
          name: `Banda Focus`,
          kind: `full`,
          short: `Aguanta un golpe letal con 1 PS: pasa ${E(T.sashGuard)} s intocable e inactiva (los rivales la sueltan), se libra de los efectos de daño con el tiempo y vuelve con un escudo del ${w(T.sashShield)} de sus PS (una vez)`,
          tiny: `aguanta con 1 PS, ${E(T.sashGuard)} s intocable + escudo ${w(T.sashShield)}`,
          tag: `🎗️`,
          color: `#ff922b`,
        },
        {
          id: `rocky-helmet`,
          stat: `hp`,
          name: `Casco Dentado`,
          kind: `full`,
          short: `Devuelve un ${w(T.helmetReflect)} del daño de ataques básicos que recibe`,
          tiny: `devuelve ${w(T.helmetReflect)} del daño básico`,
          tag: `🛡️`,
          color: `#adb5bd`,
        },
        {
          id: `assault-vest`,
          stat: `spd`,
          name: `Chaleco Asalto`,
          kind: `full`,
          short: `Recibe un ${w(T.vestAbility)} menos de daño de habilidades`,
          tiny: `−${w(T.vestAbility)} daño de habilidades`,
          tag: `🦺`,
          color: `#4c6ef5`,
        },
        {
          id: `flame-orb`,
          stat: `hp`,
          name: `Llamasfera`,
          kind: `full`,
          short: `Cada segundo, los rivales a 1 casilla pierden un ${E(Math.round(T.orbBurn * 1e3) / 10)} % de sus PS máx. y sufren Anticura (−${w(T.woundPct)} de curación)`,
          tiny: `aura: −${E(Math.round(T.orbBurn * 1e3) / 10)} % PS/s y Anticura`,
          tag: `🔥`,
          color: `#fa5252`,
        },
        {
          id: `razor-fang`,
          stat: `atk`,
          name: `Colmillo Agudo`,
          kind: `full`,
          short: `Sus ataques básicos causan Desgaste ${T.fangSunderT} s (−${w(T.sunderPct)} de Defensa y Def. Esp.)`,
          tiny: `básicos: Desgaste ${T.fangSunderT} s`,
          tag: `🦷`,
          color: `#fd7e14`,
        },
        {
          id: `twisted-spoon`,
          stat: `spa`,
          name: `Cuchara Torcida`,
          kind: `full`,
          short: `Su habilidad causa Desgaste ${T.spoonSunderT} s (−${w(T.sunderPct)} de Defensa y Def. Esp.) a todos los que golpea`,
          tiny: `habilidad: Desgaste ${T.spoonSunderT} s`,
          tag: `🥄`,
          color: `#9775fa`,
        },
        {
          id: `poison-barb`,
          stat: `as`,
          name: `Flecha Venenosa`,
          kind: `full`,
          short: `Sus ataques básicos causan Anticura ${T.barbWoundT} s (−${w(T.woundPct)} de curación); hace un ${w(T.barbShield)} más de daño a los escudos`,
          tiny: `básicos: Anticura ${T.barbWoundT} s, +${w(T.barbShield)} a escudos`,
          tag: `🎯`,
          color: `#40c057`,
        },
        {
          id: `protector`,
          stat: `def`,
          name: `Protector`,
          kind: `full`,
          short: `Recibe un ${w(T.protectorBasic)} menos de daño de ataques básicos`,
          tiny: `−${w(T.protectorBasic)} daño de básicos`,
          tag: `🪖`,
          color: `#e8b923`,
        },
        {
          id: `eviolite`,
          stat: `def`,
          name: `Mineral Evolutivo`,
          kind: `full`,
          short: `Mientras pueda evolucionar: +${T.evioliteDef} % de Defensa y Def. Esp.`,
          tiny: `sin evolucionar: +${T.evioliteDef} % Def. y Def. Esp.`,
          tag: `💎`,
          color: `#cc5de8`,
        },
        {
          id: `sitrus-berry`,
          stat: `hp`,
          name: `Baya Zidra`,
          kind: `full`,
          short: `Al bajar del ${w(T.sitrusAt)} de sus PS, se cura un ${w(T.sitrusHeal)} (una vez)`,
          tiny: `a ${w(T.sitrusAt)} PS: cura ${w(T.sitrusHeal)}`,
          tag: `🍈`,
          color: `#ffd43b`,
        },
        {
          id: `expert-belt`,
          stat: `atk`,
          name: `Cinta Experto`,
          kind: `full`,
          short: `+${T.expertBelt} % de daño en sus golpes súper eficaces`,
          tiny: `+${T.expertBelt} % súper eficaz`,
          tag: `🥋`,
          color: `#f76707`,
        },
        {
          id: `light-clay`,
          stat: `shield`,
          name: `Refleluz`,
          kind: `full`,
          short: `Sus escudos, curas y semillas son un ${T.lightClay} % más fuertes`,
          tiny: `+${T.lightClay} % escudos y curas`,
          tag: `🟫`,
          color: `#94d82d`,
        },
        {
          id: `mental-herb`,
          stat: `spd`,
          name: `Hierba Mental`,
          kind: `full`,
          short: `Se libra al instante del primer control (sueño, parálisis, confusión, congelación…; una vez)`,
          tiny: `ignora el 1.er control`,
          tag: `🌿`,
          color: `#69db7c`,
        },
        {
          id: `magnet`,
          name: `Imán`,
          kind: `tool`,
          short: `Quita los objetos de un Pokémon`,
          tiny: `Quita los objetos de un Pokémon`,
          tag: `🧲`,
          color: `#ff6b6b`,
        },
      ]),
      (D = Object.fromEntries(Et.map((e) => [e.id, e]))),
      (O = (e) => typeof e == `string` && e in D),
      (Dt = [`hp-up`, `protein`, `calcium`, `carbos`, `iron`, `zinc`]),
      (Ot = Et.filter((e) => e.kind === `full`).map((e) => e.id)),
      (kt = `iron`),
      (At = [kt, `zinc`]),
      (jt = Dt.filter((e) => !At.includes(e))),
      (Mt = (e = !1) => (e ? jt : Dt)),
      (k = (e) => O(e) && D[e].kind === `part`),
      (Nt = (e) => O(e) && D[e].kind === `tool`),
      (Pt = `magnet`),
      (Ft = (e) => Nt(e)),
      (It = {
        "hp-up": {
          "hp-up": `leftovers`,
          protein: `rocky-helmet`,
          calcium: `shell-bell`,
          carbos: `focus-sash`,
          iron: `flame-orb`,
          zinc: `sitrus-berry`,
        },
        protein: {
          "hp-up": `rocky-helmet`,
          protein: `choice-band`,
          calcium: `life-orb`,
          carbos: `scope-lens`,
          iron: `razor-fang`,
          zinc: `expert-belt`,
        },
        calcium: {
          "hp-up": `shell-bell`,
          protein: `life-orb`,
          calcium: `choice-specs`,
          carbos: `quick-claw`,
          iron: `twisted-spoon`,
          zinc: `light-clay`,
        },
        carbos: {
          "hp-up": `focus-sash`,
          protein: `scope-lens`,
          calcium: `quick-claw`,
          carbos: `choice-scarf`,
          iron: `poison-barb`,
          zinc: `mental-herb`,
        },
        iron: {
          "hp-up": `flame-orb`,
          protein: `razor-fang`,
          calcium: `twisted-spoon`,
          carbos: `poison-barb`,
          iron: `protector`,
          zinc: `eviolite`,
        },
        zinc: {
          "hp-up": `sitrus-berry`,
          protein: `expert-belt`,
          calcium: `light-clay`,
          carbos: `mental-herb`,
          iron: `eviolite`,
          zinc: `assault-vest`,
        },
      }),
      (Lt = Object.fromEntries(
        Dt.flatMap((e, t) => Dt.slice(t).map((t) => [It[e][t], [e, t]])),
      )),
      (Rt = (e = !1) =>
        e ? Ot.filter((e) => !Lt[e].some((e) => At.includes(e))) : Ot),
      (zt = [`choice-band`, `choice-specs`, `choice-scarf`, `eviolite`]),
      (Bt = (e) => String(e)),
      (A = (e) => `${Math.round(e * 100)}%`),
      (Vt = {
        "hp-up": {
          name: `HP Up`,
          short: `+${T.hpUp}% max HP`,
          tiny: `+${T.hpUp}% HP`,
        },
        protein: {
          name: `Protein`,
          short: `+${T.protein}% Attack`,
          tiny: `+${T.protein}% Attack`,
        },
        calcium: {
          name: `Calcium`,
          short: `+${T.calcium}% Special Attack`,
          tiny: `+${T.calcium}% Sp. Atk`,
        },
        carbos: {
          name: `Carbos`,
          short: `+${T.carbos}% Attack speed`,
          tiny: `+${T.carbos}% Atk speed`,
        },
        iron: {
          name: `Iron`,
          short: `+${T.iron}% Defense`,
          tiny: `+${T.iron}% Defense`,
        },
        zinc: {
          name: `Zinc`,
          short: `+${T.zinc}% Sp. Def`,
          tiny: `+${T.zinc}% Sp. Def`,
        },
        leftovers: {
          name: `Leftovers`,
          short: `Restores ${Bt(T.leftoversRegen)}% of its HP per second`,
          tiny: `+${Bt(T.leftoversRegen)}% HP/s`,
        },
        "choice-band": {
          name: `Choice Band`,
          short: `+${T.bandBasic}% Attack`,
          tiny: `+${T.bandBasic}% Attack`,
        },
        "choice-specs": {
          name: `Choice Specs`,
          short: `+${T.specsAbility}% Special Attack`,
          tiny: `+${T.specsAbility}% Sp. Atk`,
        },
        "choice-scarf": {
          name: `Choice Scarf`,
          short: `+${T.scarfAs}% Attack speed`,
          tiny: `+${T.scarfAs}% Atk speed`,
        },
        "scope-lens": {
          name: `Scope Lens`,
          short: `+${A(T.scopeCrit)} Crit chance on basic attacks; its crits deal ×${Bt(1.5 + T.scopeCritDmg)}`,
          tiny: `+${A(T.scopeCrit)} Crit ×${Bt(1.5 + T.scopeCritDmg)}`,
        },
        "life-orb": {
          name: `Life Orb`,
          short: `+${T.orbDmg}% damage on its basic attacks and its ability. Each basic attack costs ${A(T.orbRecoil)} of its max HP.`,
          tiny: `+${T.orbDmg}% dmg (basics & ability), −${A(T.orbRecoil)} HP/basic`,
        },
        "quick-claw": {
          name: `Quick Claw`,
          short: `Starts combat with ${A(T.clawMana)} ${Tt} and recovers ${A(T.clawRefund)} every time it uses its ability`,
          tiny: `${A(T.clawMana)} starting ${Tt}, +${A(T.clawRefund)} on cast`,
        },
        "shell-bell": {
          name: `Shell Bell`,
          short: `Drain: heals ${A(T.bellSteal)} of the damage it deals`,
          tiny: `Drain ${A(T.bellSteal)}`,
        },
        "focus-sash": {
          name: `Focus Sash`,
          short: `Survives a lethal hit with 1 HP: becomes untargetable and inactive for ${T.sashGuard}s (enemies drop it as a target), is cleansed of damage-over-time effects, and returns with a shield worth ${A(T.sashShield)} of its HP (once)`,
          tiny: `survives at 1 HP, ${T.sashGuard}s untargetable + ${A(T.sashShield)} shield`,
        },
        "rocky-helmet": {
          name: `Rocky Helmet`,
          short: `Returns ${A(T.helmetReflect)} of the basic-attack damage it takes`,
          tiny: `returns ${A(T.helmetReflect)} of basic damage`,
        },
        "assault-vest": {
          name: `Assault Vest`,
          short: `Takes ${A(T.vestAbility)} less damage from abilities`,
          tiny: `−${A(T.vestAbility)} ability damage`,
        },
        "flame-orb": {
          name: `Flame Orb`,
          short: `Every second, enemies within 1 hex lose ${Math.round(T.orbBurn * 1e3) / 10}% of their max HP and suffer Heal Block (−${A(T.woundPct)} healing)`,
          tiny: `aura: −${Math.round(T.orbBurn * 1e3) / 10}% HP/s and Heal Block`,
        },
        "razor-fang": {
          name: `Razor Fang`,
          short: `Its basic attacks inflict Wear for ${T.fangSunderT}s (−${A(T.sunderPct)} Defense and Sp. Def)`,
          tiny: `basics: Wear ${T.fangSunderT}s`,
        },
        "twisted-spoon": {
          name: `Twisted Spoon`,
          short: `Its ability inflicts Wear for ${T.spoonSunderT}s (−${A(T.sunderPct)} Defense and Sp. Def) on everyone it hits`,
          tiny: `ability: Wear ${T.spoonSunderT}s`,
        },
        "poison-barb": {
          name: `Poison Barb`,
          short: `Its basic attacks inflict Heal Block for ${T.barbWoundT}s (−${A(T.woundPct)} healing); deals ${A(T.barbShield)} more damage to shields`,
          tiny: `basics: Heal Block ${T.barbWoundT}s, +${A(T.barbShield)} vs shields`,
        },
        protector: {
          name: `Protector`,
          short: `Takes ${A(T.protectorBasic)} less damage from basic attacks`,
          tiny: `−${A(T.protectorBasic)} basic damage`,
        },
        eviolite: {
          name: `Eviolite`,
          short: `While it can still evolve: +${T.evioliteDef}% Defense and Sp. Def`,
          tiny: `not fully evolved: +${T.evioliteDef}% Def & Sp. Def`,
        },
        "sitrus-berry": {
          name: `Sitrus Berry`,
          short: `When it drops below ${A(T.sitrusAt)} HP, heals ${A(T.sitrusHeal)} (once)`,
          tiny: `at ${A(T.sitrusAt)} HP: heals ${A(T.sitrusHeal)}`,
        },
        "expert-belt": {
          name: `Expert Belt`,
          short: `+${T.expertBelt}% damage on its super effective hits`,
          tiny: `+${T.expertBelt}% super effective`,
        },
        "light-clay": {
          name: `Light Clay`,
          short: `Its shields, heals and seeds are ${T.lightClay}% stronger`,
          tiny: `+${T.lightClay}% shields & heals`,
        },
        "mental-herb": {
          name: `Mental Herb`,
          short: `Instantly shakes off the first crowd control (sleep, paralysis, confusion, freeze…; once)`,
          tiny: `ignores the 1st crowd control`,
        },
        magnet: {
          name: `Magnet`,
          short: `Removes a Pokémon’s items`,
          tiny: `Removes a Pokémon’s items`,
        },
      }));
    for (let e of Et) {
      let t = Vt[e.id];
      te([
        [e.name, t.name],
        [e.short, t.short],
        [e.tiny, t.tiny],
      ]);
    }
    r(Et, (e) => e.id, Vt);
  }))();
}
function Ut(e, t) {
  return j[e].thresholds.filter((e) => t >= e).length;
}
var Wt, Gt, Kt, qt, j, Jt, Yt, Xt;
function Zt() {
  return (Zt = e(() => {
    (t(),
      i(),
      d(),
      (Wt = 0.2),
      (Gt = { gastly: `Ghost`, dratini: `Dragon` }),
      (Kt = { dmg: 40, hpLoss: 0.2 }),
      (qt = { boost: 25, manaExtra: 0.2 }),
      (j = {
        Normal: {
          thresholds: [2, 4, 6],
          values: [18, 38, 50],
          desc: `Los Normal ganan +{v} % de daño y de Velocidad de ataque.`,
        },
        Fire: {
          thresholds: [2, 4, 5],
          values: [15, 110, 170],
          desc: `Los ataques de los Fuego queman: {v} de daño/s y −50 % de Ataque durante 3 s.`,
        },
        Water: {
          thresholds: [2, 4, 6],
          values: [6, 22, 26],
          desc: `Los Agua ganan +{v} de ${n.es} extra por ataque.`,
        },
        Grass: {
          thresholds: [2, 3],
          values: [4, 8],
          desc: `Los Planta regeneran un {v} % de sus PS máximos por segundo.`,
        },
        Electric: {
          thresholds: [2, 4],
          values: [25, 45],
          desc: `Todo el equipo empieza con +{v} de ${n.es}. Además, los Eléctrico electrocutan a los adyacentes al usar su habilidad (daño y parálisis 3 s: −50 % de vel. de ataque y falla 1 de cada 4 ataques).`,
        },
        Ice: {
          thresholds: [2, 4],
          values: [55, 95],
          desc: `Los ataques de los Hielo ralentizan al objetivo un {v} % durante 2 s.`,
        },
        Fighting: {
          thresholds: [2, 4],
          values: [80, 140],
          desc: `Los Lucha hacen +{v} % de daño con sus ataques y tienen Drenaje: se curan un ${Math.round(Wt * 100)} % del daño que hacen.`,
        },
        Poison: {
          thresholds: [2, 3, 5],
          values: [20, 80, 150],
          desc: `Los ataques de los Veneno envenenan: {v} de daño/s durante 4 s.`,
        },
        Ground: {
          thresholds: [2, 3, 5],
          values: [12, 22, 35],
          desc: `Los Tierra reciben un {v} % menos de daño.`,
        },
        Flying: {
          thresholds: [2, 4, 6],
          values: [10, 25, 40],
          desc: `Los Volador esquivan un {v} % de los ataques básicos.`,
        },
        Psychic: {
          thresholds: [2, 4, 5],
          values: [40, 85, 140],
          desc: `Las habilidades de los Psíquico hacen +{v} % de daño.`,
        },
        Bug: {
          thresholds: [2, 3],
          values: [42, 82],
          desc: `Los Bicho ganan +{v} % de Velocidad de ataque.`,
        },
        Rock: {
          thresholds: [2, 4],
          values: [7, 13],
          desc: `Los Roca empiezan con un escudo del {v} % de sus PS máximos.`,
        },
        Ghost: {
          thresholds: [1],
          values: [12],
          desc: `Mal de Ojo: al empezar el combate, todos los rivales pierden un {v}\xA0% de Defensa y Def. Esp.`,
        },
        Dragon: {
          thresholds: [1],
          values: [8],
          desc: `Danza Dragón: todo tu equipo gana un {v}\xA0% de Ataque, At. Esp. y Vel. de ataque.`,
        },
      }),
      (Jt = { Electric: `mixed`, Dragon: `team`, Ghost: `foes` }),
      (Yt = (e) => Jt[e] ?? `type`),
      (Xt = {
        Normal: `Normal types gain +{v}% damage and Attack speed.`,
        Fire: `Fire types' attacks burn: {v} damage/s and −50% Attack for 3s.`,
        Water: `Water types gain +{v} extra ${n.en} per attack.`,
        Grass: `Grass types regenerate {v}% of their max HP per second.`,
        Electric: `The whole team starts with +{v} ${n.en}. Electric types also shock adjacent enemies when they use their ability (damage and 3s paralysis: −50% attack speed and 1 in 4 attacks fails).`,
        Ice: `Ice types' attacks slow the target by {v}% for 2s.`,
        Fighting: `Fighting types deal +{v}% damage with their attacks and have Drain: they heal ${Math.round(Wt * 100)}% of the damage they deal.`,
        Poison: `Poison types' attacks poison: {v} damage/s for 4s.`,
        Ground: `Ground types take {v}% less damage.`,
        Flying: `Flying types dodge {v}% of basic attacks.`,
        Psychic: `Psychic types' abilities deal +{v}% damage.`,
        Bug: `Bug types gain +{v}% Attack speed.`,
        Rock: `Rock types start with a shield worth {v}% of their max HP.`,
        Ghost: `Mean Look: at the start of combat, all enemies lose {v}% Defense and Sp. Def.`,
        Dragon: `Dragon Dance: your whole team gains {v}% Attack, Sp. Atk and Attack speed.`,
      }),
      te(Object.keys(j).map((e) => [j[e].desc, Xt[e]])),
      r(
        j,
        (e, t) => t,
        Object.fromEntries(Object.keys(Xt).map((e) => [e, { desc: Xt[e] }])),
      ));
  }))();
}
function Qt(e) {
  let t = I(e),
    n = L(e),
    r = t - (n - (n & 1)) / 2;
  return { x: r, z: n, y: -r - n };
}
function M(e, t) {
  let n = Qt(e),
    r = Qt(t);
  return Math.max(
    Math.abs(n.x - r.x),
    Math.abs(n.y - r.y),
    Math.abs(n.z - r.z),
  );
}
function $t(e, t = N * 1.1) {
  let n = -1,
    r = 1 / 0;
  for (let t = 0; t < 56; t++) {
    let i = nn[t].x - e.x,
      a = nn[t].z - e.z,
      o = Math.sqrt(i * i + a * a);
    o < r && ((r = o), (n = t));
  }
  return r <= t ? n : -1;
}
var N, P, en, F, I, L, tn, nn, R, rn, an;
function on() {
  return (on = e(() => {
    ((N = 0.6),
      (P = Math.sqrt(3) * N),
      (en = 1.5 * N),
      (F = (e, t) => t * 7 + e),
      (I = (e) => e % 7),
      (L = (e) => Math.floor(e / 7)),
      (tn = (e) => e >= 0 && e < 56 && L(e) >= 4),
      (nn = Array.from({ length: 56 }, (e, t) => {
        let n = I(t),
          r = L(t);
        return { x: (n + (r & 1) * 0.5 - 3 - 0.25) * P, z: (r - 7 / 2) * en };
      })),
      (R = (e) => nn[e]),
      (rn = Array.from({ length: 56 }, (e, t) => {
        let n = [];
        for (let e = 0; e < 56; e++) e !== t && M(t, e) === 1 && n.push(e);
        return n;
      })),
      (an = (e) => rn[e]));
  }))();
}
var sn, cn, ln, un, dn, fn, pn, mn, hn;
function gn() {
  return (gn = e(() => {
    ((sn = {
      tank: {
        id: `tank`,
        row: `front`,
        stats: {
          hp: 1250,
          atk: 80,
          def: 105,
          spa: 50,
          spd: 90,
          as: 0.65,
          blend: 0.5,
          crit: 0.06,
          basicK: 1.3,
          abilityK: 0.6,
        },
      },
      fighter: {
        id: `fighter`,
        row: `front`,
        stats: {
          hp: 1550,
          atk: 105,
          def: 80,
          spa: 60,
          spd: 70,
          as: 0.85,
          blend: 0.5,
          crit: 0.06,
          basicK: 1.3,
          abilityK: 0.8,
        },
      },
      assassin: {
        id: `assassin`,
        row: `any`,
        stats: {
          hp: 1e3,
          atk: 110,
          def: 60,
          spa: 60,
          spd: 55,
          as: 1,
          blend: 0.5,
          crit: 0.3,
          basicK: 1.15,
          abilityK: 1.15,
        },
      },
      marksman: {
        id: `marksman`,
        row: `back`,
        stats: {
          hp: 940,
          atk: 110,
          def: 55,
          spa: 85,
          spd: 55,
          as: 1,
          blend: 0.5,
          crit: 0.06,
          basicK: 1.65,
          abilityK: 0.65,
        },
      },
      mage: {
        id: `mage`,
        row: `back`,
        stats: {
          hp: 940,
          atk: 50,
          def: 50,
          spa: 120,
          spd: 85,
          as: 0.75,
          blend: 0.5,
          crit: 0.06,
          basicK: 1.2,
          abilityK: 1,
        },
      },
      support: {
        id: `support`,
        row: `back`,
        stats: {
          hp: 1200,
          atk: 50,
          def: 80,
          spa: 80,
          spd: 90,
          as: 0.65,
          blend: 0.5,
          crit: 0.06,
          basicK: 1,
          abilityK: 1,
        },
      },
      special: {
        id: `special`,
        row: `any`,
        stats: {
          hp: 1300,
          atk: 75,
          def: 75,
          spa: 75,
          spd: 75,
          as: 0.85,
          blend: 0,
          crit: 0.06,
          basicK: 1,
          abilityK: 1,
        },
      },
    }),
      Object.values(sn),
      (cn = {
        tank: `tank`,
        fighter: `fighter`,
        assassin: `assassin`,
        marksman: `marksman`,
        mage: `marksman`,
        support: `support`,
        special: `fighter`,
      }),
      (ln = [`tank`, `fighter`, `assassin`, `marksman`, `support`]),
      (un = (e, t, n, r, i) =>
        r + (i - r) * Math.min(1, Math.max(0, (e - t) / (n - t)))),
      (dn = 0.005),
      (fn = 1.45),
      (pn = (e) =>
        e <= 130
          ? un(e, 30, 130, 0.8, 1.25)
          : Math.min(fn, 1.25 + (e - 130) * dn)),
      (mn = (e) => un(e, 30, 130, 0.85, 1.15)),
      (hn = (e, t, n) => Math.round(e * (1 - n) + t * n)));
  }))();
}
var _n, vn, yn, bn, xn, Sn, Cn, wn, Tn, En, Dn, On, kn, An, jn, Mn;
function Nn() {
  return (Nn = e(() => {
    ((_n = {
      Normal: 1,
      Fire: 1,
      Water: 1,
      Grass: 1,
      Electric: 1,
      Ice: 1,
      Fighting: 1,
      Poison: 1,
      Ground: 1,
      Flying: 1,
      Psychic: 1,
      Bug: 1,
      Rock: 0.5,
      Ghost: 0,
      Dragon: 1,
    }),
      (vn = {
        Normal: 1,
        Fire: 0.5,
        Water: 0.5,
        Grass: 2,
        Electric: 1,
        Ice: 2,
        Fighting: 1,
        Poison: 1,
        Ground: 1,
        Flying: 1,
        Psychic: 1,
        Bug: 2,
        Rock: 0.5,
        Ghost: 1,
        Dragon: 0.5,
      }),
      (yn = {
        Normal: 1,
        Fire: 2,
        Water: 0.5,
        Grass: 0.5,
        Electric: 1,
        Ice: 1,
        Fighting: 1,
        Poison: 1,
        Ground: 2,
        Flying: 1,
        Psychic: 1,
        Bug: 1,
        Rock: 2,
        Ghost: 1,
        Dragon: 0.5,
      }),
      (bn = {
        Normal: 1,
        Fire: 0.5,
        Water: 2,
        Grass: 0.5,
        Electric: 1,
        Ice: 1,
        Fighting: 1,
        Poison: 0.5,
        Ground: 2,
        Flying: 0.5,
        Psychic: 1,
        Bug: 0.5,
        Rock: 2,
        Ghost: 1,
        Dragon: 0.5,
      }),
      (xn = {
        Normal: 1,
        Fire: 1,
        Water: 2,
        Grass: 0.5,
        Electric: 0.5,
        Ice: 1,
        Fighting: 1,
        Poison: 1,
        Ground: 0,
        Flying: 2,
        Psychic: 1,
        Bug: 1,
        Rock: 1,
        Ghost: 1,
        Dragon: 0.5,
      }),
      (Sn = {
        Normal: 1,
        Fire: 0.5,
        Water: 0.5,
        Grass: 2,
        Electric: 1,
        Ice: 0.5,
        Fighting: 1,
        Poison: 1,
        Ground: 2,
        Flying: 2,
        Psychic: 1,
        Bug: 1,
        Rock: 1,
        Ghost: 1,
        Dragon: 2,
      }),
      (Cn = {
        Normal: 2,
        Fire: 1,
        Water: 1,
        Grass: 1,
        Electric: 1,
        Ice: 2,
        Fighting: 1,
        Poison: 0.5,
        Ground: 1,
        Flying: 0.5,
        Psychic: 0.5,
        Bug: 0.5,
        Rock: 2,
        Ghost: 0,
        Dragon: 1,
      }),
      (wn = {
        Normal: 1,
        Fire: 1,
        Water: 1,
        Grass: 2,
        Electric: 1,
        Ice: 1,
        Fighting: 1,
        Poison: 0.5,
        Ground: 0.5,
        Flying: 1,
        Psychic: 1,
        Bug: 1,
        Rock: 0.5,
        Ghost: 0.5,
        Dragon: 1,
      }),
      (Tn = {
        Normal: 1,
        Fire: 2,
        Water: 1,
        Grass: 0.5,
        Electric: 2,
        Ice: 1,
        Fighting: 1,
        Poison: 2,
        Ground: 1,
        Flying: 0,
        Psychic: 1,
        Bug: 0.5,
        Rock: 2,
        Ghost: 1,
        Dragon: 1,
      }),
      (En = {
        Normal: 1,
        Fire: 1,
        Water: 1,
        Grass: 2,
        Electric: 0.5,
        Ice: 1,
        Fighting: 2,
        Poison: 1,
        Ground: 1,
        Flying: 1,
        Psychic: 1,
        Bug: 2,
        Rock: 0.5,
        Ghost: 1,
        Dragon: 1,
      }),
      (Dn = {
        Normal: 1,
        Fire: 1,
        Water: 1,
        Grass: 1,
        Electric: 1,
        Ice: 1,
        Fighting: 2,
        Poison: 2,
        Ground: 1,
        Flying: 1,
        Psychic: 0.5,
        Bug: 1,
        Rock: 1,
        Ghost: 1,
        Dragon: 1,
      }),
      (On = {
        Normal: 1,
        Fire: 0.5,
        Water: 1,
        Grass: 2,
        Electric: 1,
        Ice: 1,
        Fighting: 0.5,
        Poison: 0.5,
        Ground: 1,
        Flying: 0.5,
        Psychic: 2,
        Bug: 1,
        Rock: 1,
        Ghost: 0.5,
        Dragon: 1,
      }),
      (kn = {
        Normal: 1,
        Fire: 2,
        Water: 1,
        Grass: 1,
        Electric: 1,
        Ice: 2,
        Fighting: 0.5,
        Poison: 1,
        Ground: 0.5,
        Flying: 2,
        Psychic: 1,
        Bug: 2,
        Rock: 1,
        Ghost: 1,
        Dragon: 1,
      }),
      (An = {
        Normal: 0,
        Fire: 1,
        Water: 1,
        Grass: 1,
        Electric: 1,
        Ice: 1,
        Fighting: 1,
        Poison: 1,
        Ground: 1,
        Flying: 1,
        Psychic: 2,
        Bug: 1,
        Rock: 1,
        Ghost: 2,
        Dragon: 1,
      }),
      (jn = {
        Normal: 1,
        Fire: 1,
        Water: 1,
        Grass: 1,
        Electric: 1,
        Ice: 1,
        Fighting: 1,
        Poison: 1,
        Ground: 1,
        Flying: 1,
        Psychic: 1,
        Bug: 1,
        Rock: 1,
        Ghost: 1,
        Dragon: 2,
      }),
      (Mn = {
        Normal: _n,
        Fire: vn,
        Water: yn,
        Grass: bn,
        Electric: xn,
        Ice: Sn,
        Fighting: Cn,
        Poison: wn,
        Ground: Tn,
        Flying: En,
        Psychic: Dn,
        Bug: On,
        Rock: kn,
        Ghost: An,
        Dragon: jn,
      }));
  }))();
}
function z(e, t) {
  return t.reduce((t, n) => {
    var r;
    return t * (((r = In[e]) == null ? void 0 : r[n]) ?? 1);
  }, 1);
}
var Pn, Fn, In;
function Ln() {
  return (Ln = e(() => {
    (Nn(),
      i(),
      d(),
      (Pn = [
        `Normal`,
        `Fire`,
        `Water`,
        `Grass`,
        `Electric`,
        `Ice`,
        `Fighting`,
        `Poison`,
        `Ground`,
        `Flying`,
        `Psychic`,
        `Bug`,
        `Rock`,
        `Ghost`,
        `Dragon`,
      ]),
      (Fn = {
        Normal: { es: `Normal`, color: `#a8a77a` },
        Fire: { es: `Fuego`, color: `#ee8130` },
        Water: { es: `Agua`, color: `#6390f0` },
        Grass: { es: `Planta`, color: `#7ac74c` },
        Electric: { es: `Eléctrico`, color: `#f7d02c` },
        Ice: { es: `Hielo`, color: `#96d9d6` },
        Fighting: { es: `Lucha`, color: `#c22e28` },
        Poison: { es: `Veneno`, color: `#a33ea1` },
        Ground: { es: `Tierra`, color: `#e2bf65` },
        Flying: { es: `Volador`, color: `#a98ff3` },
        Psychic: { es: `Psíquico`, color: `#f95587` },
        Bug: { es: `Bicho`, color: `#a6b91a` },
        Rock: { es: `Roca`, color: `#b6a136` },
        Ghost: { es: `Fantasma`, color: `#735797` },
        Dragon: { es: `Dragón`, color: `#6f35fc` },
      }),
      (In = Mn));
    for (let e of Pn) a(Fn[e], { es: e });
    te(Pn.map((e) => [Fn[e].es, e]));
  }))();
}
var Rn;
function zn() {
  return (zn = e(() => {
    Rn = {
      1: {
        name: `Bulbasaur`,
        types: [`Grass`, `Poison`],
        stats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
        weightkg: 6.9,
      },
      2: {
        name: `Ivysaur`,
        types: [`Grass`, `Poison`],
        stats: { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60 },
        weightkg: 13,
      },
      3: {
        name: `Venusaur`,
        types: [`Grass`, `Poison`],
        stats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
        weightkg: 100,
      },
      4: {
        name: `Charmander`,
        types: [`Fire`],
        stats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
        weightkg: 8.5,
      },
      5: {
        name: `Charmeleon`,
        types: [`Fire`],
        stats: { hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80 },
        weightkg: 19,
      },
      6: {
        name: `Charizard`,
        types: [`Fire`, `Flying`],
        stats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
        weightkg: 90.5,
      },
      7: {
        name: `Squirtle`,
        types: [`Water`],
        stats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
        weightkg: 9,
      },
      8: {
        name: `Wartortle`,
        types: [`Water`],
        stats: { hp: 59, atk: 63, def: 80, spa: 65, spd: 80, spe: 58 },
        weightkg: 22.5,
      },
      9: {
        name: `Blastoise`,
        types: [`Water`],
        stats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 },
        weightkg: 85.5,
      },
      10: {
        name: `Caterpie`,
        types: [`Bug`],
        stats: { hp: 45, atk: 30, def: 35, spa: 20, spd: 20, spe: 45 },
        weightkg: 2.9,
      },
      11: {
        name: `Metapod`,
        types: [`Bug`],
        stats: { hp: 50, atk: 20, def: 55, spa: 25, spd: 25, spe: 30 },
        weightkg: 9.9,
      },
      12: {
        name: `Butterfree`,
        types: [`Bug`, `Flying`],
        stats: { hp: 60, atk: 45, def: 50, spa: 90, spd: 80, spe: 70 },
        weightkg: 32,
      },
      13: {
        name: `Weedle`,
        types: [`Bug`, `Poison`],
        stats: { hp: 40, atk: 35, def: 30, spa: 20, spd: 20, spe: 50 },
        weightkg: 3.2,
      },
      14: {
        name: `Kakuna`,
        types: [`Bug`, `Poison`],
        stats: { hp: 45, atk: 25, def: 50, spa: 25, spd: 25, spe: 35 },
        weightkg: 10,
      },
      15: {
        name: `Beedrill`,
        types: [`Bug`, `Poison`],
        stats: { hp: 65, atk: 90, def: 40, spa: 45, spd: 80, spe: 75 },
        weightkg: 29.5,
      },
      16: {
        name: `Pidgey`,
        types: [`Normal`, `Flying`],
        stats: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 },
        weightkg: 1.8,
      },
      17: {
        name: `Pidgeotto`,
        types: [`Normal`, `Flying`],
        stats: { hp: 63, atk: 60, def: 55, spa: 50, spd: 50, spe: 71 },
        weightkg: 30,
      },
      18: {
        name: `Pidgeot`,
        types: [`Normal`, `Flying`],
        stats: { hp: 83, atk: 80, def: 75, spa: 70, spd: 70, spe: 101 },
        weightkg: 39.5,
      },
      19: {
        name: `Rattata`,
        types: [`Normal`],
        stats: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 },
        weightkg: 3.5,
      },
      20: {
        name: `Raticate`,
        types: [`Normal`],
        stats: { hp: 55, atk: 81, def: 60, spa: 50, spd: 70, spe: 97 },
        weightkg: 18.5,
      },
      23: {
        name: `Ekans`,
        types: [`Poison`],
        stats: { hp: 35, atk: 60, def: 44, spa: 40, spd: 54, spe: 55 },
        weightkg: 6.9,
      },
      24: {
        name: `Arbok`,
        types: [`Poison`],
        stats: { hp: 60, atk: 95, def: 69, spa: 65, spd: 79, spe: 80 },
        weightkg: 65,
      },
      25: {
        name: `Pikachu`,
        types: [`Electric`],
        stats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
        weightkg: 6,
      },
      26: {
        name: `Raichu`,
        types: [`Electric`],
        stats: { hp: 60, atk: 90, def: 55, spa: 90, spd: 80, spe: 110 },
        weightkg: 30,
      },
      27: {
        name: `Sandshrew`,
        types: [`Ground`],
        stats: { hp: 50, atk: 75, def: 85, spa: 20, spd: 30, spe: 40 },
        weightkg: 12,
      },
      28: {
        name: `Sandslash`,
        types: [`Ground`],
        stats: { hp: 75, atk: 100, def: 110, spa: 45, spd: 55, spe: 65 },
        weightkg: 29.5,
      },
      29: {
        name: `Nidoran♀`,
        types: [`Poison`],
        stats: { hp: 55, atk: 47, def: 52, spa: 40, spd: 40, spe: 41 },
        weightkg: 7,
      },
      30: {
        name: `Nidorina`,
        types: [`Poison`],
        stats: { hp: 70, atk: 62, def: 67, spa: 55, spd: 55, spe: 56 },
        weightkg: 20,
      },
      31: {
        name: `Nidoqueen`,
        types: [`Poison`, `Ground`],
        stats: { hp: 90, atk: 92, def: 87, spa: 75, spd: 85, spe: 76 },
        weightkg: 60,
      },
      32: {
        name: `Nidoran♂`,
        types: [`Poison`],
        stats: { hp: 46, atk: 57, def: 40, spa: 40, spd: 40, spe: 50 },
        weightkg: 9,
      },
      33: {
        name: `Nidorino`,
        types: [`Poison`],
        stats: { hp: 61, atk: 72, def: 57, spa: 55, spd: 55, spe: 65 },
        weightkg: 19.5,
      },
      34: {
        name: `Nidoking`,
        types: [`Poison`, `Ground`],
        stats: { hp: 81, atk: 102, def: 77, spa: 85, spd: 75, spe: 85 },
        weightkg: 62,
      },
      35: {
        name: `Clefairy`,
        types: [`Normal`],
        stats: { hp: 70, atk: 45, def: 48, spa: 60, spd: 65, spe: 35 },
        weightkg: 7.5,
      },
      36: {
        name: `Clefable`,
        types: [`Normal`],
        stats: { hp: 95, atk: 70, def: 73, spa: 95, spd: 90, spe: 60 },
        weightkg: 40,
      },
      37: {
        name: `Vulpix`,
        types: [`Fire`],
        stats: { hp: 38, atk: 41, def: 40, spa: 50, spd: 65, spe: 65 },
        weightkg: 9.9,
      },
      38: {
        name: `Ninetales`,
        types: [`Fire`],
        stats: { hp: 73, atk: 76, def: 75, spa: 81, spd: 100, spe: 100 },
        weightkg: 19.9,
      },
      39: {
        name: `Jigglypuff`,
        types: [`Normal`],
        stats: { hp: 115, atk: 45, def: 20, spa: 45, spd: 25, spe: 20 },
        weightkg: 5.5,
      },
      40: {
        name: `Wigglytuff`,
        types: [`Normal`],
        stats: { hp: 140, atk: 70, def: 45, spa: 85, spd: 50, spe: 45 },
        weightkg: 12,
      },
      41: {
        name: `Zubat`,
        types: [`Poison`, `Flying`],
        stats: { hp: 40, atk: 45, def: 35, spa: 30, spd: 40, spe: 55 },
        weightkg: 7.5,
      },
      42: {
        name: `Golbat`,
        types: [`Poison`, `Flying`],
        stats: { hp: 75, atk: 80, def: 70, spa: 65, spd: 75, spe: 90 },
        weightkg: 55,
      },
      43: {
        name: `Oddish`,
        types: [`Grass`, `Poison`],
        stats: { hp: 45, atk: 50, def: 55, spa: 75, spd: 65, spe: 30 },
        weightkg: 5.4,
      },
      44: {
        name: `Gloom`,
        types: [`Grass`, `Poison`],
        stats: { hp: 60, atk: 65, def: 70, spa: 85, spd: 75, spe: 40 },
        weightkg: 8.6,
      },
      45: {
        name: `Vileplume`,
        types: [`Grass`, `Poison`],
        stats: { hp: 75, atk: 80, def: 85, spa: 110, spd: 90, spe: 50 },
        weightkg: 18.6,
      },
      46: {
        name: `Paras`,
        types: [`Bug`, `Grass`],
        stats: { hp: 35, atk: 70, def: 55, spa: 45, spd: 55, spe: 25 },
        weightkg: 5.4,
      },
      47: {
        name: `Parasect`,
        types: [`Bug`, `Grass`],
        stats: { hp: 60, atk: 95, def: 80, spa: 60, spd: 80, spe: 30 },
        weightkg: 29.5,
      },
      48: {
        name: `Venonat`,
        types: [`Bug`, `Poison`],
        stats: { hp: 60, atk: 55, def: 50, spa: 40, spd: 55, spe: 45 },
        weightkg: 30,
      },
      49: {
        name: `Venomoth`,
        types: [`Bug`, `Poison`],
        stats: { hp: 70, atk: 65, def: 60, spa: 90, spd: 75, spe: 90 },
        weightkg: 12.5,
      },
      50: {
        name: `Diglett`,
        types: [`Ground`],
        stats: { hp: 10, atk: 55, def: 25, spa: 35, spd: 45, spe: 95 },
        weightkg: 0.8,
      },
      51: {
        name: `Dugtrio`,
        types: [`Ground`],
        stats: { hp: 35, atk: 100, def: 50, spa: 50, spd: 70, spe: 120 },
        weightkg: 33.3,
      },
      52: {
        name: `Meowth`,
        types: [`Normal`],
        stats: { hp: 40, atk: 45, def: 35, spa: 40, spd: 40, spe: 90 },
        weightkg: 4.2,
      },
      53: {
        name: `Persian`,
        types: [`Normal`],
        stats: { hp: 65, atk: 70, def: 60, spa: 65, spd: 65, spe: 115 },
        weightkg: 32,
      },
      54: {
        name: `Psyduck`,
        types: [`Water`],
        stats: { hp: 50, atk: 52, def: 48, spa: 65, spd: 50, spe: 55 },
        weightkg: 19.6,
      },
      55: {
        name: `Golduck`,
        types: [`Water`],
        stats: { hp: 80, atk: 82, def: 78, spa: 95, spd: 80, spe: 85 },
        weightkg: 76.6,
      },
      56: {
        name: `Mankey`,
        types: [`Fighting`],
        stats: { hp: 40, atk: 80, def: 35, spa: 35, spd: 45, spe: 70 },
        weightkg: 28,
      },
      57: {
        name: `Primeape`,
        types: [`Fighting`],
        stats: { hp: 65, atk: 105, def: 60, spa: 60, spd: 70, spe: 95 },
        weightkg: 32,
      },
      58: {
        name: `Growlithe`,
        types: [`Fire`],
        stats: { hp: 55, atk: 70, def: 45, spa: 70, spd: 50, spe: 60 },
        weightkg: 19,
      },
      59: {
        name: `Arcanine`,
        types: [`Fire`],
        stats: { hp: 90, atk: 110, def: 80, spa: 100, spd: 80, spe: 95 },
        weightkg: 155,
      },
      60: {
        name: `Poliwag`,
        types: [`Water`],
        stats: { hp: 40, atk: 50, def: 40, spa: 40, spd: 40, spe: 90 },
        weightkg: 12.4,
      },
      61: {
        name: `Poliwhirl`,
        types: [`Water`],
        stats: { hp: 65, atk: 65, def: 65, spa: 50, spd: 50, spe: 90 },
        weightkg: 20,
      },
      62: {
        name: `Poliwrath`,
        types: [`Water`, `Fighting`],
        stats: { hp: 90, atk: 95, def: 95, spa: 70, spd: 90, spe: 70 },
        weightkg: 54,
      },
      63: {
        name: `Abra`,
        types: [`Psychic`],
        stats: { hp: 25, atk: 20, def: 15, spa: 105, spd: 55, spe: 90 },
        weightkg: 19.5,
      },
      64: {
        name: `Kadabra`,
        types: [`Psychic`],
        stats: { hp: 40, atk: 35, def: 30, spa: 120, spd: 70, spe: 105 },
        weightkg: 56.5,
      },
      65: {
        name: `Alakazam`,
        types: [`Psychic`],
        stats: { hp: 55, atk: 50, def: 45, spa: 135, spd: 95, spe: 120 },
        weightkg: 48,
      },
      66: {
        name: `Machop`,
        types: [`Fighting`],
        stats: { hp: 70, atk: 80, def: 50, spa: 35, spd: 35, spe: 35 },
        weightkg: 19.5,
      },
      67: {
        name: `Machoke`,
        types: [`Fighting`],
        stats: { hp: 80, atk: 100, def: 70, spa: 50, spd: 60, spe: 45 },
        weightkg: 70.5,
      },
      68: {
        name: `Machamp`,
        types: [`Fighting`],
        stats: { hp: 90, atk: 130, def: 80, spa: 65, spd: 85, spe: 55 },
        weightkg: 130,
      },
      69: {
        name: `Bellsprout`,
        types: [`Grass`, `Poison`],
        stats: { hp: 50, atk: 75, def: 35, spa: 70, spd: 30, spe: 40 },
        weightkg: 4,
      },
      70: {
        name: `Weepinbell`,
        types: [`Grass`, `Poison`],
        stats: { hp: 65, atk: 90, def: 50, spa: 85, spd: 45, spe: 55 },
        weightkg: 6.4,
      },
      71: {
        name: `Victreebel`,
        types: [`Grass`, `Poison`],
        stats: { hp: 80, atk: 105, def: 65, spa: 100, spd: 70, spe: 70 },
        weightkg: 15.5,
      },
      74: {
        name: `Geodude`,
        types: [`Rock`, `Ground`],
        stats: { hp: 40, atk: 80, def: 100, spa: 30, spd: 30, spe: 20 },
        weightkg: 20,
      },
      75: {
        name: `Graveler`,
        types: [`Rock`, `Ground`],
        stats: { hp: 55, atk: 95, def: 115, spa: 45, spd: 45, spe: 35 },
        weightkg: 105,
      },
      76: {
        name: `Golem`,
        types: [`Rock`, `Ground`],
        stats: { hp: 80, atk: 120, def: 130, spa: 55, spd: 65, spe: 45 },
        weightkg: 300,
      },
      77: {
        name: `Ponyta`,
        types: [`Fire`],
        stats: { hp: 50, atk: 85, def: 55, spa: 65, spd: 65, spe: 90 },
        weightkg: 30,
      },
      78: {
        name: `Rapidash`,
        types: [`Fire`],
        stats: { hp: 65, atk: 100, def: 70, spa: 80, spd: 80, spe: 105 },
        weightkg: 95,
      },
      79: {
        name: `Slowpoke`,
        types: [`Water`, `Psychic`],
        stats: { hp: 90, atk: 65, def: 65, spa: 40, spd: 40, spe: 15 },
        weightkg: 36,
      },
      80: {
        name: `Slowbro`,
        types: [`Water`, `Psychic`],
        stats: { hp: 95, atk: 75, def: 110, spa: 100, spd: 80, spe: 30 },
        weightkg: 78.5,
      },
      81: {
        name: `Magnemite`,
        types: [`Electric`],
        stats: { hp: 25, atk: 35, def: 70, spa: 95, spd: 55, spe: 45 },
        weightkg: 6,
      },
      82: {
        name: `Magneton`,
        types: [`Electric`],
        stats: { hp: 50, atk: 60, def: 95, spa: 120, spd: 70, spe: 70 },
        weightkg: 60,
      },
      84: {
        name: `Doduo`,
        types: [`Normal`, `Flying`],
        stats: { hp: 35, atk: 85, def: 45, spa: 35, spd: 35, spe: 75 },
        weightkg: 39.2,
      },
      85: {
        name: `Dodrio`,
        types: [`Normal`, `Flying`],
        stats: { hp: 60, atk: 110, def: 70, spa: 60, spd: 60, spe: 110 },
        weightkg: 85.2,
      },
      86: {
        name: `Seel`,
        types: [`Water`],
        stats: { hp: 65, atk: 45, def: 55, spa: 45, spd: 70, spe: 45 },
        weightkg: 90,
      },
      87: {
        name: `Dewgong`,
        types: [`Water`, `Ice`],
        stats: { hp: 90, atk: 70, def: 80, spa: 70, spd: 95, spe: 70 },
        weightkg: 120,
      },
      88: {
        name: `Grimer`,
        types: [`Poison`],
        stats: { hp: 80, atk: 80, def: 50, spa: 40, spd: 50, spe: 25 },
        weightkg: 30,
      },
      89: {
        name: `Muk`,
        types: [`Poison`],
        stats: { hp: 105, atk: 105, def: 75, spa: 65, spd: 100, spe: 50 },
        weightkg: 30,
      },
      90: {
        name: `Shellder`,
        types: [`Water`],
        stats: { hp: 30, atk: 65, def: 100, spa: 45, spd: 25, spe: 40 },
        weightkg: 4,
      },
      91: {
        name: `Cloyster`,
        types: [`Water`, `Ice`],
        stats: { hp: 50, atk: 95, def: 180, spa: 85, spd: 45, spe: 70 },
        weightkg: 132.5,
      },
      92: {
        name: `Gastly`,
        types: [`Ghost`, `Poison`],
        stats: { hp: 30, atk: 35, def: 30, spa: 100, spd: 35, spe: 80 },
        weightkg: 0.1,
      },
      93: {
        name: `Haunter`,
        types: [`Ghost`, `Poison`],
        stats: { hp: 45, atk: 50, def: 45, spa: 115, spd: 55, spe: 95 },
        weightkg: 0.1,
      },
      94: {
        name: `Gengar`,
        types: [`Ghost`, `Poison`],
        stats: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
        weightkg: 40.5,
      },
      95: {
        name: `Onix`,
        types: [`Rock`, `Ground`],
        stats: { hp: 35, atk: 45, def: 160, spa: 30, spd: 45, spe: 70 },
        weightkg: 210,
      },
      96: {
        name: `Drowzee`,
        types: [`Psychic`],
        stats: { hp: 60, atk: 48, def: 45, spa: 43, spd: 90, spe: 42 },
        weightkg: 32.4,
      },
      97: {
        name: `Hypno`,
        types: [`Psychic`],
        stats: { hp: 85, atk: 73, def: 70, spa: 73, spd: 115, spe: 67 },
        weightkg: 75.6,
      },
      100: {
        name: `Voltorb`,
        types: [`Electric`],
        stats: { hp: 40, atk: 30, def: 50, spa: 55, spd: 55, spe: 100 },
        weightkg: 10.4,
      },
      101: {
        name: `Electrode`,
        types: [`Electric`],
        stats: { hp: 60, atk: 50, def: 70, spa: 80, spd: 80, spe: 150 },
        weightkg: 66.6,
      },
      102: {
        name: `Exeggcute`,
        types: [`Grass`, `Psychic`],
        stats: { hp: 60, atk: 40, def: 80, spa: 60, spd: 45, spe: 40 },
        weightkg: 2.5,
      },
      103: {
        name: `Exeggutor`,
        types: [`Grass`, `Psychic`],
        stats: { hp: 95, atk: 95, def: 85, spa: 125, spd: 75, spe: 55 },
        weightkg: 120,
      },
      104: {
        name: `Cubone`,
        types: [`Ground`],
        stats: { hp: 50, atk: 50, def: 95, spa: 40, spd: 50, spe: 35 },
        weightkg: 6.5,
      },
      105: {
        name: `Marowak`,
        types: [`Ground`],
        stats: { hp: 60, atk: 80, def: 110, spa: 50, spd: 80, spe: 45 },
        weightkg: 45,
      },
      106: {
        name: `Hitmonlee`,
        types: [`Fighting`],
        stats: { hp: 50, atk: 120, def: 53, spa: 35, spd: 110, spe: 87 },
        weightkg: 49.8,
      },
      107: {
        name: `Hitmonchan`,
        types: [`Fighting`],
        stats: { hp: 50, atk: 105, def: 79, spa: 35, spd: 110, spe: 76 },
        weightkg: 50.2,
      },
      108: {
        name: `Lickitung`,
        types: [`Normal`],
        stats: { hp: 90, atk: 55, def: 75, spa: 60, spd: 75, spe: 30 },
        weightkg: 65.5,
      },
      109: {
        name: `Koffing`,
        types: [`Poison`],
        stats: { hp: 40, atk: 65, def: 95, spa: 60, spd: 45, spe: 35 },
        weightkg: 1,
      },
      110: {
        name: `Weezing`,
        types: [`Poison`],
        stats: { hp: 65, atk: 90, def: 120, spa: 85, spd: 70, spe: 60 },
        weightkg: 9.5,
      },
      111: {
        name: `Rhyhorn`,
        types: [`Ground`, `Rock`],
        stats: { hp: 80, atk: 85, def: 95, spa: 30, spd: 30, spe: 25 },
        weightkg: 115,
      },
      112: {
        name: `Rhydon`,
        types: [`Ground`, `Rock`],
        stats: { hp: 105, atk: 130, def: 120, spa: 45, spd: 45, spe: 40 },
        weightkg: 120,
      },
      113: {
        name: `Chansey`,
        types: [`Normal`],
        stats: { hp: 250, atk: 5, def: 5, spa: 35, spd: 105, spe: 50 },
        weightkg: 34.6,
      },
      114: {
        name: `Tangela`,
        types: [`Grass`],
        stats: { hp: 65, atk: 55, def: 115, spa: 100, spd: 40, spe: 60 },
        weightkg: 35,
      },
      115: {
        name: `Kangaskhan`,
        types: [`Normal`],
        stats: { hp: 105, atk: 95, def: 80, spa: 40, spd: 80, spe: 90 },
        weightkg: 80,
      },
      120: {
        name: `Staryu`,
        types: [`Water`],
        stats: { hp: 30, atk: 45, def: 55, spa: 70, spd: 55, spe: 85 },
        weightkg: 34.5,
      },
      121: {
        name: `Starmie`,
        types: [`Water`, `Psychic`],
        stats: { hp: 60, atk: 75, def: 85, spa: 100, spd: 85, spe: 115 },
        weightkg: 80,
      },
      122: {
        name: `Mr. Mime`,
        types: [`Psychic`],
        stats: { hp: 40, atk: 45, def: 65, spa: 100, spd: 120, spe: 90 },
        weightkg: 54.5,
      },
      123: {
        name: `Scyther`,
        types: [`Bug`, `Flying`],
        stats: { hp: 70, atk: 110, def: 80, spa: 55, spd: 80, spe: 105 },
        weightkg: 56,
      },
      124: {
        name: `Jynx`,
        types: [`Ice`, `Psychic`],
        stats: { hp: 65, atk: 50, def: 35, spa: 115, spd: 95, spe: 95 },
        weightkg: 40.6,
      },
      125: {
        name: `Electabuzz`,
        types: [`Electric`],
        stats: { hp: 65, atk: 83, def: 57, spa: 95, spd: 85, spe: 105 },
        weightkg: 30,
      },
      126: {
        name: `Magmar`,
        types: [`Fire`],
        stats: { hp: 65, atk: 95, def: 57, spa: 100, spd: 85, spe: 93 },
        weightkg: 44.5,
      },
      127: {
        name: `Pinsir`,
        types: [`Bug`],
        stats: { hp: 65, atk: 125, def: 100, spa: 55, spd: 70, spe: 85 },
        weightkg: 55,
      },
      128: {
        name: `Tauros`,
        types: [`Normal`],
        stats: { hp: 75, atk: 100, def: 95, spa: 40, spd: 70, spe: 110 },
        weightkg: 88.4,
      },
      129: {
        name: `Magikarp`,
        types: [`Water`],
        stats: { hp: 20, atk: 10, def: 55, spa: 15, spd: 20, spe: 80 },
        weightkg: 10,
      },
      130: {
        name: `Gyarados`,
        types: [`Water`, `Flying`],
        stats: { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81 },
        weightkg: 235,
      },
      131: {
        name: `Lapras`,
        types: [`Water`, `Ice`],
        stats: { hp: 130, atk: 85, def: 80, spa: 85, spd: 95, spe: 60 },
        weightkg: 220,
      },
      132: {
        name: `Ditto`,
        types: [`Normal`],
        stats: { hp: 48, atk: 48, def: 48, spa: 48, spd: 48, spe: 48 },
        weightkg: 4,
      },
      133: {
        name: `Eevee`,
        types: [`Normal`],
        stats: { hp: 55, atk: 55, def: 50, spa: 45, spd: 65, spe: 55 },
        weightkg: 6.5,
      },
      134: {
        name: `Vaporeon`,
        types: [`Water`],
        stats: { hp: 130, atk: 65, def: 60, spa: 110, spd: 95, spe: 65 },
        weightkg: 29,
      },
      135: {
        name: `Jolteon`,
        types: [`Electric`],
        stats: { hp: 65, atk: 65, def: 60, spa: 110, spd: 95, spe: 130 },
        weightkg: 24.5,
      },
      136: {
        name: `Flareon`,
        types: [`Fire`],
        stats: { hp: 65, atk: 130, def: 60, spa: 95, spd: 110, spe: 65 },
        weightkg: 25,
      },
      137: {
        name: `Porygon`,
        types: [`Normal`],
        stats: { hp: 65, atk: 60, def: 70, spa: 85, spd: 75, spe: 40 },
        weightkg: 36.5,
      },
      142: {
        name: `Aerodactyl`,
        types: [`Rock`, `Flying`],
        stats: { hp: 80, atk: 105, def: 65, spa: 60, spd: 75, spe: 130 },
        weightkg: 59,
      },
      143: {
        name: `Snorlax`,
        types: [`Normal`],
        stats: { hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30 },
        weightkg: 460,
      },
      144: {
        name: `Articuno`,
        types: [`Ice`, `Flying`],
        stats: { hp: 90, atk: 85, def: 100, spa: 95, spd: 125, spe: 85 },
        weightkg: 55.4,
      },
      145: {
        name: `Zapdos`,
        types: [`Electric`, `Flying`],
        stats: { hp: 90, atk: 90, def: 85, spa: 125, spd: 90, spe: 100 },
        weightkg: 52.6,
      },
      146: {
        name: `Moltres`,
        types: [`Fire`, `Flying`],
        stats: { hp: 90, atk: 100, def: 90, spa: 125, spd: 85, spe: 90 },
        weightkg: 60,
      },
      147: {
        name: `Dratini`,
        types: [`Dragon`],
        stats: { hp: 41, atk: 64, def: 45, spa: 50, spd: 50, spe: 50 },
        weightkg: 3.3,
      },
      148: {
        name: `Dragonair`,
        types: [`Dragon`],
        stats: { hp: 61, atk: 84, def: 65, spa: 70, spd: 70, spe: 70 },
        weightkg: 16.5,
      },
      149: {
        name: `Dragonite`,
        types: [`Dragon`, `Flying`],
        stats: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
        weightkg: 210,
      },
      150: {
        name: `Mewtwo`,
        types: [`Psychic`],
        stats: { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130 },
        weightkg: 122,
      },
      151: {
        name: `Mew`,
        types: [`Psychic`],
        stats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
        weightkg: 4,
      },
    };
  }))();
}
function Bn(e) {
  let t = Hn(e),
    n = (t >>> 31) & 1;
  if (((t &= 2147483647), t >= 1082535490)) {
    if (t >= 2146435072) return (t & 1048575) | Un(e) ? e + e : n === 0 ? e : 0;
    if (e > Kn) return 1 / 0;
    if (e < qn) return 0;
  }
  let r = 0,
    i = 0,
    a = 0;
  if (t > 1071001154) {
    if (t < 1072734898) {
      if (e === 1) return Math.E;
      ((r = n ? e + U : e - U), (i = n ? -W : W), (a = 1 - n - n));
    } else
      ((a = Math.trunc(Gn * e + (n ? -0.5 : 0.5))),
        (r = e - a * U),
        (i = a * W));
    e = r - i;
  } else if (t < 1043333120 && Yn + e > 1) return 1 + e;
  let o = e * e,
    s = e - o * (Zn + o * (Qn + o * ($n + o * (er + o * tr))));
  if (a === 0) return 1 - ((e * s) / (s - 2) - e);
  let c = 1 - (i - (e * s) / (2 - s) - r);
  return a >= -1021
    ? a === 1024
      ? c * 2 * H(2145386496, 0)
      : c * H((1023 + a) << 20, 0)
    : c * H((1023 + a + 1e3) << 20, 0) * Jn;
}
function Vn(e) {
  let t = Hn(e),
    n = Un(e),
    r = 0;
  if (t < 1048576) {
    if (!((t & 2147483647) | n)) return -1 / 0;
    if (t < 0) return NaN;
    ((r -= 54), (e *= Xn), (t = Hn(e)));
  }
  if (t >= 2146435072) return e + e;
  ((r += (t >> 20) - 1023), (t &= 1048575));
  let i = (t + 614244) & 1048576;
  ((e = Wn(e, t | (i ^ 1072693248))), (r += i >> 20));
  let a = e - 1;
  if ((1048575 & (2 + t)) < 3) {
    if (a === 0) return r === 0 ? 0 : r * U + r * W;
    let e = a * a * (0.5 - 0.3333333333333333 * a);
    return r === 0 ? a - e : r * U - (e - r * W - a);
  }
  let o = a / (2 + a),
    s = r,
    c = o * o;
  i = t - 398458;
  let l = c * c,
    u = 440401 - t,
    d = l * (rr + l * (ar + l * sr)),
    f = c * (nr + l * (ir + l * (or + l * cr)));
  i |= u;
  let p = f + d;
  if (i > 0) {
    let e = 0.5 * a * a;
    return r === 0
      ? a - (e - o * (e + p))
      : s * U - (e - (o * (e + p) + s * W) - a);
  }
  return r === 0 ? a - o * (a - p) : s * U - (o * (a - p) - s * W - a);
}
function B(e, t) {
  if (Number.isInteger(t) && Math.abs(t) <= 64) {
    let n = 1,
      r = e,
      i = Math.abs(t);
    for (; i > 0;) (i & 1 && (n *= r), (r *= r), (i >>= 1));
    return t < 0 ? 1 / n : n;
  }
  return Bn(t * Vn(e));
}
var V,
  Hn,
  Un,
  Wn,
  H,
  U,
  W,
  Gn,
  Kn,
  qn,
  Jn,
  Yn,
  Xn,
  Zn,
  Qn,
  $n,
  er,
  tr,
  nr,
  rr,
  ir,
  ar,
  or,
  sr,
  cr;
function lr() {
  return (lr = e(() => {
    ((V = new DataView(new ArrayBuffer(8))),
      (Hn = (e) => (V.setFloat64(0, e), V.getInt32(0))),
      (Un = (e) => (V.setFloat64(0, e), V.getUint32(4))),
      (Wn = (e, t) => (
        V.setFloat64(0, e),
        V.setInt32(0, t | 0),
        V.getFloat64(0)
      )),
      (H = (e, t) => (
        V.setUint32(0, e >>> 0),
        V.setUint32(4, t >>> 0),
        V.getFloat64(0)
      )),
      (U = H(1072049730, 4276092928)),
      (W = H(1038760431, 897137782)),
      (Gn = H(1073157447, 1697350398)),
      (Kn = H(1082535490, 4277811695)),
      (qn = H(3230091536, 3576508497)),
      (Jn = H(24117248, 0)),
      (Yn = 1e300),
      (Xn = H(1129316352, 0)),
      (Zn = H(1069897045, 1431655742)),
      (Qn = H(3211182444, 381599123)),
      ($n = H(1058100842, 2938494508)),
      (er = H(3199974721, 3318901745)),
      (tr = H(1046886249, 1925096656)),
      (nr = H(1071994197, 1431655827)),
      (rr = H(1071225241, 2576873988)),
      (ir = H(1070745892, 2485293913)),
      (ar = H(1070363077, 495876271)),
      (or = H(1070024292, 2529887198)),
      (sr = H(1069783561, 3497576095)),
      (cr = H(1069740306, 3745403460)));
  }))();
}
function ur(e, t) {
  let n = e.stages,
    r = n.length > 1,
    i = mr[n[0]].stats,
    a = mr[n[Math.min(Math.max(t - 1, +!!r), n.length - 1)]].stats,
    o = {},
    s = {};
  for (let e of hr)
    ((o[e] = B(a[e], G.soloPow)), (s[e] = Math.max(a[e] - i[e], G.floor)));
  let c = hr.reduce((e, t) => e + o[t], 0),
    l = hr.reduce((e, t) => e + s[t], 0),
    u = {};
  for (let e of hr)
    u[e] = r
      ? ((1 - G.evoDelta) * o[e]) / c + (G.evoDelta * s[e]) / l
      : o[e] / c;
  return u;
}
function dr(e) {
  let t = G.dmgM[e - 1] ?? 1;
  return { hp: G.hpM[e - 1] ?? 1, atk: t, spa: t, def: 1, spd: 1, spe: 1 };
}
function fr(e, t, n) {
  let r = Object.keys(t),
    i = r.reduce((e, r) => e + n[r] * t[r], 0),
    a = {};
  for (let n of r) a[n] = (e / i) * t[n];
  return a;
}
function pr(e, t, n) {
  if (t <= 1) return { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 };
  let r = `${e.id}|${t}|${+!!n}`,
    i = gr.get(r);
  if (i) return i;
  let a = G,
    o = t - 1,
    s = a.lineK[e.id] ?? 1,
    c = Vn(a.hpM[o]) * s,
    l = Vn(a.dmgM[o]) * s,
    u = ur(e, t),
    d = {
      hp: u.hp,
      def: u.def,
      spd: u.spd,
      dmg: n ? u.atk : u.spa,
      spe: u.spe,
    },
    f = { hp: 1, def: a.pPhys, spd: 1 - a.pPhys, dmg: 1, spe: 1 },
    p = d.hp + d.def + d.spd,
    m = d.dmg + d.spe,
    h = (e, t, n) => (1 - a.mix) * t + (a.mix * d[e]) / n,
    g = {
      ...fr(
        c,
        { hp: h(`hp`, 1, p), def: h(`def`, 0, p), spd: h(`spd`, 0, p) },
        f,
      ),
      ...fr(l, { dmg: h(`dmg`, 1, m), spe: h(`spe`, 0, m) }, f),
    },
    _ = p + m,
    v = fr(
      c + l,
      {
        hp: (1 - a.mix) * 0.5 + (a.mix * d.hp) / _,
        def: (a.mix * d.def) / _,
        spd: (a.mix * d.spd) / _,
        dmg: (1 - a.mix) * 0.5 + (a.mix * d.dmg) / _,
        spe: (a.mix * d.spe) / _,
      },
      f,
    ),
    y = (e) => Bn(g[e] + a.tilt * (v[e] - g[e])),
    ee = {
      hp: y(`hp`),
      atk: y(`dmg`),
      spa: y(`dmg`),
      def: y(`def`),
      spd: y(`spd`),
      spe: y(`spe`),
    };
  return (gr.set(r, ee), ee);
}
var mr, G, hr, gr;
function _r() {
  return (_r = e(() => {
    (zn(),
      lr(),
      (mr = Rn),
      (G = {
        hpM: [1, 1.6, 2.5],
        dmgM: [1, 1.6, 2.39],
        mix: 0.6,
        tilt: 0.35,
        pPhys: 0.6,
        soloPow: 2,
        evoDelta: 0.5,
        floor: 5,
        lineK: {
          snorlax: 0.82,
          chansey: 0.85,
          mewtwo: 0.93,
          machop: 1.06,
          voltorb: 1.08,
          jigglypuff: 1.05,
          mew: 1.05,
          pidgey: 1.1,
          ekans: 1.15,
        },
      }),
      (hr = [`hp`, `atk`, `def`, `spa`, `spd`, `spe`]),
      (gr = new Map()));
  }))();
}
function vr(e, t = !1) {
  return e === `snorlax`
    ? t
      ? [0.66, 0.33]
      : [q.snorlax.restAt]
    : e === `gyarados`
      ? [q.gyarados.flankAt, q.gyarados.beamAt]
      : e === `marowak`
        ? [q.marowak.scopeAt]
        : [0.66, 0.33];
}
function yr(e) {
  return {
    id: e.id,
    big: !!e.big,
    phase: Yr[e.id],
    next: e.id === `snorlax` ? 1 / 0 : q[e.id].first,
    restUntil: -1,
    marks: [...vr(e.id, e.big)],
    pending: null,
    n: 0,
    nextSwap: 1 / 0,
    veil: e.hidden && !e.unveiled ? 1 : 0,
    dive: null,
    side: -1,
    m: 0,
    revealUntil: -1,
    unveiled: !!e.unveiled,
    spare: e.spare ?? [],
    skillK: e.skillK ?? 1,
  };
}
function K(e, t, n) {
  let r = t.boss;
  r.phase !== n &&
    ((r.phase = n),
    e.emit({ k: `bossPhase`, t: e.time, uid: t.uid, phase: n }));
}
function br(e, t, n, r) {
  let i = t.boss;
  ((i.pending = { cells: n, at: e.time + q.windup, style: r }),
    i.n++,
    e.emit({
      k: `telegraph`,
      t: e.time,
      src: t.uid,
      cells: n,
      windup: q.windup,
      style: r,
    }));
}
function xr(e, t, n, r) {
  let i = t.boss,
    a = i.spare.length ? Ir(e, i.spare) : e,
    o = a.time;
  if (i.pending && o + 1e-9 >= i.pending.at) {
    let e = i.pending;
    ((i.pending = null),
      a.emit({ k: `slam`, t: o, src: t.uid, cells: e.cells, style: e.style }));
    let n = Qr[e.style]();
    i.skillK !== 1 && (n.power = (n.power ?? 0) * i.skillK);
    for (let r of a.foes(t))
      e.cells.includes(r.cell) &&
        (a.hit(t, r, n),
        e.style === `glitch` &&
          r.alive &&
          r.items.length &&
          a.itemOff(r, q.missingno.itemOff));
    (e.style === `beam` && a.recharge(t, q.gyarados.tired),
      e.style === `bone` && ((i.revealUntil = o + q.marowak.reveal), Fr(t)));
  }
  let s = t.hp / t.maxHp;
  i.id === `snorlax`
    ? Sr(a, t, o, s, r, n)
    : i.id === `gyarados`
      ? Rr(a, t, o, s, r, n)
      : i.id === `marowak`
        ? Br(a, t, o, s, r, n)
        : wr(a, t, o, s, r, n);
}
function Sr(e, t, n, r, i, a) {
  let o = t.boss,
    s = q.snorlax;
  if (o.phase === `sleep`) {
    if (r > 1 - s.wakeLost && n < s.wakeT) return;
    ((t.exposedT = 0),
      (t.exposedPct = 0),
      K(e, t, `awake`),
      (o.next = n + s.first),
      (o.m = Cr(e, t)),
      (t.atkCd = Math.max(t.atkCd, 0.4)));
  }
  if (o.phase === `rest`) {
    if (n < o.restUntil) return;
    (K(e, t, `awake`),
      (o.next = Math.max(o.next, n + s.first)),
      (o.m = Cr(e, t)));
  }
  o.marks.length && r <= o.marks[0]
    ? (o.marks.shift(),
      (o.pending = null),
      K(e, t, `rest`),
      (o.restUntil = n + s.restT),
      (t.exposedT = s.restT),
      (t.exposedPct = s.restExposed),
      e.heal(t, t.maxHp * s.restHeal))
    : i ||
      (!o.pending &&
        n >= o.next &&
        (o.m % 2 == 1
          ? br(e, t, ri, `quake`)
          : br(e, t, o.big && Math.floor(o.m / 2) % 2 == 1 ? ti : ei, `slam`),
        o.m++,
        (o.next = n + s.every)),
      Dr(e, t, a, s.range));
}
function Cr(e, t) {
  let n = 0,
    r = 0;
  for (let i of e.foes(t))
    ei.includes(i.cell) ? n++ : ri.includes(i.cell) && r++;
  return +(r > n);
}
function wr(e, t, n, r, i, a) {
  let o = t.boss,
    s = q.missingno;
  for (; o.marks.length && r <= o.marks[0];)
    o.marks.shift() > 0.5
      ? (K(e, t, `swap`), (o.nextSwap = n))
      : K(e, t, `unknown`);
  i ||
    (o.nextSwap <= n && ((o.nextSwap = n + s.swapEvery), Er(e, t)),
    !o.pending &&
      n >= o.next &&
      (br(e, t, Tr(e, t, o.phase === `unknown`), `glitch`),
      (o.next = n + (o.phase === `unknown` ? s.every3 : s.every))),
    Dr(e, t, a, s.range));
}
function Tr(e, t, n) {
  let r = q.missingno,
    i =
      (n ? r.nMin + 2 : r.nMin) +
      Math.floor(e.rand() * (r.nMax - (n ? r.nMin + 2 : r.nMin) + 1)),
    a = [...ni],
    o = [],
    s = e
      .foes(t)
      .filter((e) => e.items.length && L(e.cell) >= 4)
      .sort((e, t) => t.items.length - e.items.length || e.uid - t.uid)[0];
  for (
    s && (o.push(s.cell), a.splice(a.indexOf(s.cell), 1));
    o.length < i && a.length;
  )
    o.push(a.splice(Math.floor(e.rand() * a.length), 1)[0]);
  return o;
}
function Er(e, t) {
  let n = e.foes(t).filter((e) => !e.moving);
  if (n.length < 2) return;
  let r = n.reduce((e, t) =>
      t.dealt > e.dealt || (t.dealt === e.dealt && t.uid < e.uid) ? t : e,
    ),
    i = n
      .filter((e) => e !== r)
      .reduce((e, t) =>
        L(t.cell) < L(e.cell) || (L(t.cell) === L(e.cell) && t.uid < e.uid)
          ? t
          : e,
      );
  L(i.cell) >= L(r.cell) || e.swap(t, r, i);
}
function Dr(e, t, n, r) {
  let i,
    a = 1 / 0;
  for (let n of e.foes(t)) {
    if (t.scareNoT > 0 && n.uid === t.scareBy) continue;
    let o = e.dist(n.cell, t);
    if (o > r) continue;
    let s = o * 1e4 + n.hp;
    s < a && ((a = s), (i = n));
  }
  i &&
    ((t.target = i.uid),
    (t.atkCd -= n),
    t.atkCd <= 0 && (e.basic(t, i), (t.atkCd = e.interval(t))));
}
function Or(e) {
  let t = 0,
    n = 0;
  for (let r of e) {
    let e = R(r);
    ((t += e.x), (n += e.z));
  }
  return { x: t / e.length, z: n / e.length };
}
function kr(e, t, n) {
  let r = n ?? Or(e).x,
    i = Math.max(...e.map(L)) + 1,
    a = [];
  for (let e = 0; e < 56; e++)
    L(e) >= i && Math.abs(R(e).x - r) <= t * P + 1e-6 && a.push(e);
  return a;
}
function Ar(e, t, n) {
  let r = e.filter((e) => L(e) >= 4).map((e) => R(e).x),
    i = n,
    a = 0;
  for (let e of [...r].sort((e, t) => e - t)) {
    let o = r.filter((n) => Math.abs(n - e) <= t * P + 1e-6).length;
    (o > a || (o === a && Math.abs(e - n) < Math.abs(i - n) - 1e-6)) &&
      ((i = e), (a = o));
  }
  return i;
}
function jr(e) {
  let t = Array(8).fill(0);
  for (let n of e) t[L(n)]++;
  let n = 4;
  for (let e = 0; e < 8; e++)
    (t[e] > t[n] || (t[e] === t[n] && Math.abs(e - 4) < Math.abs(n - 4))) &&
      (n = e);
  return n;
}
function Mr(e) {
  let t = 0,
    n = 0;
  for (let r of e) {
    let e = R(r).x;
    e < -1e-6 ? t++ : e > 1e-6 && n++;
  }
  return n > t ? 1 : -1;
}
function Nr(e, t) {
  let n = Or(e),
    r = R(t),
    i = r.x - n.x,
    a = r.z - n.z,
    o = Math.sqrt(i * i + a * a) || 1,
    s = [];
  for (let t = N * 0.5; t < N * 24; t += N * 0.3) {
    let r = $t({ x: n.x + (i / o) * t, z: n.z + (a / o) * t }, N * 1.001);
    if (r < 0) {
      if (t > o) break;
    } else !e.includes(r) && !s.includes(r) && s.push(r);
  }
  return s;
}
function Pr(e) {
  let t;
  for (let n of e)
    (!t || n.hp < t.hp || (n.hp === t.hp && n.uid < t.uid)) && (t = n);
  return t;
}
function Fr(e) {
  ((e.boss.veil = 0), (e.untargetT = 0), (e.untargetKind = ``));
}
function Ir(e, t) {
  return Object.create(e, {
    foes: {
      value: (n) => {
        let r = e.foes(n),
          i = r.filter((e) => !t.includes(e.line));
        return i.length ? i : r;
      },
    },
  });
}
function Lr(e) {
  let t = [];
  for (let n of e)
    for (let r of an(n)) !e.includes(r) && !t.includes(r) && t.push(r);
  return t;
}
function Rr(e, t, n, r, i, a) {
  let o = t.boss,
    s = q.gyarados;
  if (o.dive) {
    if (n + 1e-9 < o.dive.at) {
      ((t.untargetT = Math.max(t.untargetT, 0.1)), (t.untargetKind = `burrow`));
      return;
    }
    let r = o.dive.to.every((n) => e.free(n) || t.foot.includes(n))
      ? o.dive.to
      : t.foot;
    ((o.dive = null), r !== t.foot && e.moveFoot(t, r), Fr(t));
    let i = Lr(t.foot);
    e.emit({ k: `slam`, t: n, src: t.uid, cells: i, style: `wave` });
    let a = $r();
    for (let n of e.foes(t)) i.includes(n.cell) && e.hit(t, n, a);
    ((o.next = n + s.first), (t.atkCd = Math.max(t.atkCd, 0.4)));
  } else if (o.marks.length && r <= o.marks[0]) {
    let n = o.marks.shift();
    ((o.pending = null),
      n > 0.5
        ? (K(e, t, `flank`),
          (o.side = Mr(e.foes(t).map((e) => e.cell))),
          zr(e, t, ai(o.side).concat(ai(-o.side))))
        : (K(e, t, `beam`), zr(e, t, [qr.gyarados, ...ai(-1), ...ai(1)])));
  } else if (!i) {
    if (!o.pending && n >= o.next) {
      if (o.phase === `flank` && o.big && o.m >= s.bigSwitch) {
        ((o.m = 0), (o.side = -o.side), zr(e, t, ai(o.side)));
        return;
      }
      o.phase === `rage`
        ? (br(
            e,
            t,
            kr(
              t.foot,
              0.8,
              Ar(
                e.foes(t).map((e) => e.cell),
                0.8,
                Or(t.foot).x,
              ),
            ),
            `wave`,
          ),
          (o.next = n + s.every))
        : o.phase === `flank`
          ? (o.m++,
            br(e, t, ii(jr(e.foes(t).map((e) => e.cell)), t.foot), `wave`),
            (o.next = n + s.every))
          : (br(e, t, kr(t.foot, 1.3), `beam`), (o.next = n + s.beamEvery));
    }
    Dr(e, t, a, s.range);
  }
}
function zr(e, t, n) {
  let r = t.boss,
    i =
      n.find((n) => n.every((n) => e.free(n) || t.foot.includes(n))) ?? t.foot;
  ((r.dive = { at: e.time + q.gyarados.dive, to: i }),
    (r.veil = 1),
    (t.untargetT = 0.1),
    (t.untargetKind = `burrow`),
    (t.target = -1),
    e.emit({
      k: `telegraph`,
      t: e.time,
      src: t.uid,
      cells: Lr(i),
      windup: q.gyarados.dive,
      style: `wave`,
    }));
}
function Br(e, t, n, r, i, a) {
  let o = t.boss,
    s = q.marowak;
  if (
    (o.marks.length &&
      r <= o.marks[0] &&
      (o.marks.shift(),
      K(e, t, `scope`),
      Fr(t),
      (o.next = Math.min(o.next, n + s.first))),
    o.phase === `ghost` &&
      !o.unveiled &&
      (n < o.revealUntil
        ? (o.veil = 0)
        : ((o.veil = 1),
          (t.untargetT = Math.max(t.untargetT, 0.1)),
          (t.untargetKind = `shadow`),
          (t.target = -1))),
    !i)
  ) {
    if (!o.pending && n >= o.next) {
      let r = Pr(e.foes(t));
      r &&
        (o.phase === `ghost`
          ? (br(e, t, [r.cell], `bone`), (o.next = n + s.every))
          : (br(e, t, Nr(t.foot, r.cell), `boomerang`),
            (o.next = n + s.boomEvery)));
    }
    (o.phase === `scope` || o.unveiled || n < o.revealUntil) &&
      Dr(e, t, a, s.range);
  }
}
function Vr(e, t, n) {
  let r = n.map((e) => e.cell);
  if (e === `snorlax`)
    return t
      ? [
          { cells: ei, style: `slam` },
          { cells: ri, style: `quake`, soft: !0 },
          { cells: ti, style: `slam`, soft: !0 },
        ]
      : [
          { cells: ei, style: `slam` },
          { cells: ri, style: `quake`, soft: !0 },
        ];
  if (e === `missingno`) {
    let e = n
      .filter((e) => e.items > 0 && L(e.cell) >= 4)
      .sort((e, t) => t.items - e.items)[0];
    return e ? [{ cells: [e.cell], style: `glitch` }] : [];
  }
  if (e === `gyarados`) {
    let e = qr.gyarados;
    return [
      { cells: kr(e, 0.8, Ar(r, 0.8, Or(e).x)), style: `wave` },
      { cells: ii(jr(r), e), style: `wave`, soft: !0 },
    ];
  }
  let i;
  for (let e of n) (!i || e.hp < i.hp) && (i = e);
  if (!i) return [];
  let a = i.cell;
  return [
    { cells: [a], style: `bone` },
    {
      cells: Nr(qr.marowak, a).filter((e) => e !== a),
      style: `boomerang`,
      soft: !0,
    },
  ];
}
var Hr,
  Ur,
  Wr,
  Gr,
  Kr,
  qr,
  q,
  Jr,
  Yr,
  Xr,
  Zr,
  Qr,
  $r,
  ei,
  ti,
  ni,
  ri,
  ii,
  ai,
  oi;
function si() {
  return (si = e(() => {
    (on(),
      (Hr = [`snorlax`, `missingno`, `gyarados`, `marowak`]),
      (Ur = (e) => typeof e == `string` && Hr.includes(e)),
      (Wr = {
        snorlax: `snorlax`,
        missingno: `snorlax`,
        gyarados: `snorlax`,
        marowak: `snorlax`,
      }),
      (Gr = {
        snorlax: { num: 143 },
        missingno: { num: 0, name: `MissingNo.`, types: [] },
        gyarados: { num: 130, name: `Gyarados`, types: [`Water`, `Flying`] },
        marowak: { num: 105, name: `Marowak`, types: [`Ground`] },
      }),
      (Kr = {
        snorlax: `snorlax`,
        missingno: null,
        gyarados: `magikarp`,
        marowak: `cubone`,
      }),
      (qr = {
        snorlax: [F(3, 3), F(3, 2), F(4, 2)],
        missingno: [F(3, 3), F(3, 2), F(4, 3)],
        gyarados: [F(3, 3), F(3, 2)],
        marowak: [F(3, 3), F(3, 2)],
      }),
      (q = {
        windup: 1.2,
        cc: 0.4,
        snorlax: {
          hp: 1.4,
          dmg: 15,
          dmgStar: 1,
          exposed: 0.2,
          wakeLost: 0.25,
          wakeT: 10,
          first: 1.2,
          every: 5,
          power: 150,
          stun: 1,
          quakePower: 35,
          restAt: 0.5,
          restT: 3,
          restHeal: 0.2,
          restExposed: 0.3,
          as: 0.65,
          range: 1,
        },
        missingno: {
          hp: 2.3,
          dmg: 10,
          dmgStar: 0,
          first: 2.5,
          every: 5,
          every3: 3.5,
          nMin: 6,
          nMax: 10,
          power: 110,
          itemOff: 3,
          swapEvery: 9,
          as: 0.8,
          range: 3,
        },
        gyarados: {
          hp: 1.8,
          dmg: 10,
          dmgStar: 1,
          hpBig: 1.6,
          dmgBig: 8,
          first: 1.5,
          every: 5,
          power: 140,
          stun: 0.5,
          flankAt: 0.66,
          dive: 1.2,
          splash: 90,
          bigSwitch: 2,
          beamAt: 0.33,
          beamEvery: 6.5,
          beamPower: 230,
          tired: 2.5,
          as: 0.7,
          range: 2,
        },
        marowak: {
          hp: 1.1,
          dmg: 12,
          dmgStar: 1,
          first: 2,
          every: 3.2,
          power: 170,
          stun: 0.6,
          reveal: 3,
          scopeAt: 0.5,
          boomEvery: 4.5,
          boomPower: 130,
          as: 0.8,
          range: 2,
        },
      }),
      (Jr = {
        slam: `Golpe Cuerpo`,
        glitch: `MissingNo.`,
        wave: `Cascada`,
        beam: `Hiperrayo`,
        bone: `Hueso Palo`,
        boomerang: `Huesomerang`,
        quake: `Terremoto`,
      }),
      (Yr = {
        snorlax: `sleep`,
        missingno: `glitch`,
        gyarados: `rage`,
        marowak: `ghost`,
      }),
      (Xr = () => ({
        name: `Golpe Cuerpo`,
        type: `Normal`,
        kind: `aoeSelf`,
        mana: 0,
        power: q.snorlax.power,
        stun: q.snorlax.stun,
        status: `flinch`,
      })),
      (Zr = () => ({
        name: `MissingNo.`,
        type: `Normal`,
        kind: `aoeTarget`,
        mana: 0,
        power: q.missingno.power,
        trueDmg: !0,
      })),
      (Qr = {
        slam: Xr,
        glitch: Zr,
        wave: () => ({
          name: `Cascada`,
          type: `Water`,
          kind: `aoeTarget`,
          mana: 0,
          power: q.gyarados.power,
          stun: q.gyarados.stun,
          status: `flinch`,
        }),
        beam: () => ({
          name: `Hiperrayo`,
          type: `Normal`,
          kind: `aoeTarget`,
          mana: 0,
          power: q.gyarados.beamPower,
        }),
        bone: () => ({
          name: `Hueso Palo`,
          type: `Ground`,
          kind: `aoeTarget`,
          mana: 0,
          power: q.marowak.power,
          stun: q.marowak.stun,
          status: `flinch`,
        }),
        boomerang: () => ({
          name: `Huesomerang`,
          type: `Ground`,
          kind: `aoeTarget`,
          mana: 0,
          power: q.marowak.boomPower,
        }),
        quake: () => ({
          name: `Terremoto`,
          type: `Ground`,
          kind: `aoeTarget`,
          mana: 0,
          power: q.snorlax.quakePower,
        }),
      }),
      ($r = () => ({
        name: `Cascada`,
        type: `Water`,
        kind: `aoeTarget`,
        mana: 0,
        power: q.gyarados.splash,
      })),
      (ei = [F(2, 4), F(3, 4), F(4, 4), F(5, 4), F(2, 5), F(3, 5), F(4, 5)]),
      (ti = [
        F(0, 3),
        F(1, 3),
        F(5, 3),
        F(6, 3),
        F(0, 4),
        F(1, 4),
        F(6, 4),
        F(0, 5),
        F(5, 5),
        F(6, 5),
      ]),
      (ni = Array.from({ length: 28 }, (e, t) =>
        F(t % 7, 4 + Math.floor(t / 7)),
      )),
      (ri = ni.filter((e) => !ei.includes(e))),
      (ii = (e, t) =>
        Array.from({ length: 7 }, (t, n) => F(n, e)).filter(
          (e) => !t.includes(e),
        )),
      (ai = (e) => {
        let t = e < 0 ? 0 : 6;
        return [
          [F(t, 3), F(t, 2)],
          [F(t, 2), F(t, 1)],
          [F(t, 1), F(t, 0)],
        ];
      }),
      (oi = (e, t) => !!e && e.spare.includes(t)));
  }))();
}
function ci(e, t) {
  var n;
  return ((n = ea[e]) == null ? void 0 : n[t - 1]) ?? 1;
}
function li(e, t, n, r = qa(e.cost), i = !1) {
  let a = sn[e.role].stats,
    o = a.blend,
    s = hn(n.stats.atk, a.atk, o),
    c = hn(n.stats.spa, a.spa, o),
    l = !i && e.id && e.stages,
    u = l ? pr(e, t, mi({ atk: s, spa: c }, e.role)) : dr(t),
    d = l ? ci(e.cost, t) : 1;
  return {
    maxHp: a.hp * pn(n.stats.hp) * u.hp * d * (1 + (r - 1) * Ga),
    atk: s * u.atk * d,
    def: hn(n.stats.def, a.def, o) * u.def,
    spa: c * u.spa * d,
    spd: hn(n.stats.spd, a.spd, o) * u.spd,
    as: a.as * mn(n.stats.spe) * u.spe,
    g: { atk: u.atk * d, spa: u.spa * d, def: u.def, spd: u.spd },
  };
}
function ui(e, t) {
  return li(e, t, Y[h(e, t).num]).g.atk;
}
function di(e, t, n) {
  let r = (t) => {
    let r = _(e, t);
    if (r.trueDmg) return 1;
    if (Gt[e.id] === `Ghost`) return 1.2;
    let i = li(e, t, Y[h(e, t).num]),
      a = n ?? Ui(r);
    return a.atk * Ei(i.atk / i.g.atk, Ja) + a.spa * Ei(i.spa / i.g.spa, Ja);
  };
  return r(t) / r(1);
}
function fi(e) {
  return (
    (Ei(e.def / e.g.def, Ja) * e.g.def) / (Ei(e.atk / e.g.atk, Ja) * e.g.atk)
  );
}
function pi(e, t) {
  let n = li(e, t, Y[h(e, t).num]);
  return fi({ atk: n.atk, def: n.def, g: n.g });
}
function mi(e, t) {
  return e.atk > e.spa || (e.atk === e.spa && t !== `special`);
}
function hi(e, t) {
  return mi(li(e, t, Y[h(e, t).num]), e.role);
}
function gi(e) {
  let t = _i(e);
  return { atk: t.atk, spa: t.spa };
}
function _i(e) {
  let t = { atk: 0, spa: 0, def: 0, spd: 0, as: 0, hp: 0 };
  for (let n of e) {
    let e = O(n) ? (k(n) ? [n] : (Lt[n] ?? [])) : [];
    for (let n of e) for (let e of Xa) Ya[e] === n && t[e]++;
  }
  return t;
}
function vi(e, t) {
  let [n, r] = e.axes ?? y,
    i = _i(t);
  return [i[n], i[r]];
}
function yi(e, t, n) {
  let r = e.flex;
  if (!r || !r.stars.includes(t)) return null;
  let [i, a] = vi(r, n);
  return i > a ? `phys` : a > i ? `spec` : r.def;
}
function bi(e, t, n) {
  let r = yi(e, t, n);
  return r ? ee(e.flex, r, t) : _(e, t);
}
function xi(e, t) {
  return Ui(_(e, t), { phys: hi(e, t) });
}
function Si(e, t) {
  return zi(_(e, t), { phys: hi(e, t) });
}
function Ci(e, t, n) {
  var r, i;
  let a = _(t, n),
    o = ((r = a.shieldEsc) == null ? void 0 : r.def) ?? a.dmgDef ?? 0,
    s = a.healHp || a.dmgHp || ((i = a.shieldEsc) != null && i.hp) ? 0.8 : 0;
  if ((!o && !s) || !O(e) || k(e)) return 0;
  let c = Lt[e] ?? [];
  return (
    0.6 * o * c.filter((e) => e === `iron`).length +
    s * c.filter((e) => e === `hp-up`).length
  );
}
function wi(e, t, n) {
  let r = t.flex;
  if (!r || !r.stars.includes(n) || !O(e) || k(e)) return 0;
  let i = Lt[e] ?? [],
    a = 0;
  for (let e of r.axes ?? y)
    (e === `def` || e === `spd` || e === `as` || e === `hp`) &&
      (a += 0.7 * i.filter((t) => t === Ya[e]).length);
  return a;
}
function Ti(e, t) {
  let n = xi(e, t);
  return n.atk > n.spa || (n.atk === n.spa && hi(e, t));
}
function Ei(e, t) {
  return Math.min(2, Math.max(0.5, (e + 40) / (t + 40)));
}
function Di(e, t, n, r) {
  let i =
      (t === `atk` && e.burnT > 0 ? 1 - 50 / 100 : 1) *
      (t === `atk` && e.atkDownT > 0 ? 1 - e.atkDownPct : 1),
    a =
      (n.sunderT > 0 ? Math.max(0, 1 - n.sunderPct) : 1) *
      (r === `spd` && n.spdDownT > 0 ? 1 - n.spdDownPct : 1);
  return ((Ei(e[t] / e.g[t], (n[r] * a) / n.g[r]) * e.g[t]) / n.g[r]) * i;
}
function Oi(e, t) {
  let n = t.sunderT > 0 ? Math.max(0, 1 - t.sunderPct) : 1;
  return (Ei(e.def / e.g.def, (t.def * n) / t.g.def) * e.g.def) / t.g.def;
}
function ki(e) {
  let t = e.sunderT > 0 ? Math.max(0, 1 - e.sunderPct) : 1;
  return Ei(Ja, (e.def * t) / e.g.def) / e.g.def;
}
function Ai(e, t) {
  (e.airborneT > 0 && (e.airborneT = Math.max(0, e.airborneT - t)),
    e.freezeT > 0 && (e.freezeT = Math.max(0, e.freezeT - t)),
    e.fearT > 0 && (e.fearT = Math.max(0, e.fearT - t)),
    e.rechargeT > 0 && (e.rechargeT = Math.max(0, e.rechargeT - t)),
    e.untargetT > 0 &&
      ((e.untargetT = Math.max(0, e.untargetT - t)),
      e.untargetT <= 0 && (e.untargetKind = ``)),
    e.camoT > 0 && (e.camoT = Math.max(0, e.camoT - t)),
    e.rootT > 0 && (e.rootT = Math.max(0, e.rootT - t)),
    e.scareNoT > 0 &&
      ((e.scareNoT = Math.max(0, e.scareNoT - t)),
      e.scareNoT <= 0 && (e.scareBy = -1)),
    e.spdDownT > 0 &&
      ((e.spdDownT = Math.max(0, e.spdDownT - t)),
      e.spdDownT <= 0 && (e.spdDownPct = 0)),
    e.exposedT > 0 && (e.exposedT = Math.max(0, e.exposedT - t)),
    e.markPct > 0 && !(e.stun > 0 && e.stunKind === `sleep`) && (e.markPct = 0),
    e.shellT > 0 &&
      ((e.shellT = Math.max(0, e.shellT - t)), e.shellT <= 0 && (e.shellK = 0)),
    e.atkDownT > 0 &&
      ((e.atkDownT = Math.max(0, e.atkDownT - t)),
      e.atkDownT <= 0 && (e.atkDownPct = 0)),
    e.barrierT > 0 &&
      ((e.barrierT = Math.max(0, e.barrierT - t)),
      e.barrierT <= 0 && ((e.barrierBasic = 0), (e.barrierAbility = 0))),
    e.insomT > 0 && (e.insomT = Math.max(0, e.insomT - t)),
    e.dreamSleep &&
      !(e.stun > 0 && e.stunKind === `sleep`) &&
      ((e.dreamSleep = !1), (e.insomT = Math.max(e.insomT, e.dreamInsom))),
    e.manaLockT > 0 && (e.manaLockT = Math.max(0, e.manaLockT - t)),
    e.blindT > 0 &&
      ((e.blindT = Math.max(0, e.blindT - t)), e.blindT <= 0 && (e.blindN = 0)),
    e.missT > 0 &&
      ((e.missT = Math.max(0, e.missT - t)), e.missT <= 0 && (e.missPct = 0)),
    e.confuseT > 0 && (e.confuseT = Math.max(0, e.confuseT - t)),
    e.wakeAt > 0 && e.stun <= 0 && (e.wakeAt = 0));
}
function ji(e) {
  let t = 0,
    n = 0;
  for (let r of e) {
    let e = R(r);
    ((t += e.x), (n += e.z));
  }
  return { x: t / e.length, z: n / e.length };
}
function Mi(e, t) {
  let n = qr[t.id];
  ((e.foot = [...n]),
    (e.cell = e.from = n[0]),
    (e.boss = yr(t)),
    (e.maxHp = e.hp = Math.max(1, Math.round(t.hp))),
    (e.costMult = t.dmg),
    (e.entry = ``),
    (e.entered = !0),
    (e.camoT = 0),
    (e.untargetT = 0),
    (e.untargetKind = ``),
    (e.mana = 0),
    (e.maxMana = 9999),
    (e.manaPerAttack = 0),
    (e.manaRegen = 0),
    (e.manaOnHit = 0),
    (e.guardK = 0),
    (e.range = q[t.id].range),
    (e.as *= q[t.id].as),
    t.id === `snorlax` &&
      ((e.exposedT = 1e6), (e.exposedPct = q.snorlax.exposed)));
  let r = Gr[t.id];
  r.name &&
    ((e.name = r.name),
    (e.num = r.num),
    (e.types = [...(r.types ?? [])]),
    (e.traits = []));
}
function Ni(e) {
  return {
    basicBonus: e.basicBonus,
    abilityBonus: e.abilityBonus,
    itemPhys: e.itemPhys,
    itemSpec: e.itemSpec,
    critChance: e.critChance,
    lifesteal: e.lifesteal,
    reflect: e.reflect,
    regenPct: e.regenPct,
    manaRefund: e.manaRefund,
    as: e.as,
    hitWound: e.hitWound,
    hitSunder: e.hitSunder,
    castSunder: e.castSunder,
    shieldBreak: e.shieldBreak,
    abilityCut: e.abilityCut,
    auraWound: e.auraWound,
    auraN: e.auraN,
    basicCut: e.basicCut,
    superK: e.superK,
    clayK: e.clayK,
  };
}
function Pi(e, t) {
  return {
    basicBonus: t.basicBonus - e.basicBonus,
    abilityBonus: t.abilityBonus - e.abilityBonus,
    itemPhys: t.itemPhys - e.itemPhys,
    itemSpec: t.itemSpec - e.itemSpec,
    critChance: t.critChance - e.critChance,
    lifesteal: t.lifesteal - e.lifesteal,
    reflect: t.reflect - e.reflect,
    regenPct: t.regenPct - e.regenPct,
    manaRefund: t.manaRefund - e.manaRefund,
    as: e.as > 0 ? t.as / e.as : 1,
    hitWound: t.hitWound - e.hitWound,
    hitSunder: t.hitSunder - e.hitSunder,
    castSunder: t.castSunder - e.castSunder,
    shieldBreak: t.shieldBreak - e.shieldBreak,
    abilityCut: t.abilityCut - e.abilityCut,
    auraWound: t.auraWound - e.auraWound,
    auraN: t.auraN - e.auraN,
    basicCut: t.basicCut - e.basicCut,
    superK: t.superK - e.superK,
    clayK: t.clayK - e.clayK,
  };
}
function Fi(e, t, n) {
  ((e.basicBonus += n * t.basicBonus),
    (e.abilityBonus += n * t.abilityBonus),
    (e.itemPhys += n * t.itemPhys),
    (e.itemSpec += n * t.itemSpec),
    (e.critChance += n * t.critChance),
    (e.lifesteal += n * t.lifesteal),
    (e.reflect += n * t.reflect),
    (e.regenPct += n * t.regenPct),
    (e.manaRefund += n * t.manaRefund),
    (e.hitWound += n * t.hitWound),
    (e.hitSunder += n * t.hitSunder),
    (e.castSunder += n * t.castSunder),
    (e.shieldBreak += n * t.shieldBreak),
    (e.abilityCut += n * t.abilityCut),
    (e.auraWound += n * t.auraWound),
    (e.auraN += n * t.auraN),
    (e.basicCut += n * t.basicCut),
    (e.superK += n * t.superK),
    (e.clayK += n * t.clayK),
    (e.as = n > 0 ? e.as * t.as : e.as / t.as));
}
function J(e, t) {
  let n = [];
  for (let r = 0; r < 56; r++) M(e, r) <= t && n.push(r);
  return n;
}
function Ii(e) {
  let t = new Map(),
    n = new Set();
  for (let r of e)
    if (!n.has(r.line)) {
      n.add(r.line);
      for (let e of v[r.line].traits) t.set(e, (t.get(e) ?? 0) + 1);
    }
  return t;
}
function Li(e, t, n) {
  let r = Gt[e.line];
  if (
    (r === `Ghost` &&
      ((e.ghost = !0),
      (e.noImmune = !0),
      (e.abilityBonus += Kt.dmg),
      (e.maxHp *= 1 - Kt.hpLoss)),
    r === `Dragon`)
  ) {
    let t = qt.boost;
    ((e.maxHp *= 1 + t / 100),
      (e.basicBonus += t),
      (e.abilityBonus += t),
      (e.as *= 1 + t / 100),
      (e.maxMana = Math.round(e.maxMana * (1 + qt.manaExtra))));
  }
  for (let n of e.traits) {
    let r = Ut(n, t.get(n) ?? 0);
    if (!r) continue;
    let i = j[n].values[r - 1];
    switch (n) {
      case `Normal`:
        ((e.basicBonus += i), (e.abilityBonus += i), (e.as *= 1 + i / 100));
        break;
      case `Fire`:
        e.onHitBurn = i;
        break;
      case `Water`:
        e.manaPerAttack += i;
        break;
      case `Grass`:
        e.regenPct = i;
        break;
      case `Electric`:
        e.shock = i * 6;
        break;
      case `Ice`:
        e.onHitSlow = i;
        break;
      case `Fighting`:
        ((e.basicBonus += i), (e.lifesteal += Wt));
        break;
      case `Poison`:
        e.onHitPoison = i;
        break;
      case `Ground`:
        e.dmgReduce = i / 100;
        break;
      case `Flying`:
        e.dodge = i / 100;
        break;
      case `Psychic`:
        e.abilityBonus += i;
        break;
      case `Bug`:
        e.as *= 1 + i / 100;
        break;
      case `Rock`:
        e.shield += (e.maxHp * i) / 100;
    }
  }
  let i = Ut(`Electric`, t.get(`Electric`) ?? 0);
  i && (e.mana = Math.min(e.maxMana, e.mana + j.Electric.values[i - 1]));
  let a = Ut(`Dragon`, t.get(`Dragon`) ?? 0);
  if (a) {
    let t = 1 + j.Dragon.values[a - 1] / 100;
    ((e.atkK *= t), (e.atk *= t), (e.spa *= t), (e.as *= t));
  }
  let o = Ut(`Ghost`, n.get(`Ghost`) ?? 0);
  if (o) {
    let t = 1 - j.Ghost.values[o - 1] / 100;
    ((e.defK *= t), (e.def *= t), (e.spd *= t));
  }
  e.hp = e.maxHp;
}
function Ri(e, t) {
  let n = zi(t, e);
  return e.abilityBonus + n.atk * e.itemPhys + n.spa * e.itemSpec;
}
function zi(e, t) {
  return e.esc ?? Ui(e, t);
}
function Bi(e, t) {
  switch (t) {
    case `poison`:
      return e.poisonT > 0;
    case `burn`:
      return e.burnT > 0;
    case `sleep`:
      return e.stun > 0 && e.stunKind === `sleep`;
    case `paralyze`:
      return e.parT > 0;
    case `freeze`:
      return e.freezeT > 0;
    case `confuse`:
      return e.confuseT > 0;
    case `sunder`:
      return e.sunderT > 0;
    case `half`:
      return e.hp < e.maxHp * 0.5;
    case `trapped`:
      return e.rootT > 0 || e.boundBy >= 0;
  }
}
function Vi(e, t, n) {
  let r = t.shieldEsc;
  return r
    ? (n +
        (r.def ?? 0) * e.def +
        (r.spd ?? 0) * e.spd +
        (r.hp ?? 0) * e.maxHp) *
        (1 + (e.clayK ?? 0) / 100)
    : n * Wi(e, t);
}
function Hi(e, t) {
  if (t.trueDmg || e.ghost) return null;
  let n = Ui(t, e);
  return n.spa <= 0 ? `atk` : n.atk <= 0 ? `spa` : `mix`;
}
function Ui(e, t) {
  return e.scale ?? (t && !t.phys ? eo : $a);
}
function Wi(e, t) {
  let n = zi(t, e);
  return (
    (1 + (n.atk * e.itemPhys + n.spa * e.itemSpec) / 100) *
    (1 + (e.clayK ?? 0) / 100)
  );
}
function Gi(e, t = new Map(), n = new Map()) {
  let r = { ...e };
  return (Li(r, t, n), qi(r), r);
}
function Ki(e, t) {
  let n = 0;
  for (let r of e.items) r === t && n++;
  return n;
}
function qi(e) {
  for (let t of e.items) {
    for (let n of yt(t)) Ji(e, n);
    Ji(e, t);
  }
}
function Ji(e, t) {
  switch (t) {
    case `leftovers`:
      e.regenPct += C.leftoversRegen;
      break;
    case `choice-band`:
      ((e.basicBonus += C.bandBasic), (e.itemPhys += C.bandBasic));
      break;
    case `choice-specs`:
      e.itemSpec += C.specsAbility;
      break;
    case `choice-scarf`:
      ((e.as *= 1 + C.scarfAs / 100), (e.itemAs += C.scarfAs));
      break;
    case `scope-lens`:
      e.critChance += C.scopeCrit;
      break;
    case `hp-up`:
      ((e.maxHp = Math.round(e.maxHp * (1 + C.hpUp / 100))), (e.hp = e.maxHp));
      break;
    case `protein`:
      ((e.basicBonus += C.protein), (e.itemPhys += C.protein));
      break;
    case `calcium`:
      e.itemSpec += C.calcium;
      break;
    case `carbos`:
      ((e.as *= 1 + C.carbos / 100), (e.itemAs += C.carbos));
      break;
    case `life-orb`:
      ((e.basicBonus += C.orbDmg), (e.abilityBonus += C.orbDmg));
      break;
    case `quick-claw`:
      ((e.mana = Math.min(e.maxMana, e.mana + e.maxMana * C.clawMana)),
        (e.manaRefund += C.clawRefund));
      break;
    case `shell-bell`:
      e.lifesteal += C.bellSteal;
      break;
    case `focus-sash`:
      e.sash++;
      break;
    case `rocky-helmet`:
      e.reflect += C.helmetReflect;
      break;
    case `iron`: {
      let t = 1 + C.iron / 100;
      ((e.ironK *= t), (e.def *= t));
      break;
    }
    case `zinc`: {
      let t = 1 + C.zinc / 100;
      ((e.zincK *= t), (e.spd *= t));
      break;
    }
    case `protector`:
      e.basicCut += C.protectorBasic;
      break;
    case `eviolite`:
      var n;
      if (
        e.star < (((n = v[e.line]) == null ? void 0 : n.stages.length) ?? 1)
      ) {
        let t = 1 + C.evioliteDef / 100;
        ((e.ironK *= t), (e.zincK *= t), (e.def *= t), (e.spd *= t));
      }
      break;
    case `sitrus-berry`:
      ((e.sitrus = !0), (e.sitrusK += C.sitrusHeal));
      break;
    case `expert-belt`:
      e.superK += C.expertBelt;
      break;
    case `light-clay`:
      e.clayK += C.lightClay;
      break;
    case `mental-herb`:
      e.herbN++;
      break;
    case `assault-vest`:
      e.abilityCut += C.vestAbility;
      break;
    case `flame-orb`:
      (e.auraN++, (e.auraWound += C.woundPct));
      break;
    case `razor-fang`:
      e.hitSunder += C.sunderPct;
      break;
    case `twisted-spoon`:
      e.castSunder += C.sunderPct;
      break;
    case `poison-barb`:
      ((e.hitWound += C.woundPct), (e.shieldBreak += C.barbShield));
  }
}
function Yi(e) {
  if (e.status) return e.status;
  switch (e.type) {
    case `Electric`:
      return `paralyze`;
    case `Psychic`:
      return `confuse`;
    case `Grass`:
    case `Normal`:
      return (e.stun ?? 0) >= 1.5 ? `sleep` : `paralyze`;
    case `Ghost`:
      return `paralyze`;
    default:
      return `flinch`;
  }
}
var Y,
  X,
  Z,
  Xi,
  Zi,
  Q,
  $,
  Qi,
  $i,
  ea,
  ta,
  na,
  ra,
  ia,
  aa,
  oa,
  sa,
  ca,
  la,
  ua,
  da,
  fa,
  pa,
  ma,
  ha,
  ga,
  _a,
  va,
  ya,
  ba,
  xa,
  Sa,
  Ca,
  wa,
  Ta,
  Ea,
  Da,
  Oa,
  ka,
  Aa,
  ja,
  Ma,
  Na,
  Pa,
  Fa,
  Ia,
  La,
  Ra,
  za,
  Ba,
  Va,
  Ha,
  Ua,
  Wa,
  Ga,
  Ka,
  qa,
  Ja,
  Ya,
  Xa,
  Za,
  Qa,
  $a,
  eo,
  to;
function no() {
  return (no = e(() => {
    (s(),
      m(),
      gn(),
      Ln(),
      Zt(),
      Ht(),
      zn(),
      ft(),
      on(),
      _r(),
      lr(),
      si(),
      re(),
      (Y = Rn),
      (X = 1 / 30),
      (Z = 1.06),
      (Xi = 0.3),
      (Zi = 2.6),
      (Q = 9),
      ($ = [1, 1.6, 2.5]),
      (Qi = 0.6),
      ($i = 8),
      (ea = {
        1: [1, 1, 1.36],
        2: [1, 1, 1.2],
        3: [1, 1.1, 1.2],
        4: [1, 1.2, 1.45],
        5: [1, 1.2, 1.5],
      }),
      (ta = 0.1),
      (na = 1.25),
      (ra = 0.75),
      (ia = `ditto`),
      (aa = 0.1),
      (oa = 0.25),
      (sa = 1),
      (ca = 0.5),
      (la = 0.5),
      (ua = 1),
      (da = 0.15),
      (fa = 0.55),
      (pa = 1.5),
      (ma = 45 / 1.03),
      (ha = 6),
      (ga = 0.3),
      (_a = 4),
      (va = 2.5),
      (ya = 0.3),
      (ba = 0.25),
      (xa = 5.5),
      (Sa = 4),
      (Ca = 0.15),
      (wa = 0.3),
      (Ta = 0.1),
      (Ea = 0.35),
      (Da = 10),
      (Oa = 7),
      (ka = 0.1),
      (Aa = 4),
      (ja = 3),
      (Ma = [2, 2, 2, 3, 3, 3, 4, 5]),
      (Na = 0.5),
      (Pa = {
        fire: `Fire`,
        spark: `Electric`,
        spore: `Grass`,
        toxic: `Poison`,
        sand: `Ground`,
        firespin: `Fire`,
        bind: `Normal`,
        smoke: `Normal`,
      }),
      (Fa = 0.6),
      (Ia = 0.25),
      (La = 0.12),
      (Ra = 3.5),
      (za = (e) => (e >= 1 ? 4 : 3)),
      (Ba = {
        burn: `Fire`,
        poison: `Poison`,
        paralyze: `Electric`,
        freeze: `Ice`,
        seed: `Grass`,
        powder: `Grass`,
        trap: `Ghost`,
      }),
      (Va = (e, t) => e.types.includes(Ba[t])),
      (Ha = 0.25),
      (Ua = 4),
      (Wa = class e {
        get limit() {
          return this.pvpClock ? 54 : 300;
        }
        get overtime() {
          return this.time >= 24;
        }
        constructor(e, t, n = 1, r) {
          (b(this, `units`, []),
            b(this, `events`, []),
            b(this, `time`, 0),
            b(this, `over`, !1),
            b(this, `winner`, -1),
            b(this, `overT`, -1),
            b(this, `timedOut`, !1),
            b(this, `pvpClock`, !1),
            b(this, `traits`, [new Map(), new Map()]),
            b(this, `payDay`, [0, 0]),
            b(this, `payHits`, [0, 0]),
            b(this, `weather`, void 0),
            b(this, `delayed`, []),
            b(this, `nextUid`, 1),
            b(this, `rngState`, void 0),
            b(this, `seed0`, void 0),
            b(this, `uidMap`, new Map()),
            b(this, `occ`, new Uint8Array(56)),
            b(this, `order`, []),
            b(this, `bfsPrev`, new Int16Array(56)),
            b(this, `bfsSeen`, new Uint8Array(56)),
            b(this, `bfsQueue`, new Int16Array(56)),
            b(this, `resets`, new Map()),
            b(this, `swapped`, new Map()),
            b(this, `telePlan`, new Map()),
            b(this, `zones`, []),
            b(this, `nextZone`, 1),
            b(this, `pending`, new Map()),
            b(this, `boltPlan`, new Map()),
            b(this, `bossU`, null),
            b(this, `started`, !1),
            b(this, `otStarted`, !1),
            b(this, `boomLoser`, -1),
            b(this, `binds`, []),
            b(this, `hostObj`, null),
            (this.rngState = n),
            (this.seed0 = n >>> 0),
            (this.weather = r === void 0 ? se(t) : r));
          for (let t of e) this.units.push(this.makeUnit(t, 0));
          for (let e of t) this.units.push(this.makeUnit(e, 1));
          for (let e of this.units)
            (this.uidMap.set(e.uid, e), this.occ[e.cell]++);
          for (let e of this.units)
            if (e.foot) {
              this.bossU = e;
              for (let t of e.foot) t !== e.cell && this.occ[t]++;
            }
          this.order = this.units.map((e, t) => t);
          let i = this.units.length;
          (this.units
            .map((e) => e)
            .sort(
              (e, t) =>
                this.jitter01(e.uid) - this.jitter01(t.uid) || e.uid - t.uid,
            )
            .forEach((e, t) => {
              e.atkCd = da + (fa * (t + this.jitter01(e.uid + 20973))) / i;
            }),
            (this.traits = [
              Ii(this.units.filter((e) => e.team === 0)),
              Ii(this.units.filter((e) => e.team === 1 && !e.boss)),
            ]));
        }
        rand() {
          let e = (this.rngState += 1831565813);
          return (
            (e = Math.imul(e ^ (e >>> 15), e | 1)),
            (e ^= e + Math.imul(e ^ (e >>> 7), e | 61)),
            ((e ^ (e >>> 14)) >>> 0) / 4294967296
          );
        }
        jitter01(e) {
          let t = (this.seed0 + Math.imul(e, 2654435769)) >>> 0;
          return (
            (t = Math.imul(t ^ (t >>> 16), 2146121005)),
            (t = Math.imul(t ^ (t >>> 15), 2221713035)),
            ((t ^ (t >>> 16)) >>> 0) / 4294967296
          );
        }
        makeUnit(e, t) {
          var n;
          let r = v[e.line],
            i = h(r, e.star),
            a = Y[i.num],
            o = yi(r, e.star, e.items ?? []),
            s = bi(r, e.star, e.items ?? []),
            c = !!e.shiny,
            l = c ? 1.1 : 1,
            u = li(r, e.star, a, qa(r.cost), !!e.boss),
            d = qa(r.cost),
            f = sn[r.role].stats,
            p = 1 + (e.boost ?? 0),
            m = Math.round(u.maxHp * l * p),
            g = t === 0 ? -1 : 1,
            _ = this.nextUid++,
            y = {
              uid: _,
              ownedId: e.ownedId,
              team: t,
              line: e.line,
              star: e.star,
              num: i.num,
              shiny: (t === 0 && i.shiny) || c,
              boosted: c,
              name: a.name,
              types: a.types,
              traits: r.traits,
              move: s,
              role: r.role,
              range: r.range,
              weightkg: a.weightkg,
              maxHp: m,
              hp: m,
              shield: 0,
              mana: Math.min(s.mana, s.start ?? 0),
              maxMana: s.mana,
              atk: u.atk * p,
              def: u.def * l * p,
              spa: u.spa * p,
              spd: u.spd * l * p,
              as: u.as * p,
              costMult: d,
              g: u.g,
              cell: e.cell,
              from: e.cell,
              moveT: 1,
              moving: !1,
              moveSpeed: Zi,
              target: -1,
              atkCd: da + fa * this.jitter01(_),
              stun: 0,
              stunKind: ``,
              airborneT: 0,
              freezeT: 0,
              fearT: 0,
              rechargeT: 0,
              ccImmune: 0,
              slowT: 0,
              slowPct: 0,
              parT: 0,
              burnT: 0,
              burnDps: 0,
              poisonT: 0,
              poisonDps: 0,
              buffAs: 0,
              buffDmg: 0,
              dodge: 0,
              dmgReduce: 0,
              manaPerAttack: 10,
              regenPct: 0,
              onHitBurn: 0,
              onHitPoison: 0,
              onHitSlow: 0,
              manaRegen: 0,
              manaOnHit: 1,
              basicBonus: c ? ta * 100 : 0,
              abilityBonus: c ? ta * 100 : 0,
              ghost: !1,
              noImmune: !1,
              shock: 0,
              atkK: p,
              defK: p,
              items: (e.items ?? []).filter(O),
              critChance: f.crit,
              lifesteal: 0,
              reflect: 0,
              sitrus: !1,
              sash: 0,
              sashT: 0,
              woundT: 0,
              woundPct: 0,
              sunderT: 0,
              sunderPct: 0,
              hitWound: 0,
              hitSunder: 0,
              castSunder: 0,
              shieldBreak: 0,
              abilityCut: 0,
              auraWound: 0,
              auraN: 0,
              auraT: 0,
              ironK: 1,
              zincK: 1,
              basicCut: 0,
              sitrusK: 0,
              superK: 0,
              clayK: 0,
              herbN: 0,
              alive: !0,
              wxMult: 1,
              wxHurt: !1,
              dealt: 0,
              taken: 0,
              mitigated: 0,
              healed: 0,
              shielded: 0,
              dealtAbility: 0,
              dotDealt: 0,
              dotTaken: 0,
              kos: 0,
              tAttack: -9,
              tHit: -9,
              tCast: -9,
              tFaint: -9,
              charging: !1,
              tCharge: -9,
              chargeTgt: -1,
              castWindup: ya,
              castActive: 0,
              castRecover: 0,
              recoverUntil: 0,
              faceX: 0,
              faceZ: g,
              retargetAt: 0,
              burnSrc: -1,
              poisonSrc: -1,
              dotAcc: 0,
              dotSrc: -1,
              dotT: 0,
              textT: -9,
              entry: r.entry ?? ``,
              entered: !r.entry,
              entryTgt: -1,
              entryCol: -1,
              diveCast: !1,
              camoT: r.entry === `stealth` ? 2 : 0,
              holdCell: -1,
              teleTo: -1,
              untargetT: r.entry === `swoop` ? 1.0333333333333334 : 0,
              untargetKind: r.entry === `swoop` ? `fly` : ``,
              rootT: 0,
              seedT: 0,
              seedDps: 0,
              seedSrc: -1,
              seedAcc: 0,
              exposedT: 0,
              exposedPct: 0,
              burstT: 0,
              burstLeft: 0,
              burstAbs: 0,
              burstPct: 0,
              manaLockT: 0,
              blindN: 0,
              blindT: 0,
              missT: 0,
              missPct: 0,
              confuseT: 0,
              confN: 0,
              parN: 0,
              wakeAt: 0,
              poisonGrow: 0,
              poisonMax: 0,
              guard: 0,
              guardK: s.retaliate ?? 0,
              charge: ((n = s.store) == null ? void 0 : n.start) ?? 0,
              tauntT: 0,
              tauntBy: -1,
              tauntAlt: -1,
              phys: mi(u, r.role),
              flexForm: o,
              spikeDps: 0,
              uses: 0,
              scareT: 0,
              scareBy: -1,
              scareNoT: 0,
              spdDownT: 0,
              spdDownPct: 0,
              markPct: 0,
              growAtk: 0,
              growSteal: 0,
              shellT: 0,
              shellK: 0,
              bindTo: -1,
              boundBy: -1,
              bindFree: 0,
              itemAs: 0,
              frenzyBounce: 0,
              frenzyBounceK: 0,
              confAcc: 0,
              atkDownT: 0,
              atkDownPct: 0,
              rageN: 0,
              dreamN: 0,
              dreamSleep: !1,
              dreamInsom: 0,
              insomT: 0,
              barrierT: 0,
              barrierBasic: 0,
              barrierAbility: 0,
              lastHitType: ``,
              boomed: !1,
              itemPhys: 0,
              itemSpec: 0,
              emp: null,
              empT: 0,
              frenzyAs: 0,
              frenzyT: 0,
              manaRefund: 0,
            };
          return (e.boss && Mi(y, e.boss), y);
        }
        start() {
          this.started = !0;
          for (let e of this.units) {
            Li(e, this.traits[e.team], this.traits[1 - e.team]);
            let t = this.bossU && e.items.length ? Ni(e) : null;
            (qi(e), t && (e.itemDelta = Pi(t, Ni(e))));
          }
          for (let e of this.units) this.applyWeather(e);
        }
        applyWeather(e) {
          let t = this.weather ? _e[this.weather] : null;
          t &&
            ((e.wxMult = 1),
            this.weather === `sand` &&
              e.types.includes(`Rock`) &&
              (e.spd *= he),
            (e.wxHurt = !!t.hurt && !e.types.some((e) => t.hurt.includes(e))));
        }
        wxMove(e) {
          let t = this.weather ? _e[this.weather] : null;
          return t ? (e === t.up ? 1 + pe : e === t.down ? 1 - me : 1) : 1;
        }
        byUid(e) {
          return this.uidMap.get(e);
        }
        emit(e) {
          this.events.push(e);
        }
        occupied(e) {
          return this.occ[e] > 0;
        }
        setCell(e, t) {
          (this.releaseHold(e),
            e.alive && (this.occ[e.cell]--, this.occ[t]++),
            (e.cell = t));
        }
        releaseHold(e) {
          e.holdCell < 0 || (this.occ[e.holdCell]--, (e.holdCell = -1));
        }
        walk(e, t) {
          let n = e.cell;
          ((e.from = n),
            this.setCell(e, t),
            (e.moveT = 0),
            (e.moving = !0),
            this.occ[n]++,
            (e.holdCell = n));
        }
        statusText(e, t, n) {
          this.time - e.textT < ua ||
            ((e.textT = this.time),
            this.emit({
              k: `text`,
              t: this.time,
              uid: e.uid,
              text: t,
              color: n,
            }));
        }
        step() {
          let t = X;
          this.time += t;
          let n = this.time;
          if (this.over) {
            this.postStep(t);
            return;
          }
          for (let e = this.delayed.length - 1; e >= 0; e--)
            if (this.delayed[e].t <= n) {
              let t = this.delayed[e];
              (this.delayed.splice(e, 1), t.fn());
            }
          (n >= 24 && !this.otStarted && this.overtimeStart(n),
            this.bossU && this.tickItemOff(t));
          let r = this.weather !== null && n >= 1 ? (ge * t) / Z : 0;
          (this.zones.length && this.tickZones(n),
            this.binds.length && this.tickBinds(n));
          let i = this.order;
          for (let e = i.length - 1; e > 0; e--) {
            let t = Math.floor(this.rand() * (e + 1)),
              n = i[e];
            ((i[e] = i[t]), (i[t] = n));
          }
          for (let a of i) {
            let i = this.units[a];
            if (
              !i.alive ||
              (i.burnT > 0 &&
                ((i.burnT -= t), this.dot(i, i.burnDps * t, i.burnSrc)),
              i.poisonT > 0 &&
                i.alive &&
                ((i.poisonT -= t),
                i.poisonGrow > 0 &&
                  ((i.poisonDps = Math.min(
                    i.poisonMax,
                    i.poisonDps + i.poisonGrow * t,
                  )),
                  i.poisonT <= 0 &&
                    ((i.poisonGrow = 0), (i.poisonMax = 0), (i.poisonDps = 0))),
                this.dot(i, i.poisonDps * t, i.poisonSrc)),
              i.seedT > 0 && i.alive && this.seedTick(i, t),
              r > 0 && i.wxHurt && i.alive && this.dot(i, i.maxHp * r, -1),
              !i.alive) ||
              (i.dotAcc > 0 && (i.dotT += t) >= la && this.flushDot(i),
              i.regenPct > 0 &&
                this.heal(i, ((i.maxHp * i.regenPct) / 100) * t, !1),
              i.woundT > 0 && (i.woundT -= t) <= 0 && (i.woundPct = 0),
              i.sunderT > 0 && (i.sunderT -= t) <= 0 && (i.sunderPct = 0),
              i.auraN > 0 &&
                i.sashT <= 0 &&
                (i.auraT += t) >= 1 &&
                (--i.auraT, this.flameAura(i)),
              !i.alive)
            )
              continue;
            (i.slowT > 0 && (i.slowT -= t) <= 0 && (i.slowPct = 0),
              i.parT > 0 && (i.parT -= t),
              i.tauntT > 0 && (i.tauntT -= t),
              i.burstT > 0 && (i.burstT -= t) <= 0 && this.shieldBurst(i),
              i.manaRegen > 0 &&
                !i.charging &&
                i.manaLockT <= 0 &&
                i.sashT <= 0 &&
                (i.mana = Math.min(i.maxMana, i.mana + i.manaRegen * t)));
            let o = i.stun > 0;
            if ((o && (i.stun -= t), Ai(i, t), i.boss)) {
              xr(this.host(), i, t, o);
              continue;
            }
            if (i.sashT > 0) {
              ((i.sashT = Math.max(0, i.sashT - t)),
                (i.untargetT = Math.max(i.untargetT, i.sashT)),
                i.charging && (i.tCharge += t),
                i.moving && this.advanceMove(i, t));
              continue;
            }
            if (i.scareT > 0) {
              ((i.scareT = Math.max(0, i.scareT - t)),
                i.charging && (i.tCharge += t),
                i.moving && this.advanceMove(i, t));
              continue;
            }
            if (i.moving) {
              this.advanceMove(i, t);
              continue;
            }
            if (o || (!i.entered && this.entryTick(i, n))) continue;
            if (i.charging) {
              if (n - i.tCharge < i.castWindup - 1e-6) continue;
              i.charging = !1;
              let t = this.byUid(i.chargeTgt),
                r = e.targetable(t) ? t : this.recastTarget(i, n);
              if (!r) continue;
              (r !== i && this.face(i, r),
                this.cast(i, r, this.pending.get(i.uid)));
              continue;
            }
            if (n < i.recoverUntil) continue;
            let s = this.chooseTarget(i, n);
            if (!s) continue;
            let c;
            if (
              i.tauntT > 0 &&
              s.uid === i.tauntBy &&
              i.rootT > 0 &&
              this.dist(i.cell, s) > i.range
            ) {
              let e = this.foesFor(i).filter(
                  (e) => this.dist(i.cell, e) <= i.range,
                ),
                t = e.length ? this.pickTarget(i, e) : void 0;
              t && (s = t);
            }
            if (
              i.tauntT > 0 &&
              s.uid === i.tauntBy &&
              i.rootT <= 0 &&
              this.dist(i.cell, s) > i.range
            ) {
              let e = s;
              if (
                ((c = this.bfs(
                  i.cell,
                  (t) => this.dist(t, e) <= i.range,
                  void 0,
                  1 / 0,
                  e.cell,
                )),
                c)
              )
                i.tauntAlt = -1;
              else {
                let t = this.tauntFallback(i);
                t
                  ? ((s = t), (c = void 0))
                  : (c = this.bfs(
                      i.cell,
                      () => !1,
                      (t) => this.dist(t, e),
                      this.dist(i.cell, e),
                      e.cell,
                    ));
              }
            }
            if ((this.face(i, s), this.dist(i.cell, s) <= i.range)) {
              if (i.mana >= i.maxMana) {
                this.startCharge(i, s);
                continue;
              }
              ((i.atkCd -= t * this.slowMul(i)),
                i.atkCd <= 0 &&
                  (this.basicAttack(i, s), (i.atkCd = this.baseInterval(i))));
            } else if (c !== void 0) c && this.walk(i, c.step);
            else if (i.rootT <= 0) {
              let e = this.bfs(
                i.cell,
                (e) => this.dist(e, s) <= i.range,
                void 0,
                1 / 0,
                s.cell,
              );
              if (!e) {
                let t = this.foesFor(i);
                if (
                  ((e = this.bfs(i.cell, (e) =>
                    t.some((t) => this.dist(e, t) <= i.range),
                  )),
                  e)
                ) {
                  let r = e.goal,
                    a = this.pickTarget(
                      i,
                      t.filter((e) => this.dist(r, e) <= i.range),
                    );
                  a && ((i.target = a.uid), (i.retargetAt = n + sa));
                } else
                  e = this.bfs(
                    i.cell,
                    () => !1,
                    (e) => this.dist(e, s),
                    this.dist(i.cell, s),
                    s.cell,
                  );
              }
              e && this.walk(i, e.step);
            }
          }
          let a = this.units.some((e) => e.alive && e.team === 0),
            o = this.units.some((e) => e.alive && e.team === 1);
          if (!a || !o || n >= this.limit) {
            ((this.over = !0),
              (this.overT = n),
              (this.winner =
                a && !o
                  ? 0
                  : o && !a
                    ? 1
                    : !a && !o && this.boomLoser >= 0
                      ? 1 - this.boomLoser
                      : -1),
              (this.timedOut = a && o),
              this.timedOut &&
                !this.pvpClock &&
                (this.winner = this.pveCapWinner()));
            for (let e of this.units)
              e.alive && e.dotAcc > 0 && this.flushDot(e);
            for (let e of this.zones)
              this.emit({ k: `zoneEnd`, t: n, id: e.id });
            if (((this.binds = []), (this.zones = []), this.timedOut)) {
              this.emit({ k: `timeup`, t: n });
              let e =
                this.units.find((e) => e.alive && e.team === 0) ??
                this.units.find((e) => e.alive);
              e &&
                this.emit({
                  k: `text`,
                  t: n,
                  uid: e.uid,
                  text: `¡Tiempo!`,
                  color: `#ffe066`,
                });
            }
            (this.emit({
              k: `end`,
              t: n,
              winner: this.winner,
              timeout: this.timedOut,
            }),
              (this.delayed = this.delayed.filter((e) => e.post)));
          }
        }
        pveCapWinner() {
          let e = (e) => {
            let t = 0,
              n = 0;
            for (let r of this.units)
              r.team === e &&
                ((n += r.maxHp), r.alive && (t += Math.max(0, r.hp)));
            return n > 0 ? t / n : 0;
          };
          return e(0) > e(1) ? 0 : 1;
        }
        overtimeStart(e) {
          ((this.otStarted = !0), this.emit({ k: `overtime`, t: e }));
          let t =
            this.units.find((e) => e.alive && e.team === 0) ??
            this.units.find((e) => e.alive);
          t &&
            (this.emit({
              k: `text`,
              t: e,
              uid: t.uid,
              text: `¡Tiempo extra!`,
              color: `#ff6b6b`,
            }),
            (t.textT = e));
        }
        postStep(e) {
          let t = this.time;
          for (let e = this.delayed.length - 1; e >= 0; e--)
            if (this.delayed[e].t <= t) {
              let t = this.delayed[e];
              (this.delayed.splice(e, 1), t.fn());
            }
          for (let t of this.units)
            t.alive &&
              (t.stun > 0 && (t.stun = Math.max(0, t.stun - e)),
              Ai(t, e),
              t.moving && this.advanceMove(t, e));
        }
        entryTick(e, t) {
          let n = () => ((e.entered = !0), !1);
          if (e.entry === `swoop`) return this.swoopTick(e, t);
          if (e.entry === `stealth`) return this.stealthTick(e, t);
          if (t < 0.399999999) return !0;
          if (e.tauntT > 0) return n();
          switch (e.entry) {
            case `leap`:
              return (this.leap(e), (e.entered = !0), e.moving);
            case `burrow`:
              return (this.tunnel(e), (e.entered = !0), !0);
            case `flyover`:
              return (this.flyover(e), (e.entered = !0), e.moving);
            case `rush`:
              return this.rushTick(e, t);
            case `open`: {
              if (
                ((e.entered = !0),
                e.mana < e.maxMana ||
                  !(e.move.pick || e.move.dive) ||
                  e.manaLockT > 0)
              )
                return !1;
              let n = this.pickTarget(e, this.foesFor(e));
              return n
                ? (this.face(e, n),
                  this.startCharge(e, n),
                  this.emit({
                    k: `entry`,
                    t,
                    uid: e.uid,
                    kind: `open`,
                    from: e.cell,
                    to: e.cell,
                    dur: 0,
                    dst: e.chargeTgt,
                  }),
                  !0)
                : !1;
            }
            default:
              return n();
          }
        }
        targetableFoes(e) {
          return this.units.filter(
            (t) =>
              t.alive && t.team !== e.team && t.untargetT <= 0 && t.camoT <= 0,
          );
        }
        static targetable(e) {
          return !!e && e.alive && e.untargetT <= 0 && e.camoT <= 0;
        }
        topDamage(e, t) {
          let n = (e) => v[e.line].cost * B(3, e.star - 1),
            r;
          for (let i of t)
            r
              ? (i.dealt - r.dealt ||
                  n(i) - n(r) ||
                  i.items.length - r.items.length ||
                  this.depth(e, i.cell) - this.depth(e, r.cell) ||
                  r.uid - i.uid) > 0 && (r = i)
              : (r = i);
          return r;
        }
        backmost(e, t) {
          return [...t].sort(
            (t, n) =>
              this.depth(e, n.cell) - this.depth(e, t.cell) ||
              t.hp - n.hp ||
              t.uid - n.uid,
          );
        }
        entryArrive(e, t, n) {
          ((e.target = t.uid),
            (e.entryTgt = t.uid),
            (e.retargetAt = this.time + 2),
            (e.atkCd = n),
            this.face(e, t));
        }
        leap(e) {
          let t = (t) => this.depth(e, t);
          for (let n of this.backmost(e, this.targetableFoes(e))) {
            let r = this.adj(n)
              .filter((e) => !this.occupied(e))
              .sort((n, r) => t(r) - t(n) || M(e.cell, n) - M(e.cell, r))[0];
            if (r === void 0) continue;
            let i = e.cell;
            ((e.from = e.cell),
              this.setCell(e, r),
              (e.moveT = 0),
              (e.moving = !0),
              (e.moveSpeed = Q),
              this.entryArrive(e, n, 0),
              this.statusText(e, `¡Ataque furtivo!`, `#b197fc`),
              this.emit({
                k: `entry`,
                t: this.time,
                uid: e.uid,
                kind: `leap`,
                from: i,
                to: r,
                dur: Math.max(1, M(i, r)) / Q,
                dst: n.uid,
              }));
            return;
          }
        }
        hiddenTrip(e, t, n, r, i) {
          let a = e.cell,
            o = this.landSpot(e, t, !1),
            s = o === a ? 0 : Math.max(i, Math.max(1, M(a, o)) / r);
          (this.relocate(e, o, s),
            (e.untargetT = s + ka + X),
            (e.untargetKind = n),
            this.emit({
              k: `burrow`,
              t: this.time,
              uid: e.uid,
              from: a,
              to: o,
              dur: s,
              mode: n,
              entry: !0,
            }),
            this.emit({
              k: `entry`,
              t: this.time,
              uid: e.uid,
              kind: n === `burrow` ? `burrow` : `swoop`,
              from: a,
              to: o,
              dur: s,
              dst: t.uid,
            }),
            this.entryArrive(e, t, ka));
        }
        tunnel(e) {
          let t = this.targetableFoes(e);
          if (!t.length) return;
          let n = t.reduce((t, n) =>
            n.maxHp < t.maxHp ||
            (n.maxHp === t.maxHp &&
              (this.depth(e, n.cell) > this.depth(e, t.cell) ||
                (this.depth(e, n.cell) === this.depth(e, t.cell) &&
                  n.uid < t.uid)))
              ? n
              : t,
          );
          this.hiddenTrip(e, n, `burrow`, ha, ga);
        }
        swoopTick(t, n) {
          let r = () => (
            (t.untargetT = Math.max(t.untargetT, 2 * X)),
            (t.untargetKind = `fly`),
            !0
          );
          if (n < 0.699999999) return r();
          let i = this.byUid(t.entryTgt);
          return (
            (!e.targetable(i) || i.team === t.team) &&
              ((i = this.topDamage(t, this.targetableFoes(t))),
              i &&
                ((t.entryTgt = i.uid),
                this.emit({
                  k: `entry`,
                  t: n,
                  uid: t.uid,
                  kind: `swoop`,
                  from: t.cell,
                  to: i.cell,
                  dur: 0,
                  dst: i.uid,
                  lock: !0,
                }))),
            n < 0.999999999
              ? r()
              : i
                ? ((t.entered = !0), this.hiddenTrip(t, i, `fly`, Q, X), !0)
                : n < 2.5
                  ? r()
                  : ((t.untargetT = 0),
                    (t.untargetKind = ``),
                    (t.entered = !0),
                    (t.entryTgt = -1),
                    !1)
          );
        }
        flyover(e) {
          let t = this.targetableFoes(e);
          if (!t.length) return;
          let n = I(e.cell),
            r = (e) =>
              Math.abs(I(e.cell) - n) * 100 +
              Math.abs(I(e.cell) - 3) * 10 +
              I(e.cell),
            i = t.reduce((e, t) => (r(t) < r(e) ? t : e)),
            a = t
              .filter((e) => I(e.cell) === I(i.cell))
              .reduce((t, n) =>
                this.depth(e, n.cell) > this.depth(e, t.cell) ||
                (this.depth(e, n.cell) === this.depth(e, t.cell) &&
                  n.uid < t.uid)
                  ? n
                  : t,
              ),
            o = e.cell,
            s = this.landSpot(e, a, !1);
          if (s === o) {
            this.entryArrive(e, a, 0);
            return;
          }
          let c = Math.max(1, M(o, s)) / _a;
          (this.relocate(e, s, c),
            this.emit({
              k: `entry`,
              t: this.time,
              uid: e.uid,
              kind: `flyover`,
              from: o,
              to: s,
              dur: c,
              dst: a.uid,
            }),
            this.entryArrive(e, a, 0));
        }
        stealthTick(e, t) {
          let n = () => ((e.entered = !0), !1);
          if (((e.entered = !0), e.tauntT > 0)) return !1;
          let r = I(e.cell),
            i = this.targetableFoes(e),
            a = this.backmost(e, i)[0],
            o = r < 3 ? 0 : r > 3 ? 6 : a && I(a.cell) < 3 ? 0 : 6;
          e.entryCol = o;
          let s = i.filter((e) => (o === 0 ? I(e.cell) <= 3 : I(e.cell) >= 3)),
            c = this.backmost(e, s.length ? s : i)[0];
          if (!c) return n();
          if (((e.entryTgt = c.uid), this.dist(e.cell, c) <= e.range))
            return ((e.camoT = 0), this.entryArrive(e, c, 0), !1);
          let l = this.adj(c).filter((e) => !this.occupied(e)),
            u = l.length
              ? l.reduce((t, n) => {
                  let r = Math.abs(I(t) - o),
                    i = Math.abs(I(n) - o);
                  return i < r ||
                    (i === r && this.depth(e, n) > this.depth(e, t))
                    ? n
                    : t;
                })
              : this.landSpot(e, c, !1);
          if (u === e.cell) return ((e.camoT = 0), !1);
          let d = L(u) * 7 + o,
            f = Math.max(1, M(e.cell, d) + M(d, u)),
            p = Math.min(3 - t, f / Zi),
            m = e.cell;
          return (
            this.relocate(e, u, p),
            (e.camoT = Math.max(e.camoT, p + X)),
            this.emit({
              k: `entry`,
              t,
              uid: e.uid,
              kind: `stealth`,
              from: m,
              to: u,
              dur: p,
              dst: c.uid,
            }),
            this.entryArrive(e, c, 0),
            this.later(
              p,
              () => {
                e.alive && (e.camoT = 0);
              },
              !0,
            ),
            !0
          );
        }
        rushTick(t, n) {
          let r = () => ((t.entered = !0), !1);
          if (n >= 1.9 - 1e-9) return r();
          let i = this.byUid(t.entryTgt);
          if (!e.targetable(i) || i.team === t.team) {
            let e = t.entryTgt < 0;
            ((i = this.backmost(t, this.targetableFoes(t))[0]),
              (t.entryTgt = (i == null ? void 0 : i.uid) ?? -1),
              i &&
                e &&
                this.emit({
                  k: `entry`,
                  t: n,
                  uid: t.uid,
                  kind: `rush`,
                  from: t.cell,
                  to: i.cell,
                  dur: 1.9 - n,
                  dst: i.uid,
                }));
          }
          if (!i) return r();
          if (this.dist(t.cell, i) <= t.range)
            return (this.entryArrive(t, i, 0), r());
          if (t.rootT > 0) return !0;
          let a = i,
            o =
              this.bfs(
                t.cell,
                (e) => this.dist(e, a) <= t.range,
                void 0,
                1 / 0,
                a.cell,
              ) ??
              this.bfs(
                t.cell,
                () => !1,
                (e) => this.dist(e, a),
                this.dist(t.cell, a),
                a.cell,
              );
          return !o &&
            this.foesFor(t).some((e) => this.dist(t.cell, e) <= t.range)
            ? r()
            : (o && (this.walk(t, o.step), (t.moveSpeed = Zi * va)), !0);
        }
        atkInterval(e) {
          return this.baseInterval(e) / this.slowMul(e);
        }
        baseInterval(e) {
          let t = this.time < e.frenzyT ? e.frenzyAs : 0;
          return 1 / (e.as * (1 + (e.buffAs + t) / 100));
        }
        slowMul(e) {
          return (
            1 - Math.max(e.slowT > 0 ? e.slowPct : 0, e.parT > 0 ? 50 : 0) / 100
          );
        }
        advanceMove(e, t) {
          ((e.moveT += (t * e.moveSpeed) / Math.max(1, M(e.from, e.cell))),
            e.moveT >= ca && this.releaseHold(e),
            e.moveT >= 1 &&
              ((e.moveT = 1),
              (e.moving = !1),
              (e.from = e.cell),
              (e.moveSpeed = Zi)));
        }
        chooseTarget(e, t) {
          if (e.tauntT > 0) {
            let t = this.byUid(e.tauntBy);
            if (t && t.alive && t.untargetT <= 0 && t.camoT <= 0)
              return ((e.target = t.uid), t);
            e.tauntT = 0;
          }
          let n = this.byUid(e.target);
          if (
            !n ||
            !n.alive ||
            n.untargetT > 0 ||
            n.camoT > 0 ||
            this.scaredOf(e, n)
          )
            return (
              (n = this.pickTarget(e, this.foesFor(e))),
              (e.target = (n == null ? void 0 : n.uid) ?? -1),
              (e.retargetAt = t + sa),
              n
            );
          if (this.dist(e.cell, n) <= e.range) return n;
          let r = this.foesFor(e).filter(
            (t) => this.dist(e.cell, t) <= e.range,
          );
          return (
            r.length && ((n = this.pickTarget(e, r)), (e.target = n.uid)),
            n
          );
        }
        tauntFallback(t) {
          let n = (n) =>
              e.targetable(n) && n.team !== t.team && n.uid !== t.tauntBy,
            r = this.byUid(t.tauntAlt);
          if (
            n(r) &&
            (this.dist(t.cell, r) <= t.range ||
              this.bfs(
                t.cell,
                (e) => this.dist(e, r) <= t.range,
                void 0,
                1 / 0,
                r.cell,
              ))
          )
            return r;
          let i = this.foesFor(t).filter(n),
            a = i.filter((e) => this.dist(t.cell, e) <= t.range),
            o = a.length ? this.pickTarget(t, a) : void 0;
          if (!o) {
            let e = this.bfs(t.cell, (e) =>
              i.some((n) => this.dist(e, n) <= t.range),
            );
            if (e) {
              let n = e.goal;
              o = this.pickTarget(
                t,
                i.filter((e) => this.dist(n, e) <= t.range),
              );
            }
          }
          return ((t.tauntAlt = (o == null ? void 0 : o.uid) ?? -1), o);
        }
        pickTarget(e, t) {
          let n,
            r = 1 / 0;
          for (let i of t) {
            let t =
              this.dist(e.cell, i) +
              (i.hp / i.maxHp) * 0.45 +
              this.rand() * 0.45;
            t < r && ((r = t), (n = i));
          }
          return n;
        }
        bfs(e, t, n, r = 1 / 0, i = -1, a) {
          let o = this.bfsPrev,
            s = this.bfsSeen,
            c = this.bfsQueue,
            l = this.occ;
          s.fill(0);
          let u = 0,
            d = 0;
          ((c[d++] = e), (s[e] = 1));
          let f = -1,
            p = r;
          for (; u < d;) {
            let r = c[u++];
            if (n && r !== e) {
              let e = n(r);
              e < p && ((p = e), (f = r));
            }
            if (r !== e && t(r)) {
              let t = r;
              for (; o[t] !== e;) t = o[t];
              return { step: t, goal: r };
            }
            for (let e of i >= 0 ? Za[r * 56 + i] : an(r))
              s[e] ||
                l[e] > 0 ||
                (a && !a(e)) ||
                ((s[e] = 1), (o[e] = r), (c[d++] = e));
          }
          if (f < 0) return null;
          let m = f;
          for (; o[m] !== e;) m = o[m];
          return { step: m, goal: f };
        }
        face(e, t) {
          let n = R(e.cell),
            r = t.foot ? ji(t.foot) : R(t.cell),
            i = r.x - n.x,
            a = r.z - n.z,
            o = Math.sqrt(i * i + a * a) || 1;
          ((e.faceX = i / o), (e.faceZ = a / o));
        }
        basicAttack(t, n) {
          t.tAttack = this.time;
          let r = o(t.range),
            i = null,
            a = 0;
          (t.emp && (this.time >= t.empT || t.emp.left <= 0) && (t.emp = null),
            t.emp &&
              n.team !== t.team &&
              ((i = t.emp),
              i.left--,
              (a = i.i++),
              i.left <= 0 && (t.emp = null)),
            t.parT > 0 && ++t.parN % 4 == 2
              ? (this.emit({
                  k: `text`,
                  t: this.time,
                  uid: t.uid,
                  text: `¡No se puede mover!`,
                  color: `#ffe066`,
                }),
                (t.textT = this.time))
              : t.confuseT > 0 && ++t.confN % 3 == 2
                ? this.confusedSelfHit(t)
                : (this.emit({
                    k: `attack`,
                    t: this.time,
                    src: t.uid,
                    dst: n.uid,
                    ranged: r,
                    type: t.move.type,
                    ...(i ? { emp: i.left } : {}),
                  }),
                  this.later(r ? oa : aa, () => {
                    if (!t.alive || !n.alive || n.untargetT > 0) return;
                    if (
                      t.blindN > 0 ||
                      (t.missT > 0 && this.rand() < t.missPct / 100)
                    ) {
                      (t.blindN > 0 && t.blindN--,
                        this.emit({
                          k: `miss`,
                          t: this.time,
                          src: t.uid,
                          dst: n.uid,
                        }));
                      return;
                    }
                    if (n.dodge > 0 && this.rand() < n.dodge) {
                      this.statusText(n, `¡El ataque falló!`, `#c9b8ff`);
                      return;
                    }
                    let r =
                        this.rand() < t.critChance || !!(i != null && i.crit),
                      o = pa + (r ? C.scopeCritDmg * Ki(t, `scope-lens`) : 0),
                      s =
                        !!(i != null && i.vsSleep) &&
                        n.team !== t.team &&
                        Bi(n, `sleep`),
                      c =
                        ma *
                        sn[t.role].stats.basicK *
                        t.costMult *
                        Di(t, `atk`, n, `def`) *
                        (1 + (t.basicBonus + t.buffDmg) / 100) *
                        (r ? o : 1) *
                        (i != null && i.hitType ? this.wxMove(i.hitType) : 1) *
                        (i ? 1 + i.dmg : 1) *
                        (s ? 1 + i.vsSleep : 1),
                      l = n.hp,
                      u = n.hp + n.shield,
                      d = n.spikeDps > 0 && n.shield > 0 && n.team !== t.team;
                    if (
                      (this.damage(
                        t,
                        n,
                        c,
                        !1,
                        i ? e.empEff(i, n) : 1,
                        r,
                        !1,
                        !!i,
                      ),
                      d && t.alive && this.applyPoison(n, t, n.spikeDps),
                      n.shield <= 0 && (n.spikeDps = 0),
                      n.reflect > 0 && t.alive)
                    ) {
                      let e = Math.max(0, l - Math.max(0, n.hp));
                      e > 0 && this.damage(n, t, (e * n.reflect) / Z, !1, 1);
                    }
                    if (
                      n.shellT > 0 &&
                      n.shellK > 0 &&
                      t.alive &&
                      n.team !== t.team
                    ) {
                      let e = Math.max(0, u - (Math.max(0, n.hp) + n.shield));
                      e > 0 && this.damage(n, t, (e * n.shellK) / Z, !1, 1);
                    }
                    (s && n.alive && Bi(n, `sleep`) && this.wakeUp(n, t),
                      t.frenzyBounce > 0 &&
                        this.time < t.frenzyT &&
                        n.team !== t.team &&
                        this.frenzyBounce(t, n, c, r),
                      i &&
                        this.empowerHit(
                          t,
                          n,
                          i,
                          a,
                          c,
                          r,
                          Math.max(0, l - Math.max(0, n.hp)),
                        ),
                      n.alive &&
                        (t.onHitBurn && this.applyBurn(t, n, t.onHitBurn, !0),
                        t.onHitPoison &&
                          this.applyPoison(t, n, t.onHitPoison, 0, !0),
                        t.onHitSlow &&
                          ((n.slowT = 2),
                          (n.slowPct = Math.max(n.slowPct, t.onHitSlow))),
                        t.hitWound > 0 &&
                          n.team !== t.team &&
                          this.applyWound(n, t.hitWound, C.barbWoundT),
                        t.hitSunder > 0 &&
                          n.team !== t.team &&
                          this.applySunder(n, t.hitSunder, C.fangSunderT)),
                      t.manaLockT <= 0 &&
                        n.team !== t.team &&
                        (t.mana = Math.min(
                          t.maxMana,
                          t.mana + t.manaPerAttack,
                        )),
                      t.items.includes(`life-orb`) &&
                        (t.hp = Math.max(
                          1,
                          t.hp - t.maxHp * C.orbRecoil * Ki(t, `life-orb`),
                        )));
                  })));
        }
        frenzyBounce(e, t, n, r) {
          let i = this.enemiesOf(e)
            .filter((e) => e !== t && M(e.cell, t.cell) <= 2)
            .sort(
              (e, n) => M(e.cell, t.cell) - M(n.cell, t.cell) || e.uid - n.uid,
            )
            .slice(0, e.frenzyBounce);
          i.length &&
            (this.emit({
              k: `chain`,
              t: this.time,
              src: e.uid,
              name: e.move.name,
              hops: [t.uid, ...i.map((e) => e.uid)],
              gap: Ta,
            }),
            i.forEach((t, i) =>
              this.later(0.1 + (i + 1) * Ta, () => {
                e.alive &&
                  t.alive &&
                  t.untargetT <= 0 &&
                  this.damage(e, t, n * e.frenzyBounceK, !1, 1, r);
              }),
            ));
        }
        growCast(e, t) {
          let n = t.grow;
          if (
            ((e.atk *= (1 + e.growAtk + n.atk) / (1 + e.growAtk)),
            (e.growAtk += n.atk),
            (e.lifesteal += n.steal),
            (e.growSteal += n.steal),
            !n.every || !n.sleep || e.uses % n.every !== 0)
          )
            return;
          let r = n.radius ?? 1,
            i = this.enemiesOf(e).filter((t) => this.dist(e.cell, t) <= r);
          for (let r of i)
            (this.emit({
              k: `strike`,
              t: this.time,
              src: e.uid,
              dst: r.uid,
              i: 0,
              n: 1,
              name: t.name,
            }),
              this.immune(r, `powder`) || this.applyStun(r, n.sleep, `sleep`));
        }
        startBind(e, t, n) {
          let r = n.bind;
          if (
            !e.alive ||
            !t.alive ||
            t.untargetT > 0 ||
            e.untargetT > 0 ||
            this.dist(e.cell, t) > 1 ||
            (!e.noImmune && z(n.type, t.types) === 0)
          )
            return;
          let i = !!(t.boss || t.foot);
          if (
            !i &&
            (e.bindTo >= 0 ||
              e.boundBy >= 0 ||
              t.boundBy >= 0 ||
              t.bindTo >= 0 ||
              this.time < t.bindFree ||
              Va(t, `trap`))
          )
            return;
          let a = {
              name: n.name,
              type: n.type,
              kind: `nuke`,
              mana: 0,
              power: r.squeeze,
              scale: n.scale,
              esc: n.esc,
            },
            o = Math.max(1, Math.round(r.dur / r.every)),
            s = {
              src: e.uid,
              tgt: t.uid,
              srcCell: e.cell,
              tgtCell: t.cell,
              until: this.time + r.dur + 2 * X,
              next: this.time + r.every,
              left: o,
              every: r.every,
              hit: a,
              poison: r.poison * $[e.star - 1],
              again: r.again,
              zone: -1,
              boss: i,
            };
          if (!i) {
            var c;
            ((e.bindTo = t.uid),
              (t.boundBy = e.uid),
              (e.target = t.uid),
              (t.tauntT = Math.max(t.tauntT, r.dur)),
              (t.tauntBy = e.uid),
              (t.target = e.uid),
              (e.rootT = Math.max(e.rootT, 2 * X)),
              (t.rootT = Math.max(t.rootT, 2 * X)),
              this.addZone(
                e,
                { ...n, zone: { kind: `bind`, dur: r.dur, anchor: !0 } },
                [t.cell],
                t,
              ),
              (s.zone =
                ((c = this.zones[this.zones.length - 1]) == null
                  ? void 0
                  : c.id) ?? -1));
          }
          this.binds.push(s);
        }
        tickBinds(e) {
          let t = !1;
          for (let n of this.binds) {
            let r = this.byUid(n.src),
              i = this.byUid(n.tgt),
              a =
                n.left <= 0 ||
                e >= n.until - 1e-9 ||
                !r ||
                !i ||
                !r.alive ||
                !i.alive ||
                r.untargetT > 0 ||
                i.untargetT > 0;
            (!a &&
              r &&
              i &&
              (a = n.boss
                ? this.dist(r.cell, i) > 1
                : r.cell !== n.srcCell ||
                  i.cell !== n.tgtCell ||
                  (r.stun > 0 && r.stunKind !== `flinch`) ||
                  r.airborneT > 0 ||
                  r.freezeT > 0 ||
                  r.fearT > 0 ||
                  r.scareT > 0 ||
                  (r.tauntT > 0 && r.tauntBy !== i.uid)),
              a
                ? (this.releaseBind(n, e), (t = !0))
                : (n.boss ||
                    ((r.rootT = Math.max(r.rootT, 2 * X)),
                    (i.rootT = Math.max(i.rootT, 2 * X))),
                  !(e + 1e-9 < n.next) &&
                    ((n.next += n.every),
                    n.left--,
                    this.emit({
                      k: `strike`,
                      t: e,
                      src: r.uid,
                      dst: i.uid,
                      i: 0,
                      n: 1,
                      name: n.hit.name,
                    }),
                    this.abilityHit(r, i, n.hit),
                    i.alive &&
                      n.poison > 0 &&
                      this.applyPoison(r, i, n.poison))));
          }
          t && (this.binds = this.binds.filter((e) => e.left >= 0));
        }
        releaseBind(e, t) {
          let n = this.byUid(e.src),
            r = this.byUid(e.tgt);
          if (((e.left = -1), e.boss)) return;
          (n && n.bindTo === e.tgt && (n.bindTo = -1),
            r &&
              (r.boundBy === e.src && (r.boundBy = -1),
              (r.bindFree = t + e.again),
              r.tauntBy === e.src && (r.tauntT = 0)));
          let i = this.zones.find((t) => t.id === e.zone);
          i && i.until > t && (i.until = t);
        }
        empowerHit(t, n, r, i, a, o, s) {
          var c;
          (r.steal > 0 && s > 0 && this.heal(t, s * r.steal, !1),
            r.cast &&
              n.alive &&
              n.team !== t.team &&
              this.abilityHit(t, n, r.cast),
            r.lastSpdDown &&
              i === r.n - 1 &&
              n.alive &&
              n.team !== t.team &&
              ((n.spdDownPct =
                n.spdDownT > 0
                  ? Math.max(n.spdDownPct, r.lastSpdDown)
                  : r.lastSpdDown),
              (n.spdDownT = Aa),
              this.emit({
                k: `text`,
                t: this.time,
                uid: n.uid,
                text: `¡Baja su Def. Esp.!`,
                color: `#f783ac`,
              }),
              (n.textT = this.time)));
          let l =
            (c = r.seq) != null && c.length ? r.seq[i % r.seq.length] : void 0;
          if (
            (l &&
              n.alive &&
              (l.burn &&
                (t.move.type === `Fire` && this.thaw(n),
                this.applyBurn(t, n, l.burn * $[t.star - 1])),
              l.slow &&
                ((n.slowT = 3), (n.slowPct = Math.max(n.slowPct, l.slow))),
              l.stun && this.applyStun(n, l.stun, l.status ?? `paralyze`)),
            r.stunLast > 0 &&
              i === r.n - 1 &&
              n.alive &&
              this.applyStun(n, r.stunLast, `paralyze`),
            r.bounce > 0)
          ) {
            let s = this.enemiesOf(t)
              .filter((e) => e !== n && M(e.cell, n.cell) <= 2)
              .sort(
                (e, t) =>
                  M(e.cell, n.cell) - M(t.cell, n.cell) || e.uid - t.uid,
              )
              .slice(0, r.bounce);
            s.length &&
              (this.emit({
                k: `chain`,
                t: this.time,
                src: t.uid,
                name: r.name,
                hops: [n.uid, ...s.map((e) => e.uid)],
                gap: Ta,
              }),
              s.forEach((n, s) =>
                this.later(0.1 + (s + 1) * Ta, () => {
                  !t.alive ||
                    !n.alive ||
                    n.untargetT > 0 ||
                    (this.damage(
                      t,
                      n,
                      a * r.bounceK,
                      !1,
                      e.empEff(r, n),
                      o,
                      !1,
                      !0,
                    ),
                    r.stunLast > 0 &&
                      i === r.n - 1 &&
                      n.alive &&
                      this.applyStun(n, r.stunLast, `paralyze`));
                }),
              ));
          }
          r.twice &&
            (this.emit({
              k: `strike`,
              t: this.time,
              src: t.uid,
              dst: t.uid,
              i: 1,
              n: 2,
              name: r.name,
            }),
            this.later(0.15, () => {
              t.alive &&
                n.alive &&
                n.untargetT <= 0 &&
                this.damage(t, n, a * r.twiceK, !1, e.empEff(r, n), o, !1, !0);
            }));
        }
        static empEff(e, t) {
          return e.hitType ? z(e.hitType, t.types) : 1;
        }
        confusedSelfHit(e) {
          ((e.tAttack = this.time),
            this.emit({
              k: `text`,
              t: this.time,
              uid: e.uid,
              text: `¡Se hirió a sí mismo!`,
              color: `#e599f7`,
            }),
            (e.textT = this.time));
          let t =
            ma * sn[e.role].stats.basicK * e.costMult * Di(e, `atk`, e, `def`);
          this.later(aa, () => {
            e.alive && this.damage(e, e, t, !1, 1);
          });
        }
        immune(e, t, n = !1) {
          return Va(e, t)
            ? (n || this.statusText(e, `¡No afecta a ${e.name}…!`, `#ced4da`),
              !0)
            : !1;
        }
        applyBurn(t, n, r, i = !1, a = 3) {
          e.dotBlocked(n) ||
            n.freezeT > 0 ||
            this.immune(n, `burn`, i) ||
            (n.burnT <= 0 && this.statusText(n, `¡Se ha quemado!`, `#ff922b`),
            (n.burnT = Math.max(a, a === 3 ? 0 : n.burnT)),
            (n.burnDps = Math.max(n.burnDps, r)),
            (n.burnSrc = t.uid));
        }
        applyPoison(t, n, r, i = 0, a = !1) {
          e.dotBlocked(n) ||
            this.immune(n, `poison`, a) ||
            (n.poisonT <= 0 &&
              this.statusText(n, `¡Ha sido envenenado!`, `#cc5de8`),
            (n.poisonT = 4),
            (n.poisonDps = Math.max(n.poisonDps, r)),
            (n.poisonSrc = t.uid),
            i > r
              ? ((n.poisonMax = Math.max(n.poisonMax, i)),
                (n.poisonGrow = Math.max(n.poisonGrow, (i - r) / 4)))
              : n.poisonGrow > 0 && (n.poisonMax = Math.max(n.poisonMax, r)));
        }
        mentalHerb(e) {
          return e.herbN <= 0 || !e.alive
            ? !1
            : (e.herbN--,
              this.emit({
                k: `text`,
                t: this.time,
                uid: e.uid,
                text: `¡Hierba Mental!`,
                color: `#69db7c`,
              }),
              (e.textT = this.time),
              !0);
        }
        applyStun(e, t, n, r = !1) {
          if (n === `paralyze`) {
            this.applyParalyze(e, t);
            return;
          }
          if (
            (!r && this.time < e.ccImmune) ||
            (!r && n !== `flinch` && e.stun <= 0 && this.mentalHerb(e))
          )
            return;
          r || (t = Math.min(t, Ra) * (e.boss ? q.cc : 1));
          let i = e.stun <= 0;
          if (
            ((e.stun = Math.max(e.stun, t)),
            (e.wakeAt = 0),
            r || (e.ccImmune = this.time + e.stun + 1),
            (i || n !== `flinch`) && (e.stunKind = n),
            !i)
          )
            return;
          let [a, o] = to[n];
          this.statusText(e, a, o);
        }
        applyParalyze(e, t) {
          if (
            !e.alive ||
            t <= 0 ||
            this.immune(e, `paralyze`) ||
            (e.parT <= 0 && this.mentalHerb(e))
          )
            return;
          let n = e.parT <= 0;
          if (
            (n && (e.parN = 0),
            (e.parT = Math.max(e.parT, za(t) * (e.boss ? q.cc : 1))),
            !n)
          )
            return;
          let [r, i] = to.paralyze;
          this.statusText(e, r, i);
        }
        hardCC(e, t, n, r, i = !1) {
          return !e.alive ||
            t <= 0 ||
            (!i && this.time < e.ccImmune) ||
            (n === `freeze` &&
              (this.immune(e, `freeze`) || this.weather === `sun`)) ||
            (!i && e.stun <= 0 && this.mentalHerb(e))
            ? !1
            : (i || (t = Math.min(t, Ra) * (e.boss ? q.cc : 1)),
              (e.stun = Math.max(e.stun, t)),
              (e.stunKind = ``),
              (e.wakeAt = 0),
              n === `airborne`
                ? (e.airborneT = Math.max(e.airborneT, t))
                : n === `freeze`
                  ? (e.freezeT = Math.max(e.freezeT, t))
                  : n === `fear`
                    ? (e.fearT = Math.max(e.fearT, t))
                    : (e.rechargeT = Math.max(e.rechargeT, t)),
              i || (e.ccImmune = this.time + e.stun + 1),
              this.emit({
                k: `cc`,
                t: this.time,
                uid: e.uid,
                src: r.uid,
                cc: n,
                dur: t,
              }),
              !0);
        }
        thaw(e) {
          e.freezeT <= 0 ||
            ((e.stun = Math.max(0, e.stun - e.freezeT)), (e.freezeT = 0));
        }
        applyConfuse(e, t, n) {
          !e.alive ||
            t <= 0 ||
            e.boss ||
            (e.confuseT <= 0 && this.mentalHerb(e)) ||
            (e.confuseT <= 0 && (e.confN = 0),
            (e.confuseT = Math.max(e.confuseT, t)),
            this.emit({
              k: `confuse`,
              t: this.time,
              src: n.uid,
              uid: e.uid,
              dur: t,
            }));
        }
        applyManaLock(e, t, n, r) {
          if (!t.alive) return;
          let i = r ? Math.round(t.mana) : 0;
          (r && (t.mana = 0),
            (n = Math.min(n, Ra)),
            (t.manaLockT = Math.max(t.manaLockT, n)));
          let a = !1;
          (r &&
            t.charging &&
            ((t.charging = !1),
            (a = !0),
            this.pending.delete(t.uid),
            this.boltPlan.delete(t.uid),
            this.telePlan.delete(t.uid),
            t.teleTo >= 0 && (t.teleTo = -1),
            t.untargetT > 0 && ((t.untargetT = 0), (t.untargetKind = ``))),
            this.emit({
              k: `manaLock`,
              t: this.time,
              src: e.uid,
              uid: t.uid,
              dur: n,
              drained: i,
              cut: a,
            }));
        }
        static fragileAsleep(e) {
          return e.wakeAt > 0 && e.stun > 0 && e.stunKind === `sleep`;
        }
        sleepFragile(e) {
          e.stun > 0 && e.stunKind === `sleep` && (e.wakeAt = this.time + Ha);
        }
        wakeUp(e, t) {
          ((e.stun = 0),
            (e.stunKind = ``),
            (e.wakeAt = 0),
            (e.ccImmune = this.time + 1),
            this.emit({
              k: `sleepBreak`,
              t: this.time,
              src: t.uid,
              uid: e.uid,
            }));
        }
        cleanse(e, t) {
          let n = t,
            r = (e, t) => {
              n > 0 && e && (t(), n--);
            };
          (r(e.stun > 0 && e.stunKind === `sleep` && e.exposedT <= 0, () => {
            ((e.stun = 0), (e.stunKind = ``), (e.wakeAt = 0), (e.markPct = 0));
          }),
            r(e.confuseT > 0, () => {
              e.confuseT = 0;
            }),
            r(e.parT > 0, () => {
              e.parT = 0;
            }),
            r(e.poisonT > 0, () => {
              ((e.poisonT = 0),
                (e.poisonDps = 0),
                (e.poisonGrow = 0),
                (e.poisonMax = 0));
            }),
            r(e.burnT > 0, () => {
              ((e.burnT = 0), (e.burnDps = 0));
            }),
            r(e.sunderT > 0, () => {
              ((e.sunderT = 0), (e.sunderPct = 0));
            }),
            r(e.woundT > 0, () => {
              ((e.woundT = 0), (e.woundPct = 0));
            }));
        }
        haze(e, t) {
          let n = Math.round(t.shield);
          ((t.shield = 0),
            (t.burstT = 0),
            (t.burstLeft = 0),
            (t.burstAbs = 0),
            (t.buffAs = 0),
            (t.buffDmg = 0),
            t.growAtk > 0 && ((t.atk /= 1 + t.growAtk), (t.growAtk = 0)),
            t.growSteal > 0 &&
              ((t.lifesteal -= t.growSteal), (t.growSteal = 0)),
            this.emit({
              k: `haze`,
              t: this.time,
              src: e.uid,
              uid: t.uid,
              shield: n,
            }));
        }
        depth(e, t) {
          return e.team === 0 ? 3 - L(t) : L(t) - 4;
        }
        selectTarget(e, t, n, r) {
          let i = (r ?? this.targetableFoes(e)).filter(
            (t) => !this.scaredOf(e, t) && t.camoT <= 0,
          );
          if (!i.length) return;
          let a = (e) => i.reduce((t, n) => (e(n) > e(t) ? n : t));
          switch (t) {
            case `lowHp`:
              return a((e) => -e.hp);
            case `hurt`:
              return a((e) => -e.hp / e.maxHp);
            case `highHp`:
              return a((e) => e.hp);
            case `back`:
              return a((t) => this.depth(e, t.cell) * 1e5 - t.hp);
            case `far`:
              return a((t) => M(e.cell, t.cell) * 1e5 - t.hp);
            case `carry`:
              return a(
                (e) => e.dealt + v[e.line].cost * B(3, e.star - 1) * 0.01,
              );
            case `cluster`:
              return a(
                (t) =>
                  i.filter((e) => M(e.cell, t.cell) <= 1).length * 1e5 -
                  M(e.cell, t.cell) * 100 -
                  t.hp / 1e4,
              );
            case `mana`:
              return a(
                (t) =>
                  (t.manaLockT > 0 ? 0 : t.mana / Math.max(1, t.maxMana)) *
                    1e4 +
                  t.maxMana -
                  M(e.cell, t.cell) * 0.01,
              );
            case `hitter`:
              return a(
                (e) =>
                  e.dealt -
                  e.dealtAbility +
                  v[e.line].cost * B(3, e.star - 1) * 0.01,
              );
            case `poisoned`:
              return a((e) => (e.poisonT > 0 ? 1e6 : 0) - e.hp);
            default:
              return n && n.alive ? n : this.pickTarget(e, i);
          }
        }
        shapeCells(e, t, n, r = 4.5, i = 1) {
          let a = [];
          if (n === `board`) {
            for (let e = 0; e < 56; e++) a.push(e);
            return a;
          }
          if (n === `row`) {
            let n = L(t.cell),
              r = L(t.cell) >= L(e.cell) ? 1 : -1;
            for (let e = 0; e < 56; e++) {
              let t = (L(e) - n) * r;
              t >= 0 && t < i && a.push(e);
            }
            return a;
          }
          let o = R(e.cell),
            s = R(t.cell),
            c = s.x - o.x,
            l = s.z - o.z,
            u = Math.sqrt(c * c + l * l) || 1,
            d = c / u,
            f = l / u,
            p = P * r;
          for (let e = 0; e < 56; e++) {
            let t = R(e),
              r = t.x - o.x,
              s = t.z - o.z,
              c = r * d + s * f,
              l = Math.abs(r * f - s * d);
            c <= 0.1 ||
              c > p ||
              ((n === `line` ? l < P * 0.55 * i : l <= P * 0.55 + c * 0.58) &&
                a.push(e));
          }
          return a;
        }
        along(e, t, n, r) {
          let i = R(e.cell),
            a = R(t.cell),
            o = R(n),
            s = a.x - i.x,
            c = a.z - i.z,
            l = Math.sqrt(s * s + c * c) || 1;
          return Math.min(
            1,
            Math.max(0, ((o.x - i.x) * s + (o.z - i.z) * c) / l / (P * r)),
          );
        }
        displace(e, t, n, r, i, a) {
          if (t.foot) return { to: t.cell, hit: null, hitCell: -1, dur: 0 };
          let o = R(e.cell),
            s = R(t.cell),
            c = s.x - o.x,
            l = s.z - o.z;
          (r === `pull` && ((c = -c), (l = -l)), a && ((c = a.x), (l = a.z)));
          let u = Math.sqrt(c * c + l * l);
          (u < 0.001 &&
            ((c = e.faceX), (l = e.faceZ), (u = Math.sqrt(c * c + l * l) || 1)),
            (c /= u),
            (l /= u));
          let d = t.cell,
            f = null,
            p = -1;
          for (let i = 0; i < n && !(r === `pull` && M(d, e.cell) <= 1); i++) {
            let e = R(d),
              n = -1,
              r = -1 / 0;
            for (let t of an(d)) {
              let i = R(t),
                a = i.x - e.x,
                o = i.z - e.z,
                u = a * c + o * l;
              if (u < 0.7 * P) continue;
              let d = u - 0.6 * Math.abs((i.x - s.x) * l - (i.z - s.z) * c);
              d > r && ((r = d), (n = t));
            }
            if (n < 0) {
              ((f = -1), (p = d));
              break;
            }
            if (this.occupied(n)) {
              let e =
                this.units.find((e) => {
                  var r;
                  return (
                    e.alive &&
                    e !== t &&
                    (e.cell === n || !!((r = e.foot) != null && r.includes(n)))
                  );
                }) ??
                this.units.find((e) => e.alive && e !== t && e.holdCell === n);
              ((f = e ? e.uid : -1), (p = n));
              break;
            }
            d = n;
          }
          let m = 0;
          if (d !== t.cell) {
            let n = t.moving && t.moveT < 0.5 ? t.from : t.cell;
            (this.setCell(t, d),
              (t.from = n),
              (t.moveT = 0),
              (t.moving = !0),
              (t.moveSpeed = i),
              (m = Math.max(1, M(n, d)) / i),
              this.emit({
                k: `shove`,
                t: this.time,
                src: e.uid,
                uid: t.uid,
                from: n,
                to: d,
                dur: m,
                mode: r,
              }));
          }
          return { to: d, hit: f, hitCell: p, dur: m };
        }
        pushOne(e, t, n, r = n.push ?? 0) {
          if (!t.alive || !r || t.untargetT > 0 || t.foot) return;
          let i = n.pushBack ? { x: 0, z: e.team === 0 ? -1 : 1 } : void 0,
            a = this.displace(
              e,
              t,
              Math.abs(r),
              r < 0 ? `pull` : `push`,
              xa,
              i,
            );
          if (
            (a.hit !== null &&
              this.later(a.dur, () =>
                this.collision(e, t, a.hit, a.hitCell, n),
              ),
            n.follow)
          ) {
            let n = this.time + Math.max(X, a.dur);
            ((e.recoverUntil = Math.max(e.recoverUntil, n + X)),
              this.later(Math.max(X, a.dur), () => this.followUp(e, t)));
          }
        }
        followUp(e, t) {
          if (
            !e.alive ||
            !t.alive ||
            e.stun > 0 ||
            e.moving ||
            this.dist(e.cell, t) <= 1
          )
            return;
          let n = this.adj(t)
            .filter((e) => !this.occupied(e))
            .sort((t, n) => M(e.cell, t) - M(e.cell, n) || t - n)[0];
          if (n === void 0) return;
          let r = e.cell,
            i = Math.max(1, M(r, n)) / Q;
          (this.relocate(e, n, i),
            (e.moveSpeed = Q),
            this.emit({
              k: `shove`,
              t: this.time,
              src: e.uid,
              uid: e.uid,
              from: r,
              to: n,
              dur: i,
              mode: `dash`,
            }),
            (e.target = t.uid));
        }
        collision(e, t, n, r, i) {
          this.emit({
            k: `collide`,
            t: this.time,
            src: e.uid,
            a: t.uid,
            b: n,
            cell: r,
          });
          let a = {
              name: i.name,
              type: i.type,
              kind: i.kind,
              mana: i.mana,
              power: i.power,
            },
            o = n >= 0 ? this.byUid(n) : void 0;
          for (let n of [
            t,
            i.collideBoth && o && o.team !== e.team ? o : void 0,
          ])
            n &&
              n.alive &&
              (i.collideDmg && this.abilityHit(e, n, a, i.collideDmg),
              i.collide && this.hardCC(n, i.collide, `airborne`, e));
        }
        throwUnit(e, t, n) {
          if (!e.noImmune && !e.boss && z(n.type, t.types) === 0)
            return (
              this.statusText(t, `¡No afecta a ${t.name}…!`, `#ced4da`),
              0
            );
          let r = this.displace(e, t, n.throw ?? 2, `throw`, Sa);
          this.hardCC(t, r.dur + (n.airborne ?? 1), `airborne`, e);
          let i = {
            name: n.name,
            type: n.type,
            kind: n.kind,
            mana: n.mana,
            power: n.power,
          };
          return (
            this.later(Math.max(X, r.dur), () => {
              if (
                (r.hit !== null &&
                  this.emit({
                    k: `collide`,
                    t: this.time,
                    src: e.uid,
                    a: t.uid,
                    b: r.hit,
                    cell: r.hitCell,
                  }),
                t.alive && this.abilityHit(e, t, i),
                n.splash)
              )
                for (let a of this.enemiesOf(e))
                  a !== t &&
                    M(a.cell, r.to) <= 1 &&
                    this.abilityHit(e, a, i, n.splash);
            }),
            r.dur
          );
        }
        spitOut(e, t, n) {
          if (t.foot || t.boss || t.untargetT > 0) return;
          let r = this.displace(e, t, n, `throw`, Sa);
          r.dur > 0 && this.hardCC(t, r.dur, `airborne`, e);
        }
        execSplash(e, t, n) {
          let r = {
              name: n.name,
              type: n.type,
              kind: `nuke`,
              mana: 0,
              power: n.power,
              scale: n.scale,
              esc: n.esc,
            },
            i = this.enemiesOf(e)
              .filter((e) => e !== t && M(e.cell, t.cell) <= 1)
              .sort((e, t) => e.uid - t.uid);
          i.forEach((t, a) => {
            (this.emit({
              k: `strike`,
              t: this.time,
              src: e.uid,
              dst: t.uid,
              i: a,
              n: i.length,
              name: n.name,
            }),
              this.abilityHit(e, t, r, n.execSplash),
              t.alive && this.hardCC(t, Fa, `airborne`, e));
          });
        }
        rush(e, t, n, r, i, a = []) {
          if (!e.alive || e.stun > 0) return;
          let o = this.enemiesOf(e).filter((n) => this.dashFits(e, t, n)),
            s = i ?? this.byUid(e.target),
            c = o.length
              ? t.distinct
                ? this.rushDistinct(e, n, r, s, o, a)
                : s && o.includes(s)
                  ? s
                  : s
                    ? this.nearestTo(s, o)
                    : this.pickTarget(e, o)
              : void 0;
          if (!c) return;
          (a.push(c),
            t.distinct &&
              n + 1 < r &&
              (e.untargetT = Math.max(
                e.untargetT,
                Math.max(1, this.dist(e.cell, c)) / Q + Ca + X,
              )));
          let l = aa;
          if (this.dist(e.cell, c) > 1) {
            let t = this.adj(c)
              .filter((e) => !this.occupied(e))
              .sort((t, n) => M(e.cell, t) - M(e.cell, n))[0];
            if (t !== void 0) {
              l = Math.max(1, M(e.cell, t)) / Q;
              let n = e.cell;
              ((e.from = e.cell),
                this.setCell(e, t),
                (e.moveT = 0),
                (e.moving = !0),
                (e.moveSpeed = Q),
                this.emit({
                  k: `shove`,
                  t: this.time,
                  src: e.uid,
                  uid: e.uid,
                  from: n,
                  to: t,
                  dur: l,
                  mode: `dash`,
                }));
            }
          }
          return (
            (e.target = c.uid),
            this.face(e, c),
            this.emit({
              k: `strike`,
              t: this.time,
              src: e.uid,
              dst: c.uid,
              i: n,
              n: r,
              name: t.name,
            }),
            (e.recoverUntil = Math.max(
              e.recoverUntil,
              this.time + l + (n + 1 < r ? Ca : 0) + e.castRecover,
            )),
            this.later(l, () => {
              if (!e.alive) return;
              let i =
                  c.alive || !t.distinct
                    ? void 0
                    : this.enemiesOf(e).filter(
                        (n) =>
                          this.dist(e.cell, n) <= 1 &&
                          !this.moveUseless(e, t, n),
                      ),
                o = c.alive
                  ? c
                  : i != null && i.length
                    ? this.nearestTo(c, i)
                    : void 0;
              (o && (o !== c && a.push(o), this.abilityHit(e, o, t)),
                n + 1 < r &&
                  this.later(Ca, () => this.rush(e, t, n + 1, r, o ?? c, a)));
            }),
            c
          );
        }
        rushDistinct(e, t, n, r, i, a) {
          let o = e.tauntT > 0 ? this.byUid(e.tauntBy) : void 0;
          if (o && i.includes(o)) return o;
          let s = i.filter((e) => !a.includes(e)),
            c = s.length ? s : i;
          return t === 0
            ? r && c.includes(r)
              ? r
              : r
                ? this.nearestTo(r, c)
                : this.pickTarget(e, c)
            : t === n - 1 && s.length
              ? s.reduce((e, t) =>
                  t.hp < e.hp || (t.hp === e.hp && t.uid < e.uid) ? t : e,
                )
              : r
                ? this.nearestTo(r, c)
                : this.pickTarget(e, c);
        }
        static singleTarget(e) {
          if (e.chain || e.swap || e.shape || e.bolts || e.boltsAll) return !1;
          switch (e.kind) {
            case `nuke`:
            case `execute`:
            case `drain`:
              return !0;
            case `multi`:
              return !e.spread && !e.pick && !(e.radius ?? 0);
            case `dash`:
              return !!e.dive;
            default:
              return !1;
          }
        }
        moveUseless(e, t, n) {
          var r;
          return e.noImmune || e.boss
            ? !1
            : (r = t.seq) != null && r.length
              ? t.seq.every((r) =>
                  this.moveUseless(e, { ...t, ...r, seq: void 0 }, n),
                )
              : (t.powder && Va(n, `powder`)) || (t.seed && Va(n, `seed`))
                ? !0
                : t.trueDmg || z(t.type, n.types) > 0
                  ? !1
                  : !t.statusMove ||
                    (!!t.stun && Yi(t) === `paralyze` && Va(n, `paralyze`));
        }
        usefulTarget(e, t, n) {
          let r = this.foesFor(e).filter(
            (r) => r !== n && !this.moveUseless(e, t, r),
          );
          if (t.pick && t.kind !== `multi`)
            return r.length ? this.selectTarget(e, t.pick, void 0, r) : void 0;
          let i = t.dive ? r : r.filter((t) => this.dist(e.cell, t) <= e.range);
          return i.length
            ? n
              ? this.nearestTo(n, i)
              : this.pickTarget(e, i)
            : void 0;
        }
        nearestTo(e, t) {
          return t.reduce((t, n) => {
            let r = M(t.cell, e.cell),
              i = M(n.cell, e.cell);
            return i < r ||
              (i === r && (n.hp < t.hp || (n.hp === t.hp && n.uid < t.uid)))
              ? n
              : t;
          });
        }
        recastTarget(t, n) {
          let r = this.chooseTarget(t, n),
            i = this.pending.get(t.uid) ?? t.move;
          if (
            !r ||
            i.pick ||
            i.dive ||
            ![
              `nuke`,
              `execute`,
              `drain`,
              `multi`,
              `line`,
              `aoeTarget`,
            ].includes(i.kind) ||
            i.shape === `board`
          )
            return r;
          let a = e.singleTarget(i);
          if (
            this.dist(t.cell, r) <= t.range &&
            !(a && this.moveUseless(t, i, r))
          )
            return r;
          let o = this.targetableFoes(t).filter(
              (e) => this.dist(t.cell, e) <= t.range,
            ),
            s = a ? o.filter((e) => !this.moveUseless(t, i, e)) : o,
            c = s.length ? s : o;
          return c.length ? this.pickTarget(t, c) : void 0;
        }
        dashFits(e, t, n) {
          return (
            (this.dist(e.cell, n) <= 1 ||
              this.adj(n).some((e) => !this.occupied(e))) &&
            !this.moveUseless(e, t, n)
          );
        }
        pickFor(e, t, n) {
          if (t.swap) {
            let t = this.swapped.get(e.uid),
              n = this.foesFor(e).filter((e) => !(t != null && t.has(e.uid))),
              r = (e) => e.dealt + v[e.line].cost * B(3, e.star - 1) * 0.01;
            if (n.length) return n.reduce((e, t) => (r(t) > r(e) ? t : e));
          }
          return this.selectTarget(e, t.pick ?? `near`, n) ?? n;
        }
        chainHops(e, t, n) {
          let r = this.enemiesOf(e),
            i = [t],
            a = n.chainRange ?? 2;
          for (; i.length < (n.chain ?? 1);) {
            let e = i[i.length - 1],
              t,
              n = 1 / 0;
            for (let o of r) {
              if (i.includes(o)) continue;
              let r = M(e.cell, o.cell);
              if (r > a) continue;
              let s = r * 1e5 + o.hp;
              s < n && ((n = s), (t = o));
            }
            if (!t) break;
            i.push(t);
          }
          return i;
        }
        swapAlly(e, t) {
          let n = (t) =>
              (t.role === `tank` ? 1e6 : 0) +
              this.depth(e, t.cell) * 1e3 +
              t.hp / 1e4,
            r;
          for (let i of this.alliesOf(e))
            i === e ||
              i.untargetT > 0 ||
              (t && this.depth(e, i.cell) > this.depth(e, t.cell) - 2) ||
              ((!r || n(i) > n(r)) && (r = i));
          return r;
        }
        reSwoop(e, t, n) {
          let r = e.entryTgt >= 0 ? this.byUid(e.entryTgt) : void 0;
          if (e.entryTgt >= 0 && !(r != null && r.alive)) {
            let n = this.topDamage(e, this.foesFor(e));
            if (n) return ((e.entryTgt = n.uid), { mv: t, tgt: n });
          }
          return {
            mv: { ...t, kind: `nuke`, dive: void 0, reSwoop: void 0 },
            tgt: n,
          };
        }
        landSpot(e, t, n) {
          let r = (t) => t === e.cell || !this.occupied(t),
            i = n ? this.enemiesOf(e) : [],
            a = (t) =>
              (n ? i.filter((e) => this.dist(t, e) === 1).length * 100 : 0) +
              this.depth(e, t) * 10 -
              M(e.cell, t) * 0.01,
            o = -1,
            s = -1 / 0;
          for (let e of this.adj(t)) r(e) && a(e) > s && ((s = a(e)), (o = e));
          if (o >= 0) return o;
          let c = 1 / 0;
          for (let n = 0; n < 56; n++) {
            if (!r(n)) continue;
            let i = this.dist(n, t) * 100 - this.depth(e, n);
            i < c && ((c = i), (o = n));
          }
          return o >= 0 ? o : e.cell;
        }
        relocate(e, t, n) {
          let r = e.moving && e.moveT < 0.5 ? e.from : e.cell;
          return (
            this.setCell(e, t),
            r === t
              ? ((e.from = t),
                (e.moveT = 1),
                (e.moving = !1),
                (e.moveSpeed = Zi),
                r)
              : ((e.from = r),
                (e.moveT = 0),
                (e.moving = !0),
                (e.moveSpeed = Math.max(1, M(r, t)) / Math.max(X, n)),
                r)
          );
        }
        tryExecute(e, t, n) {
          if (t.boss || (!e.noImmune && z(e.move.type, t.types) === 0)) return;
          let r = v[t.line].cost >= 5 ? n / 2 : n;
          !t.alive ||
            t.hp >= t.maxHp * r ||
            t.sashT > 0 ||
            (this.sashSave(t)
              ? (t.hp = Math.min(t.hp, 1))
              : (this.emit({
                  k: `execute`,
                  t: this.time,
                  src: e.uid,
                  uid: t.uid,
                }),
                t.hp > 0 && ((e.dealt += t.hp), (t.taken += t.hp)),
                e.kos++,
                this.faint(t)));
        }
        dive(e, t, n) {
          let r = n.dive,
            i = this.landSpot(e, t, r === `shadow`),
            a = e.cell,
            o = i === a ? 0 : Math.max(1, M(a, i)) / Q;
          (this.relocate(e, i, o), i !== a && (e.moveSpeed = Q));
          let s = o + ka + (n.diveWait ?? 0);
          ((e.untargetT = s + X),
            (e.untargetKind = r),
            this.emit({
              k: `burrow`,
              t: this.time,
              uid: e.uid,
              from: a,
              to: i,
              dur: o,
              mode: r,
            }),
            (e.target = t.uid),
            this.face(e, t));
          let c = Math.max(n.radius ?? 0, +(r === `shadow`)),
            l = Math.max(1, n.combo ?? 1);
          return (
            this.later(s, () => {
              var i;
              if (((e.untargetT = 0), (e.untargetKind = ``), !e.alive)) return;
              if ((n.gust && t.alive && this.gust(e, t, n), l > 1)) {
                this.diveHeads(e, t, n, l);
                return;
              }
              let a = r === `shadow` || !t.alive ? e.cell : t.cell,
                o = this.enemiesOf(e).filter(
                  (e) => e === t || this.dist(a, e) <= c,
                );
              t.alive && this.face(e, t);
              for (let r of o)
                (this.abilityHit(e, r, n, r === t ? 1 : (n.splash ?? 1)),
                  n.push && this.pushOne(e, r, n));
              if (n.scare)
                for (let t of o) t.alive && this.scare(e, t, n.scare);
              (i = n.zone) != null &&
                i.anchor &&
                t.alive &&
                t.untargetT <= 0 &&
                !t.foot &&
                this.addZone(e, n, [t.cell], t);
            }),
            {
              active: s + (l - 1) * f,
              cells: J(r === `shadow` ? i : t.cell, c),
            }
          );
        }
        diveHeads(e, t, n, r) {
          let i = t;
          for (let a = 0; a < r; a++)
            this.later(a === 0 ? 0 : a * f, () => {
              if (!e.alive) return;
              if (!i || !i.alive || i.untargetT > 0) {
                let r = i ?? t,
                  a = this.enemiesOf(e).filter(
                    (t) => !this.moveUseless(e, n, t),
                  );
                i = a.length ? this.nearestTo(r, a) : void 0;
              }
              if (!i) return;
              let o =
                n.stunLast && a < r - 1
                  ? { ...n, airborne: void 0, stun: void 0 }
                  : n;
              (this.face(e, i),
                this.emit({
                  k: `strike`,
                  t: this.time,
                  src: e.uid,
                  dst: i.uid,
                  i: a,
                  n: r,
                  name: n.name,
                }),
                this.abilityHit(e, i, o));
            });
        }
        gust(e, t, n) {
          let r = this.units
            .filter(
              (e) =>
                e.alive &&
                e !== t &&
                e.team === t.team &&
                e.untargetT <= 0 &&
                !e.foot &&
                this.dist(e.cell, t) <= 1,
            )
            .sort((e, t) => e.uid - t.uid);
          for (let i of r) {
            let r = this.displace(t, i, 1, `push`, xa);
            r.hit !== null &&
              n.collide &&
              this.later(r.dur, () => {
                i.alive && this.hardCC(i, n.collide, `airborne`, e);
              });
          }
        }
        scare(e, t, n) {
          t.team === e.team ||
            t.types.includes(`Ghost`) ||
            ((t.scareBy = e.uid),
            (t.scareNoT = n.noTarget * (t.boss ? n.bossK : 1)),
            t.target === e.uid && (t.target = -1),
            this.statusText(t, `¡Se asusta!`, `#b197fc`),
            !(t.boss || t.foot || t.rootT > 0 || t.stun > 0 || t.moving) &&
              (this.displace(e, t, 1, `push`, 1 / Math.max(X, n.flee)),
              (t.scareT = Math.max(t.scareT, n.flee))));
        }
        scaredOf(e, t) {
          return e.scareNoT > 0 && t.uid === e.scareBy;
        }
        foesFor(e) {
          return e.scareNoT > 0
            ? this.targetableFoes(e).filter((t) => t.uid !== e.scareBy)
            : this.targetableFoes(e);
        }
        dropAggro(e, t) {
          for (let n of this.units)
            n.alive &&
              n !== e &&
              n !== t &&
              ((n.target === e.uid || n.target === t.uid) && (n.target = -1),
              n.tauntT > 0 &&
                (n.tauntBy === e.uid || n.tauntBy === t.uid) &&
                (n.tauntT = 0));
        }
        swapCast(e, t, n) {
          let r = this.swapAlly(e, t),
            i = this.swapped.get(e.uid) ?? new Set();
          if (!r || i.has(t.uid) || t.foot)
            return (
              this.later(0.25, () => {
                e.alive && t.alive && this.abilityHit(e, t, n);
              }),
              { active: 0.25, cells: [t.cell] }
            );
          (i.add(t.uid), this.swapped.set(e.uid, i));
          let a = t.cell,
            o = r.cell,
            s = Math.max(Ea, M(a, o) / Da);
          (this.relocate(t, o, s),
            this.relocate(r, a, s),
            this.emit({
              k: `swap`,
              t: this.time,
              src: e.uid,
              a: t.uid,
              b: r.uid,
              cellA: a,
              cellB: o,
              dur: s,
            }),
            (t.target = -1),
            (r.target = -1),
            this.dropAggro(t, r));
          let c = s + 0.15;
          return (
            this.later(c, () => {
              e.alive && t.alive && (this.face(e, t), this.abilityHit(e, t, n));
            }),
            { active: c, cells: [a, o] }
          );
        }
        chargeCast(e, t, n) {
          let r = n.len ?? 12,
            i = (n) => this.along(e, t, n, r),
            a = this.shapeCells(e, t, `line`, r, 1).sort((e, t) => i(e) - i(t)),
            o = e.cell;
          for (let e of a) this.occupied(e) || (o = e);
          let s = R(e.cell),
            c = R(t.cell),
            l = c.x - s.x,
            u = c.z - s.z,
            d = Math.sqrt(l * l + u * u) || 1;
          ((l /= d), (u /= d));
          let f = o === e.cell ? i(t.cell) : i(o),
            p = this.enemiesOf(e).filter(
              (e) => this.inCells(a, e) && i(e.cell) <= f + 1e-6,
            );
          !p.includes(t) &&
            t.alive &&
            t.untargetT <= 0 &&
            this.dist(e.cell, t) <= 1 &&
            p.push(t);
          let m = a.filter((e) => i(e) <= f + 1e-6),
            h = p.map((e) => (f > 0 ? Math.min(1, i(e.cell) / f) : 1)),
            g = e.cell,
            _ = o === g ? 0.15 : Math.max(1, M(g, o)) / Oa;
          (o !== g &&
            (this.relocate(e, o, _),
            (e.moveSpeed = Oa),
            this.emit({
              k: `shove`,
              t: this.time,
              src: e.uid,
              uid: e.uid,
              from: g,
              to: o,
              dur: _,
              mode: `dash`,
            })),
            n.hide && ((e.untargetT = _ + ka), (e.untargetKind = n.hide)),
            n.zone && m.length && this.later(X, () => this.addZone(e, n, m)));
          let v = p.length;
          return (
            p.forEach((t, r) => {
              let i = h[r];
              this.later(Math.max(X, _ * i), () => {
                if (
                  !e.alive ||
                  !t.alive ||
                  (this.emit({
                    k: `strike`,
                    t: this.time,
                    src: e.uid,
                    dst: t.uid,
                    i: r,
                    n: v,
                    name: n.name,
                  }),
                  this.abilityHit(e, t, n),
                  !t.alive || !n.side)
                )
                  return;
                let i = R(t.cell),
                  a = (i.x - s.x) * u - (i.z - s.z) * l,
                  o =
                    Math.abs(a) > 0.05
                      ? Math.sign(a)
                      : this.rand() < 0.5
                        ? -1
                        : 1,
                  c = this.displace(e, t, n.side, `push`, xa, {
                    x: u * o,
                    z: -l * o,
                  });
                c.hit !== null &&
                  n.collide &&
                  this.later(c.dur, () =>
                    this.collision(e, t, c.hit, c.hitCell, n),
                  );
              });
            }),
            (e.target = t.uid),
            { active: _ + 0.05, cells: m }
          );
        }
        resolveMove(e, t) {
          var n;
          t.lowHp &&
            e.hp < e.maxHp * (t.lowHpBelow ?? 0.5) &&
            !(t.lowHp.selfDestruct && e.boomed) &&
            (t = t.lowHp);
          let r = this.weather
            ? (n = t.wx) == null
              ? void 0
              : n[this.weather]
            : void 0;
          if (!r) return t;
          let i = Qa.get(t);
          i || ((i = new Map()), Qa.set(t, i));
          let a = i.get(this.weather);
          return (
            a || ((a = { ...t, ...r, wx: void 0 }), i.set(this.weather, a)),
            a
          );
        }
        addZone(e, t, n, r) {
          let i = t.zone;
          if (!i || !n.length || this.over) return;
          let a = $[e.star - 1],
            o = i.dur > 0 ? i.dur : Math.max(X, this.limit - this.time),
            s;
          if (i.grow) {
            ((s = this.puddleRadius(e, i)), (n = J(e.cell, s)));
            for (let t of this.zones)
              t.src === e.uid &&
                t.grow &&
                t.until > this.time &&
                (t.until = this.time);
          }
          let c = {
            id: this.nextZone++,
            src: e.uid,
            team: e.team,
            kind: i.kind,
            type: Pa[i.kind],
            cells: [...n],
            t0: this.time,
            until: this.time + o,
            next: this.time,
            burn: (i.burn ?? 0) * a,
            poison: (i.poison ?? 0) * a + (i.poisonHp ?? 0) * e.maxHp,
            stun: i.stun ?? 0,
            status: i.status ?? `paralyze`,
            slow: i.slow ?? 0,
            anchor: r ? r.uid : -1,
            miss: i.miss ?? 0,
            ...(i.grow ? { center: e.cell, radius: s, grow: !0 } : {}),
          };
          (this.zones.push(c),
            this.emit({
              k: `zone`,
              t: this.time,
              id: c.id,
              src: e.uid,
              kind: i.kind,
              type: c.type,
              cells: c.cells,
              dur: o,
              ...(r ? { anchor: r.uid } : {}),
            }));
        }
        puddleRadius(e, t) {
          let n = t.radius ?? 1,
            r = this.zones.find(
              (t) => t.src === e.uid && t.grow && t.until > this.time,
            );
          return r
            ? Math.min(t.grow ?? n, Math.max(n, (r.radius ?? n) + 1))
            : n;
        }
        puddleCells(e, t) {
          let n = t.zone;
          return J(e.cell, n.grow ? this.puddleRadius(e, n) : (n.radius ?? 1));
        }
        tickZones(t) {
          let n = !1;
          for (let r of this.zones) {
            let i = r.anchor >= 0 ? this.byUid(r.anchor) : void 0;
            if (
              t >= r.until - 1e-9 ||
              (i && (!i.alive || i.cell !== r.cells[0]))
            )
              ((r.until = -1),
                (n = !0),
                this.emit({ k: `zoneEnd`, t, id: r.id }));
            else if (!(t + 1e-9 < r.next)) {
              r.next += Na;
              for (let t of this.units)
                !t.alive ||
                  t.team === r.team ||
                  t.untargetT > 0 ||
                  e.dotBlocked(t) ||
                  (i ? t !== i : !this.inCells(r.cells, t)) ||
                  ((r.kind !== `spark` || z(r.type, t.types) !== 0) &&
                    ((r.kind === `spore` && this.immune(t, `powder`)) ||
                      this.zoneHit(r, t)));
            }
          }
          n && (this.zones = this.zones.filter((e) => e.until >= 0));
        }
        zoneHit(e, t) {
          let n = 0.85;
          (e.burn > 0 &&
            t.freezeT <= 0 &&
            !this.immune(t, `burn`) &&
            ((t.burnDps = t.burnT > 0 ? Math.max(t.burnDps, e.burn) : e.burn),
            (t.burnT = Math.max(t.burnT, n)),
            (t.burnSrc = e.src)),
            e.poison > 0 &&
              !this.immune(t, `poison`) &&
              ((t.poisonDps =
                t.poisonT > 0 ? Math.max(t.poisonDps, e.poison) : e.poison),
              (t.poisonT = Math.max(t.poisonT, n)),
              (t.poisonSrc = e.src)),
            e.slow > 0 &&
              ((t.slowT = Math.max(t.slowT, n)),
              (t.slowPct = Math.max(t.slowPct, e.slow))),
            e.miss > 0 &&
              ((t.missT = Math.max(t.missT, n)),
              (t.missPct = Math.max(t.missPct, e.miss))),
            e.stun > 0 && this.applyStun(t, e.stun, e.status),
            e.anchor === t.uid &&
              !this.immune(t, `trap`) &&
              (t.rootT = Math.max(t.rootT, 0.5666666666666667)));
        }
        plantSeed(t, n, r) {
          e.dotBlocked(n) ||
            this.immune(n, `seed`) ||
            ((n.seedT = r.seedT ?? 4),
            (n.seedDps = Math.max(
              n.seedSrc === t.uid ? n.seedDps : 0,
              (r.seed ?? 0) * $[t.star - 1] * Wi(t, r),
            )),
            (n.seedSrc = t.uid),
            (n.seedAcc = 0),
            this.emit({
              k: `seed`,
              t: this.time,
              src: t.uid,
              uid: n.uid,
              dur: n.seedT,
            }));
        }
        seedTick(e, t) {
          if (
            ((e.seedT -= t),
            (e.seedAcc += t),
            e.seedAcc < 0.499999999 && e.seedT > 0)
          )
            return;
          let n = e.hp;
          (this.dot(e, e.seedDps * e.seedAcc, e.seedSrc), (e.seedAcc = 0));
          let r = n - Math.max(0, e.hp),
            i = this.byUid(e.seedSrc);
          if (!i || r < 1) return;
          let a = this.alliesOf(i).sort(
            (e, t) => e.hp / e.maxHp - t.hp / t.maxHp || e.uid - t.uid,
          )[0];
          a &&
            (this.emit({
              k: `leech`,
              t: this.time,
              src: i.uid,
              uid: e.uid,
              dst: a.uid,
              amount: Math.round(r),
            }),
            this.heal(a, r, !0, i));
        }
        guardCast(e, t, n) {
          let r = t.provoke
            ? this.enemiesOf(e).filter((t) => this.dist(e.cell, t) <= 2)
            : [];
          if (r.length) {
            for (let n of r)
              ((n.tauntT = t.provoke), (n.tauntBy = e.uid), (n.target = e.uid));
            this.emit({
              k: `taunt`,
              t: this.time,
              src: e.uid,
              uids: r.map((e) => e.uid),
              dur: t.provoke,
            });
          }
          e.guardK > 0 &&
            n(1, () => {
              let t = e.guard;
              if (!(!e.alive || this.over || t < 1)) {
                ((e.guard = 0),
                  this.emit({
                    k: `burst`,
                    t: this.time,
                    uid: e.uid,
                    cells: J(e.cell, 1),
                    amount: Math.round(t),
                  }));
                for (let n of this.enemiesOf(e))
                  this.dist(e.cell, n) === 1 &&
                    this.damage(e, n, t, !0, 1, !1, !0);
              }
            });
        }
        yawnCast(e, t) {
          let n = this.enemiesOf(e).filter(
            (n) => this.dist(e.cell, n) <= t.radius,
          );
          if (n.length) {
            for (let r of n)
              ((r.tauntT = t.delay), (r.tauntBy = e.uid), (r.target = e.uid));
            (this.emit({
              k: `taunt`,
              t: this.time,
              src: e.uid,
              uids: n.map((e) => e.uid),
              dur: t.delay,
            }),
              this.later(t.delay, () => {
                for (let e of n)
                  !e.alive ||
                    e.untargetT > 0 ||
                    (this.applyStun(e, t.sleep, `sleep`), this.sleepFragile(e));
              }));
          }
        }
        dreamSleep(e, t) {
          let n = t.dreamEat;
          if (e.insomT > 0) {
            this.statusText(e, `¡Desvelado!`, `#ffe066`);
            return;
          }
          let r = (t.stun ?? 0) * B(n.repeatK, e.dreamN);
          if (r < 0.1) return;
          let i = e.ccImmune;
          (this.applyStun(e, r, `sleep`),
            e.ccImmune !== i &&
              Bi(e, `sleep`) &&
              (e.dreamN++, (e.dreamSleep = !0), (e.dreamInsom = n.insom)));
        }
        barrierCast(e, t) {
          let n = t.barrier,
            r = L(e.cell),
            i = r + (e.team === 0 ? -1 : 1),
            a = n.t * Wi(e, t),
            o = this.alliesOf(e).filter(
              (e) => L(e.cell) === r || L(e.cell) === i,
            );
          for (let t of o)
            ((t.barrierT = Math.max(t.barrierT, a)),
              (t.barrierBasic = Math.max(t.barrierBasic, n.basic)),
              (t.barrierAbility = Math.max(t.barrierAbility, n.ability)),
              this.emit({
                k: `shieldAlly`,
                t: this.time,
                src: e.uid,
                uid: t.uid,
                amount: 0,
              }));
          return o.map((e) => e.cell);
        }
        convertCast(e, t) {
          let n = e.lastHitType;
          if (!n) return { ...t, type: e.types[0] ?? t.type };
          let r = [],
            i = 1 / 0;
          for (let e of Pn) {
            let t = z(n, [e]);
            t < i - 1e-9
              ? ((i = t), (r = [e]))
              : Math.abs(t - i) < 1e-9 && r.push(e);
          }
          let a =
            r.includes(e.types[0]) && e.types.length === 1 ? e.types[0] : r[0];
          return (
            (e.types.length !== 1 || e.types[0] !== a) &&
              ((e.types = [a]),
              this.emit({
                k: `text`,
                t: this.time,
                uid: e.uid,
                text: `¡Conversión!`,
                color: `#74c0fc`,
              }),
              (e.textT = this.time)),
            { ...t, type: a }
          );
        }
        shieldBurst(e) {
          let t = e.burstAbs * e.burstPct;
          if (
            ((e.burstT = 0),
            (e.burstAbs = 0),
            (e.burstLeft = 0),
            !e.alive || this.over)
          )
            return;
          let n = J(e.cell, 1);
          if (
            (this.emit({
              k: `burst`,
              t: this.time,
              uid: e.uid,
              cells: n,
              amount: Math.round(t),
            }),
            !(t < 1))
          )
            for (let n of this.enemiesOf(e))
              this.dist(e.cell, n) === 1 && this.damage(e, n, t, !0, 1, !1, !0);
        }
        crashSelf(e, t) {
          let n = Math.min(e.hp - 1, e.maxHp * t);
          (this.emit({ k: `crash`, t: this.time, uid: e.uid }),
            !(n < 1) &&
              ((e.hp -= n),
              (e.taken += n),
              this.emit({
                k: `dmg`,
                t: this.time,
                uid: e.uid,
                src: e.uid,
                amount: Math.round(n),
                eff: 1,
                ability: !1,
              })));
        }
        planBolts(e, t) {
          let n = t.radius ?? 1,
            r = this.enemiesOf(e),
            i = t.boltsAll ? r.length : (t.bolts ?? 3),
            a = [];
          for (; a.length < i && r.length;) {
            let t = -1,
              i = -1 / 0;
            for (let a = 0; a < 56; a++) {
              let o = 0,
                s = 0;
              for (let e of r) {
                let t = this.dist(a, e);
                t <= n && (o++, (s += t));
              }
              if (!o) continue;
              let c = o * 1e4 - s * 10 - M(e.cell, a) * 0.01;
              c > i && ((i = c), (t = a));
            }
            if (t < 0) break;
            a.push(t);
            for (let e = r.length - 1; e >= 0; e--)
              M(t, r[e].cell) <= n && r.splice(e, 1);
          }
          return a;
        }
        boltCenters(e, t) {
          let n = this.boltPlan.get(e.uid);
          return n && n.mv === t ? n.centers : this.planBolts(e, t);
        }
        boltsCast(e, t) {
          let n = this.boltCenters(e, t);
          this.boltPlan.delete(e.uid);
          let r = t.radius ?? 1,
            i = n.length,
            a = new Set();
          return (
            n.forEach((n, o) =>
              this.later(0.1 + o * La, () => {
                if (e.alive) {
                  this.emit({
                    k: `bolt`,
                    t: this.time,
                    src: e.uid,
                    cell: n,
                    radius: r,
                    i: o,
                    n: i,
                    name: t.name,
                    type: t.type,
                  });
                  for (let i of this.enemiesOf(e))
                    a.has(i.uid) ||
                      this.dist(n, i) > r ||
                      (a.add(i.uid), this.abilityHit(e, i, t));
                }
              }),
            ),
            {
              active: 0.15 + Math.max(0, i - 1) * La,
              cells: [...new Set(n.flatMap((e) => J(e, r)))],
            }
          );
        }
        later(e, t, n = !1) {
          this.delayed.push({ t: this.time + e, fn: t, post: n });
        }
        damage(e, t, n, r, i, a = !1, o = !1, s = !1) {
          if (!t.alive || t.sashT > 0) return;
          (o || (n *= Z),
            t.exposedT > 0 && (n *= 1 + t.exposedPct),
            t.markPct > 0 &&
              t.stun > 0 &&
              t.stunKind === `sleep` &&
              (n *= 1 + t.markPct),
            i > 1 &&
              e.superK > 0 &&
              e.team !== t.team &&
              (n *= 1 + e.superK / 100));
          let c = n * i;
          t.guardK > 0 &&
            e.team !== t.team &&
            !o &&
            (t.guard = Math.min(t.maxHp * Qi, t.guard + c * t.guardK));
          let l =
            c *
            (1 - t.dmgReduce) *
            (r
              ? t.abilityCut > 0
                ? Math.max(0, 1 - t.abilityCut)
                : 1
              : t.basicCut > 0
                ? Math.max(0, 1 - t.basicCut)
                : 1);
          if (((t.mitigated += c - l), t.barrierT > 0 && e.team !== t.team)) {
            let e = l * (r ? t.barrierAbility : t.barrierBasic);
            e > 0 && ((l -= e), (t.mitigated += e));
          }
          if (t.shield > 0) {
            let n = e.team === t.team ? 1 : 1 + e.shieldBreak,
              r = Math.min(t.shield / n, l),
              i = Math.min(t.shield, r * n);
            if (
              ((t.shield -= i),
              (l -= r),
              (t.mitigated += r),
              t.burstT > 0 && t.burstLeft > 0)
            ) {
              let e = Math.min(i, t.burstLeft);
              ((t.burstAbs += e),
                (t.burstLeft -= e),
                t.burstLeft <= 1e-6 &&
                  ((t.burstT = 0), this.later(X, () => this.shieldBurst(t))));
            }
          }
          l >= t.hp && this.sashSave(t) && (l = Math.max(0, t.hp - 1));
          let u = Math.min(l, Math.max(0, t.hp));
          t.hp -= l;
          let d = e.team !== t.team;
          if (
            ((t.taken += u),
            d && (e.dealt += u),
            r && d && (e.dealtAbility += u),
            (t.tHit = this.time),
            t.manaLockT <= 0 &&
              (t.mana = Math.min(
                t.maxMana,
                t.mana + Math.min(8, n / 40) * t.manaOnHit,
              )),
            t.wakeAt > 0 &&
              t.stun > 0 &&
              t.stunKind === `sleep` &&
              this.time >= t.wakeAt &&
              e !== t &&
              t.hp > 0 &&
              this.wakeUp(t, e),
            this.emit({
              k: `dmg`,
              t: this.time,
              uid: t.uid,
              src: e.uid,
              amount: Math.round(n * i),
              eff: i,
              ability: r,
              ...(a ? { crit: a } : {}),
              ...(s ? { emp: s } : {}),
            }),
            i === 0 &&
              this.statusText(t, `¡No afecta a ${t.name}…!`, `#ced4da`),
            t.hp <= 0)
          )
            (t.alive && d && e.kos++, this.faint(t));
          else {
            this.checkSitrus(t);
            let e = t.move.rage;
            e &&
              d &&
              ++t.rageN >= e.hits &&
              ((t.rageN = 0),
              (t.frenzyAs =
                this.time < t.frenzyT ? Math.max(t.frenzyAs, e.as) : e.as),
              (t.frenzyT = Math.max(t.frenzyT, this.time + e.t)),
              this.emit({
                k: `frenzy`,
                t: this.time,
                uid: t.uid,
                as: t.frenzyAs,
                dur: e.t,
              }),
              this.statusText(t, `¡Se enfurece!`, `#ff8787`));
          }
          e.lifesteal > 0 &&
            u > 0 &&
            e !== t &&
            this.heal(e, u * e.lifesteal, !1);
        }
        sashSave(t, n = !1) {
          return !n && !e.sashReady(t)
            ? !1
            : (t.sash--,
              (t.shield += t.maxHp * C.sashShield),
              (t.sashT = C.sashGuard),
              (t.untargetT = Math.max(t.untargetT, C.sashGuard)),
              this.clearDots(t),
              (t.woundT = 0),
              (t.woundPct = 0),
              (t.sunderT = 0),
              (t.sunderPct = 0),
              this.dropAggro(t, t),
              this.emit({
                k: `text`,
                t: this.time,
                uid: t.uid,
                text: `¡Aguantó con la Banda Focus!`,
                color: `#ff922b`,
              }),
              (t.textT = this.time),
              !0);
        }
        static sashReady(e) {
          return e.sash > 0 && (e.hp > 1 || e.sash < Ki(e, `focus-sash`));
        }
        clearDots(e) {
          ((e.burnT = 0),
            (e.burnDps = 0),
            (e.burnSrc = -1),
            (e.poisonT = 0),
            (e.poisonDps = 0),
            (e.poisonGrow = 0),
            (e.poisonMax = 0),
            (e.poisonSrc = -1),
            (e.seedT = 0),
            (e.seedDps = 0),
            (e.seedAcc = 0),
            (e.seedSrc = -1),
            e.dotAcc > 0 && this.flushDot(e),
            (e.dotAcc = 0),
            (e.dotT = 0),
            (e.dotSrc = -1));
        }
        static dotBlocked(e) {
          return e.sashT > 0;
        }
        checkSitrus(e) {
          !e.sitrus ||
            !e.alive ||
            e.hp >= e.maxHp * C.sitrusAt ||
            ((e.sitrus = !1),
            this.heal(e, e.maxHp * (e.sitrusK || C.sitrusHeal), !0),
            this.emit({
              k: `text`,
              t: this.time,
              uid: e.uid,
              text: `¡Comió su Baya Zidra!`,
              color: `#ffd43b`,
            }),
            (e.textT = this.time));
        }
        dot(t, n, r) {
          if (t.sashT > 0) return;
          n *= Z;
          let i = n >= t.hp && e.sashReady(t);
          i && (n = Math.max(0, t.hp - 1));
          let a = Math.min(n, Math.max(0, t.hp));
          t.dotTaken += a;
          let o = r >= 0 && r !== t.uid ? this.byUid(r) : void 0;
          (o && (o.dotDealt += a),
            (t.hp -= n),
            (t.dotAcc += n),
            r >= 0 && (t.dotSrc = r),
            i && this.sashSave(t, !0),
            t.hp <= 0
              ? (o && t.alive && o.kos++, this.flushDot(t), this.faint(t))
              : this.checkSitrus(t));
        }
        flushDot(e) {
          let t = Math.round(e.dotAcc);
          ((e.dotAcc = 0),
            (e.dotT = 0),
            !(t < 1) &&
              this.emit({
                k: `dmg`,
                t: this.time,
                uid: e.uid,
                src: e.dotSrc >= 0 ? e.dotSrc : e.uid,
                amount: t,
                eff: 1,
                ability: !1,
                dot: !0,
              }));
        }
        heal(e, t, n, r = e) {
          if (!e.alive) return;
          let i = Math.min(
            e.maxHp - e.hp,
            t * (e.woundT > 0 ? Math.max(0, 1 - e.woundPct) : 1),
          );
          ((e.hp += i),
            (r.healed += i),
            n &&
              i > 1 &&
              this.emit({
                k: `heal`,
                t: this.time,
                uid: e.uid,
                amount: Math.round(i),
              }));
        }
        applyWound(t, n, r) {
          t.alive &&
            !e.dotBlocked(t) &&
            ((t.woundT <= 0 || n >= t.woundPct) && (t.woundPct = n),
            (t.woundT = Math.max(t.woundT, r)));
        }
        applySunder(t, n, r) {
          t.alive &&
            !e.dotBlocked(t) &&
            ((t.sunderT <= 0 || n >= t.sunderPct) && (t.sunderPct = n),
            (t.sunderT = Math.max(t.sunderT, r)));
        }
        flameAura(e) {
          for (let t of this.enemiesOf(e))
            !t.alive ||
              t.untargetT > 0 ||
              M(e.cell, t.cell) > 1 ||
              (this.dot(t, (t.maxHp * C.orbBurn * e.auraN) / Z, e.uid),
              t.alive && this.applyWound(t, e.auraWound, C.orbWoundT));
        }
        faint(e) {
          if (e.alive) {
            if ((this.releaseHold(e), this.occ[e.cell]--, e.foot))
              for (let t of e.foot) t !== e.cell && this.occ[t]--;
            ((e.alive = !1),
              (e.hp = 0),
              (e.tFaint = this.time),
              this.emit({ k: `faint`, t: this.time, uid: e.uid }),
              e.charge > 0 && e.move.store && !this.over && this.chargeBoom(e));
          }
        }
        chargeBoom(e) {
          let t = e.move.store,
            n = e.charge,
            r = t.radius;
          ((e.charge = 0),
            this.units.some((t) => t.alive && t.team === e.team) ||
              (this.boomLoser = e.team),
            this.emit({
              k: `burst`,
              t: this.time,
              uid: e.uid,
              cells: J(e.cell, r),
              amount: Math.round(n),
            }));
          let i = {
            name: e.move.name,
            type: e.move.type,
            kind: `aoeSelf`,
            mana: 0,
            power: n,
            radius: r,
            scale: e.move.scale,
          };
          for (let t of this.enemiesOf(e))
            this.dist(e.cell, t) <= r && this.abilityHit(e, t, i);
        }
        dist(e, t) {
          if (!t.foot) return M(e, t.cell);
          let n = 1 / 0;
          for (let r of t.foot) {
            let t = M(e, r);
            t < n && (n = t);
          }
          return n;
        }
        teleDest(e, t, n) {
          if (e.foot || e.boss) return -1;
          let r = this.units.filter((t) => t.alive && t.team !== e.team);
          if (!r.length) return -1;
          let i = (e) => {
            let t = 1 / 0;
            for (let n of r) {
              let r = this.dist(e, n);
              r < t && (t = r);
            }
            return t;
          };
          if (n === -1) return -1;
          let a = (n) =>
            n !== e.cell &&
            !this.occupied(n) &&
            !(t && this.dist(n, t) > e.range);
          if (n !== void 0 && a(n)) return n;
          let o = (e) => {
              let t = -1,
                n = e;
              for (let e = 0; e < 56; e++) {
                if (!a(e)) continue;
                let r = i(e);
                r > n && ((n = r), (t = e));
              }
              return t;
            },
            s = o(i(e.cell));
          if (s >= 0 || n === void 0) return s;
          let c = o(i(e.cell) - 1);
          return c >= 0
            ? c
            : n !== e.cell &&
                !this.occupied(n) &&
                r.some((t) => t.untargetT <= 0 && this.dist(n, t) <= e.range)
              ? n
              : -1;
        }
        adj(e) {
          if (!e.foot) return an(e.cell);
          let t = [];
          for (let n of e.foot)
            for (let r of an(n))
              !e.foot.includes(r) && !t.includes(r) && t.push(r);
          return t;
        }
        inCells(e, t) {
          return t.foot
            ? t.foot.some((t) => e.includes(t))
            : e.includes(t.cell);
        }
        tickItemOff(e) {
          for (let t of this.units)
            !t.itemOffT ||
              t.itemOffT <= 0 ||
              ((t.itemOffT -= e),
              t.itemOffT <= 0 &&
                ((t.itemOffT = 0), t.itemDelta && Fi(t, t.itemDelta, 1)));
        }
        host() {
          if (this.hostObj) return this.hostObj;
          let e = this;
          return (
            (this.hostObj = {
              get time() {
                return e.time;
              },
              rand: () => e.rand(),
              emit: (t) => e.emit(t),
              foes: (t) => e.enemiesOf(t),
              dist: (t, n) => e.dist(t, n),
              hit: (t, n, r, i = 1) => e.abilityHit(t, n, r, i),
              basic: (t, n) => e.basicAttack(t, n),
              interval: (t) => e.atkInterval(t),
              heal: (t, n) => e.heal(t, n, !0),
              swap: (t, n, r) => {
                let i = n.cell,
                  a = r.cell,
                  o = Math.max(Ea, M(i, a) / Da);
                (e.relocate(n, a, o),
                  e.relocate(r, i, o),
                  (n.target = -1),
                  (r.target = -1),
                  e.dropAggro(n, r),
                  e.emit({
                    k: `swap`,
                    t: e.time,
                    src: t.uid,
                    a: n.uid,
                    b: r.uid,
                    cellA: i,
                    cellB: a,
                    dur: o,
                  }));
              },
              itemOff: (t, n) => {
                t.itemDelta &&
                  ((!t.itemOffT || t.itemOffT <= 0) && Fi(t, t.itemDelta, -1),
                  (t.itemOffT = Math.max(t.itemOffT ?? 0, n)),
                  e.emit({ k: `itemOff`, t: e.time, uid: t.uid, dur: n }));
              },
              free: (t) => e.occ[t] === 0,
              moveFoot: (t, n) => {
                for (let n of t.foot) e.occ[n]--;
                ((t.foot = [...n]),
                  (t.cell = t.from = n[0]),
                  (t.moving = !1),
                  (t.moveT = 1));
                for (let t of n) e.occ[t]++;
              },
              recharge: (t, n) => {
                e.hardCC(t, n, `recharge`, t, !0);
              },
            }),
            this.hostObj
          );
        }
        enemiesOf(e) {
          return this.units.filter(
            (t) => t.alive && t.team !== e.team && t.untargetT <= 0,
          );
        }
        alliesOf(e) {
          return this.units.filter((t) => t.alive && t.team === e.team);
        }
        alone(e) {
          return !this.units.some(
            (t) =>
              t.alive &&
              t !== e &&
              t.team === e.team &&
              t.untargetT <= 0 &&
              this.dist(t.cell, e) <= 1,
          );
        }
        abilityHit(e, t, n, r = 1) {
          if (t.untargetT > 0) return;
          let i = Hi(e, n),
            a = Ui(n, e),
            o =
              i === null
                ? (n.trueDmg ? 1 : 1.2) * e.g.atk
                : (a.atk > 0 ? a.atk * Di(e, `atk`, t, `def`) : 0) +
                  (a.spa > 0 ? a.spa * Di(e, `spa`, t, `spd`) : 0),
            s = n.trueDmg ? 1 : z(n.type, t.types),
            c = (e.noImmune || e.boss) && s === 0 ? 1 : s,
            l = c > 0 || !!n.statusMove,
            u = t.hp,
            d = t.team !== e.team;
          d && !n.trueDmg && (t.lastHitType = n.type);
          let f =
            !!n.hypno &&
            l &&
            !Bi(t, `sleep`) &&
            this.time >= t.ccImmune &&
            !(t.stun <= 0 && this.mentalHerb(t));
          if (
            (f &&
              this.emit({
                k: `sleepBreak`,
                t: this.time,
                src: e.uid,
                uid: t.uid,
              }),
            n.pctHp)
          ) {
            let i =
              v[t.line].cost >= 5 || t.star >= 3 || t.boss
                ? Math.min(n.pctHp, n.pctHpCap ?? 0.4)
                : n.pctHp;
            c > 0 && this.damage(e, t, t.hp * i * r, !0, 1, !1, !0);
          } else {
            let a = Ri(e, n),
              s =
                (n.power ?? 0) *
                r *
                sn[e.role].stats.abilityK *
                e.costMult *
                this.wxMove(n.type),
              l = s * o * (1 + a / 100);
            (n.dmgDef && i !== null && (l += s * n.dmgDef * Oi(e, t)),
              n.dmgHp &&
                i !== null &&
                (l +=
                  e.maxHp *
                  n.dmgHp *
                  r *
                  sn[e.role].stats.abilityK *
                  this.wxMove(n.type) *
                  ki(t)),
              n.vsStatus &&
                (Bi(t, n.vsStatus.status) ||
                  (f && n.vsStatus.status === `sleep`)) &&
                (l *= 1 + n.vsStatus.pct / 100),
              n.vsAlone && this.alone(t) && (l *= 1 + n.vsAlone / 100));
            let u =
              l > 0 &&
              !!n.canCrit &&
              this.rand() < e.critChance + (n.critBonus ?? 0);
            if (
              (u && (l *= pa + C.scopeCritDmg * Ki(e, `scope-lens`)),
              n.vsMissing &&
                l > 0 &&
                (l +=
                  (Math.max(0, t.maxHp - t.hp) *
                    n.vsMissing *
                    (t.boss ? ba : 1)) /
                  Z),
              n.vsMaxHp &&
                l > 0 &&
                (l += (t.maxHp * n.vsMaxHp * r * (t.boss ? Ia : 1)) / Z),
              n.allyBoost &&
                !n.empower &&
                l > 0 &&
                (l *=
                  1 +
                  (this.alliesOf(e).filter(
                    (t) => t !== e && t.traits.includes(n.allyBoost.trait),
                  ).length *
                    n.allyBoost.pct) /
                    100),
              l > 0 && this.damage(e, t, l, !0, c, u),
              n.payDay && l > 0 && c > 0 && d)
            ) {
              let t = e.team;
              ++this.payHits[t] % n.payDay === 0 &&
                this.payDay[t] < 1 &&
                (this.payDay[t]++,
                this.emit({
                  k: `text`,
                  t: this.time,
                  uid: e.uid,
                  text: `¡Día de Pago!`,
                  color: `#ffd43b`,
                }),
                (e.textT = this.time));
            }
          }
          if (n.leech && e.alive && d) {
            let r = Math.max(0, u - Math.max(0, t.hp));
            r > 0 && this.heal(e, r * n.leech, !0);
          }
          if (
            (n.wakeHit &&
              t.alive &&
              c > 0 &&
              Bi(t, `sleep`) &&
              this.wakeUp(t, e),
            n.type === `Fire` && c > 0 && t.freezeT > 0 && this.thaw(t),
            n.recoil && e.alive)
          ) {
            let r = Math.max(0, u - Math.max(0, t.hp)) * n.recoil;
            r >= 1 &&
              ((e.hp = Math.max(1, e.hp - r)),
              (e.taken += r),
              this.emit({
                k: `dmg`,
                t: this.time,
                uid: e.uid,
                src: e.uid,
                amount: Math.round(r),
                eff: 1,
                ability: !1,
              }));
          }
          if (t.alive) {
            if (
              (e.castSunder > 0 &&
                c > 0 &&
                t.team !== e.team &&
                this.applySunder(t, e.castSunder, C.spoonSunderT),
              n.sunderT &&
                l &&
                d &&
                !(n.powder && Va(t, `powder`)) &&
                this.applySunder(t, C.sunderPct, n.sunderT),
              n.atkDown &&
                l &&
                d &&
                (t.atkDownT <= 0 &&
                  this.statusText(t, `¡Baja su Ataque!`, `#ff8787`),
                (t.atkDownPct =
                  t.atkDownT > 0
                    ? Math.max(t.atkDownPct, n.atkDown.pct)
                    : n.atkDown.pct),
                (t.atkDownT = Math.max(
                  t.atkDownT,
                  n.atkDown.t * (t.boss ? q.cc : 1),
                ))),
              n.dreamEat && n.stun && l && d
                ? this.dreamSleep(t, n)
                : n.stun &&
                  l &&
                  !(n.powder && this.immune(t, `powder`)) &&
                  (this.applyStun(t, n.stun, Yi(n)),
                  n.wake && this.sleepFragile(t),
                  n.sleepMark &&
                    Bi(t, `sleep`) &&
                    (t.markPct = Math.max(t.markPct, n.sleepMark))),
              n.burn &&
                c > 0 &&
                this.applyBurn(e, t, n.burn * $[e.star - 1], !1, n.burnT ?? 3),
              n.poison && !(n.powder && this.immune(t, `powder`)))
            ) {
              let r = n.poison * $[e.star - 1];
              this.applyPoison(e, t, r, n.toxic ? r * n.toxic : 0);
            }
            if (
              (l &&
                ((n.manaLock || n.manaDrain) &&
                  this.applyManaLock(e, t, n.manaLock ?? 0, !!n.manaDrain),
                n.blind &&
                  ((t.blindN = Math.max(t.blindN, n.blind)),
                  (t.blindT = Ua),
                  this.emit({
                    k: `blind`,
                    t: this.time,
                    src: e.uid,
                    uid: t.uid,
                    hits: n.blind,
                  })),
                n.confuse && n.confuseAcc && t.team !== e.team
                  ? ((e.confAcc += n.confuseAcc),
                    e.confAcc >= 100 - 1e-9 &&
                      ((e.confAcc -= 100), this.applyConfuse(t, n.confuse, e)))
                  : n.confuse && this.applyConfuse(t, n.confuse, e),
                n.haze && this.haze(e, t)),
              n.slow)
            ) {
              let e =
                n.slowMax && t.slowT > 0
                  ? Math.min(n.slowMax, t.slowPct + n.slow)
                  : n.slow;
              ((t.slowT = n.slowT ? Math.max(t.slowT, n.slowT) : 3),
                (t.slowPct = Math.max(t.slowPct, e)));
            }
            l &&
              !n.throw &&
              (n.airborne && this.hardCC(t, n.airborne, `airborne`, e),
              n.freeze &&
                t.hp < t.maxHp * (n.freezeBelow ?? 1) &&
                this.hardCC(t, n.freeze, `freeze`, e),
              n.fear && this.hardCC(t, n.fear, `fear`, e));
          }
        }
        moveCells(e, t, n) {
          if (n.shape === `board`) return this.enemiesOf(e).map((e) => e.cell);
          if (n.dive)
            return J(t.cell, Math.max(n.radius ?? 0, +(n.dive === `shadow`)));
          if (n.chain) return this.chainHops(e, t, n).map((e) => e.cell);
          if (n.swap) {
            let n = this.swapAlly(e, t);
            return n ? [t.cell, n.cell] : [t.cell];
          }
          if (n.charge) return this.shapeCells(e, t, `line`, n.len ?? 12, 1);
          if (n.bolts || n.boltsAll)
            return [
              ...new Set(
                this.boltCenters(e, n).flatMap((e) => J(e, n.radius ?? 1)),
              ),
            ];
          if (n.shape) return this.shapeCells(e, t, n.shape, n.len, n.width);
          switch (n.kind) {
            case `line`:
              return this.shapeCells(e, t, `line`, n.len, n.width);
            case `aoeTarget`:
              return J(t.cell, n.radius ?? 1);
            case `aoeSelf`:
              return J(e.cell, n.radius ?? 1);
            case `heal`:
            case `shield`:
            case `buff`:
            case `rest`:
            case `splash`:
            case `teleport`:
            case `transform`:
            case `metronome`:
              return [e.cell];
            default:
              return [t.cell];
          }
        }
        static shapeOf(e) {
          return e.shape ?? (e.kind === `line` ? `line` : void 0);
        }
        startCharge(t, n) {
          let r = this.resolveMove(t, t.move);
          (r.reSwoop && ({ mv: r, tgt: n } = this.reSwoop(t, r, n)),
            (t.diveCast = !!r.dive),
            this.pending.set(t.uid, r),
            r.pick && r.kind !== `multi` && (n = this.pickFor(t, r, n)),
            e.singleTarget(r) &&
              this.moveUseless(t, r, n) &&
              (n = this.usefulTarget(t, r, n) ?? n),
            (t.charging = !0),
            (t.tCharge = this.time),
            (t.chargeTgt = n.uid),
            (t.castWindup = p(r).windup),
            r.kind === `teleport` &&
              ((t.teleTo = this.teleDest(
                t,
                n.alive && n.team !== t.team ? n : void 0,
              )),
              this.telePlan.set(t.uid, t.teleTo)));
          let i = r.dive ?? r.hide;
          (i && ((t.untargetT = t.castWindup + 0.1), (t.untargetKind = i)),
            (r.bolts || r.boltsAll) &&
              this.boltPlan.set(t.uid, {
                mv: r,
                centers: this.planBolts(t, r),
              }));
          let a = e.shapeOf(r);
          this.emit({
            k: `charge`,
            t: this.time,
            src: t.uid,
            name: r.name,
            type: r.type,
            kind: r.kind,
            dst: n.uid,
            windup: t.castWindup,
            cells: this.moveCells(t, n, r),
            ...(a ? { shape: a } : {}),
            ...(i ? { hide: i } : {}),
          });
        }
        cast(t, n, r) {
          let i = r ?? t.move;
          if (
            (this.pending.delete(t.uid),
            (t.mana = 0),
            (t.tCast = this.time),
            i.kind === `metronome`)
          ) {
            let e = Math.floor(this.rand() * g.length),
              r = g[e];
            ((i = r.power ? { ...r, power: r.power * na } : r),
              this.emit({
                k: `text`,
                t: this.time,
                uid: t.uid,
                text: `Metrónomo → ${i.name}`,
                color: `#ffe066`,
                metro: e,
              }),
              (i = this.resolveMove(t, i)),
              i.reSwoop && ({ mv: i, tgt: n } = this.reSwoop(t, i, n)),
              i.pick && i.kind !== `multi` && (n = this.pickFor(t, i, n)));
          }
          (i.rampUse &&
            t.uses > 0 &&
            (i = { ...i, power: (i.power ?? 0) * (1 + i.rampUse * t.uses) }),
            t.uses++,
            i.convert &&
              ((i = this.convertCast(t, i)),
              n.team !== t.team &&
                e.singleTarget(i) &&
                this.moveUseless(t, i, n) &&
                (n = this.usefulTarget(t, i, n) ?? n)));
          let a = p(i),
            o = a.active,
            s = $[t.star - 1],
            c = i.fade ? Math.max(Xi, 1 - i.fade * this.time) : 1,
            l = [n.cell],
            u = this.enemiesOf(t),
            d = (e, t) => this.later(Math.max(X, o * e), t),
            m = (e, n = 1) => {
              e.alive &&
                (this.abilityHit(t, e, i, n),
                i.execBelow && this.tryExecute(t, e, i.execBelow),
                i.push && this.pushOne(t, e, i));
            },
            _ = (e) => {
              ((o = e.active), (l = e.cells));
            },
            y = (e) => {
              if (!i.push) return;
              let r = i.push > 0 ? -1 : 1,
                a = [...e].sort(
                  (e, n) => r * (M(t.cell, e.cell) - M(t.cell, n.cell)),
                );
              d(1, () => {
                for (let e of a)
                  this.pushOne(
                    t,
                    e,
                    i,
                    e === n && i.pushMain ? i.pushMain : i.push,
                  );
              });
            },
            ee = this.events.length;
          switch (i.kind) {
            case `nuke`:
            case `execute`: {
              let e = n;
              if (i.swap) {
                _(this.swapCast(t, e, i));
                break;
              }
              if (i.chain) {
                let n = this.chainHops(t, e, i),
                  r = i.chainStunAll ? i : { ...i, stun: void 0 };
                (this.emit({
                  k: `chain`,
                  t: this.time,
                  src: t.uid,
                  name: i.name,
                  hops: n.map((e) => e.uid),
                  gap: Ta,
                }),
                  n.forEach((e, a) =>
                    this.later(0.1 + a * Ta, () => {
                      t.alive &&
                        e.alive &&
                        (this.emit({
                          k: `strike`,
                          t: this.time,
                          src: t.uid,
                          dst: e.uid,
                          i: a,
                          n: n.length,
                          name: i.name,
                        }),
                        this.abilityHit(
                          t,
                          e,
                          a ? r : i,
                          B(1 - (i.chainDecay ?? 0), a),
                        ));
                    }),
                  ),
                  _({
                    active: 0.1 + (n.length - 1) * Ta,
                    cells: n.map((e) => e.cell),
                  }));
                break;
              }
              if (i.throw) {
                (d(1, () => {
                  e.alive && t.alive && this.throwUnit(t, e, i);
                }),
                  (o += (i.throw ?? 2) / Sa));
                break;
              }
              (i.grab &&
                e.team !== t.team &&
                (this.applyStun(e, i.grab, `flinch`),
                (o = Math.max(o, i.grab))),
                d(1, () => {
                  if (!e.alive) return;
                  (i.gust && t.alive && this.gust(t, e, i),
                    m(e),
                    i.execSplash &&
                      !e.alive &&
                      t.alive &&
                      this.execSplash(t, e, i),
                    i.spit && e.alive && t.alive && this.spitOut(t, e, i.spit),
                    i.bind && this.startBind(t, e, i));
                  let n = i.zone;
                  if (
                    (n &&
                      (n.anchor
                        ? e.alive && this.addZone(t, i, [e.cell], e)
                        : this.addZone(
                            t,
                            i,
                            J(e.cell, n.radius ?? i.radius ?? 0),
                          )),
                    i.kind === `execute` &&
                      e.alive &&
                      !e.boss &&
                      e.sashT <= 0 &&
                      e.hp / e.maxHp < 0.25 &&
                      (t.noImmune || z(i.type, e.types) > 0))
                  ) {
                    if (this.sashSave(e)) {
                      e.hp = Math.min(e.hp, 1);
                      return;
                    }
                    (this.emit({
                      k: `text`,
                      t: this.time,
                      uid: e.uid,
                      text: `¡KO en un golpe!`,
                      color: `#ff6b6b`,
                    }),
                      this.faint(e));
                  }
                }));
              break;
            }
            case `drain`: {
              let e = n;
              if (i.seed) {
                d(1, () => {
                  e.alive && t.alive && this.plantSeed(t, e, i);
                });
                break;
              }
              d(1, () => {
                if (!e.alive) return;
                let n = e.hp;
                (this.abilityHit(t, e, i),
                  t.alive &&
                    this.heal(
                      t,
                      Math.max(0, n - Math.max(0, e.hp)) * (i.heal ?? 0.5),
                      !0,
                    ));
              });
              break;
            }
            case `multi`: {
              let e =
                  (i.hitsMin && i.hitsMin < (i.hits ?? 2)
                    ? i.hitsMin === 2 && i.hits === 5
                      ? Ma[Math.floor(this.rand() * Ma.length)]
                      : i.hitsMin +
                        Math.floor(
                          this.rand() * ((i.hits ?? 2) - i.hitsMin + 1),
                        )
                    : (i.hits ?? 2)) +
                  (i.perAsHit ? Math.floor(t.itemAs / i.perAsHit + 1e-9) : 0),
                r = e > 1 ? Math.max(f, (o - 0.1) / (e - 1)) : 0;
              o = Math.max(o, 0.1 + r * (e - 1));
              let a = i.spread
                ? [
                    n,
                    ...u
                      .filter((e) => e !== n)
                      .sort(
                        (e, t) =>
                          M(n.cell, e.cell) - M(n.cell, t.cell) ||
                          e.uid - t.uid,
                      ),
                  ]
                : [];
              i.spread && (l = a.slice(0, e).map((e) => e.cell));
              let s = Array.from({ length: e }, (t, n) => {
                  var r;
                  let a =
                    (r = i.seq) != null && r.length
                      ? { ...i, ...i.seq[n % i.seq.length] }
                      : i;
                  return (
                    i.stunLast &&
                      n < e - 1 &&
                      (a = { ...a, stun: void 0, freeze: void 0 }),
                    a
                  );
                }),
                c = !i.spread && !i.pick && (i.radius ?? 0) > 0 ? i.radius : 0,
                d = n.cell;
              c && (l = J(d, c));
              for (let o = 0; o < e; o++)
                this.later(0.1 + o * r, () => {
                  if (c) {
                    if (!t.alive) return;
                    (n.alive && (d = n.cell),
                      this.emit({
                        k: `strike`,
                        t: this.time,
                        src: t.uid,
                        dst: n.uid,
                        i: o,
                        n: e,
                        name: s[o].name,
                      }));
                    for (let e of this.enemiesOf(t))
                      this.dist(d, e) <= c && this.abilityHit(t, e, s[o]);
                  } else if (i.spread) {
                    var r;
                    let n = a.filter((e) => e.alive && e.untargetT <= 0);
                    if (!t.alive || !n.length) return;
                    let c = n[o % n.length];
                    (this.emit({
                      k: `strike`,
                      t: this.time,
                      src: t.uid,
                      dst: c.uid,
                      i: o,
                      n: e,
                      name: i.name,
                    }),
                      this.abilityHit(t, c, s[o]),
                      (r = i.zone) != null &&
                        r.anchor &&
                        c.alive &&
                        c.untargetT <= 0 &&
                        !c.foot &&
                        this.addZone(t, i, [c.cell], c));
                  } else if (i.seq) {
                    if (!t.alive || !n.alive) return;
                    (this.emit({
                      k: `strike`,
                      t: this.time,
                      src: t.uid,
                      dst: n.uid,
                      i: o,
                      n: e,
                      name: s[o].name,
                    }),
                      this.abilityHit(t, n, s[o]));
                  } else if (i.pick) {
                    let n = this.selectTarget(t, i.pick);
                    if (!n) return;
                    (this.emit({
                      k: `strike`,
                      t: this.time,
                      src: t.uid,
                      dst: n.uid,
                      i: o,
                      n: e,
                      name: i.name,
                    }),
                      this.abilityHit(t, n, i));
                  } else if (i.retarget) {
                    if (!t.alive) return;
                    let r = n;
                    if (!n.alive || n.untargetT > 0) {
                      let e = this.foesFor(t).filter(
                        (e) => !this.moveUseless(t, i, e),
                      );
                      r = e.length ? this.nearestTo(n, e) : void 0;
                    }
                    if (!r) return;
                    (r !== n &&
                      this.emit({
                        k: `strike`,
                        t: this.time,
                        src: t.uid,
                        dst: r.uid,
                        i: o,
                        n: e,
                        name: i.name,
                      }),
                      this.abilityHit(t, r, s[o]));
                  } else t.alive && n.alive && this.abilityHit(t, n, s[o]);
                });
              break;
            }
            case `aoeTarget`:
            case `aoeSelf`:
              if (i.bolts || i.boltsAll) {
                _(this.boltsCast(t, i));
                break;
              }
              if (i.shape === `board`) {
                l = u.map((e) => e.cell);
                let e = Math.max(1, ...u.map((e) => this.dist(t.cell, e)));
                for (let n of u)
                  d(0.25 + (0.6 * this.dist(t.cell, n)) / e, () => {
                    n.alive && this.abilityHit(t, n, i);
                  });
                y(u);
              } else {
                let e = i.kind === `aoeTarget` ? n.cell : t.cell,
                  r = i.radius ?? 1;
                l = i.shape
                  ? this.shapeCells(t, n, i.shape, i.len, i.width)
                  : J(e, r);
                let a = i.shape
                    ? u.filter((e) => this.inCells(l, e))
                    : u.filter((t) => this.dist(e, t) <= r),
                  s = i.kind === `aoeTarget` ? 0.6 : 0.3,
                  c =
                    i.mainHit && n.team !== t.team && a.includes(n)
                      ? n
                      : void 0,
                  f = Math.max(1, i.hits ?? 1),
                  p = f > 1 && i.stunLast ? { ...i, stun: void 0 } : i,
                  m = c ? { ...p, fear: void 0 } : p;
                for (let o of a)
                  d(s + ((0.85 - s) * this.dist(e, o)) / Math.max(1, r), () => {
                    o.alive &&
                      this.abilityHit(
                        t,
                        o,
                        o === c ? m : p,
                        i.aoeK !== void 0 && o !== n ? i.aoeK : 1,
                      );
                  });
                for (let a = 1; a < f; a++) {
                  let s = i.stunLast && a < f - 1 ? p : i;
                  this.later(Math.max(X, o) + (a - 1) * wa + wa * 0.5, () => {
                    if (!t.alive) return;
                    let o =
                      i.kind === `aoeTarget` ? (n.alive ? n.cell : e) : t.cell;
                    this.emit({
                      k: `strike`,
                      t: this.time,
                      src: t.uid,
                      dst: t.uid,
                      i: a,
                      n: f,
                      name: i.name,
                    });
                    for (let e of this.enemiesOf(t))
                      this.dist(o, e) <= r &&
                        this.abilityHit(
                          t,
                          e,
                          s,
                          i.aoeK !== void 0 && e !== n ? i.aoeK : 1,
                        );
                  });
                }
                if (
                  (f > 1 && (o += (f - 1) * wa),
                  y(c ? a.filter((e) => e !== c) : a),
                  c && i.mainHit)
                ) {
                  let e = {
                    name: i.name,
                    type: i.type,
                    kind: `dash`,
                    mana: i.mana,
                    power: i.mainHit.power,
                    vsMissing: i.mainHit.vsMissing,
                    scale: i.scale,
                    esc: i.esc,
                  };
                  d(1, () => {
                    !t.alive ||
                      !c.alive ||
                      c.untargetT > 0 ||
                      (this.face(t, c),
                      this.emit({
                        k: `strike`,
                        t: this.time,
                        src: t.uid,
                        dst: c.uid,
                        i: 0,
                        n: 1,
                        name: i.name,
                      }),
                      this.abilityHit(t, c, e));
                  });
                }
                let h = i.extraFoes;
                if (h && i.kind === `aoeTarget`) {
                  let e = u
                      .filter(
                        (e) =>
                          e !== n && !a.includes(e) && M(e.cell, n.cell) <= ja,
                      )
                      .sort(
                        (e, t) =>
                          M(e.cell, n.cell) - M(t.cell, n.cell) ||
                          e.uid - t.uid,
                      )
                      .slice(0, h.n),
                    r = i.zone
                      ? { ...i, zone: { ...i.zone, dur: h.dur } }
                      : void 0;
                  for (let n of e)
                    d(s, () => {
                      n.alive &&
                        (this.abilityHit(t, n, i, h.k),
                        r &&
                          n.alive &&
                          n.untargetT <= 0 &&
                          this.addZone(t, r, [n.cell], n));
                    });
                  l = [...l, ...e.map((e) => e.cell)];
                }
                let g = i.zone;
                if (g) {
                  if (g.anchor)
                    d(s, () => {
                      n.alive &&
                        n.untargetT <= 0 &&
                        this.addZone(t, i, [n.cell], n);
                    });
                  else {
                    let n = J(e, g.radius ?? r);
                    d(s, () => this.addZone(t, i, n));
                  }
                }
              }
              if (i.allySplash) {
                let e = {
                  name: i.name,
                  type: i.type,
                  kind: i.kind,
                  mana: i.mana,
                  power: i.power,
                };
                for (let n of this.alliesOf(t))
                  n !== t &&
                    M(t.cell, n.cell) === 1 &&
                    d(0.25, () => {
                      n.alive && this.abilityHit(t, n, e, i.allySplash);
                    });
              }
              break;
            case `line`: {
              let e = i.len ?? 4.5;
              l = this.shapeCells(t, n, i.shape ?? `line`, e, i.width);
              let r = i.hits ?? 1,
                a = 1 / r,
                o = n,
                c = u.filter((e) => this.inCells(l, e));
              if (i.shape === `row`) {
                let e = l.map((e) => R(e).x),
                  n = Math.min(...e),
                  r = Math.max(...e),
                  a = Math.max(0.001, r - n),
                  o = R(t.cell).x <= (n + r) / 2,
                  u = (e) => 0.15 + (0.7 * (o ? R(e).x - n : r - R(e).x)) / a;
                for (let e of c) d(u(e.cell), () => m(e));
                if (i.allyShield) {
                  let e = Vi(t, i, i.allyShield * s);
                  for (let n of this.alliesOf(t))
                    l.includes(n.cell) &&
                      d(u(n.cell), () => {
                        n.alive &&
                          ((n.shield += e),
                          (t.shielded += e),
                          this.emit({
                            k: `shieldAlly`,
                            t: this.time,
                            src: t.uid,
                            uid: n.uid,
                            amount: Math.round(e),
                          }));
                      });
                }
                break;
              }
              for (let n = 0; n < r; n++) {
                n > 0 &&
                  d(n * a, () =>
                    this.emit({
                      k: `strike`,
                      t: this.time,
                      src: t.uid,
                      dst: t.uid,
                      i: n,
                      n: r,
                      name: i.name,
                    }),
                  );
                for (let r of c) {
                  let s = this.along(t, o, r.cell, e);
                  d(n * a + a * (n % 2 ? 1 - s : s), () => {
                    var e;
                    (m(r, i.aoeK !== void 0 && r !== o ? i.aoeK : 1),
                      n === 0 &&
                        (e = i.zone) != null &&
                        e.anchor &&
                        r.alive &&
                        r.untargetT <= 0 &&
                        !r.foot &&
                        this.addZone(t, i, [r.cell], r));
                  });
                }
              }
              if (i.zone && !i.zone.anchor) {
                let e = l;
                d(0.5, () => this.addZone(t, i, e));
              }
              break;
            }
            case `dash`: {
              if (i.dive) {
                _(this.dive(t, n, i));
                break;
              }
              if (i.charge) {
                _(this.chargeCast(t, n, i));
                break;
              }
              if ((i.hits ?? 1) > 1) {
                let e = i.hits ?? 1;
                t.castRecover = a.recover;
                let r = n.alive && n.team !== t.team ? n : void 0;
                ((l = r ? [r.cell] : [t.cell]),
                  (o = e * 0.35),
                  this.later(X, () => this.rush(t, i, 0, e, r)));
                break;
              }
              let e = u.filter(
                  (e) =>
                    this.dashFits(t, i, e) &&
                    !this.scaredOf(t, e) &&
                    e.camoT <= 0,
                ),
                r =
                  i.pick && n.alive && n.team !== t.team && e.includes(n)
                    ? n
                    : e.length
                      ? i.pick
                        ? this.selectTarget(t, i.pick, void 0, e)
                        : e.includes(n)
                          ? n
                          : this.nearestTo(n, e)
                      : n,
                s = this.adj(r)
                  .filter((e) => !this.occupied(e))
                  .sort((e, n) => M(t.cell, e) - M(t.cell, n))[0],
                c = aa,
                d = t.cell;
              (s !== void 0 &&
                s !== t.cell &&
                ((c = Math.max(1, M(t.cell, s)) / Q),
                (t.from = t.cell),
                this.setCell(t, s),
                (t.moveT = 0),
                (t.moving = !0),
                (t.moveSpeed = Q)),
                (t.target = r.uid),
                (l = [r.cell]));
              let p =
                Math.max(1, i.combo ?? 1) +
                (i.perAsHit ? Math.floor(t.itemAs / i.perAsHit + 1e-9) : 0);
              if (((o = c + (p - 1) * f), i.back && d !== t.cell)) {
                let e = Math.max(1, M(t.cell, d)) / Q;
                (this.later(o + X, () => {
                  if (!t.alive || t.stun > 0 || t.moving || this.occupied(d))
                    return;
                  let n = t.cell;
                  (this.relocate(t, d, e),
                    (t.moveSpeed = Q),
                    this.emit({
                      k: `shove`,
                      t: this.time,
                      src: t.uid,
                      uid: t.uid,
                      from: n,
                      to: d,
                      dur: e,
                      mode: `dash`,
                    }));
                }),
                  (o += e + X));
              }
              for (let e = 1; e < p; e++)
                this.later(c + e * f, () => {
                  t.alive &&
                    r.alive &&
                    (this.emit({
                      k: `strike`,
                      t: this.time,
                      src: t.uid,
                      dst: r.uid,
                      i: e,
                      n: p,
                      name: i.name,
                    }),
                    this.abilityHit(t, r, i));
                });
              (this.later(c, () => {
                if (t.alive) {
                  if (!r.alive) i.crash && this.crashSelf(t, i.crash);
                  else if (
                    (p > 1 &&
                      this.emit({
                        k: `strike`,
                        t: this.time,
                        src: t.uid,
                        dst: r.uid,
                        i: 0,
                        n: p,
                        name: i.name,
                      }),
                    this.abilityHit(t, r, i),
                    i.resetOnKill)
                  ) {
                    let e = this.resets.get(t.uid) ?? 0;
                    !r.alive && e < i.resetOnKill
                      ? (this.resets.set(t.uid, e + 1), (t.mana = t.maxMana))
                      : this.resets.set(t.uid, 0);
                  }
                }
              }),
                (n = r));
              break;
            }
            case `heal`: {
              let e = this.alliesOf(t)
                .sort((e, t) => e.hp / e.maxHp - t.hp / t.maxHp)
                .slice(0, i.hits ?? 1);
              (e.forEach((n, r) =>
                d(e.length > 1 ? 0.5 + (0.5 * r) / (e.length - 1) : 1, () => {
                  if (
                    (this.heal(
                      n,
                      ((i.heal ?? 300) * s + (i.healHp ?? 0) * t.maxHp) *
                        Wi(t, i) *
                        c *
                        (n === t ? (i.selfK ?? 1) : 1),
                      !0,
                      t,
                    ),
                    i.haste && n !== t && (n.buffAs += i.haste),
                    i.cleanse && n.alive && this.cleanse(n, i.cleanse),
                    i.allyShield && n.alive)
                  ) {
                    let e = Vi(t, i, i.allyShield * s) * c;
                    ((n.shield += e),
                      (t.shielded += e),
                      this.emit({
                        k: `shieldAlly`,
                        t: this.time,
                        src: t.uid,
                        uid: n.uid,
                        amount: Math.round(e),
                      }));
                  }
                }),
              ),
                (l = e.map((e) => e.cell)),
                (n = e[0] ?? t));
              break;
            }
            case `shield`: {
              let e = Vi(t, i, (i.power ?? 200) * s),
                r = i.shieldRefresh ? Math.max(0, e - t.shield) : e;
              if (
                ((t.shield += r),
                (t.shielded += r),
                (l = [t.cell]),
                (n = t),
                i.burst &&
                  ((t.burstT = i.burstT ?? 4),
                  (t.burstLeft = e),
                  (t.burstAbs = 0),
                  (t.burstPct = i.burst)),
                i.zone)
              ) {
                let e = this.puddleCells(t, i);
                (d(0.5, () => this.addZone(t, i, e)), (l = e));
              }
              break;
            }
            case `buff`:
              ((l = [t.cell]),
                i.grow
                  ? this.growCast(t, i)
                  : i.barrier
                    ? (l = this.barrierCast(t, i))
                    : !i.empower &&
                      !i.frenzy &&
                      ((t.buffAs += i.power ?? 50), (t.buffDmg += 30)),
                (n = t));
              break;
            case `rest`: {
              (this.heal(t, t.maxHp * (i.heal ?? 1), !0), (t.stun = 0));
              let e = i.stun ?? 2.5;
              (this.applyStun(t, e, `sleep`, !0),
                i.exposed && ((t.exposedT = e), (t.exposedPct = i.exposed)),
                (l = [t.cell]),
                (n = t));
              break;
            }
            case `splash`:
              (this.emit({
                k: `text`,
                t: this.time,
                uid: t.uid,
                text: `¡Pero no pasó nada!`,
                color: `#ffffff`,
              }),
                (l = [t.cell]),
                (n = t));
              break;
            case `teleport`: {
              let e = n.alive && n.team !== t.team ? n : void 0,
                r = this.telePlan.get(t.uid);
              this.telePlan.delete(t.uid);
              let i = this.teleDest(t, e, r);
              if (i >= 0) {
                (this.setCell(t, i),
                  (t.from = i),
                  (t.moveT = 1),
                  (t.moving = !1));
                for (let e of this.units)
                  e.alive &&
                    e.team !== t.team &&
                    e.target === t.uid &&
                    (e.target = -1);
              }
              if (((t.teleTo = i), e && this.dist(t.cell, e) > t.range)) {
                let n = this.enemiesOf(t)
                  .filter((e) => this.dist(t.cell, e) <= t.range)
                  .sort(
                    (e, n) =>
                      this.dist(t.cell, e) - this.dist(t.cell, n) ||
                      e.uid - n.uid,
                  )[0];
                n && (e = n);
              }
              ((t.target = e ? e.uid : -1), (l = [t.cell]), (n = t));
              break;
            }
            case `transform`: {
              var te;
              let e = (e) =>
                  v[e.line].cost * B(3, e.star - 1) * 100 - M(t.cell, e.cell),
                r = (e) => !e.boss && e.line !== ia,
                i = u.filter(r),
                a = i.reduce(
                  (t, n) => (e(n) > e(t) ? n : t),
                  r(n) || n.boss ? n : (i[0] ?? n),
                );
              if (!r(a)) {
                ((l = [t.cell]), (n = t));
                break;
              }
              let o = v[a.line],
                s = Math.max(t.star, a.star),
                c = h(o, s),
                d = Y[c.num],
                f = t.hp / t.maxHp,
                p = v[t.line],
                m = li(
                  { role: t.role, cost: p.cost, id: o.id, stages: o.stages },
                  t.star,
                  d,
                ),
                g = Math.round(m.maxHp);
              (Object.assign(t, {
                num: c.num,
                shiny: t.shiny,
                name: d.name,
                types: d.types,
                traits: o.traits,
                move: bi(o, s, a.items),
                flexForm: yi(o, s, a.items),
                range: Math.max(1, o.range),
                atk: m.atk * t.atkK,
                def: m.def * t.defK * t.ironK,
                spa: m.spa * t.atkK,
                spd: m.spd * t.defK * t.zincK,
                as: m.as,
                g: m.g,
                weightkg: d.weightkg,
              }),
                (t.maxHp = Math.max(t.maxHp, g)),
                (t.phys = mi(m, t.role)),
                (t.maxMana = t.move.mana),
                (t.guardK = t.move.retaliate ?? 0),
                (t.charge =
                  ((te = t.move.store) == null ? void 0 : te.start) ?? 0),
                (t.noImmune = Gt[o.id] === `Ghost`),
                this.applyWeather(t),
                (t.mana = t.maxMana * ra),
                (t.hp = t.maxHp * f),
                (t.copyOf = a.uid),
                (t.tTransform = this.time),
                this.emit({ k: `transform`, t: this.time, uid: t.uid }),
                (l = [t.cell]),
                (n = t));
              break;
            }
          }
          if (i.empower) {
            var ne;
            let e = {
              ...i.empower,
              ...(((ne = i.empower.stars) == null ? void 0 : ne[t.star - 1]) ??
                {}),
            };
            e.perAs && (e.n += Math.floor(t.itemAs / e.perAs + 1e-9));
            let n = i.allyBoost
              ? (this.alliesOf(t).filter(
                  (e) => e !== t && e.traits.includes(i.allyBoost.trait),
                ).length *
                  i.allyBoost.pct) /
                100
              : 0;
            ((t.emp = {
              name: i.name,
              left: e.n,
              n: e.n,
              dmg: (e.dmg ?? 0) + n,
              crit: !!e.crit,
              bounce: e.bounce ?? 0,
              bounceK: e.bounceK ?? 0.5,
              twice: !!e.twice,
              twiceK: e.twiceK ?? 1,
              steal: e.steal ?? 0,
              stunLast: e.stunLast ?? 0,
              seq: e.seq,
              i: 0,
              ...(e.hitType ? { hitType: e.hitType } : {}),
              ...(e.cast ? { cast: i } : {}),
              ...(e.lastSpdDown ? { lastSpdDown: e.lastSpdDown } : {}),
              ...(e.vsSleep ? { vsSleep: e.vsSleep } : {}),
            }),
              (t.empT = this.time + o + a.recover + (e.dur ?? $i)),
              (t.atkCd = Math.min(t.atkCd, 0.05)),
              this.emit({
                k: `empower`,
                t: this.time,
                uid: t.uid,
                n: e.n,
                dur: e.dur ?? $i,
                name: i.name,
                ...(e.crit ? { crit: !0 } : {}),
                ...(e.bounce ? { bounce: e.bounce } : {}),
                ...(e.twice ? { twice: !0 } : {}),
              }));
          }
          if (i.frenzy) {
            var re;
            let e = i.frenzy,
              n = e.t + (e.perAs ? t.itemAs / e.perAs : 0);
            ((t.frenzyAs =
              e.as *
              (((re = e.starMul) == null ? void 0 : re[t.star - 1]) ?? 1)),
              (t.frenzyT = this.time + o + a.recover + n),
              (t.frenzyBounce = e.bounce ?? 0),
              (t.frenzyBounceK = e.bounceK ?? 0.5),
              this.emit({
                k: `frenzy`,
                t: this.time,
                uid: t.uid,
                as: t.frenzyAs,
                dur: o + a.recover + n,
              }));
          }
          (i.store &&
            t.alive &&
            ((t.charge += i.store.gain),
            this.emit({
              k: `store`,
              t: this.time,
              uid: t.uid,
              charge: Math.round(t.charge),
              gain: i.store.gain,
            })),
            t.manaRefund > 0 &&
              (t.mana = Math.min(t.maxMana, t.maxMana * t.manaRefund)),
            (t.castActive = o),
            (t.castRecover = a.recover),
            (t.recoverUntil = Math.max(
              t.recoverUntil,
              this.time + o + a.recover,
            )));
          let b = e.shapeOf(i),
            ie = this.events.splice(ee);
          this.emit({
            k: `cast`,
            t: this.time,
            src: t.uid,
            name: i.name,
            type: i.type,
            kind: i.kind,
            dst: n.uid,
            cells: l,
            active: o,
            recover: a.recover,
            ...(b ? { shape: b } : {}),
          });
          for (let e of ie) this.events.push(e);
          if (
            (i.recharge &&
              d(1, () => {
                t.alive && this.hardCC(t, i.recharge, `recharge`, t, !0);
              }),
            i.selfDestruct && (t.boomed = !0),
            i.selfDestruct &&
              d(1, () => {
                if (!t.alive) return;
                let e = Math.max(0, t.hp - 1);
                (e >= 1 &&
                  ((t.hp = 1),
                  (t.taken += e),
                  this.emit({
                    k: `dmg`,
                    t: this.time,
                    uid: t.uid,
                    src: t.uid,
                    amount: Math.round(e),
                    eff: 1,
                    ability: !1,
                  })),
                  this.hardCC(t, i.selfDestruct, `recharge`, t, !0));
              }),
            i.selfSunder &&
              d(1, () => {
                t.alive &&
                  this.applySunder(t, i.selfSunder.pct, i.selfSunder.t);
              }),
            i.selfConfuse &&
              d(1, () => {
                t.alive && this.applyConfuse(t, i.selfConfuse, t);
              }),
            i.selfShield)
          ) {
            let e = Vi(t, i, i.selfShield * s);
            ((t.shield += e), (t.shielded += e));
          }
          if (
            (i.spikes && (t.spikeDps = i.spikes * s * Wi(t, i)),
            i.shell && ((t.shellT = i.shell.t), (t.shellK = i.shell.k)),
            i.yawn && this.yawnCast(t, i.yawn),
            i.shieldAlly)
          ) {
            let e =
                this.alliesOf(t).sort(
                  (e, t) => e.hp / e.maxHp - t.hp / t.maxHp,
                )[0] ?? t,
              n = t.maxHp * i.shieldAlly * c * (e === t ? (i.selfK ?? 1) : 1);
            ((e.shield += n), (t.shielded += n));
          }
          if (
            ((i.provoke || t.guardK > 0) && this.guardCast(t, i, d),
            t.shock > 0)
          ) {
            for (let e of this.enemiesOf(t))
              if (this.dist(t.cell, e) === 1) {
                let n = z(`Electric`, e.types);
                if (n === 0) {
                  this.statusText(e, `¡No afecta a ${e.name}…!`, `#ced4da`);
                  continue;
                }
                (this.damage(t, e, t.shock, !0, n),
                  e.alive && this.applyStun(e, 0.5, `paralyze`));
              }
          }
        }
      }),
      (Ga = 1.5),
      (Ka = 0.1),
      (qa = (e) => 1 + (e - 1) * 0.1 + (e >= 5 ? Ka : 0)),
      (Ja = 75),
      (Ya = {
        atk: `protein`,
        spa: `calcium`,
        def: `iron`,
        spd: `zinc`,
        as: `carbos`,
        hp: `hp-up`,
      }),
      (Xa = Object.keys(Ya)),
      (Za = (() => {
        let e = Array(3136);
        for (let t = 0; t < 56; t++)
          for (let n = 0; n < 56; n++) {
            let r = R(n),
              i = (e) => {
                let t = R(e),
                  n = t.x - r.x,
                  i = t.z - r.z;
                return Math.sqrt(n * n + i * i);
              };
            e[t * 56 + n] = [...an(t)].sort((e, t) => i(e) - i(t) || e - t);
          }
        return e;
      })()),
      (Qa = new WeakMap()),
      ($a = { atk: 1, spa: 0 }),
      (eo = { atk: 0, spa: 1 }),
      (to = {
        sleep: [`¡Se durmió!`, `#cfe8ff`],
        paralyze: [`¡Está paralizado!`, `#ffe066`],
        confuse: [`¡Está confuso!`, `#e599f7`],
        flinch: [`¡Retrocedió!`, `#ffffff`],
      }));
  }))();
}
export {
  ln as $,
  Te as $t,
  Ci as A,
  _t as At,
  Jr as B,
  k as Bt,
  wi as C,
  D as Ct,
  zi as D,
  It as Dt,
  no as E,
  Dt as Et,
  Wi as F,
  St as Ft,
  Ur as G,
  ht as Gt,
  Vr as H,
  Nt as Ht,
  Kr as I,
  Rt as It,
  z as J,
  ke as Jt,
  Pn as K,
  ct as Kt,
  q as L,
  bt as Lt,
  ci as M,
  gt as Mt,
  Gi as N,
  vt as Nt,
  Ui as O,
  Lt as Ot,
  Va as P,
  Ct as Pt,
  cn as Q,
  st as Qt,
  Wr as R,
  Ht as Rt,
  yi as S,
  Et as St,
  ji as T,
  Pt as Tt,
  oi as U,
  xt as Ut,
  vr as V,
  Ft as Vt,
  si as W,
  Mt as Wt,
  Nn as X,
  at as Xt,
  Ln as Y,
  Ae as Yt,
  Mn as Z,
  rt as Zt,
  qa as _,
  dt as _n,
  j as _t,
  ta as a,
  _e as an,
  R as at,
  pi as b,
  Yt as bt,
  X as c,
  pe as cn,
  on as ct,
  Si as d,
  ue as dn,
  an as dt,
  ot as en,
  gn as et,
  Ti as f,
  it as fn,
  L as ft,
  li as g,
  fe as gn,
  Gt as gt,
  gi as h,
  we as hn,
  Kt as ht,
  Y as i,
  lt as in,
  F as it,
  Vi as j,
  pt as jt,
  za as k,
  mt as kt,
  Wa as l,
  le as ln,
  tn as lt,
  Hi as m,
  ce as mn,
  Wt as mt,
  Ra as n,
  De as nn,
  en as nt,
  $ as o,
  me as on,
  I as ot,
  di as p,
  de as pn,
  qt as pt,
  Fn as q,
  Oe as qt,
  pa as r,
  je as rn,
  P as rt,
  Ba as s,
  ge as sn,
  M as st,
  ya as t,
  Ee as tn,
  N as tt,
  Ri as u,
  ft as un,
  $t as ut,
  Ii as v,
  oe as vn,
  Zt as vt,
  vi as w,
  C as wt,
  ui as x,
  Ot as xt,
  fi as y,
  ie as yn,
  Ut as yt,
  Gr as z,
  O as zt,
};
