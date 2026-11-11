#!/usr/bin/env bash
# Rebuild the reference crops the hero still is generated from.
#
# hero-still.json points at media/hero-motion/ref/, which is git-ignored, and
# the originals are untracked phone HEIC in telegram_media/ — so without this
# script a fresh checkout has the prompt but not the pictures it refers to, and
# the still comes back looking like generic stock tea instead of this shop's
# own tray, pouches and porcelain.
#
# Small on purpose: at full size the four references made a 1.4 MB request
# body, and two 768px crops carry the same information for the model.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
RAW="$REPO/telegram_media"
OUT="$REPO/media/hero-motion/ref"

command -v convert >/dev/null || { echo "ImageMagick 'convert' is required" >&2; exit 1; }
[ -d "$RAW" ] || { echo "missing $RAW (untracked raw phone media)" >&2; exit 1; }
mkdir -p "$OUT"

# IMG_7438 — a pouch, its white label and the white teardrop cha-he together.
# IMG_7439 — the carved tray's medallion and slats, the texture that has to
#            survive into the generated scene.
convert "$RAW/IMG_7438.HEIC" -auto-orient -resize 768x768 -quality 82 "$OUT/small-pouch.jpg"
convert "$RAW/IMG_7439.HEIC" -auto-orient -resize 768x768 -quality 82 "$OUT/small-tray.jpg"

ls -l "$OUT"
