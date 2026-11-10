#!/usr/bin/env bash
# Upscale a local image via Runware and save the result.
#
# Supplier frames are often 600x600 and pack several views into one shot, so a single
# cropped view can land near 250px — too soft for a hero slot that renders ~320 CSS px
# on a 2x display. Upscaling the crop before background removal also gives the matting
# model more edge to work with.
#
# Usage:
#   ./upscale.sh <input-image> <output-image> [factor] [model]
#
# factor: 2 or 4 (default 4).  model: default Bria Increase Resolution (~$0.018/image).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$HERE/config.sh"

IN="${1:?usage: upscale.sh <input-image> <output-image> [factor] [model]}"
OUT="${2:?missing <output-image>}"
FACTOR="${3:-4}"
MODEL="${4:-$MODEL_UPSCALE_BRIA}"

[ -f "$IN" ] || { echo "input not found: $IN" >&2; exit 1; }

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
REQ="$TMP/req.json"; RESP="$TMP/resp.json"

IN="$IN" MODEL="$MODEL" FACTOR="$FACTOR" REQ="$REQ" python3 <<'PY'
import base64, json, mimetypes, os, uuid

infile, model, factor, req = (os.environ[k] for k in ("IN", "MODEL", "FACTOR", "REQ"))
mime = mimetypes.guess_type(infile)[0] or "image/jpeg"
b64 = base64.b64encode(open(infile, "rb").read()).decode()
body = [{
    "taskType": "imageUpscale",
    "taskUUID": str(uuid.uuid4()),
    "model": model,
    "upscaleFactor": int(factor),
    "outputFormat": "PNG",
    "outputType": "URL",
    "includeCost": True,
    "inputs": {"image": f"data:{mime};base64,{b64}"},
}]
open(req, "w").write(json.dumps(body))
PY

HTTP="$(curl -sS -o "$RESP" -w "%{http_code}" -X POST "$RUNWARE_API_URL" \
  -H "Authorization: Bearer $RUNWARE_API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary "@$REQ")"

if [ "$HTTP" != "200" ]; then
  echo "HTTP $HTTP" >&2; head -c 2000 "$RESP" >&2; echo >&2; exit 1
fi

URL="$(RESP="$RESP" python3 <<'PY'
import json, os, sys
d = json.load(open(os.environ["RESP"]))
if d.get("errors"):
    print(json.dumps(d["errors"]), file=sys.stderr); sys.exit(1)
item = d["data"][0]
print(f"cost ${item.get('cost', 0)}", file=sys.stderr)
print(item["imageURL"])
PY
)"

curl -sS -o "$OUT" "$URL"
echo "✓ saved -> $OUT"
