# Kanto Tactics team builder and BIS experiment

Open [index.html](index.html) for the offline team builder with Pallet Town and Viridian Forest themes. Images and fonts are embedded.

## First BIS run

Open [the searchable results page](outputs/kanto-bis/index.html) locally or through a static website host. Read the [technical report](outputs/kanto-bis/REPORT.md), download the [rankings CSV](outputs/kanto-bis/rankings.csv), or get the [complete reproducible run ZIP](kanto-bis-run.zip).

The experiment completed **1,564,320 full 6v6 battles**, screening 220 legal three-item combinations for each of 169 reachable Pokémon/star states. Repeated finished items are included. Final confirmation favored 47 selected builds over their original runner-up, left 109 close, and favored the runner-up for 13. These are conditional candidates, not universal BIS claims.

The selected builds were frozen before the final confirmation set. Results include the native heuristic and no-item baselines, paired uncertainty intervals, every candidate's aggregate score, held-out outcome sequences, exact fixtures, source hashes and hardware/runtime information. Fixed-seed replay and artifact checks passed.

See [run instructions and limitations](outputs/kanto-bis/README.md). The source, pinned public native simulator modules and required roster data are included under `outputs/`. No npm packages or network access are needed for the experiment.

The builder's existing item suggestions still use the native bot heuristic. The BIS experiment is provided separately for review.
