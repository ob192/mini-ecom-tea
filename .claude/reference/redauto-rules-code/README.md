# RedАвто's code rules — reference only

These are RedАвто's own code rules, downloaded with its design skills. They
describe **its** modified Feature-Sliced `src/` layout, its routes, its copy
constants and its icon set (`react-icons/lu`) — none of which this repo uses,
and the redesign brief says explicitly not to adopt them: the revenue path
(`app/api/order/route.ts`, `lib/*`, the GA4/Meta wiring) works and a structural
refactor would risk it for no design gain.

They are kept here, out of `.claude/rules/`, as the worked example of how that
project writes rules — the same reason `redauto-DESIGN.md` and
`redauto-globals.css` are kept. Their `paths:` frontmatter was removed so they
do not attach themselves to files in this repo.

**This repo's code guidance is `CLAUDE.md` at the root.** Its design rules —
which the linter and the `design-*` skills do grade against — are in
`.claude/rules/design/`.
