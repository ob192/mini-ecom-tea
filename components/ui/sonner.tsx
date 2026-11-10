'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

/*
  Sonner's Toaster. The site is light-only, so the theme is fixed and the
  colours come from the semantic tokens.

  Bottom-centre would collide with the mobile buy bar and the cookie notice, so
  toasts sit at the top (FB5). An error a visitor must act on never lives only
  here — it stays inline or in an `Alert` (FB2).
*/
const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="light"
    position="top-center"
    toastOptions={{
      classNames: {
        toast: 'group rounded-xl bg-popover text-popover-foreground shadow-xl border border-border',
        title: 'font-medium',
        description: 'text-muted-foreground',
        actionButton: 'bg-primary text-primary-foreground rounded-md',
        cancelButton: 'bg-secondary text-secondary-foreground rounded-md',
        error: 'bg-error-subtle text-error-subtle-foreground border-error/20',
        success: 'bg-success-subtle text-success-subtle-foreground border-success/20',
      },
    }}
    {...props}
  />
);

export { Toaster };
