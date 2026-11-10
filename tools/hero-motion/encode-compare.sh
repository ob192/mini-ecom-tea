#!/usr/bin/env bash
# Measure NVENC against x264 at the size the hero renditions have to hit.
#
#   ./encode-compare.sh <source.mp4>
#
# The instruction for this work was to do everything after generation on the
# local RTX 3090, and NVENC is the obvious reading of that. But the renditions
# are also held to a 0.9-2.5 MB band, and hardware encoders are known to spend
# bitrate less efficiently than a slow software encoder once the budget gets
# that tight. Rather than assume either way, this encodes 1280x720 both ways
# at matched file sizes and prints VMAF and SSIM against the source.
#
# Read it as: compare at the closest matching file sizes, not at matching
# quality settings. If NVENC is within ~0.3 dB PSNR of x264 at the same bytes,
# prefer the GPU; if it is a dB or more behind, the CPU keeps the last mile and
# the GPU keeps the decode, the upscale and the grade.
#
# VMAF would be the better metric and this ffmpeg (4.4.2, Ubuntu) has no
# libvmaf filter, so SSIM and PSNR stand in. Both agree with VMAF about which
# of two encoders is ahead at a fixed size, which is the only question here.
set -euo pipefail

SRC="${1:?usage: encode-compare.sh <source.mp4>}"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT

VF="scale=1280:720:flags=lanczos"
REF="$WORK/ref.mp4"
ffmpeg -v error -y -i "$SRC" -an -vf "$VF" -c:v libx264 -preset veryslow -crf 14 "$REF"

echo "target band: 0.9-2.5 MB at 1280x720"
printf '%-28s %10s %9s %8s\n' encoder bytes 'PSNR dB' SSIM

score () { # <candidate> <label>
  local psnr ssim
  psnr="$(ffmpeg -v error -i "$1" -i "$REF" -lavfi psnr -f null - 2>&1 \
          | grep -oP 'average:\K[0-9.]+' | tail -1 || true)"
  ssim="$(ffmpeg -v error -i "$1" -i "$REF" -lavfi ssim -f null - 2>&1 \
          | grep -oP 'All:\K[0-9.]+' | tail -1 || true)"
  printf '%-28s %10s %9s %8s\n' "$2" "$(stat -c%s "$1")" "${psnr:-n/a}" "${ssim:-n/a}"
}

for crf in 25 27 29; do
  out="$WORK/x264-$crf.mp4"
  ffmpeg -v error -y -i "$SRC" -an -vf "$VF" -c:v libx264 -preset slow -crf "$crf" \
    -profile:v main -pix_fmt yuv420p -g 50 -movflags +faststart "$out"
  score "$out" "libx264 slow crf $crf"
done

for cq in 28 31 34; do
  out="$WORK/nvenc-$cq.mp4"
  ffmpeg -v error -y -hwaccel cuda -i "$SRC" -an -vf "$VF" \
    -c:v h264_nvenc -preset p7 -tune hq -rc vbr -cq "$cq" -b:v 0 \
    -profile:v main -pix_fmt yuv420p -g 50 -movflags +faststart "$out"
  score "$out" "h264_nvenc p7 cq $cq"
done
