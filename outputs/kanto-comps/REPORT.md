# Kanto Tactics composition search

Completed 21 October 2026 at 03:55 (Asia/Bangkok). Native build: sim-DVnRY1Xk / roster-CpnLcVHu, captured 21 October 2026. These are provisional combat tiers, not measured full-match economy or placement rankings.

## Measured search

- 58 carry/strategy searches across Reroll 5, Reroll 6, Reroll 7, Fast 8 and legendary boards.
- 3344 distinct ordered composition/formation candidates screened within their carry tasks. This is a bounded heuristic search, not exhaustive enumeration of every team.
- 466,016 completed native battles: 276,704 in the initial search/reference confirmation and 189,312 in the follow-up peer tournament. 1249.1 battles/second over 6.22 summed measured phase minutes using five workers. Battles are not full games.
- AMD Ryzen 5 7500F 6-Core Processor, 12 logical processors, 31.38 GiB RAM, win32 10.0.26200, Node v24.19.0. Host not isolated. BIS had finished before this run began.
- Simulator uses its native PvP clock, including overtime and the 54-second PvP limit; no rendering, browser globals, networking or unseeded randomness. Weather explicitly disabled; no boons or boss rules.

## Published candidates

| Tier | Composition | Strategy | Confirmation score | Battles per gear setup | BIS dependent |
|---|---|---|---:|---:|---|
| S | Aerodactyl Rock / Flying | Fast 8 | 95.2% | 1152 | No |
| S | Parasect Bug / Grass | Reroll 6 | 92.7% | 3072 | Yes |
| S | Onix Rock / Ground | Reroll 7 | 89.4% | 1536 | No |
| S | Articuno Ice / Flying | Legendary board | 82.1% | 512 | No |
| S | Dugtrio Ground | Reroll 5 | 79.3% | 3072 | Yes |
| S | Blastoise Water | Reroll 5 | 78.8% | 3072 | Yes |
| S | Rhydon Ground / Rock | Fast 8 | 76.8% | 1152 | Yes |
| S | Hitmonchan Fighting | Reroll 7 | 75.6% | 1536 | Yes |
| S | Exeggutor Grass / Psychic | Reroll 7 | 72.0% | 1536 | Yes |
| S | Golem Rock / Ground | Reroll 5 | 65.9% | 3072 | Yes |
| A | Charizard Fire / Flying | Reroll 5 | 63.7% | 3072 | Yes |
| A | Marowak Ground | Reroll 7 | 63.3% | 1536 | No |
| A | Vaporeon Water | Reroll 6 | 61.5% | 3072 | Yes |
| A | Starmie Water / Psychic | Fast 8 | 60.7% | 1152 | Yes |
| A | Slowbro Water / Psychic | Reroll 7 | 60.3% | 1536 | No |
| A | Zapdos Electric / Flying | Legendary board | 60.2% | 512 | No |
| A | Machamp Fighting | Reroll 5 | 59.0% | 3072 | Yes |
| A | Gengar Ghost / Poison | Reroll 6 | 58.7% | 3072 | Yes |
| A | Flareon Fire | Reroll 6 | 57.6% | 3072 | Yes |
| A | Raichu Electric | Reroll 6 | 56.9% | 3072 | Yes |
| A | Eevee Normal | Reroll 6 | 56.4% | 3072 | No |
| A | Arbok Poison | Reroll 6 | 55.9% | 3072 | Yes |
| A | Golbat Poison / Flying | Reroll 5 | 52.2% | 3072 | No |
| A | Golduck Water | Reroll 6 | 51.4% | 3072 | No |
| A | Venusaur Grass / Poison | Reroll 5 | 50.1% | 3072 | Yes |
| A | Nidoking Poison / Ground | Reroll 5 | 50.0% | 3072 | Yes |
| B | Dragonair Dragon | Fast 8 | 49.4% | 1152 | Yes |
| B | Magmar Fire | Reroll 7 | 48.5% | 1536 | Yes |
| B | Chansey Normal | Fast 8 | 48.2% | 1152 | No |
| B | Poliwrath Water / Fighting | Reroll 6 | 47.8% | 3072 | Yes |
| B | Vileplume Grass / Poison | Reroll 6 | 47.7% | 3072 | No |
| B | Jolteon Electric | Reroll 6 | 47.3% | 3072 | Yes |
| B | Hitmonlee Fighting | Reroll 7 | 47.3% | 1536 | Yes |
| B | Dewgong Water / Ice | Reroll 7 | 43.7% | 1536 | No |
| B | Tauros Normal | Fast 8 | 42.7% | 1152 | No |
| B | Pidgeot Normal / Flying | Reroll 5 | 42.5% | 3072 | Yes |
| B | Alakazam Psychic | Reroll 6 | 42.5% | 3072 | Yes |
| B | Mewtwo Psychic | Legendary board | 41.1% | 512 | Yes |
| B | Arcanine Fire | Reroll 7 | 41.0% | 1536 | Yes |
| B | Sandslash Ground | Reroll 6 | 39.6% | 3072 | Yes |
| B | Cloyster Water / Ice | Fast 8 | 39.5% | 1152 | Yes |
| B | Ninetales Fire | Reroll 6 | 38.9% | 3072 | Yes |
| B | Lapras Water / Ice | Fast 8 | 38.6% | 1152 | No |
| B | Gyarados Water | Reroll 5 | 38.1% | 3072 | Yes |
| B | Electrode Electric | Reroll 6 | 36.9% | 3072 | Yes |
| B | Moltres Fire / Flying | Legendary board | 33.8% | 512 | Yes |
| B | Mew Psychic | Legendary board | 32.8% | 512 | No |
| B | Electabuzz Electric | Reroll 7 | 32.5% | 1536 | Yes |
| B | Jynx Ice / Psychic | Reroll 7 | 32.1% | 1536 | No |
| B | Ditto Normal | Fast 8 | 31.5% | 1152 | No |
| B | Wigglytuff Normal | Reroll 6 | 30.0% | 3072 | Yes |
| B | Rapidash Fire | Reroll 6 | 28.0% | 3072 | Yes |
| B | Raticate Normal | Reroll 5 | 26.2% | 3072 | Yes |
| B | Magneton Electric | Reroll 7 | 23.1% | 1536 | No |
| B | Beedrill Bug / Poison | Reroll 5 | 22.7% | 3072 | No |
| B | Butterfree Bug / Flying | Reroll 5 | 21.5% | 3072 | No |
| B | Scyther Bug / Flying | Reroll 7 | 21.2% | 1536 | Yes |
| B | Snorlax Normal | Fast 8 | 17.4% | 1152 | No |

S requires overall peer score >=65% and every checkpoint >=50%. A requires overall >=50%. Remaining candidates are B. These thresholds were fixed before search. Tiers are relative to other boards in the same strategy, not across economy plans. The displayed paths include one validation winner for every eligible carry in every category, frozen before confirmation; neither reference confirmation nor the peer tournament changes these paths. Equal numbers of fights are used per checkpoint, so the aggregate weights checkpoints equally.

The initial generated reference benchmark rated 51 of 58 candidates S and was too easy to separate the optimized paths. We therefore added a follow-up closed round robin of the frozen candidates, retaining the same thresholds. This was an exploratory follow-up, not the original preregistered evaluation. No candidates were dropped using the peer results. The initial scores and ratings remain in results.json and as referenceScore/referenceTier in boards.json.

Every pair within a strategy fights at all its checkpoints using 32 fresh seeds and both sides. Each pair runs three conditions: both carries on BIS, A with native-fit fallback against B on BIS, and B with fallback against A on BIS. This measures item sensitivity against the same frozen peer pool. Primary battles are shared by the two participants, and are counted once in measured throughput. Each candidate's displayed battle count is its participation count. Seeds are unique within this tournament and disjoint from the earlier composition phases; peer-protocol.json records them all. This is a closed cohort, not a sampled live meta or an independent external opponent population.

## Protocol

Each task starts with 12 trait-biased random ordered paths, retains a five-member beam, and performs three generations of 18 mutation attempts. Duplicate candidates within a task are cached. Mutations replace a support, reorder supports/additions, or choose one of three role-based formation patterns. Candidates are ranked by real native battle score, with weakest checkpoint as a tie break. Formation search covers those patterns, not every hex placement. The whole smallest board stays locked; flexible pivots and support replacements are outside this first search.

Screening: four generated opponent archetypes and one seed each, both sides, at every checkpoint. Two shortlisted paths per carry receive eight unused generated opponent lineups and eight fresh seeds, both sides. For each carry, its validation winner is frozen. Final confirmation uses eight further unused generated lineups and 32 new seeds, both sides, at every checkpoint. That is 512 battles per checkpoint per gear setup. Source code, exact opponent boards and result sequences are saved. Opponents are fixed sampled trait-biased teams, not a learned player population; their strength can differ substantially.

Each path is an ordered list with unique Pokémon lines. The smallest board remains a subset of every later board, with no replacement of its invested core. Reroll 5 uses a one-cost carry at three stars and checkpoints 5/6/7/8; Reroll 6 a two-cost carry at three stars and 6/7/8; Reroll 7 a three-cost carry at three stars and 7/8. The designated secondary frontline is also three stars if its cost is no higher than the reroll carry cost. Other supports are two stars, five-cost additions one star. Fast 8 uses a four-cost carry, one star at 7 and two stars at 8. Legendary boards use a five-cost carry, one star at 8 and two stars at 9, with three or four five-cost lines total. Normal Eevee at stars 2/3 is allowed through the verified Keep Eevee action; the planner states that requirement. Every candidate and reference board respects per-line native pool copy limits, including the shared Eevee pool. Pool contention between opposing players is not modeled. All evolved forms are native reachable line/star forms, but acquisition sequences are not established.

The carry receives its frozen selected build from the new BIS confirmation, not whichever alternative happened to win confirmation. A separate frontline unit receives the first two items of its BIS build; other units receive one native item-fit pick. This is a fixed gearing policy, not a joint team item optimization. Every candidate and reference opponent has board-size + 3 finished items. Inventories are not constrained to a common component multiset. Final component requirements and the gold represented by unit copies are displayed, excluding XP, rolls and removed equipment. Native item rules and skill switching run normally.

BIS dependence compares the exact same path to three distinct native item-fit items on its carry; allies and formations stay fixed. A tag requires >=5 percentage points of improvement and a positive descriptive paired 95% interval. Side assignments are averaged into blocks before calculating intervals. These normal intervals do not correct for multiple comparisons, matchup selection or search uncertainty. Absence of the tag does not prove item independence; the label refers only to this tested replacement.

## Limitations

Reroll and Fast 8 labels describe proposed investment plans based on native unit costs and shop odds. We did not simulate rolling to hit, shared shop-pool contention, economic transitions, HP loss while saving, XP timing, item acquisition, Magnet constraints, or Eevee branch acquisition. S tier does not mean a proven top-four or first-place rate. Full local matches with these policies remain the next validation step. Early-board completion is assumed, so survival before hitting a reroll carry is unmeasured.

The reference opponent generator uses the same item count but does not equalize total unit-copy gold with every candidate. A stronger finished board can be more expensive. No live player pick rate, win share or average placement is inferred. All results refer to the captured build, not future item updates.

## Reproduction

From the original workspace root, with sibling kanto-headless-v2, kanto-bis-v2 and kanto-team-builder directories:

```powershell
node outputs/kanto-comps/verify.mjs
node outputs/kanto-comps/run.mjs
node outputs/kanto-comps/peers.mjs
node outputs/kanto-comps/report.mjs
node outputs/kanto-comps/audit.mjs
node outputs/kanto-comps/verify-peer-tournament.mjs
```

run.mjs overwrites results for this experiment. No npm packages are needed. The engine assets remain unmodified. Search digest: b10920cfd0bd0296ec8d78532eb938d5e231bd67362daa1acfb461a420d77114. Peer tournament digest: 7f4e9aade3f1b224706d030c4c582e71da875e5271f439c5fabf1968b34b7f79. BIS confirmation digest: ac753b79dccd2c9caa9974eb04454841cbcf5ea8673d398a01eea81f8e4032ee.
