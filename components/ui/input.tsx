import * as React from 'react';
import { cn } from '@/lib/utils';

/** shadcn Input, themed to the TEA CHE form fields. */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'font-body text-[16px] text-ink bg-card rounded min-h-[48px] w-full px-3.5 py-2.5',
          'border-[1.5px] border-line transition',
          'placeholder:text-ink-faint',
          'focus:outline-none focus:border-green-600 focus:shadow-[0_0_0_3px_rgba(46,70,49,0.12)]',
          'aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger-tint',
          'aria-[invalid=true]:focus:shadow-[0_0_0_3px_rgba(176,73,47,0.14)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
