#!/usr/bin/env bash
# Authenticated Runware API request (curl wrapper).
#
# Runware's REST API is one endpoint that takes a JSON ARRAY of task objects
# and returns {"data": [...]} (one entry per task) or {"errors": [...]}.
#
# Usage:
#   ./runware.sh <<'JSON'                 # request body (array) on stdin
#   [{ "taskType": "...", "taskUUID": "...", ... }]
#   JSON
#   ./runware.sh path/to/body.json        # or from a file
#
# Recipes: docs/RUNWARE-API-COOKBOOK.md
#
# ## Why the header goes through a config file
#
# `curl -H "Authorization: Bearer $KEY"` puts the key in argv, and argv is
# world-readable on Linux: any user on the box, and anything that shells out to
# `ps`, sees the whole key for as long as the request is in flight. A video
# generation holds that window open for minutes. So the header is written to a
# mode-600 temp file and passed with `-K`, which curl reads privately; the trap
# removes it on every exit path, interrupt included.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$HERE/config.sh"

BODY_SRC="${1:-/dev/stdin}"

# mktemp honours umask; 077 closes the window between create and chmod.
CURL_CONFIG="$(umask 077 && mktemp "${TMPDIR:-/tmp}/runware-auth.XXXXXXXX")"
trap 'rm -f "$CURL_CONFIG"' EXIT INT TERM
printf 'header = "Authorization: Bearer %s"\n' "$RUNWARE_API_KEY" > "$CURL_CONFIG"

curl -sS -X POST "$RUNWARE_API_URL" \
  -K "$CURL_CONFIG" \
  -H "Content-Type: application/json" \
  --data-binary "@$BODY_SRC"
