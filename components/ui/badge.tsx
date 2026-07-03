import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** shadcn Badge — themed for the small category/stock pills. */
const badgeVariants = cva(
  'inline-flex items-center font-display font-medium text-[11px] tracking-wider uppercase px-[9px] py-[3px] rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-green-tint text-green-deep',
        ok: 'bg-green-tint text-ok',
        danger: 'bg-danger-tint text-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
