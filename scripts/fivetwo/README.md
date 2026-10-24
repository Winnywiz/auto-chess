# Finish-by-5-2 composition study (Version 35)

The compositions page ranks the board each plan realistically has at 5-2, not a level-9 cap.
Run from the repository root with Node 22+. Combat uses the repository's pinned
`simulation/engine-v35.js`; no external game modules are needed. Save the official meta response
to `work/fiveTwo/meta.json` first.

```sh
node scripts/fivetwo/budget-study.mjs      # gold audit + how many 3★ targets fit per reroll cost
node scripts/fivetwo/search.mjs            # 5-2 boards, seven items, scored vs the ranked lobby
node scripts/fivetwo/analyze.mjs           # acquisition, low-roll holders, frontline fallbacks, alt builds
node scripts/fivetwo/export-site.mjs       # writes KANTO_COMPS and data/compositions-52.json
python3 scripts/fivetwo/private-table.py   # private gold / roll workbook (work/fiveTwo/, not published)
node scripts/verify-site-data.mjs          # board legality, item split, no economy fields, exact replays
```

## Model

- **Economy** (`rules.mjs`, `acquire.mjs`): v35 PvP rules transcribed from the public build — income,
  interest, streaks, PvE gold, XP table and purchase, reroll cost, shop odds per level, copies per line,
  five shop slots weighted by remaining copies, and the round schedule up to 5-2. Seven opponents are
  drawn from the official ranked meta by popularity and hold their boards' copies stage by stage, plus
  their shop slots. Seals, boons, carousel units and item drops are not modelled.
- **Boards**: reroll targets at 3★ (Fast 8: four-cost carry at 2★), other three-cost or cheaper units at
  2★, four-costs at 1★ unless Fast 8, five-costs only at level 8. Final level: 7 for rerolls, 8 for Fast 8.
- **Items**: exactly seven — three on the tank, three on the carry, one on a secondary carry. Carry sets
  are screened per item then as three-item combinations; tank sets and the secondary item are tested on
  the same board. Focus Sash is never stacked.
- **Lobby**: official API stage-4 and stage-3 snapshots of the most-played distinct boards, rebuilt with
  seven items from each board's own most-used equipment and its usual cells. Score = 80% stage-4 lobby,
  20% stage-3 lobby, popularity-weighted (square root of games).
- **Expected 5-2 score** = P(all 3★ targets by 5-2) × full-board score + (1 − P) × best low-roll board.
  Low-roll candidates keep the items on the 2★ carry, move them to another unit on the board, or swap in a
  same-trait unit. Boards with extra 3★ targets are also tested with those units at 2★ ("steady").

Gold, roll and hit-rate figures are kept out of the website by design; the verifier fails if any
economy field is published.
