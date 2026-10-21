#!/usr/bin/env python3
"""Add the independently confirmed Ice 4 search result before rescoring all paths."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "compositions.html"
REPORT = ROOT / "work" / "composition-run" / "search-results.json"
SAVED_REPORT = ROOT / "research" / "kanto-search-2026-10-21.json"
NEW_ID = "ice-dugtrio-search"


def embedded(text, name):
    marker = "window." + name + "="
    start = text.index(marker) + len(marker)
    value, length = json.JSONDecoder().raw_decode(text[start:])
    return value, start, start + length


def stage(level, units, note, item_count):
    team = [
        {"line": line, "star": star, "items": items, "cell": cell,
         **({"assignment": role} if role else {})}
        for line, star, items, cell, role in units
    ]
    assert len(team) == level and len({unit["cell"] for unit in team}) == level
    assert sum(len(unit["items"]) for unit in team) == item_count
    holders = [
        {"holder": line, "holderStar": star, "target": line, "targetStar": 3,
         "items": items, "keep": True}
        for line, star, items, _, _ in units if line in ("diglett", "geodude")
    ]
    return {"key": f"level-{level}", "level": level, "team": team,
            "note": note, "suggested": True, "holders": holders, "itemCount": item_count}


def guide():
    lens = "scope-lens"
    berry = "leftovers"
    return {
        "family": "dug-ice",
        "entry": "Commit to the Dugtrio and Golem reroll only when their copies arrive early. This Ice 4 cap also needs upgraded Ice units and two-star legendaries, so use the Ground version until those upgrades appear.",
        "pivots": [
            "Keep Dugtrio and Golem equipped. Replace the temporary Ice and Electric units only after Articuno, Zapdos and the matching upgrades are ready.",
            "If the Ice units or legendaries do not arrive, stay on the cheaper Dugtrio Ground board. Do not spend down chasing Seel 3-star and Magneton 3-star late.",
        ],
        "locked": ["diglett", "geodude"],
        "stages": [
            stage(5, [
                ("diglett", 3, [lens, lens], 31, "Carry"),
                ("geodude", 2, [berry], 29, "Frontline"),
                ("onix", 1, [], 28, None),
                ("magnemite", 1, [], 52, None),
                ("voltorb", 1, [], 50, None),
            ], "Roll for Dugtrio and Golem while using Rock 2 and Electric 2. Their three-star versions are targets, not guaranteed hits.", 3),
            stage(6, [
                ("diglett", 3, [lens, lens], 31, "Carry"),
                ("geodude", 3, [berry, berry], 29, "Frontline"),
                ("onix", 1, [], 28, None),
                ("magnemite", 2, [], 52, None),
                ("voltorb", 2, [], 50, None),
                ("seel", 1, [], 30, None),
            ], "Add Seel while keeping the early Rock and Electric support. Save gold after the reroll hits.", 4),
            stage(7, [
                ("diglett", 3, [lens, lens, lens], 31, "Carry"),
                ("geodude", 3, [berry, berry], 29, "Frontline"),
                ("onix", 2, [], 28, None),
                ("magnemite", 2, [], 52, None),
                ("voltorb", 2, [], 50, None),
                ("seel", 2, [], 30, None),
                ("jynx", 1, [], 54, None),
            ], "Jynx starts the Ice transition. Do not sell the upgraded Ground board before the Ice replacements are ready.", 5),
            stage(8, [
                ("diglett", 3, [lens, lens, lens], 41, "Carry"),
                ("geodude", 3, [berry, berry, berry], 32, "Frontline"),
                ("magnemite", 2, [], 49, None),
                ("voltorb", 2, [], 28, None),
                ("seel", 2, [], 30, None),
                ("jynx", 2, [], 55, None),
                ("lapras", 1, [], 34, None),
                ("shellder", 1, [], 51, None),
            ], "This is the Ice 4 bridge. Replace Jynx with Articuno and Electrode with Zapdos only when the new units are ready; the tested cap requires higher stars.", 6),
        ],
        "alternatives": [
            {"id": "adapt-sheet-8", "note": "Keep the Dugtrio and Golem core if Ice upgrades miss.", "earlyOnly": False},
            {"id": "ice-articuno", "note": "Use a direct Articuno carry when Dugtrio reroll misses.", "earlyOnly": False},
        ],
    }


def main():
    report = json.loads((REPORT if REPORT.exists() else SAVED_REPORT).read_text())
    if len(report.get("confirmationSeeds", [])) < 32:
        raise ValueError("Run the independent confirmation pass first")
    chosen = max((row for row in report["confirmations"] if row["family"] == "Ice"),
                 key=lambda row: row["score"]["score"])
    peer = next(row["peer"]["score"] for row in report["findings"]
                if row["family"] == "Ice" and row["team"] == chosen["team"] and row["peer"])
    score = chosen["score"]
    reference = (score["score"] + peer) / 2
    if not (score["api"] >= .5 and score["workbook"] >= .5 and peer >= .55 and reference >= .65):
        raise ValueError("The confirmed board does not meet the current S threshold")
    html = HTML.read_text()
    comps, start, end = embedded(html, "KANTO_COMPS")
    if any(row["id"] == NEW_ID for row in comps["rows"]):
        print(f"{NEW_ID} is already in the page")
        return
    final = chosen["team"]
    bridge = [unit for unit in final if unit["line"] != "rhyhorn"]
    assert len(bridge) == 8
    row = {
        "id": NEW_ID, "name": "Ice 4 / Dugtrio", "family": "ice", "origin": "trait",
        "source": "Expanded Version 33 trait search", "carry": "diglett",
        "category": "reroll-5", "strategy": "Reroll 5", "rollLevel": 5,
        "locked": ["diglett", "geodude"],
        "boards": [{"level": 8, "team": bridge}, {"level": 9, "team": final}],
        "stages": [{"level": 8, "tier": "B", "purchaseGold": chosen["gold"] - 3},
                   {"level": 9, "tier": "B", "purchaseGold": chosen["gold"]}],
    }
    comps["rows"].append(row)
    html = html[:start] + json.dumps(comps, ensure_ascii=False, separators=(",", ":")) + html[end:]
    guides, start, end = embedded(html, "KANTO_GUIDES")
    guides["guides"][NEW_ID] = guide()
    html = html[:start] + json.dumps(guides, ensure_ascii=False, separators=(",", ":")) + html[end:]
    HTML.write_text(html)
    print(f"Added {NEW_ID}: confirmed {reference:.1%} reference, {score['workbook']:.1%} workbook")


if __name__ == "__main__":
    main()
