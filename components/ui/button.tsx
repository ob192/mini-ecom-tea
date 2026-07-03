import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/*
  Button — shadcn base + TEA CHE variants.

  The app's real buttons are large green pills ("Додати в кошик", "Оформити
  замовлення"). Those are expressed as the `pill` variant + `xl` size so call
  sites stay declarative instead of repeating a long className every time.
*/
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-green text-on-green hover:bg-green-deep rounded-full',
        pill: 'bg-green text-on-green hover:bg-green-deep active:scale-[0.98] rounded-full',
        amber: 'bg-amber text-[#2A1E08] hover:bg-amber-deep hover:text-white rounded-full',
        outline:
          'text-green bg-card rounded-full shadow-[inset_0_0_0_1.5px_var(--line)] hover:bg-green-tint',
        ghost: 'text-ink hover:bg-green-tint rounded-full',
        destructive: 'bg-danger text-on-green hover:opacity-90 rounded-full',
        link: 'text-green underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-[44px] px-5 text-[16px]',
        sm: 'min-h-[38px] px-4 text-[14px]',
        lg: 'min-h-[48px] px-6 text-[16px]',
        xl: 'min-h-[52px] px-[22px] text-[18px]',
        icon: 'w-11 h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
