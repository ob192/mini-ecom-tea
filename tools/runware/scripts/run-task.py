#!/usr/bin/env python3
"""Submit one Runware task, wait for it, download the result, log what it cost.

`runware.sh` is a thin curl wrapper: it posts a task array and prints whatever
comes back. That is enough for an image, which returns synchronously, and not
enough for a video, which does not — `videoInference` defaults to
`deliveryMethod: "async"` and answers with nothing but the taskUUID you sent.
The finished URL only ever arrives from a `getResponse` poll on that UUID.

So this script owns the three things the shell wrapper cannot do:

  1. Poll `getResponse` until the task reports done (or the deadline passes).
  2. Download the output next to the request, so an `im.runware.ai` URL that
     expires cannot take the only copy of a paid generation with it.
  3. Append cost to a ledger. Every call spends real balance, and the account
     this runs against holds single-digit dollars — a run nobody wrote down is
     a run nobody can learn from.

Usage:
    run-task.py request.json --out some/dir [--name hero-still] [--timeout 900]

`request.json` holds ONE task object (not the array the API wants; this wraps
it) and may omit `taskUUID` — one is generated and written back into the saved
copy, which is what makes a run reproducible after the fact.

The API key is read by config.sh from tools/runware/.env and is never printed,
logged, or written to any of the files this script creates.
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import subprocess
import sys
import time
import urllib.request
import uuid

HERE = pathlib.Path(__file__).resolve().parent
RUNWARE_SH = HERE / "runware.sh"
LEDGER = HERE.parent / "COSTS.md"

# getResponse is cheap but not free of latency; 10s keeps a 12-second video's
# poll count in the dozens rather than the hundreds.
POLL_SECONDS = 10


def post(body: list[dict]) -> dict:
    """POST a task array through runware.sh, which holds the credentials."""
    proc = subprocess.run(
        [str(RUNWARE_SH)],
        input=json.dumps(body).encode(),
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        # stderr can carry curl diagnostics, never the Authorization header.
        raise SystemExit(f"runware.sh failed ({proc.returncode}): {proc.stderr.decode()[:500]}")
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError:
        raise SystemExit(f"runware.sh returned non-JSON: {proc.stdout[:500]!r}")


def fatal_errors(response: dict) -> list[dict]:
    """Errors that mean the task will never finish.

    A `getResponse` poll for a task that is merely still running also comes
    back under "errors" — that one is not fatal and must not abort the wait.
    """
    out = []
    for err in response.get("errors", []):
        code = str(err.get("code", ""))
        if code in {"noResultsYet", "taskNotFound", "resultsNotReady"}:
            continue
        out.append(err)
    return out


def first_media(entry: dict) -> tuple[str | None, str | None]:
    """(url, kind) for whichever media an image or video task returned.

    A `getResponse` poll for work still in flight answers with the same
    taskUUID and `status: "processing"` and no URL at all, so the presence of
    the URL — not of the entry — is what says the task is done.
    """
    for key, kind in (("videoURL", "video"), ("imageURL", "image")):
        if entry.get(key):
            return entry[key], kind
    return None, None


def download(url: str, dest: pathlib.Path) -> int:
    with urllib.request.urlopen(url, timeout=300) as response, dest.open("wb") as handle:
        size = 0
        while chunk := response.read(1 << 20):
            handle.write(chunk)
            size += len(chunk)
    return size


def log_cost(name: str, model: str, cost: float | None, detail: str, output: pathlib.Path) -> None:
    if not LEDGER.exists():
        LEDGER.write_text(
            "# Runware spend\n\n"
            "Appended by `scripts/run-task.py`. Every row is one paid API call.\n\n"
            "| when (UTC) | name | model | detail | cost USD | output |\n"
            "|---|---|---|---|---|---|\n",
            encoding="utf-8",
        )
    stamp = time.strftime("%Y-%m-%d %H:%M", time.gmtime())
    shown = f"{cost:.4f}" if isinstance(cost, (int, float)) else "n/a"
    with LEDGER.open("a", encoding="utf-8") as handle:
        handle.write(f"| {stamp} | {name} | {model} | {detail} | {shown} | `{output.name}` |\n")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("request", type=pathlib.Path, help="JSON file holding one task object")
    parser.add_argument("--out", type=pathlib.Path, required=True, help="directory for the result")
    parser.add_argument("--name", default=None, help="basename for the saved files")
    parser.add_argument("--timeout", type=int, default=900, help="seconds to wait (default 900)")
    parser.add_argument(
        "--attach",
        metavar="UUID",
        help="skip submission and poll an already-running task (it is already paid for)",
    )
    args = parser.parse_args()

    task = json.loads(args.request.read_text(encoding="utf-8"))
    task.setdefault("taskUUID", args.attach or str(uuid.uuid4()))
    task.setdefault("includeCost", True)
    task_uuid = args.attach or task["taskUUID"]
    name = args.name or args.request.stem

    args.out.mkdir(parents=True, exist_ok=True)

    entry: dict | None = None
    if args.attach:
        print(f"[{name}] attaching to in-flight task {task_uuid} (no new charge)", flush=True)
        url = kind = None
    else:
        # Save the exact body that was sent, UUID included, so the run can be
        # reconstructed later without guessing which edit was the one that ran.
        (args.out / f"{name}.request.json").write_text(
            json.dumps(task, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"[{name}] submitting {task.get('taskType')} / {task.get('model')} ...", flush=True)
        response = post([task])
        if errs := fatal_errors(response):
            print(json.dumps(errs, ensure_ascii=False, indent=2))
            return 1

        entry = next((d for d in response.get("data", []) if d.get("taskUUID") == task_uuid), None)
        url, kind = first_media(entry or {})

    deadline = time.time() + args.timeout
    while url is None and time.time() < deadline:
        time.sleep(POLL_SECONDS)
        poll = post([{"taskType": "getResponse", "taskUUID": task_uuid}])
        if errs := fatal_errors(poll):
            print(json.dumps(errs, ensure_ascii=False, indent=2))
            return 1
        for candidate in poll.get("data", []):
            url, kind = first_media(candidate)
            if url:
                entry = candidate
                break
        status = next(
            (d.get("status") for d in poll.get("data", []) if d.get("taskUUID") == task_uuid),
            "queued",
        )
        print(f"[{name}] {status} ... {int(deadline - time.time())}s left", flush=True)

    if not url:
        print(f"[{name}] TIMEOUT after {args.timeout}s. taskUUID={task_uuid}")
        print(f"[{name}] poll later: getResponse on that UUID; the result is not lost.")
        return 2

    suffix = {"video": task.get("outputFormat", "MP4"), "image": task.get("outputFormat", "JPG")}
    extension = str(suffix[kind]).lower()
    dest = args.out / f"{name}.{extension}"
    size = download(url, dest)

    cost = entry.get("cost")
    if kind == "video":
        detail = f"{task.get('resolution', '?')} {task.get('duration', '?')}s"
    else:
        detail = f"{task.get('width', '?')}x{task.get('height', '?')}"

    (args.out / f"{name}.response.json").write_text(
        json.dumps(entry, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    log_cost(name, str(task.get("model")), cost, detail, dest)

    shown = f"${cost:.4f}" if isinstance(cost, (int, float)) else "cost not reported"
    print(f"[{name}] saved {dest} ({size / 1_000_000:.2f} MB), {shown}")
    print(f"[{name}] remote URL expires; local copy is authoritative.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
