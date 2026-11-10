---
paths:
  - "src/**/*.{tsx,jsx}"
---

# Design rules: Tables

Tables and data lists, comparison tables included.

## Before writing

- The table primitives in `src/shared/components/ui`, if any.
- List every table or tabular list in the target: what each row is, the columns, whether it sorts, filters, paginates or selects. Label–value rows inside cards (a price list in a card) count as tabular lists: TB3 applies to them, TB4–TB11 do not.
- Decide the form first (TB1).

## How to check

Every rule against every table; when the page runs, view each at 375px and at desktop width, with long values and with no rows.

**Severity here:** P0 data users cannot read or reach (no table semantics, page-wide horizontal scroll, actions without names); P1 broken alignment or pattern; P2 density off the system, polish.

Component names are shadcn's.

## Form

**TB1 · P1 — Table, list or cards.** A table when people compare records across the same attributes, in the same units; a list or cards when they browse or pick one record, when records differ in units or carry their own notes, or when most visitors need one record (a price per category). On phones a wide table becomes stacked cards (label + value pairs) or scrolls inside its own container with the first column sticky.

**TB2 · P0 — Real table markup.** `<table>` with `<thead>` and `<tbody>` — shadcn `Table` parts, not divs in a grid; a table built from divs is P0. Column headers are `<th scope="col">`, row headers `<th scope="row">`, and a data table has a caption (visually hidden is fine); missing row headers or caption alone are P1. A specimen matrix needs no caption. Label–value rows in cards use `<dl>` (`<dt>`, `<dd>`).

## Reading

**TB3 · P1 — Align by type.** Text left; numbers, prices and dates right-aligned with `tabular-nums`; one unit and one precision per column, with the unit in the header; status as a badge with text.

**TB4 · P2 — Density from the system.** One row height per table (`h-10`–`h-12`), cell padding from the scale, header in `text-xs`/`text-sm` `font-medium text-muted-foreground`; rows separated by `border-b border-border` or zebra striping — not both.

**TB5 · P1 — Long content stays in its cell.** Columns have sensible widths; long text truncates with the full value reachable (a detail view or an expandable row — a `title` attribute alone fails on touch); long tokens wrap. A wide table scrolls inside its container and looks scrollable (page-level scroll is L13).

**TB6 · P2 — Long tables keep their bearings.** A sticky header for tables taller than the screen; a sticky first column for wide ones.

## Acting

**TB7 · P1 — Row actions have one home.** The last column, right-aligned; up to two visible actions, the rest in a "more" menu (names of icon-only actions are I7). A row is clickable as a whole only when it has one obvious destination, and then it is a real link.

**TB8 · P1 — Sorting is visible and announced.** A sortable header is a button with the current direction shown by an icon and `aria-sort`; one sort at a time unless the task needs more.

**TB9 · P1 — Filters stay visible.** Applied filters stay visible and removable above the table. (URL state and the pagination range are NV11, NV12.)

**TB10 · P1 — Selection scales.** A checkbox column with a select-all that shows the indeterminate state; selected rows use a token highlight (`bg-accent`, `bg-primary-subtle`); a bar shows the count and bulk actions.

## States

**TB11 · P1 — States live inside the frame.** Loading, empty and error states (S2–S4) render inside the table's frame — skeleton rows matching the columns, the header kept — so the layout does not jump.

## Comparison tables

**TB12 · P2 — Comparison tables guide the choice.** (Pricing per category is usually cards, by TB1.) The recommended column is highlighted with a token surface and a label; checks and crosses are icons with text alternatives; feature rows are grouped with headed sections; the action for each column sits at its top or bottom, aligned across columns.
