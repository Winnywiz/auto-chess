# Updated BIS experiment

This run uses the native public build captured 21 October 2026, six components and 21 finished items. It tests all 1,771 unordered three-item combinations, including duplicates, for 171 reachable line/star states. The new Keep Eevee action makes Normal Eevee at stars 2/3 legal; native merge fixtures verify that extension. The original 169-state batch is supplemented without changing its fights or selections.

REPORT.md describes the measured results, assumptions and uncertainty. index.html is the results viewer. rankings.csv and confirmation.json contain the final frozen picks and untouched confirmation results. These are 6v6 battle scores, not full-match win rates or a guarantee of universal BIS.

The repository and experiment archive store the largest raw result and screening CSV as gzip files to stay below individual-file hosting limits. Restore and verify their exact bytes with:

    node outputs/kanto-bis-v2/restore-raw.mjs

The archive includes the same lossless data and restoration helper. Run reproduction commands from the workspace root, with sibling kanto-headless-v2 and kanto-team-builder directories. See REPORT.md for the full sequence. verify-confirmation.mjs first runs the Eevee coverage extension if needed, then verifies the confirmation fixtures. Running run.mjs resets the base 169-state batch; the extension must follow it.

The earlier experiment remains in kanto-bis and its original kanto-bis-run.zip archive. Use that original archive for its exact builder-data snapshot. The builder now uses the updated data, so the old experiment's sibling builder path no longer refers to its original inputs in the current checkout.
