# Типы

Доменные типы и **enum** — в `types.ts` слайса (или `src/types/` для глобальных дополнений). Не в `constants.ts`.

## Именование (в `types.ts`)

- type / interface: префикс **`T`** + слайс + смысл → `T{Slice}{Name}`
- **enum:** без `T`, PascalCase + слайс → `{Slice}{Name}`

| Вид              | Паттерн          | Пример                                    |
| ---------------- | ---------------- | ----------------------------------------- |
| type / interface | `T{Slice}{Name}` | `TReview`, `THomeFleetCar`, `TSignupFormValues` |
| enum             | `{Slice}{Name}`  | `SignupFormCategory`                      |

```ts
// ✅ features/signup/signup-form/types.ts
export enum SignupFormCategory {
	B = "B",
	A = "A",
	Other = "other",
}

export type TSignupFormValues = z.infer<ReturnType<typeof getSignupFormSchema>>
```

## Исключение: Props компонента

**Не в `types.ts`.** В файле компонента: **`{ComponentName}Props`**, **без `T`** (`22-components.md`,
примитивы — `21-shared-components.md`).

## Где что лежит

| Место             | Содержимое                             |
| ----------------- | -------------------------------------- |
| `types.ts` слайса | enum, доменные типы (не Props)         |
| `ui/*.tsx`        | `{ComponentName}Props`                 |
| `src/types/`      | augmentations (`window.dataLayer`)     |

## Запрещено

- enum в `constants.ts`
- доменный type без `T` в `types.ts`: ~~`HomeFleetCar`~~
- Props в `types.ts` или с `T`: ~~`THomeFleetCardProps`~~
- enum с `T`: ~~`TSignupFormCategory`~~

Экспорт: `export type` / `export enum` (named). Импорт — полный путь, без barrel.
