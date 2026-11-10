import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
  Alert — context the page keeps showing, and the place a failed submit explains
  itself (FB1, FB4). Icon, title, description, optional action.

  The variant sets a `-subtle` surface with its own foreground (C7), and the icon
  is never the only signal: the title says it in words (C11).
*/
const variants = {
  info: { surface: 'bg-info-subtle text-info-subtle-foreground', Icon: Info },
  success: { surface: 'bg-success-subtle text-success-subtle-foreground', Icon: CheckCircle2 },
  warning: { surface: 'bg-warning-subtle text-warning-subtle-foreground', Icon: TriangleAlert },
  error: { surface: 'bg-error-subtle text-error-subtle-foreground', Icon: AlertCircle },
} as const;

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: keyof typeof variants;
  title?: React.ReactNode;
  action?: React.ReactNode;
}

export function Alert({
  variant = 'info',
  title,
  action,
  className,
  children,
  ...props
}: AlertProps) {
  const { surface, Icon } = variants[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-md p-4', surface, className)}
      {...props}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        {title ? <p className="text-base font-semibold text-pretty">{title}</p> : null}
        {children ? <div className="text-sm text-pretty">{children}</div> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  );
}
