/*
  The text input now lives in the design system as `Field`: see
  design/primitives/Field.tsx.

  Re-exported under the shadcn name so `@/components/ui/form` and the checkout
  form keep working. New code should import `Field` from `@/design`.
*/
export { Field as Input } from '@/design/primitives/Field';
