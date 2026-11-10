#!/usr/bin/env python3
"""Keep only the biggest opaque shape in a transparent PNG, drop the rest.

Supplier frames routinely carry more than the product: an inset thumbnail of the
same item, a bundled remote control, a coiled cable. Background removal keeps every
one of them, because they are all genuinely foreground. For a banner cut-out only
the main subject is wanted, and "main" is reliably the largest connected region.

Usage: largest_blob.py <input.png> <output.png> [margin_px]
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter


def largest_component(mask):
    """Iterative 4-connected flood fill — recursion blows the stack on real images."""
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    best_size, best_cells = 0, None

    for sy in range(h):
        for sx in range(w):
            if not mask[sy, sx] or seen[sy, sx]:
                continue
            cells, q = [], deque([(sy, sx)])
            seen[sy, sx] = True
            while q:
                y, x = q.popleft()
                cells.append((y, x))
                for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
            if len(cells) > best_size:
                best_size, best_cells = len(cells), cells
    return best_size, best_cells


def main():
    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        sys.exit(2)
    src, dst = sys.argv[1], sys.argv[2]
    margin = int(sys.argv[3]) if len(sys.argv) > 3 else 8

    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    alpha = arr[..., 3]

    # Work at reduced scale: component labelling is O(pixels) in Python, and a
    # downscaled mask finds the same regions an order of magnitude faster.
    scale = max(1, max(im.size) // 320)
    small = (alpha[::scale, ::scale] > 24)
    size, cells = largest_component(small)
    if not cells:
        print(f"'{src}': nothing opaque found", file=sys.stderr)
        sys.exit(1)

    # Mask by the region itself, not its bounding box: a neighbouring object whose
    # pixels fall inside that box (an inset thumbnail overlapping the subject's
    # bounds) would otherwise survive the crop.
    region = np.zeros_like(small, dtype=bool)
    for y, x in cells:
        region[y, x] = True
    # Grow back to full resolution and dilate by one cell to avoid shaving edges.
    grown = np.repeat(np.repeat(region, scale, axis=0), scale, axis=1)
    pad_y, pad_x = alpha.shape[0] - grown.shape[0], alpha.shape[1] - grown.shape[1]
    if pad_y > 0 or pad_x > 0:
        grown = np.pad(grown, ((0, max(0, pad_y)), (0, max(0, pad_x))), mode="edge")
    grown = grown[: alpha.shape[0], : alpha.shape[1]]
    grown = np.asarray(
        Image.fromarray((grown * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * scale + 1))
    ) > 127
    arr[..., 3] = np.where(grown, alpha, 0)
    out = Image.fromarray(arr)
    box = out.getbbox()
    out = out.crop(
        (
            max(0, box[0] - margin),
            max(0, box[1] - margin),
            min(out.width, box[2] + margin),
            min(out.height, box[3] + margin),
        )
    )
    out.save(dst, "PNG")
    print(f"✓ kept largest of {size} cells -> {dst} {out.size}")


if __name__ == "__main__":
    main()
