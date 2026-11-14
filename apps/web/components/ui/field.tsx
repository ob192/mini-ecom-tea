'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

/*
  Field — label, control, hint and error as one unit (F2).

  The wrapper owns the wiring: it generates the ids with `useId` and hands the
  control `id`, `aria-describedby` and `aria-invalid`, so no form has to do it
  by hand and no field can be shipped half-wired. It also sets `data-invalid` on
  itself, which is how the label and the hint react to the error state.

  The error carries `role="alert"`, so a message that appears after a failed
  submit is announced where it appears (F5, FB11). The hint stays described even
  while an error is showing — a customer correcting «+380 і 9 цифр» needs the
  format as much as the complaint.
*/
export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Shown after the label for the minority case — see F10. */
  optional?: boolean;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': true | undefined;
  }) => React.ReactNode;
}

export function Field({
  label,
  hint,
  error,
  optional = false,
  className,
  children,
  ...props
}: FieldProps) {
  const base = React.useId();
  const id = `${base}-control`;
  const hintId = `${base}-hint`;
  const errorId = `${base}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div
      className={cn('flex flex-col gap-1.5', className)}
      data-invalid={error ? '' : undefined}
      {...props}
    >
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <span className="ml-1.5 font-normal text-muted-foreground">(необовʼязково)</span>
        ) : null}
      </Label>
      {children({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground text-pretty">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-error-subtle-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** FieldGroup — the fields of a form, spaced wider than the parts of one field (F2). */
export function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-5', className)} {...props} />;
}
