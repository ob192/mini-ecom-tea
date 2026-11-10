# Visual rules

What a designer checks on the rendered page. Each rule has an ID and a default severity; numbers are starting points that DESIGN.md may override.

## Read and focus

**V1 · P1 — One clear first read.** The eye lands on the headline, then the main visual, then the primary action — in that order — and nothing competes (badges, glows, decorative shapes, a second loud button). Name what actually wins and whether it should.

**V2 · P1 — The main visual is the subject.** In a hero, the image or video reads as the subject, not a thumbnail floating in empty space. Side by side, it is at least as tall as the text block beside it (`composition.textBox.h`). Stacked, its visible part spans about two thirds of the content width or more on a tablet (`composition.mediaShare` ≥ 0.6 at 768 and 1023); a phone-sized picture kept at a tablet width is the failure. A product or vehicle may run past the screen edge for energy; a bleed is deliberate (about 5–15% of the object cut), never a few pixels — and never through its middle (half a car reads as a crop error). Measure the bleed on the object in the screenshot, not on the image box: cut-outs carry transparent margins, so the box's percentage understates the cut.

**V3 · P1 — Balance.** Two columns carry comparable visual weight; a text column is roughly 40–55% of the content width. Stacked, the text and the media between them use the width: no empty half beside a narrow text column or a capped image. At every width, no dead zone holds nothing: `composition.largestEmpty` over 15% of the content box (or wider than half of it and taller than a quarter) is a finding — name where it is.

## Proportion and rhythm

**V4 · P1 — The band fits its content.** A band's height is its content plus padding from the scale — the same at 1440 and 1920, never derived from the viewport (no `vh`, no `vw`-scaled media). Content is optically centred under the header; bottom padding equals or slightly exceeds top padding (`composition.padding`). On desktop the next section's top edge may show below the hero: a cue to scroll.

**V5 · P1 — Rhythm follows grouping.** Gaps between title → lead → list → actions step along the project's scale and follow meaning: the lead sits closer to the title than the actions sit to the list. Equal gaps everywhere read as a list of unrelated things.

**V6 · P1 — Gutters and edges are consistent.** Side gutters match DESIGN.md at every width (measure the first text's left edge); header and section content share one left edge; nothing misses an alignment by 1–4px. Media and cards either stay inside the container or run to the screen edge as a bleed; one that overhangs the container by a few dozen pixels and stops short of the screen edge (`composition.pastContainer` with `reachesEdge: false`) misses both edges.

**V7 · P1 — Type proportion.** The headline is 2–3× the lead's size; 2–3 lines on tablets and desktop, at most 4 on phones; no short word left alone on a line; the lead runs 45–75 characters per line on tablets and desktop — on a phone the column sets it, and 35–45 is normal.

**V8 · P1 — Controls in proportion.** Buttons match the text around them — `default` size in a hero unless the headline is very large; buttons in a row share a height; the primary dominates and the secondary reads as secondary on its surface.

## Colour and image

**V9 · P0 — Contrast where it is drawn.** Text over gradients, glows and images is measured on the pixels behind it at its worst point — not the token pair. 4.5:1 for body text, 3:1 for large text.

**V10 · P1 — Imagery holds up.** The source is at least 2× its displayed width (blurred backgrounds are exempt); cut-outs have no halo; shadows match the light and the surface (an object on a dark band needs a soft ground shadow, not a floating drop shadow); no compression artefacts; the perspective suits the layout.

**V11 · P1 — Background serves content.** Glows and gradients sit behind the subject, not behind text; no hard edges, banding or clipping; grain stays subtle.

## Screens and consistency

**V12 · P1 — The first screen sells on phones and tablets.** At 375×812 the first screen shows the headline, the value and the primary action, and the main visual appears no later than the second screen. At 768×1024 and 1023×768 the main visual is on the first screen with the headline, at a size that reads as the subject (V2). Nothing important is hidden behind fixed bars.

**V13 · P2 — Same product everywhere.** The block matches its neighbours and the `/playground` reference: radii, button styles, icon sizes, type, gutters. With no neighbours built yet, compare with the reference alone.

**V14 · P2 — Polish.** Icons optically aligned with text; equal spacing between repeated items; no widows inside buttons; hairlines crisp; nothing jumps after load.

**V15 · P1 — Straddles are deliberate.** A card or image laid over a band's edge crosses it near its middle (`composition.straddle[].abovePct` 35–65%), at every width where it straddles; a sliver over the edge reads as a misplacement. What it covers (a car's wheels, a face) is chosen, not left to the width.

**V16 · P1 — Overlays keep clear of text.** A card or label laid over the media sits at least a gutter (24px) from any heading or paragraph (`composition.overlays[].clearance`) and covers a part of the media chosen on purpose — not the subject's face or the car's body by accident (`coversPct`, read with the screenshot).
