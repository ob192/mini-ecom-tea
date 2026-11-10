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
# Example (account-agnostic ping — cheapest possible call is a real task;
# Runware has no free ping endpoint, so use model_search-style docs instead):
#   see docs/RUNWARE-API-COOKBOOK.md
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$HERE/config.sh"

BODY_SRC="${1:-/dev/stdin}"

curl -sS -X POST "$RUNWARE_API_URL" \
  -H "Authorization: Bearer $RUNWARE_API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary "@$BODY_SRC"
