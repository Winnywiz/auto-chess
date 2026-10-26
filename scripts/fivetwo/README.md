# Finish-by-5-2 composition study, Version 37

Read `AGENTS.md` and `docs/composition-search.md` first. The full local owner specification is `docs/composition-search-configuration-and-rules.md`. It contains private study figures and is excluded from Git.

The owner approved both searches, their direct comparison and a push on 26 October 2026. Results are in `docs/v37-search-comparison.md`.

Run from the repository root with Node 24 or newer. Research uses the hash-verified engine and data in `work/engine-v37/`. Keep the original native snapshot in `work/native-v37/`. The frozen official meta snapshot, provenance and common acquisition policies are in `work/fiveTwo37/`.

## Pipeline

1. Preserve the old runtime and extension before changing them. `scripts/engine-v37/prepare-update.mjs` performs the initial backup and meta fetch. Do not rerun it midway through a frozen study.
2. Run `budget-study.mjs` once to prepare shared private policies.
3. Set `STUDY_DIR=work/fiveTwo37/original` and run `search.mjs`, then `analyze.mjs`.
4. Set `STUDY_DIR=work/fiveTwo37/beam` and run `beam-search.mjs`, then `analyze.mjs`.
5. Run `calibrate-realized.mjs` in each study directory. Preserve capped estimates privately, but use every observed realized outcome for final expected scores.
6. Run `compare-searches.mjs`, then `select-results.mjs`. The comparison also repairs and scores alternative item sets before recording its boards. Prefer original results unless a comparable replacement improves expected score by more than one point.
7. Set `STUDY_DIR=work/fiveTwo37/selected`, `SITE_DIR=work/fiveTwo37/selected/site`, and `SITE_VERSION=v37-52-compared`. Run `export-site.mjs`, `progression.mjs`, then `export-site.mjs` again. `finish-comparison.mjs` coordinates steps 6 and 7 after both evaluations finish.
8. After the isolated export completes, run `prepare-publication.mjs` and `report-study.mjs`. Report changes before pushing. Generate current matchups with `node scripts/generate-matchups.mjs`.
9. Run all verifiers below. Generate the private workbook with `private-table.py` using the selected study directory. Keep it under `work/`.

`KANTO_WORKERS` controls local worker threads. `RESUME=1` reuses compatible research checkpoints. Separate study directories share the exact frozen meta bytes. Research outputs and raw outcome frequencies remain private.

## Methods

The original search keeps its candidate screens, trait and support swaps, item selection and two-star cleanup preference. The beam adds multiple surviving candidates, targeted two-unit changes, complete legal carry-item multisets, native anchored forms, successive halving, realized-board selection and small position changes. Fresh paired seeds confirm finalists. Earlier partial hits revert to the legal native form and retain items by evolution family.

Each original candidate fights every beam candidate with shared seeds from both sides. Full-board and realized-board scores are recorded separately, with matched-family/plan and equal-strategy summaries. These direct fights supplement official-lobby scores. Expected 5-2 score against the official lobby sets tiers.

Finished boards have seven items and obey the owner's stars and family limits. All candidates share the eighteen-comp lobby, stage weights and square-root popularity weights. Seals are off and initial weather is neutral. The public rules describe the remaining constraints.

Early transitions are illustrative and unscored. Optional later extensions and caps do not set tiers. Seal suggestions use board fit and a private acquisition model. Acquisition results are cached by the full plan, prior Seal path and round.

## Verification

```sh
node scripts/fivetwo/verify-search.mjs
node scripts/fivetwo/verify-acquire-pool.mjs
node scripts/fivetwo/verify-comparison.mjs
node scripts/verify-site-data.mjs
node scripts/verify-guidance.mjs
node scripts/verify-matchups.mjs
node scripts/verify-custom-battle.mjs
node scripts/verify-team-code.mjs --official=work/native-v37/assets/teamCode-CspHej04.js
```

These checks cover legal boards and native form unlocks, worker parity, exact comparison replays, private-field exclusion, current UI links, recorded matchups, engine parity and official team-code conversion. They do not open a browser. Browser checks need separate explicit permission.

The old list remains in `compositions-v36.html`. The complete pre-update runtime and extension snapshot remains under `work/backups/`. Older GPT backup files are retained unchanged. No files are deleted by this workflow.
