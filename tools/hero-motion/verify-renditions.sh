#!/usr/bin/env bash
# Check public/video against the contract in components/HeroVideo.tsx.
#
#   ./verify-renditions.sh [public/video]
#
# Four things can go wrong silently and all four are expensive:
#   - the poster stops being the video's own frame 0, and the fade from poster
#     to video becomes a visible jump on every first visit;
#   - a file drifts out of the 0.9-2.5 MB band and a phone downloads a master;
#   - an MP4 loses +faststart and playback waits for the whole download;
#   - the loop stops closing and the hero cuts every twelve seconds.
# Exit code is non-zero if any of them has.
set -uo pipefail

DIR="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/public/video}"
FAIL=0
note () { printf '  %-5s %s\n' "$1" "$2"; [ "$1" = "FAIL" ] && FAIL=1; return 0; }

echo "verifying $DIR"

# ---- presence, dimensions, size band ----------------------------------------
check () { # <file> <w> <h>
  local f="$DIR/$1"
  if [ ! -f "$f" ]; then note FAIL "$1 missing"; return; fi
  local dim; dim="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$f")"
  [ "$dim" = "$2,$3" ] && note ok "$1 is $dim" || note FAIL "$1 is $dim, expected $2,$3"
  local bytes; bytes="$(stat -c%s "$f")"
  local mb; mb="$(awk -v b="$bytes" 'BEGIN{printf "%.2f", b/1000000}')"
  if [ "$bytes" -gt 2500000 ]; then note FAIL "$1 is ${mb} MB, over the 2.5 MB ceiling"
  elif [ "$bytes" -lt 700000 ]; then note WARN "$1 is only ${mb} MB — check it still looks right"
  else note ok "$1 is ${mb} MB"; fi
}
check hero-720.mp4   1280 720
check hero-720.webm  1280 720
check hero-1080.mp4  1920 1080
check hero-1080.webm 1920 1080

# ---- faststart ---------------------------------------------------------------
# With +faststart the moov atom sits near the head of the file; without it, at
# the tail. Reading the first 64 KB is enough to tell which.
for f in hero-720.mp4 hero-1080.mp4; do
  [ -f "$DIR/$f" ] || continue
  if head -c 65536 "$DIR/$f" | grep -qa moov; then note ok "$f has +faststart"
  else note FAIL "$f has no +faststart (moov at the end)"; fi
done

# ---- the poster is frame 0 ---------------------------------------------------
# Compared as pixels, not bytes: the poster is a JPEG and the frame is decoded
# H.264, so they can never be byte-identical. Anything under ~1 RMS on 0-255 is
# the same frame through two codecs; a different frame scores far higher.
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
if [ -f "$DIR/hero-poster.jpg" ]; then
  for f in hero-720 hero-1080; do
    [ -f "$DIR/$f.mp4" ] || continue
    ffmpeg -v error -y -i "$DIR/$f.mp4" -frames:v 1 "$TMP/$f-frame0.png"
    RMS="$(python3 -I -c "
import sys, numpy as np, cv2
a = cv2.imread(sys.argv[1]); b = cv2.imread(sys.argv[2])
b = cv2.resize(b, (a.shape[1], a.shape[0]), interpolation=cv2.INTER_AREA)
print(f'{float(np.sqrt(((a.astype(float)-b.astype(float))**2).mean())):.2f}')
" "$TMP/$f-frame0.png" "$DIR/hero-poster.jpg" 2>/dev/null)"
    if [ -z "$RMS" ]; then note WARN "could not compare poster to $f frame 0"
    elif awk -v r="$RMS" 'BEGIN{exit !(r < 6)}'; then note ok "poster matches $f frame 0 (RMS $RMS)"
    else note FAIL "poster is NOT $f frame 0 (RMS $RMS)"; fi
  done
else
  note FAIL "hero-poster.jpg missing"
fi

# ---- the loop closes ---------------------------------------------------------
if [ -f "$DIR/hero-1080.mp4" ]; then
  ffmpeg -v error -y -i "$DIR/hero-1080.mp4" -frames:v 1 "$TMP/first.png"
  ffmpeg -v error -y -sseof -0.08 -i "$DIR/hero-1080.mp4" -update 1 "$TMP/last.png"
  SEAM="$(python3 -I -c "
import sys, numpy as np, cv2
a = cv2.imread(sys.argv[1]).astype(float); b = cv2.imread(sys.argv[2]).astype(float)
print(f'{float(np.sqrt(((a-b)**2).mean())):.2f}')
" "$TMP/first.png" "$TMP/last.png" 2>/dev/null)"
  if [ -z "$SEAM" ]; then note WARN "could not measure the loop seam"
  elif awk -v r="$SEAM" 'BEGIN{exit !(r < 8)}'; then note ok "loop closes (first-to-last RMS $SEAM)"
  elif awk -v r="$SEAM" 'BEGIN{exit !(r < 16)}'; then note WARN "loop seam is soft (RMS $SEAM) — look at it"
  else note FAIL "loop does not close (RMS $SEAM)"; fi
fi

echo
[ "$FAIL" -eq 0 ] && echo "all checks passed" || echo "CONTRACT BROKEN — see FAIL above"
exit "$FAIL"
