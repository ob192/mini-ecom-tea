# RedАвто — сайт автошколы

Сайт лицензированной автошколы RedАвто (Чернигов, филиалы в Прилуках, Ичне, Бахмаче): https://www.redauto-school.net.
Один язык интерфейса — украинский. Деплой — Vercel из `main`.

## Маршруты

| Маршрут          | Что это                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ |
| `/`              | главная: hero, факты, отзывы, цены, инструкторы, автопарк, FAQ, контакты, заявка     |
| `/privacy`       | политика конфиденциальности — её требует Google Ads, потому что форма собирает имя и телефон |
| `/playground`    | дизайн-система (токены, примитивы) — только в dev, в production отдаёт 404           |
| любой другой URL | `app/not-found.tsx`: украинская 404 с шапкой, футером и путём на главную (`noindex` ставит Next) |
| `POST /api/lead` | заявка из формы → чат школы в Telegram                                               |

## Жёсткие ограничения

- **Только App Router** — без Pages Router (`src/pages/`).
- **pnpm** — `pnpm install`, `pnpm <script>`; `node_modules` собраны pnpm.
- **Секреты не в клиенте** — токены и ключи читает только серверный код (`server.ts`, `app/api/**`), никогда `NEXT_PUBLIC_`.
- **Без PII в логах** — имя, телефон, Telegram и комментарий из заявки не попадают в `console.*`.
- **Next.js 16** — не «Next из обучающих данных»: при сомнениях читать `node_modules/next/dist/docs/`.

## Стек

- **Runtime:** Next.js 16 (App Router, React 19), TypeScript
- **UI:** Tailwind CSS v4 (CSS-first, `src/app/globals.css`), примитивы в `src/shared/components/ui/` (CVA)
- **Иконки:** Lucide через `react-icons/lu`
- **Формы:** react-hook-form + zod
- **Карусели:** Embla (`src/shared/components/ui/carousel.tsx`)
- **Аналитика:** GTM `GTM-KW45DWHZ` → GA4; события — `pushAnalyticsEvent` из `@/shared/utils/analytics`
- **Код UI:** модифицированный FSD под `src/` (`app`, `widgets`, `features`, `entities`, `shared`, `providers`)

Алиас импортов: `@/*` → `src/*`.

## Куда смотреть дальше

- **`.claude/rules/code/`** — правила кода по темам; каждое подгружается само для файлов из своих `paths`
- **`.claude/rules/design/`** + **`DESIGN.md`** — дизайн-правила и решения
- **`README.md`** — запуск, env, где что лежит
