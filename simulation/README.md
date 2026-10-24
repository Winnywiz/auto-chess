# Custom battles

Open `battle.html` through the website (or a local HTTP server). Choose 1–9 Pokémon for each team, stars, positions and up to three held items per unit. Finished items, components and trait Stones use their native effects. Both setup boards are shown from their own side; the opposing board is mirrored when the fight starts.

The simulator is pinned to the same verified version-35 engine as the composition replays. Traits and abilities execute in that engine, including Mew and Ditto. There are no Seals, weather, shops or economy. It runs in a module Web Worker with no backend, game account or live-game connection. Nothing plays sound.

One fight uses the entered seed and exactly the displayed formations. Batches of 32 or 128 fights alternate both sides for each seed. The score is `(A wins + half draws) / fights`, an observed combat sample rather than a ranked win rate. Batch replays select a median-duration example of each observed result. The charts describe the selected replay, not an average of all fights. Recording samples every six native steps and uses native cumulative damage, healing, shield and mitigation counters.

The same replay renderer serves existing composition matchups and custom fights. Users can load a published level-9 composition, import a builder team link, copy a reproducible battle setup link and download the generated replay JSON. Editing a setup cancels active work and hides the previous result. Empty teams and invalid units, cells, items, seeds or fight counts are rejected. Runs can be cancelled and have a 45-second worker timeout.

## Rebuild and verify

The external verified snapshot must already be prepared in `work/native-v35`. Original downloaded sources remain untouched. Use Node 22.15 or newer:

```sh
npm install --prefix work/battle-tools --no-audit --no-fund esbuild@0.28.2
node scripts/build-battle-engine.mjs
node scripts/verify-custom-battle.mjs
node scripts/verify-site-data.mjs
node scripts/verify-guidance.mjs
node scripts/verify-matchups.mjs
```

The bundle exposes combat, type effectiveness and English event translation. Its adapters provide the verified archived data without the session envelope and replace language UI/preloading with English-only state. It excludes the native planner, login and match-reporting entry points. Original engine copyright notices are retained, and `provenance.json` records the source fingerprints and output hash. Combat belongs to Kanto Tactics by Einoow.

Verification compares complete browser/native replay objects for every roster line at all three stars and every held item. It also checks eight earlier published recordings as independent golden traces, paired-batch determinism, input validation and effective healing/shield/mitigation counters.
