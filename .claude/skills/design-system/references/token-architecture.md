# Token architecture

Tailwind v4, CSS-first, one file. Three layers, each written once:

```css
@import "tailwindcss";

/* 1. PALETTE — raw values. `initial` drops Tailwind's default palette so only these exist. */
@theme {
	--color-*: initial;
	--color-white: #ffffff;
	--color-stone-50: #fafaf9;
	/* … every step the brand uses … */
	--color-amber-400: #fbbf24;

	--radius-sm: 0.125rem;
	--radius-md: 0.25rem;

	--font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif; /* next/font variable */

	--text-xs: 0.8125rem;
	--text-xs--line-height: 1.125rem;
}

/* 2. SEMANTIC — roles, written as references to the palette. */
:root {
	--background: var(--color-white);
	--foreground: var(--color-stone-900);
	--primary: var(--color-amber-400);
	--primary-foreground: var(--color-stone-950);
	--radius: var(--radius-md);
}
.dark {
	--background: var(--color-stone-950);
	/* same names, dark values */
}

/* 3. MAPPING — turns roles into utilities: bg-primary, text-primary-foreground … */
@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
}

@custom-variant dark (&:where(.dark, .dark *));
```

Components use semantic classes (`bg-primary`, `text-muted-foreground`). Palette classes (`bg-stone-100`) are for one-off shades the design calls for, and they are the exception.

## Semantic vocabulary

Start from shadcn's names and extend in families. Every surface token has a `-foreground` partner.

| Family | Tokens | Role |
|---|---|---|
| shadcn core | `background` `foreground` `card` `popover` `primary` `secondary` `muted` `accent` `destructive` `border` `input` `ring` (+ `-foreground`) | as shadcn uses them |
| brand weight | `primary-subtle` `primary-subtle-foreground` `primary-subtle-stroke` `primary-strong` | tinted backgrounds, badges, pressed states |
| status | `error` `success` `warning` `info`, each with `-foreground` `-subtle` `-subtle-foreground` `-subtle-stroke` | alerts, field errors, badges |
| emphasis | `border-strong` `border-active` `accent-strong` `inverse` `inverse-foreground` `subtle` `subtle-foreground` | stronger dividers, dark action buttons, quiet surfaces |

Meanings to keep straight:

- `--accent` is shadcn's **hover/highlight surface** (ghost buttons, menu items), not the brand colour. The brand colour is `--primary`.
- `--primary` is the colour of the main action. In some brands that is ink, not the brand hue; ask when unsure.
- `--input` means whatever the project already uses it for (shadcn: the input border; some projects: the input background). Read its uses before changing it.
- Status colours get their own tokens; `destructive` may alias `error`.

## Tailwind v4 rules that bite

- **Names.** Scales keep Tailwind's own names (`text-xs`…`text-9xl`, `rounded-xs`…`rounded-4xl`, `shadow-*`); the project changes values, not class names. A size carries no weight or case: those stay `font-*` and `uppercase`. Before redefining a step, rename the project's existing uses so they keep their value. A new name only where no Tailwind step fits, and only with the user's agreement.
- **Namespace resets.** `--color-*: initial`, `--text-*: initial`, `--font-*: initial`, `--breakpoint-*: initial` make the project's list the only one. Without the reset, Tailwind's defaults stay available next to the project's.
- **`@theme` vs `@theme inline`.** A theme value that references another variable (`var(--primary)`) goes in `@theme inline`, so the utility reads the variable at the element, where `.dark` can change it.
- **Spacing.** Numeric spacing (`p-4`, `gap-1.5`) comes from the single `--spacing` multiplier. Named keys like `--spacing-md` collide with `max-w-md` and `w-md` (they read `--spacing-*` too), so add only names that collide with nothing (`--spacing-section`), and only when they are earned.
- **Radius.** Brand radius scales are rarely multiplicative; set each `--radius-*` step literally and point `--radius` at the control radius.
- **Type.** A type step is `--text-<name>` plus optional `--text-<name>--line-height`, `--letter-spacing`, `--font-weight` sub-properties. A new name must be registered in tailwind-merge (`extendTailwindMerge({extend: {theme: {text: ["<name>"]}}})`), or `cn()` treats it as a colour and drops one of the two classes.
- **Dark mode.** v4's default `dark:` follows the OS. A `.dark` class needs `@custom-variant dark (&:where(.dark, .dark *))` and something that adds the class (next-themes `attribute="class"`, or code). A `.dark` block with no switch is dead code.
- **Fonts.** `next/font` exposes a variable (`--font-geist`); the theme font references it. Weights come from `--font-weight-*`; do not add one family token per weight. A new family re-fits every step's `--line-height` and `--letter-spacing` to its metrics ([leading.md](leading.md)).
- **Layers.** Element defaults (`html`, `body`, resets) go in `@layer base`. Unlayered CSS beats every utility regardless of specificity.
