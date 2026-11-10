# Runware API cookbook

Concrete recipes for `runware/scripts/`. See [../README.md](../README.md) for setup.

## Background removal (product cutouts)

```bash
cd api-toolkits/runware/scripts
./remove-background.sh ../../product-images/09-live/8240.png /tmp/8240_cutout.png
../../runware/pipeline/trim_alpha.py /tmp/8240_cutout.png /tmp/8240_tight.png
```

`remove-background.sh` base64-encodes the input locally and sends it as a data URI —
the source file is never uploaded anywhere else first. Default model is
`bria:2@1` (Bria RMBG v2.0, ~$0.018/image, high precision on product photos).
Pass a third argument to use a different model, e.g. `runware:112@5` (BiRefNet
General).

Feed it the **already-isolated** product photo (e.g. the output of
`google-vertex`'s Mode A "isolate & center" pass in `product-images/09-live/`), not the
raw cluttered supplier original — background removal only separates
foreground-from-backdrop, it won't strip props, packaging, or overlays baked into the
scene. Let Gemini clean the scene first, then Runware cut the alpha.

## Discovering models

The background-removal models available at time of writing (`op:remove-background`):

| Model | AIR ID | Notes |
|---|---|---|
| Bria RMBG v2.0 | `bria:2@1` | Default. High precision, handles tricky edges (fur, glass, fine detail) well. |
| BiRefNet General | `runware:112@5` | Alternative general-purpose segmenter. |
| BiRefNet Portrait | `runware:112@10` | Tuned for people/portraits. |
| BiRefNet Matting | `runware:112@9` | Soft-edge alpha matting. |
| RemBG v1.4 | `runware:109@1` | Older/cheaper baseline. |

Full current list: use the Runware MCP connector's `list_models` /
`model_details` tools (read-only introspection works fine — see the note in
../README.md about `run` being broken), or the web dashboard.

## Raw task call (any capability)

```bash
UUID="$(uuidgen | tr 'A-Z' 'a-z')"
cat <<JSON | ./runware.sh
[{
  "taskType": "removeBackground",
  "taskUUID": "$UUID",
  "model": "bria:2@1",
  "providerSettings": {"bria": {"preserveAlpha": false}},
  "outputFormat": "PNG",
  "outputType": "URL",
  "includeCost": true,
  "inputs": {"image": "https://example.com/photo.jpg"}
}]
JSON
```

`inputs.image` accepts a URL, a `data:image/...;base64,...` data URI, a raw base64
string, or a Runware media UUID (from a prior upload/generation).

## Response shape

```json
{
  "data": [{
    "taskType": "imageBackgroundRemoval",
    "taskUUID": "...",
    "imageUUID": "...",
    "imageURL": "https://im.runware.ai/image/...png",
    "cost": 0.018
  }]
}
```

On failure: `{"errors": [{"code": "...", "message": "...", "parameter": "..."}]}`.

## Known gotcha: the MCP `run` tool

If driving Runware through the `mcp.runware.ai` MCP connector (e.g. from a Claude
Code / Cowork session), the read-only tools (`account`, `list_models`,
`model_schema`, `model_examples`, `media_storage`) work normally, but `run` only
forwards the `model` parameter — every other field (image, dimensions, prompt, …)
gets silently dropped, so any task requiring more than a bare model ID fails
validation server-side (usually reported as a missing/invalid required field, which
is misleading — the real cause is the parameter never arriving). Confirmed by
testing with and without extra parameters and getting the identical error either way.
Use these scripts instead until that's fixed.
