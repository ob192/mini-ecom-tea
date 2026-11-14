# Hero motion and ad cuts

Everything that moves on this site, and everything the shop uploads to Meta, is
built from this folder and its sibling [`../hero-motion`](../hero-motion).

Two deliverables, two pipelines:

| | what | made with | lands in |
|---|---|---|---|
| **A. Hero loop** | the silent 10–12 s loop behind the home hero | Runware (Seedream 5.0 Pro → Seedance 2.5), then ffmpeg on the local GPU | `public/video/` |
| **B. Ad cuts** | the 9:16 / 4:5 / 1:1 Start-Set ad | HyperFrames, from the shop's own photographs | `assets/media/ads/` |

`assets/media/` is git-ignored. The ad cuts are creative to upload, not files the site
serves — nothing under `public/` should ever hold a master, because everything
under `public/` ships to every deploy and is fetchable by a visitor.

---

## Prerequisites

- Node 22+ (`node -v`), ffmpeg with NVENC, ImageMagick `convert`, Python 3 with
  `opencv-python` and `numpy` (the verifier compares frames).
- An NVIDIA GPU for `encode-renditions.sh`. Without one, drop `-hwaccel cuda`,
  swap `scale_cuda` for `scale` and `hevc_nvenc` for `libx265`; nothing else
  changes.
- `assets/telegram/` — the shop's untracked raw phone photos and the unboxing
  clip. Both pipelines read from it and neither commits anything out of it.
- A Runware API key in `../runware/.env` (git-ignored), only for deliverable A.
  **B costs nothing**: it is the shop's own photography and locally rendered
  type.

```bash
cd tools/hyperframes && npm install
```

---

## B. The ad cuts — re-render

```bash
cd tools/hyperframes
./prepare-assets.sh          # assets/telegram/*.HEIC -> assets/  (idempotent)
node render.mjs              # all three formats -> assets/media/ads/
node render.mjs 9x16         # or just one
node render.mjs --snapshot   # PNG stills instead of video, for a quick look
```

Output: `assets/media/ads/jintea-start-set-{9x16,4x5,1x1}.mp4`, 1080 wide, 30 fps,
~14.9 s, H.264, about 17 MB each. Deliberately large — Meta re-encodes on
upload, so the job is to hand it a clean master, not a small file.

### Where the numbers come from

`catalogue.mjs` reads them, on every render:

| on screen | source |
|---|---|
| `570 ₴`, `7 видів · 70 г · 570 ₴` | `public/products.json`, the `set/start-mini-7` entry |
| the seven tea names | the `• ` bullets under `Що всередині:` in that entry's `description` |
| `Безкоштовна доставка від 500 ₴` | `FREE_DELIVERY_THRESHOLD` in `lib/shipping.ts` |
| the `JINTEA` wordmark | `BRAND_NAME` in `lib/contacts.ts` |

None of it has a fallback. If the catalogue changes shape the render fails
loudly, because an ad that outlives the price it quotes is worse than an ad
that does not render. The reader also refuses to proceed if the set's copy
contradicts itself — if `по 10 г`, `разом 70 г` and the number of teas listed
stop agreeing, neither weight is advertised.

**Change the price and the ad is correct again on the next render.** Nothing
here needs editing.

### Editing the edit

- `composition.mjs` is the only place the creative lives: the timing table at
  the top (`OPEN_FOR`, `CARD_STEP`, `CARD_FOR`, `CLOSE_FOR`), the CSS, and the
  GSAP timeline. `FORMATS` holds the three frame sizes and a per-format type
  scale, plus `safeBottom` — how far the caption sits above the bottom edge, so
  the names clear the Reels and Stories interface.
- `render.mjs` writes one generated project per format into `build/` and
  renders it. **Do not edit `build/`** — it is overwritten on every run.
- Colours are the design tokens from `design/tokens/colors.ts`, copied into
  `composition.mjs`. The ad is standalone creative, so it does not import from
  the app; if the palette moves, move the five values at the top of that file.

Two things that will bite if they are changed carelessly:

- **The scrim must reach zero well before the top of the frame.** An earlier
  cut held green at `.35` alpha all the way up, which turned the chartreuse
  pouches olive — the one thing a viewer has to recognise. `Hero.tsx` records
  the same lesson about the same colour.
- **The film is as long as the GSAP timeline, not as long as the clips.** The
  `tl.set("#root", {}, TOTAL)` marker at the end of the timeline is what makes
  the close card play in full; without it the render stopped at the last real
  tween and cut the offer after 1.65 s.

### Which photo is which tea

The seven pouches are visually identical, so the only thing making the pairing
truthful is the text printed on the label. It was read at full resolution and
the mapping is written into `prepare-assets.sh`, with the Ukrainian line each
photo's label actually carries. **If the product is re-shot, re-read the labels
before re-pointing those lines** — a dish of green leaf captioned «Шу пуер» is
a false claim, not a typo.

---

## A. The hero loop — regenerate

Costs real money. Read [`../runware/COSTS.md`](../runware/COSTS.md) for what the
last run spent, and check the balance first:

```bash
printf '[{"taskType":"accountManagement","taskUUID":"'$(uuidgen)'","operation":"getDetails"}]' \
  | tools/runware/scripts/runware.sh | python3 -c 'import json,sys;print(json.load(sys.stdin)["data"][0]["balance"])'
```

### 1. The still — Seedream 5.0 Pro, about $0.05

```bash
cd tools/hero-motion
./prepare-references.sh                                  # HEIC -> assets/media/hero-motion/ref/
python3 build-request.py hero-still.json > /tmp/still.json
python3 ../runware/scripts/run-task.py /tmp/still.json \
  --out ../../assets/media/hero-motion/gen --name still
```

`build-request.py` inlines the local photographs as `data:` URIs, so the shop's
photography goes to the Runware endpoint and nowhere else — there is no public
URL for it and there does not need to be.

> **Leave `settings.thinking` off.** With it on (the model default) this exact
> request sat in `processing` for over 25 minutes and never returned, while
> still billing $0.0418. With it off the same prompt and references come back
> in about 20 seconds.

### 2. The loop — Seedance 2.5, $0.23/second at 720p

```bash
python3 build-request.py hero-loop.json > /tmp/loop.json
python3 ../runware/scripts/run-task.py /tmp/loop.json \
  --out ../../assets/media/hero-motion/gen --name hero-loop --timeout 1500
```

12 s at 720p is about **$2.76**, so budget per take, not per experiment.
1080p is $0.614/s — $7.37 for the same clip — which is why the loop is
generated at 720p and the 1080p rendition is upscaled locally on the GPU. The
hero sits behind two scrims at half opacity and is `object-cover` cropped;
paying 2.7× for native 1080 pixels there is not a good trade.

`hero-loop.json` pins **the same image as both the first and the last frame**.
That is what makes a generated clip loop at all: the model is being asked to
leave and come back, so the camera move is a drift out and back rather than a
pan that ends somewhere else.

Keep `settings.audio: false`. The hero is silent and `muted` in the component.

### 3. The renditions — local GPU

```bash
./encode-renditions.sh ../../assets/media/hero-motion/gen/hero-loop.mp4        # loop already closes
./encode-renditions.sh ../../assets/media/hero-motion/gen/hero-loop.mp4 12     # dissolve 12 frames into frame 0
```

Writes `public/video/hero-{720,1080}.{mp4,webm}` and `hero-poster.jpg`, then
runs the verifier. The master stays in `assets/media/`.

`verify-renditions.sh` checks the four things that fail silently:

- **the poster is the video's own frame 0** — compared as pixels, since a JPEG
  and a decoded H.264 frame can never be byte-identical;
- every file is inside the **0.9–2.5 MB** band;
- both MP4s have **`+faststart`**, or playback waits for the whole download;
- the **loop closes** — first frame against last frame.

Run it on its own any time:

```bash
./verify-renditions.sh
```

### Which encoder, and why it was measured

`encode-renditions.sh` decodes on NVDEC, upscales 720→1080 with `scale_cuda`
and writes both MP4s with `h264_nvenc`. The WebMs are `libvpx-vp9` on the CPU
because no NVENC VP9 encoder exists — that one is not a choice.

The rates are measured, not preferred. Frame-aligned luma PSNR against a
lossless copy of the source:

| | 720p | | 1080p | |
|---|---|---|---|---|
| | MB | PSNR | MB | PSNR |
| H.264 NVENC (cq 32 / 33) | 1.24 | 39.17 | 2.02 | 40.44 |
| VP9 crf 36 | 1.32 | 39.49 | 2.19 | 41.19 |
| **VP9 crf 38** (shipped) | **1.10** | 38.98 | **1.80** | 40.71 |
| VP9 crf 40 | 0.92 | 38.48 | 1.49 | 40.23 |

VP9 at crf 38 is ~11% smaller than its H.264 twin at both sizes for the same
picture. **That is the whole justification for listing WebM first** in
`HeroVideo.tsx`: at crf 36 the WebM was the *larger* file of the pair, and
preferring it would have cost every Chrome and Firefox visitor bytes instead of
saving them. Check this again if the footage ever changes character:

```bash
cd tools/hero-motion
python3 compare-encoders.py ../../assets/media/hero-motion/gen/hero-loop-v1.mp4 --width 1280 --height 720
```

Two traps that tool exists to avoid, both of which caught this work first:

- **Score against the source, not an encode of it.** An earlier version built
  an `x264 -crf 14` reference; every H.264 candidate then shared its artifacts
  and scored high, and the tool confidently reported that NVENC beat VP9. It
  does not.
- **Align frames before differencing them.** `ffmpeg -lavfi psnr` can pair
  frame *n* with frame *n+1* across a container change, which puts a floor
  under the error that no bitrate removes — H.264 appeared to cap at 37 dB at
  every rate. `compare-encoders.py` searches a ±2-frame window.

---

## The one file outside this folder

`components/HeroVideo.tsx` documents the ffmpeg commands that build the
renditions. It is the contract, and its comment block is the only thing in the
app these pipelines may touch. If the encode changes, update that block in the
same commit.

## What is git-ignored here

`assets/` (derived from untracked phone media), `build/` (generated on every
run), `node_modules/`, and `renders/`. Everything needed to rebuild all of it
is committed; none of the binaries are.
