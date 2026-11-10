# Константы

Любое фиксированное значение (списки данных, опции, ссылки, числа, строки классов, общие для нескольких
компонентов) — **только** в файле `constants.ts` слайса, **не** в компонентах, хуках или `types.ts`.

## Именование

- Формат: **SCREAMING_SNAKE_CASE**.
- Экспорт: **только** `export const` (не `export default`, не `let`).
- **Префикс слайса** в имени — чтобы при импорте было ясно происхождение:

| Где лежит                         | Префикс            | Примеры                                    |
| --------------------------------- | ------------------ | ------------------------------------------ |
| `entities/review/`                | `REVIEW_`          | `REVIEW_LIST`                              |
| `features/signup/signup-form/`    | `SIGNUP_FORM_`     | `SIGNUP_FORM_CATEGORIES`                   |
| `widgets/home/home-fleet/`        | `HOME_FLEET_`      | `HOME_FLEET_CARS`                          |
| `widgets/layout/layout-footer/`   | `LAYOUT_FOOTER_`   | `LAYOUT_FOOTER_DOCUMENT_LINKS`             |
| `shared/constants/`               | по файлу (`SITE_`, `LAYOUT_`, `NAVIGATION_`) | `SITE_PHONE`, `LAYOUT_CONTAINER` |

## Данные — константы, не JSX

Список, который компонент отображает через `.map` (машины, инструкторы, города, тарифы, вопросы FAQ), —
константа в `constants.ts` слайса, типизированная через `types.ts`. Разметка в компоненте одна, данные — рядом.

Неразрывный пробел в строках данных — `" "` (в JSX — `&nbsp;`), он часть типографики, не опечатка.

## Строки классов

- Класс, нужный **одному** элементу, — прямо в `className`.
- Строка классов, общая для **нескольких** компонентов слайса (контейнер, «пилюля» ссылки), — константа
  `{SLICE}_{ЧТО}_CLASS_NAME` в `constants.ts` со своим комментарием, почему так.
- Контейнер страницы — `LAYOUT_CONTAINER` из `@/shared/constants/layout`.

## Что нельзя

- **Enum в `constants.ts` не кладём** — enum → `types.ts` (`25-types.md`).
- Не дублировать «магические» литералы (телефон, `#signup`, ссылки на соцсети) — они в `shared/constants/`.
- Не называть без префикса: ~~`CARS`~~, ~~`ORDER`~~, ~~`ROW`~~.

```ts
// ✅ widgets/home/home-fleet/constants.ts
export const HOME_FLEET_CARS: THomeFleetCar[] = [...]

// ❌ в компоненте
const CARS = [...]
```

Импорт: `@/widgets/home/home-fleet/constants` — полный путь.
