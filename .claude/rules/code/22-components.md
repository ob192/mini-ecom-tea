---
paths:
  - "src/**/*.tsx"
---

# Компоненты (entities / features / widgets)

UI в папке **`ui/`** слайса. Файл **PascalCase**. Примитивы — только **`21-shared-components.md`**.

| Слой    | Путь                                                    | Пример           |
| ------- | ------------------------------------------------------- | ---------------- |
| entity  | `entities/{entity}/ui/ReviewCard.tsx`                   | карточка отзыва  |
| feature | `features/{domain}/{slice}/ui/SignupForm.tsx`           | форма заявки     |
| widget  | `widgets/{domain}/{slice}/ui/HomeFleet.tsx`             | секция автопарка |

## Экспорт

- **`export const ComponentName = (...) => ...`**
- **`export default`** — только `src/app/`
- Имя файла = имя компонента, с префиксом слайса (`20-project-structure.md`)

## 1 файл = 1 компонент

Каждый файл содержит **ровно один** компонент. Вспомогательные части выносятся в отдельные файлы в той же
папке `ui/`: `HomeFleet.tsx` (секция), `HomeFleetCard.tsx`, `HomeFleetDetails.tsx`, `HomeFleetPhoto.tsx`,
`HomeFleetSpec.tsx`. Никаких `function Card()` рядом с экспортом.

## Props — в файле компонента, без `T`

Не в `types.ts` (исключение из **`25-types.md`**).

| Правило     | Значение                       |
| ----------- | ------------------------------ |
| Имя         | `{ComponentName}Props`         |
| Префикс `T` | **нет**                        |
| Экспорт     | `export type`                  |

```tsx
export type HomeFleetCardProps = {
	car: THomeFleetCar
}

export const HomeFleetCard = ({car}: HomeFleetCardProps) => { ... }
```

Часто: `className?: string` + `cn()`. Пропсы деструктурируются в сигнатуре.

## Что принимают пропсы — **`27-component-props.md`**

- **Без пропов-режимов и пропов под одного вызывающего.** Разная вёрстка — разные компоненты, выбор в месте вызова.
- **Внутренние части** настраиваются через `className`, `children`, слот-пропы с `ReactNode`, а не через флаги.

## Client / Server

- **`"use client"`** — хуки, события, контекст, browser API — и **любые иконки `react-icons`**: их доступные
  умолчания (`aria-hidden`) приходят из `IconContext` в `providers/app-provider.tsx`, а контекст доходит только до
  клиентских компонентов. Секция с иконками — клиентская.
- Server — без директивы: компонент без хуков и без иконок (`HomeHighlights` без стрелки был бы таким).
- Достаточно директивы у корня клиентского дерева, но файл, который сам вызывает хук, ставит её и у себя.

## Порядок в файле

1. `"use client"` (если нужен)
2. imports (`22-components` → группы из `100-code-formatting.md`)
3. `export type …Props`
4. `export const Component = …`

## Сборка UI

- Примитивы — из `@/shared/components/ui/` (**`21-shared-components.md`**).
- Факты о школе (телефон, почта, ссылки, рейтинг) — из `@/shared/constants/site`, не литералом в JSX.
- Якоря секций — `NAVIGATION_SECTION_ID` из `@/shared/constants/navigation`.
- Текстовая ссылка на другую страницу — `next/link`; ссылка-кнопка — `ButtonLink` (обычный `<a>`). Ссылка на секцию
  главной — `useNavigationSectionHref` (на главной `#id`, на `/privacy` — `/#id`).

## Что не в компоненте

- Константы, списки данных, общие строки классов → `24-constants.md`
- Enum / доменные типы → `25-types.md`
- Запросы и сервер → `23-api.md`
- Утилиты → `26-utils.md`
- Пропы-режимы → композиция (`27-component-props.md`)

Импорт: `@/widgets/home/home-fleet/ui/HomeFleet` — полный путь.
