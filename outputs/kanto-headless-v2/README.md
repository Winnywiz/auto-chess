# Updated native battle snapshot

Public assets captured 21 October 2026 from https://einoow.com/playables/kanto-tactics/. The manifest records the URL, size and SHA-256 of 174 unmodified public JavaScript assets. The snapshot has 58 lines, six item components and 21 finished items. inspection contains formatting-only copies of five modules.

headless.mjs initializes the native simulator in Node, disables networking and ambient Math.random, selects English, and exports Battle, fight, battleDigest and the inspected data aliases. fight explicitly enables the native PvP clock (overtime and 54-second limit) and disables weather unless supplied. It retains native targeting, events, unit rules and seeded randomness. This adapter does not implement the new build's full-match economy.

Run from the workspace root:

    node outputs/kanto-headless-v2/check-assets.mjs
    node outputs/kanto-headless-v2/extract-data.mjs
    node outputs/kanto-bis-v2/verify.mjs

extract-data.mjs reads the sibling builder's sprite frame metadata and writes the pinned roster/equipment data used by this experiment. It extracts the exact native individual-item fit functions without executing the bot UI. The baseline retains unbranched Eevee when evaluating that form. It is not the complete native bot item-allocation policy.

The older engine, results and original reproducibility archive remain separate. No live matches, authenticated game actions or multiplayer connections are used by the experiments.
