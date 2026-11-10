/*
  composition.mjs — the one source the 9:16, 4:5 and 1:1 cuts are all built
  from.

  HyperFrames reads `data-width` / `data-height` off the root element in the
  markup, before any of the composition's own scripts run — a render-time
  variable cannot change them (measured: passing {"w":1080,"h":1080} to a
  composition whose root said 1920 still rendered 1920). So the formats cannot
  be one HTML file driven by a flag. They are one template, called three times,
  which is the same promise: there is a single place to change the edit, and
  the three outputs cannot drift apart because none of them is hand-written.

  Everything that is a claim — the price, the seven names, the weights, the
  free-delivery threshold, the wordmark — arrives in `vars` from catalogue.mjs,
  which reads the catalogue the storefront reads. Nothing here invents a number.

  The look follows design/tokens: green-deep ground, amber accent, paper text,
  Oswald for display and PT Sans for body, and the design's near-square corners
  (6px on images) rather than the rounded card look.
*/

/** Design tokens, copied from design/tokens/colors.ts. */
const C = {
  greenDeep: '#233726',
  green: '#2E4631',
  amber: '#BE8638',
  amberTint: '#F2E4C8',
  paper: '#F3ECDD',
};

/** Per-format geometry. One row per deliverable. */
export const FORMATS = {
  '9x16': { w: 1080, h: 1920, safeBottom: 330, scale: 1.0 },
  '4x5': { w: 1080, h: 1350, safeBottom: 120, scale: 0.92 },
  '1x1': { w: 1080, h: 1080, safeBottom: 96, scale: 0.78 },
};

/* ---- the edit, in seconds -------------------------------------------------
   One table so the rhythm can be read and retimed in one place. The cards
   overlap their successor by 50ms: without it a frame can land in the gap
   between two clips and render as a black flash.                            */
const OPEN_AT = 0;
const OPEN_FOR = 2.4;
const CARD_STEP = 1.25;
const CARD_FOR = 1.3;
const CLOSE_FOR = 3.8;

export function timing(teaCount) {
  const cards = Array.from({ length: teaCount }, (_, i) => ({
    index: i,
    at: OPEN_AT + OPEN_FOR + i * CARD_STEP,
  }));
  const closeAt = cards[cards.length - 1].at + CARD_FOR - 0.15;
  return { cards, closeAt, total: closeAt + CLOSE_FOR };
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildHtml({ format, vars }) {
  const F = FORMATS[format];
  if (!F) throw new Error(`unknown format "${format}"`);
  const { cards, closeAt, total } = timing(vars.teas.length);

  const pad = (n) => String(n).padStart(2, '0');
  const offer = `${vars.count} видів · ${vars.totalGrams} г · ${vars.price} ₴`;

  const teaCards = vars.teas
    .map((name, i) => {
      const { at } = cards[i];
      return `
    <section class="clip card" id="card-${i}" data-start="${at.toFixed(2)}" data-duration="${CARD_FOR}">
      <img class="shot" id="shot-${i}" src="assets/tea-${i + 1}.jpg" alt=""
           data-start="${at.toFixed(2)}" data-duration="${CARD_FOR}">
      <div class="veil"></div>
      <div class="caption">
        <div class="rail">${vars.teas
          .map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`)
          .join('')}</div>
        <div class="counter" id="count-${i}">${pad(i + 1)} <span>/ ${pad(vars.count)}</span></div>
        <h2 class="name" id="name-${i}">${esc(name)}</h2>
      </div>
    </section>`;
    })
    .join('');

  return `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600&family=PT+Sans:wght@400;700&display=block" rel="stylesheet">
<style>
  :root {
    --green-deep: ${C.greenDeep};
    --green: ${C.green};
    --amber: ${C.amber};
    --amber-tint: ${C.amberTint};
    --paper: ${C.paper};
    --safe-bottom: ${F.safeBottom}px;
    --s: ${F.scale};
    --display: "Oswald", "Arial Narrow", sans-serif;
    --body: "PT Sans", system-ui, sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: var(--green-deep); }
  #root {
    position: relative;
    width: ${F.w}px; height: ${F.h}px;
    overflow: hidden;
    background: var(--green-deep);
    font-family: var(--body);
    color: var(--paper);
    -webkit-font-smoothing: antialiased;
  }
  .clip { position: absolute; inset: 0; }
  .shot { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: 50% 45%; }

  /* The design separates with light, not boxes: a scrim carries the type
     instead of a panel behind it.

     The gradient must reach zero well before the top of the frame. An earlier
     cut held the green at .35 alpha all the way up and the result was not a
     photograph with a caption on it but a green filter over the product —
     the chartreuse pouches, which are the one thing a viewer has to recognise,
     came out olive. Hero.tsx records the same lesson about the same colour.
     So: opaque under the caption, gone by just over a third of the way up. */
  .veil {
    position: absolute; inset: 0;
    background:
      linear-gradient(to top,
        rgba(35,55,38,.97) 0%,
        rgba(35,55,38,.90) 13%,
        rgba(35,55,38,.52) 27%,
        rgba(35,55,38,0) 46%),
      radial-gradient(130% 85% at 50% 32%, rgba(0,0,0,0) 45%, rgba(20,30,22,.34) 100%);
  }

  .caption {
    position: absolute;
    left: calc(72px * var(--s)); right: calc(72px * var(--s));
    bottom: var(--safe-bottom);
  }
  .rail { display: flex; gap: calc(9px * var(--s)); margin-bottom: calc(34px * var(--s)); }
  .rail i { flex: 1; height: calc(7px * var(--s)); background: rgba(243,236,221,.26); border-radius: 2px; }
  .rail i.on { background: var(--amber); }

  .counter {
    font-family: var(--display); font-weight: 500;
    font-size: calc(30px * var(--s)); letter-spacing: calc(4px * var(--s));
    color: var(--amber); margin-bottom: calc(14px * var(--s));
  }
  .counter span { color: rgba(243,236,221,.45); }

  .name {
    font-family: var(--display); font-weight: 600;
    font-size: calc(76px * var(--s)); line-height: 1.08; letter-spacing: 0;
    text-wrap: balance;
  }

  /* --- opener --- */
  #open .eyebrow {
    font-family: var(--body); font-size: calc(26px * var(--s)); font-weight: 700;
    letter-spacing: calc(7px * var(--s)); text-transform: uppercase; color: var(--amber-tint);
    margin-bottom: calc(22px * var(--s));
  }
  #open .headline {
    font-family: var(--display); font-weight: 600;
    font-size: calc(104px * var(--s)); line-height: 1.04;
  }
  #open .sub {
    margin-top: calc(24px * var(--s));
    font-size: calc(34px * var(--s)); line-height: 1.45; color: rgba(243,236,221,.80);
    max-width: 80%;
  }

  /* --- close --- */
  #close { background: var(--green-deep); display: grid; place-content: center; text-align: center; padding: 0 calc(84px * var(--s)); }
  #close .kicker {
    font-family: var(--body); font-weight: 700; font-size: calc(26px * var(--s));
    letter-spacing: calc(7px * var(--s)); text-transform: uppercase;
    color: var(--amber); margin-bottom: calc(26px * var(--s));
  }
  /* The price is the ad. A single line reading "7 видів · 70 г · 570 ₴" fits
     the frame only at a size nobody reads on a phone held at arm's length, so
     the same three facts are stacked and the number is given the room. */
  #close .price {
    font-family: var(--display); font-weight: 600;
    font-size: calc(170px * var(--s)); line-height: 0.95; color: var(--paper);
  }
  #close .offer {
    margin-top: calc(18px * var(--s));
    font-family: var(--display); font-weight: 500;
    font-size: calc(46px * var(--s)); letter-spacing: calc(1px * var(--s));
    color: rgba(243,236,221,.86);
  }
  #close .hair { width: calc(120px * var(--s)); height: 1px; background: rgba(243,236,221,.30); margin: calc(46px * var(--s)) auto; }
  #close .ship { font-size: calc(34px * var(--s)); color: var(--amber-tint); line-height: 1.45; }
  #close .mark {
    margin-top: calc(70px * var(--s));
    font-family: var(--display); font-weight: 600;
    font-size: calc(54px * var(--s)); letter-spacing: calc(12px * var(--s));
    text-transform: uppercase; color: var(--paper);
  }
  #close .mark small {
    display: block; margin-top: calc(14px * var(--s));
    font-family: var(--body); font-weight: 700; font-size: calc(20px * var(--s));
    letter-spacing: calc(6px * var(--s)); color: rgba(243,236,221,.50);
  }
</style>
</head>
<body>
<div id="root" data-composition-id="root" data-width="${F.w}" data-height="${F.h}" data-fps="30">

  <section class="clip" id="open" data-start="${OPEN_AT}" data-duration="${OPEN_FOR}">
    <img class="shot" id="open-shot" src="assets/open-box.jpg" alt=""
         data-start="${OPEN_AT}" data-duration="${OPEN_FOR}">
    <div class="veil"></div>
    <div class="caption">
      <div class="eyebrow" id="open-eyebrow">${esc(vars.brand)}</div>
      <h1 class="headline" id="open-headline">Стартовий<br>набір</h1>
      <p class="sub" id="open-sub">Сім китайських чаїв, щоб знайти свій.</p>
    </div>
  </section>
${teaCards}

  <section class="clip" id="close" data-start="${closeAt.toFixed(2)}" data-duration="${CLOSE_FOR}">
    <div>
      <div class="kicker" id="close-kicker">Стартовий набір</div>
      <div class="price" id="close-price">${vars.price} ₴</div>
      <div class="offer" id="close-offer">${esc(offer)}</div>
      <div class="hair" id="close-hair"></div>
      <div class="ship" id="close-ship">Безкоштовна доставка<br>від ${vars.freeDeliveryFrom} ₴</div>
      <div class="mark" id="close-mark">${esc(vars.brand)}<small>Chinese tea</small></div>
    </div>
  </section>
</div>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script>
/*
  One paused timeline on absolute film time, which is what the renderer seeks.
  CSS animations are deliberately not used: the renderer jumps to each frame
  rather than playing, and a CSS animation does not seek with it.
*/
(function () {
  const tl = gsap.timeline({ paused: true });
  const cards = ${JSON.stringify(cards)};
  const OPEN_FOR = ${OPEN_FOR}, CARD_FOR = ${CARD_FOR}, CLOSE_AT = ${closeAt};
  const TOTAL = ${total};

  // Opener: a slow push on the photograph, type arriving under it.
  tl.fromTo("#open-shot", { scale: 1.12 }, { scale: 1.0, duration: OPEN_FOR, ease: "none" }, 0);
  tl.from("#open-eyebrow", { opacity: 0, y: 18, duration: 0.5, ease: "power2.out" }, 0.25);
  tl.from("#open-headline", { opacity: 0, y: 36, duration: 0.6, ease: "power3.out" }, 0.40);
  tl.from("#open-sub", { opacity: 0, y: 24, duration: 0.6, ease: "power3.out" }, 0.62);
  tl.to("#open", { opacity: 0, duration: 0.22, ease: "none" }, OPEN_FOR - 0.22);

  // Seven beats. Each one pushes in slightly and lands its name; the 50ms
  // overlap with the next card is covered by this fade so no frame is empty.
  cards.forEach(function (c) {
    const card = "#card-" + c.index;
    tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "none" }, c.at);
    tl.fromTo("#shot-" + c.index, { scale: 1.08 }, { scale: 1.0, duration: CARD_FOR, ease: "none" }, c.at);
    tl.from("#count-" + c.index, { opacity: 0, y: 12, duration: 0.34, ease: "power2.out" }, c.at + 0.06);
    tl.from("#name-" + c.index, { opacity: 0, y: 26, duration: 0.42, ease: "power3.out" }, c.at + 0.10);
    tl.to(card, { opacity: 0, duration: 0.16, ease: "none" }, c.at + CARD_FOR - 0.16);
  });

  // Close: the offer, then the wordmark, held long enough to be read.
  tl.fromTo("#close", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, CLOSE_AT);
  tl.from("#close-kicker", { opacity: 0, y: 16, duration: 0.45, ease: "power2.out" }, CLOSE_AT + 0.14);
  tl.from("#close-price", { opacity: 0, y: 34, scale: 0.94, duration: 0.65, ease: "power3.out" }, CLOSE_AT + 0.26);
  tl.from("#close-offer", { opacity: 0, y: 22, duration: 0.55, ease: "power3.out" }, CLOSE_AT + 0.46);
  tl.fromTo("#close-hair", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out" }, CLOSE_AT + 0.70);
  tl.from("#close-ship", { opacity: 0, y: 18, duration: 0.5, ease: "power3.out" }, CLOSE_AT + 0.86);
  tl.from("#close-mark", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" }, CLOSE_AT + 1.20);

  /*
    The rendered film is as long as this timeline, not as long as the clips:
    without the marker below the last tween ended at 12.70s and the close card
    — the offer and the wordmark, the only frames that ask for the sale — was
    cut after 1.65s instead of the 3.8s it is given. A zero-duration set at the
    end extends the timeline to the full edit and changes nothing on screen.
  */
  tl.set("#root", {}, TOTAL);

  window.__timelines = window.__timelines || {};
  window.__timelines["root"] = tl;
})();
</script>
</body>
</html>
`;
}

export const TOTAL_SECONDS = (teaCount) => timing(teaCount).total;
