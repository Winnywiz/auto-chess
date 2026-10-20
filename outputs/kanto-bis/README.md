# Kanto Tactics BIS experiment

Open `index.html` for the searchable offline results. Images and fonts are embedded. Click a Pokémon to compare its selected build, original runner-up, native heuristic and no-item baseline. Scores and evidence flags use the final untouched confirmation set when present. A failed confirmation stays visible; it is not silently replaced with a new winner.

Read `REPORT.md` for the measured results, hardware, exact methodology, uncertainties and next steps. `rankings.csv` contains all 169 reachable line/star states. `search-scores.csv`, `validation-candidates.csv` and `confirmation-candidates.csv` expose the candidate scores. JSON files retain all aggregates, held-out outcome sequences, complete fixture specifications and timings.

Run from the original workspace root, or the root of the supplied ZIP extraction:

```powershell
node outputs/kanto-bis/run.mjs --pilot --workers=3
node outputs/kanto-bis/verify.mjs --replay-pilot
node outputs/kanto-bis/run.mjs --workers=5
node outputs/kanto-bis/verify-confirmation.mjs
node outputs/kanto-bis/confirm.mjs
node outputs/kanto-bis/audit.mjs
node outputs/kanto-bis/report.mjs
```

No npm packages, browser or network are needed for simulation. The sibling `kanto-headless/assets/` directory contains the pinned public native modules, and `kanto-team-builder/data.json` supplies roster and native item-fit data. The ZIP includes these dependencies. Re-running replaces the result files.

This first run searches three finished-item multisets with repeats. It measures complete 6v6 battles, not full games. It assumes the items are available and does not optimize team construction, item allocation or positioning. These are conditional candidate recommendations, not proven universal best-in-slot builds. The captured game version is not automatically updated.
