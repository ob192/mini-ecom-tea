#!/usr/bin/env python3
"""Contrast of a text colour against the real pixels behind it, from screenshots.

usage: contrast-at.py <png> <x> <y> <w> <h> <text colour> [--bg <png without text>] [--scale N]

x, y, w, h: the text box in CSS pixels, in the screenshot's coordinates. Text colour: #hex,
rgb() or rgba() — measure.js returns rgba, and alpha is blended over each background pixel.
--scale: the screenshot's device pixel ratio (1 for CSS-scale screenshots).

Reliable mode: take a second screenshot with the text hidden (`color: transparent` on the
target's text) and pass it as --bg; every pixel inside the box is then true background.
Without --bg, pixels near the text colour are masked out of the text screenshot, which lets
anti-aliased glyph edges through — trust p5 and median, not the minimum.
Reports p5 (the practical worst), median and best WCAG ratios. Needs Pillow.
"""
import re
import statistics
import sys

from PIL import Image


def parse_colour(value):
    value = value.strip()
    if value.startswith("#"):
        value = value.lstrip("#")
        return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4)) + (1.0,)
    if not re.match(r"rgba?\(", value):
        sys.exit(f"unsupported colour {value!r}: pass #hex, rgb() or rgba() (measure.js gives rgba)")
    nums = [float(n) for n in re.findall(r"[\d.]+", value)]
    return (*(int(n) for n in nums[:3]), nums[3] if len(nums) > 3 else 1.0)


def luminance(rgb):
    def channel(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (channel(c) for c in rgb[:3])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def blend(fg, bg):
    a = fg[3]
    return tuple(round(f * a + b * (1 - a)) for f, b in zip(fg[:3], bg))


def option(name):
    if name not in sys.argv:
        return None
    i = sys.argv.index(name)
    value = sys.argv[i + 1]
    del sys.argv[i:i + 2]
    return value


def main():
    bg_png = option("--bg")
    scale = float(option("--scale") or 1)
    png, x, y, w, h, colour = sys.argv[1], *(float(v) for v in sys.argv[2:6]), sys.argv[6]
    fg = parse_colour(colour)
    x0, y0, x1, y1 = (int(v * scale) for v in (x, y, x + w, y + h))

    if bg_png:
        im = Image.open(bg_png).convert("RGB")
        pixels = [im.getpixel((xx, yy)) for yy in range(max(0, y0), min(im.height, y1)) for xx in range(max(0, x0), min(im.width, x1))]
    else:
        im = Image.open(png).convert("RGB")
        pad = int(6 * scale)
        pixels = []
        for yy in range(max(0, y0 - pad), min(im.height, y1 + pad)):
            for xx in range(max(0, x0 - pad), min(im.width, x1 + pad)):
                p = im.getpixel((xx, yy))
                if sum(abs(a - b) for a, b in zip(p, fg[:3])) > 120:
                    pixels.append(p)
    if not pixels:
        sys.exit("no background pixels found — check the box and --scale")

    ratios = sorted(ratio(blend(fg, p), p) for p in pixels)
    p5 = ratios[int(len(ratios) * 0.05)]
    mode = "text-free background" if bg_png else "masked text screenshot"
    print(f"p5 {p5:.2f}  median {statistics.median(ratios):.2f}  best {ratios[-1]:.2f}  ({len(pixels)} px, {mode})")


if __name__ == "__main__":
    main()
