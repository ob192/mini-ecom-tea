"""
Vertical metrics of a font, and the tightest line-height at which two lines of a script cannot touch.

    python font-metrics.py FONT [FONT ...] [--wght 700] [--chars "ЇЙЁїй"] [--desc "урдцщфgpyj"]

FONT is a .woff2/.ttf/.otf file; pass every subset file of one family (next/font splits Latin and
Cyrillic; find them in .next/static/media or .next/dev/static/media). Needs fontTools and brotli
(`python -m venv venv && venv/bin/pip install fonttools brotli`).

Reports, in em: content area (the box CSS draws for line-height: normal), cap height, x-height,
the highest mark among --chars and the deepest descender among --desc, and their sum: the
line-height at which a descender on one line meets that mark on the next. Leading under
`sum + 0.03` risks a collision in multi-line headings.
"""

import argparse

from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

CYRILLIC_MARKS = "ЇЙЁЎїйёў"
DESCENDERS = "урдцщфДЦЩgpqyj"


def load(path, wght):
	font = TTFont(path)
	if wght and "fvar" in font:
		font = instancer.instantiateVariableFont(font, {"wght": wght})
	return font


def extent(fonts, ch):
	for font in fonts:
		glyph = font.getBestCmap().get(ord(ch))
		if glyph:
			glyphs = font.getGlyphSet()
			pen = BoundsPen(glyphs)
			glyphs[glyph].draw(pen)
			return pen.bounds
	return None


def main():
	ap = argparse.ArgumentParser()
	ap.add_argument("fonts", nargs="+")
	ap.add_argument("--wght", type=float, default=None, help="instance of a variable font, e.g. 700 for headings")
	ap.add_argument("--chars", default=CYRILLIC_MARKS, help="glyphs with marks above the cap height")
	ap.add_argument("--desc", default=DESCENDERS, help="glyphs that descend")
	a = ap.parse_args()

	fonts = [load(p, a.wght) for p in a.fonts]
	head = fonts[0]
	upm = head["head"].unitsPerEm
	os2 = head["OS/2"]
	hhea = head["hhea"]
	em = lambda v: v / upm

	use_typo = bool(os2.fsSelection & 1 << 7)
	asc, desc, gap = (os2.sTypoAscender, -os2.sTypoDescender, os2.sTypoLineGap) if use_typo else (hhea.ascent, -hhea.descent, hhea.lineGap)
	print(f"family      {head['name'].getDebugName(1)}  wght {a.wght or 'default'}")
	print(f"content     {em(asc + desc + gap):.3f} em  (ascent {em(asc):.3f}, descent {em(desc):.3f}, gap {em(gap):.3f}, {'typo' if use_typo else 'hhea'} metrics)")
	print(f"cap height  {em(os2.sCapHeight):.3f}   x-height {em(os2.sxHeight):.3f}   x/cap {os2.sxHeight / os2.sCapHeight:.2f}")

	tops = [(extent(fonts, c), c) for c in a.chars]
	bottoms = [(extent(fonts, c), c) for c in a.desc]
	tops = [(b[3], c) for b, c in tops if b]
	bottoms = [(b[1], c) for b, c in bottoms if b]
	missing = [c for c in a.chars + a.desc if not extent(fonts, c)]
	if missing:
		print(f"not in font {''.join(missing)}  (pass the other subset files)")
	if not tops or not bottoms:
		return
	top, top_ch = max(tops)
	bottom, bottom_ch = min(bottoms)
	touch = em(top - bottom)
	print(f"highest     {top_ch} {em(top):.3f}   deepest {bottom_ch} {em(bottom):.3f}")
	print(f"touch at    line-height {touch:.3f}  ->  keep multi-line headings at {touch + 0.03:.2f} or more")


if __name__ == "__main__":
	main()
