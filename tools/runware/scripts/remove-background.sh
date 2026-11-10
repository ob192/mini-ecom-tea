#!/usr/bin/env bash
# Remove the background of a local product photo via Runware and save a
# transparent PNG. The source file never leaves this machine except as a
# base64 data URI inside the POST body (no third-party upload step needed).
#
# Usage:
#   ./remove-background.sh <input-image> <output-image> [model]
#
# Examples:
#   ./remove-background.sh product.jpg product_cutout.png
#   ./remove-background.sh in.png out.png runware:112@5   # BiRefNet General instead of Bria
#
# Models: see docs/RUNWARE-API-COOKBOOK.md or `../scripts/runware.sh` + list_models.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$HERE/config.sh"

IN="${1:?usage: remove-background.sh <input-image> <output-image> [model]}"
OUT="${2:?missing <output-image>}"
MODEL="${3:-$MODEL_BG_BRIA}"

[ -f "$IN" ] || { echo "input not found: $IN" >&2; exit 1; }

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
REQ="$TMP/req.json"; RESP="$TMP/resp.json"

# 1) build request body (data URI + model) — no network here
IN="$IN" MODEL="$MODEL" REQ="$REQ" python3 <<'PY'
import base64, json, mimetypes, os, uuid

infile, model, req = os.environ["IN"], os.environ["MODEL"], os.environ["REQ"]
mime = mimetypes.guess_type(infile)[0] or "image/jpeg"
b64 = base64.b64encode(open(infile, "rb").read()).decode()
task = {
    "taskType": "removeBackground",
    "taskUUID": str(uuid.uuid4()),
    "model": model,
    "outputFormat": "PNG",
    "outputType": "URL",
    "includeCost": True,
    "inputs": {"image": f"data:{mime};base64,{b64}"},
}
if model.startswith("bria:"):
    task["providerSettings"] = {"bria": {"preserveAlpha": False}}
open(req, "w").write(json.dumps([task]))
PY

# 2) POST via curl (system certs)
HTTP="$(curl -sS -o "$RESP" -w "%{http_code}" -X POST "$RUNWARE_API_URL" \
  -H "Authorization: Bearer $RUNWARE_API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary "@$REQ")"

if [ "$HTTP" != "200" ]; then
  echo "HTTP $HTTP" >&2; head -c 2000 "$RESP" >&2; echo >&2; exit 1
fi

# 3) pull imageURL + cost out of the response — no network here
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

# 4) download the transparent PNG
curl -sS -o "$OUT" "$URL"
echo "✓ saved -> $OUT"
