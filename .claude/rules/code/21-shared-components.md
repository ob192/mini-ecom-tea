---
paths:
  - "src/shared/components/ui/**"
---

# Shared UI (`src/shared/components/ui/`)

Примитивы дизайн-системы: кнопки, поля, бейджи, вкладки, диалог, шторка, карусель. Сделаны по образцу shadcn/ui
(CVA), но без Radix: диалог и шторка — на нативном `<dialog>`, вкладки — свой ARIA-паттерн. Живой справочник —
`/playground` в dev; правила и решения — `DESIGN.md`.

Доменные компоненты (entities, features, widgets) — в **`22-components.md`**, не здесь. Их пропсы —
**`27-component-props.md`**: там пропы-режимы запрещены, а `variant` / `size` через CVA у примитивов этого файла
допустимы.

## Файлы

- Путь: **`src/shared/components/ui/{name}.tsx`** — **kebab-case** (`button.tsx`, `radio-group.tsx`).
- Один примитив = один файл; составные части (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) — в том же файле,
  варианты CVA — тоже.
- Props — **в файле компонента**, `{Name}Props` **без префикса `T`** (`ButtonProps`, `InputProps`).

## Анатомия

```tsx
"use client" // если есть state, ref, эффекты или контекст

import type {ComponentProps} from "react"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/shared/utils/common"

export const buttonVariants = cva("базовые классы", {
	variants: {variant: {...}, size: {...}},
	defaultVariants: {variant: "primary", size: "default"},
})

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>

export const Button = ({variant, size, className, ...props}: ButtonProps) => (
	<button
		{...props}
		className={cn(buttonVariants({variant, size}), className)}
	/>
)
```

- `export const` — и для компонентов, и для `*Variants`. React 19: `ref` — обычный проп, `forwardRef` не нужен.
- `cn` — только из `@/shared/utils/common`.
- Иконки — `react-icons/lu`.

## Цвета и тёмный блок

- Только семантические токены (`bg-primary`, `text-muted-foreground`, `border-border`) из `src/app/globals.css`.
- **Без `dark:` префиксов.** Тёмный блок — класс `dark` на элементе: те же токены переключаются сами.

## Доступность

- `disabled:pointer-events-none disabled:opacity-50`
- `focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden`
- Icon-only: обязательный `aria-label`
- Поле внутри `Field` берёт `id`, `aria-describedby`, `aria-invalid` из его контекста (`useFieldControl`)

## Импорт

```ts
import {Button, ButtonLink} from "@/shared/components/ui/button"
import {Field} from "@/shared/components/ui/field"
```

Недостающий примитив добавляется один раз здесь, а не собирается по месту в виджете (дизайн-правило O14).
