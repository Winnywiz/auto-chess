# Version 36 compositions finishing at 5-2

The cutoff is the end of planning at 5-2, before that combat. This study replaces the earlier 4-8 deadline. It restores the compositions presentation from commit `2ff460f`: three summary metrics, level progression, Items & pivots, reference matchups, build variants and the right-column Seal recommendations. The native v36 engine and current sprites remain in use.

Research and the private workbook builder live in ignored `work/comps-52-v36/`. Do not copy income, spending, raw game paths or conditional upgrade probabilities into the public site.

## Reproduction

The verified engine in `work/native-v36/` and the archived official API snapshot in `work/comps-tempo-v36/meta.json` are required. Original v36 inputs and the earlier study remain intact.

1. Run `node scripts/comps-52-v36/income.mjs` for 128 native eight-seat ranked games through 5-2, with native income, shops, shared pools, Seals, rewards, XP, elimination and a seven-item equipped cap. Earned gold excludes sales. All entrants and survivors have separate denominators.
2. Run `propose.mjs` to compare reroll target counts with separately constructed Fast 7 and Fast 8 boards. Three-cost reroll has one three-star primary. No finishing board depends on a legendary or one-star placeholder. The old API is only a proposal/reference source, not a v36 human win rate.
3. Run `acquire.mjs screen-plans.json 16 acquisition-screen-v2` for the initial real-game acquisition screen. The research controller has distinct XP/rolling schedules for fast and reroll plans. It is experimental and is not a promoted gameplay bot.
4. Run `variants.mjs` to compare native utility skills, core breakpoints, Electric/Ghost/Dragon splashes, alternative item sets and affordable two-star low-roll holders. Every combat board has three tank items, three carry items and one secondary item. Same-item pivots keep the recommended three carry items.
5. Run `conditional.mjs`. Reroll starts are explicitly conditional on six primary copies and the upgraded support core, by 3-2 for one/two-costs or 4-1 for three-costs. Fast starts have upgraded non-rare supports, no primary copies and no four-cost copies, with gold reserved for the displayed low-roll holders. Native XP costs are reserved at the strategy's timing checkpoints. Trials use native shops, odds, finite pools and actual shared-pool checkpoints. Future opponent purchases are frozen. These probabilities are not whole-game completion rates, and Eevee family counts do not ensure an evolution.
6. Run `select.mjs`, `progression.mjs` and `confirm.mjs`. Final combat uses 32 fresh seeds on both sides against 18 reconstructed official API reference boards, equally weighting trait families. Seals are off and weather is neutral. The 5-2 forecast blends full-board and best tested low-roll combat using the separate conditional budget result. S starts at 65%, A at 50%, B at 35%.
7. Run `acquire.mjs selected.json 32 acquisition-confirmation` on fresh game seeds and rotating seats. Keep observed full-game completion, survival, earned gold and spending separate from conditional shop budgets.
8. Run `restore-ui.mjs`, then `export.mjs`. The restore step intentionally starts from the user's previous UI, then applies only data compatibility, clear breakpoint text, exact-board battle links and a filter/detail consistency fix. Early progression is illustrative and unscored. It chooses upgraded affordable holders using native item fit and trait connections. Optional level-8 extensions and level-9 caps are scored separately and never influence the 5-2 tier.
9. Run `node scripts/generate-matchups.mjs` for S/A pair replays, then the four normal site/guidance/matchup/custom-battle verification scripts. The cohort is `52`; actual board levels remain distinct. Prune unreferenced replay files only after the new manifest passes.

`verify.mjs` compares every displayed board's trait counts and breakpoint tiers with the actual native Battle and breakpoint function. It also checks item roles, stars, native rules, exact alternative-board result keys, optional-cap separation and private-data exclusion. `verify-ui.mjs` checks all progression/cap payloads and tooltips. Browser QA must additionally exercise filters, variants, progression, item pivots, tooltips and replay charts.

The private workbook keeps the prior report's five-sheet format. It includes real-game spending minima among successful acquisitions and clearly separate conditional budgets. A smallest observed successful spend is not a guaranteed minimum.
