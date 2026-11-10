#!/usr/bin/env bash
# Turn the shop's raw phone media into the ad's image assets.
#
# telegram_media/ is untracked HEIC straight off a phone (see root .gitignore)
# and nothing in it may be committed, so this script is the bridge: it reads
# from there and writes JPEGs into assets/, which is git-ignored too. Re-run it
# on a fresh checkout before rendering; it is idempotent.
#
# ## The mapping is not a guess
#
# Every pouch in those photos looks the same — chartreuse foil, same white
# label — so the only thing that says which tea a photo shows is the printed
# label, and the only thing that makes the ad truthful is pairing each photo
# with the right name. The labels were read at full resolution; the Ukrainian
# line quoted beside each file below is what that photo's label actually says.
# If you re-shoot, re-read the labels before you re-point these.
#
# Order matches the seven bullets under "Що всередині:" in the set's
# description in public/products.json, which is the order catalogue.mjs
# returns and the order the ad counts in.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
RAW="$REPO/telegram_media"
OUT="$HERE/assets"

command -v convert >/dev/null || { echo "ImageMagick 'convert' is required" >&2; exit 1; }
[ -d "$RAW" ] || { echo "missing $RAW (untracked raw phone media)" >&2; exit 1; }

mkdir -p "$OUT"

#     target            source           label printed on the pouch in that photo
#     ----------------  ---------------  -----------------------------------------
map=(
  "tea-1:IMG_7444:Габа Наполеон"
  "tea-2:IMG_7447:Шу Пуер Цзінмай Цяому (2016 р.)"
  "tea-3:IMG_7449:Лунцзин весна 2025р."
  "tea-4:IMG_7445:Дянь Хун перший сорт — Червоний чай"
  "tea-5:IMG_7440:Лао Бай ча Шоу Мей 2016р. — Білий чай"
  "tea-6:IMG_7438:Те Гуань Інь №5 (2025 р.) — Южнофуцзянський улун"
  "tea-7:IMG_7448:Да Хун Пао Жоу Гуй (2024 р.) — Уїшанський улун"
)

for row in "${map[@]}"; do
  target="${row%%:*}"; rest="${row#*:}"
  source="${rest%%:*}"; label="${rest#*:}"
  src="$RAW/$source.HEIC"
  [ -f "$src" ] || { echo "missing $src" >&2; exit 1; }
  # 1600px long edge: more than any of the three formats needs at 1080 wide,
  # which leaves room for the slow push-in without resampling softness.
  convert "$src" -auto-orient -resize 1600x1600 -quality 90 "$OUT/$target.jpg"
  printf '%-7s <- %s  (%s)\n' "$target" "$source.HEIC" "$label"
done

# The opener: what actually turns up at the door. Pulled from the unboxing
# clip rather than the studio photos because the kraft box and the ribbon are
# the part a first-time buyer has never seen.
CLIP="$RAW/IMG_1210.MOV"
if [ -f "$CLIP" ]; then
  # 32s is the one frame in the clip that states the whole offer without a
  # word: the lid is off, the pouches are laid out and countable, and the
  # labels read. Earlier frames are a hand and a half-open flap; later ones
  # pull back to the bench and lose the product.
  ffmpeg -v error -y -ss 32 -i "$CLIP" -frames:v 1 -q:v 2 "$OUT/open-box.jpg"
  echo "open-box <- IMG_1210.MOV @32s"
else
  echo "warning: $CLIP missing, opener will fall back to tea-1" >&2
fi

echo "assets ready in $OUT"
