#!/usr/bin/env python3
"""Move shared inline media to cacheable files for the static website."""

import base64
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "media"
PAGES = (ROOT / "builder.html", ROOT / "compositions.html")


def main():
    assets = {}
    rewrites = {}
    for page in PAGES:
        html = page.read_text()
        marker = "window.KANTO_MEDIA="
        if marker not in html:
            continue
        start = html.index(marker)
        encoded, length = json.JSONDecoder().raw_decode(html[start + len(marker):])
        end = start + len(marker) + length
        if html[end] != ";":
            raise ValueError(f"Missing media statement terminator in {page}")
        for name, data_url in encoded.items():
            if Path(name).is_absolute() or ".." in Path(name).parts:
                raise ValueError(f"Unsafe media path: {name}")
            match = re.fullmatch(r"data:image/(png|gif|webp);base64,([A-Za-z0-9+/=]+)", data_url)
            if not match:
                raise ValueError(f"Unsupported media format: {name}")
            if Path(name).suffix.lower() != "." + match.group(1):
                raise ValueError(f"Media extension does not match format: {name}")
            data = base64.b64decode(match.group(2), validate=True)
            if name in assets and assets[name] != data:
                raise ValueError(f"Conflicting embedded media: {name}")
            assets[name] = data
        rewrites[page] = html[:start] + html[end + 1:]
    if not assets:
        print("Inline media already extracted")
        return
    for name, data in assets.items():
        target = MEDIA / name
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and target.read_bytes() != data:
            raise ValueError(f"Existing media differs: {name}")
        target.write_bytes(data)
    for page, html in rewrites.items():
        page.write_text(html)
    print(f"Extracted {len(assets)} shared assets to {MEDIA}")


if __name__ == "__main__":
    main()
