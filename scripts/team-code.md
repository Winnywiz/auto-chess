# Official planner team codes

`team-code.js` implements the public KT1 interchange used by the version 37
planner. It is separate from our builder's `#team=` URL, which saves our editor
state as base64 JSON. Copy team code exports the currently displayed formation;
Copy team link continues to share our builder.

Example:

```
KT1;r36;xm=pvp;xn=Example;slowpoke:2:3:leftovers.leftovers.protector;abra:3:24:choice-specs.choice-specs.focus-sash
```

- `KT1` identifies the interchange format. `r36` is the source board's rules.
- `xm=pvp` selects the planner mode. Optional `xn` is a percent-encoded name,
  truncated to 40 code units.
- Unit entries are `line:stars:cell:items`, separated by semicolons and sorted
  by cell. `s` after the star number marks shiny in the interchange.
- Planner cells are 0–27. Our native composition cells 28–55 subtract 28;
  builder cells are already relative. Items retain their order and duplicates
  and are separated by periods. Empty item lists omit the final field.
- Names are display metadata. Unit/item IDs, stars, hexes and items describe
  the team. The code carries no simulation scores, economy, bench or Seals.
- The actual planner imports at most 10 unique line IDs. The copy action rejects
  duplicate lines, excess units, invalid cells and invalid IDs rather than
  silently exporting a team the planner would discard or change.

Official v37 source inspected on 26 October 2026:

- https://einoow.com/playables/kanto-tactics/assets/teamCode-CspHej04.js
- https://einoow.com/playables/kanto-tactics/assets/plans-Bm48KQq4.js

The game planner's import normalization currently drops the shiny flag even
though its code parser recognizes it. This site's published teams do not use
shiny flags. Preserve the source rules marker: exporting a v36 board does not
establish its strength under the v37 balance changes or anchored-form rules.

Run `node scripts/verify-team-code.mjs`. To check all published and progression
boards against the actual captured official encoder and parser, add
`--official=<path-to-teamCode-CspHej04.js>`. The comparison runs those unchanged
functions in an isolated context with their lazy initialization and hex helpers;
it does not initialize the game's roster, stores or networking.
