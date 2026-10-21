#!/usr/bin/env python3
"""Build a reproducible candidate/opponent snapshot for Kanto combat scoring."""

import collections
import csv
import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "work" / "composition-run"
LEGACY_COMMIT = "c9f164c6c46aae21cfd9538befc395ddc40c9f67"
SHEET_ID = "1co1O1oqbBiczdMd6ChPzce1xANRDrQj8lyAvWzEfKe0"


def download(url, path):
    if path.exists():
        return
    subprocess.run(
        ["curl", "-L", "--fail", "--silent", "--show-error", "--max-time", "45", url, "-o", str(path)],
        check=True,
    )


def embedded(html, name):
    match = re.search(r"window\." + name + r"=(\{[^\n]*\});", html)
    if not match:
        raise ValueError(f"Missing embedded {name}")
    return json.loads(match.group(1))


def trait_family(row, roster, trait_rules):
    if row.get("family"):
        return row["family"]
    board = next(b for b in row["boards"] if b["level"] == 9)
    counts = collections.Counter(t.lower() for u in board["team"] for t in roster[u["line"]]["traits"])
    active = []
    for name, count in counts.items():
        levels = trait_rules[name.title()]["thresholds"]
        tier = sum(count >= threshold for threshold in levels)
        if tier:
            active.append((tier, count, name))
    _, count, family = max(active, default=(0, 0, "mixed"))
    if family == "flying":
        return "flying-six" if count >= 6 else "flying-four"
    if family == "water" and count < 6:
        return "water-utility"
    return family


def assign_cells(units, roster, positions=None):
    cells = {"front": [29, 30, 31, 28, 32, 33, 34, 35, 36],
             "middle": [42, 43, 44, 41, 45, 46, 47, 48],
             "back": [51, 52, 53, 50, 54, 49, 55, 48, 47]}
    used = set()
    for index, unit in enumerate(units):
        pos = positions[index] if positions else ("front" if roster[unit["line"]]["range"] <= 1 else "back")
        for cell in cells[pos] + cells["middle"] + cells["front"] + cells["back"]:
            if cell not in used:
                unit["cell"] = cell
                used.add(cell)
                break
    return units


def workbook_refs(rows, roster):
    form_to_line = {}
    for line, pokemon in roster.items():
        for form in pokemon["forms"]:
            form_to_line[form["name"].lower()] = line
    refs = []
    sections = [i for i, row in enumerate(rows) if row and re.match(r"^#\d+\s", row[0])]
    for start, end in zip(sections, sections[1:] + [len(rows)]):
        number = int(re.match(r"^#(\d+)", rows[start][0]).group(1))
        parsed = []
        for cells in rows[start + 1:end]:
            if len(cells) < 9 or not re.search(r"\d ดาว", cells[3]) or not cells[4]:
                continue
            line = form_to_line.get(cells[4].strip().lower()) or form_to_line.get(cells[2].strip().lower())
            if not line:
                raise ValueError(f"Workbook #{number}: unknown unit {cells[4]!r}")
            item_names = re.search(r"(?:ใส่: )([^\n]+)", cells[8]) if cells[8] else None
            items = [] if not item_names else [re.sub(r"[^a-z0-9]+", "-", x.lower()).strip("-") for x in item_names.group(1).split(" + ")]
            items = [re.sub(r"-x\d+$", "", item) for item in items]
            position = "front" if "หน้า" in cells[7] else "middle" if "กลาง" in cells[7] else "back"
            parsed.append((cells[0], {"line": line, "star": int(cells[3][0]), "items": items[:3]}, position, cells[1]))
        for level in (8, 9):
            applicable = [(u, p, role) for label, u, p, role in parsed if not (label.startswith("เพิ่มที่") and int(re.search(r"\d+", label).group()) > level)]
            if len(applicable) != level:
                continue
            team = [dict(u) for u, _, _ in applicable]
            item_count = 0
            priority = sorted(range(len(team)), key=lambda i: (0 if applicable[i][2] == "แครี่หลัก" else 1 if applicable[i][2] == "แทงค์" else 2, i))
            for index in priority:
                unit = team[index]
                keep = max(0, 6 - item_count)
                unit["items"] = unit["items"][:keep]
                item_count += len(unit["items"])
            assign_cells(team, roster, [p for _, p, _ in applicable])
            refs.append({"id": f"sheet-{number}", "level": level, "group": "workbook", "team": team})
    return refs


def api_refs(api, roster):
    comps = sorted((c for c in api["comps"] if c["n"] >= 10), key=lambda c: (c["avg"], -c["n"]))[:20]
    refs = []
    for index, comp in enumerate(comps):
        # The API publishes aggregate unit shares, not complete boards. This is a
        # deterministic reconstruction used only as an opponent.
        raw = [u for u in comp["units"] if u["line"] in roster]
        raw.sort(key=lambda u: -u["share"])
        for level in (8, 9):
            chosen = raw[:level]
            if len(chosen) < level:
                continue
            team = [{"line": u["line"], "star": u["star"], "items": []} for u in chosen]
            gear = sorted(((item["share"] * u["share"], k, item["id"])
                           for k, u in enumerate(chosen) for item in u.get("items", [])), reverse=True)
            for _, k, item_id in gear:
                if sum(len(u["items"]) for u in team) >= 6:
                    break
                if len(team[k]["items"]) < 3:
                    team[k]["items"].append(item_id)
            assign_cells(team, roster)
            refs.append({"id": f"api-{index+1}", "level": level, "group": "api", "team": team})
    return refs


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    current_html = (ROOT / "compositions.html").read_text()
    old_path = CACHE / "legacy.html"
    download(f"https://raw.githubusercontent.com/Winnywiz/auto-chess/{LEGACY_COMMIT}/compositions.html", old_path)
    old_html = old_path.read_text()
    api_path = CACHE / "meta.json"
    csv_path = CACHE / "workbook.csv"
    download("https://einoow.com/api/meta/kanto/meta.json", api_path)
    download(f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=5", csv_path)

    data = embedded(current_html, "KANTO_DATA")
    current = embedded(current_html, "KANTO_COMPS")
    old = embedded(old_html, "KANTO_COMPS")
    roster = {r["id"]: r for r in data["roster"]}
    candidates = []
    trait_rows = [r for r in current["rows"] if r.get("origin", "trait") == "trait"]
    for trait, count in (("Normal", 6), ("Water", 6), ("Ice", 4)):
        if not any(
            sum(trait in roster[u["line"]]["traits"] for u in next(b for b in row["boards"] if b["level"] == 9)["team"]) >= count
            for row in trait_rows
        ):
            raise ValueError(f"Missing required {trait} {count} breakpoint candidate")
    for origin, source_rows in (("trait", trait_rows), ("legacy", old["rows"])):
        for row in source_rows:
            candidate = {k: row.get(k) for k in ("id", "name", "carry", "category", "strategy", "rollLevel", "locked", "boards")}
            candidate["origin"] = origin
            candidate["source"] = row.get("source", "Trait breakpoint search")
            candidate["family"] = trait_family(row, roster, data["traits"])
            candidate["previousStages"] = row["stages"]
            candidate["previousPurchaseGold"] = row.get("purchaseGold")
            candidates.append(candidate)
    refs = workbook_refs(list(csv.reader(csv_path.open(encoding="utf-8"))), roster)
    api = json.loads(api_path.read_text())
    if api["rules"] != 33:
        raise ValueError(f"Expected rules 33 for the frozen game module, found rules {api['rules']}")
    refs += api_refs(api, roster)
    out = {"gameVersion": api["rules"], "apiGenerated": api["generated"], "candidates": candidates, "references": refs, "roster": data["roster"], "traits": data["traits"]}
    (CACHE / "input.json").write_text(json.dumps(out, separators=(",", ":")))
    print(f"Prepared {len(candidates)} candidates ({len(trait_rows)} trait, {len(old['rows'])} legacy) and {len(refs)} reference boards")
    print("Breakpoints:", ", ".join(f"{k} {v}" for k, v in sorted(collections.Counter(c["family"] for c in candidates).items())))


if __name__ == "__main__":
    main()
