#!/usr/bin/env python3
"""Write work/comps-v34/final.json into compositions.html (KANTO_COMPS and KANTO_GUIDES)."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "work" / "comps-v34"
PAGE = ROOT / "compositions.html"


def embedded(html, name):
    return json.loads(re.search(r"window\." + name + r"=(\{[^\n]*\});", html).group(1))


def replace(html, name, value):
    blob = "window." + name + "=" + json.dumps(value, ensure_ascii=False, separators=(",", ":")) + ";"
    out, n = re.subn(r"window\." + name + r"=\{[^\n]*\};", lambda _: blob, html, count=1)
    assert n == 1, name
    return out


def clean(text):
    return str(text).replace("—", ", ").replace("–", "-").replace("·", "/")


ENTRIES = {
    "v34-search-1": "Roll at 7 for Exeggutor, Jynx and Venusaur 3★. Slowbro holds Mew's tank items until Mew arrives, then level to 9 for Mewtwo and Zapdos.",
    "v34-search-2": "Roll at 7 for Exeggutor, Alakazam, Venusaur and Parasect 3★. Parasect tanks with the Leftovers set; add Mewtwo, Mew and Starmie as you level.",
}


def main():
    final = json.loads((WORK / "final.json").read_text())
    refs = json.loads((WORK / "references.json").read_text())
    data_html = PAGE.read_text(encoding="utf-8")
    data = embedded(data_html, "KANTO_DATA")
    roster = {r["id"]: r for r in data["roster"]}
    old_guides = embedded(data_html, "KANTO_GUIDES")["guides"]
    name = lambda line, star=2: roster[line]["forms"][star - 1]["name"]
    copies = {1: 1, 2: 3, 3: 9}
    value = lambda team: sum(roster[u["line"]]["cost"] * copies[u["star"]] for u in team)
    rows, guides = [], {}
    passive = {p["id"]: p for p in final["passive"]}
    for c in final["candidates"]:
        sc = final["scores"][c["id"]]
        stages = []
        for level in (8, 9):
            s = sc[str(level)] if str(level) in sc else sc[level]
            board = next(b for b in c["boards"] if b["level"] == level)
            stages.append({"level": level, "tier": s["tier"], "score": s["score"], "peerScore": s["peerScore"],
                           "apiScore": s["groups"].get("api"), "workbookScore": s["groups"].get("workbook"),
                           "n": s["n"], "peerN": s["peerN"],
                           "groups": [{"group": k, "score": v} for k, v in s["groups"].items()] + [{"group": "diverse", "score": s["peerScore"]}],
                           "purchaseGold": value(board["team"]), "gearImpact": None, "bisDependent": False})
        boards = [{"level": b["level"], "team": b["team"]} for b in c["boards"]]
        rows.append({k: c.get(k) for k in ("id", "name", "family", "origin", "source", "carry", "category", "strategy", "rollLevel")} |
                    {"locked": c.get("locked") or [], "boards": boards, "stages": stages})
        old = old_guides.get(c["id"], {})
        tr = final["transitions"][c["id"]]
        final9 = next(b for b in c["boards"] if b["level"] == 9)["team"]
        final_lines = {u["line"] for u in final9}
        gstages = []
        for level in (5, 6, 7, 8):
            t = tr[str(level)] if str(level) in tr else tr[level]
            notes = []
            for h in t["holders"]:
                if h["keep"]:
                    notes.append(f"{name(h['target'], h['targetStar'])} holds its final items.")
                else:
                    notes.append(f"{name(h['holder'], h['holderStar'])} holds {name(h['target'], h['targetStar'])}'s items until it arrives.")
            extra = [u["line"] for u in t["team"] if u["line"] not in final_lines]
            if extra:
                notes.append("Temporary: " + ", ".join(name(x, next(u['star'] for u in t['team'] if u['line'] == x)) for x in extra) + " (shares a final trait or adds utility).")
            gstages.append({"key": f"level-{level}", "level": level, "team": t["team"], "note": clean(" ".join(notes)),
                            "suggested": True, "holders": t["holders"], "itemCount": sum(len(u["items"]) for u in t["team"]),
                            "fromFinal": t["fromFinal"], "score": t["score"]})
        pivots = [clean(p) for p in old.get("pivots", [])]
        p = passive.get(c["id"])
        if p and p.get("adopt"):
            a = p["adopt"]
            pivots.insert(0, clean(f"Version 34 test: {name(a['in'])} replaces {name(a['out'])} in this board (+{100 * a.get('confirmedGain', a['gain']):.1f} points against the reference boards)."))
        entry = ENTRIES.get(c["id"]) or old.get("entry") or f"Build around {name(c['carry'])}. Add the final units as they appear and keep the item holders shown."
        guides[c["id"]] = {"family": c["family"], "entry": clean(entry), "pivots": pivots, "locked": c.get("locked") or [],
                           "stages": gstages, "alternatives": old.get("alternatives", [])}
    ref_list = refs["references"]
    comps = {"version": "v34-rerun-1", "generated": final["generated"], "gameRules": 34, "gameModule": "route-k2DWeEO1.js",
             "apiGenerated": refs["apiGenerated"], "apiRules": refs["apiRules"], "workbookVersion": refs["workbookVersion"],
             "workbookReferences": sum(r["group"] == "workbook" for r in ref_list), "apiReferences": sum(r["group"] == "api" for r in ref_list),
             "seeds": 12, "scoreMethod": "Twelve seeds, both sides; 50% reference boards (workbook and official API, weighted equally) and 50% cross-tag candidates",
             "rows": rows}
    html = replace(data_html, "KANTO_COMPS", comps)
    html = replace(html, "KANTO_GUIDES", {"version": "v34-rerun-1", "note": "Level 5 to 8 boards are built downward from the final board and battle-tested at each level.", "guides": guides})
    PAGE.write_text(html, encoding="utf-8")
    tiers = {}
    for r in rows:
        t = r["stages"][1]["tier"]
        tiers[t] = tiers.get(t, 0) + 1
    print(f"{len(rows)} compositions written; level 9 tiers {tiers}")


if __name__ == "__main__":
    main()
