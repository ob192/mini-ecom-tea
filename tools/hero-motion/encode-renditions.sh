#!/usr/bin/env bash
# Turn the generated master into the four renditions public/video serves,
# plus the poster, on the local GPU.
#
#   ./encode-renditions.sh <master.mp4> [seam-frames]
#
# `seam-frames` (default 0) dissolves that many frames at the END of the clip
# into frame 0, closing an imperfect loop. See "The seam" below for why the fix
# can only ever be applied to the tail.
#
# ## What the component expects
#
# components/HeroVideo.tsx is the contract and it is specific:
#   - 720p for phones, 1080p above 768px, VP9/WebM first with an H.264/MP4
#     twin, under these four exact filenames;
#   - `-movflags +faststart` on the MP4s, or playback waits for the whole file;
#   - each file in the 0.9-2.5 MB band, because the entire point of the
#     renditions is that a phone never downloads a master;
#   - public/video/hero-poster.jpg is the video's OWN frame 0 — components/
#     Hero.tsx fades the clip in over that still, and the fade has nothing to
#     cut between only when they are the same frame.
#
# ## The seam
#
# The loop is generated with the same image pinned as both the first and the
# last frame, so it should already close. When it does not, the repair has to
# leave frame 0 untouched — frame 0 is the poster, and a poster that is a
# blend of the opening and the ending is no longer the frame the video starts
# on. So the dissolve runs the other way: the last N frames fade into frame 0,
# which makes the final frame exactly equal to the first and costs nothing
# visible on a shot that is already drifting slowly.
#
# ## Where the GPU is and is not used
#
# NVDEC decodes and scale_cuda does the 720->1080 resize; the dissolve and the
# grade run on the CPU because ffmpeg 4.4 has no CUDA filter for either. The
# final web files are encoded with libx264 / libvpx-vp9 rather than NVENC on
# purpose: at the ~1 MB these files have to hit, NVENC spends its bitrate much
# less efficiently than x264 at `preset slow`, and the band in the contract is
# tight. The GPU does the heavy pixel work; the slow CPU encoder does the last
# mile, where every kilobyte is being argued over. encode-compare.sh in this
# folder prints the measurement that decision rests on.
set -euo pipefail

MASTER="${1:?usage: encode-renditions.sh <master.mp4> [seam-frames]}"
SEAM="${2:-0}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
OUT="$REPO/public/video"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

[ -f "$MASTER" ] || { echo "no such master: $MASTER" >&2; exit 1; }
mkdir -p "$OUT"

FPS="$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$MASTER")"
echo "master: $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of csv=p=0 "$MASTER") @ $FPS"

# ---------------------------------------------------------------- 1. grade ---
# A light, deliberate grade, not a look: lift the blacks a touch so the deep
# shadows of the tray do not crush to flat black once VP9 has had them, pull a
# little green into the low end and warmth into the highlights to sit with
# --green-deep and --amber, and a mild unsharp to survive two rescales.
GRADE="eq=contrast=1.06:saturation=1.05:gamma=1.02,\
colorbalance=rs=-0.02:gs=0.02:bs=-0.01:rm=0.02:gm=0.01:bm=-0.02:rh=0.03:gh=0.01:bh=-0.02,\
unsharp=5:5:0.45:5:5:0.0"

GRADED="$WORK/graded.mp4"
ffmpeg -v error -y -hwaccel cuda -i "$MASTER" -an -vf "$GRADE" \
  -c:v hevc_nvenc -preset p7 -rc vbr -cq 16 -b:v 0 -pix_fmt yuv420p "$GRADED"
echo "graded (NVENC HEVC intermediate): $(du -h "$GRADED" | cut -f1)"

# --------------------------------------------------------------- 2. seam ----
SOURCE="$GRADED"
if [ "$SEAM" -gt 0 ]; then
  TOTAL="$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$GRADED")"
  START=$((TOTAL - SEAM))
  echo "seam: dissolving frames ${START}..$((TOTAL-1)) into frame 0"
  ffmpeg -v error -y -i "$GRADED" -frames:v 1 -q:v 1 "$WORK/frame0.png"
  SEAMED="$WORK/seamed.mp4"
  # The still is looped as a second input and mixed in over the tail only, so
  # every frame before START is passed through bit-for-bit, frame 0 included.
  ffmpeg -v error -y -i "$GRADED" -loop 1 -i "$WORK/frame0.png" \
    -filter_complex "[1:v]format=yuv420p,setsar=1[still];\
[0:v][still]blend=all_expr='if(gte(N,${START}),A*(1-(N-${START}+1)/${SEAM})+B*((N-${START}+1)/${SEAM}),A)'[v]" \
    -map "[v]" -frames:v "$TOTAL" -an \
    -c:v hevc_nvenc -preset p7 -rc vbr -cq 16 -b:v 0 -pix_fmt yuv420p "$SEAMED"
  SOURCE="$SEAMED"
fi

# ------------------------------------------------------- 3. the renditions ---
# scale_cuda for the upscale; the download back to system memory is what lets
# the software encoders take it from there.
up () { echo "hwupload_cuda,scale_cuda=$1:$2:interp_algo=lanczos,hwdownload,format=yuv420p"; }
down () { echo "scale=$1:$2:flags=lanczos"; }

enc_mp4 () { # <vf> <crf> <profile> <out>
  ffmpeg -v error -y -i "$SOURCE" -an -vf "$1" \
    -c:v libx264 -preset slow -crf "$2" -profile:v "$3" -pix_fmt yuv420p \
    -g 50 -movflags +faststart "$4"
}
enc_webm () { # <vf> <crf> <out>
  ffmpeg -v error -y -i "$SOURCE" -an -vf "$1" \
    -c:v libvpx-vp9 -crf "$2" -b:v 0 -cpu-used 2 -row-mt 1 -g 50 "$3"
}

W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$SOURCE")
if [ "$W" -ge 1920 ]; then VF1080="$(down 1920 1080)"; else VF1080="$(up 1920 1080)"; fi
VF720="$(down 1280 720)"

echo "encoding renditions ..."
enc_mp4  "$VF720"  27 main "$OUT/hero-720.mp4"
enc_mp4  "$VF1080" 26 high "$OUT/hero-1080.mp4"
enc_webm "$VF720"  36      "$OUT/hero-720.webm"
enc_webm "$VF1080" 34      "$OUT/hero-1080.webm"

# ------------------------------------------------------------- 4. poster ----
# Taken from a rendition, not from the generated still, so it is literally the
# first frame a visitor's browser will decode.
ffmpeg -v error -y -i "$OUT/hero-1080.mp4" -frames:v 1 -q:v 2 "$OUT/hero-poster.jpg"

echo
echo "--- public/video ---"
ls -l "$OUT"
echo
"$HERE/verify-renditions.sh" "$OUT"
