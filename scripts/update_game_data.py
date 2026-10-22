#!/usr/bin/env python3
"""Replace window.KANTO_DATA in the builder and composition pages with a fresh extract."""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "work" / "native-v34" / "data.json")
data = json.loads(source.read_text(encoding="utf-8"))
for name in ("builder.html", "compositions.html"):
    path = ROOT / name
    html = path.read_text(encoding="utf-8")
    old = json.loads(re.search(r"window\.KANTO_DATA=(\{[^\n]*\});", html).group(1))
    data["frames"] = data.get("frames") or old["frames"]
    data["rules"] = data.get("rules") or old["rules"]
    blob = "window.KANTO_DATA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";"
    html, n = re.subn(r"window\.KANTO_DATA=\{[^\n]*\};", lambda _: blob, html, count=1)
    assert n == 1, name
    path.write_text(html, encoding="utf-8")
    print(f"{name}: KANTO_DATA updated to {data['build']}")
