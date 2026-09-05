/*
  The Button now lives in the design system, where it is drawn: see
  design/primitives/Button.tsx.

  This module stays as the shadcn-conventional import path (`@/components/ui/
  button`) that the checkout, cart and form components were written against,
  and that shadcn's own generated components import. New code should import
  from `@/design` instead.
*/
export { Button, buttonVariants, type ButtonProps } from '@/design/primitives/Button';
