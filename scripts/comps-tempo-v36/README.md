# V36 compositions before 5-1

The deadline is planning 4-8, before that combat and any 5-1 actions. Main and alternative boards use seven finished items (3 tank, 3 carry, 1 secondary), no legendary dependency and no one-star placeholders. Levels 5–7 do not require a four-cost upgrade. The combat package is pinned to the verified v36 snapshot.

Run from the repository root. Research output lives in ignored `work/comps-tempo-v36/`; income, spending, raw games and upgrade probabilities must not be copied into public data.

## Inputs and screening

1. Save the official build and its manifest in `work/native-v36/`. Run `node scripts/comps-tempo-v36/port.mjs`, then `node work/native-v36/extract-data.mjs`. The port uses the original bootstrap verifier and checks the archived decoder against it. Asset and adapter hashes are checked on every harness load. Network and unseeded random calls are disabled during simulations.
2. Save the supplied official meta API snapshot as `work/comps-tempo-v36/meta.json`. It was generated 24 October with rules 35 and aggregated records from older patches. Historical human placements are proposal priors, not v36 scores. Reconstructed stage-four reference boards are executed with v36 rules, balanced equally across trait families.
3. `income.mjs 128 ranked`: real eight-seat native games with native Seal choices, actual shared pools, shops, income, item rewards, XP and elimination. The gold ledger reconciles each planning phase. Opening gold is included; sales are separate. Native automatic Seal fees are netted in transition income. All entrants and survivors have separate denominators.
4. `discover.mjs`, `prepare.mjs`, then `acquire.mjs economic-candidates.json 8 economy-screen-v1 ranked` and `equipment.mjs`. Proposals cover differing reroll target counts, two-star stabilization, trait breakpoints and finishing levels. Each real-game policy remains experimental, not a proven gameplay bot.
5. `budget.mjs`, then `acquire.mjs budget-candidates.json 8 economy-budget-v1 ranked`. These replace difficult support upgrades with cheaper two-star units rather than assuming rare upgrades while rolling at low levels.
6. `conditional.mjs`: conditional joint shop-family upgrades using native shops, finite pools and actual native 3-2 opponent holdings. Primary starts at six copies; other shown units start at three. The measured income envelope pays opening copies, XP and the remaining roll session. This is a conditional budget study, not a full-game success probability. Opponent future purchases are frozen; evolution outcomes are not inferred from family counts.

## Selection and independent confirmation

`select.mjs` retains affordable or explicitly conditional builds. `utility.mjs` tests keeping the slot, utility swaps and two-unit Electric splashes at unchanged item count. `fallbacks.mjs` tests missed upgrades, same-item carry pivots, cheap tank replacements and alternate carry item sets. `stabilize.mjs` also checks three-cost two-star versions; weak options are rejected rather than forcing every carry into the list. `passives.mjs` separately tests Ghost, Dragon and support substitutions; it does not make rare utility mandatory.

`acquire.mjs utility-selected.json 32 economy-confirmation ranked` uses fresh game seeds and rotating seats. `conditional.mjs utility-selected.json conditional-confirmation.json 512` independently checks the selected conditional budgets. `confirm.mjs` freezes lineups and evaluates their exact equipment and positions on 32 fresh seeds and both sides against all 18 API references and each other. `finish-ranking.mjs` then weights the full-board API result and the best same-item low-roll result by the independent conditional upgrade study. S requires a finish score ≥65%; A requires ≥50%. This keeps missed upgrades in the tier rather than ranking perfect caps. Full-board and cross-trait scores remain separate. These are conditional forecasts from the stated starting core, not ranked placements or unconditional completion probabilities.

Each suggested alternative has its own board key and combat result. It cannot inherit the main build's score. Native actual rewards and the seven-item equipped cap are used in acquisition campaigns; seven specific finished recipes are standardized only in the finishing combat comparisons.

## Publishing and verification

Run `export.mjs`, `node scripts/build-battle-engine.mjs 36`, `node scripts/generate-matchups.mjs`, `node scripts/verify-site-data.mjs`, `node scripts/verify-guidance.mjs`, `node scripts/verify-matchups.mjs` and `node scripts/verify-custom-battle.mjs`. The matchup cohort key `48` means the pre-5-1 deadline; each build separately records its real level. Recorded S/A pair replays include damage, damage taken, healing, shields and prevention.

The private workbook is built separately using the bundled spreadsheet runtime. It preserves actual full-game completion results, conditional starting-copy assumptions, joint upgrade counts, gold earned, purchases, sales, XP, roll spend and observed successful minima. A minimum observed roll spend is never a guaranteed budget.
