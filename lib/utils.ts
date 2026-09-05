import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import { scale, roles } from '@/design/tokens/typography';

/*
  tailwind-merge has to be told about the design system's type scale.

  Out of the box it only recognises Tailwind's stock font sizes (`text-sm`,
  `text-xl`, …). Anything else beginning with `text-` it files as a *colour*.
  So within one `cn()` call `text-label` and `text-on-green` landed in the same
  class group, the later one won, and the colour was silently dropped — which
  is how "Додати в кошик" ended up rendering ink #232719 on green #2E4631, at
  1.48:1 contrast.

  Registering the scale's keys as font sizes puts each utility back in its own
  group. The list is derived from design/tokens/typography.ts rather than
  retyped, so adding a step to the scale cannot reintroduce the bug.
*/
const TYPE_SCALE = [
  ...Object.keys(scale),
  // `roles` keys are camelCase in TS and kebab-case as utilities.
  ...Object.keys(roles).map((k) => k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()),
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: TYPE_SCALE }],
    },
  },
});

/** Merge Tailwind classes with conflict resolution. Used by all shadcn ui/*. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
