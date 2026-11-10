#!/usr/bin/env python3
"""Crop a transparent PNG to its non-transparent content, with a small margin.

Runware's removeBackground returns the full input canvas with the cut-out
subject centered on a transparent background — good for previewing, but a
hero-banner <Image> wants a tight bounding box (matches the existing
apps/web/public/images/product-card/*.png convention).

Usage:
  trim_alpha.py <input.png> <output.png> [margin_px]
"""
import sys
from PIL import Image

def main():
    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    src, dst = sys.argv[1], sys.argv[2]
    margin = int(sys.argv[3]) if len(sys.argv) > 3 else 12

    im = Image.open(src).convert("RGBA")
    bbox = im.getbbox()
    if bbox is None:
        print(f"'{src}': fully transparent, nothing to crop", file=sys.stderr)
        sys.exit(1)

    left, top, right, bottom = bbox
    left = max(0, left - margin)
    top = max(0, top - margin)
    right = min(im.width, right + margin)
    bottom = min(im.height, bottom + margin)

    cropped = im.crop((left, top, right, bottom))
    cropped.save(dst, "PNG")
    print(f"✓ {src} {im.size} -> {dst} {cropped.size}")

if __name__ == "__main__":
    main()
