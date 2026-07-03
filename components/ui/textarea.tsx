import * as React from 'react';
import { cn } from '@/lib/utils';

/** shadcn Textarea, themed to TEA CHE. */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'font-body text-[16px] text-ink bg-card rounded w-full px-3.5 py-2.5',
        'min-h-[76px] resize-none leading-snug',
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
});
Textarea.displayName = 'Textarea';

export { Textarea };
