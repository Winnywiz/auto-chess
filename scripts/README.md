# Rebuild the composition tiers

Run from the repository root:

```sh
python3 scripts/prepare_compositions.py
node scripts/score_compositions.mjs
python3 scripts/apply_composition_scores.py
```

The preparation step loads the 23 candidate paths from commit
`c9f164c6c46aae21cfd9538befc395ddc40c9f67` and the 22 trait-first
paths already in `compositions.html`. It verifies that the trait set still
includes Normal 6, Water 6, and Ice 4. The current official meta API and
workbook are read only as opponent sources in this scoring run.

The scorer uses the frozen Version 33 game module `sim-Bm2krZIn.js`, eight
fixed seeds, and both board sides. Pair results are reused in both directions
for candidate-vs-candidate scoring. Four workers are used by default; set
`COMPOSITION_WORKERS` to change this. Data and downloaded game modules are
cached under `work/composition-run`, which is ignored by Git. Reusing the
cache keeps later runs fast. Delete it to fetch fresh references; the
preparation step rejects a meta API rules version other than 33.

API records contain aggregate unit and item shares, so their full boards are
reconstructed deterministically. Workbook board positions are approximated
from its front/middle/back labels. Both references and candidates have at
most six finished items. The resulting scores are local combat estimates,
not ranked match win rates. The eight-seed pass is intended for screening;
increase `seeds` in `score_compositions.mjs` before treating a close tier
boundary as settled.
