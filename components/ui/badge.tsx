/*
  The badge now lives in the design system as `Tag`: see
  design/primitives/Tag.tsx, drawn in the `Бейджі та теги` panel.

  The shadcn variant names map onto the design's tones:
    default -> category (amber-tint)
    ok      -> in stock
    danger  -> out of stock
*/
import * as React from 'react';
import { Tag } from '@/design/primitives/Tag';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'ok' | 'danger';
}

export function Badge({ variant = 'default', ...props }: BadgeProps) {
  return <Tag tone={variant === 'default' ? 'category' : variant} {...props} />;
}
