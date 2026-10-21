#!/usr/bin/env python3
"""Embed one common scoring run in the standalone composition page."""

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "compositions.html"
RESULTS = ROOT / "work" / "composition-run" / "scored.json"
LEGACY = ROOT / "work" / "composition-run" / "legacy.html"


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError(f"Expected exactly one match for {old[:70]!r}, got {text.count(old)}")
    return text.replace(old, new)


def embedded(text, name):
    marker = "window." + name + "="
    start = text.index(marker) + len(marker)
    return json.JSONDecoder().raw_decode(text[start:])[0]


def main():
    result = json.loads(RESULTS.read_text())
    for row in result["rows"]:
        if row["id"] == "adapt-sheet-2":
            # Normalize older cached runs without changing their battle scores.
            row.update(category="reroll-6", strategy="Reroll 6", rollLevel=6)
    text = HTML.read_text()
    script = "window.KANTO_COMPS=" + json.dumps(result, ensure_ascii=False, separators=(",", ":")) + ";"
    text, count = re.subn(r"window\.KANTO_COMPS=\{[^\n]*?\};", lambda _: script, text, count=1)
    if count != 1:
        raise ValueError("Could not replace composition snapshot")

    guides = embedded(text, "KANTO_GUIDES")
    legacy_guides = embedded(LEGACY.read_text(), "KANTO_GUIDES")
    combined = {**guides["guides"], **legacy_guides["guides"]}
    missing_guides = {row["id"] for row in result["rows"]} - combined.keys()
    if missing_guides:
        raise ValueError(f"Missing progression guides: {sorted(missing_guides)}")
    guides["version"] = result["version"]
    guides["note"] = "Suggested level 5-8 bridge boards, item holders and pivots for every path. Cap boards are battle-scored separately."
    guides["guides"] = combined
    guide_script = "window.KANTO_GUIDES=" + json.dumps(guides, ensure_ascii=False, separators=(",", ":")) + ";"
    text, count = re.subn(r"window\.KANTO_GUIDES=\{[^\n]*?\};", lambda _: guide_script, text, count=1)
    if count != 1:
        raise ValueError("Could not replace progression guides")

    old_intro = '<p class="cap-context">Browse S, A and B tiers. Open a composition for level 5-8 boards, item holders and pivots.</p>'
    previous_intro = '<p class="cap-context">Legacy paths and trait breakpoint builds share one Version 33 battle score. Browse every measured tier; open a board for its formation and item plan.</p>'
    current_intro = '<p class="cap-context">Browse the Version 33 battle scores and trait builds. Open a composition for its level 5-8 boards, item holders and pivot plan.</p>'
    new_intro = '<p class="cap-context">Each main carry appears once. Open a card to compare its builds, tiers, level 5-8 boards, item holders and pivot plans.</p>'
    if old_intro in text:
        text = replace_once(text, old_intro, new_intro)
    elif previous_intro in text:
        text = replace_once(text, previous_intro, new_intro)
    elif current_intro in text:
        text = replace_once(text, current_intro, new_intro)
    elif new_intro not in text:
        raise ValueError("Missing composition introduction")
    start = text.index('    <details class="score-guide">')
    end = text.index('    </div></details>', start) + len('    </div></details>')
    text = text[:start] + '''    <details class="score-guide"><summary>Scores &amp; strategies</summary><div>
      <p><strong>Reference score</strong>: wins plus half draws. Half is the average against the official meta API and workbook opponent groups, weighted equally; half is the cross-trait candidate score. <strong>Cross-tag score</strong> weights each opposing trait family equally. Level 8 faces level 8; level 9 faces level 9. These are local battle scores, not ranked match win rates.</p>
      <p><strong>S</strong>: reference at least 65%, cross-tag at least 55%, and both API and workbook scores at least 50%. <strong>A</strong>: reference at least 50%. <strong>B</strong>: below 50%. Every composition keeps its measured tier; trait families are not removed to fill a quota.</p>
      <p><strong>Strategy labels</strong> describe when to roll or level: Reroll 5, Reroll 6, Reroll 7, Fast 8, or Legendary. Gengar / Venusaur is a Reroll 6 path only when Venusaur 3★ was found earlier. The collection includes Normal 6, Water 6, Ice 4, and other trait builds.</p>
      <p><strong>Grouped cards</strong> show the strongest matching build for each main carry. Open a card to choose another build; each variant keeps its own tier, score, board, items and progression guide.</p>
      <p><strong>Method</strong>: the frozen Version 33 game simulation module runs eight fixed seeds and both sides for each pair. Each board has at most six finished items. API teams are reconstructed from aggregate cores and item shares; workbook boards are used as opponents with the same item cap. No shops, contested pools, component drops, weather or boons are simulated. Small score gaps may change with more seeds.</p>
      <p><strong>Sources</strong>: <a href="https://einoow.com/api/meta/kanto/meta.json" target="_blank" rel="noreferrer">official meta API</a> (rules 33); <a href="https://docs.google.com/spreadsheets/d/1co1O1oqbBiczdMd6ChPzce1xANRDrQj8lyAvWzEfKe0/edit?gid=5" target="_blank" rel="noreferrer">workbook boards</a>; <a href="https://github.com/Winnywiz/auto-chess/commit/c9f164c6c46aae21cfd9538befc395ddc40c9f67" target="_blank" rel="noreferrer">earlier paths</a>. Opponent sources do not set tiers or placement odds.</p>
    </div></details>''' + text[end:]

    # Keep the existing trait names, add missing families and drop stale choices.
    filter_match = re.search(r'<select id="family-filter"[^\n]*</select>', text)
    if not filter_match:
        raise ValueError("Missing family filter")
    family_select = filter_match.group()
    families = {row['family'] for row in result['rows']}
    family_select = re.sub(
        r'<option value="([^"]+)">[^<]*</option>',
        lambda match: match.group() if not match.group(1) or match.group(1) in families else '',
        family_select,
    )
    family_select = family_select.replace('Electric legacy', 'Electric').replace('Flying legacy', 'Flying')
    existing = set(re.findall(r'<option value="([^"]+)"', family_select))
    missing = sorted(families - existing)
    family_select = family_select.replace('</select>', ''.join(f'<option value="{family}">{family.title()}</option>' for family in missing) + '</select>')
    text = text[:filter_match.start()] + family_select + text[filter_match.end():]

    text = text.replace('.strategy-tag,.origin-tag,.bis-tag,.core-tag{', '.strategy-tag,.bis-tag,.core-tag{')
    text = text.replace('.origin-tag{color:#b9ceeb;border-color:#687b9d}', '')
    text = text.replace('<span class="origin-tag">${r.origin===\'legacy\'?\'Legacy\':\'Breakpoint\'}</span>', '')

    # Gear-dependence labels from the prior runs have not been rescored.
    for obsolete in ('      <label class="dependency-filter"><input id="bis-only" type="checkbox"> BIS dependent</label>\n',
                     "$('#bis-only').checked=false;",
                     "$('#bis-only').onchange=e=>{dependent=e.target.checked;hide();render();};"):
        if obsolete in text:
            text = replace_once(text, obsolete, '')
    HTML.write_text(text)
    print(f"Embedded {len(result['rows'])} rescored paths and {len(combined)} progression guides in {HTML}")


if __name__ == "__main__":
    main()
