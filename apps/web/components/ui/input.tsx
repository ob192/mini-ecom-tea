import * as React from 'react';

import { cn } from '@/lib/utils';

/*
  Input. The boundary is `input` (3.9:1 against the page, 3.4:1 on a card), not
  the decorative hairline — a field has to be seen to be used (C10, F4).

  16px on phones, 14px from `sm`: iOS Safari zooms the whole viewport when a
  focused input is under 16px, and the checkout is where the mobile funnel dies.

  `aria-invalid` only recolours the boundary; it must not swallow the focus ring,
  so the ring classes come after it (S8).
*/
const inputSizes = {
  default: 'h-11 px-3.5 text-base sm:text-sm',
  lg: 'h-14 px-4 text-base',
} as const;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: keyof typeof inputSizes;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', inputSize = 'default', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full min-w-0 rounded-md border border-input bg-background text-foreground',
        'transition-colors placeholder:text-muted-foreground',
        'hover:border-border-strong',
        'aria-[invalid=true]:border-error aria-[invalid=true]:bg-error-subtle',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        inputSizes[inputSize],
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
