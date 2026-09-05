import * as React from 'react';
import { cn } from '@/lib/utils';

/*
  IconButton — the circular controls in `Кнопки` and `Заголовок секції`.

  These are the only round things in the design. Two sizes are drawn:
  44px on a card fill (header actions, the product card's add button) and 36px
  on paper (the carousel arrows beside a section heading).

  Always pass an accessible name; the child is an icon with no text.
*/
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
  /** `card` sits on the page, `paper` sits inside a card. */
  surface?: 'card' | 'paper';
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', surface = 'card', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-full text-ink shadow-hairline transition-colors',
        'hover:bg-green-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-45',
        size === 'sm' ? 'w-9 h-9' : 'w-11 h-11',
        surface === 'card' ? 'bg-card' : 'bg-paper',
        className,
      )}
      {...props}
    />
  ),
);
IconButton.displayName = 'IconButton';
