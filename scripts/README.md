# Rebuild the composition tiers

Run from the repository root:

```sh
python3 scripts/prepare_compositions.py
node scripts/score_compositions.mjs
python3 scripts/apply_composition_scores.py
```

The preparation step loads the 23 candidate paths from commit
`c9f164c6c46aae21cfd9538befc395ddc40c9f67` and the trait-first
paths already in `compositions.html`, including the confirmed Ice 4 search
result. It verifies that the trait set still
includes Normal 6, Water 6, and Ice 4. The current official meta API and
workbook are read only as opponent sources in this scoring run.
The apply step also restores each legacy path's level 5-8 bridge boards,
item holders, pivot advice, and variants from that same earlier commit.
The page groups paths by their main carry; each path keeps its own tier,
board, items, and progression guide inside that carry's card.

The scorer uses the frozen Version 33 game module `sim-Bm2krZIn.js`, eight
fixed seeds, and both board sides. Pair results are reused in both directions
for candidate-vs-candidate scoring. Up to eight CPU workers are used by default; set
`COMPOSITION_WORKERS` to change this. Data and downloaded game modules are
cached under `work/composition-run`, which is ignored by Git. Reusing the
cache keeps later runs fast. Delete it to fetch fresh references; the
preparation step rejects a meta API rules version other than 33.
Battle pair scores are also stored in `work/composition-run/match-cache.json`
under hashes of both full boards, the simulation module and the seed list.
On later runs, unchanged pairs are reused; changing one candidate board only
recomputes its affected matchups.

API records contain aggregate unit and item shares, so their full boards are
reconstructed deterministically. Workbook board positions are approximated
from its front/middle/back labels. Both references and candidates have at
most six finished items. The resulting scores are local combat estimates,
not ranked match win rates. The eight-seed pass is intended for screening;
increase `seeds` in `score_compositions.mjs` before treating a close tier
boundary as settled.

## Expanded trait search

Run after preparation to search level 9 Normal 6, Water 6 and Ice 4 boards:

```sh
node scripts/search_compositions.mjs
node scripts/search_compositions.mjs --confirm
```

The search batches about 1,500 distinct boards through CPU workers. It uses
two seeds and ten API/workbook opponents to screen boards, then checks the
finalists against every level 9 reference with eight new seeds. The second
command adds 32 separate confirmation seeds. The score run above then places
confirmed candidates in the normal tier system, including the cross-family
score. Results stay in ignored `work/composition-run/search-results.json`.
The confirmed 21 October 2026 run is saved in
`research/kanto-search-2026-10-21.json` for inspection without rerunning.
`python3 scripts/add_ice_search_build.py` adds its confirmed Ice 4 board and
level 5-8 guide to a copy of the page that does not already contain it; run
the preparation, scoring and apply commands above afterward.
The search excludes its own previously discovered Ice board from the seed
pool, so rerunning it still searches from the earlier candidate set. GPU
execution is not used because the battle module is JavaScript and CPU worker
batches complete the search without a port.

The search and tier runs model capped combat. They do not simulate shop odds,
contested pools, item drops, weather or boons. A confirmed S result is a
combat result for the specified board, not a ranked placement estimate.

## Website media

`media/` holds the 441 shared images extracted from the two HTML pages.
Both pages now load images by relative path, so browsers cache one copy and
the initial HTML is much smaller. `scripts/extract_media.py` is the one-time
extractor for any copy of the old inline pages. The composition page also
creates each expanded guide only when its card is opened.
