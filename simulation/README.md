# Custom battles

Open `battle.html` through the website or a local HTTP server. Choose 1–9 Pokémon for each team, their stars, positions and up to three held items per unit. Finished items, components and Trait Stones use their native effects. The opposing board is mirrored when combat starts.

Fresh custom battles and extension Re-fight links use the verified v40 PvP engine. Earlier v36–v39 battle links remain supported and load their matching archived engine/data pair. Re-fights keep the recorded ability mode. The v40 runtime includes the current native dual-skill choices and PvP anchors; Adventure-only anchors remain replay metadata and are not selectable in PvP combat.

Fights use Seals off and neutral starting weather. The simulator has no shops or economy and does not connect to a game account. It runs in a module Web Worker. Nothing plays sound. One fight uses the entered seed and displayed formations; batches of 32 or 128 fights alternate both sides for each seed. The score is an observed combat sample, not a ranked win rate. Replays and charts describe selected examples, not averages across all fights.

The same replay renderer serves custom fights and existing composition matchups. Users can load a board, import a builder team link, copy a reproducible battle setup link and download replay JSON. Editing a setup cancels active work and hides the previous result. Empty teams and invalid units, cells, items, seeds or fight counts are rejected.

## Version 40 rebuild and verification

The native Version 40 capture is pinned under `work/native-v40`; its matching standalone engine and data are built under `work/engine-v40`. Use Node 24 or newer:

```sh
npm install --prefix work/battle-tools --no-audit --no-fund esbuild@0.28.2
node scripts/engine-v40/port.mjs
node work/native-v40/extract-data.mjs
node scripts/engine-v40/build-engine.mjs
node scripts/engine-v40/sync-runtime.mjs --data-only
node scripts/engine-v40/sync-site-data.mjs --write
node scripts/engine-v40/sync-runtime.mjs
node scripts/engine-v40/update-runtime.mjs
node scripts/engine-v40/verify-runtime.mjs
node scripts/engine-v40/verify-native-parity.mjs
node scripts/engine-v40/verify-site-data.mjs
node scripts/engine-v40/verify-extension.mjs
```

`sync-site-data.mjs` downloads the version-pinned official Seal atlas and writes the builder catalogue, Seal metadata and a new versioned local atlas. Keep the existing runtime backup before updating these production files. The sync steps only prepare local files; they do not publish the site or run a composition study.

The v40 native parity check compares complete battle-core replay traces for every legal PvP line, star and Automatic/physical/special ability mode against one fixed opponent and seed. The focused verifier checks current patch changes: Mew’s copied Charge scaling and board-wide effects, Poison trait thresholds, Machamp and Parasect skill values, Kakuna and Gloom anchor changes, and the Tailwind and Stubborn Fish Seal metadata. The production battle core preserves recorded manual ability choices.

The standalone v40 engine exports `Battle`, `translate`, `effectiveness`, `rules` and `identity`. Its provenance records source fingerprints and output hashes. Original game copyright notices are retained. Combat belongs to Kanto Tactics by Einoow.

`simulation/provenance.json` identifies the current v40 runtime. `provenance-v39.json` preserves the prior v39 bundle provenance; v36–v38 provenance files and engine/data pairs remain available for older links. Public composition tiers and matchup rankings keep their recorded study source until the owner requests and runs a new study.
