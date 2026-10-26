# Custom battles

Open `battle.html` through the website (or a local HTTP server). Choose 1–9 Pokémon for each team, stars, positions and up to three held items per unit. Finished items, components and trait Stones use their native effects. Both setup boards are shown from their own side; the opposing board is mirrored when the fight starts.

Fresh custom battles use the verified version-38 engine. The published composition study remains on its recorded v37 engine. Traits and abilities execute in that engine, including Mew and Ditto. Scored fights use Seals off and neutral starting weather. There are no shops or economy in the combat runtime. It runs in a module Web Worker with no backend, game account or live-game connection. Nothing plays sound.

One fight uses the entered seed and exactly the displayed formations. Batches of 32 or 128 fights alternate both sides for each seed. The score is `(A wins + half draws) / fights`, an observed combat sample rather than a ranked win rate. Batch replays select a median-duration example of each observed result. The charts describe the selected replay, not an average of all fights. Recording samples every six native steps and uses native cumulative damage, healing, shield and mitigation counters.

The same replay renderer serves existing composition matchups and custom fights. Users can load a published finish board, import a builder team link, copy a reproducible battle setup link and download the generated replay JSON. Editing a setup cancels active work and hides the previous result. Empty teams and invalid units, cells, items, seeds or fight counts are rejected. Runs can be cancelled and have a 45-second worker timeout.

## Rebuild and verify

The verified snapshot must be prepared in `work/native-v38`. Original downloaded sources remain untouched. Use Node 24 or newer:

```sh
npm install --prefix work/battle-tools --no-audit --no-fund esbuild@0.28.2
node scripts/engine-v38/build-engine.mjs
node scripts/engine-v38/sync-runtime.mjs
node scripts/engine-v38/sync-site-data.mjs
node scripts/verify-custom-battle-v38.mjs
node scripts/verify-site-data.mjs
node scripts/verify-guidance.mjs
node scripts/verify-matchups.mjs
```

The bundle exposes combat, type effectiveness and English event translation. Its adapters provide the verified archived data without the session envelope and replace language UI/preloading with English-only state. It excludes the native planner, login and match-reporting entry points. Original engine copyright notices are retained, and `provenance.json` records the source fingerprints and output hash. Combat belongs to Kanto Tactics by Einoow.

Verification compares complete browser/native replay objects for every roster line at all three stars and every held item. The archived v37 verifier also checks eight published recordings as independent golden traces. The v38 verifier checks manual ability selection, paired-batch determinism, input validation and effective healing/shield/mitigation counters.

Version 36 and 37 engine and data files remain available for archived battle links. The worker selects the requested supported version and checks its data identity. Fresh custom battles and extension Re-fight links use Version 38. `provenance.json` pins Version 38; `provenance-v36.json` and `provenance-v37.json` preserve the archived engine identities. The Version 38 catalogue includes all 58 native anchored forms, with native unlock rules enforced by the study.

Version 38 adds manual ability selection for native dual-skill lines. Choose Automatic, the physical skill or the special skill in the builder and custom battle editor. Builder links, battle links and extension recordings retain the choice. Official KT1 team codes do not encode that choice. The current composition tiers and matchup catalogue remain v37 until the owner runs a new study.
