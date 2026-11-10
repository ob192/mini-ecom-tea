# Setup

Five steps, in order. Each ends on a done-when.

## 1. Observe

Build the picture of what the project already does, before asking anything.

- The audit report from Orient: layers present, palette vs semantic class counts, `arbitrary-repeats` (the real values in use), raw colours.
- The CSS file and 2–3 representative screens (the home page, one form, one list or detail page).
- From those, write down the **observed practice**:
  - colours by role: page background, text, muted text, borders, the main action, links, status colours
  - type: the sizes actually used for page title, section title, body, small/caption, and the font
  - layout rhythm: gap between page sections, container width and side gutters, card/section padding, gap inside lists and forms
  - controls: button and input heights, radius on controls and on cards
  - depth: borders, shadows, or tonal surfaces
  - icons: which library
  - dark mode: present, switched by what

Done when every item above has a value from the code or "none".

## 2. Interview

Ask with AskUserQuestion: at most 3 questions per round, 2–4 options each, the recommended option first. Build the options from the observed practice: "keep as is" is almost always one of them.

- Ask about trade-offs between concrete options, never for adjectives ("modern", "clean") or raw CSS values.
- Skip a question the observed practice already answers, unless the user wants to change that area.
- Typical axes, in the order they matter:
  1. Scope: tokens only, or tokens plus moving feature code onto them (a separate, later step).
  2. Main action colour and where the brand colour may appear (actions only / actions + selection + links / also decorative).
  3. Neutrals: temperature (cool / neutral / warm) and how many grey steps the UI needs.
  4. Depth: borders only / borders + soft shadow on overlays / tonal surfaces.
  5. Radius: sharp (0–4px) / soft (6–8px) / round (12px+) — controls and cards may differ.
  6. Type: one family or two; the scale's steps by role.
  7. Density: as observed / tighter / airier. Recorded as practice in DESIGN.md, never as a token.
  8. Dark mode: none / later / now.
  9. A reference to borrow from (a site, a DESIGN.md from getdesign.md). Take its system (roles, scale, rhythm), not its identity.

Done when every axis the setup touches has an answer or an explicit "keep as is".

## 3. Show

When an answer depends on seeing it (colours, radius, density, type scale), render the options before writing tokens. Use the `design-playground` skill (a dev-only `/playground` page that returns 404 in production). Build specimens from the project's real components, stacked on one exploration page, with the token values visible. Include contrast for every text-on-surface pair shown.

Done when the user has picked from rendered options, or said a decision needs no specimen.

## 4. Write

1. Write the three layers into the existing CSS file, following [token-architecture.md](token-architecture.md) and the project's format. Keep existing token names that already carry a role; rename only with the user's agreement.
2. Values that change for users (colours, sizes) change only where the user decided them. Everything else maps the observed values onto the new names one to one, so the site looks the same.
3. Write DESIGN.md per [design-md.md](design-md.md).
4. Moving feature code from palette classes and arbitrary values onto the new tokens is a separate step. Offer it with the counts from the audit; do it in batches by area, each batch reviewed.

## 5. Verify

- Re-run the audit: no P0; every P1 fixed or explained to the user.
- The project's build passes.
- The main screens look as decided (screenshots before/after when values changed).
