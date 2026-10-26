# Version 37 search proposal

Status: approved by the owner on 26 October 2026. Run both original and proposed searches, compare them head to head, verify, report changes and push.

The original specification is `composition-search-configuration-and-rules.md`.
The completed original and beam study is recorded in [the comparison report](v37-search-comparison.md). The previous Version 36 list is preserved.

## Recommended search

1. Keep several distinct promising boards per carry and plan in a beam. Try single swaps, targeted two-unit swaps that complete traits, and several independent starting boards. Fight candidates on the same lobby and paired seeds. This reduces the chance that one early choice traps the search.
2. Test complete three-item combinations from the carry's legal item pool, including repeated items except Focus Sash. Do not discard an item solely because it performed poorly beside default items. Recheck tank sets and the secondary item after choosing the carry set.
3. Compare all 58 native anchored forms with their evolving family at the same stars and role. Include carry, tank and support substitutions. Use native skills, traits and stat multipliers. Keep one unit per family and charge acquisition to the original family pool. Re-optimize items for promising forms. A partial hit uses the anchored form only after its native unlock. Earlier stars use the earlier legal form.
4. Try a small position search on finalists: tank/carry cells, nearby swaps and spacing. Evaluate each change against the whole fixed lobby. Keep a change only when its paired gain exceeds one percentage point.
5. Use progressively more paired seeds for survivors, then confirm finalists with fresh seeds unused in selection. Start from the existing final sample count and add seeds for close comparisons. A confidence interval on paired score differences helps identify uncertain improvements. Keep all candidate comparisons on the same seed basis.
6. Rank using realized 5-2 boards. Retain the existing acquisition model initially so algorithm changes can be separated from engine changes. Report the probability mass covered by simulated realized patterns privately and check sensitivity to the omitted tail before accepting a tier change.

Keep the specified lobby, stage weights, popularity weights, weather, Seals setting, tiers, item budget and stars. These proposals change search coverage, sample allocation and positions, not the owner's rules.

## Anchoring evidence

The verified v37 native route exports 58 anchored lines. Their IDs use the native family suffix, for example `caterpie-a1` for Metapod. The existing extracted catalogue omitted these lines. Adding names alone would miss their native stat multipliers. They are now included in the local v37 catalogue and engine parity checks.

Screen every legal anchored form without a hand-picked Pokémon or item-set shortlist. No session anecdote becomes a search constraint.

## Review before publication

Preserve the old site, its simulator, replay data and the extension in a timestamped local backup. Export the new study locally only after approval to run. Compare additions/removals, tiers, expected scores, forms, items and tanks with the saved Version 36 list. Explain that a refreshed lobby changes the benchmark, so scores across snapshots are not a pure patch comparison. Use a fixed refreshed lobby for any controlled old-board versus new-board comparison. Keep economy data and Toongcha copies out of published artifacts. Run the study, site, guidance, matchup and native parity verifiers. Browser checks require separate permission.

## Evaluation correction during the approved run

The documented eight-pattern cap can omit a large part of the simulated outcome distribution and normalizes the score over retained outcomes. Preserve that original estimate privately. Final tiers for both algorithms use every observed outcome pattern from the same simulation sample. This corrects the expected-value denominator without changing how the original board search selects candidates. Head-to-head realized fights also draw from the complete distributions.

## Support selection

The original run retains its two-star cleanup heuristic. The beam evaluates competing supports through realized-board scores, which model finding those units, instead of using a separate full-board one-star versus two-star preference margin. Both enforce the same finishing-star limits. Unit and position changes still require more than a one-point gain.
