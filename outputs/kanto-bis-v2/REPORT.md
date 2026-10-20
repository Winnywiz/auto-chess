# Updated-item BIS search for Kanto Tactics

Completed 21 October 2026 at 03:45 (Asia/Bangkok). This is an offline team-battle item search using the pinned public native simulator. It is not RL training, a full-game search, or a current live-meta tier list.

## Measured run

- 171 reachable Pokémon line/star states, across all 58 roster lines. Three synthetic Eevee branch states at star 1 are excluded. Normal Eevee at stars 2/3 is included: the new native Keep Eevee action was verified using legal merge fixtures.
- 1771 canonical unordered multisets of three finished items per state, including repeated items. All are accepted by the native equipment helper. This is 302,841 screened builds for the complete 171-state run.
- 3,578,312 completed **6v6 battles**, over 49.69 measured phase minutes. Stage totals: screening 2,422,728, refinement 360,576, validation 453,504, confirmation 341,504.
- 1200.3 completed battles per second using up to 5 Node worker threads. This is aggregate search/confirmation throughput using their summed measured phase durations, including worker startup, fixture preparation, native events, messages and checkpoints. It excludes gaps between phases, the pilot, verification, module initialization in the main process, and final report generation. It is not games per second or a dedicated CPU microbenchmark.
- Hardware: AMD Ryzen 5 7500F 6-Core Processor; 12 logical processors; 31.38 GiB RAM; win32 10.0.26200 x64. Node v24.19.0, V8 13.6.233.17-node.51. Host was not isolated or CPU-pinned; no GPU rendering or external requests.
- Native build: sim-DVnRY1Xk / roster-CpnLcVHu. All 174 pinned asset hashes match their saved manifest. Fresh public assets captured on 21 October 2026; later balance updates are not fetched automatically. Native PvP clock enabled, including overtime and the 54-second cap.

This run uses the updated roster, skills and items, plus the current native PvP clock. Scores from the older experiment are not a controlled measurement of item-only changes.

The base search and final confirmation use five workers. The two added Normal Eevee states run serially; their measured time is included in the aggregate throughput.

## What the ranking means

The primary score is (wins + 0.5 × draws) / battles. Timeouts and mutual elimination count as draws. Remaining-team HP fraction difference breaks score ties, then target damage and canonical item key. This rewards team wins, including support and tank contributions, rather than using damage as the primary target.

For every target state, all combatants have that star level. The target gets the tested three items; its five allies each get one heuristic item. The enemy has eight finished items across six units: two units have two items each and four have one. Thus fully geared candidate teams have eight items on both sides. The no-item target baseline deliberately has only five items on its team. The heuristic baseline uses the three highest native individual-fit scores, without duplicates; it is not an execution of the complete native bot item-allocation policy.

Allies rotate between two mixed teams and a deterministic team that shares the target's traits while retaining frontline/backline roles. Enemy archetypes include physical carries, casters, healing, assassins, mixed and ice-control teams. Native traits and item rules run normally. Three preset layouts cover different spacing and backline depth. They are not optimized per build. Weather, boons, boss rules, additional shiny bonuses, shopping and component availability are excluded.

1. **Screen:** all 1771 builds, four contexts, one seed, both side assignments: 8 battles per build.
2. **Refine:** twenty screening leaders, the native heuristic build and no-item baseline, deduplicated; six training contexts and eight new seeds, both sides: 96 battles per build.
3. **Validate:** five equipped refinement leaders, the heuristic build and no-item baseline, deduplicated; eight unseen enemy lineups and 24 new seeds, both sides: 384 battles per build.
4. **Confirm without reselection:** freeze the validation leader and runner-up, then test both, the heuristic build and no-item baseline on eight additional unused enemy lineups and 32 new seeds, both sides: 512 battles per candidate. Allies and layout families are retained. The selected build is not changed after observing these scores.

Each candidate in a stage gets identical starting seeds, opponents and placements. Reversing the teams rotates all cells by 180 degrees. Shared seeds do not force identical RNG consumption after builds diverge. Exact lineups, positions and equipment are saved in protocol.json and confirmation-protocol.json. All 1771 builds receive screening, but only the shortlist receives held-out testing; a good build can be missed by the small screening sample.

## Results and uncertainty

- 153/171 selected builds score higher than the native heuristic baseline on untouched confirmation; 9 tie it. Mean difference across states: +6.3 percentage points. Confirmation was not used to select these builds.
- 119/171 leaders differ from the build chosen before validation. The frozen pre-validation build and its score remain in rankings.csv and results.json to expose this selection effect.
- 101/171 selected builds have a paired 95% interval versus the original runner-up that includes zero. These are close candidates, not established unique BIS.
- 50/171 selections have a positive paired interval versus the original runner-up on confirmation; 20 have a negative interval, favoring that runner-up. Failed selections are retained and flagged, not replaced using confirmation data.
- 0/171 leading scores are at least 95% or at most 5%, where the matchup set is weak at distinguishing builds.
- 122/171 observed leaders repeat an item. Do not remove duplicates when using these results; the extracted native rules support them.

Intervals use the difference in each context/seed block, averaging its two side assignments, then mean ± 1.96 standard errors across 256 confirmation blocks. They are descriptive, unadjusted normal intervals conditional on these fixtures. They do not cover matchup selection, live-meta uncertainty or multiple comparisons. A positive interval is evidence within this test, not a universal BIS certificate. The shortlist-validation winner is frozen before confirmation, and rankings.csv reports its untouched confirmation score. The original refinement selection is retained as well.

| Pokémon | Stars | Selected build | Confirmation battle score | Native heuristic score | Evidence versus runner-up |
|---|---:|---|---:|---:|---|
| Raichu | 2 | Scope Lens + Scope Lens + Scope Lens | 49.7% | 30.2% | Close candidates |
| Kadabra | 2 | Focus Sash + Quick Claw + Quick Claw | 33.9% | 31.6% | Close candidates |
| Snorlax | 2 | Flame Orb + Leftovers + Leftovers | 61.9% | 57.3% | Close candidates |
| Lapras | 2 | Scope Lens + Scope Lens + Scope Lens | 75.4% | 57.4% | Lead within this test |
| Mewtwo | 2 | Quick Claw + Quick Claw + Quick Claw | 74.0% | 63.4% | Close candidates |

The largest raw result and screening CSV are distributed losslessly as gzip files. Run node outputs/kanto-bis-v2/restore-raw.mjs to restore and hash-check them for inspection or auditing. Reproduction from scratch generates the raw files directly.

## Reproducibility and deliverables

Run from the original workspace root, with the sibling kanto-headless-v2 and kanto-team-builder folders present:

```powershell
node outputs/kanto-bis-v2/run.mjs --pilot --workers=3
node outputs/kanto-bis-v2/verify.mjs --replay-pilot
node outputs/kanto-bis-v2/run.mjs --workers=5
node outputs/kanto-bis-v2/verify-confirmation.mjs
node outputs/kanto-bis-v2/confirm.mjs
node outputs/kanto-bis-v2/audit.mjs
node outputs/kanto-bis-v2/report.mjs
```

The scripts require no npm packages and perform no live requests. Re-running replaces the corresponding result files. The fixed seeds and source hashes are recorded in protocol.json, results.json and the confirmation files. Experiment source files: experiment.mjs, worker.mjs, run.mjs, verify.mjs, confirm-protocol.mjs, confirm.mjs, verify-confirmation.mjs, audit.mjs and report.mjs. Native code remains unmodified in the sibling extraction.

Verification: 13 search checks plus 5 confirmation checks passed. These cover all 1771 builds' native equip legality, all generated team/board/item budgets, seed disjointness, exact native state/event replay, seed sensitivity, unchanged fixtures, outcome accounting, duplicate effects, paired comparisons, network restrictions, 54 sampled item-order permutations, and a complete fresh-worker pilot replay. Confirmation checks also verify unseen opponent compositions, 512-battle accounting, frozen selections and repeatability. Order permutations were sampled, not exhaustively searched. The replay digest for the native battle fixture is 593d3d5fed3c444dc7c267b059ae1c7c959ec99c94ad7bbbcf980a69e29024ac. The stable full-run results digest, excluding timings, is 318ed664a3b51cbb5b1d7252122d0bb8f5188e71fe0a57b457c9a4060fe45db7. The stable confirmation digest is ac753b79dccd2c9caa9974eb04454841cbcf5ea8673d398a01eea81f8e4032ee.

- index.html: searchable local results viewer.
- rankings.csv: one frozen selected build per reachable line/star state with baselines, intervals and flags. Scores are from untouched confirmation.
- validation-candidates.csv: every held-out candidate's wins, draws, losses and target metrics.
- confirmation-candidates.csv and confirmation.json: all frozen candidates on the final untouched set, including per-battle outcome sequences.
- search-scores.csv: scores for all screened builds and refinement candidates.
- results.json: full raw aggregate results, including validation outcome sequences, all search scores, timings and metadata.
- protocol.json: complete fixture specification and experiment settings.
- verification.json: verification evidence.
- audit.json: 14 final artifact checks covering source hashes, every state, battle/outcome accounting, stored result digests, frozen selections and agreement between independent pilot and parallel-run results.

## Next steps

Increase screening seed counts and retain a larger shortlist, especially for states whose leader changed on validation or failed confirmation. Add new opponents, a wider range of ally stars and item distributions, weather, more board sizes and formation optimization. A later agent or self-play population can supply stronger, less hand-designed opponents. Finally optimize the allocation of actual available components across a whole team; these per-unit results assume the requested finished items are available.
