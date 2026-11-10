# runware — local Runware API toolkit

Local-only working directory for driving the **Runware** inference API from the CLI
quickly and repeatably. Mirrors [`google-vertex/`](../google-vertex/README.md) (Vertex/Nano
Banana) and [`medusa/`](../medusa/README.md) — same shape, different provider.

**The whole folder is git-ignored** (see root `.gitignore`) because it holds the API
key. Never commit anything here; never paste the key contents anywhere.

> A Runware MCP connector also exists (added in Claude Desktop, `mcp.runware.ai`).
> It authenticates fine and its read-only tools (`account`, `list_models`,
> `model_schema`, `media_storage`, …) work, but the `run` execution tool has a bug in
> this environment: it only transmits the `model` field and silently drops every other
> parameter, so it can't actually execute a task. This folder's curl-based scripts are
> the reliable way to run anything until that's fixed upstream.

## Contents

```
runware/
├── README.md                     ← you are here
├── .env                          ← API key (secret; you create it)
├── .env.example                  ← template, safe to commit
├── scripts/
│   ├── config.sh                 ← loads .env, endpoint, known model IDs (sourced)
│   ├── runware.sh                ← raw authenticated POST (curl wrapper, task array in/out)
│   └── remove-background.sh      ← local image in -> transparent PNG out
├── pipeline/
│   └── trim_alpha.py             ← crop a transparent PNG to its content bbox
└── docs/
    └── RUNWARE-API-COOKBOOK.md   ← concrete recipes
```

## Setup

```bash
cp api-toolkits/runware/.env.example api-toolkits/runware/.env
# edit runware/.env and fill in RUNWARE_API_KEY (from https://my.runware.ai)
chmod 600 api-toolkits/runware/.env
chmod +x api-toolkits/runware/scripts/*.sh
```

Prerequisites: `curl`, `python3` (stdlib only for the API calls; `Pillow` for
`trim_alpha.py` — already a dependency of `google-vertex/pipeline`).

## Quick start

```bash
cd api-toolkits/runware/scripts

# Remove the background of a local photo (Bria RMBG v2.0 by default)
./remove-background.sh product.jpg product_cutout.png

# Crop the transparent result to its content, for a hero/product-card image
../pipeline/trim_alpha.py product_cutout.png product_cutout_tight.png

# Raw API access for anything else (image gen, upscale, models, ...)
echo '[{"taskType":"imageInference","taskUUID":"<uuid4>","model":"runware:100@1",
       "positivePrompt":"a red apple on white background","width":512,"height":512}]' \
  | ./runware.sh
```

Concrete recipes: [docs/RUNWARE-API-COOKBOOK.md](docs/RUNWARE-API-COOKBOOK.md).

## Auth in one line

Every call is `Authorization: Bearer $RUNWARE_API_KEY` against the single endpoint
`https://api.runware.ai/v1`, POSTing a JSON **array** of task objects and getting back
`{"data": [...]}` (or `{"errors": [...]}`).

## Security notes

- `.env` perms should be `600`. If the key is ever exposed, rotate it at
  [my.runware.ai](https://my.runware.ai) → API Keys.
- Prefer small test calls before batching — every task costs real credits
  (background removal ≈ $0.018/image with Bria RMBG v2.0).
