import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with conflict resolution. Used by every primitive in
 * `components/ui`.
 *
 * No `extendTailwindMerge` any more: the type scale is Tailwind's own steps
 * (`text-xs` … `text-9xl`), which tailwind-merge already knows. The old system
 * had named steps (`text-label`, `text-h2`), and anything after `text-` that
 * tailwind-merge does not recognise it files as a *colour* — so `text-label`
 * and `text-on-green` landed in one class group, the later won, and the colour
 * was dropped. That is how «Додати в кошик» once rendered ink on green at
 * 1.48:1. A new `--text-*` key would bring the bug back and has to be
 * registered here (design-system skill, token-architecture.md).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
