import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/*
  Button — the `Кнопки` panel of `Design System — Components` in jintea.pen.

  Three shapes are drawn there:
    primary    green fill, 13/24 padding, 4px radius, label + optional icon
    secondary  card fill with a 1px green hairline, same label
    ghost      no surface at all, label + trailing arrow

  Labels are uppercase, 13px/700 with 1px of tracking, in the body face — the
  design never sets a button label in the display face. `uppercase` is applied
  here rather than shouting in every call site's copy, so the Ukrainian strings
  stay readable in the source.

  The `default` / `pill` / `outline` / `xl` names are back-compat aliases for
  call sites written against the previous design; they resolve to the shapes
  above so no screen had to be touched when the design was replaced.
*/
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary: 'rounded bg-green text-on-green uppercase hover:bg-green-deep active:translate-y-px',
        secondary:
          'rounded bg-card text-green uppercase shadow-[inset_0_0_0_1px_var(--green)] hover:bg-green-tint',
        ghost: 'rounded text-ink uppercase hover:bg-green-tint',
        amber: 'rounded bg-amber text-[#2A1E08] uppercase hover:bg-amber-deep hover:text-on-green',
        destructive: 'rounded bg-danger text-on-green uppercase hover:opacity-90',
        link: 'text-green underline-offset-4 hover:underline',

        // aliases (previous design)
        default: 'rounded bg-green text-on-green uppercase hover:bg-green-deep active:translate-y-px',
        pill: 'rounded bg-green text-on-green uppercase hover:bg-green-deep active:translate-y-px',
        outline:
          'rounded bg-card text-green uppercase shadow-[inset_0_0_0_1px_var(--green)] hover:bg-green-tint',
      },
      size: {
        sm: 'min-h-[38px] px-[18px] py-[9px] text-[12px] font-bold tracking-[1px]',
        md: 'min-h-[44px] px-6 py-[13px] text-label',
        lg: 'min-h-[52px] px-8 py-4 text-[14px] font-bold tracking-[1px]',
        icon: 'w-11 h-11 p-0',

        // aliases (previous design)
        default: 'min-h-[44px] px-6 py-[13px] text-label',
        xl: 'min-h-[52px] px-8 py-4 text-[14px] font-bold tracking-[1px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { buttonVariants };
