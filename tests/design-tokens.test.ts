import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { colors, alpha } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';
import { space, BASE_GRID, layout } from '@/design/tokens/spacing';
import { scale, roles } from '@/design/tokens/typography';
import tailwindConfig from '@/tailwind.config';

/*
  The design tokens exist three times over: as TypeScript (design/tokens/*.ts),
  as CSS custom properties (design/tokens/tokens.css) and as Tailwind scales
  (tailwind.config.ts). All three are exported from `Design System — Tokens` in
  jintea.pen, and nothing keeps them in step automatically — so a palette
  change made in one place and forgotten in the others is invisible until a
  screen renders the wrong colour. These tests are that alarm.
*/

const css = readFileSync(join(process.cwd(), 'design/tokens/tokens.css'), 'utf8');

/** `paperDeep` -> `--paper-deep`, `green600` -> `--green-600`. */
function cssVar(name: string): string {
  return '--' + name.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();
}

function declaredValue(variable: string): string | undefined {
  const match = css.match(new RegExp(`\\n\\s*${variable}:\\s*([^;]+);`));
  return match?.[1].trim();
}

const theme = tailwindConfig.theme?.extend ?? {};

describe('colors', () => {
  it('every palette token is declared in tokens.css with the same value', () => {
    for (const [name, hex] of Object.entries(colors)) {
      expect(declaredValue(cssVar(name)), `${cssVar(name)} missing from tokens.css`).toBe(
        hex.toLowerCase(),
      );
    }
  });

  it('every overlay is declared in tokens.css', () => {
    const expected: Record<keyof typeof alpha, string> = {
      onGreen80: '--on-green-80',
      onGreen69: '--on-green-69',
      onGreen50: '--on-green-50',
      onGreen15: '--on-green-15',
      scrimFrom: '--scrim-from',
      scrimTo: '--scrim-to',
    };
    for (const [name, variable] of Object.entries(expected)) {
      expect(declaredValue(variable)).toBe(alpha[name as keyof typeof alpha].toLowerCase());
    }
  });

  it('--card is declared exactly once, as a colour', () => {
    // It used to be declared twice — as a hex and again as shadcn HSL channels —
    // which made `var(--card)` resolve to "43 60% 96%" and silently broke every
    // plain-CSS use of it (app/styles/sticky-bar.css).
    const declarations = css.match(/\n\s*--card:/g) ?? [];
    expect(declarations).toHaveLength(1);
    expect(declaredValue('--card')).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('Tailwind resolves the brand colours to the same hexes', () => {
    const c = theme.colors as Record<string, unknown>;
    expect(c.card).toBe(colors.card);
    expect((c.paper as Record<string, string>).DEFAULT).toBe(colors.paper);
    expect((c.ink as Record<string, string>).DEFAULT).toBe(colors.ink);
    expect((c.green as Record<string, string>).DEFAULT).toBe(colors.green);
    expect((c.amber as Record<string, string>).DEFAULT).toBe(colors.amber);
    expect(c['on-green']).toBe(colors.onGreen);
  });
});

describe('radii', () => {
  it('tokens.css matches radius.ts', () => {
    expect(declaredValue('--radius-sm')).toBe(`${radius.sm}px`);
    expect(declaredValue('--radius-md')).toBe(`${radius.md}px`);
    expect(declaredValue('--radius-lg')).toBe(`${radius.lg}px`);
    expect(declaredValue('--radius-xl')).toBe(`${radius.xl}px`);
  });

  it('Tailwind matches radius.ts', () => {
    const r = theme.borderRadius as Record<string, string>;
    expect(r.sm).toBe(`${radius.sm}px`);
    expect(r.DEFAULT).toBe(`${radius.md}px`);
    expect(r.md).toBe(`${radius.md}px`);
    expect(r.lg).toBe(`${radius.lg}px`);
    expect(r.xl).toBe(`${radius.xl}px`);
  });

  it('stays near-square: nothing but `full` exceeds 8px', () => {
    // The design's largest non-circular radius is the 8px panel. A 16px or 22px
    // radius anywhere means a screen is still following the previous design.
    for (const [name, value] of Object.entries(radius)) {
      if (name === 'full') continue;
      expect(value).toBeLessThanOrEqual(8);
    }
  });
});

describe('spacing', () => {
  it('every step is a multiple of the 4px base grid', () => {
    for (const value of Object.values(space)) {
      expect(value % BASE_GRID).toBe(0);
    }
  });

  it("the scale matches Tailwind's default steps, so `gap-4` is 16px", () => {
    // This is why no spacing scale is configured in tailwind.config.ts. If the
    // design ever moves off the 4px grid, that shortcut stops holding.
    for (const [step, px] of Object.entries(space)) {
      expect(Number(step) * BASE_GRID).toBe(px);
    }
  });

  it('the content column is declared in tokens.css and in Tailwind', () => {
    expect(declaredValue('--content-max')).toBe(`${layout.contentMaxWidth}px`);
    expect((theme.maxWidth as Record<string, string>).content).toBe(
      `${layout.contentMaxWidth}px`,
    );
  });
});

describe('typography', () => {
  const fontSize = theme.fontSize as Record<string, [string, Record<string, string>]>;

  it('every scale step is a Tailwind fontSize with the same size and line height', () => {
    for (const [name, style] of Object.entries(scale)) {
      const entry = fontSize[name];
      expect(entry, `text-${name} missing from tailwind.config.ts`).toBeDefined();
      expect(entry[0]).toBe(`${style.size}px`);
      expect(entry[1].lineHeight).toBe(String(style.lineHeight));
    }
  });

  it('every component role is a Tailwind fontSize with the same size', () => {
    const named: Record<keyof typeof roles, string> = {
      eyebrow: 'eyebrow',
      label: 'label',
      nav: 'nav',
      cardTitle: 'card-title',
      sectionHead: 'section-head',
      wordmark: 'wordmark',
    };
    for (const [name, key] of Object.entries(named)) {
      const entry = fontSize[key];
      expect(entry, `text-${key} missing from tailwind.config.ts`).toBeDefined();
      expect(entry[0]).toBe(`${roles[name as keyof typeof roles].size}px`);
    }
  });

  it('display styles carry tracking that matches the design file', () => {
    expect(fontSize.h2[1].letterSpacing).toBe(`${scale.h2.letterSpacing}px`);
    expect(fontSize.h3[1].letterSpacing).toBe(`${scale.h3.letterSpacing}px`);
    expect(fontSize.wordmark[1].letterSpacing).toBe(`${roles.wordmark.letterSpacing}px`);
  });
});

describe('cn() class merging', () => {
  it('keeps a type-scale utility and a colour utility together', async () => {
    // tailwind-merge only knows Tailwind's stock font sizes; every other
    // `text-*` it treats as a colour. That put `text-label` and `text-on-green`
    // in one class group, so the colour was dropped and "Додати в кошик"
    // rendered ink on green at 1.48:1. lib/utils.ts registers the scale as
    // font sizes to keep the two apart.
    const { cn } = await import('@/lib/utils');

    for (const size of [...Object.keys(scale), 'label', 'card-title', 'section-head']) {
      const merged = cn(`text-${size}`, 'text-on-green');
      expect(merged, `text-${size} swallowed the colour`).toContain('text-on-green');
      expect(merged).toContain(`text-${size}`);
    }
  });

  it('still collapses two genuinely conflicting utilities', () => {
    // The registration must not disable merging: a later size still wins.
    return import('@/lib/utils').then(({ cn }) => {
      expect(cn('text-body', 'text-h1')).toBe('text-h1');
      expect(cn('text-ink', 'text-on-green')).toBe('text-on-green');
    });
  });
});
