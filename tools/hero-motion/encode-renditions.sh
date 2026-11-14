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
# NVDEC decodes, scale_cuda does the 720->1080 resize, and h264_nvenc writes
# both MP4s. The grade and the loop dissolve run on the CPU because ffmpeg 4.4
# has no CUDA filter for either, and the WebMs run on the CPU because no NVENC
# VP9 encoder exists.
#
# Using NVENC for the MP4s is a measured choice, not an assumption: the
# received wisdom is that hardware encoders waste bitrate at the ~1 MB these
# files have to hit, and encode-compare.sh says otherwise for this footage —
# NVENC came back smaller AND higher PSNR at the small end. Re-run it if the
# footage ever changes character; the numbers are quoted at the encoder below.
set -euo pipefail

MASTER="${1:?usage: encode-renditions.sh <master.mp4> [seam-frames]}"
SEAM="${2:-0}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
OUT="$REPO/apps/web/public/video"
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
python3 -I "$HERE/close-loop.py" "$GRADED" --measure
if [ "$SEAM" -gt 0 ]; then
  SEAMED="$WORK/seamed.mkv"
  # close-loop.py and not an ffmpeg filter: this was a `blend` with an
  # `all_expr` keyed on the frame number, and on a synthetic ramp clip it left
  # frames before the seam altered and made the seam worse rather than closing
  # it. The replacement asserts, per frame, that frame 0 is untouched and that
  # the last frame is an exact copy of it. Lossless FFV1 out, so the dissolve
  # is not quantised before the real encoders see it.
  python3 -I "$HERE/close-loop.py" "$GRADED" "$SEAMED" --frames "$SEAM"
  SOURCE="$SEAMED"
fi

# --------------------------------------------------- 3. the two resolutions --
# Seedance returns 1280x720, which is already exactly the phone rendition, so
# only one resize happens in this pipeline: 720 -> 1080 for desktop. It is done
# once on the GPU into an intermediate, rather than inside each of the two 1080
# encodes, so the MP4 and the WebM are built from identical pixels and the
# resize is paid for once.
#
# 1080p was not generated natively because Seedance charges $0.614/s there
# against $0.23/s at 720p — $7.37 rather than $2.76 for this clip. The hero
# sits behind two scrims at half opacity and is object-cover cropped, so native
# 1080 pixels are not worth 2.7x there.
W="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$SOURCE")"
SRC720="$SOURCE"
SRC1080="$WORK/up1080.mkv"
if [ "$W" -eq 1920 ]; then
  SRC1080="$SOURCE"
elif [ "$W" -gt 1920 ]; then
  ffmpeg -v error -y -hwaccel cuda -hwaccel_output_format cuda -i "$SOURCE" -an \
    -vf "scale_cuda=1920:1080:interp_algo=lanczos,hwdownload,format=yuv420p" \
    -c:v ffv1 -level 3 "$SRC1080"
else
  ffmpeg -v error -y -init_hw_device cuda=cu:0 -filter_hw_device cu -i "$SOURCE" -an \
    -vf "format=yuv420p,hwupload,scale_cuda=1920:1080:interp_algo=lanczos,hwdownload,format=yuv420p" \
    -c:v ffv1 -level 3 "$SRC1080"
fi
if [ "$W" -ne 1280 ]; then
  SRC720="$WORK/down720.mkv"
  ffmpeg -v error -y -i "$SOURCE" -an -vf "scale=1280:720:flags=lanczos" \
    -c:v ffv1 -level 3 "$SRC720"
fi
echo "720 source: $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$SRC720")"
echo "1080 source: $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$SRC1080")"

# ------------------------------------------------------- 4. the renditions ---
# The settings below are measured, not preferred. compare-encoders.py on this
# footage, frame-aligned luma PSNR against a lossless copy of the source:
#
#   720p    nvenc cq 32   1.24 MB   39.17 dB     1080p  nvenc cq 33  2.02 MB  40.44 dB
#           vp9   crf 36  1.32 MB   39.49 dB            vp9   crf 36 2.19 MB  41.19 dB
#           vp9   crf 38  1.10 MB   38.98 dB            vp9   crf 38 1.80 MB  40.71 dB
#           vp9   crf 40  0.92 MB   38.48 dB            vp9   crf 40 1.49 MB  40.23 dB
#
# VP9 at crf 38 is ~11% smaller than its H.264 twin at both sizes, for the same
# picture (-0.19 dB at 720p, +0.27 dB at 1080p). That is what makes listing
# WebM first in HeroVideo.tsx correct: at crf 36 the WebM was actually the
# LARGER file of the pair, and serving it first would have cost every Chrome
# and Firefox visitor bytes rather than saving them.
#
# On this footage NVENC and x264 are within noise of each other per byte, so
# the MP4s go to the GPU, which is both much faster and what the hardware is
# here for. WebM stays on the CPU because no NVENC VP9 encoder exists — that
# one is not a choice. Re-run compare-encoders.py if the footage ever changes
# character; a busier shot may well reverse the NVENC result.
enc_mp4 () { # <src> <cq> <profile> <out>
  ffmpeg -v error -y -hwaccel cuda -i "$1" -an \
    -c:v h264_nvenc -preset p7 -tune hq -rc vbr -cq "$2" -b:v 0 \
    -profile:v "$3" -pix_fmt yuv420p -g 50 -movflags +faststart "$4"
}
enc_webm () { # <src> <crf> <out>
  ffmpeg -v error -y -i "$1" -an \
    -c:v libvpx-vp9 -crf "$2" -b:v 0 -cpu-used 2 -row-mt 1 -g 50 "$3"
}

echo "encoding renditions ..."
enc_mp4  "$SRC720"  32 main "$OUT/hero-720.mp4"
enc_mp4  "$SRC1080" 33 high "$OUT/hero-1080.mp4"
enc_webm "$SRC720"  38      "$OUT/hero-720.webm"
enc_webm "$SRC1080" 38      "$OUT/hero-1080.webm"

# ------------------------------------------------------------- 5. poster ----
# Taken from a rendition, not from the generated still, so it is literally the
# first frame a visitor's browser will decode.
ffmpeg -v error -y -i "$OUT/hero-1080.mp4" -frames:v 1 -q:v 2 "$OUT/hero-poster.jpg"

echo
echo "--- public/video ---"
ls -l "$OUT"
echo
"$HERE/verify-renditions.sh" "$OUT"
