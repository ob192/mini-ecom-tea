import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/*
  Badge — always a pill, one line (T13). Status variants use the `-subtle`
  surface with its own foreground, so a tinted area never carries a saturated
  fill (C7), and each one is readable text rather than a colour alone (C11).
*/
const badgeVariants = cva(
  'inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium [&_svg]:size-3.5',
  {
    variants: {
      variant: {
        default: 'h-6 bg-secondary text-secondary-foreground',
        primary: 'h-6 bg-primary text-primary-foreground',
        subtle: 'h-6 bg-primary-subtle text-primary-subtle-foreground',
        outline: 'h-6 border border-border-strong text-foreground',
        success: 'h-6 bg-success-subtle text-success-subtle-foreground',
        error: 'h-6 bg-error-subtle text-error-subtle-foreground',
        warning: 'h-6 bg-warning-subtle text-warning-subtle-foreground',
        info: 'h-6 bg-info-subtle text-info-subtle-foreground',
      },
      size: {
        default: '',
        lg: 'h-8 px-3 text-sm [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
