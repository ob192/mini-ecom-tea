# runware/scripts/config.sh
# Shared config for the Runware API helper scripts. Sourced by the others — not run directly.

# Absolute path to runware/, resolved relative to this file so the scripts work
# from any current working directory.
RUNWARE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# --- Load secrets from runware/.env (git-ignored) ---
ENV_FILE="$RUNWARE_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "runware: missing $ENV_FILE — copy .env.example to .env and fill it in." >&2
  return 1 2>/dev/null || exit 1
fi
# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

: "${RUNWARE_API_KEY:?runware: RUNWARE_API_KEY not set in .env}"

RUNWARE_API_URL="https://api.runware.ai/v1"

# --- Known model AIR IDs (op:remove-background) ---
MODEL_BG_BRIA="bria:2@1"          # Bria RMBG v2.0 — high-precision, good default
MODEL_BG_BIREFNET="runware:112@5" # BiRefNet General — alternative general-purpose

# --- Known model AIR IDs (op:upscale) ---
MODEL_UPSCALE_BRIA="bria:52@1"        # Bria Increase Resolution — 2x/4x, ~$0.018/image
MODEL_UPSCALE_CLARITY="runware:500@1" # Clarity — creative 4x, invents more detail
