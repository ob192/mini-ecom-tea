# Утилиты

Чистые функции без React и без запросов — в **`utils.ts`** слайса. Файл **всегда `.ts`**, не `.tsx`.

Расположение: `entities/{entity}/utils.ts`, `features/.../utils.ts`, `widgets/.../utils.ts`, `shared/utils/*.ts`.

## Именование

- Экспорт: **`export const`** (стрелочная функция), не `export default`, не `function`.
- Имя — **camelCase** с **префиксом слайса**:

| Слайс                | Примеры                                              |
| -------------------- | ---------------------------------------------------- |
| `review`             | `getReviewAuthorInitials`                            |
| `home-instructors`   | `getHomeInstructorFirstName`, `getHomeInstructorKind` |
| `signup-form`        | `getSignupFormSchema`, `getSignupFormPhoneDigits`    |
| `shared/utils`       | `cn`, `pushAnalyticsEvent`, `getRatingsLabel`        |

## Что класть / не класть

**В utils:** форматирование, нормализация, zod-схемы, сборка списков из констант, сравнение.
**Не в utils:** запросы (`23-api.md`), константы (`24-constants.md`), типы (`25-types.md`), хуки (`hooks/`), UI.

```ts
export const getHomeInstructorFirstName = (name: string): string => name.split(" ")[1] ?? name
```

Импорт: `@/widgets/home/home-instructors/utils` — полный путь.
