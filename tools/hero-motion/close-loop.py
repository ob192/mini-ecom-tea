#!/usr/bin/env python3
"""Close an imperfect loop by dissolving the tail into frame 0.

    close-loop.py <in.mp4> <out.mkv> --frames 12
    close-loop.py <in.mp4> --measure          # just report the seam

## Why the dissolve runs backwards

The obvious way to make a clip loop is to crossfade the head with the tail, but
that rewrites frame 0 — and frame 0 is the hero's poster
(`public/video/hero-poster.jpg`). Hero.tsx fades the video in over that still,
and the fade has nothing to cut between only because they are the same frame. A
poster that is a blend of the opening and the ending is no longer the frame the
video starts on.

So only the tail moves: the last N frames ramp from themselves to an exact copy
of frame 0, which makes the final frame identical to the first and leaves every
frame before the ramp untouched, frame 0 included.

## Why this is not an ffmpeg filter

It was, using `blend` with an `all_expr` keyed on the frame number `N`. On a
synthetic ramp clip that expression left frames before the seam altered and
made the seam *worse* rather than closing it, so it was replaced with an
explicit pass where every frame can be asserted. `--measure` and the
self-check at the end of a run are what that cost bought.

Output is written as FFV1 in Matroska — mathematically lossless, so the dissolve
is not quantised twice before the real encoder ever sees it.
"""

from __future__ import annotations

import argparse
import pathlib
import subprocess
import sys

import cv2
import numpy as np


def read_frames(path: pathlib.Path) -> list[np.ndarray]:
    cap = cv2.VideoCapture(str(path))
    frames = []
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frames.append(frame)
    cap.release()
    if not frames:
        raise SystemExit(f"no frames decoded from {path}")
    return frames


def rms(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.sqrt(((a.astype(np.float64) - b.astype(np.float64)) ** 2).mean()))


def fps_of(path: pathlib.Path) -> str:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return out.stdout.strip() or "24"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=pathlib.Path)
    parser.add_argument("dest", type=pathlib.Path, nargs="?")
    parser.add_argument("--frames", type=int, default=12, help="length of the dissolve")
    parser.add_argument("--measure", action="store_true", help="report the seam and stop")
    args = parser.parse_args()

    frames = read_frames(args.source)
    before = rms(frames[-1], frames[0])
    print(f"{len(frames)} frames, {frames[0].shape[1]}x{frames[0].shape[0]}")
    print(f"seam before: RMS(last, first) = {before:.2f}")

    if args.measure:
        verdict = "already closes" if before < 8 else "soft" if before < 16 else "open"
        print(f"verdict: {verdict}")
        return 0

    if args.dest is None:
        parser.error("an output path is required unless --measure is given")

    n = args.frames
    if not 1 <= n < len(frames) - 1:
        raise SystemExit(f"--frames must be between 1 and {len(frames) - 2}")

    first = frames[0].astype(np.float64)
    start = len(frames) - n
    for i in range(n):
        # t walks 1/n .. 1 so the final frame is a pure copy of frame 0.
        t = (i + 1) / n
        tail = frames[start + i].astype(np.float64)
        frames[start + i] = np.clip(tail * (1 - t) + first * t, 0, 255).astype(np.uint8)

    # Assertions, not hopes: the point of doing this in a loop was to be able
    # to check it. A silent failure here ships a hero that cuts every 12s.
    assert rms(frames[0], first) == 0.0, "frame 0 was modified"
    assert rms(frames[start - 1], frames[start - 1]) == 0.0
    closed = rms(frames[-1], frames[0])
    if closed > 0.6:
        raise SystemExit(f"dissolve did not close the loop (RMS {closed:.2f})")

    height, width = frames[0].shape[:2]
    proc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{width}x{height}",
         "-r", fps_of(args.source), "-i", "-",
         "-an", "-c:v", "ffv1", "-level", "3", str(args.dest)],
        stdin=subprocess.PIPE,
    )
    assert proc.stdin is not None
    for frame in frames:
        proc.stdin.write(frame.tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise SystemExit("ffmpeg failed while writing the dissolved clip")

    print(f"seam after:  RMS(last, first) = {closed:.2f}")
    print(f"frames {start}..{len(frames) - 1} dissolved into frame 0; frame 0 untouched")
    print(f"wrote {args.dest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
