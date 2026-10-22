# v34 acquisition and strategy experiment

Run from the repository root with Node 22 or newer after preparing the pinned v34 snapshot with
`scripts/native/download.py` and `work/native-v34/extract-data.mjs`. No npm dependencies are used.

```sh
node scripts/realism/run-shops.mjs         # 540 conditions, 512 trials each
node scripts/realism/run-shops.mjs --near-only # 108 conditions starting at eight copies
node scripts/realism/joint.mjs             # 72 shared-budget multi-upgrade conditions
node scripts/realism/run.mjs               # full local eight-seat matches
node scripts/realism/attained.mjs          # fights between actual attained boards
node scripts/realism/summarize.mjs         # JSON and CSV summaries
node scripts/realism/verify.mjs            # structural checks and deterministic repeats
node scripts/realism/report.mjs            # detailed report and compact result exports
```

`KANTO_WORKERS` limits the main batch worker count. `--trials=N` changes the per-composition baseline
sample count; the Seal and five/seven-item arms use half that count, with a minimum of 16. These outputs
remain local under `work/realism-v34/`; compact reports are copied to the Desktop project's `outputs/`.

## Conditional shops

Representative lines cover the five cost classes at levels 4 through 9, gold budgets of 20/40/60,
three starting copy counts and zero/six enemy-held copies. Cheap units target nine copies; four- and
five-cost units target three. The opening shop is free, and subsequent rolls and purchases consume
the budget using native actions. Native shared-pool depletion and merging apply. There is no income,
XP, buying of other units, bench competition or Seal in this isolated experiment. Specified starting
gold and copies are experimental conditions, not an earned match state. Confidence intervals use
the Wilson binomial interval.

## Full matches

The original local engine supplies all shops, shared pools, merging, XP, income/interest, streaks,
loot, battles, weather, deaths and rounds. A human seat uses the native elite planner with an added
preference for the composition's units and visible carry purchases. No future shops or battle seeds
are read to choose actions. Opponents retain their seeded native profiles and policies.

The adapter copy of the engine changes static import URLs and appends exports for four planner
functions. Their implementations, and the original game module files, are unchanged. A parity check
against the original `LocalMatch.botStep` verifies the adapter on the same planning state.

The practical policy collects secondary upgrades opportunistically and leaves a failed chase at 4-4
when it has fewer than six primary-carry copies. Cap-chase pursues all listed three-star units and
holds its planned reroll level. Natural XP can still force a level increase. The six-item limit is
enforced as twelve component equivalents across all owned units, so moving a geared bench unit to
the field cannot bypass it. Only actually acquired components and finished items may be used.

The no-Seal baseline and actual-offer ranked-Seal sensitivity are separate experiments. Native Seal
scoring is used when none of the composition's editorial recommendations is offered. The native
planner also handles required follow-up choices. The unmodified elite control has no target-unit
preference or special leveling curve. Native seeded carousel fallback choices are retained.

Player planning is accelerated and finishes before the engine flushes the other bots' actions. This
is not online concurrent roll timing. The finite pools are real, but the isolated contested-copy
shop conditions provide an additional stress test of draw-order risk. Item selection uses native
fit and actual offers, rather than injecting the published ideal BIS. Flexible fallback units can
win without completing the intended composition; summaries therefore report realized unit overlap,
carry availability and exact simultaneous cap completion alongside bot-lobby placement.

## Attained board comparisons

Only actual no-Seal, six-item-arm snapshots are used. The first eight observed seed indices are fixed
before combat scoring. Level-8 comparisons are conditional on reaching level 8. Round 4-2 comparisons
include the actual levels reached by survivors. Availability denominators accompany every group.
Each snapshot pair uses four fresh seeds on both sides in neutral weather. All candidate pairs,
including same-family and cross-strategy pairs, are compared. These fights are additional subsystem
tests; they are not full matches or ranked win rates.

The study preserves the existing website's capped-combat tiers. Actual local-bot placements and
conditional snapshot fights must not be substituted for population-ranked statistics.

## Website guidance

```sh
node scripts/realism/site-odds.mjs   # 132 exact carry conditions, 512 seeds each
node scripts/realism/export-site.mjs # compact composition-guidance.js, no raw match logs
node scripts/verify-guidance.mjs    # all 48 compositions, 288 board views and builder links
```

The practical boards are editorial suggestions adapted from the existing level 5 to 8 guides.
Secondary three-stars become two-stars; five-cost units are shown at one star. After the natural
reroll level, cheap primary carries remain three-stars to describe the continuation after a hit.
Level 7 carry boards instead show two-star stabilization. These revised boards are unscored and
must never inherit the ideal-cap score. The unchanged exact caps retain their existing scores,
tiers and matchup replays. Actual items on each board determine the item-holder display.

The public shop odds use the actual carry line, rather than transferring representative cost-class
probabilities to other lines. Each condition uses 40 gold, six or eight starting copies for reroll
carry three-stars, one or two for two-star leveling targets, and zero or six enemy-held copies. Gold includes purchases.
The source fingerprint makes the guidance verifier fail after changing the source compositions or
guides; regenerate the compact export before publishing. Full raw simulation outputs stay ignored.
