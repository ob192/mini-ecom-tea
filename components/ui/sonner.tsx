'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

/*
  Sonner Toaster, themed with jintea.shop tokens.

  We don't use next-themes here (the app is light-only), so we hard-set
  theme="light" and drive colors from CSS variables via toastOptions.
*/
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'group font-body rounded-lg shadow-sh-2 bg-card text-ink border border-line',
          title: 'font-display font-medium',
          description: 'text-ink-soft',
          actionButton: 'bg-green text-on-green rounded-full',
          cancelButton: 'bg-muted text-ink rounded-full',
          error: 'bg-danger-tint text-danger border-danger/30',
          success: 'bg-green-tint text-green-deep border-green/20',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
