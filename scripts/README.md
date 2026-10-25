# Rebuilding the site data

**Current compositions page:** the finish-by-5-2 study in [fivetwo/README.md](fivetwo/README.md). The v35 cap workflow below still drives the Matchups page.

The current website uses Version 35. Follow [the v35 research workflow](comps-v35/README.md) to refresh compositions, progression, Seals and matchup replays.

## Archived Version 34 workflow

Everything runs on Node 22 or newer with no npm packages. Simulations use every logical CPU
(`KANTO_WORKERS` overrides the worker count). Large intermediate files go to `work/`, which Git ignores.

## 1. Game data

`work/native-v34/` holds the unmodified public Version 34 game modules and a small harness
(`headless.mjs`) that runs native battles with seeded randomness and no network. Rebuild the website
data (unit stats, abilities, traits, item text and native item fit) and write it into both pages:

```sh
python3 scripts/native/download.py   # fetch the public game modules and install the harness
node work/native-v34/extract-data.mjs
python3 scripts/update_game_data.py
```

## 2. Best-in-slot items

```sh
node scripts/bis/run.mjs          # about 3.7 million battles; resumes from work/bis-v4/results.partial.json
node scripts/bis/export.mjs       # writes window.KANTO_BIS into builder.html and compositions.html
node scripts/bis/verify.mjs       # reproduce six stored confirmation builds (3,072 battles)
```

Each reachable unit and star tests all 1,771 three-item builds in 6v6 battles: a screen on four lineups,
a refinement on eight, held-out validation on eight unseen lineups, then a frozen confirmation on eight
more lineups with new seeds. Opponent lineups include the most used units of the top official meta
compositions. The site recommends the better of the two finalists over 384 validation plus 512
confirmation battles and shows the other as the alternative. Validation selected the finalists, and
the pooled score selects the recommendation: neither is an independent held-out estimate. The exported
gap, interval and confidence use confirmation only; `pooledGap` uses the combined score. Native and
unequipped scores have 512 confirmation battles each. A close result does not establish a universal BIS.

## 3. Compositions

```sh
python3 scripts/comps/prepare_refs.py     # reference boards: community Version 34 workbook and official meta API
node scripts/comps/pipeline.mjs           # items, passive/utility tests, new board search, scores, transitions
python3 scripts/comps/apply.py            # writes KANTO_COMPS and KANTO_GUIDES into compositions.html
```

The pipeline runs these steps:

The exporter preserves editorial carry labels and refined progression guides when cap combat inputs
are unchanged. Use `apply.py --replace-guides` only to deliberately publish freshly generated transitions.

1. **Items**: each board's carry and tank are re-tested with their Version 34 best-in-slot sets; a change is
   kept only when it scores better against the reference boards.
2. **Passive traits and utility**: on the strongest boards, every item-less slot is tested with one-unit
   trait activators (Ghost: Mean Look, Dragon: Dragon Dance) and utility units (Chansey and others), and
   against higher-cost units that share a trait. A swap is adopted when it gains at least 2.5 points.
3. **Search**: an evolutionary search over level 9 boards (at most 135 Board Value, six items) plays a
   gauntlet of the strongest published and reference boards, then checks finalists on new seeds. Only
   boards that differ by at least three units from every published and reference board are added.
4. **Scores**: twelve seeds and both sides for every pair. The composite combat score is 25% workbook,
   25% historical official API and 50% cross-tag score (each opposing trait family weighted equally).
   At this snapshot the official API still reports rules 33, while all battles execute rules 34.
   Every exported cap is limited to the same six items used by the scorer and replay generator.
5. **Transitions**: level 8 down to level 5 boards are built from the final board. Final units come first;
   a temporary unit must share a final trait or add utility. Options are tested against reference boards
   reduced to what is usually available at that level.

Pair results are cached in `work/comps-v34/pair-cache.json` under hashes of the native modules, harness,
roster data, both boards and seeds. Legacy cache keys are not reused. BIS checkpoints additionally
require a matching experiment fingerprint; incompatible or legacy checkpoints must be preserved
separately before starting a fresh run.

## 4. Matchup replays

```sh
node scripts/generate-matchups.mjs
node scripts/verify-matchups.mjs
```

These replay every pair of S and A boards with 128 seeds on both sides, plus column-flip checks, and store
one replay per observed outcome in `analysis/`.

## Limits

Battles are combat only: no shops, contested pools, item drops, weather or Seals. Scores are combat
estimates for the exact boards shown, not ranked placement rates.

`node scripts/comps/audit-v34.mjs` reproduces the targeted upgrade-sensitivity check on the two new
Exeggutor caps with 32 fresh seeds on both sides. It does not reclassify tiers or estimate acquisition odds.
`node scripts/verify-site-data.mjs` checks page consistency, item budgets, trait labels, and BIS arithmetic.

The native acquisition and full-match rerun is documented in [realism/README.md](realism/README.md).
It separates conditional shop odds, complete eight-seat matches, and combat between attained boards.
Its local-bot results do not replace the website's capped-combat tiers.

After editing composition data, regenerate `composition-guidance.js` using
`node scripts/realism/export-site.mjs`, then run `node scripts/verify-guidance.mjs`.
The UI defaults to suggested practical progression; combat scores require an exact scored board.

The restored Exeggutor caps use independent exact-board results. Reproduce with
`node scripts/comps/score-restored.mjs`, then republish them with
`node scripts/realism/export-site.mjs`. The 64-seed confirmation scores, reference weights and
same-family diagnostic fights remain distinct from full-match acquisition/placement results.
