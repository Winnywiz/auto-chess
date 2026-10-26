# Composition study rules

Rank the boards a plan realistically has at the end of 5-2 planning. Use the game's verified combat engine. The full owner-supplied configuration remains local because it includes private economy study figures.

## Boards

- Seven finished items: three on the tank, three on the carry, one on a secondary carry.
- Reroll targets have three stars. Other units costing three or less have two stars. Four-costs have one star, except the Fast 8 carry and tank have two. Five-costs appear only at level eight.
- No legendary or one-star placeholder in a finishing board. Realized partial hits may be weaker and must be scored as the boards actually reached.
- One unit per evolution family and a frontliner besides the carry. Traits count each family once.
- Anchored forms use native skills, stats and multipliers. Intermediate forms require their native unlock star. Acquisition uses the original family's shared pool. Earlier partial hits use the earlier legal form.
- Focus Sash never stacks on one holder. Item search must not prescribe a set for a particular Pokémon based on a previous conversation.

## Combat and ranking

- Paired seeds, each played from both sides. Same frozen lobby for every candidate. Seals off, neutral weather.
- The official ranked meta API supplies the eighteen most-played distinct comps with at least 150 games. Skip a comp sharing six or more families with a selected comp.
- Reconstruct stage-four and stage-three boards, with seven items and ranked position hints. Weight comps by the square root of games. Final scores use eighty percent stage four and twenty percent stage three.
- Keep a swap only above a one-point gain. Prefer a two-star replacement for a one-star unit unless the latter is better by more than 1.5 points.
- Tiers use expected 5-2 combat score: S at 75%, A at 65%, B at 55%, otherwise C.
- Keep two distinct board variants where available, with the second differing by at least two units. Publish at most four builds per carry. Alternative carry items differ in at least two items.
- Full-board strength, a bad-game score and a low-roll score remain separate from the expected score. Optional later extensions and caps never set the tier. Early progression boards are illustrative and unscored.

## Approved comparison

The owner approved the original search, the proposed beam search, a direct comparison and a push on 26 October 2026. Keep separate research directories under `work/fiveTwo37/`. Both methods use the same verified v37 engine and frozen official lobby.

The original candidate search keeps its documented screens, swaps and item selection. The proposed method adds a beam, two-unit changes, complete item-set screens, legal anchored forms, successive halving, realized-board selection and small position changes. Reuse previously verified item screens only for the same board and seed basis.

The original capped realized estimate is preserved privately. Final expected scores for both methods fight every observed outcome pattern in the same simulation sample. The old cap can leave outcomes unscored, so normalizing only over retained outcomes does not give the whole-plan expected score.

Each original build fights each proposed build with shared seeds and both sides. Record full-board and realized-board scores separately. Include matched carry/plan and equal-strategy summaries. These duels supplement the ranked-lobby scores and never replace the tier rules. Prefer the original result unless the proposed result improves expected score by more than one point. Apply this rule to anchored carry replacements too.

## Publication

- Never publish gold, rolls, spending, acquisition probabilities or other private economy study numbers. Never publish boards copied from the Toongcha list. Outside lists may be compared separately.
- Preserve the previous website and extension before updating. Keep the old list as a backup. Change data and compatibility, preserving the existing layout.
- Report list changes and comparison scores before pushing. Run study, site, guidance, matchup, replay and engine verifiers.
- No browser use without explicit permission. Ask before deleting files.
- Keep original downloaded game sources unchanged. Pin engine and data hashes.
- Write plainly and briefly. No middle dot or em dash. Preserve the site's themes, DM Sans, sprites, hex boards, tooltips and focus outlines.
