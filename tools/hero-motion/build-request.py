#!/usr/bin/env python3
"""Assemble a Runware request JSON, inlining local photos as data URIs.

Runware accepts a reference image as a URL, a UUID, or a `data:` URI. Only the
last of those works here: the shop's photography is untracked phone HEIC sitting
on this machine, there is nowhere public to put it, and uploading product
photography to a host just to reference it would put it somewhere it does not
need to be. So the files are read and base64'd into the request body, which
goes straight to the Runware endpoint and nowhere else.

Usage:
    build-request.py spec.json > request.json

A spec is the request you want, with two extra conveniences:

  "_referenceImages": ["path.jpg", ...]   -> inputs.referenceImages, as data URIs
  "_frameImages":     [{"image": "path.jpg", "frame": "first"}, ...]
                                          -> inputs.frameImages, same treatment

Paths are relative to the spec file. Keys beginning with `_` never reach the API.
"""

from __future__ import annotations

import base64
import json
import mimetypes
import pathlib
import sys


def data_uri(path: pathlib.Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
    payload = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{payload}"


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        return 64

    spec_path = pathlib.Path(sys.argv[1]).resolve()
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    base = spec_path.parent

    def resolve(raw: str) -> pathlib.Path:
        path = (base / raw).resolve()
        if not path.is_file():
            raise SystemExit(f"reference image not found: {path}")
        return path

    inputs = spec.setdefault("inputs", {})

    if refs := spec.pop("_referenceImages", None):
        inputs["referenceImages"] = [data_uri(resolve(r)) for r in refs]

    if frames := spec.pop("_frameImages", None):
        inputs["frameImages"] = [
            {"image": data_uri(resolve(f["image"])), "frame": f["frame"]} for f in frames
        ]

    if not inputs:
        spec.pop("inputs")

    json.dump(spec, sys.stdout, ensure_ascii=False, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
