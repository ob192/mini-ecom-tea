#!/usr/bin/env bash
# Rebuild public/set/start-mini-7/1.jpg — the card image for the «Старт МІНІ» set.
#
#   ./tools/catalogue/build-set-card.sh
#
# ## Why this image is assembled rather than shot
#
# The set's only photograph was a shallow-depth-of-field close-up: one dish of
# Longjing sharp in front, the other six dark and blurred behind it. Every
# surface that shows a product shows files[0] — the catalogue card at 6:5, the
# rail, the cart at 1:1, the social card — so the product whose entire pitch is
# «7 видів» was advertised by a picture of one green tea. That photograph is
# still here; it is now 2.jpg, and it closes this image as the bottom band.
#
# There is no photograph of all seven together. The shop's unboxing clip has
# the box of pouches, but it is 720x1280, handheld, and shot in hard outdoor
# sun — against a catalogue of dark indoor macros it reads as a different shop.
# So the card is built from the seven products' OWN catalogue photographs. Each
# tile is the real leaf the buyer receives, already on the site, which is also
# why this is honest: nothing here is staged for the set.
#
# ## The two things to preserve if you edit it
#
# **The order is not light-to-dark.** That was the first attempt and it pooled
# the five dark teas into one black mass in the middle of the grid; at card
# size the set read as "a green tea and some shadows". Neighbouring tiles are
# now deliberately unlike each other.
#
# **It must survive a centre crop.** ProductCard asks for 6:5, the cart and the
# gallery ask for 1:1, and object-cover crops the rest away. A 1:1 crop of this
# frame takes 17% off the sides, so nothing that carries meaning may sit in the
# outer eighth. A 3-wide grid survives that; a 4-wide one loses a column.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
OUT="$REPO/public/set/start-mini-7/1.jpg"
BAND="$REPO/public/set/start-mini-7/2.jpg"   # the original photograph
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

GUTTER='#171310'
TILE=554x461
WIDE=1114x461

# slug:brightness-contrast. The lift is per tile because the three darkest
# teas lose all leaf detail at card size without it, and the two pressed cakes
# sit on white paper and blow out with it.
TILES=(
  "green/longjing-cha:2x4"
  "red/dianhong-first-grade:8x5"
  "oolong/tieguanyin-5:4x4"
  "puer/jingmai-qiaomu-shu:2x3"
  "oolong/dahongpao-rougui:12x6"
  "white/lao-baicha-shoumei:2x3"
  "oolong/gaba-oolong:12x6"
)

i=0
for spec in "${TILES[@]}"; do
  i=$((i + 1))
  slug="${spec%%:*}"
  src="$REPO/public/${slug}/1.jpg"
  [ -f "$src" ] || { echo "missing tile source: $src" >&2; exit 1; }
  convert "$src" -auto-orient -gravity center \
    -resize "${TILE}^" -extent "$TILE" \
    -brightness-contrast "${spec##*:}" -modulate 100,105,100 "$WORK/t$i.jpg"
done

# The band is the original photograph's top edge, where the row of dishes is —
# not its centre, which is the sharp Longjing already shown as the first tile.
convert "$BAND" -auto-orient -crop 1713x720+0+40 +repage \
  -resize "${WIDE}^" -gravity center -extent "$WIDE" \
  -brightness-contrast 6x6 "$WORK/band.jpg"

montage "$WORK/t1.jpg" "$WORK/t2.jpg" "$WORK/t3.jpg" \
        "$WORK/t4.jpg" "$WORK/t5.jpg" "$WORK/t6.jpg" \
        -tile 3x2 -geometry +3+3 -background "$GUTTER" "$WORK/top.jpg"
montage "$WORK/t7.jpg" "$WORK/band.jpg" \
        -tile 2x1 -geometry +3+3 -background "$GUTTER" "$WORK/bottom.jpg"

convert "$WORK/top.jpg" "$WORK/bottom.jpg" -append \
  -filter Lanczos -resize 1200x1000! -unsharp 0x0.6+0.4+0.01 \
  -strip -interlace Plane -quality 82 "$OUT"

identify -format '%f %wx%h %b\n' "$OUT"
