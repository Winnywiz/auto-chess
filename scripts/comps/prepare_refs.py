#!/usr/bin/env python3
"""Build the opponent reference boards for the Version 34 composition run.

Groups:
  workbook  Community Version 34 boards (workbook and its web version), exact cells where available.
  api       Official meta API player data, reconstructed from unit and item shares.
"""
import csv, json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import prepare_compositions as P  # noqa: E402

WORK = ROOT / "work" / "comps-v34"
NATIVE = ROOT / "work" / "native-v34"
SHEET = "https://docs.google.com/spreadsheets/d/1co1O1oqbBiczdMd6ChPzce1xANRDrQj8lyAvWzEfKe0/export?format=csv&gid=5"
SITE = "https://toongchakantotactics.sorrawit-dos.workers.dev/"


def fetch(url, path, refresh):
    if refresh or not path.exists():
        subprocess.run(["curl", "-L", "--fail", "--silent", "--show-error", "--max-time", "60", url, "-o", str(path)], check=True)


def cap(team, limit=6):
    order = sorted(range(len(team)), key=lambda i: (-len(team[i]["items"]), i))
    left = limit
    for i in order:
        team[i]["items"] = team[i]["items"][:max(0, left)]
        left -= len(team[i]["items"])
    return team


def main():
    refresh = "--refresh" in sys.argv
    WORK.mkdir(parents=True, exist_ok=True)
    fetch(SHEET, WORK / "workbook.csv", refresh)
    fetch(SITE, WORK / "community.html", refresh)
    fetch("https://einoow.com/api/meta/kanto/meta.json", WORK / "meta.json", refresh)
    data = json.loads((NATIVE / "data.json").read_text(encoding="utf-8"))
    roster = {r["id"]: r for r in data["roster"]}
    rows = list(csv.reader((WORK / "workbook.csv").open(encoding="utf-8")))
    version_note = rows[1][0] if len(rows) > 1 else ""
    refs = P.workbook_refs(rows, roster)
    html = (WORK / "community.html").read_text(encoding="utf-8")
    site = json.loads(re.search(r"const DATA=(\{.*?\});\s*\n", html, re.S).group(1))
    exact = 0
    for ref in refs:
        n = int(ref["id"].split("-")[1])
        comp = site["comps"][n - 1] if n - 1 < len(site["comps"]) else None
        if not comp:
            continue
        cells = {u["l"]: u["c"] for u in comp["units"] + comp.get("pre", [])}
        used = set()
        for u in ref["team"]:
            c = cells.get(u["line"])
            if c is not None and c not in used:
                u["cell"] = c
                exact += 1
            used.add(u["cell"])
        if len({u["cell"] for u in ref["team"]}) != len(ref["team"]):
            P.assign_cells(ref["team"], roster)  # fall back if exact cells collide
        cap(ref["team"])
        ref["name"] = comp["sub"]
        ref["tier"] = comp["tier"]
    api = json.loads((WORK / "meta.json").read_text(encoding="utf-8"))
    api_refs = P.api_refs(api, roster)
    for r in api_refs:
        cap(r["team"])
    out = {"workbookVersion": site.get("version"), "workbookUpdated": site.get("updated"), "workbookNote": version_note,
           "apiRules": api["rules"], "apiGenerated": api["generated"], "references": refs + api_refs}
    (WORK / "references.json").write_text(json.dumps(out))
    by = {}
    for r in out["references"]:
        by.setdefault((r["group"], r["level"]), 0)
        by[(r["group"], r["level"])] += 1
    print(f"Workbook v{site.get('version')} ({site.get('updated')}), {exact} exact cells; API rules {api['rules']} generated {api['generated']}")
    print(", ".join(f"{g} L{l}: {n}" for (g, l), n in sorted(by.items())))


if __name__ == "__main__":
    main()
