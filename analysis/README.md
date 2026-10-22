# S/A matchup analysis

This dataset compares every distinct pair of existing S- and A-tier builds at each cap: 21 builds at level 8 and 24 at level 9, for 486 matchups. Tier eligibility is taken from the published composition snapshot, not reclassified by the new head-to-head scores.

Each matchup uses 128 deterministic SHA-256-derived seeds, both board sides, native PvP timing, and the exact published units, stars, items and cells. Two column-flip checks use the first 64 seeds on both sides, keeping all other inputs fixed. There are 248,832 scored native battles on the Version 34 engine. Replays add one recorded run per observed outcome; these recording runs are excluded from the scored-battle count.

The headline score is `(wins + 0.5 * draws) / 256`. Confidence intervals are empirical 95% bootstrap intervals with the two side outcomes kept together per seed, 1,200 bootstrap replicates. Formation delta intervals resample paired per-seed differences against the same 64-seed baseline. Intervals describe seed variation for these fixed boards and can collapse if no variation is observed. They do not establish a guaranteed matchup or account for all formations.

Replays select the median-duration published-formation battle separately within each observed win, loss and draw group. They retain native events and unit snapshots every six native steps (0.2 seconds), including sampled form, maximum-health and energy-limit changes. Cast names are translated from the original native event, retaining Mew's variable abilities and Ditto's copied moves. The viewer interpolates positions, visualizes attacks and casts, and displays recorded health, energy, shielding and control states. It does not invent or resimulate combat. Score-only observation and full-event replay outcomes are checked during generation.

Pressure points report aggregate observations: starting front-row and carry survival, no-cast fraction, time to first cast among casting battles, completed casts, carry control time, damage, healing and recorded hit effectiveness. These describe observed battles rather than claiming a causal explanation. Type tables use native effectiveness against actual evolved form types; trait counts are displayed separately. Native damage events can include overkill or shielding and are not interchangeable with final unit damage counters. Abilities can heal, buff or have special effects; potential type multipliers do not imply that every listed ability deals direct damage.

No weather, boons, economy, shops, contested pools or item drops are modeled. No items or units were optimized or changed. Only the two stated formation adjustments were tested. Static batch data is loaded separately from per-matchup replay files.

## Battle statistics

Each replay includes a parallel `stats` array sampled at the same times as `frames`. `statFields` defines the per-unit field order: `dealt`, `taken`, `healed`, `shielded`, `mitigated`. Values are native cumulative counters rounded to three decimals, not reconstructed from the floating damage numbers. Charts use the same scale for both teams and can show the selected replay's full battle totals or the latest snapshot at the replay time. They do not show averages over the matchup batch.

Damage dealt is actual enemy HP removed, including damage over time; damage taken is actual HP lost. Overkill and shield absorption are excluded from these HP counters. Healing records effective HP restored with native source attribution, excluding overheal. Shields granted counts shield creation credited to its source, including self-shields and unconsumed shields. Damage prevented is native mitigation credited to the protected unit, combining shields and damage-reduction effects; it is not shield-only absorption. The verifier checks all statistics frame shapes and compares the recorded counters at every sampled time in its native replay cases.

## Reproduction

Use Node 22 or newer. `work/native-v34` must hold the Version 34 harness (see `scripts/native/download.py`). Run from the repository root:

```sh
node scripts/generate-matchups.mjs
node scripts/verify-matchups.mjs
```

Both scripts use every logical CPU. The native engine is an external input, not bundled into the website; `provenance.json` records the hash of every game module used. The generator reads build definitions directly from `compositions.html`; rerun after changing eligible boards. The verifier checks all pair counts, tier eligibility, stars/items/cells, result counts, replay frames, hashes, and a spread of native deterministic replay cases. `sourceCommit` identifies the checkout used as the base, and `sourceHash` records the exact composition document bytes at generation time.
