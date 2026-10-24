# Version 35 composition research

Run from the repository root using Node 22 or newer. The verified external engine snapshot and `data.json` must already exist in `work/native-v35`; game modules are not bundled with this website. This study requires engine identity `7f5bfa97bbc126c69f193ec540c4c5a2ff27d4c7f1dd08d7711d3c9c50bbbb0f`.

Save the official rules-35 meta response to `work/comps-refresh/meta.json`. Its composition records supply reference board definitions only. Historical ranked placements do not determine these simulation tiers.

```sh
node scripts/comps-v35/refresh.mjs
node scripts/comps-v35/export.mjs
node scripts/generate-matchups.mjs
node scripts/verify-site-data.mjs
node scripts/verify-guidance.mjs
node scripts/verify-matchups.mjs
```

`KANTO_WORKERS` controls parallelism (the composition search defaults to 8). Intermediate results are ignored under `work/comps-v35`. Its pair cache is isolated from v34 and fingerprints the engine and exact boards.

The search creates 126 trait-connected candidate boards, tests carry and tank equipment and legal support swaps, then freezes 32 carry builds. Boards have six finished items and a capped purchase budget. Final scores use 24 fresh seeds on both sides: 75% equal-weight opposing-family results and 25% reconstructed meta reference boards. The public research JSON records the reference boards, confirmation seeds, exact lineups, scores, engine identity and limitations. These are fixed-board combat scores, not ranked win rates or proof of optimal play.

Levels 5 through 8 are practical progression suggestions, explicitly unscored. No old v34 BIS scores are reused. Seal definitions come from the current engine; recommendations use native mechanical board fit and are suggestions, not measured Seal strategy gains.

The separate S/A matchup pass uses 128 seeds on both sides per pair and 64 paired seeds for each column-flip check. The verifier checks source hashes, every replay's frame/statistics shapes, and deterministic native battle repeats. See `analysis/README.md` for the replay and chart definitions.

This workflow updates website research only. It does not train or change the gameplay bot.
