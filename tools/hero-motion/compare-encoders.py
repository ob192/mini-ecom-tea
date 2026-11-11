#!/usr/bin/env python3
"""Encode one source several ways and score each honestly.

    compare-encoders.py <source> [--width 1280 --height 720]

Prints file size and luma PSNR for an NVENC, an x264 and a VP9 ladder, so the
settings in encode-renditions.sh are a measurement rather than a preference.

## Two mistakes this exists to avoid, both of which were made here first

**Score against the source, not against an encode of it.** The first version of
this tool built an `x264 -crf 14` reference and compared candidates to that.
Every H.264 candidate then shared the reference's own artifacts and scored
high, and the tool reported that NVENC beat VP9. It does not. The reference
here is lossless FFV1 decoded from the source, so nothing is being graded
against its own family.

**Align the frames before differencing them.** `ffmpeg -lavfi psnr` pairs
frames by its own framesync rules, and across a container and frame-rate change
it can pair frame n with frame n+1. A constant one-frame offset puts a floor
under the error that no amount of bitrate removes, which shows up as every
encoder plateauing at the same number — H.264 appeared to cap at 37 dB whatever
the bitrate. This decodes both to raw luma and searches a small offset window,
so misalignment cannot be mistaken for codec loss.

Luma only: chroma at 4:2:0 contributes little to the perceived result and
including it mostly dilutes the number being compared.
"""

from __future__ import annotations

import argparse
import pathlib
import subprocess
import tempfile

import numpy as np

NVENC = [(29, "p7"), (32, "p7"), (35, "p7")]
X264 = [24, 27, 30]
VP9 = [34, 38, 42]


def run(args: list[str]) -> None:
    subprocess.run(args, check=True, capture_output=True)


def luma(path: pathlib.Path, width: int, height: int) -> np.ndarray:
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"scale={width}:{height}",
         "-pix_fmt", "gray", "-f", "rawvideo", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(out, dtype=np.uint8).reshape(-1, height, width).astype(np.float64)


def psnr(candidate: np.ndarray, reference: np.ndarray) -> tuple[float, int]:
    """Best luma PSNR over a +/-2 frame alignment window."""
    best = (-1.0, 0)
    limit = min(len(candidate), len(reference))
    for offset in (-2, -1, 0, 1, 2):
        a = candidate[max(0, offset): limit + min(0, offset)]
        b = reference[max(0, -offset): limit + min(0, -offset)]
        n = min(len(a), len(b))
        if n == 0:
            continue
        mse = ((a[:n] - b[:n]) ** 2).mean()
        score = 99.0 if mse == 0 else 10 * np.log10(255.0**2 / mse)
        if score > best[0]:
            best = (float(score), offset)
    return best


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=pathlib.Path)
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    args = parser.parse_args()

    scale = f"scale={args.width}:{args.height}:flags=lanczos,format=yuv420p"

    with tempfile.TemporaryDirectory() as tmp:
        work = pathlib.Path(tmp)
        reference_file = work / "reference.mkv"
        run(["ffmpeg", "-v", "error", "-y", "-i", str(args.source), "-an",
             "-vf", scale, "-c:v", "ffv1", "-level", "3", str(reference_file)])
        reference = luma(reference_file, args.width, args.height)

        print(f"{args.width}x{args.height}, {len(reference)} frames, "
              f"scored against lossless FFV1 of the source")
        print(f"{'encoder':30s} {'MB':>6s} {'PSNR dB':>9s} {'align':>6s}")

        candidates: list[tuple[str, pathlib.Path]] = []
        for cq, preset in NVENC:
            out = work / f"nvenc-{cq}.mp4"
            run(["ffmpeg", "-v", "error", "-y", "-hwaccel", "cuda", "-i", str(reference_file),
                 "-an", "-c:v", "h264_nvenc", "-preset", preset, "-tune", "hq",
                 "-rc", "vbr", "-cq", str(cq), "-b:v", "0", "-pix_fmt", "yuv420p",
                 "-g", "50", "-movflags", "+faststart", str(out)])
            candidates.append((f"h264_nvenc {preset} cq {cq}", out))
        for crf in X264:
            out = work / f"x264-{crf}.mp4"
            run(["ffmpeg", "-v", "error", "-y", "-i", str(reference_file), "-an",
                 "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
                 "-pix_fmt", "yuv420p", "-g", "50", "-movflags", "+faststart", str(out)])
            candidates.append((f"libx264 slow crf {crf}", out))
        for crf in VP9:
            out = work / f"vp9-{crf}.webm"
            run(["ffmpeg", "-v", "error", "-y", "-i", str(reference_file), "-an",
                 "-c:v", "libvpx-vp9", "-crf", str(crf), "-b:v", "0",
                 "-cpu-used", "2", "-row-mt", "1", "-g", "50", str(out)])
            candidates.append((f"libvpx-vp9 crf {crf}", out))

        for label, path in candidates:
            score, offset = psnr(luma(path, args.width, args.height), reference)
            print(f"{label:30s} {path.stat().st_size / 1e6:6.2f} {score:9.2f} {offset:+6d}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
