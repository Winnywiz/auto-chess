# Version 37 search comparison

Both searches use the same verified v37 combat engine and frozen [official ranked lobby](https://einoow.com/api/meta/kanto/meta.json). Seals are off and weather is neutral. The new search uses a beam, successive halving, complete item-set screens, native anchored forms and small position changes. Candidate coverage and compute budgets differ between the pipelines. No Pokémon-specific item set was prescribed.

## Direct fights

The comparison contains 85 original builds and 104 beam builds. Every original build fights every beam build with 32 shared seeds, each played from both sides. Draws count half.

| Comparison | Original | Beam |
| --- | ---: | ---: |
| Full boards, all pairs | 39.1% | 60.9% |
| Realized boards, all pairs | 41.1% | 58.9% |
| Realized boards, matching carry family and plan | 46.0% | 54.0% |
| Realized boards, equal strategy weights | 40.2% | 59.8% |

The beam all-pairs realized score has a seed-block interval of 54.7% to 62.8%. This interval conditions on the reconstructed lobby and simulated outcome distributions. It does not measure search uncertainty. Different portfolios can change the all-pairs result.
For matching carry families and plans, the beam interval is 49.1% to 58.7%. It crosses 50%, so that comparison does not establish a clear advantage.

The full per-pair record, tested boards and method are in [the comparison data](../data/search-comparison-v37.json). Direct duel results supplement the official-lobby scores. They do not set tiers.

## Selected list

Previous list: 89 builds (S: 19, A: 21, B: 15, C: 34). Updated list: 130 builds (S: 16, A: 30, B: 44, C: 40).

Selection kept 29 original carry/plan groups and 41 beam groups. A comparable beam replacement must improve expected score by more than one point. Anchored carry replacements use the same rule.

Added carry forms: Kadabra (anchored), Oddish (anchored), Weepinbell (anchored), Metapod (anchored), Pikachu (anchored), Gloom (anchored), Bellsprout (anchored), Kakuna (anchored), Gastly (anchored), Magneton, Dratini (anchored), Charmander (anchored), Rapidash, Bulbasaur (anchored), Nidorino (anchored), Shellder (anchored), Golduck, Omastar, Dragonair, Electabuzz.

Removed carry forms: Vileplume, Poliwrath, Weepinbell, Venomoth, Machamp.

The following changes compare the old published list with the selected update. They combine patch, lobby, search and scoring changes, so they are not a pure patch comparison.

| Carry / plan | Old tier | New tier | Old expected | New expected | Change, points |
| --- | --- | --- | ---: | ---: | ---: |
| Gyarados / Water 6 / Reroll 1-cost | C | B | 36.5% | 59.2% | +22.8 |
| Arbok / Poison 4 / Reroll 1-2 cost, stay 6 | C | A | 46.7% | 68.2% | +21.5 |
| Flareon / Fire 4 / Reroll 2-cost | A | C | 69.5% | 48.2% | -21.3 |
| Electrode / Electric 2 / Reroll 1-2 cost, stay 6 | A | C | 69.1% | 50.2% | -18.9 |
| Golbat / Poison 4 / Reroll 1-2 cost | A | B | 71.8% | 55.4% | -16.4 |
| Dugtrio / Ground 3 / Reroll 1-cost | S | B | 80.4% | 64.2% | -16.2 |
| Pidgeot / Flying 5 / Reroll 1-2 cost, stay 6 | S | B | 75.1% | 60.3% | -14.8 |
| Kabutops / Water 6 / Fast 8 | A | B | 69.6% | 55.2% | -14.5 |
| Vaporeon / Water 6 / Reroll 2-cost | S | A | 81.6% | 68.6% | -13.0 |
| Alakazam / Psychic 2 / Reroll 1-2 cost, stay 6 | A | S | 69.1% | 82.0% | +13.0 |
| Raichu / Electric 4 / Reroll 1-2 cost, stay 6 | S | A | 76.3% | 66.2% | -10.2 |
| Hitmonlee / Fighting 4 / Reroll 3-cost | B | C | 59.5% | 50.1% | -9.4 |
| Gengar / Poison 3 / Reroll 1-2 cost, stay 6 | B | A | 57.7% | 67.1% | +9.3 |
| Starmie / Psychic 5 / Fast 8 | S | S | 84.1% | 75.5% | -8.6 |
| Jynx / Psychic 4 / Reroll 3-cost | C | C | 41.9% | 49.6% | +7.7 |

## Anchored forms

Controlled form-only tests keep stars, items and positions fixed. Promising differences were confirmed with fresh paired seeds. Joint search and complete realized outcomes decide which plans are published.

| Anchored form | Evolving form | Stars | Anchor score | Evolving score | Gain, points |
| --- | --- | ---: | ---: | ---: | ---: |
| Shellder | Cloyster | 2 | 61.6% | 49.7% | +11.9 |
| Nidorino | Nidoking | 3 | 41.5% | 34.5% | +7.1 |
| Gloom | Vileplume | 3 | 32.8% | 26.4% | +6.4 |
| Nidoran♀ | Nidorina | 2 | 20.8% | 15.9% | +4.9 |
| Poliwhirl | Poliwrath | 3 | 38.5% | 33.9% | +4.6 |
| Oddish | Vileplume | 3 | 30.9% | 26.4% | +4.5 |
| Gastly | Gengar | 3 | 38.0% | 33.8% | +4.3 |
| Ivysaur | Venusaur | 3 | 52.6% | 48.5% | +4.2 |
| Graveler | Golem | 3 | 39.0% | 35.6% | +3.4 |
| Magnemite | Magneton | 3 | 39.8% | 36.4% | +3.3 |

Dragonair: This intermediate support form needs two stars. The finishing rules allow a four-cost support at one star.

All form checks are recorded in [the anchoring data](../data/anchoring-v37.json). Intermediate forms appear only after their native unlock star. Earlier partial hits use the earlier legal form.

## Scoring and backup

The old eight-pattern estimator could omit many realized outcomes and normalize over the retained subset. Original estimates are retained privately. Final scores for both methods fight every observed realized outcome. The bad-game score is the twentieth percentile of that complete distribution. Economy outputs remain private.

The previous list remains available as [the Version 36 backup](../compositions-v36.html). A complete local runtime snapshot was also preserved before changes. The current page keeps the existing layout. The engine, builder data, Seal descriptions and extension data use v37. The extension folder is version 1.7.0.

No browser was used. Native replay parity, source/data UI checks and the other final checks are recorded in [the verification report](v37-verification.md).
