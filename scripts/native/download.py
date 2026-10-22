#!/usr/bin/env python3
"""Download the public Kanto Tactics game modules into work/native-v34 and install the harness.

The game code is not stored in this repository. This script fetches the current build from the official
site, records file hashes, and copies headless.mjs and extract-data.mjs next to it.
"""
import hashlib, json, re, shutil, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "work" / "native-v34"
BASE = "https://einoow.com/playables/kanto-tactics/"


def get(url, path):
    subprocess.run(["curl", "-L", "--fail", "--silent", "--show-error", "--max-time", "60", url, "-o", str(path)], check=True)


def main():
    assets = OUT / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    get(BASE, OUT / "entry.html")
    pending = set(re.findall(r"assets/([^\"' )]+\.(?:js|css))", (OUT / "entry.html").read_text(encoding="utf-8")))
    seen = set()
    while pending:
        name = pending.pop()
        if name in seen:
            continue
        seen.add(name)
        path = assets / name
        if not path.exists():
            get(BASE + "assets/" + name, path)
        if name.endswith(".js"):
            text = path.read_text(encoding="utf-8", errors="replace")
            pending.update(re.findall(r"[\"'`]\./([A-Za-z0-9_.-]+\.(?:js|css))[\"'`]", text))
            pending.update(re.findall(r"assets/([A-Za-z0-9_.-]+\.(?:js|css))", text))
    (assets / "package.json").write_text('{"type":"module"}\n')
    required = {"route-k2DWeEO1.js", "roster-BrG7EKy8.js"}
    if not required.issubset(seen):
        raise RuntimeError("The live build has changed. Update the pinned harness imports and export mappings before installing it; refusing to reuse old v34 modules.")
    get(BASE + "changelog.json", OUT / "changelog.json")
    manifest = {name: hashlib.sha256((assets / name).read_bytes()).hexdigest() for name in sorted(seen)}
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=1))
    here = Path(__file__).resolve().parent
    for f in ("headless.mjs", "extract-data.mjs"):
        shutil.copy(here / f, OUT / f)
    route = [n for n in seen if n.startswith("route-") and n.endswith(".js")]
    print(f"{len(seen)} files; verified pinned v34 route module {route}.")


if __name__ == "__main__":
    main()
