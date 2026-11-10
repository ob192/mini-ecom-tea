'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
  Button. Every interactive state lives here and nowhere else (S8): hover is
  guarded to pointer devices by the `hover:` variant, focus is a 2px ring with
  an offset so it reads on any surface, pressed darkens, disabled fades.

  Labels are sentence case in the body face. The old system set every label in
  uppercase Oswald at 13px; Cyrillic all-caps is slower to read and «ДОДАТИ В
  КОШИК» at 13px was the main action of the whole shop.

  `pending` is the one place a button draws a spinner (S6, F16): the label stays
  so the width does not jump, presses are ignored, and focus is kept on the
  control (`aria-disabled`, not `disabled`) — `disabled` would move focus away
  from the thing the visitor just pressed.

  That is also why this is a client component. Swallowing the press needs a
  handler, and a handler cannot be handed to a client component from a server
  one; `disabled` would need no JavaScript but loses the focus. A static page
  that only renders a link-shaped button pays about two kilobytes for it.
*/
const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md',
    'font-medium transition-colors select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-disabled:pointer-events-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-strong active:bg-primary-strong',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-border-strong active:bg-border-strong',
        /* The border is the affordance, so it is `input` (3:1), not the decorative hairline. */
        outline:
          'border border-input bg-transparent text-foreground hover:bg-foreground/5 active:bg-foreground/10',
        /* Darkens whatever surface is under it, so it works on background, subtle and card alike. */
        ghost: 'text-foreground hover:bg-foreground/5 active:bg-foreground/10',
        inverse: 'bg-inverse text-inverse-foreground hover:bg-inverse/90 active:bg-inverse/80',
        destructive: 'bg-error text-error-foreground hover:bg-error/90 active:bg-error/80',
        link: 'h-auto px-0 text-foreground underline underline-offset-4 hover:text-primary',
      },
      size: {
        /* 44px is the touch floor (M1); the smaller steps grow to it on a coarse pointer. */
        xs: 'h-8 px-2.5 text-xs pointer-coarse:h-11 pointer-coarse:px-4 [&_svg]:size-3.5',
        sm: 'h-9 px-3.5 text-sm pointer-coarse:h-11 [&_svg]:size-4',
        default: 'h-11 px-5 text-sm [&_svg]:size-4',
        lg: 'h-14 px-7 text-base [&_svg]:size-5',
        icon: 'size-11 p-0 [&_svg]:size-5',
        'icon-sm': 'size-9 p-0 pointer-coarse:size-11 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner, keeps the width, and ignores presses — without losing focus. */
  pending?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, pending = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-disabled={pending || undefined}
        aria-busy={pending || undefined}
        onClick={pending ? (e) => e.preventDefault() : props.onClick}
        {...props}
      >
        {pending ? (
          <>
            <span className="invisible contents">{children}</span>
            <Loader2 className="absolute animate-spin" />
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
