# Version 37 preparation, 26 October 2026

This records the initial preparation before the study. The owner subsequently approved both searches, their direct comparison and a push on 26 October 2026. See [the completed comparison](v37-search-comparison.md) for results and [the public rules](composition-search.md) for the current method.

## Completed locally

- Saved the supplied specification unchanged in `composition-search-configuration-and-rules.md`. Added `AGENTS.md` to enforce the owner's current restrictions.
- Verified the live official route, roster and shop bytes against the archived v37 hashes using direct HTTP requests. No browser was used.
- Pointed the 5-2 pipeline at `work/engine-v37/` and isolated new research artifacts in `work/fiveTwo37/`. Engine and data hashes are checked before research combat.
- Refreshed the official ranked meta snapshot and saved its fetch time and hash. No budget study or search ran.
- Added all 58 native anchored lines to the extracted catalogue, using native skills, family IDs and stat multipliers. Search candidate expansion and anchor acquisition handling await the approved algorithm implementation.
- Updated the local simulator to v37, retained v36 engine/data and old battle-link support, and prepared export/matchup tooling for the current composition format.
- Updated the extension folder to version 1.7.0 with v37 item/trait/unit descriptions and anchored forms. Re-fight links request v37. Its hosted destination still needs the later website publication. The installed browser extension has not been reloaded or tested in a browser.
- Fixed family deduplication and a missing secondary item in ranked lobby reconstruction. All 36 stage snapshots now have seven items.

## Backup

`work/backups/pre-v37-2026-10-26T08-52-54-381Z/`

This contains the previous top-level website runtime files, simulation, data, analysis and extension. Existing media files were not changed or duplicated. Older GPT backup pages remain unchanged. No files were deleted.

## Checks

- Native v37 parity: 423 unit/star and item cases, paired batch repeatability, input validation and combat counters passed.
- Worker compatibility: v36 and v37 requests passed, including an anchored v37 unit.
- Existing published composition data: 89 rows, 18 references, three exact replay checks passed on its recorded v36 engine.
- Guidance/source checks: 401 progression/cap boards and exact builder/battle links passed. Fixed the verifier's outdated UI routing.
- Native extracted economy constants match the pipeline for all checked income, streak, shop odds and XP fields. Economy values remain private.
- Existing matchup verification correctly reports a stale catalogue: saved matchups are `v36-52-1`, current list is `v36-52-2`. Regenerating matchups requires the approved study run. The complete v37 golden-replay check also awaits that regeneration; engine-only native parity passed.
- Hash comparisons confirm the current composition page, script, style, data copy and GPT backup are unchanged.

## Work authorized after preparation

The approved algorithm is in `v37-search-proposal.md`. The completed study runs the original and beam searches separately, scores all observed realized outcomes, compares them directly and selects improvements above one point. The old list and complete local runtime backup are preserved. Browser checks still need separate explicit permission.

After rebuilding `work/engine-v37/` with `scripts/engine-v37/build-engine.mjs`, run `scripts/engine-v37/sync-runtime.mjs` to restore the anchored catalogue and data hash before verification.
