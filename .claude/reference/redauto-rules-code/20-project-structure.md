# Структура `src/` — модифицированный FSD

Весь код сайта — под `src/` (алиас `@/*` → `src/*`).

## Именование файлов и папок

| Что                                                             | Конвенция      | Примеры                                           |
| --------------------------------------------------------------- | -------------- | ------------------------------------------------- |
| Папки (домены, слайсы, сегменты)                                | **kebab-case** | `home-fleet/`, `layout-mobile-menu/`              |
| Файлы вне `ui/`                                                 | **kebab-case** | `use-element-position.ts`, `post-signup-lead.ts`  |
| React-компоненты в `entities/`, `features/`, `widgets/` → `ui/` | **PascalCase** | `HomeFleet.tsx`, `ReviewCard.tsx`                 |
| React-компоненты только в `shared/components/ui/`               | **kebab-case** | `button.tsx`, `radio-group.tsx`                   |

Имя файла компонента = имя named export (`HomeFleetCard.tsx` → `export const HomeFleetCard`).

## Экспорты

Везде под `src/`, кроме `src/app/`, — только **named exports** через `export const` (компоненты, хуки, утилиты, константы, типы).

```tsx
// ✅ вне app/
export const HomeFleetCard = ({car}: HomeFleetCardProps) => { ... }
export const useElementPosition = (target: string) => { ... }

// ✅ только src/app/ (требование Next.js для page/layout)
export default function HomePage() { ... }

// ❌ вне app/
export default function HomeFleetCard() { ... }
export function HomeFleetCard() { ... }
```

**Без `index.ts` barrel** — всегда импорт по полному пути к файлу.

## Префикс компонента = слайс

Имя компонента начинается с имени слайса в PascalCase: всё в `widgets/home/home-fleet/ui/` — `HomeFleet`,
`HomeFleetCard`, `HomeFleetDetails`, `HomeFleetPhoto`. Так по имени сразу видно, откуда компонент, и два `Card`
из разных слайсов не путаются при импорте. То же для констант (`HOME_FLEET_CARS`), типов (`THomeFleetCar`) и
утилит (`getHomeFleetBodyLabel`).

## Карта верхнего уровня

| Путь                         | Назначение                                                          |
| ---------------------------- | ------------------------------------------------------------------- |
| `app/`                       | App Router: маршруты, layout, API — собирают widgets и features     |
| `widgets/{domain}/{slice}/`  | Блоки страниц по домену — см. **Widgets**                           |
| `features/{domain}/{slice}/` | Интерактив по домену (форма заявки, мобильное меню)                 |
| `entities/{entity}/`         | Доменная модель: данные, типы, UI сущности (карточка отзыва)        |
| `shared/`                    | Примитивы UI, константы сайта, утилиты, хуки                        |
| `providers/`                 | React-провайдеры на всё приложение                                  |
| `types/`                     | Глобальные дополнения TS (`window.dataLayer`)                       |

## Импорты между слоями (только вниз)

```
app       → widgets, features, entities, shared, providers
widgets   → widgets, features, entities, shared
features  → entities, shared
entities  → только shared
shared    → только shared
```

Импорт «вверх» запрещён (например, `entities` не импортирует `features` или `widgets`).

## `entities/{entity}/`

Одна папка на доменную сущность, которую показывают **несколько** виджетов (`review`, `school`).

| Элемент        | Назначение                                                |
| -------------- | --------------------------------------------------------- |
| `ui/`          | UI сущности — **PascalCase** `.tsx` (`ReviewCard.tsx`)    |
| `constants.ts` | Данные и константы сущности (`REVIEW_LIST`)               |
| `types.ts`     | Типы и enum сущности (`TReview`)                          |
| `utils.ts`     | Чистые хелперы — **всегда `.ts`**                         |

Данные, которые нужны одному виджету (машины автопарка, инструкторы, вопросы FAQ), живут в `constants.ts`
этого виджета, а не в `entities/`. В `entities/` их переносят, когда их начинает показывать второй слайс.

## `features/{domain}/{slice}/`

Сначала **папка домена**, затем **слайс** на одно действие пользователя.

| Домен    | Слайс                | Что это                                    |
| -------- | -------------------- | ------------------------------------------ |
| `signup` | `signup-form`        | форма заявки: валидация, отправка, сервер  |
| `layout` | `layout-mobile-menu` | мобильное меню шапки                       |

Сегменты слайса: `ui/`, `hooks/`, `api/` (запросы из браузера), `server.ts` (серверная часть: только
`import "server-only"`), `constants.ts`, `types.ts`, `utils.ts`.

## `widgets/{domain}/{slice}/`

Widgets **всегда с доменом на первом уровне** — папка на страницу или область, а не плоский список.

| Домен        | Слайсы                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------- |
| `layout`     | `layout-header`, `layout-footer`, `layout-logo`, `layout-mobile-bar`, `layout-skip-link`    |
| `home`       | `home-hero`, `home-highlights`, `home-reviews`, `home-prices`, `home-instructors`, `home-fleet`, `home-faq`, `home-contacts`, `home-signup` |
| `privacy`    | `privacy-document` (первый экран и текст политики)                                          |
| `not-found`  | `not-found-hero` (экран страницы 404)                                                       |
| `playground` | `playground-reference`                                                                      |

Слайс = один блок страницы. Компонент в `ui/` — **PascalCase**, с префиксом слайса.

```ts
import {LayoutHeader} from "@/widgets/layout/layout-header/ui/LayoutHeader"
import {HomeFleet} from "@/widgets/home/home-fleet/ui/HomeFleet"
```

## `shared/`

| Подпуть              | Содержимое                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| `components/ui/`     | Примитивы дизайн-системы — **kebab-case** (`button.tsx`)                     |
| `components/`        | Общие не-примитивы — **kebab-case** (`json-ld.tsx`)                          |
| `constants/`         | Факты о школе (`site.ts`), SEO (`seo.ts`, `json-ld.ts`), разметка, навигация |
| `types/`             | Общие типы (`seo.ts`, `json-ld.ts`)                                          |
| `hooks/`             | Хуки без домена (`use-element-position.ts`)                                  |
| `utils/`             | `cn` (`common.ts`), аналитика, Telegram, SEO и JSON-LD (`seo.ts`, `json-ld.ts`) |

## `app/`

- Маршруты, `layout.tsx`, `route.ts` — тонкие: собирают widgets и features (`30-app-router.md`).
- Бизнес-логику и вёрстку сюда не класть.
