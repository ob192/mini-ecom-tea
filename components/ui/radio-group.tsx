'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

import { cn } from '@/lib/utils';

/*
  RadioGroup — one of two to five visible options (F9). The whole row is the
  target and it is 44px tall (M1); the chosen option is marked by a filled disc
  *and* by weight, never by colour alone (C11). Radix exposes `aria-checked`,
  arrow-key movement and a single tab stop for the group.
*/
export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('flex flex-col gap-1', className)} {...props} />
));
RadioGroup.displayName = 'RadioGroup';

export interface RadioProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  hint?: React.ReactNode;
}

export const Radio = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioProps>(
  ({ className, children, hint, ...props }, ref) => (
    /*
      The whole row is the control, not a 20px disc with a label beside it.
      Stretching the hit area with a pseudo-element works for a finger but not
      for a measurement — `getBoundingClientRect` reports the border box, so the
      control still measured 20×20 to `design-mobile` and to anyone auditing it.
      Radix renders the Item as a `role="radio"` button, and its text content is
      its accessible name, so the label can live inside it instead.
    */
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'group flex w-full min-h-11 items-start gap-3 rounded-md py-2 text-left transition-colors',
        'hover:bg-foreground/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-input bg-background transition-colors',
          'group-hover:border-border-strong',
          'group-data-[state=checked]:border-foreground group-data-[state=checked]:bg-primary',
        )}
      >
        <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-primary-foreground" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-medium">{children}</span>
        {hint ? <span className="text-sm text-muted-foreground text-pretty">{hint}</span> : null}
      </span>
    </RadioGroupPrimitive.Item>
  ),
);
Radio.displayName = 'Radio';
