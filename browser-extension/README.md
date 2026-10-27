# Kanto Tactics Replay Recorder

A local Chromium browser extension for Chrome and Edge. It automatically saves online matches from the official Kanto Tactics game and opens them in a round-by-round replay viewer.

## Install

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select this `browser-extension` folder.
4. Reload Kanto Tactics and play an online match. Edge shows a **Recording started** notification when the match begins recording.
5. Click the extension in the browser toolbar. During a match it says **Recording started**; when the match ends it says **Last match saved automatically** and the replay appears in the recent list. The popup status is available if desktop notifications are disabled.
6. Choose **Open replay library** to inspect the match, including animated fight playback when the live game build exposes its battle engine.

A clearly labelled five-round sample replay is available at `viewer.html?demo=1`. It is generated for display and is not saved as a real match.

**Import Replay** (in the library) accepts several files at once: replay files from **Export Replay**, an **Export All** file, and `replay-*.html` files from `RUN-REPLAY-v35.cmd`. Fights are stored the same way as recorded ones. The library keeps the newest 100 replays.

The extension watches the game at `einoow.com`. Replays are never uploaded. The popup and replay pages load the DM Sans font from Google Fonts, the same font as the Kanto Tactics site. Replays are saved in the browser's local extension storage and are not uploaded. Use **Export Replay** (one replay, with its fights) or **Export All** (every replay in one file) to keep copies outside the browser.

## Saved per round

- Your formation, unit positions, stars, items and held Seal IDs.
- Public opponent formations and their positions at the start of combat.
- Animated fight frames, combat events, battle Seals, outcomes, and running damage, healing and shielding totals when the game build exposes them.
- Gold earned, interest earned, average gold earned so far, gold spent, gold from sales, rolls this round and cumulative rolls.
- The gold balance and round label.
- Every shop you saw: the opening shop and a new row for each reroll, with bought slots marked. The Shop panel totals the Pokémon seen in that rolldown. Roll numbers come from the game's counter, so a reroll the recorder missed shows as a gap (Roll 4, Roll 6).
- Who you fought: the game's pairing for the round (player, ghost or PvE). The opponent board opens on "This fight", placed as the foe team stood when the fight began, and the fight title uses that name. Recordings without the pairing match the foe team against the saved boards. 1-2, 1-3, 2-8, 3-8 and 4-8 are PvE and get a dashed frame in the round strip.

Gold earned records positive match income and game rewards. Gold spent records gold outflows from in-game actions; sale refunds are shown separately. Average gold earned is the average across rounds recorded so far, including interest.

The extension reads only the game state exposed to the current player. It does not read account credentials or private opponent shops. Interest follows the standard 10-gold step and 5-gold cap, or Meowth Bank's 6-gold step and 7-gold cap. Action totals are captured by observing the game's live action interface; if a future game update changes that interface, board recording continues and the replay viewer marks the economy totals as estimated.

## Planning, bench and Re-fight

Version 1.10.0 uses the v40 PvP simulator and keeps native ability choices in replay links. Adventure-only anchors remain replay metadata and are unavailable in PvP Re-fight.

- Each round keeps your board and bench after every buy, sell, move or upgrade. The slider in **Your formation** steps through them; the last step is the board you fought with.
- Shops are read on every game state change, not only every 0.6s, so fast rerolls are all recorded.
- **Re-fight** opens the round in the website's battle simulator (`battle.html`) with both boards, items and positions from the start of the fight. The website simulator runs the v40 PvP engine. Adventure-only anchors are recognized as replay metadata but cannot be sent to the PvP simulator.
- The fight log lists casts, crowd control, faints and the result with the unit's sprite, its HP at that moment, and the skill name. Skill areas and cast lines are drawn on the board during playback.

## Storage and fights

Each match is saved as `replay:<id>`. Each fight is saved once, when it ends, as `battle:<id>:<round>`, at 5 frames per fight second (a full 54-second PvP fight fits). The newest 100 replays are kept; older ones are removed together with their fights. The extension asks for unlimited local storage so long matches are not cut off.

## Tooltips

Hover or focus a Pokémon, item or Seal to see its details. The data comes from the site (`tooltip-data.js`, built from the builder roster and `seals-data.js`). Rebuild it after a game patch.

## Theme

The pages use the site's Viridian Forest and Pallet Town themes. Pick one in the top bar of the replay page; the popup follows it.

## Seed and player name

Each replay saves the match seed the game sends (shown as a copyable chip in the replay header) and your in-game name, used as the replay title.

## Fight text

The game engine writes fight text in Spanish. `fight-text.js` maps it to the game's own English wording (built from the game's translation tables). Rebuild it after a game patch if new fight messages appear in Spanish.
