import * as React from 'react';

import { cn } from '@/lib/utils';

/** Textarea — an `Input` with four rows, resizable only by hand. */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      'min-h-28 w-full resize-y rounded-md border border-input bg-background px-3.5 py-2.5',
      'text-base text-foreground transition-colors placeholder:text-muted-foreground sm:text-sm',
      'hover:border-border-strong',
      'aria-[invalid=true]:border-error aria-[invalid=true]:bg-error-subtle',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
