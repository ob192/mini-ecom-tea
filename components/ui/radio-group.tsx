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
  ({ className, children, hint, id, ...props }, ref) => {
    const generated = React.useId();
    const controlId = id ?? generated;
    return (
      <div className="flex items-start gap-3">
        <RadioGroupPrimitive.Item
          ref={ref}
          id={controlId}
          className={cn(
            'mt-3 grid size-5 shrink-0 place-items-center rounded-full border border-input bg-background transition-colors',
            'hover:border-border-strong',
            'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        >
          <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-primary-foreground" />
        </RadioGroupPrimitive.Item>
        <label
          htmlFor={controlId}
          className="flex min-h-11 cursor-pointer flex-col justify-center py-2 text-base"
        >
          <span className="font-medium">{children}</span>
          {hint ? <span className="text-sm text-muted-foreground text-pretty">{hint}</span> : null}
        </label>
      </div>
    );
  },
);
Radio.displayName = 'Radio';
